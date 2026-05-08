import 'package:jujo_stream_app/core/api/api_client.dart';

/// DTO for the /api/system/metrics endpoint.
class SystemMetricsDto {
  const SystemMetricsDto({
    required this.timestamp,
    required this.cpu,
    required this.memory,
    required this.gpu,
    required this.network,
  });

  final int timestamp;
  final CpuMetrics cpu;
  final MemoryMetrics memory;
  final GpuMetrics gpu;
  final NetworkMetrics network;

  factory SystemMetricsDto.fromJson(Map<String, dynamic> json) {
    return SystemMetricsDto(
      timestamp: (json['timestamp'] as num?)?.toInt() ?? 0,
      cpu: CpuMetrics.fromJson(json['cpu'] as Map<String, dynamic>? ?? {}),
      memory: MemoryMetrics.fromJson(json['memory'] as Map<String, dynamic>? ?? {}),
      gpu: GpuMetrics.fromJson(json['gpu'] as Map<String, dynamic>? ?? {}),
      network: NetworkMetrics.fromJson(json['network'] as Map<String, dynamic>? ?? {}),
    );
  }
}

class CpuMetrics {
  const CpuMetrics({
    this.usagePercent = 0,
    this.processPercent = 0,
    this.temperatureC,
  });

  final double usagePercent;
  final double processPercent;
  final int? temperatureC;

  factory CpuMetrics.fromJson(Map<String, dynamic> json) {
    return CpuMetrics(
      usagePercent: (json['usagePercent'] as num?)?.toDouble() ?? 0,
      processPercent: (json['processPercent'] as num?)?.toDouble() ?? 0,
      temperatureC: json['temperatureC'] is num ? (json['temperatureC'] as num).toInt() : null,
    );
  }
}

class MemoryMetrics {
  const MemoryMetrics({
    this.loadPercent = 0,
    this.totalBytes = 0,
    this.availBytes = 0,
    this.processWorkingSetBytes = 0,
    this.processPrivateBytes = 0,
  });

  final int loadPercent;
  final int totalBytes;
  final int availBytes;
  final int processWorkingSetBytes;
  final int processPrivateBytes;

  double get usedGb => (totalBytes - availBytes) / (1024 * 1024 * 1024);
  double get totalGb => totalBytes / (1024 * 1024 * 1024);
  double get processWorkingSetMb => processWorkingSetBytes / (1024 * 1024);

  factory MemoryMetrics.fromJson(Map<String, dynamic> json) {
    return MemoryMetrics(
      loadPercent: (json['loadPercent'] as num?)?.toInt() ?? 0,
      totalBytes: (json['totalBytes'] as num?)?.toInt() ?? 0,
      availBytes: (json['availBytes'] as num?)?.toInt() ?? 0,
      processWorkingSetBytes: (json['processWorkingSetBytes'] as num?)?.toInt() ?? 0,
      processPrivateBytes: (json['processPrivateBytes'] as num?)?.toInt() ?? 0,
    );
  }
}

class GpuMetrics {
  const GpuMetrics({
    this.available = false,
    this.name,
    this.temperatureC,
    this.usagePercent,
    this.vramTotalBytes,
    this.vramUsedBytes,
  });

  final bool available;
  final String? name;
  final int? temperatureC;
  final int? usagePercent;
  final int? vramTotalBytes;
  final int? vramUsedBytes;

  double? get vramUsedGb => vramUsedBytes != null ? vramUsedBytes! / (1024 * 1024 * 1024) : null;
  double? get vramTotalGb => vramTotalBytes != null ? vramTotalBytes! / (1024 * 1024 * 1024) : null;

  factory GpuMetrics.fromJson(Map<String, dynamic> json) {
    return GpuMetrics(
      available: json['available'] as bool? ?? false,
      name: json['name'] as String?,
      temperatureC: json['temperatureC'] is num ? (json['temperatureC'] as num).toInt() : null,
      usagePercent: json['usagePercent'] is num ? (json['usagePercent'] as num).toInt() : null,
      vramTotalBytes: json['vramTotalBytes'] is num ? (json['vramTotalBytes'] as num).toInt() : null,
      vramUsedBytes: json['vramUsedBytes'] is num ? (json['vramUsedBytes'] as num).toInt() : null,
    );
  }
}

class NetworkMetrics {
  const NetworkMetrics({
    this.bytesSentTotal = 0,
    this.bytesRecvTotal = 0,
  });

  final int bytesSentTotal;
  final int bytesRecvTotal;

  factory NetworkMetrics.fromJson(Map<String, dynamic> json) {
    return NetworkMetrics(
      bytesSentTotal: (json['bytesSentTotal'] as num?)?.toInt() ?? 0,
      bytesRecvTotal: (json['bytesRecvTotal'] as num?)?.toInt() ?? 0,
    );
  }
}

/// API service for system metrics.
class MetricsApi {
  MetricsApi({required this.client});

  final ApiClient client;

  Future<SystemMetricsDto?> getMetrics() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/system/metrics',
      );
      if (response.statusCode == 200 && response.data != null) {
        return SystemMetricsDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
