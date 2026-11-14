/**
 * @file src/couch_coop_packet.h
 * @brief Shared packet classifier, capability gate, and gamepad slot remapper
 *        used identically by RTSP, TurboInput, and WebRTC ingresses.
 */
#pragma once

#include <cstdint>
#include <cstring>
#include <optional>
#include <string_view>
#include <vector>

#include "src/couch_coop.h"
#include "third-party/moonlight-common-c/src/Input.h"

namespace couch_coop {
  struct packet_decision_t {
    bool allowed = false;
    std::optional<int> remapped_slot;
  };

  inline std::uint32_t read_u32_le(const std::uint8_t *p) {
    return static_cast<std::uint32_t>(p[0]) |
           (static_cast<std::uint32_t>(p[1]) << 8) |
           (static_cast<std::uint32_t>(p[2]) << 16) |
           (static_cast<std::uint32_t>(p[3]) << 24);
  }

  inline packet_decision_t filter_and_remap_moonlight_packet(
    Coordinator &coop,
    std::string_view session_id,
    std::vector<std::uint8_t> &packet_bytes,
    std::int64_t now_ms
  ) {
    if (packet_bytes.size() < sizeof(NV_INPUT_HEADER)) {
      return {false, std::nullopt};
    }

    const std::uint32_t magic = read_u32_le(packet_bytes.data() + sizeof(std::uint32_t));
    switch (magic) {
      case MULTI_CONTROLLER_MAGIC_GEN5: {
        if (packet_bytes.size() < sizeof(NV_MULTI_CONTROLLER_PACKET)) {
          return {false, std::nullopt};
        }
        if (!coop.assert_session_allows(session_id, capability_e::gamepad, now_ms)) {
          return {false, std::nullopt};
        }
        NV_MULTI_CONTROLLER_PACKET pkt {};
        std::memcpy(&pkt, packet_bytes.data(), sizeof(pkt));
        const int orig_slot = static_cast<int>(pkt.controllerNumber);
        const auto remapped = coop.remap_gamepad_slot(session_id, orig_slot, now_ms);
        if (!remapped) {
          return {false, std::nullopt};
        }
        if (*remapped != orig_slot) {
          const bool orig_active = orig_slot >= 0 && orig_slot < kMaxGamepadSlots &&
                                   ((pkt.activeGamepadMask & (1 << orig_slot)) != 0);
          pkt.controllerNumber = static_cast<short>(*remapped);
          pkt.activeGamepadMask = orig_active ? static_cast<short>(1 << *remapped) : 0;
          std::memcpy(packet_bytes.data(), &pkt, sizeof(pkt));
        }
        return {true, *remapped};
      }

      case SS_CONTROLLER_ARRIVAL_MAGIC:
      case SS_CONTROLLER_TOUCH_MAGIC:
      case SS_CONTROLLER_MOTION_MAGIC:
      case SS_CONTROLLER_BATTERY_MAGIC: {
        const std::size_t min_size =
          magic == SS_CONTROLLER_ARRIVAL_MAGIC
            ? sizeof(SS_CONTROLLER_ARRIVAL_PACKET)
            : (magic == SS_CONTROLLER_TOUCH_MAGIC
                 ? sizeof(SS_CONTROLLER_TOUCH_PACKET)
                 : (magic == SS_CONTROLLER_MOTION_MAGIC
                      ? sizeof(SS_CONTROLLER_MOTION_PACKET)
                      : sizeof(SS_CONTROLLER_BATTERY_PACKET)));
        if (packet_bytes.size() < min_size) {
          return {false, std::nullopt};
        }
        if (!coop.assert_session_allows(session_id, capability_e::gamepad, now_ms)) {
          return {false, std::nullopt};
        }
        const int orig_slot = static_cast<int>(packet_bytes[sizeof(NV_INPUT_HEADER)]);
        const auto remapped = coop.remap_gamepad_slot(session_id, orig_slot, now_ms);
        if (!remapped) {
          return {false, std::nullopt};
        }
        packet_bytes[sizeof(NV_INPUT_HEADER)] = static_cast<std::uint8_t>(*remapped);
        return {true, *remapped};
      }

      case UTF8_TEXT_EVENT_MAGIC:
        return {coop.assert_session_allows(session_id, capability_e::text_clipboard, now_ms), std::nullopt};

      case MOUSE_MOVE_REL_MAGIC_GEN5:
      case MOUSE_MOVE_ABS_MAGIC:
      case MOUSE_BUTTON_DOWN_EVENT_MAGIC_GEN5:
      case MOUSE_BUTTON_UP_EVENT_MAGIC_GEN5:
      case SCROLL_MAGIC_GEN5:
      case SS_HSCROLL_MAGIC:
      case KEY_DOWN_EVENT_MAGIC:
      case KEY_UP_EVENT_MAGIC:
      case SS_TOUCH_MAGIC:
      case SS_PEN_MAGIC:
        return {coop.assert_session_allows(session_id, capability_e::kbm, now_ms), std::nullopt};

      default:
        // Never let secondary guests bypass capability checks with unknown/extension opcodes.
        if (coop.is_secondary_coop_session(session_id)) {
          return {false, std::nullopt};
        }
        return {true, std::nullopt};
    }
  }
}  // namespace couch_coop
