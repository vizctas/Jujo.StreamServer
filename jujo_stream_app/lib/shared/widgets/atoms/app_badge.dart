import 'package:flutter/material.dart';

import 'package:jujo_stream_app/core/theme/colors.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Semantic badge/tag widget for status indicators.
enum AppBadgeVariant { success, warning, error, info, neutral }

class AppBadge extends StatelessWidget {
  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.neutral,
    this.icon,
  });

  final String label;
  final AppBadgeVariant variant;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final colors = _colors(context);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: colors.$2),
            const SizedBox(width: AppSpacing.xs),
          ],
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: colors.$2,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }

  (Color, Color) _colors(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return switch (variant) {
      AppBadgeVariant.success => (
          AppColors.success.withValues(alpha: isDark ? 0.15 : 0.1),
          isDark ? AppColors.success : AppColors.successMuted,
        ),
      AppBadgeVariant.warning => (
          AppColors.warning.withValues(alpha: isDark ? 0.15 : 0.1),
          isDark ? AppColors.warning : AppColors.warningMuted,
        ),
      AppBadgeVariant.error => (
          AppColors.error.withValues(alpha: isDark ? 0.15 : 0.1),
          isDark ? AppColors.error : AppColors.errorMuted,
        ),
      AppBadgeVariant.info => (
          AppColors.info.withValues(alpha: isDark ? 0.15 : 0.1),
          isDark ? AppColors.info : AppColors.infoMuted,
        ),
      AppBadgeVariant.neutral => (
          (isDark ? AppColors.neutral800 : AppColors.neutral200),
          (isDark ? AppColors.neutral300 : AppColors.neutral600),
        ),
    };
  }
}
