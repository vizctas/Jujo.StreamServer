#
# Loads the toml++ library giving the priority to the system package first, with a fallback to FetchContent.
#
include_guard(GLOBAL)

find_package(tomlplusplus 3.4 QUIET GLOBAL)
if(NOT tomlplusplus_FOUND)
    message(STATUS "toml++ v3.4.x package not found in the system. Falling back to FetchContent.")
    include(FetchContent)

    if (CMAKE_VERSION VERSION_GREATER_EQUAL "3.24.0")
        cmake_policy(SET CMP0135 NEW)
    endif()
    if (CMAKE_VERSION VERSION_GREATER_EQUAL "3.31.0")
        cmake_policy(SET CMP0174 NEW)
    endif()

    FetchContent_Declare(
            tomlplusplus
            GIT_REPOSITORY https://github.com/marzer/tomlplusplus.git
            GIT_TAG        v3.4.0
            GIT_SHALLOW    TRUE
    )
    FetchContent_MakeAvailable(tomlplusplus)
endif()
