#include <array>
#include <fstream>

#include <src/artwork.h>

#include "../tests_common.h"

namespace {
  std::filesystem::path write_png_header(
    const std::filesystem::path &path,
    std::uint32_t width,
    std::uint32_t height
  ) {
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
}

TEST(Artwork, RejectsHtmlSavedWithImageExtension) {
  const auto path = std::filesystem::temp_directory_path() / "jujo_art_404.jpg";
  std::ofstream(path) << "<html><h1>404 Not Found</h1></html>";
  EXPECT_FALSE(artwork::inspect(path).has_value());
  std::filesystem::remove(path);
}

TEST(Artwork, KeepsPosterAndHeroRolesSeparate) {
  const auto root = std::filesystem::temp_directory_path();
  const auto poster = write_png_header(root / "jujo_art_poster.png", 600, 900);
  const auto hero = write_png_header(root / "jujo_art_hero.png", 1920, 1080);
  const auto panoramic_hero = write_png_header(root / "jujo_art_panoramic_hero.png", 3840, 1240);

  EXPECT_TRUE(artwork::valid_for_role(poster, artwork::role_e::poster));
  EXPECT_FALSE(artwork::valid_for_role(poster, artwork::role_e::hero));
  EXPECT_TRUE(artwork::valid_for_role(hero, artwork::role_e::hero));
  EXPECT_TRUE(artwork::valid_for_role(panoramic_hero, artwork::role_e::hero));
  EXPECT_FALSE(artwork::valid_for_role(hero, artwork::role_e::poster));

  std::filesystem::remove(poster);
  std::filesystem::remove(hero);
  std::filesystem::remove(panoramic_hero);
}
