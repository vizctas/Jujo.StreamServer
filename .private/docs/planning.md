# Server Deploy Flow — Forensic Analysis

**Date:** 2025-01-XX  
**Status:** [DONE] All critical bugs fixed  

---

## Executive Summary

The server deploys correctly (files copied, Windows Service registered and started), but the Flutter app **cannot communicate** with it due to **3 critical bugs** in the client-side code.

---

## Root Cause Analysis

### Bug 1: [CRITICAL] Login endpoint mismatch → 404

| Component | Path Used |
|-----------|-----------|
| Flutter `auth_provider.dart` | `POST /api/login` |
| C++ server `confighttp.cpp` | `POST /api/auth/login` |

**Impact:** Every login attempt from the Flutter app returns `404 Not Found`. This is the `{error: not found, status code: 404}` you see when opening the server URL.

**File:** `jujo_stream_app/lib/core/providers/auth_provider.dart` line ~131

---

### Bug 2: [CRITICAL] Onboarding deploy is hardcoded as "coming soon"

In `onboarding_screen.dart`, the deploy step (`_buildDeployStep`) shows a static info card:

```dart
'This feature is coming soon.\n'
'The backend packaging and telemetry agent are still in development.',
```

It never calls `ref.read(serverProcessProvider.notifier).deploy()`. The `_deployStarted` field is `final bool _deployStarted = false;` — it's never mutated.

**Impact:** Onboarding "Deploy Server" path does nothing. User must navigate to the dedicated `/deploy` screen manually.

---

### Bug 3: [MODERATE] Server status probe succeeds but auth fails → "unreachable"

The `server_status_provider.dart` probes `GET /api/config`. This endpoint **requires authentication** on the C++ server when credentials are configured. The probe uses `Dio` directly (no auth headers), so:

- If credentials are configured → server returns `401`
- The probe's `validateStatus: (_) => true` accepts 401 as "online" ✓

However, the **dashboard** (`setupStatusProvider`) calls `GET /api/setup/status` which also requires auth. Since the Flutter app's login uses the wrong endpoint (`/api/login` → 404), the app never obtains a valid session token. All subsequent authenticated API calls fail.

**Flow:**
1. Deploy succeeds → service starts → server listens on port 47990
2. `_autoConfigureAndProbe()` sets URL to `https://localhost:47990`
3. Status probe hits `/api/config` → gets 401 → `validateStatus: (_) => true` → marks as **online** ✓
4. Dashboard calls `/api/setup/status` with invalid token → gets 401 → `setupStatusProvider` returns null �� shows "Unable to reach server"
5. Stream config calls `/api/config` with invalid token → gets 401 → shows error

---

### Bug 4: [MINOR] ServerProcessManager.start() vs Windows Service conflict

After deploy, the server runs as a **Windows Service** (`Jujo.Server`). But `ServerProcessManager.start()` tries to launch `sunshine.exe` as a **detached process**. If the service is already running, this creates a port conflict (both try to bind port 47990).

The `_OfflinePanel` shows "Stop server" when `processStatus.isRunning`, but `ServerProcessNotifier._init()` only checks if the exe exists (`_manager.isInstalled`), not if the service is actually running. After deploy, state is `stopped` (exe exists but `_manager.isRunning` is false because no `Process` object was tracked).

---

## Fix Plan

| # | Task | File | Priority |
|---|------|------|----------|
| 1 | Fix login endpoint: `/api/login` → `/api/auth/login` | `auth_provider.dart` | P0 |
| 2 | Wire onboarding deploy to actually call `serverProcessProvider.notifier.deploy()` | `onboarding_screen.dart` | P0 |
| 3 | After deploy, auto-login or skip auth for initial setup | `server_process_provider.dart` | P1 |
| 4 | Detect Windows Service state via `sc.exe query Jujo.Server` | `server_process_manager.dart` | P1 |

---

## Port Mapping Reference

```
Base port (config): 47989
confighttp::PORT_HTTPS = +1 → 47990 (Web UI / API)
nvhttp::PORT_HTTP = 0 → 47989
nvhttp::PORT_HTTPS = -5 → 47984
```

The Flutter app correctly targets `https://localhost:47990`.
