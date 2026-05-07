import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/user_role_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/breakpoints.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/server_switcher.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/window_title_bar.dart';

/// Navigation destination definition.
class _NavDestination {
  const _NavDestination({
    required this.path,
    required this.label,
    required this.icon,
    required this.selectedIcon,
    this.requiresAdmin = false,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;

  /// If true, this destination is hidden for non-admin users.
  final bool requiresAdmin;
}

const _destinations = [
  _NavDestination(
    path: '/',
    label: 'Dashboard',
    icon: LucideIcons.layoutDashboard,
    selectedIcon: LucideIcons.layoutDashboard,
  ),
  _NavDestination(
    path: '/library',
    label: 'Library',
    icon: LucideIcons.gamepad2,
    selectedIcon: LucideIcons.gamepad2,
  ),
  _NavDestination(
    path: '/sources',
    label: 'Sources',
    icon: LucideIcons.plug,
    selectedIcon: LucideIcons.plug,
    requiresAdmin: true,
  ),
  _NavDestination(
    path: '/pairing',
    label: 'Pairing',
    icon: LucideIcons.link,
    selectedIcon: LucideIcons.link,
    requiresAdmin: true,
  ),
  _NavDestination(
    path: '/streaming',
    label: 'Streaming',
    icon: LucideIcons.radio,
    selectedIcon: LucideIcons.radio,
  ),
  _NavDestination(
    path: '/system',
    label: 'System',
    icon: LucideIcons.activity,
    selectedIcon: LucideIcons.activity,
    requiresAdmin: true,
  ),
  _NavDestination(
    path: '/settings',
    label: 'Settings',
    icon: LucideIcons.settings,
    selectedIcon: LucideIcons.settings,
    requiresAdmin: true,
  ),
];

/// Adaptive app shell: NavigationRail on desktop, NavigationBar on mobile.
///
/// Hides admin-only destinations (Sources, Pairing, System, Settings)
/// when the current user's role is viewer.
class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final width = MediaQuery.sizeOf(context).width;
    final isDesktop = AppBreakpoints.isDesktop(width);
    final isAdmin = ref.watch(isAdminProvider);

    final visibleDestinations = _destinations
        .where((d) => !d.requiresAdmin || isAdmin)
        .toList();

    final currentIndex = _currentIndex(context, visibleDestinations);

    if (isDesktop) {
      return Scaffold(
        body: Column(
          children: [
            const WindowTitleBar(),
            Expanded(
              child: Row(
                children: [
                  _DesktopSidebar(
                    destinations: visibleDestinations,
                    currentIndex: currentIndex,
                    extended: AppBreakpoints.isWide(width),
                    onDestinationSelected: (index) =>
                        _navigate(context, index, visibleDestinations),
                  ),
                  const VerticalDivider(width: 1),
                  Expanded(child: child),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Mobile: show max 5 items in bottom nav
    final mobileDestinations = visibleDestinations.take(5).toList();
    final mobileIndex = _currentIndex(context, mobileDestinations);

    return Scaffold(
      body: Column(
        children: [
          const WindowTitleBar(),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: mobileIndex.clamp(0, mobileDestinations.length - 1),
        onDestinationSelected: (index) =>
            _navigate(context, index, mobileDestinations),
        destinations: mobileDestinations.map((d) {
          return NavigationDestination(
            icon: Icon(d.icon),
            selectedIcon: Icon(d.selectedIcon),
            label: d.label,
            tooltip: d.label,
          );
        }).toList(),
      ),
    );
  }

  int _currentIndex(BuildContext context, List<_NavDestination> destinations) {
    final location = GoRouterState.of(context).uri.path;
    for (var i = 0; i < destinations.length; i++) {
      if (location == destinations[i].path) return i;
    }
    return 0;
  }

  void _navigate(
      BuildContext context, int index, List<_NavDestination> destinations) {
    if (index >= 0 && index < destinations.length) {
      context.go(destinations[index].path);
    }
  }
}

/// Desktop sidebar with optional extended labels.
class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar({
    required this.destinations,
    required this.currentIndex,
    required this.extended,
    required this.onDestinationSelected,
  });

  final List<_NavDestination> destinations;
  final int currentIndex;
  final bool extended;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SizedBox(
      width: extended ? 220 : 72,
      child: Column(
        children: [
          Expanded(
            child: NavigationRail(
              extended: extended,
              selectedIndex: currentIndex,
              onDestinationSelected: onDestinationSelected,
              minWidth: 72,
              minExtendedWidth: 220,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.base),
                child: extended
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            LucideIcons.radio,
                            color: theme.colorScheme.primary,
                            size: 24,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            'Jujo.Stream',
                            style: theme.textTheme.titleMedium?.copyWith(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      )
                    : Icon(
                        LucideIcons.radio,
                        color: theme.colorScheme.primary,
                        size: 28,
                      ),
              ),
              destinations: destinations.map((d) {
                return NavigationRailDestination(
                  icon: Tooltip(message: d.label, child: Icon(d.icon)),
                  selectedIcon: Icon(d.selectedIcon),
                  label: Text(d.label),
                );
              }).toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.sm,
              0,
              AppSpacing.sm,
              AppSpacing.base,
            ),
            child: ServerSwitcherChip(extended: extended),
          ),
        ],
      ),
    );
  }
}
