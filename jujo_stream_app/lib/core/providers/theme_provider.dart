import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:jujo_stream_app/core/theme/app_theme.dart';
import 'package:jujo_stream_app/core/theme/colors.dart';

const _kThemePresetKey = 'jujo_theme_preset';
const _kDensityKey = 'jujo_density';

/// Available theme presets.
enum ThemePreset {
  jujoDefault('Jujo Default', AppColors.brandPrimary, Brightness.dark),
  midnight('Midnight', Color(0xFF1E293B), Brightness.dark),
  oled('OLED', Color(0xFF000000), Brightness.dark),
  forest('Forest', Color(0xFF059669), Brightness.dark),
  ember('Ember', Color(0xFFDC2626), Brightness.dark),
  light('Light', AppColors.brandPrimary, Brightness.light);

  const ThemePreset(this.label, this.primaryColor, this.brightness);

  final String label;
  final Color primaryColor;
  final Brightness brightness;

  ThemeMode get themeMode =>
      brightness == Brightness.dark ? ThemeMode.dark : ThemeMode.light;

  ThemeData get themeData =>
      brightness == Brightness.dark ? AppTheme.dark : AppTheme.light;

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
