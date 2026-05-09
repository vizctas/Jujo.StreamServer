import 'dart:async';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

class MetricsSparklineCard extends ConsumerStatefulWidget {
  const MetricsSparklineCard({super.key});
  @override
  ConsumerState<MetricsSparklineCard> createState() => _MetricsSparklineCardState();
}

class _MetricsSparklineCardState extends ConsumerState<MetricsSparklineCard> {
  static const _maxDataPoints = 30;
  static const _sampleInterval = Duration(seconds: 10);

  final _dataPoints = <double>[];
  Timer? _timer;
  int _peakStreams = 0;
  int _currentStreams = 0;
  int _uptimeSeconds = 0;

  ApiClient? _client;

  @override
  void initState() {
    super.initState();
    _sample();
    _timer = Timer.periodic(_sampleInterval, (_) => _sample());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _sample() async {
    try {
      final authNotifier = ref.read(authProvider.notifier);
      final serverUrl = ref.read(authProvider).serverUrl ?? '';
      final token = ref.read(authProvider).token ?? '';
      if (serverUrl.isEmpty || token.isEmpty) return;
      // Reuse client; rebuild only if base URL changed.
      _client ??= ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
      final response = await _client!.get<Map<String, dynamic>>('/api/server/status');
      if (response.statusCode == 200 && response.data != null) {
        final streaming = response.data!['streaming'] as Map<String, dynamic>? ?? {};
        final server = response.data!['server'] as Map<String, dynamic>? ?? {};
        final active = (streaming['rtspSessionCount'] as int? ?? 0) +
            ((streaming['webrtcActive'] as bool? ?? false) ? 1 : 0);
        final uptime = server['uptimeSeconds'] as int? ?? 0;

        setState(() {
          _currentStreams = active;
          _uptimeSeconds = uptime;
          if (active > _peakStreams) _peakStreams = active;
          _dataPoints.add(active.toDouble());
          if (_dataPoints.length > _maxDataPoints) _dataPoints.removeAt(0);
        });
      }
    } catch (_) {}
  }

  String _formatUptime(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    if (h > 24) return '${h ~/ 24}d ${h % 24}h';
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(LucideIcons.activity, size: 16, color: cs.primary),
              const SizedBox(width: AppSpacing.sm),
              Text('Activity', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
              const Spacer(),
              // Live indicator
              if (_currentStreams > 0) ...[
                Container(
                  width: 6, height: 6,
                  decoration: const BoxDecoration(color: Color(0xFF22C55E), shape: BoxShape.circle),
                ),
                const SizedBox(width: 4),
                Text('$_currentStreams active', style: theme.textTheme.labelSmall?.copyWith(color: const Color(0xFF22C55E), fontWeight: FontWeight.w600)),
              ] else
                Text('Idle', style: theme.textTheme.labelSmall?.copyWith(color: cs.onSurfaceVariant)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Sparkline chart
          SizedBox(
            height: 60,
            child: _dataPoints.length < 2
                ? Center(child: Text('Collecting data...', style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant)))
                : LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      clipData: const FlClipData.all(),
                      lineTouchData: LineTouchData(
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipColor: (_) => cs.surfaceContainerHighest,
                          getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
                            '${s.y.toInt()} stream${s.y.toInt() != 1 ? 's' : ''}',
                            theme.textTheme.labelSmall!.copyWith(color: cs.onSurface),
                          )).toList(),
                        ),
                      ),
                      minY: 0,
                      maxY: (_peakStreams + 1).toDouble(),
                      lineBarsData: [
                        LineChartBarData(
                          spots: List.generate(
                            _dataPoints.length,
                            (i) => FlSpot(i.toDouble(), _dataPoints[i]),
                          ),
                          isCurved: true,
                          curveSmoothness: 0.3,
                          color: cs.primary,
                          barWidth: 2,
                          isStrokeCapRound: true,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                cs.primary.withValues(alpha: 0.2),
                                cs.primary.withValues(alpha: 0.0),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                  ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Bottom metrics row
          Row(
            children: [
              _MiniMetric(icon: LucideIcons.clock, label: 'Uptime', value: _formatUptime(_uptimeSeconds)),
              const SizedBox(width: AppSpacing.lg),
              _MiniMetric(icon: LucideIcons.trendingUp, label: 'Peak', value: '$_peakStreams'),
              const SizedBox(width: AppSpacing.lg),
              _MiniMetric(icon: LucideIcons.radio, label: 'Now', value: '$_currentStreams'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  const _MiniMetric({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: cs.onSurfaceVariant),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: theme.textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w700)),
            Text(label, style: theme.textTheme.labelSmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 9)),
          ],
        ),
      ],
    );
  }
}
