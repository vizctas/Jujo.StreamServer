# Critical Risks — Jujo.StreamServer

**Date:** 2025-07-24  
**Source:** Dry-run scenarios 5–9 audit

---

## Remaining Risks (Post-Audit)

| # | Risk | Severity | Affected Scenarios | Fix Effort |
|---|------|----------|-------------------|------------|
| 1 | No "Relay" connection quality badge in stream UI | ⚠️ Medium | 5 | Small — add badge widget |
| 2 | No reconnect logic when phone sleeps mid-stream | ⚠️ Medium | 5 | Medium — session recovery |
| 3 | TURN credential refresh on 401 not verified | ⚠️ Medium | 5 | Small — test + fix if missing |
| 4 | No "Server busy" message for concurrent stream attempts | ⚠️ Medium | 6, 8 | Small — check session limit + show dialog |
| 5 | Invite code expiry not enforced (no `expires_at` column) | ⚠️ Medium | 6 | Small — Supabase migration |
| 6 | Cloud agent backoff on repeated network failures | ⚠️ Low | 7 | Small — verify exponential backoff |
| 7 | Dashboard cloud widgets crash instead of graceful degradation | ⚠️ Low | 7 | Small — try/catch + cached state |
| 8 | `getConfig` at viewer role may expose sensitive fields (passwords) | 🔴 High | 6 | Small — strip sensitive keys for non-admin |

---

## Resolved Risks (Confirmed in Code)

| Risk | Resolution |
|------|-----------|
| Onboarding on second device | `onboarding_provider.dart` checks Supabase profiles → auto-skips |
| Server token refresh after re-login | `cloud_token_sync_provider.dart` pushes to all servers on auth change |
| Role enforcement server-side only | `authorize()` in confighttp.cpp checks `rbac::registry.authorize(user_id, required)` for JWT users |
| Server-side auth for shared users | `check_cloud_jwt_auth()` validates JWT + checks RBAC registry |
| LAN streaming independence from cloud | Session auth is local, no internet dependency |

---

## Priority Action Items

1. **[P0] WoL architecture flaw** — `POST /api/wol` is on the server itself. If server is sleeping, endpoint is unreachable. Fix: Flutter app sends UDP magic packet directly when on same LAN. Remove misleading WoL button when user is remote.
2. **[P0] Strip sensitive config for viewers** — `getConfig` endpoint returns full config including passwords to any authenticated user. Viewers should NOT see `password`, `key`, `token` fields.
3. **[P1] Stream reconnect logic** — no recovery when connection drops mid-stream. Need reconnect overlay + auto-retry.
4. **[P1] TURN credential refresh** — verify `TurnCredentialService` retries on 401/expiry.
5. **[P2] Connection quality badge** — show "Direct" vs "Relay" in stream overlay.
6. **[P2] Server busy dialog** — detect 503/session-limit and show clear message.
7. **[P2] Role-based navigation** — hide Settings/Sharing tabs for viewer role.
