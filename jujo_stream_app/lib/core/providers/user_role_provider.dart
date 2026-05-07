import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/services/server_sharing_service.dart';

/// The current user's role on the active server.
///
/// - Owner/local server → [ServerMemberRole.owner]
/// - Shared server → fetched from server_members table
/// - No server selected → [ServerMemberRole.owner] (safe default)
///
/// Used by AppShell to hide nav items that require admin access.
final userRoleProvider = Provider<ServerMemberRole>((ref) {
  final profile = ref.watch(activeServerProfileProvider);

  // Local servers are always owned by the current user.
  if (profile == null || profile.isLocal) {
    return ServerMemberRole.owner;
  }

  // For cloud-connected servers, check the membership state.
  // TODO: When cloud membership sync is implemented, read from cached state.
  // For now, default to owner (backward compat — existing users are owners).
  return ServerMemberRole.owner;
});

/// Whether the current user can access admin-level screens (Settings, Sharing).
final isAdminProvider = Provider<bool>((ref) {
  final role = ref.watch(userRoleProvider);
  return role == ServerMemberRole.owner || role == ServerMemberRole.admin;
});

/// Whether the current user can perform operator actions (launch games, WoL).
final isOperatorOrAboveProvider = Provider<bool>((ref) {
  final role = ref.watch(userRoleProvider);
  return role != ServerMemberRole.viewer;
});
