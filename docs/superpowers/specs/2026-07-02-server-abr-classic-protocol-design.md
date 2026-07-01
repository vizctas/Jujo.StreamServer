# Design: Server-side Adaptive Bitrate on the classic Moonlight protocol (Phase 1, NVENC)

**Date:** 2026-07-02
**Branch:** `feature/abr-classic-protocol` (Jujo.StreamServer + Jujo.StreamClient)
**Roadmap:** item 7 of `docs/superpowers/plans/2026-07-01-server-roadmap-followups-plan.md`

## Problem

The server's adaptive-bitrate engine (`src/abr_controller.cpp`) is fully built — hysteresis, cooldown, encoder registration, live NVENC bitrate reconfigure — but **inert for real users**. `compute_health_score()` reads only `webrtc_stream::list_sessions()`, and our client uses the **classic** Moonlight protocol (RTSP/ENet), not WebRTC. So it adjusts nothing for a real session.

Meanwhile the client changes quality by a full **stop+restart** (`dynamic_bitrate_controller.dart` → `game_stream_screen.dart:897 _onDynBitrateReconnect`, "applying quality" message) — a visible hiccup.

## Goal

Server adjusts NVENC bitrate live on the classic protocol. A bitrate-only change keeps resolution/fps/codec, so the bitstream stays decodable with no renegotiation — transparent to the client decoder. The client stands down its reconnect-based controller when the server is doing this. Net: adaptive quality with no hiccup.

## Decisions

- **Server-authoritative.** Server reads its own network-loss signal, reconfigures NVENC live. **No protocol extension** (no change to the shared `moonlight-common-c` fork). Accepts a coarser signal than the client's (packet loss, not client decode-pressure/audio-buffer/jitter) in exchange for being contained and testable now on the RTX 3070 host + MiBox client.
- **Client fully stands down** its `DynamicBitrateController` when server ABR is active. No belt-and-suspenders fallback in Phase 1 (avoids two controllers fighting).
- **`enable_abr` stays default OFF (opt-in).** Flip to default-on only after MiBox field validation (see Risk). Phase 2 (client-informed signal via a protocol message) and Phase 3 (AMD/QSV live bitrate — needs the native AMF encoder + AMD hardware) remain deferred.

## Verified facts the design leans on

- **NVENC already registers with ABR for classic sessions.** `nvenc_base::create_encoder()` calls `abr::controller::instance().register_encoder(this)`, gated only on `config::video.enable_abr` (`src/nvenc/nvenc_base.cpp:786-788`) — protocol-agnostic. So the encoder is already in the ABR list; only a health source is missing.
- **ABR applies one global target to all encoders** (`abr_controller.cpp:157-224`). Classic Moonlight streams one video session at a time → one encoder → global target is correct.
- **Bitrate reconfigure forces an IDR** (`nvenc_base.cpp:984 reconfigure_params.forceIDR = 1`). Key client-decoder risk (below). It does NOT change resolution/fps → no `V4L2_EVENT_SOURCE_CHANGE` (the actual trigger of the MiBox Amlogic freeze fixed earlier); it's a plain IDR like the periodic/packet-loss-recovery ones the decoder already handles.
- **Original bitrate ceiling** captured at registration: `original_bitrate_kbps = enc->current_bitrate_kbps()` (`abr_controller.cpp:59`); also `session->config.monitor.bitrate`.
- **Classic loss signal exists but is discarded.** Handler `stream.cpp:1123-1137`: `stats[0]`=loss count since last report, `stats[1]`=window ms, `stats[3]`=last good frame — only `BOOST_LOG(verbose)`. No accumulation.
- **Session registry + tick loop exist.** `control_server_t::_sessions` / `_peer_to_session` (`stream.cpp:375`); `controlBroadcastThread` iterates under lock every 150ms (`stream.cpp:1311-1401`). No RTT/jitter on the classic control channel — loss count is the signal.

## Implementation

### Server (`Jujo.StreamServer`)

1. **Per-session loss accumulator** — in `session_t::video` (`stream.cpp`): last-report `loss_count`, `window_ms`, receipt `steady_clock` timestamp. Update it in the loss-stats handler (`stream.cpp:1123`) instead of log-only (keep the verbose log).
2. **Classic health provider** — new `stream` namespace function (declared in `stream.h`), `worst_active_session_loss_health()`: locks `_sessions`, computes a 0-100 score per session from the accumulator, returns the worst; sessions with no recent report (older than ~2× the client report interval) count healthy (100). Score shape mirrors the WebRTC one (`abr_controller.cpp:116-155`): loss-rate proxy = `loss_count / (window_ms/1000)` (losses/sec) → penalty bands. **ponytail:** bands are a tuning knob; a true packet-percentage (server-side sent-packet count) is a Phase-1.5 refinement if losses/sec is too coarse.
3. **Aggregate** in `compute_health_score()` (`abr_controller.cpp`): `min(webrtc_worst, stream::worst_active_session_loss_health())`. Add `stream.h` include, paralleling the existing `webrtc_stream` coupling. Everything downstream (state machine, `set_abr_target_bitrate`, IDR) unchanged.
4. **Advertise capability** — `serverinfo()` (`nvhttp.cpp`, alongside `root.GfeVersion`/`root.EncoderName`): `root.ServerAbrActive` = `config::video.enable_abr`.
5. Config default unchanged (`enable_abr` = false, `config.cpp:864`).

### Client (`Jujo.StreamClient`)

1. Parse `ServerAbrActive` into `ComputerDetails.serverAbrActive` (bool, default false) — same pattern as `gpuName`/`encoderName` (`nv_http_client.dart` + `computer_details.dart`).
2. Gate the controller at `game_stream_screen.dart:851`: `enabled: _config.dynamicBitrateEnabled && !serverAbrActive`, so `DynamicBitrateController.evaluate` never reconnects while the server adapts live. Backward compatible: controller behaves as today against servers that don't advertise ABR.

## Risk / Verification

1. **MiBox IDR safety — gates default-on.** Each ABR shift forces an IDR. On the MiBox (Amlogic), run a classic session with `enable_abr` on, induce repeated shifts (lower cooldown/thresholds or throttle network), watch a full session for freezes/`NotifyError`. Expected safe (bitrate-only IDR, no source change) but must be confirmed empirically — this is the decoder that wedged before.
2. **Live adjust, no reconnect.** RTX 3070 host, throttle network → log `ABR: downshift -> N kbps`, bitrate drops with **no** client "applying quality" reconnect; recovers on upshift.
3. **No dueling controllers.** Client controller idle when `ServerAbrActive` true; still works against ABR-off servers.
4. Build gates: server single-file ninja compile-checks + full link; `flutter analyze` client.
5. **Do not merge to master/main until the MiBox IDR gate passes.** `enable_abr` stays default OFF; flipping the default is a separate follow-up.
