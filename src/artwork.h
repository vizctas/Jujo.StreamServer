/**
 * @file src/artwork.h
 * @brief Lightweight image inspection and semantic artwork validation.
 */
#pragma once

#include <cstdint>
#include <filesystem>
#include <optional>
#include <string_view>

namespace artwork {
  enum class format_e {
    jpeg,
    png,
    webp,
  };

  enum class role_e {
    poster,
    hero,
    gallery,
  };

  struct image_info_t {
    format_e format;
    std::uint32_t width;
    std::uint32_t height;
    std::uintmax_t file_size;
  };

  std::optional<image_info_t> inspect(const std::filesystem::path &path);
  bool valid_for_role(const std::filesystem::path &path, role_e role);
  std::string_view content_type(format_e format);
  bool is_remote_url(std::string_view value);
}  // namespace artwork
