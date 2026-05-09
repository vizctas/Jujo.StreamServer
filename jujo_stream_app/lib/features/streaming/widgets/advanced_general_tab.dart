import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced General tab.
///
/// Covers: sunshine_name, locale, log_level, system_tray, pairing, discovery,
/// notify_pre_releases, update_check_interval, session_token_ttl,
/// frame_limiter settings, lossless_scaling.
class AdvancedGeneralTab extends ConsumerWidget {
  const AdvancedGeneralTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Server Identity ────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Server Identity',
          subtitle: 'How this server appears to clients.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Server name',
          value: config.getValue('sunshine_name') as String? ?? '',
          helperText: 'Display name in Moonlight client list. Leave empty for hostname.',
          hintText: 'My Gaming PC',
          onChanged: (v) => notifier.setField('sunshine_name', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Logging ────────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'Logging'),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Minimum log level',
          value: config.getValue('min_log_level') as String? ?? 'info',
          options: const ['verbose', 'debug', 'info', 'warning', 'error', 'fatal', 'none'],
          labels: const ['Verbose', 'Debug', 'Info', 'Warning', 'Error', 'Fatal', 'None'],
          helperText: 'Lower levels produce more output. "Info" recommended.',
          onChanged: (v) => notifier.setField('min_log_level', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── System Tray & UI ────────────────────���──────────────────────
        const ConfigSectionTitle(title: 'System Tray & UI'),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'System tray icon',
          subtitle: 'Show server icon in the system tray',
          value: _parseBool(config.getValue('system_tray'), fallback: true),
          onChanged: (v) => notifier.setField('system_tray', v),
        ),
        ConfigDropdownField(
          label: 'Locale',
          value: config.getValue('locale') as String? ?? 'en',
          options: const ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt', 'ru'],
          labels: const ['English', 'Español', 'Français', 'Deutsch', '日本語', '中文', '한국어', 'Português', 'Русский'],
          onChanged: (v) => notifier.setField('locale', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Pairing & Discovery ────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Pairing & Discovery',
          subtitle: 'Control how clients find and connect to this server.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Enable pairing',
          subtitle: 'Allow new devices to pair with this server',
          value: _parseBool(config.getValue('enable_pairing'), fallback: true),
          onChanged: (v) => notifier.setField('enable_pairing', v),
        ),
        ConfigSwitchField(
          label: 'Enable discovery',
          subtitle: 'Allow this server to be discovered on the network',
          value: _parseBool(config.getValue('enable_discovery'), fallback: true),
          onChanged: (v) => notifier.setField('enable_discovery', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Updates ────────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'Updates'),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Notify pre-releases',
          subtitle: 'Show notifications for pre-release/beta updates',
          value: _parseBool(config.getValue('notify_pre_releases'), fallback: true),
          onChanged: (v) => notifier.setField('notify_pre_releases', v),
        ),
        ConfigNumberField(
          label: 'Update check interval',
          value: (config.getValue('update_check_interval_seconds') as int?) ?? 86400,
          helperText: 'Seconds between update checks. 0 = disabled. Default: 86400 (24h).',
          min: 0,
          max: 604800,
          suffix: 'sec',
          onChanged: (v) => notifier.setField('update_check_interval_seconds', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Session Tokens ─────────────────────────────────────────────
        const ConfigSectionTitle(title: 'Session Tokens'),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Session token TTL',
          value: (config.getValue('session_token_ttl') as int?) ?? 0,
          helperText: 'Seconds before session token expires. 0 = default.',
          min: 0,
          max: 2592000,
          suffix: 'sec',
          onChanged: (v) => notifier.setField('session_token_ttl', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Remember-me token TTL',
          value: (config.getValue('remember_me_refresh_token_ttl') as int?) ?? 0,
          helperText: 'Seconds before remember-me token expires. 0 = default.',
          min: 0,
          max: 31536000,
          suffix: 'sec',
          onChanged: (v) => notifier.setField('remember_me_refresh_token_ttl', v),
        ),
        const SizedBox(height: AppSpacing.xxl),

        // ─── Frame Limiter ──────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Frame Limiter',
          subtitle: 'Limit the host GPU frame rate during streaming.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Enable frame limiter',
          subtitle: 'Cap the host frame rate to reduce GPU load',
          value: _parseBool(config.getValue('frame_limiter_enable')),
          onChanged: (v) => notifier.setField('frame_limiter_enable', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Provider',
          value: config.getValue('frame_limiter_provider') as String? ?? 'auto',
          options: const ['auto', 'rtss', 'nvidia-control-panel', 'none'],
          labels: const [
            'Auto',
            'RTSS (RivaTuner)',
            'NVIDIA Control Panel',
            'None (manual)',
          ],
          onChanged: (v) => notifier.setField('frame_limiter_provider', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'FPS limit',
          value: (config.getValue('frame_limiter_fps_limit') as int?) ?? 0,
          helperText: '0 = match stream FPS. Set a specific value to override.',
          min: 0,
          max: 360,
          suffix: 'fps',
          onChanged: (v) => notifier.setField('frame_limiter_fps_limit', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Disable VSync',
          subtitle: 'Force VSync off during streaming',
          value: _parseBool(config.getValue('frame_limiter_disable_vsync')),
          onChanged: (v) => notifier.setField('frame_limiter_disable_vsync', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── RTSS ──────────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'RTSS (RivaTuner)'),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'RTSS install path',
          value: config.getValue('rtss_install_path') as String? ?? '',
          helperText: 'Leave empty for auto-detect.',
          hintText: 'C:\\Program Files (x86)\\RivaTuner Statistics Server',
          onChanged: (v) => notifier.setField('rtss_install_path', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Frame limit type',
          value: config.getValue('rtss_frame_limit_type') as String? ?? 'async',
          options: const ['async', 'front_edge_sync', 'back_edge_sync', 'nvidia_reflex'],
          labels: const ['Async', 'Front Edge Sync', 'Back Edge Sync', 'NVIDIA Reflex'],
          onChanged: (v) => notifier.setField('rtss_frame_limit_type', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Lossless Scaling ───────────────────────────────────────────
        const ConfigSectionTitle(title: 'Lossless Scaling'),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Lossless Scaling path',
          value: config.getValue('lossless_scaling_path') as String? ?? '',
          helperText: 'Path to LosslessScaling.exe. Leave empty for auto-detect.',
          hintText: 'Auto-detect',
          onChanged: (v) => notifier.setField('lossless_scaling_path', v),
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
