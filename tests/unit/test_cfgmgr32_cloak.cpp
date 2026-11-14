/**
 * @file tests/unit/test_cfgmgr32_cloak.cpp
 * @brief Unit tests verifying Win32 cfgmgr32 physical gamepad cloaking policy excludes virtual buses and non-gamepads.
 */

#include "src/platform/windows/cfgmgr32_cloak.h"

#include <gtest/gtest.h>

using platf::gamepad_cloak::device_descriptor_t;
using platf::gamepad_cloak::should_cloak_device;

TEST(Cfgmgr32CloakPolicyTest, CloaksPhysicalDualSenseHidGamepad) {
  device_descriptor_t dev;
  dev.instance_id = LR"(HID\VID_054C&PID_0CE6&MI_03\7&1A2B3C4D&0&0000)";
  dev.hardware_ids = {LR"(HID\VID_054C&PID_0CE6&REV_0100&MI_03)"};
  dev.compatible_ids = {L"HID_DEVICE_SYSTEM_GAME", L"HID_DEVICE_UP:0001_U:0005"};
  dev.ancestor_ids = {LR"(USB\VID_054C&PID_0CE6&MI_03\6&2345&0&0003)", LR"(USB\ROOT_HUB30\4&1111&0&0)"};
  EXPECT_TRUE(should_cloak_device(dev));
}

TEST(Cfgmgr32CloakPolicyTest, CloaksPhysicalXboxCompositeController) {
  device_descriptor_t dev;
  dev.instance_id = LR"(USB\VID_045E&PID_02EA\0000123456)";
  dev.hardware_ids = {LR"(USB\VID_045E&PID_02EA&REV_0408)"};
  dev.ancestor_ids = {LR"(USB\ROOT_HUB30\4&1111&0&0)"};
  dev.is_xna_composite = true;
  EXPECT_TRUE(should_cloak_device(dev));
}

TEST(Cfgmgr32CloakPolicyTest, ExcludesVigemVirtualXboxAndDs4) {
  device_descriptor_t vigem_x360;
  vigem_x360.instance_id = LR"(USB\VID_045E&PID_028E&IG_00\1&1A590E2C&0&01)";
  vigem_x360.hardware_ids = {LR"(VIGEMBUS\VID_045E&PID_028E)"};
  vigem_x360.ancestor_ids = {LR"(ROOT\VIGEMBUS\0000)"};
  vigem_x360.is_xna_composite = true;
  EXPECT_FALSE(should_cloak_device(vigem_x360));

  device_descriptor_t vigem_ds4;
  vigem_ds4.instance_id = LR"(HID\VID_054C&PID_05C4\1&1A590E2C&0&0000)";
  vigem_ds4.compatible_ids = {L"HID_DEVICE_SYSTEM_GAME"};
  vigem_ds4.ancestor_ids = {LR"(Nefarius\ViGEmBus\Gen1\0000)", LR"(ROOT\VIGEMBUS\0000)"};
  EXPECT_FALSE(should_cloak_device(vigem_ds4));
}

TEST(Cfgmgr32CloakPolicyTest, ExcludesUsbipDualSenseVirtualDevice) {
  device_descriptor_t usbip_ds5;
  usbip_ds5.instance_id = LR"(HID\VID_054C&PID_0CE6&MI_03\8&998877&0&0000)";
  usbip_ds5.compatible_ids = {L"HID_DEVICE_SYSTEM_GAME", L"HID_DEVICE_UP:0001_U:0005"};
  usbip_ds5.ancestor_ids = {LR"(USB\VID_054C&PID_0CE6\0001)", LR"(ROOT\USBIP2_UDE\0000)"};
  EXPECT_FALSE(should_cloak_device(usbip_ds5));
}

TEST(Cfgmgr32CloakPolicyTest, NeverCloaksMouseKeyboardOrHeadsetConsumer) {
  device_descriptor_t mouse;
  mouse.instance_id = LR"(HID\VID_046D&PID_C077\6&1234&0&0000)";
  mouse.compatible_ids = {L"HID_DEVICE_SYSTEM_MOUSE"};
  EXPECT_FALSE(should_cloak_device(mouse));

  device_descriptor_t kbd;
  kbd.instance_id = LR"(HID\VID_1532&PID_0226\6&5678&0&0000)";
  kbd.compatible_ids = {L"HID_DEVICE_SYSTEM_KEYBOARD"};
  EXPECT_FALSE(should_cloak_device(kbd));

  device_descriptor_t headset_btn;
  headset_btn.instance_id = LR"(HID\VID_054C&PID_0CE6&MI_00\6&9999&0&0000)";
  headset_btn.compatible_ids = {L"HID_DEVICE_SYSTEM_CONSUMER", L"HID_DEVICE_UP:000C_U:0001"};
  EXPECT_FALSE(should_cloak_device(headset_btn));
}

