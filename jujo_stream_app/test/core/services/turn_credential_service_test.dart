import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/services/turn_credential_service.dart';

void main() {
  group('TurnCredentials', () {
    test('fromJson parses correctly', () {
      final json = {
        'urls': ['turn:relay.jujo.stream:3478', 'turns:relay.jujo.stream:5349'],
        'username': '1720000000:user-uuid',
        'credential': 'base64hmac==',
        'ttl': 86400,
      };

      final creds = TurnCredentials.fromJson(json);

      expect(creds.urls.length, 2);
      expect(creds.urls[0], 'turn:relay.jujo.stream:3478');
      expect(creds.username, '1720000000:user-uuid');
      expect(creds.credential, 'base64hmac==');
      expect(creds.ttl, 86400);
      expect(creds.fetchedAt, isNotNull);
    });

    test('isExpired returns false for fresh credentials', () {
      final creds = TurnCredentials(
        urls: ['turn:x:3478'],
        username: 'u',
        credential: 'c',
        ttl: 86400,
        fetchedAt: DateTime.now(),
      );
      expect(creds.isExpired, false);
    });

    test('isExpired returns true for old credentials', () {
      final creds = TurnCredentials(
        urls: ['turn:x:3478'],
        username: 'u',
        credential: 'c',
        ttl: 300, // 5 min TTL
        fetchedAt: DateTime.now().subtract(const Duration(minutes: 10)),
      );
      expect(creds.isExpired, true);
    });

    test('toIceServer produces correct format', () {
      final creds = TurnCredentials(
        urls: ['turn:relay:3478'],
        username: 'user',
        credential: 'pass',
        ttl: 3600,
        fetchedAt: DateTime.now(),
      );

      final ice = creds.toIceServer();
      expect(ice['urls'], ['turn:relay:3478']);
      expect(ice['username'], 'user');
      expect(ice['credential'], 'pass');
    });
  });

  group('DisabledTurnCredentialService', () {
    late DisabledTurnCredentialService service;

    setUp(() {
      service = DisabledTurnCredentialService();
    });

    test('getCredentials returns null', () async {
      expect(await service.getCredentials(), isNull);
    });

    test('getIceServers returns STUN only', () async {
      final servers = await service.getIceServers();
      expect(servers.length, 1);
      expect((servers[0]['urls'] as List).first, contains('stun'));
    });
  });
}
