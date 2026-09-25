# Vibepollo port plan (encoder / framerate / transport only)

Base: fork diverged from Vibepollo at `30d9ba7e` (2026-04-25, 1.15.4-alpha.1).
Scope: streaming speed, latency, reliability for every host (NVIDIA, AMD, Intel,
Linux) and every client (TV, mobile, PC). No UI, RTX HDR, framegen, remote monitor.

## Phase 1 - done (branch `perf/vibepollo-p1p2`)
- `9437b45f` `d4123a32` NVENC SDK 12.1/12.2 struct revisions (10-bit/HDR on 12.2 drivers).
- `90b02a16` AP1 `pacing_max_bitrate_kbps`, AP6 critical video threads,
  AP9 `nvenc_temporal_aq`, SP1 `packetsize` cap, SP2 H.264 intra-refresh + recovery SEI.
- `48ad70f6` pacer never below 110% of session bitrate.
- `2bed0766` zero-timeout queue polls never enter a CV wait.

## Phase 2 - done (same branch)
- `2b83c744` `c14a308c` `d689b3d6` (minimal): sync encoder teardown on reinit/shutdown,
  global teardown mutex, shared D3D surfaces freed after encoders drop the display.
- `8afc2fc0` HDR colorspace latch across transient SDR reinit.

## Phase 3 - measure, then default the pacer (mobile / WiFi clients)
- A/B on FireTV + phone over WiFi: `pacing_max_bitrate_kbps` = 0 vs ~1.3x bitrate.
- If jitter drops, pick an automatic default (e.g. pace to 1.3x session bitrate
  when the client is not on Ethernet) instead of the 1 Gbps legacy value.

## Phase 4 - WGC capture pacing (Windows 11 default capture)
- `cad445e8` pacing phase under Reflex caps, `953f310f` UAC stall recovery,
  `10e9a4e9` `83548e86` `wgcc` constant mode, `f871b3d8` 1-buffer VRR.
- Skip reverted: `e4798f2d`, `b195fb28`, July WGC perf reverts.
- Watch `4aa4bb3d` `45014178` (present-cadence stamps, beta 2026-09-22).

## Phase 5 - AMD hosts
- Native AMF encoder `c5e17b25` + fixes (`e1dd3091` low-latency fallback, `70a5db5e`,
  `0e4b08fb`, `32ed589a`, `4b1a5535`, `1eb3adf5`, `89ed5b02`, `fa764473`, `3fb1b181`).
- Ship as opt-in (`amdvce` native, FFmpeg default) like upstream `3551765c`.
- Needs an AMD test host before enabling.

## Phase 6 - Linux hosts
- Native NVENC over CUDA (`094f74b9`, `8267d658`), duplicate filter `893d54c9`,
  VAAPI low-power fallback (`e1dd3091`), KMS presentation pacing
  (`521783d1`, `c7601891`, `cac1af2f`).
- Requires a Linux build of this fork first (CI currently Windows only).
