
#include <algorithm>
#include <array>
#include <boost/regex.hpp>
#include <cctype>
#include <chrono>
#include <filesystem>
#include <cstdint>
#include <format>
#include <fstream>
#include <future>
#include <iomanip>
#include <mutex>
#include <numeric>
#include <optional>
#include <set>
#include <sstream>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <boost/algorithm/string.hpp>
#include <boost/asio.hpp>
#include <boost/asio/ssl/context.hpp>
#include <boost/filesystem.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <nlohmann/json.hpp>
#include <Simple-Web-Server/crypto.hpp>
#include <Simple-Web-Server/server_https.hpp>
#include "config.h"
#include "confighttp.h"
#include "confighttp_internal.h"
#include "crypto.h"
#include "file_handler.h"
#include "globals.h"
#include "http_auth.h"
#include "httpcommon.h"
#include "platform/common.h"
#include "logging.h"
#include "network.h"
#include "system_metrics.h"
#include "nvhttp.h"
#include "rtsp.h"
#include "server_rbac.h"
#include "stream.h"
#include "video.h"
#include "webrtc_stream.h"
#include "display_helper_integration.h"
#include "process.h"
#include "state_storage.h"
#include "utility.h"
#include "update.h"
#include "uuid.h"
#include "version_compare.h"


namespace confighttp {
  using enum SimpleWeb::StatusCode;


  void listWebRTCSessions(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    nlohmann::json output;
    output["sessions"] = nlohmann::json::array();
    for (const auto &session : webrtc_stream::list_sessions()) {
      output["sessions"].push_back(webrtc_session_to_json(session));
    }
    send_response(response, output);
  }

  void createWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }

    BOOST_LOG(debug) << "WebRTC: create session request received";

    webrtc_stream::SessionOptions options;
    std::stringstream ss;
    ss << request->content.rdbuf();
    auto body = ss.str();
    if (!body.empty()) {
      if (!check_content_type(response, request, "application/json")) {
        return;
      }
      try {
        nlohmann::json input = nlohmann::json::parse(body);
        if (input.contains("audio")) {
          options.audio = input.at("audio").get<bool>();
        }
        if (input.contains("host_audio")) {
          options.host_audio = input.at("host_audio").get<bool>();
        }
        if (input.contains("video")) {
          options.video = input.at("video").get<bool>();
        }
        if (input.contains("encoded")) {
          options.encoded = input.at("encoded").get<bool>();
        }
        if (input.contains("width")) {
          const int width = input.at("width").get<int>();
          if (width > 0) {
            options.width = width;
          }
        }
        if (input.contains("height")) {
          const int height = input.at("height").get<int>();
          if (height > 0) {
            options.height = height;
          }
        }
        if (input.contains("fps")) {
          const int fps = input.at("fps").get<int>();
          if (fps > 0) {
            options.fps = fps;
          }
        }
        if (input.contains("bitrate_kbps")) {
          options.bitrate_kbps = input.at("bitrate_kbps").get<int>();
        }
        if (input.contains("codec")) {
          options.codec = input.at("codec").get<std::string>();
        }
        if (input.contains("hdr")) {
          options.hdr = input.at("hdr").get<bool>();
        }
        if (input.contains("audio_channels")) {
          options.audio_channels = input.at("audio_channels").get<int>();
        }
        if (input.contains("audio_codec")) {
          std::string requested_audio_codec = input.at("audio_codec").get<std::string>();
          boost::algorithm::to_lower(requested_audio_codec);
          if (requested_audio_codec != "opus") {
            bad_request(response, request, "Unsupported audio codec. WebRTC only supports 'opus'.");
            return;
          }
          options.audio_codec = requested_audio_codec;
        }
        if (input.contains("profile")) {
          options.profile = input.at("profile").get<std::string>();
        }
        if (input.contains("app_id")) {
          options.app_id = input.at("app_id").get<int>();
        }
        if (input.contains("resume")) {
          options.resume = input.at("resume").get<bool>();
        }
        if (input.contains("client_mic")) {
          options.client_mic = input.at("client_mic").get<bool>();
        }
        if (input.contains("aspect_ratio") && !input.at("aspect_ratio").is_null()) {
          auto ar_str = input.at("aspect_ratio").get<std::string>();
          // Validate format: "<W>:<H>" where W and H are positive integers
          const auto colon_pos = ar_str.find(':');
          bool valid = false;
          if (colon_pos != std::string::npos && colon_pos > 0 && colon_pos < ar_str.size() - 1) {
            const auto w_str = ar_str.substr(0, colon_pos);
            const auto h_str = ar_str.substr(colon_pos + 1);
            const bool w_digits = std::all_of(w_str.begin(), w_str.end(), ::isdigit);
            const bool h_digits = std::all_of(h_str.begin(), h_str.end(), ::isdigit);
            if (w_digits && h_digits) {
              const int ar_w = std::stoi(w_str);
              const int ar_h = std::stoi(h_str);
              // Both components positive, ratio in reasonable range [1/4, 4]
              if (ar_w > 0 && ar_h > 0) {
                const float ratio = static_cast<float>(ar_w) / static_cast<float>(ar_h);
                if (ratio >= 0.25f && ratio <= 4.0f) {
                  valid = true;
                  options.aspect_ratio = ar_str;
                }
              }
            }
          }
          if (!valid) {
            bad_request(response, request, "Invalid aspect_ratio: expected format W:H with positive integers and ratio in [1/4, 4]");
            return;
          }
        }
        if (input.contains("video_pacing_mode")) {
          options.video_pacing_mode = input.at("video_pacing_mode").get<std::string>();
        }
        if (input.contains("video_pacing_slack_ms")) {
          options.video_pacing_slack_ms = input.at("video_pacing_slack_ms").get<int>();
        }
        if (input.contains("video_max_frame_age_ms")) {
          options.video_max_frame_age_ms = input.at("video_max_frame_age_ms").get<int>();
        }

        if (options.codec) {
          auto lower = *options.codec;
          boost::algorithm::to_lower(lower);
          if (lower != "h264" && lower != "hevc" && lower != "av1") {
            bad_request(response, request, "Unsupported codec");
            return;
          }
          options.codec = std::move(lower);
        }
        if (options.audio_channels) {
          int channels = *options.audio_channels;
          if (channels != 2 && channels != 6 && channels != 8) {
            bad_request(response, request, "Unsupported audio channel count");
            return;
          }
        }
        if (options.video_pacing_mode) {
          auto lower = *options.video_pacing_mode;
          boost::algorithm::to_lower(lower);
          if (lower == "smooth") {
            lower = "smoothness";
          }
          if (lower != "latency" && lower != "balanced" && lower != "smoothness") {
            bad_request(response, request, "Unsupported video pacing mode");
            return;
          }
          options.video_pacing_mode = std::move(lower);
        }
        if (options.video_pacing_slack_ms) {
          const int slack_ms = *options.video_pacing_slack_ms;
          if (slack_ms < 0 || slack_ms > 10) {
            bad_request(response, request, "video_pacing_slack_ms must be between 0 and 10");
            return;
          }
        }
        if (options.video_max_frame_age_ms) {
          const int max_age_ms = *options.video_max_frame_age_ms;
          if (max_age_ms < 5 || max_age_ms > 250) {
            bad_request(response, request, "video_max_frame_age_ms must be between 5 and 250");
            return;
          }
        }
        if (options.hdr.value_or(false)) {
          if (!options.encoded) {
            bad_request(response, request, "HDR requires encoded video for WebRTC sessions");
            return;
          }
          if (!options.codec || (*options.codec != "hevc" && *options.codec != "av1")) {
            bad_request(response, request, "HDR requires HEVC or AV1 video encoding");
            return;
          }
        }
        if (options.hdr.value_or(false)) {
          if (!options.encoded) {
            bad_request(response, request, "HDR requires encoded video for WebRTC sessions");
            return;
          }
          if (!options.codec || (*options.codec != "hevc" && *options.codec != "av1")) {
            bad_request(response, request, "HDR requires HEVC or AV1 video encoding");
            return;
          }
        }
      } catch (const std::exception &e) {
        bad_request(response, request, e.what());
        return;
      }
    }

    BOOST_LOG(debug) << "WebRTC: creating session";
    if (auto error = webrtc_stream::ensure_capture_started(options)) {
#ifdef _WIN32
      // Lifecycle gap: if capture start fails after a virtual display was created/applied but
      // before a session exists, ensure we don't leave the virtual display behind.
      if (rtsp_stream::session_count() == 0 && !webrtc_stream::has_active_sessions()) {
        (void) platf::virtual_display_cleanup::run(
          "webrtc_session_start_failed",
          config::video.dd.config_revert_on_disconnect
        );
      }
#endif
      bad_request(response, request, error->c_str());
      return;
    }
    auto session = webrtc_stream::create_session(options);
    if (!session) {
      webrtc_stream::shutdown_all_sessions();
      service_unavailable(response, "Shutdown in progress");
      return;
    }
    BOOST_LOG(debug) << "WebRTC: session created id=" << session->id;
    nlohmann::json output;
    output["status"] = true;
    output["session"] = webrtc_session_to_json(*session);
    output["cert_fingerprint"] = webrtc_stream::get_server_cert_fingerprint();
    output["cert_pem"] = webrtc_stream::get_server_cert_pem();
    output["ice_servers"] = load_webrtc_ice_servers();
    send_response(response, output);
  }

  void getWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    auto session = webrtc_stream::get_session(session_id);
    if (!session) {
      bad_request(response, request, "Session not found");
      return;
    }

    nlohmann::json output;
    output["session"] = webrtc_session_to_json(*session);
    send_response(response, output);
  }

  void deleteWebRTCSession(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::admin)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    nlohmann::json output;
    if (webrtc_stream::close_session(session_id)) {
      output["status"] = true;
    } else {
      output["error"] = "Session not found";
    }
    send_response(response, output);
  }

  void postWebRTCOffer(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }
    if (!check_content_type(response, request, "application/json")) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input = nlohmann::json::parse(ss.str());
      auto sdp = input.at("sdp").get<std::string>();
      auto type = input.value("type", "offer");
      nlohmann::json output;
      if (!webrtc_stream::set_remote_offer(session_id, sdp, type)) {
        if (!webrtc_stream::get_session(session_id)) {
          output["error"] = "Session not found";
        } else {
          output["error"] = "Failed to process offer";
        }
        send_response(response, output);
        return;
      }

      std::string answer_sdp;
      std::string answer_type;
      if (webrtc_stream::wait_for_local_answer(session_id, answer_sdp, answer_type, std::chrono::seconds {3})) {
        output["status"] = true;
        output["answer_ready"] = true;
        output["sdp"] = answer_sdp;
        output["type"] = answer_type;
      } else {
        output["status"] = true;
        output["answer_ready"] = false;
        output["sdp"] = nullptr;
        output["type"] = nullptr;
      }
      send_response(response, output);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  void getWebRTCAnswer(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::string answer_sdp;
    std::string answer_type;
    nlohmann::json output;
    if (webrtc_stream::get_local_answer(session_id, answer_sdp, answer_type)) {
      output["status"] = true;
      output["answer_ready"] = true;
      output["sdp"] = answer_sdp;
      output["type"] = answer_type;
    } else {
      output["status"] = false;
      output["error"] = "Answer not ready";
    }
    send_response(response, output);
  }

  void postWebRTCIce(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::operator_)) {
      return;
    }
    if (!check_content_type(response, request, "application/json")) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::stringstream ss;
    ss << request->content.rdbuf();
    try {
      nlohmann::json input = nlohmann::json::parse(ss.str());
      nlohmann::json output;
      constexpr std::size_t kMaxCandidatesPerRequest = 256;
      std::vector<nlohmann::json> candidates;
      if (input.is_array()) {
        candidates.reserve(std::min<std::size_t>(input.size(), kMaxCandidatesPerRequest));
        for (const auto &entry : input) {
          if (candidates.size() >= kMaxCandidatesPerRequest) {
            break;
          }
          candidates.push_back(entry);
        }
      } else if (input.contains("candidates") && input["candidates"].is_array()) {
        const auto &arr = input["candidates"];
        candidates.reserve(std::min<std::size_t>(arr.size(), kMaxCandidatesPerRequest));
        for (const auto &entry : arr) {
          if (candidates.size() >= kMaxCandidatesPerRequest) {
            break;
          }
          candidates.push_back(entry);
        }
      } else {
        candidates.push_back(input);
      }

      bool ok = true;
      for (const auto &entry : candidates) {
        if (!entry.is_object()) {
          continue;
        }
        auto mid = entry.value("sdpMid", "");
        auto mline_index = entry.value("sdpMLineIndex", -1);
        auto candidate = entry.value("candidate", "");
        if (candidate.empty()) {
          continue;
        }
        if (!webrtc_stream::add_ice_candidate(session_id, std::move(mid), mline_index, std::move(candidate))) {
          ok = false;
          break;
        }
      }
      if (ok) {
        output["status"] = true;
      } else {
        output["error"] = "Session not found";
      }
      send_response(response, output);
    } catch (const std::exception &e) {
      bad_request(response, request, e.what());
    }
  }

  void getWebRTCIce(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    std::size_t since = 0;
    auto query = request->parse_query_string();
    auto since_it = query.find("since");
    if (since_it != query.end()) {
      try {
        since = static_cast<std::size_t>(std::stoull(since_it->second));
      } catch (...) {
        bad_request(response, request, "Invalid since parameter");
        return;
      }
    }

    auto candidates = webrtc_stream::get_local_candidates(session_id, since);
    nlohmann::json output;
    output["status"] = true;
    output["candidates"] = nlohmann::json::array();
    std::size_t last_index = since;
    for (const auto &candidate : candidates) {
      nlohmann::json item;
      item["sdpMid"] = candidate.mid;
      item["sdpMLineIndex"] = candidate.mline_index;
      item["candidate"] = candidate.candidate;
      item["index"] = candidate.index;
      output["candidates"].push_back(std::move(item));
      last_index = std::max(last_index, candidate.index);
    }
    output["next_since"] = last_index;
    send_response(response, output);
  }

  void getWebRTCIceStream(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    std::string session_id;
    if (request->path_match.size() > 1) {
      session_id = request->path_match[1];
    }

    if (!webrtc_stream::get_session(session_id)) {
      bad_request(response, request, "Session not found");
      return;
    }

    std::size_t since = 0;
    auto query = request->parse_query_string();
    auto since_it = query.find("since");
    if (since_it != query.end()) {
      try {
        since = static_cast<std::size_t>(std::stoull(since_it->second));
      } catch (...) {
        bad_request(response, request, "Invalid since parameter");
        return;
      }
    }

    std::thread([response, session_id, since]() mutable {
      response->close_connection_after_response = true;

      response->write({{"Content-Type", "text/event-stream"}, {"Cache-Control", "no-cache"}, {"Connection", "keep-alive"}, {"Access-Control-Allow-Origin", get_cors_origin()}});

      std::promise<bool> header_error;
      response->send([&header_error](const SimpleWeb::error_code &ec) {
        header_error.set_value(static_cast<bool>(ec));
      });
      if (header_error.get_future().get()) {
        return;
      }

      auto last_index = since;
      auto last_keepalive = std::chrono::steady_clock::now();

      while (true) {
        auto candidates = webrtc_stream::get_local_candidates(session_id, last_index);
        for (const auto &candidate : candidates) {
          nlohmann::json payload;
          payload["sdpMid"] = candidate.mid;
          payload["sdpMLineIndex"] = candidate.mline_index;
          payload["candidate"] = candidate.candidate;

          *response << "event: candidate\n";
          *response << "id: " << candidate.index << "\n";
          *response << "data: " << payload.dump() << "\n\n";

          std::promise<bool> error;
          response->send([&error](const SimpleWeb::error_code &ec) {
            error.set_value(static_cast<bool>(ec));
          });
          if (error.get_future().get()) {
            return;
          }

          last_index = std::max(last_index, candidate.index);
        }

        auto now = std::chrono::steady_clock::now();
        if (now - last_keepalive > std::chrono::seconds(2)) {
          *response << "event: keepalive\n";
          *response << "data: {}\n\n";
          std::promise<bool> error;
          response->send([&error](const SimpleWeb::error_code &ec) {
            error.set_value(static_cast<bool>(ec));
          });
          if (error.get_future().get()) {
            return;
          }
          last_keepalive = now;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
      }
    }).detach();
  }

  void getWebRTCCert(resp_https_t response, req_https_t request) {
    if (!authorize(response, request, rbac::Role::viewer)) {
      return;
    }

    nlohmann::json output;
    output["cert_fingerprint"] = webrtc_stream::get_server_cert_fingerprint();
    output["cert_pem"] = webrtc_stream::get_server_cert_pem();
    send_response(response, output);
  }

} // namespace confighttp
