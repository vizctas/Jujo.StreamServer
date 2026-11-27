/**
 * @file src/coop_guest_access.h
 * @brief Pure verdict on whether a cloud-paired guest keeps, loses, or downgrades its access.
 */
#pragma once

#include <charconv>
#include <chrono>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

#include <nlohmann/json.hpp>

namespace coop_access {

  /// Access a Co-Op guest cert was granted at cloud_pair time.
  struct guest_grant_t {
    std::string user_id;
    std::string invite_id;  ///< Co-Op invite row id; a grant without one is stale and never kept.
    std::int64_t expires_at = 0;  ///< Epoch seconds; 0 = no expiry.
  };

  /// Co-owner (server member) cert link: lets a permission change reach the cert of its user.
  struct member_grant_t {
    std::string user_id;
    bool launch = true;  ///< Whether the cert may launch apps.
    bool kbm = true;  ///< Whether the cert may use keyboard/mouse in a session it does not own.
  };

  /// Latest cloud state for a grant; absent when Supabase could not be reached.
  struct cloud_status_t {
    bool invite_active = false;
  };

  enum class verdict_e {
    keep,
    revoke,
  };

  inline verdict_e evaluate(const guest_grant_t &g, std::int64_t now, const std::optional<cloud_status_t> &cloud) {
    // Local expiry needs no network, so it always applies.
    if (g.invite_id.empty() || (g.expires_at > 0 && now >= g.expires_at)) {
      return verdict_e::revoke;
    }
    return cloud && !cloud->invite_active ? verdict_e::revoke : verdict_e::keep;
  }

  /// Parses Supabase/Postgres UTC timestamps (`YYYY-MM-DD[T ]HH:MM:SS[.frac][Z|+00[:00]]`) to epoch seconds; 0 on failure.
  inline std::int64_t parse_iso8601_utc(std::string_view s) {
    auto num = [&](std::size_t pos, std::size_t len, int &out) {
      if (pos + len > s.size()) {
        return false;
      }
      const auto *b = s.data() + pos;
      return std::from_chars(b, b + len, out).ptr == b + len;
    };
    int y, mo, d, h, mi, sec;
    if (s.size() < 19 || s[4] != '-' || s[7] != '-' || (s[10] != 'T' && s[10] != ' ') || s[13] != ':' || s[16] != ':' ||
        !num(0, 4, y) || !num(5, 2, mo) || !num(8, 2, d) || !num(11, 2, h) || !num(14, 2, mi) || !num(17, 2, sec)) {
      return 0;
    }
    const std::chrono::year_month_day ymd {std::chrono::year {y}, std::chrono::month {static_cast<unsigned>(mo)}, std::chrono::day {static_cast<unsigned>(d)}};
    if (!ymd.ok()) {
      return 0;
    }
    const auto days = std::chrono::sys_days {ymd}.time_since_epoch().count();
    return static_cast<std::int64_t>(days) * 86400 + h * 3600 + mi * 60 + sec;
  }

  /// Builds cloud state from PostgREST rows of `coop_session_invites?select=status,expires_at`.
  inline cloud_status_t status_from_rows(const nlohmann::json &invite_rows, std::int64_t now) {
    cloud_status_t s;
    if (invite_rows.is_array() && !invite_rows.empty() && invite_rows[0].is_object()) {
      const auto &i = invite_rows[0];
      s.invite_active = i.value("status", std::string {}) == "active" &&
                        parse_iso8601_utc(i.value("expires_at", std::string {})) > now;
    }
    return s;
  }

}  // namespace coop_access
