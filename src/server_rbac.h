/**
 * @file server_rbac.h
 * @brief Role-Based Access Control for multi-user server sharing.
 *
 * Maps cloud-paired user_ids to roles (admin/operator/viewer).
 * Persists to rbac_clients.json in the config directory.
 *
 * Role hierarchy: admin > operator > viewer
 * - admin: full server control (config, pair/unpair, manage users)
 * - operator: co-owner without admin; may launch/close apps and manage Co-Op guests per its Perms
 * - viewer: guest; reads status and streams what runs
 *
 * The server owner (who deployed) always has admin via session auth.
 * Shared users authenticate via JWT Bearer and get their stored role.
 */
#pragma once

#include <algorithm>
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
    operator_ = 1, ///< Co-owner limited by Perms + viewer permissions
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
   * @brief Fine-grained permissions an operator holds; admins hold all, viewers none.
   */
  enum class Perm {
    launch,  ///< Launch, close and force-kill apps
    guests,  ///< Control Co-Op guest sessions
    wake,    ///< Relay Wake-on-LAN (POST /api/wol)
    kbm,     ///< Keyboard/mouse in a session of another owner (without it: gamepad only)
  };

  struct Perms {
    bool launch = true;
    bool guests = true;
    bool wake = true;
    bool kbm = true;

    bool operator==(const Perms &) const = default;
  };

  /**
   * @brief Whether a role with the given operator permissions may do `perm`.
   */
  inline bool
  allows(Role role, const Perms &perms, Perm perm) {
    if (role == Role::admin) return true;
    if (role != Role::operator_) return false;
    switch (perm) {
      case Perm::launch: return perms.launch;
      case Perm::guests: return perms.guests;
      case Perm::wake: return perms.wake;
      case Perm::kbm: return perms.kbm;
    }
    return false;
  }

  inline const char *
  perm_name(Perm perm) {
    switch (perm) {
      case Perm::launch: return "launch";
      case Perm::guests: return "guests";
      case Perm::wake: return "wake";
      case Perm::kbm: return "kbm";
    }
    return "";
  }

  /**
   * @brief Permission names ("admin", "launch", "guests", "wake", "kbm") reported to clients for a role.
   */
  inline std::vector<std::string>
  permission_names(Role role, const Perms &perms) {
    if (role == Role::admin) return {"admin"};
    std::vector<std::string> names;
    if (allows(role, perms, Perm::launch)) names.emplace_back("launch");
    if (allows(role, perms, Perm::guests)) names.emplace_back("guests");
    if (allows(role, perms, Perm::wake)) names.emplace_back("wake");
    if (allows(role, perms, Perm::kbm)) names.emplace_back("kbm");
    return names;
  }

  /**
   * @brief Role for a newly registered client: first-ever or auto-trusted clients become admin, but never non-promotable guests.
   */
  inline Role
  initial_role(Role requested, bool first_client, bool auto_trust, bool promotable) {
    return promotable && (first_client || auto_trust) ? Role::admin : requested;
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
   * @brief Cloud-derived access beyond the role: operator permissions and, for guests, the Co-Op invite role.
   */
  struct Grant {
    Perms perms;
    std::string coop_role;  ///< Active Co-Op invite role (viewer|coop_pad|coop_kbm); empty for non-guests

    bool operator==(const Grant &) const = default;
  };

  /**
   * @brief Kind of a registered client for the access list: the server's cloud owner, a guest (viewer), or a co-owner.
   */
  inline std::string
  client_kind(const std::string &user_id, const std::string &owner_id, Role role) {
    if (!owner_id.empty() && user_id == owner_id) return "owner";
    return role == Role::viewer ? "guest" : "co_owner";
  }

  /**
   * @brief A registered client entry in the RBAC registry.
   */
  struct ClientEntry {
    std::string user_id;       ///< Supabase user UUID
    Role role;                 ///< Assigned role
    std::string display_name;  ///< Human-readable name (email or username)
    int64_t paired_at;         ///< Unix timestamp when paired
    Grant grant;               ///< Operator permissions / guest Co-Op role
  };

  /**
   * @brief Parse one rbac_clients.json entry; a missing permissions array (older file) means all operator permissions.
   */
  inline ClientEntry
  client_from_json(const nlohmann::json &item) {
    ClientEntry entry;
    entry.user_id = item.value("user_id", "");
    entry.role = role_from_string(item.value("role", "viewer"));
    entry.display_name = item.value("display_name", "");
    entry.paired_at = item.value("paired_at", int64_t(0));
    if (item.contains("permissions") && item["permissions"].is_array()) {
      const auto names = item["permissions"].get<std::vector<std::string>>();
      const auto has = [&](const char *name) { return std::ranges::find(names, name) != names.end(); };
      entry.grant.perms = {has("launch"), has("guests"), has("wake"), has("kbm")};
    }
    entry.grant.coop_role = item.value("coop_role", "");
    return entry;
  }

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
     * @param grant Cloud-derived access; an existing client keeps its own when nullopt.
     */
    void
    register_client(const std::string &user_id, Role role, const std::string &display_name = "", bool promotable = true, std::optional<Grant> grant = std::nullopt);

    /**
     * @brief Remove a client from the registry.
     * @param user_id Supabase user UUID.
     * @return true if the client was found and removed.
     */
    bool
    remove_client(const std::string &user_id);

    /**
     * @brief Replace a client's role and grant (the cloud re-resolved its access).
     * @return true if the client was found.
     */
    bool
    update_access(const std::string &user_id, Role new_role, const Grant &grant);

    /**
     * @brief Get the grant (operator permissions, guest Co-Op role) for a user_id.
     */
    std::optional<Grant>
    get_grant(const std::string &user_id) const;

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
     * @brief Check if a user holds a fine-grained permission (admins hold all).
     */
    bool
    authorize(const std::string &user_id, Perm required) const;

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
