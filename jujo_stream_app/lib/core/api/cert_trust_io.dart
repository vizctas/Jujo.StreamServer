import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';

void configureSelfSignedCertTrust(Dio dio, {Set<String>? trustedHosts}) {
  final adapter = dio.httpClientAdapter;
  if (adapter is IOHttpClientAdapter) {
    adapter.createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) {
            if (trustedHosts != null && trustedHosts.isNotEmpty) {
              return trustedHosts.contains(host);
            }
            return _isPrivateNetwork(host);
          };
      return client;
    };
  }
}

bool _isPrivateNetwork(String host) {
  if (host == 'localhost' ||
      host == '127.0.0.1' ||
      host == '::1' ||
      host == '0.0.0.0') {
    return true;
  }

  final parts = host.split('.');
  if (parts.length != 4) return false;

  final first = int.tryParse(parts[0]);
  final second = int.tryParse(parts[1]);
  if (first == null || second == null) return false;

  if (first == 10) return true;
  if (first == 172 && second >= 16 && second <= 31) return true;
  if (first == 192 && second == 168) return true;

  return false;
}
