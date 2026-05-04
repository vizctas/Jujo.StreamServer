import 'package:dio/dio.dart';
import 'package:logger/logger.dart';

/// Debug-only request/response logger.
/// Logs method, URL, status, and timing. Never logs in release mode.
class AppLoggingInterceptor extends Interceptor {
  final _logger = Logger(
    printer: PrettyPrinter(methodCount: 0, dateTimeFormat: DateTimeFormat.none),
    level: Level.debug,
  );

  final _stopwatches = <int, Stopwatch>{};

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final sw = Stopwatch()..start();
    _stopwatches[options.hashCode] = sw;
    _logger.d('→ ${options.method} ${options.uri}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final sw = _stopwatches.remove(response.requestOptions.hashCode);
    final elapsed = sw?.elapsedMilliseconds ?? 0;
    _logger.d(
      '← ${response.statusCode} ${response.requestOptions.method} '
      '${response.requestOptions.uri} (${elapsed}ms)',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final sw = _stopwatches.remove(err.requestOptions.hashCode);
    final elapsed = sw?.elapsedMilliseconds ?? 0;
    _logger.e(
      '✗ ${err.requestOptions.method} ${err.requestOptions.uri} '
      '(${elapsed}ms): ${err.message}',
    );
    handler.next(err);
  }
}
