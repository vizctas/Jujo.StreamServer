# Implementation Plan: AMD Split Frame Encoding

**Spec:** `docs/superpowers/specs/2026-05-18-amd-split-frame-encoding-design.md`  
**Date:** 2026-05-18

---

## Status

| Task | Status |
|------|--------|
| Task 1: Backend Config | **DONE** — committed `7dd2cf17` |
| Task 2: Backend Encoder Options | **DONE** — committed `7dd2cf17` |
| Task 3: Admin App UI | **DONE** — committed `c7e8b67` (StreamAdmin) |
| Task 4 (FFmpeg Patch): Expose AVOption | **DONE** — patch written, see below |
| Task 4b: Config unit tests (split_frame_from_view) | **DONE** — `tests/unit/test_config_amd.cpp` |
| Task 5: Integration Testing | Pending (requires AMD dual-VCN hardware) |
| Task 5b: FFmpeg fork / patched binary delivery | **IN PROGRESS** — see section below |
| Task 6: Documentation Update | Pending |

---

## Task 4 (FFmpeg Patch): Expose `multi_hw_instance_encode` AVOption

**Problem:** StreamServer passes `multi_hw_instance_encode` as an `av_dict_set` key to FFmpeg's
`hevc_amf` and `av1_amf` encoders. FFmpeg does not currently expose `AMF_VIDEO_ENCODER_HEVC_MULTI_HW_INSTANCE_ENCODE`
or `AMF_VIDEO_ENCODER_AV1_MULTI_HW_INSTANCE_ENCODE` as `AVOption`s, so the key is silently dropped.

**Solution:** Patch FFmpeg's AMF encoder sources to add the `AVOption` and wire it to the AMF property.

**Patch file:** `packaging/patches/FFmpeg/AMF/02-amfenc-multi-hw-instance-encode.patch`

**Changes in the patch:**
- `libavcodec/amfenc.h` — add `int multi_hw_instance_encode` field to `AMFEncoderContext`
- `libavcodec/amfenc_hevc.c` — add `multi_hw_instance_encode` AVOption; call
  `AMF_ASSIGN_PROPERTY_BOOL(..., AMF_VIDEO_ENCODER_HEVC_MULTI_HW_INSTANCE_ENCODE, ...)` in init
- `libavcodec/amfenc_av1.c` — same for `AMF_VIDEO_ENCODER_AV1_MULTI_HW_INSTANCE_ENCODE`

**AMF SDK constants:**
- HEVC: `AMF_VIDEO_ENCODER_HEVC_MULTI_HW_INSTANCE_ENCODE` = `L"HevcMultiHwInstanceEncode"` (SDK >= 1.4.35)
- AV1: `AMF_VIDEO_ENCODER_AV1_MULTI_HW_INSTANCE_ENCODE` = `L"Av1MultiHwInstanceEncode"` (SDK >= 1.4.35)

**Delivery path (vizctas fork — no external PRs):**

The LizardByte/build-deps `dist` orphan branch contains pre-compiled binaries committed directly
(not via CI). The CI only creates GitHub Release `.tar.gz` assets. To deliver patched FFmpeg:

1. **Fork** `LizardByte/build-deps` → `vizctas/build-deps` on GitHub.
2. **Seed the dist branch** — copy LizardByte's current dist branch commit verbatim so all platform
   binaries (Boost, FFmpeg for macOS/Linux/Windows) are present:
   ```bash
   git clone https://github.com/LizardByte/build-deps.git tmp-bd
   cd tmp-bd
   git remote add vizctas https://github.com/vizctas/build-deps.git
   # Push current LizardByte dist commit as-is to vizctas dist branch
   git push vizctas 2840c8a5780e188eab781ec7db99c7e55e929e60:refs/heads/dist
   ```
3. **Apply the patch** to `vizctas/build-deps` master: copy
   `packaging/patches/FFmpeg/AMF/02-amfenc-multi-hw-instance-encode.patch` into
   `patches/FFmpeg/FFmpeg/AMF/` in the fork (alongside the existing `01-amfenc-av1-full-range.patch`).
4. **Add the patch-ffmpeg workflow** — copy
   `packaging/github/vizctas-build-deps/patch-ffmpeg.yml` to
   `.github/workflows/patch-ffmpeg.yml` in the fork.
5. **Trigger the workflow** via `Actions → Patch Windows FFmpeg → Run workflow`.
   Builds only `Windows-AMD64-ffmpeg`, checks out the `dist` branch, overwrites
   `dist/Windows-AMD64/ffmpeg/` with the freshly built output, and force-pushes to `dist`.
6. **Update the submodule** in StreamServer:
   - Change `.gitmodules` url for `third-party/build-deps` to
     `https://github.com/vizctas/build-deps.git`.
   - Run `git submodule sync && git submodule update --remote third-party/build-deps`.
   - Commit the updated `.gitmodules` + submodule pointer.

**Workflow template:** `packaging/github/vizctas-build-deps/patch-ffmpeg.yml`

---

## Task 1: Backend Config (`src/config.h` + `src/config.cpp`)

**Files:**
- `src/config.h` — add `amd_split_frame` field
- `src/config.cpp` — add enum, parser, default, allowed keys

**Steps:**
1. In `src/config.h` `video_t::amd` struct, add:
   ```cpp
   std::optional<int> amd_split_frame;
   ```
2. In `src/config.cpp`, define `amd::split_frame_e` enum:
   ```cpp
   enum class split_frame_e {
     auto_mode = 0,
     enabled = 1,
     disabled = 2,
   };
   ```
3. Add parser function `split_frame_from_view()` (mirrors `split_encode_mode_from_view` for NVENC).
4. Add default: `amd::split_frame_e::auto_mode` to the `video_t::amd` defaults struct.
5. Add config key mapping: `string_f(vars, "amd_split_frame", video.amd.amd_split_frame, amd::split_frame_from_view);`
6. Add `"amd_split_frame"` to the allowed config keys list.

**Estimated effort:** Small (1 file edit, following existing NVENC split_encode pattern).

---

## Task 2: Backend Encoder Options (`src/video.cpp`)

**File:** `src/video.cpp`

**Steps:**
1. In `amdvce` encoder's HEVC `common_options`, add a conditional option for `hevc_multi_hw_instance_encode` that is only included when `amd_split_frame` is `auto_mode` or `enabled`.
2. In `amdvce` encoder's AV1 `common_options`, add the same for `av1_multi_hw_instance_encode`.
3. The option should be an `std::function<int()>` that returns 1 when enabled, 0 when disabled (or omitted entirely when disabled, since FFmpeg defaults are fine).
4. Add logging at encoder init:
   - `BOOST_LOG(info) << "AMD split frame: " << split_frame_value;`
   - If option is passed, log the property name and value.
   - If H.264 is active, log info that the option is ignored.

**Key decision:** Verify exact FFmpeg option names for the AMF properties. The FFmpeg AMF wrapper may expose these as:
   - `hevc_multi_hw_instance_encode`
   - `av1_multi_hw_instance_encode`
   or similar. Need to check FFmpeg source or test.

**Estimated effort:** Small (follow existing `amd_preanalysis` pattern).

---

## Task 3: Admin App UI (`Jujo.StreamAdmin`)

**File:** `lib/features/streaming/widgets/advanced_encoder_tab.dart`

**Steps:**
1. Import `currentCodecProvider` in `_AmdSection` (it's already defined but may not be imported).
2. Watch the codec provider:
   ```dart
   final codec = ref.watch(currentCodecProvider);
   ```
3. Add conditional block inside `_EncoderGroupCard.children`:
   ```dart
   if (codec != 'h264')
     ConfigDropdownField(
       label: 'Split Frame Encoding',
       value: config.getValue('amd_split_frame') ?? 'auto',
       options: const ['auto', 'enabled', 'disabled'],
       labels: const ['Auto', 'Enabled', 'Disabled'],
       helperText: 'Reduces encode latency on dual-VCN AMD GPUs. The AMD driver automatically activates this at 4K+ resolutions for HEVC and AV1. H.264 is not supported.',
       onChanged: (v) => notifier.setField('amd_split_frame', v),
     ),
   ```
4. Ensure the field is placed logically among other AMD options (after usage/RC dropdowns, near preanalysis/VBAQ switches).

**Estimated effort:** Very small (1 widget addition, following exact existing pattern).

---

## Task 4: Testing

**Backend tests:**
- Add config parsing unit test for `amd_split_frame` in existing test suite.
- Test valid values: `auto`, `enabled`, `disabled`.
- Test invalid value: falls back to `auto`.

**Manual verification:**
- Build and run on Windows with an AMD dual-VCN GPU.
- Set `amd_split_frame = enabled` and stream at 4K HEVC or AV1.
- Check logs for split frame property being passed.
- Compare encode latency vs. `disabled`.
- Test fallback: on a single-VCN GPU or at 1080p, verify no crash and no error.

**Admin app tests:**
- Launch admin app, navigate to Advanced Encoder -> AMD section.
- Verify dropdown appears for HEVC/AV1, is hidden for H.264.
- Verify selection persists and is sent to backend.

---

## Task 5: Documentation Update

- Add `amd_split_frame` to the advanced usage documentation.
- Explain the 4K driver gate and supported GPUs/codecs.
- Cross-reference with `nvenc_split_encode` for NVIDIA users.

---

## Dependencies & Order

1. Task 1 (backend config) must complete before Task 2 (encoder options use the config field).
2. Task 2 should be done before Task 3 (admin app references the same config key).
3. Tasks 1-3 can be committed together as a single feature commit.
4. Task 4 (testing) runs after Tasks 1-3 are implemented.
5. Task 5 (docs) can be done in parallel with testing.

**No external dependencies** — this is a pure config + encoder option change. No new libraries, no driver patches.

---

## Rollback Plan

If the AMF property causes `avcodec_open2` failures on certain driver/GPU combinations:
1. The existing fallback retry (without the option) already handles this gracefully.
2. If widespread failures occur, the config option can be temporarily ignored in `video.cpp` by commenting out the option lines.
3. Users can also set `amd_split_frame = disabled` as a workaround without any code change.
