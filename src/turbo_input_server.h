/**
 * @file src/turbo_input_server.h
 * @brief Low-latency encrypted UDP (:48021) + ADB Reverse loopback TCP (:48022) input transport.
 */
#pragma once

#include <array>
#include <atomic>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <thread>
#include <unordered_map>
#include <vector>

#include "src/platform/common.h"

namespace turbo_input {
  constexpr std::uint16_t kDefaultUdpPort = 48021;
  constexpr std::uint16_t kDefaultTcpPort = 48022;
  // Offsets from the `port` base, so two servers behind one WAN IP don't fight over the same UPnP mapping.
  constexpr int kUdpPortOffset = 32;
  constexpr int kTcpPortOffset = 33;
  static_assert(47989 + kUdpPortOffset == kDefaultUdpPort && 47989 + kTcpPortOffset == kDefaultTcpPort, "default base must keep legacy ports");
  constexpr std::size_t kKeyBytes = 32;
  constexpr std::size_t kNonceBytes = 12;
  constexpr std::size_t kTagBytes = 16;
  constexpr std::size_t kHeaderBytes = 4 + 8;  // session_id (u32 LE) + packet_nonce (u64 LE)
  constexpr std::size_t kMinWireBytes = kHeaderBytes + 1 + kTagBytes;
  constexpr std::size_t kMaxWireBytes = 1400;
  constexpr std::uint64_t kDirectionServerToClientMask = 0x8000000000000000ULL;
  constexpr std::uint64_t kNonceCounterMask = 0x7FFFFFFFFFFFFFFFULL;
  constexpr std::size_t kMaxGamepads = 16;
  constexpr std::int64_t kSeqResetIdleMs = 1000;

  using Key = std::array<std::uint8_t, kKeyBytes>;

  enum class MsgType : std::uint8_t {
    ping = 0x01,
    pong = 0x02,
    gamepad_state = 0x10,
    gamepad_motion = 0x11,
    gamepad_arrival = 0x12,
    gamepad_touch = 0x13,
    disconnect_flush = 0x14,
    feedback_rumble = 0x20,
    feedback_rumble_triggers = 0x21,
    feedback_rgb_led = 0x22,
    feedback_adaptive_triggers = 0x23,
    feedback_motion_state = 0x24,
  };

  constexpr std::size_t kPingPayloadSize = 1 + 8;
  constexpr std::size_t kGamepadStatePayloadSize = 1 + 4 + 1 + 2 + 4 + 1 + 1 + 2 + 2 + 2 + 2 + 4 + 1;
  constexpr std::size_t kGamepadMotionPayloadSize = 1 + 4 + 1 + 1 + 4 + 4 + 4;
  constexpr std::size_t kGamepadArrivalPayloadSize = 1 + 4 + 1 + 1 + 2 + 4;
  constexpr std::size_t kGamepadTouchPayloadSize = 1 + 4 + 1 + 1 + 4 + 4 + 4 + 4;
  constexpr std::size_t kDisconnectFlushPayloadSize = 1 + 4 + 2;

  /**
   * @brief Generates a cryptographically random 256-bit key for ChaCha20-Poly1305.
   */
  bool generate_random_key(Key &key);

  /**
   * @brief Generates a non-zero random 32-bit session identifier.
   */
  std::uint32_t generate_session_id();

  /**
   * @brief Encodes a 256-bit key to lowercase hexadecimal.
   */
  std::string key_to_hex(const Key &key);

  /**
   * @brief Encrypts plaintext with ChaCha20-Poly1305 using [session_id || packet_nonce] as IV and AAD.
   */
  bool seal_packet(
    const Key &key,
    std::uint32_t session_id,
    std::uint64_t packet_nonce,
    const std::uint8_t *plaintext,
    std::size_t plaintext_len,
    std::vector<std::uint8_t> &out_wire
  );

  /**
   * @brief Decrypts and authenticates a Turbo Input wire packet.
   */
  std::optional<std::vector<std::uint8_t>> open_packet(
    const Key &key,
    const std::uint8_t *wire,
    std::size_t wire_len,
    std::uint32_t &out_session_id,
    std::uint64_t &out_packet_nonce
  );

  /**
   * @brief Serial-number comparison handling 32-bit wraparound.
   */
  bool seq_newer_u32(std::uint32_t seq, std::uint32_t last);

  /**
   * @brief 64-packet sliding window replay guard for monotonic packet counters.
   */
  class ReplayWindow64 {
  public:
    bool accept(std::uint64_t counter);
    void reset();

  private:
    bool initialized_ = false;
    std::uint64_t highest_ = 0;
    std::uint64_t mask_ = 0;
  };

  struct DecodedInputBatch {
    std::vector<std::vector<std::uint8_t>> packets;
  };

  /**
   * @brief Per-session anti-reordering tracker, button edge recovery, and disconnect flush generator.
   */
  class InputSessionTracker {
  public:
    ReplayWindow64 rx_replay;

    void reset();

    bool decode_payload(
      const std::uint8_t *payload,
      std::size_t len,
      std::int64_t now_ms,
      DecodedInputBatch &out,
      bool &out_edge_recovered,
      bool &out_dropped_ooo,
      bool &out_is_ping,
      std::uint64_t &out_ping_ts_us
    );

    std::vector<std::vector<std::uint8_t>> build_disconnect_flush();

  private:
    struct SeqTracker32 {
      bool initialized = false;
      std::uint32_t last_seq = 0;
      std::int64_t last_ms = 0;
    };

    struct PadState {
      bool active = false;
      std::uint16_t last_active_mask = 0;
      std::uint32_t last_buttons = 0;
      std::uint32_t last_recovered_edges = 0;
      std::uint32_t last_recovered_seq = 0;
      SeqTracker32 state_seq {};
      std::array<SeqTracker32, 2> motion_seq {};
      SeqTracker32 touch_seq {};
    };

    std::array<PadState, kMaxGamepads> pads_ {};

    static bool accept_seq(SeqTracker32 &tracker, std::uint32_t seq, std::int64_t now_ms, std::uint32_t *out_gap = nullptr);
  };

  /**
   * @brief Encodes host-to-client gamepad feedback into the compact binary Turbo wire payload.
   */
  std::optional<std::vector<std::uint8_t>> encode_feedback_message(const platf::gamepad_feedback_msg_t &msg);

  struct StatsSnapshot {
    bool running = false;
    std::uint16_t udp_port = 0;
    std::uint16_t tcp_port = 0;
    std::size_t active_sessions = 0;
    std::size_t connected_peers = 0;
    std::uint64_t packets_received = 0;
    std::uint64_t packets_dropped_auth = 0;
    std::uint64_t packets_dropped_replay = 0;
    std::uint64_t packets_dropped_ooo = 0;
    std::uint64_t button_edge_recoveries = 0;
    std::uint64_t feedback_sent = 0;
    std::uint64_t last_rtt_us = 0;
    std::string active_transport = "none";
  };

  using PacketSink = std::function<void(std::vector<std::uint8_t> &&)>;

  /**
   * @brief High-frequency encrypted UDP + ADB Reverse loopback TCP input transport server.
   */
  class TurboInputServer {
  public:
    using PacketSink = turbo_input::PacketSink;

    TurboInputServer();
    ~TurboInputServer();

    TurboInputServer(const TurboInputServer &) = delete;
    TurboInputServer &operator=(const TurboInputServer &) = delete;

    bool start(
      std::uint16_t udp_port = kDefaultUdpPort,
      std::uint16_t tcp_port = kDefaultTcpPort,
      bool bind_loopback_only_tcp = true
    );
    void stop();

    void register_session(std::uint32_t launch_session_id, std::uint32_t turbo_session_id, const Key &key);
    void attach_session(std::uint32_t launch_session_id, PacketSink sink);
    void unregister_session(std::uint32_t launch_session_id);

    bool has_active_peer(std::uint32_t launch_session_id) const;
    bool try_send_feedback(std::uint32_t launch_session_id, const platf::gamepad_feedback_msg_t &msg);

    std::uint16_t udp_port() const;
    std::uint16_t tcp_port() const;
    StatsSnapshot stats() const;

  private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
  };

  /**
   * @brief Returns the process-wide TurboInputServer instance.
   */
  TurboInputServer &server();
}  // namespace turbo_input
