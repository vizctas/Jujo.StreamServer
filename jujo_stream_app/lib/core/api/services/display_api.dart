import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for display device enumeration.
class DisplayApi {
  DisplayApi({required this.client});

  final ApiClient client;

  /// Fetch available display devices from the server.
  /// Pass [full] = true for extended metadata (refresh rates, inactive displays).
  Future<List<DisplayDeviceDto>> getDevices({bool full = false}) async {
    try {
      final query = full ? '?detail=full' : '';
      final response = await client.get<dynamic>('/api/display-devices$query');
      if (response.statusCode == 200 && response.data != null) {
        // Response is either a JSON array directly or an object with a "devices" key
        final data = response.data;
        List<dynamic> devices;
        if (data is List) {
          devices = data;
        } else if (data is Map<String, dynamic>) {
          devices = data['devices'] as List<dynamic>? ??
              data['displays'] as List<dynamic>? ??
              const [];
        } else {
          return const [];
        }
        return devices
            .map((e) => DisplayDeviceDto.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }
}

/// DTO representing a display device from the server.
class DisplayDeviceDto {
  const DisplayDeviceDto({
    required this.deviceId,
    required this.displayName,
    this.friendlyName,
    this.resolution,
    this.refreshRate,
    this.primary = false,
    this.active = true,
    this.hdrCapable = false,
    this.isVirtual = false,
  });

  /// System device ID (e.g. "{...}" GUID or "\\.\DISPLAY1").
  final String deviceId;

  /// System display name (e.g. "\\.\DISPLAY1").
  final String displayName;

  /// Human-friendly name (e.g. "LG ULTRAGEAR", "Monitor").
  final String? friendlyName;

  /// Current resolution string (e.g. "1920x1080").
  final String? resolution;

  /// Current refresh rate in Hz.
  final int? refreshRate;

  /// Whether this is the primary display.
  final bool primary;

  /// Whether the display is currently active.
  final bool active;

  /// Whether the display supports HDR.
  final bool hdrCapable;

  /// Whether this is a virtual display.
  final bool isVirtual;

  /// Display label for UI: friendly name or display name.
  String get label => friendlyName ?? displayName;

  /// Short info string: resolution @ refresh.
  String get infoLine {
    final parts = <String>[];
    if (resolution != null) parts.add(resolution!);
    if (refreshRate != null) parts.add('${refreshRate}Hz');
    return parts.join(' @ ');
  }

  factory DisplayDeviceDto.fromJson(Map<String, dynamic> json) {
    // Parse resolution from various possible fields
    String? resolution;
    if (json['resolution'] is String) {
      resolution = json['resolution'] as String;
    } else if (json['width'] != null && json['height'] != null) {
      resolution = '${json['width']}x${json['height']}';
    } else if (json['current_mode'] is Map) {
      final mode = json['current_mode'] as Map<String, dynamic>;
      if (mode['width'] != null && mode['height'] != null) {
        resolution = '${mode['width']}x${mode['height']}';
      }
    }

    // Parse refresh rate
    int? refreshRate;
    if (json['refresh_rate'] is int) {
      refreshRate = json['refresh_rate'] as int;
    } else if (json['refresh_rate'] is double) {
      refreshRate = (json['refresh_rate'] as double).round();
    } else if (json['current_mode'] is Map) {
      final mode = json['current_mode'] as Map<String, dynamic>;
      refreshRate = mode['refresh_rate'] as int?;
    }

    return DisplayDeviceDto(
      deviceId: json['device_id'] as String? ?? json['id'] as String? ?? '',
      displayName: json['display_name'] as String? ?? json['name'] as String? ?? '',
      friendlyName: json['friendly_name'] as String? ?? json['friendlyName'] as String?,
      resolution: resolution,
      refreshRate: refreshRate,
      primary: json['primary'] == true || json['is_primary'] == true,
      active: json['active'] != false && json['is_active'] != false,
      hdrCapable: json['hdr_capable'] == true ||
          json['hdr'] == true ||
          json['hdr_supported'] == true,
      isVirtual: json['virtual'] == true || json['is_virtual'] == true,
    );
  }
}
