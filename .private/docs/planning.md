# Jujo.StreamServer — Plex Architecture Replication Sprint

**Last Updated:** 2025-07-XX  
**Goal:** "Login on any device, see all your servers" — Plex TV UX for game streaming

---

## Architecture Overview

```
Flutter App ←→ Supabase (control plane) ←→ C++ Server (streaming plane)
     │                                            │
     └── cloud_pair (JWT) ──────────────────────→ │ validates + registers cert
     └── connection_racer (multi-path) ──────────→│ LAN / WAN / TURN
     └── server_status (polling) ────────────────→│ GET /api/server/status
```

---

## Completed Phases

| # | Phase | Key Deliverables |
|---|-------|-----------------|
| 1 | Supabase Auth | Email/password + Google OAuth + captcha fallback + `jujostream://` protocol |
| 2.1–2.5 | Cloud Server Profile Sync | `user_server_profiles` table + RLS + CRUD repo + sync on login/add/remove |
| 2.5 | Multi-path Connection Racer | `ServerConnectionRacer` — races LAN/WAN/TURN, returns fastest |
| 2.6 | Frontend Integration | Server list shows cloud profiles + connection status |
| 3.1 | Cloud Agent (C++) | `cloud_agent.h/cpp` — heartbeat 60s, public IP via ipify/ifconfig/icanhazip |
| 3.1b | Config Integration | `cloud_t` struct in `config.h` — supabase_url/key/user_token/heartbeat_interval |
| 3.1c | Safe Rebranding | Namespace/file renames without breaking build |
| 3.2 | Server Status API | `GET /api/server/status` — uptime, version, sessions, hostname |
| 3.3 | TURN Credential Broker | Supabase Edge Function — HMAC-SHA1 coturn-compatible, 24h TTL |
| 4.0 | Cloud Pairing (Server) | `POST /api/pair/cloud` — JWT validation via Supabase, cert registration |
| 4.1 | Cloud Pairing (Flutter) | `CloudPairService` — sends cert+JWT, injectable cert provider, 7 tests ✅ |
| 3.4 | UPnP/NAT-PMP (pre-existing) | Already implemented in `src/upnp.cpp` — miniupnpc, IPv4+IPv6, periodic refresh, config toggle `upnp` |
| B.2 | Dashboard: Server Status Card | `ServerStatusCard` widget — version, uptime, streaming state, cloud badge, 10s auto-refresh |
| 6.0 | Realtime Server Presence | Supabase Realtime subscription + `last_seen_at`/`is_streaming` heartbeat + fallback polling |
| 5.0 | IGDB Metadata Service | `IgdbMetadataService` — Twitch OAuth + Apicalypse search + cover URLs + token caching, 17 tests ✅ |
| 7.0 | Multi-user Server Sharing | `server_members` table + RLS + invite codes + `ServerSharingService` + role-based access, 21 tests ✅ |

---

## Pending Tasks

| # | Task | Effort | Dependencies | Acceptance Criteria |
|---|------|--------|--------------|---------------------|
| ~~8.0~~ | ~~Streaming Config: Resolution/FPS/HDR/Output~~ | ~~Med~~ | ~~Done~~ | �� Added resolution, FPS, HDR, display output, codec, FEC, encryption to `_AdvancedMode` |
| ~~8.1~~ | ~~Server Sharing UI~~ | ~~Med~~ | ~~Done~~ | ✅ `server_sharing_tab.dart` — create invite, accept invite, members list, role badges, promote/demote/revoke |
| ~~8.2~~ | ~~Server Presence in Server Switcher~~ | ~~Low~~ | ~~Done~~ | ✅ Green/blue presence dot on non-active servers via `serverPresenceByUrlProvider` |
| ~~8.3~~ | ~~Cloud Pair in Pairing Screen~~ | ~~Low~~ | ~~Done~~ | ✅ 3rd tab "Cloud" — JWT + cert pair, requires cloud account, shows status |
| ~~8.4~~ | ~~IGDB Search in Library~~ | ~~Med~~ | ~~Done~~ | ✅ `igdb_search_dialog.dart` — debounced search, cover thumbnails, year/genre/developer, toolbar button |
| ~~9.0~~ | ~~Post-Deploy Bootstrap (C-1 + C-2)~~ | ~~High~~ | ~~Done~~ | ✅ `_bootstrapAfterDeploy()` — auto-connects to localhost:47990, sets credentials, adds profile, pushes cloud config |
| ~~9.1~~ | ~~Email Confirmation Polling (F-1)~~ | ~~Med~~ | ~~Done~~ | ✅ Timer polls every 5s after sign-up, auto-logs in on confirmation, "Resend" button, spinner indicator |
| ~~9.2~~ | ~~UAC Pre-Warning Banner (F-2)~~ | ~~Low~~ | ~~Done~~ | ✅ Shield icon + "Windows will ask for administrator permission" banner above deploy button |
| ~~10.0~~ | ~~Onboarding → Game Sources Navigation (DR4-#1)~~ | ~~Med~~ | ~~Done~~ | ✅ `_finishAndOpenSources()` — completes onboarding + `context.go('/sources')` on any source tile tap |
| ~~10.1~~ | ~~Deploy Error Retry Button (DR3-R3)~~ | ~~Low~~ | ~~Done~~ | ✅ "Try Again" button in error container resets `_deployError` + `_deployStarted` → shows deploy button again |
| ~~11.0~~ | ~~Cloud Token Auto-Sync (DR9-P0)~~ | ~~Med~~ | ~~Done~~ | ✅ `CloudTokenSyncService` — listens `onAuthStateChange`, pushes fresh JWT to all servers on `tokenRefreshed`/`signedIn` |
| ~~11.1~~ | ~~Onboarding Skip for Existing Users (DR8-P1)~~ | ~~Med~~ | ~~Done~~ | ✅ `OnboardingNotifier._load()` checks `user_server_profiles` in Supabase — auto-completes if profiles exist |
| ~~12.0~~ | ~~Shared User Cloud Pairing (DR6-P2 partial)~~ | ~~Med~~ | ~~Done~~ | ✅ `postCloudPair` now queries `server_members` via Supabase REST before rejecting non-owner users. Members can pair. |
| ~~P3~~ | ~~Connection Quality UX Badge~~ | ~~Low~~ | ~~Done~~ | ✅ `_ConnectionBadge` in `ServerStatusCard` — shows LAN/WAN/Relay with color-coded icon + tooltip. `activeConnectionTypeProvider` derived from racer result. 4 new tests. |
| 12.1a | RBAC Engine (Batch 1) | Med | Done | ✅ `src/server_rbac.h/cpp` — `rbac::Registry` singleton, thread-safe, persists `rbac_clients.json`. Role hierarchy: admin > operator > viewer. |
| 12.1b | RBAC Registration on Cloud Pair (Batch 2) | Med | Done | ✅ `postCloudPair` registers user in RBAC registry with role from `server_members` table. Owner=admin, members=their role. |
| ~~12.1c~~ | ~~RBAC Route Guards (Batch 3)~~ | ~~High~~ | ~~Done~~ | ✅ `authorize(response, request, rbac::Role)` in `confighttp.cpp` — session/token=admin, cloud JWT=RBAC lookup, returns 403 JSON on insufficient role. `AuthResult` extended with `user_id` + `auth_source`. |
| ~~12.1d~~ | ~~Cloud JWT Auth Pipeline (Batch 4)~~ | ~~High~~ | ~~Done~~ | ✅ `check_cloud_jwt_auth()` in `http_auth.cpp` — validates JWT via Supabase `/auth/v1/user`, extracts `user_id`, checks RBAC registry. Bearer fallback: API token → cloud JWT. `AuthSource` set on all auth paths (session/basic/bearer/cloud). |

---

## Key Files Reference

### C++ Server (src/)
| File | Purpose |
|------|---------|
| `cloud_agent.h/cpp` | Heartbeat, public IP detection, Supabase sync |
| `confighttp.cpp` | All HTTP API routes including `postCloudPair`, `getServerStatus` |
| `nvhttp.h/cpp` | `cloud_pair()` — cert validation + client registration |
| `config.h/cpp` | `cloud_t` struct — all cloud config keys |
| `globals.h` | `server_start_time` global |

### Flutter (jujo_stream_app/lib/core/)
| File | Purpose |
|------|---------|
| `services/cloud_pair_service.dart` | Client-side cloud pairing (cert + JWT → server) |
| `services/cloud_auth_service.dart` | Supabase auth wrapper (email/Google/signout) |
| `services/server_connection_racer.dart` | Multi-path probe (LAN/WAN/TURN race) |
| `services/server_status_service.dart` | Polling server status + Riverpod providers |
| `services/turn_credential_service.dart` | TURN credential fetch from Edge Function |
| `services/cloud_server_profiles_repository.dart` | Supabase CRUD for server profiles |
| `models/server_profile.dart` | Profile model |
| `models/server_status.dart` | Status model (uptime, version, sessions) |

### Supabase
| File | Purpose |
|------|---------|
| `supabase/migrations/20260701000000_user_server_profiles.sql` | Table + RLS |
| `supabase/functions/turn-credentials/index.ts` | TURN credential broker |

---

## Config Keys (C++ server)

```
cloud_supabase_url      — Supabase project URL
cloud_supabase_key      — Supabase anon/publishable key
cloud_user_token        — Owner's Supabase JWT (for ownership verification)
cloud_heartbeat_interval — Heartbeat period in seconds (default: 60)
```

---

## Security Invariants

- Tokens NEVER leave device → local SecureStorage only
- RLS: `user_id = auth.uid()` on all Supabase tables
- Cloud pairing: server validates JWT server-side via Supabase `/auth/v1/user`
- TURN: HMAC-SHA1 with server-side secret, 24h TTL, 5min safety margin
- No secrets hardcoded — all from config/env
- First device paired gets `_all` permissions; subsequent get `_default`
