import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/diagnostics_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/diagnostics_provider.dart';
import 'package:jujo_stream_app/core/providers/server_process_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/status_chip.dart';

// ─── API + Provider ───────────────────────────────────────────────────────────

// ─── Screen ───────────────────────────────────────────────────────────────────

/// System readiness + telemetry screen.
class SystemScreen extends ConsumerWidget {
  const SystemScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverStatus = ref.watch(serverStatusProvider);
    final statusAsync = ref.watch(systemStatusProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'SYSTEM',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text('System & Readiness',
                  style: theme.textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Verify that your host is ready to stream.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xxl),

          // Show offline recovery panel when server is definitely unreachable.
          if (serverStatus.isOffline)
            _OfflinePanel(
              onRetry: () {
                ref.read(serverStatusProvider.notifier).refresh();
                ref.invalidate(systemStatusProvider);
              },
            )
          else
            statusAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => _buildMinimalOffline(context, ref),
              data: (status) =>
                  _buildChecks(context, status ?? const SystemStatusDto()),
            ),
        ],
      ),
    );
  }

  Widget _buildMinimalOffline(BuildContext context, WidgetRef ref) {
    return Center(
      child: Column(
        children: [
          const Icon(LucideIcons.serverOff, size: 32),
          const SizedBox(height: AppSpacing.md),
          const Text('Unable to fetch system status'),
          const SizedBox(height: AppSpacing.md),
          FilledButton.tonal(
            onPressed: () => ref.invalidate(systemStatusProvider),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildChecks(BuildContext context, SystemStatusDto status) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Server info card
        Container(
          padding: const EdgeInsets.all(AppSpacing.base),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.server, size: 24, color: colorScheme.primary),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Jujo.Stream Server',
                      style: theme.textTheme.titleSmall,
                    ),
                    if (status.version != null)
                      Text(
                        'v${status.version} • ${status.platform ?? ""}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    if (status.uptime != null)
                      Text(
                        'Uptime: ${status.uptime}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                  ],
                ),
              ),
              if (status.activeStreams > 0)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF22C55E).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF22C55E),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        '${status.activeStreams} streaming',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: const Color(0xFF22C55E),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        // Readiness checks
        Text('Readiness Checks', style: theme.textTheme.titleMedium),
        const SizedBox(height: AppSpacing.md),

        _ReadinessRow(
          icon: LucideIcons.cpu,
          label: 'Encoder',
          detail: status.encoder ?? 'Checking...',
          status: _mapStatus(status.encoderStatus),
        ),
        const SizedBox(height: AppSpacing.md),
        _ReadinessRow(
          icon: LucideIcons.monitor,
          label: 'Display Capture',
          detail: status.display ?? 'Checking...',
          status: _mapStatus(status.displayStatus),
        ),
        const SizedBox(height: AppSpacing.md),
        _ReadinessRow(
          icon: LucideIcons.wifi,
          label: 'Network',
          detail: status.network ?? 'Checking...',
          status: _mapStatus(status.networkStatus),
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Server management actions (only for local servers)
        _ServerManagementSection(),
      ],
    );
  }

  StatusChipState _mapStatus(String status) => switch (status) {
    'ready' || 'ok' => StatusChipState.ready,
    'warning' => StatusChipState.warning,
    'error' => StatusChipState.error,
    _ => StatusChipState.pending,
  };
}

class _ReadinessRow extends StatelessWidget {
  const _ReadinessRow({
    required this.icon,
    required this.label,
    required this.detail,
    required this.status,
  });

  final IconData icon;
  final String label;
  final String detail;
  final StatusChipState status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: colorScheme.onSurfaceVariant),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: theme.textTheme.bodyMedium),
                Text(
                  detail,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          StatusChip(label: _statusLabel(status), state: status),
        ],
      ),
    );
  }

  String _statusLabel(StatusChipState s) => switch (s) {
    StatusChipState.ready => 'Ready',
    StatusChipState.warning => 'Warning',
    StatusChipState.error => 'Error',
    _ => 'Pending',
  };
}

/// Shown in [SystemScreen] when the server cannot be reached.
/// Gives the user three recovery paths:
///   1. Retry connection (probe again)
///   2. Start server  (launch the process)
///   3. Install server (guide to download/install)
class _OfflinePanel extends ConsumerWidget {
  const _OfflinePanel({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final auth = ref.watch(authProvider);
    final serverUrl = auth.serverUrl ?? 'unknown';
    final processStatus = ref.watch(serverProcessProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── Status card ──────────────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: colorScheme.errorContainer.withValues(alpha: 0.25),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: colorScheme.error.withValues(alpha: 0.35),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(
                  LucideIcons.serverOff,
                  size: 24,
                  color: colorScheme.onErrorContainer,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Server unreachable',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: colorScheme.onErrorContainer,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      serverUrl,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onErrorContainer.withValues(
                          alpha: 0.7,
                        ),
                        fontFamily: 'monospace',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // ── Recovery actions ─────────────────────────────────────────────────
        Text(
          'RECOVERY OPTIONS',
          style: theme.textTheme.labelSmall?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Retry
        _ActionTile(
          icon: LucideIcons.refreshCw,
          title: 'Check again',
          subtitle: 'Re-probe the server address',
          onTap: onRetry,
        ),
        const SizedBox(height: AppSpacing.sm),

        // Start / Stop server
        if (processStatus.isRunning)
          _ActionTile(
            icon: LucideIcons.square,
            title: 'Stop server',
            subtitle: 'Shut down the Jujo.Stream backend',
            loading: processStatus.isBusy,
            onTap: () => ref.read(serverProcessProvider.notifier).stop(),
          )
        else if (!processStatus.isNotInstalled)
          _ActionTile(
            icon: LucideIcons.play,
            title: 'Start server',
            subtitle: 'Launch the Jujo.Stream backend on this machine',
            loading: processStatus.isBusy,
            onTap: () async {
              await ref.read(serverProcessProvider.notifier).start();
              onRetry();
            },
          )
        else
          _ActionTile(
            icon: LucideIcons.play,
            title: 'Start server',
            subtitle: 'Server not installed — install it first',
            onTap: null,
          ),
        const SizedBox(height: AppSpacing.sm),

        // Deploy server — navigate to the dedicated Deploy screen
        if (processStatus.isInstalling)
          _InstallProgressTile(progress: processStatus.installProgress ?? 0.0)
        else if (processStatus.isNotInstalled)
          _ActionTile(
            icon: LucideIcons.download,
            title: 'Install Jujo.Stream Server',
            subtitle: 'Set up the backend on this machine',
            onTap: () => context.go('/deploy'),
          )
        else
          _ActionTile(
            icon: LucideIcons.packageCheck,
            title: 'Server installed',
            subtitle: processStatus.installPath ?? 'Ready',
            onTap: () => context.go('/deploy'),
          ),

        if (processStatus.error != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(
            processStatus.error!,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.error,
            ),
          ),
        ],
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/// Shown instead of the install tile while the download+install is in progress.
class _InstallProgressTile extends StatelessWidget {
  const _InstallProgressTile({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final pct = (progress * 100).toStringAsFixed(0);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.4)),
        color: colorScheme.primaryContainer.withValues(alpha: 0.15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    value: progress > 0 ? progress : null,
                    color: colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      progress < 1.0
                          ? 'Downloading installer… $pct%'
                          : 'Installing…',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      'Do not close the app',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress > 0 ? progress : null,
              minHeight: 4,
              backgroundColor: colorScheme.outlineVariant,
              color: colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.loading = false,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool loading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isEnabled = onTap != null && !loading;

    return Opacity(
      opacity: isEnabled ? 1.0 : 0.5,
      child: InkWell(
        onTap: isEnabled ? onTap : null,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: loading
                    ? Padding(
                        padding: const EdgeInsets.all(10),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: colorScheme.primary,
                        ),
                      )
                    : Icon(icon, size: 20, color: colorScheme.primary),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      subtitle,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              if (isEnabled)
                Icon(
                  LucideIcons.chevronRight,
                  size: 16,
                  color: colorScheme.onSurfaceVariant,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Server Management Section ────────────────────────────────────────────────

/// Reinstall / Uninstall buttons shown on the System screen when the server
/// is running locally. Allows the user to wipe and redeploy or fully remove.
class _ServerManagementSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final processStatus = ref.watch(serverProcessProvider);
    final auth = ref.watch(authProvider);

    // Only show for local servers
    final serverUrl = auth.serverUrl ?? '';
    final isLocal = serverUrl.contains('localhost') ||
        serverUrl.contains('127.0.0.1') ||
        serverUrl.contains('::1');

    if (!isLocal || processStatus.isNotInstalled) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Server Management',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Manage the locally installed server.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Reinstall button
        _ActionTile(
          icon: LucideIcons.refreshCw,
          title: 'Reinstall Server',
          subtitle: 'Stop, wipe, and redeploy the server (clean install)',
          loading: processStatus.isInstalling,
          onTap: processStatus.isBusy
              ? null
              : () => _confirmReinstall(context, ref),
        ),
        const SizedBox(height: AppSpacing.sm),

        // Uninstall button
        _ActionTile(
          icon: LucideIcons.trash2,
          title: 'Uninstall Server',
          subtitle: 'Stop the server and remove all files from this machine',
          loading: processStatus.isBusy,
          onTap: processStatus.isBusy
              ? null
              : () => _confirmUninstall(context, ref),
        ),
      ],
    );
  }

  Future<void> _confirmReinstall(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reinstall Server?'),
        content: const Text(
          'This will stop the running server, delete all server files '
          '(config, paired clients, apps), and redeploy from scratch.\n\n'
          'All paired devices will need to re-pair after reinstall.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Reinstall'),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      context.go('/deploy');
      // Small delay to let navigation complete before triggering deploy
      await Future<void>.delayed(const Duration(milliseconds: 300));
      ref.read(serverProcessProvider.notifier).deploy(cleanInstall: true);
    }
  }

  Future<void> _confirmUninstall(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Uninstall Server?'),
        content: const Text(
          'This will stop the server, remove the Windows Service, and delete '
          'all server files from this machine.\n\n'
          'This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Uninstall'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(serverProcessProvider.notifier).uninstall();
    }
  }
}
