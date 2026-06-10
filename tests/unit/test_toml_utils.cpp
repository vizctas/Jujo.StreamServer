#include <filesystem>
#include <fstream>
#include <string>

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <toml++/toml.hpp>

#include <src/file_handler.h>
#include <src/toml_utils.h>

// --- recover_toml ---

TEST(TomlUtilsRecoverTest, CleanTomlPasses) {
  std::string toml = "version = 2\n[[apps]]\nname = \"Test\"\ncmd = \"test.exe\"\n";
  auto result = toml_utils::recover_toml(toml);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ(*result, toml);
}

TEST(TomlUtilsRecoverTest, TrailingGarbageStripped) {
  std::string clean = "version = 2\n[[apps]]\nname = \"Test\"\n";
  std::string corrupt = clean + "rue\n";
  auto result = toml_utils::recover_toml(corrupt);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ(*result, clean);
}

TEST(TomlUtilsRecoverTest, MultiLineGarbageStripped) {
  std::string clean = "version = 2\n";
  std::string corrupt = clean + "garbage\nmore_garbage\n";
  auto result = toml_utils::recover_toml(corrupt);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ(*result, clean);
}

TEST(TomlUtilsRecoverTest, AllGarbageReturnsNullopt) {
  auto result = toml_utils::recover_toml("not even close to toml\n{{{}}}}\n");
  EXPECT_FALSE(result.has_value());
}

TEST(TomlUtilsRecoverTest, EmptyReturnsNullopt) {
  EXPECT_FALSE(toml_utils::recover_toml("").has_value());
}

TEST(TomlUtilsRecoverTest, PartialValidTableRecovered) {
  std::string toml = "version = 2\n[[apps]]\nname = \"A\"\n[[apps]]\nname = \"B\"\n";
  std::string corrupt = toml + "garbage\n";
  auto result = toml_utils::recover_toml(corrupt);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ(*result, toml);
}

TEST(TomlUtilsRecoverTest, IncompleteLastEntryRecovered) {
  std::string clean = "version = 2\n[[apps]]\nname = \"Good\"\n";
  std::string corrupt = clean + "bare text line\n";
  auto result = toml_utils::recover_toml(corrupt);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ(*result, clean);
}

// --- serialize_apps_toml validation ---

struct TomlUtilsSerializeTest: testing::Test {
  static bool parse_ok(const std::string &toml_str) {
    try {
      toml::parse(toml_str);
      return true;
    } catch (...) {
      return false;
    }
  }
};

TEST_F(TomlUtilsSerializeTest, MinimalAppProducesValidToml) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Minimal";
  app["cmd"] = "run.exe";
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
}

TEST_F(TomlUtilsSerializeTest, FullAppRoundtrip) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Test Game";
  app["uuid"] = "550e8400-e29b-41d4-a716-446655440000";
  app["cmd"] = "game.exe";
  app["image-path"] = "/path/to/image.png";
  app["working-dir"] = "/game/dir";
  app["elevated"] = true;
  app["auto-detach"] = true;
  app["wait-all"] = true;
  app["exit-timeout"] = 30;
  app["virtual-display"] = true;
  app["virtual-display-primary"] = false;
  app["virtual-screen"] = false;
  app["scale-factor"] = 100;
  app["use-app-identity"] = false;
  app["per-client-app-identity"] = true;
  app["allow-client-commands"] = true;
  app["terminate-on-pause"] = false;
  app["hidden"] = false;
  app["description"] = "A game";
  app["developer"] = "Dev";
  app["publisher"] = "Pub";
  app["release-date"] = "2024-01-15";
  app["genres"] = {"Action", "RPG"};
  app["platforms"] = {"Windows", "Linux"};
  app["source"] = "steam";
  app["source_id"] = "12345";
  app["auto_managed"] = true;
  app["source-install-id"] = "inst-uuid-xxx";
  app["playnite-id"] = "pn-yyy";
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  ASSERT_TRUE(tbl["apps"].is_array_of_tables());
  auto &apps = *tbl["apps"].as_array();
  ASSERT_EQ(apps.size(), 1);
  auto &parsed = *apps[0].as_table();
  EXPECT_EQ(parsed["name"].value_or(std::string {}), "Test Game");
  EXPECT_EQ(parsed["cmd"].value_or(std::string {}), "game.exe");
  EXPECT_EQ(parsed["uuid"].value_or(std::string {}), "550e8400-e29b-41d4-a716-446655440000");
  EXPECT_EQ(parsed["image_path"].value_or(std::string {}), "/path/to/image.png");
  EXPECT_TRUE(parsed["elevated"].value_or(false));
  EXPECT_EQ(parsed["exit_timeout"].value_or(10), 30);
  EXPECT_EQ(parsed["description"].value_or(std::string {}), "A game");
  EXPECT_EQ(parsed["developer"].value_or(std::string {}), "Dev");
  EXPECT_EQ(parsed["publisher"].value_or(std::string {}), "Pub");
  EXPECT_EQ(parsed["release_date"].value_or(std::string {}), "2024-01-15");
  EXPECT_TRUE(parsed["auto_managed"].value_or(false));
}

TEST_F(TomlUtilsSerializeTest, PrepCmdRoundtrip) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "PrepCmdGame";
  app["cmd"] = "game.exe";
  nlohmann::json pc1, pc2;
  pc1["do"] = "mount iso";
  pc1["undo"] = "unmount iso";
  pc1["elevated"] = true;
  pc2["do"] = "launch helper";
  pc2["undo"] = "";
  app["prep-cmd"] = {pc1, pc2};
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  ASSERT_TRUE(tbl["apps"].is_array_of_tables());
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  ASSERT_TRUE(parsed["prep_cmd"].is_array_of_tables());
  auto &cmds = *parsed["prep_cmd"].as_array();
  ASSERT_EQ(cmds.size(), 2);
  EXPECT_EQ((*cmds[0].as_table())["do"].value_or(std::string {}), "mount iso");
  EXPECT_EQ((*cmds[0].as_table())["undo"].value_or(std::string {}), "unmount iso");
  EXPECT_TRUE((*cmds[0].as_table())["elevated"].value_or(false));
  EXPECT_EQ((*cmds[1].as_table())["do"].value_or(std::string {}), "launch helper");
}

TEST_F(TomlUtilsSerializeTest, ArraysPreserved) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "ArrayTest";
  app["cmd"] = "test.exe";
  app["genres"] = {"RPG", "Action"};
  app["platforms"] = {"Windows"};
  app["detached"] = {"file1.txt", "file2.txt"};
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  ASSERT_TRUE(parsed["genres"].is_array());
  EXPECT_EQ(parsed["genres"].as_array()->size(), 2);
  ASSERT_TRUE(parsed["platforms"].is_array());
  EXPECT_EQ(parsed["platforms"].as_array()->size(), 1);
}

TEST_F(TomlUtilsSerializeTest, UnknownStringFieldPreserved) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "UnknownFieldTest";
  app["cmd"] = "test.exe";
  app["custom_string"] = "hello";
  app["custom_bool"] = true;
  app["custom_int"] = 42;
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  EXPECT_EQ(parsed["custom_string"].value_or(std::string {}), "hello");
  EXPECT_TRUE(parsed["custom_bool"].value_or(false));
  EXPECT_EQ(parsed["custom_int"].value_or(0), 42);
}

TEST_F(TomlUtilsSerializeTest, ObjectFieldEmitsComment) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "ObjTest";
  app["cmd"] = "test.exe";
  app["custom_obj"] = {{"nested", "value"}};
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(toml.find("(object field omitted: custom_obj)") != std::string::npos);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
}

TEST_F(TomlUtilsSerializeTest, ShieldFieldsRoundtrip) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Shields";
  app["cmd"] = "test.exe";
  app["exclude-global-prep-cmd"] = true;
  app["exclude-global-state-cmd"] = true;
  app["gen1-framegen-fix"] = true;
  app["gen2-framegen-fix"] = false;
  app["lossless-scaling-enabled"] = true;
  app["lossless-scaling-framegen"] = false;
  app["lossless-scaling-legacy-auto-detect"] = true;
  app["lossless-scaling-target-fps"] = 60;
  app["lossless-scaling-rtss-limit"] = 144;
  app["lossless-scaling-launch-delay"] = 2000;
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
  EXPECT_TRUE(toml.find("exclude_global_prep_cmd = true") != std::string::npos);
  EXPECT_TRUE(toml.find("gen1_framegen_fix = true") != std::string::npos);
  EXPECT_TRUE(toml.find("lossless_scaling_target_fps = 60") != std::string::npos);
}

TEST_F(TomlUtilsSerializeTest, StateCmdRoundtrip) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "StateCmd";
  app["cmd"] = "test.exe";
  nlohmann::json sc1, sc2;
  sc1["do"] = "start service";
  sc1["undo"] = "stop service";
  sc1["elevated"] = true;
  sc2["do"] = "check status";
  app["state-cmd"] = {sc1, sc2};
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  auto app_table = (*tbl["apps"].as_array())[0].as_table();
  ASSERT_TRUE(app_table->at("state_cmd").is_array_of_tables());
  auto &cmds = *app_table->at("state_cmd").as_array();
  ASSERT_EQ(cmds.size(), 2);
  auto c0 = cmds[0].as_table();
  EXPECT_EQ(c0->at("do").value_or(std::string {}), "start service");
  EXPECT_TRUE(c0->at("elevated").value_or(false));
  auto c1 = cmds[1].as_table();
  EXPECT_EQ(c1->at("do").value_or(std::string {}), "check status");
}

TEST_F(TomlUtilsSerializeTest, MultipleAppsAllValid) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  for (int i = 0; i < 10; i++) {
    nlohmann::json app;
    app["name"] = "Game " + std::to_string(i);
    app["cmd"] = "game" + std::to_string(i) + ".exe";
    app["uuid"] = "00000000-0000-0000-0000-" + std::to_string(100000000000 + i);
    tree["apps"].push_back(app);
  }
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
  auto tbl = toml::parse(toml);
  EXPECT_EQ(tbl["apps"].as_array()->size(), 10);
}

TEST(TomlUtilsRecoverTest, CorruptMiddleBlockKeepsLaterApps) {
  // A raw newline inside a string (the classic IGDB-description corruption)
  // must not destroy every app that follows it.
  std::string corrupt =
    "version = 2\n"
    "[[apps]]\nname = \"A\"\n"
    "[[apps]]\nname = \"Broken\ndescription with \"quotes\" inside\"\n"
    "[[apps]]\nname = \"C\"\n";
  auto result = toml_utils::recover_toml(corrupt);
  ASSERT_TRUE(result.has_value());
  auto tbl = toml::parse(*result);
  ASSERT_TRUE(tbl["apps"].is_array_of_tables());
  auto &apps = *tbl["apps"].as_array();
  ASSERT_GE(apps.size(), 2u);
  EXPECT_EQ((*apps[0].as_table())["name"].value_or(std::string {}), "A");
  EXPECT_EQ((*apps[apps.size() - 1].as_table())["name"].value_or(std::string {}), "C");
}

// --- serializer escaping (corruption class that broke apps.toml in the field) ---

TEST_F(TomlUtilsSerializeTest, NewlinesAndQuotesInAllStringFields) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Game \"Quoted\"\nSecond line";
  app["cmd"] = "run.exe\t--flag";
  app["description"] = "Line one\r\nLine two with \"quotes\" and \\backslash\\";
  app["developer"] = "Dev\nCo";
  app["genres"] = {"Action\nAdventure", "RPG \"deluxe\""};
  app["detached"] = {"steam://open\nbigpicture"};
  app["custom_field"] = "unknown key with\nnewline and \"quotes\"";
  nlohmann::json pc;
  pc["do"] = "echo \"hi\"\necho second";
  pc["undo"] = "line\rwith\tcontrols";
  app["prep-cmd"] = {pc};
  tree["apps"].push_back(app);

  std::string toml = toml_utils::serialize_apps_toml(tree);
  ASSERT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;

  auto tbl = toml::parse(toml);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  EXPECT_EQ(parsed["name"].value_or(std::string {}), "Game \"Quoted\"\nSecond line");
  EXPECT_EQ(parsed["description"].value_or(std::string {}), "Line one\r\nLine two with \"quotes\" and \\backslash\\");
  EXPECT_EQ(parsed["custom_field"].value_or(std::string {}), "unknown key with\nnewline and \"quotes\"");
  EXPECT_EQ((*parsed["genres"].as_array())[0].value_or(std::string {}), "Action\nAdventure");
}

TEST_F(TomlUtilsSerializeTest, ControlCharactersEscaped) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = std::string("Bell\x07and null-ish\x01chars");
  app["cmd"] = "test.exe";
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  EXPECT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
}

TEST_F(TomlUtilsSerializeTest, InvalidBareKeysOmitted) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "KeyTest";
  app["cmd"] = "test.exe";
  app["bad key with spaces"] = "value";
  app["bad\nkey"] = "value";
  app["good_key"] = "kept";
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  ASSERT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
  auto tbl = toml::parse(toml);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  EXPECT_EQ(parsed["good_key"].value_or(std::string {}), "kept");
  EXPECT_FALSE(parsed.contains("bad key with spaces"));
}

TEST_F(TomlUtilsSerializeTest, TransientContractKeysNotPersisted) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Transient";
  app["cmd"] = "test.exe";
  app["owned"] = true;
  app["installed"] = true;
  app["posterUrl"] = "https://example.com/p.jpg";
  app["metadataState"] = "available";
  app["sourceName"] = "Steam";
  tree["apps"].push_back(app);
  std::string toml = toml_utils::serialize_apps_toml(tree);
  ASSERT_TRUE(parse_ok(toml)) << "TOML output:\n" << toml;
  auto tbl = toml::parse(toml);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  EXPECT_FALSE(parsed.contains("owned"));
  EXPECT_FALSE(parsed.contains("installed"));
  EXPECT_FALSE(parsed.contains("posterUrl"));
  EXPECT_FALSE(parsed.contains("metadataState"));
  EXPECT_FALSE(parsed.contains("sourceName"));
}

TEST_F(TomlUtilsSerializeTest, SerializeParseSerializeStable) {
  nlohmann::json tree;
  tree["apps"] = nlohmann::json::array();
  nlohmann::json app;
  app["name"] = "Stable \"Game\"\nwith newline";
  app["cmd"] = "game.exe";
  app["uuid"] = "550e8400-e29b-41d4-a716-446655440000";
  app["description"] = "desc with \"quotes\"\nand newline";
  app["genres"] = {"A\nB"};
  tree["apps"].push_back(app);

  const std::string first = toml_utils::serialize_apps_toml(tree);
  ASSERT_TRUE(parse_ok(first)) << first;

  // The reader adds default empty fields, so the fixed point is reached after
  // one read/serialize cycle; the second and third generations must match.
  const std::string tmp_path = "test_toml_stable_roundtrip.toml";
  file_handler::write_file(tmp_path.c_str(), first);
  auto reread = toml_utils::read_apps_toml(tmp_path);
  ASSERT_TRUE(reread.has_value());
  const std::string second = toml_utils::serialize_apps_toml(*reread);
  ASSERT_TRUE(parse_ok(second)) << second;

  file_handler::write_file(tmp_path.c_str(), second);
  auto reread2 = toml_utils::read_apps_toml(tmp_path);
  std::filesystem::remove(tmp_path);
  ASSERT_TRUE(reread2.has_value());
  // uuid is preserved across cycles, so generations stay comparable.
  (*reread2)["apps"][0]["uuid"] = (*reread)["apps"][0]["uuid"];
  const std::string third = toml_utils::serialize_apps_toml(*reread2);
  EXPECT_TRUE(parse_ok(third)) << third;
  EXPECT_EQ(second, third);

  // Content survives the round trips.
  auto tbl = toml::parse(third);
  auto &parsed = *(*tbl["apps"].as_array())[0].as_table();
  EXPECT_EQ(parsed["name"].value_or(std::string {}), "Stable \"Game\"\nwith newline");
  EXPECT_EQ(parsed["description"].value_or(std::string {}), "desc with \"quotes\"\nand newline");
}

// --- read_apps_toml ---

TEST(TomlUtilsReadTest, MissingFileReturnsNullopt) {
  auto result = toml_utils::read_apps_toml("nonexistent_file_12345.toml");
  EXPECT_FALSE(result.has_value());
}

TEST(TomlUtilsReadTest, ValidFileReadsCorrectly) {
  std::string path = "test_toml_read_valid.toml";
  std::string content = R"(version = 2

[[apps]]
name = "ReadTest"
cmd = "game.exe"
uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
)";
  file_handler::write_file(path.c_str(), content);
  auto result = toml_utils::read_apps_toml(path);
  ASSERT_TRUE(result.has_value());
  EXPECT_EQ((*result)["apps"][0]["name"], "ReadTest");
  EXPECT_EQ((*result)["apps"][0]["uuid"], "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  std::filesystem::remove(path);
}

TEST(TomlUtilsReadTest, EmptyAppArrayReturnsNullopt) {
  std::string path = "test_toml_empty_apps.toml";
  file_handler::write_file(path.c_str(), "version = 2\n");
  auto result = toml_utils::read_apps_toml(path);
  EXPECT_FALSE(result.has_value());
  std::filesystem::remove(path);
}

TEST(TomlUtilsReadTest, GenerateUuidIfMissing) {
  std::string path = "test_toml_gen_uuid.toml";
  std::string content = R"(version = 2

[[apps]]
name = "NoUUID"
cmd = "game.exe"
)";
  file_handler::write_file(path.c_str(), content);
  auto result = toml_utils::read_apps_toml(path);
  ASSERT_TRUE(result.has_value());
  std::string uuid = (*result)["apps"][0]["uuid"];
  EXPECT_FALSE(uuid.empty());
  EXPECT_EQ(uuid.size(), 36);
  std::filesystem::remove(path);
}
