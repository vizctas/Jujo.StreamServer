import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/api/services/setup_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/setup_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/server_status_card.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/app_badge.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/metric_tile.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/status_chip.dart';

// ─── Providers (dashboard-local) ────────────────────────────────────────────

/// Polls activeStreams count from /api/system/status.
final _activeStreamsProvider = FutureProvider.autoDispose<int>((ref) async {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  try {
    final response =
        await client.get<Map<String, dynamic>>('/api/system/status');
    if (response.statusCode == 200 && response.data != null) {
      return response.data!['activeStreams'] as int? ?? 0;
    }
  } catch (_) {}
  return 0;
});

/// Fetches the first 4 games for the featured-apps shortcut list.
final _featuredGamesProvider =
    FutureProvider.autoDispose<List<GameDto>>((ref) async {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  final games = await LibraryApi(client: client).getGames();
  return games.take(4).toList();
});

/// Dashboard home screen.
/// Shows setup checklist when incomplete, or server status when ready.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(setupStatusProvider);

    return statusAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _buildOfflineDashboard(context),
      data: (status) {
        if (status == null) return _buildOfflineDashboard(context);
        if (status.setupComplete) {
          return _ReadyDashboard(status: status);
        }
        return _SetupDashboard(status: status);
      },
    );
  }

  Widget _buildOfflineDashboard(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.wifiOff, size: 48, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(height: AppSpacing.base),
          Text('Unable to reach server', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Check your connection and server status.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
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
    final featuredGames =
        ref.watch(_featuredGamesProvider).valueOrNull ?? const [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
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

          // Server status card — version, uptime, cloud, streaming state
          const ServerStatusCard()
              .animate(delay: 80.ms)
              .fadeIn(duration: 350.ms)
              .slideY(begin: 0.04),
          const SizedBox(height: AppSpacing.base),

          // Live session banner — shown only when a stream is active
          if (activeStreams > 0) ...[
            _StreamingNowBanner(sessionCount: activeStreams)
                .animate()
                .fadeIn(duration: 300.ms)
                .slideY(begin: -0.05),
            const SizedBox(height: AppSpacing.base),
          ],

          // Metric tiles — staggered entry
          LayoutBuilder(
            builder: (context, constraints) {
              final crossCount = constraints.maxWidth > 600 ? 3 : 2;
              final gap = AppSpacing.base;
              final tileWidth =
                  (constraints.maxWidth - gap * (crossCount - 1)) / crossCount;
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  SizedBox(
                    width: tileWidth,
                    child: MetricTile(
                      value: '${status.pairedClientCount}',
                      label: 'Clients',
                      icon: LucideIcons.monitor,
                    )
                        .animate(delay: 50.ms)
                        .fadeIn(duration: 350.ms)
                        .slideY(begin: 0.08),
                  ),
                  SizedBox(
                    width: tileWidth,
                    child: MetricTile(
                      value: '${status.connectedSourceCount}',
                      label: 'Sources',
                      icon: LucideIcons.plug,
                    )
                        .animate(delay: 130.ms)
                        .fadeIn(duration: 350.ms)
                        .slideY(begin: 0.08),
                  ),
                  SizedBox(
                    width: tileWidth,
                    child: MetricTile(
                      value: '${status.playableGameCount}',
                      label: 'Games',
                      icon: LucideIcons.gamepad2,
                    )
                        .animate(delay: 210.ms)
                        .fadeIn(duration: 350.ms)
                        .slideY(begin: 0.08),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: AppSpacing.xxl),

          // Ready-to-stream + readiness: 2-col on wide, stacked on narrow
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth >= 680;
              final readySection = Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _ReadyToStreamCard(),
                  if (featuredGames.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.base),
                    _FeaturedAppsGrid(games: featuredGames),
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
          _QuickLinksRow()
              .animate(delay: 280.ms)
              .fadeIn(duration: 350.ms),
        ],
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            overline: 'Jujo.Stream Server',
            title: 'Finish setup when you are ready',
            subtitle: 'Pair a device, connect a game library, verify the host, and start from the library.',
          ),
          const SizedBox(height: AppSpacing.xl),

          // Setup steps
          ...status.steps.map((step) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: _SetupStepCard(step: step),
          )),

          // Fallback steps if server doesn't provide them
          if (status.steps.isEmpty) ...[
            _SetupStepCard(step: SetupStep(
              id: 'pair',
              title: 'Pair a device',
              description: 'Connect a Moonlight-compatible client to this host.',
              status: status.pairedClientCount > 0 ? SetupStepStatus.ready : SetupStepStatus.pending,
              path: '/pairing',
              action: 'Open Pairing',
            )),
            const SizedBox(height: AppSpacing.md),
            _SetupStepCard(step: SetupStep(
              id: 'sources',
              title: 'Connect a library',
              description: 'Sign in to Steam, Epic, GOG, Xbox, or add games manually.',
              status: status.connectedSourceCount > 0 ? SetupStepStatus.ready : SetupStepStatus.pending,
              path: '/sources',
              action: 'Open Sources',
            )),
            const SizedBox(height: AppSpacing.md),
            _SetupStepCard(step: SetupStep(
              id: 'system',
              title: 'Verify readiness',
              description: 'Review encoder, display capture, and network checks.',
              status: SetupStepStatus.warning,
              path: '/system',
              action: 'Open System',
            )),
            const SizedBox(height: AppSpacing.md),
            _SetupStepCard(step: SetupStep(
              id: 'play',
              title: 'Start streaming',
              description: 'Open the library when at least one game is playable.',
              status: status.playableGameCount > 0 ? SetupStepStatus.ready : SetupStepStatus.pending,
              path: '/library',
              action: 'Open Library',
            )),
          ],
        ],
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
                      child: Text(step.title, style: theme.textTheme.titleSmall),
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
      SetupStepStatus.ready => (const Color(0xFF22C55E), LucideIcons.checkCircle),
      SetupStepStatus.warning => (const Color(0xFFF59E0B), LucideIcons.alertTriangle),
      SetupStepStatus.pending => (Theme.of(context).colorScheme.onSurfaceVariant, LucideIcons.circle),
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
class _StreamingNowBanner extends StatelessWidget {
  const _StreamingNowBanner({required this.sessionCount});

  final int sessionCount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const liveGreen = Color(0xFF22C55E);

    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: liveGreen.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: liveGreen.withValues(alpha: 0.30)),
      ),
      child: Row(
        children: [
          _PulsingDot(),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              sessionCount == 1
                  ? 'Live — 1 active streaming session'
                  : 'Live — $sessionCount active streaming sessions',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: liveGreen,
              ),
            ),
          ),
          TextButton(
            onPressed: () => context.go('/system'),
            style: TextButton.styleFrom(
              foregroundColor: liveGreen,
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.base, vertical: AppSpacing.xs),
            ),
            child: const Text('View'),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.35, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Opacity(
        opacity: _anim.value,
        child: Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(
            color: Color(0xFF22C55E),
            shape: BoxShape.circle,
          ),
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
            style: theme.textTheme.titleSmall
                ?.copyWith(fontWeight: FontWeight.w600),
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
        ...games.map((game) => _GameShortcut(game: game)),
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
            vertical: AppSpacing.sm, horizontal: AppSpacing.xs),
        child: Row(
          children: [
            Icon(LucideIcons.gamepad2,
                size: 15, color: colorScheme.onSurfaceVariant),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                game.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
            Icon(LucideIcons.chevronRight,
                size: 14, color: colorScheme.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}
