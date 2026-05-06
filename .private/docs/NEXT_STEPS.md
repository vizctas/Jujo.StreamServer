# Jujo.StreamServer — Next Steps

**Date:** 2025-07-10  
**Sprint Status:** All planned tasks COMPLETE ✅  
**Flutter Tests:** 124/124 passing  
**Analyzer:** No issues

---

## What Was Built (This Sprint)

### 1. Full RBAC System (C++ Server)

| Layer | File | What It Does |
|-------|------|--------------|
| Engine | `src/server_rbac.h` | Role enum (viewer < operator < admin), Registry class, thread-safe |
| Engine | `src/server_rbac.cpp` | Persist/load `rbac_clients.json`, authorize by role hierarchy |
| Registration | `src/confighttp.cpp` | `postCloudPair` registers user with role from Supabase `server_members` table |
| Auth Pipeline | `src/http_auth.h` | `AuthSource` enum, `user_id` + `auth_source` fields on `AuthResult` |
| Auth Pipeline | `src/http_auth.cpp` | `check_cloud_jwt_auth()` — validates JWT via Supabase, RBAC lookup |
| Route Guard | `src/confighttp.cpp` | `authorize(response, request, rbac::Role)` — drop-in replacement for `authenticate()` |
| Startup | `src/confighttp.cpp` | `rbac::registry.init(appdata)` called on server boot |

### 2. Connection Quality Badge (Flutter)

| File | What |
|------|------|
| `lib/core/providers/server_profiles_provider.dart` | `activeConnectionType` + `activeConnectionTypeProvider` |
| `lib/features/dashboard/widgets/server_status_card.dart` | `_ConnectionBadge` — LAN (green) / WAN (blue) / Relay (amber) |
| `test/.../server_status_card_test.dart` | 4 new tests for badge states |

---

## Auth Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────┐
│ Incoming Request                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Has "Bearer <token>" header?                           │
│  ├─ YES → Try API Token (local, fast)                   │
│  │         ├─ Valid? → AuthSource::api_token → ADMIN    │
│  │         └─ Invalid? → Try Cloud JWT                  │
│  │                        ├─ Call Supabase /auth/v1/user │
│  │                        ├─ Extract user_id            │
│  │                        ├─ Check rbac::registry       │
│  │                        │   ├─ Found? → cloud_jwt     │
│  │                        │   │   → role from registry  │
│  │                        │   └─ Not found? → 403       │
│  │                        └─ Supabase error? → 401      │
│  │                                                      │
│  Has Session cookie?                                    │
│  ├─ YES → AuthSource::session → ADMIN                   │
│  │                                                      │
│  Has Basic auth?                                        │
│  └─ YES → AuthSource::session → ADMIN                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ authorize(response, request, required_role)              │
│  ├─ session/api_token → always passes (owner)           │
│  ├─ cloud_jwt → rbac::registry.authorize(user_id, role) │
│  │   ├─ admin ≥ admin ✓                                │
│  │   ├─ operator ≥ operator ✓                          │
│  │   ├─ viewer ≥ viewer ✓                              │
│  │   └─ viewer < admin ✗ → 403 JSON                    │
│  └─ fallback (no source) → passes (legacy compat)      │
└─────────────────────────────────────────────────────────┘
```

---

## Recommended Next Tasks (Pick One)

### A. Apply Route Guards to Endpoints [HIGH PRIORITY]

**Why:** The `authorize()` function exists but endpoints still use `authenticate()`. RBAC is not enforced yet.

**Work:** Replace `authenticate(response, request)` with `authorize(response, request, role)` on key endpoints:

| Endpoint Pattern | Required Role |
|-----------------|---------------|
| `GET /api/apps`, `GET /api/server/status`, `GET /api/covers/*` | `viewer` |
| `POST /api/apps/launch`, `POST /api/apps/quit` | `operator_` |
| `POST /api/config/*`, `POST /api/pair/*`, `DELETE /*` | `admin` |

**Effort:** ~15 one-line changes, 30 minutes.

---

### B. Build & Compile Verification

**Why:** All C++ changes are untested against the actual compiler.

**Work:**
1. Run CMake configure
2. Fix any missing includes or type errors
3. Verify `server_rbac.cpp` links correctly

**Effort:** 1 hour (requires MSVC/MinGW toolchain).

---

### C. Commit & Push

**Why:** Current work is only local. One bad disk event loses everything.

**Work:**
```bash
git add -A
git commit -m "feat(rbac): full RBAC engine + cloud JWT auth pipeline + connection badge"
git push origin master
```

**Effort:** 2 minutes.

---

### D. Streaming Session Management UI (New Feature)

**Why:** Users can't see who's streaming or disconnect remote sessions.

**Work:**
- New `GET /api/sessions` endpoint (C++)
- `StreamingSessionsCard` widget (Flutter)
- Remote disconnect button

**Effort:** 4-6 hours.

---

### E. Remote Wake-on-LAN (New Feature)

**Why:** Users want to wake their gaming PC from the mobile app.

**Work:**
- `POST /api/wol` endpoint (C++) — sends magic packet
- Flutter UI button on offline server cards
- Requires server to know target MAC address (from config)

**Effort:** 3-4 hours.

---

## File Inventory (Modified This Sprint)

```
MODIFIED:
  src/confighttp.cpp          — authorize(), rbac::registry.init(), postCloudPair role fetch
  src/http_auth.h             — AuthSource enum, AuthResult.user_id, AuthResult.auth_source
  src/http_auth.cpp           — check_cloud_jwt_auth(), AuthSource on all paths, Bearer fallback

NEW:
  src/server_rbac.h           — rbac::Role, rbac::Registry, rbac::registry singleton
  src/server_rbac.cpp         — Full implementation (init/load/save/authorize/register)

FLUTTER MODIFIED:
  lib/core/providers/server_profiles_provider.dart
  lib/features/dashboard/widgets/server_status_card.dart
  test/features/dashboard/widgets/server_status_card_test.dart
```
