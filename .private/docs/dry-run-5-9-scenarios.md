# QA Dry Run Scenarios — Jujo.StreamServer

**Date:** 2025-07-24  
**Purpose:** Imagined end-to-end user flows to surface gaps before real testing.  
**Status:** Planning only — no code execution.

---

## Scenario 5: Remote Access — Phone Connects to Home PC Over WAN

**Persona:** Existing user, server deployed at home. Now on phone (Android) at a coffee shop on 4G.

### Flow

1. Open Jujo.Stream app on phone
2. App loads → already logged in (Supabase session persisted)
3. Server switcher shows "Gaming PC" with green presence dot (server is online at home)
4. User taps "Gaming PC" to connect
5. `ServerConnectionRacer` starts:
   - LAN probe → **FAILS** (not on same network)
   - WAN probe → tries public IP from `user_server_profiles.wan_ip` → may succeed if UPnP port-forwarded
   - TURN probe → fetches credentials from Edge Function → connects via relay
6. Racer returns fastest successful path (WAN or TURN)
7. App shows Library with Steam games
8. User taps a game → streaming session starts over WAN/TURN

### Potential Issues to Audit

| # | Area | Question | Risk |
|---|------|----------|------|
| 1 | WAN IP staleness | How fresh is `wan_ip` in Supabase? Cloud agent heartbeats every 60s, but what if ISP changed IP 5 min ago? | Connection timeout → falls back to TURN (acceptable) |
| 2 | TURN credential expiry | Edge Function issues 24h TTL. What if phone was sleeping for 25h and cached credential expired? | Need to re-fetch on 401/timeout — does `TurnCredentialService` handle refresh? |
| 3 | NAT hairpin | If user is on same ISP but different subnet (e.g., carrier-grade NAT), WAN IP may route but with high latency | Racer should prefer TURN if WAN latency > threshold |
| 4 | Streaming over TURN | TURN relay adds latency. Is there a quality indicator in the UI? | User may not know why stream is laggy — need "Connection: Relay" badge |
| 5 | Phone goes to sleep mid-stream | Does the streaming session survive? Does the app reconnect? | Need reconnect logic or "Session lost" dialog |
| 6 | Server presence shows green but server is actually unreachable | `last_seen_at` within 2 min but firewall blocks all ports | Racer will fail all paths → need clear "Server unreachable" error, not infinite spinner |

### Expected UX

- Connection racer shows brief "Connecting…" overlay (< 3s for WAN, < 5s for TURN)
- If all paths fail: "Could not reach Gaming PC. Check that the server is running and your network allows connections."
- If TURN: subtle "Relay" badge in stream overlay

---

## Scenario 6: Multi-User — Friend Joins Shared Server

**Persona:** User B received an invite code from User A (server owner). User B has the app installed, has a cloud account, but has never connected to User A's server.

### Flow

1. User B opens app → Dashboard
2. Taps "Accept Invite" (from server sharing tab or a deep link)
3. Enters invite code (6-char alphanumeric)
4. `ServerSharingService.acceptInvite(code)` → Supabase inserts row in `server_members` with `role: 'viewer'`
5. Server profile for User A's server appears in User B's server switcher
6. User B taps the new server → `ServerConnectionRacer` runs
7. Connection established → but User B has `viewer` role
8. Library loads — User B can see games but cannot modify library
9. User B tries to launch a game → streaming session starts (viewers CAN stream)
10. User B tries to add a game manually → **DENIED** (role check)

### Potential Issues to Audit

| # | Area | Question | Risk |
|---|------|----------|------|
| 1 | Invite code expiry | Do invite codes expire? What if User A shared it a month ago? | Need `expires_at` column or max-uses counter |
| 2 | Server-side auth for User B | When User B connects, does the C++ server know about User B? | Cloud pairing only registers the cert — does it check `server_members` for authorization? |
| 3 | Role enforcement location | Is role checked client-side only (Flutter) or server-side too? | **[SECURITY]** If only client-side, User B could bypass with modified client |
| 4 | Profile sync for shared servers | Does User B's `user_server_profiles` get the WAN IP of User A's server? | Need: when invite accepted, copy server's connection details to User B's profile |
| 5 | Presence for shared users | Does User B see User A's server presence (green dot)? | Need: `server_members` RLS allows reading `user_server_profiles` of the owner's server |
| 6 | Concurrent streaming | Can User A and User B stream simultaneously? | Server has session limit — need clear "Server busy" message |

### Expected UX

- Invite acceptance: instant, shows server name + owner avatar
- Server appears in switcher with "Shared" badge
- Role-restricted actions show lock icon + tooltip "Only the owner can modify the library"

---

## Scenario 7: Offline/Degraded — Server Loses Internet Mid-Session

**Persona:** User is streaming a game from their local server (LAN connection). The home internet goes down.

### Flow

1. User is actively streaming via LAN (direct connection, no cloud involved)
2. Home internet drops → server's cloud agent heartbeat fails
3. Supabase `last_seen_at` goes stale (> 2 min)
4. **Streaming continues uninterrupted** (LAN path is independent of internet)
5. Meanwhile, on another device (phone, away from home):
   - Server presence dot turns gray/offline
   - Attempting to connect fails (WAN/TURN both need internet on server side)
6. Internet comes back → cloud agent resumes heartbeat → presence goes green again

### Potential Issues to Audit

| # | Area | Question | Risk |
|---|------|----------|------|
| 1 | LAN streaming independence | Is there ANY dependency on Supabase/internet for active LAN streaming? | If auth token refresh requires internet, session could break after token expiry |
| 2 | Cloud agent crash recovery | If heartbeat fails repeatedly, does cloud agent retry with backoff or crash? | Need exponential backoff, not tight retry loop that burns CPU |
| 3 | Supabase JWT expiry | Server holds `cloud_user_token` — JWTs expire (1h default). Does server refresh? | If token expires and internet is down, server can't refresh → heartbeat permanently broken until restart |
| 4 | Presence flapping | If internet is unstable (drops every 30s), does presence flap green/gray rapidly? | Need hysteresis: only mark offline after 3+ missed heartbeats (3 min) |
| 5 | Reconnect after outage | When internet returns, does cloud agent immediately heartbeat or wait for next interval? | Should force immediate heartbeat on network-change event |
| 6 | Dashboard stale data | If user is on Dashboard (LAN) and internet drops, do cloud-dependent widgets (sharing, presence) show errors? | Need graceful degradation — show cached data with "Cloud unavailable" subtle indicator |

### Expected UX

- LAN streaming: zero interruption regardless of internet state
- Dashboard: cloud widgets show "Offline" badge but don't crash
- Remote devices: clear "Server offline" state, not stuck spinner

---

## Scenario 8: Fresh Install on Second Device — Existing User

**Persona:** User already has account + server deployed on PC. Now installs app on a new laptop to stream FROM the server (as a client).

### Flow

1. Install app on laptop → first launch → Login screen
2. User signs in with existing email/password
3. Email already confirmed → immediate login success
4. Onboarding screen appears — but user already has a server!
5. **Question:** Does onboarding detect existing server profiles in Supabase?
6. If yes: skip deploy/connect steps, show "Welcome back! Your servers are ready."
7. If no: user sees Deploy/Connect options (confusing — they don't want to deploy another server)
8. User's existing server appears in server switcher (synced from Supabase)
9. User taps server → connection racer runs (LAN if same network, WAN/TURN if remote)
10. Library loads → user can stream games from their PC to the laptop

### Potential Issues to Audit

| # | Area | Question | Risk |
|---|------|----------|------|
| 1 | Onboarding on second device | Does `onboardingProvider` check Supabase for existing profiles before showing wizard? | If not, user sees "Deploy Server" on a device that's just a client — very confusing |
| 2 | Profile sync timing | After login, how fast do cloud profiles sync? Before or after onboarding renders? | Race condition: onboarding shows "no servers" because sync hasn't completed yet |
| 3 | Pairing on second device | Does the new laptop need to pair with the server? Or is cloud auth sufficient? | If pairing required, user needs to go through PIN/QR/Cloud pair flow |
| 4 | Certificate per device | Each device has its own cert. Is a new cert generated on first launch? | Need: cert generated → stored in SecureStorage → used for cloud pair |
| 5 | Server permissions for new device | First device got `_all` permissions. Does second device get `_default`? | User may be confused why some features are restricted on laptop |
| 6 | Simultaneous connections | Can both PC (local) and laptop (remote) be connected to the server? | Server may only allow one active stream — need "Another device is streaming" message |

### Expected UX

- Login → "Welcome back, [name]! Your servers:" → shows server list immediately
- Skip onboarding entirely if user has ≥1 cloud profile
- Tap server → pair if needed (cloud pair auto-completes with JWT) → stream

---

## Scenario 9: Token Expiry & Session Recovery

**Persona:** User left the app open overnight. Supabase JWT expired. Server's `cloud_user_token` also expired.

### Flow

1. User opens app in the morning (was backgrounded overnight)
2. App tries to load dashboard → API calls fail with 401
3. Supabase client detects expired session → attempts `refreshSession()`
4. If refresh token valid: new JWT issued → app resumes seamlessly
5. If refresh token also expired (rare, 7-day default): user kicked to login screen
6. Meanwhile, server's `cloud_user_token` expired:
   - Cloud agent heartbeat fails (Supabase rejects stale JWT)
   - Server appears offline in cloud
   - Server continues working locally (LAN streaming unaffected)
7. User logs back in → new JWT → app pushes new token to server via `PATCH /api/config`
8. Server resumes heartbeat with fresh token

### Potential Issues to Audit

| # | Area | Question | Risk |
|---|------|----------|------|
| 1 | Auto-refresh on app resume | Does the app call `refreshSession()` on `AppLifecycleState.resumed`? | If not, user sees errors until they manually interact |
| 2 | Server token refresh mechanism | Who refreshes the server's `cloud_user_token`? The app? The server itself? | Server can't refresh its own token (no refresh_token stored). App must push new token. |
| 3 | Token push after re-login | After user re-authenticates, does the app automatically push new token to server? | If not, server stays "offline" in cloud until user manually triggers config update |
| 4 | Graceful 401 handling | Do API calls show user-friendly errors or raw "Unauthorized"? | Need: interceptor catches 401 → triggers refresh → retries request |
| 5 | Multiple servers token sync | If user has 3 servers, does re-login push new token to ALL of them? | Need: iterate all active profiles and push config to each reachable server |
| 6 | Offline server during token push | If one server is offline when token push happens, it stays with expired token | Need: server should request fresh token from app on next successful connection |

### Expected UX

- App resume: seamless if refresh token valid (user never sees login)
- If re-login required: quick email/password → all servers auto-updated
- Server token staleness: self-healing within one heartbeat cycle after app pushes new token

---

## Cross-Scenario Risk Matrix

| Risk | Scenarios Affected | Severity | Mitigation Status |
|------|-------------------|----------|-------------------|
| Onboarding shows on second device | 8 | 🔴 High | **NOT IMPLEMENTED** — need profile-count check before onboarding |
| Server token refresh gap | 7, 9 | 🔴 High | **PARTIAL** — app pushes on deploy, but not on re-login |
| TURN credential refresh | 5 | ⚠️ Medium | Need to verify `TurnCredentialService` handles expiry |
| Role enforcement server-side | 6 | 🔴 High | **UNKNOWN** — need to audit C++ server for member role checks |
| Connection racer timeout UX | 5, 6, 8 | ⚠️ Medium | Racer exists but error messages may be generic |
| Presence flapping | 7 | ⚠️ Low | Cloud agent has 60s interval — 2-min staleness threshold is reasonable |
| Concurrent stream limit | 6, 8 | ⚠️ Medium | Server likely single-session — need clear UX for "busy" state |
