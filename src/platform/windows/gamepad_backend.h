/**
 * @file src/platform/windows/gamepad_backend.h
 * @brief Modular virtual gamepad backend interface for Windows (ViGEmBus zero-driver & USB/IP DualSense).
 */
#pragma once

#include "src/platform/common.h"

namespace platf {

  class IGamepadBackend {
  public:
    virtual ~IGamepadBackend() = default;

    virtual const char *name() const = 0;
    virtual bool available() const = 0;

    virtual int alloc_gamepad(
      const gamepad_id_t &id,
      const gamepad_arrival_t &metadata,
      const std::string &effective_mode,
      feedback_queue_t feedback_queue
    ) = 0;

    virtual void free_gamepad(int nr) = 0;
    virtual void update_state(int nr, const gamepad_state_t &gamepad_state) = 0;
    virtual void touch(const gamepad_touch_t &touch) = 0;
    virtual void motion(const gamepad_motion_t &motion) = 0;
    virtual void battery(const gamepad_battery_t &battery) = 0;
  };

}  // namespace platf

