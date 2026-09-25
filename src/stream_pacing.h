/**
 * @file src/stream_pacing.h
 * @brief RTP video send-pacer target.
 */
#pragma once

#include <cstdint>

namespace stream {
  /**
   * @brief Send-pacer rate in bits per second.
   * @param configured_kbps `pacing_max_bitrate_kbps`; 0 = automatic.
   * @param session_kbps Negotiated session bitrate.
   *
   * Automatic paces at 2x the session bitrate: unpaced per-frame bursts turn into
   * late frames on WiFi clients (Chromecast A/B: 21% -> 1.2% of 5 s windows with a
   * >=50 ms hitch), while 1.3x delayed large frames enough to drop some. An explicit
   * value is honored but never below 110% of the session bitrate, or the sender falls
   * behind the encoder and the queue grows without bound.
   */
  constexpr std::uint64_t pacing_bps(std::int64_t configured_kbps, std::int64_t session_kbps) {
    const std::uint64_t session = session_kbps > 0 ? (std::uint64_t) session_kbps * 1000 : 0;
    if (session == 0) {
      return configured_kbps > 0 ? (std::uint64_t) configured_kbps * 1000 : 800'000'000;  // legacy 80% of 1 Gbps
    }
    if (configured_kbps <= 0) {
      return session * 2;
    }
    const std::uint64_t configured = (std::uint64_t) configured_kbps * 1000;
    const std::uint64_t floor = session * 110 / 100;
    return configured < floor ? floor : configured;
  }
}  // namespace stream
