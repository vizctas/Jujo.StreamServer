import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

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

/// Advanced mode: full controls.
class _AdvancedMode extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Encoder
        _SectionTitle(title: 'Encoder'),
        const SizedBox(height: AppSpacing.md),
        _DropdownField(
          label: 'Encoder',
          value: config.getValue('encoder') as String? ?? '',
          options: const ['', 'nvenc', 'amf', 'qsv', 'software'],
          labels: const ['Auto-detect', 'NVENC (NVIDIA)', 'AMF (AMD)', 'QSV (Intel)', 'Software (CPU)'],
          onChanged: (v) => notifier.setField('encoder', v),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Codec
        _SectionTitle(title: 'Codec'),
        const SizedBox(height: AppSpacing.md),
        _DropdownField(
          label: 'HEVC (H.265)',
          value: '${config.getValue('hevc_mode') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Disabled', 'Enabled (allow)', 'Always', 'Auto'],
          onChanged: (v) => notifier.setField('hevc_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        _DropdownField(
          label: 'AV1',
          value: '${config.getValue('av1_mode') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Disabled', 'Enabled (allow)', 'Always', 'Auto'],
          onChanged: (v) => notifier.setField('av1_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Bitrate
        _SectionTitle(title: 'Bitrate'),
        const SizedBox(height: AppSpacing.md),
        _SliderField(
          label: 'Max Bitrate',
          value: (config.getValue('max_bitrate') as int? ?? 20000).toDouble(),
          min: 1000,
          max: 100000,
          divisions: 99,
          suffix: 'kbps',
          onChanged: (v) => notifier.setField('max_bitrate', v.round()),
        ),
        const SizedBox(height: AppSpacing.lg),

        // FEC
        _SectionTitle(title: 'Error Correction'),
        const SizedBox(height: AppSpacing.md),
        _SliderField(
          label: 'FEC Percentage',
          value: (config.getValue('fec_percentage') as int? ?? 20).toDouble(),
          min: 1,
          max: 100,
          divisions: 99,
          suffix: '%',
          onChanged: (v) => notifier.setField('fec_percentage', v.round()),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Network encryption
        _SectionTitle(title: 'Encryption'),
        const SizedBox(height: AppSpacing.md),
        _DropdownField(
          label: 'LAN Encryption',
          value: '${config.getValue('lan_encryption_mode') ?? 0}',
          options: const ['0', '1', '2'],
          labels: const ['Never', 'Opportunistic', 'Mandatory'],
          onChanged: (v) => notifier.setField('lan_encryption_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        _DropdownField(
          label: 'WAN Encryption',
          value: '${config.getValue('wan_encryption_mode') ?? 1}',
          options: const ['0', '1', '2'],
          labels: const ['Never', 'Opportunistic', 'Mandatory'],
          onChanged: (v) => notifier.setField('wan_encryption_mode', int.tryParse(v) ?? 1),
        ),
      ],
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

// ─── Shared Field Widgets ─────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.titleSmall);
  }
}

class _DropdownField extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.options,
    required this.labels,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<String> options;
  final List<String> labels;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final initialValue = options.contains(value) ? value : options.first;
    return DropdownButtonFormField<String>(
      initialValue: initialValue,
      decoration: InputDecoration(labelText: label),
      items: List.generate(options.length, (i) {
        return DropdownMenuItem(value: options[i], child: Text(labels[i]));
      }),
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }
}

class _SliderField extends StatelessWidget {
  const _SliderField({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.divisions,
    required this.suffix,
    required this.onChanged,
  });

  final String label;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final String suffix;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final clampedValue = value.clamp(min, max);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: theme.textTheme.bodyMedium),
            Text(
              '${clampedValue.round()} $suffix',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
        Slider(
          value: clampedValue,
          min: min,
          max: max,
          divisions: divisions,
          onChanged: onChanged,
        ),
      ],
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
