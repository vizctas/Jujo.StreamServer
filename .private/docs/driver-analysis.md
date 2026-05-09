# Display Adapter & Driver Analysis

## What the Deploy Script Currently Installs

The `ServerDeployService.deploy()` in `server_deploy_service.dart` performs:
1. `robocopy /MIR` from build dir → `C:\Program Files\Jujo.Stream Server`
2. Registers `Jujo.Server` Windows Service via `sc.exe create`
3. Starts the service

**It does NOT explicitly install any drivers.** The deploy is a file copy + service registration only.

---

## Drivers the Server NEEDS at Runtime

### 1. SudoVDA (Virtual Display Adapter) — **CRITICAL**

- **What**: SudoMaker Virtual Display Adapter (`root\sudomaker\sudovda`)
- **Purpose**: Creates virtual monitors for headless streaming, per-client displays, and display isolation
- **Location in build**: `<install_dir>/drivers/sudovda/install.ps1`
- **Auto-recovery**: The server has `try_reinstall_sudovda_driver()` which runs `install.ps1` if the device node is missing
- **Status check**: `VDISPLAY::isSudaVDADriverInstalled()` + `ensure_driver_is_ready()`
- **Health endpoint**: Exposed via readiness checks (`virtualDisplay` check in `/api/setup/status`)

**[FORENSIC ALERT]** The deploy script does NOT run `drivers/sudovda/install.ps1`. The server relies on auto-recovery at runtime, which:
- Only triggers when a virtual display is actually requested
- Requires the installer script to exist in the install directory (it does, via robocopy)
- May fail silently if UAC blocks the elevated install

### 2. ViGEm (Virtual Gamepad Emulation Bus) — **IMPORTANT**

- **What**: ViGEmBus driver for virtual Xbox/DS4/DS5 controllers
- **Purpose**: Emulates gamepads for streaming clients
- **Check**: `platf::is_vigem_installed()` in `src/platform/windows/misc.h`
- **Health endpoint**: `/api/health/vigem`
- **System tray warning**: `update_tray_vigem_missing()` notifies user if missing

**[FORENSIC ALERT]** ViGEm is NOT bundled or installed by the deploy. User must install it separately. The server only checks if it's present.

### 3. Steam Audio Drivers — **OPTIONAL**

- **What**: Virtual audio sink drivers from Steam
- **Purpose**: Mutes host audio while streaming to client
- **Config**: `install_steam_audio_drivers` (default: enabled)
- **Install method**: Uses `DiInstallDriverW` from `newdev.dll` at runtime
- **Fallback**: If Steam isn't installed, logs info and continues

### 4. NVIDIA/AMD/Intel GPU Drivers — **PREREQUISITE**

- **What**: Standard GPU drivers with encoder support (NVENC/AMF/QSV)
- **Purpose**: Hardware video encoding
- **Check**: Encoder probing at startup (`video::allow_encoder_probing()`)
- **Not installed by server** — user responsibility

---

## Gaps & Recommendations

| Gap | Risk | Recommendation |
|-----|------|----------------|
| SudoVDA not pre-installed during deploy | Virtual display fails on first use; user sees "driver unavailable" | Add `install.ps1` execution to deploy script |
| ViGEm not bundled | Gamepad input unavailable until user manually installs | Bundle ViGEmBus installer or add setup step |
| No driver health check in Flutter app | User has no visibility into driver status | Wire `/api/health/vigem` + readiness checks into System screen |
| Auto-recovery requires UAC | Silent install may fail without admin | Deploy script already runs elevated — install drivers there |

---

## Recommended Deploy Script Enhancement

Add after the robocopy step and before service start:

```powershell
# Install SudoVDA virtual display driver
$sudovdaInstaller = "$installDir\drivers\sudovda\install.ps1"
if (Test-Path $sudovdaInstaller) {
    Write-Progress-Step 'Installing virtual display driver (SudoVDA)...'
    & powershell -ExecutionPolicy Bypass -File $sudovdaInstaller
    if ($LASTEXITCODE -ne 0) {
        Write-Progress-Step 'Warning: SudoVDA driver install returned non-zero. Virtual display may not work.'
    }
}

# Check ViGEm availability (inform only — don't auto-install third-party)
$vigemPath = "$env:SystemRoot\System32\drivers\ViGEmBus.sys"
if (-not (Test-Path $vigemPath)) {
    Write-Progress-Step 'Note: ViGEm gamepad driver not found. Controller input will be unavailable.'
}
```
