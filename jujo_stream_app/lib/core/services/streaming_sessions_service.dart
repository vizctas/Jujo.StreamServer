import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../models/streaming_session.dart';
import '../providers/auth_provider.dart';

/// Service for managing streaming sessions on the connected server.
///
/// Uses [ApiClient] for proper auth token injection and self-signed cert trust.
class StreamingSessionsService {
  StreamingSessionsService({required this.client});

  final ApiClient client;

  /// Fetch all active streaming sessions.
  Future<List<StreamingSession>> listSessions() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/webrtc/sessions',
      );
      if (response.statusCode == 200 && response.data != null) {
        final sessions = response.data!['sessions'] as List<dynamic>? ?? [];
        return sessions
            .map((s) => StreamingSession.fromJson(s as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Terminate a streaming session by ID (requires admin role).
  Future<bool> deleteSession(String sessionId) async {
    try {
      final response = await client.delete<Map<String, dynamic>>(
        '/api/webrtc/sessions/$sessionId',
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (_) {
      return false;
    }
  }
}

/// Provider that polls active streaming sessions every 5 seconds.
///
/// Uses the auth-aware [ApiClient] so requests include the Bearer token
/// and trust self-signed certificates.
final streamingSessionsProvider =
    StreamProvider.autoDispose<List<StreamingSession>>((ref) async* {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final token = ref.watch(authProvider.select((s) => s.token)) ?? '';

  // Don't poll without a valid server URL and token.
  if (serverUrl.isEmpty || token.isEmpty) {
    yield [];
    return;
  }

  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  final service = StreamingSessionsService(client: client);

  // Initial fetch
  yield await service.listSessions();

  // Poll every 5 seconds
  await for (final _ in Stream.periodic(const Duration(seconds: 5))) {
    yield await service.listSessions();
  }
});
