#pragma once

#include <algorithm>
#include <array>
#include <cstdint>
#include <cstring>
#include <optional>

namespace vrr_clock {

  inline constexpr std::uint16_t kClockSyncPtype = 0x5537u;
  inline constexpr std::uint8_t kProtocolVersion = 1;
  inline constexpr std::size_t kRequestBytes = 16;
  inline constexpr std::size_t kReplyBytes = 32;

  struct request_t {
    std::uint8_t version {kProtocolVersion};
    std::uint32_t seq {0};
    std::uint64_t client_send_us {0};
  };

  struct reply_t {
    std::uint8_t version {kProtocolVersion};
    std::uint32_t seq {0};
    std::uint64_t client_send_us {0};
    std::uint64_t host_recv_us {0};
    std::uint64_t host_send_us {0};
  };

  struct sample_t {
    std::uint32_t seq {0};
    std::uint64_t rtt_us {0};
    std::int64_t offset_us {0};
  };

  namespace detail {
    constexpr std::uint32_t read_u32_le(const std::uint8_t *p) noexcept {
      return static_cast<std::uint32_t>(p[0]) |
             (static_cast<std::uint32_t>(p[1]) << 8) |
             (static_cast<std::uint32_t>(p[2]) << 16) |
             (static_cast<std::uint32_t>(p[3]) << 24);
    }

    constexpr std::uint64_t read_u64_le(const std::uint8_t *p) noexcept {
      std::uint64_t v = 0;
      for (int i = 0; i < 8; ++i) {
        v |= static_cast<std::uint64_t>(p[i]) << (i * 8);
      }
      return v;
    }

    constexpr void write_u32_le(std::uint8_t *p, std::uint32_t v) noexcept {
      p[0] = static_cast<std::uint8_t>(v & 0xFFu);
      p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFFu);
      p[2] = static_cast<std::uint8_t>((v >> 16) & 0xFFu);
      p[3] = static_cast<std::uint8_t>((v >> 24) & 0xFFu);
    }

    constexpr void write_u64_le(std::uint8_t *p, std::uint64_t v) noexcept {
      for (int i = 0; i < 8; ++i) {
        p[i] = static_cast<std::uint8_t>((v >> (i * 8)) & 0xFFu);
      }
    }
  }  // namespace detail

  [[nodiscard]] inline std::optional<request_t> parse_request(const std::uint8_t *data, std::size_t len) noexcept {
    if (!data || len < kRequestBytes) {
      return std::nullopt;
    }
    if (data[0] != kProtocolVersion) {
      return std::nullopt;
    }
    request_t req;
    req.version = data[0];
    req.seq = detail::read_u32_le(data + 4);
    req.client_send_us = detail::read_u64_le(data + 8);
    return req;
  }

  [[nodiscard]] inline std::array<std::uint8_t, kRequestBytes> serialize_request(const request_t &req) noexcept {
    std::array<std::uint8_t, kRequestBytes> out {};
    out[0] = req.version;
    detail::write_u32_le(out.data() + 4, req.seq);
    detail::write_u64_le(out.data() + 8, req.client_send_us);
    return out;
  }

  [[nodiscard]] inline std::array<std::uint8_t, kReplyBytes> serialize_reply(const reply_t &rep) noexcept {
    std::array<std::uint8_t, kReplyBytes> out {};
    out[0] = rep.version;
    detail::write_u32_le(out.data() + 4, rep.seq);
    detail::write_u64_le(out.data() + 8, rep.client_send_us);
    detail::write_u64_le(out.data() + 16, rep.host_recv_us);
    detail::write_u64_le(out.data() + 24, rep.host_send_us);
    return out;
  }

  [[nodiscard]] inline std::optional<reply_t> parse_reply(const std::uint8_t *data, std::size_t len) noexcept {
    if (!data || len < kReplyBytes) {
      return std::nullopt;
    }
    if (data[0] != kProtocolVersion) {
      return std::nullopt;
    }
    reply_t rep;
    rep.version = data[0];
    rep.seq = detail::read_u32_le(data + 4);
    rep.client_send_us = detail::read_u64_le(data + 8);
    rep.host_recv_us = detail::read_u64_le(data + 16);
    rep.host_send_us = detail::read_u64_le(data + 24);
    return rep;
  }

  [[nodiscard]] constexpr std::optional<sample_t> compute_ntp_sample(
    const reply_t &rep,
    std::uint64_t client_recv_us
  ) noexcept {
    if (client_recv_us < rep.client_send_us || rep.host_send_us < rep.host_recv_us) {
      return std::nullopt;
    }
    const std::uint64_t total_us = client_recv_us - rep.client_send_us;
    const std::uint64_t host_proc_us = rep.host_send_us - rep.host_recv_us;
    const std::uint64_t rtt_us = (total_us >= host_proc_us) ? (total_us - host_proc_us) : 0;
    const std::int64_t leg1 = static_cast<std::int64_t>(rep.host_recv_us - rep.client_send_us);
    const std::int64_t leg2 = static_cast<std::int64_t>(rep.host_send_us - client_recv_us);
    return sample_t {
      rep.seq,
      rtt_us,
      leg1 + ((leg2 - leg1) / 2),
    };
  }

}  // namespace vrr_clock
