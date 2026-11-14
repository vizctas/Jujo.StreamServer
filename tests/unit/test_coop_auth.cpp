/**
 * @file tests/unit/test_coop_auth.cpp
 * @brief Standalone unit tests for cloud_pair Co-Op invite & member authorization policy.
 */

#include <gtest/gtest.h>

#include "src/coop_cloud_auth.h"

namespace {
  using namespace confighttp;

  TEST(CoopCloudAuthTest, MapsCoopRolesToCappedNvhttpPermissions) {
    EXPECT_EQ(coop_invite_role_to_perm("coop_kbm"), crypto::PERM::_default);
    EXPECT_EQ(
      coop_invite_role_to_perm("coop_pad"),
      static_cast<crypto::PERM>(
        std::to_underlying(crypto::PERM::_all_actions) | std::to_underlying(crypto::PERM::input_controller)
      )
    );
    EXPECT_EQ(coop_invite_role_to_perm("viewer"), crypto::PERM::_all_actions);
    EXPECT_EQ(coop_invite_role_to_perm("admin"), crypto::PERM::_all_actions);
  }

  TEST(CoopCloudAuthTest, GrantsPermanentMemberPrecedenceWithoutOverridingPerm) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"operator"}])");
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(members, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_TRUE(decision.is_member);
    EXPECT_FALSE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::operator_);
    EXPECT_EQ(decision.perm_override, std::nullopt);
    EXPECT_TRUE(decision.coop_role.empty());
  }

  TEST(CoopCloudAuthTest, AuthorizesCoopGuestAsViewerRbacWithCappedPerm) {
    const nlohmann::json empty = nlohmann::json::array();
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(empty, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_FALSE(decision.is_member);
    EXPECT_TRUE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::viewer);
    EXPECT_EQ(decision.coop_role, "coop_pad");
    EXPECT_EQ(
      decision.perm_override,
      static_cast<crypto::PERM>(
        std::to_underlying(crypto::PERM::_all_actions) | std::to_underlying(crypto::PERM::input_controller)
      )
    );
  }

  TEST(CoopCloudAuthTest, RejectsWhenNeitherMemberNorActiveCoopInviteExists) {
    const auto d1 = resolve_cloud_pair_access(std::nullopt, std::nullopt);
    EXPECT_FALSE(d1.allowed);

    const nlohmann::json empty = nlohmann::json::array();
    const auto d2 = resolve_cloud_pair_access(empty, empty);
    EXPECT_FALSE(d2.allowed);
  }
}  // namespace
