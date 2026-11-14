/**
 * @file src/platform/windows/dualsense_hid.cpp
 * @brief Sony DualSense USB/HID descriptors and report codecs.
 */

#include "dualsense_hid.h"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstring>

namespace platf::dualsense_hid {

  namespace {

    constexpr float kEarthG = 9.80665f;
    constexpr float kAccelResPerG = 8192.0f;
    constexpr float kGyroResPerDps = 16.0f;

    // Moonlight Limelight.h button masks
    constexpr std::uint32_t kUpFlag = 0x0001;
    constexpr std::uint32_t kDownFlag = 0x0002;
    constexpr std::uint32_t kLeftFlag = 0x0004;
    constexpr std::uint32_t kRightFlag = 0x0008;
    constexpr std::uint32_t kPlayFlag = 0x0010;
    constexpr std::uint32_t kBackFlag = 0x0020;
    constexpr std::uint32_t kLsClkFlag = 0x0040;
    constexpr std::uint32_t kRsClkFlag = 0x0080;
    constexpr std::uint32_t kLbFlag = 0x0100;
    constexpr std::uint32_t kRbFlag = 0x0200;
    constexpr std::uint32_t kSpecialFlag = 0x0400;
    constexpr std::uint32_t kAFlag = 0x1000;
    constexpr std::uint32_t kBFlag = 0x2000;
    constexpr std::uint32_t kXFlag = 0x4000;
    constexpr std::uint32_t kYFlag = 0x8000;
    constexpr std::uint32_t kTouchpadFlag = 0x100000;
    constexpr std::uint32_t kMiscFlag = 0x200000;

    inline std::uint8_t stick_s16_to_u8(std::int16_t v) {
      const std::int32_t shifted = (static_cast<std::int32_t>(v) + 32768) >> 8;
      return static_cast<std::uint8_t>(std::clamp(shifted, 0, 255));
    }

    inline std::int16_t clamp_i16(float v) {
      if (!std::isfinite(v)) {
        return 0;
      }
      const long rounded = std::lround(v);
      return static_cast<std::int16_t>(std::clamp(rounded, -32768L, 32767L));
    }

    inline void write_le16(std::uint8_t *dst, std::uint16_t v) {
      dst[0] = static_cast<std::uint8_t>(v & 0xFF);
      dst[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
    }

    inline void write_le32(std::uint8_t *dst, std::uint32_t v) {
      dst[0] = static_cast<std::uint8_t>(v & 0xFF);
      dst[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
      dst[2] = static_cast<std::uint8_t>((v >> 16) & 0xFF);
      dst[3] = static_cast<std::uint8_t>((v >> 24) & 0xFF);
    }

    std::uint8_t dpad_hat_nibble(std::uint32_t flags) {
      const bool up = (flags & kUpFlag) != 0;
      const bool down = (flags & kDownFlag) != 0;
      const bool left = (flags & kLeftFlag) != 0;
      const bool right = (flags & kRightFlag) != 0;
      if (up && !down) {
        if (right && !left) return 1;
        if (left && !right) return 7;
        return 0;
      }
      if (down && !up) {
        if (right && !left) return 3;
        if (left && !right) return 5;
        return 4;
      }
      if (right && !left) return 2;
      if (left && !right) return 6;
      return 8;
    }

    std::vector<std::uint8_t> make_utf16le_string_descriptor(const char *ascii) {
      const std::size_t chars = std::strlen(ascii);
      std::vector<std::uint8_t> out(2 + chars * 2, 0);
      out[0] = static_cast<std::uint8_t>(out.size());
      out[1] = 0x03;  // USB_DT_STRING
      for (std::size_t i = 0; i < chars; ++i) {
        out[2 + i * 2] = static_cast<std::uint8_t>(ascii[i]);
        out[3 + i * 2] = 0;
      }
      return out;
    }

  }  // namespace

  const std::vector<std::uint8_t> &usb_device_descriptor() {
    static const std::vector<std::uint8_t> kDesc = {
      18,          // bLength
      0x01,        // bDescriptorType = DEVICE
      0x00, 0x02,  // bcdUSB = 2.00
      0x00,        // bDeviceClass (defined at interface level)
      0x00,        // bDeviceSubClass
      0x00,        // bDeviceProtocol
      64,          // bMaxPacketSize0
      0x4C, 0x05,  // idVendor = 0x054C (Sony)
      0xE6, 0x0C,  // idProduct = 0x0CE6 (DualSense)
      0x00, 0x01,  // bcdDevice = 0x0100
      0x01,        // iManufacturer
      0x02,        // iProduct
      0x03,        // iSerialNumber
      0x01,        // bNumConfigurations
    };
    return kDesc;
  }

  const std::vector<std::uint8_t> &hid_report_descriptor() {
    // Authentic Sony DualSense 054C:0CE6 USB HID Report Descriptor (273 bytes):
    // Report 0x01 (64B Input), Report 0x02 (48B Output), Feature 0x05..0xF5.
    static const std::vector<std::uint8_t> kReportDesc = {
      0x05, 0x01, 0x09, 0x05, 0xA1, 0x01, 0x85, 0x01, 0x09, 0x30, 0x09, 0x31, 0x09, 0x32, 0x09, 0x35,
      0x09, 0x33, 0x09, 0x34, 0x15, 0x00, 0x26, 0xFF, 0x00, 0x75, 0x08, 0x95, 0x06, 0x81, 0x02, 0x06,
      0x00, 0xFF, 0x09, 0x20, 0x95, 0x01, 0x81, 0x02, 0x05, 0x01, 0x09, 0x39, 0x15, 0x00, 0x25, 0x07,
      0x35, 0x00, 0x46, 0x3B, 0x01, 0x65, 0x14, 0x75, 0x04, 0x95, 0x01, 0x81, 0x42, 0x65, 0x00, 0x05,
      0x09, 0x19, 0x01, 0x29, 0x0F, 0x15, 0x00, 0x25, 0x01, 0x75, 0x01, 0x95, 0x0F, 0x81, 0x02, 0x06,
      0x00, 0xFF, 0x09, 0x21, 0x95, 0x0D, 0x81, 0x02, 0x06, 0x00, 0xFF, 0x09, 0x22, 0x15, 0x00, 0x26,
      0xFF, 0x00, 0x75, 0x08, 0x95, 0x34, 0x81, 0x02, 0x85, 0x02, 0x09, 0x23, 0x95, 0x2F, 0x91, 0x02,
      0x85, 0x05, 0x09, 0x33, 0x95, 0x28, 0xB1, 0x02, 0x85, 0x08, 0x09, 0x34, 0x95, 0x2F, 0xB1, 0x02,
      0x85, 0x09, 0x09, 0x24, 0x95, 0x13, 0xB1, 0x02, 0x85, 0x0A, 0x09, 0x25, 0x95, 0x1A, 0xB1, 0x02,
      0x85, 0x20, 0x09, 0x26, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0x21, 0x09, 0x27, 0x95, 0x04, 0xB1, 0x02,
      0x85, 0x22, 0x09, 0x40, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0x80, 0x09, 0x28, 0x95, 0x3F, 0xB1, 0x02,
      0x85, 0x81, 0x09, 0x29, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0x82, 0x09, 0x2A, 0x95, 0x09, 0xB1, 0x02,
      0x85, 0x83, 0x09, 0x2B, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0x84, 0x09, 0x2C, 0x95, 0x3F, 0xB1, 0x02,
      0x85, 0x85, 0x09, 0x2D, 0x95, 0x02, 0xB1, 0x02, 0x85, 0xA0, 0x09, 0x2E, 0x95, 0x01, 0xB1, 0x02,
      0x85, 0xE0, 0x09, 0x2F, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0xF0, 0x09, 0x30, 0x95, 0x3F, 0xB1, 0x02,
      0x85, 0xF1, 0x09, 0x31, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0xF2, 0x09, 0x32, 0x95, 0x0F, 0xB1, 0x02,
      0x85, 0xF4, 0x09, 0x35, 0x95, 0x3F, 0xB1, 0x02, 0x85, 0xF5, 0x09, 0x36, 0x95, 0x03, 0xB1, 0x02,
      0xC0,
    };
    return kReportDesc;
  }

  const std::vector<std::uint8_t> &usb_config_descriptor() {
    // 9B Config + 9B HID Interface 0 + 9B HID Desc + 7B EP_IN(0x84) + 7B EP_OUT(0x03) = 41B
    static const std::vector<std::uint8_t> kCfg = {
      // Configuration Descriptor (9B)
      9,           // bLength
      0x02,        // bDescriptorType = CONFIGURATION
      41, 0x00,    // wTotalLength = 41
      1,           // bNumInterfaces = 1 (pure HID controller without UAC audio endpoints)
      1,           // bConfigurationValue
      0,           // iConfiguration
      0xC0,        // bmAttributes (Self-Powered)
      250,         // bMaxPower (500mA)

      // Interface 0 Descriptor (9B)
      9,           // bLength
      0x04,        // bDescriptorType = INTERFACE
      0,           // bInterfaceNumber
      0,           // bAlternateSetting
      2,           // bNumEndpoints
      0x03,        // bInterfaceClass = HID
      0x00,        // bInterfaceSubClass
      0x00,        // bInterfaceProtocol
      0,           // iInterface

      // HID Descriptor (9B)
      9,           // bLength
      0x21,        // bDescriptorType = HID
      0x11, 0x01,  // bcdHID = 1.11
      0x00,        // bCountryCode
      1,           // bNumDescriptors
      0x22,        // bDescriptorType = REPORT
      static_cast<std::uint8_t>(273 & 0xFF),
      static_cast<std::uint8_t>((273 >> 8) & 0xFF),

      // Endpoint IN 0x84 (Interrupt, 64B, 1000Hz / bInterval=4 at HS=1ms) (7B)
      7,           // bLength
      0x05,        // bDescriptorType = ENDPOINT
      0x84,        // bEndpointAddress = EP4 IN
      0x03,        // bmAttributes = Interrupt
      64, 0x00,    // wMaxPacketSize = 64
      4,           // bInterval

      // Endpoint OUT 0x03 (Interrupt, 64B) (7B)
      7,           // bLength
      0x05,        // bDescriptorType = ENDPOINT
      0x03,        // bEndpointAddress = EP3 OUT
      0x03,        // bmAttributes = Interrupt
      64, 0x00,    // wMaxPacketSize = 64
      4,           // bInterval
    };
    return kCfg;
  }

  std::vector<std::uint8_t> usb_string_descriptor(std::uint8_t index, std::uint8_t slot_index) {
    if (index == 0) {
      return {4, 0x03, 0x09, 0x04};  // en-US 0x0409
    }
    if (index == 1) {
      return make_utf16le_string_descriptor("Sony Interactive Entertainment");
    }
    if (index == 2) {
      return make_utf16le_string_descriptor("DualSense Wireless Controller");
    }
    char serial[16] {};
    std::snprintf(serial, sizeof(serial), "JUJODS5%02u", static_cast<unsigned>(slot_index + 1));
    return make_utf16le_string_descriptor(serial);
  }

  std::vector<std::uint8_t> build_feature_report(std::uint8_t report_id, std::uint8_t slot_index) {
    switch (report_id) {
      case 0x05: {
        // 41-byte IMU calibration: identity 1:1 scaling so clients/games never divide by 0
        std::vector<std::uint8_t> buf(41, 0);
        buf[0] = 0x05;
        auto write_i16 = [&](std::size_t off, std::int16_t v) {
          write_le16(&buf[off], static_cast<std::uint16_t>(v));
        };
        // Gyro +/- and speed +/- -> nonzero range
        write_i16(7, 16384);
        write_i16(9, 16384);
        write_i16(11, 16384);
        write_i16(13, -16384);
        write_i16(15, -16384);
        write_i16(17, -16384);
        write_i16(19, 1024);
        write_i16(21, 1024);
        // Accel +/-
        write_i16(23, 8192);
        write_i16(25, -8192);
        write_i16(27, 8192);
        write_i16(29, -8192);
        write_i16(31, 8192);
        write_i16(33, -8192);
        return buf;
      }
      case 0x08: {
        std::vector<std::uint8_t> b(48, 0);
        b[0] = 0x08;
        return b;
      }
      case 0x09: {
        std::vector<std::uint8_t> b(20, 0);
        b[0] = 0x09;
        b[1] = static_cast<std::uint8_t>(0x10 + slot_index);
        b[2] = 0x4A;
        b[3] = 0x55;
        b[4] = 0x4A;
        b[5] = 0x4F;
        b[6] = 0xD0;
        return b;
      }
      case 0x0A: {
        std::vector<std::uint8_t> b(27, 0);
        b[0] = 0x0A;
        return b;
      }
      case 0x20: {
        std::vector<std::uint8_t> b(64, 0);
        b[0] = 0x20;
        write_le32(&b[24], 0x00010008);  // hardware info
        write_le32(&b[28], 0x00000302);  // firmware version
        return b;
      }
      case 0x21: {
        std::vector<std::uint8_t> b(5, 0);
        b[0] = 0x21;
        return b;
      }
      case 0x22:
      case 0x80:
      case 0x81:
      case 0x83:
      case 0x84:
      case 0xE0:
      case 0xF0:
      case 0xF1:
      case 0xF4: {
        std::vector<std::uint8_t> b(64, 0);
        b[0] = report_id;
        return b;
      }
      case 0x82: {
        std::vector<std::uint8_t> b(10, 0);
        b[0] = 0x82;
        return b;
      }
      case 0x85:
        return {0x85, 0x00, 0x00};
      case 0xA0:
        return {0xA0, 0x00};
      case 0xF2: {
        std::vector<std::uint8_t> b(16, 0);
        b[0] = 0xF2;
        return b;
      }
      case 0xF5:
        return {0xF5, 0x00, 0x00, 0x00};
      default:
        return {report_id};
    }
  }

  std::array<std::uint8_t, kInputReport01Bytes> encode_input_report_01(const controller_snapshot_t &state) {
    std::array<std::uint8_t, kInputReport01Bytes> out {};
    out[0] = 0x01;
    out[1] = stick_s16_to_u8(state.ls_x);
    out[2] = static_cast<std::uint8_t>(255 - stick_s16_to_u8(state.ls_y));
    out[3] = stick_s16_to_u8(state.rs_x);
    out[4] = static_cast<std::uint8_t>(255 - stick_s16_to_u8(state.rs_y));
    out[5] = state.left_trigger;
    out[6] = state.right_trigger;
    out[7] = state.seq;

    std::uint8_t b8 = dpad_hat_nibble(state.button_flags);
    if (state.button_flags & kXFlag) b8 |= 0x10;
    if (state.button_flags & kAFlag) b8 |= 0x20;
    if (state.button_flags & kBFlag) b8 |= 0x40;
    if (state.button_flags & kYFlag) b8 |= 0x80;
    out[8] = b8;

    std::uint8_t b9 = 0;
    if (state.button_flags & kLbFlag) b9 |= 0x01;
    if (state.button_flags & kRbFlag) b9 |= 0x02;
    if (state.left_trigger > 0) b9 |= 0x04;
    if (state.right_trigger > 0) b9 |= 0x08;
    if (state.button_flags & kBackFlag) b9 |= 0x10;
    if (state.button_flags & kPlayFlag) b9 |= 0x20;
    if (state.button_flags & kLsClkFlag) b9 |= 0x40;
    if (state.button_flags & kRsClkFlag) b9 |= 0x80;
    out[9] = b9;

    std::uint8_t b10 = 0;
    if (state.button_flags & kSpecialFlag) b10 |= 0x01;
    if (state.button_flags & kTouchpadFlag) b10 |= 0x02;
    if (state.button_flags & kMiscFlag) b10 |= 0x04;
    out[10] = b10;

    write_le32(&out[12], state.sensor_timestamp_us);
    write_le16(&out[16], static_cast<std::uint16_t>(clamp_i16(state.gyro_x * kGyroResPerDps)));
    write_le16(&out[18], static_cast<std::uint16_t>(clamp_i16(state.gyro_y * kGyroResPerDps)));
    write_le16(&out[20], static_cast<std::uint16_t>(clamp_i16(state.gyro_z * kGyroResPerDps)));

    write_le16(&out[22], static_cast<std::uint16_t>(clamp_i16((state.accel_x / kEarthG) * kAccelResPerG)));
    write_le16(&out[24], static_cast<std::uint16_t>(clamp_i16((state.accel_y / kEarthG) * kAccelResPerG)));
    write_le16(&out[26], static_cast<std::uint16_t>(clamp_i16((state.accel_z / kEarthG) * kAccelResPerG)));
    write_le32(&out[28], state.sensor_timestamp_us);
    out[32] = 0x1E;  // Nominal IMU temperature (~30C)

    for (std::size_t i = 0; i < kMaxTouchpoints; ++i) {
      const auto &tp = state.touches[i];
      const std::size_t off = 33 + i * 4;
      if (tp.active) {
        out[off] = static_cast<std::uint8_t>(tp.tracking_id & 0x7F);
        const std::uint16_t cx = std::min<std::uint16_t>(tp.x, 1919);
        const std::uint16_t cy = std::min<std::uint16_t>(tp.y, 1079);
        out[off + 1] = static_cast<std::uint8_t>(cx & 0xFF);
        out[off + 2] = static_cast<std::uint8_t>(((cx >> 8) & 0x0F) | ((cy & 0x0F) << 4));
        out[off + 3] = static_cast<std::uint8_t>((cy >> 4) & 0xFF);
      } else {
        out[off] = static_cast<std::uint8_t>(0x80 | (tp.tracking_id & 0x7F));
      }
    }

    const std::uint8_t pct = (state.battery_percent <= 100) ? state.battery_percent : 100;
    const std::uint8_t nibble = static_cast<std::uint8_t>(std::min<int>(10, (pct + 5) / 10));
    out[53] = static_cast<std::uint8_t>(0x10 | (nibble & 0x0F));  // USB-powered + level
    return out;
  }

  bool parse_output_report_02(const std::uint8_t *data, std::size_t len, output_report02_t &out) {
    if (!data || len < kMinOutputReport02Bytes || data[0] != 0x02) {
      return false;
    }

    out = output_report02_t {};
    const std::uint8_t valid_flag0 = data[1];
    const std::uint8_t valid_flag1 = data[2];

    if (valid_flag0 & 0x03) {
      out.has_rumble = true;
      out.high_freq_rumble = static_cast<std::uint16_t>(data[3]) << 8;
      out.low_freq_rumble = static_cast<std::uint16_t>(data[4]) << 8;
    }

    const bool right_trig_en = (valid_flag0 & 0x04) != 0;
    const bool left_trig_en = (valid_flag0 & 0x08) != 0;
    if (right_trig_en || left_trig_en) {
      out.has_triggers = true;
      out.trigger_event_flags = static_cast<std::uint8_t>(valid_flag0 & 0x0C);
      out.trigger_type_right = data[11];
      std::copy_n(&data[12], 10, out.trigger_right.begin());
      out.trigger_type_left = data[22];
      std::copy_n(&data[23], 10, out.trigger_left.begin());
    }

    if (valid_flag1 & 0x04) {
      out.has_led = true;
      out.led_r = data[45];
      out.led_g = data[46];
      out.led_b = data[47];
    }

    return true;
  }

  bool validate_hid_report_descriptor(const std::uint8_t *data, std::size_t len) {
    if (!data || len == 0) {
      return false;
    }
    int collection_depth = 0;
    std::size_t pos = 0;
    while (pos < len) {
      const std::uint8_t prefix = data[pos++];
      if (prefix == 0xFE) {
        if (pos + 2 > len) return false;
        const std::uint8_t data_len = data[pos];
        pos += 2 + data_len;
        if (pos > len) return false;
        continue;
      }
      const std::uint8_t size_code = prefix & 0x03;
      const std::size_t item_len = (size_code == 3) ? 4 : size_code;
      if (pos + item_len > len) {
        return false;
      }
      const std::uint8_t tag_type = prefix & 0xFC;
      if (tag_type == 0xA0) {
        ++collection_depth;
      } else if (tag_type == 0xC0) {
        --collection_depth;
        if (collection_depth < 0) return false;
      }
      pos += item_len;
    }
    return pos == len && collection_depth == 0;
  }

}  // namespace platf::dualsense_hid
