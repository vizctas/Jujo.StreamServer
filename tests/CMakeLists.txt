cmake_minimum_required(VERSION 3.13)
# https://github.com/google/oss-policies-info/blob/main/foundational-cxx-support-matrix.md#foundational-c-support

project(test_sunshine)

include_directories("${CMAKE_SOURCE_DIR}")

enable_testing()

# Add GoogleTest directory to the project
set(GTEST_SOURCE_DIR "${CMAKE_SOURCE_DIR}/third-party/googletest")
set(INSTALL_GTEST OFF)
set(INSTALL_GMOCK OFF)
add_subdirectory("${GTEST_SOURCE_DIR}" "${CMAKE_CURRENT_BINARY_DIR}/googletest")
include_directories("${GTEST_SOURCE_DIR}/googletest/include" "${GTEST_SOURCE_DIR}")

# Keep the pure ABR loss policy independently executable. This avoids linking
# platform capture/driver code to verify a deterministic network contract.
add_executable(test_abr_network_health
        "${CMAKE_SOURCE_DIR}/tests/unit/test_abr_network_health.cpp")
target_include_directories(test_abr_network_health PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_abr_network_health PRIVATE cxx_std_23)
target_link_libraries(test_abr_network_health PRIVATE gtest_main)

# Verify overflow telemetry without linking the platform capture stack.
add_executable(test_bounded_queue
        "${CMAKE_SOURCE_DIR}/tests/unit/test_bounded_queue.cpp")
target_include_directories(test_bounded_queue PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_bounded_queue PRIVATE cxx_std_23)
target_link_libraries(test_bounded_queue PRIVATE gtest_main)
add_test(NAME bounded_queue COMMAND test_bounded_queue)

# Keep send pacing arithmetic independently verifiable from platform drivers.
add_executable(test_stream_pacing "${CMAKE_SOURCE_DIR}/tests/unit/test_stream_pacing.cpp")
target_include_directories(test_stream_pacing PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_stream_pacing PRIVATE cxx_std_23)
target_link_libraries(test_stream_pacing PRIVATE gtest_main)
add_test(NAME stream_pacing COMMAND test_stream_pacing)

add_executable(test_fec_policy "${CMAKE_SOURCE_DIR}/tests/unit/test_fec_policy.cpp")
target_include_directories(test_fec_policy PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_fec_policy PRIVATE cxx_std_23)
target_link_libraries(test_fec_policy PRIVATE gtest_main)
add_test(NAME fec_policy COMMAND test_fec_policy)

add_executable(test_keyframe_loss_policy "${CMAKE_SOURCE_DIR}/tests/unit/test_keyframe_loss_policy.cpp")
target_include_directories(test_keyframe_loss_policy PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_keyframe_loss_policy PRIVATE cxx_std_23)
target_link_libraries(test_keyframe_loss_policy PRIVATE gtest_main)
add_test(NAME keyframe_loss_policy COMMAND test_keyframe_loss_policy)

add_executable(test_vrr_capture_pacing "${CMAKE_SOURCE_DIR}/tests/unit/test_vrr_capture_pacing.cpp")
target_include_directories(test_vrr_capture_pacing PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_vrr_capture_pacing PRIVATE cxx_std_23)
target_link_libraries(test_vrr_capture_pacing PRIVATE gtest_main)
add_test(NAME vrr_capture_pacing COMMAND test_vrr_capture_pacing)

add_executable(test_slice_delivery_policy "${CMAKE_SOURCE_DIR}/tests/unit/test_slice_delivery_policy.cpp")
target_include_directories(test_slice_delivery_policy PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_slice_delivery_policy PRIVATE cxx_std_23)
target_link_libraries(test_slice_delivery_policy PRIVATE gtest_main)
add_test(NAME slice_delivery_policy COMMAND test_slice_delivery_policy)

add_executable(test_vrr_clock_sync "${CMAKE_SOURCE_DIR}/tests/unit/test_vrr_clock_sync.cpp")
target_include_directories(test_vrr_clock_sync PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_vrr_clock_sync PRIVATE cxx_std_23)
target_link_libraries(test_vrr_clock_sync PRIVATE gtest_main)
add_test(NAME vrr_clock_sync COMMAND test_vrr_clock_sync)

add_executable(test_roaming_protocol "${CMAKE_SOURCE_DIR}/tests/unit/test_roaming_protocol.cpp")
target_include_directories(test_roaming_protocol PRIVATE "${CMAKE_SOURCE_DIR}" ${OPENSSL_INCLUDE_DIR})
target_compile_features(test_roaming_protocol PRIVATE cxx_std_23)
target_link_libraries(test_roaming_protocol PRIVATE gtest_main ${OPENSSL_LIBRARIES} ${PLATFORM_LIBRARIES})
add_test(NAME roaming_protocol COMMAND test_roaming_protocol)

add_executable(test_nat_traversal
        "${CMAKE_SOURCE_DIR}/tests/unit/test_nat_traversal.cpp"
        "${CMAKE_SOURCE_DIR}/src/nat_traversal.cpp")
target_include_directories(test_nat_traversal PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_nat_traversal PRIVATE cxx_std_23)
target_link_libraries(test_nat_traversal PRIVATE gtest_main ${PLATFORM_LIBRARIES})
add_test(NAME nat_traversal COMMAND test_nat_traversal)

add_executable(test_couch_coop
        "${CMAKE_SOURCE_DIR}/tests/unit/test_couch_coop.cpp"
        "${CMAKE_SOURCE_DIR}/src/couch_coop.cpp")
target_include_directories(test_couch_coop PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_couch_coop PRIVATE cxx_std_23)
target_link_libraries(test_couch_coop PRIVATE gtest_main)
add_test(NAME couch_coop COMMAND test_couch_coop)

add_executable(test_coop_auth "${CMAKE_SOURCE_DIR}/tests/unit/test_coop_auth.cpp")
target_include_directories(test_coop_auth PRIVATE "${CMAKE_SOURCE_DIR}" ${OPENSSL_INCLUDE_DIR})
target_compile_features(test_coop_auth PRIVATE cxx_std_23)
target_link_libraries(test_coop_auth PRIVATE gtest_main nlohmann_json::nlohmann_json ${OPENSSL_LIBRARIES} ${PLATFORM_LIBRARIES})
add_test(NAME coop_auth COMMAND test_coop_auth)

# Keep the aggressive-watchdog policy independently executable without platform capture deps.
add_executable(test_watchdog
        "${CMAKE_SOURCE_DIR}/tests/unit/test_watchdog.cpp"
        "${CMAKE_SOURCE_DIR}/src/watchdog_policy.cpp")
target_include_directories(test_watchdog PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_watchdog PRIVATE cxx_std_23)
target_link_libraries(test_watchdog PRIVATE gtest_main nlohmann_json::nlohmann_json)
add_test(NAME watchdog_policy COMMAND test_watchdog)

# Keep the destructive-process ownership policy independently executable. The
# monolithic test binary also covers it, but it can be blocked by unrelated
# platform test/link regressions while this safety boundary still needs proof.
if (WIN32)
    add_executable(test_game_session_policy
            "${CMAKE_SOURCE_DIR}/tests/unit/test_game_session_orchestrator.cpp"
            "${CMAKE_SOURCE_DIR}/src/platform/windows/game_session_policy.cpp")
    target_include_directories(test_game_session_policy PRIVATE "${CMAKE_SOURCE_DIR}")
    target_compile_features(test_game_session_policy PRIVATE cxx_std_23)
    target_compile_definitions(test_game_session_policy PRIVATE SUNSHINE_TESTS)
    target_link_libraries(test_game_session_policy PRIVATE gtest_main ws2_32)
    add_test(NAME game_session_policy COMMAND test_game_session_policy)

    add_executable(test_cfgmgr32_cloak
            "${CMAKE_SOURCE_DIR}/tests/unit/test_cfgmgr32_cloak.cpp"
            "${CMAKE_SOURCE_DIR}/src/platform/windows/cfgmgr32_cloak.cpp")
    target_include_directories(test_cfgmgr32_cloak PRIVATE "${CMAKE_SOURCE_DIR}")
    target_compile_features(test_cfgmgr32_cloak PRIVATE cxx_std_23)
    target_compile_definitions(test_cfgmgr32_cloak PRIVATE SUNSHINE_TESTS)
    target_link_libraries(test_cfgmgr32_cloak PRIVATE gtest_main setupapi cfgmgr32 advapi32)
    add_test(NAME cfgmgr32_cloak COMMAND test_cfgmgr32_cloak)

    add_executable(test_dualsense_hid
            "${CMAKE_SOURCE_DIR}/tests/unit/test_dualsense_hid.cpp"
            "${CMAKE_SOURCE_DIR}/src/platform/windows/dualsense_hid.cpp"
            "${CMAKE_SOURCE_DIR}/src/platform/windows/usbip_dualsense_backend.cpp")
    target_include_directories(test_dualsense_hid PRIVATE "${CMAKE_SOURCE_DIR}")
    target_compile_features(test_dualsense_hid PRIVATE cxx_std_23)
    target_compile_definitions(test_dualsense_hid PRIVATE SUNSHINE_TESTS)
    target_link_libraries(test_dualsense_hid PRIVATE gtest_main Boost::process setupapi ws2_32)
    add_test(NAME dualsense_hid COMMAND test_dualsense_hid)
endif ()

# Packet batching and WASAPI timing contracts do not need platform devices.
add_executable(test_input_batch
        "${CMAKE_SOURCE_DIR}/tests/unit/test_input_batch.cpp"
        "${CMAKE_SOURCE_DIR}/src/input_batch.cpp")
target_include_directories(test_input_batch PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_input_batch PRIVATE cxx_std_23)
target_link_libraries(test_input_batch PRIVATE gtest_main)
add_test(NAME input_batch COMMAND test_input_batch)

add_executable(test_dsu_server
        "${CMAKE_SOURCE_DIR}/tests/unit/test_dsu_server.cpp"
        "${CMAKE_SOURCE_DIR}/src/dsu_server.cpp")
target_include_directories(test_dsu_server PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_dsu_server PRIVATE cxx_std_23)
target_link_libraries(test_dsu_server PRIVATE gtest_main ${PLATFORM_LIBRARIES})
add_test(NAME dsu_server COMMAND test_dsu_server)

add_executable(test_audio_capture_timing
        "${CMAKE_SOURCE_DIR}/tests/unit/test_audio_capture_timing.cpp")
target_include_directories(test_audio_capture_timing PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_audio_capture_timing PRIVATE cxx_std_23)
target_link_libraries(test_audio_capture_timing PRIVATE gtest_main)
add_test(NAME audio_capture_timing COMMAND test_audio_capture_timing)

add_executable(test_webrtc_input
        "${CMAKE_SOURCE_DIR}/tests/unit/test_webrtc_input.cpp"
        "${CMAKE_SOURCE_DIR}/src/webrtc_input_codec.cpp")
target_include_directories(test_webrtc_input PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_webrtc_input PRIVATE cxx_std_23)
target_link_libraries(test_webrtc_input PRIVATE gtest_main ${SUNSHINE_EXTERNAL_LIBRARIES} ${PLATFORM_LIBRARIES})
add_test(NAME webrtc_input COMMAND test_webrtc_input)

add_executable(test_turbo_input
        "${CMAKE_SOURCE_DIR}/tests/unit/test_turbo_input.cpp"
        "${CMAKE_SOURCE_DIR}/src/turbo_input_server.cpp"
        "${CMAKE_SOURCE_DIR}/src/webrtc_input_codec.cpp")
target_include_directories(test_turbo_input PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_turbo_input PRIVATE cxx_std_23)
target_link_libraries(test_turbo_input PRIVATE gtest_main ${SUNSHINE_EXTERNAL_LIBRARIES} ${PLATFORM_LIBRARIES})
add_test(NAME turbo_input COMMAND test_turbo_input)

# Exercise mailbox concurrency without capture devices or platform services.
add_executable(test_thread_safe "${CMAKE_SOURCE_DIR}/tests/unit/test_thread_safe.cpp")
target_include_directories(test_thread_safe PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_thread_safe PRIVATE cxx_std_23)
target_link_libraries(test_thread_safe PRIVATE gtest_main)
add_test(NAME thread_safe COMMAND test_thread_safe)
set_tests_properties(thread_safe PROPERTIES TIMEOUT 30)

add_executable(test_rtsp_launch_queue "${CMAKE_SOURCE_DIR}/tests/unit/test_rtsp_launch_queue.cpp")
target_include_directories(test_rtsp_launch_queue PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_rtsp_launch_queue PRIVATE cxx_std_23)
target_link_libraries(test_rtsp_launch_queue PRIVATE gtest_main)
add_test(NAME rtsp_launch_queue COMMAND test_rtsp_launch_queue)

# coverage
add_executable(test_pipeline_metrics "${CMAKE_SOURCE_DIR}/tests/unit/test_pipeline_metrics.cpp")
target_include_directories(test_pipeline_metrics PRIVATE "${CMAKE_SOURCE_DIR}")
target_compile_features(test_pipeline_metrics PRIVATE cxx_std_23)
target_link_libraries(test_pipeline_metrics PRIVATE gtest_main)
add_test(NAME pipeline_metrics COMMAND test_pipeline_metrics)

# https://gcovr.com/en/stable/guide/compiling.html#compiler-options
set(CMAKE_CXX_FLAGS "-fprofile-arcs -ftest-coverage -ggdb -O0")
set(CMAKE_C_FLAGS "-fprofile-arcs -ftest-coverage -ggdb -O0")

# if windows
if (WIN32)
    # For Windows: Prevent overriding the parent project's compiler/linker settings
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)  # cmake-lint: disable=C0103
endif ()

# modify SUNSHINE_DEFINITIONS
if (WIN32)
    list(APPEND
            SUNSHINE_DEFINITIONS SUNSHINE_SHADERS_DIR="${CMAKE_SOURCE_DIR}/src_assets/windows/assets/shaders/directx")
elseif (NOT APPLE)
    list(APPEND SUNSHINE_DEFINITIONS SUNSHINE_SHADERS_DIR="${CMAKE_SOURCE_DIR}/src_assets/linux/assets/shaders/opengl")
endif ()

set(TEST_DEFINITIONS)  # list will be appended as needed

# this indicates we're building tests in case sunshine needs to adjust some code or add private tests
list(APPEND TEST_DEFINITIONS SUNSHINE_TESTS)
list(APPEND TEST_DEFINITIONS SUNSHINE_SOURCE_DIR="${CMAKE_SOURCE_DIR}")
list(APPEND TEST_DEFINITIONS SUNSHINE_TEST_BIN_DIR="${CMAKE_CURRENT_BINARY_DIR}")

if(NOT WIN32)
    find_package(Udev 255)  # we need 255+ for udevadm verify
    message(STATUS "UDEV_FOUND: ${UDEV_FOUND}")
    if(UDEV_FOUND)
        list(APPEND TEST_DEFINITIONS UDEVADM_EXECUTABLE="${UDEVADM_EXECUTABLE}")
    endif()
endif()

file(GLOB_RECURSE TEST_SOURCES CONFIGURE_DEPENDS
        ${CMAKE_SOURCE_DIR}/tests/*.h
        ${CMAKE_SOURCE_DIR}/tests/*.cpp)

set(SUNSHINE_SOURCES
        ${SUNSHINE_TARGET_FILES})

# remove main.cpp from the list of sources
list(REMOVE_ITEM SUNSHINE_SOURCES ${CMAKE_SOURCE_DIR}/src/main.cpp)
# Only exercised by its unit test; not part of the server build.
if(WIN32)
    list(APPEND SUNSHINE_SOURCES
            ${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_session_deferral.cpp
            ${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_watchdog.cpp)
endif()

add_executable(${PROJECT_NAME}
        ${TEST_SOURCES}
        ${SUNSHINE_SOURCES})

# Copy files needed for config consistency tests to build directory
# This ensures both CLI and CLion can access the same files relative to the test executable
# Using configure_file ensures files are copied when they change between builds
set(INTEGRATION_TEST_FILES
    "src/config.cpp"
    "docs/configuration.md"
    "src_assets/common/assets/web/public/assets/locale/en.json"
    "src_assets/common/assets/web/configs/tabs/General.vue"
    "src_assets/linux/misc/60-sunshine.rules"
)

foreach(file ${INTEGRATION_TEST_FILES})
    configure_file(
        "${CMAKE_SOURCE_DIR}/${file}"
        "${CMAKE_CURRENT_BINARY_DIR}/${file}"
        COPYONLY
    )
endforeach()

# Copy all locale files for locale consistency tests
# Use a custom command to properly handle both adding and removing files
set(LOCALE_SRC_DIR "${CMAKE_SOURCE_DIR}/src_assets/common/assets/web/public/assets/locale")
set(LOCALE_DST_DIR "${CMAKE_CURRENT_BINARY_DIR}/src_assets/common/assets/web/public/assets/locale")
add_custom_target(sync_locale_files ALL
    COMMAND ${CMAKE_COMMAND} -E rm -rf "${LOCALE_DST_DIR}"
    COMMAND ${CMAKE_COMMAND} -E make_directory "${LOCALE_DST_DIR}"
    COMMAND ${CMAKE_COMMAND} -E copy_directory "${LOCALE_SRC_DIR}" "${LOCALE_DST_DIR}"
    COMMENT "Synchronizing locale files for tests"
    VERBATIM
)

foreach(dep ${SUNSHINE_TARGET_DEPENDENCIES})
    add_dependencies(${PROJECT_NAME} ${dep})  # compile these before sunshine
endforeach()

# Ensure locale files are synchronized before building the test executable
add_dependencies(${PROJECT_NAME} sync_locale_files)

set_target_properties(${PROJECT_NAME} PROPERTIES CXX_STANDARD 23)
target_link_libraries(${PROJECT_NAME}
        ${SUNSHINE_EXTERNAL_LIBRARIES}
        gtest
        gmock
        ${PLATFORM_LIBRARIES})
target_compile_definitions(${PROJECT_NAME} PUBLIC ${SUNSHINE_DEFINITIONS} ${TEST_DEFINITIONS})
target_compile_options(${PROJECT_NAME} PRIVATE $<$<COMPILE_LANGUAGE:CXX>:${SUNSHINE_COMPILE_OPTIONS}>;$<$<COMPILE_LANGUAGE:CUDA>:${SUNSHINE_COMPILE_OPTIONS_CUDA};-std=c++17>)  # cmake-lint: disable=C0301
target_link_options(${PROJECT_NAME} PRIVATE)

if (WIN32)
    # prefer static libraries since we're linking statically
    # this fixes libcurl linking errors when using non MSYS2 version of CMake
    set_target_properties(${PROJECT_NAME} PROPERTIES LINK_SEARCH_START_STATIC 1)
endif ()
