/**
 * @file src/nat_traversal.cpp
 * @brief Self-contained PCP (RFC 6887), NAT-PMP (RFC 6886), STUN (RFC 5389),
 *        default-gateway route discovery, and CGNAT classifier implementation.
 */

#include "src/nat_traversal.h"

#include <boost/asio.hpp>

#ifdef _WIN32
  #include <iphlpapi.h>
  #include <ws2tcpip.h>
#else
  #include <arpa/inet.h>
  #include <fstream>
  #include <sstream>
#endif

#include <algorithm>
#include <chrono>
#include <cstring>
#include <limits>
#include <mutex>
#include <random>

namespace nat_traversal {
  namespace {
    using boost::asio::ip::udp;

    constexpr std::array<std::uint8_t, 4> kStunCookieBytes {0x21, 0x12, 0xA4, 0x42};

    std::uint16_t read_be16(const std::uint8_t *p) {
      return (static_cast<std::uint16_t>(p[0]) << 8) | static_cast<std::uint16_t>(p[1]);
    }

    std::uint32_t read_be32(const std::uint8_t *p) {
      return (static_cast<std::uint32_t>(p[0]) << 24) |
             (static_cast<std::uint32_t>(p[1]) << 16) |
             (static_cast<std::uint32_t>(p[2]) << 8) |
             static_cast<std::uint32_t>(p[3]);
    }

    void write_be16(std::uint8_t *p, std::uint16_t v) {
      p[0] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
      p[1] = static_cast<std::uint8_t>(v & 0xFF);
    }

    void write_be32(std::uint8_t *p, std::uint32_t v) {
      p[0] = static_cast<std::uint8_t>((v >> 24) & 0xFF);
      p[1] = static_cast<std::uint8_t>((v >> 16) & 0xFF);
      p[2] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
      p[3] = static_cast<std::uint8_t>(v & 0xFF);
    }

    std::string ipv4_bytes_to_string(const std::uint8_t b[4]) {
      boost::asio::ip::address_v4::bytes_type raw {b[0], b[1], b[2], b[3]};
      return boost::asio::ip::address_v4(raw).to_string();
    }

    std::string ipv6_bytes_to_string(const std::uint8_t b[16]) {
      boost::asio::ip::address_v6::bytes_type raw {};
      std::memcpy(raw.data(), b, 16);
      return boost::asio::ip::address_v6(raw).to_string();
    }

    bool udp_exchange(
      const udp::endpoint &target,
      const std::uint8_t *req_data,
      std::size_t req_len,
      std::vector<std::uint8_t> &reply_out,
      int timeout_ms,
      std::string *err_out
    ) {
      try {
        boost::asio::io_context io;
        udp::socket sock(io);
        boost::system::error_code ec;
        sock.open(target.protocol(), ec);
        if (ec) {
          if (err_out) {
            *err_out = ec.message();
          }
          return false;
        }
        sock.send_to(boost::asio::buffer(req_data, req_len), target, 0, ec);
        if (ec) {
          if (err_out) {
            *err_out = ec.message();
          }
          return false;
        }

        std::array<std::uint8_t, 512> rx_buf {};
        udp::endpoint sender;
        std::size_t rx_len = 0;
        bool completed = false;
        boost::system::error_code rx_ec;

        boost::asio::steady_timer timer(io, std::chrono::milliseconds(std::max(50, timeout_ms)));
        timer.async_wait([&](const boost::system::error_code &tec) {
          if (!tec && !completed) {
            boost::system::error_code cancel_ec;
            sock.cancel(cancel_ec);
          }
        });

        sock.async_receive_from(
          boost::asio::buffer(rx_buf),
          sender,
          [&](const boost::system::error_code &rec_ec, std::size_t bytes) {
            completed = true;
            rx_ec = rec_ec;
            rx_len = bytes;
            timer.cancel();
          }
        );

        io.run();
        if (!completed || rx_ec) {
          if (err_out) {
            *err_out = rx_ec ? rx_ec.message() : "timeout";
          }
          return false;
        }
        reply_out.assign(rx_buf.begin(), rx_buf.begin() + static_cast<std::ptrdiff_t>(rx_len));
        return true;
      } catch (const std::exception &ex) {
        if (err_out) {
          *err_out = ex.what();
        }
        return false;
      }
    }

    std::mutex &status_mutex() {
      static std::mutex m;
      return m;
    }

    network_status_snapshot_t &status_storage() {
      static network_status_snapshot_t s;
      return s;
    }

    std::function<network_status_snapshot_t()> &reprobe_handler_storage() {
      static std::function<network_status_snapshot_t()> handler;
      return handler;
    }
  }  // namespace

  std::string_view to_string(mapping_method_e method) {
    switch (method) {
      case mapping_method_e::upnp:
        return "upnp";
      case mapping_method_e::pcp:
        return "pcp";
      case mapping_method_e::natpmp:
        return "natpmp";
      case mapping_method_e::none:
      default:
        return "none";
    }
  }

  std::string_view to_string(nat_classification_e classification) {
    switch (classification) {
      case nat_classification_e::open_upnp:
        return "open_upnp";
      case nat_classification_e::open_pcp:
        return "open_pcp";
      case nat_classification_e::open_natpmp:
        return "open_natpmp";
      case nat_classification_e::open_direct:
        return "open_direct";
      case nat_classification_e::cgnat_rfc6598:
        return "cgnat_rfc6598";
      case nat_classification_e::double_nat_or_cgnat:
        return "double_nat_or_cgnat";
      case nat_classification_e::manual_forward_or_unmapped:
        return "manual_forward_or_unmapped";
      case nat_classification_e::router_unmapped:
        return "router_unmapped";
      case nat_classification_e::unknown:
      default:
        return "unknown";
    }
  }

  std::array<std::uint8_t, 2> build_natpmp_external_ip_request() {
    return {0x00, 0x00};
  }

  std::optional<natpmp_external_ip_response_t> parse_natpmp_external_ip_response(
    const std::uint8_t *data,
    std::size_t len
  ) {
    if (!data || len < 12 || data[0] != 0x00 || data[1] != 0x80) {
      return std::nullopt;
    }
    natpmp_external_ip_response_t out;
    out.result_code = read_be16(data + 2);
    out.epoch_sec = read_be32(data + 4);
    out.external_ip = ipv4_bytes_to_string(data + 8);
    return out;
  }

  std::array<std::uint8_t, 12> build_natpmp_map_request(
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t external_port,
    std::uint32_t lifetime_sec
  ) {
    std::array<std::uint8_t, 12> pkt {};
    pkt[0] = 0x00;
    pkt[1] = (proto == proto_e::udp) ? 0x01 : 0x02;
    pkt[2] = 0x00;
    pkt[3] = 0x00;
    write_be16(pkt.data() + 4, internal_port);
    write_be16(pkt.data() + 6, external_port);
    write_be32(pkt.data() + 8, lifetime_sec);
    return pkt;
  }

  std::optional<natpmp_map_response_t> parse_natpmp_map_response(
    const std::uint8_t *data,
    std::size_t len
  ) {
    if (!data || len < 16 || data[0] != 0x00) {
      return std::nullopt;
    }
    if (data[1] != 0x81 && data[1] != 0x82) {
      return std::nullopt;
    }
    natpmp_map_response_t out;
    out.proto = (data[1] == 0x81) ? proto_e::udp : proto_e::tcp;
    out.result_code = read_be16(data + 2);
    out.epoch_sec = read_be32(data + 4);
    out.internal_port = read_be16(data + 8);
    out.external_port = read_be16(data + 10);
    out.lifetime_sec = read_be32(data + 12);
    return out;
  }

  bool ip_string_to_v6_mapped_bytes(std::string_view ip, std::array<std::uint8_t, 16> &out) {
    out.fill(0);
    if (ip.empty()) {
      out[10] = 0xFF;
      out[11] = 0xFF;
      return true;
    }
    boost::system::error_code ec;
    const auto addr = boost::asio::ip::make_address(std::string(ip), ec);
    if (ec) {
      return false;
    }
    if (addr.is_v4()) {
      const auto bytes = addr.to_v4().to_bytes();
      out[10] = 0xFF;
      out[11] = 0xFF;
      std::memcpy(out.data() + 12, bytes.data(), 4);
      return true;
    }
    const auto bytes = addr.to_v6().to_bytes();
    std::memcpy(out.data(), bytes.data(), 16);
    return true;
  }

  std::string pcp_ip16_to_string(const std::uint8_t *ip16) {
    if (!ip16) {
      return {};
    }
    bool is_v4_mapped = true;
    for (int i = 0; i < 10; ++i) {
      if (ip16[i] != 0) {
        is_v4_mapped = false;
        break;
      }
    }
    if (is_v4_mapped && ip16[10] == 0xFF && ip16[11] == 0xFF) {
      return ipv4_bytes_to_string(ip16 + 12);
    }
    bool all_zero = std::all_of(ip16, ip16 + 16, [](std::uint8_t b) { return b == 0; });
    if (all_zero) {
      return "0.0.0.0";
    }
    return ipv6_bytes_to_string(ip16);
  }

  std::array<std::uint8_t, 60> build_pcp_map_request(
    const std::array<std::uint8_t, 16> &client_ip16,
    const std::array<std::uint8_t, 12> &nonce,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t suggested_ext_port,
    std::uint32_t lifetime_sec,
    const std::array<std::uint8_t, 16> &suggested_ext_ip16
  ) {
    std::array<std::uint8_t, 60> pkt {};
    pkt[0] = 2;  // PCP Version 2
    pkt[1] = 1;  // R=0, Opcode=1 (MAP)
    pkt[2] = 0;
    pkt[3] = 0;
    write_be32(pkt.data() + 4, lifetime_sec);
    std::memcpy(pkt.data() + 8, client_ip16.data(), 16);

    // MAP opcode payload (bytes 24..59)
    std::memcpy(pkt.data() + 24, nonce.data(), 12);
    pkt[36] = static_cast<std::uint8_t>(proto);
    pkt[37] = 0;
    pkt[38] = 0;
    pkt[39] = 0;
    write_be16(pkt.data() + 40, internal_port);
    write_be16(pkt.data() + 42, suggested_ext_port);

    const bool has_ext_ip = std::any_of(
      suggested_ext_ip16.begin(),
      suggested_ext_ip16.end(),
      [](std::uint8_t b) { return b != 0; }
    );
    if (has_ext_ip) {
      std::memcpy(pkt.data() + 44, suggested_ext_ip16.data(), 16);
    } else {
      pkt[54] = 0xFF;
      pkt[55] = 0xFF;
    }
    return pkt;
  }

  std::optional<pcp_map_response_t> parse_pcp_map_response(
    const std::uint8_t *data,
    std::size_t len,
    const std::array<std::uint8_t, 12> *expected_nonce
  ) {
    if (!data || len < 24) {
      return std::nullopt;
    }
    if ((data[1] & 0x80) == 0) {
      return std::nullopt;
    }

    pcp_map_response_t out;
    out.version = data[0];
    out.opcode = static_cast<std::uint8_t>(data[1] & 0x7F);
    out.result_code = data[3];
    out.lifetime_sec = read_be32(data + 4);
    out.epoch_sec = read_be32(data + 8);

    // Note: version 0 or UNSUPP_VERSION error responses can be 24B headers.
    if (len >= 60 && out.opcode == 1) {
      std::memcpy(out.nonce.data(), data + 24, 12);
      if (expected_nonce && out.result_code == 0 && out.nonce != *expected_nonce) {
        return std::nullopt;
      }
      out.protocol = data[36];
      out.internal_port = read_be16(data + 40);
      out.assigned_external_port = read_be16(data + 42);
      out.assigned_external_ip = pcp_ip16_to_string(data + 44);
      out.has_map_payload = true;
    } else if (out.result_code == 0) {
      return std::nullopt;
    }

    return out;
  }

  std::array<std::uint8_t, 20> build_stun_binding_request(const std::array<std::uint8_t, 12> &tx_id) {
    std::array<std::uint8_t, 20> pkt {};
    write_be16(pkt.data() + 0, 0x0001);
    write_be16(pkt.data() + 2, 0x0000);
    write_be32(pkt.data() + 4, kStunMagicCookie);
    std::memcpy(pkt.data() + 8, tx_id.data(), 12);
    return pkt;
  }

  std::optional<stun_binding_response_t> parse_stun_binding_response(
    const std::uint8_t *data,
    std::size_t len,
    const std::array<std::uint8_t, 12> &expected_tx_id
  ) {
    if (!data || len < 20) {
      return std::nullopt;
    }
    const std::uint16_t msg_type = read_be16(data + 0);
    const std::uint16_t msg_len = read_be16(data + 2);
    const std::uint32_t cookie = read_be32(data + 4);
    if (msg_type != 0x0101 || cookie != kStunMagicCookie || len < 20u + msg_len) {
      return std::nullopt;
    }
    if (std::memcmp(data + 8, expected_tx_id.data(), 12) != 0) {
      return std::nullopt;
    }

    std::optional<stun_binding_response_t> mapped_fallback;
    const std::size_t end = 20u + msg_len;
    std::size_t offset = 20u;

    while (offset + 4 <= end) {
      const std::uint16_t attr_type = read_be16(data + offset);
      const std::uint16_t attr_len = read_be16(data + offset + 2);
      const std::size_t val_pos = offset + 4;
      if (val_pos + attr_len > end) {
        break;
      }

      if (attr_type == 0x0020 && attr_len >= 8) {  // XOR-MAPPED-ADDRESS
        const std::uint8_t family = data[val_pos + 1];
        const std::uint16_t xport = read_be16(data + val_pos + 2) ^ static_cast<std::uint16_t>(kStunMagicCookie >> 16);
        if (family == 0x01) {
          std::uint8_t ip4[4];
          for (int i = 0; i < 4; ++i) {
            ip4[i] = data[val_pos + 4 + i] ^ kStunCookieBytes[i];
          }
          return stun_binding_response_t {ipv4_bytes_to_string(ip4), xport, true};
        }
        if (family == 0x02 && attr_len >= 20) {
          std::uint8_t ip6[16];
          for (int i = 0; i < 4; ++i) {
            ip6[i] = data[val_pos + 4 + i] ^ kStunCookieBytes[i];
          }
          for (int i = 0; i < 12; ++i) {
            ip6[4 + i] = data[val_pos + 8 + i] ^ expected_tx_id[i];
          }
          return stun_binding_response_t {ipv6_bytes_to_string(ip6), xport, true};
        }
      } else if (attr_type == 0x0001 && attr_len >= 8 && !mapped_fallback) {  // MAPPED-ADDRESS
        const std::uint8_t family = data[val_pos + 1];
        const std::uint16_t port = read_be16(data + val_pos + 2);
        if (family == 0x01) {
          mapped_fallback = stun_binding_response_t {ipv4_bytes_to_string(data + val_pos + 4), port, false};
        } else if (family == 0x02 && attr_len >= 20) {
          mapped_fallback = stun_binding_response_t {ipv6_bytes_to_string(data + val_pos + 4), port, false};
        }
      }

      const std::size_t padded_len = (static_cast<std::size_t>(attr_len) + 3u) & ~std::size_t(3u);
      offset = val_pos + padded_len;
    }

    return mapped_fallback;
  }

  std::optional<std::uint32_t> parse_ipv4_u32(std::string_view ip) {
    if (ip.empty()) {
      return std::nullopt;
    }
    boost::system::error_code ec;
    const auto addr = boost::asio::ip::make_address_v4(std::string(ip), ec);
    if (ec) {
      return std::nullopt;
    }
    return addr.to_uint();
  }

  bool is_rfc6598_cgnat_ipv4(std::string_view ip) {
    const auto v = parse_ipv4_u32(ip);
    if (!v) {
      return false;
    }
    return (*v & 0xFFC00000u) == 0x64400000u;  // 100.64.0.0/10
  }

  bool is_private_or_reserved_ipv4(std::string_view ip) {
    const auto v = parse_ipv4_u32(ip);
    if (!v) {
      return false;
    }
    const std::uint32_t a = *v;
    return (a & 0xFF000000u) == 0x0A000000u ||  // 10.0.0.0/8
           (a & 0xFFF00000u) == 0xAC100000u ||  // 172.16.0.0/12
           (a & 0xFFFF0000u) == 0xC0A80000u ||  // 192.168.0.0/16
           (a & 0xFF000000u) == 0x7F000000u ||  // 127.0.0.0/8
           (a & 0xFFFF0000u) == 0xA9FE0000u ||  // 169.254.0.0/16
           a == 0x00000000u;
  }

  nat_classification_result_t classify_nat(const nat_classification_input_t &input) {
    if (!input.router_wan_ip.empty()) {
      if (is_rfc6598_cgnat_ipv4(input.router_wan_ip)) {
        return {nat_classification_e::cgnat_rfc6598, true};
      }
      if (is_private_or_reserved_ipv4(input.router_wan_ip)) {
        return {nat_classification_e::double_nat_or_cgnat, true};
      }
      if (!input.stun_public_ip.empty() && input.router_wan_ip != input.stun_public_ip) {
        return {nat_classification_e::double_nat_or_cgnat, true};
      }
    }

    switch (input.active_method) {
      case mapping_method_e::upnp:
        return {nat_classification_e::open_upnp, false};
      case mapping_method_e::pcp:
        return {nat_classification_e::open_pcp, false};
      case mapping_method_e::natpmp:
        return {nat_classification_e::open_natpmp, false};
      case mapping_method_e::none:
      default:
        break;
    }

    if (!input.auto_forward_enabled) {
      if (!input.stun_public_ip.empty() && !input.local_ip.empty() && input.stun_public_ip == input.local_ip) {
        return {nat_classification_e::open_direct, false};
      }
      return {nat_classification_e::manual_forward_or_unmapped, false};
    }

    return {nat_classification_e::router_unmapped, false};
  }

  route_info_t discover_default_ipv4_route() {
    route_info_t info;
#ifdef _WIN32
    ULONG size = 0;
    GetIpForwardTable(nullptr, &size, FALSE);
    if (size > 0) {
      std::vector<std::uint8_t> buf(size);
      auto *table = reinterpret_cast<MIB_IPFORWARDTABLE *>(buf.data());
      if (GetIpForwardTable(table, &size, FALSE) == NO_ERROR) {
        DWORD best_metric = 0xFFFFFFFFu;
        DWORD best_gw = 0;
        DWORD best_if = 0;
        for (DWORD i = 0; i < table->dwNumEntries; ++i) {
          const auto &row = table->table[i];
          if (row.dwForwardDest == 0 && row.dwForwardMask == 0 && row.dwForwardNextHop != 0) {
            if (row.dwForwardMetric1 < best_metric) {
              best_metric = row.dwForwardMetric1;
              best_gw = row.dwForwardNextHop;
              best_if = row.dwForwardIfIndex;
            }
          }
        }
        if (best_gw != 0) {
          in_addr gw_addr {};
          gw_addr.S_un.S_addr = best_gw;
          char gw_buf[INET_ADDRSTRLEN] {};
          if (inet_ntop(AF_INET, &gw_addr, gw_buf, sizeof(gw_buf))) {
            info.gateway_ip = gw_buf;
          }

          ULONG addr_size = 0;
          GetIpAddrTable(nullptr, &addr_size, FALSE);
          if (addr_size > 0) {
            std::vector<std::uint8_t> addr_buf(addr_size);
            auto *ip_table = reinterpret_cast<MIB_IPADDRTABLE *>(addr_buf.data());
            if (GetIpAddrTable(ip_table, &addr_size, FALSE) == NO_ERROR) {
              for (DWORD i = 0; i < ip_table->dwNumEntries; ++i) {
                if (ip_table->table[i].dwIndex == best_if && ip_table->table[i].dwAddr != 0) {
                  in_addr local_addr {};
                  local_addr.S_un.S_addr = ip_table->table[i].dwAddr;
                  char local_buf[INET_ADDRSTRLEN] {};
                  if (inet_ntop(AF_INET, &local_addr, local_buf, sizeof(local_buf))) {
                    info.local_ip = local_buf;
                  }
                  break;
                }
              }
            }
          }
        }
      }
    }
#else
    std::ifstream route_file("/proc/net/route");
    std::string line;
    std::getline(route_file, line);  // skip header
    std::string best_iface;
    int best_metric = std::numeric_limits<int>::max();
    std::uint32_t best_gw_le = 0;
    while (std::getline(route_file, line)) {
      std::istringstream iss(line);
      std::string iface, dest_hex, gw_hex, flags_hex;
      int refcnt = 0, use = 0, metric = 0;
      if (!(iss >> iface >> dest_hex >> gw_hex >> flags_hex >> refcnt >> use >> metric)) {
        continue;
      }
      if (dest_hex == "00000000" && gw_hex != "00000000" && metric < best_metric) {
        best_metric = metric;
        best_iface = iface;
        best_gw_le = static_cast<std::uint32_t>(std::stoul(gw_hex, nullptr, 16));
      }
    }
    if (best_gw_le != 0) {
      in_addr gw_addr {};
      gw_addr.s_addr = best_gw_le;
      char gw_buf[INET_ADDRSTRLEN] {};
      if (inet_ntop(AF_INET, &gw_addr, gw_buf, sizeof(gw_buf))) {
        info.gateway_ip = gw_buf;
      }
    }
#endif

    // Cross-platform local IP determination via UDP connect (no packets sent)
    if (info.local_ip.empty() && !info.gateway_ip.empty()) {
      try {
        boost::asio::io_context io;
        udp::socket sock(io);
        boost::system::error_code ec;
        const auto gw_addr = boost::asio::ip::make_address_v4(info.gateway_ip, ec);
        if (!ec) {
          sock.connect(udp::endpoint(gw_addr, 5351), ec);
          if (!ec) {
            info.local_ip = sock.local_endpoint().address().to_string();
          }
        }
      } catch (...) {
      }
    }
    return info;
  }

  std::array<std::uint8_t, 12> generate_random_id12() {
    std::array<std::uint8_t, 12> id {};
    std::random_device rd;
    for (std::size_t i = 0; i < id.size(); i += 4) {
      const std::uint32_t v = rd();
      id[i] = static_cast<std::uint8_t>(v & 0xFF);
      if (i + 1 < id.size()) {
        id[i + 1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
      }
      if (i + 2 < id.size()) {
        id[i + 2] = static_cast<std::uint8_t>((v >> 16) & 0xFF);
      }
      if (i + 3 < id.size()) {
        id[i + 3] = static_cast<std::uint8_t>((v >> 24) & 0xFF);
      }
    }
    return id;
  }

  std::optional<std::string> probe_natpmp_external_ip(
    const std::string &gateway_ip,
    std::string *err_out,
    int timeout_ms
  ) {
    if (gateway_ip.empty()) {
      if (err_out) {
        *err_out = "missing_gateway";
      }
      return std::nullopt;
    }
    boost::system::error_code ec;
    const auto gw = boost::asio::ip::make_address(gateway_ip, ec);
    if (ec) {
      if (err_out) {
        *err_out = ec.message();
      }
      return std::nullopt;
    }
    const auto req = build_natpmp_external_ip_request();
    std::vector<std::uint8_t> reply;
    if (!udp_exchange(udp::endpoint(gw, kNatPmpPort), req.data(), req.size(), reply, timeout_ms, err_out)) {
      return std::nullopt;
    }
    const auto parsed = parse_natpmp_external_ip_response(reply.data(), reply.size());
    if (!parsed || parsed->result_code != 0) {
      if (err_out) {
        *err_out = parsed ? ("natpmp_err_" + std::to_string(parsed->result_code)) : "natpmp_bad_reply";
      }
      return std::nullopt;
    }
    return parsed->external_ip;
  }

  std::optional<natpmp_map_response_t> send_natpmp_map(
    const std::string &gateway_ip,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t external_port,
    std::uint32_t lifetime_sec,
    std::string *err_out,
    int timeout_ms
  ) {
    if (gateway_ip.empty()) {
      if (err_out) {
        *err_out = "missing_gateway";
      }
      return std::nullopt;
    }
    boost::system::error_code ec;
    const auto gw = boost::asio::ip::make_address(gateway_ip, ec);
    if (ec) {
      if (err_out) {
        *err_out = ec.message();
      }
      return std::nullopt;
    }
    const auto req = build_natpmp_map_request(proto, internal_port, external_port, lifetime_sec);
    std::vector<std::uint8_t> reply;
    if (!udp_exchange(udp::endpoint(gw, kNatPmpPort), req.data(), req.size(), reply, timeout_ms, err_out)) {
      return std::nullopt;
    }
    const auto parsed = parse_natpmp_map_response(reply.data(), reply.size());
    if (!parsed || parsed->result_code != 0) {
      if (err_out) {
        *err_out = parsed ? ("natpmp_err_" + std::to_string(parsed->result_code)) : "natpmp_bad_reply";
      }
      return std::nullopt;
    }
    return parsed;
  }

  std::optional<pcp_map_response_t> send_pcp_map(
    const std::string &gateway_ip,
    const std::string &local_ip,
    const std::array<std::uint8_t, 12> &nonce,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t suggested_ext_port,
    std::uint32_t lifetime_sec,
    const std::string &suggested_ext_ip,
    std::string *err_out,
    int timeout_ms
  ) {
    if (gateway_ip.empty() || local_ip.empty()) {
      if (err_out) {
        *err_out = "missing_gateway_or_local_ip";
      }
      return std::nullopt;
    }
    boost::system::error_code ec;
    const auto gw = boost::asio::ip::make_address(gateway_ip, ec);
    if (ec) {
      if (err_out) {
        *err_out = ec.message();
      }
      return std::nullopt;
    }
    std::array<std::uint8_t, 16> client_ip16 {};
    if (!ip_string_to_v6_mapped_bytes(local_ip, client_ip16)) {
      if (err_out) {
        *err_out = "invalid_local_ip";
      }
      return std::nullopt;
    }
    std::array<std::uint8_t, 16> ext_ip16 {};
    if (!suggested_ext_ip.empty()) {
      ip_string_to_v6_mapped_bytes(suggested_ext_ip, ext_ip16);
    }

    const auto req = build_pcp_map_request(
      client_ip16,
      nonce,
      proto,
      internal_port,
      suggested_ext_port,
      lifetime_sec,
      ext_ip16
    );
    std::vector<std::uint8_t> reply;
    if (!udp_exchange(udp::endpoint(gw, kPcpPort), req.data(), req.size(), reply, timeout_ms, err_out)) {
      return std::nullopt;
    }
    const auto parsed = parse_pcp_map_response(reply.data(), reply.size(), &nonce);
    if (!parsed) {
      if (err_out) {
        *err_out = "pcp_bad_reply";
      }
      return std::nullopt;
    }
    if (parsed->result_code != 0) {
      if (err_out) {
        *err_out = "pcp_err_" + std::to_string(parsed->result_code);
      }
      return parsed;
    }
    return parsed;
  }

  std::optional<std::string> probe_stun_public_ip(std::string *err_out, int timeout_ms) {
    struct stun_server_t {
      const char *host;
      const char *port;
    };
    static constexpr stun_server_t kStunServers[] = {
      {"stun.l.google.com", "19302"},
      {"stun1.l.google.com", "19302"},
      {"stun.cloudflare.com", "3478"},
    };

    std::string last_err = "stun_unreachable";
    for (const auto &srv : kStunServers) {
      try {
        boost::asio::io_context io;
        udp::resolver resolver(io);
        boost::system::error_code ec;
        const auto results = resolver.resolve(udp::v4(), srv.host, srv.port, ec);
        if (ec || results.empty()) {
          last_err = ec ? ec.message() : "stun_dns_empty";
          continue;
        }
        const auto tx_id = generate_random_id12();
        const auto req = build_stun_binding_request(tx_id);
        for (const auto &entry : results) {
          std::vector<std::uint8_t> reply;
          if (!udp_exchange(entry.endpoint(), req.data(), req.size(), reply, timeout_ms, &last_err)) {
            continue;
          }
          const auto parsed = parse_stun_binding_response(reply.data(), reply.size(), tx_id);
          if (parsed && !parsed->mapped_ip.empty()) {
            return parsed->mapped_ip;
          }
          last_err = "stun_invalid_response";
        }
      } catch (const std::exception &ex) {
        last_err = ex.what();
      }
    }
    if (err_out) {
      *err_out = last_err;
    }
    return std::nullopt;
  }

  std::int64_t now_epoch_ms() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
             std::chrono::system_clock::now().time_since_epoch()
    )
      .count();
  }

  void publish_network_status(network_status_snapshot_t snapshot) {
    if (snapshot.updated_at_ms == 0) {
      snapshot.updated_at_ms = now_epoch_ms();
    }
    std::lock_guard lock(status_mutex());
    status_storage() = std::move(snapshot);
  }

  network_status_snapshot_t get_network_status() {
    std::lock_guard lock(status_mutex());
    return status_storage();
  }

  void set_reprobe_handler(std::function<network_status_snapshot_t()> handler) {
    std::lock_guard lock(status_mutex());
    reprobe_handler_storage() = std::move(handler);
  }

  network_status_snapshot_t reprobe_network_status(
    bool auto_forward_enabled,
    std::uint16_t turbo_input_udp_port
  ) {
    std::function<network_status_snapshot_t()> handler;
    {
      std::lock_guard lock(status_mutex());
      handler = reprobe_handler_storage();
    }
    if (handler) {
      return handler();
    }

    network_status_snapshot_t snap;
    snap.auto_forward_enabled = auto_forward_enabled;
    snap.turbo_input_udp_port = turbo_input_udp_port;
    const auto route = discover_default_ipv4_route();
    snap.gateway_ip = route.gateway_ip;
    snap.local_ip = route.local_ip;

    std::string stun_err;
    if (const auto stun_ip = probe_stun_public_ip(&stun_err)) {
      snap.stun_public_ip = *stun_ip;
    } else {
      snap.last_error = stun_err;
    }

    const auto cls = classify_nat({
      auto_forward_enabled,
      mapping_method_e::none,
      snap.local_ip,
      snap.router_wan_ip,
      snap.stun_public_ip,
    });
    snap.nat_type = std::string(to_string(cls.classification));
    snap.cgnat_detected = cls.cgnat_detected;
    snap.updated_at_ms = now_epoch_ms();
    publish_network_status(snap);
    return snap;
  }
}  // namespace nat_traversal
