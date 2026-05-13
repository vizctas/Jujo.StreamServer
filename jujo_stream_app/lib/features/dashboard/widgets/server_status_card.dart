import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/models/server_status.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/cloud_config_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart' show serverStatusProvider;
import 'package:jujo_stream_app/core/services/cloud_server_registration_service.dart';
import 'package:jujo_stream_app/core/services/server_connection_racer.dart';
import 'package:jujo_stream_app/core/services/server_status_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Compact server status card for the dashboard.
///
/// Displays: version, uptime, streaming state, paired clients, cloud status.
/// Consumes [serverStatusPollingProvider] — auto-refreshes every 10s.
class ServerStatusCard extends ConsumerWidget {
  const ServerStatusCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(serverStatusPollingProvider);

    return statusAsync.when(
      loading: () => _buildShell(context, child: _LoadingState()),
      error: (_, __) => _buildShell(context, child: _ErrorState()),
      data: (status) {
        if (status == null) return _buildShell(context, child: _ErrorState());
        return _buildShell(context, child: _StatusContent(status: status));
      },
    );
  }

  Widget _buildShell(BuildContext context, {required Widget child}) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: child,
    );
  }
}

class _StatusContent extends ConsumerWidget {
  const _StatusContent({required this.status});

  final ServerStatus status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final connectionType = ref.watch(activeConnectionTypeProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Header row: server name + version badge + connection badge
        Row(
          children: [
            Icon(
              LucideIcons.server,
              size: 16,
              color: colorScheme.primary,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                status.name,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (connectionType != null) ...[
              _ConnectionBadge(type: connectionType),
              const SizedBox(width: AppSpacing.sm),
            ],
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: 2,
              ),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Text(
                'v${status.version}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // Status indicators row
        Wrap(
          spacing: AppSpacing.base,
          runSpacing: AppSpacing.sm,
          children: [
            _StatusIndicator(
              icon: LucideIcons.clock,
              label: status.uptimeFormatted,
              tooltip: 'Uptime',
            ),
            _StatusIndicator(
              icon: LucideIcons.monitor,
              label: '${status.pairedClientCount}',
              tooltip: 'Paired clients',
            ),
            if (status.isStreaming)
              _StatusIndicator(
                icon: LucideIcons.radio,
                label: '${status.rtspSessionCount} stream${status.rtspSessionCount != 1 ? 's' : ''}',
                tooltip: 'Active sessions',
                color: const Color(0xFF22C55E),
              )
            else
              _StatusIndicator(
                icon: LucideIcons.pause,
                label: 'Idle',
                tooltip: 'No active streams',
              ),
            if (status.cloudConfigured)
              _StatusIndicator(
                icon: LucideIcons.cloud,
                label: 'Cloud',
                tooltip: 'Cloud sync active',
                color: colorScheme.primary,
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        const _CloudToggles(),
      ],
    );
  }
}

/// Connection quality badge — shows how the app reached the server.
///
/// - Local (LAN): green wifi icon — best latency
/// - Remote (WAN): blue globe icon — direct over internet
/// - Relay (TURN): amber shield icon — relayed, higher latency
class _ConnectionBadge extends StatelessWidget {
  const _ConnectionBadge({required this.type});

  final ConnectionType type;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final (IconData icon, Color color, String label, String tooltip) = switch (type) {
      ConnectionType.local => (
        LucideIcons.wifi,
        const Color(0xFF22C55E),
        'LAN',
        'Connected via local network — lowest latency',
      ),
      ConnectionType.remote => (
        LucideIcons.globe,
        const Color(0xFF3B82F6),
        'WAN',
        'Connected via internet — direct connection',
      ),
      ConnectionType.relay => (
        LucideIcons.shield,
        const Color(0xFFF59E0B),
        'Relay',
        'Connected via TURN relay — higher latency',
      ),
    };

    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 3),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusIndicator extends StatelessWidget {
  const _StatusIndicator({
    required this.icon,
    required this.label,
    required this.tooltip,
    this.color,
  });

  final IconData icon;
  final String label;
  final String tooltip;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveColor =
        color ?? theme.colorScheme.onSurfaceVariant;

    return Tooltip(
      message: tooltip,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: effectiveColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: effectiveColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _CloudToggles extends ConsumerStatefulWidget {
  const _CloudToggles();

  @override
  ConsumerState<_CloudToggles> createState() => _CloudTogglesState();
}

class _CloudTogglesState extends ConsumerState<_CloudToggles> {
  bool _registering = false;
  String? _registerError;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final hasCloudAccount = authState.mode == AuthMode.cloudAccount;
    final hasServer = authState.serverUrl != null && authState.serverUrl!.isNotEmpty;
    final status = ref.watch(serverStatusPollingProvider).valueOrNull;
    final cloudConfigured = status?.cloudConfigured ?? false;
    final configAsync = ref.watch(cloudConfigNotifierProvider);
    final autoTrust = configAsync.valueOrNull?.autoTrustCloudClients ?? false;

    if (!hasCloudAccount || !hasServer) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 1),
        const SizedBox(height: AppSpacing.sm),
        // Register toggle
        SwitchListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          secondary: _registering
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : Icon(LucideIcons.cloudCog, size: 20, color: cloudConfigured ? colorScheme.primary : colorScheme.onSurfaceVariant),
          title: const Text('Register in Cloud'),
          subtitle: _registerError != null
              ? Text(_registerError!, style: TextStyle(color: colorScheme.error, fontSize: 12))
              : const Text('Publish this server to your cloud account', style: TextStyle(fontSize: 12)),
          value: cloudConfigured,
          onChanged: _registering ? null : _handleRegisterToggle,
        ),
        // Auto-trust toggle
        if (cloudConfigured)
          SwitchListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            secondary: Icon(LucideIcons.cloudLightning, size: 20, color: autoTrust ? colorScheme.primary : colorScheme.onSurfaceVariant),
            title: const Text('Auto-trust cloud clients'),
            subtitle: const Text('Grant all permissions to new cloud-paired users', style: TextStyle(fontSize: 12)),
            value: autoTrust,
            onChanged: configAsync.isLoading
                ? null
                : (val) => ref.read(cloudConfigNotifierProvider.notifier).setAutoTrust(val),
          ),
      ],
    );
  }

  Future<void> _handleRegisterToggle(bool value) async {
    setState(() {
      _registering = true;
      _registerError = null;
    });

    final service = ref.read(cloudServerRegistrationServiceProvider);
    final result = value
        ? await service.registerActiveServer()
        : await service.unregisterActiveServer();

    if (!mounted) return;

    setState(() => _registering = false);

    if (result.success) {
      ref.invalidate(serverStatusPollingProvider);
      ref.read(serverStatusProvider.notifier).refresh();
    } else {
      setState(() => _registerError = result.message);
    }
  }
}

class _LoadingState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Text(
          'Connecting to server...',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _ErrorState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(
          LucideIcons.wifiOff,
          size: 16,
          color: theme.colorScheme.error,
        ),
        const SizedBox(width: AppSpacing.sm),
        Text(
          'Server unreachable',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.error,
          ),
        ),
      ],
    );
  }
}
