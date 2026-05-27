/**
 * @file src/confighttp.cpp
 * @brief Definitions for the Web UI Config HTTPS server.
 *
 * @todo Authentication, better handling of routes common to nvhttp, cleanup
 */
#define BOOST_BIND_GLOBAL_PLACEHOLDERS

// standard includes
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

// lib includes
#include <boost/algorithm/string.hpp>
#include <boost/asio.hpp>
#include <boost/asio/ssl/context.hpp>
#include <boost/filesystem.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <nlohmann/json.hpp>
#include <Simple-Web-Server/crypto.hpp>
#include <Simple-Web-Server/server_https.hpp>

// local includes
#include "config.h"
#include "confighttp.h"
#include "crypto.h"
#include "file_handler.h"
#include "globals.h"
#include "http_auth.h"
#include "httpcommon.h"
#include "platform/common.h"
#ifdef _WIN32
  #include "src/platform/windows/image_convert.h"

#endif
#include "logging.h"
#include "network.h"
#include "system_metrics.h"
#include "nvhttp.h"
#include "platform/common.h"
#include "rtsp.h"
#include "server_rbac.h"
#include "stream.h"
#include "video.h"
#include "webrtc_stream.h"

#ifdef _WIN32
  #include "platform/windows/virtual_display_cleanup.h"
  #include "platform/windows/autostart.h"
  #include "platform/windows/virtual_display.h"
#endif

#include <nlohmann/json.hpp>
#if defined(_WIN32)
  #include "platform/windows/misc.h"
  #include "src/platform/windows/ipc/misc_utils.h"
  #include "src/platform/windows/playnite_integration.h"
  #include "src/platform/windows/playnite_sync.h"

  #include <windows.h>
#endif
#include "display_helper_integration.h"
#include "process.h"
#include "display_helper_integration.h"
#include "process.h"
#include "state_storage.h"
#include "utility.h"
#include "update.h"
#include "uuid.h"
#include "version_compare.h"
#include "confighttp_internal.h"
#if defined(_WIN32)
  #include "platform/windows/misc.h"

  #include <KnownFolders.h>
  #include <ShlObj.h>
  #include <windows.h>
#endif

#ifdef _WIN32
  #include "platform/windows/utils.h"
  #include <Lmcons.h>
  #include <wincrypt.h>
#endif

using namespace std::literals;
namespace pt = boost::property_tree;

#ifndef JUJO_IGDB_CLIENT_ID
  #define JUJO_IGDB_CLIENT_ID "i94x52ql56ona9ie7baf8p7t4ii3tb"
#endif

#ifndef JUJO_IGDB_CLIENT_SECRET
  #define JUJO_IGDB_CLIENT_SECRET "i94x52ql56ona9ie7baf8p7t4ii3tb"
#endif

namespace confighttp {
  namespace fs = std::filesystem;

  // Extern-declared in confighttp.h — definitions live here
  std::string sessionCookie;
  std::chrono::time_point<std::chrono::steady_clock> cookie_creation_time;

  // Global MIME type lookup used for static file responses
  const std::map<std::string, std::string> mime_types = {
    {"css", "text/css"},
    {"gif", "image/gif"},
    {"htm", "text/html"},
    {"html", "text/html"},
    {"ico", "image/x-icon"},
    {"jpeg", "image/jpeg"},
    {"jpg", "image/jpeg"},
    {"js", "application/javascript"},
    {"json", "application/json"},
    {"png", "image/png"},
    {"webp", "image/webp"},
    {"svg", "image/svg+xml"},
    {"ttf", "font/ttf"},
    {"txt", "text/plain"},
    {"woff2", "font/woff2"},
    {"xml", "text/xml"},
  };

  static std::string app_source_id(const nlohmann::json &app);
  static std::string app_provider_game_id(const nlohmann::json &app);
  static std::string steam_cdn_poster_url(const std::string &appid);
  static std::string steam_local_art_url(const std::string &appid);
  static std::string current_game_source_install_id();
  static bool game_source_binding_is_current(const nlohmann::json &source_state);
  static bool provider_app_binding_is_current(const nlohmann::json &app);
  bool is_store_game_source(const std::string &source_id);
  std::string game_source_name(const std::string &source_id);
  bool game_source_is_connected(const nlohmann::json &states, const std::string &source_id);

  // Helper: sort apps by their 'name' field, if present
  static void sort_apps_by_name(nlohmann::json &file_tree) {
    try {
      if (!file_tree.contains("apps") || !file_tree["apps"].is_array()) {
        return;
      }
      auto &apps_node = file_tree["apps"];
      std::sort(apps_node.begin(), apps_node.end(), [](const nlohmann::json &a, const nlohmann::json &b) {
        try {
          return a.at("name").get<std::string>() < b.at("name").get<std::string>();
        } catch (...) {
          return false;
        }
      });
    } catch (...) {}
  }

  bool refresh_client_apps_cache(nlohmann::json &file_tree, bool sort_by_name) {
    try {
      if (sort_by_name) {
        sort_apps_by_name(file_tree);
      }
      proc::write_apps_file(config::stream.file_apps, file_tree);
      proc::refresh(config::stream.file_apps, false);
      return true;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "refresh_client_apps_cache: failed: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "refresh_client_apps_cache: failed (unknown)";
    }
    return false;
  }

  int auto_import_installed_provider_games(const std::string &source_id, const nlohmann::json &games) {
    if (!is_store_game_source(source_id)) {
      return 0;
    }
    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      auto &apps_node = file_tree["apps"];
      if (!apps_node.is_array()) {
        apps_node = nlohmann::json::array();
      }

      std::unordered_set<std::string> existing;
      for (const auto &app : apps_node) {
        if (!app.is_object()) {
          continue;
        }
        const auto app_source = app_source_id(app);
        const auto provider_id = app_provider_game_id(app);
        if (!app_source.empty() && !provider_id.empty()) {
          existing.insert(app_source + ":" + provider_id);
        }
      }

      int imported = 0;
      for (const auto &game : games) {
        if (!game.is_object() || !game.value("installed", false)) {
          continue;
        }
        const auto provider_id = game.value("providerGameId", std::string {});
        if (provider_id.empty() || existing.contains(source_id + ":" + provider_id)) {
          continue;
        }
        const auto title = game.value("title", game_source_name(source_id) + " game " + provider_id);
        std::string launch_uri;
        if (source_id == "steam") {
          launch_uri = "steam://rungameid/" + provider_id;
        } else if (source_id == "epic") {
          launch_uri = "com.epicgames.launcher://apps/" + provider_id + "?action=launch&silent=true";
        } else {
          launch_uri = game.value("executablePath", std::string {});
        }
        if (launch_uri.empty()) {
          continue;
        }
        nlohmann::json app;
        app["name"] = title;
        app["cmd"] = "cmd /c start \"\" \"" + launch_uri + "\"";
        app["working-dir"] = game.value("installPath", std::string {});
        app["source"] = source_id;
        app["source-id"] = source_id;
        app["source_id"] = provider_id;
        app["provider-game-id"] = provider_id;
        app["source-install-id"] = current_game_source_install_id();
        if (source_id == "steam") {
          // Prefer local Steam librarycache art over CDN poster cache over CDN URL.
          // Store filesystem paths so /appasset can serve them directly.
          const auto local_art_path = steam_local_art_path_for_type(provider_id, "portrait");
          if (!local_art_path.empty()) {
            app["image-path"] = local_art_path.string();
          } else {
            const auto header_path = steam_local_art_path_for_type(provider_id, "header");
            if (!header_path.empty()) {
              app["image-path"] = header_path.string();
            } else {
              // Fall back to the prefetch cache path (will be populated by background worker).
              app["image-path"] = steam_poster_cache_path(provider_id).string();
            }
          }
        } else {
          const auto poster_path = game.value("posterUrl", std::string {});
          if (!poster_path.empty() && poster_path.rfind("http://", 0) != 0 && poster_path.rfind("https://", 0) != 0) {
            app["image-path"] = poster_path;
          }
        }
        app["auto_managed"] = true;
        app["auto-detach"] = true;
        app["uuid"] = uuid_util::uuid_t::generate().string();
        apps_node.push_back(app);
        existing.insert(source_id + ":" + provider_id);
        ++imported;
      }

      if (imported > 0) {
        refresh_client_apps_cache(file_tree, true);
      }
      return imported;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "provider auto import failed: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "provider auto import failed";
    }
    return 0;
  }

  bool provider_app_matches_source(const nlohmann::json &app, const std::string &source_id) {
    if (!app.is_object()) {
      return false;
    }
    if (app_source_id(app) == source_id) {
      return true;
    }

    const auto source_camel = json_string_value(app, "sourceId");
    if (source_camel == source_id) {
      return true;
    }

    if (source_id == "steam" && !app_provider_game_id(app).empty()) {
      auto command = json_string_value(app, "cmd");
      if (command.empty() && app.contains("cmd") && app["cmd"].is_array() && !app["cmd"].empty() && app["cmd"][0].is_string()) {
        command = app["cmd"][0].get<std::string>();
      }
      boost::algorithm::to_lower(command);
      if (command.find("steam://rungameid/") != std::string::npos) {
        return true;
      }
    }

    return false;
  }

  int purge_provider_apps_for_source(const std::string &source_id) {
    if (!is_store_game_source(source_id)) {
      return 0;
    }

    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      auto &apps_node = file_tree["apps"];
      if (!apps_node.is_array()) {
        return 0;
      }

      nlohmann::json kept = nlohmann::json::array();
    int removed = 0;
    for (const auto &app : apps_node) {
      if (provider_app_matches_source(app, source_id)) {
        ++removed;
        continue;
      }
        kept.push_back(app);
      }

      if (removed > 0) {
        file_tree["apps"] = kept;
        refresh_client_apps_cache(file_tree, true);
      }
      return removed;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "provider purge failed for " << source_id << ": " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "provider purge failed for " << source_id;
    }
    return 0;
  }

  nlohmann::json read_apps_array_or_empty() {
    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      if (file_tree.contains("apps") && file_tree["apps"].is_array()) {
        return file_tree["apps"];
      }
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "setup status: failed to read apps file: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "setup status: failed to read apps file";
    }
    return nlohmann::json::array();
  }

  static bool json_string_not_empty(const nlohmann::json &node, const char *key) {
    if (!node.contains(key) || !node[key].is_string()) {
      return false;
    }
    const auto value = node[key].get<std::string>();
    return std::any_of(value.begin(), value.end(), [](unsigned char ch) {
      return !std::isspace(ch);
    });
  }

  bool is_playnite_library_entry(const nlohmann::json &app) {
    return app.is_object() && json_string_not_empty(app, "playnite-id");
  }

  static bool is_playable_library_entry(const nlohmann::json &app) {
    if (!app.is_object()) {
      return false;
    }
    if (json_string_not_empty(app, "cmd")) {
      return true;
    }
    if (app.contains("cmd") && app["cmd"].is_array() && !app["cmd"].empty()) {
      return true;
    }
    return json_string_not_empty(app, "name");
  }

  static nlohmann::json readiness_check(
    const std::string &id,
    const std::string &label,
    const std::string &status,
    const std::string &summary,
    const std::string &action,
    const std::string &path
  ) {
    return {
      {"id", id},
      {"label", label},
      {"status", status},
      {"summary", summary},
      {"action", action},
      {"path", path}
    };
  }

  nlohmann::json read_game_source_states();
  nlohmann::json source_state_or_empty(const nlohmann::json &states, const std::string &source_id);

  static bool file_is_regular(const fs::path &path);

  std::string json_string_value(const nlohmann::json &node, const char *key);
  static std::string app_source_id(const nlohmann::json &app);
  static std::string app_provider_game_id(const nlohmann::json &app);
  static std::string steam_cdn_poster_url(const std::string &appid);

  bool save_game_source_state(const std::string &source_id, const nlohmann::json &source_state);
  static nlohmann::json read_metadata_provider_states();
  static nlohmann::json metadata_provider_state_or_empty(const nlohmann::json &states, const std::string &provider_id);

  nlohmann::json build_game_sources_summary(const nlohmann::json &apps) {
    int manual_count = 0;
    int playable_manual_count = 0;
    std::unordered_map<std::string, int> store_counts;
    std::unordered_map<std::string, int> playable_store_counts;

    for (const auto &app : apps) {
      if (!app.is_object()) {
        continue;
      }
      const bool playable = is_playable_library_entry(app);
      const auto source_id = app_source_id(app);
      if (is_store_game_source(source_id)) {
        ++store_counts[source_id];
        if (playable) {
          ++playable_store_counts[source_id];
        }
      } else {
        ++manual_count;
        if (playable) {
          ++playable_manual_count;
        }
      }
    }

    const auto persisted_states = read_game_source_states();

    auto source = [&](const std::string &id, const std::string &name, bool detected, int games, int playable, const std::string &kind) {
      const auto persisted = source_state_or_empty(persisted_states, id);
      const bool binding_current = !is_store_game_source(id) || game_source_binding_is_current(persisted);
      const bool persisted_connected = game_source_is_connected(persisted_states, id);
      const bool connected = kind == "store" ? persisted_connected : detected;
      const bool expose_counts = binding_current && (kind != "store" || connected);
      const auto connection_state = persisted.value(
        "connectionState",
        connected ? "connected" : (kind == "store" ? "not_connected" : "not_connected")
      );
      const bool disabled = persisted.value("disabled", false);
      const auto sync_state = disabled ? "disabled" : persisted.value("syncState", connected || persisted_connected ? "ready" : "not_started");
      nlohmann::json item;
      item["id"] = id;
      item["name"] = name;
      item["kind"] = kind;
      item["connected"] = !disabled && connected;
      item["connectionState"] = disabled ? "disabled" : (binding_current ? connection_state : "not_connected");
      item["syncState"] = binding_current ? sync_state : "stale_install";
      item["gamesCount"] = expose_counts ? persisted.value("ownedGameCount", games) : 0;
      item["ownedGameCount"] = expose_counts ? persisted.value("ownedGameCount", games) : 0;
      item["installedGameCount"] = expose_counts ? persisted.value("installedGameCount", playable) : 0;
      item["playableGameCount"] = expose_counts ? persisted.value("playableGameCount", playable) : 0;
      item["needsAttentionCount"] = 0;
      item["tokenEncrypted"] = binding_current && persisted.value("tokenEncrypted", false);
      item["authAvailable"] = kind == "store";
      item["metadataAvailable"] = binding_current && persisted.value("metadataAvailable", false);
      item["posterProvider"] = binding_current ? persisted.value("posterProvider", "pending") : "pending";
      item["connectPath"] = "/api/game-sources/" + id + "/connect";
      item["syncPath"] = "/api/game-sources/" + id + "/sync";
      item["disconnectPath"] = "/api/game-sources/" + id + "/disconnect";
      item["lastSynced"] = persisted.contains("lastSynced") ? persisted["lastSynced"] : nlohmann::json(nullptr);
      item["vaultProvider"] = vault_provider_name();
      item["disabled"] = disabled;
      if (persisted.contains("publicConfig") && persisted["publicConfig"].is_object()) {
        item["publicConfig"] = persisted["publicConfig"];
      }
      if (kind == "store" && !binding_current) {
        item["statusMessage"] = "Provider connection belongs to a previous server installation. Connect again to import games for this install.";
      } else if (kind == "store") {
        item["statusMessage"] = persisted.value(
          "statusMessage",
          "Provider account connection is ready for OAuth configuration. Tokens are not persisted until encrypted storage is enabled."
        );
      } else if (kind == "manual") {
        item["statusMessage"] = "Manual games are managed directly in the library.";
      } else {
        item["statusMessage"] = "Legacy Playnite entries are available through the compatibility importer.";
      }
      return item;
    };

    nlohmann::json sources = nlohmann::json::array();
    sources.push_back(source("steam", "Steam", store_counts["steam"] > 0, store_counts["steam"], playable_store_counts["steam"], "store"));
    sources.push_back(source("epic", "Epic Games", store_counts["epic"] > 0, store_counts["epic"], playable_store_counts["epic"], "store"));
    sources.push_back(source("gog", "GOG", store_counts["gog"] > 0, store_counts["gog"], playable_store_counts["gog"], "store"));
    sources.push_back(source("xbox", "Xbox", store_counts["xbox"] > 0, store_counts["xbox"], playable_store_counts["xbox"], "store"));
    sources.push_back(source("manual", "Manual", manual_count > 0, manual_count, playable_manual_count, "manual"));
    return sources;
  }

  static int connected_source_count(const nlohmann::json &sources) {
    int count = 0;
    for (const auto &source : sources) {
      if (source.value("connected", false)) {
        ++count;
      }
    }
    return count;
  }

  bool game_source_is_connected(const nlohmann::json &states, const std::string &source_id) {
    if (!is_store_game_source(source_id)) {
      return true;
    }
    const auto state = source_state_or_empty(states, source_id);
    if (!state.is_object() || state.value("disabled", false)) {
      return false;
    }
    if (!game_source_binding_is_current(state)) {
      return false;
    }
    return state.value("connected", false) ||
           state.value("connectionState", std::string {}) == "connected" ||
           state.value("tokenEncrypted", false);
  }

  nlohmann::json visible_apps_for_current_sources(const nlohmann::json &apps) {
    nlohmann::json visible = nlohmann::json::array();
    if (!apps.is_array()) {
      return visible;
    }

    const auto states = read_game_source_states();
    const bool playnite_disabled = source_state_or_empty(states, "playniteLegacy").value("disabled", false);
    for (const auto &app : apps) {
      if (!app.is_object()) {
        continue;
      }
      const auto source_id = app_source_id(app);
      if (is_store_game_source(source_id)) {
        if (!game_source_is_connected(states, source_id) || !provider_app_binding_is_current(app)) {
          continue;
        }
      }
      if (source_id == "playniteLegacy" && playnite_disabled) {
        continue;
      }
      visible.push_back(app);
    }
    return visible;
  }

  int playable_game_count(const nlohmann::json &apps) {
    int count = 0;
    for (const auto &app : apps) {
      if (is_playable_library_entry(app)) {
        ++count;
      }
    }
    return count;
  }

  int paired_client_count() {
    try {
      auto clients = nvhttp::get_all_clients();
      return clients.is_array() ? static_cast<int>(clients.size()) : 0;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "setup status: failed to count paired clients: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "setup status: failed to count paired clients";
    }
    return 0;
  }

  bool is_store_game_source(const std::string &source_id) {
    return source_id == "steam" || source_id == "epic" || source_id == "gog" || source_id == "xbox";
  }

  bool is_known_game_source(const std::string &source_id) {
    return is_store_game_source(source_id) || source_id == "manual" || source_id == "playniteLegacy";
  }

  std::string json_string_value(const nlohmann::json &node, const char *key);

  nlohmann::json provider_connection_requirements(const std::string &source_id) {
    nlohmann::json requirements = nlohmann::json::array();
    if (source_id == "steam") {
      requirements.push_back("Steam browser sign-in");
      requirements.push_back("Steam Store web session for owned-library sync");
      requirements.push_back("Local Steam manifests for installed-game detection");
      requirements.push_back("Steam Web API key only for private-account fallback");
    } else if (source_id == "epic") {
      requirements.push_back("Local Epic launcher manifests for installed-game detection");
      requirements.push_back("Epic account auth later for full owned-library sync");
    } else if (source_id == "gog") {
      requirements.push_back("Local GOG Galaxy/GOG Games install metadata");
      requirements.push_back("GOG account auth later for full owned-library sync");
    } else if (source_id == "xbox") {
      requirements.push_back("Local Xbox Games install folders");
      requirements.push_back("Microsoft account auth later for full owned-library sync");
    }
    return requirements;
  }

  static fs::path game_source_install_marker_path() {
    const auto appdata = fs::path(platf::appdata());
#ifdef _WIN32
    const auto install_root = appdata.parent_path();
    if (!install_root.empty()) {
      return install_root / ".jujo-server-install-id";
    }
#endif
    return appdata / ".jujo-server-install-id";
  }

  static std::string clean_install_id(std::string value) {
    boost::algorithm::trim(value);
    return value;
  }

  static std::string current_game_source_install_id() {
    static std::mutex mutex;
    static std::string cached;
    std::lock_guard<std::mutex> lock(mutex);
    if (!cached.empty()) {
      return cached;
    }

    const auto marker = game_source_install_marker_path();
    try {
      std::ifstream in(marker);
      std::stringstream buffer;
      buffer << in.rdbuf();
      cached = clean_install_id(buffer.str());
      if (!cached.empty()) {
        return cached;
      }
    } catch (...) {
    }

    cached = uuid_util::uuid_t::generate().string();
    try {
      const auto parent = marker.parent_path();
      if (!parent.empty()) {
        fs::create_directories(parent);
      }
      std::ofstream out(marker, std::ios::trunc);
      out << cached << '\n';
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "game sources: failed to persist install marker: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "game sources: failed to persist install marker";
    }
    return cached;
  }

  static bool game_source_binding_is_current(const nlohmann::json &source_state) {
    if (!source_state.is_object()) {
      return false;
    }
    const auto bound_install_id = json_string_value(source_state, "boundInstallId");
    if (bound_install_id.empty()) {
      return true;
    }
    return bound_install_id == current_game_source_install_id();
  }

  static bool provider_app_binding_is_current(const nlohmann::json &app) {
    const auto bound_install_id = json_string_value(app, "source-install-id");
    if (bound_install_id.empty()) {
      return true;
    }
    return bound_install_id == current_game_source_install_id();
  }

  static nlohmann::json read_jujoserver_state_json() {
    statefile::migrate_recent_state_keys();
    const auto &path = statefile::jujoserver_state_path();
    if (path.empty()) {
      return {{"root", nlohmann::json::object()}};
    }
    try {
      std::lock_guard<std::mutex> lock(statefile::state_mutex());
      const auto content = file_handler::read_file(path.c_str());
      if (!content.empty()) {
        auto state = nlohmann::json::parse(content);
        if (!state.contains("root") || !state["root"].is_object()) {
          state["root"] = nlohmann::json::object();
        }
        return state;
      }
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "game sources: failed to read state file: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "game sources: failed to read state file";
    }
    return {{"root", nlohmann::json::object()}};
  }

  static bool write_jujoserver_state_json(const nlohmann::json &state) {
    statefile::migrate_recent_state_keys();
    const auto &path = statefile::jujoserver_state_path();
    if (path.empty()) {
      return false;
    }
    try {
      const auto parent = file_handler::get_parent_directory(path);
      if (!parent.empty()) {
        file_handler::make_directory(parent);
      }
      std::lock_guard<std::mutex> lock(statefile::state_mutex());
      return file_handler::write_file(path.c_str(), state.dump(4)) == 0;
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "game sources: failed to write state file: " << e.what();
    } catch (...) {
      BOOST_LOG(error) << "game sources: failed to write state file";
    }
    return false;
  }

  nlohmann::json read_game_source_states() {
    auto state = read_jujoserver_state_json();
    try {
      if (state["root"].contains("game_sources") && state["root"]["game_sources"].is_object()) {
        auto game_sources = state["root"]["game_sources"];
        if (game_sources.contains("sources") && game_sources["sources"].is_object()) {
          return game_sources["sources"];
        }
      }
    } catch (...) {}
    return nlohmann::json::object();
  }

  static nlohmann::json normalize_game_source_state(const nlohmann::json &source_state);

  nlohmann::json source_state_or_empty(const nlohmann::json &states, const std::string &source_id) {
    try {
      if (states.contains(source_id) && states[source_id].is_object()) {
        return normalize_game_source_state(states[source_id]);
      }
    } catch (...) {}
    return nlohmann::json::object();
  }

  static bool parse_legacy_bool(const nlohmann::json &node, bool fallback) {
    if (node.is_boolean()) {
      return node.get<bool>();
    }
    if (node.is_number_integer()) {
      return node.get<int>() != 0;
    }
    if (node.is_string()) {
      auto text = node.get<std::string>();
      boost::algorithm::to_lower(text);
      boost::algorithm::trim(text);
      if (text == "true" || text == "1" || text == "yes" || text == "on") {
        return true;
      }
      if (text == "false" || text == "0" || text == "no" || text == "off" || text.empty()) {
        return false;
      }
    }
    return fallback;
  }

  static int parse_legacy_int(const nlohmann::json &node, int fallback) {
    if (node.is_number_integer()) {
      return node.get<int>();
    }
    if (node.is_number()) {
      return static_cast<int>(node.get<double>());
    }
    if (node.is_string()) {
      try {
        auto text = node.get<std::string>();
        boost::algorithm::trim(text);
        if (!text.empty()) {
          return std::stoi(text);
        }
      } catch (...) {
      }
    }
    return fallback;
  }

  static void normalize_bool_key(nlohmann::json &node, const char *key, bool fallback = false) {
    if (node.is_object() && node.contains(key)) {
      node[key] = parse_legacy_bool(node[key], fallback);
    }
  }

  static void normalize_int_key(nlohmann::json &node, const char *key, int fallback = 0) {
    if (node.is_object() && node.contains(key)) {
      node[key] = parse_legacy_int(node[key], fallback);
    }
  }

  static nlohmann::json normalize_game_source_state(const nlohmann::json &source_state) {
    if (!source_state.is_object()) {
      return nlohmann::json::object();
    }

    auto normalized = source_state;
    normalize_bool_key(normalized, "connected");
    normalize_bool_key(normalized, "disabled");
    normalize_bool_key(normalized, "tokenEncrypted");
    normalize_bool_key(normalized, "metadataAvailable");
    normalize_int_key(normalized, "ownedGameCount");
    normalize_int_key(normalized, "installedGameCount");
    normalize_int_key(normalized, "playableGameCount");

    if (normalized.contains("publicConfig") && normalized["publicConfig"].is_object()) {
      normalize_bool_key(normalized["publicConfig"], "apiKeyConfigured");
      normalize_bool_key(normalized["publicConfig"], "webLoginLibraryCaptured");
      normalize_int_key(normalized["publicConfig"], "webOwnedAppCount");
    }

    if (normalized.contains("games") && normalized["games"].is_array()) {
      for (auto &game : normalized["games"]) {
        normalize_bool_key(game, "owned");
        normalize_bool_key(game, "installed");
        normalize_bool_key(game, "playable");
      }
    }

    return normalized;
  }

  bool vault_encryption_available() {
#ifdef _WIN32
    return true;
#else
    return false;
#endif
  }

  std::string vault_provider_name() {
#ifdef _WIN32
    return "windows-dpapi";
#else
    return "unavailable";
#endif
  }

  bool encrypt_provider_secret(const std::string &plaintext, std::string &ciphertext_hex) {
    if (plaintext.empty()) {
      ciphertext_hex.clear();
      return true;
    }
#ifdef _WIN32
    DATA_BLOB input {};
    input.pbData = reinterpret_cast<BYTE *>(const_cast<char *>(plaintext.data()));
    input.cbData = static_cast<DWORD>(plaintext.size());

    const std::string entropy_text = "Jujo.StreamServer.game-source-vault.v1";
    DATA_BLOB entropy {};
    entropy.pbData = reinterpret_cast<BYTE *>(const_cast<char *>(entropy_text.data()));
    entropy.cbData = static_cast<DWORD>(entropy_text.size());

    DATA_BLOB output {};
    if (!CryptProtectData(&input, L"Jujo.Stream Server game source token", &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &output)) {
      BOOST_LOG(error) << "game sources: CryptProtectData failed: " << GetLastError();
      return false;
    }
    auto free_output = util::fail_guard([&]() {
      LocalFree(output.pbData);
    });
    std::vector<std::uint8_t> protected_bytes(output.pbData, output.pbData + output.cbData);
    ciphertext_hex = util::hex_vec(protected_bytes, true);
    return true;
#else
    (void) plaintext;
    (void) ciphertext_hex;
    return false;
#endif
  }

  static bool decrypt_provider_secret(const std::string &ciphertext_hex, std::string &plaintext) {
    plaintext.clear();
    if (ciphertext_hex.empty()) {
      return true;
    }
#ifdef _WIN32
    const auto protected_text = util::from_hex_vec(ciphertext_hex, true);
    DATA_BLOB input {};
    input.pbData = reinterpret_cast<BYTE *>(const_cast<char *>(protected_text.data()));
    input.cbData = static_cast<DWORD>(protected_text.size());

    const std::string entropy_text = "Jujo.StreamServer.game-source-vault.v1";
    DATA_BLOB entropy {};
    entropy.pbData = reinterpret_cast<BYTE *>(const_cast<char *>(entropy_text.data()));
    entropy.cbData = static_cast<DWORD>(entropy_text.size());

    DATA_BLOB output {};
    if (!CryptUnprotectData(&input, nullptr, &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &output)) {
      BOOST_LOG(error) << "game sources: CryptUnprotectData failed: " << GetLastError();
      return false;
    }
    auto free_output = util::fail_guard([&]() {
      LocalFree(output.pbData);
    });
    plaintext.assign(reinterpret_cast<char *>(output.pbData), reinterpret_cast<char *>(output.pbData + output.cbData));
    return true;
#else
    (void) ciphertext_hex;
    return false;
#endif
  }

  size_t write_curl_string_callback(void *contents, size_t size, size_t nmemb, void *userp) {
    const auto bytes = size * nmemb;
    auto *out = static_cast<std::string *>(userp);
    out->append(static_cast<char *>(contents), bytes);
    return bytes;
  }

  static bool http_get_json(const std::string &url, nlohmann::json &out_json, long &http_code, std::string &error) {
    http_code = 0;
    error.clear();
    std::string response_body;
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    try {
      out_json = nlohmann::json::parse(response_body);
      return true;
    } catch (const std::exception &e) {
      error = e.what();
    } catch (...) {
      error = "Invalid JSON response";
    }
    return false;
  }

  static bool http_get_string(const std::string &url, std::string &response_body, long &http_code, std::string &error) {
    http_code = 0;
    error.clear();
    response_body.clear();
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    return true;
  }

  static bool http_post_form_string(const std::string &url, const std::string &form_body, std::string &response_body, long &http_code, std::string &error) {
    http_code = 0;
    error.clear();
    response_body.clear();
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, form_body.c_str());
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    struct curl_slist *headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/x-www-form-urlencoded");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    auto free_headers = util::fail_guard([&]() {
      curl_slist_free_all(headers);
    });
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    return true;
  }

  static bool parse_json_response(const std::string &response_body, nlohmann::json &out_json, std::string &error) {
    try {
      out_json = nlohmann::json::parse(response_body.empty() ? "{}" : response_body);
      return true;
    } catch (const std::exception &e) {
      error = e.what();
    } catch (...) {
      error = "Invalid JSON response";
    }
    return false;
  }

  static bool http_post_form_json_basic(
    const std::string &url,
    const std::string &form_body,
    const std::string &username,
    const std::string &password,
    nlohmann::json &out_json,
    long &http_code,
    std::string &error
  ) {
    http_code = 0;
    error.clear();
    std::string response_body;
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, form_body.c_str());
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    if (!username.empty()) {
      curl_easy_setopt(curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
      curl_easy_setopt(curl, CURLOPT_USERNAME, username.c_str());
      curl_easy_setopt(curl, CURLOPT_PASSWORD, password.c_str());
    }
    struct curl_slist *headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/x-www-form-urlencoded");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    auto free_headers = util::fail_guard([&]() {
      curl_slist_free_all(headers);
    });
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    return parse_json_response(response_body, out_json, error);
  }

  static bool http_get_json_bearer(const std::string &url, const std::string &access_token, nlohmann::json &out_json, long &http_code, std::string &error) {
    http_code = 0;
    error.clear();
    std::string response_body;
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    struct curl_slist *headers = nullptr;
    const auto auth_header = "Authorization: Bearer " + access_token;
    headers = curl_slist_append(headers, auth_header.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    auto free_headers = util::fail_guard([&]() {
      curl_slist_free_all(headers);
    });
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    return parse_json_response(response_body, out_json, error);
  }

  static bool http_post_igdb_json(
    const std::string &endpoint,
    const std::string &client_id,
    const std::string &access_token,
    const std::string &query,
    nlohmann::json &out_json,
    long &http_code,
    std::string &error
  ) {
    http_code = 0;
    error.clear();
    std::string response_body;
    CURL *curl = curl_easy_init();
    if (!curl) {
      error = "Unable to initialize HTTP client";
      return false;
    }
    auto cleanup = util::fail_guard([&]() {
      curl_easy_cleanup(curl);
    });
    char errbuf[CURL_ERROR_SIZE] {};
    http::configure_curl_tls(curl);
    const auto url = "https://api.igdb.com/v4/" + endpoint;
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, query.c_str());
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Jujo.StreamServer/0.1");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_curl_string_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_body);
    curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, errbuf);
    struct curl_slist *headers = nullptr;
    const auto client_header = "Client-ID: " + client_id;
    const auto auth_header = "Authorization: Bearer " + access_token;
    headers = curl_slist_append(headers, client_header.c_str());
    headers = curl_slist_append(headers, auth_header.c_str());
    headers = curl_slist_append(headers, "Accept: application/json");
    headers = curl_slist_append(headers, "Content-Type: text/plain");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    auto free_headers = util::fail_guard([&]() {
      curl_slist_free_all(headers);
    });
    const auto res = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
    if (res != CURLE_OK) {
      error = errbuf[0] ? errbuf : curl_easy_strerror(res);
      return false;
    }
    return parse_json_response(response_body, out_json, error);
  }

  std::string request_scheme_and_host(req_https_t request) {
    auto host = request->header.find("Host");
    if (host != request->header.end() && !host->second.empty()) {
      return "https://" + host->second;
    }
    return "https://localhost";
  }

  std::unordered_map<std::string, std::string> query_params_from_target(const std::string &target) {
    std::unordered_map<std::string, std::string> params;
    const auto query_pos = target.find('?');
    if (query_pos == std::string::npos || query_pos + 1 >= target.size()) {
      return params;
    }
    std::string query = target.substr(query_pos + 1);
    std::stringstream ss(query);
    std::string pair;
    while (std::getline(ss, pair, '&')) {
      const auto eq = pair.find('=');
      const auto key = http::cookie_unescape(eq == std::string::npos ? pair : pair.substr(0, eq));
      const auto value = eq == std::string::npos ? std::string {} : http::cookie_unescape(pair.substr(eq + 1));
      params[key] = value;
    }
    return params;
  }

  std::string steam_openid_auth_url(const std::string &base_url) {
    const auto return_to = base_url + "/api/game-sources/steam/auth/callback";
    const auto realm = base_url + "/";
    return "https://steamcommunity.com/openid/login?"
      "openid.ns=http://specs.openid.net/auth/2.0"
      "&openid.mode=checkid_setup"
      "&openid.return_to=" + http::url_escape(return_to) +
      "&openid.realm=" + http::url_escape(realm) +
      "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select"
      "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select";
  }

  static std::optional<std::string> extract_steam_id_from_claimed_id(const std::string &claimed_id) {
    boost::regex re("https?://steamcommunity\\.com/openid/id/([0-9]+)");
    boost::smatch match;
    if (boost::regex_match(claimed_id, match, re) && match.size() > 1) {
      return match[1].str();
    }
    return std::nullopt;
  }

  bool verify_steam_openid_response(const std::unordered_map<std::string, std::string> &params, std::string &steam_id, std::string &error) {
    steam_id.clear();
    error.clear();
    auto mode = params.find("openid.mode");
    auto claimed = params.find("openid.claimed_id");
    if (mode == params.end() || mode->second != "id_res" || claimed == params.end()) {
      error = "Steam sign-in response is incomplete.";
      return false;
    }
    const auto parsed_steam_id = extract_steam_id_from_claimed_id(claimed->second);
    if (!parsed_steam_id) {
      error = "Steam sign-in response did not include a valid SteamID.";
      return false;
    }

    std::string body = "openid.mode=check_authentication";
    for (const auto &[key, value] : params) {
      if (key == "openid.mode") {
        continue;
      }
      body += "&" + http::url_escape(key) + "=" + http::url_escape(value);
    }

    std::string verification;
    long http_code = 0;
    if (!http_post_form_string("https://steamcommunity.com/openid/login", body, verification, http_code, error)) {
      if (error.empty()) {
        error = "Steam sign-in verification failed.";
      }
      return false;
    }
    if (http_code < 200 || http_code >= 300 || verification.find("is_valid:true") == std::string::npos) {
      error = "Steam did not validate the sign-in response.";
      return false;
    }
    steam_id = *parsed_steam_id;
    return true;
  }

  static constexpr const char *k_gog_client_id = "46899977096215655";
  static constexpr const char *k_gog_client_secret = "9d85c43b1482497dbbce61f6e4aa173a433796eeae2ca8c5f6129f2dc4de46d9";
  static constexpr const char *k_epic_client_id = "34a02cf8f4414e29b15921876da36f9a";
  static constexpr const char *k_epic_client_secret = "daafbccc737745039dffe53d94fc76cf";

  std::string gog_auth_url(const std::string &base_url) {
    const auto redirect_uri = base_url + "/api/game-sources/gog/auth/callback";
    return "https://auth.gog.com/auth?client_id="s + k_gog_client_id +
      "&redirect_uri=" + http::url_escape(redirect_uri) +
      "&response_type=code&layout=client2";
  }

  std::string epic_auth_url() {
    const auto redirect_url = "https://www.epicgames.com/id/api/redirect?clientId="s + k_epic_client_id + "&responseType=code";
    return "https://www.epicgames.com/id/login?redirectUrl=" + http::url_escape(redirect_url);
  }

  bool save_oauth_session(nlohmann::json &source_state, const nlohmann::json &session, std::string &error) {
    std::string encrypted;
    if (!encrypt_provider_secret(session.dump(), encrypted)) {
      error = "OAuth session could not be encrypted on this host.";
      return false;
    }
    source_state["secretConfig"]["oauthSessionEncrypted"] = encrypted;
    source_state["tokenEncrypted"] = true;
    source_state["vaultProvider"] = vault_provider_name();
    return true;
  }

  static bool load_oauth_session(const nlohmann::json &source_state, nlohmann::json &session, std::string &error) {
    if (!source_state.contains("secretConfig") || !source_state["secretConfig"].is_object()) {
      error = "OAuth session is not stored.";
      return false;
    }
    const auto encrypted = json_string_value(source_state["secretConfig"], "oauthSessionEncrypted");
    if (encrypted.empty()) {
      error = "OAuth session is not stored.";
      return false;
    }
    std::string plaintext;
    if (!decrypt_provider_secret(encrypted, plaintext)) {
      error = "OAuth session could not be decrypted on this host.";
      return false;
    }
    try {
      session = nlohmann::json::parse(plaintext);
      return session.is_object();
    } catch (...) {
      error = "OAuth session is corrupt.";
    }
    return false;
  }

  bool gog_exchange_code(const std::string &code, const std::string &redirect_uri, nlohmann::json &session, std::string &error) {
    const auto url = "https://auth.gog.com/token?client_id="s + k_gog_client_id +
      "&client_secret=" + k_gog_client_secret +
      "&grant_type=authorization_code&code=" + http::url_escape(code) +
      "&redirect_uri=" + http::url_escape(redirect_uri);
    long http_code = 0;
    if (!http_get_json(url, session, http_code, error)) {
      return false;
    }
    if (http_code < 200 || http_code >= 300 || !session.contains("access_token")) {
      error = "GOG token exchange failed with HTTP " + std::to_string(http_code) + ".";
      return false;
    }
    return true;
  }

  static bool gog_refresh_session(nlohmann::json &source_state, nlohmann::json &session, std::string &error) {
    if (!load_oauth_session(source_state, session, error)) {
      return false;
    }
    const auto refresh_token = json_string_value(session, "refresh_token");
    if (refresh_token.empty()) {
      return json_string_not_empty(session, "access_token");
    }
    const auto url = "https://auth.gog.com/token?client_id="s + k_gog_client_id +
      "&client_secret=" + k_gog_client_secret +
      "&grant_type=refresh_token&refresh_token=" + http::url_escape(refresh_token);
    nlohmann::json refreshed;
    long http_code = 0;
    std::string refresh_error;
    if (http_get_json(url, refreshed, http_code, refresh_error) && http_code >= 200 && http_code < 300 && refreshed.contains("access_token")) {
      session = refreshed;
      return save_oauth_session(source_state, session, error);
    }
    return json_string_not_empty(session, "access_token");
  }

  bool epic_start_session(const std::string &grant_type, const std::string &token_value, nlohmann::json &session, std::string &error) {
    std::string form = "grant_type=" + http::url_escape(grant_type) + "&token_type=eg1";
    if (grant_type == "authorization_code") {
      form += "&code=" + http::url_escape(token_value);
    } else if (grant_type == "exchange_code") {
      form += "&exchange_code=" + http::url_escape(token_value);
    } else if (grant_type == "refresh_token") {
      form += "&refresh_token=" + http::url_escape(token_value);
    } else {
      error = "Unsupported Epic grant type.";
      return false;
    }
    long http_code = 0;
    if (!http_post_form_json_basic(
          "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token",
          form,
          k_epic_client_id,
          k_epic_client_secret,
          session,
          http_code,
          error
        )) {
      return false;
    }
    if (http_code < 200 || http_code >= 300 || !session.contains("access_token")) {
      error = session.value("errorMessage", "Epic token exchange failed with HTTP " + std::to_string(http_code) + ".");
      return false;
    }
    return true;
  }

  static bool epic_refresh_session(nlohmann::json &source_state, nlohmann::json &session, std::string &error) {
    if (!load_oauth_session(source_state, session, error)) {
      return false;
    }
    const auto refresh_token = json_string_value(session, "refresh_token");
    if (refresh_token.empty()) {
      return json_string_not_empty(session, "access_token");
    }
    nlohmann::json refreshed;
    std::string refresh_error;
    if (epic_start_session("refresh_token", refresh_token, refreshed, refresh_error)) {
      session = refreshed;
      return save_oauth_session(source_state, session, error);
    }
    return json_string_not_empty(session, "access_token");
  }


  static fs::path steam_metadata_cache_dir() {
    return fs::path(platf::appdata()) / "steam_metadata";
  }

  std::filesystem::path steam_poster_cache_path(const std::string &appid) {
    return fs::path(platf::appdata()) / "covers" / ("steam_" + appid + ".jpg");
  }

  static std::string steam_cdn_poster_url(const std::string &appid) {
    return "https://cdn.akamai.steamstatic.com/steam/apps/" + appid + "/library_600x900.jpg";
  }

  static std::string steam_cdn_header_url(const std::string &appid) {
    return "https://cdn.akamai.steamstatic.com/steam/apps/" + appid + "/header.jpg";
  }

  static std::string strip_html_tags(std::string text) {
    text = boost::regex_replace(text, boost::regex("<[^>]*>"), " ");
    text = boost::regex_replace(text, boost::regex("&quot;"), "\"");
    text = boost::regex_replace(text, boost::regex("&amp;"), "&");
    text = boost::regex_replace(text, boost::regex("&lt;"), "<");
    text = boost::regex_replace(text, boost::regex("&gt;"), ">");
    text = boost::regex_replace(text, boost::regex("\\s+"), " ");
    return trim_copy(text);
  }

  static nlohmann::json json_string_array_from_descriptions(const nlohmann::json &items) {
    nlohmann::json out = nlohmann::json::array();
    std::unordered_set<std::string> seen;
    if (!items.is_array()) {
      return out;
    }
    for (const auto &item : items) {
      const auto value = json_string_value(item, "description");
      if (!value.empty() && seen.insert(value).second) {
        out.push_back(value);
      }
    }
    return out;
  }

  static bool write_json_file_atomicish(const fs::path &path, const nlohmann::json &value) {
    try {
      file_handler::make_directory(path.parent_path().string());
      return file_handler::write_file(path.string().c_str(), value.dump(2)) == 0;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "Steam metadata: failed to write cache " << path.string() << ": " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "Steam metadata: failed to write cache " << path.string();
    }
    return false;
  }

  static std::optional<nlohmann::json> read_json_file_optional(const fs::path &path) {
    try {
      std::error_code ec;
      if (!fs::exists(path, ec) || !fs::is_regular_file(path, ec)) {
        return std::nullopt;
      }
      const auto raw = file_handler::read_file(path.string().c_str());
      if (raw.empty()) {
        return std::nullopt;
      }
      return nlohmann::json::parse(raw);
    } catch (...) {
      return std::nullopt;
    }
  }

  static bool ensure_steam_poster_cached(const std::string &appid) {
    if (appid.empty()) {
      return false;
    }
    const auto poster_path = steam_poster_cache_path(appid);
    std::error_code ec;
    if (fs::exists(poster_path, ec) && fs::is_regular_file(poster_path, ec)) {
      return true;
    }
    try {
      file_handler::make_directory(poster_path.parent_path().string());
      // Try portrait format (library_600x900) first; fall back to header if unavailable
      if (http::download_file(steam_cdn_poster_url(appid), poster_path.string())) {
        return true;
      }
      return http::download_file(steam_cdn_header_url(appid), poster_path.string());
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "Steam poster: failed to cache poster for " << appid << ": " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "Steam poster: failed to cache poster for " << appid;
    }
    return false;
  }

  // ─── Steam librarycache local art ──────────────────────────────────────────

  // Returns the Steam install root path from the Windows registry, or empty path.
  static fs::path get_steam_root_path() {
#ifdef _WIN32
    auto read_reg = [](HKEY root, const wchar_t *subkey, const wchar_t *value_name) -> std::optional<std::wstring> {
      DWORD type = 0, size = 0;
      if (RegGetValueW(root, subkey, value_name, RRF_RT_REG_SZ, &type, nullptr, &size) != ERROR_SUCCESS || size == 0) {
        return std::nullopt;
      }
      std::wstring buf(size / sizeof(wchar_t), L'\0');
      if (RegGetValueW(root, subkey, value_name, RRF_RT_REG_SZ, &type, buf.data(), &size) != ERROR_SUCCESS) {
        return std::nullopt;
      }
      while (!buf.empty() && buf.back() == L'\0') buf.pop_back();
      return buf;
    };
    auto path = read_reg(HKEY_CURRENT_USER, L"Software\\Valve\\Steam", L"SteamPath");
    if (!path) path = read_reg(HKEY_LOCAL_MACHINE, L"SOFTWARE\\WOW6432Node\\Valve\\Steam", L"InstallPath");
    if (!path) path = read_reg(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Valve\\Steam", L"InstallPath");
    if (path && !path->empty()) return fs::path(*path);
#endif
    return {};
  }

  // Returns the Steam appcache/librarycache/{appid} directory, or empty path.
  std::filesystem::path steam_librarycache_game_dir(const std::string &appid) {
    const auto root = get_steam_root_path();
    if (root.empty() || appid.empty()) return {};
    return root / "appcache" / "librarycache" / appid;
  }


  // Finds all locally available art files for a Steam appid in librarycache.
  std::vector<SteamLocalArtEntry> find_steam_local_art(const std::string &appid) {
    const auto art_dir = steam_librarycache_game_dir(appid);
    std::vector<SteamLocalArtEntry> found;
    if (art_dir.empty()) return found;

    struct Candidate {
      std::string type;
      std::vector<std::string> filenames;
      std::string mime;
    };
    const std::vector<Candidate> candidates = {
      {"portrait",  {"library_600x900.jpg", "library_600x900.png", "library_600x900", "library_capsule.jpg", "library_capsule.png", "library_capsule"}, "image/jpeg"},
      {"header",    {"header.jpg", "header.png", "library_header.jpg", "library_header.png"}, "image/jpeg"},
      {"hero",      {"library_hero.jpg", "library_hero.png", "library_hero"}, "image/jpeg"},
      {"hero_blur", {"library_hero_blur.jpg", "library_hero_blur.png", "library_hero_blur"}, "image/jpeg"},
      {"logo",      {"logo.png", "logo.jpg", "logo"}, "image/png"},
      {"icon",      {appid + ".ico"}, "image/x-icon"},
    };

    for (const auto &c : candidates) {
      bool found_type = false;
      for (const auto &fname : c.filenames) {
        std::vector<fs::path> paths {art_dir / fname};
        std::error_code ec;
        for (fs::recursive_directory_iterator it(art_dir, fs::directory_options::skip_permission_denied, ec), end; !ec && it != end; it.increment(ec)) {
          if (!it->is_regular_file(ec)) continue;
          auto current = it->path().filename().string();
          boost::algorithm::to_lower(current);
          auto wanted = fname;
          boost::algorithm::to_lower(wanted);
          if (current == wanted) {
            paths.push_back(it->path());
          }
        }
        for (const auto &p : paths) {
          if (fs::exists(p, ec) && fs::is_regular_file(p, ec)) {
            auto mime = c.mime;
            auto ext = p.extension().string();
            boost::algorithm::to_lower(ext);
            if (ext == ".png") mime = "image/png";
            else if (ext == ".jpg" || ext == ".jpeg") mime = "image/jpeg";
            found.push_back({c.type, p, mime});
            found_type = true;
            break;
          }
        }
        if (found_type) break;
      }
    }

    auto has_type = [&](const std::string &type) {
      return std::any_of(found.begin(), found.end(), [&](const auto &entry) {
        return entry.type == type;
      });
    };

    auto add_best_image_fallback = [&](const std::string &type) {
      if (has_type(type)) return;
      std::error_code ec;
      fs::path best;
      int best_score = -1;
      uintmax_t best_size = 0;
      for (fs::recursive_directory_iterator it(art_dir, fs::directory_options::skip_permission_denied, ec), end; !ec && it != end; it.increment(ec)) {
        if (!it->is_regular_file(ec)) continue;
        auto ext = it->path().extension().string();
        boost::algorithm::to_lower(ext);
        if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp") continue;
        const auto file_size = fs::file_size(it->path(), ec);
        if (ec || file_size < 4096) continue;
        auto name = it->path().filename().string();
        boost::algorithm::to_lower(name);
        auto parent = it->path().parent_path().filename().string();
        boost::algorithm::to_lower(parent);
        int score = 10;
        if (name.find("600x900") != std::string::npos || name.find("portrait") != std::string::npos || name.find("poster") != std::string::npos || name.find("cover") != std::string::npos) score += 70;
        if (name.find("capsule") != std::string::npos || name.find("library") != std::string::npos) score += 50;
        if (parent.size() >= 16) score += 10; // Steam often stores final assets inside hash dirs.
        if (type == "header" && (name.find("header") != std::string::npos || name.find("hero") != std::string::npos)) score += 70;
        if (score > best_score || (score == best_score && file_size > best_size)) {
          best = it->path();
          best_score = score;
          best_size = file_size;
        }
      }
      if (!best.empty()) {
        auto ext = best.extension().string();
        boost::algorithm::to_lower(ext);
        const auto mime = ext == ".png" ? "image/png" : (ext == ".webp" ? "image/webp" : "image/jpeg");
        found.push_back({type, best, mime});
      }
    };

    add_best_image_fallback("portrait");
    add_best_image_fallback("header");
    return found;
  }

  // Returns the path for a specific art type from Steam librarycache, or empty.
  fs::path steam_local_art_path_for_type(const std::string &appid, const std::string &type) {
    const auto all = find_steam_local_art(appid);
    for (const auto &e : all) {
      if (e.type == type) return e.path;
    }
    return {};
  }

  // Returns the server-relative URL for the best available local Steam art, or empty.
  static std::string steam_local_art_url(const std::string &appid) {
    const auto all = find_steam_local_art(appid);
    // Prefer portrait, then header
    for (const auto &preferred : {"portrait", "header"}) {
      for (const auto &e : all) {
        if (e.type == preferred) {
          return "/api/library/local-art/steam/" + appid + "/" + e.type;
        }
      }
    }
    return {};
  }

  // Check whether a poster is already in the local cache without downloading.
  static bool is_steam_poster_cached(const std::string &appid) {
    if (appid.empty()) {
      return false;
    }
    const auto poster_path = steam_poster_cache_path(appid);
    std::error_code ec;
    return fs::exists(poster_path, ec) && fs::is_regular_file(poster_path, ec);
  }

  // Read Steam metadata from disk cache only — no network requests.
  static nlohmann::json steam_store_app_metadata_cached_only(const std::string &appid) {
    nlohmann::json metadata = nlohmann::json::object();
    metadata["appid"] = appid;
    metadata["title"] = "";
    metadata["description"] = "";
    metadata["developer"] = "";
    metadata["publisher"] = "";
    metadata["releaseDate"] = "";
    metadata["genres"] = nlohmann::json::array();
    metadata["categories"] = nlohmann::json::array();
    metadata["headerUrl"] = steam_cdn_header_url(appid);
    metadata["posterUrl"] = steam_cdn_poster_url(appid);
    if (appid.empty()) {
      return metadata;
    }
    const auto cache_path = steam_metadata_cache_dir() / (appid + ".json");
    if (auto cached = read_json_file_optional(cache_path); cached && cached->is_object()) {
      return *cached;
    }
    return metadata;
  }

  // ── Background Steam poster + metadata prefetch worker ─────────────────────
  // Enqueues appids for background download so sync operations are not blocked.
  // Progress is exposed via getSteamPrefetchProgress (GET /api/library/steam/prefetch-progress).
  // build_library_games_contract reads the enrichment map on every request so
  // posters and titles become visible as soon as they finish downloading.

  struct SteamPrefetchEntry {
    std::string title;
    bool poster_cached { false };
    bool done { false };
  };

  static std::mutex s_steam_prefetch_mtx;
  static std::deque<std::string> s_steam_prefetch_queue;
  static std::unordered_set<std::string> s_steam_prefetch_queued;
  static std::unordered_map<std::string, SteamPrefetchEntry> s_steam_prefetch_map;
  static std::atomic<int> s_steam_prefetch_workers { 0 };

  // steam_prefetch_worker_body, steam_prefetch_enqueue_batch, and
  // steam_prefetch_progress_json are defined after steam_store_app_metadata
  // (further below) to avoid forward-reference issues with static functions.
  static constexpr int STEAM_PREFETCH_MAX_WORKERS = 4;

  static nlohmann::json steam_store_app_metadata(const std::string &appid) {
    nlohmann::json metadata = nlohmann::json::object();
    metadata["appid"] = appid;
    metadata["title"] = "";
    metadata["description"] = "";
    metadata["developer"] = "";
    metadata["publisher"] = "";
    metadata["releaseDate"] = "";
    metadata["genres"] = nlohmann::json::array();
    metadata["categories"] = nlohmann::json::array();
    metadata["headerUrl"] = steam_cdn_header_url(appid);
    metadata["posterUrl"] = steam_cdn_poster_url(appid);

    if (appid.empty()) {
      return metadata;
    }

    const auto cache_path = steam_metadata_cache_dir() / (appid + ".json");
    if (auto cached = read_json_file_optional(cache_path); cached && cached->is_object()) {
      return *cached;
    }

    std::string response;
    std::string error;
    long http_code = 0;
    const auto url =
      "https://store.steampowered.com/api/appdetails?l=english&appids="s +
      http::url_escape(appid);
    if (!http_get_string(url, response, http_code, error) || http_code < 200 || http_code >= 300) {
      BOOST_LOG(warning) << "Steam metadata: appdetails failed for " << appid << ": " << (error.empty() ? std::to_string(http_code) : error);
      return metadata;
    }

    try {
      const auto parsed = nlohmann::json::parse(response);
      if (!parsed.contains(appid) || !parsed[appid].is_object()) {
        return metadata;
      }
      const auto &entry = parsed[appid];
      if (!entry.value("success", false) || !entry.contains("data") || !entry["data"].is_object()) {
        return metadata;
      }
      const auto &data = entry["data"];
      const auto short_description = json_string_value(data, "short_description");
      const auto detailed_description = strip_html_tags(json_string_value(data, "detailed_description"));
      metadata["title"] = json_string_value(data, "name");
      metadata["description"] = short_description.empty() ? detailed_description : short_description;
      if (data.contains("developers") && data["developers"].is_array() && !data["developers"].empty() && data["developers"][0].is_string()) {
        metadata["developer"] = data["developers"][0].get<std::string>();
      }
      if (data.contains("publishers") && data["publishers"].is_array() && !data["publishers"].empty() && data["publishers"][0].is_string()) {
        metadata["publisher"] = data["publishers"][0].get<std::string>();
      }
      if (data.contains("release_date") && data["release_date"].is_object()) {
        metadata["releaseDate"] = json_string_value(data["release_date"], "date");
      }
      metadata["genres"] = data.contains("genres") ? json_string_array_from_descriptions(data["genres"]) : nlohmann::json::array();
      metadata["categories"] = data.contains("categories") ? json_string_array_from_descriptions(data["categories"]) : nlohmann::json::array();
      (void) write_json_file_atomicish(cache_path, metadata);
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "Steam metadata: failed to parse appdetails for " << appid << ": " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "Steam metadata: failed to parse appdetails for " << appid;
    }
    return metadata;
  }

  static std::string title_from_steam_install_dir(std::string install_dir) {
    boost::trim(install_dir);
    boost::replace_all(install_dir, "_", " ");
    return install_dir;
  }

  std::unordered_map<std::string, SteamInstallStatus> detect_installed_steam_games() {
    std::unordered_map<std::string, SteamInstallStatus> installed;
#ifdef _WIN32
    auto read_registry_string = [](HKEY root, const wchar_t *subkey, const wchar_t *value_name) -> std::optional<std::wstring> {
      DWORD type = 0;
      DWORD size = 0;
      auto status = RegGetValueW(root, subkey, value_name, RRF_RT_REG_SZ, &type, nullptr, &size);
      if (status != ERROR_SUCCESS || size == 0) {
        return std::nullopt;
      }
      std::wstring buffer(size / sizeof(wchar_t), L'\0');
      status = RegGetValueW(root, subkey, value_name, RRF_RT_REG_SZ, &type, buffer.data(), &size);
      if (status != ERROR_SUCCESS) {
        return std::nullopt;
      }
      while (!buffer.empty() && buffer.back() == L'\0') {
        buffer.pop_back();
      }
      return buffer;
    };

    std::optional<std::wstring> steam_path =
      read_registry_string(HKEY_CURRENT_USER, L"Software\\Valve\\Steam", L"SteamPath");
    if (!steam_path) {
      steam_path = read_registry_string(HKEY_LOCAL_MACHINE, L"SOFTWARE\\WOW6432Node\\Valve\\Steam", L"InstallPath");
    }
    if (!steam_path) {
      steam_path = read_registry_string(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Valve\\Steam", L"InstallPath");
    }
    if (!steam_path || steam_path->empty()) {
      return installed;
    }

    std::vector<fs::path> library_paths;
    const fs::path root_path = fs::path(*steam_path);
    library_paths.push_back(root_path);
    const auto library_vdf = root_path / "steamapps" / "libraryfolders.vdf";
    try {
      if (file_is_regular(library_vdf)) {
        const auto content = file_handler::read_file(library_vdf.string().c_str());
        boost::regex path_re("\"path\"\\s+\"([^\"]+)\"");
        boost::sregex_iterator it(content.begin(), content.end(), path_re);
        boost::sregex_iterator end;
        for (; it != end; ++it) {
          auto path = (*it)[1].str();
          boost::replace_all(path, "\\\\", "\\");
          if (!path.empty()) {
            library_paths.emplace_back(platf::from_utf8(path));
          }
        }
      }
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "Steam install detection: failed to parse libraryfolders.vdf: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "Steam install detection: failed to parse libraryfolders.vdf";
    }

    std::unordered_set<std::string> visited;
    boost::regex appid_re("\"appid\"\\s+\"([0-9]+)\"");
    boost::regex installdir_re("\"installdir\"\\s+\"([^\"]+)\"");
    boost::regex name_re("\"name\"\\s+\"([^\"]+)\"");
    for (const auto &library_path : library_paths) {
      const auto key = library_path.lexically_normal().wstring();
      const auto key_utf8 = platf::to_utf8(key);
      if (!visited.insert(key_utf8).second) {
        continue;
      }
      const auto steamapps_path = library_path / "steamapps";
      std::error_code ec;
      if (!fs::exists(steamapps_path, ec)) {
        continue;
      }
      for (const auto &entry : fs::directory_iterator(steamapps_path, ec)) {
        if (ec || !entry.is_regular_file(ec)) {
          continue;
        }
        const auto filename = entry.path().filename().string();
        if (!boost::regex_match(filename, boost::regex("appmanifest_[0-9]+\\.acf"))) {
          continue;
        }
        try {
          const auto manifest = file_handler::read_file(entry.path().string().c_str());
          boost::smatch appid_match;
          if (!boost::regex_search(manifest, appid_match, appid_re)) {
            continue;
          }
          std::string install_dir;
          boost::smatch install_dir_match;
          if (boost::regex_search(manifest, install_dir_match, installdir_re)) {
            install_dir = install_dir_match[1].str();
          }
          std::string title;
          boost::smatch name_match;
          if (boost::regex_search(manifest, name_match, name_re)) {
            title = name_match[1].str();
          }
          if (title.empty() && !install_dir.empty()) {
            title = title_from_steam_install_dir(install_dir);
          }
          const auto appid = appid_match[1].str();
          const auto install_path = install_dir.empty()
            ? steamapps_path / "common"
            : steamapps_path / "common" / platf::from_utf8(install_dir);
          installed[appid] = {install_path.generic_string(), title};
        } catch (...) {}
      }
    }
#endif
    return installed;
  }

  // ── Prefetch worker function bodies (placed here so steam_store_app_metadata is in scope) ──

  static void steam_prefetch_worker_body() {
    for (;;) {
      std::string appid;
      {
        std::lock_guard<std::mutex> lk(s_steam_prefetch_mtx);
        if (s_steam_prefetch_queue.empty()) {
          --s_steam_prefetch_workers;
          return;
        }
        appid = std::move(s_steam_prefetch_queue.front());
        s_steam_prefetch_queue.pop_front();
      }
      const bool poster_ok = ensure_steam_poster_cached(appid);
      const auto meta = steam_store_app_metadata(appid);
      const auto title = json_string_value(meta, "title");
      {
        std::lock_guard<std::mutex> lk(s_steam_prefetch_mtx);
        auto &entry = s_steam_prefetch_map[appid];
        if (!title.empty()) {
          entry.title = title;
        }
        entry.poster_cached = poster_ok;
        entry.done = true;
      }
    }
  }

  void steam_prefetch_enqueue_batch(const std::vector<std::string> &appids) {
    std::lock_guard<std::mutex> lk(s_steam_prefetch_mtx);
    s_steam_prefetch_queue.clear();
    s_steam_prefetch_queued.clear();
    s_steam_prefetch_map.clear();
    for (const auto &id : appids) {
      if (!id.empty() && s_steam_prefetch_queued.insert(id).second) {
        s_steam_prefetch_queue.push_back(id);
        s_steam_prefetch_map[id] = {};
      }
    }
    const int to_start = std::min(STEAM_PREFETCH_MAX_WORKERS, static_cast<int>(s_steam_prefetch_queue.size()));
    for (int i = 0; i < to_start; ++i) {
      ++s_steam_prefetch_workers;
      std::thread(steam_prefetch_worker_body).detach();
    }
  }

  nlohmann::json steam_prefetch_progress_json() {
    std::lock_guard<std::mutex> lk(s_steam_prefetch_mtx);
    int done_count = 0;
    for (const auto &[id, entry] : s_steam_prefetch_map) {
      if (entry.done) {
        ++done_count;
      }
    }
    return {
      { "total", static_cast<int>(s_steam_prefetch_queued.size()) },
      { "pending", static_cast<int>(s_steam_prefetch_queue.size()) },
      { "done", done_count },
      { "fetched", done_count },
      { "completed", done_count },
      { "active", s_steam_prefetch_workers.load() > 0 },
      { "running", s_steam_prefetch_workers.load() > 0 }
    };
  }

  static std::string steam_api_key_from_state(const nlohmann::json &source_state) {
    try {
      if (
        source_state.contains("secretConfig") &&
        source_state["secretConfig"].is_object() &&
        source_state["secretConfig"].contains("apiKeyEncrypted") &&
        source_state["secretConfig"]["apiKeyEncrypted"].is_string()
      ) {
        std::string api_key;
        if (decrypt_provider_secret(source_state["secretConfig"]["apiKeyEncrypted"].get<std::string>(), api_key)) {
          return api_key;
        }
      }
    } catch (...) {}
    return {};
  }

  nlohmann::json steam_game_contract(
    const std::string &appid,
    const std::string &title,
    const SteamInstallStatus *install_info,
    bool owned
  ) {
    const bool installed_locally = install_info != nullptr;
    // Non-blocking: only read metadata from disk cache; poster download deferred to background worker.
    const auto steam_metadata = steam_store_app_metadata_cached_only(appid);
    const auto metadata_title = json_string_value(steam_metadata, "title");
    const auto resolved_title = !title.empty()
      ? title
      : (!metadata_title.empty() ? metadata_title : "Steam App " + appid);
    const bool poster_cached = is_steam_poster_cached(appid);
    nlohmann::json metadata = nlohmann::json::object();
    metadata["description"] = json_string_value(steam_metadata, "description");
    metadata["developer"] = json_string_value(steam_metadata, "developer");
    metadata["publisher"] = json_string_value(steam_metadata, "publisher");
    metadata["releaseDate"] = json_string_value(steam_metadata, "releaseDate");
    metadata["genres"] = steam_metadata.contains("genres") && steam_metadata["genres"].is_array() ? steam_metadata["genres"] : nlohmann::json::array();
    metadata["categories"] = steam_metadata.contains("categories") && steam_metadata["categories"].is_array() ? steam_metadata["categories"] : nlohmann::json::array();
    metadata["headerUrl"] = json_string_value(steam_metadata, "headerUrl");

    nlohmann::json game;
    game["id"] = "steam:" + appid;
    game["uuid"] = nullptr;
    game["providerGameId"] = appid;
    game["sourceId"] = "steam";
    game["sourceName"] = "Steam";
    game["title"] = resolved_title;
    game["owned"] = owned;
    game["installed"] = installed_locally;
    game["playable"] = false;
    game["installState"] = installed_locally ? "installed" : "not_installed";
    game["installPath"] = installed_locally ? install_info->install_path : "";
    game["executablePath"] = installed_locally ? "steam://rungameid/" + appid : "";
    game["posterUrl"] = poster_cached
      ? "/api/library/steam/" + appid + "/poster"
      : steam_cdn_poster_url(appid);
    game["posterState"] = poster_cached ? "available" : "remote_fallback";
    game["metadataState"] =
      metadata["description"].get<std::string>().empty() &&
      metadata["developer"].get<std::string>().empty()
        ? "partial"
        : "available";
    game["metadata"] = metadata;
    game["launchableVia"] = "steam";
    return game;
  }

  static nlohmann::json steam_owned_games_from_web_api(
    const std::string &steam_id,
    const std::string &api_key,
    const std::unordered_map<std::string, SteamInstallStatus> &installed_games,
    bool &ok,
    std::string &error
  ) {
    ok = false;
    nlohmann::json games = nlohmann::json::array();
    if (steam_id.empty() || api_key.empty()) {
      error = "Steam private-account fallback key is required for API fallback sync.";
      return games;
    }

    const auto url =
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?format=json&include_appinfo=1&include_played_free_games=1&include_free_sub=1&steamid="s +
      http::url_escape(steam_id) + "&key=" + http::url_escape(api_key);
    std::string response;
    long http_code = 0;
    if (!http_get_string(url, response, http_code, error) || http_code < 200 || http_code >= 300) {
      if (error.empty()) {
        error = "Steam Web API returned HTTP " + std::to_string(http_code) + ".";
      }
      return games;
    }

    try {
      const auto parsed = nlohmann::json::parse(response);
      const auto &response_node = parsed.contains("response") && parsed["response"].is_object()
        ? parsed["response"]
        : nlohmann::json::object();
      if (!response_node.contains("games") || !response_node["games"].is_array()) {
        error = "Steam Web API did not return a games array. Check API key permissions and Steam library privacy.";
        return games;
      }
      for (const auto &entry : response_node["games"]) {
        if (!entry.is_object()) {
          continue;
        }
        std::string appid;
        if (entry.contains("appid")) {
          if (entry["appid"].is_number_integer()) {
            appid = std::to_string(entry["appid"].get<std::int64_t>());
          } else if (entry["appid"].is_string()) {
            appid = entry["appid"].get<std::string>();
          }
        }
        if (appid.empty()) {
          continue;
        }
        const auto title = json_string_value(entry, "name");
        const auto installed_it = installed_games.find(appid);
        const auto *install_info = installed_it == installed_games.end() ? nullptr : &installed_it->second;
        games.push_back(steam_game_contract(appid, title, install_info, true));
      }
      ok = true;
    } catch (const std::exception &e) {
      error = e.what();
    } catch (...) {
      error = "Failed to parse Steam Web API response.";
    }
    return games;
  }

  std::vector<std::string> steam_appids_from_json_array(const nlohmann::json &appids_node) {
    std::vector<std::string> appids;
    std::unordered_set<std::string> seen;
    if (!appids_node.is_array()) {
      return appids;
    }
    for (const auto &entry : appids_node) {
      std::string appid;
      if (entry.is_number_unsigned() || entry.is_number_integer()) {
        appid = std::to_string(entry.get<std::int64_t>());
      } else if (entry.is_string()) {
        appid = entry.get<std::string>();
      }
      if (
        appid.empty() ||
        !std::all_of(appid.begin(), appid.end(), [](unsigned char ch) { return std::isdigit(ch); }) ||
        !seen.insert(appid).second
      ) {
        continue;
      }
      appids.push_back(appid);
    }
    return appids;
  }

  nlohmann::json steam_owned_games_from_appids(
    const std::vector<std::string> &appids,
    const std::unordered_map<std::string, SteamInstallStatus> &installed_games
  ) {
    nlohmann::json games = nlohmann::json::array();
    for (const auto &appid : appids) {
      const auto installed_it = installed_games.find(appid);
      const auto *install_info = installed_it == installed_games.end() ? nullptr : &installed_it->second;
      // Use title from ACF manifest for installed games; for uninstalled check disk cache only
      // (no blocking HTTP calls — background worker will fetch titles for unknown appids).
      std::string title;
      if (install_info && !install_info->title.empty()) {
        title = install_info->title;
      } else {
        const auto cached_meta = steam_store_app_metadata_cached_only(appid);
        title = json_string_value(cached_meta, "title");
      }
      games.push_back(steam_game_contract(appid, title, install_info, true));
    }
    return games;
  }

  static std::string xml_attr_value(const std::string &xml, const std::string &attr) {
    try {
      const boost::regex re(attr + "\\s*=\\s*\"([^\"]+)\"");
      boost::smatch match;
      if (boost::regex_search(xml, match, re)) {
        return match[1].str();
      }
    } catch (...) {}
    return {};
  }

  static std::string find_local_game_poster(const fs::path &install_path) {
    std::error_code ec;
    if (install_path.empty() || !fs::exists(install_path, ec)) {
      return {};
    }
    const std::array<std::string, 5> preferred_names = {
      "cover", "poster", "boxart", "library", "vertical"
    };
    const std::array<std::string, 4> image_exts = {
      ".jpg", ".jpeg", ".png", ".webp"
    };
    std::string first_image;
    fs::recursive_directory_iterator it(install_path, fs::directory_options::skip_permission_denied, ec);
    fs::recursive_directory_iterator end;
    int visited = 0;
    for (; !ec && it != end && visited < 400; it.increment(ec), ++visited) {
      if (!it->is_regular_file(ec)) {
        continue;
      }
      auto ext = boost::algorithm::to_lower_copy(it->path().extension().string());
      if (std::find(image_exts.begin(), image_exts.end(), ext) == image_exts.end()) {
        continue;
      }
      const auto stem = boost::algorithm::to_lower_copy(it->path().stem().string());
      if (first_image.empty()) {
        first_image = it->path().string();
      }
      for (const auto &name : preferred_names) {
        if (stem.find(name) != std::string::npos) {
          return it->path().string();
        }
      }
    }
    return first_image;
  }

  static nlohmann::json local_provider_game_contract(
    const std::string &source_id,
    const std::string &provider_id,
    const std::string &title,
    const std::string &install_path,
    const std::string &executable_path,
    const std::string &launchable_via,
    const std::string &poster_url = {}
  ) {
    nlohmann::json game;
    game["id"] = source_id + ":" + provider_id;
    game["uuid"] = nullptr;
    game["providerGameId"] = provider_id;
    game["sourceId"] = source_id;
    game["sourceName"] = game_source_name(source_id);
    game["title"] = title.empty() ? game_source_name(source_id) + " game" : title;
    game["owned"] = true;
    game["installed"] = true;
    game["playable"] = !executable_path.empty();
    game["installState"] = "installed";
    game["installPath"] = install_path;
    game["executablePath"] = executable_path;
    game["posterUrl"] = poster_url;
    game["posterState"] = poster_url.empty() ? "missing" : "available";
    game["metadataState"] = "partial";
    game["metadata"] = nlohmann::json::object();
    game["launchableVia"] = launchable_via;
    return game;
  }

  nlohmann::json sync_epic_installed_games() {
    nlohmann::json games = nlohmann::json::array();
#ifdef _WIN32
    const std::vector<fs::path> manifest_roots = {
      fs::path("C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests")
    };
    for (const auto &manifest_root : manifest_roots) {
      std::error_code ec;
      if (!fs::exists(manifest_root, ec)) {
        continue;
      }
      for (const auto &entry : fs::directory_iterator(manifest_root, ec)) {
        if (ec || !entry.is_regular_file(ec) || entry.path().extension() != ".item") {
          continue;
        }
        try {
          const auto raw = file_handler::read_file(entry.path().string().c_str());
          const auto manifest = nlohmann::json::parse(raw);
          const auto catalog_id = json_string_value(manifest, "CatalogItemId");
          const auto app_name = json_string_value(manifest, "AppName");
          const auto title = json_string_value(manifest, "DisplayName").empty()
            ? (app_name.empty() ? "Epic game" : app_name)
            : json_string_value(manifest, "DisplayName");
          const auto install_location = json_string_value(manifest, "InstallLocation");
          if (catalog_id.empty() && app_name.empty()) {
            continue;
          }
          const auto provider_id = app_name.empty() ? catalog_id : app_name;
          const auto launch_uri = app_name.empty() ? "" : "com.epicgames.launcher://apps/" + app_name + "?action=launch&silent=true";
          const auto poster_path = find_local_game_poster(install_location);
          games.push_back(local_provider_game_contract("epic", provider_id, title, install_location, launch_uri, "epic", poster_path));
        } catch (const std::exception &e) {
          BOOST_LOG(warning) << "Epic install detection: failed to parse " << entry.path().string() << ": " << e.what();
        } catch (...) {
          BOOST_LOG(warning) << "Epic install detection: failed to parse " << entry.path().string();
        }
      }
    }
#endif
    return games;
  }

  nlohmann::json sync_gog_installed_games() {
    nlohmann::json games = nlohmann::json::array();
#ifdef _WIN32
    std::vector<fs::path> roots;
    const char *program_files = std::getenv("ProgramFiles");
    const char *program_files_x86 = std::getenv("ProgramFiles(x86)");
    if (program_files) {
      roots.emplace_back(fs::path(program_files) / "GOG Galaxy" / "Games");
      roots.emplace_back(fs::path(program_files) / "GOG Games");
    }
    if (program_files_x86) {
      roots.emplace_back(fs::path(program_files_x86) / "GOG Galaxy" / "Games");
      roots.emplace_back(fs::path(program_files_x86) / "GOG Games");
    }
    for (char drive = 'C'; drive <= 'Z'; ++drive) {
      roots.emplace_back(std::string {drive} + ":/GOG Games");
      roots.emplace_back(std::string {drive} + ":/Games/GOG");
    }

    std::unordered_set<std::string> seen;
    for (const auto &root : roots) {
      std::error_code ec;
      if (!fs::exists(root, ec)) {
        continue;
      }
      fs::recursive_directory_iterator it(root, fs::directory_options::skip_permission_denied, ec);
      fs::recursive_directory_iterator end;
      for (; !ec && it != end; it.increment(ec)) {
        if (!it->is_regular_file(ec)) {
          continue;
        }
        const auto filename = it->path().filename().string();
        if (filename.rfind("goggame-", 0) != 0 || it->path().extension() != ".info") {
          continue;
        }
        try {
          const auto raw = file_handler::read_file(it->path().string().c_str());
          const auto info = nlohmann::json::parse(raw);
          auto provider_id = json_string_value(info, "gameId");
          if (provider_id.empty()) {
            provider_id = it->path().stem().string();
          }
          if (provider_id.rfind("goggame-", 0) == 0) {
            provider_id = provider_id.substr(8);
          }
          if (provider_id.empty() || !seen.insert(provider_id).second) {
            continue;
          }
          const auto title = json_string_value(info, "name").empty()
            ? it->path().parent_path().filename().string()
            : json_string_value(info, "name");
          std::string executable_path;
          std::string working_dir = it->path().parent_path().string();
          if (info.contains("playTasks") && info["playTasks"].is_array()) {
            for (const auto &task : info["playTasks"]) {
              if (!task.is_object() || !task.value("isPrimary", false)) {
                continue;
              }
              executable_path = json_string_value(task, "path");
              const auto task_working_dir = json_string_value(task, "workingDir");
              if (!task_working_dir.empty()) {
                working_dir = (it->path().parent_path() / task_working_dir).lexically_normal().string();
              }
              break;
            }
          }
          if (!executable_path.empty() && fs::path(executable_path).is_relative()) {
            executable_path = (it->path().parent_path() / executable_path).lexically_normal().string();
          }
          if (executable_path.empty()) {
            executable_path = "goggalaxy://openGameView/" + provider_id;
          }
          const auto poster_path = find_local_game_poster(it->path().parent_path());
          games.push_back(local_provider_game_contract("gog", provider_id, title, working_dir, executable_path, "gog", poster_path));
        } catch (const std::exception &e) {
          BOOST_LOG(warning) << "GOG install detection: failed to parse " << it->path().string() << ": " << e.what();
        } catch (...) {
          BOOST_LOG(warning) << "GOG install detection: failed to parse " << it->path().string();
        }
      }
    }
#endif
    return games;
  }

  nlohmann::json sync_xbox_installed_games() {
    nlohmann::json games = nlohmann::json::array();
#ifdef _WIN32
    std::unordered_set<std::string> seen;
    for (char drive = 'C'; drive <= 'Z'; ++drive) {
      const fs::path root = std::string {drive} + ":/XboxGames";
      std::error_code ec;
      if (!fs::exists(root, ec)) {
        continue;
      }
      for (const auto &entry : fs::directory_iterator(root, fs::directory_options::skip_permission_denied, ec)) {
        if (ec || !entry.is_directory(ec)) {
          continue;
        }
        const auto content_dir = entry.path() / "Content";
        const auto config_path = content_dir / "MicrosoftGame.config";
        std::string provider_id = entry.path().filename().string();
        std::string title = provider_id;
        if (file_is_regular(config_path)) {
          try {
            const auto xml = file_handler::read_file(config_path.string().c_str());
            const auto identity = xml_attr_value(xml, "Name");
            const auto display = xml_attr_value(xml, "DefaultDisplayName");
            if (!identity.empty()) {
              provider_id = identity;
            }
            if (!display.empty() && display.rfind("ms-resource:", 0) != 0) {
              title = display;
            }
          } catch (...) {}
        }
        if (provider_id.empty() || !seen.insert(provider_id).second) {
          continue;
        }
        std::string executable_path;
        const auto helper = content_dir / "gamelaunchhelper.exe";
        if (file_is_regular(helper)) {
          executable_path = helper.string();
        }
        const auto poster_path = find_local_game_poster(content_dir);
        games.push_back(local_provider_game_contract("xbox", provider_id, title, content_dir.string(), executable_path, "xbox", poster_path));
      }
    }
#endif
    return games;
  }

  static nlohmann::json merge_owned_and_local_games(const std::string &source_id, nlohmann::json owned_games, const nlohmann::json &local_games) {
    std::unordered_map<std::string, nlohmann::json *> owned_by_id;
    for (auto &game : owned_games) {
      if (!game.is_object()) {
        continue;
      }
      const auto provider_id = json_string_value(game, "providerGameId");
      if (!provider_id.empty()) {
        owned_by_id[provider_id] = &game;
      }
    }
    for (const auto &local : local_games) {
      if (!local.is_object()) {
        continue;
      }
      const auto provider_id = json_string_value(local, "providerGameId");
      if (provider_id.empty()) {
        continue;
      }
      auto it = owned_by_id.find(provider_id);
      if (it != owned_by_id.end()) {
        auto &game = *it->second;
        game["installed"] = true;
        game["playable"] = local.value("playable", false);
        game["installState"] = "installed";
        game["installPath"] = json_string_value(local, "installPath");
        game["executablePath"] = json_string_value(local, "executablePath");
        game["launchableVia"] = local.value("launchableVia", source_id);
        if (json_string_value(game, "posterUrl").empty() && !json_string_value(local, "posterUrl").empty()) {
          game["posterUrl"] = json_string_value(local, "posterUrl");
          game["posterState"] = "available";
        }
      } else {
        auto local_copy = local;
        local_copy["owned"] = false;
        owned_games.push_back(local_copy);
      }
    }
    return owned_games;
  }

  static nlohmann::json gog_game_contract(const std::string &product_id, const std::string &title = {}, const std::string &poster_url = {}) {
    return local_provider_game_contract("gog", product_id, title.empty() ? "GOG " + product_id : title, "", "", "gog", poster_url);
  }

  nlohmann::json sync_gog_owned_games(nlohmann::json &source_state, bool &ok, std::string &error) {
    ok = false;
    auto local_games = sync_gog_installed_games();
    nlohmann::json session;
    if (!gog_refresh_session(source_state, session, error)) {
      return local_games;
    }
    const auto access_token = json_string_value(session, "access_token");
    nlohmann::json owned_response;
    long http_code = 0;
    if (!http_get_json_bearer("https://embed.gog.com/user/data/games", access_token, owned_response, http_code, error) || http_code < 200 || http_code >= 300) {
      if (error.empty()) {
        error = "GOG owned-library request failed with HTTP " + std::to_string(http_code) + ".";
      }
      return local_games;
    }
    nlohmann::json owned_games = nlohmann::json::array();
    if (owned_response.contains("owned") && owned_response["owned"].is_array()) {
      for (const auto &entry : owned_response["owned"]) {
        std::string product_id;
        if (entry.is_number_integer() || entry.is_number_unsigned()) {
          product_id = std::to_string(entry.get<std::int64_t>());
        } else if (entry.is_string()) {
          product_id = entry.get<std::string>();
        }
        if (!product_id.empty()) {
          auto game = gog_game_contract(product_id);
          game["owned"] = true;
          game["installed"] = false;
          game["playable"] = false;
          game["installState"] = "not_installed";
          owned_games.push_back(game);
        }
      }
    }
    ok = true;
    return merge_owned_and_local_games("gog", owned_games, local_games);
  }

  static nlohmann::json epic_game_from_library_record(const nlohmann::json &record) {
    const auto app_name = json_string_value(record, "appName");
    auto catalog_id = json_string_value(record, "catalogItemId");
    if (catalog_id.empty()) {
      catalog_id = json_string_value(record, "catalogId");
    }
    const auto provider_id = app_name.empty() ? catalog_id : app_name;
    std::string title = provider_id;
    std::string poster_url;
    if (record.contains("metadata") && record["metadata"].is_object()) {
      const auto &metadata = record["metadata"];
      const auto metadata_title = json_string_value(metadata, "title");
      if (!metadata_title.empty()) {
        title = metadata_title;
      }
      if (metadata.contains("keyImages") && metadata["keyImages"].is_array()) {
        for (const auto &image : metadata["keyImages"]) {
          const auto type = json_string_value(image, "type");
          const auto url = json_string_value(image, "url");
          if (!url.empty() && (type == "DieselGameBox" || type == "OfferImageTall" || poster_url.empty())) {
            poster_url = url;
            if (type == "DieselGameBox" || type == "OfferImageTall") {
              break;
            }
          }
        }
      }
    }
    auto game = local_provider_game_contract("epic", provider_id, title, "", "", "epic", poster_url);
    game["owned"] = true;
    game["installed"] = false;
    game["playable"] = false;
    game["installState"] = "not_installed";
    return game;
  }

  nlohmann::json sync_epic_owned_games(nlohmann::json &source_state, bool &ok, std::string &error) {
    ok = false;
    auto local_games = sync_epic_installed_games();
    nlohmann::json session;
    if (!epic_refresh_session(source_state, session, error)) {
      return local_games;
    }
    const auto access_token = json_string_value(session, "access_token");
    nlohmann::json owned_games = nlohmann::json::array();
    std::string cursor;
    do {
      auto url = "https://library-service.live.use1a.on.epicgames.com/library/api/public/items?includeMetadata=true"s;
      if (!cursor.empty()) {
        url += "&cursor=" + http::url_escape(cursor);
      }
      nlohmann::json page;
      long http_code = 0;
      if (!http_get_json_bearer(url, access_token, page, http_code, error) || http_code < 200 || http_code >= 300) {
        if (error.empty()) {
          error = "Epic library request failed with HTTP " + std::to_string(http_code) + ".";
        }
        return local_games;
      }
      if (page.contains("records") && page["records"].is_array()) {
        for (const auto &record : page["records"]) {
          if (!record.is_object()) {
            continue;
          }
          auto game = epic_game_from_library_record(record);
          if (!json_string_value(game, "providerGameId").empty()) {
            owned_games.push_back(game);
          }
        }
      }
      cursor.clear();
      if (page.contains("responseMetadata") && page["responseMetadata"].is_object()) {
        cursor = json_string_value(page["responseMetadata"], "nextCursor");
      }
    } while (!cursor.empty());
    ok = true;
    return merge_owned_and_local_games("epic", owned_games, local_games);
  }

  nlohmann::json sync_steam_owned_games(const nlohmann::json &source_state, bool &ok, std::string &error) {
    ok = false;
    error.clear();
    const auto public_config = source_state.contains("publicConfig") && source_state["publicConfig"].is_object()
      ? source_state["publicConfig"]
      : nlohmann::json::object();
    const auto steam_id = json_string_value(public_config, "steamId");
    if (steam_id.empty()) {
      error = "Steam source is not signed in.";
      return nlohmann::json::array();
    }

    const auto installed_games = detect_installed_steam_games();
    const auto web_appids = steam_appids_from_json_array(source_state.contains("webOwnedAppIds") ? source_state["webOwnedAppIds"] : nlohmann::json::array());
    if (!web_appids.empty()) {
      auto web_games = steam_owned_games_from_appids(web_appids, installed_games);
      std::unordered_set<std::string> known_appids;
      for (const auto &game : web_games) {
        known_appids.insert(game.value("providerGameId", std::string {}));
      }
      for (const auto &[appid, install_info] : installed_games) {
        if (!known_appids.contains(appid)) {
          web_games.push_back(steam_game_contract(appid, install_info.title, &install_info, false));
        }
      }
      ok = true;
      return web_games;
    }

    const auto api_key = steam_api_key_from_state(source_state);

    const auto url = "https://steamcommunity.com/profiles/"s + http::url_escape(steam_id) + "/games/?tab=all&xml=1";
    std::string response;
    long http_code = 0;
    nlohmann::json games = nlohmann::json::array();
    if (http_get_string(url, response, http_code, error) && http_code >= 200 && http_code < 300) {
      boost::regex game_re("<game>[\\s\\S]*?<appID>([0-9]+)</appID>[\\s\\S]*?<name><!\\[CDATA\\[(.*?)\\]\\]></name>[\\s\\S]*?</game>");
      boost::sregex_iterator it(response.begin(), response.end(), game_re);
      boost::sregex_iterator end;
      for (; it != end; ++it) {
        const auto appid_text = (*it)[1].str();
        const auto title = (*it)[2].str();
        const auto installed_it = installed_games.find(appid_text);
        const bool installed_locally = installed_it != installed_games.end();
        const auto *install_info = installed_locally ? &installed_it->second : nullptr;
        const auto fallback_title = title.empty() && install_info && !install_info->title.empty()
          ? install_info->title
          : title;
        games.push_back(steam_game_contract(appid_text, fallback_title, install_info, true));
      }
    } else if (error.empty()) {
      error = "Steam library request returned HTTP " + std::to_string(http_code) + ".";
    }

    std::unordered_set<std::string> known_appids;
    for (const auto &game : games) {
      known_appids.insert(game.value("providerGameId", std::string {}));
    }
    for (const auto &[appid, install_info] : installed_games) {
      if (known_appids.contains(appid)) {
        continue;
      }
      games.push_back(steam_game_contract(appid, install_info.title, &install_info, false));
    }
    ok = true;
    if (!error.empty() && !installed_games.empty()) {
      error.clear();
    }
    // Fallback: use user-provided API key OR server-level key to fetch full owned library.
    // This handles private profiles where the XML endpoint returns nothing.
    const auto effective_api_key = !api_key.empty() ? api_key : config::sunshine.steam_server_api_key;
    if (games.size() <= installed_games.size() && !effective_api_key.empty()) {
      bool api_ok = false;
      auto api_games = steam_owned_games_from_web_api(steam_id, effective_api_key, installed_games, api_ok, error);
      if (api_ok) {
        ok = true;
        return api_games;
      }
    }
    return games;
  }

  nlohmann::json public_source_config_from_request(const std::string &source_id, const nlohmann::json &body) {
    nlohmann::json public_config = nlohmann::json::object();
    if (source_id == "steam") {
      const auto steam_id = json_string_value(body, "steamId");
      if (!steam_id.empty()) {
        public_config["steamId"] = steam_id;
      }
      const auto api_key = json_string_value(body, "apiKey");
      if (!api_key.empty()) {
        public_config["apiKeyConfigured"] = true;
      }
    } else {
      const auto client_id = json_string_value(body, "clientId");
      if (!client_id.empty()) {
        public_config["clientId"] = client_id;
      }
      const auto redirect_uri = json_string_value(body, "redirectUri");
      if (!redirect_uri.empty()) {
        public_config["redirectUri"] = redirect_uri;
      }
    }
    return public_config;
  }

  bool save_game_source_state(const std::string &source_id, const nlohmann::json &source_state) {
    auto state = read_jujoserver_state_json();
    try {
      if (!state.contains("root") || !state["root"].is_object()) {
        state["root"] = nlohmann::json::object();
      }
      auto &root = state["root"];
      if (!root.contains("game_sources") || !root["game_sources"].is_object()) {
        root["game_sources"] = nlohmann::json::object();
      }
      auto &game_sources = root["game_sources"];
      game_sources["schemaVersion"] = 1;
      if (!game_sources.contains("sources") || !game_sources["sources"].is_object()) {
        game_sources["sources"] = nlohmann::json::object();
      }
      auto persisted_source_state = normalize_game_source_state(source_state);
      if (is_store_game_source(source_id)) {
        persisted_source_state["boundInstallId"] = current_game_source_install_id();
        persisted_source_state["installBindingVersion"] = 1;
      }
      game_sources["sources"][source_id] = persisted_source_state;
      return write_jujoserver_state_json(state);
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "game sources: failed to save source state: " << e.what();
    } catch (...) {
      BOOST_LOG(error) << "game sources: failed to save source state";
    }
    return false;
  }

  bool remove_game_source_state(const std::string &source_id) {
    auto state = read_jujoserver_state_json();
    try {
      auto &sources = state["root"]["game_sources"]["sources"];
      if (sources.is_object() && sources.contains(source_id)) {
        sources.erase(source_id);
      }
      return write_jujoserver_state_json(state);
    } catch (...) {
      return false;
    }
  }

  std::string now_iso8601_utc_string() {
    const auto now = std::chrono::system_clock::now();
    const auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm {};
#ifdef _WIN32
    gmtime_s(&tm, &tt);
#else
    gmtime_r(&tt, &tm);
#endif
    std::ostringstream oss;
    oss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
    return oss.str();
  }

  nlohmann::json parse_json_request_body(req_https_t request) {
    std::stringstream ss;
    ss << request->content.rdbuf();
    const auto body = ss.str();
    if (body.empty()) {
      return nlohmann::json::object();
    }
    return nlohmann::json::parse(body);
  }

  std::string json_string_value(const nlohmann::json &node, const char *key) {
    try {
      if (node.contains(key) && node[key].is_string()) {
        return node[key].get<std::string>();
      }
    } catch (...) {}
    return {};
  }

  std::optional<nlohmann::json> jwt_payload_json(const std::string &jwt) {
    const auto first_dot = jwt.find('.');
    if (first_dot == std::string::npos) {
      return std::nullopt;
    }
    const auto second_dot = jwt.find('.', first_dot + 1);
    if (second_dot == std::string::npos || second_dot <= first_dot + 1) {
      return std::nullopt;
    }

    auto payload = jwt.substr(first_dot + 1, second_dot - first_dot - 1);
    std::replace(payload.begin(), payload.end(), '-', '+');
    std::replace(payload.begin(), payload.end(), '_', '/');
    while (payload.size() % 4 != 0) {
      payload.push_back('=');
    }

    try {
      const auto decoded = SimpleWeb::Crypto::Base64::decode(payload);
      return nlohmann::json::parse(decoded);
    } catch (...) {
      return std::nullopt;
    }
  }

  static std::string command_preview(const nlohmann::json &app) {
    try {
      if (app.contains("cmd") && app["cmd"].is_string()) {
        return app["cmd"].get<std::string>();
      }
      if (app.contains("cmd") && app["cmd"].is_array() && !app["cmd"].empty() && app["cmd"][0].is_string()) {
        return app["cmd"][0].get<std::string>();
      }
    } catch (...) {}
    return {};
  }

  static std::string app_source_id(const nlohmann::json &app) {
    const auto source = json_string_value(app, "source");
    if (!source.empty()) {
      return source;
    }
    const auto explicit_source = json_string_value(app, "source-id");
    if (!explicit_source.empty()) {
      return explicit_source;
    }
    const auto game_source = json_string_value(app, "game-source");
    if (!game_source.empty()) {
      return game_source;
    }
    const auto provider = json_string_value(app, "provider");
    if (!provider.empty()) {
      return provider;
    }
    if (is_playnite_library_entry(app)) {
      return "playniteLegacy";
    }
    return "manual";
  }

  static std::string app_provider_game_id(const nlohmann::json &app) {
    const auto provider_game_id = json_string_value(app, "provider-game-id");
    if (!provider_game_id.empty()) {
      return provider_game_id;
    }
    const auto source_id = json_string_value(app, "source_id");
    if (!source_id.empty()) {
      return source_id;
    }
    const auto provider_game_id_camel = json_string_value(app, "providerGameId");
    if (!provider_game_id_camel.empty()) {
      return provider_game_id_camel;
    }
    return {};
  }

  std::string game_source_name(const std::string &source_id) {
    if (source_id == "steam") {
      return "Steam";
    }
    if (source_id == "epic") {
      return "Epic Games";
    }
    if (source_id == "gog") {
      return "GOG";
    }
    if (source_id == "xbox") {
      return "Xbox";
    }
    if (source_id == "playniteLegacy") {
      return "Playnite Legacy";
    }
    return "Manual";
  }

  static nlohmann::json build_library_game_contract(const nlohmann::json &app, int index) {
    const auto uuid = json_string_value(app, "uuid");
    const auto playnite_id = json_string_value(app, "playnite-id");
    const auto source_id = app_source_id(app);
    const auto provider_game_id = playnite_id.empty() ? app_provider_game_id(app) : playnite_id;
    const auto image_path = json_string_value(app, "image-path");
    const bool image_is_url =
      image_path.rfind("http://", 0) == 0 ||
      image_path.rfind("https://", 0) == 0;
    const bool image_is_server_path = image_path.rfind("/", 0) == 0;
    const bool playable = is_playable_library_entry(app);
    const bool steam_poster_fallback = source_id == "steam" && !provider_game_id.empty();
    const bool has_cover = !uuid.empty() && (json_string_not_empty(app, "image-path") || !playnite_id.empty() || steam_poster_fallback);

    nlohmann::json metadata = nlohmann::json::object();
    metadata["description"] = json_string_value(app, "description");
    metadata["developer"] = json_string_value(app, "developer");
    metadata["publisher"] = json_string_value(app, "publisher");
    metadata["releaseDate"] = json_string_value(app, "release-date");
    metadata["genres"] = app.contains("genres") && app["genres"].is_array() ? app["genres"] : nlohmann::json::array();

    nlohmann::json game;
    game["id"] = !uuid.empty() ? uuid : (!playnite_id.empty() ? "playnite:" + playnite_id : "local:" + std::to_string(index));
    game["index"] = index;
    game["uuid"] = uuid.empty() ? nlohmann::json(nullptr) : nlohmann::json(uuid);
    game["providerGameId"] = provider_game_id;
    game["sourceId"] = source_id;
    game["sourceName"] = game_source_name(source_id);
    game["title"] = json_string_value(app, "name").empty() ? "Untitled game" : json_string_value(app, "name");
    game["owned"] = true;
    game["installed"] = playable;
    game["playable"] = playable;
    game["installState"] = playable ? "installed" : "not_installed";
    game["installPath"] = json_string_value(app, "working-dir");
    game["executablePath"] = command_preview(app);
    if (json_string_not_empty(app, "image-path")) {
      game["posterUrl"] = (image_is_url || image_is_server_path) ? image_path : "/api/apps/" + uuid + "/cover";
    } else if (steam_poster_fallback) {
      game["posterUrl"] = is_steam_poster_cached(provider_game_id)
        ? "/api/library/steam/" + provider_game_id + "/poster"
        : steam_cdn_poster_url(provider_game_id);
    } else {
      game["posterUrl"] = "";
    }
    game["posterState"] = has_cover ? "available" : "missing";
    game["metadataState"] = metadata["description"].get<std::string>().empty() && metadata["developer"].get<std::string>().empty() ? "partial" : "available";
    game["metadata"] = metadata;
    game["launchableVia"] = source_id == "playniteLegacy" ? "playnite" : "local";
    return game;
  }

  nlohmann::json build_library_games_contract(const nlohmann::json &apps) {
    nlohmann::json games = nlohmann::json::array();
    std::unordered_set<std::string> linked_provider_games;
    const auto states = read_game_source_states();
    const bool playnite_disabled = source_state_or_empty(states, "playniteLegacy").value("disabled", false);
    int index = 0;
    for (const auto &app : apps) {
      if (app.is_object()) {
        const auto source_id = app_source_id(app);
        if (is_store_game_source(source_id) && (!game_source_is_connected(states, source_id) || !provider_app_binding_is_current(app))) {
          ++index;
          continue;
        }
        if (source_id == "playniteLegacy" && playnite_disabled) {
          ++index;
          continue;
        }
        const auto provider_game_id = app_provider_game_id(app);
        if (!provider_game_id.empty()) {
          linked_provider_games.insert(source_id + ":" + provider_game_id);
        }
        games.push_back(build_library_game_contract(app, index));
      }
      ++index;
    }
    for (const auto &[source_id, source_state] : states.items()) {
      if (!is_store_game_source(source_id) || !source_state.is_object()) {
        continue;
      }
      if (!game_source_is_connected(states, source_id)) {
        continue;
      }
      try {
        if (source_state.contains("games") && source_state["games"].is_array()) {
          for (const auto &game : source_state["games"]) {
            if (game.is_object()) {
              const auto provider_game_id = json_string_value(game, "providerGameId");
              if (!provider_game_id.empty() && linked_provider_games.contains(source_id + ":" + provider_game_id)) {
                continue;
              }
              // For Steam games: enrich poster/title/metadata from the in-memory prefetch map.
              // This makes every GET /api/library/games reflect the latest download state without
              // writing the full state file on each background worker completion.
              if (source_id == "steam" && !provider_game_id.empty()) {
                auto game_copy = game;
                {
                  std::lock_guard<std::mutex> lk(s_steam_prefetch_mtx);
                  auto it = s_steam_prefetch_map.find(provider_game_id);
                  if (it != s_steam_prefetch_map.end() && it->second.done) {
                    const auto &entry = it->second;
                    if (entry.poster_cached) {
                      game_copy["posterUrl"] = "/api/library/steam/" + provider_game_id + "/poster";
                      game_copy["posterState"] = "available";
                    }
                    if (!entry.title.empty() && json_string_value(game_copy, "title").find("Steam App ") == 0) {
                      game_copy["title"] = entry.title;
                    }
                  } else if (it == s_steam_prefetch_map.end()) {
                    // Not in prefetch queue — re-check disk cache directly (handles cached-before-this-session).
                    if (is_steam_poster_cached(provider_game_id)) {
                      game_copy["posterUrl"] = "/api/library/steam/" + provider_game_id + "/poster";
                      game_copy["posterState"] = "available";
                    }
                  }
                }
                games.push_back(game_copy);
              } else {
                games.push_back(game);
              }
            }
          }
        }
      } catch (...) {}
    }
    return games;
  }

  nlohmann::json build_library_summary(const nlohmann::json &games) {
    int owned = 0;
    int installed = 0;
    int playable = 0;
    int posters = 0;
    int metadata = 0;
    for (const auto &game : games) {
      if (game.value("owned", false)) {
        ++owned;
      }
      if (game.value("installed", false)) {
        ++installed;
      }
      if (game.value("playable", false)) {
        ++playable;
      }
      if (game.value("posterState", std::string {}) == "available") {
        ++posters;
      }
      if (game.value("metadataState", std::string {}) == "available") {
        ++metadata;
      }
    }
    return {
      {"ownedGameCount", owned},
      {"installedGameCount", installed},
      {"playableGameCount", playable},
      {"posterAvailableCount", posters},
      {"metadataAvailableCount", metadata}
    };
  }

  nlohmann::json build_library_metadata_status() {
    const auto provider_states = read_metadata_provider_states();
    const auto steamgriddb = metadata_provider_state_or_empty(provider_states, "steamgriddb");
    const auto igdb = metadata_provider_state_or_empty(provider_states, "igdb");
    const bool igdb_bundled = std::string_view(JUJO_IGDB_CLIENT_ID).size() > 0 &&
      std::string_view(JUJO_IGDB_CLIENT_SECRET).size() > 0;
    const bool steamgriddb_configured = steamgriddb.value("configured", false) &&
      steamgriddb.contains("secretConfig") &&
      steamgriddb["secretConfig"].is_object() &&
      steamgriddb["secretConfig"].contains("apiKeyEncrypted") &&
      steamgriddb["secretConfig"]["apiKeyEncrypted"].is_string();
    const bool igdb_stored = igdb.value("configured", false) &&
      igdb.contains("secretConfig") &&
      igdb["secretConfig"].is_object() &&
      igdb["secretConfig"].contains("clientIdEncrypted") &&
      igdb["secretConfig"]["clientIdEncrypted"].is_string() &&
      igdb["secretConfig"].contains("clientSecretEncrypted") &&
      igdb["secretConfig"]["clientSecretEncrypted"].is_string();
    const bool igdb_configured = igdb_stored || igdb_bundled;

    const auto primary_provider = steamgriddb_configured ? "steamgriddb" : (igdb_configured ? "igdb" : "steam");
    return {
      {"status", (steamgriddb_configured || igdb_configured) ? "configured" : "steam_native"},
      {"primaryProvider", primary_provider},
      {"posterProviders", nlohmann::json::array({
        nlohmann::json::object({
          {"id", "steamgriddb"},
          {"name", "SteamGridDB"},
          {"state", steamgriddb_configured ? "configured" : "not_configured"},
          {"tokenEncrypted", steamgriddb_configured},
          {"vaultProvider", vault_provider_name()},
          {"lastConfigured", steamgriddb.contains("lastConfigured") ? steamgriddb["lastConfigured"] : nlohmann::json(nullptr)}
        }),
        nlohmann::json::object({
          {"id", "igdb"},
          {"name", "IGDB"},
          {"state", igdb_configured ? "configured" : "not_configured"},
          {"tokenEncrypted", igdb_stored},
          {"bundled", igdb_bundled},
          {"vaultProvider", igdb_stored ? vault_provider_name() : (igdb_bundled ? "bundled-build" : vault_provider_name())},
          {"lastConfigured", igdb.contains("lastConfigured") ? igdb["lastConfigured"] : nlohmann::json(nullptr)}
        })
      })},
      {"message", steamgriddb_configured
        ? "SteamGridDB poster fetching is configured with encrypted server-side storage."
        : (igdb_configured
          ? "IGDB poster and metadata fetching is configured with encrypted server-side storage."
          : "Steam-native posters and metadata are enabled without a personal API key. Optional providers can refine missing artwork later.")}
    };
  }

  std::mutex s_art_autoscan_mutex;
  nlohmann::json s_art_autoscan_status = {
    {"running", false},
    {"scannedGameCount", 0},
    {"targetGameCount", 0},
    {"results", nlohmann::json::array()}
  };

  static std::string normalize_game_title(std::string title) {
    boost::algorithm::to_lower(title);
    title = boost::regex_replace(title, boost::regex(R"([\xC2\xAE\xE2\x84\xA2:'’`",.!?\[\]\(\)\{\}_\-]+)"), " ");
    title = boost::regex_replace(title, boost::regex(R"(\b(game of the year|goty|gold edition|deluxe edition|ultimate edition|definitive edition|complete edition|remastered|remake)\b)"), " ");
    title = boost::regex_replace(title, boost::regex(R"(\biii\b)"), "3");
    title = boost::regex_replace(title, boost::regex(R"(\biv\b)"), "4");
    title = boost::regex_replace(title, boost::regex(R"(\bv\b)"), "5");
    title = boost::regex_replace(title, boost::regex(R"(\s+)"), " ");
    return trim_copy(title);
  }

  static void add_art_candidate(nlohmann::json &candidates, std::unordered_set<std::string> &seen_urls, const std::string &source, const std::string &title, const std::string &url, int confidence, const nlohmann::json &metadata = nlohmann::json::object()) {
    if (url.empty() || !seen_urls.insert(url).second) {
      return;
    }
    nlohmann::json item;
    item["id"] = source + ":" + std::to_string(candidates.size());
    item["source"] = source;
    item["title"] = title;
    item["imageUrl"] = url;
    item["confidence"] = confidence;
    item["metadata"] = metadata.is_object() ? metadata : nlohmann::json::object();
    candidates.push_back(item);
  }

  static void append_steam_autoscan_candidates(const nlohmann::json &app, nlohmann::json &candidates, std::unordered_set<std::string> &seen_urls) {
    const auto title = json_string_value(app, "name");
    const auto provider_game_id = app_provider_game_id(app);
    const auto source_id = app_source_id(app);
    if (source_id == "steam" && !provider_game_id.empty()) {
      const auto local_art = steam_local_art_url(provider_game_id);
      add_art_candidate(candidates, seen_urls, "steam-local", title, local_art, 100, steam_store_app_metadata_cached_only(provider_game_id));
      add_art_candidate(candidates, seen_urls, "steam-cdn", title, steam_cdn_poster_url(provider_game_id), 92, steam_store_app_metadata(provider_game_id));
    }

    std::string html;
    std::string error;
    long http_code = 0;
    const auto suggest_url = "https://store.steampowered.com/search/suggest?term="s + http::url_escape(title) + "&f=games&cc=US&l=english";
    if (!http_get_string(suggest_url, html, http_code, error) || http_code < 200 || http_code >= 300) {
      return;
    }
    boost::regex appid_re(R"(data-ds-appid=["']([0-9]+)["'])");
    boost::smatch match;
    std::string::const_iterator start = html.begin();
    int added = 0;
    while (boost::regex_search(start, html.cend(), match, appid_re) && added < 4) {
      const auto appid = match[1].str();
      const auto meta = steam_store_app_metadata(appid);
      const auto meta_title = json_string_value(meta, "title");
      const int confidence = normalize_game_title(meta_title) == normalize_game_title(title) ? 96 : 72;
      add_art_candidate(candidates, seen_urls, "steam-search", meta_title.empty() ? title : meta_title, steam_cdn_poster_url(appid), confidence, meta);
      start = match[0].second;
      ++added;
    }
  }

  static void append_scraped_image_candidates(const std::string &source, const std::string &title, const std::string &url, const boost::regex &image_re, nlohmann::json &candidates, std::unordered_set<std::string> &seen_urls) {
    std::string html;
    std::string error;
    long http_code = 0;
    if (!http_get_string(url, html, http_code, error) || http_code < 200 || http_code >= 300) {
      return;
    }
    boost::replace_all(html, "\\u0026", "&");
    boost::replace_all(html, "\\u003d", "=");
    boost::replace_all(html, "\\u003D", "=");
    boost::replace_all(html, "\\u003a", ":");
    boost::replace_all(html, "\\u003A", ":");
    boost::replace_all(html, "\\u002f", "/");
    boost::replace_all(html, "\\u002F", "/");
    boost::replace_all(html, "%3A", ":");
    boost::replace_all(html, "%2F", "/");
    boost::smatch match;
    std::string::const_iterator start = html.begin();
    int added = 0;
    while (boost::regex_search(start, html.cend(), match, image_re) && added < 4) {
      auto image = match[1].str();
      boost::replace_all(image, "\\/", "/");
      boost::replace_all(image, "&amp;", "&");
      if (image.rfind("//", 0) == 0) {
        image = "https:" + image;
      }
      if (image.rfind("http://", 0) == 0 || image.rfind("https://", 0) == 0) {
        add_art_candidate(candidates, seen_urls, source, title, image, 62);
        ++added;
      }
      start = match[0].second;
    }
  }

  static void append_steamgriddb_candidates(const nlohmann::json &app, nlohmann::json &candidates, std::unordered_set<std::string> &seen_urls) {
    const auto states = read_metadata_provider_states();
    const auto provider = metadata_provider_state_or_empty(states, "steamgriddb");
    if (!provider.value("configured", false) || !provider.contains("secretConfig") || !provider["secretConfig"].is_object()) {
      return;
    }
    std::string api_key;
    if (!decrypt_provider_secret(json_string_value(provider["secretConfig"], "apiKeyEncrypted"), api_key) || api_key.empty()) {
      return;
    }

    const auto title = json_string_value(app, "name");
    nlohmann::json search;
    std::string error;
    long http_code = 0;
    const auto search_url = "https://www.steamgriddb.com/api/v2/search/autocomplete/"s + http::url_escape(title);
    if (!http_get_json_bearer(search_url, api_key, search, http_code, error) || http_code < 200 || http_code >= 300) {
      return;
    }
    if (!search.contains("data") || !search["data"].is_array() || search["data"].empty()) {
      return;
    }
    const auto &game = search["data"][0];
    if (!game.contains("id") || !game["id"].is_number_integer()) {
      return;
    }
    const int game_id = game["id"].get<int>();
    const auto matched_title = json_string_value(game, "name");
    nlohmann::json grids;
    const auto grids_url = "https://www.steamgriddb.com/api/v2/grids/game/"s + std::to_string(game_id) + "?dimensions=600x900&types=static&limit=12";
    if (!http_get_json_bearer(grids_url, api_key, grids, http_code, error) || http_code < 200 || http_code >= 300) {
      return;
    }
    if (!grids.contains("data") || !grids["data"].is_array()) {
      return;
    }
    const int confidence = normalize_game_title(matched_title) == normalize_game_title(title) ? 98 : 78;
    for (const auto &grid : grids["data"]) {
      add_art_candidate(candidates, seen_urls, "steamgriddb", matched_title.empty() ? title : matched_title, json_string_value(grid, "url"), confidence);
    }
  }

  static std::string igdb_image_url(const nlohmann::json &node, const char *field, const std::string &size) {
    if (!node.contains(field) || !node[field].is_object()) {
      return {};
    }
    const auto image_id = json_string_value(node[field], "image_id");
    if (image_id.empty()) {
      return {};
    }
    return "https://images.igdb.com/igdb/image/upload/t_" + size + "/" + image_id + ".jpg";
  }

  static nlohmann::json json_name_array(const nlohmann::json &node, const char *field) {
    nlohmann::json out = nlohmann::json::array();
    if (!node.contains(field) || !node[field].is_array()) {
      return out;
    }
    for (const auto &item : node[field]) {
      const auto name = json_string_value(item, "name");
      if (!name.empty()) {
        out.push_back(name);
      }
    }
    return out;
  }

  static std::string igdb_company_name(const nlohmann::json &game, bool developer) {
    if (!game.contains("involved_companies") || !game["involved_companies"].is_array()) {
      return {};
    }
    for (const auto &entry : game["involved_companies"]) {
      if (!entry.is_object() || entry.value(developer ? "developer" : "publisher", false) == false) {
        continue;
      }
      if (entry.contains("company") && entry["company"].is_object()) {
        const auto name = json_string_value(entry["company"], "name");
        if (!name.empty()) {
          return name;
        }
      }
    }
    return {};
  }

  static std::string igdb_first_release_date(const nlohmann::json &game) {
    if (game.contains("release_dates") && game["release_dates"].is_array()) {
      for (const auto &release : game["release_dates"]) {
        const auto human = json_string_value(release, "human");
        if (!human.empty()) {
          return human;
        }
      }
    }
    if (game.contains("first_release_date") && game["first_release_date"].is_number_integer()) {
      const auto seconds = game["first_release_date"].get<std::int64_t>();
      std::time_t t = static_cast<std::time_t>(seconds);
      std::tm tm {};
#ifdef _WIN32
      gmtime_s(&tm, &t);
#else
      gmtime_r(&t, &tm);
#endif
      char buf[16] {};
      if (std::strftime(buf, sizeof(buf), "%Y-%m-%d", &tm) > 0) {
        return buf;
      }
    }
    return {};
  }

  static nlohmann::json igdb_media_urls(const nlohmann::json &game, const char *field, const std::string &size, int limit) {
    nlohmann::json out = nlohmann::json::array();
    if (!game.contains(field) || !game[field].is_array()) {
      return out;
    }
    int added = 0;
    for (const auto &item : game[field]) {
      const auto image_id = json_string_value(item, "image_id");
      if (!image_id.empty()) {
        out.push_back("https://images.igdb.com/igdb/image/upload/t_" + size + "/" + image_id + ".jpg");
        if (++added >= limit) {
          break;
        }
      }
    }
    return out;
  }

  static nlohmann::json igdb_game_metadata(const nlohmann::json &game) {
    nlohmann::json metadata = nlohmann::json::object();
    metadata["igdbId"] = game.value("id", 0);
    metadata["title"] = json_string_value(game, "name");
    metadata["description"] = json_string_value(game, "summary").empty() ? json_string_value(game, "storyline") : json_string_value(game, "summary");
    metadata["storyline"] = json_string_value(game, "storyline");
    metadata["developer"] = igdb_company_name(game, true);
    metadata["publisher"] = igdb_company_name(game, false);
    metadata["releaseDate"] = igdb_first_release_date(game);
    metadata["genres"] = json_name_array(game, "genres");
    metadata["themes"] = json_name_array(game, "themes");
    metadata["gameModes"] = json_name_array(game, "game_modes");
    metadata["playerPerspectives"] = json_name_array(game, "player_perspectives");
    metadata["platforms"] = json_name_array(game, "platforms");
    metadata["collections"] = json_name_array(game, "collections");
    metadata["franchises"] = json_name_array(game, "franchises");
    metadata["similarGames"] = json_name_array(game, "similar_games");
    metadata["igdbUrl"] = json_string_value(game, "url");
    metadata["slug"] = json_string_value(game, "slug");
    metadata["posterUrl"] = igdb_image_url(game, "cover", "cover_big_2x");
    metadata["artworkUrls"] = igdb_media_urls(game, "artworks", "1080p", 4);
    metadata["screenshotUrls"] = igdb_media_urls(game, "screenshots", "1080p", 4);
    if (game.contains("total_rating") && game["total_rating"].is_number()) metadata["totalRating"] = game["total_rating"];
    if (game.contains("rating") && game["rating"].is_number()) metadata["userRating"] = game["rating"];
    if (game.contains("aggregated_rating") && game["aggregated_rating"].is_number()) metadata["criticRating"] = game["aggregated_rating"];
    if (game.contains("videos") && game["videos"].is_array()) {
      nlohmann::json videos = nlohmann::json::array();
      for (const auto &video : game["videos"]) {
        const auto id = json_string_value(video, "video_id");
        if (!id.empty()) {
          videos.push_back("https://www.youtube.com/watch?v=" + id);
        }
      }
      metadata["videoUrls"] = videos;
    }
    return metadata;
  }

  static std::string igdb_query_escape(std::string value) {
    boost::replace_all(value, "\\", "\\\\");
    boost::replace_all(value, "\"", "\\\"");
    return value;
  }

  static bool igdb_provider_credentials(std::string &client_id, std::string &client_secret) {
    const auto states = read_metadata_provider_states();
    const auto provider = metadata_provider_state_or_empty(states, "igdb");
    if (provider.value("configured", false) && provider.contains("secretConfig") && provider["secretConfig"].is_object()) {
      if (decrypt_provider_secret(json_string_value(provider["secretConfig"], "clientIdEncrypted"), client_id) &&
          decrypt_provider_secret(json_string_value(provider["secretConfig"], "clientSecretEncrypted"), client_secret) &&
          !client_id.empty() && !client_secret.empty()) {
        return true;
      }
    }

    client_id = JUJO_IGDB_CLIENT_ID;
    client_secret = JUJO_IGDB_CLIENT_SECRET;
    return !client_id.empty() && !client_secret.empty();
  }

  static bool igdb_access_token(const std::string &client_id, const std::string &client_secret, std::string &access_token) {
    static std::mutex token_mutex;
    static std::string cached_token;
    static std::string cached_credentials_key;
    static std::chrono::system_clock::time_point expires_at {};
    const auto credentials_key = client_id + ":" + client_secret;
    {
      std::lock_guard<std::mutex> lk(token_mutex);
      if (!cached_token.empty() &&
          cached_credentials_key == credentials_key &&
          std::chrono::system_clock::now() + std::chrono::minutes(5) < expires_at) {
        access_token = cached_token;
        return true;
      }
    }

    std::string response_body;
    long http_code = 0;
    std::string error;
    const auto body = "client_id=" + http::url_escape(client_id) +
      "&client_secret=" + http::url_escape(client_secret) +
      "&grant_type=client_credentials";
    if (!http_post_form_string("https://id.twitch.tv/oauth2/token", body, response_body, http_code, error) || http_code < 200 || http_code >= 300) {
      BOOST_LOG(warning) << "IGDB token request failed: " << (error.empty() ? std::to_string(http_code) : error);
      return false;
    }
    nlohmann::json parsed;
    if (!parse_json_response(response_body, parsed, error)) {
      BOOST_LOG(warning) << "IGDB token response parse failed: " << error;
      return false;
    }
    const auto token = json_string_value(parsed, "access_token");
    if (token.empty()) {
      BOOST_LOG(warning) << "IGDB token response did not include an access token";
      return false;
    }
    const auto ttl = parsed.value("expires_in", 3600);
    {
      std::lock_guard<std::mutex> lk(token_mutex);
      cached_token = token;
      cached_credentials_key = credentials_key;
      expires_at = std::chrono::system_clock::now() + std::chrono::seconds(std::max(60, ttl));
      access_token = cached_token;
    }
    return true;
  }

  static void append_igdb_candidates(const nlohmann::json &app, nlohmann::json &candidates, std::unordered_set<std::string> &seen_urls) {
    std::string client_id;
    std::string client_secret;
    if (!igdb_provider_credentials(client_id, client_secret)) {
      return;
    }
    std::string token;
    if (!igdb_access_token(client_id, client_secret, token)) {
      return;
    }

    const auto title = json_string_value(app, "name");
    if (title.empty()) {
      return;
    }
    const auto query =
      "search \"" + igdb_query_escape(title) + "\"; "
      "fields name,slug,url,summary,storyline,first_release_date,rating,rating_count,aggregated_rating,aggregated_rating_count,total_rating,total_rating_count,"
      "cover.image_id,artworks.image_id,screenshots.image_id,genres.name,themes.name,game_modes.name,player_perspectives.name,platforms.name,"
      "involved_companies.company.name,involved_companies.developer,involved_companies.publisher,release_dates.human,websites.url,videos.video_id,"
      "collections.name,franchises.name,similar_games.name; "
      "where version_parent = null; limit 5;";

    nlohmann::json games;
    long http_code = 0;
    std::string error;
    if (!http_post_igdb_json("games", client_id, token, query, games, http_code, error) || http_code < 200 || http_code >= 300 || !games.is_array()) {
      BOOST_LOG(warning) << "IGDB search failed for library title: " << (error.empty() ? std::to_string(http_code) : error);
      return;
    }
    int added = 0;
    for (const auto &game : games) {
      const auto cover_url = igdb_image_url(game, "cover", "cover_big_2x");
      if (cover_url.empty()) {
        continue;
      }
      const auto matched_title = json_string_value(game, "name");
      const int confidence = normalize_game_title(matched_title) == normalize_game_title(title) ? 97 : 80;
      add_art_candidate(candidates, seen_urls, "igdb", matched_title.empty() ? title : matched_title, cover_url, confidence, igdb_game_metadata(game));
      if (++added >= 3) {
        break;
      }
    }
  }

  nlohmann::json scan_art_for_app(const nlohmann::json &app, int index) {
    nlohmann::json result;
    result["uuid"] = json_string_value(app, "uuid");
    result["index"] = index;
    result["name"] = json_string_value(app, "name").empty() ? "Untitled game" : json_string_value(app, "name");
    result["source"] = app_source_id(app);
    result["candidates"] = nlohmann::json::array();
    std::unordered_set<std::string> seen_urls;

    const auto install_path = json_string_value(app, "working-dir");
    if (!install_path.empty()) {
      const auto local = find_local_game_poster(fs::path(install_path));
      add_art_candidate(result["candidates"], seen_urls, "local-folder", result["name"], local, 100);
    }
    append_steam_autoscan_candidates(app, result["candidates"], seen_urls);
    append_scraped_image_candidates("epic-web", result["name"], "https://store.epicgames.com/en-US/browse?q=" + http::url_escape(result["name"].get<std::string>()) + "&sortBy=relevancy&sortDir=DESC&count=40", boost::regex(R"((https?:\\?/\\?/[^"']+epicgames[^"']+\.(?:jpg|jpeg|png|webp)[^"']*))", boost::regex::icase), result["candidates"], seen_urls);
    append_scraped_image_candidates("google-images", result["name"], "https://www.google.com/search?udm=2&tbm=isch&q=" + http::url_escape("\"" + result["name"].get<std::string>() + "\" game cover poster"), boost::regex(R"((https?:\\?/\\?/(?:encrypted-tbn[0-9]\.gstatic\.com|lh[0-9]\.googleusercontent\.com|[^"']*googleusercontent\.com)[^"']+|https?:\\?/\\?/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*))", boost::regex::icase), result["candidates"], seen_urls);
    append_steamgriddb_candidates(app, result["candidates"], seen_urls);
    append_igdb_candidates(app, result["candidates"], seen_urls);
    result["candidateCount"] = static_cast<int>(result["candidates"].size());
    return result;
  }

  void run_art_autoscan_worker(bool missing_only, bool force_apply) {
    nlohmann::json file_tree;
    try {
      file_tree = proc::read_apps_file(config::stream.file_apps);
    } catch (...) {
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      s_art_autoscan_status["running"] = false;
      s_art_autoscan_status["error"] = "Failed to read app library.";
      return;
    }
    const auto apps = file_tree.contains("apps") && file_tree["apps"].is_array() ? file_tree["apps"] : nlohmann::json::array();
    std::vector<std::pair<int, nlohmann::json>> targets;
    int index = 0;
    for (const auto &app : apps) {
      if (app.is_object()) {
        const bool has_image = json_string_not_empty(app, "image-path") || json_string_not_empty(app, "image_path");
        if (!missing_only || !has_image) {
          targets.emplace_back(index, app);
        }
      }
      ++index;
    }
    {
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      s_art_autoscan_status["targetGameCount"] = static_cast<int>(targets.size());
      s_art_autoscan_status["scannedGameCount"] = 0;
      s_art_autoscan_status["results"] = nlohmann::json::array();
      s_art_autoscan_status.erase("error");
    }

    nlohmann::json results = nlohmann::json::array();
    int scanned = 0;
    bool modified = false;
    for (const auto &[app_index, app] : targets) {
      auto result = scan_art_for_app(app, app_index);
      if (result.value("candidateCount", 0) > 0) {
        if (force_apply && file_tree.contains("apps") && file_tree["apps"].is_array() && app_index >= 0 && app_index < static_cast<int>(file_tree["apps"].size())) {
          auto best = result["candidates"][0];
          for (const auto &candidate : result["candidates"]) {
            if (candidate.value("confidence", 0) > best.value("confidence", 0)) {
              best = candidate;
            }
          }
          auto &target_app = file_tree["apps"][app_index];
          target_app["image-path"] = json_string_value(best, "imageUrl");
          if (best.contains("metadata") && best["metadata"].is_object()) {
            const auto &metadata = best["metadata"];
            const auto description = json_string_value(metadata, "description");
            const auto developer = json_string_value(metadata, "developer");
            const auto publisher = json_string_value(metadata, "publisher");
            const auto release_date = json_string_value(metadata, "releaseDate");
            if (!description.empty()) target_app["description"] = description;
            if (!developer.empty()) target_app["developer"] = developer;
            if (!publisher.empty()) target_app["publisher"] = publisher;
            if (!release_date.empty()) target_app["release-date"] = release_date;
            if (metadata.contains("genres") && metadata["genres"].is_array()) target_app["genres"] = metadata["genres"];
          }
          result["forceApplied"] = true;
          result["selectedImageUrl"] = json_string_value(best, "imageUrl");
          modified = true;
        }
        results.push_back(result);
      }
      ++scanned;
      std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
      s_art_autoscan_status["scannedGameCount"] = scanned;
      s_art_autoscan_status["results"] = results;
    }
    if (modified) {
      refresh_client_apps_cache(file_tree, true);
    }
    std::lock_guard<std::mutex> lk(s_art_autoscan_mutex);
    s_art_autoscan_status["running"] = false;
    s_art_autoscan_status["completedAt"] = now_iso8601_utc_string();
  }
  using enum confighttp::StatusCode;

  std::string trim_copy(const std::string &input) {
    auto begin = input.begin();
    auto end = input.end();
    while (begin != end && std::isspace(static_cast<unsigned char>(*begin))) {
      ++begin;
    }
    while (end != begin && std::isspace(static_cast<unsigned char>(*(end - 1)))) {
      --end;
    }
    return std::string {begin, end};
  }

  static bool file_is_regular(const fs::path &path) {
    if (path.empty()) {
      return false;
    }
    std::error_code ec;
    return fs::exists(path, ec) && fs::is_regular_file(path, ec);
  }

  static bool resolve_cover_path_for_uuid(const std::string &uuid, fs::path &out_path) {
    if (uuid.empty()) {
      return false;
    }

    try {
      nlohmann::json file_tree = proc::read_apps_file(config::stream.file_apps);
      if (!file_tree.contains("apps") || !file_tree["apps"].is_array()) {
        return false;
      }

      const fs::path cover_dir = fs::path(platf::appdata()) / "covers";
      const fs::path config_dir = fs::path(config::stream.file_apps).parent_path();
      const fs::path assets_dir = fs::path(SUNSHINE_ASSETS_DIR);

      for (const auto &entry : file_tree["apps"]) {
        if (!entry.is_object()) {
          continue;
        }
        if (!entry.contains("uuid") || !entry["uuid"].is_string()) {
          continue;
        }
        if (entry["uuid"].get<std::string>() != uuid) {
          continue;
        }

        std::string image_path;
        if (entry.contains("image-path") && entry["image-path"].is_string()) {
          image_path = entry["image-path"].get<std::string>();
        }
        std::string playnite_id;
        if (entry.contains("playnite-id") && entry["playnite-id"].is_string()) {
          playnite_id = entry["playnite-id"].get<std::string>();
        }

        std::vector<fs::path> candidates;
        std::unordered_set<std::string> seen;
        auto push_candidate = [&](fs::path candidate) {
          if (candidate.empty()) {
            return;
          }
          auto normalized = candidate.lexically_normal();
          std::string key = normalized.generic_string();
#ifdef _WIN32
          std::transform(key.begin(), key.end(), key.begin(), [](unsigned char c) {
            return static_cast<char>(std::tolower(c));
          });
#endif
          if (!seen.insert(key).second) {
            return;
          }
          candidates.emplace_back(std::move(normalized));
        };

        auto trimmed = trim_copy(image_path);
        auto normalized_path = trimmed;
        std::replace(normalized_path.begin(), normalized_path.end(), '\\', '/');

        if (!trimmed.empty()) {
          fs::path direct(trimmed);
          push_candidate(direct);
          if (!direct.is_absolute()) {
            if (!normalized_path.empty() && normalized_path.rfind("./", 0) == 0) {
              fs::path rel(normalized_path.substr(2));
              push_candidate(config_dir / rel);
              push_candidate(assets_dir / rel);
            }
            push_candidate(config_dir / direct);
            push_candidate(assets_dir / direct);
            if (normalized_path.rfind("covers/", 0) == 0) {
              fs::path rel(normalized_path.substr(7));
              push_candidate(cover_dir / rel);
            }
            if (normalized_path.rfind("./covers/", 0) == 0) {
              fs::path rel(normalized_path.substr(9));
              push_candidate(cover_dir / rel);
            }
          }
        }

        static const std::array<const char *, 4> fallback_exts {".png", ".jpg", ".jpeg", ".webp"};
        for (const char *ext : fallback_exts) {
          push_candidate(cover_dir / (uuid + ext));
        }
        if (!playnite_id.empty()) {
          push_candidate(cover_dir / (std::string("playnite_") + playnite_id + ".png"));
        }

        for (const auto &candidate : candidates) {
          if (file_is_regular(candidate)) {
            out_path = candidate;
            return true;
          }
        }

        fs::path fallback = assets_dir / "box.png";
        if (file_is_regular(fallback)) {
          out_path = fallback;
          return true;
        }

        return false;
      }
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "resolve_cover_path_for_uuid: failed for uuid '" << uuid << "': " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "resolve_cover_path_for_uuid: failed for uuid '" << uuid << "': unknown error";
    }
    return false;
  }

  static nlohmann::json read_metadata_provider_states() {
    auto state = read_jujoserver_state_json();
    try {
      if (state["root"].contains("library_metadata") && state["root"]["library_metadata"].is_object()) {
        auto metadata = state["root"]["library_metadata"];
        if (metadata.contains("providers") && metadata["providers"].is_object()) {
          return metadata["providers"];
        }
      }
    } catch (...) {}
    return nlohmann::json::object();
  }

  static nlohmann::json metadata_provider_state_or_empty(const nlohmann::json &states, const std::string &provider_id) {
    try {
      if (states.contains(provider_id) && states[provider_id].is_object()) {
        return states[provider_id];
      }
    } catch (...) {}
    return nlohmann::json::object();
  }

  bool save_metadata_provider_state(const std::string &provider_id, const nlohmann::json &provider_state) {
    auto state = read_jujoserver_state_json();
    try {
      if (!state.contains("root") || !state["root"].is_object()) {
        state["root"] = nlohmann::json::object();
      }
      auto &root = state["root"];
      if (!root.contains("library_metadata") || !root["library_metadata"].is_object()) {
        root["library_metadata"] = nlohmann::json::object();
      }
      auto &metadata = root["library_metadata"];
      metadata["schemaVersion"] = 1;
      if (!metadata.contains("providers") || !metadata["providers"].is_object()) {
        metadata["providers"] = nlohmann::json::object();
      }
      metadata["providers"][provider_id] = provider_state;
      return write_jujoserver_state_json(state);
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "metadata providers: failed to save provider state: " << e.what();
    } catch (...) {
      BOOST_LOG(error) << "metadata providers: failed to save provider state";
    }
    return false;
  }

  using https_server_t = SimpleWeb::Server<SimpleWeb::HTTPS>;
  using args_t = SimpleWeb::CaseInsensitiveMultimap;
  using resp_https_t = std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response>;
  using req_https_t = std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request>;

  bool is_token_route_eligible(std::string_view path) {
    return path.rfind("/api/", 0) == 0 && path.rfind("/api/auth/", 0) != 0;
  }

  std::vector<std::string> ordered_methods_for_catalog(const std::set<std::string, std::less<>> &methods) {
    static constexpr std::array<std::string_view, 5> preferred_order = {
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    };

    std::vector<std::string> ordered;
    ordered.reserve(methods.size());

    for (const auto method : preferred_order) {
      if (methods.contains(std::string(method))) {
        ordered.emplace_back(method);
      }
    }

    for (const auto &method : methods) {
      if (std::find(preferred_order.begin(), preferred_order.end(), method) == preferred_order.end()) {
        ordered.push_back(method);
      }
    }

    return ordered;
  }

  namespace {
    std::mutex token_route_catalog_mutex;
    token_route_methods_t token_route_catalog;

    std::string normalize_route_pattern(std::string pattern) {
      if (!pattern.empty() && pattern.front() == '^') {
        pattern.erase(pattern.begin());
      }
      if (!pattern.empty() && pattern.back() == '$') {
        pattern.pop_back();
      }
      return pattern;
    }

    void clear_token_route_catalog() {
      std::scoped_lock lock(token_route_catalog_mutex);
      token_route_catalog.clear();
    }

    void record_token_route(std::string path, std::string method) {
      if (!is_token_route_eligible(path)) {
        return;
      }
      boost::to_upper(method);
      std::scoped_lock lock(token_route_catalog_mutex);
      token_route_catalog[std::move(path)].insert(std::move(method));
    }
  }

  token_route_methods_t snapshot_token_route_catalog() {
    std::scoped_lock lock(token_route_catalog_mutex);
    return token_route_catalog;
  }

  // Forward declaration for error helper implemented later
  void bad_request(resp_https_t response, req_https_t request, const std::string &error_message);

  /**
   * @brief Get the CORS origin for localhost (no wildcard).
   * @return The CORS origin string.
   */
  std::string get_cors_origin() {
    std::uint16_t https_port = net::map_port(PORT_HTTPS);
    return std::format("https://localhost:{}", https_port);
  }

  /**
   * @brief Helper to add CORS headers for API responses.
   * @param headers The headers to add CORS to.
   */
  void add_cors_headers(SimpleWeb::CaseInsensitiveMultimap &headers) {
    headers.emplace("Access-Control-Allow-Origin", get_cors_origin());
    headers.emplace("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    headers.emplace("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  /**
   * @brief Send a response.
   * @param response The HTTP response object.
   * @param output_tree The JSON tree to send.
   */
  void send_response(resp_https_t response, const nlohmann::json &output_tree) {
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json; charset=utf-8");
    add_cors_headers(headers);
    response->write(success_ok, output_tree.dump(), headers);
  }

  nlohmann::json load_webrtc_ice_servers() {
    auto env = std::getenv("JUJO_WEBRTC_ICE_SERVERS");
    if (!env || !*env) {
      env = std::getenv("SUNSHINE_WEBRTC_ICE_SERVERS");  // backward compat
    }
    if (!env || !*env) {
      return nlohmann::json::array();
    }

    try {
      auto parsed = nlohmann::json::parse(env);
      if (parsed.is_array()) {
        return parsed;
      }
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "WebRTC: invalid JUJO_WEBRTC_ICE_SERVERS: "sv << e.what();
    }

    return nlohmann::json::array();
  }

  nlohmann::json webrtc_session_to_json(const webrtc_stream::SessionState &state) {
    nlohmann::json output;
    output["id"] = state.id;
    output["audio"] = state.audio;
    output["video"] = state.video;
    output["encoded"] = state.encoded;
    output["audio_packets"] = state.audio_packets;
    output["video_packets"] = state.video_packets;
    output["audio_dropped"] = state.audio_dropped;
    output["video_dropped"] = state.video_dropped;
    output["audio_queue_frames"] = state.audio_queue_frames;
    output["video_queue_frames"] = state.video_queue_frames;
    output["video_inflight_frames"] = state.video_inflight_frames;
    output["has_remote_offer"] = state.has_remote_offer;
    output["has_local_answer"] = state.has_local_answer;
    output["ice_candidates"] = state.ice_candidates;
    output["width"] = state.width ? nlohmann::json(*state.width) : nlohmann::json(nullptr);
    output["height"] = state.height ? nlohmann::json(*state.height) : nlohmann::json(nullptr);
    output["fps"] = state.fps ? nlohmann::json(*state.fps) : nlohmann::json(nullptr);
    output["bitrate_kbps"] = state.bitrate_kbps ? nlohmann::json(*state.bitrate_kbps) : nlohmann::json(nullptr);
    output["codec"] = state.codec ? nlohmann::json(*state.codec) : nlohmann::json(nullptr);
    output["hdr"] = state.hdr ? nlohmann::json(*state.hdr) : nlohmann::json(nullptr);
    output["audio_channels"] = state.audio_channels ? nlohmann::json(*state.audio_channels) : nlohmann::json(nullptr);
    output["profile"] = state.profile ? nlohmann::json(*state.profile) : nlohmann::json(nullptr);
    output["video_pacing_mode"] = state.video_pacing_mode ? nlohmann::json(*state.video_pacing_mode) : nlohmann::json(nullptr);
    output["video_pacing_slack_ms"] = state.video_pacing_slack_ms ? nlohmann::json(*state.video_pacing_slack_ms) : nlohmann::json(nullptr);
    output["video_max_frame_age_ms"] = state.video_max_frame_age_ms ? nlohmann::json(*state.video_max_frame_age_ms) : nlohmann::json(nullptr);
    output["last_audio_bytes"] = state.last_audio_bytes;
    output["last_video_bytes"] = state.last_video_bytes;
    output["last_video_idr"] = state.last_video_idr;
    output["last_video_frame_index"] = state.last_video_frame_index;

    auto now = std::chrono::steady_clock::now();
    auto age_or_null = [&now](const std::optional<std::chrono::steady_clock::time_point> &tp) -> nlohmann::json {
      if (!tp) {
        return nullptr;
      }
      return std::chrono::duration_cast<std::chrono::milliseconds>(now - *tp).count();
    };

    output["last_audio_age_ms"] = age_or_null(state.last_audio_time);
    output["last_video_age_ms"] = age_or_null(state.last_video_time);
    return output;
  }

  /**
   * @brief Write an APIResponse to an HTTP response object.
   * @param response The HTTP response object.
   * @param api_response The APIResponse containing the structured response data.
   */
  void write_api_response(resp_https_t response, const APIResponse &api_response) {
    SimpleWeb::CaseInsensitiveMultimap headers = api_response.headers;
    headers.emplace("Content-Type", "application/json");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    add_cors_headers(headers);
    response->write(api_response.status_code, api_response.body, headers);
  }

  /**
   * @brief Send a 401 Unauthorized response.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void send_unauthorized(resp_https_t response, req_https_t request) {
    auto address = net::addr_to_normalized_string(request->remote_endpoint().address());
    BOOST_LOG(info) << "Web UI: ["sv << address << "] -- not authorized"sv;

    constexpr auto code = client_error_unauthorized;

    nlohmann::json tree;
    tree["status_code"] = code;
    tree["status"] = false;
    tree["error"] = "Unauthorized";
    const SimpleWeb::CaseInsensitiveMultimap headers {
      {"Content-Type", "application/json"},
      {"X-Frame-Options", "DENY"},
      {"Content-Security-Policy", "frame-ancestors 'none';"},
      {"Access-Control-Allow-Origin", get_cors_origin()}
    };
    response->write(code, tree.dump(), headers);
  }

  /**
   * @brief Send a redirect response.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * @param path The path to redirect to.
   */
  void send_redirect(resp_https_t response, req_https_t request, const char *path) {
    auto address = net::addr_to_normalized_string(request->remote_endpoint().address());
    BOOST_LOG(info) << "Web UI: ["sv << address << "] -- redirecting"sv;
    const SimpleWeb::CaseInsensitiveMultimap headers {
      {"Location", path},
      {"X-Frame-Options", "DENY"},
      {"Content-Security-Policy", "frame-ancestors 'none';"}
    };
    response->write(redirection_temporary_redirect, headers);
  }

  /**
   * @brief Enforce origin access policy based on configured network scope.
   * @return True if the remote address is permitted, false otherwise (response set).
   */
  bool checkIPOrigin(resp_https_t response, req_https_t request) {
    const auto remote_address = net::addr_to_normalized_string(request->remote_endpoint().address());
    const auto ip_type = net::from_address(remote_address);
    if (ip_type > http::origin_web_ui_allowed) {
      BOOST_LOG(info) << "Web UI: ["sv << remote_address << "] -- denied by origin policy"sv;
      nlohmann::json tree;
      tree["status_code"] = static_cast<int>(SimpleWeb::StatusCode::client_error_forbidden);
      tree["status"] = false;
      tree["error"] = "Forbidden";
      SimpleWeb::CaseInsensitiveMultimap headers {
        {"Content-Type", "application/json"},
        {"X-Frame-Options", "DENY"},
        {"Content-Security-Policy", "frame-ancestors 'none';"}
      };
      add_cors_headers(headers);
      response->write(SimpleWeb::StatusCode::client_error_forbidden, tree.dump(), headers);
      return false;
    }
    return true;
  }

  /**
   * @brief Check authentication and authorization for an HTTP request.
   * @param request The HTTP request object.
   * @return AuthResult with outcome and response details if not authorized.
   */
  AuthResult check_auth(const req_https_t &request) {
    auto address = net::addr_to_normalized_string(request->remote_endpoint().address());
    std::string auth_header;
    // Try Authorization header
    if (auto auth_it = request->header.find("authorization"); auth_it != request->header.end()) {
      auth_header = auth_it->second;
    } else {
      std::string token = extract_session_token_from_cookie(request->header);
      if (!token.empty()) {
        auth_header = "Session " + token;
      }
    }
    return check_auth(address, auth_header, request->path, request->method);
  }

  /**
   * @brief Authenticate the user or API token for a specific path/method.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * @return True if authenticated and authorized, false otherwise.
   */
  bool authenticate(resp_https_t response, req_https_t request) {
    if (auto result = check_auth(request); !result.ok) {
      if (result.code == StatusCode::redirection_temporary_redirect) {
        response->write(result.code, result.headers);
      } else if (!result.body.empty()) {
        response->write(result.code, result.body, result.headers);
      } else {
        response->write(result.code);
      }
      return false;
    }
    return true;
  }

  /**
   * @brief Authenticate AND authorize a request against a minimum RBAC role.
   *
   * - Session/API-token auth → always admin (backward compatible)
   * - Cloud JWT auth → looks up user_id in rbac::registry
   * - Returns false and writes 403 if role is insufficient
   *
   * @param response HTTP response (written to on failure)
   * @param request HTTP request
   * @param required Minimum role required for this endpoint
   * @return true if authenticated AND authorized
   */
  bool authorize(resp_https_t response, req_https_t request, rbac::Role required) {
    auto result = check_auth(request);
    if (!result.ok) {
      if (result.code == StatusCode::redirection_temporary_redirect) {
        response->write(result.code, result.headers);
      } else if (!result.body.empty()) {
        response->write(result.code, result.body, result.headers);
      } else {
        response->write(result.code);
      }
      return false;
    }

    // Session auth and API token auth → always admin (owner)
    if (result.auth_source == AuthSource::session ||
        result.auth_source == AuthSource::api_token) {
      return true;
    }

    // Cloud JWT auth → check RBAC registry
    if (result.auth_source == AuthSource::cloud_jwt && !result.user_id.empty()) {
      if (rbac::registry.authorize(result.user_id, required)) {
        return true;
      }
      // User exists but insufficient role
      nlohmann::json err;
      err["status"] = false;
      err["error"] = "Forbidden: requires " + rbac::role_to_string(required) + " role";
      response->write(StatusCode::client_error_forbidden, err.dump(), {{"Content-Type", "application/json"}});
      BOOST_LOG(warning) << "RBAC: user " << result.user_id << " denied — requires " << rbac::role_to_string(required);
      return false;
    }

    // Fallback: authenticated but no role info — treat as admin (legacy compatibility)
    return true;
  }


#ifdef _WIN32

#endif

  /**
   * @brief Send a 404 Not Found response.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void not_found(resp_https_t response, [[maybe_unused]] req_https_t request) {
    constexpr auto code = client_error_not_found;

    nlohmann::json tree;
    tree["status_code"] = static_cast<int>(code);
    tree["error"] = "Not Found";
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json");
    headers.emplace("Access-Control-Allow-Origin", get_cors_origin());
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");

    response->write(code, tree.dump(), headers);
  }

  /**
   * @brief Send a 400 Bad Request response.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * @param error_message The error message.
   */
  void bad_request(resp_https_t response, [[maybe_unused]] req_https_t request, const std::string &error_message) {
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json; charset=utf-8");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    add_cors_headers(headers);
    nlohmann::json error = {{"error", error_message}};
    response->write(client_error_bad_request, error.dump(), headers);
  }

  void service_unavailable(resp_https_t response, const std::string &error_message) {
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "application/json; charset=utf-8");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    add_cors_headers(headers);
    nlohmann::json error = {{"error", error_message}};
    response->write(SimpleWeb::StatusCode::server_error_service_unavailable, error.dump(), headers);
  }

  /**
   * @brief Validate the request content type and send bad request when mismatch.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   * @param contentType The required content type.
   */
  bool validateContentType(resp_https_t response, req_https_t request, const std::string_view &contentType) {
    auto requestContentType = request->header.find("content-type");
    if (requestContentType == request->header.end()) {
      bad_request(response, request, "Content type not provided");
      return false;
    }

    // Extract the media type part before any parameters (e.g., charset)
    std::string actualContentType = requestContentType->second;
    size_t semicolonPos = actualContentType.find(';');
    if (semicolonPos != std::string::npos) {
      actualContentType = actualContentType.substr(0, semicolonPos);
    }

    // Trim whitespace and convert to lowercase for case-insensitive comparison
    boost::algorithm::trim(actualContentType);
    boost::algorithm::to_lower(actualContentType);

    std::string expectedContentType(contentType);
    boost::algorithm::to_lower(expectedContentType);

    if (actualContentType != expectedContentType) {
      bad_request(response, request, "Content type mismatch");
      return false;
    }
    return true;
  }

  bool check_content_type(resp_https_t response, req_https_t request, const std::string_view &contentType) {
    return validateContentType(response, request, contentType);
  }

  /**
   * @brief SPA entry responder - serves the single-page app shell (index.html)
   * for any non-API and non-static-asset GET requests. Allows unauthenticated
   * access so the frontend can render login/first-run flows. Static and API
   * routes are expected to be registered explicitly; this function returns
   * a 404 for reserved prefixes to avoid accidentally exposing files.
   */
  void getSpaEntry(resp_https_t response, req_https_t request) {
    print_req(request);

    const std::string &p = request->path;
    // Reserved prefixes that should not be handled by the SPA entry
    static const std::vector<std::string> reserved = {"/api", "/assets", "/covers", "/images", "/images/"};
    for (const auto &r : reserved) {
      if (p.rfind(r, 0) == 0) {
        // Let explicit handlers or default not_found handle these
        not_found(response, request);
        return;
      }
    }

    // Serve the SPA shell (index.html) without server-side auth so frontend
    // can manage routing and authentication flows.
    std::string content = file_handler::read_file(WEB_DIR "index.html");
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "text/html; charset=utf-8");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(content, headers);
  }

  // legacy per-page handlers removed; SPA entry handles these routes

  /**
   * @brief Get the favicon image.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void getFaviconImage(resp_https_t response, req_https_t request) {
    print_req(request);

    std::ifstream in(WEB_DIR "images/jujoserver.ico", std::ios::binary);
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "image/x-icon");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(success_ok, in, headers);
  }

  /**
   * @brief Get the Jujo.Server logo image.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @todo combine function with getFaviconImage and possibly getNodeModules
   * @todo use mime_types map
   */
  void getJujoserverLogoImage(resp_https_t response, req_https_t request) {
    print_req(request);

    std::ifstream in(WEB_DIR "images/logo-jujoserver-45.png", std::ios::binary);
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "image/png");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(success_ok, in, headers);
  }

  /**
   * @brief Check if a path is a child of another path.
   * @param base The base path.
   * @param query The path to check.
   * @return True if the path is a child of the base path, false otherwise.
   */
  bool isChildPath(fs::path const &base, fs::path const &query) {
    auto relPath = fs::relative(base, query);
    return *(relPath.begin()) != fs::path("..");
  }

  /**
   * @brief Get an asset from the node_modules directory.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   */
  void getNodeModules(resp_https_t response, req_https_t request) {
    print_req(request);

    fs::path webDirPath(WEB_DIR);
    fs::path nodeModulesPath(webDirPath / "assets");

    // .relative_path is needed to shed any leading slash that might exist in the request path
    auto filePath = fs::weakly_canonical(webDirPath / fs::path(request->path).relative_path());

    // Don't do anything if file does not exist or is outside the assets directory
    if (!isChildPath(filePath, nodeModulesPath)) {
      BOOST_LOG(warning) << "Someone requested a path " << filePath << " that is outside the assets folder";
      bad_request(response, request, "Bad Request");
      return;
    }

    if (!fs::exists(filePath)) {
      not_found(response, request);
      return;
    }

    auto relPath = fs::relative(filePath, webDirPath);
    // get the mime type from the file extension mime_types map
    // remove the leading period from the extension
    auto mimeType = mime_types.find(relPath.extension().string().substr(1));
    if (mimeType == mime_types.end()) {
      bad_request(response, request, "Bad Request");
      return;
    }
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", mimeType->second);
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    std::ifstream in(filePath.string(), std::ios::binary);
    response->write(success_ok, in, headers);
  }


  nlohmann::json build_system_readiness(int paired_clients, int playable_games) {
    nlohmann::json checks = nlohmann::json::array();
    checks.push_back(readiness_check(
      "client",
      paired_clients > 0 ? "Client paired" : "Client pairing available",
      "ready",
      paired_clients > 0 ? "At least one client is paired with this host." : "No client is paired yet. Pairing is optional until a user is ready to stream.",
      "Open Pairing",
      "/pairing"
    ));
    checks.push_back(readiness_check(
      "game",
      "Playable game available",
      playable_games > 0 ? "ready" : "pending",
      playable_games > 0 ? "At least one game is available for launch." : "Connect a source or add a manual game.",
      "Open Game Sources",
      "/game-sources"
    ));
    checks.push_back(readiness_check(
      "encoder",
      "Encoder ready",
      video::has_attempted_encoder_probe() ? "ready" : "warning",
      video::has_attempted_encoder_probe() ? "Encoder probe completed." : "Detailed encoder probing is pending; this contract reserves the readiness surface for NVENC, AMF, QSV, or software encoder state.",
      "Open Settings",
      "/settings"
    ));
    checks.push_back(readiness_check(
      "capture",
      "Display capture ready",
      "ready",
      "Display capture is available.",
      "Open Settings",
      "/settings"
    ));
    checks.push_back(readiness_check(
      "network",
      "Network reachable",
      "ready",
      "Network bind and streaming ports are reachable.",
      "Open Settings",
      "/settings"
    ));
#ifdef _WIN32
    std::string vigem_version;
    const bool controller_ready = platf::is_vigem_installed(&vigem_version);
    const bool virtual_display_ready = proc::vDisplayDriverStatus == VDISPLAY::DRIVER_STATUS::OK;

    checks.push_back(readiness_check(
      "controller",
      "Controller driver ready",
      controller_ready ? "ready" : "warning",
      controller_ready
        ? (vigem_version.empty() ? "ViGEm controller routing is installed." : "ViGEm controller routing is installed: " + vigem_version)
        : "ViGEm controller routing was not detected. Install or repair controller support before relying on virtual gamepads.",
      "Open System",
      "/system"
    ));
    checks.push_back(readiness_check(
      "virtualDisplay",
      "Virtual display ready",
      virtual_display_ready ? "ready" : "warning",
      virtual_display_ready
        ? "Virtual display driver is loaded and ready."
        : "Virtual display driver is not ready. Physical display capture can still work, but virtual display streaming needs review.",
      "Open System",
      "/system"
    ));

    platf::autostart::status_t autostart_status;
    std::string autostart_error;
    const bool autostart_ok = platf::autostart::get_status(autostart_status, autostart_error);
    std::string autostart_state = "warning";
    std::string autostart_detail = "Enable AutoLogon and keep Jujo.Server service startup set to Automatic for unattended reboot streaming.";

    if (autostart_ok) {
      if (autostart_status.boot_path_ready) {
        autostart_state = "ready";
        autostart_detail = "AutoLogon is enabled and Jujo.Server service startup is Automatic.";
      } else if (!autostart_status.warning.empty()) {
        autostart_detail = autostart_status.warning;
      }
    } else if (!autostart_error.empty()) {
      autostart_state = "error";
      autostart_detail = autostart_error;
    }

    checks.push_back(readiness_check(
      "unattendedBoot",
      "Unattended boot path",
      autostart_state,
      autostart_detail,
      "Open Settings",
      "/settings"
    ));
#endif
    return checks;
  }

  static nlohmann::json disk_space_json(const fs::path &path, const std::string &label) {
    nlohmann::json out;
    out["label"] = label;
    out["path"] = path.string();
    try {
      const auto info = fs::space(path);
      out["capacityBytes"] = info.capacity;
      out["freeBytes"] = info.free;
      out["availableBytes"] = info.available;
      out["status"] = info.available > (1024ull * 1024ull * 1024ull) ? "ready" : "warning";
    } catch (const std::exception &e) {
      out["status"] = "error";
      out["error"] = e.what();
    }
    return out;
  }

  static nlohmann::json build_host_diagnostics() {
    nlohmann::json host;
    host["name"] = PROJECT_NAME;
    host["version"] = PROJECT_VERSION;
    host["commit"] = PROJECT_VERSION_COMMIT;
    host["platform"] = SUNSHINE_PLATFORM;
    host["serviceName"] = "Jujo.Server";
    host["serviceDisplayName"] = "Jujo.Server";
    host["startedAt"] = now_iso8601_utc_string();
    host["hardwareConcurrency"] = std::thread::hardware_concurrency();

#ifdef _WIN32
    char computer_name[MAX_COMPUTERNAME_LENGTH + 1] {};
    DWORD computer_name_size = static_cast<DWORD>(std::size(computer_name));
    if (GetComputerNameA(computer_name, &computer_name_size)) {
      host["computerName"] = computer_name;
    }

    MEMORYSTATUSEX mem {};
    mem.dwLength = sizeof(mem);
    if (GlobalMemoryStatusEx(&mem)) {
      host["memory"]["loadPercent"] = mem.dwMemoryLoad;
      host["memory"]["totalPhysBytes"] = mem.ullTotalPhys;
      host["memory"]["availPhysBytes"] = mem.ullAvailPhys;
      host["memory"]["totalPageFileBytes"] = mem.ullTotalPageFile;
      host["memory"]["availPageFileBytes"] = mem.ullAvailPageFile;
    }

    SYSTEM_INFO sys {};
    GetNativeSystemInfo(&sys);
    host["processorCount"] = sys.dwNumberOfProcessors;
    host["uptimeMs"] = static_cast<std::uint64_t>(GetTickCount64());
#else
    host["uptimeMs"] = nullptr;
#endif
    return host;
  }

  static nlohmann::json build_encoder_diagnostics() {
    nlohmann::json enc;
    enc["status"] = video::has_attempted_encoder_probe() ? "ready" : "warning";
    enc["probeAttempted"] = video::has_attempted_encoder_probe();
    enc["activeHevcMode"] = video::active_hevc_mode;
    enc["activeAv1Mode"] = video::active_av1_mode;
    enc["refFrameInvalidation"] = video::last_encoder_probe_supported_ref_frames_invalidation;
    enc["yuv444"]["h264"] = video::last_encoder_probe_supported_yuv444_for_codec[0];
    enc["yuv444"]["hevc"] = video::last_encoder_probe_supported_yuv444_for_codec[1];
    enc["yuv444"]["av1"] = video::last_encoder_probe_supported_yuv444_for_codec[2];
    enc["configuredEncoder"] = config::video.encoder;
    enc["configuredAdapter"] = config::video.adapter_name;
    enc["configuredOutput"] = config::video.output_name;
    return enc;
  }

  static nlohmann::json build_streaming_diagnostics() {
    nlohmann::json streaming;
    const auto webrtc_sessions = webrtc_stream::list_sessions();
    streaming["status"] = "ready";
    streaming["rtspSessions"] = rtsp_stream::session_count();
    streaming["webrtcSessions"] = webrtc_sessions.size();
    streaming["activeSessions"] = rtsp_stream::session_count() + static_cast<int>(webrtc_sessions.size());
    streaming["webrtcActive"] = webrtc_stream::has_active_sessions();
    streaming["pairedClients"] = paired_client_count();
    streaming["ports"]["http"] = net::map_port(nvhttp::PORT_HTTP);
    streaming["ports"]["https"] = net::map_port(confighttp::PORT_HTTPS);
    streaming["ports"]["rtsp"] = net::map_port(rtsp_stream::RTSP_SETUP_PORT);
    streaming["ports"]["control"] = net::map_port(stream::CONTROL_PORT);
    streaming["ports"]["video"] = net::map_port(stream::VIDEO_STREAM_PORT);
    streaming["ports"]["audio"] = net::map_port(stream::AUDIO_STREAM_PORT);
    streaming["config"]["minLogLevel"] = config::sunshine.min_log_level;
    streaming["config"]["addressFamily"] = config::sunshine.address_family;
    streaming["config"]["discoveryEnabled"] = config::sunshine.enable_discovery;
    streaming["config"]["sunshineName"] = config::nvhttp.sunshine_name;
    return streaming;
  }

  static nlohmann::json build_network_diagnostics() {
    nlohmann::json network;
    network["status"] = "ready";
    network["bindAddress"] = net::get_bind_address(net::af_from_enum_string(config::sunshine.address_family));
    network["addressFamily"] = config::sunshine.address_family;
    network["originPolicy"] = config::nvhttp.origin_web_ui_allowed;
    network["externalIp"] = config::nvhttp.external_ip;
    network["lanEncryptionMode"] = config::stream.lan_encryption_mode;
    network["wanEncryptionMode"] = config::stream.wan_encryption_mode;
    network["ports"]["http"] = net::map_port(nvhttp::PORT_HTTP);
    network["ports"]["https"] = net::map_port(confighttp::PORT_HTTPS);
    network["ports"]["rtsp"] = net::map_port(rtsp_stream::RTSP_SETUP_PORT);
    network["ports"]["control"] = net::map_port(stream::CONTROL_PORT);
    network["ports"]["video"] = net::map_port(stream::VIDEO_STREAM_PORT);
    network["ports"]["audio"] = net::map_port(stream::AUDIO_STREAM_PORT);
    return network;
  }

  static nlohmann::json build_storage_diagnostics() {
    nlohmann::json storage;
    storage["status"] = "ready";
    storage["paths"]["configFile"] = config::sunshine.config_file;
    storage["paths"]["appsFile"] = config::stream.file_apps;
    storage["paths"]["credentialsFile"] = config::sunshine.credentials_file;
    storage["paths"]["logFile"] = logging::current_log_file().string();
    storage["volumes"] = nlohmann::json::array();
    storage["volumes"].push_back(disk_space_json(fs::current_path(), "workingDirectory"));
    if (!config::sunshine.config_file.empty()) {
      storage["volumes"].push_back(disk_space_json(fs::path(config::sunshine.config_file).parent_path(), "configDirectory"));
    }
    return storage;
  }

  static nlohmann::json build_logs_diagnostics() {
    nlohmann::json logs;
    logs["status"] = "ready";
    logs["current"] = logging::current_log_file().string();
    logs["sources"] = nlohmann::json::array({"sunshine"});
#ifdef _WIN32
    logs["sources"].push_back("display_helper");
    logs["sources"].push_back("playnite");
#endif
    return logs;
  }

  nlohmann::json build_diagnostics_payload(std::string section) {
    nlohmann::json out;
    out["status"] = true;
    out["schemaVersion"] = 1;
    out["generatedAt"] = now_iso8601_utc_string();

    auto put_section = [&](const std::string &name) {
      if (name == "host") {
        out["host"] = build_host_diagnostics();
      } else if (name == "streaming") {
        out["streaming"] = build_streaming_diagnostics();
      } else if (name == "encoder" || name == "gpu") {
        out["encoder"] = build_encoder_diagnostics();
      } else if (name == "network") {
        out["network"] = build_network_diagnostics();
      } else if (name == "storage") {
        out["storage"] = build_storage_diagnostics();
      } else if (name == "logs") {
        out["logs"] = build_logs_diagnostics();
      }
    };

    boost::algorithm::to_lower(section);
    if (!section.empty() && section != "all") {
      put_section(section);
      if (out.size() == 3) {
        out["status"] = false;
        out["error"] = "Unknown diagnostics section.";
      }
      return out;
    }

    put_section("host");
    put_section("streaming");
    put_section("encoder");
    put_section("network");
    put_section("storage");
    put_section("logs");
    return out;
  }

  static nlohmann::json update_asset_to_json(const update::asset_info_t &asset) {
    return {
      {"name", asset.name},
      {"downloadUrl", asset.download_url},
      {"sha256", asset.sha256},
      {"sizeBytes", asset.size},
      {"contentType", asset.content_type}
    };
  }

  static nlohmann::json update_release_to_json(const update::release_info_t &release) {
    if (release.version.empty()) {
      return nlohmann::json(nullptr);
    }

    nlohmann::json assets = nlohmann::json::array();
    for (const auto &asset : release.assets) {
      assets.push_back(update_asset_to_json(asset));
    }

    return {
      {"version", release.version},
      {"url", release.url},
      {"name", release.name},
      {"body", release.body},
      {"publishedAt", release.published_at},
      {"prerelease", release.is_prerelease},
      {"assets", assets}
    };
  }

  static update::release_info_t choose_update_candidate(const update::status_t &status) {
    const auto &stable = status.latest_release;
    const auto &pre = status.latest_prerelease;
    if (stable.version.empty()) {
      return pre;
    }
    if (pre.version.empty()) {
      return stable;
    }
    return version_compare::compare_semver(stable.version, pre.version) < 0 ? pre : stable;
  }

  nlohmann::json build_update_status_payload() {
    const auto status = update::snapshot_status();
    const auto candidate = choose_update_candidate(status);
    const bool available = !candidate.version.empty() &&
                           version_compare::compare_semver(PROJECT_VERSION, candidate.version) < 0;

    nlohmann::json out;
    out["status"] = true;
    out["schemaVersion"] = 1;
    out["serviceName"] = "Jujo.Server";
    out["repository"]["owner"] = SUNSHINE_REPO_OWNER;
    out["repository"]["name"] = SUNSHINE_REPO_NAME;
    out["installed"]["version"] = PROJECT_VERSION;
    out["installed"]["commit"] = PROJECT_VERSION_COMMIT;
    out["checkInProgress"] = status.check_in_progress;
    out["updateAvailable"] = available;
    out["latestStable"] = update_release_to_json(status.latest_release);
    out["latestPrerelease"] = update_release_to_json(status.latest_prerelease);
    out["candidate"] = update_release_to_json(candidate);
    out["lastNotification"]["version"] = status.last_notified_version;
    out["lastNotification"]["url"] = status.last_notified_url;
    out["lastNotification"]["prerelease"] = status.last_notified_is_prerelease;
    out["policy"]["executor"] = "flutter";
    out["policy"]["silentInstallSupported"] = true;
    return out;
  }

  nlohmann::json build_setup_steps(int paired_clients, int connected_sources, int playable_games) {
    return nlohmann::json::array({
      {
        {"id", "pair"},
        {"title", "Pair a device (optional)"},
        {"description", "Connect a Jujo or Moonlight-compatible client now, or do it later from Pairing."},
        {"action", "Open Pairing"},
        {"path", "/pairing"},
        {"icon", "fa-link"},
        {"status", paired_clients > 0 ? "ready" : "warning"}
      },
      {
        {"id", "sources"},
        {"title", "Connect a library"},
        {"description", "Sign in to Steam, Epic Games, GOG, or Xbox, or add games manually."},
        {"action", "Open Game Sources"},
        {"path", "/game-sources"},
        {"icon", "fa-plug"},
        {"status", connected_sources > 0 ? "ready" : "pending"}
      },
      {
        {"id", "readiness"},
        {"title", "Verify readiness"},
        {"description", "Review encoder, display capture, network, and Windows-specific checks."},
        {"action", "Open System"},
        {"path", "/system"},
        {"icon", "fa-stethoscope"},
        {"status", "ready"}
      },
      {
        {"id", "play"},
        {"title", "Start streaming"},
        {"description", "Open the library when at least one game is playable."},
        {"action", "Open Library"},
        {"path", "/library"},
        {"icon", "fa-play"},
        {"status", playable_games > 0 ? "ready" : "pending"}
      }
    });
  }

  /**
   * @brief Get first-run setup progress and onboarding checklist state.
   * @api_examples{/api/setup/status| GET| null}
   */
  void getSetupStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto apps = visible_apps_for_current_sources(read_apps_array_or_empty());
    const auto sources = build_game_sources_summary(apps);
    const int paired_clients = paired_client_count();
    const int connected_sources = connected_source_count(sources);
    const int playable_games = playable_game_count(apps);
    const bool setup_complete = playable_games > 0;

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["setupComplete"] = setup_complete;
    output_tree["pairedClientCount"] = paired_clients;
    output_tree["connectedSourceCount"] = connected_sources;
    output_tree["playableGameCount"] = playable_games;
    output_tree["steps"] = build_setup_steps(paired_clients, connected_sources, playable_games);
    output_tree["readiness"] = {
      {"overall", setup_complete ? "ready" : "needs_setup"},
      {"checks", build_system_readiness(paired_clients, playable_games)}
    };
    send_response(response, output_tree);
  }












#ifdef _WIN32


#endif












  /**
   * @brief Serve a specific application's cover image by UUID.
   *        Looks for files named @c uuid with a supported image extension in the covers directory.
   * @api_examples{/api/apps/@c uuid/cover| GET| null}
   */
  void getAppCover(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    if (request->path_match.size() < 2) {
      bad_request(response, request, "Application uuid required");
      return;
    }

    std::string uuid = request->path_match[1];
    if (uuid.empty()) {
      bad_request(response, request, "Application uuid required");
      return;
    }

    fs::path cover_path;
    if (!resolve_cover_path_for_uuid(uuid, cover_path)) {
      not_found(response, request);
      return;
    }

    std::ifstream in(cover_path, std::ios::binary);
    if (!in) {
      not_found(response, request);
      return;
    }

    std::string ext = cover_path.extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), [](unsigned char c) {
      return static_cast<char>(std::tolower(c));
    });
    if (!ext.empty() && ext.front() == '.') {
      ext.erase(ext.begin());
    }

    std::string mime = "image/png";
    if (!ext.empty()) {
      auto it = mime_types.find(ext);
      if (it != mime_types.end()) {
        mime = it->second;
      }
    }

    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", mime);
    headers.emplace("Cache-Control", "private, max-age=300");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(success_ok, in, headers);
  }






  /**
   * @brief Upload or set a specific application's cover image by UUID.
   *        Accepts either a JSON body with {"url": "..."} (restricted to images.igdb.com) or {"data": base64}.
   *        Saves to appdata/covers/@c uuid.@c ext where ext is derived from URL or defaults to .png for data.
   * @api_examples{/api/apps/@c uuid/cover| POST| {"url":"https://images.igdb.com/.../abc.png"}}
   */





#ifdef _WIN32
  std::optional<uint64_t> file_creation_time_ms(const std::filesystem::path &path) {
    WIN32_FILE_ATTRIBUTE_DATA data {};
    if (!GetFileAttributesExW(path.c_str(), GetFileExInfoStandard, &data)) {
      return std::nullopt;
    }
    ULARGE_INTEGER t {};
    t.LowPart = data.ftCreationTime.dwLowDateTime;
    t.HighPart = data.ftCreationTime.dwHighDateTime;

    // FILETIME is in 100ns units since 1601-01-01.
    constexpr uint64_t kEpochDiff100ns = 116444736000000000ULL;  // 1970-01-01 - 1601-01-01
    if (t.QuadPart < kEpochDiff100ns) {
      return std::nullopt;
    }
    return (t.QuadPart - kEpochDiff100ns) / 10000ULL;
  }

  std::filesystem::path windows_color_profile_dir() {
    wchar_t system_root[MAX_PATH] = {};
    if (GetSystemWindowsDirectoryW(system_root, _countof(system_root)) == 0) {
      return std::filesystem::path(L"C:\\Windows\\System32\\spool\\drivers\\color");
    }
    std::filesystem::path root(system_root);
    return root / L"System32" / L"spool" / L"drivers" / L"color";
  }
#endif


#ifdef _WIN32
  // removed unused forward declaration for default_playnite_ext_dir()
#endif

  /**
   * @brief Update stored settings for a paired client.
   */









  // Lightweight session status for UI messaging

















#ifdef _WIN32
#endif





#ifdef _WIN32
#endif

#ifdef _WIN32
  // --- Golden snapshot helpers (Windows-only) ---
  bool file_exists_nofail(const std::filesystem::path &p) {
    try {
      std::error_code ec;
      return std::filesystem::exists(p, ec);
    } catch (...) {
      return false;
    }
  }

  // Return candidate paths where the helper writes the golden snapshot.
  // We probe both the active user's Roaming/Local AppData and the current
  // process's CSIDL paths, mirroring the log bundle collection logic.
  std::vector<std::filesystem::path> golden_snapshot_candidates() {
    std::vector<std::filesystem::path> out;
    auto add_if = [&](const std::filesystem::path &base) {
      if (!base.empty()) {
        out.emplace_back(base / L"Sunshine" / L"display_golden_restore.json");
      }
    };

    try {
      // Prefer the active user's known folders (impersonated) when available
      try {
        platf::dxgi::safe_token user_token;
        user_token.reset(platf::dxgi::retrieve_users_token(false));
        auto add_known = [&](REFKNOWNFOLDERID id) {
          PWSTR baseW = nullptr;
          if (SUCCEEDED(SHGetKnownFolderPath(id, 0, user_token.get(), &baseW)) && baseW) {
            add_if(std::filesystem::path(baseW));
            CoTaskMemFree(baseW);
          }
        };
        add_known(FOLDERID_RoamingAppData);
        add_known(FOLDERID_LocalAppData);
      } catch (...) {
        // ignore
      }

      // Also probe the current process's CSIDL APPDATA and LOCAL_APPDATA
      auto add_csidl = [&](int csidl) {
        wchar_t baseW[MAX_PATH] = {};
        if (SUCCEEDED(SHGetFolderPathW(nullptr, csidl, nullptr, SHGFP_TYPE_CURRENT, baseW))) {
          add_if(std::filesystem::path(baseW));
        }
      };
      add_csidl(CSIDL_APPDATA);
      add_csidl(CSIDL_LOCAL_APPDATA);
      add_csidl(CSIDL_COMMON_APPDATA);
    } catch (...) {
      // best-effort
    }
    return out;
  }
std::optional<nlohmann::json> read_json_file_nofail(const std::filesystem::path &path) {
    try {
      std::ifstream file(path, std::ios::binary);
      if (!file.is_open()) {
        return std::nullopt;
      }
      auto parsed = nlohmann::json::parse(file, nullptr, false);
      if (parsed.is_discarded() || !parsed.is_object()) {
        return std::nullopt;
      }
      return parsed;
    } catch (...) {
      return std::nullopt;
    }
  }

  std::optional<int> parse_snapshot_version(const nlohmann::json &root) {
    auto it = root.find("snapshot_version");
    if (it == root.end() || !it->is_number_integer()) {
      return std::nullopt;
    }
    int version = it->get<int>();
    if (version < 1) {
      return std::nullopt;
    }
    return version;
  }

  bool snapshot_has_layout_data(const nlohmann::json &root) {
    auto it = root.find("layouts");
    if (it == root.end() || !it->is_object()) {
      return false;
    }
    for (auto entry = it->begin(); entry != it->end(); ++entry) {
      if (!entry.key().empty()) {
        if (entry->is_number_integer()) {
          return true;
        }
        if (entry->is_object()) {
          auto rotation = entry->find("rotation");
          if (rotation != entry->end() && (rotation->is_number_integer() || rotation->is_string())) {
            return true;
          }
        }
      }
    }
    return false;
  }



#endif











  void start() {
    auto shutdown_event = mail::man->event<bool>(mail::shutdown);
    auto port_https = net::map_port(PORT_HTTPS);
    auto address_family = net::af_from_enum_string(config::sunshine.address_family);

    https_server_t server(config::nvhttp.cert, config::nvhttp.pkey);
    server.default_resource["DELETE"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request, "Bad Request");
    };
    server.default_resource["PATCH"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request, "Bad Request");
    };
    server.default_resource["POST"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request, "Bad Request");
    };
    server.default_resource["PUT"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request, "Bad Request");
    };

    server.default_resource["GET"] = not_found;
    server.resource["^/$"]["GET"] = not_found;
    clear_token_route_catalog();
    auto register_api_route = [&](const char *pattern, const char *method, const auto &handler) {
      server.resource[pattern][method] = handler;
      record_token_route(normalize_route_pattern(pattern), method);

      std::string pat(pattern);
      if (pat.find("^/api/") == 0) {
        std::string v1_pattern = "^/api/v1/" + pat.substr(6);
        server.resource[v1_pattern][method] = handler;
        record_token_route(normalize_route_pattern(v1_pattern), method);
      }
    };
    register_api_route("^/api/pin$", "POST", savePin);
    register_api_route("^/api/otp$", "POST", getOTP);
    register_api_route("^/api/apps$", "GET", getApps);

    auto rbac_clients_auth = [](resp_https_t response, req_https_t request) {
      if (request->method == "GET") {
        getRbacClients(response, request);
      } else if (request->method == "PATCH") {
        patchRbacClient(response, request);
      } else if (request->method == "DELETE") {
        deleteRbacClient(response, request);
      } else {
        bad_request(response, request, "Method Not Allowed");
      }
    };
    register_api_route("^/api/rbac/clients/?$", "GET", rbac_clients_auth);
    register_api_route("^/api/rbac/clients/([^/]+)/?$", "PATCH", rbac_clients_auth);
    register_api_route("^/api/rbac/clients/([^/]+)/?$", "DELETE", rbac_clients_auth);
    register_api_route("^/api/setup/status$", "GET", getSetupStatus);
    register_api_route("^/api/game-sources$", "GET", getGameSources);
    register_api_route("^/api/game-sources/([^/]+)/connect$", "POST", postGameSourceConnect);
    register_api_route("^/api/game-sources/steam/auth/start$", "POST", postSteamAuthStart);
    register_api_route("^/api/game-sources/epic/auth/start$", "POST", postEpicAuthStart);
    register_api_route("^/api/game-sources/steam/auth/callback$", "GET", getSteamAuthCallback);
    register_api_route("^/api/game-sources/gog/auth/callback$", "GET", getGogAuthCallback);
    register_api_route("^/api/game-sources/steam/web-library$", "POST", postSteamWebLibrary);
    register_api_route("^/api/game-sources/([^/]+)/sync$", "POST", postGameSourceSync);
    register_api_route("^/api/game-sources/([^/]+)/disconnect$", "POST", postGameSourceDisconnect);
    register_api_route("^/api/library/games$", "GET", getLibraryGames);
    register_api_route("^/api/library/steam/prefetch-progress$", "GET", getSteamPrefetchProgress);
    register_api_route("^/api/library/steam/([0-9]+)/poster$", "GET", getSteamPoster);
    register_api_route("^/api/library/local-art/steam/([0-9]+)$", "GET", getSteamLocalArtManifest);
    register_api_route("^/api/library/local-art/steam/([0-9]+)/([a-z_]+)$", "GET", getSteamLocalArtFile);
    register_api_route("^/api/library/metadata/status$", "GET", getLibraryMetadataStatus);
    register_api_route("^/api/library/metadata/providers/([^/]+)/connect$", "POST", postLibraryMetadataProviderConnect);
    register_api_route("^/api/library/art/autoscan$", "POST", postLibraryArtAutoscan);
    register_api_route("^/api/library/art/autoscan/status$", "GET", getLibraryArtAutoscanStatus);
    register_api_route("^/api/library/art/scan-one$", "POST", postLibraryArtScanOne);
    register_api_route("^/api/library/art/apply$", "POST", postLibraryArtApply);
    register_api_route("^/api/game-sources/playniteLegacy/purge-apps$", "POST", postPlaynitePurgeApps);
    register_api_route("^/api/system/readiness$", "GET", getSystemReadiness);
    register_api_route("^/api/system/status$", "GET", getSystemStatus);
    register_api_route("^/api/serverinfo$", "GET", getServerInfo);
    register_api_route("^/api/system/diagnostics$", "GET", getSystemDiagnostics);
    register_api_route("^/api/system/diagnostics/([A-Za-z0-9_-]+)$", "GET", getSystemDiagnostics);
    register_api_route("^/api/system/metrics$", "GET", getSystemMetrics);
  #ifdef _WIN32
    register_api_route("^/api/system/autostart/status$", "GET", getAutoStartStatus);
    register_api_route("^/api/system/autostart/enable$", "POST", postEnableAutoStart);
    register_api_route("^/api/system/autostart/disable$", "POST", postDisableAutoStart);
  #endif
    register_api_route("^/api/updates/status$", "GET", getUpdateStatus);
    register_api_route("^/api/updates/check$", "POST", postUpdateCheck);
    register_api_route("^/api/apps$", "POST", saveApp);
    register_api_route("^/api/apps/([^/]+)/cover$", "GET", getAppCover);
    register_api_route("^/api/apps/reorder$", "POST", reorderApps);
    register_api_route("^/api/apps/delete$", "POST", deleteApp);
    register_api_route("^/api/apps/launch-local$", "POST", launchLocalApp);
    register_api_route("^/api/apps/launch$", "POST", launchApp);
    register_api_route("^/api/apps/close$", "POST", closeApp);
    register_api_route("^/api/logs$", "GET", getLogs);
    register_api_route("^/api/config$", "GET", getConfig);
    register_api_route("^/api/config$", "POST", saveConfig);
    // Partial updates for config settings; merges with existing file and
    // removes keys when value is null or empty string.
    register_api_route("^/api/config$", "PATCH", patchConfig);
    register_api_route("^/api/metadata$", "GET", getMetadata);
    register_api_route("^/api/configLocale$", "GET", getLocale);
    register_api_route("^/api/restart$", "POST", restart);
    register_api_route("^/api/quit$", "POST", quit);
#if defined(_WIN32)
    register_api_route("^/api/display/export_golden$", "POST", postExportGoldenDisplay);
    register_api_route("^/api/display/restore$", "POST", postRestoreDisplay);
    register_api_route("^/api/display/golden_status$", "GET", getGoldenStatus);
    register_api_route("^/api/display/golden$", "DELETE", deleteGolden);
#endif
    register_api_route("^/api/password$", "POST", savePassword);
    register_api_route("^/api/display-devices$", "GET", getDisplayDevices);
#ifdef _WIN32
    register_api_route("^/api/framegen/edid-refresh$", "GET", getFramegenEdidRefresh);
    register_api_route("^/api/health/vigem$", "GET", getVigemHealth);
    register_api_route("^/api/health/crashdump$", "GET", getCrashDumpStatus);
    register_api_route("^/api/health/crashdump/dismiss$", "POST", postCrashDumpDismiss);
#endif
    register_api_route("^/api/apps/([A-Fa-f0-9-]+)/cover$", "GET", getAppCover);
    register_api_route("^/api/apps/([0-9]+)$", "DELETE", deleteApp);
    register_api_route("^/api/clients/unpair-all$", "POST", unpairAll);
    register_api_route("^/api/clients/list$", "GET", getClients);
    register_api_route("^/api/clients/hdr-profiles$", "GET", getHdrProfiles);
    register_api_route("^/api/clients/update$", "POST", updateClient);
    register_api_route("^/api/clients/unpair$", "POST", unpair);
    register_api_route("^/api/clients/disconnect$", "POST", disconnectClient);
    register_api_route("^/api/apps/close$", "POST", closeApp);
    register_api_route("^/api/session/status$", "GET", getSessionStatus);
    register_api_route("^/api/stream/health$", "GET", getStreamHealth);
        register_api_route("^/api/wol$", "POST", postWakeOnLan);
    register_api_route("^/api/server/status$", "GET", getServerStatus);
    register_api_route("^/api/pair/cloud$", "POST", postCloudPair);
    register_api_route("^/api/webrtc/sessions$", "GET", listWebRTCSessions);
    register_api_route("^/api/webrtc/sessions$", "POST", createWebRTCSession);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)$", "GET", getWebRTCSession);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)$", "DELETE", deleteWebRTCSession);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)/offer$", "POST", postWebRTCOffer);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)/answer$", "GET", getWebRTCAnswer);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)/ice$", "GET", getWebRTCIce);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)/ice$", "POST", postWebRTCIce);
    register_api_route("^/api/webrtc/sessions/([A-Fa-f0-9-]+)/ice/stream$", "GET", getWebRTCIceStream);
    register_api_route("^/api/webrtc/cert$", "GET", getWebRTCCert);
    // Keep legacy cover upload endpoint present in upstream master
    register_api_route("^/api/covers/upload$", "POST", uploadCover);
    register_api_route("^/api/apps/purge_autosync$", "POST", purgeAutoSyncedApps);
#ifdef _WIN32
    register_api_route("^/api/playnite/status$", "GET", getPlayniteStatus);
    register_api_route("^/api/rtss/status$", "GET", getRtssStatus);
    register_api_route("^/api/lossless_scaling/status$", "GET", getLosslessScalingStatus);
    register_api_route("^/api/playnite/install$", "POST", installPlaynite);
    register_api_route("^/api/playnite/uninstall$", "POST", uninstallPlaynite);
    register_api_route("^/api/playnite/games$", "GET", getPlayniteGames);
    register_api_route("^/api/playnite/categories$", "GET", getPlayniteCategories);
    register_api_route("^/api/playnite/force_sync$", "POST", postPlayniteForceSync);
    register_api_route("^/api/playnite/launch$", "POST", postPlayniteLaunch);
    // Export logs bundle (Windows only)
    register_api_route("^/api/logs/export$", "GET", downloadPlayniteLogs);
    register_api_route("^/api/logs/export_crash/manifest$", "GET", getCrashBundleManifest);
    register_api_route("^/api/logs/export_crash$", "GET", downloadCrashBundle);
#endif
    register_api_route("^/api/token$", "POST", generateApiToken);
    register_api_route("^/api/tokens$", "GET", listApiTokens);
    register_api_route("^/api/token/routes$", "GET", listApiTokenRoutes);

    register_api_route("^/api/rbac/clients$", "GET", getRbacClients);
    register_api_route("^/api/rbac/clients/([^/]+)$", "PATCH", patchRbacClient);
    register_api_route("^/api/rbac/clients/([^/]+)$", "DELETE", deleteRbacClient);
    register_api_route("^/api/config/cloud$", "GET", getCloudConfig);
    register_api_route("^/api/config/cloud$", "PATCH", patchCloudConfig);
    register_api_route("^/api/token/([a-fA-F0-9]+)$", "DELETE", revokeApiToken);
    // Session validation endpoint used by the web UI to detect HttpOnly session cookies
    server.resource["^/api-tokens/?$"]["GET"] = getTokenPage;
    register_api_route("^/api/auth/login$", "POST", loginUser);
    register_api_route("^/api/auth/refresh$", "POST", refreshSession);
    register_api_route("^/api/auth/logout$", "POST", logoutUser);
    register_api_route("^/api/auth/status$", "GET", authStatus);
    register_api_route("^/api/auth/sessions$", "GET", listSessions);
    register_api_route("^/api/auth/sessions/([A-Fa-f0-9]+)$", "DELETE", revokeSession);
    server.resource["^/serverinfo$"]["GET"] = getServerInfo;
    server.config.reuse_address = true;
    server.config.address = net::get_bind_address(address_family);
    server.config.port = port_https;
    server.config.thread_pool_size = 4;
    server.config.timeout_request = 30;
    server.config.timeout_content = 600;

    auto accept_and_run = [&](auto *server) {
      try {
        server->start([port_https](unsigned short port) {
          BOOST_LOG(info) << "Configuration UI available at [https://localhost:"sv << port << "]";
        });
      } catch (boost::system::system_error &err) {
        // It's possible the exception gets thrown after calling server->stop() from a different thread
        if (shutdown_event->peek()) {
          return;
        }
        BOOST_LOG(fatal) << "Couldn't start Configuration HTTPS server on port ["sv << port_https << "]: "sv << err.what();
        shutdown_event->raise(true);
        return;
      }
    };
    api_token_manager.load_api_tokens();
    session_token_manager.load_session_tokens();
    rbac::registry.init(platf::appdata().string().empty() ? "." : platf::appdata().string());
    std::thread tcp {accept_and_run, &server};

    // Start a background task to clean up expired session tokens every hour
    std::jthread cleanup_thread([shutdown_event]() {
      while (!shutdown_event->view(std::chrono::hours(1))) {
        if (session_token_manager.cleanup_expired_session_tokens()) {
          session_token_manager.save_session_tokens();
        }
      }
    });

    // Wait for any event
    shutdown_event->view();

    server.stop();

    tcp.join();
    // std::jthread (cleanup_thread) auto-joins on destruction, no need for joinable/join
  }

  /**
   * @brief Handles the HTTP request to serve the API token management page.
   *
   * This function authenticates the incoming request and, if successful,
   * reads the "api-tokens.html" file from the web directory and sends its
   * contents as an HTTP response with the appropriate content type.
   *
   * @param response The HTTP response object used to send data back to the client.
   * @param request The HTTP request object containing client request data.
   */
  void getTokenPage(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    print_req(request);
    std::string content = file_handler::read_file(WEB_DIR "api-tokens.html");
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "text/html; charset=utf-8");
    response->write(content, headers);
  }

  /**
   * @brief Converts a string representation of a token scope to its corresponding TokenScope enum value.
   *
   * This function takes a string view and returns the matching TokenScope enum value.
   * Supported string values are "Read", "read", "Write", and "write".
   * If the input string does not match any known scope, an std::invalid_argument exception is thrown.
   *
   * @param s The string view representing the token scope.
   * @return TokenScope The corresponding TokenScope enum value.
   * @throws std::invalid_argument If the input string does not match any known scope.
   */
  TokenScope scope_from_string(std::string_view s) {
    if (s == "Read" || s == "read") {
      return TokenScope::Read;
    }
    if (s == "Write" || s == "write") {
      return TokenScope::Write;
    }
    throw std::invalid_argument("Unknown TokenScope: " + std::string(s));
  }

  /**
   * @brief Converts a TokenScope enum value to its string representation.
   * @param scope The TokenScope enum value to convert.
   * @return The string representation of the scope.
   */
  std::string scope_to_string(TokenScope scope) {
    switch (scope) {
      case TokenScope::Read:
        return "Read";
      case TokenScope::Write:
        return "Write";
      default:
        throw std::invalid_argument("Unknown TokenScope enum value");
    }
  }




  void listSessions(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    print_req(request);

    std::string raw_token;
    if (auto auth = request->header.find("authorization");
        auth != request->header.end() && auth->second.rfind("Session ", 0) == 0) {
      raw_token = auth->second.substr(8);
    }
    if (raw_token.empty()) {
      raw_token = extract_session_token_from_cookie(request->header);
    }
    std::string active_hash;
    if (!raw_token.empty()) {
      if (auto hash = session_token_manager.get_hash_for_token(raw_token)) {
        active_hash = *hash;
      }
    }

    APIResponse api_response = session_token_api.list_sessions(config::sunshine.username, active_hash);
    write_api_response(response, api_response);
  }


}  // namespace confighttp
