import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../models/streaming_session.dart';
import '../providers/server_profiles_provider.dart';

/// Service for managing streaming sessions on the connected server.
class StreamingSessionsService {
  StreamingSessionsService({required this.baseUrl});

  final String baseUrl;

  /// Fetch all active streaming sessions.
  Future<List<StreamingSession>> listSessions() async {
    final uri = Uri.parse('$baseUrl/api/webrtc/sessions');
    final response = await http.get(uri, headers: {
      'Content-Type': 'application/json',
    });
    if (response.statusCode != 200) {
      throw Exception('Failed to fetch sessions: ${response.statusCode}');
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final sessions = json['sessions'] as List<dynamic>? ?? [];
    return sessions
        .map((s) => StreamingSession.fromJson(s as Map<String, dynamic>))
        .toList();
  }

  /// Terminate a streaming session by ID (requires admin role).
  Future<void> deleteSession(String sessionId) async {
    final uri = Uri.parse('$baseUrl/api/webrtc/sessions/$sessionId');
    final response = await http.delete(uri, headers: {
      'Content-Type': 'application/json',
    });
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete session: ${response.statusCode}');
    }
  }
}

/// Provider that polls active streaming sessions every 5 seconds.
final streamingSessionsProvider =
    StreamProvider.autoDispose<List<StreamingSession>>((ref) async* {
  final profileState = ref.watch(serverProfilesProvider);
  final activeUrl = profileState.activeProfile?.url;
  if (activeUrl == null || activeUrl.isEmpty) {
    yield [];
    return;
  }

  final service = StreamingSessionsService(baseUrl: activeUrl);

  // Initial fetch
  try {
    yield await service.listSessions();
  } catch (_) {
    yield [];
  }

  // Poll every 5 seconds
  await for (final _ in Stream.periodic(const Duration(seconds: 5))) {
    try {
      yield await service.listSessions();
    } catch (_) {
      yield [];
    }
  }
});
