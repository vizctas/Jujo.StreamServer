import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'colors.dart';
import 'tokens/tokens.dart';
import 'typography.dart';

/// Central theme configuration for the Jujo.Stream app.
/// Provides both dark and light Material 3 themes built from design tokens.
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
      );

  // ─── Color Schemes ──────────────────────────────────────────────────────────

  static const ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.brandPrimary,
    onPrimary: Colors.white,
    primaryContainer: AppColors.brandPrimaryDark,
    onPrimaryContainer: AppColors.brandPrimaryLight,
    secondary: AppColors.neutral400,
    onSecondary: AppColors.neutral900,
    secondaryContainer: AppColors.neutral800,
    onSecondaryContainer: AppColors.neutral200,
    tertiary: AppColors.info,
    onTertiary: Colors.white,
    error: AppColors.error,
    onError: Colors.white,
    errorContainer: AppColors.errorMuted,
    onErrorContainer: Color(0xFFFCA5A5),
    surface: AppColors.neutral900,
    onSurface: AppColors.neutral50,
    surfaceContainerHighest: AppColors.neutral800,
    onSurfaceVariant: AppColors.neutral400,
    outline: Color(0x33FFFFFF),
    outlineVariant: Color(0x1AFFFFFF),
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: AppColors.neutral100,
    onInverseSurface: AppColors.neutral900,
    inversePrimary: AppColors.brandPrimaryDark,
  );

  static const ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.brandPrimary,
    onPrimary: Colors.white,
    primaryContainer: Color(0xFFE0E7FF), // Indigo-100
    onPrimaryContainer: AppColors.brandPrimaryDark,
    secondary: AppColors.neutral600,
    onSecondary: Colors.white,
    secondaryContainer: AppColors.neutral200,
    onSecondaryContainer: AppColors.neutral800,
    tertiary: AppColors.info,
    onTertiary: Colors.white,
    error: AppColors.error,
    onError: Colors.white,
    errorContainer: Color(0xFFFEE2E2),
    onErrorContainer: AppColors.errorMuted,
    surface: Colors.white,
    onSurface: AppColors.neutral900,
    surfaceContainerHighest: AppColors.neutral200,
    onSurfaceVariant: AppColors.neutral600,
    outline: Color(0x1A000000),
    outlineVariant: Color(0x0D000000),
    shadow: Color(0x1A000000),
    scrim: Colors.black,
    inverseSurface: AppColors.neutral800,
    onInverseSurface: AppColors.neutral100,
    inversePrimary: AppColors.brandPrimaryLight,
  );

  // ─── Component Themes ───────────────────────────────────────────────────────

  static CardThemeData _cardTheme(Brightness brightness) => CardThemeData(
        elevation: AppElevation.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        margin: EdgeInsets.zero,
        color: brightness == Brightness.dark
            ? AppColors.neutral900
            : Colors.white,
      );

  static AppBarTheme _appBarTheme(Brightness brightness) => AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral950
            : AppColors.neutral50,
        foregroundColor: brightness == Brightness.dark
            ? AppColors.neutral50
            : AppColors.neutral900,
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
              : AppColors.neutral600,
          size: 24,
        ),
        selectedLabelTextStyle: AppTypography.labelMedium.copyWith(
          color: AppColors.brandPrimary,
        ),
        unselectedLabelTextStyle: AppTypography.labelMedium.copyWith(
          color: brightness == Brightness.dark
              ? AppColors.neutral400
              : AppColors.neutral600,
        ),
      );

  static NavigationBarThemeData _navBarTheme(Brightness brightness) =>
      NavigationBarThemeData(
        backgroundColor: brightness == Brightness.dark
            ? AppColors.neutral900
            : Colors.white,
        indicatorColor: AppColors.brandPrimary.withValues(alpha: 0.12),
        elevation: AppElevation.raised,
        height: 64,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
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
                : const Color(0x0D000000),
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
            : const Color(0x0D000000),
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
