import 'package:jujo_stream_app/core/api/api_client.dart';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/// Per-session health data from GET /api/stream/health.
class SessionHealthDto {
  const SessionHealthDto({
    required this.id,
    required this.videoPackets,
    required this.videoDropped,
    required this.videoQueueFrames,
    required this.videoInflightFrames,
    required this.audioDropped,
    required this.dropRatePercent,
    required this.stalenessMs,
    required this.healthScore,
    this.bitrateKbps,
    this.fps,
    this.codec,
    this.width,
    this.height,
  });

  final String id;
  final int videoPackets;
  final int videoDropped;
  final int videoQueueFrames;
  final int videoInflightFrames;
  final int audioDropped;
  final double dropRatePercent;
  final int stalenessMs;
  final int healthScore;
  final int? bitrateKbps;
  final int? fps;
  final String? codec;
  final int? width;
  final int? height;

  factory SessionHealthDto.fromJson(Map<String, dynamic> json) {
    return SessionHealthDto(
      id: json['id'] as String? ?? '',
      videoPackets: (json['video_packets'] as num?)?.toInt() ?? 0,
      videoDropped: (json['video_dropped'] as num?)?.toInt() ?? 0,
      videoQueueFrames: (json['video_queue_frames'] as num?)?.toInt() ?? 0,
      videoInflightFrames: (json['video_inflight_frames'] as num?)?.toInt() ?? 0,
      audioDropped: (json['audio_dropped'] as num?)?.toInt() ?? 0,
      dropRatePercent: (json['drop_rate_percent'] as num?)?.toDouble() ?? 0,
      stalenessMs: (json['staleness_ms'] as num?)?.toInt() ?? -1,
      healthScore: (json['health_score'] as num?)?.toInt() ?? 100,
      bitrateKbps: json['bitrate_kbps'] is num ? (json['bitrate_kbps'] as num).toInt() : null,
      fps: json['fps'] is num ? (json['fps'] as num).toInt() : null,
      codec: json['codec'] as String?,
      width: json['width'] is num ? (json['width'] as num).toInt() : null,
      height: json['height'] is num ? (json['height'] as num).toInt() : null,
    );
  }
}

/// Aggregate stream health from GET /api/stream/health.
class StreamHealthDto {
  const StreamHealthDto({
    required this.timestamp,
    required this.rtspSessions,
    required this.activeSessions,
    required this.healthScore,
    required this.sessions,
  });

  final int timestamp;
  final int rtspSessions;
  final int activeSessions;
  final int healthScore;
  final List<SessionHealthDto> sessions;

  /// Whether any session is actively streaming.
  bool get hasActiveSessions => activeSessions > 0;

  /// Whether the stream is degraded (health < 70).
  bool get isDegraded => healthScore < 70;

  /// Whether the stream is critical (health < 40).
  bool get isCritical => healthScore < 40;

  factory StreamHealthDto.fromJson(Map<String, dynamic> json) {
    final sessionsJson = json['sessions'] as List<dynamic>? ?? [];
    return StreamHealthDto(
      timestamp: (json['timestamp'] as num?)?.toInt() ?? 0,
      rtspSessions: (json['rtsp_sessions'] as num?)?.toInt() ?? 0,
      activeSessions: (json['active_sessions'] as num?)?.toInt() ?? 0,
      healthScore: (json['health_score'] as num?)?.toInt() ?? 100,
      sessions: sessionsJson
          .whereType<Map<String, dynamic>>()
          .map(SessionHealthDto.fromJson)
          .toList(),
    );
  }
}

// ─── API Service ──────────────────────────────────────────────────────────────

/// API service for stream health monitoring (adaptive bitrate).
class StreamHealthApi {
  StreamHealthApi({required this.client});

  final ApiClient client;

  /// Fetch current stream health metrics.
  Future<StreamHealthDto?> getHealth() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/stream/health',
      );
      if (response.statusCode == 200 && response.data != null) {
        return StreamHealthDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
