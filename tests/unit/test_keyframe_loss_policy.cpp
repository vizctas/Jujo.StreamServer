/**
 * @file tests/unit/test_keyframe_loss_policy.cpp
 * @brief Test src/keyframe_loss_policy.h
 */
#include <gtest/gtest.h>

#include "src/keyframe_loss_policy.h"

namespace kl = stream::keyframe_loss_policy;
using tp = kl::keyframe_loss_t::time_point;
using namespace std::chrono_literals;

TEST(KeyframeLossPolicyTests, StartupKeyframeLossLatchesProvisionallyThenLifts) {
  kl::keyframe_loss_t state;
  const tp t0 {};
  state.sending_at(1, true, t0);

  const auto ev = state.unrecoverable_at(1, 1, 16666us, t0 + 20ms);
  ASSERT_TRUE(ev.has_value());
  EXPECT_EQ(ev->kind, kl::latch_kind_e::startup);
  EXPECT_TRUE(state.latched());
  EXPECT_EQ(state.pacing_bps(60'000'000, 25'000'000), 25'000'000u);

  // Send 120 clean frames across 10s -> provisional startup latch lifts.
  for (std::uint32_t f = 2; f <= 122; ++f) {
    state.sending_at(f, false, t0 + 100ms + std::chrono::milliseconds(f * 90));
  }
  EXPECT_FALSE(state.latched());
  EXPECT_TRUE(state.take_lifted().has_value());
  EXPECT_EQ(state.pacing_bps(60'000'000, 25'000'000), 60'000'000u);
}

TEST(KeyframeLossPolicyTests, ThreeRecentUnrecoverableFramesTriggerSustainedLatch) {
  kl::keyframe_loss_t state;
  const tp t0 {};
  state.sending_at(1, true, t0);
  // Advance past startup host-change window (500ms)
  state.sending_at(60, false, t0 + 1s);

  EXPECT_FALSE(state.unrecoverable_at(58, 60, 16666us, t0 + 1010ms).has_value());
  EXPECT_FALSE(state.unrecoverable_at(59, 60, 16666us, t0 + 1020ms).has_value());
  const auto ev = state.unrecoverable_at(60, 60, 16666us, t0 + 1030ms);
  ASSERT_TRUE(ev.has_value());
  EXPECT_EQ(ev->kind, kl::latch_kind_e::sustained);
  EXPECT_TRUE(state.latched());
}

TEST(KeyframeLossPolicyTests, HostChangeWindowSuppressesLossAndRequestAlerts) {
  kl::keyframe_loss_t state;
  const tp t0 {};
  state.sending_at(1, true, t0);
  state.sending_at(100, false, t0 + 2s);

  state.host_keyframe();
  state.sending_at(101, true, t0 + 2010ms);

  EXPECT_FALSE(state.network_loss(102, t0 + 2100ms));
  EXPECT_FALSE(state.network_request(t0 + 2100ms));
  EXPECT_FALSE(state.unrecoverable_at(102, 102, 16666us, t0 + 2100ms).has_value());
  EXPECT_TRUE(state.take_ignored().has_value());

  // After 1s window expires, real losses count again.
  EXPECT_TRUE(state.network_loss(170, t0 + 3100ms));
}

TEST(KeyframeLossPolicyTests, DecodeQueueOverflowBlocksRepeatRequestWithoutLatching) {
  kl::keyframe_loss_t state;
  const tp t0 {};
  state.sending_at(1, true, t0);
  state.sending_at(100, false, t0 + 2s);

  // First request triggers loss-driven IDR.
  EXPECT_FALSE(state.requested_at(t0 + 2100ms).has_value());
  state.sending_at(101, true, t0 + 2110ms);
  for (std::uint32_t f = 102; f <= 120; ++f) {
    state.sending_at(f, false, t0 + 2110ms + std::chrono::milliseconds(f - 101));
  }

  // >= 15 frames later within 500ms: client decoder queue overflowed -> suppress network_request.
  EXPECT_FALSE(state.network_request(t0 + 2300ms));
  EXPECT_FALSE(state.requested_at(t0 + 2300ms).has_value());
  EXPECT_FALSE(state.latched());
}

TEST(KeyframeLossPolicyTests, AbandonedFrameTriggersSendLatchAndDeduplicatesUnrecoverable) {
  kl::keyframe_loss_t state;
  const tp t0 {};
  state.sending_at(1, true, t0);
  state.sending_at(100, false, t0 + 2s);

  const auto ev = state.abandoned_at(1, 16666us, t0 + 2100ms);
  ASSERT_TRUE(ev.has_value());
  EXPECT_EQ(ev->kind, kl::latch_kind_e::send);
  EXPECT_TRUE(ev->host_only);

  EXPECT_FALSE(state.network_loss(1, t0 + 2110ms));
  EXPECT_FALSE(state.unrecoverable_at(1, 100, 16666us, t0 + 2120ms).has_value());
  EXPECT_TRUE(state.take_ignored().has_value());
}
