/**
 * @file src/abr_controller.h
 * @brief Adaptive Bitrate (ABR) controller singleton.
 *
 * Monitors WebRTC and classic Moonlight session health and adjusts NVENC encoder
 * bitrates in real-time without restarting the stream.
 */
#pragma once

// standard includes
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <memory>
#include <mutex>
#include <thread>
#include <functional>
#include <string>
#include <unordered_map>
#include <vector>

#include "abr_network_health.h"

namespace nvenc {
  class nvenc_base;
}  // namespace nvenc

namespace abr {

  /**
   * @brief Singleton adaptive bitrate controller.
   *
   * Registered encoders receive dynamic bitrate adjustments based on
   * aggregate stream health.  The controller runs a background thread
   * that polls health every 5 s and steps bitrate up or down within
   * configured bounds.
   */
  class controller {
  public:
    static controller &instance();

    controller(const controller &) = delete;
    controller &operator=(const controller &) = delete;

    /**
     * @brief Start the background monitoring thread.
     *
     * Safe to call multiple times; only starts if not already running.
     */
    void start();

    /**
     * @brief Stop the background monitoring thread.
     *
     * Blocks until the thread exits.
     */
    void stop();

    /**
     * @brief Register an active encoder for ABR management.
     * @param enc Pointer to the encoder.  Must remain valid until
     *        unregister_encoder() is called.
     */
    void register_encoder(nvenc::nvenc_base *enc);

    /**
     * @brief Unregister an encoder (e.g. on destroy).
     * @param enc Pointer previously passed to register_encoder().
     */
    void unregister_encoder(nvenc::nvenc_base *enc);

    /**
     * @brief Register any generic bitrate-controllable target (NVENC, AMF, QSV, VAAPI, x264, or stream pacer).
     */
    void register_target(void *key, uint32_t initial_kbps, std::function<void(uint32_t)> apply_kbps);

    /**
     * @brief Unregister a generic target previously passed to register_target().
     */
    void unregister_target(void *key);

    /**
     * @brief Enable or disable ABR adjustments at runtime.
     */
    void set_enabled(bool enabled);

    bool enabled() const;

    /**
     * @brief Count a WAN streaming session in or out. While any is active, ABR runs even when
     *        `enable_abr` is off: a fixed LAN bitrate saturates mobile/remote links.
     */
    void note_remote_session(bool started);

  private:
    bool active() const;
    /// Start or stop adjusting when `active()` changed from `was_active`.
    void apply_activity(bool was_active);

    controller() = default;
    ~controller();

    void run_loop();

    /// Worst health over all sessions; `bwe_cap_kbps` = smallest libwebrtc BWE (0 = none).
    int compute_health_score(uint32_t &bwe_cap_kbps);

    /// Per-WebRTC-session counters from the previous poll, so health scores a 1 s window.
    struct webrtc_window {
      std::uint64_t packets = 0;
      std::uint64_t dropped = 0;
      std::uint32_t rtt_baseline_ms = 0;
    };
    std::unordered_map<std::string, webrtc_window> webrtc_windows_;

    struct target_entry {
      void *key = nullptr;
      std::function<void(uint32_t)> apply_kbps;
      uint32_t original_bitrate_kbps;
    };

    std::mutex mutex_;
    std::vector<target_entry> targets_;

    std::atomic<bool> enabled_ {false};
    std::atomic<int> remote_sessions_ {0};
    std::atomic<bool> running_ {false};
    std::atomic<bool> stop_flag_ {false};
    std::unique_ptr<std::thread> thread_;
    std::mutex wait_mutex_;
    std::condition_variable wait_cv_;

    // ABR state machine
    uint32_t current_target_kbps_ = 0;
    int degraded_samples_ = 0;
    int healthy_samples_ = 0;
    std::chrono::steady_clock::time_point last_switch_time_;
    bool last_switch_was_upshift_ = false;
    probe_ceiling ceiling_;

    // Tunable constants
    static constexpr int kDownshiftThreshold = 60;      ///< Health score below this triggers downshift
    static constexpr int kUpshiftThreshold = 85;        ///< Health score above this triggers upshift
    static constexpr int kDownshiftSamples = 2;         ///< Consecutive degraded samples before downshift (2 s @ 1 Hz)
    static constexpr int kUpshiftSamples = 8;           ///< Consecutive healthy samples before upshift (8 s @ 1 Hz)
    static constexpr auto kCooldown = std::chrono::seconds(4);
    static constexpr auto kPollInterval = std::chrono::seconds(1);
    static constexpr uint32_t kMinBitrateKbps = 2000;   ///< Floor for ABR adjustments
    static constexpr double kUpshiftRatio = 1.25;       ///< Multiply bitrate by this on upshift
  };

}  // namespace abr
