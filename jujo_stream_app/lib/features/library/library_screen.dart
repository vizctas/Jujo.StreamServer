import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/library/game_detail_sheet.dart';
import 'package:jujo_stream_app/features/library/add_game_sheet.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/empty_state.dart';

/// Game library screen — poster grid with search and source filter.
class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  String _searchQuery = '';
  String? _sourceFilter;

  @override
  Widget build(BuildContext context) {
    final libraryAsync = ref.watch(libraryProvider);

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
                onSearchChanged: (q) => setState(() => _searchQuery = q),
                onSourceFilterChanged: (s) => setState(() => _sourceFilter = s),
              ),
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
        maxCrossAxisExtent: 200,
        childAspectRatio: 3 / 4,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
      ),
      itemCount: games.length,
      itemBuilder: (context, index) => _GameTile(game: games[index]),
    );
  }
}

/// Toolbar with search + source filter chips.
class _Toolbar extends StatelessWidget {
  const _Toolbar({
    required this.searchQuery,
    required this.sourceFilter,
    required this.onSearchChanged,
    required this.onSourceFilterChanged,
  });

  final String searchQuery;
  final String? sourceFilter;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String?> onSourceFilterChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Library', style: theme.textTheme.headlineSmall),
        const SizedBox(height: AppSpacing.md),
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
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _FilterChip(
                label: 'All',
                selected: sourceFilter == null,
                onSelected: () => onSourceFilterChanged(null),
              ),
              const SizedBox(width: AppSpacing.sm),
              _FilterChip(
                label: 'Steam',
                selected: sourceFilter == 'steam',
                onSelected: () => onSourceFilterChanged('steam'),
              ),
              const SizedBox(width: AppSpacing.sm),
              _FilterChip(
                label: 'Epic',
                selected: sourceFilter == 'epic',
                onSelected: () => onSourceFilterChanged('epic'),
              ),
              const SizedBox(width: AppSpacing.sm),
              _FilterChip(
                label: 'GOG',
                selected: sourceFilter == 'gog',
                onSelected: () => onSourceFilterChanged('gog'),
              ),
              const SizedBox(width: AppSpacing.sm),
              _FilterChip(
                label: 'Xbox',
                selected: sourceFilter == 'xbox',
                onSelected: () => onSourceFilterChanged('xbox'),
              ),
              const SizedBox(width: AppSpacing.sm),
              _FilterChip(
                label: 'Manual',
                selected: sourceFilter == 'manual',
                onSelected: () => onSourceFilterChanged('manual'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 48, minWidth: 48),
        child: InkWell(
          onTap: onSelected,
          borderRadius: BorderRadius.circular(AppRadius.full),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: selected
                  ? colorScheme.primary.withValues(alpha: 0.12)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.full),
              border: Border.all(
                color: selected
                    ? colorScheme.primary
                    : colorScheme.outlineVariant,
              ),
            ),
            child: Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                color: selected
                    ? colorScheme.primary
                    : colorScheme.onSurfaceVariant,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Game poster tile.
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
                child: Container(
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
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Text(
                  game.name,
                  style: theme.textTheme.labelMedium,
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
