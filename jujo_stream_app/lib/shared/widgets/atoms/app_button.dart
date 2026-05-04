import 'package:flutter/material.dart';

import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

/// Standardized button variants for the Jujo.Stream design system.
/// Enforces consistent sizing, padding, and accessibility (min 48x48 touch target).
enum AppButtonVariant { filled, outlined, text, tonal }

enum AppButtonSize { small, medium, large }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.variant = AppButtonVariant.filled,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.isDestructive = false,
    this.expanded = false,
    this.semanticLabel,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final bool isDestructive;
  final bool expanded;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final effectiveOnPressed = isLoading ? null : onPressed;
    final child = _buildChild(context);

    Widget button = switch (variant) {
      AppButtonVariant.filled => FilledButton(
          onPressed: effectiveOnPressed,
          style: _style(context),
          child: child,
        ),
      AppButtonVariant.outlined => OutlinedButton(
          onPressed: effectiveOnPressed,
          style: _style(context),
          child: child,
        ),
      AppButtonVariant.text => TextButton(
          onPressed: effectiveOnPressed,
          style: _style(context),
          child: child,
        ),
      AppButtonVariant.tonal => FilledButton.tonal(
          onPressed: effectiveOnPressed,
          style: _style(context),
          child: child,
        ),
    };

    if (expanded) {
      button = SizedBox(width: double.infinity, child: button);
    }

    return Semantics(
      label: semanticLabel ?? label,
      button: true,
      enabled: onPressed != null && !isLoading,
      child: button,
    );
  }

  Widget _buildChild(BuildContext context) {
    if (isLoading) {
      return SizedBox(
        width: _iconSize,
        height: _iconSize,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: _foregroundColor(context),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: _iconSize),
          const SizedBox(width: AppSpacing.sm),
          Text(label),
        ],
      );
    }

    return Text(label);
  }

  double get _iconSize => switch (size) {
        AppButtonSize.small => 16.0,
        AppButtonSize.medium => 18.0,
        AppButtonSize.large => 20.0,
      };

  EdgeInsets get _padding => switch (size) {
        AppButtonSize.small => const EdgeInsets.symmetric(
            horizontal: AppSpacing.base, vertical: AppSpacing.sm),
        AppButtonSize.medium => const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl, vertical: AppSpacing.md),
        AppButtonSize.large => const EdgeInsets.symmetric(
            horizontal: AppSpacing.xxl, vertical: AppSpacing.base),
      };

  Size get _minimumSize => switch (size) {
        AppButtonSize.small => const Size(36, 36),
        AppButtonSize.medium => const Size(48, 48),
        AppButtonSize.large => const Size(56, 56),
      };

  Color? _foregroundColor(BuildContext context) {
    if (isDestructive) {
      return Theme.of(context).colorScheme.error;
    }
    return null;
  }

  ButtonStyle? _style(BuildContext context) {
    return ButtonStyle(
      padding: WidgetStatePropertyAll(_padding),
      minimumSize: WidgetStatePropertyAll(_minimumSize),
      foregroundColor: isDestructive
          ? WidgetStatePropertyAll(Theme.of(context).colorScheme.error)
          : null,
      backgroundColor: isDestructive && variant == AppButtonVariant.filled
          ? WidgetStatePropertyAll(Theme.of(context).colorScheme.error)
          : null,
    );
  }
}

/// Icon-only button with enforced 48x48 minimum touch target.
class AppIconButton extends StatelessWidget {
  const AppIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    this.size = 24.0,
    this.isDestructive = false,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final String tooltip;
  final double size;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final color = isDestructive
        ? Theme.of(context).colorScheme.error
        : Theme.of(context).colorScheme.onSurface;

    return Tooltip(
      message: tooltip,
      child: IconButton(
        icon: Icon(icon, size: size, color: color),
        onPressed: onPressed,
        constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
        padding: const EdgeInsets.all(AppSpacing.md),
      ),
    );
  }
}
