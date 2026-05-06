import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:window_manager/window_manager.dart';

bool get _isDesktop {
  return defaultTargetPlatform == TargetPlatform.windows ||
      defaultTargetPlatform == TargetPlatform.macOS ||
      defaultTargetPlatform == TargetPlatform.linux;
}

class WindowTitleBar extends StatelessWidget implements PreferredSizeWidget {
  const WindowTitleBar({super.key, this.height = 32.0});

  final double height;

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) {
    if (!_isDesktop) return const SizedBox.shrink();

    return SizedBox(
      height: height,
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onPanStart: (_) => windowManager.startDragging(),
              onDoubleTap: () async {
                if (await windowManager.isMaximized()) {
                  await windowManager.unmaximize();
                } else {
                  await windowManager.maximize();
                }
              },
              child: const SizedBox.expand(),
            ),
          ),
          if (defaultTargetPlatform == TargetPlatform.windows ||
              defaultTargetPlatform == TargetPlatform.linux) ...[
            const _WindowButton(
              icon: LucideIcons.minus,
              onPressed: _minimize,
              tooltip: 'Minimize',
            ),
            const _WindowButton(
              icon: LucideIcons.square,
              onPressed: _maximizeRestore,
              tooltip: 'Maximize',
            ),
            const _WindowCloseButton(),
          ],
        ],
      ),
    );
  }

  static Future<void> _minimize() async {
    await windowManager.minimize();
  }

  static Future<void> _maximizeRestore() async {
    if (await windowManager.isMaximized()) {
      await windowManager.unmaximize();
    } else {
      await windowManager.maximize();
    }
  }
}

class _WindowButton extends StatefulWidget {
  const _WindowButton({
    required this.icon,
    required this.onPressed,
    required this.tooltip,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;

  @override
  State<_WindowButton> createState() => _WindowButtonState();
}

class _WindowButtonState extends State<_WindowButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Tooltip(
      message: widget.tooltip,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onPressed,
          child: Container(
            width: 46,
            height: 32,
            color: _hovered
                ? colorScheme.onSurface.withValues(alpha: 0.08)
                : Colors.transparent,
            child: Icon(
              widget.icon,
              size: 14,
              color: colorScheme.onSurface.withValues(alpha: 0.7),
            ),
          ),
        ),
      ),
    );
  }
}

class _WindowCloseButton extends StatefulWidget {
  const _WindowCloseButton();

  @override
  State<_WindowCloseButton> createState() => _WindowCloseButtonState();
}

class _WindowCloseButtonState extends State<_WindowCloseButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Tooltip(
      message: 'Close',
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: () => windowManager.close(),
          child: Container(
            width: 46,
            height: 32,
            color: _hovered ? const Color(0xFFE81123) : Colors.transparent,
            child: Icon(
              LucideIcons.x,
              size: 14,
              color: _hovered
                  ? Colors.white
                  : colorScheme.onSurface.withValues(alpha: 0.7),
            ),
          ),
        ),
      ),
    );
  }
}
