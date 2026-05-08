import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/cert_trust.dart';
import 'package:jujo_stream_app/core/models/server_status.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// Fetches server status from GET /api/server/status.
///
/// Requires the server base URL and auth token from the active profile.
class ServerStatusService {
  ServerStatusService({
    required String baseUrl,
    required String authToken,
    HttpClientAdapter? httpClientAdapter,
  }) : _baseUrl = _normalizeUrl(baseUrl),
       _authToken = authToken,
       _testAdapter = httpClientAdapter;

  static String _normalizeUrl(String url) {
    // Translate 0.0.0.0 to localhost — 0.0.0.0 is a bind-all address,
    // not routable from the client side on Windows.
    var normalized = url.replaceFirst('://0.0.0.0', '://localhost');
    if (normalized.endsWith('/')) {
      normalized = normalized.substring(0, normalized.length - 1);
    }
    return normalized;
  }

  final String _baseUrl;
  final String _authToken;
  final HttpClientAdapter? _testAdapter;

  Dio _buildDio() {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        validateStatus: (_) => true,
        headers: {
          'Authorization': 'Session $_authToken',
          'Accept': 'application/json',
        },
      ),
    );
    if (_testAdapter != null) {
      dio.httpClientAdapter = _testAdapter;
    } else {
      configureSelfSignedCertTrust(dio);
    }
    return dio;
  }

  /// Fetches the current server status. Returns null on failure.
  Future<ServerStatus?> fetchStatus() async {
    if (_baseUrl.isEmpty) return null;
    final dio = _buildDio();
    try {
      final response = await dio.get<Map<String, dynamic>>(
        '$_baseUrl/api/server/status',
      );
      if ((response.statusCode ?? 0) != 200) {
        print('ServerStatusService: HTTP status ${(response.statusCode ?? 0)}');
        return null;
      }
      final json = response.data;
      if (json == null || json['status'] != true) {
        print('ServerStatusService: Invalid JSON or status!=true: $json');
        return null;
      }
      try {
        return ServerStatus.fromJson(json);
      } catch (e, st) {
        print('ServerStatusService: JSON parsing error: $e\n$st');
        return null;
      }
    } catch (e, st) {
      print('ServerStatusService: Request threw exception: $e\n$st');
      return null;
    } finally {
      dio.close();
    }
  }
}

/// Provides a [ServerStatusService] wired to the active profile's credentials.
/// Automatically rebuilds whenever the server URL or session token changes.
final serverStatusServiceProvider = Provider<ServerStatusService>((ref) {
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl)) ?? '';
  final token = ref.watch(authProvider.select((s) => s.token)) ?? '';
  return ServerStatusService(baseUrl: serverUrl, authToken: token);
});

/// Auto-refreshing stream of server status, polling every [interval].
final serverStatusStreamProvider = StreamProvider.autoDispose
    .family<ServerStatus?, Duration>((ref, interval) {
      final service = ref.watch(serverStatusServiceProvider);

      return Stream.periodic(
        interval,
        (_) => null,
      ).asyncMap((_) => service.fetchStatus()).distinct();
    });

/// Convenience: polls every 10 seconds with default interval.
/// Named differently from the StateNotifier-based serverStatusProvider in
/// server_status_provider.dart to avoid provider collision.
///
/// Skips polling entirely when no auth token is available (avoids 5s timeouts
/// on endpoints that require authentication).
final serverStatusPollingProvider = StreamProvider.autoDispose<ServerStatus?>((
  ref,
) {
  final service = ref.watch(serverStatusServiceProvider);
  final token = ref.watch(authProvider.select((s) => s.token));
  final serverUrl = ref.watch(authProvider.select((s) => s.serverUrl));
  const interval = Duration(seconds: 10);

  // Don't poll if we have no server URL or no auth token — it will just timeout.
  if (serverUrl == null || serverUrl.isEmpty || token == null || token.isEmpty) {
    return Stream.value(null);
  }

  late final StreamController<ServerStatus?> controller;
  Timer? timer;

  controller = StreamController<ServerStatus?>(
    onListen: () {
      // Fetch immediately on first listen
      service.fetchStatus().then((status) {
        if (!controller.isClosed) controller.add(status);
      });
      // Then poll periodically
      timer = Timer.periodic(interval, (_) {
        service.fetchStatus().then((status) {
          if (!controller.isClosed) controller.add(status);
        });
      });
    },
    onCancel: () {
      timer?.cancel();
      controller.close();
    },
  );

  ref.onDispose(() {
    timer?.cancel();
    controller.close();
  });

  return controller.stream;
});
