# QA Dry Run Scenarios 10–14 — UI Interactions

**Date:** 2025-07-24  
**Focus:** User-facing interactions, navigation flows, error states, responsive behavior.

---

## Scenario 10: Library Browse & Game Launch (Happy Path)

**Persona:** Owner, connected to own server via LAN. Has 50+ Steam games synced.

### UI Flow (tap-by-tap)

1. App opens → Dashboard screen
2. Bottom nav: tap **Library** tab
3. Library loads → grid of game cards with posters (Steam CDN or cached)
4. Scroll down → lazy-loads more cards (pagination or infinite scroll?)
5. Tap search icon → keyboard opens, filter bar appears
6. Type "Elden" → grid filters to "Elden Ring"
7. Tap game card → **Game Detail Sheet** slides up:
   - Poster (large)
   - Title, developer, genres
   - "Play" button (green, prominent)
   - "Installed" badge
   - Metadata: description, release date
8. Tap **Play** → confirmation dialog: "Launch Elden Ring on Gaming PC?"
9. Tap **Confirm** → API call: `POST /api/apps/{uuid}/launch`
10. Stream starts → full-screen video with overlay controls

### UI Questions to Audit

| # | Question | Expected Behavior | Risk if Missing |
|---|----------|-------------------|-----------------|
| 1 | What happens if poster fails to load? | Placeholder with game title text | Blank cards confuse user |
| 2 | Is there a loading skeleton while library fetches? | Shimmer/skeleton cards | Flash of empty screen |
| 3 | What if game is "owned" but not "installed"? | Show "Not Installed" badge, disable Play button | User taps Play → confusing error |
| 4 | What if launch fails (server error)? | Snackbar: "Failed to launch. Is the game installed?" | Silent failure |
| 5 | Does search persist across tab switches? | Clear on tab switch (standard) | Stale filter confuses user |
| 6 | How many games before performance degrades? | 500+ should be fine with ListView.builder | If using Column+map → OOM on large libraries |
| 7 | Is there pull-to-refresh? | Yes — re-fetches library from server | Stale data after game install |
| 8 | Game detail sheet — swipe down to dismiss? | Yes (DraggableScrollableSheet) | User stuck in modal |

---

## Scenario 11: Server Settings — Change Resolution/FPS

**Persona:** Owner, on Dashboard, wants to change stream quality before playing.

### UI Flow

1. Dashboard → tap **Settings** (gear icon in app bar or side nav)
2. Settings screen loads with sections:
   - **Stream Quality** (resolution, FPS, bitrate)
   - **Network** (ports, UPnP)
   - **Security** (password, API tokens)
   - **Advanced** (encoder, HDR)
3. Tap **Stream Quality** section
4. See current values: 1080p / 60fps / 20 Mbps
5. Tap resolution dropdown → options: 720p, 1080p, 1440p, 4K
6. Select **1440p**
7. FPS auto-adjusts suggestion to 60fps (or stays)
8. Tap **Save** button
9. API call: `PATCH /api/config` with `{"resolution": "1440p"}`
10. Success snackbar: "Settings saved"
11. If stream is active: "Changes will apply to next session"

### UI Questions to Audit

| # | Question | Expected Behavior | Risk if Missing |
|---|----------|-------------------|-----------------|
| 1 | Are settings fetched from server or cached? | Fetch on screen open (GET /api/config) | Stale values shown |
| 2 | What if user is a viewer (shared)? | Settings section hidden or read-only | 403 error on save attempt |
| 3 | Validation: can user set 4K + 120fps + 100Mbps? | Warn about bandwidth requirements | Server chokes, bad UX |
| 4 | Does PATCH send only changed fields? | Yes — partial update | Full config overwrite risk |
| 5 | What if server is unreachable when saving? | Error: "Could not reach server" | Spinner forever |
| 6 | Is there an "Undo" or "Reset to defaults"? | Reset button per section | User stuck with bad config |
| 7 | Sensitive fields (password) — shown or masked? | Masked with reveal toggle | **[SECURITY]** Passwords visible to shoulder-surfers |
| 8 | Does the viewer role see the Settings tab at all? | No — hide from nav for viewers | Confusing dead-end |

---

## Scenario 12: Server Sharing — Owner Invites a Friend

**Persona:** Owner wants to share server with a friend. On Dashboard.

### UI Flow

1. Dashboard → tap **Sharing** tab (or icon in server card)
2. Sharing screen shows:
   - **Members** list (currently just owner)
   - **Invite** button
3. Tap **Invite** → bottom sheet:
   - "Generate invite code" button
   - Role selector: Viewer / Operator
   - Optional: expiry (1 day, 7 days, never)
4. Tap **Generate** → 6-char code appears (e.g., `X7K9M2`)
5. Copy button → code copied to clipboard
6. Share via system share sheet (WhatsApp, iMessage, etc.)
7. Friend enters code in their app → appears in Members list
8. Owner sees new member with role badge
9. Owner can tap member → change role or revoke access

### UI Questions to Audit

| # | Question | Expected Behavior | Risk if Missing |
|---|----------|-------------------|-----------------|
| 1 | Can viewer see the Sharing tab? | No — admin only | Viewer tries to invite → 403 |
| 2 | Is the invite code single-use or multi-use? | Configurable (default: single-use) | Code shared publicly → unlimited access |
| 3 | What happens when code expires? | "Code expired" error on accept | Confusing silent failure |
| 4 | Can owner revoke mid-session? | Yes → member's next API call gets 403 | Active stream continues until next auth check |
| 5 | Real-time member list update? | Poll every 30s or Supabase realtime | Owner doesn't see friend joined |
| 6 | Max members limit? | Show count: "2/5 members" | Unlimited sharing → server overload |
| 7 | What if owner is offline? | Invite code still works (Supabase-side) | But friend can't connect until server online |
| 8 | Role change propagation | Immediate on next API call (RBAC registry update) | Stale role until server restart |

---

## Scenario 13: Dashboard — Server Offline, Wake-on-LAN

**Persona:** User at home, server PC is sleeping. Wants to wake it and play.

### UI Flow

1. Open app → Dashboard
2. Server card shows:
   - Server name: "Gaming PC"
   - Status: **Offline** (gray dot, "Last seen 2 min ago")
   - **Wake** button (visible because MAC is configured)
3. Tap **Wake** button
4. Confirmation: "Send wake signal to Gaming PC?"
5. Tap **Confirm** → API call: `POST /api/wol` with MAC address
6. Button changes to "Waking…" with spinner (15s timeout)
7. Server boots → cloud agent starts → heartbeat arrives
8. Server card transitions: Offline → **Online** (green dot)
9. "Gaming PC is ready" notification/snackbar
10. User taps server → connection racer → Library loads

### UI Questions to Audit

| # | Question | Expected Behavior | Risk if Missing |
|---|----------|-------------------|-----------------|
| 1 | Where does WoL request go if server is offline? | **PROBLEM**: WoL endpoint is ON the server! Can't reach it if offline | Need alternative: send WoL from another device on same LAN, or Supabase Edge Function |
| 2 | Is MAC address stored in cloud profile? | Should be — needed for remote WoL | If only on server config, can't wake remotely |
| 3 | What if WoL fails (wrong MAC, server not on LAN)? | Error after timeout: "Could not wake server" | Infinite spinner |
| 4 | Multiple NICs — which MAC? | Config should specify WoL MAC explicitly | Wrong NIC → packet ignored |
| 5 | WoL over internet (WAN)? | Not possible with standard WoL (broadcast only) | Button shown but can't work remotely — misleading |
| 6 | Polling for server wake-up | Poll presence every 5s for 60s after WoL sent | User manually refreshes |
| 7 | Wake button visibility | Only show if MAC configured AND user is on same LAN | Button shown remotely → always fails |
| 8 | Permission: who can wake? | Operator+ (already enforced server-side) | Viewer sees button but gets 403 |

### **[FORENSIC ALERT] Critical Design Flaw:**
WoL endpoint is on the server itself (`POST /api/wol`). If the server is sleeping/off, the endpoint is unreachable. This means:
- **LAN WoL works** only if another device on the LAN proxies the request
- **Remote WoL is impossible** via the current architecture
- **Fix options:**
  1. Flutter app sends WoL packet directly (UDP broadcast) when on same LAN
  2. Supabase Edge Function + a LAN relay agent
  3. Router-level WoL forwarding (user configures port forward for UDP 9)

---

## Scenario 14: Error States — Connection Failures & Recovery

**Persona:** User experiencing various failure modes.

### Sub-scenario 14a: Server unreachable after tap

1. User taps server in switcher
2. Connection racer starts → all paths fail (LAN timeout, WAN timeout, TURN timeout)
3. After 10s: error screen appears
4. Shows: "Could not connect to Gaming PC"
5. Suggestions: "Check that the server is running", "Check your network"
6. **Retry** button
7. **Back** button (return to server switcher)

### Sub-scenario 14b: Stream drops mid-game

1. User is streaming, network hiccup occurs
2. Video freezes for 2s
3. Overlay appears: "Reconnecting…" with progress indicator
4. If reconnect succeeds (< 5s): stream resumes, overlay disappears
5. If reconnect fails (> 10s): "Connection lost" screen
6. Options: **Reconnect** (try again) or **End Session** (return to library)
7. Game state on server: paused or still running?

### Sub-scenario 14c: API error during library load

1. User on Library tab, pulls to refresh
2. Server returns 500 (internal error)
3. Show: error card with retry button (not blank screen)
4. Previous cached data still visible below error banner
5. Tap retry → success → error banner disappears

### Sub-scenario 14d: Auth expired during use

1. User browsing library, Supabase JWT expires
2. Next API call returns 401
3. App interceptor catches → calls `refreshSession()`
4. If refresh succeeds: retry original request transparently
5. If refresh fails: redirect to login screen with message "Session expired, please sign in again"
6. After re-login: return to previous screen (not Dashboard root)

### UI Questions to Audit

| # | Question | Expected Behavior | Risk if Missing |
|---|----------|-------------------|-----------------|
| 1 | Is there a global error boundary? | Yes — catches unhandled exceptions, shows recovery UI | App crashes to white screen |
| 2 | Do error screens have consistent styling? | Yes — shared ErrorCard widget | Each screen has different error UX |
| 3 | Is there offline mode for cached data? | Partial — show last-known library | Blank screens when offline |
| 4 | Retry with exponential backoff? | Yes for auto-retry; immediate for manual retry button | Hammering server with retries |
| 5 | Deep link restoration after re-login? | Return to previous route | Always dumps to Dashboard |
| 6 | Stream reconnect — is game paused? | Server should auto-pause on client disconnect | Game runs unattended → wastes GPU |
| 7 | Multiple simultaneous errors? | Queue snackbars, don't stack | UI covered in error toasts |
| 8 | Network change (WiFi→4G) mid-use? | Racer re-evaluates path transparently | Connection drops, no recovery |

---

## Cross-Scenario UI Risk Summary

| Risk | Scenarios | Severity | Status |
|------|-----------|----------|--------|
| **WoL architecture flaw** (endpoint on sleeping server) | 13 | 🔴 Critical | **DESIGN BUG** — needs rethink |
| No stream reconnect logic | 14b | 🔴 High | **NOT IMPLEMENTED** |
| Sensitive config exposed to viewers | 11 | 🔴 High | **NOT IMPLEMENTED** |
| No "Not Installed" state handling in library | 10 | ⚠️ Medium | Needs verification |
| Settings tab visible to viewers | 11 | ⚠️ Medium | Needs role-based nav |
| No loading skeletons | 10, 11 | ⚠️ Low | Polish item |
| No offline cached data | 14c | ⚠️ Low | Polish item |
