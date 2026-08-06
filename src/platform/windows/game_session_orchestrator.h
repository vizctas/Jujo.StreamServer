/**
 * @file src/platform/windows/game_session_orchestrator.h
 * @brief Owns Windows game-process discovery, foreground readiness, and safe teardown.
 */
#pragma once

#ifdef _WIN32

#include <atomic>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <map>
#include <mutex>
#include <optional>
#include <string>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include <winsock2.h>
#include <windows.h>

namespace game_session {
  enum class phase_e {
    idle,
    launching,
    waiting_window,
    focusing,
    stabilizing,
    ready,
    failed,
    cancelling,
    closed,
  };

  const char *phase_name(phase_e phase) noexcept;

  struct process_identity_t {
    DWORD pid {0};
    std::uint64_t creation_time {0};

    friend bool operator==(const process_identity_t &, const process_identity_t &) = default;
  };

  struct process_record_t {
    process_identity_t identity;
    DWORD parent_pid {0};
    std::wstring image_path;
  };

  using process_baseline_t = std::unordered_map<DWORD, std::uint64_t>;

  struct launch_options_t {
    int app_id {0};
    std::string app_uuid;
    std::string app_name;
    std::string owner_client_uuid;
    bool desktop {false};
    DWORD direct_pid {0};
    std::uint64_t launch_time {0};
    process_baseline_t baseline;
    std::vector<std::wstring> candidate_roots;
    std::chrono::seconds timeout {std::chrono::seconds(90)};
  };

  struct snapshot_t {
    bool required {false};
    std::string token;
    std::string owner_client_uuid;
    int app_id {0};
    std::string app_uuid;
    std::string app_name;
    phase_e phase {phase_e::idle};
    std::string detail;
    std::string failure_code;
    std::uint64_t generation {0};
    unsigned int attempt {0};
    DWORD selected_pid {0};

    bool ready() const noexcept {
      return phase == phase_e::ready;
    }

    bool failed() const noexcept {
      return phase == phase_e::failed;
    }
  };

  /** Pure policy helpers kept public for deterministic regression tests. */
  namespace policy {
    bool is_safe_game_root(const std::wstring &root);
    bool path_is_under_root(const std::wstring &path, const std::wstring &root);
    bool is_excluded_process(const std::wstring &image_path);
    bool is_new_since_launch(
      const process_record_t &record,
      const process_baseline_t &baseline,
      std::uint64_t launch_time
    );
    bool should_adopt(
      const process_record_t &record,
      DWORD direct_pid,
      const process_baseline_t &baseline,
      std::uint64_t launch_time,
      const std::unordered_set<DWORD> &owned_pids,
      const std::vector<std::wstring> &roots
    );

    /** Whether a detached launcher still represents a live app session. */
    bool detached_app_should_report_running(
      bool playnite_managed,
      bool launcher_running,
      bool owned_process_running,
      int active_streams
    );
  }  // namespace policy

  class orchestrator_t {
  public:
    orchestrator_t() = default;
    orchestrator_t(const orchestrator_t &) = delete;
    orchestrator_t &operator=(const orchestrator_t &) = delete;
    ~orchestrator_t();

    /** Capture PID+creation-time identities immediately before launch. */
    static process_baseline_t capture_process_baseline();
    static std::uint64_t current_filetime();

    /** Start monitoring a newly dispatched non-Desktop app. */
    snapshot_t start(launch_options_t options);

    /** Stop the readiness worker without terminating owned processes. */
    void stop_monitoring();

    /** True while at least one PID+creation-time identity still exists. */
    bool has_live_owned_processes() const;

    /**
     * Stop monitoring, request graceful window closure, then terminate only
     * identities proven to belong to the current game session.
     */
    bool close_owned(std::chrono::seconds graceful_timeout);

    /** Clear a prior session when launching Desktop. */
    void reset_for_desktop();

    /** Return a snapshot only when both owner and opaque token match. */
    std::optional<snapshot_t> snapshot_for(
      const std::string &owner_client_uuid,
      const std::string &token
    ) const;

    /** Internal launch-response snapshot for the owning proc_t. */
    snapshot_t snapshot() const;

    /** Retry discovery/focus without dispatching the launch command again. */
    bool retry(const std::string &owner_client_uuid, const std::string &token);

  private:
    struct window_candidate_t {
      HWND hwnd {nullptr};
      DWORD pid {0};
      std::uint64_t area {0};
      double monitor_coverage {0.0};
      bool foreground {false};
    };

    void run();
    void discover_owned_processes();
    std::optional<window_candidate_t> best_window_candidate() const;
    bool focus_and_confirm(const window_candidate_t &candidate);
    std::vector<process_identity_t> owned_identities_snapshot() const;
    void transition(
      phase_e phase,
      std::string detail,
      std::string failure_code = {},
      DWORD selected_pid = 0
    );
    void stop_worker(bool closing);
    void final_discovery_pass();

    mutable std::mutex _mutex;
    std::condition_variable _wake;
    std::thread _worker;
    bool _stop_requested {false};
    std::uint64_t _retry_generation {0};
    launch_options_t _options;
    snapshot_t _snapshot;
    std::map<DWORD, process_identity_t> _owned;
  };

  /** Single host-wide app session, matching proc_t's one-active-app contract. */
  orchestrator_t &instance();
}  // namespace game_session

#endif  // _WIN32
