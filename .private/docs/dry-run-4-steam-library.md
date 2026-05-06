# Dry Run #4 — First-Time User: Deploy + Add Steam Games
**Date:** 2025-07-24  
**Scenario:** Brand new user, not registered, first time using app. After deploy, must add Steam games to library.

---

## STEP 1–11: Same as Dry Run #3 (all fixed)

Register → Confirm email (auto-polled) → Onboarding → Deploy → Auto-connect + Cloud config → Game Sources step

---

## STEP 12: Onboarding Game Sources Step

**User sees:** Game Sources step with Steam/Epic/Xbox/Manual tiles, each with "Connect" button

**User action:** Taps "Connect" on Steam tile

**Backend check:**
- `_SourceOptionTile.onConnect` for Steam → `// TODO: Open Steam connection flow`

**🔴 [CRITICAL] — Onboarding Steam "Connect" button is a no-op**
- The button does nothing. User taps it, nothing happens.
- User must skip this step, then navigate to Game Sources screen from Dashboard.
- **Impact:** Confusing UX — user thinks they connected but didn't.

---

## STEP 13: User Skips Game Sources → Dashboard

**User action:** Taps "Skip" or "Continue" on game sources step → "Go to Dashboard"

**User sees:** Dashboard with:
- Server Status Card (online, port 47990) ✅
- Setup Steps section showing "Connect a library" as PENDING
- "Sources: 0" stat

**✅ Status:** Dashboard correctly shows pending state.

---

## STEP 14: User Navigates to Game Sources Screen

**User action:** Taps "Open Sources" button on dashboard setup step (or sidebar "Game Sources")

**Backend check:**
- `context.go('/sources')` → routes to `GameSourcesScreen`
- `gameSourcesProvider` fetches `GET /api/game-sources` from server
- Server returns list of available sources (steam, epic, gog, xbox, manual)
- Steam shows as `connected: false`

**User sees:** Game Sources screen with source cards. Steam card shows "Connect" button.

**✅ Status:** Navigation works. Sources load from server.

---

## STEP 15: User Taps "Connect" on Steam Card

**User action:** Taps Steam card → card expands → taps "Connect" button

**Backend check:**
1. `_SourceCard._handleConnect()` called
2. Detects `widget.source.id == 'steam'`
3. Calls `api.steamAuthStart()` → `POST /api/game-sources/steam/auth/start`
4. Server generates OpenID URL: `https://steamcommunity.com/openid/login?...`
5. Returns `{ "action": "browser_login", "authUrl": "https://steamcommunity.com/openid/login?..." }`
6. App opens URL in external browser via `url_launcher`

**User sees:** 
- Browser opens with Steam login page
- App shows `_SteamAuthWaitBanner`: "Waiting for Steam login in browser…" with spinner

**⚠️ [FORENSIC ALERT] — Browser launch dependency**
- `url_launcher` must be configured for Windows desktop
- If user's default browser is not set, launch may fail silently
- **Check:** Is `url_launcher_windows` in pubspec.yaml?

---

## STEP 16: User Logs Into Steam in Browser

**User action:** Enters Steam credentials in browser → approves OpenID

**Backend check:**
1. Steam redirects to `GET /api/game-sources/steam/auth/callback?openid.mode=id_res&...`
2. Server calls `verify_steam_openid_response()` → validates signature with Steam servers
3. Extracts `steam_id` from `openid.claimed_id`
4. Stores `steam_id` in server config/state
5. Marks Steam source as `connected: true`

**Browser shows:** Success page (or redirect back)

**✅ Status:** Server-side OpenID flow is complete and secure.

---

## STEP 17: App Detects Steam Connected

**Backend check:**
1. App is polling `GET /api/game-sources` every 2s (`_pollForSteamAuth()`)
2. Detects `steam.connected == true`
3. Shows SnackBar: "Steam connected! Syncing library…"
4. Sets `_awaitingAuth = false`
5. Proceeds to sync flow

**User sees:** SnackBar confirmation, then sync steps begin

**✅ Status:** Polling works correctly. 120s timeout is reasonable.

---

## STEP 18: Steam Library Sync

**Backend check (multi-step):**
1. **Step "connect":** Already done (source is connected)
2. **Step "library":** 
   - Calls `api.steamWebLibrary()` → `POST /api/game-sources/steam/web-library`
   - Server fetches owned AppIDs from Steam Web API using stored session
   - Then calls `gameSourcesProvider.notifier.sync('steam')` → `POST /api/game-sources/steam/sync`
   - Server reads local Steam VDF/manifest files to detect installed games
3. **Step "posters":**
   - Polls `getSteamPrefetchProgress()` every 2s for up to 30s
   - Server downloads poster images from Steam CDN in background

**User sees:** Sync steps with checkmarks: Connect ✓ → Library ✓ → Posters ✓

**⚠️ [FORENSIC ALERT] — Steam Web Library requires browser session**
- `steamWebLibrary()` sends owned AppIDs that were captured during browser login
- If the browser session didn't capture AppIDs (e.g., user closed browser too fast), this returns empty
- The server endpoint expects `{"ownedAppIds": [570, 440, ...]}` in the POST body
- **But:** The Flutter app calls `api.steamWebLibrary()` with NO body — it expects the server to fetch them
- **Check:** Does the server have the Steam Web API key configured? Or does it rely on the browser capturing them?

---

## STEP 19: User Navigates to Library Screen

**User action:** Goes to Library (sidebar or back navigation)

**Backend check:**
- `libraryProvider` fetches `GET /api/library` from server
- Returns list of `LibraryGameDto` objects with `source: 'steam'`, `sourceId: '440'`, etc.
- Each game resolves poster URL via `resolveImageUrl()`:
  - `source == 'steam'` + numeric `sourceId` → `https://cdn.akamai.steamstatic.com/steam/apps/{id}/library_600x900.jpg`

**User sees:** Grid of Steam games with cover art from Steam CDN

**✅ Status:** Library loads correctly with Steam CDN posters.

---

## STEP 20: Steam Prefetch Progress Bar

**Backend check:**
- `steamPrefetchProgressProvider` polls `/api/library/steam/prefetch-progress` every 2s
- Shows progress bar at top of library while posters are being cached server-side
- Auto-dismisses when `progress.isDone == true`

**User sees:** Thin progress bar at top → disappears when done

**✅ Status:** Non-blocking UX, auto-dismisses.

---

## 📊 AUDIT SUMMARY

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| ~~1~~ | ~~Onboarding Steam "Connect" is a no-op (TODO)~~ | ~~🔴 Critical~~ | ✅ FIXED — `_finishAndOpenSources()` completes onboarding + navigates to `/sources` |
| ~~2~~ | ~~`url_launcher_windows` dependency check~~ | ~~⚠️ Medium~~ | ✅ VERIFIED — `url_launcher: ^6.3.1` in pubspec (includes Windows federated plugin) |
| 3 | Steam Web Library body question | ⚠️ Low | **By design** — server's `postSteamWebLibrary` requires browser-captured AppIDs (future feature). VDF sync handles all installed games. `game_sources_screen.dart` already handles the error gracefully (line 665: skips if `!success`). |

---

## 🔧 REQUIRED FIXES

### Fix #1 (Critical): Wire onboarding Steam "Connect" to actual flow

**Option A (Recommended):** Navigate to Game Sources screen from onboarding
```dart
onConnect: () => context.go('/sources'),
```
Then mark onboarding as complete after user returns.

**Option B:** Inline the Steam auth flow in onboarding (complex, not recommended for MVP)

**Option C (Best UX):** Replace TODO with navigation to Game Sources screen with pre-selected source:
```dart
onConnect: () => context.go('/sources?connect=steam'),
```

### Fix #2 (Medium): Verify url_launcher_windows

Check `pubspec.yaml` for `url_launcher_windows` or `url_launcher` with Windows support.

### Fix #3 (Medium): Verify Steam Web Library flow

Check if server fetches owned games autonomously after OpenID, or if client must POST AppIDs.
