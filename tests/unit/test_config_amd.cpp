/**
 * @file tests/unit/test_config_amd.cpp
 * @brief Unit tests for AMD encoder config parsing helpers.
 */
#include <gtest/gtest.h>
#include <optional>
#include <string_view>

#include "src/config.h"

namespace config::amd {

  // ──────────────────────────────────────────────────────────────────────────
  // split_frame_from_view — canonical string values
  // ──────────────────────────────────────────────────────────────────────────

  TEST(SplitFrameFromView, Auto_ReturnsNullopt) {
    EXPECT_EQ(split_frame_from_view("auto", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("auto", 0), std::nullopt);
    EXPECT_EQ(split_frame_from_view("auto", 1), std::nullopt);
  }

  TEST(SplitFrameFromView, Enabled_Returns1) {
    EXPECT_EQ(split_frame_from_view("enabled", std::nullopt), 1);
    EXPECT_EQ(split_frame_from_view("enabled", 0), 1);
  }

  TEST(SplitFrameFromView, Disabled_Returns0) {
    EXPECT_EQ(split_frame_from_view("disabled", std::nullopt), 0);
    EXPECT_EQ(split_frame_from_view("disabled", 1), 0);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Unknown / invalid values → original is returned unchanged
  // ──────────────────────────────────────────────────────────────────────────

  TEST(SplitFrameFromView, UnknownString_WithNulloptOriginal_PreservesNullopt) {
    EXPECT_EQ(split_frame_from_view("on", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("off", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("true", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("false", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("1", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("0", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("garbage", std::nullopt), std::nullopt);
  }

  TEST(SplitFrameFromView, UnknownString_WithIntOriginal_PreservesOriginal) {
    EXPECT_EQ(split_frame_from_view("bogus", 0), 0);
    EXPECT_EQ(split_frame_from_view("bogus", 1), 1);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Case-sensitivity: only lowercase is accepted
  // ──────────────────────────────────────────────────────────────────────────

  TEST(SplitFrameFromView, CaseSensitive_UppercaseFallsThrough) {
    // "Auto" / "Enabled" / "Disabled" are NOT accepted — returns original
    EXPECT_EQ(split_frame_from_view("Auto", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("ENABLED", std::nullopt), std::nullopt);
    EXPECT_EQ(split_frame_from_view("Disabled", std::nullopt), std::nullopt);
  }

}  // namespace config::amd
