/**
 * @file src/couch_coop.cpp
 * @brief Implementation of CouchCoopCoordinator slot allocation, reconnect grace,
 *        input capability enforcement, and owner-priority KBM handoff.
 */

#include "src/couch_coop.h"

#include <algorithm>
#include <chrono>

namespace couch_coop {
  std::string_view to_string(role_e role) {
    switch (role) {
      case role_e::owner:
        return "owner";
      case role_e::viewer:
        return "viewer";
      case role_e::coop_pad:
        return "coop_pad";
      case role_e::coop_kbm:
        return "coop_kbm";
    }
    return "viewer";
  }

  std::optional<role_e> parse_role(std::string_view value) {
    if (value == "owner") {
      return role_e::owner;
    }
    if (value == "viewer") {
      return role_e::viewer;
    }
    if (value == "coop_pad") {
      return role_e::coop_pad;
    }
    if (value == "coop_kbm") {
      return role_e::coop_kbm;
    }
    return std::nullopt;
  }

  std::string_view to_string(transport_e transport) {
    switch (transport) {
      case transport_e::rtsp:
        return "rtsp";
      case transport_e::webrtc:
        return "webrtc";
      case transport_e::turbo_input:
        return "turbo_input";
    }
    return "rtsp";
  }

  Coordinator::Coordinator(std::int64_t kbm_handoff_ms, std::int64_t reconnect_grace_ms):
      kbm_handoff_ms_(std::max<std::int64_t>(0, kbm_handoff_ms)),
      reconnect_grace_ms_(std::max<std::int64_t>(0, reconnect_grace_ms)) {
  }

  void Coordinator::prune_expired_locked(std::int64_t now_ms) {
    sessions_.erase(
      std::remove_if(sessions_.begin(), sessions_.end(), [&](const peer_session_t &s) {
        return !s.connected && (now_ms - s.disconnected_at_ms) > reconnect_grace_ms_;
      }),
      sessions_.end()
    );
  }

  bool Coordinator::is_slot_in_use_locked(
    int slot,
    std::string_view except_session_id,
    std::string_view except_uuid
  ) const {
    if (slot == 0) {
      return true;  // Slot 0 (Player 1) is reserved exclusively for Owner.
    }
    for (const auto &s : sessions_) {
      if (s.session_id == except_session_id) {
        continue;
      }
      if (!except_uuid.empty() && s.client_uuid == except_uuid) {
        continue;
      }
      if (s.assigned_slot == slot) {
        return true;
      }
    }
    return false;
  }

  int Coordinator::allocate_guest_slot_locked(std::string_view session_id, std::string_view client_uuid) const {
    for (int slot = 1; slot < kMaxGamepadSlots; ++slot) {
      if (!is_slot_in_use_locked(slot, session_id, client_uuid)) {
        return slot;
      }
    }
    return -1;
  }

  peer_session_t *Coordinator::find_by_session_locked(std::string_view session_id) {
    for (auto &s : sessions_) {
      if (s.session_id == session_id) {
        return &s;
      }
    }
    return nullptr;
  }

  peer_session_t Coordinator::register_session(
    std::string session_id,
    std::string client_uuid,
    std::string display_name,
    bool is_owner,
    role_e desired_role,
    transport_e transport,
    std::int64_t now_ms
  ) {
    std::lock_guard lock(mutex_);
    prune_expired_locked(now_ms);

    // Prevent non-owner callers from escalating to owner role.
    const role_e effective_role = is_owner
      ? role_e::owner
      : (desired_role == role_e::owner ? role_e::coop_pad : desired_role);

    if (auto *existing = find_by_session_locked(session_id)) {
      existing->client_uuid = std::move(client_uuid);
      existing->display_name = std::move(display_name);
      existing->transport = transport;
      existing->role = effective_role;
      existing->connected = true;
      existing->connected_at_ms = now_ms;
      existing->disconnected_at_ms = 0;
      if (is_owner) {
        existing->assigned_slot = 0;
      } else if (existing->role == role_e::viewer) {
        existing->assigned_slot = -1;
      } else if (existing->assigned_slot <= 0) {
        existing->assigned_slot = allocate_guest_slot_locked(existing->session_id, existing->client_uuid);
        if (existing->assigned_slot < 0) {
          existing->role = role_e::viewer;
        }
      }
      return *existing;
    }

    int assigned_slot = -1;
    role_e final_role = effective_role;
    bool preserved_paused = false;

    if (is_owner) {
      assigned_slot = 0;
    } else {
      // Reclaim preserved grace-period slot when the same guest UUID reconnects cleanly.
      int reclaimed_slot = -1;
      if (!client_uuid.empty()) {
        for (auto it = sessions_.begin(); it != sessions_.end();) {
          if (it->client_uuid == client_uuid && it->role != role_e::owner) {
            if (it->assigned_slot > 0) {
              reclaimed_slot = it->assigned_slot;
            }
            preserved_paused = it->paused;
            if (!it->connected) {
              it = sessions_.erase(it);
              continue;
            }
          }
          ++it;
        }
      }

      if (final_role == role_e::coop_pad || final_role == role_e::coop_kbm) {
        if (reclaimed_slot > 0 && !is_slot_in_use_locked(reclaimed_slot, session_id, client_uuid)) {
          assigned_slot = reclaimed_slot;
        } else {
          assigned_slot = allocate_guest_slot_locked(session_id, client_uuid);
        }
        if (assigned_slot < 0) {
          final_role = role_e::viewer;
        }
      }
    }

    peer_session_t entry;
    entry.session_id = std::move(session_id);
    entry.client_uuid = std::move(client_uuid);
    entry.display_name = std::move(display_name);
    entry.role = final_role;
    entry.transport = transport;
    entry.assigned_slot = assigned_slot;
    entry.paused = preserved_paused;
    entry.connected = true;
    entry.connected_at_ms = now_ms;
    sessions_.push_back(entry);
    return entry;
  }

  void Coordinator::disconnect_session(std::string_view session_id, std::int64_t now_ms) {
    std::lock_guard lock(mutex_);
    if (auto *s = find_by_session_locked(session_id)) {
      s->connected = false;
      s->disconnected_at_ms = now_ms;
    }
    if (active_kbm_session_ == session_id) {
      active_kbm_session_.clear();
    }
    prune_expired_locked(now_ms);
  }

  void Coordinator::notify_owner_kbm_activity(std::int64_t now_ms) {
    std::lock_guard lock(mutex_);
    last_owner_kbm_ms_ = now_ms;
    active_kbm_session_.clear();
  }

  bool Coordinator::assert_session_allows(std::string_view session_id, capability_e cap, std::int64_t now_ms) {
    std::lock_guard lock(mutex_);
    auto *s = find_by_session_locked(session_id);
    if (!s || !s->connected || s->paused) {
      return false;
    }

    if (s->role == role_e::owner) {
      if (cap == capability_e::kbm) {
        last_owner_kbm_ms_ = now_ms;
        active_kbm_session_ = s->session_id;
      }
      return true;
    }

    if (s->role == role_e::viewer) {
      return false;
    }

    if (cap == capability_e::text_clipboard || cap == capability_e::admin) {
      return false;
    }

    if (cap == capability_e::gamepad) {
      return (s->role == role_e::coop_pad || s->role == role_e::coop_kbm) && s->assigned_slot > 0;
    }

    if (cap == capability_e::kbm) {
      if (s->role != role_e::coop_kbm) {
        return false;
      }
      // Immediate Owner preemption: guests wait 2s after Owner's last KBM input.
      if ((now_ms - last_owner_kbm_ms_) < kbm_handoff_ms_) {
        return false;
      }
      if (!active_kbm_session_.empty() &&
          active_kbm_session_ != s->session_id &&
          (now_ms - last_guest_kbm_ms_) < kbm_handoff_ms_) {
        return false;
      }
      active_kbm_session_ = s->session_id;
      last_guest_kbm_ms_ = now_ms;
      s->last_kbm_ms = now_ms;
      return true;
    }

    return false;
  }

  std::optional<int> Coordinator::remap_gamepad_slot(
    std::string_view session_id,
    int incoming_controller,
    std::int64_t now_ms
  ) {
    if (incoming_controller < 0 || incoming_controller >= kMaxGamepadSlots) {
      return std::nullopt;
    }
    std::lock_guard lock(mutex_);
    const auto *s = find_by_session_locked(session_id);
    if (!s || !s->connected || s->paused) {
      return std::nullopt;
    }
    if (s->role == role_e::owner) {
      return incoming_controller;
    }
    if ((s->role == role_e::coop_pad || s->role == role_e::coop_kbm) && s->assigned_slot > 0) {
      if (incoming_controller != 0) {
        return std::nullopt;
      }
      return s->assigned_slot;
    }
    (void) now_ms;
    return std::nullopt;
  }

  std::optional<std::string> Coordinator::owner_session_for_slot(int gamepad_slot, std::int64_t now_ms) {
    if (gamepad_slot < 0 || gamepad_slot >= kMaxGamepadSlots) {
      return std::nullopt;
    }
    std::lock_guard lock(mutex_);
    prune_expired_locked(now_ms);
    if (gamepad_slot == 0) {
      for (const auto &s : sessions_) {
        if (s.connected && s.role == role_e::owner) {
          return s.session_id;
        }
      }
      return std::nullopt;
    }
    for (const auto &s : sessions_) {
      if (s.connected && !s.paused && s.assigned_slot == gamepad_slot) {
        return s.session_id;
      }
    }
    return std::nullopt;
  }

  bool Coordinator::set_session_role(std::string_view session_id, role_e new_role, std::int64_t now_ms) {
    std::lock_guard lock(mutex_);
    prune_expired_locked(now_ms);
    auto *s = find_by_session_locked(session_id);
    if (!s || s->role == role_e::owner || new_role == role_e::owner) {
      return false;
    }
    if (new_role == role_e::viewer) {
      s->role = role_e::viewer;
      s->assigned_slot = -1;
      if (active_kbm_session_ == s->session_id) {
        active_kbm_session_.clear();
      }
      return true;
    }
    if (s->assigned_slot <= 0) {
      const int slot = allocate_guest_slot_locked(s->session_id, s->client_uuid);
      if (slot < 0) {
        return false;
      }
      s->assigned_slot = slot;
    }
    s->role = new_role;
    return true;
  }

  bool Coordinator::set_session_paused(std::string_view session_id, bool paused) {
    std::lock_guard lock(mutex_);
    auto *s = find_by_session_locked(session_id);
    if (!s || s->role == role_e::owner) {
      return false;
    }
    s->paused = paused;
    if (paused && active_kbm_session_ == s->session_id) {
      active_kbm_session_.clear();
    }
    return true;
  }

  bool Coordinator::kick_session(std::string_view session_id) {
    std::lock_guard lock(mutex_);
    const auto before = sessions_.size();
    sessions_.erase(
      std::remove_if(sessions_.begin(), sessions_.end(), [&](const peer_session_t &s) {
        return s.session_id == session_id && s.role != role_e::owner;
      }),
      sessions_.end()
    );
    if (active_kbm_session_ == session_id) {
      active_kbm_session_.clear();
    }
    return sessions_.size() < before;
  }

  bool Coordinator::is_secondary_coop_session(std::string_view session_id) {
    std::lock_guard lock(mutex_);
    const auto *s = find_by_session_locked(session_id);
    return s != nullptr && s->role != role_e::owner;
  }

  std::vector<peer_session_t> Coordinator::snapshot_sessions(std::int64_t now_ms) {
    std::lock_guard lock(mutex_);
    prune_expired_locked(now_ms);
    return sessions_;
  }

  void Coordinator::clear() {
    std::lock_guard lock(mutex_);
    sessions_.clear();
    last_owner_kbm_ms_ = -1000000;
    last_guest_kbm_ms_ = -1000000;
    active_kbm_session_.clear();
  }

  std::int64_t now_steady_ms() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
             std::chrono::steady_clock::now().time_since_epoch()
    )
      .count();
  }

  Coordinator &coordinator() {
    static Coordinator instance;
    return instance;
  }
}  // namespace couch_coop
