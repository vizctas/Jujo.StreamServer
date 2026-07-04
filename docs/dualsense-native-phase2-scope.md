# Phase 2 Scope — Native DualSense (adaptive triggers, haptics, PS5 prompts)

Scoping doc, not an implementation plan. Decides **whether and how** to make the
host present a *real* DualSense so games send adaptive-trigger / rich-haptic data,
and that data reaches the player's physical DualSense.

Phase 0 (DS4-based fidelity) is essentially done: buttons/sticks/triggers, gyro,
rumble (incl. trigger vibrators), lightbar/RGB, touchpad-input all wired
end-to-end. What Phase 0 **cannot** deliver — and this doc is about — is what only
a genuine DualSense provides: **adaptive triggers**, DualSense-grade **haptics**,
and PS5 **button prompts** in-game.

## Why this needs a virtual DualSense on the host (no shortcut)

A game only emits adaptive-trigger / haptic **output reports** to a device it sees
as a DualSense (Sony VID 054C, PID 0CE6, DualSense HID descriptor). Today the host
emulates a **DualShock 4** (ViGEm), which has no trigger motors, so the game never
sends trigger data at all. Therefore adaptive triggers are impossible until the
host exposes a device the game recognizes as a DualSense. This is the crux and
there is no client-side or heuristic workaround (you can't synthesize trigger data
the game never sends).

## The end-to-end chain (3 parts, all required)

1. **Host: virtual DualSense driver** — presents a DualSense HID device so the game
   enables PS5 features and emits trigger/haptic **output reports**. *(The blocker.)*
2. **Server: capture + forward** — read those output reports from the virtual pad,
   extend the feedback protocol to carry adaptive-trigger / haptic payloads to the
   client. *(Moderate; our feedback channel already carries rumble/RGB.)*
3. **Client: apply to the physical DualSense** — write the DualSense HID **output
   reports** (documented protocol) to the real controller. *(Feasible over USB;
   not over Bluetooth — see below.)*

## Current reality of each part (researched 2026-07)

| Part | State | Notes |
|---|---|---|
| Host virtual DS5 | ❌ **doesn't exist** | ViGEmBus is **archived** (2023, trademark). Its API/target types are X360 + DS4 only (`vigem_target_x360_alloc`/`ds4_alloc`) — no DualSense. Tool "DualSense emulation" claims (DS4Windows/DualSenseX) are mapping-to-DS4, not a native DS5 target. |
| Successor **VirtualPad** | ⏳ **in progress, no timeline** | Nefarius's ViGEmBus successor; announced, but no concrete 2026 status/DS5 support confirmed. The "wait and adopt" candidate. |
| Server forward | 🟡 moderate | Feedback channel already carries rumble + RGB LED; adding adaptive-trigger/haptic message types is an extension, not new infra. |
| Client apply | 🟡 feasible over USB | Adaptive triggers = DualSense HID output reports (protocol documented: nondebug/dualsense, DualSense-Windows, HIDAPI). On Android: doable via `android.hardware.usb` (UsbManager, raw HID) **over USB**. **Bluetooth HID output from an app is not exposed** → BT DualSense can't be driven this way. |

## The two hard blockers

1. **Kernel driver + signing (host).** A virtual DualSense is a kernel-mode driver.
   Production distribution needs an **EV code-signing cert + Microsoft attestation
   signing** (or WHQL), and Secure Boot / driver-signature enforcement apply. This
   is the same class of work Punktfunk did with its "custom signed driver"
   ([[punktfunk-prospect]]). It is the dominant cost and risk.
2. **Android USB-only (client).** Applying adaptive triggers needs raw HID output
   to the controller — available over **USB** (UsbManager) but **not Bluetooth** on
   Android. So the feature would be **USB-DualSense-only** on the client. Wireless
   players get PS5 prompts (from the host driver) but **no adaptive triggers**.

## Options for the host driver (the deciding choice)

| Option | Effort | Risk | When |
|---|---|---|---|
| **A. Adopt VirtualPad when it ships DS5** | Low (localized backend swap — our seam is clean, just reimplement `vigem_t`) | Low, but **timeline unknown / may never** | Primary. Monitor the project. |
| **B. Fork/extend a DS5 virtual-bus driver** | **Very high** (kernel dev + EV signing + WHQL + maintenance) | High | Only if adaptive triggers become must-have and VirtualPad stalls |
| **C. Client-side heuristic "fake" triggers** | — | — | ❌ Dead end — game never sends trigger data to a DS4 |

## Recommendation

**Lowest-regret path:**
1. **Monitor VirtualPad** as the host-driver vehicle. When (if) it exposes a
   DualSense target, Phase 2a is a localized swap behind the already-clean
   `platform/windows/input.cpp` seam — no rearchitecting.
2. **Keep the seam clean** (already true; don't add a speculative interface now).
3. **Optional de-risking spike, independently testable & reusable:** prototype the
   **client USB-HID leg** — write a DualSense adaptive-trigger output report to a
   USB-connected DualSense from Android (UsbManager + the documented protocol) and
   confirm the triggers physically respond. This validates part 3 without any host
   driver, is reusable whenever the host side lands, and is the only part we can
   prove today. Small, self-contained, no kernel/signing exposure.
4. **Do NOT** start a bespoke kernel driver (Option B) unless VirtualPad is
   confirmed dead AND adaptive triggers are a committed product goal — the
   signing/maintenance cost is disproportionate for a family streaming setup.

## Honest go / no-go

- **PS5 button prompts alone** ride entirely on the host driver (a → game shows PS5
  icons). No client work. Blocked on VirtualPad/driver.
- **Adaptive triggers** need all three parts **and** are USB-only on the client.
- Net: Phase 2 is **gated on an external dependency (VirtualPad)** or a
  disproportionate kernel project. The pragmatic stance is **watch + one small
  client spike**, not a build commitment now.

## Sources
- ViGEmBus (archived): https://github.com/nefarius/ViGEmBus
- DualSense HID protocol: https://github.com/nondebug/dualsense
- DualSense-Windows (HID output reference): https://github.com/Ohjurot/DualSense-Windows
