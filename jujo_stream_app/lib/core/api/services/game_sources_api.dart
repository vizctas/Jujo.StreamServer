import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for game sources (Steam, Epic, GOG, Xbox, Manual).
class GameSourcesApi {
  GameSourcesApi({required this.client});

  final ApiClient client;

  /// Fetch all configured game sources and their connection state.
  Future<List<GameSourceDto>> getSources() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/game-sources',
      );
      if (response.statusCode == 200 && response.data != null) {
        final sources = response.data!['sources'] as List<dynamic>?;
        if (sources != null) {
          return sources
              .map((e) => GameSourceDto.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Connect a game source (triggers OAuth or local detection).
  Future<GameSourceActionResult> connect(
    String sourceId, {
    Map<String, dynamic>? payload,
  }) async {
    final response = await client.post<Map<String, dynamic>>(
      '/api/game-sources/$sourceId/connect',
      data: payload,
    );
    return GameSourceActionResult.fromJson(response.data ?? {});
  }

  /// Sync a connected source (re-fetch library + detect installed).
  Future<GameSourceActionResult> sync(String sourceId) async {
    final response = await client.post<Map<String, dynamic>>(
      '/api/game-sources/$sourceId/sync',
    );
    return GameSourceActionResult.fromJson(response.data ?? {});
  }

  /// Disconnect a source (remove tokens, keep imported games).
  Future<GameSourceActionResult> disconnect(String sourceId) async {
    final response = await client.post<Map<String, dynamic>>(
      '/api/game-sources/$sourceId/disconnect',
    );
    return GameSourceActionResult.fromJson(response.data ?? {});
  }
}

/// DTO for a game source from the API.
class GameSourceDto {
  const GameSourceDto({
    required this.id,
    required this.name,
    this.connected = false,
    this.connectionState,
    this.syncState,
    this.ownedGameCount = 0,
    this.installedGameCount = 0,
    this.playableGameCount = 0,
    this.tokenEncrypted,
    this.disabled = false,
    this.publicConfig,
  });

  final String id;
  final String name;
  final bool connected;
  final String? connectionState;
  final String? syncState;
  final int ownedGameCount;
  final int installedGameCount;
  final int playableGameCount;
  final bool? tokenEncrypted;
  final bool disabled;
  final Map<String, dynamic>? publicConfig;

  factory GameSourceDto.fromJson(Map<String, dynamic> json) {
    return GameSourceDto(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      connected: json['connected'] as bool? ?? false,
      connectionState: json['connectionState'] as String?,
      syncState: json['syncState'] as String?,
      ownedGameCount: json['ownedGameCount'] as int? ?? json['gamesCount'] as int? ?? 0,
      installedGameCount: json['installedGameCount'] as int? ?? 0,
      playableGameCount: json['playableGameCount'] as int? ?? 0,
      tokenEncrypted: json['tokenEncrypted'] as bool?,
      disabled: json['disabled'] as bool? ?? false,
      publicConfig: json['publicConfig'] as Map<String, dynamic>?,
    );
  }
}

/// Result of a source action (connect/sync/disconnect).
class GameSourceActionResult {
  const GameSourceActionResult({
    this.success = false,
    this.authUrl,
    this.message,
    this.error,
    this.connectionState,
    this.syncState,
    this.ownedGameCount,
    this.installedGameCount,
    this.playableGameCount,
  });

  final bool success;
  final String? authUrl;
  final String? message;
  final String? error;
  final String? connectionState;
  final String? syncState;
  final int? ownedGameCount;
  final int? installedGameCount;
  final int? playableGameCount;

  factory GameSourceActionResult.fromJson(Map<String, dynamic> json) {
    return GameSourceActionResult(
      success: json['status'] as bool? ?? (json['error'] == null),
      authUrl: json['authUrl'] as String?,
      message: json['message'] as String?,
      error: json['error'] as String?,
      connectionState: json['connectionState'] as String?,
      syncState: json['syncState'] as String?,
      ownedGameCount: json['ownedGameCount'] as int?,
      installedGameCount: json['installedGameCount'] as int?,
      playableGameCount: json['playableGameCount'] as int?,
    );
  }
}
