import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import 'package:jujo_stream_app/core/models/server_status.dart';

/// Fetches server status from GET /api/server/status.
///
/// Requires the server base URL and auth token from the active profile.
class ServerStatusService {
  ServerStatusService({
    required String baseUrl,
    required String authToken,
    http.Client? httpClient,
  })  : _baseUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl,
        _authToken = authToken,
        _client = httpClient ?? http.Client();

  final String _baseUrl;
  final String _authToken;
  final http.Client _client;

  /// Fetches the current server status. Returns null on failure.
  Future<ServerStatus?> fetchStatus() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/server/status');
      final response = await _client.get(
        uri,
        headers: {
          'Authorization': 'Bearer $_authToken',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode != 200) return null;

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      if (json['status'] != true) return null;

      return ServerStatus.fromJson(json);
    } catch (_) {
      return null;
    }
  }
}

/// Riverpod provider that polls server status every 10 seconds.
///
/// Override with the active profile's URL and token at the ProviderScope level.
final serverStatusServiceProvider = Provider<ServerStatusService>((ref) {
  throw UnimplementedError(
    'serverStatusServiceProvider must be overridden with active profile credentials',
  );
});

/// Auto-refreshing stream of server status, polling every [interval].
final serverStatusStreamProvider = StreamProvider.autoDispose
    .family<ServerStatus?, Duration>((ref, interval) {
  final service = ref.watch(serverStatusServiceProvider);

  return Stream.periodic(interval, (_) => null)
      .asyncMap((_) => service.fetchStatus())
      .distinct();
});

/// Convenience: polls every 10 seconds with default interval.
/// Named differently from the StateNotifier-based serverStatusProvider in
/// server_status_provider.dart to avoid provider collision.
final serverStatusPollingProvider = StreamProvider.autoDispose<ServerStatus?>((ref) {
  final service = ref.watch(serverStatusServiceProvider);
  const interval = Duration(seconds: 10);

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
