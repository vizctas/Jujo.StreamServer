## [2026-05-02 18:27] - UI/UX and Product Flow Audit

[DONE] Inspect `.private/ui_ux` planning files
[DONE] Compare planned UI/UX tasks against current Vue implementation
[DONE] Identify navigation, visual-system, Playnite dependency, and pairing risks
[DONE] Define revised product architecture for dashboard, library, game sources, settings, and pairing
[DONE] Approve implementation sequence before code changes

## [2026-05-02 18:35] - Navigation and Onboarding Flow Design

[DONE] Define primary user journey from install to first stream
[DONE] Choose navigation model for dashboard, pairing, library sources, library, clients, and settings
[DONE] Define onboarding states for first run, partial setup, ready, and error recovery
[DONE] Identify backend contracts needed by the future UI
[DONE] Produce approved flow spec before implementation

## [2026-05-02 19:05] - Implement Navigation and Onboarding Slice

[DONE] Add operational app shell and sidebar navigation
[DONE] Add Home checklist using recoverable setup steps
[DONE] Add Game Sources initial connection surface
[DONE] Add System readiness initial surface
[DONE] Add Library route compatible with current apps store
[DONE] Verify frontend build
[PENDING] Resolve existing global typecheck failures outside this slice

## [2026-05-02 19:33] - Implement Setup Backend Contracts

[DONE] Add `/api/setup/status` contract for onboarding progress
[DONE] Add `/api/game-sources` contract for source connection state
[DONE] Add `/api/system/readiness` contract for host readiness checks
[DONE] Connect Home, Game Sources, and System views to the new contracts
[DONE] Verify frontend build
[PENDING] Run native C++ build after CMake/compiler toolchain is available

## [2026-05-02 19:42] - Stabilize Frontend Typecheck Surface

[DONE] Remove duplicate app type fields that block `vue-tsc`
[DONE] Fix exact optional property errors in app edit and config components
[DONE] Fix slot/index signature access errors in touched UI components
[DONE] Re-run frontend build
[DONE] Start local preview server for visual review
[DONE] Resolve remaining `vue-tsc` failures in Troubleshooting, WebRTC, Client Management, and test config

## [2026-05-03 00:27] - Store-Integrated Game Library Foundation

[DONE] Define account-connected source model for Steam, Epic, GOG, Xbox, Manual, and Playnite Legacy
[DONE] Add source auth/sync contracts for connected, connecting, error, and sync states
[DONE] Add metadata/poster contract for owned and installed games
[DONE] Update Game Sources UI with enabled actions and provider-specific states
[DONE] Add first backend foundation without committing provider secrets or unsafe token storage
[DONE] Add normalized `/api/library/games` contract for owned, installed, playable, poster, and metadata state
[DONE] Update Library UI to consume normalized game records with source and install filters
[DONE] Implement encrypted token vault before persisting provider credentials
[DONE] Implement first Steam adapter using browser sign-in, public library sync, and local manifest detection
[DONE] Replace Steam API-key configuration with browser sign-in/OpenID connection flow
[DONE] Implement Steam installed-game matching from local Steam library manifests
[DONE] Add UI bridge to convert installed Steam library games into server app entries
[DONE] Initialize required native third-party submodules for CMake configuration
[DONE] Implement Epic installed-game matching from local launcher manifests
[PENDING] Implement installed-game matching for GOG/Xbox local launchers
[PENDING] Implement OAuth callbacks for Epic, GOG, and Xbox provider adapters
[PENDING] Install or provide Windows GCC/MinGW-compatible toolchain and OpenSSL package for native build verification

## [2026-05-03 12:00] - Stabilize Login and Steam Source Reload

[DONE] Trace login refresh 401 and modal trigger path
[DONE] Fix token persistence so reload preserves remembered admin sessions
[DONE] Fix dark login input rendering so native/autofill surfaces do not override design
[DONE] Trace Steam source state and manifest title mapping
[DONE] Fix Steam connected button copy and layout legibility
[DONE] Add or update focused regression tests
[DONE] Run frontend verification
[PENDING] Complete native link verification after `cmake --build build --target sunshine` stops hanging at link step

## [2026-05-03 13:50] - Complete Steam Library Semantics

[DONE] Separate Steam owned-library sync from local install fallback
[DONE] Add optional Steam Web API key support for full owned game names and uninstalled entries
[DONE] Auto-import installed Steam games into server apps after sync
[DONE] Allow Playnite Legacy source disconnect/suppression in source state
[DONE] Update Game Sources UI to expose Steam API key configuration and Playnite disconnect
[DONE] Verify frontend build and targeted C++ compilation

## [2026-05-03 14:07] - Steam Web Library Without API Key

[DONE] Add browser-captured Steam Store owned AppID import endpoint
[DONE] Prefer captured Steam web library over API-key sync
[DONE] Move Steam API key UI into private-account fallback
[DONE] Trigger browser dynamicstore capture during Steam sync
[DONE] Verify frontend build and targeted C++ compilation



## [2026-05-03 14:39] - Enable Metadata Provider Configuration

[DONE] Add encrypted metadata provider state storage
[DONE] Expose SteamGridDB provider configuration endpoint
[DONE] Report configured metadata status instead of contract-only pending state
[DONE] Document provider storage and fetch contract
[DONE] Verify targeted C++ compilation



## [2026-05-03 15:16] - Steam Native Metadata and Poster Sync

[DONE] Add Steam appdetails cache by AppID
[DONE] Enrich Steam games with Store descriptions, release dates, developers, publishers, genres
[DONE] Add Steam CDN poster URLs and local poster cache endpoint
[DONE] Mark Steam metadata and poster states accurately in library contracts
[DONE] Verify frontend typecheck/build and targeted C++ compilation



## [2026-05-03 20:25] - Critical Steam Lazy Library Pipeline

[DONE] Prefer Steam GetOwnedGames when fallback API key is configured without disconnecting existing web-login state
[DONE] Make Steam metadata and poster retrieval lazy in a detached background worker
[DONE] Persist Steam enrichment progress for real-time Library refresh
[DONE] Hide Playnite/manual sources from active Library/Game Sources UI while preserving state
[DONE] Align Library filter controls with consistent button sizing and responsive layout
[DONE] Verify frontend typecheck/build and targeted C++ compilation


