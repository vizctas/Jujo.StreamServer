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
