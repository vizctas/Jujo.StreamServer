import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/config_api.dart';
import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/services/cloud_auth_service.dart';

class CloudServerRegistrationResult {
  const CloudServerRegistrationResult({
    required this.success,
    this.restarted = false,
    this.message,
  });

  final bool success;
  final bool restarted;
  final String? message;
}

class CloudServerRegistrationService {
  CloudServerRegistrationService(this._ref);

  final Ref _ref;

  Future<CloudServerRegistrationResult> registerActiveServer() async {
    if (!SupabaseConfig.current.isConfigured) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Cloud is not configured in this build.',
      );
    }

    final auth = _ref.read(authProvider);
    if (auth.mode != AuthMode.cloudAccount) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Sign in to Jujo Cloud first.',
      );
    }

    final serverUrl = auth.serverUrl;
    if (serverUrl == null || serverUrl.isEmpty) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Connect to a server first.',
      );
    }

    final accessToken =
        _ref.read(cloudAuthServiceProvider).currentSession?.accessToken ??
        Supabase.instance.client.auth.currentSession?.accessToken;
    if (accessToken == null || accessToken.isEmpty) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Cloud session expired. Sign in again.',
      );
    }

    final api = ConfigApi(
      client: ApiClient(
        baseUrl: serverUrl,
        tokenProvider: _ref.read(authProvider.notifier),
      ),
    );

    final applied = await api.applyConfig({
      'cloud_supabase_url': SupabaseConfig.current.url,
      'cloud_supabase_key': SupabaseConfig.current.publishableKey,
      'cloud_user_token': accessToken,
      'cloud_heartbeat_interval': 60,
    });

    if (!applied.success) {
      return CloudServerRegistrationResult(
        success: false,
        message: applied.message ?? 'Cloud registration failed.',
      );
    }

    // First cloud enable needs a process restart so the native server builds
    // its publishable identity and starts the CloudAgent heartbeat.
    final restarted = await api.restart();

    return CloudServerRegistrationResult(
      success: true,
      restarted: restarted,
      message: restarted
          ? 'Cloud sync saved. Server is restarting to publish itself.'
          : 'Cloud sync saved. Restart the server to publish it to your devices.',
    );
  }

  Future<CloudServerRegistrationResult> unregisterActiveServer() async {
    if (!SupabaseConfig.current.isConfigured) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Cloud is not configured in this build.',
      );
    }

    final auth = _ref.read(authProvider);
    if (auth.mode != AuthMode.cloudAccount) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Sign in to Jujo Cloud first.',
      );
    }

    final serverUrl = auth.serverUrl;
    if (serverUrl == null || serverUrl.isEmpty) {
      return const CloudServerRegistrationResult(
        success: false,
        message: 'Connect to a server first.',
      );
    }

    final api = ConfigApi(
      client: ApiClient(
        baseUrl: serverUrl,
        tokenProvider: _ref.read(authProvider.notifier),
      ),
    );

    final result = await api.unregisterCloud();

    if (!result.success) {
      return CloudServerRegistrationResult(
        success: false,
        message: result.message ?? 'Cloud unregistration failed.',
      );
    }

    final restarted = await api.restart();

    return CloudServerRegistrationResult(
      success: true,
      restarted: restarted,
      message: restarted
          ? 'Server unregistered from cloud. Restarting...'
          : 'Server unregistered from cloud. Restart to complete.',
    );
  }
}

final cloudServerRegistrationServiceProvider =
    Provider<CloudServerRegistrationService>((ref) {
      return CloudServerRegistrationService(ref);
    });
