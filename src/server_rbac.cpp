/**
 * @file server_rbac.cpp
 * @brief Implementation of the RBAC registry for multi-user server sharing.
 */

#include "server_rbac.h"

#include <chrono>
#include <fstream>

#include <boost/log/trivial.hpp>

#include "config.h"

namespace rbac {

  // Global instance
  Registry registry;

  void
  Registry::init(const std::string &config_dir) {
    std::lock_guard<std::mutex> lock(mutex_);
    file_path_ = config_dir + "/rbac_clients.json";
    load();
    BOOST_LOG_TRIVIAL(info) << "RBAC registry initialized with " << clients_.size() << " clients from " << file_path_;
  }

  void
  Registry::register_client(const std::string &user_id, Role role, const std::string &display_name) {
    std::lock_guard<std::mutex> lock(mutex_);

    // Check if already exists — update if so
    for (auto &entry : clients_) {
      if (entry.user_id == user_id) {
        entry.role = role;
        if (!display_name.empty()) {
          entry.display_name = display_name;
        }
        save();
        BOOST_LOG_TRIVIAL(info) << "RBAC: updated client " << user_id << " → " << role_to_string(role);
        return;
      }
    }

    // New client
    // First user ever registered always gets admin, regardless of auto_trust setting.
    if (clients_.empty()) {
      role = Role::admin;
      BOOST_LOG_TRIVIAL(info) << "RBAC: First client ever — auto-promoting " << user_id << " to admin.";
    } else if (config::cloud.auto_trust_cloud_clients) {
      role = Role::admin;
      BOOST_LOG_TRIVIAL(info) << "RBAC: Auto-trust enabled. Upgrading new client " << user_id << " to admin.";
    }

    const auto now = std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()
    ).count();

    clients_.push_back(ClientEntry{
      .user_id = user_id,
      .role = role,
      .display_name = display_name,
      .paired_at = now,
    });

    save();
    BOOST_LOG_TRIVIAL(info) << "RBAC: registered client " << user_id << " as " << role_to_string(role);
  }

  bool
  Registry::remove_client(const std::string &user_id) {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = std::find_if(clients_.begin(), clients_.end(),
      [&](const ClientEntry &e) { return e.user_id == user_id; });

    if (it == clients_.end()) {
      return false;
    }

    clients_.erase(it);
    save();
    BOOST_LOG_TRIVIAL(info) << "RBAC: removed client " << user_id;
    return true;
  }

  bool
  Registry::update_role(const std::string &user_id, Role new_role) {
    std::lock_guard<std::mutex> lock(mutex_);

    for (auto &entry : clients_) {
      if (entry.user_id == user_id) {
        entry.role = new_role;
        save();
        BOOST_LOG_TRIVIAL(info) << "RBAC: updated " << user_id << " → " << role_to_string(new_role);
        return true;
      }
    }

    return false;
  }

  std::optional<Role>
  Registry::get_role(const std::string &user_id) const {
    std::lock_guard<std::mutex> lock(mutex_);

    for (const auto &entry : clients_) {
      if (entry.user_id == user_id) {
        return entry.role;
      }
    }

    return std::nullopt;
  }

  bool
  Registry::authorize(const std::string &user_id, Role required) const {
    auto role = get_role(user_id);
    if (!role.has_value()) {
      return false;
    }
    // Role hierarchy: admin(2) > operator(1) > viewer(0)
    return static_cast<int>(role.value()) >= static_cast<int>(required);
  }

  std::vector<ClientEntry>
  Registry::list_clients() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return clients_;
  }

  bool
  Registry::has_client(const std::string &user_id) const {
    std::lock_guard<std::mutex> lock(mutex_);
    return std::any_of(clients_.begin(), clients_.end(),
      [&](const ClientEntry &e) { return e.user_id == user_id; });
  }

  size_t
  Registry::size() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return clients_.size();
  }

  void
  Registry::load() {
    std::ifstream file(file_path_);
    if (!file.is_open()) {
      // No file yet — start empty
      return;
    }

    try {
      nlohmann::json j;
      file >> j;

      if (!j.is_array()) {
        BOOST_LOG_TRIVIAL(warning) << "RBAC: invalid format in " << file_path_ << " — expected array";
        return;
      }

      clients_.clear();
      for (const auto &item : j) {
        ClientEntry entry;
        entry.user_id = item.value("user_id", "");
        entry.role = role_from_string(item.value("role", "viewer"));
        entry.display_name = item.value("display_name", "");
        entry.paired_at = item.value("paired_at", int64_t(0));

        if (!entry.user_id.empty()) {
          clients_.push_back(std::move(entry));
        }
      }
    } catch (const std::exception &e) {
      BOOST_LOG_TRIVIAL(error) << "RBAC: failed to parse " << file_path_ << ": " << e.what();
    }
  }

  void
  Registry::save() const {
    nlohmann::json j = nlohmann::json::array();

    for (const auto &entry : clients_) {
      j.push_back({
        {"user_id", entry.user_id},
        {"role", role_to_string(entry.role)},
        {"display_name", entry.display_name},
        {"paired_at", entry.paired_at},
      });
    }

    std::ofstream file(file_path_);
    if (!file.is_open()) {
      BOOST_LOG_TRIVIAL(error) << "RBAC: failed to write " << file_path_;
      return;
    }

    file << j.dump(2);
  }

}  // namespace rbac
