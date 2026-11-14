/**
 * @file src/nat_traversal.h
 * @brief Self-contained PCP (RFC 6887), NAT-PMP (RFC 6886), STUN (RFC 5389),
 *        and CGNAT classifier primitives + network status snapshot store.
 */
#pragma once

#include <array>
#include <cstdint>
#include <functional>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace nat_traversal {
  constexpr std::uint16_t kNatPmpPort = 5351;
  constexpr std::uint16_t kPcpPort = 5351;
  constexpr std::uint32_t kDefaultMappingLifetimeSec = 3600;
  constexpr std::uint32_t kStunMagicCookie = 0x2112A442u;

  enum class proto_e : std::uint8_t {
    tcp = 6,
    udp = 17,
  };

  enum class mapping_method_e : std::uint8_t {
    none = 0,
    upnp,
    pcp,
    natpmp,
  };

  enum class nat_classification_e : std::uint8_t {
    unknown = 0,
    open_upnp,
    open_pcp,
    open_natpmp,
    open_direct,
    cgnat_rfc6598,
    double_nat_or_cgnat,
    manual_forward_or_unmapped,
    router_unmapped,
  };

  struct natpmp_external_ip_response_t {
    std::uint16_t result_code = 0;
    std::uint32_t epoch_sec = 0;
    std::string external_ip;
  };

  struct natpmp_map_response_t {
    proto_e proto = proto_e::udp;
    std::uint16_t result_code = 0;
    std::uint32_t epoch_sec = 0;
    std::uint16_t internal_port = 0;
    std::uint16_t external_port = 0;
    std::uint32_t lifetime_sec = 0;
  };

  struct pcp_map_response_t {
    std::uint8_t version = 2;
    std::uint8_t opcode = 1;
    std::uint8_t result_code = 0;
    std::uint32_t lifetime_sec = 0;
    std::uint32_t epoch_sec = 0;
    std::array<std::uint8_t, 12> nonce {};
    std::uint8_t protocol = 0;
    std::uint16_t internal_port = 0;
    std::uint16_t assigned_external_port = 0;
    std::string assigned_external_ip;
    bool has_map_payload = false;
  };

  struct stun_binding_response_t {
    std::string mapped_ip;
    std::uint16_t mapped_port = 0;
    bool used_xor_mapped = false;
  };

  struct route_info_t {
    std::string gateway_ip;
    std::string local_ip;
  };

  struct mapped_port_status_t {
    std::string protocol;
    std::uint16_t lan_port = 0;
    std::uint16_t wan_port = 0;
    std::string description;
    std::string method = "none";
    bool active = false;
  };

  struct network_status_snapshot_t {
    bool auto_forward_enabled = false;
    std::string active_method = "none";
    bool upnp_active = false;
    bool pcp_active = false;
    bool natpmp_active = false;
    std::string gateway_ip;
    std::string local_ip;
    std::string router_wan_ip;
    std::string stun_public_ip;
    std::string nat_type = "unknown";
    bool cgnat_detected = false;
    std::uint16_t turbo_input_udp_port = 48021;
    std::string last_error;
    std::int64_t updated_at_ms = 0;
    std::vector<mapped_port_status_t> mapped_ports;
  };

  struct nat_classification_input_t {
    bool auto_forward_enabled = false;
    mapping_method_e active_method = mapping_method_e::none;
    std::string local_ip;
    std::string router_wan_ip;
    std::string stun_public_ip;
  };

  struct nat_classification_result_t {
    nat_classification_e classification = nat_classification_e::unknown;
    bool cgnat_detected = false;
  };

  std::string_view to_string(mapping_method_e method);
  std::string_view to_string(nat_classification_e classification);

  // Pure binary protocol codecs (RFC 6886, RFC 6887, RFC 5389)
  std::array<std::uint8_t, 2> build_natpmp_external_ip_request();
  std::optional<natpmp_external_ip_response_t> parse_natpmp_external_ip_response(
    const std::uint8_t *data,
    std::size_t len
  );

  std::array<std::uint8_t, 12> build_natpmp_map_request(
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t external_port,
    std::uint32_t lifetime_sec
  );
  std::optional<natpmp_map_response_t> parse_natpmp_map_response(
    const std::uint8_t *data,
    std::size_t len
  );

  bool ip_string_to_v6_mapped_bytes(std::string_view ip, std::array<std::uint8_t, 16> &out);
  std::string pcp_ip16_to_string(const std::uint8_t *ip16);

  std::array<std::uint8_t, 60> build_pcp_map_request(
    const std::array<std::uint8_t, 16> &client_ip16,
    const std::array<std::uint8_t, 12> &nonce,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t suggested_ext_port,
    std::uint32_t lifetime_sec,
    const std::array<std::uint8_t, 16> &suggested_ext_ip16 = {}
  );
  std::optional<pcp_map_response_t> parse_pcp_map_response(
    const std::uint8_t *data,
    std::size_t len,
    const std::array<std::uint8_t, 12> *expected_nonce = nullptr
  );

  std::array<std::uint8_t, 20> build_stun_binding_request(const std::array<std::uint8_t, 12> &tx_id);
  std::optional<stun_binding_response_t> parse_stun_binding_response(
    const std::uint8_t *data,
    std::size_t len,
    const std::array<std::uint8_t, 12> &expected_tx_id
  );

  // IPv4 / CGNAT classification helpers
  std::optional<std::uint32_t> parse_ipv4_u32(std::string_view ip);
  bool is_rfc6598_cgnat_ipv4(std::string_view ip);
  bool is_private_or_reserved_ipv4(std::string_view ip);
  nat_classification_result_t classify_nat(const nat_classification_input_t &input);

  // OS routing + UDP socket helpers (self-contained, zero external tools)
  route_info_t discover_default_ipv4_route();
  std::array<std::uint8_t, 12> generate_random_id12();

  std::optional<std::string> probe_natpmp_external_ip(
    const std::string &gateway_ip,
    std::string *err_out = nullptr,
    int timeout_ms = 600
  );
  std::optional<natpmp_map_response_t> send_natpmp_map(
    const std::string &gateway_ip,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t external_port,
    std::uint32_t lifetime_sec,
    std::string *err_out = nullptr,
    int timeout_ms = 600
  );
  std::optional<pcp_map_response_t> send_pcp_map(
    const std::string &gateway_ip,
    const std::string &local_ip,
    const std::array<std::uint8_t, 12> &nonce,
    proto_e proto,
    std::uint16_t internal_port,
    std::uint16_t suggested_ext_port,
    std::uint32_t lifetime_sec,
    const std::string &suggested_ext_ip = {},
    std::string *err_out = nullptr,
    int timeout_ms = 600
  );
  std::optional<std::string> probe_stun_public_ip(
    std::string *err_out = nullptr,
    int timeout_ms = 700
  );

  // Process-wide thread-safe status snapshot + on-demand reprobe hook
  std::int64_t now_epoch_ms();
  void publish_network_status(network_status_snapshot_t snapshot);
  network_status_snapshot_t get_network_status();
  void set_reprobe_handler(std::function<network_status_snapshot_t()> handler);
  network_status_snapshot_t reprobe_network_status(bool auto_forward_enabled, std::uint16_t turbo_input_udp_port);
}  // namespace nat_traversal
