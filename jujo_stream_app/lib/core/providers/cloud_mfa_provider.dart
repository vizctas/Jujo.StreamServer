import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

import 'auth_provider.dart';

enum CloudMfaStatus {
  unknown,
  loading,
  satisfied,
  setupRequired,
  verifyRequired,
  unavailable,
  error,
}

class CloudMfaState {
  const CloudMfaState({
    required this.status,
    this.verifiedFactorId,
    this.enrollmentFactorId,
    this.enrollmentUri,
    this.enrollmentSecret,
    this.error,
  });

  const CloudMfaState.unknown()
    : status = CloudMfaStatus.unknown,
      verifiedFactorId = null,
      enrollmentFactorId = null,
      enrollmentUri = null,
      enrollmentSecret = null,
      error = null;

  final CloudMfaStatus status;
  final String? verifiedFactorId;
  final String? enrollmentFactorId;
  final String? enrollmentUri;
  final String? enrollmentSecret;
  final String? error;

  bool get isSatisfied => status == CloudMfaStatus.satisfied;
  bool get blocksCloudUser =>
      status == CloudMfaStatus.unknown ||
      status == CloudMfaStatus.loading ||
      status == CloudMfaStatus.setupRequired ||
      status == CloudMfaStatus.verifyRequired ||
      status == CloudMfaStatus.error;

  CloudMfaState copyWith({
    CloudMfaStatus? status,
    String? verifiedFactorId,
    String? enrollmentFactorId,
    String? enrollmentUri,
    String? enrollmentSecret,
    String? error,
    bool clearEnrollment = false,
  }) {
    return CloudMfaState(
      status: status ?? this.status,
      verifiedFactorId: verifiedFactorId ?? this.verifiedFactorId,
      enrollmentFactorId: clearEnrollment
          ? null
          : enrollmentFactorId ?? this.enrollmentFactorId,
      enrollmentUri: clearEnrollment
          ? null
          : enrollmentUri ?? this.enrollmentUri,
      enrollmentSecret: clearEnrollment
          ? null
          : enrollmentSecret ?? this.enrollmentSecret,
      error: error,
    );
  }
}

class CloudMfaNotifier extends StateNotifier<CloudMfaState> {
  CloudMfaNotifier(this.ref) : super(const CloudMfaState.unknown()) {
    _authSub = ref.listen<AuthState>(
      authProvider,
      (_, next) => _syncForAuth(next),
      fireImmediately: true,
    );
  }

  final Ref ref;
  late final ProviderSubscription<AuthState> _authSub;

  SupabaseClient get _client => Supabase.instance.client;

  Future<void> refresh() async {
    final auth = ref.read(authProvider);
    if (auth.mode != AuthMode.cloudAccount || !auth.isAuthenticated) {
      state = const CloudMfaState(status: CloudMfaStatus.unavailable);
      return;
    }

    state = state.copyWith(status: CloudMfaStatus.loading, error: null);
    try {
      final aal = _client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.currentLevel == AuthenticatorAssuranceLevels.aal2) {
        state = const CloudMfaState(status: CloudMfaStatus.satisfied);
        return;
      }

      final factors = await _client.auth.mfa.listFactors();
      if (factors.totp.isNotEmpty) {
        state = CloudMfaState(
          status: CloudMfaStatus.verifyRequired,
          verifiedFactorId: factors.totp.first.id,
        );
        return;
      }

      state = const CloudMfaState(status: CloudMfaStatus.setupRequired);
    } catch (e) {
      state = CloudMfaState(
        status: CloudMfaStatus.error,
        error: 'Could not check 2FA status: $e',
      );
    }
  }

  Future<void> startTotpSetup() async {
    state = state.copyWith(status: CloudMfaStatus.loading, error: null);
    try {
      final res = await _client.auth.mfa.enroll(
        factorType: FactorType.totp,
        issuer: 'Jujo.Stream',
        friendlyName: 'Jujo.Stream Server',
      );
      state = CloudMfaState(
        status: CloudMfaStatus.setupRequired,
        enrollmentFactorId: res.id,
        enrollmentUri: res.totp?.uri,
        enrollmentSecret: res.totp?.secret,
      );
    } catch (e) {
      state = CloudMfaState(
        status: CloudMfaStatus.error,
        error: 'Could not start 2FA setup: $e',
      );
    }
  }

  Future<bool> verifyCode(String code) async {
    final cleanCode = code.trim().replaceAll(' ', '');
    if (cleanCode.length < 6) {
      state = state.copyWith(error: 'Enter the 6-digit authenticator code.');
      return false;
    }

    final factorId = state.enrollmentFactorId ?? state.verifiedFactorId;
    if (factorId == null || factorId.isEmpty) {
      await refresh();
      return false;
    }

    state = state.copyWith(status: CloudMfaStatus.loading, error: null);
    try {
      await _client.auth.mfa.challengeAndVerify(
        factorId: factorId,
        code: cleanCode,
      );
      state = const CloudMfaState(status: CloudMfaStatus.satisfied);
      return true;
    } catch (e) {
      state = CloudMfaState(
        status: state.enrollmentFactorId == null
            ? CloudMfaStatus.verifyRequired
            : CloudMfaStatus.setupRequired,
        verifiedFactorId: state.verifiedFactorId,
        enrollmentFactorId: state.enrollmentFactorId,
        enrollmentUri: state.enrollmentUri,
        enrollmentSecret: state.enrollmentSecret,
        error: 'Invalid 2FA code. Try again.',
      );
      return false;
    }
  }

  Future<void> _syncForAuth(AuthState auth) async {
    if (auth.mode == AuthMode.cloudAccount && auth.isAuthenticated) {
      await refresh();
    } else {
      state = const CloudMfaState(status: CloudMfaStatus.unavailable);
    }
  }

  @override
  void dispose() {
    _authSub.close();
    super.dispose();
  }
}

final cloudMfaProvider = StateNotifierProvider<CloudMfaNotifier, CloudMfaState>(
  (ref) {
    return CloudMfaNotifier(ref);
  },
);
