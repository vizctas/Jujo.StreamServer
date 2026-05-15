/**
 * @file src/platform/linux/virtual_mic.cpp
 * @brief Linux virtual microphone using PulseAudio null-sink + pa_simple playback.
 *
 * Audio pushed via push() is written to a dedicated PulseAudio null-sink.
 * The null-sink's monitor source appears as a recording device to every
 * application on the host (e.g. Discord, OBS, Audacity).
 *
 * Lifecycle:
 *   - On init()  : load module-null-sink with the requested name.
 *   - On push()  : pa_simple_write() to that sink.
 *   - On ~dtor() : pa_simple_free() + unload the module.
 */

// standard includes
#include <atomic>
#include <cstring>
#include <mutex>
#include <thread>

// lib includes
#include <pulse/error.h>
#include <pulse/pulseaudio.h>
#include <pulse/simple.h>

// local includes
#include "src/logging.h"
#include "src/platform/common.h"
#include "virtual_mic.h"

using namespace std::literals;

namespace platf {
  namespace {

    // Default null-sink name when none is provided by the caller
    constexpr auto kDefaultSinkName = "source-jujo-mic";

    // -------------------------------------------------------------------------
    // PulseAudio mainloop helpers (subset needed to load/unload a module)
    // -------------------------------------------------------------------------
    template<class T>
    void pa_free_generic(T *p) { pa_xfree(p); }

    using loop_t = util::safe_ptr<pa_mainloop, pa_mainloop_free>;
    using ctx_t  = util::safe_ptr<pa_context, pa_context_unref>;
    using op_t   = util::safe_ptr<pa_operation, pa_operation_unref>;

    // Blocking helper: runs the PA mainloop until the alarm fires
    struct alarm_t {
      bool fired    = false;
      int  value    = 0;
    };

    // Index callback (used for pa_context_load_module)
    void cb_index(pa_context * /*ctx*/, uint32_t idx, void *userdata) {
      auto *a  = static_cast<alarm_t *>(userdata);
      a->value = static_cast<int>(idx);
      a->fired = true;
      // Signal by writing a byte – handled by the waiting thread via pa_mainloop_iterate
    }

    // Success callback (used for pa_context_unload_module)
    void cb_success(pa_context * /*ctx*/, int ok, void *userdata) {
      auto *a  = static_cast<alarm_t *>(userdata);
      a->value = ok;
      a->fired = true;
    }

    // Run the mainloop until alarm.fired == true
    void wait_loop(pa_mainloop *loop, alarm_t &alarm) {
      while (!alarm.fired) {
        int retval = 0;
        pa_mainloop_iterate(loop, 1 /*block*/, &retval);
      }
    }

    // -------------------------------------------------------------------------
    // Linux virtual microphone
    // -------------------------------------------------------------------------
    class linux_virtual_mic_t: public virtual_mic_t {
    public:
      linux_virtual_mic_t() = default;

      ~linux_virtual_mic_t() override {
        // Stop writer first
        if (pa_) {
          pa_simple_free(pa_);
          pa_ = nullptr;
        }

        // Unload the null-sink module we created
        if (module_idx_ != PA_INVALID_INDEX) {
          unload_sink();
        }
      }

      bool init(const std::string &sink_name_in, int channels, uint32_t sample_rate, uint32_t frame_size) {
        sink_name_  = sink_name_in.empty() ? kDefaultSinkName : sink_name_in;
        channels_   = channels;
        sample_rate_ = sample_rate;

        // --- Step 1: load module-null-sink via pa_context ----------------------
        module_idx_ = load_sink(channels, sample_rate);
        if (module_idx_ == PA_INVALID_INDEX) {
          BOOST_LOG(error) << "virtual_mic: failed to load PulseAudio null-sink ["sv << sink_name_ << ']';
          return false;
        }

        // --- Step 2: open pa_simple playback to the new sink ------------------
        pa_sample_spec ss {
          .format   = PA_SAMPLE_FLOAT32LE,
          .rate     = sample_rate,
          .channels = static_cast<uint8_t>(channels),
        };

        pa_buffer_attr attr {
          .maxlength = static_cast<uint32_t>(-1),
          .tlength   = static_cast<uint32_t>(frame_size * channels * sizeof(float) * 4),
          .prebuf    = static_cast<uint32_t>(-1),
          .minreq    = static_cast<uint32_t>(-1),
          .fragsize  = static_cast<uint32_t>(-1),
        };

        int err = 0;
        pa_ = pa_simple_new(
          nullptr,                 // default server
          "jujo-stream",           // application name
          PA_STREAM_PLAYBACK,
          sink_name_.c_str(),      // target sink
          "jujo-mic-playback",     // stream description
          &ss,
          nullptr,                 // default channel map
          &attr,
          &err);

        if (!pa_) {
          BOOST_LOG(error) << "virtual_mic: pa_simple_new() failed: "sv << pa_strerror(err);
          return false;
        }

        BOOST_LOG(info) << "virtual_mic: PulseAudio null-sink ["sv << sink_name_
                        << "] ready, "sv << channels << "ch @ " << sample_rate << " Hz"sv;
        BOOST_LOG(info) << "virtual_mic: monitor source = "sv << sink_name_ << ".monitor"sv;
        return true;
      }

      capture_e push(
        const std::vector<float> &samples,
        int /*sample_rate*/,
        int /*channels*/,
        int /*frames*/) override {
        if (!pa_) {
          return capture_e::error;
        }

        int err = 0;
        if (pa_simple_write(pa_,
              samples.data(),
              samples.size() * sizeof(float),
              &err) < 0) {
          BOOST_LOG(error) << "virtual_mic: pa_simple_write() failed: "sv << pa_strerror(err);
          return capture_e::error;
        }
        return capture_e::ok;
      }

    private:
      // Build the null-sink argument string
      std::string null_sink_args(int channels, uint32_t sample_rate) const {
        // Supported channel positions for up to 2 channels
        constexpr const char *map1 = "mono";
        constexpr const char *map2 = "front-left,front-right";

        std::string args;
        args += "rate=" + std::to_string(sample_rate);
        args += " sink_name=" + sink_name_;
        args += " format=float32le";
        args += " channels=" + std::to_string(channels);
        args += " channel_map=" + std::string(channels == 1 ? map1 : map2);
        args += " sink_properties=device.description=" + sink_name_;
        return args;
      }

      // Load module-null-sink; returns module index or PA_INVALID_INDEX on failure
      uint32_t load_sink(int channels, uint32_t sample_rate) {
        loop_t loop;
        ctx_t  ctx;
        loop.reset(pa_mainloop_new());
        ctx.reset(pa_context_new(pa_mainloop_get_api(loop.get()), "jujo-stream-mic-ctl"));

        if (pa_context_connect(ctx.get(), nullptr, PA_CONTEXT_NOFLAGS, nullptr) < 0) {
          BOOST_LOG(error) << "virtual_mic: pa_context_connect failed: "sv
                           << pa_strerror(pa_context_errno(ctx.get()));
          return PA_INVALID_INDEX;
        }

        // Wait for context to become ready
        while (true) {
          int retval = 0;
          pa_mainloop_iterate(loop.get(), 1, &retval);
          auto state = pa_context_get_state(ctx.get());
          if (state == PA_CONTEXT_READY) break;
          if (state == PA_CONTEXT_FAILED || state == PA_CONTEXT_TERMINATED) {
            BOOST_LOG(error) << "virtual_mic: PA context failed/terminated during init"sv;
            return PA_INVALID_INDEX;
          }
        }

        alarm_t alarm;
        op_t op {
          pa_context_load_module(
            ctx.get(),
            "module-null-sink",
            null_sink_args(channels, sample_rate).c_str(),
            cb_index,
            &alarm)
        };
        if (!op) {
          BOOST_LOG(error) << "virtual_mic: pa_context_load_module failed"sv;
          return PA_INVALID_INDEX;
        }

        wait_loop(loop.get(), alarm);

        pa_context_disconnect(ctx.get());

        if (static_cast<uint32_t>(alarm.value) == PA_INVALID_INDEX) {
          BOOST_LOG(error) << "virtual_mic: module-null-sink load returned invalid index"sv;
          return PA_INVALID_INDEX;
        }

        return static_cast<uint32_t>(alarm.value);
      }

      void unload_sink() {
        loop_t loop;
        ctx_t  ctx;
        loop.reset(pa_mainloop_new());
        ctx.reset(pa_context_new(pa_mainloop_get_api(loop.get()), "jujo-stream-mic-ctl"));

        if (pa_context_connect(ctx.get(), nullptr, PA_CONTEXT_NOFLAGS, nullptr) < 0) {
          return;
        }

        while (true) {
          int retval = 0;
          pa_mainloop_iterate(loop.get(), 1, &retval);
          auto state = pa_context_get_state(ctx.get());
          if (state == PA_CONTEXT_READY) break;
          if (state == PA_CONTEXT_FAILED || state == PA_CONTEXT_TERMINATED) return;
        }

        alarm_t alarm;
        op_t op {
          pa_context_unload_module(ctx.get(), module_idx_, cb_success, &alarm)
        };
        if (op) {
          wait_loop(loop.get(), alarm);
        }

        pa_context_disconnect(ctx.get());
        module_idx_ = PA_INVALID_INDEX;
      }

      std::string  sink_name_;
      int          channels_    = 2;
      uint32_t     sample_rate_ = 48000;
      uint32_t     module_idx_  = PA_INVALID_INDEX;
      pa_simple   *pa_          = nullptr;
    };

  }  // anonymous namespace

  std::unique_ptr<virtual_mic_t> make_virtual_microphone(
    const std::string &sink_name,
    int channels,
    uint32_t sample_rate,
    uint32_t frame_size) {
    auto mic = std::make_unique<linux_virtual_mic_t>();
    if (!mic->init(sink_name, channels, sample_rate, frame_size)) {
      return nullptr;
    }
    return mic;
  }

}  // namespace platf
