import 'dart:convert';

import 'package:http/http.dart' as http;

/// Service for sending Wake-on-LAN magic packets via the server.
class WakeOnLanService {
  WakeOnLanService({required this.baseUrl});

  final String baseUrl;

  /// Send a WoL magic packet to the specified MAC address.
  Future<WolResult> wake({
    required String mac,
    String broadcast = '255.255.255.255',
    int port = 9,
  }) async {
    final uri = Uri.parse('$baseUrl/api/wol');
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
  }

  /// Validate MAC address format.
  static bool isValidMac(String mac) {
    final pattern = RegExp(r'^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$');
    return pattern.hasMatch(mac);
  }
}

/// Result of a Wake-on-LAN attempt.
class WolResult {
  const WolResult({required this.success, required this.mac, this.error});

  final bool success;
  final String mac;
  final String? error;
}
