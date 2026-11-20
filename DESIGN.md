---
name: JUJO.Stream browser client
description: The Jujo.Stream Android client carried to the browser at /webrtc, in the "Cielo" palette.
colors:
  bg: "#0A0B0F"
  surface: "#131418"
  surface-2: "#1B1D23"
  surface-3: "#24272E"
  fill-1: "rgba(255, 255, 255, .04)"
  fill-2: "rgba(255, 255, 255, .07)"
  fill-3: "rgba(255, 255, 255, .11)"
  line: "rgba(255, 255, 255, .08)"
  line-strong: "rgba(255, 255, 255, .14)"
  scrim: "rgba(10, 11, 15, .72)"
  text: "#F4F5F7"
  muted: "#A3A6AE"
  faint: "#8A8D96"
  accent: "#4C82FF"
  accent-2: "#7FA6FF"
  accent-soft: "rgba(76, 130, 255, .16)"
  primary: "#F4F5F7"
  primary-hover: "#FFFFFF"
  primary-press: "#E3E5EA"
  on-primary: "#0A0B0F"
  sky-deep: "#1E4FE6"
  sky-mid: "#3D8FE0"
  sky-haze: "#A9C1D9"
  sky-dusk: "#1A1D3D"
  ok: "#32D583"
  warn: "#F5A524"
  err: "#FF5A4F"
  brand-red: "#F43F5E"
  brand-cyan: "#22D3EE"
typography:
  display:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "clamp(30px, 7.5vw, 60px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  body-sub:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 600
  button:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "16px"
    fontWeight: 700
  wordmark:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "17px"
    fontWeight: 800
    letterSpacing: "0.2px"
  code-entry:
    fontFamily: "Roboto, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "26px"
    fontWeight: 700
    letterSpacing: "0.45em"
    fontFeature: "tnum"
rounded:
  chip: "8px"
  card: "10px"
  field: "14px"
  tile: "16px"
  sheet: "24px"
  pill: "999px"
spacing:
  gutter-phone: "16px"
  gutter-desktop: "32px"
  gap-sm: "8px"
  gap-md: "12px"
  gap-lg: "14px"
  sheet-pad-desktop: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-press:
    backgroundColor: "{colors.primary-press}"
  button-secondary:
    backgroundColor: "{colors.fill-1}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.fill-2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    textColor: "{colors.text}"
  iconbtn:
    backgroundColor: "{colors.fill-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    size: "44px"
  iconbtn-hover:
    backgroundColor: "{colors.surface-3}"
  field-input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "52px"
  pill:
    backgroundColor: "{colors.fill-2}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  pill-role:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-2}"
    rounded: "{rounded.pill}"
  pill-live:
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
  status-pill:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sheet}"
  segmented-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    height: "44px"
  poster-cover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.faint}"
    rounded: "{rounded.card}"
---

# Design System: JUJO.Stream browser client

Scope: the browser client served at `/webrtc` (sources in `web-src/webrtc/`, shell in `src_assets/common/assets/web/index.html`). The C++ server and its admin web UI are out of scope.

## Overview

**Creative North Star: "Sky Outside, Night Inside"**

The sky is a picture and the rooms are dark and neutral. A blue sky gradient covers the sign-in ground and shows up as generated imagery (server avatars, placeholders, title cards). Every surface you work on is near-black, cool-neutral and untinted. One electric blue does the pointing (focus rings, the active page dot, links, switches), and the only bright fill is the white pill primary action. Layout and journey mirror the Android client (Jujo.StreamClient): sign-in sheet, focus-mode server carousel, Hero launcher with a poster row, then the stream.

The density is calm, at phone scale. The minimum sizes are text 13px, inputs 16px and touch targets 44px. Hover behaves exactly like focus on fine pointers. Motion is short and uses a single curve. Decorative loops run only where the user is not working (the sign-in sky, the focused server's float and the background ribbons). They stop before the stream starts, because the stream needs the GPU.

**Key Characteristics:**
- Neutral near-black surfaces, depth from 1px white-alpha borders and dark offset shadows.
- One accent blue, never a fill behind text.
- White pill primary, with near-black label (18:1).
- Sky gradient only as imagery.
- System sans, 700 titles at -0.01em, 800 wordmark.
- 100–500 ms motion on `cubic-bezier(.2, 0, 0, 1)`, sheet on `cubic-bezier(.32, .72, 0, 1)`.

## Colors

The palette is called "Cielo": cool near-neutral darks, one blue accent, a white primary, and sky stops used only as imagery.

Measured contrast in WCAG 2.x, against bg / surface / surface-2:

| Token | on bg | on surface | on surface-2 |
|---|---|---|---|
| text | 18.0 | 16.9 | 15.4 |
| muted | 8.1 | 7.6 | 6.9 |
| faint | 5.9 | 5.5 | 5.1 |
| accent | 5.6 | 5.2 | 4.8 |
| accent-2 | 8.2 | 7.7 | 7.1 |
| ok / warn / err | 10.3 / 9.6 / 6.4 | 9.6 / 9.0 / 6.0 | 8.8 / 8.3 / 5.5 |
| brand-cyan | 10.9 | 10.2 | 9.3 |

The on-primary label measures 18.0 on primary. Text on the sky gradient measures 5.8 over sky-deep but only 3.1 over sky-mid. For that reason the sign-in places all text on the neutral sheet or behind a bg-tinted top band, never directly on sky-mid.

### Primary
- **Electric Blue** (accent): focus rings (3px, 2px gap), the active page-dot pill, input focus borders, the checked switch, the poster ring, links, progress bars, and the hover border on the server seal.
- **Soft Electric Blue** (accent-2): the accent on imagery and on hover. Used for link text, the field-icon colour inside a focused field, the caret, poster hover rings, and the role pill label.
- **Electric Blue Wash** (accent-soft): text selection and the role pill background. This is the only accent fill, and it sits behind short 13px labels only.

### Neutral
- **Night** (bg): the screen ground, the theme-color, and the base of every scrim. It is also the label colour on the white primary.
- **Graphite** (surface): sheets, dialogs, the settings sheet, and the sticky sheet headers.
- **Slate** (surface-2): fields, sign-in icon tiles, poster placeholders, connecting art.
- **Raised Slate** (surface-3): the hover state of icon buttons and the switch track.
- **White-alpha fills** (fill-1/2/3): secondary button rest, chips and icon buttons, and pressed toolbar tools.
- **Lines** (line, line-strong): every border and hairline. Use line-strong for controls and line for dividers.
- **Scrim** (scrim): the dialog backdrop, the server seal, the stream HUD and toolbar.
- **Paper / Ash / Smoke** (text, muted, faint): the three text tiers, in that order: content, then secondary copy and labels, then addresses, hints and placeholders.

### Imagery: Sky stops
- **Sky Deep, Sky Mid, Sky Haze, Sky Dusk**: these appear only as pictures. Uses: the sign-in gradient and its drifting blobs, generated server avatars, the radial wash behind the launcher when no art exists, the desktop tile, the title-card fallback, the connecting ground, and the faint dusk wash on the focus-mode ground.

### Status
- **ok / warn / err**: the server status ring and dot (online, in use, offline), the live pill and live marker, error text and borders, the "Salir" exit tool, and "Cerrar sesión".

### Brand (fixed)
- **Hexagon red** (brand-red, with a #FB7185 to #F43F5E gradient in the sprite) and **wordmark cyan** (brand-cyan) on ".Stream". "JUJO" is set in text white.

### Named Rules
**The One Blue Rule.** There is exactly one accent hue. It marks where you are (focus, current, active), and it is never a large fill behind text.

**The Sky Is a Picture Rule.** Sky stops appear only in imagery: grounds, avatars, placeholders and title cards. They never appear on a control, a card surface, or text.

**The Untinted Room Rule.** Sheets, fields, tiles and buttons stay neutral. Colour on a surface is allowed only when it carries status (live pill, error message, exit tool).

## Typography

**Body Font:** system sans stack `Roboto, system-ui, -apple-system, "Segoe UI", sans-serif`, with no webfont loaded. Roboto is the Android client's face, and the web build inherits whatever the OS provides.

**Character:** this is a plain, sturdy UI sans. Hierarchy comes from weight (700 titles, 800 wordmark and title cards), not from a separate display face.

### Hierarchy
- **Display** (700, clamp(30px, 7.5vw, 60px), 1.04, -0.01em, balanced): the launcher game title. It carries a dark legibility text-shadow over art. In short landscape it uses clamp(22px, 7vh, 30px).
- **Headline** (700, 28px, 1.15, -0.01em): the focused server name, which grows to 32px at 1024px and 38px at 1680×960 and shrinks to 20px in landscape. The connecting-screen game title is the same family at clamp(26px, 6.4vw, 40px).
- **Title** (700, 23–24px, 1.2, -0.01em): sign-in step titles (23px) and the "Ajustes" sheet title (24px). Section heads use 16px 700.
- **Body** (400, 16px, 1.45): the default. The sign-in sub copy is 15px muted, limited to 34ch.
- **Label** (600, 14px): field labels and segmented legends in muted. Pills are 13px 600, and hints and footnotes are 13px faint.
- **Button** (700, 16px; ghost 600): the hero CTAs ("Entrar", "Jugar"/"Continuar") are 17px.
- **Wordmark** (800, 17–18px, +0.2px): "JUJO" + cyan ".Stream" next to the 24px hexagon. Title cards also use 800.
- **Numerals**: tabular figures for addresses, the HUD, chips, bitrate and the 6-digit code (26px 700, +0.45em).

### Named Rules
**The Thirteen Floor Rule.** No text below 13px, and no input below 16px, so iOS never zooms. The Android client's 9–10px TV sizes are not copied.

**The Weight Ladder Rule.** Titles use 700 at -0.01em. Only the wordmark, title-card names and the armed "Salir" label use 800. Nothing uses 900.

## Layout

Every screen is a fixed full-viewport `section[data-screen]`, and only one is visible at a time. Gutters are 16px on phones and 32px from 768px, always `max()`'d with the safe-area insets. The top padding is `max(12px, safe-top)` and the bottom is `max(16px, safe-bottom)`. Gaps are mostly 8, 12 and 14px.

Breakpoints:
- **768px**: sheets become centered cards and gutters widen.
- **1024px**: the focus-mode avatar is 236px and the slide width is clamped.
- **1680×960**: the avatar is 300px.
- **Short landscape (max-height 520–560px)**: sign-in goes to two columns, the focus avatar shrinks to 96px and the page dots move into the top bar, posters shrink, and the connecting art sits beside the text.

Screen anatomy:
- **Sign-in** (`signin`): the full-bleed sky gradient has 4 pre-blurred drifting blobs and a bg/dusk legibility band. The top row holds the wordmark plus the pause and close icon buttons.
  - On phones the sheet is a bottom sheet (24px top radius, grab bar). From 768px it is a centered 440px card.
  - Each step stacks an icon tile (52px, 16px radius, surface-2 with a line-strong border), the title, the sub copy, a rule, the form and a full-width 52px primary.
  - The steps are: email + password, then the 6-digit code, then the server password (owner only), then "Sincronizando servidores" with a progress bar. On phones the title is sticky while the fields scroll under the keyboard.
- **Focus mode** (`focus`): the top bar holds the brand, refresh and settings. Below it is a scroll-snap carousel.
  - The slide is 82vw on phones and neighbours peek at scale .86 and opacity .5. The centered avatar is 180px and round, with a 3.5px status ring at a 3px offset.
  - Under the avatar sit the name, a faint address, a status dot and line, and a role pill for guests.
  - The white "Entrar" pill (min 200×52) has a faint hint under it.
  - Page dots are 8px dots in 44px targets, with a 24×8 accent pill sliding between them. Chevrons appear on fine pointers only.
- **Launcher** (`launcher`, Hero layout):
  - The backdrop is the poster blurred 28px as a fill, with the sharp key art on top. On phone portrait the art sits at the top, masked to fade. In landscape and desktop it sits on the right as 2:3 and fades left. Bg scrims go over it.
  - The top row holds the server seal (40px avatar with ok ring, name, hint "Tus servidores", chevron; opens focus mode) and settings.
  - The centered hero has the title, meta pills ("En curso", genre) and "Jugar"/"Continuar". Below it is a horizontal snap row of 2:3 posters, starting with an "Escritorio" tile.
  - Viewer guests get no poster row, and the hero stays at the same height.
- **Stream** (`stream`): a black stage holds the contained video, with no cursor.
  - The toolbar pill sits top-right on a scrim, with no blur. It holds the keyboard, touch mode, stats and exit tools. "Salir" is in err colour; on touch it stands 16px apart and needs a second tap, which shows "Salir" in 800.
  - The HUD is top-left, 13px tabular, on a scrim.
  - The connecting layer shows the blurred art ground, a 2:3 art card, the title, a status line, setting chips, a 3px indeterminate bar and actions. It fades out at the first frame. On failure, a "Detalle técnico" disclosure appears.
- **Settings** (`dialog.settings`): a bottom sheet on phones and a 560px centered dialog from 768px.
  - The header is sticky with the grab bar, "Ajustes" and a close button.
  - Sections are separated by line hairlines and hold a two-column field grid from 420px, segmented controls, switches, "Cerrar sesión en este dispositivo" in err, and a shortcut hint that is hidden on coarse pointers.

## Elevation & Depth

Depth is tonal (bg, then surface, then surface-2, then surface-3), separated by 1px white-alpha borders. Shadows are always dark, neutral offset shadows that seat a surface on the ground. Shadows are never coloured and never animated.

### Shadow Vocabulary
- **Sheet rise** (`box-shadow: 0 -8px 32px color-mix(in srgb, var(--bg) 35%, transparent)`; settings: `0 -12px 40px rgba(0,0,0,.45)`): bottom sheets on phones.
- **Card float** (`box-shadow: 0 24px 64px rgba(0,0,0,.5)`): centered sheets and dialogs from 768px.
- **Art lift** (`box-shadow: 0 8px 20px rgba(0,0,0,.35)` for posters; `0 12px 28px rgba(0,0,0,.4)` for the server avatar; `0 24px 60px rgba(0,0,0,.5)` for connecting art): imagery only.
- **Legibility shadow** (`text-shadow: 0 2px 24px rgba(10,11,15,.6)`): titles laid over art.

### Named Rules
**The Dark Shadow Rule.** A shadow is always black or bg at reduced alpha. There are no coloured glows, no halos behind icons or buttons, and no animated box-shadow or blur radius.

## Shapes

Interactive controls are pill-shaped (999px): buttons, icon buttons, pills, segmented tracks, the status pill, the toolbar and the server seal. Containers step down in radius: sheets 24px, sign-in tiles 16px, fields 14px, errors 12px, posters and art 10px, HUD 8px, keycaps 6px. Avatars are full circles. Posters are 2:3, the desktop connect tile is 16:10, and the sprite icons are 24-unit strokes at 1.8–2 weight.

## Components

### Buttons
- **Shape:** full pill (999px), min-height 48px (52px for sheet primaries and the hero CTA), 22px side padding, 16px 700 label, 20px icons with an 8px gap.
- **Primary:** white pill (primary) with a near-black label (on-primary). It is the only bright fill on any screen, and each view has one.
- **Secondary:** fill-1 with a line-strong border. Hover goes to fill-2. On art it sits on the scrim.
- **Ghost:** transparent and muted at 600. Hover turns it to text colour.
- **Press:** scale .98 over 100ms. Disabled is .5 opacity with no transform.
- **Icon button:** 44px circle on fill-2 with a line-strong border and a 22px text-coloured icon. Hover goes to surface-3, and press scales to .94.

### Chips / Pills
- **Style:** 28px pill, 12px padding, fill-2 background, muted 13px 600 text.
- **Variants:** *live* has an ok text and a 7px dot on an ok-alpha wash. *Role* ("Invitado", "Invitado: solo ver") uses accent-2 text on accent-soft. On art, pills switch to bg at .55 with a line-strong border.

### Inputs / Fields
- **Style:** 52px height, 14px radius, surface-2 background, line-strong border, 16px 500 text, faint placeholder. The label sits above in muted 14px 600. Sign-in fields carry a 20px leading icon (faint, turning accent-2 on focus) and a 44px eye toggle.
- **Focus:** the border turns accent, plus a 3px accent outline at a 2px offset (the ring sits on the field box).
- **Error:** an err border and `aria-invalid`. The message box is err text on a 12% err wash with a 12px radius. It never shakes.
- **Segmented:** native radios in a pill track on surface-2. The checked segment is a white pill (on-primary label) and the rest are muted 15px 700.
- **Switch:** 52×32 track (surface-3 with a faint inset line) and a 24px muted knob. When checked, the track goes accent and the knob goes text-white, sliding 20px over 130ms.

### Navigation
- **Page dots:** 8px faint dots, with a 24×8 accent pill that slides over 350ms.
- **Carousel:** native scroll-snap, driven by swipe, arrows or the chevron icon buttons. The current slide is scale 1 and opacity 1.
- **Server seal:** a scrim pill with a line border. Its border turns accent on hover.
- **Poster row:** native snap. The focused, current or hovered poster scales 1.06 with a 3px ring (accent; accent-2 on hover). A 10px ok dot marks the running game.

### Status pill
This is the single global toast (`#status`, `role="status"`). It is centered at the bottom above the safe area, as a pill on surface at .96 with a line-strong border and muted 14px 500 text. It enters with an 8px rise over 280ms. In the error variant the text is err and the border is err at .4.

### Sheet / Dialog
Surface, 24px radius, line-strong edge. On phones it rises from below over 500ms on the sheet curve, with a 40×4/5 grab bar. From 768px it is a centered card that fades and rises 12px. The backdrop is the scrim, fading in.

### Signature: Focus avatar
The focus avatar is a 180px circle (236/300px on desktop) with a 3.5px status ring. It floats ±6px over 5.5s, and the float runs only on the current server. On focus or hover it scales 1.06 and a 3px accent ring fades in around the status ring. When a server has no image, the avatar is generated sky-gradient art with a hexagon and initials. The avatar morphs into the launcher seal through the shared `server-avatar` view transition.

### Title-card fallback
When a poster fails to load, the card shows a dusk-to-surface-to-bg diagonal gradient, a 22px icon and the game name in 800, bottom-left. A broken image box is never shown.

### Motion
- **Tokens:** press 100ms, focus/hover 130ms, backdrop crossfade and image fade-in 220ms, steps/status/screen crossfade/toolbar hide 280ms, server change 350ms, sheet 500ms.
- **Curves:** `cubic-bezier(.2, 0, 0, 1)` everywhere except the sheet, which uses `cubic-bezier(.32, .72, 0, 1)`.
- **Sign-in steps:** the old step fades out and scales to .98, and the new step fades in from 10px below.
- **Screen changes:** View Transitions with a 280ms root crossfade. Changes into or out of the stream skip the transition.
- **Loops:**
  - The sign-in blobs drift over 23–38s alternate, transform only. The pause button "Pausar el movimiento del fondo" is persisted.
  - The current focus avatar floats over 5.5s.
  - The focus ribbons (text stroke at .055 alpha) drift over 24/32/40s linear.
  - The indeterminate bars run 1.2s on sign-in sync and 1.3s on connecting.
  - Every loop lives in a screen that is `hidden` (display:none) once the stream shows, and the connecting bar is removed at the first frame. No loop runs during a stream.
- **Reduced motion:** press, focus and server durations go to 0. Step and backdrop go to 120ms and sheet to 150ms. Focus scale goes to 1. Every animation runs a single iteration in ~0ms, so the blobs, float and ribbons freeze. The pause button hides, the indeterminate bars become static, view transitions run at 120ms, and the settings sheet opens as an opacity fade only.

## Do's and Don'ts

### Do:
- **Do** keep one white pill primary per view, with a near-black label (18:1).
- **Do** mark focus, current and active with accent only: a 3px ring at a 2px gap, scale 1.06, over 130ms. On fine pointers, hover equals focus.
- **Do** keep sheets, fields and tiles on surface or surface-2, edged with a 1px line-strong border.
- **Do** use sky stops only in imagery: grounds, generated avatars, placeholders, title cards.
- **Do** give every poster a designed fallback (the title card) and every async state a status pill line.
- **Do** stop every decorative loop before the stream, and give any looping background a pause control.
- **Do** keep touch targets at 44px or larger, text at 13px or larger, and inputs at 16px or larger.
- **Do** write copy in neutral Spanish, using tú forms and plain statements of cause and next step. Quote strings as shipped: "Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.", "Código incorrecto o vencido. Espera el siguiente código de tu app y escríbelo.", "¿Salir? Toca otra vez para salir".

### Don't:
- **Don't** add a second accent hue or put the accent behind body text. accent-soft is limited to 13px pill labels and selection.
- **Don't** use coloured glows, halos behind icons or buttons, neon, or animated shadows or blur.
- **Don't** use gradient text or gradient buttons. Gradients belong to imagery and the brand hexagon only.
- **Don't** tint a card, sheet or field with colour unless it carries status.
- **Don't** use bounce, elastic, error shakes, parallax, Ken Burns, canvas or WebGL shaders, scroll-triggered reveals, or backdrop blur over the video.
- **Don't** use voseo ("revisá", "tocá") or Spain-only forms ("vosotros", "ordenador").

## Unverified

These have not been verified in the shipped captures:
- **Live stream path:** the stream screen in the captures is the connecting layer only. The toolbar, HUD and armed "Salir" were not seen over real video.
- **Real soft keyboard:** the sticky sign-in title and the `interactive-widget=resizes-content` behaviour were not checked on a real iOS or Android keyboard.
- **Real posters:** the final captures use synthetic placeholder posters. Real `/api/apps/<uuid>/cover` art has not been checked for scrim legibility, and the launcher backdrop has not been checked with real key art.
