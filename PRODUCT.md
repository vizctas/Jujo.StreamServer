# Product

<!-- impeccable:product-schema 1 -->

Scope of this record: the **Jujo.Stream browser client** (`/webrtc`), not the C++ server.

## Platform

web

## Users

- **The owner** of one or more Jujo.Stream servers (Windows PCs), controlling them remotely from a phone on mobile data (4G) or from another computer's browser: the Windows desktop and games.
- **Invited guests** of a server (members and Co-Op), weighted equally with the owner. A guest with the viewer role only joins what is already running; it never launches apps or manages security.
- Both sign in with their own JUJO.CLOUD account (email, password, TOTP). Spanish speakers; copy is neutral Spanish (no voseo, no Spain-only forms).

## Product Purpose

Open any of your Jujo.Stream PCs from any browser, without installing anything, with the same experience as the Android client: pick a server, pick a game or the desktop, stream it with touch, keyboard and gamepad. Success: from a phone on 4G, a signed-in device reaches a playing stream in a few taps, every game poster is visible, and leaving the stream gives the PC its screen back.

## Positioning

A self-hosted streaming suite whose browser client is a full launcher, tied to a JUJO.CLOUD account that lists your own and shared PCs, with device trust and TOTP in front of remote control. The self-hosted Sunshine web clients it competes with (moonlight-web, moonlight-web-stream, Vibepollo /webrtc) document features but not a designed library, loading screen or focus style (research: streaming-launchers).

## Operating Context

- Served by each server at `https://<server>/webrtc` (self-signed certificate, accepted once per origin). Reached on the LAN, from the WAN via UPnP, or behind a reverse proxy.
- Phones in portrait and landscape (Android Chrome, iPhone Safari), and desktop browsers. While streaming, the phone GPU is also decoding WebRTC video.
- Sign-in steps: JUJO.CLOUD email + password, 6-digit TOTP, then the server's password only when the server requires it (owner path; guests skip it). The device is then trusted for 30 days by an HttpOnly cookie.
- The Android client (Jujo.StreamClient) is the reference experience: focus mode with the account's servers, then a launcher.

## Capabilities and Constraints

- Stack: vanilla TypeScript bundled by esbuild (`web-src/webrtc/build.ps1`) into one static page and one script (`src_assets/common/assets/web/`). No framework; no new dependency without asking.
- Data: `/api/auth/status`, `/api/auth/cloud-login`, `/api/auth/login`, `/api/apps` (app list), `/api/apps/<uuid>/cover` (poster), `/api/webrtc/*` (stream). JUJO.CLOUD (Supabase REST) during sign-in only: the browser signs out of Supabase right after the server accepts the device, so the server list must be read during the handshake (`user_server_profiles`, shared and Co-Op RPCs) and cached locally.
- Another server is another origin: jumping there needs its own one-time device trust.
- Hero art per game is not exposed over the WAN yet (posters are). Live status of other servers is a snapshot (`last_seen_at`), not a probe.
- Undecided: hero art endpoint, a "close game" exit, gamepad navigation in the launcher, iPhone home-screen install guidance.

## Brand Commitments

- Name: **JUJO.Stream**; account: **JUJO.CLOUD**. Wordmark "JUJO" white + ".Stream" cyan #22D3EE, red-pink hexagon logo #F43F5E (Jujo.StreamClient jujo_brand_title.dart).
- Palette **Cielo** (user, 2026-11-16): neutral near-black surfaces, one electric-blue accent (#4C82FF), white pill primary, sky gradient (#1E4FE6 / #3D8FE0 / #A9C1D9 / #1A1D3D) only as imagery. It replaces the Android Sunset preset on the web for a more professional look; layout and journey still mirror the Android client "as closely as possible" (user). Avoid AI-slop tells: no colored glows, gradient text or tinted cards.
- User reference for sign-in: a slowly moving smooth gradient with the account inputs in a bottom sheet (`.bunshin/harvest/img/reference-login-sheet.png`).

## Evidence on Hand

- Android client screenshots (reference only, never shipped: they contain personal photos and an email): `.bunshin/harvest/img/android-0*.png`.
- Real game posters served by the user's server at `/api/apps/<uuid>/cover`.
- No testimonials, figures or third-party claims exist and none may be invented.

## Product Principles

1. **Parity with the Android client, adapted to touch and desktop**: same journey and identity, not TV-sized type or TV-only focus behaviour.
2. **Security is visible but calm**: account, TOTP and device trust stated plainly; errors never shake or blame.
3. **The stream owns the GPU**: anything decorative stops before the stream starts.
4. **Every real asset loads, or says so**: posters load with a designed fallback, never a broken box.
5. **Leaving is safe**: exiting returns the PC's screen; guests never see controls they cannot use.

## Accessibility & Inclusion

Keyboard and gamepad reachable, visible focus, inputs at 16 px or larger (no iOS zoom), reduced-motion honoured with a pause for any looping background (WCAG 2.2.2).
