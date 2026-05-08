import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_audio_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_display_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_encoder_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_general_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_input_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_network_tab.dart';
import 'package:jujo_stream_app/features/streaming/widgets/advanced_video_tab.dart';

/// Streaming configuration screen with casual/advanced mode toggle.
class StreamConfigScreen extends ConsumerStatefulWidget {
  const StreamConfigScreen({super.key});

  @override
  ConsumerState<StreamConfigScreen> createState() => _StreamConfigScreenState();
}

class _StreamConfigScreenState extends ConsumerState<StreamConfigScreen> {
  bool _advancedMode = false;

  @override
  void initState() {
    super.initState();
    // Load config on first build
    Future.microtask(() => ref.read(streamConfigProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final configState = ref.watch(streamConfigProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'STREAMING',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text('Stream Configuration', style: theme.textTheme.headlineSmall),
                  ],
                ),
              ),
              // Mode toggle
              SegmentedButton<bool>(
                segments: const [
                  ButtonSegment(value: false, label: Text('Simple')),
                  ButtonSegment(value: true, label: Text('Advanced')),
                ],
                selected: {_advancedMode},
                onSelectionChanged: (v) => setState(() => _advancedMode = v.first),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          if (configState.isLoading && configState.serverConfig == null)
            const Center(child: CircularProgressIndicator())
          else if (configState.error != null && configState.serverConfig == null)
            _ErrorCard(error: configState.error!, onRetry: () => ref.read(streamConfigProvider.notifier).load())
          else ...[
            if (!_advancedMode)
              _CasualMode()
            else
              _AdvancedMode(),

            // Apply bar
            if (configState.hasChanges) ...[
              const SizedBox(height: AppSpacing.xxl),
              _ApplyBar(),
            ],
          ],
        ],
      ),
    );
  }
}

/// Casual mode: quality presets.
class _CasualMode extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final config = ref.watch(streamConfigProvider);

    // Determine current preset from config values
    final currentPreset = _detectPreset(config);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Stream Quality', style: theme.textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Choose a preset that matches your network and preferences.',
          style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
        ),
        const SizedBox(height: AppSpacing.lg),

        ..._presets.map((preset) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: _PresetCard(
            preset: preset,
            selected: currentPreset == preset.id,
            onSelect: () => _applyPreset(ref, preset),
          ),
        )),

        const SizedBox(height: AppSpacing.xl),
        _AutoDetectedInfo(config: config),
      ],
    );
  }

  String _detectPreset(StreamConfigState config) {
    final bitrate = config.getValue('max_bitrate') as int? ?? 20000;
    if (bitrate <= 10000) return 'performance';
    if (bitrate >= 40000) return 'quality';
    return 'balanced';
  }

  void _applyPreset(WidgetRef ref, _QualityPreset preset) {
    final notifier = ref.read(streamConfigProvider.notifier);
    notifier.setField('max_bitrate', preset.bitrate);
    if (preset.hevcMode != null) notifier.setField('hevc_mode', preset.hevcMode);
  }
}

class _QualityPreset {
  const _QualityPreset({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.bitrate,
    this.hevcMode,
  });

  final String id;
  final String name;
  final String description;
  final IconData icon;
  final int bitrate;
  final int? hevcMode;
}

const _presets = [
  _QualityPreset(
    id: 'performance',
    name: 'Performance',
    description: 'Lower latency, reduced bitrate. Best for competitive games.',
    icon: LucideIcons.zap,
    bitrate: 10000,
    hevcMode: 0,
  ),
  _QualityPreset(
    id: 'balanced',
    name: 'Balanced',
    description: 'Good quality with reasonable bandwidth. Recommended for most users.',
    icon: LucideIcons.scale,
    bitrate: 20000,
    hevcMode: 1,
  ),
  _QualityPreset(
    id: 'quality',
    name: 'Quality',
    description: 'Maximum visual fidelity. Requires strong network (40+ Mbps).',
    icon: LucideIcons.sparkles,
    bitrate: 50000,
    hevcMode: 1,
  ),
];

class _PresetCard extends StatelessWidget {
  const _PresetCard({
    required this.preset,
    required this.selected,
    required this.onSelect,
  });

  final _QualityPreset preset;
  final bool selected;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return GestureDetector(
      onTap: onSelect,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: selected ? colorScheme.primary : colorScheme.outlineVariant,
            width: selected ? 2 : 1,
          ),
          color: selected
              ? colorScheme.primary.withValues(alpha: 0.06)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: (selected ? colorScheme.primary : colorScheme.onSurfaceVariant)
                    .withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Icon(
                preset.icon,
                size: 22,
                color: selected ? colorScheme.primary : colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(preset.name, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(
                    preset.description,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            if (selected)
              Icon(LucideIcons.checkCircle, color: colorScheme.primary, size: 22),
          ],
        ),
      ),
    );
  }
}

/// Advanced mode: tabbed full configuration.
///
/// 7 tabs covering ALL server config keys (excluding WebRTC/Playnite):
/// Video, Display, Audio, Input, Network, Encoder-Specific, General.
class _AdvancedMode extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 7,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            labelStyle: theme.textTheme.labelLarge,
            unselectedLabelStyle: theme.textTheme.labelMedium,
            tabs: const [
              Tab(text: 'Video'),
              Tab(text: 'Display'),
              Tab(text: 'Audio'),
              Tab(text: 'Input'),
              Tab(text: 'Network'),
              Tab(text: 'Encoder'),
              Tab(text: 'General'),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            // Fixed height for tab content — scrollable within each tab
            height: 600,
            child: const TabBarView(
              children: [
                AdvancedVideoTab(),
                AdvancedDisplayTab(),
                AdvancedAudioTab(),
                AdvancedInputTab(),
                AdvancedNetworkTab(),
                AdvancedEncoderTab(),
                AdvancedGeneralTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Auto-detected info card.
class _AutoDetectedInfo extends StatelessWidget {
  const _AutoDetectedInfo({required this.config});

  final StreamConfigState config;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final encoder = config.getValue('encoder') as String? ?? 'auto';
    final codec = (config.getValue('hevc_mode') as int? ?? 0) > 0 ? 'H.265' : 'H.264';

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.info, size: 18, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'Auto-detected: ${encoder.isEmpty ? "auto" : encoder.toUpperCase()} $codec',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Apply bar shown when there are pending changes.
class _ApplyBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final configState = ref.watch(streamConfigProvider);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
        border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.save, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              '${configState.pendingChanges.length} unsaved change${configState.pendingChanges.length > 1 ? "s" : ""}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () => ref.read(streamConfigProvider.notifier).discardChanges(),
            child: const Text('Discard'),
          ),
          const SizedBox(width: AppSpacing.sm),
          FilledButton(
            onPressed: configState.isLoading
                ? null
                : () async {
                    final result = await ref.read(streamConfigProvider.notifier).apply();
                    if (result.requiresRestart && context.mounted) {
                      _showRestartDialog(context, ref);
                    }
                  },
            child: configState.isLoading
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _showRestartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Restart Required'),
        content: const Text('Some changes require a server restart to take effect.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Later'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(streamConfigProvider.notifier).restart();
            },
            child: const Text('Restart Now'),
          ),
        ],
      ),
    );
  }
}


class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.error, required this.onRetry});

  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: theme.colorScheme.errorContainer.withValues(alpha: 0.3),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.alertCircle, color: theme.colorScheme.error, size: 20),
          const SizedBox(width: AppSpacing.sm),
          Expanded(child: Text(error, style: theme.textTheme.bodySmall)),
          TextButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
