/**
 * @file tests/unit/test_dualsense_hid.cpp
 * @brief Unit tests for Sony DualSense USB descriptors, Input Report 0x01 encoding, and Output Report 0x02 decoding.
 */

#include "src/platform/windows/dualsense_hid.h"
#include "src/platform/windows/usbip_dualsense_backend.h"

#include <WinSock2.h>
#include <WS2tcpip.h>
#include <gtest/gtest.h>

#include <chrono>
#include <cstdio>
#include <cstring>
#include <string_view>

using namespace platf::dualsense_hid;
using namespace std::literals;

TEST(DualSenseHidTest, ValidatesUsbAndHidDescriptors) {
  const auto &dev = usb_device_descriptor();
  ASSERT_EQ(dev.size(), 18u);
  EXPECT_EQ(dev[8], 0x4C);
  EXPECT_EQ(dev[9], 0x05);
  EXPECT_EQ(dev[10], 0xE6);
  EXPECT_EQ(dev[11], 0x0C);

  const auto &cfg = usb_config_descriptor();
  ASSERT_EQ(cfg.size(), 41u);
  EXPECT_EQ(cfg[2], 41u);
  EXPECT_EQ(cfg[3], 0u);

  const auto &rep_desc = hid_report_descriptor();
  EXPECT_EQ(rep_desc.size(), 273u);
  EXPECT_TRUE(validate_hid_report_descriptor(rep_desc.data(), rep_desc.size()));

  const auto imu_calib = build_feature_report(0x05, 0);
  ASSERT_EQ(imu_calib.size(), 41u);
  EXPECT_EQ(imu_calib[0], 0x05);

  const auto fw_info = build_feature_report(0x20, 0);
  ASSERT_EQ(fw_info.size(), 64u);
  EXPECT_EQ(fw_info[0], 0x20);
}

TEST(DualSenseHidTest, EncodesInputReport01WithSticksTriggersButtonsTouchpadAndImu) {
  controller_snapshot_t snap;
  snap.ls_x = 32767;
  snap.ls_y = 32767;   // Moonlight UP (+32767) -> HID Y = 0x00
  snap.rs_x = -32768;  // LEFT -> 0x00
  snap.rs_y = -32768;  // DOWN -> 0xFF
  snap.left_trigger = 0xAA;
  snap.right_trigger = 0x55;
  snap.button_flags = 0x1000 | 0x0008 | 0x0100 | 0x0010 | 0x0400 | 0x100000;  // A + Right + LB + Start + PS + Touchpad
  snap.gyro_x = 10.0f;
  snap.accel_y = 9.80665f;
  snap.touches[0] = {true, 5, 960, 540};
  snap.touches[1] = {false, 0, 0, 0};
  snap.seq = 42;
  snap.battery_percent = 80;

  const auto rep = encode_input_report_01(snap);
  EXPECT_EQ(rep[0], 0x01);
  EXPECT_EQ(rep[1], 0xFF);
  EXPECT_EQ(rep[2], 0x00);
  EXPECT_EQ(rep[3], 0x00);
  EXPECT_EQ(rep[4], 0xFF);
  EXPECT_EQ(rep[5], 0xAA);
  EXPECT_EQ(rep[6], 0x55);
  EXPECT_EQ(rep[7], 42);
  EXPECT_EQ(rep[8] & 0x0F, 2);      // DPad East
  EXPECT_NE(rep[8] & 0x20, 0);      // Cross
  EXPECT_NE(rep[9] & 0x01, 0);      // L1
  EXPECT_NE(rep[9] & 0x20, 0);      // Options
  EXPECT_NE(rep[10] & 0x01, 0);     // PS
  EXPECT_NE(rep[10] & 0x02, 0);     // Touchpad click

  const std::int16_t gyro_x = static_cast<std::int16_t>(rep[16] | (rep[17] << 8));
  EXPECT_EQ(gyro_x, 160);
  const std::int16_t accel_y = static_cast<std::int16_t>(rep[24] | (rep[25] << 8));
  EXPECT_EQ(accel_y, 8192);

  EXPECT_EQ(rep[33], 5);
  const std::uint16_t tx = static_cast<std::uint16_t>(rep[34] | ((rep[35] & 0x0F) << 8));
  const std::uint16_t ty = static_cast<std::uint16_t>(((rep[35] >> 4) & 0x0F) | (rep[36] << 4));
  EXPECT_EQ(tx, 960);
  EXPECT_EQ(ty, 540);
  EXPECT_NE(rep[37] & 0x80, 0);
}

TEST(DualSenseHidTest, ParsesOutputReport02AdaptiveTriggersRumbleAndRgbLed) {
  std::vector<std::uint8_t> report(48, 0);
  report[0] = 0x02;
  report[1] = 0x01 | 0x02 | 0x04 | 0x08;  // rumble + triggers L2/R2
  report[2] = 0x04;                        // RGB LED valid
  report[3] = 0x34;                        // right / high freq rumble
  report[4] = 0xAB;                        // left / low freq rumble
  report[11] = 0x02;                       // R2 Weapon mode
  report[12] = 0x90;
  report[22] = 0x06;                       // L2 Vibration mode
  report[23] = 0x40;
  report[45] = 0x11;
  report[46] = 0x22;
  report[47] = 0xFF;

  output_report02_t parsed;
  ASSERT_TRUE(parse_output_report_02(report.data(), report.size(), parsed));
  EXPECT_TRUE(parsed.has_rumble);
  EXPECT_EQ(parsed.low_freq_rumble, 0xAB00u);
  EXPECT_EQ(parsed.high_freq_rumble, 0x3400u);
  EXPECT_TRUE(parsed.has_triggers);
  EXPECT_EQ(parsed.trigger_event_flags, 0x0C);
  EXPECT_EQ(parsed.trigger_type_right, 0x02);
  EXPECT_EQ(parsed.trigger_right[0], 0x90);
  EXPECT_EQ(parsed.trigger_type_left, 0x06);
  EXPECT_EQ(parsed.trigger_left[0], 0x40);
  EXPECT_TRUE(parsed.has_led);
  EXPECT_EQ(parsed.led_r, 0x11);
  EXPECT_EQ(parsed.led_g, 0x22);
  EXPECT_EQ(parsed.led_b, 0xFF);

  EXPECT_FALSE(parse_output_report_02(report.data(), 20, parsed));
  report[0] = 0x31;
  EXPECT_FALSE(parse_output_report_02(report.data(), report.size(), parsed));
}

namespace {

#pragma pack(push, 1)
  struct WireOpCommon {
    std::uint16_t version;
    std::uint16_t code;
    std::uint32_t status;
  };

  struct WireHeader48 {
    std::uint32_t command;
    std::uint32_t seqnum;
    std::uint32_t devid;
    std::uint32_t direction;
    std::uint32_t ep;
    std::uint32_t transfer_flags;
    std::int32_t transfer_buffer_length;
    std::int32_t start_frame;
    std::int32_t number_of_packets;
    std::int32_t interval;
    std::uint8_t setup[8];
  };
#pragma pack(pop)

  SOCKET connect_loopback(std::uint16_t port) {
    SOCKET s = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (s == INVALID_SOCKET) {
      return INVALID_SOCKET;
    }
    sockaddr_in addr {};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    addr.sin_port = htons(port);
    if (::connect(s, reinterpret_cast<const sockaddr *>(&addr), sizeof(addr)) != 0) {
      ::closesocket(s);
      return INVALID_SOCKET;
    }
    return s;
  }

  bool tcp_send_all(SOCKET s, const void *buf, std::size_t n) {
    const auto *p = static_cast<const char *>(buf);
    std::size_t off = 0;
    while (off < n) {
      int r = ::send(s, p + off, static_cast<int>(n - off), 0);
      if (r <= 0) {
        return false;
      }
      off += static_cast<std::size_t>(r);
    }
    return true;
  }

  bool tcp_recv_all(SOCKET s, void *buf, std::size_t n) {
    auto *p = static_cast<char *>(buf);
    std::size_t off = 0;
    while (off < n) {
      int r = ::recv(s, p + off, static_cast<int>(n - off), 0);
      if (r <= 0) {
        return false;
      }
      off += static_cast<std::size_t>(r);
    }
    return true;
  }

}  // namespace

TEST(DualSenseHidTest, UsbIpLoopbackProtocolRoundTrip) {
  auto mail = std::make_shared<safe::mail_raw_t>();
  auto fq = mail->queue<platf::gamepad_feedback_msg_t>("gamepad_feedback"sv);

  platf::UsbIpDualSenseBackend backend;
  ASSERT_TRUE(backend.start_test_loopback_slot(0, fq));
  ASSERT_NE(backend.tcp_port(), 0);
  EXPECT_EQ(backend.active_slot_count(), 1u);

  // 1) OP_REQ_DEVLIST
  {
    SOCKET s = connect_loopback(backend.tcp_port());
    ASSERT_NE(s, INVALID_SOCKET);
    WireOpCommon req {htons(0x0111), htons(0x8005), 0};
    ASSERT_TRUE(tcp_send_all(s, &req, sizeof(req)));
    WireOpCommon rep {};
    ASSERT_TRUE(tcp_recv_all(s, &rep, sizeof(rep)));
    EXPECT_EQ(ntohs(rep.code), 0x0005);
    EXPECT_EQ(ntohl(rep.status), 0u);
    std::uint32_t ndev_be = 0;
    ASSERT_TRUE(tcp_recv_all(s, &ndev_be, sizeof(ndev_be)));
    EXPECT_EQ(ntohl(ndev_be), 1u);
    std::vector<std::uint8_t> dev_and_iface(312 + 4);
    ASSERT_TRUE(tcp_recv_all(s, dev_and_iface.data(), dev_and_iface.size()));
    const std::uint16_t vid = static_cast<std::uint16_t>((dev_and_iface[300] << 8) | dev_and_iface[301]);
    const std::uint16_t pid = static_cast<std::uint16_t>((dev_and_iface[302] << 8) | dev_and_iface[303]);
    EXPECT_EQ(vid, 0x054Cu);
    EXPECT_EQ(pid, 0x0CE6u);
    ::closesocket(s);
  }

  // 2) OP_REQ_IMPORT + Control GET_DESCRIPTOR + Interrupt IN + Interrupt OUT
  SOCKET s = connect_loopback(backend.tcp_port());
  ASSERT_NE(s, INVALID_SOCKET);
  WireOpCommon imp_req {htons(0x0111), htons(0x8003), 0};
  char busid[32] {};
  std::snprintf(busid, sizeof(busid), "1-1");
  ASSERT_TRUE(tcp_send_all(s, &imp_req, sizeof(imp_req)));
  ASSERT_TRUE(tcp_send_all(s, busid, sizeof(busid)));

  WireOpCommon imp_rep {};
  std::vector<std::uint8_t> wire_dev(312);
  ASSERT_TRUE(tcp_recv_all(s, &imp_rep, sizeof(imp_rep)));
  EXPECT_EQ(ntohs(imp_rep.code), 0x0003);
  EXPECT_EQ(ntohl(imp_rep.status), 0u);
  ASSERT_TRUE(tcp_recv_all(s, wire_dev.data(), wire_dev.size()));

  // GET_DESCRIPTOR (Device = 0x01)
  WireHeader48 get_dev {};
  get_dev.command = htonl(1);
  get_dev.seqnum = htonl(10);
  get_dev.direction = htonl(1);
  get_dev.ep = htonl(0);
  get_dev.transfer_buffer_length = static_cast<std::int32_t>(htonl(18));
  get_dev.setup[0] = 0x80;
  get_dev.setup[1] = 0x06;
  get_dev.setup[2] = 0x00;
  get_dev.setup[3] = 0x01;
  get_dev.setup[6] = 18;
  ASSERT_TRUE(tcp_send_all(s, &get_dev, sizeof(get_dev)));

  WireHeader48 ret {};
  ASSERT_TRUE(tcp_recv_all(s, &ret, sizeof(ret)));
  EXPECT_EQ(ntohl(ret.seqnum), 10u);
  EXPECT_EQ(ntohl(ret.transfer_flags), 0u);
  const std::int32_t dev_len = static_cast<std::int32_t>(ntohl(static_cast<std::uint32_t>(ret.transfer_buffer_length)));
  EXPECT_EQ(dev_len, 18);
  std::vector<std::uint8_t> dev_bytes(18);
  ASSERT_TRUE(tcp_recv_all(s, dev_bytes.data(), dev_bytes.size()));
  EXPECT_EQ(dev_bytes[8], 0x4C);
  EXPECT_EQ(dev_bytes[10], 0xE6);

  // EP4 Interrupt IN -> update_state -> receive Input Report 0x01
  WireHeader48 irq_in {};
  irq_in.command = htonl(1);
  irq_in.seqnum = htonl(11);
  irq_in.direction = htonl(1);
  irq_in.ep = htonl(4);
  irq_in.transfer_buffer_length = static_cast<std::int32_t>(htonl(64));
  ASSERT_TRUE(tcp_send_all(s, &irq_in, sizeof(irq_in)));

  platf::gamepad_state_t gs {};
  gs.lsX = 32767;
  gs.lt = 0xCC;
  gs.buttonFlags = 0x1000;  // Cross / A
  backend.update_state(0, gs);

  ASSERT_TRUE(tcp_recv_all(s, &ret, sizeof(ret)));
  EXPECT_EQ(ntohl(ret.seqnum), 11u);
  EXPECT_EQ(static_cast<std::int32_t>(ntohl(static_cast<std::uint32_t>(ret.transfer_buffer_length))), 64);
  std::vector<std::uint8_t> in_rep(64);
  ASSERT_TRUE(tcp_recv_all(s, in_rep.data(), in_rep.size()));
  EXPECT_EQ(in_rep[0], 0x01);
  EXPECT_EQ(in_rep[1], 0xFF);
  EXPECT_EQ(in_rep[5], 0xCC);
  EXPECT_NE(in_rep[8] & 0x20, 0);

  // EP3 Interrupt OUT -> Output Report 0x02 -> feedback_queue receives rumble + LED + triggers
  std::vector<std::uint8_t> out_rep(48, 0);
  out_rep[0] = 0x02;
  out_rep[1] = 0x01 | 0x02 | 0x04 | 0x08;
  out_rep[2] = 0x04;
  out_rep[3] = 0x44;
  out_rep[4] = 0x88;
  out_rep[11] = 0x02;
  out_rep[22] = 0x06;
  out_rep[45] = 0x10;
  out_rep[46] = 0x20;
  out_rep[47] = 0x30;

  WireHeader48 irq_out {};
  irq_out.command = htonl(1);
  irq_out.seqnum = htonl(12);
  irq_out.direction = htonl(0);
  irq_out.ep = htonl(3);
  irq_out.transfer_buffer_length = static_cast<std::int32_t>(htonl(static_cast<std::uint32_t>(out_rep.size())));
  ASSERT_TRUE(tcp_send_all(s, &irq_out, sizeof(irq_out)));
  ASSERT_TRUE(tcp_send_all(s, out_rep.data(), out_rep.size()));

  ASSERT_TRUE(tcp_recv_all(s, &ret, sizeof(ret)));
  EXPECT_EQ(ntohl(ret.seqnum), 12u);

  auto m1 = fq->pop(std::chrono::milliseconds(500));
  auto m2 = fq->pop(std::chrono::milliseconds(500));
  auto m3 = fq->pop(std::chrono::milliseconds(500));
  ASSERT_TRUE(m1 && m2 && m3);
  EXPECT_EQ(m1->type, platf::gamepad_feedback_e::rumble);
  EXPECT_EQ(m2->type, platf::gamepad_feedback_e::set_rgb_led);
  EXPECT_EQ(m3->type, platf::gamepad_feedback_e::set_adaptive_triggers);
  EXPECT_EQ(m3->data.adaptive_triggers.type_right, 0x02);
  EXPECT_EQ(m3->data.adaptive_triggers.type_left, 0x06);

  ::closesocket(s);
}
