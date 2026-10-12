#pragma once

#include <cstdint>
#include <list>
#include <vector>

extern "C" {
#include <moonlight-common-c/src/Input.h>
}

namespace input {
  enum class batch_result_e {
    batched,
    not_batchable,
    terminate_batch,
  };

  // Packets must pass input validation first. Only dest may be modified.
  batch_result_e batch(PNV_INPUT_HEADER dest, PNV_INPUT_HEADER src);

  // Caller holds the queue lock; packets have already passed validation.
  std::vector<std::uint8_t> take_batch(std::list<std::vector<std::uint8_t>> &queue);
}  // namespace input
