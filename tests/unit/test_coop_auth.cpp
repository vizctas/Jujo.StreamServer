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

  TEST(CoopCloudAuthTest, OperatorMemberCarriesItsPermissionsWithoutOverride) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"operator","permissions":["guests"]}])");
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(members, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_TRUE(decision.is_member);
    EXPECT_FALSE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::operator_);
    EXPECT_EQ(decision.perms, (rbac::Perms {false, true, false, false}));
    EXPECT_EQ(decision.perm_override, std::nullopt);
  }

  TEST(CoopCloudAuthTest, MemberPermissionsParsing) {
    using rbac::Perms;
    using rbac::Role;
    const auto access = [](const char *row) { return member_access(nlohmann::json::parse(row)); };

    EXPECT_EQ(access(R"({"role":"operator","permissions":["launch","guests"]})"), (std::pair {Role::operator_, Perms {true, true, false, false}}));
    EXPECT_EQ(access(R"({"role":"operator","permissions":["launch"]})"), (std::pair {Role::operator_, Perms {true, false, false, false}}));
    EXPECT_EQ(access(R"({"role":"operator","permissions":["wake","kbm"]})"), (std::pair {Role::operator_, Perms {false, false, true, true}}));
    EXPECT_EQ(access(R"({"role":"operator","permissions":["launch","guests","wake","kbm"]})"), (std::pair {Role::operator_, Perms {}}));
    EXPECT_EQ(access(R"({"role":"operator","permissions":[]})"), (std::pair {Role::operator_, Perms {false, false, false, false}}));
    EXPECT_EQ(access(R"({"role":"operator"})"), (std::pair {Role::operator_, Perms {}}));
    EXPECT_EQ(access(R"({"role":"admin","permissions":["admin"]})")->first, Role::admin);
    EXPECT_EQ(access(R"({"role":"admin"})")->first, Role::admin);
    EXPECT_EQ(access(R"({"role":"operator","permissions":["admin","launch"]})")->first, Role::admin);
  }

  TEST(CoopCloudAuthTest, UnknownMemberRoleGrantsNothing) {
    for (const auto *row : {R"({"role":"viewer"})", R"({"role":"owner"})", R"({"role":"viewer","permissions":["admin"]})", R"({"permissions":["admin"]})", R"({"role":7})"}) {
      EXPECT_EQ(member_access(nlohmann::json::parse(row)), std::nullopt) << row;
      const auto decision = resolve_cloud_pair_access(nlohmann::json::parse(std::string {"["} + row + "]"), nlohmann::json::array());
      EXPECT_FALSE(decision.allowed) << row;
    }
  }

  TEST(CoopCloudAuthTest, ViewerMemberRowStillLetsActiveCoopInviteIn) {
    const nlohmann::json members = nlohmann::json::parse(R"([{"id":"m1","role":"viewer"}])");
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad","expires_at":"2026-11-15T20:00:00Z"}])");

    const auto decision = resolve_cloud_pair_access(members, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_FALSE(decision.is_member);
    EXPECT_TRUE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::viewer);
    EXPECT_EQ(decision.perm_override, coop_invite_role_to_perm("coop_pad"));
    EXPECT_EQ(decision.coop_role, "coop_pad");
    EXPECT_EQ(decision.coop_invite_id, "c1");
    EXPECT_EQ(decision.coop_expires_at, "2026-11-15T20:00:00Z");
  }

  TEST(CoopCloudAuthTest, AuthorizesCoopGuestAsViewerRbacWithCappedPerm) {
    const nlohmann::json empty = nlohmann::json::array();
    const nlohmann::json coop = nlohmann::json::parse(R"([{"id":"c1","role":"coop_pad"}])");

    const auto decision = resolve_cloud_pair_access(empty, coop);
    EXPECT_TRUE(decision.allowed);
    EXPECT_FALSE(decision.is_member);
    EXPECT_TRUE(decision.is_coop_guest);
    EXPECT_EQ(decision.pair_role, rbac::Role::viewer);
    EXPECT_EQ(decision.perms, (rbac::Perms {false, false, false, false}));
    EXPECT_EQ(decision.coop_role, "coop_pad");
    EXPECT_EQ(decision.coop_invite_id, "c1");
    EXPECT_EQ(decision.perm_override, coop_invite_role_to_perm("coop_pad"));
  }

  TEST(CoopCloudAuthTest, LaunchBitIsStrippedAndRestoredKeepingTheRest) {
    const auto all = P::_all;
    const auto stripped = with_launch(all, false);
    EXPECT_EQ(u(stripped) & u(P::launch), 0u);
    EXPECT_EQ(u(stripped), u(P::_all) & ~u(P::launch));
    EXPECT_EQ(with_launch(stripped, true), all);
    EXPECT_EQ(with_launch(P::list, true), static_cast<P>(u(P::list) | u(P::launch)));

    crypto::named_cert_t cert {};
    cert.perm = P::_default;
    EXPECT_TRUE(apply_member_access(cert, {"u", false, true}));
    EXPECT_EQ(u(cert.perm), u(P::_default) & ~u(P::launch));
    EXPECT_FALSE(apply_member_access(cert, {"u", false, true}));
    EXPECT_TRUE(apply_member_access(cert, {"u", true, true}));
    EXPECT_EQ(cert.perm, P::_default);
  }

  TEST(CoopCloudAuthTest, MemberKbmIsAppliedAndNativeCapFollowsIt) {
    crypto::named_cert_t cert {};
    cert.perm = P::_default;
    EXPECT_TRUE(cert_allows_kbm(cert));

    cert.cloud_user_id = "u";
    EXPECT_TRUE(apply_member_access(cert, {"u", true, false}));
    EXPECT_FALSE(cert.member_kbm);
    EXPECT_EQ(cert.perm, P::_default);
    EXPECT_FALSE(cert_allows_kbm(cert));
    EXPECT_FALSE(apply_member_access(cert, {"u", true, false}));
    EXPECT_TRUE(apply_member_access(cert, {"u", true, true}));
    EXPECT_TRUE(cert_allows_kbm(cert));

    cert.perm = coop_invite_role_to_perm("coop_pad");
    EXPECT_FALSE(cert_allows_kbm(cert));
  }

  TEST(RbacPermTest, AuthorizeByPermMatrix) {
    using rbac::Perm;
    using rbac::Perms;
    using rbac::Role;
    const Perms both {true, true, false, false};
    const Perms launch_only {true, false, false, false};
    const Perms guests_only {false, true, false, false};
    const Perms none {false, false, false, false};

    for (const auto &perms : {both, launch_only, guests_only, none}) {
      EXPECT_TRUE(rbac::allows(Role::admin, perms, Perm::launch));
      EXPECT_TRUE(rbac::allows(Role::admin, perms, Perm::guests));
      EXPECT_FALSE(rbac::allows(Role::viewer, perms, Perm::launch));
      EXPECT_FALSE(rbac::allows(Role::viewer, perms, Perm::guests));
    }
    EXPECT_TRUE(rbac::allows(Role::operator_, both, Perm::launch));
    EXPECT_TRUE(rbac::allows(Role::operator_, both, Perm::guests));
    EXPECT_TRUE(rbac::allows(Role::operator_, launch_only, Perm::launch));
    EXPECT_FALSE(rbac::allows(Role::operator_, launch_only, Perm::guests));
    EXPECT_FALSE(rbac::allows(Role::operator_, guests_only, Perm::launch));
    EXPECT_TRUE(rbac::allows(Role::operator_, guests_only, Perm::guests));
    EXPECT_FALSE(rbac::allows(Role::operator_, none, Perm::launch));
    EXPECT_FALSE(rbac::allows(Role::operator_, none, Perm::guests));

    const Perms wake_only {false, false, true, false};
    const Perms kbm_only {false, false, false, true};
    EXPECT_TRUE(rbac::allows(Role::operator_, wake_only, Perm::wake));
    EXPECT_FALSE(rbac::allows(Role::operator_, wake_only, Perm::kbm));
    EXPECT_TRUE(rbac::allows(Role::operator_, kbm_only, Perm::kbm));
    EXPECT_FALSE(rbac::allows(Role::operator_, kbm_only, Perm::wake));
    EXPECT_FALSE(rbac::allows(Role::operator_, none, Perm::wake));
    EXPECT_TRUE(rbac::allows(Role::admin, none, Perm::wake));
    EXPECT_TRUE(rbac::allows(Role::admin, none, Perm::kbm));
    EXPECT_FALSE(rbac::allows(Role::viewer, Perms {}, Perm::wake));
    EXPECT_FALSE(rbac::allows(Role::viewer, Perms {}, Perm::kbm));
  }

  TEST(RbacPermTest, PermissionNamesReportedToClients) {
    using rbac::Role;
    using V = std::vector<std::string>;
    EXPECT_EQ(rbac::permission_names(Role::admin, {}), (V {"admin"}));
    EXPECT_EQ(rbac::permission_names(Role::operator_, {}), (V {"launch", "guests", "wake", "kbm"}));
    EXPECT_EQ(rbac::permission_names(Role::operator_, {true, true, false, false}), (V {"launch", "guests"}));
    EXPECT_EQ(rbac::permission_names(Role::operator_, {false, true, true, false}), (V {"guests", "wake"}));
    EXPECT_EQ(rbac::permission_names(Role::operator_, {false, false, false, true}), (V {"kbm"}));
    EXPECT_EQ(rbac::permission_names(Role::operator_, {false, false, false, false}), V {});
    EXPECT_EQ(rbac::permission_names(Role::viewer, {}), V {});
  }

  TEST(RbacPermTest, OldRbacFileWithoutPermissionsLoadsAllOperatorPermissions) {
    using rbac::Role;
    const auto old_entry = rbac::client_from_json(nlohmann::json::parse(R"({"user_id":"u1","role":"operator","display_name":"A","paired_at":5})"));
    EXPECT_EQ(old_entry.user_id, "u1");
    EXPECT_EQ(old_entry.role, Role::operator_);
    EXPECT_EQ(old_entry.grant.perms, rbac::Perms {});

    const auto saved = rbac::client_from_json(nlohmann::json::parse(R"({"user_id":"u2","role":"operator","permissions":["wake"],"coop_role":"coop_pad"})"));
    EXPECT_EQ(saved.grant.perms, (rbac::Perms {false, false, true, false}));
    EXPECT_EQ(saved.grant.coop_role, "coop_pad");
  }

  TEST(RbacPermTest, ClientKindClassification) {
    using rbac::Role;
    EXPECT_EQ(rbac::client_kind("o", "o", Role::admin), "owner");
    EXPECT_EQ(rbac::client_kind("g", "o", Role::viewer), "guest");
    EXPECT_EQ(rbac::client_kind("c", "o", Role::operator_), "co_owner");
    EXPECT_EQ(rbac::client_kind("c", "o", Role::admin), "co_owner");
    EXPECT_EQ(rbac::client_kind("c", "", Role::admin), "co_owner");
    EXPECT_EQ(rbac::client_kind("", "", Role::admin), "co_owner");
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

  TEST(CoopGuestAccessTest, CloudUnreachableKeepsUnexpired) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200};
    EXPECT_EQ(evaluate(g, 100, std::nullopt), verdict_e::keep);
  }

  TEST(CoopGuestAccessTest, RevokedInviteRevokesGuest) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.invite_active = false}), verdict_e::revoke);
  }

  TEST(CoopGuestAccessTest, LegacyMemberGrantWithoutInviteIsRevoked) {
    const guest_grant_t g {.user_id = "u"};
    EXPECT_EQ(evaluate(g, 100, std::nullopt), verdict_e::revoke);
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.invite_active = true}), verdict_e::revoke);
  }

  TEST(CoopGuestAccessTest, ActiveGrantIsKept) {
    const guest_grant_t g {.user_id = "u", .invite_id = "c1", .expires_at = 200};
    EXPECT_EQ(evaluate(g, 100, cloud_status_t {.invite_active = true}), verdict_e::keep);
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
    cert.perm = P::list;  // was a Co-Op guest, now a co-owner
    cert.guest = coop_access::guest_grant_t {.user_id = "u1", .invite_id = "c1"};

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

  TEST(CoopGuestStatusTest, UnexpiredActiveInvite) {
    const auto invites = nlohmann::json::parse(R"([{"status":"active","expires_at":"2026-11-15T20:00:00+00:00"}])");
    EXPECT_TRUE(status_from_rows(invites, 1794772800 - 1).invite_active);
  }

  TEST(CoopGuestStatusTest, RevokedRequestedOrExpiredInviteIsInactive) {
    const auto revoked = nlohmann::json::parse(R"([{"status":"revoked","expires_at":"2026-11-15T20:00:00+00:00"}])");
    const auto requested = nlohmann::json::parse(R"([{"status":"requested","expires_at":"2026-11-15T20:00:00+00:00"}])");
    const auto expired = nlohmann::json::parse(R"([{"status":"active","expires_at":"2026-11-15T20:00:00+00:00"}])");
    EXPECT_FALSE(status_from_rows(revoked, 0).invite_active);
    EXPECT_FALSE(status_from_rows(requested, 0).invite_active);
    EXPECT_FALSE(status_from_rows(expired, 1794772800).invite_active);
  }

  TEST(CoopGuestStatusTest, MissingRowsMeanInactive) {
    EXPECT_FALSE(status_from_rows(nlohmann::json::array(), 0).invite_active);
  }
}  // namespace

#include "src/webrtc_access.h"

namespace {
  using rbac::Perms;
  using rbac::Role;
  using webrtc_access::decide_join;
  using webrtc_access::join_error_e;

  TEST(WebRtcAccessTest, GuestJoinsOnlyWhatRunsWithItsInviteRole) {
    const auto join = decide_join(Role::viewer, Perms {false, false}, "coop_pad", false, true, "");
    EXPECT_EQ(join.error, join_error_e::none);
    EXPECT_FALSE(join.is_owner);
    EXPECT_EQ(join.coop_role, "coop_pad");
  }

  TEST(WebRtcAccessTest, GuestCannotLaunchOrStartTheDesktop) {
    EXPECT_EQ(decide_join(Role::viewer, Perms {false, false}, "coop_kbm", true, true, "").error, join_error_e::launch_forbidden);
    EXPECT_EQ(decide_join(Role::viewer, Perms {false, false}, "coop_kbm", true, false, "").error, join_error_e::launch_forbidden);
    EXPECT_EQ(decide_join(Role::viewer, Perms {false, false}, "coop_kbm", false, false, "").error, join_error_e::no_running_app);
  }

  TEST(WebRtcAccessTest, GuestRoleNeverExceedsTheInvite) {
    EXPECT_EQ(decide_join(Role::viewer, {}, "viewer", false, true, "coop_kbm").coop_role, "viewer");
    EXPECT_EQ(decide_join(Role::viewer, {}, "coop_pad", false, true, "coop_kbm").coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::viewer, {}, "coop_kbm", false, true, "coop_pad").coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::viewer, {}, "coop_kbm", false, true, "owner").coop_role, "coop_kbm");
    EXPECT_EQ(decide_join(Role::viewer, {}, "admin", false, true, "coop_kbm").coop_role, "viewer");
    EXPECT_EQ(decide_join(Role::viewer, {}, "", false, true, "").coop_role, "viewer");
  }

  TEST(WebRtcAccessTest, CoOwnerWithoutLaunchJoinsAsPadAndNeedsARunningApp) {
    const Perms guests_only {false, true};
    const auto join = decide_join(Role::operator_, guests_only, "", false, true, "");
    EXPECT_EQ(join.error, join_error_e::none);
    EXPECT_FALSE(join.is_owner);
    EXPECT_EQ(join.coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::operator_, guests_only, "", false, false, "").error, join_error_e::no_running_app);
    EXPECT_EQ(decide_join(Role::operator_, guests_only, "", true, true, "").error, join_error_e::launch_forbidden);
    EXPECT_EQ(decide_join(Role::operator_, guests_only, "", false, true, "owner").coop_role, "coop_pad");
  }

  TEST(WebRtcAccessTest, CoOwnerWithLaunchOwnsWhatItLaunches) {
    const Perms launch_only {true, false};
    const auto launched = decide_join(Role::operator_, launch_only, "", true, false, "");
    EXPECT_EQ(launched.error, join_error_e::none);
    EXPECT_TRUE(launched.is_owner);
    EXPECT_EQ(launched.coop_role, "owner");
    const auto joined = decide_join(Role::operator_, launch_only, "", false, true, "");
    EXPECT_FALSE(joined.is_owner);
    EXPECT_EQ(joined.coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::operator_, launch_only, "", false, false, "").error, join_error_e::none);
  }

  TEST(WebRtcAccessTest, CoOwnerWithoutKbmIsCappedToPadButOwnerIsNot) {
    const Perms no_kbm {true, true, true, false};
    const Perms with_kbm {true, true, true, true};
    EXPECT_EQ(decide_join(Role::operator_, no_kbm, "", false, true, "coop_kbm").coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::operator_, no_kbm, "", false, true, "coop_pad").coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::operator_, no_kbm, "", false, true, "viewer").coop_role, "viewer");
    EXPECT_EQ(decide_join(Role::operator_, no_kbm, "", false, true, "").coop_role, "coop_pad");
    EXPECT_EQ(decide_join(Role::operator_, with_kbm, "", false, true, "coop_kbm").coop_role, "coop_kbm");
    EXPECT_EQ(decide_join(Role::operator_, with_kbm, "", false, true, "").coop_role, "coop_pad");
    const auto launched = decide_join(Role::operator_, no_kbm, "", true, false, "coop_kbm");
    EXPECT_TRUE(launched.is_owner);
    EXPECT_EQ(launched.coop_role, "owner");
  }

  TEST(WebRtcAccessTest, SessionIsBoundToItsCreator) {
    using webrtc_access::may_use_session;
    EXPECT_TRUE(may_use_session("user-a", "user-a", false));
    EXPECT_FALSE(may_use_session("user-a", "user-b", false));
    EXPECT_FALSE(may_use_session("user-a", "", false));
    EXPECT_FALSE(may_use_session(std::nullopt, "user-b", false));
    EXPECT_FALSE(may_use_session(std::nullopt, "", false));
    EXPECT_TRUE(may_use_session("user-a", "user-b", true));
    EXPECT_TRUE(may_use_session(std::nullopt, "", true));
  }
}  // namespace
