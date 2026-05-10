import 'package:jujo_stream_app/core/api/api_client.dart';

class CrashDumpStatus {
  const CrashDumpStatus({required this.detected, this.dumps = const []});
  final bool detected;
  final List<CrashDumpEntry> dumps;

  factory CrashDumpStatus.fromJson(Map<String, dynamic> json) {
    final dumpsList = (json['dumps'] as List<dynamic>?)
        ?.map((d) => CrashDumpEntry.fromJson(d as Map<String, dynamic>))
        .toList() ?? [];
    return CrashDumpStatus(
      detected: json['detected'] as bool? ?? dumpsList.isNotEmpty,
      dumps: dumpsList,
    );
  }
}

class CrashDumpEntry {
  const CrashDumpEntry({required this.process, required this.path, required this.size, this.writeTime});
  final String process;
  final String path;
  final int size;
  final String? writeTime;

  factory CrashDumpEntry.fromJson(Map<String, dynamic> json) {
    return CrashDumpEntry(
      process: json['process'] as String? ?? 'unknown',
      path: json['path'] as String? ?? '',
      size: (json['size'] as num?)?.toInt() ?? 0,
      writeTime: json['write_time'] as String?,
    );
  }
}

class HealthApi {
  HealthApi({required this.client});
  final ApiClient client;

  Future<CrashDumpStatus?> getCrashDumpStatus() async {
    try {
      final response = await client.get<Map<String, dynamic>>('/api/health/crashdump');
      if (response.statusCode == 200 && response.data != null) {
        return CrashDumpStatus.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> dismissCrashDump() async {
    try {
      final response = await client.post<Map<String, dynamic>>('/api/health/crashdump/dismiss');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
