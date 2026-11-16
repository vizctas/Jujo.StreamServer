/**
 * @file src/coop_cloud_auth.h
 * @brief Shared Supabase membership and ephemeral Co-Op invite authorization logic
 *        used by confighttp /api/cloud/pair and standalone CTest unit tests.
 */
#pragma once

#include <optional>
#include <string>
#include <string_view>
#include <utility>

#include <nlohmann/json.hpp>

#include "crypto.h"
#include "server_rbac.h"

namespace confighttp {
  struct CloudPairAuthDecision {
    bool allowed = false;
    bool is_member = false;
    bool is_coop_guest = false;
    bool is_controller = false;
    rbac::Role pair_role = rbac::Role::viewer;
    std::optional<crypto::PERM> perm_override;
    std::string coop_invite_id;
    std::string coop_expires_at;
    std::string coop_role;
  };

  /**
   * @brief Map a Supabase Co-Op session invite role to a capped nvhttp pairing permission mask.
   */
  inline crypto::PERM coop_invite_role_to_perm(std::string_view role) {
    using crypto::PERM;
    // Guests never get PERM::launch: joining the running app only needs view.
    auto perm = std::to_underlying(PERM::list) | std::to_underlying(PERM::view);
    if (role == "coop_pad" || role == "coop_kbm") {
      perm |= std::to_underlying(PERM::input_controller);
    }
    if (role == "coop_kbm") {
      perm |= std::to_underlying(PERM::input_mouse) | std::to_underlying(PERM::input_kbd);
    }
    return static_cast<PERM>(perm);
  }

  /// Base permission of a `viewer` member without an active Co-Op grant: browse only.
  inline constexpr crypto::PERM kMemberViewerBasePerm = crypto::PERM::list;

  /**
   * @brief Apply a re-pair of an existing cert: guests are recomputed every time (an older pairing may
   *        still carry launch), a controller re-pair clears a stale guest grant.
   * @return true when the cert changed and state must be saved.
   */
  inline bool apply_repair_grant(
    crypto::named_cert_t &cert,
    std::optional<crypto::PERM> perm_override,
    const std::optional<coop_access::guest_grant_t> &guest
  ) {
    const bool guest_changed = cert.guest.has_value() != guest.has_value() ||
                               (guest && (cert.guest->user_id != guest->user_id || cert.guest->invite_id != guest->invite_id ||
                                          cert.guest->expires_at != guest->expires_at || cert.guest->is_member != guest->is_member));
    // A former guest re-pairing as controller (e.g. promoted to operator) must not keep its narrowed perm.
    const auto target = perm_override ? perm_override : (cert.guest && !guest ? std::optional {crypto::PERM::_default} : std::nullopt);
    const bool perm_changed = target && cert.perm != *target;
    if (target) {
      cert.perm = *target;
    }
    cert.guest = guest;
    return guest_changed || perm_changed;
  }

  /**
   * @brief Whether a /launch request may be served with view permission (joining what runs) instead of launch.
   * @param is_terminate The request names the terminate app (by uuid or id): that always needs launch.
   */
  inline bool launch_is_join_only(bool app_running, bool is_terminate, bool is_input_only, bool targets_current_app) {
    return app_running && !is_terminate && (is_input_only || targets_current_app);
  }

  /// Permission a re-paired device of the same name inherits; guest certs never pass theirs on.
  template<class Devices>
  std::optional<crypto::PERM> inherited_perm_for(const Devices &devices, const std::string &name) {
    if (name.empty()) {
      return std::nullopt;
    }
    for (const auto &d : devices) {
      if (d && !d->guest && d->name == name) {
        return d->perm;
      }
    }
    return std::nullopt;
  }

  /**
   * @brief Map a permanent server_members role to a local server RBAC role.
   */
  inline rbac::Role server_member_role_to_rbac(std::string_view role) {
    if (role == "owner" || role == "admin") {
      return rbac::Role::admin;
    }
    if (role == "operator") {
      return rbac::Role::operator_;
    }
    return rbac::Role::viewer;
  }

  /**
   * @brief Resolve authorization, RBAC role, and nvhttp permissions for a non-owner cloud_pair user.
   */
  inline CloudPairAuthDecision resolve_cloud_pair_access(
    const std::optional<nlohmann::json> &member_data,
    const std::optional<nlohmann::json> &coop_data
  ) {
    CloudPairAuthDecision d;
    if (member_data && member_data->is_array() && !member_data->empty()) {
      d.allowed = true;
      d.is_member = true;
      d.pair_role = server_member_role_to_rbac(member_data->at(0).value("role", std::string {"viewer"}));
      if (d.pair_role != rbac::Role::viewer) {
        // admin/operator members are co-owners: keep their pairing permissions untouched.
        d.is_controller = true;
        return d;
      }
      d.perm_override = kMemberViewerBasePerm;
    }
    if (coop_data && coop_data->is_array() && !coop_data->empty()) {
      const auto &row = coop_data->at(0);
      d.allowed = true;
      d.is_coop_guest = true;
      d.pair_role = rbac::Role::viewer;
      d.coop_role = row.value("role", std::string {"viewer"});
      d.perm_override = coop_invite_role_to_perm(d.coop_role);
      d.coop_invite_id = row.value("id", std::string {});
      d.coop_expires_at = row.value("expires_at", std::string {});
    }
    return d;
  }
}  // namespace confighttp
