import 'package:logger/logger.dart';

/// Global app logger instance.
/// Use this instead of `print()` for structured, level-aware logging.
final logger = AppLogger._();

class AppLogger {
  AppLogger._()
    : _logger = Logger(
        printer: PrettyPrinter(
          methodCount: 0,
          dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
        ),
      );

  final Logger _logger;

  void info(String message) => _logger.i(message);

  void warning(String message) => _logger.w(message);

  void error(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  void debug(String message) => _logger.d(message);
}
