/**
 * @file src/cloud_web_auth.h
 * @brief JUJO.CLOUD (Supabase + TOTP) trust for the browser client.
 *
 * A browser proves "JUJO.CLOUD account with TOTP (aal2), paired with this server" once;
 * the server then remembers that device with an HttpOnly cookie. WebRTC sessions and
 * WAN password logins require that trust.
 */
#pragma once

#include <chrono>
#include <mutex>
#include <optional>
#include <string>
#include <string_view>
#include <unordered_map>

namespace cloud_web_auth {
  inline constexpr std::string_view cookie_name {"__Host-jujo_cloud"};
  inline constexpr std::chrono::hours kTrustTtl {24 * 30};

  /// Claim from a JWT payload WITHOUT verifying the signature; only use after the provider accepted the token.
  std::optional<std::string> jwt_claim(std::string_view jwt, std::string_view claim);

  struct trust_t {
    std::string user_id;
    std::string email;
    std::chrono::system_clock::time_point expires;
  };

  class TrustStore {
  public:
    explicit TrustStore(std::string path = {});
    /// Returns the raw cookie token; only its SHA-256 is kept (and persisted).
    std::string issue(const std::string &user_id, const std::string &email, std::chrono::system_clock::time_point now = std::chrono::system_clock::now());
    std::optional<trust_t> lookup(std::string_view token, std::chrono::system_clock::time_point now = std::chrono::system_clock::now());
    void revoke(std::string_view token);

  private:
    void load();
    void save() const;

    std::string _path;
    std::mutex _mutex;
    std::unordered_map<std::string, trust_t> _entries;  // sha256(token) hex -> trust
    bool _loaded = false;
  };

  TrustStore &store();

  /// Set-Cookie value issuing/clearing the trust cookie.
  std::string set_cookie(std::string_view token);
  std::string clear_cookie();
}  // namespace cloud_web_auth
