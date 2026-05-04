# Workflow: Jujo.Stream Flutter Migration

**Project:** jujo_stream_app  
**Last Updated:** 2026-05-04

---

## ⚠️ Read This First — Project Context for AI Handoff

### What this app actually is
This is **NOT a game streaming client**. It is the **server admin panel** that replaces the Vue 3 frontend of a custom C++ game streaming server (Sunshine/Apollo fork).

```
Jujo.StreamServer (this repo)
├── src/                   ← C++ Sunshine server (unchanged)
└── jujo_stream_app/       ← Flutter admin panel (this is what we're building)

C:\Users\Jozh\repos\jujo.client
└──                        ← Moonlight/VibeApollo-based streaming CLIENT (separate, untouched)
```

### The full user flow
1. User installs Jujo.Stream server (C++ binary) on gaming PC
2. Opens Flutter app — it's the admin panel for that server
3. Connects game sources (Steam/Epic/GOG/Xbox) — server scans for installed games
4. Pairs client devices (phone/tablet/another PC) via QR or PIN
5. Client device (jujo.client) shows the game list and handles actual streaming
6. Flutter app = **management only**, no video/audio streaming

### What Flutter does vs does NOT do
| Flutter DOES | Flutter does NOT |
|---|---|
| Configure server settings | Stream video/audio |
| Manage game library | Launch games |
| Pair client devices | Handle codecs/WebRTC |
| Monitor server health | Replace jujo.client |
| (Future) Deploy C++ backend | Run on the client device |

### Backend
- C++ Sunshine-based server at `https://<host>:47990`
- Self-signed TLS cert — app trusts it via `configureSelfSignedCertTrust()`
- Auth: `POST /api/login` → `{ token }`, Bearer token on all subsequent requests
- Full API contracts in **Key API Contracts** section below

### Auth/API Debug Note
- `AuthNotifier.login()` must use the central `ApiClient`; otherwise real server login cannot execute.
- `ApiClient` must call `configureSelfSignedCertTrust()` so Windows authenticated screens can reach the local HTTPS server.
- The Login screen signs into the Flutter admin app only. Server discovery, deploy, profile switching, and remote server URLs belong inside the authenticated app flow.
- GoRouter auth/onboarding refresh is debounced outside the pointer event frame to avoid Windows `MouseTracker` recursion during route changes.

---

## Active Skills for This Project

Skills live at `.private/skills/<name>.md`. **Always invoke the relevant skill before implementing a feature** — skills encode project-specific patterns, component conventions, and anti-patterns that have been validated during development.

| Skill | File | When to invoke |
|-------|------|---------------|
| `ai-orchestrator` | `.private/skills/ai-orchestrator.md` | Epic tracking, task decomposition, sprint planning |
| `flutter-ui-architect` | `.private/skills/flutter-ui-architect.md` | Design tokens, component library, layout, anti-vibecoding |
| `flutter-state-architecture` | `.private/skills/flutter-state-architecture.md` | Riverpod providers, notifiers, layer separation |
| `flutter-api-integration` | `.private/skills/flutter-api-integration.md` | Dio client, interceptors, API services, cert handling |
| `flutter-streaming-ux` | `.private/skills/flutter-streaming-ux.md` | Pairing flows, stream config UX, telemetry, library |
| `security-risk-auditor` | `.private/skills/security-risk-auditor.md` | Auth, token vault, cert pinning, OWASP |
| `systems-architecture-lead` | `.private/skills/systems-architecture-lead.md` | App architecture, modularity, deployment |
| `steam-integration-flow` | `.private/skills/steam-integration-flow.md` | Game source integration patterns |

---

## Architecture Decision Records

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| ADR-001 | Flutter over Vue/React/Tauri | True multiplatform (web+desktop+mobile+TV), single codebase, Dart performance, Material 3 | 2025-01 |
| ADR-002 | Riverpod over Bloc/Provider | Less boilerplate, compile-safe, better testability, code-gen support | 2025-01 |
| ADR-003 | GoRouter over auto_route | Official Flutter team, shell routes for adaptive nav, deep-link support | 2025-01 |
| ADR-004 | Freezed models over manual | Immutable, copyWith, JSON serialization, union types for sealed classes | 2025-01 |
| ADR-005 | Dio over http package | Interceptors, retry, cancel tokens, form data, better error handling | 2025-01 |
| ADR-006 | Design token system | Anti-vibecoding: no magic numbers, all values from named constants | 2025-01 |
| ADR-007 | Atomic design (atoms→screens) | Reusability, testability, consistent UI across all screens | 2025-01 |
| ADR-008 | Backend unchanged | C++ server is stable; Flutter only consumes REST APIs | 2025-01 |
| ADR-009 | QR pairing as primary | Faster UX than PIN; PIN kept for Moonlight client compat | 2025-01 |
| ADR-010 | Eliminate WebRTC + Playnite | Not needed; streaming uses Moonlight protocol; sources replaced by native adapters | 2025-01 |
| ADR-011 | Multi-server profiles (Arch A) | Users may have multiple servers (home + office); profiles stored in FlutterSecureStorage | 2026-05 |
| ADR-012 | GameDetailSheet = management view, NOT launcher | App is admin panel; jujo.client handles launching | 2026-05 |
| ADR-013 | Server health polling via ServerStatusProvider | 30s interval; global offline banner in AppShell; recovery panel in SystemScreen | 2026-05 |
| ADR-014 | Plex/Google discovery = FUTURE | Requires changes in both jujo_stream_app AND jujo.client; deferred post-MVP | 2026-05 |

---

## Execution Protocol

```
For each sprint/epic task:
  1. Read the task from planning.md
  2. Invoke the relevant skill from .private/skills/
  3. Read existing files before modifying them
  4. Implement ONE task at a time
  5. Run `dart analyze lib/` — must return "No issues found!"
  6. Mark task [DONE] in planning.md
  7. Update Sprint Log in planning.md
  8. Proceed to next task

Important rules:
  - NEVER hardcode values — always use AppSpacing, AppRadius, AppBreakpoints tokens
  - NEVER add print() — use logger
  - Keep widget files under 300 lines, extract sub-widgets if longer
  - Always run `dart analyze` after every change
  - If a file has errors, fix ALL before moving on
```

---

## Current State

**As of 2026-05-04:**

- **Phase:** EPIC 11 — Backend Deploy & Auto-Sync (NEXT)
- **Last sprint completed:** S9 — Server Status Banner + Offline Recovery
- **`dart analyze lib/`:** No issues found ✅
- **Blockers:** None

### Completed work summary
| Sprint/Arch | What was built | Key providers/files |
|-------------|---------------|---------------------|
| S1 | Login screen, responsive, auto-detect button | `login_screen.dart` |
| S2 | Pairing: QR + PIN + device list | `pairing_screen.dart` |
| S3 | Dashboard: live banner, stagger animations | `dashboard_screen.dart` |
| S4 | AppShell: 3-tier responsive (mobile/tablet/desktop) | `app_shell.dart` |
| S5 | Onboarding: 4-step wizard + router guard | `onboarding/` |
| S6 | Platform banners: real JPGs (Steam/Epic/GOG/Xbox) | `game_sources_screen.dart` |
| S7 | UX: 5 fixes (nav, touch, a11y, GoRouter reactive) | multiple |
| S8 | Library: `resolveImageUrl()`, Steam CDN posters | `library_api.dart`, `library_screen.dart` |
| Arch A | Multi-server profiles, server switcher bottom sheet | `server_profiles_provider.dart`, `server_profile.dart` |
| Arch A | `AuthNotifier.switchProfile()` | `auth_provider.dart` |
| Arch A | Local server detection | `local_server_detector.dart` |
| Arch A | Game detail sheet (management view) | `game_detail_sheet.dart` |
| S9 | `ServerStatusProvider` (30s polling) | `server_status_provider.dart` |
| S9 | Global offline banner in AppShell | `app_shell.dart` |
| S9 | Offline panel + recovery actions in System screen | `system_screen.dart` |
| S10 | Sync progress pipeline (4-step) + result feedback | `game_sources_screen.dart` |
| S11 | Manual game add form + file picker | `add_game_sheet.dart`, `library_screen.dart` |
| S12 | Settings persistence: theme + density via SharedPreferences | `theme_provider.dart`, `app.dart`, `settings_screen.dart` |
| S13 | Server deploy: start/stop process + install guidance | `server_process_manager.dart`, `server_process_provider.dart`, `system_screen.dart` |
| S14 | OAuth browser open + Epic/GOG/Xbox connect+sync pipeline | `game_sources_screen.dart` |

### Next sprints
| Sprint | Focus | Key tasks |
|--------|-------|----------|
| S10 | Steam local scan | `POST /api/game-sources/steam/sync` + feedback UI | ✅ |
| S11 | Manual game add | Form: name + exe path picker | ✅ |
| S12 | Settings persistence | `shared_preferences` for all settings | ✅ |
| S13 | Deploy/Start server | Implement 11.1 + 11.2 actions in System screen | ✅ |
| S14 | Epic/GOG/Xbox + OAuth | Generic connect → OAuth → sync pipeline for all stores | ✅ |

**EPIC 11 complete!** 🎉

---

## Key API Contracts (from existing backend)

```yaml
Auth:
  - POST /api/login → { token }
  - POST /api/logout → {}
  - GET /api/sessions → [{ id, client, created }]

Config:
  - GET /api/config → { video: {}, audio: {}, stream: {}, input: {} }
  - POST /api/config → { status: true }
  - POST /api/restart → {}

Apps:
  - GET /api/apps → [{ name, cmd, working-dir, uuid, ... }]
  - POST /api/apps → { status: true }
  - DELETE /api/apps/:index → {}

Game Sources:
  - GET /api/game-sources → { sources: [{ id, name, connected, ... }] }
  - POST /api/game-sources/:id/connect → { authUrl?, message }
  - POST /api/game-sources/:id/sync → { ownedGameCount, installedGameCount }
  - POST /api/game-sources/:id/disconnect → { status: true }

Pairing:
  - POST /api/pin → { status: true } (submit PIN)
  - GET /api/clients → [{ id, name, uuid, ... }]
  - DELETE /api/clients/:id → {}

Setup:
  - GET /api/setup/status → { setupComplete, pairedClientCount, connectedSourceCount, playableGameCount, steps, readiness }

System:
  - GET /api/system/info → { os, gpu, encoder, ... }
```

---

## File Structure (Target)

```
jujo_stream_app/
├── lib/
│   ├── main.dart                          # Entry point
│   ├── app.dart                           # MaterialApp + ProviderScope
│   ├── core/
│   │   ├── api/                           # HTTP layer
│   │   │   ├── api_client.dart
│   │   │   ├── interceptors/
│   │   │   │   ├── auth_interceptor.dart
│   │   │   │   ├── retry_interceptor.dart
│   │   │   │   └── logging_interceptor.dart
│   │   │   └── services/
│   │   │       ├── auth_api.dart
│   │   │       ├── config_api.dart
│   │   │       ├── apps_api.dart
│   │   │       ├── game_sources_api.dart
│   │   │       ├── pairing_api.dart
│   │   │       ├── setup_api.dart
│   │   │       └── system_api.dart
│   │   ├── models/                        # Freezed models
│   │   │   ├── server_info.dart
│   │   │   ├── stream_config.dart
│   │   │   ├── game.dart
│   │   │   ├── game_source.dart
│   │   │   ├── client_device.dart
│   │   │   ├── setup_status.dart
│   │   │   └── system_info.dart
│   │   ├── theme/                         # Design system
│   │   │   ├── tokens/
│   │   │   │   ├── spacing.dart
│   │   │   │   ├── radius.dart
│   │   │   │   ├── elevation.dart
│   │   │   │   ├── breakpoints.dart
│   │   │   │   └── durations.dart
│   │   │   ├── colors.dart
│   │   │   ├── typography.dart
│   │   │   ├── app_theme.dart
│   │   │   └── presets/
│   │   │       ├── jujo_default.dart
│   │   │       ├── midnight.dart
│   │   │       ├── oled.dart
│   │   │       └── forest.dart
│   │   ├── routing/
│   │   │   └── app_router.dart
│   │   ├── providers/                     # Global providers
│   │   │   ├── auth_provider.dart
│   │   │   ├── connectivity_provider.dart
│   │   │   └── server_provider.dart
│   │   └── utils/
│   │       ├── extensions.dart
│   │       └── logger.dart
│   ├── features/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── library/
│   │   ├── game_sources/
│   │   ├── streaming/
│   │   ├── pairing/
│   │   ├── system/
│   │   └── settings/
│   └── shared/
│       └── widgets/
│           ├── atoms/
│           │   ├���─ app_button.dart
│           │   ├── app_icon.dart
│           │   ├── app_text.dart
│           │   └── app_badge.dart
│           ├── molecules/
│           │   ├── status_chip.dart
│           │   ├── metric_tile.dart
│           │   ├── source_card.dart
│           │   └── game_tile.dart
│           └── organisms/
│               ├── setup_checklist.dart
│               ├── library_grid.dart
│               └── stream_config_panel.dart
├── test/
│   ├── core/
│   ├── features/
│   └── shared/
├── web/
├── windows/
├── macos/
├── linux/
├── android/
├── ios/
└── pubspec.yaml
```
