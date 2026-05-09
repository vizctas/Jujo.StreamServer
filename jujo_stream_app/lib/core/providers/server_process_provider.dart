import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/cert_trust.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/providers/diagnostics_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/setup_provider.dart';
import 'package:jujo_stream_app/core/providers/update_provider.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
import 'package:jujo_stream_app/core/services/server_process_manager.dart';
import 'package:jujo_stream_app/core/services/server_status_service.dart';

/// State of the local server process.
enum ServerProcessState {
  unknown,
  notInstalled,
  stopped,
  starting,
  running,
  stopping,
  installing,
}

class ServerProcessStatus {
  const ServerProcessStatus({
    this.state = ServerProcessState.unknown,
    this.installPath,
    this.error,
    this.installProgress,
    this.installProgressMessage,
    this.installLog = const [],
    this.deployErrorKind,
  });

  final ServerProcessState state;
  final String? installPath;
  final String? error;

  /// Download progress 0.0–1.0 during [ServerProcessState.installing].
  final double? installProgress;

  /// Human-readable step message shown during install / deploy.
  final String? installProgressMessage;

  /// Accumulated log lines from the current install / deploy operation.
  final List<String> installLog;

  /// Why the deploy failed (null when no error or during install).
  final DeployErrorKind? deployErrorKind;

  bool get isRunning => state == ServerProcessState.running;
  bool get isStopped => state == ServerProcessState.stopped;
  bool get isNotInstalled => state == ServerProcessState.notInstalled;
  bool get isInstalling => state == ServerProcessState.installing;
  bool get isBusy =>
      state == ServerProcessState.starting ||
      state == ServerProcessState.stopping ||
      state == ServerProcessState.installing;

  ServerProcessStatus copyWith({
    ServerProcessState? state,
    String? installPath,
    String? error,
    double? installProgress,
    String? installProgressMessage,
    List<String>? installLog,
    DeployErrorKind? deployErrorKind,
  }) {
    return ServerProcessStatus(
      state: state ?? this.state,
      installPath: installPath ?? this.installPath,
      error: error,
      installProgress: installProgress ?? this.installProgress,
      installProgressMessage:
          installProgressMessage ?? this.installProgressMessage,
      installLog: installLog ?? this.installLog,
      deployErrorKind: deployErrorKind,
    );
  }
}

final serverProcessProvider =
    StateNotifierProvider<ServerProcessNotifier, ServerProcessStatus>((ref) {
      return ServerProcessNotifier(ref);
    });

class ServerProcessNotifier extends StateNotifier<ServerProcessStatus> {
  ServerProcessNotifier(this._ref) : super(const ServerProcessStatus()) {
    _init();
  }

  final Ref _ref;
  final _manager = ServerProcessManager();

  void _init() {
    if (kIsWeb) {
      state = state.copyWith(state: ServerProcessState.unknown);
      return;
    }

    if (_manager.isInstalled) {
      // Check if the service is actually running (e.g., after deploy)
      state = state.copyWith(
        state: _manager.isRunning
            ? ServerProcessState.running
            : ServerProcessState.stopped,
        installPath: _manager.installPath,
      );
      // If running, auto-configure URL so the app connects immediately
      if (_manager.isRunning) {
        _autoConfigureAndProbe();
      }
    } else {
      state = state.copyWith(state: ServerProcessState.notInstalled);
    }
  }

  Future<void> start() async {
    if (state.isBusy || state.isRunning) return;

    state = state.copyWith(state: ServerProcessState.starting, error: null);

    final ok = await _manager.start();
    if (ok) {
      state = state.copyWith(state: ServerProcessState.running);
      // Auto-configure URL and probe health so the UI updates immediately.
      await _autoConfigureAndProbe();
    } else {
      state = state.copyWith(
        state: ServerProcessState.stopped,
        error: 'Failed to launch server. Check that the server is installed.',
      );
    }
  }

  Future<void> _autoConfigureAndProbe() async {
    // If no server URL is configured yet, default to localhost with detected port.
    final authState = _ref.read(authProvider);
    var targetUrl = authState.serverUrl;
    if (authState.serverUrl == null || authState.serverUrl!.isEmpty) {
      targetUrl = _manager.localServerUrl;
      await _ref.read(authProvider.notifier).setServerUrl(targetUrl);
    }
    if (_isLocalServerUrl(targetUrl)) {
      // Only bootstrap when a password is available from this session (i.e., the
      // credential dialog was already shown during a deploy/install).  At app
      // startup _bootstrapPassword is null — skip bootstrap and rely on the token
      // that was stored in FlutterSecureStorage during the last successful login.
      final authNotifier = _ref.read(authProvider.notifier);
      if (authNotifier.hasServerBootstrapPassword) {
        await _bootstrapLocalProfile(targetUrl!);
      }
    }
    // Give the server a few seconds to initialise, then re-probe.
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      _refreshServerData();
    }
  }

  Future<void> stop() async {
    if (state.isBusy || !state.isRunning) return;

    state = state.copyWith(state: ServerProcessState.stopping);

    final serverUrl =
        _ref.read(authProvider).serverUrl ?? _manager.localServerUrl;
    await _manager.stop(serverUrl);
    state = state.copyWith(state: ServerProcessState.stopped);
  }

  /// Download and silently install the server backend.
  Future<void> install({bool cleanInstall = false}) async {
    if (state.isBusy) return;

    state = ServerProcessStatus(
      state: ServerProcessState.installing,
      installProgress: 0.0,
    );

    final ok = await _manager.downloadAndInstall(
      onProgress: (p) {
        if (mounted) {
          state = state.copyWith(
            state: ServerProcessState.installing,
            installProgress: p,
          );
        }
      },
    );

    if (!mounted) return;

    if (ok) {
      final started = _manager.isRunning || await _manager.start();
      if (!started) {
        refresh();
        state = state.copyWith(
          error:
              'Server installed, but the Windows Service could not be started.',
        );
        return;
      }

      final localUrl = _manager.localServerUrl;
      await _ref
          .read(authProvider.notifier)
          .setServerUrl(localUrl);

      final ready = await _waitForServerApi(localUrl);
      if (!ready) {
        state = ServerProcessStatus(
          state: ServerProcessState.running,
          installPath: _manager.installPath,
          error:
              'Server installed and started, but the API did not become ready on $localUrl.',
        );
        return;
      }

      final profileReady = await _bootstrapLocalProfile(
        localUrl,
      );
      if (!profileReady) {
        state = ServerProcessStatus(
          state: ServerProcessState.running,
          installPath: _manager.installPath,
          error:
              'Server installed and started, but the app could not create or login to the server credentials.',
        );
        return;
      }

      refresh();
      if (mounted) _refreshServerData();
    } else {
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        error:
            'Installation failed. Check your internet connection and try again.',
      );
    }
  }

  /// Deploy the server from local build files (no internet required).
  ///
  /// Copies server binaries + assets (excluding the legacy Vue UI) to the install
  /// directory, registers the Windows Service, and starts it.
  /// After completion, auto-configures the active server URL to the detected local port.
  Future<void> deploy({void Function(String msg)? onProgress, bool cleanInstall = false}) async {
    if (state.isBusy) return;

    final log = <String>[];

    void addLog(String msg) {
      log.add(msg);
      onProgress?.call(msg);
      if (mounted) {
        state = state.copyWith(
          installProgress: (log.length / 6).clamp(0.0, 0.95),
          installProgressMessage: msg,
          installLog: List.unmodifiable(log),
        );
      }
    }

    state = ServerProcessStatus(
      state: ServerProcessState.installing,
      installProgress: 0.0,
      installLog: const [],
    );

    final service = ServerDeployService();

    if (!service.canDeploy) {
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        error:
            'Server build files not found. Build the C++ project first '
            '(cmake: build), then try again.',
        deployErrorKind: DeployErrorKind.buildNotFound,
      );
      return;
    }

    final authNotifier = _ref.read(authProvider.notifier);

    // Clean install: stop existing server before deploy.
    // The elevated deploy script handles the actual folder deletion (requires admin).
    if (cleanInstall) {
      addLog('Stopping existing server for clean install...');
      try {
        await _manager.stop(_manager.localServerUrl);
      } catch (_) {}
      // Also force-kill via sc.exe in case the API stop didn't work
      try {
        await Process.run('sc.exe', ['stop', 'Jujo.Server'], runInShell: true);
      } catch (_) {}
      // Wait for the service process to fully exit and release file locks
      await Future<void>.delayed(const Duration(seconds: 3));
      addLog('Server stopped. Deploy script will remove old files with admin rights.');
    }

    final result = await service.deploy(
      onProgress: addLog,
      username: _ref.read(authProvider).username,
      password: authNotifier.bootstrapPassword,
      cleanInstall: cleanInstall,
    );

    if (!mounted) return;

    if (result.success) {
      // Auto-configure URL to localhost with the detected port
      final localUrl = _manager.localServerUrl;
      await _ref
          .read(authProvider.notifier)
          .setServerUrl(localUrl);

      final ready = await _waitForServerApi(localUrl);
      if (!ready) {
        state = ServerProcessStatus(
          state: ServerProcessState.running,
          installPath: _manager.installPath,
          error:
              'Server installed and started, but the API did not become ready on $localUrl.',
          installLog: List.unmodifiable(log),
        );
        return;
      }

      final profileReady = await _bootstrapLocalProfile(
        localUrl,
      );
      if (!profileReady) {
        state = ServerProcessStatus(
          state: ServerProcessState.running,
          installPath: _manager.installPath,
          error:
              'Server installed and started, but the app could not create or login to the server credentials.',
          installLog: List.unmodifiable(log),
        );
        return;
      }

      refresh();
      if (mounted) _refreshServerData();
    } else {
      final userMessage = _deployErrorMessage(
        result.errorKind ?? DeployErrorKind.unknown,
        result.error,
      );
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        error: userMessage,
        installLog: List.unmodifiable(log),
        deployErrorKind: result.errorKind,
      );
    }
  }

  Future<void> uninstall({void Function(String msg)? onProgress}) async {
    if (state.isBusy) return;

    final log = <String>[];

    void addLog(String msg) {
      log.add(msg);
      onProgress?.call(msg);
      if (mounted) {
        state = state.copyWith(
          installProgress: (log.length / 4).clamp(0.0, 0.95),
          installProgressMessage: msg,
          installLog: List.unmodifiable(log),
        );
      }
    }

    state = ServerProcessStatus(
      state: ServerProcessState.installing,
      installProgress: 0.0,
      installProgressMessage: 'Uninstalling server...',
      installLog: const [],
    );

    final result = await ServerDeployService().uninstall(onProgress: addLog);
    if (!mounted) return;

    if (result.success) {
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        installLog: List.unmodifiable(log),
      );
      _ref.invalidate(serverStatusProvider);
      _ref.invalidate(setupStatusProvider);
      _ref.invalidate(systemStatusProvider);
      _ref.invalidate(systemDiagnosticsProvider);
      _ref.invalidate(updateStatusProvider);
      _ref.invalidate(libraryProvider);
      _ref.invalidate(gameSourcesProvider);
      _ref.invalidate(serverStatusPollingProvider);
      return;
    }

    refresh();
    state = state.copyWith(
      error: _deployErrorMessage(
        result.errorKind ?? DeployErrorKind.unknown,
        result.error,
      ),
      installLog: List.unmodifiable(log),
      deployErrorKind: result.errorKind,
    );
  }

  /// Returns a user-friendly error message based on the error kind.
  static String _deployErrorMessage(DeployErrorKind kind, String? raw) {
    return switch (kind) {
      DeployErrorKind.uacDenied =>
        'Administrator access was denied. Approve the UAC prompt to install the server.',
      DeployErrorKind.buildNotFound =>
        'Build output not found — run the C++ build (cmake: build) first.',
      DeployErrorKind.copyFailed =>
        'File copy failed during deployment. Check that the build directory is accessible.\n\nDetail: ${raw ?? "unknown"}',
      DeployErrorKind.serviceError =>
        'Windows Service registration or start failed. Try running again with administrator rights.\n\nDetail: ${raw ?? "unknown"}',
      DeployErrorKind.unknown => raw ?? 'Deploy failed with an unknown error.',
    };
  }

  /// Refresh the installed/not-installed state.
  void refresh() {
    if (kIsWeb) return;
    if (_manager.isInstalled) {
      state = state.copyWith(
        state: _manager.isRunning
            ? ServerProcessState.running
            : ServerProcessState.stopped,
        installPath: _manager.installPath,
        error: null,
      );
    } else {
      state = state.copyWith(
        state: ServerProcessState.notInstalled,
        error: null,
      );
    }
  }

  Future<bool> _bootstrapLocalProfile(String serverUrl) async {
    final auth = _ref.read(authProvider);
    final token = await _ref
        .read(authProvider.notifier)
        .bootstrapServerSession(serverUrl: serverUrl);
    if (token == null || token.isEmpty) return false;

    await _ref
        .read(serverProfilesProvider.notifier)
        .upsertAndActivate(
          url: serverUrl,
          username: auth.username ?? 'admin',
          token: token,
          name: 'Local Server',
        );
    return true;
  }

  void _refreshServerData() {
    // Refresh the public-endpoint status first (no auth needed — dashboard sees this immediately)
    _ref.read(serverStatusProvider.notifier).refresh();
    _ref.invalidate(setupStatusProvider);
    _ref.invalidate(systemStatusProvider);
    _ref.invalidate(systemDiagnosticsProvider);
    _ref.invalidate(updateStatusProvider);
    _ref.invalidate(libraryProvider);
    _ref.invalidate(gameSourcesProvider);
    _ref.invalidate(serverStatusPollingProvider);
    _ref.read(streamConfigProvider.notifier).load();

    // Schedule a second invalidation after a short delay to catch cases where
    // the auth token was just written and providers need to re-read it.
    Future<void>.delayed(const Duration(seconds: 2)).then((_) {
      if (mounted) {
        _ref.invalidate(serverStatusPollingProvider);
        _ref.invalidate(setupStatusProvider);
      }
    });
  }

  Future<bool> _waitForServerApi(String serverUrl) async {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 3),
        receiveTimeout: const Duration(seconds: 3),
        validateStatus: (_) => true,
      ),
    );
    configureSelfSignedCertTrust(dio);

    try {
      // Allow up to 30 attempts (30s) — clean installs with driver setup need more time.
      for (var attempt = 0; attempt < 30; attempt++) {
        try {
          final response = await dio.get<void>('$serverUrl/api/auth/status');
          if ((response.statusCode ?? 0) < 500) return true;
        } catch (_) {
          // Retry until the Windows service finishes binding the API port.
        }
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      return false;
    } finally {
      dio.close();
    }
  }

  bool _isLocalServerUrl(String? url) =>
      url != null &&
      (url.contains('localhost') ||
          url.contains('127.0.0.1') ||
          url.contains('::1'));
}
