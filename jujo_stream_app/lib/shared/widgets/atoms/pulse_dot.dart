import 'package:flutter/material.dart';

/// An animated pulsing dot indicator.
///
/// Used to show live/active status (e.g., streaming active, server online).
/// The dot pulses with a subtle scale + opacity animation.
///
/// ```dart
/// PulseDot(color: Colors.green, size: 8)  // streaming active
/// PulseDot(color: Colors.red, size: 8)    // critical health
/// PulseDot(color: Colors.amber, size: 8, pulse: false)  // static warning
/// ```
class PulseDot extends StatefulWidget {
  const PulseDot({
    super.key,
    required this.color,
    this.size = 8,
    this.pulse = true,
  });

  /// The dot color.
  final Color color;

  /// Diameter of the dot.
  final double size;

  /// Whether to animate the pulse. Set false for static dots.
  final bool pulse;

  @override
  State<PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.8).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _opacityAnimation = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    if (widget.pulse) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(PulseDot oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.pulse && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.pulse && _controller.isAnimating) {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size * 2.2,
      height: widget.size * 2.2,
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Pulse ring (animated)
            if (widget.pulse)
              AnimatedBuilder(
                animation: _controller,
                builder: (context, _) {
                  return Container(
                    width: widget.size * _scaleAnimation.value,
                    height: widget.size * _scaleAnimation.value,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: widget.color.withValues(
                        alpha: _opacityAnimation.value,
                      ),
                    ),
                  );
                },
              ),
            // Solid dot (always visible)
            Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color,
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withValues(alpha: 0.4),
                    blurRadius: widget.size * 0.5,
                    spreadRadius: widget.size * 0.1,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
