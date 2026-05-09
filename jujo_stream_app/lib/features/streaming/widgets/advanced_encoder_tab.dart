import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Encoder-Specific tab.
///
/// Shows encoder-specific settings based on the currently selected encoder.
/// Sub-sections: NVENC, AMD (AMF), QSV, Software, VideoToolbox, VAAPI.
class AdvancedEncoderTab extends ConsumerWidget {
  const AdvancedEncoderTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final encoder = config.getValue('encoder') as String? ?? '';

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        _EncoderInfoBanner(encoder: encoder),
        const SizedBox(height: AppSpacing.xl),

        // Show all sections — user may switch encoder later
        // Highlight the active one
        _NvencSection(active: encoder == 'nvenc' || encoder.isEmpty),
        const SizedBox(height: AppSpacing.xl),
        _AmdSection(active: encoder == 'amf' || encoder.isEmpty),
        const SizedBox(height: AppSpacing.xl),
        _QsvSection(active: encoder == 'qsv' || encoder.isEmpty),
        const SizedBox(height: AppSpacing.xl),
        _SoftwareSection(active: encoder == 'software' || encoder.isEmpty),
        const SizedBox(height: AppSpacing.xl),
        _VideoToolboxSection(active: encoder == 'videotoolbox' || encoder.isEmpty),
        const SizedBox(height: AppSpacing.xl),
        _VaapiSection(active: encoder == 'vaapi' || encoder.isEmpty),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }
}

class _EncoderInfoBanner extends StatelessWidget {
  const _EncoderInfoBanner({required this.encoder});
  final String encoder;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = encoder.isEmpty ? 'Auto-detect' : encoder.toUpperCase();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
      ),
      child: Row(
        children: [
          Icon(Icons.memory, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'Active encoder: $name — settings below apply to their respective encoder.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── NVENC ────────────────────────────────────────────────────────────────────

class _NvencSection extends ConsumerWidget {
  const _NvencSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'NVENC (NVIDIA)',
      active: active,
      children: [
        ConfigDropdownField(
          label: 'Preset',
          value: '${config.getValue('nvenc_preset') ?? 1}',
          options: const ['1', '2', '3', '4', '5', '6', '7'],
          labels: const ['P1 (fastest)', 'P2', 'P3', 'P4 (balanced)', 'P5', 'P6', 'P7 (best quality)'],
          helperText: 'P1 = lowest latency, P7 = best quality. P1 recommended for streaming.',
          onChanged: (v) => notifier.setField('nvenc_preset', int.tryParse(v) ?? 1),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Two-pass encoding',
          value: config.getValue('nvenc_twopass') as String? ?? 'quarter_res',
          options: const ['disabled', 'quarter_res', 'full_res'],
          labels: const ['Disabled', 'Quarter resolution (fast)', 'Full resolution (slow)'],
          helperText: 'Two-pass improves quality at the cost of latency.',
          onChanged: (v) => notifier.setField('nvenc_twopass', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Spatial AQ',
          subtitle: 'Adaptive quantization — allocates more bits to complex regions',
          value: _parseBool(config.getValue('nvenc_spatial_aq')),
          onChanged: (v) => notifier.setField('nvenc_spatial_aq', v),
        ),
        ConfigSwitchField(
          label: 'Realtime HAGS',
          subtitle: 'Use Hardware Accelerated GPU Scheduling for realtime priority',
          value: _parseBool(config.getValue('nv_realtime_hags')),
          onChanged: (v) => notifier.setField('nv_realtime_hags', v),
        ),
        ConfigSwitchField(
          label: 'OpenGL/Vulkan on DXGI',
          subtitle: 'Capture OpenGL/Vulkan apps via DXGI instead of NvFBC',
          value: _parseBool(config.getValue('nv_opengl_vulkan_on_dxgi')),
          onChanged: (v) => notifier.setField('nv_opengl_vulkan_on_dxgi', v),
        ),
        ConfigSwitchField(
          label: 'High power mode',
          subtitle: 'Force GPU to high-performance power state during encoding',
          value: _parseBool(config.getValue('nv_sunshine_high_power_mode')),
          onChanged: (v) => notifier.setField('nv_sunshine_high_power_mode', v),
        ),
      ],
    );
  }
}

// ─── AMD ──────────────────────────────────────────────────────────────────────

class _AmdSection extends ConsumerWidget {
  const _AmdSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'AMF (AMD)',
      active: active,
      children: [
        ConfigDropdownField(
          label: 'Usage (H.264)',
          value: '${config.getValue('amd_usage_h264') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Transcoding', 'Ultra Low Latency', 'Low Latency', 'Webcam'],
          onChanged: (v) => notifier.setField('amd_usage_h264', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Usage (HEVC)',
          value: '${config.getValue('amd_usage_hevc') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Transcoding', 'Ultra Low Latency', 'Low Latency', 'Webcam'],
          onChanged: (v) => notifier.setField('amd_usage_hevc', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Usage (AV1)',
          value: '${config.getValue('amd_usage_av1') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['Transcoding', 'Ultra Low Latency', 'Low Latency', 'Webcam'],
          onChanged: (v) => notifier.setField('amd_usage_av1', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigDropdownField(
          label: 'Rate control (H.264)',
          value: '${config.getValue('amd_rc_h264') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['CQP', 'CBR', 'VBR Peak', 'VBR Latency'],
          onChanged: (v) => notifier.setField('amd_rc_h264', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Rate control (HEVC)',
          value: '${config.getValue('amd_rc_hevc') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['CQP', 'CBR', 'VBR Peak', 'VBR Latency'],
          onChanged: (v) => notifier.setField('amd_rc_hevc', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Rate control (AV1)',
          value: '${config.getValue('amd_rc_av1') ?? 0}',
          options: const ['0', '1', '2', '3'],
          labels: const ['CQP', 'CBR', 'VBR Peak', 'VBR Latency'],
          onChanged: (v) => notifier.setField('amd_rc_av1', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigSwitchField(
          label: 'Enforce HRD',
          subtitle: 'Enforce Hypothetical Reference Decoder compliance',
          value: _parseBool(config.getValue('amd_enforce_hrd')),
          onChanged: (v) => notifier.setField('amd_enforce_hrd', v),
        ),
        ConfigSwitchField(
          label: 'Pre-analysis',
          subtitle: 'Enable pre-analysis pass for better quality',
          value: _parseBool(config.getValue('amd_preanalysis')),
          onChanged: (v) => notifier.setField('amd_preanalysis', v),
        ),
        ConfigSwitchField(
          label: 'VBAQ',
          subtitle: 'Variance Based Adaptive Quantization',
          value: _parseBool(config.getValue('amd_vbaq')),
          onChanged: (v) => notifier.setField('amd_vbaq', v),
        ),
      ],
    );
  }
}

// ─── QSV ──────────────────────────────────────────────────────────────────────

class _QsvSection extends ConsumerWidget {
  const _QsvSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'QSV (Intel)',
      active: active,
      children: [
        ConfigDropdownField(
          label: 'Preset',
          value: '${config.getValue('qsv_preset') ?? 0}',
          options: const ['0', '1', '2', '3', '4', '5', '6', '7'],
          labels: const ['Default', 'Speed', 'Balanced', 'Quality', '4', '5', '6', '7'],
          onChanged: (v) => notifier.setField('qsv_preset', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'CAVLC',
          subtitle: 'Use CAVLC entropy coding instead of CABAC (faster, lower quality)',
          value: _parseBool(config.getValue('qsv_cavlc')),
          onChanged: (v) => notifier.setField('qsv_cavlc', v),
        ),
        ConfigSwitchField(
          label: 'Slow HEVC',
          subtitle: 'Use slower HEVC encoding for better quality',
          value: _parseBool(config.getValue('qsv_slow_hevc')),
          onChanged: (v) => notifier.setField('qsv_slow_hevc', v),
        ),
      ],
    );
  }
}

// ─── Software ─────────────────────────────────────────────────────────────────

class _SoftwareSection extends ConsumerWidget {
  const _SoftwareSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'Software (CPU)',
      active: active,
      children: [
        ConfigDropdownField(
          label: 'Preset (x264/x265)',
          value: config.getValue('sw_preset') as String? ?? 'superfast',
          options: const ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow'],
          labels: const ['Ultrafast', 'Superfast', 'Very Fast', 'Faster', 'Fast', 'Medium', 'Slow'],
          helperText: 'Faster = less CPU, lower quality. Superfast recommended.',
          onChanged: (v) => notifier.setField('sw_preset', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Tune',
          value: config.getValue('sw_tune') as String? ?? 'zerolatency',
          options: const ['zerolatency', 'film', 'animation', 'grain', 'stillimage', 'fastdecode'],
          labels: const ['Zero Latency (streaming)', 'Film', 'Animation', 'Grain', 'Still Image', 'Fast Decode'],
          helperText: 'Zero Latency is required for real-time streaming.',
          onChanged: (v) => notifier.setField('sw_tune', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSliderField(
          label: 'SVT-AV1 preset',
          value: (config.getValue('svtav1_preset') as int? ?? 8).toDouble(),
          min: 0,
          max: 13,
          divisions: 13,
          suffix: '',
          helperText: '0 = best quality (slowest), 13 = fastest. 8 recommended.',
          onChanged: (v) => notifier.setField('svtav1_preset', v.round()),
        ),
      ],
    );
  }
}

// ─── VideoToolbox ────────────────────────────────���────────────────────────────

class _VideoToolboxSection extends ConsumerWidget {
  const _VideoToolboxSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'VideoToolbox (macOS)',
      active: active,
      children: [
        ConfigSwitchField(
          label: 'Allow software fallback',
          subtitle: 'Fall back to CPU encoding if hardware encoder unavailable',
          value: _parseBool(config.getValue('vt_allow_sw')),
          onChanged: (v) => notifier.setField('vt_allow_sw', v),
        ),
        ConfigSwitchField(
          label: 'Require software',
          subtitle: 'Force software encoding (ignore hardware encoder)',
          value: _parseBool(config.getValue('vt_require_sw')),
          onChanged: (v) => notifier.setField('vt_require_sw', v),
        ),
        ConfigSwitchField(
          label: 'Realtime',
          subtitle: 'Enable realtime encoding priority',
          value: _parseBool(config.getValue('vt_realtime'), fallback: true),
          onChanged: (v) => notifier.setField('vt_realtime', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Coder',
          value: config.getValue('vt_coder') as String? ?? 'auto',
          options: const ['auto', 'cabac', 'cavlc'],
          labels: const ['Auto', 'CABAC (better quality)', 'CAVLC (faster)'],
          onChanged: (v) => notifier.setField('vt_coder', v),
        ),
      ],
    );
  }
}

// ─── VAAPI ────────────────────────────────────────────────────────────────────

class _VaapiSection extends ConsumerWidget {
  const _VaapiSection({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return _EncoderGroupCard(
      title: 'VAAPI (Linux)',
      active: active,
      children: [
        ConfigSwitchField(
          label: 'Strict rate control buffer',
          subtitle: 'Enforce strict VBV/HRD buffer constraints',
          value: _parseBool(config.getValue('vaapi_strict_rc_buffer')),
          onChanged: (v) => notifier.setField('vaapi_strict_rc_buffer', v),
        ),
      ],
    );
  }
}

// ─── Encoder Group Card ───────────────────────────────────────────────────────

class _EncoderGroupCard extends StatelessWidget {
  const _EncoderGroupCard({
    required this.title,
    required this.active,
    required this.children,
  });

  final String title;
  final bool active;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: active
            ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.3)
            : colorScheme.surfaceContainerHighest.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: active
              ? colorScheme.primary.withValues(alpha: 0.3)
              : colorScheme.outlineVariant.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: theme.textTheme.titleSmall?.copyWith(
                  color: active ? colorScheme.primary : colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (active) ...[
                const SizedBox(width: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: colorScheme.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Text(
                    'ACTIVE',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: colorScheme.primary,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...children,
        ],
      ),
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

bool _parseBool(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value is String) return value == 'enabled' || value == 'true' || value == '1';
  if (value is int) return value != 0;
  return fallback;
}
