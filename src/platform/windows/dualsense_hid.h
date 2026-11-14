/**
 * @file src/platform/windows/dualsense_hid.h
 * @brief Sony DualSense (054C:0CE6) USB/HID descriptors, Input Report 0x01 encoder, and Output Report 0x02 parser.
 */
#pragma once

#include <array>
#include <cstddef>
#include <cstdint>
#include <vector>

namespace platf::dualsense_hid {

  inline constexpr std::uint16_t kVendorSony = 0x054C;
  inline constexpr std::uint16_t kProductDualSense = 0x0CE6;
  inline constexpr std::size_t kInputReport01Bytes = 64;
  inline constexpr std::size_t kMinOutputReport02Bytes = 48;
  inline constexpr std::size_t kMaxTouchpoints = 2;

  struct touch_slot_t {
    bool active = false;
    std::uint8_t tracking_id = 0;
    std::uint16_t x = 0;  // 0..1919
    std::uint16_t y = 0;  // 0..1079
  };

  struct controller_snapshot_t {
    std::uint32_t button_flags = 0;
    std::uint8_t left_trigger = 0;
    std::uint8_t right_trigger = 0;
    std::int16_t ls_x = 0;
    std::int16_t ls_y = 0;
    std::int16_t rs_x = 0;
    std::int16_t rs_y = 0;

    float accel_x = 0.0f;  // m/s^2
    float accel_y = 9.80665f;
    float accel_z = 0.0f;
    float gyro_x = 0.0f;  // deg/s
    float gyro_y = 0.0f;
    float gyro_z = 0.0f;

    std::array<touch_slot_t, kMaxTouchpoints> touches {};

    std::uint8_t battery_state = 0;
    std::uint8_t battery_percent = 0xFF;

    std::uint8_t seq = 0;
    std::uint32_t sensor_timestamp_us = 0;
  };

  struct output_report02_t {
    bool has_rumble = false;
    std::uint16_t low_freq_rumble = 0;   // 0..65535
    std::uint16_t high_freq_rumble = 0;  // 0..65535

    bool has_led = false;
    std::uint8_t led_r = 0;
    std::uint8_t led_g = 0;
    std::uint8_t led_b = 0;

    bool has_triggers = false;
    std::uint8_t trigger_event_flags = 0;  // bit2(0x04)=R2, bit3(0x08)=L2
    std::uint8_t trigger_type_left = 0;
    std::uint8_t trigger_type_right = 0;
    std::array<std::uint8_t, 10> trigger_left {};
    std::array<std::uint8_t, 10> trigger_right {};
  };

  const std::vector<std::uint8_t> &usb_device_descriptor();
  const std::vector<std::uint8_t> &usb_config_descriptor();
  const std::vector<std::uint8_t> &hid_report_descriptor();
  std::vector<std::uint8_t> usb_string_descriptor(std::uint8_t index, std::uint8_t slot_index);

  /**
   * @brief Builds USB HID Feature Report bytes for DualSense enumeration (0x05 IMU calib, 0x09 MAC, 0x20 FW, etc.).
   */
  std::vector<std::uint8_t> build_feature_report(std::uint8_t report_id, std::uint8_t slot_index);

  /**
   * @brief Encodes a 64-byte DualSense USB HID Input Report 0x01.
   */
  std::array<std::uint8_t, kInputReport01Bytes> encode_input_report_01(const controller_snapshot_t &state);

  /**
   * @brief Parses a USB DualSense Output Report 0x02 sent by Windows/Steam/PS5 SDK games.
   */
  bool parse_output_report_02(const std::uint8_t *data, std::size_t len, output_report02_t &out);

  /**
   * @brief Validates that a HID report descriptor has intact item lengths and balanced Collection/EndCollection.
   */
  bool validate_hid_report_descriptor(const std::uint8_t *data, std::size_t len);

}  // namespace platf::dualsense_hid

