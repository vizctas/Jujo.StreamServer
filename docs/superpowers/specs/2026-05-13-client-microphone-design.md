# Client Microphone → Server Audio Injection

**Status:** Design Complete  
**Date:** 2026-05-13  
**Platforms:** Windows (WASAPI), Linux (PulseAudio)  
**Scope:** Server-side wireup + config. Client integration documented but not implemented.

---

## 1. Overview

Allow a streaming client (browser) to send microphone audio through the existing WebRTC connection to the server. The server injects this audio as a virtual microphone device on the host machine, making it available to any application (Discord, game voice chat, OBS, etc.). The net effect: the remote client's voice is heard as if a physical microphone were plugged into the host PC.

---

## 2. Data Flow

```
Browser client                        Server
─────────────                        ──────
getUserMedia({audio:true})           
  → addTrack() to PeerConnection     
                                     OnAddTrack (audio receiver)
                                       → AudioTrackSinkAdapter
                                         → ring_buffer<ClientMicFrame>
                                           → virtual_mic_t::push()
                                             → WASAPI virtual capture endpoint (Win)
                                               / PulseAudio virtual source (Linux)
                                                 → Any app on host sees "Jujo.Stream Mic"
```

- Client sends: interleaved float32 PCM, any sample rate, any channel count (WebRTC negotiates)
- Server converts to 16-bit int at the platform driver boundary if needed
- Jitter buffer: ~200ms ring buffer (same `kMaxAudioFrames` pattern as existing host audio capture)

This is independent from the existing server→client audio path (host game audio → Opus → WebRTC → client). Both flows coexist on the same PeerConnection.

---

## 3. libwebrtc C API Changes

**Files:** `third-party/libwebrtc/include/libwebrtc_c.h`, `third-party/libwebrtc/src/libwebrtc_c.cc`

### 3.1 New callback type

```c
typedef void (*lwrtc_audio_frame_cb)(
    void* user,
    const void* audio_data,     // interleaved float32 PCM
    int bits_per_sample,        // 32
    int sample_rate,            // e.g. 48000, 16000
    int number_of_channels,     // 1 (mono) or 2 (stereo)
    int number_of_frames);      // samples per channel
```

### 3.2 New registration function

```c
void lwrtc_peer_register_audio_receiver(
    lwrtc_peer_t* peer,
    lwrtc_audio_frame_cb cb,
    void* user);
```

### 3.3 Implementation

- `CppObserver::OnAddTrack()` (currently empty stub at `libwebrtc_c.cc:220`) is populated:
  - Check if receiver's `track()->kind()` is `"audio"`
  - Get the underlying `webrtc::AudioTrackInterface`, call `AddSink()` with an adapter
  - The `AudioTrackSinkAdapter` implements `OnData(const void* audio_data, int bits_per_sample, int sample_rate, size_t number_of_channels, size_t number_of_frames)` and forwards to the C callback
- The observer is already registered via `RegisterRTCPeerConnectionObserver` in `lwrtc_factory_create_peer`
- Multiple sinks per peer: each call registers one callback. The wrapper stores them as a list in `lwrtc_peer` struct

### 3.4 Thread safety

The callback fires on the WebRTC signaling/worker thread. The consumer must handle synchronization. The server-side ring buffer handles this (see Section 4).

---

## 4. Server-Side Pipeline

**Files:** `src/webrtc_stream.h`, `src/webrtc_stream.cpp`

### 4.1 Session data structures

```cpp
// New SessionOptions field
struct SessionOptions {
  // ... existing fields ...
  bool client_mic = false;  // Client requests to send microphone
};

// New SessionState fields
struct SessionState {
  // ... existing fields ...
  bool client_mic_active = false;
};

// New per-session ring buffer entry
struct ClientMicFrame {
  std::vector<float> samples;  // interleaved float32 PCM
  int sample_rate;
  int channels;
  int frames;
};
```

### 4.2 Per-session internals

Added to the internal session struct (anonymous namespace in `webrtc_stream.cpp`):

```cpp
ring_buffer_t<ClientMicFrame> client_mic_frames {kMaxAudioFrames};  // ~200ms
lwrtc_audio_frame_cb mic_user;  // C callback user pointer
```

### 4.3 Callback registration

In `create_peer_connection()`, after peer creation succeeds:

```cpp
if (state.client_mic_active) {
  lwrtc_peer_register_audio_receiver(peer, &on_client_mic_frame, &session);
}
```

### 4.4 Callback handler

```cpp
static void on_client_mic_frame(
    void* user,
    const void* audio_data,
    int bits_per_sample,
    int sample_rate,
    int number_of_channels,
    int number_of_frames)
{
  auto& session = *static_cast<Session*>(user);
  ClientMicFrame frame;
  frame.samples.assign(
      static_cast<const float*>(audio_data),
      static_cast<const float*>(audio_data) + number_of_frames * number_of_channels);
  frame.sample_rate = sample_rate;
  frame.channels = number_of_channels;
  frame.frames = number_of_frames;
  session.client_mic_frames.push(std::move(frame));
}
```

### 4.5 Processing loop integration

A new function `process_client_mic()` drains the ring buffer and pushes frames to the platform-level virtual microphone:

```cpp
void process_client_mic() {
  // Called from the existing media processing loop
  for (auto& [id, session] : sessions) {
    ClientMicFrame frame;
    while (session.client_mic_frames.pop(frame)) {
      if (g_virtual_mic) {
        g_virtual_mic->push(frame.samples, frame.sample_rate,
                            frame.channels, frame.frames);
      }
    }
  }
}
```

### 4.6 Lifecycle

- Virtual mic device created on first session with `client_mic = true` (via `ensure_virtual_mic_started()`)
- Virtual mic device destroyed when last such session closes (via `ensure_virtual_mic_stopped()`)
- Same pattern as ABR controller encoder registration

---

## 5. Configuration

**Files:** `src/config.h`, `src/config.cpp`

### 5.1 Config struct

```cpp
struct audio_t {
  // ... existing fields ...
  bool enable_client_mic = false;  // Master toggle for client-to-host mic audio
};
```

### 5.2 Parsing

```cpp
bool_f(vars, "enable_client_mic", audio.enable_client_mic);
```

### 5.3 Auto-exposure to Flutter

`config::parse_config()` returns all key-value pairs. The `/api/config` endpoint auto-exposes `enable_client_mic` to Flutter without any additional server-side changes.

---

## 6. Platform Layer

### 6.1 New abstraction

**File:** `src/platform/common.h`

```cpp
class virtual_mic_t {
public:
  // Push interleaved float32 PCM samples. Called from WebRTC processing thread.
  // Returns capture_e::ok or capture_e::error.
  virtual capture_e push(
      const std::vector<float>& samples,
      int sample_rate,
      int channels,
      int frames) = 0;

  virtual ~virtual_mic_t() = default;
};
```

Add to `audio_control_t`:

```cpp
// Create a virtual microphone device visible to host applications.
// device_name: display name in OS sound settings (e.g. "Jujo.Stream Mic")
// Returns nullptr if platform doesn't support virtual mic creation.
virtual std::unique_ptr<virtual_mic_t> virtual_microphone(
    const std::string& device_name,
    int channels,
    std::uint32_t sample_rate,
    std::uint32_t frame_size) = 0;
```

### 6.2 Windows implementation

**New file:** `src/platform/windows/virtual_mic.cpp`

- Register a virtual WASAPI capture endpoint via COM (`IMMDeviceEnumerator`, `IAudioClient`)
- Advertise 48kHz and 44.1kHz, 16-bit PCM, 1–2 channels
- Internal ring buffer between `push()` (WebRTC thread) and WASAPI event-driven read (OS audio thread)
- Float32 → int16 conversion at the driver boundary
- Reuses `WAVEFORMATEXTENSIBLE` helper patterns from existing virtual sink code

### 6.3 Linux implementation

**New file:** `src/platform/linux/virtual_mic.cpp`

- Create a PulseAudio null-sink, then expose its monitor as a virtual source
- Uses `pa_simple_new(..., PA_STREAM_PLAYBACK, sink_name, ...)` in a playback mode to write audio into the null-sink
- The null-sink's monitor appears as a recording source for any app
- Reuses `load_null()` infrastructure from existing `audio.cpp`
- If PipeWire is available, consider native PipeWire virtual source as alternative

### 6.4 Build system

**File:** `cmake/compile_definitions/common.cmake`

Add new source files to `SUNSHINE_TARGET_FILES`:
- `src/platform/windows/virtual_mic.cpp` (Windows only)
- `src/platform/linux/virtual_mic.cpp` (Linux only)

---

## 7. Flutter Admin UI

**File:** `jujo_stream_app/lib/features/streaming/widgets/advanced_audio_tab.dart`

Add a new `ConfigSwitchField` in the "Audio Behavior" section:

```dart
ConfigSwitchField(
  label: 'Enable Client Microphone',
  subtitle: 'Allow connected clients to send microphone audio to this machine'
      ' as a virtual microphone device',
  value: _parseBool(config.getValue('enable_client_mic')),
  onChanged: (v) => notifier.setField('enable_client_mic', v),
),
```

Placed after the existing "Stream audio" toggle, in the "Audio Behavior" section. No new dependencies needed — uses existing `ConfigSwitchField` widget.

---

## 8. Client-Side Integration Notes

The browser client (not part of this server-side implementation) needs to:

1. **Capture microphone:**
   ```js
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   ```

2. **Add track to existing PeerConnection:**
   ```js
   stream.getAudioTracks().forEach(track => {
     pc.addTrack(track, stream);
   });
   ```

3. **Re-negotiation:** After `addTrack()`, call `pc.createOffer()` → `pc.setLocalDescription()`, send the new SDP to the server's `/api/webrtc/sessions/{id}/offer` endpoint. The server already handles renegotiation via `set_remote_offer()`.

4. **SDP direction:** The server's offer already includes `a=recvonly` for audio when `offer_to_receive_audio = 1`. The browser's answer will mark the mic track as `a=sendonly`.

5. **Opus encoding:** The browser's WebRTC stack auto-encodes the mic to Opus. The server receives decoded PCM via `AudioTrackSinkInterface::OnData`. No server-side Opus decoding needed.

---

## 9. Error Handling

| Scenario | Behavior |
|----------|----------|
| Client sends mic but `enable_client_mic = false` | Server ignores the track (no sink added). Remote track exists but frames are discarded. |
| Virtual mic device creation fails | Log warning. Audio frames are dropped. Session continues with video+audio-out only. |
| Ring buffer overflows (network burst) | Oldest frames dropped silently (existing `drop_oldest()` pattern). |
| Client disconnects abruptly | Session cleanup destroys the callback, unregisters the sink, drops the virtual mic if last session. |
| Sample rate mismatch | `virtual_mic_t` implementation performs resampling (e.g. using libsamplerate or PushResampler from WebRTC). |
| `OnAddTrack` fires for video instead of audio | Check `track()->kind()` — skip non-audio tracks. |

---

## 10. Testing Strategy

### 10.1 Unit tests (C++)

- **libwebrtc callback:** Verify `OnAddTrack` correctly routes audio receivers to the C callback, and ignores video receivers
- **Ring buffer:** Verify `ClientMicFrame` push/pop preserves sample data, sample rate, channels, frames
- **Session lifecycle:** Verify virtual mic created on first session, destroyed on last

### 10.2 Integration test

- Start server with `enable_client_mic = true`
- Create a WebRTC session
- Simulate browser adding an audio track (add via server-side internal API)
- Verify PCM frames arrive at `virtual_mic_t::push()`

### 10.3 Manual test

- Browser: Connect to stream, enable microphone in browser UI
- Server: Verify "Jujo.Stream Mic" appears in Windows Sound settings → Recording devices
- Host: Open Discord/Game → select "Jujo.Stream Mic" as input → verify audio is heard

---

## 11. Files Summary

### New files
| File | Purpose |
|------|---------|
| `src/platform/windows/virtual_mic.cpp` | WASAPI virtual capture endpoint |
| `src/platform/linux/virtual_mic.cpp` | PulseAudio virtual source |

### Modified files
| File | Change |
|------|--------|
| `third-party/libwebrtc/include/libwebrtc_c.h` | Add `lwrtc_audio_frame_cb` + `lwrtc_peer_register_audio_receiver` |
| `third-party/libwebrtc/src/libwebrtc_c.cc` | Implement `OnAddTrack` + `AudioTrackSinkAdapter` |
| `src/platform/common.h` | Add `virtual_mic_t` class + `virtual_microphone()` factory |
| `src/webrtc_stream.h` | Add `client_mic` to `SessionOptions`/`SessionState` |
| `src/webrtc_stream.cpp` | Register audio receiver callback, ring buffer, processing loop |
| `src/config.h` | Add `bool enable_client_mic` to `audio_t` |
| `src/config.cpp` | Parse `enable_client_mic` via `bool_f` |
| `cmake/compile_definitions/common.cmake` | Add new platform `.cpp` files |
| `jujo_stream_app/lib/features/streaming/widgets/advanced_audio_tab.dart` | Add `enable_client_mic` toggle |

### Unchanged
| File | Reason |
|------|--------|
| `src/audio.h` / `src/audio.cpp` | Host→client audio capture path is independent |
| `src/confighttp_webrtc.cpp` | `SessionOptions` already supports `client_mic` field; client sends it in JSON body |
| `jujo_stream_app/lib/core/providers/stream_config_provider.dart` | `setField()`/`apply()` work generically for any config key |

---

## 12. Implementation Order

1. **libwebrtc C API** — `OnAddTrack` + `AudioTrackSinkAdapter` + callback registration (prerequisite for everything)
2. **`virtual_mic_t` abstraction + platform stubs** — define the interface, add a no-op stub for macOS (not in scope)
3. **Windows `virtual_mic.cpp`** — WASAPI virtual capture endpoint
4. **Linux `virtual_mic.cpp`** — PulseAudio virtual source
5. **Server pipeline** — `webrtc_stream.cpp` changes (session fields, ring buffer, callback, processing loop)
6. **Config** — `config.h`/`config.cpp` + `enable_client_mic` toggle
7. **Flutter UI** — toggle in advanced audio tab
8. **Build system** — cmake file changes
