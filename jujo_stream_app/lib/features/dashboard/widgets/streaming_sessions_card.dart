import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/streaming_session.dart';
import '../../../core/services/streaming_sessions_service.dart';

/// Card that displays active streaming sessions with stats and disconnect button.
class StreamingSessionsCard extends ConsumerWidget {
  const StreamingSessionsCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionsAsync = ref.watch(streamingSessionsProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.cast_connected, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  'Active Sessions',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const Spacer(),
                sessionsAsync.when(
                  data: (sessions) => _SessionCountBadge(count: sessions.length),
                  loading: () => const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  error: (_, __) => const Icon(Icons.error_outline, size: 16, color: Colors.red),
                ),
              ],
            ),
            const SizedBox(height: 12),
            sessionsAsync.when(
              data: (sessions) {
                if (sessions.isEmpty) {
                  return const _EmptyState();
                }
                return Column(
                  children: sessions.map((s) => _SessionTile(session: s)).toList(),
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (error, _) => Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  'Failed to load sessions',
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SessionCountBadge extends StatelessWidget {
  const _SessionCountBadge({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    final color = count > 0 ? Colors.green : Colors.grey;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        count > 0 ? '$count active' : 'None',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.videogame_asset_off, size: 32, color: Colors.grey.shade400),
            const SizedBox(height: 8),
            Text(
              'No active streaming sessions',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _SessionTile extends StatelessWidget {
  const _SessionTile({required this.session});
  final StreamingSession session;

  @override
  Widget build(BuildContext context) {
    final resolution = session.width != null && session.height != null
        ? '${session.width}×${session.height}'
        : null;
    final fpsText = session.fps != null ? '${session.fps} FPS' : null;
    final bitrateText = session.bitrateKbps != null
        ? '${(session.bitrateKbps! / 1000).toStringAsFixed(1)} Mbps'
        : null;
    final codecText = session.codec ?? 'Unknown codec';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: session ID + status indicators
          Row(
            children: [
              Icon(
                session.video ? Icons.play_circle_filled : Icons.pause_circle_filled,
                size: 18,
                color: session.video ? Colors.green : Colors.orange,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Session ${session.id.substring(0, 8)}…',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (session.hdr == true)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'HDR',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          // Stats row
          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: [
              if (resolution != null) _StatChip(icon: Icons.aspect_ratio, label: resolution),
              if (fpsText != null) _StatChip(icon: Icons.speed, label: fpsText),
              if (bitrateText != null) _StatChip(icon: Icons.network_check, label: bitrateText),
              _StatChip(icon: Icons.videocam, label: codecText),
              if (session.audioCodec != null)
                _StatChip(icon: Icons.audiotrack, label: session.audioCodec!),
            ],
          ),
          const SizedBox(height: 6),
          // Packet stats
          Row(
            children: [
              Text(
                '📦 ${_formatPackets(session.videoPackets)} video',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
              const SizedBox(width: 12),
              Text(
                '🔊 ${_formatPackets(session.audioPackets)} audio',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
              if (session.videoDropped > 0 || session.audioDropped > 0) ...[
                const SizedBox(width: 12),
                Text(
                  '⚠️ ${session.videoDropped + session.audioDropped} dropped',
                  style: const TextStyle(fontSize: 11, color: Colors.orange),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  String _formatPackets(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return '$count';
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.grey.shade600),
        const SizedBox(width: 3),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
      ],
    );
  }
}
