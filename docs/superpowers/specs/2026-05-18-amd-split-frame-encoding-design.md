# AMD Split Frame Encoding Support

**Date:** 2026-05-18  
**Status:** Approved  
**Author:** AI-assisted design  

## 1. Overview

Expose AMD's official split-frame (multi-HW-instance) encoding capability in Jujo.Stream Server's AMD AMF encoder path, bringing AMD encoding latency closer to parity with NVIDIA's split-frame feature on compatible GPUs.

## 2. Background

AMD's Video Core Next (VCN) encoder includes a **multi-HW-instance** mode introduced in AMF SDK v1.4.35. When a frame is split across two VCN instances, per-frame encode latency is roughly halved. This is analogous to NVIDIA NVENC's "Split Frame Encoding."

**The catch:** AMD's driver gates this feature to resolutions >= 4K (approximately 3840x2160). At 1080p or 1440p the driver silently falls back to single-VCN encoding even when the property is enabled. There is no official public API to override this gate. This design **does not** attempt to bypass the gate.

**Supported hardware:** GPUs with dual VCN — RX 7900 XTX/XT/GRE, RX 7800 XT/7700 XT, RX 9070 XT/9070, RX 6900 XT/6800 XT/6800, Ryzen AI Max (Strix Halo). Mid-range cards (e.g., RX 7600, RX 6700 XT) have a single VCN and will ignore the property.

**Supported codecs:** HEVC and AV1 only. H.264 does not expose a multi-HW-instance property in AMF headers.

## 3. What We Are NOT Doing

- No driver DLL patching or runtime memory manipulation.
- No standalone patch tool.
- No GPU PCI ID whitelist/blacklist.
- No resolution checks in the app to "help" the driver — we let the driver gate it.
- No application-level frame splitting with two parallel encoder instances.

## 4. Design

### 4.1 Config Option

Add `amd_split_frame` to the video configuration.

| Value | Behavior |
|---|---|
| `auto` (default) | Sets `HevcMultiHwInstanceEncode` / `Av1MultiHwInstanceEncode` = `true`. The AMD driver decides whether to activate split frame based on resolution, GPU capability, and driver version. |
| `enabled` | Same as `auto` today. If AMD removes the 4K gate in a future driver, this setting will work immediately without an app update. |
| `disabled` | Explicitly sets the property to `false`, disabling split frame even on 4K+ dual-VCN GPUs. |

Default is `auto` so existing users see zero behavior change.

### 4.2 AMF Property Mapping

The AMD encoder uses FFmpeg's AMF wrappers (`hevc_amf`, `av1_amf`). We add the new options to the `amdvce` encoder's `common_options` lists in `src/video.cpp`, following the same pattern as `amd_preanalysis`, `amd_vbaq`, etc.

For HEVC:
- FFmpeg option name: to be determined (maps to AMF property `AMF_VIDEO_ENCODER_HEVC_MULTI_HW_INSTANCE_ENCODE`)
- Set via `av_opt_set_int` when config value is `auto` or `enabled`
- Omitted when config value is `disabled` (or set to 0 explicitly)

For AV1:
- FFmpeg option name: to be determined (maps to AMF property `AMF_VIDEO_ENCODER_AV1_MULTI_HW_INSTANCE_ENCODE`)
- Same behavior as HEVC

> **Note:** The exact FFmpeg option names for these AMF properties must be verified against the FFmpeg source during implementation. They typically follow the pattern `multi_hw_instance_encode` or similar for AMF codec wrappers.

H.264 intentionally has no mapping because AMF headers do not expose `AMF_VIDEO_ENCODER_MULTI_HW_INSTANCE_ENCODE` for AVC.

### 4.3 Logging

Extensive logging is included so users can share encoder behavior details when debugging.

**At encoder initialization:**
- Log the configured `amd_split_frame` value.
- Log whether the AMF property was passed to FFmpeg (`hevc_multi_hw_instance_encode=1` / `av1_multi_hw_instance_encode=1`).
- Log the codec, resolution, and GPU detected (already logged by existing AMF init code).

**At runtime (per-frame is too noisy; log once per session):**
- If `amd_split_frame` is `enabled` or `auto`, log a reminder that the driver controls actual activation and that 4K+ is required on dual-VCN GPUs.

**Failure cases:**
- If `amd_split_frame` is set to `enabled`/`auto` but the AMF property is rejected by `avcodec_open2`, log a warning with the error string.
- If the user sets `amd_split_frame` on H.264, log an info-level message that the setting is ignored for AVC (no AMF property exists).

**Log level:** All split-frame-related logs use `info` or `warning` so they are visible in default logging.

### 4.4 Error Handling

- `avcodec_open2` failure with the new option set -> retry once without the option (same fallback pattern already used for other AMD options). If the retry succeeds, log a warning that split frame was not available and continue with single-VCN encoding.
- `amd_split_frame` on an unsupported codec (H.264) -> silently ignore, log once.
- `amd_split_frame` on a GPU without dual VCN -> the driver ignores the property; no error.

### 4.5 Files to Modify

| File | Change |
|---|---|
| `src/config.h` | Add `std::optional<int> amd_split_frame` to `video_t::amd` struct. |
| `src/config.cpp` | Add `amd_split_frame` enum (`auto`, `enabled`, `disabled`), parser, default value, and config key mapping. Add key to allowed config keys list. |
| `src/video.cpp` | Add `"hevc_multi_hw_instance_encode"` and `"av1_multi_hw_instance_encode"` options to the `amdvce` encoder's HEVC and AV1 `common_options` lists, mapped to the new config field. |
| `Jujo.StreamAdmin/lib/features/streaming/widgets/advanced_encoder_tab.dart` | Add `ConfigDropdownField` for `amd_split_frame` in `_AmdSection`, conditionally shown when active codec is HEVC or AV1 (hidden for H.264). |

### 4.6 Admin App UI

**Location:** `Jujo.StreamAdmin/lib/features/streaming/widgets/advanced_encoder_tab.dart` inside `_AmdSection`

**Control:** `ConfigDropdownField`
- **Label:** "Split Frame Encoding"
- **Options:** `['auto', 'enabled', 'disabled']`
- **Helper text (tooltip):** "Reduces encode latency on dual-VCN AMD GPUs. The AMD driver automatically activates this at 4K+ resolutions for HEVC and AV1. H.264 is not supported."
- **Config key:** `amd_split_frame`
- **Default value:** `auto`

**Conditional visibility:**
The field is only shown when the active codec is HEVC or AV1. When H.264 is the active codec, the field is hidden entirely (not just disabled) to avoid user confusion. The `currentCodecProvider` already exists in the Admin app and exposes the active codec string (`h264`, `hevc`, `av1`).

Example conditional rendering pattern:
```dart
final codec = ref.watch(currentCodecProvider);
if (codec != 'h264') ...[
  ConfigDropdownField(
    label: 'Split Frame Encoding',
    value: config.getValue('amd_split_frame') ?? 'auto',
    options: const ['auto', 'enabled', 'disabled'],
    labels: const ['Auto', 'Enabled', 'Disabled'],
    helperText: 'Reduces encode latency on dual-VCN AMD GPUs. The AMD driver automatically activates this at 4K+ resolutions for HEVC and AV1. H.264 is not supported.',
    onChanged: (v) => notifier.setField('amd_split_frame', v),
  ),
]
```

### 4.7 Testing

- **Unit tests:** Add config parsing tests for `amd_split_frame` values (valid: auto, enabled, disabled; invalid: falls back to auto).
- **Integration tests:** Verify that the option is correctly passed to FFmpeg's AMF encoder when set to `enabled`/`auto`, and omitted when set to `disabled`.
- **Admin UI tests:** Verify the dropdown appears for HEVC/AV1 codecs and is hidden for H.264; verify the helper text tooltip renders correctly.
- **Manual verification:** On a dual-VCN AMD GPU, stream at 4K with `amd_split_frame = enabled` and confirm encode latency improves vs. `disabled`.

## 5. Future Work (Out of Scope)

- If AMD ever removes the 4K resolution gate in a future driver, `enabled` / `auto` will automatically benefit with no code change.
- A standalone driver patch tool (similar to `amf-sfe-patch`) could be built separately if the user community demands sub-4K split frame. That is intentionally out of scope for this safe, maintainable design.

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AMF property rejected on older drivers | Fallback retry without the property; log warning and continue. |
| User confusion why 1080p/1440p doesn't use split frame | Log clearly that the driver gates the feature to 4K+. |
| H.264 users set the option and expect it to work | Log that the option is ignored for H.264. Admin app hides the control for H.264. |
| Driver updates change property names or behavior | We use official AMF SDK property names; if they change, FFmpeg will ignore unknown options gracefully. |
| Admin app and backend get out of sync on config key name | Both sides use the same string `amd_split_frame`; backend allow-list must include it. |
