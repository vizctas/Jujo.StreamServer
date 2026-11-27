
#include <algorithm>
#include <array>
#include <boost/regex.hpp>
#include <cctype>
#include <chrono>
#include <ctime>
#include <filesystem>
#include <cstdint>
#include <format>
#include <fstream>
#include <future>
#include <iomanip>
#include <mutex>
#include <numeric>
#include <optional>
#include <set>
#include <sstream>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <boost/algorithm/string.hpp>
#include <boost/asio.hpp>
#include <boost/asio/ssl/context.hpp>
#include <boost/filesystem.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <nlohmann/json.hpp>
#include <Simple-Web-Server/crypto.hpp>
#include <Simple-Web-Server/server_https.hpp>
#include "cloud_agent.h"
#include "cloud_web_auth.h"
#include "config.h"
#include "confighttp.h"
#include "confighttp_internal.h"
#include "crypto.h"
#include "file_handler.h"
#include "globals.h"
#include "http_auth.h"
#include "httpcommon.h"
#include "platform/common.h"
#include "logging.h"
#include "network.h"
#include "system_metrics.h"
#include "nvhttp.h"
#include "watchword.h"
#include "rtsp.h"
#include "server_rbac.h"
#include "stream.h"
#include "video.h"
#include "webrtc_stream.h"
#include "display_helper_integration.h"
#include "process.h"
#include "state_storage.h"
#include "utility.h"
#include "update.h"
#include "uuid.h"
#include "version_compare.h"


namespace confighttp {
  using enum SimpleWeb::StatusCode;

  namespace {

    std::string url_escape(const std::string &value) {
      std::string out;
      if (CURL *esc = curl_easy_init()) {
        if (char *raw = curl_easy_escape(esc, value.c_str(), static_cast<int>(value.size()))) {
          out = raw;
          curl_free(raw);
        }
        curl_easy_cleanup(esc);
      }
      return out;
    }

    std::string current_utc_iso8601() {
      const auto now_tp = std::chrono::system_clock::now();
      const auto now_t = std::chrono::system_clock::to_time_t(now_tp);
      std::tm utc_tm {};
#ifdef _WIN32
      gmtime_s(&utc_tm, &now_t);
#else
      gmtime_r(&now_t, &utc_tm);
#endif
      std::ostringstream oss;
      oss << std::put_time(&utc_tm, "%Y-%m-%dT%H:%M:%SZ");
      return oss.str();
    }

    std::optional<nlohmann::json> supabase_rest_get_json(const std::string &url, const std::string &bearer_token) {
      CURL *curl = curl_easy_init();
      if (!curl) {
        return std::nullopt;
      }

      std::string body;
      struct curl_slist *headers = nullptr;
      headers = curl_slist_append(headers, ("apikey: " + config::cloud.supabase_key).c_str());
      headers = curl_slist_append(headers, ("Authorization: Bearer " + bearer_token).c_str());

      http::configure_curl_tls(curl);
      curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
      curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
      curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
      curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
      curl_easy_setopt(curl, CURLOPT_WRITEDATA, &body);

      const auto res = curl_easy_perform(curl);
      long code = 0;
      curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
      curl_slist_free_all(headers);
      curl_easy_cleanup(curl);

      if (res != CURLE_OK || code != 200) {
        return std::nullopt;
      }
      try {
        return nlohmann::json::parse(body);
      } catch (...) {
        return std::nullopt;
      }
    }

    /// True when Supabase accepts email+password for the JUJO.CLOUD account (tokens discarded).
    bool supabase_password_ok(const std::string &email, const std::string &password) {
      CURL *curl = curl_easy_init();
      if (!curl) {
        return false;
      }
      const auto url = config::cloud.supabase_url + "/auth/v1/token?grant_type=password";
      const auto payload = nlohmann::json {{"email", email}, {"password", password}}.dump();
      std::string body;
      struct curl_slist *headers = nullptr;
      headers = curl_slist_append(headers, ("apikey: " + config::cloud.supabase_key).c_str());
      headers = curl_slist_append(headers, "Content-Type: application/json");

      http::configure_curl_tls(curl);
      curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
      curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
      curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
      curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
      curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
      curl_easy_setopt(curl, CURLOPT_WRITEDATA, &body);

      const auto res = curl_easy_perform(curl);
      long code = 0;
      curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
      curl_slist_free_all(headers);
      curl_easy_cleanup(curl);
      return res == CURLE_OK && code == 200;
    }

    void write_json(resp_https_t response, SimpleWeb::StatusCode code, const nlohmann::json &body, SimpleWeb::CaseInsensitiveMultimap headers = {}) {
      headers.emplace("Content-Type", "application/json");
      response->write(code, body.dump(), headers);
    }

    std::string user_agent_of(const req_https_t &request) {
      auto ua = request->header.find("user-agent");
      return ua != request->header.end() ? ua->second : std::string {};
    }

    std::string cloud_owner_id() {
      const auto owner_payload = jwt_payload_json(config::cloud.user_token);
      return owner_payload ? json_string_value(*owner_payload, "sub") : std::string {};
    }

    /// Active server_members row or live Co-Op invite of a non-owner user, read with that user's token (RLS).
    CloudPairAuthDecision cloud_member_access(const std::string &owner_id, const std::string &user_id, const std::string &token) {
      const auto server_url = cloud::registered_server_url();
      if (server_url.empty()) {
        return {};
      }
      const auto escaped_url = url_escape(server_url);
      const auto members_url = config::cloud.supabase_url +
        "/rest/v1/server_members?select=id,role,permissions&owner_id=eq." + owner_id +
        "&member_id=eq." + user_id + "&server_url=eq." + escaped_url + "&status=eq.active&limit=1";
      const auto coop_url = config::cloud.supabase_url +
        "/rest/v1/coop_session_invites?select=id,role,expires_at&owner_id=eq." + owner_id +
        "&member_id=eq." + user_id + "&server_url=eq." + escaped_url +
        "&status=eq.active&expires_at=gt." + url_escape(current_utc_iso8601()) + "&order=expires_at.desc&limit=1";
      return resolve_cloud_pair_access(supabase_rest_get_json(members_url, token), supabase_rest_get_json(coop_url, token));
    }
  }  // namespace

  void cloudLogin(resp_https_t response, req_https_t request) {
    print_req(request);
    const auto address = client_address(request);
    if (login_throttle.blocked(address)) {
      write_json(response, SimpleWeb::StatusCode::client_error_too_many_requests, {{"status", false}, {"error", "too_many_attempts"}});
      return;
    }
    if (!config::cloud.is_configured()) {
      write_json(response, SimpleWeb::StatusCode::client_error_forbidden, {{"status", false}, {"error", "server_not_registered"}});
      return;
    }

    std::string token;
    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      token = nlohmann::json::parse(ss.str()).at("access_token").get<std::string>();
    } catch (const std::exception &) {
      bad_request(response, request, "access_token required");
      return;
    }

    // aal is read before verification but only trusted once Supabase accepts the token below.
    if (cloud_web_auth::jwt_claim(token, "aal") != "aal2") {
      write_json(response, SimpleWeb::StatusCode::client_error_forbidden, {{"status", false}, {"error", "totp_required"}});
      return;
    }
    auto verified = check_cloud_jwt_auth(token);  // Supabase signature/expiry + paired in RBAC
    const auto email = cloud_web_auth::jwt_claim(token, "email").value_or("");
    if (!verified.ok && verified.code == SimpleWeb::StatusCode::client_error_forbidden) {
      // Supabase accepted the token but no device of this user paired natively: a member or
      // Co-Op guest may still enter from the browser. The cloud agent re-checks every heartbeat.
      const auto user_id = cloud_web_auth::jwt_claim(token, "sub").value_or("");
      const auto owner_id = cloud_owner_id();
      if (!user_id.empty() && !owner_id.empty() && user_id != owner_id) {
        if (const auto access = cloud_member_access(owner_id, user_id, token); access.allowed) {
          // Not promotable: an empty registry or auto-trust must never turn a browser guest into admin.
          rbac::registry.register_client(user_id, access.pair_role, email, false, rbac::Grant {access.perms, access.coop_role});
          verified = {true, SimpleWeb::StatusCode::success_ok, {}, {}};
          verified.auth_source = AuthSource::cloud_jwt;
          verified.user_id = user_id;
        }
      }
    }
    if (!verified.ok) {
      login_throttle.record(address, false);
      write_json(response, verified.code, {{"status", false}, {"error", verified.code == SimpleWeb::StatusCode::client_error_forbidden ? "not_paired" : "invalid_cloud_token"}});
      return;
    }
    login_throttle.record(address, true);

    const auto trust_token = cloud_web_auth::store().issue(verified.user_id, email);
    BOOST_LOG(info) << "Web UI: ["sv << address << "] JUJO.CLOUD device trust issued";

    // Guests never get a server session: the trust cookie alone carries their RBAC role (cloud_guest_user).
    if (!rbac::registry.authorize(verified.user_id, rbac::Role::admin)) {
      write_json(response, SimpleWeb::StatusCode::success_ok, {{"status", true}, {"server_password_required", false}, {"guest", true}}, {{"Set-Cookie", cloud_web_auth::set_cookie(trust_token)}});
      return;
    }
    // A password-less session is a full admin session, so only the owner's choice may skip the password.
    if (config::nvhttp.webrtc_require_server_password) {
      write_json(response, SimpleWeb::StatusCode::success_ok, {{"status", true}, {"server_password_required", true}}, {{"Set-Cookie", cloud_web_auth::set_cookie(trust_token)}});
      return;
    }
    // Server password step disabled by the owner: the cloud proof alone opens a session.
    auto api_response = session_token_api.issue_login(config::sunshine.username, "/", true, user_agent_of(request), address);
    api_response.headers.emplace("Set-Cookie", cloud_web_auth::set_cookie(trust_token));
    write_api_response(response, api_response);
  }

  void cloudLogout(resp_https_t response, req_https_t request) {
    print_req(request);
    cloud_web_auth::store().revoke(extract_cookie_value(request->header, cloud_web_auth::cookie_name));
    write_json(response, SimpleWeb::StatusCode::success_ok, {{"status", true}}, {{"Set-Cookie", cloud_web_auth::clear_cookie()}});
  }

  void webrtcSecurity(resp_https_t response, req_https_t request) {
    print_req(request);
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    auto trust = cloud_web_auth::store().lookup(extract_cookie_value(request->header, cloud_web_auth::cookie_name));
    if (!trust || !cloud_trusted_user(request->header)) {
      write_json(response, SimpleWeb::StatusCode::client_error_forbidden, {{"status", false}, {"error", "cloud_login_required"}});
      return;
    }
    if (!rbac::registry.authorize(trust->user_id, rbac::Role::admin)) {
      write_json(response, SimpleWeb::StatusCode::client_error_forbidden, {{"status", false}, {"error", "admin_required"}});
      return;
    }

    bool require = true;
    std::string account_password;
    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      const auto body = nlohmann::json::parse(ss.str());
      require = body.at("require_server_password").get<bool>();
      account_password = body.value("account_password", "");
    } catch (const std::exception &) {
      bad_request(response, request, "require_server_password required");
      return;
    }

    const auto address = client_address(request);
    if (!require) {
      if (login_throttle.blocked(address)) {
        write_json(response, SimpleWeb::StatusCode::client_error_too_many_requests, {{"status", false}, {"error", "too_many_attempts"}});
        return;
      }
      // Lowering security needs the account owner's password, not just a live session.
      const bool ok = !trust->email.empty() && !account_password.empty() && supabase_password_ok(trust->email, account_password);
      login_throttle.record(address, ok);
      if (!ok) {
        write_json(response, SimpleWeb::StatusCode::client_error_unauthorized, {{"status", false}, {"error", "invalid_account_password"}});
        return;
      }
    }

    try {
      auto current = config::parse_config(file_handler::read_file(config::sunshine.config_file.c_str()));
      current["webrtc_require_server_password"] = require ? "enabled" : "disabled";
      std::stringstream out;
      for (const auto &[k, v] : current) {
        out << k << " = " << v << "\n";
      }
      file_handler::write_file(config::sunshine.config_file.c_str(), out.str());
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "WebRTC security: could not persist setting: " << e.what();
      write_json(response, SimpleWeb::StatusCode::server_error_internal_server_error, {{"status", false}, {"error", "persist_failed"}});
      return;
    }
    config::nvhttp.webrtc_require_server_password = require;
    BOOST_LOG(info) << "Web UI: ["sv << address << "] server password step " << (require ? "enabled"sv : "disabled"sv);
    write_json(response, SimpleWeb::StatusCode::success_ok, {{"status", true}, {"server_password_required", require}});
  }


  /**
   * @brief User login endpoint to generate session tokens.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * Expects JSON body:
   * {
   *   "username": "string",
   *   "password": "string"
   * }
   *
   * Returns:
   * {
   *   "status": true,
   *   "token": "session_token_string",
   *   "expires_in": 86400
   * }
   *
   * @api_examples{/api/auth/login| POST| {"username": "admin", "password": "password"}}
   */
  void loginUser(resp_https_t response, req_https_t request) {
    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input_tree = nlohmann::json::parse(ss);
      if (!input_tree.contains("username") || !input_tree.contains("password")) {
        bad_request(response, request, "Missing username or password");
        return;
      }

      std::string username = input_tree["username"].get<std::string>();
      std::string password = input_tree["password"].get<std::string>();
      std::string redirect_url = input_tree.value("redirect", "/");
      bool remember_me = false;
      if (auto it = input_tree.find("remember_me"); it != input_tree.end()) {
        try {
          remember_me = it->get<bool>();
        } catch (const nlohmann::json::exception &) {
          remember_me = false;
        }
      }

      std::string user_agent;
      if (auto ua = request->header.find("user-agent"); ua != request->header.end()) {
        user_agent = ua->second;
      }
      std::string remote_address = client_address(request);

      // From outside the LAN a password is only the second factor: no device trust, no guessing.
      if (net::from_address(remote_address) > http::origin_web_ui_allowed && !cloud_trusted_user(request->header)) {
        write_api_response(response, APIResponse(SimpleWeb::StatusCode::client_error_forbidden, R"({"status":false,"error":"cloud_login_required"})", {{"Content-Type", "application/json"}}));
        return;
      }

      APIResponse api_response = session_token_api.login(username, password, redirect_url, remember_me, user_agent, remote_address);
      write_api_response(response, api_response);

    } catch (const nlohmann::json::exception &e) {
      BOOST_LOG(warning) << "Login JSON error:"sv << e.what();
      bad_request(response, request, "Invalid JSON format");
    }
  }

  void refreshSession(resp_https_t response, req_https_t request) {
    print_req(request);

    std::string refresh_token;
    if (auto auth = request->header.find("authorization");
        auth != request->header.end() && auth->second.rfind("Refresh ", 0) == 0) {
      refresh_token = auth->second.substr(8);
    }
    if (refresh_token.empty()) {
      refresh_token = extract_refresh_token_from_cookie(request->header);
    }

    // Allow JSON body input for API clients that do not rely on cookies/Authorization header
    if (refresh_token.empty()) {
      std::stringstream ss;
      ss << request->content.rdbuf();
      if (!ss.str().empty()) {
        try {
          auto body = nlohmann::json::parse(ss);
          if (auto it = body.find("refresh_token"); it != body.end() && it->is_string()) {
            refresh_token = it->get<std::string>();
          }
        } catch (const nlohmann::json::exception &) {
        }
      }
    }

    std::string user_agent;
    if (auto ua = request->header.find("user-agent"); ua != request->header.end()) {
      user_agent = ua->second;
    }
    std::string remote_address = client_address(request);

    APIResponse api_response = session_token_api.refresh_session(refresh_token, user_agent, remote_address);
    write_api_response(response, api_response);
  }

  /**
   * @brief User logout endpoint to revoke session tokens.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/auth/logout| POST| null}
   */
  void logoutUser(resp_https_t response, req_https_t request) {
    print_req(request);

    std::string session_token;
    if (auto auth = request->header.find("authorization");
        auth != request->header.end() && auth->second.rfind("Session ", 0) == 0) {
      session_token = auth->second.substr(8);
    }
    if (session_token.empty()) {
      session_token = extract_session_token_from_cookie(request->header);
    }

    std::string refresh_token = extract_refresh_token_from_cookie(request->header);

    APIResponse api_response = session_token_api.logout(session_token, refresh_token);
    write_api_response(response, api_response);
  }

  /**
   * @brief Authentication status endpoint.
   * Returns whether credentials are configured and if authentication is required for protected API calls.
   * This allows the frontend to avoid showing a login modal when not necessary.
   *
   * Response JSON shape:
   * {
   *   "credentials_configured": true|false,
   *   "login_required": true|false,
   *   "authenticated": true|false
   * }
   *
   * login_required becomes true only when credentials are configured and the supplied
   * request lacks valid authentication (session token or bearer token) for protected APIs.
   */
  void authStatus(resp_https_t response, req_https_t request) {
    print_req(request);

    bool credentials_configured = !config::sunshine.username.empty();

    // Determine if current request has valid auth (session or bearer) using existing check_auth
    bool authenticated = false;
    if (credentials_configured) {
      if (auto result = check_auth(request); result.ok) {
        authenticated = true;  // check_auth returns ok for public routes; refine below
        // We only consider it authenticated if an auth header or cookie was present and validated.
        std::string auth_header;
        if (auto auth_it = request->header.find("authorization"); auth_it != request->header.end()) {
          auth_header = auth_it->second;
        } else {
          std::string token = extract_session_token_from_cookie(request->header);
          if (!token.empty()) {
            auth_header = "Session " + token;
          }
        }
        if (auth_header.empty()) {
          authenticated = false;  // public access granted but no credentials supplied
        } else {
          // Re-run only auth layer for supplied header specifically to ensure validity
          auto address = client_address(request);
          // WAN may only reach the WebRTC surface, so validate against a path it is allowed to use.
          const bool wan = net::from_address(address) > http::origin_web_ui_allowed;
          auto header_check = check_auth(address, auth_header, wan ? "/api/webrtc/sessions" : "/api/config", "GET");
          authenticated = header_check.ok;
        }
      }
    }

    // login_required = true when: credentials not yet configured (needs sign-up) OR credentials exist but not authenticated
    bool login_required = !credentials_configured || !authenticated;

    nlohmann::json tree;
    tree["credentials_configured"] = credentials_configured;
    tree["login_required"] = login_required;
    tree["authenticated"] = authenticated;
    // Browser client: JUJO.CLOUD step. URL + publishable key are public by design (RLS guards data).
    tree["cloud_registered"] = config::cloud.is_configured();
    tree["cloud_trusted"] = cloud_trusted_user(request->header).has_value();
    // Session/token credentials are the owner's; a cloud trust cookie carries the user's own RBAC permissions.
    tree["permissions"] = authenticated ? rbac::permission_names(rbac::Role::admin, {}) : std::vector<std::string> {};
    if (auto guest = cloud_guest_user(request->header)) {
      const auto role = rbac::registry.get_role(*guest).value_or(rbac::Role::viewer);
      tree["authenticated"] = true;  // the trust cookie is a guest's credential on the WebRTC surface
      tree["login_required"] = false;
      tree["guest_role"] = rbac::role_to_string(role);
      tree["permissions"] = rbac::permission_names(role, rbac::registry.get_grant(*guest).value_or(rbac::Grant {}).perms);
    }
    tree["server_password_required"] = config::nvhttp.webrtc_require_server_password;
    // Names the server in the sign-in sheet; already public via nvhttp /serverinfo (hostname).
    tree["server_name"] = config::nvhttp.sunshine_name;
    if (config::cloud.is_configured()) {
      tree["cloud_url"] = config::cloud.supabase_url;
      tree["cloud_key"] = config::cloud.supabase_key;
    }

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json; charset=utf-8");
    add_cors_headers(headers);
    response->write(SimpleWeb::StatusCode::success_ok, tree.dump(), headers);
  }

  void listSessions(resp_https_t response, req_https_t request);
  void revokeSession(resp_https_t response, req_https_t request);

  void launchLocalApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authorize(response, request, rbac::Perm::launch)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      const auto input_tree = nlohmann::json::parse(ss.str());
      const auto uuid = json_string_value(input_tree, "uuid");
      const auto name = json_string_value(input_tree, "name");
      const int index = input_tree.contains("index") && input_tree["index"].is_number_integer()
        ? input_tree["index"].get<int>()
        : -1;
      if (uuid.empty() && name.empty() && index < 0) {
        bad_request(response, request, "Missing uuid, name, or index in request body");
        return;
      }

      const auto apps = read_apps_array_or_empty();
      for (int i = 0; i < static_cast<int>(apps.size()); ++i) {
        const auto &app = apps[i];
        if (!app.is_object()) {
          continue;
        }
        const auto app_uuid = json_string_value(app, "uuid");
        const auto app_name = json_string_value(app, "name");
        const bool matches =
          (!uuid.empty() && app_uuid == uuid) ||
          (index >= 0 && i == index) ||
          (!name.empty() && boost::iequals(app_name, name));
        if (!matches) {
          continue;
        }

        const auto working_dir_value = json_string_value(app, "working-dir").empty()
          ? json_string_value(app, "working_dir")
          : json_string_value(app, "working-dir");
        const bool elevated = app.value("elevated", false);
        auto env = bp::this_process::env();
        int launched_count = 0;
        std::string error;

        auto run_command = [&](const std::string &cmd) {
          if (cmd.empty()) {
            return true;
          }
          std::error_code ec;
          boost::filesystem::path working_dir = working_dir_value.empty()
            ? boost::filesystem::path()
            : boost::filesystem::path(working_dir_value);
          auto child = platf::run_command(elevated, true, cmd, working_dir, env, nullptr, ec, nullptr);
          if (ec) {
            error = ec.message();
            BOOST_LOG(warning) << "Local app launch failed [" << app_name << "]: " << error;
            return false;
          }
          child.detach();
          ++launched_count;
          return true;
        };

        if (app.contains("detached") && app["detached"].is_array()) {
          for (const auto &cmd_node : app["detached"]) {
            if (cmd_node.is_string() && !run_command(cmd_node.get<std::string>())) {
              bad_request(response, request, error.empty() ? "Failed to launch detached command" : error);
              return;
            }
          }
        }

        if (!run_command(json_string_value(app, "cmd"))) {
          bad_request(response, request, error.empty() ? "Failed to launch app command" : error);
          return;
        }

        if (launched_count == 0) {
          bad_request(response, request, "App has no launch command");
          return;
        }

        nlohmann::json output_tree;
        output_tree["status"] = true;
        output_tree["launchedCommandCount"] = launched_count;
        send_response(response, output_tree);
        return;
      }

      bad_request(response, request, "Cannot find requested application");
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "LaunchLocalApp: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  void revokeSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    print_req(request);

    if (request->path_match.size() < 2) {
      bad_request(response, request, "Session id required");
      return;
    }
    std::string session_hash = request->path_match[1].str();

    std::string raw_token;
    if (auto auth = request->header.find("authorization");
        auth != request->header.end() && auth->second.rfind("Session ", 0) == 0) {
      raw_token = auth->second.substr(8);
    }
    if (raw_token.empty()) {
      raw_token = extract_session_token_from_cookie(request->header);
    }
    bool is_current = false;
    if (!raw_token.empty()) {
      if (auto hash = session_token_manager.get_hash_for_token(raw_token)) {
        is_current = boost::iequals(*hash, session_hash);
      }
    }

    APIResponse api_response = session_token_api.revoke_session_by_hash(session_hash);
    if (api_response.status_code == StatusCode::success_ok && is_current) {
      std::string clear_cookie = std::string(session_cookie_name) + "=; Path=/; HttpOnly; SameSite=Strict; Secure; Priority=High; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
      std::string clear_refresh_cookie = std::string(refresh_cookie_name) + "=; Path=/; HttpOnly; SameSite=Strict; Secure; Priority=High; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
      api_response.headers.emplace("Set-Cookie", std::move(clear_cookie));
      api_response.headers.emplace("Set-Cookie", std::move(clear_refresh_cookie));
    }
    write_api_response(response, api_response);
  }

  /**
   * @brief Generate a new API token with specified scopes.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/token| POST| {"scopes":[{"path":"/api/apps","methods":["GET"]}]}}}
   *
   * Request body example:
   * {
   *   "scopes": [
   *     { "path": "/api/apps", "methods": ["GET", "POST"] }
   *   ]
   * }
   *
   * Response example:
   * { "token": "..." }
   */
  void generateApiToken(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    const std::string request_body = ss.str();
    auto token_opt = api_token_manager.generate_api_token(request_body, config::sunshine.username);
    nlohmann::json output_tree;
    if (!token_opt) {
      output_tree["error"] = "Invalid token request";
      send_response(response, output_tree);
      return;
    }
    output_tree["token"] = *token_opt;
    send_response(response, output_tree);
  }

  /**
   * @brief List all active API tokens and their scopes.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/tokens| GET| null}
   *
   * Response example:
   * [
   *   {
   *     "hash": "...",
   *     "username": "admin",
   *     "created_at": 1719000000,
   *     "scopes": [
   *       { "path": "/api/apps", "methods": ["GET"] }
   *     ]
   *   }
   * ]
   */
  void listApiTokens(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    nlohmann::json output_tree = nlohmann::json::parse(api_token_manager.list_api_tokens_json());
    send_response(response, output_tree);
  }

  /**
   * @brief Revoke (delete) an API token by its hash.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/token/abcdef1234567890| DELETE| null}
   *
   * Response example:
   * { "status": true }
   */
  void revokeApiToken(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    std::string hash;
    if (request->path_match.size() > 1) {
      hash = request->path_match[1];
    }
    bool result = api_token_manager.revoke_api_token_by_hash(hash);
    nlohmann::json output_tree;
    if (result) {
      output_tree["status"] = true;
    } else {
      output_tree["error"] = "Internal server error";
    }
    send_response(response, output_tree);
  }

  /**
   * @brief POST /api/pair/cloud — Cloud-assisted pairing via Supabase JWT.
   *
   * Request body:
   *   { "token": "<supabase_jwt>", "clientCert": "<pem>", "deviceName": "My Phone" }
   *
   * Flow:
   *   1. Validate cloud is configured on this server
   *   2. Validate JWT by calling Supabase /auth/v1/user
   *   3. Verify the user_id from JWT matches the configured cloud user
   *   4. Call nvhttp::cloud_pair() to register the client cert
   */
  void postCloudPair(resp_https_t response, req_https_t request) {
    print_req(request);

    nlohmann::json output;

    try {
      auto body = parse_json_request_body(request);

      const auto token = json_string_value(body, "token");
      const auto client_cert = json_string_value(body, "clientCert");
      const auto device_name = json_string_value(body, "deviceName");

      // Validate required fields
      if (token.empty() || client_cert.empty()) {
        output["status"] = false;
        output["error"] = "Missing required fields: token, clientCert";
        send_response(response, output);
        return;
      }

      // Validate cloud is configured
      if (config::cloud.supabase_url.empty() || config::cloud.supabase_key.empty()) {
        output["status"] = false;
        output["error"] = "Cloud sync is not configured on this server";
        send_response(response, output);
        return;
      }

      const auto jwt_payload = jwt_payload_json(token);
      const auto aal = jwt_payload ? json_string_value(*jwt_payload, "aal") : std::string {};
      if (aal != "aal2" && aal != "aal1") {
        output["status"] = false;
        output["error"] = "Cloud pairing requires a valid authentication level (aal1 or aal2)";
        send_response(response, output);
        return;
      }

      // Validate JWT by calling Supabase /auth/v1/user
      const auto auth_url = config::cloud.supabase_url + "/auth/v1/user";
      CURL *curl = curl_easy_init();
      if (!curl) {
        output["status"] = false;
        output["error"] = "Internal error: unable to initialize HTTP client";
        send_response(response, output);
        return;
      }

      std::string response_body;
      char errbuf[CURL_ERROR_SIZE] {};
      struct curl_slist *headers = nullptr;
      headers = curl_slist_append(headers, ("Authorization: Bearer " + token).c_str());
      headers = curl_slist_append(headers, ("apikey: " + config::cloud.supabase_key).c_str());

      http::configure_curl_tls(curl);
      curl_easy_setopt(curl, CURLOPT_URL, auth_url.c_str());
      curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
      curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
      curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
      curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
      curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);

      const auto res = curl_easy_perform(curl);
      long http_code = 0;
      curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
      curl_slist_free_all(headers);
      curl_easy_cleanup(curl);

      if (res != CURLE_OK) {
        output["status"] = false;
        output["error"] = std::string("JWT validation failed: ") + (errbuf[0] ? errbuf : curl_easy_strerror(res));
        send_response(response, output);
        return;
      }

      if (http_code != 200) {
        output["status"] = false;
        output["error"] = "JWT validation failed: Supabase returned HTTP " + std::to_string(http_code);
        send_response(response, output);
        return;
      }

      // Parse user info from Supabase response
      auto user_info = nlohmann::json::parse(response_body);
      const auto user_id = json_string_value(user_info, "id");

      if (user_id.empty()) {
        output["status"] = false;
        output["error"] = "JWT validation failed: no user ID in response";
        send_response(response, output);
        return;
      }

      // Verify this user owns this server (compare against configured cloud user token's user)
      // The server's cloud.user_token was set during initial cloud setup — we validate
      // that the requesting user matches by checking their user_id against the server's
      // configured token. If no user_token is configured, we accept any valid Supabase user
      // (first-user-wins model for unclaimed servers).
      rbac::Role pair_role = rbac::Role::admin;
      rbac::Grant rbac_grant;
      bool owner_validated = false;
      bool is_owner = true;
      std::optional<crypto::PERM> perm_override;
      std::optional<coop_access::guest_grant_t> guest;
      std::optional<coop_access::member_grant_t> member;
      std::string coop_role_str;

      if (!config::cloud.user_token.empty()) {
        // Extract owner ID locally from configured user token
        const auto owner_id = cloud_owner_id();

        if (!owner_id.empty()) {
          owner_validated = true;

          if (owner_id != user_id) {
            // Not the owner — check server_members first, then active 4h coop_session_invites.
            const auto decision = cloud_member_access(owner_id, user_id, token);
            if (!decision.allowed) {
              BOOST_LOG(warning) << "cloud_pair: rejected - user " << user_id << " is not the server owner " << owner_id << " and has no active membership or coop invite";
              output["status"] = false;
              output["error"] = "Access denied: you are not the owner, a member, or an invited Co-Op guest of this server";
              send_response(response, output);
              return;
            }

            is_owner = false;
            pair_role = decision.pair_role;
            rbac_grant = {decision.perms, decision.coop_role};
            perm_override = decision.perm_override;
            coop_role_str = decision.coop_role;
            if (decision.is_member) {
              member = coop_access::member_grant_t {user_id, rbac::allows(pair_role, decision.perms, rbac::Perm::launch), rbac::allows(pair_role, decision.perms, rbac::Perm::kbm)};
            } else {
              guest = coop_access::guest_grant_t {
                .user_id = user_id,
                .invite_id = decision.coop_invite_id,
                .expires_at = coop_access::parse_iso8601_utc(decision.coop_expires_at),
              };
            }
            if (decision.is_member) {
              BOOST_LOG(info) << "cloud_pair: user " << user_id << " is a member of server owned by " << owner_id << " - allowing pair";
            } else {
              BOOST_LOG(info) << "cloud_pair: user " << user_id << " has active Co-Op invite (role=" << coop_role_str
                              << ") for server owned by " << owner_id << " - allowing pair";
            }
          }
        }
      }

      // All checks passed — pair the client
      if (!config::cloud.user_token.empty() && !owner_validated) {
        BOOST_LOG(warning) << "cloud_pair: rejected - configured cloud owner token could not be validated";
        output["status"] = false;
        output["error"] = "Server cloud owner token is expired. Open the admin app to refresh cloud sync, then retry pairing.";
        send_response(response, output);
        return;
      }

      const auto client_uuid = nvhttp::cloud_pair(client_cert, device_name, perm_override, guest, member);

      if (client_uuid.empty()) {
        output["status"] = false;
        output["error"] = "Pairing failed: invalid client certificate";
        send_response(response, output);
        return;
      }

      BOOST_LOG(info) << "cloud_pair: successfully paired device '" << device_name << "' for user " << user_id;

      output["status"] = true;
      output["clientUuid"] = client_uuid;
      if (!coop_role_str.empty()) {
        output["coopRole"] = coop_role_str;
      }
      // Register user in RBAC registry — role was determined during membership check above
      // Use the user's Supabase email as the display_name (stable per user, not per device).
      // The actual device name is stored in the NV HTTP cert registry via nvhttp::cloud_pair().
      const auto user_email = json_string_value(user_info, "email");
      // Only the owner may be auto-promoted: a co-owner's role and permissions come from Supabase alone.
      rbac::registry.register_client(user_id, pair_role, user_email.empty() ? device_name : user_email, is_owner, rbac_grant);

      output["message"] = "Device paired successfully via cloud authentication";
      send_response(response, output);

    } catch (const std::exception &e) {
      output["status"] = false;
      output["error"] = std::string("Cloud pairing failed: ") + e.what();
      send_response(response, output);
    } catch (...) {
      output["status"] = false;
      output["error"] = "Cloud pairing failed: unknown error";
      send_response(response, output);
    }
  }

  /**
   * @brief Get a one-time password (OTP).
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/otp| GET| null}
   */
  void getOTP(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());

      std::string passphrase = input_tree.value("passphrase", "");
      if (passphrase.empty()) {
        throw std::runtime_error("Passphrase not provided!");
      }
      if (passphrase.size() < 4) {
        throw std::runtime_error("Passphrase too short!");
      }

      std::string deviceName = input_tree.value("deviceName", "");
      output_tree["otp"] = nvhttp::request_otp(passphrase, deviceName);
      output_tree["ip"] = platf::get_local_ip_for_gateway();
      output_tree["name"] = config::nvhttp.sunshine_name;
      output_tree["status"] = true;
      output_tree["message"] = "OTP created, effective within 3 minutes.";
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "OTP creation failed: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Send a PIN code to the host.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * The body for the POST request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "pin": "<pin>",
   *   "name": "Friendly Client Name"
   * }
   * @endcode
   *
   * @api_examples{/api/pin| POST| {"pin":"1234","name":"My PC"}}
   */
  void savePin(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;
      std::string pin = input_tree.value("pin", "");
      std::string name = input_tree.value("name", "");
      output_tree["status"] = nvhttp::pin(pin, name);
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "SavePin: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief List all token-eligible API routes and methods.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void listApiTokenRoutes(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);
    const auto catalog = snapshot_token_route_catalog();

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["routes"] = nlohmann::json::array();

    for (const auto &[path, methods] : catalog) {
      output_tree["routes"].push_back(nlohmann::json{{"path", path}, {"methods", ordered_methods_for_catalog(methods)}});
    }

    send_response(response, output_tree);
  }

  /**
   * @brief Login the user.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * The body for the POST request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "username": "<username>",
   *   "password": "<password>"
   * }
   * @endcode
   */
  void login(resp_https_t response, req_https_t request) {
    if (!checkIPOrigin(response, request) || !validateContentType(response, request, "application/json")) {
      return;
    }

    auto fg = util::fail_guard([&] {
      response->write(SimpleWeb::StatusCode::client_error_unauthorized);
    });

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      std::string username = input_tree.value("username", "");
      std::string password = input_tree.value("password", "");
      std::string hash = util::hex(crypto::hash(password + config::sunshine.salt)).to_string();
      if (!boost::iequals(username, config::sunshine.username) || hash != config::sunshine.password) {
        return;
      }
      std::string sessionCookieRaw = crypto::rand_alphabet(64);
      sessionCookie = util::hex(crypto::hash(sessionCookieRaw + config::sunshine.salt)).to_string();
      cookie_creation_time = std::chrono::steady_clock::now();
      const SimpleWeb::CaseInsensitiveMultimap headers {
        {"Set-Cookie", "auth=" + sessionCookieRaw + "; Secure; SameSite=Strict; Max-Age=2592000; Path=/"}
      };
      response->write(headers);
      fg.disable();
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "Web UI Login failed: ["sv << client_address(request)
                         << "]: "sv << e.what();
      response->write(SimpleWeb::StatusCode::server_error_internal_server_error);
      fg.disable();
      return;
    }
  }

  /**
   * @brief Update existing credentials.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * The body for the POST request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "currentUsername": "Current Username",
   *   "currentPassword": "Current Password",
   *   "newUsername": "New Username",
   *   "newPassword": "New Password",
   *   "confirmNewPassword": "Confirm New Password"
   * }
   * @endcode
   *
   * @api_examples{/api/password| POST| {"currentUsername":"admin","currentPassword":"admin","newUsername":"admin","newPassword":"admin","confirmNewPassword":"admin"}}
   */
  void savePassword(resp_https_t response, req_https_t request) {
    if ((!config::sunshine.username.empty() && !authorize(response, request, rbac::Role::admin)) || !validateContentType(response, request, "application/json")) {
      return;
    }
    print_req(request);
    std::vector<std::string> errors;
    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;
      std::string username = input_tree.value("currentUsername", "");
      std::string newUsername = input_tree.value("newUsername", "");
      std::string password = input_tree.value("currentPassword", "");
      std::string newPassword = input_tree.value("newPassword", "");
      std::string confirmPassword = input_tree.value("confirmNewPassword", "");
      if (newUsername.empty()) {
        newUsername = username;
      }
      if (newUsername.empty()) {
        errors.push_back("Invalid Username");
      } else {
        auto hash = util::hex(crypto::hash(password + config::sunshine.salt)).to_string();
        if (config::sunshine.username.empty() ||
            (boost::iequals(username, config::sunshine.username) && hash == config::sunshine.password)) {
          if (newPassword.empty() || newPassword != confirmPassword) {
            errors.push_back("Password Mismatch");
          } else {
            if (http::save_user_creds(config::sunshine.credentials_file, newUsername, newPassword) != 0) {
              bad_request(response, request, "Failed to write credentials file. Check server file permissions.");
              return;
            }
            if (http::reload_user_creds(config::sunshine.credentials_file) != 0) {
              bad_request(response, request, "Credentials saved but failed to reload. Restart the server.");
              return;
            }
            sessionCookie.clear();  // force re-login
            output_tree["status"] = true;
          }
        } else {
          errors.push_back("Invalid Current Credentials");
        }
      }
      if (!errors.empty()) {
        std::string error = std::accumulate(errors.begin(), errors.end(), std::string(), [](const std::string &a, const std::string &b) {
          return a.empty() ? b : a + ", " + b;
        });
        bad_request(response, request, error);
        return;
      }
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "SavePassword: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  static nlohmann::json rbac_clients_to_json() {
    auto clients = rbac::registry.list_clients();
    const auto owner_id = cloud_owner_id();
    nlohmann::json clients_json = nlohmann::json::array();
    for (const auto &client : clients) {
      clients_json.push_back({
        {"client_id", client.user_id},
        {"role", rbac::role_to_string(client.role)},
        {"device_name", client.display_name},
        {"paired_at", client.paired_at},
        {"permissions", rbac::permission_names(client.role, client.grant.perms)},
        {"coop_role", client.grant.coop_role},
        {"kind", rbac::client_kind(client.user_id, owner_id, client.role)},
      });
    }
    return clients_json;
  }

  void getRbacClients(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    send_response(response, rbac_clients_to_json());
  }

  void deleteRbacClient(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    if (request->path_match.size() < 2) {
      bad_request(response, request, "Client ID required");
      return;
    }
    std::string client_id = request->path_match[1].str();

    rbac::registry.remove_client(client_id);
    send_response(response, rbac_clients_to_json());
  }

  // ─── Cloud config ──────────────────────────────────────────────────────────

  /**
   * @brief GET /api/config/cloud — return cloud-layer configuration flags.
   *
   * Returns the mutable, user-facing cloud settings. Currently exposes:
   *   - auto_trust_cloud_clients (bool): whether new cloud-paired clients are
   *     automatically promoted to admin.
   *
   * Requires admin role.
   */
  void getCloudConfig(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    nlohmann::json out;
    out["auto_trust_cloud_clients"] = config::cloud.auto_trust_cloud_clients;
    send_response(response, out);
  }

  /**
   * @brief PATCH /api/config/cloud — update cloud-layer configuration flags.
   *
   * Accepted body fields (all optional):
   *   - auto_trust_cloud_clients (bool)
   *
   * Changes are written to the config file and hot-applied immediately
   * (no server restart required).
   *
   * Requires admin role.
   */
  void patchCloudConfig(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json")) {
      return;
    }
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    try {
      auto body = parse_json_request_body(request);

      if (body.contains("auto_trust_cloud_clients")) {
        bool val = body["auto_trust_cloud_clients"].get<bool>();

        // Hot-apply in memory
        config::cloud.auto_trust_cloud_clients = val;

        // Persist to the config file via PATCH logic (read-merge-write)
        auto current = config::parse_config(
          file_handler::read_file(config::sunshine.config_file.c_str())
        );
        current["auto_trust_cloud_clients"] = val ? "true" : "false";

        std::stringstream config_stream;
        for (const auto &kv : current) {
          config_stream << kv.first << " = " << kv.second << "\n";
        }
        file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());

        BOOST_LOG(info) << "RBAC: auto_trust_cloud_clients set to " << (val ? "true" : "false");
      }

      nlohmann::json out;
      out["status"] = true;
      out["auto_trust_cloud_clients"] = config::cloud.auto_trust_cloud_clients;
      send_response(response, out);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief DELETE /api/cloud/register — unregister this server from the cloud.
   *
   * Best-effort deletes the server's row from user_server_profiles, stops the
   * cloud agent heartbeat, and removes cloud_user_token from the config file
   * so the server no longer publishes itself. The Supabase URL/key are kept so
   * re-registering only needs a fresh user token.
   *
   * Requires admin role.
   */
  void deleteCloudRegister(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    try {
      // ?keep_devices=true converts cloud pairings into local ones instead of
      // revoking them, so a device can keep connecting over the LAN.
      const auto query = request->parse_query_string();
      bool keep_devices = false;
      if (auto it = query.find("keep_devices"); it != query.end()) {
        keep_devices = it->second == "true" || it->second == "1";
      }

      // Best-effort: remove our row from the cloud before dropping credentials.
      cloud::CloudConfig agent_cfg;
      agent_cfg.supabase_url = config::cloud.supabase_url;
      agent_cfg.supabase_key = config::cloud.supabase_key;
      agent_cfg.user_jwt = config::cloud.user_token;
      agent_cfg.heartbeat_interval_s = config::cloud.heartbeat_interval;
      const bool row_deleted = cloud::delete_identity(agent_cfg);

      cloud::stop_heartbeat();

      // Drop the registration token in memory and on disk.
      config::cloud.user_token.clear();
      auto current = config::parse_config(
        file_handler::read_file(config::sunshine.config_file.c_str())
      );
      current.erase("cloud_user_token");

      std::stringstream config_stream;
      for (const auto &kv : current) {
        config_stream << kv.first << " = " << kv.second << "\n";
      }
      file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());

      const auto affected = keep_devices
                              ? nvhttp::keep_cloud_paired_clients_locally()
                              : nvhttp::revoke_cloud_paired_clients();

      BOOST_LOG(info) << "Cloud: server unregistered (cloud row "
                      << (row_deleted ? "deleted" : "not deleted — may need manual cleanup") << ")";

      nlohmann::json out;
      out["status"] = true;
      out["cloud_row_deleted"] = row_deleted;
      out["devices_kept"] = keep_devices ? affected : 0;
      out["devices_revoked"] = keep_devices ? 0 : affected;
      out["message"] = "Server unregistered from cloud.";
      send_response(response, out);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }


  namespace {
    /// Shared shape for the watchword endpoints so StreamAdmin gets the same
    /// fields whether it just created the challenge or is polling it.
    nlohmann::json watchword_json(const watchword::challenge_t &c, bool include_secret) {
      nlohmann::json out;
      out["status"] = true;
      out["active"] = true;
      out["challengeId"] = c.challenge_id;
      out["round"] = c.round;
      out["maxRounds"] = watchword::MAX_ROUNDS;
      out["failures"] = c.failures;
      out["remainingSeconds"] = (int) c.remaining.count();
      out["frozen"] = c.frozen;
      out["shownCount"] = (int) c.shown.size();
      out["wordCount"] = c.word_count;
      if (include_secret) {
        out["words"] = c.secret;
      }
      return out;
    }
  }  // namespace

  void postWatchword(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") ||
        !authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      const auto body = ss.str();
      nlohmann::json input_tree =
        body.empty() ? nlohmann::json::object() : nlohmann::json::parse(body);

      const int word_count =
        input_tree.value("wordCount", watchword::DEFAULT_WORD_COUNT);
      const std::string language = input_tree.value("language", "en");
      const std::string device_name = input_tree.value("deviceName", "");

      auto challenge = watchword::begin(word_count, language, device_name);
      if (!challenge) {
        bad_request(response, request, "Could not start a watchword challenge.");
        return;
      }

      send_response(response, watchword_json(*challenge, true));
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "Watchword creation failed: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  void getWatchword(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    auto challenge = watchword::current();
    if (!challenge) {
      nlohmann::json out;
      out["status"] = true;
      out["active"] = false;
      send_response(response, out);
      return;
    }

    send_response(response, watchword_json(*challenge, true));
  }

  void deleteWatchword(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    watchword::clear();
    nlohmann::json out;
    out["status"] = true;
    out["active"] = false;
    send_response(response, out);
  }

} // namespace confighttp
