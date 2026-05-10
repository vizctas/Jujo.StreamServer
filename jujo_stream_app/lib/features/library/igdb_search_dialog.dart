import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/local_art_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/services/igdb_metadata_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/empty_state.dart';

/// Dialog for searching game art â€” default tab is Local (Steam librarycache),
/// secondary tab is IGDB metadata/cover search.
///
/// Returns the selected poster URL via [onPosterUrlSelected], or the selected
/// [IgdbGameResult] via the legacy [onSelected] callback.
class IgdbSearchDialog extends ConsumerStatefulWidget {
  const IgdbSearchDialog({
    super.key,
    this.initialQuery,
    this.onSelected,
    this.onPosterUrlSelected,
    this.sourceId,
    this.providerGameId,
    this.uuid,
    this.index,
    this.workingDir,
  });

  /// Pre-fill the IGDB search field.
  final String? initialQuery;

  /// Legacy callback â€” receives IGDB results. Kept for compatibility.
  final ValueChanged<IgdbGameResult>? onSelected;

  /// Unified callback for any art selection (local or IGDB cover URL).
  final ValueChanged<String>? onPosterUrlSelected;

  /// Game source, e.g. 'steam'. Used to show Local art tab.
  final String? sourceId;

  /// Provider game ID (e.g. Steam AppID). Used to fetch local art.
  final String? providerGameId;

  final String? uuid;
  final int? index;
  final String? workingDir;

  @override
  ConsumerState<IgdbSearchDialog> createState() => _IgdbSearchDialogState();
}

class _IgdbSearchDialogState extends ConsumerState<IgdbSearchDialog>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  // IGDB tab state
  late final TextEditingController _searchCtrl;
  Timer? _debounce;
  List<IgdbGameResult> _results = [];
  bool _loading = false;
  String? _error;
  bool _hasSearched = false;
  bool _webLoading = false;
  String? _webError;
  ArtAutoScanGameResult? _webResult;

  bool get _hasLocalArtSupport =>
      widget.sourceId == 'steam' &&
      widget.providerGameId != null &&
      widget.providerGameId!.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _searchCtrl = TextEditingController(text: widget.initialQuery ?? '');
    if (!_hasLocalArtSupport) {
      // No local art available â€” start on IGDB tab
      _tabController.index = 1;
    }
    if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!_hasLocalArtSupport) _doSearch();
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (value.trim().length >= 2) _doSearch();
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
          _error =
              'IGDB not configured. Set client_id and client_secret in server settings.';
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

  Future<void> _doWebSearch() async {
    final query = _searchCtrl.text.trim();
    if (query.length < 2) return;

    setState(() {
      _webLoading = true;
      _webError = null;
      _webResult = null;
    });

    try {
      final result = await ref
          .read(localArtApiProvider)
          .scanGameArt(
            uuid: widget.uuid,
            index: widget.index,
            name: query,
            source: widget.sourceId,
            providerGameId: widget.providerGameId,
            workingDir: widget.workingDir,
          );
      if (!mounted) return;
      setState(() {
        _webLoading = false;
        _webResult = result;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _webLoading = false;
        _webError = 'Web search failed: $e';
      });
    }
  }

  void _selectIgdbGame(IgdbGameResult game) {
    if (widget.onPosterUrlSelected != null && game.coverUrl != null) {
      widget.onPosterUrlSelected!(game.coverUrl!);
    } else if (widget.onSelected != null) {
      widget.onSelected!(game);
    } else {
      Navigator.of(context).pop(game);
    }
  }

  void _selectLocalArtUrl(String serverRelativeUrl) {
    if (widget.onPosterUrlSelected != null) {
      widget.onPosterUrlSelected!(serverRelativeUrl);
    } else {
      Navigator.of(context).pop(serverRelativeUrl);
    }
  }

  Future<void> _pickLocalPoster() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );
    final path = result?.files.single.path;
    if (path == null || path.isEmpty) return;
    if (!mounted) return;
    if (widget.onPosterUrlSelected != null) {
      widget.onPosterUrlSelected!(path);
    } else {
      Navigator.of(context).pop(path);
    }
  }

  void _selectArtCandidate(ArtCandidate candidate) {
    if (widget.onPosterUrlSelected != null) {
      widget.onPosterUrlSelected!(candidate.imageUrl);
    } else {
      Navigator.of(context).pop(candidate.imageUrl);
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xl,
                AppSpacing.xl,
                AppSpacing.xl,
                0,
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.image, size: 20, color: colorScheme.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Find Poster',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: _pickLocalPoster,
                    icon: const Icon(LucideIcons.folderOpen, size: 16),
                    label: const Text('Choose file'),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 18),
                    onPressed: () => Navigator.of(context).pop(),
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),

            // Tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child: TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Local'),
                  Tab(text: 'IGDB'),
                  Tab(text: 'Web'),
                ],
              ),
            ),

            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _LocalArtTab(
                    sourceId: widget.sourceId,
                    providerGameId: widget.providerGameId,
                    onArtSelected: _selectLocalArtUrl,
                  ),
                  _IgdbTab(
                    searchCtrl: _searchCtrl,
                    loading: _loading,
                    error: _error,
                    hasSearched: _hasSearched,
                    results: _results,
                    onSearchChanged: _onSearchChanged,
                    onSearch: _doSearch,
                    onClear: () => setState(() {
                      _searchCtrl.clear();
                      _results = [];
                      _hasSearched = false;
                    }),
                    onSelect: _selectIgdbGame,
                  ),
                  _WebArtTab(
                    queryCtrl: _searchCtrl,
                    loading: _webLoading,
                    error: _webError,
                    result: _webResult,
                    onSearchChanged: _onSearchChanged,
                    onSearch: _doWebSearch,
                    onSelect: _selectArtCandidate,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// â”€â”€â”€ Local Art Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class _LocalArtTab extends ConsumerWidget {
  const _LocalArtTab({
    required this.sourceId,
    required this.providerGameId,
    required this.onArtSelected,
  });

  final String? sourceId;
  final String? providerGameId;
  final ValueChanged<String> onArtSelected;

  static const _artTypeLabels = {
    'portrait': 'Portrait',
    'header': 'Header',
    'hero': 'Hero',
    'hero_blur': 'Hero Blur',
    'logo': 'Logo',
    'icon': 'Icon',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';

    // Only Steam is supported for now
    if (sourceId != 'steam' ||
        providerGameId == null ||
        providerGameId!.isEmpty) {
      return _buildUnsupportedSource(theme, colorScheme);
    }

    final artAsync = ref.watch(steamLocalArtProvider(providerGameId!));

    return artAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.alertCircle, size: 32, color: colorScheme.error),
            const SizedBox(height: AppSpacing.md),
            Text('Failed to load local art', style: theme.textTheme.bodySmall),
          ],
        ),
      ),
      data: (manifest) {
        if (!manifest.hasLocalArt) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.folderX,
                  size: 36,
                  color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'No local Steam art found\nfor App ID ${providerGameId!}',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Steam stores art in:\nSteam\\appcache\\librarycache\\${providerGameId!}',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Steam local art â€” tap to apply',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: AppSpacing.md,
                    mainAxisSpacing: AppSpacing.md,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: manifest.available.length,
                  itemBuilder: (context, index) {
                    final type = manifest.available[index];
                    final relUrl = manifest.urls[type]!;
                    final fullUrl = serverUrl.endsWith('/')
                        ? '${serverUrl.substring(0, serverUrl.length - 1)}$relUrl'
                        : '$serverUrl$relUrl';
                    final label = _artTypeLabels[type] ?? type;

                    return _LocalArtTile(
                      imageUrl: fullUrl,
                      label: label,
                      onTap: () => onArtSelected(relUrl),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildUnsupportedSource(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            LucideIcons.hardDrive,
            size: 36,
            color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Local art search is available\nfor Steam games.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Use the IGDB tab for other sources.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocalArtTile extends StatelessWidget {
  const _LocalArtTile({
    required this.imageUrl,
    required this.label,
    required this.onTap,
  });

  final String imageUrl;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Column(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: _AuthedImage(imageUrl: imageUrl),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// â”€â”€â”€ IGDB Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class _WebArtTab extends StatelessWidget {
  const _WebArtTab({
    required this.queryCtrl,
    required this.loading,
    required this.error,
    required this.result,
    required this.onSearchChanged,
    required this.onSearch,
    required this.onSelect,
  });

  final TextEditingController queryCtrl;
  final bool loading;
  final String? error;
  final ArtAutoScanGameResult? result;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSearch;
  final ValueChanged<ArtCandidate> onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final candidates = result?.candidates ?? const <ArtCandidate>[];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: queryCtrl,
                  decoration: const InputDecoration(
                    hintText: 'Search SteamGridDB, GOG, Epic, Google...',
                    prefixIcon: Icon(LucideIcons.search),
                  ),
                  onChanged: onSearchChanged,
                  onSubmitted: (_) => onSearch(),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              FilledButton.icon(
                onPressed: loading ? null : onSearch,
                icon: loading
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(LucideIcons.sparkles, size: 16),
                label: const Text('Search'),
              ),
            ],
          ),
        ),
        if (error != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Text(
              error!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.error,
              ),
            ),
          ),
        Expanded(
          child: loading
              ? const Center(child: CircularProgressIndicator())
              : candidates.isEmpty
              ? const EmptyState(
                  icon: LucideIcons.imageOff,
                  title: 'No web posters yet',
                  description:
                      'Search uses local folders, SteamGridDB when configured, GOG, Epic, and Google image scraping.',
                )
              : GridView.builder(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    0,
                    AppSpacing.lg,
                    AppSpacing.lg,
                  ),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 150,
                    mainAxisSpacing: AppSpacing.md,
                    crossAxisSpacing: AppSpacing.md,
                    childAspectRatio: 0.62,
                  ),
                  itemCount: candidates.length,
                  itemBuilder: (context, index) {
                    final candidate = candidates[index];
                    return InkWell(
                      onTap: () => onSelect(candidate),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      child: Ink(
                        decoration: BoxDecoration(
                          color: colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          border: Border.all(color: colorScheme.outlineVariant),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(AppRadius.md),
                                ),
                                child: _AuthedImage(
                                  imageUrl: candidate.imageUrl,
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
                                      color: colorScheme.onSurfaceVariant,
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

class _AuthedImage extends ConsumerWidget {
  const _AuthedImage({required this.imageUrl});

  final String imageUrl;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';
    final base = serverUrl.endsWith('/')
        ? serverUrl.substring(0, serverUrl.length - 1)
        : serverUrl;
    final isServerImage =
        imageUrl.startsWith('/') ||
        (base.isNotEmpty && imageUrl.startsWith(base));
    if (!isServerImage) {
      return Image.network(
        imageUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (_, __, ___) => Container(
          color: colorScheme.surfaceContainerHighest,
          child: Icon(
            LucideIcons.imageOff,
            size: 24,
            color: colorScheme.onSurfaceVariant,
          ),
        ),
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
        gaplessPlayback: true,
      ),
      loading: () => Container(color: colorScheme.surfaceContainerHighest),
      error: (_, __) => Container(
        color: colorScheme.surfaceContainerHighest,
        child: Icon(
          LucideIcons.imageOff,
          size: 24,
          color: colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _IgdbTab extends StatelessWidget {
  const _IgdbTab({
    required this.searchCtrl,
    required this.loading,
    required this.error,
    required this.hasSearched,
    required this.results,
    required this.onSearchChanged,
    required this.onSearch,
    required this.onClear,
    required this.onSelect,
  });

  final TextEditingController searchCtrl;
  final bool loading;
  final String? error;
  final bool hasSearched;
  final List<IgdbGameResult> results;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSearch;
  final VoidCallback onClear;
  final ValueChanged<IgdbGameResult> onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        children: [
          TextField(
            controller: searchCtrl,
            autofocus: false,
            decoration: InputDecoration(
              hintText: 'Search for a game...',
              prefixIcon: const Icon(LucideIcons.search, size: 18),
              suffixIcon: loading
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(LucideIcons.x, size: 16),
                      onPressed: onClear,
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              isDense: true,
            ),
            onChanged: onSearchChanged,
            onSubmitted: (_) => onSearch(),
          ),
          const SizedBox(height: AppSpacing.md),
          Expanded(child: _buildResults(theme, colorScheme)),
        ],
      ),
    );
  }

  Widget _buildResults(ThemeData theme, ColorScheme colorScheme) {
    if (error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.alertCircle, size: 32, color: colorScheme.error),
            const SizedBox(height: AppSpacing.md),
            Text(
              error!,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.error,
              ),
            ),
          ],
        ),
      );
    }
    if (!hasSearched) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              LucideIcons.search,
              size: 32,
              color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
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
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              LucideIcons.frown,
              size: 32,
              color: colorScheme.onSurfaceVariant,
            ),
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
      itemCount: results.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final game = results[index];
        return _IgdbResultTile(game: game, onTap: () => onSelect(game));
      },
    );
  }
}

// â”€â”€â”€ IGDB Result tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                  if (game.firstReleaseDate != null ||
                      (game.genres != null && game.genres!.isNotEmpty))
                    Text(
                      [
                        if (game.firstReleaseDate != null)
                          DateTime.fromMillisecondsSinceEpoch(
                            game.firstReleaseDate! * 1000,
                          ).year.toString(),
                        if (game.genres != null && game.genres!.isNotEmpty)
                          game.genres!.take(2).join(', '),
                      ].join(' Â· '),
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
                        color: colorScheme.onSurfaceVariant.withValues(
                          alpha: 0.7,
                        ),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
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

// â”€â”€â”€ Provider for search access â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/// Provides the IGDB service if configured, null otherwise.
final igdbSearchProvider = Provider<IgdbMetadataService?>((ref) {
  return null; // Placeholder â€” wired when server provides IGDB credentials
});
