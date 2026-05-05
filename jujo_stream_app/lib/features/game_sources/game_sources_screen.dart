import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:jujo_stream_app/core/api/services/game_sources_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/app_badge.dart';

/// Game Sources screen — connect Steam, Epic, GOG, Xbox, Manual.
class GameSourcesScreen extends ConsumerWidget {
  const GameSourcesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final serverStatus = ref.watch(serverStatusProvider);
    final authState = ref.watch(authProvider);
    final sourcesAsync = ref.watch(gameSourcesProvider);

    // Determine if the server is reachable and configured
    final serverConfigured = authState.serverUrl != null &&
        authState.serverUrl!.isNotEmpty;
    final serverOnline = serverStatus.isOnline;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Header(),
              const SizedBox(height: AppSpacing.xl),

              // Show server connection required banner
              if (!serverConfigured || !serverOnline) ...[
                _ServerRequiredBanner(
                  serverConfigured: serverConfigured,
                  serverOnline: serverOnline,
                ),
                const SizedBox(height: AppSpacing.xl),
              ],

              sourcesAsync.when(
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (_, __) => _buildError(context, ref),
                data: (sources) => _buildGrid(context, ref, sources),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref) {
    return Center(
      child: Column(
        children: [
          const Icon(LucideIcons.alertTriangle, size: 32),
          const SizedBox(height: AppSpacing.md),
          const Text('Failed to load game sources'),
          const SizedBox(height: AppSpacing.md),
          FilledButton.tonal(
            onPressed: () => ref.read(gameSourcesProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid(
    BuildContext context,
    WidgetRef ref,
    List<GameSourceDto> sources,
  ) {
    // Use fallback sources if server returns empty
    final displaySources = sources.isNotEmpty ? sources : _fallbackSources;

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossCount = constraints.maxWidth > 900
            ? 3
            : constraints.maxWidth > 600
            ? 2
            : 1;
        return Wrap(
          spacing: AppSpacing.base,
          runSpacing: AppSpacing.base,
          children: displaySources.map((source) {
            final width =
                (constraints.maxWidth - AppSpacing.base * (crossCount - 1)) /
                crossCount;
            return SizedBox(
              width: width,
              child: _SourceCard(source: source),
            );
          }).toList(),
        );
      },
    );
  }

  static const _fallbackSources = [
    GameSourceDto(id: 'steam', name: 'Steam'),
    GameSourceDto(id: 'epic', name: 'Epic Games'),
    GameSourceDto(id: 'gog', name: 'GOG'),
    GameSourceDto(id: 'xbox', name: 'Xbox'),
    GameSourceDto(id: 'manual', name: 'Manual'),
  ];
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'GAME SOURCES',
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Connect your game libraries',
          style: theme.textTheme.headlineSmall,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'Sign in to your platforms so Jujo.Stream can detect installed games and keep the library current.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

/// Banner shown when the server is not configured or unreachable.
/// Guides the user to deploy/connect before attempting to link accounts.
class _ServerRequiredBanner extends StatelessWidget {
  const _ServerRequiredBanner({
    required this.serverConfigured,
    required this.serverOnline,
  });

  final bool serverConfigured;
  final bool serverOnline;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final String title;
    final String description;
    final String actionLabel;
    final String actionRoute;

    if (!serverConfigured) {
      title = 'Server not configured';
      description =
          'You need to deploy or connect to a Jujo.Stream server before '
          'linking your Steam, Epic, or other game accounts. The server '
          'manages your library and handles authentication with game platforms.';
      actionLabel = 'Deploy Server';
      actionRoute = '/deploy';
    } else {
      title = 'Server unreachable';
      description =
          'The configured server is not responding. Game source connections '
          'require an active server. Check that the server is running or '
          'start it from the System page.';
      actionLabel = 'Go to System';
      actionRoute = '/system';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colorScheme.errorContainer.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: colorScheme.error.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: colorScheme.errorContainer.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              serverConfigured ? LucideIcons.serverOff : LucideIcons.server,
              size: 22,
              color: colorScheme.error,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colorScheme.onErrorContainer,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onErrorContainer.withValues(alpha: 0.8),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton.tonal(
                  onPressed: () => context.go(actionRoute),
                  style: FilledButton.styleFrom(
                    backgroundColor:
                        colorScheme.error.withValues(alpha: 0.12),
                    foregroundColor: colorScheme.error,
                  ),
                  child: Text(actionLabel),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Individual source card.
class _SourceCard extends ConsumerStatefulWidget {
  const _SourceCard({required this.source});

  final GameSourceDto source;

  @override
  ConsumerState<_SourceCard> createState() => _SourceCardState();
}

enum _SyncStepState { pending, active, done, error }

class _SyncStep {
  const _SyncStep({
    required this.id,
    required this.label,
    this.state = _SyncStepState.pending,
  });
  final String id;
  final String label;
  final _SyncStepState state;

  _SyncStep copyWith({_SyncStepState? state}) =>
      _SyncStep(id: id, label: label, state: state ?? this.state);
}

class _SourceCardState extends ConsumerState<_SourceCard> {
  bool _loading = false;
  List<_SyncStep>? _syncSteps;
  GameSourceActionResult? _syncResult;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final source = widget.source;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner — platform image with gradient overlay
          ClipRRect(
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.lg),
            ),
            child: SizedBox(
              height: 88,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Platform image (or colour fill for manual)
                  _platformImageAsset(source.id) != null
                      ? Image.asset(
                          _platformImageAsset(source.id)!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => ColoredBox(
                            color: _sourceColor(
                              source.id,
                            ).withValues(alpha: 0.15),
                          ),
                        )
                      : ColoredBox(
                          color: _sourceColor(
                            source.id,
                          ).withValues(alpha: 0.15),
                        ),
                  // Dark gradient so text/icon stays readable
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.18),
                          Colors.black.withValues(alpha: 0.52),
                        ],
                      ),
                    ),
                  ),
                  // Source icon bottom-left
                  Positioned(
                    left: AppSpacing.md,
                    bottom: AppSpacing.sm,
                    child: Icon(
                      _sourceIcon(source.id),
                      size: 22,
                      color: Colors.white.withValues(alpha: 0.90),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        source.name,
                        style: theme.textTheme.titleSmall,
                      ),
                    ),
                    AppBadge(
                      label: source.connected ? 'Connected' : 'Not connected',
                      variant: source.connected
                          ? AppBadgeVariant.success
                          : AppBadgeVariant.neutral,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  _sourceDescription(source.id),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.md),

                // Sync progress pipeline
                if (_syncSteps != null) ...[
                  _SyncPipelineWidget(steps: _syncSteps!),
                  const SizedBox(height: AppSpacing.md),
                ],

                // Sync result counts
                if (_syncResult != null && _syncResult!.success) ...[
                  Row(
                    children: [
                      _StatChip(
                        value: '${_syncResult!.ownedGameCount ?? 0}',
                        label: 'Owned',
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      _StatChip(
                        value: '${_syncResult!.installedGameCount ?? 0}',
                        label: 'Installed',
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],

                // Stats
                if (source.connected && _syncSteps == null) ...[
                  Row(
                    children: [
                      _StatChip(
                        value: '${source.ownedGameCount}',
                        label: 'Owned',
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      _StatChip(
                        value: '${source.installedGameCount}',
                        label: 'Installed',
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],

                // Actions
                Row(
                  children: [
                    Expanded(
                      child: source.connected
                          ? OutlinedButton(
                              onPressed: _loading ? null : () => _disconnect(),
                              child: const Text('Disconnect'),
                            )
                          : FilledButton.tonal(
                              onPressed: _loading ? null : () => _connect(),
                              child: _loading
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Text('Connect'),
                            ),
                    ),
                    if (source.connected) ...[
                      const SizedBox(width: AppSpacing.sm),
                      IconButton(
                        onPressed: _loading ? null : () => _sync(),
                        icon: const Icon(LucideIcons.refreshCw, size: 18),
                        tooltip: 'Sync',
                        constraints: const BoxConstraints(
                          minWidth: 48,
                          minHeight: 48,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _connect() async {
    setState(() => _loading = true);
    try {
      final result = await ref
          .read(gameSourcesProvider.notifier)
          .connect(widget.source.id);
      if (!mounted) return;

      // Open OAuth URL in browser if returned
      if (result.authUrl != null) {
        final uri = Uri.tryParse(result.authUrl!);
        if (uri != null && await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      }

      // Show result message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message ?? '${widget.source.name} connected.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }

      // Auto-sync after successful connect
      if (result.success) {
        await _sync();
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  static const _syncStepDefs = [
    _SyncStep(id: 'connect', label: 'Verifying connection'),
    _SyncStep(id: 'fetch', label: 'Fetching owned library'),
    _SyncStep(id: 'match', label: 'Matching installed games'),
    _SyncStep(id: 'meta', label: 'Loading metadata & posters'),
  ];

  Future<void> _sync() async {
    setState(() {
      _loading = true;
      _syncResult = null;
      _syncSteps = _syncStepDefs
          .map((s) => _SyncStep(id: s.id, label: s.label))
          .toList();
    });

    void advance(String stepId, _SyncStepState state) {
      if (!mounted) return;
      setState(() {
        _syncSteps = _syncSteps!
            .map((s) => s.id == stepId ? s.copyWith(state: state) : s)
            .toList();
      });
    }

    try {
      advance('connect', _SyncStepState.active);
      await Future.delayed(const Duration(milliseconds: 300));
      advance('connect', _SyncStepState.done);

      advance('fetch', _SyncStepState.active);
      final result = await ref
          .read(gameSourcesProvider.notifier)
          .sync(widget.source.id);
      advance('fetch', _SyncStepState.done);

      advance('match', _SyncStepState.active);
      await Future.delayed(const Duration(milliseconds: 400));
      advance('match', _SyncStepState.done);

      advance('meta', _SyncStepState.active);
      await Future.delayed(const Duration(milliseconds: 250));
      advance('meta', _SyncStepState.done);

      if (mounted) {
        setState(() => _syncResult = result);
        if (result.success && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result.message ??
                    '${widget.source.name} synced: ${result.ownedGameCount ?? 0} owned, ${result.installedGameCount ?? 0} installed.',
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        advance('fetch', _SyncStepState.error);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Sync failed: $e'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
      }
    } finally {
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 800));
        setState(() {
          _loading = false;
          _syncSteps = null;
        });
      }
    }
  }

  Future<void> _disconnect() async {
    setState(() => _loading = true);
    try {
      await ref.read(gameSourcesProvider.notifier).disconnect(widget.source.id);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  /// Returns the asset path for a platform image, or null for sources
  /// that don't have a dedicated banner (e.g. manual).
  String? _platformImageAsset(String id) => switch (id) {
    'steam' => 'assets/images/platforms/steam.jpg',
    'epic' => 'assets/images/platforms/EpicGames.jpg',
    'gog' => 'assets/images/platforms/GOG.jpg',
    'xbox' => 'assets/images/platforms/xbox.jpg',
    'playnite' => 'assets/images/platforms/playnite.jpg',
    _ => null,
  };

  Color _sourceColor(String id) => switch (id) {
    'steam' => const Color(0xFF1B2838),
    'epic' => const Color(0xFF2A2A2A),
    'gog' => const Color(0xFF6441A5),
    'xbox' => const Color(0xFF107C10),
    _ => Theme.of(context).colorScheme.primary,
  };

  IconData _sourceIcon(String id) => switch (id) {
    'steam' => LucideIcons.flame,
    'epic' => LucideIcons.mountain,
    'gog' => LucideIcons.globe,
    'xbox' => LucideIcons.gamepad2,
    'manual' => LucideIcons.plus,
    _ => LucideIcons.plug,
  };

  String _sourceDescription(String id) => switch (id) {
    'steam' =>
      'Web login imports your Steam library, then local manifests mark installed titles.',
    'epic' => 'Connect Epic Games and detect installed launcher titles.',
    'gog' => 'Connect GOG/Galaxy ownership and local installs.',
    'xbox' => 'Connect Microsoft/Xbox libraries and PC Game Pass installs.',
    'manual' => 'Add a game by executable path when it is not tied to a store.',
    _ => 'Connect and sync this source.',
  };
}

class _SyncPipelineWidget extends StatelessWidget {
  const _SyncPipelineWidget({required this.steps});

  final List<_SyncStep> steps;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: steps.map((step) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(
              children: [
                _StepDot(state: step.state),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    step.label,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: _stepColor(step.state, theme),
                      fontWeight: step.state == _SyncStepState.active
                          ? FontWeight.w600
                          : null,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Color _stepColor(_SyncStepState state, ThemeData theme) => switch (state) {
    _SyncStepState.active => theme.colorScheme.primary,
    _SyncStepState.done => theme.colorScheme.onSurfaceVariant,
    _SyncStepState.error => theme.colorScheme.error,
    _SyncStepState.pending => theme.colorScheme.onSurfaceVariant.withValues(
      alpha: 0.4,
    ),
  };
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.state});

  final _SyncStepState state;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: 16,
      height: 16,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: state == _SyncStepState.done
            ? const Color(0xFF22C55E)
            : state == _SyncStepState.error
            ? theme.colorScheme.error
            : Colors.transparent,
        border: Border.all(
          color: state == _SyncStepState.done
              ? const Color(0xFF22C55E)
              : state == _SyncStepState.error
              ? theme.colorScheme.error
              : state == _SyncStepState.active
              ? theme.colorScheme.primary
              : theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4),
          width: 1.5,
        ),
      ),
      child: state == _SyncStepState.done
          ? const Icon(LucideIcons.check, size: 10, color: Colors.white)
          : state == _SyncStepState.error
          ? const Icon(LucideIcons.x, size: 10, color: Colors.white)
          : state == _SyncStepState.active
          ? Padding(
              padding: const EdgeInsets.all(2),
              child: CircularProgressIndicator(
                strokeWidth: 1.5,
                color: theme.colorScheme.primary,
              ),
            )
          : null,
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
