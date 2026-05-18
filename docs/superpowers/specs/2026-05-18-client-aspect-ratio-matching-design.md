# Client Aspect Ratio Matching — Design Spec

**Date:** 2026-05-18
**Status:** Approved — implementation in progress

---

## 1. Problem

Users with non-square-pixel displays (21:9, 32:9, 16:10, etc.) receive black bars when streaming because the server creates a virtual display whose pixel dimensions match the client's requested resolution exactly, without accounting for the physical aspect ratio of the client's monitor. The encoded stream uses square-pixel assumptions throughout, so a client requesting 1920×1080 on a 21:9 display gets letterboxed content rather than a correctly-stretched image.

---

## 2. Approach

**Option A — Protocol Extension + Display/Encoder Layer** (selected):

1. The client sends an optional `aspect_ratio` string (e.g. `"21:9"`) alongside `width`/`height` in the WebRTC session offer JSON.
2. The server stores the value in `SessionOptions` → `SessionState` → `launch_session_t`.
3. During virtual display creation the server computes square-pixel dimensions that preserve the physical aspect ratio.
4. The display helper filters available modes by the target aspect ratio when choosing a resolution.
5. If no matching hardware mode is available, the encoder injects a SAR (Sample Aspect Ratio) into the video stream so that decoders display the content at the correct ratio.

---

## 3. Protocol Extension (Client → Server)

### JSON Offer Shape

```json
{
  "width": 1920,
  "height": 1080,
  "fps": 60,
  "aspect_ratio": "21:9"
}
```

- Field: `"aspect_ratio"` — optional string, format `"<W>:<H>"` where `W` and `H` are positive integers.
- Allowed examples: `"16:9"`, `"21:9"`, `"32:9"`, `"16:10"`, `"4:3"`.
- Omitting the field (or the value `null`) means no AR override — server uses pixel dimensions as-is (legacy behavior).
- The client admin-app UI exposes: Auto / 16:9 / 21:9 / 16:10 / 4:3 / 32:9. **Auto** sends no `aspect_ratio` field.

### Validation (server-side, `confighttp_webrtc.cpp`)

- Reject values not matching `^\d+:\d+$`.
- Reject either component being zero.
- Reject ratios outside the range `[1/4, 4]` (avoids absurd values).

---

## 4. Server-Side Structs

### `webrtc_stream::SessionOptions` (`webrtc_stream.h`)

```cpp
std::optional<std::string> aspect_ratio;  ///< Physical display aspect ratio e.g. "21:9"
```

### `webrtc_stream::SessionState` (`webrtc_stream.h`)

```cpp
std::optional<std::string> aspect_ratio;
```

### `rtsp_stream::launch_session_t` (`rtsp.h`)

```cpp
std::optional<std::string> aspect_ratio;
```

### Config (`config.h` — inside `video_t::dd_t`)

```cpp
enum class aspect_ratio_option_e {
  disabled,   ///< Ignore client-sent aspect ratio; legacy behavior
  automatic   ///< Apply square-pixel dimension compute + mode filter + SAR fallback
};
aspect_ratio_option_e aspect_ratio_option = aspect_ratio_option_e::automatic;
```

Config key: `dd_aspect_ratio_option`. Default: `"automatic"`.

### Config Helpers (`config.cpp`)

```cpp
video_t::dd_t::aspect_ratio_option_e aspect_ratio_option_from_view(std::string_view value) {
  if (value == "disabled") return video_t::dd_t::aspect_ratio_option_e::disabled;
  return video_t::dd_t::aspect_ratio_option_e::automatic;  // default
}
```

---

## 5. Display / Encoder Integration

### 5.1 Virtual Display Dimension Compute (`webrtc_stream.cpp:358-359`)

When `aspect_ratio_option == automatic` and `session->aspect_ratio` is set:

```
ar  = parse_aspect_ratio(session->aspect_ratio)  // e.g. {21, 9}
px_ar = session->width / (float)session->height   // pixel aspect ratio
target_ar = ar.first / (float)ar.second           // physical aspect ratio

if abs(px_ar - target_ar) > 0.01:
  # Adjust width to match target AR, keep height
  vd_width = round(vd_height * target_ar)
  # Clamp to [640, 7680]
```

The modified `vd_width`/`vd_height` are passed to `VDISPLAY::createVirtualDisplay`.

### 5.2 Display Helper Mode Filter (`display_device.cpp` — `parse_resolution_option`)

Inside `resolution_option_e::automatic` branch, when `session.aspect_ratio` is set and `aspect_ratio_option == automatic`:

1. Build the resolution as usual.
2. Store the target aspect ratio on the config object so the display-device library can prefer modes whose native resolution matches the target AR (± 2% tolerance) when doing mode selection.

### 5.3 Encoder SAR Fallback (`video.cpp`)

After initialising the encoder context (near where `sws` is set up), if the active session has `aspect_ratio` set and `aspect_ratio_option == automatic`:

```cpp
// Compute SAR such that sar_num/sar_den * (coded_width/coded_height) == target_ar
sar_num = ar.first * coded_height;
sar_den = ar.second * coded_width;
avctx->sample_aspect_ratio = {sar_num, sar_den};
```

This ensures H.264/HEVC/AV1 streams carry the correct DAR even when virtual display mode selection couldn't deliver a square-pixel match.

---

## 6. Config Toggle & Admin App UI

### Server Config

Key: `dd_aspect_ratio_option`
Values: `disabled` / `automatic` (default: `automatic`)

### Admin App (`advanced_display_tab.dart`)

New row in the **Display** tab, below the Resolution Option row:

```
Aspect Ratio Matching    [dropdown: Automatic ▼ / Disabled]
```

- **Automatic**: server applies dimension compute + mode filter + SAR fallback.
- **Disabled**: server ignores `aspect_ratio` from client; no behaviour change.

Maps to config key `dd_aspect_ratio_option`.

---

## 7. Data-Flow Summary

```
Client sends:  { width: 1920, height: 1080, aspect_ratio: "21:9" }
                          │
confighttp_webrtc.cpp ────► SessionOptions.aspect_ratio = "21:9"
                          │
webrtc_stream.cpp ────────► launch_session->aspect_ratio = "21:9"
                          │
                          ├─► Virtual display dims:
                          │     vd_width  = round(1080 * 21/9) = 2520
                          │     vd_height = 1080
                          │
                          ├─► display_device mode filter:
                          │     prefer 2560×1080 (matches 21:9) over 1920×1080
                          │
                          └─► Encoder SAR (if no matching mode):
                                SAR = (21 * 1080) / (9 * 1920) = 22680/17280 ≈ 1.3125
```

---

## 8. Files Changed

| File | Change |
|------|--------|
| `src/config.h` | `aspect_ratio_option_e` enum + field in `dd_t` |
| `src/config.cpp` | `aspect_ratio_option_from_view`, `generic_f` parse, default init |
| `src/rtsp.h` | `aspect_ratio` field in `launch_session_t` |
| `src/webrtc_stream.h` | `aspect_ratio` in `SessionOptions` + `SessionState` |
| `src/confighttp_webrtc.cpp` | Parse + validate `aspect_ratio` JSON field |
| `src/webrtc_stream.cpp` | Propagate options→session→launch; compute vd dims |
| `src/display_device.cpp` | AR-aware mode preference in `parse_resolution_option` |
| `src/video.cpp` | SAR injection in encoder init |
| `Jujo.StreamAdmin: lib/features/streaming/widgets/advanced_display_tab.dart` | AR dropdown |

---

## 9. Non-Goals

- No changes to RTSP/Moonlight protocol path.
- No changes to input handling.
- No multi-monitor AR routing.
- Admin-app client-side aspect ratio picker (that is a separate feature).
