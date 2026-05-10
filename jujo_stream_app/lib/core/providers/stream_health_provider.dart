import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/stream_health_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Polls stream health every 3 seconds.
///
/// Returns null when server is unreachable or no streaming data available.
/// Used by the dashboard to show live stream health badge + pulse dot.
final streamHealthProvider =
    StreamProvider.autoDispose<StreamHealthDto?>((ref) async* {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final token = ref.watch(authProvider.select((s) => s.token)) ?? '';

  if (serverUrl.isEmpty || token.isEmpty) {
    yield null;
    return;
  }

  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  final api = StreamHealthApi(client: client);

  // Initial fetch
  yield await api.getHealth();

  // Poll every 3 seconds
  await for (final _ in Stream.periodic(const Duration(seconds: 3))) {
    yield await api.getHealth();
  }
});

/// Derived: whether any stream is currently active.
final isStreamingProvider = Provider.autoDispose<bool>((ref) {
  final health = ref.watch(streamHealthProvider).valueOrNull;
  return health != null && health.hasActiveSessions;
});

/// Derived: overall health score (0-100). Returns 100 when not streaming.
final streamHealthScoreProvider = Provider.autoDispose<int>((ref) {
  final health = ref.watch(streamHealthProvider).valueOrNull;
  if (health == null || !health.hasActiveSessions) return 100;
  return health.healthScore;
});
