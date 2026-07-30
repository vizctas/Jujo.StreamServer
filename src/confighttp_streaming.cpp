
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
#include "cloud_agent.h"
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


  void getSessionStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    print_req(request);

    nlohmann::json output_tree;
    const int active = rtsp_stream::session_count();
    const bool app_running = proc::proc.running() > 0;
    output_tree["activeSessions"] = active;
    output_tree["appRunning"] = app_running;
    output_tree["paused"] = app_running && active == 0;
    output_tree["status"] = true;
    send_response(response, output_tree);
  }

  /**
   * @brief GET /api/stream/health — real-time stream quality metrics for adaptive bitrate.
   *
   * Returns per-session health signals (WebRTC + RTSP) including:
   * - drop_rate_percent: video frames dropped / total video packets
   * - video_queue_depth: frames waiting to be sent
   * - staleness_ms: time since last video frame was processed
   * - health_score: 0-100 composite (100 = perfect)
   *
   * Designed for 2-3s polling by the Flutter AdaptiveBitrateController.
   */
  void getStreamHealth(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    print_req(request);

    nlohmann::json output;
    output["timestamp"] = std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()
    ).count();

    // RTSP sessions — basic health
    const int rtsp_active = rtsp_stream::session_count();
    output["rtsp_sessions"] = rtsp_active;

    // WebRTC sessions — rich health data
    nlohmann::json sessions_health = nlohmann::json::array();
    auto now = std::chrono::steady_clock::now();

    for (const auto &state : webrtc_stream::list_sessions()) {
      nlohmann::json sh;
      sh["id"] = state.id;
      sh["video_packets"] = state.video_packets;
      sh["video_dropped"] = state.video_dropped;
      sh["video_queue_frames"] = state.video_queue_frames;
      sh["video_inflight_frames"] = state.video_inflight_frames;
      sh["audio_dropped"] = state.audio_dropped;

      // Derived: drop rate percentage
      double drop_rate = 0.0;
      if (state.video_packets > 0) {
        drop_rate = (static_cast<double>(state.video_dropped) / static_cast<double>(state.video_packets)) * 100.0;
      }
      sh["drop_rate_percent"] = drop_rate;

      // Derived: staleness (ms since last video frame)
      int64_t staleness_ms = -1;
      if (state.last_video_time) {
        staleness_ms = std::chrono::duration_cast<std::chrono::milliseconds>(now - *state.last_video_time).count();
      }
      sh["staleness_ms"] = staleness_ms;

      // Derived: health score (0-100)
      // Factors: drop rate (weight 50), queue depth (weight 30), staleness (weight 20)
      int health_score = 100;

      // Drop rate penalty: >5% = critical, >2% = warning, >0.5% = minor
      if (drop_rate > 5.0) health_score -= 50;
      else if (drop_rate > 2.0) health_score -= 30;
      else if (drop_rate > 0.5) health_score -= 15;

      // Queue depth penalty: >10 frames = critical, >5 = warning
      if (state.video_queue_frames > 10) health_score -= 30;
      else if (state.video_queue_frames > 5) health_score -= 15;
      else if (state.video_queue_frames > 2) health_score -= 5;

      // Staleness penalty: >500ms = critical, >200ms = warning
      if (staleness_ms > 500) health_score -= 20;
      else if (staleness_ms > 200) health_score -= 10;

      sh["health_score"] = std::max(0, health_score);

      // Current session params for context
      sh["bitrate_kbps"] = state.bitrate_kbps ? nlohmann::json(*state.bitrate_kbps) : nlohmann::json(nullptr);
      sh["fps"] = state.fps ? nlohmann::json(*state.fps) : nlohmann::json(nullptr);
      sh["codec"] = state.codec ? nlohmann::json(*state.codec) : nlohmann::json(nullptr);
      sh["width"] = state.width ? nlohmann::json(*state.width) : nlohmann::json(nullptr);
      sh["height"] = state.height ? nlohmann::json(*state.height) : nlohmann::json(nullptr);

      sessions_health.push_back(sh);
    }

    output["sessions"] = sessions_health;

    // Aggregate health: worst session score
    int worst_score = 100;
    for (const auto &s : sessions_health) {
      int score = s.value("health_score", 100);
      if (score < worst_score) worst_score = score;
    }
    output["health_score"] = worst_score;
    output["active_sessions"] = rtsp_active + static_cast<int>(sessions_health.size());

    send_response(response, output);
  }

  /**
   * @brief GET /api/server/status — comprehensive server metrics for the Flutter dashboard.
   * Returns uptime, version, active sessions, paired clients, and streaming state.
   */

  void getServerStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    print_req(request);

    auto now = std::chrono::system_clock::now();
    auto uptime_seconds = std::chrono::duration_cast<std::chrono::seconds>(now - server_start_time).count();
    auto started_at = std::chrono::duration_cast<std::chrono::seconds>(server_start_time.time_since_epoch()).count();

    int rtsp_sessions = rtsp_stream::session_count();
    bool webrtc_active = webrtc_stream::has_active_sessions();
    int current_appid = proc::proc.running();
    bool is_streaming = (rtsp_sessions > 0) || webrtc_active;

    nlohmann::json output;
    output["status"] = true;
    output["server"] = nlohmann::json::object();
    output["server"]["name"] = config::nvhttp.sunshine_name;
    output["server"]["version"] = PROJECT_VERSION;
    output["server"]["platform"] = SUNSHINE_PLATFORM;
    output["server"]["startedAt"] = started_at;
    output["server"]["uptimeSeconds"] = uptime_seconds;

    output["streaming"] = nlohmann::json::object();
    output["streaming"]["active"] = is_streaming;
    output["streaming"]["rtspSessionCount"] = rtsp_sessions;
    output["streaming"]["webrtcActive"] = webrtc_active;
    output["streaming"]["currentAppId"] = current_appid > 0 ? nlohmann::json(current_appid) : nlohmann::json(nullptr);

    output["clients"] = nlohmann::json::object();
    output["clients"]["pairedCount"] = paired_client_count();

    output["cloud"] = nlohmann::json::object();
    output["cloud"]["configured"] = !config::cloud.supabase_url.empty() && !config::cloud.supabase_key.empty();

    send_response(response, output);
  }

  /**
   * @brief Launch an application.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void launchApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());

      const auto uuid = json_string_value(input_tree, "uuid");
      const auto name = json_string_value(input_tree, "name");
      const int index = input_tree.contains("index") && input_tree["index"].is_number_integer()
        ? input_tree["index"].get<int>()
        : -1;
      if (uuid.empty() && name.empty() && index < 0) {
        bad_request(response, request, "Missing uuid, name, or index in request body");
        return;
      }

      nlohmann::json output_tree;
      const auto &apps = proc::proc.get_apps();
      for (int i = 0; i < static_cast<int>(apps.size()); ++i) {
        auto &app = apps[i];
        const bool matches =
          (!uuid.empty() && app.uuid == uuid) ||
          (index >= 0 && i == index) ||
          (!name.empty() && boost::iequals(app.name, name));
        if (matches) {
          crypto::named_cert_t named_cert {
            .name = "",
            .uuid = http::unique_id,
            .perm = crypto::PERM::_all,
          };
          BOOST_LOG(info) << "Launching app ["sv << app.name << "] from web UI"sv;
          auto launch_session = nvhttp::make_launch_session(true, false, request->parse_query_string(), &named_cert);
          auto err = proc::proc.execute(app, launch_session);
          if (err) {
            bad_request(response, request, err == 503 ? "Failed to initialize video capture/encoding. Is a display connected and turned on?" : "Failed to start the specified application");
          } else {
            output_tree["status"] = true;
            send_response(response, output_tree);
          }
          return;
        }
      }
      BOOST_LOG(error) << "Couldn't find app for launch request";
      bad_request(response, request, "Cannot find requested application");
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "LaunchApp: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Close the currently running application.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/apps/close| POST| null}
   */
  void closeApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    proc::proc.terminate();
    nlohmann::json output_tree;
    output_tree["status"] = true;
    send_response(response, output_tree);
  }

  /**
   * @brief Force-kill the currently running application.
   *        Uses brute-force process enumeration as fallback when
   *        the job-object terminate misses Steam-spawned game processes.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/apps/force-kill| POST| null}
   */
  void forceKillApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    proc::proc.forceKill();
    nlohmann::json output_tree;
    output_tree["status"] = true;
    send_response(response, output_tree);
  }

  /**
   * @brief Disconnect a client.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void disconnect(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();
      nlohmann::json output_tree;
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      std::string uuid = input_tree.value("uuid", "");
      output_tree["status"] = nvhttp::find_and_stop_session(uuid, true);
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "Disconnect: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Get the list of paired clients.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/clients/list| GET| null}
   */
  void getClients(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json named_certs = nvhttp::get_all_clients();
    nlohmann::json output_tree;
    output_tree["named_certs"] = named_certs;
#ifdef _WIN32
    output_tree["platform"] = "windows";
#endif
    output_tree["status"] = true;
    output_tree["platform"] = SUNSHINE_PLATFORM;
    send_response(response, output_tree);
  }

  /**
   * @brief Get a list of available HDR color profiles (Windows only).
   *
   * @api_examples{/api/clients/hdr-profiles| GET| null}
   */
  void getHdrProfiles(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    nlohmann::json profiles = nlohmann::json::array();

#ifdef _WIN32
    try {
      const auto dir = windows_color_profile_dir();

      struct entry_t {
        std::string filename;
        uint64_t added_ms;
      };

      std::vector<entry_t> entries;
      for (const auto &entry : std::filesystem::directory_iterator(dir)) {
        std::error_code ec;
        if (!entry.is_regular_file(ec)) {
          continue;
        }

        auto ext = entry.path().extension().wstring();
        std::transform(ext.begin(), ext.end(), ext.begin(), [](wchar_t ch) {
          return static_cast<wchar_t>(std::towlower(ch));
        });
        if (ext != L".icm" && ext != L".icc") {
          continue;
        }

        const auto filename_utf8 = platf::to_utf8(entry.path().filename().wstring());
        const auto added_ms = file_creation_time_ms(entry.path()).value_or(0);
        entries.push_back({filename_utf8, added_ms});
      }

      std::sort(entries.begin(), entries.end(), [](const entry_t &a, const entry_t &b) {
        if (a.added_ms != b.added_ms) {
          return a.added_ms > b.added_ms;
        }
        return a.filename < b.filename;
      });

      for (const auto &e : entries) {
        nlohmann::json node;
        node["filename"] = e.filename;
        node["added_ms"] = e.added_ms;
        profiles.push_back(std::move(node));
      }
    } catch (const std::exception &e) {
      output_tree["status"] = false;
      output_tree["error"] = e.what();
    } catch (...) {
      output_tree["status"] = false;
      output_tree["error"] = "unknown error";
    }
#endif

    output_tree["profiles"] = std::move(profiles);
    send_response(response, output_tree);
  }

  /**
   * @brief Unpair a client.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * The body for the POST request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "uuid": "<uuid>",
   *   "name": "<Friendly Name>",
   *   "display_mode": "1920x1080x59.94",
   *   "do": [ { "cmd": "<command>", "elevated": false }, ... ],
   *   "undo": [ { "cmd": "<command>", "elevated": false }, ... ],
   *   "perm": <uint32_t>
   * }
   * @endcode
   */
  void updateClient(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;
      std::string uuid = input_tree.value("uuid", "");
      std::optional<std::string> hdr_profile;
      if (input_tree.contains("hdr_profile")) {
        if (input_tree["hdr_profile"].is_null()) {
          hdr_profile = std::string {};
        } else {
          hdr_profile = input_tree.value("hdr_profile", "");
        }
      }

      const bool has_extended_fields =
        input_tree.contains("name") ||
        input_tree.contains("display_mode") ||
        input_tree.contains("output_name_override") ||
        input_tree.contains("always_use_virtual_display") ||
        input_tree.contains("virtual_display_mode") ||
        input_tree.contains("virtual_display_layout") ||
        input_tree.contains("config_overrides") ||
        input_tree.contains("prefer_10bit_sdr") ||
        input_tree.contains("enable_legacy_ordering") ||
        input_tree.contains("allow_client_commands") ||
        input_tree.contains("perm") ||
        input_tree.contains("do") ||
        input_tree.contains("undo");

      if (!has_extended_fields && hdr_profile.has_value()) {
        output_tree["status"] = nvhttp::set_client_hdr_profile(uuid, hdr_profile.value());
        send_response(response, output_tree);
        return;
      }

      std::string name = input_tree.value("name", "");
      std::string display_mode = input_tree.value("display_mode", "");
      std::string output_name_override = input_tree.value("output_name_override", "");
      bool enable_legacy_ordering = input_tree.value("enable_legacy_ordering", true);
      bool allow_client_commands = input_tree.value("allow_client_commands", true);
      bool always_use_virtual_display = input_tree.value("always_use_virtual_display", false);
      std::optional<bool> prefer_10bit_sdr;
      if (input_tree.contains("prefer_10bit_sdr") && !input_tree["prefer_10bit_sdr"].is_null()) {
        prefer_10bit_sdr = util::get_non_string_json_value<bool>(input_tree, "prefer_10bit_sdr", false);
      } else {
        prefer_10bit_sdr.reset();
      }
      std::optional<std::unordered_map<std::string, std::string>> config_overrides;
      if (input_tree.contains("config_overrides")) {
        if (input_tree["config_overrides"].is_null()) {
          config_overrides = std::unordered_map<std::string, std::string> {};
        } else if (input_tree["config_overrides"].is_object()) {
          std::unordered_map<std::string, std::string> overrides;
          for (const auto &item : input_tree["config_overrides"].items()) {
            std::string key = item.key();
            if (key == "nvenc_force_split_encode") {
              key = "nvenc_split_encode";
            }
            const auto &val = item.value();
            if (key.empty() || val.is_null()) {
              continue;
            }
            std::string encoded;
            if (val.is_string()) {
              encoded = val.get<std::string>();
            } else {
              encoded = val.dump();
            }
            overrides[key] = std::move(encoded);
          }
          config_overrides = std::move(overrides);
        }
      }
      std::string virtual_display_mode = input_tree.value("virtual_display_mode", "");
      std::string virtual_display_layout = input_tree.value("virtual_display_layout", "");
      auto do_cmds = nvhttp::extract_command_entries(input_tree, "do");
      auto undo_cmds = nvhttp::extract_command_entries(input_tree, "undo");
      auto perm = static_cast<crypto::PERM>(input_tree.value("perm", static_cast<uint32_t>(crypto::PERM::_no)) & static_cast<uint32_t>(crypto::PERM::_all));
      bool updated = nvhttp::update_device_info(
        uuid,
        name,
        display_mode,
        output_name_override,
        do_cmds,
        undo_cmds,
        perm,
        enable_legacy_ordering,
        allow_client_commands,
        always_use_virtual_display,
        virtual_display_mode,
        virtual_display_layout,
        prefer_10bit_sdr
      );
      if (config_overrides.has_value() || hdr_profile.has_value()) {
        updated = nvhttp::update_device_info(
          uuid,
          name,
          display_mode,
          output_name_override,
          always_use_virtual_display,
          virtual_display_mode,
          virtual_display_layout,
          std::move(config_overrides),
          prefer_10bit_sdr,
          hdr_profile
        )
                  && updated;
      }
      output_tree["status"] = updated;
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "Update Client: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Unpair a client.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * The body for the POST request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *  "uuid": "<uuid>"
   * }
   * @endcode
   *
   * @api_examples{/api/clients/unpair| POST| {"uuid":"1234"}}
   */
  void unpair(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;
      std::string uuid = input_tree.value("uuid", "");
      output_tree["status"] = nvhttp::unpair_client(uuid);
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "Unpair: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Unpair all clients.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/clients/unpair-all| POST| null}
   */
  void unpairAll(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nvhttp::erase_all_clients();
    proc::proc.terminate();
    nlohmann::json output_tree;
    output_tree["status"] = true;
    send_response(response, output_tree);
  }

  /**
   * @brief Disconnect a client session without unpairing it.
   */
  void disconnectClient(resp_https_t response, req_https_t request) {
    if (!check_content_type(response, request, "application/json")) {
      return;
    }
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();

    try {
      const nlohmann::json input_tree = nlohmann::json::parse(ss);
      nlohmann::json output_tree;
      const std::string uuid = input_tree.value("uuid", "");
      output_tree["status"] = nvhttp::disconnect_client(uuid);
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "DisconnectClient: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Get the list of available display devices.
   * @api_examples{/api/display-devices| GET| [{"device_id":"{...}","display_name":"\\\\.\\DISPLAY1","friendly_name":"Monitor"}, ...]}
   * @note Pass query param detail=full to include extended metadata (refresh lists, inactive displays).
   */
  void getDisplayDevices(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    try {
      display_device::DeviceEnumerationDetail detail = display_device::DeviceEnumerationDetail::Minimal;
      const auto query = request->parse_query_string();
      if (const auto it = query.find("detail"); it != query.end()) {
        const auto value = boost::algorithm::to_lower_copy(it->second);
        if (value == "full") {
          detail = display_device::DeviceEnumerationDetail::Full;
        }
      } else if (const auto full_it = query.find("full"); full_it != query.end()) {
        const auto value = boost::algorithm::to_lower_copy(full_it->second);
        if (value == "1" || value == "true" || value == "yes") {
          detail = display_device::DeviceEnumerationDetail::Full;
        }
      }

      const auto json_str = display_helper_integration::enumerate_devices_json(detail);
      nlohmann::json tree = nlohmann::json::parse(json_str);
      send_response(response, tree);
    } catch (const std::exception &e) {
      nlohmann::json tree;
      tree["status"] = false;
      tree["error"] = std::string {"Failed to enumerate display devices: "} + e.what();
      send_response(response, tree);
    }
  }

  /**
   * @brief Validate refresh capabilities for a display via EDID for frame generation health checks.
   * @api_examples{/api/framegen/edid-refresh?device_id=\\.\DISPLAY1| GET| {"status":true,"targets":[{"hz":120,"supported":true,"method":"range"}]}}
   */
  void getFramegenEdidRefresh(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    try {
      const auto query = request->parse_query_string();
      auto read_first = [&](std::initializer_list<std::string> keys) -> std::string {
        for (const auto &key : keys) {
          const auto it = query.find(key);
          if (it != query.end()) {
            auto value = boost::algorithm::trim_copy(it->second);
            if (!value.empty()) {
              return value;
            }
          }
        }
        return {};
      };

      std::string device_hint = read_first({"device_id", "device", "id", "display"});
      if (device_hint.empty()) {
        bad_request(response, request, "device_id query parameter is required");
        return;
      }

      std::vector<int> targets {120, 180, 240, 288};
      if (const auto it = query.find("targets"); it != query.end()) {
        std::vector<int> parsed;
        std::vector<std::string> parts;
        boost::split(parts, it->second, boost::is_any_of(","));
        for (auto part : parts) {
          boost::algorithm::trim(part);
          if (part.empty()) {
            continue;
          }
          try {
            int hz = std::stoi(part);
            if (hz > 0) {
              parsed.push_back(hz);
            }
          } catch (...) {
            // ignore invalid entries
          }
        }
        if (!parsed.empty()) {
          targets = std::move(parsed);
        }
      }

      auto result = display_helper_integration::framegen_edid_refresh_support(device_hint, targets);
      nlohmann::json out;
      if (!result) {
        out["status"] = false;
        out["error"] = "Display device not found for EDID refresh validation.";
        send_response(response, out);
        return;
      }

      out["status"] = true;
      out["device_id"] = result->device_id;
      out["device_label"] = result->device_label;
      out["edid_present"] = result->edid_present;
      if (result->max_vertical_hz) {
        out["max_vertical_hz"] = *result->max_vertical_hz;
      }
      if (result->max_timing_hz) {
        out["max_timing_hz"] = *result->max_timing_hz;
      }

      nlohmann::json targets_json = nlohmann::json::array();
      for (const auto &entry : result->targets) {
        nlohmann::json target_json;
        target_json["hz"] = entry.hz;
        target_json["supported"] = entry.supported.has_value() ? nlohmann::json(*entry.supported) : nlohmann::json(nullptr);
        target_json["method"] = entry.method;
        targets_json.push_back(std::move(target_json));
      }
      out["targets"] = std::move(targets_json);

      send_response(response, out);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    } catch (...) {
      bad_request(response, request, "Failed to validate display refresh via EDID.");
    }
  }

  /**
   * @brief Export the current Windows display settings as a golden restore snapshot.
   * @api_examples{/api/display/export_golden| POST| {"status":true}}
   */
  void postExportGoldenDisplay(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json")) {
      return;
    }
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    print_req(request);
    nlohmann::json out;
    try {
      const bool ok = display_helper_integration::export_golden_restore();
      out["status"] = ok;
    } catch (...) {
      out["status"] = false;
    }
    send_response(response, out);
  }

  /**
   * @brief Manually trigger display configuration restore (revert virtual display and restore monitors).
   *
   * Equivalent to pressing the restore hotkey. Removes any active virtual displays and reverts
   * the display configuration to the golden snapshot state.
   *
   * @api_examples{/api/display/restore| POST| {"status":true,"reverted":true,"virtual_displays_removed":true}}
   */
  void postRestoreDisplay(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
#ifdef _WIN32
    nlohmann::json out;
    try {
      const auto cleanup = platf::virtual_display_cleanup::run(
        "api_restore",
        true,  // revert_display_config
        platf::virtual_display_cleanup::revert_order_t::restore_before_remove,
        true   // force
      );
      out["status"] = true;
      out["reverted"] = cleanup.helper_revert_dispatched;
      out["virtual_displays_removed"] = cleanup.virtual_displays_removed;
      out["database_restore_applied"] = cleanup.database_restore_applied;
      send_response(response, out);
    } catch (const std::exception &e) {
      out["status"] = false;
      out["error"] = e.what();
      send_response(response, out);
    } catch (...) {
      out["status"] = false;
      out["error"] = "Unknown error during display restore.";
      send_response(response, out);
    }
#else
    nlohmann::json out;
    out["status"] = false;
    out["error"] = "Display restore is only available on Windows.";
    send_response(response, out);
#endif
  }

  void getGoldenStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    print_req(request);
    nlohmann::json out;
    bool exists = false;
    std::optional<int> snapshot_version;
    bool has_layout = false;
    bool needs_layout_upgrade = false;
    try {
      for (const auto &p : golden_snapshot_candidates()) {
        if (file_exists_nofail(p)) {
          exists = true;
          if (auto root = read_json_file_nofail(p)) {
            snapshot_version = parse_snapshot_version(*root);
            has_layout = snapshot_has_layout_data(*root);
            const bool latest_schema = snapshot_version && *snapshot_version >= kGoldenSnapshotLatestVersion;
            needs_layout_upgrade = !latest_schema || !has_layout;
          } else {
            needs_layout_upgrade = true;
          }
          break;
        }
      }
    } catch (...) {
    }
    out["exists"] = exists;
    out["snapshot_version"] = snapshot_version ? nlohmann::json(*snapshot_version) : nlohmann::json(nullptr);
    out["latest_snapshot_version"] = kGoldenSnapshotLatestVersion;
    out["has_layout"] = has_layout;
    out["needs_layout_upgrade"] = needs_layout_upgrade;
    send_response(response, out);
  }

  void deleteGolden(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    print_req(request);
    nlohmann::json out;
    bool any_deleted = false;
    try {
      for (const auto &p : golden_snapshot_candidates()) {
        if (file_exists_nofail(p)) {
          std::error_code ec;
          std::filesystem::remove(p, ec);
          if (!ec) {
            any_deleted = true;
          }
        }
      }
    } catch (...) {
    }
    out["deleted"] = any_deleted;
    send_response(response, out);
  }

  /**
   * @brief Get the configuration settings.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void getConfig(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["platform"] = SUNSHINE_PLATFORM;
    output_tree["version"] = PROJECT_VERSION;
#ifdef _WIN32
    output_tree["vdisplayStatus"] = (int) proc::vDisplayDriverStatus;
#endif
    auto vars = config::parse_config(file_handler::read_file(config::sunshine.config_file.c_str()));
    for (auto &[name, value] : vars) {
      output_tree[name] = value;
    }

    // Strip sensitive fields for non-admin users (viewers/operators)
    auto auth_result = check_auth(request);
    bool is_admin = (auth_result.auth_source == AuthSource::session ||
                     auth_result.auth_source == AuthSource::api_token);
    if (!is_admin && auth_result.auth_source == AuthSource::cloud_jwt && !auth_result.user_id.empty()) {
      auto role = rbac::registry.get_role(auth_result.user_id);
      is_admin = role.has_value() && role.value() == rbac::Role::admin;
    }
    if (!is_admin) {
      static const std::vector<std::string> sensitive_keys = {
        "password", "credentials_file", "cloud_user_token",
        "key_dir", "cert", "pkey", "api_token",
        "steam_server_api_key"
      };
      for (const auto &key : sensitive_keys) {
        if (output_tree.contains(key)) {
          output_tree[key] = "********";
        }
      }
    }

    send_response(response, output_tree);
  }

  /**
   * @brief Save the configuration settings.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * The body for the post request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "key": "value"
   * }
   * @endcode
   *
   * @attention{It is recommended to ONLY save the config settings that differ from the default behavior.}
   *
   * @api_examples{/api/config| POST| {"key":"value"}}
   */
  void saveConfig(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json")) {
      return;
    }
    // Writing the config can remove cloud credentials, the origin ACL and the
    // listening port. That is an admin action, not merely an authenticated one.
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      // TODO: Input Validation
      std::stringstream config_stream;
      nlohmann::json output_tree;
      nlohmann::json input_tree = nlohmann::json::parse(ss);

      // Merge over the existing file rather than replacing it. A body carrying
      // a subset of keys used to delete every key it omitted — cloud_user_token,
      // credentials_file, origin_web_ui_allowed, port — silently locking the
      // owner out of their own server.
      std::unordered_map<std::string, std::string> current = config::parse_config(
        file_handler::read_file(config::sunshine.config_file.c_str())
      );

      for (const auto &[k, v] : input_tree.items()) {
        if (v.is_null() || (v.is_string() && v.get<std::string>().empty())) {
          continue;
        }
        // Never persist the mask getConfig() hands to non-admin readers.
        if (v.is_string() && v.get<std::string>() == "********") {
          BOOST_LOG(warning) << "saveConfig: ignoring masked value for key ["sv << k << ']';
          continue;
        }

        // v.dump() will dump valid json, which we do not want for strings in the config right now
        // we should migrate the config file to straight json and get rid of all this nonsense
        current[k] = v.is_string() ? v.get<std::string>() : v.dump();
      }

      for (const auto &kv : current) {
        config_stream << kv.first << " = " << kv.second << std::endl;
      }
      file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());

      // Detect restart-required keys
      static const std::set<std::string> restart_required_keys = {
        "port",
        "address_family",
        "upnp",
        "pkey",
        "cert",
        "cloud_supabase_url",
        "cloud_supabase_key",
        // cloud_user_token and cloud_heartbeat_interval are hot-reloaded below
        // without a full process restart.
      };
      bool restart_required = false;
      for (const auto &[k, _] : input_tree.items()) {
        if (restart_required_keys.count(k)) {
          restart_required = true;
          break;
        }
      }

      bool applied_now = false;
      bool deferred = false;

      if (!restart_required) {
        if (rtsp_stream::session_count() == 0) {
          // Apply immediately
          config::apply_config_now();
          applied_now = true;
        } else {
          config::mark_deferred_reload();
          deferred = true;
        }
      }

      output_tree["status"] = true;
      output_tree["appliedNow"] = applied_now;
      output_tree["deferred"] = deferred;
      output_tree["restartRequired"] = restart_required;
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "SaveConfig: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Partial update of configuration (PATCH /api/config).
   * Merges provided JSON object into the existing key=value style config file.
   * Removes keys when value is null or an empty string. Detects whether a
   * restart is required and attempts to apply immediately when safe.
   */
  void patchConfig(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json")) {
      return;
    }
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json output_tree;
      nlohmann::json patch_tree = nlohmann::json::parse(ss);
      if (!patch_tree.is_object()) {
        bad_request(response, request, "PATCH body must be a JSON object");
        return;
      }

      // Load existing config into a map
      std::unordered_map<std::string, std::string> current = config::parse_config(
        file_handler::read_file(config::sunshine.config_file.c_str())
      );

      // Track which keys are being modified to detect restart requirements
      std::set<std::string> changed_keys;

      for (auto it = patch_tree.begin(); it != patch_tree.end(); ++it) {
        const std::string key = it.key();
        const nlohmann::json &val = it.value();
        changed_keys.insert(key);

        // Remove key when explicitly null or empty string
        if (val.is_null() || (val.is_string() && val.get<std::string>().empty())) {
          auto curIt = current.find(key);
          if (curIt != current.end()) {
            current.erase(curIt);
          }
          continue;
        }

        // Persist value: strings are raw, non-strings are dumped as JSON
        if (val.is_string()) {
          current[key] = val.get<std::string>();
        } else {
          current[key] = val.dump();
        }
      }

      // Write back full merged config file
      std::stringstream config_stream;
      for (const auto &kv : current) {
        config_stream << kv.first << " = " << kv.second << std::endl;
      }
      file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());

      // Detect restart-required keys.
      // Kept in sync with saveConfig: the heartbeat thread captures the
      // Supabase URL and key by value at start, so changing them mid-flight
      // leaves auth on the new endpoint and the heartbeat on the old one.
      static const std::set<std::string> restart_required_keys = {
        "port",
        "address_family",
        "upnp",
        "pkey",
        "cert",
        "cloud_supabase_url",
        "cloud_supabase_key"
      };
      bool restart_required = false;
      for (const auto &k : changed_keys) {
        if (restart_required_keys.count(k)) {
          restart_required = true;
          break;
        }
      }

      bool applied_now = false;
      bool deferred = false;
      if (!restart_required) {
        // Determine if only Playnite-related keys were changed; these are safe to hot-apply
        // even when a streaming session is active.
        bool only_playnite = !changed_keys.empty();
        for (const auto &k : changed_keys) {
          if (k.rfind("playnite_", 0) != 0) {
            only_playnite = false;
            break;
          }
        }
        if (only_playnite || rtsp_stream::session_count() == 0) {
          // Apply immediately
          config::apply_config_now();
          applied_now = true;
        } else {
          config::mark_deferred_reload();
          deferred = true;
        }
      }

      output_tree["status"] = true;
      output_tree["appliedNow"] = applied_now;
      output_tree["deferred"] = deferred;
      output_tree["restartRequired"] = restart_required;
      send_response(response, output_tree);

      // Hot-reload the cloud heartbeat when token or interval changed without
      // requiring a full process restart.  We update the in-memory config values
      // directly (config::cloud.*) and ask the cloud agent to restart its thread.
      // This only runs when the cloud URL/key are NOT also being changed (those
      // still require a full restart via restart_required_keys above).
      static const std::set<std::string> cloud_hot_keys = {
        "cloud_user_token",
        "cloud_heartbeat_interval",
      };
      bool cloud_hot_reload = false;
      for (const auto &k : changed_keys) {
        if (cloud_hot_keys.count(k)) {
          cloud_hot_reload = true;
          break;
        }
      }
      if (cloud_hot_reload && !restart_required) {
        if (patch_tree.contains("cloud_user_token") && patch_tree["cloud_user_token"].is_string()) {
          config::cloud.user_token = patch_tree["cloud_user_token"].get<std::string>();
        }
        if (patch_tree.contains("cloud_heartbeat_interval") && patch_tree["cloud_heartbeat_interval"].is_number_integer()) {
          config::cloud.heartbeat_interval = patch_tree["cloud_heartbeat_interval"].get<int>();
        }
        cloud::CloudConfig new_cfg {
          config::cloud.supabase_url,
          config::cloud.supabase_key,
          config::cloud.user_token,
          config::cloud.heartbeat_interval,
        };
        BOOST_LOG(info) << "CloudAgent: cloud_user_token refreshed via API; hot-reloading heartbeat.";
        cloud::restart_heartbeat(new_cfg);
      }
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "PatchConfig: "sv << e.what();
      bad_request(response, request, e.what());
      return;
    }
  }

  /**
   * @brief Get immutables metadata about the server.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/meta| GET| null}
   */
  void getMetadata(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["platform"] = SUNSHINE_PLATFORM;
    output_tree["version"] = PROJECT_VERSION;
    output_tree["commit"] = PROJECT_VERSION_COMMIT;
#ifdef PROJECT_VERSION_PRERELEASE
    output_tree["prerelease"] = PROJECT_VERSION_PRERELEASE;
#else
    output_tree["prerelease"] = "";
#endif
#ifdef PROJECT_VERSION_BRANCH
    output_tree["branch"] = PROJECT_VERSION_BRANCH;
#else
    output_tree["branch"] = "unknown";
#endif
    // Build/release date provided by CMake (ISO 8601 when available)
    output_tree["release_date"] = PROJECT_RELEASE_DATE;
#if defined(_WIN32)
    try {
      const auto gpus = platf::enumerate_gpus();
      if (!gpus.empty()) {
        nlohmann::json gpu_array = nlohmann::json::array();
        bool has_nvidia = false;
        bool has_amd = false;
        bool has_intel = false;

        for (const auto &gpu : gpus) {
          nlohmann::json gpu_entry;
          gpu_entry["description"] = gpu.description;
          gpu_entry["vendor_id"] = gpu.vendor_id;
          gpu_entry["device_id"] = gpu.device_id;
          gpu_entry["dedicated_video_memory"] = gpu.dedicated_video_memory;
          gpu_array.push_back(std::move(gpu_entry));

          switch (gpu.vendor_id) {
            case 0x10DE:  // NVIDIA
              has_nvidia = true;
              break;
            case 0x1002:  // AMD/ATI
            case 0x1022:  // AMD alternative PCI vendor ID (APUs)
              has_amd = true;
              break;
            case 0x8086:  // Intel
              has_intel = true;
              break;
            default:
              break;
          }
        }

        output_tree["gpus"] = std::move(gpu_array);
        output_tree["has_nvidia_gpu"] = has_nvidia;
        output_tree["has_amd_gpu"] = has_amd;
        output_tree["has_intel_gpu"] = has_intel;
      }

      const auto version = platf::query_windows_version();
      if (!version.display_version.empty()) {
        output_tree["windows_display_version"] = version.display_version;
      }
      if (!version.release_id.empty()) {
        output_tree["windows_release_id"] = version.release_id;
      }
      if (!version.product_name.empty()) {
        output_tree["windows_product_name"] = version.product_name;
      }
      if (!version.current_build.empty()) {
        output_tree["windows_current_build"] = version.current_build;
      }
      if (version.build_number.has_value()) {
        output_tree["windows_build_number"] = version.build_number.value();
      }
      if (version.major_version.has_value()) {
        output_tree["windows_major_version"] = version.major_version.value();
      }
      if (version.minor_version.has_value()) {
        output_tree["windows_minor_version"] = version.minor_version.value();
      }
    } catch (...) {
      // Non-fatal; keep metadata response minimal if enumeration fails.
    }
#endif
    send_response(response, output_tree);
  }

  /**
   * @brief Get the locale setting. This endpoint does not require authentication.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/configLocale| GET| null}
   */
  void getLocale(resp_https_t response, req_https_t request) {
    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["locale"] = config::sunshine.locale;
    send_response(response, output_tree);
  }

  /**
   * @brief Restart Jujo.Stream Server.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/restart| POST| null}
   */
  void restart(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["message"] = "Server restart initiated.";
    send_response(response, output_tree);

    proc::proc.terminate();

    // We may not return from this call
    platf::restart();
  }

  /**
   * @brief Quit Jujo.Stream Server.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * On Windows, if running in a service, a special shutdown code is returned.
   */
  void quit(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }

    print_req(request);

    BOOST_LOG(warning) << "Requested quit from config page!"sv;

    proc::proc.terminate();

#ifdef _WIN32
    if (GetConsoleWindow() == NULL) {
      lifetime::exit_sunshine(ERROR_SHUTDOWN_IN_PROGRESS, true);
    } else
#endif
    {
      lifetime::exit_sunshine(0, true);
    }
    // If exit fails, write a response after 5 seconds.
    std::thread write_resp([response] {
      std::this_thread::sleep_for(5s);
      response->write();
    });
    write_resp.detach();
  }

  /**
   * @brief Reset the display device persistence.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/reset-display-device-persistence| POST| null}
   */
  void resetDisplayDevicePersistence(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = display_helper_integration::reset_persistence();
    send_response(response, output_tree);
  }

} // namespace confighttp
