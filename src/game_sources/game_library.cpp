/**
 * @file src/game_sources/game_library.cpp
 * @brief Game library manager implementation — TOML read/write + JSON migration.
 */
#include "game_library.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <unordered_set>

#include <nlohmann/json.hpp>
#include <toml++/toml.hpp>

#include "src/file_handler.h"
#include "src/logging.h"

namespace game_sources {

  std::string GameEntry::dedup_key() const {
    if (!source_id.empty()) {
      return source + ":" + source_id;
    }
    return source + ":" + name;
  }

  // ─── Load ──────────────────────────────────────────────────────────────────

  bool GameLibrary::load(const std::filesystem::path &toml_path, const std::filesystem::path &json_fallback_path) {
    std::lock_guard lock(mutex_);
    toml_path_ = toml_path;
    entries_.clear();
    migrated_from_json_ = false;

    // Try TOML first
    if (std::filesystem::exists(toml_path)) {
      auto content = file_handler::read_file(toml_path.string().c_str());
      if (!content.empty() && parse_toml(content)) {
        BOOST_LOG(info) << "GameLibrary: loaded " << entries_.size() << " entries from " << toml_path.string();
        return true;
      }
      BOOST_LOG(warning) << "GameLibrary: failed to parse " << toml_path.string() << ", trying JSON fallback";
    }

    // Fallback: migrate from JSON
    if (std::filesystem::exists(json_fallback_path)) {
      auto content = file_handler::read_file(json_fallback_path.string().c_str());
      if (!content.empty() && parse_json(content)) {
        migrated_from_json_ = true;
        BOOST_LOG(info) << "GameLibrary: migrated " << entries_.size() << " entries from " << json_fallback_path.string();

        // Save as TOML immediately
        if (save_internal()) {
          BOOST_LOG(info) << "GameLibrary: wrote migrated library to " << toml_path.string();
        }
        return true;
      }
      BOOST_LOG(warning) << "GameLibrary: failed to parse JSON fallback " << json_fallback_path.string();
    }

    // Neither exists — start with empty library
    BOOST_LOG(info) << "GameLibrary: no existing library found, starting empty";
    return true;
  }

  // ─── Save ──────────────────────────────────────────────────────────────────

  bool GameLibrary::save() {
    std::lock_guard lock(mutex_);
    return save_internal();
  }

  bool GameLibrary::save_internal() {
    if (toml_path_.empty()) {
      BOOST_LOG(error) << "GameLibrary: cannot save — no path set";
      return false;
    }

    auto content = serialize_toml();

    // Atomic write: tmp file + rename
    auto tmp_path = toml_path_;
    tmp_path += ".tmp";

    try {
      std::ofstream out(tmp_path, std::ios::binary | std::ios::trunc);
      if (!out.is_open()) {
        BOOST_LOG(error) << "GameLibrary: cannot open tmp file for writing: " << tmp_path.string();
        return false;
      }
      out << content;
      out.close();

      std::filesystem::rename(tmp_path, toml_path_);
      return true;
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "GameLibrary: save failed: " << e.what();
      std::error_code ec;
      std::filesystem::remove(tmp_path, ec);
      return false;
    }
  }

  // ─── Accessors ─────────────────────────────────────────────────────────────

  std::vector<GameEntry> GameLibrary::get_all() const {
    std::lock_guard lock(mutex_);
    return entries_;
  }

  std::vector<GameEntry> GameLibrary::get_by_source(const std::string &source) const {
    std::lock_guard lock(mutex_);
    std::vector<GameEntry> result;
    for (const auto &e : entries_) {
      if (e.source == source) result.push_back(e);
    }
    return result;
  }

  std::optional<GameEntry> GameLibrary::find(const std::string &source, const std::string &source_id) const {
    std::lock_guard lock(mutex_);
    for (const auto &e : entries_) {
      if (e.source == source && e.source_id == source_id) return e;
    }
    return std::nullopt;
  }

  std::filesystem::path GameLibrary::path() const {
    std::lock_guard lock(mutex_);
    return toml_path_;
  }

  // ─── Merge ─────────────────────────────────────────────────────────────────

  int GameLibrary::merge(const std::string &source, const std::vector<GameEntry> &scanned) {
    std::lock_guard lock(mutex_);

    // Build set of scanned dedup keys
    std::unordered_set<std::string> scanned_keys;
    for (const auto &e : scanned) {
      scanned_keys.insert(e.dedup_key());
    }

    // Build set of existing dedup keys for this source
    std::unordered_set<std::string> existing_keys;
    for (const auto &e : entries_) {
      if (e.source == source) existing_keys.insert(e.dedup_key());
    }

    int changes = 0;

    // Add new entries
    for (const auto &e : scanned) {
      if (existing_keys.find(e.dedup_key()) == existing_keys.end()) {
        entries_.push_back(e);
        changes++;
      }
    }

    // Remove auto_managed entries no longer in scan
    auto it = std::remove_if(entries_.begin(), entries_.end(), [&](const GameEntry &e) {
      if (e.source != source || !e.auto_managed) return false;
      return scanned_keys.find(e.dedup_key()) == scanned_keys.end();
    });
    changes += static_cast<int>(std::distance(it, entries_.end()));
    entries_.erase(it, entries_.end());

    return changes;
  }

  void GameLibrary::upsert(const GameEntry &entry) {
    std::lock_guard lock(mutex_);
    auto key = entry.dedup_key();
    for (auto &e : entries_) {
      if (e.dedup_key() == key) {
        e = entry;
        return;
      }
    }
    entries_.push_back(entry);
  }

  bool GameLibrary::remove(const std::string &source, const std::string &source_id) {
    std::lock_guard lock(mutex_);
    auto it = std::remove_if(entries_.begin(), entries_.end(), [&](const GameEntry &e) {
      return e.source == source && e.source_id == source_id;
    });
    if (it != entries_.end()) {
      entries_.erase(it, entries_.end());
      return true;
    }
    return false;
  }

  int GameLibrary::remove_auto_managed(const std::string &source) {
    std::lock_guard lock(mutex_);
    auto it = std::remove_if(entries_.begin(), entries_.end(), [&](const GameEntry &e) {
      return e.source == source && e.auto_managed;
    });
    int count = static_cast<int>(std::distance(it, entries_.end()));
    entries_.erase(it, entries_.end());
    return count;
  }

  // ─── TOML Parsing ──────────────────────────────────────────────────────────

  bool GameLibrary::parse_toml(const std::string &content) {
    try {
      auto tbl = toml::parse(content);

      if (!tbl.contains("apps") || !tbl["apps"].is_array_of_tables()) {
        BOOST_LOG(warning) << "GameLibrary: TOML has no [[apps]] array";
        return false;
      }

      auto &apps = *tbl["apps"].as_array();
      entries_.reserve(apps.size());

      for (auto &node : apps) {
        if (!node.is_table()) continue;
        auto &app = *node.as_table();

        GameEntry entry;
        entry.name = app["name"].value_or(std::string {});
        entry.source = app["source"].value_or(std::string {"manual"});
        entry.source_id = app["source_id"].value_or(std::string {});
        entry.image_path = app["image_path"].value_or(std::string {});
        entry.cmd = app["cmd"].value_or(std::string {});
        entry.working_dir = app["working_dir"].value_or(std::string {});
        entry.auto_managed = app["auto_managed"].value_or(false);
        entry.hidden = app["hidden"].value_or(false);
        entry.elevated = app["elevated"].value_or(false);
        entry.allow_client_commands = app["allow_client_commands"].value_or(true);
        entry.virtual_display_primary = app["virtual_display_primary"].value_or(false);
        entry.use_app_identity = app["use_app_identity"].value_or(false);
        entry.per_client_app_identity = app["per_client_app_identity"].value_or(false);

        // Parse detached array
        if (app.contains("detached") && app["detached"].is_array()) {
          for (auto &d : *app["detached"].as_array()) {
            if (d.is_string()) {
              entry.detached.push_back(d.as_string()->get());
            }
          }
        }

        // Parse prep_cmd array of tables
        if (app.contains("prep_cmd") && app["prep_cmd"].is_array_of_tables()) {
          for (auto &pc_node : *app["prep_cmd"].as_array()) {
            if (!pc_node.is_table()) continue;
            auto &pc = *pc_node.as_table();
            config::prep_cmd_t cmd {
              std::string {pc["do"].value_or(std::string {})},
              std::string {pc["undo"].value_or(std::string {})},
              bool {pc["elevated"].value_or(false)}
            };
            entry.prep_cmds.push_back(std::move(cmd));
          }
        }

        if (entry.name.empty()) continue;  // Skip entries without a name
        entries_.push_back(std::move(entry));
      }

      return true;
    } catch (const toml::parse_error &e) {
      BOOST_LOG(error) << "GameLibrary: TOML parse error: " << e.what();
      return false;
    }
  }

  // ─── JSON Parsing (migration) ──────────────────────────────────────────────

  bool GameLibrary::parse_json(const std::string &content) {
    try {
      auto root = nlohmann::json::parse(content);

      if (!root.contains("apps") || !root["apps"].is_array()) {
        BOOST_LOG(warning) << "GameLibrary: JSON has no 'apps' array";
        return false;
      }

      for (const auto &app : root["apps"]) {
        GameEntry entry;
        entry.name = app.value("name", "");
        entry.source = app.value("source", "manual");
        entry.source_id = app.value("source_id", app.value("sourceId", ""));

        // Handle legacy hyphenated keys
        entry.image_path = app.value("image_path", app.value("image-path", ""));
        entry.cmd = app.value("cmd", "");
        entry.working_dir = app.value("working_dir", app.value("working-dir", ""));
        entry.auto_managed = app.value("auto_managed", false);
        entry.hidden = app.value("hidden", false);
        entry.elevated = app.value("elevated", false);
        entry.allow_client_commands = app.value("allow_client_commands",
                                                app.value("allow-client-commands", true));
        entry.virtual_display_primary = app.value("virtual_display_primary",
                                                  app.value("virtual-display-primary", false));
        entry.use_app_identity = app.value("use_app_identity",
                                           app.value("use-app-identity", false));
        entry.per_client_app_identity = app.value("per_client_app_identity",
                                                  app.value("per-client-app-identity", false));

        // Detached
        if (app.contains("detached") && app["detached"].is_array()) {
          for (const auto &d : app["detached"]) {
            if (d.is_string()) entry.detached.push_back(d.get<std::string>());
          }
        }

        // Prep commands (legacy: "prep-cmd")
        const auto &prep_key = app.contains("prep_cmd") ? "prep_cmd" : "prep-cmd";
        if (app.contains(prep_key) && app[prep_key].is_array()) {
          for (const auto &pc : app[prep_key]) {
            config::prep_cmd_t cmd {
              std::string {pc.value("do", "")},
              std::string {pc.value("undo", "")},
              bool {pc.value("elevated", false)}
            };
            entry.prep_cmds.push_back(std::move(cmd));
          }
        }

        // Detect source from context if not explicitly set
        if (entry.source == "manual" && !entry.source_id.empty()) {
          // If it has a steam:// URI, tag as steam
          if (entry.cmd.find("steam://") != std::string::npos ||
              (!entry.detached.empty() && entry.detached[0].find("steam://") != std::string::npos)) {
            entry.source = "steam";
          }
        }

        // Tag Playnite-imported entries
        if (app.contains("playnite") || app.value("origin", "") == "playnite") {
          entry.source = "playnite_legacy";
        }

        if (entry.name.empty()) continue;
        entries_.push_back(std::move(entry));
      }

      return true;
    } catch (const nlohmann::json::exception &e) {
      BOOST_LOG(error) << "GameLibrary: JSON parse error: " << e.what();
      return false;
    }
  }

  // ��── TOML Serialization ────────────────────────────────────────────────────

  std::string GameLibrary::serialize_toml() const {
    std::ostringstream out;
    out << "# Jujo.Stream Game Library\n";
    out << "# Auto-managed by game source integrations. Manual edits are preserved.\n";
    out << "version = 2\n\n";

    for (const auto &entry : entries_) {
      out << "[[apps]]\n";
      out << "name = " << toml::value<std::string>(entry.name) << "\n";
      out << "source = " << toml::value<std::string>(entry.source) << "\n";
      out << "source_id = " << toml::value<std::string>(entry.source_id) << "\n";

      if (!entry.image_path.empty())
        out << "image_path = " << toml::value<std::string>(entry.image_path) << "\n";
      if (!entry.cmd.empty())
        out << "cmd = " << toml::value<std::string>(entry.cmd) << "\n";
      if (!entry.working_dir.empty())
        out << "working_dir = " << toml::value<std::string>(entry.working_dir) << "\n";

      if (!entry.detached.empty()) {
        toml::array arr;
        for (const auto &d : entry.detached) arr.push_back(d);
        out << "detached = " << arr << "\n";
      }

      if (entry.auto_managed) out << "auto_managed = true\n";
      if (entry.hidden) out << "hidden = true\n";
      if (entry.elevated) out << "elevated = true\n";
      if (!entry.allow_client_commands) out << "allow_client_commands = false\n";
      if (entry.virtual_display_primary) out << "virtual_display_primary = true\n";
      if (entry.use_app_identity) out << "use_app_identity = true\n";
      if (entry.per_client_app_identity) out << "per_client_app_identity = true\n";

      for (const auto &pc : entry.prep_cmds) {
        out << "\n[[apps.prep_cmd]]\n";
        out << "do = " << toml::value<std::string>(pc.do_cmd) << "\n";
        out << "undo = " << toml::value<std::string>(pc.undo_cmd) << "\n";
        if (pc.elevated) out << "elevated = true\n";
      }

      out << "\n";
    }

    return out.str();
  }

}  // namespace game_sources
