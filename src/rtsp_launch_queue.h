/**
 * @file src/rtsp_launch_queue.h
 * @brief Bounded FIFO queue for concurrent pending RTSP launch sessions.
 */
#pragma once

#include <algorithm>
#include <chrono>
#include <cstddef>
#include <cstdint>
#include <deque>
#include <mutex>
#include <optional>
#include <utility>
#include <vector>

namespace rtsp_stream {

  template <typename SessionPtr>
  class pending_launch_queue_t {
  public:
    using clock = std::chrono::steady_clock;
    static constexpr std::size_t kMaxPending = 16;

    void raise(SessionPtr session, clock::time_point now, clock::duration timeout) {
      if (!session) {
        return;
      }
      const auto session_id = session->id;
      const auto expires_at = now + timeout;
      std::lock_guard<std::mutex> lk(mutex_);
      prune_locked(now);
      erase_id_locked(session_id);
      while (entries_.size() >= kMaxPending) {
        entries_.pop_front();
      }
      entries_.push_back({std::move(session), expires_at});
    }

    std::vector<SessionPtr> snapshot(clock::time_point now) {
      std::lock_guard<std::mutex> lk(mutex_);
      prune_locked(now);
      std::vector<SessionPtr> out;
      out.reserve(entries_.size());
      for (const auto &entry : entries_) {
        out.push_back(entry.session);
      }
      return out;
    }

    bool clear(std::uint32_t launch_session_id, clock::time_point now) {
      std::lock_guard<std::mutex> lk(mutex_);
      prune_locked(now);
      return erase_id_locked(launch_session_id);
    }

    std::vector<SessionPtr> prune_expired(clock::time_point now, std::optional<clock::time_point> *out_next_expiry = nullptr) {
      std::lock_guard<std::mutex> lk(mutex_);
      auto expired = prune_locked(now);
      if (out_next_expiry) {
        if (entries_.empty()) {
          *out_next_expiry = std::nullopt;
        } else {
          auto earliest = entries_.front().expires_at;
          for (const auto &entry : entries_) {
            if (entry.expires_at < earliest) {
              earliest = entry.expires_at;
            }
          }
          *out_next_expiry = earliest;
        }
      }
      return expired;
    }

    void reset() {
      std::lock_guard<std::mutex> lk(mutex_);
      entries_.clear();
    }

    std::size_t size() const {
      std::lock_guard<std::mutex> lk(mutex_);
      return entries_.size();
    }

  private:
    struct entry_t {
      SessionPtr session;
      clock::time_point expires_at;
    };

    std::vector<SessionPtr> prune_locked(clock::time_point now) {
      std::vector<SessionPtr> expired;
      for (auto it = entries_.begin(); it != entries_.end();) {
        if (now >= it->expires_at) {
          expired.push_back(std::move(it->session));
          it = entries_.erase(it);
        } else {
          ++it;
        }
      }
      return expired;
    }

    bool erase_id_locked(std::uint32_t session_id) {
      bool erased = false;
      for (auto it = entries_.begin(); it != entries_.end();) {
        if (it->session && it->session->id == session_id) {
          it = entries_.erase(it);
          erased = true;
        } else {
          ++it;
        }
      }
      return erased;
    }

    mutable std::mutex mutex_;
    std::deque<entry_t> entries_;
  };

}  // namespace rtsp_stream
