/**
 * @file cloud_agent.h
 * @brief Cloud Agent — reports server identity and addresses to Supabase.
 *
 * On startup (and periodically), the cloud agent:
 * 1. Detects the server's local IP(s)
 * 2. Detects the server's public/external IP via STUN or HTTP
 * 3. Pushes {local_addresses, external_address, server_name} to Supabase
 *
 * Configuration (sunshine.conf):
 *   cloud_supabase_url = https://your-project.supabase.co
 *   cloud_supabase_key = eyJ...  (anon/publishable key only)
 *   cloud_user_token   = (JWT from user login — set via API or config)
 *   cloud_heartbeat_interval = 60  (seconds, default 60)
 *
 * Security:
 * - Only the publishable key is stored (not the service role key)
 * - The user JWT is required for RLS-protected writes
 * - No server passwords or streaming tokens are sent to the cloud
 */

#pragma once

#include <atomic>
#include <string>
#include <thread>
#include <vector>

namespace cloud {

  struct CloudConfig {
    std::string supabase_url;
    std::string supabase_key;  // anon/publishable key
    std::string user_jwt;      // user's Supabase JWT for RLS
    int heartbeat_interval_s = 60;

    bool is_configured() const {
      return !supabase_url.empty() && !supabase_key.empty() && !user_jwt.empty();
    }
  };

  struct ServerIdentity {
    std::string server_name;
    std::string server_url;          // e.g. "https://192.168.1.100:47990"
    std::vector<std::string> local_addresses;
    std::string external_address;    // public IP:port (from STUN/HTTP detection)
    std::string nat_type;            // "unknown", "full_cone", "symmetric", etc.
    std::string cert_fingerprint;
    std::string server_uuid;         // Sunshine server uniqueid (from serverinfo XML)
    std::string server_version;      // e.g. "2025.1.0" — reported in heartbeat
    bool is_streaming = false;       // true if any active streaming session
  };

  /**
   * @brief Detect the server's public IP address.
   *
   * Tries multiple services in order:
   * 1. api.ipify.org (plain text)
   * 2. ifconfig.me (plain text)
   * 3. icanhazip.com (plain text)
   *
   * Returns empty string on failure (all services unreachable).
   */
  std::string detect_public_ip();

  /**
   * @brief Push server identity to Supabase user_server_profiles table.
   *
   * Uses upsert (ON CONFLICT user_id, server_url) so it's idempotent.
   * Returns true on success, false on failure (logged but non-fatal).
   */
  bool push_identity(const CloudConfig &config, const ServerIdentity &identity);

  /**
   * @brief Delete this server's row from user_server_profiles (unregister).
   *
   * Uses the cached server_url from the last heartbeat. Returns false if the
   * agent never ran (no cached identity) or the REST call fails.
   */
  bool delete_identity(const CloudConfig &config);

  /**
   * @brief Start the background heartbeat thread.
   *
   * Periodically re-detects public IP and pushes updated identity.
   * Thread-safe: can be called multiple times (no-op if already running).
   */
  void start_heartbeat(const CloudConfig &config, const ServerIdentity &base_identity);

  /**
   * @brief Stop the background heartbeat thread.
   */
  void stop_heartbeat();

  /**
   * @brief Restart the heartbeat with a new config (e.g. refreshed JWT).
   *
   * Signals the current thread to stop, then starts a new one with the
   * new config and the last-known server identity. Fire-and-forget — does
   * not block the caller. Safe to call from any thread.
   *
   * If the heartbeat was never started (no cached identity), this is a no-op.
   * If new_config is not configured, the heartbeat is stopped and not restarted.
   */
  void restart_heartbeat(const CloudConfig &new_config);

  /**
   * @brief Check if the cloud agent is currently running.
   */
  bool is_running();

}  // namespace cloud
