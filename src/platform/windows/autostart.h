#pragma once

#include <string>

namespace platf::autostart {
  struct status_t {
    bool supported = false;
    bool autologon_enabled = false;
    std::string username;
    std::string domain;
    bool service_exists = false;
    bool service_running = false;
    std::string service_start_type = "unknown";
    bool backend_startup_ready = false;
    bool boot_path_ready = false;
    std::string warning;
  };

  bool get_status(status_t &status, std::string &error);

  bool enable_autologon(
    const std::string &username,
    const std::string &domain,
    const std::string &password,
    std::string &error
  );

  bool disable_autologon(std::string &error);
}
