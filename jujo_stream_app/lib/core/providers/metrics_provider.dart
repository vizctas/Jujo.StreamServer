import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/metrics_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Provides a [MetricsApi] instance bound to the current server connection.
final metricsApiProvider = Provider<MetricsApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return MetricsApi(client: client);
});

/// Streams [SystemMetricsDto] every 3 seconds for real-time dashboard display.
/// Automatically disposes when no widget is listening.
final systemMetricsStreamProvider =
    StreamProvider.autoDispose<SystemMetricsDto?>((ref) {
  final api = ref.watch(metricsApiProvider);

  return Stream.periodic(const Duration(seconds: 3), (_) => null)
      .asyncMap((_) => api.getMetrics())
      .where((m) => m != null);
});

/// Holds the last N metrics snapshots for sparkline rendering.
/// Keeps up to 30 data points (90 seconds of history at 3s intervals).
class MetricsHistoryNotifier extends StateNotifier<List<SystemMetricsDto>> {
  MetricsHistoryNotifier() : super([]);

  static const maxPoints = 30;

  void add(SystemMetricsDto metrics) {
    state = [...state, metrics].length > maxPoints
        ? [...state, metrics].sublist(state.length + 1 - maxPoints)
        : [...state, metrics];
  }

  void clear() => state = [];
}

final metricsHistoryProvider =
    StateNotifierProvider.autoDispose<MetricsHistoryNotifier, List<SystemMetricsDto>>(
  (ref) {
    final notifier = MetricsHistoryNotifier();

    // Listen to the stream and accumulate history
    ref.listen<AsyncValue<SystemMetricsDto?>>(systemMetricsStreamProvider,
        (_, next) {
      final data = next.valueOrNull;
      if (data != null) {
        notifier.add(data);
      }
    });

    return notifier;
  },
);
