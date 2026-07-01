/**
 * @file src/confighttp_internal.h
 * @brief INTERNAL declarations shared between confighttp split modules.
 *        Do NOT include from outside the confighttp_*.cpp compilation units.
 */
#pragma once

#include <filesystem>
#include <mutex>
#include <optional>
#include <set>
#include <string>
#include <unordered_map>
#include <vector>

#include <nlohmann/json.hpp>
#include <Simple-Web-Server/server_https.hpp>

#include "confighttp.h"
#include "webrtc_stream.h"

// Platform-specific includes (always safe on Windows target)
#ifdef _WIN32
#  include "platform/windows/misc.h"
#  include "platform/windows/utils.h"
#  include "platform/windows/virtual_display_cleanup.h"
#  include "platform/windows/playnite_integration.h"
#  include "platform/windows/playnite_sync.h"
#  include "platform/windows/autostart.h"
#endif

namespace confighttp {

  // ─── StatusCode convenience ─────────────────────────────────────────────────
  // All split modules should add: using enum SimpleWeb::StatusCode;
  // inside the namespace confighttp { } block — that pulls in success_ok etc.

  // ─── App library helpers (defined in confighttp.cpp) ────────────────────────
  nlohmann::json  read_apps_array_or_empty();
  int             playable_game_count(const nlohmann::json &apps);
  int             paired_client_count();
  std::string     game_source_name(const std::string &source_id);
  int             purge_provider_apps_for_source(const std::string &source_id);
  int             auto_import_installed_provider_games(const std::string &source_id, const nlohmann::json &games);
  int             flag_uninstalled_provider_games(const std::string &source_id, const nlohmann::json &games);
  nlohmann::json  build_game_sources_summary(const nlohmann::json &apps);
  nlohmann::json  provider_connection_requirements(const std::string &source_id);
  nlohmann::json  visible_apps_for_current_sources(const nlohmann::json &apps);
  nlohmann::json  build_library_games_contract(const nlohmann::json &apps);
  nlohmann::json  build_library_summary(const nlohmann::json &games);
  nlohmann::json  public_source_config_from_request(const std::string &source_id, const nlohmann::json &body);
  bool            remove_game_source_state(const std::string &source_id);

  // ─── OAuth / auth helpers ────────────────────────────────────────────────────
  std::string     request_scheme_and_host(req_https_t request);
  std::unordered_map<std::string, std::string> query_params_from_target(const std::string &target);
  std::string     steam_openid_auth_url(const std::string &base_url);
  bool            verify_steam_openid_response(const std::unordered_map<std::string, std::string> &params, std::string &steam_id_out, std::string &error);
  std::string     gog_auth_url(const std::string &base_url);
  std::string     epic_auth_url();
  bool            save_oauth_session(nlohmann::json &source_state, const nlohmann::json &session, std::string &error);
  bool            gog_exchange_code(const std::string &code, const std::string &redirect_uri, nlohmann::json &session_out, std::string &error);
  bool            epic_start_session(const std::string &grant_type, const std::string &token_value, nlohmann::json &session_out, std::string &error);

  // ─── Steam helpers ───────────────────────────────────────────────────────────
  struct SteamInstallStatus { std::string install_path; std::string title; };
  std::unordered_map<std::string, SteamInstallStatus> detect_installed_steam_games();
  nlohmann::json  steam_owned_games_from_appids(const std::vector<std::string> &appids, const std::unordered_map<std::string, SteamInstallStatus> &installed);
  std::vector<std::string> steam_appids_from_json_array(const nlohmann::json &appids_node);
  nlohmann::json  steam_game_contract(const std::string &appid, const std::string &title, const SteamInstallStatus *install_info, bool owned);
  void            steam_prefetch_enqueue_batch(const std::vector<std::string> &appids);
  nlohmann::json  steam_prefetch_progress_json();

  // ─── Sync helpers ────────────────────────────────────────────────────────────
  nlohmann::json  sync_epic_installed_games();
  nlohmann::json  sync_gog_installed_games();
  nlohmann::json  sync_xbox_installed_games();
  nlohmann::json  sync_gog_owned_games(nlohmann::json &source_state, bool &ok, std::string &error);
  nlohmann::json  sync_epic_owned_games(nlohmann::json &source_state, bool &ok, std::string &error);
  nlohmann::json  sync_steam_owned_games(const nlohmann::json &source_state, bool &ok, std::string &error);

  // ─── Art scan helpers ────────────────────────────────────────────────────────
  extern std::mutex           s_art_autoscan_mutex;
  extern nlohmann::json       s_art_autoscan_status;
  nlohmann::json  scan_art_for_app(const nlohmann::json &app, int index);
  void            run_art_autoscan_worker(bool missing_only, bool force_apply);

  // ─── WebRTC helpers ──────────────────────────────────────────────────────────
  nlohmann::json  webrtc_session_to_json(const webrtc_stream::SessionState &state);
  nlohmann::json  load_webrtc_ice_servers();

  // ─── HTTP/CORS helpers ───────────────────────────────────────────────────────
  std::string     get_cors_origin();
  bool            check_content_type(resp_https_t response, req_https_t request, const std::string_view &contentType);

  // ─── System/diagnostics helpers ─────────────────────────────────────────────
  nlohmann::json  build_system_readiness(int paired_clients, int playable_games);
  nlohmann::json  build_serverinfo_compat_payload();
  nlohmann::json  build_diagnostics_payload(std::string section = {});
  nlohmann::json  build_update_status_payload();

  // ─── Streaming / golden snapshot helpers ────────────────────────────────────
  constexpr int   kGoldenSnapshotLatestVersion = 2;
  bool            file_exists_nofail(const std::filesystem::path &p);
  std::optional<uint64_t> file_creation_time_ms(const std::filesystem::path &path);
  std::vector<std::filesystem::path> golden_snapshot_candidates();
  std::optional<nlohmann::json> read_json_file_nofail(const std::filesystem::path &path);
  std::optional<int> parse_snapshot_version(const nlohmann::json &root);
  bool            snapshot_has_layout_data(const nlohmann::json &root);
  std::filesystem::path windows_color_profile_dir();

  // ─── Playnite / log helpers (defined in confighttp_playnite.cpp) ─────────────
  bool            is_helper_log_source(const std::string &source);
  bool            read_helper_log(const std::string &source, std::string &out);
  void            enhance_app_with_playnite_cover(nlohmann::json &input_tree);

} // namespace confighttp
