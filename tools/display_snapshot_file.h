#pragma once

#include <windows.h>

#include <array>
#include <atomic>
#include <cerrno>
#include <cstdio>
#include <filesystem>
#include <io.h>
#include <string>
#include <string_view>

namespace display_snapshot_file {
  namespace fs = std::filesystem;

  // Both paths must be on the same volume. Never unlink the destination first.
  inline bool publish(const fs::path &staged, const fs::path &target) {
    return MoveFileExW(staged.c_str(), target.c_str(), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH) != 0;
  }

  inline std::atomic<unsigned long long> next_temp_id {0};

  template<class Writer>
  bool stage_and_publish(const fs::path &target, Writer write) {
    std::error_code ec;
    if (!target.parent_path().empty()) {
      fs::create_directories(target.parent_path(), ec);
      if (ec) {
        return false;
      }
    }

    for (int attempt = 0; attempt < 32; ++attempt) {
      auto staged = target;
      staged += L".tmp." + std::to_wstring(GetCurrentProcessId()) + L"." + std::to_wstring(next_temp_id.fetch_add(1));
      auto *file = _wfopen(staged.c_str(), L"wbx");  // exclusive create; never truncate a stale or concurrent writer's file
      if (!file) {
        if (errno == EEXIST) {
          continue;
        }
        return false;
      }
      const bool complete = write(file) && std::fflush(file) == 0 && _commit(_fileno(file)) == 0;
      const bool closed = std::fclose(file) == 0;
      if (complete && closed && publish(staged, target)) {
        return true;
      }
      fs::remove(staged, ec);
      return false;
    }
    return false;
  }

  inline bool save(const fs::path &target, std::string_view bytes) {
    return stage_and_publish(target, [&](FILE *file) {
      return std::fwrite(bytes.data(), 1, bytes.size(), file) == bytes.size();
    });
  }

  inline bool copy(const fs::path &source, const fs::path &target) {
    auto *input = _wfopen(source.c_str(), L"rb");
    if (!input) {
      return false;
    }
    const bool copied = stage_and_publish(target, [&](FILE *output) {
      std::array<char, 16384> buf;
      while (const auto n = std::fread(buf.data(), 1, buf.size(), input)) {
        if (std::fwrite(buf.data(), 1, n, output) != n) {
          return false;
        }
      }
      return std::feof(input) && !std::ferror(input);
    });
    std::fclose(input);
    return copied;
  }
}  // namespace display_snapshot_file
