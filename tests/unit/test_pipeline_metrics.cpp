#include <gtest/gtest.h>
#include "src/pipeline_metrics.h"

using namespace video::metrics;
using namespace std::chrono_literals;
namespace {
  time_point at(std::int64_t us) { return time_point {} + std::chrono::microseconds(us); }
  trace_t trace() { return {at(10), at(20), at(40), at(70), at(110)}; }
}

TEST(PipelineTracker, DelayedOutputMatchesItsOwnInputAndIsConsumedOnce) {
  tracker_t t;
  t.stage(at(1), at(2), at(3)); t.submit(0, at(4));
  t.stage(at(11), at(12), at(13)); t.submit(1, at(14));
  auto first = t.take(0, at(20));
  ASSERT_TRUE(first); EXPECT_EQ(first->captured, at(1)); EXPECT_EQ(first->output, at(20));
  EXPECT_FALSE(t.take(0, at(21)));
  auto second = t.take(1, at(22));
  ASSERT_TRUE(second); EXPECT_EQ(second->submitted, at(14));
}

TEST(PipelineTracker, RepeatedFramesDoNotBorrowPreviousTrace) {
  tracker_t t;
  t.stage(at(1), at(2), at(3)); t.submit(1, at(4));
  t.submit(2, at(5));
  EXPECT_FALSE(t.take(2, at(6))); EXPECT_TRUE(t.take(1, at(7)));
}

TEST(PipelineTracker, CapacityEvictsDiagnosticsWithoutMisidentifyingFrames) {
  tracker_t t;
  for (int i = 0; i < 65; ++i) {
    t.stage(at(i), at(i + 1), at(i + 2)); t.submit(i, at(i + 3));
  }
  EXPECT_FALSE(t.take(0, at(100)));
  for (int i = 1; i < 65; ++i) {
    auto result = t.take(i, at(100)); ASSERT_TRUE(result); EXPECT_EQ(result->captured, at(i));
  }
}

TEST(PipelineTracker, EncoderInstancesDoNotShareFrameIds) {
  tracker_t a, b;
  a.stage(at(1), at(2), at(3)); a.submit(1, at(4));
  EXPECT_FALSE(b.take(1, at(5))); EXPECT_TRUE(a.take(1, at(5)));
}

TEST(PipelineWindow, EmptyAndNearestRankPercentiles) {
  window_t w;
  EXPECT_EQ(w.summary().retained, 0);
  for (int i = 100; i > 0; --i) { w.add(i); }
  auto s = w.summary();
  EXPECT_EQ(s.total, 100); EXPECT_EQ(s.retained, 100);
  EXPECT_EQ(s.p50_us, 50); EXPECT_EQ(s.p99_us, 99); EXPECT_EQ(s.max_us, 100);
}

TEST(PipelineWindow, RolloverRetainsRecentPercentilesAndWholeWindowPeak) {
  window_t w; w.add(10000);
  for (int i = 1; i <= 600; ++i) { w.add(i); }
  auto s = w.summary();
  EXPECT_EQ(s.total, 601); EXPECT_EQ(s.retained, 512);
  EXPECT_EQ(s.p50_us, 344); EXPECT_EQ(s.p99_us, 595); EXPECT_EQ(s.max_us, 10000);
  w.reset(); EXPECT_EQ(w.summary().total, 0);
  w.add(3); s = w.summary();
  EXPECT_EQ(s.total, 1); EXPECT_EQ(s.p50_us, 3); EXPECT_EQ(s.p99_us, 3); EXPECT_EQ(s.max_us, 3);
}

TEST(PipelineSession, MeasuresOrderedStagesAndTransportSubset) {
  session_t s;
  s.record(trace(), at(160), at(220), 7us);
  EXPECT_EQ(s.packets, 1); EXPECT_EQ(s.tracked, 1); EXPECT_EQ(s.invalid, 0);
  const std::array<std::uint64_t, stage_count> expected {10, 20, 30, 40, 50, 7, 60, 210};
  for (std::size_t i = 0; i < expected.size(); ++i) {
    EXPECT_EQ(s.windows[i].summary().p50_us, expected[i]) << i;
  }
}

TEST(PipelineSession, UntrackedPacketsOnlyContributeTransportStages) {
  session_t s; s.record(std::nullopt, at(1), at(6), 2us);
  EXPECT_EQ(s.packets, 1); EXPECT_EQ(s.tracked, 0); EXPECT_EQ(s.invalid, 0);
  EXPECT_EQ(s.windows[send].summary().p50_us, 5);
  EXPECT_EQ(s.windows[source_to_send].summary().total, 0);
}

TEST(PipelineSession, RejectsEveryReversedTraceBoundary) {
  for (int boundary = 0; boundary < 5; ++boundary) {
    auto t = trace();
    switch (boundary) {
      case 0: t.captured = at(21); break;
      case 1: t.input = at(41); break;
      case 2: t.converted = at(71); break;
      case 3: t.submitted = at(111); break;
      case 4: t.output = at(161); break;
    }
    session_t s; s.record(t, at(160), at(220), 7us);
    EXPECT_EQ(s.invalid, 1); EXPECT_EQ(s.tracked, 0);
    EXPECT_EQ(s.windows[source_to_send].summary().total, 0);
    EXPECT_EQ(s.windows[send].summary().total, 1);
  }
}

TEST(PipelineSession, RejectsNegativeTransportDurations) {
  session_t s;
  s.record(std::nullopt, at(6), at(1), 0us);
  s.record(std::nullopt, at(1), at(6), -1us);
  EXPECT_EQ(s.invalid, 2); EXPECT_EQ(s.windows[send].summary().total, 0);
}

TEST(PipelineSession, ReportIntervalResetAndInstanceIdentity) {
  session_t s, other; EXPECT_NE(s.id, other.id);
  EXPECT_FALSE(s.report_due(at(0))); EXPECT_FALSE(s.report_due(at(9999999)));
  EXPECT_TRUE(s.report_due(at(10000000)));
  s.record(trace(), at(160), at(220), 7us);
  s.reset(at(10000000));
  EXPECT_EQ(s.packets, 0); EXPECT_EQ(s.tracked, 0); EXPECT_EQ(s.invalid, 0);
  for (const auto &w : s.windows) { EXPECT_EQ(w.summary().total, 0); }
  EXPECT_FALSE(s.report_due(at(19999999))); EXPECT_TRUE(s.report_due(at(20000000)));
}
