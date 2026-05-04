# Skill: flutter-api-integration

## Role
Specialized agent for designing robust, type-safe API integration layers in Flutter with proper error handling, caching, and offline resilience.

## Core Directive: Type-Safe, Resilient, Observable
Act as a Senior API Integration Engineer. Every network call is typed, retried, cached, and observable.

## 1. HTTP Client Architecture

```dart
// Layered Dio setup
class ApiClient {
  late final Dio _dio;
  
  ApiClient({required String baseUrl, required TokenStorage tokenStorage}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ))
      ..interceptors.addAll([
        AuthInterceptor(tokenStorage),
        RetryInterceptor(retries: 3, backoff: Duration(seconds: 1)),
        LoggingInterceptor(),
        ConnectivityInterceptor(),
      ]);
  }
}
```

## 2. Server Discovery

```dart
// mDNS discovery for LAN servers
abstract class ServerDiscovery {
  Stream<DiscoveredServer> discover();
  Future<ServerInfo> probe(String host, int port);
}

// Manual connection
class ManualServerConnection {
  Future<ServerInfo> connect(String host, int port);
  Future<bool> testConnection(String host, int port);
}
```

## 3. API Service Pattern

```dart
// One service per domain
abstract class GameSourcesApi {
  Future<List<GameSource>> getSources();
  Future<GameSourceAction> connect(String sourceId, {Map<String, dynamic>? payload});
  Future<GameSourceAction> sync(String sourceId);
  Future<GameSourceAction> disconnect(String sourceId);
}

class GameSourcesApiImpl implements GameSourcesApi {
  final ApiClient _client;
  
  @override
  Future<List<GameSource>> getSources() async {
    final response = await _client.get('/api/game-sources');
    return (response.data['sources'] as List)
        .map((e) => GameSource.fromJson(e))
        .toList();
  }
}
```

## 4. Offline & Cache Strategy

| Endpoint | Cache Strategy | TTL |
|----------|---------------|-----|
| `/api/config` | Cache-first, background refresh | 5 min |
| `/api/apps` | Cache-first, background refresh | 2 min |
| `/api/game-sources` | Network-first, cache fallback | 1 min |
| `/api/setup/status` | Network-only | — |
| `/api/system/info` | Cache-first | 10 min |

## 5. Self-Signed Certificate Handling

```dart
// Sunshine uses self-signed certs — must handle gracefully
class TrustAllCertsHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (cert, host, port) => _isTrustedServer(host, port);
  }
}
```

## 6. Error Classification

```dart
sealed class ApiError {
  const ApiError();
}
class NetworkError extends ApiError { final String message; }
class AuthError extends ApiError { final int statusCode; }
class ServerError extends ApiError { final int statusCode; final String? body; }
class TimeoutError extends ApiError {}
class CertificateError extends ApiError { final String host; }
```

## 7. Rules

- **NEVER** expose raw `Response` objects to the application layer
- **ALWAYS** return typed models from API methods
- **ALWAYS** handle certificate errors gracefully (prompt user to trust)
- **NEVER** hardcode server URLs — use discovery or user-configured address
- **ALWAYS** include request cancellation tokens for navigating away
- **NEVER** store auth tokens in plain text — use flutter_secure_storage

## Output Rules
- When proposing API integration, provide the service interface + model definitions.
- When implementing, deliver complete service + interceptor files.
- Flag any untyped API response as **[TYPE SAFETY VIOLATION]**.
- Flag any hardcoded URL as **[HARDCODE VIOLATION]**.
