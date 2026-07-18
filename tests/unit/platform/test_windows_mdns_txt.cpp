/**
 * @file tests/unit/platform/test_windows_mdns_txt.cpp
 * @brief Tests the platform-independent contract of the Windows DNS-SD TXT record.
 */
#include <gtest/gtest.h>

#include <src/platform/windows/mdns_txt.h>

TEST(WindowsMdnsTxtTest, PublishesVersionWithNonEmptyKey) {
  ASSERT_FALSE(platf::publish::mdns_txt::version_key.empty());
  ASSERT_EQ(platf::publish::mdns_txt::version_key, L"txtvers");
  ASSERT_EQ(platf::publish::mdns_txt::version_value, L"1");
}
