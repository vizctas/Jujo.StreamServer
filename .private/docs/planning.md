# Jujo.StreamServer — Task Plan: UX Quick Wins + Tech Debt

**Created:** 2025-01-XX  
**Status:** ACTIVE  
**Scope:** Client UX improvements + critical server-side fixes

---

## Handoff para retomar manana (2026-05-10 noche)

### Estado corto
- Admin app compila Windows debug con Supabase defines.
- Server C++ compila y `build/sunshine.exe` quedo linkeado despues de Ninja terminar.
- Supabase index `idx_user_server_profiles_unique_cert_owner` ya fue aplicado en live DB y verificado en Dashboard SQL.
- Trabajo actual no esta terminado funcionalmente hasta instalar/reiniciar el server nuevo y probar registro cloud end-to-end.
- 2026-05-11: root cause for "server Cloud ready but client says 0 cloud servers" found. Server config was saved, but CloudAgent could miss first heartbeat startup and its Supabase payload missed `user_id`, so `user_server_profiles` row could fail RLS/NOT NULL and never appear to client.
- 2026-05-12: second root cause found after DB rows appeared. Server published unusable cloud URLs (`localhost` and IPv6 link-local `fe80::...%scope`), so Android client skipped them and showed `0 cloud servers linked`.

### Comandos utiles
- Run admin app (from Jujo.StreamAdmin repo):
  ```powershell
  cd C:\Users\Jozh\repos\Jujo.StreamAdmin
  flutter run -d windows --dart-define=SUPABASE_URL=https://faadppubtdxjnnvubnsi.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_xSfpJSBypMPXXCWeeYBgVQ_U6gu57NH --dart-define=SUPABASE_EMAIL_REDIRECT_TO=https://vizctas.github.io/jujostream/welcome.html
  ```
- Build admin app (from Jujo.StreamAdmin repo):
  ```powershell
  cd C:\Users\Jozh\repos\Jujo.StreamAdmin
  flutter build windows --debug --dart-define=SUPABASE_URL=https://faadppubtdxjnnvubnsi.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_xSfpJSBypMPXXCWeeYBgVQ_U6gu57NH --dart-define=SUPABASE_EMAIL_REDIRECT_TO=https://vizctas.github.io/jujostream/welcome.html
  ```
- Build server:
  ```powershell
  cd C:\Users\Jozh\repos\Jujo.StreamServer
  cmake --build build --target sunshine -j 4
  ```
- Verify cloud profile row:
  ```sql
  select user_id, server_name, server_url, cert_fingerprint, last_seen_at, updated_at
  from public.user_server_profiles
  order by updated_at desc
  limit 10;
  ```

### Cambios importantes hechos

#### Cloud server registration
- Added `jujo_stream_app/lib/core/services/cloud_server_registration_service.dart`.
- Service pushes these keys to active server through `/api/config`: `cloud_supabase_url`, `cloud_supabase_key`, `cloud_user_token`, `cloud_heartbeat_interval`.
- App now calls `/api/restart` after cloud registration even if PATCH says no restart required.
- Reason: cloud agent starts heartbeat on server startup; hot config alone is not enough for reliable first registration.

#### Pairing page UX
- Modified `jujo_stream_app/lib/features/pairing/pairing_screen.dart`.
- Cloud tab now detects `serverStatusPollingProvider.valueOrNull?.cloudConfigured`.
- If cloud inactive: shows `Register Server in Cloud`.
- If cloud active: enables `Pair via Cloud`.
- Success message separated: register success != pair success.

#### Dashboard UX
- Modified `jujo_stream_app/lib/features/dashboard/dashboard_screen.dart`.
- Ready dashboard shows `Cloud not active` banner only when cloud user has active server and server reports `cloudConfigured == false`.
- Banner CTA registers server directly.
- Solves "missed onboarding cloud register" path.

#### Server cloud identity
- Modified `src/main.cpp` and `src/cloud_agent.cpp`.
- Cloud heartbeat now fills `ServerIdentity.cert_fingerprint`.
- Fingerprint = SHA256 hash of server cert PEM at `config::nvhttp.cert`.
- Reason: DB unique owner rule depends on non-empty `cert_fingerprint`.
- CloudAgent now extracts `sub` from Supabase JWT and sends it as `user_id` in the `user_server_profiles` upsert.
- CloudAgent now logs rejected Supabase POST response body for RLS/schema debugging.
- Server cloud LAN detection now rejects loopback/link-local addresses and prefers IPv4 LAN discovered through UDP route probing, so expected cloud URL becomes `https://192.168.x.x:47990`.

#### Client cloud sync
- Modified `C:\Users\Jozh\repos\jujo.client\lib\services\cloud\jujo_cloud_service.dart`.
- Client now ignores link-local `fe80::*` cloud hosts.
- Client now builds all cloud admin route candidates: canonical `server_url`, usable `local_addresses`, and WAN `external_address`.
- Modified `C:\Users\Jozh\repos\jujo.client\lib\providers\computer_provider.dart`.
- Cloud sync now attempts cloud pairing automatically for imported unpaired cloud servers.
- Cloud sync now probes/races LAN and WAN candidates, chooses the first live route, stores that winning admin URL on the computer profile, and falls back to the first candidate as offline if no route responds.
- Modified `C:\Users\Jozh\repos\jujo.client\lib\services\http_api\nv_http_client.dart`.
- HTTP URL builder now brackets IPv6 literals before adding ports.
- Built Android debug APK with Supabase defines: `C:\Users\Jozh\repos\jujo.client\build\app\outputs\flutter-apk\app-debug.apk`.

#### Dashboard runtime UX fixes
- Compact `JujoLineChart` now removes legend/axes when embedded in dashboard metric tiles, fixing Activity/System sparkline overflow/no-line behavior.
- Dashboard readiness card hides `Client paired` because pairing is optional, not a readiness blocker.
- Hardened profile update paths against `Bad state: No element` when a profile disappears before async cloud push.

#### One-owner DB rule
- Added `jujo_stream_app/supabase/migrations/20260705000000_unique_server_owner.sql`.
- Live DB already has unique index `idx_user_server_profiles_unique_cert_owner`.
- Meaning: one physical server cert can belong to one account only.
- Extra accounts must use `server_members` invitation flow.

#### Steam disconnect purge
- Modified `src/confighttp.cpp`.
- `purge_provider_apps_for_source()` now uses `provider_app_matches_source()`.
- Purges normal source tags, camel `sourceId`, and legacy Steam autosync apps with `steam://rungameid/`.
- Goal: Steam disconnected = Steam autosync games removed from library.

#### 2FA/TOTP UX
- Modified `jujo_stream_app/lib/features/security/cloud_mfa_gate_screen.dart`.
- Replaced full text field with six OTP boxes backed by one numeric hidden input.
- Auto-submit when 6 digits entered.
- Maintains setup QR + secret flow.

#### Config restart behavior
- Modified `src/confighttp_streaming.cpp`.
- Cloud config keys now marked restart-required: `cloud_supabase_url`, `cloud_supabase_key`, `cloud_user_token`, `cloud_heartbeat_interval`.
- Reason: cloud heartbeat thread does not start if server booted without cloud config.

### Validation already done
- `flutter analyze --no-fatal-infos lib` passed.
- `flutter build windows --debug ...` passed.
- `cmake --build build --target sunshine -j 4` completed and linked `sunshine.exe`.
- Supabase unique index verified in Dashboard SQL result.
- Note: `flutter analyze lib` without `--no-fatal-infos` exits non-zero because existing `avoid_print` infos are fatal by config.

### Retomar: orden recomendado
1. Install or deploy newest server binary. Must use server built after `src/main.cpp` fingerprint patch.
2. Start admin app with Supabase defines.
3. Login as cloud user.
4. If dashboard shows `Cloud not active`, press `Register`.
5. Wait server restart plus 30-60 seconds heartbeat.
6. Query Supabase `user_server_profiles`.
7. Expected: current account row, non-empty `cert_fingerprint`, recent `last_seen_at`, real `server_name`, not `LOCALHOST`.
8. Open Pairing page. Expected after registration: `Pair via Cloud` enabled.
9. Cloud pair. Expected: no "Cloud sync is not configured".
10. Open client with same Supabase account. Expected: server appears after cloud sync.
11. Test Steam disconnect. Expected: Steam autosync games gone, manual games remain.

### Still missing / not done

#### Must do next
- Live E2E cloud register test from Dashboard and Pairing page.
- Confirm heartbeat writes non-empty `cert_fingerprint`.
- Confirm client retrieves cloud server after login.
- Confirm cloud pair succeeds after server registration.
- Confirm installed server uses newest binary, not stale build.

#### UX still pending
- Onboarding fullscreen intro.
- Always-visible login/logout affordance in client.
- Gamepad-first focus pass for login/cloud dialogs.
- Friendly duplicate-owner error in admin app when DB unique index rejects registration.
- Better cloud registration success state after restart: show "Server restarting, checking cloud status..." with polling.

#### Cloud/server architecture pending
- Invitation flow needs real UX polish.
- `server_members` sharing must be connected to client sync/user role in a full path.
- One-owner rule enforced by DB index on cert fingerprint, but user-facing conflict error still generic.
- Need decide if server cert fingerprint is stable enough across uninstall/reinstall.
- Better future: stable server UUID or claim token stored outside normal uninstall.

#### Client integration pending
- Confirm `jujo.client` uses same Supabase URL/key.
- Confirm client reads `user_server_profiles`.
- Confirm posters/art URLs still resolve after server profile cloud sync.
- Add Logout on client side if still missing.
- Cloud chip over server card needs final visual QA.

#### Dashboard pending
- Fullscreen dashboard still needs density/layout pass.
- Avoid scroll-heavy "dashboard" feel on large screens.
- 2026-05-12 dashboard fix pass: root cause for repeated `Bad state: No element` is `JujoLineChart` iterating lazy `Path.computeMetrics()` twice during dashboard repaints. Fixed by materializing metrics once before `.first`.
- 2026-05-12 dashboard fix pass: promoted Game Sources, System, Pairing, Force Close, Disconnect All, and Restart Server to top dashboard command area so primary operations are visible before telemetry cards.
- 2026-05-12 readiness fix pass: Controller driver and Virtual display readiness were hardcoded to `warning` in `build_system_readiness()`. They now read actual ViGEm install state and virtual display driver status.

#### Game sources pending
- Steam sync after reinstall still suspect: user had to logout/login Steam before games came back.
- Need debug source state vs credential/session cache.
- Acceptance: `Sync` button reimports games when Steam connected, no logout required.

#### Server/client permission management pending
- Pairing page should become client management center.
- Need stylish paired-client cards/list.
- Need per-client RBAC toggles.
- Need global `auto_trust_cloud_clients` toggle surfaced.
- Legacy small card behavior exists conceptually, but new UX not complete.

### Known risks
- C++ build can exceed short tool timeout; use 10 min timeout or wait for Ninja.
- Supabase CLI not installed; DB migration was applied through Dashboard SQL.
- Current working tree has unrelated existing edits from previous tasks. Do not reset.

---

## Execution Test Fix Pass (2026-05-11)

### E01 — Dashboard Activity Chart [DONE / LIVE VALIDATION PENDING]
- **Issue:** Activity line looked missing under Lazy Ankui.
- **Root cause:** Activity chart records active stream count. Idle server produces all-zero values, and `JujoLineChart` skipped paint when max value was `0`.
- **Change:** `JujoLineChart` now uses minimum max value `1.0`, so idle data draws a flat baseline instead of disappearing.
- **Change:** Dashboard activity chart now passes explicit high-contrast theme primary color and 2px stroke.
- **Files:** `jujo_stream_app/lib/shared/widgets/molecules/line_chart_widget.dart`, `jujo_stream_app/lib/features/dashboard/widgets/metrics_sparkline_card.dart`
- **Verify:** Open dashboard idle for 20+ seconds. Expected: flat line visible, not blank.

### E02 — Steam Disconnected But Games Still Visible [DONE / LIVE VALIDATION PENDING]
- **Issue:** Steam showed disconnected, but Steam games stayed in library.
- **Root cause:** Server treated store app count as source connection. Library builder also emitted store games from apps/state even when source was not connected.
- **Change:** Store source connected state now comes from persisted source auth state only (`connected`, `connectionState == connected`, or `tokenEncrypted`), not from game count.
- **Change:** `/api/library/games` now excludes disconnected store source entries from both `apps.json` and stored `source_state.games`.
- **Change:** Dart `GameSourceDto.connected` no longer derives connected from game counts.
- **Files:** `src/confighttp.cpp`, `jujo_stream_app/lib/core/api/services/game_sources_api.dart`
- **Verify:** Boot server with Steam disconnected. Expected: Steam source disconnected and no Steam games in library.
- **Risk:** If Steam auth state is lost on boot, this will hide Steam games until auth state is restored. That is intended by UX but must be tested for persistence.

### E03 — Game Sources Page Slow [DONE / LIVE VALIDATION PENDING]
- **Issue:** Game Sources page took too long to complete.
- **Root cause:** `GET /api/game-sources` read and scanned full apps library just to build source summary.
- **Change:** `getGameSources()` now builds summary from persisted source state without reading full apps array.
- **Files:** `src/confighttp_library.cpp`
- **Verify:** Open Game Sources. Expected: cards appear faster; counts come from persisted sync state.

### E04 — Dashboard Buttons Unprofessional [DONE / LIVE VALIDATION PENDING]
- **Issue:** Quick links and server actions had inconsistent button sizes/layout.
- **Root cause:** Dashboard used ad-hoc `_QuickLink` containers and compact `_ActionChip` buttons, sized by label inside wraps.
- **Change:** Added shared `DashboardActionButton` with fixed height, consistent icon slot, Material 3 `OutlinedButton`, unified padding, state colors.
- **Change:** Added `_DashboardActionGrid` for equal-width responsive layout.
- **Files:** `jujo_stream_app/lib/features/dashboard/dashboard_screen.dart`
- **Verify:** Dashboard side panel. Expected: Game Sources/System/Pairing and Force Close/Disconnect All/Restart Server align to same button rhythm.

### Validation for this pass
- `dart format` applied to touched Dart files.
- `flutter analyze --no-fatal-infos lib` passed; only existing `avoid_print` infos remain.
- `flutter build windows --debug ...` passed.
- `cmake --build build --target sunshine -j 4` passed and linked `sunshine.exe`.

### Next test order
1. Install/deploy newest `sunshine.exe`.
2. Run admin app.
3. Check dashboard Activity line visible while idle.
4. Check dashboard buttons in Lazy Ankui and other active theme.
5. Open Game Sources and measure perceived load.
6. Boot with Steam disconnected: verify no Steam games in Library.
7. Connect Steam and sync: verify games appear.
8. Disconnect Steam: verify games disappear and source remains disconnected after app/server restart.

---

## Current Cloud/Register Fix Pass (2026-05)

### C01 — Steam Disconnect Purge [READY FOR LIVE VALIDATION]
- **Problem:** Steam disconnected but auto-imported games stayed in library.
- **Fix:** Disconnect purge now removes current source tags plus legacy Steam `steam://rungameid` autosync entries.
- **Next:** Validate disconnect removes Steam imported apps without deleting manual non-Steam entries.

### C02 — Cloud Register From Dashboard + Pairing [READY FOR LIVE VALIDATION]
- **Problem:** Pairing page tried cloud pair against a server with no cloud config.
- **Fix:** Add server registration action before cloud pair; expose same action on dashboard when cloud is inactive.
- **Next:** Validate register writes cloud config, restarts server, heartbeat creates cloud profile, then cloud pair succeeds.

### C03 — 2FA OTP UX [READY FOR LIVE VALIDATION]
- **Problem:** TOTP used one normal input box.
- **Fix:** Replace with six OTP boxes backed by one numeric input.
- **Next:** Validate setup and verify flows on Windows and Android.

### C04 — One Owner Per Server [DB APPLIED / SERVER VALIDATION PENDING]
- **Problem:** Same physical server could be registered by more than one account.
- **Fix:** Supabase unique index on `cert_fingerprint` applied; server now publishes `cert_fingerprint`; shared access remains through `server_members`.
- **Next:** Validate live row has non-empty fingerprint and add friendly duplicate-owner message after API returns conflict.

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

## Phase 7: Security & Permission Management

### T17 — Mandatory 2FA on Every Login [PENDING]
- **Screen:** Cloud Login Flow
- **What:** Enforce MFA challenge on every explicit login unless 'remember me' is checked. If 'remember me' is used, respect the long-lived refresh token.
- **Files:**
  - MODIFY: `jujo_stream_app/lib/core/providers/auth_provider.dart`
  - MODIFY: `jujo_stream_app/lib/features/security/cloud_mfa_gate_screen.dart`
- **Acceptance:** Entering credentials always triggers MFA challenge. 'Remember me' skips credentials + MFA on next cold start.
- **Effort:** Small (2-3h)
- **Depends on:** None

### T18 — Server Global Auto-Trust Policy [DONE]
- **Screen:** Server C++
- **What:** Add server config option `auto_trust_cloud_clients` (default `false`). When true, newly paired cloud clients get `Role::admin` automatically instead of `Role::viewer`.
- **Files:**
  - MODIFY: `src/config.h` & `src/config.cpp` (add `auto_trust_cloud_clients`)
  - MODIFY: `src/server_rbac.cpp` (apply logic in `register_client` if new)
  - MODIFY: `src/confighttp.cpp` / `src/http_auth.cpp`
- **Acceptance:** Default behavior keeps new clients as viewers. When config is true, new clients become admins.
- **Effort:** Small (1-2h)
- **Depends on:** None

### T19 — Clients Permission UI [PENDING]
- **Screen:** Settings > Clients tab (or Server Dashboard) User review: Do it on PAIRING PAGE. 
- **What:** A page to view all connected/paired clients and modify their RBAC permissions. Includes toggle for the global `auto_trust_cloud_clients` policy.
- **Files:**
  - NEW: `jujo_stream_app/lib/features/settings/clients_permissions_screen.dart`
  - NEW: `jujo_stream_app/lib/core/providers/rbac_provider.dart`
  - NEW: `jujo_stream_app/lib/core/api/services/rbac_api.dart` (wraps GET/POST `/api/rbac/clients`)
  - MODIFY: `jujo_stream_app/lib/features/settings/settings_screen.dart`
- **API:** `GET /api/rbac/clients` & `POST /api/rbac/clients/update`
- **Acceptance:** Displays all clients. Admin can change roles. Global auto-trust toggle syncs with server config.
- **Effort:** Medium (4-5h)
- **Depends on:** T18

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

T17 (Login 2FA) ─────────────────────┤
T18 (Auto-Trust Policy) ─────────────┼──→ T19 (Clients Permission UI)
```

---

## Execution Order (Recommended)

| Week | Tasks | Theme |
|------|-------|-------|
| 1 | T01, T02, T04, T06, T10 | Foundation + quick visual wins |
| 2 | T03, T05, T09, T13 | Dashboard live data + library launch |
| 3 | T07, T11, T12 | Streaming config + library power features |
| 4 | T08, T14, T15, T16 | Server-side improvements |
| 5 | T17, T18, T19 | Security hardening & Client Permissions |

---

## Completion Criteria (Definition of Done)

For each task:
1. ✅ Code compiles with zero errors (`flutter analyze` clean)
2. ✅ Feature works end-to-end (API → Provider → UI)
3. ✅ Follows existing color extension system (`color_extensions.dart`)
4. ✅ Uses skeleton loading (not spinners) for async states
5. ✅ Responsive on desktop + tablet widths
6. ✅ No hardcoded colors/strings (uses theme tokens)
