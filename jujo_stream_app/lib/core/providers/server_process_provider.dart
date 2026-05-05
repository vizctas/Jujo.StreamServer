import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
import 'package:jujo_stream_app/core/services/server_process_manager.dart';

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
  });

  final ServerProcessState state;
  final String? installPath;
  final String? error;

  /// Download progress 0.0–1.0 during [ServerProcessState.installing].
  final double? installProgress;

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
  }) {
    return ServerProcessStatus(
      state: state ?? this.state,
      installPath: installPath ?? this.installPath,
      error: error,
      installProgress: installProgress ?? this.installProgress,
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
      state = state.copyWith(
        state: ServerProcessState.stopped,
        installPath: _manager.installPath,
      );
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
    // If no server URL is configured yet, default to localhost.
    final authState = _ref.read(authProvider);
    if (authState.serverUrl == null || authState.serverUrl!.isEmpty) {
      await _ref
          .read(authProvider.notifier)
          .setServerUrl('https://localhost:47990');
    }
    // Give the server a few seconds to initialise, then re-probe.
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      _ref.read(serverStatusProvider.notifier).refresh();
    }
  }

  Future<void> stop() async {
    if (state.isBusy || !state.isRunning) return;

    state = state.copyWith(state: ServerProcessState.stopping);

    final serverUrl =
        _ref.read(authProvider).serverUrl ?? 'https://localhost:47990';
    await _manager.stop(serverUrl);
    state = state.copyWith(state: ServerProcessState.stopped);
  }

  /// Download and silently install the server backend.
  Future<void> install() async {
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
      // Re-scan to pick up the newly installed executable.
      refresh();
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
  /// After completion, auto-configures the active server URL to localhost:47990.
  Future<void> deploy({void Function(String msg)? onProgress}) async {
    if (state.isBusy) return;

    state = ServerProcessStatus(
      state: ServerProcessState.installing,
      installProgress: 0.0,
    );

    final service = ServerDeployService();

    if (!service.canDeploy) {
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        error:
            'Server build files not found. Build the C++ project first '
            '(cmake: build), then try again.',
      );
      return;
    }

    int step = 0;
    const steps = 3; // copy, install svc, start svc

    final result = await service.deploy(
      onProgress: (msg) {
        step++;
        onProgress?.call(msg);
        if (mounted) {
          state = state.copyWith(
            installProgress: (step / steps).clamp(0.0, 1.0),
          );
        }
      },
    );

    if (!mounted) return;

    if (result.success) {
      // Auto-configure URL to localhost so the app connects immediately
      await _ref
          .read(authProvider.notifier)
          .setServerUrl('https://localhost:47990');

      // Give the service a few seconds to fully start
      await Future<void>.delayed(const Duration(seconds: 4));

      refresh();
      if (mounted) _ref.read(serverStatusProvider.notifier).refresh();
    } else {
      state = ServerProcessStatus(
        state: ServerProcessState.notInstalled,
        error: result.error ?? 'Deploy failed',
      );
    }
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
}
