import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';

const _kOnboardingKey = 'jujo_onboarding_complete';

/// Onboarding completion state loaded from SharedPreferences.
///
/// - `null`  — still loading (prefs not read yet)
/// - `false` — not yet completed
/// - `true`  — completed; skip onboarding
///
/// On a second device, if the user already has cloud server profiles,
/// onboarding is auto-completed (they don't need to deploy again).
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
    final localFlag = prefs.getBool(_kOnboardingKey) ?? false;

    if (localFlag) {
      if (mounted) state = true;
      return;
    }

    // Not completed locally — check if user has existing cloud profiles
    // (second device scenario). If yes, skip onboarding.
    if (SupabaseConfig.current.isConfigured) {
      try {
        final user = Supabase.instance.client.auth.currentUser;
        if (user != null) {
          final response = await Supabase.instance.client
              .from('user_server_profiles')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);

          if ((response as List).isNotEmpty) {
            // User has existing profiles — auto-complete onboarding
            await prefs.setBool(_kOnboardingKey, true);
            if (mounted) state = true;
            return;
          }
        }
      } catch (_) {
        // Cloud check failed — fall through to normal onboarding
      }
    }

    if (mounted) state = false;
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
