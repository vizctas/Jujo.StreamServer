import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/update_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/services/backend_update_service.dart';

final updateApiProvider = Provider<UpdateApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return UpdateApi(client: client);
});

final backendUpdateServiceProvider = Provider<BackendUpdateService>((ref) {
  return BackendUpdateService();
});

final updateStatusProvider = FutureProvider.autoDispose<UpdateStatusDto?>((
  ref,
) async {
  return ref.watch(updateApiProvider).getStatus();
});

final updateCheckProvider = FutureProvider.autoDispose<UpdateStatusDto?>((
  ref,
) async {
  return ref.watch(updateApiProvider).triggerCheck();
});
