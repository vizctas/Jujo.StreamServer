# Jujo.StreamServer — Task Plan: UX Quick Wins + Tech Debt

**Created:** 2025-01-XX  
**Status:** ACTIVE  
**Scope:** Client UX improvements + critical server-side fixes

---

## Sprint Structure

Tasks grouped by dependency chain. Each task is atomic and independently shippable.

---

## Phase 1: Foundation (Unblocks everything else)

### T01 — Skeleton Loading Widget [DONE]
- **Screen:** Shared/atoms
- **What:** Create `SkeletonLoader` widget (shimmer effect) to replace all `CircularProgressIndicator` in async states
- **Files:**
  - NEW: `lib/shared/widgets/atoms/skeleton_loader.dart`
  - MODIFY: `lib/features/dashboard/dashboard_screen.dart`
  - MODIFY: `lib/features/library/library_screen.dart`
  - MODIFY: `lib/features/system/system_screen.dart`
- **Acceptance:** All `.when(loading:...)` blocks use skeleton instead of spinner
- **Effort:** Small (2-3h)

### T02 — Micro-Animations Infrastructure [DONE] (constants only; page transitions wiring pending)
- **Screen:** Global
- **What:** Add page transition animations + shared element hero transitions
- **Files:**
  - MODIFY: `lib/core/router/app_router.dart` — add `CustomTransitionPage` wrappers
  - NEW: `lib/core/theme/animations.dart` — duration/curve constants
  - MODIFY: `lib/shared/widgets/molecules/metric_tile.dart` — add `AnimatedContainer` on value change
- **Acceptance:** Page transitions are smooth fade/slide; metric tiles animate value changes
- **Effort:** Small (2-3h)
- **Depends on:** None

---

## Phase 2: Dashboard Enrichment

### T03 — Live Stream Health Badge [DONE]
- **Screen:** Dashboard
- **What:** Show animated pulse dot + "LIVE" badge when `/api/stream/health` reports `active_sessions > 0`
- **Files:**
  - NEW: `lib/core/providers/stream_health_provider.dart` — polls `/api/stream/health` every 3s when streaming
  - MODIFY: `lib/features/dashboard/dashboard_screen.dart` — add health badge to Streams MetricTile
  - ~~NEW~~ DONE: `lib/shared/widgets/atoms/pulse_dot.dart` — animated green/yellow/red dot
- **API:** `GET /api/stream/health` → `StreamHealthDto`
- **Acceptance:** Dashboard shows live indicator with health score color (green >70, yellow >40, red ≤40)
- **Effort:** Small (2-3h)
- **Depends on:** T01 (skeleton for loading state)

### T04 — GPU Info Card [DONE]
- **Screen:** Dashboard
- **What:** Dedicated card showing GPU name, temperature gauge, VRAM usage bar, utilization %
- **Files:**
  - MODIFY: `lib/features/dashboard/dashboard_screen.dart` — add GPU card below existing metrics
  - ~~NEW~~ DONE: `lib/shared/widgets/molecules/gpu_card.dart`
- **API:** `GET /api/system/metrics` → `GpuMetrics` (already consumed, just not displayed)
- **Acceptance:** Card shows GPU name, temp with color coding, VRAM bar, usage %
- **Effort:** Small (2h)
- **Depends on:** None

### T05 — Network Sparkline [DONE]
- **Screen:** Dashboard
- **What:** Mini sparkline chart showing last 60 data points of network throughput (bytes sent/recv)
- **Files:**
  - ~~NEW~~ DONE: `lib/shared/widgets/molecules/sparkline_chart.dart` — generic sparkline (reusable)
  - NEW: `lib/core/providers/metrics_history_provider.dart` — ring buffer of last 60 metrics snapshots
  - MODIFY: `lib/features/dashboard/dashboard_screen.dart` — add sparkline to network section
- **API:** `GET /api/system/metrics` (polled, store history client-side)
- **Acceptance:** Smooth animated sparkline updates every poll cycle; shows throughput trend
- **Effort:** Medium (3-4h)
- **Depends on:** None

### T06 — Crash Dump Alert Banner [DONE]
- **Screen:** Dashboard (top banner)
- **What:** Check `/api/health/crashdump` on load; if crash detected, show dismissible warning banner
- **Files:**
  - NEW: `lib/core/providers/crash_dump_provider.dart`
  - NEW: `lib/core/api/services/health_api.dart` — wraps crashdump + vigem endpoints
  - MODIFY: `lib/features/dashboard/dashboard_screen.dart` — conditional banner at top
- **API:** `GET /api/health/crashdump` → `{detected: bool, timestamp, dump_path}`
- **API:** `POST /api/health/crashdump/dismiss`
- **Acceptance:** Banner appears only when crash detected; dismiss persists via API
- **Effort:** Small (2h)
- **Depends on:** None

---

## Phase 3: Streaming Config Enhancements

### T07 — Display Picker [DONE]
- **Screen:** Streaming Config (Advanced > Display tab)
- **What:** Visual display selector showing available monitors with names/resolutions
- **Files:**
  - NEW: `lib/core/api/services/display_api.dart` — wraps `/api/display-devices`
  - NEW: `lib/core/providers/display_devices_provider.dart`
  - MODIFY: `lib/features/streaming/widgets/advanced_display_tab.dart` — add display picker grid
- **API:** `GET /api/display-devices` → list of `{name, id, resolution, primary, hdr_capable}`
- **Acceptance:** User can select capture display from visual grid; selection saved to config
- **Effort:** Medium (3-4h)
- **Depends on:** None

### T08 — Server-Side Adaptive Bitrate [PENDING]
- **Screen:** Streaming Config + Server C++
- **What:** Server monitors drop_rate from stream health; auto-reduces encoder bitrate when degraded
- **Files:**
  - MODIFY: `src/stream.cpp` or `src/webrtc_stream.cpp` — add adaptive logic in media loop
  - MODIFY: `src/stat_trackers.cpp` — expose drop_rate threshold config
  - MODIFY: `lib/features/streaming/stream_config_screen.dart` — show "Server ABR: Active" indicator
- **Config keys:** `adaptive_bitrate_enabled`, `adaptive_min_bitrate`, `adaptive_recovery_delay_ms`
- **Acceptance:** When drop_rate > 5% for 3 consecutive polls, bitrate reduces by 20%; recovers after 10s stable
- **Effort:** Large (6-8h)
- **Depends on:** None (server-side independent)

---

## Phase 4: Library Improvements

### T09 — Game Quick-Launch Button [DONE]
- **Screen:** Library
- **What:** Add play button on game cards; tapping launches game on server
- **Files:**
  - MODIFY: `lib/features/library/library_screen.dart` — add play icon button to game tiles
  - NEW: `lib/core/api/services/app_launch_api.dart` — wraps `POST /api/apps/launch`
  - NEW: `lib/core/providers/app_launch_provider.dart`
- **API:** `POST /api/apps/launch` → `{name: "game_name"}`
- **Acceptance:** One-tap launches game; shows brief "Launching..." toast; error toast on failure
- **Effort:** Small (2h)
- **Depends on:** None

### T10 — Source-Colored Badges [DONE]
- **Screen:** Library
- **What:** Each game shows a colored badge indicating source (Steam=blue, Epic=dark, GOG=purple, Manual=gray)
- **Files:**
  - ~~NEW~~ DONE: `lib/shared/widgets/atoms/source_badge.dart` — colored chip with source icon
  - MODIFY: `lib/features/library/library_screen.dart` — add badge to game tiles
  - MODIFY: `lib/features/library/game_detail_sheet.dart` — show source badge in detail
- **Acceptance:** Each game tile has a small colored badge; consistent across list/grid views
- **Effort:** Small (1-2h)
- **Depends on:** None

### T11 — Batch Game Management [DONE]
- **Screen:** Library
- **What:** Multi-select mode: long-press enters selection; toolbar shows hide/unhide/remove actions
- **Files:**
  - MODIFY: `lib/features/library/library_screen.dart` — add selection state + toolbar
  - NEW: `lib/core/providers/library_selection_provider.dart` — tracks selected game IDs
  - MODIFY: `lib/core/api/services/library_api.dart` — add batch hide/remove methods
- **API:** `POST /api/apps/delete` (existing, accepts list)
- **Acceptance:** Long-press enters multi-select; checkboxes appear; toolbar with count + actions
- **Effort:** Medium (4-5h)
- **Depends on:** T10 (source badges for visual context during selection)

---

## Phase 5: System & Settings

### T12 — Server Health History (Sparklines) [DONE]
- **Screen:** System
- **What:** Store last 120 metrics snapshots (2 min at 1s poll); show sparkline charts for CPU, GPU, RAM
- **Files:**
  - MODIFY: `lib/core/providers/metrics_history_provider.dart` (from T05, extend for system screen)
  - MODIFY: `lib/features/system/system_screen.dart` — add sparkline row for each metric
  - REUSE: `lib/shared/widgets/molecules/sparkline_chart.dart` (from T05)
- **Acceptance:** System screen shows mini charts with 2-min history; auto-scrolls
- **Effort:** Small (2h)
- **Depends on:** T05 (sparkline widget + history provider)

### T13 — Auth Session Manager [DONE]
- **Screen:** Settings > Connection tab
- **What:** Show active login sessions (device, IP, last active); allow revoking individual sessions
- **Files:**
  - NEW: `lib/core/api/services/auth_sessions_api.dart` — wraps GET/DELETE `/api/auth/sessions`
  - NEW: `lib/core/providers/auth_sessions_provider.dart`
  - MODIFY: `lib/features/settings/settings_screen.dart` — add "Active Sessions" section in Connection tab
- **API:** `GET /api/auth/sessions` → list of `{id, device, ip, created_at, last_active_at}`
- **API:** `DELETE /api/auth/sessions/:id` → revoke
- **Acceptance:** Shows session list with device info; swipe-to-revoke or trash icon; current session marked
- **Effort:** Medium (3-4h)
- **Depends on:** None

---

## Phase 6: Server-Side Tech Debt (C++)

### T14 — Split confighttp.cpp [PENDING]
- **Screen:** N/A (server refactor)
- **What:** Break monolithic `confighttp.cpp` into domain-specific handler files
- **Files:**
  - NEW: `src/confighttp_auth.cpp` — auth/login/token endpoints
  - NEW: `src/confighttp_library.cpp` — apps/library/game-sources endpoints
  - NEW: `src/confighttp_system.cpp` — system/metrics/diagnostics/health endpoints
  - NEW: `src/confighttp_webrtc.cpp` — WebRTC signaling endpoints
  - NEW: `src/confighttp_streaming.cpp` — stream config/session endpoints
  - MODIFY: `src/confighttp.cpp` — keep only server bootstrap + route registration
  - MODIFY: `CMakeLists.txt` — add new source files
- **Acceptance:** Each file < 800 lines; all tests pass; no behavior change
- **Effort:** Large (8-10h)
- **Depends on:** None (can be done in parallel)

### T15 — Fix audio_codec API Contract [PENDING]
- **Screen:** N/A (server fix)
- **What:** Either wire `audio_codec` through to actual encoding selection, or reject/ignore with documentation
- **Files:**
  - MODIFY: `src/webrtc_stream.cpp` — `build_audio_config()` should use `options.audio_codec`
  - MODIFY: `src/audio.cpp` — support codec selection when `bypass_opus=false`
- **Decision needed:** Does WebRTC path NEED server-side audio encoding? If always bypass_opus, then:
  - Remove `audio_codec` from API contract
  - Return 400 if client sends unsupported value
- **Acceptance:** API contract matches behavior; no silent field ignoring
- **Effort:** Medium (3-4h)
- **Depends on:** None

### T16 — API Versioning Strategy [PENDING]
- **Screen:** N/A (server architecture)
- **What:** Add `/api/v1/` prefix; keep unversioned routes as aliases for backward compat
- **Files:**
  - MODIFY: `src/confighttp.cpp` — `register_api_route` macro adds both `/api/v1/X` and `/api/X`
  - MODIFY: Flutter client `ApiClient` — use `/api/v1/` prefix
  - NEW: `docs/api-versioning.md` — versioning policy document
- **Acceptance:** All routes accessible at both `/api/X` and `/api/v1/X`; client uses v1
- **Effort:** Medium (4h)
- **Depends on:** T14 (easier after split)

---

## Dependency Graph

```
T01 (Skeleton) ──────────────────────┐
T02 (Animations) ───────────────────┐│
                                    ││
T03 (Stream Health) ←───────────────┘│
T04 (GPU Card) ──────────────────────┤
T05 (Sparkline) ─────────────────────┼──→ T12 (Health History)
T06 (Crash Banner) ──────────────────┤
                                     │
T07 (Display Picker) ────────────────┤
T08 (Server ABR) ────────────────────┤
                                     │
T09 (Quick Launch) ──────────────────┤
T10 (Source Badges) ─────────────────┼──→ T11 (Batch Management)
                                     │
T13 (Auth Sessions) ─────────────────┘

T14 (Split confighttp) ──→ T16 (API Versioning)
T15 (audio_codec fix) ────────────────────────
```

---

## Execution Order (Recommended)

| Week | Tasks | Theme |
|------|-------|-------|
| 1 | T01, T02, T04, T06, T10 | Foundation + quick visual wins |
| 2 | T03, T05, T09, T13 | Dashboard live data + library launch |
| 3 | T07, T11, T12 | Streaming config + library power features |
| 4 | T08, T14, T15, T16 | Server-side improvements |

---

## Completion Criteria (Definition of Done)

For each task:
1. ✅ Code compiles with zero errors (`flutter analyze` clean)
2. ✅ Feature works end-to-end (API → Provider → UI)
3. ✅ Follows existing color extension system (`color_extensions.dart`)
4. ✅ Uses skeleton loading (not spinners) for async states
5. ✅ Responsive on desktop + tablet widths
6. ✅ No hardcoded colors/strings (uses theme tokens)
