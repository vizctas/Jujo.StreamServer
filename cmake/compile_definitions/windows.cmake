# windows specific compile definitions

add_compile_definitions(SUNSHINE_PLATFORM="windows")

enable_language(RC)
if(NOT MSVC)
    set(CMAKE_RC_COMPILER windres)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -static")
    # gcc complains about misleading indentation in some mingw includes
    list(APPEND SUNSHINE_COMPILE_OPTIONS -Wno-misleading-indentation)
    # see gcc bug 98723
    add_definitions(-DUSE_BOOST_REGEX)
endif()

# curl
add_definitions(-DCURL_STATICLIB)
include_directories(SYSTEM ${CURL_STATIC_INCLUDE_DIRS})
link_directories(${CURL_STATIC_LIBRARY_DIRS})

# miniupnpc
add_definitions(-DMINIUPNP_STATICLIB)

# extra tools/binaries for audio/display devices
add_subdirectory(tools)  # todo - this is temporary, only tools for Windows are needed, for now

# nvidia
include_directories(SYSTEM "${CMAKE_SOURCE_DIR}/third-party/nvapi-open-source-sdk")
file(GLOB NVPREFS_FILES CONFIGURE_DEPENDS
        "${CMAKE_SOURCE_DIR}/third-party/nvapi-open-source-sdk/*.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/nvprefs/*.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/nvprefs/*.h")

# vigem
include_directories(SYSTEM "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/include")
include_directories(SYSTEM "${CMAKE_SOURCE_DIR}/third-party/sudovda")

# Jujo.Stream Server icon
if(NOT DEFINED PROJECT_ICON_PATH)
    set(PROJECT_ICON_PATH "${CMAKE_SOURCE_DIR}/jujo_stream_server.ico")
endif()

list(APPEND SUNSHINE_DEFINITIONS PROJECT_APP_USER_MODEL_ID="${WINDOWS_APP_USER_MODEL_ID}")

# Create a separate object library for the RC file with minimal includes
# Generate a version header so the RC compiler gets version defines reliably
# (COMPILE_DEFINITIONS on OBJECT libs does not propagate to rc.exe in VS generator)
configure_file(
    "${CMAKE_SOURCE_DIR}/src/platform/windows/version_rc.h.in"
    "${CMAKE_BINARY_DIR}/version_rc.h"
    @ONLY
)
add_library(sunshine_rc_object OBJECT "${CMAKE_SOURCE_DIR}/src/platform/windows/windows.rc")

# Only the build dir is needed — avoids "line too long" errors from deep include trees
set_target_properties(sunshine_rc_object PROPERTIES
    INCLUDE_DIRECTORIES "${CMAKE_BINARY_DIR}"
)

set(PLATFORM_TARGET_FILES
        "${CMAKE_SOURCE_DIR}/src/platform/windows/publish.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/autostart.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/autostart.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/misc.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/misc.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/pipes.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/pipes.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/misc_utils.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/misc_utils.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/process_handler.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/process_handler.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/display_settings_client.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/display_settings_client.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_coordinator.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_coordinator.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_request_helpers.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_request_helpers.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_integration.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_helper_integration.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display_cleanup.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display_cleanup.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/hotkey_manager.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/hotkey_manager.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_ipc.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_ipc.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_protocol.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_protocol.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_sync.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_sync.cpp"
        "${CMAKE_SOURCE_DIR}/src/config_playnite.h"
        "${CMAKE_SOURCE_DIR}/src/config_playnite.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_integration.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/playnite_integration.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/input.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_base.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_ram.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_vram.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/display_wgc.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/audio.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_mic.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_mic.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display_legacy.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/virtual_display_legacy.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/utils.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/utils.cpp"
        "${CMAKE_SOURCE_DIR}/third-party/sudovda/sudovda-ioctl.h"
        "${CMAKE_SOURCE_DIR}/third-party/sudovda/sudovda.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/frame_limiter.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/frame_limiter.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/frame_limiter_nvcp.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/frame_limiter_nvcp.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/lossless_scaling_paths.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/image_convert.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/image_convert.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/rtss_integration.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/rtss_integration.cpp"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/ipc_session.h"
        "${CMAKE_SOURCE_DIR}/src/platform/windows/ipc/ipc_session.cpp"
        "${CMAKE_SOURCE_DIR}/tools/playnite_launcher/focus_utils.cpp"
        "${CMAKE_SOURCE_DIR}/tools/playnite_launcher/lossless_scaling.cpp"
        "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/src/ViGEmClient.cpp"
        "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/include/ViGEm/Client.h"
        "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/include/ViGEm/Common.h"
        "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/include/ViGEm/Util.h"
        "${CMAKE_SOURCE_DIR}/third-party/ViGEmClient/include/ViGEm/km/BusShared.h"
        ${NVPREFS_FILES})

set(OPENSSL_LIBRARIES
        libssl.a
        libcrypto.a)

list(PREPEND PLATFORM_LIBRARIES
        ${CURL_STATIC_LIBRARIES}
        avrt
        d3d11
        D3DCompiler
        dwmapi
        dxgi
        iphlpapi
        ksuser
        wbemuuid
        oleaut32
        libssp.a
        libstdc++.a
        libwinpthread.a
        minhook::minhook
        ntdll
        setupapi
        shlwapi
        shell32
        crypt32
        synchronization.lib
        Windowscodecs
        userenv
        ws2_32
        wsock32
)

if(SUNSHINE_ENABLE_TRAY)
    list(APPEND PLATFORM_TARGET_FILES
            "${CMAKE_SOURCE_DIR}/third-party/tray/src/tray_windows.c")
endif()
