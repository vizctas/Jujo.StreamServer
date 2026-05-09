# Jujo.StreamServer — Deep Architecture Study & Improvement Roadmap

**Date:** 2025-01-XX  
**Scope:** Full-stack analysis (C++ server + Flutter client + Supabase cloud)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [API Surface Audit](#2-api-surface-audit)
3. [Streaming Performance & Optimizations](#3-streaming-performance--optimizations)
4. [Client UX Quick Wins](#4-client-ux-quick-wins)
5. [New Features to Offer Clients](#5-new-features-to-offer-clients)
6. [Cloud Architecture Improvements](#6-cloud-architecture-improvements)
7. [Security & Hardening](#7-security--hardening)
8. [Visual / Eye-Catchy Improvements](#8-visual--eye-catchy-improvements)
9. [Technical Debt & Code Health](#9-technical-debt--code-health)
10. [Priority Matrix](#10-priority-matrix)

---

## 1. System Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  CLOUD LAYER (Supabase)                                         │
│  ├── user_server_profiles (cross-device sync)                   │
│  ├── server_members (multi-user sharing + RBAC)                 │
│  ├── realtime_presence (online status)                          │
│  └── Edge Functions (future: relay, TURN credentials)           │
├─────────────────────────────────────────────────────────────────┤
│  CLIENT LAYER (Flutter — jujo_stream_app)                       │
│  ├── Auth (local + cloud/Supabase)                              │
│  ├── Server Management (deploy, status, WoL)                    │
│  ├── Game Library (sources, sync, art)                          │
│  ├── Streaming Config (presets + advanced 7-tab)                │
│  ├── Pairing (OTP/QR + PIN + Cloud)                             │
│  ├── System Monitoring (metrics, diagnostics, health)           │
│  └── Server Sharing (invite codes, RBAC)                        │
├─────────────────────────────────────────────────────────────────┤
│  SERVER LAYER (C++ — Sunshine fork)                              │
│  ├── confighttp (102 REST endpoints + WebRTC signaling)         │
│  ├── nvhttp (Moonlight/GameStream protocol)                     │
│  ├── stream/rtsp (classic media transport)                      │
│  ├── webrtc_stream (browser-based streaming)                    │
│  ├── video/audio capture + encode (NVENC/FFmpeg)                │
│  ├── input injection (keyboard/mouse/gamepad)                   │
│  ├── game_sources (library management, TOML)                    │
│  ├── cloud_agent (heartbeat to Supabase)                        │
│  ├── server_rbac (role-based access)                            │
│  └── system_metrics (CPU/GPU/RAM/Network telemetry)             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Stats
- **102 registered API routes** on the server
- **11 API service files** in the Flutter client
- **10 feature screens** in the app
- **4 Supabase migrations** (cloud schema)
- **3 streaming paths**: Classic RTSP, WebRTC (browser), WebRTC (app — planned)

---

## 2. API Surface Audit

### Endpoints the Client DOES NOT Consume Yet

| Server Endpoint | Purpose | Client Gap |
|---|---|---|
| `GET /api/session/status` | Active RTSP session info | No dedicated session monitor UI |
| `GET /api/display-devices` | Available displays | Not shown in streaming config |
| `GET /api/framegen/edid-refresh` | Frame generation EDID | No UI |
| `GET /api/health/vigem` | ViGEm driver health | Not surfaced |
| `GET /api/health/crashdump` | Crash dump detection | Not surfaced |
| `POST /api/health/crashdump/dismiss` | Dismiss crash alert | Not surfaced |
| `GET /api/playnite/categories` | Playnite categories | Not used for filtering |
| `POST /api/playnite/launch` | Launch via Playnite | Not exposed |
| `GET /api/logs` | Server logs | No log viewer |
| `GET /api/logs/export` | Export log bundle | No download UI |
| `GET /api/logs/export_crash/manifest` | Crash bundle manifest | No UI |
| `GET /api/logs/export_crash` | Download crash bundle | No UI |
| `POST /api/display/export_golden` | Save display config | No UI |
| `POST /api/display/restore` | Restore display config | No UI |
| `GET /api/display/golden_status` | Golden display status | No UI |
| `DELETE /api/display/golden` | Delete golden config | No UI |
| `GET /api/rtss/status` | RTSS overlay status | Not surfaced |
| `GET /api/lossless_scaling/status` | Lossless Scaling status | Not surfaced |
| `POST /api/wol` | Wake-on-LAN (server-side) | Only direct WoL used |
| `GET /api/clients/hdr-profiles` | HDR profiles per client | Not shown |
| `POST /api/clients/update` | Update client settings | Not exposed |
| `GET /api/auth/sessions` | Active auth sessions | Not shown |
| `DELETE /api/auth/sessions/:id` | Revoke auth session | Not exposed |
| `GET /api/token/routes` | Available token routes | Not shown |

### [FORENSIC ALERT] Unused Capabilities = Lost Value
The server exposes **~25 endpoints** the client doesn't consume. These represent features already built on the backend that users can't access.

---

## 3. Streaming Performance & Optimizations

### 3.1 Current Architecture Constraints

| Constraint | Impact | Severity |
|---|---|---|
| **Mutual exclusion**: WebRTC OR RTSP, never both | Can't monitor WebRTC while classic session runs | Medium |
| **Ring buffer = 2 frames** | Ultra-low latency but aggressive drops | Low (by design) |
| **Audio bypass_opus = true** | WebRTC handles encoding; no server-side audio codec choice | Low |
| **Single media thread** for all WebRTC sessions | Potential bottleneck with multiple viewers | Medium |
| **No adaptive bitrate on server** | Client-side only (Flutter adaptive provider) | High |

### 3.2 Quick Wins — Streaming Performance

| # | Improvement | Effort | Impact |
|---|---|---|---|
| 1 | **Server-side adaptive bitrate** — Use `stream/health` drop_rate to auto-reduce encoder bitrate | Medium | High |
| 2 | **IDR interval tuning** — Expose `min_idr_interval` in streaming config UI | Trivial | Medium |
| 3 | **Pacing mode UI** — Expose `video_pacing_mode` (latency/balanced/smoothness) in Simple mode | Trivial | Medium |
| 4 | **Frame drop telemetry** — Show real-time drop rate in dashboard during active stream | Small | High |
| 5 | **Encoder warm-up** — Pre-initialize encoder on app launch (not first frame) | Medium | Medium |
| 6 | **Multi-display selection** — Use `/api/display-devices` to let user pick capture display | Small | High |
| 7 | **HDR toggle** — Surface HDR on/off in streaming config (server already supports) | Trivial | Medium |

### 3.3 Medium-Term — Streaming Architecture

| # | Improvement | Effort | Impact |
|---|---|---|---|
| 8 | **Concurrent WebRTC + RTSP** — Remove mutual exclusion; allow monitoring WebRTC while classic streams | Large | Medium |
| 9 | **Per-session media threads** — Isolate encoding/pacing per viewer for multi-client | Large | Medium |
| 10 | **AV1 first-class support** — Validate AV1 path end-to-end, add to Simple presets | Medium | High |
| 11 | **Audio codec selection** — Wire `audio_codec` field through to actual encoding (currently ignored) | Medium | Low |
| 12 | **WebRTC from Flutter app** — Native WebRTC client in the app (not just browser) | Large | Very High |

---

## 4. Client UX Quick Wins

### 4.1 Immediate (< 1 day each)

| # | Improvement | Screen | Details |
|---|---|---|---|
| 1 | **Live stream health badge** | Dashboard | Show green/yellow/red dot when streaming, using `/api/stream/health` |
| 2 | **Server uptime display** | System | Already have `uptimeMs` — show "Up 3d 12h" prominently |
| 3 | **GPU name + temp** | System/Dashboard | `GpuMetrics.name` + `temperatureC` — show in a card |
| 4 | **Game count badge** | Sidebar/Nav | Show total games count next to Library icon |
| 5 | **Quick-launch from library** | Library | One-tap launch button on game cards (POST /api/apps/launch) |
| 6 | **Pull-to-refresh** | All screens | Add RefreshIndicator to scrollable screens |
| 7 | **Connection quality indicator** | AppBar/System | Ping latency to server shown as colored dot |
| 8 | **Empty states with actions** | All screens | Replace "No data" with illustrated empty states + CTA buttons |
| 9 | **Skeleton loading** | Library/Dashboard | Shimmer placeholders instead of CircularProgressIndicator |
| 10 | **Toast notifications** | Global | Show success/error toasts for async operations (pair, deploy, config save) |

### 4.2 Short-Term (1-3 days each)

| # | Improvement | Screen | Details |
|---|---|---|---|
| 11 | **Log viewer** | New screen | Consume `/api/logs`, show filterable log stream |
| 12 | **Session manager** | Streaming | Show active sessions, allow terminate, show per-session stats |
| 13 | **Display picker** | Streaming Config | Use `/api/display-devices` for visual display selection |
| 14 | **Crash dump alert** | System | Check `/api/health/crashdump`, show banner if crash detected |
| 15 | **Auth session manager** | Settings | Show active login sessions, allow revoke |
| 16 | **Game categories/tags** | Library | Filter by source, category (Playnite categories available) |
| 17 | **Batch game management** | Library | Multi-select, hide/unhide, remove multiple games |
| 18 | **Server health history** | System | Store last N metrics snapshots, show mini sparkline charts |

---

## 5. New Features to Offer Clients

### 5.1 High-Value New Capabilities

| # | Feature | Description | Server Work | Client Work |
|---|---|---|---|---|
| 1 | **Remote Wake + Auto-Connect** | WoL → wait for server online → auto-pair → ready to stream | None (WoL exists) | Medium |
| 2 | **Game Launch from Phone** | Browse library on phone, tap to launch on PC, stream starts | Minimal (launch API exists) | Medium |
| 3 | **Stream Preview Thumbnails** | Periodic screenshot of active stream shown in dashboard | Medium (capture 1 frame/5s) | Small |
| 4 | **Notifications** | Push notification when: stream starts, client connects, server goes offline | Medium (Supabase + FCM) | Medium |
| 5 | **Performance Profiles** | Save/load named streaming configs ("4K HDR", "Mobile LTE", "LAN Party") | Small (config API exists) | Medium |
| 6 | **Client HDR Profiles** | Per-client HDR/SDR/resolution preferences (API exists: `/api/clients/hdr-profiles`) | None | Small |
| 7 | **Remote Desktop Mode** | Stream desktop without launching a game (already possible via "Desktop" app) | None | Small (UX) |
| 8 | **Bandwidth Test** | Client↔Server speed test before streaming to recommend preset | Medium | Medium |
| 9 | **Multi-Server Dashboard** | Single view showing status of all registered servers | None | Medium |
| 10 | **Scheduled Wake** | Schedule server wake at specific times (e.g., "wake at 7pm for gaming") | None (client-side timer + WoL) | Small |

### 5.2 Differentiators vs Competition (Moonlight/Parsec/Steam Link)

| Feature | Us | Moonlight | Parsec | Steam Link |
|---|---|---|---|---|
| Cloud pairing (no LAN needed) | ✅ | ❌ | ✅ | ❌ |
| Multi-user sharing with RBAC | ✅ | ❌ | ✅ (paid) | ❌ |
| Server deploy from app | ✅ | ❌ | ❌ | ❌ |
| Game library management | ✅ | ❌ | ❌ | ✅ |
| WebRTC browser streaming | ✅ | ❌ | ✅ | ❌ |
| Adaptive bitrate | ✅ | ❌ | ✅ | ✅ |
| Wake-on-LAN from app | ✅ | ✅ | ❌ | ❌ |
| Open source server | ✅ | ✅ | ❌ | ❌ |
| **Missing: In-app streaming** | ❌ | ✅ | ✅ | ✅ |
| **Missing: Clipboard sync** | Partial | ❌ | ✅ | ❌ |
| **Missing: File transfer** | ❌ | ❌ | ❌ | ❌ |

### 5.3 The Big Gap: In-App Streaming

The #1 missing feature is **streaming directly inside the Flutter app** (not just managing the server). This would make Jujo.Stream a complete replacement for Moonlight/Parsec rather than just a management companion.

**Approach options:**
- A) WebRTC via `flutter_webrtc` package — reuse existing WebRTC signaling
- B) Native Moonlight protocol via FFI — reuse classic RTSP path
- C) Embedded WebView pointing to `/webrtc` — quickest but worst UX

**Recommendation:** Option A (WebRTC) — leverages existing signaling API, works over internet (not just LAN), and the server already handles all the heavy lifting.

---

## 6. Cloud Architecture Improvements

### 6.1 Current Cloud Schema

```
user_server_profiles  →  Server identity + connectivity hints
server_members        →  Multi-user sharing (invite codes, roles)
realtime_presence     →  Online/offline status
```

### 6.2 Gaps & Improvements

| # | Improvement | Details |
|---|---|---|
| 1 | **TURN relay via Supabase Edge** | Provide managed TURN credentials for NAT traversal (currently env var only) |
| 2 | **Server health push** | Cloud agent pushes health score; client shows "Server degraded" without polling |
| 3 | **Invite link sharing** | Deep link `jujostream://invite/CODE` that opens app and auto-accepts |
| 4 | **Usage analytics** | Track streaming hours, games played, bandwidth used (opt-in) |
| 5 | **Server discovery** | If server has public IP, allow "find my server" without manual URL entry |
| 6 | **Offline queue** | Queue config changes when server is offline; apply when it comes back |
| 7 | **Push notifications table** | Store notification preferences + FCM tokens in Supabase |

### 6.3 Cloud Agent Enhancement

Current cloud agent pushes: `server_name, server_url, local_addresses, external_address, nat_type, cert_fingerprint, server_version, is_streaming`

**Should also push:**
- `encoder_name` (e.g., "NVENC RTX 4090")
- `active_sessions_count`
- `health_score` (0-100)
- `last_error` (most recent critical error)
- `available_games_count`
- `uptime_seconds`

This enables the client to show rich server cards without polling the server directly.

---

## 7. Security & Hardening

### 7.1 Current Security Model

- ✅ TLS for all HTTP (self-signed cert)
- ✅ Session-based auth with HttpOnly cookies
- ✅ API token system with route-level scoping
- ✅ RBAC for shared users (viewer/operator/admin)
- ✅ Cloud pairing via JWT (no password over wire)
- ✅ RLS on all Supabase tables

### 7.2 Gaps

| # | Issue | Risk | Fix |
|---|---|---|---|
| 1 | **No rate limiting** on auth endpoints | Brute force | Add per-IP rate limit (10 attempts/min) |
| 2 | **Self-signed cert trust** is blanket in client | MITM if fingerprint not pinned | Pin cert fingerprint from cloud profile |
| 3 | **API tokens have no expiry** | Leaked token = permanent access | Add `expires_at` field, auto-rotate |
| 4 | **No audit log** | Can't trace who did what | Add `audit_log` table for admin actions |
| 5 | **Cloud agent stores JWT in config file** | File access = cloud impersonation | Encrypt at rest or use OS keychain |
| 6 | **No 2FA** for server admin | Single password = single point of failure | TOTP support for local auth |

---

## 8. Visual / Eye-Catchy Improvements

### 8.1 Dashboard Enhancements

| # | Element | Current | Proposed |
|---|---|---|---|
| 1 | **Stream status** | Text "0 active" | Animated pulse dot + "LIVE" badge when streaming |
| 2 | **GPU card** | Not shown | Dedicated GPU card with name, temp gauge, VRAM bar |
| 3 | **Network throughput** | Raw bytes | Real-time sparkline chart (last 60s) |
| 4 | **Game art** | Not on dashboard | "Recently played" row with poster thumbnails |
| 5 | **Server health ring** | Number only | Circular progress indicator (0-100) with color gradient |

### 8.2 Library Screen

| # | Element | Current | Proposed |
|---|---|---|---|
| 1 | **Grid layout** | List only? | Toggle between grid (poster art) and list view |
| 2 | **Hero image** | None | Selected game shows large banner/hero art |
| 3 | **Source badges** | Text | Colored source icons (Steam blue, Epic dark, GOG purple) |
| 4 | **Search** | Basic | Fuzzy search with highlighted matches |
| 5 | **Animations** | None | Staggered grid animation on load, hero transitions |

### 8.3 Streaming Screen

| # | Element | Current | Proposed |
|---|---|---|---|
| 1 | **Active stream card** | None | Full-width card with live stats (fps, bitrate, codec, resolution) |
| 2 | **Quality visualization** | Preset cards | Visual quality ladder (low→high) with current position indicator |
| 3 | **Encoder badge** | Text | Chip with GPU icon + encoder name (e.g., "⚡ NVENC H.265") |

### 8.4 Global Polish

| # | Element | Details |
|---|---|---|
| 1 | **Micro-animations** | Page transitions, card hover effects, button press feedback |
| 2 | **Haptic feedback** | On toggle switches, successful actions (mobile) |
| 3 | **Sound effects** | Optional subtle sounds for connect/disconnect/error |
| 4 | **Onboarding illustrations** | Custom SVG illustrations for each onboarding step |
| 5 | **Dark mode polish** | Ensure all surfaces have proper elevation/tint in dark |
| 6 | **Typography hierarchy** | Ensure consistent use of display/headline/title/body across all screens |

---

## 9. Technical Debt & Code Health

### 9.1 Server-Side

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | `confighttp.cpp` is monolithic (~5000+ lines) | `src/confighttp.cpp` | Hard to maintain, slow compile |
| 2 | No OpenAPI/Swagger spec | — | Client must reverse-engineer endpoints |
| 3 | Mixed auth patterns (cookie + bearer + basic) | `src/http_auth.cpp` | Confusing for API consumers |
| 4 | `audio_codec` field accepted but ignored | `src/webrtc_stream.cpp` | API contract violation |
| 5 | No versioned API (`/api/v1/...`) | All routes | Breaking changes affect all clients |

### 9.2 Client-Side

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | `avoid_print` warnings (4) | `server_status_service.dart` | Should use logger |
| 2 | No error boundary/crash reporting | Global | Silent failures |
| 3 | No offline mode/caching | All API calls | App unusable without server |
| 4 | No integration tests | `tests/` | Regression risk |
| 5 | Hard-coded polling intervals (5s) | `streaming_sessions_service.dart` | Should be configurable |

### 9.3 Cloud-Side

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | No database indexes on `server_url` in `server_members` | Migration | Slow queries at scale |
| 2 | Invite codes have no length validation | `accept_server_invite` | Could accept empty strings |
| 3 | No cleanup job for expired invites | — | Table grows indefinitely |
| 4 | `member_id` placeholder UUID is fragile | `server_members` | Should use nullable column |

---

## 10. Priority Matrix

### 🔴 Critical (Do First — High Impact, Low-Medium Effort)

1. **Live stream health in dashboard** — Already have the API, just wire it
2. **Display picker in streaming config** — API exists, huge UX win
3. **Game quick-launch** — One button, API exists
4. **Server-side adaptive bitrate** — Use existing health metrics
5. **Crash dump alert banner** — API exists, safety feature

### 🟡 High Value (Next Sprint — Medium Effort, High Impact)

6. **In-app streaming via WebRTC** — The killer feature gap
7. **Log viewer screen** — Essential for debugging
8. **Stream preview thumbnails** — Makes dashboard feel alive
9. **Performance profiles** — Save/load named configs
10. **Remote Wake + Auto-Connect flow** — Complete the "couch to gaming" story

### 🟢 Polish (Ongoing — Small Effort, Cumulative Impact)

11. **Skeleton loading states** — Replace spinners
12. **Micro-animations** — Page transitions, card interactions
13. **GPU info card** — Dashboard richness
14. **Network sparkline** — Real-time feel
15. **Source-colored badges** — Library visual identity

### 🔵 Strategic (Plan for — Large Effort, Differentiating)

16. **Push notifications** — Server events → phone alerts
17. **Multi-server dashboard** — Power user feature
18. **File transfer** — Unique differentiator
19. **Bandwidth test** — Pre-stream confidence
20. **API versioning** — Future-proofing

---

## Appendix: Full API Route Catalog

<details>
<summary>All 102 registered routes (click to expand)</summary>

### Auth
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/status`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:id`

### Tokens
- `POST /api/token`
- `GET /api/tokens`
- `GET /api/token/routes`
- `DELETE /api/token/:id`

### Pairing
- `POST /api/pin`
- `POST /api/otp`
- `POST /api/pair/cloud`
- `GET /api/clients/list`
- `POST /api/clients/unpair`
- `POST /api/clients/unpair-all`
- `POST /api/clients/disconnect`
- `POST /api/clients/update`
- `GET /api/clients/hdr-profiles`

### Apps/Library
- `GET /api/apps`
- `POST /api/apps`
- `POST /api/apps/reorder`
- `POST /api/apps/delete`
- `DELETE /api/apps/:id`
- `POST /api/apps/launch`
- `POST /api/apps/close`
- `GET /api/apps/:id/cover`
- `POST /api/covers/upload`
- `POST /api/apps/purge_autosync`

### Game Sources
- `GET /api/game-sources`
- `POST /api/game-sources/:id/connect`
- `POST /api/game-sources/:id/sync`
- `POST /api/game-sources/:id/disconnect`
- `POST /api/game-sources/steam/auth/start`
- `GET /api/game-sources/steam/auth/callback`
- `GET /api/game-sources/gog/auth/callback`
- `POST /api/game-sources/steam/web-library`
- `POST /api/game-sources/playniteLegacy/purge-apps`

### Library & Art
- `GET /api/library/games`
- `GET /api/library/steam/prefetch-progress`
- `GET /api/library/steam/:appid/poster`
- `GET /api/library/local-art/steam/:appid`
- `GET /api/library/local-art/steam/:appid/:type`
- `GET /api/library/metadata/status`
- `POST /api/library/metadata/providers/:id/connect`

### System
- `GET /api/system/readiness`
- `GET /api/system/status`
- `GET /api/system/diagnostics`
- `GET /api/system/diagnostics/:section`
- `GET /api/system/metrics`
- `GET /api/system/autostart/status`
- `POST /api/system/autostart/enable`
- `POST /api/system/autostart/disable`

### Config
- `GET /api/config`
- `POST /api/config`
- `PATCH /api/config`
- `GET /api/metadata`
- `GET /api/configLocale`
- `POST /api/password`

### Server Control
- `POST /api/restart`
- `POST /api/quit`
- `GET /api/server/status`
- `GET /api/setup/status`

### Streaming
- `GET /api/session/status`
- `GET /api/stream/health`

### WebRTC
- `GET /api/webrtc/sessions`
- `POST /api/webrtc/sessions`
- `GET /api/webrtc/sessions/:id`
- `DELETE /api/webrtc/sessions/:id`
- `POST /api/webrtc/sessions/:id/offer`
- `GET /api/webrtc/sessions/:id/answer`
- `GET /api/webrtc/sessions/:id/ice`
- `POST /api/webrtc/sessions/:id/ice`
- `GET /api/webrtc/sessions/:id/ice/stream`
- `GET /api/webrtc/cert`

### Updates
- `GET /api/updates/status`
- `POST /api/updates/check`

### Display
- `GET /api/display-devices`
- `POST /api/display/export_golden`
- `POST /api/display/restore`
- `GET /api/display/golden_status`
- `DELETE /api/display/golden`

### Health
- `GET /api/framegen/edid-refresh`
- `GET /api/health/vigem`
- `GET /api/health/crashdump`
- `POST /api/health/crashdump/dismiss`

### Playnite
- `GET /api/playnite/status`
- `POST /api/playnite/install`
- `POST /api/playnite/uninstall`
- `GET /api/playnite/games`
- `GET /api/playnite/categories`
- `POST /api/playnite/force_sync`
- `POST /api/playnite/launch`

### Third-Party Integration
- `GET /api/rtss/status`
- `GET /api/lossless_scaling/status`

### Logs
- `GET /api/logs`
- `GET /api/logs/export`
- `GET /api/logs/export_crash/manifest`
- `GET /api/logs/export_crash`

### Network
- `POST /api/wol`

</details>

---

*End of study. Each section is designed to be actionable independently.*
