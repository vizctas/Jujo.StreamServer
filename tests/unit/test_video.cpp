/**
 * @file tests/unit/test_video.cpp
 * @brief Test src/video.*.
 */
#include "../tests_common.h"

#include <cstdlib>
#include <src/video.h>
#ifdef _WIN32
  #include "src/platform/windows/misc.h"
#endif

struct EncoderTest: PlatformTestSuite, testing::WithParamInterface<video::encoder_t *> {
  void SetUp() override {
    auto &encoder = *GetParam();
    const char *run_encoders = std::getenv("SUNSHINE_RUN_ENCODER_TESTS");
    if (!run_encoders || std::string_view(run_encoders).empty() || std::string_view(run_encoders) == "0") {
      GTEST_SKIP() << "Encoder tests disabled (set SUNSHINE_RUN_ENCODER_TESTS=1 to enable)";
    }

    if (encoder.name != "software") {
      const char *run_hardware = std::getenv("SUNSHINE_RUN_HARDWARE_ENCODER_TESTS");
      if (!run_hardware || std::string_view(run_hardware).empty() || std::string_view(run_hardware) == "0") {
        GTEST_SKIP() << "Hardware encoder tests disabled (set SUNSHINE_RUN_HARDWARE_ENCODER_TESTS=1 to enable)";
      }
    }

#ifdef _WIN32
    if (encoder.name == "nvenc" && !platf::has_nvidia_gpu()) {
      GTEST_SKIP() << "NVIDIA GPU not detected";
    }
#endif
    if (!video::validate_encoder(encoder, false)) {
      // Encoder failed validation,
      // if it's software - fail, otherwise skip
      if (encoder.name == "software") {
        FAIL() << "Software encoder not available";
      } else {
        GTEST_SKIP() << "Encoder not available";
      }
    }
  }
};

INSTANTIATE_TEST_SUITE_P(
  EncoderVariants,
  EncoderTest,
  testing::Values(
#if !defined(__APPLE__)
    &video::nvenc,
#endif
#ifdef _WIN32
    &video::amdvce,
    &video::quicksync,
#endif
#ifdef __linux__
    &video::vaapi,
#endif
#ifdef __APPLE__
    &video::videotoolbox,
#endif
    &video::software
  ),
  [](const auto &info) {
    return std::string(info.param->name);
  }
);

TEST_P(EncoderTest, ValidateEncoder) {
  // todo:: test something besides fixture setup
}

TEST(VideoColorRangeTest, LimitedClientModeMapsToMpegRange) {
  video::config_t config {};
  config.encoderCscMode = 0;
  config.dynamicRange = 0;

  auto colorspace = video::colorspace_from_client_config(config, false);
  auto avcodec_colorspace = video::avcodec_colorspace_from_sunshine_colorspace(colorspace);

  EXPECT_FALSE(colorspace.full_range);
  EXPECT_EQ(video::colorspace_e::rec601, colorspace.colorspace);
  EXPECT_EQ(AVCOL_RANGE_MPEG, avcodec_colorspace.range);
}

TEST(VideoColorRangeTest, FullClientModeMapsToJpegRange) {
  video::config_t config {};
  config.encoderCscMode = 1;
  config.dynamicRange = 0;

  auto colorspace = video::colorspace_from_client_config(config, false);
  auto avcodec_colorspace = video::avcodec_colorspace_from_sunshine_colorspace(colorspace);

  EXPECT_TRUE(colorspace.full_range);
  EXPECT_EQ(video::colorspace_e::rec601, colorspace.colorspace);
  EXPECT_EQ(AVCOL_RANGE_JPEG, avcodec_colorspace.range);
}

TEST(VideoColorRangeTest, FullRangePreservesSelectedSdrColorspace) {
  video::config_t config {};
  config.encoderCscMode = (1 << 1) | 1;
  config.dynamicRange = 0;

  auto colorspace = video::colorspace_from_client_config(config, false);
  auto avcodec_colorspace = video::avcodec_colorspace_from_sunshine_colorspace(colorspace);

  EXPECT_TRUE(colorspace.full_range);
  EXPECT_EQ(video::colorspace_e::rec709, colorspace.colorspace);
  EXPECT_EQ(AVCOL_PRI_BT709, avcodec_colorspace.primaries);
  EXPECT_EQ(AVCOL_RANGE_JPEG, avcodec_colorspace.range);
}

struct FramerateX100Test: testing::TestWithParam<std::tuple<std::int32_t, AVRational>> {};

TEST_P(FramerateX100Test, Run) {
  const auto &[x100, expected] = GetParam();
  auto res = video::framerateX100_to_rational(x100);
  ASSERT_EQ(0, av_cmp_q(res, expected)) << "expected "
                                        << expected.num << "/" << expected.den
                                        << ", got "
                                        << res.num << "/" << res.den;
}

INSTANTIATE_TEST_SUITE_P(
  FramerateX100Tests,
  FramerateX100Test,
  testing::Values(
    std::make_tuple(2397, AVRational {24000, 1001}),
    std::make_tuple(2398, AVRational {24000, 1001}),
    std::make_tuple(2500, AVRational {25, 1}),
    std::make_tuple(2997, AVRational {30000, 1001}),
    std::make_tuple(3000, AVRational {30, 1}),
    std::make_tuple(5994, AVRational {60000, 1001}),
    std::make_tuple(6000, AVRational {60, 1}),
    std::make_tuple(11988, AVRational {120000, 1001}),
    std::make_tuple(23976, AVRational {240000, 1001}),  // future NTSC 240hz?
    std::make_tuple(9498, AVRational {4749, 50})  // from my LG 27GN950
  )
);
