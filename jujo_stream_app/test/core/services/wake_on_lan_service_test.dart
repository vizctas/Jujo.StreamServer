import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:jujo_stream_app/core/services/wake_on_lan_service.dart';

void main() {
  group('WakeOnLanService', () {
    group('isValidMac', () {
      test('accepts colon-separated MAC', () {
        expect(WakeOnLanService.isValidMac('AA:BB:CC:DD:EE:FF'), true);
        expect(WakeOnLanService.isValidMac('00:11:22:33:44:55'), true);
        expect(WakeOnLanService.isValidMac('aa:bb:cc:dd:ee:ff'), true);
      });

      test('accepts dash-separated MAC', () {
        expect(WakeOnLanService.isValidMac('AA-BB-CC-DD-EE-FF'), true);
        expect(WakeOnLanService.isValidMac('00-11-22-33-44-55'), true);
      });

      test('rejects invalid MACs', () {
        expect(WakeOnLanService.isValidMac(''), false);
        expect(WakeOnLanService.isValidMac('AA:BB:CC:DD:EE'), false);
        expect(WakeOnLanService.isValidMac('AA:BB:CC:DD:EE:GG'), false);
        expect(WakeOnLanService.isValidMac('AABBCCDDEEFF'), false);
        expect(WakeOnLanService.isValidMac('not-a-mac'), false);
      });
    });

    group('_parseMac', () {
      test('parses colon-separated MAC to bytes', () {
        // Access via the static helper exposed for testing
        final bytes = WakeOnLanService.parseMacForTest('AA:BB:CC:DD:EE:FF');
        expect(bytes, Uint8List.fromList([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]));
      });

      test('parses dash-separated MAC to bytes', () {
        final bytes = WakeOnLanService.parseMacForTest('01-23-45-67-89-AB');
        expect(bytes, Uint8List.fromList([0x01, 0x23, 0x45, 0x67, 0x89, 0xAB]));
      });
    });

    group('_buildMagicPacket', () {
      test('builds 102-byte packet with correct structure', () {
        final mac = Uint8List.fromList([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
        final packet = WakeOnLanService.buildMagicPacketForTest(mac);

        expect(packet.length, 102);

        // First 6 bytes are 0xFF
        for (var i = 0; i < 6; i++) {
          expect(packet[i], 0xFF, reason: 'byte $i should be 0xFF');
        }

        // Next 96 bytes are MAC repeated 16 times
        for (var rep = 0; rep < 16; rep++) {
          for (var b = 0; b < 6; b++) {
            final idx = 6 + rep * 6 + b;
            expect(packet[idx], mac[b], reason: 'byte $idx (rep $rep, byte $b)');
          }
        }
      });
    });

    group('wakeDirect', () {
      test('rejects invalid MAC without sending', () async {
        final service = WakeOnLanService();
        final result = await service.wakeDirect(mac: 'invalid');
        expect(result.success, false);
        expect(result.error, contains('Invalid MAC'));
      });
    });

    group('wakeViaServer', () {
      test('fails gracefully when no baseUrl configured', () async {
        final service = WakeOnLanService();
        final result = await service.wakeViaServer(mac: 'AA:BB:CC:DD:EE:FF');
        expect(result.success, false);
        expect(result.error, contains('No server URL'));
      });
    });

    group('WolResult', () {
      test('success result', () {
        const result = WolResult(success: true, mac: 'AA:BB:CC:DD:EE:FF');
        expect(result.success, true);
        expect(result.mac, 'AA:BB:CC:DD:EE:FF');
        expect(result.error, isNull);
      });

      test('failure result', () {
        const result = WolResult(
          success: false,
          mac: 'AA:BB:CC:DD:EE:FF',
          error: 'Socket error',
        );
        expect(result.success, false);
        expect(result.error, 'Socket error');
      });
    });
  });
}
