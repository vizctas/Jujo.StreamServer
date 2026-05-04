import 'package:flutter/animation.dart';

/// Design token: Animation durations and curves.
/// All animations MUST use these constants.
abstract final class AppDurations {
  /// Micro interactions (hover, press feedback)
  static const Duration micro = Duration(milliseconds: 100);

  /// Standard transitions (page, modal)
  static const Duration standard = Duration(milliseconds: 250);

  /// Emphasis animations (hero, stagger)
  static const Duration emphasis = Duration(milliseconds: 400);

  /// Long animations (onboarding, celebration)
  static const Duration slow = Duration(milliseconds: 600);
}

/// Standard animation curves.
abstract final class AppCurves {
  /// Default for most transitions.
  static const Cubic defaultCurve = Cubic(0.4, 0.0, 0.2, 1.0);

  /// For emphasis/attention animations.
  static const Cubic emphasis = Cubic(0.4, 0.0, 0.0, 1.0);

  /// For enter animations (elements appearing).
  static const Cubic enter = Cubic(0.0, 0.0, 0.2, 1.0);

  /// For exit animations (elements disappearing).
  static const Cubic exit = Cubic(0.4, 0.0, 1.0, 1.0);
}
