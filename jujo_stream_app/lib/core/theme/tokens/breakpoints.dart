/// Design token: Responsive breakpoints.
/// Used by adaptive layout widgets to switch between mobile/tablet/desktop.
abstract final class AppBreakpoints {
  /// Phone portrait (0–599)
  static const double mobile = 0;

  /// Tablet portrait / phone landscape (600–1023)
  static const double tablet = 600;

  /// Desktop / tablet landscape (1024–1439)
  static const double desktop = 1024;

  /// Wide desktop (1440–1919)
  static const double wide = 1440;

  /// Ultra-wide / TV (1920+)
  static const double ultrawide = 1920;

  /// Returns true if [width] is at least tablet-sized.
  static bool isTablet(double width) => width >= tablet;

  /// Returns true if [width] is at least desktop-sized.
  static bool isDesktop(double width) => width >= desktop;

  /// Returns true if [width] is wide desktop or larger.
  static bool isWide(double width) => width >= wide;
}
