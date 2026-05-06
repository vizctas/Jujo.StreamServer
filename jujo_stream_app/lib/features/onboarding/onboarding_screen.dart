import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/core/providers/server_process_provider.dart';
import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/config_api.dart';
import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/providers/server_profiles_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
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
  bool _deployStarted = false;
  bool _deployComplete = false;
  String? _deployError;
  String? _deployMessage;

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

  /// Complete onboarding and navigate directly to Game Sources screen.
  /// Called when user taps "Connect" on any source tile during onboarding.
  Future<void> _finishAndOpenSources() async {
    await ref.read(onboardingProvider.notifier).complete();
    if (mounted) {
      context.go('/sources');
    }
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
      final token = await ref
          .read(authProvider.notifier)
          .testServerConnection(
            serverUrl: url,
            username: username,
            password: password,
          );

      if (mounted) {
        setState(() {
          _connectLoading = false;
          if (token != null) {
            _connectSuccess = true;
            _connectError = null;
          } else {
            _connectError =
                'Could not connect to server. Check URL and credentials.';
          }
        });

        if (token != null) {
          await ref
              .read(serverProfilesProvider.notifier)
              .addAndActivate(url: url, username: username, token: token);
        }
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
      1 =>
        _path == _OnboardingPath.deploy
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

  Future<void> _startDeploy() async {
    final credentialsReady = await _prepareServerCredentials();
    if (!credentialsReady) return;

    final canDeployLocal = ServerDeployService().canDeploy;

    setState(() {
      _deployStarted = true;
      _deployError = null;
      _deployComplete = false;
      _deployMessage = 'Preparing…';
    });

    if (canDeployLocal) {
      // Deploy from local build (dev workflow)
      await ref
          .read(serverProcessProvider.notifier)
          .deploy(
            onProgress: (msg) {
              if (mounted) setState(() => _deployMessage = msg);
            },
          );
    } else {
      // Download from GitHub (production workflow)
      await ref.read(serverProcessProvider.notifier).install();
    }

    if (!mounted) return;

    final processStatus = ref.read(serverProcessProvider);
    if (processStatus.error != null) {
      setState(() {
        _deployError = processStatus.error;
        _deployStarted = false;
      });
    } else {
      setState(() {
        _deployMessage = 'Connecting to server…';
      });

      // ── Post-deploy bootstrap (Fix C-1 + C-2) ──────────────────────────────
      await _bootstrapAfterDeploy();

      if (mounted) {
        setState(() {
          _deployComplete = true;
          _deployMessage = 'Server deployed and connected!';
        });
      }
    }
  }

  /// After server is deployed and running, auto-connect and push cloud config.
  ///
  /// This fixes two critical gaps:
  /// - C-1: App doesn't know the server URL after deploy
  /// - C-2: Server has no cloud config for heartbeat/presence
  Future<void> _bootstrapAfterDeploy() async {
    const localServerUrl = 'https://localhost:47990';
    final authNotifier = ref.read(authProvider.notifier);
    final authState = ref.read(authProvider);

    // 1. Wait briefly for the server to be ready (just started)
    await Future<void>.delayed(const Duration(seconds: 2));

    // 2. Bootstrap server session (sets password if first-run, then logs in)
    if (mounted) {
      setState(() => _deployMessage = 'Setting server credentials…');
    }

    await authNotifier.setServerUrl(localServerUrl);
    final token = await authNotifier.bootstrapServerSession(
      serverUrl: localServerUrl,
    );

    // 3. Add server profile and activate it
    final username = authState.username ?? 'admin';
    if (token != null) {
      await ref.read(serverProfilesProvider.notifier).addAndActivate(
        url: localServerUrl,
        username: username,
        token: token,
        name: 'This PC',
      );
    }

    // 4. Push cloud config to the server (C-2 fix)
    if (authState.mode == AuthMode.cloudAccount &&
        SupabaseConfig.current.isConfigured) {
      if (mounted) {
        setState(() => _deployMessage = 'Configuring cloud sync…');
      }

      try {
        final client = ApiClient(
          baseUrl: localServerUrl,
          tokenProvider: authNotifier,
        );
        final configApi = ConfigApi(client: client);

        // Get the current Supabase session token for the server to use
        final supabaseSession = Supabase.instance.client.auth.currentSession;

        await configApi.applyConfig({
          'cloud_supabase_url': SupabaseConfig.current.url,
          'cloud_supabase_key': SupabaseConfig.current.publishableKey,
          if (supabaseSession != null)
            'cloud_user_token': supabaseSession.accessToken,
          'cloud_heartbeat_interval': 60,
        });
      } catch (e) {
        // Non-fatal — cloud features won't work but local streaming is fine
        debugPrint('Cloud config push failed: $e');
      }
    }

    // 5. Invalidate status provider so dashboard picks up the new server
    ref.invalidate(serverStatusProvider);
  }

  Future<bool> _prepareServerCredentials() async {
    final auth = ref.read(authProvider);
    final authNotifier = ref.read(authProvider.notifier);
    if (authNotifier.hasServerBootstrapPassword) return true;

    final passwordController = TextEditingController();
    final usernameController = TextEditingController(text: auth.username ?? '');
    final formKey = GlobalKey<FormState>();
    var obscurePassword = true;

    final result = await showDialog<({String? username, String password})>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final isCloudAccount = auth.mode == AuthMode.cloudAccount;
            return AlertDialog(
              title: Text(
                isCloudAccount
                    ? 'Confirm Account Password'
                    : 'Create Server Login',
              ),
              content: Form(
                key: formKey,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isCloudAccount
                            ? 'The server will be secured with your signed-in account identity. Confirm your password once; it stays in memory only for this deploy.'
                            : 'No account is signed in. Create the first server username and password for local-only server auth.',
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      if (!isCloudAccount) ...[
                        TextFormField(
                          controller: usernameController,
                          decoration: const InputDecoration(
                            labelText: 'Server username',
                            prefixIcon: Icon(LucideIcons.user),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Server username is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: AppSpacing.base),
                      ],
                      TextFormField(
                        controller: passwordController,
                        obscureText: obscurePassword,
                        decoration: InputDecoration(
                          labelText: isCloudAccount
                              ? 'Account password'
                              : 'Server password',
                          prefixIcon: const Icon(LucideIcons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              obscurePassword
                                  ? LucideIcons.eyeOff
                                  : LucideIcons.eye,
                              size: 18,
                            ),
                            onPressed: () => setDialogState(
                              () => obscurePassword = !obscurePassword,
                            ),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required';
                          }
                          if (value.length < 8) {
                            return 'Use at least 8 characters';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () {
                    if (!formKey.currentState!.validate()) return;
                    Navigator.of(context).pop((
                      username: usernameController.text.trim(),
                      password: passwordController.text,
                    ));
                  },
                  child: const Text('Continue'),
                ),
              ],
            );
          },
        );
      },
    );

    usernameController.dispose();
    passwordController.dispose();
    if (result == null) return false;

    if (auth.mode == AuthMode.cloudAccount && auth.username != null) {
      return authNotifier.login(
        username: auth.username!,
        password: result.password,
      );
    }

    await authNotifier.setServerBootstrapCredentials(
      username: result.username,
      password: result.password,
    );
    return true;
  }

  Widget _buildDeployStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final processStatus = ref.watch(serverProcessProvider);
    final canDeployLocal = ServerDeployService().canDeploy;

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
            _deployComplete ? LucideIcons.checkCircle : LucideIcons.download,
            size: 32,
            color: _deployComplete
                ? const Color(0xFF22C55E)
                : colorScheme.onPrimaryContainer,
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
        if (_deployStarted && !_deployComplete) ...[
          // In-progress indicator
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: colorScheme.primary.withValues(alpha: 0.4),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    SizedBox(
                      width: 32,
                      height: 32,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        value:
                            processStatus.installProgress != null &&
                                processStatus.installProgress! > 0
                            ? processStatus.installProgress
                            : null,
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _deployMessage ?? 'Installing…',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'Do not close the app.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (processStatus.installProgress != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    child: LinearProgressIndicator(
                      value: processStatus.installProgress! > 0
                          ? processStatus.installProgress
                          : null,
                      minHeight: 4,
                      backgroundColor: colorScheme.outlineVariant,
                      color: colorScheme.primary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ] else if (_deployComplete) ...[
          // Success
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              color: const Color(0xFF22C55E).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: const Color(0xFF22C55E).withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  LucideIcons.checkCircle,
                  size: 20,
                  color: Color(0xFF22C55E),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Text(
                    'Server deployed and running on port 47990.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF22C55E),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ] else ...[
          // UAC pre-warning (F-2 fix)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: colorScheme.tertiaryContainer.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: colorScheme.tertiary.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  LucideIcons.shieldCheck,
                  size: 16,
                  color: colorScheme.tertiary,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Windows will ask for administrator permission to install the server service.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onTertiaryContainer,
                      fontSize: 11,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          // Not started — show deploy button
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
                Icon(LucideIcons.server, size: 20, color: colorScheme.primary),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  canDeployLocal
                      ? 'A local build was detected. The server will be deployed from your build output.'
                      : 'The latest server release will be downloaded from GitHub and installed silently.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton.icon(
                  onPressed: _startDeploy,
                  icon: Icon(
                    canDeployLocal
                        ? LucideIcons.hardDrive
                        : LucideIcons.download,
                    size: 18,
                  ),
                  label: Text(
                    canDeployLocal ? 'Deploy Now' : 'Download & Install',
                  ),
                ),
              ],
            ),
          ),
        ],

        // Error
        if (_deployError != null) ...[
          const SizedBox(height: AppSpacing.md),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: colorScheme.errorContainer.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: colorScheme.error.withValues(alpha: 0.4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      LucideIcons.alertCircle,
                      size: 16,
                      color: colorScheme.error,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        _deployError!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton.tonal(
                    onPressed: () {
                      setState(() {
                        _deployError = null;
                        _deployStarted = false;
                      });
                    },
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Try Again'),
                  ),
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
                onPressed: (_deployStarted && !_deployComplete) ? null : _back,
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: AppSpacing.base),
            Expanded(
              child: FilledButton(
                onPressed: (_deployStarted && !_deployComplete) ? null : _next,
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
                Icon(
                  LucideIcons.alertCircle,
                  size: 16,
                  color: colorScheme.onErrorContainer,
                ),
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
                const Icon(
                  LucideIcons.checkCircle,
                  size: 16,
                  color: Color(0xFF22C55E),
                ),
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

        // Source cards — tapping "Connect" completes onboarding and opens
        // the full Game Sources screen where the actual auth flows live.
        _SourceOptionTile(
          icon: LucideIcons.flame,
          color: const Color(0xFF1B2838),
          title: 'Steam',
          description: 'Import your Steam library and detect installed games.',
          onConnect: () => _finishAndOpenSources(),
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.mountain,
          color: const Color(0xFF2A2A2A),
          title: 'Epic Games',
          description: 'Connect Epic Games launcher library.',
          onConnect: () => _finishAndOpenSources(),
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.gamepad2,
          color: const Color(0xFF107C10),
          title: 'Xbox / Game Pass',
          description: 'Connect Microsoft/Xbox and PC Game Pass.',
          onConnect: () => _finishAndOpenSources(),
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.plus,
          color: colorScheme.primary,
          title: 'Manual',
          description: 'Add games by executable path.',
          onConnect: () => _finishAndOpenSources(),
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
                child: Icon(
                  icon,
                  size: 22,
                  color: colorScheme.onPrimaryContainer,
                ),
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
