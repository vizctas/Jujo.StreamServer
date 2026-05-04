import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/theme_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Settings screen — tabbed layout for app + server settings.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return DefaultTabController(
      length: 3,
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
            tabs: const [
              Tab(text: 'Appearance'),
              Tab(text: 'Server'),
              Tab(text: 'About'),
            ],
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            isScrollable: true,
            tabAlignment: TabAlignment.start,
          ),

          // Tab content
          Expanded(
            child: TabBarView(
              children: [_AppearanceTab(), _ServerTab(), _AboutTab()],
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

/// Server connection settings.
class _ServerTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);

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
              border: Border.all(color: colorScheme.outlineVariant),
            ),
            child: Row(
              children: [
                Icon(
                  LucideIcons.server,
                  size: 20,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Connected to', style: theme.textTheme.labelSmall),
                      Text(
                        authState.serverUrl ?? 'Not connected',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Logout
          Text('Account', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: () => ref.read(authProvider.notifier).logout(),
            icon: const Icon(LucideIcons.logOut, size: 18),
            label: const Text('Disconnect & Logout'),
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
