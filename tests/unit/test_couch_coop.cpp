/**
 * @file tests/unit/test_couch_coop.cpp
 * @brief Unit tests for CouchCoopCoordinator slot determinism, reconnect grace,
 *        capability isolation, KBM 2s owner-first handoff, and feedback routing.
 */

#include <gtest/gtest.h>

#include "src/couch_coop.h"
#include "src/couch_coop_packet.h"

#include <cstring>

namespace {
  using namespace couch_coop;

  TEST(CouchCoopCoordinatorTest, ReservesSlot0ForOwnerAndReclaimsGuestSlotDuringGrace) {
    Coordinator coop(2000, 45000);

    // Even if guest connects before owner, slot 0 stays reserved for Player 1 (Owner).
    const auto guest1 = coop.register_session("w1", "friend-uuid", "Amiga MX", false, role_e::coop_pad, transport_e::webrtc, 1000);
    EXPECT_EQ(guest1.role, role_e::coop_pad);
    EXPECT_EQ(guest1.assigned_slot, 1);

    const auto owner = coop.register_session("r0", "owner-uuid", "Jozh", true, role_e::owner, transport_e::rtsp, 1100);
    EXPECT_EQ(owner.role, role_e::owner);
    EXPECT_EQ(owner.assigned_slot, 0);

    // Second guest gets slot 2.
    const auto guest2 = coop.register_session("w2", "other-uuid", "P3", false, role_e::coop_pad, transport_e::webrtc, 1200);
    EXPECT_EQ(guest2.assigned_slot, 2);

    // Friend briefly drops Wi-Fi and reconnects within 45s grace -> keeps Player 2 (slot 1)!
    coop.disconnect_session("w1", 5000);
    const auto guest1_rejoined = coop.register_session("w1-new", "friend-uuid", "Amiga MX", false, role_e::coop_pad, transport_e::webrtc, 15000);
    EXPECT_EQ(guest1_rejoined.assigned_slot, 1);
    EXPECT_EQ(coop.remap_gamepad_slot("w1-new", 0, 15010), 1);

    // After grace expires, disconnected session slot is freed cleanly.
    coop.disconnect_session("w2", 16000);
    const auto guest3 = coop.register_session("w3", "late-uuid", "P4", false, role_e::coop_pad, transport_e::webrtc, 70000);
    EXPECT_EQ(guest3.assigned_slot, 2);
  }

  TEST(CouchCoopCoordinatorTest, EnforcesCapabilitiesAndOwnerFirst2sKbmHandoff) {
    Coordinator coop(2000, 45000);

    coop.register_session("owner", "u-owner", "Host", true, role_e::owner, transport_e::rtsp, 1000);
    // Attempting to request owner role as guest must clamp cleanly (no escalation).
    const auto escalated = coop.register_session("guest", "u-guest", "Guest", false, role_e::owner, transport_e::webrtc, 1000);
    EXPECT_EQ(escalated.role, role_e::coop_pad);

    coop.register_session("spec", "u-spec", "Viewer", false, role_e::viewer, transport_e::webrtc, 1000);
    EXPECT_FALSE(coop.assert_session_allows("spec", capability_e::gamepad, 5000));
    EXPECT_FALSE(coop.assert_session_allows("spec", capability_e::kbm, 5000));
    EXPECT_FALSE(coop.assert_session_allows("spec", capability_e::text_clipboard, 5000));
    EXPECT_FALSE(coop.assert_session_allows("spec", capability_e::admin, 5000));

    // Promote friend to coop_kbm: gamepad always allowed, text/admin always denied, KBM respects 2s owner priority.
    ASSERT_TRUE(coop.set_session_role("guest", role_e::coop_kbm, 1100));
    coop.notify_owner_kbm_activity(2000);
    EXPECT_TRUE(coop.assert_session_allows("guest", capability_e::gamepad, 2500));
    EXPECT_FALSE(coop.assert_session_allows("guest", capability_e::kbm, 3500));
    EXPECT_TRUE(coop.assert_session_allows("guest", capability_e::kbm, 4000));
    EXPECT_FALSE(coop.assert_session_allows("guest", capability_e::text_clipboard, 5000));
    EXPECT_FALSE(coop.assert_session_allows("guest", capability_e::admin, 5000));

    // Pausing friend mutes her inputs without kicking her slot.
    ASSERT_TRUE(coop.set_session_paused("guest", true));
    EXPECT_FALSE(coop.assert_session_allows("guest", capability_e::gamepad, 5100));
    EXPECT_FALSE(coop.assert_session_allows("guest", capability_e::kbm, 5100));
    ASSERT_TRUE(coop.set_session_paused("guest", false));
    EXPECT_TRUE(coop.assert_session_allows("guest", capability_e::gamepad, 5200));
  }

  TEST(CouchCoopCoordinatorTest, RoutesGamepadFeedbackOnlyToOwningSession) {
    Coordinator coop(2000, 45000);
    coop.register_session("owner-1", "u0", "Host", true, role_e::owner, transport_e::rtsp, 100);
    const auto p2 = coop.register_session("peer-2", "u1", "Amiga", false, role_e::coop_pad, transport_e::webrtc, 100);
    ASSERT_EQ(p2.assigned_slot, 1);

    EXPECT_EQ(coop.owner_session_for_slot(0, 200), "owner-1");
    EXPECT_EQ(coop.owner_session_for_slot(1, 200), "peer-2");
    EXPECT_EQ(coop.owner_session_for_slot(2, 200), std::nullopt);
  }

  std::vector<std::uint8_t> make_header_only_packet(std::uint32_t magic, std::size_t total_size) {
    std::vector<std::uint8_t> bytes(total_size, 0);
    bytes[4] = static_cast<std::uint8_t>(magic & 0xFFu);
    bytes[5] = static_cast<std::uint8_t>((magic >> 8) & 0xFFu);
    bytes[6] = static_cast<std::uint8_t>((magic >> 16) & 0xFFu);
    bytes[7] = static_cast<std::uint8_t>((magic >> 24) & 0xFFu);
    return bytes;
  }

  TEST(CouchCoopCoordinatorTest, FiltersAndRemapsMoonlightInputPackets) {
    Coordinator coop(2000, 45000);
    coop.register_session("owner-r", "u0", "Host", true, role_e::owner, transport_e::rtsp, 100);
    const auto guest = coop.register_session("guest-w", "u1", "Amiga", false, role_e::coop_kbm, transport_e::webrtc, 100);
    ASSERT_EQ(guest.assigned_slot, 1);

    // Guest multi-controller pad 0 with mask 0x0001 must remap cleanly to slot 1 and mask 0x0002.
    NV_MULTI_CONTROLLER_PACKET mc {};
    mc.header.magic = MULTI_CONTROLLER_MAGIC_GEN5;
    mc.controllerNumber = 0;
    mc.activeGamepadMask = 0x0001;
    std::vector<std::uint8_t> mc_bytes(sizeof(mc));
    std::memcpy(mc_bytes.data(), &mc, sizeof(mc));

    const auto pad_decision = filter_and_remap_moonlight_packet(coop, "guest-w", mc_bytes, 200);
    ASSERT_TRUE(pad_decision.allowed);
    EXPECT_EQ(pad_decision.remapped_slot, 1);
    std::memcpy(&mc, mc_bytes.data(), sizeof(mc));
    EXPECT_EQ(mc.controllerNumber, 1);
    EXPECT_EQ(mc.activeGamepadMask, 0x0002);

    // Arrival/motion byte at sizeof(NV_INPUT_HEADER) must also remap 0 -> 1.
    auto motion = make_header_only_packet(SS_CONTROLLER_MOTION_MAGIC, sizeof(SS_CONTROLLER_MOTION_PACKET));
    motion[sizeof(NV_INPUT_HEADER)] = 0;
    const auto motion_decision = filter_and_remap_moonlight_packet(coop, "guest-w", motion, 205);
    ASSERT_TRUE(motion_decision.allowed);
    EXPECT_EQ(motion[sizeof(NV_INPUT_HEADER)], 1);

    // Text/clipboard is always blocked for guests even with coop_kbm role.
    auto text_pkt = make_header_only_packet(UTF8_TEXT_EVENT_MAGIC, sizeof(NV_UNICODE_PACKET));
    EXPECT_FALSE(filter_and_remap_moonlight_packet(coop, "guest-w", text_pkt, 5000).allowed);

    // Owner keyboard packet triggers 2s lockout for guest KBM, then guest can resume at +2000ms.
    auto key_pkt = make_header_only_packet(KEY_DOWN_EVENT_MAGIC, sizeof(NV_KEYBOARD_PACKET));
    EXPECT_TRUE(filter_and_remap_moonlight_packet(coop, "owner-r", key_pkt, 3000).allowed);
    EXPECT_FALSE(filter_and_remap_moonlight_packet(coop, "guest-w", key_pkt, 4500).allowed);
    EXPECT_TRUE(filter_and_remap_moonlight_packet(coop, "guest-w", key_pkt, 5000).allowed);
  }
}  // namespace
