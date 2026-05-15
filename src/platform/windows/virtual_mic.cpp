/**
 * @file src/platform/windows/virtual_mic.cpp
 * @brief Windows virtual microphone using WASAPI render.
 *
 * Audio pushed via push() is written to a WASAPI shared-mode render endpoint
 * (default render device or a user-configured virtual audio device).
 * Other applications capture it via WASAPI loopback on the same endpoint.
 */
#define INITGUID

// standard includes
#include <atomic>
#include <chrono>
#include <deque>
#include <mutex>
#include <thread>

// platform includes
#include <winsock2.h>
#include <Audioclient.h>
#include <combaseapi.h>
#include <mmdeviceapi.h>

// local includes
#include "src/logging.h"
#include "src/utility.h"
#include "src/platform/common.h"
#include "virtual_mic.h"

using namespace std::literals;

namespace {
  // COM Release / CoTaskMemFree helpers (local to this TU)
  template<class T>
  void Release(T *p) { p->Release(); }

  template<class T>
  void co_task_free(T *p) { CoTaskMemFree((LPVOID) p); }

  using device_enum_t  = util::safe_ptr<IMMDeviceEnumerator, Release<IMMDeviceEnumerator>>;
  using device_t       = util::safe_ptr<IMMDevice, Release<IMMDevice>>;
  using audio_client_t = util::safe_ptr<IAudioClient, Release<IAudioClient>>;
  using audio_render_t = util::safe_ptr<IAudioRenderClient, Release<IAudioRenderClient>>;
  using wave_format_t  = util::safe_ptr<WAVEFORMATEX, co_task_free<WAVEFORMATEX>>;

  // UTF-8 → wide string
  std::wstring from_utf8(const std::string &s) {
    if (s.empty()) return {};
    int wlen = MultiByteToWideChar(CP_UTF8, 0, s.data(), (int) s.size(), nullptr, 0);
    std::wstring ws(wlen, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, s.data(), (int) s.size(), ws.data(), wlen);
    return ws;
  }

  /**
   * @brief WASAPI render-based virtual microphone.
   *
   * Audio pushed via push() is enqueued in a thread-safe ring buffer.
   * A background pump thread periodically drains the buffer into the
   * WASAPI render client, making it available for loopback capture.
   */
  class win_virtual_mic_t: public platf::virtual_mic_t {
  public:
    win_virtual_mic_t() = default;

    ~win_virtual_mic_t() override {
      running_.store(false, std::memory_order_release);
      if (pump_thread_.joinable()) {
        pump_thread_.join();
      }
      if (audio_client_) {
        audio_client_->Stop();
      }
      CoUninitialize();
    }

    bool init(const std::string &device_name, int channels, uint32_t sample_rate) {
      CoInitializeEx(nullptr, COINIT_MULTITHREADED | COINIT_SPEED_OVER_MEMORY);
      channels_    = channels;
      sample_rate_ = sample_rate;

      // Create device enumerator
      device_enum_t device_enum;
      auto hr = CoCreateInstance(
        CLSID_MMDeviceEnumerator, nullptr, CLSCTX_ALL,
        IID_IMMDeviceEnumerator, (void **) &device_enum);
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: CoCreateInstance(MMDeviceEnumerator) failed [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      // Get the render endpoint
      device_t device;
      if (!device_name.empty()) {
        hr = device_enum->GetDevice(from_utf8(device_name).c_str(), &device);
        if (FAILED(hr)) {
          BOOST_LOG(warning) << "virtual_mic: Device [" << device_name << "] not found, falling back to default"sv;
          hr = device_enum->GetDefaultAudioEndpoint(eRender, eConsole, &device);
        }
      } else {
        hr = device_enum->GetDefaultAudioEndpoint(eRender, eConsole, &device);
      }

      if (FAILED(hr) || !device) {
        BOOST_LOG(error) << "virtual_mic: Couldn't get render endpoint [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      // Activate audio client
      hr = device->Activate(IID_IAudioClient, CLSCTX_ALL, nullptr, (void **) &audio_client_);
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: Couldn't activate IAudioClient [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      // Build float32 wave format for the requested channel count + sample rate.
      // AUTOCONVERTPCM lets Windows resample/convert if the device uses a different format.
      WAVEFORMATEXTENSIBLE wfx   = {};
      wfx.Format.wFormatTag      = WAVE_FORMAT_EXTENSIBLE;
      wfx.Format.nChannels       = (WORD) channels;
      wfx.Format.nSamplesPerSec  = sample_rate;
      wfx.Format.wBitsPerSample  = 32;
      wfx.Format.nBlockAlign     = wfx.Format.nChannels * wfx.Format.wBitsPerSample / 8;
      wfx.Format.nAvgBytesPerSec = wfx.Format.nSamplesPerSec * wfx.Format.nBlockAlign;
      wfx.Format.cbSize          = sizeof(WAVEFORMATEXTENSIBLE) - sizeof(WAVEFORMATEX);
      wfx.Samples.wValidBitsPerSample = 32;
      wfx.SubFormat                   = KSDATAFORMAT_SUBTYPE_IEEE_FLOAT;
      wfx.dwChannelMask               = (channels == 1)
                                          ? SPEAKER_FRONT_CENTER
                                          : (SPEAKER_FRONT_LEFT | SPEAKER_FRONT_RIGHT);

      // 100 ms shared-mode render buffer; AUTOCONVERTPCM handles device format differences
      hr = audio_client_->Initialize(
        AUDCLNT_SHAREMODE_SHARED,
        AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM | AUDCLNT_STREAMFLAGS_SRC_DEFAULT_QUALITY,
        100 * 10000LL,  // 100 ms in 100-nanosecond units
        0,
        (LPWAVEFORMATEX) &wfx,
        nullptr);
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: IAudioClient::Initialize failed [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      // Obtain render client service
      hr = audio_client_->GetService(IID_IAudioRenderClient, (void **) &render_client_);
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: Couldn't get IAudioRenderClient [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      hr = audio_client_->GetBufferSize(&buffer_size_);
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: Couldn't get buffer size [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      // Pre-fill with silence so the render session starts cleanly
      {
        BYTE *buf = nullptr;
        render_client_->GetBuffer(buffer_size_, &buf);
        render_client_->ReleaseBuffer(buffer_size_, AUDCLNT_BUFFERFLAGS_SILENT);
      }

      hr = audio_client_->Start();
      if (FAILED(hr)) {
        BOOST_LOG(error) << "virtual_mic: IAudioClient::Start failed [0x"sv
                         << util::hex(hr).to_string_view() << ']';
        return false;
      }

      BOOST_LOG(info) << "virtual_mic: WASAPI render endpoint ready, "sv
                      << channels << "ch @ " << sample_rate << " Hz"sv;

      running_.store(true, std::memory_order_release);
      pump_thread_ = std::thread([this] { pump_loop(); });
      return true;
    }

    platf::capture_e push(
      const std::vector<float> &samples,
      int /*sample_rate*/,
      int /*channels*/,
      int /*frames*/) override {
      if (!running_.load(std::memory_order_acquire)) {
        return platf::capture_e::error;
      }

      std::lock_guard<std::mutex> lock(mtx_);
      sample_queue_.insert(sample_queue_.end(), samples.begin(), samples.end());

      // Cap queue at ~2 seconds to prevent unbounded growth if pump falls behind
      constexpr size_t kMaxSamples = 48000 * 2 * 8;  // 2s at 48 kHz, 8 channels
      while (sample_queue_.size() > kMaxSamples) {
        sample_queue_.pop_front();
      }
      return platf::capture_e::ok;
    }

  private:
    void pump_loop() {
      CoInitializeEx(nullptr, COINIT_MULTITHREADED | COINIT_SPEED_OVER_MEMORY);

      while (running_.load(std::memory_order_acquire)) {
        UINT32 padding = 0;
        if (FAILED(audio_client_->GetCurrentPadding(&padding))) {
          std::this_thread::sleep_for(std::chrono::milliseconds(10));
          continue;
        }

        const UINT32 avail = buffer_size_ - padding;
        if (avail > 0) {
          BYTE  *buf   = nullptr;
          DWORD  flags = 0;
          if (FAILED(render_client_->GetBuffer(avail, &buf))) {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            continue;
          }

          {
            std::lock_guard<std::mutex> lock(mtx_);
            const size_t needed = static_cast<size_t>(avail) * channels_;
            if (sample_queue_.size() < needed) {
              // Underrun: output silence and let the queue fill up
              flags = AUDCLNT_BUFFERFLAGS_SILENT;
            } else {
              auto *f = reinterpret_cast<float *>(buf);
              for (size_t i = 0; i < needed; ++i) {
                f[i] = sample_queue_.front();
                sample_queue_.pop_front();
              }
            }
          }

          render_client_->ReleaseBuffer(avail, flags);
        }

        // Poll every ~5 ms (well below the 100 ms render buffer)
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
      }

      CoUninitialize();
    }

    audio_client_t      audio_client_;
    audio_render_t      render_client_;
    UINT32              buffer_size_ = 0;
    int                 channels_    = 2;
    uint32_t            sample_rate_ = 48000;
    std::atomic<bool>   running_     {false};
    std::thread         pump_thread_;
    std::mutex          mtx_;
    std::deque<float>   sample_queue_;
  };

}  // anonymous namespace

namespace platf::audio {
  std::unique_ptr<platf::virtual_mic_t> make_virtual_microphone(
    const std::string &device_name,
    int channels,
    uint32_t sample_rate,
    uint32_t /*frame_size*/) {
    auto mic = std::make_unique<win_virtual_mic_t>();
    if (!mic->init(device_name, channels, sample_rate)) {
      return nullptr;
    }
    return mic;
  }
}  // namespace platf::audio
