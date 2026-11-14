/**
 * @file tests/unit/test_turbo_input.cpp
 * @brief Unit & loopback integration tests for encrypted Turbo Input UDP/TCP server.
 */

#include <array>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <cstring>
#include <mutex>
#include <thread>
#include <vector>

#include <boost/asio.hpp>
#include <gtest/gtest.h>
#include <moonlight-common-c/src/Input.h>
#include <moonlight-common-c/src/Limelight.h>

#include "src/turbo_input_server.h"

namespace {
  void write_u16_le(std::uint8_t *p, std::uint16_t v) {
    p[0] = static_cast<std::uint8_t>(v & 0xFF);
    p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
  }

  void write_u32_le(std::uint8_t *p, std::uint32_t v) {
    p[0] = static_cast<std::uint8_t>(v & 0xFF);
    p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
    p[2] = static_cast<std::uint8_t>((v >> 16) & 0xFF);
    p[3] = static_cast<std::uint8_t>((v >> 24) & 0xFF);
  }

  std::vector<std::uint8_t> build_state_payload(
    std::uint32_t seq,
    std::uint8_t id,
    std::uint16_t active_mask,
    std::uint32_t buttons,
    std::uint8_t lt,
    std::uint8_t rt,
    std::int16_t lx,
    std::int16_t ly,
    std::int16_t rx,
    std::int16_t ry,
    std::uint32_t pressed_edges,
    std::uint8_t flags = 0
  ) {
    std::vector<std::uint8_t> p(turbo_input::kGamepadStatePayloadSize);
    p[0] = static_cast<std::uint8_t>(turbo_input::MsgType::gamepad_state);
    write_u32_le(&p[1], seq);
    p[5] = id;
    write_u16_le(&p[6], active_mask);
    write_u32_le(&p[8], buttons);
    p[12] = lt;
    p[13] = rt;
    write_u16_le(&p[14], static_cast<std::uint16_t>(lx));
    write_u16_le(&p[16], static_cast<std::uint16_t>(ly));
    write_u16_le(&p[18], static_cast<std::uint16_t>(rx));
    write_u16_le(&p[20], static_cast<std::uint16_t>(ry));
    write_u32_le(&p[22], pressed_edges);
    p[26] = flags;
    return p;
  }

  std::vector<std::uint8_t> build_ping_payload(std::uint64_t ts_us) {
    std::vector<std::uint8_t> p(turbo_input::kPingPayloadSize);
    p[0] = static_cast<std::uint8_t>(turbo_input::MsgType::ping);
    for (int i = 0; i < 8; ++i) {
      p[1 + i] = static_cast<std::uint8_t>((ts_us >> (i * 8)) & 0xFF);
    }
    return p;
  }
}  // namespace

TEST(TurboInputCryptoTest, SealsOpensAndRejectsTampering) {
  turbo_input::Key key {};
  ASSERT_TRUE(turbo_input::generate_random_key(key));
  const std::uint32_t sid = turbo_input::generate_session_id();
  EXPECT_NE(sid, 0u);

  const auto plain = build_state_payload(42, 0, 0x0001, 0x00011000u, 128, 255, -1000, 2000, 300, -400, 0);
  std::vector<std::uint8_t> wire;
  ASSERT_TRUE(turbo_input::seal_packet(key, sid, 7, plain.data(), plain.size(), wire));
  EXPECT_EQ(wire.size(), turbo_input::kHeaderBytes + plain.size() + turbo_input::kTagBytes);

  std::uint32_t out_sid = 0;
  std::uint64_t out_nonce = 0;
  auto opened = turbo_input::open_packet(key, wire.data(), wire.size(), out_sid, out_nonce);
  ASSERT_TRUE(opened.has_value());
  EXPECT_EQ(out_sid, sid);
  EXPECT_EQ(out_nonce, 7ULL);
  EXPECT_EQ(*opened, plain);

  // Flip 1 ciphertext bit -> Poly1305 tag check must fail
  wire[turbo_input::kHeaderBytes + 2] ^= 0x01;
  EXPECT_FALSE(turbo_input::open_packet(key, wire.data(), wire.size(), out_sid, out_nonce).has_value());
}

TEST(TurboInputTrackerTest, RecoversButtonEdgeAfterDropAndBuildsDisconnectFlush) {
  turbo_input::InputSessionTracker tracker;
  turbo_input::DecodedInputBatch batch;
  bool edge_rec = false;
  bool dropped_ooo = false;
  bool is_ping = false;
  std::uint64_t ping_ts = 0;

  const auto p1 = build_state_payload(1, 0, 0x0001, 0, 0, 0, 0, 0, 0, 0, 0);
  ASSERT_TRUE(tracker.decode_payload(p1.data(), p1.size(), 100, batch, edge_rec, dropped_ooo, is_ping, ping_ts));
  EXPECT_FALSE(edge_rec);
  ASSERT_EQ(batch.packets.size(), 1u);

  // seq=2 lost; seq=3 arrives released with pressed_edges=A_FLAG -> must synthesize press + release
  const auto p3 = build_state_payload(3, 0, 0x0001, 0, 0, 0, 1200, -500, 0, 0, A_FLAG);
  ASSERT_TRUE(tracker.decode_payload(p3.data(), p3.size(), 104, batch, edge_rec, dropped_ooo, is_ping, ping_ts));
  EXPECT_TRUE(edge_rec);
  ASSERT_EQ(batch.packets.size(), 2u);

  NV_MULTI_CONTROLLER_PACKET press_pkt {};
  NV_MULTI_CONTROLLER_PACKET rel_pkt {};
  std::memcpy(&press_pkt, batch.packets[0].data(), sizeof(press_pkt));
  std::memcpy(&rel_pkt, batch.packets[1].data(), sizeof(rel_pkt));
  EXPECT_EQ(static_cast<std::uint16_t>(press_pkt.buttonFlags), A_FLAG);
  EXPECT_EQ(static_cast<std::uint16_t>(rel_pkt.buttonFlags), 0);

  // Out-of-order seq=2 arriving late -> dropped
  const auto p2 = build_state_payload(2, 0, 0x0001, A_FLAG, 0, 0, 0, 0, 0, 0, A_FLAG);
  EXPECT_FALSE(tracker.decode_payload(p2.data(), p2.size(), 106, batch, edge_rec, dropped_ooo, is_ping, ping_ts));
  EXPECT_TRUE(dropped_ooo);

  // Disconnect flush must emit zeroed state then unplug packet for active slot 0
  const auto flush = tracker.build_disconnect_flush();
  ASSERT_EQ(flush.size(), 2u);
  NV_MULTI_CONTROLLER_PACKET zero_pkt {};
  NV_MULTI_CONTROLLER_PACKET unplug_pkt {};
  std::memcpy(&zero_pkt, flush[0].data(), sizeof(zero_pkt));
  std::memcpy(&unplug_pkt, flush[1].data(), sizeof(unplug_pkt));
  EXPECT_NE(zero_pkt.activeGamepadMask, 0);
  EXPECT_EQ(zero_pkt.buttonFlags, 0);
  EXPECT_EQ(unplug_pkt.activeGamepadMask, 0);
}

TEST(TurboInputTrackerTest, EncodesAllFeedbackVariants) {
  const auto rumble = turbo_input::encode_feedback_message(platf::gamepad_feedback_msg_t::make_rumble(1, 0x1234, 0xABCD));
  ASSERT_TRUE(rumble.has_value());
  EXPECT_EQ((*rumble)[0], static_cast<std::uint8_t>(turbo_input::MsgType::feedback_rumble));

  const std::array<std::uint8_t, 10> l {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
  const std::array<std::uint8_t, 10> r {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
  const auto trig = turbo_input::encode_feedback_message(
    platf::gamepad_feedback_msg_t::make_adaptive_triggers(0, 0x0C, 0x02, 0x06, l, r)
  );
  ASSERT_TRUE(trig.has_value());
  ASSERT_EQ(trig->size(), 26u);
  EXPECT_EQ((*trig)[0], static_cast<std::uint8_t>(turbo_input::MsgType::feedback_adaptive_triggers));
  EXPECT_EQ((*trig)[6], 1);
  EXPECT_EQ((*trig)[16], 10);
}

TEST(TurboInputServerTest, RoundTripsEncryptedUdpInputAndAdaptiveFeedback) {
  turbo_input::TurboInputServer srv;
  ASSERT_TRUE(srv.start(0, 0, true));
  const std::uint16_t udp_port = srv.udp_port();
  ASSERT_NE(udp_port, 0);

  turbo_input::Key key {};
  ASSERT_TRUE(turbo_input::generate_random_key(key));
  const std::uint32_t sid = 0xCAFEBABEu;
  const std::uint32_t launch_id = 77;
  srv.register_session(launch_id, sid, key);

  std::mutex mtx;
  std::condition_variable cv;
  std::vector<std::vector<std::uint8_t>> received;
  srv.attach_session(launch_id, [&](std::vector<std::uint8_t> &&pkt) {
    {
      std::lock_guard lg(mtx);
      received.push_back(std::move(pkt));
    }
    cv.notify_all();
  });

  boost::asio::io_context client_io;
  boost::asio::ip::udp::socket client_sock(client_io, boost::asio::ip::udp::v4());
  const boost::asio::ip::udp::endpoint target(boost::asio::ip::make_address_v4("127.0.0.1"), udp_port);

  // Send encrypted PING -> expect PONG back
  const auto ping_plain = build_ping_payload(987654321ULL);
  std::vector<std::uint8_t> wire;
  ASSERT_TRUE(turbo_input::seal_packet(key, sid, 1, ping_plain.data(), ping_plain.size(), wire));
  client_sock.send_to(boost::asio::buffer(wire), target);

  std::array<std::uint8_t, turbo_input::kMaxWireBytes> rx_buf {};
  boost::asio::ip::udp::endpoint from;
  const std::size_t pong_len = client_sock.receive_from(boost::asio::buffer(rx_buf), from);
  std::uint32_t out_sid = 0;
  std::uint64_t out_nonce = 0;
  auto pong = turbo_input::open_packet(key, rx_buf.data(), pong_len, out_sid, out_nonce);
  ASSERT_TRUE(pong.has_value());
  EXPECT_EQ((*pong)[0], static_cast<std::uint8_t>(turbo_input::MsgType::pong));
  EXPECT_NE(out_nonce & turbo_input::kDirectionServerToClientMask, 0ULL);

  // Replay exact same nonce=1 PING -> dropped by ReplayWindow64
  client_sock.send_to(boost::asio::buffer(wire), target);

  // Send encrypted controller state nonce=2 -> delivered to sink
  const auto st_plain = build_state_payload(1, 0, 0x0001, X_FLAG, 10, 20, 500, -500, 0, 0, X_FLAG);
  ASSERT_TRUE(turbo_input::seal_packet(key, sid, 2, st_plain.data(), st_plain.size(), wire));
  client_sock.send_to(boost::asio::buffer(wire), target);

  {
    std::unique_lock lk(mtx);
    ASSERT_TRUE(cv.wait_for(lk, std::chrono::seconds(2), [&]() { return !received.empty(); }));
    NV_MULTI_CONTROLLER_PACKET mc {};
    std::memcpy(&mc, received[0].data(), sizeof(mc));
    EXPECT_EQ(static_cast<std::uint16_t>(mc.buttonFlags), X_FLAG);
    EXPECT_EQ(mc.leftStickX, 500);
  }

  // Send S->C RGB feedback -> received encrypted by UDP client
  ASSERT_TRUE(srv.try_send_feedback(launch_id, platf::gamepad_feedback_msg_t::make_rgb_led(0, 12, 34, 56)));
  const std::size_t fb_len = client_sock.receive_from(boost::asio::buffer(rx_buf), from);
  auto fb = turbo_input::open_packet(key, rx_buf.data(), fb_len, out_sid, out_nonce);
  ASSERT_TRUE(fb.has_value());
  ASSERT_EQ(fb->size(), 6u);
  EXPECT_EQ((*fb)[0], static_cast<std::uint8_t>(turbo_input::MsgType::feedback_rgb_led));
  EXPECT_EQ((*fb)[3], 12);
  EXPECT_EQ((*fb)[4], 34);
  EXPECT_EQ((*fb)[5], 56);

  // Unregister triggers zero-flush + unplug packets
  srv.unregister_session(launch_id);
  {
    std::unique_lock lk(mtx);
    EXPECT_GE(received.size(), 3u);
  }

  const auto st = srv.stats();
  EXPECT_GE(st.packets_dropped_replay, 1u);
  EXPECT_GE(st.feedback_sent, 1u);
  srv.stop();
}

TEST(TurboInputServerTest, RoundTripsAdbReverseTcpAndFlushesOnDisconnect) {
  turbo_input::TurboInputServer srv;
  ASSERT_TRUE(srv.start(0, 0, true));
  const std::uint16_t tcp_port = srv.tcp_port();
  ASSERT_NE(tcp_port, 0);

  turbo_input::Key key {};
  ASSERT_TRUE(turbo_input::generate_random_key(key));
  const std::uint32_t sid = 0x11223344u;
  const std::uint32_t launch_id = 88;
  srv.register_session(launch_id, sid, key);

  std::mutex mtx;
  std::condition_variable cv;
  std::vector<std::vector<std::uint8_t>> received;
  srv.attach_session(launch_id, [&](std::vector<std::uint8_t> &&pkt) {
    {
      std::lock_guard lg(mtx);
      received.push_back(std::move(pkt));
    }
    cv.notify_all();
  });

  boost::asio::io_context io;
  boost::asio::ip::tcp::socket sock(io);
  sock.connect(boost::asio::ip::tcp::endpoint(boost::asio::ip::make_address_v4("127.0.0.1"), tcp_port));

  auto send_frame = [&](std::uint64_t nonce, const std::vector<std::uint8_t> &plain) {
    std::vector<std::uint8_t> wire;
    ASSERT_TRUE(turbo_input::seal_packet(key, sid, nonce, plain.data(), plain.size(), wire));
    std::vector<std::uint8_t> framed(2 + wire.size());
    write_u16_le(framed.data(), static_cast<std::uint16_t>(wire.size()));
    std::memcpy(framed.data() + 2, wire.data(), wire.size());
    boost::asio::write(sock, boost::asio::buffer(framed));
  };

  send_frame(1, build_state_payload(1, 0, 0x0001, A_FLAG, 255, 0, 0, 0, 0, 0, A_FLAG));
  {
    std::unique_lock lk(mtx);
    ASSERT_TRUE(cv.wait_for(lk, std::chrono::seconds(2), [&]() { return received.size() >= 1; }));
  }

  ASSERT_TRUE(srv.try_send_feedback(launch_id, platf::gamepad_feedback_msg_t::make_rumble(0, 0x1111, 0x2222)));
  std::array<std::uint8_t, 2> len_buf {};
  boost::asio::read(sock, boost::asio::buffer(len_buf));
  const std::uint16_t frame_len = static_cast<std::uint16_t>(len_buf[0]) | (static_cast<std::uint16_t>(len_buf[1]) << 8);
  std::vector<std::uint8_t> rx_wire(frame_len);
  boost::asio::read(sock, boost::asio::buffer(rx_wire));
  std::uint32_t out_sid = 0;
  std::uint64_t out_nonce = 0;
  auto fb = turbo_input::open_packet(key, rx_wire.data(), rx_wire.size(), out_sid, out_nonce);
  ASSERT_TRUE(fb.has_value());
  EXPECT_EQ((*fb)[0], static_cast<std::uint8_t>(turbo_input::MsgType::feedback_rumble));

  // Abrupt client TCP socket close must auto-flush held button A + unplug virtual pad
  sock.close();
  {
    std::unique_lock lk(mtx);
    ASSERT_TRUE(cv.wait_for(lk, std::chrono::seconds(2), [&]() { return received.size() >= 3; }));
    NV_MULTI_CONTROLLER_PACKET zero_pkt {};
    std::memcpy(&zero_pkt, received[1].data(), sizeof(zero_pkt));
    EXPECT_EQ(zero_pkt.buttonFlags, 0);
  }

  srv.unregister_session(launch_id);
  srv.stop();
}
