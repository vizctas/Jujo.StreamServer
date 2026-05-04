import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/breakpoints.dart';

/// Navigation destination definition.
class _NavDestination {
  const _NavDestination({
    required this.path,
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
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
  ),
  _NavDestination(
    path: '/pairing',
    label: 'Pairing',
    icon: LucideIcons.link,
    selectedIcon: LucideIcons.link,
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
  ),
  _NavDestination(
    path: '/settings',
    label: 'Settings',
    icon: LucideIcons.settings,
    selectedIcon: LucideIcons.settings,
  ),
];

/// Adaptive app shell: NavigationRail on desktop, NavigationBar on mobile.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final isDesktop = AppBreakpoints.isDesktop(width);
    final currentIndex = _currentIndex(context);

    if (isDesktop) {
      return Scaffold(
        body: Row(
          children: [
            _DesktopSidebar(
              currentIndex: currentIndex,
              extended: AppBreakpoints.isWide(width),
              onDestinationSelected: (index) => _navigate(context, index),
            ),
            const VerticalDivider(width: 1),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex.clamp(0, 4),
        onDestinationSelected: (index) => _navigate(context, index),
        destinations: _destinations.take(5).map((d) {
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

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    for (var i = 0; i < _destinations.length; i++) {
      if (location == _destinations[i].path) return i;
    }
    return 0;
  }

  void _navigate(BuildContext context, int index) {
    if (index >= 0 && index < _destinations.length) {
      context.go(_destinations[index].path);
    }
  }
}

/// Desktop sidebar with optional extended labels.
class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar({
    required this.currentIndex,
    required this.extended,
    required this.onDestinationSelected,
  });

  final int currentIndex;
  final bool extended;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return NavigationRail(
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
      destinations: _destinations.map((d) {
        return NavigationRailDestination(
          icon: Tooltip(message: d.label, child: Icon(d.icon)),
          selectedIcon: Icon(d.selectedIcon),
          label: Text(d.label),
        );
      }).toList(),
    );
  }
}
