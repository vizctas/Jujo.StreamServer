/**
 * @file tests/unit/test_vrr_capture_pacing.cpp
 * @brief Test src/vrr_capture_pacing.h
 */
#include <gtest/gtest.h>

#include "src/vrr_capture_pacing.h"

using cadence_t = platf::vrr_capture::picture_cadence_t;
using tp = cadence_t::time_point;
using namespace std::chrono_literals;

TEST(VrrCapturePacingTests, CoalescesSub2MsDwmCompositionsAndPredictsNext120HzFrame) {
  cadence_t cadence;
  const tp t0 {};

  // 120 Hz source (8.333ms) with spurious DWM duplicate captures 1ms later
  for (int i = 0; i < 6; ++i) {
    const auto base = t0 + std::chrono::microseconds(i * 8333);
    cadence.observe(base);
    cadence.observe(base + 900us);  // < 2ms duplicate composition ignored
  }

  ASSERT_TRUE(cadence.median_picture_interval().has_value());
  EXPECT_EQ(*cadence.median_picture_interval(), 8333us);

  const auto last_pic = t0 + std::chrono::microseconds(5 * 8333);
  // 7 ms elapsed since picture -> next frame predicted in 1.333 ms (+ 300 us lead = 1.633 ms)
  const auto wait = cadence.additional_wait_for_fresh_picture(
    last_pic + 7ms,
    last_pic,
    16667us  // 60 fps stream
  );
  EXPECT_EQ(wait, 1633us);
}

TEST(VrrCapturePacingTests, ReturnsZeroWhenSourceMatchesStreamRateOrFrameTooFreshOrTooFar) {
  cadence_t cadence;
  const tp t0 {};
  for (int i = 0; i < 6; ++i) {
    cadence.observe(t0 + std::chrono::milliseconds(i * 8));
  }

  const auto last_pic = t0 + 40ms;
  // Same rate as stream (8ms vs 8.33ms >= 85%): no wait
  EXPECT_EQ(cadence.additional_wait_for_fresh_picture(last_pic + 7ms, last_pic, 8333us).count(), 0);
  // Captured frame < 1ms old: no wait
  EXPECT_EQ(cadence.additional_wait_for_fresh_picture(last_pic + 500us, last_pic, 16667us).count(), 0);
  // Next frame > 2ms away: no wait
  EXPECT_EQ(cadence.additional_wait_for_fresh_picture(last_pic + 2ms, last_pic, 16667us).count(), 0);
}

TEST(VrrCapturePacingTests, ResetsMedianAfterIdleGapOrErraticIntervals) {
  cadence_t cadence;
  const tp t0 {};
  for (int i = 0; i < 5; ++i) {
    cadence.observe(t0 + std::chrono::milliseconds(i * 8));
  }
  EXPECT_TRUE(cadence.median_picture_interval().has_value());

  // > 500 ms idle gap resets history
  cadence.observe(t0 + 600ms);
  EXPECT_FALSE(cadence.median_picture_interval().has_value());
}
