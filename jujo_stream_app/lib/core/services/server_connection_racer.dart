import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// Result of a connection probe attempt.
class ConnectionProbeResult {
  const ConnectionProbeResult({
    required this.address,
    required this.latencyMs,
    required this.connectionType,
  });

  final String address;
  final int latencyMs;
  final ConnectionType connectionType;
}

enum ConnectionType {
  /// Same LAN — fastest path.
  local,

  /// Public IP with port forward — fast but requires router config.
  remote,

  /// TURN relay — always works, adds latency.
  relay,
}

/// Races multiple server addresses in parallel, returns the first successful one.
///
/// Fallback order:
/// 1. Local addresses (LAN) — tried first, 2s timeout
/// 2. External address (WAN) — tried in parallel, 4s timeout
/// 3. Returns null if all fail (caller should fall back to WebRTC/TURN)
///
/// Security: Only probes HTTPS endpoints. Never sends credentials during probe.
class ServerConnectionRacer {
  ServerConnectionRacer({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: 3),
              receiveTimeout: const Duration(seconds: 3),
              validateStatus: (_) => true, // Accept any status = server is alive
            ))
          ..httpClientAdapter;

  final Dio _dio;

  /// Probe timeout for local addresses (aggressive — LAN should be instant).
  static const _localTimeout = Duration(seconds: 2);

  /// Probe timeout for remote/WAN addresses.
  static const _remoteTimeout = Duration(seconds: 4);

  /// Overall race timeout — if nothing responds, give up.
  static const _overallTimeout = Duration(seconds: 6);

  /// Race all known addresses for a server profile.
  /// Returns the best reachable address, or null if all fail.
  ///
  /// Does NOT send auth credentials — only checks if the server is alive
  /// by hitting a lightweight endpoint.
  Future<ConnectionProbeResult?> findBestConnection({
    required List<String> localAddresses,
    String? externalAddress,
    String? probeEndpoint,
  }) async {
    final endpoint = probeEndpoint ?? '/api/config';
    final candidates = <_ProbeCandidate>[];

    // Local candidates (highest priority, shortest timeout)
    for (final addr in localAddresses) {
      final url = _normalizeUrl(addr);
      if (url != null) {
        candidates.add(_ProbeCandidate(
          url: '$url$endpoint',
          address: url,
          type: ConnectionType.local,
          timeout: _localTimeout,
        ));
      }
    }

    // External/WAN candidate
    if (externalAddress != null && externalAddress.isNotEmpty) {
      final url = _normalizeUrl(externalAddress);
      if (url != null) {
        candidates.add(_ProbeCandidate(
          url: '$url$endpoint',
          address: url,
          type: ConnectionType.remote,
          timeout: _remoteTimeout,
        ));
      }
    }

    if (candidates.isEmpty) return null;

    try {
      // Race all candidates in parallel with overall timeout
      final result = await Future.any(
        candidates.map((c) => _probe(c)),
      ).timeout(_overallTimeout);
      return result;
    } on TimeoutException {
      logger.warning('ServerConnectionRacer: all candidates timed out');
      return null;
    } catch (e) {
      logger.warning('ServerConnectionRacer: race failed: $e');
      return null;
    }
  }

  /// Convenience: race using a ServerProfile's known addresses.
  Future<ConnectionProbeResult?> findBestForProfile(
    ServerProfile profile, {
    String? externalAddress,
    List<String>? additionalLocalAddresses,
  }) {
    final locals = <String>[
      profile.url, // The stored URL is always a candidate
      ...?additionalLocalAddresses,
    ];

    return findBestConnection(
      localAddresses: locals,
      externalAddress: externalAddress,
    );
  }

  /// Probe a single candidate. Returns result on success, never-completes on failure.
  Future<ConnectionProbeResult> _probe(_ProbeCandidate candidate) async {
    final stopwatch = Stopwatch()..start();
    try {
      final response = await _dio
          .get(candidate.url)
          .timeout(candidate.timeout);

      stopwatch.stop();

      // Any HTTP response means the server is alive (even 401 = auth required = alive)
      if (response.statusCode != null) {
        logger.info(
          'ServerConnectionRacer: ${candidate.type.name} hit '
          '${candidate.address} in ${stopwatch.elapsedMilliseconds}ms '
          '(status=${response.statusCode})',
        );
        return ConnectionProbeResult(
          address: candidate.address,
          latencyMs: stopwatch.elapsedMilliseconds,
          connectionType: candidate.type,
        );
      }
    } on DioException catch (_) {
      // Connection failed — this candidate loses the race
    } on TimeoutException catch (_) {
      // Timed out — this candidate loses the race
    } on SocketException catch (_) {
      // Network unreachable — this candidate loses the race
    } catch (_) {
      // Any other error — this candidate loses the race
    }

    // Never complete = this candidate doesn't win the race
    // The Completer trick: return a future that never resolves
    return Completer<ConnectionProbeResult>().future;
  }

  /// Normalize an address to a full HTTPS URL.
  /// Handles: "192.168.1.100:47990", "https://host:47990", "host:47990"
  String? _normalizeUrl(String address) {
    if (address.isEmpty) return null;

    String url = address.trim();

    // Already a full URL
    if (url.startsWith('https://') || url.startsWith('http://')) {
      // Remove trailing slash
      if (url.endsWith('/')) url = url.substring(0, url.length - 1);
      return url;
    }

    // Bare host:port — assume HTTPS
    return 'https://$url';
  }
}

class _ProbeCandidate {
  const _ProbeCandidate({
    required this.url,
    required this.address,
    required this.type,
    required this.timeout,
  });

  final String url;
  final String address;
  final ConnectionType type;
  final Duration timeout;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final serverConnectionRacerProvider = Provider<ServerConnectionRacer>((ref) {
  return ServerConnectionRacer();
});
