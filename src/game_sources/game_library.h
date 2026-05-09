/**
 * @file src/game_sources/game_library.h
 * @brief Game library manager — loads/saves apps.toml, handles JSON migration.
 */
#pragma once

#include <filesystem>
#include <mutex>
#include <optional>
#include <string>
#include <vector>

#include "src/config.h"

namespace game_sources {

  /**
   * @brief A single game/app entry in the library.
   * Maps 1:1 to a [[apps]] table in apps.toml.
   */
  struct GameEntry {
    std::string name;
    std::string source;      ///< "system", "steam", "epic", "gog", "xbox", "manual", "playnite_legacy"
    std::string source_id;   ///< Platform-specific ID (Steam appid, Epic catalog ID, etc.)
    std::string image_path;
    std::string cmd;
    std::string working_dir;
    std::vector<std::string> detached;
    std::vector<config::prep_cmd_t> prep_cmds;
    bool auto_managed = false;
    bool hidden = false;
    bool elevated = false;
    bool allow_client_commands = true;
    bool virtual_display_primary = false;
    bool use_app_identity = false;
    bool per_client_app_identity = false;

    /// Unique key for deduplication: source + source_id (or name if source_id empty).
    std::string dedup_key() const;
  };

  /**
   * @brief Manages the game library (apps.toml).
   *
   * Thread-safe. All public methods acquire the internal mutex.
   * Provides load/save/merge operations and JSON migration.
   */
  class GameLibrary {
  public:
    GameLibrary() = default;

    /**
     * @brief Load the library from disk.
     * Reads apps.toml if present; falls back to apps.json and auto-migrates.
     * @param toml_path Path to apps.toml
     * @param json_fallback_path Path to apps.json (for migration)
     * @return true if loaded successfully
     */
    bool load(const std::filesystem::path &toml_path, const std::filesystem::path &json_fallback_path);

    /**
     * @brief Save the current library to apps.toml (atomic: write tmp + rename).
     * @return true if saved successfully
     */
    bool save();

    /**
     * @brief Get all entries (thread-safe copy).
     */
    std::vector<GameEntry> get_all() const;

    /**
     * @brief Get entries filtered by source.
     */
    std::vector<GameEntry> get_by_source(const std::string &source) const;

    /**
     * @brief Find an entry by source + source_id.
     */
    std::optional<GameEntry> find(const std::string &source, const std::string &source_id) const;

    /**
     * @brief Merge scanned entries from a source into the library.
     * - Adds new entries not already present (by dedup_key)
     * - Removes auto_managed entries whose source_id is no longer in the scan
     * - Never touches entries with auto_managed=false (user-pinned)
     * @param source Source identifier (e.g., "steam")
     * @param scanned Entries from the source scan
     * @return Number of entries added/removed
     */
    int merge(const std::string &source, const std::vector<GameEntry> &scanned);

    /**
     * @brief Add or update a single entry.
     * If an entry with the same dedup_key exists, it's updated; otherwise added.
     */
    void upsert(const GameEntry &entry);

    /**
     * @brief Remove an entry by source + source_id.
     * @return true if removed
     */
    bool remove(const std::string &source, const std::string &source_id);

    /**
     * @brief Remove all entries from a given source that are auto_managed.
     * @return Number removed
     */
    int remove_auto_managed(const std::string &source);

    /**
     * @brief Get the file path currently in use.
     */
    std::filesystem::path path() const;

    /**
     * @brief Check if the library was migrated from JSON this session.
     */
    bool was_migrated() const { return migrated_from_json_; }

  private:
    mutable std::mutex mutex_;
    std::vector<GameEntry> entries_;
    std::filesystem::path toml_path_;
    bool migrated_from_json_ = false;

    /// Internal save (caller must hold mutex_).
    bool save_internal();

    /// Parse apps.toml content into entries_.
    bool parse_toml(const std::string &content);

    /// Parse apps.json content into entries_ (for migration).
    bool parse_json(const std::string &content);

    /// Serialize entries_ to TOML string.
    std::string serialize_toml() const;
  };

}  // namespace game_sources
