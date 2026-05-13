import 'package:jujo_stream_app/core/api/api_client.dart';

// ─── Streaming/Video Config ───────────────────────────────────────────────────

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
        requiresRestart:
            response.data?['restartRequired'] as bool? ??
            response.data?['restart'] as bool? ??
            false,
        message: response.data?['message'] as String?,
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

  /// Unregister the server from cloud sync.
  Future<ConfigApplyResult> unregisterCloud() async {
    try {
      final response = await client.dio.delete<Map<String, dynamic>>(
        '/api/cloud/register',
      );
      return ConfigApplyResult(
        success: response.statusCode == 200,
        message: response.data?['message'] as String?,
      );
    } catch (e) {
      return ConfigApplyResult(
        success: false,
        message: 'Failed to unregister: $e',
      );
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

// ─── Cloud Config ─────────────────────────────────────────────────────────────

/// DTO for the cloud-layer config settings exposed by the server.
class CloudConfigDto {
  const CloudConfigDto({required this.autoTrustCloudClients});

  final bool autoTrustCloudClients;

  factory CloudConfigDto.fromJson(Map<String, dynamic> json) {
    return CloudConfigDto(
      autoTrustCloudClients:
          json['auto_trust_cloud_clients'] as bool? ?? false,
    );
  }

  CloudConfigDto copyWith({bool? autoTrustCloudClients}) {
    return CloudConfigDto(
      autoTrustCloudClients:
          autoTrustCloudClients ?? this.autoTrustCloudClients,
    );
  }
}

/// API service for cloud configuration settings.
class CloudConfigApi {
  CloudConfigApi({required this.client});

  final ApiClient client;

  /// Fetch current cloud config from the server.
  Future<CloudConfigDto?> getCloudConfig() async {
    try {
      final response = await client.get<dynamic>('/api/config/cloud');
      if (response.statusCode == 200 && response.data != null) {
        return CloudConfigDto.fromJson(
          response.data as Map<String, dynamic>,
        );
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Update the auto-trust flag. Returns the updated config on success.
  Future<CloudConfigDto?> setAutoTrust(bool value) async {
    try {
      final response = await client.patch<dynamic>(
        '/api/config/cloud',
        data: {'auto_trust_cloud_clients': value},
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['status'] == true) {
          return CloudConfigDto.fromJson(data);
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
