import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:jujo_stream_app/core/config/supabase_config.dart';
import 'package:jujo_stream_app/core/models/server_profile.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// Cloud-synced server profile data (metadata only, never tokens).
class CloudServerProfile {
  const CloudServerProfile({
    required this.id,
    required this.serverUrl,
    this.serverName,
    this.username,
    this.localAddresses = const [],
    this.externalAddress,
    this.natType,
    this.certFingerprint,
    this.isDefault = false,
    this.displayOrder = 0,
    this.lastConnectedAt,
    this.createdAt,
    this.updatedAt,
  });

  factory CloudServerProfile.fromJson(Map<String, dynamic> json) {
    return CloudServerProfile(
      id: json['id'] as String,
      serverUrl: json['server_url'] as String,
      serverName: json['server_name'] as String?,
      username: json['username'] as String?,
      localAddresses: (json['local_addresses'] as List<dynamic>?)
              ?.cast<String>() ??
          const [],
      externalAddress: json['external_address'] as String?,
      natType: json['nat_type'] as String?,
      certFingerprint: json['cert_fingerprint'] as String?,
      isDefault: json['is_default'] as bool? ?? false,
      displayOrder: json['display_order'] as int? ?? 0,
      lastConnectedAt: json['last_connected_at'] != null
          ? DateTime.tryParse(json['last_connected_at'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : null,
    );
  }

  final String id;
  final String serverUrl;
  final String? serverName;
  final String? username;
  final List<String> localAddresses;

  /// Public IP:port for direct WAN access (e.g. "73.42.15.200:47990").
  final String? externalAddress;

  /// NAT type: 'full_cone', 'restricted', 'port_restricted', 'symmetric', 'unknown'.
  final String? natType;

  final String? certFingerprint;
  final bool isDefault;
  final int displayOrder;
  final DateTime? lastConnectedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Map<String, dynamic> toInsertJson(String userId) => {
        'user_id': userId,
        'server_url': serverUrl,
        'server_name': serverName,
        'username': username,
        'local_addresses': localAddresses,
        'cert_fingerprint': certFingerprint,
        'is_default': isDefault,
        'display_order': displayOrder,
        'last_connected_at': lastConnectedAt?.toIso8601String(),
      };

  Map<String, dynamic> toUpdateJson() => {
        'server_name': serverName,
        'username': username,
        'local_addresses': localAddresses,
        'cert_fingerprint': certFingerprint,
        'is_default': isDefault,
        'display_order': displayOrder,
        'last_connected_at': lastConnectedAt?.toIso8601String(),
      };

  /// Convert to a local ServerProfile for the unified profile list.
  ServerProfile toServerProfile() {
    return ServerProfile(
      id: id,
      url: serverUrl,
      name: serverName,
      username: username,
      lastConnected: lastConnectedAt,
    );
  }

  /// Create from a local ServerProfile for cloud sync.
  static CloudServerProfile fromServerProfile(ServerProfile profile) {
    return CloudServerProfile(
      id: profile.id,
      serverUrl: profile.url,
      serverName: profile.name,
      username: profile.username,
      lastConnectedAt: profile.lastConnected,
    );
  }
}

// ─── Repository Interface ─────────────────────────────────────────────────────

abstract interface class CloudServerProfilesRepository {
  bool get isConfigured;

  /// Fetch all server profiles for the current user from cloud.
  Future<List<CloudServerProfile>> fetchAll();

  /// Upsert a server profile to cloud (insert or update by server_url).
  Future<void> upsert(ServerProfile profile);

  /// Remove a server profile from cloud by its server URL.
  Future<void> removeByUrl(String serverUrl);

  /// Remove a server profile from cloud by its cloud ID.
  Future<void> removeById(String cloudId);

  /// Mark a profile as the default server.
  Future<void> setDefault(String serverUrl);
}

// ─── Disabled Implementation ──────────────────────────────────────────────────

class DisabledCloudServerProfilesRepository
    implements CloudServerProfilesRepository {
  const DisabledCloudServerProfilesRepository();

  @override
  bool get isConfigured => false;

  @override
  Future<List<CloudServerProfile>> fetchAll() async => const [];

  @override
  Future<void> upsert(ServerProfile profile) async {}

  @override
  Future<void> removeByUrl(String serverUrl) async {}

  @override
  Future<void> removeById(String cloudId) async {}

  @override
  Future<void> setDefault(String serverUrl) async {}
}

// ─── Supabase Implementation ──────────────────────────────────────────────────

class SupabaseCloudServerProfilesRepository
    implements CloudServerProfilesRepository {
  const SupabaseCloudServerProfilesRepository(this._client);

  final SupabaseClient _client;
  static const _table = 'user_server_profiles';

  @override
  bool get isConfigured => true;

  String? get _userId => _client.auth.currentUser?.id;

  @override
  Future<List<CloudServerProfile>> fetchAll() async {
    final userId = _userId;
    if (userId == null) return const [];

    try {
      final response = await _client
          .from(_table)
          .select()
          .eq('user_id', userId)
          .order('display_order', ascending: true)
          .order('created_at', ascending: true);

      return (response as List<dynamic>)
          .map((row) => CloudServerProfile.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e, st) {
      logger.error('CloudServerProfiles.fetchAll failed', error: e, stackTrace: st);
      return const [];
    }
  }

  @override
  Future<void> upsert(ServerProfile profile) async {
    final userId = _userId;
    if (userId == null) return;

    try {
      final cloudProfile = CloudServerProfile.fromServerProfile(profile);

      await _client.from(_table).upsert(
        {
          ...cloudProfile.toInsertJson(userId),
        },
        onConflict: 'user_id,server_url',
      );
    } catch (e, st) {
      logger.error(
        'CloudServerProfiles.upsert failed for ${profile.url}',
        error: e,
        stackTrace: st,
      );
    }
  }

  @override
  Future<void> removeByUrl(String serverUrl) async {
    final userId = _userId;
    if (userId == null) return;

    try {
      await _client
          .from(_table)
          .delete()
          .eq('user_id', userId)
          .eq('server_url', serverUrl);
    } catch (e, st) {
      logger.error(
        'CloudServerProfiles.removeByUrl failed for $serverUrl',
        error: e,
        stackTrace: st,
      );
    }
  }

  @override
  Future<void> removeById(String cloudId) async {
    final userId = _userId;
    if (userId == null) return;

    try {
      await _client
          .from(_table)
          .delete()
          .eq('user_id', userId)
          .eq('id', cloudId);
    } catch (e, st) {
      logger.error(
        'CloudServerProfiles.removeById failed for $cloudId',
        error: e,
        stackTrace: st,
      );
    }
  }

  @override
  Future<void> setDefault(String serverUrl) async {
    final userId = _userId;
    if (userId == null) return;

    try {
      // Clear all defaults first
      await _client
          .from(_table)
          .update({'is_default': false})
          .eq('user_id', userId);

      // Set the new default
      await _client
          .from(_table)
          .update({'is_default': true})
          .eq('user_id', userId)
          .eq('server_url', serverUrl);
    } catch (e, st) {
      logger.error(
        'CloudServerProfiles.setDefault failed for $serverUrl',
        error: e,
        stackTrace: st,
      );
    }
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

final cloudServerProfilesRepositoryProvider =
    Provider<CloudServerProfilesRepository>((ref) {
  if (!SupabaseConfig.current.isConfigured) {
    return const DisabledCloudServerProfilesRepository();
  }
  return SupabaseCloudServerProfilesRepository(Supabase.instance.client);
});
