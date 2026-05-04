# Install script for directory: C:/Users/Jozh/repos/Jujo.StreamServer

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "C:/Program Files (x86)/Vibepollo")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Release")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("C:/Users/Jozh/repos/Jujo.StreamServer/third-party/moonlight-common-c/enet/cmake_install.cmake")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("C:/Users/Jozh/repos/Jujo.StreamServer/third-party/Simple-Web-Server/cmake_install.cmake")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("C:/Users/Jozh/repos/Jujo.StreamServer/third-party/libdisplaydevice/cmake_install.cmake")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("C:/Users/Jozh/repos/Jujo.StreamServer/tools/cmake_install.cmake")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/assets" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/" REGEX "/web$" EXCLUDE)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/Debug/sunshine.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/Release/sunshine.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/MinSizeRel/sunshine.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/RelWithDebInfo/sunshine.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE FILE FILES "C:/msys64/ucrt64/bin/zlib1.dll")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "dxgi" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Debug/dxgi-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Release/dxgi-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/MinSizeRel/dxgi-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/RelWithDebInfo/dxgi-info.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "audio" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Debug/audio-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Release/audio-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/MinSizeRel/audio-info.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/RelWithDebInfo/audio-info.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Debug/playnite-launcher.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Release/playnite-launcher.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/MinSizeRel/playnite-launcher.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/RelWithDebInfo/playnite-launcher.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Debug/sunshine_wgc_capture.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Release/sunshine_wgc_capture.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/MinSizeRel/sunshine_wgc_capture.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/RelWithDebInfo/sunshine_wgc_capture.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Debug/sunshine_display_helper.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/Release/sunshine_display_helper.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/MinSizeRel/sunshine_display_helper.exe")
  elseif(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/tools" TYPE EXECUTABLE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/tools/RelWithDebInfo/sunshine_display_helper.exe")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "application" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/." TYPE FILE FILES "C:/Users/Jozh/repos/Jujo.StreamServer/uninstall.exe")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "sudovda" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/drivers/sudovda" TYPE FILE FILES
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/install.ps1"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/uninstall.bat"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/SudoVDA.inf"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/SudoVDA.dll"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/sudovda.cat"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/sudovda.cer"
    "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/drivers/sudovda/nefconc.exe"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/service/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/migration/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/path/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "autostart" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/autostart/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "firewall" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/firewall/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/scripts" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/misc/gamepad/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/assets" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/windows/assets/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "assets" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/plugins" TYPE DIRECTORY FILES "C:/Users/Jozh/repos/Jujo.StreamServer/plugins/")
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
if(CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "C:/Users/Jozh/repos/Jujo.StreamServer/install_local_manifest.txt"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
if(CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_COMPONENT MATCHES "^[a-zA-Z0-9_.+-]+$")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
  else()
    string(MD5 CMAKE_INST_COMP_HASH "${CMAKE_INSTALL_COMPONENT}")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INST_COMP_HASH}.txt")
    unset(CMAKE_INST_COMP_HASH)
  endif()
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "C:/Users/Jozh/repos/Jujo.StreamServer/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
