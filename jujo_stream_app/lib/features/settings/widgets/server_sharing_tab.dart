import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/services/server_sharing_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Server sharing tab — create invites, view members, manage roles.
class ServerSharingTab extends ConsumerStatefulWidget {
  const ServerSharingTab({super.key});

  @override
  ConsumerState<ServerSharingTab> createState() => _ServerSharingTabState();
}

class _ServerSharingTabState extends ConsumerState<ServerSharingTab> {
  bool _creatingInvite = false;
  String? _lastInviteCode;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final serverUrl = authState.serverUrl;

    if (serverUrl == null || serverUrl.isEmpty) {
      return _EmptyState(
        icon: LucideIcons.server,
        title: 'No server connected',
        subtitle: 'Connect to a server to manage sharing.',
      );
    }

    if (authState.mode != AuthMode.cloudAccount) {
      return _EmptyState(
        icon: LucideIcons.cloud,
        title: 'Cloud account required',
        subtitle: 'Server sharing requires a Jujo.Stream cloud account. Sign in to enable.',
      );
    }

    final membersAsync = ref.watch(serverMembersProvider(serverUrl));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            'SERVER SHARING',
            style: theme.textTheme.labelSmall?.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('Invite others to your server', style: theme.textTheme.headlineSmall),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Share your game streaming server with family and friends. They can stream games without needing their own server.',
            style: theme.textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Create Invite section
          _CreateInviteCard(
            loading: _creatingInvite,
            lastCode: _lastInviteCode,
            error: _error,
            onCreateInvite: _handleCreateInvite,
          ),
          const SizedBox(height: AppSpacing.xl),

          // Accept Invite section
          _AcceptInviteCard(),
          const SizedBox(height: AppSpacing.xl),

          // Members list
          Text('Members', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),

          membersAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _ErrorBanner(message: 'Failed to load members: $e'),
            data: (members) {
              if (members.isEmpty) {
                return _EmptyState(
                  icon: LucideIcons.users,
                  title: 'No members yet',
                  subtitle: 'Create an invite code and share it with someone.',
                );
              }
              return Column(
                children: members.map((m) => _MemberTile(
                  member: m,
                  serverUrl: serverUrl,
                )).toList(),
              );
            },
          ),
        ],
      ),
    );
  }

  Future<void> _handleCreateInvite() async {
    final serverUrl = ref.read(authProvider).serverUrl;
    if (serverUrl == null) return;

    setState(() {
      _creatingInvite = true;
      _error = null;
      _lastInviteCode = null;
    });

    final service = ref.read(serverSharingServiceProvider);
    final result = await service.createInvite(serverUrl: serverUrl);

    if (!mounted) return;
    setState(() {
      _creatingInvite = false;
      if (result.success) {
        _lastInviteCode = result.inviteCode;
      } else {
        _error = result.error ?? 'Failed to create invite';
      }
    });

    // Refresh members list
    ref.invalidate(serverMembersProvider(serverUrl));
  }
}

// ─── Create Invite Card ───────────────────────────────────────────────────────

class _CreateInviteCard extends StatelessWidget {
  const _CreateInviteCard({
    required this.loading,
    required this.lastCode,
    required this.error,
    required this.onCreateInvite,
  });

  final bool loading;
  final String? lastCode;
  final String? error;
  final VoidCallback onCreateInvite;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        color: colorScheme.primaryContainer.withValues(alpha: 0.1),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.userPlus, size: 20, color: colorScheme.primary),
              const SizedBox(width: AppSpacing.sm),
              Text('Create Invite', style: theme.textTheme.titleSmall),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Generate a one-time invite code. Share it with someone to give them viewer access.',
            style: theme.textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: AppSpacing.md),

          if (lastCode != null) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: colorScheme.surface,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: colorScheme.outlineVariant),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: SelectableText(
                      lastCode!,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: lastCode!));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Invite code copied!'),
                          behavior: SnackBarBehavior.floating,
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    icon: const Icon(LucideIcons.copy, size: 18),
                    tooltip: 'Copy code',
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'This code can only be used once.',
              style: theme.textTheme.labelSmall?.copyWith(color: colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: AppSpacing.md),
          ],

          if (error != null) ...[
            _ErrorBanner(message: error!),
            const SizedBox(height: AppSpacing.md),
          ],

          FilledButton.icon(
            onPressed: loading ? null : onCreateInvite,
            icon: loading
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(LucideIcons.plus, size: 16),
            label: Text(lastCode != null ? 'Generate Another' : 'Generate Invite Code'),
          ),
        ],
      ),
    );
  }
}

// ─── Accept Invite Card ───────────────────────────────────────────────────────

class _AcceptInviteCard extends ConsumerStatefulWidget {
  @override
  ConsumerState<_AcceptInviteCard> createState() => _AcceptInviteCardState();
}

class _AcceptInviteCardState extends ConsumerState<_AcceptInviteCard> {
  final _codeController = TextEditingController();
  bool _accepting = false;
  String? _acceptError;
  String? _acceptSuccess;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.ticket, size: 20, color: colorScheme.onSurfaceVariant),
              const SizedBox(width: AppSpacing.sm),
              Text('Accept Invite', style: theme.textTheme.titleSmall),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Enter an invite code to join someone else\'s server.',
            style: theme.textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: AppSpacing.md),

          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _codeController,
                  decoration: const InputDecoration(
                    hintText: 'ABCD1234',
                    isDense: true,
                  ),
                  textCapitalization: TextCapitalization.characters,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                    LengthLimitingTextInputFormatter(8),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              FilledButton.tonal(
                onPressed: _accepting ? null : _handleAccept,
                child: _accepting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Join'),
              ),
            ],
          ),

          if (_acceptError != null) ...[
            const SizedBox(height: AppSpacing.sm),
            _ErrorBanner(message: _acceptError!),
          ],
          if (_acceptSuccess != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: const Color(0xFF22C55E).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.checkCircle, size: 16, color: Color(0xFF22C55E)),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      _acceptSuccess!,
                      style: theme.textTheme.bodySmall?.copyWith(color: const Color(0xFF22C55E)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _handleAccept() async {
    final code = _codeController.text.trim();
    if (code.length < 4) {
      setState(() => _acceptError = 'Enter a valid invite code');
      return;
    }

    setState(() {
      _accepting = true;
      _acceptError = null;
      _acceptSuccess = null;
    });

    final service = ref.read(serverSharingServiceProvider);
    final result = await service.acceptInvite(code);

    if (!mounted) return;
    setState(() {
      _accepting = false;
      if (result.success) {
        _acceptSuccess = 'Joined server as ${result.role ?? "viewer"}!';
        _codeController.clear();
      } else {
        _acceptError = result.error ?? 'Failed to accept invite';
      }
    });

    // Refresh shared servers
    ref.invalidate(sharedServersProvider);
  }
}

// ─── Member Tile ─────────────────────────────────────────────────��────────────

class _MemberTile extends ConsumerWidget {
  const _MemberTile({required this.member, required this.serverUrl});

  final ServerMember member;
  final String serverUrl;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.2),
        border: Border.all(color: colorScheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          // Avatar
          CircleAvatar(
            radius: 18,
            backgroundColor: _roleColor(member.role).withValues(alpha: 0.15),
            child: Icon(
              _roleIcon(member.role),
              size: 16,
              color: _roleColor(member.role),
            ),
          ),
          const SizedBox(width: AppSpacing.md),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.memberId.substring(0, 8),
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                Text(
                  '${member.role.name} • ${member.isPending ? "Pending" : "Active"}',
                  style: theme.textTheme.labelSmall?.copyWith(color: colorScheme.onSurfaceVariant),
                ),
              ],
            ),
          ),

          // Role badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
            decoration: BoxDecoration(
              color: _roleColor(member.role).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Text(
              member.role.name,
              style: theme.textTheme.labelSmall?.copyWith(
                color: _roleColor(member.role),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          // Actions
          if (member.isActive && !member.isOwner) ...[
            const SizedBox(width: AppSpacing.sm),
            PopupMenuButton<String>(
              itemBuilder: (_) => [
                if (!member.isAdmin)
                  const PopupMenuItem(value: 'promote', child: Text('Promote to Admin')),
                if (member.isAdmin)
                  const PopupMenuItem(value: 'demote', child: Text('Set as Viewer')),
                const PopupMenuItem(value: 'revoke', child: Text('Revoke Access')),
              ],
              onSelected: (action) => _handleAction(ref, action),
              icon: const Icon(LucideIcons.moreVertical, size: 18),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _handleAction(WidgetRef ref, String action) async {
    final service = ref.read(serverSharingServiceProvider);

    switch (action) {
      case 'promote':
        await service.changeRole(
          memberId: member.memberId,
          serverUrl: serverUrl,
          newRole: ServerMemberRole.admin,
        );
      case 'demote':
        await service.changeRole(
          memberId: member.memberId,
          serverUrl: serverUrl,
          newRole: ServerMemberRole.viewer,
        );
      case 'revoke':
        await service.revokeMember(
          memberId: member.memberId,
          serverUrl: serverUrl,
        );
    }

    ref.invalidate(serverMembersProvider(serverUrl));
  }

  Color _roleColor(ServerMemberRole role) => switch (role) {
        ServerMemberRole.owner => const Color(0xFFEAB308),
        ServerMemberRole.admin => const Color(0xFF3B82F6),
        ServerMemberRole.viewer => const Color(0xFF6B7280),
      };

  IconData _roleIcon(ServerMemberRole role) => switch (role) {
        ServerMemberRole.owner => LucideIcons.crown,
        ServerMemberRole.admin => LucideIcons.shield,
        ServerMemberRole.viewer => LucideIcons.eye,
      };
}

// ─── Shared Widgets ───────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4)),
            const SizedBox(height: AppSpacing.md),
            Text(title, style: theme.textTheme.titleSmall),
            const SizedBox(height: AppSpacing.xs),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: theme.colorScheme.errorContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.alertCircle, size: 16, color: theme.colorScheme.error),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }
}
