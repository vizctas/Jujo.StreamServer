# Co-Op remoto: política de roles y solicitudes de unión — diseño

Fecha: 2026-11-15 · Repos: Jujo.StreamServer (C++), Jujo.StreamClient (Flutter + moonlight-common-c), Jujo.StreamAdmin (Flutter + `supabase/migrations`).

## Intención

El dueño de un server enciende un juego y un amigo en otra red (otro país) entra a **esa misma partida** como jugador 2+, como si estuviera sentado al lado. Hoy eso funciona solo por invitación desde StreamAdmin y con huecos de seguridad: cualquier invitado puede lanzar, cerrar o cancelar el juego del dueño. Queremos:

1. Que solo el dueño controle qué juego corre; el resto solo **mira** o **juega como P2+**.
2. Dos caminos para entrar: **invitación** (ya existe) y **solicitud** (nuevo): un miembro del server pide unirse y el dueño aprueba con un aviso discreto, esté frente al PC o jugando por stream.

## Objetivos

- **G1 Política:** invitados (miembros `viewer` e invitados Co-Op) no pueden lanzar, cambiar, terminar ni cancelar apps (nvhttp ni confighttp). Pueden listar apps y, solo con permiso Co-Op vigente, ver y jugar con mando o mando+teclado. Controladores (§1) no cambian.
- **G2 Revocación real:** al expirar o revocar una invitación/aprobación, el invitado pierde input y sesión en ≤ 60 s, aunque esté conectado.
- **G3 Dueño estable:** un invitado nunca puede quedarse con el rol de dueño (slot 0, pantalla virtual, ABR), aunque se conecte primero.
- **G4 Solicitud de unión:** un miembro activo del server (`server_members.status='active'`) pide unirse a la partida en curso con un rol (`viewer` | `coop_pad` | `coop_kbm`).
- **G5 Aviso al dueño en dos sitios:** dentro del stream del dueño (overlay del cliente) y en el PC host (StreamAdmin). El primero que responda gana.
- **G6 Entrada automática:** al aprobarse, el invitado entra solo, sin pasos extra.

## No-objetivos

- Relay/TURN para el camino Moonlight (si el invitado no alcanza el server por WAN, no entra; igual que hoy).
- Overlay dibujado **dentro** del juego en el PC host (inyección tipo Steam overlay).
- Cambiar el flujo de invitación existente más allá de los permisos.
- WebRTC Co-Op (hoy exige operator; queda igual).

## Anti-objetivos (fracaso aunque "funcione")

- Que un invitado pueda cerrar o cambiar el juego del dueño por cualquier ruta.
- Un aviso modal que bloquee o pause el juego del dueño.
- Que el dueño deje de poder lanzar desde sus propios dispositivos (falso 403 que el cliente muestra como "server offline").
- Spam: un miembro mandando solicitudes en bucle.

## Restricciones

- Windows suele suprimir notificaciones con juegos en pantalla completa exclusiva → en el PC el aviso es best-effort (notificación de StreamAdmin + sonido); el aviso fiable es el del stream.
- StreamAdmin solo avisa si está corriendo (hoy tiene `tray_manager`, no tiene paquete de notificaciones nativas).
- Las invitaciones expiran en ≤ 4 h por `CHECK` de base de datos; la solicitud usa la misma tabla.
- El server habla con Supabase con el token del dueño (`config::cloud.user_token`); el heartbeat de CloudAgent corre cada 60 s.
- `crypto::PERM::_allow_view = view | launch`: unirse a la app en curso solo requiere `view`.
- Comentario en `crypto.h`: un dispositivo sin `launch` ve 403 en `/launch` y el cliente lo muestra como "server offline" → el cliente debe tratar ese 403 como "solo invitado".

## Enfoques considerados

- **A. La nube como buzón (ELEGIDO).** La solicitud es una fila en `coop_session_invites` con estado nuevo `requested`. Realtime de Supabase (ya publicado en esa tabla) avisa al dueño en StreamAdmin y en su cliente. Al aprobar, la fila pasa a `active` y el invitado entra por el camino de invitación. Reutiliza casi todo; requiere internet (ya necesario para un invitado remoto).
- **B. El server como buzón.** El invitado pide al server; el server avisa por canal de control al stream del dueño y por API local a StreamAdmin. Funciona sin nube, pero es casi todo nuevo, exige alcanzar el server antes de tener permiso y duplica caminos.
- **Híbrido** (nube avisa, server decide): descartado, duplica estado y desincronización.

El dueño eligió **A**.

## Diseño

### 1. Quién controla el server (server)

Un certificado es **controlador** (puede lanzar, cambiar y cerrar apps) si cumple cualquiera:
- Fue emparejado por `cloud_pair` con un JWT cuyo `sub` == dueño del server (sub de `config::cloud.user_token`).
- Fue emparejado por `cloud_pair` por un miembro `active` con rol `admin` u `operator` en `server_members` (co-dueños: p. ej. familia usando el PC cuando el dueño no está). **Decidido por el dueño.**
- Fue emparejado por PIN/OTP local (acceso físico o PIN del dueño). **Decidido por el dueño: PIN = controlador.**
- Ya tenía `PERM::launch` antes de esta versión y no viene de `cloud_pair` de un no-controlador (migración: no romper dispositivos existentes).

Todo otro certificado es **invitado**: miembros con rol `viewer` e invitados Co-Op.

**Dueño de la sesión (slot 0, pantalla virtual, ABR):** el controlador que lanzó la app en curso (`game_owner_uuid`); si nadie la lanzó por JUJO, el primer controlador que se conecta. Un invitado nunca es dueño de sesión.

### 2. Permisos de invitado (server)

- `coop_invite_role_to_perm`: `viewer → list|view`, `coop_pad → list|view|input_controller`, `coop_kbm → list|view|input_controller|input_kbd|input_mouse`. **Sin `launch`.** Actualizar `tests/unit/test_coop_auth.cpp`.
- Miembros `viewer` emparejados por `cloud_pair`: perm base **solo `list`** — ni ver ni jugar sin aprobación. **Decidido por el dueño: ver también se pide.** `view` e input se conceden solo durante una aprobación/invitación Co-Op vigente (§3, §4) y se revocan con ella. Se elimina la herencia `previous_perm_for(name)` para emparejamientos de no-controladores.
- Miembros `admin`/`operator`: controladores (§1), mantienen sus permisos actuales.
- RBAC: invitados registran a lo sumo `viewer`; `auto_trust_cloud_clients` y "primer cliente = admin" no aplican a invitados.
- `resolve_rtsp_coop_identity`: `is_owner` exige certificado controlador (§1) — nunca "primero que llega".
- confighttp `/api/apps/launch`, `/api/apps/close`, `/api/apps/force-kill`, `/api/apps/launch-local` y similares que hoy solo llaman `authenticate()`: exigir rol ≥ operator. El builder enumera las ~45 rutas con `authenticate()` y clasifica cuáles mutan estado.

### 2b. Unirse a la pantalla actual (server) — **decidido por el dueño**

Si el dueño juega frente al PC con un juego abierto fuera de JUJO (p. ej. directo desde Steam), no hay app de JUJO corriendo y hoy un invitado sin `launch` recibe 403.
- Nueva pseudo-app "pantalla actual" (análoga a `REMOTE_INPUT_UUID`/input-only): un invitado con permiso Co-Op vigente puede hacer `/launch` de ella **sin `PERM::launch`**; no inicia ningún proceso, no crea pantalla virtual ni cambia el modo de pantalla (los invitados ya omiten cambios de pantalla) y captura el escritorio físico tal como está.
- Si hay una app de JUJO corriendo, el invitado se une a esa (camino actual con `view`).
- El cliente ofrece "Pedir unirse" siempre que el server esté online, no solo cuando JUJO reporta un juego; el dueño decide al aprobar.

### 3. Revocación (server)

- Al hacer `cloud_pair` de un no-dueño, el server guarda en su estado (`jujoserver_state.json`) `cert_uuid → { supabase_user_id, invite_id?, expires_at? }`.
- En cada heartbeat (60 s) y en cada `/launch`/`/resume`/RTSP de un invitado:
  - Si `expires_at` pasó, o la invitación ya no está `active` en Supabase, o el miembro ya no está `active`: quitar input (degradar a viewer o expulsar), cerrar su sesión RTSP con `couch_coop` kick y, si ya no tiene ningún acceso, desemparejar el certificado y borrarlo del RBAC.
- Si la nube no responde: conservar el último estado conocido, pero `expires_at` local se aplica siempre (no requiere red).

### 4. Solicitud de unión (Supabase)

Migración nueva en `Jujo.StreamAdmin/supabase/migrations/`:
- `coop_session_invites.status`: agregar `requested` (además de `pending|active|declined|revoked`); agregar `expired` si el builder lo necesita para distinguir solicitudes vencidas.
- RPC `request_coop_join(server_url text, role text)` SECURITY DEFINER:
  - Exige que `auth.uid()` sea miembro `active` de ese `server_url`.
  - Máximo una solicitud `requested` viva por (miembro, server); si hay otra, la devuelve en vez de crear.
  - Límite: 5 solicitudes por miembro por server cada 10 min.
  - Inserta `owner_id` (del server), `member_id = auth.uid()`, `role`, `status='requested'`, `expires_at = now() + 2 min`.
- RPC `respond_coop_request(id uuid, approve bool, role text default null)` SECURITY DEFINER, solo el dueño:
  - Solo si `status='requested'` y no expiró (actualización condicional → el primero que responde gana).
  - Aprobar: `status='active'`, `accepted_at=now()`, `expires_at=now()+4h`, `role = least(role pedido, role del dueño)`.
  - Rechazar: `status='declined'`.
- RPC `cancel_coop_request(id)` para el solicitante.
- Realtime ya publica la tabla; RLS SELECT ya cubre dueño y `member_id`.

El server considera una fila `active` con `member_id` = usuario del cert como permiso Co-Op vigente (§3), igual que una invitación.

### 5. Cliente — lado invitado

- En un server compartido (miembro `viewer`) que esté online: botón **"Pedir unirse"** con selector de rol (Espectador / Mando / Mando + teclado). La biblioteca se ve (`list`) pero sin Play.
- Tras pedir: estado "Esperando aprobación…" con cancelar; escucha la fila por realtime.
- Aprobada: entra automáticamente con el `coop_role` aprobado — a la app de JUJO en curso si la hay, o a "pantalla actual" (§2b) si no. Rechazada/expirada: mensaje breve.
- Ocultar **Play** (para otra app) y **Quit Session** a invitados; ocultar controles de dueño en el panel "Co-Op Players".
- El 403 de `/launch` para invitados se muestra como "solo el dueño puede iniciar juegos", nunca como offline.

### 6. Aviso al dueño

- **En el stream (cliente del dueño):** suscripción realtime a `coop_session_invites` con `owner_id = uid` y `status='requested'`. Toast no modal arriba a la derecha, sin pausar: "Ana quiere unirse · Mando — [A] Aceptar · [B] Rechazar", táctil y con mando; se cierra solo al expirar; cola si hay varias; al aceptar se puede bajar el rol. Usar `design-forever` para el componente.
- **En el PC (StreamAdmin):** ya escucha la tabla vía `ServerSharingService.changes()`. Notificación de Windows con acciones Aceptar/Rechazar (o, si el paquete no permite acciones, una ventanita always-on-top pequeña en la esquina) + sonido opcional; entrada también en la bandeja (`tray_manager`).
- Ambos llaman `respond_coop_request`; el otro aviso se cierra al ver el cambio de estado por realtime.

### 7. Orden de entrega

1. **Fase 1 — Política y revocación** (server + tests + ajustes del cliente para el 403). Cierra los huecos de seguridad; entregable por sí sola.
2. **Fase 2 — Solicitud** (migración + RPCs + UI invitado en el cliente).
3. **Fase 3 — Avisos al dueño** (toast en stream + StreamAdmin).

### Lo que queda al builder

- Paquete de notificaciones en StreamAdmin y la forma exacta del aviso en el PC.
- Formato del estado `cert_uuid → user_id` en `jujoserver_state.json` y su migración.
- Clasificación de las rutas confighttp que mutan estado.
- Textos e i18n (es/en) de cliente y Admin.
- Tests: unitarios C++ para permisos/identidad/revocación, tests Dart para el flujo de solicitud con Supabase simulado, test SQL/RLS si el repo tiene harness.

### Decisiones del diseñador (revisión del builder)

- La aprobación pone también `invited_at = now()` para que `expires_at = now() + 4h` cumpla el `CHECK (expires_at <= invited_at + 4h)`.
- `invitee_email` es NOT NULL: las filas de solicitud lo llenan con el email del JWT del solicitante.
- `postCloudPair` hoy consulta `server_members` primero y nunca mira filas Co-Op de un miembro: debe combinar ambas (rol base de miembro + permiso Co-Op vigente).
- Re-emparejar un cert ya emparejado sin override conserva permisos viejos: los no-dueños siempre reciben el perm calculado (override explícito), nunca el previo.

## Decisiones del dueño (2026-11-15)

1. Miembros `admin`/`operator` siguen pudiendo lanzar (co-dueños).
2. Ver la partida también requiere aprobación.
3. Emparejado por PIN = controlador.
4. Se puede unir a un juego abierto fuera de JUJO ("pantalla actual").

Sin preguntas abiertas.
