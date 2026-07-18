/**
 * @file src/platform/windows/mdns_txt.h
 * @brief DNS-SD TXT contract for the Windows mDNS advertisement.
 */
#pragma once

#include <string_view>

namespace platf::publish::mdns_txt {
  inline constexpr std::wstring_view version_key = L"txtvers";
  inline constexpr std::wstring_view version_value = L"1";
}  // namespace platf::publish::mdns_txt
