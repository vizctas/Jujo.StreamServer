import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/interceptors/auth_interceptor.dart';

class _TokenProvider implements TokenProvider {
  _TokenProvider(this.token);

  final String? token;

  @override
  Future<String?> getToken() async => token;

  @override
  Future<void> onTokenExpired() async {}
}

class _CapturingRequestHandler extends RequestInterceptorHandler {
  Future<RequestOptions> get request async {
    final state = await future;
    return state.data as RequestOptions;
  }
}

void main() {
  test('adds Sunshine session token with Session auth scheme', () async {
    final interceptor = AuthInterceptor(tokenProvider: _TokenProvider('abc'));
    final options = RequestOptions(path: '/api/config');
    final handler = _CapturingRequestHandler();

    await interceptor.onRequest(options, handler);
    final request = await handler.request;

    expect(request.headers['Authorization'], 'Session abc');
  });

  test('does not add Authorization header without token', () async {
    final interceptor = AuthInterceptor(tokenProvider: _TokenProvider(null));
    final options = RequestOptions(path: '/api/config');
    final handler = _CapturingRequestHandler();

    await interceptor.onRequest(options, handler);
    final request = await handler.request;

    expect(request.headers.containsKey('Authorization'), isFalse);
  });
}
