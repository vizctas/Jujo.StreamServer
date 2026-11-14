/**
 * @file src/webrtc_input_codec.h
 * @brief Binary WebRTC input decoding, sequence gating, and gamepad feedback JSON serialization.
 */
#pragma once

#include <array>
#include <cstdint>
#include <mutex>
#include <optional>
#include <string>
#include <vector>

#include "src/platform/common.h"

namespace webrtc_input {
  constexpr std::uint8_t kBinaryMouseMove = 1;
  constexpr std::uint8_t kBinaryGamepadState = 2;
  constexpr std::uint8_t kBinaryGamepadMotion = 3;

  constexpr std::size_t kBinaryMouseMoveSize = 1 + 2 + 2 + 2;
  constexpr std::size_t kBinaryGamepadStateSize = 1 + 2 + 1 + 2 + 4 + 1 + 1 + 2 + 2 + 2 + 2;
  constexpr std::size_t kBinaryGamepadMotionSize = 1 + 2 + 1 + 1 + 4 + 4 + 4;
  constexpr std::size_t kMaxGamepads = 16;
  constexpr std::int64_t kSeqResetIdleMs = 1000;

  struct SeqTracker {
    bool initialized = false;
    std::uint16_t last_seq = 0;
    std::int64_t last_at_ms = 0;
  };

  struct BinaryInputState {
    std::mutex mutex;
    SeqTracker mouse_move {};
    std::array<SeqTracker, kMaxGamepads> gamepad_state {};
    std::array<std::array<SeqTracker, 2>, kMaxGamepads> gamepad_motion {};

    void reset();
  };

  struct DecodedBinaryPacket {
    std::vector<std::uint8_t> packet_bytes;
    bool has_gamepad_state = false;
    int gamepad_id = -1;
    std::uint16_t active_mask = 0;
  };

  bool seq_newer_u16(std::uint16_t seq, std::uint16_t last);
  bool accept_sequence(
    SeqTracker &tracker,
    std::uint16_t seq,
    std::int64_t now_ms,
    std::int64_t reset_idle_ms = kSeqResetIdleMs
  );

  std::vector<std::uint8_t> make_abs_mouse_move_packet(double x_norm, double y_norm);
  std::vector<std::uint8_t> make_gamepad_arrival_packet(
    int controller_number,
    std::uint8_t controller_type,
    std::uint16_t capabilities,
    std::uint32_t supported_buttons
  );
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
  );
  std::vector<std::uint8_t> make_gamepad_motion_packet(
    int controller_number,
    std::uint8_t motion_type,
    float x,
    float y,
    float z
  );
  std::vector<std::uint8_t> make_gamepad_touch_packet(
    int controller_number,
    std::uint8_t event_type,
    std::uint32_t pointer_id,
    float x,
    float y,
    float pressure
  );

  std::optional<DecodedBinaryPacket> decode_binary_input(
    BinaryInputState &state,
    const std::uint8_t *buffer,
    std::size_t length,
    std::int64_t now_ms
  );

  std::optional<std::string> build_gamepad_feedback_payload(const platf::gamepad_feedback_msg_t &msg);
}  // namespace webrtc_input

