import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for managing authentication sessions (paired clients).
class AuthSessionsApi {
  AuthSessionsApi({required this.client});

  final ApiClient client;

  /// Fetch all active paired clients/sessions.
  Future<List<AuthSessionDto>> getSessions() async {
    try {
      final response = await client.get<dynamic>('/api/clients/list');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> sessions;
        if (data is List) {
          sessions = data;
        } else if (data is Map<String, dynamic>) {
          sessions = data['named_certs'] as List<dynamic>? ??
              data['clients'] as List<dynamic>? ??
              data['sessions'] as List<dynamic>? ??
              const [];
        } else {
          return const [];
        }
        return sessions
            .map((e) => AuthSessionDto.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Revoke/unpair a client session by its ID.
  Future<bool> revokeSession(String id) async {
    try {
      final response = await client.delete('/api/clients/unpair', queryParameters: {
        'uuid': id,
      });
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

/// DTO representing a paired client session.
class AuthSessionDto {
  const AuthSessionDto({
    required this.id,
    required this.name,
    this.deviceType,
    this.lastSeen,
    this.createdAt,
    this.isCurrent = false,
  });

  /// Unique session/client ID (UUID).
  final String id;

  /// Client device name.
  final String name;

  /// Device type hint (e.g. "android", "ios", "desktop").
  final String? deviceType;

  /// Last activity timestamp (ISO 8601 or epoch).
  final DateTime? lastSeen;

  /// When the session was created/paired.
  final DateTime? createdAt;

  /// Whether this is the current session.
  final bool isCurrent;

  factory AuthSessionDto.fromJson(Map<String, dynamic> json) {
    return AuthSessionDto(
      id: json['uuid'] as String? ?? json['id'] as String? ?? '',
      name: json['name'] as String? ?? json['device'] as String? ?? 'Unknown',
      deviceType: json['device_type'] as String? ?? json['type'] as String?,
      lastSeen: _parseDate(json['last_seen'] ?? json['last_active_at']),
      createdAt: _parseDate(json['created_at'] ?? json['paired_at']),
      isCurrent: json['is_current'] == true || json['current'] == true,
    );
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is int) return DateTime.fromMillisecondsSinceEpoch(value * 1000);
    if (value is String) return DateTime.tryParse(value);
    return null;
  }
}
