# Dry Run #3 — First-Time User Deploy Flow
**Date:** 2025-07-24  
**Scenario:** Brand new user, not registered, first time using app on Windows gaming PC

---

## 🔴 CRITICAL ALERTS (Must fix before ship)

| # | Location | Issue | Impact |
|---|----------|-------|--------|
| C-1 | `onboarding_screen.dart` `_startDeploy()` | **App doesn't auto-connect to freshly deployed server** — after deploy completes, `authProvider.serverUrl` is never set, no login against local server, no profile added | All subsequent API calls fail (game sources, status, pairing) — user sees empty/broken dashboard |
| C-2 | `onboarding_screen.dart` `_startDeploy()` | **Cloud config never written to server** — `cloud_supabase_url`, `cloud_supabase_key`, `cloud_user_token` never sent to server after deploy | Server can't heartbeat → invisible to cloud → "see all your servers" UX completely broken |

---

## ⚠️ FORENSIC ALERTS (Should fix)

| # | Location | Issue | Impact |
|---|----------|-------|--------|
| F-1 | `login_screen.dart` sign-up flow | **No email confirmation polling** — after sign-up, user told "check email" but app has no auto-retry/listener | User confusion: "I signed up, why can't I get in?" — must manually re-enter credentials |
| F-2 | `onboarding_screen.dart` deploy step | **No UAC pre-warning** — Windows elevation prompt appears without context | User may deny UAC thinking it's malware → deploy fails with cryptic error |

---

## 💡 RECOMMENDATIONS (Nice to have)

| # | Location | Suggestion |
|---|----------|------------|
| R-1 | Login screen | Add "Waiting for email confirmation..." state with Resend button + 5s auto-poll |
| R-2 | Deploy step | Add info banner: "Windows will ask for administrator permission" before deploy button |
| R-3 | Deploy step | Add retry button if UAC denied (currently just shows error) |
| R-4 | Post-deploy | Show "Connecting to server..." intermediate state before advancing to game sources |

---

## Fix Plan

### Fix C-1 + C-2 (combined — same location)

**After** `_deployComplete = true` in `_startDeploy()`, add post-deploy bootstrap:

```
1. Set serverUrl = 'https://localhost:47990'
2. Login to local server with bootstrap credentials
3. Add server profile (name: hostname or "This PC")
4. Write cloud config to server via POST /api/config
5. Wait for first heartbeat confirmation (optional)
```

**Files to modify:**
- `lib/features/onboarding/onboarding_screen.dart` — add `_bootstrapAfterDeploy()`
- May need: `lib/core/api/services/server_config_api.dart` — if POST /api/config client doesn't exist

### Fix F-1

**File:** `lib/features/auth/login_screen.dart`  
**Change:** After successful `signUp()`, start a Timer that calls `supabase.auth.refreshSession()` every 5s. On success → auto-login.

### Fix F-2

**File:** `lib/features/onboarding/onboarding_screen.dart`  
**Change:** Add `_InfoBanner` above deploy button explaining UAC requirement.
