/**
 * @file src/httpcommon.cpp
 * @brief Definitions for common HTTP.
 */
#define BOOST_BIND_GLOBAL_PLACEHOLDERS

// standard includes
#include <atomic>
#include <cstdint>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <mutex>
#include <optional>
#include <string>
#include <utility>

// lib includes
#include <boost/asio/ssl/context.hpp>
#include <boost/asio/ssl/context_base.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <curl/curl.h>
#include <Simple-Web-Server/server_http.hpp>
#include <Simple-Web-Server/server_https.hpp>

// local includes
#include "config.h"
#include "crypto.h"
#include "file_handler.h"
#include "httpcommon.h"
#include "logging.h"
#include "network.h"
#include "nvhttp.h"
#include "platform/common.h"
#include "process.h"
#include "rtsp.h"
#include "utility.h"

#ifdef _WIN32
  #include <wincrypt.h>
  #include <Windows.h>
#endif

namespace {
  std::once_flag curl_global_once;
  std::atomic<std::uint64_t> download_temp_sequence {0};

  void ensure_curl_global_init() {
    std::call_once(curl_global_once, []() {
      curl_global_init(CURL_GLOBAL_DEFAULT);
      std::atexit(curl_global_cleanup);
    });
  }

#ifdef _WIN32
  std::once_flag windows_ca_once;
  std::string windows_ca_bundle;
  bool windows_ca_loaded = false;
  std::size_t windows_ca_count = 0;

  void append_pem_chunk(const char *data, DWORD length) {
    if (!data || length == 0) {
      return;
    }
    std::string chunk(data, data + length);
    if (!chunk.empty() && chunk.back() == '\0') {
      chunk.pop_back();
    }
    if (chunk.empty()) {
      return;
    }
    windows_ca_bundle.append(chunk);
    if (!windows_ca_bundle.empty() && windows_ca_bundle.back() != '\n') {
      windows_ca_bundle.push_back('\n');
    }
  }

  bool populate_from_store(DWORD flags) {
    HCERTSTORE store = CertOpenStore(
      CERT_STORE_PROV_SYSTEM_W,
      0,
      static_cast<HCRYPTPROV_LEGACY>(0),
      flags | CERT_STORE_READONLY_FLAG,
      L"ROOT"
    );
    if (!store) {
      BOOST_LOG(error) << "CertOpenStore failed for flags " << flags << " error " << GetLastError();
      return false;
    }

    std::size_t added = 0;
    PCCERT_CONTEXT ctx = nullptr;
    while ((ctx = CertEnumCertificatesInStore(store, ctx)) != nullptr) {
      DWORD out_len = 0;
      if (!CryptBinaryToStringA(ctx->pbCertEncoded, ctx->cbCertEncoded, CRYPT_STRING_BASE64HEADER, nullptr, &out_len)) {
        continue;
      }
      std::string buffer(out_len, '\0');
      if (!CryptBinaryToStringA(ctx->pbCertEncoded, ctx->cbCertEncoded, CRYPT_STRING_BASE64HEADER, buffer.data(), &out_len)) {
        continue;
      }
      append_pem_chunk(buffer.data(), out_len);
      ++added;
    }
    CertCloseStore(store, 0);
    if (added > 0) {
      windows_ca_count += added;
      BOOST_LOG(debug) << "Loaded " << added << " certificates from Windows store flags " << flags;
    }
    return added > 0;
  }

  void load_windows_root_store() {
    windows_ca_bundle.clear();
    windows_ca_count = 0;
    bool loaded_machine = populate_from_store(CERT_SYSTEM_STORE_LOCAL_MACHINE);
    bool loaded_user = populate_from_store(CERT_SYSTEM_STORE_CURRENT_USER);
    windows_ca_loaded = loaded_machine || loaded_user;

    if (windows_ca_loaded) {
      BOOST_LOG(info) << "Loaded " << windows_ca_count << " Windows root certificates (machine="
                      << (loaded_machine ? "yes" : "no") << ", user=" << (loaded_user ? "yes" : "no") << ')';
    } else {
      BOOST_LOG(error) << "Unable to load certificates from any Windows ROOT store. Last error " << GetLastError();
    }
  }

  std::optional<std::string> windows_ca_file_path() {
    static std::once_flag write_once;
    static std::optional<std::string> path;
    std::call_once(write_once, []() {
      if (!windows_ca_loaded) {
        return;
      }
      try {
        auto temp = std::filesystem::temp_directory_path() / "sunshine-ca-bundle.pem";
        std::ofstream out(temp, std::ios::binary | std::ios::trunc);
        out.write(windows_ca_bundle.data(), static_cast<std::streamsize>(windows_ca_bundle.size()));
        if (out && out.good()) {
          path = temp.string();
          BOOST_LOG(debug) << "Persisted Windows CA bundle to " << *path;
        }
      } catch (const std::exception &ex) {
        BOOST_LOG(error) << "Failed to persist Windows CA bundle: " << ex.what();
      }
    });
    return path;
  }
#endif

  bool apply_default_ca_store(CURL *curl) {
    if (!curl) {
      return false;
    }
#if defined(_WIN32)
    std::call_once(windows_ca_once, load_windows_root_store);

  #if defined(CURLOPT_SSL_OPTIONS) && defined(CURLSSLOPT_NATIVE_CA)
    CURLcode native_res = curl_easy_setopt(curl, CURLOPT_SSL_OPTIONS, CURLSSLOPT_NATIVE_CA);
    if (native_res == CURLE_OK) {
      return true;
    }
  #endif

    if (!windows_ca_loaded) {
      BOOST_LOG(warning) << "Windows root certificate bundle not available for HTTPS requests";
      return false;
    }

  #if defined(CURLOPT_CAINFO_BLOB)
    curl_blob blob;
    blob.data = const_cast<char *>(windows_ca_bundle.data());
    blob.len = windows_ca_bundle.size();
    blob.flags = CURL_BLOB_COPY;
    CURLcode blob_res = curl_easy_setopt(curl, CURLOPT_CAINFO_BLOB, &blob);
    if (blob_res == CURLE_OK) {
      return true;
    }
    BOOST_LOG(error) << "CURLOPT_CAINFO_BLOB failed, code " << blob_res;
  #endif

    if (auto file_path = windows_ca_file_path()) {
      CURLcode file_res = curl_easy_setopt(curl, CURLOPT_CAINFO, file_path->c_str());
      if (file_res == CURLE_OK) {
        return true;
      }
      BOOST_LOG(error) << "CURLOPT_CAINFO failed for " << *file_path << ", code " << file_res;
    }
    BOOST_LOG(error) << "Failed to supply CA bundle to libcurl for HTTPS";
    return false;
#else
    (void) curl;
    return true;
#endif
  }
}  // namespace

namespace http {
  using namespace std::literals;
  namespace fs = std::filesystem;
  namespace pt = boost::property_tree;

  int reload_user_creds(const std::string &file);
  bool user_creds_exist(const std::string &file);

  std::string unique_id;
  uuid_util::uuid_t uuid;
  net::net_e origin_web_ui_allowed;

#ifdef _WIN32
  std::string shared_virtual_display_guid;
#endif

  /**
   * @brief Whether the TLS credentials on disk can actually be loaded.
   *
   * Existence alone is not enough: a truncated, zero-byte or unreadable file
   * (the private key is owner-only, so it becomes unreadable if the service
   * later runs as a different principal) passes an fs::exists check and then
   * throws inside the HTTPS server constructor — on a std::thread, outside any
   * try/catch, terminating the process on every start. Unusable credentials are
   * moved aside so create_creds regenerates them.
   */
  bool tls_creds_usable(const std::string &pkey, const std::string &cert) {
    if (!fs::exists(pkey) || !fs::exists(cert)) {
      return false;
    }

    boost::system::error_code ec;
    boost::asio::ssl::context probe {boost::asio::ssl::context::tls_server};
    probe.use_certificate_chain_file(cert, ec);
    if (!ec) {
      probe.use_private_key_file(pkey, boost::asio::ssl::context::pem, ec);
    }
    if (!ec) {
      return true;
    }

    BOOST_LOG(error) << "TLS credentials are present but unusable ("sv << ec.message()
                     << "). Regenerating."sv;
    std::error_code fs_ec;
    for (const auto &path : {cert, pkey}) {
      fs::rename(path, std::filesystem::path {path}.replace_extension(".unusable"), fs_ec);
      if (fs_ec) {
        BOOST_LOG(warning) << "Couldn't move "sv << path << " aside: "sv << fs_ec.message();
        fs_ec.clear();
      }
    }
    return false;
  }

  int init() {
    ensure_curl_global_init();
    bool clean_slate = config::sunshine.flags[config::flag::FRESH_STATE];
    origin_web_ui_allowed = net::from_enum_string(config::nvhttp.origin_web_ui_allowed);

    if (clean_slate) {
      uuid = uuid_util::uuid_t::generate();
      unique_id = uuid.string();
      auto dir = std::filesystem::temp_directory_path() / "Sunshine"sv;
      config::nvhttp.cert = (dir / ("cert-"s + unique_id)).string();
      config::nvhttp.pkey = (dir / ("pkey-"s + unique_id)).string();
    }

    if (!tls_creds_usable(config::nvhttp.pkey, config::nvhttp.cert) &&
        create_creds(config::nvhttp.pkey, config::nvhttp.cert)) {
      return -1;
    }
    if (!user_creds_exist(config::sunshine.credentials_file)) {
      BOOST_LOG(info) << "Open the Web UI to set your new username and password and getting started";
    } else if (reload_user_creds(config::sunshine.credentials_file)) {
      return -1;
    }
    return 0;
  }

  void refresh_origin_acl() {
    origin_web_ui_allowed = net::from_enum_string(config::nvhttp.origin_web_ui_allowed);
  }

  int save_user_creds(const std::string &file, const std::string &username, const std::string &password, bool run_our_mouth) {
    pt::ptree outputTree;

    if (fs::exists(file)) {
      try {
        pt::read_json(file, outputTree);
      } catch (std::exception &e) {
        BOOST_LOG(error) << "Couldn't read user credentials: "sv << e.what();
        return -1;
      }
    }

    auto salt = crypto::rand_alphabet(16);
    outputTree.put("username", username);
    outputTree.put("salt", salt);
    outputTree.put("password", util::hex(crypto::hash(password + salt)).to_string());
    try {
      pt::write_json(file, outputTree);
    } catch (std::exception &e) {
      BOOST_LOG(error) << "error writing to the credentials file, perhaps try this again as an administrator? Details: "sv << e.what();
      return -1;
    }

    BOOST_LOG(info) << "New credentials have been created"sv;
    return 0;
  }

  bool user_creds_exist(const std::string &file) {
    if (!fs::exists(file)) {
      return false;
    }

    pt::ptree inputTree;
    try {
      pt::read_json(file, inputTree);
      return inputTree.find("username") != inputTree.not_found() &&
             inputTree.find("password") != inputTree.not_found() &&
             inputTree.find("salt") != inputTree.not_found();
    } catch (std::exception &e) {
      BOOST_LOG(error) << "validating user credentials: "sv << e.what();
    }

    return false;
  }

  int reload_user_creds(const std::string &file) {
    if (!fs::exists(file)) {
      return -1;
    }
    pt::ptree inputTree;
    try {
      pt::read_json(file, inputTree);
      config::sunshine.username = inputTree.get<std::string>("username");
      config::sunshine.password = inputTree.get<std::string>("password");
      config::sunshine.salt = inputTree.get<std::string>("salt");
    } catch (std::exception &e) {
      BOOST_LOG(error) << "loading user credentials: "sv << e.what();
      return -1;
    }
    return 0;
  }

  int create_creds(const std::string &pkey, const std::string &cert) {
    fs::path pkey_path = pkey;
    fs::path cert_path = cert;

    auto creds = crypto::gen_creds("Jujo.Stream Host"sv, 2048);

    auto pkey_dir = pkey_path;
    auto cert_dir = cert_path;
    pkey_dir.remove_filename();
    cert_dir.remove_filename();

    std::error_code err_code {};
    fs::create_directories(pkey_dir, err_code);
    if (err_code) {
      BOOST_LOG(error) << "Couldn't create directory ["sv << pkey_dir << "] :"sv << err_code.message();
      return -1;
    }

    fs::create_directories(cert_dir, err_code);
    if (err_code) {
      BOOST_LOG(error) << "Couldn't create directory ["sv << cert_dir << "] :"sv << err_code.message();
      return -1;
    }

    if (file_handler::write_file(pkey.c_str(), creds.pkey)) {
      BOOST_LOG(error) << "Couldn't open ["sv << config::nvhttp.pkey << ']';
      return -1;
    }

    if (file_handler::write_file(cert.c_str(), creds.x509)) {
      BOOST_LOG(error) << "Couldn't open ["sv << config::nvhttp.cert << ']';
      return -1;
    }

    fs::permissions(pkey_path, fs::perms::owner_read | fs::perms::owner_write, fs::perm_options::replace, err_code);

    if (err_code) {
      BOOST_LOG(error) << "Couldn't change permissions of ["sv << config::nvhttp.pkey << "] :"sv << err_code.message();
      return -1;
    }

    fs::permissions(cert_path, fs::perms::owner_read | fs::perms::group_read | fs::perms::others_read | fs::perms::owner_write, fs::perm_options::replace, err_code);

    if (err_code) {
      BOOST_LOG(error) << "Couldn't change permissions of ["sv << config::nvhttp.cert << "] :"sv << err_code.message();
      return -1;
    }

    return 0;
  }

  bool download_file(const std::string &url, const std::string &file, long ssl_version) {
    // sonar complains about weak ssl and tls versions; however sonar cannot detect the fix
    CURL *curl = curl_easy_init();  // NOSONAR
    if (!curl) {
      BOOST_LOG(error) << "Couldn't create CURL instance";
      return false;
    }

    if (std::string file_dir = file_handler::get_parent_directory(file); !file_handler::make_directory(file_dir)) {
      BOOST_LOG(error) << "Couldn't create directory ["sv << file_dir << ']';
      curl_easy_cleanup(curl);
      return false;
    }

    const auto temp_file = file + ".part." + std::to_string(download_temp_sequence.fetch_add(1));
    FILE *fp = fopen(temp_file.c_str(), "wb");
    if (!fp) {
      BOOST_LOG(error) << "Couldn't open temporary download ["sv << temp_file << ']';
      curl_easy_cleanup(curl);
      return false;
    }

    // Perform the download
    curl_easy_setopt(curl, CURLOPT_SSLVERSION, ssl_version);  // NOSONAR
    configure_curl_tls(curl);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, fwrite);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
    curl_easy_setopt(curl, CURLOPT_FAILONERROR, 1L);
    curl_easy_setopt(curl, CURLOPT_MAXFILESIZE_LARGE, static_cast<curl_off_t>(32LL * 1024LL * 1024LL));
    // Artwork downloads can run from an NVHTTPS request handler. Never allow a
    // slow or unreachable CDN to monopolize that listener indefinitely.
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT_MS, 5000L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, 20000L);
    curl_easy_setopt(curl, CURLOPT_LOW_SPEED_LIMIT, 1024L);
    curl_easy_setopt(curl, CURLOPT_LOW_SPEED_TIME, 10L);
    curl_easy_setopt(curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
#ifdef _WIN32
    curl_easy_setopt(curl, CURLOPT_SSL_OPTIONS, CURLSSLOPT_NATIVE_CA);
#endif
    const CURLcode result = curl_easy_perform(curl);
    long response_code = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
    fflush(fp);
    fclose(fp);
    curl_easy_cleanup(curl);

    const bool http_success = response_code >= 200 && response_code < 300;
    std::error_code ec;
    const auto downloaded_size = std::filesystem::file_size(temp_file, ec);
    const bool payload_valid = !ec && downloaded_size > 0 && downloaded_size <= 32ULL * 1024ULL * 1024ULL;
    if (result != CURLE_OK || !http_success || !payload_valid) {
      BOOST_LOG(error) << "Couldn't download ["sv << url << ", curl:" << result
                       << ", HTTP:" << response_code << ", bytes:" << (ec ? 0 : downloaded_size) << ']';
      std::filesystem::remove(temp_file, ec);
      return false;
    }

    // The destination is replaced only after a complete successful transfer.
    // Failed requests therefore cannot poison future cache hits.
    std::filesystem::remove(file, ec);
    ec.clear();
    std::filesystem::rename(temp_file, file, ec);
    if (ec) {
      BOOST_LOG(error) << "Couldn't publish downloaded file ["sv << file << "]: " << ec.message();
      std::filesystem::remove(temp_file, ec);
      return false;
    }
    return true;
  }

  bool configure_curl_tls(CURL *curl) {
    if (!curl) {
      return false;
    }
    ensure_curl_global_init();
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 2L);
    bool applied = apply_default_ca_store(curl);
    if (!applied) {
      BOOST_LOG(warning) << "Proceeding with libcurl default CA configuration";
    }
    return applied;
  }

  std::string url_escape(const std::string &url) {
    char *string = curl_easy_escape(nullptr, url.c_str(), static_cast<int>(url.length()));
    std::string result(string);
    curl_free(string);
    return result;
  }

  std::string url_get_host(const std::string &url) {
    CURLU *curlu = curl_url();
    curl_url_set(curlu, CURLUPART_URL, url.c_str(), static_cast<unsigned int>(url.length()));
    char *host;
    if (curl_url_get(curlu, CURLUPART_HOST, &host, 0) != CURLUE_OK) {
      curl_url_cleanup(curlu);
      return "";
    }
    std::string result(host);
    curl_free(host);
    curl_url_cleanup(curlu);
    return result;
  }

  /**
   * @brief Escape a string for safe cookie usage, percent-encoding unsafe characters.
   * @param value The raw string to escape.
   * @return The escaped string.
   */
  std::string cookie_escape(const std::string &value) {
    char *out = curl_easy_escape(nullptr, value.c_str(), static_cast<int>(value.length()));
    std::string result;
    if (out) {
      result.assign(out);
      curl_free(out);
    }
    return result;
  }

  /**
   * @brief Decode a percent-encoded cookie string.
   * @param value The escaped cookie string.
   * @return The original unescaped string.
   */
  std::string cookie_unescape(const std::string &value) {
    int outlen = 0;
    char *out = curl_easy_unescape(nullptr, value.c_str(), static_cast<int>(value.length()), &outlen);
    std::string result;
    if (out) {
      result.assign(out, outlen);
      curl_free(out);
    }
    return result;
  }

}  // namespace http
