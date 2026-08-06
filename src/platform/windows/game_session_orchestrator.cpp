/**
 * @file src/platform/windows/game_session_orchestrator.cpp
 */
#include "game_session_orchestrator.h"

#ifdef _WIN32

#include <algorithm>
#include <array>
#include <cctype>
#include <cwctype>
#include <filesystem>
#include <iomanip>
#include <limits>
#include <random>
#include <sstream>
#include <string_view>
#include <TlHelp32.h>

#include "src/logging.h"
#include "src/platform/common.h"
#include "src/platform/windows/misc.h"
#include "tools/playnite_launcher/focus_utils.h"

using namespace std::chrono_literals;

namespace game_session {
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

    std::uint64_t filetime_to_uint64(const FILETIME &value) {
      ULARGE_INTEGER converted {};
      converted.LowPart = value.dwLowDateTime;
      converted.HighPart = value.dwHighDateTime;
      return converted.QuadPart;
    }

    bool query_process_record(DWORD pid, DWORD parent_pid, process_record_t &record) {
      if (pid == 0 || pid == GetCurrentProcessId()) {
        return false;
      }

      HANDLE handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
      if (!handle) {
        return false;
      }

      std::array<wchar_t, 32768> path_buffer {};
      DWORD path_length = static_cast<DWORD>(path_buffer.size());
      FILETIME creation {}, exit_time {}, kernel {}, user {};
      const bool got_path = QueryFullProcessImageNameW(handle, 0, path_buffer.data(), &path_length) != FALSE;
      const bool got_times = GetProcessTimes(handle, &creation, &exit_time, &kernel, &user) != FALSE;
      CloseHandle(handle);

      if (!got_path || !got_times || path_length == 0) {
        return false;
      }

      record.identity = {pid, filetime_to_uint64(creation)};
      record.parent_pid = parent_pid;
      record.image_path.assign(path_buffer.data(), path_length);
      return record.identity.creation_time != 0;
    }

    std::vector<process_record_t> enumerate_process_records() {
      std::vector<process_record_t> result;
      HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
      if (snapshot == INVALID_HANDLE_VALUE) {
        return result;
      }

      PROCESSENTRY32W entry {};
      entry.dwSize = sizeof(entry);
      if (Process32FirstW(snapshot, &entry)) {
        do {
          process_record_t record;
          if (query_process_record(entry.th32ProcessID, entry.th32ParentProcessID, record)) {
            result.push_back(std::move(record));
          }
        } while (Process32NextW(snapshot, &entry));
      }
      CloseHandle(snapshot);
      return result;
    }

    bool identity_is_alive(const process_identity_t &identity) {
      process_record_t current;
      return query_process_record(identity.pid, 0, current) && current.identity == identity;
    }

    std::string make_token() {
      std::random_device random;
      std::mt19937_64 generator(random());
      std::ostringstream token;
      token << std::hex << std::setfill('0')
            << std::setw(16) << generator()
            << std::setw(16) << generator();
      return token.str();
    }

    bool is_window_cloaked(HWND hwnd) {
      using dwm_get_window_attribute_t = HRESULT(WINAPI *)(HWND, DWORD, PVOID, DWORD);
      static HMODULE dwm = LoadLibraryW(L"dwmapi.dll");
      static auto get_attribute = dwm ? reinterpret_cast<dwm_get_window_attribute_t>(
                                          GetProcAddress(dwm, "DwmGetWindowAttribute")) :
                                        nullptr;
      if (!get_attribute) {
        return false;
      }
      constexpr DWORD dwmwa_cloaked = 14;
      DWORD cloaked = 0;
      return SUCCEEDED(get_attribute(hwnd, dwmwa_cloaked, &cloaked, sizeof(cloaked))) && cloaked != 0;
    }

    std::uint64_t rect_area(const RECT &rect) {
      const auto width = std::max<LONG>(0, rect.right - rect.left);
      const auto height = std::max<LONG>(0, rect.bottom - rect.top);
      return static_cast<std::uint64_t>(width) * static_cast<std::uint64_t>(height);
    }

    double monitor_coverage(HWND hwnd, const RECT &rect) {
      const HMONITOR monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONULL);
      if (!monitor) {
        return 0.0;
      }
      MONITORINFO info {};
      info.cbSize = sizeof(info);
      if (!GetMonitorInfoW(monitor, &info)) {
        return 0.0;
      }
      const auto monitor_area = rect_area(info.rcMonitor);
      if (monitor_area == 0) {
        return 0.0;
      }
      return std::min(1.0, static_cast<double>(rect_area(rect)) / static_cast<double>(monitor_area));
    }

    int post_close_to_identities(const std::vector<process_identity_t> &identities) {
      struct context_t {
        const std::vector<process_identity_t> *identities;
        int posted {0};
      } context {&identities};

      EnumWindows([](HWND hwnd, LPARAM parameter) -> BOOL {
        auto *context = reinterpret_cast<context_t *>(parameter);
        DWORD pid = 0;
        GetWindowThreadProcessId(hwnd, &pid);
        if (pid == 0 || GetWindow(hwnd, GW_OWNER) != nullptr) {
          return TRUE;
        }
        const auto match = std::find_if(
          context->identities->begin(),
          context->identities->end(),
          [pid](const process_identity_t &identity) {
            return identity.pid == pid && identity_is_alive(identity);
          }
        );
        if (match != context->identities->end() && PostMessageW(hwnd, WM_CLOSE, 0, 0)) {
          ++context->posted;
        }
        return TRUE;
      }, reinterpret_cast<LPARAM>(&context));

      return context.posted;
    }
  }  // namespace

  const char *phase_name(phase_e phase) noexcept {
    switch (phase) {
      case phase_e::idle:
        return "idle";
      case phase_e::launching:
        return "launching";
      case phase_e::waiting_window:
        return "waitingWindow";
      case phase_e::focusing:
        return "focusing";
      case phase_e::stabilizing:
        return "stabilizing";
      case phase_e::ready:
        return "ready";
      case phase_e::failed:
        return "failed";
      case phase_e::cancelling:
        return "cancelling";
      case phase_e::closed:
        return "closed";
    }
    return "idle";
  }

  orchestrator_t::~orchestrator_t() {
    stop_monitoring();
  }

  process_baseline_t orchestrator_t::capture_process_baseline() {
    process_baseline_t baseline;
    for (const auto &record : enumerate_process_records()) {
      baseline.emplace(record.identity.pid, record.identity.creation_time);
    }
    return baseline;
  }

  std::uint64_t orchestrator_t::current_filetime() {
    FILETIME now {};
    GetSystemTimeAsFileTime(&now);
    return filetime_to_uint64(now);
  }

  snapshot_t orchestrator_t::start(launch_options_t options) {
    stop_worker(false);
    if (options.desktop) {
      reset_for_desktop();
      return snapshot();
    }

    std::vector<std::wstring> roots;
    for (const auto &root : options.candidate_roots) {
      const auto normalized = absolute_normalized_path(root);
      if (!policy::is_safe_game_root(normalized)) {
        if (!root.empty()) {
          BOOST_LOG(warning) << "Game session: rejecting unsafe ownership root ["
                             << platf::to_utf8(root) << "]";
        }
        continue;
      }
      if (std::find(roots.begin(), roots.end(), normalized) == roots.end()) {
        roots.push_back(normalized);
      }
    }
    options.candidate_roots = std::move(roots);

    {
      std::scoped_lock lock(_mutex);
      _options = std::move(options);
      _stop_requested = false;
      _retry_generation = 0;
      _owned.clear();
      _snapshot = {};
      _snapshot.required = true;
      _snapshot.token = make_token();
      _snapshot.owner_client_uuid = _options.owner_client_uuid;
      _snapshot.app_id = _options.app_id;
      _snapshot.app_uuid = _options.app_uuid;
      _snapshot.app_name = _options.app_name;
      _snapshot.phase = phase_e::launching;
      _snapshot.detail = "Launch command dispatched";
      _snapshot.generation = 1;
      _snapshot.attempt = 1;
    }

    BOOST_LOG(info) << "Game session: monitoring app [" << _options.app_name
                    << "] roots=" << _options.candidate_roots.size()
                    << " direct_pid=" << _options.direct_pid;
    _worker = std::thread([this]() {
      run();
    });
    return snapshot();
  }

  void orchestrator_t::stop_worker(bool closing) {
    {
      std::scoped_lock lock(_mutex);
      if (!_worker.joinable()) {
        return;
      }
      _stop_requested = true;
      if (closing && _snapshot.required) {
        _snapshot.phase = phase_e::cancelling;
        _snapshot.detail = "Closing owned game processes";
        ++_snapshot.generation;
      }
    }
    _wake.notify_all();
    _worker.join();
  }

  void orchestrator_t::stop_monitoring() {
    stop_worker(false);
  }

  bool orchestrator_t::has_live_owned_processes() const {
    const auto identities = owned_identities_snapshot();
    return std::any_of(identities.begin(), identities.end(), identity_is_alive);
  }

  void orchestrator_t::reset_for_desktop() {
    stop_worker(false);
    std::scoped_lock lock(_mutex);
    _options = {};
    _owned.clear();
    _snapshot = {};
  }

  snapshot_t orchestrator_t::snapshot() const {
    std::scoped_lock lock(_mutex);
    return _snapshot;
  }

  std::optional<snapshot_t> orchestrator_t::snapshot_for(
    const std::string &owner_client_uuid,
    const std::string &token
  ) const {
    std::scoped_lock lock(_mutex);
    if (!_snapshot.required || token.empty() || token != _snapshot.token ||
        owner_client_uuid.empty() || owner_client_uuid != _snapshot.owner_client_uuid) {
      return std::nullopt;
    }
    return _snapshot;
  }

  bool orchestrator_t::retry(const std::string &owner_client_uuid, const std::string &token) {
    {
      std::scoped_lock lock(_mutex);
      if (!_snapshot.required || token.empty() || token != _snapshot.token ||
          owner_client_uuid.empty() || owner_client_uuid != _snapshot.owner_client_uuid ||
          _snapshot.phase == phase_e::cancelling || _snapshot.phase == phase_e::closed) {
        return false;
      }
      ++_retry_generation;
      ++_snapshot.attempt;
      ++_snapshot.generation;
      _snapshot.phase = phase_e::waiting_window;
      _snapshot.detail = "Retrying game window discovery";
      _snapshot.failure_code.clear();
      _snapshot.selected_pid = 0;
    }
    _wake.notify_all();
    return true;
  }

  void orchestrator_t::transition(
    phase_e phase,
    std::string detail,
    std::string failure_code,
    DWORD selected_pid
  ) {
    std::scoped_lock lock(_mutex);
    if (_snapshot.phase == phase && _snapshot.detail == detail &&
        _snapshot.failure_code == failure_code && _snapshot.selected_pid == selected_pid) {
      return;
    }
    _snapshot.phase = phase;
    _snapshot.detail = std::move(detail);
    _snapshot.failure_code = std::move(failure_code);
    _snapshot.selected_pid = selected_pid;
    ++_snapshot.generation;
    BOOST_LOG(info) << "Game session state: " << phase_name(_snapshot.phase)
                    << " app=[" << _snapshot.app_name << "] pid=" << _snapshot.selected_pid
                    << " detail=[" << _snapshot.detail << "]";
  }

  void orchestrator_t::discover_owned_processes() {
    const auto records = enumerate_process_records();
    process_baseline_t baseline;
    std::vector<std::wstring> roots;
    std::uint64_t launch_time = 0;
    DWORD direct_pid = 0;
    std::unordered_set<DWORD> owned_pids;
    {
      std::scoped_lock lock(_mutex);
      baseline = _options.baseline;
      roots = _options.candidate_roots;
      launch_time = _options.launch_time;
      direct_pid = _options.direct_pid;
      for (const auto &[pid, _] : _owned) {
        owned_pids.insert(pid);
      }
    }

    std::vector<process_identity_t> adopted;
    bool changed = true;
    while (changed) {
      changed = false;
      for (const auto &record : records) {
        if (owned_pids.contains(record.identity.pid)) {
          continue;
        }
        if (policy::should_adopt(record, direct_pid, baseline, launch_time, owned_pids, roots)) {
          owned_pids.insert(record.identity.pid);
          adopted.push_back(record.identity);
          changed = true;
        }
      }
    }

    if (adopted.empty()) {
      return;
    }
    std::scoped_lock lock(_mutex);
    for (const auto &identity : adopted) {
      _owned[identity.pid] = identity;
      BOOST_LOG(info) << "Game session: adopted pid=" << identity.pid
                      << " creation=" << identity.creation_time;
    }
  }

  std::optional<orchestrator_t::window_candidate_t> orchestrator_t::best_window_candidate() const {
    std::unordered_set<DWORD> owned_pids;
    {
      std::scoped_lock lock(_mutex);
      for (const auto &[pid, identity] : _owned) {
        if (identity_is_alive(identity)) {
          owned_pids.insert(pid);
        }
      }
    }
    if (owned_pids.empty()) {
      return std::nullopt;
    }

    struct enum_context_t {
      const std::unordered_set<DWORD> *owned;
      HWND foreground;
      std::optional<window_candidate_t> best;
      long double best_score {-1.0};
    } context {&owned_pids, GetForegroundWindow()};

    EnumWindows([](HWND hwnd, LPARAM parameter) -> BOOL {
      auto *context = reinterpret_cast<enum_context_t *>(parameter);
      DWORD pid = 0;
      GetWindowThreadProcessId(hwnd, &pid);
      if (!context->owned->contains(pid) || !IsWindowVisible(hwnd) ||
          GetWindow(hwnd, GW_OWNER) != nullptr || is_window_cloaked(hwnd)) {
        return TRUE;
      }

      RECT rect {};
      if (!GetWindowRect(hwnd, &rect)) {
        return TRUE;
      }
      const auto area = rect_area(rect);
      if (area < 320ULL * 200ULL || !MonitorFromRect(&rect, MONITOR_DEFAULTTONULL)) {
        return TRUE;
      }

      const bool foreground = hwnd == context->foreground;
      const auto coverage = monitor_coverage(hwnd, rect);
      const long double score = static_cast<long double>(area) *
                                (1.0L + (foreground ? 0.35L : 0.0L) +
                                 static_cast<long double>(coverage) * 0.25L);
      if (score > context->best_score) {
        context->best_score = score;
        context->best = window_candidate_t {hwnd, pid, area, coverage, foreground};
      }
      return TRUE;
    }, reinterpret_cast<LPARAM>(&context));

    return context.best;
  }

  bool orchestrator_t::focus_and_confirm(const window_candidate_t &candidate) {
    if (!candidate.hwnd || !IsWindow(candidate.hwnd)) {
      return false;
    }
    if (IsIconic(candidate.hwnd)) {
      ShowWindow(candidate.hwnd, SW_RESTORE);
    }
    if (!playnite_launcher::focus::confirm_foreground_pid(candidate.pid)) {
      if (!playnite_launcher::focus::try_focus_hwnd(candidate.hwnd)) {
        return false;
      }
      std::this_thread::sleep_for(100ms);
    }
    return playnite_launcher::focus::confirm_foreground_pid(candidate.pid);
  }

  void orchestrator_t::run() {
    auto deadline = std::chrono::steady_clock::now() + _options.timeout;
    std::uint64_t observed_retry = 0;
    HWND stable_hwnd = nullptr;
    DWORD stable_pid = 0;
    auto stable_since = std::chrono::steady_clock::time_point {};
    auto next_focus_attempt = std::chrono::steady_clock::now();
    transition(phase_e::waiting_window, "Waiting for the game window");

    while (true) {
      phase_e current_phase;
      std::uint64_t retry_generation;
      {
        std::unique_lock lock(_mutex);
        if (_stop_requested) {
          return;
        }
        current_phase = _snapshot.phase;
        retry_generation = _retry_generation;
      }

      if (retry_generation != observed_retry) {
        observed_retry = retry_generation;
        deadline = std::chrono::steady_clock::now() + _options.timeout;
        stable_hwnd = nullptr;
        stable_pid = 0;
        stable_since = {};
        next_focus_attempt = std::chrono::steady_clock::now();
      }

      if (current_phase == phase_e::failed) {
        std::unique_lock lock(_mutex);
        _wake.wait_for(lock, 250ms, [this, observed_retry]() {
          return _stop_requested || _retry_generation != observed_retry;
        });
        continue;
      }

      discover_owned_processes();
      auto candidate = best_window_candidate();

      if (current_phase == phase_e::ready) {
        if (candidate && !playnite_launcher::focus::confirm_foreground_pid(candidate->pid) &&
            std::chrono::steady_clock::now() >= next_focus_attempt) {
          BOOST_LOG(warning) << "Game session: ready game lost foreground; refocusing pid=" << candidate->pid;
          static_cast<void>(focus_and_confirm(*candidate));
          next_focus_attempt = std::chrono::steady_clock::now() + 1s;
        }
      } else if (!candidate) {
        stable_hwnd = nullptr;
        stable_pid = 0;
        stable_since = {};
        transition(phase_e::waiting_window, "Waiting for the game window");
      } else {
        const auto now = std::chrono::steady_clock::now();
        bool foreground = playnite_launcher::focus::confirm_foreground_pid(candidate->pid);
        if (!foreground && now >= next_focus_attempt) {
          transition(phase_e::focusing, "Restoring and focusing the game window", {}, candidate->pid);
          foreground = focus_and_confirm(*candidate);
          next_focus_attempt = now + 1s;
        }

        if (!foreground) {
          stable_hwnd = nullptr;
          stable_pid = 0;
          stable_since = {};
        } else {
          if (stable_hwnd != candidate->hwnd || stable_pid != candidate->pid) {
            stable_hwnd = candidate->hwnd;
            stable_pid = candidate->pid;
            stable_since = now;
          }
          transition(phase_e::stabilizing, "Confirming stable foreground game window", {}, candidate->pid);
          const auto required_stability = candidate->monitor_coverage >= 0.30 ? 1500ms : 4000ms;
          if (stable_since != std::chrono::steady_clock::time_point {} &&
              now - stable_since >= required_stability) {
            transition(phase_e::ready, "Game is foreground and ready", {}, candidate->pid);
            current_phase = phase_e::ready;
          }
        }
      }

      if (current_phase != phase_e::ready && std::chrono::steady_clock::now() >= deadline) {
        transition(
          phase_e::failed,
          "The game did not produce a stable foreground window before timeout",
          "GAME_WINDOW_TIMEOUT"
        );
      }

      std::unique_lock lock(_mutex);
      _wake.wait_for(lock, 250ms, [this, observed_retry]() {
        return _stop_requested || _retry_generation != observed_retry;
      });
    }
  }

  void orchestrator_t::final_discovery_pass() {
    discover_owned_processes();
  }

  std::vector<process_identity_t> orchestrator_t::owned_identities_snapshot() const {
    std::vector<process_identity_t> identities;
    std::scoped_lock lock(_mutex);
    identities.reserve(_owned.size());
    for (const auto &[_, identity] : _owned) {
      identities.push_back(identity);
    }
    return identities;
  }

  bool orchestrator_t::close_owned(std::chrono::seconds graceful_timeout) {
    stop_worker(true);
    final_discovery_pass();
    auto identities = owned_identities_snapshot();
    if (identities.empty()) {
      transition(phase_e::closed, "No owned game processes remained");
      return false;
    }

    const int posted = post_close_to_identities(identities);
    BOOST_LOG(info) << "Game session cleanup: owned=" << identities.size()
                    << " graceful_windows=" << posted;

    if (graceful_timeout.count() > 0 && posted > 0) {
      const auto deadline = std::chrono::steady_clock::now() + graceful_timeout;
      while (std::chrono::steady_clock::now() < deadline) {
        if (std::none_of(identities.begin(), identities.end(), identity_is_alive)) {
          transition(phase_e::closed, "Owned game processes closed gracefully");
          std::scoped_lock lock(_mutex);
          _owned.clear();
          return true;
        }
        std::this_thread::sleep_for(250ms);
      }
    }

    int terminated = 0;
    for (const auto &identity : identities) {
      if (!identity_is_alive(identity)) {
        continue;
      }
      HANDLE handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_TERMINATE, FALSE, identity.pid);
      if (!handle) {
        BOOST_LOG(warning) << "Game session cleanup: cannot open owned pid=" << identity.pid
                           << " winerr=" << GetLastError();
        continue;
      }
      FILETIME creation {}, exit_time {}, kernel {}, user {};
      const bool still_matches = GetProcessTimes(handle, &creation, &exit_time, &kernel, &user) &&
                                 filetime_to_uint64(creation) == identity.creation_time;
      if (still_matches && TerminateProcess(handle, 1)) {
        ++terminated;
        BOOST_LOG(info) << "Game session cleanup: terminated owned pid=" << identity.pid;
      }
      CloseHandle(handle);
    }
    BOOST_LOG(info) << "Game session cleanup: force-terminated " << terminated << " owned process(es)";
    transition(phase_e::closed, "Owned game process cleanup complete");
    std::scoped_lock lock(_mutex);
    _owned.clear();
    return true;
  }

  orchestrator_t &instance() {
    static orchestrator_t singleton;
    return singleton;
  }
}  // namespace game_session

#endif  // _WIN32
