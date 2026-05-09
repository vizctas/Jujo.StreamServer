import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'colors.dart';
import 'tokens/tokens.dart';
import 'typography.dart';

/// Central theme configuration for the Jujo.Stream app.
/// Provides both dark and light Material 3 themes built from design tokens.
///
/// Light theme uses the expanded Jujo palette with proper accent, muted,
/// background, warm, and highlight colors ported from jujo.client.
abstract final class AppTheme {
  // ─── Dark Theme (Default) ───────────────────────────────────────────────────

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: _darkColorScheme,
        textTheme: AppTypography.textTheme,
        scaffoldBackgroundColor: AppColors.neutral950,
        cardTheme: _cardTheme(Brightness.dark),
        appBarTheme: _appBarTheme(Brightness.dark),
        navigationRailTheme: _navRailTheme(Brightness.dark),
        navigationBarTheme: _navBarTheme(Brightness.dark),
        elevatedButtonTheme: _elevatedButtonTheme,
        filledButtonTheme: _filledButtonTheme,
        outlinedButtonTheme: _outlinedButtonTheme,
        textButtonTheme: _textButtonTheme,
        inputDecorationTheme: _inputTheme(Brightness.dark),
        dividerTheme: _dividerTheme(Brightness.dark),
        chipTheme: _chipTheme(Brightness.dark),
        tooltipTheme: _tooltipTheme,
        snackBarTheme: _snackBarTheme,
        dialogTheme: _dialogTheme(Brightness.dark),
        switchTheme: _switchTheme(Brightness.dark),
        progressIndicatorTheme: _progressTheme,
        badgeTheme: _badgeTheme,
      );

  // ─── Light Theme ────────────────────────────────────────────────────────────

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: _lightColorScheme,
        textTheme: AppTypography.textTheme,
        scaffoldBackgroundColor: AppColors.neutral50,
        cardTheme: _cardTheme(Brightness.light),
        appBarTheme: _appBarTheme(Brightness.light),
        navigationRailTheme: _navRailTheme(Brightness.light),
        navigationBarTheme: _navBarTheme(Brightness.light),
        elevatedButtonTheme: _elevatedButtonTheme,
        filledButtonTheme: _filledButtonTheme,
        outlinedButtonTheme: _outlinedButtonTheme,
        textButtonTheme: _textButtonTheme,
        inputDecorationTheme: _inputTheme(Brightness.light),
        dividerTheme: _dividerTheme(Brightness.light),
        chipTheme: _chipTheme(Brightness.light),
        tooltipTheme: _tooltipTheme,
        snackBarTheme: _snackBarTheme,
        dialogTheme: _dialogTheme(Brightness.light),
        switchTheme: _switchTheme(Brightness.light),
        progressIndicatorTheme: _progressTheme,
        badgeTheme: _badgeTheme,
      );

  // ─── Color Schemes ──────────────────────────────────────────────────────────

  static const ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    // Primary — Jujo Purple
    primary: AppColors.brandPrimary,
    onPrimary: Colors.white,
    primaryContainer: Color(0xFF2D2864),
    onPrimaryContainer: AppColors.brandPrimaryLight,
    // Secondary — Slate Blue
    secondary: AppColors.brandSecondary,
    onSecondary: Colors.white,
    secondaryContainer: Color(0xFF1B3A6B),
    onSecondaryContainer: AppColors.brandSecondaryLight,
    // Tertiary — Cyan/Highlight
    tertiary: AppColors.brandTertiary,
    onTertiary: Colors.white,
    tertiaryContainer: Color(0xFF004D5E),
    onTertiaryContainer: AppColors.brandTertiaryLight,
    // Error
    error: AppColors.error,
    onError: Colors.white,
    errorContainer: AppColors.errorMutedDark,
    onErrorContainer: AppColors.errorLight,
    // Surfaces
    surface: AppColors.neutral900,
    onSurface: AppColors.neutral50,
    surfaceContainerHighest: AppColors.neutral800,
    onSurfaceVariant: AppColors.neutral400,
    // Outlines
    outline: Color(0x33FFFFFF),
    outlineVariant: Color(0x1AFFFFFF),
    // Misc
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: AppColors.neutral100,
    onInverseSurface: AppColors.neutral900,
    inversePrimary: AppColors.brandPrimaryDark,
  );

  static const ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    // Primary — Jujo Purple
    primary: AppColors.brandPrimary,
    onPrimary: Colors.white,
    primaryContainer: AppColors.accentMutedLight, // Light purple bg
    onPrimaryContainer: AppColors.brandPrimaryDark,
    // Secondary — Slate Blue
    secondary: AppColors.brandSecondary,
    onSecondary: Colors.white,
    secondaryContainer: Color(0xFFDDE8F8), // Light blue bg
    onSecondaryContainer: AppColors.brandSecondaryDark,
    // Tertiary — Warm/Coral (from Ember palette)
    tertiary: AppColors.warm500,
    onTertiary: Colors.white,
    tertiaryContainer: AppColors.warm50,
    onTertiaryContainer: Color(0xFF7C2D12),
    // Error
    error: AppColors.error,
    onError: Colors.white,
    errorContainer: AppColors.errorMuted,
    onErrorContainer: AppColors.errorMutedDark,
    // Surfaces — clean, airy light backgrounds
    surface: Colors.white,
    onSurface: AppColors.neutral900,
    surfaceContainerHighest: AppColors.neutral200,
    onSurfaceVariant: AppColors.neutral600,
    // Outlines — subtle borders
    outline: AppColors.neutral300,
    outlineVariant: AppColors.neutral150,
    // Misc
    shadow: Color(0x1A6C3CE1), // Purple-tinted shadow for depth
    scrim: Color(0x66000000),
    inverseSurface: AppColors.neutral800,
    onInverseSurface: AppColors.neutral100,
    inversePrimary: AppColors.brandPrimaryLight,
  );

  // ─── Component Themes ───────────────────────────────────────────────────────

  static CardThemeData _cardTheme(Brightness brightness) => CardThemeData(
        elevation: brightness == Brightness.light ? 0 : AppElevation.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: brightness == Brightness.light
              ? BorderSide(color: AppColors.neutral200, width: 1)
              : BorderSide.none,
        ),
        margin: EdgeInsets.zero,
        color: brightness == Brightness.dark
            ? AppColors.neutral900
            : Colors.white,
      );

  static AppBarTheme _appBarTheme(Brightness brightness) => AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: brightness == Brightness.light ? 1 : 0,
        centerTitle: false,
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral950
            : AppColors.neutral50,
        foregroundColor: brightness == Brightness.dark
            ? AppColors.neutral50
            : AppColors.neutral900,
        surfaceTintColor: brightness == Brightness.light
            ? AppColors.brandPrimary.withValues(alpha: 0.04)
            : null,
        systemOverlayStyle: brightness == Brightness.dark
            ? SystemUiOverlayStyle.light
            : SystemUiOverlayStyle.dark,
        titleTextStyle: AppTypography.titleLarge.copyWith(
          color: brightness == Brightness.dark
              ? AppColors.neutral50
              : AppColors.neutral900,
        ),
      );

  static NavigationRailThemeData _navRailTheme(Brightness brightness) =>
      NavigationRailThemeData(
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral950
            : Colors.white,
        indicatorColor: AppColors.brandPrimary.withValues(alpha: 0.12),
        selectedIconTheme: const IconThemeData(
          color: AppColors.brandPrimary,
          size: 24,
        ),
        unselectedIconTheme: IconThemeData(
          color: brightness == Brightness.dark
              ? AppColors.neutral400
              : AppColors.neutral500,
          size: 24,
        ),
        selectedLabelTextStyle: AppTypography.labelMedium.copyWith(
          color: AppColors.brandPrimary,
        ),
        unselectedLabelTextStyle: AppTypography.labelMedium.copyWith(
          color: brightness == Brightness.dark
              ? AppColors.neutral400
              : AppColors.neutral500,
        ),
      );

  static NavigationBarThemeData _navBarTheme(Brightness brightness) =>
      NavigationBarThemeData(
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral900
            : Colors.white,
        indicatorColor: AppColors.brandPrimary.withValues(alpha: 0.12),
        elevation: brightness == Brightness.light ? 0 : AppElevation.raised,
        height: 64,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        surfaceTintColor: Colors.transparent,
      );

  static final ElevatedButtonThemeData _elevatedButtonTheme =
      ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      elevation: AppElevation.subtle,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.md,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      textStyle: AppTypography.labelLarge,
      minimumSize: const Size(48, 48),
    ),
  );

  static final FilledButtonThemeData _filledButtonTheme =
      FilledButtonThemeData(
    style: FilledButton.styleFrom(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.md,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      textStyle: AppTypography.labelLarge,
      minimumSize: const Size(48, 48),
    ),
  );

  static final OutlinedButtonThemeData _outlinedButtonTheme =
      OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.md,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      textStyle: AppTypography.labelLarge,
      minimumSize: const Size(48, 48),
    ),
  );

  static final TextButtonThemeData _textButtonTheme = TextButtonThemeData(
    style: TextButton.styleFrom(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.sm,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      textStyle: AppTypography.labelLarge,
      minimumSize: const Size(48, 48),
    ),
  );

  static InputDecorationTheme _inputTheme(Brightness brightness) =>
      InputDecorationTheme(
        filled: true,
        fillColor: brightness == Brightness.dark
            ? AppColors.neutral850
            : AppColors.neutral100,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(
            color: brightness == Brightness.dark
                ? const Color(0x1AFFFFFF)
                : AppColors.neutral200,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(
            color: AppColors.brandPrimary,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: AppTypography.bodyMedium.copyWith(
          color: brightness == Brightness.dark
              ? AppColors.neutral500
              : AppColors.neutral400,
        ),
      );

  static DividerThemeData _dividerTheme(Brightness brightness) =>
      DividerThemeData(
        color: brightness == Brightness.dark
            ? const Color(0x1AFFFFFF)
            : AppColors.neutral200,
        thickness: 1,
        space: 1,
      );

  static ChipThemeData _chipTheme(Brightness brightness) => ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        labelStyle: AppTypography.labelSmall,
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral800
            : AppColors.neutral100,
        selectedColor: brightness == Brightness.dark
            ? AppColors.accentMutedDark
            : AppColors.accentMutedLight,
      );

  static SwitchThemeData _switchTheme(Brightness brightness) =>
      SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return Colors.white;
          }
          return brightness == Brightness.dark
              ? AppColors.neutral400
              : AppColors.neutral300;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.brandPrimary;
          }
          return brightness == Brightness.dark
              ? AppColors.neutral800
              : AppColors.neutral200;
        }),
      );

  static const ProgressIndicatorThemeData _progressTheme =
      ProgressIndicatorThemeData(
    color: AppColors.brandPrimary,
    linearTrackColor: AppColors.accentMutedLight,
    circularTrackColor: AppColors.accentMutedLight,
  );

  static const BadgeThemeData _badgeTheme = BadgeThemeData(
    backgroundColor: AppColors.brandPrimary,
    textColor: Colors.white,
  );

  static const TooltipThemeData _tooltipTheme = TooltipThemeData(
    preferBelow: true,
    textStyle: AppTypography.bodySmall,
    waitDuration: Duration(milliseconds: 500),
  );

  static const SnackBarThemeData _snackBarTheme = SnackBarThemeData(
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
    ),
  );

  static DialogThemeData _dialogTheme(Brightness brightness) =>
      DialogThemeData(
        elevation: AppElevation.modal,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral900
            : Colors.white,
      );
}
