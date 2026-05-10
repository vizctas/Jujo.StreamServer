import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/app_launch_api.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

/// State for a single app launch operation.
enum LaunchStatus { idle, launching, success, error }

class AppLaunchState {
  const AppLaunchState({
    this.status = LaunchStatus.idle,
    this.launchingApp,
    this.errorMessage,
  });

  final LaunchStatus status;
  final String? launchingApp;
  final String? errorMessage;

  bool get isLaunching => status == LaunchStatus.launching;
}

/// Notifier that manages app launch state.
///
/// Usage:
/// ```dart
/// ref.read(appLaunchProvider.notifier).launch('My Game');
/// ```
class AppLaunchNotifier extends StateNotifier<AppLaunchState> {
  AppLaunchNotifier(this._ref) : super(const AppLaunchState());

  final Ref _ref;

  /// Launch an app by name. Resets state after 2 seconds on success/error.
  Future<bool> launch(String appName) async {
    return _launch(appName);
  }

  Future<bool> launchGame(GameDto game) {
    return _launch(game.name, uuid: game.uuid, index: game.index);
  }

  Future<bool> _launch(String appName, {String? uuid, int? index}) async {
    state = AppLaunchState(
      status: LaunchStatus.launching,
      launchingApp: appName,
    );

    final authNotifier = _ref.read(authProvider.notifier);
    final serverUrl = _ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final api = AppLaunchApi(client: client);

    final success = await api.launch(appName, uuid: uuid, index: index);

    if (success) {
      state = AppLaunchState(
        status: LaunchStatus.success,
        launchingApp: appName,
      );
    } else {
      state = AppLaunchState(
        status: LaunchStatus.error,
        launchingApp: appName,
        errorMessage: 'Failed to launch $appName',
      );
    }

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        state = const AppLaunchState();
      }
    });

    return success;
  }

  /// Force-close the currently running app.
  Future<bool> closeApp() async {
    final authNotifier = _ref.read(authProvider.notifier);
    final serverUrl = _ref.read(authProvider).serverUrl ?? '';
    final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
    final api = AppLaunchApi(client: client);
    return api.close();
  }
}

final appLaunchProvider =
    StateNotifierProvider<AppLaunchNotifier, AppLaunchState>((ref) {
      return AppLaunchNotifier(ref);
    });

/// Whether a specific app is currently being launched.
final isLaunchingAppProvider = Provider.family<bool, String>((ref, appName) {
  final state = ref.watch(appLaunchProvider);
  return state.isLaunching && state.launchingApp == appName;
});
