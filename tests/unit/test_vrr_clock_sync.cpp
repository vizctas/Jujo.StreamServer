#include <gtest/gtest.h>

#include "src/vrr_clock_sync.h"

TEST(VrrClockSyncTest, RoundTripsRequestAndReplyWireFormat) {
  const vrr_clock::request_t req {
    vrr_clock::kProtocolVersion,
    17u,
    42'000'123ULL,
  };
  const auto req_wire = vrr_clock::serialize_request(req);
  EXPECT_EQ(req_wire.size(), 16u);
  const auto parsed_req = vrr_clock::parse_request(req_wire.data(), req_wire.size());
  ASSERT_TRUE(parsed_req.has_value());
  EXPECT_EQ(parsed_req->seq, 17u);
  EXPECT_EQ(parsed_req->client_send_us, 42'000'123ULL);

  const vrr_clock::reply_t rep {
    vrr_clock::kProtocolVersion,
    parsed_req->seq,
    parsed_req->client_send_us,
    5'002'100ULL,
    5'002'300ULL,
  };
  const auto rep_wire = vrr_clock::serialize_reply(rep);
  EXPECT_EQ(rep_wire.size(), 32u);
  const auto parsed_rep = vrr_clock::parse_reply(rep_wire.data(), rep_wire.size());
  ASSERT_TRUE(parsed_rep.has_value());
  EXPECT_EQ(parsed_rep->seq, 17u);
  EXPECT_EQ(parsed_rep->host_recv_us, 5'002'100ULL);
  EXPECT_EQ(parsed_rep->host_send_us, 5'002'300ULL);

  // Client receives at 42,004,323 us -> symmetric 2000us RTT, +200us host proc
  const auto sample = vrr_clock::compute_ntp_sample(*parsed_rep, 42'004'323ULL);
  ASSERT_TRUE(sample.has_value());
  EXPECT_EQ(sample->rtt_us, 4000ULL);
  EXPECT_EQ(sample->offset_us, -37'000'023LL);
}

TEST(VrrClockSyncTest, RejectsInvalidVersionOrRuntPayloads) {
  auto bad = vrr_clock::serialize_request({2, 1, 100});
  EXPECT_FALSE(vrr_clock::parse_request(bad.data(), bad.size()).has_value());
  EXPECT_FALSE(vrr_clock::parse_request(bad.data(), 15).has_value());
  EXPECT_FALSE(vrr_clock::compute_ntp_sample({1, 1, 1000, 500, 400}, 1500).has_value());
}

TEST(VrrClockSyncTest, PreservesLargeSignedPositiveAndNegativeClockOffsets) {
  // Host monotonic clock 1e15 us ahead of client clock; 3ms symmetric RTT
  const vrr_clock::reply_t ahead_rep {
    vrr_clock::kProtocolVersion,
    99u,
    10'000ULL,
    1'000'000'011'500ULL,
    1'000'000'011'500ULL,
  };
  const auto ahead = vrr_clock::compute_ntp_sample(ahead_rep, 13'000ULL);
  ASSERT_TRUE(ahead.has_value());
  EXPECT_EQ(ahead->rtt_us, 3000ULL);
  EXPECT_EQ(ahead->offset_us, 1'000'000'000'000LL);
}
