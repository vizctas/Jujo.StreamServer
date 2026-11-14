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
    rbac::Role pair_role = rbac::Role::viewer;
    std::optional<crypto::PERM> perm_override;
    std::string coop_role;
  };

  /**
   * @brief Map a Supabase Co-Op session invite role to a capped nvhttp pairing permission mask.
   */
  inline crypto::PERM coop_invite_role_to_perm(std::string_view role) {
    if (role == "coop_kbm") {
      return crypto::PERM::_default;
    }
    if (role == "coop_pad") {
      return static_cast<crypto::PERM>(
        std::to_underlying(crypto::PERM::_all_actions) | std::to_underlying(crypto::PERM::input_controller)
      );
    }
    return crypto::PERM::_all_actions;
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
    if (member_data && member_data->is_array() && !member_data->empty()) {
      const auto role_str = member_data->at(0).value("role", std::string {"viewer"});
      CloudPairAuthDecision d;
      d.allowed = true;
      d.is_member = true;
      d.pair_role = server_member_role_to_rbac(role_str);
      return d;
    }
    if (coop_data && coop_data->is_array() && !coop_data->empty()) {
      const auto role_str = coop_data->at(0).value("role", std::string {"viewer"});
      CloudPairAuthDecision d;
      d.allowed = true;
      d.is_coop_guest = true;
      d.pair_role = rbac::Role::viewer;
      d.perm_override = coop_invite_role_to_perm(role_str);
      d.coop_role = role_str;
      return d;
    }
    return {};
  }
}  // namespace confighttp
