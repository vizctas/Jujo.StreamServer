import 'package:jujo_stream_app/core/api/api_client.dart';

/// API service for Flutter-managed Jujo.Server updates.
class UpdateApi {
  UpdateApi({required this.client});

  final ApiClient client;

  Future<UpdateStatusDto?> getStatus() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/updates/status',
      );
      if (response.statusCode == 200 && response.data != null) {
        return UpdateStatusDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<UpdateStatusDto?> triggerCheck() async {
    try {
      final response = await client.post<Map<String, dynamic>>(
        '/api/updates/check',
      );
      if (response.statusCode == 200 && response.data != null) {
        return UpdateStatusDto.fromJson(response.data!);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}

class UpdateStatusDto {
  const UpdateStatusDto({
    required this.raw,
    this.installedVersion,
    this.checkInProgress = false,
    this.updateAvailable = false,
    this.candidate,
  });

  final Map<String, dynamic> raw;
  final String? installedVersion;
  final bool checkInProgress;
  final bool updateAvailable;
  final UpdateReleaseDto? candidate;

  factory UpdateStatusDto.fromJson(Map<String, dynamic> json) {
    final installed = json['installed'];
    final candidate = json['candidate'];
    return UpdateStatusDto(
      raw: Map<String, dynamic>.from(json),
      installedVersion: installed is Map
          ? installed['version'] as String?
          : null,
      checkInProgress: json['checkInProgress'] == true,
      updateAvailable: json['updateAvailable'] == true,
      candidate: candidate is Map
          ? UpdateReleaseDto.fromJson(Map<String, dynamic>.from(candidate))
          : null,
    );
  }
}

class UpdateReleaseDto {
  const UpdateReleaseDto({
    required this.version,
    required this.url,
    required this.assets,
    this.name,
    this.publishedAt,
    this.prerelease = false,
  });

  final String version;
  final String url;
  final String? name;
  final String? publishedAt;
  final bool prerelease;
  final List<UpdateAssetDto> assets;

  factory UpdateReleaseDto.fromJson(Map<String, dynamic> json) {
    final rawAssets = json['assets'];
    return UpdateReleaseDto(
      version: json['version'] as String? ?? '',
      url: json['url'] as String? ?? '',
      name: json['name'] as String?,
      publishedAt: json['publishedAt'] as String?,
      prerelease: json['prerelease'] == true,
      assets: rawAssets is List
          ? rawAssets
                .whereType<Map>()
                .map(
                  (item) =>
                      UpdateAssetDto.fromJson(Map<String, dynamic>.from(item)),
                )
                .toList(growable: false)
          : const [],
    );
  }
}

class UpdateAssetDto {
  const UpdateAssetDto({
    required this.name,
    required this.downloadUrl,
    this.sha256,
    this.sizeBytes,
    this.contentType,
  });

  final String name;
  final String downloadUrl;
  final String? sha256;
  final int? sizeBytes;
  final String? contentType;

  factory UpdateAssetDto.fromJson(Map<String, dynamic> json) {
    final size = json['sizeBytes'];
    return UpdateAssetDto(
      name: json['name'] as String? ?? '',
      downloadUrl: json['downloadUrl'] as String? ?? '',
      sha256: json['sha256'] as String?,
      sizeBytes: size is num ? size.toInt() : null,
      contentType: json['contentType'] as String?,
    );
  }
}
