/// Server status snapshot returned by GET /api/server/status.
class ServerStatus {
  const ServerStatus({
    required this.name,
    required this.version,
    required this.platform,
    required this.startedAtEpoch,
    required this.uptimeSeconds,
    required this.isStreaming,
    required this.rtspSessionCount,
    required this.webrtcActive,
    this.currentAppId,
    required this.pairedClientCount,
    required this.cloudConfigured,
  });

  final String name;
  final String version;
  final String platform;

  /// Unix epoch seconds when the server started.
  final int startedAtEpoch;

  /// Seconds since server boot.
  final int uptimeSeconds;

  /// True if any streaming session (RTSP or WebRTC) is active.
  final bool isStreaming;
  final int rtspSessionCount;
  final bool webrtcActive;

  /// App ID of the currently running game, or null if idle.
  final int? currentAppId;

  /// Number of paired Moonlight/Jujo clients.
  final int pairedClientCount;

  /// Whether cloud sync (Supabase) is configured on the server.
  final bool cloudConfigured;

  /// Human-readable uptime string (e.g. "2h 15m").
  String get uptimeFormatted {
    final hours = uptimeSeconds ~/ 3600;
    final minutes = (uptimeSeconds % 3600) ~/ 60;
    if (hours > 0) return '${hours}h ${minutes}m';
    if (minutes > 0) return '${minutes}m';
    return '${uptimeSeconds}s';
  }

  factory ServerStatus.fromJson(Map<String, dynamic> json) {
    final server = json['server'] as Map<String, dynamic>? ?? {};
    final streaming = json['streaming'] as Map<String, dynamic>? ?? {};
    final clients = json['clients'] as Map<String, dynamic>? ?? {};
    final cloud = json['cloud'] as Map<String, dynamic>? ?? {};

    return ServerStatus(
      name: server['name'] as String? ?? 'Unknown',
      version: server['version'] as String? ?? '0.0.0',
      platform: server['platform'] as String? ?? 'unknown',
      startedAtEpoch: server['startedAt'] as int? ?? 0,
      uptimeSeconds: server['uptimeSeconds'] as int? ?? 0,
      isStreaming: streaming['active'] as bool? ?? false,
      rtspSessionCount: streaming['rtspSessionCount'] as int? ?? 0,
      webrtcActive: streaming['webrtcActive'] as bool? ?? false,
      currentAppId: streaming['currentAppId'] as int?,
      pairedClientCount: clients['pairedCount'] as int? ?? 0,
      cloudConfigured: cloud['configured'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'server': {
          'name': name,
          'version': version,
          'platform': platform,
          'startedAt': startedAtEpoch,
          'uptimeSeconds': uptimeSeconds,
        },
        'streaming': {
          'active': isStreaming,
          'rtspSessionCount': rtspSessionCount,
          'webrtcActive': webrtcActive,
          'currentAppId': currentAppId,
        },
        'clients': {
          'pairedCount': pairedClientCount,
        },
        'cloud': {
          'configured': cloudConfigured,
        },
      };
}
