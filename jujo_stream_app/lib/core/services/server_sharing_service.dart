import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

enum ServerMemberRole { owner, admin, viewer }

enum ServerMemberStatus { pending, active, revoked }

/// A membership record linking a user to a shared server.
class ServerMember {
  const ServerMember({
    required this.id,
    required this.serverUrl,
    required this.ownerId,
    required this.memberId,
    required this.role,
    required this.status,
    this.inviteCode,
    this.invitedAt,
    this.acceptedAt,
  });

  final String id;
  final String serverUrl;
  final String ownerId;
  final String memberId;
  final ServerMemberRole role;
  final ServerMemberStatus status;
  final String? inviteCode;
  final DateTime? invitedAt;
  final DateTime? acceptedAt;

  bool get isPending => status == ServerMemberStatus.pending;
  bool get isActive => status == ServerMemberStatus.active;
  bool get isOwner => role == ServerMemberRole.owner;
  bool get isAdmin => role == ServerMemberRole.admin;
  bool get canManageClients => role == ServerMemberRole.owner || role == ServerMemberRole.admin;

  factory ServerMember.fromJson(Map<String, dynamic> json) {
    return ServerMember(
      id: json['id'] as String? ?? '',
      serverUrl: json['server_url'] as String? ?? '',
      ownerId: json['owner_id'] as String? ?? '',
      memberId: json['member_id'] as String? ?? '',
      role: _parseRole(json['role'] as String?),
      status: _parseStatus(json['status'] as String?),
      inviteCode: json['invite_code'] as String?,
      invitedAt: json['invited_at'] != null
          ? DateTime.tryParse(json['invited_at'] as String)
          : null,
      acceptedAt: json['accepted_at'] != null
          ? DateTime.tryParse(json['accepted_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toInsertJson() => {
        'server_url': serverUrl,
        'owner_id': ownerId,
        'member_id': memberId,
        'role': role.name,
        'status': status.name,
        if (inviteCode != null) 'invite_code': inviteCode,
      };

  static ServerMemberRole _parseRole(String? role) => switch (role) {
        'owner' => ServerMemberRole.owner,
        'admin' => ServerMemberRole.admin,
        _ => ServerMemberRole.viewer,
      };

  static ServerMemberStatus _parseStatus(String? status) => switch (status) {
        'active' => ServerMemberStatus.active,
        'revoked' => ServerMemberStatus.revoked,
        _ => ServerMemberStatus.pending,
      };
}

// ─── Service ──────────────────────────────────────────────────────────────────

/// Result of an invite operation.
class InviteResult {
  const InviteResult({
    required this.success,
    this.inviteCode,
    this.error,
  });

  final bool success;
  final String? inviteCode;
  final String? error;
}

/// Result of accepting an invite.
class AcceptInviteResult {
  const AcceptInviteResult({
    required this.success,
    this.serverUrl,
    this.role,
    this.error,
  });

  final bool success;
  final String? serverUrl;
  final String? role;
  final String? error;

  factory AcceptInviteResult.fromJson(Map<String, dynamic> json) {
    return AcceptInviteResult(
      success: json['success'] as bool? ?? false,
      serverUrl: json['server_url'] as String?,
      role: json['role'] as String?,
      error: json['error'] as String?,
    );
  }
}

/// Manages server sharing — invites, memberships, role changes.
class ServerSharingService {
  ServerSharingService({SupabaseClient? client}) : _client = client;

  final SupabaseClient? _client;

  bool get isConfigured => _client != null && SupabaseConfig.current.isConfigured;

  /// Generate a random 8-character invite code.
  static String generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 for clarity
    final rng = Random.secure();
    return List.generate(8, (_) => chars[rng.nextInt(chars.length)]).join();
  }

  /// Create an invite for a server.
  ///
  /// [serverUrl] — The server being shared.
  /// [role] — Role to assign (default: viewer).
  ///
  /// Returns an [InviteResult] with the generated invite code.
  Future<InviteResult> createInvite({
    required String serverUrl,
    ServerMemberRole role = ServerMemberRole.viewer,
  }) async {
    if (!isConfigured) {
      return const InviteResult(success: false, error: 'Not configured');
    }

    try {
      final userId = _client!.auth.currentUser?.id;
      if (userId == null) {
        return const InviteResult(success: false, error: 'Not authenticated');
      }

      final code = generateInviteCode();

      // Placeholder member_id (will be replaced when invite is accepted)
      const placeholderMemberId = '00000000-0000-0000-0000-000000000000';

      await _client.from('server_members').insert({
        'server_url': serverUrl,
        'owner_id': userId,
        'member_id': placeholderMemberId,
        'role': role.name,
        'status': 'pending',
        'invite_code': code,
      });

      logger.info('ServerSharingService: invite created for $serverUrl');
      return InviteResult(success: true, inviteCode: code);
    } catch (e) {
      logger.warning('ServerSharingService: createInvite failed: $e');
      return InviteResult(success: false, error: e.toString());
    }
  }

  /// Accept an invite using a code.
  ///
  /// Calls the `accept_server_invite` RPC function which handles
  /// validation and assignment atomically.
  Future<AcceptInviteResult> acceptInvite(String code) async {
    if (!isConfigured) {
      return const AcceptInviteResult(success: false, error: 'Not configured');
    }

    try {
      final response = await _client!.rpc(
        'accept_server_invite',
        params: {'p_invite_code': code.trim().toUpperCase()},
      );

      if (response is Map<String, dynamic>) {
        return AcceptInviteResult.fromJson(response);
      }

      return const AcceptInviteResult(
        success: false,
        error: 'Unexpected response format',
      );
    } catch (e) {
      logger.warning('ServerSharingService: acceptInvite failed: $e');
      return AcceptInviteResult(success: false, error: e.toString());
    }
  }

  /// Get all members for a server (owner view).
  Future<List<ServerMember>> getServerMembers(String serverUrl) async {
    if (!isConfigured) return [];

    try {
      final response = await _client!
          .from('server_members')
          .select()
          .eq('server_url', serverUrl)
          .neq('status', 'revoked')
          .order('created_at', ascending: true);

      return (response as List)
          .map((row) => ServerMember.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      logger.warning('ServerSharingService: getMembers failed: $e');
      return [];
    }
  }

  /// Get all servers shared with the current user.
  Future<List<ServerMember>> getSharedWithMe() async {
    if (!isConfigured) return [];

    try {
      final response = await _client!
          .from('server_members')
          .select()
          .eq('status', 'active')
          .order('accepted_at', ascending: false);

      return (response as List)
          .map((row) => ServerMember.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      logger.warning('ServerSharingService: getSharedWithMe failed: $e');
      return [];
    }
  }

  /// Change a member's role.
  Future<bool> changeRole({
    required String memberId,
    required String serverUrl,
    required ServerMemberRole newRole,
  }) async {
    if (!isConfigured) return false;

    try {
      await _client!
          .from('server_members')
          .update({'role': newRole.name})
          .eq('member_id', memberId)
          .eq('server_url', serverUrl);
      return true;
    } catch (e) {
      logger.warning('ServerSharingService: changeRole failed: $e');
      return false;
    }
  }

  /// Revoke a member's access.
  Future<bool> revokeMember({
    required String memberId,
    required String serverUrl,
  }) async {
    if (!isConfigured) return false;

    try {
      await _client!
          .from('server_members')
          .update({'status': 'revoked'})
          .eq('member_id', memberId)
          .eq('server_url', serverUrl);
      return true;
    } catch (e) {
      logger.warning('ServerSharingService: revoke failed: $e');
      return false;
    }
  }

  /// Leave a shared server (member removes themselves).
  Future<bool> leaveServer(String serverUrl) async {
    if (!isConfigured) return false;

    try {
      final userId = _client!.auth.currentUser?.id;
      if (userId == null) return false;

      await _client
          .from('server_members')
          .delete()
          .eq('member_id', userId)
          .eq('server_url', serverUrl);
      return true;
    } catch (e) {
      logger.warning('ServerSharingService: leave failed: $e');
      return false;
    }
  }
}

// ─── Providers ────────────────────────────────────────────────────────────────

final serverSharingServiceProvider = Provider<ServerSharingService>((ref) {
  if (!SupabaseConfig.current.isConfigured) {
    return ServerSharingService();
  }
  return ServerSharingService(client: Supabase.instance.client);
});

/// All members for a specific server (owner view).
final serverMembersProvider =
    FutureProvider.family<List<ServerMember>, String>((ref, serverUrl) {
  final service = ref.watch(serverSharingServiceProvider);
  return service.getServerMembers(serverUrl);
});

/// All servers shared with the current user.
final sharedServersProvider = FutureProvider<List<ServerMember>>((ref) {
  final service = ref.watch(serverSharingServiceProvider);
  return service.getSharedWithMe();
});
