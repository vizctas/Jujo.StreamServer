# Planning Log

## [2025-07] Full-Stack Bug Audit & Fix Session

### Scope

End-to-end audit of the Jujo.StreamServer / Vibepollo web UI targeting four
reported bugs, followed by targeted fixes. Backend (C++) and frontend (Vue 3 /
TypeScript) both reviewed.

---

### Bugs Audited

#### Bug 1 — Login screen on every page refresh

**Root cause:** Session tokens are always written to `sessionStorage` only (even
when `remember_me = true`). Opening a new browser tab or restarting the browser
clears `sessionStorage`, forcing a new login even though the refresh token in
`localStorage` is still valid.

**Fix — `http.ts`:**
- `saveTokens()`: when `remember = true`, also write the session token to
  `localStorage` so it persists across browser sessions.
- `loadTokens()`: fall back to `localStorage` for the session token when
  `sessionStorage` is empty.
- `clearSessionTokens()`: also remove `localStorage[SESSION_KEY]` on logout.

---

#### Bug 2 — Login modal inputs visually overlay background content

**Root cause:** The blur overlay behind `LoginModal` uses 60–70 % opacity
(`from-white/70 via-white/60`). Background page content (inputs, cards) bleeds
through the semi-transparent overlay and is visible — and visually "behind" —
the login form fields.

**Fix — `App.vue`:**
- Raised blur overlay opacity to 92–95 % (`from-white/95 via-white/92`).
- Added `pointer-events: none` to the overlay so it cannot accidentally capture
  clicks intended for the modal.

---

#### Bug 3 — Steam pipeline fails silently (CORS + no user feedback)

**Root cause:** `captureSteamWebLibrary()` does a cross-origin credentialed
fetch to `store.steampowered.com`. Steam's CORS policy rejects it unless the
user is logged into Steam in the same browser context. The function silently
returned `false`, the pipeline steps showed `done` regardless, and no user-
visible error was surfaced.

**Fix — `GameSourcesView.vue`:**
- When `captureSteamWebLibrary()` returns `false`, mark the `fetch` pipeline
  step as `error` (not silently `done`).
- Display a `warning` `actionMessage` explaining the CORS restriction and
  instructing the user to log into Steam in the same browser.
- Continue with the backend-side local installed-game detection fallback.

---

#### Bug 4 — Playnite "Disable" button has no visible effect

**Root cause (two-pronged):**
1. `disconnectSource('playniteLegacy')` called `loadGameSources()` but not
   `appsStore.loadApps()`. The apps store kept stale data with Playnite games,
   and `LibraryView.fallbackGames` (derived from `appsStore.apps`) still
   rendered them.
2. `LibraryView` does not reactively re-fetch the library API after an external
   game-source change — it only loads once on `onMounted`.

**Fix — `GameSourcesView.vue`:**
- `disconnectSource('playniteLegacy')` now calls `appsStore.loadApps(false)`
  after the disconnect action, forcing an immediate store refresh.

**Fix — `LibraryView.vue`:**
- Added `watch(() => apps.value.length, () => loadLibrary())` so the library
  view re-fetches from `/api/library/games` whenever the apps store changes.
  The API already filters Playnite games when the source is disabled, so the
  correct (empty Playnite) list is returned automatically.

---

### Files Changed

| File | Change |
|---|---|
| `src_assets/common/assets/web/http.ts` | Session token localStorage persistence (Bug 1) |
| `src_assets/common/assets/web/App.vue` | Overlay opacity + pointer-events fix (Bug 2) |
| `src_assets/common/assets/web/views/GameSourcesView.vue` | Steam error feedback + Playnite disconnect refresh (Bugs 3, 4) |
| `src_assets/common/assets/web/views/LibraryView.vue` | Reactive library reload on apps change (Bug 4) |
