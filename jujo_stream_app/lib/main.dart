import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:window_manager/window_manager.dart';

import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
    await windowManager.ensureInitialized();

    const windowOptions = WindowOptions(
      size: Size(1280, 800),
      minimumSize: Size(800, 560),
      titleBarStyle: TitleBarStyle.hidden,
      // Solid dark background — NOT transparent.
      // Transparent causes black flash on Windows because the native window
      // renders before Flutter paints its first frame.
      backgroundColor: Color(0xFF0A0A0A),
    );

    // Configure window options but do NOT show yet.
    await windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.center();
      // Window will be shown after Flutter's first frame — see below.
    });
  }

  runApp(
    const ProviderScope(
      child: _FirstFrameShow(child: JujoStreamApp()),
    ),
  );
}

/// Defers [windowManager.show] until after the first frame is fully painted.
/// This eliminates the black-screen flash on Windows desktop.
class _FirstFrameShow extends StatefulWidget {
  const _FirstFrameShow({required this.child});
  final Widget child;

  @override
  State<_FirstFrameShow> createState() => _FirstFrameShowState();
}

class _FirstFrameShowState extends State<_FirstFrameShow> {
  @override
  void initState() {
    super.initState();
    if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await windowManager.show();
        await windowManager.focus();
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
