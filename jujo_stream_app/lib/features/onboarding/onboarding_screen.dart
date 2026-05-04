import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

/// Onboarding wizard — shown once after first login.
/// Guides the user through: connect to server → verify → done.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;

  static const _steps = [
    _StepData(
      icon: LucideIcons.server,
      title: 'Welcome to Jujo.Stream',
      body:
          'This app manages your local streaming server. Complete these quick steps to get set up.',
    ),
    _StepData(
      icon: LucideIcons.wifi,
      title: 'Connect to your server',
      body:
          'Make sure your Jujo.Stream server is running on this machine or on your local network.',
    ),
    _StepData(
      icon: LucideIcons.checkCircle,
      title: "You're all set!",
      body:
          'Head to the Dashboard to monitor your server, manage your game library, and pair devices.',
    ),
  ];

  void _next() {
    if (_step < _steps.length - 1) {
      setState(() => _step++);
    } else {
      _finish();
    }
  }

  void _skip() => _finish();

  Future<void> _finish() async {
    await ref.read(onboardingProvider.notifier).complete();
    // Router redirect handles navigation to '/' after onboardingProvider
    // emits true — no explicit context.go() needed.
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final step = _steps[_step];
    final isLast = _step == _steps.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Drag-to-move area for frameless window
            const SizedBox(height: 32),
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xxxl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: colorScheme.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            step.icon,
                            size: 32,
                            color: colorScheme.onPrimaryContainer,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),

                        // Title
                        Text(
                          step.title,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.base),

                        // Body
                        Text(
                          step.body,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                            height: 1.55,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.xxxl),

                        // Step dots
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(_steps.length, (i) {
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: i == _step ? 20 : 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: i == _step
                                    ? colorScheme.primary
                                    : colorScheme.outlineVariant,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: AppSpacing.xxl),

                        // Buttons
                        Row(
                          children: [
                            if (!isLast)
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _skip,
                                  child: const Text('Skip'),
                                ),
                              ),
                            if (!isLast) const SizedBox(width: AppSpacing.base),
                            Expanded(
                              flex: isLast ? 1 : 1,
                              child: FilledButton(
                                onPressed: _next,
                                child: Text(isLast ? 'Get Started' : 'Next'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StepData {
  const _StepData({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;
}
