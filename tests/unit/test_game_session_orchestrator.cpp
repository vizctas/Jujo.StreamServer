/**
 * @file tests/unit/test_game_session_orchestrator.cpp
 * @brief Deterministic safety-policy tests for Windows game session ownership.
 */

#ifdef _WIN32

#include <src/platform/windows/game_session_orchestrator.h>

#include <gtest/gtest.h>

namespace {
  constexpr std::uint64_t launch_time = 50ULL * 10000000ULL;

  game_session::process_record_t record(
    DWORD pid,
    DWORD parent,
    std::uint64_t creation,
    std::wstring path
  ) {
    return {{pid, creation}, parent, std::move(path)};
  }
}

TEST(GameSessionPolicy, RejectsBroadAndSystemRoots) {
  using game_session::policy::is_safe_game_root;

  EXPECT_FALSE(is_safe_game_root(L""));
  EXPECT_FALSE(is_safe_game_root(L"C:\\"));
  EXPECT_FALSE(is_safe_game_root(L"C:\\Windows"));
  EXPECT_FALSE(is_safe_game_root(L"C:\\Windows\\System32"));
  EXPECT_FALSE(is_safe_game_root(L"C:\\ProgramData"));
  EXPECT_FALSE(is_safe_game_root(L"C:\\Program Files (x86)\\Steam"));
  EXPECT_TRUE(is_safe_game_root(L"G:\\Games\\TEKKEN 8\\Polaris\\Binaries\\Win64"));
}

TEST(GameSessionPolicy, RootMatchingHonorsDirectoryBoundaries) {
  using game_session::policy::path_is_under_root;

  const std::wstring root = L"G:\\Games\\TEKKEN 8";
  EXPECT_TRUE(path_is_under_root(
    L"G:\\Games\\TEKKEN 8\\Polaris\\Binaries\\Win64\\Polaris-Win64-Shipping.exe",
    root
  ));
  EXPECT_FALSE(path_is_under_root(
    L"G:\\Games\\TEKKEN 80\\unrelated.exe",
    root
  ));
}

TEST(GameSessionPolicy, BaselineIdentityCannotBeAdopted) {
  game_session::process_baseline_t baseline {{42, launch_time - 1000}};
  const auto preexisting = record(
    42,
    1,
    launch_time - 1000,
    L"G:\\Games\\TEKKEN 8\\Polaris.exe"
  );

  EXPECT_FALSE(game_session::policy::is_new_since_launch(preexisting, baseline, launch_time));
  EXPECT_FALSE(game_session::policy::should_adopt(
    preexisting,
    0,
    baseline,
    launch_time,
    {},
    {L"G:\\Games\\TEKKEN 8"}
  ));
}

TEST(GameSessionPolicy, PidReuseRequiresTheNewCreationIdentity) {
  game_session::process_baseline_t baseline {{42, launch_time - 1000}};
  const auto reused = record(
    42,
    1,
    launch_time + 1000,
    L"G:\\Games\\TEKKEN 8\\Polaris.exe"
  );

  EXPECT_TRUE(game_session::policy::is_new_since_launch(reused, baseline, launch_time));
  EXPECT_TRUE(game_session::policy::should_adopt(
    reused,
    0,
    baseline,
    launch_time,
    {},
    {L"G:\\Games\\TEKKEN 8"}
  ));
}

TEST(GameSessionPolicy, AdoptsOnlyNewDirectDescendantOrRootProcess) {
  const game_session::process_baseline_t baseline;
  const std::vector<std::wstring> roots {L"G:\\Games\\TEKKEN 8"};

  EXPECT_TRUE(game_session::policy::should_adopt(
    record(100, 4, launch_time + 1, L"C:\\Windows\\System32\\cmd.exe"),
    100,
    baseline,
    launch_time,
    {},
    roots
  ));

  EXPECT_TRUE(game_session::policy::should_adopt(
    record(101, 100, launch_time + 2, L"D:\\Bootstrap\\anti-cheat.exe"),
    0,
    baseline,
    launch_time,
    {100},
    roots
  ));

  EXPECT_TRUE(game_session::policy::should_adopt(
    record(102, 500, launch_time + 3, L"G:\\Games\\TEKKEN 8\\Polaris.exe"),
    0,
    baseline,
    launch_time,
    {},
    roots
  ));

  EXPECT_FALSE(game_session::policy::should_adopt(
    record(103, 500, launch_time + 4, L"D:\\Other\\unrelated.exe"),
    0,
    baseline,
    launch_time,
    {},
    roots
  ));
}

TEST(GameSessionPolicy, NeverAdoptsSteamClientProcesses) {
  const game_session::process_baseline_t baseline;
  const std::vector<std::wstring> roots {L"C:\\Program Files (x86)\\Steam\\steamapps\\common\\TEKKEN 8"};

  EXPECT_FALSE(game_session::policy::should_adopt(
    record(200, 10, launch_time + 1, L"C:\\Program Files (x86)\\Steam\\steam.exe"),
    200,
    baseline,
    launch_time,
    {},
    roots
  ));
  EXPECT_FALSE(game_session::policy::should_adopt(
    record(201, 200, launch_time + 2, L"C:\\Program Files (x86)\\Steam\\steamwebhelper.exe"),
    0,
    baseline,
    launch_time,
    {200},
    roots
  ));
}

TEST(GameSessionPolicy, DetachedSteamLaunchRemainsRunningWhileOwnedGameLives) {
  using game_session::policy::detached_app_should_report_running;

  EXPECT_TRUE(detached_app_should_report_running(false, false, true, 0));
  EXPECT_TRUE(detached_app_should_report_running(false, false, false, 1));
  EXPECT_TRUE(detached_app_should_report_running(true, false, false, 0));
  EXPECT_FALSE(detached_app_should_report_running(false, false, false, 0));
}

#endif  // _WIN32
