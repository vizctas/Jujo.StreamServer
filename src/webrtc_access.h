/**
 * @file src/webrtc_access.h
 * @brief Pure policy for who may open a WebRTC session, with which Co-Op role, and who may drive an existing one.
 */
#pragma once

#include <optional>
#include <string>
#include <string_view>

#include "server_rbac.h"

namespace webrtc_access {

  enum class join_error_e {
    none,
    launch_forbidden,  ///< The caller asked to launch an app without the launch permission.
    no_running_app,  ///< Nothing runs and the caller may not start anything.
  };

  struct join_t {
    join_error_e error = join_error_e::none;
    bool is_owner = false;
    std::string coop_role;
  };

  /// Ascending privilege of a Co-Op role a guest may hold; -1 for anything else.
  inline int guest_rank(std::string_view role) {
    if (role == "viewer") return 0;
    if (role == "coop_pad") return 1;
    if (role == "coop_kbm") return 2;
    return -1;
  }

  /// Highest Co-Op role a guest's invite allows; an unknown invite role is viewer.
  inline std::string guest_coop_role(std::string_view invite_role) {
    return guest_rank(invite_role) > 0 ? std::string {invite_role} : std::string {"viewer"};
  }

  /// A guest may lower its invite role, never raise it.
  inline std::string capped_coop_role(std::string_view allowed, std::string_view requested) {
    return guest_rank(requested) >= 0 && guest_rank(requested) <= guest_rank(allowed) ? std::string {requested} : std::string {allowed};
  }

  /**
   * @brief Decide a non-admin caller's session: what it may start and its Co-Op role (a co-owner without kbm joins as pad at most).
   * @param guest_invite_role Active Co-Op invite role of a guest (viewer RBAC role).
   * @param launches_app The request starts an app that is not the running one.
   * @param requested_role Co-Op role asked for in the body (may be empty).
   */
  inline join_t decide_join(
    rbac::Role role,
    const rbac::Perms &perms,
    std::string_view guest_invite_role,
    bool launches_app,
    bool app_running,
    std::string_view requested_role
  ) {
    const bool can_launch = rbac::allows(role, perms, rbac::Perm::launch);
    if (launches_app && !can_launch) {
      return {join_error_e::launch_forbidden, false, {}};
    }
    if (!launches_app && !app_running && !can_launch) {
      return {join_error_e::no_running_app, false, {}};
    }
    if (role == rbac::Role::operator_) {
      if (launches_app) {
        return {join_error_e::none, true, "owner"};
      }
      const bool valid = guest_rank(requested_role) >= 0;
      const auto allowed = rbac::allows(role, perms, rbac::Perm::kbm) ? "coop_kbm" : "coop_pad";
      return {join_error_e::none, false, valid ? capped_coop_role(allowed, requested_role) : std::string {"coop_pad"}};
    }
    return {join_error_e::none, false, capped_coop_role(guest_coop_role(guest_invite_role), requested_role)};
  }

  /// A session may be driven by its creator; privileged callers (session/token/admin) may drive any.
  inline bool may_use_session(const std::optional<std::string> &creator, std::string_view caller_user, bool caller_privileged) {
    return caller_privileged || (creator && !caller_user.empty() && *creator == caller_user);
  }

}  // namespace webrtc_access
