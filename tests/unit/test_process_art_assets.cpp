/**
 * @file tests/unit/test_process_art_assets.cpp
 * @brief Art-role contract tests for proc_t::get_app_asset().
 */

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
      poster = touch("poster.png");
      poster_hires = touch("poster-hires.png");
      hero = touch("hero.png");
      screenshot = touch("shot.png");
    }

    ~art_fixture_t() {
      std::error_code ec;
      std::filesystem::remove_all(dir, ec);
    }

    std::filesystem::path touch(const char *name) {
      const auto path = dir / name;
      std::ofstream(path.string()).put('\0');
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
