import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/providers/cloud_token_sync_provider.dart';
import 'core/providers/theme_provider.dart';
import 'core/routing/app_router.dart';

/// Root application widget.
/// Configures Material 3 theming, routing, and global providers.
class JujoStreamApp extends ConsumerWidget {
  const JujoStreamApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize cloud token sync — pushes fresh JWT to servers on refresh.
    ref.watch(cloudTokenSyncProvider);

    final router = ref.watch(appRouterProvider);
    final themeData = ref.watch(themePresetProvider).themeData;
    final density = ref.watch(densityProvider);

    return MaterialApp.router(
      title: 'Jujo.Stream',
      debugShowCheckedModeBanner: false,

      // Theme
      theme: themeData,
      darkTheme: themeData,
      themeMode: ThemeMode.light,

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
