import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Card with "Capture Snapshot" and "Restore Display" buttons.
///
/// Calls:
/// - `POST /api/display/export_golden` to capture current monitor layout
/// - `POST /api/display/restore` to force-restore from golden snapshot
class DisplaySnapshotCard extends ConsumerStatefulWidget {
  const DisplaySnapshotCard({super.key});

  @override
  ConsumerState<DisplaySnapshotCard> createState() =>
      _DisplaySnapshotCardState();
}

class _DisplaySnapshotCardState extends ConsumerState<DisplaySnapshotCard> {
  bool _capturing = false;
  bool _restoring = false;
  String? _message;

  ApiClient _buildClient() {
    final authNotifier = ref.read(authProvider.notifier);
    final serverUrl = ref.read(authProvider).serverUrl ?? '';
    return ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  }

  Future<void> _captureSnapshot() async {
    setState(() {
      _capturing = true;
      _message = null;
    });
    try {
      final client = _buildClient();
      final response = await client.post<Map<String, dynamic>>(
        '/api/display/export_golden',
        data: {},
      );
      final status = response.data?['status'] as bool? ?? false;
      setState(() {
        _message = status
            ? 'Display snapshot captured successfully.'
            : 'Failed to capture snapshot.';
      });
    } catch (e) {
      setState(() => _message = 'Error: $e');
    } finally {
      setState(() => _capturing = false);
    }
  }

  Future<void> _restoreDisplay() async {
    setState(() {
      _restoring = true;
      _message = null;
    });
    try {
      final client = _buildClient();
      final response = await client.post<Map<String, dynamic>>(
        '/api/display/restore',
        data: {},
      );
      final status = response.data?['status'] as bool? ?? false;
      final reverted = response.data?['reverted'] as bool? ?? false;
      setState(() {
        if (status && reverted) {
          _message = 'Display restored to snapshot.';
        } else if (status) {
          _message = 'Restore dispatched (no changes needed).';
        } else {
          final error = response.data?['error'] as String? ?? 'Unknown error';
          _message = 'Restore failed: $error';
        }
      });
    } catch (e) {
      setState(() => _message = 'Error: $e');
    } finally {
      setState(() => _restoring = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                LucideIcons.monitor,
                size: 18,
                color: colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Display Snapshot',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Capture your current monitor layout or restore it after streaming.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.base),
          Row(
            children: [
              Expanded(
                child: FilledButton.tonalIcon(
                  onPressed: _capturing ? null : _captureSnapshot,
                  icon: _capturing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(LucideIcons.camera, size: 16),
                  label: const Text('Capture'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _restoring ? null : _restoreDisplay,
                  icon: _restoring
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(LucideIcons.undo2, size: 16),
                  label: const Text('Restore'),
                ),
              ),
            ],
          ),
          if (_message != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              _message!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: _message!.startsWith('Error') ||
                        _message!.startsWith('Failed') ||
                        _message!.contains('failed')
                    ? colorScheme.error
                    : const Color(0xFF22C55E),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Compact primary action for taking a monitor layout snapshot from page headers.
class DisplaySnapshotButton extends ConsumerStatefulWidget {
  const DisplaySnapshotButton({super.key});

  @override
  ConsumerState<DisplaySnapshotButton> createState() =>
      _DisplaySnapshotButtonState();
}

class _DisplaySnapshotButtonState extends ConsumerState<DisplaySnapshotButton> {
  bool _capturing = false;

  ApiClient _buildClient() {
    final authNotifier = ref.read(authProvider.notifier);
    final serverUrl = ref.read(authProvider).serverUrl ?? '';
    return ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  }

  Future<void> _captureSnapshot() async {
    setState(() => _capturing = true);
    try {
      final response = await _buildClient().post<Map<String, dynamic>>(
        '/api/display/export_golden',
        data: {},
      );
      if (!mounted) return;
      final status = response.data?['status'] as bool? ?? false;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            status
                ? 'Monitor snapshot captured.'
                : 'Monitor snapshot failed.',
          ),
          behavior: SnackBarBehavior.floating,
          backgroundColor: status ? null : Theme.of(context).colorScheme.error,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Monitor snapshot failed: $e'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _capturing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      onPressed: _capturing ? null : _captureSnapshot,
      icon: _capturing
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(LucideIcons.camera, size: 16),
      label: const Text('Snapshot monitor'),
    );
  }
}
