/**
 * @file src/platform/windows/game_session_policy.cpp
 * @brief Deterministic Windows game-session ownership policy.
 */
#include "game_session_orchestrator.h"

#ifdef _WIN32

#include <algorithm>
#include <array>
#include <cwctype>
#include <filesystem>
#include <string_view>

namespace game_session::policy {
  namespace {
    std::wstring normalize_path(std::wstring value) {
      std::replace(value.begin(), value.end(), L'/', L'\\');
      while (value.size() > 3 && !value.empty() && value.back() == L'\\') {
        value.pop_back();
      }
      std::transform(value.begin(), value.end(), value.begin(), [](wchar_t ch) {
        return static_cast<wchar_t>(std::towlower(ch));
      });
      return value;
    }

    std::wstring absolute_normalized_path(const std::wstring &value) {
      if (value.empty()) {
        return {};
      }
      std::error_code ec;
      auto absolute = std::filesystem::absolute(std::filesystem::path(value), ec);
      if (ec) {
        return normalize_path(value);
      }
      return normalize_path(absolute.lexically_normal().wstring());
    }

    bool same_or_child_path(const std::wstring &path, const std::wstring &root) {
      const auto normalized_path = absolute_normalized_path(path);
      const auto normalized_root = absolute_normalized_path(root);
      if (normalized_root.empty() || normalized_path.size() < normalized_root.size()) {
        return false;
      }
      if (normalized_path.compare(0, normalized_root.size(), normalized_root) != 0) {
        return false;
      }
      return normalized_path.size() == normalized_root.size() ||
             normalized_path[normalized_root.size()] == L'\\';
    }

    std::wstring environment_path(const wchar_t *name) {
      std::array<wchar_t, 32768> buffer {};
      const auto length = GetEnvironmentVariableW(name, buffer.data(), static_cast<DWORD>(buffer.size()));
      if (length == 0 || length >= buffer.size()) {
        return {};
      }
      return absolute_normalized_path(std::wstring(buffer.data(), length));
    }

    std::wstring windows_directory() {
      std::array<wchar_t, MAX_PATH> buffer {};
      const auto length = GetWindowsDirectoryW(buffer.data(), static_cast<UINT>(buffer.size()));
      if (length == 0 || length >= buffer.size()) {
        return {};
      }
      return absolute_normalized_path(std::wstring(buffer.data(), length));
    }
  }  // namespace

  bool is_safe_game_root(const std::wstring &root) {
    const auto normalized = absolute_normalized_path(root);
    if (normalized.size() <= 3) {
      return false;
    }

    const std::filesystem::path path(normalized);
    if (path == path.root_path()) {
      return false;
    }

    const auto windows = windows_directory();
    const auto program_data = environment_path(L"ProgramData");
    const auto user_profile = environment_path(L"USERPROFILE");
    if ((!windows.empty() && same_or_child_path(normalized, windows)) ||
        (!program_data.empty() && same_or_child_path(normalized, program_data)) ||
        (!user_profile.empty() && normalized == user_profile)) {
      return false;
    }

    auto leaf = path.filename().wstring();
    std::transform(leaf.begin(), leaf.end(), leaf.begin(), [](wchar_t ch) {
      return static_cast<wchar_t>(std::towlower(ch));
    });
    return leaf != L"steam" && leaf != L"windows" && leaf != L"system32";
  }

  bool path_is_under_root(const std::wstring &path, const std::wstring &root) {
    return is_safe_game_root(root) && same_or_child_path(path, root);
  }

  bool is_excluded_process(const std::wstring &image_path) {
    auto filename = std::filesystem::path(image_path).filename().wstring();
    std::transform(filename.begin(), filename.end(), filename.begin(), [](wchar_t ch) {
      return static_cast<wchar_t>(std::towlower(ch));
    });
    static const std::array<std::wstring_view, 7> excluded {
      L"steam.exe",
      L"steamservice.exe",
      L"steamwebhelper.exe",
      L"explorer.exe",
      L"searchhost.exe",
      L"applicationframehost.exe",
      L"systemsettings.exe",
    };
    return std::find(excluded.begin(), excluded.end(), filename) != excluded.end();
  }

  bool is_new_since_launch(
    const process_record_t &record,
    const process_baseline_t &baseline,
    std::uint64_t launch_time
  ) {
    if (record.identity.pid == 0 || record.identity.creation_time == 0) {
      return false;
    }
    const auto baseline_entry = baseline.find(record.identity.pid);
    if (baseline_entry != baseline.end() && baseline_entry->second == record.identity.creation_time) {
      return false;
    }
    constexpr std::uint64_t two_seconds_in_filetime = 2ULL * 10000000ULL;
    const auto lower_bound = launch_time > two_seconds_in_filetime ?
                               launch_time - two_seconds_in_filetime :
                               0;
    return record.identity.creation_time >= lower_bound;
  }

  bool should_adopt(
    const process_record_t &record,
    DWORD direct_pid,
    const process_baseline_t &baseline,
    std::uint64_t launch_time,
    const std::unordered_set<DWORD> &owned_pids,
    const std::vector<std::wstring> &roots
  ) {
    if (is_excluded_process(record.image_path) ||
        !is_new_since_launch(record, baseline, launch_time)) {
      return false;
    }
    if (record.identity.pid == direct_pid || owned_pids.contains(record.parent_pid)) {
      return true;
    }
    return std::any_of(roots.begin(), roots.end(), [&](const std::wstring &root) {
      return path_is_under_root(record.image_path, root);
    });
  }

  bool detached_app_should_report_running(
    bool playnite_managed,
    bool launcher_running,
    bool owned_process_running,
    int active_streams
  ) {
    return playnite_managed || launcher_running || owned_process_running || active_streams > 0;
  }
}  // namespace game_session::policy

#endif  // _WIN32
