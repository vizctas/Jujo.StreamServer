// Standalone-test stub for src/logging.h (no boost.log dependency).
#pragma once
#include <ostream>

struct null_log_t {
  template<class T>
  null_log_t &operator<<(const T &) {
    return *this;
  }
};
inline null_log_t g_null_log;
#define BOOST_LOG(level) g_null_log
