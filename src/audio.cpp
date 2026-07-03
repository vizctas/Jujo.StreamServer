/**
 * @file src/audio.cpp
 * @brief Definitions for audio capture and encoding.
 */
// standard includes
#include <array>
#include <thread>
#include <vector>

// lib includes
#include <opus/opus_multistream.h>

// local includes
#include "audio.h"
#include "config.h"
#include "globals.h"
#include "logging.h"
#include "platform/common.h"
#include "thread_safe.h"
#include "utility.h"
#include "webrtc_stream.h"

namespace audio {
  using namespace std::literals;
  using opus_t = util::safe_ptr<OpusMSEncoder, opus_multistream_encoder_destroy>;
  using sample_queue_t = std::shared_ptr<safe::queue_t<std::vector<float>>>;

  static int start_audio_control(audio_ctx_t &ctx);
  static void stop_audio_control(audio_ctx_t &);
  static void apply_surround_params(opus_stream_config_t &stream, const stream_params_t &params);

  int map_stream(int channels, bool quality);

  constexpr auto SAMPLE_RATE = 48000;

  // NOTE: If you adjust the bitrates listed here, make sure to update the
  // corresponding bitrate adjustment logic in rtsp_stream::cmd_announce()
  opus_stream_config_t stream_configs[MAX_STREAM_CONFIG] {
    {
      SAMPLE_RATE,
      2,
      1,
      1,
      platf::speaker::map_stereo,
      96000,
    },
    {
      SAMPLE_RATE,
      2,
      1,
      1,
      platf::speaker::map_stereo,
      512000,
    },
    {
      SAMPLE_RATE,
      6,
      4,
      2,
      platf::speaker::map_surround51,
      256000,
    },
    {
      SAMPLE_RATE,
      6,
      6,
      0,
      platf::speaker::map_surround51,
      1536000,
    },
    {
      SAMPLE_RATE,
      8,
      5,
      3,
      platf::speaker::map_surround71,
      450000,
    },
    {
      SAMPLE_RATE,
      8,
      8,
      0,
      platf::speaker::map_surround71,
      2048000,
    },
  };

  void encodeThread(sample_queue_t samples, config_t config, void *channel_data) {
    auto packets = mail::man->queue<packet_t>(mail::audio_packets);
    auto stream = stream_configs[map_stream(config.channels, config.flags[config_t::HIGH_QUALITY])];
    if (config.flags[config_t::CUSTOM_SURROUND_PARAMS]) {
      apply_surround_params(stream, config.customStreamParams);
    }

    // Encoding takes place on this thread
    platf::adjust_thread_priority(platf::thread_priority_e::high);

    opus_t opus {opus_multistream_encoder_create(
      stream.sampleRate,
      stream.channelCount,
      stream.streams,
      stream.coupledStreams,
      stream.mapping,
      OPUS_APPLICATION_RESTRICTED_LOWDELAY,
      nullptr
    )};

    opus_multistream_encoder_ctl(opus.get(), OPUS_SET_BITRATE(stream.bitrate));
    opus_multistream_encoder_ctl(opus.get(), OPUS_SET_VBR(0));

    BOOST_LOG(info) << "Opus initialized: "sv << stream.sampleRate / 1000 << " kHz, "sv
                    << stream.channelCount << " channels, "sv
                    << stream.bitrate / 1000 << " kbps (total), LOWDELAY"sv;

    auto frame_size = config.packetDuration * stream.sampleRate / 1000;
    while (auto sample = samples->pop()) {
      buffer_t packet {1400};

      if (webrtc_stream::has_active_sessions() && channel_data == nullptr) {
        webrtc_stream::submit_audio_frame(*sample, stream.sampleRate, stream.channelCount, frame_size);
      }

      int bytes = opus_multistream_encode_float(opus.get(), sample->data(), frame_size, std::begin(packet), packet.size());
      if (bytes < 0) {
        BOOST_LOG(error) << "Couldn't encode audio: "sv << opus_strerror(bytes);
        packets->stop();

        return;
      }

      packet.fake_resize(bytes);
      packets->raise(channel_data, std::move(packet));
    }
  }

  void capture(safe::mail_t mail, config_t config, void *channel_data) {
    auto shutdown_event = mail->event<bool>(mail::shutdown);
    if (!config::audio.stream || config.input_only) {
      shutdown_event->view();
      return;
    }
    auto stream = stream_configs[map_stream(config.channels, config.flags[config_t::HIGH_QUALITY])];
    if (config.flags[config_t::CUSTOM_SURROUND_PARAMS]) {
      apply_surround_params(stream, config.customStreamParams);
    }

    auto ref = get_audio_ctx_ref();
    if (!ref) {
      return;
    }

    auto init_failure_fg = util::fail_guard([&shutdown_event]() {
      BOOST_LOG(error) << "Unable to initialize audio capture. The stream will not have audio."sv;

      // Wait for shutdown to be signalled if we fail init.
      // This allows streaming to continue without audio.
      shutdown_event->view();
      return;
    });

    auto &control = ref->control;
    if (!control) {
      return;
    }

    // Order of priority:
    // 1. Virtual sink
    // 2. Audio sink
    // 3. Host
    std::string *sink = &ref->sink.host;
    if (!config::audio.sink.empty()) {
      sink = &config::audio.sink;
    }

    // Prefer the virtual sink if host playback is disabled or there's no other sink
    if (ref->sink.null && (!config.flags[config_t::HOST_AUDIO] || sink->empty())) {
      auto &null = *ref->sink.null;
      switch (stream.channelCount) {
        case 2:
          sink = &null.stereo;
          break;
        case 6:
          sink = &null.surround51;
          break;
        case 8:
          sink = &null.surround71;
          break;
      }
    }

    BOOST_LOG(info) << "Selected audio sink: "sv << *sink;

    // Only the first to start a session may change the default sink
    if (!ref->sink_flag->exchange(true, std::memory_order_acquire)) {
      // If the selected sink is different than the current one, change sinks.
      ref->restore_sink = ref->sink.host != *sink;
      if (ref->restore_sink) {
        if (control->set_sink(*sink)) {
          return;
        }
      }
    }

    auto frame_size = config.packetDuration * stream.sampleRate / 1000;
    auto mic = control->microphone(stream.mapping, stream.channelCount, stream.sampleRate, frame_size);
    if (!mic) {
      return;
    }

    // Audio is initialized, so we don't want to print the failure message
    init_failure_fg.disable();

    // Capture takes place on this thread
    platf::adjust_thread_priority(platf::thread_priority_e::critical);

    std::shared_ptr<sample_queue_t::element_type> samples;
    std::thread thread;
    if (!config.bypass_opus) {
      samples = std::make_shared<sample_queue_t::element_type>(30);
      thread = std::thread {encodeThread, samples, config, channel_data};
    }

    auto fg = util::fail_guard([&]() {
      if (samples) {
        samples->stop();
        if (thread.joinable()) {
          thread.join();
        }
      }

      shutdown_event->view();
    });

    int samples_per_frame = frame_size * stream.channelCount;

    while (!shutdown_event->peek()) {
      std::vector<float> sample_buffer;
      sample_buffer.resize(samples_per_frame);

      auto status = mic->sample(sample_buffer);
      switch (status) {
        case platf::capture_e::ok:
          break;
        case platf::capture_e::timeout:
          continue;
        case platf::capture_e::reinit:
          if (config::audio.auto_capture) {
            BOOST_LOG(info) << "Reinitializing audio capture"sv;
            mic.reset();
            do {
              mic = control->microphone(stream.mapping, stream.channelCount, stream.sampleRate, frame_size);
              if (!mic) {
                BOOST_LOG(warning) << "Couldn't re-initialize audio input"sv;
              }
            } while (!mic && !shutdown_event->view(5s));
          }

          continue;
        default:
          return;
      }

      if (config.bypass_opus) {
        if (channel_data == nullptr) {
          webrtc_stream::submit_audio_frame(sample_buffer, stream.sampleRate, stream.channelCount, frame_size);
        }
      } else {
        samples->raise(std::move(sample_buffer));
      }
    }
  }

  audio_ctx_ref_t get_audio_ctx_ref() {
    static auto control_shared {safe::make_shared<audio_ctx_t>(start_audio_control, stop_audio_control)};
    return control_shared.ref();
  }

  bool is_audio_ctx_sink_available(const audio_ctx_t &ctx) {
    if (!ctx.control) {
      return false;
    }

    const std::string &sink = ctx.sink.host.empty() ? config::audio.sink : ctx.sink.host;
    if (sink.empty()) {
      return false;
    }

    return ctx.control->is_sink_available(sink);
  }

  int map_stream(int channels, bool quality) {
    int shift = quality ? 1 : 0;
    switch (channels) {
      case 2:
        return STEREO + shift;
      case 6:
        return SURROUND51 + shift;
      case 8:
        return SURROUND71 + shift;
    }
    return STEREO;
  }

  int start_audio_control(audio_ctx_t &ctx) {
    auto fg = util::fail_guard([]() {
      BOOST_LOG(warning) << "There will be no audio"sv;
    });

    ctx.sink_flag = std::make_unique<std::atomic_bool>(false);

    // The default sink has not been replaced yet.
    ctx.restore_sink = false;

    if (!(ctx.control = platf::audio_control())) {
      return 0;
    }

    auto sink = ctx.control->sink_info();
    if (!sink) {
      // Let the calling code know it failed
      ctx.control.reset();
      return 0;
    }

    ctx.sink = std::move(*sink);

    fg.disable();
    return 0;
  }

  void stop_audio_control(audio_ctx_t &ctx) {
    // restore audio-sink if applicable
    if (!ctx.restore_sink) {
      return;
    }

    // Change back to the host sink, unless there was none
    const std::string &sink = ctx.sink.host.empty() ? config::audio.sink : ctx.sink.host;
    if (!sink.empty()) {
      // Best effort, it's allowed to fail
      ctx.control->set_sink(sink);
    }

    // Ensure Steam Streaming Speakers aren't left as the default device.
    // If the original device is temporarily unavailable (e.g., DisplayPort audio
    // reconnecting after virtual display teardown), the platform layer can keep
    // retrying that exact device in the background after moving away from Steam.
    ctx.control->reset_default_device(sink);
  }

  void apply_surround_params(opus_stream_config_t &stream, const stream_params_t &params) {
    stream.channelCount = params.channelCount;
    stream.streams = params.streams;
    stream.coupledStreams = params.coupledStreams;
    stream.mapping = params.mapping;
  }

  // Client microphone passthrough (classic protocol). Fixed negotiated format:
  // mono, 48 kHz, 20 ms frames. Kept in sync with the client encoder.
  namespace {
    constexpr int kMicSampleRate = 48000;
    constexpr int kMicChannels = 1;
    constexpr int kMicFrameSize = 960;  // 20 ms @ 48 kHz
    // Opus can emit up to 120 ms per packet; size the decode scratch for that.
    constexpr int kMicMaxFrames = kMicSampleRate / 1000 * 120;

    struct mic_receiver_impl: mic_receiver_t {
      // The virtual mic device is self-contained once created (an independent OS
      // capture endpoint), so we don't retain the audio_ctx ref — same as the
      // WebRTC path, which uses a local ctx ref only to build the device.
      std::unique_ptr<platf::virtual_mic_t> device;
      OpusDecoder *decoder = nullptr;
      std::array<float, kMicMaxFrames * kMicChannels> scratch {};

      ~mic_receiver_impl() override {
        if (decoder) {
          opus_decoder_destroy(decoder);
        }
      }

      void on_opus_frame(const std::uint8_t *data, std::size_t len) override {
        if (!device || !decoder || !data || len == 0) {
          return;
        }
        int frames = opus_decode_float(decoder, data, (opus_int32) len, scratch.data(), kMicMaxFrames, 0);
        if (frames < 0) {
          BOOST_LOG(warning) << "client mic: opus decode failed: "sv << opus_strerror(frames);
          return;
        }
        std::vector<float> samples(scratch.begin(), scratch.begin() + frames * kMicChannels);
        device->push(samples, kMicSampleRate, kMicChannels, frames);
      }
    };
  }  // namespace

  std::unique_ptr<mic_receiver_t> make_mic_receiver() {
    if (!config::audio.enable_client_mic) {
      return nullptr;
    }
    auto ref = get_audio_ctx_ref();
    if (!ref || !ref->control) {
      BOOST_LOG(warning) << "client mic: no audio control available; mic disabled for session"sv;
      return nullptr;
    }

    auto impl = std::make_unique<mic_receiver_impl>();
    impl->device = ref->control->virtual_microphone(
      config::audio.client_mic_device_name, kMicChannels, kMicSampleRate, kMicFrameSize);
    if (!impl->device) {
      BOOST_LOG(warning) << "client mic: failed to create virtual microphone; mic disabled for session"sv;
      return nullptr;
    }

    int err = 0;
    impl->decoder = opus_decoder_create(kMicSampleRate, kMicChannels, &err);
    if (err != OPUS_OK || !impl->decoder) {
      BOOST_LOG(warning) << "client mic: opus_decoder_create failed: "sv << opus_strerror(err);
      return nullptr;
    }

    BOOST_LOG(info) << "client mic: receiver ready ("sv << config::audio.client_mic_device_name << ")"sv;
    return impl;
  }
}  // namespace audio
