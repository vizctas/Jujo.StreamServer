# Jujo.Stream Flutter App — Epic-Based Planning

**Project:** jujo_stream_app (Flutter migration)  
**Status:** EPICS 1–9 SPRINT-ACTIVE — see Sprint Log below  
**Last Updated:** 2026-05-04

---

## ⚠️ Critical Context for Any AI Picking This Up

### What this app IS
`jujo_stream_app` is the **admin panel** (server-side control frontend) for a custom C++ game streaming server (Sunshine/Apollo fork). It **replaces** the existing Vue 3 web frontend. The app runs on the same machine as the server (or connects to it remotely).

**This app does NOT:**
- Stream video or audio
- Launch games (that's the streaming client)
- Handle codecs, WebRTC, or video pipelines

**This app DOES:**
- Configure the C++ streaming server
- Manage the game library (add/remove/import games)
- Pair client devices via QR or PIN
- Monitor server health and telemetry
- Bundle and deploy the C++ backend with a single button

### The two separate repos
| Repo | Path | Purpose |
|------|------|---------|
| `Jujo.StreamServer` | `C:\Users\Jozh\repos\Jujo.StreamServer` | C++ streaming server + Flutter admin app |
| `jujo.client` | `C:\Users\Jozh\repos\jujo.client` | Moonlight/VibeApollo-based streaming CLIENT (untouched for now) |

The Flutter app in `jujo_stream_app/` communicates with the C++ server via REST at `https://<host>:47990` (self-signed cert, token auth).

### Skill system
This project uses a private skills system at `.private/skills/`. Always invoke the relevant skill before implementing a feature — skills encode project-specific patterns and anti-patterns. See `workflow.md` for the skill map.

---

## Executive Summary

Migrate the Jujo.StreamServer admin frontend from Vue 3 to Flutter, creating a premium multiplatform app (web + desktop + mobile) that manages streaming configuration, game libraries, device pairing, and server telemetry. The C++ backend remains unchanged — Flutter only consumes its REST APIs.

**Expanded vision (post-initial-scope):**
- Flutter bundles the C++ backend — one-click **Deploy** to install the server on a new machine
- Game library **auto-syncs** from Steam / Epic / GOG / Xbox (detect installed games, import posters)
- Google account linking for server discovery (Plex-style) = **FUTURE / post-MVP**

---

## Epic Map

```
EPIC 1:  Foundation & Design System            ✅ DONE
    ↓
EPIC 2:  Core Infrastructure (API + Auth + State) ✅ DONE
    |                              (includes Arch A: multi-server profiles)
    ↓
EPIC 3:  Dashboard & Onboarding                ✅ DONE
    ↓
EPIC 4:  Game Library & Sources                ✅ DONE (OAuth deferred)
    ↓
EPIC 5:  Streaming Configuration               ✅ DONE (adv. controls deferred)
    ↓
EPIC 6:  Device Pairing (QR + PIN)             ✅ DONE
    ↓
EPIC 7:  System & Telemetry                    🔄 ACTIVE (S9 complete — offline banner, recovery)
    ↓
EPIC 8:  Settings & Personalization            ✅ DONE (some tabs deferred)
    ↓
EPIC 9:  Platform Polish & Responsive          ⏳ PENDING
    ↓
EPIC 10: Google Account Discovery (Plex-mode)  ⏸️ FUTURE / post-MVP
    ↓
EPIC 11: Backend Deploy & Auto-Sync            ⏳ PENDING (next focus)
```

---

## EPIC 1: Foundation & Design System [DONE] ✅

**Goal:** Scaffold project, establish design tokens, build atomic component library.  
**Skills:** `flutter-ui-architect`  
**Completion Criteria:** App compiles on web+windows, theme renders correctly, all atoms exist.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 1.1 | Create Flutter project (`flutter create jujo_stream_app`) | [DONE] | — |
| 1.2 | Configure `pubspec.yaml` with all dependencies | [DONE] | 1.1 |
| 1.3 | Implement design tokens (spacing, radius, elevation, breakpoints) | [DONE] | 1.1 |
| 1.4 | Implement color system (dark/light, semantic tokens) | [DONE] | 1.3 |
| 1.5 | Implement typography scale | [DONE] | 1.3 |
| 1.6 | Build `AppTheme` with Material 3 customization | [DONE] | 1.4, 1.5 |
| 1.7 | Build atomic widgets: AppButton, AppIconButton, AppBadge | [DONE] | 1.6 |
| 1.8 | Build molecule widgets: StatusChip, MetricTile, EmptyState | [DONE] | 1.7 |
| 1.9 | Configure GoRouter with shell route (sidebar/bottom nav) | [DONE] | 1.1 |
| 1.10 | Setup folder structure per architecture spec | [DONE] | 1.1 |

---

## EPIC 2: Core Infrastructure [DONE] ✅

**Goal:** API client, auth flow, state management foundation. Also includes Architecture A (multi-server profile support) added during sprint sessions.  
**Skills:** `flutter-api-integration`, `flutter-state-architecture`, `security-risk-auditor`  
**Completion Criteria:** Can login, persist session, make authenticated API calls, switch between multiple server profiles.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 2.1 | Implement `ApiClient` (Dio + interceptors) | [DONE] | 1.1 |
| 2.2 | Implement `AuthInterceptor` (session token injection) | [DONE] | 2.1 |
| 2.3 | Implement `RetryInterceptor` (3 retries, exponential backoff) | [DONE] | 2.1 |
| 2.4 | Implement self-signed cert trust handler | [DONE] | 2.1 |
| 2.5 | Implement `AuthService` + `authProvider` (Riverpod) | [DONE] | 2.1 |
| 2.6 | Implement login screen (username + password) | [DONE] | 2.5, 1.7 |
| 2.7 | Implement secure token storage (`flutter_secure_storage`) | [DONE] | 2.5 |
| 2.8 | Implement server connection screen (manual IP + port) | [DONE] | 2.1, 1.7 |
| 2.9 | Implement mDNS server discovery (LAN scan) | [DEFERRED] | 2.8 |
| 2.10 | Implement `ConnectivityProvider` (online/offline state) | [DONE] | 2.1 |

**Architecture A — Multi-Server Profiles (added in sprints, all DONE):**

| # | Task | Status | File |
|---|------|--------|------|
| A.1 | `ServerProfile` model (id, name, serverUrl, username, token) | [DONE] | `core/models/server_profile.dart` |
| A.2 | `ServerProfilesNotifier` + provider (CRUD, secure storage) | [DONE] | `core/providers/server_profiles_provider.dart` |
| A.3 | `AuthNotifier.switchProfile()` method | [DONE] | `core/providers/auth_provider.dart` |
| A.4 | `LocalServerDetector` service (probes localhost:47990) | [DONE] | `core/services/local_server_detector.dart` |
| A.5 | `_ServerChip` → `ConsumerWidget` with server switcher bottom sheet | [DONE] | `shared/widgets/organisms/app_shell.dart` |
| A.6 | Easy Mode: "This Computer" auto-detect flow in server switcher | [DONE] | `shared/widgets/organisms/app_shell.dart` |
| A.7 | Token sync after login (`updateActiveToken`) | [DONE] | `core/providers/server_profiles_provider.dart` |

---

## EPIC 3: Dashboard & Onboarding [DONE] ✅

**Goal:** Home screen with setup wizard and server status.  
**Skills:** `flutter-streaming-ux`, `flutter-ui-architect`  
**Completion Criteria:** New user sees onboarding; returning user sees dashboard with live status.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 3.1 | Implement `SetupStatusApi` (`GET /api/setup/status`) | [DONE] | 2.1 |
| 3.2 | Implement `SetupStatusProvider` (Riverpod) | [DONE] | 3.1 |
| 3.3 | Build Dashboard screen (ready mode) | [DONE] | 3.2, 1.8 |
| 3.4 | Build Setup Checklist widget (incomplete mode) | [DONE] | 3.2, 1.8 |
| 3.5 | Build Onboarding flow (5-step wizard via real routes) | [DEFERRED] | 3.4 |
| 3.6 | Build MetricTiles (clients, sources, games counts) | [DONE] | 3.2, 1.8 |
| 3.7 | Build ReadinessChecks widget | [DONE] | 3.2 |
| 3.8 | Build "Ready to stream" quick-launch section | [DONE] | 3.3 |

---

## EPIC 4: Game Library & Sources [DONE] ✅

**Goal:** Connect Steam/Epic/GOG/Xbox, display game library with posters.  
**Skills:** `flutter-streaming-ux`, `flutter-api-integration`, `steam-integration-flow`  
**Completion Criteria:** User can connect Steam, see owned/installed games, launch from library.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 4.1 | Implement `GameSourcesApi` service | [DONE] | 2.1 |
| 4.2 | Implement `GameSource` model (DTO) | [DONE] | — |
| 4.3 | Implement `gameSourcesProvider` | [DONE] | 4.1, 4.2 |
| 4.4 | Build Game Sources screen (source cards grid) | [DONE] | 4.3, 1.8 |
| 4.5 | Implement OAuth popup flow (Steam OpenID) | [DEFERRED] | 4.4 |
| 4.6 | Implement sync pipeline UI (progress steps) | [DEFERRED] | 4.4 |
| 4.7 | Implement `LibraryApi` service (`GET /api/apps`) | [DONE] | 2.1 |
| 4.8 | Implement `Game` model (DTO) | [DONE] | — |
| 4.9 | Implement `libraryProvider` | [DONE] | 4.7, 4.8 |
| 4.10 | Build Library screen (poster grid + filters) | [DONE] | 4.9, 1.8 |
| 4.11 | Build Game detail bottom sheet / page | [DEFERRED] | 4.10 |
| 4.12 | Build "Add Manual Game" form | [DEFERRED] | 4.10 |
| 4.13 | Build empty states (no games, no sources) | [DONE] | 4.10 |

---

## EPIC 5: Streaming Configuration [DONE] ✅

**Goal:** Full streaming config UI (casual + advanced modes).  
**Skills:** `flutter-streaming-ux`, `flutter-state-architecture`  
**Completion Criteria:** User can configure encoder, codec, bitrate, resolution, and apply changes.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 5.1 | Implement `ConfigApi` service (`GET/POST /api/config`) | [DONE] | 2.1 |
| 5.2 | Implement `StreamConfig` state model | [DONE] | — |
| 5.3 | Implement `streamConfigProvider` (Notifier) | [DONE] | 5.1, 5.2 |
| 5.4 | Build Casual mode (quality presets: Balanced/Performance/Quality) | [DONE] | 5.3, 1.8 |
| 5.5 | Build Advanced mode (full encoder/codec/bitrate/FEC controls) | [DONE] | 5.3, 1.8 |
| 5.6 | Build encoder selection (NVENC/AMF/QSV/Software auto-detect) | [DONE] | 5.5 |
| 5.7 | Build resolution/FPS picker | [DEFERRED] | 5.5 |
| 5.8 | Build audio config section | [DEFERRED] | 5.5 |
| 5.9 | Build display/capture source selector | [DEFERRED] | 5.5 |
| 5.10 | Implement config validation + apply with restart prompt | [DONE] | 5.3 |

---

## EPIC 6: Device Pairing [DONE] ✅

**Goal:** QR code + PIN pairing with improved UX.  
**Skills:** `flutter-streaming-ux`, `security-risk-auditor`  
**Completion Criteria:** User can pair via QR scan or PIN, manage paired clients.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 6.1 | Implement `PairingApi` service | [DONE] | 2.1 |
| 6.2 | Implement QR code generation (server-side token + connection info) | [DONE] | 6.1 |
| 6.3 | Build Pairing screen (QR display + PIN fallback) | [DONE] | 6.2, 1.8 |
| 6.4 | Build paired clients list (with disconnect action) | [DONE] | 6.1 |
| 6.5 | Build pairing success animation | [DEFERRED] | 6.3 |
| 6.6 | Implement deep-link pairing URL generation | [DEFERRED] | 6.1 |

---

## EPIC 7: System & Telemetry [ACTIVE 🔄 — S9 complete]

**Goal:** System readiness checks, server health monitoring, offline recovery.  
**Skills:** `flutter-streaming-ux`, `flutter-state-architecture`  
**Completion Criteria:** User sees server online/offline status globally; System screen shows readiness checks and recovery options when offline.

| # | Task | Status | Depends On |
|---|------|--------|----------|
| 7.1 | Implement `SystemApi` service (inline in screen) | [DONE] | 2.1 |
| 7.2 | Build System Readiness screen (checks with status/action) | [DONE] | 7.1, 1.8 |
| 7.3 | Build Telemetry dashboard (casual: status card) | [DONE] | 7.1 |
| 7.4 | Build Telemetry dashboard (advanced: charts, metrics) | [DEFERRED] | 7.3 |
| 7.5 | Implement real-time metrics polling (1s interval during stream) | [DEFERRED] | 7.1 |
| 7.6 | Build throughput chart (fl_chart) | [DEFERRED] | 7.4 |
| 7.7 | Build session history log | [DEFERRED] | 7.1 |
| 7.8 | Implement `ServerStatusProvider` (30s polling, online/offline/unknown) | [DONE] | 2.1 |
| 7.9 | Build global `_OfflineBanner` in AppShell (taps → System screen) | [DONE] | 7.8 |
| 7.10 | Build `_OfflinePanel` in System screen (Retry / Start server¹ / Install¹) | [DONE] | 7.8 |

¹ "Start server" and "Install server" actions are scaffolded with "Coming soon" badges — implementation is part of EPIC 11.

---

## EPIC 8: Settings & Personalization [DONE] ✅

**Goal:** Full settings with theme presets and user preferences.  
**Skills:** `flutter-ui-architect`  
**Completion Criteria:** User can change theme, density, and all server settings.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 8.1 | Build Settings screen (tabbed layout) | [DONE] | 5.1, 1.8 |
| 8.2 | Implement theme presets (Jujo Default, Midnight, OLED, Forest, Ember, Light) | [DONE] | 1.6 |
| 8.3 | Build theme picker UI | [DONE] | 8.2 |
| 8.4 | Implement density toggle (compact/comfortable) | [DONE] | 1.3 |
| 8.5 | Build Network settings tab | [DEFERRED] | 5.1 |
| 8.6 | Build Input settings tab | [DEFERRED] | 5.1 |
| 8.7 | Build Advanced settings tab | [DEFERRED] | 5.1 |
| 8.8 | Implement preference persistence (shared_preferences) | [DONE] | 8.2 |

---

## EPIC 9: Platform Polish & Responsive [PENDING]

**Goal:** Adaptive layouts, platform-specific optimizations, animations.  
**Skills:** `flutter-ui-architect`  
**Completion Criteria:** App looks native on web, Windows, macOS, mobile.

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 9.1 | Implement responsive shell (sidebar desktop / bottom nav mobile) | [PENDING] | 1.9 |
| 9.2 | Implement adaptive breakpoint layouts per screen | [PENDING] | 9.1 |
| 9.3 | Add Hero transitions (library → detail) | [PENDING] | 4.10 |
| 9.4 | Add staggered list animations | [PENDING] | 4.10 |
| 9.5 | Add reduced-motion support | [PENDING] | 9.3 |
| 9.6 | Windows: title bar integration | [PENDING] | 1.1 |
| 9.7 | macOS: native menu bar | [PENDING] | 1.1 |
| 9.8 | Web: PWA manifest + service worker | [PENDING] | 1.1 |
| 9.9 | Performance audit (DevTools, frame budget) | [PENDING] | ALL |

---

## EPIC 10: Plex-Mode / Google Account Discovery [FUTURE — post-MVP] ⏸️

**Goal:** Allow users to link their server to a Google account so clients auto-discover it (Plex-style).  
**Skills:** `systems-architecture-lead`  
**Status: INTENTIONALLY DEFERRED.** Do not implement until the core admin panel is production-ready.
**Note:** Requires changes in BOTH `jujo_stream_app` (this repo) AND `jujo.client` (separate repo at `C:\Users\Jozh\repos\jujo.client`).

| # | Task | Status | Depends On |
|---|------|--------|----------|
| 10.1 | Define navigation abstraction (supports D-pad/remote) | [FUTURE] | 9.1 |
| 10.2 | Google account sign-in + server registration hub | [FUTURE] | — |
| 10.3 | Client-side: auto-discover servers linked to account | [FUTURE] | 10.2, jujo.client |
| 10.4 | Server-side: heartbeat to discovery hub | [FUTURE] | 10.2 |
| 10.5 | Keep QR/PIN as fallback (already done) | [DONE] | 6.x |

---

## EPIC 11: Backend Deploy & Platform Auto-Sync [DONE ✅]

**Goal:** Flutter bundles and can deploy the C++ backend. Game library auto-syncs from installed stores.  
**Skills:** `steam-integration-flow`, `systems-architecture-lead`, `flutter-api-integration`  
**Completion Criteria:** User can install/start the C++ server from within Flutter; Steam installed games auto-populate the library.

| # | Task | Status | Depends On |
|---|------|--------|----------|
| 11.1 | **Start server** action in System screen — launch backend process | [DONE] | 7.10 |
| 11.2 | **Install server** action — download + run bundled Sunshine installer | [DONE] | 7.10 |
| 11.3 | Steam local scan — hit `POST /api/game-sources/steam/sync`, show feedback | [DONE] | 4.4 |
| 11.4 | Steam OAuth web login flow (open browser, callback) | [DONE] | 4.4 |
| 11.5 | Epic Games local scan (detect installed via manifest files) | [DONE] | 4.4 |
| 11.6 | GOG local scan | [DONE] | 4.4 |
| 11.7 | Xbox/Game Pass local scan | [DONE] | 4.4 |
| 11.8 | Manual game add form (name + exe path picker) | [DONE] | 4.10 |
| 11.9 | Sync progress UI (step-by-step pipeline with counts) | [DONE] | 11.3 |

---

## Sprint Log (Completed)

| Sprint | Focus | Key Files Changed | Status |
|--------|-------|-------------------| -------|
| S1 | Login screen responsive + auto-detect | `login_screen.dart` | ✅ |
| S2 | Pairing: OTP/QR + PIN legacy + device list | `pairing_screen.dart` | ✅ |
| S3 | Dashboard: live banner, stagger animations | `dashboard_screen.dart` | ✅ |
| S4 | AppShell: three-tier responsive nav | `app_shell.dart` | ✅ |
| S5 | Onboarding: 4-step wizard + router guard | `onboarding/` | ✅ |
| S6 | Platform images: real JPGs as source banners | `game_sources_screen.dart` | ✅ |
| S7 | UX review: 5 fixes (nav, touch targets, a11y) | multiple | ✅ |
| S8 | Game Library: `resolveImageUrl`, Steam CDN | `library_api.dart`, `library_screen.dart` | ✅ |
| Arch A | Multi-server profiles, server switcher | `server_profiles_provider.dart`, `app_shell.dart` | ✅ |
| S9 | Server status polling + offline banner + recovery | `server_status_provider.dart`, `app_shell.dart`, `system_screen.dart` | ✅ |
| S10 | Steam sync progress pipeline + feedback UI | `game_sources_screen.dart` | ✅ |
| S11 | Manual game add form + file picker | `add_game_sheet.dart`, `library_screen.dart` | ✅ |
| S12 | Settings persistence: theme + density via SharedPreferences | `theme_provider.dart`, `app.dart`, `settings_screen.dart` | ✅ |
| S13 | Server deploy: start/stop process + install guidance | `server_process_manager.dart`, `server_process_provider.dart`, `system_screen.dart` | ✅ |
| S14 | OAuth browser open + Epic/GOG/Xbox connect+sync pipeline | `game_sources_screen.dart` | ✅ |

---

## [2026-05-04 17:15] - Debug Windows Post-Login Black Screen

[DONE] Capture static/runtime evidence with `flutter analyze lib` and Windows debug build
[DONE] Trace GoRouter auth redirect and post-login destination
[DONE] Inspect first authenticated screen for blocking async/API failures
[DONE] Implement root-cause fix in auth/API client scope
[DONE] Run `flutter analyze lib` and `flutter build windows --debug`

Verification Evidence:
- `flutter analyze lib` -> No issues found
- `flutter build windows --debug` -> Built `build\windows\x64\runner\Debug\jujo_stream_app.exe`

---

## [2026-05-04 17:38] - Break Windows MouseTracker Login Loop

[DONE] Trace Flutter `MouseTracker` assertion to auth/router transition
[DONE] Remove server connection controls from Login screen
[DONE] Split local app sign-in from server connection flow
[DONE] Debounce GoRouter auth refresh outside pointer update frame
[DONE] Run analyzer and Windows debug build

Verification Evidence:
- `flutter analyze lib` -> No issues found
- `flutter build windows --debug` -> Built `build\windows\x64\runner\Debug\jujo_stream_app.exe`

---

## Dependency Graph (Epics)

```
[1 Foundation] ──→ [2 Infrastructure + Arch A] ──→ [3 Dashboard]
                                                ├──→ [4 Library]
                                                ├──→ [5 Streaming]
                                                ├──→ [6 Pairing]
                                                └──→ [7 System S9]
                                                         ↓
                                                 [8 Settings]
                                                         ↓
                                         [11 Deploy & Auto-Sync]  ←─ NEXT FOCUS
                                                         ↓
                                                [9 Platform Polish]
                                                         ↓
                                          [10 Google Discovery — FUTURE]
```

---

## Quality Gates (Per Epic)

Before marking an epic [DONE]:

- [ ] All tasks pass `flutter analyze` with zero warnings
- [ ] All widgets have at least one widget test
- [ ] All providers have unit tests with mocked dependencies
- [ ] No hardcoded values (colors, spacing, URLs, secrets)
- [ ] Accessibility: all interactive elements ≥ 48x48, semantic labels present
- [ ] Responsive: renders correctly at mobile (375px), tablet (768px), desktop (1440px)
- [ ] Dark + Light mode verified
- [ ] No `print()` statements (use proper logging)

---

## Tech Stack (Locked)

| Layer | Package | Version |
|-------|---------|---------|
| Framework | Flutter | 3.x stable |
| State | flutter_riverpod + riverpod_annotation | ^2.5 |
| Routing | go_router | ^14.x |
| HTTP | dio | ^5.x |
| Models | freezed + json_serializable | latest |
| Secure Storage | flutter_secure_storage | ^9.x |
| Local Prefs | shared_preferences | ^2.x |
| Icons | lucide_icons | latest |
| Charts | fl_chart | ^0.68 |
| QR Generation | qr_flutter | ^4.x |
| QR Scanning | mobile_scanner | ^5.x |
| mDNS | multicast_dns | ^0.3 |
| Animations | flutter_animate | ^4.x |
| Code Gen | build_runner + riverpod_generator | latest |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Mitigation |
|-------------|-----------|
| Vibecoding (random values) | Design token system enforced |
| God widgets (500+ lines) | Max 150 lines per widget file |
| Prop drilling | Riverpod providers |
| Untyped API responses | Freezed models for everything |
| Hardcoded strings | Localization-ready from day 1 |
| Platform-specific hacks | Adaptive widgets via breakpoints |
| Untested state logic | Every notifier has unit tests |
| Deep widget nesting | Extract at 3 levels max |
