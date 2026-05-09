import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/providers/config_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/streaming/widgets/config_field_widgets.dart';

/// Advanced Network tab.
///
/// Covers: port, address_family, upnp, external_ip, encryption (LAN/WAN),
/// ping_timeout, FEC percentage, video_max_batch_size_kb, origin_web_ui_allowed.
class AdvancedNetworkTab extends ConsumerWidget {
  const AdvancedNetworkTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(streamConfigProvider);
    final notifier = ref.read(streamConfigProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.base),
      children: [
        // ─── Port & Address ─────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Port & Address',
          subtitle: 'Base port determines all other ports (RTSP, HTTPS, etc.)',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Base port',
          value: (config.getValue('port') as int?) ?? 47989,
          helperText: 'Default: 47989. Other ports are offset from this.',
          min: 1024,
          max: 65535,
          onChanged: (v) => notifier.setField('port', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Address family',
          value: config.getValue('address_family') as String? ?? 'ipv4',
          options: const ['ipv4', 'both'],
          labels: const ['IPv4 only', 'IPv4 + IPv6 (dual-stack)'],
          onChanged: (v) => notifier.setField('address_family', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'Bind address',
          value: config.getValue('bind_address') as String? ?? '',
          helperText: 'Leave empty to bind all interfaces. Use specific IP to restrict.',
          hintText: '0.0.0.0',
          onChanged: (v) => notifier.setField('bind_address', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── UPnP & External IP ─────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'UPnP & External Access',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSwitchField(
          label: 'UPnP',
          subtitle: 'Automatically forward ports on your router',
          value: _parseBool(config.getValue('upnp'), false),
          onChanged: (v) => notifier.setField('upnp', v ? 'enabled' : 'disabled'),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigTextField(
          label: 'External IP',
          value: config.getValue('external_ip') as String? ?? '',
          helperText: 'Override auto-detected external IP. Leave empty for auto.',
          hintText: 'e.g. 203.0.113.42',
          onChanged: (v) => notifier.setField('external_ip', v),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'Web UI access',
          value: config.getValue('origin_web_ui_allowed') as String? ?? 'lan',
          options: const ['pc', 'lan', 'wan'],
          labels: const [
            'This PC only',
            'LAN (local network)',
            'WAN (internet — use with caution)',
          ],
          helperText: 'Who can access the web admin interface.',
          onChanged: (v) => notifier.setField('origin_web_ui_allowed', v),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Encryption ��────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Encryption',
          subtitle: 'Stream encryption for LAN and WAN connections.',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'LAN encryption',
          value: '${config.getValue('lan_encryption_mode') ?? 0}',
          options: const ['0', '1', '2'],
          labels: const ['Never', 'Opportunistic', 'Mandatory'],
          helperText: 'LAN is usually trusted — "Never" reduces latency.',
          onChanged: (v) => notifier.setField('lan_encryption_mode', int.tryParse(v) ?? 0),
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigDropdownField(
          label: 'WAN encryption',
          value: '${config.getValue('wan_encryption_mode') ?? 1}',
          options: const ['0', '1', '2'],
          labels: const ['Never', 'Opportunistic', 'Mandatory'],
          helperText: 'WAN should always be encrypted. "Mandatory" recommended.',
          onChanged: (v) => notifier.setField('wan_encryption_mode', int.tryParse(v) ?? 1),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Error Correction & Batching ────────────���───────────────────
        const ConfigSectionTitle(
          title: 'Error Correction & Batching',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigSliderField(
          label: 'FEC percentage',
          value: (config.getValue('fec_percentage') as int? ?? 20).toDouble(),
          min: 1,
          max: 100,
          divisions: 99,
          suffix: '%',
          helperText: 'Forward Error Correction. Higher = more resilient, more bandwidth.',
          onChanged: (v) => notifier.setField('fec_percentage', v.round()),
        ),
        const SizedBox(height: AppSpacing.lg),
        ConfigDropdownField(
          label: 'Video max batch size',
          value: '${config.getValue('video_max_batch_size_kb') ?? 64}',
          options: const ['16', '32', '64'],
          labels: const ['16 KB (low latency)', '32 KB (balanced)', '64 KB (throughput)'],
          helperText: 'Larger batches improve throughput but add latency.',
          onChanged: (v) => notifier.setField('video_max_batch_size_kb', int.tryParse(v) ?? 64),
        ),
        const SizedBox(height: AppSpacing.xl),

        // ─── Timeouts ───────────────────────────────────────────────────
        const ConfigSectionTitle(
          title: 'Timeouts',
        ),
        const SizedBox(height: AppSpacing.md),
        ConfigNumberField(
          label: 'Ping timeout',
          value: (config.getValue('ping_timeout') as int?) ?? 10000,
          helperText: 'Milliseconds before stream is terminated on no response. -1 = disabled.',
          min: -1,
          max: 120000,
          suffix: 'ms',
          onChanged: (v) => notifier.setField('ping_timeout', v),
        ),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }

  static bool _parseBool(dynamic value, bool fallback) {
    if (value is bool) return value;
    if (value is String) return value == 'enabled' || value == 'true' || value == '1';
    if (value is int) return value != 0;
    return fallback;
  }
}
