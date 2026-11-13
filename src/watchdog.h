/**
 * @file src/watchdog.h
 * @brief Server Watchdog pre-flight resource validation and safe process cleanup.
 */
#pragma once

#include <cstdint>
#include <string>
#include <string_view>
#include <unordered_set>
#include <vector>

#include <nlohmann/json.hpp>

namespace watchdog {
  enum class process_category_e {
    protected_system,
    protected_streaming,
    protected_game,
    safe_browser,
    safe_chat,
    safe_utility,
    heavy_other,
  };

  struct thresholds_t {
    int sensitivity {50};
    double max_cpu_percent {67.5};
    double max_memory_load_percent {83.0};
    std::uint64_t min_avail_ram_bytes {0};
  };

  struct evaluation_t {
    bool enabled {true};
    bool ready {true};
    bool raw_ready {true};
    bool cpu_pressure {false};
    bool ram_pressure {false};
    double cpu_usage_percent {0.0};
    int memory_load_percent {0};
    std::uint64_t total_ram_bytes {0};
    std::uint64_t avail_ram_bytes {0};
    thresholds_t thresholds;
  };

  struct candidate_group_t {
    std::string id;          ///< Normalized lowercase executable filename (e.g. "chrome.exe").
    std::string name;        ///< Human-friendly app display name.
    std::string category;    ///< "browser", "chat", "utility", or "other".
    bool recommended {false};
    int process_count {0};
    std::uint64_t ram_bytes {0};
    double cpu_percent {0.0};
  };

  namespace policy {
    constexpr std::uint64_t kCuratedMinRamBytes = 32ULL * 1024ULL * 1024ULL;
    constexpr std::uint64_t kOtherMinRamBytes = 200ULL * 1024ULL * 1024ULL;
    constexpr double kOtherMinCpuPercent = 4.0;

    std::wstring normalize_lower(std::wstring_view value);
    std::string normalize_ascii_lower(std::string_view value);

    /** Compute Watchdog thresholds from sensitivity (1..100) and total host RAM. */
    thresholds_t compute_thresholds(int sensitivity, std::uint64_t total_ram_bytes);

    /** Evaluate whether host CPU/RAM meet thresholds cleanly. */
    evaluation_t evaluate_thresholds(
      bool enabled,
      int sensitivity,
      double cpu_percent,
      int mem_load_percent,
      std::uint64_t total_ram_bytes,
      std::uint64_t avail_ram_bytes
    );

    /** Classify a running executable as strictly protected or safe/optional cleanup target. */
    process_category_e classify_process(
      std::wstring_view exe_name,
      std::wstring_view full_path,
      std::wstring_view app_dir,
      std::uint32_t pid,
      std::uint32_t self_pid,
      const std::unordered_set<std::uint32_t> &protected_game_pids
    );

    bool is_protected(process_category_e category);
    bool is_recommended_safe(process_category_e category);
    std::string category_key(process_category_e category);
    std::string friendly_app_name(std::string_view exe_id);

    /** Whether an aggregated candidate group should be surfaced to the user. */
    bool should_include_group(
      process_category_e category,
      std::uint64_t ram_bytes,
      double cpu_percent
    );
  }  // namespace policy

  /** Collect live host CPU/RAM metrics, evaluate thresholds, and list safe heavy apps. */
  nlohmann::json evaluate_status();

  /** Safely close only validated non-protected process groups matching `target_ids`. */
  nlohmann::json cleanup_targets(const std::vector<std::string> &target_ids);
}  // namespace watchdog

