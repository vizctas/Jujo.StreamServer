---
version: 1
slug: "src-assets-common-assets-web-index-html"
primary_target: "src_assets/common/assets/web/index.html"
related_targets: ["web-src/webrtc/main.ts"]
---

THESIS
The Jujo.Stream Android client, carried to the browser: sign in over a slowly moving sky gradient, choose a server in a focus-mode carousel, then play from its Hero/Classic launcher, in the professional "Cielo" palette.

OWN-WORLD
The product's own Android client (Jujo.StreamClient), established world, not reinvented. Palette "Cielo" (user decision 2026-11-16, replaces the Android Sunset preset for a more professional look; references: sky-gradient sign-in with neutral dark sheet and white pill CTA): neutrals --bg #0A0B0F, --surface #131418, --surface-2 #1B1D23, --surface-3 #24272E, text #F4F5F7 / #A3A6AE / #8A8D96; one accent blue #4C82FF (#7FA6FF on imagery), never a fill behind text; primary = white pill #F4F5F7 with #0A0B0F label; sky gradient stops #1E4FE6 / #3D8FE0 / #A9C1D9 / #1A1D3D for imagery only (sign-in ground, generated avatars, placeholders); status #32D583 / #F5A524 / #FF5A4F. Brand fixed: hexagon logo #F43F5E, "JUJO" white + ".Stream" #22D3EE (jujo_brand_title.dart). Status ring colours: online #32D583, in use #F5A524, offline #FF5A4F. Type: system sans (Roboto on Android; system-ui on web), weights 700-900 for titles as the client does. Comparable premium references for craft (from research synthesis): Apple tvOS focus, Android TV immersive list, Linear/Stripe sign-in step motion.

STORY
1. Sign-in: full-bleed sky gradient drifting slowly; a bottom sheet (phone) / centered sheet (desktop >= 768px) holds JUJO.CLOUD email + password, then the 6-digit code (one input, auto-submit), then the server password only when the server asks (owner). Calm errors, never a shake.
2. "Sincronizando servidores": the account's servers (own, shared, Co-Op) read during the handshake and cached locally.
3. Focus mode: one server at a time, centered, neighbours peeking (viewportFraction 0.82 from focus_mode_screen.dart:81), page dots, swipe / arrow keys / buttons; the current server first. Tapping the centered server enters its launcher; another server is another origin: navigate to its address (its own one-time device trust).
4. Launcher (Hero layout, hero_theme.dart:585-809, with Classic focus tokens): full-bleed backdrop art of the focused game (poster until a hero endpoint exists) under legibility scrims, centered title, genre chips when present, Jugar / Continuar / Unirse, horizontal poster row at the bottom with the focused poster enlarged + ring; every poster loads from /api/apps/<uuid>/cover with a title-card fallback.
5. Connecting screen (designed: game art, server name, settings summary), stream, overlay toolbar, exit back to the launcher.

FIRST VIEWPORT
Phone portrait after sign-in: brand top-left, settings top-right; centered 180px circular server avatar (generated brand art when the server has no image) with a 3.5px status ring and halo, server name bold, address grey, status line cyan, role pill for guest servers; neighbours peeking at the edges; page dots (8px dots, active 24x8 accent pill) above the bottom safe area; accent wave ribbons behind at low alpha. Desktop: same centered composition at larger scale, arrow buttons at the sides.

FORM
seed: none (unavailable). Surface roll 6557a559 ran degraded (no challengers); dealt structures 7, 4, 2; the user locked structure 2 "Modo foco, luego launcher" (focus-carousel).

FINISH
Android-parity identity adapted to touch and desktop: text never below 13px on phones (the client's 9-10px TV sizes are not copied), inputs 16px+, hover = focus on pointer devices, standard controls only, one curve cubic-bezier(.2,0,0,1) except the sheet, everything decorative stops before the stream starts.

INTERACTION THESIS
Timing 100-500ms: press scale .98 in 100ms; focus/hover 130ms scale 1.06 + 3px accent ring with 2px gap (classic_tokens.dart:37-44); backdrop crossfade 220ms after a 200ms settle (hero_theme.dart:229-234); sign-in steps 280ms (old step fades + scale .98, new step in from 10px); bottom sheet 500ms cubic-bezier(.32,.72,0,1); server change 350ms ease-out (focus_mode_screen.dart:897-913). Hover behaves exactly like focus. Scroll: native scroll-snap rows and carousel, no scroll-triggered reveals. Forbidden: bounce, elastic, error shakes, animated box-shadow or blur radius, parallax, Ken Burns, WebGL/canvas shaders, looping motion during a stream. prefers-reduced-motion: every loop stops, transitions become 0-150ms opacity fades, the gradient freezes.

ALLOWED PATTERNS
Slowly drifting pre-blurred gradient blobs on the sign-in only (transform-only, paused offscreen, pause control); avatar float +/-6px over 5.5s and status-ring halo pulse via opacity (focus mode only); accent sine-wave ribbons in focus mode at low alpha (transform/opacity only), stopped before the stream; page-dot pill; title-card fallback when a poster fails; brand gradient on the hexagon tile.
