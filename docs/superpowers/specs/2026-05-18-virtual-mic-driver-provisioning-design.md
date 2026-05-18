# Virtual Mic Driver Auto-Provisioning (Windows)

**Status:** Approved  
**Date:** 2026-05-18  
**Platform:** Windows only  
**Depends on:** `2026-05-13-client-microphone-design.md`

---

## 1. Problem

`virtual_mic.cpp` writes audio to a WASAPI render endpoint found by friendly name. A render
endpoint exposed via WASAPI loopback is **not** enumerated as a capture device — apps such as
Discord and game voice chat enumerate `eCapture` endpoints and cannot see it. A dedicated virtual
audio driver that exposes both a render sink and a capture source is required for the feature
to work end-to-end.

Without this driver, `virtual_mic.cpp` falls back to the system default speakers; all client mic
audio leaks into the host speaker output.

---

## 2. Approach

Bundle and silently install **VB-Audio CABLE** (free, widely deployed, Microsoft-signed driver).
Post-install, rename the device endpoints in the Windows MMDevice registry to the Jujo brand so
every application on the host (Discord, OBS, games) sees `"Jujo Stream Mic"` as the input device,
never `"CABLE Output"`.

| Endpoint role | Driver default name | After rename |
|---|---|---|
| Render sink (we write here) | `CABLE Input` | `Jujo Stream Mic In` |
| Capture source (apps read here) | `CABLE Output` | `Jujo Stream Mic` |

---

## 3. Bundled Artifacts

**Directory:** `src_assets/windows/drivers/vbcable/`

| File | Purpose |
|---|---|
| `VBCABLE_Setup_x64.exe` | Official VB-Audio CABLE installer (64-bit) |
| `install.ps1` | Install / uninstall / rename script (authored here) |

VB-Audio CABLE is free for personal and commercial use; redistribution in installers is permitted
with attribution. Attribution is recorded in `packaging/windows/wix/custom_actions.wxs` via a
registry key written at install time (see Section 5).

---

## 4. Install Script (`install.ps1`)

Mirrors the `sudovda/install.ps1` pattern exactly.

### 4.1 Parameters

```powershell
param([switch]$Uninstall)
```

### 4.2 Constants

```powershell
$tag         = '[VBCable]'
$setupExe    = Join-Path $scriptDir 'VBCABLE_Setup_x64.exe'
$regSentinel = 'HKLM:\SOFTWARE\VB-Audio\Cable'          # written by their installer
$renderName  = 'CABLE Input'
$captureName = 'CABLE Output'
$newRenderName  = 'Jujo Stream Mic In'
$newCaptureName = 'Jujo Stream Mic'
$mmDevBase   = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio'
```

### 4.3 Install flow

```
1. Assert-RequiredInstallArtifacts  →  check $setupExe present + non-zero
2. Test-VBCableInstalled            →  Test-Path $regSentinel
   └─ already installed → go to step 4 (rename only; idempotent)
3. Invoke-Process $setupExe '-sint' →  silent install (VB-Audio documented flag)
   └─ exit 0 → OK
   └─ non-zero → throw "$tag installer failed with exit code $n"
4. Rename-MMEndpoint Render  $renderName  $newRenderName
5. Rename-MMEndpoint Capture $captureName $newCaptureName
6. Write-Host "$tag Install complete. Reboot may be required for all apps to see new device names."
```

### 4.4 Rename mechanism

Windows allows overriding an audio endpoint's display name via a REG_BINARY PROPVARIANT stored in
the MMDevice registry. This is the same value written by the Windows Sound Control Panel rename
UI. It is stable, well-documented, and survives driver updates (VB-Audio preserves endpoint GUIDs
across upgrades).

```powershell
function Rename-MMEndpoint {
    param(
        [ValidateSet('Render','Capture')][string]$Flow,
        [string]$OldName,
        [string]$NewName
    )

    $basePath = "$mmDevBase\$Flow"
    # PKEY_Device_FriendlyName = {a45c254e-df1c-4efd-8020-67d146a850e0},2
    $driverNameKey = '{a45c254e-df1c-4efd-8020-67d146a850e0},2'
    # User override key = {b3f8fa53-0004-438e-9003-51a46e139bfc},6
    $overrideKey   = '{b3f8fa53-0004-438e-9003-51a46e139bfc},6'

    foreach ($key in Get-ChildItem $basePath -ErrorAction SilentlyContinue) {
        $propsPath = Join-Path $key.PSPath 'Properties'
        try {
            $raw = (Get-ItemProperty $propsPath -ErrorAction Stop).$driverNameKey
            if ($null -eq $raw -or $raw.Length -lt 4) { continue }
            # PROPVARIANT layout: 4-byte type header (VT_LPWSTR = 0x1f00), then UTF-16LE string
            $name = [System.Text.Encoding]::Unicode.GetString($raw[4..($raw.Length - 1)]).TrimEnd([char]0)
            if ($name -ne $OldName) { continue }

            $newBytes  = [System.Text.Encoding]::Unicode.GetBytes($NewName + [char]0)
            $propBytes = [byte[]](0x1f, 0x00, 0x00, 0x00) + $newBytes
            Set-ItemProperty -Path $propsPath -Name $overrideKey -Value $propBytes -Type Binary -ErrorAction Stop
            Write-Host "$tag Renamed $Flow endpoint: '$OldName' -> '$NewName'"
            return
        } catch { continue }
    }
    Write-Warning "$tag $Flow endpoint '$OldName' not found; rename skipped."
}
```

> **Reboot note:** The Windows Audio service caches endpoint names. Newly opened apps after the
> rename will see the new name. Apps already running see the old name until restarted. A full
> reboot is not required by the installer; the MSI already sets `REBOOT=ReallySuppress`.

### 4.5 Uninstall flow

```
1. Read UninstallString from HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VB-Audio Virtual Cable
   └─ not found → Write-Warning; exit 0 (already absent)
2. Invoke-Process $uninstallExe '-sunst'   (VB-Audio documented silent-uninstall flag)
3. Write-Host "$tag Uninstall complete."
```

No registry rename cleanup is needed — the endpoint entries are removed with the driver.

---

## 5. WiX Custom Actions

File: `packaging/windows/wix/custom_actions.wxs`

### 5.1 Registry: attribution + presence sentinel

```xml
<Fragment>
  <DirectoryRef Id="INSTALL_ROOT">
    <Component Id="VBCableRegistryDefaults" Guid="*" Win64="yes">
      <Condition>INSTALL_CLIENT_MIC_DRIVER = "1"</Condition>
      <RegistryKey Root="HKLM" Key="SOFTWARE\Jujo.Stream\VBCable">
        <RegistryValue Id="RegVBCableAttribution"
                       Name="Attribution"
                       Type="string"
                       Value="VB-Audio Virtual Cable by VB-Audio Software (vb-audio.com)"
                       KeyPath="yes"/>
      </RegistryKey>
    </Component>
  </DirectoryRef>
</Fragment>
```

### 5.2 Deferred action declarations

```xml
<CustomAction Id="InstallVbCable"   BinaryKey="WixCA" DllEntry="WixQuietExec" Execute="deferred" Return="ignore" Impersonate="no" />
<CustomAction Id="UninstallVbCable" BinaryKey="WixCA" DllEntry="WixQuietExec" Execute="deferred" Return="ignore" Impersonate="no" />
```

### 5.3 Immediate property setters

```xml
<CustomAction Id="SetInstallVbCable"
    Property="InstallVbCable"
    Value="&quot;[SystemFolder]WindowsPowerShell\v1.0\powershell.exe&quot; -NoLogo -NonInteractive -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File &quot;[INSTALL_ROOT]drivers\vbcable\install.ps1&quot;"/>

<CustomAction Id="SetUninstallVbCable"
    Property="UninstallVbCable"
    Value="&quot;[SystemFolder]WindowsPowerShell\v1.0\powershell.exe&quot; -NoLogo -NonInteractive -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File &quot;[INSTALL_ROOT]drivers\vbcable\install.ps1&quot; -Uninstall"/>
```

### 5.4 InstallSequence placement

Placed immediately after `SetInstallSudovda`/`InstallSudovda` in the install sequence:

```xml
<InstallExecuteSequence>
  <!-- ... existing SudoVDA entries ... -->
  <Custom Action="SetInstallVbCable"   Before="InstallVbCable">INSTALL_CLIENT_MIC_DRIVER = "1" AND NOT Installed</Custom>
  <Custom Action="InstallVbCable"      After="InstallSudovda">INSTALL_CLIENT_MIC_DRIVER = "1" AND NOT Installed</Custom>

  <Custom Action="SetUninstallVbCable" Before="UninstallVbCable">INSTALL_CLIENT_MIC_DRIVER = "1" AND (REMOVE="ALL")</Custom>
  <Custom Action="UninstallVbCable"    After="UninstallSudovda">INSTALL_CLIENT_MIC_DRIVER = "1" AND (REMOVE="ALL")</Custom>
</InstallExecuteSequence>
```

### 5.5 Failure detection (mirrors SudoVDA)

In `JujoInstaller.cs → CollectInstallComponentFailures`:

```csharp
if (installClientMicDriver && CustomActionFailed(lines, "InstallVbCable")) {
    failures.Add("VB-Audio CABLE driver setup failed. Client microphone feature may be unavailable.");
    var detail = ExtractComponentFailureDetail(lines, "[VBCable]");
    if (!string.IsNullOrWhiteSpace(detail))
        failures.Add("VBCable detail: " + detail);
}
```

---

## 6. MSI Property

| Property | Default | Effect |
|---|---|---|
| `INSTALL_CLIENT_MIC_DRIVER` | `1` | `"1"` → run `InstallVbCable`; `"0"` → skip |

Passed from bootstrapper (Section 7) via:

```csharp
"INSTALL_CLIENT_MIC_DRIVER=" + (installClientMicDriver ? "1" : "0"),
```

CLI override (mirrors `INSTALL_SUDOVDA=0` pattern):

```
Jujo.Stream ServerSetup.exe /qn INSTALL_CLIENT_MIC_DRIVER=0
```

---

## 7. Bootstrapper UI

File: `packaging/windows/bootstrapper/JujoInstaller.cs`

### 7.1 Field

```csharp
private readonly CheckBox _installClientMicCheckBox;
```

### 7.2 Checkbox definition (always visible, always rendered, default on)

Placed immediately after the `_installVirtualDisplayCheckBox` block:

```csharp
_installClientMicCheckBox = new CheckBox {
    Content  = "Install virtual microphone driver (VB-Audio CABLE)",
    FontSize = 13,
    Foreground = new SolidColorBrush(Color.FromRgb(226, 235, 250)),
    Margin   = new Thickness(0, 12, 0, 4),
    IsChecked = true,
    ToolTip  = "Required for the Client Microphone feature. Installs as 'Jujo Stream Mic'."
};
installStack.Children.Add(_installClientMicCheckBox);

installStack.Children.Add(new TextBlock {
    Text = "Disable only if you have already installed VB-Audio CABLE or do not need client microphone support.",
    FontSize = 12,
    Foreground = new SolidColorBrush(Color.FromRgb(190, 208, 236)),
    Margin      = new Thickness(24, 0, 0, 0),
    TextWrapping = TextWrapping.Wrap
});
```

### 7.3 Enable/disable (mirrors virtual display checkbox)

At every location that sets `_installVirtualDisplayCheckBox.IsEnabled`, add:

```csharp
_installClientMicCheckBox.IsEnabled = <same expression>;
```

### 7.4 Read value and pass to install

In the method that reads checkbox states before calling `RunInstall`:

```csharp
var installClientMicDriver = _installClientMicCheckBox.IsChecked == true;
```

Pass `installClientMicDriver` through the same call chain as `installVirtualDisplayDriver` down
to `BuildMsiArguments`, appending `"INSTALL_CLIENT_MIC_DRIVER=" + (installClientMicDriver ? "1" : "0")`.

### 7.5 Uninstall dialog

In the uninstall confirmation dialog (mirrors `removeDriverCheckBox` for SudoVDA):

```csharp
var removeClientMicDriverCheckBox = new CheckBox {
    Content   = "Remove virtual microphone driver (VB-Audio CABLE)",
    IsChecked = false,   // default: keep (non-destructive)
    Margin    = new Thickness(0, 4, 0, 0)
};
content.Children.Add(removeClientMicDriverCheckBox);
```

Pass result into `UninstallOptions.RemoveClientMicDriver` and gate `UninstallVbCable` accordingly.

---

## 8. Runtime Changes

### 8.1 `virtual_mic.cpp` — target device name

The render endpoint that `virtual_mic_t` writes to changes from the placeholder
`"jujo-client-mic"` to `"Jujo Stream Mic In"` (the rebranded CABLE Input).

This name is passed in from `webrtc_stream.cpp` (the call site at line 4570), not hardcoded in
the platform layer. Update the call site:

```cpp
// webrtc_stream.cpp ~line 4570  (was "jujo-client-mic")
g_virtual_mic = audio_p->virtual_microphone("Jujo Stream Mic In", channels, sample_rate, frame_size);
```

### 8.2 Config: `client_mic_device_name`

Add a configurable override so users who already have VB-Audio CABLE or another virtual cable
driver can specify their own device name without reinstalling.

**`src/config.h`** — add to `audio_t`:

```cpp
std::string client_mic_device_name = "Jujo Stream Mic In";  // render endpoint to write client mic audio into
```

**`src/config.cpp`** — parse alongside `enable_client_mic`:

```cpp
string_f(vars, "client_mic_device_name", audio.client_mic_device_name);
```

**`webrtc_stream.cpp`** — use config value:

```cpp
g_virtual_mic = audio_p->virtual_microphone(
    config::audio.client_mic_device_name, channels, sample_rate, frame_size);
```

---

## 9. Error Handling

| Scenario | Behavior |
|---|---|
| VB-Audio CABLE install fails (installer non-zero) | Script throws; WiX `Return="ignore"` logs failure; bootstrapper reports "Client microphone feature may be unavailable" in post-install summary. Session continues. |
| `Rename-MMEndpoint` cannot find CABLE Input/Output | `Write-Warning`; install continues; device appears as default CABLE names; functional but unbranded. |
| User unchecks checkbox, later enables `enable_client_mic` | `virtual_mic.cpp` falls back to default render device (existing fallback path); logs warning. |
| User already has VB-Audio CABLE installed | `Test-VBCableInstalled` returns true; installer skips setup, runs rename only. |
| Uninstall: user unchecks "Remove VB-Audio CABLE" | Driver left in place; user retains their existing virtual cable setup. |

---

## 10. Files Summary

### New files

| File | Purpose |
|---|---|
| `src_assets/windows/drivers/vbcable/VBCABLE_Setup_x64.exe` | VB-Audio CABLE installer binary |
| `src_assets/windows/drivers/vbcable/install.ps1` | Install / rename / uninstall script |

### Modified files

| File | Change |
|---|---|
| `packaging/windows/wix/custom_actions.wxs` | Add `InstallVbCable` / `UninstallVbCable` actions + `VBCableRegistryDefaults` component + sequence entries |
| `packaging/windows/bootstrapper/JujoInstaller.cs` | Add `_installClientMicCheckBox`; pass `INSTALL_CLIENT_MIC_DRIVER`; failure detection; uninstall dialog checkbox |
| `src/config.h` | Add `client_mic_device_name` to `audio_t` |
| `src/config.cpp` | Parse `client_mic_device_name` via `string_f` |
| `src/webrtc_stream.cpp` | Change device name arg from `"jujo-client-mic"` to `config::audio.client_mic_device_name` |

### WiX component/MSI packaging

The `drivers\vbcable\` directory must be included as a WiX `<Component>` referencing both files
under `INSTALL_ROOT`, mirroring the existing `drivers\sudovda\` component definition.

---

## 11. Implementation Order

1. `install.ps1` — write and test in isolation against a real Windows machine
2. WiX `custom_actions.wxs` — add actions + component + registry attribution
3. WiX product/component file — add `drivers\vbcable\` directory + file components
4. Bootstrapper — checkbox, property passing, failure detection, uninstall dialog
5. `config.h` / `config.cpp` — `client_mic_device_name` field
6. `webrtc_stream.cpp` — update call site device name
7. Manual test: fresh install → verify "Jujo Stream Mic" appears in Windows Sound → Recording
