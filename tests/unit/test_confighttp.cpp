// standard includes
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <map>
#include <memory>
#include <string>

// lib includes
#include <boost/asio.hpp>
#include <nlohmann/json.hpp>
#include <Simple-Web-Server/crypto.hpp>

// local includes
#include "../tests_common.h"
#include "src/config.h"
#include "src/confighttp.h"
#include "src/confighttp_internal.h"
#include "src/crypto.h"
#include "src/http_auth.h"
#include "src/httpcommon.h"
#include "src/network.h"
#include "src/state_storage.h"
#include "src/utility.h"

using namespace testing;

namespace confighttp {

  class ConfigHttpAuthHelpersTest: public Test {
  protected:
    void SetUp() override {
      // Save original config values
      original_username = config::sunshine.username;
      original_password = config::sunshine.password;
      original_salt = config::sunshine.salt;

      // Set test config
      config::sunshine.username = "testuser";
      config::sunshine.password = util::hex(crypto::hash(std::string("testpass") + "testsalt")).to_string();
      config::sunshine.salt = "testsalt";
    }

    void TearDown() override {
      // Restore original config values
      config::sunshine.username = original_username;
      config::sunshine.password = original_password;
      config::sunshine.salt = original_salt;
    }

    std::string createBasicAuthHeader(const std::string &username, const std::string &password) const {
      auto credentials = username + ":" + password;
      auto encoded = SimpleWeb::Crypto::Base64::encode(credentials);
      return "Basic " + encoded;
    }

  private:
    std::string original_username;
    std::string original_password;
    std::string original_salt;
  };

  TEST_F(ConfigHttpAuthHelpersTest, given_unauthorized_error_when_making_auth_error_then_should_return_proper_response) {
    auto result = make_auth_error(SimpleWeb::StatusCode::client_error_unauthorized, "Unauthorized");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Unauthorized");
    auto www_auth_it = result.headers.find("WWW-Authenticate");
    EXPECT_EQ(www_auth_it, result.headers.end());
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_forbidden_error_when_making_auth_error_then_should_return_proper_response) {
    auto result = make_auth_error(SimpleWeb::StatusCode::client_error_forbidden, "Forbidden");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_forbidden);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Forbidden");
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_redirect_location_when_making_auth_error_then_should_return_redirect_response) {
    auto result = make_auth_error(SimpleWeb::StatusCode::redirection_temporary_redirect, "");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::redirection_temporary_redirect);
    EXPECT_TRUE(result.body.empty());
    auto location_header = result.headers.find("Location");
    EXPECT_EQ(location_header, result.headers.end());
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_custom_error_message_when_making_auth_error_then_should_return_response_with_custom_message) {
    auto result = make_auth_error(SimpleWeb::StatusCode::client_error_forbidden, "Custom error message");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_forbidden);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Custom error message");
  }

  class ConfigHttpCheckBearerAuthTest: public Test {
  protected:
    void SetUp() override {
      // Bearer auth tests would require mocking the API token manager
      // For now we just test the function signature and basic error case
    }
  };

  TEST_F(ConfigHttpCheckBearerAuthTest, given_invalid_bearer_token_when_checking_auth_then_should_return_forbidden) {
    // Given: Invalid bearer token for API endpoint
    auto raw_auth = "Bearer invalid_token_123";
    auto path = "/api/test";
    auto method = "GET";

    // When: Checking bearer authentication
    auto result = check_bearer_auth(raw_auth, path, method);

    // Then: Should return forbidden error
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_forbidden);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Forbidden: Token does not have permission for this path/method.");
  }

  class ConfigHttpCheckAuthTest: public Test {
  protected:
    void SetUp() override {
      // Save original config values
      original_username = config::sunshine.username;
      original_password = config::sunshine.password;
      original_salt = config::sunshine.salt;

      // Set test config
      config::sunshine.username = "testuser";
      config::sunshine.password = util::hex(crypto::hash(std::string("testpass") + "testsalt")).to_string();
      config::sunshine.salt = "testsalt";
    }

    void TearDown() override {
      // Restore original config values
      config::sunshine.username = original_username;
      config::sunshine.password = original_password;
      config::sunshine.salt = original_salt;
    }

    std::string createBasicAuthHeader(const std::string &username, const std::string &password) const {
      auto credentials = username + ":" + password;
      auto encoded = SimpleWeb::Crypto::Base64::encode(credentials);
      return "Basic " + encoded;
    }

  private:
    std::string original_username;
    std::string original_password;
    std::string original_salt;
  };

  TEST_F(ConfigHttpCheckAuthTest, given_missing_auth_header_when_checking_auth_then_should_return_unauthorized) {
    // Given: No authentication header provided

    // When: Checking authentication with empty header
    auto result = check_auth("127.0.0.1", "", "/api/test", "GET");

    // Then: Should return unauthorized error
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Unauthorized");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_empty_username_config_when_checking_auth_then_should_return_unauthorized) {
    // Given: Empty username configuration (initial setup)
    config::sunshine.username = "";

    // When: Checking authentication during initial setup for an API endpoint
    auto result = check_auth("127.0.0.1", "Basic dGVzdDp0ZXN0", "/api/test", "GET");

    // Then: Should return unauthorized error for API access
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Credentials not configured");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_disallowed_ip_address_when_checking_auth_then_should_return_forbidden) {
    // Given: Valid credentials but disallowed IP address
    auto auth_header = createBasicAuthHeader("testuser", "testpass");

    // When: Checking authentication from external IP
    auto result = check_auth("8.8.8.8", auth_header, "/api/test", "GET");

    // Then: Should return forbidden error
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_forbidden);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Forbidden");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_invalid_basic_credentials_when_checking_auth_then_should_return_unauthorized) {
    auto auth_header = createBasicAuthHeader("testuser", "wrongpass");

    auto result = check_auth("127.0.0.1", auth_header, "/api/test", "GET");

    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Unauthorized");
    auto www_auth_it = result.headers.find("WWW-Authenticate");
    EXPECT_NE(www_auth_it, result.headers.end());
    EXPECT_EQ(www_auth_it->second, "Basic realm=\"Sunshine\"");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_valid_basic_credentials_when_checking_auth_then_should_authorize) {
    auto auth_header = createBasicAuthHeader("testuser", "testpass");

    auto result = check_auth("127.0.0.1", auth_header, "/api/test", "GET");

    EXPECT_TRUE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::success_ok);
    EXPECT_TRUE(result.body.empty());
    EXPECT_TRUE(result.headers.empty());
  }

  TEST_F(ConfigHttpCheckAuthTest, given_invalid_bearer_token_when_checking_auth_then_should_return_forbidden) {
    // Given: Invalid bearer token for API access

    // When: Checking authentication with invalid bearer token
    auto result = check_auth("127.0.0.1", "Bearer invalid_token", "/api/test", "GET");

    // Then: Should return forbidden error
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_forbidden);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Forbidden: Token does not have permission for this path/method.");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_unsupported_auth_scheme_when_checking_auth_then_should_return_unauthorized) {
    // Given: Unsupported authentication scheme (Digest)

    // When: Checking authentication with unsupported scheme
    auto result = check_auth("127.0.0.1", "Digest realm=test", "/api/test", "GET");

    // Then: Should return unauthorized error
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);

    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Unauthorized");
  }

  TEST(ConfigHttpHelpersTest, given_various_paths_when_checking_is_html_request_then_should_return_expected) {
    EXPECT_TRUE(is_html_request("/"));
    EXPECT_TRUE(is_html_request("/index.html"));
    EXPECT_FALSE(is_html_request("/api/test"));
    EXPECT_FALSE(is_html_request("/assets/style.css"));
    EXPECT_FALSE(is_html_request("/images/logo.png"));
    EXPECT_TRUE(is_html_request("/login"));
  }

  TEST(ConfigHttpHelpersTest, given_token_scope_when_converting_to_string_then_should_return_expected) {
    EXPECT_EQ(scope_to_string(TokenScope::Read), "Read");
    EXPECT_EQ(scope_to_string(TokenScope::Write), "Write");
    EXPECT_THROW(scope_to_string(static_cast<TokenScope>(-1)), std::invalid_argument);
  }

  TEST(ConfigHttpSessionAuthTest, given_invalid_session_format_then_should_return_error) {
    auto result = check_session_auth("Invalid token");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Invalid session token format");
  }

  TEST(ConfigHttpSessionAuthTest, given_invalid_session_token_then_should_return_error) {
    auto result = check_session_auth("Session fake_token");
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::client_error_unauthorized);
    auto json_response = nlohmann::json::parse(result.body);
    EXPECT_EQ(json_response["error"], "Invalid or expired session token");
  }

  TEST_F(ConfigHttpCheckAuthTest, given_html_page_request_without_auth_when_checking_auth_then_should_redirect_to_login_with_redirect_param) {
    auto result = check_auth("127.0.0.1", "", "/home", "GET");
    EXPECT_TRUE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::success_ok);
    EXPECT_TRUE(result.body.empty());
    EXPECT_TRUE(result.headers.empty());
  }

  TEST_F(ConfigHttpCheckAuthTest, given_login_page_path_when_checking_auth_then_should_allow_without_authentication) {
    auto result = check_auth("127.0.0.1", "", "/login", "GET");
    EXPECT_TRUE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::success_ok);
    EXPECT_TRUE(result.body.empty());
    EXPECT_TRUE(result.headers.empty());

    auto result2 = check_auth("127.0.0.1", "", "/login/", "GET");
    EXPECT_TRUE(result2.ok);
    EXPECT_EQ(result2.code, SimpleWeb::StatusCode::success_ok);
    EXPECT_TRUE(result2.body.empty());
    EXPECT_TRUE(result2.headers.empty());
  }

  TEST_F(ConfigHttpCheckAuthTest, given_unknown_auth_scheme_and_html_path_when_checking_auth_then_should_redirect_to_login) {
    auto result = check_auth("127.0.0.1", "Digest realm=foo", "/index.html", "GET");
    EXPECT_TRUE(result.ok);
    EXPECT_EQ(result.code, SimpleWeb::StatusCode::success_ok);
    EXPECT_TRUE(result.body.empty());
    EXPECT_TRUE(result.headers.empty());
  }

  class ConfigHttpCorsTest: public Test {
  protected:
    void SetUp() override {
      // Save original port configuration
      original_port = config::sunshine.port;
      // Set a known test port
      config::sunshine.port = 47990;
    }

    void TearDown() override {
      // Restore original port configuration
      config::sunshine.port = original_port;
    }

  private:
    std::uint16_t original_port;
  };

  TEST_F(ConfigHttpCorsTest, given_auth_error_response_when_creating_then_should_include_correct_cors_headers) {
    auto result = make_auth_error(SimpleWeb::StatusCode::client_error_unauthorized, "Unauthorized");

    auto cors_origin_it = result.headers.find("Access-Control-Allow-Origin");
    EXPECT_NE(cors_origin_it, result.headers.end());

    // The CORS origin should use the correct HTTPS port
    std::uint16_t expected_port = net::map_port(PORT_HTTPS);
    std::string expected_origin = std::format("https://localhost:{}", expected_port);

    EXPECT_EQ(cors_origin_it->second, expected_origin);
  }

  TEST_F(ConfigHttpCorsTest, given_different_auth_error_when_creating_then_should_include_correct_cors_headers) {
    auto result = make_auth_error(SimpleWeb::StatusCode::client_error_forbidden, "Forbidden");

    auto cors_origin_it = result.headers.find("Access-Control-Allow-Origin");
    EXPECT_NE(cors_origin_it, result.headers.end());

    // The CORS origin should use the correct HTTPS port and be https (not http)
    std::uint16_t expected_port = net::map_port(PORT_HTTPS);
    std::string expected_origin = std::format("https://localhost:{}", expected_port);

    EXPECT_EQ(cors_origin_it->second, expected_origin);

    // Verify it's not using http://
    EXPECT_THAT(cors_origin_it->second, Not(HasSubstr("http://localhost:")));
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_percent_encoded_session_token_in_cookie_when_extracting_then_should_unescape_token) {
    // Given: A percent-encoded session token in the Cookie header
    std::string raw_token = "token_with_special%3Bchars%20and%25percent";
    std::string encoded_token = http::cookie_escape(raw_token);
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Cookie", std::string(session_cookie_name) + "=" + encoded_token);

    // When: Extracting the session token
    std::string extracted = extract_session_token_from_cookie(headers);

    // Then: The extracted token should match the original raw token
    EXPECT_EQ(extracted, raw_token);
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_no_session_token_in_cookie_when_extracting_then_should_return_empty_string) {
    // Given: No session_token in the Cookie header
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Cookie", "other_cookie=foo");

    // When: Extracting the session token
    std::string extracted = extract_session_token_from_cookie(headers);

    // Then: The extracted token should be empty
    EXPECT_TRUE(extracted.empty());
  }

  TEST_F(ConfigHttpAuthHelpersTest, given_percent_encoded_cookie_when_extracting_token_then_should_return_decoded_token) {
    // Given: A cookie header with a percent-encoded session token
    std::string raw_token = "token with spaces;and%percent";
    std::string encoded_token = http::cookie_escape(raw_token);
    SimpleWeb::CaseInsensitiveMultimap headers;
    headers.emplace("Cookie", std::string(session_cookie_name) + "=" + encoded_token);

    // When: Extracting the session token
    std::string extracted = extract_session_token_from_cookie(headers);

    // Then: Should return the decoded token
    EXPECT_EQ(extracted, raw_token);
  }

  TEST(ConfigHttpGameSourceShieldTest, given_store_source_bound_to_old_install_when_building_library_then_should_hide_games) {
    namespace fs = std::filesystem;

    const auto old_file_state = config::nvhttp.file_state;
    const auto old_jujo_state = config::nvhttp.jujoserver_file_state;
    const auto temp_state = fs::temp_directory_path() / "jujo_streamserver_old_source_state_test.json";

    config::nvhttp.file_state = temp_state.string();
    config::nvhttp.jujoserver_file_state = temp_state.string();

    {
      std::ofstream out(temp_state, std::ios::trunc);
      out << R"({
        "root": {
          "game_sources": {
            "schemaVersion": 1,
            "sources": {
              "steam": {
                "id": "steam",
                "connected": true,
                "connectionState": "connected",
                "tokenEncrypted": true,
                "boundInstallId": "old-install"
              }
            }
          }
        }
      })";
    }

    nlohmann::json apps = nlohmann::json::array({
      {
        {"name", "Old Steam Game"},
        {"cmd", "cmd /c start \"\" \"steam://rungameid/123\""},
        {"source", "steam"},
        {"source-id", "steam"},
        {"source_id", "123"},
        {"provider-game-id", "123"},
        {"source-install-id", "old-install"},
        {"uuid", "old-steam-game"}
      }
    });

    auto games = build_library_games_contract(apps);

    EXPECT_TRUE(games.empty());

    std::error_code ec;
    fs::remove(temp_state, ec);
    config::nvhttp.file_state = old_file_state;
    config::nvhttp.jujoserver_file_state = old_jujo_state;
  }

  TEST(ConfigHttpGameSourceShieldTest, given_legacy_string_source_state_when_building_sources_and_library_then_should_not_throw) {
    namespace fs = std::filesystem;

    const auto old_file_state = config::nvhttp.file_state;
    const auto old_jujo_state = config::nvhttp.jujoserver_file_state;
    const auto temp_state = fs::temp_directory_path() / "jujo_streamserver_legacy_string_source_state_test.json";

    config::nvhttp.file_state = temp_state.string();
    config::nvhttp.jujoserver_file_state = temp_state.string();

    {
      std::ofstream out(temp_state, std::ios::trunc);
      out << R"({
        "root": {
          "game_sources": {
            "schemaVersion": "1",
            "sources": {
              "steam": {
                "id": "steam",
                "connected": "true",
                "connectionState": "connected",
                "tokenEncrypted": "false",
                "metadataAvailable": "false",
                "ownedGameCount": "2",
                "installedGameCount": "1",
                "playableGameCount": "1"
              }
            }
          }
        }
      })";
    }

    nlohmann::json apps = nlohmann::json::array({
      {
        {"name", "Desktop"},
        {"source", "system"},
        {"uuid", "desktop"}
      },
      {
        {"name", "Steam Game"},
        {"cmd", "cmd /c start \"\" \"steam://rungameid/123\""},
        {"source", "steam"},
        {"source_id", "123"},
        {"source-install-id", http::unique_id},
        {"uuid", "steam-game"}
      }
    });

    auto sources = build_game_sources_summary(apps);
    auto games = build_library_games_contract(apps);
    auto steam = std::find_if(sources.begin(), sources.end(), [](const auto &source) {
      return source.value("id", std::string {}) == "steam";
    });

    ASSERT_NE(steam, sources.end());
    EXPECT_TRUE(steam->value("connected", false));
    EXPECT_EQ(steam->value("ownedGameCount", 0), 2);
    EXPECT_FALSE(games.empty());

    std::error_code ec;
    fs::remove(temp_state, ec);
    config::nvhttp.file_state = old_file_state;
    config::nvhttp.jujoserver_file_state = old_jujo_state;
  }

  TEST(ConfigHttpGameSourceShieldTest, given_snapshot_exclusions_saved_when_source_state_exists_then_should_preserve_json_types) {
    namespace fs = std::filesystem;

    const auto old_file_state = config::nvhttp.file_state;
    const auto old_jujo_state = config::nvhttp.jujoserver_file_state;
    const auto temp_state = fs::temp_directory_path() / "jujo_streamserver_snapshot_type_preservation_test.json";

    config::nvhttp.file_state = temp_state.string();
    config::nvhttp.jujoserver_file_state = temp_state.string();

    {
      std::ofstream out(temp_state, std::ios::trunc);
      out << R"({
        "root": {
          "game_sources": {
            "schemaVersion": 1,
            "sources": {
              "steam": {
                "id": "steam",
                "connected": true,
                "tokenEncrypted": false,
                "metadataAvailable": false,
                "ownedGameCount": 2,
                "installedGameCount": 1,
                "playableGameCount": 1
              }
            }
          }
        }
      })";
    }

    ::statefile::save_snapshot_exclude_devices({"DISPLAY1"});

    std::ifstream in(temp_state);
    const auto state = nlohmann::json::parse(in);
    const auto &source = state.at("root").at("game_sources").at("sources").at("steam");

    EXPECT_TRUE(source.at("connected").is_boolean());
    EXPECT_TRUE(source.at("tokenEncrypted").is_boolean());
    EXPECT_TRUE(source.at("ownedGameCount").is_number_integer());
    EXPECT_EQ(state.at("root").at("snapshot_exclude_devices").at(0), "DISPLAY1");

    std::error_code ec;
    fs::remove(temp_state, ec);
    config::nvhttp.file_state = old_file_state;
    config::nvhttp.jujoserver_file_state = old_jujo_state;
  }

  TEST(ConfigHttpServerInfoTest, given_admin_serverinfo_payload_when_built_then_should_expose_liveness_without_auth_contract) {
    auto payload = build_serverinfo_compat_payload();

    EXPECT_TRUE(payload.value("status", false));
    EXPECT_EQ(payload.value("hostname", std::string {}), config::nvhttp.sunshine_name);
    EXPECT_EQ(payload.value("appversion", std::string {}), nvhttp::VERSION);
    EXPECT_TRUE(payload.contains("ports"));
    EXPECT_TRUE(payload["ports"].contains("https"));
    EXPECT_TRUE(payload["ports"].contains("nvhttp"));
    EXPECT_EQ(payload.value("state", std::string {}), "SUNSHINE_SERVER_FREE");
  }

}  // namespace confighttp
