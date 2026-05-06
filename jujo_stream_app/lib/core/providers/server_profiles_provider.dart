import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';
import 'package:jujo_stream_app/core/services/cloud_server_profiles_repository.dart';
import 'package:jujo_stream_app/core/services/server_connection_racer.dart';
import 'package:jujo_stream_app/core/services/server_profiles_repository.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

// ─── State ────────────────────────────────────────────────────────────────────

class ServerProfilesState {
  const ServerProfilesState({
    this.profiles = const [],
    this.activeProfileId,
    this.syncing = false,
    this.switching = false,
    this.lastSyncError,
    this.activeConnectionType,
  });

  final List<ServerProfile> profiles;
  final String? activeProfileId;

  /// True while pulling profiles from cloud.
  final bool syncing;

  /// True while resolving server address during profile switch.
  final bool switching;

  final String? lastSyncError;

  /// How the active server was reached (local/remote/relay).
  /// Set after the connection racer resolves.
  final ConnectionType? activeConnectionType;

  ServerProfile? get activeProfile {
    if (activeProfileId == null) return null;
    try {
      return profiles.firstWhere((p) => p.id == activeProfileId);
    } catch (_) {
      return null;
    }
  }

  bool get hasProfiles => profiles.isNotEmpty;

  /// Profiles that have a locally stored token (connected on this device).
  List<ServerProfile> get connectedProfiles => profiles;

  ServerProfilesState copyWith({
    List<ServerProfile>? profiles,
    String? activeProfileId,
    bool clearActiveId = false,
    bool? syncing,
    bool? switching,
    String? lastSyncError,
    bool clearSyncError = false,
    ConnectionType? activeConnectionType,
    bool clearConnectionType = false,
  }) {
    return ServerProfilesState(
      profiles: profiles ?? this.profiles,
      activeProfileId: clearActiveId
          ? null
          : (activeProfileId ?? this.activeProfileId),
      syncing: syncing ?? this.syncing,
      switching: switching ?? this.switching,
      lastSyncError: clearSyncError ? null : (lastSyncError ?? this.lastSyncError),
      activeConnectionType: clearConnectionType
          ? null
          : (activeConnectionType ?? this.activeConnectionType),
    );
  }
}

// ─── Notifier ─────────────────────────────────────────────────────────────────

class ServerProfilesNotifier extends StateNotifier<ServerProfilesState> {
  ServerProfilesNotifier(this._repo, this._cloudRepo, this._ref)
    : super(const ServerProfilesState()) {
    _load();
  }

  final ServerProfilesRepository _repo;
  final CloudServerProfilesRepository _cloudRepo;
  final Ref _ref;

  // ─── Init ──────────────────────────────────────────────────────────────────

  Future<void> _load() async {
    final profiles = _repo.loadProfiles();
    final activeId = _repo.getActiveProfileId();
    state = ServerProfilesState(profiles: profiles, activeProfileId: activeId);

    // If cloud is configured and user is authenticated, sync from cloud.
    if (_cloudRepo.isConfigured) {
      final authState = _ref.read(authProvider);
      if (authState.isAuthenticated && authState.mode == AuthMode.cloudAccount) {
        await syncFromCloud();
      }
    }
  }

  // ─── Cloud Sync ────────────────────────────────────────────────────────────

  /// Pull server profiles from cloud and merge with local state.
  ///
  /// Merge strategy:
  /// - Cloud is source of truth for the profile LIST (which servers exist)
  /// - Local is source of truth for tokens (never synced to cloud)
  /// - If a cloud profile doesn't exist locally, add it (without token)
  /// - If a local profile doesn't exist in cloud, push it to cloud
  /// - If both exist, prefer cloud metadata (name, username) but keep local token
  Future<void> syncFromCloud() async {
    if (!_cloudRepo.isConfigured) return;

    state = state.copyWith(syncing: true, clearSyncError: true);

    try {
      final cloudProfiles = await _cloudRepo.fetchAll();
      if (cloudProfiles.isEmpty && state.profiles.isEmpty) {
        state = state.copyWith(syncing: false);
        return;
      }

      final localProfiles = List<ServerProfile>.from(state.profiles);
      final mergedProfiles = <ServerProfile>[];
      final localByUrl = <String, ServerProfile>{};
      for (final p in localProfiles) {
        localByUrl[p.url] = p;
      }

      // Process cloud profiles: merge or add
      for (final cloud in cloudProfiles) {
        final local = localByUrl.remove(cloud.serverUrl);
        if (local != null) {
          // Both exist: keep local ID (for token lookup), update metadata from cloud
          mergedProfiles.add(local.copyWith(
            name: cloud.serverName ?? local.name,
            username: cloud.username ?? local.username,
            lastConnected: _latest(cloud.lastConnectedAt, local.lastConnected),
          ));
        } else {
          // Cloud-only: add to local (no token — user must re-authenticate)
          mergedProfiles.add(cloud.toServerProfile());
        }
      }

      // Local-only profiles: push to cloud, keep locally
      for (final localOnly in localByUrl.values) {
        mergedProfiles.add(localOnly);
        // Push to cloud in background (fire-and-forget)
        _cloudRepo.upsert(localOnly);
      }

      // Persist merged state locally
      await _repo.saveProfiles(mergedProfiles);

      // Determine active profile
      String? activeId = state.activeProfileId;
      if (activeId != null &&
          !mergedProfiles.any((p) => p.id == activeId)) {
        // Active profile was removed — pick the default or first
        final defaultCloud = cloudProfiles
            .where((c) => c.isDefault)
            .toList();
        if (defaultCloud.isNotEmpty) {
          final defaultUrl = defaultCloud.first.serverUrl;
          final match = mergedProfiles.firstWhere(
            (p) => p.url == defaultUrl,
            orElse: () => mergedProfiles.first,
          );
          activeId = match.id;
        } else if (mergedProfiles.isNotEmpty) {
          activeId = mergedProfiles.first.id;
        } else {
          activeId = null;
        }
        await _repo.setActiveProfileId(activeId);
      }

      state = ServerProfilesState(
        profiles: mergedProfiles,
        activeProfileId: activeId,
        syncing: false,
      );

      logger.info(
        'Cloud sync complete: ${mergedProfiles.length} profiles '
        '(${cloudProfiles.length} from cloud, ${localByUrl.length} local-only pushed)',
      );
    } catch (e, st) {
      logger.error('syncFromCloud failed', error: e, stackTrace: st);
      state = state.copyWith(
        syncing: false,
        lastSyncError: 'Cloud sync failed: ${e.toString()}',
      );
    }
  }

  /// Push a single profile to cloud (fire-and-forget, non-blocking).
  Future<void> _pushToCloud(ServerProfile profile) async {
    if (!_cloudRepo.isConfigured) return;
    final authState = _ref.read(authProvider);
    if (!authState.isAuthenticated || authState.mode != AuthMode.cloudAccount) {
      return;
    }
    try {
      await _cloudRepo.upsert(profile);
    } catch (e) {
      logger.warning('_pushToCloud failed for ${profile.url}: $e');
    }
  }

  /// Remove a profile from cloud (fire-and-forget, non-blocking).
  Future<void> _removeFromCloud(ServerProfile profile) async {
    if (!_cloudRepo.isConfigured) return;
    final authState = _ref.read(authProvider);
    if (!authState.isAuthenticated || authState.mode != AuthMode.cloudAccount) {
      return;
    }
    try {
      await _cloudRepo.removeByUrl(profile.url);
    } catch (e) {
      logger.warning('_removeFromCloud failed for ${profile.url}: $e');
    }
  }

  // ─��─ Public API ────────────────────────────────────────────────────────────

  /// Add a new profile and immediately activate it.
  ///
  /// [token] is stored in SecureStorage. The authProvider is updated to
  /// use this profile's URL + token so all subsequent API calls use it.
  Future<void> addAndActivate({
    required String url,
    required String username,
    required String token,
    String? name,
  }) async {
    final profile = ServerProfile.create(
      url: url,
      name: name,
      username: username,
    );

    final updated = [...state.profiles, profile];
    await _repo.saveProfiles(updated);
    await _repo.saveToken(profile.id, token);
    await _repo.setActiveProfileId(profile.id);

    state = state.copyWith(profiles: updated, activeProfileId: profile.id);

    // Sync authProvider with the new active profile.
    await _ref
        .read(authProvider.notifier)
        .switchProfile(serverUrl: url, token: token, username: username);

    // Push to cloud (non-blocking)
    _pushToCloud(profile.copyWith(lastConnected: DateTime.now()));
  }

  /// Create or update a profile for a server URL, then activate it.
  Future<void> upsertAndActivate({
    required String url,
    required String username,
    required String token,
    String? name,
  }) async {
    final now = DateTime.now();
    final existingIndex = state.profiles.indexWhere((p) => p.url == url);

    late final ServerProfile profile;
    late final List<ServerProfile> updated;
    if (existingIndex >= 0) {
      profile = state.profiles[existingIndex].copyWith(
        name: name,
        username: username,
        lastConnected: now,
      );
      updated = [...state.profiles];
      updated[existingIndex] = profile;
    } else {
      profile = ServerProfile.create(
        url: url,
        name: name,
        username: username,
      ).copyWith(lastConnected: now);
      updated = [...state.profiles, profile];
    }

    await _repo.saveProfiles(updated);
    await _repo.saveToken(profile.id, token);
    await _repo.setActiveProfileId(profile.id);

    state = state.copyWith(profiles: updated, activeProfileId: profile.id);

    await _ref
        .read(authProvider.notifier)
        .switchProfile(serverUrl: url, token: token, username: username);

    // Push to cloud (non-blocking)
    _pushToCloud(profile);
  }

  /// Switch the active profile. Races known addresses to find the best
  /// reachable path, loads the saved token, and syncs authProvider.
  ///
  /// Connection strategy:
  /// 1. Race local addresses + external address in parallel
  /// 2. Use first reachable address (updates profile URL if different)
  /// 3. Fall back to stored URL if race fails (server may be offline)
  ///
  /// If no token is saved for this profile, authProvider is set to
  /// unauthenticated so GoRouter redirects to the login screen.
  Future<void> switchProfile(String profileId) async {
    final profile = state.profiles.firstWhere(
      (p) => p.id == profileId,
      orElse: () => throw ArgumentError('Profile $profileId not found'),
    );

    await _repo.setActiveProfileId(profileId);
    state = state.copyWith(activeProfileId: profileId, switching: true);

    try {
      // Race known addresses to find the best reachable path.
      final resolvedUrl = await _resolveServerAddress(profile);

      final token = await _repo.loadToken(profileId);
      if (token != null && token.isNotEmpty) {
        await _ref
            .read(authProvider.notifier)
            .switchProfile(
              serverUrl: resolvedUrl,
              token: token,
              username: profile.username,
            );
      } else {
        // No saved token — set server URL and go to login.
        await _ref.read(authProvider.notifier).setServerUrl(resolvedUrl);
        await _ref.read(authProvider.notifier).logout();
      }

      // Update default in cloud
      if (_cloudRepo.isConfigured) {
        _cloudRepo.setDefault(profile.url);
      }
    } finally {
      state = state.copyWith(switching: false);
    }
  }

  /// Race all known addresses for a profile and return the best reachable URL.
  ///
  /// Falls back to the stored profile URL if:
  /// - No cloud data available (local_addresses/external_address)
  /// - All addresses are unreachable (server offline)
  /// - Race times out
  Future<String> _resolveServerAddress(ServerProfile profile) async {
    try {
      // Fetch cloud profile data for additional addresses
      List<String> localAddresses = [profile.url];
      String? externalAddress;

      if (_cloudRepo.isConfigured) {
        final cloudProfiles = await _cloudRepo.fetchAll();
        final cloudMatch = cloudProfiles
            .where((c) => c.serverUrl == profile.url)
            .toList();
        if (cloudMatch.isNotEmpty) {
          final cloud = cloudMatch.first;
          localAddresses = [
            profile.url,
            ...cloud.localAddresses
                .where((a) => !profile.url.contains(a)),
          ];
          externalAddress = cloud.externalAddress;
        }
      }

      final racer = _ref.read(serverConnectionRacerProvider);
      final result = await racer.findBestConnection(
        localAddresses: localAddresses,
        externalAddress: externalAddress,
      );

      if (result != null) {
        logger.info(
          'Resolved ${profile.displayName} → ${result.address} '
          '(${result.connectionType.name}, ${result.latencyMs}ms)',
        );
        state = state.copyWith(activeConnectionType: result.connectionType);
        return result.address;
      }
    } catch (e) {
      logger.warning('Address resolution failed for ${profile.url}: $e');
    }

    // Fallback: use stored URL (server may be offline, user can retry later)
    state = state.copyWith(clearConnectionType: true);
    return profile.url;
  }

  /// Remove a profile and delete its token.
  Future<void> removeProfile(String profileId) async {
    final profile = state.profiles.firstWhere(
      (p) => p.id == profileId,
      orElse: () => throw ArgumentError('Profile $profileId not found'),
    );

    await _repo.deleteToken(profileId);
    final updated = state.profiles.where((p) => p.id != profileId).toList();
    await _repo.saveProfiles(updated);

    // If we removed the active profile, clear active ID.
    final newActiveId = state.activeProfileId == profileId
        ? null
        : state.activeProfileId;

    await _repo.setActiveProfileId(newActiveId);
    state = state.copyWith(
      profiles: updated,
      activeProfileId: newActiveId,
      clearActiveId: newActiveId == null,
    );

    // Remove from cloud (non-blocking)
    _removeFromCloud(profile);
  }

  /// Update the display name of a profile.
  Future<void> renameProfile(String profileId, String newName) async {
    final updated = state.profiles.map((p) {
      return p.id == profileId ? p.copyWith(name: newName) : p;
    }).toList();
    await _repo.saveProfiles(updated);
    state = state.copyWith(profiles: updated);

    // Push rename to cloud
    final profile = updated.firstWhere((p) => p.id == profileId);
    _pushToCloud(profile);
  }

  /// Mark the active profile as recently connected and update the stored token.
  Future<void> recordSuccessfulLogin({
    required String profileId,
    required String token,
    required String username,
  }) async {
    await _repo.saveToken(profileId, token);
    final now = DateTime.now();
    final updated = state.profiles.map((p) {
      return p.id == profileId
          ? p.copyWith(username: username, lastConnected: now)
          : p;
    }).toList();
    await _repo.saveProfiles(updated);
    state = state.copyWith(profiles: updated);

    // Push updated last_connected to cloud
    final profile = updated.firstWhere((p) => p.id == profileId);
    _pushToCloud(profile);
  }

  /// Check if a profile has a locally stored token (connected on this device).
  Future<bool> hasLocalToken(String profileId) async {
    final token = await _repo.loadToken(profileId);
    return token != null && token.isNotEmpty;
  }

  /// Migrate from legacy single-server auth storage (upgrade path).
  Future<void> migrateFromLegacy({
    required String? legacyUrl,
    required String? legacyUsername,
    required String? legacyToken,
  }) async {
    final profile = await _repo.migrateLegacyIfNeeded(
      legacyUrl: legacyUrl,
      legacyUsername: legacyUsername,
      legacyToken: legacyToken,
    );
    if (profile != null) {
      state = ServerProfilesState(
        profiles: [profile],
        activeProfileId: profile.id,
      );
      // Push migrated profile to cloud
      _pushToCloud(profile);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  DateTime? _latest(DateTime? a, DateTime? b) {
    if (a == null) return b;
    if (b == null) return a;
    return a.isAfter(b) ? a : b;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final serverProfilesProvider =
    StateNotifierProvider<ServerProfilesNotifier, ServerProfilesState>((ref) {
      final repo = ref.watch(serverProfilesRepositoryProvider);
      final cloudRepo = ref.watch(cloudServerProfilesRepositoryProvider);
      return ServerProfilesNotifier(repo, cloudRepo, ref);
    });

// ─── Derived providers ────────────────────────────────────────────────────────

/// The currently active server profile.
final activeServerProfileProvider = Provider<ServerProfile?>((ref) {
  return ref.watch(serverProfilesProvider).activeProfile;
});

/// All saved server profiles.
final serverProfileListProvider = Provider<List<ServerProfile>>((ref) {
  return ref.watch(serverProfilesProvider).profiles;
});

/// Whether cloud sync is in progress.
final serverProfilesSyncingProvider = Provider<bool>((ref) {
  return ref.watch(serverProfilesProvider).syncing;
});

/// How the active server connection was established (local/remote/relay).
/// Null if not yet resolved or server is unreachable.
final activeConnectionTypeProvider = Provider<ConnectionType?>((ref) {
  return ref.watch(serverProfilesProvider).activeConnectionType;
});

// ─── Repository bootstrap provider ───────────────────────────────────────────

/// Convenience provider that creates the repository from DI'd prefs + secure storage.
/// Override [serverProfilesRepositoryProvider] with this in main.dart.
final bootstrappedProfilesRepoProvider =
    FutureProvider<ServerProfilesRepository>((ref) async {
      final prefs = await SharedPreferences.getInstance();
      final secure = ref.watch(secureStorageProvider);
      return ServerProfilesRepository(prefs: prefs, secure: secure);
    });
