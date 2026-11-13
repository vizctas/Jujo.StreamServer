/**
 * @file tests/unit/test_watchdog.cpp
 * @brief Deterministic unit tests for Server Watchdog threshold and process policy.
 */
#include <src/watchdog.h>

#include <gtest/gtest.h>

namespace {
  constexpr std::uint64_t kGiB = 1024ULL * 1024ULL * 1024ULL;
  constexpr std::uint64_t kMiB = 1024ULL * 1024ULL;
}

TEST(WatchdogPolicy, ComputesThresholdsAndRespectsTotalRamCap) {
  using watchdog::policy::compute_thresholds;

  const auto low_sens = compute_thresholds(1, 32 * kGiB);
  const auto mid_sens = compute_thresholds(50, 32 * kGiB);
  const auto high_sens = compute_thresholds(100, 32 * kGiB);

  EXPECT_GT(low_sens.max_cpu_percent, mid_sens.max_cpu_percent);
  EXPECT_GT(mid_sens.max_cpu_percent, high_sens.max_cpu_percent);
  EXPECT_LT(low_sens.min_avail_ram_bytes, mid_sens.min_avail_ram_bytes);
  EXPECT_LT(mid_sens.min_avail_ram_bytes, high_sens.min_avail_ram_bytes);

  // On an 8 GiB system at sensitivity 100 (raw 6 GiB), cap stays at <= 35% of 8 GiB.
  const auto small_ram = compute_thresholds(100, 8 * kGiB);
  EXPECT_LE(small_ram.min_avail_ram_bytes, static_cast<std::uint64_t>(8 * kGiB * 0.35) + 1);
}

TEST(WatchdogPolicy, EvaluatesPressureAndDisabledBypass) {
  using watchdog::policy::evaluate_thresholds;

  const auto ok = evaluate_thresholds(true, 50, 30.0, 50, 32 * kGiB, 16 * kGiB);
  EXPECT_TRUE(ok.ready);
  EXPECT_TRUE(ok.raw_ready);
  EXPECT_FALSE(ok.cpu_pressure);
  EXPECT_FALSE(ok.ram_pressure);

  const auto cpu_busy = evaluate_thresholds(true, 50, 80.0, 50, 32 * kGiB, 16 * kGiB);
  EXPECT_FALSE(cpu_busy.ready);
  EXPECT_FALSE(cpu_busy.raw_ready);
  EXPECT_TRUE(cpu_busy.cpu_pressure);
  EXPECT_FALSE(cpu_busy.ram_pressure);

  const auto low_ram = evaluate_thresholds(true, 50, 20.0, 85, 32 * kGiB, 2 * kGiB);
  EXPECT_FALSE(low_ram.ready);
  EXPECT_FALSE(low_ram.raw_ready);
  EXPECT_TRUE(low_ram.ram_pressure);

  // Disabled watchdog must never block launch even under pressure, while keeping raw_ready honest.
  const auto disabled = evaluate_thresholds(false, 80, 95.0, 92, 32 * kGiB, 1 * kGiB);
  EXPECT_TRUE(disabled.ready);
  EXPECT_FALSE(disabled.raw_ready);
  EXPECT_TRUE(disabled.cpu_pressure);
  EXPECT_TRUE(disabled.ram_pressure);
}

TEST(WatchdogPolicy, StrictlyProtectsOsStreamingAndActiveGameProcesses) {
  using namespace watchdog::policy;
  const std::wstring app_dir = L"C:\\Program Files\\JujoStreamServer";
  const std::unordered_set<std::uint32_t> active_games {7777};

  EXPECT_TRUE(is_protected(classify_process(L"System", L"", app_dir, 4, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"svchost.exe", L"C:\\Windows\\System32\\svchost.exe", app_dir, 200, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"dwm.exe", L"C:\\Windows\\System32\\dwm.exe", app_dir, 300, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"explorer.exe", L"C:\\Windows\\explorer.exe", app_dir, 400, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"sunshine.exe", L"C:\\Program Files\\JujoStreamServer\\sunshine.exe", app_dir, 1000, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"playnite-launcher.exe", L"C:\\Program Files\\JujoStreamServer\\tools\\playnite-launcher.exe", app_dir, 1001, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"steam.exe", L"C:\\Program Files (x86)\\Steam\\steam.exe", app_dir, 1002, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"vigembus.exe", L"C:\\ProgramData\\vigem\\vigembus.exe", app_dir, 1003, 1000, active_games)));
  EXPECT_TRUE(is_protected(classify_process(L"game.exe", L"D:\\Games\\Game\\game.exe", app_dir, 7777, 1000, active_games)));
}

TEST(WatchdogPolicy, ClassifiesSafeHeavyAppsAndUnknownProcesses) {
  using namespace watchdog::policy;
  const std::wstring app_dir = L"C:\\Program Files\\JujoStreamServer";
  const std::unordered_set<std::uint32_t> active_games;

  const auto chrome = classify_process(L"chrome.exe", L"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", app_dir, 2001, 1000, active_games);
  EXPECT_EQ(chrome, watchdog::process_category_e::safe_browser);
  EXPECT_TRUE(is_recommended_safe(chrome));
  EXPECT_TRUE(should_include_group(chrome, 256 * kMiB, 1.0));

  const auto slack = classify_process(L"Slack.exe", L"C:\\Users\\Jozh\\AppData\\Local\\slack\\Slack.exe", app_dir, 2002, 1000, active_games);
  EXPECT_EQ(slack, watchdog::process_category_e::safe_chat);
  EXPECT_TRUE(is_recommended_safe(slack));

  const auto armoury = classify_process(L"ArmouryCrate.UserSessionHelper.exe", L"C:\\Program Files\\ASUS\\Armoury Crate\\ArmouryCrate.UserSessionHelper.exe", app_dir, 2003, 1000, active_games);
  EXPECT_EQ(armoury, watchdog::process_category_e::safe_utility);
  EXPECT_TRUE(is_recommended_safe(armoury));

  const auto other = classify_process(L"CustomTool.exe", L"D:\\Tools\\CustomTool.exe", app_dir, 2004, 1000, active_games);
  EXPECT_EQ(other, watchdog::process_category_e::heavy_other);
  EXPECT_FALSE(is_recommended_safe(other));
  EXPECT_FALSE(should_include_group(other, 80 * kMiB, 0.5));
  EXPECT_TRUE(should_include_group(other, 250 * kMiB, 0.5));
}

