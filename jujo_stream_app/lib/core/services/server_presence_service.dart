import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// Represents the live presence state of a server.
class ServerPresence {
  const ServerPresence({
    required this.serverUrl,
    required this.isOnline,
    this.lastSeenAt,
    this.isStreaming = false,
    this.serverVersion,
    this.serverName,
  });

  final String serverUrl;
  final bool isOnline;
  final DateTime? lastSeenAt;
  final bool isStreaming;
  final String? serverVersion;
  final String? serverName;

  /// A server is considered online if last_seen_at is within the last 2 minutes.
  static bool computeOnline(DateTime? lastSeenAt) {
    if (lastSeenAt == null) return false;
    final threshold = DateTime.now().toUtc().subtract(const Duration(minutes: 2));
    return lastSeenAt.toUtc().isAfter(threshold);
  }

  ServerPresence copyWith({
    String? serverUrl,
    bool? isOnline,
    DateTime? lastSeenAt,
    bool? isStreaming,
    String? serverVersion,
    String? serverName,
  }) {
    return ServerPresence(
      serverUrl: serverUrl ?? this.serverUrl,
      isOnline: isOnline ?? this.isOnline,
      lastSeenAt: lastSeenAt ?? this.lastSeenAt,
      isStreaming: isStreaming ?? this.isStreaming,
      serverVersion: serverVersion ?? this.serverVersion,
      serverName: serverName ?? this.serverName,
    );
  }

  factory ServerPresence.fromRow(Map<String, dynamic> row) {
    final lastSeen = row['last_seen_at'] != null
        ? DateTime.tryParse(row['last_seen_at'] as String)
        : null;

    return ServerPresence(
      serverUrl: row['server_url'] as String? ?? '',
      isOnline: computeOnline(lastSeen),
      lastSeenAt: lastSeen,
      isStreaming: row['is_streaming'] as bool? ?? false,
      serverVersion: row['server_version'] as String?,
      serverName: row['server_name'] as String?,
    );
  }
}

/// Service that subscribes to Supabase Realtime for server presence changes.
///
/// Emits [ServerPresence] updates whenever a server's heartbeat data changes.
/// Falls back to periodic polling if Realtime is unavailable.
class ServerPresenceService {
  ServerPresenceService({
    SupabaseClient? client,
  }) : _client = client;

  final SupabaseClient? _client;
  RealtimeChannel? _channel;
  final _controller = StreamController<List<ServerPresence>>.broadcast();
  Timer? _fallbackTimer;
  List<ServerPresence> _currentState = [];

  /// Whether the service is configured and can operate.
  bool get isConfigured =>
      _client != null && SupabaseConfig.current.isConfigured;

  /// Stream of all server presence states for the current user.
  Stream<List<ServerPresence>> get presenceStream => _controller.stream;

  /// Current snapshot of all server presence states.
  List<ServerPresence> get currentPresence => List.unmodifiable(_currentState);

  /// Start listening for presence changes.
  ///
  /// Fetches initial state, then subscribes to Realtime updates.
  Future<void> start() async {
    if (!isConfigured) return;

    // Fetch initial state
    await _fetchAll();

    // Subscribe to Realtime changes on user_server_profiles
    try {
      _channel = _client!
          .channel('server-presence')
          .onPostgresChanges(
            event: PostgresChangeEvent.update,
            schema: 'public',
            table: 'user_server_profiles',
            callback: (payload) {
              _handleRealtimeUpdate(payload);
            },
          )
          .subscribe((status, [error]) {
        if (status == RealtimeSubscribeStatus.subscribed) {
          logger.info('ServerPresenceService: Realtime subscribed');
          _fallbackTimer?.cancel();
        } else if (status == RealtimeSubscribeStatus.closed ||
            status == RealtimeSubscribeStatus.channelError) {
          logger.warning(
            'ServerPresenceService: Realtime disconnected, '
            'falling back to polling',
          );
          _startFallbackPolling();
        }
      });
    } catch (e) {
      logger.warning('ServerPresenceService: Realtime setup failed: $e');
      _startFallbackPolling();
    }
  }

  /// Stop listening and clean up resources.
  Future<void> stop() async {
    _fallbackTimer?.cancel();
    _fallbackTimer = null;

    if (_channel != null) {
      await _client?.removeChannel(_channel!);
      _channel = null;
    }

    _currentState = [];
  }

  /// Dispose the service entirely.
  void dispose() {
    stop();
    _controller.close();
  }

  /// Fetch all server profiles for the current user and compute presence.
  Future<void> _fetchAll() async {
    try {
      final response = await _client!
          .from('user_server_profiles')
          .select('server_url, server_name, last_seen_at, is_streaming, server_version')
          .order('display_order', ascending: true);

      _currentState = (response as List)
          .map((row) => ServerPresence.fromRow(row as Map<String, dynamic>))
          .toList();

      if (!_controller.isClosed) {
        _controller.add(_currentState);
      }
    } catch (e) {
      logger.warning('ServerPresenceService: fetch failed: $e');
    }
  }

  /// Handle a Realtime UPDATE event on user_server_profiles.
  void _handleRealtimeUpdate(PostgresChangePayload payload) {
    try {
      final newRow = payload.newRecord;
      if (newRow.isEmpty) return;

      final serverUrl = newRow['server_url'] as String?;
      if (serverUrl == null || serverUrl.isEmpty) return;

      final updatedPresence = ServerPresence.fromRow(newRow);

      // Update or add to current state
      final index = _currentState.indexWhere(
        (p) => p.serverUrl == serverUrl,
      );

      if (index >= 0) {
        _currentState[index] = updatedPresence;
      } else {
        _currentState.add(updatedPresence);
      }

      if (!_controller.isClosed) {
        _controller.add(List.unmodifiable(_currentState));
      }
    } catch (e) {
      logger.warning('ServerPresenceService: realtime update parse failed: $e');
    }
  }

  /// Fallback: poll every 30s if Realtime is unavailable.
  void _startFallbackPolling() {
    _fallbackTimer?.cancel();
    _fallbackTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _fetchAll(),
    );
  }
}

// ─── Providers ─────────────────────────────────────────────────���──────────────

final serverPresenceServiceProvider = Provider<ServerPresenceService>((ref) {
  if (!SupabaseConfig.current.isConfigured) {
    return ServerPresenceService();
  }
  final service = ServerPresenceService(
    client: Supabase.instance.client,
  );
  ref.onDispose(() => service.dispose());
  return service;
});

/// Stream of all server presence states, auto-starts on first listen.
final serverPresenceStreamProvider =
    StreamProvider.autoDispose<List<ServerPresence>>((ref) {
  final service = ref.watch(serverPresenceServiceProvider);
  if (!service.isConfigured) {
    return const Stream.empty();
  }

  // Start the service (idempotent)
  service.start();

  return service.presenceStream;
});

/// Get presence for a specific server URL.
final serverPresenceByUrlProvider =
    Provider.family<ServerPresence?, String>((ref, serverUrl) {
  final allPresence = ref.watch(serverPresenceStreamProvider).valueOrNull;
  if (allPresence == null) return null;

  try {
    return allPresence.firstWhere((p) => p.serverUrl == serverUrl);
  } catch (_) {
    return null;
  }
});
