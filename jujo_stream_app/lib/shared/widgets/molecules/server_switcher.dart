import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:go_router/go_router.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/server_process_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
import 'package:jujo_stream_app/core/services/server_presence_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Server switcher chip displayed in the sidebar footer.
///
/// Shows current server name + connectivity dot.
/// Tapping opens a bottom sheet with:
///  - List of saved profiles (tap to switch)
///  - "Add Server" action
class ServerSwitcherChip extends ConsumerWidget {
  const ServerSwitcherChip({super.key, this.extended = false});

  /// When true (wide sidebar) shows full URL label. When false shows icon only.
  final bool extended;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profilesState = ref.watch(serverProfilesProvider);
    final serverStatus = ref.watch(serverStatusProvider);
    final activeProfile = profilesState.activeProfile;
    final isSwitching = profilesState.switching;

    final label = activeProfile?.displayName ?? 'No Server';
    final isOnline = serverStatus.isOnline;

    final statusColor = isSwitching
        ? const Color(0xFFFFA726) // amber while resolving
        : isOnline
            ? const Color(0xFF4CAF50)
            : const Color(0xFFFF5252);

    return Tooltip(
      message: activeProfile?.url ?? 'No server configured',
      child: InkWell(
        onTap: () => _showServerSheet(context, ref),
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: Theme.of(context).colorScheme.outlineVariant,
            ),
          ),
          child: extended
              ? Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _StatusDot(color: statusColor),
                    const SizedBox(width: AppSpacing.sm),
                    Flexible(
                      child: Text(
                        _truncateUrl(label),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Icon(
                      LucideIcons.chevronsUpDown,
                      size: 12,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ],
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      LucideIcons.server,
                      size: 16,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    _StatusDot(color: statusColor),
                  ],
                ),
        ),
      ),
    );
  }

  String _truncateUrl(String url) {
    final stripped = url
        .replaceAll('https://', '')
        .replaceAll('http://', '');
    if (stripped.length > 22) return '${stripped.substring(0, 22)}…';
    return stripped;
  }

  void _showServerSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (_) => _ServerPickerSheet(parentContext: context),
    );
  }
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

class _ServerPickerSheet extends ConsumerWidget {
  const _ServerPickerSheet({required this.parentContext});
  final BuildContext parentContext;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profilesState = ref.watch(serverProfilesProvider);

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
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            Row(
              children: [
                Text(
                  'Servers',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                if (profilesState.syncing) ...[
                  const SizedBox(width: AppSpacing.sm),
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
                if (profilesState.switching) ...[
                  const SizedBox(width: AppSpacing.sm),
                  Icon(
                    LucideIcons.radio,
                    size: 14,
                    color: const Color(0xFFFFA726),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Connecting…',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: const Color(0xFFFFA726),
                        ),
                  ),
                ],
              ],
            ),
            // Sync error banner
            if (profilesState.lastSyncError != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.errorContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Row(
                  children: [
                    Icon(
                      LucideIcons.cloudOff,
                      size: 12,
                      color: Theme.of(context).colorScheme.error,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Cloud sync unavailable',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Theme.of(context).colorScheme.error,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: AppSpacing.md),

            if (profilesState.profiles.isEmpty) ...[
              _EmptyServersHint(),
            ] else ...[
              ...profilesState.profiles.map(
                (profile) => _ProfileTile(
                  profile: profile,
                  isActive: profile.id == profilesState.activeProfileId,
                  onSwitch: () async {
                    Navigator.of(context).pop();
                    await ref
                        .read(serverProfilesProvider.notifier)
                        .switchProfile(profile.id);
                  },
                  onRemove: () async {
                    await ref
                        .read(serverProfilesProvider.notifier)
                        .removeProfile(profile.id);
                  },
                ),
              ),
            ],

            const SizedBox(height: AppSpacing.base),
            const Divider(),
            const SizedBox(height: AppSpacing.sm),

            // Deploy server option — only on Windows with valid build
            if (!kIsWeb) _DeployServerTile(parentContext: parentContext),

            // Add server button
            ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(
                  LucideIcons.plus,
                  size: 20,
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
              ),
              title: const Text('Add Server'),
              subtitle: const Text('Connect to another Jujo.Stream server'),
              onTap: () {
                Navigator.of(context).pop();
                _showAddServerDialog(parentContext, ref);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddServerDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (_) => const AddServerDialog(),
    );
  }
}

// ─── Profile tile ─────────────────────────────────────────────────────────────

class _ProfileTile extends ConsumerStatefulWidget {
  const _ProfileTile({
    required this.profile,
    required this.isActive,
    required this.onSwitch,
    required this.onRemove,
  });

  final ServerProfile profile;
  final bool isActive;
  final VoidCallback onSwitch;
  final VoidCallback onRemove;

  @override
  ConsumerState<_ProfileTile> createState() => _ProfileTileState();
}

class _ProfileTileState extends ConsumerState<_ProfileTile> {
  bool _hasToken = true; // assume connected until checked

  @override
  void initState() {
    super.initState();
    _checkToken();
  }

  Future<void> _checkToken() async {
    final has = await ref
        .read(serverProfilesProvider.notifier)
        .hasLocalToken(widget.profile.id);
    if (mounted && has != _hasToken) {
      setState(() => _hasToken = has);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final profile = widget.profile;
    final isActive = widget.isActive;
    final isCloudOnly = !_hasToken;

    // Cloud presence for non-active servers
    final presence = ref.watch(serverPresenceByUrlProvider(profile.url));
    final isRemoteOnline = !isActive && presence != null && presence.isOnline;
    final isRemoteStreaming = !isActive && presence != null && presence.isStreaming;

    return ListTile(
      leading: Stack(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isActive
                  ? colorScheme.primaryContainer
                  : isCloudOnly
                      ? colorScheme.tertiaryContainer.withValues(alpha: 0.5)
                      : colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              profile.isLocal ? LucideIcons.monitor : LucideIcons.server,
              size: 20,
              color: isActive
                  ? colorScheme.onPrimaryContainer
                  : isCloudOnly
                      ? colorScheme.tertiary
                      : colorScheme.onSurfaceVariant,
            ),
          ),
          // Presence dot for non-active servers (from cloud heartbeat)
          if (isRemoteOnline)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: isRemoteStreaming
                      ? const Color(0xFF3B82F6) // blue = streaming
                      : const Color(0xFF4CAF50), // green = online
                  shape: BoxShape.circle,
                  border: Border.all(color: colorScheme.surface, width: 1.5),
                ),
              ),
            ),
          // Cloud badge for cloud-synced profiles without local token
          if (isCloudOnly)
            Positioned(
              right: -2,
              bottom: -2,
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: colorScheme.tertiaryContainer,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: colorScheme.surface,
                    width: 1.5,
                  ),
                ),
                child: Icon(
                  LucideIcons.cloud,
                  size: 9,
                  color: colorScheme.onTertiaryContainer,
                ),
              ),
            ),
        ],
      ),
      title: Text(
        profile.displayName,
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          color: isActive
              ? colorScheme.primary
              : isCloudOnly
                  ? colorScheme.onSurfaceVariant
                  : null,
        ),
      ),
      subtitle: Row(
        children: [
          if (profile.username != null) ...[
            Flexible(
              child: Text(
                profile.username!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
          if (isCloudOnly) ...[
            if (profile.username != null)
              const SizedBox(width: AppSpacing.xs),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.xs + 2,
                vertical: 1,
              ),
              decoration: BoxDecoration(
                color: colorScheme.tertiaryContainer.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Text(
                'Sign in required',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.tertiary,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ],
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isActive)
            Icon(LucideIcons.check, size: 16, color: colorScheme.primary),
          if (isCloudOnly && !isActive)
            IconButton(
              icon: const Icon(LucideIcons.logIn, size: 16),
              tooltip: 'Connect to this server',
              color: colorScheme.tertiary,
              onPressed: () => _showConnectDialog(context),
            ),
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 16),
            tooltip: 'Remove server',
            color: colorScheme.onSurfaceVariant,
            onPressed: () => _confirmRemove(context),
          ),
        ],
      ),
      onTap: isActive
          ? null
          : isCloudOnly
              ? () => _showConnectDialog(context)
              : widget.onSwitch,
    );
  }

  void _showConnectDialog(BuildContext context) {
    Navigator.of(context).pop(); // close the bottom sheet
    showDialog<void>(
      context: context,
      builder: (_) => AddServerDialog(
        initialUrl: widget.profile.url,
        initialName: widget.profile.name,
        initialUsername: widget.profile.username,
      ),
    );
  }

  void _confirmRemove(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Server?'),
        content: Text(
          'Remove "${widget.profile.displayName}" from your saved servers?\n\nYou can add it again later.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              widget.onRemove();
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}

// ─── Add Server dialog ────────────────────────────────────────────────────────

/// Standalone dialog to add a new server profile.
/// Can be used from any screen (Settings, ServerSwitcher, etc.).
class AddServerDialog extends ConsumerStatefulWidget {
  const AddServerDialog({
    super.key,
    this.parentRef,
    this.initialUrl,
    this.initialName,
    this.initialUsername,
  });

  final WidgetRef? parentRef;

  /// Pre-fill URL (e.g. from a cloud-synced profile that needs re-auth).
  final String? initialUrl;

  /// Pre-fill display name.
  final String? initialName;

  /// Pre-fill username.
  final String? initialUsername;

  @override
  ConsumerState<AddServerDialog> createState() => _AddServerDialogState();
}

class _AddServerDialogState extends ConsumerState<AddServerDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _urlController;
  late final TextEditingController _nameController;
  late final TextEditingController _usernameController;
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(
      text: widget.initialUrl ?? 'https://',
    );
    _nameController = TextEditingController(
      text: widget.initialName ?? '',
    );
    _usernameController = TextEditingController(
      text: widget.initialUsername ?? '',
    );
  }
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _urlController.dispose();
    _nameController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _connect() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    final url = _urlController.text.trim();
    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    final name = _nameController.text.trim();

    // Test credentials against the server without touching cloud auth state.
    final token = await ref.read(authProvider.notifier).testServerConnection(
          serverUrl: url,
          username: username,
          password: password,
        );

    if (!mounted) return;

    if (token != null) {
      await ref.read(serverProfilesProvider.notifier).addAndActivate(
            url: url,
            username: username,
            token: token,
            name: name.isNotEmpty ? name : null,
          );

      if (mounted) {
        Navigator.of(context).pop();
        // Invalidate global providers so they reload for the new server.
        ref.invalidate(serverStatusProvider);
      }
    } else {
      setState(() {
        _isLoading = false;
        _error = 'Could not connect to server. Check URL and credentials.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return AlertDialog(
      title: const Text('Add Server'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'Server URL',
                  hintText: 'https://192.168.1.x:47990',
                  prefixIcon: Icon(LucideIcons.server),
                ),
                keyboardType: TextInputType.url,
                autocorrect: false,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Required';
                  if (!v.trim().startsWith('http')) return 'Must start with https://';
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.base),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Display Name (optional)',
                  hintText: 'e.g. Gaming PC',
                  prefixIcon: Icon(LucideIcons.tag),
                ),
              ),
              const SizedBox(height: AppSpacing.base),
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  prefixIcon: Icon(LucideIcons.user),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: AppSpacing.base),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(LucideIcons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                      size: 16,
                    ),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                obscureText: _obscurePassword,
                validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
              ),
              if (_error != null) ...[
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: colorScheme.errorContainer,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Row(
                    children: [
                      Icon(LucideIcons.alertCircle,
                          size: 14, color: colorScheme.onErrorContainer),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          _error!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onErrorContainer,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          onPressed: _isLoading ? null : _connect,
          icon: _isLoading
              ? const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(LucideIcons.plugZap, size: 16),
          label: Text(_isLoading ? 'Connecting…' : 'Connect'),
        ),
      ],
    );
  }
}

// ─── Deploy Server Tile ───────────────────────────────────────────────────────

/// Shows "Deploy Server" option in the server picker when:
/// - Not running on web
/// - No local server is currently running
/// - Build files are available (canDeploy) OR server is not installed
class _DeployServerTile extends ConsumerWidget {
  const _DeployServerTile({required this.parentContext});
  final BuildContext parentContext;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final processState = ref.watch(serverProcessProvider).state;
    final serverStatus = ref.watch(serverStatusProvider);

    // Only show if: no local server running AND (build available OR not installed)
    final isLocalServerRunning =
        processState == ServerProcessState.running && serverStatus.isOnline;
    final canDeploy = ServerDeployService().canDeploy;
    final isNotInstalled = processState == ServerProcessState.notInstalled;

    if (isLocalServerRunning || (!canDeploy && !isNotInstalled)) {
      return const SizedBox.shrink();
    }

    final colorScheme = Theme.of(context).colorScheme;

    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: colorScheme.secondaryContainer,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Icon(
          LucideIcons.hardDrive,
          size: 20,
          color: colorScheme.onSecondaryContainer,
        ),
      ),
      title: const Text('Deploy Server'),
      subtitle: const Text('Install on this machine'),
      onTap: () {
        Navigator.of(context).pop();
        parentContext.go('/deploy');
      },
    );
  }
}

// ─── Empty hint ───────────────────────────────────────────────────────────────

class _EmptyServersHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
      child: Center(
        child: Column(
          children: [
            Icon(LucideIcons.serverOff,
                size: 32, color: colorScheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No servers saved yet',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Status dot ───────────────────────────────────────────────────────────────

class _StatusDot extends StatelessWidget {
  const _StatusDot({required this.color});
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
