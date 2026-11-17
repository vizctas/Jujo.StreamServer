/**
 * @file src/cloud_web_auth.cpp
 * @brief JUJO.CLOUD trust for the browser client.
 */
#include "cloud_web_auth.h"

#include <algorithm>
#include <format>

#include <nlohmann/json.hpp>
#include <openssl/evp.h>

#include "crypto.h"
#include "file_handler.h"
#include "logging.h"
#include "platform/common.h"
#include "utility.h"

namespace cloud_web_auth {
  namespace {
    std::string token_hash(std::string_view token) {
      return util::hex_vec(crypto::hash(token));
    }

    std::optional<std::string> base64url_decode(std::string in) {
      std::ranges::replace(in, '-', '+');
      std::ranges::replace(in, '_', '/');
      while (in.size() % 4) {
        in += '=';
      }
      std::string out(in.size() / 4 * 3, '\0');
      const int n = EVP_DecodeBlock(reinterpret_cast<unsigned char *>(out.data()), reinterpret_cast<const unsigned char *>(in.data()), static_cast<int>(in.size()));
      if (n < 0) {
        return std::nullopt;
      }
      out.resize(n - std::ranges::count(in, '='));
      return out;
    }

    std::int64_t to_epoch(std::chrono::system_clock::time_point t) {
      return std::chrono::duration_cast<std::chrono::seconds>(t.time_since_epoch()).count();
    }
  }  // namespace

  std::optional<std::string> jwt_claim(std::string_view jwt, std::string_view claim) {
    const auto first = jwt.find('.');
    const auto second = first == std::string_view::npos ? first : jwt.find('.', first + 1);
    if (second == std::string_view::npos) {
      return std::nullopt;
    }
    auto payload = base64url_decode(std::string {jwt.substr(first + 1, second - first - 1)});
    if (!payload) {
      return std::nullopt;
    }
    try {
      const auto json = nlohmann::json::parse(*payload);
      if (auto it = json.find(claim); it != json.end() && it->is_string()) {
        return it->get<std::string>();
      }
    } catch (const nlohmann::json::exception &) {
    }
    return std::nullopt;
  }

  TrustStore::TrustStore(std::string path):
      _path(std::move(path)) {}

  void TrustStore::load() {
    if (_loaded) {
      return;
    }
    _loaded = true;
    if (_path.empty()) {
      return;
    }
    try {
      const auto json = nlohmann::json::parse(file_handler::read_file(_path.c_str()));
      for (const auto &[hash, v] : json.items()) {
        _entries[hash] = {v.at("user_id"), v.value("email", ""), std::chrono::system_clock::time_point {std::chrono::seconds {v.at("expires").get<std::int64_t>()}}};
      }
    } catch (const std::exception &) {
      // Missing/corrupt file: every device simply signs in again.
    }
  }

  void TrustStore::save() const {
    if (_path.empty()) {
      return;
    }
    nlohmann::json json = nlohmann::json::object();
    for (const auto &[hash, t] : _entries) {
      json[hash] = {{"user_id", t.user_id}, {"email", t.email}, {"expires", to_epoch(t.expires)}};
    }
    if (file_handler::write_file(_path.c_str(), json.dump())) {
      BOOST_LOG(warning) << "CloudWebAuth: could not persist trusted devices";
    }
  }

  std::string TrustStore::issue(const std::string &user_id, const std::string &email, std::chrono::system_clock::time_point now) {
    // Alphanumeric only: the cookie value is percent-unescaped on read.
    auto token = crypto::rand_alphabet(43, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
    std::lock_guard lock(_mutex);
    load();
    std::erase_if(_entries, [&](const auto &kv) {
      return kv.second.expires <= now;
    });
    _entries[token_hash(token)] = {user_id, email, now + kTrustTtl};
    save();
    return token;
  }

  std::optional<trust_t> TrustStore::lookup(std::string_view token, std::chrono::system_clock::time_point now) {
    if (token.empty()) {
      return std::nullopt;
    }
    std::lock_guard lock(_mutex);
    load();
    auto it = _entries.find(token_hash(token));
    if (it == _entries.end() || it->second.expires <= now) {
      return std::nullopt;
    }
    return it->second;
  }

  void TrustStore::revoke(std::string_view token) {
    std::lock_guard lock(_mutex);
    load();
    if (_entries.erase(token_hash(token))) {
      save();
    }
  }

  TrustStore &store() {
    static TrustStore instance {platf::appdata().string() + "/webrtc_cloud_trust.json"};
    return instance;
  }

  std::string set_cookie(std::string_view token) {
    return std::format("{}={}; Path=/; HttpOnly; SameSite=Strict; Secure; Priority=High; Max-Age={}", cookie_name, token, std::chrono::duration_cast<std::chrono::seconds>(kTrustTtl).count());
  }

  std::string clear_cookie() {
    return std::format("{}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0", cookie_name);
  }
}  // namespace cloud_web_auth
