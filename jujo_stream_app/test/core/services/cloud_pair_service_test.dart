import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:jujo_stream_app/core/services/cloud_pair_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  group('CloudPairResult', () {
    test('fromJson parses success response', () {
      final json = {
        'status': true,
        'clientUuid': 'abc-123-def',
        'message': 'Device paired successfully via cloud authentication',
      };

      final result = CloudPairResult.fromJson(json);
      expect(result.success, true);
      expect(result.clientUuid, 'abc-123-def');
      expect(result.error, isNull);
    });

    test('fromJson parses error response', () {
      final json = {
        'status': false,
        'error': 'Access denied: you are not the owner of this server',
      };

      final result = CloudPairResult.fromJson(json);
      expect(result.success, false);
      expect(result.clientUuid, isNull);
      expect(result.error, 'Access denied: you are not the owner of this server');
    });

    test('fromJson handles missing fields gracefully', () {
      final result = CloudPairResult.fromJson({});
      expect(result.success, false);
      expect(result.clientUuid, isNull);
      expect(result.error, isNull);
    });
  });

  group('CloudPairService.pair', () {
    const fakeCert = '-----BEGIN CERTIFICATE-----\nTESTCERT\n-----END CERTIFICATE-----';
    Future<String?> fakeCertProvider() async => fakeCert;

    test('sends correct request body and parses success', () async {
      String? capturedBody;
      String? capturedContentType;

      final mockClient = MockClient((request) async {
        capturedBody = request.body;
        capturedContentType = request.headers['Content-Type'];

        return http.Response(
          jsonEncode({
            'status': true,
            'clientUuid': 'paired-uuid-456',
            'message': 'Device paired successfully',
          }),
          200,
        );
      });

      final service = CloudPairService(
        httpClient: mockClient,
        certProvider: fakeCertProvider,
      );

      final result = await service.pair(
        serverUrl: 'https://192.168.1.100:47984',
        accessToken: 'test-jwt-token',
        deviceName: 'Test Phone',
      );

      expect(result.success, true);
      expect(result.clientUuid, 'paired-uuid-456');

      // Verify request format
      expect(capturedContentType, 'application/json');
      final body = jsonDecode(capturedBody!) as Map<String, dynamic>;
      expect(body['token'], 'test-jwt-token');
      expect(body['deviceName'], 'Test Phone');
      expect(body.containsKey('clientCert'), true);
    });

    test('handles server rejection', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'status': false,
            'error': 'Cloud sync is not configured on this server',
          }),
          200,
        );
      });

      final service = CloudPairService(
        httpClient: mockClient,
        certProvider: fakeCertProvider,
      );

      final result = await service.pair(
        serverUrl: 'https://192.168.1.100:47984',
        accessToken: 'test-jwt',
        deviceName: 'Phone',
      );

      expect(result.success, false);
      expect(result.error, 'Cloud sync is not configured on this server');
    });

    test('handles HTTP error status', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Internal Server Error', 500);
      });

      final service = CloudPairService(
        httpClient: mockClient,
        certProvider: fakeCertProvider,
      );

      final result = await service.pair(
        serverUrl: 'https://192.168.1.100:47984',
        accessToken: 'test-jwt',
        deviceName: 'Phone',
      );

      expect(result.success, false);
      expect(result.error, contains('500'));
    });

    test('normalizes server URL with trailing slash', () async {
      String? capturedUrl;

      final mockClient = MockClient((request) async {
        capturedUrl = request.url.toString();
        return http.Response(
          jsonEncode({'status': true, 'clientUuid': 'x'}),
          200,
        );
      });

      final service = CloudPairService(
        httpClient: mockClient,
        certProvider: fakeCertProvider,
      );

      await service.pair(
        serverUrl: 'https://myserver.com:47984/',
        accessToken: 'jwt',
        deviceName: 'Dev',
      );

      expect(capturedUrl, 'https://myserver.com:47984/api/pair/cloud');
    });
  });
}
