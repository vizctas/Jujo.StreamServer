import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:qr_flutter/qr_flutter.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/pairing_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

// ─── Providers ────────────────────────────────────────────────────────────────

final _pairingApiProvider = Provider<PairingApi>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  final client = ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
  return PairingApi(client: client);
});

final _pairedClientsProvider =
    FutureProvider.autoDispose<List<PairedClientDto>>((ref) async {
  final api = ref.watch(_pairingApiProvider);
  return api.getClients();
});

// ─── Screen ───────────────────────────────────────────────────────────────────

/// Pairing screen — OTP/QR (primary) + PIN legacy + paired clients.
class PairingScreen extends ConsumerStatefulWidget {
  const PairingScreen({super.key});

  @override
  ConsumerState<PairingScreen> createState() => _PairingScreenState();
}

class _PairingScreenState extends ConsumerState<PairingScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final clientsAsync = ref.watch(_pairedClientsProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ──────────────────────────────────────────────────────
              Text(
                'PAIRING',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text('Pair a Device', style: theme.textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Connect a Moonlight client via QR code or manual PIN.',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: AppSpacing.xl),

              // ── Tab bar ──────────────────────────────────────────────────────
              Container(
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  indicator: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  labelColor: colorScheme.onPrimaryContainer,
                  unselectedLabelColor: colorScheme.onSurfaceVariant,
                  tabs: const [
                    Tab(
                      icon: Icon(LucideIcons.qrCode, size: 16),
                      text: 'QR / OTP',
                      iconMargin: EdgeInsets.only(bottom: 2),
                    ),
                    Tab(
                      icon: Icon(LucideIcons.keyboard, size: 16),
                      text: 'PIN (Legacy)',
                      iconMargin: EdgeInsets.only(bottom: 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // ── Tab content ──────────────────────────────────────────────────
              SizedBox(
                height: 520,
                child: TabBarView(
                  controller: _tabController,
                  children: const [
                    _OtpTab(),
                    _PinTab(),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xxxl),

              // ── Paired devices ───────────────────────────────────────────────
              Row(
                children: [
                  Text('Paired Devices',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      )),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: () => ref.invalidate(_pairedClientsProvider),
                    icon: const Icon(LucideIcons.refreshCw, size: 14),
                    label: const Text('Refresh'),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              clientsAsync.when(
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (_, __) => _InfoBanner(
                  icon: LucideIcons.alertCircle,
                  message: 'Could not load client list.',
                  isError: true,
                ),
                data: (clients) => clients.isEmpty
                    ? _InfoBanner(
                        icon: LucideIcons.monitor,
                        message: 'No devices paired yet.',
                      )
                    : Column(
                        children: clients
                            .map((c) => _ClientTile(
                                  client: c,
                                  onUnpair: () async {
                                    final api = ref.read(_pairingApiProvider);
                                    await api.unpairClient(c.uuid);
                                    ref.invalidate(_pairedClientsProvider);
                                  },
                                  onDisconnect: c.connected
                                      ? () async {
                                          final api =
                                              ref.read(_pairingApiProvider);
                                          await api.disconnectClient(c.uuid);
                                          ref.invalidate(_pairedClientsProvider);
                                        }
                                      : null,
                                ))
                            .toList(),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── OTP / QR Tab ────────────────────────────────────────────────────────────

/// Generates a server-side OTP and shows it as a QR code + plain code.
/// The Moonlight client scans the QR and auto-pairs using the deep link.
class _OtpTab extends ConsumerStatefulWidget {
  const _OtpTab();

  @override
  ConsumerState<_OtpTab> createState() => _OtpTabState();
}

class _OtpTabState extends ConsumerState<_OtpTab> {
  final _passphraseController = TextEditingController();
  final _deviceNameController = TextEditingController();

  OtpResponseDto? _otp;
  bool _loading = false;
  String? _error;

  Timer? _expiryTimer;
  int _secondsLeft = 0;

  @override
  void dispose() {
    _passphraseController.dispose();
    _deviceNameController.dispose();
    _expiryTimer?.cancel();
    super.dispose();
  }

  Future<void> _generateOtp() async {
    setState(() {
      _loading = true;
      _error = null;
      _otp = null;
    });
    _expiryTimer?.cancel();

    final api = ref.read(_pairingApiProvider);
    final result = await api.generateOtp(
      passphrase: _passphraseController.text.trim(),
      deviceName: _deviceNameController.text.trim(),
    );

    if (!mounted) return;
    if (result == null || !result.status) {
      setState(() {
        _loading = false;
        _error = result?.message ??
            'Failed to generate OTP. Check server connection.';
      });
      return;
    }

    setState(() {
      _loading = false;
      _otp = result;
      _secondsLeft = 180;
    });

    _expiryTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) {
        t.cancel();
        setState(() => _otp = null);
      }
    });
  }

  String _buildDeepLink(OtpResponseDto otp, String serverUrl) {
    final uri = Uri.tryParse(serverUrl);
    final host = uri?.host ?? serverUrl;
    final port = (uri?.port ?? 47990) - 1;
    final passphrase =
        Uri.encodeComponent(_passphraseController.text.trim());
    final name =
        Uri.encodeComponent(otp.name ?? 'Jujo.Stream Server');
    return 'art://$host:$port?pin=${otp.otp}&passphrase=$passphrase&name=$name';
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final serverUrl = ref.watch(authProvider).serverUrl ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colorScheme.secondaryContainer.withValues(alpha: 0.35),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
                color: colorScheme.secondary.withValues(alpha: 0.25)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.info,
                  size: 16, color: colorScheme.onSecondaryContainer),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'Open Moonlight on your client device, then tap "Add Computer" '
                  'and scan this QR code. The code expires after 3 minutes.',
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSecondaryContainer),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _passphraseController,
                decoration: const InputDecoration(
                  labelText: 'Passphrase (optional)',
                  prefixIcon: Icon(LucideIcons.keyRound, size: 16),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: TextField(
                controller: _deviceNameController,
                decoration: const InputDecoration(
                  labelText: 'Device Name (optional)',
                  prefixIcon: Icon(LucideIcons.monitor, size: 16),
                  isDense: true,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.base),

        FilledButton.icon(
          onPressed: _loading ? null : _generateOtp,
          icon: _loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(LucideIcons.qrCode, size: 16),
          label: Text(_otp != null ? 'Regenerate OTP' : 'Generate OTP'),
        ),

        if (_error != null) ...[
          const SizedBox(height: AppSpacing.md),
          _InfoBanner(
              icon: LucideIcons.alertCircle,
              message: _error!,
              isError: true),
        ],

        if (_otp != null) ...[
          const SizedBox(height: AppSpacing.xl),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.base),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: QrImageView(
                  data: _buildDeepLink(_otp!, serverUrl),
                  version: QrVersions.auto,
                  size: 160,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(width: AppSpacing.xl),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'OTP Code',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        Text(
                          _otp!.otp ?? '----',
                          style: theme.textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: 8,
                            fontFamily: 'monospace',
                            color: colorScheme.primary,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        IconButton(
                          icon: const Icon(LucideIcons.copy, size: 16),
                          tooltip: 'Copy OTP',
                          onPressed: () => Clipboard.setData(
                              ClipboardData(text: _otp!.otp ?? '')),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Icon(
                          LucideIcons.timer,
                          size: 14,
                          color: _secondsLeft < 30
                              ? colorScheme.error
                              : colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          'Expires in ${_formatTime(_secondsLeft)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: _secondsLeft < 30
                                ? colorScheme.error
                                : colorScheme.onSurfaceVariant,
                            fontWeight: _secondsLeft < 30
                                ? FontWeight.w600
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Deep link',
                      style: theme.textTheme.labelSmall
                          ?.copyWith(color: colorScheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    SelectableText(
                      _buildDeepLink(_otp!, serverUrl),
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontFamily: 'monospace',
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

// ─── PIN Legacy Tab ───────────────────────────────────────────────────────────

/// Legacy PIN mode — Moonlight shows a 4-digit PIN, admin enters it here.
class _PinTab extends ConsumerStatefulWidget {
  const _PinTab();

  @override
  ConsumerState<_PinTab> createState() => _PinTabState();
}

class _PinTabState extends ConsumerState<_PinTab> {
  final _pinController = TextEditingController();
  final _nameController = TextEditingController();

  bool _submitting = false;
  bool? _success;
  String? _error;

  @override
  void dispose() {
    _pinController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final pin = _pinController.text.trim();
    if (pin.isEmpty) {
      setState(() => _error = 'Please enter the PIN shown by your client.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
      _success = null;
    });

    final api = ref.read(_pairingApiProvider);
    final ok = await api.confirmPin(
      pin: pin,
      deviceName: _nameController.text.trim(),
    );

    if (!mounted) return;

    setState(() {
      _submitting = false;
      _success = ok;
      if (!ok) _error = 'Pairing failed. Check the PIN and try again.';
    });

    if (ok) {
      _pinController.clear();
      _nameController.clear();
      ref.invalidate(_pairedClientsProvider);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: colorScheme.tertiaryContainer.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
                color: colorScheme.tertiary.withValues(alpha: 0.25)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(LucideIcons.info,
                  size: 16, color: colorScheme.onTertiaryContainer),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'In Moonlight, tap your server and select "Pair". '
                  'A 4-digit PIN will appear on screen — enter it below.',
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onTertiaryContainer),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 320),
            child: Column(
              children: [
                TextField(
                  controller: _pinController,
                  decoration: InputDecoration(
                    labelText: 'PIN from Moonlight',
                    hintText: '1234',
                    prefixIcon: const Icon(LucideIcons.hash),
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                    ),
                  ),
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontFamily: 'monospace',
                    letterSpacing: 12,
                    fontWeight: FontWeight.w700,
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(8),
                  ],
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: AppSpacing.base),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Device Name (optional)',
                    prefixIcon: const Icon(LucideIcons.monitor),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _submitting ? null : _submit,
                    icon: _submitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(LucideIcons.checkCircle, size: 16),
                    label: const Text('Confirm Pairing'),
                  ),
                ),
              ],
            ),
          ),
        ),

        if (_error != null) ...[
          const SizedBox(height: AppSpacing.lg),
          _InfoBanner(
              icon: LucideIcons.alertCircle,
              message: _error!,
              isError: true),
        ],
        if (_success == true) ...[
          const SizedBox(height: AppSpacing.lg),
          _InfoBanner(
            icon: LucideIcons.checkCircle2,
            message: 'Device paired successfully!',
            isSuccess: true,
          ),
        ],
      ],
    );
  }
}

// ─── Shared widgets ───────────────────────────────────────────────────────────

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({
    required this.icon,
    required this.message,
    this.isError = false,
    this.isSuccess = false,
  });

  final IconData icon;
  final String message;
  final bool isError;
  final bool isSuccess;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final bg = isError
        ? colorScheme.errorContainer
        : isSuccess
            ? colorScheme.primaryContainer
            : colorScheme.surfaceContainerHighest;
    final fg = isError
        ? colorScheme.onErrorContainer
        : isSuccess
            ? colorScheme.onPrimaryContainer
            : colorScheme.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: bg),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: fg),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: fg),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClientTile extends StatelessWidget {
  const _ClientTile({
    required this.client,
    required this.onUnpair,
    this.onDisconnect,
  });

  final PairedClientDto client;
  final VoidCallback onUnpair;
  final VoidCallback? onDisconnect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Icon(
            client.connected
                ? LucideIcons.monitorPlay
                : LucideIcons.monitor,
            size: 20,
            color: client.connected
                ? colorScheme.primary
                : colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  client.name,
                  style: theme.textTheme.bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                if (client.connected)
                  Text(
                    'Active session',
                    style: theme.textTheme.labelSmall
                        ?.copyWith(color: colorScheme.primary),
                  ),
              ],
            ),
          ),
          if (onDisconnect != null)
            IconButton(
              icon: const Icon(LucideIcons.unplug, size: 16),
              tooltip: 'Disconnect session',
              onPressed: onDisconnect,
              constraints:
                  const BoxConstraints(minWidth: 48, minHeight: 48),
            ),
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 16),
            tooltip: 'Unpair device',
            color: colorScheme.error,
            onPressed: onUnpair,
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          ),
        ],
      ),
    );
  }
}
