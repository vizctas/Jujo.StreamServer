import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/metrics_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Real-time system metrics card showing CPU, GPU, Memory, and Network.
/// Polls /api/system/metrics every 3s via [systemMetricsStreamProvider].
class SystemMetricsCard extends ConsumerWidget {
  const SystemMetricsCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(metricsHistoryProvider);
    final latest = ref.watch(systemMetricsStreamProvider);
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final metrics = latest.valueOrNull ?? (history.isNotEmpty ? history.last : null);

    if (metrics == null) {
      return _buildShell(
        cs: cs,
        theme: theme,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Text(
              'Collecting metrics...',
              style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
            ),
          ),
        ),
      );
    }

    return _buildShell(
      cs: cs,
      theme: theme,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(LucideIcons.gauge, size: 16, color: cs.primary),
              const SizedBox(width: AppSpacing.sm),
              Text('System', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
              const Spacer(),
              if (metrics.gpu.available && metrics.gpu.temperatureC != null)
                _TempBadge(label: 'GPU', tempC: metrics.gpu.temperatureC!, cs: cs, theme: theme),
              if (metrics.cpu.temperatureC != null) ...[
                const SizedBox(width: AppSpacing.sm),
                _TempBadge(label: 'CPU', tempC: metrics.cpu.temperatureC!, cs: cs, theme: theme),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Gauge row
          Row(
            children: [
              Expanded(
                child: _GaugeColumn(
                  icon: LucideIcons.cpu,
                  label: 'CPU',
                  percent: metrics.cpu.usagePercent,
                  subtitle: '${metrics.cpu.usagePercent.toStringAsFixed(0)}%',
                  cs: cs,
                  theme: theme,
                ),
              ),
              Expanded(
                child: _GaugeColumn(
                  icon: LucideIcons.memoryStick,
                  label: 'RAM',
                  percent: metrics.memory.loadPercent.toDouble(),
                  subtitle: '${metrics.memory.usedGb.toStringAsFixed(1)}/${metrics.memory.totalGb.toStringAsFixed(0)} GB',
                  cs: cs,
                  theme: theme,
                ),
              ),
              if (metrics.gpu.available && metrics.gpu.usagePercent != null)
                Expanded(
                  child: _GaugeColumn(
                    icon: LucideIcons.monitor,
                    label: 'GPU',
                    percent: metrics.gpu.usagePercent!.toDouble(),
                    subtitle: metrics.gpu.vramUsedGb != null
                        ? '${metrics.gpu.vramUsedGb!.toStringAsFixed(1)}/${metrics.gpu.vramTotalGb?.toStringAsFixed(0) ?? '?'} GB'
                        : '${metrics.gpu.usagePercent}%',
                    cs: cs,
                    theme: theme,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // CPU sparkline
          if (history.length >= 2) ...[
            SizedBox(
              height: 40,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  clipData: const FlClipData.all(),
                  lineTouchData: const LineTouchData(enabled: false),
                  minY: 0,
                  maxY: 100,
                  lineBarsData: [
                    _sparkline(
                      history.map((m) => m.cpu.usagePercent).toList(),
                      cs.primary,
                    ),
                    if (metrics.gpu.available)
                      _sparkline(
                        history.map((m) => m.gpu.usagePercent?.toDouble() ?? 0).toList(),
                        cs.tertiary,
                      ),
                  ],
                ),
                duration: const Duration(milliseconds: 200),
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                _LegendDot(color: cs.primary, label: 'CPU'),
                if (metrics.gpu.available) ...[
                  const SizedBox(width: AppSpacing.md),
                  _LegendDot(color: cs.tertiary, label: 'GPU'),
                ],
              ],
            ),
          ],

          // Network throughput
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Icon(LucideIcons.arrowUpDown, size: 12, color: cs.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(
                '↑ ${_formatBytes(metrics.network.bytesSentTotal)}  ↓ ${_formatBytes(metrics.network.bytesRecvTotal)}',
                style: theme.textTheme.labelSmall?.copyWith(color: cs.onSurfaceVariant),
              ),
              const Spacer(),
              Text(
                'Server: ${metrics.memory.processWorkingSetMb.toStringAsFixed(0)} MB',
                style: theme.textTheme.labelSmall?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShell({required ColorScheme cs, required ThemeData theme, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: child,
    );
  }

  LineChartBarData _sparkline(List<double> data, Color color) {
    return LineChartBarData(
      spots: List.generate(data.length, (i) => FlSpot(i.toDouble(), data[i])),
      isCurved: true,
      curveSmoothness: 0.3,
      color: color,
      barWidth: 1.5,
      isStrokeCapRound: true,
      dotData: const FlDotData(show: false),
      belowBarData: BarAreaData(
        show: true,
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.0)],
        ),
      ),
    );
  }

  static String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(0)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }
}

class _GaugeColumn extends StatelessWidget {
  const _GaugeColumn({
    required this.icon,
    required this.label,
    required this.percent,
    required this.subtitle,
    required this.cs,
    required this.theme,
  });

  final IconData icon;
  final String label;
  final double percent;
  final String subtitle;
  final ColorScheme cs;
  final ThemeData theme;

  Color get _gaugeColor {
    if (percent >= 90) return const Color(0xFFEF4444);
    if (percent >= 70) return const Color(0xFFF59E0B);
    return const Color(0xFF22C55E);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 44,
              height: 44,
              child: CircularProgressIndicator(
                value: (percent / 100).clamp(0, 1),
                strokeWidth: 4,
                backgroundColor: cs.outlineVariant.withValues(alpha: 0.3),
                valueColor: AlwaysStoppedAnimation(_gaugeColor),
              ),
            ),
            Icon(icon, size: 16, color: cs.onSurfaceVariant),
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w600, fontSize: 10)),
        Text(subtitle, style: theme.textTheme.labelSmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 9)),
      ],
    );
  }
}

class _TempBadge extends StatelessWidget {
  const _TempBadge({required this.label, required this.tempC, required this.cs, required this.theme});

  final String label;
  final int tempC;
  final ColorScheme cs;
  final ThemeData theme;

  Color get _color {
    if (tempC >= 85) return const Color(0xFFEF4444);
    if (tempC >= 70) return const Color(0xFFF59E0B);
    return cs.onSurfaceVariant;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(LucideIcons.thermometer, size: 10, color: _color),
        const SizedBox(width: 2),
        Text(
          '$label $tempC°',
          style: theme.textTheme.labelSmall?.copyWith(color: _color, fontSize: 9, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _LegendDot extends StatelessWidget {
  const _LegendDot({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 3),
        Text(label, style: theme.textTheme.labelSmall?.copyWith(fontSize: 9)),
      ],
    );
  }
}
