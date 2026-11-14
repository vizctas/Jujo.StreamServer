/**
 * @file src/platform/windows/cfgmgr32_cloak.cpp
 * @brief Zero-bloat Win32 SetupAPI + cfgmgr32 physical gamepad cloak implementation.
 */

#include "cfgmgr32_cloak.h"

#ifndef SUNSHINE_TESTS
#include "src/logging.h"
#endif

#include <windows.h>
#include <cfgmgr32.h>
#include <initguid.h>
#include <devguid.h>
#include <setupapi.h>

#include <algorithm>
#include <array>
#include <cwctype>
#include <mutex>
#include <unordered_set>

namespace platf::gamepad_cloak {

  namespace {

    // GUID_DEVCLASS_XNA_COMPOSITE (Xbox 360 / XUSB Peripherals)
    // {d61ca365-5af4-4486-998b-9db4734c6ca3}
    constexpr GUID kGuidDevClassXnaComposite = {
      0xd61ca365,
      0x5af4,
      0x4486,
      {0x99, 0x8b, 0x9d, 0xb4, 0x73, 0x4c, 0x6c, 0xa3}
    };

    constexpr wchar_t kRegSubkey[] = L"Software\\JujoStream\\GamepadCloak";
    constexpr wchar_t kRegValueName[] = L"CloakedInstanceIds";

    std::mutex g_cloak_mutex;
    std::vector<std::wstring> g_cloaked_ids;

    void log_info(const std::wstring &msg) {
#ifndef SUNSHINE_TESTS
      BOOST_LOG(info) << std::string(msg.begin(), msg.end());
#else
      (void) msg;
#endif
    }

    void log_warn(const std::wstring &msg) {
#ifndef SUNSHINE_TESTS
      BOOST_LOG(warning) << std::string(msg.begin(), msg.end());
#else
      (void) msg;
#endif
    }

    std::wstring to_upper(std::wstring_view in) {
      std::wstring out;
      out.reserve(in.size());
      for (wchar_t ch : in) {
        out.push_back(static_cast<wchar_t>(std::towupper(ch)));
      }
      return out;
    }

    bool contains_upper(const std::wstring &haystack_upper, std::wstring_view needle_upper) {
      return haystack_upper.find(needle_upper) != std::wstring::npos;
    }

    bool any_contains_upper(const std::vector<std::wstring> &items, std::wstring_view needle_upper) {
      for (const auto &item : items) {
        if (contains_upper(to_upper(item), needle_upper)) {
          return true;
        }
      }
      return false;
    }

    bool has_virtual_marker(const std::wstring &s_upper) {
      static constexpr std::array<std::wstring_view, 8> kVirtualMarkers = {
        L"VIGEM",
        L"NEFARIUS",
        L"USBIP",
        L"VIIPER",
        L"VJOY",
        L"VBOX",
        L"SWD\\",
        L"ROOT\\SYSTEM",
      };
      for (auto marker : kVirtualMarkers) {
        if (contains_upper(s_upper, marker)) {
          return true;
        }
      }
      return false;
    }

    bool is_non_gamepad_hid(const std::wstring &s_upper) {
      static constexpr std::array<std::wstring_view, 9> kExcludedMarkers = {
        L"HID_DEVICE_SYSTEM_MOUSE",
        L"HID_DEVICE_SYSTEM_KEYBOARD",
        L"HID_DEVICE_SYSTEM_CONSUMER",
        L"HID_DEVICE_SYSTEM_CONTROL",
        L"HID_DEVICE_SYSTEM_MULTIAXIS",
        L"HID_DEVICE_UP:0001_U:0002",  // Generic Desktop: Mouse
        L"HID_DEVICE_UP:0001_U:0006",  // Generic Desktop: Keyboard
        L"HID_DEVICE_UP:000D",         // Digitizers / Touch / Pen
        L"HID_DEVICE_UP:000C",         // Consumer controls / Headset buttons
      };
      for (auto marker : kExcludedMarkers) {
        if (contains_upper(s_upper, marker)) {
          return true;
        }
      }
      return false;
    }

    bool is_hid_gamepad_id(const std::wstring &s_upper) {
      static constexpr std::array<std::wstring_view, 3> kGamepadMarkers = {
        L"HID_DEVICE_SYSTEM_GAME",
        L"HID_DEVICE_UP:0001_U:0005",  // Game Pad
        L"HID_DEVICE_UP:0001_U:0004",  // Joystick
      };
      for (auto marker : kGamepadMarkers) {
        if (contains_upper(s_upper, marker)) {
          return true;
        }
      }
      return false;
    }

    std::vector<std::wstring> parse_multi_sz(const wchar_t *buf, std::size_t wchar_count) {
      std::vector<std::wstring> out;
      if (!buf || wchar_count == 0) {
        return out;
      }
      std::size_t i = 0;
      while (i < wchar_count && buf[i] != L'\0') {
        std::wstring entry(&buf[i]);
        i += entry.size() + 1;
        if (!entry.empty()) {
          out.push_back(std::move(entry));
        }
      }
      return out;
    }

    std::vector<std::wstring> get_reg_multi_sz_prop(HDEVINFO info, PSP_DEVINFO_DATA dev_data, DWORD prop) {
      DWORD data_type = 0;
      DWORD bytes_needed = 0;
      SetupDiGetDeviceRegistryPropertyW(info, dev_data, prop, &data_type, nullptr, 0, &bytes_needed);
      if (bytes_needed < sizeof(wchar_t) * 2) {
        return {};
      }
      std::vector<wchar_t> buf(bytes_needed / sizeof(wchar_t) + 2, L'\0');
      if (!SetupDiGetDeviceRegistryPropertyW(
            info,
            dev_data,
            prop,
            &data_type,
            reinterpret_cast<PBYTE>(buf.data()),
            bytes_needed,
            nullptr)) {
        return {};
      }
      if (data_type == REG_MULTI_SZ) {
        return parse_multi_sz(buf.data(), buf.size());
      }
      if (data_type == REG_SZ && buf[0] != L'\0') {
        return {std::wstring(buf.data())};
      }
      return {};
    }

    std::vector<std::wstring> collect_ancestors(DEVINST dev_inst) {
      std::vector<std::wstring> ancestors;
      DEVINST cur = dev_inst;
      for (int depth = 0; depth < 6; ++depth) {
        DEVINST parent = 0;
        if (CM_Get_Parent(&parent, cur, 0) != CR_SUCCESS || parent == 0) {
          break;
        }
        wchar_t id_buf[MAX_DEVICE_ID_LEN] {};
        if (CM_Get_Device_IDW(parent, id_buf, MAX_DEVICE_ID_LEN, 0) == CR_SUCCESS && id_buf[0] != L'\0') {
          ancestors.emplace_back(id_buf);
        }
        cur = parent;
      }
      return ancestors;
    }

    void save_persisted_ids(const std::vector<std::wstring> &ids) {
      HKEY hkey = nullptr;
      DWORD disp = 0;
      if (RegCreateKeyExW(
            HKEY_CURRENT_USER,
            kRegSubkey,
            0,
            nullptr,
            REG_OPTION_NON_VOLATILE,
            KEY_WRITE,
            nullptr,
            &hkey,
            &disp) != ERROR_SUCCESS) {
        return;
      }
      if (ids.empty()) {
        RegDeleteValueW(hkey, kRegValueName);
        RegCloseKey(hkey);
        return;
      }
      std::vector<wchar_t> multi_sz;
      for (const auto &id : ids) {
        multi_sz.insert(multi_sz.end(), id.begin(), id.end());
        multi_sz.push_back(L'\0');
      }
      multi_sz.push_back(L'\0');
      RegSetValueExW(
        hkey,
        kRegValueName,
        0,
        REG_MULTI_SZ,
        reinterpret_cast<const BYTE *>(multi_sz.data()),
        static_cast<DWORD>(multi_sz.size() * sizeof(wchar_t)));
      RegCloseKey(hkey);
    }

    std::vector<std::wstring> load_persisted_ids() {
      HKEY hkey = nullptr;
      if (RegOpenKeyExW(HKEY_CURRENT_USER, kRegSubkey, 0, KEY_READ, &hkey) != ERROR_SUCCESS) {
        return {};
      }
      DWORD type = 0;
      DWORD bytes = 0;
      std::vector<std::wstring> out;
      if (RegQueryValueExW(hkey, kRegValueName, nullptr, &type, nullptr, &bytes) == ERROR_SUCCESS &&
          type == REG_MULTI_SZ && bytes >= sizeof(wchar_t) * 2) {
        std::vector<wchar_t> buf(bytes / sizeof(wchar_t) + 2, L'\0');
        if (RegQueryValueExW(hkey, kRegValueName, nullptr, &type, reinterpret_cast<LPBYTE>(buf.data()), &bytes) ==
            ERROR_SUCCESS) {
          out = parse_multi_sz(buf.data(), buf.size());
        }
      }
      RegCloseKey(hkey);
      return out;
    }

    void enumerate_class(const GUID &cls_guid, bool is_xna, std::vector<std::wstring> &out_targets) {
      HDEVINFO info = SetupDiGetClassDevsW(&cls_guid, nullptr, nullptr, DIGCF_PRESENT);
      if (info == INVALID_HANDLE_VALUE) {
        return;
      }

      SP_DEVINFO_DATA dev_data {};
      dev_data.cbSize = sizeof(dev_data);
      for (DWORD index = 0; SetupDiEnumDeviceInfo(info, index, &dev_data); ++index) {
        wchar_t inst_buf[MAX_DEVICE_ID_LEN] {};
        if (!SetupDiGetDeviceInstanceIdW(info, &dev_data, inst_buf, MAX_DEVICE_ID_LEN, nullptr)) {
          continue;
        }
        device_descriptor_t desc;
        desc.instance_id = inst_buf;
        desc.hardware_ids = get_reg_multi_sz_prop(info, &dev_data, SPDRP_HARDWAREID);
        desc.compatible_ids = get_reg_multi_sz_prop(info, &dev_data, SPDRP_COMPATIBLEIDS);
        desc.ancestor_ids = collect_ancestors(dev_data.DevInst);
        desc.is_xna_composite = is_xna;

        if (should_cloak_device(desc)) {
          out_targets.push_back(std::move(desc.instance_id));
        }
      }

      SetupDiDestroyDeviceInfoList(info);
    }

    bool set_devnode_enabled(const std::wstring &instance_id, bool enable) {
      DEVINST dev_inst = 0;
      const ULONG flags = enable ? CM_LOCATE_DEVNODE_PHANTOM : CM_LOCATE_DEVNODE_NORMAL;
      CONFIGRET cr = CM_Locate_DevNodeW(&dev_inst, const_cast<DEVINSTID_W>(instance_id.c_str()), flags);
      if (cr != CR_SUCCESS && enable) {
        cr = CM_Locate_DevNodeW(&dev_inst, const_cast<DEVINSTID_W>(instance_id.c_str()), CM_LOCATE_DEVNODE_NORMAL);
      }
      if (cr != CR_SUCCESS) {
        return false;
      }
      cr = enable ? CM_Enable_DevNode(dev_inst, 0) : CM_Disable_DevNode(dev_inst, CM_DISABLE_UI_NOT_OK);
      return cr == CR_SUCCESS;
    }

  }  // namespace

  bool should_cloak_device(const device_descriptor_t &dev) {
    if (dev.instance_id.empty()) {
      return false;
    }

    const std::wstring inst_upper = to_upper(dev.instance_id);
    if (has_virtual_marker(inst_upper)) {
      return false;
    }
    for (const auto &anc : dev.ancestor_ids) {
      if (has_virtual_marker(to_upper(anc))) {
        return false;
      }
    }
    for (const auto &hw : dev.hardware_ids) {
      const auto u = to_upper(hw);
      if (has_virtual_marker(u) || contains_upper(u, L"VIRTUAL")) {
        return false;
      }
    }
    for (const auto &compat : dev.compatible_ids) {
      const auto u = to_upper(compat);
      if (has_virtual_marker(u) || contains_upper(u, L"VIRTUAL")) {
        return false;
      }
    }

    if (dev.is_xna_composite) {
      // Physical Xbox / XUSB devices on USB/Bluetooth/Xbox wireless adapter
      return contains_upper(inst_upper, L"USB\\") ||
             contains_upper(inst_upper, L"HID\\") ||
             contains_upper(inst_upper, L"BTHENUM\\") ||
             contains_upper(inst_upper, L"XGBUS\\");
    }

    // For generic HID class, require an explicit game controller / joystick ID and never cloak mice/keyboards.
    for (const auto &hw : dev.hardware_ids) {
      if (is_non_gamepad_hid(to_upper(hw))) {
        return false;
      }
    }
    for (const auto &compat : dev.compatible_ids) {
      if (is_non_gamepad_hid(to_upper(compat))) {
        return false;
      }
    }

    for (const auto &hw : dev.hardware_ids) {
      if (is_hid_gamepad_id(to_upper(hw))) {
        return true;
      }
    }
    for (const auto &compat : dev.compatible_ids) {
      if (is_hid_gamepad_id(to_upper(compat))) {
        return true;
      }
    }

    (void) any_contains_upper;
    return false;
  }

  void cloak_local_gamepads() {
    std::lock_guard<std::mutex> lock(g_cloak_mutex);

    // Recover any stale cloaked entries first if previous run crashed.
    for (const auto &stale_id : load_persisted_ids()) {
      set_devnode_enabled(stale_id, true);
    }

    std::vector<std::wstring> candidates;
    enumerate_class(GUID_DEVCLASS_HIDCLASS, false, candidates);
    enumerate_class(kGuidDevClassXnaComposite, true, candidates);

    std::unordered_set<std::wstring> seen;
    std::vector<std::wstring> newly_cloaked;
    for (const auto &id : candidates) {
      if (!seen.insert(id).second) {
        continue;
      }
      if (set_devnode_enabled(id, false)) {
        newly_cloaked.push_back(id);
        log_info(L"cfgmgr32_cloak: disabled local physical gamepad " + id);
      } else {
        log_warn(L"cfgmgr32_cloak: could not disable " + id + L" (may require elevated privileges)");
      }
    }

    g_cloaked_ids = std::move(newly_cloaked);
    save_persisted_ids(g_cloaked_ids);
  }

  void restore_local_gamepads() {
    std::lock_guard<std::mutex> lock(g_cloak_mutex);

    std::unordered_set<std::wstring> to_restore;
    for (const auto &id : g_cloaked_ids) {
      to_restore.insert(id);
    }
    for (const auto &id : load_persisted_ids()) {
      to_restore.insert(id);
    }

    for (const auto &id : to_restore) {
      if (set_devnode_enabled(id, true)) {
        log_info(L"cfgmgr32_cloak: restored local physical gamepad " + id);
      } else {
        log_warn(L"cfgmgr32_cloak: could not restore " + id);
      }
    }

    g_cloaked_ids.clear();
    save_persisted_ids({});
  }

  std::size_t cloaked_count() {
    std::lock_guard<std::mutex> lock(g_cloak_mutex);
    return g_cloaked_ids.size();
  }

}  // namespace platf::gamepad_cloak

