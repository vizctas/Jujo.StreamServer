# Co-Op Fase 1 — Política de roles y revocación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que los invitados (miembros `viewer` e invitados Co-Op) no puedan lanzar/cerrar/cancelar apps ni quedarse con el rol de dueño, y que pierdan el acceso de verdad al expirar o revocarse.

**Architecture:** La política vive en headers puros testeables (`coop_cloud_auth.h`, nuevo `coop_guest_access.h`); `postCloudPair` y `nvhttp::cloud_pair` la aplican y persisten una "concesión de invitado" en cada certificado; un revocador corre en el heartbeat de CloudAgent (60 s). El cliente lee `root.Permission` de `serverinfo` para ocultar acciones de controlador.

**Tech Stack:** C++23 (Sunshine fork, gtest standalone vía CTest), Flutter/Dart (flutter_test).

**Spec:** `docs/superpowers/specs/2026-11-15-coop-join-requests-design.md` (§1, §2, §3, §5 parcial). Fases 2 (solicitud + "pantalla actual" §2b) y 3 (avisos) tendrán planes propios.

## Global Constraints

- Bits `crypto::PERM`: `input_controller=256`, `input_mouse=2048`, `input_kbd=4096`, `list=1<<24`, `view=1<<25`, `launch=1<<26`; `_allow_view = view|launch`; `_default = _all_actions|_all_inputs`.
- Controlador = cert dueño (`cloud_pair` con `sub` == dueño), miembro `admin`/`operator`, o emparejado por PIN/OTP. Invitado = miembro `viewer` o invitado Co-Op. Controladores no cambian de permisos.
- Perm de invitado (sin `launch`): `viewer → list|view`, `coop_pad → list|view|input_controller`, `coop_kbm → list|view|input_controller|input_mouse|input_kbd`. Miembro `viewer` sin Co-Op vigente: `list`.
- Invitados: RBAC a lo sumo `viewer`; nunca auto-promoción (`auto_trust_cloud_clients`, "primer cliente = admin").
- Revocación: ≤ 60 s; `expires_at` local se aplica siempre, aun sin red; si la nube no responde, se conserva el último estado.
- Commits: solo si el usuario los autorizó en la sesión de ejecución; si no, dejar los cambios sin commitear y listarlos.
- Build server: `export PATH="$PATH:/c/msys64/ucrt64/bin"`; nunca anteponer `/c/msys64/usr/bin`. Compilar con `-j 4` (OOM con más).
- Español neutro en textos de UI (sin voseo).

## Review Focus

1. **Dispositivo invitado emparejado antes de esta versión** (perm viejo con `launch`): el cliente re-empareja en cada sync de nube (`cloud_sync_service.dart:933`); el server debe recalcular siempre el perm de invitados → test en Task 3 (`cloud_pair` con cert existente + concesión de invitado sobreescribe perm).
2. **Dueño que reconecta por la nube**: no debe recibir override ni concesión de invitado → test en Task 1 (`resolve_cloud_pair_access` para miembro admin no trae override).
3. **Reloj sin red**: invitación expirada con la nube caída → revocar igual → test en Task 2 (`evaluate` con `cloud=nullopt` y `now>=expires`).
4. **Miembro `viewer` cuya invitación Co-Op terminó**: degradar a `list`, no desemparejar → test en Task 2.
5. **Respuesta `serverinfo` por HTTP (no emparejado) trae `Permission=0`**: el cliente no debe tratarlo como "invitado" → test en Task 6 (solo HTTPS fija permisos).

---

### Task 1: Política de permisos en `coop_cloud_auth.h`

**Files:**
- Modify: `src/coop_cloud_auth.h`
- Modify: `src/server_rbac.h` (función pura nueva), `src/server_rbac.cpp:46-53`
- Test: `tests/unit/test_coop_auth.cpp`

**Interfaces:**
- Produces:
  - `crypto::PERM coop_invite_role_to_perm(std::string_view role)` — valores de Global Constraints (rol desconocido → `viewer`).
  - `constexpr crypto::PERM kMemberViewerBasePerm = crypto::PERM::list;`
  - `CloudPairAuthDecision` gana campos: `bool is_controller = false; std::string coop_invite_id; std::string coop_expires_at; std::string member_role;`
  - `CloudPairAuthDecision resolve_cloud_pair_access(member_data, coop_data)`:
    - miembro `admin`/`operator` → `allowed, is_member, is_controller`, `pair_role` mapeado, **sin** `perm_override`.
    - miembro `viewer` + fila Co-Op → `allowed, is_member, is_coop_guest`, `pair_role=viewer`, `perm_override=coop_invite_role_to_perm(rol)`, `coop_role`, `coop_invite_id` (`id`), `coop_expires_at` (`expires_at`).
    - miembro `viewer` sin Co-Op → `allowed, is_member`, `pair_role=viewer`, `perm_override=kMemberViewerBasePerm`.
    - solo Co-Op → como hoy + `perm_override` nuevo + `coop_invite_id`/`coop_expires_at`.
  - `rbac::Role rbac::initial_role(rbac::Role requested, bool first_client, bool auto_trust, bool promotable)` en `server_rbac.h` (inline): promueve a `admin` solo si `promotable && (first_client || auto_trust)`.
  - `void rbac::Registry::register_client(const std::string &user_id, Role role, const std::string &display_name = "", bool promotable = true)`.

- [ ] **Step 1: Reescribir los tests de rol y agregar los nuevos**

```cpp
TEST(CoopCloudAuthTest, GuestRolesNeverIncludeLaunch) {
  using P = crypto::PERM;
  auto u = [](P p) { return std::to_underlying(p); };
  EXPECT_EQ(u(coop_invite_role_to_perm("viewer")), u(P::list) | u(P::view));
  EXPECT_EQ(u(coop_invite_role_to_perm("coop_pad")), u(P::list) | u(P::view) | u(P::input_controller));
  EXPECT_EQ(u(coop_invite_role_to_perm("coop_kbm")),
            u(P::list) | u(P::view) | u(P::input_controller) | u(P::input_mouse) | u(P::input_kbd));
  EXPECT_EQ(u(coop_invite_role_to_perm("admin")), u(P::list) | u(P::view));
  for (auto r : {"viewer", "coop_pad", "coop_kbm", "admin"}) {
    EXPECT_EQ(u(coop_invite_role_to_perm(r)) & u(P::launch), 0u) << r;
  }
}
TEST(CoopCloudAuthTest, AdminOrOperatorMemberIsControllerWithoutOverride)   // members=[{role:"operator"}], coop=[{role:"coop_pad"}] → is_controller, no override, pair_role operator_
TEST(CoopCloudAuthTest, ViewerMemberWithActiveCoopGetsCoopPermAndGrant)    // members=[{role:"viewer"}], coop=[{id:"c1",role:"coop_pad",expires_at:"2026-11-15T20:00:00Z"}] → is_member && is_coop_guest, override=list|view|pad, coop_invite_id=="c1", coop_expires_at==...
TEST(CoopCloudAuthTest, ViewerMemberWithoutCoopGetsListOnly)              // override==PERM::list, !is_controller
TEST(CoopCloudAuthTest, InitialRoleNeverPromotesGuests)                  // initial_role(viewer,true,true,false)==viewer; initial_role(viewer,true,false,true)==admin; initial_role(viewer,false,true,true)==admin; initial_role(viewer,false,false,true)==viewer
```

Borrar `MapsCoopRolesToCappedNvhttpPermissions` y `GrantsPermanentMemberPrecedenceWithoutOverridingPerm` (contradicen la política); actualizar `AuthorizesCoopGuestAsViewerRbacWithCappedPerm` al perm nuevo.

- [ ] **Step 2: Compilar y ver que fallen**

Run: `cd /c/Users/Jozh/repos/Jujo.StreamServer && export PATH="$PATH:/c/msys64/ucrt64/bin" && cmake -B build-ninja -DBUILD_TESTS=ON >/dev/null && cmake --build build-ninja --target test_coop_auth -j 4 && build-ninja/tests/test_coop_auth.exe`
Expected: errores de compilación por `initial_role`/campos nuevos, o FAIL en `GuestRolesNeverIncludeLaunch`.

- [ ] **Step 3: Implementar** `coop_invite_role_to_perm`, `kMemberViewerBasePerm`, campos nuevos, `resolve_cloud_pair_access` (la consulta Co-Op ahora se evalúa también para miembros `viewer`), `rbac::initial_role` y el parámetro `promotable` de `register_client` (que `server_rbac.cpp:46-53` use `initial_role`).

- [ ] **Step 4: Correr tests**

Run: el comando del Step 2. Expected: `[  PASSED  ]` todos.

- [ ] **Step 5: Commit** (si está autorizado): `feat(coop): cap guest perms without launch, controller members`

---

### Task 2: Veredicto de acceso de invitado (`coop_guest_access.h`)

**Files:**
- Create: `src/coop_guest_access.h`
- Test: `tests/unit/test_coop_auth.cpp` (mismo target; agregar `#include "src/coop_guest_access.h"`)

**Interfaces:**
- Produces (namespace `coop_access`):
  - `struct guest_grant_t { std::string user_id; std::string invite_id; std::int64_t expires_at = 0; bool is_member = false; };` (`expires_at` en epoch s; 0 = sin expiración)
  - `struct cloud_status_t { bool member_active = false; bool invite_active = false; };`
  - `enum class verdict_e { keep, downgrade_to_member, revoke };`
  - `verdict_e evaluate(const guest_grant_t &g, std::int64_t now, const std::optional<cloud_status_t> &cloud);`
  - `std::int64_t parse_iso8601_utc(std::string_view iso);` (0 si no parsea; formato `YYYY-MM-DDTHH:MM:SS[.ffffff][Z|+00:00]`)

Reglas de `evaluate` (en orden): invitación vencida localmente (`expires_at>0 && now>=expires_at`) → `is_member ? downgrade_to_member : revoke`; `cloud` vacío → `keep`; `invite_id` no vacío y `!invite_active` → `is_member && member_active ? downgrade_to_member : revoke`; `is_member && !member_active` → `revoke`; si no → `keep`.

- [ ] **Step 1: Tests**

```cpp
TEST(CoopGuestAccessTest, ExpiredInviteRevokesEvenOffline)          // {invite_id:"c1",expires_at:100}, now=100, nullopt → revoke
TEST(CoopGuestAccessTest, ExpiredInviteDowngradesMember)            // is_member=true, same → downgrade_to_member
TEST(CoopGuestAccessTest, CloudUnreachableKeepsUnexpired)           // expires_at=200, now=100, nullopt → keep
TEST(CoopGuestAccessTest, RevokedInviteRevokesGuest)                // invite_id set, cloud{invite_active=false} → revoke
TEST(CoopGuestAccessTest, RevokedInviteDowngradesActiveMember)      // is_member, cloud{member_active=true, invite_active=false} → downgrade_to_member
TEST(CoopGuestAccessTest, RemovedMemberIsRevoked)                   // is_member, invite_id="", cloud{member_active=false} → revoke
TEST(CoopGuestAccessTest, ParsesSupabaseTimestamps)                 // parse_iso8601_utc("2026-11-15T20:00:00+00:00")==1794772800; ("2026-11-15T20:00:00.123456Z")==1794772800; ("garbage")==0
```

- [ ] **Step 2: Correr y ver fallar** — comando de Task 1 Step 2. Expected: no compila (header inexistente).
- [ ] **Step 3: Implementar `coop_guest_access.h`** (header-only, sin dependencias de Sunshine; `parse_iso8601_utc` con `std::chrono::sys_days` y aritmética, sin `timegm`).
- [ ] **Step 4: Correr tests** — Expected: PASS.
- [ ] **Step 5: Commit** (si está autorizado): `feat(coop): pure guest access verdict`

---

### Task 3: Persistir la concesión y aplicarla en `cloud_pair` / `postCloudPair`

**Files:**
- Modify: `src/crypto.h:106-128` (`named_cert_t`)
- Modify: `src/nvhttp.cpp:964` (save), `:1186` (load), `:4090-4150` (`cloud_pair`), `src/nvhttp.h:382`
- Modify: `src/confighttp_auth.cpp:640-733` (`postCloudPair`)

**Interfaces:**
- Consumes: `coop_access::guest_grant_t`, `coop_access::parse_iso8601_utc` (Task 2); campos de `CloudPairAuthDecision`, `register_client(..., promotable)` (Task 1).
- Produces:
  - `named_cert_t` gana `std::optional<coop_access::guest_grant_t> guest;` persistido en el JSON de estado como objeto `"guest": {"user_id","invite_id","expires_at","is_member"}` (ausente = controlador).
  - `std::string nvhttp::cloud_pair(const std::string &pem, const std::string &name, std::optional<crypto::PERM> perm_override, std::optional<coop_access::guest_grant_t> guest = std::nullopt);`
    - Con `guest`: siempre fija `perm = *perm_override` y `guest`, también si el cert ya existía; nunca `previous_perm_for`.
    - Sin `guest`: comportamiento actual, pero si el cert existente tenía `guest`, se limpia (pasó a controlador).

- [ ] **Step 1: Implementar** campos, (de)serialización y la nueva firma de `cloud_pair`.
- [ ] **Step 2: Cablear `postCloudPair`**: para no-dueños consultar **siempre** ambas tablas (`server_members` y `coop_session_invites` con `select=id,role,expires_at`); si `decision.is_controller` → `cloud_pair(pem, name, std::nullopt)` y `register_client(user_id, pair_role, email, true)`; si no → `cloud_pair(pem, name, decision.perm_override, guest_grant_t{user_id, decision.coop_invite_id, parse_iso8601_utc(decision.coop_expires_at), decision.is_member})` y `register_client(user_id, rbac::Role::viewer, email, false)`. El dueño queda igual (sin override, `promotable=true`).
- [ ] **Step 3: Build completo**

Run: `cd /c/Users/Jozh/repos/Jujo.StreamServer && export PATH="$PATH:/c/msys64/ucrt64/bin" && cmake --build build-ninja --config Release -j 4 --target sunshine 2>&1 | grep -E "error|FAILED" ; echo built`
Expected: sin `error`/`FAILED`.

- [ ] **Step 4: Prueba de regresión del Review Focus #1** — en `tests/unit/test_confighttp.cpp` (target `test_sunshine`, solo si ese target compila en el entorno; si no, documentar como verificación manual): `cloud_pair` dos veces con el mismo PEM, primero sin `guest` (perm `_default`) y luego con `guest` y override `list|view` → el cert queda con `list|view` y `guest->user_id` fijado.
- [ ] **Step 5: Commit** (si está autorizado): `feat(coop): persist guest grant per cert and cap on re-pair`

---

### Task 4: Cerrar rutas de control de apps y el rol de dueño

**Files:**
- Modify: `src/confighttp_streaming.cpp:227,290,312` (`launchApp`, `closeApp`, `forceKillApp`), `src/confighttp_auth.cpp:311` (`launchLocalApp`)
- Modify: `src/nvhttp.cpp:106-161` (`resolve_rtsp_coop_identity`)

**Interfaces:**
- Consumes: `named_cert_t::guest` (Task 3).

- [ ] **Step 1:** En las 4 rutas reemplazar `authenticate(response, request)` por `authorize(response, request, rbac::Role::operator_)` (mismo patrón que `confighttp_streaming.cpp:1383`).
- [ ] **Step 2:** Enumerar el resto de rutas que llaman solo `authenticate()` (`grep -n "authenticate(response, request)" src/confighttp*.cpp`) y, para cada una que **mute** estado de apps/sesiones/pantalla (terminar, lanzar, cambiar display, cerrar sesiones), aplicar el mismo cambio. Las de solo lectura quedan. Listar en el mensaje de commit/handoff cuáles se cambiaron.
- [ ] **Step 3:** En `resolve_rtsp_coop_identity`, tratar como no-dueño todo cert con `cert.guest.has_value()` además de `!can_launch` (defensa en profundidad si un perm viejo aún tiene `launch`).
- [ ] **Step 4: Build** — comando de Task 3 Step 3. Expected: sin errores.
- [ ] **Step 5: Commit** (si está autorizado): `fix(coop): require operator for app control; guests never own session`

---

### Task 5: Revocador en el heartbeat

**Files:**
- Create: `src/coop_guest_revoker.h`, `src/coop_guest_revoker.cpp` (agregar a la lista de fuentes del target `sunshine`, junto a `couch_coop.cpp`)
- Modify: `src/cloud_agent.cpp` (loop del heartbeat, ~línea 523), `src/nvhttp.cpp`/`nvhttp.h` (helper de enumeración)

**Interfaces:**
- Consumes: `coop_access::evaluate` (Task 2); `named_cert_t::guest` (Task 3); `stream::kick_coop_session(const std::string&)` (`stream.h:92`); `couch_coop::coordinator().snapshot_sessions(now_ms)` (`peer_session_t{session_id, client_uuid}`); `nvhttp::unpair_client(std::string_view uuid)`; `rbac::registry.remove_client(user_id)`.
- Produces:
  - `std::vector<std::pair<std::string, coop_access::guest_grant_t>> nvhttp::guest_grants();` (uuid → concesión, copia bajo lock)
  - `bool nvhttp::set_client_perm(std::string_view uuid, crypto::PERM perm, std::optional<coop_access::guest_grant_t> guest);` (persiste)
  - `void coop_revoker::run_once(std::int64_t now_epoch);` — por cada concesión: arma `cloud_status_t` consultando con el token del dueño `server_members?select=status&owner_id=eq.<owner>&member_id=eq.<user>&server_url=eq.<url>` y, si hay `invite_id`, `coop_session_invites?select=status,expires_at&id=eq.<invite_id>` (`invite_active = status=='active' && expires_at>now`); fallo de red → `nullopt`. Aplica veredicto:
    - `revoke` → `kick_coop_session` para cada sesión con `client_uuid == uuid`, `unpair_client(uuid)`, y `remove_client(user_id)` si ya no quedan certs de ese usuario.
    - `downgrade_to_member` → kick de sus sesiones + `set_client_perm(uuid, kMemberViewerBasePerm, guest con invite_id="" y expires_at=0)`.
  - Log `info`: `CoopRevoker: <verdict> client='<name>' user=<user_id> reason=<...>`.

- [ ] **Step 1: Implementar** `guest_grants`, `set_client_perm`, `coop_revoker::run_once`.
- [ ] **Step 2:** Llamar `coop_revoker::run_once(now)` en cada vuelta del heartbeat de `cloud_agent.cpp`, después del push de identidad, solo si `config::cloud.user_token` no está vacío; envolver en `try/catch` con log `warning`.
- [ ] **Step 3:** En `nvhttp::launch` y `resume`, antes de la verificación de permiso: si el cert tiene `guest` con `expires_at>0 && now>=expires_at`, aplicar el veredicto local (sin red) en el acto.
- [ ] **Step 4: Build** — comando de Task 3 Step 3. Expected: sin errores.
- [ ] **Step 5: Verificación manual en JUJOPC** (documentar resultado): emparejar un invitado Co-Op `coop_pad` de prueba, conectar, revocar la fila en Supabase (`update coop_session_invites set status='revoked' where id=...`) → en ≤ 60 s el log muestra `CoopRevoker: revoke` y la sesión del invitado se corta.
- [ ] **Step 6: Commit** (si está autorizado): `feat(coop): revoke expired or revoked guests within a heartbeat`

---

### Task 6: Cliente — saber si puede lanzar y no confundir 403 con offline

**Files:**
- Modify: `Jujo.StreamClient/lib/models/computer_details.dart` (campo + getter + JSON)
- Modify: `Jujo.StreamClient/lib/services/http_api/nv_http_client.dart` (`parseServerInfo`, solo en la rama HTTPS)
- Modify: `Jujo.StreamClient/lib/screens/app_view/app_view_screen.dart:1346-1370,2455-2656` (Play/Quit/Join)
- Modify: `Jujo.StreamClient/lib/l10n/` (ARB es/en)
- Test: `Jujo.StreamClient/test/models/computer_permission_test.dart` (nuevo), `test/services/http_api/` (existente si hay tests de `parseServerInfo`)

**Interfaces:**
- Produces: `int? hostPermission` en `ComputerDetails` (persistido como `hostPermission`); getters `bool get canLaunchApps => hostPermission == null || (hostPermission! & 0x4000000) != 0;` y `bool get canViewStream => hostPermission == null || (hostPermission! & 0x2000000) != 0;`.

- [ ] **Step 1: Tests**

```dart
test('canLaunchApps is true when permission unknown (legacy/unpaired)', ...)          // hostPermission null → true
test('guest without launch bit cannot launch but can view', ...)                      // 0x1000000|0x2000000|256 → canLaunchApps false, canViewStream true
test('member viewer with list only cannot view', ...)                                 // 0x1000000 → canViewStream false
test('serverinfo over HTTP does not set hostPermission', ...)                         // parseServerInfo HTTP body con <Permission>0</Permission> → hostPermission null
test('serverinfo over HTTPS sets hostPermission', ...)                                // HTTPS body <Permission>50331904</Permission> → 50331904
```

- [ ] **Step 2: Run** `cd /c/Users/Jozh/repos/Jujo.StreamClient && flutter test test/models/computer_permission_test.dart` — Expected: FAIL (getter inexistente).
- [ ] **Step 3: Implementar** campo, getters y parseo (marcar en `fetchServerInfo` cuándo vino por HTTPS — ya existe `pairStatusFromHttps`).
- [ ] **Step 4: UI**: si `!canLaunchApps`, ocultar Play de apps no en curso y "Quit Session"; en un 403 de `/launch` con `!canLaunchApps` mostrar `l10n.onlyOwnerCanLaunch` = "Solo el dueño puede iniciar juegos" / "Only the owner can start games" en vez del error de conexión. Ocultar controles de dueño (pausar/expulsar/cambiar rol) del panel "Co-Op Players" (`game_stream_screen.dart:3447-3637`) si `!canLaunchApps`.
- [ ] **Step 5: Run** `flutter test` (suite completa). Expected: verde salvo `test/release/changelog_test.dart`, fallo preexistente (ver Handoff).
- [ ] **Step 6: Commit** (si está autorizado): `feat(client): honor host permission bits for guests`

---

### Task 7: Verificación de punta a punta (JUJOPC + S24)

- [ ] **Step 1:** Empaquetar server (`make package-zip VERSION=<siguiente>`; si falla `cpack` desde bash, usar los pasos manuales en PowerShell: `cpack`, `cmake --build build-ninja --target package_installer`, `scripts/package_server_zip.ps1`), instalar en JUJOPC; compilar e instalar APK en S24.
- [ ] **Step 2:** Con una cuenta de prueba como invitado Co-Op `coop_pad` en JUJOPC: confirmar (a) ve la biblioteca, no ve Play ni Quit; (b) se une al juego que lanzó el dueño como P2; (c) `/cancel` con su cert → 403 (log `Permission CancelApp denied`); (d) revocar → expulsado en ≤ 60 s.
- [ ] **Step 3:** Desde los dispositivos del dueño (PIN y nube): lanzar/cerrar sigue funcionando.
- [ ] **Step 4:** Reportar resultados con extractos de log; no marcar como hecho lo no verificado.

## Handoff

- Fallo preexistente conocido: `test/release/changelog_test.dart` (pubspec en 1.1.43 sin entrada de changelog) — no es de este plan.
- Siguientes planes: Fase 2 (migración `requested` + RPCs + UI "Pedir unirse" + "pantalla actual" §2b) y Fase 3 (toast en stream + aviso StreamAdmin).
