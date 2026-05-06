import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/platform/desktop_window.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

const double _kLoginBreakpoint = 800.0;

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _isSignUp = false;
  bool _awaitingConfirmation = false;
  Timer? _confirmationTimer;
  String? _error;
  String? _info;

  @override
  void initState() {
    super.initState();
    _usernameController.text = ref.read(authProvider).username ?? '';
  }

  @override
  void dispose() {
    _confirmationTimer?.cancel();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() {
    return _isSignUp ? _handleSignUp() : _handleLogin();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _info = null;
    });

    final success = await ref
        .read(authProvider.notifier)
        .login(
          username: _usernameController.text.trim(),
          password: _passwordController.text,
        );

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (!success) {
        _error = ref.read(authProvider).error ?? 'Login failed';
      }
    });
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _info = null;
    });

    final success = await ref
        .read(authProvider.notifier)
        .signUp(
          email: _usernameController.text.trim(),
          password: _passwordController.text,
        );

    if (!mounted) return;
    final message = ref.read(authProvider).error;
    setState(() {
      _isLoading = false;
      if (!success) {
        if (message?.startsWith('Account created.') == true) {
          _info = message;
          _awaitingConfirmation = true;
          _startConfirmationPolling();
        } else {
          _error = message ?? 'Sign up failed';
        }
      }
    });
  }

  /// Polls Supabase every 5s to check if the user confirmed their email.
  /// On success, auto-logs in with the stored credentials.
  void _startConfirmationPolling() {
    _confirmationTimer?.cancel();
    if (!SupabaseConfig.current.isConfigured) return;

    _confirmationTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) async {
        if (!mounted) {
          _confirmationTimer?.cancel();
          return;
        }

        // Try logging in — will succeed once email is confirmed
        final success = await ref
            .read(authProvider.notifier)
            .login(
              username: _usernameController.text.trim(),
              password: _passwordController.text,
            );

        if (success && mounted) {
          _confirmationTimer?.cancel();
          setState(() {
            _awaitingConfirmation = false;
            _info = null;
          });
        }
      },
    );
  }

  Future<void> _resendConfirmationEmail() async {
    if (!SupabaseConfig.current.isConfigured) return;

    setState(() => _isLoading = true);
    try {
      await Supabase.instance.client.auth.resend(
        type: OtpType.signup,
        email: _usernameController.text.trim(),
      );
      if (mounted) {
        setState(() {
          _isLoading = false;
          _info = 'Confirmation email resent. Check your inbox.';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Could not resend: $e';
        });
      }
    }
  }

  Future<void> _handleContinueWithoutAccount() async {
    setState(() {
      _isLoading = true;
      _error = null;
      _info = null;
    });

    await ref
        .read(authProvider.notifier)
        .continueWithoutAccount(username: _usernameController.text);

    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  Future<void> _handleGoogleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
      _info = null;
    });

    final launched = await ref.read(authProvider.notifier).signInWithGoogle();

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (!launched) {
        _error = ref.read(authProvider).error ?? 'Google login failed';
      }
    });
  }

  Future<void> _handleForgotPassword() async {
    final email = _usernameController.text.trim();
    setState(() {
      _isLoading = true;
      _error = null;
      _info = null;
    });

    final sent = await ref
        .read(authProvider.notifier)
        .sendPasswordResetEmail(email);

    if (!mounted) return;
    final message = ref.read(authProvider).error;
    setState(() {
      _isLoading = false;
      if (sent) {
        _info = message ?? 'Password reset email sent. Check your inbox.';
      } else {
        _error = message ?? 'Password reset failed';
      }
    });
  }

  Widget _buildForm(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _usernameController,
            decoration: InputDecoration(
              labelText: _isSignUp ? 'Email' : 'Email or username',
              prefixIcon: const Icon(LucideIcons.user),
            ),
            keyboardType: _isSignUp
                ? TextInputType.emailAddress
                : TextInputType.text,
            textInputAction: TextInputAction.next,
            validator: (value) {
              final text = value?.trim() ?? '';
              if (text.isEmpty) return 'Email or username is required';
              if (_isSignUp && !text.contains('@')) {
                return 'Valid email is required';
              }
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.base),
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(LucideIcons.lock),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                  size: 18,
                ),
                tooltip: _obscurePassword ? 'Show password' : 'Hide password',
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _handleSubmit(),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Password is required';
              if (_isSignUp && value.length < 6) {
                return 'Use at least 6 characters';
              }
              return null;
            },
          ),
          if (!_isSignUp) ...[
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _isLoading ? null : _handleForgotPassword,
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xs,
                  ),
                  minimumSize: const Size(0, 32),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Forgot password?'),
              ),
            ),
          ] else
            const SizedBox(height: AppSpacing.sm),
          const SizedBox(height: AppSpacing.md),
          if (_isSignUp) ...[
            _MessageBanner(
              icon: LucideIcons.cloud,
              text:
                  'Create an account to sync joined servers, trusted devices, approvals, configuration snapshots, game library metadata, and dashboard history across Jujo apps.',
              background: colorScheme.primaryContainer,
              foreground: colorScheme.onPrimaryContainer,
            ),
            const SizedBox(height: AppSpacing.base),
          ],
          if (_error != null) ...[
            _MessageBanner(
              icon: LucideIcons.alertCircle,
              text: _error!,
              background: colorScheme.errorContainer,
              foreground: colorScheme.onErrorContainer,
            ),
            const SizedBox(height: AppSpacing.base),
          ],
          if (_info != null) ...[
            _MessageBanner(
              icon: LucideIcons.mailCheck,
              text: _info!,
              background: colorScheme.secondaryContainer,
              foreground: colorScheme.onSecondaryContainer,
            ),
            if (_awaitingConfirmation) ...[
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Waiting for confirmation…',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                      fontSize: 10,
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: _isLoading ? null : _resendConfirmationEmail,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      minimumSize: const Size(0, 28),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Resend', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
            ],
            const SizedBox(height: AppSpacing.base),
          ],
          FilledButton(
            onPressed: _isLoading ? null : _handleSubmit,
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.base),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(
                    _isSignUp ? 'Create Account' : 'Sign In',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton.icon(
            onPressed: _isLoading ? null : _handleGoogleLogin,
            icon: const Text(
              'G',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
            ),
            label: const FittedBox(child: Text('Login with Google')),
          ),
          const SizedBox(height: AppSpacing.xs),
          TextButton(
            onPressed: _isLoading
                ? null
                : () => setState(() {
                    _isSignUp = !_isSignUp;
                    _error = null;
                    _info = null;
                  }),
            child: Text(
              _isSignUp
                  ? 'Already have an account? Sign in'
                  : 'Need cloud sync? Create account',
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 2,
            children: [
              Text(
                'or',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontSize: 10,
                ),
              ),
              TextButton(
                onPressed: _isLoading ? null : _handleContinueWithoutAccount,
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  minimumSize: const Size(0, 24),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  visualDensity: VisualDensity.compact,
                ),
                child: const Text(
                  'Continue without account',
                  style: TextStyle(fontSize: 11),
                ),
              ),
            ],
          ),
          Text(
            'Local-only uses manual servers and QR/PIN pairing.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontSize: 9.5,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWideLayout(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1020, maxHeight: 520),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.xxl),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Expanded(flex: 5, child: _BrandPanel()),
                Expanded(
                  flex: 4,
                  child: Container(
                    color: colorScheme.surface,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.xxl,
                      vertical: AppSpacing.xl,
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            _isSignUp ? 'Create Account' : 'Sign In',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            _isSignUp
                                ? 'Use cloud sync across servers and clients'
                                : 'Access cloud sync or continue local-only',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          _buildForm(context),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNarrowLayout(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          'assets/login_modal/login-modal-screen.jpg',
          fit: BoxFit.cover,
        ),
        BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
          child: Container(color: Colors.black.withValues(alpha: 0.52)),
        ),
        Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 486),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.xxl),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    decoration: BoxDecoration(
                      color: colorScheme.surface.withValues(alpha: 0.88),
                      borderRadius: BorderRadius.circular(AppRadius.xxl),
                      border: Border.all(
                        color: colorScheme.outlineVariant.withValues(
                          alpha: 0.25,
                        ),
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.radio,
                          size: 40,
                          color: colorScheme.primary,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'Jujo.Stream',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Game Streaming Server',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        _buildForm(context),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth >= _kLoginBreakpoint) {
                return _buildWideLayout(context);
              }
              return _buildNarrowLayout(context);
            },
          ),
          const Positioned(top: 12, right: 12, child: _LoginCloseButton()),
        ],
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          'assets/login_modal/login-modal-screen.jpg',
          fit: BoxFit.cover,
        ),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              stops: [0.0, 0.5, 1.0],
              colors: [Color(0x00000000), Color(0x55000000), Color(0xCC000000)],
            ),
          ),
        ),
        Positioned(
          left: AppSpacing.xxxl,
          bottom: AppSpacing.xxxl,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.radio, size: 32, color: Colors.white),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Jujo.Stream',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Game Streaming Server',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.white60,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MessageBanner extends StatelessWidget {
  const _MessageBanner({
    required this.icon,
    required this.text,
    required this.background,
    required this.foreground,
  });

  final IconData icon;
  final String text;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: foreground),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodySmall?.copyWith(
                color: foreground,
                fontSize: 11,
                height: 1.25,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoginCloseButton extends StatelessWidget {
  const _LoginCloseButton();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Tooltip(
      message: 'Close',
      child: IconButton.filledTonal(
        onPressed: closeAppWindow,
        icon: const Icon(LucideIcons.x, size: 18),
        color: colorScheme.onSurface,
        style: IconButton.styleFrom(
          backgroundColor: colorScheme.surface.withValues(alpha: 0.86),
          fixedSize: const Size.square(36),
          minimumSize: const Size.square(36),
          maximumSize: const Size.square(36),
        ),
      ),
    );
  }
}
