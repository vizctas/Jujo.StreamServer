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
        scaffoldBackgroundColor: AppColors.slate50,
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

  static ThemeData fromPalette(JujoPalette palette) {
    final brightness = palette.isLight ? Brightness.light : Brightness.dark;
    final onSurface = palette.isLight ? AppColors.slate800 : AppColors.neutral50;
    final onSurfaceVariant =
        palette.isLight ? AppColors.slate500 : AppColors.neutral400;
    final scheme = ColorScheme(
      brightness: brightness,
      primary: palette.accent,
      onPrimary: palette.isLight ? Colors.white : Colors.white,
      primaryContainer: palette.accentMuted,
      onPrimaryContainer: palette.isLight ? palette.accent : palette.accentLight,
      secondary: palette.secondary,
      onSecondary: Colors.white,
      secondaryContainer: palette.secondary.withValues(alpha: 0.24),
      onSecondaryContainer: palette.isLight ? palette.secondary : palette.accentLight,
      tertiary: palette.highlight,
      onTertiary: palette.isLight ? Colors.white : Colors.black,
      tertiaryContainer: palette.warm.withValues(alpha: 0.22),
      onTertiaryContainer: palette.isLight ? palette.warm : palette.accentLight,
      error: palette.isLight ? const Color(0xFFDC2626) : AppColors.error,
      onError: Colors.white,
      errorContainer:
          palette.isLight ? AppColors.errorMuted : AppColors.errorMutedDark,
      onErrorContainer:
          palette.isLight ? const Color(0xFF991B1B) : AppColors.errorLight,
      surface: palette.surface,
      onSurface: onSurface,
      surfaceContainerHighest: palette.surfaceVariant,
      onSurfaceVariant: onSurfaceVariant,
      outline: palette.muted.withValues(alpha: palette.isLight ? 0.55 : 0.7),
      outlineVariant: palette.muted.withValues(alpha: palette.isLight ? 0.28 : 0.35),
      shadow: Colors.black,
      scrim: Colors.black,
      inverseSurface: palette.isLight ? AppColors.slate800 : AppColors.neutral100,
      onInverseSurface:
          palette.isLight ? AppColors.slate50 : AppColors.neutral900,
      inversePrimary: palette.accentLight,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      textTheme: AppTypography.textTheme,
      scaffoldBackgroundColor: palette.background,
      cardTheme: _paletteCardTheme(palette),
      appBarTheme: _paletteAppBarTheme(palette),
      navigationRailTheme: _paletteNavRailTheme(palette),
      navigationBarTheme: _paletteNavBarTheme(palette),
      elevatedButtonTheme: _elevatedButtonTheme,
      filledButtonTheme: _filledButtonTheme,
      outlinedButtonTheme: _outlinedButtonTheme,
      textButtonTheme: _textButtonTheme,
      inputDecorationTheme: _paletteInputTheme(palette),
      dividerTheme: DividerThemeData(
        color: scheme.outlineVariant,
        thickness: 1,
        space: 1,
      ),
      chipTheme: _paletteChipTheme(palette),
      tooltipTheme: _tooltipTheme,
      snackBarTheme: _snackBarTheme,
      dialogTheme: DialogThemeData(
        elevation: AppElevation.modal,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
        backgroundColor: palette.surface,
      ),
      switchTheme: _paletteSwitchTheme(palette),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: palette.accent,
        linearTrackColor: palette.accentMuted,
        circularTrackColor: palette.accentMuted,
      ),
      badgeTheme: BadgeThemeData(
        backgroundColor: palette.accent,
        textColor: Colors.white,
      ),
    );
  }

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
    // Primary — Jujo Purple (rich violet, signature brand)
    primary: Color(0xFF6C3CE1),
    onPrimary: Colors.white,
    primaryContainer: Color(0xFFEDE9FE), // Soft lavender — badges, chips, tonal buttons
    onPrimaryContainer: Color(0xFF3B1F8E), // Deep violet for text on lavender
    // Secondary — De Boosy Slate Blue (cool complement)
    secondary: Color(0xFF4F6D9B),
    onSecondary: Colors.white,
    secondaryContainer: Color(0xFFE0EAFF), // Pale sky blue — info cards, secondary chips
    onSecondaryContainer: Color(0xFF1E3A5F),
    // Tertiary — Lazy Ankui Warm (peach/amber warmth)
    tertiary: Color(0xFFD97706), // Amber-orange — warm accents, notifications
    onTertiary: Colors.white,
    tertiaryContainer: Color(0xFFFEF3C7), // Cream yellow — warm card backgrounds
    onTertiaryContainer: Color(0xFF78350F),
    // Error — consistent red
    error: Color(0xFFDC2626),
    onError: Colors.white,
    errorContainer: Color(0xFFFEE2E2), // Soft pink
    onErrorContainer: Color(0xFF991B1B),
    // Surfaces — layered depth system
    surface: Color(0xFFFFFFFF), // Cards, sheets
    onSurface: Color(0xFF1E293B), // Slate-900 — primary text
    surfaceContainerHighest: Color(0xFFF1F5F9), // Slate-100 — elevated containers
    onSurfaceVariant: Color(0xFF64748B), // Slate-500 — secondary text, icons
    // Outlines — subtle structure
    outline: Color(0xFFCBD5E1), // Slate-300 — visible borders
    outlineVariant: Color(0xFFE2E8F0), // Slate-200 — subtle dividers
    // Misc
    shadow: Color(0x146C3CE1), // Purple-tinted shadow for brand depth
    scrim: Color(0x66000000),
    inverseSurface: Color(0xFF1E293B),
    onInverseSurface: Color(0xFFF8FAFC),
    inversePrimary: Color(0xFFA78BFA), // Violet-400 for dark-on-light inverse
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
            : AppColors.slate50,
        foregroundColor: brightness == Brightness.dark
            ? AppColors.neutral50
            : AppColors.slate800,
        surfaceTintColor: brightness == Brightness.light
            ? AppColors.brandPrimary.withValues(alpha: 0.03)
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

  static CardThemeData _paletteCardTheme(JujoPalette palette) => CardThemeData(
        elevation: palette.isLight ? 0 : AppElevation.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(
            color: palette.muted.withValues(alpha: palette.isLight ? 0.35 : 0.28),
            width: 1,
          ),
        ),
        margin: EdgeInsets.zero,
        color: palette.surface,
      );

  static AppBarTheme _paletteAppBarTheme(JujoPalette palette) => AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: palette.isLight ? 1 : 0,
        centerTitle: false,
        backgroundColor: palette.background,
        foregroundColor: palette.isLight ? AppColors.slate800 : AppColors.neutral50,
        surfaceTintColor: palette.accent.withValues(alpha: 0.04),
        systemOverlayStyle:
            palette.isLight ? SystemUiOverlayStyle.dark : SystemUiOverlayStyle.light,
        titleTextStyle: AppTypography.titleLarge.copyWith(
          color: palette.isLight ? AppColors.slate800 : AppColors.neutral50,
        ),
      );

  static NavigationRailThemeData _paletteNavRailTheme(JujoPalette palette) =>
      NavigationRailThemeData(
        backgroundColor: palette.surface,
        indicatorColor: palette.accent.withValues(alpha: 0.14),
        selectedIconTheme: IconThemeData(color: palette.accent, size: 24),
        unselectedIconTheme: IconThemeData(color: palette.muted, size: 24),
        selectedLabelTextStyle:
            AppTypography.labelMedium.copyWith(color: palette.accent),
        unselectedLabelTextStyle:
            AppTypography.labelMedium.copyWith(color: palette.muted),
      );

  static NavigationBarThemeData _paletteNavBarTheme(JujoPalette palette) =>
      NavigationBarThemeData(
        backgroundColor: palette.surface,
        indicatorColor: palette.accent.withValues(alpha: 0.14),
        elevation: palette.isLight ? 0 : AppElevation.raised,
        height: 64,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        surfaceTintColor: Colors.transparent,
      );

  static InputDecorationTheme _paletteInputTheme(JujoPalette palette) =>
      InputDecorationTheme(
        filled: true,
        fillColor: palette.surfaceVariant.withValues(alpha: 0.7),
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
            color: palette.muted.withValues(alpha: palette.isLight ? 0.35 : 0.28),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: palette.accent, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: AppTypography.bodyMedium.copyWith(color: palette.muted),
      );

  static ChipThemeData _paletteChipTheme(JujoPalette palette) => ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        labelStyle: AppTypography.labelSmall,
        backgroundColor: palette.surfaceVariant,
        selectedColor: palette.accentMuted,
      );

  static SwitchThemeData _paletteSwitchTheme(JujoPalette palette) =>
      SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return Colors.white;
          return palette.muted;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return palette.accent;
          return palette.surfaceVariant;
        }),
      );
}
