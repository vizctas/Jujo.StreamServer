import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/config_api.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/api/services/setup_api.dart';
import 'package:jujo_stream_app/core/services/streaming_sessions_service.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/crash_dump_provider.dart';
import 'package:jujo_stream_app/core/providers/metrics_provider.dart';
import 'package:jujo_stream_app/core/providers/stream_health_provider.dart';
import 'package:jujo_stream_app/core/providers/server_process_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/providers/setup_provider.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
import 'package:jujo_stream_app/core/services/server_status_service.dart';
import 'package:jujo_stream_app/core/theme/colors.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/display_snapshot_card.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/live_logs_card.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/metrics_sparkline_card.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/system_metrics_card.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/server_status_card.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/app_badge.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/pulse_dot.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/gpu_card.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/metric_tile.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/status_chip.dart';

// ─── Providers (dashboard-local) ────────────────────────────────────────────

/// Polls activeStreams count from /api/system/status.
final _activeStreamsProvider = FutureProvider.autoDispose<int>((ref) async {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  try {
    final response = await client.get<Map<String, dynamic>>(
      '/api/system/status',
    );
    if (response.statusCode == 200 && response.data != null) {
      return response.data!['activeStreams'] as int? ?? 0;
    }
  } catch (_) {}
  return 0;
});

/// Fetches all games. UI shows only 3 shortcuts, metrics use full count.
final _dashboardGamesProvider = FutureProvider.autoDispose<List<GameDto>>((
  ref,
) async {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return LibraryApi(client: client).getGames();
});

/// Dashboard home screen.
/// Shows setup checklist when incomplete, or server status when ready.
///
/// Uses dual-provider strategy:
/// - `setupStatusProvider` for setup checklist data
/// - `serverStatusPollingProvider` as a live connection heartbeat
///
/// If setup API fails but the server is reachable via polling, the dashboard
/// still shows a connected state with the ServerStatusCard.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(setupStatusProvider);
    // Secondary signal: live polling (10s interval) from ServerStatusCard's provider
    final serverPolling = ref.watch(serverStatusPollingProvider);
    final authState = ref.watch(authProvider);

    if (authState.status == AuthStatus.unknown) {
      return const Center(child: CircularProgressIndicator());
    }

    // Auto-retry: when polling detects server came online but setup had failed,
    // invalidate setupStatusProvider to force a re-fetch.
    ref.listen(serverStatusPollingProvider, (prev, next) {
      if (prev?.valueOrNull == null &&
          next.valueOrNull != null &&
          statusAsync.hasError) {
        ref.invalidate(setupStatusProvider);
      }
    });

    return statusAsync.when(
      loading: () {
        // While setup is loading, check if polling already has data
        final polledStatus = serverPolling.valueOrNull;
        if (polledStatus != null) {
          return const _ConnectedOperationsDashboard(
            subtitle:
                'Setup status is loading. Live server panels stay available.',
          );
        }
        return const Center(child: CircularProgressIndicator());
      },
      error: (_, __) {
        // Setup API failed — but is the server actually reachable via polling?
        final polledStatus = serverPolling.valueOrNull;
        if (polledStatus != null) {
          return const _ConnectedOperationsDashboard(
            subtitle:
                'Setup status is unavailable. Live server panels stay available.',
          );
        }
        return const _NoServerDashboard();
      },
      data: (status) {
        if (status == null) {
          // Null response — check polling fallback
          final polledStatus = serverPolling.valueOrNull;
          if (polledStatus != null) {
            return const _ConnectedOperationsDashboard(
              subtitle:
                  'Setup status is unavailable. Live server panels stay available.',
            );
          }
          return const _NoServerDashboard();
        }
        if (status.setupComplete) {
          return _ReadyDashboard(status: status);
        }
        return _SetupDashboard(status: status);
      },
    );
  }
}

/// Operational dashboard shown when the server is reachable but setup status is
/// still loading or unavailable. It must not collapse to a tiny connected card:
/// metrics/logs/status panels are useful whenever a server session exists.
class _ConnectedOperationsDashboard extends ConsumerWidget {
  const _ConnectedOperationsDashboard({required this.subtitle});

  final String subtitle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(serverStatusPollingProvider).valueOrNull;
    final activeStreams =
        status?.rtspSessionCount ??
        ref.watch(_activeStreamsProvider).valueOrNull ??
        0;
    final dashboardGames =
        ref.watch(_dashboardGamesProvider).valueOrNull ?? const <GameDto>[];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader(
                overline: 'Jujo.Stream Server',
                title: 'Connected',
                subtitle: subtitle,
              ),
              const SizedBox(height: AppSpacing.xl),
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth >= 900;
                  final mainColumn = Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const ServerStatusCard(),
                      if (activeStreams > 0) ...[
                        const SizedBox(height: AppSpacing.base),
                        _StreamingNowBanner(sessionCount: activeStreams),
                      ],
                      const SizedBox(height: AppSpacing.base),
                      const MetricsSparklineCard(),
                      const SizedBox(height: AppSpacing.base),
                      const SystemMetricsCard(),
                      const SizedBox(height: AppSpacing.base),
                      const LiveLogsCard(),
                    ],
                  );

                  final sideColumn = Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _ConnectedStatsGrid(
                        pairedClients: status?.pairedClientCount ?? 0,
                        activeStreams: activeStreams,
                        featuredGames: dashboardGames.length,
                      ),
                      const SizedBox(height: AppSpacing.base),
                      const DisplaySnapshotCard(),
                      if (dashboardGames.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.base),
                        _FeaturedAppsGrid(games: dashboardGames),
                      ],
                      const SizedBox(height: AppSpacing.base),
                      _QuickLinksRow(),
                      const SizedBox(height: AppSpacing.base),
                      const _ServerActionsRow(),
                    ],
                  );

                  if (!isWide) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        mainColumn,
                        const SizedBox(height: AppSpacing.base),
                        sideColumn,
                      ],
                    );
                  }

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: mainColumn),
                      const SizedBox(width: AppSpacing.base),
                      Expanded(child: sideColumn),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConnectedStatsGrid extends StatelessWidget {
  const _ConnectedStatsGrid({
    required this.pairedClients,
    required this.activeStreams,
    required this.featuredGames,
  });

  final int pairedClients;
  final int activeStreams;
  final int featuredGames;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 520;
        final crossCount = isCompact ? 1 : 3;
        final gap = AppSpacing.sm;
        final tileWidth =
            (constraints.maxWidth - gap * (crossCount - 1)) / crossCount;

        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [
            SizedBox(
              width: tileWidth,
              child: MetricTile(
                value: '$pairedClients',
                label: 'Clients',
                icon: LucideIcons.monitor,
                accentColor: AppColors.brandSecondary,
              ),
            ),
            SizedBox(
              width: tileWidth,
              child: MetricTile(
                value: '$activeStreams',
                label: 'Streams',
                icon: LucideIcons.radio,
                accentColor: AppColors.success,
              ),
            ),
            SizedBox(
              width: tileWidth,
              child: MetricTile(
                value: '$featuredGames',
                label: 'Games',
                icon: LucideIcons.gamepad2,
                accentColor: AppColors.brandTertiary,
              ),
            ),
          ],
        );
      },
    );
  }
}

/// Dashboard when setup is complete — shows metrics + quick actions.
class _ReadyDashboard extends ConsumerWidget {
  const _ReadyDashboard({required this.status});

  final SetupStatusResponse status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeStreams = ref.watch(_activeStreamsProvider).valueOrNull ?? 0;
    final dashboardGames =
        ref.watch(_dashboardGamesProvider).valueOrNull ?? const [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              _SectionHeader(
                overline: 'Jujo.Stream Server',
                title: 'Server ready',
                subtitle:
                    'Your server has the essentials needed to start streaming.',
              ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.04),
              const SizedBox(height: AppSpacing.xl),

              // Crash dump alert banner
              const _CrashDumpBanner(),

              // Server status card — version, uptime, cloud, streaming state
              const ServerStatusCard()
                  .animate(delay: 80.ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.04),
              const SizedBox(height: AppSpacing.base),

              // Display snapshot — capture/restore monitor layout
              const DisplaySnapshotCard()
                  .animate(delay: 120.ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.04),
              const SizedBox(height: AppSpacing.base),

              // Live session banner — shown only when a stream is active
              if (activeStreams > 0) ...[
                _StreamingNowBanner(
                  sessionCount: activeStreams,
                ).animate().fadeIn(duration: 300.ms).slideY(begin: -0.05),
                const SizedBox(height: AppSpacing.base),
              ],

              // Metric tiles — staggered entry
              LayoutBuilder(
                builder: (context, constraints) {
                  final crossCount = constraints.maxWidth > 600 ? 3 : 2;
                  final gap = AppSpacing.base;
                  final tileWidth =
                      (constraints.maxWidth - gap * (crossCount - 1)) /
                      crossCount;
                  return Wrap(
                    spacing: gap,
                    runSpacing: gap,
                    children: [
                      SizedBox(
                        width: tileWidth,
                        child:
                            MetricTile(
                                  value: '${status.pairedClientCount}',
                                  label: 'Clients',
                                  icon: LucideIcons.monitor,
                                  accentColor: AppColors.brandSecondary,
                                )
                                .animate(delay: 50.ms)
                                .fadeIn(duration: 350.ms)
                                .slideY(begin: 0.08),
                      ),
                      SizedBox(
                        width: tileWidth,
                        child:
                            MetricTile(
                                  value: '${status.connectedSourceCount}',
                                  label: 'Sources',
                                  icon: LucideIcons.plug,
                                  accentColor: AppColors.warm500,
                                )
                                .animate(delay: 130.ms)
                                .fadeIn(duration: 350.ms)
                                .slideY(begin: 0.08),
                      ),
                      SizedBox(
                        width: tileWidth,
                        child:
                            MetricTile(
                                  value: '${dashboardGames.length}',
                                  label: 'Games',
                                  icon: LucideIcons.gamepad2,
                                  accentColor: AppColors.brandTertiary,
                                )
                                .animate(delay: 210.ms)
                                .fadeIn(duration: 350.ms)
                                .slideY(begin: 0.08),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: AppSpacing.base),

              // Activity sparkline — streaming session history
              const MetricsSparklineCard()
                  .animate(delay: 250.ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.04),
              const SizedBox(height: AppSpacing.base),

              // System metrics — CPU, GPU, RAM gauges + thermal
              const SystemMetricsCard()
                  .animate(delay: 280.ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.04),
              const SizedBox(height: AppSpacing.base),

              // GPU dedicated card — detailed GPU info (name, temp, VRAM, usage)
              Builder(
                builder: (context) {
                  final metrics = ref
                      .watch(systemMetricsStreamProvider)
                      .valueOrNull;
                  if (metrics == null || !metrics.gpu.available) {
                    return const SizedBox.shrink();
                  }
                  return GpuInfoCard(gpu: metrics.gpu)
                      .animate(delay: 290.ms)
                      .fadeIn(duration: 350.ms)
                      .slideY(begin: 0.04);
                },
              ),
              const SizedBox(height: AppSpacing.base),

              // Live server logs — auto-scrolling terminal
              const LiveLogsCard()
                  .animate(delay: 300.ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.04),
              const SizedBox(height: AppSpacing.xxl),

              // Ready-to-stream + readiness: 2-col on wide, stacked on narrow
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth >= 680;
                  final readySection = Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _ReadyToStreamCard(),
                      if (dashboardGames.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.base),
                        _FeaturedAppsGrid(games: dashboardGames),
                      ],
                    ],
                  );

                  if (!isWide || status.readinessChecks.isEmpty) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        readySection,
                        if (status.readinessChecks.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xl),
                          _ReadinessCard(checks: status.readinessChecks),
                        ],
                      ],
                    );
                  }
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: readySection),
                      const SizedBox(width: AppSpacing.base),
                      Expanded(
                        child: _ReadinessCard(checks: status.readinessChecks),
                      ),
                    ],
                  );
                },
              ),

              const SizedBox(height: AppSpacing.xl),
              _QuickLinksRow().animate(delay: 280.ms).fadeIn(duration: 350.ms),
              const SizedBox(height: AppSpacing.base),
              const _ServerActionsRow()
                  .animate(delay: 300.ms)
                  .fadeIn(duration: 350.ms),
            ],
          ),
        ),
      ),
    );
  }
}

/// Dashboard when setup is incomplete — shows checklist.
class _SetupDashboard extends StatelessWidget {
  const _SetupDashboard({required this.status});

  final SetupStatusResponse status;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader(
                overline: 'Jujo.Stream Server',
                title: 'Finish setup when you are ready',
                subtitle:
                    'Pair a device, connect a game library, verify the host, and start from the library.',
              ),
              const SizedBox(height: AppSpacing.xl),

              // Setup steps from server
              if (status.steps.isNotEmpty)
                ...status.steps.map(
                  (step) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: _SetupStepCard(step: step),
                  ),
                ),

              // Fallback steps if server doesn't provide them
              if (status.steps.isEmpty) ...[
                _SetupStepCard(
                  step: SetupStep(
                    id: 'pair',
                    title: 'Pair a device (optional)',
                    description:
                        'Connect a Moonlight-compatible client now, or do it later from Pairing.',
                    status: status.pairedClientCount > 0
                        ? SetupStepStatus.ready
                        : SetupStepStatus.warning,
                    path: '/pairing',
                    action: 'Open Pairing',
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _SetupStepCard(
                  step: SetupStep(
                    id: 'sources',
                    title: 'Connect a library',
                    description:
                        'Sign in to Steam, Epic, GOG, Xbox, or add games manually.',
                    status: status.connectedSourceCount > 0
                        ? SetupStepStatus.ready
                        : SetupStepStatus.pending,
                    path: '/sources',
                    action: 'Open Sources',
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _SetupStepCard(
                  step: SetupStep(
                    id: 'system',
                    title: 'Verify readiness',
                    description:
                        'Review encoder, display capture, and network checks.',
                    status: SetupStepStatus.ready,
                    path: '/system',
                    action: 'Open System',
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _SetupStepCard(
                  step: SetupStep(
                    id: 'play',
                    title: 'Start streaming',
                    description:
                        'Open the library when at least one game is playable.',
                    status: status.playableGameCount > 0
                        ? SetupStepStatus.ready
                        : SetupStepStatus.pending,
                    path: '/library',
                    action: 'Open Library',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// A single setup step card.
class _SetupStepCard extends StatelessWidget {
  const _SetupStepCard({required this.step});

  final SetupStep step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatusIcon(status: step.status),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        step.title,
                        style: theme.textTheme.titleSmall,
                      ),
                    ),
                    AppBadge(
                      label: _statusLabel(step.status),
                      variant: _statusVariant(step.status),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  step.description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                if (step.path != null && step.action != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  FilledButton.tonal(
                    onPressed: () => context.go(step.path!),
                    child: Text(step.action!),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(SetupStepStatus status) => switch (status) {
    SetupStepStatus.ready => 'Ready',
    SetupStepStatus.warning => 'Review',
    SetupStepStatus.pending => 'Not set',
  };

  AppBadgeVariant _statusVariant(SetupStepStatus status) => switch (status) {
    SetupStepStatus.ready => AppBadgeVariant.success,
    SetupStepStatus.warning => AppBadgeVariant.warning,
    SetupStepStatus.pending => AppBadgeVariant.neutral,
  };
}

/// Status icon circle.
class _StatusIcon extends StatelessWidget {
  const _StatusIcon({required this.status});

  final SetupStepStatus status;

  @override
  Widget build(BuildContext context) {
    final (color, icon) = switch (status) {
      SetupStepStatus.ready => (
        const Color(0xFF22C55E),
        LucideIcons.checkCircle,
      ),
      SetupStepStatus.warning => (
        const Color(0xFFF59E0B),
        LucideIcons.alertTriangle,
      ),
      SetupStepStatus.pending => (
        Theme.of(context).colorScheme.onSurfaceVariant,
        LucideIcons.circle,
      ),
    };

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Icon(icon, size: 20, color: color),
    );
  }
}

/// "Ready to stream" card with CTA.
class _ReadyToStreamCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ready to stream', style: theme.textTheme.titleMedium),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Launch from your playable library.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          FilledButton.icon(
            onPressed: () => context.go('/library'),
            icon: const Icon(LucideIcons.play, size: 18),
            label: const Text('Open Library'),
          ),
        ],
      ),
    );
  }
}

/// Quick navigation links row.
class _QuickLinksRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        _QuickLink(
          icon: LucideIcons.plug,
          label: 'Game Sources',
          onTap: () => context.go('/sources'),
        ),
        _QuickLink(
          icon: LucideIcons.activity,
          label: 'System',
          onTap: () => context.go('/system'),
        ),
        _QuickLink(
          icon: LucideIcons.link,
          label: 'Pairing',
          onTap: () => context.go('/pairing'),
        ),
      ],
    );
  }
}

/// Single quick link chip.
class _QuickLink extends StatelessWidget {
  const _QuickLink({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: theme.colorScheme.outlineVariant),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: theme.colorScheme.onSurfaceVariant),
            const SizedBox(width: AppSpacing.sm),
            Text(label, style: theme.textTheme.labelLarge),
          ],
        ),
      ),
    );
  }
}

/// Section header with overline + title + subtitle.
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.overline,
    required this.title,
    required this.subtitle,
  });

  final String overline;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          overline.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(title, style: theme.textTheme.headlineSmall),
        const SizedBox(height: AppSpacing.xs),
        Text(
          subtitle,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

// ─── Streaming Now Banner ─────────────────────────────────────────────────────

/// Shown at the top of the ready dashboard when at least one stream is active.
class _StreamingNowBanner extends ConsumerWidget {
  const _StreamingNowBanner({required this.sessionCount});

  final int sessionCount;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final healthScore = ref.watch(streamHealthScoreProvider);
    final bannerColor = healthScore > 70
        ? const Color(0xFF22C55E)
        : healthScore > 40
        ? const Color(0xFFF59E0B)
        : const Color(0xFFEF4444);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: bannerColor.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: bannerColor.withValues(alpha: 0.30)),
      ),
      child: Row(
        children: [
          PulseDot(color: bannerColor, size: 8),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              sessionCount == 1
                  ? 'Live — 1 active streaming session'
                  : 'Live — $sessionCount active streaming sessions',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: bannerColor,
              ),
            ),
          ),
          if (healthScore <= 70)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: Text(
                'Health: $healthScore%',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: bannerColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          TextButton(
            onPressed: () => context.go('/system'),
            style: TextButton.styleFrom(
              foregroundColor: bannerColor,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.base,
                vertical: AppSpacing.xs,
              ),
            ),
            child: const Text('View'),
          ),
        ],
      ),
    );
  }
}

// ─── Crash Dump Banner ────────────────────────────────────────────────────────

/// Dismissible warning banner shown when the server detects recent crash dumps.
class _CrashDumpBanner extends ConsumerWidget {
  const _CrashDumpBanner();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shouldShow = ref.watch(shouldShowCrashBannerProvider);
    if (!shouldShow) return const SizedBox.shrink();

    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final state = ref.watch(crashDumpProvider);
    final dumpCount = state.status?.dumps.length ?? 0;
    final process = state.status?.dumps.firstOrNull?.process ?? 'server';

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.base),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: colorScheme.errorContainer.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: colorScheme.error.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(LucideIcons.alertTriangle, size: 18, color: colorScheme.error),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Crash detected',
                    style: theme.textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: colorScheme.error,
                    ),
                  ),
                  Text(
                    '$dumpCount crash dump${dumpCount != 1 ? 's' : ''} found for $process in the last 7 days.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => ref.read(crashDumpProvider.notifier).dismiss(),
              style: TextButton.styleFrom(
                foregroundColor: colorScheme.error,
                visualDensity: VisualDensity.compact,
              ),
              child: const Text('Dismiss'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Readiness Card ───────────────────────────────────────────────────────────

class _ReadinessCard extends StatelessWidget {
  const _ReadinessCard({required this.checks});

  final List<ReadinessCheck> checks;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Readiness',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ...checks.map(
            (check) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: StatusChip(
                label: check.label,
                state: _mapStatus(check.status),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: () => context.go('/deploy'),
            icon: const Icon(LucideIcons.refreshCcw, size: 14),
            label: const Text('Reinstall server'),
            style: OutlinedButton.styleFrom(
              foregroundColor: colorScheme.onSurfaceVariant,
              side: BorderSide(color: colorScheme.outlineVariant),
              textStyle: theme.textTheme.labelMedium,
              visualDensity: VisualDensity.compact,
            ),
          ),
        ],
      ),
    );
  }

  static StatusChipState _mapStatus(SetupStepStatus s) => switch (s) {
    SetupStepStatus.ready => StatusChipState.ready,
    SetupStepStatus.warning => StatusChipState.warning,
    SetupStepStatus.pending => StatusChipState.pending,
  };
}

// ─── Featured Apps Grid ───────────────────────────────────────────────────────

class _FeaturedAppsGrid extends StatelessWidget {
  const _FeaturedAppsGrid({required this.games});

  final List<GameDto> games;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final recentGames = games.take(3).toList(growable: false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'RECENT GAMES',
          style: theme.textTheme.labelSmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        ...recentGames.map((game) => _GameShortcut(game: game)),
      ],
    );
  }
}

class _GameShortcut extends StatelessWidget {
  const _GameShortcut({required this.game});

  final GameDto game;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return InkWell(
      onTap: () => context.go('/library'),
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.sm,
          horizontal: AppSpacing.xs,
        ),
        child: Row(
          children: [
            Icon(
              LucideIcons.gamepad2,
              size: 15,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                game.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(
              LucideIcons.chevronRight,
              size: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── No Server Dashboard ──────────────────────────────────────────────────────

/// Shown when no server is reachable. Provides clear CTAs to deploy or connect.
///
/// Detects the "session expired after server reinstall" case: if a serverUrl is
/// configured but the auth token is missing/expired, shows a re-login prompt
/// instead of the misleading "No server connected" message.
class _NoServerDashboard extends ConsumerWidget {
  const _NoServerDashboard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final serverStatus = ref.watch(serverStatusProvider);
    final processState = ref.watch(serverProcessProvider).state;
    final canDeploy =
        ServerDeployService().canDeploy ||
        processState == ServerProcessState.notInstalled;

    // Detect "session expired" scenario:
    // Server URL is configured but token is null/empty (expired after reinstall).
    final hasServerUrl =
        authState.serverUrl != null && authState.serverUrl!.isNotEmpty;
    final hasValidToken =
        authState.token != null && authState.token!.isNotEmpty;
    final isSessionExpired = hasServerUrl && !hasValidToken;

    if (isSessionExpired) {
      return _SessionExpiredDashboard(serverUrl: authState.serverUrl!);
    }

    if (processState == ServerProcessState.unknown ||
        (hasServerUrl && serverStatus.isUnknown)) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader(
                overline: 'Jujo.Stream',
                title: 'No server connected',
                subtitle:
                    'Deploy a server on this machine or connect to one on your network to start streaming.',
              ),
              const SizedBox(height: AppSpacing.xxl),

              // Main action card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.xl),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest.withValues(
                    alpha: 0.3,
                  ),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: colorScheme.outlineVariant),
                ),
                child: Column(
                  children: [
                    Icon(
                      LucideIcons.serverOff,
                      size: 48,
                      color: colorScheme.onSurfaceVariant.withValues(
                        alpha: 0.6,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'Get started',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Choose how you want to set up your streaming server.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xl),

                    // Deploy button — only on Windows with valid system
                    if (canDeploy) ...[
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () => context.go('/deploy'),
                          icon: const Icon(LucideIcons.hardDrive, size: 18),
                          label: const Text('Deploy Server on This Machine'),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

                    // Connect button — always visible
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => context.go('/settings'),
                        icon: const Icon(LucideIcons.link, size: 18),
                        label: const Text('Connect to Existing Server'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Session Expired Dashboard ────────────────────────────────────────────────

/// Shown when a server URL is configured but the session token is expired/invalid.
/// This typically happens after a server reinstall wipes the token store.
class _SessionExpiredDashboard extends ConsumerWidget {
  const _SessionExpiredDashboard({required this.serverUrl});

  final String serverUrl;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final activeProfile = ref.watch(activeServerProfileProvider);
    final username = activeProfile?.username ?? authState.username ?? 'admin';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader(
                overline: 'Jujo.Stream Server',
                title: 'Session expired',
                subtitle:
                    'Your server is configured but your session token is no longer valid. '
                    'This usually happens after a server reinstall.',
              ),
              const SizedBox(height: AppSpacing.xxl),

              // Session expired action card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.xl),
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(
                    color: colorScheme.error.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      LucideIcons.keyRound,
                      size: 48,
                      color: colorScheme.error.withValues(alpha: 0.7),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'Authentication required',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Log in again to reconnect to your server at:',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      serverUrl,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurface,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'monospace',
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xl),

                    // Primary: reconnect to the configured server.
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () => _showReconnectDialog(
                          context,
                          serverUrl: serverUrl,
                          initialUsername: username,
                        ),
                        icon: const Icon(LucideIcons.logIn, size: 18),
                        label: const Text('Reconnect Server'),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Secondary: Connect to different server
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => context.go('/settings'),
                        icon: const Icon(LucideIcons.link, size: 18),
                        label: const Text('Connect to Different Server'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReconnectDialog(
    BuildContext context, {
    required String serverUrl,
    required String initialUsername,
  }) {
    showDialog<void>(
      context: context,
      builder: (_) => _ReconnectServerDialog(
        serverUrl: serverUrl,
        initialUsername: initialUsername,
      ),
    );
  }
}

class _ReconnectServerDialog extends ConsumerStatefulWidget {
  const _ReconnectServerDialog({
    required this.serverUrl,
    required this.initialUsername,
  });

  final String serverUrl;
  final String initialUsername;

  @override
  ConsumerState<_ReconnectServerDialog> createState() =>
      _ReconnectServerDialogState();
}

class _ReconnectServerDialogState
    extends ConsumerState<_ReconnectServerDialog> {
  late final TextEditingController _usernameController;
  final _passwordController = TextEditingController();
  bool _connecting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _usernameController = TextEditingController(text: widget.initialUsername);
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _connect() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    if (username.isEmpty || password.isEmpty) {
      setState(() => _error = 'Username and password are required.');
      return;
    }

    setState(() {
      _connecting = true;
      _error = null;
    });

    final token = await ref
        .read(authProvider.notifier)
        .testServerConnection(
          serverUrl: widget.serverUrl,
          username: username,
          password: password,
        );

    if (!mounted) return;
    if (token == null || token.isEmpty) {
      setState(() {
        _connecting = false;
        _error = 'Server rejected these credentials.';
      });
      return;
    }

    await ref
        .read(serverProfilesProvider.notifier)
        .upsertAndActivate(
          url: widget.serverUrl,
          username: username,
          token: token,
        );

    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Server reconnected.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AlertDialog(
      title: const Text('Reconnect server'),
      content: SizedBox(
        width: 420,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.serverUrl,
              style: theme.textTheme.bodySmall?.copyWith(
                fontFamily: 'monospace',
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            TextField(
              controller: _usernameController,
              enabled: !_connecting,
              decoration: const InputDecoration(labelText: 'Server username'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _passwordController,
              enabled: !_connecting,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Server password'),
              onSubmitted: (_) => _connecting ? null : _connect(),
            ),
            if (_error != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(
                _error!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _connecting ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          onPressed: _connecting ? null : _connect,
          icon: _connecting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(LucideIcons.link, size: 16),
          label: Text(_connecting ? 'Connecting...' : 'Reconnect'),
        ),
      ],
    );
  }
}

// ─── Server Quick Actions ─────────────────────────────────────────────────────

/// Quick-action buttons: Force Close, Disconnect All, Restart Server.
class _ServerActionsRow extends ConsumerWidget {
  const _ServerActionsRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SERVER ACTIONS',
          style: theme.textTheme.labelSmall?.copyWith(
            color: cs.onSurfaceVariant,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            _ActionChip(
              icon: LucideIcons.xCircle,
              label: 'Force Close',
              color: cs.error,
              confirmMsg: 'Force-close the running game or app on the server?',
              onConfirm: () => _forceClose(context, ref),
            ),
            _ActionChip(
              icon: LucideIcons.userX,
              label: 'Disconnect All',
              color: cs.error,
              confirmMsg: 'Disconnect all active streaming sessions?',
              onConfirm: () => _disconnectAll(context, ref),
            ),
            _ActionChip(
              icon: LucideIcons.refreshCw,
              label: 'Restart Server',
              color: cs.tertiary,
              confirmMsg: 'Restart the Jujo.Stream server process?',
              onConfirm: () => _restartServer(context, ref),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _forceClose(BuildContext context, WidgetRef ref) async {
    final authNotifier = ref.read(authProvider.notifier);
    final serverUrl = ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    try {
      await client.post('/api/apps/close');
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Force close sent.')));
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send force close.')),
        );
      }
    }
  }

  Future<void> _disconnectAll(BuildContext context, WidgetRef ref) async {
    final authNotifier = ref.read(authProvider.notifier);
    final serverUrl = ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final service = StreamingSessionsService(client: client);
    try {
      final sessions = await service.listSessions();
      for (final s in sessions) {
        await service.deleteSession(s.id);
      }
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              sessions.isEmpty
                  ? 'No active sessions.'
                  : 'Disconnected ${sessions.length} session(s).',
            ),
          ),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to disconnect sessions.')),
        );
      }
    }
  }

  Future<void> _restartServer(BuildContext context, WidgetRef ref) async {
    final authNotifier = ref.read(authProvider.notifier);
    final serverUrl = ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final api = ConfigApi(client: client);
    final ok = await api.restart();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ok ? 'Server restart initiated.' : 'Failed to restart server.',
          ),
        ),
      );
    }
  }
}

/// Outlined action chip with confirmation dialog.
class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.color,
    required this.confirmMsg,
    required this.onConfirm,
  });

  final IconData icon;
  final String label;
  final Color color;
  final String confirmMsg;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      icon: Icon(icon, size: 15, color: color),
      label: Text(label, style: TextStyle(color: color)),
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: color.withValues(alpha: 0.4)),
        visualDensity: VisualDensity.compact,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.sm,
        ),
      ),
      onPressed: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: Text(label),
            content: Text(confirmMsg),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Confirm'),
              ),
            ],
          ),
        );
        if (confirmed == true) onConfirm();
      },
    );
  }
}
