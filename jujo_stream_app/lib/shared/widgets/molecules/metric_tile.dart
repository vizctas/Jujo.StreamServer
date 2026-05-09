import 'package:flutter/material.dart';

import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Molecule: Metric tile for dashboard KPIs.
///
/// [accentColor] allows each tile to use a distinct color from the palette,
/// preventing the monotone look of using only primary everywhere.
class MetricTile extends StatelessWidget {
  const MetricTile({
    super.key,
    required this.value,
    required this.label,
    this.icon,
    this.accentColor,
    this.trend,
    this.trendPositive,
  });

  final String value;
  final String label;
  final IconData? icon;
  /// Optional accent color for the icon badge. Falls back to primary.
  final Color? accentColor;
  final String? trend;
  final bool? trendPositive;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    // Use accent color for icon — varies by tile for visual interest
    final iconColor = accentColor ?? colorScheme.primary;
    final iconBgColor = iconColor.withValues(alpha: isDark ? 0.12 : 0.08);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: isDark
            ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.5)
            : colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: isDark ? colorScheme.outlineVariant : colorScheme.outline.withValues(alpha: 0.12),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: colorScheme.shadow.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
            ),
          Text(
            value,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          if (trend != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: 2,
              ),
              decoration: BoxDecoration(
                color: (trendPositive == true
                        ? colorScheme.primary
                        : trendPositive == false
                            ? colorScheme.error
                            : colorScheme.onSurfaceVariant)
                    .withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Text(
                trend!,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: trendPositive == true
                      ? colorScheme.primary
                      : trendPositive == false
                          ? colorScheme.error
                          : colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
