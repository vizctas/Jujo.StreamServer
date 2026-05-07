import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
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
      length: 5,
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
                    Icon(LucideIcons.serverOff,
                        size: 40, color: colorScheme.onSurfaceVariant),
                    const SizedBox(height: AppSpacing.md),
                    Text('No saved servers',
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        )),
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
                      fontWeight:
                          isActive ? FontWeight.w600 : FontWeight.normal,
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
    showDialog<void>(
      context: context,
      builder: (_) => const AddServerDialog(),
    );
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
