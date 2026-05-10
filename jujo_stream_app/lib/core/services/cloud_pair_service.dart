import 'dart:convert';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import 'package:path_provider/path_provider.dart';

import 'package:jujo_stream_app/core/services/cloud_auth_service.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// Result of a cloud pairing attempt.
class CloudPairResult {
  const CloudPairResult({required this.success, this.clientUuid, this.error});

  final bool success;

  /// UUID assigned to this device on the server (used for all future sessions).
  final String? clientUuid;

  /// Error message if pairing failed.
  final String? error;

  factory CloudPairResult.fromJson(Map<String, dynamic> json) {
    return CloudPairResult(
      success: json['status'] as bool? ?? false,
      clientUuid: json['clientUuid'] as String?,
      error: json['error'] as String?,
    );
  }
}

/// Function type for providing the client certificate PEM.
/// Allows injection of test certs without needing path_provider.
typedef ClientCertProvider = Future<String?> Function();

/// Manages cloud-assisted pairing with Jujo.Stream servers.
///
/// Flow:
/// 1. Ensure a local client certificate exists (generated once, persisted)
/// 2. Send the cert PEM + Supabase JWT to the server's `/api/pair/cloud`
/// 3. Server validates JWT, registers the cert, returns a client UUID
///
/// This bypasses the manual PIN pairing flow entirely for authenticated users.
class CloudPairService {
  CloudPairService({http.Client? httpClient, ClientCertProvider? certProvider})
    : _client = httpClient ?? _createLocalServerClient(),
      _certProvider = certProvider;

  final http.Client _client;
  final ClientCertProvider? _certProvider;

  static http.Client _createLocalServerClient() {
    final ioClient = HttpClient()
      ..badCertificateCallback = (X509Certificate cert, String host, int port) {
        return _isLocalServerHost(host);
      };
    return IOClient(ioClient);
  }

  static bool _isLocalServerHost(String host) {
    final value = host.toLowerCase();
    return value == 'localhost' ||
        value == '127.0.0.1' ||
        value == '::1' ||
        value.startsWith('127.') ||
        value.startsWith('10.') ||
        value.startsWith('192.168.') ||
        value.startsWith('172.16.') ||
        value.startsWith('172.17.') ||
        value.startsWith('172.18.') ||
        value.startsWith('172.19.') ||
        value.startsWith('172.20.') ||
        value.startsWith('172.21.') ||
        value.startsWith('172.22.') ||
        value.startsWith('172.23.') ||
        value.startsWith('172.24.') ||
        value.startsWith('172.25.') ||
        value.startsWith('172.26.') ||
        value.startsWith('172.27.') ||
        value.startsWith('172.28.') ||
        value.startsWith('172.29.') ||
        value.startsWith('172.30.') ||
        value.startsWith('172.31.');
  }

  /// File name for the persisted client certificate.
  static const _certFileName = 'jujo_client_cert.pem';
  static const _keyFileName = 'jujo_client_key.pem';

  /// Attempt cloud pairing with a server.
  ///
  /// [serverUrl] — Base HTTPS URL of the server (e.g. "https://192.168.1.100:47984")
  /// [accessToken] — Supabase JWT from the authenticated user session
  /// [deviceName] — Human-readable name for this device
  ///
  /// Returns [CloudPairResult] with success/failure and the assigned UUID.
  Future<CloudPairResult> pair({
    required String serverUrl,
    required String accessToken,
    required String deviceName,
  }) async {
    try {
      // 1. Ensure we have a client certificate
      final certPem = await _getOrCreateClientCert();
      if (certPem == null || certPem.isEmpty) {
        return const CloudPairResult(
          success: false,
          error: 'Failed to generate client certificate',
        );
      }

      // 2. Send pairing request
      final baseUrl = serverUrl.endsWith('/')
          ? serverUrl.substring(0, serverUrl.length - 1)
          : serverUrl;

      final uri = Uri.parse('$baseUrl/api/pair/cloud');
      final response = await _client
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({
              'token': accessToken,
              'clientCert': certPem,
              'deviceName': deviceName,
            }),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode != 200) {
        return CloudPairResult(
          success: false,
          error: 'Server returned HTTP ${response.statusCode}',
        );
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final result = CloudPairResult.fromJson(json);

      if (result.success) {
        logger.info(
          'CloudPairService: paired as "${result.clientUuid}" '
          'with $baseUrl',
        );
      } else {
        logger.warning('CloudPairService: pairing rejected: ${result.error}');
      }

      return result;
    } on SocketException catch (e) {
      return CloudPairResult(
        success: false,
        error: 'Network error: ${e.message}',
      );
    } catch (e) {
      return CloudPairResult(success: false, error: 'Cloud pairing failed: $e');
    }
  }

  /// Get the existing client certificate PEM, or generate a new one.
  ///
  /// The certificate is a self-signed X509 cert that identifies this device
  /// to the streaming server. It's generated once and reused for all servers.
  Future<String?> _getOrCreateClientCert() async {
    // Use injected provider if available (for testing)
    if (_certProvider != null) {
      return _certProvider();
    }

    final dir = await getApplicationSupportDirectory();
    final certFile = File('${dir.path}/$_certFileName');

    // Return existing cert if available
    if (await certFile.exists()) {
      final pem = await certFile.readAsString();
      if (pem.contains('BEGIN CERTIFICATE')) {
        return pem;
      }
    }

    // Generate a new self-signed certificate
    // Uses the `dart:io` SecurityContext approach or platform-specific generation
    final certPem = await _generateSelfSignedCert(dir.path);
    if (certPem != null) {
      await certFile.writeAsString(certPem);
    }
    return certPem;
  }

  /// Generate a self-signed X509 certificate for client identification.
  ///
  /// This creates a 2048-bit RSA key pair and a self-signed cert valid for 20 years.
  /// The cert is compatible with the Moonlight/Sunshine pairing protocol.
  Future<String?> _generateSelfSignedCert(String outputDir) async {
    try {
      // Use openssl if available (works on all desktop platforms + Android termux)
      final keyPath = '$outputDir/$_keyFileName';
      final certPath = '$outputDir/$_certFileName';

      // Generate RSA private key
      final keyResult = await Process.run('openssl', [
        'genrsa',
        '-out',
        keyPath,
        '2048',
      ]);

      if (keyResult.exitCode != 0) {
        logger.warning(
          'CloudPairService: openssl genrsa failed: ${keyResult.stderr}',
        );
        return _generateFallbackCert(outputDir);
      }

      // Generate self-signed certificate
      final certResult = await Process.run('openssl', [
        'req',
        '-new',
        '-x509',
        '-key',
        keyPath,
        '-out',
        certPath,
        '-days',
        '7300', // ~20 years
        '-subj',
        '/CN=Jujo.Stream Client/O=Jujo',
      ]);

      if (certResult.exitCode != 0) {
        logger.warning(
          'CloudPairService: openssl req failed: ${certResult.stderr}',
        );
        return _generateFallbackCert(outputDir);
      }

      return await File(certPath).readAsString();
    } catch (e) {
      logger.warning('CloudPairService: cert generation failed: $e');
      return _generateFallbackCert(outputDir);
    }
  }

  /// Fallback certificate generation for platforms without openssl.
  /// Uses a pre-generated test cert for development; production should use
  /// platform-specific APIs (Android KeyStore, iOS Keychain, etc.)
  Future<String?> _generateFallbackCert(String outputDir) async {
    // On platforms without openssl, we need a platform channel or bundled binary.
    // For now, log a warning — the Flutter app should bundle openssl or use
    // a Dart-native X509 library in production.
    logger.warning(
      'CloudPairService: no openssl available. '
      'Cloud pairing requires a client certificate. '
      'Install openssl or implement platform-specific cert generation.',
    );
    return null;
  }

  /// Check if this device already has a client certificate.
  Future<bool> hasClientCert() async {
    final dir = await getApplicationSupportDirectory();
    final certFile = File('${dir.path}/$_certFileName');
    return certFile.existsSync();
  }

  /// Get the client certificate PEM without generating a new one.
  Future<String?> getClientCertPem() async {
    final dir = await getApplicationSupportDirectory();
    final certFile = File('${dir.path}/$_certFileName');
    if (await certFile.exists()) {
      return certFile.readAsString();
    }
    return null;
  }
}

// ─── Provider ───────��─────────────────────────────────────────────────────────

final cloudPairServiceProvider = Provider<CloudPairService>((ref) {
  return CloudPairService();
});

/// Convenience: attempt cloud pairing for the active server profile.
///
/// Returns the [CloudPairResult] or null if cloud auth is not available.
final cloudPairAttemptProvider =
    FutureProvider.family<CloudPairResult?, String>((ref, serverUrl) async {
      final authService = ref.watch(cloudAuthServiceProvider);
      final session = authService.currentSession;

      if (session == null) {
        // Not logged in — can't cloud pair
        return null;
      }

      final pairService = ref.watch(cloudPairServiceProvider);
      final deviceName = Platform.localHostname;

      return pairService.pair(
        serverUrl: serverUrl,
        accessToken: session.accessToken,
        deviceName: deviceName.isNotEmpty ? deviceName : 'Jujo.Stream App',
      );
    });
