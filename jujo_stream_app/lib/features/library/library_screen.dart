import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:jujo_stream_app/core/api/services/game_sources_api.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/api/services/local_art_api.dart';
import 'package:jujo_stream_app/core/providers/app_launch_provider.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/providers/library_selection_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/library/game_detail_sheet.dart';
import 'package:jujo_stream_app/features/library/add_game_sheet.dart';
import 'package:jujo_stream_app/features/library/igdb_search_dialog.dart';
import 'package:jujo_stream_app/shared/widgets/atoms/source_badge.dart';
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
    final selection = ref.watch(librarySelectionProvider);

    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Selection toolbar (replaces normal toolbar when active)
            if (selection.active)
              _SelectionToolbar(
                count: selection.count,
                allGames: libraryAsync.valueOrNull ?? [],
              )
            else
              // Normal toolbar
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
                  onSourceFilterChanged: (s) =>
                      setState(() => _sourceFilter = s),
                  onSortChanged: (s) => setState(() => _sort = s),
                  onAutoScan: () => _openAutoScan(forceApply: false),
                  onForceAutoScan: () => _openAutoScan(forceApply: true),
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
        // FAB — hidden during selection mode
        if (!selection.active)
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

  Future<void> _openAutoScan({required bool forceApply}) async {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _AutoScanDialog(forceApply: forceApply),
    );
    if (mounted) {
      ref.invalidate(libraryProvider);
    }
  }

  List<GameDto> _applySort(List<GameDto> games) {
    final sorted = List<GameDto>.from(games);
    switch (_sort) {
      case LibrarySort.nameAsc:
        sorted.sort(
          (a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()),
        );
      case LibrarySort.nameDesc:
        sorted.sort(
          (a, b) => b.name.toLowerCase().compareTo(a.name.toLowerCase()),
        );
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
    required this.onAutoScan,
    required this.onForceAutoScan,
    required this.totalGames,
  });

  final String searchQuery;
  final String? sourceFilter;
  final LibrarySort sort;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String?> onSourceFilterChanged;
  final ValueChanged<LibrarySort> onSortChanged;
  final VoidCallback onAutoScan;
  final VoidCallback onForceAutoScan;
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
            IconButton.filledTonal(
              icon: const Icon(LucideIcons.sparkles, size: 18),
              tooltip: 'Auto-scan missing posters',
              onPressed: onAutoScan,
            ),
            const SizedBox(width: AppSpacing.xs),
            IconButton.filledTonal(
              icon: const Icon(LucideIcons.wand2, size: 18),
              tooltip: 'Force best poster for missing games',
              onPressed: onForceAutoScan,
            ),
            const SizedBox(width: AppSpacing.xs),
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
                _sortItem(
                  LibrarySort.nameAsc,
                  'Name (A–Z)',
                  LucideIcons.arrowUp,
                ),
                _sortItem(
                  LibrarySort.nameDesc,
                  'Name (Z–A)',
                  LucideIcons.arrowDown,
                ),
                _sortItem(LibrarySort.sourceAsc, 'Source', LucideIcons.layers),
                _sortItem(
                  LibrarySort.recentlyAdded,
                  'Recently Added',
                  LucideIcons.clock,
                ),
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
              _buildChip(
                context,
                label: 'Steam',
                value: 'steam',
                icon: LucideIcons.flame,
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(
                context,
                label: 'Epic',
                value: 'epic',
                icon: LucideIcons.mountain,
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(
                context,
                label: 'GOG',
                value: 'gog',
                icon: LucideIcons.globe,
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(
                context,
                label: 'Xbox',
                value: 'xbox',
                icon: LucideIcons.gamepad2,
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChip(
                context,
                label: 'Manual',
                value: 'manual',
                icon: LucideIcons.pencil,
              ),
            ],
          ),
        ),
      ],
    );
  }

  PopupMenuEntry<LibrarySort> _sortItem(
    LibrarySort value,
    String label,
    IconData icon,
  ) {
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
        AppSpacing.xl,
        0,
        AppSpacing.xl,
        AppSpacing.sm,
      ),
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

// ─── Selection Toolbar ───────────────────────────────────────────────────────

class _AutoScanDialog extends ConsumerStatefulWidget {
  const _AutoScanDialog({required this.forceApply});

  final bool forceApply;

  @override
  ConsumerState<_AutoScanDialog> createState() => _AutoScanDialogState();
}

class _AutoScanDialogState extends ConsumerState<_AutoScanDialog> {
  ArtAutoScanStatus? _status;
  final Map<String, ArtCandidate> _selected = {};
  bool _applying = false;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    final api = ref.read(localArtApiProvider);
    final initial = await api.startAutoScan(
      missingOnly: true,
      forceApply: widget.forceApply,
    );
    if (!mounted) return;
    setState(() => _status = initial);
    await _poll();
  }

  Future<void> _poll() async {
    final api = ref.read(localArtApiProvider);
    while (mounted && (_status?.running ?? true)) {
      await Future<void>.delayed(const Duration(seconds: 2));
      final next = await api.getAutoScanStatus();
      if (!mounted) return;
      setState(() {
        _status = next;
        for (final game in next.results) {
          _selected.putIfAbsent(_key(game), () => game.candidates.first);
        }
      });
    }
  }

  String _key(ArtAutoScanGameResult game) => game.uuid ?? 'index:${game.index}';

  Future<void> _apply() async {
    final status = _status;
    if (status == null) return;
    setState(() => _applying = true);
    final api = ref.read(localArtApiProvider);
    int applied = 0;
    for (final game in status.results) {
      final candidate = _selected[_key(game)];
      if (candidate == null) continue;
      if (await api.applyArtCandidate(game: game, candidate: candidate)) {
        applied++;
      }
    }
    ref.invalidate(libraryProvider);
    if (!mounted) return;
    setState(() => _applying = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Applied artwork for $applied game${applied == 1 ? '' : 's'}',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final status = _status;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final running = status?.running ?? true;
    final results = status?.results ?? const <ArtAutoScanGameResult>[];

    return AlertDialog(
      title: Row(
        children: [
          const Icon(LucideIcons.sparkles, size: 20),
          const SizedBox(width: AppSpacing.sm),
          Text(widget.forceApply ? 'Force artwork scan' : 'Auto-scan artwork'),
          const Spacer(),
          if (!running)
            Text(
              '${results.length} match${results.length == 1 ? '' : 'es'}',
              style: theme.textTheme.labelMedium?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
        ],
      ),
      content: SizedBox(
        width: 760,
        height: 560,
        child: running
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(value: status?.progress),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    status == null
                        ? 'Starting scan...'
                        : 'Scanning ${status.scannedGameCount}/${status.targetGameCount} games',
                    style: theme.textTheme.bodyMedium,
                  ),
                ],
              )
            : results.isEmpty
            ? EmptyState(
                icon: LucideIcons.imageOff,
                title: 'No candidates found',
                description:
                    'Configured sources did not find new posters for missing games.',
              )
            : ListView.separated(
                itemCount: results.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppSpacing.lg),
                itemBuilder: (context, index) {
                  final game = results[index];
                  return _AutoScanGamePicker(
                    game: game,
                    selected: _selected[_key(game)] ?? game.candidates.first,
                    onSelected: (candidate) =>
                        setState(() => _selected[_key(game)] = candidate),
                  );
                },
              ),
      ),
      actions: [
        TextButton(
          onPressed: _applying ? null : () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
        FilledButton.icon(
          onPressed: !running && results.isNotEmpty && !_applying
              ? _apply
              : null,
          icon: _applying
              ? const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(LucideIcons.check, size: 16),
          label: const Text('Apply selected'),
        ),
      ],
    );
  }
}

class _AutoScanGamePicker extends StatelessWidget {
  const _AutoScanGamePicker({
    required this.game,
    required this.selected,
    required this.onSelected,
  });

  final ArtAutoScanGameResult game;
  final ArtCandidate selected;
  final ValueChanged<ArtCandidate> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                game.name,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            SourceBadge(source: game.source, size: SourceBadgeSize.small),
            const SizedBox(width: AppSpacing.sm),
            Text(
              '${game.candidates.length} covers',
              style: theme.textTheme.labelMedium?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          height: 190,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: game.candidates.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) {
              final candidate = game.candidates[index];
              final isSelected = candidate.imageUrl == selected.imageUrl;
              return InkWell(
                onTap: () => onSelected(candidate),
                borderRadius: BorderRadius.circular(AppRadius.md),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  width: 124,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(
                      color: isSelected ? cs.primary : cs.outlineVariant,
                      width: isSelected ? 2 : 1,
                    ),
                    color: cs.surfaceContainerHighest,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      Expanded(
                        child: _LibraryPosterImage(
                          imageUrl: candidate.imageUrl,
                          fallback: const Center(
                            child: Icon(LucideIcons.imageOff, size: 20),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(AppSpacing.xs),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              candidate.source,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.labelSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              '${candidate.confidence}% match',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _LibraryPosterImage extends ConsumerWidget {
  const _LibraryPosterImage({required this.imageUrl, required this.fallback});

  final String imageUrl;
  final Widget fallback;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';
    if (_isLocalFilePath(imageUrl)) {
      return Image.file(
        File(_filePathFromImageUrl(imageUrl)),
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (_, __, ___) => fallback,
      );
    }
    final base = serverUrl.endsWith('/')
        ? serverUrl.substring(0, serverUrl.length - 1)
        : serverUrl;
    final isServerImage =
        imageUrl.startsWith('/') ||
        (base.isNotEmpty && imageUrl.startsWith(base));
    if (!isServerImage) {
      return CachedNetworkImage(
        imageUrl: imageUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        memCacheWidth: 210,
        fadeInDuration: const Duration(milliseconds: 150),
        placeholder: (_, __) => const SizedBox.expand(),
        errorWidget: (_, __, ___) => fallback,
      );
    }

    final path = imageUrl.startsWith(base)
        ? imageUrl.substring(base.length)
        : imageUrl;
    final bytes = ref.watch(serverImageBytesProvider(path));
    return bytes.when(
      data: (data) => Image.memory(
        data,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        gaplessPlayback: true,
      ),
      loading: () => const SizedBox.expand(),
      error: (_, __) => fallback,
    );
  }

  bool _isLocalFilePath(String value) {
    return value.startsWith('file://') ||
        RegExp(r'^[a-zA-Z]:[\\/]').hasMatch(value) ||
        value.startsWith(r'\\');
  }

  String _filePathFromImageUrl(String value) {
    if (!value.startsWith('file://')) return value;
    return Uri.parse(value).toFilePath(windows: Platform.isWindows);
  }
}

/// Toolbar shown during multi-select mode with count + batch actions.
class _SelectionToolbar extends ConsumerWidget {
  const _SelectionToolbar({required this.count, required this.allGames});

  final int count;
  final List<GameDto> allGames;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer.withValues(alpha: 0.15),
        border: Border(bottom: BorderSide(color: colorScheme.outlineVariant)),
      ),
      child: Row(
        children: [
          // Close button
          IconButton(
            icon: const Icon(LucideIcons.x, size: 20),
            onPressed: () =>
                ref.read(librarySelectionProvider.notifier).clear(),
            tooltip: 'Cancel selection',
          ),
          const SizedBox(width: AppSpacing.sm),
          // Count
          Text(
            '$count selected',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          // Select all
          TextButton.icon(
            onPressed: () {
              final indices = allGames
                  .where((g) => g.index != null)
                  .map((g) => g.index!)
                  .toList();
              ref.read(librarySelectionProvider.notifier).selectAll(indices);
            },
            icon: const Icon(LucideIcons.checkSquare, size: 16),
            label: const Text('All'),
          ),
          const SizedBox(width: AppSpacing.sm),
          // Delete button
          FilledButton.icon(
            onPressed: count > 0 ? () => _confirmDelete(context, ref) : null,
            icon: const Icon(LucideIcons.trash2, size: 16),
            label: Text('Remove ($count)'),
            style: FilledButton.styleFrom(
              backgroundColor: colorScheme.error,
              foregroundColor: colorScheme.onError,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final selection = ref.read(librarySelectionProvider);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove games?'),
        content: Text(
          'Remove ${selection.count} game${selection.count != 1 ? 's' : ''} '
          'from the server library? This cannot be undone.',
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
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final indices = selection.selectedIndices.toList();
    final deleted = await ref
        .read(libraryProvider.notifier)
        .deleteGames(indices);
    ref.read(librarySelectionProvider.notifier).clear();

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Removed $deleted game${deleted != 1 ? 's' : ''}'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}

// ─── Game Tile ───────────────────────────────────────────────────────────────

/// Game poster tile with hover effect, source indicator, and multi-select support.
/// Long-press enters selection mode; tap toggles selection when active.
class _GameTile extends ConsumerWidget {
  const _GameTile({required this.game});

  final GameDto game;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';
    final imageUrl = game.resolveImageUrl(serverUrl);
    final selection = ref.watch(librarySelectionProvider);
    final isSelected = game.index != null && selection.isSelected(game.index!);
    final isSelecting = selection.active;

    return Semantics(
      label: game.name,
      button: true,
      child: InkWell(
        onTap: () {
          if (isSelecting && game.index != null) {
            ref.read(librarySelectionProvider.notifier).toggle(game.index!);
          } else {
            GameDetailSheet.show(context, game);
          }
        },
        onLongPress: () {
          if (!isSelecting && game.index != null) {
            ref
                .read(librarySelectionProvider.notifier)
                .enterSelection(game.index!);
          }
        },
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
            border: Border.all(
              color: isSelected
                  ? colorScheme.primary
                  : colorScheme.outlineVariant,
              width: isSelected ? 2 : 1,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (imageUrl != null)
                      _LibraryPosterImage(
                        imageUrl: imageUrl,
                        fallback: _posterPlaceholder(context, game.source),
                      )
                    else
                      Container(
                        color: colorScheme.surfaceContainerHighest,
                        child: _posterPlaceholder(context, game.source),
                      ),
                    // Selection checkbox overlay (top-left)
                    if (isSelecting)
                      Positioned(
                        top: 4,
                        left: 4,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? colorScheme.primary
                                : colorScheme.surface.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(AppRadius.xs),
                            border: Border.all(
                              color: isSelected
                                  ? colorScheme.primary
                                  : colorScheme.outlineVariant,
                            ),
                          ),
                          child: isSelected
                              ? const Icon(
                                  LucideIcons.check,
                                  size: 14,
                                  color: Colors.white,
                                )
                              : null,
                        ),
                      ),
                    // Source badge overlay (top-right) — hide during selection
                    if (!isSelecting && game.source != null)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: SourceBadge(
                          source: game.source!,
                          size: SourceBadgeSize.small,
                        ),
                      ),
                    // Dim overlay when selected
                    if (isSelected)
                      Container(
                        color: colorScheme.primary.withValues(alpha: 0.08),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        game.name,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: colorScheme.onSurface,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!isSelecting) _LaunchButton(game: game),
                  ],
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

/// Play button that launches a game on the server with one tap.
class _LaunchButton extends ConsumerWidget {
  const _LaunchButton({required this.game});

  final GameDto game;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLaunching = ref.watch(isLaunchingAppProvider(game.name));
    final colorScheme = Theme.of(context).colorScheme;

    return SizedBox(
      width: 24,
      height: 24,
      child: IconButton(
        onPressed: isLaunching ? null : () => _launch(context, ref),
        icon: isLaunching
            ? SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                  strokeWidth: 1.5,
                  color: colorScheme.primary,
                ),
              )
            : Icon(LucideIcons.play, size: 13, color: colorScheme.primary),
        tooltip: 'Launch ${game.name}',
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
        visualDensity: VisualDensity.compact,
        style: IconButton.styleFrom(
          backgroundColor: colorScheme.primaryContainer.withValues(alpha: 0.6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
        ),
      ),
    );
  }

  Future<void> _launch(BuildContext context, WidgetRef ref) async {
    final success = await ref.read(appLaunchProvider.notifier).launchGame(game);
    if (!context.mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success ? 'Launching ${game.name}…' : 'Failed to launch ${game.name}',
        ),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
