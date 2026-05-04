import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

/// Breakpoint that switches between horizontal (web) and vertical (app) layout.
const double _kLoginBreakpoint = 800.0;

/// Login screen — responsive:
/// - Wide (≥800px): horizontal card — gaming image left, form right.
/// - Narrow (<800px): full-screen blurred background + frosted vertical card.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _serverController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    final authState = ref.read(authProvider);
    if (authState.serverUrl != null) {
      _serverController.text = authState.serverUrl!;
    } else {
      _serverController.text = 'https://192.168.1.';
    }
  }

  @override
  void dispose() {
    _serverController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    final serverUrl = _serverController.text.trim();
    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    final success = await ref.read(authProvider.notifier).login(
          serverUrl: serverUrl,
          username: username,
          password: password,
        );

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (!success) {
          _error = ref.read(authProvider).error ?? 'Login failed';
        }
      });
    }
  }

  // ── Shared form ─────────────────────────────────────────────────────────────

  Widget _buildForm(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Server URL
          TextFormField(
            controller: _serverController,
            decoration: const InputDecoration(
              labelText: 'Server Address',
              hintText: 'https://192.168.1.100:47990',
              prefixIcon: Icon(LucideIcons.server),
            ),
            keyboardType: TextInputType.url,
            textInputAction: TextInputAction.next,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Server address is required';
              }
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.base),

          // Username
          TextFormField(
            controller: _usernameController,
            decoration: const InputDecoration(
              labelText: 'Username',
              prefixIcon: Icon(LucideIcons.user),
            ),
            textInputAction: TextInputAction.next,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Username is required';
              }
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.base),

          // Password
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
            onFieldSubmitted: (_) => _handleLogin(),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Password is required';
              }
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.xl),

          // Error banner
          if (_error != null) ...[
            Container(
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
                      _error!,
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

          // Sign In button
          FilledButton(
            onPressed: _isLoading ? null : _handleLogin,
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
                : const Text(
                    'Sign In',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
          ),
        ],
      ),
    );
  }

  // ── Wide layout (web ≥800px) ─────────────────────────────────────────────────

  Widget _buildWideLayout(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 960, maxHeight: 540),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.xxl),
            child: Row(
              children: [
                // Left: gaming image + branding overlay
                const Expanded(flex: 5, child: _BrandPanel()),

                // Right: form panel
                Expanded(
                  flex: 4,
                  child: Container(
                    color: colorScheme.surface,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.xxxl,
                      vertical: AppSpacing.xxl,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Sign In',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Connect to your streaming server',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xxl),
                        _buildForm(context),
                        const SizedBox(height: AppSpacing.base),
                        Text(
                          'Default port: 47990 (HTTPS)',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
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

  // ── Narrow layout (app <800px) ───────────────────────────────────────────────

  Widget _buildNarrowLayout(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Stack(
      fit: StackFit.expand,
      children: [
        // Full-screen background image
        Image.asset(
          'assets/login_modal/login-modal-screen.jpg',
          fit: BoxFit.cover,
        ),

        // Blur + darken overlay
        BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
          child: Container(
            color: Colors.black.withValues(alpha: 0.52),
          ),
        ),

        // Frosted glass card, centered
        Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.xxl),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.xxxl),
                    decoration: BoxDecoration(
                      color: colorScheme.surface.withValues(alpha: 0.88),
                      borderRadius: BorderRadius.circular(AppRadius.xxl),
                      border: Border.all(
                        color:
                            colorScheme.outlineVariant.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.radio,
                            size: 40, color: colorScheme.primary),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'Jujo.Stream',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Game Streaming Server',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xxl),
                        _buildForm(context),
                        const SizedBox(height: AppSpacing.base),
                        Text(
                          'Default port: 47990 (HTTPS)',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                          textAlign: TextAlign.center,
                        ),
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
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= _kLoginBreakpoint) {
            return _buildWideLayout(context);
          }
          return _buildNarrowLayout(context);
        },
      ),
    );
  }
}

// ── Sub-widget ────────────────────────────────────────────────────────────────

/// Left panel for the wide layout: gaming image + gradient + brand text.
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

        // Diagonal gradient: transparent top-right → dark bottom-left
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              stops: [0.0, 0.5, 1.0],
              colors: [
                Color(0x00000000),
                Color(0x55000000),
                Color(0xCC000000),
              ],
            ),
          ),
        ),

        // Brand text — bottom-left
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
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Game Streaming Server',
                style: theme.textTheme.bodyMedium?.copyWith(
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
