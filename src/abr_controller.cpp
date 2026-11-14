/**
 * @file src/abr_controller.cpp
 * @brief Definitions for the adaptive bitrate controller.
 */
#include "abr_controller.h"

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
    wait_cv_.notify_all();
    if (thread_ && thread_->joinable()) {
      thread_->join();
    }
    thread_.reset();
    BOOST_LOG(info) << "ABR: controller stopped";
  }

  void controller::register_encoder(nvenc::nvenc_base *enc) {
    if (!enc) return;
    register_target(enc, enc->current_bitrate_kbps(), [enc](uint32_t kbps) {
      enc->set_abr_target_bitrate(kbps);
    });
  }
  void controller::register_target(void *key, uint32_t initial_kbps, std::function<void(uint32_t)> apply_kbps) {
    if (!key || !apply_kbps) return;

    bool should_start = false;
    {
      std::lock_guard lock(mutex_);
      auto it = std::find_if(targets_.begin(), targets_.end(),
        [key](const auto &e) { return e.key == key; });
      if (it == targets_.end()) {
        target_entry entry;
        entry.key = key;
        entry.original_bitrate_kbps = initial_kbps;
        entry.apply_kbps = std::move(apply_kbps);
        targets_.push_back(std::move(entry));
        const auto &stored = targets_.back();
        if (stored.original_bitrate_kbps > 0 &&
            (current_target_kbps_ == 0 || stored.original_bitrate_kbps < current_target_kbps_)) {
          current_target_kbps_ = stored.original_bitrate_kbps;
        }
        if (current_target_kbps_ > 0 && stored.original_bitrate_kbps > 0) {
          stored.apply_kbps(std::min(current_target_kbps_, stored.original_bitrate_kbps));
        }
        BOOST_LOG(debug) << "ABR: registered target @ " << key
                         << " (original " << stored.original_bitrate_kbps << " kbps)";

        should_start = enabled_.load(std::memory_order_relaxed) && targets_.size() == 1;
      }
    }
    if (should_start) {
      start();
    }
  }

  void controller::unregister_encoder(nvenc::nvenc_base *enc) {
    unregister_target(enc);
  }

  void controller::unregister_target(void *key) {
    if (!key) return;

    bool should_stop = false;
    {
      std::lock_guard lock(mutex_);
      auto it = std::find_if(targets_.begin(), targets_.end(),
        [key](const auto &e) { return e.key == key; });
      if (it != targets_.end()) {
        BOOST_LOG(debug) << "ABR: unregistered target @ " << key;
        targets_.erase(it);
        should_stop = targets_.empty();
        if (should_stop) {
          current_target_kbps_ = 0;
          degraded_samples_ = 0;
          healthy_samples_ = 0;
        } else {
          std::uint32_t ceiling = 0;
          for (const auto &entry : targets_) {
            if (entry.original_bitrate_kbps > 0 &&
                (ceiling == 0 || entry.original_bitrate_kbps < ceiling)) {
              ceiling = entry.original_bitrate_kbps;
            }
          }
          if (ceiling > 0) current_target_kbps_ = std::min(current_target_kbps_, ceiling);
        }
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
      stream::reset_active_session_loss_windows();
      bool has_targets = false;
      {
        std::lock_guard lock(mutex_);
        has_targets = !targets_.empty();
        if (has_targets && current_target_kbps_ == 0) {
          for (const auto &entry : targets_) {
            if (entry.original_bitrate_kbps > 0 &&
                (current_target_kbps_ == 0 || entry.original_bitrate_kbps < current_target_kbps_)) {
              current_target_kbps_ = entry.original_bitrate_kbps;
            }
          }
        }
      }
      if (has_targets) start();
    } else {
      stop();
      // Reset all targets to their original bitrates
      std::lock_guard lock(mutex_);
      for (const auto &entry : targets_) {
        if (entry.original_bitrate_kbps > 0 && entry.apply_kbps) {
          entry.apply_kbps(entry.original_bitrate_kbps);
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

    worst_score = std::min(worst_score, stream::worst_active_session_loss_health());

    return std::max(0, worst_score);
  }

  void controller::run_loop() {
    while (!stop_flag_.load(std::memory_order_relaxed)) {
      {
        std::unique_lock wait_lock(wait_mutex_);
        if (wait_cv_.wait_for(wait_lock, kPollInterval, [this] {
              return stop_flag_.load(std::memory_order_relaxed);
            })) {
          break;
        }
      }

      if (!enabled_.load(std::memory_order_relaxed)) {
        continue;
      }

      std::lock_guard lock(mutex_);
      if (targets_.empty()) {
        continue;
      }

      auto apply_to_all = [this](uint32_t target_kbps) {
        for (const auto &entry : targets_) {
          if (entry.apply_kbps) {
            const uint32_t clamped = entry.original_bitrate_kbps > 0
              ? std::min(target_kbps, entry.original_bitrate_kbps)
              : target_kbps;
            entry.apply_kbps(clamped);
          }
        }
      };

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
            apply_to_all(current_target_kbps_);
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

          // A shared controller must respect the smallest registered ceiling.
          uint32_t max_original = 0;
          for (const auto &entry : targets_) {
            if (entry.original_bitrate_kbps > 0 &&
                (max_original == 0 || entry.original_bitrate_kbps < max_original)) {
              max_original = entry.original_bitrate_kbps;
            }
          }
          if (max_original > 0 && new_target > max_original) new_target = max_original;

          if (new_target > current_target_kbps_) {
            current_target_kbps_ = new_target;
            apply_to_all(current_target_kbps_);
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
