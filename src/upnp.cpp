/**
 * @file src/upnp.cpp
 * @brief Definitions for UPnP port mapping.
 */
// standard includes
#include <stddef.h>  // workaround for type_t error in miniupnpc 2.3.3, see https://github.com/miniupnp/miniupnp/commit/e263ab6f56c382e10fed31347ec68095d691a0e8

// lib includes
#include <cstddef>  // Needed to compile size_t in Windows
#include <miniupnpc/miniupnpc.h>
#include <miniupnpc/upnpcommands.h>

// local includes
#include "config.h"
#include "confighttp.h"
#include "globals.h"
#include "logging.h"
#include "nat_traversal.h"
#include "network.h"
#include "nvhttp.h"
#include "rtsp.h"
#include "stream.h"
#include "turbo_input_server.h"
#include "upnp.h"
#include "utility.h"
#include "webrtc_ice.h"

#include <memory>
#include <mutex>

using namespace std::literals;

namespace upnp {

  struct mapping_t {
    struct {
      std::string wan;
      std::string lan;
      std::string proto;
    } port;

    std::string description;
  };

  static std::string_view status_string(int status) {
    switch (status) {
      case 0:
        return "No IGD device found"sv;
      case 1:
        return "Valid IGD device found"sv;
      case 2:
        return "Valid IGD device found,  but it isn't connected"sv;
      case 3:
        return "A UPnP device has been found,  but it wasn't recognized as an IGD"sv;
    }

    return "Unknown status"sv;
  }

  /**
   * This function is a wrapper around UPNP_GetValidIGD() that returns the status code. There is a pre-processor
   * check to determine which version of the function to call based on the version of the MiniUPnPc library.
   */
  int UPNP_GetValidIGDStatus(device_t &device, urls_t *urls, IGDdatas *data, std::array<char, INET6_ADDRESS_STRLEN> &lan_addr) {
#if (MINIUPNPC_API_VERSION >= 18)
    return UPNP_GetValidIGD(device.get(), &urls->el, data, lan_addr.data(), lan_addr.size(), nullptr, 0);
#else
    return UPNP_GetValidIGD(device.get(), &urls->el, data, lan_addr.data(), lan_addr.size());
#endif
  }

  class deinit_t: public platf::deinit_t {
  public:
    struct fallback_lease_t {
      nat_traversal::mapping_method_e method = nat_traversal::mapping_method_e::none;
      nat_traversal::proto_e proto = nat_traversal::proto_e::udp;
      std::uint16_t internal_port = 0;
      std::uint16_t external_port = 0;
      std::array<std::uint8_t, 12> pcp_nonce {};
    };

    struct mapping_ctx_t {
      std::mutex mutex;
      std::vector<mapping_t> mappings;
      std::vector<std::array<std::uint8_t, 12>> pcp_nonces;
      bool upnp_mapped = false;
      IGDdatas data {};
      urls_t mapped_urls;
      std::vector<fallback_lease_t> fallback_leases;
    };

    static std::uint16_t resolve_turbo_input_udp_port() {
      const auto active_port = turbo_input::server().udp_port();
      return active_port != 0 ? active_port : net::map_port(turbo_input::kUdpPortOffset);
    }

    static std::uint16_t parse_port_u16(const std::string &s) {
      try {
        return static_cast<std::uint16_t>(std::stoi(s));
      } catch (...) {
        return 0;
      }
    }

    static std::vector<nat_traversal::mapped_port_status_t> build_inactive_ports(
      const std::vector<mapping_t> &mappings
    ) {
      std::vector<nat_traversal::mapped_port_status_t> out;
      out.reserve(mappings.size());
      for (const auto &m : mappings) {
        out.push_back({
          m.port.proto,
          parse_port_u16(m.port.lan),
          parse_port_u16(m.port.wan),
          m.description,
          "none",
          false,
        });
      }
      return out;
    }

    static void unmap_fallback_leases(
      const std::string &gateway_ip,
      const std::string &local_ip,
      std::vector<fallback_lease_t> &leases
    ) {
      if (leases.empty() || gateway_ip.empty()) {
        leases.clear();
        return;
      }
      for (const auto &lease : leases) {
        if (lease.method == nat_traversal::mapping_method_e::pcp) {
          nat_traversal::send_pcp_map(
            gateway_ip,
            local_ip,
            lease.pcp_nonce,
            lease.proto,
            lease.internal_port,
            lease.external_port,
            0
          );
        } else if (lease.method == nat_traversal::mapping_method_e::natpmp) {
          nat_traversal::send_natpmp_map(
            gateway_ip,
            lease.proto,
            lease.internal_port,
            lease.external_port,
            0
          );
        }
      }
      leases.clear();
    }

    static bool try_map_pcp(
      mapping_ctx_t &ctx,
      const std::string &gateway_ip,
      const std::string &local_ip,
      nat_traversal::network_status_snapshot_t &snap,
      const std::shared_ptr<safe::event_t<bool>> &shutdown_event
    ) {
      if (gateway_ip.empty() || local_ip.empty()) {
        return false;
      }
      std::vector<fallback_lease_t> new_leases;
      std::vector<nat_traversal::mapped_port_status_t> new_ports;
      bool any_ok = false;

      for (std::size_t i = 0; i < ctx.mappings.size(); ++i) {
        if (shutdown_event && shutdown_event->peek()) {
          break;
        }
        const auto &m = ctx.mappings[i];
        const auto proto = (m.port.proto == "UDP") ? nat_traversal::proto_e::udp : nat_traversal::proto_e::tcp;
        const auto lan_port = parse_port_u16(m.port.lan);
        const auto wan_port = parse_port_u16(m.port.wan);
        std::string err;
        const auto res = nat_traversal::send_pcp_map(
          gateway_ip,
          local_ip,
          ctx.pcp_nonces[i],
          proto,
          lan_port,
          wan_port,
          nat_traversal::kDefaultMappingLifetimeSec,
          "",
          &err
        );
        if (!res || res->result_code != 0) {
          if (i == 0) {
            if (!err.empty()) {
              snap.last_error = err;
            }
            return false;
          }
          new_ports.push_back({m.port.proto, lan_port, 0, m.description, "pcp", false});
          continue;
        }

        any_ok = true;
        if (!res->assigned_external_ip.empty() && res->assigned_external_ip != "0.0.0.0") {
          snap.router_wan_ip = res->assigned_external_ip;
        }
        new_leases.push_back({
          nat_traversal::mapping_method_e::pcp,
          proto,
          lan_port,
          res->assigned_external_port,
          ctx.pcp_nonces[i],
        });
        new_ports.push_back({
          m.port.proto,
          lan_port,
          res->assigned_external_port,
          m.description,
          "pcp",
          true,
        });
      }

      if (any_ok) {
        ctx.fallback_leases = std::move(new_leases);
        snap.mapped_ports = std::move(new_ports);
        snap.pcp_active = true;
        snap.active_method = "pcp";
        BOOST_LOG(info) << "Completed PCP port mappings via gateway "sv << gateway_ip;
      }
      return any_ok;
    }

    static bool try_map_natpmp(
      mapping_ctx_t &ctx,
      const std::string &gateway_ip,
      nat_traversal::network_status_snapshot_t &snap,
      const std::shared_ptr<safe::event_t<bool>> &shutdown_event
    ) {
      if (gateway_ip.empty()) {
        return false;
      }
      std::string ext_err;
      if (const auto ext_ip = nat_traversal::probe_natpmp_external_ip(gateway_ip, &ext_err)) {
        snap.router_wan_ip = *ext_ip;
      } else if (snap.last_error.empty() && !ext_err.empty()) {
        snap.last_error = ext_err;
      }

      std::vector<fallback_lease_t> new_leases;
      std::vector<nat_traversal::mapped_port_status_t> new_ports;
      bool any_ok = false;

      for (std::size_t i = 0; i < ctx.mappings.size(); ++i) {
        if (shutdown_event && shutdown_event->peek()) {
          break;
        }
        const auto &m = ctx.mappings[i];
        const auto proto = (m.port.proto == "UDP") ? nat_traversal::proto_e::udp : nat_traversal::proto_e::tcp;
        const auto lan_port = parse_port_u16(m.port.lan);
        const auto wan_port = parse_port_u16(m.port.wan);
        std::string err;
        const auto res = nat_traversal::send_natpmp_map(
          gateway_ip,
          proto,
          lan_port,
          wan_port,
          nat_traversal::kDefaultMappingLifetimeSec,
          &err
        );
        if (!res || res->result_code != 0) {
          if (i == 0) {
            if (!err.empty()) {
              snap.last_error = err;
            }
            return false;
          }
          new_ports.push_back({m.port.proto, lan_port, 0, m.description, "natpmp", false});
          continue;
        }

        any_ok = true;
        new_leases.push_back({
          nat_traversal::mapping_method_e::natpmp,
          proto,
          lan_port,
          res->external_port,
          {},
        });
        new_ports.push_back({
          m.port.proto,
          lan_port,
          res->external_port,
          m.description,
          "natpmp",
          true,
        });
      }

      if (any_ok) {
        ctx.fallback_leases = std::move(new_leases);
        snap.mapped_ports = std::move(new_ports);
        snap.natpmp_active = true;
        snap.active_method = "natpmp";
        BOOST_LOG(info) << "Completed NAT-PMP port mappings via gateway "sv << gateway_ip;
      }
      return any_ok;
    }

    deinit_t() {
      ctx_ = std::make_shared<mapping_ctx_t>();
      for (const auto &entry : default_port_expectations()) {
        const auto p = std::to_string(entry.lan_port);
        ctx_->mappings.emplace_back(mapping_t {{p, p, entry.protocol}, entry.description});
      }

      ctx_->pcp_nonces.resize(ctx_->mappings.size());
      for (auto &n : ctx_->pcp_nonces) {
        n = nat_traversal::generate_random_id12();
      }

      std::weak_ptr<mapping_ctx_t> weak_ctx = ctx_;
      nat_traversal::set_reprobe_handler([weak_ctx]() {
        if (auto locked = weak_ctx.lock()) {
          return refresh_all_and_publish(*locked, nullptr);
        }
        return nat_traversal::get_network_status();
      });

      // Start the mapping thread
      upnp_thread = std::thread {&deinit_t::upnp_thread_proc, this};
    }

    ~deinit_t() {
      nat_traversal::set_reprobe_handler({});
      upnp_thread.join();
    }

    /**
     * @brief Opens pinholes for IPv6 traffic if the IGD is capable.
     * @details Not many IGDs support this feature, so we perform error logging with debug level.
     * @return `true` if the pinholes were opened successfully.
     */
    static bool create_ipv6_pinholes(const std::vector<mapping_t> &mappings) {
      int err;
      device_t device {upnpDiscover(2000, nullptr, nullptr, 0, IPv6, 2, &err)};
      if (!device || err) {
        BOOST_LOG(debug) << "Couldn't discover any IPv6 UPNP devices"sv;
        return false;
      }

      IGDdatas data;
      urls_t urls;
      std::array<char, INET6_ADDRESS_STRLEN> lan_addr;
      auto status = upnp::UPNP_GetValidIGDStatus(device, &urls, &data, lan_addr);
      if (status != 1 && status != 2) {
        BOOST_LOG(debug) << "No valid IPv6 IGD: "sv << status_string(status);
        return false;
      }

      if (data.IPv6FC.controlurl[0] != 0) {
        int firewallEnabled, pinholeAllowed;

        // Check if this firewall supports IPv6 pinholes
        err = UPNP_GetFirewallStatus(urls->controlURL_6FC, data.IPv6FC.servicetype, &firewallEnabled, &pinholeAllowed);
        if (err == UPNPCOMMAND_SUCCESS) {
          BOOST_LOG(debug) << "UPnP IPv6 firewall control available. Firewall is "sv
                           << (firewallEnabled ? "enabled"sv : "disabled"sv)
                           << ", pinhole is "sv
                           << (pinholeAllowed ? "allowed"sv : "disallowed"sv);

          if (pinholeAllowed) {
            // Create pinholes for each port
            auto mapping_period = std::to_string(PORT_MAPPING_LIFETIME.count());
            auto shutdown_event = mail::man->event<bool>(mail::shutdown);

            for (auto it = std::begin(mappings); it != std::end(mappings) && !shutdown_event->peek(); ++it) {
              auto mapping = *it;
              char uniqueId[8];

              // Open a pinhole for the LAN port, since there will be no WAN->LAN port mapping on IPv6
              err = UPNP_AddPinhole(urls->controlURL_6FC, data.IPv6FC.servicetype, "", "0", lan_addr.data(), mapping.port.lan.c_str(), mapping.port.proto.c_str(), mapping_period.c_str(), uniqueId);
              if (err == UPNPCOMMAND_SUCCESS) {
                BOOST_LOG(debug) << "Successfully created pinhole for "sv << mapping.port.proto << ' ' << mapping.port.lan;
              } else {
                BOOST_LOG(debug) << "Failed to create pinhole for "sv << mapping.port.proto << ' ' << mapping.port.lan << ": "sv << err;
              }
            }

            return err == 0;
          } else {
            BOOST_LOG(debug) << "IPv6 pinholes are not allowed by the IGD"sv;
            return false;
          }
        } else {
          BOOST_LOG(debug) << "Failed to get IPv6 firewall status: "sv << err;
          return false;
        }
      } else {
        BOOST_LOG(debug) << "IPv6 Firewall Control is not supported by the IGD"sv;
        return false;
      }
    }

    /**
     * @brief True if `host:port` accepts a TCP connection within a short timeout.
     */
    static bool host_accepts_tcp(const std::string &host, const std::string &port) {
      boost::system::error_code ec;
      const auto address = boost::asio::ip::make_address(host, ec);
      const auto port_num = std::atoi(port.c_str());
      if (ec || port_num <= 0 || port_num > 65535) {
        return false;
      }
      boost::asio::io_context io;
      boost::asio::ip::tcp::socket sock(io);
      boost::system::error_code result = boost::asio::error::would_block;
      sock.async_connect({address, static_cast<unsigned short>(port_num)}, [&](const boost::system::error_code &e) {
        result = e;
      });
      io.run_for(1s);
      return !result;
    }

    /**
     * @brief Maps a port via UPnP.
     * @param data IGDdatas from UPNP_GetValidIGD()
     * @param urls urls_t from UPNP_GetValidIGD()
     * @param lan_addr Local IP address to map to
     * @param mapping Information about port to map
     * @return `true` on success.
     */
    static bool map_upnp_port(const IGDdatas &data, const urls_t &urls, const std::string &lan_addr, const mapping_t &mapping) {
      char intClient[16];
      char intPort[6];
      char desc[80];
      char enabled[4];
      char leaseDuration[16];
      bool indefinite = false;

      // First check if this port is already mapped successfully
      BOOST_LOG(debug) << "Checking for existing UPnP port mapping for "sv << mapping.port.wan;
      auto err = UPNP_GetSpecificPortMappingEntry(
        urls->controlURL,
        data.first.servicetype,
        // In params
        mapping.port.wan.c_str(),
        mapping.port.proto.c_str(),
        nullptr,
        // Out params
        intClient,
        intPort,
        desc,
        enabled,
        leaseDuration
      );
      if (err == 714) {  // NoSuchEntryInArray
        BOOST_LOG(debug) << "Mapping entry not found for "sv << mapping.port.wan;
      } else if (err == UPNPCOMMAND_SUCCESS) {
        // Some routers change the description, so we can't check that here
        if (!std::strcmp(intClient, lan_addr.c_str())) {
          if (std::atoi(leaseDuration) == 0) {
            BOOST_LOG(debug) << "Static mapping entry found for "sv << mapping.port.wan;

            // It's a static mapping, so we're done here
            return true;
          } else {
            BOOST_LOG(debug) << "Mapping entry found for "sv << mapping.port.wan << " ("sv << leaseDuration << " seconds remaining)"sv;
          }
        } else {
          // Another LAN host (typically a second server behind the same NAT) owns this WAN port.
          // Stealing it from a live host made both servers flip the port on every refresh, so
          // neither stayed reachable remotely. Only reclaim it when that host is gone (asleep/off).
          // A live owner renews every REFRESH_INTERVAL, so a recently restarted lease proves it is alive
          // whatever its port base; probing a port only works for static (lease 0) mappings.
          const auto lease = std::atoi(leaseDuration);
          const auto probe_port = mapping.port.proto == "TCP"sv ? std::string {intPort} : std::to_string(net::map_port(nvhttp::PORT_HTTP));
          const bool owner_live = lease > 0 ? lease >= (PORT_MAPPING_LIFETIME - 3 * REFRESH_INTERVAL).count() : host_accepts_tcp(intClient, probe_port);
          if (owner_live) {
            BOOST_LOG(warning) << "UPnP port "sv << mapping.port.proto << ' ' << mapping.port.wan
                               << " is owned by live host "sv << intClient << "; not taking it over (use a different `port` base for this server)"sv;
            return false;
          }

          BOOST_LOG(warning) << "UPnP conflict with unreachable host "sv << intClient << "; reclaiming "sv << mapping.port.proto << ' ' << mapping.port.wan;

          // Some UPnP IGDs won't let unauthenticated clients delete other conflicting port mappings
          // for security reasons, but we will give it a try anyway.
          err = UPNP_DeletePortMapping(
            urls->controlURL,
            data.first.servicetype,
            mapping.port.wan.c_str(),
            mapping.port.proto.c_str(),
            nullptr
          );
          if (err) {
            BOOST_LOG(error) << "Unable to delete conflicting UPnP port mapping: "sv << err;
            return false;
          }
        }
      } else {
        BOOST_LOG(error) << "UPNP_GetSpecificPortMappingEntry() failed: "sv << err;

        // If we get a strange error from the router, we'll assume it's some old broken IGDv1
        // device and only use indefinite lease durations to hopefully avoid confusing it.
        if (err != 606) {  // Unauthorized
          indefinite = true;
        }
      }

      // Add/update the port mapping
      auto mapping_period = std::to_string(indefinite ? 0 : PORT_MAPPING_LIFETIME.count());
      err = UPNP_AddPortMapping(
        urls->controlURL,
        data.first.servicetype,
        mapping.port.wan.c_str(),
        mapping.port.lan.c_str(),
        lan_addr.data(),
        mapping.description.c_str(),
        mapping.port.proto.c_str(),
        nullptr,
        mapping_period.c_str()
      );

      if (err != UPNPCOMMAND_SUCCESS && !indefinite) {
        // This may be an old/broken IGD that doesn't like non-static mappings.
        BOOST_LOG(debug) << "Trying static mapping after failure: "sv << err;
        err = UPNP_AddPortMapping(
          urls->controlURL,
          data.first.servicetype,
          mapping.port.wan.c_str(),
          mapping.port.lan.c_str(),
          lan_addr.data(),
          mapping.description.c_str(),
          mapping.port.proto.c_str(),
          nullptr,
          "0"
        );
      }

      if (err) {
        BOOST_LOG(error) << "Failed to map "sv << mapping.port.proto << ' ' << mapping.port.lan << ": "sv << err;
        return false;
      }

      BOOST_LOG(debug) << "Successfully mapped "sv << mapping.port.proto << ' ' << mapping.port.lan;
      return true;
    }

    /**
     * @brief Unmaps all ports.
     * @param urls urls_t from UPNP_GetValidIGD()
     * @param data IGDdatas from UPNP_GetValidIGD()
     */
    static void unmap_all_upnp_ports(
      const std::vector<mapping_t> &mappings,
      const urls_t &urls,
      const IGDdatas &data
    ) {
      for (auto it = std::begin(mappings); it != std::end(mappings); ++it) {
        auto status = UPNP_DeletePortMapping(
          urls->controlURL,
          data.first.servicetype,
          it->port.wan.c_str(),
          it->port.proto.c_str(),
          nullptr
        );

        if (status && status != 714) {  // NoSuchEntryInArray
          BOOST_LOG(warning) << "Failed to unmap "sv << it->port.proto << ' ' << it->port.lan << ": "sv << status;
        } else {
          BOOST_LOG(debug) << "Successfully unmapped "sv << it->port.proto << ' ' << it->port.lan;
        }
      }
    }

    static nat_traversal::network_status_snapshot_t refresh_all_and_publish(
      mapping_ctx_t &ctx,
      const std::shared_ptr<safe::event_t<bool>> &shutdown_event
    ) {
      std::lock_guard lock(ctx.mutex);
      const auto address_family = net::af_from_enum_string(config::sunshine.address_family);
      const auto route = nat_traversal::discover_default_ipv4_route();

      nat_traversal::network_status_snapshot_t snap;
      snap.auto_forward_enabled = config::sunshine.flags[config::flag::UPNP];
      snap.turbo_input_udp_port = resolve_turbo_input_udp_port();
      snap.gateway_ip = route.gateway_ip;
      snap.local_ip = route.local_ip;

      bool upnp_any_ok = false;
      int err = 0;
      device_t device {upnpDiscover(2000, nullptr, nullptr, 0, IPv4, 2, &err)};
      if (!device || err) {
        BOOST_LOG(warning) << "Couldn't discover any IPv4 UPNP devices"sv;
        snap.last_error = "upnp_no_device";
      } else {
        for (auto dev = device.get(); dev != nullptr; dev = dev->pNext) {
          BOOST_LOG(debug) << "Found device: "sv << dev->descURL;
        }

        std::array<char, INET6_ADDRESS_STRLEN> lan_addr {};
        urls_t urls;
        IGDdatas data {};
        auto status = upnp::UPNP_GetValidIGDStatus(device, &urls, &data, lan_addr);
        if (status != 1 && status != 2) {
          BOOST_LOG(error) << status_string(status);
          snap.last_error = std::string(status_string(status));
        } else {
          std::string lan_addr_str {lan_addr.data()};
          if (snap.local_ip.empty()) {
            snap.local_ip = lan_addr_str;
          }
          BOOST_LOG(debug) << "Found valid IGD device: "sv << urls->rootdescURL;

          // Clear previous PCP/NAT-PMP fallback leases once a UPnP IGD becomes active.
          if (!ctx.fallback_leases.empty()) {
            unmap_fallback_leases(route.gateway_ip, snap.local_ip, ctx.fallback_leases);
          }

          std::array<char, INET6_ADDRESS_STRLEN> ext_ip {};
          if (UPNP_GetExternalIPAddress(urls->controlURL, data.first.servicetype, ext_ip.data()) == UPNPCOMMAND_SUCCESS &&
              ext_ip[0] != '\0') {
            snap.router_wan_ip = std::string {ext_ip.data()};
          }

          snap.mapped_ports.reserve(ctx.mappings.size());
          for (auto it = std::begin(ctx.mappings); it != std::end(ctx.mappings) && !(shutdown_event && shutdown_event->peek()); ++it) {
            const bool ok = map_upnp_port(data, urls, lan_addr_str, *it);
            const auto lan_u16 = parse_port_u16(it->port.lan);
            const auto wan_u16 = ok ? parse_port_u16(it->port.wan) : std::uint16_t {0};
            snap.mapped_ports.push_back({it->port.proto, lan_u16, wan_u16, it->description, "upnp", ok});
            if (ok) {
              upnp_any_ok = true;
            }
          }

          if (upnp_any_ok) {
            if (!ctx.upnp_mapped) {
              BOOST_LOG(info) << "Completed UPnP port mappings to "sv << lan_addr_str << " via "sv << urls->rootdescURL;
            }
            if (address_family == net::af_e::BOTH) {
              if (create_ipv6_pinholes(ctx.mappings) && !ctx.upnp_mapped) {
                BOOST_LOG(info) << "Successfully opened IPv6 pinholes on the IGD"sv;
              }
            }
            ctx.upnp_mapped = true;
            ctx.data = data;
            ctx.mapped_urls = std::move(urls);
            snap.upnp_active = true;
            snap.active_method = "upnp";
          } else {
            ctx.upnp_mapped = false;
            snap.last_error = "upnp_add_mapping_failed";
          }
        }
      }

      // Automatic PCP (RFC 6887) -> NAT-PMP (RFC 6886) router fallback if UPnP IGD didn't map anything.
      if (!upnp_any_ok) {
        ctx.upnp_mapped = false;
        snap.mapped_ports.clear();

        if (!try_map_pcp(ctx, route.gateway_ip, snap.local_ip, snap, shutdown_event)) {
          snap.mapped_ports.clear();
          if (!try_map_natpmp(ctx, route.gateway_ip, snap, shutdown_event)) {
            snap.mapped_ports = build_inactive_ports(ctx.mappings);
          }
        }
      }

      std::string stun_err;
      if (const auto stun_ip = nat_traversal::probe_stun_public_ip(&stun_err)) {
        snap.stun_public_ip = *stun_ip;
      } else if (snap.last_error.empty() && !stun_err.empty()) {
        snap.last_error = stun_err;
      }

      auto method_enum = nat_traversal::mapping_method_e::none;
      if (snap.upnp_active) {
        method_enum = nat_traversal::mapping_method_e::upnp;
      } else if (snap.pcp_active) {
        method_enum = nat_traversal::mapping_method_e::pcp;
      } else if (snap.natpmp_active) {
        method_enum = nat_traversal::mapping_method_e::natpmp;
      }

      const auto nat_res = nat_traversal::classify_nat({
        snap.auto_forward_enabled,
        method_enum,
        snap.local_ip,
        snap.router_wan_ip,
        snap.stun_public_ip,
      });
      snap.nat_type = std::string(nat_traversal::to_string(nat_res.classification));
      snap.cgnat_detected = nat_res.cgnat_detected;
      snap.updated_at_ms = nat_traversal::now_epoch_ms();
      nat_traversal::publish_network_status(snap);
      return snap;
    }

    /**
     * @brief Maintains UPnP / PCP / NAT-PMP port forwarding rules
     */
    void upnp_thread_proc() {
      auto shutdown_event = mail::man->event<bool>(mail::shutdown);

      // Refresh router rules every few minutes. They can be lost if the router reboots,
      // WAN IP address changes, or various other conditions.
      do {
        refresh_all_and_publish(*ctx_, shutdown_event);
      } while (!shutdown_event->view(REFRESH_INTERVAL));

      std::lock_guard lock(ctx_->mutex);
      if (ctx_->upnp_mapped) {
        BOOST_LOG(info) << "Unmapping UPNP ports..."sv;
        unmap_all_upnp_ports(ctx_->mappings, ctx_->mapped_urls, ctx_->data);
        ctx_->upnp_mapped = false;
      }
      if (!ctx_->fallback_leases.empty()) {
        BOOST_LOG(info) << "Unmapping PCP/NAT-PMP ports..."sv;
        const auto route = nat_traversal::discover_default_ipv4_route();
        unmap_fallback_leases(route.gateway_ip, route.local_ip, ctx_->fallback_leases);
      }
    }

    std::shared_ptr<mapping_ctx_t> ctx_;
    std::thread upnp_thread;
  };

  std::vector<nat_traversal::mapped_port_status_t> default_port_expectations() {
    auto add_port = [](std::vector<nat_traversal::mapped_port_status_t> &out, std::uint16_t port, std::string proto, std::string desc) {
      out.push_back({std::move(proto), port, port, std::move(desc), "none", false});
    };
    std::vector<nat_traversal::mapped_port_status_t> out;
    out.reserve(8);
    add_port(out, net::map_port(rtsp_stream::RTSP_SETUP_PORT), "TCP"s, "Sunshine - RTSP"s);
    add_port(out, net::map_port(stream::VIDEO_STREAM_PORT), "UDP"s, "Sunshine - Video"s);
    add_port(out, net::map_port(stream::AUDIO_STREAM_PORT), "UDP"s, "Sunshine - Audio"s);
    add_port(out, net::map_port(stream::CONTROL_PORT), "UDP"s, "Sunshine - Control"s);
    add_port(out, net::map_port(nvhttp::PORT_HTTP), "TCP"s, "Sunshine - Client HTTP"s);
    add_port(out, net::map_port(nvhttp::PORT_HTTPS), "TCP"s, "Sunshine - Client HTTPS"s);
    const auto active_turbo = turbo_input::server().udp_port();
    const auto turbo_port = active_turbo != 0 ? active_turbo : net::map_port(turbo_input::kUdpPortOffset);
    add_port(out, turbo_port, "UDP"s, "Sunshine - TurboInput"s);
    const auto active_turbo_tcp = turbo_input::server().tcp_port();
    const auto turbo_tcp_port = active_turbo_tcp != 0 ? active_turbo_tcp : net::map_port(turbo_input::kTcpPortOffset);
    add_port(out, turbo_tcp_port, "TCP"s, "Sunshine - TurboInput TCP"s);
    add_port(out, net::map_port(confighttp::PORT_HTTPS), "TCP"s, "Sunshine - Web UI"s);
    // Opt-in only: no WAN forward for browser streaming unless the owner enabled it.
    if (const auto ice = webrtc_ice::port_range(); ice.min != 0) {
      for (auto p = ice.min; p <= ice.max; ++p) {
        add_port(out, p, "UDP"s, "Sunshine - WebRTC"s);
        add_port(out, p, "TCP"s, "Sunshine - WebRTC TCP"s);
      }
    }
    return out;
  }

  std::unique_ptr<platf::deinit_t> start() {
    if (!config::sunshine.flags[config::flag::UPNP]) {
      return nullptr;
    }

    return std::make_unique<deinit_t>();
  }
}  // namespace upnp
