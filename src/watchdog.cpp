/**
 * @file src/watchdog.cpp
 * @brief Windows snapshot, process grouping, and safe termination for Server Watchdog.
 */
#include "watchdog.h"

#include "config.h"
#include "logging.h"
#include "system_metrics.h"

#ifdef _WIN32
  #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
  #endif
  #include <winsock2.h>
  #include <Windows.h>
  #include <Psapi.h>
  #include <TlHelp32.h>

  #include <algorithm>
  #include <array>
  #include <chrono>
  #include <filesystem>
  #include <map>
  #include <mutex>
  #include <thread>

  #include "platform/windows/game_session_orchestrator.h"
  #include "platform/windows/misc.h"
#endif

namespace watchdog {
  namespace {
    nlohmann::json build_status_json(
      const evaluation_t &eval,
      const std::vector<candidate_group_t> &candidates
    ) {
      nlohmann::json j;
      j["status"] = true;
      j["supported"] = true;
      j["enabled"] = eval.enabled;
      j["sensitivity"] = eval.thresholds.sensitivity;
      j["ready"] = eval.ready;
      j["rawReady"] = eval.raw_ready;
      j["cpuPressure"] = eval.cpu_pressure;
      j["ramPressure"] = eval.ram_pressure;
      j["cpu"] = {
        {"usagePercent", eval.cpu_usage_percent},
        {"maxPercent", eval.thresholds.max_cpu_percent},
      };
      j["memory"] = {
        {"loadPercent", eval.memory_load_percent},
        {"maxLoadPercent", eval.thresholds.max_memory_load_percent},
        {"totalBytes", eval.total_ram_bytes},
        {"availBytes", eval.avail_ram_bytes},
        {"minAvailBytes", eval.thresholds.min_avail_ram_bytes},
      };
      nlohmann::json arr = nlohmann::json::array();
      for (const auto &c : candidates) {
        arr.push_back({
          {"id", c.id},
          {"name", c.name},
          {"category", c.category},
          {"recommended", c.recommended},
          {"processCount", c.process_count},
          {"ramBytes", c.ram_bytes},
          {"cpuPercent", c.cpu_percent},
        });
      }
      j["candidates"] = std::move(arr);
      return j;
    }

#ifdef _WIN32
    struct live_process_t {
      DWORD pid {0};
      std::uint64_t creation_time {0};
      std::wstring exe_name;
      std::wstring full_path;
      std::string exe_id;
      process_category_e category {process_category_e::protected_system};
      std::uint64_t ram_bytes {0};
      double cpu_percent {0.0};
    };

    struct proc_cpu_sample_t {
      std::uint64_t proc_time_100ns {0};
      std::uint64_t wall_100ns {0};
    };

    std::uint64_t ft_u64(const FILETIME &ft) {
      ULARGE_INTEGER u {};
      u.LowPart = ft.dwLowDateTime;
      u.HighPart = ft.dwHighDateTime;
      return u.QuadPart;
    }

    std::wstring current_app_dir() {
      std::array<wchar_t, 32768> buf {};
      const DWORD len = GetModuleFileNameW(nullptr, buf.data(), static_cast<DWORD>(buf.size()));
      if (len == 0) {
        return {};
      }
      return policy::normalize_lower(std::filesystem::path(buf.data(), buf.data() + len).parent_path().wstring());
    }

    std::unordered_set<std::uint32_t> active_game_pids() {
      std::unordered_set<std::uint32_t> result;
      for (const auto &id : game_session::instance().owned_identities_snapshot()) {
        if (id.pid != 0) {
          result.insert(static_cast<std::uint32_t>(id.pid));
        }
      }
      return result;
    }

    double sample_proc_cpu_delta(
      DWORD pid,
      std::uint64_t creation_time,
      std::uint64_t proc_100ns,
      std::uint64_t wall_100ns,
      DWORD processor_count,
      std::unordered_map<std::uint64_t, proc_cpu_sample_t> &cache
    ) {
      const std::uint64_t key = (static_cast<std::uint64_t>(pid) << 32) ^ (creation_time & 0xFFFFFFFFULL) ^ (creation_time >> 32);
      const auto it = cache.find(key);
      double pct = 0.0;
      if (it != cache.end() && wall_100ns > it->second.wall_100ns && proc_100ns >= it->second.proc_time_100ns) {
        const auto d_proc = proc_100ns - it->second.proc_time_100ns;
        const auto d_wall = wall_100ns - it->second.wall_100ns;
        pct = (static_cast<double>(d_proc) / static_cast<double>(d_wall)) * 100.0 / std::max<DWORD>(1, processor_count);
        pct = std::clamp(pct, 0.0, 100.0);
      }
      cache[key] = {proc_100ns, wall_100ns};
      return pct;
    }

    std::vector<live_process_t> scan_processes() {
      static std::mutex cpu_cache_mtx;
      static std::unordered_map<std::uint64_t, proc_cpu_sample_t> prev_cpu_cache;

      std::vector<live_process_t> out;
      HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
      if (snap == INVALID_HANDLE_VALUE) {
        return out;
      }

      const std::wstring app_dir = current_app_dir();
      const DWORD self_pid = GetCurrentProcessId();
      const auto protected_games = active_game_pids();

      SYSTEM_INFO sys_info {};
      GetSystemInfo(&sys_info);
      const DWORD cpu_count = sys_info.dwNumberOfProcessors > 0 ? sys_info.dwNumberOfProcessors : 1;

      FILETIME now_ft {};
      GetSystemTimeAsFileTime(&now_ft);
      const std::uint64_t now_100ns = ft_u64(now_ft);

      std::unordered_map<std::uint64_t, proc_cpu_sample_t> next_cache;
      std::lock_guard lk(cpu_cache_mtx);

      PROCESSENTRY32W pe {};
      pe.dwSize = sizeof(pe);
      if (Process32FirstW(snap, &pe)) {
        do {
          if (pe.th32ProcessID <= 4 || pe.th32ProcessID == self_pid) {
            continue;
          }
          HANDLE h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pe.th32ProcessID);
          if (!h) {
            continue;
          }

          std::array<wchar_t, 32768> path_buf {};
          DWORD path_len = static_cast<DWORD>(path_buf.size());
          std::wstring full_path;
          if (QueryFullProcessImageNameW(h, 0, path_buf.data(), &path_len) && path_len > 0) {
            full_path.assign(path_buf.data(), path_len);
          }

          const std::wstring exe_w(pe.szExeFile);
          const auto category = policy::classify_process(
            exe_w, full_path, app_dir, pe.th32ProcessID, self_pid, protected_games
          );
          if (policy::is_protected(category)) {
            CloseHandle(h);
            continue;
          }

          std::uint64_t ram_bytes = 0;
          PROCESS_MEMORY_COUNTERS_EX pmc {};
          pmc.cb = sizeof(pmc);
          if (GetProcessMemoryInfo(h, reinterpret_cast<PROCESS_MEMORY_COUNTERS *>(&pmc), sizeof(pmc))) {
            ram_bytes = pmc.WorkingSetSize;
          }

          FILETIME creation {}, exit_t {}, kernel {}, user {};
          double cpu_pct = 0.0;
          std::uint64_t creation_u64 = 0;
          if (GetProcessTimes(h, &creation, &exit_t, &kernel, &user)) {
            creation_u64 = ft_u64(creation);
            const std::uint64_t proc_u64 = ft_u64(kernel) + ft_u64(user);
            cpu_pct = sample_proc_cpu_delta(
              pe.th32ProcessID, creation_u64, proc_u64, now_100ns, cpu_count, prev_cpu_cache
            );
            const std::uint64_t key = (static_cast<std::uint64_t>(pe.th32ProcessID) << 32) ^ (creation_u64 & 0xFFFFFFFFULL) ^ (creation_u64 >> 32);
            next_cache[key] = {proc_u64, now_100ns};
          }
          CloseHandle(h);

          std::string exe_id = policy::normalize_ascii_lower(platf::to_utf8(exe_w));
          out.push_back(live_process_t {
            .pid = pe.th32ProcessID,
            .creation_time = creation_u64,
            .exe_name = exe_w,
            .full_path = std::move(full_path),
            .exe_id = std::move(exe_id),
            .category = category,
            .ram_bytes = ram_bytes,
            .cpu_percent = cpu_pct,
          });
        } while (Process32NextW(snap, &pe));
      }

      CloseHandle(snap);
      prev_cpu_cache = std::move(next_cache);
      return out;
    }

    std::vector<candidate_group_t> aggregate_candidates(const std::vector<live_process_t> &procs) {
      struct accum_t {
        process_category_e category {process_category_e::heavy_other};
        int count {0};
        std::uint64_t ram {0};
        double cpu {0.0};
      };
      std::map<std::string, accum_t> groups;
      for (const auto &p : procs) {
        auto &g = groups[p.exe_id];
        if (g.count == 0) {
          g.category = p.category;
        }
        ++g.count;
        g.ram += p.ram_bytes;
        g.cpu += p.cpu_percent;
      }

      std::vector<candidate_group_t> candidates;
      candidates.reserve(groups.size());
      for (const auto &[exe_id, g] : groups) {
        if (!policy::should_include_group(g.category, g.ram, g.cpu)) {
          continue;
        }
        candidates.push_back(candidate_group_t {
          .id = exe_id,
          .name = policy::friendly_app_name(exe_id),
          .category = policy::category_key(g.category),
          .recommended = policy::is_recommended_safe(g.category),
          .process_count = g.count,
          .ram_bytes = g.ram,
          .cpu_percent = std::clamp(g.cpu, 0.0, 100.0),
        });
      }

      std::sort(candidates.begin(), candidates.end(), [](const candidate_group_t &a, const candidate_group_t &b) {
        if (a.recommended != b.recommended) {
          return a.recommended > b.recommended;
        }
        return a.ram_bytes > b.ram_bytes;
      });
      if (candidates.size() > 20) {
        candidates.resize(20);
      }
      return candidates;
    }

    void post_wm_close_to_pids(const std::unordered_set<DWORD> &pids) {
      EnumWindows([](HWND hwnd, LPARAM param) -> BOOL {
        const auto *target_pids = reinterpret_cast<const std::unordered_set<DWORD> *>(param);
        DWORD pid = 0;
        GetWindowThreadProcessId(hwnd, &pid);
        if (target_pids->contains(pid) && IsWindowVisible(hwnd)) {
          PostMessageW(hwnd, WM_CLOSE, 0, 0);
        }
        return TRUE;
      }, reinterpret_cast<LPARAM>(&pids));
    }

    bool pid_alive_with_creation(DWORD pid, std::uint64_t creation_time) {
      HANDLE h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, pid);
      if (!h) {
        return false;
      }
      DWORD code = 0;
      const bool running = GetExitCodeProcess(h, &code) && code == STILL_ACTIVE;
      FILETIME c {}, e {}, k {}, u {};
      const bool same = running && GetProcessTimes(h, &c, &e, &k, &u) && ft_u64(c) == creation_time;
      CloseHandle(h);
      return same;
    }
#endif
  }  // namespace

  nlohmann::json evaluate_status() {
    const auto metrics = system_metrics::collect_cpu_and_memory(true);
    const auto eval = policy::evaluate_thresholds(
      config::sunshine.watchdog_enabled,
      config::sunshine.watchdog_sensitivity,
      metrics.cpu_usage_percent,
      metrics.memory_load_percent,
      metrics.total_ram_bytes,
      metrics.avail_ram_bytes
    );

#ifdef _WIN32
    const auto procs = scan_processes();
    const auto candidates = aggregate_candidates(procs);
#else
    const std::vector<candidate_group_t> candidates;
#endif
    return build_status_json(eval, candidates);
  }

  nlohmann::json cleanup_targets(const std::vector<std::string> &target_ids) {
#ifndef _WIN32
    auto status = evaluate_status();
    status["closedCount"] = 0;
    status["skippedCount"] = static_cast<int>(target_ids.size());
    return status;
#else
    std::unordered_set<std::string> wanted;
    for (const auto &raw : target_ids) {
      const auto norm = policy::normalize_ascii_lower(raw);
      if (!norm.empty()) {
        wanted.insert(norm);
      }
    }

    const auto procs = scan_processes();
    std::vector<live_process_t> targets;
    std::unordered_set<DWORD> target_pids;
    int skipped = 0;

    for (const auto &p : procs) {
      if (!wanted.contains(p.exe_id)) {
        continue;
      }
      if (policy::is_protected(p.category)) {
        ++skipped;
        continue;
      }
      target_pids.insert(p.pid);
      targets.push_back(p);
    }

    if (!target_pids.empty()) {
      post_wm_close_to_pids(target_pids);
      const auto deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(1200);
      while (std::chrono::steady_clock::now() < deadline) {
        const bool any_alive = std::any_of(targets.begin(), targets.end(), [](const live_process_t &p) {
          return pid_alive_with_creation(p.pid, p.creation_time);
        });
        if (!any_alive) {
          break;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
      }
    }

    int closed = 0;
    std::uint64_t freed_bytes = 0;
    for (const auto &p : targets) {
      if (!pid_alive_with_creation(p.pid, p.creation_time)) {
        ++closed;
        freed_bytes += p.ram_bytes;
        continue;
      }
      HANDLE h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_TERMINATE, FALSE, p.pid);
      if (!h) {
        ++skipped;
        continue;
      }
      FILETIME c {}, e {}, k {}, u {};
      const bool same = GetProcessTimes(h, &c, &e, &k, &u) && ft_u64(c) == p.creation_time;
      if (same && TerminateProcess(h, 1)) {
        ++closed;
        freed_bytes += p.ram_bytes;
      } else {
        ++skipped;
      }
      CloseHandle(h);
    }

    BOOST_LOG(info) << "Server Watchdog cleanup: requested=" << wanted.size()
                    << " closed=" << closed << " skipped=" << skipped
                    << " freed_mib=" << (freed_bytes / (1024ULL * 1024ULL));

    auto status = evaluate_status();
    status["closedCount"] = closed;
    status["skippedCount"] = skipped;
    status["freedBytes"] = freed_bytes;
    return status;
#endif
  }
}  // namespace watchdog

