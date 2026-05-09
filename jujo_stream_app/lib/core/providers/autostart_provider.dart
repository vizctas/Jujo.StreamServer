import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/autostart_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

final autoStartApiProvider = Provider<AutoStartApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return AutoStartApi(client: client);
});

final autoStartStatusProvider = FutureProvider.autoDispose<AutoStartStatusDto?>(
  (ref) async {
    return ref.watch(autoStartApiProvider).getStatus();
  },
);
