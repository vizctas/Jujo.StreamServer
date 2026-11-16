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

TEST(AbrNetworkHealth, RttRiseOverBaselineDegradesHealth) {
  // 4G baseline ~40 ms; only the queueing rise above it counts.
  EXPECT_EQ(abr::score_rtt_rise(40, 40), 100);
  EXPECT_EQ(abr::score_rtt_rise(99, 40), 100);
  EXPECT_EQ(abr::score_rtt_rise(100, 40), 75);   // blocks upshift
  EXPECT_EQ(abr::score_rtt_rise(160, 40), 50);   // below 60 -> downshift
  EXPECT_EQ(abr::score_rtt_rise(1039, 40), 30);
  EXPECT_EQ(abr::score_rtt_rise(1040, 40), abr::kEmergencyHealth);  // seconds of queue: 4G bufferbloat seen in the field
  EXPECT_EQ(abr::score_rtt_rise(1898, 40), abr::kEmergencyHealth);
}

TEST(AbrNetworkHealth, UnknownRttIsHealthy) {
  EXPECT_EQ(abr::score_rtt_rise(0, 40), 100);
  EXPECT_EQ(abr::score_rtt_rise(500, 0), 100);
  EXPECT_EQ(abr::score_rtt_rise(30, 40), 100);
}

TEST(AbrNetworkHealth, AbrRunsWhenConfiguredOrForWanSessions) {
  EXPECT_FALSE(abr::abr_active(false, 0));
  EXPECT_TRUE(abr::abr_active(false, 1));
  EXPECT_TRUE(abr::abr_active(true, 0));
}

TEST(AbrNetworkHealth, SevereCongestionHalvesBitrate) {
  // Field: 23 Mbps on 4G took ~30 s of x0.75 steps to drain; x0.5 gets there in ~12 s.
  EXPECT_DOUBLE_EQ(abr::downshift_ratio(30), 0.5);
  EXPECT_DOUBLE_EQ(abr::downshift_ratio(1), 0.5);
  EXPECT_DOUBLE_EQ(abr::downshift_ratio(31), 0.75);
  EXPECT_DOUBLE_EQ(abr::downshift_ratio(50), 0.75);
}

TEST(AbrNetworkHealth, FailedProbeCapsUpshiftsBelowIt) {
  using namespace std::chrono_literals;
  const auto t0 = std::chrono::steady_clock::time_point {} + 1h;
  abr::probe_ceiling ceiling;
  EXPECT_EQ(ceiling.cap(30000, t0), 30000u);  // nothing failed yet

  ceiling.on_failed_probe(7627, t0);          // field: upshift to 7627 kbps choked 4G
  EXPECT_EQ(ceiling.cap(9533, t0 + 10s), 6101u);
  EXPECT_EQ(ceiling.cap(5889, t0 + 10s), 5889u);
  EXPECT_EQ(ceiling.cap(9533, t0 + abr::kProbeCeilingHold), 9533u);  // re-probe later: the link may improve
}

TEST(AbrNetworkHealth, EmergencyDropsStraightToFloor) {
  // Field: 4G built 12 s of queue while stepping 11.5 -> 5.7 -> 2.9 Mbps; jump to the floor instead.
  EXPECT_DOUBLE_EQ(abr::downshift_ratio(abr::kEmergencyHealth), 0.0);
}
