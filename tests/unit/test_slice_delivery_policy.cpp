#include <gtest/gtest.h>

#include "src/slice_delivery_policy.h"

TEST(SliceDeliveryPolicyTest, ThresholdIsThreeQuarterFourK) {
  EXPECT_EQ(slice_delivery::kFourKSliceMinPixels, 6'220'800LL);
  EXPECT_FALSE(slice_delivery::is_4k_slice_eligible(2560, 1440, 0));
  EXPECT_FALSE(slice_delivery::is_4k_slice_eligible(1920, 1080, 1));
  EXPECT_TRUE(slice_delivery::is_4k_slice_eligible(3840, 2160, 0));
  EXPECT_TRUE(slice_delivery::is_4k_slice_eligible(3840, 2160, 1));
  // 2880x2160 == 6,220,800 pixels exact boundary
  EXPECT_TRUE(slice_delivery::is_4k_slice_eligible(2880, 2160, 1));
  EXPECT_FALSE(slice_delivery::is_4k_slice_eligible(2879, 2160, 1));
}

TEST(SliceDeliveryPolicyTest, BlocksAv1AndSingleSliceOnlyEncoders) {
  EXPECT_FALSE(slice_delivery::is_4k_slice_eligible(3840, 2160, 2));
  EXPECT_EQ(slice_delivery::recommended_slices(3840, 2160, 2), 1);
  EXPECT_EQ(slice_delivery::resolve_slices(3840, 2160, 2, 4, true, false, 1), 1);
  EXPECT_EQ(slice_delivery::resolve_slices(3840, 2160, 1, 4, true, true, 1), 1);
}

TEST(SliceDeliveryPolicyTest, ResolvesHardwareAndSoftwarePaths) {
  EXPECT_EQ(slice_delivery::recommended_slices(3840, 2160, 1), 4);
  EXPECT_EQ(slice_delivery::resolve_slices(3840, 2160, 1, 4, true, false, 1), 4);
  EXPECT_EQ(slice_delivery::resolve_slices(3840, 2160, 1, 16, true, false, 1), slice_delivery::kMaxAllowedSlices);
  EXPECT_EQ(slice_delivery::resolve_slices(2560, 1440, 1, 4, true, false, 1), 1);
  // Software encoding preserves min_threads even at lower resolutions
  EXPECT_EQ(slice_delivery::resolve_slices(1920, 1080, 0, 1, false, false, 4), 4);
}
