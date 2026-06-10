#pragma once

#include <optional>
#include <string>

#include <nlohmann/json.hpp>

namespace toml_utils {
  std::optional<std::string> recover_toml(const std::string &content);
  std::optional<nlohmann::json> read_apps_toml(const std::string &file_name);
  std::string serialize_apps_toml(const nlohmann::json &tree);
}  // namespace toml_utils
