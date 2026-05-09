import 'package:jujo_stream_app/core/api/api_client.dart';

/// Result of a local-art manifest lookup for a Steam game.
class SteamLocalArtManifest {
  const SteamLocalArtManifest({
    required this.appid,
    required this.hasLocalArt,
    required this.available,
    required this.urls,
  });

  final String appid;
  final bool hasLocalArt;

  /// Art types available locally, e.g. ['portrait', 'header', 'hero'].
  final List<String> available;

  /// Map from art type to server-relative URL.
  final Map<String, String> urls;

  factory SteamLocalArtManifest.fromJson(Map<String, dynamic> json) {
    final rawUrls = json['urls'] as Map<String, dynamic>? ?? {};
    return SteamLocalArtManifest(
      appid: (json['appid'] as String?) ?? '',
      hasLocalArt: (json['hasLocalArt'] as bool?) ?? false,
      available: (json['available'] as List<dynamic>?)?.cast<String>() ?? [],
      urls: rawUrls.map((k, v) => MapEntry(k, v.toString())),
    );
  }

  static SteamLocalArtManifest empty(String appid) => SteamLocalArtManifest(
        appid: appid,
        hasLocalArt: false,
        available: const [],
        urls: const {},
      );
}

/// Metadata provider info from /api/library/metadata/status.
class ArtProviderInfo {
  const ArtProviderInfo({
    required this.id,
    required this.name,
    required this.state,
    required this.configured,
  });

  final String id;
  final String name;
  final String state; // 'configured' | 'not_configured'
  final bool configured;

  factory ArtProviderInfo.fromJson(Map<String, dynamic> json) {
    return ArtProviderInfo(
      id: (json['id'] as String?) ?? '',
      name: (json['name'] as String?) ?? '',
      state: (json['state'] as String?) ?? 'not_configured',
      configured: (json['state'] as String?) == 'configured',
    );
  }
}

class ArtMetadataStatus {
  const ArtMetadataStatus({required this.providers, required this.message});

  final List<ArtProviderInfo> providers;
  final String message;

  factory ArtMetadataStatus.fromJson(Map<String, dynamic> json) {
    final rawProviders =
        (json['metadata']?['posterProviders'] as List<dynamic>?) ?? [];
    return ArtMetadataStatus(
      providers: rawProviders
          .map((e) => ArtProviderInfo.fromJson(e as Map<String, dynamic>))
          .toList(),
      message: (json['metadata']?['message'] as String?) ?? '',
    );
  }
}

/// API service for local art and art metadata providers.
class LocalArtApi {
  LocalArtApi({required this.client});

  final ApiClient client;

  /// Fetch the available local art manifest for a Steam game by [appid].
  Future<SteamLocalArtManifest> getSteamArtManifest(String appid) async {
    if (appid.isEmpty) return SteamLocalArtManifest.empty(appid);
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/library/local-art/steam/$appid',
      );
      if (response.statusCode == 200 && response.data != null) {
        return SteamLocalArtManifest.fromJson(response.data!);
      }
    } catch (_) {}
    return SteamLocalArtManifest.empty(appid);
  }

  /// Fetch metadata provider status (SteamGridDB, IGDB, etc.).
  Future<ArtMetadataStatus?> getMetadataStatus() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/library/metadata/status',
      );
      if (response.statusCode == 200 && response.data != null) {
        return ArtMetadataStatus.fromJson(response.data!);
      }
    } catch (_) {}
    return null;
  }

  /// Configure a metadata provider API key.
  /// [providerId] is e.g. 'steamgriddb'.
  Future<({bool success, String message})> connectProvider(
      String providerId, String apiKey) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/library/metadata/providers/$providerId/connect',
        data: {'apiKey': apiKey},
      );
      if (response.statusCode == 200 && response.data != null) {
        final ok = response.data!['status'] == true;
        return (
          success: ok,
          message: ok
              ? 'Provider configured.'
              : (response.data!['error'] as String? ?? 'Unknown error'),
        );
      }
    } catch (e) {
      return (success: false, message: e.toString());
    }
    return (success: false, message: 'Request failed');
  }

  /// Builds the full server URL for a specific Steam art type.
  String steamArtUrl(String serverUrl, String appid, String type) {
    return '$serverUrl/api/library/local-art/steam/$appid/$type';
  }
}
