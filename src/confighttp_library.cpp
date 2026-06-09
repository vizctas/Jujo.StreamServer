
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
#ifdef _WIN32
#include "platform/windows/image_convert.h"
#endif
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
   * @brief Get the list of available applications.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/apps| GET| null}
   */
  void getApps(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);

      file_tree["current_app"] = proc::proc.get_running_app_uuid();
      file_tree["host_uuid"] = http::unique_id;
      file_tree["host_name"] = config::nvhttp.sunshine_name;
#ifdef _WIN32
      // No auto-insert here; controlled by config 'playnite_fullscreen_entry_enabled'.
#endif

      // Legacy versions of Sunshine used strings for boolean and integers, let's convert them
      // List of keys to convert to boolean
      std::vector<std::string> boolean_keys = {
        "exclude-global-prep-cmd",
        "exclude-global-state-cmd",
        "elevated",
        "auto-detach",
        "wait-all",
        "terminate-on-pause",
        "virtual-display",
        "allow-client-commands",
        "use-app-identity",
        "per-client-app-identity",
        "gen1-framegen-fix",
        "gen2-framegen-fix",
        "dlss-framegen-capture-fix",  // backward compatibility
        "lossless-scaling-enabled",
        "lossless-scaling-framegen",
        "lossless-scaling-legacy-auto-detect"
      };

      // List of keys to convert to integers
      std::vector<std::string> integer_keys = {
        "exit-timeout",
        "lossless-scaling-target-fps",
        "lossless-scaling-rtss-limit",
        "scale-factor",
        "lossless-scaling-launch-delay"
      };

      bool mutated = false;
      auto normalize_lossless_profile_overrides = [](nlohmann::json &node) -> bool {
        if (!node.is_object()) {
          return false;
        }
        bool changed = false;
        auto convert_int = [&](const char *key) {
          if (!node.contains(key)) {
            return;
          }
          auto &value = node[key];
          if (value.is_string()) {
            try {
              value = std::stoi(value.get<std::string>());
              changed = true;
            } catch (...) {
            }
          }
        };
        auto convert_bool = [&](const char *key) {
          if (!node.contains(key)) {
            return;
          }
          auto &value = node[key];
          if (value.is_string()) {
            auto text = value.get<std::string>();
            if (text == "true" || text == "false") {
              value = (text == "true");
              changed = true;
            } else if (text == "1" || text == "0") {
              value = (text == "1");
              changed = true;
            }
          }
        };
        convert_bool("performance-mode");
        convert_int("flow-scale");
        convert_int("resolution-scale");
        convert_int("sharpening");
        convert_bool("anime4k-vrs");
        if (node.contains("scaling-type") && node["scaling-type"].is_string()) {
          auto text = node["scaling-type"].get<std::string>();
          boost::algorithm::to_lower(text);
          node["scaling-type"] = text;
          changed = true;
        }
        if (node.contains("anime4k-size") && node["anime4k-size"].is_string()) {
          auto text = node["anime4k-size"].get<std::string>();
          boost::algorithm::to_upper(text);
          node["anime4k-size"] = text;
          changed = true;
        }
        return changed;
      };
      // Walk fileTree and convert true/false strings to boolean or integer values
      for (auto &app : file_tree["apps"]) {
        for (const auto &key : boolean_keys) {
          if (app.contains(key) && app[key].is_string()) {
            app[key] = app[key] == "true";
            mutated = true;
          }
        }
        for (const auto &key : integer_keys) {
          if (app.contains(key) && app[key].is_string()) {
            app[key] = std::stoi(app[key].get<std::string>());
            mutated = true;
          }
        }
        if (app.contains("lossless-scaling-recommended")) {
          mutated = normalize_lossless_profile_overrides(app["lossless-scaling-recommended"]) || mutated;
        }
        if (app.contains("lossless-scaling-custom")) {
          mutated = normalize_lossless_profile_overrides(app["lossless-scaling-custom"]) || mutated;
        }
        if (app.contains("prep-cmd")) {
          for (auto &prep : app["prep-cmd"]) {
            if (prep.contains("elevated") && prep["elevated"].is_string()) {
              prep["elevated"] = prep["elevated"] == "true";
              mutated = true;
            }
          }
        }
        if (app.contains("state-cmd")) {
          for (auto &state : app["state-cmd"]) {
            if (state.contains("elevated") && state["elevated"].is_string()) {
              state["elevated"] = state["elevated"] == "true";
              mutated = true;
            }
          }
        }
        // Ensure each app has a UUID (auto-insert if missing/empty)
        if (!app.contains("uuid") || app["uuid"].is_null() || (app["uuid"].is_string() && app["uuid"].get<std::string>().empty())) {
          app["uuid"] = uuid_util::uuid_t::generate().string();
          mutated = true;
        }
      }

      // Add computed app ids for UI clients (best-effort, do not persist).
      if (file_tree.contains("apps") && file_tree["apps"].is_array()) {
        try {
          const auto apps_snapshot = proc::proc.get_apps();
          const auto count = std::min(file_tree["apps"].size(), apps_snapshot.size());
          for (size_t idx = 0; idx < count; ++idx) {
            auto &app = file_tree["apps"][idx];
            app["id"] = apps_snapshot[idx].id;
            app["index"] = static_cast<int>(idx);
          }
        } catch (...) {
        }
      }

      // If any normalization occurred, persist back to disk
      if (mutated) {
        try {
          proc::write_apps_file(config::stream.file_apps, file_tree);
        } catch (std::exception &e) {
          BOOST_LOG(warning) << "GetApps persist normalization failed: "sv << e.what();
        }
      }

      if (file_tree.contains("apps") && file_tree["apps"].is_array()) {
        file_tree["apps"] = visible_apps_for_current_sources(file_tree["apps"]);
      }

      send_response(response, file_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "GetApps: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Save an application. To save a new application the index must be `-1`. To update an existing application, you must provide the current index of the application.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * The body for the post request should be JSON serialized in the following format:
   * @code{.json}
   * {
   *   "name": "Application Name",
   *   "output": "Log Output Path",
   *   "cmd": "Command to run the application",
   *   "exclude-global-prep-cmd": false,
   *   "elevated": false,
   *   "auto-detach": true,
   *   "wait-all": true,
   *   "exit-timeout": 5,
   *   "prep-cmd": [
   *     {
   *       "do": "Command to prepare",
   *       "undo": "Command to undo preparation",
   *       "elevated": false
   *     }
   *   ],
   *   "detached": [
   *     "Detached command"
   *   ],
   *   "image-path": "Full path to the application image. Must be a png file.",
   *   "uuid": "aaaa-bbbb"
   * }
   * @endcode
   *
   * @api_examples{/api/apps| POST| {"name":"Hello, World!","uuid": "aaaa-bbbb"}}
   */
  void saveApp(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();

    BOOST_LOG(info) << config::stream.file_apps;
    try {
      // TODO: Input Validation

      // Read the input JSON from the request body.
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      const int index = input_tree.value("index", -1);

      // Read the existing apps file.
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);

      // Migrate/merge the new app into the file tree.
      proc::migrate_apps(&file_tree, &input_tree);

      if (input_tree.contains("config-overrides") && input_tree["config-overrides"].is_object()) {
        auto &overrides = input_tree["config-overrides"];
        if (overrides.contains("nvenc_force_split_encode") && !overrides.contains("nvenc_split_encode")) {
          overrides["nvenc_split_encode"] = overrides["nvenc_force_split_encode"];
        }
        overrides.erase("nvenc_force_split_encode");
      }

      // If image-path omitted but we have a Playnite id, let Playnite helper resolve a cover (Windows)
#ifdef _WIN32
      enhance_app_with_playnite_cover(input_tree);
      try {
        if (input_tree.contains("playnite-id") && input_tree["playnite-id"].is_string()) {
          const auto playnite_id = input_tree["playnite-id"].get<std::string>();
          if (!playnite_id.empty()) {
            input_tree["uuid"] = platf::playnite::sync::canonical_playnite_app_uuid(playnite_id);
          }
        }
      } catch (...) {}
#endif

#ifndef _WIN32
      if ((input_tree.contains("gen1-framegen-fix") && input_tree["gen1-framegen-fix"].is_boolean() && input_tree["gen1-framegen-fix"].get<bool>()) ||
          (input_tree.contains("dlss-framegen-capture-fix") && input_tree["dlss-framegen-capture-fix"].is_boolean() && input_tree["dlss-framegen-capture-fix"].get<bool>())) {
        bad_request(response, request, "Frame generation capture fixes are only supported on Windows hosts.");
        return;
      }
      if (input_tree.contains("gen2-framegen-fix") && input_tree["gen2-framegen-fix"].is_boolean() && input_tree["gen2-framegen-fix"].get<bool>()) {
        bad_request(response, request, "Frame generation capture fixes are only supported on Windows hosts.");
        return;
      }
#else
      // Migrate old field name to new for backward compatibility
      if (input_tree.contains("dlss-framegen-capture-fix") && !input_tree.contains("gen1-framegen-fix")) {
        input_tree["gen1-framegen-fix"] = input_tree["dlss-framegen-capture-fix"];
      }
      // Remove old field to avoid duplication
      input_tree.erase("dlss-framegen-capture-fix");
#endif

      auto &apps_node = file_tree["apps"];
      if (!apps_node.is_array()) {
        apps_node = nlohmann::json::array();
      }
      input_tree.erase("index");

      std::string input_uuid;
      try {
        if (input_tree.contains("uuid") && input_tree["uuid"].is_string()) {
          input_uuid = input_tree["uuid"].get<std::string>();
        }
      } catch (...) {}

      bool replaced = false;
      if (!input_uuid.empty()) {
        for (auto it = apps_node.begin(); it != apps_node.end(); ++it) {
          try {
            if (it->contains("uuid") && (*it)["uuid"].is_string() && (*it)["uuid"].get<std::string>() == input_uuid) {
              *it = input_tree;
              replaced = true;
              break;
            }
          } catch (...) {}
        }
      }

      if (replaced) {
        // Already updated in-place via UUID. Nothing more to do.
      } else if (index == -1) {
        if (input_uuid.empty()) {
          input_uuid = uuid_util::uuid_t::generate().string();
          input_tree["uuid"] = input_uuid;
        }
        apps_node.push_back(input_tree);
      } else {
        nlohmann::json newApps = nlohmann::json::array();
        for (size_t i = 0; i < apps_node.size(); ++i) {
          if (i == index) {
            try {
              if ((!input_tree.contains("uuid") || input_tree["uuid"].is_null() || (input_tree["uuid"].is_string() && input_tree["uuid"].get<std::string>().empty())) &&
                  apps_node[i].contains("uuid") && apps_node[i]["uuid"].is_string()) {
                input_tree["uuid"] = apps_node[i]["uuid"].get<std::string>();
              }
            } catch (...) {}
            newApps.push_back(input_tree);
          } else {
            newApps.push_back(apps_node[i]);
          }
        }
        file_tree["apps"] = newApps;
      }

      // Update apps file and refresh client cache
      confighttp::refresh_client_apps_cache(file_tree);

      // Prepare and send the output response.
      nlohmann::json outputTree;
      outputTree["status"] = true;
      send_response(response, outputTree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "SaveApp: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Delete an application.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/apps/delete | POST| { uuid: 'aaaa-bbbb' }}
   */
  void deleteApp(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    const bool is_delete_method = request->method == "DELETE";
    std::optional<size_t> index_from_path;
    if (request->path_match.size() > 1) {
      try {
        index_from_path = static_cast<size_t>(std::stoul(request->path_match[1]));
      } catch (...) {
      }
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    std::string raw_body = ss.str();

    std::optional<std::string> uuid;
    std::optional<size_t> index_from_body;

    if (!raw_body.empty()) {
      if (!validateContentType(response, request, "application/json")) {
        return;
      }
      try {
        nlohmann::json input_tree = nlohmann::json::parse(raw_body);
        if (input_tree.contains("uuid") && input_tree["uuid"].is_string()) {
          uuid = input_tree["uuid"].get<std::string>();
        }
        if (input_tree.contains("index") && input_tree["index"].is_number_integer()) {
          auto idx = input_tree["index"].get<std::int64_t>();
          if (idx >= 0) {
            index_from_body = static_cast<size_t>(idx);
          }
        }
      } catch (const std::exception &e) {
        bad_request(response, request, e.what());
        return;
      }
    } else if (!is_delete_method) {
      bad_request(response, request, "Missing request body");
      return;
    }

    std::optional<size_t> target_index = index_from_body ? index_from_body : index_from_path;

    // Detect if the app being removed is the Playnite fullscreen launcher
    auto is_playnite_fullscreen = [](const nlohmann::json &app) -> bool {
      try {
        if (app.contains("playnite-fullscreen") && app["playnite-fullscreen"].is_boolean() && app["playnite-fullscreen"].get<bool>()) {
          return true;
        }
        if (app.contains("cmd") && app["cmd"].is_string()) {
          auto s = app["cmd"].get<std::string>();
          if (s.find("playnite-launcher") != std::string::npos && s.find("--fullscreen") != std::string::npos) {
            return true;
          }
        }
        if (app.contains("name") && app["name"].is_string() && app["name"].get<std::string>() == "Playnite (Fullscreen)") {
          return true;
        }
      } catch (...) {}
      return false;
    };

    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      if (!file_tree.contains("apps") || !file_tree["apps"].is_array()) {
        bad_request(response, request, "Apps configuration missing or invalid");
        return;
      }

      auto &apps_node = file_tree["apps"];
      nlohmann::json::array_t new_apps;
      new_apps.reserve(apps_node.size());

      bool removed = false;
      bool disabled_fullscreen_flag = false;

      for (size_t i = 0; i < apps_node.size(); ++i) {
        const auto &app_entry = apps_node[i];
        auto app_uuid = app_entry.contains("uuid") && app_entry["uuid"].is_string() ? app_entry["uuid"].get<std::string>() : std::string {};

        bool match = false;
        if (uuid && !uuid->empty()) {
          match = app_uuid == *uuid;
        } else if (!uuid && target_index && *target_index == i) {
          match = true;
          if (!app_uuid.empty()) {
            uuid = app_uuid;
          }
        }

        if (!match) {
          new_apps.push_back(app_entry);
          continue;
        }

        removed = true;

#ifdef _WIN32
        try {
          if (is_playnite_fullscreen(app_entry)) {
            auto current_cfg = config::parse_config(file_handler::read_file(config::sunshine.config_file.c_str()));
            current_cfg["playnite_fullscreen_entry_enabled"] = "false";
            std::stringstream config_stream;
            for (const auto &kv : current_cfg) {
              config_stream << kv.first << " = " << kv.second << std::endl;
            }
            file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());
            config::apply_config_now();
            disabled_fullscreen_flag = true;
          }
        } catch (...) {
        }
#endif
      }

      if (!removed) {
        bad_request(response, request, "App to delete not found");
        return;
      }

      file_tree["apps"] = new_apps;
      proc::write_apps_file(config::stream.file_apps, file_tree);
      proc::refresh(config::stream.file_apps, false);

      nlohmann::json output_tree;
      output_tree["status"] = true;
      if (disabled_fullscreen_flag) {
        output_tree["playniteFullscreenDisabled"] = true;
      }
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "DeleteApp: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  void getAppCover(resp_https_t response, req_https_t request);

#ifdef _WIN32
  // Forward declarations for Playnite handlers implemented in confighttp_playnite.cpp
  void getPlayniteStatus(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void installPlaynite(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void uninstallPlaynite(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void getPlayniteGames(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void getPlayniteCategories(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void postPlayniteForceSync(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void postPlayniteLaunch(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  // Helper to keep confighttp.cpp free of Playnite details
  void enhance_app_with_playnite_cover(nlohmann::json &input_tree);
  // New: download Playnite-related logs as a ZIP

  // RTSS status endpoint (Windows-only)
  void getRtssStatus(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void getLosslessScalingStatus(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void downloadPlayniteLogs(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void getCrashDumpStatus(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void postCrashDumpDismiss(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void getCrashBundleManifest(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  void downloadCrashBundle(std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response> response, std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request> request);
  // Display helper: export current OS state as golden restore snapshot
  void postExportGoldenDisplay(resp_https_t response, req_https_t request);
  void postRestoreDisplay(resp_https_t response, req_https_t request);
  // Helper log readers (Windows-only)
  bool is_helper_log_source(const std::string &source);
  bool read_helper_log(const std::string &source, std::string &out);
#endif

  enum class op_e {
    ADD,  ///< Add client
    REMOVE  ///< Remove client
  };


  /**
   * @brief Log the request details.
   * @param request The HTTP request object.
   */
  void print_req(const req_https_t &request) {
    BOOST_LOG(debug) << "HTTP "sv << request->method << ' ' << request->path;

    if (!request->header.empty()) {
      BOOST_LOG(verbose) << "Headers:"sv;
      for (auto &[name, val] : request->header) {
        BOOST_LOG(verbose) << name << " -- "
                           << (name == "Authorization" ? "CREDENTIALS REDACTED" : val);
      }
    }

    auto query = request->parse_query_string();
    if (!query.empty()) {
      BOOST_LOG(verbose) << "Query Params:"sv;
      for (auto &[name, val] : query) {
        BOOST_LOG(verbose) << name << " -- " << val;
      }
    }
  }

  /**
   * @brief Reorder applications.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/apps/reorder| POST| {"order": ["aaaa-bbbb", "cccc-dddd"]}}
   */
  void reorderApps(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    try {
      std::stringstream ss;
      ss << request->content.rdbuf();

      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;

      // Read the existing apps file.
      nlohmann::json fileTree = proc::read_apps_file(config::stream.file_apps);

      // Get the desired order of UUIDs from the request.
      if (!input_tree.contains("order") || !input_tree["order"].is_array()) {
        throw std::runtime_error("Missing or invalid 'order' array in request body");
      }
      const auto &order_uuids_json = input_tree["order"];

      // Get the original apps array from the fileTree.
      // Default to an empty array if "apps" key is missing or if it's present but not an array (after logging an error).
      nlohmann::json original_apps_list = nlohmann::json::array();
      if (fileTree.contains("apps")) {
        if (fileTree["apps"].is_array()) {
          original_apps_list = fileTree["apps"];
        } else {
          // "apps" key exists but is not an array. This is a malformed state.
          BOOST_LOG(error) << "ReorderApps: 'apps' key in apps configuration file ('" << config::stream.file_apps
                           << "') is present but not an array.";
          throw std::runtime_error("'apps' in file is not an array, cannot reorder.");
        }
      } else {
        // "apps" key is missing. Treat as an empty list. Reordering an empty list is valid.
        BOOST_LOG(debug) << "ReorderApps: 'apps' key missing in apps configuration file ('" << config::stream.file_apps
                         << "'). Treating as an empty list for reordering.";
        // original_apps_list is already an empty array, so no specific action needed here.
      }

      nlohmann::json reordered_apps_list = nlohmann::json::array();
      std::vector<bool> item_moved(original_apps_list.size(), false);

      // Phase 1: Place apps according to the 'order' array from the request.
      // Iterate through the desired order of UUIDs.
      for (const auto &uuid_json_value : order_uuids_json) {
        if (!uuid_json_value.is_string()) {
          BOOST_LOG(warning) << "ReorderApps: Encountered a non-string UUID in the 'order' array. Skipping this entry.";
          continue;
        }
        std::string target_uuid = uuid_json_value.get<std::string>();
        bool found_match_for_ordered_uuid = false;

        // Find the first unmoved app in the original list that matches the current target_uuid.
        for (size_t i = 0; i < original_apps_list.size(); ++i) {
          if (item_moved[i]) {
            continue;  // This specific app object has already been placed.
          }

          const auto &app_item = original_apps_list[i];
          // Ensure the app item is an object and has a UUID to match against.
          if (app_item.is_object() && app_item.contains("uuid") && app_item["uuid"].is_string()) {
            if (app_item["uuid"].get<std::string>() == target_uuid) {
              reordered_apps_list.push_back(app_item);  // Add the found app object to the new list.
              item_moved[i] = true;  // Mark this specific object as moved.
              found_match_for_ordered_uuid = true;
              break;  // Found an app for this UUID, move to the next UUID in the 'order' array.
            }
          }
        }

        if (!found_match_for_ordered_uuid) {
          // This means a UUID specified in the 'order' array was not found in the original_apps_list
          // among the currently available (unmoved) app objects.
          // Per instruction "If the uuid is missing from the original json file, omit it."
          BOOST_LOG(debug) << "ReorderApps: UUID '" << target_uuid << "' from 'order' array not found in available apps list or its matching app was already processed. Omitting.";
        }
      }

      // Phase 2: Append any remaining apps from the original list that were not explicitly ordered.
      // These are app objects that were not marked 'item_moved' in Phase 1.
      for (size_t i = 0; i < original_apps_list.size(); ++i) {
        if (!item_moved[i]) {
          reordered_apps_list.push_back(original_apps_list[i]);
        }
      }

      // Update the fileTree with the new, reordered list of apps.
      fileTree["apps"] = reordered_apps_list;

      // Write the modified fileTree back to the apps configuration file.
      proc::write_apps_file(config::stream.file_apps, fileTree);

      // Notify relevant parts of the system that the apps configuration has changed.
      proc::refresh(config::stream.file_apps, false);

      output_tree["status"] = true;
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "ReorderApps: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Get game source connection and sync summary.
   * @api_examples{/api/game-sources| GET| null}
   */
  void getGameSources(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["sources"] = build_game_sources_summary(nlohmann::json::array());
    send_response(response, output_tree);
  }

  /**
   * @brief Begin a provider account connection for a game source.
   * @api_examples{/api/game-sources/steam/connect| POST| null}
   */
  void postGameSourceConnect(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::string source_id;
    if (request->path_match.size() > 1) {
      source_id = request->path_match[1];
    }

    nlohmann::json body = nlohmann::json::object();
    try {
      body = parse_json_request_body(request);
      if (!body.is_object()) {
        body = nlohmann::json::object();
      }
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    nlohmann::json output_tree;
    if (!is_known_game_source(source_id)) {
      output_tree["status"] = false;
      output_tree["error"] = "Unknown game source";
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["sourceId"] = source_id;

    if (source_id == "manual") {
      output_tree["connectionState"] = "available";
      output_tree["action"] = "open_library";
      output_tree["path"] = "/library";
      output_tree["message"] = "Manual games are added from the Library screen.";
      send_response(response, output_tree);
      return;
    }

    if (source_id == "playniteLegacy") {
      auto source_state = source_state_or_empty(read_game_source_states(), source_id);
      if (source_state.value("disabled", false)) {
        source_state["id"] = source_id;
        source_state["disabled"] = false;
        source_state["connectionState"] = "available";
        source_state["syncState"] = "ready";
        source_state["statusMessage"] = "Playnite Legacy entries are available through the compatibility importer.";
        (void) save_game_source_state(source_id, source_state);
      }
      output_tree["connectionState"] = "available";
      output_tree["action"] = "legacy_import";
      output_tree["path"] = "/settings";
      output_tree["message"] = "Use the existing Playnite compatibility importer while first-party store connectors are implemented.";
      send_response(response, output_tree);
      return;
    }

    if (source_id == "xbox" || ((source_id == "epic" || source_id == "gog") && body.value("localOnly", false))) {
      nlohmann::json local_games = nlohmann::json::array();
      if (source_id == "epic") {
        local_games = sync_epic_installed_games();
      } else if (source_id == "gog") {
        local_games = sync_gog_installed_games();
      } else {
        local_games = sync_xbox_installed_games();
      }
      int playable_count = 0;
      for (const auto &game : local_games) {
        if (game.value("playable", false)) {
          ++playable_count;
        }
      }
      const int imported_count = auto_import_installed_provider_games(source_id, local_games);
      auto source_state = source_state_or_empty(read_game_source_states(), source_id);
      source_state["id"] = source_id;
      source_state["connected"] = !local_games.empty();
      source_state["connectionState"] = local_games.empty() ? "not_detected" : "local";
      source_state["syncState"] = "local_ready";
      source_state["lastConnected"] = now_iso8601_utc_string();
      source_state["lastSynced"] = now_iso8601_utc_string();
      source_state["games"] = local_games;
      source_state["ownedGameCount"] = static_cast<int>(local_games.size());
      source_state["installedGameCount"] = static_cast<int>(local_games.size());
      source_state["playableGameCount"] = playable_count;
      source_state["requirements"] = provider_connection_requirements(source_id);
      source_state["statusMessage"] = local_games.empty()
        ? game_source_name(source_id) + " local installs were not found."
        : game_source_name(source_id) + " local installs were detected.";
      (void) save_game_source_state(source_id, source_state);
      output_tree["connectionState"] = source_state["connectionState"];
      output_tree["syncState"] = "local_ready";
      output_tree["ownedGameCount"] = static_cast<int>(local_games.size());
      output_tree["installedGameCount"] = static_cast<int>(local_games.size());
      output_tree["playableGameCount"] = playable_count;
      output_tree["importedGameCount"] = imported_count;
      output_tree["requirements"] = provider_connection_requirements(source_id);
      output_tree["message"] = local_games.empty()
        ? "No local " + game_source_name(source_id) + " installs were found."
        : "Local " + game_source_name(source_id) + " installs were detected and launchable games were imported.";
      send_response(response, output_tree);
      return;
    }

    if (is_store_game_source(source_id) && !vault_encryption_available()) {
      output_tree["status"] = false;
      output_tree["sourceId"] = source_id;
      output_tree["connectionState"] = "requires_action";
      output_tree["error"] = "Encrypted token storage is not available on this platform.";
      output_tree["requirements"] = provider_connection_requirements(source_id);
      send_response(response, output_tree);
      return;
    }

    output_tree["connectionState"] = "requires_action";
    output_tree["action"] = "configure_provider";
    output_tree["authUrl"] = nullptr;
    output_tree["tokenEncrypted"] = false;
    output_tree["requirements"] = provider_connection_requirements(source_id);
    output_tree["vaultProvider"] = vault_provider_name();

    if (source_id == "steam") {
      const auto api_key = json_string_value(body, "apiKey");
      if (!api_key.empty()) {
        std::string encrypted_key;
        if (!encrypt_provider_secret(api_key, encrypted_key)) {
          output_tree["status"] = false;
          output_tree["connectionState"] = "requires_action";
          output_tree["error"] = "Steam API key could not be encrypted on this host.";
          send_response(response, output_tree);
          return;
        }
        auto states = read_game_source_states();
        auto source_state = source_state_or_empty(states, "steam");
        source_state["id"] = "steam";
        source_state["secretConfig"]["apiKeyEncrypted"] = encrypted_key;
        source_state["tokenEncrypted"] = true;
        source_state["vaultProvider"] = vault_provider_name();
        source_state["publicConfig"]["apiKeyConfigured"] = true;
        source_state["statusMessage"] = "Steam private-account fallback key saved. Web login remains the primary library sync path.";
        (void) save_game_source_state("steam", source_state);
        output_tree["tokenEncrypted"] = true;
        output_tree["apiKeyConfigured"] = true;
        if (source_state.value("connected", false)) {
          output_tree["connectionState"] = "connected";
          output_tree["syncState"] = source_state.value("syncState", "not_started");
          output_tree["authUrl"] = nullptr;
          output_tree["message"] = "Steam private-account fallback key saved.";
          send_response(response, output_tree);
          return;
        }
      }
      output_tree["action"] = "browser_login";
      output_tree["authUrl"] = steam_openid_auth_url(request_scheme_and_host(request));
      output_tree["message"] = api_key.empty()
        ? "Open Steam sign-in to connect this account. Library sync uses the browser Steam Store session."
        : "Steam private-account fallback key saved. Open Steam sign-in to connect this account.";
      send_response(response, output_tree);
      return;
    }

    if (source_id == "gog") {
      const auto code = trim_copy(json_string_value(body, "code"));
      if (!code.empty()) {
        nlohmann::json session;
        std::string error;
        const auto redirect_uri = request_scheme_and_host(request) + "/api/game-sources/gog/auth/callback";
        if (!gog_exchange_code(code, redirect_uri, session, error)) {
          output_tree["status"] = false;
          output_tree["connectionState"] = "requires_action";
          output_tree["error"] = error.empty() ? "GOG token exchange failed." : error;
          send_response(response, output_tree);
          return;
        }
        auto source_state = source_state_or_empty(read_game_source_states(), "gog");
        source_state["id"] = "gog";
        source_state["connected"] = true;
        source_state["connectionState"] = "connected";
        source_state["syncState"] = "not_started";
        source_state["publicConfig"]["userId"] = json_string_value(session, "user_id");
        source_state["publicConfig"]["sessionId"] = json_string_value(session, "session_id");
        source_state["lastConnected"] = now_iso8601_utc_string();
        if (!save_oauth_session(source_state, session, error) || !save_game_source_state("gog", source_state)) {
          output_tree["status"] = false;
          output_tree["connectionState"] = "requires_action";
          output_tree["error"] = error.empty() ? "GOG session could not be saved." : error;
          send_response(response, output_tree);
          return;
        }
        output_tree["connectionState"] = "connected";
        output_tree["syncState"] = "not_started";
        output_tree["tokenEncrypted"] = true;
        output_tree["message"] = "GOG account connected. Sync will fetch owned library and merge local installs.";
        send_response(response, output_tree);
        return;
      }
      output_tree["connectionState"] = "connecting";
      output_tree["action"] = "browser_login";
      output_tree["authUrl"] = gog_auth_url(request_scheme_and_host(request));
      output_tree["message"] = "Open GOG sign-in. Local scan remains available through sync.";
      send_response(response, output_tree);
      return;
    }

    if (source_id == "epic") {
      std::string grant_type;
      std::string token_value;
      if (!trim_copy(json_string_value(body, "authorizationCode")).empty()) {
        grant_type = "authorization_code";
        token_value = trim_copy(json_string_value(body, "authorizationCode"));
      } else if (!trim_copy(json_string_value(body, "code")).empty()) {
        grant_type = "authorization_code";
        token_value = trim_copy(json_string_value(body, "code"));
      } else if (!trim_copy(json_string_value(body, "exchangeCode")).empty()) {
        grant_type = "exchange_code";
        token_value = trim_copy(json_string_value(body, "exchangeCode"));
      } else if (!trim_copy(json_string_value(body, "refreshToken")).empty()) {
        grant_type = "refresh_token";
        token_value = trim_copy(json_string_value(body, "refreshToken"));
      }
      if (!token_value.empty()) {
        nlohmann::json session;
        std::string error;
        if (!epic_start_session(grant_type, token_value, session, error)) {
          output_tree["status"] = false;
          output_tree["connectionState"] = "requires_action";
          output_tree["error"] = error.empty() ? "Epic token exchange failed." : error;
          send_response(response, output_tree);
          return;
        }
        auto source_state = source_state_or_empty(read_game_source_states(), "epic");
        source_state["id"] = "epic";
        source_state["connected"] = true;
        source_state["connectionState"] = "connected";
        source_state["syncState"] = "not_started";
        source_state["publicConfig"]["accountId"] = json_string_value(session, "account_id");
        source_state["publicConfig"]["displayName"] = json_string_value(session, "displayName");
        source_state["lastConnected"] = now_iso8601_utc_string();
        if (!save_oauth_session(source_state, session, error) || !save_game_source_state("epic", source_state)) {
          output_tree["status"] = false;
          output_tree["connectionState"] = "requires_action";
          output_tree["error"] = error.empty() ? "Epic session could not be saved." : error;
          send_response(response, output_tree);
          return;
        }
        output_tree["connectionState"] = "connected";
        output_tree["syncState"] = "not_started";
        output_tree["tokenEncrypted"] = true;
        output_tree["message"] = "Epic account connected. Sync will fetch owned library and merge local installs.";
        send_response(response, output_tree);
        return;
      }
      output_tree["connectionState"] = "requires_action";
      output_tree["action"] = "browser_login";
      output_tree["authUrl"] = epic_auth_url();
      output_tree["message"] = "Open Epic sign-in, copy authorizationCode from the browser response, then connect again with authorizationCode. Local scan remains available through sync.";
      send_response(response, output_tree);
      return;
    }

    const auto public_config = public_source_config_from_request(source_id, body);
    if (!public_config.empty()) {
      nlohmann::json source_state;
      source_state["id"] = source_id;
      source_state["connected"] = false;
      source_state["connectionState"] = "requires_action";
      source_state["syncState"] = "not_started";
      source_state["tokenEncrypted"] = false;
      source_state["vaultProvider"] = vault_provider_name();
      source_state["publicConfig"] = public_config;
      source_state["requirements"] = provider_connection_requirements(source_id);
      source_state["statusMessage"] = "Provider client settings saved. OAuth callback/token exchange is still required before library sync.";
      (void) save_game_source_state(source_id, source_state);
      output_tree["message"] = "Provider client settings saved. OAuth callback/token exchange is still required before library sync.";
    } else {
      output_tree["message"] = "Provider OAuth is ready for configuration, but no client settings were provided.";
    }
    send_response(response, output_tree);
  }

  /**
   * @brief Trigger a game source sync.
   * @api_examples{/api/game-sources/steam/sync| POST| null}
   */
  void postGameSourceSync(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::string source_id;
    if (request->path_match.size() > 1) {
      source_id = request->path_match[1];
    }

    nlohmann::json output_tree;
    if (!is_known_game_source(source_id)) {
      output_tree["status"] = false;
      output_tree["error"] = "Unknown game source";
      send_response(response, output_tree);
      return;
    }

    const auto apps = visible_apps_for_current_sources(read_apps_array_or_empty());
    const auto states = read_game_source_states();
    auto source_state = source_state_or_empty(states, source_id);
    output_tree["status"] = true;
    output_tree["sourceId"] = source_id;
    output_tree["syncState"] = "requires_connection";

    if (source_id == "manual") {
      output_tree["syncState"] = "ready";
      output_tree["message"] = "Manual library entries are already stored locally.";
      output_tree["playableGameCount"] = playable_game_count(apps);
    } else if (source_id == "playniteLegacy") {
      output_tree["syncState"] = "legacy_available";
      output_tree["message"] = "Playnite sync is available through the existing Playnite endpoint.";
      output_tree["playableGameCount"] = playable_game_count(apps);
    } else if (source_id == "epic" || source_id == "gog" || source_id == "xbox") {
      nlohmann::json source_games = nlohmann::json::array();
      bool cloud_ok = false;
      std::string cloud_error;
      if (source_id == "epic" && source_state.value("connected", false)) {
        source_games = sync_epic_owned_games(source_state, cloud_ok, cloud_error);
      } else if (source_id == "gog" && source_state.value("connected", false)) {
        source_games = sync_gog_owned_games(source_state, cloud_ok, cloud_error);
      } else if (source_id == "epic") {
        source_games = sync_epic_installed_games();
      } else if (source_id == "gog") {
        source_games = sync_gog_installed_games();
      } else {
        source_games = sync_xbox_installed_games();
      }
      const bool cloud_synced = (source_id == "epic" || source_id == "gog") && cloud_ok;
      int playable_count = 0;
      int installed_count = 0;
      int owned_count = 0;
      for (const auto &game : source_games) {
        if (game.value("owned", false)) {
          ++owned_count;
        }
        if (game.value("installed", false)) {
          ++installed_count;
        }
        if (game.value("playable", false)) {
          ++playable_count;
        }
      }
      const int imported_count = auto_import_installed_provider_games(source_id, source_games);
      source_state["id"] = source_id;
      source_state["connected"] = cloud_synced || source_state.value("connected", false) || installed_count > 0;
      source_state["connectionState"] = cloud_synced ? "connected" : (installed_count > 0 ? "local" : "not_detected");
      source_state["syncState"] = cloud_synced ? "ready" : "local_ready";
      source_state["lastSynced"] = now_iso8601_utc_string();
      source_state["games"] = source_games;
      source_state["ownedGameCount"] = owned_count;
      source_state["installedGameCount"] = installed_count;
      source_state["playableGameCount"] = playable_count;
      source_state["metadataAvailable"] = cloud_synced;
      source_state["posterProvider"] = cloud_synced ? source_id : "local_then_metadata";
      source_state["statusMessage"] = cloud_synced
        ? game_source_name(source_id) + " owned library synced and local installs were merged."
        : (source_games.empty()
        ? game_source_name(source_id) + " local installs were not found."
        : game_source_name(source_id) + " local installs were detected.");
      if (!cloud_error.empty() && !cloud_synced) {
        source_state["statusMessage"] = cloud_error;
      }
      if (!save_game_source_state(source_id, source_state)) {
        output_tree["status"] = false;
        output_tree["syncState"] = "error";
        output_tree["error"] = game_source_name(source_id) + " sync completed but failed to persist source state.";
        send_response(response, output_tree);
        return;
      }
      output_tree["syncState"] = source_state["syncState"];
      output_tree["connectionState"] = source_state["connectionState"];
      output_tree["ownedGameCount"] = owned_count;
      output_tree["installedGameCount"] = installed_count;
      output_tree["playableGameCount"] = playable_count;
      output_tree["importedGameCount"] = imported_count;
      output_tree["message"] = cloud_synced
        ? game_source_name(source_id) + " owned library synced and local installs were merged."
        : (source_games.empty()
        ? "No local " + game_source_name(source_id) + " installs were found."
        : "Local " + game_source_name(source_id) + " installs were detected and launchable games were imported.");
      if (!cloud_error.empty() && !cloud_synced) {
        output_tree["warning"] = cloud_error;
      }
    } else if (source_id == "steam" && source_state.value("connected", false)) {
      bool ok = false;
      std::string error;
      auto steam_games = sync_steam_owned_games(source_state, ok, error);
      if (!ok) {
        output_tree["status"] = false;
        output_tree["syncState"] = "error";
        output_tree["error"] = error.empty() ? "Steam sync failed." : error;
        source_state["syncState"] = "error";
        source_state["statusMessage"] = output_tree["error"];
        (void) save_game_source_state(source_id, source_state);
        send_response(response, output_tree);
        return;
      }
      source_state["syncState"] = "ready";
      source_state["lastSynced"] = now_iso8601_utc_string();
      source_state["games"] = steam_games;
      int installed_count = 0;
      int owned_count = 0;
      for (const auto &game : steam_games) {
        if (game.value("owned", false)) {
          ++owned_count;
        }
        if (game.value("installed", false)) {
          ++installed_count;
        }
      }
      const int imported_count = auto_import_installed_provider_games("steam", steam_games);
      source_state["ownedGameCount"] = owned_count;
      source_state["installedGameCount"] = installed_count;
      source_state["playableGameCount"] = installed_count;
      source_state["metadataAvailable"] = true;
      source_state["posterProvider"] = "steam";
      source_state["statusMessage"] = imported_count > 0
        ? "Steam library synced and installed games were added to the server library."
        : "Steam library synced. Installed games are already present in the server library.";
      if (!save_game_source_state(source_id, source_state)) {
        output_tree["status"] = false;
        output_tree["syncState"] = "error";
        output_tree["error"] = "Steam sync completed but failed to persist source state.";
        send_response(response, output_tree);
        return;
      }
      // Enqueue all synced appids for background poster + metadata download.
      {
        std::vector<std::string> appids;
        appids.reserve(steam_games.size());
        for (const auto &game : steam_games) {
          const auto appid = json_string_value(game, "providerGameId");
          if (!appid.empty()) {
            appids.push_back(appid);
          }
        }
        steam_prefetch_enqueue_batch(appids);
      }
      output_tree["syncState"] = "ready";
      output_tree["connectionState"] = "connected";
      output_tree["ownedGameCount"] = owned_count;
      output_tree["installedGameCount"] = installed_count;
      output_tree["playableGameCount"] = installed_count;
      output_tree["importedGameCount"] = imported_count;
      output_tree["message"] = imported_count > 0
        ? "Steam owned library synced and installed games were added automatically."
        : "Steam owned library synced.";
    } else {
      output_tree["message"] = "Connect this provider account before syncing owned and installed games.";
      output_tree["requirements"] = provider_connection_requirements(source_id);
    }

    send_response(response, output_tree);
  }

  /**
   * @brief Disconnect a provider account for a game source.
   * @api_examples{/api/game-sources/steam/disconnect| POST| null}
   */
  void postGameSourceDisconnect(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::string source_id;
    if (request->path_match.size() > 1) {
      source_id = request->path_match[1];
    }

    nlohmann::json output_tree;
    if (!is_known_game_source(source_id)) {
      output_tree["status"] = false;
      output_tree["error"] = "Unknown game source";
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["sourceId"] = source_id;
    int removed_count = 0;
    if (is_store_game_source(source_id)) {
      removed_count = purge_provider_apps_for_source(source_id);
      (void) remove_game_source_state(source_id);
    } else if (source_id == "playniteLegacy") {
      nlohmann::json source_state;
      source_state["id"] = "playniteLegacy";
      source_state["connected"] = false;
      source_state["connectionState"] = "disabled";
      source_state["syncState"] = "disabled";
      source_state["disabled"] = true;
      source_state["statusMessage"] = "Playnite Legacy entries are hidden until this source is re-enabled.";
      (void) save_game_source_state(source_id, source_state);
    }
    output_tree["connectionState"] = is_store_game_source(source_id) ? "not_connected" : (source_id == "playniteLegacy" ? "disabled" : "available");
    output_tree["removedGameCount"] = removed_count;
    output_tree["message"] = is_store_game_source(source_id)
      ? "Provider source state, encrypted credentials, and imported games were removed."
      : (source_id == "playniteLegacy" ? "Playnite Legacy source was disabled." : "This source does not use provider tokens.");
    send_response(response, output_tree);
  }

  /**
   * @brief Get normalized game library records across manual, legacy, and future store sources.
   * @api_examples{/api/library/games| GET| null}
   */
  void getLibraryGames(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto apps = visible_apps_for_current_sources(read_apps_array_or_empty());
    const auto games = build_library_games_contract(apps);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["games"] = games;
    output_tree["summary"] = build_library_summary(games);
    output_tree["sources"] = build_game_sources_summary(apps);
    output_tree["metadata"] = build_library_metadata_status();
    send_response(response, output_tree);
  }

  void postLibraryArtAutoscan(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }
    print_req(request);

    nlohmann::json body = nlohmann::json::object();
    try {
      body = parse_json_request_body(request);
      if (!body.is_object()) {
        body = nlohmann::json::object();
      }
    } catch (...) {
      body = nlohmann::json::object();
    }
    const bool missing_only = body.value("missingOnly", true);
    const bool force_apply = body.value("forceApply", false);

    {
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      if (s_art_autoscan_status.value("running", false)) {
        nlohmann::json out = s_art_autoscan_status;
        out["status"] = true;
        send_response(response, out);
        return;
      }
      s_art_autoscan_status = {
        {"status", true},
        {"running", true},
        {"missingOnly", missing_only},
        {"forceApply", force_apply},
        {"startedAt", now_iso8601_utc_string()},
        {"scannedGameCount", 0},
        {"targetGameCount", 0},
        {"results", nlohmann::json::array()}
      };
    }

    std::thread([missing_only, force_apply]() {
      run_art_autoscan_worker(missing_only, force_apply);
    }).detach();

    nlohmann::json out;
    {
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      out = s_art_autoscan_status;
    }
    out["status"] = true;
    send_response(response, out);
  }

  void getLibraryArtAutoscanStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    print_req(request);
    nlohmann::json out;
    {
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      out = s_art_autoscan_status;
    }
    out["status"] = true;
    send_response(response, out);
  }

  void postLibraryArtScanOne(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }
    print_req(request);

    nlohmann::json body;
    try {
      body = parse_json_request_body(request);
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    const auto uuid = json_string_value(body, "uuid");
    const int requested_index = body.contains("index") && body["index"].is_number_integer() ? body["index"].get<int>() : -1;
    const auto requested_name = json_string_value(body, "name");

    try {
      const auto file_tree = proc::read_apps_file(config::stream.file_apps);
      const auto apps = file_tree.contains("apps") && file_tree["apps"].is_array() ? file_tree["apps"] : nlohmann::json::array();
      for (int i = 0; i < static_cast<int>(apps.size()); ++i) {
        const auto &app = apps[i];
        if (!app.is_object()) {
          continue;
        }
        const bool matches =
          (!uuid.empty() && json_string_value(app, "uuid") == uuid) ||
          (requested_index >= 0 && i == requested_index);
        if (matches) {
          auto result = scan_art_for_app(app, i);
          result["status"] = true;
          send_response(response, result);
          return;
        }
      }
    } catch (...) {
      // Fall back to the request body below. This keeps search usable when
      // editing a new/manual game before it has been saved.
    }

    nlohmann::json synthetic = nlohmann::json::object();
    synthetic["name"] = requested_name;
    synthetic["source"] = json_string_value(body, "source");
    synthetic["source-id"] = json_string_value(body, "source");
    synthetic["source_id"] = json_string_value(body, "providerGameId");
    synthetic["provider-game-id"] = json_string_value(body, "providerGameId");
    synthetic["working-dir"] = json_string_value(body, "workingDir");
    auto result = scan_art_for_app(synthetic, requested_index);
    result["status"] = true;
    send_response(response, result);
  }

  void postLibraryArtApply(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }
    print_req(request);

    nlohmann::json body;
    try {
      body = parse_json_request_body(request);
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }
    const auto uuid = json_string_value(body, "uuid");
    const int index = body.contains("index") && body["index"].is_number_integer() ? body["index"].get<int>() : -1;
    const auto image_url = json_string_value(body, "imageUrl");
    if (image_url.empty()) {
      bad_request(response, request, "imageUrl is required");
      return;
    }

    try {
      auto file_tree = proc::read_apps_file(config::stream.file_apps);
      if (!file_tree.contains("apps") || !file_tree["apps"].is_array()) {
        bad_request(response, request, "App library is empty");
        return;
      }
      auto &apps = file_tree["apps"];
      for (int i = 0; i < static_cast<int>(apps.size()); ++i) {
        auto &app = apps[i];
        if (!app.is_object()) {
          continue;
        }
        const bool matches =
          (!uuid.empty() && json_string_value(app, "uuid") == uuid) ||
          (index >= 0 && i == index);
        if (!matches) {
          continue;
        }
        app["image-path"] = image_url;
        if (body.contains("metadata") && body["metadata"].is_object()) {
          const auto &metadata = body["metadata"];
          const auto description = json_string_value(metadata, "description");
          const auto developer = json_string_value(metadata, "developer");
          const auto publisher = json_string_value(metadata, "publisher");
          const auto release_date = json_string_value(metadata, "releaseDate");
          if (!description.empty()) app["description"] = description;
          if (!developer.empty()) app["developer"] = developer;
          if (!publisher.empty()) app["publisher"] = publisher;
          if (!release_date.empty()) app["release-date"] = release_date;
          if (metadata.contains("genres") && metadata["genres"].is_array()) app["genres"] = metadata["genres"];
        }
        refresh_client_apps_cache(file_tree, true);
        nlohmann::json out;
        out["status"] = true;
        out["message"] = "Artwork applied.";
        send_response(response, out);
        return;
      }
      bad_request(response, request, "Cannot find requested application");
    } catch (std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Start Steam browser sign-in.
   * @api_examples{/api/game-sources/steam/auth/start| POST| null}
   */
  void postSteamAuthStart(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["sourceId"] = "steam";
    output_tree["connectionState"] = "connecting";
    output_tree["action"] = "browser_login";
    output_tree["authUrl"] = steam_openid_auth_url(request_scheme_and_host(request));
    output_tree["message"] = "Open Steam sign-in to connect this account.";
    send_response(response, output_tree);
  }

  /**
   * @brief Start Epic Games browser sign-in.
   * @api_examples{/api/game-sources/epic/auth/start| POST| null}
   */
  void postEpicAuthStart(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["sourceId"] = "epic";
    output_tree["connectionState"] = "connecting";
    output_tree["action"] = "browser_login";
    output_tree["authUrl"] = epic_auth_url();
    output_tree["message"] = "Open Epic Games sign-in to connect this account.";
    send_response(response, output_tree);
  }

  /**
   * @brief Receive Steam OpenID callback.
   * @api_examples{/api/game-sources/steam/auth/callback| GET| null}
   */
  void getSteamAuthCallback(resp_https_t response, req_https_t request) {
    // No authenticate() check here — this is an OAuth/OpenID callback endpoint.
    // The popup browser window navigating here will not have a Sunshine session cookie
    // (it was redirected from steamcommunity.com).  Security is guaranteed by the
    // server-side verify_steam_openid_response() call below, which validates the
    // OpenID signature with Steam's own servers.
    print_req(request);

    std::unordered_map<std::string, std::string> params;
    try {
      for (const auto &[key, value] : request->parse_query_string()) {
        params[key] = value;
      }
    } catch (...) {
      params = query_params_from_target(request->path);
    }

    std::string steam_id;
    std::string error;
    const bool verified = verify_steam_openid_response(params, steam_id, error);

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "text/html; charset=utf-8");
    if (!verified) {
      response->write(
        client_error_bad_request,
        "<!doctype html><title>Steam sign-in failed</title><p>Steam sign-in failed. You can close this tab and try again from Jujo.Stream.</p>",
        headers
      );
      return;
    }

    auto existing_state = source_state_or_empty(read_game_source_states(), "steam");
    nlohmann::json source_state;
    source_state["id"] = "steam";
    source_state["connected"] = true;
    source_state["connectionState"] = "connected";
    source_state["syncState"] = "not_started";
    source_state["tokenEncrypted"] = false;
    source_state["vaultProvider"] = vault_provider_name();
    source_state["publicConfig"] = {
      {"steamId", steam_id}
    };
    if (existing_state.contains("publicConfig") && existing_state["publicConfig"].is_object()) {
      for (const auto &[key, value] : existing_state["publicConfig"].items()) {
        if (key != "steamId") {
          source_state["publicConfig"][key] = value;
        }
      }
    }
    if (existing_state.contains("secretConfig") && existing_state["secretConfig"].is_object()) {
      source_state["secretConfig"] = existing_state["secretConfig"];
      source_state["tokenEncrypted"] = existing_state.value("tokenEncrypted", false);
    }
    source_state["ownedGameCount"] = 0;
    source_state["installedGameCount"] = 0;
    source_state["playableGameCount"] = 0;
    source_state["metadataAvailable"] = false;
    source_state["posterProvider"] = "pending";
    source_state["lastConnected"] = now_iso8601_utc_string();
    source_state["statusMessage"] = "Steam account connected through browser sign-in. Sync will capture the Steam Store web library from this browser and match local manifests.";
    if (!save_game_source_state("steam", source_state)) {
      response->write(
        server_error_internal_server_error,
        "<!doctype html><title>Steam sign-in failed</title><p>Steam sign-in worked, but Jujo.Stream could not save the source state.</p>",
        headers
      );
      return;
    }

    response->write(
      success_ok,
      "<!doctype html><title>Steam connected</title>"
      "<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1b2838;color:#c6d4df}</style>"
      "<p>Steam connected &#10003; &mdash; you can close this tab.</p>"
      "<script>"
      "try{if(window.opener){window.opener.postMessage({type:'jujo:source-connected',sourceId:'steam'},window.opener.location.origin);}}"
      "catch(e){}"
      "setTimeout(function(){window.close();},1200);"
      "</script>",
      headers
    );
  }

  void getGogAuthCallback(resp_https_t response, req_https_t request) {
    print_req(request);

    std::unordered_map<std::string, std::string> params;
    try {
      for (const auto &[key, value] : request->parse_query_string()) {
        params[key] = value;
      }
    } catch (...) {
      params = query_params_from_target(request->path);
    }

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "text/html; charset=utf-8");

    const auto code_it = params.find("code");
    if (code_it == params.end() || code_it->second.empty()) {
      response->write(
        client_error_bad_request,
        "<!doctype html><title>GOG sign-in failed</title><p>GOG sign-in did not return an authorization code. You can close this tab and try again from Jujo.Stream.</p>",
        headers
      );
      return;
    }

    nlohmann::json session;
    std::string error;
    const auto redirect_uri = request_scheme_and_host(request) + "/api/game-sources/gog/auth/callback";
    if (!gog_exchange_code(code_it->second, redirect_uri, session, error)) {
      response->write(
        client_error_bad_request,
        "<!doctype html><title>GOG sign-in failed</title><p>GOG token exchange failed. You can close this tab and try again from Jujo.Stream.</p>",
        headers
      );
      return;
    }

    auto source_state = source_state_or_empty(read_game_source_states(), "gog");
    source_state["id"] = "gog";
    source_state["connected"] = true;
    source_state["connectionState"] = "connected";
    source_state["syncState"] = "not_started";
    source_state["publicConfig"]["userId"] = json_string_value(session, "user_id");
    source_state["publicConfig"]["sessionId"] = json_string_value(session, "session_id");
    source_state["lastConnected"] = now_iso8601_utc_string();
    if (!save_oauth_session(source_state, session, error) || !save_game_source_state("gog", source_state)) {
      response->write(
        client_error_bad_request,
        "<!doctype html><title>GOG sign-in failed</title><p>GOG session could not be saved. You can close this tab and try again from Jujo.Stream.</p>",
        headers
      );
      return;
    }

    response->write(
      success_ok,
      "<!doctype html><title>GOG connected</title>"
      "<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#18141f;color:#f2eaff}</style>"
      "<p>GOG connected &#10003; &mdash; you can close this tab.</p>"
      "<script>"
      "try{if(window.opener){window.opener.postMessage({type:'jujo:source-connected',sourceId:'gog'},window.opener.location.origin);}}"
      "catch(e){}"
      "setTimeout(function(){window.close();},1200);"
      "</script>",
      headers
    );
  }

  /**
   * @brief Persist Steam Store web-login library AppIDs captured by the browser.
   * @api_examples{/api/game-sources/steam/web-library| POST| {"ownedAppIds":[570]}}
   */
  void postSteamWebLibrary(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    nlohmann::json body = nlohmann::json::object();
    try {
      body = parse_json_request_body(request);
      if (!body.is_object()) {
        body = nlohmann::json::object();
      }
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    nlohmann::json output_tree;
    output_tree["status"] = false;
    output_tree["sourceId"] = "steam";

    auto source_state = source_state_or_empty(read_game_source_states(), "steam");
    if (!source_state.value("connected", false)) {
      output_tree["connectionState"] = "requires_connection";
      output_tree["error"] = "Steam must be connected before importing the web library.";
      send_response(response, output_tree);
      return;
    }

    const auto appids = steam_appids_from_json_array(body.contains("ownedAppIds") ? body["ownedAppIds"] : nlohmann::json::array());
    if (appids.empty()) {
      output_tree["connectionState"] = "requires_action";
      output_tree["error"] = "Steam web login did not return owned apps. Sign in to Steam in this browser or use the private-account fallback.";
      send_response(response, output_tree);
      return;
    }

    const auto installed_games = detect_installed_steam_games();
    auto steam_games = steam_owned_games_from_appids(appids, installed_games);
    std::unordered_set<std::string> known_appids;
    for (const auto &game : steam_games) {
      known_appids.insert(game.value("providerGameId", std::string {}));
    }
    for (const auto &[appid, install_info] : installed_games) {
      if (!known_appids.contains(appid)) {
        steam_games.push_back(steam_game_contract(appid, install_info.title, &install_info, false));
      }
    }

    int installed_count = 0;
    int owned_count = 0;
    for (const auto &game : steam_games) {
      if (game.value("owned", false)) {
        ++owned_count;
      }
      if (game.value("installed", false)) {
        ++installed_count;
      }
    }
    const int imported_count = auto_import_installed_provider_games("steam", steam_games);

    source_state["webOwnedAppIds"] = appids;
    source_state["syncState"] = "ready";
    source_state["lastSynced"] = now_iso8601_utc_string();
    source_state["games"] = steam_games;
    source_state["ownedGameCount"] = owned_count;
    source_state["installedGameCount"] = installed_count;
    source_state["playableGameCount"] = installed_count;
    source_state["metadataAvailable"] = true;
    source_state["posterProvider"] = "steam";
    source_state["publicConfig"]["webLoginLibraryCaptured"] = true;
    source_state["publicConfig"]["webOwnedAppCount"] = owned_count;
    source_state["statusMessage"] = imported_count > 0
      ? "Steam web library synced and installed games were added to the server library."
      : "Steam web library synced. Installed games are already present in the server library.";

    if (!save_game_source_state("steam", source_state)) {
      output_tree["error"] = "Steam web library was captured but could not be saved.";
      send_response(response, output_tree);
      return;
    }

    // Enqueue all synced appids for background poster + metadata download.
    {
      std::vector<std::string> prefetch_ids;
      prefetch_ids.reserve(steam_games.size());
      for (const auto &game : steam_games) {
        const auto appid = json_string_value(game, "providerGameId");
        if (!appid.empty()) {
          prefetch_ids.push_back(appid);
        }
      }
      steam_prefetch_enqueue_batch(prefetch_ids);
    }

    output_tree["status"] = true;
    output_tree["connectionState"] = "connected";
    output_tree["syncState"] = "ready";
    output_tree["ownedGameCount"] = owned_count;
    output_tree["installedGameCount"] = installed_count;
    output_tree["playableGameCount"] = installed_count;
    output_tree["importedGameCount"] = imported_count;
    output_tree["message"] = imported_count > 0
      ? "Steam web library synced and installed games were added automatically."
      : "Steam web library synced.";
    send_response(response, output_tree);
  }

  /**
   * @brief Return the progress of the background Steam poster+metadata prefetch worker.
   * @api_examples{/api/library/steam/prefetch-progress| GET| null}
   */
  void getSteamPrefetchProgress(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    auto out = steam_prefetch_progress_json();
    out["status"] = true;
    send_response(response, out);
  }

  /**
   * @brief Serve a locally cached Steam poster by AppID.
   * @api_examples{/api/library/steam/570/poster| GET| null}
   */
  void getSteamPoster(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string appid;
    if (request->path_match.size() > 1) {
      appid = request->path_match[1];
    }
    if (appid.empty() || !std::all_of(appid.begin(), appid.end(), [](unsigned char ch) { return std::isdigit(ch); })) {
      bad_request(response, request, "Invalid Steam AppID");
      return;
    }

    const auto poster_path = steam_poster_cache_path(appid);
    std::error_code ec;
    namespace fs = std::filesystem;
    if (!fs::exists(poster_path, ec) || !fs::is_regular_file(poster_path, ec)) {
      response->write(client_error_not_found, "Steam poster not found");
      return;
    }

    std::ifstream in(poster_path, std::ios::binary);
    if (!in) {
      response->write(server_error_internal_server_error, "Failed to read Steam poster");
      return;
    }

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "image/jpeg");
    headers.emplace("Cache-Control", "public, max-age=604800");
    response->write(success_ok, in, headers);
  }

  /**
   * @brief List available local art types for a Steam game from Steam's librarycache.
   * @api_examples{/api/library/local-art/steam/570| GET| null}
   */
  void getSteamLocalArtManifest(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    std::string appid;
    if (request->path_match.size() > 1) {
      appid = request->path_match[1];
    }
    if (appid.empty() || !std::all_of(appid.begin(), appid.end(), [](unsigned char ch) { return std::isdigit(ch); })) {
      bad_request(response, request, "Invalid Steam AppID");
      return;
    }
    const auto art = find_steam_local_art(appid);
    nlohmann::json out;
    out["status"] = true;
    out["appid"] = appid;
    nlohmann::json available = nlohmann::json::array();
    nlohmann::json urls = nlohmann::json::object();
    for (const auto &e : art) {
      available.push_back(e.type);
      urls[e.type] = "/api/library/local-art/steam/" + appid + "/" + e.type;
    }
    out["available"] = available;
    out["urls"] = urls;
    out["hasLocalArt"] = !art.empty();
    send_response(response, out);
  }

  /**
   * @brief Serve a local art file for a Steam game from Steam's librarycache.
   * @api_examples{/api/library/local-art/steam/570/portrait| GET| null}
   */
  void getSteamLocalArtFile(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    std::string appid, art_type;
    if (request->path_match.size() > 1) appid = request->path_match[1];
    if (request->path_match.size() > 2) art_type = request->path_match[2];

    if (appid.empty() || !std::all_of(appid.begin(), appid.end(), [](unsigned char ch) { return std::isdigit(ch); })) {
      bad_request(response, request, "Invalid Steam AppID");
      return;
    }
    // Validate art_type is one of the known types
    static const std::unordered_set<std::string> valid_types = {"portrait", "header", "hero", "hero_blur", "logo", "icon"};
    if (art_type.empty() || !valid_types.count(art_type)) {
      bad_request(response, request, "Invalid art type. Expected: portrait, header, hero, hero_blur, logo, icon");
      return;
    }

    const auto art_path = steam_local_art_path_for_type(appid, art_type);
    if (art_path.empty()) {
      response->write(client_error_not_found, "Local art not found");
      return;
    }

    std::ifstream in(art_path, std::ios::binary);
    if (!in) {
      response->write(server_error_internal_server_error, "Failed to read local art file");
      return;
    }

    // Determine MIME type from extension
    const auto ext = art_path.extension().string();
    std::string mime = "image/jpeg";
    if (ext == ".png") mime = "image/png";
    else if (ext == ".ico") mime = "image/x-icon";

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", mime);
    headers.emplace("Cache-Control", "public, max-age=86400");
    headers.emplace("X-Frame-Options", "DENY");
    response->write(success_ok, in, headers);
  }

  /**
   * @brief Remove all Playnite-imported apps from apps.json and disable the Playnite source.
   * @api_examples{/api/game-sources/playniteLegacy/purge-apps| POST| null}
   */
  void postPlaynitePurgeApps(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }
    print_req(request);
    nlohmann::json out;
    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      int removed = 0;
      if (file_tree.contains("apps") && file_tree["apps"].is_array()) {
        nlohmann::json new_apps = nlohmann::json::array();
        for (const auto &app : file_tree["apps"]) {
          if (is_playnite_library_entry(app)) {
            ++removed;
          } else {
            new_apps.push_back(app);
          }
        }
        file_tree["apps"] = new_apps;
        refresh_client_apps_cache(file_tree, false);
      }
      // Disable the Playnite source state
      auto states = read_game_source_states();
      auto pn_state = source_state_or_empty(states, "playniteLegacy");
      pn_state["id"] = "playniteLegacy";
      pn_state["disabled"] = true;
      pn_state["connectionState"] = "disabled";
      pn_state["syncState"] = "disabled";
      pn_state["statusMessage"] = "Playnite Legacy has been disabled. " + std::to_string(removed) + " imported entries were removed.";
      (void) save_game_source_state("playniteLegacy", pn_state);
      out["status"] = true;
      out["removedCount"] = removed;
      out["message"] = std::to_string(removed) + " Playnite game(s) removed from the library.";
    } catch (const std::exception &e) {
      out["status"] = false;
      out["error"] = e.what();
    } catch (...) {
      out["status"] = false;
      out["error"] = "Failed to purge Playnite apps.";
    }
    send_response(response, out);
  }

  /**
   * @brief Purge all auto-synced Playnite applications (playnite-managed == "auto").
   * @api_examples{/api/apps/purge_autosync| POST| null}
   */
  void purgeAutoSyncedApps(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    try {
      nlohmann::json output_tree;
      nlohmann::json new_apps = nlohmann::json::array();
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      auto &apps_node = file_tree["apps"];

      for (auto &app : apps_node) {
        const std::string managed = app.contains("playnite-managed") && app["playnite-managed"].is_string() ? app["playnite-managed"].get<std::string>() : std::string();
        if (managed == "auto") {
          continue;
        }
        new_apps.push_back(app);
      }

      file_tree["apps"] = new_apps;
      confighttp::refresh_client_apps_cache(file_tree);

      output_tree["status"] = true;
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "purgeAutoSyncedApps: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Upload a cover image.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/covers/upload| POST| {"key":"igdb_1234","url":"https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abc123.png"}}
   */
  void uploadCover(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    std::stringstream ss;

    ss << request->content.rdbuf();
    try {
      nlohmann::json input_tree = nlohmann::json::parse(ss.str());
      nlohmann::json output_tree;
      std::string key = input_tree.value("key", "");
      if (key.empty()) {
        bad_request(response, request, "Cover key is required");
        return;
      }
      std::string url = input_tree.value("url", "");
      const std::string coverdir = platf::appdata().string() + "/covers/";
      file_handler::make_directory(coverdir);

      // Final destination PNG path
      const std::string dest_png = coverdir + http::url_escape(key) + ".png";

      // Helper to check PNG magic header
      auto file_is_png = [](const std::string &p) -> bool {
        std::ifstream f(p, std::ios::binary);

        if (!f) {
          return false;
        }
        unsigned char sig[8] {};
        f.read(reinterpret_cast<char *>(sig), 8);
        static const unsigned char pngsig[8] = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};

        return f.gcount() == 8 && std::equal(std::begin(sig), std::end(sig), std::begin(pngsig));
      };

      // Build a temp source path (extension based on URL if available)
      auto ext_from_url = [](std::string u) -> std::string {
        auto qpos = u.find_first_of("?#");

        if (qpos != std::string::npos) {
          u = u.substr(0, qpos);
        }
        auto slash = u.find_last_of('/');
        if (slash != std::string::npos) {
          u = u.substr(slash + 1);
        }
        auto dot = u.find_last_of('.');
        if (dot == std::string::npos) {
          return std::string {".img"};
        }
        std::string e = u.substr(dot);
        // sanitize extension
        if (e.size() > 8) {
          return std::string {".img"};
        }
        for (char &c : e) {
          c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        }

        return e;
      };

      std::string src_tmp;
      if (!url.empty()) {
        if (http::url_get_host(url) != "images.igdb.com") {
          bad_request(response, request, "Only images.igdb.com is allowed");
          return;
        }
        const std::string ext = ext_from_url(url);
        src_tmp = coverdir + http::url_escape(key) + "_src" + ext;
        if (!http::download_file(url, src_tmp)) {
          bad_request(response, request, "Failed to download cover");
          return;
        }
      }

      bool converted = false;
#ifdef _WIN32
      {
        // Convert using WIC helper; falls back to copying if already PNG
        std::wstring src_w(src_tmp.begin(), src_tmp.end());
        std::wstring dst_w(dest_png.begin(), dest_png.end());
        converted = platf::img::convert_to_png_96dpi(src_w, dst_w);
        if (!converted && file_is_png(src_tmp)) {
          std::error_code ec {};
          std::filesystem::copy_file(src_tmp, dest_png, std::filesystem::copy_options::overwrite_existing, ec);
          converted = !ec.operator bool();
        }
      }
#else
      // Non-Windows: we can’t transcode here; accept only already-PNG data
      if (file_is_png(src_tmp)) {
        std::error_code ec {};

        std::filesystem::rename(src_tmp, dest_png, ec);
        if (ec) {
          // If rename fails (cross-device), try copy
          std::filesystem::copy_file(src_tmp, dest_png, std::filesystem::copy_options::overwrite_existing, ec);
          if (!ec) {
            std::filesystem::remove(src_tmp);
            converted = true;
          }
        } else {
          converted = true;
        }
      } else {
        // Leave a clear error on non-Windows when not PNG
        bad_request(response, request, "Cover must be PNG on this platform");
        return;
      }
#endif

      // Cleanup temp source file when possible
      if (!src_tmp.empty()) {
        std::error_code del_ec {};

        std::filesystem::remove(src_tmp, del_ec);
      }

      if (!converted) {
        bad_request(response, request, "Failed to convert cover to PNG");
        return;
      }

      output_tree["status"] = true;
      output_tree["path"] = dest_png;
      send_response(response, output_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "UploadCover: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  /**
   * @brief Configure poster/metadata provider credentials.
   * @api_examples{/api/library/metadata/providers/steamgriddb/connect| POST| {"apiKey":"..."}}
   * @api_examples{/api/library/metadata/providers/igdb/connect| POST| {"clientId":"...","clientSecret":"..."}}
   */
  void postLibraryMetadataProviderConnect(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
      return;
    }

    print_req(request);

    std::string provider_id;
    if (request->path_match.size() > 1) {
      provider_id = request->path_match[1];
    }

    nlohmann::json output_tree;
    output_tree["status"] = false;
    output_tree["providerId"] = provider_id;

    if (provider_id != "steamgriddb" && provider_id != "igdb") {
      output_tree["error"] = "Unknown metadata provider.";
      send_response(response, output_tree);
      return;
    }

    if (!vault_encryption_available()) {
      output_tree["state"] = "requires_action";
      output_tree["error"] = "Encrypted provider storage is not available on this platform.";
      send_response(response, output_tree);
      return;
    }

    nlohmann::json body = nlohmann::json::object();
    try {
      body = parse_json_request_body(request);
      if (!body.is_object()) {
        body = nlohmann::json::object();
      }
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    nlohmann::json provider_state;
    provider_state["id"] = provider_id;
    provider_state["configured"] = true;
    provider_state["state"] = "configured";
    provider_state["tokenEncrypted"] = true;
    provider_state["vaultProvider"] = vault_provider_name();
    provider_state["lastConfigured"] = now_iso8601_utc_string();

    if (provider_id == "steamgriddb") {
      const auto api_key = trim_copy(json_string_value(body, "apiKey"));
      if (api_key.empty()) {
        output_tree["state"] = "requires_action";
        output_tree["error"] = "SteamGridDB API key is required.";
        send_response(response, output_tree);
        return;
      }

      std::string encrypted_key;
      if (!encrypt_provider_secret(api_key, encrypted_key)) {
        output_tree["state"] = "requires_action";
        output_tree["error"] = "SteamGridDB API key could not be encrypted on this host.";
        send_response(response, output_tree);
        return;
      }

      provider_state["name"] = "SteamGridDB";
      provider_state["secretConfig"]["apiKeyEncrypted"] = encrypted_key;
      provider_state["publicConfig"]["apiKeyConfigured"] = true;
      provider_state["statusMessage"] = "SteamGridDB API key is stored encrypted and ready for automatic poster fetching.";
    } else {
      const auto client_id = trim_copy(json_string_value(body, "clientId"));
      const auto client_secret = trim_copy(json_string_value(body, "clientSecret"));
      if (client_id.empty() || client_secret.empty()) {
        output_tree["state"] = "requires_action";
        output_tree["error"] = "IGDB Client ID and Client Secret are required.";
        send_response(response, output_tree);
        return;
      }

      std::string encrypted_client_id;
      std::string encrypted_client_secret;
      if (!encrypt_provider_secret(client_id, encrypted_client_id) ||
          !encrypt_provider_secret(client_secret, encrypted_client_secret)) {
        output_tree["state"] = "requires_action";
        output_tree["error"] = "IGDB credentials could not be encrypted on this host.";
        send_response(response, output_tree);
        return;
      }

      provider_state["name"] = "IGDB";
      provider_state["secretConfig"]["clientIdEncrypted"] = encrypted_client_id;
      provider_state["secretConfig"]["clientSecretEncrypted"] = encrypted_client_secret;
      provider_state["publicConfig"]["clientIdConfigured"] = true;
      provider_state["publicConfig"]["clientSecretConfigured"] = true;
      provider_state["statusMessage"] = "IGDB credentials are stored encrypted and ready for automatic poster and metadata fetching.";
    }

    if (!save_metadata_provider_state(provider_id, provider_state)) {
      output_tree["state"] = "error";
      output_tree["error"] = provider_state.value("name", provider_id) + " credentials were encrypted but could not be saved.";
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["state"] = "configured";
    output_tree["tokenEncrypted"] = true;
    output_tree["vaultProvider"] = vault_provider_name();
    output_tree["metadata"] = build_library_metadata_status();
    output_tree["message"] = provider_state.value("name", provider_id) + " provider configured.";
    send_response(response, output_tree);
  }

  /**
   * @brief Get poster and metadata provider readiness for the game library.
   * @api_examples{/api/library/metadata/status| GET| null}
   */
  void getLibraryMetadataStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["metadata"] = build_library_metadata_status();
    send_response(response, output_tree);
  }

} // namespace confighttp
