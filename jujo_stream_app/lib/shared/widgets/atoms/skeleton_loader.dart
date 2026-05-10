import 'package:flutter/material.dart';

import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

/// A shimmer-effect skeleton placeholder for loading states.
///
/// Use instead of [CircularProgressIndicator] for content that has a known
/// layout shape. Provides visual continuity and reduces perceived load time.
///
/// ```dart
/// // Single bone
/// SkeletonLoader(width: 120, height: 16)
///
/// // Card-shaped placeholder
/// SkeletonLoader(width: double.infinity, height: 80, borderRadius: AppRadius.lg)
///
/// // Circle (avatar placeholder)
/// SkeletonLoader.circle(size: 40)
/// ```
class SkeletonLoader extends StatefulWidget {
  const SkeletonLoader({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = AppRadius.md,
    this.margin,
  });

  /// Creates a circular skeleton (e.g., avatar placeholder).
  const SkeletonLoader.circle({
    super.key,
    required double size,
  })  : width = size,
        height = size,
        borderRadius = 999,
        margin = null;

  final double? width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? margin;

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final baseColor = colorScheme.surfaceContainerHighest;
    final highlightColor = colorScheme.surfaceContainerLow;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final value = _controller.value;
        return Container(
          width: widget.width,
          height: widget.height,
          margin: widget.margin,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              stops: [
                (value - 0.3).clamp(0.0, 1.0),
                value,
                (value + 0.3).clamp(0.0, 1.0),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// A pre-built skeleton layout mimicking a [MetricTile].
///
/// Use in dashboard loading states to maintain layout stability.
class SkeletonMetricTile extends StatelessWidget {
  const SkeletonMetricTile({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonLoader.circle(size: 32),
              SizedBox(width: AppSpacing.sm),
              SkeletonLoader(width: 60, height: 12),
            ],
          ),
          SizedBox(height: AppSpacing.md),
          SkeletonLoader(width: 80, height: 28),
          SizedBox(height: AppSpacing.sm),
          SkeletonLoader(width: 100, height: 10),
        ],
      ),
    );
  }
}

/// A pre-built skeleton layout mimicking a game card in the library.
class SkeletonGameCard extends StatelessWidget {
  const SkeletonGameCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: const Row(
        children: [
          SkeletonLoader(
            width: 48,
            height: 48,
            borderRadius: AppRadius.md,
          ),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonLoader(width: 140, height: 14),
                SizedBox(height: AppSpacing.sm),
                SkeletonLoader(width: 80, height: 10),
              ],
            ),
          ),
          SkeletonLoader(width: 24, height: 24, borderRadius: AppRadius.sm),
        ],
      ),
    );
  }
}

/// A pre-built skeleton for a section header (overline + title).
class SkeletonSectionHeader extends StatelessWidget {
  const SkeletonSectionHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SkeletonLoader(width: 60, height: 10),
        SizedBox(height: AppSpacing.sm),
        SkeletonLoader(width: 180, height: 22),
      ],
    );
  }
}
