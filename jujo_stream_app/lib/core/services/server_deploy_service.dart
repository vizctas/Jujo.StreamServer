import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart' show debugPrint;

/// Categorized reason a deploy failed.
enum DeployErrorKind {
  buildNotFound,
  uacDenied,
  copyFailed,
  serviceError,
  unknown,
}

/// Result of a [ServerDeployService.deploy] call.
class DeployResult {
  const DeployResult({required this.success, this.error, this.errorKind});

  final bool success;
  final String? error;
  final DeployErrorKind? errorKind;

  static const ok = DeployResult(success: true);

  static DeployResult fail(
    String message, {
    DeployErrorKind kind = DeployErrorKind.unknown,
  }) => DeployResult(success: false, error: message, errorKind: kind);
}

/// Deploys the Jujo.Stream server from the local C++ build output directory.
///
/// Copies binaries + assets to the install location, registers the Windows
/// service as Jujo.Server, and starts it.
///
/// Intended for developer workflow — `canDeploy` will be false on machines
/// where the C++ project has not been built.
class ServerDeployService {
  static const _installDir = r'C:\Program Files\Jujo.Stream Server';

  /// Candidate paths for the built server executable, in priority order.
  ///
  /// When running via `flutter run` from `jujo_stream_app/`, the CWD is
  /// `<repo>/jujo_stream_app`, so `../build/sunshine.exe` resolves correctly.
  List<String> get _buildExeCandidates => [
    // Dev: running `flutter run` from jujo_stream_app/ -> CWD.parent = repo root
    '${Directory.current.parent.path}\\build\\sunshine.exe',
    // Absolute fallback for the primary dev machine
    r'C:\Users\Jozh\repos\Jujo.StreamServer\build\sunshine.exe',
  ];

  /// Resolved build exe path, or null if no candidate exists.
  String? get buildExePath {
    for (final p in _buildExeCandidates) {
      if (File(p).existsSync()) return p;
    }
    return null;
  }

  /// True when a built server executable is present and can be deployed.
  bool get canDeploy => buildExePath != null;

  /// Deploy the server from the build output directory.
  ///
  /// Calls [onProgress] with human-readable messages at each stage. Progress is
  /// streamed in real-time by polling a temp file written by the elevated script.
  ///
  /// When [username] and [password] are provided the elevated script calls
  /// `sunshine.exe creds` to write the credentials file **before** starting the
  /// service, so the server boots with credentials already configured.
  Future<DeployResult> deploy({
    void Function(String msg)? onProgress,
    String? username,
    String? password,
    bool cleanInstall = false,
  }) async {
    final exePath = buildExePath;
    if (exePath == null) {
      return DeployResult.fail(
        'Server build files not found. Build the C++ project first.',
        kind: DeployErrorKind.buildNotFound,
      );
    }

    final buildDir = File(exePath).parent.path;
    final ts = DateTime.now().millisecondsSinceEpoch;
    final tmp = Directory.systemTemp.path;
    final deployScript = '$tmp\\jujo_deploy_$ts.ps1';
    final elevatorScript = '$tmp\\jujo_elevate_$ts.ps1';
    final progressFile = '$tmp\\jujo_progress_$ts.txt';

    try {
      onProgress?.call('Preparing deploy scripts\u2026');

      File(deployScript).writeAsStringSync(
        _buildDeployScript(
          buildDir: buildDir,
          installDir: _installDir,
          progressPath: progressFile,
          username: username,
          password: password,
          cleanInstall: cleanInstall,
        ),
      );

      File(elevatorScript).writeAsStringSync(
        "Start-Process -FilePath 'powershell.exe' "
        "-ArgumentList @('-ExecutionPolicy','Bypass','-NonInteractive','-WindowStyle','Hidden','-File','$deployScript') "
        '-Verb RunAs -Wait -WindowStyle Hidden\n',
      );

      onProgress?.call(
        'Requesting administrator privileges \u2014 approve the UAC prompt\u2026',
      );

      // Start the elevator (non-elevated outer process that triggers UAC).
      // -WindowStyle Hidden ensures no visible PowerShell window.
      final process = await Process.start('powershell', [
        '-ExecutionPolicy',
        'Bypass',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-File',
        elevatorScript,
      ]);

      // Poll the progress file while the elevated script runs.
      int lastLineIdx = 0;
      final exitFuture = process.exitCode;

      while (true) {
        final exitCode = await exitFuture.timeout(
          const Duration(milliseconds: 400),
          onTimeout: () => -999,
        );
        lastLineIdx = _pollProgressFile(progressFile, lastLineIdx, onProgress);
        if (exitCode != -999) break;
      }
      // One final read after the process exits (catches last lines).
      _pollProgressFile(progressFile, lastLineIdx, onProgress);

      final exitCode = await exitFuture;
      debugPrint('[deploy] elevator exit=$exitCode');

      // Parse the result from the progress file.
      final pf = File(progressFile);
      if (!pf.existsSync()) {
        return DeployResult.fail(
          'UAC was cancelled or administrator access was denied.',
          kind: DeployErrorKind.uacDenied,
        );
      }

      final lines = pf
          .readAsStringSync()
          .split('\n')
          .map((l) => l.trim())
          .toList();
      // Find the last non-empty non-PROGRESS line -- that's the final result.
      final resultLine = lines.lastWhere(
        (l) => l.isNotEmpty && !l.startsWith('PROGRESS:'),
        orElse: () => '',
      );

      if (resultLine == 'OK') {
        onProgress?.call('Server deployed successfully.');
        return DeployResult.ok;
      }

      // Parse error kind from the result line or from the error content.
      final errorText = resultLine.startsWith('FAIL:')
          ? resultLine.substring(5).trim()
          : (resultLine.isEmpty ? 'Unknown error' : resultLine);

      return DeployResult.fail(errorText, kind: _classifyError(errorText));
    } catch (e) {
      return DeployResult.fail('Deploy error: $e');
    } finally {
      for (final p in [deployScript, elevatorScript, progressFile]) {
        try {
          File(p).deleteSync();
        } catch (_) {}
      }
    }
  }

  /// Read new PROGRESS: lines from [path] starting at [lastIdx].
  /// Emits each message via [onProgress] and returns the new last index.
  int _pollProgressFile(
    String path,
    int lastIdx,
    void Function(String)? onProgress,
  ) {
    final f = File(path);
    if (!f.existsSync()) return lastIdx;
    try {
      final lines = f.readAsStringSync().split('\n');
      for (int i = lastIdx; i < lines.length; i++) {
        final line = lines[i].trim();
        if (line.startsWith('PROGRESS: ')) {
          onProgress?.call(line.substring(10));
        }
      }
      return lines.length;
    } catch (_) {
      return lastIdx;
    }
  }

  /// Classify an error message into a [DeployErrorKind].
  static DeployErrorKind _classifyError(String msg) {
    final lower = msg.toLowerCase();
    if (lower.contains('robocopy') ||
        lower.contains('file copy') ||
        lower.contains('xcopy')) {
      return DeployErrorKind.copyFailed;
    }
    if (lower.contains('sc.exe') ||
        lower.contains('service') ||
        lower.contains('sunshinesvc')) {
      return DeployErrorKind.serviceError;
    }
    if (lower.contains('uac') ||
        lower.contains('access denied') ||
        lower.contains('privilege')) {
      return DeployErrorKind.uacDenied;
    }
    return DeployErrorKind.unknown;
  }

  /// Builds the PowerShell script that runs elevated and performs the actual
  /// file copy, driver installation, service registration, and service start.
  ///
  /// Writes `PROGRESS: <msg>` lines to [progressPath] as each stage starts,
  /// then writes `OK` or `FAIL: <reason>` as the final line.
  static String _buildDeployScript({
    required String buildDir,
    required String installDir,
    required String progressPath,
    String? username,
    String? password,
    bool cleanInstall = false,
  }) {
    // Escape single quotes for PowerShell single-quoted string literals.
    final safeUser = (username ?? '').replaceAll("'", "''");
    final safePass = (password ?? '').replaceAll("'", "''");

    // Credential setup step: runs sunshine.exe --creds BEFORE the service starts,
    // so the server boots with credentials already written to disk.
    final credStep = (safeUser.isNotEmpty && safePass.isNotEmpty)
        ? '''
    Write-Progress-Step 'Setting server credentials...'
    New-Item -ItemType Directory -Path '$installDir\\config' -Force | Out-Null

    \$credSuccess = \$false
    for (\$attempt = 1; \$attempt -le 3; \$attempt++) {
        Write-Progress-Step "Credential setup attempt \$attempt of 3..."
        \$exeReady = \$false
        for (\$wait = 0; \$wait -lt 5; \$wait++) {
            if (Test-Path '$installDir\\sunshine.exe') {
                try {
                    [IO.File]::OpenRead('$installDir\\sunshine.exe').Close()
                    \$exeReady = \$true
                    break
                } catch { Start-Sleep -Milliseconds 500 }
            } else { Start-Sleep -Milliseconds 500 }
        }
        if (-not \$exeReady) {
            Write-Progress-Step 'Warning: sunshine.exe not ready, retrying...'
            Start-Sleep -Seconds 1
            continue
        }

        & '$installDir\\sunshine.exe' --creds '$safeUser' '$safePass'
        if (\$LASTEXITCODE -eq 0) {
            \$credSuccess = \$true
            Write-Progress-Step 'Credentials configured successfully.'
            break
        }
        Write-Progress-Step "Credential attempt \$attempt failed (exit \$LASTEXITCODE), retrying..."
        Start-Sleep -Seconds ([Math]::Pow(2, \$attempt - 1))
    }
    if (-not \$credSuccess) {
        Write-Progress-Step 'Warning: credentials could not be set via CLI. Will use API bootstrap.'
    }
'''
        : '';

    return '''
\$ErrorActionPreference = "Stop"
function Write-Progress-Step(\$msg) {
    "PROGRESS: \$msg" | Out-File -FilePath '$progressPath' -Append -Encoding UTF8
}
try {
    Write-Progress-Step 'Checking computer before installation...'
    Start-Sleep -Milliseconds 200

    Write-Progress-Step 'Uninstalling current server...'
    foreach (\$n in @('Jujo.Server', 'ApolloService', 'sunshinesvc')) {
        & sc.exe stop \$n 2>\$null | Out-Null
        Start-Sleep -Milliseconds 300
        & sc.exe delete \$n 2>\$null | Out-Null
        Start-Sleep -Milliseconds 300
    }

    Write-Progress-Step 'Stopping conflicting processes...'
    Get-CimInstance Win32_Process |
        Where-Object {
            \$_.Name -in @('sunshine.exe', 'sunshinesvc.exe') -and
            (\$_.ExecutablePath -like '$installDir\\*' -or \$_.ExecutablePath -like '$buildDir\\*')
        } |
        ForEach-Object {
            try { Stop-Process -Id \$_.ProcessId -Force -ErrorAction Stop } catch {}
        }
    Start-Sleep -Seconds 1

    # Preserve user config files before wiping the install directory
    # (skipped on clean install — user wants a fresh start)
    \$preservedAppsJson = \$null
    \$preservedSunshineConf = \$null
${cleanInstall ? "    Write-Progress-Step 'Clean install: user config will NOT be preserved.'" : '''    if (Test-Path '\$installDir\\config\\apps.json') {
        \$preservedAppsJson = Get-Content '$installDir\\config\\apps.json' -Raw
        Write-Progress-Step 'Backed up existing apps.json (user game library).'
    }
    if (Test-Path '$installDir\\config\\sunshine.conf') {
        \$preservedSunshineConf = Get-Content '$installDir\\config\\sunshine.conf' -Raw
        Write-Progress-Step 'Backed up existing sunshine.conf (server config).'
    }'''}

    Write-Progress-Step 'Removing previous installation...'
    if (Test-Path '$installDir') {
        Remove-Item -LiteralPath '$installDir' -Recurse -Force -ErrorAction Stop
    }

    Write-Progress-Step 'Preparing install directory...'
    New-Item -ItemType Directory -Path '$installDir' -Force | Out-Null

    Write-Progress-Step 'Installing server files...'
    \$null = & robocopy '$buildDir' '$installDir' /MIR /NFL /NDL /NJH /NJS /NC /NS /NP /XD 'assets\\web'
    if (\$LASTEXITCODE -gt 7) { throw "FILE_COPY: robocopy exited with code \$LASTEXITCODE" }

    # Restore preserved user config files (overwrite the defaults from build)
    if (\$preservedAppsJson) {
        New-Item -ItemType Directory -Path '$installDir\\config' -Force | Out-Null
        Set-Content -Path '$installDir\\config\\apps.json' -Value \$preservedAppsJson -Encoding UTF8 -NoNewline
        Write-Progress-Step 'Restored user apps.json.'
    }
    if (\$preservedSunshineConf) {
        New-Item -ItemType Directory -Path '$installDir\\config' -Force | Out-Null
        Set-Content -Path '$installDir\\config\\sunshine.conf' -Value \$preservedSunshineConf -Encoding UTF8 -NoNewline
        Write-Progress-Step 'Restored user sunshine.conf.'
    }
$credStep
    # ---- Install SudoVDA virtual display driver (required for headless streaming) ----
    \$sudovdaScript = '$installDir\\drivers\\sudovda\\install.ps1'
    if (Test-Path \$sudovdaScript) {
        Write-Progress-Step 'Installing virtual display driver (SudoVDA)...'
        try {
            & powershell -ExecutionPolicy Bypass -NonInteractive -File \$sudovdaScript 2>&1 | Out-Null
            if (\$LASTEXITCODE -eq 0) {
                Write-Progress-Step 'Virtual display driver installed.'
            } else {
                Write-Progress-Step "Virtual display driver install returned code \$LASTEXITCODE (non-fatal)."
            }
        } catch {
            Write-Progress-Step "Virtual display driver install failed: \$_ (non-fatal, server will retry at runtime)."
        }
    } else {
        Write-Progress-Step 'Virtual display driver not bundled -- skipping (server will auto-install if needed).'
    }

    # ---- Install ViGEm gamepad driver (download from GitHub if missing) ----
    \$vigemInstalled = \$false
    \$vigemPaths = @(
        'C:\\Program Files\\Nefarius Software Solutions e.U.\\ViGEmBus\\x64\\ViGEmBus.sys',
        "\$env:SystemRoot\\System32\\drivers\\ViGEmBus.sys"
    )
    foreach (\$vp in \$vigemPaths) {
        if (Test-Path \$vp) { \$vigemInstalled = \$true; break }
    }
    if (-not \$vigemInstalled) {
        Write-Progress-Step 'ViGEm gamepad driver not found -- downloading installer...'
        \$vigemUrl = 'https://github.com/nefarius/ViGEmBus/releases/download/v1.22.0/ViGEmBus_1.22.0_x64_x86_arm64.exe'
        \$vigemExe = "\$env:TEMP\\ViGEmBus_Setup.exe"
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            (New-Object Net.WebClient).DownloadFile(\$vigemUrl, \$vigemExe)
            Write-Progress-Step 'Installing ViGEm gamepad driver (silent)...'
            \$vigemProc = Start-Process -FilePath \$vigemExe -ArgumentList '/quiet','/norestart' -Wait -PassThru -WindowStyle Hidden
            if (\$vigemProc.ExitCode -eq 0) {
                Write-Progress-Step 'ViGEm gamepad driver installed successfully.'
            } else {
                Write-Progress-Step "ViGEm installer exited with code \$(\$vigemProc.ExitCode) (non-fatal)."
            }
            Remove-Item \$vigemExe -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Progress-Step "ViGEm download/install failed: \$_ (non-fatal -- controller input unavailable until manually installed)."
        }
    } else {
        Write-Progress-Step 'ViGEm gamepad driver already installed.'
    }

    # ---- Register and start the streaming service ----
    \$svcExe = '$installDir\\tools\\sunshinesvc.exe'
    if (Test-Path \$svcExe) {
        Write-Progress-Step 'Registering streaming service...'
        & sc.exe create Jujo.Server binPath= "`"\$svcExe`"" start= auto DisplayName= "Jujo.Server" | Out-Null
        & sc.exe description Jujo.Server "Jujo.Stream local streaming server" | Out-Null

        Write-Progress-Step 'Starting streaming service...'
        & sc.exe start Jujo.Server 2>\$null | Out-Null
    } else {
        Write-Progress-Step 'Service binary not found -- skipping service registration.'
    }

    'OK' | Out-File -FilePath '$progressPath' -Append -Encoding UTF8
} catch {
    "FAIL: \$_" | Out-File -FilePath '$progressPath' -Append -Encoding UTF8
}
''';
  }
}
