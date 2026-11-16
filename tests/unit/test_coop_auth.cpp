/**
 * @file tests/unit/test_coop_auth.cpp
 * @brief Standalone unit tests for cloud_pair Co-Op invite & member authorization policy.
 */

#include <gtest/gtest.h>

#include "src/coop_cloud_auth.h"

namespace {
  using namespace confighttp;
  using P = crypto::PERM;

  constexpr auto u(P p) {
    return std::to_underlying(p);
  }

  TEST(CoopCloudAuthTest, GuestRolesNeverIncludeLaunch) {
    EXPECT_EQ(u(coop_invite_role_to_perm("viewer")), u(P::list) | u(P::view));
    EXPECT_EQ(u(coop_invite_role_to_perm("coop_pad")), u(P::list) | u(P::view) | u(P::input_controller));
    EXPECT_EQ(
      u(coop_invite_role_to_perm("coop_kbm")),
      u(P::list) | u(P::view) | u(P::input_controller) | u(P::input_mouse) | u(P::input_kbd)
    );
    EXPECT_EQ(u(coop_invite_role_to_perm("admin")), u(P::list) | u(P::view));
    for (auto r : {"viewer", "coop_pad", "coop_kbm", "admin"}) {
      EXPECT_EQ(u(coop_invite_role_to_perm(r)) & u(P::launch), 0u) << r;
    }
  }

  TEST(CoopCloudAuthTest, AdminOrOperatorMemberIsControllerWithoutOverride) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"operator"}])");
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(members, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_TRUE(decision.is_member);
    EXPECT_TRUE(decision.is_controller);
    EXPECT_FALSE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::operator_);
    EXPECT_EQ(decision.perm_override, std::nullopt);
  }

  TEST(CoopCloudAuthTest, ViewerMemberWithActiveCoopGetsCoopPermAndGrant) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"viewer"}])");
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad","expires_at":"2026-11-15T20:00:00Z"}])");

    const auto decision = resolve_cloud_pair_access(members, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_TRUE(decision.is_member);
    EXPECT_TRUE(decision.is_coop_guest);
    EXPECT_FALSE(decision.is_controller);
    EXPECT_EQ(decision.pair_role, rbac::Role::viewer);
    EXPECT_EQ(decision.perm_override, coop_invite_role_to_perm("coop_pad"));
    EXPECT_EQ(decision.coop_role, "coop_pad");
    EXPECT_EQ(decision.coop_invite_id, "c1");
    EXPECT_EQ(decision.coop_expires_at, "2026-11-15T20:00:00Z");
  }

  TEST(CoopCloudAuthTest, ViewerMemberWithoutCoopGetsListOnly) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"viewer"}])");

    const auto decision = resolve_cloud_pair_access(members, nlohmann::json::array());
    EXPECT_TRUE(decision.allowed);
    EXPECT_TRUE(decision.is_member);
    EXPECT_FALSE(decision.is_controller);
    EXPECT_FALSE(decision.is_coop_guest);
    EXPECT_EQ(decision.perm_override, P::list);
  }

  TEST(CoopCloudAuthTest, AuthorizesCoopGuestAsViewerRbacWithCappedPerm) {
    const nlohmann::json empty = nlohmann::json::array();
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(empty, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_FALSE(decision.is_member);
    EXPECT_TRUE(decision.is_coop_guest);
    EXPECT_FALSE(decision.is_controller);
    EXPECT_EQ(decision.pair_role, rbac::Role::viewer);
    EXPECT_EQ(decision.coop_role, "coop_pad");
    EXPECT_EQ(decision.coop_invite_id, "c1");
    EXPECT_EQ(decision.perm_override, coop_invite_role_to_perm("coop_pad"));
  }

  TEST(CoopCloudAuthTest, RejectsWhenNeitherMemberNorActiveCoopInviteExists) {
    const auto d1 = resolve_cloud_pair_access(std::nullopt, std::nullopt);
    EXPECT_FALSE(d1.allowed);

    const nlohmann::json empty = nlohmann::json::array();
    const auto d2 = resolve_cloud_pair_access(empty, empty);
    EXPECT_FALSE(d2.allowed);
  }

  TEST(CoopCloudAuthTest, InitialRoleNeverPromotesGuests) {
    using rbac::Role;
    EXPECT_EQ(rbac::initial_role(Role::viewer, true, true, false), Role::viewer);
    EXPECT_EQ(rbac::initial_role(Role::viewer, true, false, true), Role::admin);
    EXPECT_EQ(rbac::initial_role(Role::viewer, false, true, true), Role::admin);
    EXPECT_EQ(rbac::initial_role(Role::viewer, false, false, true), Role::viewer);
  }
}  // namespace

#include "src/coop_guest_access.h"

namespace {
  using coop_access::cloud_status_t;
  using coop_access::evaluate;
  using coop_access::guest_grant_t;
  using coop_access::verdict_e;

  TEST(CoopGuestAccessTest, ExpiredInviteRevokesEvenOffline) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 100};
    EXPECT_EQ(evaluate(g, 100, std::nullopt), verdict_e::revoke);
  }

  TEST(CoopGuestAccessTest, ExpiredInviteDowngradesMember) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 100, .is_member = true};
    EXPECT_EQ(evaluate(g, 100, std::nullopt), verdict_e::downgrade_to_member);
  }

  TEST(CoopGuestAccessTest, CloudUnreachableKeepsUnexpired) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200};
    EXPECT_EQ(evaluate(g, 100, std::nullopt), verdict_e::keep);
  }

  TEST(CoopGuestAccessTest, RevokedInviteRevokesGuest) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.member_active = false, .invite_active = false}), verdict_e::revoke);
  }

  TEST(CoopGuestAccessTest, RevokedInviteDowngradesActiveMember) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200, .is_member = true};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.member_active = true, .invite_active = false}), verdict_e::downgrade_to_member);
  }

  TEST(CoopGuestAccessTest, RemovedMemberIsRevoked) {
    const guest_grant_t g {.user_id = "u", .is_member = true};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.member_active = false}), verdict_e::revoke);
  }

  TEST(CoopGuestAccessTest, ActiveGrantIsKept) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200, .is_member = true};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.member_active = true, .invite_active = true}), verdict_e::keep);
  }

  TEST(CoopGuestAccessTest, ParsesSupabaseTimestamps) {
    EXPECT_EQ(coop_access::parse_iso8601_utc("2026-11-15T20:00:00+00:00"), 1794772800);
    EXPECT_EQ(coop_access::parse_iso8601_utc("2026-11-15T20:00:00.123456Z"), 1794772800);
    EXPECT_EQ(coop_access::parse_iso8601_utc("2026-11-15 20:00:00+00"), 1794772800);
    EXPECT_EQ(coop_access::parse_iso8601_utc("garbage"), 0);
    EXPECT_EQ(coop_access::parse_iso8601_utc(""), 0);
  }
}  // namespace

namespace {
  using confighttp::apply_repair_grant;

  TEST(CoopRepairGrantTest, GuestRepairOverwritesLegacyLaunchPerm) {
    crypto::named_cert_t cert {};
    cert.perm = P::_default;  // paired before the guest policy existed
    const coop_access::guest_grant_t g {.user_id = "u1", .invite_id = "c1", .expires_at = 500};

    EXPECT_TRUE(apply_repair_grant(cert, confighttp::coop_invite_role_to_perm("viewer"), g));
    EXPECT_EQ(cert.perm, confighttp::coop_invite_role_to_perm("viewer"));
    ASSERT_TRUE(cert.guest.has_value());
    EXPECT_EQ(cert.guest->user_id, "u1");
    EXPECT_EQ(cert.guest->expires_at, 500);
  }

  TEST(CoopRepairGrantTest, PromotedGuestRegainsDefaultControllerPerm) {
    crypto::named_cert_t cert {};
    cert.perm = P::list;  // was a viewer member, now promoted to operator
    cert.guest = coop_access::guest_grant_t {.user_id = "u1", .is_member = true};

    EXPECT_TRUE(apply_repair_grant(cert, std::nullopt, std::nullopt));
    EXPECT_FALSE(cert.guest.has_value());
    EXPECT_EQ(cert.perm, P::_default);
  }

  TEST(CoopRepairGrantTest, ControllerRepairKeepsControllerPerm) {
    crypto::named_cert_t cert {};
    cert.perm = P::_all;

    EXPECT_FALSE(apply_repair_grant(cert, std::nullopt, std::nullopt));
    EXPECT_EQ(cert.perm, P::_all);
  }

  TEST(CoopLaunchPolicyTest, TerminateIsNeverJoinOnly) {
    // app running, request names the terminate app by uuid or id
    EXPECT_FALSE(confighttp::launch_is_join_only(true, true, false, true));
    EXPECT_FALSE(confighttp::launch_is_join_only(true, true, true, false));
  }

  TEST(CoopLaunchPolicyTest, JoiningRunningAppIsJoinOnly) {
    EXPECT_TRUE(confighttp::launch_is_join_only(true, false, false, true));
    EXPECT_TRUE(confighttp::launch_is_join_only(true, false, true, false));
    EXPECT_FALSE(confighttp::launch_is_join_only(false, false, false, true));
    EXPECT_FALSE(confighttp::launch_is_join_only(true, false, false, false));
  }

  TEST(CoopInheritedPermTest, SkipsGuestCertsWithSameName) {
    auto guest = std::make_shared<crypto::named_cert_t>();
    guest->name = "Living Room TV";
    guest->perm = P::list;
    guest->guest = coop_access::guest_grant_t {.user_id = "g"};
    auto owner = std::make_shared<crypto::named_cert_t>();
    owner->name = "Living Room TV";
    owner->perm = P::_all;

    const std::vector<std::shared_ptr<crypto::named_cert_t>> only_guest {guest};
    EXPECT_EQ(confighttp::inherited_perm_for(only_guest, "Living Room TV"), std::nullopt);
    const std::vector<std::shared_ptr<crypto::named_cert_t>> both {guest, owner};
    EXPECT_EQ(confighttp::inherited_perm_for(both, "Living Room TV"), P::_all);
    EXPECT_EQ(confighttp::inherited_perm_for(both, ""), std::nullopt);
  }

  TEST(CoopRepairGrantTest, UnchangedRepairReportsNoChange) {
    crypto::named_cert_t cert {};
    const coop_access::guest_grant_t g {.user_id = "u1", .invite_id = "c1", .expires_at = 500};
    cert.perm = P::list;
    cert.guest = g;

    EXPECT_FALSE(apply_repair_grant(cert, P::list, g));
  }
}  // namespace

namespace {
  using coop_access::status_from_rows;

  TEST(CoopGuestStatusTest, ActiveMemberAndUnexpiredActiveInvite) {
    const auto members = nlohmann::json::parse(R"([{"status":"active"}])");
    const auto invites = nlohmann::json::parse(R"([{"status":"active","expires_at":"2026-11-15T20:00:00+00:00"}])");
    const auto s = status_from_rows(members, invites, 1794772800 - 1);
    EXPECT_TRUE(s.member_active);
    EXPECT_TRUE(s.invite_active);
  }

  TEST(CoopGuestStatusTest, RevokedOrExpiredInviteIsInactive) {
    const auto members = nlohmann::json::array();
    const auto revoked = nlohmann::json::parse(R"([{"status":"revoked","expires_at":"2026-11-15T20:00:00+00:00"}])");
    const auto expired = nlohmann::json::parse(R"([{"status":"active","expires_at":"2026-11-15T20:00:00+00:00"}])");
    EXPECT_FALSE(status_from_rows(members, revoked, 0).invite_active);
    EXPECT_FALSE(status_from_rows(members, expired, 1794772800).invite_active);
    EXPECT_FALSE(status_from_rows(members, expired, 0).member_active);
  }

  TEST(CoopGuestStatusTest, MissingRowsMeanInactive) {
    const auto s = status_from_rows(nlohmann::json::array(), nlohmann::json::array(), 0);
    EXPECT_FALSE(s.member_active);
    EXPECT_FALSE(s.invite_active);
  }
}  // namespace
