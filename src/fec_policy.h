/**
 * @file src/fec_policy.h
 * @brief Frame FEC block planner, oversize scene-cut cap helpers, and 0x5539 statistical FEC.
 */
#pragma once

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <limits>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace stream::fec_policy {

  inline constexpr std::size_t kMaxFecBlocks = 4;
  inline constexpr std::size_t kDataShardsMax = 255;

  inline constexpr std::uint16_t kFecReportPacketType = 0x5539;
  inline constexpr std::size_t kFecReportBytes = 24;
  inline constexpr std::uint8_t kFecReportVersion = 1;
  inline constexpr std::uint16_t kFecReportMinIntervalMs = 250;
  inline constexpr std::uint16_t kFecReportMaxIntervalMs = 5000;

  inline constexpr double kFrameFailureTarget = 0.001;
  inline constexpr std::uint8_t kMinimumPercent = 10;
  inline constexpr std::size_t kWindowSeconds = 10;
  inline constexpr auto kWindowDuration = std::chrono::seconds(kWindowSeconds);
  inline constexpr auto kFeedbackTimeout = std::chrono::seconds(3);
  inline constexpr auto kMinEstimateInterval = std::chrono::milliseconds(500);
  inline constexpr std::uint64_t kMaxReportedShards = 1'000'000;
  inline constexpr std::uint8_t kUnreachableParity = 255;

  enum class fec_mode_e {
    host,
    auto_report,
    fixed,
  };

  struct fec_choice_t {
    fec_mode_e mode = fec_mode_e::host;
    std::uint8_t fixed_percent = 0;

    bool operator==(const fec_choice_t &) const = default;
  };

  /**
   * @brief Parse `rlFecPercentage` (`host`, `auto`, or decimal `0`..`255`).
   */
  inline std::optional<fec_choice_t> parse_rl_fec_percentage(std::string_view text) {
    if (text == "host") {
      return fec_choice_t {fec_mode_e::host, 0};
    }
    if (text == "auto") {
      return fec_choice_t {fec_mode_e::auto_report, 0};
    }
    if (text.empty()) {
      return std::nullopt;
    }
    unsigned int value = 0;
    for (unsigned char ch : text) {
      if (ch < '0' || ch > '9') {
        return std::nullopt;
      }
      value = value * 10u + static_cast<unsigned int>(ch - '0');
      if (value > 255u) {
        return std::nullopt;
      }
    }
    return fec_choice_t {fec_mode_e::fixed, static_cast<std::uint8_t>(value)};
  }

  struct frame_fec_plan_t {
    std::size_t max_data_shards_per_block = kDataShardsMax;
    std::size_t fec_blocks_needed = 1;
    unsigned int effective_fec_percentage = 0;
    bool was_clamped = false;
    bool overflow_unprotected = false;
  };

  namespace detail {
    inline std::size_t blocks_for_payload(std::size_t payload_bytes, std::size_t blocksize, unsigned int pct, std::size_t max_shards_per_block) {
      if (blocksize == 0 || max_shards_per_block == 0) {
        return std::numeric_limits<std::size_t>::max();
      }
      const std::size_t max_d = (max_shards_per_block * 100u) / (100u + pct);
      if (max_d == 0) {
        return std::numeric_limits<std::size_t>::max();
      }
      const std::size_t max_bytes = max_d * blocksize;
      return payload_bytes == 0 ? 1 : (payload_bytes + max_bytes - 1) / max_bytes;
    }

    inline std::size_t parity_for_block(std::size_t data_shards, unsigned int pct, std::size_t min_required_fec, std::size_t max_shards_per_block) {
      if (data_shards == 0 || pct == 0) {
        return 0;
      }
      std::size_t parity = (data_shards * pct + 99u) / 100u;
      if (parity < min_required_fec && data_shards < max_shards_per_block) {
        parity = std::min(min_required_fec, max_shards_per_block - data_shards);
      }
      return parity;
    }

    inline double binomial_tail(std::size_t n, std::size_t k, double p) {
      if (k >= n || p <= 0.0) {
        return 0.0;
      }
      if (p >= 1.0) {
        return 1.0;
      }
      const double init = std::pow(1.0 - p, static_cast<double>(n));
      if (init > 0.0) {
        const double odds = p / (1.0 - p);
        double term = init;
        double cdf = term;
        for (std::size_t i = 0; i < k; ++i) {
          term *= static_cast<double>(n - i) / static_cast<double>(i + 1) * odds;
          cdf += term;
        }
        return std::max(0.0, 1.0 - cdf);
      }
      // Log-space fallback when (1 - p)^n underflows (extreme loss p -> 1).
      const double log_p = std::log(p);
      const double log_q = std::log(1.0 - p);
      const double log_n_fact = std::lgamma(static_cast<double>(n + 1));
      double tail = 0.0;
      for (std::size_t i = k + 1; i <= n; ++i) {
        const double log_pmf = log_n_fact - std::lgamma(static_cast<double>(i + 1)) -
                               std::lgamma(static_cast<double>(n - i + 1)) +
                               static_cast<double>(i) * log_p +
                               static_cast<double>(n - i) * log_q;
        tail += std::exp(log_pmf);
      }
      return std::clamp(tail, 0.0, 1.0);
    }
  }  // namespace detail

  /**
   * @brief Plan per-frame FEC blocks inside the 4-block protocol ceiling.
   *
   * Instead of dropping straight to 0% FEC when a large frame would need > 4 blocks
   * at `requested_pct`, clamps `effective_fec_percentage` down to the highest
   * percentage that still fits inside `kMaxFecBlocks`.
   */
  inline frame_fec_plan_t plan_frame_fec(
    std::size_t payload_bytes,
    std::size_t blocksize,
    unsigned int requested_pct,
    std::size_t max_shards_per_block = kDataShardsMax
  ) {
    frame_fec_plan_t plan;
    if (blocksize == 0 || max_shards_per_block == 0) {
      plan.effective_fec_percentage = 0;
      plan.fec_blocks_needed = kMaxFecBlocks;
      plan.was_clamped = requested_pct > 0;
      plan.overflow_unprotected = true;
      return plan;
    }

    const unsigned int clamped_req = std::min(requested_pct, 255u);
    const std::size_t needed_at_req = detail::blocks_for_payload(payload_bytes, blocksize, clamped_req, max_shards_per_block);
    if (needed_at_req <= kMaxFecBlocks) {
      plan.effective_fec_percentage = clamped_req;
      plan.max_data_shards_per_block = (max_shards_per_block * 100u) / (100u + clamped_req);
      plan.fec_blocks_needed = needed_at_req;
      return plan;
    }

    if (detail::blocks_for_payload(payload_bytes, blocksize, 0, max_shards_per_block) > kMaxFecBlocks) {
      plan.effective_fec_percentage = 0;
      plan.max_data_shards_per_block = max_shards_per_block;
      plan.fec_blocks_needed = kMaxFecBlocks;
      plan.was_clamped = clamped_req > 0;
      plan.overflow_unprotected = true;
      return plan;
    }

    const std::size_t total_shards = (payload_bytes + blocksize - 1) / blocksize;
    const std::size_t needed_per_block = std::max<std::size_t>(1, (total_shards + kMaxFecBlocks - 1) / kMaxFecBlocks);
    unsigned int candidate = static_cast<unsigned int>(std::min<std::size_t>(
      clamped_req,
      (max_shards_per_block * 100u) / needed_per_block > 100u ? (max_shards_per_block * 100u) / needed_per_block - 100u : 0u
    ));
    while (candidate > 0 && detail::blocks_for_payload(payload_bytes, blocksize, candidate, max_shards_per_block) > kMaxFecBlocks) {
      --candidate;
    }

    plan.effective_fec_percentage = candidate;
    plan.max_data_shards_per_block = (max_shards_per_block * 100u) / (100u + candidate);
    plan.fec_blocks_needed = std::min(
      kMaxFecBlocks,
      detail::blocks_for_payload(payload_bytes, blocksize, candidate, max_shards_per_block)
    );
    plan.was_clamped = candidate < clamped_req;
    return plan;
  }

  /**
   * @brief Max raw encoded payload bytes keeping full `fec_pct` protection within 4 blocks,
   *        or 0 when two nominal bitrate frames already exceed that budget.
   */
  inline std::uint32_t fec_whole_frame_limit_bytes(
    std::size_t packetsize,
    std::size_t packet_header_bytes,
    std::size_t frame_header_bytes,
    unsigned int fec_pct,
    int bitrate_kbps,
    double fps,
    std::size_t max_shards_per_block = kDataShardsMax
  ) {
    if (bitrate_kbps <= 0 || fps <= 0.0 || fec_pct == 0 || packetsize <= packet_header_bytes) {
      return 0;
    }
    const std::size_t payload_per_packet = packetsize - packet_header_bytes;
    const std::size_t max_d = (max_shards_per_block * 100u) / (100u + std::min(fec_pct, 255u));
    const std::size_t total_block_bytes = kMaxFecBlocks * max_d * payload_per_packet;
    if (total_block_bytes <= frame_header_bytes) {
      return 0;
    }
    const std::size_t fec_whole = total_block_bytes - frame_header_bytes;
    const double two_frames = std::ceil(static_cast<double>(bitrate_kbps) * 125.0 * 2.0 / fps);
    if (two_frames > static_cast<double>(fec_whole)) {
      return 0;
    }
    return static_cast<std::uint32_t>(std::min<std::size_t>(fec_whole, std::numeric_limits<std::uint32_t>::max()));
  }

  struct fec_report_t {
    std::uint32_t seq = 0;
    std::uint32_t data_shards = 0;
    std::uint32_t parity_shards = 0;
    std::uint32_t missing_shards = 0;
    std::uint16_t unrecovered_blocks = 0;
    std::uint16_t interval_ms = 0;
  };

  /**
   * @brief Decode little-endian 0x5539 FEC report (`>= 24` bytes, version >= 1, plausible counts).
   */
  inline bool parse_fec_report(std::string_view payload, fec_report_t &out) {
    if (payload.size() < kFecReportBytes) {
      return false;
    }
    const auto *data = reinterpret_cast<const std::uint8_t *>(payload.data());
    if (data[0] == 0) {
      return false;
    }
    auto read_u16_le = [&](std::size_t off) -> std::uint16_t {
      return static_cast<std::uint16_t>(data[off]) |
             (static_cast<std::uint16_t>(data[off + 1]) << 8);
    };
    auto read_u32_le = [&](std::size_t off) -> std::uint32_t {
      return static_cast<std::uint32_t>(data[off]) |
             (static_cast<std::uint32_t>(data[off + 1]) << 8) |
             (static_cast<std::uint32_t>(data[off + 2]) << 16) |
             (static_cast<std::uint32_t>(data[off + 3]) << 24);
    };

    out.seq = read_u32_le(4);
    out.data_shards = read_u32_le(8);
    out.parity_shards = read_u32_le(12);
    out.missing_shards = read_u32_le(16);
    out.unrecovered_blocks = read_u16_le(20);
    out.interval_ms = read_u16_le(22);

    const std::uint64_t sent = static_cast<std::uint64_t>(out.data_shards) + out.parity_shards;
    return out.missing_shards <= sent &&
           out.interval_ms >= kFecReportMinIntervalMs &&
           out.interval_ms <= kFecReportMaxIntervalMs;
  }

  enum class reject_reason_e {
    none,
    stale,
    implausible,
  };

  struct fec_estimate_t {
    double loss = 0.0;
    std::array<std::array<std::uint8_t, kDataShardsMax + 1>, kMaxFecBlocks> required {};
  };

  /**
   * @brief Build binomial tail parity lookup tables for all 1..4 block layouts at loss rate `p`.
   */
  inline fec_estimate_t build_estimate(double loss) {
    fec_estimate_t est;
    est.loss = loss;
    for (std::size_t b = 0; b < kMaxFecBlocks; ++b) {
      auto &table = est.required[b];
      table.fill(kUnreachableParity);
      table[0] = 0;
      const double target = kFrameFailureTarget / static_cast<double>(b + 1);
      std::size_t parity = 0;
      for (std::size_t data = 1; data <= kDataShardsMax; ++data) {
        while (data + parity <= kDataShardsMax && detail::binomial_tail(data + parity, parity, loss) > target) {
          ++parity;
        }
        if (data + parity > kDataShardsMax) {
          break;
        }
        table[data] = static_cast<std::uint8_t>(parity);
      }
    }
    return est;
  }

  /**
   * @brief Statistical FEC controller matching `0x5539` worst-1s-of-10s binomial tail policy.
   */
  class statistical_fec_t {
  public:
    using clock = std::chrono::steady_clock;

    statistical_fec_t(std::uint8_t maximum, std::uint8_t fallback, std::size_t minimum_parity, clock::time_point now = clock::now()):
        maximum_(maximum),
        fallback_(fallback),
        minimum_parity_(minimum_parity),
        origin_(now) {}

    std::size_t maximum() const {
      return maximum_;
    }

    std::size_t fallback() const {
      return fallback_;
    }

    std::size_t floor() const {
      return std::min(kMinimumPercent, maximum_);
    }

    std::optional<double> loss() const {
      return loss_;
    }

    bool reported() const {
      return last_.has_value();
    }

    /**
     * @brief Record a report; returns a loss value whose binomial table should be built and
     *        handed to `install()`, or nullopt when no table rebuild is required.
     */
    reject_reason_e observe(clock::time_point now, const fec_report_t &report, std::optional<double> &pending_loss) {
      pending_loss.reset();
      const std::uint64_t sent = static_cast<std::uint64_t>(report.data_shards) + report.parity_shards;
      if (sent > kMaxReportedShards) {
        return reject_reason_e::implausible;
      }

      bool gap = false;
      if (last_) {
        const std::uint32_t delta = report.seq - last_->first;
        if (delta == 0 || delta >= (1u << 31)) {
          return reject_reason_e::stale;
        }
        if (delta != 1 || (now >= last_->second && (now - last_->second) > kFeedbackTimeout)) {
          buckets_.fill(bucket_t {});
          resumed_ = now;
          gap = true;
        }
      }
      last_ = std::pair {report.seq, now};

      const std::uint64_t second = now >= origin_ ? static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::seconds>(now - origin_).count()) : 0;
      auto &bucket = buckets_[second % kWindowSeconds];
      if (!bucket.second || *bucket.second != second) {
        bucket = bucket_t {second, 0, 0};
      }
      bucket.sent += sent;
      bucket.missing += std::min<std::uint64_t>(report.missing_shards, sent);

      if (!gap && estimated_ && now >= *estimated_ && (now - *estimated_) < kMinEstimateInterval) {
        return reject_reason_e::none;
      }
      estimated_ = now;

      std::optional<double> worst_loss;
      for (const auto &b : buckets_) {
        if (b.sent > 0 && b.second && *b.second <= second && (second - *b.second) < kWindowSeconds) {
          const double rate = static_cast<double>(b.missing) / static_cast<double>(b.sent);
          if (!worst_loss || rate > *worst_loss) {
            worst_loss = rate;
          }
        }
      }

      if (worst_loss == loss_) {
        pending_loss_.reset();
        return reject_reason_e::none;
      }

      if (worst_loss && *worst_loss > 0.0) {
        pending_loss_ = *worst_loss;
        pending_loss = *worst_loss;
        return reject_reason_e::none;
      }

      pending_loss_.reset();
      loss_ = worst_loss;
      estimate_.reset();
      return reject_reason_e::none;
    }

    void install(const fec_estimate_t &estimate) {
      if (pending_loss_ && *pending_loss_ == estimate.loss) {
        pending_loss_.reset();
        loss_ = estimate.loss;
        estimate_ = estimate;
      }
    }

    /**
     * @brief Convenience single-step helper (record + build + install).
     */
    reject_reason_e report(clock::time_point now, const fec_report_t &rep) {
      std::optional<double> pending;
      const auto res = observe(now, rep, pending);
      if (res == reject_reason_e::none && pending) {
        install(build_estimate(*pending));
      }
      return res;
    }

    unsigned int percent(clock::time_point now, std::size_t data_shards) const {
      const bool fresh = last_ && now >= last_->second && (now - last_->second) <= kFeedbackTimeout;
      if (!fresh || !loss_) {
        return static_cast<unsigned int>(fallback());
      }
      if (*loss_ <= 0.0) {
        const bool settling = resumed_ && now >= *resumed_ && (now - *resumed_) < kWindowDuration;
        return static_cast<unsigned int>(settling ? fallback() : floor());
      }
      return static_cast<unsigned int>(select(data_shards));
    }

  private:
    struct bucket_t {
      std::optional<std::uint64_t> second;
      std::uint64_t sent = 0;
      std::uint64_t missing = 0;
    };

    std::size_t select(std::size_t data_shards) const {
      if (data_shards == 0) {
        return 0;
      }
      if (!estimate_) {
        return fallback();
      }
      std::optional<std::size_t> best;
      const std::size_t start_ratio = std::max<std::size_t>(floor(), 1);
      for (std::size_t ratio = start_ratio; ratio <= maximum(); ++ratio) {
        const std::size_t max_d = (kDataShardsMax * 100u) / (100u + ratio);
        if (max_d == 0) {
          continue;
        }
        const std::size_t blocks = (data_shards + max_d - 1) / max_d;
        if (blocks == 0 || blocks > kMaxFecBlocks) {
          continue;
        }
        best = ratio;
        const auto &required = estimate_->required[blocks - 1];
        const std::size_t aligned = (data_shards + blocks - 1) / blocks;
        bool sufficient = true;
        for (std::size_t block = 0; block < blocks; ++block) {
          const std::size_t off = block * aligned;
          const std::size_t d = off < data_shards ? std::min(aligned, data_shards - off) : 0;
          if (d == 0) {
            continue;
          }
          const std::uint8_t need = required[std::min(d, kDataShardsMax)];
          if (need == kUnreachableParity ||
              detail::parity_for_block(d, static_cast<unsigned int>(ratio), minimum_parity_, kDataShardsMax) < need) {
            sufficient = false;
            break;
          }
        }
        if (sufficient) {
          return ratio;
        }
      }
      return best.value_or(maximum());
    }

    std::uint8_t maximum_;
    std::uint8_t fallback_;
    std::size_t minimum_parity_;
    clock::time_point origin_;
    std::array<bucket_t, kWindowSeconds> buckets_ {};
    std::optional<std::pair<std::uint32_t, clock::time_point>> last_;
    std::optional<clock::time_point> resumed_;
    std::optional<clock::time_point> estimated_;
    std::optional<double> loss_;
    std::optional<fec_estimate_t> estimate_;
    std::optional<double> pending_loss_;
  };

}  // namespace stream::fec_policy

