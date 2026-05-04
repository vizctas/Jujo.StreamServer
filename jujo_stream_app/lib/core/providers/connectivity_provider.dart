import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Connectivity state for the app.
enum AppConnectivity { online, offline, unknown }

/// Provides real-time network connectivity status.
final connectivityProvider =
    StateNotifierProvider<ConnectivityNotifier, AppConnectivity>((ref) {
  return ConnectivityNotifier();
});

class ConnectivityNotifier extends StateNotifier<AppConnectivity> {
  ConnectivityNotifier() : super(AppConnectivity.unknown) {
    _init();
  }

  StreamSubscription<List<ConnectivityResult>>? _subscription;

  void _init() {
    // Check initial state
    Connectivity().checkConnectivity().then(_update);
    // Listen for changes
    _subscription = Connectivity().onConnectivityChanged.listen(_update);
  }

  void _update(List<ConnectivityResult> results) {
    if (results.contains(ConnectivityResult.none) || results.isEmpty) {
      state = AppConnectivity.offline;
    } else {
      state = AppConnectivity.online;
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
