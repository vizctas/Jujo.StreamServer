/**
 * @file tests/unit/test_rtsp_launch_queue.cpp
 * @brief Unit tests for bounded concurrent FIFO RTSP pending launch queue.
 */
#include <gtest/gtest.h>

#include "src/rtsp_launch_queue.h"

#include <chrono>
#include <cstdint>
#include <memory>

namespace {
  struct mock_launch_session_t {
    std::uint32_t id = 0;
  };

  using queue_t = rtsp_stream::pending_launch_queue_t<std::shared_ptr<mock_launch_session_t>>;
}  // namespace

TEST(RtspLaunchQueueTest, ConcurrentRaiseKeepsFifoOrderAndClearsIndividually) {
  queue_t queue;
  const auto t0 = queue_t::clock::time_point {} + std::chrono::seconds(10);

  auto launch = std::make_shared<mock_launch_session_t>(mock_launch_session_t {101});
  auto resume = std::make_shared<mock_launch_session_t>(mock_launch_session_t {202});

  queue.raise(launch, t0, std::chrono::seconds(10));
  queue.raise(resume, t0 + std::chrono::milliseconds(5), std::chrono::seconds(10));

  auto snap = queue.snapshot(t0 + std::chrono::milliseconds(10));
  ASSERT_EQ(snap.size(), 2u);
  EXPECT_EQ(snap[0]->id, 101u);
  EXPECT_EQ(snap[1]->id, 202u);

  EXPECT_TRUE(queue.clear(101u, t0 + std::chrono::milliseconds(50)));
  EXPECT_FALSE(queue.clear(999u, t0 + std::chrono::milliseconds(50)));

  auto remaining = queue.snapshot(t0 + std::chrono::milliseconds(60));
  ASSERT_EQ(remaining.size(), 1u);
  EXPECT_EQ(remaining[0]->id, 202u);
}

TEST(RtspLaunchQueueTest, IndividualExpiryAndBoundedCapacity) {
  queue_t queue;
  const auto t0 = queue_t::clock::time_point {} + std::chrono::seconds(100);

  queue.raise(std::make_shared<mock_launch_session_t>(mock_launch_session_t {1}), t0, std::chrono::seconds(5));
  queue.raise(std::make_shared<mock_launch_session_t>(mock_launch_session_t {2}), t0 + std::chrono::seconds(2), std::chrono::seconds(5));

  std::optional<queue_t::clock::time_point> next_expiry;
  auto expired = queue.prune_expired(t0 + std::chrono::seconds(5), &next_expiry);
  ASSERT_EQ(expired.size(), 1u);
  EXPECT_EQ(expired[0]->id, 1u);
  ASSERT_TRUE(next_expiry.has_value());
  EXPECT_EQ(*next_expiry, t0 + std::chrono::seconds(7));
  EXPECT_EQ(queue.size(), 1u);

  for (std::uint32_t i = 10; i < 30; ++i) {
    queue.raise(std::make_shared<mock_launch_session_t>(mock_launch_session_t {i}), t0 + std::chrono::seconds(6), std::chrono::seconds(30));
  }
  EXPECT_EQ(queue.size(), queue_t::kMaxPending);
  auto capped = queue.snapshot(t0 + std::chrono::seconds(6));
  EXPECT_EQ(capped.front()->id, 14u);
  EXPECT_EQ(capped.back()->id, 29u);
}
