import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/config_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

// ─── API Provider ─────────────────────────────────────────────────────────────

final configApiProvider = Provider<ConfigApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return ConfigApi(client: client);
});

// ─── Config State ─────────────────────────────────────────────────────────────

/// Holds the full server config + pending local changes.
class StreamConfigState {
  const StreamConfigState({
    this.serverConfig,
    this.pendingChanges = const {},
    this.isLoading = false,
    this.error,
    this.lastApplyResult,
  });

  final Map<String, dynamic>? serverConfig;
  final Map<String, dynamic> pendingChanges;
  final bool isLoading;
  final String? error;
  final ConfigApplyResult? lastApplyResult;

  bool get hasChanges => pendingChanges.isNotEmpty;

  /// Get a config value: pending change takes priority over server value.
  dynamic getValue(String key) {
    if (pendingChanges.containsKey(key)) return pendingChanges[key];
    return serverConfig?[key];
  }

  StreamConfigState copyWith({
    Map<String, dynamic>? serverConfig,
    Map<String, dynamic>? pendingChanges,
    bool? isLoading,
    String? error,
    ConfigApplyResult? lastApplyResult,
  }) {
    return StreamConfigState(
      serverConfig: serverConfig ?? this.serverConfig,
      pendingChanges: pendingChanges ?? this.pendingChanges,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastApplyResult: lastApplyResult ?? this.lastApplyResult,
    );
  }
}

// ─── Config Notifier ──────────────────────────────────────────────────────────

final streamConfigProvider =
    StateNotifierProvider<StreamConfigNotifier, StreamConfigState>((ref) {
  return StreamConfigNotifier(ref);
});

class StreamConfigNotifier extends StateNotifier<StreamConfigState> {
  StreamConfigNotifier(this._ref) : super(const StreamConfigState());

  final Ref _ref;

  ConfigApi get _api => _ref.read(configApiProvider);

  /// Load config from server.
  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    final config = await _api.getConfig();
    if (config != null) {
      state = state.copyWith(
        serverConfig: config,
        isLoading: false,
        pendingChanges: {},
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load configuration',
      );
    }
  }

  /// Stage a local change (not yet applied to server).
  void setField(String key, dynamic value) {
    final changes = Map<String, dynamic>.from(state.pendingChanges);
    changes[key] = value;
    state = state.copyWith(pendingChanges: changes);
  }

  /// Discard all pending changes.
  void discardChanges() {
    state = state.copyWith(pendingChanges: {});
  }

  /// Apply pending changes to the server.
  Future<ConfigApplyResult> apply() async {
    if (!state.hasChanges) {
      return const ConfigApplyResult(success: true, message: 'No changes');
    }

    state = state.copyWith(isLoading: true);
    final result = await _api.applyConfig(state.pendingChanges);

    if (result.success) {
      // Merge changes into server config
      final merged = Map<String, dynamic>.from(state.serverConfig ?? {});
      merged.addAll(state.pendingChanges);
      state = state.copyWith(
        serverConfig: merged,
        pendingChanges: {},
        isLoading: false,
        lastApplyResult: result,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        error: result.message,
        lastApplyResult: result,
      );
    }

    return result;
  }

  /// Restart the server.
  Future<bool> restart() async {
    return _api.restart();
  }
}

// ─── Derived Convenience Providers ────────────────────────────────────────────

/// Current encoder value.
final currentEncoderProvider = Provider<String>((ref) {
  return ref.watch(streamConfigProvider).getValue('encoder') as String? ?? 'auto';
});

/// Current codec (hevc_mode / av1_mode).
final currentCodecProvider = Provider<String>((ref) {
  final config = ref.watch(streamConfigProvider);
  final hevc = config.getValue('hevc_mode') as int? ?? 0;
  final av1 = config.getValue('av1_mode') as int? ?? 0;
  if (av1 > 0) return 'av1';
  if (hevc > 0) return 'hevc';
  return 'h264';
});
