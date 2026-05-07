import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:jujo_stream_app/core/models/streaming_session.dart';
import 'package:jujo_stream_app/core/services/streaming_sessions_service.dart';
import 'package:jujo_stream_app/features/dashboard/widgets/streaming_sessions_card.dart';

void main() {
  group('StreamingSession model', () {
    test('fromJson parses full response', () {
      final json = {
        'id': 'abc12345-6789-0000-1111-222233334444',
        'audio': true,
        'video': true,
        'encoded': true,
        'audio_packets': 15000,
        'video_packets': 45000,
        'audio_dropped': 2,
        'video_dropped': 5,
        'width': 1920,
        'height': 1080,
        'fps': 60,
        'bitrate_kbps': 20000,
        'codec': 'H.265',
        'hdr': true,
        'audio_channels': 2,
        'audio_codec': 'opus',
        'profile': 'main',
      };
      final s = StreamingSession.fromJson(json);
      expect(s.id, 'abc12345-6789-0000-1111-222233334444');
      expect(s.video, true);
      expect(s.width, 1920);
      expect(s.fps, 60);
      expect(s.codec, 'H.265');
      expect(s.hdr, true);
    });

    test('fromJson handles missing optional fields', () {
      final s = StreamingSession.fromJson({'id': 'x'});
      expect(s.audio, false);
      expect(s.width, isNull);
      expect(s.audioPackets, 0);
    });
  });

  group('StreamingSessionsCard', () {
    testWidgets('empty state', (t) async {
      await t.pumpWidget(ProviderScope(
        overrides: [
          streamingSessionsProvider.overrideWith((ref) => Stream.value(<StreamingSession>[])),
        ],
        child: const MaterialApp(home: Scaffold(body: StreamingSessionsCard())),
      ));
      await t.pumpAndSettle();
      expect(find.text('Active Sessions'), findsOneWidget);
      expect(find.text('No active streaming sessions'), findsOneWidget);
    });

    testWidgets('shows active session stats', (t) async {
      await t.pumpWidget(ProviderScope(
        overrides: [
          streamingSessionsProvider.overrideWith((ref) => Stream.value([
            const StreamingSession(
              id: 'abc12345-6789-0000-1111-222233334444',
              video: true, width: 1920, height: 1080, fps: 60,
              bitrateKbps: 20000, codec: 'H.265', hdr: true,
            ),
          ])),
        ],
        child: const MaterialApp(home: Scaffold(body: SingleChildScrollView(child: StreamingSessionsCard()))),
      ));
      await t.pumpAndSettle();
      expect(find.text('1 active'), findsOneWidget);
      expect(find.text('60 FPS'), findsOneWidget);
      expect(find.text('H.265'), findsOneWidget);
      expect(find.text('HDR'), findsOneWidget);
    });

    testWidgets('shows dropped packets warning', (t) async {
      await t.pumpWidget(ProviderScope(
        overrides: [
          streamingSessionsProvider.overrideWith((ref) => Stream.value([
            const StreamingSession(
              id: 'abc12345-6789-0000-1111-222233334444',
              video: true, videoDropped: 10, audioDropped: 3,
            ),
          ])),
        ],
        child: const MaterialApp(home: Scaffold(body: SingleChildScrollView(child: StreamingSessionsCard()))),
      ));
      await t.pumpAndSettle();
      expect(find.textContaining('13 dropped'), findsOneWidget);
    });
  });
}
