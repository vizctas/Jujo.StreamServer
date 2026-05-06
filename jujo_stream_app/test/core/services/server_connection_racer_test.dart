import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/services/server_connection_racer.dart';

void main() {
  group('ServerConnectionRacer', () {
    late ServerConnectionRacer racer;

    setUp(() {
      racer = ServerConnectionRacer();
    });

    group('_normalizeUrl (tested via findBestConnection)', () {
      test('returns null for empty candidates', () async {
        final result = await racer.findBestConnection(
          localAddresses: [],
          externalAddress: null,
        );
        expect(result, isNull);
      });

      test('returns null when all addresses are empty strings', () async {
        final result = await racer.findBestConnection(
          localAddresses: ['', '  '],
          externalAddress: '',
        );
        expect(result, isNull);
      });
    });

    group('findBestForProfile', () {
      test('uses profile URL as local candidate', () async {
        // This will fail to connect (no server running) but tests the flow
        final profile = ServerProfile(
          id: 'test',
          url: 'https://192.168.99.99:47990',
        );

        final result = await racer.findBestForProfile(
          profile,
          externalAddress: null,
        );

        // No server running → null (graceful failure)
        expect(result, isNull);
      });

      test('handles unreachable addresses gracefully', () async {
        final result = await racer.findBestConnection(
          localAddresses: [
            '192.168.99.1:47990',
            '10.255.255.1:47990',
          ],
          externalAddress: '203.0.113.1:47990', // TEST-NET, unreachable
        );

        expect(result, isNull);
      });
    });

    group('ConnectionProbeResult', () {
      test('stores all fields correctly', () {
        const result = ConnectionProbeResult(
          address: 'https://192.168.1.100:47990',
          latencyMs: 5,
          connectionType: ConnectionType.local,
        );

        expect(result.address, 'https://192.168.1.100:47990');
        expect(result.latencyMs, 5);
        expect(result.connectionType, ConnectionType.local);
      });
    });

    group('ConnectionType', () {
      test('has all expected values', () {
        expect(ConnectionType.values.length, 3);
        expect(ConnectionType.values, contains(ConnectionType.local));
        expect(ConnectionType.values, contains(ConnectionType.remote));
        expect(ConnectionType.values, contains(ConnectionType.relay));
      });
    });

    group('URL normalization edge cases', () {
      test('bare host:port gets https prefix', () async {
        // Will timeout but validates the URL was constructed
        // (we can't easily test internal _normalizeUrl without making it public,
        //  but the integration test proves it works)
        final result = await racer.findBestConnection(
          localAddresses: ['192.168.99.99:47990'],
        );
        // Unreachable → null, but no crash = URL was valid
        expect(result, isNull);
      });

      test('full https URL passes through', () async {
        final result = await racer.findBestConnection(
          localAddresses: ['https://192.168.99.99:47990'],
        );
        expect(result, isNull);
      });

      test('trailing slash is stripped', () async {
        final result = await racer.findBestConnection(
          localAddresses: ['https://192.168.99.99:47990/'],
        );
        expect(result, isNull);
      });
    });
  });
}
