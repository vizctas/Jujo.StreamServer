import 'package:jujo_stream_app/core/api/api_client.dart';
import 'package:jujo_stream_app/core/utils/logger.dart';

/// API service for the setup/status endpoint.
/// Consumed by the Dashboard to determine onboarding state.
class SetupStatusApi {
  SetupStatusApi({required this.client});

  final ApiClient client;

  /// Fetches the current setup status from the server.
  /// Returns null if the endpoint is unavailable (older server version).
  Future<SetupStatusResponse?> getStatus() async {
    try {
      final response = await client.get<Map<String, dynamic>>(
        '/api/setup/status',
      );

      if (response.statusCode == 200 && response.data != null) {
        try {
          return SetupStatusResponse.fromJson(response.data!);
        } catch (e, st) {
          logger.error(
            'SetupStatusApi: error parsing JSON',
            error: e,
            stackTrace: st,
          );
          return null;
        }
      }
      logger.warning(
        'SetupStatusApi: request failed with status ${response.statusCode}.',
      );
      return null;
    } catch (e, st) {
      logger.error(
        'SetupStatusApi: request threw an exception',
        error: e,
        stackTrace: st,
      );
      return null;
    }
  }
}

/// Response model for GET /api/setup/status.
class SetupStatusResponse {
  const SetupStatusResponse({
    required this.setupComplete,
    required this.pairedClientCount,
    required this.connectedSourceCount,
    required this.playableGameCount,
    this.steps = const [],
    this.readinessChecks = const [],
  });

  final bool setupComplete;
  final int pairedClientCount;
  final int connectedSourceCount;
  final int playableGameCount;
  final List<SetupStep> steps;
  final List<ReadinessCheck> readinessChecks;

  factory SetupStatusResponse.fromJson(Map<String, dynamic> json) {
    return SetupStatusResponse(
      setupComplete: json['setupComplete'] as bool? ?? false,
      pairedClientCount: json['pairedClientCount'] as int? ?? 0,
      connectedSourceCount: json['connectedSourceCount'] as int? ?? 0,
      playableGameCount: json['playableGameCount'] as int? ?? 0,
      steps: (json['steps'] as List<dynamic>?)
              ?.map((e) => SetupStep.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      readinessChecks: ((json['readiness'] as Map<String, dynamic>?)?['checks']
                  as List<dynamic>?)
              ?.map((e) => ReadinessCheck.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

/// A single setup step (pair device, connect library, etc.)
class SetupStep {
  const SetupStep({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.action,
    this.path,
    this.icon,
  });

  final String id;
  final String title;
  final String description;
  final SetupStepStatus status;
  final String? action;
  final String? path;
  final String? icon;

  factory SetupStep.fromJson(Map<String, dynamic> json) {
    return SetupStep(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      status: SetupStepStatus.fromString(json['status'] as String? ?? ''),
      action: json['action'] as String?,
      path: json['path'] as String?,
      icon: json['icon'] as String?,
    );
  }
}

/// A readiness check (encoder, display, network, etc.)
class ReadinessCheck {
  const ReadinessCheck({
    required this.id,
    required this.label,
    required this.status,
  });

  final String id;
  final String label;
  final SetupStepStatus status;

  factory ReadinessCheck.fromJson(Map<String, dynamic> json) {
    return ReadinessCheck(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? '',
      status: SetupStepStatus.fromString(json['status'] as String? ?? ''),
    );
  }
}

/// Status enum for setup steps and readiness checks.
enum SetupStepStatus {
  ready,
  warning,
  pending;

  static SetupStepStatus fromString(String value) {
    return switch (value) {
      'ready' => SetupStepStatus.ready,
      'warning' => SetupStepStatus.warning,
      _ => SetupStepStatus.pending,
    };
  }
}
