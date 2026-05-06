import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/services/server_sharing_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ServerMember', () {
    test('fromJson parses all fields correctly', () {
      final json = {
        'id': 'abc-123',
        'server_url': 'https://192.168.1.100:47990',
        'owner_id': 'owner-uuid',
        'member_id': 'member-uuid',
        'role': 'admin',
        'status': 'active',
        'invite_code': null,
        'invited_at': '2025-07-01T10:00:00Z',
        'accepted_at': '2025-07-01T10:05:00Z',
      };

      final member = ServerMember.fromJson(json);

      expect(member.id, 'abc-123');
      expect(member.serverUrl, 'https://192.168.1.100:47990');
      expect(member.ownerId, 'owner-uuid');
      expect(member.memberId, 'member-uuid');
      expect(member.role, ServerMemberRole.admin);
      expect(member.status, ServerMemberStatus.active);
      expect(member.inviteCode, isNull);
      expect(member.invitedAt, isNotNull);
      expect(member.acceptedAt, isNotNull);
    });

    test('fromJson handles pending invite', () {
      final json = {
        'id': 'inv-1',
        'server_url': 'https://host:47990',
        'owner_id': 'owner',
        'member_id': '00000000-0000-0000-0000-000000000000',
        'role': 'viewer',
        'status': 'pending',
        'invite_code': 'ABCD1234',
      };

      final member = ServerMember.fromJson(json);

      expect(member.isPending, true);
      expect(member.isActive, false);
      expect(member.inviteCode, 'ABCD1234');
      expect(member.role, ServerMemberRole.viewer);
    });

    test('fromJson defaults unknown role to viewer', () {
      final json = {
        'id': 'x', 'server_url': 'url', 'owner_id': 'o',
        'member_id': 'm', 'role': 'superadmin', 'status': 'active',
      };
      final member = ServerMember.fromJson(json);
      expect(member.role, ServerMemberRole.viewer);
    });

    test('fromJson defaults unknown status to pending', () {
      final json = {
        'id': 'x', 'server_url': 'url', 'owner_id': 'o',
        'member_id': 'm', 'role': 'viewer', 'status': 'unknown',
      };
      final member = ServerMember.fromJson(json);
      expect(member.status, ServerMemberStatus.pending);
    });

    test('isOwner and canManageClients for owner role', () {
      final member = ServerMember.fromJson({
        'id': 'x', 'server_url': 'url', 'owner_id': 'o',
        'member_id': 'm', 'role': 'owner', 'status': 'active',
      });
      expect(member.isOwner, true);
      expect(member.canManageClients, true);
    });

    test('isAdmin and canManageClients for admin role', () {
      final member = ServerMember.fromJson({
        'id': 'x', 'server_url': 'url', 'owner_id': 'o',
        'member_id': 'm', 'role': 'admin', 'status': 'active',
      });
      expect(member.isAdmin, true);
      expect(member.canManageClients, true);
    });

    test('viewer cannot manage clients', () {
      final member = ServerMember.fromJson({
        'id': 'x', 'server_url': 'url', 'owner_id': 'o',
        'member_id': 'm', 'role': 'viewer', 'status': 'active',
      });
      expect(member.canManageClients, false);
    });

    test('toInsertJson produces correct shape', () {
      const member = ServerMember(
        id: '', serverUrl: 'https://host:47990', ownerId: 'owner-id',
        memberId: 'member-id', role: ServerMemberRole.viewer,
        status: ServerMemberStatus.pending, inviteCode: 'CODE123',
      );
      final json = member.toInsertJson();
      expect(json['server_url'], 'https://host:47990');
      expect(json['owner_id'], 'owner-id');
      expect(json['role'], 'viewer');
      expect(json['invite_code'], 'CODE123');
    });

    test('toInsertJson omits invite_code when null', () {
      const member = ServerMember(
        id: '', serverUrl: 'url', ownerId: 'o', memberId: 'm',
        role: ServerMemberRole.admin, status: ServerMemberStatus.active,
      );
      final json = member.toInsertJson();
      expect(json.containsKey('invite_code'), false);
    });
  });

  group('AcceptInviteResult', () {
    test('fromJson parses success', () {
      final result = AcceptInviteResult.fromJson({
        'success': true, 'server_url': 'https://host:47990', 'role': 'viewer',
      });
      expect(result.success, true);
      expect(result.serverUrl, 'https://host:47990');
      expect(result.error, isNull);
    });

    test('fromJson parses failure', () {
      final result = AcceptInviteResult.fromJson({
        'success': false, 'error': 'Invalid or expired invite code',
      });
      expect(result.success, false);
      expect(result.error, 'Invalid or expired invite code');
    });
  });

  group('ServerSharingService', () {
    test('isConfigured returns false when no client', () {
      final service = ServerSharingService();
      expect(service.isConfigured, false);
    });

    test('generateInviteCode produces 8-char code', () {
      final code = ServerSharingService.generateInviteCode();
      expect(code.length, 8);
      expect(RegExp(r'^[A-Z2-9]+$').hasMatch(code), true);
    });

    test('generateInviteCode produces unique codes', () {
      final codes = List.generate(50, (_) => ServerSharingService.generateInviteCode());
      expect(codes.toSet().length, 50);
    });

    test('createInvite returns error when not configured', () async {
      final service = ServerSharingService();
      final result = await service.createInvite(serverUrl: 'url');
      expect(result.success, false);
      expect(result.error, 'Not configured');
    });

    test('acceptInvite returns error when not configured', () async {
      final service = ServerSharingService();
      final result = await service.acceptInvite('CODE');
      expect(result.success, false);
    });

    test('getServerMembers returns empty when not configured', () async {
      final service = ServerSharingService();
      expect(await service.getServerMembers('url'), isEmpty);
    });

    test('getSharedWithMe returns empty when not configured', () async {
      final service = ServerSharingService();
      expect(await service.getSharedWithMe(), isEmpty);
    });

    test('changeRole returns false when not configured', () async {
      final service = ServerSharingService();
      expect(await service.changeRole(
        memberId: 'm', serverUrl: 'url', newRole: ServerMemberRole.admin,
      ), false);
    });

    test('revokeMember returns false when not configured', () async {
      final service = ServerSharingService();
      expect(await service.revokeMember(memberId: 'm', serverUrl: 'url'), false);
    });

    test('leaveServer returns false when not configured', () async {
      final service = ServerSharingService();
      expect(await service.leaveServer('url'), false);
    });
  });
}
