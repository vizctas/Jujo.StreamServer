/**
 * @file src/platform/linux/virtual_mic.h
 * @brief Linux virtual microphone factory declaration.
 *
 * The virtual microphone writes client audio to a PulseAudio null-sink via
 * pa_simple playback.  The null-sink's monitor source appears as a recording
 * device ("Jujo.Stream Mic") to every application on the host.
 */
#pragma once

#include <memory>
#include <string>

#include "src/platform/common.h"

namespace platf {
  /**
   * @brief Create a Linux virtual microphone backed by a PulseAudio null-sink.
   *
   * @param sink_name   PulseAudio null-sink name to create and write to.
   *                    The sink's monitor (sink_name + ".monitor") is the
   *                    recording source visible to other applications.
   *                    If empty, defaults to "source-jujo-mic".
   * @param channels    Number of audio channels (1 or 2).
   * @param sample_rate Sample rate in Hz (e.g. 48000).
   * @param frame_size  Hint: frames per push() call (used to size PA buffer attr).
   * @return Pointer to the virtual mic, or nullptr on failure.
   */
  std::unique_ptr<virtual_mic_t> make_virtual_microphone(
    const std::string &sink_name,
    int channels,
    uint32_t sample_rate,
    uint32_t frame_size);
}  // namespace platf
