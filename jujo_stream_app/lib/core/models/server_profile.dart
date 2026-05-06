import 'dart:convert';

/// Represents a saved Jujo.Stream server connection.
///
/// Profiles are stored in SharedPreferences (metadata only).
/// Tokens are stored separately in FlutterSecureStorage keyed by profile ID.
class ServerProfile {
  const ServerProfile({
    required this.id,
    required this.url,
    this.name,
    this.username,
    this.lastConnected,
  });

  factory ServerProfile.create({
    required String url,
    String? name,
    String? username,
  }) {
    final id = '${DateTime.now().millisecondsSinceEpoch}_${url.hashCode.abs()}';
    return ServerProfile(
      id: id,
      url: url,
      name: name,
      username: username,
    );
  }

  factory ServerProfile.fromJson(Map<String, dynamic> json) {
    return ServerProfile(
      id: json['id'] as String,
      url: json['url'] as String,
      name: json['name'] as String?,
      username: json['username'] as String?,
      lastConnected: json['lastConnected'] != null
          ? DateTime.tryParse(json['lastConnected'] as String)
          : null,
    );
  }

  final String id;
  final String url;

  /// User-defined display name; falls back to URL if null.
  final String? name;

  /// Last username used to log into this server.
  final String? username;

  /// Last time a successful connection was made.
  final DateTime? lastConnected;

  String get displayName => (name != null && name!.isNotEmpty) ? name! : url;

  /// True if this profile represents a localhost server.
  bool get isLocal =>
      url.contains('localhost') || url.contains('127.0.0.1') || url.contains('::1');

  Map<String, dynamic> toJson() => {
        'id': id,
        'url': url,
        'name': name,
        'username': username,
        'lastConnected': lastConnected?.toIso8601String(),
      };

  ServerProfile copyWith({
    String? url,
    String? name,
    String? username,
    DateTime? lastConnected,
    bool clearName = false,
  }) {
    return ServerProfile(
      id: id,
      url: url ?? this.url,
      name: clearName ? null : (name ?? this.name),
      username: username ?? this.username,
      lastConnected: lastConnected ?? this.lastConnected,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is ServerProfile && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'ServerProfile(id: $id, url: $url, name: $name)';
}

// ─── JSON list helpers ────────────────────────────────────────────────────────

List<ServerProfile> serverProfilesFromJsonString(String json) {
  final list = jsonDecode(json) as List<dynamic>;
  return list
      .whereType<Map<String, dynamic>>()
      .map(ServerProfile.fromJson)
      .toList();
}

String serverProfilesToJsonString(List<ServerProfile> profiles) {
  return jsonEncode(profiles.map((p) => p.toJson()).toList());
}
