/**
 * @file server_rbac.cpp
 * @brief Implementation of the RBAC registry for multi-user server sharing.
 */

#include "server_rbac.h"

#include <algorithm>
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
  Registry::register_client(const std::string &user_id, Role role, const std::string &display_name, bool promotable, std::optional<Grant> grant) {
    std::lock_guard<std::mutex> lock(mutex_);

    // Check if already exists — update if so
    for (auto &entry : clients_) {
      if (entry.user_id == user_id) {
        entry.role = role;
        if (grant) {
          entry.grant = *grant;
        }
        if (!display_name.empty()) {
          entry.display_name = display_name;
        }
        save();
        BOOST_LOG_TRIVIAL(info) << "RBAC: updated client " << user_id << " → " << role_to_string(role);
        return;
      }
    }

    // New client
    // First-ever or auto-trusted clients become admin; guests (promotable=false) never do.
    const auto promoted = initial_role(role, clients_.empty(), config::cloud.auto_trust_cloud_clients, promotable);
    if (promoted != role) {
      BOOST_LOG_TRIVIAL(info) << "RBAC: auto-promoting new client " << user_id << " to admin.";
    }
    role = promoted;

    const auto now = std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()
    ).count();

    clients_.push_back(ClientEntry{
      .user_id = user_id,
      .role = role,
      .display_name = display_name,
      .paired_at = now,
      .grant = grant.value_or(Grant {}),
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
  Registry::update_access(const std::string &user_id, Role new_role, const Grant &grant) {
    std::lock_guard<std::mutex> lock(mutex_);

    for (auto &entry : clients_) {
      if (entry.user_id == user_id) {
        entry.role = new_role;
        entry.grant = grant;
        save();
        BOOST_LOG_TRIVIAL(info) << "RBAC: updated access " << user_id << " → " << role_to_string(new_role);
        return true;
      }
    }

    return false;
  }

  std::optional<Grant>
  Registry::get_grant(const std::string &user_id) const {
    std::lock_guard<std::mutex> lock(mutex_);

    for (const auto &entry : clients_) {
      if (entry.user_id == user_id) {
        return entry.grant;
      }
    }

    return std::nullopt;
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

  bool
  Registry::authorize(const std::string &user_id, Perm required) const {
    std::lock_guard<std::mutex> lock(mutex_);

    for (const auto &entry : clients_) {
      if (entry.user_id == user_id) {
        return allows(entry.role, entry.grant.perms, required);
      }
    }

    return false;
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
        auto entry = client_from_json(item);

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
        {"permissions", permission_names(Role::operator_, entry.grant.perms)},
        {"coop_role", entry.grant.coop_role},
      });
    }

    // Temp file + rename. Truncating this file mid-write leaves every cloud
    // user unauthorized, so each of them gets 403 "User not paired with this
    // server" until an admin repairs it by hand.
    const std::filesystem::path target {file_path_};
    std::filesystem::path tmp = target;
    tmp += ".tmp";

    {
      std::ofstream file(tmp, std::ios::trunc);
      if (!file.is_open()) {
        BOOST_LOG_TRIVIAL(error) << "RBAC: failed to write " << tmp.string();
        return;
      }
      file << j.dump(2);
    }

    std::error_code ec;
    std::filesystem::rename(tmp, target, ec);
    if (ec) {
      BOOST_LOG_TRIVIAL(error) << "RBAC: failed to replace " << file_path_ << ": " << ec.message();
      std::filesystem::remove(tmp, ec);
    }
  }

}  // namespace rbac
