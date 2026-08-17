#include <gtest/gtest.h>

#include "src/abr_network_health.h"

TEST(AbrNetworkHealth, MirrorsMoonlightLossBands) {
  EXPECT_EQ(abr::score_classic_loss({1000, 0, 0}), 100);
  EXPECT_EQ(abr::score_classic_loss({1000, 50, 0}), 100);
  EXPECT_EQ(abr::score_classic_loss({1000, 51, 0}), 75);
  EXPECT_EQ(abr::score_classic_loss({1000, 151, 0}), 50);
  EXPECT_EQ(abr::score_classic_loss({1000, 301, 0}), 30);
}

TEST(AbrNetworkHealth, UnrecoverableFrameForcesDegradedHealth) {
  EXPECT_EQ(abr::score_classic_loss({1000, 1, 1}), 40);
  EXPECT_EQ(abr::score_classic_loss({0, 1, 1}), 40);
}

TEST(AbrNetworkHealth, EmptyWindowIsHealthy) {
  EXPECT_EQ(abr::score_classic_loss({0, 0, 0}), 100);
}
