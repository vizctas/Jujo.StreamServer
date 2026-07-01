/**
 * @file src/abr_controller.cpp
 * @brief Definitions for the adaptive bitrate controller.
 */
#include "abr_controller.h"

#include <cstdlib>

#include "nvenc/nvenc_base.h"
#include "config.h"
#include "logging.h"
#include "stream.h"
#include "webrtc_stream.h"

namespace abr {

  controller::~controller() {
    stop();
  }

  controller &controller::instance() {
    static controller inst;
    return inst;
  }

  void controller::start() {
    bool expected = false;
    if (!running_.compare_exchange_strong(expected, true)) {
      return;  // Already running
    }

    stop_flag_.store(false, std::memory_order_relaxed);
    thread_ = std::make_unique<std::thread>(&controller::run_loop, this);
    BOOST_LOG(info) << "ABR: controller started";
  }

  void controller::stop() {
    bool expected = true;
    if (!running_.compare_exchange_strong(expected, false)) {
      return;  // Not running
    }

    stop_flag_.store(true, std::memory_order_relaxed);
    if (thread_ && thread_->joinable()) {
      thread_->join();
    }
    thread_.reset();
    BOOST_LOG(info) << "ABR: controller stopped";
  }

  void controller::register_encoder(nvenc::nvenc_base *enc) {
    if (!enc) return;

    bool should_start = false;
    {
      std::lock_guard lock(mutex_);
      auto it = std::find_if(encoders_.begin(), encoders_.end(),
        [enc](const auto &e) { return e.ptr == enc; });
      if (it == encoders_.end()) {
        encoder_entry entry;
        entry.ptr = enc;
        entry.original_bitrate_kbps = enc->current_bitrate_kbps();
        encoders_.push_back(entry);
        BOOST_LOG(debug) << "ABR: registered encoder @ " << enc
                         << " (original " << entry.original_bitrate_kbps << " kbps)";

        should_start = enabled_.load(std::memory_order_relaxed) && encoders_.size() == 1;
      }
    }
    if (should_start) {
      start();
    }
  }

  void controller::unregister_encoder(nvenc::nvenc_base *enc) {
    if (!enc) return;

    bool should_stop = false;
    {
      std::lock_guard lock(mutex_);
      auto it = std::find_if(encoders_.begin(), encoders_.end(),
        [enc](const auto &e) { return e.ptr == enc; });
      if (it != encoders_.end()) {
        BOOST_LOG(debug) << "ABR: unregistered encoder @ " << enc;
        encoders_.erase(it);
        should_stop = encoders_.empty();
      }
    }
    if (should_stop) {
      stop();
    }
  }

  void controller::set_enabled(bool enabled) {
    enabled_.store(enabled, std::memory_order_relaxed);
    BOOST_LOG(info) << "ABR: " << (enabled ? "enabled" : "disabled");

    if (enabled) {
      start();
    } else {
      stop();
      // Reset all encoders to their original bitrates
      std::lock_guard lock(mutex_);
      for (const auto &entry : encoders_) {
        if (entry.original_bitrate_kbps > 0) {
          entry.ptr->set_abr_target_bitrate(entry.original_bitrate_kbps);
        }
      }
      current_target_kbps_ = 0;
      degraded_samples_ = 0;
      healthy_samples_ = 0;
    }
  }

  bool controller::enabled() const {
    return enabled_.load(std::memory_order_relaxed);
  }

  int controller::compute_health_score() const {
    int worst_score = 100;

    // WebRTC sessions (rich stats: drops, queue depth, staleness).
    auto sessions = webrtc_stream::list_sessions();
    auto now = std::chrono::steady_clock::now();

    for (const auto &state : sessions) {
      int score = 100;

      double drop_rate = 0.0;
      if (state.video_packets > 0) {
        drop_rate = (static_cast<double>(state.video_dropped) /
                     static_cast<double>(state.video_packets)) * 100.0;
      }

      int64_t staleness_ms = -1;
      if (state.last_video_time) {
        staleness_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
          now - *state.last_video_time).count();
      }

      if (drop_rate > 5.0) score -= 50;
      else if (drop_rate > 2.0) score -= 30;
      else if (drop_rate > 0.5) score -= 15;

      if (state.video_queue_frames > 10) score -= 30;
      else if (state.video_queue_frames > 5) score -= 15;
      else if (state.video_queue_frames > 2) score -= 5;

      if (staleness_ms > 500) score -= 20;
      else if (staleness_ms > 200) score -= 10;

      if (score < worst_score) worst_score = score;
    }

    // Classic Moonlight sessions (RTSP/ENet) — our real client uses this path,
    // which has no WebRTC session state; health comes from reported packet loss.
    const int classic_score = stream::worst_active_session_loss_health();
    if (classic_score < worst_score) worst_score = classic_score;

    return std::max(0, worst_score);
  }

  void controller::run_loop() {
    // TEST-ONLY (remove before merge): when JUJO_ABR_TEST_CYCLE_SECONDS > 0, the
    // loop ignores health and toggles the target between the original bitrate and
    // ~half every N seconds, to exercise the reconfigure+forced-IDR path
    // deterministically for MiBox decoder validation (a clean LAN never triggers
    // real ABR). 0/unset = normal behavior.
    int test_cycle_s = 0;
    if (const char *e = std::getenv("JUJO_ABR_TEST_CYCLE_SECONDS")) {
      test_cycle_s = std::atoi(e);
    }
    bool test_low = false;
    auto test_last_switch = std::chrono::steady_clock::now();
    if (test_cycle_s > 0) {
      BOOST_LOG(warning) << "ABR: TEST cycle mode active — forcing bitrate toggles every " << test_cycle_s << "s (health ignored)";
    }

    while (!stop_flag_.load(std::memory_order_relaxed)) {
      std::this_thread::sleep_for(kPollInterval);

      if (!enabled_.load(std::memory_order_relaxed)) {
        continue;
      }

      std::lock_guard lock(mutex_);
      if (encoders_.empty()) {
        continue;
      }

      if (test_cycle_s > 0) {
        auto now = std::chrono::steady_clock::now();
        if (now - test_last_switch >= std::chrono::seconds(test_cycle_s)) {
          test_last_switch = now;
          uint32_t max_original = 0;
          for (const auto &entry : encoders_) {
            if (entry.original_bitrate_kbps > max_original) max_original = entry.original_bitrate_kbps;
          }
          test_low = !test_low;
          uint32_t target = test_low
            ? std::max(kMinBitrateKbps, max_original / 2)
            : max_original;
          current_target_kbps_ = target;
          for (const auto &entry : encoders_) {
            entry.ptr->set_abr_target_bitrate(target);
          }
          BOOST_LOG(info) << "ABR[TEST]: forced target -> " << target << " kbps";
        }
        continue;
      }

      int health = compute_health_score();

      auto now = std::chrono::steady_clock::now();
      bool in_cooldown = (now - last_switch_time_) < kCooldown;

      if (health < kDownshiftThreshold) {
        degraded_samples_++;
        healthy_samples_ = 0;

        if (!in_cooldown && degraded_samples_ >= kDownshiftSamples) {
          uint32_t new_target = static_cast<uint32_t>(current_target_kbps_ * kDownshiftRatio);
          if (new_target < kMinBitrateKbps) new_target = kMinBitrateKbps;

          if (new_target < current_target_kbps_) {
            current_target_kbps_ = new_target;
            for (const auto &entry : encoders_) {
              entry.ptr->set_abr_target_bitrate(current_target_kbps_);
            }
            last_switch_time_ = now;
            BOOST_LOG(info) << "ABR: downshift -> " << current_target_kbps_ << " kbps (health=" << health << ")";
          }
          degraded_samples_ = 0;
        }
      } else if (health >= kUpshiftThreshold) {
        healthy_samples_++;
        degraded_samples_ = 0;

        if (!in_cooldown && healthy_samples_ >= kUpshiftSamples) {
          uint32_t new_target = static_cast<uint32_t>(current_target_kbps_ * kUpshiftRatio);

          // Cap at original bitrate of each encoder
          uint32_t max_original = 0;
          for (const auto &entry : encoders_) {
            if (entry.original_bitrate_kbps > max_original) {
              max_original = entry.original_bitrate_kbps;
            }
          }
          if (new_target > max_original) new_target = max_original;

          if (new_target > current_target_kbps_) {
            current_target_kbps_ = new_target;
            for (const auto &entry : encoders_) {
              entry.ptr->set_abr_target_bitrate(current_target_kbps_);
            }
            last_switch_time_ = now;
            BOOST_LOG(info) << "ABR: upshift -> " << current_target_kbps_ << " kbps (health=" << health << ")";
          }
          healthy_samples_ = 0;
        }
      } else {
        degraded_samples_ = 0;
        healthy_samples_ = 0;
      }
    }
  }

}  // namespace abr
