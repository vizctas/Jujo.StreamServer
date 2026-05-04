import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for device pairing.
///
/// Two pairing modes (mirrors the Vue pin.html):
///   1. OTP / QR mode  → POST /api/otp  — server generates OTP, encode as QR
///   2. PIN mode (legacy) → POST /api/pin — admin enters PIN shown by Moonlight
///
/// Client management:
///   GET  /api/clients/list        → list all trusted clients
///   POST /api/clients/unpair      → unpair one client  { uuid }
///   POST /api/clients/unpair-all  → unpair every client
///   POST /api/clients/disconnect  → disconnect active session { uuid }
///   POST /api/clients/update      → update client name/permissions { uuid, name, … }
class PairingApi {
  PairingApi({required this.client});

  final ApiClient client;

  // ── OTP / QR mode ──────────────────────────────────────────────────────────

  /// Generate a one-time OTP for QR pairing.
  /// [passphrase] is an optional alphanumeric secret the client must also know.
  /// [deviceName] is the friendly name to assign to the incoming client.
  Future<OtpResponseDto?> generateOtp({
    String passphrase = '',
    String deviceName = '',
  }) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/otp',
        data: {'passphrase': passphrase, 'deviceName': deviceName},
      );
      if (response.statusCode == 200 && response.data != null) {
        return OtpResponseDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // ── PIN mode (legacy) ──────────────────────────────────────────────────────

  /// Confirm a pairing using the 4-digit PIN shown by the Moonlight client.
  /// The Moonlight client initiates pairing; the admin enters the PIN here.
  Future<bool> confirmPin({required String pin, String deviceName = ''}) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/pin',
        data: {'pin': pin, 'name': deviceName},
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data!['status'] == true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ── Client management ──────────────────────────────────────────────────────

  /// List all trusted (paired) clients.
  Future<List<PairedClientDto>> getClients() async {
    try {
      final response =
          await client.get<Map<String, dynamic>>('/api/clients/list');
      if (response.statusCode == 200 && response.data != null) {
        final raw = response.data!['clients'] as List<dynamic>? ?? const [];
        return raw
            .map((e) => PairedClientDto.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Unpair a single client by UUID.
  Future<bool> unpairClient(String uuid) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/clients/unpair',
        data: {'uuid': uuid},
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Unpair all clients.
  Future<bool> unpairAll() async {
    try {
      final response = await client
          .post<Map<String, dynamic>>('/api/clients/unpair-all');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Disconnect an active streaming session for a client (keep them paired).
  Future<bool> disconnectClient(String uuid) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/clients/disconnect',
        data: {'uuid': uuid},
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

/// Response from POST /api/otp
class OtpResponseDto {
  const OtpResponseDto({
    required this.status,
    this.otp,
    this.ip,
    this.name,
    this.message,
  });

  final bool status;
  final String? otp;
  final String? ip;
  final String? name;
  final String? message;

  factory OtpResponseDto.fromJson(Map<String, dynamic> json) {
    return OtpResponseDto(
      status: json['status'] == true,
      otp: json['otp'] as String?,
      ip: json['ip'] as String?,
      name: json['name'] as String?,
      message: json['message'] as String?,
    );
  }
}

/// A single trusted (paired) client.
class PairedClientDto {
  const PairedClientDto({
    required this.uuid,
    required this.name,
    this.perm,
    this.connected = false,
  });

  final String uuid;
  final String name;
  final int? perm;
  final bool connected;

  factory PairedClientDto.fromJson(Map<String, dynamic> json) {
    return PairedClientDto(
      uuid: json['uuid'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown Device',
      perm: json['perm'] as int?,
      connected: json['connected'] as bool? ?? false,
    );
  }
}
