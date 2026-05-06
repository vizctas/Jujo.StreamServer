import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for the game library (apps list).
class LibraryApi {
  LibraryApi({required this.client});

  final ApiClient client;

  /// Fetch all apps/games registered on the server.
  Future<List<GameDto>> getGames() async {
    try {
      final response = await client.get<Map<String, dynamic>>('/api/apps');
      if (response.statusCode == 200 && response.data != null) {
        final env = response.data!['env'] as Map<String, dynamic>?;
        final apps =
            env?['apps'] as List<dynamic>? ??
            response.data!['apps'] as List<dynamic>? ??
            const [];
        return apps
            .map((e) => GameDto.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Add a new game/app entry.
  Future<bool> addGame(Map<String, dynamic> gameData) async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/apps',
        data: gameData,
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Delete a game/app by index.
  Future<bool> deleteGame(int index) async {
    try {
      final response = await client.delete('/api/apps/$index');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

/// DTO for a game/app from the server.
class GameDto {
  const GameDto({
    required this.name,
    this.uuid,
    this.cmd,
    this.workingDir,
    this.imagePath,
    this.source,
    this.sourceId,
    this.installed = true,
    this.owned = true,
    this.playable = true,
  });

  final String name;
  final String? uuid;
  final String? cmd;
  final String? workingDir;
  final String? imagePath;
  final String? source;
  final String? sourceId;
  final bool installed;
  final bool owned;
  final bool playable;

  /// Resolve the best available poster URL for this game.
  ///
  /// Priority:
  ///   1. Steam CDN (source=steam + numeric sourceId) — free, high quality,
  ///      no server round-trip needed.
  ///   2. Server-relative imagePath prefixed with [serverUrl].
  ///   3. null — caller should show a platform-colour placeholder.
  String? resolveImageUrl(String serverUrl) {
    // 1. Steam CDN
    if (source == 'steam') {
      final id = _steamAppId();
      if (id != null) {
        return 'https://cdn.akamai.steamstatic.com/steam/apps/$id/library_600x900.jpg';
      }
    }

    // 2. Server-relative path
    if (imagePath != null && imagePath!.isNotEmpty) {
      if (imagePath!.startsWith('http')) return imagePath;
      final base = serverUrl.endsWith('/')
          ? serverUrl.substring(0, serverUrl.length - 1)
          : serverUrl;
      return '$base$imagePath';
    }

    return null;
  }

  /// Extract a numeric Steam App ID from [sourceId] or (fallback) [cmd].
  /// The server sometimes stores the App ID in the launch command, e.g.
  /// `steam://rungameid/440` or `-appid 440`.
  String? _steamAppId() {
    // Clean numeric sourceId
    if (sourceId != null) {
      final clean = sourceId!.replaceAll(RegExp(r'[^0-9]'), '');
      if (clean.isNotEmpty) return clean;
    }
    // Extract from cmd: steam://rungameid/440 or steam -applaunch 440
    if (cmd != null) {
      final m = RegExp(
        r'(?:rungameid|applaunch|appid)[/\s]+(\d+)',
        caseSensitive: false,
      ).firstMatch(cmd!);
      if (m != null) return m.group(1);
    }
    return null;
  }

  factory GameDto.fromJson(Map<String, dynamic> json) {
    return GameDto(
      name: json['title'] as String? ?? json['name'] as String? ?? 'Untitled',
      uuid: json['uuid'] as String?,
      cmd: json['cmd'] as String? ?? json['executablePath'] as String? ?? json['command'] as String?,
      workingDir:
          json['working-dir'] as String? ?? json['workingDir'] as String? ?? json['installPath'] as String?,
      imagePath: json['posterUrl'] as String? ?? json['image-path'] as String? ?? json['imagePath'] as String?,
      source: json['sourceId'] as String? ?? json['source'] as String?,
      sourceId:
          json['providerGameId'] as String? ?? json['sourceId'] as String?,
      installed: json['installed'] as bool? ?? json['playable'] as bool? ?? true,
      owned: json['owned'] as bool? ?? true,
      playable: json['playable'] as bool? ?? true,
    );
  }
}
