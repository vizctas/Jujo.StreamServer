import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kOnboardingKey = 'jujo_onboarding_complete';

/// Onboarding completion state loaded from SharedPreferences.
///
/// - `null`  — still loading (prefs not read yet)
/// - `false` — not yet completed
/// - `true`  — completed; skip onboarding
final onboardingProvider =
    StateNotifierProvider<OnboardingNotifier, bool?>((ref) {
  return OnboardingNotifier();
});

class OnboardingNotifier extends StateNotifier<bool?> {
  OnboardingNotifier() : super(null) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) state = prefs.getBool(_kOnboardingKey) ?? false;
  }

  /// Mark onboarding as complete and persist the flag.
  Future<void> complete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kOnboardingKey, true);
    state = true;
  }

  /// Reset onboarding (useful for testing / "Redo setup" action).
  Future<void> reset() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kOnboardingKey);
    state = false;
  }
}
