import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/app_badge.dart';

/// Molecule: Status chip with icon + label + badge.
enum StatusChipState { ready, warning, error, pending, unknown }

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    required this.state,
    this.onTap,
  });

  final String label;
  final StatusChipState state;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final widget = Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon, size: 16, color: _iconColor(context)),
          const SizedBox(width: AppSpacing.sm),
          Flexible(
            child: Text(
              label,
              style: theme.textTheme.bodySmall,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          AppBadge(label: _badgeLabel, variant: _badgeVariant),
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: widget,
      );
    }

    return widget;
  }

  IconData get _icon => switch (state) {
        StatusChipState.ready => LucideIcons.checkCircle,
        StatusChipState.warning => LucideIcons.alertTriangle,
        StatusChipState.error => LucideIcons.xCircle,
        StatusChipState.pending => LucideIcons.circle,
        StatusChipState.unknown => LucideIcons.helpCircle,
      };

  Color _iconColor(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return switch (state) {
      StatusChipState.ready => const Color(0xFF22C55E),
      StatusChipState.warning => const Color(0xFFF59E0B),
      StatusChipState.error => scheme.error,
      StatusChipState.pending => scheme.onSurfaceVariant,
      StatusChipState.unknown => scheme.onSurfaceVariant,
    };
  }

  String get _badgeLabel => switch (state) {
        StatusChipState.ready => 'Ready',
        StatusChipState.warning => 'Review',
        StatusChipState.error => 'Error',
        StatusChipState.pending => 'Pending',
        StatusChipState.unknown => 'Unknown',
      };

  AppBadgeVariant get _badgeVariant => switch (state) {
        StatusChipState.ready => AppBadgeVariant.success,
        StatusChipState.warning => AppBadgeVariant.warning,
        StatusChipState.error => AppBadgeVariant.error,
        StatusChipState.pending => AppBadgeVariant.neutral,
        StatusChipState.unknown => AppBadgeVariant.neutral,
      };
}
