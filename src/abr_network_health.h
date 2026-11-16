/**
 * @file src/abr_network_health.h
 * @brief Pure classic-stream loss scoring used by the ABR controller.
 */
#pragma once

#include <algorithm>
#include <chrono>
#include <cstdint>

namespace abr {
  struct classic_loss_window {
    std::uint64_t sent_data_packets;
    std::uint64_t missing_data_packets;
    std::uint64_t unrecoverable_frames;
  };

  /**
   * Uses the same 5%, 15%, and 30% loss bands as moonlight-common-c's
   * connection-status algorithm. Scores below 60 trigger the existing ABR
   * downshift hysteresis; 5-15% blocks upshift without causing a false shift.
   */
  inline int score_classic_loss(const classic_loss_window &window) {
    if (window.unrecoverable_frames > 0) {
      return 40;
    }
    if (window.sent_data_packets == 0) {
      return window.missing_data_packets == 0 ? 100 : 40;
    }

    const double loss_percent = std::min(
      100.0,
      static_cast<double>(window.missing_data_packets) * 100.0 /
        static_cast<double>(window.sent_data_packets)
    );
    if (loss_percent > 30.0) return 30;
    if (loss_percent > 15.0) return 50;
    if (loss_percent > 5.0) return 75;
    return 100;
  }

  /**
   * Queueing delay = RTT rise over the session's best RTT. A link slower than the stream bitrate
   * (e.g. 4G) fills its buffers long before it drops packets, so loss alone never triggers a downshift.
   * Measured against the session baseline so a naturally slow path is not penalized.
   */
  /// Seconds of queued data: only an immediate drop to the bitrate floor drains it before the stream freezes.
  inline constexpr int kEmergencyHealth = 0;

  inline int score_rtt_rise(std::uint32_t rtt_ms, std::uint32_t baseline_ms) {
    if (rtt_ms == 0 || baseline_ms == 0 || rtt_ms <= baseline_ms) {
      return 100;
    }
    const auto rise = rtt_ms - baseline_ms;
    if (rise >= 1000) return kEmergencyHealth;
    if (rise >= 250) return 30;
    if (rise >= 120) return 50;
    if (rise >= 60) return 75;
    return 100;
  }

  /// ABR runs when configured, or automatically while any session streams over WAN.
  inline bool abr_active(bool configured, int remote_sessions) {
    return configured || remote_sessions > 0;
  }

  /// Severe congestion (score 30: >30% loss or >=250 ms queueing) halves the bitrate to drain buffers fast.
  inline double downshift_ratio(int health) {
    if (health <= kEmergencyHealth) return 0.0;  // caller clamps to its floor
    return health <= 30 ? 0.5 : 0.75;
  }

  inline constexpr auto kProbeCeilingHold = std::chrono::seconds(120);

  /// Remembers a bitrate an upshift failed at, so later upshifts stop below it instead of re-choking the link.
  struct probe_ceiling {
    std::uint32_t kbps = 0;
    std::chrono::steady_clock::time_point until {};

    void on_failed_probe(std::uint32_t failed_kbps, std::chrono::steady_clock::time_point now) {
      kbps = failed_kbps;
      until = now + kProbeCeilingHold;
    }

    std::uint32_t cap(std::uint32_t target_kbps, std::chrono::steady_clock::time_point now) const {
      if (kbps == 0 || now >= until) {
        return target_kbps;
      }
      return std::min(target_kbps, static_cast<std::uint32_t>(kbps * 0.8));
    }
  };
}  // namespace abr
