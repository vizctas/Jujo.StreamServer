/**
 * @file src/platform/windows/usbip_dualsense_backend.cpp
 * @brief Embedded C++20 USB/IP v1.1.1 server + usbip2_ude VHCI driver integration for DualSense.
 */

#include "usbip_dualsense_backend.h"

#ifndef SUNSHINE_TESTS
#include "src/logging.h"
#endif

// clang-format off
#include <WinSock2.h>
#include <WS2tcpip.h>
#include <Windows.h>
#include <SetupAPI.h>
#include <winioctl.h>
// clang-format on

#include <algorithm>
#include <condition_variable>
#include <cstdio>
#include <cstring>
#include <map>
#include <mutex>
#include <thread>
#include <unordered_map>
#include <vector>

namespace platf {

  namespace {

    std::atomic<std::uint16_t> g_usbip_loopback_port {0};
    std::atomic<std::size_t> g_usbip_active_slots {0};

    // usbip-win2 GUID_DEVINTERFACE_USBIP_VHCI
    // {B4030C06-DC5F-4FCC-87EB-E5515A0935C0}
    constexpr GUID kGuidDevInterfaceUsbipVhci = {
      0xB4030C06,
      0xDC5F,
      0x4FCC,
      {0x87, 0xEB, 0xE5, 0x51, 0x5A, 0x09, 0x35, 0xC0}
    };

    constexpr std::uint16_t kUsbipVersion = 0x0111;
    constexpr std::uint16_t kOpReqImport = 0x8003;
    constexpr std::uint16_t kOpRepImport = 0x0003;
    constexpr std::uint16_t kOpReqDevlist = 0x8005;
    constexpr std::uint16_t kOpRepDevlist = 0x0005;
    constexpr std::uint32_t kUsbSpeedHigh = 3;

    constexpr std::uint32_t kCmdSubmit = 1;
    constexpr std::uint32_t kCmdUnlink = 2;
    constexpr std::uint32_t kRetSubmit = 3;
    constexpr std::uint32_t kRetUnlink = 4;

    constexpr int kUsbipBusIdSize = 32;
    constexpr int kUsbipDevPathMax = 256;
    constexpr int kUsbipSerialBufSz = 16;

    // usbip-win2 IOCTLs (include/usbip/vhci.h)
    constexpr DWORD kIoctlPlugoutHardware =
      CTL_CODE(FILE_DEVICE_UNKNOWN, 0x801, METHOD_BUFFERED, FILE_READ_DATA | FILE_WRITE_DATA);
    constexpr DWORD kIoctlPluginHardwareOnce =
      CTL_CODE(FILE_DEVICE_UNKNOWN, 0x806, METHOD_BUFFERED, FILE_READ_DATA | FILE_WRITE_DATA);

#pragma pack(push, 1)
    struct UsbIpPluginHardwareIoctl {
      ULONG size;
      int port;
      ULONG location_hash;
      char busid[kUsbipBusIdSize];
      char service[32];
      char host[1025];
      char serial[kUsbipSerialBufSz];
      bool wsk_events;
    };

    struct UsbIpPlugoutHardwareIoctl {
      ULONG size;
      int port;
    };

    struct UsbIpOpCommon {
      std::uint16_t version;
      std::uint16_t code;
      std::uint32_t status;
    };

    struct UsbIpUsbDeviceWire {
      char path[kUsbipDevPathMax];
      char busid[kUsbipBusIdSize];
      std::uint32_t busnum;
      std::uint32_t devnum;
      std::uint32_t speed;
      std::uint16_t idVendor;
      std::uint16_t idProduct;
      std::uint16_t bcdDevice;
      std::uint8_t bDeviceClass;
      std::uint8_t bDeviceSubClass;
      std::uint8_t bDeviceProtocol;
      std::uint8_t bConfigurationValue;
      std::uint8_t bNumConfigurations;
      std::uint8_t bNumInterfaces;
    };

    struct UsbIpWireHeader {
      std::uint32_t command;
      std::uint32_t seqnum;
      std::uint32_t devid;
      std::uint32_t direction;
      std::uint32_t ep;
      union {
        struct {
          std::uint32_t transfer_flags;
          std::int32_t transfer_buffer_length;
          std::int32_t start_frame;
          std::int32_t number_of_packets;
          std::int32_t interval;
          std::uint8_t setup[8];
        } cmd_submit;
        struct {
          std::int32_t status;
          std::int32_t actual_length;
          std::int32_t start_frame;
          std::int32_t number_of_packets;
          std::int32_t error_count;
          std::uint8_t pad[8];
        } ret_submit;
        struct {
          std::uint32_t seqnum;
          std::uint8_t pad[24];
        } cmd_unlink;
        struct {
          std::int32_t status;
          std::uint8_t pad[24];
        } ret_unlink;
      };
    };
#pragma pack(pop)

    static_assert(sizeof(UsbIpWireHeader) == 48, "USB/IP header must be 48 bytes");

    void log_info_msg(const std::string &msg) {
#ifndef SUNSHINE_TESTS
      BOOST_LOG(info) << msg;
#else
      (void) msg;
#endif
    }

    void log_warn_msg(const std::string &msg) {
#ifndef SUNSHINE_TESTS
      BOOST_LOG(warning) << msg;
#else
      (void) msg;
#endif
    }

    inline std::uint16_t be16(std::uint16_t v) {
      return htons(v);
    }

    inline std::uint32_t be32(std::uint32_t v) {
      return htonl(v);
    }

    bool recv_exact(SOCKET sock, void *dst, std::size_t len) {
      auto *p = static_cast<char *>(dst);
      std::size_t got = 0;
      while (got < len) {
        const int r = ::recv(sock, p + got, static_cast<int>(len - got), 0);
        if (r <= 0) {
          return false;
        }
        got += static_cast<std::size_t>(r);
      }
      return true;
    }

    bool send_exact(SOCKET sock, const void *src, std::size_t len) {
      const auto *p = static_cast<const char *>(src);
      std::size_t sent = 0;
      while (sent < len) {
        const int r = ::send(sock, p + sent, static_cast<int>(len - sent), 0);
        if (r <= 0) {
          return false;
        }
        sent += static_cast<std::size_t>(r);
      }
      return true;
    }

    HANDLE open_vhci_device() {
      HDEVINFO dev_info = SetupDiGetClassDevsW(
        &kGuidDevInterfaceUsbipVhci,
        nullptr,
        nullptr,
        DIGCF_PRESENT | DIGCF_DEVICEINTERFACE);
      if (dev_info == INVALID_HANDLE_VALUE) {
        return INVALID_HANDLE_VALUE;
      }

      SP_DEVICE_INTERFACE_DATA if_data {};
      if_data.cbSize = sizeof(if_data);
      HANDLE handle = INVALID_HANDLE_VALUE;
      if (SetupDiEnumDeviceInterfaces(dev_info, nullptr, &kGuidDevInterfaceUsbipVhci, 0, &if_data)) {
        DWORD required = 0;
        SetupDiGetDeviceInterfaceDetailW(dev_info, &if_data, nullptr, 0, &required, nullptr);
        if (required > sizeof(SP_DEVICE_INTERFACE_DETAIL_DATA_W)) {
          std::vector<std::uint8_t> buf(required, 0);
          auto *detail = reinterpret_cast<PSP_DEVICE_INTERFACE_DETAIL_DATA_W>(buf.data());
          detail->cbSize = sizeof(SP_DEVICE_INTERFACE_DETAIL_DATA_W);
          if (SetupDiGetDeviceInterfaceDetailW(dev_info, &if_data, detail, required, nullptr, nullptr)) {
            handle = CreateFileW(
              detail->DevicePath,
              GENERIC_READ | GENERIC_WRITE,
              FILE_SHARE_READ | FILE_SHARE_WRITE,
              nullptr,
              OPEN_EXISTING,
              0,
              nullptr);
          }
        }
      }
      SetupDiDestroyDeviceInfoList(dev_info);
      return handle;
    }

    struct SlotState {
      int global_index = 0;
      std::uint8_t client_relative_index = 0;
      std::string busid;
      int vhci_port = 0;
      bool active = false;
      feedback_queue_t feedback_queue;

      std::mutex mutex;
      std::condition_variable cv;
      bool stop = false;
      dualsense_hid::controller_snapshot_t snapshot {};
      std::uint64_t snapshot_version = 1;
      std::unordered_map<std::int16_t, std::uint8_t> touch_slot_map;

      // Feedback deduplication cache
      std::uint16_t last_low_rumble = 0;
      std::uint16_t last_high_rumble = 0;
      std::uint8_t last_led_r = 0;
      std::uint8_t last_led_g = 0;
      std::uint8_t last_led_b = 0;
      bool led_initialized = false;
      dualsense_hid::output_report02_t last_triggers {};
      std::uint64_t pending_in_seqnum = 0;
      bool has_pending_in = false;
      std::int32_t pending_in_max_len = 64;

      void dispatch_output_report(const std::uint8_t *data, std::size_t len) {
        dualsense_hid::output_report02_t parsed;
        if (!dualsense_hid::parse_output_report_02(data, len, parsed)) {
          return;
        }
        feedback_queue_t fq;
        std::uint8_t client_idx = 0;
        bool send_rumble = false;
        bool send_led = false;
        bool send_triggers = false;

        {
          std::lock_guard<std::mutex> lock(mutex);
          fq = feedback_queue;
          client_idx = client_relative_index;
          if (!fq) {
            return;
          }

          if (parsed.has_rumble &&
              (parsed.low_freq_rumble != last_low_rumble || parsed.high_freq_rumble != last_high_rumble)) {
            last_low_rumble = parsed.low_freq_rumble;
            last_high_rumble = parsed.high_freq_rumble;
            send_rumble = true;
          }

          if (parsed.has_led &&
              (!led_initialized || parsed.led_r != last_led_r || parsed.led_g != last_led_g ||
               parsed.led_b != last_led_b)) {
            led_initialized = true;
            last_led_r = parsed.led_r;
            last_led_g = parsed.led_g;
            last_led_b = parsed.led_b;
            send_led = true;
          }

          if (parsed.has_triggers &&
              (parsed.trigger_event_flags != last_triggers.trigger_event_flags ||
               parsed.trigger_type_left != last_triggers.trigger_type_left ||
               parsed.trigger_type_right != last_triggers.trigger_type_right ||
               parsed.trigger_left != last_triggers.trigger_left ||
               parsed.trigger_right != last_triggers.trigger_right)) {
            last_triggers.trigger_event_flags = parsed.trigger_event_flags;
            last_triggers.trigger_type_left = parsed.trigger_type_left;
            last_triggers.trigger_type_right = parsed.trigger_type_right;
            last_triggers.trigger_left = parsed.trigger_left;
            last_triggers.trigger_right = parsed.trigger_right;
            send_triggers = true;
          }
        }

        if (send_rumble) {
          fq->raise(gamepad_feedback_msg_t::make_rumble(client_idx, parsed.low_freq_rumble, parsed.high_freq_rumble));
        }
        if (send_led) {
          fq->raise(gamepad_feedback_msg_t::make_rgb_led(client_idx, parsed.led_r, parsed.led_g, parsed.led_b));
        }
        if (send_triggers) {
          fq->raise(gamepad_feedback_msg_t::make_adaptive_triggers(
            client_idx,
            parsed.trigger_event_flags,
            parsed.trigger_type_left,
            parsed.trigger_type_right,
            parsed.trigger_left,
            parsed.trigger_right));
        }
      }
    };

    UsbIpUsbDeviceWire make_usbip_device_wire(const std::string &busid, int slot_index) {
      UsbIpUsbDeviceWire dev {};
      std::snprintf(dev.path, sizeof(dev.path), "/sys/devices/pci0000:00/jujo_ds5_%d", slot_index);
      std::snprintf(dev.busid, sizeof(dev.busid), "%s", busid.c_str());
      dev.busnum = be32(1);
      dev.devnum = be32(static_cast<std::uint32_t>(slot_index + 2));
      dev.speed = be32(kUsbSpeedHigh);
      dev.idVendor = be16(dualsense_hid::kVendorSony);
      dev.idProduct = be16(dualsense_hid::kProductDualSense);
      dev.bcdDevice = be16(0x0100);
      dev.bDeviceClass = 0;
      dev.bDeviceSubClass = 0;
      dev.bDeviceProtocol = 0;
      dev.bConfigurationValue = 1;
      dev.bNumConfigurations = 1;
      dev.bNumInterfaces = 1;
      return dev;
    }

    bool handle_control_urb(
      SlotState &slot,
      const std::uint8_t setup[8],
      std::uint32_t direction,
      const std::vector<std::uint8_t> &out_payload,
      std::vector<std::uint8_t> &in_reply,
      std::int32_t &status_out
    ) {
      const std::uint8_t req_type = setup[0];
      const std::uint8_t request = setup[1];
      const std::uint16_t w_value = static_cast<std::uint16_t>(setup[2] | (setup[3] << 8));
      const std::uint16_t w_length = static_cast<std::uint16_t>(setup[6] | (setup[7] << 8));
      status_out = 0;

      if (direction == 1) {
        // IN control transfer
        if ((req_type & 0x7F) == 0x00 && request == 0x06) {
          // GET_DESCRIPTOR (Std Device / Interface)
          const std::uint8_t desc_type = static_cast<std::uint8_t>(w_value >> 8);
          const std::uint8_t desc_idx = static_cast<std::uint8_t>(w_value & 0xFF);
          if (desc_type == 0x01) {
            in_reply = dualsense_hid::usb_device_descriptor();
          } else if (desc_type == 0x02) {
            in_reply = dualsense_hid::usb_config_descriptor();
          } else if (desc_type == 0x03) {
            in_reply = dualsense_hid::usb_string_descriptor(desc_idx, static_cast<std::uint8_t>(slot.global_index));
          } else if (desc_type == 0x06) {
            in_reply = {10, 0x06, 0x00, 0x02, 0, 0, 0, 64, 1, 0};
          } else if (desc_type == 0x22) {
            in_reply = dualsense_hid::hid_report_descriptor();
          } else if (desc_type == 0x21) {
            const auto &cfg = dualsense_hid::usb_config_descriptor();
            if (cfg.size() >= 27) {
              in_reply.assign(cfg.begin() + 18, cfg.begin() + 27);
            }
          }
        } else if ((req_type & 0x7F) == 0x01 && request == 0x06) {
          // GET_DESCRIPTOR Interface (HID Report)
          const std::uint8_t desc_type = static_cast<std::uint8_t>(w_value >> 8);
          if (desc_type == 0x22) {
            in_reply = dualsense_hid::hid_report_descriptor();
          } else if (desc_type == 0x21) {
            const auto &cfg = dualsense_hid::usb_config_descriptor();
            if (cfg.size() >= 27) {
              in_reply.assign(cfg.begin() + 18, cfg.begin() + 27);
            }
          }
        } else if (req_type == 0xA1 && request == 0x01) {
          // HID GET_REPORT
          const std::uint8_t report_type = static_cast<std::uint8_t>(w_value >> 8);
          const std::uint8_t report_id = static_cast<std::uint8_t>(w_value & 0xFF);
          if (report_type == 3) {
            in_reply = dualsense_hid::build_feature_report(report_id, static_cast<std::uint8_t>(slot.global_index));
          } else if (report_type == 1) {
            dualsense_hid::controller_snapshot_t snap;
            {
              std::lock_guard<std::mutex> lock(slot.mutex);
              snap = slot.snapshot;
              slot.snapshot.seq = static_cast<std::uint8_t>(slot.snapshot.seq + 1);
            }
            const auto rep = dualsense_hid::encode_input_report_01(snap);
            in_reply.assign(rep.begin(), rep.end());
          }
        } else if (req_type == 0x80 && request == 0x08) {
          in_reply = {1};  // GET_CONFIGURATION
        } else if ((req_type & 0x80) == 0x80 && request == 0x00) {
          in_reply = {0, 0};  // GET_STATUS
        }

        if (in_reply.size() > w_length) {
          in_reply.resize(w_length);
        }
        return true;
      }

      // OUT control transfer
      if (req_type == 0x21 && request == 0x09 && !out_payload.empty()) {
        // HID SET_REPORT
        slot.dispatch_output_report(out_payload.data(), out_payload.size());
      }
      return true;
    }

  }  // namespace

  struct UsbIpDualSenseBackend::Impl {
    SOCKET listen_sock = INVALID_SOCKET;
    std::atomic<bool> running {false};
    std::thread accept_thread;
    std::mutex slots_mutex;
    std::array<std::shared_ptr<SlotState>, MAX_GAMEPADS> slots;
    std::map<std::string, std::shared_ptr<SlotState>> busid_map;
    std::mutex clients_mutex;
    std::condition_variable clients_cv;
    std::vector<SOCKET> active_client_sockets;
    std::size_t active_client_threads = 0;

    bool start_listener(std::uint16_t &out_port) {
      if (listen_sock != INVALID_SOCKET && running.load()) {
        return true;
      }
      listen_sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
      if (listen_sock == INVALID_SOCKET) {
        return false;
      }
      int nodelay = 1;
      setsockopt(listen_sock, IPPROTO_TCP, TCP_NODELAY, reinterpret_cast<const char *>(&nodelay), sizeof(nodelay));

      sockaddr_in addr {};
      addr.sin_family = AF_INET;
      addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
      addr.sin_port = 0;
      if (bind(listen_sock, reinterpret_cast<const sockaddr *>(&addr), sizeof(addr)) != 0 ||
          listen(listen_sock, 8) != 0) {
        closesocket(listen_sock);
        listen_sock = INVALID_SOCKET;
        return false;
      }
      int addr_len = sizeof(addr);
      if (getsockname(listen_sock, reinterpret_cast<sockaddr *>(&addr), &addr_len) != 0) {
        closesocket(listen_sock);
        listen_sock = INVALID_SOCKET;
        return false;
      }
      out_port = ntohs(addr.sin_port);
      g_usbip_loopback_port.store(out_port);
      running.store(true);
      accept_thread = std::thread([this]() { accept_loop(); });
      return true;
    }

    void stop() {
      running.store(false);
      g_usbip_loopback_port.store(0);
      if (listen_sock != INVALID_SOCKET) {
        closesocket(listen_sock);
        listen_sock = INVALID_SOCKET;
      }
      {
        std::lock_guard<std::mutex> lock(slots_mutex);
        for (auto &s : slots) {
          if (s) {
            std::lock_guard<std::mutex> sl(s->mutex);
            s->stop = true;
            s->cv.notify_all();
          }
        }
      }
      {
        std::lock_guard<std::mutex> clk(clients_mutex);
        for (SOCKET cs : active_client_sockets) {
          shutdown(cs, SD_BOTH);
          closesocket(cs);
        }
      }
      if (accept_thread.joinable()) {
        accept_thread.join();
      }
      std::unique_lock<std::mutex> clk(clients_mutex);
      clients_cv.wait(clk, [&]() { return active_client_threads == 0; });
    }

    void accept_loop() {
      while (running.load()) {
        SOCKET client = accept(listen_sock, nullptr, nullptr);
        if (client == INVALID_SOCKET) {
          break;
        }
        int nodelay = 1;
        setsockopt(client, IPPROTO_TCP, TCP_NODELAY, reinterpret_cast<const char *>(&nodelay), sizeof(nodelay));
        {
          std::lock_guard<std::mutex> clk(clients_mutex);
          active_client_sockets.push_back(client);
          ++active_client_threads;
        }
        std::thread([this, client]() {
          serve_usbip_client(client);
          std::lock_guard<std::mutex> clk(clients_mutex);
          active_client_sockets.erase(
            std::remove(active_client_sockets.begin(), active_client_sockets.end(), client),
            active_client_sockets.end());
          if (active_client_threads > 0) {
            --active_client_threads;
          }
          clients_cv.notify_all();
        }).detach();
      }
    }

    void serve_usbip_client(SOCKET sock) {
      auto close_guard = [&]() { closesocket(sock); };

      UsbIpOpCommon op {};
      if (!recv_exact(sock, &op, sizeof(op))) {
        close_guard();
        return;
      }
      const std::uint16_t code = ntohs(op.code);

      if (code == kOpReqDevlist) {
        std::vector<std::shared_ptr<SlotState>> active_slots;
        {
          std::lock_guard<std::mutex> lock(slots_mutex);
          for (auto &s : slots) {
            if (s && s->active) {
              active_slots.push_back(s);
            }
          }
        }
        UsbIpOpCommon rep {be16(kUsbipVersion), be16(kOpRepDevlist), 0};
        send_exact(sock, &rep, sizeof(rep));
        const std::uint32_t ndev = be32(static_cast<std::uint32_t>(active_slots.size()));
        send_exact(sock, &ndev, sizeof(ndev));
        for (auto &s : active_slots) {
          auto dev = make_usbip_device_wire(s->busid, s->global_index);
          send_exact(sock, &dev, sizeof(dev));
          std::uint8_t iface[4] = {0x03, 0x00, 0x00, 0x00};
          send_exact(sock, iface, sizeof(iface));
        }
        close_guard();
        return;
      }

      if (code != kOpReqImport) {
        close_guard();
        return;
      }

      char busid_raw[kUsbipBusIdSize] {};
      if (!recv_exact(sock, busid_raw, sizeof(busid_raw))) {
        close_guard();
        return;
      }
      const std::string busid(busid_raw, strnlen(busid_raw, sizeof(busid_raw)));

      std::shared_ptr<SlotState> slot;
      {
        std::lock_guard<std::mutex> lock(slots_mutex);
        auto it = busid_map.find(busid);
        if (it != busid_map.end()) {
          slot = it->second;
        }
      }

      if (!slot) {
        UsbIpOpCommon rep {be16(kUsbipVersion), be16(kOpRepImport), be32(4)};
        send_exact(sock, &rep, sizeof(rep));
        close_guard();
        return;
      }

      UsbIpOpCommon rep {be16(kUsbipVersion), be16(kOpRepImport), 0};
      auto wire_dev = make_usbip_device_wire(busid, slot->global_index);
      if (!send_exact(sock, &rep, sizeof(rep)) || !send_exact(sock, &wire_dev, sizeof(wire_dev))) {
        close_guard();
        return;
      }

      std::mutex sock_tx_mutex;
      std::atomic<bool> session_alive {true};

      auto send_ret_submit = [&](std::uint32_t seqnum, std::int32_t status, const std::uint8_t *payload, std::size_t n) {
        UsbIpWireHeader hdr {};
        hdr.command = be32(kRetSubmit);
        hdr.seqnum = be32(seqnum);
        hdr.ret_submit.status = static_cast<std::int32_t>(be32(static_cast<std::uint32_t>(status)));
        hdr.ret_submit.actual_length = static_cast<std::int32_t>(be32(static_cast<std::uint32_t>(n)));

        std::lock_guard<std::mutex> tx_lock(sock_tx_mutex);
        if (!send_exact(sock, &hdr, sizeof(hdr))) {
          return false;
        }
        if (n > 0 && payload) {
          return send_exact(sock, payload, n);
        }
        return true;
      };

      // Asynchronous interrupt IN responder thread
      std::thread in_pump([&]() {
        std::uint64_t last_sent_version = 0;
        while (session_alive.load() && running.load()) {
          std::uint32_t req_seq = 0;
          std::int32_t max_len = 64;
          dualsense_hid::controller_snapshot_t snap {};
          {
            std::unique_lock<std::mutex> lock(slot->mutex);
            slot->cv.wait_for(lock, std::chrono::milliseconds(16), [&]() {
              if (!session_alive.load() || slot->stop || !running.load()) return true;
              return slot->has_pending_in && slot->snapshot_version != last_sent_version;
            });
            if (!session_alive.load() || slot->stop || !running.load()) {
              break;
            }
            if (!slot->has_pending_in) {
              continue;
            }
            req_seq = static_cast<std::uint32_t>(slot->pending_in_seqnum);
            max_len = slot->pending_in_max_len;
            slot->has_pending_in = false;
            last_sent_version = slot->snapshot_version;
            snap = slot->snapshot;
            slot->snapshot.seq = static_cast<std::uint8_t>(slot->snapshot.seq + 1);
          }

          const auto report = dualsense_hid::encode_input_report_01(snap);
          const std::size_t send_n = std::min<std::size_t>(report.size(), std::max<std::int32_t>(0, max_len));
          if (!send_ret_submit(req_seq, 0, report.data(), send_n)) {
            session_alive.store(false);
            break;
          }
        }
      });

      while (session_alive.load() && running.load()) {
        UsbIpWireHeader req {};
        if (!recv_exact(sock, &req, sizeof(req))) {
          break;
        }
        const std::uint32_t cmd = ntohl(req.command);
        const std::uint32_t seqnum = ntohl(req.seqnum);
        const std::uint32_t dir = ntohl(req.direction);
        const std::uint32_t ep = ntohl(req.ep);

        if (cmd == kCmdUnlink) {
          const std::uint32_t target_seq = ntohl(req.cmd_unlink.seqnum);
          bool matched = false;
          {
            std::lock_guard<std::mutex> lock(slot->mutex);
            if (slot->has_pending_in && slot->pending_in_seqnum == target_seq) {
              slot->has_pending_in = false;
              matched = true;
            }
          }
          UsbIpWireHeader ret {};
          ret.command = be32(kRetUnlink);
          ret.seqnum = be32(seqnum);
          ret.ret_unlink.status = static_cast<std::int32_t>(be32(matched ? static_cast<std::uint32_t>(-104) : 0));
          std::lock_guard<std::mutex> tx_lock(sock_tx_mutex);
          if (!send_exact(sock, &ret, sizeof(ret))) {
            break;
          }
          continue;
        }

        if (cmd != kCmdSubmit) {
          break;
        }

        const std::int32_t tx_len = static_cast<std::int32_t>(ntohl(static_cast<std::uint32_t>(req.cmd_submit.transfer_buffer_length)));
        std::vector<std::uint8_t> out_payload;
        if (dir == 0 && tx_len > 0 && tx_len <= 4096) {
          out_payload.resize(static_cast<std::size_t>(tx_len));
          if (!recv_exact(sock, out_payload.data(), out_payload.size())) {
            break;
          }
        }

        if (ep == 0) {
          std::vector<std::uint8_t> in_reply;
          std::int32_t status = 0;
          handle_control_urb(*slot, req.cmd_submit.setup, dir, out_payload, in_reply, status);
          const std::size_t actual = (dir == 1)
            ? std::min<std::size_t>(in_reply.size(), static_cast<std::size_t>(std::max<std::int32_t>(0, tx_len)))
            : out_payload.size();
          if (!send_ret_submit(seqnum, status, (dir == 1) ? in_reply.data() : nullptr, actual)) {
            break;
          }
        } else if (dir == 0 && ep == 3) {
          if (!out_payload.empty()) {
            slot->dispatch_output_report(out_payload.data(), out_payload.size());
          }
          if (!send_ret_submit(seqnum, 0, nullptr, out_payload.size())) {
            break;
          }
        } else if (dir == 1 && ep == 4) {
          std::lock_guard<std::mutex> lock(slot->mutex);
          slot->pending_in_seqnum = seqnum;
          slot->pending_in_max_len = tx_len > 0 ? tx_len : 64;
          slot->has_pending_in = true;
          slot->cv.notify_all();
        } else {
          if (!send_ret_submit(seqnum, -32, nullptr, 0)) {
            break;
          }
        }
      }

      session_alive.store(false);
      {
        std::lock_guard<std::mutex> lock(slot->mutex);
        slot->cv.notify_all();
      }
      if (in_pump.joinable()) {
        in_pump.join();
      }
      close_guard();
    }
  };

  bool is_usbip_ude_installed() {
    HANDLE h = open_vhci_device();
    if (h == INVALID_HANDLE_VALUE) {
      return false;
    }
    CloseHandle(h);
    return true;
  }

  usbip_backend_health_t get_usbip_backend_health() {
    return usbip_backend_health_t {
      is_usbip_ude_installed(),
      g_usbip_loopback_port.load(),
      g_usbip_active_slots.load()
    };
  }

  UsbIpDualSenseBackend::UsbIpDualSenseBackend(): impl_(std::make_unique<Impl>()) {
    WSADATA wsa {};
    WSAStartup(MAKEWORD(2, 2), &wsa);
    available_ = is_usbip_ude_installed();
    if (available_) {
      if (!impl_->start_listener(tcp_port_)) {
        available_ = false;
        log_warn_msg("usbip-dualsense: failed to bind local loopback TCP port");
      } else {
        log_info_msg("usbip-dualsense: usbip2_ude ready, in-process loopback port=" + std::to_string(tcp_port_));
      }
    }
  }

  UsbIpDualSenseBackend::~UsbIpDualSenseBackend() {
    for (int i = 0; i < MAX_GAMEPADS; ++i) {
      free_gamepad(i);
    }
    if (impl_) {
      impl_->stop();
    }
  }

  int UsbIpDualSenseBackend::alloc_gamepad(
    const gamepad_id_t &id,
    const gamepad_arrival_t &,
    const std::string &,
    feedback_queue_t feedback_queue
  ) {
    if (!available_ || id.globalIndex < 0 || id.globalIndex >= MAX_GAMEPADS) {
      return -1;
    }

    auto slot = std::make_shared<SlotState>();
    slot->global_index = id.globalIndex;
    slot->client_relative_index = id.clientRelativeIndex;
    slot->busid = "1-" + std::to_string(id.globalIndex + 1);
    slot->feedback_queue = std::move(feedback_queue);
    slot->active = true;

    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      impl_->slots[id.globalIndex] = slot;
      impl_->busid_map[slot->busid] = slot;
    }

    HANDLE vhci = open_vhci_device();
    if (vhci == INVALID_HANDLE_VALUE) {
      free_gamepad(id.globalIndex);
      return -1;
    }

    UsbIpPluginHardwareIoctl req {};
    req.size = sizeof(req);
    std::snprintf(req.busid, sizeof(req.busid), "%s", slot->busid.c_str());
    std::snprintf(req.service, sizeof(req.service), "%u", static_cast<unsigned>(tcp_port_));
    std::snprintf(req.host, sizeof(req.host), "127.0.0.1");
    std::snprintf(req.serial, sizeof(req.serial), "JUJODS5%02d", id.globalIndex + 1);
    req.wsk_events = false;

    DWORD bytes_returned = 0;
    const DWORD out_len = static_cast<DWORD>(offsetof(UsbIpPluginHardwareIoctl, port) + sizeof(req.port));
    const BOOL ok = DeviceIoControl(
      vhci,
      kIoctlPluginHardwareOnce,
      &req,
      sizeof(req),
      &req,
      out_len,
      &bytes_returned,
      nullptr);
    CloseHandle(vhci);

    if (!ok || req.port <= 0) {
      log_warn_msg("usbip-dualsense: IOCTL_USBIP_VHCI_PLUGIN_HARDWARE_ONCE failed (err=" + std::to_string(GetLastError()) + ")");
      free_gamepad(id.globalIndex);
      return -1;
    }

    slot->vhci_port = req.port;
    g_usbip_active_slots.store(active_slot_count());
    log_info_msg("usbip-dualsense: attached native PS5 DualSense slot=" + std::to_string(id.globalIndex) + " vhci_port=" + std::to_string(req.port));
    return 0;
  }

  void UsbIpDualSenseBackend::free_gamepad(int nr) {
    if (nr < 0 || nr >= MAX_GAMEPADS || !impl_) {
      return;
    }
    std::shared_ptr<SlotState> slot;
    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      slot = impl_->slots[nr];
      impl_->slots[nr].reset();
      if (slot) {
        impl_->busid_map.erase(slot->busid);
      }
    }
    g_usbip_active_slots.store(active_slot_count());
    if (!slot) {
      return;
    }
    {
      std::lock_guard<std::mutex> sl(slot->mutex);
      slot->stop = true;
      slot->active = false;
      slot->cv.notify_all();
    }
    if (slot->vhci_port > 0) {
      HANDLE vhci = open_vhci_device();
      if (vhci != INVALID_HANDLE_VALUE) {
        UsbIpPlugoutHardwareIoctl out {};
        out.size = sizeof(out);
        out.port = slot->vhci_port;
        DWORD br = 0;
        DeviceIoControl(vhci, kIoctlPlugoutHardware, &out, sizeof(out), nullptr, 0, &br, nullptr);
        CloseHandle(vhci);
      }
    }
  }

  void UsbIpDualSenseBackend::update_state(int nr, const gamepad_state_t &gs) {
    if (nr < 0 || nr >= MAX_GAMEPADS || !impl_) {
      return;
    }
    std::shared_ptr<SlotState> slot;
    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      slot = impl_->slots[nr];
    }
    if (!slot) {
      return;
    }
    std::lock_guard<std::mutex> lock(slot->mutex);
    slot->snapshot.button_flags = gs.buttonFlags;
    slot->snapshot.left_trigger = gs.lt;
    slot->snapshot.right_trigger = gs.rt;
    slot->snapshot.ls_x = gs.lsX;
    slot->snapshot.ls_y = gs.lsY;
    slot->snapshot.rs_x = gs.rsX;
    slot->snapshot.rs_y = gs.rsY;
    slot->snapshot_version++;
    slot->cv.notify_all();
  }

  void UsbIpDualSenseBackend::touch(const gamepad_touch_t &t) {
    const int nr = t.id.globalIndex;
    if (nr < 0 || nr >= MAX_GAMEPADS || !impl_) {
      return;
    }
    std::shared_ptr<SlotState> slot;
    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      slot = impl_->slots[nr];
    }
    if (!slot) {
      return;
    }

    std::lock_guard<std::mutex> lock(slot->mutex);
    std::uint8_t idx = 0xFF;
    auto it = slot->touch_slot_map.find(t.pointerId);
    if (it != slot->touch_slot_map.end()) {
      idx = it->second;
    } else if (t.eventType == LI_TOUCH_EVENT_DOWN || t.eventType == LI_TOUCH_EVENT_MOVE) {
      for (std::uint8_t c = 0; c < dualsense_hid::kMaxTouchpoints; ++c) {
        if (!slot->snapshot.touches[c].active) {
          idx = c;
          slot->touch_slot_map[t.pointerId] = c;
          break;
        }
      }
    }
    if (idx >= dualsense_hid::kMaxTouchpoints) {
      return;
    }

    auto &tp = slot->snapshot.touches[idx];
    if (t.eventType == LI_TOUCH_EVENT_UP || t.eventType == LI_TOUCH_EVENT_CANCEL) {
      tp.active = false;
      slot->touch_slot_map.erase(t.pointerId);
    } else {
      tp.active = true;
      tp.tracking_id = static_cast<std::uint8_t>(t.pointerId & 0x7F);
      tp.x = static_cast<std::uint16_t>(std::clamp(t.x, 0.0f, 1.0f) * 1919.0f);
      tp.y = static_cast<std::uint16_t>(std::clamp(t.y, 0.0f, 1.0f) * 1079.0f);
    }
    slot->snapshot_version++;
    slot->cv.notify_all();
  }

  void UsbIpDualSenseBackend::motion(const gamepad_motion_t &m) {
    const int nr = m.id.globalIndex;
    if (nr < 0 || nr >= MAX_GAMEPADS || !impl_) {
      return;
    }
    std::shared_ptr<SlotState> slot;
    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      slot = impl_->slots[nr];
    }
    if (!slot) {
      return;
    }
    std::lock_guard<std::mutex> lock(slot->mutex);
    if (m.motionType == LI_MOTION_TYPE_ACCEL) {
      slot->snapshot.accel_x = m.x;
      slot->snapshot.accel_y = m.y;
      slot->snapshot.accel_z = m.z;
    } else if (m.motionType == LI_MOTION_TYPE_GYRO) {
      slot->snapshot.gyro_x = m.x;
      slot->snapshot.gyro_y = m.y;
      slot->snapshot.gyro_z = m.z;
    }
    const auto now_us = std::chrono::duration_cast<std::chrono::microseconds>(
      std::chrono::steady_clock::now().time_since_epoch());
    slot->snapshot.sensor_timestamp_us = static_cast<std::uint32_t>(now_us.count());
    slot->snapshot_version++;
    slot->cv.notify_all();
  }

  void UsbIpDualSenseBackend::battery(const gamepad_battery_t &b) {
    const int nr = b.id.globalIndex;
    if (nr < 0 || nr >= MAX_GAMEPADS || !impl_) {
      return;
    }
    std::shared_ptr<SlotState> slot;
    {
      std::lock_guard<std::mutex> lock(impl_->slots_mutex);
      slot = impl_->slots[nr];
    }
    if (!slot) {
      return;
    }
    std::lock_guard<std::mutex> lock(slot->mutex);
    slot->snapshot.battery_state = b.state;
    slot->snapshot.battery_percent = b.percentage;
    slot->snapshot_version++;
    slot->cv.notify_all();
  }

  std::size_t UsbIpDualSenseBackend::active_slot_count() const {
    if (!impl_) {
      return 0;
    }
    std::lock_guard<std::mutex> lock(impl_->slots_mutex);
    std::size_t count = 0;
    for (const auto &s : impl_->slots) {
      if (s && s->active) {
        ++count;
      }
    }
    return count;
  }

#ifdef SUNSHINE_TESTS
  bool UsbIpDualSenseBackend::start_test_loopback_slot(int global_index, feedback_queue_t feedback_queue) {
    if (!impl_ || global_index < 0 || global_index >= MAX_GAMEPADS) {
      return false;
    }
    if (!impl_->start_listener(tcp_port_)) {
      return false;
    }
    auto slot = std::make_shared<SlotState>();
    slot->global_index = global_index;
    slot->client_relative_index = static_cast<std::uint8_t>(global_index);
    slot->busid = "1-" + std::to_string(global_index + 1);
    slot->feedback_queue = std::move(feedback_queue);
    slot->active = true;
    std::lock_guard<std::mutex> lock(impl_->slots_mutex);
    impl_->slots[global_index] = slot;
    impl_->busid_map[slot->busid] = slot;
    available_ = true;
    return true;
  }
#endif

}  // namespace platf
