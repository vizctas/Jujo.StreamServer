// Standalone verification harness for src/toml_utils.cpp.
// Mirrors the gtest cases in tests/unit/test_toml_utils.cpp (which need a
// full server build) so serializer/recovery fixes can be verified quickly.
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <string>

#include <nlohmann/json.hpp>
#include <toml++/toml.hpp>

#include "file_handler.h"
#include "toml_utils.h"

namespace file_handler {
  std::string read_file(const char *path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) return {};
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
  }

  int write_file(const char *path, const std::string_view &contents) {
    std::ofstream out(path, std::ios::binary);
    if (!out) return -1;
    out << contents;
    return out ? 0 : -1;
  }
}  // namespace file_handler

static int g_failures = 0;

#define CHECK(cond) \
  do { \
    if (!(cond)) { \
      ++g_failures; \
      std::printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); \
    } \
  } while (0)

static bool parse_ok(const std::string &s) {
  try {
    toml::parse(s);
    return true;
  } catch (...) {
    return false;
  }
}

int main() {
  using nlohmann::json;

  // 1. Newlines / quotes / control chars in every string sink.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = "Game \"Quoted\"\nSecond line";
    app["cmd"] = "run.exe\t--flag";
    app["description"] = "Line one\r\nLine two with \"quotes\" and \\backslash\\";
    app["developer"] = "Dev\nCo";
    app["genres"] = {"Action\nAdventure", "RPG \"deluxe\""};
    app["detached"] = {"steam://open\nbigpicture"};
    app["custom_field"] = "unknown key with\nnewline and \"quotes\"";
    json pc;
    pc["do"] = "echo \"hi\"\necho second";
    pc["undo"] = "line\rwith\tcontrols";
    app["prep-cmd"] = {pc};
    tree["apps"].push_back(app);

    const auto toml_str = toml_utils::serialize_apps_toml(tree);
    CHECK(parse_ok(toml_str));
    if (parse_ok(toml_str)) {
      auto tbl = toml::parse(toml_str);
      auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
      CHECK(parsed["name"].value_or(std::string {}) == "Game \"Quoted\"\nSecond line");
      CHECK(parsed["description"].value_or(std::string {}) == "Line one\r\nLine two with \"quotes\" and \\backslash\\");
      CHECK(parsed["custom_field"].value_or(std::string {}) == "unknown key with\nnewline and \"quotes\"");
      CHECK((*parsed["genres"].as_array())[0].value_or(std::string {}) == "Action\nAdventure");
      auto &cmds = *parsed["prep_cmd"].as_array();
      CHECK((*cmds[0].as_table())["do"].value_or(std::string {}) == "echo \"hi\"\necho second");
    } else {
      std::printf("--- generated TOML was:\n%s\n", toml_str.c_str());
    }
  }

  // 2. Control characters.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = std::string("Bell\x07and ctrl\x01chars");
    app["cmd"] = "test.exe";
    tree["apps"].push_back(app);
    CHECK(parse_ok(toml_utils::serialize_apps_toml(tree)));
  }

  // 3. Invalid bare keys omitted, valid kept.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = "KeyTest";
    app["cmd"] = "test.exe";
    app["bad key with spaces"] = "value";
    app["bad\nkey"] = "value";
    app["good_key"] = "kept";
    tree["apps"].push_back(app);
    const auto toml_str = toml_utils::serialize_apps_toml(tree);
    CHECK(parse_ok(toml_str));
    auto tbl = toml::parse(toml_str);
    auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
    CHECK(parsed["good_key"].value_or(std::string {}) == "kept");
    CHECK(!parsed.contains("bad key with spaces"));
  }

  // 4. Transient contract keys not persisted.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = "Transient";
    app["cmd"] = "test.exe";
    app["owned"] = true;
    app["installed"] = true;
    app["posterUrl"] = "https://example.com/p.jpg";
    app["metadataState"] = "available";
    app["sourceName"] = "Steam";
    app["index"] = 4;
    tree["apps"].push_back(app);
    const auto toml_str = toml_utils::serialize_apps_toml(tree);
    CHECK(parse_ok(toml_str));
    auto tbl = toml::parse(toml_str);
    auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
    CHECK(!parsed.contains("owned"));
    CHECK(!parsed.contains("installed"));
    CHECK(!parsed.contains("posterUrl"));
    CHECK(!parsed.contains("metadataState"));
    CHECK(!parsed.contains("sourceName"));
    CHECK(!parsed.contains("index"));
  }

  // 5. recover_toml: corrupted middle block keeps later apps.
  {
    std::string corrupt =
      "version = 2\n"
      "[[apps]]\nname = \"A\"\n"
      "[[apps]]\nname = \"Broken\ndescription with \"quotes\" inside\"\n"
      "[[apps]]\nname = \"C\"\n";
    auto result = toml_utils::recover_toml(corrupt);
    CHECK(result.has_value());
    if (result) {
      auto tbl = toml::parse(*result);
      auto &apps = *tbl["apps"].as_array();
      CHECK(apps.size() >= 2);
      CHECK((*apps[0].as_table())["name"].value_or(std::string {}) == "A");
      CHECK((*apps[apps.size() - 1].as_table())["name"].value_or(std::string {}) == "C");
    }
  }

  // 6. recover_toml legacy behaviors (mirror existing gtest expectations).
  {
    std::string toml_str = "version = 2\n[[apps]]\nname = \"Test\"\ncmd = \"test.exe\"\n";
    auto r = toml_utils::recover_toml(toml_str);
    CHECK(r.has_value() && *r == toml_str);

    std::string clean = "version = 2\n[[apps]]\nname = \"Test\"\n";
    r = toml_utils::recover_toml(clean + "rue\n");
    CHECK(r.has_value() && *r == clean);

    r = toml_utils::recover_toml("version = 2\ngarbage\nmore_garbage\n");
    CHECK(r.has_value() && *r == "version = 2\n");

    CHECK(!toml_utils::recover_toml("not even close to toml\n{{{}}}}\n").has_value());
    CHECK(!toml_utils::recover_toml("").has_value());

    std::string two = "version = 2\n[[apps]]\nname = \"A\"\n[[apps]]\nname = \"B\"\n";
    r = toml_utils::recover_toml(two + "garbage\n");
    CHECK(r.has_value() && *r == two);

    std::string good = "version = 2\n[[apps]]\nname = \"Good\"\n";
    r = toml_utils::recover_toml(good + "bare text line\n");
    CHECK(r.has_value() && *r == good);
  }

  // 7. serialize -> read -> serialize reaches a fixed point.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = "Stable \"Game\"\nwith newline";
    app["cmd"] = "game.exe";
    app["uuid"] = "550e8400-e29b-41d4-a716-446655440000";
    app["description"] = "desc with \"quotes\"\nand newline";
    app["genres"] = {"A\nB"};
    tree["apps"].push_back(app);

    const auto first = toml_utils::serialize_apps_toml(tree);
    CHECK(parse_ok(first));

    const char *tmp = "toml_check_roundtrip.toml";
    file_handler::write_file(tmp, first);
    auto reread = toml_utils::read_apps_toml(tmp);
    CHECK(reread.has_value());
    const auto second = toml_utils::serialize_apps_toml(*reread);
    CHECK(parse_ok(second));

    file_handler::write_file(tmp, second);
    auto reread2 = toml_utils::read_apps_toml(tmp);
    CHECK(reread2.has_value());
    if (reread && reread2) {
      (*reread2)["apps"][0]["uuid"] = (*reread)["apps"][0]["uuid"];
      const auto third = toml_utils::serialize_apps_toml(*reread2);
      CHECK(second == third);
      auto tbl = toml::parse(third);
      auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
      CHECK(parsed["name"].value_or(std::string {}) == "Stable \"Game\"\nwith newline");
      CHECK(parsed["description"].value_or(std::string {}) == "desc with \"quotes\"\nand newline");
    }
    std::filesystem::remove(tmp);
  }

  // 8. The exact field corruption: parse the user's broken pattern after a
  // serializer pass — generated output must never contain a raw newline
  // inside a value line.
  {
    json tree;
    tree["apps"] = json::array();
    json app;
    app["name"] = "Tetris Effect";
    app["cmd"] = "F:\\Games\\Tetris Effect\\TetrisEffect.exe";
    app["description"] = "Named after a real-world phenomenon...\n\nplayers' brains \"linger\"";
    tree["apps"].push_back(app);
    const auto toml_str = toml_utils::serialize_apps_toml(tree);
    CHECK(parse_ok(toml_str));
  }

  if (g_failures == 0) {
    std::printf("ALL CHECKS PASSED\n");
    return 0;
  }
  std::printf("%d CHECK(S) FAILED\n", g_failures);
  return 1;
}
