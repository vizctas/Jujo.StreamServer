/**
 * @file src/abr_controller.h
 * @brief Adaptive Bitrate (ABR) controller singleton.
 *
 * Monitors WebRTC session health and adjusts registered NVENC encoder
 * bitrates in real-time without restarting the stream.
 */
#pragma once

// standard includes
#include <atomic>
#include <chrono>
#include <cstdint>
#include <memory>
#include <mutex>
#include <thread>
#include <vector>

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
     * @brief Enable or disable ABR adjustments at runtime.
     */
    void set_enabled(bool enabled);

    bool enabled() const;

  private:
    controller() = default;
    ~controller();

    void run_loop();

    int compute_health_score() const;

    struct encoder_entry {
      nvenc::nvenc_base *ptr;
      uint32_t original_bitrate_kbps;
    };

    std::mutex mutex_;
    std::vector<encoder_entry> encoders_;

    std::atomic<bool> enabled_ {false};
    std::atomic<bool> running_ {false};
    std::atomic<bool> stop_flag_ {false};
    std::unique_ptr<std::thread> thread_;

    // ABR state machine
    uint32_t current_target_kbps_ = 0;
    int degraded_samples_ = 0;
    int healthy_samples_ = 0;
    std::chrono::steady_clock::time_point last_switch_time_;

    // Tunable constants
    static constexpr int kDownshiftThreshold = 60;      ///< Health score below this triggers downshift
    static constexpr int kUpshiftThreshold = 85;        ///< Health score above this triggers upshift
    static constexpr int kDownshiftSamples = 3;         ///< Consecutive degraded samples before downshift
    static constexpr int kUpshiftSamples = 10;          ///< Consecutive healthy samples before upshift
    static constexpr auto kCooldown = std::chrono::seconds(15);
    static constexpr auto kPollInterval = std::chrono::seconds(5);
    static constexpr uint32_t kMinBitrateKbps = 2000;   ///< Floor for ABR adjustments
    static constexpr double kDownshiftRatio = 0.75;     ///< Multiply bitrate by this on downshift
    static constexpr double kUpshiftRatio = 1.25;       ///< Multiply bitrate by this on upshift
  };

}  // namespace abr
