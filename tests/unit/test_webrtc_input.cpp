/**
 * @file tests/unit/test_webrtc_input.cpp
 * @brief Unit tests for WebRTC binary input decoding, sequence gating, and DualSense feedback JSON.
 */

#include <array>
#include <cstdint>
#include <cstring>
#include <limits>
#include <vector>

#include <gtest/gtest.h>
#include <moonlight-common-c/src/Input.h>
#include <moonlight-common-c/src/Limelight.h>
#include <nlohmann/json.hpp>

#include "src/webrtc_input_codec.h"

namespace {
  void append_u16_le(std::vector<std::uint8_t> &buf, std::uint16_t v) {
    buf.push_back(static_cast<std::uint8_t>(v & 0xFF));
    buf.push_back(static_cast<std::uint8_t>((v >> 8) & 0xFF));
  }

  void append_u32_le(std::vector<std::uint8_t> &buf, std::uint32_t v) {
    buf.push_back(static_cast<std::uint8_t>(v & 0xFF));
    buf.push_back(static_cast<std::uint8_t>((v >> 8) & 0xFF));
    buf.push_back(static_cast<std::uint8_t>((v >> 16) & 0xFF));
    buf.push_back(static_cast<std::uint8_t>((v >> 24) & 0xFF));
  }

  void append_f32_le(std::vector<std::uint8_t> &buf, float v) {
    std::uint32_t bits = 0;
    std::memcpy(&bits, &v, sizeof(bits));
    append_u32_le(buf, bits);
  }

  std::vector<std::uint8_t> encode_mouse_move(std::uint16_t seq, std::uint16_t x_u16, std::uint16_t y_u16) {
    std::vector<std::uint8_t> buf;
    buf.push_back(webrtc_input::kBinaryMouseMove);
    append_u16_le(buf, seq);
    append_u16_le(buf, x_u16);
    append_u16_le(buf, y_u16);
    return buf;
  }

  std::vector<std::uint8_t> encode_gamepad_state(
    std::uint16_t seq,
    std::uint8_t id,
    std::uint16_t active_mask,
    std::uint32_t buttons,
    std::uint8_t lt,
    std::uint8_t rt,
    std::int16_t lx,
    std::int16_t ly,
    std::int16_t rx,
    std::int16_t ry
  ) {
    std::vector<std::uint8_t> buf;
    buf.push_back(webrtc_input::kBinaryGamepadState);
    append_u16_le(buf, seq);
    buf.push_back(id);
    append_u16_le(buf, active_mask);
    append_u32_le(buf, buttons);
    buf.push_back(lt);
    buf.push_back(rt);
    append_u16_le(buf, static_cast<std::uint16_t>(lx));
    append_u16_le(buf, static_cast<std::uint16_t>(ly));
    append_u16_le(buf, static_cast<std::uint16_t>(rx));
    append_u16_le(buf, static_cast<std::uint16_t>(ry));
    return buf;
  }

  std::vector<std::uint8_t> encode_gamepad_motion(
    std::uint16_t seq,
    std::uint8_t id,
    std::uint8_t motion_type,
    float x,
    float y,
    float z
  ) {
    std::vector<std::uint8_t> buf;
    buf.push_back(webrtc_input::kBinaryGamepadMotion);
    append_u16_le(buf, seq);
    buf.push_back(id);
    buf.push_back(motion_type);
    append_f32_le(buf, x);
    append_f32_le(buf, y);
    append_f32_le(buf, z);
    return buf;
  }
}  // namespace

TEST(WebRtcInputCodecTest, DecodesGamepadStateAndDropsOutOfOrderPackets) {
  webrtc_input::BinaryInputState state;

  const auto p10 = encode_gamepad_state(10, 0, 0x0001, 0x00011000u, 200, 50, -12000, 15000, 4000, -8000);
  const auto p9 = encode_gamepad_state(9, 0, 0x0001, 0, 0, 0, 0, 0, 0, 0);
  const auto p11 = encode_gamepad_state(11, 0, 0x0003, 0x00202000u, 255, 10, 32767, -32768, 0, 0);

  auto d10 = webrtc_input::decode_binary_input(state, p10.data(), p10.size(), 100);
  ASSERT_TRUE(d10.has_value());
  ASSERT_TRUE(d10->has_gamepad_state);
  EXPECT_EQ(d10->gamepad_id, 0);
  EXPECT_EQ(d10->active_mask, 0x0001);
  ASSERT_EQ(d10->packet_bytes.size(), sizeof(NV_MULTI_CONTROLLER_PACKET));

  NV_MULTI_CONTROLLER_PACKET pkt {};
  std::memcpy(&pkt, d10->packet_bytes.data(), sizeof(pkt));
  EXPECT_EQ(pkt.controllerNumber, 0);
  EXPECT_EQ(pkt.buttonFlags, 0x1000);
  EXPECT_EQ(pkt.buttonFlags2, 0x0001);
  EXPECT_EQ(pkt.leftTrigger, 200);
  EXPECT_EQ(pkt.rightTrigger, 50);
  EXPECT_EQ(pkt.leftStickX, -12000);
  EXPECT_EQ(pkt.leftStickY, 15000);
  EXPECT_EQ(pkt.rightStickX, 4000);
  EXPECT_EQ(pkt.rightStickY, -8000);

  // Stale reordered packet arrives 5ms later -> dropped
  EXPECT_FALSE(webrtc_input::decode_binary_input(state, p9.data(), p9.size(), 105).has_value());

  // Newer packet arrives -> accepted
  auto d11 = webrtc_input::decode_binary_input(state, p11.data(), p11.size(), 110);
  ASSERT_TRUE(d11.has_value());
  std::memcpy(&pkt, d11->packet_bytes.data(), sizeof(pkt));
  EXPECT_EQ(pkt.buttonFlags, 0x2000);
  EXPECT_EQ(pkt.buttonFlags2, 0x0020);
  EXPECT_EQ(pkt.activeGamepadMask, 0x0003);

  // Idle reset after >= 1000ms allows lower seq on reconnect
  EXPECT_TRUE(webrtc_input::decode_binary_input(state, p9.data(), p9.size(), 1200).has_value());
}

TEST(WebRtcInputCodecTest, SeparatesGyroAndAccelMotionSequences) {
  webrtc_input::BinaryInputState state;

  const auto gyro10 = encode_gamepad_motion(10, 1, LI_MOTION_TYPE_GYRO, 1.5f, -2.25f, 3.0f);
  const auto accel5 = encode_gamepad_motion(5, 1, LI_MOTION_TYPE_ACCEL, 0.0f, 9.81f, -0.5f);

  auto d_gyro = webrtc_input::decode_binary_input(state, gyro10.data(), gyro10.size(), 50);
  ASSERT_TRUE(d_gyro.has_value());
  ASSERT_EQ(d_gyro->packet_bytes.size(), sizeof(SS_CONTROLLER_MOTION_PACKET));

  // Lower accel seq must not be dropped by gyro's higher seq on the same controller
  auto d_accel = webrtc_input::decode_binary_input(state, accel5.data(), accel5.size(), 55);
  ASSERT_TRUE(d_accel.has_value());
  ASSERT_EQ(d_accel->packet_bytes.size(), sizeof(SS_CONTROLLER_MOTION_PACKET));
}

TEST(WebRtcInputCodecTest, RejectsInvalidGamepadIdOrNonFiniteMotion) {
  webrtc_input::BinaryInputState state;

  const auto bad_id = encode_gamepad_state(1, 16, 0x1, 0, 0, 0, 0, 0, 0, 0);
  EXPECT_FALSE(webrtc_input::decode_binary_input(state, bad_id.data(), bad_id.size(), 10).has_value());

  const auto nan_motion = encode_gamepad_motion(1, 0, LI_MOTION_TYPE_GYRO, std::numeric_limits<float>::quiet_NaN(), 0.f, 0.f);
  EXPECT_FALSE(webrtc_input::decode_binary_input(state, nan_motion.data(), nan_motion.size(), 10).has_value());
}

TEST(WebRtcInputCodecTest, SerializesRgbLedAndAdaptiveTriggersFeedback) {
  const auto led_msg = platf::gamepad_feedback_msg_t::make_rgb_led(2, 10, 180, 255);
  const auto led_json_str = webrtc_input::build_gamepad_feedback_payload(led_msg);
  ASSERT_TRUE(led_json_str.has_value());
  const auto led_json = nlohmann::json::parse(*led_json_str);
  EXPECT_EQ(led_json["type"], "gamepad_feedback");
  EXPECT_EQ(led_json["id"], 2);
  EXPECT_EQ(led_json["event"], "set_rgb_led");
  EXPECT_EQ(led_json["r"], 10);
  EXPECT_EQ(led_json["g"], 180);
  EXPECT_EQ(led_json["b"], 255);

  const std::array<std::uint8_t, 10> left_fx {0x02, 0x10, 0xFF, 0, 0, 0, 0, 0, 0, 0};
  const std::array<std::uint8_t, 10> right_fx {0x06, 0x20, 0x80, 0x40, 0, 0, 0, 0, 0, 0};
  const auto trig_msg = platf::gamepad_feedback_msg_t::make_adaptive_triggers(1, 0x0C, 0x02, 0x06, left_fx, right_fx);
  const auto trig_json_str = webrtc_input::build_gamepad_feedback_payload(trig_msg);
  ASSERT_TRUE(trig_json_str.has_value());
  const auto trig_json = nlohmann::json::parse(*trig_json_str);
  EXPECT_EQ(trig_json["event"], "set_adaptive_triggers");
  EXPECT_EQ(trig_json["id"], 1);
  EXPECT_EQ(trig_json["event_flags"], 0x0C);
  EXPECT_EQ(trig_json["type_left"], 0x02);
  EXPECT_EQ(trig_json["type_right"], 0x06);
  EXPECT_EQ(trig_json["left"].size(), 10u);
  EXPECT_EQ(trig_json["right"].size(), 10u);
  EXPECT_EQ(trig_json["left"][2], 0xFF);
  EXPECT_EQ(trig_json["right"][2], 0x80);
}

TEST(WebRtcInputCodecTest, DecodesMouseMoveAndDropsOutOfOrderPackets) {
  webrtc_input::BinaryInputState state;

  const auto m10 = encode_mouse_move(10, 32768, 16384);
  const auto m9 = encode_mouse_move(9, 1000, 1000);
  const auto m11 = encode_mouse_move(11, 65535, 0);

  auto d10 = webrtc_input::decode_binary_input(state, m10.data(), m10.size(), 100);
  ASSERT_TRUE(d10.has_value());
  EXPECT_FALSE(d10->has_gamepad_state);
  EXPECT_EQ(d10->packet_bytes.size(), sizeof(NV_ABS_MOUSE_MOVE_PACKET));

  EXPECT_FALSE(webrtc_input::decode_binary_input(state, m9.data(), m9.size(), 105).has_value());

  auto d11 = webrtc_input::decode_binary_input(state, m11.data(), m11.size(), 110);
  ASSERT_TRUE(d11.has_value());
  EXPECT_EQ(d11->packet_bytes.size(), sizeof(NV_ABS_MOUSE_MOVE_PACKET));
}
