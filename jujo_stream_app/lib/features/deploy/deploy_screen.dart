import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/providers/server_process_provider.dart';
import 'package:jujo_stream_app/core/providers/server_status_provider.dart';
import 'package:jujo_stream_app/core/services/server_deploy_service.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/shared/widgets/molecules/status_chip.dart';

// ─── Provider ─────────────────────────────────────────────────────────────────

/// Whether a local build of the server is available for deployment.
final _localBuildAvailableProvider = Provider<bool>((ref) {
  return ServerDeployService().canDeploy;
});

// ─── Screen ───────────────────────────────────────────────────────────────────

/// Dedicated screen for installing / updating the Jujo.Stream Server backend.
///
/// Two install paths:
///   1. **Deploy from local build** — copies the C++ build output and registers
///      the Windows Service. Developer workflow only; visible when `canDeploy`.
///   2. **Download from GitHub** — fetches the latest release installer and runs
///      it silently. Works on any machine with internet access.
class DeployScreen extends ConsumerWidget {
  const DeployScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final processStatus = ref.watch(serverProcessProvider);
    final localBuildAvailable = ref.watch(_localBuildAvailableProvider);

    // Shield: prevent navigation away during critical install phase
    return PopScope(
      canPop: !processStatus.isInstalling,
      child: SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──────────────────────────────────────────────────────────
          Text(
            'DEPLOY',
            style: theme.textTheme.labelSmall?.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('Server Installation', style: theme.textTheme.headlineSmall),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Install or update the Jujo.Stream Server backend on this machine.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),

          // ── Server Status ────────────────────────────────────────────────────
          _ServerStatusCard(processStatus: processStatus),
          const SizedBox(height: AppSpacing.xxl),

          // ── Install methods ──────────────────────────────────────────────────
          if (processStatus.isInstalling)
            _InstallProgressCard(status: processStatus)
          else ...[
            Text(
              'INSTALLATION METHOD',
              style: theme.textTheme.labelSmall?.copyWith(
                color: colorScheme.primary,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Local build (dev) — only visible when build output exists
            if (localBuildAvailable) ...[
              _InstallMethodCard(
                icon: LucideIcons.hardDrive,
                title: 'Deploy from local build',
                subtitle:
                    'Copy the C++ build output, register and start the Windows Service. '
                    'No internet required.',
                badge: 'DEV',
                badgeColor: colorScheme.tertiary,
                enabled: !processStatus.isBusy,
                onTap: () async {
                  if (await _prepareServerCredentials(context, ref)) {
                    await ref.read(serverProcessProvider.notifier).deploy();
                  }
                },
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            // GitHub release — always visible
            _InstallMethodCard(
              icon: LucideIcons.download,
              title: 'Download from GitHub',
              subtitle:
                  'Fetch the latest Jujo.Stream Server release and install it '
                  'silently. Verifies SHA-256 before running.',
              enabled: !processStatus.isBusy,
              onTap: () async {
                if (await _prepareServerCredentials(context, ref)) {
                  await ref.read(serverProcessProvider.notifier).install();
                }
              },
            ),
          ],

          // ── Error ────────────────────────────────────────────────────────────
          if (processStatus.error != null) ...[
            const SizedBox(height: AppSpacing.lg),
            _ErrorCard(
              message: processStatus.error!,
              errorKind: processStatus.deployErrorKind,
              onRetry: processStatus.isBusy
                  ? null
                  : () async {
                      if (await _prepareServerCredentials(context, ref)) {
                        await ref.read(serverProcessProvider.notifier).deploy();
                      }
                    },
            ),
          ],

          // ── After success: connect button ────────────────────────────────────
          if (processStatus.isRunning || processStatus.isStopped) ...[
            const SizedBox(height: AppSpacing.xxl),
            _SuccessActions(context: context, ref: ref),
          ],
        ],
      ),
      ),
    );
  }

  Future<bool> _prepareServerCredentials(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final auth = ref.read(authProvider);
    final authNotifier = ref.read(authProvider.notifier);
    if (authNotifier.hasServerBootstrapPassword) return true;

    final result = await showDialog<_ServerCredentialResult>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _ServerCredentialDialog(authState: auth),
    );
    if (result == null) return false;

    // For cloud accounts, we need the password in memory for server bootstrap.
    if (auth.mode == AuthMode.cloudAccount && auth.username != null) {
      if (result.isServerOnlyPassword) {
        // OAuth user: just store the password for server bootstrap.
        // No Supabase password to validate against.
        await authNotifier.setServerBootstrapCredentials(
          username: auth.username,
          password: result.password,
        );
        return true;
      }
      // Email/password user: validate password against Supabase WITHOUT
      // triggering auth state changes (prevents red screen flash).
      final error = await authNotifier.validateCloudPassword(
        email: auth.username!,
        password: result.password,
      );
      if (error != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
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
}

// ─── Server Status Card ───────────────────────────────────────────────────────

class _ServerCredentialResult {
  const _ServerCredentialResult({
    this.username,
    required this.password,
    this.isServerOnlyPassword = false,
  });

  final String? username;
  final String password;

  /// True when the user is setting a server-only password (OAuth users who
  /// don't have a Supabase email/password credential).
  final bool isServerOnlyPassword;
}

class _ServerCredentialDialog extends StatefulWidget {
  const _ServerCredentialDialog({required this.authState});

  final AuthState authState;

  @override
  State<_ServerCredentialDialog> createState() =>
      _ServerCredentialDialogState();
}

class _ServerCredentialDialogState extends State<_ServerCredentialDialog> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  bool get _isCloudAccount => widget.authState.mode == AuthMode.cloudAccount;
  bool get _isOAuthOnly =>
      _isCloudAccount && !widget.authState.hasPasswordProvider;

  @override
  void initState() {
    super.initState();
    _usernameController.text = widget.authState.username ?? '';
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final dialogTitle = _isOAuthOnly
        ? 'Set Server Password'
        : _isCloudAccount
        ? 'Confirm Account Password'
        : 'Create Server Login';

    final dialogDescription = _isOAuthOnly
        ? 'You signed in with Google. Set a password for your streaming server admin access. This is separate from your Google account.'
        : _isCloudAccount
        ? 'The server will be secured with your signed-in account identity. Confirm your password once; it stays in memory only for this deploy.'
        : 'No account is signed in. Create the first server username and password. This local-only path uses manual servers and legacy QR/PIN pairing.';

    return AlertDialog(
      title: Text(dialogTitle),
      content: Form(
        key: _formKey,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                dialogDescription,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              if (!_isCloudAccount) ...[
                TextFormField(
                  controller: _usernameController,
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
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: _isOAuthOnly
                      ? 'New server password'
                      : _isCloudAccount
                      ? 'Account password'
                      : 'Server password',
                  prefixIcon: const Icon(LucideIcons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                      size: 18,
                    ),
                    tooltip: _obscurePassword
                        ? 'Show password'
                        : 'Hide password',
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                ),
                obscureText: _obscurePassword,
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
            if (!_formKey.currentState!.validate()) return;
            Navigator.of(context).pop(
              _ServerCredentialResult(
                username: _usernameController.text.trim(),
                password: _passwordController.text,
                isServerOnlyPassword: _isOAuthOnly,
              ),
            );
          },
          child: const Text('Continue'),
        ),
      ],
    );
  }
}

class _ServerStatusCard extends StatelessWidget {
  const _ServerStatusCard({required this.processStatus});

  final ServerProcessStatus processStatus;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final (label, chipState, detail) = switch (processStatus.state) {
      ServerProcessState.running => (
        'Running',
        StatusChipState.ready,
        processStatus.installPath,
      ),
      ServerProcessState.stopped => (
        'Installed',
        StatusChipState.warning,
        processStatus.installPath,
      ),
      ServerProcessState.notInstalled => (
        'Not installed',
        StatusChipState.error,
        'Install the server to start streaming',
      ),
      ServerProcessState.installing => (
        'Installing…',
        StatusChipState.pending,
        processStatus.installProgressMessage ?? 'Working…',
      ),
      _ => ('Unknown', StatusChipState.pending, null),
    };

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              LucideIcons.server,
              size: 24,
              color: colorScheme.primary,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Jujo.Stream Server',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (detail != null)
                  Text(
                    detail,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          StatusChip(label: label, state: chipState),
        ],
      ),
    );
  }
}

// ─── Install Method Card ──────────────────────────────────────────────────────

class _InstallMethodCard extends StatelessWidget {
  const _InstallMethodCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
    this.badgeColor,
    this.enabled = true,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final String? badge;
  final Color? badgeColor;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(icon, size: 22, color: colorScheme.primary),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (badge != null) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: (badgeColor ?? colorScheme.tertiary)
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                            ),
                            child: Text(
                              badge!,
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: badgeColor ?? colorScheme.tertiary,
                                fontWeight: FontWeight.w700,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Icon(
                LucideIcons.chevronRight,
                size: 16,
                color: colorScheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Progress Card ────────────────────────────────────────────────────────────

class _InstallProgressCard extends StatelessWidget {
  const _InstallProgressCard({required this.status});

  final ServerProcessStatus status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final progress = status.installProgress ?? 0.0;
    final message = status.installProgressMessage;
    final pct = (progress * 100).toStringAsFixed(0);
    final log = status.installLog;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.primary.withValues(alpha: 0.4)),
        color: colorScheme.primaryContainer.withValues(alpha: 0.12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SizedBox(
                width: 36,
                height: 36,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  value: progress > 0 && progress < 1 ? progress : null,
                  color: colorScheme.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message ??
                          (progress < 1.0
                              ? 'Deploying… $pct%'
                              : 'Finishing up…'),
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
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress > 0 && progress < 1 ? progress : null,
              minHeight: 4,
              backgroundColor: colorScheme.outlineVariant,
              color: colorScheme.primary,
            ),
          ),

          // ── Log panel ──────────────────────────────────────────────────────
          if (log.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              constraints: const BoxConstraints(maxHeight: 120),
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: colorScheme.surface,
                borderRadius: BorderRadius.circular(AppRadius.sm),
                border: Border.all(color: colorScheme.outlineVariant),
              ),
              child: SingleChildScrollView(
                reverse: true,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: log.map((line) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(top: 2, right: 6),
                            child: Icon(
                              LucideIcons.chevronRight,
                              size: 10,
                              color: colorScheme.primary,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              line,
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontFamily: 'monospace',
                                color: colorScheme.onSurfaceVariant,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Error Card ───────────────────────────────────────────────────────────────

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, this.errorKind, this.onRetry});

  final String message;
  final DeployErrorKind? errorKind;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final (icon, hint) = switch (errorKind) {
      DeployErrorKind.uacDenied => (
        LucideIcons.shieldOff,
        'Click Retry and approve the Windows UAC prompt.',
      ),
      DeployErrorKind.buildNotFound => (
        LucideIcons.packageX,
        'Run the C++ build task (cmake: build) in VS Code, then try again.',
      ),
      DeployErrorKind.copyFailed => (
        LucideIcons.copyX,
        'File copy failed. Ensure the target directory is not locked by another process.',
      ),
      DeployErrorKind.serviceError => (
        LucideIcons.serverCrash,
        'Service registration failed. Try stopping any existing Sunshine or Jujo.Server service first.',
      ),
      _ => (LucideIcons.alertCircle, null),
    };

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: colorScheme.errorContainer.withValues(alpha: 0.25),
        border: Border.all(color: colorScheme.error.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 18, color: colorScheme.error),
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
          if (hint != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Padding(
              padding: const EdgeInsets.only(left: 26),
              child: Text(
                hint,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ],
          if (onRetry != null) ...[
            const SizedBox(height: AppSpacing.md),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.tonalIcon(
                onPressed: onRetry,
                icon: const Icon(LucideIcons.refreshCw, size: 14),
                label: const Text('Retry'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Post-Install Actions ─────────────────────────────────────────────────────

class _SuccessActions extends ConsumerWidget {
  const _SuccessActions({required this.context, required this.ref});

  final BuildContext context;
  final WidgetRef ref;

  @override
  Widget build(BuildContext ctx, WidgetRef widgetRef) {
    final theme = Theme.of(ctx);
    final processStatus = widgetRef.watch(serverProcessProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Divider(),
        const SizedBox(height: AppSpacing.md),
        Text(
          'Server ready.',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            if (!processStatus.isRunning)
              Expanded(
                child: FilledButton.tonal(
                  onPressed: processStatus.isBusy
                      ? null
                      : () => widgetRef
                            .read(serverProcessProvider.notifier)
                            .start(),
                  child: const Text('Start Server'),
                ),
              ),
            if (!processStatus.isRunning) const SizedBox(width: AppSpacing.md),
            Expanded(
              child: FilledButton(
                onPressed: () {
                  widgetRef.read(serverStatusProvider.notifier).refresh();
                  ctx.go('/system');
                },
                child: const Text('Go to System'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
