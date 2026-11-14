#include "src/dsu_server.h"

#ifdef _WIN32
  #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
  #endif
  #include <winsock2.h>
  #include <ws2tcpip.h>
#else
  #include <arpa/inet.h>
  #include <netinet/in.h>
  #include <sys/socket.h>
  #include <unistd.h>
#endif

#include <algorithm>
#include <cmath>
#include <cstring>
#include <random>

namespace dsu {
  namespace {

    constexpr std::size_t kHeaderBytes = 16;
    constexpr std::uint8_t kTriggerThreshold = 32;
    constexpr float kTouchWidth = 1920.0f;
    constexpr float kTouchHeight = 943.0f;
    constexpr auto kSubscriberTimeout = std::chrono::seconds(5);

    constexpr std::uint32_t kBtnUp = 0x0001u;
    constexpr std::uint32_t kBtnDown = 0x0002u;
    constexpr std::uint32_t kBtnLeft = 0x0004u;
    constexpr std::uint32_t kBtnRight = 0x0008u;
    constexpr std::uint32_t kBtnPlay = 0x0010u;
    constexpr std::uint32_t kBtnBack = 0x0020u;
    constexpr std::uint32_t kBtnLsClk = 0x0040u;
    constexpr std::uint32_t kBtnRsClk = 0x0080u;
    constexpr std::uint32_t kBtnLb = 0x0100u;
    constexpr std::uint32_t kBtnRb = 0x0200u;
    constexpr std::uint32_t kBtnSpecial = 0x0400u;
    constexpr std::uint32_t kBtnA = 0x1000u;
    constexpr std::uint32_t kBtnB = 0x2000u;
    constexpr std::uint32_t kBtnX = 0x4000u;
    constexpr std::uint32_t kBtnY = 0x8000u;
    constexpr std::uint32_t kBtnTouchpad = 0x100000u;

    constexpr std::uint8_t kTouchDown = 0x01;
    constexpr std::uint8_t kTouchUp = 0x02;
    constexpr std::uint8_t kTouchMove = 0x03;
    constexpr std::uint8_t kTouchCancel = 0x04;
    constexpr std::uint8_t kTouchCancelAll = 0x07;

    constexpr std::uint16_t read_u16_le(const std::uint8_t *p) noexcept {
      return static_cast<std::uint16_t>(p[0]) | (static_cast<std::uint16_t>(p[1]) << 8);
    }

    constexpr std::uint32_t read_u32_le(const std::uint8_t *p) noexcept {
      return static_cast<std::uint32_t>(p[0]) |
             (static_cast<std::uint32_t>(p[1]) << 8) |
             (static_cast<std::uint32_t>(p[2]) << 16) |
             (static_cast<std::uint32_t>(p[3]) << 24);
    }

    constexpr void write_u16_le(std::uint8_t *p, std::uint16_t v) noexcept {
      p[0] = static_cast<std::uint8_t>(v & 0xFFu);
      p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFFu);
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

    inline void write_f32_le(std::uint8_t *p, float v) noexcept {
      std::uint32_t bits = 0;
      std::memcpy(&bits, &v, sizeof(bits));
      write_u32_le(p, bits);
    }

    constexpr std::array<std::uint32_t, 256> make_crc32_table() noexcept {
      std::array<std::uint32_t, 256> table {};
      for (std::uint32_t i = 0; i < 256; ++i) {
        std::uint32_t c = i;
        for (int b = 0; b < 8; ++b) {
          c = (c & 1u) ? (0xEDB88320u ^ (c >> 1)) : (c >> 1);
        }
        table[i] = c;
      }
      return table;
    }

    constexpr auto kCrcTable = make_crc32_table();

    std::uint8_t battery_byte(const pad_state_t &pad) noexcept {
      if (pad.battery_state == 3) {
        return 0xEE;
      }
      if (pad.battery_state == 5) {
        return 0xEF;
      }
      if (pad.battery_state == 0 || pad.battery_state == 1 || pad.battery_percent == 0xFF) {
        return 0;
      }
      if (pad.battery_percent <= 10) return 1;
      if (pad.battery_percent <= 40) return 2;
      if (pad.battery_percent <= 70) return 3;
      if (pad.battery_percent <= 99) return 4;
      return 5;
    }

    void write_slot_info(std::uint8_t *dst, std::uint8_t slot, const pad_state_t *pad) noexcept {
      std::memset(dst, 0, 11);
      dst[0] = slot;
      if (pad && pad->connected) {
        dst[1] = 2;  // Connected
        dst[2] = 2;  // Full gyro
        dst[3] = 1;  // USB
        const auto mac = slot_mac(slot);
        std::memcpy(dst + 4, mac.data(), mac.size());
        dst[10] = battery_byte(*pad);
      }
    }

    void finalize_server_packet(std::uint8_t *buf, std::size_t total_len, std::uint32_t server_id, std::uint32_t msg_type) noexcept {
      buf[0] = 'D';
      buf[1] = 'S';
      buf[2] = 'U';
      buf[3] = 'S';
      write_u16_le(buf + 4, kProtocolVersion);
      write_u16_le(buf + 6, static_cast<std::uint16_t>(total_len - kHeaderBytes));
      write_u32_le(buf + 8, 0);
      write_u32_le(buf + 12, server_id);
      write_u32_le(buf + 16, msg_type);
      write_u32_le(buf + 8, crc32_packet(buf, total_len));
    }

  }  // namespace

  std::array<std::uint8_t, 6> slot_mac(std::uint8_t slot) noexcept {
    return {0, 0, 0, 0, 0, static_cast<std::uint8_t>(slot + 1)};
  }

  std::uint32_t crc32_packet(const std::uint8_t *data, std::size_t len) noexcept {
    if (!data || len < kHeaderBytes) {
      return 0;
    }
    std::uint32_t crc = 0xFFFFFFFFu;
    for (std::size_t i = 0; i < len; ++i) {
      const std::uint8_t byte = (i >= 8 && i < 12) ? 0u : data[i];
      crc = kCrcTable[(crc ^ byte) & 0xFFu] ^ (crc >> 8);
    }
    return crc ^ 0xFFFFFFFFu;
  }

  std::optional<request_t> parse_request(const std::uint8_t *data, std::size_t len) noexcept {
    if (!data || len < kHeaderBytes + 4) {
      return std::nullopt;
    }
    if (std::memcmp(data, "DSUC", 4) != 0) {
      return std::nullopt;
    }
    if (read_u16_le(data + 4) > kProtocolVersion) {
      return std::nullopt;
    }
    const std::size_t payload_len = read_u16_le(data + 6);
    const std::size_t declared_len = kHeaderBytes + payload_len;
    if (payload_len < 4 || declared_len > len) {
      return std::nullopt;
    }
    if (read_u32_le(data + 8) != crc32_packet(data, declared_len)) {
      return std::nullopt;
    }

    request_t req;
    req.client_id = read_u32_le(data + 12);
    const std::uint32_t msg_type = read_u32_le(data + 16);
    const std::uint8_t *body = data + kHeaderBytes + 4;
    const std::size_t body_len = declared_len - (kHeaderBytes + 4);

    if (msg_type == kMsgVersion) {
      req.kind = request_t::kind_e::version;
      return req;
    }
    if (msg_type == kMsgPorts) {
      if (body_len < 4) {
        return std::nullopt;
      }
      const std::uint32_t raw_count = read_u32_le(body);
      if (raw_count > kSlots || body_len < 4 + raw_count) {
        return std::nullopt;
      }
      req.kind = request_t::kind_e::ports;
      req.port_count = static_cast<std::uint8_t>(raw_count);
      for (std::size_t i = 0; i < raw_count; ++i) {
        if (body[4 + i] >= kSlots) {
          return std::nullopt;
        }
        req.ports[i] = body[4 + i];
      }
      return req;
    }
    if (msg_type == kMsgPadData) {
      if (body_len < 8) {
        return std::nullopt;
      }
      req.kind = request_t::kind_e::pad_data;
      req.sub_flags = body[0];
      req.sub_slot = body[1];
      std::memcpy(req.sub_mac.data(), body + 2, 6);
      return req;
    }
    return std::nullopt;
  }

  std::vector<std::uint8_t> build_version_reply(std::uint32_t server_id) {
    std::vector<std::uint8_t> out(kHeaderBytes + 4 + 4, 0);
    write_u16_le(out.data() + 20, kProtocolVersion);
    finalize_server_packet(out.data(), out.size(), server_id, kMsgVersion);
    return out;
  }

  std::vector<std::uint8_t> build_port_info_reply(std::uint32_t server_id, std::uint8_t slot, const pad_state_t *pad) {
    std::vector<std::uint8_t> out(kHeaderBytes + 4 + 12, 0);
    write_slot_info(out.data() + 20, slot, pad);
    out[31] = 0;
    finalize_server_packet(out.data(), out.size(), server_id, kMsgPorts);
    return out;
  }

  std::array<std::uint8_t, kPadDataBytes> build_pad_data_reply(
    std::uint32_t server_id,
    std::uint8_t slot,
    const pad_state_t &pad,
    std::uint32_t packet_number
  ) noexcept {
    std::array<std::uint8_t, kPadDataBytes> out {};
    write_slot_info(out.data() + 20, slot, &pad);
    out[31] = 1;
    write_u32_le(out.data() + 32, packet_number);

    auto bit = [&](std::uint32_t flag, std::uint8_t val) -> std::uint8_t {
      return (pad.buttons & flag) ? val : 0u;
    };
    const std::uint8_t b1 =
      bit(kBtnLeft, 0x80u) | bit(kBtnDown, 0x40u) | bit(kBtnRight, 0x20u) | bit(kBtnUp, 0x10u) |
      bit(kBtnPlay, 0x08u) | bit(kBtnRsClk, 0x04u) | bit(kBtnLsClk, 0x02u) | bit(kBtnBack, 0x01u);
    std::uint8_t b2 =
      bit(kBtnX, 0x80u) | bit(kBtnA, 0x40u) | bit(kBtnB, 0x20u) | bit(kBtnY, 0x10u) |
      bit(kBtnRb, 0x08u) | bit(kBtnLb, 0x04u);
    if (pad.rt > kTriggerThreshold) b2 |= 0x02u;
    if (pad.lt > kTriggerThreshold) b2 |= 0x01u;
    out[36] = b1;
    out[37] = b2;
    out[38] = (pad.buttons & kBtnSpecial) ? 1u : 0u;
    out[39] = (pad.buttons & kBtnTouchpad) ? 1u : 0u;

    auto axis = [](std::int16_t v) -> std::uint8_t {
      return static_cast<std::uint8_t>((static_cast<std::int32_t>(v) + 32768) >> 8);
    };
    out[40] = axis(pad.ls_x);
    out[41] = axis(pad.ls_y);
    out[42] = axis(pad.rs_x);
    out[43] = axis(pad.rs_y);

    auto analog = [&](std::uint32_t flag) -> std::uint8_t {
      return (pad.buttons & flag) ? 0xFFu : 0u;
    };
    out[44] = analog(kBtnLeft);
    out[45] = analog(kBtnDown);
    out[46] = analog(kBtnRight);
    out[47] = analog(kBtnUp);
    out[48] = analog(kBtnX);
    out[49] = analog(kBtnA);
    out[50] = analog(kBtnB);
    out[51] = analog(kBtnY);
    out[52] = analog(kBtnRb);
    out[53] = analog(kBtnLb);
    out[54] = pad.rt;
    out[55] = pad.lt;

    for (std::size_t t = 0; t < 2; ++t) {
      const auto &tc = pad.touches[t];
      std::uint8_t *tp = out.data() + 56 + t * 6;
      if (tc.active) {
        const auto tx = static_cast<std::uint16_t>(std::lround(std::clamp(tc.x, 0.0f, 1.0f) * (kTouchWidth - 1.0f)));
        const auto ty = static_cast<std::uint16_t>(std::lround(std::clamp(tc.y, 0.0f, 1.0f) * (kTouchHeight - 1.0f)));
        tp[0] = 1;
        tp[1] = tc.touch_id;
        write_u16_le(tp + 2, tx);
        write_u16_le(tp + 4, ty);
      }
    }

    write_u64_le(out.data() + 68, pad.motion_us);
    for (int i = 0; i < 3; ++i) {
      write_f32_le(out.data() + 76 + i * 4, -pad.accel_mps2[i] / kStandardGravity);
    }
    write_f32_le(out.data() + 88, pad.gyro_dps[0]);
    write_f32_le(out.data() + 92, -pad.gyro_dps[1]);
    write_f32_le(out.data() + 96, -pad.gyro_dps[2]);

    finalize_server_packet(out.data(), out.size(), server_id, kMsgPadData);
    return out;
  }

  server &server::instance() noexcept {
    static server inst;
    return inst;
  }

  server::~server() {
    stop();
  }

  bool server::start(std::uint16_t port, const std::string &bind_ip) {
    if (running_.load(std::memory_order_acquire)) {
      return true;
    }

#ifdef _WIN32
    WSADATA wsa {};
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
      return false;
    }
    wsa_initialized_ = true;
    SOCKET s = ::socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (s == INVALID_SOCKET) {
      WSACleanup();
      wsa_initialized_ = false;
      return false;
    }
    DWORD timeout_ms = 150;
    ::setsockopt(s, SOL_SOCKET, SO_RCVTIMEO, reinterpret_cast<const char *>(&timeout_ms), sizeof(timeout_ms));
#else
    int s = ::socket(AF_INET, SOCK_DGRAM, 0);
    if (s < 0) {
      return false;
    }
    struct timeval tv {0, 150000};
    ::setsockopt(s, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
#endif

    sockaddr_in addr {};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    if (::inet_pton(AF_INET, bind_ip.c_str(), &addr.sin_addr) != 1) {
      addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    }

    if (::bind(s, reinterpret_cast<const sockaddr *>(&addr), sizeof(addr)) != 0) {
#ifdef _WIN32
      ::closesocket(s);
      WSACleanup();
      wsa_initialized_ = false;
#else
      ::close(s);
#endif
      return false;
    }

    sockaddr_in bound {};
#ifdef _WIN32
    int bound_len = sizeof(bound);
#else
    socklen_t bound_len = sizeof(bound);
#endif
    if (::getsockname(s, reinterpret_cast<sockaddr *>(&bound), &bound_len) == 0) {
      bound_port_.store(ntohs(bound.sin_port), std::memory_order_release);
    } else {
      bound_port_.store(port, std::memory_order_release);
    }

    std::random_device rd;
    server_id_ = (static_cast<std::uint32_t>(rd()) ^ 0x4A554A4Fu);
    started_at_ = std::chrono::steady_clock::now();
#ifdef _WIN32
    sock_ = static_cast<std::uintptr_t>(s);
#else
    sock_ = s;
#endif
    running_.store(true, std::memory_order_release);
    recv_thread_ = std::thread([this]() {
      recv_loop();
    });
    return true;
  }

  void server::stop() {
    if (!running_.exchange(false, std::memory_order_acq_rel)) {
      return;
    }
#ifdef _WIN32
    if (sock_ != ~std::uintptr_t(0)) {
      ::closesocket(static_cast<SOCKET>(sock_));
      sock_ = ~std::uintptr_t(0);
    }
#else
    if (sock_ >= 0) {
      ::close(sock_);
      sock_ = -1;
    }
#endif
    if (recv_thread_.joinable()) {
      recv_thread_.join();
    }
    {
      std::lock_guard<std::mutex> lg(mutex_);
      subscribers_.clear();
      pads_ = {};
      packet_numbers_ = {};
    }
    bound_port_.store(0, std::memory_order_release);
#ifdef _WIN32
    if (wsa_initialized_) {
      WSACleanup();
      wsa_initialized_ = false;
    }
#endif
  }

  std::uint64_t server::now_us() const noexcept {
    const auto delta = std::chrono::steady_clock::now() - started_at_;
    return static_cast<std::uint64_t>(std::max<std::int64_t>(0, std::chrono::duration_cast<std::chrono::microseconds>(delta).count()));
  }

  void server::send_raw(const std::uint8_t *data, std::size_t len, const void *addr, int addr_len) {
    if (!running_.load(std::memory_order_acquire)) {
      return;
    }
#ifdef _WIN32
    if (sock_ == ~std::uintptr_t(0)) {
      return;
    }
    ::sendto(static_cast<SOCKET>(sock_), reinterpret_cast<const char *>(data), static_cast<int>(len), 0, static_cast<const sockaddr *>(addr), addr_len);
#else
    if (sock_ < 0) {
      return;
    }
    ::sendto(sock_, data, len, 0, static_cast<const sockaddr *>(addr), static_cast<socklen_t>(addr_len));
#endif
  }

  void server::recv_loop() {
    std::array<std::uint8_t, 512> buf {};
    while (running_.load(std::memory_order_acquire)) {
      ::sockaddr_storage from {};
#ifdef _WIN32
      int from_len = sizeof(from);
      const SOCKET s = static_cast<SOCKET>(sock_);
      if (s == INVALID_SOCKET) {
        break;
      }
      const int n = ::recvfrom(s, reinterpret_cast<char *>(buf.data()), static_cast<int>(buf.size()), 0, reinterpret_cast<sockaddr *>(&from), &from_len);
#else
      socklen_t from_len = sizeof(from);
      if (sock_ < 0) {
        break;
      }
      const ssize_t n = ::recvfrom(sock_, buf.data(), buf.size(), 0, reinterpret_cast<sockaddr *>(&from), &from_len);
#endif
      if (n <= 0) {
        continue;
      }
      handle_packet(buf.data(), static_cast<std::size_t>(n), &from, static_cast<int>(from_len));
    }
  }

  void server::handle_packet(const std::uint8_t *data, std::size_t len, const void *from, int from_len) {
    if (!from || from_len <= 0) {
      return;
    }
    const auto req = parse_request(data, len);
    if (!req) {
      return;
    }
    if (req->kind == request_t::kind_e::version) {
      const auto reply = build_version_reply(server_id_);
      send_raw(reply.data(), reply.size(), from, from_len);
      return;
    }
    if (req->kind == request_t::kind_e::ports) {
      std::vector<std::vector<std::uint8_t>> replies;
      {
        std::lock_guard<std::mutex> lg(mutex_);
        replies.reserve(req->port_count);
        for (std::uint8_t i = 0; i < req->port_count; ++i) {
          const std::uint8_t s = req->ports[i];
          replies.push_back(build_port_info_reply(server_id_, s, pads_[s].connected ? &pads_[s] : nullptr));
        }
      }
      for (const auto &reply : replies) {
        send_raw(reply.data(), reply.size(), from, from_len);
      }
      return;
    }

    const auto now = std::chrono::steady_clock::now();
    std::vector<std::array<std::uint8_t, kPadDataBytes>> immediate_replies;
    {
      std::lock_guard<std::mutex> lg(mutex_);
      auto it = std::find_if(subscribers_.begin(), subscribers_.end(), [&](const subscriber_t &sub) {
        return sub.addr_len == from_len && std::memcmp(sub.raw_addr.data(), from, from_len) == 0;
      });
      if (it == subscribers_.end()) {
        subscriber_t sub;
        sub.addr_len = std::min<int>(from_len, static_cast<int>(sub.raw_addr.size()));
        std::memcpy(sub.raw_addr.data(), from, sub.addr_len);
        sub.flags = req->sub_flags;
        sub.slot = req->sub_slot;
        sub.mac = req->sub_mac;
        sub.last_seen = now;
        subscribers_.push_back(sub);
      } else {
        it->flags = req->sub_flags;
        it->slot = req->sub_slot;
        it->mac = req->sub_mac;
        it->last_seen = now;
      }

      for (std::uint8_t s = 0; s < kSlots; ++s) {
        if (!pads_[s].connected) {
          continue;
        }
        const auto mac = slot_mac(s);
        const bool match = (req->sub_flags == 0) ||
                           ((req->sub_flags & 1u) && req->sub_slot == s) ||
                           ((req->sub_flags & 2u) && std::memcmp(req->sub_mac.data(), mac.data(), 6) == 0);
        if (match) {
          immediate_replies.push_back(build_pad_data_reply(server_id_, s, pads_[s], packet_numbers_[s]++));
        }
      }
    }
    for (const auto &pkt : immediate_replies) {
      send_raw(pkt.data(), pkt.size(), from, from_len);
    }
  }

  void server::emit_pad_update_locked(std::uint8_t slot, std::unique_lock<std::mutex> &lock) {
    if (!running_.load(std::memory_order_acquire) || subscribers_.empty()) {
      return;
    }
    const auto now = std::chrono::steady_clock::now();
    std::erase_if(subscribers_, [&](const subscriber_t &sub) {
      return (now - sub.last_seen) > kSubscriberTimeout;
    });
    if (subscribers_.empty()) {
      return;
    }

    const auto mac = slot_mac(slot);
    std::vector<subscriber_t> targets;
    for (const auto &sub : subscribers_) {
      const bool match = (sub.flags == 0) ||
                         ((sub.flags & 1u) && sub.slot == slot) ||
                         ((sub.flags & 2u) && std::memcmp(sub.mac.data(), mac.data(), 6) == 0);
      if (match) {
        targets.push_back(sub);
      }
    }
    if (targets.empty()) {
      return;
    }

    const auto pkt = build_pad_data_reply(server_id_, slot, pads_[slot], packet_numbers_[slot]++);
    lock.unlock();
    for (const auto &target : targets) {
      send_raw(pkt.data(), pkt.size(), target.raw_addr.data(), target.addr_len);
    }
  }

  void server::on_pad_connected(int slot) {
    if (slot < 0 || slot >= static_cast<int>(kSlots) || !running_.load(std::memory_order_acquire)) {
      return;
    }
    std::unique_lock<std::mutex> lg(mutex_);
    pads_[slot] = pad_state_t {};
    pads_[slot].connected = true;
    emit_pad_update_locked(static_cast<std::uint8_t>(slot), lg);
  }

  void server::on_pad_disconnected(int slot) {
    if (slot < 0 || slot >= static_cast<int>(kSlots)) {
      return;
    }
    std::lock_guard<std::mutex> lg(mutex_);
    pads_[slot] = pad_state_t {};
  }

  void server::on_pad_state(
    int slot,
    std::uint32_t buttons,
    std::uint8_t lt,
    std::uint8_t rt,
    std::int16_t ls_x,
    std::int16_t ls_y,
    std::int16_t rs_x,
    std::int16_t rs_y
  ) {
    if (slot < 0 || slot >= static_cast<int>(kSlots) || !running_.load(std::memory_order_acquire)) {
      return;
    }
    std::unique_lock<std::mutex> lg(mutex_);
    auto &pad = pads_[slot];
    pad.connected = true;
    pad.buttons = buttons;
    pad.lt = lt;
    pad.rt = rt;
    pad.ls_x = ls_x;
    pad.ls_y = ls_y;
    pad.rs_x = rs_x;
    pad.rs_y = rs_y;
    emit_pad_update_locked(static_cast<std::uint8_t>(slot), lg);
  }

  void server::on_pad_motion(int slot, std::uint8_t motion_type, float x, float y, float z, std::uint64_t timestamp_us) {
    if (slot < 0 || slot >= static_cast<int>(kSlots) || !running_.load(std::memory_order_acquire)) {
      return;
    }
    if (!std::isfinite(x) || !std::isfinite(y) || !std::isfinite(z)) {
      return;
    }
    std::unique_lock<std::mutex> lg(mutex_);
    auto &pad = pads_[slot];
    pad.connected = true;
    pad.motion_us = (timestamp_us != 0) ? timestamp_us : now_us();
    if (motion_type == 1) {
      pad.accel_mps2 = {x, y, z};
    } else if (motion_type == 2) {
      pad.gyro_dps = {x, y, z};
    } else {
      return;
    }
    emit_pad_update_locked(static_cast<std::uint8_t>(slot), lg);
  }

  void server::on_pad_touch(int slot, std::uint8_t event_type, std::uint32_t pointer_id, float x, float y) {
    if (slot < 0 || slot >= static_cast<int>(kSlots) || !running_.load(std::memory_order_acquire)) {
      return;
    }
    std::unique_lock<std::mutex> lg(mutex_);
    auto &pad = pads_[slot];
    pad.connected = true;
    if (event_type == kTouchCancelAll) {
      pad.touches = {};
    } else if (event_type == kTouchUp || event_type == kTouchCancel) {
      for (auto &tc : pad.touches) {
        if (tc.active && tc.pointer_id == pointer_id) {
          tc = {};
        }
      }
    } else if (event_type == kTouchDown || event_type == kTouchMove) {
      touch_contact_t *target = nullptr;
      for (auto &tc : pad.touches) {
        if (tc.active && tc.pointer_id == pointer_id) {
          target = &tc;
          break;
        }
      }
      if (!target) {
        for (auto &tc : pad.touches) {
          if (!tc.active) {
            target = &tc;
            target->active = true;
            target->pointer_id = pointer_id;
            target->touch_id = pad.next_touch_id++;
            break;
          }
        }
      }
      if (target) {
        target->x = std::clamp(x, 0.0f, 1.0f);
        target->y = std::clamp(y, 0.0f, 1.0f);
      }
    }
    emit_pad_update_locked(static_cast<std::uint8_t>(slot), lg);
  }

  void server::on_pad_battery(int slot, std::uint8_t battery_state, std::uint8_t battery_percent) {
    if (slot < 0 || slot >= static_cast<int>(kSlots) || !running_.load(std::memory_order_acquire)) {
      return;
    }
    std::unique_lock<std::mutex> lg(mutex_);
    pads_[slot].connected = true;
    pads_[slot].battery_state = battery_state;
    pads_[slot].battery_percent = battery_percent;
    emit_pad_update_locked(static_cast<std::uint8_t>(slot), lg);
  }

}  // namespace dsu
