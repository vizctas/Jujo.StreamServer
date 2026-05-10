import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for launching/closing apps on the server.
class AppLaunchApi {
  AppLaunchApi({required this.client});

  final ApiClient client;

  /// Launch an app on the server.
  ///
  /// Prefer uuid. Name is a compatibility fallback for older entries.
  ///
  /// Returns `true` if the server accepted the launch request.
  Future<bool> launch(String appName, {String? uuid, int? index}) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/apps/launch-local',
        data: {
          if (uuid != null && uuid.isNotEmpty) 'uuid': uuid,
          if ((uuid == null || uuid.isEmpty) && index != null) 'index': index,
          if (uuid == null || uuid.isEmpty) 'name': appName,
        },
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Force-close the currently running app on the server.
  Future<bool> close() async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/apps/close',
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
