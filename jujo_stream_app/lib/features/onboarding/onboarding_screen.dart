import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Onboarding wizard — shown once after first login.
///
/// Flow:
/// 1. Welcome: Deploy Server / Connect Server / Skip
/// 2. (If Deploy/Connect) Server Config
/// 3. Connect Game Libraries (optional)
/// 4. Done → Dashboard
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

enum _OnboardingPath { none, deploy, connect }

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  _OnboardingPath _path = _OnboardingPath.none;

  // Connect server form
  final _serverUrlController = TextEditingController();
  final _serverUserController = TextEditingController();
  final _serverPassController = TextEditingController();
  bool _connectLoading = false;
  bool _connectSuccess = false;
  String? _connectError;
  bool _obscureServerPass = true;

  // Deploy server state
  final bool _deployStarted = false;

  @override
  void dispose() {
    _serverUrlController.dispose();
    _serverUserController.dispose();
    _serverPassController.dispose();
    super.dispose();
  }

  /// Total steps depends on path chosen.
  int get _totalSteps {
    if (_path == _OnboardingPath.none) return 1; // Welcome only → skip
    return 4; // Welcome → Server → Game Sources → Done
  }

  void _selectDeploy() {
    setState(() {
      _path = _OnboardingPath.deploy;
      _step = 1;
    });
  }

  void _selectConnect() {
    setState(() {
      _path = _OnboardingPath.connect;
      _step = 1;
    });
  }

  void _skip() => _finish();

  void _next() {
    if (_step < _totalSteps - 1) {
      setState(() => _step++);
    } else {
      _finish();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
    }
  }

  Future<void> _finish() async {
    await ref.read(onboardingProvider.notifier).complete();
  }

  Future<void> _attemptConnect() async {
    final url = _serverUrlController.text.trim();
    if (url.isEmpty) {
      setState(() => _connectError = 'Server address is required');
      return;
    }

    setState(() {
      _connectLoading = true;
      _connectError = null;
      _connectSuccess = false;
    });

    // First try with the logged-in user's credentials
    final authState = ref.read(authProvider);
    final username = _serverUserController.text.trim().isNotEmpty
        ? _serverUserController.text.trim()
        : authState.username ?? '';
    final password = _serverPassController.text;

    try {
      final success = await ref.read(authProvider.notifier).login(
            serverUrl: url,
            username: username,
            password: password,
          );

      if (mounted) {
        setState(() {
          _connectLoading = false;
          if (success) {
            _connectSuccess = true;
            _connectError = null;
          } else {
            _connectError =
                ref.read(authProvider).error ?? 'Connection failed';
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _connectLoading = false;
          _connectError = 'Connection failed: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Drag-to-move area for frameless window
            const SizedBox(height: AppSpacing.xxl),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 560),
                    child: _buildCurrentStep(context),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStep(BuildContext context) {
    return switch (_step) {
      0 => _buildWelcomeStep(context),
      1 => _path == _OnboardingPath.deploy
          ? _buildDeployStep(context)
          : _buildConnectStep(context),
      2 => _buildGameSourcesStep(context),
      3 => _buildDoneStep(context),
      _ => _buildWelcomeStep(context),
    };
  }

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────

  Widget _buildWelcomeStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
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
            LucideIcons.radio,
            size: 32,
            color: colorScheme.onPrimaryContainer,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Text(
          'Welcome to Jujo.Stream',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          "Let's get you streaming in under 5 minutes.\nHow would you like to set up your server?",
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxxl),

        // Option cards
        _OptionCard(
          icon: LucideIcons.download,
          title: 'Deploy Server',
          description:
              'Install the streaming backend on this machine. Uses your account credentials.',
          onTap: _selectDeploy,
        ),
        const SizedBox(height: AppSpacing.base),
        _OptionCard(
          icon: LucideIcons.link,
          title: 'Connect to Server',
          description:
              'Connect to an existing Jujo.Stream server on your network.',
          onTap: _selectConnect,
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Skip
        TextButton(
          onPressed: _skip,
          child: Text(
            'Skip for now',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }

  // ── Step 1a: Deploy Server ──────────────────────────────────────────────────

  Widget _buildDeployStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepIndicator(current: 1, total: _totalSteps - 1),
        const SizedBox(height: AppSpacing.xxl),

        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: colorScheme.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(
            LucideIcons.download,
            size: 32,
            color: colorScheme.onPrimaryContainer,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Text(
          'Deploy Server',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'The streaming backend will be installed on this machine. '
          'Your account credentials will be used to secure the server.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Deploy status
        if (!_deployStarted) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: colorScheme.outlineVariant),
            ),
            child: Column(
              children: [
                Icon(LucideIcons.info, size: 20, color: colorScheme.primary),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'This feature is coming soon.\n'
                  'The backend packaging and telemetry agent are still in development.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: AppSpacing.xxl),

        // Navigation
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _back,
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: AppSpacing.base),
            Expanded(
              child: FilledButton(
                onPressed: _next,
                child: const Text('Continue'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Step 1b: Connect Server ─────────────────────────────────────────────────

  Widget _buildConnectStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepIndicator(current: 1, total: _totalSteps - 1),
        const SizedBox(height: AppSpacing.xxl),

        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: colorScheme.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(
            LucideIcons.link,
            size: 32,
            color: colorScheme.onPrimaryContainer,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Text(
          'Connect to Server',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Enter the address of your running Jujo.Stream server. '
          "We'll try your account credentials first.",
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Server URL
        TextFormField(
          controller: _serverUrlController,
          decoration: const InputDecoration(
            labelText: 'Server Address',
            hintText: 'https://192.168.1.100:47990',
            prefixIcon: Icon(LucideIcons.server),
          ),
          keyboardType: TextInputType.url,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.base),

        // Username (pre-filled with logged-in user)
        TextFormField(
          controller: _serverUserController,
          decoration: InputDecoration(
            labelText: 'Username (optional)',
            hintText: ref.read(authProvider).username ?? 'admin',
            prefixIcon: const Icon(LucideIcons.user),
          ),
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.base),

        // Password
        TextFormField(
          controller: _serverPassController,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(LucideIcons.lock),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureServerPass ? LucideIcons.eyeOff : LucideIcons.eye,
                size: 18,
              ),
              onPressed: () =>
                  setState(() => _obscureServerPass = !_obscureServerPass),
            ),
          ),
          obscureText: _obscureServerPass,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _attemptConnect(),
        ),
        const SizedBox(height: AppSpacing.base),

        // Error
        if (_connectError != null) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: colorScheme.errorContainer,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.alertCircle,
                    size: 16, color: colorScheme.onErrorContainer),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    _connectError!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.base),
        ],

        // Success
        if (_connectSuccess) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFF22C55E).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: const Color(0xFF22C55E).withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.checkCircle,
                    size: 16, color: Color(0xFF22C55E)),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Connected successfully!',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF22C55E),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.base),
        ],

        const SizedBox(height: AppSpacing.base),

        // Connect button
        SizedBox(
          width: double.infinity,
          child: FilledButton.tonal(
            onPressed: _connectLoading ? null : _attemptConnect,
            child: _connectLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Test Connection'),
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Navigation
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _back,
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: AppSpacing.base),
            Expanded(
              child: FilledButton(
                onPressed: _next,
                child: const Text('Continue'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Step 2: Game Sources ────────────────────────────────────────────────────

  Widget _buildGameSourcesStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepIndicator(current: 2, total: _totalSteps - 1),
        const SizedBox(height: AppSpacing.xxl),

        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: colorScheme.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(
            LucideIcons.gamepad2,
            size: 32,
            color: colorScheme.onPrimaryContainer,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Text(
          'Connect Game Libraries',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Connect your game platforms so Jujo.Stream can detect installed games. '
          'You can always do this later from Settings.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Source cards (simplified for onboarding)
        _SourceOptionTile(
          icon: LucideIcons.flame,
          color: const Color(0xFF1B2838),
          title: 'Steam',
          description: 'Import your Steam library and detect installed games.',
          onConnect: () {
            // TODO: Open Steam connection flow
          },
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.mountain,
          color: const Color(0xFF2A2A2A),
          title: 'Epic Games',
          description: 'Connect Epic Games launcher library.',
          onConnect: () {
            // TODO: Open Epic connection flow
          },
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.gamepad2,
          color: const Color(0xFF107C10),
          title: 'Xbox / Game Pass',
          description: 'Connect Microsoft/Xbox and PC Game Pass.',
          onConnect: () {
            // TODO: Open Xbox connection flow
          },
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.plus,
          color: colorScheme.primary,
          title: 'Manual',
          description: 'Add games by executable path.',
          onConnect: () {
            // TODO: Open manual add flow
          },
        ),

        const SizedBox(height: AppSpacing.xxl),

        // Navigation
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _next,
                child: const Text('Skip'),
              ),
            ),
            const SizedBox(width: AppSpacing.base),
            Expanded(
              child: FilledButton(
                onPressed: _next,
                child: const Text('Continue'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Step 3: Done ────────────────────────────────────────────────────────────

  Widget _buildDoneStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepIndicator(current: 3, total: _totalSteps - 1),
        const SizedBox(height: AppSpacing.xxl),

        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: const Color(0xFF22C55E).withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            LucideIcons.checkCircle,
            size: 32,
            color: Color(0xFF22C55E),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Text(
          "You're all set!",
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Your server is configured. Head to the Dashboard to monitor '
          'your server, manage your game library, and start streaming.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxxl),

        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _finish,
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.base),
            ),
            child: const Text('Go to Dashboard'),
          ),
        ),
      ],
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

/// Step progress indicator dots.
class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.current, required this.total});

  final int current;
  final int total;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (i) {
        final isActive = i + 1 == current;
        final isDone = i + 1 < current;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: isActive ? 20 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isDone
                ? colorScheme.primary.withValues(alpha: 0.5)
                : isActive
                    ? colorScheme.primary
                    : colorScheme.outlineVariant,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}

/// Option card for the welcome step (Deploy / Connect).
class _OptionCard extends StatelessWidget {
  const _OptionCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.base),
          decoration: BoxDecoration(
            color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(icon, size: 22, color: colorScheme.onPrimaryContainer),
              ),
              const SizedBox(width: AppSpacing.base),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      description,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Icon(
                LucideIcons.chevronRight,
                size: 18,
                color: colorScheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Simplified source tile for the onboarding game sources step.
class _SourceOptionTile extends StatelessWidget {
  const _SourceOptionTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.description,
    required this.onConnect,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String description;
  final VoidCallback onConnect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.titleSmall),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          FilledButton.tonal(
            onPressed: onConnect,
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text('Connect'),
          ),
        ],
      ),
    );
  }
}
