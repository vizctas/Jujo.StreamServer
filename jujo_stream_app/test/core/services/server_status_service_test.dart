import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:jujo_stream_app/core/services/server_status_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final validStatusJson = jsonEncode({
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
    'clients': {
      'pairedCount': 3,
    },
    'cloud': {
      'configured': true,
    },
  });

  group('ServerStatusService.fetchStatus', () {
    test('parses valid response correctly', () async {
      final mockClient = MockClient((request) async {
        return http.Response(validStatusJson, 200);
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'test-token',
        httpClient: mockClient,
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

      final mockClient = MockClient((request) async {
        capturedAuth = request.headers['Authorization'];
        return http.Response(validStatusJson, 200);
      });

      final service = ServerStatusService(
        baseUrl: 'https://myserver:47990',
        authToken: 'my-secret-jwt',
        httpClient: mockClient,
      );

      await service.fetchStatus();

      expect(capturedAuth, 'Bearer my-secret-jwt');
    });

    test('hits correct endpoint', () async {
      String? capturedUrl;

      final mockClient = MockClient((request) async {
        capturedUrl = request.url.toString();
        return http.Response(validStatusJson, 200);
      });

      final service = ServerStatusService(
        baseUrl: 'https://192.168.1.50:47990/',
        authToken: 'tok',
        httpClient: mockClient,
      );

      await service.fetchStatus();

      expect(capturedUrl, 'https://192.168.1.50:47990/api/server/status');
    });

    test('returns null on HTTP 401', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Unauthorized', 401);
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'expired-token',
        httpClient: mockClient,
      );

      final status = await service.fetchStatus();
      expect(status, isNull);
    });

    test('returns null on HTTP 500', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Internal Server Error', 500);
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'tok',
        httpClient: mockClient,
      );

      final status = await service.fetchStatus();
      expect(status, isNull);
    });

    test('returns null when status field is false', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'status': false, 'error': 'not ready'}),
          200,
        );
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'tok',
        httpClient: mockClient,
      );

      final status = await service.fetchStatus();
      expect(status, isNull);
    });

    test('returns null on invalid JSON', () async {
      final mockClient = MockClient((request) async {
        return http.Response('not json at all', 200);
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'tok',
        httpClient: mockClient,
      );

      final status = await service.fetchStatus();
      expect(status, isNull);
    });

    test('returns null on network exception', () async {
      final mockClient = MockClient((request) async {
        throw Exception('Connection refused');
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'tok',
        httpClient: mockClient,
      );

      final status = await service.fetchStatus();
      expect(status, isNull);
    });

    test('handles minimal valid response with missing optional fields', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'status': true,
            'server': {'name': 'Minimal'},
          }),
          200,
        );
      });

      final service = ServerStatusService(
        baseUrl: 'https://localhost:47990',
        authToken: 'tok',
        httpClient: mockClient,
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
    });
  });
}
