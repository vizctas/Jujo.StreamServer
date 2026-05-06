import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:jujo_stream_app/core/services/igdb_metadata_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  // Mock Twitch token response
  final tokenResponse = jsonEncode({
    'access_token': 'test-access-token',
    'expires_in': 5000,
    'token_type': 'bearer',
  });

  // Mock IGDB search response
  final searchResponse = jsonEncode([
    {
      'id': 1942,
      'name': 'The Witcher 3: Wild Hunt',
      'cover': {'image_id': 'co1wyy'},
      'summary': 'An open-world RPG.',
      'first_release_date': 1431993600,
      'genres': [
        {'name': 'Role-playing (RPG)'},
        {'name': 'Adventure'},
      ],
      'platforms': [
        {'name': 'PC (Microsoft Windows)'},
        {'name': 'PlayStation 4'},
      ],
      'involved_companies': [
        {
          'company': {'name': 'CD Projekt Red'},
          'developer': true,
          'publisher': false,
        },
        {
          'company': {'name': 'CD Projekt'},
          'developer': false,
          'publisher': true,
        },
      ],
    },
    {
      'id': 2000,
      'name': 'The Witcher 2',
      'cover': {'image_id': 'co2abc'},
      'summary': null,
      'first_release_date': null,
      'genres': null,
      'platforms': null,
      'involved_companies': null,
    },
  ]);

  group('IgdbGameResult', () {
    test('fromJson parses all fields correctly', () {
      final json = {
        'id': 1942,
        'name': 'The Witcher 3: Wild Hunt',
        'cover': {'image_id': 'co1wyy'},
        'summary': 'An open-world RPG.',
        'first_release_date': 1431993600,
        'genres': [
          {'name': 'RPG'},
          {'name': 'Adventure'},
        ],
        'platforms': [
          {'name': 'PC'},
        ],
        'involved_companies': [
          {
            'company': {'name': 'CD Projekt Red'},
            'developer': true,
            'publisher': false,
          },
          {
            'company': {'name': 'CD Projekt'},
            'developer': false,
            'publisher': true,
          },
        ],
      };

      final result = IgdbGameResult.fromJson(json);

      expect(result.id, 1942);
      expect(result.name, 'The Witcher 3: Wild Hunt');
      expect(result.coverUrl,
          'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co1wyy.png');
      expect(result.summary, 'An open-world RPG.');
      expect(result.firstReleaseDate, 1431993600);
      expect(result.genres, ['RPG', 'Adventure']);
      expect(result.platforms, ['PC']);
      expect(result.developer, 'CD Projekt Red');
      expect(result.publisher, 'CD Projekt');
    });

    test('fromJson handles missing cover gracefully', () {
      final json = {'id': 100, 'name': 'No Cover Game'};
      final result = IgdbGameResult.fromJson(json);

      expect(result.id, 100);
      expect(result.name, 'No Cover Game');
      expect(result.coverUrl, isNull);
    });

    test('fromJson handles empty image_id', () {
      final json = {
        'id': 101,
        'name': 'Empty Cover',
        'cover': {'image_id': ''},
      };
      final result = IgdbGameResult.fromJson(json);
      expect(result.coverUrl, isNull);
    });

    test('releaseDateFormatted formats correctly', () {
      final result = IgdbGameResult(
        id: 1,
        name: 'Test',
        firstReleaseDate: 1431993600, // 2015-05-19
      );
      expect(result.releaseDateFormatted, '2015-05-19');
    });

    test('releaseDateFormatted returns null when no date', () {
      const result = IgdbGameResult(id: 1, name: 'Test');
      expect(result.releaseDateFormatted, isNull);
    });

    test('toJson roundtrips key fields', () {
      final result = IgdbGameResult(
        id: 42,
        name: 'Test Game',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abc.png',
        summary: 'A test.',
        genres: ['Action'],
        developer: 'Dev Co',
        publisher: 'Pub Co',
      );

      final json = result.toJson();
      expect(json['id'], 42);
      expect(json['name'], 'Test Game');
      expect(json['coverUrl'], contains('images.igdb.com'));
      expect(json['genres'], ['Action']);
      expect(json['developer'], 'Dev Co');
      expect(json['publisher'], 'Pub Co');
    });
  });

  group('IgdbMetadataService', () {
    test('isConfigured returns false when credentials empty', () {
      final service = IgdbMetadataService(
        clientId: '',
        clientSecret: '',
      );
      expect(service.isConfigured, false);
    });

    test('isConfigured returns true with credentials', () {
      final service = IgdbMetadataService(
        clientId: 'my-client-id',
        clientSecret: 'my-secret',
      );
      expect(service.isConfigured, true);
    });

    test('searchGames returns empty for empty query', () async {
      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'secret',
      );
      final results = await service.searchGames('');
      expect(results, isEmpty);
    });

    test('searchGames returns empty when not configured', () async {
      final service = IgdbMetadataService(
        clientId: '',
        clientSecret: '',
      );
      final results = await service.searchGames('Witcher');
      expect(results, isEmpty);
    });

    test('searchGames fetches token then searches', () async {
      int requestCount = 0;
      String? capturedIgdbBody;

      final mockClient = MockClient((request) async {
        requestCount++;

        // First request: Twitch token
        if (request.url.host == 'id.twitch.tv') {
          return http.Response(tokenResponse, 200);
        }

        // Second request: IGDB search
        if (request.url.host == 'api.igdb.com') {
          capturedIgdbBody = request.body;
          expect(request.headers['Client-ID'], 'test-client-id');
          expect(request.headers['Authorization'], 'Bearer test-access-token');
          return http.Response(searchResponse, 200);
        }

        return http.Response('Not found', 404);
      });

      final service = IgdbMetadataService(
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        httpClient: mockClient,
      );

      final results = await service.searchGames('Witcher');

      expect(requestCount, 2); // token + search
      expect(results.length, 2);
      expect(results[0].name, 'The Witcher 3: Wild Hunt');
      expect(results[0].coverUrl, contains('co1wyy'));
      expect(results[1].name, 'The Witcher 2');
      expect(capturedIgdbBody, contains('search "Witcher"'));
    });

    test('searchGames reuses cached token', () async {
      int tokenRequests = 0;

      final mockClient = MockClient((request) async {
        if (request.url.host == 'id.twitch.tv') {
          tokenRequests++;
          return http.Response(tokenResponse, 200);
        }
        return http.Response(searchResponse, 200);
      });

      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'secret',
        httpClient: mockClient,
      );

      await service.searchGames('Game 1');
      await service.searchGames('Game 2');

      expect(tokenRequests, 1); // Only one token request
    });

    test('searchGames returns empty on token failure', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Unauthorized', 401);
      });

      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'bad-secret',
        httpClient: mockClient,
      );

      final results = await service.searchGames('Witcher');
      expect(results, isEmpty);
    });

    test('searchGames returns empty on IGDB API error', () async {
      final mockClient = MockClient((request) async {
        if (request.url.host == 'id.twitch.tv') {
          return http.Response(tokenResponse, 200);
        }
        return http.Response('Rate limited', 429);
      });

      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'secret',
        httpClient: mockClient,
      );

      final results = await service.searchGames('Witcher');
      expect(results, isEmpty);
    });

    test('getGameById returns game on success', () async {
      final singleGameResponse = jsonEncode([
        {
          'id': 1942,
          'name': 'The Witcher 3',
          'cover': {'image_id': 'co1wyy'},
        }
      ]);

      final mockClient = MockClient((request) async {
        if (request.url.host == 'id.twitch.tv') {
          return http.Response(tokenResponse, 200);
        }
        return http.Response(singleGameResponse, 200);
      });

      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'secret',
        httpClient: mockClient,
      );

      final result = await service.getGameById(1942);

      expect(result, isNotNull);
      expect(result!.id, 1942);
      expect(result.name, 'The Witcher 3');
    });

    test('getGameById returns null on empty response', () async {
      final mockClient = MockClient((request) async {
        if (request.url.host == 'id.twitch.tv') {
          return http.Response(tokenResponse, 200);
        }
        return http.Response('[]', 200);
      });

      final service = IgdbMetadataService(
        clientId: 'id',
        clientSecret: 'secret',
        httpClient: mockClient,
      );

      final result = await service.getGameById(99999);
      expect(result, isNull);
    });

    test('getGameById returns null when not configured', () async {
      final service = IgdbMetadataService(
        clientId: '',
        clientSecret: '',
      );

      final result = await service.getGameById(1942);
      expect(result, isNull);
    });
  });
}
