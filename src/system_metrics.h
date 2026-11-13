/**
 * @file src/system_metrics.h
 * @brief Lightweight system metrics collector for the /api/system/metrics endpoint.
 *
 * Provides CPU usage, memory, GPU (NVIDIA via NvAPI), network I/O, and thermal data.
 * Designed to be polled every 2-5 seconds by the Flutter dashboard.
 */
#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>

namespace system_metrics {

  struct cpu_memory_snapshot_t {
    double cpu_usage_percent {0.0};
    int memory_load_percent {0};
    std::uint64_t total_ram_bytes {0};
    std::uint64_t avail_ram_bytes {0};
  };

  /**
   * @brief Collect a snapshot of system metrics.
   * @return JSON object with cpu, memory, gpu, network, and process sections.
   *
   * Fields that cannot be read (e.g., GPU temp on AMD) are set to null.
   * This function is thread-safe and designed for frequent polling.
   */
  nlohmann::json collect();

  /**
   * @brief Fast CPU + RAM snapshot without WMI/PDH overhead for Server Watchdog.
   */
  cpu_memory_snapshot_t collect_cpu_and_memory(bool allow_cold_warmup = true);

}  // namespace system_metrics
