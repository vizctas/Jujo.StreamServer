#include "autostart.h"

#include <Windows.h>
#include <ntsecapi.h>

#include <vector>

namespace platf::autostart {
  namespace {
    constexpr auto kWinlogonKey = L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon";
    constexpr auto kServiceName = "Jujo.Server";

    std::string wide_to_utf8(const std::wstring &value) {
      if (value.empty()) {
        return {};
      }
      const int size = WideCharToMultiByte(CP_UTF8, 0, value.c_str(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
      if (size <= 0) {
        return {};
      }
      std::string out(static_cast<size_t>(size), '\0');
      WideCharToMultiByte(CP_UTF8, 0, value.c_str(), static_cast<int>(value.size()), out.data(), size, nullptr, nullptr);
      return out;
    }

    std::wstring utf8_to_wide(const std::string &value) {
      if (value.empty()) {
        return {};
      }
      const int size = MultiByteToWideChar(CP_UTF8, 0, value.c_str(), static_cast<int>(value.size()), nullptr, 0);
      if (size <= 0) {
        return {};
      }
      std::wstring out(static_cast<size_t>(size), L'\0');
      MultiByteToWideChar(CP_UTF8, 0, value.c_str(), static_cast<int>(value.size()), out.data(), size);
      return out;
    }

    bool read_reg_string(HKEY root, const wchar_t *subkey, const wchar_t *name, std::wstring &value) {
      HKEY key = nullptr;
      if (RegOpenKeyExW(root, subkey, 0, KEY_READ | KEY_WOW64_64KEY, &key) != ERROR_SUCCESS) {
        return false;
      }

      DWORD type = 0;
      DWORD bytes = 0;
      const auto size_result = RegQueryValueExW(key, name, nullptr, &type, nullptr, &bytes);
      if (size_result != ERROR_SUCCESS || (type != REG_SZ && type != REG_EXPAND_SZ) || bytes == 0) {
        RegCloseKey(key);
        return false;
      }

      std::vector<wchar_t> buffer((bytes / sizeof(wchar_t)) + 1, L'\0');
      const auto read_result = RegQueryValueExW(key, name, nullptr, &type, reinterpret_cast<LPBYTE>(buffer.data()), &bytes);
      RegCloseKey(key);
      if (read_result != ERROR_SUCCESS) {
        return false;
      }

      value = buffer.data();
      return true;
    }

    bool write_reg_string(HKEY root, const wchar_t *subkey, const wchar_t *name, const std::wstring &value, std::string &error) {
      HKEY key = nullptr;
      const auto open_result = RegCreateKeyExW(
        root,
        subkey,
        0,
        nullptr,
        REG_OPTION_NON_VOLATILE,
        KEY_SET_VALUE | KEY_WOW64_64KEY,
        nullptr,
        &key,
        nullptr
      );
      if (open_result != ERROR_SUCCESS) {
        error = "Failed to open Winlogon registry key.";
        return false;
      }

      const auto bytes = static_cast<DWORD>((value.size() + 1) * sizeof(wchar_t));
      const auto set_result = RegSetValueExW(key, name, 0, REG_SZ, reinterpret_cast<const BYTE *>(value.c_str()), bytes);
      RegCloseKey(key);
      if (set_result != ERROR_SUCCESS) {
        error = "Failed to write Winlogon registry value.";
        return false;
      }
      return true;
    }

    bool write_lsa_default_password(const std::wstring *password, std::string &error) {
      LSA_OBJECT_ATTRIBUTES object_attributes {};
      LSA_HANDLE policy_handle = nullptr;

      const auto open_status = LsaOpenPolicy(nullptr, &object_attributes, POLICY_CREATE_SECRET, &policy_handle);
      if (open_status != 0) {
        error = "Failed to open LSA policy.";
        return false;
      }

      LSA_UNICODE_STRING secret_name {};
      secret_name.Buffer = const_cast<wchar_t *>(L"DefaultPassword");
      secret_name.Length = static_cast<USHORT>(wcslen(secret_name.Buffer) * sizeof(wchar_t));
      secret_name.MaximumLength = static_cast<USHORT>(secret_name.Length + sizeof(wchar_t));

      NTSTATUS store_status = 0;
      if (password == nullptr) {
        store_status = LsaStorePrivateData(policy_handle, &secret_name, nullptr);
      } else {
        LSA_UNICODE_STRING secret_value {};
        secret_value.Buffer = const_cast<wchar_t *>(password->c_str());
        secret_value.Length = static_cast<USHORT>(password->size() * sizeof(wchar_t));
        secret_value.MaximumLength = static_cast<USHORT>(secret_value.Length + sizeof(wchar_t));
        store_status = LsaStorePrivateData(policy_handle, &secret_name, &secret_value);
      }

      LsaClose(policy_handle);

      if (store_status != 0) {
        error = "Failed to update protected autologon password.";
        return false;
      }
      return true;
    }

    bool query_service(status_t &status) {
      SC_HANDLE scm = OpenSCManagerA(nullptr, nullptr, SC_MANAGER_CONNECT);
      if (!scm) {
        return false;
      }

      SC_HANDLE service = OpenServiceA(scm, kServiceName, SERVICE_QUERY_STATUS | SERVICE_QUERY_CONFIG);
      if (!service) {
        CloseServiceHandle(scm);
        return true;
      }

      status.service_exists = true;

      SERVICE_STATUS_PROCESS process_status {};
      DWORD bytes_needed = 0;
      if (QueryServiceStatusEx(service, SC_STATUS_PROCESS_INFO, reinterpret_cast<LPBYTE>(&process_status), sizeof(process_status), &bytes_needed)) {
        status.service_running = process_status.dwCurrentState == SERVICE_RUNNING;
      }

      DWORD cfg_bytes = 0;
      QueryServiceConfigA(service, nullptr, 0, &cfg_bytes);
      if (cfg_bytes > 0) {
        auto cfg_buffer = std::vector<BYTE>(cfg_bytes);
        auto *cfg = reinterpret_cast<QUERY_SERVICE_CONFIGA *>(cfg_buffer.data());
        if (QueryServiceConfigA(service, cfg, cfg_bytes, &cfg_bytes)) {
          switch (cfg->dwStartType) {
            case SERVICE_AUTO_START:
              status.service_start_type = "auto";
              break;
            case SERVICE_DEMAND_START:
              status.service_start_type = "manual";
              break;
            case SERVICE_DISABLED:
              status.service_start_type = "disabled";
              break;
            default:
              status.service_start_type = "unknown";
              break;
          }
        }
      }

      CloseServiceHandle(service);
      CloseServiceHandle(scm);
      return true;
    }
  }

  bool get_status(status_t &status, std::string &error) {
    status = {};
    status.supported = true;

    std::wstring auto_admin;
    std::wstring user;
    std::wstring domain;

    read_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"AutoAdminLogon", auto_admin);
    read_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"DefaultUserName", user);
    read_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"DefaultDomainName", domain);

    status.autologon_enabled = auto_admin == L"1";
    status.username = wide_to_utf8(user);
    status.domain = wide_to_utf8(domain);

    if (!query_service(status)) {
      error = "Failed to query service manager.";
      return false;
    }

    status.backend_startup_ready = status.service_exists && status.service_start_type == "auto";
    status.boot_path_ready = status.autologon_enabled && status.backend_startup_ready;

    if (!status.service_exists) {
      status.warning = "Jujo.Server service is not installed.";
    } else if (status.service_start_type != "auto") {
      status.warning = "Jujo.Server service startup is not Automatic.";
    }

    return true;
  }

  bool enable_autologon(const std::string &username, const std::string &domain, const std::string &password, std::string &error) {
    if (username.empty()) {
      error = "Username is required.";
      return false;
    }
    if (password.empty()) {
      error = "Password is required.";
      return false;
    }

    const auto user_w = utf8_to_wide(username);
    const auto domain_w = utf8_to_wide(domain);
    const auto pass_w = utf8_to_wide(password);

    if (user_w.empty() || pass_w.empty()) {
      error = "Invalid username or password encoding.";
      return false;
    }

    if (!write_lsa_default_password(&pass_w, error)) {
      return false;
    }

    if (!write_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"DefaultUserName", user_w, error)) {
      return false;
    }
    if (!domain_w.empty()) {
      if (!write_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"DefaultDomainName", domain_w, error)) {
        return false;
      }
    }
    if (!write_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"AutoAdminLogon", L"1", error)) {
      return false;
    }

    return true;
  }

  bool disable_autologon(std::string &error) {
    if (!write_lsa_default_password(nullptr, error)) {
      return false;
    }

    if (!write_reg_string(HKEY_LOCAL_MACHINE, kWinlogonKey, L"AutoAdminLogon", L"0", error)) {
      return false;
    }

    return true;
  }
}
