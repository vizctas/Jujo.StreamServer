import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/health_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

class CrashDumpState {
  const CrashDumpState({this.status, this.dismissed = false, this.loading = false});
  final CrashDumpStatus? status;
  final bool dismissed;
  final bool loading;

  bool get shouldShow => status != null && status!.detected && !dismissed;
}

class CrashDumpNotifier extends StateNotifier<CrashDumpState> {
  CrashDumpNotifier(this._ref) : super(const CrashDumpState(loading: true)) {
    _fetch();
  }

  final Ref _ref;

  Future<void> _fetch() async {
    final authNotifier = _ref.read(authProvider.notifier);
    final serverUrl = _ref.read(authProvider).serverUrl ?? '';
    if (serverUrl.isEmpty) {
      state = const CrashDumpState();
      return;
    }
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final api = HealthApi(client: client);
    final result = await api.getCrashDumpStatus();
    if (mounted) {
      state = CrashDumpState(status: result);
    }
  }

  Future<void> dismiss() async {
    state = CrashDumpState(status: state.status, dismissed: true);
    final authNotifier = _ref.read(authProvider.notifier);
    final serverUrl = _ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final api = HealthApi(client: client);
    await api.dismissCrashDump();
  }

  Future<void> refresh() async {
    state = CrashDumpState(loading: true);
    await _fetch();
  }
}

final crashDumpProvider = StateNotifierProvider.autoDispose<CrashDumpNotifier, CrashDumpState>((ref) {
  return CrashDumpNotifier(ref);
});

final shouldShowCrashBannerProvider = Provider.autoDispose<bool>((ref) {
  return ref.watch(crashDumpProvider).shouldShow;
});
