/**
 * @file cloud_agent.cpp
 * @brief Cloud Agent implementation — public IP detection + Supabase heartbeat.
 */

#include "cloud_agent.h"

#include <atomic>
#include <algorithm>
#include <chrono>
#include <condition_variable>
#include <curl/curl.h>
#include <mutex>
#include <nlohmann/json.hpp>
#include <thread>

#include "httpcommon.h"
#include "logging.h"

using namespace std::literals;

namespace cloud {

  // ─── Internal state ─────────────────────────────────────────────────────────

  static std::atomic<bool> s_running{false};
  static std::thread s_heartbeat_thread;
  static std::mutex s_mutex;
  static std::condition_variable s_cv;
  static std::atomic<bool> s_stop_requested{false};
  static ServerIdentity s_last_identity;  // cached for restart_heartbeat

  // ─── CURL helpers ───────────────────────────────────────────────────────────

  static size_t write_to_string(void *contents, size_t size, size_t nmemb, void *userp) {
    auto *str = static_cast<std::string *>(userp);
    str->append(static_cast<char *>(contents), size * nmemb);
    return size * nmemb;
  }

  static int base64_value(char c) {
    if (c >= 'A' && c <= 'Z') return c - 'A';
    if (c >= 'a' && c <= 'z') return c - 'a' + 26;
    if (c >= '0' && c <= '9') return c - '0' + 52;
    if (c == '+') return 62;
    if (c == '/') return 63;
    return -1;
  }

  static std::string base64url_decode(std::string input) {
    std::replace(input.begin(), input.end(), '-', '+');
    std::replace(input.begin(), input.end(), '_', '/');

    std::string output;
    int value = 0;
    int value_bits = -8;
    for (char c : input) {
      if (c == '=') break;
      const int decoded = base64_value(c);
      if (decoded < 0) continue;

      value = (value << 6) + decoded;
      value_bits += 6;
      if (value_bits >= 0) {
        output.push_back(static_cast<char>((value >> value_bits) & 0xFF));
        value_bits -= 8;
      }
    }
    return output;
  }

  static std::string jwt_subject(const std::string &jwt) {
    const auto first_dot = jwt.find('.');
    if (first_dot == std::string::npos) {
      return "";
    }

    const auto second_dot = jwt.find('.', first_dot + 1);
    if (second_dot == std::string::npos || second_dot <= first_dot + 1) {
      return "";
    }

    const auto claims_json = base64url_decode(jwt.substr(first_dot + 1, second_dot - first_dot - 1));
    const auto claims = nlohmann::json::parse(claims_json, nullptr, false);
    if (claims.is_discarded() || !claims.contains("sub") || !claims["sub"].is_string()) {
      return "";
    }

    return claims["sub"].get<std::string>();
  }

  static std::string truncate_for_log(const std::string &value, size_t max_len = 500) {
    if (value.size() <= max_len) {
      return value;
    }
    return value.substr(0, max_len) + "...";
  }

  /**
   * Simple HTTP GET that returns the response body as a string.
   * Returns empty string on failure.
   */
  static std::string http_get(const std::string &url, int timeout_s = 5) {
    CURL *curl = curl_easy_init();
    if (!curl) return "";

    std::string response;
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_to_string);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, static_cast<long>(timeout_s));
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/CloudAgent");
    http::configure_curl_tls(curl);

    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
      return "";
    }

    // Trim whitespace/newlines from response
    while (!response.empty() && (response.back() == '\n' || response.back() == '\r' || response.back() == ' ')) {
      response.pop_back();
    }
    return response;
  }

  /**
   * HTTP POST with JSON body and auth headers.
   * Returns HTTP status code (0 on connection failure).
   */
  static long http_post_json(
    const std::string &url,
    const std::string &json_body,
    const std::string &api_key,
    const std::string &bearer_token
  ) {
    CURL *curl = curl_easy_init();
    if (!curl) return 0;

    std::string response;
    struct curl_slist *headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Prefer: resolution=merge-duplicates");

    std::string apikey_header = "apikey: " + api_key;
    headers = curl_slist_append(headers, apikey_header.c_str());

    std::string auth_header = "Authorization: Bearer " + bearer_token;
    headers = curl_slist_append(headers, auth_header.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_body.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_to_string);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/CloudAgent");
    http::configure_curl_tls(curl);

    CURLcode res = curl_easy_perform(curl);

    long http_code = 0;
    if (res == CURLE_OK) {
      curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    }

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
      BOOST_LOG(warning) << "CloudAgent POST failed: " << curl_easy_strerror(res);
      return 0;
    }

    if (http_code >= 400) {
      BOOST_LOG(warning) << "CloudAgent POST rejected (HTTP " << http_code << "): " << truncate_for_log(response);
    }

    return http_code;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  std::string detect_public_ip() {
    // Try multiple services for redundancy
    static const std::vector<std::string> services = {
      "https://api.ipify.org",
      "https://ifconfig.me/ip",
      "https://icanhazip.com",
    };

    for (const auto &svc : services) {
      auto ip = http_get(svc, 5);
      if (!ip.empty() && ip.size() < 46) {  // max IPv6 length
        BOOST_LOG(info) << "CloudAgent: detected public IP via " << svc << " → " << ip;
        return ip;
      }
    }

    BOOST_LOG(warning) << "CloudAgent: could not detect public IP (all services failed)";
    return "";
  }

  bool push_identity(const CloudConfig &config, const ServerIdentity &identity) {
    if (!config.is_configured()) {
      return false;
    }

    const auto user_id = jwt_subject(config.user_jwt);
    if (user_id.empty()) {
      BOOST_LOG(warning) << "CloudAgent: unable to read user_id from Supabase JWT; identity push skipped";
      return false;
    }

    // Build JSON payload using nlohmann::json for safe serialization
    // (prevents injection via server_name or other user-controlled fields)
    // Table: user_server_profiles
    // Conflict: (user_id, server_url) — handled by RLS + Supabase upsert

    // ISO 8601 UTC timestamp for last_seen_at
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm {};
#ifdef _WIN32
    gmtime_s(&tm, &tt);
#else
    gmtime_r(&tt, &tm);
#endif
    char time_buf[32];
    std::strftime(time_buf, sizeof(time_buf), "%Y-%m-%dT%H:%M:%SZ", &tm);

    nlohmann::json payload;
    payload["user_id"] = user_id;
    payload["server_url"] = identity.server_url;
    payload["server_name"] = identity.server_name;
    payload["local_addresses"] = identity.local_addresses;
    payload["external_address"] = identity.external_address;
    payload["nat_type"] = identity.nat_type;
    payload["cert_fingerprint"] = identity.cert_fingerprint;
    payload["last_seen_at"] = std::string(time_buf);
    payload["server_version"] = identity.server_version;
    payload["is_streaming"] = identity.is_streaming;
    // Push the real Sunshine server uniqueid so client apps can match polled
    // servers (which get UUID from /serverinfo XML) with synced cloud profiles.
    if (!identity.server_uuid.empty()) {
      payload["server_uuid"] = identity.server_uuid;
    }

    std::string json = payload.dump();

    std::string url = config.supabase_url + "/rest/v1/user_server_profiles?on_conflict=user_id,server_url";

    long code = http_post_json(url, json, config.supabase_key, config.user_jwt);

    if (code >= 200 && code < 300) {
      BOOST_LOG(debug) << "CloudAgent: identity pushed successfully (HTTP " << code << ")";
      return true;
    } else {
      BOOST_LOG(warning) << "CloudAgent: identity push failed (HTTP " << code << ")";
      return false;
    }
  }

  void start_heartbeat(const CloudConfig &config, const ServerIdentity &base_identity) {
    std::lock_guard<std::mutex> lock(s_mutex);

    if (s_running.load()) {
      return;  // Already running
    }

    if (!config.is_configured()) {
      BOOST_LOG(info) << "CloudAgent: not configured, skipping heartbeat";
      return;
    }

    s_stop_requested.store(false);
    s_running.store(true);
    s_last_identity = base_identity;  // cache for restart_heartbeat

    s_heartbeat_thread = std::thread([config, base_identity]() {
      BOOST_LOG(info) << "CloudAgent: heartbeat started (interval=" << config.heartbeat_interval_s << "s)";

      while (!s_stop_requested.load()) {
        // Detect current public IP
        auto identity = base_identity;
        auto public_ip = detect_public_ip();
        if (!public_ip.empty()) {
          // Append port from server_url
          // server_url is like "https://192.168.1.100:47990"
          // external_address should be "73.42.15.200:47990"
          std::string port = "47990";  // default
          auto colon_pos = identity.server_url.rfind(':');
          if (colon_pos != std::string::npos && colon_pos > 5) {
            port = identity.server_url.substr(colon_pos + 1);
          }
          identity.external_address = public_ip + ":" + port;
        }

        // Push to cloud
        push_identity(config, identity);

        // Sleep with interruptible wait
        {
          std::unique_lock<std::mutex> lk(s_mutex);
          s_cv.wait_for(lk, std::chrono::seconds(config.heartbeat_interval_s), []() {
            return s_stop_requested.load();
          });
        }
      }

      BOOST_LOG(info) << "CloudAgent: heartbeat stopped";
      s_running.store(false);
    });

    s_heartbeat_thread.detach();
  }

  void stop_heartbeat() {
    s_stop_requested.store(true);
    s_cv.notify_all();
  }

  void restart_heartbeat(const CloudConfig &new_config) {
    // If identity was never cached the heartbeat was never started — nothing to restart.
    if (s_last_identity.server_url.empty()) {
      BOOST_LOG(info) << "CloudAgent: restart_heartbeat called but no identity cached; ignoring.";
      return;
    }

    // Signal running thread (if any) to stop.
    s_stop_requested.store(true);
    s_cv.notify_all();

    if (!new_config.is_configured()) {
      BOOST_LOG(info) << "CloudAgent: cloud config cleared; heartbeat stopped.";
      return;
    }

    // Snapshot identity (protected by s_mutex to avoid racing with start_heartbeat).
    ServerIdentity identity;
    {
      std::lock_guard<std::mutex> lk(s_mutex);
      identity = s_last_identity;
    }

    // Fire-and-forget: wait for old thread to exit, then start with fresh config.
    std::thread([new_config, identity]() {
      for (int i = 0; i < 20 && s_running.load(); ++i) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
      }
      s_stop_requested.store(false);
      start_heartbeat(new_config, identity);
      BOOST_LOG(info) << "CloudAgent: heartbeat restarted with refreshed config.";
    }).detach();
  }

  bool is_running() {
    return s_running.load();
  }

}  // namespace cloud
