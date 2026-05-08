import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:jujo_stream_app/core/services/backend_update_service.dart';

/// Manages the lifecycle of the Jujo.Stream server process.
///
/// The server can run either as:
/// 1. A Windows Service named "Jujo.Server" (production / deploy path)
/// 2. A detached process launched directly (legacy / fallback)
///
/// This manager checks the service state first, then falls back to process tracking.
class ServerProcessManager {
  ServerProcessManager();

  static const _serviceName = 'Jujo.Server';

  /// Default base port used by the server when no custom port is configured.
  static const defaultBasePort = 47989;

  /// Offset from base port to the HTTPS WebUI port.
  static const _httpsOffset = 1;

  Process? _process;
  bool _processRunning = false;

  /// True if the server is running (either as a service or as a tracked process).
  bool get isRunning => _processRunning || _isServiceRunning();

  static const _knownPaths = [
    r'C:\Program Files\Jujo.Stream Server\sunshine.exe',
  ];

  ({String exe, String workDir})? findExecutable() {
    for (final path in _knownPaths) {
      final exe = File(path);
      final svc = File('${exe.parent.path}\\tools\\sunshinesvc.exe');
      if (exe.existsSync() && svc.existsSync()) {
        return (exe: path, workDir: exe.parent.path);
      }
    }
    return null;
  }

  /// Check if the Windows Service "Jujo.Server" is currently running.
  bool _isServiceRunning() {
    if (kIsWeb) return false;
    try {
      final result = Process.runSync(
        'sc.exe',
        ['query', _serviceName],
        runInShell: true,
      );
      // sc.exe query output contains "STATE" line with RUNNING/STOPPED/etc.
      return result.stdout.toString().contains('RUNNING');
    } catch (_) {
      return false;
    }
  }

  /// Start the server — prefers starting the Windows Service if installed.
  Future<bool> start() async {
    if (isRunning) return true;

    final found = findExecutable();
    if (found == null) return false;

    // Try starting via Windows Service first
    final svcResult = await _startService();
    if (svcResult) return true;

    // Fallback: launch process directly
    try {
      _process = await Process.start(
        found.exe,
        const [],
        workingDirectory: found.workDir,
        mode: ProcessStartMode.detached,
      );

      _processRunning = true;
      _process!.exitCode.then((code) {
        debugPrint('Server process exited with code $code');
        _processRunning = false;
        _process = null;
      });

      return true;
    } catch (e) {
      debugPrint('Failed to start server: $e');
      return false;
    }
  }

  /// Start the Windows Service.
  Future<bool> _startService() async {
    try {
      final result = await Process.run(
        'sc.exe',
        ['start', _serviceName],
        runInShell: true,
      );
      // sc.exe start returns 0 on success, or if already running
      if (result.exitCode == 0 ||
          result.stdout.toString().contains('RUNNING')) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Stop the server — tries API quit first, then service stop, then process kill.
  Future<bool> stop(String serverUrl) async {
    if (!isRunning) return true;

    // Try graceful API shutdown
    try {
      final client = HttpClient()
        ..connectionTimeout = const Duration(seconds: 5);
      try {
        final request = await client.postUrl(Uri.parse('$serverUrl/api/quit'));
        final response = await request.close();
        if (response.statusCode == HttpStatus.ok) {
          _processRunning = false;
          _process = null;
          return true;
        }
      } finally {
        client.close(force: true);
      }
    } catch (_) {}

    // Try stopping the Windows Service
    try {
      final result = await Process.run(
        'sc.exe',
        ['stop', _serviceName],
        runInShell: true,
      );
      if (result.exitCode == 0) {
        _processRunning = false;
        _process = null;
        return true;
      }
    } catch (_) {}

    // Last resort: kill tracked process
    if (_process != null) {
      _process!.kill();
      _processRunning = false;
      _process = null;
      return true;
    }

    return false;
  }

  bool get isInstalled => findExecutable() != null;

  String? get installPath => findExecutable()?.exe;

  /// Reads the configured base port from the server's `sunshine.conf`.
  ///
  /// The config file lives at `<install_dir>/config/sunshine.conf`.
  /// Returns [defaultBasePort] if the file doesn't exist or has no `port` key.
  int get configuredBasePort {
    if (kIsWeb) return defaultBasePort;
    final found = findExecutable();
    if (found == null) return defaultBasePort;

    final configPath = '${found.workDir}\\config\\sunshine.conf';
    final configFile = File(configPath);
    if (!configFile.existsSync()) return defaultBasePort;

    try {
      final lines = configFile.readAsLinesSync();
      for (final line in lines) {
        final trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.contains('=')) continue;
        final eqIdx = trimmed.indexOf('=');
        final key = trimmed.substring(0, eqIdx).trim();
        if (key == 'port') {
          final value = trimmed.substring(eqIdx + 1).trim();
          final parsed = int.tryParse(value);
          if (parsed != null && parsed >= 1024 && parsed <= 65535) {
            return parsed;
          }
        }
      }
    } catch (_) {}
    return defaultBasePort;
  }

  /// The HTTPS port the server's WebUI/API is listening on.
  int get httpsPort => configuredBasePort + _httpsOffset;

  /// Full local server URL derived from the actual configured port.
  String get localServerUrl => 'https://localhost:$httpsPort';

  /// All port mappings derived from the configured base port.
  /// Useful for displaying to the user when they change the port.
  Map<String, int> get allPorts {
    final base = configuredBasePort;
    return {
      'HTTP (GameStream)': base + 0,   // PORT_HTTP
      'HTTPS (WebUI/API)': base + 1,   // confighttp::PORT_HTTPS
      'Video Stream': base + 9,         // VIDEO_STREAM_PORT
      'Control': base + 10,             // CONTROL_PORT
      'Audio Stream': base + 11,        // AUDIO_STREAM_PORT
      'RTSP': base + 21,                // RTSP_SETUP_PORT
      'GS HTTPS': base - 5,             // nvhttp::PORT_HTTPS
    };
  }

  Future<bool> downloadAndInstall({
    void Function(double progress)? onProgress,
  }) async {
    final updateService = BackendUpdateService();
    final release = await updateService.fetchLatestReleaseFromGitHub();
    if (release == null) {
      debugPrint('No Jujo.Stream Server release found.');
      return false;
    }

    final result = await updateService.installRelease(
      release,
      onProgress: onProgress,
    );
    if (!result.success) {
      debugPrint(result.error ?? 'Backend install failed.');
    }
    return result.success;
  }
}
