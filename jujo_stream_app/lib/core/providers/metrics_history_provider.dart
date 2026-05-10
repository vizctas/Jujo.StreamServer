import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/metrics_provider.dart';

// ─── Sparkline-Ready Derived Providers ────────────────────────────────────────
//
// These providers transform the raw `metricsHistoryProvider` (List<SystemMetricsDto>)
// into simple List<double> arrays suitable for SparklineChart rendering.
//
// Each returns up to 30 data points (90s of history at 3s polling).

/// CPU usage % history (0-100).
final cpuHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return history.map((m) => m.cpu.usagePercent).toList();
});

/// Memory load % history (0-100).
final memoryHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return history.map((m) => m.memory.loadPercent.toDouble()).toList();
});

/// GPU usage % history (0-100).
final gpuUsageHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return history.map((m) => (m.gpu.usagePercent ?? 0).toDouble()).toList();
});

/// GPU temperature °C history.
final gpuTempHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return history.map((m) => (m.gpu.temperatureC ?? 0).toDouble()).toList();
});

/// Network send rate (bytes/sec) — computed from consecutive cumulative deltas.
final networkSentRateHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return _computeRates(history.map((m) => m.network.bytesSentTotal).toList());
});

/// Network receive rate (bytes/sec) — computed from consecutive cumulative deltas.
final networkRecvRateHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final history = ref.watch(metricsHistoryProvider);
  return _computeRates(history.map((m) => m.network.bytesRecvTotal).toList());
});

/// Combined network throughput (sent + recv bytes/sec).
final networkTotalRateHistoryProvider = Provider.autoDispose<List<double>>((ref) {
  final sent = ref.watch(networkSentRateHistoryProvider);
  final recv = ref.watch(networkRecvRateHistoryProvider);
  if (sent.isEmpty) return [];
  final len = sent.length < recv.length ? sent.length : recv.length;
  return List.generate(len, (i) => sent[i] + recv[i]);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// Converts cumulative byte counters into per-interval rates (bytes/sec).
/// Assumes 3-second polling interval.
List<double> _computeRates(List<int> cumulativeValues) {
  if (cumulativeValues.length < 2) return [];
  const intervalSec = 3.0;
  final rates = <double>[];
  for (int i = 1; i < cumulativeValues.length; i++) {
    final delta = cumulativeValues[i] - cumulativeValues[i - 1];
    rates.add((delta / intervalSec).clamp(0, double.infinity));
  }
  return rates;
}
