# Portal web JUJO.CLOUD: un login, todos los servers — diseño

Fecha: 2026-11-16 · Repos: Jujo.StreamServer (C++ + `web-src/webrtc`), Jujo.StreamAdmin (`supabase/migrations`), Jujo.StreamClient (referencia de UX).
Estado: propuesta, sin código. La Fase 1a no toca C++; la 1b toca auth y espera aprobación del usuario.

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
- **Servers de invitado (`server_members`, otro dueño):** el dueño ajeno podría capturar el token desde su binario. Aun así es mejor que hoy (hoy el invitado escribe contraseña + TOTP en la página del dueño), así que el hand-off se hace también a invitados. **Fase 3: tickets de alcance acotado** (Edge Function `server-ticket`: recibe JWT aal2 + `server_uuid`, verifica membresía activa, devuelve un JWT propio de 60 s, `aud=<server_uuid>`, `jti` de un solo uso, firmado con una clave asimétrica cuya pública el server conoce). Cierra la fuga para todos.

### Servers de invitado: cómo se autoriza una cuenta en un server ajeno

Requisito del usuario: *"Solo veo un solo servidor, aun teniendo dos en mi cuenta. Tengo el mío registrado y uno de invitado."* El portal lista ambos: `user_server_profiles` (propios) + RPC `shared_server_profiles()` (invitado, con `role` y `owner_email`). Listar no requiere nada del server. **Conectar sí**, y hoy está roto para invitados en dos puntos (verificado en `feat/webrtc-browser-access`):

1. **Registro RBAC solo por pareo nativo.** `cloud-login` exige `rbac::registry.has_client(user_id)`. Un invitado entra al registro únicamente vía `cloud_pair` (`confighttp_auth.cpp`, `register_client(user_id, pair_role, …)`), que necesita el cert de cliente de la app nativa. Un invitado que nunca pareó desde Android recibe `not_paired` en el browser.
2. **La sesión emitida es la del dueño.** Después de `cloud-login`, la sesión se crea con `issue_login(config::sunshine.username, …)`:
   - con `webrtc_require_server_password` **activo** (default), el invitado necesita la contraseña del dueño → no puede entrar (o el dueño se la tiene que dar, peor);
   - con el paso **desactivado**, el invitado recibe una sesión del usuario dueño, y `createWebRTCSession` trata toda sesión como `admin` (`caller_is_session_or_token → Role::admin`). **Un invitado `viewer` termina con control total del PC.** Es una escalada de privilegios en la PR actual cuando el dueño desactiva la contraseña.

Diseño propuesto (**cambia auth en C++ → requiere aprobación del usuario**):

- `cloud-login`, si el `user_id` no está en RBAC, consulta `server_members` (misma consulta que ya usa `cloud_agent.cpp` para revocar invitados: `owner_id`, `member_id`, `server_url`, `status=active`) y lo registra con su `role` — igual que `cloud_pair`, sin cert de cliente. El chequeo de `aal2` y la verificación en Supabase no cambian.
- La sesión que emite `cloud-login` queda **atada al `user_id` cloud y a su rol RBAC**, no al usuario local del dueño. `createWebRTCSession` toma el rol de esa sesión (viewer → `coop_role=viewer`, operator → control, admin → dueño).
- El paso de contraseña del server aplica **solo al rol admin** (el dueño). Invitados no la piden.
- La revocación existente del cloud agent (≤ 1 heartbeat) ya corta a un miembro revocado; además debe invalidar su cookie de confianza (`cloud_web_auth::store().revoke` por `user_id`).

Hasta que eso se apruebe, el portal muestra el server de invitado con su estado y el botón **Conectar deshabilitado** con el texto "El dueño debe actualizar su servidor para permitir acceso de invitados desde el navegador".

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

## 4. Paridad con el cliente Android

Requisito del usuario: *"Esperaría un sistema de nuestro cliente de Android en la WebRTC. Lo más parecido posible."* El flujo de Android es **servers → apps → stream**; el hand-off lo parte igual: el portal es la pantalla de servers y la pestaña del server es apps + stream.

| Cliente Android (`lib/screens`) | Web | Dónde | Fase |
|---|---|---|---|
| `auth/cloud_auth_screen.dart` | Login email+contraseña → TOTP, mismos textos de error | Portal | 1 |
| `pc_view/pc_view_screen.dart` (`_buildComputerGrid`, `_buildCard`), `server_tile_state.dart`, `cloud_badge.dart`, `server_profile_images.dart` | Grilla de tarjetas de server: nombre, imagen, badge cloud/invitado (rol + dueño), estado *En línea / Transmitiendo / Sin conexión hace X*, versión | Portal | 1 |
| `pc_view/server_health_loop.dart` | Refresco de estado cada 30 s + refresh de sesión sin cerrar sesión ante fallas de red | Portal | 1 |
| `pc_view/pending_invites_section.dart` | Banner de invitaciones pendientes (`my_server_invites`, `my_coop_invites`) con aceptar/rechazar | Portal | 2 |
| `app_view/app_view_screen.dart` + `app_view_grid.dart` / `app_view_carousel.dart` (tema **Classic**, el default de `LauncherThemeRegistry`) | Biblioteca de apps con portadas, foco por teclado/mando, "Escritorio" como primera tarjeta | Pestaña del server | 2 (necesita `/api/apps` y `/api/apps/<id>/cover` en `is_webrtc_wan_path` → cambio de gate WAN, **requiere aprobación**) |
| `app_view/app_details_screen.dart` | Detalle + Jugar | Pestaña del server | 3 |
| `game/game_stream_screen.dart`, `stream_hud_stats.dart`, `perf_stats_overlay.dart`, `quick_fav_keys_panel.dart`, `special_keys.dart`, `trackpad_input_handler.dart` | Ya existen equivalentes en `/webrtc` (HUD, input, touch); alinear look y menú del overlay | Pestaña del server | 2 |
| `settings/settings_screen.dart` (sección stream), `profile_screen.dart` | Ajustes de stream (ya en `/webrtc`) + perfil/cerrar sesión en el portal | Ambos | 2 |
| `cinematic_intro`, `onboarding`, `collections`, `achievements`, `companion`, `plugins`, temas Backbone/PS5/Hero/BigScreen | **No** | — | fuera de alcance |

**Paridad visual:** extraer colores, tipografía, radios y espaciados del tema Classic del cliente (`lib/themes/classic/`, `lib/providers/theme_provider.dart`) a variables CSS compartidas por portal y `/webrtc` (`web-src/shared/theme.css`). Mismos íconos y orden de elementos que las tarjetas Android; navegación con flechas/mando igual que en TV.

**Flutter web para el shell: no recomendado, ni siquiera por la paridad.** 51 archivos del cliente importan `dart:io`/`dart:ffi` o moonlight nativo; habría que partir con imports condicionales una app de miles de líneas por pantalla (`pc_view_screen` 2.7k, `app_view_screen` 3.7k). El bundle CanvasKit (varios MB) pesa en el arranque, y la vista de apps + stream tiene que vivir en la página que sirve cada server (por cookies y cert), que no es Flutter. Se logra "lo más parecido posible" reproduciendo el tema Classic en CSS con TS + el mismo `esbuild`.

## Recomendación

Portal central estático (A) que solo habla con Supabase, y hand-off por `postMessage` (E) a la pestaña `/webrtc` de cada server, que ya sabe canjear un aal2 por su cookie de confianza. Lista propios + invitado desde el día uno; conectar como invitado y la biblioteca de apps necesitan cambios de auth/gate WAN que el usuario debe aprobar (Fase 1b).

## Plan por fases

**Fase 1a — portal con paridad de la pantalla de servers (sin tocar C++)**
1. `web-src/shared/theme.css`: tokens del tema Classic del cliente.
2. `web-src/portal/`: login+TOTP (reusa `cloud.ts`), refresh, lista `user_server_profiles` + `shared_server_profiles()`, tarjetas estilo `pc_view` con badges (propio/invitado, rol, dueño, estado), botón Conectar (LAN/WAN). Invitados: botón deshabilitado con explicación hasta 1b.
3. `web-src/webrtc/main.ts`: receptor del hand-off (`#portal` → `jujo-ready` a `window.opener` con `PORTAL_ORIGIN`, acepta un único `jujo-token` validando origen + nonce, `history.replaceState`). Aplicar `theme.css` a `/webrtc`.
4. Hosting: decidir dominio y publicar con CSP + `frame-ancestors 'none'`.
5. Hecho = desde un browser limpio: login una vez, se ven ambos servers (propio e invitado); el propio abre por LAN y por WAN y llega a *setup* sin pedir cuenta otra vez.

**Fase 1b — invitados y biblioteca de apps (requiere aprobación: toca auth y gate WAN)**
6. `cloud-login`: registrar invitados desde `server_members` activo; para no-admin, en vez de devolver `server_password_required`, emitir sesión atada a `user_id` + rol RBAC (no al usuario local del dueño) y que `createWebRTCSession` use ese rol. Parte de la base ya existente: el atajo sin contraseña solo para admin y `/api/webrtc/security` solo para admin.
7. `is_webrtc_wan_path`: agregar `GET /api/apps` y `GET /api/apps/<id>/cover` (solo lectura; lanzar sigue por `/api/webrtc/sessions` con su chequeo de rol).
8. Vista de biblioteca de apps estilo `app_view` Classic en `/webrtc`.
9. Hecho = el invitado abre el server ajeno desde el portal, ve sus apps y entra con el rol que el dueño le dio (viewer no controla).

*Implementado (2026-11-16, aprobado por el usuario):*
- `cloud-login`: si el usuario no está en RBAC, `cloud_member_access` (compartido con `cloud_pair`) consulta `server_members` + `coop_session_invites` con el token del propio usuario y lo registra con su rol (no promovible a admin). Un no-admin recibe `{guest: true}` y **ninguna sesión del server**.
- `check_auth(request)`: sin credenciales, la cookie de confianza de un no-admin (`cloud_guest_user`) autentica como `cloud_jwt` solo en rutas de `is_webrtc_wan_path`; el rol RBAC decide (viewer → `coop_role=viewer`). Los admins siguen necesitando la sesión con contraseña.
- `is_webrtc_wan_path`: `GET /api/apps` y `/api/apps/<uuid>/cover` (ambos `authorize(viewer)`).
- Cloud agent: cada heartbeat re-resuelve membresía/Co-Op de todo usuario RBAC no-admin y lo quita o cambia de rol; perder el registro RBAC invalida su cookie (`cloud_trusted_user`). Los admins no se revisan (co-dueños; siguen con contraseña).
- `/webrtc`: biblioteca de apps (portadas, "En curso", "Escritorio") que envía `app_id`; viewers ven solo "Unirse a la sesión"; invitados no ven el control de seguridad.

**Fase 2 — señales de la nube y resto de paridad**
10. Invitaciones pendientes en el portal; orden/default (`display_order`, `is_default`).
11. Edge Function `whoami` (misma red) y `webrtc_wan` publicado por el cloud agent.
12. Overlay del stream alineado con `game_stream_screen` (HUD, teclas rápidas, trackpad).

**Fase 3 — endurecimiento**
13. Tickets `server-ticket` de alcance acotado (reemplazan el JWT completo para todos los servers).
14. Wake-on-LAN desde el portal vía `/api/wol` de otro server despierto (requiere CORS → evaluar).

## Riesgos abiertos

- **Escalada de invitado en `feat/webrtc-browser-access` — mitigada (2026-11-16, sin commit al escribir esto):** con la contraseña desactivada, un `viewer` obtenía sesión del dueño tratada como admin. Ahora `cloudLogin` solo omite la contraseña si el usuario cloud es admin en RBAC, y `/api/webrtc/security` exige admin. Invitados siempre reciben `server_password_required`. Queda pendiente el paso 6 para que puedan entrar sin la contraseña del dueño.

- **Fricción del cert autofirmado:** la primera conexión a cada IP muestra la advertencia del browser; en móvil es confusa. Mitigación: pantalla de ayuda en el portal con `cert_fingerprint` para comparar. Solución de fondo (fuera de alcance): certs reales vía nombre DNS por server (p. ej. `<uuid>.jujo.stream` con ACME DNS-01 desde la nube).
- **Token completo a servers propios:** si un server propio está comprometido, el atacante obtiene ≈1 h de acceso cloud. Igual o mejor que hoy; los tickets de Fase 3 lo cierran para todos.
- **`window.opener` cortado:** algunos browsers/bloqueadores aplican `noopener` o COOP; si `opener` es `null` el hand-off falla y el usuario cae al login de hoy (degradación aceptable, no rota).
- **Popups:** `window.open` debe salir directo del click (gesto de usuario) o lo bloquean.
- **Contraseña del server:** con `webrtc_require_server_password` activo (default), cada server sigue pidiendo su contraseña después del hand-off. Es una decisión de seguridad del dueño; el portal solo avisa.
- **`external_address` desactualizada** o NAT con CGNAT: WAN no llega aunque el server figure en línea. Se ve como timeout del hand-off.
- **Dominio del portal:** `PORTAL_ORIGIN` queda compilado en el server; cambiarlo exige release del server. Decidir antes de Fase 1 (¿`play.jujo.stream`? ¿Cloudflare Pages?).
- **Local Network Access** puede endurecerse también para navegación top-level desde orígenes públicos; hoy no aplica, vigilar.
