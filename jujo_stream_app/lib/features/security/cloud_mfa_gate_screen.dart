import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:qr_flutter/qr_flutter.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/cloud_mfa_provider.dart';
import 'package:jujo_stream_app/core/providers/onboarding_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';

class CloudMfaGateScreen extends ConsumerStatefulWidget {
  const CloudMfaGateScreen({super.key});

  @override
  ConsumerState<CloudMfaGateScreen> createState() => _CloudMfaGateScreenState();
}

class _CloudMfaGateScreenState extends ConsumerState<CloudMfaGateScreen> {
  final _codeController = TextEditingController();

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final ok = await ref
        .read(cloudMfaProvider.notifier)
        .verifyCode(_codeController.text);
    if (!mounted || !ok) return;
    final onboardingDone = ref.read(onboardingProvider) ?? false;
    context.go(onboardingDone ? '/' : '/onboarding');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final auth = ref.watch(authProvider);
    final mfa = ref.watch(cloudMfaProvider);
    final loading = mfa.status == CloudMfaStatus.loading;
    final needsSetup = mfa.status == CloudMfaStatus.setupRequired;
    final canVerify = (mfa.verifiedFactorId ?? mfa.enrollmentFactorId) != null;

    return PopScope(
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest.withValues(
                      alpha: 0.45,
                    ),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: colorScheme.outlineVariant),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: colorScheme.primary.withValues(
                                  alpha: 0.14,
                                ),
                                borderRadius: BorderRadius.circular(
                                  AppRadius.md,
                                ),
                              ),
                              child: Icon(
                                LucideIcons.shieldCheck,
                                color: colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Secure your cloud account',
                                    style: theme.textTheme.titleLarge,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    auth.username ?? 'Jujo Cloud',
                                    overflow: TextOverflow.ellipsis,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        Text(
                          needsSetup
                              ? 'Two-factor authentication is required before cloud server management can continue.'
                              : 'Enter your authenticator code to unlock cloud server management.',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        if (loading)
                          const Center(child: CircularProgressIndicator())
                        else ...[
                          if (needsSetup && mfa.enrollmentUri == null)
                            FilledButton.icon(
                              onPressed: () => ref
                                  .read(cloudMfaProvider.notifier)
                                  .startTotpSetup(),
                              icon: const Icon(LucideIcons.qrCode),
                              label: const Text('Set Up 2FA'),
                            ),
                          if (needsSetup && mfa.enrollmentUri != null) ...[
                            Center(
                              child: Container(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(
                                    AppRadius.md,
                                  ),
                                ),
                                child: QrImageView(
                                  data: mfa.enrollmentUri!,
                                  size: 200,
                                  backgroundColor: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.md),
                            if (mfa.enrollmentSecret != null)
                              _SecretBox(secret: mfa.enrollmentSecret!),
                          ],
                          if (canVerify) ...[
                            const SizedBox(height: AppSpacing.md),
                            TextField(
                              controller: _codeController,
                              autofocus: true,
                              keyboardType: TextInputType.number,
                              textInputAction: TextInputAction.done,
                              maxLength: 6,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                              decoration: const InputDecoration(
                                labelText: 'Authenticator code',
                                counterText: '',
                              ),
                              onSubmitted: (_) => _submit(),
                            ),
                            const SizedBox(height: AppSpacing.md),
                            FilledButton.icon(
                              onPressed: _submit,
                              icon: const Icon(LucideIcons.lock),
                              label: const Text('Verify 2FA'),
                            ),
                          ],
                          if (mfa.status == CloudMfaStatus.error)
                            OutlinedButton.icon(
                              onPressed: () =>
                                  ref.read(cloudMfaProvider.notifier).refresh(),
                              icon: const Icon(LucideIcons.refreshCw),
                              label: const Text('Try Again'),
                            ),
                        ],
                        if (mfa.error != null) ...[
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            mfa.error!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: colorScheme.error,
                            ),
                          ),
                        ],
                        const SizedBox(height: AppSpacing.md),
                        TextButton(
                          onPressed: () =>
                              ref.read(authProvider.notifier).logout(),
                          child: const Text('Sign out'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SecretBox extends StatelessWidget {
  const _SecretBox({required this.secret});

  final String secret;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          Expanded(
            child: SelectableText(
              secret,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
          IconButton(
            tooltip: 'Copy secret',
            onPressed: () => Clipboard.setData(ClipboardData(text: secret)),
            icon: const Icon(LucideIcons.copy, size: 18),
          ),
        ],
      ),
    );
  }
}
