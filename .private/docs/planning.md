# Jujo.Stream App — Onboarding Flow

## Date: 2025-01-XX

## Executive Summary
Implement proper onboarding wizard per use case specification. Login requires only username/password. Server connection is deferred to onboarding.

## Tasks

- [DONE] Remove Server Address field from login_screen.dart
- [DONE] Switch login to `loginLocally()` (username+password only)
- [DONE] Implement full onboarding flow:
  - Step 0: Welcome → Deploy Server / Connect Server / Skip
  - Step 1a: Deploy Server (placeholder — coming soon notice)
  - Step 1b: Connect Server (IP + credentials form with test connection)
  - Step 2: Connect Game Libraries (Steam, Epic, Xbox, Manual)
  - Step 3: Done → Go to Dashboard
- [DONE] All steps use design tokens (AppSpacing, AppRadius)
- [DONE] Full project compiles with zero lint issues

## Pending (Future)
- [ ] Deploy Server: Unpack backend + install script + telemetry agent
- [ ] Connect Server: Auto-discover via mDNS/LAN scan
- [ ] Game Sources: Wire up actual Steam/Epic/Xbox OAuth flows
- [ ] Supabase auth integration (replace local dummy auth)
- [ ] Server agent for telemetry (Go/Python lightweight API)

## Architecture Decisions
- Login = app-level identity (no server dependency)
- Server connection = onboarding concern (or settings later)
- Deploy button is a no-op placeholder until backend is packaged
- Connect Server uses `authProvider.login()` to validate + persist serverUrl
- Game Sources step is informational in onboarding; full flow lives in /sources screen
- Skip at any point → marks onboarding complete → goes to dashboard

## Skills Used
- `flutter-ui-architect`: Design tokens, component hierarchy, anti-vibecoding
- `flutter-state-architecture`: Riverpod provider patterns, layer separation
- `flutter-streaming-ux`: Onboarding flow UX patterns, empty states
- `flutter-api-integration`: Server connection pattern, error handling
