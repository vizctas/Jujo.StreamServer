# Server Roadmap Follow-ups

**Date:** 2026-07-01
**Context:** Follow-up items from the 2026-07-01 server audit (GPU telemetry parity, library integrity, GPU/encoder visibility — all shipped that session: `Jujo.StreamServer@a3b9e97d,d97deb59,fb99c880`, `jujostream@dbbb62a`, `Jujo.StreamAdmin@390365a`). These are the items found but deliberately not implemented that session, now being worked through.

---

## Status

| Item | Scope | Status |
|------|-------|--------|
| 1. Per-codec capability detail | Server, small | **Backlog — scope was larger than expected, see below** |
| 2. Server-side session history | Server (+ light client wiring) | **Investigated — hook points found, NOT implemented (terminate() re-entrancy risk, needs live verification)** |
| 3. Library maintenance: duplicate detection | Admin | **Done — `aab049f`** |
| 4. Library maintenance: Steam-uninstalled sync | Server + Admin | **Done — Server `9b49c1c2`, Admin `79f46d3`** |
| 5. Library maintenance: apps.json backup/versioning | Server | **Done — `26d58df6`** |
| 6. Rich session telemetry (websocket push) | Server + Client | Pending |
| 7. **ABR extension to classic protocol + all encoders** | Server + Client, cross-repo | **Needs its own design session — not started** |

---

## 1. Per-codec capability detail — CORRECTED SCOPE, larger than first thought

**Original assumption was wrong — verified before implementing.** `validate_encoder()` (`video.cpp:3108`) only probes at a single fixed resolution/fps (`config_max_ref_frames {1920, 1080, 60, ...}` / `config_autoselect {1920, 1080, 60, ...}`). There is **no existing per-codec max-resolution/fps data anywhere** in the probe results to surface — my original "extend the diagnostics endpoint with data the probe already computed" premise doesn't hold.

Getting real max-resolution/fps limits per codec would need genuinely new probe passes (multiple resolutions × multiple fps × 3 codecs), which is slow (each `validate_encoder` call spins up a real encoder session) and would measurably slow server startup/probe time — a much bigger feature than "small, server-only." Alternative (a static hardware-generation capability table, e.g. NVENC-generation → max resolution) needs accurate vendor spec data we can't validate without the hardware, similar caution as the AMD encoder work.

**Not implementing this as originally scoped.** Left as a backlog item pending a real design decision (new probe-pass matrix vs. static table vs. drop it) — do not re-attempt without re-reading this note first.

## 2. Server-side session history — INVESTIGATED, NOT IMPLEMENTED (real re-entrancy risk found)

**Gap:** playtime/session tracking is 100% client-side (`session_history_service.dart`, local SQLite) with no server source of truth.

**Hook points found (verified in code):**
- `proc_t::execute()` (`process.cpp:1295`) is the single canonical entry point for ALL launches — has `launch_session->client_uuid`, `_app.name`/`.id`, and (crucially) `placebo` is fully resolved by the end of the function, so "log session start" would go right before its success return, skipped when `placebo == true`.
- **`placebo == true` safely and correctly excludes Playnite without needing Playnite-specific detection.** Three call sites set it (`process.cpp:1289,2103,2276`): the Remote Input virtual app, the empty-`cmd` "Desktop" launch (whose log line is mislabeled "Playnite launch path complete" even though the actual condition is just an empty `cmd` — a pre-existing inaccuracy in the log message, not something to fix here), and the auto-detach-within-5s case. Skipping all three is a conservative, correct-by-construction way to never touch/depend on Playnite (explicitly out of scope per user instruction) — real Steam/manual game sessions go through the normal non-placebo path and would still be tracked.

**Why NOT implemented this session:** `proc_t::terminate()` (`process.cpp:2396`) is the natural "session end" hook, but it's called from **many places, including from inside `execute()` itself** as a "clean slate" step before a NEW launch starts (`process.cpp:1306,1311`). Naively logging "session end" on every `terminate()` call would log a bogus zero-duration/phantom session on every subsequent launch, not just genuine teardown. Getting this right needs either: (a) a guard that only logs when there was a genuinely-tracked active session before the terminate call (state to design carefully), or (b) instrumenting at a higher level (wherever the RTSP/stream layer signals a real client disconnect/quit, not raw process-group teardown).

This has real runtime-behavior risk that's hard to fully verify by reading code alone — needs either careful design discussion or live-session verification before shipping, similar in spirit to why ABR extension (item 7) needs its own session. Re-attempt with a live MiBox/streaming session available to verify session-start/session-end pairing empirically before trusting the boundary logic.

## 3. Library maintenance: duplicate detection (Admin)

**Gap:** `game_scanner_dialog.dart:944` has a single comment referencing "Deduplicate by inferred name" but no active UI. No detection of duplicate library entries (e.g. a game added both manually and via Steam sync).

**Approach:** Admin-side — compare normalized names (reuse whatever normalization Playnite/RAWG matching already uses client-side, e.g. `_norm()` pattern seen in `app_list_provider.dart` on the Client) across the library list, surface a merge/dedupe UI.

## 4. Library maintenance: Steam-uninstalled-game sync (Server + Admin) — DONE

**Shipped:** `flag_uninstalled_provider_games()` (`confighttp.cpp`, next to `auto_import_installed_provider_games`) runs after every Steam sync, marks `auto_managed` Steam apps whose provider appid is no longer in the fresh installed list with `flagged-uninstalled=true` (clears it if reinstalled), never auto-deletes. Exposed via `flaggedUninstalledCount` in the sync response message and `flaggedUninstalled` in the library games contract. Admin (`GameDto`, `library_screen.dart`) shows an amber "Uninstalled?" badge on flagged games in both grid and list views, mirroring the existing `_NotInstalledBadge` pattern.

## 5. Library maintenance: apps.json backup/versioning (Server) — DONE

**Corrected gap:** a single-slot `.bak` backup already existed, but only in `write_apps_file`'s TOML branch (`apps.toml` is the current default format). The JSON branch (`apps.json`, still live for legacy installs that haven't migrated) had **no backup at all**.

**Shipped:** extracted the existing single-slot backup into `backup_apps_file()` and call it from both branches, so `apps.json` gets the same one-step-back protection `apps.toml` already had. Kept the existing single-slot pattern rather than introducing a new N-deep rotation scheme not used elsewhere in this codebase.

## 6. Rich session telemetry (websocket push)

**Gap:** `/api/stream/health` (`confighttp_streaming.cpp`) is polling-only and WebRTC-session-only (same limitation as ABR below) — no RTT, no per-frame encode time, no negotiated codec/bitrate, and nothing is pushed.

**Approach:** depends partly on item 7's classic-protocol session-health plumbing (if that lands, this can reuse the same data source). Until then, this is blocked on the same "our client doesn't use WebRTC" gap as ABR. **Consider merging into item 7's design session** rather than treating as fully separate — the data source problem is shared.

## 7. ABR extension to classic protocol + all encoders (the big one)

**Not started. Needs a dedicated brainstorming/design session before any code.** Recap of why this is bigger than the other items:

- `abr_controller.cpp`'s `compute_health_score()` currently reads exclusively from `webrtc_stream::list_sessions()`. Our client uses the classic Moonlight protocol (RTSP/ENet), so this needs a parallel health-signal source from the classic protocol's existing loss-stats handler (`IDX_LOSS_STATS`, `stream.cpp:1123-1133`).
- `register_encoder()` only accepts `nvenc::nvenc_base*` — AMD (AMF) and QuickSync have no live bitrate-set hook today; each would need one added (AMF exposes a live bitrate property per the SDK, but this is unvalidated on our end without AMD hardware — same caution as the earlier AMD encoder PR study).
- The client's `dynamic_bitrate_controller.dart` currently reconnects to change quality; only once the server can live-adjust should the client stop doing that — sequencing matters (server capability first, then client behavior change, with a fallback path if the server doesn't support it, for backward compat with older server versions).
- This is genuinely multi-session, cross-repo (Server: session-health plumbing + per-encoder bitrate hooks; Client: stop-reconnecting logic). Do not start implementation without first brainstorming the design (session-health message format, per-encoder API shape, rollout/fallback strategy) — this is exactly the shape of prior work in this repo that went through a proper spec (`docs/superpowers/specs/`) + plan cycle first.
