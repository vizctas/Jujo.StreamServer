/**
 * @file tests/unit/test_stream_pacing.cpp
 * @brief Test src/stream_pacing.h
 */
#include <gtest/gtest.h>

#include "src/stream_pacing.h"

TEST(StreamPacingTests, AutoPacesAtTwiceSessionBitrate) {
  EXPECT_EQ(stream::pacing_bps(0, 20000), 40'000'000u);
}

TEST(StreamPacingTests, ExplicitValueIsHonoredAboveFloor) {
  EXPECT_EQ(stream::pacing_bps(1'000'000, 20000), 1'000'000'000u);
  EXPECT_EQ(stream::pacing_bps(26000, 20000), 26'000'000u);
}

TEST(StreamPacingTests, ExplicitValueNeverBelowSessionFloor) {
  EXPECT_EQ(stream::pacing_bps(5000, 20000), 22'000'000u);
}

TEST(StreamPacingTests, UnknownSessionBitrateFallsBackToLegacy) {
  EXPECT_EQ(stream::pacing_bps(0, 0), 800'000'000u);
}

TEST(StreamPacingTests, FractionalPacketRateDoesNotThrottleTenMegabitVideo) {
  // 1200 data/FEC packets must take 675.84 ms at 20 Mbps, not 1200 ms.
  EXPECT_EQ(stream::pacing_delay(1200 * 1408, 20'000'000).count(), 675'840'000);
}

TEST(StreamPacingTests, ExplicitFloorIncludesConfiguredParity) {
  EXPECT_EQ(stream::pacing_bps(5000, 20000, 20), 26'400'000u);
  EXPECT_EQ(stream::pacing_bps(0, 20000, 20), 40'000'000u);
}

TEST(StreamPacingTests, PacingCountsPartialPacketsAndEncryptionBytes) {
  EXPECT_EQ(stream::pacing_delay(1440, 20'000'000).count(), 576'000);
  EXPECT_EQ(stream::pacing_delay(1, 24'000'000).count(), 334);
  EXPECT_EQ(stream::pacing_delay(0, 20'000'000).count(), 0);
}

TEST(StreamPacingTests, FrameDebtUsesCumulativeBytesWithoutPerPacketRounding) {
  constexpr auto frame_bytes = 123 * 1440;
  EXPECT_EQ(stream::pacing_delay(frame_bytes, 35'000'000).count(), 40'484'572);
  EXPECT_EQ(stream::pacing_delay(frame_bytes * 2, 35'000'000).count(), 80'969'143);
}
