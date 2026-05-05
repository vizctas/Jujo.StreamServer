import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/features/auth/login_screen.dart';
import 'package:jujo_stream_app/features/onboarding/onboarding_screen.dart';
import 'package:jujo_stream_app/features/dashboard/dashboard_screen.dart';
import 'package:jujo_stream_app/features/library/library_screen.dart';
import 'package:jujo_stream_app/features/game_sources/game_sources_screen.dart';
import 'package:jujo_stream_app/features/pairing/pairing_screen.dart';
import 'package:jujo_stream_app/features/streaming/stream_config_screen.dart';
import 'package:jujo_stream_app/features/system/system_screen.dart';
import 'package:jujo_stream_app/features/settings/settings_screen.dart';
import 'package:jujo_stream_app/features/deploy/deploy_screen.dart';
import 'package:jujo_stream_app/shared/widgets/organisms/app_shell.dart';

/// Bridges Riverpod auth + onboarding state changes to GoRouter's refreshListenable.
///
/// Uses TWO post-frame callbacks to guarantee that the redirect fires well
/// AFTER the current frame's build + layout + paint cycle is complete.
/// This prevents GoRouter from navigating while render boxes are partially
/// constructed (which causes "Cannot hit test a render box that has never
/// been laid out" assertion errors in Flutter's mouse tracker on Windows).
class _AuthRouteNotifier extends ChangeNotifier {
  _AuthRouteNotifier(Ref ref) {
    ref.listen<AuthState>(authProvider, (_, __) => _scheduleNotify());
    ref.listen<bool?>(onboardingProvider, (_, __) => _scheduleNotify());
  }

  bool _pendingNotify = false;

  void _scheduleNotify() {
    if (_pendingNotify) return;
    _pendingNotify = true;
    // Two-frame delay: ensures all render objects from the previous route
    // are fully disposed before GoRouter builds the next route's widgets.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _pendingNotify = false;
        if (hasListeners) notifyListeners();
      });
    });
  }
}

/// Application router configuration.
/// Uses ShellRoute for persistent navigation (sidebar/bottom nav).
/// Redirects to login when unauthenticated, onboarding when incomplete.
GoRouter createAppRouter(Ref ref) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: _AuthRouteNotifier(ref),
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final path = state.uri.path;
      final isOnLogin = path == '/login';
      final isOnOnboarding = path == '/onboarding';

      // Auth still initialising — hold at /login.
      if (authState.status == AuthStatus.unknown) {
        return isOnLogin ? null : '/login';
      }

      // Not authenticated — must be on login.
      if (!authState.isAuthenticated) {
        return isOnLogin ? null : '/login';
      }

      // Authenticated — check onboarding.
      final onboardingDone = ref.read(onboardingProvider);
      if (onboardingDone == null) {
        // SharedPreferences haven't loaded yet — hold at /login.
        return isOnLogin ? null : '/login';
      }
      if (!onboardingDone && !isOnOnboarding) return '/onboarding';
      if (onboardingDone && isOnOnboarding) return '/';

      // Authenticated user still on login → home.
      if (isOnLogin) return '/';

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'dashboard',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/library',
            name: 'library',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: LibraryScreen(),
            ),
          ),
          GoRoute(
            path: '/sources',
            name: 'sources',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GameSourcesScreen(),
            ),
          ),
          GoRoute(
            path: '/pairing',
            name: 'pairing',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: PairingScreen(),
            ),
          ),
          GoRoute(
            path: '/streaming',
            name: 'streaming',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: StreamConfigScreen(),
            ),
          ),
          GoRoute(
            path: '/system',
            name: 'system',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SystemScreen(),
            ),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SettingsScreen(),
            ),
          ),
          GoRoute(
            path: '/deploy',
            name: 'deploy',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DeployScreen(),
            ),
          ),
        ],
      ),
    ],
  );
}

/// Provider for the router instance.
final appRouterProvider = Provider<GoRouter>((ref) {
  return createAppRouter(ref);
});
