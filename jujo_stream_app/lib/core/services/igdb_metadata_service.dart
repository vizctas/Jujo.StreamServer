import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import 'package:jujo_stream_app/core/utils/logger.dart';

/// IGDB game search result.
class IgdbGameResult {
  const IgdbGameResult({
    required this.id,
    required this.name,
    this.coverUrl,
    this.summary,
    this.firstReleaseDate,
    this.genres,
    this.platforms,
    this.developer,
    this.publisher,
  });

  final int id;
  final String name;

  /// Full URL to the cover image (t_cover_big_2x size).
  final String? coverUrl;
  final String? summary;
  final int? firstReleaseDate;
  final List<String>? genres;
  final List<String>? platforms;
  final String? developer;
  final String? publisher;

  /// Release date as ISO string (YYYY-MM-DD) or null.
  String? get releaseDateFormatted {
    if (firstReleaseDate == null) return null;
    final dt = DateTime.fromMillisecondsSinceEpoch(firstReleaseDate! * 1000, isUtc: true);
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  factory IgdbGameResult.fromJson(Map<String, dynamic> json) {
    // Build cover URL from cover.image_id
    String? coverUrl;
    if (json['cover'] is Map<String, dynamic>) {
      final imageId = json['cover']['image_id'] as String?;
      if (imageId != null && imageId.isNotEmpty) {
        coverUrl = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/$imageId.png';
      }
    }

    // Extract genre names
    List<String>? genres;
    if (json['genres'] is List) {
      genres = (json['genres'] as List)
          .whereType<Map<String, dynamic>>()
          .map((g) => g['name'] as String? ?? '')
          .where((n) => n.isNotEmpty)
          .toList();
    }

    // Extract platform names
    List<String>? platforms;
    if (json['platforms'] is List) {
      platforms = (json['platforms'] as List)
          .whereType<Map<String, dynamic>>()
          .map((p) => p['name'] as String? ?? '')
          .where((n) => n.isNotEmpty)
          .toList();
    }

    // Extract developer/publisher from involved_companies
    String? developer;
    String? publisher;
    if (json['involved_companies'] is List) {
      for (final ic in (json['involved_companies'] as List)) {
        if (ic is! Map<String, dynamic>) continue;
        final company = ic['company'] as Map<String, dynamic>?;
        final name = company?['name'] as String?;
        if (name == null) continue;
        if (ic['developer'] == true && developer == null) developer = name;
        if (ic['publisher'] == true && publisher == null) publisher = name;
      }
    }

    return IgdbGameResult(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      coverUrl: coverUrl,
      summary: json['summary'] as String?,
      firstReleaseDate: json['first_release_date'] as int?,
      genres: genres,
      platforms: platforms,
      developer: developer,
      publisher: publisher,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'coverUrl': coverUrl,
        'summary': summary,
        'firstReleaseDate': firstReleaseDate,
        'releaseDateFormatted': releaseDateFormatted,
        'genres': genres,
        'platforms': platforms,
        'developer': developer,
        'publisher': publisher,
      };
}

/// Twitch OAuth token for IGDB API access.
class _TwitchToken {
  _TwitchToken({
    required this.accessToken,
    required this.expiresAt,
  });

  final String accessToken;
  final DateTime expiresAt;

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

/// Service for searching and fetching game metadata from IGDB.
///
/// Uses Twitch OAuth client credentials for authentication.
/// API key (client_id + client_secret) must be provided via config.
class IgdbMetadataService {
  IgdbMetadataService({
    required this.clientId,
    required this.clientSecret,
    http.Client? httpClient,
  }) : _client = httpClient ?? http.Client();

  final String clientId;
  final String clientSecret;
  final http.Client _client;

  static const _igdbBaseUrl = 'https://api.igdb.com/v4';
  static const _twitchTokenUrl = 'https://id.twitch.tv/oauth2/token';

  _TwitchToken? _token;

  /// Whether the service has valid credentials configured.
  bool get isConfigured => clientId.isNotEmpty && clientSecret.isNotEmpty;

  /// Search IGDB for games matching [query].
  ///
  /// Returns up to [limit] results (default 5).
  /// Includes cover art, genres, platforms, and involved companies.
  Future<List<IgdbGameResult>> searchGames(
    String query, {
    int limit = 5,
  }) async {
    if (!isConfigured || query.trim().isEmpty) return [];

    try {
      final token = await _getToken();
      if (token == null) return [];

      // IGDB uses Apicalypse query language in POST body
      final body = '''
search "$query";
fields name, cover.image_id, summary, first_release_date,
  genres.name, platforms.name,
  involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
where category = 0;
limit $limit;
''';

      final response = await _client.post(
        Uri.parse('$_igdbBaseUrl/games'),
        headers: {
          'Client-ID': clientId,
          'Authorization': 'Bearer ${token.accessToken}',
          'Accept': 'application/json',
        },
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) {
        logger.warning(
          'IgdbMetadataService: search failed HTTP ${response.statusCode}',
        );
        return [];
      }

      final results = jsonDecode(response.body) as List;
      return results
          .whereType<Map<String, dynamic>>()
          .map(IgdbGameResult.fromJson)
          .toList();
    } catch (e) {
      logger.warning('IgdbMetadataService: search error: $e');
      return [];
    }
  }

  /// Fetch a specific game by IGDB ID.
  Future<IgdbGameResult?> getGameById(int igdbId) async {
    if (!isConfigured) return null;

    try {
      final token = await _getToken();
      if (token == null) return null;

      final body = '''
fields name, cover.image_id, summary, first_release_date,
  genres.name, platforms.name,
  involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
where id = $igdbId;
''';

      final response = await _client.post(
        Uri.parse('$_igdbBaseUrl/games'),
        headers: {
          'Client-ID': clientId,
          'Authorization': 'Bearer ${token.accessToken}',
          'Accept': 'application/json',
        },
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) return null;

      final results = jsonDecode(response.body) as List;
      if (results.isEmpty) return null;

      return IgdbGameResult.fromJson(results.first as Map<String, dynamic>);
    } catch (e) {
      logger.warning('IgdbMetadataService: getById error: $e');
      return null;
    }
  }

  /// Get or refresh the Twitch OAuth token.
  Future<_TwitchToken?> _getToken() async {
    if (_token != null && !_token!.isExpired) {
      return _token;
    }

    try {
      final response = await _client.post(
        Uri.parse(_twitchTokenUrl),
        body: {
          'client_id': clientId,
          'client_secret': clientSecret,
          'grant_type': 'client_credentials',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) {
        logger.warning(
          'IgdbMetadataService: token request failed HTTP ${response.statusCode}',
        );
        return null;
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final accessToken = json['access_token'] as String?;
      final expiresIn = json['expires_in'] as int? ?? 3600;

      if (accessToken == null || accessToken.isEmpty) return null;

      _token = _TwitchToken(
        accessToken: accessToken,
        expiresAt: DateTime.now().add(
          Duration(seconds: expiresIn - 60), // 60s safety margin
        ),
      );

      return _token;
    } catch (e) {
      logger.warning('IgdbMetadataService: token error: $e');
      return null;
    }
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/// Provider for IGDB metadata service.
///
/// Requires `igdb_client_id` and `igdb_client_secret` to be configured.
/// These come from the server's metadata provider settings (encrypted vault).
final igdbMetadataServiceProvider =
    Provider.family<IgdbMetadataService, ({String clientId, String clientSecret})>(
  (ref, credentials) {
    return IgdbMetadataService(
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    );
  },
);
