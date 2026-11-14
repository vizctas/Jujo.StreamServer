/**
 * @file src/platform/windows/usbip_dualsense_backend.h
 * @brief Native in-process C++20 USB/IP DualSense backend + usbip2_ude VHCI controller.
 */
#pragma once

#include "dualsense_hid.h"
#include "gamepad_backend.h"

#include <atomic>
#include <array>
#include <cstdint>
#include <memory>
#include <mutex>
#include <string>

namespace platf {

  /**
   * @brief Returns true if the usbip-win2 VHCI kernel device interface (GUID_DEVINTERFACE_USBIP_VHCI)
   * is currently present and accessible on this Windows host.
   */
  bool is_usbip_ude_installed();

  struct usbip_backend_health_t {
    bool driver_installed = false;
    std::uint16_t loopback_port = 0;
    std::size_t active_slots = 0;
  };

  usbip_backend_health_t get_usbip_backend_health();

  /**
   * @brief Native in-process DualSense (054C:0CE6) emulator communicating directly with usbip2_ude.sys
   * over an embedded loopback USB/IP v1.1.1 server (zero external processes/daemons).
   */
  class UsbIpDualSenseBackend final : public IGamepadBackend {
  public:
    UsbIpDualSenseBackend();
    ~UsbIpDualSenseBackend() override;

    const char *name() const override {
      return "usbip-dualsense";
    }

    bool available() const override {
      return available_;
    }

    std::uint16_t tcp_port() const {
      return tcp_port_;
    }

    int alloc_gamepad(
      const gamepad_id_t &id,
      const gamepad_arrival_t &metadata,
      const std::string &effective_mode,
      feedback_queue_t feedback_queue
    ) override;

    void free_gamepad(int nr) override;
    void update_state(int nr, const gamepad_state_t &gamepad_state) override;
    void touch(const gamepad_touch_t &touch) override;
    void motion(const gamepad_motion_t &motion) override;
    void battery(const gamepad_battery_t &battery) override;

    std::size_t active_slot_count() const;

#ifdef SUNSHINE_TESTS
    bool start_test_loopback_slot(int global_index, feedback_queue_t feedback_queue);
#endif

  private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
    bool available_ = false;
    std::uint16_t tcp_port_ = 0;
  };

}  // namespace platf
