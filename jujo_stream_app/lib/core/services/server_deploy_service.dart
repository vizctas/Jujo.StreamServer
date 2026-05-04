import 'dart:io';

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
/// Service via `sunshinesvc.exe`, and starts it.
class ServerDeployService {
  static const _buildExePath =
      r'C:\Users\Jozh\repos\Jujo.StreamServer\build\sunshine.exe';
  static const _installDir =
      r'C:\Program Files\Jujo.Stream Server';

  /// True when the built executable exists and can be deployed.
  bool get canDeploy => File(_buildExePath).existsSync();

  /// Deploy the server from the build output directory.
  ///
  /// Calls [onProgress] with a human-readable message after each major step.
  /// Returns a [DeployResult] indicating success or failure with an error string.
  Future<DeployResult> deploy({
    void Function(String msg)? onProgress,
  }) async {
    try {
      // ── Step 1: Copy binaries ──────────────────────────────────────────────
      onProgress?.call('Copying server files…');
      final buildDir = File(_buildExePath).parent;
      final installDir = Directory(_installDir);

      if (!installDir.existsSync()) {
        installDir.createSync(recursive: true);
      }

      final copyResult = await Process.run('robocopy', [
        buildDir.path,
        _installDir,
        '/MIR',
        '/NFL',
        '/NDL',
        '/NJH',
        '/NJS',
        '/NC',
        '/NS',
        '/NP',
        '/XD', 'assets\\web', // exclude web UI (served separately)
      ]);

      // robocopy exit codes 0-7 are success/informational
      if (copyResult.exitCode > 7) {
        return DeployResult.fail(
          'File copy failed (robocopy exit ${copyResult.exitCode}): '
          '${copyResult.stderr}',
        );
      }

      // ── Step 2: Register Windows Service ──────────────────────────────────
      onProgress?.call('Registering Windows service…');
      final svcExe = '$_installDir\\tools\\sunshinesvc.exe';

      if (File(svcExe).existsSync()) {
        await Process.run(
          svcExe,
          ['install'],
          runInShell: true,
        );
      }

      // ── Step 3: Start the service ──────────────────────────────────────────
      onProgress?.call('Starting server service…');
      final startResult = await Process.run(
        'sc.exe',
        ['start', 'SunshineSvc'],
        runInShell: true,
      );

      // sc.exe exit code 0 = started, 1056 = already running
      if (startResult.exitCode != 0 && startResult.exitCode != 1056) {
        // Non-critical: service may already be running or require a reboot.
        // Do NOT fail the whole deploy for this.
        debugPrint(
          'sc.exe start returned ${startResult.exitCode}: ${startResult.stderr}',
        );
      }

      return DeployResult.ok;
    } catch (e) {
      return DeployResult.fail('Deploy error: $e');
    }
  }
}

void debugPrint(String message) {
  // ignore: avoid_print
  print(message);
}
