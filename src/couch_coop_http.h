/**
 * @file src/couch_coop_http.h
 * @brief Shared JSON serialization and control command execution for Co-Op sessions
 *        used by both confighttp (Admin API) and nvhttp (paired Client mTLS API).
 */
#pragma once

#include <algorithm>
#include <optional>
#include <string>

#include <nlohmann/json.hpp>

#include "couch_coop.h"
#include "stream.h"

namespace couch_coop_http {

  inline nlohmann::json serialize_session(const couch_coop::peer_session_t &s, std::int64_t now_ms) {
    nlohmann::json item;
    item["session_id"] = s.session_id;
    item["client_uuid"] = s.client_uuid;
    item["display_name"] = s.display_name;
    item["role"] = std::string(couch_coop::to_string(s.role));
    item["transport"] = std::string(couch_coop::to_string(s.transport));
    item["assigned_slot"] = s.assigned_slot;
    item["is_owner"] = (s.role == couch_coop::role_e::owner);
    item["paused"] = s.paused;
    item["connected"] = s.connected;
    if (!s.connected && s.disconnected_at_ms > 0) {
      const auto elapsed = std::max<std::int64_t>(0, now_ms - s.disconnected_at_ms);
      item["grace_remaining_ms"] =
        std::max<std::int64_t>(0, couch_coop::kDefaultReconnectGraceMs - elapsed);
    } else {
      item["grace_remaining_ms"] = 0;
    }
    return item;
  }

  inline nlohmann::json serialize_sessions_payload() {
    const auto now_ms = couch_coop::now_steady_ms();
    const auto sessions = couch_coop::coordinator().snapshot_sessions(now_ms);
    nlohmann::json arr = nlohmann::json::array();
    for (const auto &s : sessions) {
      arr.push_back(serialize_session(s, now_ms));
    }
    nlohmann::json out;
    out["status"] = true;
    out["sessions"] = std::move(arr);
    return out;
  }

  struct control_result_t {
    int http_status = 200;
    nlohmann::json payload;
  };

  inline control_result_t apply_control(
    const std::string &session_id,
    const nlohmann::json &body,
    bool allow_modify_owner
  ) {
    const auto now_ms = couch_coop::now_steady_ms();
    const auto sessions = couch_coop::coordinator().snapshot_sessions(now_ms);
    bool found = false;
    bool target_is_owner = false;
    for (const auto &s : sessions) {
      if (s.session_id == session_id) {
        found = true;
        target_is_owner = (s.role == couch_coop::role_e::owner);
        break;
      }
    }

    if (target_is_owner && !allow_modify_owner) {
      return {403, {{"status", false}, {"error", "Forbidden: cannot alter owner session"}}};
    }

    if (body.value("kick", false)) {
      const bool kicked = stream::kick_coop_session(session_id);
      if (!found && !kicked) {
        return {400, {{"status", false}, {"error", "Session not found"}}};
      }
      nlohmann::json out = serialize_sessions_payload();
      out["session_id"] = session_id;
      out["kicked"] = kicked;
      return {200, std::move(out)};
    }

    if (!found) {
      return {400, {{"status", false}, {"error", "Session not found"}}};
    }

    if (body.contains("role")) {
      if (!body["role"].is_string()) {
        return {400, {{"status", false}, {"error", "role must be a string"}}};
      }
      const auto role_str = body["role"].get<std::string>();
      const auto parsed = couch_coop::parse_role(role_str);
      if (!parsed || *parsed == couch_coop::role_e::owner) {
        return {400, {{"status", false}, {"error", "role must be viewer, coop_pad, or coop_kbm"}}};
      }
      if (!couch_coop::coordinator().set_session_role(session_id, *parsed, now_ms)) {
        return {400, {{"status", false}, {"error", "Cannot update role for session"}}};
      }
    }

    if (body.contains("paused")) {
      if (!body["paused"].is_boolean()) {
        return {400, {{"status", false}, {"error", "paused must be a boolean"}}};
      }
      if (!couch_coop::coordinator().set_session_paused(session_id, body["paused"].get<bool>())) {
        return {400, {{"status", false}, {"error", "Cannot update paused state"}}};
      }
    }

    nlohmann::json out = serialize_sessions_payload();
    out["session_id"] = session_id;
    return {200, std::move(out)};
  }

}  // namespace couch_coop_http
