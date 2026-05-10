import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:jujo_stream_app/core/api/services/game_sources_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/theme/color_extensions.dart';
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
    final serverConfigured =
        authState.serverUrl != null && authState.serverUrl!.isNotEmpty;
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
                loading: () => const _SourcesSkeletonGrid(),
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

  /// Max width per card — prevents cards from stretching on wide screens.
  /// Based on UX best practices for integration/connection cards:
  /// - Steam/Epic/Xbox use ~300-360px card widths
  /// - Cards should be scannable at a glance without excessive horizontal eye movement
  /// - Maintains consistent visual density regardless of viewport width
  static const double _cardMaxWidth = 340.0;
  static const double _cardMinWidth = 280.0;

  Widget _buildGrid(
    BuildContext context,
    WidgetRef ref,
    List<GameSourceDto> sources,
  ) {
    // Use fallback sources if server returns empty
    final displaySources = sources.isNotEmpty ? sources : _fallbackSources;

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate how many cards fit at their ideal width
        final availableWidth = constraints.maxWidth;
        final crossCount = (availableWidth / (_cardMaxWidth + AppSpacing.base))
            .floor()
            .clamp(1, 3);

        // Calculate actual card width: use ideal max, but allow shrinking
        // down to min on smaller screens. Never exceed max.
        final totalGaps = AppSpacing.base * (crossCount - 1);
        final calculatedWidth = (availableWidth - totalGaps) / crossCount;
        final cardWidth = calculatedWidth.clamp(_cardMinWidth, _cardMaxWidth);

        return Wrap(
          spacing: AppSpacing.base,
          runSpacing: AppSpacing.base,
          children: displaySources.map((source) {
            return SizedBox(
              width: cardWidth,
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

class _SourcesSkeletonGrid extends StatelessWidget {
  const _SourcesSkeletonGrid();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final crossCount = (availableWidth / (340 + AppSpacing.base))
            .floor()
            .clamp(1, 3);
        final totalGaps = AppSpacing.base * (crossCount - 1);
        final cardWidth = ((availableWidth - totalGaps) / crossCount).clamp(
          280.0,
          340.0,
        );
        return Wrap(
          spacing: AppSpacing.base,
          runSpacing: AppSpacing.base,
          children: List.generate(
            5,
            (_) => SizedBox(
              width: cardWidth,
              child: _SkeletonSourceCard(colorScheme: colorScheme),
            ),
          ),
        );
      },
    );
  }
}

class _SkeletonSourceCard extends StatelessWidget {
  const _SkeletonSourceCard({required this.colorScheme});

  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    final base = colorScheme.surfaceContainerHighest.withValues(alpha: 0.62);
    final soft = colorScheme.surfaceContainerHighest.withValues(alpha: 0.34);
    return Container(
      height: 336,
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(height: 118, color: soft),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: _SkeletonBar(width: 140, color: base)),
                    _SkeletonBar(width: 86, height: 24, color: soft),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                _SkeletonBar(width: double.infinity, color: soft),
                const SizedBox(height: AppSpacing.xs),
                _SkeletonBar(width: 220, color: soft),
                const SizedBox(height: AppSpacing.lg),
                Row(
                  children: [
                    _SkeletonBar(width: 76, height: 32, color: base),
                    const SizedBox(width: AppSpacing.sm),
                    _SkeletonBar(width: 86, height: 32, color: base),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                _SkeletonBar(width: double.infinity, height: 44, color: soft),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonBar extends StatelessWidget {
  const _SkeletonBar({
    required this.width,
    required this.color,
    this.height = 14,
  });

  final double width;
  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'GAME SOURCES',
          style: theme.textTheme.labelSmall?.copyWith(
            color: cs.accentSources,
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
        border: Border.all(color: colorScheme.error.withValues(alpha: 0.3)),
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
                    backgroundColor: colorScheme.error.withValues(alpha: 0.12),
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

  /// Set to true while waiting for the user to complete Steam login in browser.
  bool _awaitingAuth = false;
  bool _authCancelled = false;

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

                // Waiting for OAuth in external browser
                if (_awaitingAuth) ...[
                  _SteamAuthWaitBanner(
                    onCancel: () {
                      setState(() {
                        _awaitingAuth = false;
                        _authCancelled = true;
                        _loading = false;
                      });
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],

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
    setState(() {
      _loading = true;
      _authCancelled = false;
    });
    try {
      final api = ref.read(gameSourcesApiProvider);

      // Steam uses OpenID → start auth, open URL, then poll for completion.
      if (widget.source.id == 'steam') {
        final result = await api.steamAuthStart();
        if (!mounted) return;

        if (result.authUrl != null) {
          final uri = Uri.tryParse(result.authUrl!);
          if (uri != null && await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
          setState(() => _awaitingAuth = true);
          await _pollForSteamAuth();
          return; // _pollForSteamAuth manages remaining state
        }
        // No authUrl → server might already have auth; just sync.
        if (result.success) await _sync();
        return;
      }

      // Non-Steam generic connect
      var result = await ref
          .read(gameSourcesProvider.notifier)
          .connect(widget.source.id);
      if (!mounted) return;

      if (result.authUrl != null) {
        final uri = Uri.tryParse(result.authUrl!);
        if (uri != null && await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
        if (widget.source.id == 'gog') {
          setState(() => _awaitingAuth = true);
          await _pollForSourceAuth('gog');
          return;
        }
        if (widget.source.id == 'epic') {
          final code = await _showEpicAuthorizationCodeDialog();
          if (code != null && code.trim().isNotEmpty) {
            result = await ref
                .read(gameSourcesProvider.notifier)
                .connect('epic', payload: {'authorizationCode': code.trim()});
          }
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message ?? '${widget.source.name} connected.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        if (result.success) await _sync();
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _awaitingAuth = false;
        });
      }
    }
  }

  Future<String?> _showEpicAuthorizationCodeDialog() async {
    final controller = TextEditingController();
    try {
      return showDialog<String>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Epic authorization code'),
          content: TextField(
            controller: controller,
            autofocus: true,
            minLines: 1,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'authorizationCode',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(controller.text),
              child: const Text('Connect'),
            ),
          ],
        ),
      );
    } finally {
      controller.dispose();
    }
  }

  Future<void> _pollForSourceAuth(String sourceId) async {
    const pollInterval = Duration(seconds: 2);
    const maxWait = Duration(seconds: 120);
    final deadline = DateTime.now().add(maxWait);

    while (mounted && !_authCancelled) {
      await Future<void>.delayed(pollInterval);
      if (!mounted || _authCancelled) break;

      await ref.read(gameSourcesProvider.notifier).silentRefresh();
      final sources = ref.read(gameSourcesProvider).valueOrNull ?? [];
      final source = sources.where((s) => s.id == sourceId).firstOrNull;

      if (source != null && source.connected) {
        if (mounted) {
          setState(() => _awaitingAuth = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${source.name} connected. Syncing library...'),
              behavior: SnackBarBehavior.floating,
            ),
          );
          await _sync();
        }
        return;
      }

      if (DateTime.now().isAfter(deadline)) {
        if (mounted) {
          setState(() {
            _awaitingAuth = false;
            _loading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                '${widget.source.name} login timed out. Complete login in browser and press Sync.',
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }
    }

    if (mounted) setState(() => _loading = false);
  }

  /// Polls `/api/game-sources` every 2 s until the Steam source becomes
  /// connected or the user cancels. Max wait: 120 s.
  Future<void> _pollForSteamAuth() async {
    const pollInterval = Duration(seconds: 2);
    const maxWait = Duration(seconds: 120);
    final deadline = DateTime.now().add(maxWait);

    while (mounted && !_authCancelled) {
      await Future<void>.delayed(pollInterval);
      if (!mounted || _authCancelled) break;

      // Silent refresh — keeps widget tree alive so _awaitingAuth persists.
      await ref.read(gameSourcesProvider.notifier).silentRefresh();
      final sources = ref.read(gameSourcesProvider).valueOrNull ?? [];
      final steam = sources.where((s) => s.id == 'steam').firstOrNull;

      if (steam != null && steam.connected) {
        if (mounted) {
          setState(() => _awaitingAuth = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Steam connected! Syncing library…'),
              behavior: SnackBarBehavior.floating,
            ),
          );
          await _sync();
        }
        return;
      }

      if (DateTime.now().isAfter(deadline)) {
        if (mounted) {
          setState(() {
            _awaitingAuth = false;
            _loading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Steam login timed out. Complete the login in your browser and press Sync.',
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }
    }

    if (mounted) setState(() => _loading = false);
  }

  static const _syncStepDefs = [
    _SyncStep(id: 'connect', label: 'Verifying connection'),
    _SyncStep(id: 'library', label: 'Scanning owned games'),
    _SyncStep(id: 'installed', label: 'Scanning installed games'),
    _SyncStep(id: 'posters', label: 'Matching local posters'),
    _SyncStep(id: 'metadata', label: 'Resolving metadata fallback'),
  ];

  Future<void> _sync() async {
    setState(() {
      _loading = true;
      _syncResult = null;
      _syncSteps = _syncStepDefs
          .map((s) => _SyncStep(id: s.id, label: s.label))
          .toList();
    });

    void advance(String stepId, _SyncStepState stepState) {
      if (!mounted) return;
      setState(() {
        _syncSteps = _syncSteps!
            .map((s) => s.id == stepId ? s.copyWith(state: stepState) : s)
            .toList();
      });
    }

    final api = ref.read(gameSourcesApiProvider);

    try {
      // Step 1: verify connection (silent — don't flash loading on parent)
      advance('connect', _SyncStepState.active);
      await ref.read(gameSourcesProvider.notifier).silentRefresh();
      final sources = ref.read(gameSourcesProvider).valueOrNull ?? [];
      final source = sources.where((s) => s.id == widget.source.id).firstOrNull;
      if (source == null || !source.connected) {
        advance('connect', _SyncStepState.error);
        return;
      }
      advance('connect', _SyncStepState.done);

      // Step 2: Sync library — server reads local Steam manifests (VDF/ACF)
      // to detect installed games. No API key needed for public accounts.
      // The web library capture (steamWebLibrary) is only for the Vue web UI
      // which has access to Steam browser cookies — skip it in the native app.
      advance('library', _SyncStepState.active);
      GameSourceActionResult? result;
      result = await ref
          .read(gameSourcesProvider.notifier)
          .sync(widget.source.id);
      advance('library', _SyncStepState.done);

      // Step 3: installed detection is done server-side during sync
      advance('installed', _SyncStepState.active);
      await Future<void>.delayed(const Duration(milliseconds: 300));
      advance('installed', _SyncStepState.done);

      // Step 4: poster prefetch — poll until server completes or 30 s timeout
      advance('posters', _SyncStepState.active);
      if (widget.source.id == 'steam') {
        final posterDeadline = DateTime.now().add(const Duration(seconds: 30));
        while (DateTime.now().isBefore(posterDeadline)) {
          await Future<void>.delayed(const Duration(seconds: 2));
          if (!mounted) break;
          final progress = await api.getSteamPrefetchProgress();
          if (progress == null || progress.isDone) break;
        }
      }
      advance('posters', _SyncStepState.done);

      advance('metadata', _SyncStepState.active);
      await ref.read(artMetadataStatusProvider.future);
      advance('metadata', _SyncStepState.done);

      if (mounted) {
        setState(() => _syncResult = result);
        if (result.success && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result.message ??
                    '${widget.source.name} synced: '
                        '${result.ownedGameCount ?? 0} owned, '
                        '${result.installedGameCount ?? 0} installed.',
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        advance('library', _SyncStepState.error);
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
        await Future<void>.delayed(const Duration(milliseconds: 800));
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

// ─── Steam Auth Wait Banner ───────────────────────────────────────────────────

class _SteamAuthWaitBanner extends StatefulWidget {
  const _SteamAuthWaitBanner({required this.onCancel});
  final VoidCallback onCancel;

  @override
  State<_SteamAuthWaitBanner> createState() => _SteamAuthWaitBannerState();
}

class _SteamAuthWaitBannerState extends State<_SteamAuthWaitBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _dots;

  @override
  void initState() {
    super.initState();
    _dots = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();
  }

  @override
  void dispose() {
    _dots.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: colorScheme.primary,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'Waiting for Steam login in browser…',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          TextButton(
            onPressed: widget.onCancel,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: 4,
              ),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
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
