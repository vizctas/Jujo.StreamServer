import 'dart:async';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/api/services/game_sources_api.dart';
import 'package:jujo_stream_app/core/api/services/library_api.dart';
import 'package:jujo_stream_app/core/api/services/local_art_api.dart';
import 'package:jujo_stream_app/core/providers/auth_provider.dart';

// ─── API Service Providers ────────────────────────────────────────────────────

final _apiClientProvider = Provider<ApiClient>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);
  final serverUrl = ref.watch(authProvider).serverUrl ?? '';
  return ApiClient(baseUrl: serverUrl, tokenProvider: authNotifier);
});

final gameSourcesApiProvider = Provider<GameSourcesApi>((ref) {
  return GameSourcesApi(client: ref.watch(_apiClientProvider));
});

final libraryApiProvider = Provider<LibraryApi>((ref) {
  return LibraryApi(client: ref.watch(_apiClientProvider));
});

final localArtApiProvider = Provider<LocalArtApi>((ref) {
  return LocalArtApi(client: ref.watch(_apiClientProvider));
});

/// FutureProvider family: fetches the Steam local art manifest for [appid].
final steamLocalArtProvider =
    FutureProvider.family<SteamLocalArtManifest, String>((ref, appid) async {
      return ref.watch(localArtApiProvider).getSteamArtManifest(appid);
    });

final serverImageBytesProvider = FutureProvider.family<Uint8List, String>((
  ref,
  path,
) async {
  final keepAlive = ref.keepAlive();
  Timer? disposeTimer;
  ref.onCancel(() {
    disposeTimer = Timer(const Duration(minutes: 5), keepAlive.close);
  });
  ref.onResume(() {
    disposeTimer?.cancel();
    disposeTimer = null;
  });
  ref.onDispose(() => disposeTimer?.cancel());

  final response = await ref
      .watch(localArtApiProvider)
      .client
      .dio
      .get<List<int>>(path, options: Options(responseType: ResponseType.bytes));
  return Uint8List.fromList(response.data ?? const []);
});

/// FutureProvider: fetches the art metadata provider status from the server.
final artMetadataStatusProvider = FutureProvider<ArtMetadataStatus?>((
  ref,
) async {
  return ref.watch(localArtApiProvider).getMetadataStatus();
});

// ─── Game Sources Provider ──────────────────────────────────────────────��─────

final gameSourcesProvider =
    AsyncNotifierProvider<GameSourcesNotifier, List<GameSourceDto>>(
      GameSourcesNotifier.new,
    );

class GameSourcesNotifier extends AsyncNotifier<List<GameSourceDto>> {
  @override
  Future<List<GameSourceDto>> build() async {
    final api = ref.watch(gameSourcesApiProvider);
    return api.getSources();
  }

  /// Full refresh — shows loading indicator. Use for user-initiated retries.
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(gameSourcesApiProvider).getSources(),
    );
  }

  /// Silent refresh — keeps previous data visible while fetching.
  /// Use for background polling (e.g., Steam auth wait) to avoid destroying
  /// the widget tree and losing local state like `_awaitingAuth`.
  Future<void> silentRefresh() async {
    final result = await AsyncValue.guard(
      () => ref.read(gameSourcesApiProvider).getSources(),
    );
    // Only update if we got data — don't flash error over existing data
    if (result.hasValue) {
      state = result;
    }
  }

  Future<GameSourceActionResult> connect(
    String sourceId, {
    Map<String, dynamic>? payload,
  }) async {
    final api = ref.read(gameSourcesApiProvider);
    final result = await api.connect(sourceId, payload: payload);
    await refresh();
    return result;
  }

  Future<GameSourceActionResult> sync(String sourceId) async {
    final api = ref.read(gameSourcesApiProvider);
    final result = await api.sync(sourceId);
    await refresh();
    // Also refresh library after sync
    ref.invalidate(libraryProvider);
    return result;
  }

  Future<GameSourceActionResult> disconnect(String sourceId) async {
    final api = ref.read(gameSourcesApiProvider);
    final result = await api.disconnect(sourceId);
    await refresh();
    ref.invalidate(libraryProvider);
    return result;
  }
}

// ─── Library Provider ─────────────���───────────────────────────────────────────

final libraryProvider = AsyncNotifierProvider<LibraryNotifier, List<GameDto>>(
  LibraryNotifier.new,
);

class LibraryNotifier extends AsyncNotifier<List<GameDto>> {
  @override
  Future<List<GameDto>> build() async {
    final api = ref.watch(libraryApiProvider);
    return api.getGames();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(libraryApiProvider).getGames(),
    );
  }

  Future<bool> addGame(Map<String, dynamic> gameData) async {
    final api = ref.read(libraryApiProvider);
    final success = await api.addGame(gameData);
    if (success) await refresh();
    return success;
  }

  Future<bool> deleteGame(int index) async {
    final api = ref.read(libraryApiProvider);
    final success = await api.deleteGame(index);
    if (success) await refresh();
    return success;
  }

  /// Update an existing game by its server index.
  Future<bool> updateGame(int index, Map<String, dynamic> gameData) async {
    final api = ref.read(libraryApiProvider);
    final success = await api.updateGame(index, gameData);
    if (success) await refresh();
    return success;
  }

  /// Update by [GameDto] — uses its stored index or finds it.
  Future<bool> updateGameDto(GameDto game) async {
    final index = game.index ?? _findIndex(game);
    if (index < 0) return false;
    return updateGame(index, game.toServerJson());
  }

  /// Delete by [GameDto] — finds its index in the current list.
  Future<bool> deleteGameDto(GameDto game) async {
    final index = game.index ?? _findIndex(game);
    if (index < 0) return false;
    return deleteGame(index);
  }

  /// Batch delete multiple games by their server indices.
  /// Returns the number of successfully deleted games.
  Future<int> deleteGames(List<int> indices) async {
    final api = ref.read(libraryApiProvider);
    final deleted = await api.deleteGames(indices);
    if (deleted > 0) await refresh();
    return deleted;
  }

  int _findIndex(GameDto game) {
    final games = state.valueOrNull ?? [];
    return games.indexWhere(
      (g) => g.uuid != null ? g.uuid == game.uuid : g.name == game.name,
    );
  }
}

// ─── Derived Providers ────────────────────────────────────────────────────────

/// Filter: only sources that are connected.
final connectedSourcesProvider = Provider<List<GameSourceDto>>((ref) {
  final sources = ref.watch(gameSourcesProvider).valueOrNull ?? [];
  return sources.where((s) => s.connected).toList();
});

/// Filter library by source.
final libraryBySourceProvider = Provider.family<List<GameDto>, String?>((
  ref,
  sourceId,
) {
  final games = ref.watch(libraryProvider).valueOrNull ?? [];
  if (sourceId == null) return games;
  return games.where((g) => g.source == sourceId).toList();
});

/// Search/filter library by name.
final librarySearchProvider = Provider.family<List<GameDto>, String>((
  ref,
  query,
) {
  final games = ref.watch(libraryProvider).valueOrNull ?? [];
  if (query.isEmpty) return games;
  final lower = query.toLowerCase();
  return games.where((g) => g.name.toLowerCase().contains(lower)).toList();
});

// ─── Steam Prefetch Progress Provider ────────────────────────────────────────

/// Polls `/api/library/steam/prefetch-progress` every 2 s while posters are
/// loading. Automatically cancels once the prefetch is done or the widget is
/// disposed.
final steamPrefetchProgressProvider =
    StreamProvider.autoDispose<SteamPrefetchProgress>((ref) async* {
      final api = ref.watch(gameSourcesApiProvider);

      while (true) {
        final progress = await api.getSteamPrefetchProgress();
        if (progress != null) {
          yield progress;
          if (progress.isDone || (!progress.running && progress.total == 0)) {
            break;
          }
        } else {
          break;
        }
        await Future<void>.delayed(const Duration(seconds: 2));
      }
    });
