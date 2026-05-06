/**
 * @file server_rbac.h
 * @brief Role-Based Access Control for multi-user server sharing.
 *
 * Maps cloud-paired user_ids to roles (admin/operator/viewer).
 * Persists to rbac_clients.json in the config directory.
 *
 * Role hierarchy: admin > operator > viewer
 * - admin: full server control (config, pair/unpair, manage users)
 * - operator: can launch/quit games, view status
 * - viewer: read-only access (apps list, status, covers)
 *
 * The server owner (who deployed) always has admin via session auth.
 * Shared users authenticate via JWT Bearer and get their stored role.
 */
#pragma once

#include <mutex>
#include <optional>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

namespace rbac {

  /**
   * @brief Access roles in ascending privilege order.
   */
  enum class Role {
    viewer = 0,   ///< Read-only: apps list, status, covers
    operator_ = 1, ///< Can launch/quit games + viewer permissions
    admin = 2,    ///< Full control + operator + viewer permissions
  };

  /**
   * @brief Convert role enum to string.
   */
  inline std::string
  role_to_string(Role role) {
    switch (role) {
      case Role::viewer: return "viewer";
      case Role::operator_: return "operator";
      case Role::admin: return "admin";
      default: return "viewer";
    }
  }

  /**
   * @brief Parse role from string. Defaults to viewer if unknown.
   */
  inline Role
  role_from_string(const std::string &str) {
    if (str == "admin") return Role::admin;
    if (str == "operator") return Role::operator_;
    return Role::viewer;
  }

  /**
   * @brief A registered client entry in the RBAC registry.
   */
  struct ClientEntry {
    std::string user_id;       ///< Supabase user UUID
    Role role;                 ///< Assigned role
    std::string display_name;  ///< Human-readable name (email or username)
    int64_t paired_at;         ///< Unix timestamp when paired
  };

  /**
   * @brief RBAC registry — manages user→role mappings.
   *
   * Thread-safe. Persists to disk on every mutation.
   * Loaded once at startup, updated during cloud_pair and admin actions.
   */
  class Registry {
  public:
    /**
     * @brief Initialize the registry, loading from disk if file exists.
     * @param config_dir Path to the config directory (e.g., sunshine config dir).
     */
    void
    init(const std::string &config_dir);

    /**
     * @brief Register a new client or update an existing one.
     * @param user_id Supabase user UUID.
     * @param role Assigned role.
     * @param display_name Human-readable identifier.
     */
    void
    register_client(const std::string &user_id, Role role, const std::string &display_name = "");

    /**
     * @brief Remove a client from the registry.
     * @param user_id Supabase user UUID.
     * @return true if the client was found and removed.
     */
    bool
    remove_client(const std::string &user_id);

    /**
     * @brief Update a client's role.
     * @param user_id Supabase user UUID.
     * @param new_role The new role to assign.
     * @return true if the client was found and updated.
     */
    bool
    update_role(const std::string &user_id, Role new_role);

    /**
     * @brief Get the role for a user_id.
     * @param user_id Supabase user UUID.
     * @return The role if found, nullopt otherwise.
     */
    std::optional<Role>
    get_role(const std::string &user_id) const;

    /**
     * @brief Check if a user has at least the required role.
     * @param user_id Supabase user UUID.
     * @param required Minimum required role.
     * @return true if user exists AND their role >= required.
     */
    bool
    authorize(const std::string &user_id, Role required) const;

    /**
     * @brief List all registered clients.
     * @return Vector of client entries (copy, thread-safe).
     */
    std::vector<ClientEntry>
    list_clients() const;

    /**
     * @brief Check if a user_id is registered.
     */
    bool
    has_client(const std::string &user_id) const;

    /**
     * @brief Get the number of registered clients.
     */
    size_t
    size() const;

  private:
    void load();
    void save() const;

    std::string file_path_;
    std::vector<ClientEntry> clients_;
    mutable std::mutex mutex_;
  };

  /**
   * @brief Global RBAC registry instance.
   */
  extern Registry registry;

}  // namespace rbac
