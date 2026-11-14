#include <gtest/gtest.h>

#include "src/roaming_protocol.h"

namespace {
  std::vector<std::uint8_t> make_rikey() {
    return {
      0x10, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
      0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x01,
    };
  }
}  // namespace

TEST(RoamingProtocolTest, CompletesProbeChallengeConfirmMigratedAndRejectsReplay) {
  roaming::session_state_t state;
  ASSERT_TRUE(state.init_from_rikey(make_rikey()));

  const std::array<std::uint8_t, 8> nonce_c {1, 2, 3, 4, 5, 6, 7, 8};
  const std::array<std::uint8_t, 8> challenge {0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6, 0x07, 0x18};
  const auto t0 = std::chrono::steady_clock::now();

  std::array<std::uint8_t, roaming::kPlaintextBytes> probe_pt {};
  std::copy(nonce_c.begin(), nonce_c.end(), probe_pt.begin());
  probe_pt[8] = 1;

  std::array<std::uint8_t, roaming::kPacketBytes> probe_wire {};
  ASSERT_TRUE(roaming::seal_packet(
    state.roaming_key,
    state.session_tag,
    roaming::packet_type_e::probe,
    roaming::direction_e::client_to_host,
    1u,
    probe_pt,
    probe_wire
  ));
  EXPECT_TRUE(state.matches_tag(probe_wire.data(), probe_wire.size()));

  const auto challenge_res = roaming::handle_c2h_packet(
    state, probe_wire.data(), probe_wire.size(), t0, &challenge
  );
  EXPECT_TRUE(challenge_res.handled);
  EXPECT_FALSE(challenge_res.migrated);
  ASSERT_TRUE(challenge_res.has_reply);

  const auto opened_challenge = roaming::open_packet(
    state.roaming_key,
    state.session_tag,
    roaming::direction_e::host_to_client,
    challenge_res.reply.data(),
    challenge_res.reply.size()
  );
  ASSERT_TRUE(opened_challenge.has_value());
  EXPECT_EQ(opened_challenge->type, roaming::packet_type_e::challenge);
  EXPECT_EQ(std::memcmp(opened_challenge->plaintext.data(), nonce_c.data(), 8), 0);
  EXPECT_EQ(std::memcmp(opened_challenge->plaintext.data() + 8, challenge.data(), 8), 0);

  // Replay of seq=1 PROBE must fail
  EXPECT_FALSE(roaming::handle_c2h_packet(state, probe_wire.data(), probe_wire.size(), t0, &challenge).handled);

  // CONFIRM with seq=2 completes migration
  std::array<std::uint8_t, roaming::kPlaintextBytes> confirm_pt {};
  std::copy(challenge.begin(), challenge.end(), confirm_pt.begin());

  std::array<std::uint8_t, roaming::kPacketBytes> confirm_wire {};
  ASSERT_TRUE(roaming::seal_packet(
    state.roaming_key,
    state.session_tag,
    roaming::packet_type_e::confirm,
    roaming::direction_e::client_to_host,
    2u,
    confirm_pt,
    confirm_wire
  ));

  const auto migrated_res = roaming::handle_c2h_packet(
    state, confirm_wire.data(), confirm_wire.size(), t0 + std::chrono::milliseconds(20)
  );
  EXPECT_TRUE(migrated_res.handled);
  EXPECT_TRUE(migrated_res.migrated);
  ASSERT_TRUE(migrated_res.has_reply);

  const auto opened_migrated = roaming::open_packet(
    state.roaming_key,
    state.session_tag,
    roaming::direction_e::host_to_client,
    migrated_res.reply.data(),
    migrated_res.reply.size()
  );
  ASSERT_TRUE(opened_migrated.has_value());
  EXPECT_EQ(opened_migrated->type, roaming::packet_type_e::migrated);
  EXPECT_EQ(std::memcmp(opened_migrated->plaintext.data(), challenge.data(), 8), 0);

  // Confirming same seq again or expired challenge fails
  EXPECT_FALSE(roaming::handle_c2h_packet(state, confirm_wire.data(), confirm_wire.size(), t0).handled);
}

TEST(RoamingProtocolTest, RejectsTamperedHeaderAadAndExpiredChallenge) {
  roaming::session_state_t state;
  ASSERT_TRUE(state.init_from_rikey(make_rikey()));

  const std::array<std::uint8_t, 8> challenge {9, 8, 7, 6, 5, 4, 3, 2};
  std::array<std::uint8_t, roaming::kPlaintextBytes> probe_pt {};
  probe_pt[0] = 0x42;

  std::array<std::uint8_t, roaming::kPacketBytes> probe_wire {};
  ASSERT_TRUE(roaming::seal_packet(
    state.roaming_key,
    state.session_tag,
    roaming::packet_type_e::probe,
    roaming::direction_e::client_to_host,
    1u,
    probe_pt,
    probe_wire
  ));

  // Flipping reserved byte in AAD fails GCM tag verification
  auto tampered = probe_wire;
  tampered[6] = 0xFF;
  const auto t0 = std::chrono::steady_clock::now();
  EXPECT_FALSE(roaming::handle_c2h_packet(state, tampered.data(), tampered.size(), t0, &challenge).handled);

  ASSERT_TRUE(roaming::handle_c2h_packet(state, probe_wire.data(), probe_wire.size(), t0, &challenge).handled);

  std::array<std::uint8_t, roaming::kPlaintextBytes> confirm_pt {};
  std::copy(challenge.begin(), challenge.end(), confirm_pt.begin());
  std::array<std::uint8_t, roaming::kPacketBytes> confirm_wire {};
  ASSERT_TRUE(roaming::seal_packet(
    state.roaming_key,
    state.session_tag,
    roaming::packet_type_e::confirm,
    roaming::direction_e::client_to_host,
    2u,
    confirm_pt,
    confirm_wire
  ));

  const auto expired_res = roaming::handle_c2h_packet(
    state, confirm_wire.data(), confirm_wire.size(), t0 + roaming::kChallengeTtl + std::chrono::milliseconds(1)
  );
  EXPECT_FALSE(expired_res.handled);
  EXPECT_FALSE(expired_res.migrated);
}
