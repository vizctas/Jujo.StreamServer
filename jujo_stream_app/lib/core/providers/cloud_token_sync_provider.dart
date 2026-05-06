import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supa;

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/config_api.dart';
import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// Watches Supabase auth state and pushes fresh `cloud_user_token` to all
/// reachable servers whenever the JWT is refreshed.
///
/// Without this, the server's cloud agent stops heartbeating after the initial
/// JWT expires (~1h default Supabase TTL).
final cloudTokenSyncProvider = Provider<CloudTokenSyncService>((ref) {
  final service = CloudTokenSyncService(ref);
  ref.onDispose(service.dispose);
  return service;
});

class CloudTokenSyncService {
  CloudTokenSyncService(this._ref) {
    if (!SupabaseConfig.current.isConfigured) return;
    _subscription =
        supa.Supabase.instance.client.auth.onAuthStateChange.listen(
      _onAuthStateChange,
    );
  }

  final Ref _ref;
  StreamSubscription<supa.AuthState>? _subscription;
  bool _pushing = false;

  void _onAuthStateChange(supa.AuthState data) {
    // Only act on token refresh or sign-in events
    if (data.event == supa.AuthChangeEvent.tokenRefreshed ||
        data.event == supa.AuthChangeEvent.signedIn) {
      final token = data.session?.accessToken;
      if (token != null && token.isNotEmpty) {
        _pushTokenToAllServers(token);
      }
    }
  }

  /// Best-effort push of fresh cloud_user_token to all known server profiles.
  Future<void> _pushTokenToAllServers(String token) async {
    if (_pushing) return; // debounce concurrent pushes
    _pushing = true;

    try {
      final profiles = _ref.read(serverProfilesProvider).profiles;
      if (profiles.isEmpty) return;

      final authNotifier = _ref.read(authProvider.notifier);

      for (final profile in profiles) {
        final url = profile.url;
        if (url.isEmpty) continue;

        try {
          final client = ApiClient(
            baseUrl: url,
            tokenProvider: authNotifier,
          );
          final configApi = ConfigApi(client: client);
          await configApi.applyConfig({'cloud_user_token': token});
          logger.info('CloudTokenSync: pushed fresh token to $url');
        } catch (e) {
          // Best-effort — server may be offline or unreachable
          debugPrint('CloudTokenSync: failed to push token to $url: $e');
        }
      }
    } finally {
      _pushing = false;
    }
  }

  void dispose() {
    _subscription?.cancel();
  }
}
