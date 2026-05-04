import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/providers/theme_provider.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

/// Root application widget.
/// Configures Material 3 theming, routing, and global providers.
class JujoStreamApp extends ConsumerWidget {
  const JujoStreamApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);
    final density = ref.watch(densityProvider);

    return MaterialApp.router(
      title: 'Jujo.Stream',
      debugShowCheckedModeBanner: false,

      // Theme
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,

      // Density
      builder: (context, child) {
        return Theme(
          data: Theme.of(
            context,
          ).copyWith(visualDensity: density.visualDensity),
          child: child!,
        );
      },

      // Routing
      routerConfig: router,
    );
  }
}
