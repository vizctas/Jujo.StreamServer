/**
 * @file tests/unit/test_thread_safe.cpp
 * @brief Test src/thread_safe.h
 */

#include <gtest/gtest.h>

#include <chrono>
#include <thread>

#include "src/thread_safe.h"

TEST(ThreadSafeQueueTests, NonpositivePollsPreserveQueueStateAndConsumeReadyValues) {
  using namespace std::chrono_literals;

  safe::queue_t<int> queue;
  EXPECT_FALSE(queue.pop(0ms));
  EXPECT_FALSE(queue.pop(-1ms));
  EXPECT_TRUE(queue.running());

  queue.raise(7);
  queue.raise(9);
  EXPECT_EQ(queue.pop(-1ms), 7);
  EXPECT_EQ(queue.pop(0ms), 9);
  EXPECT_FALSE(queue.pop(0ms));
}

TEST(ThreadSafeQueueTests, PositiveTimeoutWaitsForProducer) {
  using namespace std::chrono_literals;

  safe::queue_t<int> queue;
  std::thread producer {[&] {
    std::this_thread::sleep_for(10ms);
    queue.raise(9);
  }};

  EXPECT_EQ(queue.pop(1s), 9);
  producer.join();
  EXPECT_FALSE(queue.pop(1ms));
}

