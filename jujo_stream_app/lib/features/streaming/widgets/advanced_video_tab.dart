import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Video & Encoding tab.
///
/// Covers: resolution, fps, encoder selection, codec modes, QP, bitrate,
/// capture method, HDR, min_threads, prefer_10bit_sdr, minimum_fps_target.
class AdvancedVideoTab extends ConsumerWidget {
  const AdvancedVideoTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Resolution ─────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Resolution',
          subtitle: 'Set to 0 for auto (match client request)',
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: ConfigDropdownField(
                label: 'Width',
                value: '${config.getValue('width') ?? 0}',
                options: const ['0', '1280', '1920', '2560', '3840'],
                labels: const ['Auto', '1280 (720p)', '1920 (1080p)', '2560 (1440p)', '3840 (4K)'],
                onChanged: (v) => notifier.setField('width', int.tryParse(v) ?? 0),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: ConfigDropdownField(
                label: 'Height',
                value: '${config.getValue('height') ?? 0}',
                options: const ['0', '720', '1080', '1440', '2160'],
                labels: const ['Auto', '720', '1080', '1440', '2160'],
                onChanged: (v) => notifier.setField('height', int.tryParse(v) ?? 0),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Frame Rate ─────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Frame Rate',
          subtitle: 'Set to 0 for auto (match client request)',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'FPS',
          value: '${config.getValue('fps') ?? 0}',
          options: const ['0', '30', '60', '90', '120', '144', '165', '240'],
          labels: const ['Auto', '30', '60', '90', '120', '144', '165', '240'],
          onChanged: (v) => notifier.setField('fps', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Limit framerate',
          subtitle: 'Cap encoding FPS to the configured value',
          value: (config.getValue('limit_framerate') as bool?) ?? false,
          onChanged: (v) => notifier.setField('limit_framerate', v),
        ),
        ConfigNumberField(
          label: 'Minimum FPS target',
          value: (config.getValue('minimum_fps_target') as int?) ?? 0,
          helperText: '0 = half of client FPS. Prevents encoder from dropping too low.',
          min: 0,
          max: 240,
          suffix: 'fps',
          onChanged: (v) => notifier.setField('minimum_fps_target', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Encoder ────────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Encoder',
          subtitle: 'Hardware encoder selection. Auto-detect recommended.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Encoder',
          value: config.getValue('encoder') as String? ?? '',
          options: const ['', 'nvenc', 'amf', 'qsv', 'vaapi', 'videotoolbox', 'software'],
          labels: const [
            'Auto-detect',
            'NVENC (NVIDIA)',
            'AMF (AMD)',
            'QSV (Intel)',
            'VAAPI (Linux)',
            'VideoToolbox (macOS)',
            'Software (CPU)',
          ],
          onChanged: (v) => notifier.setField('encoder', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Codec ──────────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Codec',
          subtitle: 'H.265 (HEVC) and AV1 offer better quality at lower bitrates.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'HEVC (H.265)',
          value: '${config.getValue('hevc_mode') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Disabled', 'Allow (client decides)', 'Always', 'Auto'],
          onChanged: (v) => notifier.setField('hevc_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'AV1',
          value: '${config.getValue('av1_mode') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Disabled', 'Allow (client decides)', 'Always', 'Auto'],
          onChanged: (v) => notifier.setField('av1_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Capture ────────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Capture Method',
          subtitle: 'How the screen is captured for encoding.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Capture',
          value: config.getValue('capture') as String? ?? '',
          options: const ['', 'nvfbc', 'wgc', 'ddx', 'wlr', 'kms', 'x11'],
          labels: const [
            'Auto',
            'NvFBC (NVIDIA, lowest latency)',
            'WGC (Windows Graphics Capture)',
            'DDX (DirectX Duplication)',
            'wlroots (Wayland)',
            'KMS (Linux DRM)',
            'X11 (legacy Linux)',
          ],
          onChanged: (v) => notifier.setField('capture', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Adapter name',
          value: config.getValue('adapter_name') as String? ?? '',
          helperText: 'GPU adapter override. Leave empty for auto-detect.',
          hintText: 'e.g. NVIDIA GeForce RTX 4090',
          onChanged: (v) => notifier.setField('adapter_name', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Quality ────────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Quality & Bitrate',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSliderField(
          label: 'Max Bitrate',
          value: (config.getValue('max_bitrate') as int? ?? 20000).toDouble(),
          min: 1000,
          max: 150000,
          divisions: 149,
          suffix: 'kbps',
          helperText: 'Higher = better quality, more bandwidth. 20000 recommended for 1080p.',
          onChanged: (v) => notifier.setField('max_bitrate', v.round()),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigSliderField(
          label: 'Quantization Parameter (QP)',
          value: (config.getValue('qp') as int? ?? 28).toDouble(),
          min: 1,
          max: 51,
          divisions: 50,
          suffix: '',
          helperText: 'Lower = better quality, higher bitrate. 28 is default.',
          onChanged: (v) => notifier.setField('qp', v.round()),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigNumberField(
          label: 'Min encoding threads',
          value: (config.getValue('min_threads') as int?) ?? 2,
          helperText: 'Minimum CPU threads for software encoding. 2 recommended.',
          min: 1,
          max: 64,
          onChanged: (v) => notifier.setField('min_threads', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── HDR & Color ────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'HDR & Color'),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'HDR',
          subtitle: 'Requires HDR-capable display and client support',
          value: (config.getValue('hdr') as bool?) ?? false,
          onChanged: (v) => notifier.setField('hdr', v),
        ),
        ConfigSwitchField(
          label: 'Prefer 10-bit SDR',
          subtitle: 'Use 10-bit encoding for SDR when HEVC/AV1 Main10 is available',
          value: (config.getValue('prefer_10bit_sdr') as bool?) ?? false,
          onChanged: (v) => notifier.setField('prefer_10bit_sdr', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Fallback ───────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'Fallback & Probing'),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Ignore encoder probe failure',
          subtitle: 'Skip encoder validation on startup (use if probe incorrectly fails)',
          value: (config.getValue('ignore_encoder_probe_failure') as bool?) ?? false,
          onChanged: (v) => notifier.setField('ignore_encoder_probe_failure', v),
        ),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }
}
