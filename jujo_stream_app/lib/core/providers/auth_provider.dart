import 'dart:async';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/services/cloud_auth_service.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

abstract final class _StorageKeys {
  static const sessionToken = 'jujo_session_token';
  static const refreshToken = 'jujo_refresh_token';
  static const serverUrl = 'jujo_server_url';
  static const username = 'jujo_username';
  static const authMode = 'jujo_auth_mode';
  static const hasPasswordProvider = 'jujo_has_password_provider';
}

enum AuthStatus { unknown, authenticated, unauthenticated }

enum AuthMode { unknown, cloudAccount, localOnly }

class AuthState {
  const AuthState({
    required this.status,
    this.mode = AuthMode.unknown,
    this.token,
    this.serverUrl,
    this.username,
    this.error,
    this.hasPasswordProvider = false,
  });

  const AuthState.initial()
    : status = AuthStatus.unknown,
      mode = AuthMode.unknown,
      token = null,
      serverUrl = null,
      username = null,
      error = null,
      hasPasswordProvider = false;

  final AuthStatus status;
  final AuthMode mode;
  final String? token;
  final String? serverUrl;
  final String? username;
  final String? error;

  /// Whether the user authenticated with email/password (vs OAuth-only).
  /// Used to determine if we can re-verify their password for server bootstrap.
  final bool hasPasswordProvider;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({
    AuthStatus? status,
    AuthMode? mode,
    String? token,
    String? serverUrl,
    String? username,
    String? error,
    bool? hasPasswordProvider,
  }) {
    return AuthState(
      status: status ?? this.status,
      mode: mode ?? this.mode,
      token: token ?? this.token,
      serverUrl: serverUrl ?? this.serverUrl,
      username: username ?? this.username,
      error: error,
      hasPasswordProvider: hasPasswordProvider ?? this.hasPasswordProvider,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> implements TokenProvider {
  AuthNotifier({required this.storage, required this.cloudAuth})
    : super(const AuthState.initial()) {
    _cloudAuthSubscription = cloudAuth.authStateChanges.listen(
      _handleCloudAuthState,
    );
    initialize();
  }

  final FlutterSecureStorage storage;
  final CloudAuthService cloudAuth;
  ApiClient? _apiClient;
  String? _bootstrapPassword;
  late final StreamSubscription<CloudAuthSession?> _cloudAuthSubscription;

  bool get hasServerBootstrapPassword =>
      _bootstrapPassword != null && _bootstrapPassword!.isNotEmpty;

  String? get bootstrapPassword => _bootstrapPassword;

  Future<void> initialize() async {
    final token = await storage.read(key: _StorageKeys.sessionToken);
    final serverUrl = await storage.read(key: _StorageKeys.serverUrl);
    final username = await storage.read(key: _StorageKeys.username);
    final storedMode = _parseAuthMode(
      await storage.read(key: _StorageKeys.authMode),
    );
    final storedHasPassword =
        (await storage.read(key: _StorageKeys.hasPasswordProvider)) == 'true';
    final cloudSession = cloudAuth.currentSession;

    if (token == 'dummy-session-token' || token == 'local-admin-session') {
      await storage.delete(key: _StorageKeys.sessionToken);
      state = AuthState(
        status: cloudSession != null
            ? AuthStatus.authenticated
            : AuthStatus.unauthenticated,
        mode: cloudSession != null ? AuthMode.cloudAccount : AuthMode.unknown,
        serverUrl: serverUrl,
        username: cloudSession?.email ?? username,
      );
      return;
    }

    if (storedMode == AuthMode.localOnly && token != null) {
      state = AuthState(
        status: AuthStatus.authenticated,
        mode: AuthMode.localOnly,
        token: token,
        serverUrl: serverUrl,
        username: username,
        hasPasswordProvider: storedHasPassword,
      );
      return;
    }

    if (cloudAuth.isConfigured) {
      state = AuthState(
        status: cloudSession != null
            ? AuthStatus.authenticated
            : AuthStatus.unauthenticated,
        mode: cloudSession != null ? AuthMode.cloudAccount : AuthMode.unknown,
        token: token,
        serverUrl: serverUrl,
        username: cloudSession?.email ?? username,
        hasPasswordProvider: storedHasPassword,
      );
      return;
    }

    if (token != null) {
      state = AuthState(
        status: AuthStatus.authenticated,
        mode: storedMode,
        token: token,
        serverUrl: serverUrl,
        username: username,
        hasPasswordProvider: storedHasPassword,
      );
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  void setApiClient(ApiClient client) {
    _apiClient = client;
  }

  Future<bool> login({
    required String username,
    required String password,
  }) async {
    try {
      if (username.trim().isEmpty || password.isEmpty) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Username and password are required',
        );
        return false;
      }

      _bootstrapPassword = password;

      if (cloudAuth.isConfigured) {
        final session = await cloudAuth.signInWithPassword(
          email: username.trim(),
          password: password,
        );
        if (session == null) {
          state = state.copyWith(
            status: AuthStatus.unauthenticated,
            error: 'Login failed: Supabase did not return a session',
          );
          return false;
        }
        if (!session.emailConfirmed) {
          await cloudAuth.signOut();
          state = state.copyWith(
            status: AuthStatus.unauthenticated,
            mode: AuthMode.unknown,
            error: 'Confirm your email before signing in.',
          );
          return false;
        }

        final accountName = session.email ?? username.trim();
        await storage.write(key: _StorageKeys.username, value: accountName);
        await storage.write(
          key: _StorageKeys.authMode,
          value: AuthMode.cloudAccount.name,
        );
        await storage.write(
          key: _StorageKeys.hasPasswordProvider,
          value: 'true',
        );

        state = AuthState(
          status: AuthStatus.authenticated,
          mode: AuthMode.cloudAccount,
          token: state.token,
          serverUrl: state.serverUrl,
          username: accountName,
          hasPasswordProvider: true,
        );
        return true;
      }

      final token = _generateSecureToken();
      await storage.write(key: _StorageKeys.sessionToken, value: token);
      await storage.write(key: _StorageKeys.username, value: username.trim());
      await storage.write(
        key: _StorageKeys.authMode,
        value: AuthMode.localOnly.name,
      );
      await storage.write(
        key: _StorageKeys.hasPasswordProvider,
        value: 'true',
      );

      state = AuthState(
        status: AuthStatus.authenticated,
        mode: AuthMode.localOnly,
        token: token,
        serverUrl: state.serverUrl,
        username: username.trim(),
        hasPasswordProvider: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: _authErrorMessage(e, action: 'Login'),
      );
      return false;
    }
  }

  Future<bool> signUp({required String email, required String password}) async {
    try {
      if (email.trim().isEmpty || password.isEmpty) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Email and password are required',
        );
        return false;
      }
      if (!cloudAuth.isConfigured) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Account registration is not configured on this build.',
        );
        return false;
      }

      _bootstrapPassword = password;
      final session = await cloudAuth.signUp(
        email: email.trim(),
        password: password,
        emailRedirectTo: SupabaseConfig.current.emailRedirectTo,
      );

      if (session == null) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          mode: AuthMode.unknown,
          username: email.trim(),
          error:
              'Account created. Check your email to confirm it, then sign in.',
        );
        return false;
      }
      if (!session.emailConfirmed) {
        await cloudAuth.signOut();
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          mode: AuthMode.unknown,
          username: email.trim(),
          error:
              'Account created. Check your email to confirm it, then sign in.',
        );
        return false;
      }

      final accountName = session.email ?? email.trim();
      await storage.write(key: _StorageKeys.username, value: accountName);
      await storage.write(
        key: _StorageKeys.authMode,
        value: AuthMode.cloudAccount.name,
      );

      state = AuthState(
        status: AuthStatus.authenticated,
        mode: AuthMode.cloudAccount,
        token: state.token,
        serverUrl: state.serverUrl,
        username: accountName,
        hasPasswordProvider: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: _authErrorMessage(e, action: 'Sign up'),
      );
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      if (!cloudAuth.isConfigured) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Google login is not configured on this build.',
        );
        return false;
      }
      final launched = await cloudAuth.signInWithGoogle(
        redirectTo: _oauthRedirectTo,
      );
      if (!launched) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Google login could not be opened.',
        );
      }
      return launched;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: _authErrorMessage(e, action: 'Google login'),
      );
      return false;
    }
  }

  Future<bool> sendPasswordResetEmail(String email) async {
    try {
      if (email.trim().isEmpty || !email.contains('@')) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Enter your email before requesting a reset link.',
        );
        return false;
      }
      if (!cloudAuth.isConfigured) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Password reset is not configured on this build.',
        );
        return false;
      }
      await cloudAuth.sendPasswordResetEmail(
        email: email.trim(),
        redirectTo: SupabaseConfig.current.emailRedirectTo,
      );
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Password reset email sent. Check your inbox.',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: _authErrorMessage(e, action: 'Password reset'),
      );
      return false;
    }
  }

  Future<void> setServerBootstrapCredentials({
    String? username,
    required String password,
  }) async {
    _bootstrapPassword = password;
    final cleanUsername = username?.trim();
    if (cleanUsername != null && cleanUsername.isNotEmpty) {
      await storage.write(key: _StorageKeys.username, value: cleanUsername);
      state = state.copyWith(username: cleanUsername);
    }
  }

  /// Validate a password against the user's Supabase account WITHOUT updating
  /// auth state. Returns null on success, or an error message on failure.
  ///
  /// Used by the deploy credential dialog to confirm the user typed their
  /// correct account password before writing it to the server config.
  Future<String?> validateCloudPassword({
    required String email,
    required String password,
  }) async {
    if (!cloudAuth.isConfigured) return 'Cloud auth not configured';
    final config = SupabaseConfig.current;
    try {
      // Use a raw HTTP call instead of the Supabase SDK's signInWithPassword.
      // The SDK method fires onAuthStateChange even for validation-only calls,
      // which triggers GoRouter to navigate away and disposes the dialog context
      // mid-await, causing _dependents.isEmpty assertion crashes.
      final dio = Dio(
        BaseOptions(
          baseUrl: config.url,
          headers: {
            'apikey': config.publishableKey,
            'Content-Type': 'application/json',
          },
          validateStatus: (_) => true,
        ),
      );
      final response = await dio.post<Map<String, dynamic>>(
        '/auth/v1/token',
        queryParameters: {'grant_type': 'password'},
        data: {'email': email, 'password': password},
      );
      if (response.statusCode == 200) {
        _bootstrapPassword = password;
        return null; // success
      }
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return (data['error_description'] as String?)?.trim() ??
            (data['message'] as String?)?.trim() ??
            'Incorrect password';
      }
      return 'Incorrect password';
    } catch (e) {
      return 'Validation failed: $e';
    }
  }

  Future<void> continueWithoutAccount({String? username}) async {
    final displayName = username?.trim().isNotEmpty == true
        ? username!.trim()
        : 'Local user';
    final token = _generateSecureToken();

    await storage.write(key: _StorageKeys.sessionToken, value: token);
    await storage.write(key: _StorageKeys.username, value: displayName);
    await storage.write(
      key: _StorageKeys.authMode,
      value: AuthMode.localOnly.name,
    );

    state = AuthState(
      status: AuthStatus.authenticated,
      mode: AuthMode.localOnly,
      token: token,
      serverUrl: state.serverUrl,
      username: displayName,
    );
  }

  Future<void> logout() async {
    try {
      await _apiClient?.post('/api/auth/logout');
    } catch (_) {
      // Best-effort server logout.
    }

    if (cloudAuth.isConfigured) {
      try {
        await cloudAuth.signOut();
      } catch (_) {
        // Best-effort cloud logout.
      }
    }

    await storage.delete(key: _StorageKeys.sessionToken);
    await storage.delete(key: _StorageKeys.refreshToken);
    await storage.delete(key: _StorageKeys.username);
    await storage.delete(key: _StorageKeys.authMode);

    state = AuthState(
      status: AuthStatus.unauthenticated,
      mode: AuthMode.unknown,
      serverUrl: state.serverUrl,
    );
  }

  Future<void> setServerUrl(String url) async {
    await storage.write(key: _StorageKeys.serverUrl, value: url);
    state = state.copyWith(serverUrl: url);
  }

  Future<String?> bootstrapServerSession({required String serverUrl}) async {
    final username = state.username;
    final password = _bootstrapPassword;
    if (username == null ||
        username.trim().isEmpty ||
        password == null ||
        password.isEmpty) {
      logger.warning(
        'bootstrapServerSession: missing username or password '
        '(username=${username != null ? "present" : "null"}, '
        'password=${password != null ? "present" : "null"})',
      );
      return null;
    }

    try {
      final client = ApiClient(baseUrl: serverUrl, tokenProvider: this);

      // Step 1: Check if credentials are already configured on the server.
      final status = await client.get<Map<String, dynamic>>('/api/auth/status');
      final data = status.data ?? const <String, dynamic>{};
      // ALERT #2 FIX: default to false — if we can't determine, assume setup needed.
      final credentialsConfigured =
          data['credentials_configured'] as bool? ?? false;

      logger.info(
        'bootstrapServerSession: credentials_configured=$credentialsConfigured',
      );

      // Step 2: Create credentials if not configured.
      if (!credentialsConfigured) {
        final create = await client.post<Map<String, dynamic>>(
          '/api/password',
          data: {
            'currentUsername': username,
            'currentPassword': password,
            'newUsername': username,
            'newPassword': password,
            'confirmNewPassword': password,
          },
        );
        if ((create.statusCode ?? 0) >= 400) {
          logger.warning(
            'bootstrapServerSession: POST /api/password failed '
            'status=${create.statusCode}, body=${create.data}',
          );
          return null;
        }

        // ALERT #1 FIX: Verify credentials were actually persisted.
        // The C++ savePassword can silently fail on file write errors.
        await Future<void>.delayed(const Duration(milliseconds: 300));
        final verify = await client.get<Map<String, dynamic>>(
          '/api/auth/status',
        );
        final verifyData = verify.data ?? const <String, dynamic>{};
        final verified = verifyData['credentials_configured'] as bool? ?? false;
        if (!verified) {
          logger.warning(
            'bootstrapServerSession: credentials creation reported success '
            'but /api/auth/status still shows credentials_configured=false. '
            'Possible file write failure on the server.',
          );
          return null;
        }
      }

      // Step 3: Login with the credentials.
      final token = await testServerConnection(
        serverUrl: serverUrl,
        username: username,
        password: password,
      );
      if (token == null || token.isEmpty) {
        logger.warning(
          'bootstrapServerSession: testServerConnection returned null/empty '
          'for user=$username on $serverUrl',
        );
        return null;
      }

      await switchProfile(
        serverUrl: serverUrl,
        token: token,
        username: username,
      );
      return token;
    } catch (e, st) {
      // ALERT #3 FIX: Log the actual exception instead of swallowing silently.
      logger.error(
        'bootstrapServerSession: unhandled exception',
        error: e,
        stackTrace: st,
      );
      return null;
    }
  }

  Future<void> switchProfile({
    required String serverUrl,
    required String token,
    String? username,
  }) async {
    _apiClient?.updateBaseUrl(serverUrl);
    await storage.write(key: _StorageKeys.sessionToken, value: token);
    await storage.write(key: _StorageKeys.serverUrl, value: serverUrl);
    if (username != null) {
      await storage.write(key: _StorageKeys.username, value: username);
    }
    state = AuthState(
      status: AuthStatus.authenticated,
      mode: state.mode,
      token: token,
      serverUrl: serverUrl,
      username: username ?? state.username,
    );
  }

  @override
  Future<String?> getToken() async => state.token;

  @override
  Future<void> onTokenExpired() async {
    await storage.delete(key: _StorageKeys.sessionToken);

    // Attempt a silent refresh before falling back to an error state.
    // The server issues a refresh token (7-day TTL) alongside every session token.
    final storedRefreshToken = await storage.read(
      key: _StorageKeys.refreshToken,
    );
    final serverUrl = state.serverUrl;
    if (storedRefreshToken != null &&
        storedRefreshToken.isNotEmpty &&
        serverUrl != null &&
        serverUrl.isNotEmpty) {
      // Delete BEFORE the network call: if the refresh endpoint returns 401,
      // AuthInterceptor.onError will invoke onTokenExpired() again.  With the
      // token already gone the recursive call sees null and exits immediately,
      // preventing an infinite loop.
      await storage.delete(key: _StorageKeys.refreshToken);
      try {
        final client = ApiClient(baseUrl: serverUrl, tokenProvider: this);
        final response = await client.post<Map<String, dynamic>>(
          '/api/auth/refresh',
          data: {'refresh_token': storedRefreshToken},
        );
        if ((response.statusCode ?? 0) == 200 && response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          final newToken = data['token'] as String?;
          final newRefreshToken = data['refresh_token'] as String?;
          if (newToken != null && newToken.isNotEmpty) {
            await storage.write(
              key: _StorageKeys.sessionToken,
              value: newToken,
            );
            if (newRefreshToken != null && newRefreshToken.isNotEmpty) {
              await storage.write(
                key: _StorageKeys.refreshToken,
                value: newRefreshToken,
              );
            }
            state = state.copyWith(token: newToken, error: null);
            return; // Silent refresh succeeded — stay connected.
          }
        }
      } catch (_) {
        // Refresh failed — fall through to error state below.
      }
    }

    final cloudSession = cloudAuth.currentSession;
    if (cloudSession != null) {
      state = AuthState(
        status: AuthStatus.authenticated,
        mode: AuthMode.cloudAccount,
        serverUrl: state.serverUrl,
        username: cloudSession.email ?? state.username,
        error: 'Server session expired. Please reconnect to this server.',
      );
      return;
    }

    state = AuthState(
      status: AuthStatus.unauthenticated,
      mode: AuthMode.unknown,
      serverUrl: state.serverUrl,
      username: state.username,
      error: 'Session expired. Please log in again.',
    );
  }

  Future<String?> testServerConnection({
    required String serverUrl,
    required String username,
    required String password,
  }) async {
    try {
      final client = ApiClient(baseUrl: serverUrl, tokenProvider: this);
      final response = await client.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {'username': username, 'password': password},
      );
      if ((response.statusCode ?? 0) == 200) {
        // Persist the refresh token so onTokenExpired can silently renew the session.
        if (response.data is Map) {
          final rt =
              (response.data as Map<String, dynamic>)['refresh_token']
                  as String?;
          if (rt != null && rt.isNotEmpty) {
            await storage.write(key: _StorageKeys.refreshToken, value: rt);
          }
        }
        return _extractToken(response);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  String? _extractToken(dynamic response) {
    if (response?.data is Map) {
      final data = response.data as Map<String, dynamic>;
      if (data.containsKey('token')) return data['token'] as String?;
    }
    return null;
  }

  Future<void> _handleCloudAuthState(CloudAuthSession? session) async {
    if (!cloudAuth.isConfigured) return;

    final serverUrl =
        await storage.read(key: _StorageKeys.serverUrl) ?? state.serverUrl;
    final serverToken = await storage.read(key: _StorageKeys.sessionToken);

    if (session == null) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        mode: AuthMode.unknown,
        serverUrl: serverUrl,
        username: state.username,
      );
      return;
    }
    if (!session.emailConfirmed) {
      await cloudAuth.signOut();
      state = AuthState(
        status: AuthStatus.unauthenticated,
        mode: AuthMode.unknown,
        serverUrl: serverUrl,
        username: session.email ?? state.username,
        error: 'Confirm your email before signing in.',
      );
      return;
    }

    final accountName = session.email ?? state.username;
    if (session.email != null && session.email!.isNotEmpty) {
      await storage.write(key: _StorageKeys.username, value: session.email!);
    }

    state = AuthState(
      status: AuthStatus.authenticated,
      mode: AuthMode.cloudAccount,
      token: serverToken,
      serverUrl: serverUrl,
      username: accountName,
    );
  }

  @override
  void dispose() {
    _cloudAuthSubscription.cancel();
    super.dispose();
  }

  AuthMode _parseAuthMode(String? value) {
    return AuthMode.values.firstWhere(
      (mode) => mode.name == value,
      orElse: () => AuthMode.unknown,
    );
  }

  String get _oauthRedirectTo {
    if (SupabaseConfig.current.oauthRedirectTo != null) {
      return SupabaseConfig.current.oauthRedirectTo!;
    }
    if (kIsWeb && SupabaseConfig.current.emailRedirectTo != null) {
      return SupabaseConfig.current.emailRedirectTo!;
    }
    return 'jujostream://auth/callback';
  }

  /// Generate a cryptographically random local session token.
  /// Replaces the predictable timestamp-based pattern.
  static String _generateSecureToken() {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return 'local-$hex';
  }

  String _authErrorMessage(Object error, {required String action}) {
    if (error is AuthApiException) {
      final message = error.message.toLowerCase();
      final code = error.code?.toLowerCase() ?? '';
      if (code.contains('captcha') || message.contains('captcha')) {
        return '$action blocked by captcha. Use Google login, or disable captcha in Supabase while we finish native captcha UI.';
      }
      return '$action failed: ${error.message}';
    }
    if (error is AuthException) {
      return '$action failed: ${error.message}';
    }
    return '$action failed: ${error.toString()}';
  }
}

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final storage = ref.watch(secureStorageProvider);
  final cloudAuth = ref.watch(cloudAuthServiceProvider);
  return AuthNotifier(storage: storage, cloudAuth: cloudAuth);
});
