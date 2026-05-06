import 'package:flutter/material.dart';

class WindowTitleBar extends StatelessWidget implements PreferredSizeWidget {
  const WindowTitleBar({super.key, this.height = 0});

  final double height;

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
