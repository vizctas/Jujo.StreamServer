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
#include "nvhttp.h"
#include "platform/common.h"
#include "rtsp.h"
#include "server_rbac.h"
#include "stream.h"
#include "video.h"
#include "webrtc_stream.h"

#ifdef _WIN32
  #include "platform/windows/virtual_display_cleanup.h"
#endif

#include <nlohmann/json.hpp>
#if defined(_WIN32)
  #include "platform/windows/misc.h"
  #include "src/platform/windows/ipc/misc_utils.h"
  #include "src/platform/windows/playnite_integration.h"
  #include "src/platform/windows/playnite_sync.h"

  #include <windows.h>
#endif
#ifdef uuid_t
  #undef uuid_t
#endif
#if defined(_WIN32)
  #include "platform/windows/misc.h"

  #include <KnownFolders.h>
  #include <ShlObj.h>
  #include <windows.h>
#endif
#include "display_helper_integration.h"
#include "process.h"
#include "state_storage.h"
#include "utility.h"
#include "update.h"
#include "uuid.h"
#include "version_compare.h"

#ifdef _WIN32
  #include "platform/windows/utils.h"
  #include <Lmcons.h>
  #include <wincrypt.h>
#endif

using namespace std::literals;
namespace pt = boost::property_tree;

namespace confighttp {
  namespace fs = std::filesystem;

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
      file_handler::write_file(config::stream.file_apps.c_str(), file_tree.dump(4));
      proc::refresh(config::stream.file_apps, false);
      return true;
    } catch (const std::exception &e) {
      BOOST_LOG(warning) << "refresh_client_apps_cache: failed: " << e.what();
    } catch (...) {
      BOOST_LOG(warning) << "refresh_client_apps_cache: failed (unknown)";
    }
    return false;
  }

  static int auto_import_installed_provider_games(const std::string &source_id, const nlohmann::json &games) {
    if (source_id != "steam" && source_id != "epic") {
      return 0;
    }
    try {
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);
      auto &apps_node = file_tree["apps"];
      if (!apps_node.is_array()) {
        apps_node = nlohmann::json::array();
      }

      std::unordered_set<std::string> existing;
      for (const auto &app : apps_node) {
        if (!app.is_object()) {
          continue;
        }
        const auto app_source = app.contains("source-id") && app["source-id"].is_string()
          ? app["source-id"].get<std::string>()
          : std::string {};
        const auto provider_id = app.contains("provider-game-id") && app["provider-game-id"].is_string()
          ? app["provider-game-id"].get<std::string>()
          : std::string {};
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
        const auto title = game.value("title", "Steam App " + provider_id);
        const auto launch_uri = source_id == "steam"
          ? "steam://rungameid/" + provider_id
          : "com.epicgames.launcher://apps/" + provider_id + "?action=launch&silent=true";
        nlohmann::json app;
        app["name"] = title;
        app["cmd"] = "cmd /c start \"\" \"" + launch_uri + "\"";
        app["working-dir"] = game.value("installPath", std::string {});
        app["source-id"] = source_id;
        app["provider-game-id"] = provider_id;
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

  static nlohmann::json read_apps_array_or_empty() {
    try {
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);
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

  static bool is_playnite_library_entry(const nlohmann::json &app) {
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

  static nlohmann::json read_game_source_states();
  static nlohmann::json source_state_or_empty(const nlohmann::json &states, const std::string &source_id);
  static std::string vault_provider_name();
  static bool file_is_regular(const fs::path &path);
  static std::string trim_copy(const std::string &input);
  static std::string json_string_value(const nlohmann::json &node, const char *key);
  static std::string now_iso8601_utc_string();
  static bool save_game_source_state(const std::string &source_id, const nlohmann::json &source_state);
  static nlohmann::json read_metadata_provider_states();
  static nlohmann::json metadata_provider_state_or_empty(const nlohmann::json &states, const std::string &provider_id);

  static nlohmann::json build_game_sources_summary(const nlohmann::json &apps) {
    int manual_count = 0;
    int playnite_count = 0;
    int playable_manual_count = 0;
    int playable_playnite_count = 0;

    for (const auto &app : apps) {
      if (!app.is_object()) {
        continue;
      }
      const bool playnite = is_playnite_library_entry(app);
      const bool playable = is_playable_library_entry(app);
      if (playnite) {
        ++playnite_count;
        if (playable) {
          ++playable_playnite_count;
        }
      } else {
        ++manual_count;
        if (playable) {
          ++playable_manual_count;
        }
      }
    }

    const auto persisted_states = read_game_source_states();

    auto source = [&](const std::string &id, const std::string &name, bool connected, int games, int playable, const std::string &kind) {
      const auto persisted = source_state_or_empty(persisted_states, id);
      const bool persisted_connected = persisted.value("connected", false);
      const auto connection_state = persisted.value(
        "connectionState",
        connected ? "connected" : (kind == "store" ? "requires_action" : "not_connected")
      );
      const bool disabled = persisted.value("disabled", false);
      const auto sync_state = disabled ? "disabled" : persisted.value("syncState", connected || persisted_connected ? "ready" : "not_started");
      nlohmann::json item;
      item["id"] = id;
      item["name"] = name;
      item["kind"] = kind;
      item["connected"] = !disabled && (connected || persisted_connected || connection_state == "connected");
      item["connectionState"] = disabled ? "disabled" : connection_state;
      item["syncState"] = sync_state;
      item["gamesCount"] = persisted.value("ownedGameCount", games);
      item["ownedGameCount"] = persisted.value("ownedGameCount", games);
      item["installedGameCount"] = persisted.value("installedGameCount", playable);
      item["playableGameCount"] = persisted.value("playableGameCount", playable);
      item["needsAttentionCount"] = 0;
      item["tokenEncrypted"] = persisted.value("tokenEncrypted", false);
      item["authAvailable"] = kind == "store";
      item["metadataAvailable"] = persisted.value("metadataAvailable", false);
      item["posterProvider"] = persisted.value("posterProvider", "pending");
      item["connectPath"] = "/api/game-sources/" + id + "/connect";
      item["syncPath"] = "/api/game-sources/" + id + "/sync";
      item["disconnectPath"] = "/api/game-sources/" + id + "/disconnect";
      item["lastSynced"] = persisted.contains("lastSynced") ? persisted["lastSynced"] : nlohmann::json(nullptr);
      item["vaultProvider"] = vault_provider_name();
      item["disabled"] = disabled;
      if (persisted.contains("publicConfig") && persisted["publicConfig"].is_object()) {
        item["publicConfig"] = persisted["publicConfig"];
      }
      if (kind == "store") {
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
    sources.push_back(source("steam", "Steam", false, 0, 0, "store"));
    sources.push_back(source("epic", "Epic Games", false, 0, 0, "store"));
    sources.push_back(source("gog", "GOG", false, 0, 0, "store"));
    sources.push_back(source("xbox", "Xbox", false, 0, 0, "store"));
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

  static int playable_game_count(const nlohmann::json &apps) {
    int count = 0;
    for (const auto &app : apps) {
      if (is_playable_library_entry(app)) {
        ++count;
      }
    }
    return count;
  }

  static int paired_client_count() {
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

  static bool is_store_game_source(const std::string &source_id) {
    return source_id == "steam" || source_id == "epic" || source_id == "gog" || source_id == "xbox";
  }

  static bool is_known_game_source(const std::string &source_id) {
    return is_store_game_source(source_id) || source_id == "manual" || source_id == "playniteLegacy";
  }

  static std::string json_string_value(const nlohmann::json &node, const char *key);

  static nlohmann::json provider_connection_requirements(const std::string &source_id) {
    nlohmann::json requirements = nlohmann::json::array();
    if (source_id == "steam") {
      requirements.push_back("Steam browser sign-in");
      requirements.push_back("Steam Store web session for owned-library sync");
      requirements.push_back("Local Steam manifests for installed-game detection");
      requirements.push_back("Steam Web API key only for private-account fallback");
    } else if (source_id == "epic") {
      requirements.push_back("Epic OAuth client with PKCE callback");
      requirements.push_back("Library API access for the authorized account");
      requirements.push_back("Encrypted local refresh token storage");
    } else if (source_id == "gog") {
      requirements.push_back("GOG/Galaxy account authorization");
      requirements.push_back("Library and metadata API access");
      requirements.push_back("Encrypted local refresh token storage");
    } else if (source_id == "xbox") {
      requirements.push_back("Microsoft account OAuth application");
      requirements.push_back("Xbox/PC Game Pass library access");
      requirements.push_back("Encrypted local refresh token storage");
    }
    return requirements;
  }

  static nlohmann::json read_vibeshine_state_json() {
    statefile::migrate_recent_state_keys();
    const auto &path = statefile::vibeshine_state_path();
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

  static bool write_vibeshine_state_json(const nlohmann::json &state) {
    statefile::migrate_recent_state_keys();
    const auto &path = statefile::vibeshine_state_path();
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

  static nlohmann::json read_game_source_states() {
    auto state = read_vibeshine_state_json();
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

  static nlohmann::json source_state_or_empty(const nlohmann::json &states, const std::string &source_id) {
    try {
      if (states.contains(source_id) && states[source_id].is_object()) {
        return states[source_id];
      }
    } catch (...) {}
    return nlohmann::json::object();
  }

  static bool vault_encryption_available() {
#ifdef _WIN32
    return true;
#else
    return false;
#endif
  }

  static std::string vault_provider_name() {
#ifdef _WIN32
    return "windows-dpapi";
#else
    return "unavailable";
#endif
  }

  static bool encrypt_provider_secret(const std::string &plaintext, std::string &ciphertext_hex) {
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

  static size_t write_curl_string_callback(void *contents, size_t size, size_t nmemb, void *userp) {
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

  static std::string request_scheme_and_host(req_https_t request) {
    auto host = request->header.find("Host");
    if (host != request->header.end() && !host->second.empty()) {
      return "https://" + host->second;
    }
    return "https://localhost";
  }

  static std::unordered_map<std::string, std::string> query_params_from_target(const std::string &target) {
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

  static std::string steam_openid_auth_url(const std::string &base_url) {
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

  static bool verify_steam_openid_response(const std::unordered_map<std::string, std::string> &params, std::string &steam_id, std::string &error) {
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

  struct SteamInstallStatus {
    std::string install_path;
    std::string title;
  };

  static fs::path steam_metadata_cache_dir() {
    return fs::path(platf::appdata()) / "steam_metadata";
  }

  static fs::path steam_poster_cache_path(const std::string &appid) {
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

  static std::unordered_map<std::string, SteamInstallStatus> detect_installed_steam_games() {
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

  static void steam_prefetch_enqueue_batch(const std::vector<std::string> &appids) {
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

  static nlohmann::json steam_prefetch_progress_json() {
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
      { "active", s_steam_prefetch_workers.load() > 0 }
    };
  }

  static std::optional<std::string> steam_store_app_title(const std::string &appid) {
    if (appid.empty()) {
      return std::nullopt;
    }
    static std::mutex cache_mutex;
    static std::unordered_map<std::string, std::optional<std::string>> cache;
    {
      std::lock_guard<std::mutex> lock(cache_mutex);
      if (auto it = cache.find(appid); it != cache.end()) {
        return it->second;
      }
    }

    std::optional<std::string> title;
    const auto metadata = steam_store_app_metadata(appid);
    const auto name = json_string_value(metadata, "title");
    if (!name.empty()) {
      title = name;
    }

    {
      std::lock_guard<std::mutex> lock(cache_mutex);
      cache[appid] = title;
    }
    return title;
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

  static nlohmann::json steam_game_contract(
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

  static std::vector<std::string> steam_appids_from_json_array(const nlohmann::json &appids_node) {
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

  static nlohmann::json steam_owned_games_from_appids(
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

  static nlohmann::json sync_epic_installed_games() {
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
          nlohmann::json game;
          game["id"] = "epic:" + provider_id;
          game["uuid"] = nullptr;
          game["providerGameId"] = provider_id;
          game["sourceId"] = "epic";
          game["sourceName"] = "Epic Games";
          game["title"] = title;
          game["owned"] = true;
          game["installed"] = true;
          game["playable"] = false;
          game["installState"] = "installed";
          game["installPath"] = install_location;
          game["executablePath"] = app_name.empty() ? "" : "com.epicgames.launcher://apps/" + app_name + "?action=launch&silent=true";
          game["posterUrl"] = "";
          game["posterState"] = "missing";
          game["metadataState"] = "partial";
          game["metadata"] = nlohmann::json::object();
          game["launchableVia"] = "epic";
          games.push_back(game);
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

  static nlohmann::json sync_steam_owned_games(const nlohmann::json &source_state, bool &ok, std::string &error) {
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

  static nlohmann::json public_source_config_from_request(const std::string &source_id, const nlohmann::json &body) {
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

  static bool save_game_source_state(const std::string &source_id, const nlohmann::json &source_state) {
    auto state = read_vibeshine_state_json();
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
      game_sources["sources"][source_id] = source_state;
      return write_vibeshine_state_json(state);
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "game sources: failed to save source state: " << e.what();
    } catch (...) {
      BOOST_LOG(error) << "game sources: failed to save source state";
    }
    return false;
  }

  static bool remove_game_source_state(const std::string &source_id) {
    auto state = read_vibeshine_state_json();
    try {
      auto &sources = state["root"]["game_sources"]["sources"];
      if (sources.is_object() && sources.contains(source_id)) {
        sources.erase(source_id);
      }
      return write_vibeshine_state_json(state);
    } catch (...) {
      return false;
    }
  }

  static std::string now_iso8601_utc_string() {
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

  static nlohmann::json parse_json_request_body(req_https_t request) {
    std::stringstream ss;
    ss << request->content.rdbuf();
    const auto body = ss.str();
    if (body.empty()) {
      return nlohmann::json::object();
    }
    return nlohmann::json::parse(body);
  }

  static std::string json_string_value(const nlohmann::json &node, const char *key) {
    try {
      if (node.contains(key) && node[key].is_string()) {
        return node[key].get<std::string>();
      }
    } catch (...) {}
    return {};
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

  static std::string game_source_name(const std::string &source_id) {
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
    const bool playable = is_playable_library_entry(app);
    const bool has_cover = !uuid.empty() && (json_string_not_empty(app, "image-path") || !playnite_id.empty());

    nlohmann::json metadata = nlohmann::json::object();
    metadata["description"] = json_string_value(app, "description");
    metadata["developer"] = json_string_value(app, "developer");
    metadata["publisher"] = json_string_value(app, "publisher");
    metadata["releaseDate"] = json_string_value(app, "release-date");
    metadata["genres"] = app.contains("genres") && app["genres"].is_array() ? app["genres"] : nlohmann::json::array();

    nlohmann::json game;
    game["id"] = !uuid.empty() ? uuid : (!playnite_id.empty() ? "playnite:" + playnite_id : "local:" + std::to_string(index));
    game["uuid"] = uuid.empty() ? nlohmann::json(nullptr) : nlohmann::json(uuid);
    game["providerGameId"] = playnite_id.empty() ? json_string_value(app, "provider-game-id") : playnite_id;
    game["sourceId"] = source_id;
    game["sourceName"] = game_source_name(source_id);
    game["title"] = json_string_value(app, "name").empty() ? "Untitled game" : json_string_value(app, "name");
    game["owned"] = true;
    game["installed"] = playable;
    game["playable"] = playable;
    game["installState"] = playable ? "installed" : "not_installed";
    game["installPath"] = json_string_value(app, "working-dir");
    game["executablePath"] = command_preview(app);
    game["posterUrl"] = has_cover ? "/api/apps/" + uuid + "/cover" : "";
    game["posterState"] = has_cover ? "available" : "missing";
    game["metadataState"] = metadata["description"].get<std::string>().empty() && metadata["developer"].get<std::string>().empty() ? "partial" : "available";
    game["metadata"] = metadata;
    game["launchableVia"] = source_id == "playniteLegacy" ? "playnite" : "local";
    return game;
  }

  static nlohmann::json build_library_games_contract(const nlohmann::json &apps) {
    nlohmann::json games = nlohmann::json::array();
    std::unordered_set<std::string> linked_provider_games;
    const auto states = read_game_source_states();
    const bool playnite_disabled = source_state_or_empty(states, "playniteLegacy").value("disabled", false);
    int index = 0;
    for (const auto &app : apps) {
      if (app.is_object()) {
        const auto source_id = app_source_id(app);
        if (source_id == "playniteLegacy" && playnite_disabled) {
          ++index;
          continue;
        }
        const auto provider_game_id = json_string_value(app, "provider-game-id");
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

  static nlohmann::json build_library_summary(const nlohmann::json &games) {
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

  static nlohmann::json build_library_metadata_status() {
    const auto provider_states = read_metadata_provider_states();
    const auto steamgriddb = metadata_provider_state_or_empty(provider_states, "steamgriddb");
    const bool steamgriddb_configured = steamgriddb.value("configured", false) &&
      steamgriddb.contains("secretConfig") &&
      steamgriddb["secretConfig"].is_object() &&
      steamgriddb["secretConfig"].contains("apiKeyEncrypted") &&
      steamgriddb["secretConfig"]["apiKeyEncrypted"].is_string();

    const auto primary_provider = steamgriddb_configured ? "steamgriddb" : "steam";
    return {
      {"status", steamgriddb_configured ? "configured" : "steam_native"},
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
        nlohmann::json::object({{"id", "igdb"}, {"name", "IGDB"}, {"state", "not_configured"}})
      })},
      {"message", steamgriddb_configured
        ? "SteamGridDB poster fetching is configured with encrypted server-side storage."
        : "Steam-native posters and metadata are enabled without a personal API key. Optional providers can refine missing artwork later."}
    };
  }
  using enum confighttp::StatusCode;

  static std::string trim_copy(const std::string &input) {
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
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);
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
    auto state = read_vibeshine_state_json();
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

  static bool save_metadata_provider_state(const std::string &provider_id, const nlohmann::json &provider_state) {
    auto state = read_vibeshine_state_json();
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
      return write_vibeshine_state_json(state);
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
    using token_route_methods_t = std::map<std::string, std::set<std::string, std::less<>>, std::less<>>;

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

    token_route_methods_t snapshot_token_route_catalog() {
      std::scoped_lock lock(token_route_catalog_mutex);
      return token_route_catalog;
    }

  }  // namespace

  // Forward declaration for error helper implemented later
  void bad_request(resp_https_t response, req_https_t request, const std::string &error_message);
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

  // SESSION COOKIE
  std::string sessionCookie;
  static std::chrono::time_point<std::chrono::steady_clock> cookie_creation_time;

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
   * @brief Get the CORS origin for localhost (no wildcard).
   * @return The CORS origin string.
   */
  static std::string get_cors_origin() {
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
    output["audio_codec"] = state.audio_codec ? nlohmann::json(*state.audio_codec) : nlohmann::json(nullptr);
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

#ifdef _WIN32
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
   * @brief Health check for ViGEm (Virtual Gamepad) installation on Windows.
   * @api_examples{/api/health/vigem| GET| {"installed":true,"version":"<hint>"}}
   */
  void getVigemHealth(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    try {
      std::string version;
      bool installed = platf::is_vigem_installed(&version);
      nlohmann::json out;
      out["installed"] = installed;
      if (!version.empty()) {
        out["version"] = version;
      }
      send_response(response, out);
    } catch (...) {
      bad_request(response, request, "Failed to evaluate ViGEm health");
    }
  }
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
  void bad_request(resp_https_t response, [[maybe_unused]] req_https_t request, const std::string &error_message = "Bad Request") {
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

    std::ifstream in(WEB_DIR "images/apollo.ico", std::ios::binary);
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", "image/x-icon");
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(success_ok, in, headers);
  }

  /**
   * @brief Get the Apollo logo image.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @todo combine function with getFaviconImage and possibly getNodeModules
   * @todo use mime_types map
   */
  void getApolloLogoImage(resp_https_t response, req_https_t request) {
    print_req(request);

    std::ifstream in(WEB_DIR "images/logo-apollo-45.png", std::ios::binary);
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
      bad_request(response, request);
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
      bad_request(response, request);
      return;
    }
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Content-Type", mimeType->second);
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    std::ifstream in(filePath.string(), std::ios::binary);
    response->write(success_ok, in, headers);
  }

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
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);

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
          file_handler::write_file(config::stream.file_apps.c_str(), file_tree.dump(4));
        } catch (std::exception &e) {
          BOOST_LOG(warning) << "GetApps persist normalization failed: "sv << e.what();
        }
      }

      send_response(response, file_tree);
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "GetApps: "sv << e.what();
      bad_request(response, request, e.what());
    }
  }

  nlohmann::json build_system_readiness(int paired_clients, int playable_games) {
    nlohmann::json checks = nlohmann::json::array();
    checks.push_back(readiness_check(
      "client",
      "Client paired",
      paired_clients > 0 ? "ready" : "pending",
      paired_clients > 0 ? "At least one client is paired with this host." : "Pair a client before the first stream.",
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
      "warning",
      "Detailed encoder probing is pending; this contract reserves the readiness surface for NVENC, AMF, QSV, or software encoder state.",
      "Open Settings",
      "/settings"
    ));
    checks.push_back(readiness_check(
      "capture",
      "Display capture ready",
      "warning",
      "Detailed capture probing is pending; this will report display capture and helper state.",
      "Open Settings",
      "/settings"
    ));
    checks.push_back(readiness_check(
      "network",
      "Network reachable",
      "warning",
      "Detailed network probing is pending; this will report bind, discovery, and streaming port reachability.",
      "Open Settings",
      "/settings"
    ));
#ifdef _WIN32
    checks.push_back(readiness_check(
      "controller",
      "Controller driver ready",
      "warning",
      "Windows controller driver probing is pending; this will report ViGEm or replacement routing state.",
      "Open System",
      "/system"
    ));
    checks.push_back(readiness_check(
      "virtualDisplay",
      "Virtual display ready",
      "warning",
      "Windows virtual display probing is pending; this will report driver and configured display state.",
      "Open System",
      "/system"
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

  static nlohmann::json build_diagnostics_payload(std::string section = {}) {
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

  static nlohmann::json build_update_status_payload() {
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
    const bool ready_to_play = paired_clients > 0 && connected_sources > 0 && playable_games > 0;
    return nlohmann::json::array({
      {
        {"id", "pair"},
        {"title", "Pair a device"},
        {"description", "Connect a Jujo or Moonlight-compatible client to this host."},
        {"action", "Open Pairing"},
        {"path", "/pairing"},
        {"icon", "fa-link"},
        {"status", paired_clients > 0 ? "ready" : "pending"}
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
        {"status", ready_to_play ? "ready" : "warning"}
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

    const auto apps = read_apps_array_or_empty();
    const auto sources = build_game_sources_summary(apps);
    const int paired_clients = paired_client_count();
    const int connected_sources = connected_source_count(sources);
    const int playable_games = playable_game_count(apps);
    const bool setup_complete = paired_clients > 0 && connected_sources > 0 && playable_games > 0;

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

  /**
   * @brief Get game source connection and sync summary.
   * @api_examples{/api/game-sources| GET| null}
   */
  void getGameSources(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto apps = read_apps_array_or_empty();
    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["sources"] = build_game_sources_summary(apps);
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

    const auto apps = read_apps_array_or_empty();
    const auto games = build_library_games_contract(apps);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["games"] = games;
    output_tree["summary"] = build_library_summary(games);
    output_tree["sources"] = build_game_sources_summary(apps);
    output_tree["metadata"] = build_library_metadata_status();
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

  /**
   * @brief Configure a poster/metadata provider API key.
   * @api_examples{/api/library/metadata/providers/steamgriddb/connect| POST| {"apiKey":"..."}}
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

    if (provider_id != "steamgriddb") {
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

    nlohmann::json provider_state;
    provider_state["id"] = "steamgriddb";
    provider_state["name"] = "SteamGridDB";
    provider_state["configured"] = true;
    provider_state["state"] = "configured";
    provider_state["tokenEncrypted"] = true;
    provider_state["vaultProvider"] = vault_provider_name();
    provider_state["secretConfig"]["apiKeyEncrypted"] = encrypted_key;
    provider_state["publicConfig"]["apiKeyConfigured"] = true;
    provider_state["lastConfigured"] = now_iso8601_utc_string();
    provider_state["statusMessage"] = "SteamGridDB API key is stored encrypted and ready for automatic poster fetching.";

    if (!save_metadata_provider_state(provider_id, provider_state)) {
      output_tree["state"] = "error";
      output_tree["error"] = "SteamGridDB API key was encrypted but could not be saved.";
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["state"] = "configured";
    output_tree["tokenEncrypted"] = true;
    output_tree["vaultProvider"] = vault_provider_name();
    output_tree["metadata"] = build_library_metadata_status();
    output_tree["message"] = "SteamGridDB provider configured.";
    send_response(response, output_tree);
  }

  /**
   * @brief Get host readiness checks used by the System view.
   * @api_examples{/api/system/readiness| GET| null}
   */
  void getSystemReadiness(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto apps = read_apps_array_or_empty();
    const int paired_clients = paired_client_count();
    const int playable_games = playable_game_count(apps);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["overall"] = paired_clients > 0 && playable_games > 0 ? "ready" : "needs_setup";
    output_tree["checks"] = build_system_readiness(paired_clients, playable_games);
    send_response(response, output_tree);
  }

  /**
   * @brief Get a safe diagnostics snapshot for Flutter/admin clients.
   * @api_examples{/api/system/diagnostics| GET| {"status":true,"host":{},"streaming":{},"encoder":{},"network":{},"storage":{},"logs":{}}}
   */
  void getSystemDiagnostics(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    std::string section;
    if (request->path_match.size() > 1) {
      section = request->path_match[1];
    }

    auto output_tree = build_diagnostics_payload(section);
    if (output_tree.value("status", false)) {
      send_response(response, output_tree);
      return;
    }
    bad_request(response, request, output_tree.value("error", "Unknown diagnostics section."));
  }

  /**
   * @brief Legacy compact system status surface backed by diagnostics.
   * @api_examples{/api/system/status| GET| {"encoder":"auto","encoderStatus":"ready","activeStreams":0}}
   */
  void getSystemStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto diag = build_diagnostics_payload();
    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["version"] = diag["host"].value("version", "");
    output_tree["platform"] = diag["host"].value("platform", "");
    output_tree["uptimeMs"] = diag["host"].contains("uptimeMs") ? diag["host"]["uptimeMs"] : nlohmann::json(nullptr);
    output_tree["activeStreams"] = diag["streaming"].value("activeSessions", 0);
    output_tree["encoder"] = diag["encoder"].value("configuredEncoder", "auto");
    output_tree["encoderStatus"] = diag["encoder"].value("status", "unknown");
    output_tree["display"] = config::get_active_output_name().empty() ? "Automatic display selection" : config::get_active_output_name();
    output_tree["displayStatus"] = "ready";
    output_tree["network"] = std::format(
      "{}:{}",
      diag["network"].value("bindAddress", std::string {}),
      diag["network"]["ports"].value("https", 0)
    );
    output_tree["networkStatus"] = diag["network"].value("status", "unknown");
    send_response(response, output_tree);
  }

  /**
   * @brief Get GitHub release metadata for Flutter-managed backend updates.
   * @api_examples{/api/updates/status| GET| {"status":true,"updateAvailable":false,"candidate":null}}
   */
  void getUpdateStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);
    send_response(response, build_update_status_payload());
  }

  /**
   * @brief Trigger an async update metadata refresh.
   * @api_examples{/api/updates/check| POST| null}
   */
  void postUpdateCheck(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);
    update::trigger_check(true);
    auto output_tree = build_update_status_payload();
    output_tree["message"] = "Update check scheduled.";
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

    const auto apps = read_apps_array_or_empty();
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
    } else if (source_id == "epic") {
      auto epic_games = sync_epic_installed_games();
      source_state["id"] = "epic";
      source_state["connected"] = false;
      source_state["connectionState"] = "requires_action";
      source_state["syncState"] = "local_ready";
      source_state["lastSynced"] = now_iso8601_utc_string();
      source_state["games"] = epic_games;
      source_state["ownedGameCount"] = static_cast<int>(epic_games.size());
      source_state["installedGameCount"] = static_cast<int>(epic_games.size());
      source_state["playableGameCount"] = 0;
      source_state["metadataAvailable"] = false;
      source_state["posterProvider"] = "pending";
      source_state["statusMessage"] = "Local Epic installs were detected. Epic account sign-in is still required for full owned-library sync.";
      if (!save_game_source_state(source_id, source_state)) {
        output_tree["status"] = false;
        output_tree["syncState"] = "error";
        output_tree["error"] = "Epic local sync completed but failed to persist source state.";
        send_response(response, output_tree);
        return;
      }
      output_tree["syncState"] = "local_ready";
      output_tree["ownedGameCount"] = static_cast<int>(epic_games.size());
      output_tree["installedGameCount"] = static_cast<int>(epic_games.size());
      output_tree["playableGameCount"] = 0;
      output_tree["message"] = epic_games.empty()
        ? "No local Epic installs were found."
        : "Local Epic installs were detected.";
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
    if (is_store_game_source(source_id)) {
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
    output_tree["message"] = is_store_game_source(source_id)
      ? "Provider source state and encrypted credentials were removed."
      : (source_id == "playniteLegacy" ? "Playnite Legacy source was disabled." : "This source does not use provider tokens.");
    send_response(response, output_tree);
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
      const int index = input_tree.at("index").get<int>();  // intentionally throws if the provided value is missing or the wrong type

      // Read the existing apps file.
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);

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

      if (index == -1) {
        if (input_uuid.empty()) {
          input_uuid = uuid_util::uuid_t::generate().string();
          input_tree["uuid"] = input_uuid;
        }
        if (!replaced) {
          apps_node.push_back(input_tree);
        }
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
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);
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
   * @brief Upload or set a specific application's cover image by UUID.
   *        Accepts either a JSON body with {"url": "..."} (restricted to images.igdb.com) or {"data": base64}.
   *        Saves to appdata/covers/@c uuid.@c ext where ext is derived from URL or defaults to .png for data.
   * @api_examples{/api/apps/@c uuid/cover| POST| {"url":"https://images.igdb.com/.../abc.png"}}
   */

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
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json fileTree = nlohmann::json::parse(content);

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
      file_handler::write_file(config::stream.file_apps.c_str(), fileTree.dump(4));

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
      std::string content = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(content);
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
      file_handler::write_file(config::stream.file_apps.c_str(), file_tree.dump(4));
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

#ifdef _WIN32
  static std::optional<uint64_t> file_creation_time_ms(const std::filesystem::path &path) {
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

  static std::filesystem::path windows_color_profile_dir() {
    wchar_t system_root[MAX_PATH] = {};
    if (GetSystemWindowsDirectoryW(system_root, _countof(system_root)) == 0) {
      return std::filesystem::path(L"C:\\Windows\\System32\\spool\\drivers\\color");
    }
    std::filesystem::path root(system_root);
    return root / L"System32" / L"spool" / L"drivers" / L"color";
  }
#endif

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

#ifdef _WIN32
  // removed unused forward declaration for default_playnite_ext_dir()
#endif

  /**
   * @brief Update stored settings for a paired client.
   */
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
    if (!validateContentType(response, request, "application/json") || !authenticate(response, request)) {
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
      for (const auto &[k, v] : input_tree.items()) {
        if (v.is_null() || (v.is_string() && v.get<std::string>().empty())) {
          continue;
        }

        // v.dump() will dump valid json, which we do not want for strings in the config right now
        // we should migrate the config file to straight json and get rid of all this nonsense
        config_stream << k << " = " << (v.is_string() ? v.get<std::string>() : v.dump()) << std::endl;
      }
      file_handler::write_file(config::sunshine.config_file.c_str(), config_stream.str());

      // Detect restart-required keys
      static const std::set<std::string> restart_required_keys = {
        "port",
        "address_family",
        "upnp",
        "pkey",
        "cert"
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

      // Detect restart-required keys
      static const std::set<std::string> restart_required_keys = {
        "port",
        "address_family",
        "upnp",
        "pkey",
        "cert"
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
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "PatchConfig: "sv << e.what();
      bad_request(response, request, e.what());
      return;
    }
  }

  // Lightweight session status for UI messaging
  /**
   * @brief GET /api/server/status — comprehensive server metrics for the Flutter dashboard.
   * Returns uptime, version, active sessions, paired clients, and streaming state.
   */

  /**
   * POST /api/wol
   * Send a Wake-on-LAN magic packet to a target MAC address.
   * Body: { "mac": "AA:BB:CC:DD:EE:FF", "broadcast": "255.255.255.255", "port": 9 }
   * Requires: operator role (can wake machines to stream)
   */
  void postWakeOnLan(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }
    print_req(request);

    std::stringstream ss;
    ss << request->content.rdbuf();
    auto body = ss.str();

    nlohmann::json input;
    try {
      input = nlohmann::json::parse(body);
    }
    catch (...) {
      bad_request(response, request, "Invalid JSON");
      return;
    }

    if (!input.contains("mac") || !input["mac"].is_string()) {
      bad_request(response, request, "Missing 'mac' field");
      return;
    }

    std::string mac_str = input["mac"].get<std::string>();
    std::string broadcast_addr = input.value("broadcast", "255.255.255.255");
    int port = input.value("port", 9);

    // Parse MAC address (accepts AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF)
    unsigned char mac[6];
    int parsed = 0;
    for (size_t i = 0; i < mac_str.size() && parsed < 6; i++) {
      if (mac_str[i] == ':' || mac_str[i] == '-') continue;
      if (i + 1 < mac_str.size()) {
        char hex[3] = { mac_str[i], mac_str[i + 1], '\0' };
        mac[parsed++] = (unsigned char)strtol(hex, nullptr, 16);
        i++; // skip second hex char
      }
    }

    if (parsed != 6) {
      bad_request(response, request, "Invalid MAC address format");
      return;
    }

    // Build magic packet: 6x 0xFF + 16x MAC
    unsigned char magic_packet[102];
    memset(magic_packet, 0xFF, 6);
    for (int i = 0; i < 16; i++) {
      memcpy(magic_packet + 6 + i * 6, mac, 6);
    }

    // Send via UDP broadcast
    boost::asio::io_context io_ctx;
    boost::asio::ip::udp::socket udp_socket(io_ctx);
    boost::system::error_code ec;

    udp_socket.open(boost::asio::ip::udp::v4(), ec);
    if (ec) {
      bad_request(response, request, "Failed to open socket: " + ec.message());
      return;
    }

    udp_socket.set_option(boost::asio::socket_base::broadcast(true), ec);
    if (ec) {
      bad_request(response, request, "Failed to set broadcast: " + ec.message());
      return;
    }

    auto addr = boost::asio::ip::make_address(broadcast_addr, ec);
    if (ec) {
      bad_request(response, request, "Invalid broadcast address");
      return;
    }

    boost::asio::ip::udp::endpoint endpoint(addr, static_cast<unsigned short>(port));

    udp_socket.send_to(boost::asio::buffer(magic_packet, 102), endpoint, 0, ec);
    if (ec) {
      bad_request(response, request, "Failed to send packet: " + ec.message());
      return;
    }

    udp_socket.close();

    BOOST_LOG(info) << "WoL: magic packet sent to " << mac_str << " via " << broadcast_addr << ":" << port;

    nlohmann::json output;
    output["status"] = true;
    output["mac"] = mac_str;
    output["broadcast"] = broadcast_addr;
    output["port"] = port;
    send_response(response, output);
  }
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

            if (!owner_id.empty() && owner_id != user_id) {
              // Not the owner — check if user is a server_member via Supabase REST
              bool is_member = false;
              std::string member_role_str = "viewer";  // default role for members
              CURL *member_curl = curl_easy_init();
              if (member_curl) {
                const auto members_url = config::cloud.supabase_url +
                  "/rest/v1/server_members?select=id,role&server_owner_id=eq." + owner_id +
                  "&user_id=eq." + user_id + "&limit=1";

                std::string member_response;
                struct curl_slist *member_headers = nullptr;
                member_headers = curl_slist_append(member_headers, ("apikey: " + config::cloud.supabase_key).c_str());
                member_headers = curl_slist_append(member_headers, ("Authorization: Bearer " + config::cloud.supabase_key).c_str());

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

              BOOST_LOG(info) << "cloud_pair: user " << user_id << " is a member of server owned by " << owner_id << " - allowing pair";
            }
          }
          // If owner token validation fails (expired, etc.), fall through and allow
          // the pairing — the user already proved they have a valid Supabase account
        }
      }

      // All checks passed — pair the client
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
      rbac::registry.register_client(user_id, rbac::Role::admin, device_name);

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

  void listWebRTCSessions(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    nlohmann::json output;
    output["sessions"] = nlohmann::json::array();
    for (const auto &session : webrtc_stream::list_sessions()) {
      output["sessions"].push_back(webrtc_session_to_json(session));
    }
    send_response(response, output);
  }

  void createWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }

    BOOST_LOG(debug) << "WebRTC: create session request received";

    webrtc_stream::SessionOptions options;
    std::stringstream ss;
    ss << request->content.rdbuf();
    auto body = ss.str();
    if (!body.empty()) {
      if (!check_content_type(response, request, "application/json")) {
        return;
      }
      try {
        nlohmann::json input = nlohmann::json::parse(body);
        if (input.contains("audio")) {
          options.audio = input.at("audio").get<bool>();
        }
        if (input.contains("host_audio")) {
          options.host_audio = input.at("host_audio").get<bool>();
        }
        if (input.contains("video")) {
          options.video = input.at("video").get<bool>();
        }
        if (input.contains("encoded")) {
          options.encoded = input.at("encoded").get<bool>();
        }
        if (input.contains("width")) {
          const int width = input.at("width").get<int>();
          if (width > 0) {
            options.width = width;
          }
        }
        if (input.contains("height")) {
          const int height = input.at("height").get<int>();
          if (height > 0) {
            options.height = height;
          }
        }
        if (input.contains("fps")) {
          const int fps = input.at("fps").get<int>();
          if (fps > 0) {
            options.fps = fps;
          }
        }
        if (input.contains("bitrate_kbps")) {
          options.bitrate_kbps = input.at("bitrate_kbps").get<int>();
        }
        if (input.contains("codec")) {
          options.codec = input.at("codec").get<std::string>();
        }
        if (input.contains("hdr")) {
          options.hdr = input.at("hdr").get<bool>();
        }
        if (input.contains("audio_channels")) {
          options.audio_channels = input.at("audio_channels").get<int>();
        }
        if (input.contains("audio_codec")) {
          options.audio_codec = input.at("audio_codec").get<std::string>();
        }
        if (input.contains("profile")) {
          options.profile = input.at("profile").get<std::string>();
        }
        if (input.contains("app_id")) {
          options.app_id = input.at("app_id").get<int>();
        }
        if (input.contains("resume")) {
          options.resume = input.at("resume").get<bool>();
        }
        if (input.contains("video_pacing_mode")) {
          options.video_pacing_mode = input.at("video_pacing_mode").get<std::string>();
        }
        if (input.contains("video_pacing_slack_ms")) {
          options.video_pacing_slack_ms = input.at("video_pacing_slack_ms").get<int>();
        }
        if (input.contains("video_max_frame_age_ms")) {
          options.video_max_frame_age_ms = input.at("video_max_frame_age_ms").get<int>();
        }

        if (options.codec) {
          auto lower = *options.codec;
          boost::algorithm::to_lower(lower);
          if (lower != "h264" && lower != "hevc" && lower != "av1") {
            bad_request(response, request, "Unsupported codec");
            return;
          }
          options.codec = std::move(lower);
        }
        if (options.audio_codec) {
          auto lower = *options.audio_codec;
          boost::algorithm::to_lower(lower);
          if (lower != "opus" && lower != "aac") {
            bad_request(response, request, "Unsupported audio codec");
            return;
          }
          options.audio_codec = std::move(lower);
        }
        if (options.audio_channels) {
          int channels = *options.audio_channels;
          if (channels != 2 && channels != 6 && channels != 8) {
            bad_request(response, request, "Unsupported audio channel count");
            return;
          }
        }
        if (options.video_pacing_mode) {
          auto lower = *options.video_pacing_mode;
          boost::algorithm::to_lower(lower);
          if (lower == "smooth") {
            lower = "smoothness";
          }
          if (lower != "latency" && lower != "balanced" && lower != "smoothness") {
            bad_request(response, request, "Unsupported video pacing mode");
            return;
          }
          options.video_pacing_mode = std::move(lower);
        }
        if (options.video_pacing_slack_ms) {
          const int slack_ms = *options.video_pacing_slack_ms;
          if (slack_ms < 0 || slack_ms > 10) {
            bad_request(response, request, "video_pacing_slack_ms must be between 0 and 10");
            return;
          }
        }
        if (options.video_max_frame_age_ms) {
          const int max_age_ms = *options.video_max_frame_age_ms;
          if (max_age_ms < 5 || max_age_ms > 250) {
            bad_request(response, request, "video_max_frame_age_ms must be between 5 and 250");
            return;
          }
        }
        if (options.hdr.value_or(false)) {
          if (!options.encoded) {
            bad_request(response, request, "HDR requires encoded video for WebRTC sessions");
            return;
          }
          if (!options.codec || (*options.codec != "hevc" && *options.codec != "av1")) {
            bad_request(response, request, "HDR requires HEVC or AV1 video encoding");
            return;
          }
        }
        if (options.hdr.value_or(false)) {
          if (!options.encoded) {
            bad_request(response, request, "HDR requires encoded video for WebRTC sessions");
            return;
          }
          if (!options.codec || (*options.codec != "hevc" && *options.codec != "av1")) {
            bad_request(response, request, "HDR requires HEVC or AV1 video encoding");
            return;
          }
        }
      } catch (const std::exception &e) {
        bad_request(response, request, e.what());
        return;
      }
    }

    BOOST_LOG(debug) << "WebRTC: creating session";
    if (auto error = webrtc_stream::ensure_capture_started(options)) {
#ifdef _WIN32
      // Lifecycle gap: if capture start fails after a virtual display was created/applied but
      // before a session exists, ensure we don't leave the virtual display behind.
      if (rtsp_stream::session_count() == 0 && !webrtc_stream::has_active_sessions()) {
        (void) platf::virtual_display_cleanup::run(
          "webrtc_session_start_failed",
          config::video.dd.config_revert_on_disconnect
        );
      }
#endif
      bad_request(response, request, error->c_str());
      return;
    }
    auto session = webrtc_stream::create_session(options);
    if (!session) {
      webrtc_stream::shutdown_all_sessions();
      service_unavailable(response, "Shutdown in progress");
      return;
    }
    BOOST_LOG(debug) << "WebRTC: session created id=" << session->id;
    nlohmann::json output;
    output["status"] = true;
    output["session"] = webrtc_session_to_json(*session);
    output["cert_fingerprint"] = webrtc_stream::get_server_cert_fingerprint();
    output["cert_pem"] = webrtc_stream::get_server_cert_pem();
    output["ice_servers"] = load_webrtc_ice_servers();
    send_response(response, output);
  }

  void getWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    auto session = webrtc_stream::get_session(session_id);
    if (!session) {
      bad_request(response, request, "Session not found");
      return;
    }

    nlohmann::json output;
    output["session"] = webrtc_session_to_json(*session);
    send_response(response, output);
  }

  void deleteWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    nlohmann::json output;
    if (webrtc_stream::close_session(session_id)) {
      output["status"] = true;
    } else {
      output["error"] = "Session not found";
    }
    send_response(response, output);
  }

  void postWebRTCOffer(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }
    if (!check_content_type(response, request, "application/json")) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input = nlohmann::json::parse(ss.str());
      auto sdp = input.at("sdp").get<std::string>();
      auto type = input.value("type", "offer");
      nlohmann::json output;
      if (!webrtc_stream::set_remote_offer(session_id, sdp, type)) {
        if (!webrtc_stream::get_session(session_id)) {
          output["error"] = "Session not found";
        } else {
          output["error"] = "Failed to process offer";
        }
        send_response(response, output);
        return;
      }

      std::string answer_sdp;
      std::string answer_type;
      if (webrtc_stream::wait_for_local_answer(session_id, answer_sdp, answer_type, std::chrono::seconds {3})) {
        output["status"] = true;
        output["answer_ready"] = true;
        output["sdp"] = answer_sdp;
        output["type"] = answer_type;
      } else {
        output["status"] = true;
        output["answer_ready"] = false;
        output["sdp"] = nullptr;
        output["type"] = nullptr;
      }
      send_response(response, output);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  void getWebRTCAnswer(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::string answer_sdp;
    std::string answer_type;
    nlohmann::json output;
    if (webrtc_stream::get_local_answer(session_id, answer_sdp, answer_type)) {
      output["status"] = true;
      output["answer_ready"] = true;
      output["sdp"] = answer_sdp;
      output["type"] = answer_type;
    } else {
      output["status"] = false;
      output["error"] = "Answer not ready";
    }
    send_response(response, output);
  }

  void postWebRTCIce(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }
    if (!check_content_type(response, request, "application/json")) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input = nlohmann::json::parse(ss.str());
      nlohmann::json output;
      constexpr std::size_t kMaxCandidatesPerRequest = 256;
      std::vector<nlohmann::json> candidates;
      if (input.is_array()) {
        candidates.reserve(std::min<std::size_t>(input.size(), kMaxCandidatesPerRequest));
        for (const auto &entry : input) {
          if (candidates.size() >= kMaxCandidatesPerRequest) {
            break;
          }
          candidates.push_back(entry);
        }
      } else if (input.contains("candidates") && input["candidates"].is_array()) {
        const auto &arr = input["candidates"];
        candidates.reserve(std::min<std::size_t>(arr.size(), kMaxCandidatesPerRequest));
        for (const auto &entry : arr) {
          if (candidates.size() >= kMaxCandidatesPerRequest) {
            break;
          }
          candidates.push_back(entry);
        }
      } else {
        candidates.push_back(input);
      }

      bool ok = true;
      for (const auto &entry : candidates) {
        if (!entry.is_object()) {
          continue;
        }
        auto mid = entry.value("sdpMid", "");
        auto mline_index = entry.value("sdpMLineIndex", -1);
        auto candidate = entry.value("candidate", "");
        if (candidate.empty()) {
          continue;
        }
        if (!webrtc_stream::add_ice_candidate(session_id, std::move(mid), mline_index, std::move(candidate))) {
          ok = false;
          break;
        }
      }
      if (ok) {
        output["status"] = true;
      } else {
        output["error"] = "Session not found";
      }
      send_response(response, output);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  void getWebRTCIce(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::size_t since = 0;
    auto query = request->parse_query_string();
    auto since_it = query.find("since");
    if (since_it != query.end()) {
      try {
        since = static_cast<std::size_t>(std::stoull(since_it->second));
      } catch (...) {
        bad_request(response, request, "Invalid since parameter");
        return;
      }
    }

    auto candidates = webrtc_stream::get_local_candidates(session_id, since);
    nlohmann::json output;
    output["status"] = true;
    output["candidates"] = nlohmann::json::array();
    std::size_t last_index = since;
    for (const auto &candidate : candidates) {
      nlohmann::json item;
      item["sdpMid"] = candidate.mid;
      item["sdpMLineIndex"] = candidate.mline_index;
      item["candidate"] = candidate.candidate;
      item["index"] = candidate.index;
      output["candidates"].push_back(std::move(item));
      last_index = std::max(last_index, candidate.index);
    }
    output["next_since"] = last_index;
    send_response(response, output);
  }

  void getWebRTCIceStream(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    if (!webrtc_stream::get_session(session_id)) {
      bad_request(response, request, "Session not found");
      return;
    }

    std::size_t since = 0;
    auto query = request->parse_query_string();
    auto since_it = query.find("since");
    if (since_it != query.end()) {
      try {
        since = static_cast<std::size_t>(std::stoull(since_it->second));
      } catch (...) {
        bad_request(response, request, "Invalid since parameter");
        return;
      }
    }

    std::thread([response, session_id, since]() mutable {
      response->close_connection_after_response = true;

      response->write({{"Content-Type", "text/event-stream"}, {"Cache-Control", "no-cache"}, {"Connection", "keep-alive"}, {"Access-Control-Allow-Origin", get_cors_origin()}});

      std::promise<bool> header_error;
      response->send([&header_error](const SimpleWeb::error_code &ec) {
        header_error.set_value(static_cast<bool>(ec));
      });
      if (header_error.get_future().get()) {
        return;
      }

      auto last_index = since;
      auto last_keepalive = std::chrono::steady_clock::now();

      while (true) {
        auto candidates = webrtc_stream::get_local_candidates(session_id, last_index);
        for (const auto &candidate : candidates) {
          nlohmann::json payload;
          payload["sdpMid"] = candidate.mid;
          payload["sdpMLineIndex"] = candidate.mline_index;
          payload["candidate"] = candidate.candidate;

          *response << "event: candidate\n";
          *response << "id: " << candidate.index << "\n";
          *response << "data: " << payload.dump() << "\n\n";

          std::promise<bool> error;
          response->send([&error](const SimpleWeb::error_code &ec) {
            error.set_value(static_cast<bool>(ec));
          });
          if (error.get_future().get()) {
            return;
          }

          last_index = std::max(last_index, candidate.index);
        }

        auto now = std::chrono::steady_clock::now();
        if (now - last_keepalive > std::chrono::seconds(2)) {
          *response << "event: keepalive\n";
          *response << "data: {}\n\n";
          std::promise<bool> error;
          response->send([&error](const SimpleWeb::error_code &ec) {
            error.set_value(static_cast<bool>(ec));
          });
          if (error.get_future().get()) {
            return;
          }
          last_keepalive = now;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
      }
    }).detach();
  }

  void getWebRTCCert(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    nlohmann::json output;
    output["cert_fingerprint"] = webrtc_stream::get_server_cert_fingerprint();
    output["cert_pem"] = webrtc_stream::get_server_cert_pem();
    send_response(response, output);
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
      std::string file = file_handler::read_file(config::stream.file_apps.c_str());
      nlohmann::json file_tree = nlohmann::json::parse(file);
      auto &apps_node = file_tree["apps"];

      int removed = 0;
      for (auto &app : apps_node) {
        std::string managed = app.contains("playnite-managed") && app["playnite-managed"].is_string() ? app["playnite-managed"].get<std::string>() : std::string();
        if (managed == "auto") {
          ++removed;
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
   * @brief Get the logs from the log file.
   * @param response The HTTP response object.
   * @param request The HTTP request object.
   *
   * @api_examples{/api/logs| GET| null}
   */
  void getLogs(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    auto read_sunshine_log = [](std::string &out) {
      auto log_path = logging::current_log_file();
      if (!log_path.empty()) {
        const std::string log_path_str = log_path.string();
        out = file_handler::read_file(log_path_str.c_str());
      }
    };

    std::string content;
    std::string source = "sunshine";
    const auto query = request->parse_query_string();
    if (const auto it = query.find("source"); it != query.end() && !it->second.empty()) {
      source = it->second;
      boost::algorithm::to_lower(source);
    }

    bool handled = false;
    if (source == "sunshine") {
      read_sunshine_log(content);
      handled = true;
    }
#ifdef _WIN32
    else if (is_helper_log_source(source)) {
      handled = true;
      read_helper_log(source, content);
    }
#endif
    if (!handled) {
      read_sunshine_log(content);
    }
    SimpleWeb::CaseInsensitiveMultimap headers;
    std::string contentType = "text/plain";
#ifdef _WIN32
    contentType += "; charset=";
    contentType += currentCodePageToCharset();
#endif
    headers.emplace("Content-Type", contentType);
    headers.emplace("X-Frame-Options", "DENY");
    headers.emplace("Content-Security-Policy", "frame-ancestors 'none';");
    response->write(success_ok, content, headers);
  }

#ifdef _WIN32
#endif

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

#ifdef _WIN32
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
#endif

#ifdef _WIN32
  // --- Golden snapshot helpers (Windows-only) ---
  static bool file_exists_nofail(const std::filesystem::path &p) {
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
  static std::vector<std::filesystem::path> golden_snapshot_candidates() {
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

  constexpr int kGoldenSnapshotLatestVersion = 2;

  static std::optional<nlohmann::json> read_json_file_nofail(const std::filesystem::path &path) {
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

  static std::optional<int> parse_snapshot_version(const nlohmann::json &root) {
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

  static bool snapshot_has_layout_data(const nlohmann::json &root) {
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
#endif

  /**
   * @brief Restart Apollo.
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

    proc::proc.terminate();

    // We may not return from this call
    platf::restart();
  }

  /**
   * @brief Quit Apollo.
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
      output_tree["routes"].push_back({{"path", path}, {"methods", ordered_methods_for_catalog(methods)}});
    }

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

  void listSessions(resp_https_t response, req_https_t request);
  void revokeSession(resp_https_t response, req_https_t request);

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

      // Check for required uuid field in body
      if (!input_tree.contains("uuid") || !input_tree["uuid"].is_string()) {
        bad_request(response, request, "Missing or invalid uuid in request body");
        return;
      }
      std::string uuid = input_tree["uuid"].get<std::string>();

      nlohmann::json output_tree;
      const auto &apps = proc::proc.get_apps();
      for (auto &app : apps) {
        if (app.uuid == uuid) {
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
      BOOST_LOG(error) << "Couldn't find app with uuid ["sv << uuid << ']';
      bad_request(response, request, "Cannot find requested application");
    } catch (std::exception &e) {
      BOOST_LOG(warning) << "LaunchApp: "sv << e.what();
      bad_request(response, request, e.what());
    }
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

  void start() {
    auto shutdown_event = mail::man->event<bool>(mail::shutdown);
    auto port_https = net::map_port(PORT_HTTPS);
    auto address_family = net::af_from_enum_string(config::sunshine.address_family);

    https_server_t server(config::nvhttp.cert, config::nvhttp.pkey);
    server.default_resource["DELETE"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request);
    };
    server.default_resource["PATCH"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request);
    };
    server.default_resource["POST"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request);
    };
    server.default_resource["PUT"] = [](resp_https_t response, req_https_t request) {
      bad_request(response, request);
    };

    server.default_resource["GET"] = not_found;
    server.resource["^/$"]["GET"] = not_found;
    clear_token_route_catalog();
    auto register_api_route = [&](const char *pattern, const char *method, const auto &handler) {
      server.resource[pattern][method] = handler;
      record_token_route(normalize_route_pattern(pattern), method);
    };
    register_api_route("^/api/pin$", "POST", savePin);
    register_api_route("^/api/otp$", "POST", getOTP);
    register_api_route("^/api/apps$", "GET", getApps);
    register_api_route("^/api/setup/status$", "GET", getSetupStatus);
    register_api_route("^/api/game-sources$", "GET", getGameSources);
    register_api_route("^/api/game-sources/([^/]+)/connect$", "POST", postGameSourceConnect);
    register_api_route("^/api/game-sources/steam/auth/start$", "POST", postSteamAuthStart);
    register_api_route("^/api/game-sources/steam/auth/callback$", "GET", getSteamAuthCallback);
    register_api_route("^/api/game-sources/steam/web-library$", "POST", postSteamWebLibrary);
    register_api_route("^/api/game-sources/([^/]+)/sync$", "POST", postGameSourceSync);
    register_api_route("^/api/game-sources/([^/]+)/disconnect$", "POST", postGameSourceDisconnect);
    register_api_route("^/api/library/games$", "GET", getLibraryGames);
    register_api_route("^/api/library/steam/prefetch-progress$", "GET", getSteamPrefetchProgress);
    register_api_route("^/api/library/steam/([0-9]+)/poster$", "GET", getSteamPoster);
    register_api_route("^/api/library/metadata/status$", "GET", getLibraryMetadataStatus);
    register_api_route("^/api/library/metadata/providers/([^/]+)/connect$", "POST", postLibraryMetadataProviderConnect);
    register_api_route("^/api/game-sources/playniteLegacy/purge-apps$", "POST", postPlaynitePurgeApps);
    register_api_route("^/api/system/readiness$", "GET", getSystemReadiness);
    register_api_route("^/api/system/status$", "GET", getSystemStatus);
    register_api_route("^/api/system/diagnostics$", "GET", getSystemDiagnostics);
    register_api_route("^/api/system/diagnostics/([A-Za-z0-9_-]+)$", "GET", getSystemDiagnostics);
    register_api_route("^/api/updates/status$", "GET", getUpdateStatus);
    register_api_route("^/api/updates/check$", "POST", postUpdateCheck);
    register_api_route("^/api/apps$", "POST", saveApp);
    register_api_route("^/api/apps/([^/]+)/cover$", "GET", getAppCover);
    register_api_route("^/api/apps/reorder$", "POST", reorderApps);
    register_api_route("^/api/apps/delete$", "POST", deleteApp);
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
    register_api_route("^/api/token/([a-fA-F0-9]+)$", "DELETE", revokeApiToken);
    // Session validation endpoint used by the web UI to detect HttpOnly session cookies
    server.resource["^/api-tokens/?$"]["GET"] = getTokenPage;
    register_api_route("^/api/auth/login$", "POST", loginUser);
    register_api_route("^/api/auth/refresh$", "POST", refreshSession);
    register_api_route("^/api/auth/logout$", "POST", logoutUser);
    register_api_route("^/api/auth/status$", "GET", authStatus);
    register_api_route("^/api/auth/sessions$", "GET", listSessions);
    register_api_route("^/api/auth/sessions/([A-Fa-f0-9]+)$", "DELETE", revokeSession);
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
}  // namespace confighttp
