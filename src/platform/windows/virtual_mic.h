/**
 * @file src/platform/windows/virtual_mic.h
 * @brief Windows virtual microphone factory declaration.
 *
 * The virtual microphone writes client audio to a WASAPI render endpoint.
 * Other applications can pick it up via WASAPI loopback capture on that device.
 */
#pragma once

#include <memory>
#include <string>

#include "src/platform/common.h"

namespace platf::audio {
  /**
   * @brief Create a Windows virtual microphone backed by a WASAPI render endpoint.
   *
   * @param device_name Windows device ID of the render endpoint to write audio to.
   *                    Pass an empty string to use the current default render device.
   * @param channels    Number of audio channels (1 or 2).
   * @param sample_rate Sample rate in Hz (e.g. 48000).
   * @param frame_size  Hint: number of frames per push() call (unused on Windows).
   * @return Pointer to the virtual mic, or nullptr on failure.
   */
  std::unique_ptr<platf::virtual_mic_t> make_virtual_microphone(
    const std::string &device_name,
    int channels,
    uint32_t sample_rate,
    uint32_t frame_size);
}  // namespace platf::audio
