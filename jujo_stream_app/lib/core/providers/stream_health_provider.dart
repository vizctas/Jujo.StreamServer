import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/stream_health_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

// ─── API Provider ─────────────────────────────────────────────────────────────

/// Provides a [StreamHealthApi] instance bound to the current server connection.
final streamHealthApiProvider = Provider<StreamHealthApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return StreamHealthApi(client: client);
});

// ─── Stream Health Polling ────────────────────────────────────────────────────

/// Streams [StreamHealthDto] every 3 seconds for adaptive bitrate monitoring.
/// Only active when a widget is listening (autoDispose).
final streamHealthStreamProvider =
    StreamProvider.autoDispose<StreamHealthDto?>((ref) {
  final api = ref.watch(streamHealthApiProvider);

  return Stream.periodic(const Duration(seconds: 3), (_) => null)
      .asyncMap((_) => api.getHealth())
      .where((h) => h != null);
});

// ─── Health History ───────────────────────────────────────────────────────────

/// Holds the last N health snapshots for trend analysis.
/// Keeps up to 20 data points (60 seconds of history at 3s intervals).
class StreamHealthHistoryNotifier extends StateNotifier<List<StreamHealthDto>> {
  StreamHealthHistoryNotifier() : super([]);

  static const maxPoints = 20;

  void add(StreamHealthDto health) {
    state = [...state, health].length > maxPoints
        ? [...state, health].sublist(state.length + 1 - maxPoints)
        : [...state, health];
  }

  void clear() => state = [];
}

final streamHealthHistoryProvider = StateNotifierProvider.autoDispose<
    StreamHealthHistoryNotifier, List<StreamHealthDto>>(
  (ref) {
    final notifier = StreamHealthHistoryNotifier();

    ref.listen<AsyncValue<StreamHealthDto?>>(streamHealthStreamProvider,
        (_, next) {
      final data = next.valueOrNull;
      if (data != null) {
        notifier.add(data);
      }
    });

    return notifier;
  },
);

// ─── Derived Convenience Providers ────────────────────────────────────────────

/// Current aggregate health score (0-100). 100 when no sessions active.
final streamHealthScoreProvider = Provider.autoDispose<int>((ref) {
  final health = ref.watch(streamHealthStreamProvider).valueOrNull;
  return health?.healthScore ?? 100;
});

/// Whether any streaming session is currently active.
final isStreamingProvider = Provider.autoDispose<bool>((ref) {
  final health = ref.watch(streamHealthStreamProvider).valueOrNull;
  return health?.hasActiveSessions ?? false;
});

/// Whether the stream is currently degraded (score < 70).
final isStreamDegradedProvider = Provider.autoDispose<bool>((ref) {
  final health = ref.watch(streamHealthStreamProvider).valueOrNull;
  return health?.isDegraded ?? false;
});
