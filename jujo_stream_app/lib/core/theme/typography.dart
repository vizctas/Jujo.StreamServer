import 'package:flutter/material.dart';

/// Typography scale for the Jujo.Stream design system.
///
/// Uses the platform's default font (Segoe UI on Windows, SF Pro on macOS,
/// Roboto on Android/Linux) with a tightened type scale optimized for
/// dashboard UIs on dark backgrounds.
///
/// Key principles:
/// - Tight letter spacing for modern, dense feel
/// - Slightly heavier body weights for dark-theme legibility
/// - Clear hierarchy through size + weight contrast
abstract final class AppTypography {
  // ─── Display ────────────────────────────────────────────────────────────────

  static const TextStyle displayLarge = TextStyle(
    fontSize: 52,
    fontWeight: FontWeight.w300,
    letterSpacing: -1.0,
    height: 1.12,
  );

  static const TextStyle displayMedium = TextStyle(
    fontSize: 42,
    fontWeight: FontWeight.w300,
    letterSpacing: -0.5,
    height: 1.16,
  );

  static const TextStyle displaySmall = TextStyle(
    fontSize: 34,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.25,
    height: 1.22,
  );

  // ─── Headline ───────────────────────────────────────────────────────────────

  static const TextStyle headlineLarge = TextStyle(
    fontSize: 30,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.5,
    height: 1.27,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontSize: 26,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
    height: 1.31,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2,
    height: 1.36,
  );

  // ─── Title ──────────────────────────────────────────────────────────────────

  static const TextStyle titleLarge = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.1,
    height: 1.3,
  );

  static const TextStyle titleMedium = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.47,
  );

  static const TextStyle titleSmall = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.46,
  );

  // ─��─ Body ───────────────────────────────────────────────────────────────────

  static const TextStyle bodyLarge = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.53,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.46,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.1,
    height: 1.42,
  );

  // ─── Label ──────────────────────────────────────────────────────────────────

  static const TextStyle labelLarge = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.46,
  );

  static const TextStyle labelMedium = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.2,
    height: 1.42,
  );

  static const TextStyle labelSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.3,
    height: 1.45,
  );

  // ─── Overline (for section headers, badges) ─────────────────────────────────

  static const TextStyle overline = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.8,
    height: 1.45,
  );

  /// Build a complete TextTheme from our scale.
  static TextTheme get textTheme => const TextTheme(
        displayLarge: displayLarge,
        displayMedium: displayMedium,
        displaySmall: displaySmall,
        headlineLarge: headlineLarge,
        headlineMedium: headlineMedium,
        headlineSmall: headlineSmall,
        titleLarge: titleLarge,
        titleMedium: titleMedium,
        titleSmall: titleSmall,
        bodyLarge: bodyLarge,
        bodyMedium: bodyMedium,
        bodySmall: bodySmall,
        labelLarge: labelLarge,
        labelMedium: labelMedium,
        labelSmall: labelSmall,
      );
}
