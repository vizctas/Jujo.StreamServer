/**
 * @file src/keyframe_loss_policy.h
 * @brief Discriminates real network loss / keyframe loss from host resets & decoder overflow,
 *        and caps packet pacing to Wi-Fi safe demand when latched.
 */
#pragma once

#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <optional>
#include <string>
#include <utility>

namespace stream::keyframe_loss_policy {

  inline constexpr auto kRepeatWindow = std::chrono::milliseconds(500);
  inline constexpr std::uint32_t kDecodeQueueDepth = 15;
  inline constexpr auto kLossWindow = std::chrono::seconds(2);
  inline constexpr std::size_t kLossFrames = 3;
  inline constexpr auto kHostChangeWindow = std::chrono::seconds(1);
  inline constexpr auto kStartupWindow = kRepeatWindow;
  inline constexpr auto kStartupSpan = std::chrono::seconds(1);
  inline constexpr auto kProvisionalLift = std::chrono::seconds(10);
  inline constexpr std::uint32_t kLiftFrames = 120;

  enum class latch_kind_e {
    startup,
    send,
    sustained,
  };

  inline constexpr bool is_provisional(latch_kind_e kind) {
    return kind == latch_kind_e::startup || kind == latch_kind_e::send;
  }

  struct latch_event_t {
    const char *reason = "";
    std::string detail;
    latch_kind_e kind = latch_kind_e::sustained;
    bool confirmed = false;
    std::optional<latch_kind_e> from;
    bool host_only = false;
  };

  class keyframe_loss_t {
  public:
    using clock = std::chrono::steady_clock;
    using time_point = clock::time_point;

    explicit keyframe_loss_t(bool enabled = true):
        enabled_ {enabled} {}

    void set_reports_losses(bool yes) {
      reports_losses_ = yes;
    }

    bool reports_losses() const {
      return reports_losses_;
    }

    bool enabled() const {
      return enabled_;
    }

    bool latched() const {
      return latched_ != nullptr;
    }

    const char *reason() const {
      return latched_;
    }

    std::optional<latch_kind_e> kind() const {
      return kind_;
    }

    bool ever_latched() const {
      return ever_latched_;
    }

    bool is_keyframe(std::uint32_t frame) const {
      return std::any_of(keyframes_.begin(), keyframes_.end(), [frame](const auto &k) {
        return k && *k == frame;
      });
    }

    bool is_abandoned(std::uint32_t frame) const {
      return contains_u32(abandoned_, frame);
    }

    void host_keyframe() {
      host_reason_ = true;
    }

    void loss_keyframe() {
      loss_reason_ = true;
    }

    void unanswerable() {
      request_pending_ = false;
    }

    void sending_at(std::uint32_t frame, bool keyframe, time_point now) {
      if (keyframe) {
        const bool first = std::all_of(keyframes_.begin(), keyframes_.end(), [](const auto &k) {
          return !k.has_value();
        });
        const bool host = std::exchange(host_reason_, false);
        const bool loss = std::exchange(loss_reason_, false);
        const bool requested = std::exchange(request_pending_, false);

        std::optional<clock::duration> window;
        if (host) {
          window = kHostChangeWindow;
        } else if (first) {
          window = kStartupWindow;
        } else if (!requested && !loss) {
          window = kHostChangeWindow;
        }

        if (window) {
          host_change_ = host_change_window_t {frame, now + *window, *window};
        } else if (requested) {
          keyframe_since_request_ = true;
        }

        if (first) {
          first_keyframe_at_ = now;
        }
        keyframe_startup_[next_kf_] = first || (
          requested && !host && !loss &&
          first_keyframe_at_.has_value() &&
          elapsed(now, *first_keyframe_at_) <= kStartupSpan
        );
        keyframes_[next_kf_] = frame;
        next_kf_ = (next_kf_ + 1) % keyframes_.size();
        refused_keyframe_.reset();
        since_keyframe_ = 0;
      } else if (since_keyframe_ < std::numeric_limits<std::uint32_t>::max()) {
        ++since_keyframe_;
      }

      last_sent_ = frame;
      lift_if_clean(now);
    }

    std::optional<latch_event_t> abandoned_at(
      std::uint32_t frame,
      std::chrono::nanoseconds period,
      time_point now
    ) {
      abandoned_[next_abandoned_] = frame;
      next_abandoned_ = (next_abandoned_ + 1) % abandoned_.size();
      if (is_keyframe(frame)) {
        refused_keyframe_ = frame;
      }
      if (!enabled_) {
        return std::nullopt;
      }
      if (is_keyframe(frame)) {
        return latch(
          "a keyframe was lost on send",
          "the host could not send keyframe " + std::to_string(frame) + " whole",
          now,
          frame,
          false
        );
      }
      return count_loss(
        frame,
        frame,
        period,
        now,
        "three recent video frames were lost on send within two seconds",
        "frames lost on send",
        false
      );
    }

    bool network_loss(std::uint32_t frame, time_point now) const {
      if (contains_u32(abandoned_, frame)) {
        return false;
      }
      if (is_keyframe(frame)) {
        return true;
      }
      if (const auto hc = active_host_change(now)) {
        if ((frame - hc->frame) < (1u << 31)) {
          return false;
        }
      }
      return true;
    }

    bool network_request(time_point now) const {
      if (active_host_change(now)) {
        return false;
      }
      const bool overflow = keyframe_since_request_ &&
                            since_keyframe_ >= kDecodeQueueDepth &&
                            last_request_.has_value() &&
                            elapsed(now, *last_request_) < kRepeatWindow;
      return !overflow;
    }

    std::optional<latch_event_t> unrecoverable_at(
      std::uint32_t frame,
      std::uint32_t last_sent,
      std::chrono::nanoseconds period,
      time_point now
    ) {
      if (!enabled_) {
        return std::nullopt;
      }
      if (contains_u32(abandoned_, frame)) {
        ignored_ = "frame " + std::to_string(frame) + " was not sent whole by the host (counted as lost on send)";
        return std::nullopt;
      }
      if (is_keyframe(frame)) {
        return latch(
          "a keyframe arrived incomplete",
          "the client could not rebuild keyframe " + std::to_string(frame) + "; last frame sent " + std::to_string(last_sent),
          now,
          frame,
          true
        );
      }
      if (const auto hc = active_host_change(now)) {
        if ((frame - hc->frame) < (1u << 31)) {
          ignored_ = "frame " + std::to_string(frame) + " reported incomplete within host change window";
          return std::nullopt;
        }
      }
      return count_loss(
        frame,
        last_sent,
        period,
        now,
        "three recent video frames arrived incomplete within two seconds",
        "unrecoverable frames",
        true
      );
    }

    std::optional<latch_event_t> requested_at(time_point now) {
      if (!enabled_) {
        return std::nullopt;
      }
      const bool has_gap = last_request_.has_value();
      const auto gap = has_gap ? elapsed(now, *last_request_) : clock::duration::zero();
      const bool repeated = keyframe_since_request_ &&
                            since_keyframe_ < kDecodeQueueDepth &&
                            has_gap &&
                            gap < kRepeatWindow;
      keyframe_since_request_ = false;
      request_pending_ = true;

      if (const auto hc = active_host_change(now)) {
        last_request_.reset();
        ignored_ = "keyframe request within host change window after keyframe " + std::to_string(hc->frame);
        return std::nullopt;
      }

      last_request_ = now;
      if (!repeated) {
        return std::nullopt;
      }
      if (reports_losses_) {
        ignored_ = "repeated keyframe request ignored from a client that reports its own losses";
        return std::nullopt;
      }

      const auto kf_idx = (next_kf_ + keyframes_.size() - 1) % keyframes_.size();
      const auto keyframe = keyframes_[kf_idx];
      const bool reported = !keyframe.has_value() ||
                            (refused_keyframe_ != keyframe && !contains_u32(abandoned_, *keyframe));
      const auto gap_ms = std::chrono::duration_cast<std::chrono::milliseconds>(gap).count();
      return latch(
        "the client asked again for the keyframe it was just sent",
        "second request " + std::to_string(gap_ms) + " ms after the first; frames since keyframe " + std::to_string(since_keyframe_),
        now,
        keyframe,
        reported
      );
    }

    std::uint64_t pacing_bps(std::uint64_t base_bps, std::uint64_t safe_bps) const {
      return latched() ? std::min(base_bps, safe_bps) : base_bps;
    }

    std::optional<std::string> take_lifted() {
      auto out = std::move(lifted_note_);
      lifted_note_.reset();
      return out;
    }

    std::optional<std::string> take_ignored() {
      auto out = std::move(ignored_);
      ignored_.reset();
      return out;
    }

  private:
    struct host_change_window_t {
      std::uint32_t frame = 0;
      time_point until;
      clock::duration window {};
    };

    struct loss_sample_t {
      std::uint32_t frame = 0;
      time_point at;
      bool reported = false;
    };

    static clock::duration elapsed(time_point now, time_point then) {
      return now > then ? (now - then) : clock::duration::zero();
    }

    template<std::size_t N>
    static bool contains_u32(const std::array<std::optional<std::uint32_t>, N> &arr, std::uint32_t val) {
      return std::any_of(arr.begin(), arr.end(), [val](const auto &item) {
        return item.has_value() && *item == val;
      });
    }

    bool provisional() const {
      return kind_.has_value() && is_provisional(*kind_);
    }

    bool after_latch(std::uint32_t frame) const {
      if (!latch_frame_) {
        return true;
      }
      const std::uint32_t ahead = frame - *latch_frame_;
      return ahead != 0 && ahead < (1u << 31);
    }

    bool startup_keyframe(std::uint32_t frame) const {
      for (std::size_t i = 0; i < keyframes_.size(); ++i) {
        if (keyframes_[i] && *keyframes_[i] == frame) {
          return keyframe_startup_[i];
        }
      }
      return false;
    }

    std::optional<host_change_window_t> active_host_change(time_point now) const {
      if (host_change_ && now < host_change_->until) {
        return host_change_;
      }
      return std::nullopt;
    }

    void lift_if_clean(time_point now) {
      if (!provisional()) {
        return;
      }
      if (frames_since_latch_ < std::numeric_limits<std::uint32_t>::max()) {
        ++frames_since_latch_;
      }
      const bool quiet = std::all_of(recent_losses_.begin(), recent_losses_.end(), [now](const auto &slot) {
        return !slot.has_value() || elapsed(now, slot->at) >= kLossWindow;
      });
      std::optional<time_point> since = observed_at_;
      if (last_loss_at_ && (!since || *last_loss_at_ > *since)) {
        since = last_loss_at_;
      }
      const auto held = since ? elapsed(now, *since) : clock::duration::zero();
      if (held >= kProvisionalLift && frames_since_latch_ >= kLiftFrames && quiet) {
        const char *what = (kind_ == latch_kind_e::send)
          ? "only the host's socket refused video"
          : "the first keyframe was lost";
        const auto secs = std::chrono::duration_cast<std::chrono::seconds>(held).count();
        lifted_note_ = std::string(what) + ", nothing since for " + std::to_string(secs) + " s";
        latched_ = nullptr;
        kind_.reset();
        observed_at_.reset();
        latch_keyframe_.reset();
        latch_frame_.reset();
        last_loss_at_.reset();
        lifted_ = true;
        recent_losses_ = {};
      }
    }

    std::optional<latch_event_t> count_loss(
      std::uint32_t frame,
      std::uint32_t last_sent,
      std::chrono::nanoseconds period,
      time_point now,
      const char *reason,
      const char *what,
      bool reported
    ) {
      if ((observed_at_.has_value() && !provisional() && sustained_at_.has_value()) ||
          period <= std::chrono::nanoseconds::zero()) {
        return std::nullopt;
      }
      const std::uint32_t delta = last_sent - frame;
      // Avoid overflow by converting delta check carefully
      const auto max_age_frames = static_cast<std::uint64_t>(kLossWindow / period);
      if (delta >= max_age_frames && (kLossWindow % period == std::chrono::nanoseconds::zero() || delta > max_age_frames)) {
        return std::nullopt;
      }
      if (provisional() && !after_latch(frame)) {
        return std::nullopt;
      }
      for (auto &slot : recent_losses_) {
        if (slot && elapsed(now, slot->at) >= kLossWindow) {
          slot.reset();
        }
      }
      for (const auto &slot : recent_losses_) {
        if (slot && slot->frame == frame) {
          return std::nullopt;
        }
      }

      std::size_t slot_idx = recent_losses_.size();
      for (std::size_t i = 0; i < recent_losses_.size(); ++i) {
        if (!recent_losses_[i]) {
          slot_idx = i;
          break;
        }
      }
      if (slot_idx == recent_losses_.size()) {
        slot_idx = 0;
        for (std::size_t i = 1; i < recent_losses_.size(); ++i) {
          if (recent_losses_[i]->at < recent_losses_[slot_idx]->at) {
            slot_idx = i;
          }
        }
      }

      recent_losses_[slot_idx] = loss_sample_t {frame, now, reported};
      if (provisional()) {
        last_loss_at_ = now;
      }

      const bool all_full = std::all_of(recent_losses_.begin(), recent_losses_.end(), [](const auto &s) {
        return s.has_value();
      });
      if (!all_full) {
        return std::nullopt;
      }

      std::string detail = std::string(what) + " [";
      for (std::size_t i = 0; i < recent_losses_.size(); ++i) {
        if (i > 0) detail += ", ";
        detail += std::to_string(recent_losses_[i]->frame);
      }
      detail += "]; last frame sent " + std::to_string(last_sent);

      return latch(reason, std::move(detail), now, std::nullopt, reported);
    }

    std::optional<latch_event_t> latch(
      const char *reason,
      std::string detail,
      time_point now,
      std::optional<std::uint32_t> keyframe,
      bool reported
    ) {
      if (!enabled_) {
        return std::nullopt;
      }
      const bool client_reported_recent = std::any_of(recent_losses_.begin(), recent_losses_.end(), [now](const auto &slot) {
        return slot.has_value() && slot->reported && elapsed(now, slot->at) < kLossWindow;
      });
      const bool any_client_report = reported || client_reported_recent;

      if (observed_at_.has_value()) {
        const auto prev_kind = kind_;
        if (!provisional()) {
          if (!sustained_at_.has_value() && any_client_report) {
            sustained_at_ = now;
            return latch_event_t {reason, std::move(detail), latch_kind_e::sustained, true, prev_kind, false};
          }
          return std::nullopt;
        }
        if ((keyframe && keyframe == latch_keyframe_) || (keyframe && !after_latch(*keyframe))) {
          return std::nullopt;
        }
        if (!any_client_report) {
          last_loss_at_ = now;
          return std::nullopt;
        }
        kind_ = latch_kind_e::sustained;
        sustained_at_ = now;
        latch_keyframe_.reset();
        return latch_event_t {reason, std::move(detail), latch_kind_e::sustained, true, prev_kind, false};
      }

      if (!any_client_report) {
        const auto kind = (lifted_ || latched_ != nullptr) ? latch_kind_e::sustained : latch_kind_e::send;
        observed_at_ = now;
        latched_ = reason;
        kind_ = kind;
        ever_latched_ = true;
        frames_since_latch_ = 0;
        latch_keyframe_ = is_provisional(kind) ? keyframe : std::nullopt;
        latch_frame_ = last_sent_;
        last_loss_at_.reset();
        return latch_event_t {reason, std::move(detail), kind, false, std::nullopt, true};
      }

      const bool recent_evidence = std::any_of(recent_losses_.begin(), recent_losses_.end(), [now](const auto &slot) {
        return slot.has_value() && elapsed(now, slot->at) < kLossWindow;
      });
      const bool provisional_startup = latched_ == nullptr &&
                                       !lifted_ &&
                                       !recent_evidence &&
                                       keyframe.has_value() &&
                                       startup_keyframe(*keyframe);
      const auto kind = provisional_startup ? latch_kind_e::startup : latch_kind_e::sustained;
      observed_at_ = now;
      latched_ = reason;
      kind_ = kind;
      ever_latched_ = true;
      frames_since_latch_ = 0;
      latch_keyframe_ = provisional_startup ? keyframe : std::nullopt;
      latch_frame_ = last_sent_;
      last_loss_at_.reset();
      if (!provisional_startup) {
        sustained_at_ = now;
      }
      return latch_event_t {reason, std::move(detail), kind, false, std::nullopt, false};
    }

    bool enabled_ = true;
    std::array<std::optional<std::uint32_t>, 8> keyframes_ {};
    std::array<bool, 8> keyframe_startup_ {};
    std::size_t next_kf_ = 0;
    std::optional<time_point> first_keyframe_at_;
    std::optional<time_point> last_request_;
    bool keyframe_since_request_ = false;
    std::uint32_t since_keyframe_ = 0;
    std::array<std::optional<loss_sample_t>, kLossFrames> recent_losses_ {};
    bool request_pending_ = false;
    bool host_reason_ = false;
    bool loss_reason_ = false;
    std::optional<host_change_window_t> host_change_;
    std::array<std::optional<std::uint32_t>, 8> abandoned_ {};
    std::size_t next_abandoned_ = 0;
    std::optional<std::uint32_t> refused_keyframe_;
    std::optional<std::string> ignored_;
    const char *latched_ = nullptr;
    std::optional<latch_kind_e> kind_;
    std::optional<time_point> observed_at_;
    std::optional<time_point> sustained_at_;
    bool ever_latched_ = false;
    bool lifted_ = false;
    std::optional<std::uint32_t> latch_keyframe_;
    std::uint32_t frames_since_latch_ = 0;
    std::optional<std::uint32_t> last_sent_;
    std::optional<std::uint32_t> latch_frame_;
    std::optional<time_point> last_loss_at_;
    std::optional<std::string> lifted_note_;
    bool reports_losses_ = false;
  };

}  // namespace stream::keyframe_loss_policy
