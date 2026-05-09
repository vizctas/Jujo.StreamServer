# Game Library Architecture — Direct Source Integration + TOML Migration

## Executive Summary

Replace the Playnite-dependent game library pipeline with a **direct source integration** architecture. The server connects to Steam/Epic/GOG/Xbox APIs and local manifests directly, with a filesystem watcher for real-time install/uninstall detection. Game library persists to `apps.toml` (replacing `apps.json`).

## Architecture Comparison

### OLD (Playnite-dependent)
```
SERVER ←→ Playnite Plugin ←→ [Steam, Epic, GOG] ←→ SERVER (apps.json)
         ↑ fragile          ↑ third-party config
```
**Problems:** Plugin install required, Playnite must be running, double-hop dependency, user must configure Playnite libraries, sync is manual/unreliable.

### NEW (Direct integration)
```
SERVER ──┬── SteamSource (local manifests + Web API)
         ├── EpicSource (local manifests + catalog API)
         ├── GOGSource (local DB + Galaxy API)
         ├── XboxSource (WinRT GamePass API)
         └── ManualSource (user-defined)
              │
              ▼
         GameLibraryManager ──→ apps.toml (single source of truth)
              │
              ▼
         FileSystemWatcher (install/uninstall detection)
```

## Data Model: `apps.toml`

```toml
# Jujo.Stream Game Library
# Auto-managed by game source integrations. Manual edits are preserved.
version = 2

# ─── System Apps (always present) ─────────────────────────────────────────────

[[apps]]
name = "Desktop"
image_path = "desktop.png"
source = "system"
source_id = ""
allow_client_commands = false

# ─── Steam Games ──────────────────────────────────────────────────────────────

[[apps]]
name = "Steam Big Picture"
source = "steam"
source_id = "bigpicture"
image_path = "steam.png"
detached = ["steam://open/bigpicture"]

[[apps.prep_cmd]]
do = ""
undo = "steam://close/bigpicture"
elevated = false

[[apps]]
name = "Counter-Strike 2"
source = "steam"
source_id = "730"
image_path = "covers/steam_730.jpg"
cmd = "steam://rungameid/730"
auto_managed = true  # watcher can add/remove this entry

# ─── Epic Games ───────────────────────────────────────────────────────────────

[[apps]]
name = "Fortnite"
source = "epic"
source_id = "fn_abc123"
image_path = "covers/epic_fn_abc123.jpg"
cmd = "com.epicgames.launcher://apps/fn_abc123?action=launch"
auto_managed = true

# ─── Manual Games ─────────────────────────────────────────────────────────────

[[apps]]
name = "My Custom Game"
source = "manual"
source_id = ""
image_path = "covers/custom_game.png"
cmd = "C:\\Games\\MyGame\\game.exe"
working_dir = "C:\\Games\\MyGame"
```

### Key Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display name |
| `source` | string | ✅ | `system`, `steam`, `epic`, `gog`, `xbox`, `manual` |
| `source_id` | string | ✅ | Platform-specific ID (Steam appid, Epic catalog ID, etc.) |
| `image_path` | string | ❌ | Relative path to cover art |
| `cmd` | string | ❌ | Launch command (URI or executable path) |
| `working_dir` | string | ❌ | Working directory for cmd |
| `detached` | string[] | ❌ | Background commands (fire-and-forget) |
| `prep_cmd` | table[] | ❌ | Pre/post commands with do/undo/elevated |
| `auto_managed` | bool | ❌ | `true` = watcher can add/remove; `false` = user-pinned |
| `hidden` | bool | ❌ | `true` = excluded from client app list |
| `allow_client_commands` | bool | ❌ | Default: true |
| `virtual_display_primary` | bool | ❌ | Use virtual display as primary |
| `elevated` | bool | ❌ | Run as admin |

## Server Architecture (C++)

### New Files

```
src/
├── game_sources/
│   ├── game_source.h          # Abstract interface
│   ├── game_library.h/.cpp    # Manager: load/save TOML, merge sources
│   ├── steam_source.h/.cpp    # Steam: manifests + Web API + OpenID
│   ├── epic_source.h/.cpp     # Epic: manifests + catalog
│   ├── gog_source.h/.cpp      # GOG: galaxy DB + API
│   ├── xbox_source.h/.cpp     # Xbox: WinRT GamePass
│   ├── manual_source.h/.cpp   # User-defined entries
│   └── fs_watcher.h/.cpp      # Filesystem watcher for install/uninstall
```

### Interface: `GameSource`

```cpp
namespace game_sources {
  struct GameEntry {
    std::string name;
    std::string source;       // "steam", "epic", "gog", "xbox", "manual"
    std::string source_id;    // platform-specific ID
    std::string image_path;
    std::string cmd;
    std::string working_dir;
    std::vector<std::string> detached;
    std::vector<config::prep_cmd_t> prep_cmds;
    bool auto_managed = true;
    bool hidden = false;
    bool elevated = false;
    bool allow_client_commands = true;
    bool virtual_display_primary = false;
  };

  class GameSource {
  public:
    virtual ~GameSource() = default;
    virtual std::string id() const = 0;                    // "steam", "epic", etc.
    virtual std::string display_name() const = 0;
    virtual bool is_available() const = 0;                 // Platform installed?
    virtual std::vector<GameEntry> scan_installed() = 0;   // Detect installed games
    virtual std::vector<GameEntry> scan_owned() = 0;       // All owned (may need auth)
    virtual bool requires_auth() const = 0;
    virtual bool is_connected() const = 0;
    virtual std::vector<std::string> watch_paths() const = 0; // Paths for fs_watcher
  };
}
```

### GameLibraryManager

Responsibilities:
1. **Load** `apps.toml` on startup (fallback: migrate `apps.json` if present)
2. **Merge** source scan results with existing entries (idempotent — never duplicate)
3. **Save** back to `apps.toml` atomically (write tmp + rename)
4. **Notify** `proc::refresh()` after changes
5. **Expose** via existing `/api/library/games` and `/api/game-sources/*` endpoints

### Filesystem Watcher

- Watches Steam `libraryfolders.vdf` + `steamapps/*.acf` for install/uninstall
- Watches Epic `%PROGRAMDATA%\Epic\EpicGamesLauncher\Data\Manifests\*.item`
- Watches GOG Galaxy DB path
- Debounced (500ms) to avoid rapid-fire during installs
- On change → re-scan affected source → merge → save

## Migration Strategy

### Phase 1: TOML Parser + Dual-Read [PENDING]
- Add `toml++` header-only dependency (MIT, C++17)
- `game_library.cpp`: read `apps.toml` if exists, else read `apps.json` + auto-convert
- Write always goes to `apps.toml`
- Deprecation log if `apps.json` still present

### Phase 2: GameSource Interface + Steam Direct [PENDING]
- Abstract `GameSource` interface
- `SteamSource`: local manifest scanning (already exists in `confighttp.cpp` — extract)
- `SteamSource`: Web API owned-games (already exists — extract)
- `SteamSource`: OpenID auth flow (already exists — extract)
- Wire into `GameLibraryManager`

### Phase 3: Filesystem Watcher [PENDING]
- Platform-specific: `ReadDirectoryChangesW` (Windows), `inotify` (Linux)
- Watch Steam/Epic manifest directories
- Debounced re-scan on change
- Auto-add/remove `auto_managed = true` entries

### Phase 4: Epic/GOG/Xbox Sources [PENDING]
- `EpicSource`: read `.item` manifests from `%PROGRAMDATA%\Epic\...`
- `GOGSource`: read Galaxy SQLite DB
- `XboxSource`: WinRT `Windows.Gaming` API for GamePass titles

### Phase 5: Playnite Deprecation [PENDING]
- Keep `config_playnite.cpp` but disable auto-sync by default
- Add migration notice in UI: "Playnite integration deprecated — games are now managed directly"
- Remove Playnite plugin copy step from build

## Flutter Client Impact

**Minimal changes needed:**
- `GameSourceDto` already has `id`, `name`, `connected`, `gameCount` — no schema change
- `LibraryApi.getGames()` already returns `GameDto` with `source`, `sourceId` — no change
- `GameSourcesScreen` already shows connect/sync/disconnect — works as-is
- **New:** Show "Watching for changes" indicator when watcher is active
- **New:** Remove Playnite-specific UI elements (already mostly hidden)

## Dependencies

- `toml++` — header-only, MIT, C++17 (already our minimum)
- No new runtime dependencies
- Existing `nlohmann::json` stays for API responses and state files

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Breaking existing `apps.json` users | Auto-migration on first boot |
| Steam Web API rate limits | Cache owned-games list, only re-fetch on explicit sync |
| Epic/GOG API changes | Local manifest scanning is primary; API is enrichment only |
| Watcher performance | Debounce + only watch known paths |
| Playnite users lose games | Migration copies all Playnite entries to `apps.toml` with `source = "playnite_legacy"` |

## Completion Criteria

- [ ] `apps.toml` is the single source of truth for game library
- [ ] Steam games auto-detected from local manifests without Playnite
- [ ] Filesystem watcher detects install/uninstall within 5s
- [ ] `apps.json` auto-migrated on first boot (zero user action)
- [ ] Playnite integration disabled by default (kept as legacy option)
- [ ] All existing API endpoints (`/api/library/*`, `/api/game-sources/*`) work unchanged
- [ ] Flutter app shows library without any code changes to DTOs
