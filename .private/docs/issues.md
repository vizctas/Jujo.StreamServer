# Issues Log

## [RESOLVED] Dashboard shows "No server connected" after server reinstall (stale token)

### Symptoms
After reinstalling the server and restarting the app, the dashboard shows "No server connected"
with Deploy/Connect buttons — even though the server is running and reachable.

### Root Cause
Server reinstall wipes `vibeshine_state.json` (session token store). The Flutter app still holds
the old token in `FlutterSecureStorage`. All API calls get 401 → `onTokenExpired()` fires →
token is deleted → both `setupStatusProvider` and `serverStatusPollingProvider` return null →
dashboard renders `_NoServerDashboard`.

For **cloud-account users**: `onTokenExpired()` keeps `AuthStatus.authenticated` (cloud session
is still valid) but clears the server token. GoRouter does NOT redirect to login. User is stuck
on a misleading "No server connected" screen.

### Fix Applied
`dashboard_screen.dart` → `_NoServerDashboard` now detects `hasServerUrl && !hasValidToken`
and renders `_SessionExpiredDashboard` with:
- Clear "Session expired" messaging
- "Log In Again" button → `/login`
- "Connect to Different Server" button → `/settings`

---

## [RESOLVED] Bearer → Session auth header mismatch

**Root cause:** `ServerStatusService` used `Bearer` token format instead of `Session`.
**Fix:** Changed to `Session $_authToken` in `server_status_service.dart`.

---

## [RESOLVED] Dashboard shows only minimal cards — "Connection closed before full header was received"

### Symptoms
```
⛔ X GET https://localhost:47990/api/setup/status (5017ms): null
DioException [unknown]: null
Error: HttpException: Connection closed before full header was received
```
Dashboard falls back to `_ConnectedMinimalDashboard` (ServerStatusCard + quick links only).
Full dashboard (metrics sparkline, live logs, readiness checks, featured games) never renders.

### Root Cause
The C++ `confighttp` HTTPS server (SimpleWeb) used default settings:
- `thread_pool_size = 1` (single-threaded)
- `timeout_request = 5` seconds

When the Flutter app fires multiple concurrent requests on dashboard load
(setup status + server status polling + active streams + featured games),
they queue on the single thread. Any request waiting >5s gets its connection
closed by the server — producing the exact 5017ms error.

### Fixes Applied

**Server-side (`src/confighttp.cpp`):**
- `server.config.thread_pool_size = 4` — handle concurrent API requests
- `server.config.timeout_request = 30` — prevent premature connection close
- `server.config.timeout_content = 600` — allow large responses (logs, library)

**Client-side (Flutter):**

1. **`cert_trust_io.dart`** — Added `0.0.0.0` to `_isPrivateNetwork()` check.
   Without this, if the stored server URL ever contains `0.0.0.0`, the
   `badCertificateCallback` rejects the self-signed cert → TLS handshake fails.

2. **`api_client.dart`** — Added `_normalizeBaseUrl()` that translates
   `://0.0.0.0` → `://localhost`. Applied in constructor and `updateBaseUrl()`.

3. **`server_status_service.dart`** — Same URL normalization + increased
   timeouts from 5s → 10s to survive server-busy scenarios.

4. **`retry_interceptor.dart`** — Added retry on `DioExceptionType.unknown`
   when the error message contains "Connection closed before full header" or
   "Connection reset by peer". These are transient server-busy errors that
   resolve on retry with backoff.

### After rebuild
- Rebuild the C++ server (`cmake --build`) and restart the Windows Service.
- Hot-restart the Flutter app.
- Dashboard should now load the full `_ReadyDashboard` with all widgets.

---

## [IN PROGRESS] Playnite Deactivation — Batch 1: Kill Switch

### Goal
Disable all Playnite integration (IPC, sync, game launch via Playnite) without removing code.
Streaming, Lossless Scaling, and all non-Playnite game launches remain unaffected.

### Changes Applied (2025-05-08)

**`src/config_playnite.h`:**
- Added `bool enabled = false;` master kill switch (defaults to disabled)
- Changed `auto_sync` default from `true` → `false`

**`src/platform/windows/playnite_integration.cpp`:**
- `platf::playnite::start()` returns a no-op `deinit_noop_t` guard when `!config::playnite.enabled`
- No IPC client starts, no background threads, no Playnite process scanning
- All API functions (`is_active()`, `launch_game()`, etc.) return `false` since `g_instance == nullptr`

**`src/process.cpp`:**
- Playnite game launch path: `if (!_app.playnite_id.empty() && _app.cmd.empty() && config::playnite.enabled)`
- Playnite fullscreen path: `if (_app.playnite_fullscreen && config::playnite.enabled)`
- Both paths now skip when disabled → app falls through to Desktop/placebo mode

### What Still Works
- Lossless Scaling (uses `playnite_launcher::lossless::*` namespace but is NOT Playnite-dependent)
- Focus utils (`playnite_launcher::focus::*`) — used for process image path queries
- All non-Playnite game launches (direct cmd, detached processes)
- Virtual display, frame generation, RTSS integration

### What Is Disabled
- Playnite IPC client (named pipe connection to Playnite plugin)
- Auto-sync from Playnite → apps.json
- Game launch via `playnite-launcher.exe --game-id`
- Playnite fullscreen mode
- All `/api/playnite/*` endpoints return empty/inactive responses
- Plugin install/uninstall/update logic (never reached)

### Next Steps (Batch 2-4)
- Rename `playnite_launcher::lossless` → `streaming::lossless` namespace
- Rename `playnite_launcher::focus` → `streaming::focus` namespace
- Remove dead code files (IPC, sync, protocol, plugin)
- Remove `playnite-launcher.exe` build target (keep lossless/focus as library)
- Clean `apps.json` entries with `playnite-id` field (treat as legacy)
