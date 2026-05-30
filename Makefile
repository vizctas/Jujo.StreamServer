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

BUILD_DIR := build-ninja
CPACK_DIR := $(BUILD_DIR)/cpack_artifacts
RELEASES_DIR ?= ../Jujo.StreamServer.Releases

# Detect latest tag and suggest next patch version via PowerShell.
# Single quotes protect $$ from sh expansion so PowerShell sees literal $.
LATEST_TAG := $(shell git describe --tags --match "v*" --abbrev=0 2>nul)
ifeq ($(LATEST_TAG),)
  NEXT_VERSION := 1.0.1
else
  NEXT_VERSION := $(shell powershell -NoProfile -Command '$$t="$(LATEST_TAG)"; if ($$t -match "v(\d+\.\d+\.)(\d+)") { $$p=[int]$$matches[2]+1; Write-Output ($$matches[1]+$$p.ToString()) } else { Write-Output "1.0.1" }')
endif

# Default target
.PHONY: all build package tag push-tag release clean commit-binaries info help next-version

all: build

help:
	@echo "Jujo.StreamServer Release Makefile"
	@echo "Targets:"
	@echo "  make build                         Build Release binaries"
	@echo "  make package                       Build installer (MSI + bootstrapper)"
	@echo "  make tag VERSION=1.0.37            Create version tag and push"
	@echo "  make release VERSION=1.0.37        Full workflow: package + tag + push"
	@echo "  make commit-binaries VERSION=..    Copy artifacts to releases repo, commit, and tag"
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
	cmake --build $(BUILD_DIR) --config Release

# Generate MSI installer and bootstrapper EXE via CPack
package: build
	cpack -B $(CPACK_DIR) --config $(BUILD_DIR)/CPackConfig.cmake
	@echo "Artifacts generated in $(CPACK_DIR)"

# Internal: validate VERSION is supplied
check-version:
ifndef VERSION
	$(error VERSION is required. Use: make $@ VERSION=1.0.37)
endif

# Create an annotated Git tag for the current source commit and push it
# Pushing the tag triggers the CI release workflow.
tag: check-version
	git tag -a v$(VERSION) -m "Release $(VERSION)"
	git push origin v$(VERSION)
	@echo "Tag v$(VERSION) created and pushed."

# Full release workflow: build, package, tag, and push
release: check-version package tag
	@echo "Release v$(VERSION) complete."

# --- Binary commit workflow ---
# Copies the latest installer artifacts into a local Jujo.StreamServer.Releases
# clone, commits them, tags that repo, and pushes.
# Set RELEASES_DIR if your clone lives somewhere else.
commit-binaries: check-version
	@if not exist "$(RELEASES_DIR)" ( \
		echo ERROR: Releases directory $(RELEASES_DIR) does not exist. && \
		echo Clone https://github.com/vizctas/Jujo.StreamServer.Releases alongside this repo, && \
		echo or set RELEASES_DIR=path\to\repo && \
		exit /b 1 \
	)
	copy /Y "$(CPACK_DIR)\JujoStreamServerSetup.exe" "$(RELEASES_DIR)\JujoStreamServerSetup.exe"
	copy /Y "$(CPACK_DIR)\Jujo.StreamServer.msi"     "$(RELEASES_DIR)\Jujo.StreamServer.msi"
	cd "$(RELEASES_DIR)" && git add -A && git commit -m "chore(release): add $(VERSION) binaries" || echo Nothing to commit
	cd "$(RELEASES_DIR)" && git tag -a "v$(VERSION)" -m "Binary release v$(VERSION)"
	cd "$(RELEASES_DIR)" && git push origin HEAD && git push origin "v$(VERSION)"
	@echo "Committed and tagged v$(VERSION) in $(RELEASES_DIR)."

# Clean generated package artifacts (keeps the build tree)
clean:
	@if exist $(CPACK_DIR) rmdir /S /Q $(CPACK_DIR)
	@echo "Cleaned $(CPACK_DIR)"
