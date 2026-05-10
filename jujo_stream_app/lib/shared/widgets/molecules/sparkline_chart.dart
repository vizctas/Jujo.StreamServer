import 'dart:math' as math;

import 'package:flutter/material.dart';

/// A minimal sparkline chart widget for displaying time-series data.
///
/// Renders a smooth line with optional gradient fill below.
/// Designed for inline use in cards and metric tiles.
///
/// ```dart
/// SparklineChart(
///   data: [10, 15, 12, 18, 22, 19, 25],
///   color: Colors.blue,
///   height: 40,
/// )
/// ```
class SparklineChart extends StatelessWidget {
  const SparklineChart({
    super.key,
    required this.data,
    this.color,
    this.width,
    this.height = 40,
    this.strokeWidth = 1.5,
    this.showFill = true,
    this.fillOpacity = 0.15,
    this.animate = true,
  });

  /// Data points to plot. Empty list renders nothing.
  final List<double> data;

  /// Line color. Defaults to `colorScheme.primary`.
  final Color? color;

  /// Chart width. Defaults to available width.
  final double? width;

  /// Chart height.
  final double height;

  /// Line stroke width.
  final double strokeWidth;

  /// Whether to show gradient fill below the line.
  final bool showFill;

  /// Opacity of the fill gradient (0.0 - 1.0).
  final double fillOpacity;

  /// Whether to animate on data change.
  final bool animate;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return SizedBox(height: height, width: width);

    final lineColor = color ?? Theme.of(context).colorScheme.primary;

    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(
        size: Size(width ?? double.infinity, height),
        painter: _SparklinePainter(
          data: data,
          color: lineColor,
          strokeWidth: strokeWidth,
          showFill: showFill,
          fillOpacity: fillOpacity,
        ),
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  _SparklinePainter({
    required this.data,
    required this.color,
    required this.strokeWidth,
    required this.showFill,
    required this.fillOpacity,
  });

  final List<double> data;
  final Color color;
  final double strokeWidth;
  final bool showFill;
  final double fillOpacity;

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;

    final minVal = data.reduce(math.min);
    final maxVal = data.reduce(math.max);
    final range = maxVal - minVal;

    // Avoid division by zero when all values are the same
    final effectiveRange = range == 0 ? 1.0 : range;

    final stepX = size.width / (data.length - 1);
    final padding = strokeWidth; // Small vertical padding

    // Build path
    final path = Path();
    for (var i = 0; i < data.length; i++) {
      final x = i * stepX;
      final normalized = (data[i] - minVal) / effectiveRange;
      final y = size.height - padding - (normalized * (size.height - padding * 2));

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        // Smooth curve using cubic bezier
        final prevX = (i - 1) * stepX;
        final prevNormalized = (data[i - 1] - minVal) / effectiveRange;
        final prevY = size.height - padding - (prevNormalized * (size.height - padding * 2));

        final controlX1 = prevX + (x - prevX) * 0.5;
        final controlX2 = prevX + (x - prevX) * 0.5;
        path.cubicTo(controlX1, prevY, controlX2, y, x, y);
      }
    }

    // Draw fill
    if (showFill) {
      final fillPath = Path.from(path);
      fillPath.lineTo(size.width, size.height);
      fillPath.lineTo(0, size.height);
      fillPath.close();

      final fillPaint = Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            color.withValues(alpha: fillOpacity),
            color.withValues(alpha: 0.0),
          ],
        ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

      canvas.drawPath(fillPath, fillPaint);
    }

    // Draw line
    final linePaint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, linePaint);

    // Draw end dot
    if (data.isNotEmpty) {
      final lastX = (data.length - 1) * stepX;
      final lastNormalized = (data.last - minVal) / effectiveRange;
      final lastY = size.height - padding - (lastNormalized * (size.height - padding * 2));

      final dotPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(lastX, lastY), strokeWidth * 1.5, dotPaint);
    }
  }

  @override
  bool shouldRepaint(_SparklinePainter oldDelegate) {
    return oldDelegate.data != data ||
        oldDelegate.color != color ||
        oldDelegate.strokeWidth != strokeWidth;
  }
}
