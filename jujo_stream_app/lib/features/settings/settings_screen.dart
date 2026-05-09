import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/autostart_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/autostart_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/providers/theme_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/settings/widgets/server_sharing_tab.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/server_switcher.dart';

/// Settings screen — tabbed layout for app + server settings.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return DefaultTabController(
      length: 6,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.xl,
              AppSpacing.xl,
              AppSpacing.xl,
              0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SETTINGS',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: colorScheme.primary,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text('Preferences', style: theme.textTheme.headlineSmall),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.base),

          // Tabs
          TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            tabs: const [
              Tab(text: 'Appearance'),
              Tab(text: 'Servers'),
              Tab(text: 'Sharing'),
              Tab(text: 'Art'),
              Tab(text: 'Connection'),
              Tab(text: 'About'),
            ],
          ),

          // Tab content
          Expanded(
            child: TabBarView(
              children: [
                _AppearanceTab(),
                _ServersTab(),
                const ServerSharingTab(),
                const _ArtTab(),
                _ServerTab(),
                _AboutTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Appearance settings: theme, density.
class _AppearanceTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currentPreset = ref.watch(themePresetProvider);
    final currentDensity = ref.watch(densityProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Theme', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Choose a color scheme for the app.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Theme presets grid
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: ThemePreset.values.map((preset) {
              return _ThemePreview(
                name: preset.label,
                color: preset.primaryColor,
                selected: currentPreset == preset,
                onTap: () =>
                    ref.read(themePresetProvider.notifier).setPreset(preset),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.xxl),

          Text('Density', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          SegmentedButton<DensityMode>(
            segments: DensityMode.values.map((mode) {
              return ButtonSegment<DensityMode>(
                value: mode,
                label: Text(mode.label),
              );
            }).toList(),
            selected: {currentDensity},
            onSelectionChanged: (selected) {
              ref.read(densityProvider.notifier).setDensity(selected.first);
            },
          ),
        ],
      ),
    );
  }
}

class _ThemePreview extends StatelessWidget {
  const _ThemePreview({
    required this.name,
    required this.color,
    required this.selected,
    this.onTap,
  });

  final String name;
  final Color color;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: selected ? colorScheme.primary : colorScheme.outlineVariant,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(AppRadius.sm),
                border:
                    color == const Color(0xFF000000) ||
                        color == const Color(0xFFF8FAFC)
                    ? Border.all(color: colorScheme.outlineVariant)
                    : null,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              name,
              style: theme.textTheme.labelSmall,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (selected) ...[
              const SizedBox(height: AppSpacing.xs),
              Icon(LucideIcons.check, size: 14, color: colorScheme.primary),
            ],
          ],
        ),
      ),
    );
  }
}

/// Servers tab — manage saved server profiles.
class _ServersTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final profilesState = ref.watch(serverProfilesProvider);
    final serverStatus = ref.watch(serverStatusProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Saved Servers', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Manage the Jujo.Stream servers you connect to. Each server has its own credentials and configuration.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          if (profilesState.profiles.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
                child: Column(
                  children: [
                    Icon(
                      LucideIcons.serverOff,
                      size: 40,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'No saved servers',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...profilesState.profiles.map((profile) {
              final isActive = profile.id == profilesState.activeProfileId;
              return Card(
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                child: ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isActive
                          ? colorScheme.primaryContainer
                          : colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Stack(
                      children: [
                        Center(
                          child: Icon(
                            profile.isLocal
                                ? LucideIcons.monitor
                                : LucideIcons.server,
                            size: 20,
                            color: isActive
                                ? colorScheme.onPrimaryContainer
                                : colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (isActive && serverStatus.isOnline)
                          Positioned(
                            right: 4,
                            bottom: 4,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Color(0xFF4CAF50),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  title: Text(
                    profile.displayName,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: isActive
                          ? FontWeight.w600
                          : FontWeight.normal,
                      color: isActive ? colorScheme.primary : null,
                    ),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (profile.url != profile.displayName)
                        Text(
                          profile.url,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      if (profile.username != null)
                        Text(
                          'User: ${profile.username}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      if (isActive)
                        Text(
                          'Active',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: colorScheme.primary,
                          ),
                        ),
                    ],
                  ),
                  isThreeLine: profile.username != null,
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (!isActive)
                        TextButton(
                          onPressed: () async {
                            await ref
                                .read(serverProfilesProvider.notifier)
                                .switchProfile(profile.id);
                          },
                          child: const Text('Switch'),
                        ),
                      IconButton(
                        icon: const Icon(LucideIcons.trash2, size: 16),
                        tooltip: 'Remove',
                        onPressed: isActive
                            ? null
                            : () async {
                                await ref
                                    .read(serverProfilesProvider.notifier)
                                    .removeProfile(profile.id);
                              },
                      ),
                    ],
                  ),
                ),
              );
            }),

          const SizedBox(height: AppSpacing.base),
          // Add server button
          FilledButton.tonalIcon(
            onPressed: () => _showAddServerDialog(context, ref),
            icon: const Icon(LucideIcons.plus, size: 16),
            label: const Text('Add Server'),
          ),
        ],
      ),
    );
  }

  void _showAddServerDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(context: context, builder: (_) => const AddServerDialog());
  }
}

/// Server connection settings.
class _ServerTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final serverStatus = ref.watch(serverStatusProvider);
    final isOnline = serverStatus.isOnline;

    // Only show "Connected to" when actually reachable
    final connectionLabel = isOnline
        ? 'Connected to'
        : authState.serverUrl != null
        ? 'Server unreachable'
        : 'Not connected';
    final connectionValue = isOnline
        ? authState.serverUrl!
        : authState.serverUrl != null
        ? authState.serverUrl!
        : 'No server configured';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Connection', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),

          // Current server
          Container(
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: isOnline
                    ? const Color(0xFF4CAF50).withValues(alpha: 0.4)
                    : colorScheme.outlineVariant,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isOnline ? LucideIcons.server : LucideIcons.serverOff,
                  size: 20,
                  color: isOnline
                      ? const Color(0xFF4CAF50)
                      : colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(connectionLabel, style: theme.textTheme.labelSmall),
                      Text(
                        connectionValue,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isOnline ? null : colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isOnline)
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF4CAF50),
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Account
          Text('Account', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          FilledButton.icon(
            onPressed: () => ref.read(authProvider.notifier).logout(),
            icon: const Icon(LucideIcons.logOut, size: 18),
            label: const Text('Logout'),
            style: FilledButton.styleFrom(
              backgroundColor: colorScheme.error,
              foregroundColor: colorScheme.onError,
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),

          const _UnattendedStartupSection(),
          const SizedBox(height: AppSpacing.xxl),

          // Developer / Debug
          Text('Developer', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(onboardingProvider.notifier).reset();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Onboarding reset. Log out to see it again.'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            icon: const Icon(LucideIcons.rotateCcw, size: 18),
            label: const Text('Reset Onboarding'),
          ),
        ],
      ),
    );
  }
}

class _UnattendedStartupSection extends ConsumerWidget {
  const _UnattendedStartupSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final statusAsync = ref.watch(autoStartStatusProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Unattended Startup', style: theme.textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'For dedicated hosts: combine Wake-on-LAN with Windows AutoLogon so the machine boots and returns ready for streaming.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          padding: const EdgeInsets.all(AppSpacing.base),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: statusAsync.when(
            data: (status) {
              if (status == null || !status.supported) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          LucideIcons.info,
                          size: 16,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            'Unattended startup is not available',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'AutoLogon requires the Jujo.Stream Windows service to be installed and set to Automatic startup. '
                      'If you are running the server as a standalone executable, unattended startup is not supported.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                );
              }

              final stateLabel = status.bootPathReady ? 'Ready' : 'Needs setup';
              final stateColor = status.bootPathReady
                  ? const Color(0xFF22C55E)
                  : const Color(0xFFF59E0B);
              final account = status.domain.isEmpty
                  ? status.username
                  : '${status.domain}\\${status.username}';

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.power, size: 18, color: stateColor),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        'Boot path: $stateLabel',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'AutoLogon: ${status.autologonEnabled ? 'Enabled' : 'Disabled'}',
                    style: theme.textTheme.bodySmall,
                  ),
                  if (status.autologonEnabled && account.isNotEmpty)
                    Text(
                      'Account: $account',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  Text(
                    'Service startup: ${status.serviceStartType}',
                    style: theme.textTheme.bodySmall,
                  ),
                  Text(
                    'Service running: ${status.serviceRunning ? 'Yes' : 'No'}',
                    style: theme.textTheme.bodySmall,
                  ),
                  if ((status.warning ?? '').isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: Text(
                        status.warning!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: const Color(0xFFF59E0B),
                        ),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Security note: AutoLogon credentials are stored by Windows and can be recovered by local administrators.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: () => _openEnableDialog(context, ref),
                        icon: const Icon(LucideIcons.lock, size: 16),
                        label: Text(
                          status.autologonEnabled
                              ? 'Update AutoLogon'
                              : 'Enable AutoLogon',
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: status.autologonEnabled
                            ? () => _disableAutoLogon(context, ref)
                            : null,
                        icon: const Icon(LucideIcons.unlock, size: 16),
                        label: const Text('Disable'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () =>
                            ref.invalidate(autoStartStatusProvider),
                        icon: const Icon(LucideIcons.refreshCw, size: 16),
                        label: const Text('Refresh'),
                      ),
                    ],
                  ),
                ],
              );
            },
            loading: () => const SizedBox(
              height: 72,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => Text(
              'Could not load unattended startup status.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.error,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _openEnableDialog(BuildContext context, WidgetRef ref) async {
    final result = await showDialog<AutoStartActionResult>(
      context: context,
      builder: (_) => const _EnableAutoStartDialog(),
    );
    if (result == null) {
      return;
    }
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
    ref.invalidate(autoStartStatusProvider);
  }

  Future<void> _disableAutoLogon(BuildContext context, WidgetRef ref) async {
    final api = ref.read(autoStartApiProvider);
    final result = await api.disable();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
    ref.invalidate(autoStartStatusProvider);
  }
}

class _EnableAutoStartDialog extends ConsumerStatefulWidget {
  const _EnableAutoStartDialog();

  @override
  ConsumerState<_EnableAutoStartDialog> createState() =>
      _EnableAutoStartDialogState();
}

class _EnableAutoStartDialogState
    extends ConsumerState<_EnableAutoStartDialog> {
  final _usernameController = TextEditingController();
  final _domainController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;
  bool _obscure = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _domainController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Enable AutoLogon'),
      content: SizedBox(
        width: 420,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Enter Windows account used for unattended sign-in after reboot.',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Username',
                hintText: 'example: gamerpc',
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              controller: _domainController,
              decoration: const InputDecoration(
                labelText: 'Domain (optional)',
                hintText: 'example: . or WORKGROUP',
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              controller: _passwordController,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Password',
                suffixIcon: IconButton(
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(
                    _obscure ? LucideIcons.eye : LucideIcons.eyeOff,
                    size: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _submitting ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submitting ? null : _submit,
          child: _submitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Enable'),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    final username = _usernameController.text.trim();
    final domain = _domainController.text.trim();
    final password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Username and password are required.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      return;
    }

    setState(() => _submitting = true);
    final api = ref.read(autoStartApiProvider);
    final result = await api.enable(
      username: username,
      domain: domain,
      password: password,
    );
    if (!mounted) {
      return;
    }
    setState(() => _submitting = false);
    Navigator.of(context).pop(result);
  }
}


/// Art Sources tab — configure poster/metadata API keys.
class _ArtTab extends ConsumerStatefulWidget {
  const _ArtTab();

  @override
  ConsumerState<_ArtTab> createState() => _ArtTabState();
}

class _ArtTabState extends ConsumerState<_ArtTab> {
  final _steamGridDbCtrl = TextEditingController();
  bool _saving = false;
  bool _obscure = true;

  @override
  void dispose() {
    _steamGridDbCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveProvider(String providerId) async {
    final key = _steamGridDbCtrl.text.trim();
    if (key.isEmpty) return;

    setState(() => _saving = true);
    final api = ref.read(localArtApiProvider);
    final result = await api.connectProvider(providerId, key);
    if (!mounted) return;
    setState(() => _saving = false);

    ref.invalidate(artMetadataStatusProvider);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result.message),
        behavior: SnackBarBehavior.floating,
        backgroundColor: result.success
            ? null
            : Theme.of(context).colorScheme.error,
      ),
    );

    if (result.success) _steamGridDbCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final statusAsync = ref.watch(artMetadataStatusProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Art Sources', style: theme.textTheme.headlineSmall),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Configure API keys for external poster and metadata providers. '
            'Steam local art works automatically — no key required.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Providers status overview
          statusAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const SizedBox.shrink(),
            data: (status) {
              if (status == null) return const SizedBox.shrink();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Provider status', style: theme.textTheme.titleSmall),
                  const SizedBox(height: AppSpacing.sm),
                  ...status.providers.map((p) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                    child: Row(
                      children: [
                        Icon(
                          p.configured ? LucideIcons.checkCircle : LucideIcons.circle,
                          size: 16,
                          color: p.configured
                              ? colorScheme.primary
                              : colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(p.name, style: theme.textTheme.bodySmall),
                        const SizedBox(width: AppSpacing.sm),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: p.configured
                                ? colorScheme.primaryContainer
                                : colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          child: Text(
                            p.configured ? 'Configured' : 'Not configured',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: p.configured
                                  ? colorScheme.onPrimaryContainer
                                  : colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
                  const SizedBox(height: AppSpacing.xl),
                ],
              );
            },
          ),

          // Steam (always available, no key needed)
          Text('Steam', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Container(
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: colorScheme.outlineVariant),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.checkCircle, size: 16, color: colorScheme.primary),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Steam local art is read directly from your Steam installation\'s '
                    'appcache/librarycache folder. No API key required.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // SteamGridDB
          Text('SteamGridDB', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'SteamGridDB provides high-quality custom artwork for all games. '
            'Get a free API key at steamgriddb.com.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _steamGridDbCtrl,
            obscureText: _obscure,
            decoration: InputDecoration(
              labelText: 'SteamGridDB API Key',
              hintText: 'Paste your API key...',
              prefixIcon: const Icon(LucideIcons.key, size: 18),
              suffixIcon: IconButton(
                icon: Icon(_obscure ? LucideIcons.eyeOff : LucideIcons.eye, size: 18),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.icon(
            onPressed: _saving ? null : () => _saveProvider('steamgriddb'),
            icon: _saving
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(LucideIcons.save, size: 18),
            label: const Text('Save API Key'),
          ),

          const SizedBox(height: AppSpacing.xl),

          // IGDB (future)
          Text('IGDB', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Container(
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              color: colorScheme.surfaceContainerHighest,
            ),
            child: Row(
              children: [
                Icon(LucideIcons.clock, size: 16, color: colorScheme.onSurfaceVariant),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'IGDB integration coming soon. Will require a Twitch Developer application client ID and secret.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// About tab.
class _AboutTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Column(
              children: [
                Icon(LucideIcons.radio, size: 48, color: colorScheme.primary),
                const SizedBox(height: AppSpacing.md),
                Text('Jujo.Stream', style: theme.textTheme.titleLarge),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'v1.0.0',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'A premium streaming server management app.\n'
                  'Built with Flutter • Material 3 • Riverpod',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
