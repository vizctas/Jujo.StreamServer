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
    $missing = @()

    if (-not (Test-Path -LiteralPath $setupExe -PathType Leaf)) {
        $missing += "VBCABLE_Setup_x64.exe ($setupExe)"
    }
    if (-not (Get-ChildItem -LiteralPath $scriptDir -Filter '*.inf' -File -ErrorAction SilentlyContinue | Select-Object -First 1)) {
        $missing += "*.inf in $scriptDir"
    }
    if (-not (Get-ChildItem -LiteralPath $scriptDir -Filter '*.cat' -File -ErrorAction SilentlyContinue | Select-Object -First 1)) {
        $missing += "*.cat in $scriptDir"
    }
    if (-not (Get-ChildItem -LiteralPath $scriptDir -Filter '*.sys' -File -ErrorAction SilentlyContinue | Select-Object -First 1)) {
        $missing += "*.sys in $scriptDir"
    }

    if ($missing.Count -gt 0) {
        throw "$tag Required VB-Audio CABLE driver artifacts missing: $($missing -join ', ')"
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
# Install
# ---------------------------------------------------------------------------

if (-not $Uninstall) {
    Assert-RequiredInstallArtifacts

    if (Test-VBCableInstalled) {
        Write-Host "$tag VB-Audio CABLE already installed; skipping setup, applying rename only."
    }
    else {
        Write-Host "$tag Installing VB-Audio CABLE..."

        # Pre-trust the publisher certificate to prevent interactive driver signature prompts
        $catPath = Join-Path $scriptDir 'vbaudio_cable64_win7.cat'
        if (Test-Path -LiteralPath $catPath) {
            try {
                $cert = (Get-AuthenticodeSignature $catPath).SignerCertificate
                if ($null -ne $cert) {
                    $store = Get-Item "cert:\LocalMachine\TrustedPublisher"
                    $store.Open("ReadWrite")
                    $store.Add($cert)
                    $store.Close()
                    Write-Host "$tag Pre-trusted driver publisher (CN=Vincent Burel)."
                }
            } catch {
                Write-Warning "$tag Failed to pre-trust certificate: $_"
            }
        }

        Write-Host "$tag Running VB-Audio CABLE installer silently..."
        $proc = Start-Process -FilePath $setupExe `
                              -ArgumentList '-sint' `
                              -WorkingDirectory $scriptDir `
                              -WindowStyle Hidden `
                              -Wait `
                              -PassThru

        Write-Host "$tag Installer process exited with code: $($proc.ExitCode)"

        # Check if setup completed (we can check registry sentinel to verify installation)
        if (Test-VBCableInstalled) {
            Write-Host "$tag VB-Audio CABLE installed successfully."
        } else {
            throw "$tag VB-Audio CABLE installation was not completed or was cancelled (exit code: $($proc.ExitCode))."
        }
    }

    # Helper function to get the decoded name from registry value (binary or string)
    function Get-DecodedName {
        param($val)
        if ($null -eq $val) { return $null }
        if ($val -is [string]) { return $val }
        if ($val -is [byte[]]) {
            if ($val.Length -gt 4) {
                return [System.Text.Encoding]::Unicode.GetString($val[4..($val.Length - 1)]).TrimEnd([char]0)
            }
        }
        return $null
    }

    # Helper function to set the override name in registry with matching type
    function Set-OverrideName {
        param($path, $key, $value, $kind)
        if ($kind -eq 'String') {
            Set-ItemProperty -Path $path -Name $key -Value $value -Type String -ErrorAction Stop
        } else {
            $newBytes  = [System.Text.Encoding]::Unicode.GetBytes($value + [char]0)
            $propBytes = [byte[]](0x1f, 0x00, 0x00, 0x00) + $newBytes
            Set-ItemProperty -Path $path -Name $key -Value $propBytes -Type Binary -ErrorAction Stop
        }
    }

    # Rename Render endpoint inline
    $basePath = "$mmDevBase\Render"
    foreach ($key in (Get-ChildItem $basePath -ErrorAction SilentlyContinue)) {
        $propsPath = Join-Path $key.PSPath 'Properties'
        try {
            $regKey = Get-Item -LiteralPath $propsPath -ErrorAction Stop
            $raw    = $regKey.GetValue($driverNameKey)
            $name   = Get-DecodedName $raw
            if ($name -eq $defaultRenderName) {
                $kind = $regKey.GetValueKind($driverNameKey)
                Set-OverrideName -path $propsPath -key $overrideKey -value $brandedRenderName -kind $kind
                Write-Host "$tag Renamed Render endpoint: '$defaultRenderName' -> '$brandedRenderName'"
            }
        } catch {
            Write-Warning "$tag Failed to rename Render endpoint $($key.PSChildName): $_"
        }
    }

    # Rename Capture endpoint inline
    $basePath = "$mmDevBase\Capture"
    foreach ($key in (Get-ChildItem $basePath -ErrorAction SilentlyContinue)) {
        $propsPath = Join-Path $key.PSPath 'Properties'
        try {
            $regKey = Get-Item -LiteralPath $propsPath -ErrorAction Stop
            $raw    = $regKey.GetValue($driverNameKey)
            $name   = Get-DecodedName $raw
            if ($name -eq $defaultCaptureName) {
                $kind = $regKey.GetValueKind($driverNameKey)
                Set-OverrideName -path $propsPath -key $overrideKey -value $brandedCaptureName -kind $kind
                Write-Host "$tag Renamed Capture endpoint: '$defaultCaptureName' -> '$brandedCaptureName'"
            }
        } catch {
            Write-Warning "$tag Failed to rename Capture endpoint $($key.PSChildName): $_"
        }
    }

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
    if (Test-Path -LiteralPath $setupExe -PathType Leaf) {
        Write-Host "$tag Running VB-Audio CABLE uninstaller silently..."
        $proc = Start-Process -FilePath $setupExe `
                              -ArgumentList '-sunst' `
                              -WorkingDirectory $scriptDir `
                              -WindowStyle Hidden `
                              -Wait `
                              -PassThru
    }
    else {
        Write-Warning "$tag Uninstall binary not found; skipping."
    }
}
else {
    # Parse the uninstall string; it may be quoted
    $rawCmd = $uninstallEntry.UninstallString.Trim()

    # Extract exe path
    if ($rawCmd -match '^"([^"]+)"') {
        $uninstallExe  = $matches[1]
    }
    else {
        $parts         = $rawCmd -split ' ', 2
        $uninstallExe  = $parts[0]
    }

    if (-not (Test-Path -LiteralPath $uninstallExe -PathType Leaf)) {
        Write-Warning "$tag Uninstall binary not found at '$uninstallExe'; skipping."
    }
    else {
        Write-Host "$tag Running VB-Audio CABLE uninstaller silently..."
        $proc = Start-Process -FilePath $uninstallExe `
                              -ArgumentList '-sunst' `
                              -WorkingDirectory (Split-Path -Parent $uninstallExe) `
                              -WindowStyle Hidden `
                              -Wait `
                              -PassThru
    }
}

Write-Host "$tag Uninstall complete."
if ($script:rebootRequired) {
    Write-Host "$tag A reboot is required to finalize driver removal."
}

$global:LastExitCode = 0
exit 0
