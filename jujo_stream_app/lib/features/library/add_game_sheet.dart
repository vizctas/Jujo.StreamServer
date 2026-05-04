import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/library_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

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
  final _formKey = GlobalKey<FormState>();
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _cmdCtrl.dispose();
    _workingDirCtrl.dispose();
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
                'Add a game by specifying its executable path.',
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
      _cmdCtrl.text = result.files.single.path!;
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    try {
      final data = <String, dynamic>{
        'name': _nameCtrl.text.trim(),
        'cmd': _cmdCtrl.text.trim(),
      };
      final wd = _workingDirCtrl.text.trim();
      if (wd.isNotEmpty) data['working-dir'] = wd;

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
