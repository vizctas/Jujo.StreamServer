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

# vigembus_installer.exe is an MSI bootstrapper. Windows Installer serialises all MSI
# sessions, so launching it directly from inside a running MSI custom action returns
# exit code 1618 (ERROR_INSTALL_ALREADY_RUNNING) and the driver never installs.
#
# Fix: register a one-shot scheduled task that fires 15 seconds after this custom
# action exits.  By then the parent MSI session will have committed and released the
# Windows Installer lock, so the nested MSI can proceed normally.
Write-Host "[ViGEmBus] Scheduling installer to run after MSI session closes: $installerPath"

$taskName  = 'Jujo_InstallViGEmBus'
$escapedPath = $installerPath -replace "'", "''"

# The task script: run the installer then remove the task.
$taskScript = @"
`$p = Start-Process -FilePath '$escapedPath' -ArgumentList '/passive','/norestart' -Wait -PassThru
Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false -ErrorAction SilentlyContinue
if (`$p.ExitCode -ne 0 -and `$p.ExitCode -ne 3010) {
    exit `$p.ExitCode
}
"@

$encoded   = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($taskScript))
$action    = New-ScheduledTaskAction `
                 -Execute 'powershell.exe' `
                 -Argument "-NonInteractive -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encoded"
$trigger   = New-ScheduledTaskTrigger -Once -At (Get-Date).AddSeconds(15)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings  = New-ScheduledTaskSettingsSet `
                 -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
                 -DeleteExpiredTaskAfter (New-TimeSpan -Seconds 60)

Register-ScheduledTask `
    -TaskName  $taskName `
    -Action    $action `
    -Trigger   $trigger `
    -Settings  $settings `
    -Principal $principal `
    -Force | Out-Null

Write-Host "[ViGEmBus] Installer scheduled (task: $taskName). It will run ~15 s after this MSI completes."
