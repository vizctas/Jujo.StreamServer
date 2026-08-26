/**
 * @file src/artwork.cpp
 * @brief Lightweight image parsing sufficient to reject HTML and wrong roles.
 */

#include "artwork.h"

#include <algorithm>
#include <array>
#include <fstream>
#include <vector>

namespace {
  constexpr std::uintmax_t min_image_bytes = 32;
  constexpr std::uintmax_t max_image_bytes = 32ULL * 1024ULL * 1024ULL;
  constexpr std::size_t probe_bytes = 256ULL * 1024ULL;

  std::uint16_t be16(const std::vector<unsigned char> &data, std::size_t offset) {
    return static_cast<std::uint16_t>((data[offset] << 8U) | data[offset + 1]);
  }

  std::uint32_t be32(const std::vector<unsigned char> &data, std::size_t offset) {
    return (static_cast<std::uint32_t>(data[offset]) << 24U) |
           (static_cast<std::uint32_t>(data[offset + 1]) << 16U) |
           (static_cast<std::uint32_t>(data[offset + 2]) << 8U) |
           static_cast<std::uint32_t>(data[offset + 3]);
  }

  std::uint32_t le24(const std::vector<unsigned char> &data, std::size_t offset) {
    return static_cast<std::uint32_t>(data[offset]) |
           (static_cast<std::uint32_t>(data[offset + 1]) << 8U) |
           (static_cast<std::uint32_t>(data[offset + 2]) << 16U);
  }

  std::optional<std::pair<std::uint32_t, std::uint32_t>> jpeg_dimensions(
    const std::vector<unsigned char> &data
  ) {
    if (data.size() < 4 || data[0] != 0xFF || data[1] != 0xD8) return std::nullopt;
    std::size_t offset = 2;
    while (offset + 4 <= data.size()) {
      while (offset < data.size() && data[offset] == 0xFF) ++offset;
      if (offset >= data.size()) break;
      const auto marker = data[offset++];
      if (marker == 0xD8 || marker == 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) continue;
      if (offset + 2 > data.size()) break;
      const auto length = be16(data, offset);
      if (length < 2 || offset + length > data.size()) break;
      const bool is_sof =
        (marker >= 0xC0 && marker <= 0xC3) ||
        (marker >= 0xC5 && marker <= 0xC7) ||
        (marker >= 0xC9 && marker <= 0xCB) ||
        (marker >= 0xCD && marker <= 0xCF);
      if (is_sof && length >= 7) {
        const auto height = be16(data, offset + 3);
        const auto width = be16(data, offset + 5);
        if (width > 0 && height > 0) return std::pair {width, height};
      }
      offset += length;
    }
    return std::nullopt;
  }

  std::optional<std::pair<std::uint32_t, std::uint32_t>> webp_dimensions(
    const std::vector<unsigned char> &data
  ) {
    if (data.size() < 30 || !std::equal(data.begin(), data.begin() + 4, "RIFF") ||
        !std::equal(data.begin() + 8, data.begin() + 12, "WEBP")) {
      return std::nullopt;
    }
    if (std::equal(data.begin() + 12, data.begin() + 16, "VP8X")) {
      return std::pair {le24(data, 24) + 1, le24(data, 27) + 1};
    }
    if (std::equal(data.begin() + 12, data.begin() + 16, "VP8L") && data[20] == 0x2F) {
      const auto width = 1U + data[21] + ((data[22] & 0x3FU) << 8U);
      const auto height =
        1U + (data[22] >> 6U) + (static_cast<std::uint32_t>(data[23]) << 2U) +
        ((data[24] & 0x0FU) << 10U);
      return std::pair {width, height};
    }
    if (std::equal(data.begin() + 12, data.begin() + 16, "VP8 ") &&
        data[23] == 0x9D && data[24] == 0x01 && data[25] == 0x2A) {
      const auto width = static_cast<std::uint32_t>(data[26] | (data[27] << 8U)) & 0x3FFFU;
      const auto height = static_cast<std::uint32_t>(data[28] | (data[29] << 8U)) & 0x3FFFU;
      return std::pair {width, height};
    }
    return std::nullopt;
  }
}  // namespace

namespace artwork {
  std::optional<image_info_t> inspect(const std::filesystem::path &path) {
    std::error_code ec;
    if (!std::filesystem::exists(path, ec) || !std::filesystem::is_regular_file(path, ec)) {
      return std::nullopt;
    }
    const auto size = std::filesystem::file_size(path, ec);
    if (ec || size < min_image_bytes || size > max_image_bytes) return std::nullopt;

    std::ifstream input(path, std::ios::binary);
    if (!input) return std::nullopt;
    const auto read_size = static_cast<std::size_t>(std::min<std::uintmax_t>(size, probe_bytes));
    std::vector<unsigned char> data(read_size);
    input.read(reinterpret_cast<char *>(data.data()), static_cast<std::streamsize>(data.size()));
    data.resize(static_cast<std::size_t>(input.gcount()));

    static constexpr std::array<unsigned char, 8> png_signature {
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };
    if (data.size() >= 24 && std::equal(png_signature.begin(), png_signature.end(), data.begin())) {
      const auto width = be32(data, 16);
      const auto height = be32(data, 20);
      if (width > 0 && height > 0) return image_info_t {format_e::png, width, height, size};
      return std::nullopt;
    }

    if (auto dimensions = jpeg_dimensions(data)) {
      return image_info_t {format_e::jpeg, dimensions->first, dimensions->second, size};
    }
    if (auto dimensions = webp_dimensions(data)) {
      return image_info_t {format_e::webp, dimensions->first, dimensions->second, size};
    }
    return std::nullopt;
  }

  bool valid_for_role(const std::filesystem::path &path, role_e role) {
    const auto info = inspect(path);
    if (!info) return false;
    const auto aspect = static_cast<double>(info->width) / info->height;
    switch (role) {
      case role_e::poster:
        return info->width >= 300 && info->height >= 450 && aspect >= 0.5 && aspect <= 0.9;
      case role_e::hero:
        // Dedicated library heroes are not universally 16:9. Steam's
        // library_hero, for example, is an intentional panoramic banner.
        // The lower bound is what prevents portrait covers crossing roles.
        return info->width >= 960 && info->height >= 360 && aspect >= 1.4 && aspect <= 4.2;
      case role_e::gallery:
        return info->width >= 640 && info->height >= 360 && aspect >= 1.2;
    }
    return false;
  }

  std::string_view content_type(format_e format) {
    switch (format) {
      case format_e::jpeg:
        return "image/jpeg";
      case format_e::png:
        return "image/png";
      case format_e::webp:
        return "image/webp";
    }
    return "application/octet-stream";
  }

  bool is_remote_url(std::string_view value) {
    return value.starts_with("http://") || value.starts_with("https://");
  }
}  // namespace artwork
