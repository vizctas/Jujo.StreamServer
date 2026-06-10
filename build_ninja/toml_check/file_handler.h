// Standalone-test stub for src/file_handler.h (simple fstream implementation
// lives in check_main.cpp).
#pragma once
#include <string>
#include <string_view>

namespace file_handler {
  std::string read_file(const char *path);
  int write_file(const char *path, const std::string_view &contents);
}  // namespace file_handler
