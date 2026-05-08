/**
 * @file src/system_metrics.h
 * @brief Lightweight system metrics collector for the /api/system/metrics endpoint.
 *
 * Provides CPU usage, memory, GPU (NVIDIA via NvAPI), network I/O, and thermal data.
 * Designed to be polled every 2-5 seconds by the Flutter dashboard.
 */
#pragma once

#include <nlohmann/json.hpp>

namespace system_metrics {

  /**
   * @brief Collect a snapshot of system metrics.
   * @return JSON object with cpu, memory, gpu, network, and process sections.
   *
   * Fields that cannot be read (e.g., GPU temp on AMD) are set to null.
   * This function is thread-safe and designed for frequent polling.
   */
  nlohmann::json collect();

}  // namespace system_metrics
