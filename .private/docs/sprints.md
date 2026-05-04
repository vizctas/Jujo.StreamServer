# Jujo.Stream Flutter — Sprint Tracker

**Project:** jujo_stream_app  
**Migration:** Vue 3 → Flutter (web + app)  
**CRITICO:** Esto es un SERVIDOR, no una app común. El frontend es el panel de administración del servidor.  
**Plex-mode:** DESCARTADO por ahora.

---

## Sprint Overview

| # | Sprint | Skill(s) | Estado | Prioridad |
|---|--------|---------|--------|-----------|
| S1 | Login Premium (responsive) | `flutter-ui-architect` | 🔄 EN PROGRESO | CRÍTICO |
| S2 | Pairing completo (QR + PIN funcional) | `flutter-streaming-ux`, `security-risk-auditor` | ⬜ PENDIENTE | CRÍTICO |
| S3 | Dashboard moderno (métricas + grid) | `flutter-ui-architect`, `flutter-streaming-ux` | ⬜ PENDIENTE | ALTA |
| S4 | UI/UX Responsive (WEB + APP) | `flutter-ui-architect` | ⬜ PENDIENTE | ALTA |
| S5 | User-Driven Onboarding (Setup Wizard) | `flutter-streaming-ux` | ⬜ PENDIENTE | ALTA |
| S6 | Platform Images en Source Cards | `flutter-ui-architect` | ⬜ PENDIENTE | MEDIA |
| S7 | UX Review punto a punto | `flutter-streaming-ux`, `flutter-ui-architect` | ⬜ PENDIENTE | MEDIA |
| S8 | Game Library Connections | `steam-integration-flow`, `flutter-api-integration` | ⬜ PENDIENTE | MEDIA |

---

## S1 — Login Premium Responsive

**Objetivo:** Login idéntico al de Vue, adaptable WEB + APP.  
**Skills:** `flutter-ui-architect`  
**Asset:** `assets/login_modal/login-modal-screen.jpg`

### Diseño WEB (≥800px) — Horizontal
```
┌────────────────────────────────────────────────────────────┐
│  Background: #0A0A0F                                        │
│                                                             │
│  ┌─────────────────────────┬─────────────────────────────┐ │
│  │  [gaming image + blur]  │   Sign In                   │ │
│  │                         │   Connect to your server    │ │
│  │   🎮 Jujo.Stream        │                             │ │
│  │   Game Streaming Server │   [Server URL           ]   │ │
│  │                         │   [Username             ]   │ │
│  │                         │   [Password          👁 ]   │ │
│  │                         │                             │ │
│  │                         │   [        Sign In        ] │ │
│  └─────────────────────────┴─────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
  flex 5                       flex 4
  max 960px total, 540px tall
```

### Diseño APP (<800px) — Vertical + Blur
```
┌──────────────────────┐
│ [gaming image full]  │
│ [BackdropFilter blur]│
│                      │
│  ┌────────────────┐  │
│  │  🎮 Jujo.Stream│  │
│  │  Game Streaming│  │
│  │                │  │
│  │  [Server URL ] │  │
│  │  [Username   ] │  │
│  │  [Password 👁] │  │
│  │                │  │
│  │  [ Sign In → ] │  │
│  └────────────────┘  │
│   frosted glass card │
└──────────────────────┘
```

### Tareas
- [x] Agregar `assets/login_modal/` a pubspec.yaml
- [x] Reescribir `login_screen.dart` con `LayoutBuilder`
- [ ] Hot reload y verificar en Chrome (web wide)
- [ ] Verificar en viewport angosto (mobile simulation)

---

## S2 — Pairing Completo (QR + PIN funcional)

**Objetivo:** El pairing actual solo genera un QR que no hace nada. Implementar el flujo real.

### Flujo correcto (Moonlight protocol)
```
1. Cliente Moonlight inicia solicitud de pairing → POST /api/pair?uniqueid=...
2. Servidor genera PIN de 4 dígitos
3. ESTA APP muestra el PIN (polling GET /api/pair/pending o SSE)
4. Usuario ingresa el PIN en el cliente Moonlight
5. Server valida → par establecido
6. App muestra confirmación + cliente aparece en la lista
```

### PIN Legacy Flow
```
Client → POST /serverinfo?uniqueid=XXX  → server responds with challenge
Client → POST /pair?uniqueid=XXX&devicename=XXX&updateState=1&phrase=getservercert
Server → shows PIN via /pin endpoint (polling)
User enters PIN in client
Client → POST /pair?...&phrase=pairchallenge&...
```

### Tareas
- [ ] Investigar endpoint real de pairing en Sunshine C++ (`src/nvhttp.cpp`)
- [ ] Implementar `PairingApi.getPendingPin()` con polling
- [ ] Implementar widget de PIN con TTL countdown
- [ ] Animación de éxito al completar pairing
- [ ] Test con cliente Moonlight real

---

## S3 — Dashboard Moderno

**Objetivo:** Grid cuadriculado, métricas en tiempo real, acciones rápidas.

### Layout
```
┌──────────┬──────────┬──────────┐
│ 🟢 Ready │ Clients  │ Games    │
│  Online  │   0/5    │   127    │
├──────────┴──────────┴──────────┤
│ [Streaming Now — if active]    │
│ Client · FPS · Bitrate · Ping  │
├──────────┬──────────┬──────────┤
│ Quick    │ Pair New │ Sources  │
│ Settings │ Device   │ 3 active │
└──────────┴──────────┴──────────┘
```

### Tareas
- [ ] `MetricCard` grid 3-col adaptativo
- [ ] `StreamingNowBanner` (visible solo cuando hay sesión activa)
- [ ] Quick Actions row
- [ ] `fl_chart` para throughput (últimos 60s)
- [ ] `flutter_animate` entry animations

---

## S4 — UI/UX Responsive (WEB + APP)

**Objetivo:** Adaptación correcta del `AppShell` para ambos contextos.

### Reglas
- Desktop (≥1024px): sidebar permanente
- Tablet (600-1023px): sidebar colapsable (icónico)
- Mobile (<600px): bottom navigation bar

### Tareas
- [ ] Auditar `AppShell` actual
- [ ] Implementar breakpoint logic en `AppShell`
- [ ] Library grid: columns = `maxWidth ~/ 200`
- [ ] Touch targets mínimo 48×48 en todos los controles
- [ ] Login: responsivo ✅ (cubierto en S1)

---

## S5 — User-Driven Onboarding (Setup Wizard)

**Objetivo:** Usuario casual → 4 pasos máximo → listo para streamear.

### Flujo
```
Step 1: Confirmar dirección del servidor (auto-detect mDNS)
Step 2: Seleccionar calidad (Balanced / Performance / Quality)
Step 3: Pair dispositivo (QR en pantalla)
Step 4: ✅ Ready to stream
```

### Tareas
- [ ] Wizard con `PageView` + progress indicator
- [ ] mDNS discovery (`connectivity_plus`)
- [ ] Integrar con paso de pairing (S2)
- [ ] Guardar preferencias con `shared_preferences`

---

## S6 — Platform Images en Source Cards

**Objetivo:** Banners de plataforma en cada `SourceCard`.

### Assets disponibles
- `assets/images/platforms/steam.jpg`
- `assets/images/platforms/EpicGames.jpg`
- `assets/images/platforms/GOG.jpg`
- `assets/images/platforms/xbox.jpg`
- `assets/images/platforms/playnite.jpg`

### Tareas
- [ ] Mapeo `sourceId → assetPath`
- [ ] `SourceCard` con `Image.asset` banner (top) + info (bottom)
- [ ] Shimmer loading para imágenes

---

## S7 — UX Review Punto a Punto

**Objetivo:** Audit completo de navegación, feedback, estados vacíos, errores, a11y.

### Checklist
- [ ] Navegación: ¿todos los back flows tienen sentido?
- [ ] Estados vacíos: ¿todos tienen ilustración + acción?
- [ ] Estados de error: ¿todos tienen retry button?
- [ ] Loading states: ¿consistentes?
- [ ] Animaciones: ¿respetan `MediaQuery.disableAnimations`?
- [ ] Accesibilidad: WCAG AA (contraste, touch targets, screen reader)
- [ ] Focus traversal: tab order lógico en web

---

## S8 — Game Library Connections

**Objetivo:** Conectar APIs reales de Steam, Epic, GOG.

### Dependencias
- S2 (Pairing) — identidad de cliente
- Backend endpoints: `GET /api/apps`, `POST /api/apps/sync`

### Tareas
- [ ] Steam: `GET /api/apps` → lista de juegos con artwork
- [ ] Epic Games: integración launcher local
- [ ] Playnite: bridge a biblioteca local
- [ ] Sync progress UI (animated steps)
- [ ] OAuth Steam OpenID flow

---

## Notas Arquitectónicas

- El backend C++ (Sunshine) expone REST en puerto 47990 (HTTPS, self-signed cert)
- El Flutter app consume esos endpoints — NO hay lógica de servidor en Dart
- Autenticación: session token en `flutter_secure_storage`
- Self-signed cert: `BadCertificateHandler` custom en `ApiClient`
- Pairing protocol: Moonlight/GFE compatible (GET params, no JSON body)
