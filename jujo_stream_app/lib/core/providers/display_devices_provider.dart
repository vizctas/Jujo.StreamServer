import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/display_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Provider for the DisplayApi service.
final displayApiProvider = Provider<DisplayApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return DisplayApi(client: client);
});

/// Fetches available display devices from the server.
/// Auto-disposes when the widget is removed.
final displayDevicesProvider =
    FutureProvider.autoDispose<List<DisplayDeviceDto>>((ref) async {
  final api = ref.watch(displayApiProvider);
  return api.getDevices(full: true);
});
