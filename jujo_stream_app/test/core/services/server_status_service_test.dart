import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/services/server_status_service.dart';

// ---------------------------------------------------------------------------
// Minimal Dio HttpClientAdapter mock — returns a fixed ResponseBody per call.
// ---------------------------------------------------------------------------

class _MockAdapter implements HttpClientAdapter {
  _MockAdapter(this._handler);

  final Future<ResponseBody> Function(RequestOptions) _handler;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future? cancelFuture,
  ) => _handler(options);

  @override
  void close({bool force = false}) {}
}

ResponseBody _jsonResponse(Object body, int status) => ResponseBody.fromString(
  jsonEncode(body),
  status,
  headers: {
    Headers.contentTypeHeader: ['application/json'],
  },
);

ResponseBody _rawResponse(String body, int status) =>
    ResponseBody.fromString(body, status);

// ---------------------------------------------------------------------------

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const validStatusMap = {
    'status': true,
    'server': {
      'name': 'Gaming PC',
      'version': '2025.1.0',
      'platform': 'windows',
      'startedAt': 1720000000,
      'uptimeSeconds': 3600,
    },
    'streaming': {
      'active': true,
      'rtspSessionCount': 2,
      'webrtcActive': false,
      'currentAppId': 42,
    },
    'clients': {'pairedCount': 3},
    'cloud': {'configured': true},
  };

  ServerStatusService makeService(
    String baseUrl,
    String authToken,
    Future<ResponseBody> Function(RequestOptions) handler,
  ) => ServerStatusService(
    baseUrl: baseUrl,
    authToken: authToken,
    httpClientAdapter: _MockAdapter(handler),
  );

  group('ServerStatusService.fetchStatus', () {
    test('parses valid response correctly', () async {
      final service = makeService(
        'https://localhost:47990',
        'test-token',
        (_) async => _jsonResponse(validStatusMap, 200),
      );

      final status = await service.fetchStatus();

      expect(status, isNotNull);
      expect(status!.name, 'Gaming PC');
      expect(status.version, '2025.1.0');
      expect(status.platform, 'windows');
      expect(status.startedAtEpoch, 1720000000);
      expect(status.uptimeSeconds, 3600);
      expect(status.isStreaming, true);
      expect(status.rtspSessionCount, 2);
      expect(status.webrtcActive, false);
      expect(status.currentAppId, 42);
      expect(status.pairedClientCount, 3);
      expect(status.cloudConfigured, true);
    });

    test('sends correct auth header', () async {
      String? capturedAuth;

      final service = makeService('https://myserver:47990', 'my-secret-jwt', (
        options,
      ) async {
        capturedAuth = options.headers['Authorization'] as String?;
        return _jsonResponse(validStatusMap, 200);
      });

      await service.fetchStatus();

      expect(capturedAuth, 'Bearer my-secret-jwt');
    });

    test('hits correct endpoint', () async {
      String? capturedUrl;

      final service = makeService('https://192.168.1.50:47990/', 'tok', (
        options,
      ) async {
        capturedUrl = options.uri.toString();
        return _jsonResponse(validStatusMap, 200);
      });

      await service.fetchStatus();

      expect(capturedUrl, 'https://192.168.1.50:47990/api/server/status');
    });

    test('returns null on HTTP 401', () async {
      final service = makeService(
        'https://localhost:47990',
        'expired-token',
        (_) async => _rawResponse('Unauthorized', 401),
      );

      expect(await service.fetchStatus(), isNull);
    });

    test('returns null on HTTP 500', () async {
      final service = makeService(
        'https://localhost:47990',
        'tok',
        (_) async => _rawResponse('Internal Server Error', 500),
      );

      expect(await service.fetchStatus(), isNull);
    });

    test('returns null when status field is false', () async {
      final service = makeService(
        'https://localhost:47990',
        'tok',
        (_) async =>
            _jsonResponse({'status': false, 'error': 'not ready'}, 200),
      );

      expect(await service.fetchStatus(), isNull);
    });

    test('returns null on invalid JSON', () async {
      final service = makeService(
        'https://localhost:47990',
        'tok',
        (_) async => _rawResponse('not json at all', 200),
      );

      expect(await service.fetchStatus(), isNull);
    });

    test('returns null on network exception', () async {
      final service = makeService(
        'https://localhost:47990',
        'tok',
        (_) async => throw Exception('Connection refused'),
      );

      expect(await service.fetchStatus(), isNull);
    });

    test(
      'handles minimal valid response with missing optional fields',
      () async {
        final service = makeService(
          'https://localhost:47990',
          'tok',
          (_) async => _jsonResponse({
            'status': true,
            'server': {'name': 'Minimal'},
          }, 200),
        );

        final status = await service.fetchStatus();

        expect(status, isNotNull);
        expect(status!.name, 'Minimal');
        expect(status.version, '0.0.0');
        expect(status.platform, 'unknown');
        expect(status.uptimeSeconds, 0);
        expect(status.isStreaming, false);
        expect(status.rtspSessionCount, 0);
        expect(status.currentAppId, isNull);
        expect(status.pairedClientCount, 0);
        expect(status.cloudConfigured, false);
      },
    );
  });
}
