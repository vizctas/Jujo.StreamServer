/**
 * @file tests/unit/test_process_art_assets.cpp
 * @brief Art-role contract tests for proc_t::get_app_asset().
 */

#include <array>
#include <cstdint>
#include <fstream>

#include <src/process.h>

#include "../tests_common.h"

namespace {
  struct art_fixture_t {
    std::filesystem::path dir;
    std::filesystem::path poster;
    std::filesystem::path poster_hires;
    std::filesystem::path hero;
    std::filesystem::path screenshot;

    art_fixture_t() {
      dir = std::filesystem::temp_directory_path() / "jujo_process_art_test";
      std::filesystem::create_directories(dir);
      poster = write_png_header("poster.png", 600, 900);
      poster_hires = write_png_header("poster-hires.png", 1080, 1620);
      hero = write_png_header("hero.png", 1920, 1080);
      screenshot = write_png_header("shot.png", 1920, 1080);
    }

    ~art_fixture_t() {
      std::error_code ec;
      std::filesystem::remove_all(dir, ec);
    }

    std::filesystem::path write_png_header(
      const char *name,
      std::uint32_t width,
      std::uint32_t height
    ) {
      const auto path = dir / name;
      std::array<unsigned char, 32> bytes {
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 'I', 'H', 'D', 'R'
      };
      bytes[16] = static_cast<unsigned char>((width >> 24U) & 0xFFU);
      bytes[17] = static_cast<unsigned char>((width >> 16U) & 0xFFU);
      bytes[18] = static_cast<unsigned char>((width >> 8U) & 0xFFU);
      bytes[19] = static_cast<unsigned char>(width & 0xFFU);
      bytes[20] = static_cast<unsigned char>((height >> 24U) & 0xFFU);
      bytes[21] = static_cast<unsigned char>((height >> 16U) & 0xFFU);
      bytes[22] = static_cast<unsigned char>((height >> 8U) & 0xFFU);
      bytes[23] = static_cast<unsigned char>(height & 0xFFU);
      std::ofstream output(path, std::ios::binary);
      output.write(reinterpret_cast<const char *>(bytes.data()), bytes.size());
      return path;
    }

    proc::ctx_t app(bool with_hero = true) const {
      proc::ctx_t app {};
      app.id = "42";
      app.image_path = poster.string();
      app.image_path_hires = poster_hires.string();
      if (with_hero) {
        app.hero_image_path = hero.string();
      }
      app.extra_images = {screenshot.string()};
      return app;
    }
  };

  proc::proc_t make_subject(proc::ctx_t app) {
    auto env = bp::this_process::env();
    std::vector<proc::ctx_t> apps;
    apps.push_back(std::move(app));
    return proc::proc_t {std::move(env), std::move(apps)};
  }
}  // namespace

TEST(ProcessArtAssets, PosterPrefersHighResolutionCover) {
  art_fixture_t fixture;
  auto subject = make_subject(fixture.app());

  EXPECT_EQ(subject.get_app_asset(42, 2, 0), fixture.poster_hires.string());
}

TEST(ProcessArtAssets, HeroNeverFallsBackToPortraitCover) {
  art_fixture_t fixture;
  auto subject = make_subject(fixture.app(false));

  const auto result = subject.get_app_asset(42, 3, 0);
  EXPECT_TRUE(result.empty());
  EXPECT_NE(result, fixture.poster_hires.string());
  EXPECT_NE(result, fixture.poster.string());
}

TEST(ProcessArtAssets, GalleryUsesRequestedIndex) {
  art_fixture_t fixture;
  auto subject = make_subject(fixture.app());

  EXPECT_EQ(subject.get_app_asset(42, 4, 0), fixture.screenshot.string());
}

TEST(ProcessClientVisibility, PublishesSystemDesktopWithoutLaunchCommand) {
  EXPECT_TRUE(proc::should_publish_app_to_client("system", false, false, "", {}, ""));
}

TEST(ProcessClientVisibility, HidesUninstalledStoreRecordWithoutLaunchCommand) {
  EXPECT_FALSE(proc::should_publish_app_to_client("steam", false, false, "", {}, ""));
}

TEST(ProcessClientVisibility, PublishesInstalledStoreRecord) {
  EXPECT_TRUE(proc::should_publish_app_to_client(
    "steam",
    false,
    false,
    R"(cmd /c start "" "steam://rungameid/123")",
    {},
    ""
  ));
}

TEST(ProcessClientVisibility, HidesStoreRecordFlaggedAsUninstalled) {
  EXPECT_FALSE(proc::should_publish_app_to_client(
    "steam",
    false,
    true,
    R"(cmd /c start "" "steam://rungameid/123")",
    {},
    ""
  ));
}
