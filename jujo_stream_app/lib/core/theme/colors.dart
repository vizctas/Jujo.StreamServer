import 'package:flutter/material.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// Jujo.Stream Server — Design System Color Palette
//
// Ported from jujo.client theme_config.dart.
// Palettes: Jujo Purple, De Boosy, Lazy Ankui, Shiory Pan, Midnight, etc.
// ═══════════════════════════════════════════════════════════════════════════════

/// Theme palette identifier — mirrors jujo.client AppThemeId.
enum JujoThemeId {
  jujo,
  deBoosy,
  shioryPan,
  lazyAnkui,
  midnight,
  oled,
  cyberpunk,
  forest,
  sunset,
  ember,
  light,
}

/// Full color set for a Jujo theme palette.
/// Includes background, surface, accent, muted, warm, highlight, and semantic tokens.
@immutable
class JujoPalette {
  /// Deep background — page/scaffold level.
  final Color background;

  /// Card/container surface.
  final Color surface;

  /// Elevated surface variant (modals, popovers).
  final Color surfaceVariant;

  /// Primary accent — buttons, active states, focus rings.
  final Color accent;

  /// Lighter accent — hover states, badges, secondary emphasis.
  final Color accentLight;

  /// Muted accent — disabled states, subtle indicators.
  final Color accentMuted;

  /// Secondary color — complementary to accent.
  final Color secondary;

  /// Highlight — attention-grabbing, sparingly used.
  final Color highlight;

  /// Warm tone — notifications, warnings, warmth.
  final Color warm;

  /// Muted/subdued tone — borders, dividers, inactive text.
  final Color muted;

  /// Whether this palette is designed for light mode.
  final bool isLight;

  const JujoPalette({
    required this.background,
    required this.surface,
    required this.surfaceVariant,
    required this.accent,
    required this.accentLight,
    required this.accentMuted,
    required this.secondary,
    required this.highlight,
    required this.warm,
    required this.muted,
    this.isLight = false,
  });
}

/// All Jujo theme palettes — ported from jujo.client.
abstract final class JujoPalettes {
  static const Map<JujoThemeId, JujoPalette> all = {
    // ─── JUJO Purple ────────────────────────────────────────────────────────
    JujoThemeId.jujo: JujoPalette(
      background: Color(0xFF0E0E1C),
      surface: Color(0xFF16192E),
      surfaceVariant: Color(0xFF1C1D38),
      accent: Color(0xFF6C3CE1),
      accentLight: Color(0xFF9B71F5),
      accentMuted: Color(0xFF2D2864),
      secondary: Color(0xFF1B3A6B),
      highlight: Color(0xFF00E5FF),
      warm: Color(0xFF00B8D4),
      muted: Color(0xFF2D2864),
    ),

    // ─── De Boosy ───────────────────────────────────────────────────────────
    // Charcoal greys with royal violet, slate blue and warm sand accents.
    // Dedication to Boo — first adopted cat.
    JujoThemeId.deBoosy: JujoPalette(
      background: Color(0xFF121418),
      surface: Color(0xFF1C1E24),
      surfaceVariant: Color(0xFF282C35),
      accent: Color(0xFF8161E5),
      accentLight: Color(0xFFB29BFF),
      accentMuted: Color(0xFF505661),
      secondary: Color(0xFF5476B3),
      highlight: Color(0xFF95A85A),
      warm: Color(0xFFD7A26B),
      muted: Color(0xFF505661),
    ),

    // ─── Shiory Pan ─────────────────────────────────────────────────────────
    // Coal black, ember brown, ginger orange and leaf-green contrast.
    // Dedication to Shiory.
    JujoThemeId.shioryPan: JujoPalette(
      background: Color(0xFF1C1817),
      surface: Color(0xFF2A221F),
      surfaceVariant: Color(0xFF3C2E28),
      accent: Color(0xFFB56347),
      accentLight: Color(0xFFD86965),
      accentMuted: Color(0xFF493732),
      secondary: Color(0xFF5A88D8),
      highlight: Color(0xFF567C38),
      warm: Color(0xFFF4D1AF),
      muted: Color(0xFF493732),
    ),

    // ─── Lazy Ankui ─────────────────────────────────────────────────────────
    // Rich bean browns, warm cream, sleepy sky and peach notes.
    // Dedication to Ankui — second adopted cat.
    JujoThemeId.lazyAnkui: JujoPalette(
      background: Color(0xFF1F1A17),
      surface: Color(0xFF332D2A),
      surfaceVariant: Color(0xFF443A35),
      accent: Color(0xFFD0B387),
      accentLight: Color(0xFFF3D5BF),
      accentMuted: Color(0xFFBCA98D),
      secondary: Color(0xFFABB5EB),
      highlight: Color(0xFFBDDCA7),
      warm: Color(0xFFDE8D62),
      muted: Color(0xFFBCA98D),
    ),

    // ─── Midnight Blue ──────────────────────────────────────────────────────
    JujoThemeId.midnight: JujoPalette(
      background: Color(0xFF0D1117),
      surface: Color(0xFF161B27),
      surfaceVariant: Color(0xFF1B2440),
      accent: Color(0xFF1F6FEB),
      accentLight: Color(0xFF58A6FF),
      accentMuted: Color(0xFF193860),
      secondary: Color(0xFF1C2C4A),
      highlight: Color(0xFF79C0FF),
      warm: Color(0xFF2EA043),
      muted: Color(0xFF193860),
    ),

    // ─── OLED Black ─────────────────────────────────────────────────────────
    JujoThemeId.oled: JujoPalette(
      background: Color(0xFF000000),
      surface: Color(0xFF0C0C12),
      surfaceVariant: Color(0xFF110E1E),
      accent: Color(0xFF7B3FE4),
      accentLight: Color(0xFFB08FFF),
      accentMuted: Color(0xFF29184C),
      secondary: Color(0xFF14081F),
      highlight: Color(0xFFE040FB),
      warm: Color(0xFFD040BE),
      muted: Color(0xFF29184C),
    ),

    // ─── Cyberpunk Neon ────────���────────────────────────────────────────────
    JujoThemeId.cyberpunk: JujoPalette(
      background: Color(0xFF080814),
      surface: Color(0xFF0F0F22),
      surfaceVariant: Color(0xFF151530),
      accent: Color(0xFFFF2D95),
      accentLight: Color(0xFFFF7EC7),
      accentMuted: Color(0xFF2A0926),
      secondary: Color(0xFF0A1F2F),
      highlight: Color(0xFF00FFF5),
      warm: Color(0xFFFFE000),
      muted: Color(0xFF2A0926),
    ),

    // ─── Forest ─────────────────────────────────────────────────────────────
    JujoThemeId.forest: JujoPalette(
      background: Color(0xFF0A120A),
      surface: Color(0xFF121E12),
      surfaceVariant: Color(0xFF172B17),
      accent: Color(0xFF2E7D32),
      accentLight: Color(0xFF69BB5E),
      accentMuted: Color(0xFF1F3A12),
      secondary: Color(0xFF1C3A10),
      highlight: Color(0xFFB2FF59),
      warm: Color(0xFFD4A017),
      muted: Color(0xFF1F3A12),
    ),

    // ─── Sunset ─────────────────────────────────────────────────────────────
    JujoThemeId.sunset: JujoPalette(
      background: Color(0xFF120A04),
      surface: Color(0xFF1E1008),
      surfaceVariant: Color(0xFF281508),
      accent: Color(0xFFE65100),
      accentLight: Color(0xFFFF8A3D),
      accentMuted: Color(0xFF3E200A),
      secondary: Color(0xFF3B1A0A),
      highlight: Color(0xFFFFD740),
      warm: Color(0xFFFF5072),
      muted: Color(0xFF3E200A),
    ),

    // ─── Ember ──────────────────────────────────────────────────────────────
    JujoThemeId.ember: JujoPalette(
      background: Color(0xFF141F22),
      surface: Color(0xFF1E2B2F),
      surfaceVariant: Color(0xFF233035),
      accent: Color(0xFFFF7F50),
      accentLight: Color(0xFFFFAA80),
      accentMuted: Color(0xFF2E3F44),
      secondary: Color(0xFF253538),
      highlight: Color(0xFFFFBF80),
      warm: Color(0xFFFFD86E),
      muted: Color(0xFF2E3F44),
    ),

    // ─── Light ──────────────────────────────────────────────────────────────
    JujoThemeId.light: JujoPalette(
      background: Color(0xFFF8F9FC),
      surface: Color(0xFFFFFFFF),
      surfaceVariant: Color(0xFFF1F3F8),
      accent: Color(0xFF6C3CE1),
      accentLight: Color(0xFF9B71F5),
      accentMuted: Color(0xFFE8E0FA),
      secondary: Color(0xFF5476B3),
      highlight: Color(0xFF00B8D4),
      warm: Color(0xFFFF7F50),
      muted: Color(0xFFB0B8C9),
      isLight: true,
    ),
  };

  /// Get palette by ID. Falls back to jujo.
  static JujoPalette get(JujoThemeId id) => all[id] ?? all[JujoThemeId.jujo]!;

  /// Human-readable label for each palette.
  static String label(JujoThemeId id) => switch (id) {
        JujoThemeId.jujo => 'JUJO Purple',
        JujoThemeId.deBoosy => 'De Boosy',
        JujoThemeId.shioryPan => 'Shiory Pan',
        JujoThemeId.lazyAnkui => 'Lazy Ankui',
        JujoThemeId.midnight => 'Midnight Blue',
        JujoThemeId.oled => 'OLED Black',
        JujoThemeId.cyberpunk => 'Cyberpunk Neon',
        JujoThemeId.forest => 'Forest',
        JujoThemeId.sunset => 'Sunset',
        JujoThemeId.ember => 'Ember',
        JujoThemeId.light => 'Light',
      };

  /// Icon for each palette.
  static IconData icon(JujoThemeId id) => switch (id) {
        JujoThemeId.jujo => Icons.auto_awesome,
        JujoThemeId.deBoosy => Icons.pets,
        JujoThemeId.shioryPan => Icons.pets,
        JujoThemeId.lazyAnkui => Icons.pets,
        JujoThemeId.midnight => Icons.dark_mode,
        JujoThemeId.oled => Icons.brightness_1,
        JujoThemeId.cyberpunk => Icons.electric_bolt,
        JujoThemeId.forest => Icons.park,
        JujoThemeId.sunset => Icons.wb_twilight,
        JujoThemeId.ember => Icons.local_fire_department,
        JujoThemeId.light => Icons.light_mode,
      };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Semantic Color Tokens — used by AppTheme for Material 3 ColorScheme
// ═══════════════════════════════════════════════════════════════════════════════

/// Semantic color tokens for the Jujo.Stream design system.
/// Maps to Material 3 ColorScheme with additional semantic meaning.
///
/// Usage: `Theme.of(context).colorScheme.primary` or `AppColors.semantic(context).success`
abstract final class AppColors {
  // ─── Brand Colors (from Jujo Purple palette) ────────────────────────────────

  /// Primary brand color — used for primary actions, active states, focus rings.
  static const Color brandPrimary = Color(0xFF6C3CE1); // Jujo Purple accent
  static const Color brandPrimaryLight = Color(0xFF9B71F5); // Jujo Purple accentLight
  static const Color brandPrimaryDark = Color(0xFF4F2DB8); // Darker variant

  /// Secondary brand — complementary blue.
  static const Color brandSecondary = Color(0xFF5476B3); // De Boosy secondary
  static const Color brandSecondaryLight = Color(0xFF79A3E0);
  static const Color brandSecondaryDark = Color(0xFF3A5A8A);

  /// Tertiary — highlight/cyan from Jujo palette.
  static const Color brandTertiary = Color(0xFF00B8D4);
  static const Color brandTertiaryLight = Color(0xFF00E5FF);
  static const Color brandTertiaryDark = Color(0xFF008BA0);

  // ─── Neutral Palette ────────────────────────────────────────────────────────

  static const Color neutral50 = Color(0xFFF8F9FC);
  static const Color neutral100 = Color(0xFFF1F3F8);
  static const Color neutral150 = Color(0xFFE8EBF2);
  static const Color neutral200 = Color(0xFFDFE3ED);
  static const Color neutral300 = Color(0xFFC8CDD9);
  static const Color neutral400 = Color(0xFFB0B8C9);
  static const Color neutral500 = Color(0xFF8892A6);
  static const Color neutral600 = Color(0xFF636D82);
  static const Color neutral700 = Color(0xFF454D5F);
  static const Color neutral800 = Color(0xFF2C3344);
  static const Color neutral850 = Color(0xFF1E2433);
  static const Color neutral900 = Color(0xFF151A28);
  static const Color neutral950 = Color(0xFF0E1019);

  // ─── Accent Muted (for light theme backgrounds/badges) ──────────────────────

  static const Color accentMutedLight = Color(0xFFE8E0FA); // Very light purple
  static const Color accentMutedMedium = Color(0xFFD4C8F5); // Medium light purple
  static const Color accentMutedDark = Color(0xFF2D2864); // Dark muted purple

  // ─── Warm Palette ───────────────────────────────────────────────────────────

  static const Color warm50 = Color(0xFFFFF7ED);
  static const Color warm100 = Color(0xFFFFEDD5);
  static const Color warm200 = Color(0xFFFFD6A5);
  static const Color warm300 = Color(0xFFFFB86C);
  static const Color warm400 = Color(0xFFFF9A3D);
  static const Color warm500 = Color(0xFFFF7F50); // Ember accent
  static const Color warm600 = Color(0xFFE65100); // Sunset accent

  // ─── Semantic Status Colors ─────────────────────────────────────────────────

  static const Color success = Color(0xFF2EA043);
  static const Color successLight = Color(0xFF69BB5E);
  static const Color successMuted = Color(0xFFDCFCE7);
  static const Color successMutedDark = Color(0xFF166534);

  static const Color warning = Color(0xFFD4A017);
  static const Color warningLight = Color(0xFFFFD740);
  static const Color warningMuted = Color(0xFFFEF9C3);
  static const Color warningMutedDark = Color(0xFF92400E);

  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFCA5A5);
  static const Color errorMuted = Color(0xFFFEE2E2);
  static const Color errorMutedDark = Color(0xFF991B1B);

  static const Color info = Color(0xFF1F6FEB);
  static const Color infoLight = Color(0xFF58A6FF);
  static const Color infoMuted = Color(0xFFDBEAFE);
  static const Color infoMutedDark = Color(0xFF1E40AF);

  // ─── Platform Brand Colors (for game source cards) ──────────────────────────

  static const Color steam = Color(0xFF1B2838);
  static const Color steamLight = Color(0xFF2A475E);
  static const Color epic = Color(0xFF2A2A2A);
  static const Color gog = Color(0xFF6441A5);
  static const Color xbox = Color(0xFF107C10);
  static const Color playnite = Color(0xFF4C2882);

  // ─── Helper: Get semantic colors from context ───────────────────────────────

  static SemanticColors semantic(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark
        ? const SemanticColors.dark()
        : const SemanticColors.light();
  }
}

/// Semantic color set that adapts to light/dark mode.
/// Provides surface, text, and border tokens for consistent UI.
class SemanticColors {
  final Color background;
  final Color surface;
  final Color surfaceElevated;
  final Color surfaceVariant;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color borderSubtle;
  final Color borderDefault;
  final Color accentMuted;

  const SemanticColors.dark()
      : background = AppColors.neutral950,
        surface = AppColors.neutral900,
        surfaceElevated = AppColors.neutral850,
        surfaceVariant = const Color(0xFF1C1D38),
        textPrimary = AppColors.neutral50,
        textSecondary = AppColors.neutral400,
        textMuted = AppColors.neutral500,
        borderSubtle = const Color(0x1AFFFFFF), // white 10%
        borderDefault = const Color(0x33FFFFFF), // white 20%
        accentMuted = AppColors.accentMutedDark;

  const SemanticColors.light()
      : background = AppColors.neutral50,
        surface = const Color(0xFFFFFFFF),
        surfaceElevated = AppColors.neutral100,
        surfaceVariant = AppColors.neutral150,
        textPrimary = AppColors.neutral900,
        textSecondary = AppColors.neutral600,
        textMuted = AppColors.neutral400,
        borderSubtle = const Color(0x0D000000), // black 5%
        borderDefault = const Color(0x1A000000), // black 10%
        accentMuted = AppColors.accentMutedLight;
}
