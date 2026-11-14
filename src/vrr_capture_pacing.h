/**
 * @file src/vrr_capture_pacing.h
 * @brief Coalesces VRR/compositor duplicate captures and predicts fresh game picture windows.
 */
#pragma once

#include <algorithm>
#include <array>
#include <chrono>
#include <cstddef>
#include <optional>

namespace platf::vrr_capture {

  inline constexpr auto kSamePictureGap = std::chrono::milliseconds(2);
  inline constexpr auto kMaxVrrWait = std::chrono::milliseconds(2);
  inline constexpr auto kPredictLead = std::chrono::microseconds(300);
  inline constexpr auto kMinPredictAge = std::chrono::milliseconds(1);
  inline constexpr auto kMaxSourceGap = std::chrono::milliseconds(500);
  inline constexpr auto kMinSteadyPictureInterval = std::chrono::milliseconds(3);
  inline constexpr std::size_t kHistorySize = 16;

  /**
   * @brief Tracks game picture cadence modulo <2 ms DWM re-compositions and computes
   *        a bounded <=2 ms wait when a faster VRR game frame is imminent.
   */
  class picture_cadence_t {
  public:
    using clock = std::chrono::steady_clock;
    using time_point = clock::time_point;
    using nanoseconds = std::chrono::nanoseconds;

    void observe(time_point captured_ts) {
      if (last_capture_ && captured_ts <= *last_capture_) {
        return;
      }

      bool same_picture = false;
      if (last_capture_) {
        const auto gap = captured_ts - *last_capture_;
        if (gap <= kMaxSourceGap) {
          same_picture = gap < kSamePictureGap;
        } else {
          reset_history();
        }
      }
      last_capture_ = captured_ts;

      if (same_picture) {
        return;
      }

      if (picture_start_ && (captured_ts - *picture_start_) <= kMaxSourceGap) {
        pictures_[picture_next_] = std::chrono::duration_cast<nanoseconds>(captured_ts - *picture_start_);
        picture_next_ = (picture_next_ + 1) % kHistorySize;
        picture_count_ = std::min(picture_count_ + 1, kHistorySize);
      } else {
        picture_count_ = 0;
        picture_next_ = 0;
        picture_median_.reset();
      }
      picture_start_ = captured_ts;

      if (picture_count_ >= 4) {
        auto sorted = pictures_;
        std::sort(sorted.begin(), sorted.begin() + static_cast<std::ptrdiff_t>(picture_count_));
        const auto median = sorted[picture_count_ / 2];
        // Require steady source intervals (skip erratic desktop idle updates)
        if (median >= kMinSteadyPictureInterval &&
            sorted[0] * 8 >= median * 5 &&
            sorted[picture_count_ - 1] * 8 <= median * 11) {
          picture_median_ = median;
        } else {
          picture_median_.reset();
        }
      }
    }

    std::optional<nanoseconds> median_picture_interval() const {
      return picture_median_;
    }

    /**
     * @brief Returns bounded [0, 2 ms] sleep needed to catch the next game picture when
     *        the source renders significantly faster than the stream interval (e.g. 120 Hz -> 60 fps).
     */
    nanoseconds additional_wait_for_fresh_picture(
      time_point now,
      time_point captured_ts,
      nanoseconds stream_interval
    ) const {
      if (!picture_median_ || !picture_start_ || stream_interval <= nanoseconds::zero()) {
        return nanoseconds::zero();
      }
      // Only align when source updates meaningfully faster than stream (< 85% of stream period)
      if (*picture_median_ * 100 >= stream_interval * 85) {
        return nanoseconds::zero();
      }
      // Captured picture must already be meaningfully aged (>= 1 ms) so we don't skip fresh frames
      if (now <= captured_ts || (now - captured_ts) < kMinPredictAge) {
        return nanoseconds::zero();
      }

      const auto predicted_next = *picture_start_ + *picture_median_;
      if (predicted_next <= now) {
        return nanoseconds::zero();
      }
      const auto delta = predicted_next - now;
      if (delta > kMaxVrrWait) {
        return nanoseconds::zero();
      }
      return std::min<nanoseconds>(kMaxVrrWait, delta + kPredictLead);
    }

  private:
    void reset_history() {
      picture_count_ = 0;
      picture_next_ = 0;
      picture_start_.reset();
      picture_median_.reset();
    }

    std::optional<time_point> last_capture_;
    std::optional<time_point> picture_start_;
    std::array<nanoseconds, kHistorySize> pictures_ {};
    std::size_t picture_count_ = 0;
    std::size_t picture_next_ = 0;
    std::optional<nanoseconds> picture_median_;
  };

}  // namespace platf::vrr_capture
