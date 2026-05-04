import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';

/// Keys for secure storage.
abstract final class _StorageKeys {
  static const sessionToken = 'jujo_session_token';
  static const serverUrl = 'jujo_server_url';
  static const username = 'jujo_username';
}

/// Authentication state.
enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    required this.status,
    this.token,
    this.serverUrl,
    this.username,
    this.error,
  });

  const AuthState.initial()
    : status = AuthStatus.unknown,
      token = null,
      serverUrl = null,
      username = null,
      error = null;

  final AuthStatus status;
  final String? token;
  final String? serverUrl;
  final String? username;
  final String? error;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    String? serverUrl,
    String? username,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      serverUrl: serverUrl ?? this.serverUrl,
      username: username ?? this.username,
      error: error,
    );
  }
}

/// Auth notifier — manages login, logout, token persistence.
class AuthNotifier extends StateNotifier<AuthState> implements TokenProvider {
  AuthNotifier({required this.storage}) : super(const AuthState.initial()) {
    initialize();
  }

  final FlutterSecureStorage storage;
  ApiClient? _apiClient;

  /// Initialize: check for persisted session.
  Future<void> initialize() async {
    final token = await storage.read(key: _StorageKeys.sessionToken);
    final serverUrl = await storage.read(key: _StorageKeys.serverUrl);
    final username = await storage.read(key: _StorageKeys.username);

    // Never auto-resume local/dummy sessions — these are not real server
    // tokens and should require the user to log in again each launch.
    if (token == 'dummy-session-token' || token == 'local-admin-session') {
      await storage.delete(key: _StorageKeys.sessionToken);
      state = AuthState(
        status: AuthStatus.unauthenticated,
        serverUrl: serverUrl,
        username: username,
      );
      return;
    }

    if (token != null) {
      state = AuthState(
        status: AuthStatus.authenticated,
        token: token,
        serverUrl: serverUrl,
        username: username,
      );
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  /// Set the API client reference (for making auth calls).
  void setApiClient(ApiClient client) {
    _apiClient = client;
  }

  /// Sign in to the Flutter admin app without contacting a stream server.
  ///
  /// Server discovery/connection happens after the user is inside the app.
  Future<bool> loginLocally({
    required String username,
    required String password,
  }) async {
    if (username.trim().isEmpty || password.isEmpty) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Username and password are required',
      );
      return false;
    }

    const localToken = 'local-admin-session';
    await storage.write(key: _StorageKeys.sessionToken, value: localToken);
    await storage.write(key: _StorageKeys.username, value: username.trim());

    state = AuthState(
      status: AuthStatus.authenticated,
      token: localToken,
      serverUrl: state.serverUrl,
      username: username.trim(),
    );
    return true;
  }

  /// Login with username + password against the configured server.
  Future<bool> login({
    required String serverUrl,
    required String username,
    required String password,
  }) async {
    // ── Dummy bypass (remove before Supabase integration) ────────────────────
    if (username == 'admin' && password == 'admin') {
      const dummyToken = 'dummy-session-token';
      await storage.write(key: _StorageKeys.sessionToken, value: dummyToken);
      await storage.write(key: _StorageKeys.serverUrl, value: serverUrl);
      await storage.write(key: _StorageKeys.username, value: username);
      state = AuthState(
        status: AuthStatus.authenticated,
        token: dummyToken,
        serverUrl: serverUrl,
        username: username,
      );
      return true;
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      final client = _apiClient ?? ApiClient(
        baseUrl: serverUrl,
        tokenProvider: this,
      );
      _apiClient = client;
      client.updateBaseUrl(serverUrl);

      final response = await client.post<Map<String, dynamic>>(
        '/api/login',
        data: {'username': username, 'password': password},
      );

      if (response.statusCode == 200) {
        // Server returns a session cookie or token
        final token = _extractToken(response);

        await storage.write(key: _StorageKeys.sessionToken, value: token);
        await storage.write(key: _StorageKeys.serverUrl, value: serverUrl);
        await storage.write(key: _StorageKeys.username, value: username);

        state = AuthState(
          status: AuthStatus.authenticated,
          token: token,
          serverUrl: serverUrl,
          username: username,
        );
        return true;
      }

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Invalid credentials',
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Connection failed: ${e.toString()}',
      );
      return false;
    }
  }

  /// Logout: clear tokens and state.
  Future<void> logout() async {
    try {
      await _apiClient?.post('/api/logout');
    } catch (_) {
      // Best-effort server logout
    }

    await storage.delete(key: _StorageKeys.sessionToken);
    await storage.delete(key: _StorageKeys.username);
    // Keep serverUrl so user doesn't have to re-enter it

    state = AuthState(
      status: AuthStatus.unauthenticated,
      serverUrl: state.serverUrl,
    );
  }

  /// Update server URL without logging in (for connection screen).
  Future<void> setServerUrl(String url) async {
    await storage.write(key: _StorageKeys.serverUrl, value: url);
    state = state.copyWith(serverUrl: url);
  }

  /// Switch to a different server profile that already has a saved token.
  /// The token may still be expired — the API client will call [onTokenExpired]
  /// if it gets a 401, which will redirect to login automatically.
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
      token: token,
      serverUrl: serverUrl,
      username: username ?? state.username,
    );
  }

  // ─── TokenProvider implementation ───────────────────────────────────────────

  @override
  Future<String?> getToken() async => state.token;

  @override
  Future<void> onTokenExpired() async {
    await storage.delete(key: _StorageKeys.sessionToken);
    state = AuthState(
      status: AuthStatus.unauthenticated,
      serverUrl: state.serverUrl,
      username: state.username,
      error: 'Session expired. Please log in again.',
    );
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  String? _extractToken(dynamic response) {
    // Server may return token in body or set-cookie header
    if (response?.data is Map) {
      final data = response.data as Map<String, dynamic>;
      if (data.containsKey('token')) return data['token'] as String?;
    }
    // Fallback: extract from set-cookie header
    final cookies = response?.headers?.map['set-cookie'];
    if (cookies != null && cookies.isNotEmpty) {
      return cookies.first;
    }
    // If no explicit token, use a placeholder indicating cookie-based auth
    return 'cookie-session';
  }
}

// ─── Riverpod Providers ─────────────────────────────────────────────────────

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(storage: storage);
});
