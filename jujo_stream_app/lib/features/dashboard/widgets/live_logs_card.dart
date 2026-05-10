import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

class _LogEntry {
  const _LogEntry({required this.level, required this.message, required this.timestamp});
  final String level;
  final String message;
  final DateTime timestamp;

  factory _LogEntry.parse(String raw) {
    final levelMatch = RegExp(r'\[(info|warning|error|debug|fatal)\]', caseSensitive: false).firstMatch(raw);
    final timeMatch = RegExp(r'\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]').firstMatch(raw);
    final level = levelMatch?.group(1)?.toLowerCase() ?? 'info';
    final time = timeMatch != null
        ? DateTime.tryParse(timeMatch.group(1)!.replaceFirst(' ', 'T')) ?? DateTime.now()
        : DateTime.now();
    final message = raw
        .replaceAll(RegExp(r'\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\]'), '')
        .replaceAll(RegExp(r'\[(info|warning|error|debug|fatal)\]', caseSensitive: false), '')
        .trim();
    return _LogEntry(level: level, message: message, timestamp: time);
  }
}

/// Live server logs with lazy auto-scroll. Polls GET /api/logs every 4s.
/// Caps at 200 lines. Throttles new entries to avoid alarming users.
class LiveLogsCard extends ConsumerStatefulWidget {
  const LiveLogsCard({super.key});
  @override
  ConsumerState<LiveLogsCard> createState() => _LiveLogsCardState();
}

class _LiveLogsCardState extends ConsumerState<LiveLogsCard> {
  static const _maxLines = 200;
  static const _pollInterval = Duration(seconds: 4);

  final _entries = <_LogEntry>[];
  final _scrollController = ScrollController();
  Timer? _pollTimer;
  ApiClient? _client;
  bool _autoScroll = true;
  bool _expanded = true;
  bool _loading = true;
  String? _error;
  int _lastKnownLength = 0;
  String _levelFilter = 'all';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _fetchLogs();
    _pollTimer = Timer.periodic(_pollInterval, (_) => _fetchLogs());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final atBottom = _scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 40;
    if (_autoScroll != atBottom) setState(() => _autoScroll = atBottom);
  }

  Future<void> _fetchLogs() async {
    try {
      final authNotifier = ref.read(authProvider.notifier);
      final serverUrl = ref.read(authProvider).serverUrl ?? '';
      final token = ref.read(authProvider).token ?? '';
      if (serverUrl.isEmpty || token.isEmpty) return;
      _client ??= ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
      final response = await _client!.get<String>('/api/logs');
      if (response.statusCode == 200 && response.data != null) {
        final rawLines = response.data!.split('\n').where((l) => l.trim().isNotEmpty).toList();
        if (rawLines.length > _lastKnownLength) {
          final newLines = rawLines.sublist(_lastKnownLength);
          _lastKnownLength = rawLines.length;
          for (final line in newLines) {
            if (!mounted) return;
            _entries.add(_LogEntry.parse(line));
            if (_entries.length > _maxLines) _entries.removeAt(0);
          }
          setState(() {});
          if (_autoScroll) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (_scrollController.hasClients) {
                _scrollController.animateTo(
                  _scrollController.position.maxScrollExtent,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOut,
                );
              }
            });
          }
        }
        if (_loading) setState(() => _loading = false);
        if (_error != null) setState(() => _error = null);
      }
    } catch (_) {
      if (_loading) setState(() { _loading = false; _error = 'Unable to fetch logs'; });
    }
  }

  List<_LogEntry> get _filtered {
    if (_levelFilter == 'all') return _entries;
    return _entries.where((e) => e.level == _levelFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final filtered = _filtered;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      height: _expanded ? 416 : 208,
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(LucideIcons.terminal, size: 16, color: cs.onSurfaceVariant),
              const SizedBox(width: AppSpacing.sm),
              Text('Server Logs', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
              const Spacer(),
              _Chip(label: 'All', active: _levelFilter == 'all', onTap: () => setState(() => _levelFilter = 'all')),
              const SizedBox(width: 4),
              _Chip(label: 'Warn', active: _levelFilter == 'warning', color: const Color(0xFFF59E0B), onTap: () => setState(() => _levelFilter = 'warning')),
              const SizedBox(width: 4),
              _Chip(label: 'Err', active: _levelFilter == 'error', color: cs.error, onTap: () => setState(() => _levelFilter = 'error')),
              const SizedBox(width: AppSpacing.sm),
              InkWell(
                onTap: () => setState(() => _expanded = !_expanded),
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(_expanded ? LucideIcons.minimize2 : LucideIcons.maximize2, size: 14, color: cs.onSurfaceVariant),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Expanded(
            child: _loading
                ? Center(child: Text('Loading logs...', style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant)))
                : _error != null
                    ? Center(child: Text(_error!, style: theme.textTheme.bodySmall?.copyWith(color: cs.error)))
                    : filtered.isEmpty
                        ? Center(child: Text('No log entries', style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant)))
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            child: Container(
                              color: cs.surface.withValues(alpha: 0.6),
                              child: ListView.builder(
                                controller: _scrollController,
                                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                                itemCount: filtered.length,
                                itemBuilder: (_, i) => _LogLine(entry: filtered[i]),
                              ),
                            ),
                          ),
          ),
          if (!_autoScroll)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: InkWell(
                onTap: () {
                  setState(() => _autoScroll = true);
                  _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                },
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
                  decoration: BoxDecoration(color: cs.primaryContainer.withValues(alpha: 0.5), borderRadius: BorderRadius.circular(AppRadius.sm)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.arrowDown, size: 12, color: cs.primary),
                      const SizedBox(width: 4),
                      Text('New logs available', style: theme.textTheme.labelSmall?.copyWith(color: cs.primary)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _LogLine extends StatelessWidget {
  const _LogLine({required this.entry});
  final _LogEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (Color color, String prefix) = switch (entry.level) {
      'error' || 'fatal' => (const Color(0xFFEF4444), '●'),
      'warning' => (const Color(0xFFF59E0B), '●'),
      'debug' => (theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5), '���'),
      _ => (theme.colorScheme.onSurfaceVariant, '·'),
    };
    final timeStr = '${entry.timestamp.hour.toString().padLeft(2, '0')}:${entry.timestamp.minute.toString().padLeft(2, '0')}:${entry.timestamp.second.toString().padLeft(2, '0')}';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(prefix, style: TextStyle(color: color, fontSize: 10, height: 1.6)),
          const SizedBox(width: 4),
          Text(timeStr, style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.6), fontFamily: 'monospace', fontSize: 10)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              entry.message,
              style: theme.textTheme.bodySmall?.copyWith(
                color: color == theme.colorScheme.onSurfaceVariant ? theme.colorScheme.onSurface : color,
                fontFamily: 'monospace',
                fontSize: 11,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.active, required this.onTap, this.color});
  final String label;
  final bool active;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = color ?? theme.colorScheme.primary;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: active ? c.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: active ? c.withValues(alpha: 0.4) : theme.colorScheme.outlineVariant.withValues(alpha: 0.5)),
        ),
        child: Text(label, style: theme.textTheme.labelSmall?.copyWith(color: active ? c : theme.colorScheme.onSurfaceVariant, fontWeight: active ? FontWeight.w600 : FontWeight.w400, fontSize: 10)),
      ),
    );
  }
}
