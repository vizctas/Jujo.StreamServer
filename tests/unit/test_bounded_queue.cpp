#include <chrono>

#include <gtest/gtest.h>

#include "src/thread_safe.h"

TEST(BoundedQueue, ReportsAndConsumesOverflowEpisodes) {
  safe::queue_t<int> queue {2};

  queue.raise(1);
  queue.raise(2);
  queue.raise(3);

  EXPECT_EQ(queue.consume_overflow_count(), 1);
  EXPECT_EQ(queue.consume_overflow_count(), 0);
  const auto remaining = queue.pop(std::chrono::milliseconds {0});
  ASSERT_TRUE(remaining);
  EXPECT_EQ(*remaining, 3);
}

TEST(BoundedQueue, ResetClearsOverflowTelemetry) {
  safe::queue_t<int> queue {1};

  queue.raise(1);
  queue.raise(2);
  queue.reset();

  EXPECT_EQ(queue.consume_overflow_count(), 0);
}
