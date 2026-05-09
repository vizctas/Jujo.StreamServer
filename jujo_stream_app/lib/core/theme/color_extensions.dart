import 'package:flutter/material.dart';

import 'colors.dart';

/// Extension on [ColorScheme] providing semantic color accessors
/// that go beyond the basic Material 3 tokens.
///
/// This prevents the "everything is primary" monotone look by giving
/// widgets easy access to the full Jujo palette without importing AppColors.
///
/// Usage:
/// ```dart
/// final cs = Theme.of(context).colorScheme;
/// Icon(icon, color: cs.iconSources); // warm orange for sources
/// Icon(icon, color: cs.iconGames);   // cyan for games
/// ```
extension JujoColorSchemeX on ColorScheme {
  // ─── Semantic Icon Colors ─────────────────────────────────────────────────
  // Use these instead of always using `primary` for every icon.

  /// Icon color for "clients/devices" context — slate blue.
  Color get iconClients => brightness == Brightness.dark
      ? AppColors.brandSecondaryLight
      : AppColors.brandSecondary;

  /// Icon color for "game sources/plugins" context — warm coral.
  Color get iconSources => brightness == Brightness.dark
      ? AppColors.warm400
      : AppColors.warm500;

  /// Icon color for "games/library" context — cyan/teal.
  Color get iconGames => brightness == Brightness.dark
      ? AppColors.brandTertiaryLight
      : AppColors.brandTertiary;

  /// Icon color for "streaming/live" context — green.
  Color get iconStreaming => brightness == Brightness.dark
      ? AppColors.successLight
      : AppColors.success;

  /// Icon color for "system/hardware" context — muted purple.
  Color get iconSystem => brightness == Brightness.dark
      ? AppColors.brandPrimaryLight
      : AppColors.brandPrimary;

  /// Icon color for "settings/config" context — neutral warm.
  Color get iconSettings => brightness == Brightness.dark
      ? AppColors.neutral300
      : AppColors.neutral600;

  // ─── Section Accent Colors ────────────────────────────────────────────────
  // For section headers, overlines, and feature-specific highlights.

  /// Accent for game sources section.
  Color get accentSources => brightness == Brightness.dark
      ? AppColors.warm400
      : AppColors.warm600;

  /// Accent for library/games section.
  Color get accentLibrary => brightness == Brightness.dark
      ? AppColors.brandTertiaryLight
      : AppColors.brandTertiary;

  /// Accent for streaming/live section.
  Color get accentStreaming => AppColors.success;

  /// Accent for system/hardware section.
  Color get accentSystem => brightness == Brightness.dark
      ? AppColors.brandSecondaryLight
      : AppColors.brandSecondary;

  /// Accent for pairing/devices section.
  Color get accentPairing => brightness == Brightness.dark
      ? AppColors.infoLight
      : AppColors.info;

  // ─── Surface Tints ────────────────────────────────────────────────────────
  // Subtle background tints for feature-specific cards.

  /// Tinted surface for sources-related cards.
  Color get surfaceSources => brightness == Brightness.dark
      ? AppColors.warm500.withValues(alpha: 0.06)
      : AppColors.warm50;

  /// Tinted surface for library/games cards.
  Color get surfaceGames => brightness == Brightness.dark
      ? AppColors.brandTertiary.withValues(alpha: 0.06)
      : const Color(0xFFF0FDFA); // very light cyan

  /// Tinted surface for streaming/live cards.
  Color get surfaceStreaming => brightness == Brightness.dark
      ? AppColors.success.withValues(alpha: 0.06)
      : AppColors.successMuted;

  /// Tinted surface for system/hardware cards.
  Color get surfaceSystem => brightness == Brightness.dark
      ? AppColors.brandSecondary.withValues(alpha: 0.06)
      : const Color(0xFFF0F4FF); // very light blue
}
