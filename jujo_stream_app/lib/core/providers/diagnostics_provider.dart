import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/diagnostics_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

final diagnosticsApiProvider = Provider<DiagnosticsApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return DiagnosticsApi(client: client);
});

final systemDiagnosticsProvider =
    FutureProvider.autoDispose<SystemDiagnosticsDto?>((ref) async {
      return ref.watch(diagnosticsApiProvider).getDiagnostics();
    });

final systemStatusProvider = FutureProvider.autoDispose<SystemStatusDto?>((
  ref,
) async {
  return ref.watch(diagnosticsApiProvider).getStatus();
});
