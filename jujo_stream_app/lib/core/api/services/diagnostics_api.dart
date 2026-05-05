import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for host diagnostics exposed by Jujo.Server.
class DiagnosticsApi {
  DiagnosticsApi({required this.client});

  final ApiClient client;

  Future<SystemDiagnosticsDto?> getDiagnostics() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/system/diagnostics',
      );
      if (response.statusCode == 200 && response.data != null) {
        return SystemDiagnosticsDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> getSection(String section) async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/system/diagnostics/$section',
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<SystemStatusDto?> getStatus() async {
    final diagnostics = await getDiagnostics();
    return diagnostics?.toStatus();
  }
}

class SystemDiagnosticsDto {
  const SystemDiagnosticsDto({
    required this.raw,
    required this.host,
    required this.streaming,
    required this.encoder,
    required this.network,
    required this.storage,
    required this.logs,
  });

  final Map<String, dynamic> raw;
  final Map<String, dynamic> host;
  final Map<String, dynamic> streaming;
  final Map<String, dynamic> encoder;
  final Map<String, dynamic> network;
  final Map<String, dynamic> storage;
  final Map<String, dynamic> logs;

  factory SystemDiagnosticsDto.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> mapValue(String key) {
      final value = json[key];
      if (value is Map<String, dynamic>) return value;
      if (value is Map) return Map<String, dynamic>.from(value);
      return const {};
    }

    return SystemDiagnosticsDto(
      raw: Map<String, dynamic>.from(json),
      host: mapValue('host'),
      streaming: mapValue('streaming'),
      encoder: mapValue('encoder'),
      network: mapValue('network'),
      storage: mapValue('storage'),
      logs: mapValue('logs'),
    );
  }

  SystemStatusDto toStatus() {
    final ports = network['ports'];
    final httpsPort = ports is Map ? ports['https'] : null;
    final bindAddress = network['bindAddress'] as String?;
    final activeSessions = streaming['activeSessions'];

    return SystemStatusDto(
      encoder: (encoder['configuredEncoder'] as String?)?.isNotEmpty == true
          ? encoder['configuredEncoder'] as String
          : 'auto',
      encoderStatus: encoder['status'] as String? ?? 'unknown',
      display: (encoder['configuredOutput'] as String?)?.isNotEmpty == true
          ? encoder['configuredOutput'] as String
          : 'Automatic display selection',
      displayStatus: 'ready',
      network: bindAddress != null && httpsPort != null
          ? '$bindAddress:$httpsPort'
          : null,
      networkStatus: network['status'] as String? ?? 'unknown',
      uptimeMs: _asInt(host['uptimeMs']),
      version: host['version'] as String?,
      platform: host['platform'] as String?,
      activeStreams: _asInt(activeSessions) ?? 0,
    );
  }

  static int? _asInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return null;
  }
}

class SystemStatusDto {
  const SystemStatusDto({
    this.encoder,
    this.encoderStatus = 'unknown',
    this.display,
    this.displayStatus = 'unknown',
    this.network,
    this.networkStatus = 'unknown',
    this.uptimeMs,
    this.version,
    this.platform,
    this.activeStreams = 0,
  });

  final String? encoder;
  final String encoderStatus;
  final String? display;
  final String displayStatus;
  final String? network;
  final String networkStatus;
  final int? uptimeMs;
  final String? version;
  final String? platform;
  final int activeStreams;

  String? get uptime {
    final ms = uptimeMs;
    if (ms == null) return null;
    final duration = Duration(milliseconds: ms);
    final days = duration.inDays;
    final hours = duration.inHours.remainder(24);
    final minutes = duration.inMinutes.remainder(60);
    if (days > 0) return '${days}d ${hours}h ${minutes}m';
    if (hours > 0) return '${hours}h ${minutes}m';
    return '${minutes}m';
  }
}
