#pragma once

#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <mutex>
#include <optional>
#include <string>
#include <thread>
#include <vector>

namespace dsu {

  inline constexpr std::uint16_t kDefaultPort = 26760;
  inline constexpr std::uint16_t kProtocolVersion = 1001;
  inline constexpr std::size_t kSlots = 4;
  inline constexpr std::uint32_t kMsgVersion = 0x100000u;
  inline constexpr std::uint32_t kMsgPorts = 0x100001u;
  inline constexpr std::uint32_t kMsgPadData = 0x100002u;
  inline constexpr std::size_t kPadDataBytes = 100;
  inline constexpr float kStandardGravity = 9.80665f;

  struct touch_contact_t {
    bool active {false};
    std::uint32_t pointer_id {0};
    std::uint8_t touch_id {0};
    float x {0.0f};
    float y {0.0f};
  };

  struct pad_state_t {
    bool connected {false};
    std::uint32_t buttons {0};
    std::uint8_t lt {0};
    std::uint8_t rt {0};
    std::int16_t ls_x {0};
    std::int16_t ls_y {0};
    std::int16_t rs_x {0};
    std::int16_t rs_y {0};
    std::array<float, 3> accel_mps2 {0.0f, kStandardGravity, 0.0f};
    std::array<float, 3> gyro_dps {0.0f, 0.0f, 0.0f};
    std::uint64_t motion_us {0};
    std::array<touch_contact_t, 2> touches {};
    std::uint8_t next_touch_id {0};
    std::uint8_t battery_state {0};
    std::uint8_t battery_percent {0xFF};
  };

  struct request_t {
    enum class kind_e { version, ports, pad_data } kind {kind_e::version};
    std::uint32_t client_id {0};
    std::uint8_t port_count {0};
    std::array<std::uint8_t, kSlots> ports {};
    std::uint8_t sub_flags {0};
    std::uint8_t sub_slot {0};
    std::array<std::uint8_t, 6> sub_mac {};
  };

  [[nodiscard]] std::uint32_t crc32_packet(const std::uint8_t *data, std::size_t len) noexcept;
  [[nodiscard]] std::optional<request_t> parse_request(const std::uint8_t *data, std::size_t len) noexcept;
  [[nodiscard]] std::array<std::uint8_t, 6> slot_mac(std::uint8_t slot) noexcept;
  [[nodiscard]] std::vector<std::uint8_t> build_version_reply(std::uint32_t server_id);
  [[nodiscard]] std::vector<std::uint8_t> build_port_info_reply(std::uint32_t server_id, std::uint8_t slot, const pad_state_t *pad);
  [[nodiscard]] std::array<std::uint8_t, kPadDataBytes> build_pad_data_reply(
    std::uint32_t server_id,
    std::uint8_t slot,
    const pad_state_t &pad,
    std::uint32_t packet_number
  ) noexcept;

  class server {
  public:
    static server &instance() noexcept;

    ~server();
    server(const server &) = delete;
    server &operator=(const server &) = delete;

    /// Binds loopback read-only CEMUHooK UDP server (port 0 chooses an ephemeral port for tests).
    bool start(std::uint16_t port = kDefaultPort, const std::string &bind_ip = "127.0.0.1");
    void stop();

    [[nodiscard]] bool is_running() const noexcept {
      return running_.load(std::memory_order_acquire);
    }

    [[nodiscard]] std::uint16_t bound_port() const noexcept {
      return bound_port_.load(std::memory_order_acquire);
    }

    void on_pad_connected(int slot);
    void on_pad_disconnected(int slot);
    void on_pad_state(int slot, std::uint32_t buttons, std::uint8_t lt, std::uint8_t rt, std::int16_t ls_x, std::int16_t ls_y, std::int16_t rs_x, std::int16_t rs_y);
    void on_pad_motion(int slot, std::uint8_t motion_type, float x, float y, float z, std::uint64_t timestamp_us = 0);
    void on_pad_touch(int slot, std::uint8_t event_type, std::uint32_t pointer_id, float x, float y);
    void on_pad_battery(int slot, std::uint8_t battery_state, std::uint8_t battery_percent);

  private:
    server() = default;

    struct subscriber_t {
      std::array<std::uint8_t, 128> raw_addr {};
      int addr_len {0};
      std::uint8_t flags {0};
      std::uint8_t slot {0};
      std::array<std::uint8_t, 6> mac {};
      std::chrono::steady_clock::time_point last_seen {};
    };

    void recv_loop();
    void handle_packet(const std::uint8_t *data, std::size_t len, const void *from, int from_len);
    void emit_pad_update_locked(std::uint8_t slot, std::unique_lock<std::mutex> &lock);
    void send_raw(const std::uint8_t *data, std::size_t len, const void *addr, int addr_len);
    std::uint64_t now_us() const noexcept;

    std::atomic_bool running_ {false};
    std::atomic_uint16_t bound_port_ {0};
    std::uint32_t server_id_ {0x4A554A4Fu};
    std::chrono::steady_clock::time_point started_at_ {};

#ifdef _WIN32
    std::uintptr_t sock_ {~std::uintptr_t(0)};
    bool wsa_initialized_ {false};
#else
    int sock_ {-1};
#endif

    std::thread recv_thread_;
    mutable std::mutex mutex_;
    std::array<pad_state_t, kSlots> pads_ {};
    std::array<std::uint32_t, kSlots> packet_numbers_ {};
    std::vector<subscriber_t> subscribers_;
  };

}  // namespace dsu
