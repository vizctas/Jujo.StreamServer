#include <gtest/gtest.h>

#include "src/dsu_server.h"

#ifdef _WIN32
  #include <winsock2.h>
  #include <ws2tcpip.h>
#else
  #include <arpa/inet.h>
  #include <netinet/in.h>
  #include <sys/socket.h>
  #include <unistd.h>
#endif

#include <array>
#include <cstring>
#include <vector>

namespace {
  std::uint16_t read_u16_le(const std::uint8_t *p) {
    return static_cast<std::uint16_t>(p[0]) | (static_cast<std::uint16_t>(p[1]) << 8);
  }

  std::uint32_t read_u32_le(const std::uint8_t *p) {
    return static_cast<std::uint32_t>(p[0]) |
           (static_cast<std::uint32_t>(p[1]) << 8) |
           (static_cast<std::uint32_t>(p[2]) << 16) |
           (static_cast<std::uint32_t>(p[3]) << 24);
  }

  float read_f32_le(const std::uint8_t *p) {
    std::uint32_t bits = read_u32_le(p);
    float f = 0.0f;
    std::memcpy(&f, &bits, sizeof(f));
    return f;
  }

  std::vector<std::uint8_t> make_client_packet(std::uint32_t client_id, std::uint32_t msg_type, const std::vector<std::uint8_t> &body) {
    std::vector<std::uint8_t> pkt(16 + 4 + body.size(), 0);
    pkt[0] = 'D';
    pkt[1] = 'S';
    pkt[2] = 'U';
    pkt[3] = 'C';
    const std::uint16_t len = static_cast<std::uint16_t>(4 + body.size());
    pkt[4] = static_cast<std::uint8_t>(dsu::kProtocolVersion & 0xFFu);
    pkt[5] = static_cast<std::uint8_t>((dsu::kProtocolVersion >> 8) & 0xFFu);
    pkt[6] = static_cast<std::uint8_t>(len & 0xFFu);
    pkt[7] = static_cast<std::uint8_t>((len >> 8) & 0xFFu);
    pkt[12] = static_cast<std::uint8_t>(client_id & 0xFFu);
    pkt[13] = static_cast<std::uint8_t>((client_id >> 8) & 0xFFu);
    pkt[14] = static_cast<std::uint8_t>((client_id >> 16) & 0xFFu);
    pkt[15] = static_cast<std::uint8_t>((client_id >> 24) & 0xFFu);
    pkt[16] = static_cast<std::uint8_t>(msg_type & 0xFFu);
    pkt[17] = static_cast<std::uint8_t>((msg_type >> 8) & 0xFFu);
    pkt[18] = static_cast<std::uint8_t>((msg_type >> 16) & 0xFFu);
    pkt[19] = static_cast<std::uint8_t>((msg_type >> 24) & 0xFFu);
    if (!body.empty()) {
      std::memcpy(pkt.data() + 20, body.data(), body.size());
    }
    const auto crc = dsu::crc32_packet(pkt.data(), pkt.size());
    pkt[8] = static_cast<std::uint8_t>(crc & 0xFFu);
    pkt[9] = static_cast<std::uint8_t>((crc >> 8) & 0xFFu);
    pkt[10] = static_cast<std::uint8_t>((crc >> 16) & 0xFFu);
    pkt[11] = static_cast<std::uint8_t>((crc >> 24) & 0xFFu);
    return pkt;
  }
}  // namespace

TEST(DsuServerTest, ParsesValidRequestsAndRejectsCorruptCrc) {
  auto pkt = make_client_packet(42, dsu::kMsgPadData, {0x01, 0x02, 0, 0, 0, 0, 0, 3});
  auto parsed = dsu::parse_request(pkt.data(), pkt.size());
  ASSERT_TRUE(parsed.has_value());
  EXPECT_EQ(parsed->kind, dsu::request_t::kind_e::pad_data);
  EXPECT_EQ(parsed->client_id, 42u);
  EXPECT_EQ(parsed->sub_flags, 0x01u);
  EXPECT_EQ(parsed->sub_slot, 0x02u);
  EXPECT_EQ(parsed->sub_mac[5], 3u);

  pkt[20] ^= 0xFFu;
  EXPECT_FALSE(dsu::parse_request(pkt.data(), pkt.size()).has_value());
}

TEST(DsuServerTest, SerializesPadDataWithCemuhookAxesAndCrc) {
  dsu::pad_state_t pad;
  pad.connected = true;
  pad.buttons = 0x1001u;  // UP + A
  pad.lt = 200;
  pad.accel_mps2 = {0.0f, dsu::kStandardGravity, 0.0f};
  pad.gyro_dps = {12.5f, -3.0f, 4.5f};
  pad.motion_us = 1234567ULL;

  const auto pkt = dsu::build_pad_data_reply(0xCAFEBABEu, 0, pad, 7);
  EXPECT_EQ(std::memcmp(pkt.data(), "DSUS", 4), 0);
  EXPECT_EQ(read_u16_le(pkt.data() + 4), dsu::kProtocolVersion);
  EXPECT_EQ(read_u16_le(pkt.data() + 6), 84u);
  EXPECT_EQ(read_u32_le(pkt.data() + 8), dsu::crc32_packet(pkt.data(), pkt.size()));
  EXPECT_EQ(read_u32_le(pkt.data() + 16), dsu::kMsgPadData);
  EXPECT_EQ(pkt[21], 2u);
  EXPECT_EQ(pkt[22], 2u);
  EXPECT_EQ(pkt[31], 1u);
  EXPECT_EQ(read_u32_le(pkt.data() + 32), 7u);
  EXPECT_FLOAT_EQ(read_f32_le(pkt.data() + 80), -1.0f);
  EXPECT_FLOAT_EQ(read_f32_le(pkt.data() + 88), 12.5f);
  EXPECT_FLOAT_EQ(read_f32_le(pkt.data() + 92), 3.0f);
  EXPECT_FLOAT_EQ(read_f32_le(pkt.data() + 96), -4.5f);
}

TEST(DsuServerTest, LoopbackUdpDeliversSubscriptionMotionPacket) {
  auto &srv = dsu::server::instance();
  ASSERT_TRUE(srv.start(0, "127.0.0.1"));
  const auto port = srv.bound_port();
  ASSERT_NE(port, 0u);

#ifdef _WIN32
  SOCKET cli = ::socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
  ASSERT_NE(cli, INVALID_SOCKET);
  DWORD rcv_ms = 1000;
  ::setsockopt(cli, SOL_SOCKET, SO_RCVTIMEO, reinterpret_cast<const char *>(&rcv_ms), sizeof(rcv_ms));
#else
  int cli = ::socket(AF_INET, SOCK_DGRAM, 0);
  ASSERT_GE(cli, 0);
  struct timeval tv {1, 0};
  ::setsockopt(cli, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
#endif

  sockaddr_in dst {};
  dst.sin_family = AF_INET;
  dst.sin_port = htons(port);
  ::inet_pton(AF_INET, "127.0.0.1", &dst.sin_addr);

  const auto sub_pkt = make_client_packet(99, dsu::kMsgPadData, {0x01, 0x00, 0, 0, 0, 0, 0, 0});
  ASSERT_EQ(
    ::sendto(cli, reinterpret_cast<const char *>(sub_pkt.data()), static_cast<int>(sub_pkt.size()), 0, reinterpret_cast<const sockaddr *>(&dst), sizeof(dst)),
    static_cast<int>(sub_pkt.size())
  );

  // Brief yield so recv_loop registers the subscriber, then push motion
  std::this_thread::sleep_for(std::chrono::milliseconds(30));
  srv.on_pad_connected(0);
  srv.on_pad_motion(0, 2, 15.0f, 5.0f, -2.5f, 999999ULL);

  std::array<std::uint8_t, 256> rx {};
  std::uint32_t seen_pad_packets = 0;
  float rx_pitch = 0.0f;
  for (int i = 0; i < 4; ++i) {
    sockaddr_storage src {};
#ifdef _WIN32
    int src_len = sizeof(src);
    const int n = ::recvfrom(cli, reinterpret_cast<char *>(rx.data()), static_cast<int>(rx.size()), 0, reinterpret_cast<sockaddr *>(&src), &src_len);
#else
    socklen_t src_len = sizeof(src);
    const ssize_t n = ::recvfrom(cli, rx.data(), rx.size(), 0, reinterpret_cast<sockaddr *>(&src), &src_len);
#endif
    if (n <= 0) break;
    if (n == static_cast<int>(dsu::kPadDataBytes) && read_u32_le(rx.data() + 16) == dsu::kMsgPadData) {
      ++seen_pad_packets;
      rx_pitch = read_f32_le(rx.data() + 88);
      if (rx_pitch > 10.0f) break;
    }
  }

#ifdef _WIN32
  ::closesocket(cli);
#else
  ::close(cli);
#endif
  srv.stop();

  EXPECT_GE(seen_pad_packets, 1u);
  EXPECT_FLOAT_EQ(rx_pitch, 15.0f);
}
