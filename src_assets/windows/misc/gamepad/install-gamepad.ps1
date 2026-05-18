$ErrorActionPreference = 'Stop'

# Check if a compatible version of ViGEmBus is already installed (1.17 or later)
try {
    $vigemBusPath = "$env:SystemRoot\System32\drivers\ViGEmBus.sys"
    $fileVersion = (Get-Item $vigemBusPath).VersionInfo.FileVersion

    if ($fileVersion -ge [System.Version]"1.17") {
        Write-Host "[ViGEmBus] Installed version $fileVersion is compatible; skipping."
        exit 0
    }
}
catch {
    Write-Host "[ViGEmBus] Driver not found or inaccessible; proceeding with installation."
}

# Install Virtual Gamepad
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$installerPath = Join-Path $scriptPath "vigembus_installer.exe"
if (-not (Test-Path -LiteralPath $installerPath)) {
    throw "[ViGEmBus] Installer payload missing: $installerPath"
}

Write-Host "[ViGEmBus] Running installer: $installerPath"
$process = Start-Process `
    -FilePath $installerPath `
    -ArgumentList "/passive", "/promptrestart" `
    -Wait `
    -PassThru

if ($process.ExitCode -ne 0 -and $process.ExitCode -ne 3010) {
    throw "[ViGEmBus] Installer failed with exit code $($process.ExitCode)."
}

if ($process.ExitCode -eq 3010) {
    Write-Host "[ViGEmBus] Installer completed; reboot required."
    exit 0
}

Write-Host "[ViGEmBus] Installer completed."
