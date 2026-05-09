import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/features/library/igdb_search_dialog.dart';

/// Game detail dialog — full editing capabilities matching the legacy Vue app.
///
/// Supports: command, working dir, prep commands (do/undo/elevated),
/// detached commands, elevated flag, auto-detach, exclude global prep.
class GameDetailSheet extends ConsumerStatefulWidget {
  const GameDetailSheet({super.key, required this.game});

  final GameDto game;

  /// Show the game detail as a centered Dialog.
  static Future<void> show(BuildContext context, GameDto game) {
    return showDialog<void>(
      context: context,
      builder: (_) => GameDetailSheet(game: game),
    );
  }

  @override
  ConsumerState<GameDetailSheet> createState() => _GameDetailSheetState();
}

class _GameDetailSheetState extends ConsumerState<GameDetailSheet>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late TextEditingController _cmdController;
  late TextEditingController _workingDirController;
  late bool _elevated;
  late bool _autoDetach;
  late bool _excludeGlobalPrepCmd;
  late List<_PrepCmdEntry> _prepCmds;
  late List<TextEditingController> _detachedControllers;
  bool _saving = false;
  bool _dirty = false;
  String? _pendingImagePath;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _cmdController = TextEditingController(text: widget.game.cmd ?? '');
    _workingDirController =
        TextEditingController(text: widget.game.workingDir ?? '');
    _elevated = widget.game.elevated;
    _autoDetach = widget.game.autoDetach;
    _excludeGlobalPrepCmd = widget.game.excludeGlobalPrepCmd;
    _pendingImagePath = widget.game.imagePath;
    _prepCmds = widget.game.prepCmd
        .map((p) => _PrepCmdEntry(
              doCtrl: TextEditingController(text: p.doCmd),
              undoCtrl: TextEditingController(text: p.undoCmd),
              elevated: p.elevated,
            ))
        .toList();
    _detachedControllers = widget.game.detached
        .map((d) => TextEditingController(text: d))
        .toList();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _cmdController.dispose();
    _workingDirController.dispose();
    for (final p in _prepCmds) {
      p.doCtrl.dispose();
      p.undoCtrl.dispose();
    }
    for (final c in _detachedControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _markDirty() {
    if (!_dirty) setState(() => _dirty = true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';
    // Use pending image path if poster was changed in this session
    final String? imageUrl;
    if (_pendingImagePath != null && _pendingImagePath != widget.game.imagePath) {
      imageUrl = _pendingImagePath!.startsWith('http')
          ? _pendingImagePath
          : '$serverUrl$_pendingImagePath';
    } else {
      imageUrl = widget.game.resolveImageUrl(serverUrl);
    }

    return Dialog(
      insetPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.xl,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720, maxHeight: 600),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.md,
                  0,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.game.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (_dirty)
                      Padding(
                        padding:
                            const EdgeInsets.only(right: AppSpacing.sm),
                        child: FilledButton.icon(
                          onPressed: _saving ? null : _save,
                          icon: _saving
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2),
                                )
                              : const Icon(LucideIcons.save, size: 14),
                          label: const Text('Save'),
                          style: FilledButton.styleFrom(
                            visualDensity: VisualDensity.compact,
                            textStyle: theme.textTheme.labelSmall,
                          ),
                        ),
                      ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 18),
                      onPressed: () => Navigator.of(context).pop(),
                      tooltip: 'Close',
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),

              // Tabs
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'General'),
                  Tab(text: 'Prep Commands'),
                  Tab(text: 'Advanced'),
                ],
                labelStyle: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                indicatorSize: TabBarIndicatorSize.label,
              ),

              // Tab content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildGeneralTab(context, imageUrl),
                    _buildPrepCommandsTab(context),
                    _buildAdvancedTab(context),
                  ],
                ),
              ),

              // Footer actions
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _searchPoster(context),
                      icon: const Icon(LucideIcons.image, size: 14),
                      label: const Text('Find Poster'),
                      style: OutlinedButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        textStyle: theme.textTheme.labelSmall,
                      ),
                    ),
                    const Spacer(),
                    OutlinedButton.icon(
                      onPressed: () => _confirmDelete(context, ref),
                      icon: const Icon(LucideIcons.trash2, size: 14),
                      label: const Text('Remove'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: colorScheme.error,
                        side: BorderSide(
                          color: colorScheme.error.withValues(alpha: 0.5),
                        ),
                        visualDensity: VisualDensity.compact,
                        textStyle: theme.textTheme.labelSmall,
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

  // ─── General Tab ──────────────────────────────────────────────────────────

  Widget _buildGeneralTab(BuildContext context, String? imageUrl) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Poster
          SizedBox(
            width: 140,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: AspectRatio(
                aspectRatio: 3 / 4,
                child: Container(
                  color: colorScheme.surfaceContainerHighest,
                  child: imageUrl != null
                      ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _placeholder(context),
                        )
                      : _placeholder(context),
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.lg),

          // Fields
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status chips
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: [
                    if (widget.game.source != null)
                      _MetadataChip(
                        icon: _platformIcon(widget.game.source),
                        label: widget.game.source!.toUpperCase(),
                        colorScheme: colorScheme,
                      ),
                    _MetadataChip(
                      icon: LucideIcons.hardDrive,
                      label: widget.game.installed
                          ? 'Installed'
                          : 'Not installed',
                      colorScheme: colorScheme,
                      active: widget.game.installed,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // Command
                _buildTextField(
                  label: 'Command',
                  controller: _cmdController,
                  hint: 'e.g. steam://rungameid/440',
                  icon: LucideIcons.terminal,
                ),
                const SizedBox(height: AppSpacing.md),

                // Working directory
                _buildTextField(
                  label: 'Working Directory',
                  controller: _workingDirController,
                  hint: 'e.g. C:\\Games\\MyGame',
                  icon: LucideIcons.folder,
                ),
                const SizedBox(height: AppSpacing.md),

                // Toggles row
                Wrap(
                  spacing: AppSpacing.md,
                  runSpacing: AppSpacing.sm,
                  children: [
                    _buildToggle(
                      label: 'Elevated',
                      value: _elevated,
                      icon: LucideIcons.shield,
                      onChanged: (v) {
                        setState(() => _elevated = v);
                        _markDirty();
                      },
                    ),
                    _buildToggle(
                      label: 'Auto-Detach',
                      value: _autoDetach,
                      icon: LucideIcons.unlink,
                      onChanged: (v) {
                        setState(() => _autoDetach = v);
                        _markDirty();
                      },
                    ),
                  ],
                ),

                if (widget.game.uuid != null) ...[
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'UUID: ${widget.game.uuid}',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                      fontFamily: 'monospace',
                      fontSize: 9,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Prep Commands Tab ────────────────────────────────────────────────────

  Widget _buildPrepCommandsTab(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header + Add button
          Row(
            children: [
              Icon(LucideIcons.listOrdered, size: 16, color: colorScheme.primary),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Preparation Commands',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              FilledButton.tonalIcon(
                onPressed: _addPrepCmd,
                icon: const Icon(LucideIcons.plus, size: 14),
                label: const Text('Add'),
                style: FilledButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  textStyle: theme.textTheme.labelSmall,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Commands that run before (do) and after (undo) the game session.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),

          // Exclude global toggle
          const SizedBox(height: AppSpacing.sm),
          _buildToggle(
            label: 'Exclude global prep commands',
            value: _excludeGlobalPrepCmd,
            icon: LucideIcons.shieldOff,
            onChanged: (v) {
              setState(() => _excludeGlobalPrepCmd = v);
              _markDirty();
            },
          ),

          const SizedBox(height: AppSpacing.md),

          // Prep command list
          Expanded(
            child: _prepCmds.isEmpty
                ? Center(
                    child: Text(
                      'No prep commands. Add one to run scripts before/after the game.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  )
                : ListView.separated(
                    itemCount: _prepCmds.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.md),
                    itemBuilder: (_, i) => _buildPrepCmdCard(context, i),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrepCmdCard(BuildContext context, int index) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final entry = _prepCmds[index];

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Text(
                'Prep #${index + 1}',
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: colorScheme.primary,
                ),
              ),
              const Spacer(),
              _buildToggle(
                label: 'Elevated',
                value: entry.elevated,
                icon: LucideIcons.shield,
                compact: true,
                onChanged: (v) {
                  setState(() => _prepCmds[index].elevated = v);
                  _markDirty();
                },
              ),
              const SizedBox(width: AppSpacing.sm),
              IconButton(
                icon: Icon(LucideIcons.trash2,
                    size: 14, color: colorScheme.error),
                onPressed: () => _removePrepCmd(index),
                tooltip: 'Remove',
                visualDensity: VisualDensity.compact,
                constraints: const BoxConstraints(
                    minWidth: 28, minHeight: 28),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Do command
          TextField(
            controller: entry.doCtrl,
            decoration: InputDecoration(
              labelText: 'Do (before game)',
              hintText: 'e.g. net stop SomeService',
              isDense: true,
              prefixIcon: const Icon(LucideIcons.play, size: 14),
              border: const OutlineInputBorder(),
            ),
            style: theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
            onChanged: (_) => _markDirty(),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Undo command
          TextField(
            controller: entry.undoCtrl,
            decoration: InputDecoration(
              labelText: 'Undo (after game)',
              hintText: 'e.g. net start SomeService',
              isDense: true,
              prefixIcon: const Icon(LucideIcons.undo2, size: 14),
              border: const OutlineInputBorder(),
            ),
            style: theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
            onChanged: (_) => _markDirty(),
          ),
        ],
      ),
    );
  }

  // ─── Advanced Tab ─────────────────────────────────────────────────────────

  Widget _buildAdvancedTab(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Detached commands header
          Row(
            children: [
              Icon(LucideIcons.terminal, size: 16, color: colorScheme.primary),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Detached Commands',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              FilledButton.tonalIcon(
                onPressed: _addDetached,
                icon: const Icon(LucideIcons.plus, size: 14),
                label: const Text('Add'),
                style: FilledButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  textStyle: theme.textTheme.labelSmall,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Background processes that run alongside the game (launchers, scripts).',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Detached list
          Expanded(
            child: _detachedControllers.isEmpty
                ? Center(
                    child: Text(
                      'No detached commands.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
                      ),
                    ),
                  )
                : ListView.separated(
                    itemCount: _detachedControllers.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (_, i) => _buildDetachedRow(context, i),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetachedRow(BuildContext context, int index) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _detachedControllers[index],
            decoration: InputDecoration(
              labelText: 'Detached #${index + 1}',
              hintText: 'e.g. launcher.exe --background',
              isDense: true,
              prefixIcon: const Icon(LucideIcons.terminal, size: 14),
              border: const OutlineInputBorder(),
            ),
            style: theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
            onChanged: (_) => _markDirty(),
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        IconButton(
          icon: Icon(LucideIcons.trash2, size: 14, color: colorScheme.error),
          onPressed: () => _removeDetached(index),
          tooltip: 'Remove',
          visualDensity: VisualDensity.compact,
          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
        ),
      ],
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hint,
    IconData? icon,
  }) {
    final theme = Theme.of(context);
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        isDense: true,
        prefixIcon: icon != null ? Icon(icon, size: 16) : null,
        border: const OutlineInputBorder(),
      ),
      style: theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
      onChanged: (_) => _markDirty(),
    );
  }

  Widget _buildToggle({
    required String label,
    required bool value,
    required IconData icon,
    required ValueChanged<bool> onChanged,
    bool compact = false,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: colorScheme.onSurfaceVariant),
          const SizedBox(width: 2),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
          ),
          SizedBox(
            height: 20,
            child: Switch(
              value: value,
              onChanged: onChanged,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: colorScheme.onSurfaceVariant),
        const SizedBox(width: AppSpacing.xs),
        Text(label, style: theme.textTheme.labelSmall),
        const SizedBox(width: AppSpacing.xs),
        SizedBox(
          height: 24,
          child: Switch(
            value: value,
            onChanged: onChanged,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        ),
      ],
    );
  }

  void _addPrepCmd() {
    setState(() {
      _prepCmds.add(_PrepCmdEntry(
        doCtrl: TextEditingController(),
        undoCtrl: TextEditingController(),
        elevated: false,
      ));
    });
    _markDirty();
  }

  void _removePrepCmd(int index) {
    _prepCmds[index].doCtrl.dispose();
    _prepCmds[index].undoCtrl.dispose();
    setState(() => _prepCmds.removeAt(index));
    _markDirty();
  }

  void _addDetached() {
    setState(() => _detachedControllers.add(TextEditingController()));
    _markDirty();
  }

  void _removeDetached(int index) {
    _detachedControllers[index].dispose();
    setState(() => _detachedControllers.removeAt(index));
    _markDirty();
  }

  Future<void> _save() async {
    if (widget.game.index == null) return;
    setState(() => _saving = true);

    final updatedGame = GameDto(
      name: widget.game.name,
      uuid: widget.game.uuid,
      cmd: _cmdController.text.trim().isEmpty ? null : _cmdController.text.trim(),
      workingDir: _workingDirController.text.trim().isEmpty
          ? null
          : _workingDirController.text.trim(),
      imagePath: _pendingImagePath ?? widget.game.imagePath,
      source: widget.game.source,
      sourceId: widget.game.sourceId,
      elevated: _elevated,
      autoDetach: _autoDetach,
      excludeGlobalPrepCmd: _excludeGlobalPrepCmd,
      prepCmd: _prepCmds
          .map((e) => PrepCommand(
                doCmd: e.doCtrl.text.trim(),
                undoCmd: e.undoCtrl.text.trim(),
                elevated: e.elevated,
              ))
          .where((p) => p.doCmd.isNotEmpty || p.undoCmd.isNotEmpty)
          .toList(),
      detached: _detachedControllers
          .map((c) => c.text.trim())
          .where((s) => s.isNotEmpty)
          .toList(),
      index: widget.game.index,
    );

    final success = await ref
        .read(libraryProvider.notifier)
        .updateGameDto(updatedGame);

    if (mounted) {
      setState(() {
        _saving = false;
        if (success) _dirty = false;
      });
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Game settings saved.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to save.'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  void _searchPoster(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => IgdbSearchDialog(
        initialQuery: widget.game.name,
        sourceId: widget.game.source,
        providerGameId: widget.game.sourceId,
        onPosterUrlSelected: (url) {
          Navigator.of(context).pop();
          setState(() {
            _pendingImagePath = url;
            _dirty = true;
          });
        },
        onSelected: (result) {
          Navigator.of(context).pop();
          if (result.coverUrl != null) {
            setState(() {
              _pendingImagePath = result.coverUrl;
              _dirty = true;
            });
          }
        },
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove game?'),
        content: Text(
          '${widget.game.name} will be removed from the server\'s app list. '
          'The game files will not be deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await ref.read(libraryProvider.notifier).deleteGameDto(widget.game);
      if (context.mounted) Navigator.pop(context);
    }
  }

  Widget _placeholder(BuildContext context) {
    return Center(
      child: Icon(
        LucideIcons.gamepad2,
        size: 36,
        color: Theme.of(context)
            .colorScheme
            .onSurfaceVariant
            .withValues(alpha: 0.2),
      ),
    );
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

// ─── Internal models ──────────────────────────────────────────────────────────

class _PrepCmdEntry {
  _PrepCmdEntry({
    required this.doCtrl,
    required this.undoCtrl,
    required this.elevated,
  });

  final TextEditingController doCtrl;
  final TextEditingController undoCtrl;
  bool elevated;
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _MetadataChip extends StatelessWidget {
  const _MetadataChip({
    required this.icon,
    required this.label,
    required this.colorScheme,
    this.active = false,
  });

  final IconData icon;
  final String label;
  final ColorScheme colorScheme;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color =
        active ? const Color(0xFF22C55E) : colorScheme.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 3),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}
