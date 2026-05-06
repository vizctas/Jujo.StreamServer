import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/services/server_presence_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ServerPresence', () {
    test('fromRow parses all fields correctly', () {
      final row = {
        'server_url': 'https://192.168.1.100:47990',
        'server_name': 'Gaming PC',
        'last_seen_at': DateTime.now().toUtc().toIso8601String(),
        'is_streaming': true,
        'server_version': '2025.1.0',
      };

      final presence = ServerPresence.fromRow(row);

      expect(presence.serverUrl, 'https://192.168.1.100:47990');
      expect(presence.serverName, 'Gaming PC');
      expect(presence.isOnline, true); // just seen now
      expect(presence.isStreaming, true);
      expect(presence.serverVersion, '2025.1.0');
      expect(presence.lastSeenAt, isNotNull);
    });

    test('fromRow handles null last_seen_at as offline', () {
      final row = {
        'server_url': 'https://10.0.0.5:47990',
        'server_name': 'Office',
        'last_seen_at': null,
        'is_streaming': false,
        'server_version': null,
      };

      final presence = ServerPresence.fromRow(row);

      expect(presence.serverUrl, 'https://10.0.0.5:47990');
      expect(presence.isOnline, false);
      expect(presence.lastSeenAt, isNull);
      expect(presence.isStreaming, false);
      expect(presence.serverVersion, isNull);
    });

    test('fromRow handles missing fields gracefully', () {
      final row = <String, dynamic>{
        'server_url': 'https://host:47990',
      };

      final presence = ServerPresence.fromRow(row);

      expect(presence.serverUrl, 'https://host:47990');
      expect(presence.isOnline, false);
      expect(presence.isStreaming, false);
      expect(presence.serverName, isNull);
      expect(presence.serverVersion, isNull);
    });

    test('computeOnline returns true for recent timestamp', () {
      final recent = DateTime.now().toUtc().subtract(const Duration(seconds: 30));
      expect(ServerPresence.computeOnline(recent), true);
    });

    test('computeOnline returns false for old timestamp', () {
      final old = DateTime.now().toUtc().subtract(const Duration(minutes: 5));
      expect(ServerPresence.computeOnline(old), false);
    });

    test('computeOnline returns false for null', () {
      expect(ServerPresence.computeOnline(null), false);
    });

    test('computeOnline boundary: exactly 2 minutes ago is offline', () {
      final boundary = DateTime.now().toUtc().subtract(const Duration(minutes: 2, seconds: 1));
      expect(ServerPresence.computeOnline(boundary), false);
    });

    test('computeOnline boundary: 1m59s ago is online', () {
      final justInside = DateTime.now().toUtc().subtract(const Duration(minutes: 1, seconds: 59));
      expect(ServerPresence.computeOnline(justInside), true);
    });

    test('copyWith preserves unchanged fields', () {
      final original = ServerPresence(
        serverUrl: 'https://a:1',
        isOnline: true,
        lastSeenAt: DateTime(2025, 1, 1),
        isStreaming: true,
        serverVersion: '1.0',
        serverName: 'Test',
      );

      final modified = original.copyWith(isStreaming: false);

      expect(modified.serverUrl, 'https://a:1');
      expect(modified.isOnline, true);
      expect(modified.isStreaming, false);
      expect(modified.serverVersion, '1.0');
      expect(modified.serverName, 'Test');
    });
  });

  group('ServerPresenceService', () {
    test('isConfigured returns false when no client provided', () {
      final service = ServerPresenceService();
      expect(service.isConfigured, false);
    });

    test('currentPresence starts empty', () {
      final service = ServerPresenceService();
      expect(service.currentPresence, isEmpty);
    });

    test('stop is safe to call when not started', () async {
      final service = ServerPresenceService();
      // Should not throw
      await service.stop();
    });

    test('dispose is safe to call multiple times', () {
      final service = ServerPresenceService();
      service.dispose();
      // Second call should not throw
      service.dispose();
    });
  });
}
