import 'package:flutter_test/flutter_test.dart';
import 'package:jujo_stream_app/core/models/server_status.dart';

void main() {
  group('ServerStatus', () {
    final sampleJson = {
      'status': true,
      'server': {
        'name': 'My Gaming PC',
        'version': '2025.1.0',
        'platform': 'windows',
        'startedAt': 1719849600,
        'uptimeSeconds': 8100,
      },
      'streaming': {
        'active': true,
        'rtspSessionCount': 1,
        'webrtcActive': false,
        'currentAppId': 730,
      },
      'clients': {
        'pairedCount': 3,
      },
      'cloud': {
        'configured': true,
      },
    };

    test('fromJson parses all fields correctly', () {
      final status = ServerStatus.fromJson(sampleJson);

      expect(status.name, 'My Gaming PC');
      expect(status.version, '2025.1.0');
      expect(status.platform, 'windows');
      expect(status.startedAtEpoch, 1719849600);
      expect(status.uptimeSeconds, 8100);
      expect(status.isStreaming, true);
      expect(status.rtspSessionCount, 1);
      expect(status.webrtcActive, false);
      expect(status.currentAppId, 730);
      expect(status.pairedClientCount, 3);
      expect(status.cloudConfigured, true);
    });

    test('uptimeFormatted shows hours and minutes', () {
      final status = ServerStatus.fromJson(sampleJson);
      expect(status.uptimeFormatted, '2h 15m');
    });

    test('uptimeFormatted shows only minutes when < 1h', () {
      final json = Map<String, dynamic>.from(sampleJson);
      json['server'] = Map<String, dynamic>.from(json['server'] as Map)
        ..['uptimeSeconds'] = 300;
      final status = ServerStatus.fromJson(json);
      expect(status.uptimeFormatted, '5m');
    });

    test('uptimeFormatted shows seconds when < 1m', () {
      final json = Map<String, dynamic>.from(sampleJson);
      json['server'] = Map<String, dynamic>.from(json['server'] as Map)
        ..['uptimeSeconds'] = 45;
      final status = ServerStatus.fromJson(json);
      expect(status.uptimeFormatted, '45s');
    });

    test('fromJson handles null currentAppId', () {
      final json = Map<String, dynamic>.from(sampleJson);
      json['streaming'] = Map<String, dynamic>.from(json['streaming'] as Map)
        ..['currentAppId'] = null;
      final status = ServerStatus.fromJson(json);
      expect(status.currentAppId, isNull);
      expect(status.isStreaming, true);
    });

    test('fromJson handles missing sections gracefully', () {
      final status = ServerStatus.fromJson({'status': true});
      expect(status.name, 'Unknown');
      expect(status.version, '0.0.0');
      expect(status.isStreaming, false);
      expect(status.pairedClientCount, 0);
      expect(status.cloudConfigured, false);
    });

    test('toJson roundtrips correctly', () {
      final status = ServerStatus.fromJson(sampleJson);
      final json = status.toJson();

      expect(json['server']['name'], 'My Gaming PC');
      expect(json['streaming']['active'], true);
      expect(json['clients']['pairedCount'], 3);
      expect(json['cloud']['configured'], true);
    });
  });
}
