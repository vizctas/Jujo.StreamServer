# Jujo.StreamServer Release Makefile
# Usage:
#   make build              - Build Release binaries in build-ninja/
#   make package            - Run CPack to generate MSI + bootstrapper
#   make tag VERSION=1.0.37 - Create and push a new version tag
#   make release VERSION=.. - Build, package, tag, and push in one step
#   make commit-binaries    - Copy latest binaries to release repo, commit, and tag
#
# Variables:
#   VERSION               - Semantic version to tag (e.g., 1.0.37). Required for tag/release.
#   RELEASES_DIR          - Path to local Jujo.StreamServer.Releases clone
#                           (default: ../Jujo.StreamServer.Releases)

SHELL = cmd.exe

BUILD_DIR := build-ninja
CPACK_DIR := $(BUILD_DIR)/cpack_artifacts
RELEASES_DIR ?= ../Jujo.StreamServer.Releases
SERVER_RELEASE_ZIP := $(CPACK_DIR)/Jujo.StreamServer-win-x64.zip
SERVER_RELEASE_MANIFEST := $(CPACK_DIR)/server-manifest.json
SERVER_RELEASE_SHA := $(CPACK_DIR)/SHA256SUMS.txt

# Intercept command line argument for Grelease server-{version}
ifeq (Grelease,$(firstword $(MAKECMDGOALS)))
  VERSION_ARG := $(word 2,$(MAKECMDGOALS))
  ifeq ($(VERSION_ARG),)
    LATEST_SERVER_TAG := $(shell git describe --tags --match "server-[0-9]*" --abbrev=0 2>nul)
    ifeq ($(LATEST_SERVER_TAG),)
      LATEST_SERVER_TAG := $(shell git describe --tags --match "v[0-9]*" --abbrev=0 2>nul)
    endif
    ifeq ($(LATEST_SERVER_TAG),)
      VERSION := 1.0.0
    else
      VERSION := $(shell powershell -NoProfile -Command '$$t="$(LATEST_SERVER_TAG)"; if ($$t -match "(?:server-|v)(\d+\.\d+\.)(\d+)") { $$p=[int]$$matches[2]+1; Write-Output ($$matches[1]+$$p.ToString()) } else { Write-Output "1.0.0" }')
    endif
  else
    VERSION := $(patsubst server-%,%,$(VERSION_ARG))
    $(eval $(VERSION_ARG):;@:)
  endif
  TAG := server-$(VERSION)
else
  # Default fallback if standard tag/release is invoked
  ifdef VERSION
    TAG := server-$(VERSION)
  else
    LATEST_SERVER_TAG := $(shell git describe --tags --match "server-[0-9]*" --abbrev=0 2>nul)
    ifeq ($(LATEST_SERVER_TAG),)
      LATEST_SERVER_TAG := $(shell git describe --tags --match "v[0-9]*" --abbrev=0 2>nul)
    endif
    ifeq ($(LATEST_SERVER_TAG),)
      NEXT_VERSION := 1.0.0
    else
      NEXT_VERSION := $(shell powershell -NoProfile -Command '$$t="$(LATEST_SERVER_TAG)"; if ($$t -match "(?:server-|v)(\d+\.\d+\.)(\d+)") { $$p=[int]$$matches[2]+1; Write-Output ($$matches[1]+$$p.ToString()) } else { Write-Output "1.0.0" }')
    endif
    VERSION := $(NEXT_VERSION)
    TAG := server-$(VERSION)
  endif
endif

# Support legacy target vars
NEXT_VERSION := $(VERSION)
LATEST_TAG := $(LATEST_SERVER_TAG)

# Default target
.PHONY: all build package package-zip tag push-tag release clean commit-binaries info help next-version Grelease

all: build

help:
	@echo "Jujo.StreamServer Release Makefile"
	@echo "Targets:"
	@echo "  make build                         Build Release binaries"
	@echo "  make package                       Build installer (MSI + bootstrapper)"
	@echo "  make package-zip                   Build server ZIP payload + manifest"
	@echo "  make tag VERSION=1.0.37            Create version tag and push"
	@echo "  make release VERSION=1.0.37        Full workflow: package + tag + push"
	@echo "  make commit-binaries VERSION=..    Copy artifacts to releases repo, commit, and tag"
	@echo "  make Grelease server-{version}     Automate full release flow (package + tag + commit binaries)"
	@echo "  make info                          Show detected version info"
	@echo "  make next-version                  Suggest next patch version"
	@echo "  make clean                         Remove generated installer artifacts"
	@echo "  make help                          Show this help"

info:
	@echo "Build dir    : $(BUILD_DIR)"
	@echo "CPACK dir    : $(CPACK_DIR)"
	@echo "Latest tag   : $(if $(LATEST_TAG),$(LATEST_TAG),(none))"
	@echo "Next version : $(NEXT_VERSION)"
	@echo "Current SHA  : $(shell git rev-parse --short HEAD)"

# Show the next logical patch version based on the latest tag
next-version:
	@echo "$(NEXT_VERSION)"

# Build Release binaries using the existing Ninja build directory
build:
	cmake -B $(BUILD_DIR) -DTAG=$(TAG)
	cmake --build $(BUILD_DIR) --config Release

# Generate MSI installer and bootstrapper EXE via CPack
package: build
	cpack -B $(CPACK_DIR) --config $(BUILD_DIR)/CPackConfig.cmake
	cmake --build $(BUILD_DIR) --target package_installer --config Release
	@echo "Artifacts generated in $(CPACK_DIR)"

# Generate ZIP payload, server manifest, and SHA file for Admin-managed updates
package-zip: package
	powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package_server_zip.ps1 -Version "$(VERSION)" -CpackDir "$(CPACK_DIR)" -OutputDir "$(CPACK_DIR)"

# Internal: validate VERSION is supplied
check-version:
ifndef VERSION
	$(error VERSION is required. Use: make $@ VERSION=1.0.37)
endif

# Create an annotated Git tag for the current source commit and push it
# (Local builds only — CI workflow removed.)
tag: check-version
	git tag -f -a $(TAG) -m "Release $(TAG)"
	set GIT_TERMINAL_PROMPT=0 && git push origin $(TAG) -f
	@echo "Tag $(TAG) created and pushed."

# Full release workflow: build, package, tag, and push
release: check-version package tag
	@echo "Release $(TAG) complete."

# --- Binary commit workflow ---
# Copies the latest installer artifacts into a local Jujo.StreamServer.Releases
# clone, commits them, tags that repo, and pushes.
# Set RELEASES_DIR if your clone lives somewhere else.
commit-binaries: check-version
	powershell -NoProfile -Command "$$r='$(RELEASES_DIR)'; if (-not (Test-Path $$r)) { Write-Error \"Releases directory $$r does not exist. Clone https://github.com/vizctas/Jujo.StreamServer.Releases alongside or set RELEASES_DIR=\"; exit 1 }; Copy-Item -LiteralPath \"$(CPACK_DIR)/JujoStreamServerSetup.exe\" -Destination \"$$r/JujoStreamServerSetup.exe\" -Force; Copy-Item -LiteralPath \"$(CPACK_DIR)/Jujo.StreamServer.msi\" -Destination \"$$r/Jujo.StreamServer.msi\" -Force; Copy-Item -LiteralPath \"$(SERVER_RELEASE_ZIP)\" -Destination \"$$r/Jujo.StreamServer-win-x64.zip\" -Force; Copy-Item -LiteralPath \"$(SERVER_RELEASE_MANIFEST)\" -Destination \"$$r/server-manifest.json\" -Force; Copy-Item -LiteralPath \"$(SERVER_RELEASE_SHA)\" -Destination \"$$r/SHA256SUMS.txt\" -Force"
	cd "$(RELEASES_DIR)" && git add -A && git commit -m "chore(release): add $(VERSION) binaries" || echo Nothing to commit
	cd "$(RELEASES_DIR)" && git tag -f -a "$(TAG)" -m "Binary release $(TAG)"
	cd "$(RELEASES_DIR)" && set GIT_TERMINAL_PROMPT=0 && git push origin HEAD && git push origin "$(TAG)" -f
	cd "$(RELEASES_DIR)" && gh release create "$(TAG)" JujoStreamServerSetup.exe Jujo.StreamServer.msi Jujo.StreamServer-win-x64.zip server-manifest.json SHA256SUMS.txt --title "$(TAG)" --notes "Release $(TAG)" || gh release upload "$(TAG)" JujoStreamServerSetup.exe Jujo.StreamServer.msi Jujo.StreamServer-win-x64.zip server-manifest.json SHA256SUMS.txt --clobber
	@echo Committed, tagged, and released $(TAG) in $(RELEASES_DIR).

Grelease: check-version package-zip tag commit-binaries
	@echo "Release $(TAG) complete."

# Clean generated package artifacts (keeps the build tree)
clean:
	@if exist $(CPACK_DIR) rmdir /S /Q $(CPACK_DIR)
	@echo "Cleaned $(CPACK_DIR)"
