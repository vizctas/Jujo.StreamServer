import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// TURN server credentials for WebRTC relay connections.
///
/// These are short-lived (default 24h) and generated per-user via
/// the Supabase Edge Function `turn-credentials`.
class TurnCredentials {
  const TurnCredentials({
    required this.urls,
    required this.username,
    required this.credential,
    required this.ttl,
    required this.fetchedAt,
  });

  factory TurnCredentials.fromJson(Map<String, dynamic> json) {
    return TurnCredentials(
      urls: (json['urls'] as List<dynamic>).cast<String>(),
      username: json['username'] as String,
      credential: json['credential'] as String,
      ttl: json['ttl'] as int,
      fetchedAt: DateTime.now(),
    );
  }

  final List<String> urls;
  final String username;
  final String credential;
  final int ttl;
  final DateTime fetchedAt;

  /// Whether these credentials have expired (with 5-minute safety margin).
  bool get isExpired {
    final expiresAt = fetchedAt.add(Duration(seconds: ttl - 300));
    return DateTime.now().isAfter(expiresAt);
  }

  /// Convert to WebRTC ICE server format for the streaming client.
  Map<String, dynamic> toIceServer() => {
        'urls': urls,
        'username': username,
        'credential': credential,
      };
}

/// Service that fetches and caches TURN credentials from Supabase Edge Function.
///
/// Credentials are cached until they expire (TTL - 5min safety margin).
/// Falls back gracefully: if TURN is unavailable, streaming still works
/// on LAN or with port-forwarded connections.
class TurnCredentialService {
  TurnCredentialService(this._client);

  final SupabaseClient _client;
  TurnCredentials? _cached;

  static const _functionName = 'turn-credentials';

  /// Get valid TURN credentials (cached or fresh).
  ///
  /// Returns null if:
  /// - User is not authenticated
  /// - TURN is not configured on the server
  /// - Network error (graceful degradation)
  Future<TurnCredentials?> getCredentials({bool forceRefresh = false}) async {
    // Return cached if still valid
    if (!forceRefresh && _cached != null && !_cached!.isExpired) {
      return _cached;
    }

    try {
      final response = await _client.functions.invoke(
        _functionName,
        method: HttpMethod.post,
      );

      if (response.status != 200) {
        final body = response.data;
        final error = body is Map ? body['error'] : 'HTTP ${response.status}';
        logger.warning('TURN credentials unavailable: $error');
        return null;
      }

      final data = response.data as Map<String, dynamic>;
      _cached = TurnCredentials.fromJson(data);

      logger.info(
        'TURN credentials fetched: ${_cached!.urls.length} server(s), '
        'TTL=${_cached!.ttl}s',
      );
      return _cached;
    } catch (e) {
      logger.warning('Failed to fetch TURN credentials: $e');
      return null;
    }
  }

  /// Clear cached credentials (e.g. on logout).
  void clearCache() {
    _cached = null;
  }

  /// Get ICE servers list for WebRTC configuration.
  ///
  /// Returns a list containing the TURN server(s) if credentials are available,
  /// plus standard STUN servers for NAT traversal.
  Future<List<Map<String, dynamic>>> getIceServers() async {
    final servers = <Map<String, dynamic>>[
      // Always include public STUN for basic NAT traversal
      {
        'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
      },
    ];

    final creds = await getCredentials();
    if (creds != null) {
      servers.add(creds.toIceServer());
    }

    return servers;
  }
}

// ─── Disabled Implementation ──────────────────────────────────────────────────

/// No-op implementation when Supabase is not configured.
class DisabledTurnCredentialService extends TurnCredentialService {
  DisabledTurnCredentialService() : super(SupabaseClient('', ''));

  @override
  Future<TurnCredentials?> getCredentials({bool forceRefresh = false}) async {
    return null;
  }

  @override
  Future<List<Map<String, dynamic>>> getIceServers() async {
    return [
      {
        'urls': ['stun:stun.l.google.com:19302'],
      },
    ];
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final turnCredentialServiceProvider = Provider<TurnCredentialService>((ref) {
  if (!SupabaseConfig.current.isConfigured) {
    return DisabledTurnCredentialService();
  }
  return TurnCredentialService(Supabase.instance.client);
});
