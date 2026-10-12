#pragma once

#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <optional>

namespace video::metrics {
  using clock = std::chrono::steady_clock;
  using time_point = clock::time_point;

  struct trace_t {
    time_point captured, input, converted, submitted, output;
  };

  // Encoder-thread owned. Late output must match its own frame, not the latest
  // submission. Bounded storage drops only diagnostics, never video packets.
  class tracker_t {
  public:
    void stage(time_point captured, time_point input, time_point converted) {
      staged = trace_t {captured, input, converted, {}, {}};
    }

    void submit(std::int64_t id, time_point now) {
      if (!staged) {
        return;
      }
      staged->submitted = now;
      pending[next] = entry_t {id, *staged};
      next = (next + 1) % pending.size();
      staged.reset();
    }

    std::optional<trace_t> take(std::int64_t id, time_point now) {
      for (auto &entry : pending) {
        if (entry && entry->id == id) {
          auto trace = entry->trace;
          entry.reset();
          trace.output = now;
          return trace;
        }
      }
      return std::nullopt;
    }

  private:
    struct entry_t { std::int64_t id; trace_t trace; };
    std::array<std::optional<entry_t>, 64> pending {};
    std::optional<trace_t> staged;
    std::size_t next {};
  };

  struct summary_t {
    std::uint64_t total {}, retained {}, p50_us {}, p99_us {}, max_us {};
  };

  class window_t {
  public:
    void add(std::uint64_t us) {
      samples[total % samples.size()] = us;
      ++total;
      maximum = std::max(maximum, us);
    }

    summary_t summary() const {
      const auto count = static_cast<std::size_t>(std::min<std::uint64_t>(total, samples.size()));
      if (count == 0) {
        return {};
      }
      auto ordered = samples;
      std::sort(ordered.begin(), ordered.begin() + count);
      return {total, count, ordered[(count * 50 + 99) / 100 - 1],
              ordered[(count * 99 + 99) / 100 - 1], maximum};
    }

    void reset() { total = maximum = 0; }

  private:
    std::array<std::uint64_t, 512> samples {};
    std::uint64_t total {}, maximum {};
  };

  enum stage_e { source_age, convert, submit_gap, encode_wait, output_queue, fec, send, source_to_send, stage_count };
  inline constexpr std::array<const char *, stage_count> stage_names {
    "source_age", "convert", "submit_gap", "encode_wait", "output_queue", "fec", "send", "source_to_send"};

  // Created with the encoder, read/written only by the broadcast thread.
  class session_t {
  public:
    const std::uint64_t id {next_id.fetch_add(1, std::memory_order_relaxed)};
    std::array<window_t, stage_count> windows;
    std::uint64_t packets {}, tracked {}, invalid {};

    void record(const std::optional<trace_t> &trace, time_point dequeued, time_point sent,
                std::chrono::nanoseconds fec_duration) {
      ++packets;
      if (sent < dequeued || fec_duration.count() < 0) {
        ++invalid;
        return;
      }
      add(send, sent - dequeued);
      add(fec, fec_duration);
      if (!trace) {
        return;
      }
      const auto &t = *trace;
      if (!(t.captured <= t.input && t.input <= t.converted && t.converted <= t.submitted &&
            t.submitted <= t.output && t.output <= dequeued)) {
        ++invalid;
        return;
      }
      ++tracked;
      add(source_age, t.input - t.captured);
      add(convert, t.converted - t.input);
      add(submit_gap, t.submitted - t.converted);
      add(encode_wait, t.output - t.submitted);
      add(output_queue, dequeued - t.output);
      add(source_to_send, sent - t.captured);
    }

    bool report_due(time_point now) {
      if (!last_report) {
        last_report = now;
        return false;
      }
      return now - *last_report >= std::chrono::seconds(10);
    }

    void reset(time_point now) {
      for (auto &window : windows) { window.reset(); }
      packets = tracked = invalid = 0;
      last_report = now;
    }

  private:
    template<class Duration>
    void add(stage_e stage, Duration duration) {
      windows[stage].add(static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::microseconds>(duration).count()));
    }
    inline static std::atomic<std::uint64_t> next_id {1};
    std::optional<time_point> last_report;
  };
}  // namespace video::metrics
