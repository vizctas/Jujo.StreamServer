# End-to-End Trace: Dashboard & Steam/Library

## Scenario 1: Fresh App Launch → Dashboard (Server Already Deployed)

```
A. App starts
│
├─ AuthProvider.init()
│   ├─ Reads FlutterSecureStorage: jujo_session_token, jujo_server_url
│   ├─ If token found → state = authenticated(serverUrl, token, username)
│   └─ If no token → state = unauthenticated → GoRouter redirects to /login
│
├─ ServerProfilesNotifier._load()
│   ├─ Reads SharedPreferences: profiles list + active profile ID
│   ├─ If cloud configured + authenticated → syncFromCloud()
│   │   └─ Merges cloud profiles with local (cloud = source of truth for list)
│   └─ Sets state.activeProfileId
│
├─ ServerStatusNotifier (serverStatusProvider)
│   ├─ Listens to authProvider for serverUrl changes
│   ├─ _probe() → GET {serverUrl}/api/auth/status (PUBLIC, no auth needed)
│   │   ├─ Any HTTP response (even 401) → ServerReachability.online
│   │   └─ DioException (timeout/network) → ServerReachability.offline
│   └─ Polls every 30s
│
B. GoRouter resolves to /dashboard → DashboardScreen.build()
│
├─ ref.watch(setupStatusProvider)
│   └─ SetupStatusApi.getStatus() → GET /api/setup/status (AUTHENTICATED)
│       ├─ Returns: setupComplete, pairedClientCount, connectedSourceCount, playableGameCount
│       └─ On error → null (triggers fallback to polling)
│
├─ ref.watch(serverStatusPollingProvider)
│   ├─ Guards: if serverUrl empty OR token empty → Stream.value(null) ← FIXED
│   ├─ ServerStatusService.fetchStatus() → GET /api/server/status (AUTHENTICATED)
│   │   └─ Returns ServerStatus(name, version, uptime, streaming, clients, cloud)
│   └─ Polls every 10s via StreamController + Timer.periodic
│
├─ Dashboard decides which view:
│   ├─ setupStatus.data + setupComplete → _ReadyDashboard
│   ├─ setupStatus.data + !setupComplete → _SetupDashboard
│   ├─ setupStatus.error + polling.hasData → _ConnectedMinimalDashboard
│   └─ setupStatus.error + polling.noData → _NoServerDashboard
│
C. _ReadyDashboard renders:
│
├─ ServerStatusCard
│   ├─ Watches serverStatusPollingProvider (same 10s stream)
│   ├─ Watches activeConnectionTypeProvider (from ServerProfilesState)
│   └─ Displays: name, version, uptime, paired clients, streaming state, LAN/WAN/Relay badge
│
├─ DisplaySnapshotCard
│   ├─ Capture: POST /api/display/export_golden
│   └─ Restore: POST /api/display/restore
│
├─ _StreamingNowBanner (conditional: activeStreams > 0)
│   └─ _activeStreamsProvider → GET /api/system/status → activeStreams count
│
├─ MetricTiles (pairedClientCount, connectedSourceCount, playableGameCount)
│   └─ From setupStatusProvider.data
│
├─ MetricsSparklineCard
│   ├─ Creates ApiClient (reused via _client ??=) ← FIXED
│   ├─ Guards: if serverUrl empty OR token empty → skip ← FIXED
│   ├─ Polls GET /api/server/status every 10s
│   ├─ Extracts: streaming.rtspSessionCount + streaming.webrtcActive
│   └─ Renders fl_chart sparkline + uptime/peak/now metrics
│
├─ LiveLogsCard
│   ├─ Creates ApiClient per poll (4s interval) ← KNOWN: could reuse
│   ├─ GET /api/logs → returns text/plain log lines
│   ├─ Parses [level] [timestamp] message
│   └─ Auto-scrolling ListView with level filter chips
│
├─ _FeaturedAppsGrid
│   └─ _featuredGamesProvider → LibraryApi.getGames() → first 4 games
│
└─ _QuickLinksRow → navigation to /sources, /system, /pairing
```

---

## Scenario 2: Steam Connect → Sync → Library Display

```
A. User navigates to /sources → GameSourcesScreen
│
├─ ref.watch(serverStatusProvider) → checks isOnline
├─ ref.watch(authProvider) → checks serverUrl configured
├─ ref.watch(gameSourcesProvider)
│   └─ GameSourcesApi.getSources() → GET /api/game-sources
│       └─ Returns: [{id:"steam", name:"Steam", connected:false, ...}, ...]
│
├─ If !serverConfigured || !serverOnline → _ServerRequiredBanner
└─ Otherwise → _buildGrid() with _SourceCard per source

B. User taps "Connect" on Steam card → _connect()
│
├─ GameSourcesApi.steamAuthStart() → POST /api/game-sources/steam/auth/start
│   └─ Server returns: { authUrl: "https://steamcommunity.com/openid/login?..." }
│
├─ launchUrl(authUrl, mode: externalApplication)
│   └─ Opens system browser → Steam login page
│
├─ setState(() => _awaitingAuth = true)
│   └─ Shows _SteamAuthWaitBanner with pulsing indicator
│
├─ _pollForSteamAuth() — polls every 2s, max 120s
│   ├─ gameSourcesProvider.notifier.silentRefresh()
│   │   └─ GET /api/game-sources → checks steam.connected
│   ├─ Meanwhile in browser:
│   │   ├─ User logs into Steam
│   │   ├─ Steam redirects to: GET /api/game-sources/steam/auth/callback?openid.*
│   │   ├─ Server: verify_steam_openid_response() validates signature with Steam
│   │   ├─ Server: extracts SteamID64 from claimed_id
│   │   ├─ Server: save_game_source_state("steam", {connected:true, steamId:...})
│   │   └─ Server: returns HTML success page + window.close()
│   │
│   └─ Poll detects steam.connected == true → exits loop
│
├─ SnackBar: "Steam connected! Syncing library…"
└─ Calls _sync()

C. _sync() — 4-step pipeline with visual progress
│
├─ Step 1: "Verifying connection" (active)
│   ├─ silentRefresh() → GET /api/game-sources
│   ├─ Confirms steam.connected == true
│   └─ advance('connect', done)
│
├─ Step 2: "Fetching owned library" (active)
│   ├─ *** NO steamWebLibrary() call *** ← FIXED (was broken, removed)
│   ├─ gameSourcesProvider.notifier.sync("steam")
│   │   └─ GameSourcesApi.sync("steam") → POST /api/game-sources/steam/sync
│   │       └─ Server: sync_steam_owned_games()
│   │           ├─ Priority 1: webOwnedAppIds (empty — Flutter can't capture)
│   │           ├─ Priority 2: Local manifests (libraryfolders.vdf + appmanifest_*.acf)
│   │           │   ├─ Reads Steam install path from registry
│   │           │   ├─ Parses libraryfolders.vdf → library paths
│   │           │   ├─ For each path: reads appmanifest_*.acf files
│   │           │   └─ Extracts: AppID, name, installdir, SizeOnDisk
│   │           ├─ Priority 3: Steam public XML profile (if profile is public)
│   │           ├─ Priority 4: Steam Web API key (if configured in sunshine.conf)
│   │           ├─ Merges all sources → deduplicates by AppID
│   │           ├─ Auto-imports installed games as server app entries
│   │           │   └─ cmd: "cmd /c start \"\" \"steam://rungameid/{appid}\""
│   │           ├─ Downloads posters from Steam CDN (background)
│   │           └─ Returns: { ownedGameCount, installedGameCount, playableGameCount }
│   │
│   ├─ After sync: ref.invalidate(libraryProvider) → refreshes game list
│   └─ advance('library', done)
│
├─ Step 3: "Detecting installed games" (active)
│   ├─ (Already done server-side during sync)
│   ├─ 300ms delay for visual feedback
│   └─ advance('installed', done)
│
├─ Step 4: "Loading posters" (active)
│   ├─ Polls GET /api/library/steam/prefetch-progress every 2s
│   │   └─ Returns: { total, fetched, running }
│   ├─ Waits until progress.isDone or 30s timeout
│   └─ advance('posters', done)
│
├─ setState(() => _syncResult = result)
├─ SnackBar: "Steam synced: X owned, Y installed."
└─ After 800ms: clears _syncSteps (pipeline disappears)

D. User navigates to /library → LibraryScreen
│
├─ ref.watch(libraryProvider)
│   └─ LibraryApi.getGames() → GET /api/apps
│       └─ Returns: [{name, uuid, cmd, working-dir, image-path, prep-cmd, ...}, ...]
│       └─ Parsed into GameDto with index (for update/delete)
│
├─ ref.watch(steamPrefetchProgressProvider)
│   └─ If running: shows _PrefetchProgressBar at top
│
├─ _Toolbar: search field + source filter chips + sort dropdown + IGDB button
│
├─ GridView.builder with SliverGridDelegateWithMaxCrossAxisExtent(210) ← FIXED (was 200)
│   └─ _GameTile per game:
│       ├─ game.resolveImageUrl(serverUrl)
│       │   ├─ If source == 'steam': Steam CDN URL (no server round-trip)
│       │   │   └─ https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_600x900.jpg
│       │   └─ Else: serverUrl + imagePath
│       ├─ Image.network(imageUrl) with error fallback → platform placeholder
│       ├─ Source badge overlay (top-right corner)
│       └─ Game name text (color: colorScheme.onSurface) ← FIXED for light theme
│
└─ Tap tile → GameDetailSheet.show(context, game)

E. GameDetailSheet — full editing dialog ← NEW (was read-only)
│
├─ TabController with 3 tabs: General | Prep Commands | Advanced
│
├─ General Tab:
│   ├─ Poster (140px, aspect 3:4)
│   ├─ Status chips (source, installed)
│   ├─ Command field (editable, monospace)
│   ├─ Working Directory field (editable)
│   ├─ Toggles: Elevated, Auto-Detach
│   └─ UUID display
│
├─ Prep Commands Tab:
│   ├─ "Exclude global prep commands" toggle
│   ├─ Add button → creates new PrepCmdEntry
│   └─ Per entry: Do field + Undo field + Elevated toggle + Delete
│
├─ Advanced Tab:
│   ├─ Detached Commands list
│   └─ Add/remove detached command entries
│
├─ Save button (appears when _dirty):
│   ├─ Builds GameDto with all edited fields
│   ├─ libraryProvider.notifier.updateGameDto(game)
│   │   └─ LibraryApi.updateGame(index, game.toServerJson())
│   │       └─ POST /api/apps/{index} with full app JSON
│   └─ SnackBar: "Game settings saved."
│
├─ Find Poster → IgdbSearchDialog
└─ Remove → confirmDelete → LibraryApi.deleteGame(index) → DELETE /api/apps/{index}
```

---

## Scenario 3: Dashboard with Active Stream (Live Monitoring)

```
A. Client connects via Moonlight → server starts streaming
│
├─ Server state: streaming.active = true, rtspSessionCount = 1
│
B. Dashboard auto-detects within 10s:
│
├─ serverStatusPollingProvider fires
│   └─ ServerStatus.isStreaming = true, rtspSessionCount = 1
│
├─ _activeStreamsProvider fires
│   └─ GET /api/system/status → activeStreams = 1
│
├─ MetricsSparklineCard._sample() fires
│   └─ _dataPoints.add(1.0) → sparkline shows uptick
│   └─ _currentStreams = 1 → "1 active" green indicator
│
├─ _StreamingNowBanner appears (animated):
│   └─ "Live — 1 active streaming session" + pulsing green dot
│
├─ ServerStatusCard updates:
│   └─ Shows "1 stream" with radio icon in green
│
└─ StreamingSessionsCard (if used):
    └─ streamingSessionsProvider polls GET /api/webrtc/sessions every 5s
        └─ Uses ApiClient with auth token + cert trust ← FIXED
        └─ Shows: session ID, resolution, FPS, bitrate, codec, HDR badge
```

---

## Scenario 4: No Server Deployed (First-Time User)

```
A. App starts → no serverUrl in storage
│
├─ AuthProvider: state = unauthenticated, serverUrl = null
├─ ServerStatusNotifier._probe(): serverUrl empty → offline
├─ serverStatusPollingProvider: serverUrl empty → Stream.value(null)
│
B. Dashboard renders:
│
├─ setupStatusProvider: API call fails (no URL) → error
├─ serverStatusPollingProvider: null
├─ → _NoServerDashboard
│   ├─ "No server connected" header
│   ├─ ServerDeployService().canDeploy check
│   │   └─ Windows + build dir exists → true
│   ├─ "Deploy Server on This Machine" button → /deploy
│   └─ "Connect to Existing Server" button → /settings
│
C. User taps "Deploy" → DeployScreen handles full install flow
│   └─ (separate trace — not covered here)
│
D. After deploy completes:
│   ├─ serverProcessProvider._refreshServerData()
│   │   ├─ serverStatusProvider.notifier.refresh()
│   │   ├─ invalidate(setupStatusProvider)
│   │   ├─ invalidate(serverStatusPollingProvider)
│   │   └─ 2s delayed re-invalidation of serverStatusPollingProvider
│   └─ Dashboard auto-transitions to _ReadyDashboard or _SetupDashboard
```

---

## Scenario 5: Server Offline → Comes Back Online

```
A. Server goes offline (service stopped, network issue)
│
├─ serverStatusPollingProvider: fetchStatus() throws → emits null
├─ ServerStatusNotifier._probe(): DioException → offline
├─ Dashboard: setupStatusProvider may error
│   └─ Falls through to _NoServerDashboard or _ConnectedMinimalDashboard
│
B. Server comes back online
│
├─ serverStatusPollingProvider: next poll succeeds → emits ServerStatus
├─ Dashboard ref.listen(serverStatusPollingProvider):
│   └─ prev.valueOrNull == null && next.valueOrNull != null && statusAsync.hasError
│       → ref.invalidate(setupStatusProvider) ← AUTO-RECOVERY
│
├─ setupStatusProvider re-fetches → success
└─ Dashboard transitions to _ReadyDashboard
```

---

## [FORENSIC ALERTS] — Remaining Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | `LiveLogsCard` creates new `ApiClient` every 4s poll | Low (resource waste) | `live_logs_card.dart:_fetchLogs()` |
| 2 | `_activeStreamsProvider` + `MetricsSparklineCard` both poll server status (overlapping data) | Low (duplicate network) | `dashboard_screen.dart` + `metrics_sparkline_card.dart` |
| 3 | `StreamingSessionsCard` exists but is never rendered in any screen | Low (dead code) | `streaming_sessions_card.dart` |
| 4 | `serverStatusProvider` (30s poll, public endpoint) + `serverStatusPollingProvider` (10s poll, authenticated) = 2 separate polling loops for connectivity | Low (could unify) | `server_status_provider.dart` + `server_status_service.dart` |

All critical bugs from previous audit have been fixed. No new critical issues found.
