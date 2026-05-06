import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/services/igdb_metadata_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Dialog for searching IGDB and selecting a game to apply metadata.
///
/// Returns the selected [IgdbGameResult] or null if dismissed.
class IgdbSearchDialog extends ConsumerStatefulWidget {
  const IgdbSearchDialog({
    super.key,
    this.initialQuery,
    this.onSelected,
  });

  /// Pre-fill the search field (e.g. with the current game name).
  final String? initialQuery;

  /// Callback when a game is selected. If null, pops with the result.
  final ValueChanged<IgdbGameResult>? onSelected;

  @override
  ConsumerState<IgdbSearchDialog> createState() => _IgdbSearchDialogState();
}

class _IgdbSearchDialogState extends ConsumerState<IgdbSearchDialog> {
  late final TextEditingController _searchCtrl;
  Timer? _debounce;
  List<IgdbGameResult> _results = [];
  bool _loading = false;
  String? _error;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController(text: widget.initialQuery ?? '');
    if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
      // Auto-search on open if pre-filled
      WidgetsBinding.instance.addPostFrameCallback((_) => _doSearch());
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (value.trim().length >= 2) {
        _doSearch();
      }
    });
  }

  Future<void> _doSearch() async {
    final query = _searchCtrl.text.trim();
    if (query.length < 2) return;

    setState(() {
      _loading = true;
      _error = null;
      _hasSearched = true;
    });

    try {
      final service = ref.read(igdbSearchProvider);
      if (service == null) {
        setState(() {
          _loading = false;
          _error = 'IGDB not configured. Set client_id and client_secret in server settings.';
        });
        return;
      }

      final results = await service.searchGames(query, limit: 12);
      if (!mounted) return;
      setState(() {
        _loading = false;
        _results = results;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Search failed: $e';
      });
    }
  }

  void _selectGame(IgdbGameResult game) {
    if (widget.onSelected != null) {
      widget.onSelected!(game);
    } else {
      Navigator.of(context).pop(game);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Dialog(
      insetPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.xxxl,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560, maxHeight: 640),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Icon(LucideIcons.gamepad2, size: 20, color: colorScheme.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Search IGDB',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 18),
                    onPressed: () => Navigator.of(context).pop(),
                    tooltip: 'Close',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Find game metadata from IGDB (cover art, genres, description).',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Search field
              TextField(
                controller: _searchCtrl,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search for a game...',
                  prefixIcon: const Icon(LucideIcons.search, size: 18),
                  suffixIcon: _loading
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(LucideIcons.x, size: 16),
                              onPressed: () {
                                _searchCtrl.clear();
                                setState(() {
                                  _results = [];
                                  _hasSearched = false;
                                });
                              },
                            )
                          : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  isDense: true,
                ),
                onChanged: _onSearchChanged,
                onSubmitted: (_) => _doSearch(),
              ),
              const SizedBox(height: AppSpacing.md),

              // Results
              Expanded(
                child: _buildResults(theme, colorScheme),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResults(ThemeData theme, ColorScheme colorScheme) {
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.alertCircle, size: 32, color: colorScheme.error),
            const SizedBox(height: AppSpacing.md),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(color: colorScheme.error),
            ),
          ],
        ),
      );
    }

    if (!_hasSearched) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.search, size: 32, color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5)),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Type at least 2 characters to search',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_results.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.frown, size: 32, color: colorScheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No games found',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: _results.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final game = _results[index];
        return _IgdbResultTile(
          game: game,
          onTap: () => _selectGame(game),
        );
      },
    );
  }
}

// ─── Result tile ──────────────────────────────────────────────────────────────

class _IgdbResultTile extends StatelessWidget {
  const _IgdbResultTile({required this.game, required this.onTap});

  final IgdbGameResult game;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.sm,
          horizontal: AppSpacing.sm,
        ),
        child: Row(
          children: [
            // Cover thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              child: game.coverUrl != null
                  ? Image.network(
                      game.coverUrl!,
                      width: 40,
                      height: 54,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _PlaceholderCover(),
                    )
                  : _PlaceholderCover(),
            ),
            const SizedBox(width: AppSpacing.md),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    game.name,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (game.firstReleaseDate != null || (game.genres != null && game.genres!.isNotEmpty))
                    Text(
                      [
                        if (game.firstReleaseDate != null)
                          DateTime.fromMillisecondsSinceEpoch(
                            game.firstReleaseDate! * 1000,
                          ).year.toString(),
                        if (game.genres != null && game.genres!.isNotEmpty)
                          game.genres!.take(2).join(', '),
                      ].join(' · '),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (game.developer != null)
                    Text(
                      game.developer!,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),

            // Select indicator
            Icon(
              LucideIcons.chevronRight,
              size: 16,
              color: colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderCover extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 54,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Icon(
        LucideIcons.gamepad2,
        size: 16,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
      ),
    );
  }
}

// ─── Provider for search access ───────────────────────────────────────────────

/// Provides the IGDB service if configured, null otherwise.
/// The actual credentials come from server config (fetched at runtime).
final igdbSearchProvider = Provider<IgdbMetadataService?>((ref) {
  // Credentials are loaded from server config at runtime.
  // If not configured, return null — the UI will show a helpful message.
  // In production, these come from the server's /api/config endpoint.
  return null; // Placeholder — wired when server provides IGDB credentials
});
