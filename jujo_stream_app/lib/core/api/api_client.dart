import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import 'cert_trust.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/retry_interceptor.dart';
import 'interceptors/logging_interceptor.dart';

/// Central HTTP client for communicating with the Jujo.Stream server.
///
/// Handles:
/// - Base URL configuration (user-provided server address)
/// - Self-signed certificate trust
/// - Auth token injection
/// - Retry with exponential backoff
/// - Request/response logging (debug only)
class ApiClient {
  ApiClient({required String baseUrl, required TokenProvider tokenProvider})
    : _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 30),
          sendTimeout: const Duration(seconds: 15),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status != null && status < 500,
        ),
      ) {
    configureSelfSignedCertTrust(_dio);
    _dio.interceptors.addAll([
      AuthInterceptor(tokenProvider: tokenProvider),
      RetryInterceptor(dio: _dio),
      if (kDebugMode) AppLoggingInterceptor(),
    ]);
  }

  final Dio _dio;

  /// Expose Dio for advanced usage (e.g., download, SSE).
  Dio get dio => _dio;

  /// Update the base URL (e.g., after server discovery or manual entry).
  void updateBaseUrl(String baseUrl) {
    _dio.options.baseUrl = baseUrl;
  }

  // ─── HTTP Methods ─────────────────────────────────────────────────────────

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }
}

/// Abstraction for providing auth tokens to the interceptor.
/// Implemented by the auth service/provider.
abstract class TokenProvider {
  /// Returns the current session token, or null if not authenticated.
  Future<String?> getToken();

  /// Called when the server returns 401 — triggers re-auth flow.
  Future<void> onTokenExpired();
}
