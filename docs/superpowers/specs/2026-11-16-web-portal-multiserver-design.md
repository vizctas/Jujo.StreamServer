# Portal web JUJO.CLOUD: un login, todos los servers — diseño

Fecha: 2026-11-16 · Repos: Jujo.StreamServer (C++ + `web-src/webrtc`), Jujo.StreamAdmin (`supabase/migrations`), Jujo.StreamClient (referencia de UX).
Estado: propuesta, sin código. No toca el código de auth del server en la Fase 1.

## Intención

Hoy cada server sirve su propia página `https://<ip>:<puerto-webui>/webrtc` con cert autofirmado; el usuario inicia sesión en JUJO.CLOUD **dentro de cada server** y solo ve ese server. Queremos lo que ya hace el cliente Android: iniciar sesión una vez (email + contraseña + TOTP → aal2), ver todos sus servers (propios y compartidos) con su estado y abrir una sesión WebRTC con el elegido.

## Lo que ya existe (y condiciona el diseño)

| Pieza | Dónde | Hecho relevante |
|---|---|---|
| Login cloud en browser | `web-src/webrtc/cloud.ts` | REST directo a Supabase Auth (`/token`, `/factors/*/challenge|verify`), sin supabase-js. |
| Canje JWT → confianza | `confighttp_auth.cpp` `cloudLogin` | `POST /api/auth/cloud-login {access_token}`; exige `aal=aal2`, verifica contra `GET /auth/v1/user` + RBAC (`check_cloud_jwt_auth`), emite cookie `HttpOnly; SameSite=Strict; Secure` 30 días; luego paso de contraseña del server si `webrtc_require_server_password`. |
| Superficie WAN | `http_auth.cpp` `is_webrtc_wan_path` | Desde WAN solo pasan `/webrtc`, `/assets/*`, `/api/auth/*`, `/api/webrtc/*`, y solo con `webrtc_wan_access`. |
| CORS | `get_cors_origin()` | Fijo a `https://localhost:<puerto>`; no hay allowlist ni manejo de preflight para otros orígenes. |
| Media | `webrtc_ice.cpp` | Puertos ICE fijos base+34..37 con UPnP + candidato srflx sintético con la IP pública; STUN/TURN opcionales. |
| Lista de servers | Supabase | `user_server_profiles` (propios: `server_url`, `server_name`, `server_uuid`, `cert_fingerprint`, `local_addresses`, `external_address`, `last_seen_at`, `is_streaming`, `server_version`, `nat_type`) + RPC `shared_server_profiles()` (compartidos vía `server_members`, con `role` y `owner_email`). Online = `last_seen_at > now() - 2 min` (`is_server_online`). |
| Elección LAN/WAN | `Jujo.StreamAdmin/.../server_connection_racer.dart` | Carrera HTTPS sin credenciales: LAN 2 s, WAN 4 s, total 6 s, sondea `/api/config`. |

## Restricciones del browser que deciden todo

1. **Cookies de terceros.** La cookie de confianza es `SameSite=Strict`. Si una página en `portal.jujo…` hace `fetch` a `https://192.168.1.10:47990`, la cookie es de tercero: Chrome (3PCD), Safari y Firefox la bloquean o la van a bloquear. Un portal que hable *cross-origin* con los servers necesita **Bearer en cada request**, no cookies.
2. **Cert autofirmado.** `fetch` no muestra la pantalla de "continuar de todos modos"; falla igual que un server apagado. La excepción solo se acepta con **navegación top-level** a ese origen, y es por host:puerto (la IP LAN y la IP WAN son orígenes distintos → dos aceptaciones, dos cookies).
3. **Local Network Access (Chrome ≥ 142, antes PNA).** Una página pública que hace `fetch` a una IP privada dispara un permiso del usuario o se bloquea. La navegación top-level a una IP privada no.
4. **Origen = autoridad.** Quien carga la página `/webrtc` del server es ese server: su código ve todo lo que esa página ve.

Conclusión: el portal central puede *listar* sin tocar los servers, pero *hablar* con ellos cross-origin choca con 1-3. Abrir el server en su propia pestaña (top-level, first-party) esquiva los tres.

## 1. Dónde vive el portal

| Opción | Pro | Contra |
|---|---|---|
| **A. Portal central estático** (p. ej. `https://play.jujo.stream`) | Un solo origen con cert real; una sesión Supabase; lista completa. | Necesita hosting estático (Cloudflare Pages / GitHub Pages). Supabase Storage no sirve bien HTML como página (por seguridad lo entrega como texto; verificar antes de descartarlo). |
| B. Cada server sirve el portal | Cero infra. | La sesión cloud queda por origen (cada IP pide login otra vez) — es justo el problema de hoy. |
| C. Portal central + relay TLS que proxée señalización | Sin pantallas de cert; todo same-origin. | Infra con estado, latencia en señalización, el relay ve el tráfico de control y los tokens; costo y superficie de ataque. |

**Recomendación: A**, con el *stream* en la pestaña del server (ver §2). B queda como está (la página `/webrtc` sigue funcionando sola). C no se justifica mientras la media vaya directa.

## 2. Cómo un login autoriza muchos servers

### Opciones

- **D. Fetch cross-origin con Bearer.** El portal llama a `/api/webrtc/*` de cada server con `Authorization: Bearer <aal2>`. Requiere en C++: allowlist CORS con preflight `OPTIONS`, aceptar Bearer cloud en `/api/webrtc/*` (hoy solo en `/api/wol`), y señalización SSE cross-origin. Además choca con cert autofirmado (2) y Local Network Access (3) sin forma de pedir al usuario que acepte el cert. **Rechazada para Fase 1.**
- **E. Hand-off por `postMessage` a la pestaña del server (recomendada).**

### Flujo E

```
Portal (play.jujo.stream)                 Pestaña server (https://ip:puerto/webrtc)
  sesión Supabase aal2 en memoria
  usuario elige server + dirección
  w = window.open(url + '#portal')  ───►  (si el cert no está aceptado: pantalla del browser,
                                           el usuario pulsa "continuar"; solo la primera vez)
                                          checkAuth(): ¿cloud_trusted? → sí: sigue sin hand-off
                                          no: window.opener.postMessage({t:'jujo-ready', nonce}, PORTAL_ORIGIN)
  recibe 'jujo-ready' (valida event.origin == origen abierto
                       y event.source == w)
  w.postMessage({t:'jujo-token', nonce, access_token}, origenServer) ──►
                                          valida event.origin == PORTAL_ORIGIN (constante compilada) y nonce
                                          POST /api/auth/cloud-login (same-origin, cookie first-party)
                                          sigue el flujo actual (contraseña del server si aplica)
```

Por qué así:

- **Cero cambios en C++.** `cloud-login` ya acepta exactamente un `access_token` aal2. Solo cambian `main.ts` (receptor `message`) y el `index.html` (nada nuevo visible).
- **El token nunca va en la URL** (ni query ni fragmento): no queda en historial, logs ni `Referer`. `postMessage` con `targetOrigin` exacto no se entrega a otro origen aunque la pestaña haya navegado.
- **Cookies first-party:** la cookie de confianza de 30 días la fija la propia pestaña del server; las siguientes aperturas ni siquiera piden token.
- **Sin pedir permiso de red local**: el portal no hace `fetch` al server.
- `PORTAL_ORIGIN` es una constante en `main.ts` (no config editable desde WAN): un atacante no puede convencer al server de aceptar tokens de otro origen.

### Qué se filtra y a quién

El `access_token` aal2 de Supabase vale para **todo el proyecto Supabase** hasta su expiración (≈1 h). Entregárselo a un server equivale a que ese server pueda actuar como el usuario en JUJO.CLOUD durante ese rato. Hoy pasa algo peor: la página del server recibe **email + contraseña + TOTP** porque el login se escribe dentro de ella.

- **Servers propios:** aceptable (el dueño es el mismo usuario). Mejora neta respecto de hoy.
- **Servers compartidos (`server_members`, otro dueño):** el dueño ajeno podría capturar el token desde su binario. **Fase 1: no hacer hand-off a compartidos**; el portal los lista y abre la pestaña sin token, el usuario entra como hoy. **Fase 2: tickets de alcance acotado** (Edge Function `server-ticket`: recibe JWT aal2 + `server_uuid`, verifica membresía activa, devuelve un JWT propio de 60 s, `aud=<server_uuid>`, `jti` de un solo uso, firmado con una clave asimétrica cuya pública el server conoce). Requiere verificación nueva en C++ → **necesita aprobación del usuario** antes de tocar auth.

### Sesión del portal

- Reusar `cloud.ts` + refresh (`grant_type=refresh_token`) y lecturas PostgREST con `fetch`. Sin supabase-js (≈50 KB menos, menos superficie).
- Refresh token en `sessionStorage` (se pierde al cerrar la pestaña) por defecto; "Recordar este equipo" lo pasa a `localStorage`. El access token solo en memoria.
- CSP estricta (`default-src 'self'; connect-src <supabase-url>; frame-ancestors 'none'`), sin scripts de terceros: un XSS en el portal = cuenta tomada.
- Cerrar sesión revoca en Supabase; las cookies de confianza en cada server siguen 30 días (igual que hoy; revocables desde el server con `DELETE /api/auth/cloud-login`).

## 3. LAN vs WAN

El portal **no puede correr el racer** del cliente nativo (cert autofirmado + Local Network Access, §restricciones). Decide con datos de la nube y deja al usuario cambiar:

1. **Online:** `last_seen_at` < 2 min (misma regla que `is_server_online`). Badge: *En línea* / *Transmitiendo* (`is_streaming`) / *Sin conexión hace X*.
2. **¿Misma red?** Si el host de `external_address` == IP pública del browser → LAN primero. La IP pública la devuelve una Edge Function mínima `whoami` (lee `x-forwarded-for`; sin persistir nada). Sin esa función: LAN primero si el usuario lo marcó antes para ese server (preferencia local).
3. **Dirección LAN:** primer elemento de `local_addresses` (IPv4 privada) + puerto de `server_url`. **WAN:** host de `external_address` + mismo puerto (mapeado por UPnP).
4. **Fallback manual:** si la pestaña no llega a mandar `jujo-ready` en ~8 s, el portal ofrece "Probar por internet" / "Probar en red local" y explica el paso del cert. No hay carrera automática: abrir dos pestañas a la vez obliga a aceptar dos certs.
5. WAN solo funciona con `webrtc_wan_access` activo en el server. Hoy la nube no lo sabe → el portal muestra el error que devuelva la pestaña. **Fase 2:** el cloud agent publica `webrtc_wan` (bool) en `user_server_profiles` para deshabilitar la opción (cambio en cloud agent, no en auth).

## 4. Pantallas a reflejar y Flutter web

| Cliente Android (`lib/screens`) | Portal | Nota |
|---|---|---|
| `auth/cloud_auth_screen.dart` | Login email+contraseña → TOTP | Reusar textos/errores de `cloud.ts`. |
| `pc_view/pc_view_screen.dart`, `server_tile_state.dart`, `cloud_badge.dart` | Grilla de servers con estado | Propios + compartidos (con rol y dueño). |
| `pc_view/pending_invites_section.dart` | Fase 3 | Invitaciones pendientes (`my_server_invites`, `my_coop_invites`). |
| `game/game_stream_screen.dart`, `app_view/*` | **No** | Ya lo cubre la página `/webrtc` del server (setup + stage). |
| `settings/*` | No | Ajustes de stream ya viven en `/webrtc`. |

**Flutter web para el shell: no recomendado.** 51 archivos del cliente importan `dart:io`/`dart:ffi` o dependen de moonlight nativo; habría que aislar con imports condicionales una app grande para obtener 3 pantallas. El bundle de Flutter web (CanvasKit, varios MB) penaliza el primer arranque, justo lo que el portal debe tener rápido. El portal son ~3 vistas: TS + el mismo `esbuild` de `web-src/webrtc` (nuevo entry `web-src/portal/main.ts`, reusa `cloud.ts`). Si más adelante se quiere paridad visual, copiar tokens de color/tipografía del tema del cliente a CSS.

## Recomendación

Portal central estático (A) que solo habla con Supabase, y hand-off por `postMessage` (E) a la pestaña `/webrtc` de cada server, que ya sabe canjear un aal2 por su cookie de confianza. Fase 1 sin cambios de C++; tokens solo a servers propios.

## Plan por fases

**Fase 1 — portal mínimo (sin tocar auth del server)**
1. `web-src/portal/`: login+TOTP (reusa `cloud.ts`), refresh, lista `user_server_profiles` + `shared_server_profiles()`, badges de estado, botón Conectar (LAN/WAN).
2. `web-src/webrtc/main.ts`: si `location.hash == '#portal'` y no hay `cloud_trusted`, anunciar `jujo-ready` a `window.opener` con `PORTAL_ORIGIN` y aceptar un único `jujo-token` validando origen + nonce; luego `history.replaceState` para limpiar el hash.
3. Hosting: decidir dominio (§Riesgos) y publicar. CSP + `frame-ancestors 'none'`.
4. Hecho = desde un browser limpio: login una vez, abrir dos servers propios (uno por LAN, otro por WAN), ambos llegan a *setup* sin volver a pedir cuenta.

**Fase 2 — compartidos y señales de la nube**
5. Edge Function `server-ticket` + verificación de ticket en el server (**requiere OK del usuario: toca auth**).
6. Edge Function `whoami` para detectar misma red.
7. Cloud agent publica `webrtc_wan`.

**Fase 3 — paridad**
8. Invitaciones pendientes, orden/default (`display_order`, `is_default`), Wake-on-LAN vía `/api/wol` de otro server despierto (ya acepta Bearer cloud; requeriría CORS → evaluar).

## Riesgos abiertos

- **Fricción del cert autofirmado:** la primera conexión a cada IP muestra la advertencia del browser; en móvil es confusa. Mitigación: pantalla de ayuda en el portal con `cert_fingerprint` para comparar. Solución de fondo (fuera de alcance): certs reales vía nombre DNS por server (p. ej. `<uuid>.jujo.stream` con ACME DNS-01 desde la nube).
- **Token completo a servers propios:** si un server propio está comprometido, el atacante obtiene ≈1 h de acceso cloud. Igual o mejor que hoy; los tickets de Fase 2 lo cierran también para propios.
- **`window.opener` cortado:** algunos browsers/bloqueadores aplican `noopener` o COOP; si `opener` es `null` el hand-off falla y el usuario cae al login de hoy (degradación aceptable, no rota).
- **Popups:** `window.open` debe salir directo del click (gesto de usuario) o lo bloquean.
- **Contraseña del server:** con `webrtc_require_server_password` activo (default), cada server sigue pidiendo su contraseña después del hand-off. Es una decisión de seguridad del dueño; el portal solo avisa.
- **`external_address` desactualizada** o NAT con CGNAT: WAN no llega aunque el server figure en línea. Se ve como timeout del hand-off.
- **Dominio del portal:** `PORTAL_ORIGIN` queda compilado en el server; cambiarlo exige release del server. Decidir antes de Fase 1 (¿`play.jujo.stream`? ¿Cloudflare Pages?).
- **Local Network Access** puede endurecerse también para navegación top-level desde orígenes públicos; hoy no aplica, vigilar.
