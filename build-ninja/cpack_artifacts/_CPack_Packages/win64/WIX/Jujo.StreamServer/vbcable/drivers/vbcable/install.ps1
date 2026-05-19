param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$scriptDir  = Split-Path -Parent $PSCommandPath
$tag        = '[VBCable]'
$setupExe   = Join-Path $scriptDir 'VBCABLE_Setup_x64.exe'

# VB-Audio CABLE registry sentinel written by their installer
$regSentinel = 'HKLM:\SOFTWARE\VB-Audio\Cable'

# Windows MMDevice registry base path
$mmDevBase = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio'

# VB-Audio CABLE default endpoint names (set by their driver INF)
$defaultRenderName  = 'CABLE Input'
$defaultCaptureName = 'CABLE Output'

# Jujo-branded names visible to the user and to host applications
$brandedRenderName  = 'Jujo Stream Mic In'
$brandedCaptureName = 'Jujo Stream Mic'

# PROPVARIANT property keys used in the MMDevice registry
# PKEY_Device_FriendlyName  : {a45c254e-df1c-4efd-8020-67d146a850e0},2  (driver-set name, read-only)
# User display-name override : {b3f8fa53-0004-438e-9003-51a46e139bfc},6  (same as Sound CP rename)
$driverNameKey = '{a45c254e-df1c-4efd-8020-67d146a850e0},2'
$overrideKey   = '{b3f8fa53-0004-438e-9003-51a46e139bfc},6'

$script:rebootRequired = $false

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Invoke-Process {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string[]]$ArgumentList = @(),
        [string]$WorkingDirectory = $scriptDir
    )

    $stdoutPath = [System.IO.Path]::GetTempFileName()
    $stderrPath = [System.IO.Path]::GetTempFileName()

    try {
        $process = Start-Process -FilePath $FilePath `
                                 -ArgumentList $ArgumentList `
                                 -WorkingDirectory $WorkingDirectory `
                                 -WindowStyle Hidden `
                                 -Wait `
                                 -PassThru `
                                 -RedirectStandardOutput $stdoutPath `
                                 -RedirectStandardError  $stderrPath

        $stdout = ''
        $stderr = ''

        if (Test-Path -LiteralPath $stdoutPath) {
            $stdout = Get-Content -Path $stdoutPath -Raw -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $stderrPath) {
            $stderr = Get-Content -Path $stderrPath -Raw -ErrorAction SilentlyContinue
        }

        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StdOut   = $stdout
            StdErr   = $stderr
        }
    }
    finally {
        Remove-Item -LiteralPath $stdoutPath, $stderrPath -ErrorAction SilentlyContinue
    }
}

function Assert-RequiredInstallArtifacts {
    if (-not (Test-Path -LiteralPath $setupExe -PathType Leaf)) {
        throw "$tag Required installer artifact missing: VBCABLE_Setup_x64.exe ($setupExe)"
    }

    $item = Get-Item -LiteralPath $setupExe -ErrorAction Stop
    if ($item.Length -le 0) {
        throw "$tag Required installer artifact is empty (0 bytes): VBCABLE_Setup_x64.exe ($setupExe)"
    }
}

function Test-VBCableInstalled {
    return Test-Path -Path $regSentinel
}

# ---------------------------------------------------------------------------
# Rename an audio endpoint's display name via the MMDevice registry.
#
# Windows stores a user-facing name override at:
#   HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\{Flow}\{GUID}\Properties
#   key: {b3f8fa53-0004-438e-9003-51a46e139bfc},6
#
# The value is a REG_BINARY PROPVARIANT:
#   bytes 0-3  : VT_LPWSTR type code (0x1f, 0x00, 0x00, 0x00)
#   bytes 4..  : null-terminated UTF-16LE string
#
# This is the same value written by the Windows Sound Control Panel rename UI.
# The rename is picked up by newly launched applications immediately; running
# apps may need to be restarted. A full system reboot is not required.
# ---------------------------------------------------------------------------
function Rename-MMEndpoint {
    param(
        [ValidateSet('Render', 'Capture')][string]$Flow,
        [Parameter(Mandatory = $true)][string]$OldName,
        [Parameter(Mandatory = $true)][string]$NewName
    )

    $basePath = "$mmDevBase\$Flow"

    foreach ($key in (Get-ChildItem $basePath -ErrorAction SilentlyContinue)) {
        $propsPath = Join-Path $key.PSPath 'Properties'
        try {
            $props = Get-ItemProperty $propsPath -ErrorAction Stop
            $raw   = $props.$driverNameKey

            if ($null -eq $raw -or $raw.Length -lt 5) { continue }

            # PROPVARIANT: skip 4-byte type header, read UTF-16LE name
            $name = [System.Text.Encoding]::Unicode.GetString($raw[4..($raw.Length - 1)]).TrimEnd([char]0)

            if ($name -ne $OldName) { continue }

            $newBytes  = [System.Text.Encoding]::Unicode.GetBytes($NewName + [char]0)
            $propBytes = [byte[]](0x1f, 0x00, 0x00, 0x00) + $newBytes
            Set-ItemProperty -Path $propsPath -Name $overrideKey -Value $propBytes -Type Binary -ErrorAction Stop

            Write-Host "$tag Renamed $Flow endpoint: '$OldName' -> '$NewName'"
            return
        }
        catch { continue }
    }

    Write-Warning "$tag $Flow endpoint '$OldName' not found — rename skipped."
}

# ---------------------------------------------------------------------------
# Install
# ---------------------------------------------------------------------------

if (-not $Uninstall) {
    Assert-RequiredInstallArtifacts

    if (Test-VBCableInstalled) {
        Write-Host "$tag VB-Audio CABLE already installed; skipping setup, applying rename only."
    }
    else {
        Write-Host "$tag Installing VB-Audio CABLE..."

        # -sint = documented VB-Audio silent-install flag (elevated context required)
        $result = Invoke-Process -FilePath $setupExe -ArgumentList @('-sint')

        if ($result.StdOut) { Write-Host $result.StdOut.TrimEnd() }
        if ($result.StdErr) { Write-Host $result.StdErr.TrimEnd() }

        switch ($result.ExitCode) {
            0    { Write-Host "$tag VB-Audio CABLE installed successfully." }
            3010 { Write-Host "$tag VB-Audio CABLE installed; reboot required."; $script:rebootRequired = $true }
            default {
                throw "$tag VBCABLE_Setup_x64.exe failed with exit code $($result.ExitCode)."
            }
        }
    }

    # Rename endpoints to Jujo brand regardless of whether we just installed or
    # it was already present — ensures the names are correct after any VB-Audio
    # update that might reset them.
    Rename-MMEndpoint -Flow Render  -OldName $defaultRenderName  -NewName $brandedRenderName
    Rename-MMEndpoint -Flow Capture -OldName $defaultCaptureName -NewName $brandedCaptureName

    Write-Host "$tag Install complete."
    Write-Host "$tag Attribution: VB-Audio Virtual Cable by VB-Audio Software (vb-audio.com)"

    if ($script:rebootRequired) {
        Write-Host "$tag A reboot is required to finalize driver installation."
    }

    $global:LastExitCode = 0
    exit 0
}

# ---------------------------------------------------------------------------
# Uninstall
# ---------------------------------------------------------------------------

if (-not (Test-VBCableInstalled)) {
    Write-Host "$tag VB-Audio CABLE not installed; nothing to remove."
    $global:LastExitCode = 0
    exit 0
}

# Locate the uninstall command registered by VB-Audio's own installer
$uninstallRegPath = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VB-Audio Virtual Cable'
$uninstallEntry   = Get-ItemProperty $uninstallRegPath -ErrorAction SilentlyContinue

if ($null -eq $uninstallEntry -or [string]::IsNullOrWhiteSpace($uninstallEntry.UninstallString)) {
    Write-Warning "$tag Uninstall registry entry not found; attempting silent uninstall via setup binary."

    if (Test-Path -LiteralPath $setupExe -PathType Leaf) {
        $result = Invoke-Process -FilePath $setupExe -ArgumentList @('-sunst')
        if ($result.StdOut) { Write-Host $result.StdOut.TrimEnd() }
        if ($result.StdErr) { Write-Host $result.StdErr.TrimEnd() }
        switch ($result.ExitCode) {
            0    { }
            3010 { $script:rebootRequired = $true }
            default {
                Write-Warning "$tag Uninstall exited with code $($result.ExitCode)."
            }
        }
    }
    else {
        Write-Warning "$tag Uninstall binary not found; skipping."
    }
}
else {
    # Parse the uninstall string; it may be quoted
    $rawCmd = $uninstallEntry.UninstallString.Trim()

    # Extract exe path and args
    if ($rawCmd -match '^"([^"]+)"(.*)$') {
        $uninstallExe  = $matches[1]
        $uninstallArgs = $matches[2].Trim() + ' -sunst'
    }
    else {
        $parts         = $rawCmd -split ' ', 2
        $uninstallExe  = $parts[0]
        $uninstallArgs = if ($parts.Count -gt 1) { $parts[1] + ' -sunst' } else { '-sunst' }
    }

    if (-not (Test-Path -LiteralPath $uninstallExe -PathType Leaf)) {
        Write-Warning "$tag Uninstall binary not found at '$uninstallExe'; skipping."
    }
    else {
        Write-Host "$tag Running VB-Audio CABLE uninstaller..."
        $result = Invoke-Process -FilePath $uninstallExe -ArgumentList ($uninstallArgs -split ' ')
        if ($result.StdOut) { Write-Host $result.StdOut.TrimEnd() }
        if ($result.StdErr) { Write-Host $result.StdErr.TrimEnd() }
        switch ($result.ExitCode) {
            0    { Write-Host "$tag VB-Audio CABLE uninstalled." }
            3010 { Write-Host "$tag Uninstalled; reboot required."; $script:rebootRequired = $true }
            default {
                Write-Warning "$tag Uninstaller exited with code $($result.ExitCode)."
            }
        }
    }
}

Write-Host "$tag Uninstall complete."
if ($script:rebootRequired) {
    Write-Host "$tag A reboot is required to finalize driver removal."
}

$global:LastExitCode = 0
exit 0
