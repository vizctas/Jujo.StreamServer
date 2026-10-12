#include <limits>
#include <gtest/gtest.h>

#include "src/platform/windows/audio_capture_timing.h"

TEST(AudioCaptureTiming, ConvertsHundredNanosecondsToMilliseconds) {
  EXPECT_EQ(platf::audio::capture_wait_ms(100'000), 10u);
  EXPECT_EQ(platf::audio::capture_wait_ms(10'000), 1u);
}

TEST(AudioCaptureTiming, RoundsUpWithoutBusyPolling) {
  EXPECT_EQ(platf::audio::capture_wait_ms(1), 1u);
  EXPECT_EQ(platf::audio::capture_wait_ms(9'999), 1u);
  EXPECT_EQ(platf::audio::capture_wait_ms(10'001), 2u);
  EXPECT_EQ(platf::audio::capture_wait_ms(26'667), 3u);
}

TEST(AudioCaptureTiming, NonpositivePeriodStillWaits) {
  EXPECT_EQ(platf::audio::capture_wait_ms(0), 1u);
  EXPECT_EQ(platf::audio::capture_wait_ms(-1), 1u);
  EXPECT_EQ(platf::audio::capture_wait_ms(std::numeric_limits<std::int64_t>::min()), 1u);
}

TEST(AudioCaptureTiming, NeverWrapsOrBecomesInfinite) {
  constexpr auto max_finite = std::numeric_limits<std::uint32_t>::max() - 1;
  EXPECT_EQ(platf::audio::capture_wait_ms(std::int64_t {max_finite} * 10'000), max_finite);
  EXPECT_EQ(platf::audio::capture_wait_ms(std::int64_t {max_finite} * 10'000 + 1), max_finite);
  EXPECT_EQ(platf::audio::capture_wait_ms(std::numeric_limits<std::int64_t>::max()), max_finite);
}
