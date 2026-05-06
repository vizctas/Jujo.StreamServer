import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/services/cloud_server_profiles_repository.dart';

void main() {
  group('CloudServerProfile', () {
    test('fromJson parses all fields', () {
      final json = {
        'id': 'abc-123',
        'server_url': 'https://192.168.1.100:47990',
        'server_name': 'Gaming PC',
        'username': 'admin',
        'local_addresses': ['192.168.1.100:47990'],
        'cert_fingerprint': 'sha256:deadbeef',
        'is_default': true,
        'display_order': 1,
        'last_connected_at': '2026-07-01T12:00:00Z',
        'created_at': '2026-06-01T10:00:00Z',
        'updated_at': '2026-07-01T12:00:00Z',
      };

      final profile = CloudServerProfile.fromJson(json);

      expect(profile.id, 'abc-123');
      expect(profile.serverUrl, 'https://192.168.1.100:47990');
      expect(profile.serverName, 'Gaming PC');
      expect(profile.username, 'admin');
      expect(profile.localAddresses, ['192.168.1.100:47990']);
      expect(profile.isDefault, true);
      expect(profile.displayOrder, 1);
      expect(profile.lastConnectedAt, isNotNull);
    });

    test('fromJson handles missing optional fields', () {
      final json = {'id': 'x', 'server_url': 'https://x:47990'};
      final profile = CloudServerProfile.fromJson(json);

      expect(profile.serverName, isNull);
      expect(profile.username, isNull);
      expect(profile.localAddresses, isEmpty);
      expect(profile.isDefault, false);
      expect(profile.displayOrder, 0);
    });

    test('toInsertJson includes user_id', () {
      final profile = CloudServerProfile(
        id: 'id1',
        serverUrl: 'https://h:47990',
        serverName: 'Test',
        username: 'u',
      );
      final json = profile.toInsertJson('uid-1');
      expect(json['user_id'], 'uid-1');
      expect(json['server_url'], 'https://h:47990');
    });

    test('toUpdateJson excludes user_id and server_url', () {
      final profile = CloudServerProfile(
        id: 'id1',
        serverUrl: 'https://h:47990',
        serverName: 'N',
        username: 'u',
      );
      final json = profile.toUpdateJson();
      expect(json.containsKey('user_id'), false);
      expect(json.containsKey('server_url'), false);
      expect(json['server_name'], 'N');
    });

    test('toServerProfile converts correctly', () {
      final cloud = CloudServerProfile(
        id: 'cid',
        serverUrl: 'https://pc:47990',
        serverName: 'PC',
        username: 'admin',
        lastConnectedAt: DateTime.utc(2026, 7, 1),
      );
      final local = cloud.toServerProfile();
      expect(local.id, 'cid');
      expect(local.url, 'https://pc:47990');
      expect(local.name, 'PC');
      expect(local.username, 'admin');
    });

    test('fromServerProfile converts correctly', () {
      final local = ServerProfile(
        id: 'lid',
        url: 'https://x:47990',
        name: 'X',
        username: 'u',
        lastConnected: DateTime.utc(2026, 6, 15),
      );
      final cloud = CloudServerProfile.fromServerProfile(local);
      expect(cloud.serverUrl, 'https://x:47990');
      expect(cloud.serverName, 'X');
    });
  });

  group('DisabledCloudServerProfilesRepository', () {
    final repo = const DisabledCloudServerProfilesRepository();

    test('isConfigured is false', () => expect(repo.isConfigured, false));

    test('fetchAll returns empty', () async {
      expect(await repo.fetchAll(), isEmpty);
    });

    test('upsert is no-op', () async {
      await repo.upsert(ServerProfile(id: 't', url: 'https://t:1'));
    });

    test('removeByUrl is no-op', () async {
      await repo.removeByUrl('x');
    });

    test('setDefault is no-op', () async {
      await repo.setDefault('x');
    });
  });

  group('ServerProfile model', () {
    test('create generates unique ids', () {
      final a = ServerProfile.create(url: 'https://a:1');
      final b = ServerProfile.create(url: 'https://b:1');
      expect(a.id, isNot(equals(b.id)));
    });

    test('displayName fallback', () {
      expect(
        ServerProfile(id: '1', url: 'https://h:1').displayName,
        'https://h:1',
      );
      expect(
        ServerProfile(id: '1', url: 'https://h:1', name: 'N').displayName,
        'N',
      );
    });

    test('isLocal detection', () {
      expect(ServerProfile(id: '1', url: 'https://localhost:1').isLocal, true);
      expect(ServerProfile(id: '2', url: 'https://127.0.0.1:1').isLocal, true);
      expect(ServerProfile(id: '3', url: 'https://10.0.0.1:1').isLocal, false);
    });

    test('fromJson/toJson roundtrip', () {
      final p = ServerProfile(
        id: 'rt',
        url: 'https://h:1',
        name: 'N',
        username: 'u',
        lastConnected: DateTime.utc(2026, 7, 1),
      );
      final restored = ServerProfile.fromJson(p.toJson());
      expect(restored.id, p.id);
      expect(restored.url, p.url);
      expect(restored.name, p.name);
      expect(restored.username, p.username);
      expect(restored.lastConnected, p.lastConnected);
    });

    test('equality by id', () {
      final a = ServerProfile(id: 'same', url: 'https://a:1');
      final b = ServerProfile(id: 'same', url: 'https://b:1');
      expect(a, equals(b));
    });

    test('copyWith preserves unchanged', () {
      final p = ServerProfile(id: 'c', url: 'https://h:1', name: 'O');
      final u = p.copyWith(name: 'N');
      expect(u.id, 'c');
      expect(u.url, 'https://h:1');
      expect(u.name, 'N');
    });
  });

  group('JSON list helpers', () {
    test('roundtrip', () {
      final list = [
        ServerProfile(id: '1', url: 'https://a:1', name: 'A'),
        ServerProfile(id: '2', url: 'https://b:1', username: 'bob'),
      ];
      final json = serverProfilesToJsonString(list);
      final restored = serverProfilesFromJsonString(json);
      expect(restored.length, 2);
      expect(restored[0].name, 'A');
      expect(restored[1].username, 'bob');
    });
  });
}
