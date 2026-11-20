/**
 * @file src/webrtc_ice.h
 * @brief STUN/TURN server list for WebRTC peers, with TURN REST (coturn static-auth-secret) credentials.
 */
#pragma once

#include <chrono>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

#include <nlohmann/json.hpp>

namespace webrtc_ice {
  struct server_t {
    std::string uri;
    std::string username;
    std::string password;
  };

  /// base64(HMAC-SHA1(secret, username)) — coturn `use-auth-secret` scheme.
  std::string turn_rest_credential(std::string_view secret, std::string_view username);

  /// Configured STUN + TURN servers; TURN entries carry fresh time-limited credentials.
  std::vector<server_t> servers(std::chrono::system_clock::time_point now = std::chrono::system_clock::now());

  /// RTCIceServer[] JSON for the browser.
  nlohmann::json to_json(const std::vector<server_t> &list);

  // Fixed ICE ports (base+34..+37; TurboInput owns +32/+33) so UPnP can forward them like the
  // native stream ports. Four ports = four concurrent browser sessions.
  constexpr int kPortOffset = 34;
  constexpr int kPortCount = 4;

  struct port_range_t {
    std::uint16_t min = 0;
    std::uint16_t max = 0;
  };

  /// Fixed range when `webrtc_wan_access` is on, else {0,0} (OS ephemeral ports).
  port_range_t port_range();

  /// For a host candidate bound inside `range`, the same candidate announced at `public_ip`
  /// (srflx, raddr = LAN address) — what the router's UPnP forward makes reachable.
  std::optional<std::string> public_candidate(std::string_view candidate, std::string_view public_ip, port_range_t range);
}  // namespace webrtc_ice
