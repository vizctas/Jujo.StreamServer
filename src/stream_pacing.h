/**
 * @file src/stream_pacing.h
 * @brief RTP video send-pacer target.
 */
#pragma once

#include <chrono>
#include <cstdint>

namespace stream {
  /**
   * @brief Send-pacer rate in bits per second.
   * @param configured_kbps `pacing_max_bitrate_kbps`; 0 = automatic.
   * @param session_kbps Negotiated encoder bitrate, after the RTSP FEC deduction.
   * @param fec_percentage Parity percentage used for this frame.
   *
   * Automatic paces at 2x the session bitrate: unpaced per-frame bursts turn into
   * late frames on WiFi clients (Chromecast A/B: 21% -> 1.2% of 5 s windows with a
   * >=50 ms hitch), while 1.3x delayed large frames enough to drop some. An explicit
   * value is honored above a floor covering configured parity plus 10% headroom.
   * This floor is not a bound on individual IDR frames or minimum-parity padding.
   */
  constexpr std::uint64_t pacing_bps(std::int64_t configured_kbps, std::int64_t session_kbps, unsigned int fec_percentage = 0) {
    const std::uint64_t session = session_kbps > 0 ? (std::uint64_t) session_kbps * 1000 : 0;
    if (session == 0) {
      return configured_kbps > 0 ? (std::uint64_t) configured_kbps * 1000 : 800'000'000;  // legacy 80% of 1 Gbps
    }
    const std::uint64_t configured = configured_kbps > 0 ? (std::uint64_t) configured_kbps * 1000 : session * 2;
    const std::uint64_t floor = session * (100ull + fec_percentage) * 110 / 10000;
    return configured < floor ? floor : configured;
  }

  // Cumulative delay avoids accumulating per-packet rounding error.
  constexpr std::chrono::nanoseconds pacing_delay(std::uint64_t bytes, std::uint64_t bps) {
    // Byte counts are bounded by one encoded frame. pacing_bps() is always positive.
    const auto numerator = bytes * 8'000'000'000ull;
    return std::chrono::nanoseconds(numerator / bps + (numerator % bps != 0));
  }
}  // namespace stream
