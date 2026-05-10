import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:jujo_stream_app/core/theme/app_theme.dart';
import 'package:jujo_stream_app/core/theme/colors.dart';

const _kThemePresetKey = 'jujo_theme_preset';
const _kDensityKey = 'jujo_density';

/// Available theme presets — maps to JujoThemeId palettes from jujo.client.
enum ThemePreset {
  jujoDefault('JUJO Purple', JujoThemeId.jujo, Brightness.dark),
  lazyAnkui('Lazy Ankui', JujoThemeId.lazyAnkui, Brightness.dark),
  shioryPan('Shiory Pan', JujoThemeId.shioryPan, Brightness.dark),
  deBoosy('De Boosy', JujoThemeId.deBoosy, Brightness.dark),
  light('Light', JujoThemeId.light, Brightness.light);

  const ThemePreset(this.label, this.paletteId, this.brightness);

  final String label;
  final JujoThemeId paletteId;
  final Brightness brightness;

  /// Get the full color palette for this preset.
  JujoPalette get palette => JujoPalettes.get(paletteId);

  /// Icon for the theme selector UI.
  IconData get icon => JujoPalettes.icon(paletteId);

  ThemeMode get themeMode =>
      brightness == Brightness.dark ? ThemeMode.dark : ThemeMode.light;

  ThemeData get themeData => AppTheme.fromPalette(palette);

  static const selectable = [
    ThemePreset.light,
    ThemePreset.jujoDefault,
    ThemePreset.lazyAnkui,
    ThemePreset.shioryPan,
    ThemePreset.deBoosy,
  ];

  static ThemePreset fromName(String name) {
    return ThemePreset.values.firstWhere(
      (p) => p.name == name,
      orElse: () => ThemePreset.jujoDefault,
    );
  }
}

/// Available density modes.
enum DensityMode {
  compact('Compact', VisualDensity.compact),
  comfortable('Comfortable', VisualDensity.comfortable);

  const DensityMode(this.label, this.visualDensity);

  final String label;
  final VisualDensity visualDensity;
}

// ─── Theme Preset Provider ────────────────────────────────────────────────────

final themePresetProvider =
    StateNotifierProvider<ThemePresetNotifier, ThemePreset>((ref) {
  return ThemePresetNotifier();
});

class ThemePresetNotifier extends StateNotifier<ThemePreset> {
  ThemePresetNotifier() : super(ThemePreset.jujoDefault) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final name = prefs.getString(_kThemePresetKey);
    if (name != null && mounted) {
      state = ThemePreset.fromName(name);
    }
  }

  Future<void> setPreset(ThemePreset preset) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kThemePresetKey, preset.name);
    state = preset;
  }
}

/// Derived: current ThemeMode from preset.
final themeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(themePresetProvider).themeMode;
});

/// Derived: current JujoPalette from preset.
/// Use this to access accent, warm, highlight, muted colors in widgets.
final paletteProvider = Provider<JujoPalette>((ref) {
  return ref.watch(themePresetProvider).palette;
});

// ─── Density Provider ─────────────────────────────────────────────────────────

final densityProvider =
    StateNotifierProvider<DensityNotifier, DensityMode>((ref) {
  return DensityNotifier();
});

class DensityNotifier extends StateNotifier<DensityMode> {
  DensityNotifier() : super(DensityMode.comfortable) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final name = prefs.getString(_kDensityKey);
    if (name != null && mounted) {
      final mode = DensityMode.values.firstWhere(
        (d) => d.name == name,
        orElse: () => DensityMode.comfortable,
      );
      state = mode;
    }
  }

  Future<void> setDensity(DensityMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kDensityKey, mode.name);
    state = mode;
  }
}
