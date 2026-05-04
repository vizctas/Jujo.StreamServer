# Jujo.Stream Server Workflow

## Current Direction

Jujo.Stream Server is moving away from a Playnite-dependent server UI toward a first-party server experience with:

- A restrained professional visual system.
- A guided first-run flow for pairing, library setup, and streaming readiness.
- Internal game-library services that can import from stores and manual entries without requiring Playnite as the central intermediary.

## Active Review

The May 2, 2026 audit is validating whether completed UI/UX batches match the current implementation before continuing the redesign.

## Onboarding Rule

The first-run setup must be guided but non-blocking. Users can skip pairing, library connection, readiness checks, or manual game setup and return later from the dashboard. Incomplete setup is shown as clear dashboard state, not as a modal wall.

## Game Source Rule

Primary game sources are authenticated platform connections. Steam, Epic Games, GOG, and Xbox must be presented with official platform identity, clear sign-in actions, explicit account/permission state, encrypted token messaging, and a fallback manual game path. Playnite is treated as a legacy import/compatibility source, not the recommended path.

## Navigation Model

Use an operational sidebar as the primary desktop navigation: Home, Pairing, Library, Game Sources, Clients, System, Settings. For mobile and narrow desktop, collapse this into a drawer or bottom-access menu without changing route hierarchy.

## Home Model

Home has two modes. During setup or partial setup, it is an operational checklist: Pair a device, Connect a library, Verify readiness, Start streaming. After setup is healthy, it becomes a command center with server status, recent activity, playable game shortcuts, source sync state, and quick actions.

## Onboarding Pattern

Use a recoverable wizard through real app routes. Home owns the setup checklist, but each step opens its production screen: Pairing, Game Sources, System readiness, and Library. The flow never blocks navigation and never traps advanced users in a modal-only setup.

## Personalization Model

The server should support curated appearance presets and limited layout personalization without sacrificing usability. Casual users get polished defaults and simple theme selection. Advanced users can tune dashboard modules, background treatment, density, and selected component order from App/Server Settings. Presets should align conceptually with the Jujo client theme model while using server-specific semantic tokens.

## Setup Backend Contracts

The onboarding UI must prefer explicit setup contracts over inferred state from unrelated stores:

- `/api/setup/status`: summary counts, setup completion, checklist steps, and readiness snapshot.
- `/api/game-sources`: source records for Steam, Epic Games, GOG, Xbox, Manual, and Playnite Legacy.
- `/api/system/readiness`: host readiness checks with status, action label, and destination path.

Until first-party store integrations exist, platform sources report `not_connected`; Manual and Playnite Legacy are derived from the current apps file.

## Store-Integrated Library Direction

Game Sources is now a first-class subsystem. The product target is authenticated provider connections that can show owned games, installed games, sync status, poster artwork, and metadata. Local scanning is still useful, but it is not the source of truth for Steam, Epic, GOG, or Xbox.

Provider implementation must use a common model:

- Account connection state: `not_connected`, `connecting`, `connected`, `error`, `requires_action`.
- Library inventory state: owned count, installed count, playable count, last sync, and sync error.
- Game identity: provider id, provider name, title, install state, install path, executable path, poster, metadata, and visibility.
- Security state: token storage must be encrypted before any real provider token is persisted.

Steam can use official Steam Web API for owned game data when the user provides/authorizes the required identity and permissions. Epic, GOG, and Xbox require provider-specific OAuth/developer access and must be implemented behind adapter boundaries so unavailable APIs degrade to a clear `requires_action` state rather than fake success.

### Current Library Contracts

- `GET /api/library/games`: normalized library records across current local apps and future store providers.
- `GET /api/library/metadata/status`: poster and metadata provider readiness.
- `POST /api/library/metadata/providers/steamgriddb/connect`: stores the SteamGridDB API key in encrypted server-side state and switches the provider from contract-only to configured.
- Library game fields: `id`, `uuid`, `providerGameId`, `sourceId`, `sourceName`, `title`, `owned`, `installed`, `playable`, `installState`, `installPath`, `executablePath`, `posterUrl`, `posterState`, `metadataState`, `metadata`, and `launchableVia`.
- Store providers can return owned-but-not-installed games through the same contract when provider adapters are implemented.
- Metadata/poster providers use encrypted provider state under `root.library_metadata.providers`. SteamGridDB is the first configurable provider; automatic fetchers must read the decrypted key server-side and never expose it to the web UI.

### Provider Vault and Steam Adapter

- Provider state is stored under `root.game_sources` in `vibeshine_state.json`.
- Store credentials are never persisted in clear text. Windows uses DPAPI with server-specific entropy for the first vault implementation.
- `POST /api/game-sources/steam/connect` returns a Steam browser sign-in URL; no Steam Web API key is requested from the user.
- `GET /api/game-sources/steam/auth/callback` validates Steam OpenID and stores the signed-in SteamID as public source config.
- `POST /api/game-sources/steam/web-library` accepts AppIDs captured in the browser from Steam Store `dynamicstore/userdata`; no Steam cookies or API keys are stored by the server.
- `POST /api/game-sources/steam/sync` prefers the captured Steam Store web library, then falls back to Steam public XML or the optional private-account API key, and always merges local Steam manifests for installed games.
- Steam sync reads local Steam `libraryfolders.vdf` and `appmanifest_*.acf` files to mark owned games as installed when present on the host.
- Steam installed games expose `steam://rungameid/{appid}` as the launcher hint.
- Library can convert an installed Steam owned item into a server app entry using `cmd /c start "" "steam://rungameid/{appid}"`; provider/source ids are preserved to avoid duplicated owned items after refresh.
- Epic local sync reads launcher `.item` manifests from `C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests` and can convert installed entries into server app commands using Epic launcher URI.
- Epic, GOG, and Xbox remain in `requires_action` for full owned-library sync until OAuth callback/token exchange adapters are implemented.

### Native Build Dependencies

- Required submodules were initialized for `third-party/moonlight-common-c`, `third-party/Simple-Web-Server`, `third-party/libdisplaydevice`, `third-party/build-deps`, and related Windows dependencies.
- Visual Studio 2026 is installed and CMake can find MSVC, but this repository's Windows dependency bundle is GCC/MinGW-oriented (`.a` libraries such as Boost gcc15, libcrypto, libssl expectations).
- Current native verification blocker: no MinGW/MSYS2 GCC toolchain in PATH and no OpenSSL package visible to CMake.

### Steam Native Metadata Pipeline

- Steam is the default no-key metadata provider for Steam games.
- During Steam sync, each AppID is enriched through Steam Store `appdetails` and cached under `steam_metadata/{appid}.json` in app data.
- Steam poster artwork uses official Steam CDN `library_600x900.jpg`; successful downloads are cached under `covers/steam_{appid}.jpg` and served through `/api/library/steam/{appid}/poster`.
- If the local poster cache is missing, the library contract falls back to the Steam CDN URL instead of requiring SteamGridDB or IGDB.
- Optional providers such as SteamGridDB and IGDB remain refinements for missing or alternate artwork; they are not required for Steam-native names, posters, or basic metadata.

### Critical Steam Lazy Pipeline

- Steam sync now prefers GetOwnedGames when an encrypted user fallback key or server key is configured; existing Web Login state is preserved and remains a fallback path.
- Steam metadata and poster download are lazy: sync stores inventory first, marks metadata as queued, then a detached background worker enriches games in batches.
- Library polls while Steam games have pending metadata or remote poster fallback so posters/metadata appear progressively without blocking navigation.
- Playnite Legacy and broad Manual sources are hidden from the active source surfaces while existing state and endpoints remain intact; default local entries such as Desktop and Steam Big Picture can remain visible.
- VDF/ACF parsing currently uses the in-repo parser path; researched C++ options include TinyTinni/ValveFileVDF, but no new dependency is added until real parser failures justify it.

