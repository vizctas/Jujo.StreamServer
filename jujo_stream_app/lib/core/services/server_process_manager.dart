import 'dart:io';

import 'package:flutter/foundation.dart';

/// Manages the lifecycle of the Jujo.Stream server process.
///
/// Finds the executable in known install locations, starts it as a
/// detached background process, and can request graceful shutdown
/// via the HTTP API.
class ServerProcessManager {
  ServerProcessManager();

  Process? _process;
  bool _running = false;

  bool get isRunning => _running;

  /// Known install paths for the Jujo.Stream server executable on Windows.
  static const _knownPaths = [
    r'C:\Program Files\Jujo.Stream Server\sunshine.exe',
  ];

  /// Find the server executable on disk.
  /// Returns the path and its parent directory, or null if not found.
  ({String exe, String workDir})? findExecutable() {
    for (final path in _knownPaths) {
      final exe = File(path);
      final svc = File('${exe.parent.path}\\tools\\sunshinesvc.exe');
      if (exe.existsSync() && svc.existsSync()) {
        return (exe: path, workDir: File(path).parent.path);
      }
    }
    return null;
  }

  /// Start the server process.
  ///
  /// Returns true if the process was launched successfully.
  /// The process runs detached so it survives the Flutter app closing.
  Future<bool> start() async {
    if (_running) return true;

    final found = findExecutable();
    if (found == null) return false;

    try {
      _process = await Process.start(
        found.exe,
        [],
        workingDirectory: found.workDir,
        mode: ProcessStartMode.detached,
      );

      _running = true;

      // Listen for unexpected exit
      _process!.exitCode.then((code) {
        debugPrint('Server process exited with code $code');
        _running = false;
        _process = null;
      });

      return true;
    } catch (e) {
      debugPrint('Failed to start server: $e');
      return false;
    }
  }

  /// Request graceful shutdown via the server's HTTP API.
  ///
  /// Falls back to killing the process if the HTTP call fails.
  Future<bool> stop(String serverUrl) async {
    if (!_running) return true;

    // Try graceful shutdown via API first
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      try {
        final request = await client.postUrl(
          Uri.parse('$serverUrl/api/shutdown'),
        );
        final response = await request.close();
        if (response.statusCode == 200) {
          _running = false;
          _process = null;
          client.close();
          return true;
        }
      } finally {
        client.close();
      }
    } catch (_) {
      // HTTP shutdown failed, fall through to process kill
    }

    // Force kill
    if (_process != null) {
      _process!.kill();
      _running = false;
      _process = null;
      return true;
    }

    return false;
  }

  /// Check if the server executable is installed (exists on disk).
  bool get isInstalled => findExecutable() != null;

  /// Get the install path, or null if not installed.
  String? get installPath => findExecutable()?.exe;

  // ── Installer URL ───────────────────────────────────────────────────────────

  /// Public MSI download URL.  Override via env var JUJO_INSTALLER_URL for
  /// testing against a local build or pre-release.
  static String get _installerUrl =>
      Platform.environment['JUJO_INSTALLER_URL'] ??
      'https://github.com/LizardByte/Sunshine/releases/latest/download/sunshine-windows-installer.exe';

  // ── Download + Install ──────────────────────────────────────────────────────

  /// Downloads the installer to a temp file and runs it silently.
  ///
  /// [onProgress] receives values 0.0–1.0 as bytes arrive.
  /// Returns true if the installer completed successfully.
  Future<bool> downloadAndInstall({
    void Function(double progress)? onProgress,
  }) async {
    final tmpDir = Directory.systemTemp;
    final msiPath = '${tmpDir.path}\\jujo_stream_setup.exe';

    try {
      // ── 1. Download ────────────────────────────────────────────────────────
      debugPrint('Downloading installer from $_installerUrl');
      final httpClient = HttpClient();
      httpClient.badCertificateCallback = (_, __, ___) => true;
      httpClient.connectionTimeout = const Duration(seconds: 30);

      final req = await httpClient.getUrl(Uri.parse(_installerUrl));
      final resp = await req.close();

      if (resp.statusCode != 200) {
        httpClient.close();
        debugPrint('Installer download failed: HTTP ${resp.statusCode}');
        return false;
      }

      final total = resp.contentLength;
      int received = 0;
      final sink = File(msiPath).openWrite();

      await for (final chunk in resp) {
        sink.add(chunk);
        received += chunk.length;
        if (total > 0) {
          onProgress?.call((received / total).clamp(0.0, 1.0));
        }
      }
      await sink.flush();
      await sink.close();
      httpClient.close();

      onProgress?.call(1.0);
      debugPrint('Installer saved to $msiPath');

      // ── 2. Run silently ────────────────────────────────────────────────────
      // /S = silent for NSIS-based exe, /passive for MSI-based — we try both.
      final result = await Process.run(msiPath, ['/S'], runInShell: true);
      debugPrint('Installer exit code: ${result.exitCode}');
      debugPrint('Installer stdout: ${result.stdout}');
      debugPrint('Installer stderr: ${result.stderr}');

      return result.exitCode == 0;
    } catch (e) {
      debugPrint('downloadAndInstall error: $e');
      return false;
    } finally {
      try {
        File(msiPath).deleteSync();
      } catch (_) {}
    }
  }
}
