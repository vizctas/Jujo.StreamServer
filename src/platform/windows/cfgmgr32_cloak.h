/**
 * @file src/platform/windows/cfgmgr32_cloak.h
 * @brief Native Win32 SetupAPI + cfgmgr32 physical gamepad cloaking during streams (Zero kernel drivers).
 */
#pragma once

#include <cstddef>
#include <string>
#include <vector>

namespace platf::gamepad_cloak {

  struct device_descriptor_t {
    std::wstring instance_id;
    std::vector<std::wstring> hardware_ids;
    std::vector<std::wstring> compatible_ids;
    std::vector<std::wstring> ancestor_ids;
    bool is_xna_composite = false;
  };

  /**
   * @brief Pure policy predicate deciding whether a PnP device is a physical local gamepad
   * that can cause double-input conflicts and is safe to temporarily disable.
   */
  bool should_cloak_device(const device_descriptor_t &dev);

  /**
   * @brief Disables present physical local gamepads via CM_Disable_DevNode and persists their
   * PnP instance IDs to HKCU Registry so crashes never strand hardware disabled.
   */
  void cloak_local_gamepads();

  /**
   * @brief Re-enables any gamepads disabled in memory or persisted from a prior unclean shutdown.
   */
  void restore_local_gamepads();

  std::size_t cloaked_count();

}  // namespace platf::gamepad_cloak

