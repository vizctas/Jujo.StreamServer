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
