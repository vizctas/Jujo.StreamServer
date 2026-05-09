import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/features/library/igdb_search_dialog.dart';
import 'package:jujo_stream_app/core/services/igdb_metadata_service.dart';

/// Bottom sheet for adding a manual game entry.
class AddGameSheet extends ConsumerStatefulWidget {
  const AddGameSheet({super.key});

  @override
  ConsumerState<AddGameSheet> createState() => _AddGameSheetState();
}

class _AddGameSheetState extends ConsumerState<AddGameSheet> {
  final _nameCtrl = TextEditingController();
  final _cmdCtrl = TextEditingController();
  final _workingDirCtrl = TextEditingController();
  final _imagePathCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _prepCmds = <_PrepCmdEntry>[];
  final _detachedControllers = <TextEditingController>[];
  bool _elevated = false;
  bool _autoDetach = false;
  bool _excludeGlobalPrepCmd = false;
  IgdbGameResult? _selectedMetadata;
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _cmdCtrl.dispose();
    _workingDirCtrl.dispose();
    _imagePathCtrl.dispose();
    for (final prep in _prepCmds) {
      prep.doCtrl.dispose();
      prep.undoCtrl.dispose();
    }
    for (final ctrl in _detachedControllers) {
      ctrl.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.xl,
        right: AppSpacing.xl,
        top: AppSpacing.xl,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 32,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurfaceVariant.withValues(
                      alpha: 0.3,
                    ),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              Text('Add Game', style: theme.textTheme.titleLarge),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Add executable, launch options, poster, and startup commands.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Name
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  hintText: 'Game name',
                  border: OutlineInputBorder(),
                ),
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Name is required' : null,
              ),
              const SizedBox(height: AppSpacing.base),

              // Command with browse button
              TextFormField(
                controller: _cmdCtrl,
                decoration: InputDecoration(
                  labelText: 'Command',
                  hintText: 'C:\\Games\\app.exe',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: const Icon(LucideIcons.folderOpen, size: 20),
                    tooltip: 'Browse',
                    onPressed: _pickFile,
                  ),
                ),
                textInputAction: TextInputAction.next,
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Command is required'
                    : null,
              ),
              const SizedBox(height: AppSpacing.base),

              // Working directory
              TextFormField(
                controller: _workingDirCtrl,
                decoration: const InputDecoration(
                  labelText: 'Working Directory',
                  hintText: 'C:\\Games\\App (optional)',
                  border: OutlineInputBorder(),
                ),
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _save(),
              ),
              const SizedBox(height: AppSpacing.base),

              _buildMetadataSection(context),
              const SizedBox(height: AppSpacing.sm),
              _buildCommandSection(context),
              const SizedBox(height: AppSpacing.xl),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _saving
                          ? null
                          : () => Navigator.of(context).pop(),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: FilledButton(
                      onPressed: _saving ? null : _save,
                      child: _saving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Add Game'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['exe', 'bat', 'cmd', 'com', 'ps1', 'lnk'],
      allowMultiple: false,
    );
    if (result != null && result.files.single.path != null) {
      final path = result.files.single.path!;
      _cmdCtrl.text = path;
      if (_workingDirCtrl.text.trim().isEmpty) {
        final parent = File(path).parent.path;
        if (parent.isNotEmpty && parent != '.') {
          _workingDirCtrl.text = parent;
        }
      }
    }
  }

  Widget _buildMetadataSection(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(bottom: AppSpacing.sm),
      leading: const Icon(LucideIcons.image, size: 18),
      title: const Text('Metadata & Poster'),
      subtitle: const Text('Search IGDB or paste poster path/URL'),
      children: [
        TextFormField(
          controller: _imagePathCtrl,
          decoration: const InputDecoration(
            labelText: 'Poster / Image Path',
            hintText: 'C:\\Games\\poster.jpg or https://...',
            border: OutlineInputBorder(),
          ),
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.sm),
        Align(
          alignment: Alignment.centerLeft,
          child: OutlinedButton.icon(
            onPressed: _openMetadataSearch,
            icon: const Icon(LucideIcons.search, size: 16),
            label: const Text('Search Metadata'),
          ),
        ),
      ],
    );
  }

  Widget _buildCommandSection(BuildContext context) {
    final theme = Theme.of(context);
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(bottom: AppSpacing.sm),
      leading: const Icon(LucideIcons.terminal, size: 18),
      title: const Text('Launch Commands'),
      subtitle: const Text('Prep, detached, elevation, auto-detach'),
      children: [
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.xs,
          children: [
            FilterChip(
              avatar: const Icon(LucideIcons.shield, size: 14),
              label: const Text('Elevated'),
              selected: _elevated,
              onSelected: (value) => setState(() => _elevated = value),
            ),
            FilterChip(
              avatar: const Icon(LucideIcons.unlink, size: 14),
              label: const Text('Auto-detach'),
              selected: _autoDetach,
              onSelected: (value) => setState(() => _autoDetach = value),
            ),
            FilterChip(
              avatar: const Icon(LucideIcons.shieldOff, size: 14),
              label: const Text('Skip global prep'),
              selected: _excludeGlobalPrepCmd,
              onSelected: (value) =>
                  setState(() => _excludeGlobalPrepCmd = value),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _sectionHeader(
          context,
          icon: LucideIcons.playSquare,
          title: 'Prep Commands',
          onAdd: _addPrepCmd,
        ),
        if (_prepCmds.isEmpty)
          _emptyHint(theme, 'No prep commands.')
        else
          ...List.generate(
            _prepCmds.length,
            (i) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: _prepRow(context, i),
            ),
          ),
        const SizedBox(height: AppSpacing.sm),
        _sectionHeader(
          context,
          icon: LucideIcons.terminal,
          title: 'Detached Commands',
          onAdd: _addDetached,
        ),
        if (_detachedControllers.isEmpty)
          _emptyHint(theme, 'No detached commands.')
        else
          ...List.generate(
            _detachedControllers.length,
            (i) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: _detachedRow(context, i),
            ),
          ),
      ],
    );
  }

  Widget _sectionHeader(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onAdd,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.primary),
        const SizedBox(width: AppSpacing.sm),
        Text(title, style: theme.textTheme.titleSmall),
        const Spacer(),
        TextButton.icon(
          onPressed: onAdd,
          icon: const Icon(LucideIcons.plus, size: 14),
          label: const Text('Add'),
        ),
      ],
    );
  }

  Widget _prepRow(BuildContext context, int index) {
    final entry = _prepCmds[index];
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: entry.doCtrl,
                decoration: InputDecoration(
                  labelText: 'Prep #${index + 1} run',
                  hintText: 'Command before launch',
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              icon: const Icon(LucideIcons.trash2, size: 18),
              tooltip: 'Remove prep command',
              onPressed: () => _removePrepCmd(index),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: entry.undoCtrl,
                decoration: InputDecoration(
                  labelText: 'Prep #${index + 1} undo',
                  hintText: 'Command after exit',
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            FilterChip(
              avatar: const Icon(LucideIcons.shield, size: 14),
              label: const Text('Elevated'),
              selected: entry.elevated,
              onSelected: (value) =>
                  setState(() => _prepCmds[index].elevated = value),
            ),
          ],
        ),
      ],
    );
  }

  Widget _detachedRow(BuildContext context, int index) {
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _detachedControllers[index],
            decoration: InputDecoration(
              labelText: 'Detached #${index + 1}',
              hintText: 'launcher.exe --background',
              border: const OutlineInputBorder(),
              isDense: true,
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        IconButton(
          icon: const Icon(LucideIcons.trash2, size: 18),
          tooltip: 'Remove detached command',
          onPressed: () => _removeDetached(index),
        ),
      ],
    );
  }

  Widget _emptyHint(ThemeData theme, String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: Text(
          text,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  void _addPrepCmd() {
    setState(() {
      _prepCmds.add(
        _PrepCmdEntry(
          doCtrl: TextEditingController(),
          undoCtrl: TextEditingController(),
          elevated: false,
        ),
      );
    });
  }

  void _removePrepCmd(int index) {
    _prepCmds[index].doCtrl.dispose();
    _prepCmds[index].undoCtrl.dispose();
    setState(() => _prepCmds.removeAt(index));
  }

  void _addDetached() {
    setState(() => _detachedControllers.add(TextEditingController()));
  }

  void _removeDetached(int index) {
    _detachedControllers[index].dispose();
    setState(() => _detachedControllers.removeAt(index));
  }

  Future<void> _openMetadataSearch() async {
    final result = await showDialog<IgdbGameResult>(
      context: context,
      builder: (_) => IgdbSearchDialog(initialQuery: _nameCtrl.text.trim()),
    );
    if (result == null || !mounted) return;
    setState(() {
      _selectedMetadata = result;
      if (_nameCtrl.text.trim().isEmpty) {
        _nameCtrl.text = result.name;
      }
      if (result.coverUrl != null && result.coverUrl!.isNotEmpty) {
        _imagePathCtrl.text = result.coverUrl!;
      }
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    try {
      final data = <String, dynamic>{
        'name': _nameCtrl.text.trim(),
        'cmd': _cmdCtrl.text.trim(),
        'source': 'manual',
        'elevated': _elevated,
        'auto-detach': _autoDetach,
        'exclude-global-prep-cmd': _excludeGlobalPrepCmd,
      };
      final wd = _workingDirCtrl.text.trim();
      if (wd.isNotEmpty) data['working-dir'] = wd;
      final imagePath = _imagePathCtrl.text.trim();
      if (imagePath.isNotEmpty) data['image-path'] = imagePath;
      final metadata = _selectedMetadata;
      if (metadata != null) {
        if (metadata.summary != null && metadata.summary!.isNotEmpty) {
          data['description'] = metadata.summary;
        }
        if (metadata.developer != null && metadata.developer!.isNotEmpty) {
          data['developer'] = metadata.developer;
        }
        if (metadata.publisher != null && metadata.publisher!.isNotEmpty) {
          data['publisher'] = metadata.publisher;
        }
        final releaseDate = metadata.releaseDateFormatted;
        if (releaseDate != null && releaseDate.isNotEmpty) {
          data['release-date'] = releaseDate;
        }
        if (metadata.genres != null && metadata.genres!.isNotEmpty) {
          data['genres'] = metadata.genres;
        }
      }
      final prepCmds = _prepCmds
          .map(
            (entry) => {
              'do': entry.doCtrl.text.trim(),
              'undo': entry.undoCtrl.text.trim(),
              'elevated': entry.elevated,
            },
          )
          .where((entry) =>
              (entry['do'] as String).isNotEmpty ||
              (entry['undo'] as String).isNotEmpty)
          .toList();
      if (prepCmds.isNotEmpty) data['prep-cmd'] = prepCmds;
      final detached = _detachedControllers
          .map((ctrl) => ctrl.text.trim())
          .where((value) => value.isNotEmpty)
          .toList();
      if (detached.isNotEmpty) data['detached'] = detached;

      final ok = await ref.read(libraryProvider.notifier).addGame(data);
      if (!mounted) return;

      if (ok) {
        Navigator.of(context).pop(true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to add game. Check server connection.'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: theme.colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  ThemeData get theme => Theme.of(context);
}

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
