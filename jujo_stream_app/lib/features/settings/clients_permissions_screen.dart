import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/rbac_api.dart';
import 'package:jujo_stream_app/core/providers/rbac_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

// ─── Role metadata ────────────────────────────────────────────────────────────

class _RoleMeta {
  const _RoleMeta({
    required this.value,
    required this.label,
    required this.description,
    required this.icon,
  });

  final String value;
  final String label;
  final String description;
  final IconData icon;
}

const _roles = [
  _RoleMeta(
    value: 'admin',
    label: 'Admin',
    description: 'Full server control — config, pairing, user management',
    icon: LucideIcons.shieldCheck,
  ),
  _RoleMeta(
    value: 'operator',
    label: 'Operator',
    description: 'Launch & quit games, view status',
    icon: LucideIcons.play,
  ),
  _RoleMeta(
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only — apps list, status, covers',
    icon: LucideIcons.eye,
  ),
];

_RoleMeta _roleMetaFor(String value) =>
    _roles.firstWhere((r) => r.value == value, orElse: () => _roles.last);

// ─── Screen ───────────────────────────────────────────────────────────────────

/// Full-screen Client Permission management.
/// Also used as the embedded `_AccessControlTab` in PairingScreen.
class ClientsPermissionsScreen extends ConsumerWidget {
  const ClientsPermissionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Client Permissions'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            tooltip: 'Refresh',
            onPressed: () =>
                ref.read(rbacClientsStateProvider.notifier).refresh(),
          ),
        ],
      ),
      body: const _AccessControlBody(),
    );
  }
}

/// Embeddable body — used both in `ClientsPermissionsScreen` and as
/// the Access Control tab inside PairingScreen.
class AccessControlPanel extends StatelessWidget {
  const AccessControlPanel({super.key});

  @override
  Widget build(BuildContext context) => const _AccessControlBody();
}

// ─── Body ─────────────────────────────────────────────────────────────────────

class _AccessControlBody extends ConsumerWidget {
  const _AccessControlBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final rbacAsync = ref.watch(rbacClientsStateProvider);

    return rbacAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.alertTriangle, size: 48, color: colorScheme.error),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Failed to load clients',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              '$err',
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: colorScheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.md),
            FilledButton.icon(
              onPressed: () =>
                  ref.read(rbacClientsStateProvider.notifier).refresh(),
              icon: const Icon(LucideIcons.refreshCw, size: 16),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
      data: (clients) {
        if (clients.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.users,
                  size: 48,
                  color: colorScheme.onSurfaceVariant.withValues(alpha: 0.35),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'No cloud-paired users',
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Use the Cloud tab to pair users with this server.',
                  style: theme.textTheme.bodySmall
                      ?.copyWith(color: colorScheme.onSurfaceVariant),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(AppSpacing.xl),
          itemCount: clients.length,
          itemBuilder: (context, index) =>
              _ClientCard(client: clients[index]),
        );
      },
    );
  }
}

// ─── Client card ──────────────────────────────────────────────────────────────

class _ClientCard extends ConsumerWidget {
  const _ClientCard({required this.client});

  final RbacClientDto client;

  String _initials(String name) {
    if (name.isEmpty) return '?';
    final parts = name.trim().split(RegExp(r'[\s@._-]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'Unknown';
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final meta = _roleMetaFor(client.role);
    final displayName =
        client.displayName.isNotEmpty ? client.displayName : 'Unknown User';

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.base),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              alignment: Alignment.center,
              child: Text(
                _initials(displayName),
                style: theme.textTheme.titleSmall?.copyWith(
                  color: colorScheme.onPrimaryContainer,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // Name + meta
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName,
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ID: ${client.userId.length > 8 ? client.userId.substring(0, 8) : client.userId}…',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                      fontFamily: 'monospace',
                      fontSize: 11,
                    ),
                  ),
                  if (client.pairedAt != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Paired ${_formatDate(client.pairedAt)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Role badge (tappable)
            Tooltip(
              message: 'Tap to change role',
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                onTap: () => _showRolePicker(context, ref),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: _roleBadgeColor(colorScheme, client.role),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(meta.icon, size: 13,
                          color: _roleBadgeFg(colorScheme, client.role)),
                      const SizedBox(width: 4),
                      Text(
                        meta.label,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: _roleBadgeFg(colorScheme, client.role),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(LucideIcons.chevronDown, size: 12,
                          color: _roleBadgeFg(colorScheme, client.role)),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: AppSpacing.sm),

            // Remove
            IconButton(
              icon: Icon(LucideIcons.trash2, size: 18, color: colorScheme.error),
              tooltip: 'Remove client',
              onPressed: () => _confirmDelete(context, ref),
            ),
          ],
        ),
      ),
    );
  }

  Color _roleBadgeColor(ColorScheme cs, String role) => switch (role) {
        'admin' => cs.errorContainer,
        'operator' => cs.secondaryContainer,
        _ => cs.surfaceContainerHighest,
      };

  Color _roleBadgeFg(ColorScheme cs, String role) => switch (role) {
        'admin' => cs.onErrorContainer,
        'operator' => cs.onSecondaryContainer,
        _ => cs.onSurfaceVariant,
      };

  void _showRolePicker(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _RolePickerSheet(
        displayName: client.displayName.isNotEmpty
            ? client.displayName
            : 'Unknown User',
        currentRole: client.role,
        onSelected: (newRole) async {
          Navigator.of(ctx).pop();
          if (newRole == client.role) return;
          final success = await ref
              .read(rbacClientsStateProvider.notifier)
              .updateRole(client.userId, newRole);
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                success
                    ? 'Role updated to ${_roleMetaFor(newRole).label}'
                    : 'Failed to update role',
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final theme = Theme.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove client?'),
        content: const Text(
          'This client will lose server access and must pair again to reconnect.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: theme.colorScheme.error,
              foregroundColor: theme.colorScheme.onError,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;
    final success = await ref
        .read(rbacClientsStateProvider.notifier)
        .deleteClient(client.userId);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success
            ? 'Client removed'
            : 'Failed to remove client'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

// ─── Role picker bottom sheet ─────────────────────────────────────────────────

class _RolePickerSheet extends StatelessWidget {
  const _RolePickerSheet({
    required this.displayName,
    required this.currentRole,
    required this.onSelected,
  });

  final String displayName;
  final String currentRole;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.xl,
          AppSpacing.lg,
          AppSpacing.xl,
          AppSpacing.xl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Title
            Row(
              children: [
                Icon(LucideIcons.shieldAlert,
                    size: 20, color: colorScheme.primary),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Set role for "$displayName"',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Role options
            ..._roles.map((meta) {
              final selected = meta.value == currentRole;
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: InkWell(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  onTap: () => onSelected(meta.value),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.base,
                      vertical: AppSpacing.md,
                    ),
                    decoration: BoxDecoration(
                      color: selected
                          ? colorScheme.primaryContainer
                          : colorScheme.surfaceContainerHighest
                              .withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(
                        color: selected
                            ? colorScheme.primary
                            : Colors.transparent,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          meta.icon,
                          size: 20,
                          color: selected
                              ? colorScheme.onPrimaryContainer
                              : colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                meta.label,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: selected
                                      ? colorScheme.onPrimaryContainer
                                      : null,
                                ),
                              ),
                              Text(
                                meta.description,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: selected
                                      ? colorScheme.onPrimaryContainer
                                          .withValues(alpha: 0.75)
                                      : colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (selected)
                          Icon(
                            LucideIcons.check,
                            size: 18,
                            color: colorScheme.primary,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
