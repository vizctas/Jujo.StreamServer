#pragma once

#include <boost/property_tree/ptree_fwd.hpp>
#include <mutex>
#include <string>
#include <vector>

namespace statefile {

  /**
   * @brief Writes @p tree to @p path via a temp file and a rename.
   *
   * Writing the live file directly means a crash or a full disk mid-write
   * truncates it. For jujoserver_state.json that logs everyone out; for
   * rbac_clients.json it un-authorizes every cloud user at once.
   */
  void write_tree_atomic(const std::string &path, const boost::property_tree::ptree &tree);

  const std::string &sunshine_state_path();

  const std::string &jujoserver_state_path();

  std::mutex &state_mutex();

  bool share_state_file();

  void migrate_recent_state_keys();

  /**
   * @brief Persist the snapshot exclusion device list to jujoserver_state.json.
   * @param devices List of device IDs to exclude from display snapshots.
   *
   * This is called when config is saved/applied so that the display helper
   * can read the exclusion list directly without depending on IPC from Sunshine.
   */
  void save_snapshot_exclude_devices(const std::vector<std::string> &devices);

  /**
   * @brief Load the snapshot exclusion device list from jujoserver_state.json.
   * @return The list of device IDs to exclude, or an empty vector if not found.
   */
  std::vector<std::string> load_snapshot_exclude_devices();

}  // namespace statefile
