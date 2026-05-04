import 'dart:async';
import 'dart:math';

import 'package:dio/dio.dart';

/// Retries failed requests with exponential backoff.
///
/// Retries on:
/// - Network errors (SocketException, timeout)
/// - 5xx server errors
///
/// Does NOT retry:
/// - 4xx client errors (auth, validation)
/// - Cancelled requests
class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    required this.dio,
    this.maxRetries = 3,
    this.baseDelay = const Duration(seconds: 1),
  });

  final Dio dio;
  final int maxRetries;
  final Duration baseDelay;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (!_shouldRetry(err)) {
      handler.next(err);
      return;
    }

    final retryCount = _getRetryCount(err.requestOptions);
    if (retryCount >= maxRetries) {
      handler.next(err);
      return;
    }

    // Exponential backoff with jitter
    final delay = baseDelay * pow(2, retryCount).toInt();
    final jitter = Duration(
      milliseconds: Random().nextInt(delay.inMilliseconds ~/ 2),
    );
    await Future<void>.delayed(delay + jitter);

    // Clone request with incremented retry count
    final options = err.requestOptions;
    options.extra['retryCount'] = retryCount + 1;

    try {
      final response = await dio.fetch(options);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  bool _shouldRetry(DioException err) {
    // Don't retry cancelled requests
    if (err.type == DioExceptionType.cancel) return false;

    // Connection refused / server not running — definitive failure, no point retrying.
    if (err.type == DioExceptionType.connectionError) return false;

    // Retry only on timeout errors (transient network issues)
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      return true;
    }

    // Retry on 5xx server errors
    final statusCode = err.response?.statusCode;
    if (statusCode != null && statusCode >= 500) return true;

    return false;
  }

  int _getRetryCount(RequestOptions options) {
    return (options.extra['retryCount'] as int?) ?? 0;
  }
}
