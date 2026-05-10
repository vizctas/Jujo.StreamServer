import 'package:flutter/material.dart';

/// Design tokens: Animation durations and curves.
///
/// All animations in the app MUST reference these constants.
/// Never use raw Duration literals or unnamed curves.
abstract final class AppAnimations {
  // ─── Durations ────────────────────────────────────────────────────────────

  /// Micro-interactions: button press, toggle, icon swap (100ms)
  static const Duration micro = Duration(milliseconds: 100);

  /// Fast transitions: tooltip, badge appear, small state changes (200ms)
  static const Duration fast = Duration(milliseconds: 200);

  /// Standard transitions: card expand, tab switch, page fade (300ms)
  static const Duration standard = Duration(milliseconds: 300);

  /// Emphasis transitions: modal open, sheet slide, hero (400ms)
  static const Duration emphasis = Duration(milliseconds: 400);

  /// Slow/dramatic: onboarding, first-load reveal (600ms)
  static const Duration dramatic = Duration(milliseconds: 600);

  // ─── Curves ─────────────────────���─────────────────────────────────────────

  /// Default ease for most transitions (Material 3 standard)
  static const Curve defaultCurve = Curves.easeOutCubic;

  /// Enter/appear animations (decelerate into view)
  static const Curve enter = Curves.easeOut;

  /// Exit/disappear animations (accelerate out of view)
  static const Curve exit = Curves.easeIn;

  /// Bounce/spring for playful interactions
  static const Curve spring = Curves.elasticOut;

  /// Sharp for snappy UI (tabs, toggles)
  static const Curve sharp = Curves.easeInOutCubicEmphasized;

  // ─── Page Transitions ─────────────────────────────────────────────────────

  /// Shared page transition for go_router CustomTransitionPage.
  static Widget fadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: defaultCurve,
      ),
      child: child,
    );
  }

  /// Slide-up transition for sheets and modals.
  static Widget slideUpTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 0.05),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: defaultCurve,
      )),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }

  /// Shared axis horizontal (for lateral navigation like tabs).
  static Widget sharedAxisHorizontal(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.03, 0),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: defaultCurve,
      )),
      child: FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: const Interval(0.0, 0.8),
        ),
        child: child,
      ),
    );
  }
}
