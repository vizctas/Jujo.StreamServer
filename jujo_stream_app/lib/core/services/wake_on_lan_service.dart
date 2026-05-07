import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

/// Service for sending Wake-on-LAN magic packets.
///
/// Two modes:
/// - [wakeDirect]: Sends the magic packet directly from this device via UDP
///   broadcast. Works when the app is on the same LAN as the target machine.
///   This is the primary method for waking a sleeping server.
/// - [wakeViaServer]: Sends the magic packet via the server's HTTP API.
///   Only works if the server is already running (useful for waking OTHER
///   machines on the LAN, not the server itself).
class WakeOnLanService {
  WakeOnLanService({this.baseUrl});

  /// Base URL of the server (only needed for [wakeViaServer]).
  final String? baseUrl;

  /// Send a WoL magic packet directly from this device via UDP broadcast.
  ///
  /// This is the correct approach for waking a sleeping server — the packet
  /// goes directly from the phone/laptop to the target NIC without needing
  /// the server to be running.
  ///
  /// Requires the device to be on the same LAN as the target.
  Future<WolResult> wakeDirect({
    required String mac,
    String broadcast = '255.255.255.255',
    int port = 9,
  }) async {
    if (!isValidMac(mac)) {
      return WolResult(success: false, mac: mac, error: 'Invalid MAC address format');
    }

    try {
      final macBytes = _parseMac(mac);
      final magicPacket = _buildMagicPacket(macBytes);

      final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      socket.broadcastEnabled = true;

      final destination = InternetAddress(broadcast);
      final sent = socket.send(magicPacket, destination, port);
      socket.close();

      if (sent == magicPacket.length) {
        return WolResult(success: true, mac: mac);
      }

      return WolResult(
        success: false,
        mac: mac,
        error: 'Failed to send packet (sent $sent of ${magicPacket.length} bytes)',
      );
    } on SocketException catch (e) {
      return WolResult(success: false, mac: mac, error: 'Network error: ${e.message}');
    } catch (e) {
      return WolResult(success: false, mac: mac, error: 'Unexpected error: $e');
    }
  }

  /// Send a WoL magic packet via the server's HTTP API.
  ///
  /// Only works if the server is already running. Useful for waking OTHER
  /// machines on the server's LAN (e.g., a NAS), not the server itself.
  Future<WolResult> wakeViaServer({
    required String mac,
    String broadcast = '255.255.255.255',
    int port = 9,
  }) async {
    if (baseUrl == null || baseUrl!.isEmpty) {
      return WolResult(success: false, mac: mac, error: 'No server URL configured');
    }

    final uri = Uri.parse('$baseUrl/api/wol');
    try {
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'mac': mac,
          'broadcast': broadcast,
          'port': port,
        }),
      );

      final json = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && json['status'] == true) {
        return WolResult(success: true, mac: mac);
      }

      return WolResult(
        success: false,
        mac: mac,
        error: json['error'] as String? ?? 'Unknown error',
      );
    } catch (e) {
      return WolResult(success: false, mac: mac, error: 'Server unreachable: $e');
    }
  }

  /// Validate MAC address format (AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF).
  static bool isValidMac(String mac) {
    final pattern = RegExp(r'^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$');
    return pattern.hasMatch(mac);
  }

  /// Parse MAC string into 6 bytes.
  static Uint8List parseMacForTest(String mac) => _parseMac(mac);

  static Uint8List _parseMac(String mac) {
    final cleaned = mac.replaceAll(RegExp(r'[:\-]'), '');
    final bytes = Uint8List(6);
    for (var i = 0; i < 6; i++) {
      bytes[i] = int.parse(cleaned.substring(i * 2, i * 2 + 2), radix: 16);
    }
    return bytes;
  }

  /// Build the 102-byte magic packet: 6x 0xFF + 16x MAC.
  static Uint8List buildMagicPacketForTest(Uint8List mac) => _buildMagicPacket(mac);

  static Uint8List _buildMagicPacket(Uint8List mac) {
    final packet = Uint8List(102);
    // First 6 bytes: 0xFF
    for (var i = 0; i < 6; i++) {
      packet[i] = 0xFF;
    }
    // Next 96 bytes: MAC repeated 16 times
    for (var i = 0; i < 16; i++) {
      packet.setRange(6 + i * 6, 6 + (i + 1) * 6, mac);
    }
    return packet;
  }
}

/// Result of a Wake-on-LAN attempt.
class WolResult {
  const WolResult({required this.success, required this.mac, this.error});

  final bool success;
  final String mac;
  final String? error;
}
