/**
 * @file file_handler.cpp
 * @brief Definitions for file handling functions.
 */

// standard includes
#include <filesystem>
#include <fstream>
#include <mutex>

// local includes
#include "file_handler.h"
#include "logging.h"

namespace file_handler {
  std::string get_parent_directory(const std::string &path) {
    // remove any trailing path separators
    std::string trimmed_path = path;
    while (!trimmed_path.empty() && trimmed_path.back() == '/') {
      trimmed_path.pop_back();
    }

    std::filesystem::path p(trimmed_path);
    return p.parent_path().string();
  }

  bool make_directory(const std::string &path) {
    // first, check if the directory already exists
    if (std::filesystem::exists(path)) {
      return true;
    }

    return std::filesystem::create_directories(path);
  }

  std::string read_file(const char *path) {
    if (!std::filesystem::exists(path)) {
      BOOST_LOG(debug) << "Missing file: " << path;
      return {};
    }

    std::ifstream in(path);
    return std::string {(std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>()};
  }

  int write_file(const char *path, const std::string_view &contents) {
    static std::mutex file_write_mutex;
    std::lock_guard<std::mutex> lock(file_write_mutex);

    std::string tmp_path = std::string(path) + ".tmp";
    std::filesystem::path target_path(path);

    {
      std::ofstream out(tmp_path);
      if (!out.is_open()) {
        BOOST_LOG(error) << "Failed to open temp file for writing: "sv << tmp_path;
        return -1;
      }
      out << contents;
      if (!out) {
        BOOST_LOG(error) << "Failed to write temp file: "sv << tmp_path;
        return -1;
      }
    }

    std::error_code ec;
    std::filesystem::rename(tmp_path, target_path, ec);
    if (ec) {
      BOOST_LOG(error) << "Failed to atomically replace file: "sv << path << " - "sv << ec.message();
      std::filesystem::remove(tmp_path, ec);
      return -1;
    }

    return 0;
  }
}  // namespace file_handler
