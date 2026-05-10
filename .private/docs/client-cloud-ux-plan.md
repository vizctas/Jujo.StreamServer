# Client Cloud UX Plan

## Observed pipeline failure

1. Client login lived inside the overflow menu. On Android/TV this is discoverability failure.
2. TOTP setup was dismissible. Losing the modal left the account signed in with `aal1`, so cloud sync/pair could continue to weak or confusing states.
3. Server cloud heartbeat can publish `https://localhost:47990` when LAN detection fails. Android imports that as the phone's localhost, so the card appears as LOCALHOST and offline.
4. Server display name can be empty, so client falls back to URL host instead of a real computer name.
5. Admin app cloud registration failed against the local server with `CERTIFICATE_VERIFY_FAILED`; root cause is cloud pairing used default `http.Client` against the server's self-signed HTTPS certificate instead of the app's self-signed trust path.
6. After a fresh server install, the product has no explicit "auto-register this server in cloud" decision point.
7. After reinstall, game source state can look connected while Steam sync returns no games until logout/login; source sync needs clearer failure state and re-auth CTA.
8. Client poster retrieval regressed after server endpoint changes; library art URL contract needs a focused trace.
9. There is no stylish clients management surface for per-client permissions or cloud-device default permissions.
10. Dashboard fullscreen layout loses dashboard shape and forces scrolling.
11. Server admin cloud accounts also need mandatory 2FA before onboarding or dashboard access.
12. Dashboard setup treated client pairing as mandatory, even though pairing is optional.
13. "Verify readiness" could stay incomplete because it was tied to pairing/playability instead of host readiness.

## Chosen approach

Ship a focused hardening pass now, leave full-screen intro for next UI milestone.

- Add a visible cloud account action on PC view and Focus Mode.
- Make it gamepad focusable and route through the same cloud auth/TOTP modal.
- Treat TOTP as mandatory before cloud sync or cloud pair.
- Keep a logout path in the cloud action.
- Server must publish reachable LAN URL and hostname fallback, not localhost.
- Client must reject localhost cloud URLs on non-desktop/mobile cloud import.
- Admin cloud pairing must trust the local server self-signed cert using the same local-server trust model as other admin APIs.
- Server admin cloud accounts must pass a route-level 2FA stop screen before onboarding/dashboard; local-only users bypass it.
- Setup completion must not require paired clients. Pairing is optional and can happen later.
- Add next epics for installer auto-register, game source re-sync/re-auth, poster contract, clients permissions, and dashboard fullscreen redesign.

## Acceptance criteria

- A user can find "Jujo Cloud" without opening More menu.
- Gamepad can focus and activate the cloud action.
- If TOTP setup/verify modal is dismissed, cloud sync and cloud pair stay blocked.
- If already signed in with `aal1`, the next cloud action resumes 2FA instead of syncing.
- User can sign out of Jujo Cloud from the cloud action.
- Android never imports `localhost` as a cloud server endpoint.
- Server profile name defaults to machine hostname when no configured server name exists.
- Server profile URL uses LAN IP when available; no `localhost` heartbeat for cloud profiles.
- Admin app can register/pair a local self-signed server into cloud without TLS failure.
- Cloud users cannot leave the 2FA stop screen until Supabase reports `aal2`; local-only users are unaffected.
- Dashboard setup is complete when playable games exist, not when a client is paired.
- "Pair a device" is presented as optional, not a hard blocker.
- "Verify readiness" is not blocked by pairing state.

## Next epics

1. Installer/onboarding: after server install, ask to auto-register into Jujo Cloud. If user says no, explain same-account client/server pairing can still register later.
2. Game sources: after reinstall, show "Sync each source" reminder. If Steam sync yields zero games with existing session, surface "reconnect Steam" instead of pretending sync worked.
3. Client account: add visible cloud account/logout chip on PC and Focus Mode, plus a compact account state dialog.
4. Posters: traced server `/applist` -> client `/appasset` URL -> image fetch. Root cause: UI poster fetches did not use the paired client certificate while `/appasset` requires it. Patched client poster cache to use the client certificate only for `/appasset`.
5. Clients permissions: add server-side clients management page/dialog with per-client permission toggles and a default "grant trusted cloud devices" policy.
6. Dashboard: redesign fullscreen dashboard into a no-scroll operational grid with dense cards, responsive breakpoints, and current palette tokens.
7. Server admin 2FA: route-level cloud-only stop screen implemented; next add recovery/unenroll account management after live validation.

## Deferred

- Full-screen first-run intro with Create/Login cloud CTA.
- Rich account management screen for 2FA reset/unenroll.
