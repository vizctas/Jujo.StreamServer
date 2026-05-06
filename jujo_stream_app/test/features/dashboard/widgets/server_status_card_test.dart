import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/models/server_status.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/services/server_connection_racer.dart';
import 'package:jujo_stream_app/core/services/server_status_service.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/server_status_card.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final sampleStatus = ServerStatus(
    name: 'Test Server',
    version: '2025.1.0',
    platform: 'windows',
    startedAtEpoch: 1720000000,
    uptimeSeconds: 7200,
    isStreaming: true,
    rtspSessionCount: 1,
    webrtcActive: false,
    currentAppId: 10,
    pairedClientCount: 2,
    cloudConfigured: true,
  );

  final idleStatus = ServerStatus(
    name: 'Idle Box',
    version: '0.9.0',
    platform: 'linux',
    startedAtEpoch: 1720000000,
    uptimeSeconds: 120,
    isStreaming: false,
    rtspSessionCount: 0,
    webrtcActive: false,
    pairedClientCount: 0,
    cloudConfigured: false,
  );

  Widget buildTestWidget({
    ServerStatus? status,
    bool loading = false,
    ConnectionType? connectionType,
  }) {
    final controller = StreamController<ServerStatus?>();

    // Emit the status after a microtask to simulate async
    if (!loading) {
      Future.microtask(() => controller.add(status));
    }

    return ProviderScope(
      overrides: [
        serverStatusPollingProvider.overrideWith((ref) => controller.stream),
        activeConnectionTypeProvider.overrideWithValue(connectionType),
      ],
      child: const MaterialApp(
        home: Scaffold(
          body: ServerStatusCard(),
        ),
      ),
    );
  }

  group('ServerStatusCard', () {
    testWidgets('shows loading state initially', (tester) async {
      await tester.pumpWidget(buildTestWidget(loading: true));
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Connecting to server...'), findsOneWidget);
    });

    testWidgets('shows server name and version when data arrives', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: sampleStatus));
      await tester.pump(); // Let stream emit
      await tester.pump(); // Rebuild

      expect(find.text('Test Server'), findsOneWidget);
      expect(find.text('v2025.1.0'), findsOneWidget);
    });

    testWidgets('shows uptime formatted', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: sampleStatus));
      await tester.pump();
      await tester.pump();

      // 7200 seconds = 2h 0m
      expect(find.text('2h 0m'), findsOneWidget);
    });

    testWidgets('shows paired client count', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: sampleStatus));
      await tester.pump();
      await tester.pump();

      expect(find.text('2'), findsOneWidget);
    });

    testWidgets('shows streaming state when active', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: sampleStatus));
      await tester.pump();
      await tester.pump();

      expect(find.text('1 stream'), findsOneWidget);
    });

    testWidgets('shows Idle when not streaming', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: idleStatus));
      await tester.pump();
      await tester.pump();

      expect(find.text('Idle'), findsOneWidget);
    });

    testWidgets('shows Cloud badge when configured', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: sampleStatus));
      await tester.pump();
      await tester.pump();

      expect(find.text('Cloud'), findsOneWidget);
    });

    testWidgets('hides Cloud badge when not configured', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: idleStatus));
      await tester.pump();
      await tester.pump();

      expect(find.text('Cloud'), findsNothing);
    });

    testWidgets('shows error state when status is null', (tester) async {
      await tester.pumpWidget(buildTestWidget(status: null));
      await tester.pump();
      await tester.pump();

      expect(find.text('Server unreachable'), findsOneWidget);
    });

    testWidgets('shows LAN badge when connection type is local', (tester) async {
      await tester.pumpWidget(buildTestWidget(
        status: sampleStatus,
        connectionType: ConnectionType.local,
      ));
      await tester.pump();
      await tester.pump();

      expect(find.text('LAN'), findsOneWidget);
    });

    testWidgets('shows WAN badge when connection type is remote', (tester) async {
      await tester.pumpWidget(buildTestWidget(
        status: sampleStatus,
        connectionType: ConnectionType.remote,
      ));
      await tester.pump();
      await tester.pump();

      expect(find.text('WAN'), findsOneWidget);
    });

    testWidgets('shows Relay badge when connection type is relay', (tester) async {
      await tester.pumpWidget(buildTestWidget(
        status: sampleStatus,
        connectionType: ConnectionType.relay,
      ));
      await tester.pump();
      await tester.pump();

      expect(find.text('Relay'), findsOneWidget);
    });

    testWidgets('hides connection badge when type is null', (tester) async {
      await tester.pumpWidget(buildTestWidget(
        status: sampleStatus,
        connectionType: null,
      ));
      await tester.pump();
      await tester.pump();

      expect(find.text('LAN'), findsNothing);
      expect(find.text('WAN'), findsNothing);
      expect(find.text('Relay'), findsNothing);
    });
  });
}
