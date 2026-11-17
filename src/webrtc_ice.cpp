/**
 * @file src/webrtc_ice.cpp
 * @brief STUN/TURN server list for WebRTC peers.
 */
#include "webrtc_ice.h"

#include <boost/algorithm/string.hpp>
#include <openssl/evp.h>

#include "config.h"
#include "network.h"

namespace webrtc_ice {
  namespace {
    std::vector<std::string> split_urls(const std::string &csv) {
      std::vector<std::string> out;
      boost::split(out, csv, boost::is_any_of(","));
      for (auto &url : out) {
        boost::trim(url);
      }
      std::erase_if(out, [](const std::string &url) {
        return url.empty();
      });
      return out;
    }
  }  // namespace

  std::string turn_rest_credential(std::string_view secret, std::string_view username) {
    unsigned char mac[EVP_MAX_MD_SIZE];
    size_t mac_len = 0;
    if (!EVP_Q_mac(nullptr, "HMAC", nullptr, "SHA1", nullptr, secret.data(), secret.size(), reinterpret_cast<const unsigned char *>(username.data()), username.size(), mac, sizeof(mac), &mac_len)) {
      return {};
    }
    std::string b64(4 * ((mac_len + 2) / 3), '\0');
    const int written = EVP_EncodeBlock(reinterpret_cast<unsigned char *>(b64.data()), mac, static_cast<int>(mac_len));
    b64.resize(written > 0 ? written : 0);
    return b64;
  }

  std::vector<server_t> servers(std::chrono::system_clock::time_point now) {
    const auto &cfg = config::nvhttp;
    std::vector<server_t> list;
    for (auto &uri : split_urls(cfg.webrtc_stun_urls)) {
      list.push_back({std::move(uri), {}, {}});
    }

    // TURN without a secret would be an open relay request that coturn rejects; skip it.
    if (cfg.webrtc_turn_secret.empty()) {
      return list;
    }
    const auto expiry = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() + cfg.webrtc_turn_ttl_seconds;
    // Opaque label: the relay learns an expiry, not who is streaming.
    const auto username = std::to_string(expiry) + ":jujo";
    const auto password = turn_rest_credential(cfg.webrtc_turn_secret, username);
    if (password.empty()) {
      return list;
    }
    for (auto &uri : split_urls(cfg.webrtc_turn_urls)) {
      list.push_back({std::move(uri), username, password});
    }
    return list;
  }

  port_range_t port_range() {
    if (!config::nvhttp.webrtc_wan_access) {
      return {};
    }
    const auto min = net::map_port(kPortOffset);
    return {min, static_cast<std::uint16_t>(min + kPortCount - 1)};
  }

  std::optional<std::string> public_candidate(std::string_view candidate, std::string_view public_ip, port_range_t range) {
    // candidate:<foundation> <component> <proto> <priority> <ip> <port> typ host [extensions...]
    std::vector<std::string> tok;
    boost::split(tok, candidate, boost::is_any_of(" "), boost::token_compress_on);
    if (public_ip.empty() || range.min == 0 || tok.size() < 8 || tok[6] != "typ" || tok[7] != "host" ||
        tok[4].find('.') == std::string::npos || tok[4] == public_ip) {
      return std::nullopt;
    }
    unsigned long port = 0;
    unsigned long priority = 0;
    try {
      port = std::stoul(tok[5]);
      priority = std::stoul(tok[3]);
    } catch (...) {
      return std::nullopt;
    }
    if (port < range.min || port > range.max) {
      return std::nullopt;
    }
    // RFC 8445 type preference host 126 -> srflx 100; foundation must differ from the host one.
    constexpr unsigned long kTypePrefDelta = 26ul << 24;
    std::string out = tok[0].substr(0, tok[0].find(':') + 1) + "p" + tok[0].substr(tok[0].find(':') + 1);
    out += ' ' + tok[1] + ' ' + tok[2] + ' ' + std::to_string(priority > kTypePrefDelta ? priority - kTypePrefDelta : priority);
    out += ' ' + std::string {public_ip} + ' ' + tok[5] + " typ srflx raddr " + tok[4] + " rport " + tok[5];
    for (std::size_t i = 8; i < tok.size(); ++i) {
      out += ' ' + tok[i];
    }
    return out;
  }

  nlohmann::json to_json(const std::vector<server_t> &list) {
    auto out = nlohmann::json::array();
    for (const auto &s : list) {
      nlohmann::json entry {{"urls", s.uri}};
      if (!s.username.empty()) {
        entry["username"] = s.username;
        entry["credential"] = s.password;
      }
      out.push_back(std::move(entry));
    }
    return out;
  }
}  // namespace webrtc_ice
