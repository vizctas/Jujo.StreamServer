/**
 * @file src/couch_coop.h
 * @brief Unified Couch Co-Op slot allocator, reconnect grace tracker,
 *        capability gatekeeper, KBM handoff arbiter, and feedback router.
 */
#pragma once

#include <cstdint>
#include <mutex>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace couch_coop {
  constexpr int kMaxGamepadSlots = 16;
  constexpr std::int64_t kDefaultKbmHandoffMs = 2000;
  constexpr std::int64_t kDefaultReconnectGraceMs = 45000;

  enum class role_e : std::uint8_t {
    owner = 0,
    viewer,
    coop_pad,
    coop_kbm,
  };

  enum class capability_e : std::uint8_t {
    gamepad = 0,
    kbm,
    text_clipboard,
    admin,
  };

  enum class transport_e : std::uint8_t {
    rtsp = 0,
    webrtc,
    turbo_input,
  };

  struct peer_session_t {
    std::string session_id;
    std::string client_uuid;
    std::string display_name;
    role_e role = role_e::viewer;
    transport_e transport = transport_e::rtsp;
    int assigned_slot = -1;
    bool paused = false;
    bool connected = false;
    std::int64_t connected_at_ms = 0;
    std::int64_t disconnected_at_ms = 0;
    std::int64_t last_kbm_ms = 0;
  };

  std::string_view to_string(role_e role);
  std::optional<role_e> parse_role(std::string_view value);
  std::string_view to_string(transport_e transport);

  class Coordinator {
  public:
    explicit Coordinator(
      std::int64_t kbm_handoff_ms = kDefaultKbmHandoffMs,
      std::int64_t reconnect_grace_ms = kDefaultReconnectGraceMs
    );

    peer_session_t register_session(
      std::string session_id,
      std::string client_uuid,
      std::string display_name,
      bool is_owner,
      role_e desired_role,
      transport_e transport,
      std::int64_t now_ms
    );

    void disconnect_session(std::string_view session_id, std::int64_t now_ms);
    void notify_owner_kbm_activity(std::int64_t now_ms);

    bool assert_session_allows(std::string_view session_id, capability_e cap, std::int64_t now_ms);
    std::optional<int> remap_gamepad_slot(
      std::string_view session_id,
      int incoming_controller,
      std::int64_t now_ms
    );
    std::optional<std::string> owner_session_for_slot(int gamepad_slot, std::int64_t now_ms);

    bool set_session_role(std::string_view session_id, role_e new_role, std::int64_t now_ms);
    bool set_session_paused(std::string_view session_id, bool paused);
    bool kick_session(std::string_view session_id);
    bool is_secondary_coop_session(std::string_view session_id);
    std::vector<peer_session_t> snapshot_sessions(std::int64_t now_ms);
    void clear();

  private:
    void prune_expired_locked(std::int64_t now_ms);
    bool is_slot_in_use_locked(int slot, std::string_view except_session_id, std::string_view except_uuid) const;
    int allocate_guest_slot_locked(std::string_view session_id, std::string_view client_uuid) const;
    peer_session_t *find_by_session_locked(std::string_view session_id);

    std::int64_t kbm_handoff_ms_;
    std::int64_t reconnect_grace_ms_;
    std::int64_t last_owner_kbm_ms_ = -1000000;
    std::int64_t last_guest_kbm_ms_ = -1000000;
    std::string active_kbm_session_;
    mutable std::mutex mutex_;
    std::vector<peer_session_t> sessions_;
  };

  std::int64_t now_steady_ms();
  Coordinator &coordinator();
}  // namespace couch_coop
