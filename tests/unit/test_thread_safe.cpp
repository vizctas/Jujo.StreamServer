/**
 * @file tests/unit/test_thread_safe.cpp
 * @brief Test src/thread_safe.h
 */

#include <gtest/gtest.h>

#include <chrono>
#include <future>
#include <memory>
#include <stdexcept>
#include <thread>

#include "src/thread_safe.h"
#include "src/video_control.h"

namespace {
  using namespace std::chrono_literals;

  struct paused_payload_t {
    int value {};
    paused_payload_t() = default;
    explicit paused_payload_t(int value): value {value} {}
    paused_payload_t(std::promise<void> &entered, std::shared_future<void> resume): value {9} {
      entered.set_value();
      resume.wait();
    }
  };

  template<class Mailbox>
  void check_contended_poll(bool initially_ready) {
    Mailbox mailbox;
    if (initially_ready) {
      mailbox.raise(7);
    }
    std::promise<void> entered, resume;
    auto entered_future = entered.get_future();
    auto resume_future = resume.get_future().share();
    std::thread producer {[&] { mailbox.raise(entered, resume_future); }};
    const auto producer_ready = entered_future.wait_for(2s);
    auto poll = std::async(std::launch::async, [&] {
      return mailbox.running() && mailbox.peek() == initially_ready && !mailbox.try_pop();
    });
    const auto poll_ready = poll.wait_for(500ms);
    // Release before assertions: a regression must fail, not hang the suite.
    resume.set_value();
    producer.join();
    const bool declined = poll.get();
    EXPECT_EQ(producer_ready, std::future_status::ready);
    EXPECT_EQ(poll_ready, std::future_status::ready);
    EXPECT_TRUE(declined);
    if (poll_ready == std::future_status::ready && declined) {
      EXPECT_TRUE(mailbox.peek());
      EXPECT_TRUE(mailbox.try_pop());
    }
  }
}  // namespace

TEST(ThreadSafeQueueTests, EmptyPollDeclinesProducerLock) {
  check_contended_poll<safe::queue_t<paused_payload_t>>(false);
}

TEST(ThreadSafeQueueTests, ReadyPollDeclinesProducerLock) {
  check_contended_poll<safe::queue_t<paused_payload_t>>(true);
}

TEST(ThreadSafeEventTests, EmptyPollDeclinesProducerLock) {
  check_contended_poll<safe::event_t<paused_payload_t>>(false);
}

TEST(ThreadSafeEventTests, ReadyPollDeclinesProducerLock) {
  check_contended_poll<safe::event_t<paused_payload_t>>(true);
}

TEST(ThreadSafeEventTests, ViewDeclinesProducerLockWithoutLosingEvent) {
  safe::event_t<paused_payload_t> event;
  event.raise(7);
  std::promise<void> entered, resume;
  auto entered_future = entered.get_future();
  auto resume_future = resume.get_future().share();
  std::thread producer {[&] { event.raise(entered, resume_future); }};
  auto producer_ready = entered_future.wait_for(2s);
  auto poll = std::async(std::launch::async, [&] { return event.try_view(); });
  auto poll_ready = poll.wait_for(500ms);
  resume.set_value();
  producer.join();
  EXPECT_EQ(producer_ready, std::future_status::ready);
  EXPECT_EQ(poll_ready, std::future_status::ready);
  EXPECT_FALSE(poll.get());
  auto value = event.try_view();
  ASSERT_TRUE(value);
  EXPECT_EQ(value->value, 9);
  EXPECT_TRUE(event.peek());
}

TEST(ThreadSafeEventTests, ZeroTimeoutStillAcquiresLockForOneShotConsumers) {
  for (bool view : {false, true}) {
    safe::event_t<paused_payload_t> event;
    std::promise<void> entered, resume, consumer_entered;
    auto entered_future = entered.get_future();
    auto resume_future = resume.get_future().share();
    auto consumer_future = consumer_entered.get_future();
    std::thread producer {[&] { event.raise(entered, resume_future); }};
    auto producer_ready = entered_future.wait_for(2s);
    auto consume = std::async(std::launch::async, [&] {
      consumer_entered.set_value();
      return view ? event.view(0ms) : event.pop(0ms);
    });
    auto consumer_ready = consumer_future.wait_for(2s);
    auto while_busy = consume.wait_for(20ms);
    resume.set_value();
    producer.join();
    const auto value = consume.get();
    EXPECT_EQ(producer_ready, std::future_status::ready);
    EXPECT_EQ(consumer_ready, std::future_status::ready);
    EXPECT_EQ(while_busy, std::future_status::timeout);
    ASSERT_TRUE(value);
    EXPECT_EQ(value->value, 9);
    EXPECT_EQ(event.peek(), view);
  }
}

TEST(ThreadSafeEventTests, BooleanAndPointerEventsKeepTheirEmptySemantics) {
  safe::event_t<bool> flag;
  flag.raise(false);
  EXPECT_FALSE(flag.peek());
  EXPECT_FALSE(flag.try_pop());
  flag.raise(true);
  EXPECT_TRUE(flag.try_view());
  EXPECT_TRUE(flag.try_pop());
  EXPECT_FALSE(flag.peek());

  safe::event_t<std::shared_ptr<int>> pointer;
  pointer.raise(nullptr);
  EXPECT_FALSE(pointer.peek());
  pointer.raise(std::make_shared<int>(11));
  auto value = pointer.try_pop();
  ASSERT_TRUE(value);
  EXPECT_EQ(*value, 11);
  EXPECT_FALSE(pointer.peek());
}

TEST(ThreadSafeQueueTests, FalsePayloadStillOccupiesQueueEntry) {
  safe::queue_t<bool> queue;
  queue.raise(false);
  EXPECT_TRUE(queue.peek());
  EXPECT_FALSE(queue.try_pop());
  EXPECT_FALSE(queue.peek());
}

TEST(ThreadSafeEventTests, StopRejectsPendingAndNewEventsUntilReset) {
  safe::event_t<int> event;
  event.raise(1);
  event.stop();
  event.raise(2);
  EXPECT_FALSE(event.running());
  EXPECT_FALSE(event.peek());
  EXPECT_FALSE(event.try_pop());
  EXPECT_FALSE(event.try_view());
  event.reset();
  EXPECT_TRUE(event.running());
  EXPECT_FALSE(event.peek());
  event.raise(3);
  EXPECT_EQ(event.try_view(), 3);
  EXPECT_EQ(event.try_pop(), 3);
  EXPECT_FALSE(event.peek());
}

TEST(ThreadSafeQueueTests, ResetPreservesOverflowPolicyAndRestartsQueue) {
  safe::queue_t<int> queue {2};
  queue.raise(1);
  queue.raise(2);
  queue.raise(3);
  EXPECT_EQ(queue.consume_overflow_count(), 1);
  EXPECT_EQ(queue.try_pop(), 3);
  EXPECT_FALSE(queue.peek());
  queue.raise(4);
  queue.stop();
  queue.raise(5);
  EXPECT_FALSE(queue.peek());
  EXPECT_FALSE(queue.running());
  EXPECT_FALSE(queue.try_pop());
  queue.reset();
  EXPECT_TRUE(queue.running());
  EXPECT_FALSE(queue.peek());
  EXPECT_EQ(queue.consume_overflow_count(), 0);
  queue.raise(6);
  queue.raise(7);
  EXPECT_EQ(queue.try_pop(), 6);
  EXPECT_EQ(queue.try_pop(), 7);
}

TEST(ThreadSafeEventTests, StopWakesBlockingAndTimedConsumers) {
  for (int mode = 0; mode < 4; ++mode) {
    safe::event_t<int> event;
    std::promise<void> entered;
    auto entered_future = entered.get_future();
    auto consumer = std::async(std::launch::async, [&] {
      entered.set_value();
      switch (mode) {
        case 0: return event.pop();
        case 1: return event.view();
        case 2: return event.pop(2s);
        default: return event.view(2s);
      }
    });
    auto started = entered_future.wait_for(2s);
    event.stop();
    EXPECT_EQ(started, std::future_status::ready);
    EXPECT_EQ(consumer.wait_for(500ms), std::future_status::ready);
    EXPECT_FALSE(consumer.get());
  }
}

TEST(ThreadSafeQueueTests, StopWakesBlockingAndTimedConsumers) {
  for (bool timed : {false, true}) {
    safe::queue_t<int> queue;
    std::promise<void> entered;
    auto entered_future = entered.get_future();
    auto consumer = std::async(std::launch::async, [&] {
      entered.set_value();
      return timed ? queue.pop(2s) : queue.pop();
    });
    auto started = entered_future.wait_for(2s);
    queue.stop();
    EXPECT_EQ(started, std::future_status::ready);
    EXPECT_EQ(consumer.wait_for(500ms), std::future_status::ready);
    EXPECT_FALSE(consumer.get());
  }
}

TEST(ThreadSafeQueueTests, ConcurrentConsumersDeliverEachItemOnce) {
  constexpr int items = 2000;
  safe::queue_t<int> queue {items + 2};
  std::array<std::atomic<int>, items> seen {};
  std::array<std::thread, 2> consumers;
  for (auto &consumer : consumers) {
    consumer = std::thread {[&] {
      while (auto value = queue.pop()) {
        if (*value == items) {
          break;
        }
        ++seen[*value];
      }
    }};
  }
  for (int i = 0; i < items; ++i) {
    queue.raise(i);
  }
  queue.raise(items);
  queue.raise(items);
  for (auto &consumer : consumers) {
    consumer.join();
  }
  for (const auto &count : seen) {
    EXPECT_EQ(count.load(), 1);
  }
  EXPECT_FALSE(queue.peek());
}

TEST(VideoControlTests, BusyPublisherDefersDrainWithoutSpinningOrLosingUpdate) {
  safe::event_t<paused_payload_t> event;
  event.raise(7);
  std::promise<void> entered, resume;
  auto entered_future = entered.get_future();
  auto resume_future = resume.get_future().share();
  std::thread producer {[&] { event.raise(entered, resume_future); }};
  auto producer_ready = entered_future.wait_for(2s);
  auto drain = std::async(std::launch::async, [&] {
    int handled = 0;
    video::drain_control_events(event, [&](const auto &) { ++handled; });
    return handled;
  });
  auto drain_ready = drain.wait_for(500ms);
  resume.set_value();
  producer.join();
  EXPECT_EQ(producer_ready, std::future_status::ready);
  EXPECT_EQ(drain_ready, std::future_status::ready);
  EXPECT_EQ(drain.get(), 0);
  int latest = 0;
  video::drain_control_events(event, [&](const auto &value) { latest = value.value; });
  EXPECT_EQ(latest, 9);
  EXPECT_FALSE(event.peek());
}

TEST(ThreadSafeQueueTests, CompetingPollersDeliverEachItemOnce) {
  constexpr int items = 2000;
  safe::queue_t<int> queue {items};
  std::array<std::atomic<int>, items> seen {};
  for (int i = 0; i < items; ++i) {
    queue.raise(i);
  }
  auto consume = [&] {
    while (queue.running()) {
      if (auto value = queue.try_pop()) {
        ++seen[*value];
      } else if (!queue.peek()) {
        break;
      } else {
        std::this_thread::yield();
      }
    }
  };
  auto first = std::async(std::launch::async, consume);
  auto second = std::async(std::launch::async, consume);
  const auto first_ready = first.wait_for(2s);
  const auto second_ready = second.wait_for(2s);
  queue.stop();
  first.get();
  second.get();
  EXPECT_EQ(first_ready, std::future_status::ready);
  EXPECT_EQ(second_ready, std::future_status::ready);
  for (const auto &count : seen) {
    EXPECT_EQ(count.load(), 1);
  }
}

TEST(ThreadSafeEventTests, ReadyPollAlsoDeclinesConsumerCopyLock) {
  struct copy_gate_t {
    std::promise<void> entered, resume;
    std::shared_future<void> resume_future {resume.get_future().share()};
  };
  struct copied_t {
    std::shared_ptr<copy_gate_t> gate;
    explicit copied_t(std::shared_ptr<copy_gate_t> gate): gate {std::move(gate)} {}
    copied_t(copied_t &&) noexcept = default;
    copied_t &operator=(copied_t &&) noexcept = default;
    copied_t(const copied_t &other): gate {other.gate} {
      gate->entered.set_value();
      gate->resume_future.wait();
    }
  };
  safe::event_t<copied_t> event;
  auto gate = std::make_shared<copy_gate_t>();
  auto copying = gate->entered.get_future();
  event.raise(gate);
  auto view = std::async(std::launch::async, [&] { return event.view(); });
  auto copy_ready = copying.wait_for(2s);
  auto poll = std::async(std::launch::async, [&] { return event.try_pop(); });
  auto poll_ready = poll.wait_for(500ms);
  gate->resume.set_value();
  EXPECT_TRUE(view.get());
  EXPECT_EQ(copy_ready, std::future_status::ready);
  EXPECT_EQ(poll_ready, std::future_status::ready);
  EXPECT_FALSE(poll.get());
  EXPECT_TRUE(event.try_pop());
  EXPECT_FALSE(event.peek());
}

TEST(ThreadSafeEventTests, BlockingAndTimedConsumersReceiveNewEvents) {
  for (int mode = 0; mode < 4; ++mode) {
    safe::event_t<int> event;
    auto consumer = std::async(std::launch::async, [&] {
      switch (mode) {
        case 0: return event.pop();
        case 1: return event.view();
        case 2: return event.pop(2s);
        default: return event.view(2s);
      }
    });
    event.raise(23);
    EXPECT_EQ(consumer.get(), 23);
    EXPECT_EQ(event.peek(), mode % 2 == 1);
  }
}

TEST(ThreadSafeEventTests, FailedConstructionKeepsPublishedStateConsistent) {
  struct payload_t {
    int value;
    explicit payload_t(int value): value {value} {
      if (value == 42) {
        throw std::runtime_error("test construction failure");
      }
    }
  };
  safe::event_t<payload_t> event;
  EXPECT_THROW(event.raise(42), std::runtime_error);
  EXPECT_FALSE(event.peek());
  event.raise(7);
  EXPECT_THROW(event.raise(42), std::runtime_error);
  EXPECT_TRUE(event.peek());
  auto value = event.try_pop();
  ASSERT_TRUE(value);
  EXPECT_EQ(value->value, 7);
}

TEST(ThreadSafeQueueTests, FailedConstructionAfterOverflowPublishesEmpty) {
  struct payload_t {
    explicit payload_t(bool fail) {
      if (fail) {
        throw std::runtime_error("test construction failure");
      }
    }
  };
  safe::queue_t<payload_t> queue {1};
  queue.raise(false);
  EXPECT_THROW(queue.raise(true), std::runtime_error);
  EXPECT_FALSE(queue.peek());
  EXPECT_FALSE(queue.try_pop());
  EXPECT_EQ(queue.consume_overflow_count(), 1);
  queue.raise(false);
  EXPECT_TRUE(queue.try_pop());
}

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

