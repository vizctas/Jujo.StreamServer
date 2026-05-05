import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for server configuration (streaming, video, audio, network, input).
class ConfigApi {
  ConfigApi({required this.client});

  final ApiClient client;

  /// Fetch the full server configuration.
  Future<Map<String, dynamic>?> getConfig() async {
    try {
      final response = await client.get<Map<String, dynamic>>('/api/config');
      if (response.statusCode == 200 && response.data != null) {
        return response.data;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Apply configuration changes via PATCH (partial update).
  ///
  /// Uses PATCH /api/config which merges the provided fields into the existing
  /// config file. This is safe for partial updates — only the specified keys
  /// are modified; all other settings remain unchanged.
  Future<ConfigApplyResult> applyConfig(Map<String, dynamic> changes) async {
    try {
      final response = await client.dio.patch<Map<String, dynamic>>(
        '/api/config',
        data: changes,
      );
      return ConfigApplyResult(
        success: response.statusCode == 200,
        requiresRestart: response.data?['restart'] as bool? ?? false,
        message: response.data?['status'] as String?,
      );
    } catch (e) {
      return ConfigApplyResult(
        success: false,
        message: 'Failed to apply config: $e',
      );
    }
  }

  /// Request server restart.
  Future<bool> restart() async {
    try {
      final response = await client.post('/api/restart');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

class ConfigApplyResult {
  const ConfigApplyResult({
    required this.success,
    this.requiresRestart = false,
    this.message,
  });

  final bool success;
  final bool requiresRestart;
  final String? message;
}
