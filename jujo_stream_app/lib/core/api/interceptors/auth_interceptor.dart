import 'package:dio/dio.dart';

import '../api_client.dart';

/// Injects the session token into every outgoing request.
/// On 401 response, triggers the token expiry callback.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.tokenProvider});

  final TokenProvider tokenProvider;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenProvider.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    handler.next(response);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      await tokenProvider.onTokenExpired();
    }
    handler.next(err);
  }
}
