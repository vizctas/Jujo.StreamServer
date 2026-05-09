import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Display Device tab.
///
/// Covers: output_name, virtual_display_mode/layout, all dd_* settings.
class AdvancedDisplayTab extends ConsumerWidget {
  const AdvancedDisplayTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Display Output ─────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Display Output',
          subtitle: 'Which display to capture for streaming.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Output name',
          value: config.getValue('output_name') as String? ?? '',
          helperText: 'Leave empty for primary display. Use display name (e.g. HDMI-1).',
          hintText: 'Auto (primary)',
          onChanged: (v) => notifier.setField('output_name', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Virtual Display ────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Virtual Display',
          subtitle: 'Create a virtual display for streaming without a physical monitor.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Virtual display mode',
          value: config.getValue('virtual_display_mode') as String? ?? 'disabled',
          options: const ['disabled', 'per_client', 'shared'],
          labels: const [
            'Disabled',
            'Per client (each client gets own display)',
            'Shared (all clients share one virtual display)',
          ],
          onChanged: (v) => notifier.setField('virtual_display_mode', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Virtual display layout',
          value: config.getValue('virtual_display_layout') as String? ?? 'exclusive',
          options: const [
            'exclusive',
            'extended',
            'extended_primary',
            'extended_isolated',
            'extended_primary_isolated',
          ],
          labels: const [
            'Exclusive (only virtual display active)',
            'Extended (add to existing displays)',
            'Extended + Primary (virtual becomes primary)',
            'Extended + Isolated (virtual isolated from desktop)',
            'Extended + Primary + Isolated',
          ],
          onChanged: (v) => notifier.setField('virtual_display_layout', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Activate virtual display',
          subtitle: 'Automatically activate the virtual display on stream start',
          value: _parseBool(config.getValue('dd_activate_virtual_display')),
          onChanged: (v) => notifier.setField('dd_activate_virtual_display', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Display Configuration ──────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Display Configuration',
          subtitle: 'How the display is configured when a stream starts.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Configuration option',
          value: config.getValue('dd_configuration_option') as String? ?? 'verify_only',
          options: const [
            'disabled',
            'verify_only',
            'ensure_active',
            'ensure_primary',
            'ensure_only_display',
          ],
          labels: const [
            'Disabled (no changes)',
            'Verify only (check but don\'t change)',
            'Ensure active (activate if needed)',
            'Ensure primary (make primary)',
            'Ensure only display (disable others)',
          ],
          onChanged: (v) => notifier.setField('dd_configuration_option', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Resolution & Refresh Rate ──────────────────────────────────
        const ConfigSectionTitle(
          title: 'Resolution & Refresh Rate',
          subtitle: 'Override display resolution/refresh for streaming.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Resolution option',
          value: config.getValue('dd_resolution_option') as String? ?? 'auto',
          options: const ['disabled', 'auto', 'manual'],
          labels: const [
            'Disabled (don\'t change)',
            'Auto (match client request)',
            'Manual (specify below)',
          ],
          onChanged: (v) => notifier.setField('dd_resolution_option', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Manual resolution',
          value: config.getValue('dd_manual_resolution') as String? ?? '',
          helperText: 'Only used when resolution option is "Manual".',
          hintText: '1920x1080',
          onChanged: (v) => notifier.setField('dd_manual_resolution', v),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigDropdownField(
          label: 'Refresh rate option',
          value: config.getValue('dd_refresh_rate_option') as String? ?? 'auto',
          options: const ['disabled', 'auto', 'manual', 'prefer_highest'],
          labels: const [
            'Disabled (don\'t change)',
            'Auto (match client FPS)',
            'Manual (specify below)',
            'Prefer highest available',
          ],
          onChanged: (v) => notifier.setField('dd_refresh_rate_option', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Manual refresh rate',
          value: config.getValue('dd_manual_refresh_rate') as String? ?? '',
          helperText: 'Only used when refresh rate option is "Manual".',
          hintText: '120',
          onChanged: (v) => notifier.setField('dd_manual_refresh_rate', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── HDR ────────────────────────────────────────────────────────
        const ConfigSectionTitle(title: 'Display HDR'),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'HDR option',
          value: config.getValue('dd_hdr_option') as String? ?? 'auto',
          options: const ['disabled', 'auto'],
          labels: const ['Disabled', 'Auto (enable if client supports)'],
          onChanged: (v) => notifier.setField('dd_hdr_option', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'HDR request override',
          value: config.getValue('dd_hdr_request_override') as String? ?? 'auto',
          options: const ['auto', 'force_on', 'force_off'],
          labels: const ['Auto', 'Force ON', 'Force OFF'],
          onChanged: (v) => notifier.setField('dd_hdr_request_override', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Dummy plug HDR10 workaround',
          subtitle: 'Enable HDR10 workaround for dummy plug adapters',
          value: _parseBool(config.getValue('dd_wa_dummy_plug_hdr10')),
          onChanged: (v) => notifier.setField('dd_wa_dummy_plug_hdr10', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Config Revert ──────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Configuration Revert',
          subtitle: 'Restore display settings after stream ends.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Revert delay',
          value: (config.getValue('dd_config_revert_delay') as int?) ?? 3000,
          helperText: 'Milliseconds to wait before reverting display config.',
          min: 0,
          max: 30000,
          suffix: 'ms',
          onChanged: (v) => notifier.setField('dd_config_revert_delay', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Revert on disconnect',
          subtitle: 'Restore display config when client disconnects',
          value: _parseBool(config.getValue('dd_config_revert_on_disconnect')),
          onChanged: (v) => notifier.setField('dd_config_revert_on_disconnect', v),
        ),
        ConfigSwitchField(
          label: 'Always restore from golden snapshot',
          subtitle: 'Prefer the initial display state over last-known state',
          value: _parseBool(config.getValue('dd_always_restore_from_golden')),
          onChanged: (v) => notifier.setField('dd_always_restore_from_golden', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Double refresh for virtual displays',
          subtitle: 'Workaround: set double refresh rate for virtual displays',
          value: _parseBool(config.getValue('dd_wa_virtual_double_refresh'), fallback: true),
          onChanged: (v) => notifier.setField('dd_wa_virtual_double_refresh', v),
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
