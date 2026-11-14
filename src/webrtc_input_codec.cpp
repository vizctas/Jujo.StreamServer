/**
 * @file src/webrtc_input_codec.cpp
 * @brief Binary WebRTC input decoding and gamepad feedback JSON serialization.
 */

#include "src/webrtc_input_codec.h"

#include <algorithm>
#include <cmath>
#include <cstring>

#include <moonlight-common-c/src/Input.h>
#include <moonlight-common-c/src/Limelight.h>
#include <nlohmann/json.hpp>

#include "src/utility.h"

namespace webrtc_input {
  namespace {
    constexpr short kAbsCoordinateMax = 32767;

    std::uint16_t read_u16_le(const std::uint8_t *p) {
      return static_cast<std::uint16_t>(p[0]) | (static_cast<std::uint16_t>(p[1]) << 8);
    }

    std::int16_t read_i16_le(const std::uint8_t *p) {
      return static_cast<std::int16_t>(read_u16_le(p));
    }

    std::uint32_t read_u32_le(const std::uint8_t *p) {
      return static_cast<std::uint32_t>(p[0]) |
             (static_cast<std::uint32_t>(p[1]) << 8) |
             (static_cast<std::uint32_t>(p[2]) << 16) |
             (static_cast<std::uint32_t>(p[3]) << 24);
    }

    float read_f32_le(const std::uint8_t *p) {
      const std::uint32_t bits = read_u32_le(p);
      float value = 0.0f;
      std::memcpy(&value, &bits, sizeof(value));
      return value;
    }

    double unit_from_u16(std::uint16_t value) {
      return static_cast<double>(value) / 65535.0;
    }

    void write_netfloat(netfloat &out, float value) {
      auto le_value = util::endian::little(value);
      std::memcpy(out, &le_value, sizeof(le_value));
    }
  }  // namespace

  void BinaryInputState::reset() {
    std::lock_guard<std::mutex> lock(mutex);
    mouse_move = {};
    gamepad_state.fill({});
    for (auto &pair : gamepad_motion) {
      pair.fill({});
    }
  }

  bool seq_newer_u16(std::uint16_t seq, std::uint16_t last) {
    return static_cast<std::int16_t>(seq - last) > 0;
  }

  bool accept_sequence(
    SeqTracker &tracker,
    std::uint16_t seq,
    std::int64_t now_ms,
    std::int64_t reset_idle_ms
  ) {
    if (tracker.initialized && !seq_newer_u16(seq, tracker.last_seq)) {
      const auto elapsed_ms = now_ms - tracker.last_at_ms;
      if (tracker.last_at_ms > 0 && elapsed_ms >= 0 && elapsed_ms < reset_idle_ms) {
        return false;
      }
    }
    tracker.initialized = true;
    tracker.last_seq = seq;
    tracker.last_at_ms = now_ms;
    return true;
  }

  std::vector<std::uint8_t> make_abs_mouse_move_packet(double x_norm, double y_norm) {
    NV_ABS_MOUSE_MOVE_PACKET packet {};
    packet.header.size = util::endian::big<std::uint32_t>(sizeof(packet) - sizeof(packet.header.size));
    packet.header.magic = util::endian::little<std::uint32_t>(MOUSE_MOVE_ABS_MAGIC);

    const auto clamped_x = std::clamp(x_norm, 0.0, 1.0);
    const auto clamped_y = std::clamp(y_norm, 0.0, 1.0);
    const int x = static_cast<int>(std::lround(clamped_x * kAbsCoordinateMax));
    const int y = static_cast<int>(std::lround(clamped_y * kAbsCoordinateMax));
    packet.x = util::endian::big(static_cast<std::int16_t>(std::clamp(x, 0, static_cast<int>(kAbsCoordinateMax))));
    packet.y = util::endian::big(static_cast<std::int16_t>(std::clamp(y, 0, static_cast<int>(kAbsCoordinateMax))));
    packet.unused = 0;
    packet.width = util::endian::big(static_cast<std::int16_t>(kAbsCoordinateMax));
    packet.height = util::endian::big(static_cast<std::int16_t>(kAbsCoordinateMax));

    std::vector<std::uint8_t> data(sizeof(packet));
    std::memcpy(data.data(), &packet, sizeof(packet));
    return data;
  }

  std::vector<std::uint8_t> make_gamepad_arrival_packet(
    int controller_number,
    std::uint8_t controller_type,
    std::uint16_t capabilities,
    std::uint32_t supported_buttons
  ) {
    SS_CONTROLLER_ARRIVAL_PACKET packet {};
    packet.header.size = util::endian::big<std::uint32_t>(sizeof(packet) - sizeof(packet.header.size));
    packet.header.magic = util::endian::little<std::uint32_t>(SS_CONTROLLER_ARRIVAL_MAGIC);
    packet.controllerNumber = static_cast<std::uint8_t>(controller_number);
    packet.type = controller_type;
    packet.capabilities = util::endian::little(static_cast<std::uint16_t>(capabilities));
    packet.supportedButtonFlags = util::endian::little(static_cast<std::uint32_t>(supported_buttons));

    std::vector<std::uint8_t> data(sizeof(packet));
    std::memcpy(data.data(), &packet, sizeof(packet));
    return data;
  }

  std::vector<std::uint8_t> make_gamepad_state_packet(
    int controller_number,
    std::uint16_t active_mask,
    std::uint32_t buttons,
    std::uint8_t left_trigger,
    std::uint8_t right_trigger,
    std::int16_t ls_x,
    std::int16_t ls_y,
    std::int16_t rs_x,
    std::int16_t rs_y
  ) {
    NV_MULTI_CONTROLLER_PACKET packet {};
    packet.header.size = util::endian::big<std::uint32_t>(sizeof(packet) - sizeof(packet.header.size));
    packet.header.magic = util::endian::little<std::uint32_t>(MULTI_CONTROLLER_MAGIC_GEN5);
    packet.headerB = MC_HEADER_B;
    packet.controllerNumber = static_cast<std::int16_t>(controller_number);
    packet.activeGamepadMask = static_cast<std::int16_t>(active_mask);
    packet.midB = MC_MID_B;
    packet.buttonFlags = static_cast<std::int16_t>(buttons & 0xFFFF);
    packet.leftTrigger = left_trigger;
    packet.rightTrigger = right_trigger;
    packet.leftStickX = ls_x;
    packet.leftStickY = ls_y;
    packet.rightStickX = rs_x;
    packet.rightStickY = rs_y;
    packet.tailA = MC_TAIL_A;
    packet.buttonFlags2 = static_cast<std::int16_t>((buttons >> 16) & 0xFFFF);
    packet.tailB = MC_TAIL_B;

    std::vector<std::uint8_t> data(sizeof(packet));
    std::memcpy(data.data(), &packet, sizeof(packet));
    return data;
  }

  std::vector<std::uint8_t> make_gamepad_motion_packet(
    int controller_number,
    std::uint8_t motion_type,
    float x,
    float y,
    float z
  ) {
    SS_CONTROLLER_MOTION_PACKET packet {};
    packet.header.size = util::endian::big<std::uint32_t>(sizeof(packet) - sizeof(packet.header.size));
    packet.header.magic = util::endian::little<std::uint32_t>(SS_CONTROLLER_MOTION_MAGIC);
    packet.controllerNumber = static_cast<std::uint8_t>(controller_number);
    packet.motionType = motion_type;
    write_netfloat(packet.x, x);
    write_netfloat(packet.y, y);
    write_netfloat(packet.z, z);

    std::vector<std::uint8_t> data(sizeof(packet));
    std::memcpy(data.data(), &packet, sizeof(packet));
    return data;
  }

  std::vector<std::uint8_t> make_gamepad_touch_packet(
    int controller_number,
    std::uint8_t event_type,
    std::uint32_t pointer_id,
    float x,
    float y,
    float pressure
  ) {
    SS_CONTROLLER_TOUCH_PACKET packet {};
    packet.header.size = util::endian::big<std::uint32_t>(sizeof(packet) - sizeof(packet.header.size));
    packet.header.magic = util::endian::little<std::uint32_t>(SS_CONTROLLER_TOUCH_MAGIC);
    packet.controllerNumber = static_cast<std::uint8_t>(controller_number);
    packet.eventType = event_type;
    packet.pointerId = util::endian::little(pointer_id);
    write_netfloat(packet.x, x);
    write_netfloat(packet.y, y);
    write_netfloat(packet.pressure, pressure);

    std::vector<std::uint8_t> data(sizeof(packet));
    std::memcpy(data.data(), &packet, sizeof(packet));
    return data;
  }

  std::optional<DecodedBinaryPacket> decode_binary_input(
    BinaryInputState &state,
    const std::uint8_t *buffer,
    std::size_t length,
    std::int64_t now_ms
  ) {
    if (!buffer || length < 1) {
      return std::nullopt;
    }

    const std::uint8_t type = buffer[0];
    if (type == kBinaryMouseMove) {
      if (length < kBinaryMouseMoveSize) {
        return std::nullopt;
      }
      const std::uint16_t seq = read_u16_le(buffer + 1);
      const std::uint16_t x_u16 = read_u16_le(buffer + 3);
      const std::uint16_t y_u16 = read_u16_le(buffer + 5);

      std::lock_guard<std::mutex> lock(state.mutex);
      if (!accept_sequence(state.mouse_move, seq, now_ms)) {
        return std::nullopt;
      }
      DecodedBinaryPacket out;
      out.packet_bytes = make_abs_mouse_move_packet(unit_from_u16(x_u16), unit_from_u16(y_u16));
      return out;
    }

    if (type == kBinaryGamepadState) {
      if (length < kBinaryGamepadStateSize) {
        return std::nullopt;
      }
      const std::uint16_t seq = read_u16_le(buffer + 1);
      const std::uint8_t id = buffer[3];
      if (id >= kMaxGamepads) {
        return std::nullopt;
      }
      const std::uint16_t active_mask = read_u16_le(buffer + 4);
      const std::uint32_t buttons = read_u32_le(buffer + 6);
      const std::uint8_t lt = buffer[10];
      const std::uint8_t rt = buffer[11];
      const std::int16_t ls_x = read_i16_le(buffer + 12);
      const std::int16_t ls_y = read_i16_le(buffer + 14);
      const std::int16_t rs_x = read_i16_le(buffer + 16);
      const std::int16_t rs_y = read_i16_le(buffer + 18);

      std::lock_guard<std::mutex> lock(state.mutex);
      if (!accept_sequence(state.gamepad_state[id], seq, now_ms)) {
        return std::nullopt;
      }
      DecodedBinaryPacket out;
      out.has_gamepad_state = true;
      out.gamepad_id = id;
      out.active_mask = active_mask;
      out.packet_bytes = make_gamepad_state_packet(id, active_mask, buttons, lt, rt, ls_x, ls_y, rs_x, rs_y);
      return out;
    }

    if (type == kBinaryGamepadMotion) {
      if (length < kBinaryGamepadMotionSize) {
        return std::nullopt;
      }
      const std::uint16_t seq = read_u16_le(buffer + 1);
      const std::uint8_t id = buffer[3];
      const std::uint8_t motion_type = buffer[4];
      if (id >= kMaxGamepads || (motion_type != LI_MOTION_TYPE_ACCEL && motion_type != LI_MOTION_TYPE_GYRO)) {
        return std::nullopt;
      }
      const float x = read_f32_le(buffer + 5);
      const float y = read_f32_le(buffer + 9);
      const float z = read_f32_le(buffer + 13);
      if (!std::isfinite(x) || !std::isfinite(y) || !std::isfinite(z)) {
        return std::nullopt;
      }

      const std::size_t motion_idx = motion_type == LI_MOTION_TYPE_ACCEL ? 0 : 1;
      std::lock_guard<std::mutex> lock(state.mutex);
      if (!accept_sequence(state.gamepad_motion[id][motion_idx], seq, now_ms)) {
        return std::nullopt;
      }
      DecodedBinaryPacket out;
      out.packet_bytes = make_gamepad_motion_packet(id, motion_type, x, y, z);
      return out;
    }

    return std::nullopt;
  }

  std::optional<std::string> build_gamepad_feedback_payload(const platf::gamepad_feedback_msg_t &msg) {
    nlohmann::json payload;
    payload["type"] = "gamepad_feedback";
    payload["id"] = msg.id;
    switch (msg.type) {
      case platf::gamepad_feedback_e::rumble:
        payload["event"] = "rumble";
        payload["lowfreq"] = msg.data.rumble.lowfreq;
        payload["highfreq"] = msg.data.rumble.highfreq;
        break;
      case platf::gamepad_feedback_e::rumble_triggers:
        payload["event"] = "rumble_triggers";
        payload["left"] = msg.data.rumble_triggers.left_trigger;
        payload["right"] = msg.data.rumble_triggers.right_trigger;
        break;
      case platf::gamepad_feedback_e::set_motion_event_state:
        payload["event"] = "motion_event_state";
        payload["motionType"] = msg.data.motion_event_state.motion_type;
        payload["reportRate"] = msg.data.motion_event_state.report_rate;
        break;
      case platf::gamepad_feedback_e::set_rgb_led:
        payload["event"] = "set_rgb_led";
        payload["r"] = msg.data.rgb_led.r;
        payload["g"] = msg.data.rgb_led.g;
        payload["b"] = msg.data.rgb_led.b;
        break;
      case platf::gamepad_feedback_e::set_adaptive_triggers:
        payload["event"] = "set_adaptive_triggers";
        payload["event_flags"] = msg.data.adaptive_triggers.event_flags;
        payload["type_left"] = msg.data.adaptive_triggers.type_left;
        payload["type_right"] = msg.data.adaptive_triggers.type_right;
        payload["left"] = msg.data.adaptive_triggers.left;
        payload["right"] = msg.data.adaptive_triggers.right;
        break;
      default:
        return std::nullopt;
    }
    return payload.dump();
  }
}  // namespace webrtc_input

