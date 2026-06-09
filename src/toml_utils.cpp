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
  std::optional<std::string> recover_toml(const std::string &content) {
    if (content.empty()) return std::nullopt;

    std::istringstream stream(content);
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(stream, line)) {
      lines.push_back(line);
    }

    for (size_t n = lines.size(); n > 0; --n) {
      std::string candidate;
      for (size_t i = 0; i < n; ++i) {
        candidate += lines[i] + "\n";
      }
      try {
        toml::parse(candidate);
        return candidate;
      } catch (...) {
        continue;
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
          std::string val = app[json_key].get<std::string>();
          std::string escaped;
          escaped.reserve(val.size());
          for (char c : val) {
            if (c == '\\') escaped += "\\\\";
            else if (c == '"') escaped += "\\\"";
            else if (c == '\n') escaped += "\\n";
            else if (c == '\r') escaped += "\\r";
            else if (c == '\t') escaped += "\\t";
            else escaped += c;
          }
          out << toml_key << " = \"" << escaped << "\"\n";
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
              std::string s = item.get<std::string>();
              std::string escaped;
              for (char c : s) {
                if (c == '\\') escaped += "\\\\";
                else if (c == '"') escaped += "\\\"";
                else escaped += c;
              }
              out << "\"" << escaped << "\"";
              first = false;
            }
          }
          out << "]\n";
        }
      };
      write_array("genres", "genres");
      write_array("platforms", "platforms");

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

      write_int("exit_timeout", "exit-timeout", 10);
      write_int("scale_factor", "scale-factor", 100);

      const char *det_key = app.contains("detached") ? "detached" : nullptr;
      if (det_key && app[det_key].is_array() && !app[det_key].empty()) {
        out << "detached = [";
        bool first = true;
        for (const auto &d : app[det_key]) {
          if (!d.is_string()) continue;
          if (!first) out << ", ";
          std::string val = d.get<std::string>();
          std::string escaped;
          for (char c : val) {
            if (c == '\\') escaped += "\\\\";
            else if (c == '"') escaped += "\\\"";
            else escaped += c;
          }
          out << "\"" << escaped << "\"";
          first = false;
        }
        out << "]\n";
      }

      for (auto &[key, val] : app.items()) {
        static const std::unordered_set<std::string> handled = {
          "name", "image-path", "image_path", "cmd", "working-dir", "working_dir",
          "source", "source-id", "source_id", "provider-game-id", "providerGameId",
          "auto_managed", "elevated", "auto-detach", "auto_detach",
          "wait-all", "wait_all", "virtual-display", "virtual_display",
          "virtual-display-primary", "virtual_display_primary",
          "virtual-screen", "virtual_screen", "use-app-identity", "use_app_identity",
          "per-client-app-identity", "per_client_app_identity",
          "allow-client-commands", "allow_client_commands",
          "terminate-on-pause", "terminate_on_pause", "hidden",
          "exit-timeout", "exit_timeout", "scale-factor", "scale_factor",
          "detached", "prep-cmd", "prep_cmd",
          "description", "developer", "publisher", "release-date", "release_date",
          "genres", "platforms", "uuid",
          "playnite-id", "playnite_id",
          "source-install-id", "source_install_id",
        };
        if (handled.count(key)) continue;

        if (val.is_string()) {
          std::string s = val.get<std::string>();
          std::string escaped;
          for (char c : s) {
            if (c == '\\') escaped += "\\\\";
            else if (c == '"') escaped += "\\\"";
            else escaped += c;
          }
          out << key << " = \"" << escaped << "\"\n";
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
              std::string s = item.get<std::string>();
              std::string escaped;
              for (char c : s) {
                if (c == '\\') escaped += "\\\\";
                else if (c == '"') escaped += "\\\"";
                else escaped += c;
              }
              out << "\"" << escaped << "\"";
              first = false;
            }
          }
          out << "]\n";
        }
      }

      const char *prep_key = app.contains("prep-cmd") ? "prep-cmd" : (app.contains("prep_cmd") ? "prep_cmd" : nullptr);
      if (prep_key && app[prep_key].is_array()) {
        for (const auto &pc : app[prep_key]) {
          out << "\n[[apps.prep_cmd]]\n";
          std::string do_cmd = pc.value("do", "");
          std::string undo_cmd = pc.value("undo", "");
          bool elev = pc.value("elevated", false);
          auto esc = [](const std::string &s) {
            std::string r;
            for (char c : s) {
              if (c == '\\') r += "\\\\";
              else if (c == '"') r += "\\\"";
              else r += c;
            }
            return r;
          };
          out << "do = \"" << esc(do_cmd) << "\"\n";
          out << "undo = \"" << esc(undo_cmd) << "\"\n";
          if (elev) out << "elevated = true\n";
        }
      }

      out << "\n";
    }

    return out.str();
  }
}  // namespace toml_utils
