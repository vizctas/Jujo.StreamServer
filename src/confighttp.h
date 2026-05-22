/**
 * @file src/confighttp.h
 * @brief Declarations for the Web UI Config HTTP server.
 */
#pragma once

// standard includes
#include <chrono>
#include <functional>
#include <map>
#include <set>
#include <string>
#include <unordered_map>

// third-party includes
#include <nlohmann/json.hpp>
#include <unordered_map>

// local includes
#include "http_auth.h"
#include "nvhttp.h"
#include "server_rbac.h"
#include "thread_safe.h"

#include <Simple-Web-Server/server_https.hpp>

#define WEB_DIR SUNSHINE_ASSETS_DIR "/web/"

using namespace std::chrono_literals;

namespace confighttp {
  using resp_https_t = std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Response>;
  using req_https_t = std::shared_ptr<typename SimpleWeb::ServerBase<SimpleWeb::HTTPS>::Request>;

  constexpr auto PORT_HTTPS = 1;
  constexpr auto SESSION_EXPIRE_DURATION = 24h * 15;
  void start();

  // Token scopes for API tokens used by tests and UI
  enum class TokenScope {
    Read,  ///< Read-only scope: allows GET/HEAD style operations
    Write  ///< Read-write scope: allows modifying operations (POST/PUT/DELETE)
  };

  // Authentication helpers
  AuthResult check_auth(const req_https_t &request);
  bool authenticate(resp_https_t response, req_https_t request);

  // Token scope helpers
  TokenScope scope_from_string(std::string_view s);
  std::string scope_to_string(TokenScope scope);

  // Web UI endpoints
  void generateApiToken(resp_https_t response, req_https_t request);
  void listApiTokens(resp_https_t response, req_https_t request);
  void revokeApiToken(resp_https_t response, req_https_t request);
  void getTokenPage(resp_https_t response, req_https_t request);
  void loginUser(resp_https_t response, req_https_t request);
  void refreshSession(resp_https_t response, req_https_t request);
  void authStatus(resp_https_t response, req_https_t request);
  void logoutUser(resp_https_t response, req_https_t request);
  void getSpaEntry(resp_https_t response, req_https_t request);

  // Writes the apps file and refreshes the client-visible app cache/list.
  bool refresh_client_apps_cache(nlohmann::json &file_tree, bool sort_by_name = true);

  // Authentication functions
  AuthResult check_auth(const req_https_t &request);
  bool authenticate(resp_https_t response, req_https_t request);

  TokenScope scope_from_string(std::string_view s);
  std::string scope_to_string(TokenScope scope);


  // Split handlers
  void listSessions(resp_https_t response, req_https_t request);
  void revokeSession(resp_https_t response, req_https_t request);
  void postCloudPair(resp_https_t response, req_https_t request);
  void getOTP(resp_https_t response, req_https_t request);
  void getRbacClients(resp_https_t response, req_https_t request);
  void patchRbacClient(resp_https_t response, req_https_t request);
  void deleteRbacClient(resp_https_t response, req_https_t request);
  void savePin(resp_https_t response, req_https_t request);
  void listApiTokenRoutes(resp_https_t response, req_https_t request);
  void login(resp_https_t response, req_https_t request);
  void savePassword(resp_https_t response, req_https_t request);
  void getApps(resp_https_t response, req_https_t request);
  void saveApp(resp_https_t response, req_https_t request);
  void deleteApp(resp_https_t response, req_https_t request);
  void getAppCover(resp_https_t response, req_https_t request);
  void reorderApps(resp_https_t response, req_https_t request);
  void getGameSources(resp_https_t response, req_https_t request);
  void postGameSourceConnect(resp_https_t response, req_https_t request);
  void postGameSourceSync(resp_https_t response, req_https_t request);
  void postGameSourceDisconnect(resp_https_t response, req_https_t request);
  void getLibraryGames(resp_https_t response, req_https_t request);
  void postLibraryArtAutoscan(resp_https_t response, req_https_t request);
  void getLibraryArtAutoscanStatus(resp_https_t response, req_https_t request);
  void postLibraryArtScanOne(resp_https_t response, req_https_t request);
  void postLibraryArtApply(resp_https_t response, req_https_t request);
  void postSteamAuthStart(resp_https_t response, req_https_t request);
  void postEpicAuthStart(resp_https_t response, req_https_t request);
  void getSteamAuthCallback(resp_https_t response, req_https_t request);
  void getGogAuthCallback(resp_https_t response, req_https_t request);
  void postSteamWebLibrary(resp_https_t response, req_https_t request);
  void getSteamPrefetchProgress(resp_https_t response, req_https_t request);
  void getSteamPoster(resp_https_t response, req_https_t request);
  void getSteamLocalArtManifest(resp_https_t response, req_https_t request);
  void getSteamLocalArtFile(resp_https_t response, req_https_t request);
  void postPlaynitePurgeApps(resp_https_t response, req_https_t request);
  void purgeAutoSyncedApps(resp_https_t response, req_https_t request);
  void uploadCover(resp_https_t response, req_https_t request);
  void postLibraryMetadataProviderConnect(resp_https_t response, req_https_t request);
  void getLibraryMetadataStatus(resp_https_t response, req_https_t request);
  void getSystemReadiness(resp_https_t response, req_https_t request);
  void getSystemStatus(resp_https_t response, req_https_t request);
  void getSystemDiagnostics(resp_https_t response, req_https_t request);
  void getSystemMetrics(resp_https_t response, req_https_t request);
  void getAutoStartStatus(resp_https_t response, req_https_t request);
  void postEnableAutoStart(resp_https_t response, req_https_t request);
  void postDisableAutoStart(resp_https_t response, req_https_t request);
  void getUpdateStatus(resp_https_t response, req_https_t request);
  void postUpdateCheck(resp_https_t response, req_https_t request);
  void getLogs(resp_https_t response, req_https_t request);
  void getVigemHealth(resp_https_t response, req_https_t request);
  void postWakeOnLan(resp_https_t response, req_https_t request);

  // Playnite handlers (confighttp_playnite.cpp)
  void launchLocalApp(resp_https_t response, req_https_t request);
  void getPlayniteStatus(resp_https_t response, req_https_t request);
  void getPlayniteGames(resp_https_t response, req_https_t request);
  void getPlayniteCategories(resp_https_t response, req_https_t request);
  void installPlaynite(resp_https_t response, req_https_t request);
  void uninstallPlaynite(resp_https_t response, req_https_t request);
  void postPlayniteForceSync(resp_https_t response, req_https_t request);
  void postPlayniteLaunch(resp_https_t response, req_https_t request);
  void downloadPlayniteLogs(resp_https_t response, req_https_t request);
  void getCrashDumpStatus(resp_https_t response, req_https_t request);
  void postCrashDumpDismiss(resp_https_t response, req_https_t request);
  void getCrashBundleManifest(resp_https_t response, req_https_t request);
  void downloadCrashBundle(resp_https_t response, req_https_t request);

  // RTSS / Lossless (confighttp_rtss.cpp)
  void getRtssStatus(resp_https_t response, req_https_t request);
  void getLosslessScalingStatus(resp_https_t response, req_https_t request);
  void listWebRTCSessions(resp_https_t response, req_https_t request);
  void createWebRTCSession(resp_https_t response, req_https_t request);
  void getWebRTCSession(resp_https_t response, req_https_t request);
  void deleteWebRTCSession(resp_https_t response, req_https_t request);
  void postWebRTCOffer(resp_https_t response, req_https_t request);
  void getWebRTCAnswer(resp_https_t response, req_https_t request);
  void postWebRTCIce(resp_https_t response, req_https_t request);
  void getWebRTCIce(resp_https_t response, req_https_t request);
  void getWebRTCIceStream(resp_https_t response, req_https_t request);
  void getWebRTCCert(resp_https_t response, req_https_t request);
  void getSessionStatus(resp_https_t response, req_https_t request);
  void getStreamHealth(resp_https_t response, req_https_t request);
  void getServerStatus(resp_https_t response, req_https_t request);
  void launchApp(resp_https_t response, req_https_t request);
  void closeApp(resp_https_t response, req_https_t request);
  void disconnect(resp_https_t response, req_https_t request);
  void getClients(resp_https_t response, req_https_t request);
  void getHdrProfiles(resp_https_t response, req_https_t request);
  void updateClient(resp_https_t response, req_https_t request);
  void unpair(resp_https_t response, req_https_t request);
  void unpairAll(resp_https_t response, req_https_t request);
  void disconnectClient(resp_https_t response, req_https_t request);
  void getDisplayDevices(resp_https_t response, req_https_t request);
  void getFramegenEdidRefresh(resp_https_t response, req_https_t request);
  void postExportGoldenDisplay(resp_https_t response, req_https_t request);
  void postRestoreDisplay(resp_https_t response, req_https_t request);
  void getGoldenStatus(resp_https_t response, req_https_t request);
  void deleteGolden(resp_https_t response, req_https_t request);
  void getConfig(resp_https_t response, req_https_t request);
  void saveConfig(resp_https_t response, req_https_t request);
  void patchConfig(resp_https_t response, req_https_t request);
  void getMetadata(resp_https_t response, req_https_t request);
  void getLocale(resp_https_t response, req_https_t request);
  void restart(resp_https_t response, req_https_t request);
  void quit(resp_https_t response, req_https_t request);
  void resetDisplayDevicePersistence(resp_https_t response, req_https_t request);

  void print_req(const req_https_t &request);
  void add_cors_headers(SimpleWeb::CaseInsensitiveMultimap &headers);
  void send_response(resp_https_t response, const nlohmann::json &output_tree);
  void write_api_response(resp_https_t response, const APIResponse &api_response);
  void send_unauthorized(resp_https_t response, req_https_t request);
  void send_redirect(resp_https_t response, req_https_t request, const char *path);
  void bad_request(resp_https_t response, req_https_t request, const std::string &error_message = "Bad Request");
  void service_unavailable(resp_https_t response, const std::string &error_message);
  bool authorize(resp_https_t response, req_https_t request, rbac::Role required);
  
  std::string now_iso8601_utc_string();
  bool save_metadata_provider_state(const std::string &provider_id, const nlohmann::json &provider_state);
  nlohmann::json build_library_metadata_status();
  bool vault_encryption_available();
  std::string vault_provider_name();
  bool encrypt_provider_secret(const std::string &plaintext, std::string &ciphertext_hex);
  std::string trim_copy(const std::string &input);
  struct SteamLocalArtEntry {
    std::string type;   // portrait | header | hero | hero_blur | logo | icon
    std::filesystem::path path;
    std::string mime;
  };
  std::vector<SteamLocalArtEntry> find_steam_local_art(const std::string &appid);
  std::filesystem::path steam_local_art_path_for_type(const std::string &appid, const std::string &type);
  std::filesystem::path steam_poster_cache_path(const std::string &appid);
  std::filesystem::path steam_librarycache_game_dir(const std::string &appid);
  bool is_store_game_source(const std::string &source_id);
  bool is_known_game_source(const std::string &source_id);

  using token_route_methods_t = std::map<std::string, std::set<std::string, std::less<>>, std::less<>>;
  token_route_methods_t snapshot_token_route_catalog();
  std::vector<std::string> ordered_methods_for_catalog(const std::set<std::string, std::less<>> &methods);

  std::optional<nlohmann::json> jwt_payload_json(const std::string &jwt);
  size_t write_curl_string_callback(void *contents, size_t size, size_t nmemb, void *userp);

  bool is_playnite_library_entry(const nlohmann::json &app);
  nlohmann::json read_game_source_states();
  nlohmann::json source_state_or_empty(const nlohmann::json &states, const std::string &source_id);
  bool save_game_source_state(const std::string &source_id, const nlohmann::json &source_state);
  bool validateContentType(resp_https_t response, req_https_t request, const std::string_view &contentType);
  nlohmann::json parse_json_request_body(req_https_t request);
  std::string json_string_value(const nlohmann::json &node, const char *key);
  bool checkIPOrigin(resp_https_t response, req_https_t request);

  void getRbacClients(resp_https_t response, req_https_t request);
  void patchRbacClient(resp_https_t response, req_https_t request);
  void deleteRbacClient(resp_https_t response, req_https_t request);
  void getCloudConfig(resp_https_t response, req_https_t request);
  void patchCloudConfig(resp_https_t response, req_https_t request);

  extern std::string sessionCookie;
  extern std::chrono::time_point<std::chrono::steady_clock> cookie_creation_time;

} // namespace confighttp

// mime types map (defined in confighttp.cpp)
namespace confighttp {
  extern const std::map<std::string, std::string> mime_types;
}
