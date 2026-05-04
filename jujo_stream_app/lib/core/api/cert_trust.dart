import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

/// Configures Dio to trust self-signed certificates from the Jujo.Stream server.
///
/// The server generates its own TLS cert on first run. The Flutter client must
/// accept it to communicate over HTTPS on LAN.
///
/// Security model:
/// - Trust is granted per-host after user explicitly connects to that server.
/// - In production, we could pin the cert fingerprint after first connection (TOFU).
/// - This handler is ONLY applied to the Jujo.Stream API client, not globally.
void configureSelfSignedCertTrust(Dio dio, {Set<String>? trustedHosts}) {
  // Self-signed cert handling is only needed on native platforms (not web).
  if (kIsWeb) return;

  final adapter = dio.httpClientAdapter;
  if (adapter is IOHttpClientAdapter) {
    adapter.createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) {
            // If we have a trusted hosts list, only trust those.
            if (trustedHosts != null && trustedHosts.isNotEmpty) {
              return trustedHosts.contains(host);
            }
            // Default: trust all certs on LAN (private IP ranges).
            return _isPrivateNetwork(host);
          };
      return client;
    };
  }
}

/// Returns true if the host is in a private/local network range.
bool _isPrivateNetwork(String host) {
  if (host == 'localhost' || host == '127.0.0.1' || host == '::1') {
    return true;
  }

  final parts = host.split('.');
  if (parts.length != 4) return false;

  final first = int.tryParse(parts[0]);
  final second = int.tryParse(parts[1]);
  if (first == null || second == null) return false;

  // 10.x.x.x
  if (first == 10) return true;
  // 172.16.x.x – 172.31.x.x
  if (first == 172 && second >= 16 && second <= 31) return true;
  // 192.168.x.x
  if (first == 192 && second == 168) return true;

  return false;
}
