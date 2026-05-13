# Pairing Page Cloud Toggle Redesign

**Date:** 2026-05-13
**Scope:** Flutter app (`jujo_stream_app`) — Pairing screen, Dashboard, Settings
**Status:** Approved

## Problem

- The **Cloud** tab on the Pairing page is rarely used but consumes prominent tab real estate.
- **Auto-trust cloud clients** is buried in Settings > Security, making it hard to find.
- **Client role permissions** are not visible on the Pairing page; users must hunt through Settings to find `ClientsPermissionsScreen`.

## Goals

1. Remove the Cloud tab from Pairing.
2. Surface server registration and auto-trust toggles in high-traffic screens (Dashboard + Settings > Connection).
3. Make client role permissions discoverable directly on the Pairing page.

---

## 1. Dashboard & Settings Toggles

### Location

Add two compact `SwitchListTile` rows inside:

- **Dashboard > Server Status card** — below existing metrics.
- **Settings > Connection tab** — below the "Connected to" box.

### Visibility rules

| Toggle | Visible when |
|--------|-------------|
| Register in Cloud | Cloud account signed in AND server configured |
| Auto-trust cloud clients | Server is registered in cloud |

### Behavior

- **Register in Cloud** — calls existing `CloudServerRegistrationService.registerActiveServer()`. On success, invalidates `serverStatusPollingProvider` and refreshes `serverStatusProvider`. Unregister sends DELETE to `/api/cloud/register` (new API call).
- **Auto-trust cloud clients** — uses existing `cloudConfigNotifierProvider.setAutoTrust(bool)`.

### Error handling

- Inline subtitle turns red with error text; no blocking dialogs.
- Loading state disables the switch.

---

## 2. Pairing Page

### Tab bar

- **Remove Cloud tab** (`length` 4 → 3).
- **New tab order**: QR / OTP | PIN (Legacy) | Permissions

### Paired Devices list

- **Header row** gets a "Manage Permissions" text button next to Refresh. Opens full-screen `ClientsPermissionsScreen`.
- Empty state updated: remove reference to Cloud tab.

### Access Control tab

- Renamed to **Permissions** (label only, widget stays `AccessControlPanel`).
- Each `_ClientCard` already shows a tappable role badge with a chevron. Add tooltip "Tap to change role" for clarity.
- Tapping badge opens existing `_RolePickerSheet` bottom sheet.

---

## 3. Data Flow

```
Dashboard / Settings
  ├─ cloudAccount? ──► show Register toggle
  ├─ register toggle ──► CloudServerRegistrationService
  │                      ├─ POST /api/cloud/register  (register)
  │                      └─ DELETE /api/cloud/register (unregister)
  ├─ registered? ──► show Auto-trust toggle
  └─ auto-trust toggle ──► cloudConfigNotifierProvider

PairingScreen
  ├─ TabController(length: 3)
  │   ├─ QR / OTP
  │   ├─ PIN (Legacy)
  │   └─ Permissions (was Access Control)
  │       └─ _ClientCard
  │           └─ role badge tap
  │               └─ _RolePickerSheet ──► rbacClientsStateNotifier.updateRole()
  ├─ Paired clients list
  │   └─ "Manage Permissions" button
  │       └─ push ClientsPermissionsScreen
```

## 4. Error Handling

- Registration/unregistration errors: show inline red subtitle below toggle.
- Role update errors: show `SnackBar` (existing behavior).
- Network failures: retry button on error banners (existing pattern).

## 5. Testing

- **Widget tests**: verify toggles appear/disappear based on auth state; verify Cloud tab is gone; verify role badge opens picker.
- **Integration tests**: registration toggle triggers correct API; auto-trust toggle persists.

## 6. Scope Exclusions

- No changes to `_RolePickerSheet` or `ClientsPermissionsScreen` internals.
- No changes to server-side APIs except adding DELETE `/api/cloud/register` (tracked separately if not present).
- No changes to navigation shell (`AppShell`).

## 7. Migration / Backwards Compatibility

- Existing users who relied on the Cloud tab will find registration in Dashboard or Settings > Connection.
- Auto-trust setting value is preserved (same provider).

---

*Approved by user on 2026-05-13.*
