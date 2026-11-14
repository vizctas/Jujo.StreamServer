/**
 * @file tests/unit/test_nat_traversal.cpp
 * @brief Unit tests for RFC 6886 NAT-PMP, RFC 6887 PCP, RFC 5389 STUN codecs,
 *        and CGNAT classification rules.
 */

#include <gtest/gtest.h>

#include <array>
#include <cstring>
#include <vector>

#include "src/nat_traversal.h"

namespace {
  using namespace nat_traversal;

  TEST(NatTraversalCodecTest, NatPmpExternalIpRequestAndResponseRoundTrip) {
    const auto req = build_natpmp_external_ip_request();
    EXPECT_EQ(req.size(), 2u);
    EXPECT_EQ(req[0], 0);
    EXPECT_EQ(req[1], 0);

    // version=0, op=128, result=0, epoch=0x01020304, ip=203.0.113.42
    const std::array<std::uint8_t, 12> resp {
      0x00, 0x80, 0x00, 0x00,
      0x01, 0x02, 0x03, 0x04,
      203, 0, 113, 42
    };
    const auto parsed = parse_natpmp_external_ip_response(resp.data(), resp.size());
    ASSERT_TRUE(parsed.has_value());
    EXPECT_EQ(parsed->result_code, 0);
    EXPECT_EQ(parsed->epoch_sec, 0x01020304u);
    EXPECT_EQ(parsed->external_ip, "203.0.113.42");
  }

  TEST(NatTraversalCodecTest, NatPmpMapRequestAndResponseRoundTripForUdpAndTcp) {
    const auto req = build_natpmp_map_request(proto_e::udp, 48021, 48021, 3600);
    EXPECT_EQ(req[0], 0x00);
    EXPECT_EQ(req[1], 0x01);  // UDP = opcode 1
    EXPECT_EQ((static_cast<std::uint16_t>(req[4]) << 8) | req[5], 48021);
    EXPECT_EQ((static_cast<std::uint16_t>(req[6]) << 8) | req[7], 48021);
    EXPECT_EQ(
      (static_cast<std::uint32_t>(req[8]) << 24) |
        (static_cast<std::uint32_t>(req[9]) << 16) |
        (static_cast<std::uint32_t>(req[10]) << 8) |
        req[11],
      3600u
    );

    const std::array<std::uint8_t, 16> resp {
      0x00, 0x81, 0x00, 0x00,
      0x00, 0x00, 0x04, 0xB0,  // epoch 1200
      0xBB, 0x95,              // internal 48021
      0xBB, 0x95,              // external 48021
      0x00, 0x00, 0x0E, 0x10   // lifetime 3600
    };
    const auto parsed = parse_natpmp_map_response(resp.data(), resp.size());
    ASSERT_TRUE(parsed.has_value());
    EXPECT_EQ(parsed->proto, proto_e::udp);
    EXPECT_EQ(parsed->result_code, 0);
    EXPECT_EQ(parsed->internal_port, 48021);
    EXPECT_EQ(parsed->external_port, 48021);
    EXPECT_EQ(parsed->lifetime_sec, 3600u);
  }

  TEST(NatTraversalCodecTest, PcpMapEncodeAndParseHandlesSuccessAndUnsuppVersion) {
    std::array<std::uint8_t, 16> client_ip16 {};
    ASSERT_TRUE(ip_string_to_v6_mapped_bytes("192.168.1.50", client_ip16));
    const std::array<std::uint8_t, 12> nonce {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};

    const auto req = build_pcp_map_request(client_ip16, nonce, proto_e::udp, 48021, 48021, 3600);
    EXPECT_EQ(req.size(), 60u);
    EXPECT_EQ(req[0], 2);   // version 2
    EXPECT_EQ(req[1], 1);   // R=0, opcode=MAP(1)
    EXPECT_EQ(req[36], 17); // IANA UDP
    EXPECT_EQ((static_cast<std::uint16_t>(req[40]) << 8) | req[41], 48021);

    // Construct a matching 60B PCP MAP response with assigned WAN IP 198.51.100.77
    auto resp = req;
    resp[1] = 0x81;  // R=1, opcode=MAP(1)
    resp[3] = 0x00;  // SUCCESS
    std::array<std::uint8_t, 16> wan_ip16 {};
    ASSERT_TRUE(ip_string_to_v6_mapped_bytes("198.51.100.77", wan_ip16));
    std::memcpy(resp.data() + 44, wan_ip16.data(), 16);

    const auto parsed = parse_pcp_map_response(resp.data(), resp.size(), &nonce);
    ASSERT_TRUE(parsed.has_value());
    EXPECT_TRUE(parsed->has_map_payload);
    EXPECT_EQ(parsed->result_code, 0);
    EXPECT_EQ(parsed->assigned_external_port, 48021);
    EXPECT_EQ(parsed->assigned_external_ip, "198.51.100.77");

    // Router returns short 24-byte UNSUPP_VERSION (code 1) to trigger NAT-PMP fallback
    std::array<std::uint8_t, 24> unsupp {};
    unsupp[0] = 0;
    unsupp[1] = 0x81;
    unsupp[3] = 1;  // UNSUPP_VERSION
    const auto parsed_err = parse_pcp_map_response(unsupp.data(), unsupp.size(), &nonce);
    ASSERT_TRUE(parsed_err.has_value());
    EXPECT_EQ(parsed_err->result_code, 1);
    EXPECT_FALSE(parsed_err->has_map_payload);
  }

  TEST(NatTraversalCodecTest, StunBindingRequestAndXorMappedAddressDecode) {
    const std::array<std::uint8_t, 12> tx_id {
      0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6, 0x07, 0x18, 0x29, 0x3A, 0x4B, 0x5C
    };
    const auto req = build_stun_binding_request(tx_id);
    EXPECT_EQ(req.size(), 20u);
    EXPECT_EQ(req[0], 0x00);
    EXPECT_EQ(req[1], 0x01);
    EXPECT_EQ(req[4], 0x21);
    EXPECT_EQ(req[5], 0x12);
    EXPECT_EQ(req[6], 0xA4);
    EXPECT_EQ(req[7], 0x42);

    // Build STUN Binding Success Response with XOR-MAPPED-ADDRESS for 203.0.113.99:54321
    // port 54321 = 0xD431 -> XOR 0x2112 = 0xF523
    // ip 203.0.113.99 = {0xCB, 0x00, 0x71, 0x63} XOR {0x21, 0x12, 0xA4, 0x42} = {0xEA, 0x12, 0xD5, 0x21}
    std::vector<std::uint8_t> resp {
      0x01, 0x01,              // Binding Response
      0x00, 0x0C,              // attr length = 12 bytes
      0x21, 0x12, 0xA4, 0x42,  // Magic Cookie
    };
    resp.insert(resp.end(), tx_id.begin(), tx_id.end());
    resp.insert(resp.end(), {
      0x00, 0x20, 0x00, 0x08,  // XOR-MAPPED-ADDRESS, len=8
      0x00, 0x01, 0xF5, 0x23,  // IPv4 + XOR port
      0xEA, 0x12, 0xD5, 0x21   // XOR IP
    });

    const auto parsed = parse_stun_binding_response(resp.data(), resp.size(), tx_id);
    ASSERT_TRUE(parsed.has_value());
    EXPECT_TRUE(parsed->used_xor_mapped);
    EXPECT_EQ(parsed->mapped_ip, "203.0.113.99");
    EXPECT_EQ(parsed->mapped_port, 54321);
  }

  TEST(NatTraversalCgnatClassifierTest, DetectsRfc6598DoubleNatAndOpenStates) {
    EXPECT_TRUE(is_rfc6598_cgnat_ipv4("100.64.0.1"));
    EXPECT_TRUE(is_rfc6598_cgnat_ipv4("100.127.255.254"));
    EXPECT_FALSE(is_rfc6598_cgnat_ipv4("100.63.255.255"));
    EXPECT_FALSE(is_rfc6598_cgnat_ipv4("100.128.0.1"));

    const auto cgnat = classify_nat({true, mapping_method_e::upnp, "192.168.1.50", "100.72.14.9", "189.200.1.5"});
    EXPECT_EQ(cgnat.classification, nat_classification_e::cgnat_rfc6598);
    EXPECT_TRUE(cgnat.cgnat_detected);

    const auto dbl = classify_nat({true, mapping_method_e::pcp, "192.168.1.50", "198.51.100.2", "203.0.113.99"});
    EXPECT_EQ(dbl.classification, nat_classification_e::double_nat_or_cgnat);
    EXPECT_TRUE(dbl.cgnat_detected);

    const auto open_pcp = classify_nat({true, mapping_method_e::pcp, "192.168.1.50", "203.0.113.99", "203.0.113.99"});
    EXPECT_EQ(open_pcp.classification, nat_classification_e::open_pcp);
    EXPECT_FALSE(open_pcp.cgnat_detected);

    const auto open_natpmp = classify_nat({true, mapping_method_e::natpmp, "192.168.1.50", "203.0.113.99", ""});
    EXPECT_EQ(open_natpmp.classification, nat_classification_e::open_natpmp);
    EXPECT_FALSE(open_natpmp.cgnat_detected);
  }
}  // namespace
