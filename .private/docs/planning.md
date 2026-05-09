# Game Library — Direct Source Integration + TOML

## Status: Phase 1 IN PROGRESS

## Task Ledger

### Phase 1: TOML Parser + Dual-Read + Migration

| # | Task | Status | Depends |
|---|------|--------|---------|
| 1.1 | Add `toml++` CMake dependency (FetchContent, same pattern as nlohmann_json) | [DONE] | — |
| 1.2 | Create `src/game_sources/game_library.h` — `GameEntry` struct + `GameLibrary` class interface | [DONE] | — |
| 1.3 | Create `src/game_sources/game_library.cpp` — TOML read/write + JSON migration | [DONE] | 1.1, 1.2 |
| 1.4 | Wire `GameLibrary` into `process.cpp` `refresh()` — TOML-to-JSON bridge in `parse()` | [DONE] | 1.3 |
| 1.5 | Wire `GameLibrary` into `confighttp.cpp` — replace all `file_apps` read/write calls | [PENDING] | 1.3 |
| 1.6 | Update `config.cpp` — default `file_apps` path to `apps.toml`, keep fallback | [DONE] | 1.3 |
| 1.7 | Create `assets/apps.toml` — default template (Desktop + Steam Big Picture) | [DONE] | — |
| 1.8 | Verify: server boots, reads `apps.toml`, serves games via API, Moonlight sees app list | [IN PROGRESS] | 1.4-1.7 |
| 1.9 | Verify: auto-migration from `apps.json` → `apps.toml` on first boot | [PENDING] | 1.8 |

### Phase 2: GameSource Interface + Steam Extraction

| # | Task | Status | Depends |
|---|------|--------|---------|
| 2.1 | Create `src/game_sources/game_source.h` — abstract `GameSource` interface | [PENDING] | 1.2 |
| 2.2 | Create `src/game_sources/steam_source.h/.cpp` — extract Steam manifest scanning from `confighttp.cpp` | [PENDING] | 2.1 |
| 2.3 | Extract Steam Web API owned-games logic into `SteamSource::scan_owned()` | [PENDING] | 2.2 |
| 2.4 | Extract Steam OpenID auth flow into `SteamSource` (keep HTTP handlers in confighttp, delegate to source) | [PENDING] | 2.2 |
| 2.5 | Wire `SteamSource` into `GameLibrary::sync("steam")` | [PENDING] | 2.2, 1.3 |
| 2.6 | Verify: `/api/game-sources/steam/sync` uses new `SteamSource` path | [PENDING] | 2.5 |

### Phase 3: Filesystem Watcher

| # | Task | Status | Depends |
|---|------|--------|---------|
| 3.1 | Create `src/game_sources/fs_watcher.h/.cpp` — platform-abstracted watcher | [PENDING] | — |
| 3.2 | Windows impl: `ReadDirectoryChangesW` with IOCP | [PENDING] | 3.1 |
| 3.3 | Linux impl: `inotify` | [PENDING] | 3.1 |
| 3.4 | Wire watcher → `GameLibrary` debounced re-scan (500ms) | [PENDING] | 3.1, 2.5 |
| 3.5 | Verify: install Steam game → appears in library within 5s | [PENDING] | 3.4 |

### Phase 4: Epic/GOG/Xbox Sources

| # | Task | Status | Depends |
|---|------|--------|---------|
| 4.1 | `EpicSource` — read `.item` manifests | [PENDING] | 2.1 |
| 4.2 | `GOGSource` — read Galaxy SQLite DB | [PENDING] | 2.1 |
| 4.3 | `XboxSource` — WinRT GamePass API | [PENDING] | 2.1 |
| 4.4 | Wire all into `GameLibrary` + watcher paths | [PENDING] | 4.1-4.3, 3.4 |

### Phase 5: Playnite Deprecation

| # | Task | Status | Depends |
|---|------|--------|---------|
| 5.1 | Disable `config_playnite.auto_sync` by default | [PENDING] | 2.6 |
| 5.2 | Migration: tag existing Playnite entries as `source = "playnite_legacy"` | [PENDING] | 1.3 |
| 5.3 | Remove Playnite plugin copy from build (`copy_playnite_plugin` target) | [PENDING] | 5.1 |
| 5.4 | Flutter: hide Playnite UI, show deprecation notice if legacy entries exist | [PENDING] | 5.2 |

## Execution Order (Next Action)

**Next: Task 1.8** — Build verification. Task 1.5 (confighttp write-path) deferred — read path is complete.

## Architecture Reference

See `.private/docs/game-library-architecture.md` for full design, data model, and risk assessment.
