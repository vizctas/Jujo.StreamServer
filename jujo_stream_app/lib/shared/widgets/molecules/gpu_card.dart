import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/metrics_api.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

/// A card displaying GPU information: name, temperature, VRAM usage, utilization.
///
/// Shows a "Not available" state when GPU metrics are not reported by the server.
class GpuInfoCard extends StatelessWidget {
  const GpuInfoCard({
    super.key,
    required this.gpu,
    this.accentColor,
  });

  /// GPU metrics from the system metrics API.
  final GpuMetrics gpu;

  /// Optional accent color for the card. Defaults to tertiary.
  final Color? accentColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final accent = accentColor ?? colorScheme.tertiary;

    if (!gpu.available) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: colorScheme.outlineVariant),
        ),
        child: Row(
          children: [
            Icon(LucideIcons.monitor, size: 20, color: colorScheme.onSurfaceVariant),
            const SizedBox(width: AppSpacing.md),
            Text(
              'GPU metrics not available',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    final tempColor = _temperatureColor(gpu.temperatureC);
    final vramPercent = (gpu.vramUsedBytes != null && gpu.vramTotalBytes != null && gpu.vramTotalBytes! > 0)
        ? gpu.vramUsedBytes! / gpu.vramTotalBytes!
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
        color: accent.withValues(alpha: 0.03),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: GPU icon + name
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(LucideIcons.cpu, size: 16, color: accent),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  gpu.name ?? 'GPU',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              // Temperature badge
              if (gpu.temperatureC != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: tempColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.thermometer, size: 12, color: tempColor),
                      const SizedBox(width: 3),
                      Text(
                        '${gpu.temperatureC}°C',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: tempColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Utilization + VRAM row
          Row(
            children: [
              // GPU Usage
              Expanded(
                child: _MiniMetric(
                  label: 'Usage',
                  value: gpu.usagePercent != null ? '${gpu.usagePercent}%' : '—',
                  progress: gpu.usagePercent != null ? gpu.usagePercent! / 100.0 : null,
                  color: accent,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // VRAM
              Expanded(
                child: _MiniMetric(
                  label: 'VRAM',
                  value: gpu.vramUsedGb != null && gpu.vramTotalGb != null
                      ? '${gpu.vramUsedGb!.toStringAsFixed(1)} / ${gpu.vramTotalGb!.toStringAsFixed(1)} GB'
                      : '—',
                  progress: vramPercent > 0 ? vramPercent : null,
                  color: colorScheme.secondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _temperatureColor(int? temp) {
    if (temp == null) return Colors.grey;
    if (temp < 60) return const Color(0xFF22C55E); // green
    if (temp < 80) return const Color(0xFFF59E0B); // amber
    return const Color(0xFFEF4444); // red
  }
}

class _MiniMetric extends StatelessWidget {
  const _MiniMetric({
    required this.label,
    required this.value,
    this.progress,
    required this.color,
  });

  final String label;
  final String value;
  final double? progress;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        if (progress != null) ...[
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress!.clamp(0.0, 1.0),
              minHeight: 3,
              backgroundColor: colorScheme.outlineVariant.withValues(alpha: 0.4),
              color: color,
            ),
          ),
        ],
      ],
    );
  }
}
