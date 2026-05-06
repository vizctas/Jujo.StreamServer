# Dry Run Execution Results — Scenarios 5–9

**Date:** 2025-07-24  
**Method:** Code trace against actual implementation

---

## Scenario 5: Remote Access — Phone Over WAN ✅ PASS (with notes)

### Code Trace
- `ServerConnectionRacer` → races LAN/WAN/TURN in parallel ✅
- `TurnCredentialService.getCredentials()` → checks `isExpired` (TTL - 5min margin) → auto-refreshes ✅
- Cached credentials returned if valid, fresh fetch if expired ✅
- Graceful fallback: if TURN unavailable, returns null → racer skips TURN path ✅

### Remaining Gaps (non-blocking)
| # | Gap | Severity |
|---|-----|----------|
| 1 | No "Connection: Relay" badge in stream overlay | ⚠️ UX |
| 2 | No quality indicator when streaming over TURN vs direct | ⚠️ UX |
| 3 | Racer timeout error message may be generic | ⚠️ UX |

### Verdict: **PASS** — core flow works. UX polish items only.

---

## Scenario 6: Multi-User — Friend Joins Shared Server 🔴 FAIL

### Code Trace
- `ServerSharingService.acceptInvite(code)` → inserts `server_members` row in Supabase ✅
- Invite code validation + role assignment ✅
- Server profile appears in User B's switcher (via cloud profile sync) ✅

### Critical Failures
| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| 1 | **C++ server has NO `server_members` concept** | 🔴 Critical | `grep -r "server_members\|member.*role\|role.*check" src/` → 0 results |
| 2 | **Role enforcement is CLIENT-SIDE ONLY** | 🔴 Security | Flutter checks role before showing UI, but server accepts all requests from any paired cert |
| 3 | **Shared user pairing** — how does User B pair? | 🔴 Functional | Cloud pair requires owner's JWT. User B has their own JWT. Server validates against owner's token only. |

### Verdict: **FAIL** — Server sharing is cosmetic. Any paired client has full access regardless of role. User B cannot pair at all without owner's JWT.

---

## Scenario 7: Offline/Degraded — Internet Drops Mid-Stream ✅ PASS (with notes)

### Code Trace
- Cloud agent heartbeat loop: `while (!stop) { push_identity(); wait_for(60s); }` ✅
- On failure: logs warning, waits 60s, retries ✅ (no tight loop)
- LAN streaming: completely independent of cloud/internet ✅
- No Supabase dependency in streaming path ✅

### Remaining Gaps
| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| 1 | Server JWT (`cloud_user_token`) expires after ~1h | ⚠️ Medium | Server can't refresh its own token. After internet returns, heartbeat may fail with 401 until app pushes new token |
| 2 | No immediate heartbeat on network restore | ⚠️ Low | Always waits full interval (60s max delay) |
| 3 | No hysteresis on presence — goes stale after 2min exactly | ⚠️ Low | Acceptable for MVP |

### Verdict: **PASS** — LAN streaming unaffected. Cloud presence recovers within 60s of internet restore (assuming token still valid).

---

## Scenario 8: Second Device — Existing User 🔴 FAIL

### Code Trace
- `onboardingProvider` → reads `SharedPreferences('jujo_onboarding_complete')` → `false` on new device ✅ (expected)
- Router: `if (!onboardingDone && !isOnOnboarding) return '/onboarding'` → **ALWAYS shows onboarding on new device**
- No check for existing `user_server_profiles` in Supabase before showing wizard
- User sees "Deploy Server" / "Connect to Server" on a device that should just be a client

### Critical Failures
| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| 1 | **Onboarding always shows on new device** | 🔴 Critical | `onboarding_provider.dart` line 18: only checks local SharedPreferences |
| 2 | **No "Welcome back" flow** | 🔴 UX | Existing user with servers sees same wizard as brand-new user |
| 3 | **Race condition** | ⚠️ Medium | Even if we add profile check, cloud sync may not complete before router redirects |

### Fix Required
```dart
// In onboarding_provider.dart or app_router.dart redirect:
final profiles = await ref.read(serverProfilesProvider.notifier).fetchFromCloud();
if (profiles.isNotEmpty) {
  // Skip onboarding — user already has servers
  await complete(); // mark as done locally
  return '/'; // go to dashboard
}
```

### Verdict: **FAIL** — Confusing UX for existing users on new devices.

---

## Scenario 9: Token Expiry & Session Recovery 🔴 FAIL

### Code Trace
- Supabase Flutter SDK handles `refreshSession()` automatically on API calls ✅
- `onAuthStateChange` stream exists in `cloud_auth_service.dart` ✅
- **BUT:** No listener pushes fresh `accessToken` to server's `cloud_user_token` config

### Critical Failures
| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| 1 | **Server token never refreshed after initial deploy** | 🔴 Critical | `cloud_user_token` pushed only in `_bootstrapAfterDeploy()`. No other code path updates it. |
| 2 | **No token push on re-login** | 🔴 Critical | After session refresh or re-authentication, app doesn't call `PATCH /api/config` with new token |
| 3 | **Server JWT expires in ~1h** | 🔴 Critical | Supabase default JWT TTL = 3600s. After 1h, cloud agent heartbeat fails permanently until app manually pushes new token |
| 4 | **Multi-server token sync missing** | ⚠️ Medium | If user has multiple servers, none get updated tokens |

### Fix Required
```dart
// Listen to auth state changes and push fresh token to all reachable servers
Supabase.instance.client.auth.onAuthStateChange.listen((data) {
  if (data.event == AuthChangeEvent.tokenRefreshed && data.session != null) {
    _pushTokenToAllServers(data.session!.accessToken);
  }
});

Future<void> _pushTokenToAllServers(String token) async {
  final profiles = ref.read(serverProfilesProvider).profiles;
  for (final profile in profiles) {
    try {
      final client = ApiClient(baseUrl: profile.url, ...);
      final configApi = ConfigApi(client: client);
      await configApi.applyConfig({'cloud_user_token': token});
    } catch (_) {} // best-effort
  }
}
```

### Verdict: **FAIL** — Server goes permanently offline in cloud after ~1h unless user manually re-deploys or triggers config push.

---

## 📊 CONSOLIDATED RESULTS

| Scenario | Result | Critical Issues |
|----------|--------|-----------------|
| 5 — Remote WAN/TURN | ✅ PASS | UX polish only |
| 6 — Multi-User Sharing | 🔴 FAIL | Server has no role enforcement; shared user can't pair |
| 7 — Offline/Degraded | ✅ PASS | Token expiry concern (shared with #9) |
| 8 — Second Device | 🔴 FAIL | Onboarding always shows; no "welcome back" flow |
| 9 — Token Expiry | 🔴 FAIL | Server token expires in 1h; never refreshed |

---

## Priority Fix Order

| Priority | Fix | Effort | Status |
|----------|-----|--------|--------|
| **P0** | Token refresh → push to server on `tokenRefreshed` event | Med | ✅ **FIXED** — `CloudTokenSyncService` in `cloud_token_sync_provider.dart` |
| **P1** | Onboarding skip for existing users (check cloud profiles) | Med | ✅ **FIXED** — `onboarding_provider.dart` queries `user_server_profiles` |
| **P2a** | Shared user cloud pairing (member check) | Med | ✅ **FIXED** — `postCloudPair` queries `server_members` via Supabase REST. Members can now pair. |
| **P2b** | Full RBAC per API route | High | ⏳ **DEFERRED** — requires cert→user_id mapping + role guards on 85+ endpoints |
| **P3** | UX badges (relay indicator, connection quality) | Low | ⏳ Backlog |
