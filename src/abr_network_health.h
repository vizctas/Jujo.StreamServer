/**
 * @file src/abr_network_health.h
 * @brief Pure classic-stream loss scoring used by the ABR controller.
 */
#pragma once

#include <algorithm>
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
}  // namespace abr
