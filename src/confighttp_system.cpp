
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
#include "couch_coop.h"
#include "couch_coop_http.h"
#include "crypto.h"
#include "file_handler.h"
#include "globals.h"
#include "http_auth.h"
#include "httpcommon.h"
#include "platform/common.h"
#include "logging.h"
#include "network.h"
#include "system_metrics.h"
#include "watchdog.h"
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
#include "turbo_input_server.h"
#include "nat_traversal.h"
#include "upnp.h"
#include "update.h"
#include "uuid.h"
#include "version_compare.h"

#ifdef _WIN32
#include "platform/windows/cfgmgr32_cloak.h"
#include "platform/windows/misc.h"
#include "platform/windows/usbip_dualsense_backend.h"
#include <windows.h>
#endif

namespace confighttp {
  using enum SimpleWeb::StatusCode;

  /**
   * @brief Get host readiness checks used by the System view.
   * @api_examples{/api/system/readiness| GET| null}
   */
  void getSystemReadiness(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    const auto apps = visible_apps_for_current_sources(read_apps_array_or_empty());
    const int paired_clients = paired_client_count();
    const int playable_games = playable_game_count(apps);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["overall"] = paired_clients > 0 && playable_games > 0 ? "ready" : "needs_setup";
    output_tree["checks"] = build_system_readiness(paired_clients, playable_games);
    send_response(response, output_tree);
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

#ifdef _WIN32
    platf::autostart::status_t autostart_status;
    std::string autostart_error;
    if (platf::autostart::get_status(autostart_status, autostart_error)) {
      output_tree["unattendedBoot"] = {
        {"autologonEnabled", autostart_status.autologon_enabled},
        {"serviceStartType", autostart_status.service_start_type},
        {"serviceRunning", autostart_status.service_running},
        {"bootPathReady", autostart_status.boot_path_ready}
      };
    } else {
      output_tree["unattendedBoot"] = {
        {"autologonEnabled", false},
        {"serviceStartType", "unknown"},
        {"serviceRunning", false},
        {"bootPathReady", false},
        {"error", autostart_error}
      };
    }
#endif

    send_response(response, output_tree);
  }

  nlohmann::json build_serverinfo_compat_payload() {
    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["status_code"] = 200;
    output_tree["hostname"] = config::nvhttp.sunshine_name;
    output_tree["appversion"] = nvhttp::VERSION;
    output_tree["GfeVersion"] = nvhttp::GFE_VERSION;
    output_tree["ports"] = {
      {"https", net::map_port(confighttp::PORT_HTTPS)},
      {"nvhttp", net::map_port(nvhttp::PORT_HTTP)},
      {"nvhttps", net::map_port(nvhttp::PORT_HTTPS)}
    };

    const int current_appid = proc::proc.running();
    output_tree["currentgame"] = current_appid;
    output_tree["currentgameuuid"] = proc::proc.get_running_app_uuid();
    output_tree["state"] = current_appid > 0 ? "SUNSHINE_SERVER_BUSY" : "SUNSHINE_SERVER_FREE";
    output_tree["api"] = {
      {"authStatus", "/api/auth/status"},
      {"serverStatus", "/api/server/status"},
      {"setupStatus", "/api/setup/status"}
    };
    return output_tree;
  }

  /**
   * @brief Public compatibility liveness endpoint for local discovery probes.
   * @api_examples{/serverinfo| GET| null}
   */
  void getServerInfo(resp_https_t response, req_https_t request) {
    print_req(request);
    send_response(response, build_serverinfo_compat_payload());
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
   * @brief Lightweight real-time system metrics for Flutter dashboard polling.
   * @api_endpoint{/api/system/metrics}
   * @api_method{GET}
   * @api_examples{/api/system/metrics| GET| {"timestamp":...,"cpu":{},"memory":{},"gpu":{},"network":{}}}
   */
  void getSystemMetrics(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    auto metrics = system_metrics::collect();
    send_response(response, metrics);
  }

  /**
   * @brief Get unattended startup status (AutoLogon + service startup readiness).
   * @api_examples{/api/system/autostart/status| GET| null}
   */
  void getSystemWatchdog(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    send_response(response, watchdog::evaluate_status());
  }

  void postSystemWatchdogCleanup(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json") ||
        !authorize(response, request, rbac::Role::admin)) {
      return;
    }
    const auto body = parse_json_request_body(request);
    std::vector<std::string> targets;
    if (body.contains("targets") && body["targets"].is_array()) {
      for (const auto &item : body["targets"]) {
        if (item.is_string()) {
          targets.push_back(item.get<std::string>());
        }
      }
    }
    send_response(response, watchdog::cleanup_targets(targets));
  }

  void getAutoStartStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    print_req(request);

    nlohmann::json output_tree;
    output_tree["status"] = true;
    output_tree["supported"] = true;

    platf::autostart::status_t autostart_status;
    std::string error;
    if (!platf::autostart::get_status(autostart_status, error)) {
      output_tree["status"] = false;
      output_tree["error"] = error.empty() ? "Failed to query unattended startup status." : error;
      send_response(response, output_tree);
      return;
    }

    output_tree["autologon"] = {
      {"enabled", autostart_status.autologon_enabled},
      {"username", autostart_status.username},
      {"domain", autostart_status.domain}
    };
    output_tree["service"] = {
      {"exists", autostart_status.service_exists},
      {"running", autostart_status.service_running},
      {"startType", autostart_status.service_start_type}
    };
    output_tree["backendStartupReady"] = autostart_status.backend_startup_ready;
    output_tree["bootPathReady"] = autostart_status.boot_path_ready;
    output_tree["warning"] = autostart_status.warning;
    send_response(response, output_tree);
  }

  /**
   * @brief Enable native Windows AutoLogon using LSA-protected password storage.
   * @api_examples{/api/system/autostart/enable| POST| {"username":"...","password":"...","domain":"..."}}
   */
  void postEnableAutoStart(resp_https_t response, req_https_t request) {
    if (!validateContentType(response, request, "application/json")) {
      return;
    }
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    nlohmann::json body;
    try {
      body = parse_json_request_body(request);
      if (!body.is_object()) {
        bad_request(response, request, "Invalid JSON body");
        return;
      }
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    const auto username = trim_copy(json_string_value(body, "username"));
    const auto password = json_string_value(body, "password");
    const auto domain = trim_copy(json_string_value(body, "domain"));

    if (username.empty()) {
      bad_request(response, request, "username is required");
      return;
    }
    if (password.empty()) {
      bad_request(response, request, "password is required");
      return;
    }

    std::string error;
    nlohmann::json output_tree;
    if (!platf::autostart::enable_autologon(username, domain, password, error)) {
      output_tree["status"] = false;
      output_tree["error"] = error.empty() ? "Failed to enable AutoLogon." : error;
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["message"] = "AutoLogon enabled.";
    send_response(response, output_tree);
  }

  /**
   * @brief Disable native Windows AutoLogon.
   * @api_examples{/api/system/autostart/disable| POST| null}
   */
  void postDisableAutoStart(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    print_req(request);

    std::string error;
    nlohmann::json output_tree;
    if (!platf::autostart::disable_autologon(error)) {
      output_tree["status"] = false;
      output_tree["error"] = error.empty() ? "Failed to disable AutoLogon." : error;
      send_response(response, output_tree);
      return;
    }

    output_tree["status"] = true;
    output_tree["message"] = "AutoLogon disabled.";
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
#ifdef _WIN32
      bool installed = platf::is_vigem_installed(&version);
      WCHAR sys_dir[MAX_PATH] = {0};
      const UINT sys_len = GetSystemDirectoryW(sys_dir, _countof(sys_dir));
      std::filesystem::path driver_path;
      if (sys_len > 0 && sys_len < _countof(sys_dir)) {
        driver_path = std::filesystem::path {sys_dir} / L"drivers" / L"ViGEmBus.sys";
      }
      const bool driver_file_present = !driver_path.empty() && std::filesystem::exists(driver_path);
      WCHAR exe_path[MAX_PATH] = {0};
      std::filesystem::path install_root;
      if (GetModuleFileNameW(nullptr, exe_path, _countof(exe_path)) > 0) {
        install_root = std::filesystem::path {exe_path}.parent_path();
      }
      const bool installer_present = !install_root.empty() && std::filesystem::exists(
        install_root / L"scripts" / L"vigembus_installer.exe"
      );
      bool service_present = false;
      bool service_running = false;
      if (SC_HANDLE scm = OpenSCManagerW(nullptr, nullptr, SC_MANAGER_CONNECT)) {
        if (SC_HANDLE service = OpenServiceW(scm, L"ViGEmBus", SERVICE_QUERY_STATUS)) {
          service_present = true;
          SERVICE_STATUS_PROCESS status {};
          DWORD bytes_needed = 0;
          if (QueryServiceStatusEx(
                service,
                SC_STATUS_PROCESS_INFO,
                reinterpret_cast<LPBYTE>(&status),
                sizeof(status),
                &bytes_needed
              )) {
            service_running = status.dwCurrentState == SERVICE_RUNNING;
          }
          CloseServiceHandle(service);
        }
        CloseServiceHandle(scm);
      }
#else
      bool installed = false;
      bool driver_file_present = false;
      bool installer_present = false;
      bool service_present = false;
      bool service_running = false;
#endif
      nlohmann::json out;
      out["installed"] = installed;
      out["driverFilePresent"] = driver_file_present;
      out["servicePresent"] = service_present;
      out["serviceRunning"] = service_running;
      out["installerPresent"] = installer_present;
      if (!version.empty()) {
        out["version"] = version;
      }
      send_response(response, out);
    } catch (...) {
      bad_request(response, request, "Failed to evaluate ViGEm health");
    }
  }

  /**
   * POST /api/wol
   * Send a Wake-on-LAN magic packet to a target MAC address.
   * Body: { "mac": "AA:BB:CC:DD:EE:FF", "broadcast": "255.255.255.255", "port": 9 }
   * Requires: wake permission
   */
  void postWakeOnLan(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Perm::wake)) {
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

    bool all_zero = true;
    bool all_ff = true;
    for (int i = 0; i < 6; ++i) {
      if (mac[i] != 0x00) all_zero = false;
      if (mac[i] != 0xFF) all_ff = false;
    }
    if (all_zero || all_ff) {
      bad_request(response, request, "Invalid placeholder MAC address");
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

    const std::vector<unsigned short> ports = {
      static_cast<unsigned short>(port),
      9,
      7,
    };

    bool any_sent = false;
    for (int burst = 0; burst < 3; ++burst) {
      for (const auto p : ports) {
        boost::asio::ip::udp::endpoint endpoint(addr, p);
        udp_socket.send_to(boost::asio::buffer(magic_packet, 102), endpoint, 0, ec);
        if (!ec) {
          any_sent = true;
        }
      }
    }

    // Also send directed subnet broadcast on the primary LAN interface
    const auto local_ip = platf::get_local_ip_for_gateway();
    if (!local_ip.empty()) {
      const auto last_dot = local_ip.rfind('.');
      if (last_dot != std::string::npos) {
        const auto subnet_bcast = local_ip.substr(0, last_dot + 1) + "255";
        boost::system::error_code bcast_ec;
        const auto bcast_addr = boost::asio::ip::make_address(subnet_bcast, bcast_ec);
        const auto bind_addr = boost::asio::ip::make_address(local_ip, bcast_ec);
        if (!bcast_ec) {
          boost::asio::ip::udp::socket iface_sock(io_ctx);
          if (!iface_sock.open(boost::asio::ip::udp::v4(), bcast_ec)) {
            iface_sock.set_option(boost::asio::socket_base::broadcast(true), bcast_ec);
            iface_sock.bind(boost::asio::ip::udp::endpoint(bind_addr, 0), bcast_ec);
            for (const auto p : ports) {
              iface_sock.send_to(
                boost::asio::buffer(magic_packet, 102),
                boost::asio::ip::udp::endpoint(bcast_addr, p),
                0,
                bcast_ec
              );
              if (!bcast_ec) {
                any_sent = true;
              }
            }
          }
        }
      }
    }

    udp_socket.close();

    if (!any_sent) {
      bad_request(response, request, "Failed to send packet: " + ec.message());
      return;
    }

    BOOST_LOG(info) << "WoL: magic packet sent to " << mac_str << " via " << broadcast_addr << ":" << port;

    nlohmann::json output;
    output["status"] = true;
    output["mac"] = mac_str;
    output["broadcast"] = broadcast_addr;
    output["port"] = port;
    send_response(response, output);
  }

  /**
   * @brief Unified Jujo Input Turbo telemetry across Turbo UDP/TCP, ViGEm, USB/IP DualSense, and cfgmgr32 cloak.
   * @api_examples{/api/health/input| GET| {"inputBackend":"auto","gamepad":"auto","turboInput":{...},"vigem":{...},"usbipUde":{...},"cfgmgr32Cloak":{...}}}
   */
  void getInputHealth(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    try {
      const auto ts = turbo_input::server().stats();
      std::string vigem_version;
#ifdef _WIN32
      const bool vigem_installed = platf::is_vigem_installed(&vigem_version);
      const auto usbip = platf::get_usbip_backend_health();
      const std::size_t cloaked_count = platf::gamepad_cloak::cloaked_count();
#else
      const bool vigem_installed = false;
      struct {
        bool driver_installed = false;
        std::uint16_t loopback_port = 0;
        std::size_t active_slots = 0;
      } usbip {};
      const std::size_t cloaked_count = 0;
#endif

      nlohmann::json out;
      out["inputBackend"] = config::input.input_backend;
      out["gamepad"] = config::input.gamepad;
      out["vigem"] = {
        {"installed", vigem_installed},
        {"version", vigem_version},
      };
      out["usbipUde"] = {
        {"installed", usbip.driver_installed},
        {"loopbackPort", usbip.loopback_port},
        {"activeSlots", usbip.active_slots},
      };
      out["turboInput"] = {
        {"running", ts.running},
        {"udpPort", ts.udp_port},
        {"tcpPort", ts.tcp_port},
        {"activeSessions", ts.active_sessions},
        {"connectedPeers", ts.connected_peers},
        {"packetsReceived", ts.packets_received},
        {"packetsDroppedAuth", ts.packets_dropped_auth},
        {"packetsDroppedReplay", ts.packets_dropped_replay},
        {"packetsDroppedOoo", ts.packets_dropped_ooo},
        {"buttonEdgeRecoveries", ts.button_edge_recoveries},
        {"feedbackSent", ts.feedback_sent},
        {"lastRttUs", ts.last_rtt_us},
        {"activeTransport", ts.active_transport},
      };
      out["cfgmgr32Cloak"] = {
        {"enabled", config::input.hide_local_gamepads_during_stream},
        {"cloakedCount", cloaked_count},
      };
      send_response(response, out);
    } catch (...) {
      bad_request(response, request, "Failed to evaluate input health");
    }
  }

  namespace {
    nlohmann::json serialize_network_status(nat_traversal::network_status_snapshot_t snap) {
      if (snap.mapped_ports.empty()) {
        snap.mapped_ports = upnp::default_port_expectations();
      }
      nlohmann::json ports_json = nlohmann::json::array();
      for (const auto &p : snap.mapped_ports) {
        ports_json.push_back({
          {"protocol", p.protocol},
          {"lanPort", p.lan_port},
          {"wanPort", p.wan_port},
          {"description", p.description},
          {"method", p.method},
          {"active", p.active},
        });
      }
      nlohmann::json out = nlohmann::json::object();
      out["status"] = true;
      out["autoForwardEnabled"] = config::sunshine.flags.test(config::flag::UPNP);
      out["activeMethod"] = snap.active_method;
      out["upnpActive"] = snap.upnp_active;
      out["pcpActive"] = snap.pcp_active;
      out["natpmpActive"] = snap.natpmp_active;
      out["gatewayIp"] = snap.gateway_ip;
      out["localIp"] = snap.local_ip;
      out["routerWanIp"] = snap.router_wan_ip;
      out["stunPublicIp"] = snap.stun_public_ip;
      out["natType"] = snap.nat_type;
      out["cgnatDetected"] = snap.cgnat_detected;
      out["turboInputUdpPort"] = snap.turbo_input_udp_port;
      out["lastError"] = snap.last_error;
      out["updatedAtMs"] = snap.updated_at_ms;
      out["mappedPorts"] = std::move(ports_json);
      return out;
    }

    std::uint16_t active_turbo_udp_port() {
      const auto p = turbo_input::server().udp_port();
      return p != 0 ? p : net::map_port(turbo_input::kUdpPortOffset);
    }
  }  // namespace

  /**
   * @brief Router auto port-forwarding (UPnP / PCP / NAT-PMP) + STUN CGNAT status.
   * @api_examples{/api/network/status| GET| {"status":true,"autoForwardEnabled":true,"activeMethod":"upnp","cgnatDetected":false,"mappedPorts":[...]}}
   */
  void getNetworkStatus(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    try {
      auto snap = nat_traversal::get_network_status();
      if (snap.updated_at_ms == 0) {
        snap = nat_traversal::reprobe_network_status(
          config::sunshine.flags[config::flag::UPNP],
          active_turbo_udp_port()
        );
      }
      send_response(response, serialize_network_status(std::move(snap)));
    } catch (...) {
      bad_request(response, request, "Failed to evaluate network status");
    }
  }

  /**
   * @brief Forces an immediate UPnP/PCP/NAT-PMP + STUN CGNAT reprobe.
   * @api_examples{/api/network/reprobe| POST| {"status":true,"activeMethod":"pcp","cgnatDetected":false}}
   */
  void postNetworkReprobe(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }
    try {
      auto snap = nat_traversal::reprobe_network_status(
        config::sunshine.flags[config::flag::UPNP],
        active_turbo_udp_port()
      );
      send_response(response, serialize_network_status(std::move(snap)));
    } catch (...) {
      bad_request(response, request, "Failed to reprobe network status");
    }
  }

  void getCoopSessions(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }
    send_response(response, couch_coop_http::serialize_sessions_payload());
  }

  void controlCoopSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Perm::guests)) {
      return;
    }
    if (request->path_match.size() < 2) {
      bad_request(response, request, "Missing session id");
      return;
    }
    const std::string session_id = request->path_match[1].str();

    nlohmann::json body;
    try {
      const auto raw = request->content.string();
      body = raw.empty() ? nlohmann::json::object() : nlohmann::json::parse(raw);
      if (!body.is_object()) {
        bad_request(response, request, "JSON object expected");
        return;
      }
    } catch (...) {
      bad_request(response, request, "Invalid JSON body");
      return;
    }

    const auto auth = check_auth(request);
    const bool caller_is_session_or_token =
      auth.auth_source == AuthSource::session || auth.auth_source == AuthSource::api_token;
    const auto caller_rbac_role = caller_is_session_or_token
      ? std::optional<rbac::Role> {rbac::Role::admin}
      : rbac::registry.get_role(auth.user_id);
    const bool caller_is_admin =
      caller_is_session_or_token || (caller_rbac_role && *caller_rbac_role == rbac::Role::admin);

    const auto result = couch_coop_http::apply_control(session_id, body, caller_is_admin);
    if (result.http_status == 403) {
      SimpleWeb::CaseInsensitiveMultimap headers;
      headers.emplace("Content-Type", "application/json");
      response->write(SimpleWeb::StatusCode::client_error_forbidden, result.payload.dump(), headers);
      return;
    }
    if (result.http_status >= 400) {
      bad_request(response, request, result.payload.value("error", "Request rejected"));
      return;
    }
    send_response(response, result.payload);
  }

} // namespace confighttp
