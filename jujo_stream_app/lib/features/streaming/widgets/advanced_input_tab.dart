import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Input tab.
///
/// Covers: controller, keyboard, mouse, gamepad type, DS4/DS5 options,
/// back_button_timeout, key_repeat, scancodes, pen/touch, rumble.
class AdvancedInputTab extends ConsumerWidget {
  const AdvancedInputTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Input Devices ──────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Input Devices',
          subtitle: 'Enable or disable input types from connected clients.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Controller',
          subtitle: 'Allow gamepad/controller input from clients',
          value: _parseBool(config.getValue('controller'), fallback: true),
          onChanged: (v) => notifier.setField('controller', v),
        ),
        ConfigSwitchField(
          label: 'Keyboard',
          subtitle: 'Allow keyboard input from clients',
          value: _parseBool(config.getValue('keyboard'), fallback: true),
          onChanged: (v) => notifier.setField('keyboard', v),
        ),
        ConfigSwitchField(
          label: 'Mouse',
          subtitle: 'Allow mouse input from clients',
          value: _parseBool(config.getValue('mouse'), fallback: true),
          onChanged: (v) => notifier.setField('mouse', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Gamepad Emulation ──────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Gamepad Emulation',
          subtitle: 'How the server presents the virtual gamepad to games.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Gamepad type',
          value: config.getValue('gamepad') as String? ?? 'auto',
          options: const ['auto', 'x360', 'xone', 'ds4', 'ds5', 'switch'],
          labels: const [
            'Auto (match client)',
            'Xbox 360',
            'Xbox One',
            'DualShock 4 (DS4)',
            'DualSense (DS5)',
            'Nintendo Switch Pro',
          ],
          onChanged: (v) => notifier.setField('gamepad', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── DualShock/DualSense Options ────────────────────────────────
        const ConfigSectionTitle(
          title: 'DualShock / DualSense',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Back button as touchpad click',
          subtitle: 'Map DS4 back button to touchpad click',
          value: _parseBool(config.getValue('ds4_back_as_touchpad_click'), fallback: true),
          onChanged: (v) => notifier.setField('ds4_back_as_touchpad_click', v),
        ),
        ConfigSwitchField(
          label: 'Motion as DS4',
          subtitle: 'Forward motion sensor data as DS4 gyro',
          value: _parseBool(config.getValue('motion_as_ds4'), fallback: true),
          onChanged: (v) => notifier.setField('motion_as_ds4', v),
        ),
        ConfigSwitchField(
          label: 'Touchpad as DS4',
          subtitle: 'Forward touchpad input as DS4 touchpad',
          value: _parseBool(config.getValue('touchpad_as_ds4'), fallback: true),
          onChanged: (v) => notifier.setField('touchpad_as_ds4', v),
        ),
        ConfigSwitchField(
          label: 'DS5 randomize MAC (Linux)',
          subtitle: 'Randomize virtual DS5 MAC address on Linux (inputtino)',
          value: _parseBool(config.getValue('ds5_inputtino_randomize_mac')),
          onChanged: (v) => notifier.setField('ds5_inputtino_randomize_mac', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Key Repeat ─────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Key Repeat',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Key repeat delay',
          value: (config.getValue('key_repeat_delay') as int?) ?? 500,
          helperText: 'Milliseconds before key starts repeating.',
          min: 100,
          max: 5000,
          suffix: 'ms',
          onChanged: (v) => notifier.setField('key_repeat_delay', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Key repeat frequency',
          value: ((config.getValue('key_repeat_frequency') as num?) ?? 24.9).round(),
          helperText: 'Keys per second when held.',
          min: 1,
          max: 100,
          suffix: 'keys/s',
          onChanged: (v) => notifier.setField('key_repeat_frequency', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Home Button Emulation ──────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Home Button Emulation',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Back button timeout',
          value: (config.getValue('back_button_timeout') as int?) ?? -1,
          helperText: 'Hold back button for this many ms to emulate Home. -1 = disabled.',
          min: -1,
          max: 10000,
          suffix: 'ms',
          onChanged: (v) => notifier.setField('back_button_timeout', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Advanced Input Options ─────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Advanced Input',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'Always send scancodes',
          subtitle: 'Send keyboard scancodes instead of virtual key codes (Windows)',
          value: _parseBool(config.getValue('always_send_scancodes'), fallback: true),
          onChanged: (v) => notifier.setField('always_send_scancodes', v),
        ),
        ConfigSwitchField(
          label: 'High resolution scrolling',
          subtitle: 'Send high-resolution scroll events',
          value: _parseBool(config.getValue('high_resolution_scrolling'), fallback: true),
          onChanged: (v) => notifier.setField('high_resolution_scrolling', v),
        ),
        ConfigSwitchField(
          label: 'Native pen & touch',
          subtitle: 'Use native pen/touch input instead of emulated mouse',
          value: _parseBool(config.getValue('native_pen_touch'), fallback: true),
          onChanged: (v) => notifier.setField('native_pen_touch', v),
        ),
        ConfigSwitchField(
          label: 'Input-only mode',
          subtitle: 'Accept input without streaming video (remote desktop use)',
          value: _parseBool(config.getValue('enable_input_only_mode')),
          onChanged: (v) => notifier.setField('enable_input_only_mode', v),
        ),
        ConfigSwitchField(
          label: 'Forward rumble',
          subtitle: 'Send rumble/vibration feedback to the client controller',
          value: _parseBool(config.getValue('forward_rumble'), fallback: true),
          onChanged: (v) => notifier.setField('forward_rumble', v),
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
