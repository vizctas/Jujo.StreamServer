
#include <algorithm>
#include <array>
#include <boost/regex.hpp>
#include <cctype>
#include <chrono>
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
#include <boost/algorithm/string.hpp>
#include <boost/asio.hpp>
#include <boost/asio/ssl/context.hpp>
#include <boost/filesystem.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <nlohmann/json.hpp>
#include <Simple-Web-Server/crypto.hpp>
#include <Simple-Web-Server/server_https.hpp>
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
      std::string remote_address = net::addr_to_normalized_string(request->remote_endpoint().address());

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
    std::string remote_address = net::addr_to_normalized_string(request->remote_endpoint().address());

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
          auto address = net::addr_to_normalized_string(request->remote_endpoint().address());
          auto header_check = check_auth(address, auth_header, "/api/config", "GET");  // use protected path for validation
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

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json; charset=utf-8");
    add_cors_headers(headers);
    response->write(SimpleWeb::StatusCode::success_ok, tree.dump(), headers);
  }

  void listSessions(resp_https_t response, req_https_t request);
  void revokeSession(resp_https_t response, req_https_t request);

  void launchLocalApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
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
      if (aal != "aal2") {
        output["status"] = false;
        output["error"] = "Cloud pairing requires 2FA verification";
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
      bool owner_validated = false;

      if (!config::cloud.user_token.empty()) {
        // Validate the configured user's identity
        CURL *verify_curl = curl_easy_init();
        if (verify_curl) {
          std::string owner_response;
          struct curl_slist *owner_headers = nullptr;
          owner_headers = curl_slist_append(owner_headers, ("Authorization: Bearer " + config::cloud.user_token).c_str());
          owner_headers = curl_slist_append(owner_headers, ("apikey: " + config::cloud.supabase_key).c_str());

          http::configure_curl_tls(verify_curl);
          curl_easy_setopt(verify_curl, CURLOPT_URL, auth_url.c_str());
          curl_easy_setopt(verify_curl, CURLOPT_HTTPHEADER, owner_headers);
          curl_easy_setopt(verify_curl, CURLOPT_TIMEOUT, 10L);
          curl_easy_setopt(verify_curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
          curl_easy_setopt(verify_curl, CURLOPT_WRITEDATA, &owner_response);

          const auto owner_res = curl_easy_perform(verify_curl);
          long owner_code = 0;
          curl_easy_getinfo(verify_curl, CURLINFO_RESPONSE_CODE, &owner_code);
          curl_slist_free_all(owner_headers);
          curl_easy_cleanup(verify_curl);

          if (owner_res == CURLE_OK && owner_code == 200) {
            auto owner_info = nlohmann::json::parse(owner_response);
            const auto owner_id = json_string_value(owner_info, "id");
            owner_validated = !owner_id.empty();

            if (!owner_id.empty() && owner_id != user_id) {
              // Not the owner — check if user is a server_member via Supabase REST
              bool is_member = false;
              std::string member_role_str = "viewer";  // default role for members
              CURL *member_curl = curl_easy_init();
              if (member_curl) {
                const auto members_url = config::cloud.supabase_url +
                  "/rest/v1/server_members?select=id,role&owner_id=eq." + owner_id +
                  "&member_id=eq." + user_id + "&status=eq.active&limit=1";

                std::string member_response;
                struct curl_slist *member_headers = nullptr;
                member_headers = curl_slist_append(member_headers, ("apikey: " + config::cloud.supabase_key).c_str());
                member_headers = curl_slist_append(member_headers, ("Authorization: Bearer " + token).c_str());

                http::configure_curl_tls(member_curl);
                curl_easy_setopt(member_curl, CURLOPT_URL, members_url.c_str());
                curl_easy_setopt(member_curl, CURLOPT_HTTPHEADER, member_headers);
                curl_easy_setopt(member_curl, CURLOPT_TIMEOUT, 10L);
                curl_easy_setopt(member_curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
                curl_easy_setopt(member_curl, CURLOPT_WRITEDATA, &member_response);

                const auto member_res = curl_easy_perform(member_curl);
                long member_code = 0;
                curl_easy_getinfo(member_curl, CURLINFO_RESPONSE_CODE, &member_code);
                curl_slist_free_all(member_headers);
                curl_easy_cleanup(member_curl);

                if (member_res == CURLE_OK && member_code == 200) {
                  try {
                    auto member_data = nlohmann::json::parse(member_response);
                    is_member = member_data.is_array() && !member_data.empty();
                    if (is_member) {
                      member_role_str = member_data.at(0).value("role", "viewer");
                    }
                  } catch (...) {}
                }
              }

              if (!is_member) {
                BOOST_LOG(warning) << "cloud_pair: rejected - user " << user_id << " is not the server owner " << owner_id << " and not a member";
                output["status"] = false;
                output["error"] = "Access denied: you are not the owner or a member of this server";
                send_response(response, output);
                return;
              }

              if (member_role_str == "owner" || member_role_str == "admin") {
                pair_role = rbac::Role::admin;
              } else if (member_role_str == "operator") {
                pair_role = rbac::Role::operator_;
              } else {
                pair_role = rbac::Role::viewer;
              }

              BOOST_LOG(info) << "cloud_pair: user " << user_id << " is a member of server owned by " << owner_id << " - allowing pair";
            }
          }
          // If owner token validation fails (expired, etc.), fall through and allow
          // the pairing — the user already proved they have a valid Supabase account
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

      const auto client_uuid = nvhttp::cloud_pair(client_cert, device_name);

      if (client_uuid.empty()) {
        output["status"] = false;
        output["error"] = "Pairing failed: invalid client certificate";
        send_response(response, output);
        return;
      }

      BOOST_LOG(info) << "cloud_pair: successfully paired device '" << device_name << "' for user " << user_id;

      output["status"] = true;
      output["clientUuid"] = client_uuid;
      // Register user in RBAC registry — role was determined during membership check above
      rbac::registry.register_client(user_id, pair_role, device_name);

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
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
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
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
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
      BOOST_LOG(warning) << "Web UI Login failed: ["sv << net::addr_to_normalized_string(request->remote_endpoint().address())
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
    if ((!config::sunshine.username.empty() && !authenticate(response, request)) || !validateContentType(response, request, "application/json")) {
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
    nlohmann::json clients_json = nlohmann::json::array();
    for (const auto &client : clients) {
      clients_json.push_back({
        {"client_id", client.user_id},
        {"role", rbac::role_to_string(client.role)},
        {"device_name", client.display_name},
        {"paired_at", client.paired_at}
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

  void patchRbacClient(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    if (request->path_match.size() < 2) {
      bad_request(response, request, "Client ID required");
      return;
    }
    std::string client_id = request->path_match[1].str();

    try {
      auto body = parse_json_request_body(request);
      if (body.contains("role")) {
        std::string role_str = body["role"].get<std::string>();
        rbac::Role role = rbac::role_from_string(role_str);
        rbac::registry.update_role(client_id, role);
      }
      if (body.contains("device_name")) {
        std::string device_name = body["device_name"].get<std::string>();
        auto opt_role = rbac::registry.get_role(client_id);
        if (opt_role) {
          rbac::registry.register_client(client_id, *opt_role, device_name);
        }
      }
      send_response(response, rbac_clients_to_json());
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
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

} // namespace confighttp
