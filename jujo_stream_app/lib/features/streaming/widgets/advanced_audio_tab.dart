import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Audio tab.
///
/// Covers: audio_sink, virtual_sink, stream_audio, install_steam_audio_drivers,
/// keep_default, auto_capture.
class AdvancedAudioTab extends ConsumerWidget {
  const AdvancedAudioTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Audio Output ───────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Audio Output',
          subtitle: 'Configure which audio device is captured for streaming.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Audio sink',
          value: config.getValue('audio_sink') as String? ?? '',
          helperText: 'Audio output device name. Leave empty for system default.',
          hintText: 'Default audio device',
          onChanged: (v) => notifier.setField('audio_sink', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Virtual sink',
          value: config.getValue('virtual_sink') as String? ?? '',
          helperText: 'Virtual audio device that mutes host speakers during streaming.',
          hintText: 'None (host audio audible)',
          onChanged: (v) => notifier.setField('virtual_sink', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Audio Behavior ─────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Audio Behavior',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Stream audio',
          subtitle: 'Send audio to the connected client',
          value: _parseBool(config.getValue('stream_audio'), fallback: true),
          onChanged: (v) => notifier.setField('stream_audio', v),
        ),
        ConfigSwitchField(
          label: 'Install Steam audio drivers',
          subtitle: 'Automatically install virtual audio drivers from Steam',
          value: _parseBool(config.getValue('install_steam_audio_drivers'), fallback: true),
          onChanged: (v) => notifier.setField('install_steam_audio_drivers', v),
        ),
        ConfigSwitchField(
          label: 'Keep default audio device',
          subtitle: 'Don\'t change the default audio device during streaming',
          value: _parseBool(config.getValue('keep_default')),
          onChanged: (v) => notifier.setField('keep_default', v),
        ),
        ConfigSwitchField(
          label: 'Auto capture',
          subtitle: 'Automatically select the best audio capture method',
          value: _parseBool(config.getValue('auto_capture'), fallback: true),
          onChanged: (v) => notifier.setField('auto_capture', v),
        ),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }

  static bool _parseBool(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is String) return value == 'enabled' || value == 'true' || value == '1';
    if (value is int) return value != 0;
    return fallback;
  }
}
