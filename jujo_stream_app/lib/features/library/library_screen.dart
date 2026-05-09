import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/game_sources_api.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/library/game_detail_sheet.dart';
import 'package:jujo_stream_app/features/library/add_game_sheet.dart';
import 'package:jujo_stream_app/features/library/igdb_search_dialog.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/empty_state.dart';

/// Sort options for the library grid.
enum LibrarySort { nameAsc, nameDesc, sourceAsc, recentlyAdded }

/// Game library screen — poster grid with search, source filter chips, and sort.
class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  String _searchQuery = '';
  String? _sourceFilter;
  LibrarySort _sort = LibrarySort.nameAsc;

  @override
  Widget build(BuildContext context) {
    final libraryAsync = ref.watch(libraryProvider);
    final prefetchAsync = ref.watch(steamPrefetchProgressProvider);

    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Toolbar
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xl,
                AppSpacing.xl,
                AppSpacing.xl,
                AppSpacing.md,
              ),
              child: _Toolbar(
                searchQuery: _searchQuery,
                sourceFilter: _sourceFilter,
                sort: _sort,
                onSearchChanged: (q) => setState(() => _searchQuery = q),
                onSourceFilterChanged: (s) => setState(() => _sourceFilter = s),
                onSortChanged: (s) => setState(() => _sort = s),
                totalGames: libraryAsync.valueOrNull?.length ?? 0,
              ),
            ),

            // Steam poster prefetch progress bar
            prefetchAsync.maybeWhen(
              data: (p) => p.running && !p.isDone
                  ? _PrefetchProgressBar(progress: p)
                  : const SizedBox.shrink(),
              orElse: () => const SizedBox.shrink(),
            ),

            // Grid
            Expanded(
              child: libraryAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Failed to load library'),
                      const SizedBox(height: AppSpacing.md),
                      FilledButton.tonal(
                        onPressed: () =>
                            ref.read(libraryProvider.notifier).refresh(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
                data: (games) => _buildContent(context, games),
              ),
            ),
          ],
        ),
        // FAB
        Positioned(
          right: AppSpacing.xl,
          bottom: AppSpacing.xl,
          child: FloatingActionButton(
            onPressed: _openAddGameSheet,
            tooltip: 'Add game',
            child: const Icon(LucideIcons.plus),
          ),
        ),
      ],
    );
  }

  void _openAddGameSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => const AddGameSheet(),
    );
  }

  List<GameDto> _applySort(List<GameDto> games) {
    final sorted = List<GameDto>.from(games);
    switch (_sort) {
      case LibrarySort.nameAsc:
        sorted.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
      case LibrarySort.nameDesc:
        sorted.sort((a, b) => b.name.toLowerCase().compareTo(a.name.toLowerCase()));
      case LibrarySort.sourceAsc:
        sorted.sort((a, b) => (a.source ?? '').compareTo(b.source ?? ''));
      case LibrarySort.recentlyAdded:
        // Keep server order (most recent first) — no-op
        break;
    }
    return sorted;
  }

  Widget _buildContent(BuildContext context, List<GameDto> allGames) {
    // Apply filters
    var games = allGames;
    if (_sourceFilter != null) {
      games = games.where((g) => g.source == _sourceFilter).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final lower = _searchQuery.toLowerCase();
      games = games.where((g) => g.name.toLowerCase().contains(lower)).toList();
    }
    games = _applySort(games);

    if (games.isEmpty) {
      if (allGames.isEmpty) {
        return EmptyState(
          icon: LucideIcons.gamepad2,
          title: 'No games yet',
          description:
              'Connect a game library or add games manually to get started.',
          action: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              FilledButton.tonal(
                onPressed: () => context.go('/sources'),
                child: const Text('Open Sources'),
              ),
              const SizedBox(width: AppSpacing.md),
              OutlinedButton(
                onPressed: _openAddGameSheet,
                child: const Text('Add Game'),
              ),
            ],
          ),
        );
      }
      return EmptyState(
        icon: LucideIcons.search,
        title: 'No results',
        description: 'No games match your current filters.',
        actionLabel: 'Clear filters',
        onAction: () => setState(() {
          _searchQuery = '';
          _sourceFilter = null;
        }),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        0,
        AppSpacing.xl,
        AppSpacing.xl,
      ),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 210,
        childAspectRatio: 3 / 4,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
      ),
      itemCount: games.length,
      itemBuilder: (context, index) => _GameTile(game: games[index]),
    );
  }
}

/// Toolbar with search, source filter chips, sort, and game count.
class _Toolbar extends StatelessWidget {
  const _Toolbar({
    required this.searchQuery,
    required this.sourceFilter,
    required this.sort,
    required this.onSearchChanged,
    required this.onSourceFilterChanged,
    required this.onSortChanged,
    required this.totalGames,
  });

  final String searchQuery;
  final String? sourceFilter;
  final LibrarySort sort;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String?> onSourceFilterChanged;
  final ValueChanged<LibrarySort> onSortChanged;
  final int totalGames;

  void _openIgdbSearch(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => IgdbSearchDialog(
        initialQuery: searchQuery.isNotEmpty ? searchQuery : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title row with game count
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text('Library', style: theme.textTheme.headlineSmall),
            const SizedBox(width: AppSpacing.sm),
            if (totalGames > 0)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Text(
                  '$totalGames',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // Search + IGDB button + Sort
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search games...',
                  prefixIcon: const Icon(LucideIcons.search, size: 18),
                  suffixIcon: searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(LucideIcons.x, size: 16),
                          onPressed: () => onSearchChanged(''),
                          tooltip: 'Clear search',
                        )
                      : null,
                  isDense: true,
                ),
                onChanged: onSearchChanged,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            // IGDB metadata search button
            IconButton.filled(
              icon: const Icon(LucideIcons.image, size: 18),
              tooltip: 'Search IGDB for posters & metadata',
              onPressed: () => _openIgdbSearch(context),
              style: IconButton.styleFrom(
                backgroundColor: colorScheme.primaryContainer,
                foregroundColor: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
            // Sort dropdown
            PopupMenuButton<LibrarySort>(
              icon: const Icon(LucideIcons.arrowUpDown, size: 18),
              tooltip: 'Sort',
              onSelected: onSortChanged,
              itemBuilder: (_) => [
                _sortItem(LibrarySort.nameAsc, 'Name (A–Z)', LucideIcons.arrowUp),
                _sortItem(LibrarySort.nameDesc, 'Name (Z–A)', LucideIcons.arrowDown),
                _sortItem(LibrarySort.sourceAsc, 'Source', LucideIcons.layers),
                _sortItem(LibrarySort.recentlyAdded, 'Recently Added', LucideIcons.clock),
              ],
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // Source filter chips — Material ChoiceChip style
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildChip(context, label: 'All', value: null),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(context, label: 'Steam', value: 'steam', icon: LucideIcons.flame),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(context, label: 'Epic', value: 'epic', icon: LucideIcons.mountain),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(context, label: 'GOG', value: 'gog', icon: LucideIcons.globe),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(context, label: 'Xbox', value: 'xbox', icon: LucideIcons.gamepad2),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(context, label: 'Manual', value: 'manual', icon: LucideIcons.pencil),
            ],
          ),
        ),
      ],
    );
  }

  PopupMenuEntry<LibrarySort> _sortItem(
      LibrarySort value, String label, IconData icon) {
    return PopupMenuItem<LibrarySort>(
      value: value,
      child: Row(
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 8),
          Text(label),
          if (sort == value) ...[
            const Spacer(),
            const Icon(LucideIcons.check, size: 14),
          ],
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required String label,
    required String? value,
    IconData? icon,
  }) {
    final selected = sourceFilter == value;
    final cs = Theme.of(context).colorScheme;
    final labelColor = selected ? cs.onSecondaryContainer : cs.onSurfaceVariant;
    return ChoiceChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: labelColor),
            const SizedBox(width: 4),
          ],
          Text(label, style: TextStyle(color: labelColor)),
        ],
      ),
      selected: selected,
      onSelected: (_) => onSourceFilterChanged(value),
      showCheckmark: false,
      visualDensity: VisualDensity.compact,
    );
  }
}

// ─── Poster Prefetch Progress Bar ────────────────────────────────────────────

class _PrefetchProgressBar extends StatelessWidget {
  const _PrefetchProgressBar({required this.progress});
  final SteamPrefetchProgress progress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final pct = (progress.fraction * 100).toStringAsFixed(0);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.xl, 0, AppSpacing.xl, AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: colorScheme.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Loading posters… $pct% (${progress.fetched}/${progress.total})',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress.fraction,
              minHeight: 3,
              backgroundColor: colorScheme.outlineVariant,
              color: colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Game poster tile with hover effect and source indicator.
class _GameTile extends ConsumerWidget {
  const _GameTile({required this.game});

  final GameDto game;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';
    final imageUrl = game.resolveImageUrl(serverUrl);

    return Semantics(
      label: game.name,
      button: true,
      child: InkWell(
        onTap: () => GameDetailSheet.show(context, game),
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      color: colorScheme.surfaceContainerHighest,
                      child: imageUrl != null
                          ? Image.network(
                              imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  _posterPlaceholder(context, game.source),
                            )
                          : _posterPlaceholder(context, game.source),
                    ),
                    // Source badge overlay (top-right)
                    if (game.source != null)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: colorScheme.surface.withValues(alpha: 0.8),
                            borderRadius:
                                BorderRadius.circular(AppRadius.full),
                          ),
                          child: Icon(
                            _platformIcon(game.source),
                            size: 10,
                            color: _platformColor(context, game.source),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Text(
                  game.name,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: colorScheme.onSurface,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _posterPlaceholder(BuildContext context, String? source) {
    final color = _platformColor(context, source);
    return Container(
      color: color.withValues(alpha: 0.12),
      child: Center(
        child: Icon(
          _platformIcon(source),
          size: 32,
          color: color.withValues(alpha: 0.6),
        ),
      ),
    );
  }

  Color _platformColor(BuildContext context, String? source) {
    return switch (source) {
      'steam' => const Color(0xFF1B2838),
      'epic' => const Color(0xFF2A2A2A),
      'gog' => const Color(0xFF6441A5),
      'xbox' => const Color(0xFF107C10),
      _ => Theme.of(context).colorScheme.onSurfaceVariant,
    };
  }

  IconData _platformIcon(String? source) {
    return switch (source) {
      'steam' => LucideIcons.flame,
      'epic' => LucideIcons.mountain,
      'gog' => LucideIcons.globe,
      'xbox' => LucideIcons.gamepad2,
      _ => LucideIcons.gamepad2,
    };
  }
}
