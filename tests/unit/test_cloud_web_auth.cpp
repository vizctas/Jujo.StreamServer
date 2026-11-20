#include "src/cloud_web_auth.h"

#include <gtest/gtest.h>

namespace {
  // {"aal":"aal2","email":"a@b.c","n":1}
  constexpr const char *kJwt = "eyJhbGciOiJIUzI1NiJ9.eyJhYWwiOiJhYWwyIiwiZW1haWwiOiJhQGIuYyIsIm4iOjF9.sig";
}  // namespace

TEST(CloudWebAuthTest, JwtClaimReadsStringClaims) {
  EXPECT_EQ(cloud_web_auth::jwt_claim(kJwt, "aal"), "aal2");
  EXPECT_EQ(cloud_web_auth::jwt_claim(kJwt, "email"), "a@b.c");
  EXPECT_FALSE(cloud_web_auth::jwt_claim(kJwt, "n"));  // not a string
  EXPECT_FALSE(cloud_web_auth::jwt_claim(kJwt, "missing"));
  EXPECT_FALSE(cloud_web_auth::jwt_claim("not-a-jwt", "aal"));
}

TEST(CloudWebAuthTest, TrustStoreIssuesLooksUpAndExpires) {
  cloud_web_auth::TrustStore store;  // no path: memory only
  const auto t0 = std::chrono::system_clock::now();
  const auto token = store.issue("user-1", "a@b.c", t0);
  ASSERT_EQ(token.size(), 43u);
  EXPECT_EQ(token.find_first_not_of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"), std::string::npos);

  const auto hit = store.lookup(token, t0);
  ASSERT_TRUE(hit);
  EXPECT_EQ(hit->user_id, "user-1");
  EXPECT_EQ(hit->email, "a@b.c");
  EXPECT_FALSE(store.lookup(token + "x", t0));
  EXPECT_FALSE(store.lookup("", t0));
  EXPECT_FALSE(store.lookup(token, t0 + cloud_web_auth::kTrustTtl));

  store.revoke(token);
  EXPECT_FALSE(store.lookup(token, t0));
}
