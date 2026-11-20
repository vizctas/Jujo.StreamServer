#include "src/config.h"
#include "src/webrtc_ice.h"

#include <gtest/gtest.h>

TEST(WebrtcIceTest, TurnRestCredentialMatchesCoturnScheme) {
  // RFC 2202 HMAC-SHA1 test case 2 ("Jefe" / "what do ya want for nothing?") in base64.
  EXPECT_EQ(webrtc_ice::turn_rest_credential("Jefe", "what do ya want for nothing?"), "7/zfauXrL6LSdBbV8YTfnCWafHk=");
}

TEST(WebrtcIceTest, TurnSkippedWithoutSecretAndExpiryApplied) {
  const auto saved = config::nvhttp;
  config::nvhttp.webrtc_stun_urls = "stun:a.example:3478, ";
  config::nvhttp.webrtc_turn_urls = "turn:r.example:3478,turns:r.example:5349";
  config::nvhttp.webrtc_turn_secret.clear();
  EXPECT_EQ(webrtc_ice::servers().size(), 1u);

  config::nvhttp.webrtc_turn_secret = "s3cret";
  config::nvhttp.webrtc_turn_ttl_seconds = 3600;
  const auto now = std::chrono::system_clock::time_point {std::chrono::seconds {1000}};
  const auto list = webrtc_ice::servers(now);
  ASSERT_EQ(list.size(), 3u);
  EXPECT_EQ(list[1].username, "4600:jujo");
  EXPECT_EQ(list[1].password, webrtc_ice::turn_rest_credential("s3cret", "4600:jujo"));
  EXPECT_EQ(webrtc_ice::to_json(list)[2]["urls"], "turns:r.example:5349");
  EXPECT_FALSE(webrtc_ice::to_json(list)[0].contains("username"));
  config::nvhttp = saved;
}

TEST(WebrtcIceTest, PublicCandidateRewritesHostInRange) {
  const webrtc_ice::port_range_t range {47023, 47026};
  const auto pub = webrtc_ice::public_candidate(
    "candidate:1234 1 udp 2122260223 192.168.3.6 47023 typ host generation 0 ufrag ab network-id 1",
    "190.32.76.233",
    range
  );
  ASSERT_TRUE(pub);
  EXPECT_EQ(*pub, "candidate:p1234 1 udp 1686052607 190.32.76.233 47023 typ srflx raddr 192.168.3.6 rport 47023 generation 0 ufrag ab network-id 1");

  const auto tcp = webrtc_ice::public_candidate("candidate:9 1 tcp 1518280447 192.168.3.6 47024 typ host tcptype passive generation 0", "190.32.76.233", range);
  ASSERT_TRUE(tcp);
  EXPECT_NE(tcp->find("typ srflx raddr 192.168.3.6 rport 47024 tcptype passive"), std::string::npos);
}

TEST(WebrtcIceTest, PublicCandidateSkipsOutOfScope) {
  const webrtc_ice::port_range_t range {47023, 47026};
  const auto host = "candidate:1 1 udp 2122260223 192.168.3.6 47023 typ host generation 0";
  EXPECT_FALSE(webrtc_ice::public_candidate(host, "", range));
  EXPECT_FALSE(webrtc_ice::public_candidate(host, "190.32.76.233", {}));
  EXPECT_FALSE(webrtc_ice::public_candidate("candidate:1 1 udp 2122260223 192.168.3.6 51000 typ host", "190.32.76.233", range));
  EXPECT_FALSE(webrtc_ice::public_candidate("candidate:1 1 udp 1686052607 190.32.76.233 47023 typ srflx raddr 192.168.3.6 rport 47023", "190.32.76.233", range));
  EXPECT_FALSE(webrtc_ice::public_candidate("candidate:1 1 udp 2122260223 fe80::1 47023 typ host", "190.32.76.233", range));
}
