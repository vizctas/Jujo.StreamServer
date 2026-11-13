/**
 * @file src/watchdog_policy.cpp
 * @brief Pure policy helpers for Server Watchdog threshold calculation and process safety.
 */
#include "watchdog.h"

#include <algorithm>
#include <cctype>
#include <cwctype>
#include <string>
#include <unordered_map>

namespace watchdog::policy {
  namespace {
    bool contains_any(std::wstring_view haystack, std::initializer_list<std::wstring_view> needles) {
      for (const auto needle : needles) {
        if (haystack.find(needle) != std::wstring_view::npos) {
          return true;
        }
      }
      return false;
    }

    bool starts_with_any(std::wstring_view value, std::initializer_list<std::wstring_view> prefixes) {
      for (const auto prefix : prefixes) {
        if (value.starts_with(prefix)) {
          return true;
        }
      }
      return false;
    }

    bool is_under_dir(std::wstring_view path, std::wstring_view dir) {
      if (path.empty() || dir.empty() || path.size() <= dir.size()) {
        return false;
      }
      return path.starts_with(dir) && path[dir.size()] == L'\\';
    }
  }  // namespace

  std::wstring normalize_lower(std::wstring_view value) {
    std::wstring result(value);
    std::replace(result.begin(), result.end(), L'/', L'\\');
    while (result.size() > 3 && result.back() == L'\\') {
      result.pop_back();
    }
    std::transform(result.begin(), result.end(), result.begin(), [](wchar_t ch) {
      return static_cast<wchar_t>(std::towlower(ch));
    });
    return result;
  }

  std::string normalize_ascii_lower(std::string_view value) {
    std::string result(value);
    std::transform(result.begin(), result.end(), result.begin(), [](unsigned char ch) {
      return static_cast<char>(std::tolower(ch));
    });
    return result;
  }

  thresholds_t compute_thresholds(int sensitivity, std::uint64_t total_ram_bytes) {
    const int clamped = std::clamp(sensitivity, 1, 100);
    const double s = static_cast<double>(clamped);

    constexpr double kGiB = 1024.0 * 1024.0 * 1024.0;
    const auto desired_min_bytes = static_cast<std::uint64_t>((1.0 + (s / 100.0) * 5.0) * kGiB);
    std::uint64_t capped_min_bytes = desired_min_bytes;
    if (total_ram_bytes > 0) {
      const auto max_fraction = static_cast<std::uint64_t>(static_cast<double>(total_ram_bytes) * 0.35);
      capped_min_bytes = std::min(desired_min_bytes, max_fraction);
    }

    return thresholds_t {
      .sensitivity = clamped,
      .max_cpu_percent = 95.0 - (s * 0.55),
      .max_memory_load_percent = 96.0 - (s * 0.26),
      .min_avail_ram_bytes = capped_min_bytes,
    };
  }

  evaluation_t evaluate_thresholds(
    bool enabled,
    int sensitivity,
    double cpu_percent,
    int mem_load_percent,
    std::uint64_t total_ram_bytes,
    std::uint64_t avail_ram_bytes
  ) {
    const thresholds_t th = compute_thresholds(sensitivity, total_ram_bytes);
    const bool cpu_pressure = cpu_percent >= th.max_cpu_percent;
    const bool avail_pressure = total_ram_bytes > 0 && avail_ram_bytes < th.min_avail_ram_bytes;
    const bool load_pressure = static_cast<double>(mem_load_percent) >= th.max_memory_load_percent;
    const bool ram_pressure = avail_pressure || load_pressure;
    const bool raw_ready = !cpu_pressure && !ram_pressure;

    return evaluation_t {
      .enabled = enabled,
      .ready = !enabled || raw_ready,
      .raw_ready = raw_ready,
      .cpu_pressure = cpu_pressure,
      .ram_pressure = ram_pressure,
      .cpu_usage_percent = cpu_percent,
      .memory_load_percent = mem_load_percent,
      .total_ram_bytes = total_ram_bytes,
      .avail_ram_bytes = avail_ram_bytes,
      .thresholds = th,
    };
  }

  process_category_e classify_process(
    std::wstring_view exe_name,
    std::wstring_view full_path,
    std::wstring_view app_dir,
    std::uint32_t pid,
    std::uint32_t self_pid,
    const std::unordered_set<std::uint32_t> &protected_game_pids
  ) {
    if (pid <= 4 || (self_pid > 0 && pid == self_pid)) {
      return process_category_e::protected_system;
    }
    if (protected_game_pids.contains(pid)) {
      return process_category_e::protected_game;
    }

    const std::wstring exe = normalize_lower(exe_name);
    const std::wstring path = normalize_lower(full_path);
    const std::wstring dir = normalize_lower(app_dir);

    if (exe.empty()) {
      return process_category_e::protected_system;
    }

    if (is_under_dir(path, dir)) {
      return process_category_e::protected_streaming;
    }

    // Core Windows OS directories (System32, SysWOW64, WinSxS, etc.)
    if (contains_any(path, {L":\\windows\\"})) {
      return process_category_e::protected_system;
    }

    static const std::unordered_set<std::wstring_view> kProtectedSystem = {
      L"idle",
      L"system",
      L"registry",
      L"memory compression",
      L"smss.exe",
      L"csrss.exe",
      L"wininit.exe",
      L"services.exe",
      L"lsass.exe",
      L"lsaiso.exe",
      L"winlogon.exe",
      L"fontdrvhost.exe",
      L"dwm.exe",
      L"sihost.exe",
      L"taskhostw.exe",
      L"explorer.exe",
      L"shellexperiencehost.exe",
      L"startmenuexperiencehost.exe",
      L"searchhost.exe",
      L"searchindexer.exe",
      L"ctfmon.exe",
      L"conhost.exe",
      L"openconsole.exe",
      L"runtimebroker.exe",
      L"dllhost.exe",
      L"svchost.exe",
      L"audiodg.exe",
      L"spoolsv.exe",
      L"wudfhost.exe",
      L"dashost.exe",
      L"msmpeng.exe",
      L"nissrv.exe",
      L"securityhealthservice.exe",
      L"vmmem",
      L"vmmemwsl",
    };
    if (kProtectedSystem.contains(exe)) {
      return process_category_e::protected_system;
    }

    static const std::unordered_set<std::wstring_view> kProtectedStreamingAndLaunchers = {
      L"sunshine.exe",
      L"jujostreamserver.exe",
      L"jujo.streamserver.exe",
      L"jujo_server.exe",
      L"jujo_admin.exe",
      L"jujo.streamadmin.exe",
      L"rtss.exe",
      L"rtsshooksloader64.exe",
      L"encoder.exe",
      L"nefconw.exe",
      L"nvcontainer.exe",
      L"nvdisplay.container.exe",
      L"amddvr.exe",
      L"radeonsoftware.exe",
      L"playnite.fullscreenapp.exe",
      L"playnite.desktopapp.exe",
      L"playnite-launcher.exe",
      L"steam.exe",
      L"steamservice.exe",
      L"steamwebhelper.exe",
      L"epicgameslauncher.exe",
      L"upc.exe",
      L"eadesktop.exe",
      L"eabackgroundservice.exe",
      L"gog galaxy.exe",
      L"battlenet.exe",
      L"xboxapp.exe",
      L"gamingservices.exe",
      L"gamingservicesnet.exe",
    };
    if (kProtectedStreamingAndLaunchers.contains(exe) ||
        starts_with_any(exe, {L"vigem", L"sudovda", L"vdisplay", L"ddhelper", L"jujo"})) {
      return process_category_e::protected_streaming;
    }

    static const std::unordered_set<std::wstring_view> kSafeBrowsers = {
      L"chrome.exe",
      L"msedge.exe",
      L"firefox.exe",
      L"brave.exe",
      L"opera.exe",
      L"opera_gx.exe",
      L"vivaldi.exe",
      L"arc.exe",
      L"waterfox.exe",
      L"librewolf.exe",
      L"floorp.exe",
      L"chromium.exe",
      L"zen.exe",
    };
    if (kSafeBrowsers.contains(exe)) {
      return process_category_e::safe_browser;
    }

    static const std::unordered_set<std::wstring_view> kSafeChat = {
      L"whatsapp.exe",
      L"whatsapp.root.exe",
      L"slack.exe",
      L"discord.exe",
      L"discordptb.exe",
      L"discordcanary.exe",
      L"telegram.exe",
      L"teams.exe",
      L"ms-teams.exe",
      L"signal.exe",
      L"zoom.exe",
      L"skype.exe",
      L"element.exe",
      L"viber.exe",
      L"line.exe",
    };
    if (kSafeChat.contains(exe)) {
      return process_category_e::safe_chat;
    }

    static const std::unordered_set<std::wstring_view> kSafeUtilities = {
      L"armourycrate.exe",
      L"armourycrate.usersessionhelper.exe",
      L"armourycratecontrolinterface.exe",
      L"armourycrateswagent.exe",
      L"acpowernotification.exe",
      L"asus_framework.exe",
      L"asusoptimization.exe",
      L"asussoftwaremanager.exe",
      L"asusosd.exe",
      L"myasus.exe",
      L"icue.exe",
      L"corsair.service.exe",
      L"razer synapse 3.exe",
      L"razer central.exe",
      L"rzsynapse.exe",
      L"lghub.exe",
      L"lghub_agent.exe",
      L"lghub_updater.exe",
      L"msicenter.exe",
      L"dragon center.exe",
      L"omencommandcenter.exe",
      L"omenhub.exe",
      L"awcc.exe",
      L"overwolf.exe",
      L"overwolfbrowser.exe",
      L"curseforge.exe",
      L"onedrive.exe",
      L"dropbox.exe",
      L"googledrivesync.exe",
      L"spotify.exe",
      L"itunes.exe",
      L"applemusic.exe",
      L"docker desktop.exe",
      L"com.docker.backend.exe",
      L"creative cloud.exe",
      L"adobearm.exe",
      L"adobeipcbroker.exe",
      L"ccxprocess.exe",
      L"wallpaper32.exe",
      L"wallpaper64.exe",
      L"medal.exe",
      L"medalencoder.exe",
      L"outplayed.exe",
      L"notion.exe",
      L"obsidian.exe",
      L"postman.exe",
    };
    if (kSafeUtilities.contains(exe) || starts_with_any(exe, {L"armourycrate", L"asus"})) {
      return process_category_e::safe_utility;
    }

    return process_category_e::heavy_other;
  }

  bool is_protected(process_category_e category) {
    return category == process_category_e::protected_system ||
           category == process_category_e::protected_streaming ||
           category == process_category_e::protected_game;
  }

  bool is_recommended_safe(process_category_e category) {
    return category == process_category_e::safe_browser ||
           category == process_category_e::safe_chat ||
           category == process_category_e::safe_utility;
  }

  std::string category_key(process_category_e category) {
    switch (category) {
      case process_category_e::safe_browser:
        return "browser";
      case process_category_e::safe_chat:
        return "chat";
      case process_category_e::safe_utility:
        return "utility";
      case process_category_e::heavy_other:
        return "other";
      case process_category_e::protected_system:
      case process_category_e::protected_streaming:
      case process_category_e::protected_game:
        return "protected";
    }
    return "other";
  }

  std::string friendly_app_name(std::string_view exe_id) {
    static const std::unordered_map<std::string_view, std::string_view> kNames = {
      {"chrome.exe", "Google Chrome"},
      {"msedge.exe", "Microsoft Edge"},
      {"firefox.exe", "Mozilla Firefox"},
      {"brave.exe", "Brave Browser"},
      {"opera.exe", "Opera"},
      {"opera_gx.exe", "Opera GX"},
      {"vivaldi.exe", "Vivaldi"},
      {"whatsapp.exe", "WhatsApp"},
      {"whatsapp.root.exe", "WhatsApp"},
      {"slack.exe", "Slack"},
      {"discord.exe", "Discord"},
      {"discordptb.exe", "Discord PTB"},
      {"discordcanary.exe", "Discord Canary"},
      {"telegram.exe", "Telegram"},
      {"teams.exe", "Microsoft Teams"},
      {"ms-teams.exe", "Microsoft Teams"},
      {"signal.exe", "Signal"},
      {"zoom.exe", "Zoom"},
      {"armourycrate.exe", "Armoury Crate"},
      {"armourycrate.usersessionhelper.exe", "Armoury Crate Helper"},
      {"icue.exe", "Corsair iCUE"},
      {"lghub.exe", "Logitech G HUB"},
      {"msicenter.exe", "MSI Center"},
      {"overwolf.exe", "Overwolf"},
      {"onedrive.exe", "OneDrive"},
      {"spotify.exe", "Spotify"},
      {"docker desktop.exe", "Docker Desktop"},
      {"creative cloud.exe", "Adobe Creative Cloud"},
    };
    const std::string lower = normalize_ascii_lower(exe_id);
    if (const auto it = kNames.find(lower); it != kNames.end()) {
      return std::string(it->second);
    }
    std::string stem = lower;
    if (stem.ends_with(".exe")) {
      stem.resize(stem.size() - 4);
    }
    if (!stem.empty()) {
      stem[0] = static_cast<char>(std::toupper(static_cast<unsigned char>(stem[0])));
    }
    return stem;
  }

  bool should_include_group(
    process_category_e category,
    std::uint64_t ram_bytes,
    double cpu_percent
  ) {
    if (is_protected(category)) {
      return false;
    }
    if (is_recommended_safe(category)) {
      return ram_bytes >= kCuratedMinRamBytes || cpu_percent >= 1.5;
    }
    return ram_bytes >= kOtherMinRamBytes || cpu_percent >= kOtherMinCpuPercent;
  }
}  // namespace watchdog::policy

