/// Represents an active WebRTC streaming session on the server.
class StreamingSession {
  const StreamingSession({
    required this.id,
    this.audio = false,
    this.video = false,
    this.encoded = false,
    this.audioPackets = 0,
    this.videoPackets = 0,
    this.audioDropped = 0,
    this.videoDropped = 0,
    this.width,
    this.height,
    this.fps,
    this.bitrateKbps,
    this.codec,
    this.hdr,
    this.audioChannels,
    this.audioCodec,
    this.profile,
  });

  final String id;
  final bool audio;
  final bool video;
  final bool encoded;
  final int audioPackets;
  final int videoPackets;
  final int audioDropped;
  final int videoDropped;
  final int? width;
  final int? height;
  final int? fps;
  final int? bitrateKbps;
  final String? codec;
  final bool? hdr;
  final int? audioChannels;
  final String? audioCodec;
  final String? profile;

  factory StreamingSession.fromJson(Map<String, dynamic> json) {
    return StreamingSession(
      id: json['id'] as String? ?? '',
      audio: json['audio'] as bool? ?? false,
      video: json['video'] as bool? ?? false,
      encoded: json['encoded'] as bool? ?? false,
      audioPackets: json['audio_packets'] as int? ?? 0,
      videoPackets: json['video_packets'] as int? ?? 0,
      audioDropped: json['audio_dropped'] as int? ?? 0,
      videoDropped: json['video_dropped'] as int? ?? 0,
      width: json['width'] as int?,
      height: json['height'] as int?,
      fps: json['fps'] as int?,
      bitrateKbps: json['bitrate_kbps'] as int?,
      codec: json['codec'] as String?,
      hdr: json['hdr'] as bool?,
      audioChannels: json['audio_channels'] as int?,
      audioCodec: json['audio_codec'] as String?,
      profile: json['profile'] as String?,
    );
  }
}
