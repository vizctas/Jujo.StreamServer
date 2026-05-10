import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// A colored badge indicating the source platform of a game.
///
/// Each source has a distinct color and icon for instant visual recognition.
///
/// ```dart
/// SourceBadge(source: 'steam')   // Blue badge with Steam-like icon
/// SourceBadge(source: 'epic')    // Dark badge
/// SourceBadge(source: 'gog')     // Purple badge
/// SourceBadge(source: 'manual')  // Gray badge
/// ```
class SourceBadge extends StatelessWidget {
  const SourceBadge({
    super.key,
    required this.source,
    this.size = SourceBadgeSize.small,
  });

  /// The source identifier (e.g., "steam", "epic", "gog", "xbox", "manual", "playnite_legacy").
  final String source;

  /// Badge size variant.
  final SourceBadgeSize size;

  @override
  Widget build(BuildContext context) {
    final config = _sourceConfig(source);
    final isSmall = size == SourceBadgeSize.small;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 8,
        vertical: isSmall ? 2 : 3,
      ),
      decoration: BoxDecoration(
        color: config.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(
          color: config.color.withValues(alpha: 0.25),
          width: 0.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            config.icon,
            size: isSmall ? 10 : 12,
            color: config.color,
          ),
          if (size == SourceBadgeSize.labeled) ...[
            const SizedBox(width: 4),
            Text(
              config.label,
              style: TextStyle(
                fontSize: isSmall ? 9 : 10,
                fontWeight: FontWeight.w600,
                color: config.color,
                height: 1.2,
              ),
            ),
          ],
        ],
      ),
    );
  }

  _SourceBadgeConfig _sourceConfig(String source) {
    return switch (source.toLowerCase()) {
      'steam' => const _SourceBadgeConfig(
        color: Color(0xFF1B9FE0),
        icon: LucideIcons.gamepad2,
        label: 'Steam',
      ),
      'epic' => const _SourceBadgeConfig(
        color: Color(0xFF2A2A2A),
        icon: LucideIcons.sword,
        label: 'Epic',
      ),
      'gog' => const _SourceBadgeConfig(
        color: Color(0xFF8B5CF6),
        icon: LucideIcons.globe,
        label: 'GOG',
      ),
      'xbox' || 'microsoft' => const _SourceBadgeConfig(
        color: Color(0xFF107C10),
        icon: LucideIcons.square,
        label: 'Xbox',
      ),
      'playnite_legacy' || 'playnite' => const _SourceBadgeConfig(
        color: Color(0xFFE85D04),
        icon: LucideIcons.library,
        label: 'Playnite',
      ),
      'system' => const _SourceBadgeConfig(
        color: Color(0xFF6B7280),
        icon: LucideIcons.monitor,
        label: 'System',
      ),
      'manual' => const _SourceBadgeConfig(
        color: Color(0xFF6B7280),
        icon: LucideIcons.plus,
        label: 'Manual',
      ),
      _ => const _SourceBadgeConfig(
        color: Color(0xFF9CA3AF),
        icon: LucideIcons.box,
        label: 'Other',
      ),
    };
  }
}

/// Size variants for [SourceBadge].
enum SourceBadgeSize {
  /// Icon only, compact (for grid/list items).
  small,

  /// Icon + text label (for detail views).
  labeled,
}

class _SourceBadgeConfig {
  const _SourceBadgeConfig({
    required this.color,
    required this.icon,
    required this.label,
  });

  final Color color;
  final IconData icon;
  final String label;
}
