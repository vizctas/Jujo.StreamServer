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
/// 1–3. Feature showcase (what Jujo.Stream does)
/// 4.   Setup choice: Deploy / Connect / Skip
/// 5.   (If Deploy/Connect) Server Config
/// 6.   Connect Game Libraries (optional)
/// 7.   Done → Dashboard
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

enum _OnboardingPath { none, deploy, connect }

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  // ── Showcase PageView ───────────────────────────────────────────────────────
  final _showcaseController = PageController();
  int _showcasePage = 0;
  static const _showcasePageCount = 3;

  // ── Setup flow ──────────────────────────────────────────────────────────────
  bool _showcaseComplete = false;
  int _setupStep = 0; // 0=choice, 1=server, 2=sources, 3=done
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
    _showcaseController.dispose();
    _serverUrlController.dispose();
    _serverUserController.dispose();
    _serverPassController.dispose();
    super.dispose();
  }

  // ── Showcase navigation ─────────────────────────────────────────────────────

  void _nextShowcasePage() {
    if (_showcasePage < _showcasePageCount - 1) {
      _showcaseController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    } else {
      _finishShowcase();
    }
  }

  void _finishShowcase() {
    setState(() => _showcaseComplete = true);
  }

  // ── Setup navigation ────────────────────────────────────────────────────────

  int get _totalSetupSteps {
    if (_path == _OnboardingPath.none) return 1;
    return 4;
  }

  void _selectDeploy() {
    setState(() {
      _path = _OnboardingPath.deploy;
      _setupStep = 1;
    });
  }

  void _selectConnect() {
    setState(() {
      _path = _OnboardingPath.connect;
      _setupStep = 1;
    });
  }

  void _skip() => _finish();

  void _nextSetup() {
    if (_setupStep < _totalSetupSteps - 1) {
      setState(() => _setupStep++);
    } else {
      _finish();
    }
  }

  void _backSetup() {
    if (_setupStep > 0) {
      setState(() => _setupStep--);
    } else {
      setState(() => _showcaseComplete = false);
    }
  }

  Future<void> _finish() async {
    await ref.read(onboardingProvider.notifier).complete();
  }

  Future<void> _finishAndOpenSources() async {
    await ref.read(onboardingProvider.notifier).complete();
    if (mounted) context.go('/sources');
  }

  // ── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDeploying = _deployStarted && !_deployComplete;

    return PopScope(
      canPop: !isDeploying,
      child: Scaffold(
        body: SafeArea(
          child: _showcaseComplete
              ? _buildSetupFlow(context)
              : _buildShowcase(context),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SHOWCASE PAGES
  // ═══════════════════════════════════════════════════════════════════════════════

  Widget _buildShowcase(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      children: [
        Align(
          alignment: Alignment.topRight,
          child: Padding(
            padding: const EdgeInsets.only(
              top: AppSpacing.base,
              right: AppSpacing.xl,
            ),
            child: TextButton(
              onPressed: _finishShowcase,
              child: Text(
                'Skip',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ),
        Expanded(
          child: PageView(
            controller: _showcaseController,
            onPageChanged: (i) => setState(() => _showcasePage = i),
            children: const [
              _ShowcasePage(
                icon: LucideIcons.monitor,
                accentIcon: LucideIcons.smartphone,
                title: 'Stream Your Games\nAnywhere',
                description:
                    'Play your PC games on any device — phone, tablet, '
                    'TV, or another computer. Ultra-low latency streaming '
                    'powered by hardware encoding.',
                features: [
                  'Hardware-accelerated H.265/AV1 encoding',
                  'Under 20ms latency on local network',
                  'Works with any Moonlight-compatible client',
                ],
              ),
              _ShowcasePage(
                icon: LucideIcons.gamepad2,
                accentIcon: LucideIcons.library,
                title: 'All Your Games\nOne Library',
                description:
                    'Automatically detects games from Steam, Epic, Xbox, '
                    'GOG and more. One unified library to launch anything.',
                features: [
                  'Auto-import from Steam, Epic, Xbox, GOG',
                  'Custom game entries with cover art from IGDB',
                  'Per-game streaming profiles and input mapping',
                ],
              ),
              _ShowcasePage(
                icon: LucideIcons.shield,
                accentIcon: LucideIcons.cloud,
                title: 'Secure &\nCloud-Connected',
                description:
                    'Your server, your rules. Encrypted connections, cloud '
                    'sync for multi-device access, and role-based sharing.',
                features: [
                  'End-to-end encrypted streaming sessions',
                  'Cloud sync — access your server from anywhere',
                  'Share your library with friends (role-based)',
                  'Optional unattended startup for dedicated hosts (WOL + AutoLogon)',
                ],
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            0,
            AppSpacing.xl,
            AppSpacing.xxl,
          ),
          child: Row(
            children: [
              Row(
                children: List.generate(_showcasePageCount, (i) {
                  final isActive = i == _showcasePage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOutCubic,
                    margin: const EdgeInsets.only(right: 8),
                    width: isActive ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isActive
                          ? colorScheme.primary
                          : colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
              const Spacer(),
              FilledButton(
                onPressed: _nextShowcasePage,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.md,
                  ),
                ),
                child: Text(
                  _showcasePage == _showcasePageCount - 1
                      ? 'Get Started'
                      : 'Next',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SETUP FLOW
  // ═══════════════════════════════════════��═══════════════════════════════════════

  Widget _buildSetupFlow(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: AppSpacing.xxl),
        Expanded(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: _buildCurrentSetupStep(context),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrentSetupStep(BuildContext context) {
    return switch (_setupStep) {
      0 => _buildChoiceStep(context),
      1 =>
        _path == _OnboardingPath.deploy
            ? _buildDeployStep(context)
            : _buildConnectStep(context),
      2 => _buildGameSourcesStep(context),
      3 => _buildDoneStep(context),
      _ => _buildChoiceStep(context),
    };
  }

  // ── Step 0: Setup Choice ────────────────────────────────────────────────────

  Widget _buildChoiceStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
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
          'Set Up Your Server',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          "You're almost ready to stream.\nHow would you like to connect?",
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxxl),
        _OptionCard(
          icon: LucideIcons.hardDrive,
          title: 'Deploy Server',
          description:
              'Install the streaming backend on this machine. Best for gaming PCs.',
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
        TextButton(
          onPressed: _skip,
          child: Text(
            "Skip for now — I'll do this later",
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
    if (!credentialsReady) {
      if (mounted) {
        final authError = ref.read(authProvider).error;
        if (authError != null) setState(() => _deployError = authError);
      }
      return;
    }

    final canDeployLocal = ServerDeployService().canDeploy;
    setState(() {
      _deployStarted = true;
      _deployError = null;
      _deployComplete = false;
      _deployMessage = 'Preparing…';
    });

    if (canDeployLocal) {
      await ref
          .read(serverProcessProvider.notifier)
          .deploy(
            onProgress: (msg) {
              if (mounted) setState(() => _deployMessage = msg);
            },
          );
    } else {
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
      setState(() => _deployMessage = 'Connecting to server…');
      await _bootstrapAfterDeploy();
      if (mounted) {
        setState(() {
          _deployComplete = true;
          _deployMessage = 'Server deployed and connected!';
        });
      }
    }
  }

  Future<void> _bootstrapAfterDeploy() async {
    const localServerUrl = 'https://localhost:47990';
    final authNotifier = ref.read(authProvider.notifier);
    final authState = ref.read(authProvider);

    if (authState.mode == AuthMode.cloudAccount &&
        SupabaseConfig.current.isConfigured) {
      if (mounted) setState(() => _deployMessage = 'Configuring cloud sync…');
      try {
        final client = ApiClient(
          baseUrl: localServerUrl,
          tokenProvider: authNotifier,
        );
        final configApi = ConfigApi(client: client);
        final supabaseSession = Supabase.instance.client.auth.currentSession;
        await configApi.applyConfig({
          'cloud_supabase_url': SupabaseConfig.current.url,
          'cloud_supabase_key': SupabaseConfig.current.publishableKey,
          if (supabaseSession != null)
            'cloud_user_token': supabaseSession.accessToken,
          'cloud_heartbeat_interval': 60,
        });
      } catch (e) {
        debugPrint('Cloud config push failed: $e');
      }
    }
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
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            final isCloud = auth.mode == AuthMode.cloudAccount;
            return AlertDialog(
              title: Text(
                isCloud ? 'Confirm Account Password' : 'Create Server Login',
              ),
              content: Form(
                key: formKey,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isCloud
                            ? 'Confirm your password to secure the server. '
                                  'It stays in memory only for this deploy.'
                            : 'Create the first server username and password.',
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      if (!isCloud) ...[
                        TextFormField(
                          controller: usernameController,
                          decoration: const InputDecoration(
                            labelText: 'Server username',
                            prefixIcon: Icon(LucideIcons.user),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty)
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: AppSpacing.base),
                      ],
                      TextFormField(
                        controller: passwordController,
                        obscureText: obscurePassword,
                        decoration: InputDecoration(
                          labelText: isCloud
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
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Required';
                          if (v.length < 8) return 'Use at least 8 characters';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () {
                    if (!formKey.currentState!.validate()) return;
                    Navigator.of(ctx).pop((
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

    if (result == null) return false;

    if (auth.mode == AuthMode.cloudAccount && auth.username != null) {
      final error = await authNotifier.validateCloudPassword(
        email: auth.username!,
        password: result.password,
      );
      if (error != null && mounted) {
        setState(() => _deployError = error);
        return false;
      }
      return error == null;
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
        _SetupStepIndicator(current: 1, total: _totalSetupSteps - 1),
        const SizedBox(height: AppSpacing.xxl),
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: _deployComplete
                ? const Color(0xFF22C55E).withValues(alpha: 0.15)
                : colorScheme.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(
            _deployComplete ? LucideIcons.checkCircle : LucideIcons.hardDrive,
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
          'The streaming backend will be installed and secured '
          'with your credentials.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),

        if (_deployStarted && !_deployComplete) ...[
          _DeployProgressCard(
            message: _deployMessage ?? 'Installing…',
            progress: processStatus.installProgress,
            colorScheme: colorScheme,
            theme: theme,
          ),
        ] else if (_deployComplete) ...[
          const _SuccessBanner(
            message: 'Server deployed and running on port 47990.',
          ),
        ] else ...[
          _InfoBanner(
            icon: LucideIcons.shieldCheck,
            message:
                'Windows will ask for administrator permission '
                'to install the server service.',
            colorScheme: colorScheme,
            theme: theme,
          ),
          const SizedBox(height: AppSpacing.md),
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
                      ? 'Local build detected — deploy from build output.'
                      : 'Latest release will be downloaded and installed.',
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

        if (_deployError != null) ...[
          const SizedBox(height: AppSpacing.md),
          _ErrorBanner(
            message: _deployError!,
            onRetry: () => setState(() {
              _deployError = null;
              _deployStarted = false;
            }),
          ),
        ],

        const SizedBox(height: AppSpacing.xxl),
        _NavigationRow(
          onBack: (_deployStarted && !_deployComplete) ? null : _backSetup,
          onNext: (_deployStarted && !_deployComplete) ? null : _nextSetup,
        ),
      ],
    );
  }

  // ── Step 1b: Connect Server ─────────────────────────────────────────────────

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
            _connectError = 'Could not connect. Check URL and credentials.';
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

  Widget _buildConnectStep(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _SetupStepIndicator(current: 1, total: _totalSetupSteps - 1),
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
          'Enter the address of your running Jujo.Stream server.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),
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

        if (_connectError != null) ...[
          _ErrorBanner(message: _connectError!),
          const SizedBox(height: AppSpacing.base),
        ],
        if (_connectSuccess) ...[
          const _SuccessBanner(message: 'Connected successfully!'),
          const SizedBox(height: AppSpacing.base),
        ],

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
        _NavigationRow(onBack: _backSetup, onNext: _nextSetup),
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
        _SetupStepIndicator(current: 2, total: _totalSetupSteps - 1),
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
          'Connect your game platforms so Jujo.Stream can detect '
          'installed games. You can always do this later.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
            height: 1.55,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),
        _SourceOptionTile(
          icon: LucideIcons.flame,
          color: const Color(0xFF1B2838),
          title: 'Steam',
          description: 'Import your Steam library.',
          onConnect: _finishAndOpenSources,
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.mountain,
          color: const Color(0xFF2A2A2A),
          title: 'Epic Games',
          description: 'Connect Epic Games launcher.',
          onConnect: _finishAndOpenSources,
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.gamepad2,
          color: const Color(0xFF107C10),
          title: 'Xbox / Game Pass',
          description: 'Connect Microsoft/Xbox.',
          onConnect: _finishAndOpenSources,
        ),
        const SizedBox(height: AppSpacing.md),
        _SourceOptionTile(
          icon: LucideIcons.plus,
          color: colorScheme.primary,
          title: 'Manual',
          description: 'Add games by executable path.',
          onConnect: _finishAndOpenSources,
        ),
        const SizedBox(height: AppSpacing.xxl),
        _NavigationRow(
          onBack: _nextSetup,
          onNext: _nextSetup,
          backLabel: 'Skip',
          nextLabel: 'Continue',
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
        _SetupStepIndicator(current: 3, total: _totalSetupSteps - 1),
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
          'Head to the Dashboard to monitor your server, '
          'manage your library, and start streaming.\n\n'
          'For dedicated hosts, open Settings > Connection > Unattended Startup '
          'to configure AutoLogon and verify service startup readiness.',
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

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

/// A single showcase page with icon cluster, title, description, and features.
class _ShowcasePage extends StatelessWidget {
  const _ShowcasePage({
    required this.icon,
    required this.accentIcon,
    required this.title,
    required this.description,
    required this.features,
  });

  final IconData icon;
  final IconData accentIcon;
  final String title;
  final String description;
  final List<String> features;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon cluster
          SizedBox(
            width: 120,
            height: 120,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer.withValues(alpha: 0.4),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 44, color: colorScheme.primary),
                ),
                Positioned(
                  right: 0,
                  bottom: 8,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: colorScheme.tertiaryContainer,
                      shape: BoxShape.circle,
                      border: Border.all(color: colorScheme.surface, width: 3),
                    ),
                    child: Icon(
                      accentIcon,
                      size: 18,
                      color: colorScheme.onTertiaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text(
            title,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.base),
          Text(
            description,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.check, size: 16, color: colorScheme.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Flexible(
                    child: Text(
                      f,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Step progress indicator dots for setup flow.
class _SetupStepIndicator extends StatelessWidget {
  const _SetupStepIndicator({required this.current, required this.total});

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

/// Option card for the setup choice step.
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

/// Game source tile.
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

/// Back/Next navigation row.
class _NavigationRow extends StatelessWidget {
  const _NavigationRow({
    this.onBack,
    this.onNext,
    this.backLabel = 'Back',
    this.nextLabel = 'Continue',
  });

  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final String backLabel;
  final String nextLabel;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(onPressed: onBack, child: Text(backLabel)),
        ),
        const SizedBox(width: AppSpacing.base),
        Expanded(
          child: FilledButton(onPressed: onNext, child: Text(nextLabel)),
        ),
      ],
    );
  }
}

/// Deploy progress card with shield indicator.
class _DeployProgressCard extends StatelessWidget {
  const _DeployProgressCard({
    required this.message,
    required this.progress,
    required this.colorScheme,
    required this.theme,
  });

  final String message;
  final double? progress;
  final ColorScheme colorScheme;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.4)),
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
                  value: (progress != null && progress! > 0) ? progress : null,
                  color: colorScheme.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message,
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
          if (progress != null) ...[
            const SizedBox(height: AppSpacing.md),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.full),
              child: LinearProgressIndicator(
                value: progress! > 0 ? progress : null,
                minHeight: 4,
                backgroundColor: colorScheme.outlineVariant,
                color: colorScheme.primary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Success banner.
class _SuccessBanner extends StatelessWidget {
  const _SuccessBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
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
              message,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF22C55E),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Error banner with optional retry.
class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, this.onRetry});
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colorScheme.errorContainer.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.error.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.alertCircle, size: 16, color: colorScheme.error),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  message,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onErrorContainer,
                  ),
                ),
              ),
            ],
          ),
          if (onRetry != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.tonal(
                onPressed: onRetry,
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
        ],
      ),
    );
  }
}

/// Info banner (e.g., UAC warning).
class _InfoBanner extends StatelessWidget {
  const _InfoBanner({
    required this.icon,
    required this.message,
    required this.colorScheme,
    required this.theme,
  });

  final IconData icon;
  final String message;
  final ColorScheme colorScheme;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: colorScheme.tertiaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.tertiary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: colorScheme.tertiary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onTertiaryContainer,
                fontSize: 11,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
