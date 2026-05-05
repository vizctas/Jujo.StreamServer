import 'dart:io';

import 'package:flutter/foundation.dart' show debugPrint;

/// Result of a [ServerDeployService.deploy] call.
class DeployResult {
  const DeployResult({required this.success, this.error});

  final bool success;
  final String? error;

  static const ok = DeployResult(success: true);
  static DeployResult fail(String message) =>
      DeployResult(success: false, error: message);
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
    // Dev: running `flutter run` from jujo_stream_app/ → CWD.parent = repo root
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
  /// Because the install target is `C:\Program Files`, all privileged work is
  /// delegated to an elevated PowerShell script launched via UAC
  /// (`Start-Process -Verb RunAs -Wait`).  A result marker file is used to
  /// communicate success or failure back to the Flutter process.
  ///
  /// Calls [onProgress] with a human-readable message at each stage.
  Future<DeployResult> deploy({void Function(String msg)? onProgress}) async {
    final exePath = buildExePath;
    if (exePath == null) {
      return DeployResult.fail(
        'Server build files not found. Build the C++ project first.',
      );
    }

    final buildDir = File(exePath).parent.path;
    final ts = DateTime.now().millisecondsSinceEpoch;
    final tmp = Directory.systemTemp.path;
    final deployScript = '$tmp\\jujo_deploy_$ts.ps1';
    final elevatorScript = '$tmp\\jujo_elevate_$ts.ps1';
    final resultFile = '$tmp\\jujo_result_$ts.txt';

    try {
      onProgress?.call('Preparing deploy scripts…');

      // ── Write the elevated deploy script ────────────────────────────────────
      File(deployScript).writeAsStringSync(
        _buildDeployScript(
          buildDir: buildDir,
          installDir: _installDir,
          resultPath: resultFile,
        ),
      );

      // ── Write the elevator (runs as current user, requests UAC) ─────────────
      // Passes the deploy script path as an array to avoid argument-splitting
      // issues with spaces in the temp directory path.
      File(elevatorScript).writeAsStringSync(
        "Start-Process -FilePath 'powershell.exe' "
        "-ArgumentList @('-ExecutionPolicy','Bypass','-NonInteractive','-File','$deployScript') "
        '-Verb RunAs -Wait\n',
      );

      onProgress?.call(
        'Requesting administrator privileges — approve the UAC prompt…',
      );

      // Run the elevator (outer, non-elevated); it triggers UAC for the inner.
      final run = await Process.run('powershell', [
        '-ExecutionPolicy',
        'Bypass',
        '-NonInteractive',
        '-File',
        elevatorScript,
      ]);

      debugPrint('[deploy] elevator exit=${run.exitCode} stderr=${run.stderr}');

      // ── Read result from the marker file written by the elevated script ──────
      final rf = File(resultFile);
      if (!rf.existsSync()) {
        return DeployResult.fail(
          'Administrator access was denied or the UAC prompt was cancelled.',
        );
      }

      final content = rf.readAsStringSync().trim();
      if (content == 'OK') {
        onProgress?.call('Server deployed successfully.');
        return DeployResult.ok;
      }
      return DeployResult.fail(
        content.startsWith('FAIL: ') ? content.substring(6) : content,
      );
    } catch (e) {
      return DeployResult.fail('Deploy error: $e');
    } finally {
      for (final p in [deployScript, elevatorScript, resultFile]) {
        try {
          File(p).deleteSync();
        } catch (_) {}
      }
    }
  }

  /// Builds the PowerShell script that runs elevated and performs the actual
  /// file copy, service registration, and service start.
  static String _buildDeployScript({
    required String buildDir,
    required String installDir,
    required String resultPath,
  }) =>
      """
\$ErrorActionPreference = "Stop"
try {
    New-Item -ItemType Directory -Path '$installDir' -Force | Out-Null

    \$null = & robocopy '$buildDir' '$installDir' /MIR /NFL /NDL /NJH /NJS /NC /NS /NP /XD 'assets\\web'
    if (\$LASTEXITCODE -gt 7) { throw "File copy failed (robocopy exit \$LASTEXITCODE)" }

    \$svcExe = '$installDir\\tools\\sunshinesvc.exe'
    if (Test-Path \$svcExe) {
        foreach (\$n in @('Jujo.Server', 'ApolloService', 'sunshinesvc')) {
            & sc.exe stop \$n 2>\$null
            Start-Sleep -Milliseconds 400
            & sc.exe delete \$n 2>\$null
            Start-Sleep -Milliseconds 400
        }
        Start-Sleep -Seconds 1
        & sc.exe create Jujo.Server binPath= "`"\$svcExe`"" start= auto DisplayName= "Jujo.Server"
        & sc.exe description Jujo.Server "Jujo.Stream local streaming server"
        & sc.exe start Jujo.Server 2>\$null
    }

    'OK' | Out-File -FilePath '$resultPath' -Encoding UTF8
} catch {
    "FAIL: \$_" | Out-File -FilePath '$resultPath' -Encoding UTF8
}
""";
}
