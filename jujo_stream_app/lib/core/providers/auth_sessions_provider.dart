import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/auth_sessions_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Provider for the AuthSessionsApi service.
final authSessionsApiProvider = Provider<AuthSessionsApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return AuthSessionsApi(client: client);
});

/// Fetches paired client sessions from the server.
final authSessionsProvider =
    AsyncNotifierProvider<AuthSessionsNotifier, List<AuthSessionDto>>(
  AuthSessionsNotifier.new,
);

class AuthSessionsNotifier extends AsyncNotifier<List<AuthSessionDto>> {
  @override
  Future<List<AuthSessionDto>> build() async {
    final api = ref.watch(authSessionsApiProvider);
    return api.getSessions();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authSessionsApiProvider).getSessions(),
    );
  }

  /// Revoke a session by ID. Returns true on success.
  Future<bool> revoke(String id) async {
    final api = ref.read(authSessionsApiProvider);
    final success = await api.revokeSession(id);
    if (success) await refresh();
    return success;
  }
}
