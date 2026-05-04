# Skill: Steam Integration Flow — Jujo.StreamServer

## Skill Match (via `find-skill`)
- **Primary:** `systems-architecture-lead` (modular adapter design, auth flow orchestration)
- **Secondary:** `security-risk-auditor` (token vault, OpenID validation, zero-exposure credentials)
- **Supporting:** `data-platform-architect` (provider abstraction, bridge pattern for game sources)

---

## Executive Summary

Steam integration in Jujo.StreamServer follows a **zero-API-key-required** browser-based authentication model with encrypted credential storage and a multi-source sync pipeline.

---

## Complete Integration Flow (Sequence)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STEAM INTEGRATION PIPELINE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. CONNECT ─────────────────────────────────────────────────────    │
│     POST /api/game-sources/steam/connect                             │
│     ├─ Optional: user provides Steam Web API key (fallback only)     │
│     ├─ Server encrypts key via DPAPI vault if provided               │
│     ├─ Returns { action: "browser_login", authUrl: "..." }           │
│     └─ authUrl = Steam OpenID 2.0 URL with return_to callback        │
│                                                                       │
│  2. BROWSER AUTH ────────────────────────────────────────────────    │
│     POST /api/game-sources/steam/auth/start                          │
│     ├─ Returns Steam OpenID auth URL                                 │
│     ├─ User opens popup → steamcommunity.com login                   │
│     └─ Steam redirects to callback with signed OpenID params         │
│                                                                       │
│  3. CALLBACK VALIDATION ────────────────────────────���────────────    │
│     GET /api/game-sources/steam/auth/callback?openid.*               │
│     ├─ No auth check (OAuth callback from Steam)                     │
│     ├─ verify_steam_openid_response() validates signature             │
│     │   with Steam's own servers                                     │
│     ├─ Extracts SteamID64 from claimed_id                            │
│     ├─ Stores: source_state.connected = true                         │
│     ├─ Stores: source_state.publicConfig.steamId = SteamID64         │
│     ├─ Persists via save_game_source_state("steam", ...)             │
│     └─ Returns HTML success page + postMessage to opener              │
│                                                                       │
│  4. WEB LIBRARY CAPTURE ─────────────────────────────────────────    │
│     POST /api/game-sources/steam/web-library                         │
│     ├─ Frontend fetches Steam Store dynamicstore/userdata             │
│     │   using browser cookies (credentials: 'include')               │
│     ├─ Extracts rgOwnedApps[] array of AppIDs                        │
│     ├─ Posts { ownedAppIds: [...] } to server                        │
│     ├─ Server stores web library AppIDs in source state              │
│     ├─ Merges with local Steam manifests for install detection        │
│     ├─ Auto-imports installed games as server app entries             │
│     └─ Returns owned count + installed count                          │
│                                                                       │
│  5. SYNC (Full Pipeline) ────────────────────────────────────────    │
│     POST /api/game-sources/steam/sync                                │
│     ├─ Priority 1: Captured web library AppIDs                       │
│     ├─ Priority 2: Steam public XML profile (if public)              │
│     ├─ Priority 3: Steam Web API key (private fallback)              │
│     ├─ Always: Merge local Steam manifests                           │
│     │   ├─ Reads libraryfolders.vdf                                  │
│     │   └─ Reads appmanifest_*.acf per library folder                │
│     ├─ Enriches each AppID via Steam Store appdetails                │
│     ├─ Caches metadata under steam_metadata/{appid}.json             │
│     ├─ Downloads poster from Steam CDN library_600x900.jpg           │
│     ├─ Caches poster under covers/steam_{appid}.jpg                  │
│     ├─ Auto-imports installed games as server apps                    │
│     │   cmd: `cmd /c start "" "steam://rungameid/{appid}"`           │
│     └─ Updates source state with sync counts and timestamp            │
│                                                                       │
│  6. DISCONNECT ──────────────────────────────────────────────────    │
│     POST /api/game-sources/steam/disconnect                          │
│     ├─ Clears connection state                                       │
│     ├─ Removes stored credentials from vault                         │
│     └─ Preserves previously imported app entries                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Vue)                      │
│  GameSourcesView.vue                                  │
│  ├─ loadGameSources() → GET /api/game-sources         │
│  ├─ runSourceAction(id, action, payload)              │
│  ├─ captureSteamWebLibrary() → browser fetch + POST   │
│  └─ saveSteamApiKey() → POST connect with {apiKey}    │
├──────────────────────────────────────────────────────┤
│                    API LAYER (C++)                     │
│  confighttp.cpp                                       │
│  ├─ postGameSourceConnect()                           │
│  ├─ postSteamAuthStart()                              │
│  ├─ getSteamAuthCallback()                            │
│  ├─ postSteamWebLibrary()                             │
│  ├─ postGameSourceSync()                              │
│  └─ postGameSourceDisconnect()                        │
├──────────────────────────────────────────────────────┤
│                    STATE LAYER                         │
│  vibeshine_state.json → root.game_sources.steam       │
│  ├─ connected: bool                                   │
│  ├─ connectionState: enum                             │
│  ├─ publicConfig.steamId: string                      │
│  ├─ publicConfig.apiKeyConfigured: bool               │
│  ├─ syncState: enum                                   │
│  ├─ ownedGameCount / installedGameCount               │
│  ├─ lastSync: ISO8601                                 │
│  └─ webLibraryAppIds: number[]                        │
├──────────────────────────────────────────────────────┤
│                    VAULT LAYER                         │
│  DPAPI encryption with server-specific entropy        │
│  ├─ Steam Web API key (optional fallback)             │
│  └─ No Steam cookies/tokens stored                    │
├──────────────────────────────────────────────────────┤
│                    LOCAL DETECTION                     │
│  Steam client manifests                               │
│  ├─ libraryfolders.vdf → library paths                │
│  └─ appmanifest_*.acf → installed AppIDs + names      │
├──────────────────────────────────────────────────────┤
│                    METADATA CACHE                      │
│  ├─ steam_metadata/{appid}.json (Store appdetails)    │
│  └─ covers/steam_{appid}.jpg (CDN poster cache)       │
└──────────────────────────────────────────────────────┘
```

---

## Security Model (via `security-risk-auditor`)

| Concern | Mitigation |
|---------|-----------|
| Steam credentials | No Steam password/cookie stored. OpenID only validates identity. |
| API key storage | DPAPI encrypted vault with server-specific entropy |
| Web library capture | Browser-side fetch with user's own cookies; server receives only AppID integers |
| OpenID validation | Server-side signature verification against Steam servers |
| Token exposure | API key never returned to frontend; only `apiKeyConfigured: bool` flag |
| Callback endpoint | No auth check needed (OAuth redirect), but OpenID signature is cryptographically verified |

---

## Data Model (via `data-modeling-expert`)

### Source State Schema (Bronze — raw provider state)
```json
{
  "id": "steam",
  "name": "Steam",
  "connected": true,
  "connectionState": "connected",
  "syncState": "synced",
  "publicConfig": {
    "steamId": "76561198...",
    "apiKeyConfigured": false
  },
  "ownedGameCount": 312,
  "installedGameCount": 47,
  "playableGameCount": 47,
  "lastSync": "2026-05-03T15:00:00Z",
  "webLibraryAppIds": [570, 730, 1174180, ...]
}
```

### Library Game Record (Silver — normalized)
```json
{
  "id": "g1",
  "uuid": "uuid-steam-1",
  "providerGameId": "570",
  "sourceId": "steam",
  "sourceName": "Steam",
  "title": "Dota 2",
  "owned": true,
  "installed": true,
  "playable": true,
  "installState": "installed",
  "installPath": "C:/Steam/steamapps/common/dota 2 beta",
  "executablePath": null,
  "posterUrl": "/api/library/steam/570/poster",
  "posterState": "cached",
  "metadataState": "enriched",
  "metadata": {
    "description": "...",
    "releaseDate": "2013-07-09",
    "developers": ["Valve"],
    "publishers": ["Valve"],
    "genres": ["Free to Play", "Strategy"]
  },
  "launchableVia": "cmd /c start \"\" \"steam://rungameid/570\""
}
```

---

## Sync Priority Chain (Idempotent)

```
1. webLibraryAppIds (captured from browser)     ← PREFERRED
2. Steam public XML profile                     ← FALLBACK (if profile is public)
3. Steam Web API key + GetOwnedGames            ← FALLBACK (if key configured)
4. Local manifests (libraryfolders.vdf + acf)   ← ALWAYS MERGED
```

Each sync is **idempotent**: re-running produces the same final state. Existing app entries are matched by `providerGameId` to avoid duplication.

---

## Frontend Flow (UI Orchestration)

```
User clicks "Connect" on Steam card
  → POST /api/game-sources/steam/connect
  → Receives authUrl
  → Opens popup to Steam login
  → Steam redirects to /auth/callback
  → Server validates OpenID, stores SteamID
  → Popup shows success HTML + postMessage
  → Frontend receives message, closes popup
  → Calls captureSteamWebLibrary()
    → Fetches store.steampowered.com/dynamicstore/userdata
    → Posts AppIDs to /api/game-sources/steam/web-library
    → Server merges with local manifests
    → Auto-imports installed games
  → Reloads game sources state
  → UI updates with owned/installed counts
```

---

## Key Files

| Layer | File | Purpose |
|-------|------|---------|
| Backend | `src/confighttp.cpp` | All Steam API endpoints, OpenID validation, sync logic |
| Frontend | `src_assets/.../views/GameSourcesView.vue` | Steam connect UI, web library capture, sync orchestration |
| Frontend | `src_assets/.../views/LibraryView.vue` | Display synced games, add-to-server action |
| State | `vibeshine_state.json` | Persistent source state (encrypted fields via DPAPI) |
| Stubs | `src_assets/.../vite.config.ts` | Dev-mode stub responses for offline development |

---

## Pending Work (from planning.md)

- [ ] GOG/Xbox installed-game matching
- [ ] Epic/GOG/Xbox OAuth callback adapters
- [ ] MinGW/GCC toolchain for native build verification
