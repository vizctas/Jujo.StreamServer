import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:jujo_stream_app/core/api/services/update_api.dart';

class BackendUpdateService {
  BackendUpdateService({
    this.githubOwner = 'JujoStream',
    this.githubRepo = 'Jujo.StreamServer',
  });

  final String githubOwner;
  final String githubRepo;

  static const _serviceName = 'Jujo.Server';

  Future<UpdateReleaseDto?> fetchLatestReleaseFromGitHub() async {
    final uri = Uri.https(
      'api.github.com',
      '/repos/$githubOwner/$githubRepo/releases/latest',
    );
    final client = HttpClient()
      ..connectionTimeout = const Duration(seconds: 20);
    try {
      final request = await client.getUrl(uri);
      request.headers.set(
        HttpHeaders.acceptHeader,
        'application/vnd.github+json',
      );
      request.headers.set('X-GitHub-Api-Version', '2022-11-28');
      request.headers.set(HttpHeaders.userAgentHeader, 'Jujo.Stream-Admin/1.0');
      final response = await request.close();
      if (response.statusCode != HttpStatus.ok) {
        debugPrint('GitHub release check failed: HTTP ${response.statusCode}');
        return null;
      }
      final body = await utf8.decoder.bind(response).join();
      final json = jsonDecode(body);
      if (json is! Map) return null;
      return _releaseFromGitHubJson(Map<String, dynamic>.from(json));
    } catch (e) {
      debugPrint('GitHub release check error: $e');
      return null;
    } finally {
      client.close(force: true);
    }
  }

  Future<BackendInstallResult> installRelease(
    UpdateReleaseDto release, {
    void Function(double progress)? onProgress,
  }) async {
    final asset = chooseInstallerAsset(release);
    if (asset == null) {
      return BackendInstallResult.fail('No Windows installer asset found.');
    }
    return installAsset(asset, onProgress: onProgress);
  }

  Future<BackendInstallResult> installAsset(
    UpdateAssetDto asset, {
    void Function(double progress)? onProgress,
  }) async {
    if (asset.downloadUrl.isEmpty) {
      return BackendInstallResult.fail('Installer asset has no download URL.');
    }

    final extension = _assetExtension(asset.name);
    final installerPath =
        '${Directory.systemTemp.path}\\jujo_stream_server_update$extension';

    try {
      await _downloadFile(
        Uri.parse(asset.downloadUrl),
        File(installerPath),
        onProgress: onProgress,
      );
      if (asset.sha256 != null && asset.sha256!.isNotEmpty) {
        final valid = await _verifySha256(File(installerPath), asset.sha256!);
        if (!valid) {
          return BackendInstallResult.fail('Installer SHA256 mismatch.');
        }
      }

      await _stopServiceBestEffort();
      final result = await _runSilentInstaller(installerPath);
      if (result.exitCode != 0 && result.exitCode != 3010) {
        return BackendInstallResult.fail(
          'Installer failed (${result.exitCode}): ${result.stderr}',
        );
      }
      await _startServiceBestEffort();
      return BackendInstallResult.ok(restartRequired: result.exitCode == 3010);
    } catch (e) {
      return BackendInstallResult.fail('Backend update failed: $e');
    } finally {
      try {
        File(installerPath).deleteSync();
      } catch (_) {}
    }
  }

  UpdateAssetDto? chooseInstallerAsset(UpdateReleaseDto release) {
    if (release.assets.isEmpty) return null;
    final candidates = release.assets.where((asset) {
      final name = asset.name.toLowerCase();
      return name.endsWith('.exe') || name.endsWith('.msi');
    }).toList();
    if (candidates.isEmpty) return null;

    int score(UpdateAssetDto asset) {
      final name = asset.name.toLowerCase();
      var value = 0;
      if (name.contains('jujo')) value += 10;
      if (name.contains('stream')) value += 8;
      if (name.contains('server')) value += 8;
      if (name.contains('setup') || name.contains('installer')) value += 6;
      if (name.endsWith('.exe')) value += 4;
      if (name.endsWith('.msi')) value += 2;
      if (name.contains('symbols') || name.contains('debug')) value -= 20;
      return value;
    }

    candidates.sort((a, b) => score(b).compareTo(score(a)));
    return candidates.first;
  }

  Future<void> _downloadFile(
    Uri uri,
    File destination, {
    void Function(double progress)? onProgress,
  }) async {
    final client = HttpClient()
      ..connectionTimeout = const Duration(seconds: 30);
    IOSink? sink;
    try {
      final request = await client.getUrl(uri);
      request.headers.set(HttpHeaders.userAgentHeader, 'Jujo.Stream-Admin/1.0');
      final response = await request.close();
      if (response.statusCode != HttpStatus.ok) {
        throw HttpException('HTTP ${response.statusCode}', uri: uri);
      }

      final total = response.contentLength;
      var received = 0;
      sink = destination.openWrite();
      await for (final chunk in response) {
        sink.add(chunk);
        received += chunk.length;
        if (total > 0) {
          onProgress?.call((received / total).clamp(0.0, 1.0));
        }
      }
      await sink.flush();
      onProgress?.call(1);
    } finally {
      await sink?.close();
      client.close(force: true);
    }
  }

  Future<bool> _verifySha256(File file, String expected) async {
    final normalized = expected.toLowerCase().replaceFirst('sha256:', '');
    final digest = await sha256.bind(file.openRead()).first;
    return digest.toString().toLowerCase() == normalized;
  }

  /// Run the downloaded installer with UAC elevation.
  ///
  /// Writing directly to `C:\Program Files` requires administrator rights.
  /// We launch a small PowerShell script that uses `Start-Process -Verb RunAs`
  /// to trigger the Windows UAC prompt.  `-PassThru -Wait` lets us capture the
  /// installer's own exit code and propagate it to the caller.
  Future<ProcessResult> _runSilentInstaller(String installerPath) async {
    final lower = installerPath.toLowerCase();
    final ts = DateTime.now().millisecondsSinceEpoch;
    final scriptPath = '${Directory.systemTemp.path}\\jujo_install_$ts.ps1';

    // Build the PS1 that elevates and runs the installer silently.
    final String ps1;
    if (lower.endsWith('.msi')) {
      ps1 =
          "\$p = Start-Process -FilePath 'msiexec.exe' "
          "-ArgumentList @('/i','$installerPath','/qn','/norestart') "
          '-Verb RunAs -PassThru -Wait\n'
          'exit \$p.ExitCode\n';
    } else {
      ps1 =
          "\$p = Start-Process -FilePath '$installerPath' "
          "-ArgumentList @('/S') "
          '-Verb RunAs -PassThru -Wait\n'
          'exit \$p.ExitCode\n';
    }

    File(scriptPath).writeAsStringSync(ps1);
    try {
      return await Process.run('powershell', [
        '-ExecutionPolicy',
        'Bypass',
        '-NonInteractive',
        '-File',
        scriptPath,
      ]);
    } finally {
      try {
        File(scriptPath).deleteSync();
      } catch (_) {}
    }
  }

  Future<void> _stopServiceBestEffort() async {
    await Process.run('sc.exe', ['stop', _serviceName], runInShell: true);
  }

  Future<void> _startServiceBestEffort() async {
    await Process.run('sc.exe', ['start', _serviceName], runInShell: true);
  }

  static String _assetExtension(String name) {
    final lower = name.toLowerCase();
    if (lower.endsWith('.msi')) return '.msi';
    return '.exe';
  }

  static UpdateReleaseDto _releaseFromGitHubJson(Map<String, dynamic> json) {
    final rawAssets = json['assets'];
    final assets = rawAssets is List
        ? rawAssets
              .whereType<Map>()
              .map((item) {
                final map = Map<String, dynamic>.from(item);
                final digest = map['digest'] as String?;
                return UpdateAssetDto(
                  name: map['name'] as String? ?? '',
                  downloadUrl: map['browser_download_url'] as String? ?? '',
                  sha256: digest?.startsWith('sha256:') == true
                      ? digest!.substring(7)
                      : digest,
                  sizeBytes: map['size'] is num
                      ? (map['size'] as num).toInt()
                      : null,
                  contentType: map['content_type'] as String?,
                );
              })
              .toList(growable: false)
        : const <UpdateAssetDto>[];

    return UpdateReleaseDto(
      version: json['tag_name'] as String? ?? '',
      url: json['html_url'] as String? ?? '',
      name: json['name'] as String?,
      publishedAt: json['published_at'] as String?,
      prerelease: json['prerelease'] == true,
      assets: assets,
    );
  }
}

class BackendInstallResult {
  const BackendInstallResult({
    required this.success,
    this.error,
    this.restartRequired = false,
  });

  final bool success;
  final String? error;
  final bool restartRequired;

  static BackendInstallResult ok({bool restartRequired = false}) =>
      BackendInstallResult(success: true, restartRequired: restartRequired);

  static BackendInstallResult fail(String error) =>
      BackendInstallResult(success: false, error: error);
}
