/**
 * @file src/turbo_input_server.cpp
 * @brief Low-latency ChaCha20-Poly1305 UDP + ADB Reverse loopback TCP input engine.
 */

#include "src/turbo_input_server.h"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstring>
#include <deque>
#include <utility>

#include <boost/asio.hpp>
#include <moonlight-common-c/src/Input.h>
#include <moonlight-common-c/src/Limelight.h>
#include <openssl/evp.h>
#include <openssl/rand.h>

#include "src/webrtc_input_codec.h"

namespace turbo_input {
  namespace {
    using boost::asio::ip::tcp;
    using boost::asio::ip::udp;

    std::uint16_t read_u16_le(const std::uint8_t *p) {
      return static_cast<std::uint16_t>(p[0]) | (static_cast<std::uint16_t>(p[1]) << 8);
    }

    std::int16_t read_i16_le(const std::uint8_t *p) {
      return static_cast<std::int16_t>(read_u16_le(p));
    }

    std::uint32_t read_u32_le(const std::uint8_t *p) {
      return static_cast<std::uint32_t>(p[0]) |
             (static_cast<std::uint32_t>(p[1]) << 8) |
             (static_cast<std::uint32_t>(p[2]) << 16) |
             (static_cast<std::uint32_t>(p[3]) << 24);
    }

    std::uint64_t read_u64_le(const std::uint8_t *p) {
      std::uint64_t v = 0;
      for (int i = 0; i < 8; ++i) {
        v |= static_cast<std::uint64_t>(p[i]) << (i * 8);
      }
      return v;
    }

    float read_f32_le(const std::uint8_t *p) {
      const std::uint32_t bits = read_u32_le(p);
      float value = 0.0f;
      std::memcpy(&value, &bits, sizeof(value));
      return value;
    }

    void write_u16_le(std::uint8_t *p, std::uint16_t v) {
      p[0] = static_cast<std::uint8_t>(v & 0xFF);
      p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
    }

    void write_u32_le(std::uint8_t *p, std::uint32_t v) {
      p[0] = static_cast<std::uint8_t>(v & 0xFF);
      p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFF);
      p[2] = static_cast<std::uint8_t>((v >> 16) & 0xFF);
      p[3] = static_cast<std::uint8_t>((v >> 24) & 0xFF);
    }

    void write_u64_le(std::uint8_t *p, std::uint64_t v) {
      for (int i = 0; i < 8; ++i) {
        p[i] = static_cast<std::uint8_t>((v >> (i * 8)) & 0xFF);
      }
    }

    void build_nonce_aad(std::uint32_t session_id, std::uint64_t packet_nonce, std::uint8_t *out12) {
      write_u32_le(out12, session_id);
      write_u64_le(out12 + 4, packet_nonce);
    }

    std::int64_t steady_now_ms() {
      return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::steady_clock::now().time_since_epoch()
      )
        .count();
    }

    struct EvpCtxDeleter {
      void operator()(EVP_CIPHER_CTX *ctx) const noexcept {
        EVP_CIPHER_CTX_free(ctx);
      }
    };

    using EvpCtxPtr = std::unique_ptr<EVP_CIPHER_CTX, EvpCtxDeleter>;
  }  // namespace

  bool generate_random_key(Key &key) {
    return RAND_bytes(key.data(), static_cast<int>(key.size())) == 1;
  }

  std::uint32_t generate_session_id() {
    std::uint32_t id = 0;
    do {
      if (RAND_bytes(reinterpret_cast<std::uint8_t *>(&id), sizeof(id)) != 1) {
        id = 0x54555242u;
      }
    } while (id == 0);
    return id;
  }

  std::string key_to_hex(const Key &key) {
    static constexpr char kHex[] = "0123456789abcdef";
    std::string out;
    out.resize(key.size() * 2);
    for (std::size_t i = 0; i < key.size(); ++i) {
      out[i * 2] = kHex[(key[i] >> 4) & 0x0F];
      out[i * 2 + 1] = kHex[key[i] & 0x0F];
    }
    return out;
  }

  bool seal_packet(
    const Key &key,
    std::uint32_t session_id,
    std::uint64_t packet_nonce,
    const std::uint8_t *plaintext,
    std::size_t plaintext_len,
    std::vector<std::uint8_t> &out_wire
  ) {
    if (session_id == 0 || !plaintext || plaintext_len == 0 || plaintext_len > kMaxWireBytes - kHeaderBytes - kTagBytes) {
      return false;
    }

    EvpCtxPtr ctx(EVP_CIPHER_CTX_new());
    if (!ctx) {
      return false;
    }

    std::uint8_t header[kHeaderBytes];
    build_nonce_aad(session_id, packet_nonce, header);

    out_wire.resize(kHeaderBytes + plaintext_len + kTagBytes);
    std::memcpy(out_wire.data(), header, kHeaderBytes);

    if (EVP_EncryptInit_ex(ctx.get(), EVP_chacha20_poly1305(), nullptr, nullptr, nullptr) != 1) {
      return false;
    }
    if (EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_AEAD_SET_IVLEN, kNonceBytes, nullptr) != 1) {
      return false;
    }
    if (EVP_EncryptInit_ex(ctx.get(), nullptr, nullptr, key.data(), header) != 1) {
      return false;
    }

    int out_len = 0;
    if (EVP_EncryptUpdate(ctx.get(), nullptr, &out_len, header, kHeaderBytes) != 1) {
      return false;
    }
    if (EVP_EncryptUpdate(
          ctx.get(),
          out_wire.data() + kHeaderBytes,
          &out_len,
          plaintext,
          static_cast<int>(plaintext_len)
        ) != 1) {
      return false;
    }

    int fin_len = 0;
    if (EVP_EncryptFinal_ex(ctx.get(), out_wire.data() + kHeaderBytes + out_len, &fin_len) != 1) {
      return false;
    }
    const std::size_t cipher_len = static_cast<std::size_t>(out_len + fin_len);
    out_wire.resize(kHeaderBytes + cipher_len + kTagBytes);

    if (EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_AEAD_GET_TAG, kTagBytes, out_wire.data() + kHeaderBytes + cipher_len) != 1) {
      return false;
    }
    return true;
  }

  std::optional<std::vector<std::uint8_t>> open_packet(
    const Key &key,
    const std::uint8_t *wire,
    std::size_t wire_len,
    std::uint32_t &out_session_id,
    std::uint64_t &out_packet_nonce
  ) {
    if (!wire || wire_len < kMinWireBytes || wire_len > kMaxWireBytes) {
      return std::nullopt;
    }

    out_session_id = read_u32_le(wire);
    out_packet_nonce = read_u64_le(wire + 4);
    if (out_session_id == 0) {
      return std::nullopt;
    }

    const std::size_t cipher_len = wire_len - kHeaderBytes - kTagBytes;
    const std::uint8_t *ciphertext = wire + kHeaderBytes;
    const std::uint8_t *tag = wire + kHeaderBytes + cipher_len;

    EvpCtxPtr ctx(EVP_CIPHER_CTX_new());
    if (!ctx) {
      return std::nullopt;
    }

    if (EVP_DecryptInit_ex(ctx.get(), EVP_chacha20_poly1305(), nullptr, nullptr, nullptr) != 1) {
      return std::nullopt;
    }
    if (EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_AEAD_SET_IVLEN, kNonceBytes, nullptr) != 1) {
      return std::nullopt;
    }
    if (EVP_DecryptInit_ex(ctx.get(), nullptr, nullptr, key.data(), wire) != 1) {
      return std::nullopt;
    }

    int out_len = 0;
    if (EVP_DecryptUpdate(ctx.get(), nullptr, &out_len, wire, kHeaderBytes) != 1) {
      return std::nullopt;
    }

    std::vector<std::uint8_t> plaintext(cipher_len);
    if (EVP_DecryptUpdate(
          ctx.get(),
          plaintext.data(),
          &out_len,
          ciphertext,
          static_cast<int>(cipher_len)
        ) != 1) {
      return std::nullopt;
    }

    if (EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_AEAD_SET_TAG, kTagBytes, const_cast<std::uint8_t *>(tag)) != 1) {
      return std::nullopt;
    }

    int fin_len = 0;
    if (EVP_DecryptFinal_ex(ctx.get(), plaintext.data() + out_len, &fin_len) != 1) {
      return std::nullopt;
    }

    plaintext.resize(static_cast<std::size_t>(out_len + fin_len));
    return plaintext;
  }

  bool seq_newer_u32(std::uint32_t seq, std::uint32_t last) {
    return static_cast<std::int32_t>(seq - last) > 0;
  }

  bool ReplayWindow64::accept(std::uint64_t counter) {
    if (!initialized_) {
      initialized_ = true;
      highest_ = counter;
      mask_ = 1ULL;
      return true;
    }

    if (counter > highest_) {
      const std::uint64_t shift = counter - highest_;
      mask_ = (shift >= 64) ? 1ULL : ((mask_ << shift) | 1ULL);
      highest_ = counter;
      return true;
    }

    const std::uint64_t age = highest_ - counter;
    if (age >= 64) {
      return false;
    }
    const std::uint64_t bit = 1ULL << age;
    if ((mask_ & bit) != 0) {
      return false;
    }
    mask_ |= bit;
    return true;
  }

  void ReplayWindow64::reset() {
    initialized_ = false;
    highest_ = 0;
    mask_ = 0;
  }

  void InputSessionTracker::reset() {
    rx_replay.reset();
    pads_.fill({});
  }

  bool InputSessionTracker::accept_seq(
    SeqTracker32 &tracker,
    std::uint32_t seq,
    std::int64_t now_ms,
    std::uint32_t *out_gap
  ) {
    std::uint32_t gap = 1;
    if (tracker.initialized) {
      if (!seq_newer_u32(seq, tracker.last_seq)) {
        const auto elapsed = now_ms - tracker.last_ms;
        if (tracker.last_ms > 0 && elapsed >= 0 && elapsed < kSeqResetIdleMs) {
          return false;
        }
        gap = 1;
      } else {
        gap = seq - tracker.last_seq;
      }
    }
    tracker.initialized = true;
    tracker.last_seq = seq;
    tracker.last_ms = now_ms;
    if (out_gap) {
      *out_gap = gap;
    }
    return true;
  }

  bool InputSessionTracker::decode_payload(
    const std::uint8_t *payload,
    std::size_t len,
    std::int64_t now_ms,
    DecodedInputBatch &out,
    bool &out_edge_recovered,
    bool &out_dropped_ooo,
    bool &out_is_ping,
    std::uint64_t &out_ping_ts_us
  ) {
    out.packets.clear();
    out_edge_recovered = false;
    out_dropped_ooo = false;
    out_is_ping = false;
    out_ping_ts_us = 0;

    if (!payload || len < 1) {
      return false;
    }

    const auto type = static_cast<MsgType>(payload[0]);
    if (type == MsgType::ping) {
      if (len < kPingPayloadSize) {
        return false;
      }
      out_is_ping = true;
      out_ping_ts_us = read_u64_le(payload + 1);
      return true;
    }

    if (type == MsgType::gamepad_state) {
      if (len < kGamepadStatePayloadSize) {
        return false;
      }
      const std::uint32_t seq = read_u32_le(payload + 1);
      const std::uint8_t id = payload[5];
      if (id >= kMaxGamepads) {
        return false;
      }
      const std::uint16_t active_mask = read_u16_le(payload + 6);
      const std::uint32_t buttons = read_u32_le(payload + 8);
      const std::uint8_t lt = payload[12];
      const std::uint8_t rt = payload[13];
      const std::int16_t lx = read_i16_le(payload + 14);
      const std::int16_t ly = read_i16_le(payload + 16);
      const std::int16_t rx = read_i16_le(payload + 18);
      const std::int16_t ry = read_i16_le(payload + 20);
      const std::uint32_t pressed_edges = read_u32_le(payload + 22);
      const std::uint8_t flags = payload[26];

      auto &pad = pads_[id];
      std::uint32_t gap = 1;
      if (!accept_seq(pad.state_seq, seq, now_ms, &gap)) {
        out_dropped_ooo = true;
        return false;
      }

      if ((flags & 0x01u) != 0) {
        out.packets.push_back(webrtc_input::make_gamepad_state_packet(id, active_mask, 0, 0, 0, 0, 0, 0, 0));
        pad.active = (active_mask & (1u << id)) != 0;
        pad.last_active_mask = active_mask;
        pad.last_buttons = 0;
        return true;
      }

      // If packets were dropped in flight and a rapid tap occurred (pressed_edges bit not
      // currently set in buttons), synthesize the transient press before current state so
      // short clicks survive UDP loss without double-triggering redundancy repeats.
      const std::uint32_t missed = pressed_edges & ~buttons;
      if (gap > 1 && missed != 0 &&
          (missed != pad.last_recovered_edges || (seq - pad.last_recovered_seq) > 4)) {
        out.packets.push_back(
          webrtc_input::make_gamepad_state_packet(id, active_mask, buttons | missed, lt, rt, lx, ly, rx, ry)
        );
        pad.last_recovered_edges = missed;
        pad.last_recovered_seq = seq;
        out_edge_recovered = true;
      }

      out.packets.push_back(
        webrtc_input::make_gamepad_state_packet(id, active_mask, buttons, lt, rt, lx, ly, rx, ry)
      );
      pad.active = (active_mask & (1u << id)) != 0;
      pad.last_active_mask = active_mask;
      pad.last_buttons = buttons;
      return true;
    }

    if (type == MsgType::gamepad_motion) {
      if (len < kGamepadMotionPayloadSize) {
        return false;
      }
      const std::uint32_t seq = read_u32_le(payload + 1);
      const std::uint8_t id = payload[5];
      const std::uint8_t motion_type = payload[6];
      if (id >= kMaxGamepads || (motion_type != LI_MOTION_TYPE_ACCEL && motion_type != LI_MOTION_TYPE_GYRO)) {
        return false;
      }
      const float x = read_f32_le(payload + 7);
      const float y = read_f32_le(payload + 11);
      const float z = read_f32_le(payload + 15);
      if (!std::isfinite(x) || !std::isfinite(y) || !std::isfinite(z)) {
        return false;
      }
      const std::size_t idx = (motion_type == LI_MOTION_TYPE_ACCEL) ? 0 : 1;
      if (!accept_seq(pads_[id].motion_seq[idx], seq, now_ms)) {
        out_dropped_ooo = true;
        return false;
      }
      out.packets.push_back(webrtc_input::make_gamepad_motion_packet(id, motion_type, x, y, z));
      return true;
    }

    if (type == MsgType::gamepad_arrival) {
      if (len < kGamepadArrivalPayloadSize) {
        return false;
      }
      const std::uint32_t seq = read_u32_le(payload + 1);
      const std::uint8_t id = payload[5];
      if (id >= kMaxGamepads) {
        return false;
      }
      const std::uint8_t ctype = payload[6];
      const std::uint16_t capabilities = read_u16_le(payload + 7);
      const std::uint32_t supported_buttons = read_u32_le(payload + 9);
      if (!accept_seq(pads_[id].state_seq, seq, now_ms)) {
        out_dropped_ooo = true;
        return false;
      }
      pads_[id].active = true;
      pads_[id].last_active_mask |= static_cast<std::uint16_t>(1u << id);
      out.packets.push_back(webrtc_input::make_gamepad_arrival_packet(id, ctype, capabilities, supported_buttons));
      return true;
    }

    if (type == MsgType::gamepad_touch) {
      if (len < kGamepadTouchPayloadSize) {
        return false;
      }
      const std::uint32_t seq = read_u32_le(payload + 1);
      const std::uint8_t id = payload[5];
      if (id >= kMaxGamepads) {
        return false;
      }
      const std::uint8_t event_type = payload[6];
      const std::uint32_t pointer_id = read_u32_le(payload + 7);
      const float x = read_f32_le(payload + 11);
      const float y = read_f32_le(payload + 15);
      const float pressure = read_f32_le(payload + 19);
      if (!std::isfinite(x) || !std::isfinite(y) || !std::isfinite(pressure)) {
        return false;
      }
      if (!accept_seq(pads_[id].touch_seq, seq, now_ms)) {
        out_dropped_ooo = true;
        return false;
      }
      out.packets.push_back(webrtc_input::make_gamepad_touch_packet(id, event_type, pointer_id, x, y, pressure));
      return true;
    }

    if (type == MsgType::disconnect_flush) {
      if (len < kDisconnectFlushPayloadSize) {
        return false;
      }
      out.packets = build_disconnect_flush();
      return !out.packets.empty();
    }

    return false;
  }

  std::vector<std::vector<std::uint8_t>> InputSessionTracker::build_disconnect_flush() {
    std::vector<std::vector<std::uint8_t>> packets;
    for (std::size_t id = 0; id < kMaxGamepads; ++id) {
      auto &pad = pads_[id];
      if (!pad.active) {
        continue;
      }
      const std::uint16_t keep_mask = static_cast<std::uint16_t>(pad.last_active_mask | (1u << id));
      packets.push_back(webrtc_input::make_gamepad_state_packet(static_cast<int>(id), keep_mask, 0, 0, 0, 0, 0, 0, 0));
      packets.push_back(webrtc_input::make_gamepad_state_packet(static_cast<int>(id), 0, 0, 0, 0, 0, 0, 0, 0));
      pad.active = false;
      pad.last_active_mask = 0;
      pad.last_buttons = 0;
    }
    return packets;
  }

  std::optional<std::vector<std::uint8_t>> encode_feedback_message(const platf::gamepad_feedback_msg_t &msg) {
    std::vector<std::uint8_t> out;
    switch (msg.type) {
      case platf::gamepad_feedback_e::rumble:
        out.resize(7);
        out[0] = static_cast<std::uint8_t>(MsgType::feedback_rumble);
        write_u16_le(out.data() + 1, msg.id);
        write_u16_le(out.data() + 3, msg.data.rumble.lowfreq);
        write_u16_le(out.data() + 5, msg.data.rumble.highfreq);
        return out;
      case platf::gamepad_feedback_e::rumble_triggers:
        out.resize(7);
        out[0] = static_cast<std::uint8_t>(MsgType::feedback_rumble_triggers);
        write_u16_le(out.data() + 1, msg.id);
        write_u16_le(out.data() + 3, msg.data.rumble_triggers.left_trigger);
        write_u16_le(out.data() + 5, msg.data.rumble_triggers.right_trigger);
        return out;
      case platf::gamepad_feedback_e::set_rgb_led:
        out.resize(6);
        out[0] = static_cast<std::uint8_t>(MsgType::feedback_rgb_led);
        write_u16_le(out.data() + 1, msg.id);
        out[3] = msg.data.rgb_led.r;
        out[4] = msg.data.rgb_led.g;
        out[5] = msg.data.rgb_led.b;
        return out;
      case platf::gamepad_feedback_e::set_adaptive_triggers:
        out.resize(26);
        out[0] = static_cast<std::uint8_t>(MsgType::feedback_adaptive_triggers);
        write_u16_le(out.data() + 1, msg.id);
        out[3] = msg.data.adaptive_triggers.event_flags;
        out[4] = msg.data.adaptive_triggers.type_left;
        out[5] = msg.data.adaptive_triggers.type_right;
        std::memcpy(out.data() + 6, msg.data.adaptive_triggers.left.data(), 10);
        std::memcpy(out.data() + 16, msg.data.adaptive_triggers.right.data(), 10);
        return out;
      case platf::gamepad_feedback_e::set_motion_event_state:
        out.resize(6);
        out[0] = static_cast<std::uint8_t>(MsgType::feedback_motion_state);
        write_u16_le(out.data() + 1, msg.id);
        out[3] = msg.data.motion_event_state.motion_type;
        write_u16_le(out.data() + 4, msg.data.motion_event_state.report_rate);
        return out;
      default:
        return std::nullopt;
    }
  }

  struct TcpPeer : public std::enable_shared_from_this<TcpPeer> {
    tcp::socket socket;
    std::array<std::uint8_t, 2> len_buf {};
    std::vector<std::uint8_t> body_buf;
    std::mutex write_mutex;
    std::deque<std::vector<std::uint8_t>> write_queue;
    std::uint32_t bound_turbo_session_id = 0;

    explicit TcpPeer(tcp::socket s) : socket(std::move(s)) {}

    void enqueue_frame(const std::vector<std::uint8_t> &wire) {
      if (wire.size() > 65535) {
        return;
      }
      std::vector<std::uint8_t> framed(2 + wire.size());
      write_u16_le(framed.data(), static_cast<std::uint16_t>(wire.size()));
      std::memcpy(framed.data() + 2, wire.data(), wire.size());

      bool start_write = false;
      {
        std::lock_guard lg(write_mutex);
        start_write = write_queue.empty();
        write_queue.push_back(std::move(framed));
      }
      if (start_write) {
        do_write();
      }
    }

    void do_write() {
      auto self = shared_from_this();
      std::vector<std::uint8_t> *front = nullptr;
      {
        std::lock_guard lg(write_mutex);
        if (write_queue.empty()) {
          return;
        }
        front = &write_queue.front();
      }
      boost::asio::async_write(
        socket,
        boost::asio::buffer(*front),
        [self](const boost::system::error_code &ec, std::size_t) {
          if (ec) {
            return;
          }
          bool more = false;
          {
            std::lock_guard lg(self->write_mutex);
            if (!self->write_queue.empty()) {
              self->write_queue.pop_front();
            }
            more = !self->write_queue.empty();
          }
          if (more) {
            self->do_write();
          }
        }
      );
    }

    void close() {
      boost::system::error_code ec;
      socket.close(ec);
    }
  };

  struct SessionRecord {
    std::uint32_t launch_session_id = 0;
    std::uint32_t turbo_session_id = 0;
    Key key {};
    std::mutex tracker_mutex;
    InputSessionTracker tracker {};
    PacketSink sink;
    bool has_udp_peer = false;
    udp::endpoint udp_peer {};
    std::weak_ptr<TcpPeer> tcp_peer;
    std::atomic<std::uint64_t> tx_counter {0};
  };

  struct TurboInputServer::Impl {
    std::atomic<bool> running {false};
    boost::asio::io_context io_ctx;
    std::optional<boost::asio::executor_work_guard<boost::asio::io_context::executor_type>> work_guard;
    std::optional<udp::socket> udp_sock;
    std::optional<tcp::acceptor> tcp_acceptor;
    std::array<std::uint8_t, kMaxWireBytes> udp_rx_buf {};
    udp::endpoint udp_rx_ep {};
    std::thread io_thread;

    std::atomic<std::uint16_t> bound_udp_port {0};
    std::atomic<std::uint16_t> bound_tcp_port {0};

    mutable std::mutex sessions_mutex;
    std::unordered_map<std::uint32_t, std::shared_ptr<SessionRecord>> by_launch_id;
    std::unordered_map<std::uint32_t, std::shared_ptr<SessionRecord>> by_turbo_id;

    std::atomic<std::uint64_t> packets_received {0};
    std::atomic<std::uint64_t> packets_dropped_auth {0};
    std::atomic<std::uint64_t> packets_dropped_replay {0};
    std::atomic<std::uint64_t> packets_dropped_ooo {0};
    std::atomic<std::uint64_t> button_edge_recoveries {0};
    std::atomic<std::uint64_t> feedback_sent {0};
    std::atomic<std::uint64_t> last_rtt_us {0};

    std::shared_ptr<SessionRecord> find_by_turbo(std::uint32_t turbo_id) const {
      std::lock_guard lg(sessions_mutex);
      auto it = by_turbo_id.find(turbo_id);
      return it != by_turbo_id.end() ? it->second : nullptr;
    }

    std::shared_ptr<SessionRecord> find_by_launch(std::uint32_t launch_id) const {
      std::lock_guard lg(sessions_mutex);
      auto it = by_launch_id.find(launch_id);
      return it != by_launch_id.end() ? it->second : nullptr;
    }

    void process_encrypted_wire(
      const std::uint8_t *wire,
      std::size_t wire_len,
      const std::optional<udp::endpoint> &udp_ep,
      const std::shared_ptr<TcpPeer> &tcp_peer
    ) {
      if (wire_len < kMinWireBytes) {
        packets_dropped_auth.fetch_add(1, std::memory_order_relaxed);
        return;
      }

      const std::uint32_t claimed_id = read_u32_le(wire);
      auto sess = find_by_turbo(claimed_id);
      if (!sess) {
        packets_dropped_auth.fetch_add(1, std::memory_order_relaxed);
        return;
      }

      std::uint32_t sid = 0;
      std::uint64_t nonce = 0;
      auto plaintext = open_packet(sess->key, wire, wire_len, sid, nonce);
      if (!plaintext) {
        packets_dropped_auth.fetch_add(1, std::memory_order_relaxed);
        return;
      }
      if ((nonce & kDirectionServerToClientMask) != 0) {
        packets_dropped_auth.fetch_add(1, std::memory_order_relaxed);
        return;
      }

      packets_received.fetch_add(1, std::memory_order_relaxed);

      PacketSink sink_copy;
      DecodedInputBatch decoded;
      bool is_ping = false;
      std::uint64_t ping_ts_us = 0;
      bool send_pong = false;

      {
        std::lock_guard tlock(sess->tracker_mutex);
        if (!sess->tracker.rx_replay.accept(nonce & kNonceCounterMask)) {
          packets_dropped_replay.fetch_add(1, std::memory_order_relaxed);
          return;
        }

        if (udp_ep) {
          sess->udp_peer = *udp_ep;
          sess->has_udp_peer = true;
        }
        if (tcp_peer) {
          tcp_peer->bound_turbo_session_id = sid;
          sess->tcp_peer = tcp_peer;
        }

        bool edge_recovered = false;
        bool dropped_ooo = false;
        const bool ok = sess->tracker.decode_payload(
          plaintext->data(),
          plaintext->size(),
          steady_now_ms(),
          decoded,
          edge_recovered,
          dropped_ooo,
          is_ping,
          ping_ts_us
        );
        if (edge_recovered) {
          button_edge_recoveries.fetch_add(1, std::memory_order_relaxed);
        }
        if (dropped_ooo) {
          packets_dropped_ooo.fetch_add(1, std::memory_order_relaxed);
        }
        if (!ok) {
          return;
        }
        if (is_ping) {
          send_pong = true;
        } else {
          sink_copy = sess->sink;
        }
      }

      if (send_pong) {
        std::array<std::uint8_t, kPingPayloadSize> pong_plain {};
        pong_plain[0] = static_cast<std::uint8_t>(MsgType::pong);
        write_u64_le(pong_plain.data() + 1, ping_ts_us);
        send_to_peer(sess, pong_plain.data(), pong_plain.size());
        return;
      }

      if (sink_copy) {
        for (auto &pkt : decoded.packets) {
          sink_copy(std::move(pkt));
        }
      }
    }

    bool send_to_peer(
      const std::shared_ptr<SessionRecord> &sess,
      const std::uint8_t *plaintext,
      std::size_t len
    ) {
      std::uint64_t counter = sess->tx_counter.fetch_add(1, std::memory_order_relaxed);
      std::vector<std::uint8_t> wire;
      if (!seal_packet(sess->key, sess->turbo_session_id, kDirectionServerToClientMask | counter, plaintext, len, wire)) {
        return false;
      }

      std::shared_ptr<TcpPeer> tcp_target;
      std::optional<udp::endpoint> udp_target;
      {
        std::lock_guard tlock(sess->tracker_mutex);
        tcp_target = sess->tcp_peer.lock();
        if (sess->has_udp_peer) {
          udp_target = sess->udp_peer;
        }
      }

      if (tcp_target) {
        tcp_target->enqueue_frame(wire);
        return true;
      }
      if (udp_target && udp_sock && udp_sock->is_open()) {
        auto shared_wire = std::make_shared<std::vector<std::uint8_t>>(std::move(wire));
        udp_sock->async_send_to(
          boost::asio::buffer(*shared_wire),
          *udp_target,
          [shared_wire](const boost::system::error_code &, std::size_t) {}
        );
        return true;
      }
      return false;
    }

    void start_udp_receive() {
      if (!running.load(std::memory_order_acquire) || !udp_sock || !udp_sock->is_open()) {
        return;
      }
      udp_sock->async_receive_from(
        boost::asio::buffer(udp_rx_buf),
        udp_rx_ep,
        [this](const boost::system::error_code &ec, std::size_t bytes) {
          if (!running.load(std::memory_order_acquire)) {
            return;
          }
          if (!ec && bytes > 0) {
            process_encrypted_wire(udp_rx_buf.data(), bytes, udp_rx_ep, nullptr);
          }
          if (ec != boost::asio::error::operation_aborted) {
            start_udp_receive();
          }
        }
      );
    }

    void read_tcp_header(const std::shared_ptr<TcpPeer> &peer) {
      if (!running.load(std::memory_order_acquire)) {
        return;
      }
      boost::asio::async_read(
        peer->socket,
        boost::asio::buffer(peer->len_buf),
        [this, peer](const boost::system::error_code &ec, std::size_t) {
          if (ec || !running.load(std::memory_order_acquire)) {
            handle_tcp_disconnect(peer);
            return;
          }
          const std::uint16_t frame_len = read_u16_le(peer->len_buf.data());
          if (frame_len < kMinWireBytes || frame_len > kMaxWireBytes) {
            handle_tcp_disconnect(peer);
            return;
          }
          peer->body_buf.resize(frame_len);
          boost::asio::async_read(
            peer->socket,
            boost::asio::buffer(peer->body_buf),
            [this, peer](const boost::system::error_code &body_ec, std::size_t) {
              if (body_ec || !running.load(std::memory_order_acquire)) {
                handle_tcp_disconnect(peer);
                return;
              }
              process_encrypted_wire(peer->body_buf.data(), peer->body_buf.size(), std::nullopt, peer);
              read_tcp_header(peer);
            }
          );
        }
      );
    }

    void handle_tcp_disconnect(const std::shared_ptr<TcpPeer> &peer) {
      if (peer->bound_turbo_session_id == 0) {
        return;
      }
      auto sess = find_by_turbo(peer->bound_turbo_session_id);
      if (!sess) {
        return;
      }
      PacketSink sink_copy;
      std::vector<std::vector<std::uint8_t>> flush_pkts;
      {
        std::lock_guard tlock(sess->tracker_mutex);
        auto current_tcp = sess->tcp_peer.lock();
        if (current_tcp.get() == peer.get()) {
          sess->tcp_peer.reset();
          if (!sess->has_udp_peer) {
            flush_pkts = sess->tracker.build_disconnect_flush();
            sink_copy = sess->sink;
          }
        }
      }
      if (sink_copy) {
        for (auto &pkt : flush_pkts) {
          sink_copy(std::move(pkt));
        }
      }
    }

    void start_tcp_accept() {
      if (!running.load(std::memory_order_acquire) || !tcp_acceptor || !tcp_acceptor->is_open()) {
        return;
      }
      tcp_acceptor->async_accept([this](const boost::system::error_code &ec, tcp::socket sock) {
        if (!running.load(std::memory_order_acquire)) {
          return;
        }
        if (!ec) {
          boost::system::error_code opt_ec;
          sock.set_option(tcp::no_delay(true), opt_ec);
          auto peer = std::make_shared<TcpPeer>(std::move(sock));
          read_tcp_header(peer);
        }
        if (ec != boost::asio::error::operation_aborted) {
          start_tcp_accept();
        }
      });
    }
  };

  TurboInputServer::TurboInputServer() : impl_(std::make_unique<Impl>()) {}

  TurboInputServer::~TurboInputServer() {
    stop();
  }

  bool TurboInputServer::start(
    std::uint16_t udp_port,
    std::uint16_t tcp_port,
    bool bind_loopback_only_tcp
  ) {
    if (impl_->running.load(std::memory_order_acquire)) {
      return true;
    }

    impl_->io_ctx.restart();
    impl_->work_guard.emplace(boost::asio::make_work_guard(impl_->io_ctx));

    // Bind UDP listener (prefer dual-stack IPv6 v6_only(false), fallback to IPv4)
    {
      boost::system::error_code ec;
      udp::socket sock(impl_->io_ctx);
      sock.open(udp::v6(), ec);
      if (!ec) {
        sock.set_option(boost::asio::ip::v6_only(false), ec);
        sock.set_option(boost::asio::socket_base::reuse_address(true), ec);
        sock.set_option(boost::asio::socket_base::receive_buffer_size(262144), ec);
        sock.set_option(boost::asio::socket_base::send_buffer_size(262144), ec);
        sock.bind(udp::endpoint(udp::v6(), udp_port), ec);
      }
      if (ec) {
        sock.close(ec);
        ec.clear();
        sock.open(udp::v4(), ec);
        if (!ec) {
          sock.set_option(boost::asio::socket_base::reuse_address(true), ec);
          sock.set_option(boost::asio::socket_base::receive_buffer_size(262144), ec);
          sock.set_option(boost::asio::socket_base::send_buffer_size(262144), ec);
          sock.bind(udp::endpoint(udp::v4(), udp_port), ec);
        }
      }
      if (!ec && sock.is_open()) {
        impl_->bound_udp_port.store(sock.local_endpoint().port(), std::memory_order_release);
        impl_->udp_sock.emplace(std::move(sock));
      } else {
        impl_->bound_udp_port.store(0, std::memory_order_release);
      }
    }

    // Bind loopback TCP listener for ADB Reverse tunneling
    {
      boost::system::error_code ec;
      tcp::acceptor acc(impl_->io_ctx);
      acc.open(tcp::v4(), ec);
      if (!ec) {
        acc.set_option(boost::asio::socket_base::reuse_address(true), ec);
        const auto addr = bind_loopback_only_tcp ? boost::asio::ip::make_address_v4("127.0.0.1") : boost::asio::ip::address_v4::any();
        acc.bind(tcp::endpoint(addr, tcp_port), ec);
        if (!ec) {
          acc.listen(4, ec);
        }
      }
      if (!ec && acc.is_open()) {
        impl_->bound_tcp_port.store(acc.local_endpoint().port(), std::memory_order_release);
        impl_->tcp_acceptor.emplace(std::move(acc));
      } else {
        impl_->bound_tcp_port.store(0, std::memory_order_release);
      }
    }

    if (impl_->bound_udp_port.load(std::memory_order_acquire) == 0 &&
        impl_->bound_tcp_port.load(std::memory_order_acquire) == 0) {
      impl_->work_guard.reset();
      return false;
    }

    impl_->running.store(true, std::memory_order_release);
    impl_->start_udp_receive();
    impl_->start_tcp_accept();
    impl_->io_thread = std::thread([this]() {
      impl_->io_ctx.run();
    });
    return true;
  }

  void TurboInputServer::stop() {
    if (!impl_->running.exchange(false, std::memory_order_acq_rel)) {
      return;
    }

    boost::asio::post(impl_->io_ctx, [this]() {
      boost::system::error_code ec;
      if (impl_->udp_sock) {
        impl_->udp_sock->close(ec);
        impl_->udp_sock.reset();
      }
      if (impl_->tcp_acceptor) {
        impl_->tcp_acceptor->close(ec);
        impl_->tcp_acceptor.reset();
      }
      std::lock_guard lg(impl_->sessions_mutex);
      for (auto &[_, sess] : impl_->by_launch_id) {
        std::lock_guard tlock(sess->tracker_mutex);
        if (auto p = sess->tcp_peer.lock()) {
          p->close();
        }
        sess->sink = nullptr;
      }
    });

    impl_->work_guard.reset();
    impl_->io_ctx.stop();
    if (impl_->io_thread.joinable()) {
      impl_->io_thread.join();
    }
    impl_->bound_udp_port.store(0, std::memory_order_release);
    impl_->bound_tcp_port.store(0, std::memory_order_release);
  }

  void TurboInputServer::register_session(
    std::uint32_t launch_session_id,
    std::uint32_t turbo_session_id,
    const Key &key
  ) {
    if (turbo_session_id == 0) {
      return;
    }
    auto rec = std::make_shared<SessionRecord>();
    rec->launch_session_id = launch_session_id;
    rec->turbo_session_id = turbo_session_id;
    rec->key = key;

    std::lock_guard lg(impl_->sessions_mutex);
    if (auto it = impl_->by_launch_id.find(launch_session_id); it != impl_->by_launch_id.end()) {
      impl_->by_turbo_id.erase(it->second->turbo_session_id);
      impl_->by_launch_id.erase(it);
    }
    impl_->by_launch_id.emplace(launch_session_id, rec);
    impl_->by_turbo_id.emplace(turbo_session_id, rec);
  }

  void TurboInputServer::attach_session(std::uint32_t launch_session_id, PacketSink sink) {
    auto sess = impl_->find_by_launch(launch_session_id);
    if (!sess) {
      return;
    }
    std::lock_guard tlock(sess->tracker_mutex);
    sess->sink = std::move(sink);
  }

  void TurboInputServer::unregister_session(std::uint32_t launch_session_id) {
    std::shared_ptr<SessionRecord> sess;
    {
      std::lock_guard lg(impl_->sessions_mutex);
      auto it = impl_->by_launch_id.find(launch_session_id);
      if (it == impl_->by_launch_id.end()) {
        return;
      }
      sess = it->second;
      impl_->by_turbo_id.erase(sess->turbo_session_id);
      impl_->by_launch_id.erase(it);
    }

    PacketSink sink_copy;
    std::vector<std::vector<std::uint8_t>> flush_pkts;
    std::shared_ptr<TcpPeer> peer_to_close;
    {
      std::lock_guard tlock(sess->tracker_mutex);
      flush_pkts = sess->tracker.build_disconnect_flush();
      sink_copy = std::move(sess->sink);
      sess->sink = nullptr;
      peer_to_close = sess->tcp_peer.lock();
      sess->tcp_peer.reset();
    }
    if (sink_copy) {
      for (auto &pkt : flush_pkts) {
        sink_copy(std::move(pkt));
      }
    }
    if (peer_to_close) {
      boost::asio::post(impl_->io_ctx, [peer_to_close]() {
        peer_to_close->close();
      });
    }
  }

  bool TurboInputServer::has_active_peer(std::uint32_t launch_session_id) const {
    auto sess = impl_->find_by_launch(launch_session_id);
    if (!sess) {
      return false;
    }
    std::lock_guard tlock(sess->tracker_mutex);
    return sess->has_udp_peer || !sess->tcp_peer.expired();
  }

  bool TurboInputServer::try_send_feedback(
    std::uint32_t launch_session_id,
    const platf::gamepad_feedback_msg_t &msg
  ) {
    auto sess = impl_->find_by_launch(launch_session_id);
    if (!sess || !impl_->running.load(std::memory_order_acquire)) {
      return false;
    }
    auto payload = encode_feedback_message(msg);
    if (!payload) {
      return false;
    }
    if (impl_->send_to_peer(sess, payload->data(), payload->size())) {
      impl_->feedback_sent.fetch_add(1, std::memory_order_relaxed);
      return true;
    }
    return false;
  }

  std::uint16_t TurboInputServer::udp_port() const {
    return impl_->bound_udp_port.load(std::memory_order_acquire);
  }

  std::uint16_t TurboInputServer::tcp_port() const {
    return impl_->bound_tcp_port.load(std::memory_order_acquire);
  }

  StatsSnapshot TurboInputServer::stats() const {
    StatsSnapshot snap;
    snap.running = impl_->running.load(std::memory_order_acquire);
    snap.udp_port = impl_->bound_udp_port.load(std::memory_order_acquire);
    snap.tcp_port = impl_->bound_tcp_port.load(std::memory_order_acquire);
    snap.packets_received = impl_->packets_received.load(std::memory_order_relaxed);
    snap.packets_dropped_auth = impl_->packets_dropped_auth.load(std::memory_order_relaxed);
    snap.packets_dropped_replay = impl_->packets_dropped_replay.load(std::memory_order_relaxed);
    snap.packets_dropped_ooo = impl_->packets_dropped_ooo.load(std::memory_order_relaxed);
    snap.button_edge_recoveries = impl_->button_edge_recoveries.load(std::memory_order_relaxed);
    snap.feedback_sent = impl_->feedback_sent.load(std::memory_order_relaxed);
    snap.last_rtt_us = impl_->last_rtt_us.load(std::memory_order_relaxed);

    bool any_udp = false;
    bool any_tcp = false;
    {
      std::lock_guard lg(impl_->sessions_mutex);
      snap.active_sessions = impl_->by_launch_id.size();
      for (const auto &[_, sess] : impl_->by_launch_id) {
        std::lock_guard tlock(sess->tracker_mutex);
        const bool tcp_live = !sess->tcp_peer.expired();
        if (sess->has_udp_peer || tcp_live) {
          ++snap.connected_peers;
        }
        any_udp = any_udp || sess->has_udp_peer;
        any_tcp = any_tcp || tcp_live;
      }
    }
    if (any_udp && any_tcp) {
      snap.active_transport = "mixed";
    } else if (any_tcp) {
      snap.active_transport = "adb_tcp";
    } else if (any_udp) {
      snap.active_transport = "udp";
    }
    return snap;
  }

  TurboInputServer &server() {
    static TurboInputServer instance;
    return instance;
  }
}  // namespace turbo_input

