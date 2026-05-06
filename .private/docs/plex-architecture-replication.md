# Plex TV Architecture Replication Plan

**Date:** 2026-07  
**Status:** [PENDING] Architecture Design  
**Objective:** Map Plex TV's distributed media architecture to Jujo.Stream game streaming platform

---

## Executive Summary

Plex's architecture is a **hub-and-spoke model**: a central cloud service (`plex.tv`) acts as the control plane for discovery, auth, metadata, and relay — while the actual media processing stays on user-owned servers. This maps cleanly to game streaming where the heavy compute (capture/encode) must remain local but everything else (discovery, auth, library sync, remote access) benefits from centralization.

---

## 1. Plex Architecture Decomposition

```
┌─────────────────────────────────────────────────────────────────────┐
│                         plex.tv Cloud                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Auth &  │ │  Server  │ │ Metadata │ │  Relay   │ │  Sharing │ │
│  │ Accounts │ │Discovery │ │  Agent   │ │  (TURN)  │ │ & Access │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
         │              │              │           │            │
         ▼              ▼              ▼           ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Plex Media Server (Host)                          │
│  ┌──────────┐ ┌──────────┐ ┌──���───────┐ ┌──────────┐ ┌──────────┐ │
│  │  Media   │ │Transcode │ │ Library  │ │  DLNA/   │ │  Local   │ │
│  │ Scanner  │ │  Engine  │ │  Index   │ │  GDM     │ │   API    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
         │              │              │           │            │
         ▼              ▼              ▼           ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Client Apps                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Web    │ │  Mobile  │ │    TV    │ │ Desktop  │ │  Chromecast│ │
│  └──────────┘ └��─────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Plex Component → Jujo.Stream Mapping

| Plex Component | Function | Jujo.Stream Equivalent | Status |
|---|---|---|---|
| **plex.tv Auth** | OAuth2, account management, SSO | Supabase Auth | ✅ Phase 1 done |
| **plex.tv Discovery** | Server registration, endpoint resolution | Supabase `servers` table + mDNS | 🔶 Planned Phase 2-3 |
| **plex.tv Relay** | TURN relay for NAT traversal | WebRTC ICE/TURN infra | 🔶 Partial (env var config) |
| **plex.tv Metadata** | Movie/TV metadata enrichment | IGDB/RAWG game metadata | ❌ Not started |
| **plex.tv Sharing** | Multi-user library sharing | `server_members` table | 🔶 Planned Phase 4 |
| **Plex Media Server** | Media processing, transcoding | Sunshine C++ server | ✅ Exists |
| **Media Scanner** | File discovery, library indexing | Game source adapters (Steam/Epic/GOG) | ✅ Exists |
| **Transcode Engine** | Adaptive quality encoding | NVENC/FFmpeg + WebRTC adaptive | ✅ Exists |
| **Library Index** | Searchable media database | `/api/apps` + game library | ✅ Exists |
| **DLNA/GDM** | Local network discovery | mDNS / local server detection | ✅ Basic exists |
| **Local API** | Server control REST API | `confighttp` HTTPS API | ✅ Exists |
| **Client Apps** | Multi-platform playback | Flutter admin + jujo.client | ✅ Exists |

---

## 2. Architecture Layers (Jujo.Stream Plex Model)

### Layer 1: Cloud Control Plane (≈ plex.tv)

**Technology:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Supabase Cloud Control Plane                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │    Auth     │  │   Server    │  │   Device    │                │
│  │  (OAuth2,  │  │  Registry   │  │  Registry   │                │
│  │  email/pw, │  │  (discover, │  │  (trust,    │                │
│  │  Google)   │  │  health)    │  │  approval)  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Library   │  │   Config    │  │   Relay     │                │
│  │   Sync      │  │  Snapshots  │  │  Signaling  │                │
│  │  (metadata, │  │  (safe cfg  │  │  (TURN cred │                │
│  │  artwork)   │  │  backup)    │  │  broker)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │  Sharing &  │  │  Realtime   │                                  │
│  │  Access     │  │  Presence   │                                  │
│  │  Control    │  │  & Events   │                                  │
│  └─────────────┘  └─────────────┘                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Plex behaviors to replicate:**

| Plex Behavior | Implementation |
|---|---|
| Sign in once, see all your servers | Supabase auth → `server_members` query → server list |
| Server auto-registers with cloud | Server heartbeat → Supabase Edge Function → `servers` table update |
| Remote access without port forwarding | WebRTC ICE + Supabase-brokered TURN credentials |
| Share library with friends | `server_members` with role `viewer` + RLS |
| Server health visible from anywhere | `server_health_events` table + Realtime subscription |

### Layer 2: Streaming Server (≈ Plex Media Server)

**Technology:** C++ (Sunshine fork) — already exists

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Jujo.Stream Server (Host PC)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Display   │  │   Encode    │  │   Audio     │                │
│  │   Capture   │  │  (NVENC/    │  │   Capture   │                │
│  │  (DXGI/     │  │  FFmpeg/    │  │  (WASAPI/   │                │
│  │  Wayland)   │  │  QSV/AMF)  │  │  PulseAudio)│                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   WebRTC    │  │   RTSP/     │  │   Input     │                │
│  │  Transport  │  │  GameStream │  │  Injection  │                │
│  │  (browser)  │  │  (Moonlight)│  │  (KB/M/GP)  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Game      │  │   REST API  │  │   Cloud     │                │
│  │   Library   │  │  (confighttp│  │   Agent     │                │
│  │   Scanner   │  │   :47990)   │  │  (heartbeat │                │
│  └─────────────┘  └─────────────┘  │  + register)│                │
│                                     └─────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**New component needed: Cloud Agent**

The server needs a background thread/module that:
1. Registers with Supabase on startup (server_id, endpoint, cert fingerprint)
2. Sends periodic heartbeats (online status, active sessions, load)
3. Receives commands from cloud (device approval requests, config pushes)
4. Brokers TURN credentials for remote clients
5. Validates incoming Supabase JWTs for account-assisted connections

### Layer 3: Client Apps (≈ Plex Apps)

**Technology:** Flutter (admin) + jujo.client (streaming)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Ecosystem                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │     jujo_stream_app          │  │        jujo.client           ││
│  │     (Admin Panel)            │  │     (Streaming Client)       ││
│  │                              │  │                              ││
│  │  • Server management         │  │  • Game library browsing     ││
│  │  • Game source config        │  │  • Stream launch/connect     ││
│  │  • Device pairing            │  │  • Input capture/send        ││
│  │  • Health monitoring         │  │  • Video decode/render       ││
│  │  • User/sharing management   │  │  • Adaptive quality          ││
│  │  • Deploy/install server     │  │  • Multi-server switching    ││
│  │                              │  │                              ││
│  │  Platforms:                  │  │  Platforms:                  ││
│  │  Web, Windows, macOS, Linux  │  │  Android, iOS, Windows,     ││
│  │                              │  │  macOS, Android TV, Apple TV ││
│  └─────────────���────────────────┘  └──────────────────────────────┘│
│                                                                     │
│  Shared: Supabase Auth, Server Discovery, Cloud Profiles            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Critical Plex Patterns to Replicate

### 3.1 Server Discovery (Plex GDM → Jujo Discovery)

**How Plex does it:**
1. Local: GDM (Good Day Mate) UDP broadcast on port 32414
2. Remote: Server registers with plex.tv; clients query plex.tv for user's servers
3. Fallback: Manual IP entry

**Jujo.Stream implementation:**

```
Discovery Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Supabase │────▶│  Server  │
│   App    │     │  Cloud   │     │  (Host)  │
└──────────┘     └──────────┘     └──────────┘
     │                                   ▲
     │         mDNS / UDP broadcast      │
     └───────────────────────────────────┘
              (LAN only, fast path)
```

| Method | Protocol | When Used |
|---|---|---|
| mDNS/Bonjour | `_jujostream._tcp` service | LAN — instant discovery |
| Cloud registry | Supabase `servers` table query | Remote — after auth |
| Manual URL | HTTPS direct | Fallback / advanced users |

**Server registration payload (to Supabase):**
```json
{
  "server_id": "uuid-v4",
  "name": "Jozh's Gaming PC",
  "owner_id": "supabase-user-id",
  "local_addresses": ["192.168.1.100:47990"],
  "external_address": "auto-detected or null",
  "cert_fingerprint": "sha256:...",
  "version": "2026.7.1",
  "capabilities": {
    "encoders": ["nvenc_h264", "nvenc_hevc", "nvenc_av1"],
    "max_resolution": "3840x2160",
    "max_fps": 120,
    "webrtc": true,
    "moonlight": true
  },
  "status": "online",
  "last_heartbeat": "2026-07-01T12:00:00Z",
  "active_sessions": 0
}
```

### 3.2 Remote Access / NAT Traversal (Plex Relay → Jujo Relay)

**How Plex does it:**
1. Server opens outbound connection to plex.tv relay
2. Client connects to relay
3. Relay bridges the two (adds latency but works through any NAT)
4. Direct connection preferred when possible (UPnP/NAT-PMP)

**Jujo.Stream implementation:**

WebRTC already handles this via ICE, but needs infrastructure:

```
Connection Negotiation:
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  1. Auth with Supabase                  │  1. Register with Supabase
     │  2. Get server endpoints                │  2. Report local/external IPs
     │  3. Get TURN credentials                │  3. Heartbeat
     │                                         │
     │  ┌─────────────────────────────────┐    │
     │  │        ICE Negotiation          │    │
     │  │                                 │    │
     │  │  Try: host candidates (LAN)     │    │
     │  │  Try: srflx (STUN, same NAT)    │    │
     │  │  Try: relay (TURN, last resort) │    │
     │  └─────────────────────────────────┘    │
     │                                         │
     ▼                                         ▼
   Best available path selected automatically
```

**TURN infrastructure options:**

| Option | Cost | Latency | Maintenance |
|---|---|---|---|
| Self-hosted coturn | VPS cost (~$5-20/mo) | Low (choose region) | Medium |
| Cloudflare TURN | Free tier available | Low | None |
| Twilio TURN | Pay-per-use | Low | None |
| Supabase Edge Function → credential broker | Supabase plan | Varies | Low |

**Recommended:** Cloudflare TURN (free tier) + self-hosted coturn for premium/fallback.

### 3.3 Adaptive Quality (Plex Transcoding → Jujo Adaptive Streaming)

**How Plex does it:**
1. Client reports capabilities (codec support, resolution, bandwidth)
2. Server selects: Direct Play > Direct Stream > Transcode
3. Mid-stream quality adjustment based on buffer health

**Jujo.Stream implementation:**

```
Quality Negotiation:
┌──────────┐                              ┌──────────┐
│  Client  │──── capabilities ───────────▶│  Server  │
│          │                              │          │
│  Codec:  │                              │ Selects: │
│  H264 ✓  │                              │ • Codec  │
│  HEVC ✓  │◀─── stream config ──────────│ �� Res    │
│  AV1  ✗  │                              │ • FPS    │
│          │                              │ • Bitrate│
│  BW: 50M │                              │          │
│  Res: 4K │                              │          │
└──────────┘                              └──────────┘
```

**Already exists in WebRTC path:**
- Client sends `width`, `height`, `fps`, `bitrate_kbps`, `codec` in session creation
- Server validates and applies
- Browser reports capabilities via `RTCRtpSender.getCapabilities()`

**Missing (to match Plex):**
- Mid-stream adaptive bitrate based on WebRTC stats (jitter, packet loss)
- Quality presets: "Original", "High (1080p60)", "Medium (720p60)", "Low (720p30)"
- Automatic quality selection based on measured bandwidth
- Client-side buffer health → server-side bitrate adjustment feedback loop

### 3.4 Library & Metadata (Plex Agents → Jujo Game Metadata)

**How Plex does it:**
1. Scanner finds media files
2. Agents match files to metadata databases (TMDB, TVDB, MusicBrainz)
3. Rich metadata: posters, backgrounds, descriptions, ratings, cast
4. Collections, playlists, watch history

**Jujo.Stream implementation:**

```
Game Metadata Pipeline:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Source   │────▶│  Scanner │────▶│ Metadata │────▶│  Library │
│ Adapters  │     │  (match  │     │  Agent   │     │  Index   │
│           │     │  games)  │     │ (enrich) │     │          │
│ • Steam   │     │          │     │          │     │ • Title  │
│ • Epic    │     │ Outputs: │     │ Sources: │     │ • Art    │
│ • GOG     │     │ • app_id │     │ • IGDB   │     │ • Genre  │
│ • Xbox    │     │ • name   │     │ • RAWG   │     │ • Rating │
│ • Manual  │     │ • exe    │     │ • Steam  │     │ • Desc   │
│ • Playnite│     │ • source │     │   Store  │     │ • Tags   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**Current state:** Basic game scanning exists (name, exe, source). Missing rich metadata.

**Needed:**
- IGDB API integration (free, comprehensive game database)
- Artwork pipeline: cover art, hero images, screenshots, logos
- Genre/tag classification
- Play time tracking (from Steam API where available)
- Collections: "Recently Played", "Favorites", user-created
- Cross-server library sync via Supabase

### 3.5 Multi-User & Sharing (Plex Home → Jujo Sharing)

**How Plex does it:**
1. Server owner invites friends via email
2. Friends get their own Plex account
3. Owner controls which libraries are shared
4. Each user has independent watch history, ratings
5. Managed users (no separate account needed, e.g., kids)

**Jujo.Stream implementation:**

```sql
-- Supabase schema for sharing
CREATE TABLE server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '{
    "can_stream": true,
    "can_manage_library": false,
    "can_pair_devices": false,
    "can_invite_others": false,
    "max_concurrent_streams": 1,
    "allowed_quality": "auto"
  }'::jsonb,
  UNIQUE(server_id, user_id)
);

-- RLS: users can only see memberships they belong to
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own memberships"
  ON server_members FOR SELECT
  USING (user_id = auth.uid());
```

**Roles:**
| Role | Can Stream | Manage Library | Pair Devices | Invite | Admin |
|---|---|---|---|---|---|
| `owner` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `member` | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| `viewer` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Data Flow Architecture

### 4.1 Complete System Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐         ┌──────────────┐         ┌─────────────┐             │
│  │ Flutter │◀───────▶│   Supabase   │◀───────▶│   Server    │             │
│  │  Admin  │  REST/  │    Cloud     │  Edge   │   (C++)     │             │
│  │  App    │  Realtime│             │  Func   │             │             │
│  └────┬────┘         └──────┬───────┘         └──────┬──────┘             │
│       │                     │                        │                     │
│       │  Direct HTTPS       │  Realtime              │  Heartbeat          │
│       │  (LAN/VPN)          │  Subscriptions         │  + Registration     │
│       │                     │                        │                     │
│       ▼                     ▼                        ▼                     │
│  ┌─────────┐         ┌──────────────┐         ┌─────────────┐             │
│  │ jujo.   │◀───────▶│   Supabase   │         │   Game      │             │
│  │ client  │  Auth + │   (server    │         │   Sources   │             │
│  │         │  Discover│   lookup)    │         │  (Steam/    │             │
│  └────┬────┘         └──────────────┘         │   Epic/etc) │             │
│       │                                       └─────────────┘             │
│       │  WebRTC / Moonlight                                                │
│       │  (media stream)                                                    │
│       ▼                                                                    │
│  ┌─────────────────────────────────────────┐                               │
│  │         Server (direct connection)       │                               │
│  │  • Video/Audio stream                    │                               │
│  │  • Input injection                       │                               │
│  │  • Low-latency data channel              │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Connection Establishment (Plex-style)

```
Client App Boot:
1. Sign in to Supabase (cached session or fresh login)
2. Query `servers` table → get list of user's servers
3. For each server:
   a. Check local network (mDNS / direct IP probe)
   b. If local: connect directly via HTTPS
   c. If remote: use cloud-brokered connection
      - Get TURN credentials from Supabase Edge Function
      - Establish WebRTC connection through relay
4. Display server list with status indicators:
   - 🟢 Local (direct, <1ms overhead)
   - 🟡 Remote (relay, ~20-50ms overhead)
   - 🔴 Offline (no heartbeat in >60s)
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation ✅ (DONE)
- [x] Supabase Auth integration
- [x] Email/password + Google OAuth
- [x] Local server profiles
- [x] Basic server discovery (manual URL)

### Phase 2: Server Registry (NEXT)
- [ ] Supabase `servers` table + RLS
- [ ] Server-side Cloud Agent module (C++)
  - Heartbeat thread (every 30s)
  - Registration on startup
  - Capability reporting
- [ ] Flutter: fetch joined servers from Supabase
- [ ] Flutter: server status from cloud (online/offline/sessions)
- [ ] mDNS service advertisement (`_jujostream._tcp`)
- [ ] mDNS discovery in Flutter app

### Phase 3: Remote Access Infrastructure
- [ ] TURN credential broker (Supabase Edge Function)
- [ ] Cloudflare TURN integration (or coturn self-hosted)
- [ ] jujo.client: WebRTC connection via cloud-brokered ICE
- [ ] Automatic local vs remote path selection
- [ ] Connection quality indicators in client UI
- [ ] UPnP/NAT-PMP port mapping (optional, for Moonlight compat)

### Phase 4: Account-Assisted Pairing
- [ ] `devices` + `server_devices` tables
- [ ] Device registration on first app launch
- [ ] Server security policy toggles
- [ ] Auto-approve flow for account-linked devices
- [ ] Invitation system (email invite → server_members)

### Phase 5: Rich Library & Metadata
- [ ] IGDB API integration (game metadata agent)
- [ ] Artwork pipeline (cover, hero, screenshot, logo)
- [ ] Genre/tag/rating enrichment
- [ ] Collections and favorites
- [ ] Play session tracking
- [ ] Library sync to Supabase (metadata only, not binaries)

### Phase 6: Adaptive Streaming
- [ ] Client capability reporting protocol
- [ ] Quality presets (Original/High/Medium/Low/Auto)
- [ ] Mid-stream bitrate adaptation based on WebRTC stats
- [ ] Buffer health feedback loop
- [ ] Bandwidth estimation and pre-stream quality selection

### Phase 7: Multi-User & Sharing
- [ ] `server_members` with roles and permissions
- [ ] Invitation flow (admin panel)
- [ ] Per-user stream limits
- [ ] Per-user library visibility
- [ ] Concurrent stream management

### Phase 8: Dashboard & Observability
- [ ] Server health events → Supabase
- [ ] Realtime dashboard (stream count, bandwidth, GPU load)
- [ ] Historical analytics (play time, popular games, peak hours)
- [ ] Alert system (server offline, high temp, encode errors)
- [ ] Remote server management via cloud (restart, config push)

---

## 6. Supabase Schema (Complete)

```sql
-- ═══════════════════════════════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════════════════════════════

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registered streaming servers
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  machine_id TEXT UNIQUE NOT NULL,  -- hardware fingerprint
  version TEXT,
  
  -- Connectivity
  local_addresses JSONB DEFAULT '[]'::jsonb,  -- ["192.168.1.100:47990"]
  external_address TEXT,                       -- public IP:port if known
  cert_fingerprint TEXT,                       -- SHA256 of server TLS cert
  
  -- Capabilities
  capabilities JSONB DEFAULT '{}'::jsonb,
  -- { encoders: [], max_resolution, max_fps, webrtc, moonlight }
  
  -- Status
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'streaming')),
  active_sessions INT DEFAULT 0,
  last_heartbeat TIMESTAMPTZ,
  
  -- Security
  pairing_policy TEXT DEFAULT 'manual_pin'
    CHECK (pairing_policy IN (
      'manual_pin', 'trusted_devices', 'owner_devices_only',
      'lan_only_quick_pair', 'disabled_quick_pair'
    )),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Server membership (who can access which server)
CREATE TABLE server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{
    "can_stream": true,
    "can_manage_library": false,
    "can_pair_devices": false,
    "can_invite_others": false,
    "max_concurrent_streams": 1
  }'::jsonb,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(server_id, user_id)
);

-- User devices (phones, PCs, TVs)
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT,  -- 'windows', 'android', 'ios', 'macos', 'linux', 'web'
  device_fingerprint TEXT UNIQUE,
  push_token TEXT,  -- for notifications
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Device approval per server
CREATE TABLE server_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  cert_hash TEXT,  -- device client cert hash for mTLS
  UNIQUE(server_id, device_id)
);

-- ═══════════════════════════════════════════════════════════════
-- LIBRARY & METADATA
-- ═══════════════════════════════════════════════════════════════

-- Games discovered on servers
CREATE TABLE server_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  source TEXT,  -- 'steam', 'epic', 'gog', 'xbox', 'manual'
  source_id TEXT,  -- platform-specific ID (Steam appid, etc.)
  
  -- Metadata (enriched by agent)
  igdb_id INT,
  description TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  rating FLOAT,
  release_date DATE,
  developer TEXT,
  publisher TEXT,
  
  -- Artwork URLs
  cover_url TEXT,
  hero_url TEXT,
  logo_url TEXT,
  screenshots JSONB DEFAULT '[]'::jsonb,
  
  -- State
  installed BOOLEAN DEFAULT true,
  last_played TIMESTAMPTZ,
  play_time_minutes INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, source, source_id)
);

-- User collections (like Plex playlists)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_smart BOOLEAN DEFAULT false,  -- auto-populated by rules
  smart_rules JSONB,  -- { genre: "RPG", min_rating: 80 }
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE collection_games (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES server_games(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (collection_id, game_id)
);

-- ═══════════════════════════════════════════════════════════════
-- HEALTH & TELEMETRY
-- ═══════════════════════════════════════════════════════════════

-- Server health snapshots (inserted by server heartbeat)
CREATE TABLE server_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  
  cpu_percent FLOAT,
  gpu_percent FLOAT,
  gpu_temp_c FLOAT,
  memory_percent FLOAT,
  network_tx_mbps FLOAT,
  network_rx_mbps FLOAT,
  active_streams INT DEFAULT 0,
  encoder_load_percent FLOAT,
  
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Streaming session history
CREATE TABLE stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  device_id UUID REFERENCES devices(id),
  game_id UUID REFERENCES server_games(id),
  
  codec TEXT,
  resolution TEXT,
  fps INT,
  bitrate_kbps INT,
  connection_type TEXT,  -- 'local', 'remote_direct', 'remote_relay'
  
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  avg_latency_ms FLOAT,
  avg_fps_delivered FLOAT,
  frames_dropped INT DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- CONFIG SNAPSHOTS (safe backup, no secrets)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE server_config_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  
  video_config JSONB,
  audio_config JSONB,
  stream_config JSONB,
  input_config JSONB,
  
  snapshot_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════��═════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_config_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "Own profile" ON profiles
  FOR ALL USING (id = auth.uid());

-- Servers: members can read, owner can update
CREATE POLICY "Members can read servers" ON servers
  FOR SELECT USING (
    id IN (SELECT server_id FROM server_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Owner can update server" ON servers
  FOR UPDATE USING (owner_id = auth.uid());

-- Server members: see own memberships
CREATE POLICY "Own memberships" ON server_members
  FOR SELECT USING (user_id = auth.uid());

-- Devices: own devices only
CREATE POLICY "Own devices" ON devices
  FOR ALL USING (user_id = auth.uid());

-- Server games: members can read
CREATE POLICY "Members can read games" ON server_games
  FOR SELECT USING (
    server_id IN (SELECT server_id FROM server_members WHERE user_id = auth.uid())
  );

-- Health: members can read
CREATE POLICY "Members can read health" ON server_health
  FOR SELECT USING (
    server_id IN (SELECT server_id FROM server_members WHERE user_id = auth.uid())
  );

-- Stream sessions: own sessions
CREATE POLICY "Own sessions" ON stream_sessions
  FOR SELECT USING (user_id = auth.uid());
```

---

## 7. Server Cloud Agent (C++ Module Design)

**New file:** `src/cloud_agent.cpp` / `src/cloud_agent.h`

```cpp
// Pseudocode — Cloud Agent Module
namespace cloud_agent {

struct Config {
  std::string supabase_url;
  std::string supabase_service_key;  // loaded from env/vault only
  std::string server_id;
  std::chrono::seconds heartbeat_interval{30};
};

// Lifecycle
void start(const Config& config);  // spawns heartbeat thread
void stop();                        // graceful shutdown

// Registration
void register_server();             // POST to Supabase Edge Function
void update_capabilities();         // on encoder probe complete
void update_status(Status s);       // online/streaming/offline

// Heartbeat
void heartbeat_loop();              // periodic health + status push

// Auth validation
bool validate_supabase_jwt(const std::string& token, Claims& out);
bool check_membership(const std::string& user_id, const std::string& server_id);

// TURN credential broker
TurnCredentials get_turn_credentials(const std::string& user_id);

}  // namespace cloud_agent
```

**Integration points:**
- `src/main.cpp`: start cloud agent after platform init
- `src/confighttp.cpp`: add `/api/cloud/status` endpoint
- `src/webrtc_stream.cpp`: use brokered TURN credentials in ICE config

---

## 8. Key Architectural Differences from Plex

| Aspect | Plex | Jujo.Stream | Reason |
|---|---|---|---|
| Media type | Pre-recorded files | Live game capture | Real-time, not file-based |
| Latency tolerance | Seconds (buffered) | <50ms (interactive) | Input responsiveness |
| Transcoding | File → multiple qualities | Live encode → single stream | Can't pre-transcode live capture |
| Multi-stream | Many concurrent viewers | Usually 1 (GPU-bound) | Single GPU encoder limit |
| Offline access | Download for offline | Not applicable | Can't "download" a game session |
| Content source | Local files | Running applications | Games must be installed + launched |
| Protocol | HLS/DASH (HTTP) | WebRTC / Moonlight (UDP) | Latency requirements |

---

## 9. Priority Matrix

| Component | Impact | Effort | Priority |
|---|---|---|---|
| Server Registry + Heartbeat | High (enables everything) | Medium | **P0** |
| mDNS Discovery | Medium (LAN UX) | Low | **P0** |
| TURN Infrastructure | High (remote access) | Medium | **P1** |
| Account-Assisted Pairing | High (UX) | Medium | **P1** |
| Game Metadata Agent | Medium (polish) | Medium | **P2** |
| Multi-User Sharing | Medium (growth) | High | **P2** |
| Adaptive Quality | Medium (remote UX) | High | **P3** |
| Analytics Dashboard | Low (nice-to-have) | Medium | **P3** |

---

## 10. Security Considerations

### Plex Security Model (replicate)
1. **No server credentials in cloud** — Plex.tv never stores PMS admin password
2. **Token-based access** — Short-lived tokens issued after auth verification
3. **Server is final authority** — Cloud membership is evidence, not authorization
4. **E2E encryption** — Media stream encrypted between server and client
5. **Cert pinning** — Clients verify server certificate fingerprint

### Jujo.Stream Security Additions
- Supabase JWT validation on server (verify `iss`, `aud`, `exp`, user claims)
- Device cert pinning (client cert hash stored in `server_devices`)
- TURN credentials are short-lived (5-minute TTL, per-session)
- No PII in telemetry tables (no IP addresses, no game save data)
- Config snapshots exclude secrets (no passwords, no API keys)

---

## 11. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Time to first stream (new user) | <5 minutes | From account creation to playing |
| Remote connection success rate | >95% | ICE negotiation success |
| Server discovery latency (LAN) | <2 seconds | mDNS response time |
| Server discovery latency (cloud) | <1 second | Supabase query time |
| Stream startup latency | <3 seconds | From "Play" to first frame |
| Concurrent users per server | 1-4 | Based on GPU encoder slots |

---

## References

- [Plex Media Server Architecture](https://support.plex.tv/articles/200264746-quick-start-step-by-step-guides/)
- [WebRTC ICE/TURN RFC 8656](https://datatracker.ietf.org/doc/html/rfc8656)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [IGDB API](https://api-docs.igdb.com/)
- [mDNS/DNS-SD RFC 6762/6763](https://datatracker.ietf.org/doc/html/rfc6762)
