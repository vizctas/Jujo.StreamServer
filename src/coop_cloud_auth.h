/**
 * @file src/coop_cloud_auth.h
 * @brief Shared Supabase membership and ephemeral Co-Op invite authorization logic
 *        used by confighttp /api/cloud/pair and standalone CTest unit tests.
 */
#pragma once

#include <algorithm>
#include <optional>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

#include <nlohmann/json.hpp>

#include "crypto.h"
#include "server_rbac.h"

namespace confighttp {
  struct CloudPairAuthDecision {
    bool allowed = false;
    bool is_member = false;
    bool is_coop_guest = false;
    rbac::Role pair_role = rbac::Role::viewer;
    rbac::Perms perms {false, false, false, false};
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

  /// Native permission with `launch` forced on or off; everything else is kept.
  inline crypto::PERM with_launch(crypto::PERM perm, bool launch) {
    const auto bit = std::to_underlying(crypto::PERM::launch);
    return static_cast<crypto::PERM>(launch ? std::to_underlying(perm) | bit : std::to_underlying(perm) & ~bit);
  }

  /**
   * @brief Apply a co-owner's launch and kbm permissions to its cert.
   * @return true when the cert changed and state must be saved.
   */
  inline bool apply_member_access(crypto::named_cert_t &cert, const coop_access::member_grant_t &member) {
    const auto target = with_launch(cert.perm, member.launch);
    const bool changed = cert.perm != target || cert.member_kbm != member.kbm;
    cert.perm = target;
    cert.member_kbm = member.kbm;
    return changed;
  }

  /// Whether a non-owner session of this cert may hold coop_kbm: needs the kbm input bits and, for a co-owner, the kbm permission.
  inline bool cert_allows_kbm(const crypto::named_cert_t &cert) {
    const auto kbm_bits = std::to_underlying(crypto::PERM::input_kbd) | std::to_underlying(crypto::PERM::input_mouse);
    return (std::to_underlying(cert.perm) & kbm_bits) != 0 && (cert.cloud_user_id.empty() || cert.member_kbm);
  }

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
                                          cert.guest->expires_at != guest->expires_at));
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

  /// Role and operator permissions of one `server_members` row (`role`, `permissions`); nullopt when the role is unknown.
  inline std::optional<std::pair<rbac::Role, rbac::Perms>> member_access(const nlohmann::json &row) {
    const auto text_of = [&](const char *key) {
      return row.contains(key) && row[key].is_string() ? row[key].get<std::string>() : std::string {};
    };
    const auto role = text_of("role");
    if (role != "admin" && role != "operator") {
      return std::nullopt;
    }
    std::optional<std::vector<std::string>> names;
    if (row.contains("permissions") && row["permissions"].is_array()) {
      names.emplace();
      for (const auto &name : row["permissions"]) {
        if (name.is_string()) {
          names->push_back(name.get<std::string>());
        }
      }
    }
    const auto has = [&](std::string_view name) {
      return std::ranges::find(*names, name) != names->end();
    };
    if (role == "admin" || (names && has("admin"))) {
      return std::pair {rbac::Role::admin, rbac::Perms {}};
    }
    return std::pair {rbac::Role::operator_, names ? rbac::Perms {has("launch"), has("guests"), has("wake"), has("kbm")} : rbac::Perms {}};
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
      if (const auto access = member_access(member_data->at(0))) {
        d.allowed = true;
        d.is_member = true;
        d.pair_role = access->first;
        d.perms = access->second;
        return d;
      }
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
