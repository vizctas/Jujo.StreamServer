/**
 * @file tests/tests_main.cpp
 * @brief Entry point definition.
 */
#include "tests_common.h"
#include "tests_environment.h"
#include "tests_events.h"

// Defined in src/main.cpp, which the test binary excludes.
std::chrono::system_clock::time_point server_start_time;

int main(int argc, char **argv) {
  testing::InitGoogleTest(&argc, argv);
  testing::AddGlobalTestEnvironment(new SunshineEnvironment);
  testing::UnitTest::GetInstance()->listeners().Append(new SunshineEventListener);
  return RUN_ALL_TESTS();
}
