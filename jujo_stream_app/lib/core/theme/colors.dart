import 'package:flutter/material.dart';

/// Semantic color tokens for the Jujo.Stream design system.
/// These map to Material 3 ColorScheme but provide additional semantic meaning.
///
/// Usage: `Theme.of(context).colorScheme.primary` or `AppColors.semantic(context).success`
abstract final class AppColors {
  // ─── Brand Colors ───────────────────────────────────────────────────────────

  /// Primary brand color — used for primary actions, active states, focus rings.
  static const Color brandPrimary = Color(0xFF6366F1); // Indigo-500
  static const Color brandPrimaryLight = Color(0xFF818CF8); // Indigo-400
  static const Color brandPrimaryDark = Color(0xFF4F46E5); // Indigo-600

  // ─── Neutral Palette ────────────────────────────────────────────────────────

  static const Color neutral50 = Color(0xFFFAFAFA);
  static const Color neutral100 = Color(0xFFF5F5F5);
  static const Color neutral200 = Color(0xFFE5E5E5);
  static const Color neutral300 = Color(0xFFD4D4D4);
  static const Color neutral400 = Color(0xFFA3A3A3);
  static const Color neutral500 = Color(0xFF737373);
  static const Color neutral600 = Color(0xFF525252);
  static const Color neutral700 = Color(0xFF404040);
  static const Color neutral800 = Color(0xFF262626);
  static const Color neutral850 = Color(0xFF1C1C1C);
  static const Color neutral900 = Color(0xFF171717);
  static const Color neutral950 = Color(0xFF0A0A0A);

  // ─── Semantic Status Colors ─────────────────────────────────────────────────

  static const Color success = Color(0xFF22C55E);
  static const Color successMuted = Color(0xFF166534);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningMuted = Color(0xFF92400E);
  static const Color error = Color(0xFFEF4444);
  static const Color errorMuted = Color(0xFF991B1B);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoMuted = Color(0xFF1E40AF);

  // ─── Platform Brand Colors (for game source cards) ──────────────────────────

  static const Color steam = Color(0xFF1B2838);
  static const Color epic = Color(0xFF2A2A2A);
  static const Color gog = Color(0xFF6441A5);
  static const Color xbox = Color(0xFF107C10);

  // ─── Helper: Get semantic colors from context ───────────────────────────────

  static SemanticColors semantic(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark
        ? const SemanticColors.dark()
        : const SemanticColors.light();
  }
}

/// Semantic color set that adapts to light/dark mode.
class SemanticColors {
  final Color background;
  final Color surface;
  final Color surfaceElevated;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color borderSubtle;
  final Color borderDefault;

  const SemanticColors.dark()
      : background = AppColors.neutral950,
        surface = AppColors.neutral900,
        surfaceElevated = AppColors.neutral850,
        textPrimary = AppColors.neutral50,
        textSecondary = AppColors.neutral400,
        textMuted = AppColors.neutral500,
        borderSubtle = const Color(0x1AFFFFFF), // white 10%
        borderDefault = const Color(0x33FFFFFF); // white 20%

  const SemanticColors.light()
      : background = AppColors.neutral50,
        surface = Colors.white,
        surfaceElevated = AppColors.neutral100,
        textPrimary = AppColors.neutral900,
        textSecondary = AppColors.neutral600,
        textMuted = AppColors.neutral400,
        borderSubtle = const Color(0x0D000000), // black 5%
        borderDefault = const Color(0x1A000000); // black 10%
}
