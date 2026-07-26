#include <algorithm>
#include <cctype>
#include <cstdio>
#include <filesystem>
#include <sstream>
#include <string>
#include <unordered_set>
#include <vector>

#include <nlohmann/json.hpp>
#include <toml++/toml.hpp>

#include "file_handler.h"
#include "logging.h"
#include "toml_utils.h"
#include "uuid.h"

namespace toml_utils {
  // Escape a string for use inside a TOML basic (double-quoted) string.
  // TOML basic strings must not contain raw control characters; anything
  // unescaped here would make the whole apps file unparseable.
  static std::string escape_toml_string(const std::string &val) {
    std::string escaped;
    escaped.reserve(val.size());
    for (unsigned char c : val) {
      switch (c) {
        case '\\': escaped += "\\\\"; break;
        case '"': escaped += "\\\""; break;
        case '\n': escaped += "\\n"; break;
        case '\r': escaped += "\\r"; break;
        case '\t': escaped += "\\t"; break;
        case '\b': escaped += "\\b"; break;
        case '\f': escaped += "\\f"; break;
        default:
          if (c < 0x20 || c == 0x7F) {
            char buf[8];
            std::snprintf(buf, sizeof(buf), "\\u%04X", c);
            escaped += buf;
          } else {
            escaped += static_cast<char>(c);
          }
      }
    }
    return escaped;
  }

  // TOML bare keys may only contain ASCII letters, digits, '-' and '_'.
  static bool is_bare_toml_key(const std::string &key) {
    if (key.empty()) return false;
    return std::all_of(key.begin(), key.end(), [](unsigned char c) {
      return std::isalnum(c) || c == '_' || c == '-';
    });
  }

  std::optional<std::string> recover_toml(const std::string &content) {
    if (content.empty()) return std::nullopt;

    std::istringstream stream(content);
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(stream, line)) {
      if (!line.empty() && line.back() == '\r') line.pop_back();
      lines.push_back(line);
    }

    auto is_apps_header = [](const std::string &l) {
      const auto first = l.find_first_not_of(" \t");
      return first != std::string::npos && l.compare(first, 8, "[[apps]]") == 0;
    };
    auto parses = [](const std::string &candidate) {
      try {
        toml::parse(candidate);
        return true;
      } catch (...) {
        return false;
      }
    };

    // Split the file into the header (everything before the first [[apps]])
    // and one block per [[apps]] table (sub-tables like [[apps.prep_cmd]]
    // stay attached to their parent block). Salvage each block independently
    // so a single corrupted app does not wipe out the rest of the library.
    std::string header;
    std::vector<std::vector<std::string>> blocks;
    std::vector<std::string> current;
    bool in_block = false;
    for (const auto &l : lines) {
      if (is_apps_header(l)) {
        if (in_block) {
          blocks.push_back(current);
        } else {
          for (const auto &h : current) {
            header += h + "\n";
          }
          in_block = true;
        }
        current.clear();
      }
      current.push_back(l);
    }
    if (in_block) {
      blocks.push_back(current);
    } else {
      for (const auto &h : current) {
        header += h + "\n";
      }
    }

    if (!parses(header)) {
      header = "version = 2\n\n";
    }

    std::string recovered = header;
    size_t kept = 0;
    for (const auto &block_lines : blocks) {
      // Keep the longest parseable prefix of the block, so trailing garbage
      // inside one app entry costs only the broken lines, not the whole app
      // (and never the apps that follow it). A bare [[apps]] line with no
      // surviving fields carries no data, so stop at two lines minimum.
      for (size_t n = block_lines.size(); n > 1; --n) {
        std::string candidate;
        for (size_t i = 0; i < n; ++i) {
          candidate += block_lines[i] + "\n";
        }
        if (parses(candidate) && parses(recovered + candidate)) {
          recovered += candidate;
          ++kept;
          break;
        }
      }
    }
    if (kept > 0 && parses(recovered)) {
      return recovered;
    }

    // Fall back to the longest parseable prefix.
    for (size_t n = lines.size(); n > 0; --n) {
      std::string candidate;
      for (size_t i = 0; i < n; ++i) {
        candidate += lines[i] + "\n";
      }
      if (parses(candidate)) {
        return candidate;
      }
    }
    return std::nullopt;
  }

  std::optional<nlohmann::json> read_apps_toml(const std::string &file_name) {
    try {
      std::string content = file_handler::read_file(file_name.c_str());
      if (content.empty()) return std::nullopt;

      auto tbl = toml::parse(content);
      nlohmann::json root;
      root["env"] = nlohmann::json::object();
      root["apps"] = nlohmann::json::array();

      if (!tbl.contains("apps") || !tbl["apps"].is_array_of_tables()) {
        BOOST_LOG(warning) << "TOML file has no [[apps]] array: " << file_name;
        return std::nullopt;
      }

      for (auto &node : *tbl["apps"].as_array()) {
        if (!node.is_table()) continue;
        auto &app = *node.as_table();
        nlohmann::json j;

        j["name"] = app["name"].value_or(std::string {});
        j["image-path"] = app["image_path"].value_or(std::string {});
        j["image-path-hires"] = app.contains("image_path_hires")
          ? app["image_path_hires"].value_or(std::string {})
          : (app.contains("image-path-hires")
               ? app["image-path-hires"].value_or(std::string {})
               : std::string {});
        j["header-url"] = app.contains("header_url")
          ? app["header_url"].value_or(std::string {})
          : (app.contains("header-url")
               ? app["header-url"].value_or(std::string {})
               : std::string {});
        j["extra-images"] = nlohmann::json::array();
        const auto *extra_images = app.contains("extra_images")
          ? app["extra_images"].as_array()
          : (app.contains("extra-images") ? app["extra-images"].as_array() : nullptr);
        if (extra_images) {
          for (const auto &image : *extra_images) {
            if (image.is_string()) {
              j["extra-images"].push_back(image.as_string()->get());
            }
          }
        }
        j["cmd"] = app["cmd"].value_or(std::string {});
        j["working-dir"] = app["working_dir"].value_or(std::string {});
        j["elevated"] = app["elevated"].value_or(false);
        j["auto-detach"] = app["auto_detach"].value_or(true);
        j["wait-all"] = app["wait_all"].value_or(true);
        j["exit-timeout"] = app["exit_timeout"].value_or(10);
        j["virtual-display"] = app["virtual_display"].value_or(false);
        j["virtual-display-primary"] = app["virtual_display_primary"].value_or(false);
        j["virtual-screen"] = app["virtual_screen"].value_or(false);
        j["scale-factor"] = app["scale_factor"].value_or(100);
        j["use-app-identity"] = app["use_app_identity"].value_or(false);
        j["per-client-app-identity"] = app["per_client_app_identity"].value_or(false);
        j["allow-client-commands"] = app["allow_client_commands"].value_or(true);
        j["terminate-on-pause"] = app["terminate_on_pause"].value_or(false);
        j["hidden"] = app["hidden"].value_or(false);
        j["flagged-uninstalled"] = app["flagged_uninstalled"].value_or(false);

        // Additional app flags and settings
        j["exclude-global-prep-cmd"] = app["exclude_global_prep_cmd"].value_or(false);
        j["exclude-global-state-cmd"] = app["exclude_global_state_cmd"].value_or(false);
        j["gen1-framegen-fix"] = app["gen1_framegen_fix"].value_or(false);
        j["gen2-framegen-fix"] = app["gen2_framegen_fix"].value_or(false);
        j["lossless-scaling-enabled"] = app["lossless_scaling_enabled"].value_or(false);
        j["lossless-scaling-framegen"] = app["lossless_scaling_framegen"].value_or(false);
        j["lossless-scaling-legacy-auto-detect"] = app["lossless_scaling_legacy_auto_detect"].value_or(false);
        j["lossless-scaling-target-fps"] = app["lossless_scaling_target_fps"].value_or(0);
        j["lossless-scaling-rtss-limit"] = app["lossless_scaling_rtss_limit"].value_or(0);
        j["lossless-scaling-launch-delay"] = app["lossless_scaling_launch_delay"].value_or(0);

        j["description"] = app.contains("description") ? app["description"].value_or(std::string {}) : std::string {};
        j["developer"] = app.contains("developer") ? app["developer"].value_or(std::string {}) : std::string {};
        j["publisher"] = app.contains("publisher") ? app["publisher"].value_or(std::string {}) : std::string {};
        j["release-date"] = app.contains("release-date")
            ? app["release-date"].value_or(std::string {})
            : (app.contains("release_date") ? app["release_date"].value_or(std::string {}) : std::string {});

        if (app.contains("genres") && app["genres"].is_array()) {
          j["genres"] = nlohmann::json::array();
          for (auto &g : *app["genres"].as_array()) {
            if (g.is_string()) j["genres"].push_back(g.as_string()->get());
          }
        } else {
          j["genres"] = nlohmann::json::array();
        }

        if (app.contains("platforms") && app["platforms"].is_array()) {
          j["platforms"] = nlohmann::json::array();
          for (auto &p : *app["platforms"].as_array()) {
            if (p.is_string()) j["platforms"].push_back(p.as_string()->get());
          }
        } else {
          j["platforms"] = nlohmann::json::array();
        }

        if (app.contains("detached") && app["detached"].is_array()) {
          j["detached"] = nlohmann::json::array();
          for (auto &d : *app["detached"].as_array()) {
            if (d.is_string()) j["detached"].push_back(d.as_string()->get());
          }
        }

        if (app.contains("prep_cmd") && app["prep_cmd"].is_array_of_tables()) {
          j["prep-cmd"] = nlohmann::json::array();
          for (auto &pc_node : *app["prep_cmd"].as_array()) {
            if (!pc_node.is_table()) continue;
            auto &pc = *pc_node.as_table();
            nlohmann::json pc_j;
            pc_j["do"] = pc["do"].value_or(std::string {});
            pc_j["undo"] = pc["undo"].value_or(std::string {});
            pc_j["elevated"] = pc["elevated"].value_or(false);
            j["prep-cmd"].push_back(pc_j);
          }
        }

        if (app.contains("state_cmd") && app["state_cmd"].is_array_of_tables()) {
          j["state-cmd"] = nlohmann::json::array();
          for (auto &sc_node : *app["state_cmd"].as_array()) {
            if (!sc_node.is_table()) continue;
            auto &sc = *sc_node.as_table();
            nlohmann::json sc_j;
            sc_j["do"] = sc["do"].value_or(std::string {});
            sc_j["undo"] = sc["undo"].value_or(std::string {});
            sc_j["elevated"] = sc["elevated"].value_or(false);
            j["state-cmd"].push_back(sc_j);
          }
        }

        const auto source = app.contains("source")
          ? app["source"].value_or(std::string {"manual"})
          : (app.contains("source-id") ? app["source-id"].value_or(std::string {"manual"}) : std::string {"manual"});
        if (!source.empty()) {
          j["source"] = source;
          j["source-id"] = source;
        }
        if (app.contains("source_id")) {
          const auto provider_game_id = app["source_id"].value_or(std::string {});
          if (!provider_game_id.empty()) {
            j["source_id"] = provider_game_id;
            j["provider-game-id"] = provider_game_id;
          }
        }
        if (!j.contains("provider-game-id") && app.contains("provider-game-id")) {
          const auto provider_game_id = app["provider-game-id"].value_or(std::string {});
          if (!provider_game_id.empty()) {
            j["source_id"] = provider_game_id;
            j["provider-game-id"] = provider_game_id;
          }
        }
        if (app.contains("auto_managed")) j["auto_managed"] = app["auto_managed"].value_or(false);

        // Persisted source install binding and Playnite integration
        {
          const auto install_id = app.contains("source-install-id")
            ? app["source-install-id"].value_or(std::string {})
            : (app.contains("source_install_id") ? app["source_install_id"].value_or(std::string {}) : std::string {});
          if (!install_id.empty()) j["source-install-id"] = install_id;
        }
        {
          const auto pn_id = app.contains("playnite-id")
            ? app["playnite-id"].value_or(std::string {})
            : (app.contains("playnite_id") ? app["playnite_id"].value_or(std::string {}) : std::string {});
          if (!pn_id.empty()) j["playnite-id"] = pn_id;
        }

        if (app.contains("uuid")) {
          j["uuid"] = app["uuid"].value_or(std::string {});
        }
        if (!j.contains("uuid") || j["uuid"].get<std::string>().empty()) {
          j["uuid"] = uuid_util::uuid_t::generate().string();
        }

        root["apps"].push_back(j);
      }

      root["version"] = 2;

      return root;
    } catch (const toml::parse_error &e) {
      BOOST_LOG(error) << "TOML parse error in " << file_name << ": " << e.what();
      return std::nullopt;
    } catch (const std::exception &e) {
      BOOST_LOG(error) << "Error reading TOML file " << file_name << ": " << e.what();
      return std::nullopt;
    }
  }

  std::string serialize_apps_toml(const nlohmann::json &tree) {
    std::ostringstream out;
    out << "# Jujo.Stream Game Library\n";
    out << "# Auto-managed. Manual edits are preserved.\n";
    out << "version = 2\n\n";

    if (!tree.contains("apps") || !tree["apps"].is_array()) {
      return out.str();
    }

    for (const auto &app : tree["apps"]) {
      out << "[[apps]]\n";

      auto write_str = [&](const char *toml_key, const char *json_key) {
        if (app.contains(json_key) && app[json_key].is_string()) {
          out << toml_key << " = \"" << escape_toml_string(app[json_key].get<std::string>()) << "\"\n";
        }
      };

      auto write_bool = [&](const char *toml_key, const char *json_key, bool default_val) {
        bool val = default_val;
        if (app.contains(json_key)) {
          if (app[json_key].is_boolean()) val = app[json_key].get<bool>();
          else if (app[json_key].is_string()) val = app[json_key].get<std::string>() == "true";
        }
        if (val != default_val) {
          out << toml_key << " = " << (val ? "true" : "false") << "\n";
        }
      };

      auto write_int = [&](const char *toml_key, const char *json_key, int default_val) {
        int val = default_val;
        if (app.contains(json_key)) {
          if (app[json_key].is_number()) val = app[json_key].get<int>();
          else if (app[json_key].is_string()) {
            try { val = std::stoi(app[json_key].get<std::string>()); } catch (...) {}
          }
        }
        if (val != default_val) {
          out << toml_key << " = " << val << "\n";
        }
      };

      write_str("name", "name");
      write_str("uuid", "uuid");
      write_str("image_path", "image-path");
      if (!app.contains("image-path") || !app["image-path"].is_string() || app["image-path"].get<std::string>().empty()) {
        write_str("image_path", "image_path");
      }
      write_str("image_path_hires", "image-path-hires");
      if (!app.contains("image-path-hires")) {
        write_str("image_path_hires", "image_path_hires");
      }
      write_str("header_url", "header-url");
      if (!app.contains("header-url")) {
        write_str("header_url", "header_url");
      }
      write_str("cmd", "cmd");
      write_str("working_dir", "working-dir");
      if (!app.contains("working-dir")) write_str("working_dir", "working_dir");

      write_str("description", "description");
      write_str("developer", "developer");
      write_str("publisher", "publisher");
      write_str("release_date", "release-date");
      if (!app.contains("release-date") || !app["release-date"].is_string() || app["release-date"].get<std::string>().empty()) {
        write_str("release_date", "release_date");
      }

      auto write_array = [&](const char *toml_key, const char *json_key) {
        if (app.contains(json_key) && app[json_key].is_array() && !app[json_key].empty()) {
          out << toml_key << " = [";
          bool first = true;
          for (const auto &item : app[json_key]) {
            if (item.is_string()) {
              if (!first) out << ", ";
              out << "\"" << escape_toml_string(item.get<std::string>()) << "\"";
              first = false;
            }
          }
          out << "]\n";
        }
      };
      write_array("genres", "genres");
      write_array("platforms", "platforms");
      if (app.contains("extra-images")) {
        write_array("extra_images", "extra-images");
      } else {
        write_array("extra_images", "extra_images");
      }

      write_str("playnite_id", "playnite-id");
      write_str("source_install_id", "source-install-id");

      if (app.contains("source") && app["source"].is_string() && !app["source"].get<std::string>().empty()) {
        write_str("source", "source");
      } else {
        write_str("source", "source-id");
      }
      if (app.contains("source_id") && app["source_id"].is_string() && !app["source_id"].get<std::string>().empty()) {
        write_str("source_id", "source_id");
      } else if (app.contains("provider-game-id") && app["provider-game-id"].is_string() && !app["provider-game-id"].get<std::string>().empty()) {
        write_str("source_id", "provider-game-id");
      } else {
        write_str("source_id", "providerGameId");
      }
      write_bool("auto_managed", "auto_managed", false);

      write_bool("elevated", "elevated", false);
      write_bool("auto_detach", "auto-detach", true);
      write_bool("wait_all", "wait-all", true);
      write_bool("virtual_display", "virtual-display", false);
      write_bool("virtual_display_primary", "virtual-display-primary", false);
      write_bool("virtual_screen", "virtual-screen", false);
      write_bool("use_app_identity", "use-app-identity", false);
      write_bool("per_client_app_identity", "per-client-app-identity", false);
      write_bool("allow_client_commands", "allow-client-commands", true);
      write_bool("terminate_on_pause", "terminate-on-pause", false);
      write_bool("hidden", "hidden", false);
      write_bool("flagged_uninstalled", "flagged-uninstalled", false);

      write_int("exit_timeout", "exit-timeout", 10);
      write_int("scale_factor", "scale-factor", 100);

      write_bool("exclude_global_prep_cmd", "exclude-global-prep-cmd", false);
      write_bool("exclude_global_state_cmd", "exclude-global-state-cmd", false);
      write_bool("gen1_framegen_fix", "gen1-framegen-fix", false);
      write_bool("gen2_framegen_fix", "gen2-framegen-fix", false);
      write_bool("lossless_scaling_enabled", "lossless-scaling-enabled", false);
      write_bool("lossless_scaling_framegen", "lossless-scaling-framegen", false);
      write_bool("lossless_scaling_legacy_auto_detect", "lossless-scaling-legacy-auto-detect", false);
      write_int("lossless_scaling_target_fps", "lossless-scaling-target-fps", 0);
      write_int("lossless_scaling_rtss_limit", "lossless-scaling-rtss-limit", 0);
      write_int("lossless_scaling_launch_delay", "lossless-scaling-launch-delay", 0);

      const char *det_key = app.contains("detached") ? "detached" : nullptr;
      if (det_key && app[det_key].is_array() && !app[det_key].empty()) {
        out << "detached = [";
        bool first = true;
        for (const auto &d : app[det_key]) {
          if (!d.is_string()) continue;
          if (!first) out << ", ";
          out << "\"" << escape_toml_string(d.get<std::string>()) << "\"";
          first = false;
        }
        out << "]\n";
      }

      for (auto &[key, val] : app.items()) {
        static const std::unordered_set<std::string> handled = {
          "name", "image-path", "image_path",
          "image-path-hires", "image_path_hires",
          "header-url", "header_url", "extra-images", "extra_images",
          "cmd", "working-dir", "working_dir",
          "source", "source-id", "source_id", "provider-game-id", "providerGameId",
          "auto_managed", "elevated", "auto-detach", "auto_detach",
          "wait-all", "wait_all", "virtual-display", "virtual_display",
          "virtual-display-primary", "virtual_display_primary",
          "virtual-screen", "virtual_screen", "use-app-identity", "use_app_identity",
          "per-client-app-identity", "per_client_app_identity",
          "allow-client-commands", "allow_client_commands",
          "terminate-on-pause", "terminate_on_pause", "hidden",
          "flagged-uninstalled", "flagged_uninstalled",
          "exit-timeout", "exit_timeout", "scale-factor", "scale_factor",
          "detached", "prep-cmd", "prep_cmd", "state-cmd", "state_cmd",
          "description", "developer", "publisher", "release-date", "release_date",
          "genres", "platforms", "uuid",
        "playnite-id", "playnite_id",
        "source-install-id", "source_install_id",
        "state-cmd", "state_cmd",
        "exclude-global-prep-cmd", "exclude_global_prep_cmd",
        "exclude-global-state-cmd", "exclude_global_state_cmd",
        "gen1-framegen-fix", "gen1_framegen_fix",
        "gen2-framegen-fix", "gen2_framegen_fix",
        "lossless-scaling-enabled", "lossless_scaling_enabled",
        "lossless-scaling-framegen", "lossless_scaling_framegen",
        "lossless-scaling-legacy-auto-detect", "lossless_scaling_legacy_auto_detect",
        "lossless-scaling-target-fps", "lossless_scaling_target_fps",
        "lossless-scaling-rtss-limit", "lossless_scaling_rtss_limit",
        "lossless-scaling-launch-delay", "lossless_scaling_launch_delay",
      };
        // Transient game-source contract fields (steam_game_contract etc.)
        // describe runtime state and must never be persisted to apps.toml.
        static const std::unordered_set<std::string> transient = {
          "owned", "installed", "playable", "installState", "installPath",
          "executablePath", "posterUrl", "posterState", "metadataState",
          "metadata", "launchableVia", "id", "index", "sourceId", "sourceName", "title",
        };
        if (handled.count(key) || transient.count(key)) continue;
        if (!is_bare_toml_key(key)) {
          out << "# (invalid key omitted)\n";
          continue;
        }

        if (val.is_string()) {
          out << key << " = \"" << escape_toml_string(val.get<std::string>()) << "\"\n";
        } else if (val.is_boolean()) {
          out << key << " = " << (val.get<bool>() ? "true" : "false") << "\n";
        } else if (val.is_number_integer()) {
          out << key << " = " << val.get<int64_t>() << "\n";
        } else if (val.is_number_float()) {
          out << key << " = " << val.get<double>() << "\n";
        } else if (val.is_object()) {
          out << "# (object field omitted: " << key << ")\n";
        } else if (val.is_array()) {
          out << key << " = [";
          bool first = true;
          for (const auto &item : val) {
            if (item.is_string()) {
              if (!first) out << ", ";
              out << "\"" << escape_toml_string(item.get<std::string>()) << "\"";
              first = false;
            }
          }
          out << "]\n";
        }
      }

      auto write_cmd_array = [&](const char *json_key, const char *toml_key) {
        std::string key;
        if (app.contains(json_key)) {
          key = json_key;
        } else if (app.contains(std::string(json_key) + "_cmd")) {
          key = std::string(json_key) + "_cmd";
        } else if (app.contains(toml_key)) {
          key = toml_key;
        }
        if (!key.empty() && app[key].is_array()) {
          for (const auto &cmd : app[key]) {
            if (!cmd.is_object()) continue;
            out << "\n[[" << toml_key << "]]\n";
            out << "do = \"" << escape_toml_string(cmd.value("do", "")) << "\"\n";
            out << "undo = \"" << escape_toml_string(cmd.value("undo", "")) << "\"\n";
            if (cmd.value("elevated", false)) out << "elevated = true\n";
          }
        }
      };
      write_cmd_array("prep-cmd", "apps.prep_cmd");
      write_cmd_array("state-cmd", "apps.state_cmd");

      out << "\n";
    }

    return out.str();
  }
}  // namespace toml_utils
