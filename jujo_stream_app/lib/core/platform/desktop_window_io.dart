import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:window_manager/window_manager.dart';

bool get _isDesktop {
  return defaultTargetPlatform == TargetPlatform.windows ||
      defaultTargetPlatform == TargetPlatform.macOS ||
      defaultTargetPlatform == TargetPlatform.linux;
}

Future<void> configureDesktopWindow() async {
  if (!_isDesktop) return;

  await _registerWindowsUrlProtocol();
  await windowManager.ensureInitialized();

  const windowOptions = WindowOptions(
    size: Size(1280, 800),
    minimumSize: Size(800, 560),
    titleBarStyle: TitleBarStyle.hidden,
    backgroundColor: Color(0xFF0A0A0A),
  );

  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.center();
  });
}

Future<void> _registerWindowsUrlProtocol() async {
  if (defaultTargetPlatform != TargetPlatform.windows) return;

  try {
    final appPath = Platform.resolvedExecutable;
    const root = r'HKCU\Software\Classes\jujostream';
    await Process.run('reg.exe', [
      'add',
      root,
      '/ve',
      '/d',
      'URL:Jujo.Stream Auth',
      '/f',
    ]);
    await Process.run('reg.exe', [
      'add',
      root,
      '/v',
      'URL Protocol',
      '/d',
      '',
      '/f',
    ]);
    await Process.run('reg.exe', [
      'add',
      r'HKCU\Software\Classes\jujostream\shell\open\command',
      '/ve',
      '/d',
      '"$appPath" "%1"',
      '/f',
    ]);
  } catch (_) {
    // Best effort. OAuth can still work on web or with external registration.
  }
}

Future<void> showDesktopWindowAfterFirstFrame() async {
  if (!_isDesktop) return;

  await windowManager.show();
  await windowManager.focus();
}

Future<void> closeAppWindow() async {
  if (_isDesktop) {
    await windowManager.close();
    return;
  }
  await SystemNavigator.pop();
}
