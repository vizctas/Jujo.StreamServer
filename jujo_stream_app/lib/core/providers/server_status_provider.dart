import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';

// ─── Data model ───────────────────────────────────────────────────────────────

enum ServerReachability { unknown, online, offline }

class ServerStatus {
  const ServerStatus({
    this.reachability = ServerReachability.unknown,
    this.lastChecked,
  });

  final ServerReachability reachability;
  final DateTime? lastChecked;

  bool get isOnline => reachability == ServerReachability.online;
  bool get isOffline => reachability == ServerReachability.offline;
  bool get isUnknown => reachability == ServerReachability.unknown;

  ServerStatus copyWith({
    ServerReachability? reachability,
    DateTime? lastChecked,
  }) {
    return ServerStatus(
      reachability: reachability ?? this.reachability,
      lastChecked: lastChecked ?? this.lastChecked,
    );
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final serverStatusProvider =
    StateNotifierProvider<ServerStatusNotifier, ServerStatus>((ref) {
  return ServerStatusNotifier(ref);
});

// ─── Notifier ─────────────────────────────────────────────────────────────────

class ServerStatusNotifier extends StateNotifier<ServerStatus> {
  ServerStatusNotifier(this._ref) : super(const ServerStatus()) {
    // Listen for server URL changes and re-probe immediately.
    _ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.serverUrl != next.serverUrl) {
        refresh();
      }
    });
    // Initial probe.
    _schedulePolling();
  }

  final Ref _ref;
  Timer? _timer;
  static const _pollInterval = Duration(seconds: 30);

  /// Public: manually trigger a connectivity probe.
  void refresh() {
    _probe();
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  void _schedulePolling() {
    _probe();
    _timer = Timer.periodic(_pollInterval, (_) => _probe());
  }

  Future<void> _probe() async {
    final serverUrl = _ref.read(authProvider).serverUrl;
    if (serverUrl == null || serverUrl.isEmpty) {
      if (mounted) state = const ServerStatus(reachability: ServerReachability.offline);
      return;
    }

    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 5),
        // Accept any HTTP status code — a 401 still means the server is up.
        validateStatus: (_) => true,
      ),
    );

    try {
      await dio.get<void>('$serverUrl/api/config');
      if (mounted) {
        state = ServerStatus(
          reachability: ServerReachability.online,
          lastChecked: DateTime.now(),
        );
      }
    } on DioException {
      if (mounted) {
        state = ServerStatus(
          reachability: ServerReachability.offline,
          lastChecked: DateTime.now(),
        );
      }
    } finally {
      dio.close();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
