/**
 * @file tests/unit/test_fec_policy.cpp
 * @brief Unit tests for FEC overflow clamping, oversize scene-cut limits, and 0x5539 StatisticalFec.
 */
#include <gtest/gtest.h>

#include "src/fec_policy.h"

#include <array>
#include <chrono>

using namespace std::chrono_literals;
using namespace stream::fec_policy;

namespace {
  std::array<std::uint8_t, kFecReportBytes> encode_report(
    std::uint8_t version,
    std::uint32_t seq,
    std::uint32_t data_shards,
    std::uint32_t parity_shards,
    std::uint32_t missing_shards,
    std::uint16_t unrecovered_blocks,
    std::uint16_t interval_ms
  ) {
    std::array<std::uint8_t, kFecReportBytes> buf {};
    auto put_u16 = [&](std::size_t off, std::uint16_t v) {
      buf[off] = static_cast<std::uint8_t>(v & 0xFFu);
      buf[off + 1] = static_cast<std::uint8_t>((v >> 8) & 0xFFu);
    };
    auto put_u32 = [&](std::size_t off, std::uint32_t v) {
      buf[off] = static_cast<std::uint8_t>(v & 0xFFu);
      buf[off + 1] = static_cast<std::uint8_t>((v >> 8) & 0xFFu);
      buf[off + 2] = static_cast<std::uint8_t>((v >> 16) & 0xFFu);
      buf[off + 3] = static_cast<std::uint8_t>((v >> 24) & 0xFFu);
    };
    buf[0] = version;
    put_u32(4, seq);
    put_u32(8, data_shards);
    put_u32(12, parity_shards);
    put_u32(16, missing_shards);
    put_u16(20, unrecovered_blocks);
    put_u16(22, interval_ms);
    return buf;
  }
}  // namespace

TEST(FecPolicyTest, PlanFrameFecKeepsRequestedPercentageWhenWithinFourBlocks) {
  constexpr std::size_t blocksize = 1040;
  // At 20% FEC, max_d = 212 shards/block => 4 * 212 = 848 shards fit natively.
  const auto plan = plan_frame_fec(800 * blocksize, blocksize, 20);
  EXPECT_EQ(plan.effective_fec_percentage, 20u);
  EXPECT_EQ(plan.fec_blocks_needed, 4u);
  EXPECT_EQ(plan.max_data_shards_per_block, 212u);
  EXPECT_FALSE(plan.was_clamped);
  EXPECT_FALSE(plan.overflow_unprotected);
}

TEST(FecPolicyTest, PlanFrameFecClampsInsteadOfDroppingToZero) {
  constexpr std::size_t blocksize = 1040;
  // 900 shards would exceed 4 blocks at 20%, but fits cleanly at 13% (max_d = 225).
  const auto plan = plan_frame_fec(900 * blocksize, blocksize, 20);
  EXPECT_EQ(plan.effective_fec_percentage, 13u);
  EXPECT_EQ(plan.fec_blocks_needed, 4u);
  EXPECT_EQ(plan.max_data_shards_per_block, 225u);
  EXPECT_TRUE(plan.was_clamped);
  EXPECT_FALSE(plan.overflow_unprotected);
}

TEST(FecPolicyTest, PlanFrameFecMarksOverflowUnprotectedAboveMaxDataCapacity) {
  constexpr std::size_t blocksize = 1040;
  // > 4 * 255 = 1020 shards cannot carry any FEC in 4 blocks.
  const auto plan = plan_frame_fec(1021 * blocksize, blocksize, 20);
  EXPECT_EQ(plan.effective_fec_percentage, 0u);
  EXPECT_EQ(plan.fec_blocks_needed, 4u);
  EXPECT_TRUE(plan.was_clamped);
  EXPECT_TRUE(plan.overflow_unprotected);
}

TEST(FecPolicyTest, FecWholeFrameLimitDisabledAboveTwoNominalFrames) {
  // 1392B packets, 16B header = 1376B payload, 4B frame header, 20% FEC -> 4 * 212 * 1376 - 4 = 1,166,844 B
  const auto low_bitrate_cap = fec_whole_frame_limit_bytes(1392, 16, 4, 20, 60000, 60.0);
  EXPECT_EQ(low_bitrate_cap, 4u * 212u * 1376u - 4u);

  // At 500 Mbps / 60 fps, two nominal frames = ~2.08 MB > 1.16 MB => disabled (0).
  const auto high_bitrate_cap = fec_whole_frame_limit_bytes(1392, 16, 4, 20, 500000, 60.0);
  EXPECT_EQ(high_bitrate_cap, 0u);
}

TEST(FecPolicyTest, ParseRlFecPercentageValidatesInputs) {
  EXPECT_EQ(parse_rl_fec_percentage("host"), (fec_choice_t {fec_mode_e::host, 0}));
  EXPECT_EQ(parse_rl_fec_percentage("auto"), (fec_choice_t {fec_mode_e::auto_report, 0}));
  EXPECT_EQ(parse_rl_fec_percentage("0"), (fec_choice_t {fec_mode_e::fixed, 0}));
  EXPECT_EQ(parse_rl_fec_percentage("25"), (fec_choice_t {fec_mode_e::fixed, 25}));
  EXPECT_EQ(parse_rl_fec_percentage("255"), (fec_choice_t {fec_mode_e::fixed, 255}));

  EXPECT_FALSE(parse_rl_fec_percentage("").has_value());
  EXPECT_FALSE(parse_rl_fec_percentage("-1").has_value());
  EXPECT_FALSE(parse_rl_fec_percentage("+10").has_value());
  EXPECT_FALSE(parse_rl_fec_percentage("256").has_value());
  EXPECT_FALSE(parse_rl_fec_percentage("invalid").has_value());
}

TEST(FecPolicyTest, ParseFecReportDecodesAndRejectsInvalidFrames) {
  const auto raw = encode_report(1, 7, 1000, 200, 12, 1, 1000);
  fec_report_t report {};
  ASSERT_TRUE(parse_fec_report({reinterpret_cast<const char *>(raw.data()), raw.size()}, report));
  EXPECT_EQ(report.seq, 7u);
  EXPECT_EQ(report.data_shards, 1000u);
  EXPECT_EQ(report.parity_shards, 200u);
  EXPECT_EQ(report.missing_shards, 12u);
  EXPECT_EQ(report.unrecovered_blocks, 1u);
  EXPECT_EQ(report.interval_ms, 1000u);

  auto bad_ver = encode_report(0, 7, 100, 20, 0, 0, 1000);
  EXPECT_FALSE(parse_fec_report({reinterpret_cast<const char *>(bad_ver.data()), bad_ver.size()}, report));

  auto bad_missing = encode_report(1, 7, 100, 20, 121, 0, 1000);
  EXPECT_FALSE(parse_fec_report({reinterpret_cast<const char *>(bad_missing.data()), bad_missing.size()}, report));

  auto bad_interval = encode_report(1, 7, 100, 20, 0, 0, 100);
  EXPECT_FALSE(parse_fec_report({reinterpret_cast<const char *>(bad_interval.data()), bad_interval.size()}, report));

  EXPECT_FALSE(parse_fec_report({reinterpret_cast<const char *>(raw.data()), kFecReportBytes - 1}, report));
}

TEST(FecPolicyTest, StatisticalFecEnforcesFloorAdaptsToLossAndTimesOutToFallback) {
  const auto t0 = statistical_fec_t::clock::now();
  statistical_fec_t fec(50, 20, 2, t0);

  // Before first report -> fallback (20%).
  EXPECT_EQ(fec.percent(t0, 150), 20u);

  // Clean report -> drops to floor (10%), never 0%.
  ASSERT_EQ(fec.report(t0 + 1s, fec_report_t {0, 2000, 200, 0, 0, 1000}), reject_reason_e::none);
  EXPECT_EQ(fec.percent(t0 + 1s, 150), kMinimumPercent);

  // Stale or implausible reports are rejected without corrupting state.
  EXPECT_EQ(fec.report(t0 + 2s, fec_report_t {0, 2000, 200, 0, 0, 1000}), reject_reason_e::stale);
  EXPECT_EQ(fec.report(t0 + 2s, fec_report_t {1, 900000, 200000, 0, 0, 1000}), reject_reason_e::implausible);

  // 5% loss burst exceeds 10% binomial tail budget -> raises protection above floor.
  ASSERT_EQ(fec.report(t0 + 2s, fec_report_t {1, 1000, 200, 60, 0, 1000}), reject_reason_e::none);
  const auto raised = fec.percent(t0 + 2s, 150);
  EXPECT_GT(raised, kMinimumPercent);
  EXPECT_LE(raised, 50u);

  // Timeout (> 3s without reports) returns immediately to host fallback (20%).
  EXPECT_EQ(fec.percent(t0 + 6s, 150), 20u);

  // Clean report after a seq/time gap holds fallback for a full 10s window of live 1s reports.
  ASSERT_EQ(fec.report(t0 + 7s, fec_report_t {10, 1000, 200, 0, 0, 1000}), reject_reason_e::none);
  std::uint32_t seq = 11;
  for (int sec = 8; sec <= 16; ++sec) {
    ASSERT_EQ(
      fec.report(t0 + std::chrono::seconds(sec), fec_report_t {seq++, 1000, 200, 0, 0, 1000}),
      reject_reason_e::none
    );
    EXPECT_EQ(fec.percent(t0 + std::chrono::seconds(sec), 150), 20u);
  }
  ASSERT_EQ(fec.report(t0 + 17s, fec_report_t {seq, 1000, 200, 0, 0, 1000}), reject_reason_e::none);
  EXPECT_EQ(fec.percent(t0 + 17s, 150), kMinimumPercent);
}

