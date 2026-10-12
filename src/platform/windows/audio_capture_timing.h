#pragma once

#include <algorithm>
#include <cstdint>
#include <limits>

namespace platf::audio {
  // Convert the WASAPI period (100 ns units) to a finite event wait in ms.
  constexpr std::uint32_t capture_wait_ms(std::int64_t period) {
    if (period <= 0) {
      return 1;
    }
    // Divide before rounding, so even INT64_MAX cannot overflow. Keep the
    // DWORD value below INFINITE rather than wrapping a malformed period.
    const auto rounded_ms = period / 10'000 + (period % 10'000 != 0);
    constexpr auto max_finite = std::numeric_limits<std::uint32_t>::max() - 1;
    return static_cast<std::uint32_t>(std::min<std::int64_t>(rounded_ms, max_finite));
  }
}  // namespace platf::audio
