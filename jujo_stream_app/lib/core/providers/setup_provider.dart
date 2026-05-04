import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/setup_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Provider for the SetupStatusApi service.
/// Uses select() to only rebuild when serverUrl changes, not on every auth state update.
final setupApiProvider = Provider<SetupStatusApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl =
      ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return SetupStatusApi(client: client);
});

/// Async provider that fetches setup status from the server.
/// Auto-refreshes when auth state changes.
final setupStatusProvider =
    FutureProvider.autoDispose<SetupStatusResponse?>((ref) async {
  final api = ref.watch(setupApiProvider);
  return api.getStatus();
});

/// Derived: is setup complete?
final isSetupCompleteProvider = Provider<bool>((ref) {
  final status = ref.watch(setupStatusProvider);
  return status.valueOrNull?.setupComplete ?? false;
});

/// Derived: paired client count.
final pairedClientCountProvider = Provider<int>((ref) {
  return ref.watch(setupStatusProvider).valueOrNull?.pairedClientCount ?? 0;
});

/// Derived: connected source count.
final connectedSourceCountProvider = Provider<int>((ref) {
  return ref.watch(setupStatusProvider).valueOrNull?.connectedSourceCount ?? 0;
});

/// Derived: playable game count.
final playableGameCountProvider = Provider<int>((ref) {
  return ref.watch(setupStatusProvider).valueOrNull?.playableGameCount ?? 0;
});
