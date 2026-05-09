import 'package:jujo_stream_app/core/api/api_client.dart';

class AutoStartApi {
  AutoStartApi({required this.client});

  final ApiClient client;

  Future<AutoStartStatusDto?> getStatus() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/system/autostart/status',
      );
      if (response.statusCode == 200 && response.data != null) {
        return AutoStartStatusDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<AutoStartActionResult> enable({
    required String username,
    required String password,
    String domain = '',
  }) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/system/autostart/enable',
        data: {'username': username, 'password': password, 'domain': domain},
      );
      final data = response.data ?? const <String, dynamic>{};
      final ok = response.statusCode == 200 && (data['status'] == true);
      return AutoStartActionResult(
        success: ok,
        message:
            (data['message'] as String?) ??
            (data['error'] as String?) ??
            (ok ? 'AutoLogon enabled.' : 'Failed to enable AutoLogon.'),
      );
    } catch (e) {
      return AutoStartActionResult(
        success: false,
        message: 'Failed to enable AutoLogon: $e',
      );
    }
  }

  Future<AutoStartActionResult> disable() async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/system/autostart/disable',
      );
      final data = response.data ?? const <String, dynamic>{};
      final ok = response.statusCode == 200 && (data['status'] == true);
      return AutoStartActionResult(
        success: ok,
        message:
            (data['message'] as String?) ??
            (data['error'] as String?) ??
            (ok ? 'AutoLogon disabled.' : 'Failed to disable AutoLogon.'),
      );
    } catch (e) {
      return AutoStartActionResult(
        success: false,
        message: 'Failed to disable AutoLogon: $e',
      );
    }
  }
}

class AutoStartActionResult {
  const AutoStartActionResult({required this.success, required this.message});

  final bool success;
  final String message;
}

class AutoStartStatusDto {
  const AutoStartStatusDto({
    required this.supported,
    required this.autologonEnabled,
    required this.username,
    required this.domain,
    required this.serviceExists,
    required this.serviceRunning,
    required this.serviceStartType,
    required this.backendStartupReady,
    required this.bootPathReady,
    this.warning,
  });

  final bool supported;
  final bool autologonEnabled;
  final String username;
  final String domain;
  final bool serviceExists;
  final bool serviceRunning;
  final String serviceStartType;
  final bool backendStartupReady;
  final bool bootPathReady;
  final String? warning;

  factory AutoStartStatusDto.fromJson(Map<String, dynamic> json) {
    final autologon =
        (json['autologon'] as Map?)?.cast<String, dynamic>() ??
        const <String, dynamic>{};
    final service =
        (json['service'] as Map?)?.cast<String, dynamic>() ??
        const <String, dynamic>{};
    return AutoStartStatusDto(
      supported: json['supported'] as bool? ?? true,
      autologonEnabled: autologon['enabled'] as bool? ?? false,
      username: autologon['username'] as String? ?? '',
      domain: autologon['domain'] as String? ?? '',
      serviceExists: service['exists'] as bool? ?? false,
      serviceRunning: service['running'] as bool? ?? false,
      serviceStartType: service['startType'] as String? ?? 'unknown',
      backendStartupReady: json['backendStartupReady'] as bool? ?? false,
      bootPathReady: json['bootPathReady'] as bool? ?? false,
      warning: json['warning'] as String?,
    );
  }
}
