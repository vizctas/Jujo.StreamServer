#pragma once

#include <algorithm>
#include <cstdint>

namespace slice_delivery {

  /// 3/4 of 3840x2160 (8,294,400 px); below this, slice overhead outweighs parallel decode gains.
  inline constexpr std::int64_t kFourKSliceMinPixels = 6'220'800LL;
  inline constexpr int kRecommended4KSlices = 4;
  inline constexpr int kMaxAllowedSlices = 8;

  /// True for >= 3/4 4K H.264 (0) or HEVC (1); never AV1 (2).
  [[nodiscard]] constexpr bool is_4k_slice_eligible(int width, int height, int video_format) noexcept {
    if (width <= 0 || height <= 0) {
      return false;
    }
    if (video_format != 0 && video_format != 1) {
      return false;
    }
    return static_cast<std::int64_t>(width) * static_cast<std::int64_t>(height) >= kFourKSliceMinPixels;
  }

  /// Resolves final encoder slice count across HW/SW paths while enforcing AV1 and <3/4 4K guards.
  [[nodiscard]] constexpr int resolve_slices(
    int width,
    int height,
    int video_format,
    int requested_slices,
    bool hardware,
    bool single_slice_only,
    int min_threads = 1
  ) noexcept {
    if (single_slice_only) {
      return 1;
    }
    const int base_req = std::max(1, requested_slices);
    if (!hardware) {
      return std::max(base_req, std::max(1, min_threads));
    }
    if (!is_4k_slice_eligible(width, height, video_format)) {
      return 1;
    }
    return std::clamp(base_req, 1, kMaxAllowedSlices);
  }

  /// Recommended client slice target (4 for 4K+ H.264/HEVC, else 1).
  [[nodiscard]] constexpr int recommended_slices(int width, int height, int video_format) noexcept {
    return is_4k_slice_eligible(width, height, video_format) ? kRecommended4KSlices : 1;
  }

}  // namespace slice_delivery
