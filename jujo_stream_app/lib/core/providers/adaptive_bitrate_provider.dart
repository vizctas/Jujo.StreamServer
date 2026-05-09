
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/services/stream_health_api.dart';
import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/providers/stream_health_provider.dart';

// ─── Adaptive Bitrate Presets ─────────────────────────────────────────────────

/// Ordered from lowest to highest bitrate.
/// The controller steps down on degradation, steps up on recovery.
enum AdaptivePreset {
  performance(bitrate: 10000, label: 'Performance'),
  balanced(bitrate: 20000, label: 'Balanced'),
  quality(bitrate: 50000, label: 'Quality');

  const AdaptivePreset({required this.bitrate, required this.label});
  final int bitrate;
  final String label;
}

// ─── Adaptive State ───────────────────────────────────────────────────────────

enum AdaptiveAction { none, downshift, upshift }

class AdaptiveBitrateState {
  const AdaptiveBitrateState({
    this.enabled = false,
    this.currentPreset = AdaptivePreset.balanced,
    this.lastAction = AdaptiveAction.none,
    this.lastSwitchTime,
    this.degradedSamples = 0,
    this.healthySamples = 0,
    this.isActive = false,
  });

  /// Whether adaptive mode is enabled by the user.
  final bool enabled;

  /// Current active preset.
  final AdaptivePreset currentPreset;

  /// Last action taken.
  final AdaptiveAction lastAction;

  /// When the last switch occurred.
  final DateTime? lastSwitchTime;

  /// Consecutive degraded health samples (score < downshiftThreshold).
  final int degradedSamples;

  /// Consecutive healthy samples (score >= upshiftThreshold).
  final int healthySamples;

  /// Whether the controller is actively monitoring (streaming + enabled).
  final bool isActive;

  /// Whether we're in cooldown (can't switch yet).
  bool get inCooldown {
    if (lastSwitchTime == null) return false;
    return DateTime.now().difference(lastSwitchTime!) < AdaptiveBitrateController.cooldownDuration;
  }

  /// Can step down to a lower preset.
  bool get canDownshift => currentPreset.index > 0;

  /// Can step up to a higher preset.
  bool get canUpshift => currentPreset.index < AdaptivePreset.values.length - 1;

  AdaptiveBitrateState copyWith({
    bool? enabled,
    AdaptivePreset? currentPreset,
    AdaptiveAction? lastAction,
    DateTime? lastSwitchTime,
    int? degradedSamples,
    int? healthySamples,
    bool? isActive,
  }) {
    return AdaptiveBitrateState(
      enabled: enabled ?? this.enabled,
      currentPreset: currentPreset ?? this.currentPreset,
      lastAction: lastAction ?? this.lastAction,
      lastSwitchTime: lastSwitchTime ?? this.lastSwitchTime,
      degradedSamples: degradedSamples ?? this.degradedSamples,
      healthySamples: healthySamples ?? this.healthySamples,
      isActive: isActive ?? this.isActive,
    );
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────

class AdaptiveBitrateController extends StateNotifier<AdaptiveBitrateState> {
  AdaptiveBitrateController(this._ref) : super(const AdaptiveBitrateState()) {
    // Listen to stream health updates
    _ref.listen<AsyncValue<StreamHealthDto?>>(
      streamHealthStreamProvider,
      (_, next) {
        final health = next.valueOrNull;
        if (health != null) {
          _onHealthUpdate(health);
        }
      },
    );

    // Listen to streaming state
    _ref.listen<bool>(isStreamingProvider, (_, isStreaming) {
      state = state.copyWith(isActive: isStreaming && state.enabled);
      if (!isStreaming) {
        // Reset counters when streaming stops
        state = state.copyWith(degradedSamples: 0, healthySamples: 0);
      }
    });
  }

  final Ref _ref;

  // ─── Thresholds (tunable) ───────────────────────────────────────────────

  /// Health score below this triggers downshift consideration.
  static const int downshiftThreshold = 60;

  /// Health score above this triggers upshift consideration.
  static const int upshiftThreshold = 85;

  /// Consecutive degraded samples needed before downshifting.
  /// At 3s polling = 9 seconds of sustained degradation.
  static const int downshiftSamplesRequired = 3;

  /// Consecutive healthy samples needed before upshifting.
  /// At 3s polling = 30 seconds of sustained health.
  static const int upshiftSamplesRequired = 10;

  /// Minimum time between switches.
  static const Duration cooldownDuration = Duration(seconds: 15);

  // ─── Public API ─────────────────────────────────────────────────────────

  /// Enable/disable adaptive mode.
  void setEnabled(bool enabled) {
    state = state.copyWith(
      enabled: enabled,
      isActive: enabled && (_ref.read(isStreamingProvider)),
      degradedSamples: 0,
      healthySamples: 0,
    );
  }

  /// Manually set the current preset (e.g., user picks one in UI).
  void setPreset(AdaptivePreset preset) {
    state = state.copyWith(
      currentPreset: preset,
      degradedSamples: 0,
      healthySamples: 0,
    );
  }

  /// Detect current preset from server config.
  void syncFromConfig() {
    final config = _ref.read(streamConfigProvider);
    final bitrate = config.getValue('max_bitrate') as int? ?? 20000;
    AdaptivePreset detected;
    if (bitrate <= 10000) {
      detected = AdaptivePreset.performance;
    } else if (bitrate >= 40000) {
      detected = AdaptivePreset.quality;
    } else {
      detected = AdaptivePreset.balanced;
    }
    state = state.copyWith(currentPreset: detected);
  }

  // ─── Private Logic ──────────────────────────────────────────────────────

  void _onHealthUpdate(StreamHealthDto health) {
    if (!state.enabled || !state.isActive) return;
    if (state.inCooldown) return;
    if (!health.hasActiveSessions) return;

    final score = health.healthScore;

    if (score < downshiftThreshold) {
      // Degradation detected
      final newDegraded = state.degradedSamples + 1;
      state = state.copyWith(degradedSamples: newDegraded, healthySamples: 0);

      if (newDegraded >= downshiftSamplesRequired && state.canDownshift) {
        _downshift();
      }
    } else if (score >= upshiftThreshold) {
      // Recovery detected
      final newHealthy = state.healthySamples + 1;
      state = state.copyWith(healthySamples: newHealthy, degradedSamples: 0);

      if (newHealthy >= upshiftSamplesRequired && state.canUpshift) {
        _upshift();
      }
    } else {
      // In the middle zone — reset both counters (stable)
      state = state.copyWith(degradedSamples: 0, healthySamples: 0);
    }
  }

  void _downshift() {
    final nextIndex = state.currentPreset.index - 1;
    if (nextIndex < 0) return;

    final nextPreset = AdaptivePreset.values[nextIndex];
    _applyPreset(nextPreset, AdaptiveAction.downshift);
  }

  void _upshift() {
    final nextIndex = state.currentPreset.index + 1;
    if (nextIndex >= AdaptivePreset.values.length) return;

    final nextPreset = AdaptivePreset.values[nextIndex];
    _applyPreset(nextPreset, AdaptiveAction.upshift);
  }

  void _applyPreset(AdaptivePreset preset, AdaptiveAction action) {
    // Apply to server config
    final notifier = _ref.read(streamConfigProvider.notifier);
    notifier.setField('max_bitrate', preset.bitrate);
    notifier.apply(); // Fire and forget — apply is async but we don't block

    state = state.copyWith(
      currentPreset: preset,
      lastAction: action,
      lastSwitchTime: DateTime.now(),
      degradedSamples: 0,
      healthySamples: 0,
    );
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final adaptiveBitrateProvider =
    StateNotifierProvider<AdaptiveBitrateController, AdaptiveBitrateState>((ref) {
  return AdaptiveBitrateController(ref);
});

/// Whether adaptive mode is currently enabled.
final isAdaptiveEnabledProvider = Provider<bool>((ref) {
  return ref.watch(adaptiveBitrateProvider).enabled;
});

/// Whether adaptive mode is actively monitoring and can switch.
final isAdaptiveActiveProvider = Provider<bool>((ref) {
  return ref.watch(adaptiveBitrateProvider).isActive;
});
