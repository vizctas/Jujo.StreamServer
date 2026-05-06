import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:jujo_stream_app/core/models/server_profile.dart';

/// Persistent storage for server profiles.
///
/// - Profile metadata (id, url, name, username) → SharedPreferences JSON list.
/// - Auth tokens → FlutterSecureStorage keyed per profile.
/// - Active profile ID → SharedPreferences.
class ServerProfilesRepository {
  ServerProfilesRepository({
    required SharedPreferences prefs,
    required FlutterSecureStorage secure,
  })  : _prefs = prefs,
        _secure = secure;

  static const _profilesKey = 'jujo_server_profiles';
  static const _activeIdKey = 'jujo_active_profile_id';
  static const _tokenPrefix = 'jujo_token_';

  final SharedPreferences _prefs;
  final FlutterSecureStorage _secure;

  // ─── Profiles ─────────────────────────────────────────────────────────────

  List<ServerProfile> loadProfiles() {
    final raw = _prefs.getString(_profilesKey);
    if (raw == null || raw.isEmpty) return const [];
    try {
      return serverProfilesFromJsonString(raw);
    } catch (_) {
      return const [];
    }
  }

  Future<void> saveProfiles(List<ServerProfile> profiles) async {
    await _prefs.setString(
      _profilesKey,
      serverProfilesToJsonString(profiles),
    );
  }

  // ─── Active profile ────────────────────────────────────────────────────────

  String? getActiveProfileId() => _prefs.getString(_activeIdKey);

  Future<void> setActiveProfileId(String? id) async {
    if (id == null) {
      await _prefs.remove(_activeIdKey);
    } else {
      await _prefs.setString(_activeIdKey, id);
    }
  }

  // ─── Tokens ────────────────────────────────────────────────────────────────

  Future<String?> loadToken(String profileId) async {
    return _secure.read(key: '$_tokenPrefix$profileId');
  }

  Future<void> saveToken(String profileId, String token) async {
    await _secure.write(key: '$_tokenPrefix$profileId', value: token);
  }

  Future<void> deleteToken(String profileId) async {
    await _secure.delete(key: '$_tokenPrefix$profileId');
  }

  // ─── Migrate legacy single-server data ─────────────────────────────────────

  /// Creates a ServerProfile from the legacy single-server keys if present
  /// and no profiles exist yet. Called once on first app launch after upgrade.
  Future<ServerProfile?> migrateLegacyIfNeeded({
    required String? legacyUrl,
    required String? legacyUsername,
    required String? legacyToken,
  }) async {
    if (loadProfiles().isNotEmpty) return null;
    if (legacyUrl == null || legacyUrl.isEmpty) return null;

    final profile = ServerProfile.create(
      url: legacyUrl,
      username: legacyUsername,
    );

    await saveProfiles([profile]);
    await setActiveProfileId(profile.id);

    if (legacyToken != null && legacyToken.isNotEmpty) {
      await saveToken(profile.id, legacyToken);
    }

    return profile;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final serverProfilesRepositoryProvider =
    Provider<ServerProfilesRepository>((ref) {
  throw UnimplementedError(
    'serverProfilesRepositoryProvider must be overridden in ProviderScope',
  );
});
