#ifdef _WIN32
#include <gtest/gtest.h>

#include "tools/display_snapshot_file.h"

#include <fstream>
#include <iterator>

namespace {
  namespace snap = display_snapshot_file;
  namespace fs = std::filesystem;

  class DisplaySnapshotFile: public ::testing::Test {
  protected:
    fs::path dir, target;
    void SetUp() override {
      const auto base = fs::temp_directory_path();
      for (unsigned i = 0; i < 100; ++i) {
        auto path = base / (L"jujo-snapshot-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(i));
        if (fs::create_directory(path)) {
          dir = path;
          target = dir / L"current.json";
          return;
        }
      }
      FAIL() << "Could not create isolated test directory";
    }
    void TearDown() override {
      if (!dir.empty()) {
        fs::remove_all(dir);
      }
    }
    std::string bytes(const fs::path &path) {
      std::ifstream input(path, std::ios::binary);
      return {std::istreambuf_iterator<char>(input), {}};
    }
  };

  TEST_F(DisplaySnapshotFile, CreatesReplacesCopiesAndRotates) {
    ASSERT_TRUE(snap::save(target, "original"));
    ASSERT_TRUE(snap::save(target, "new"));
    EXPECT_EQ(bytes(target), "new");
    const auto history = dir / L"previous.json";
    ASSERT_TRUE(snap::copy(target, history));
    ASSERT_TRUE(snap::save(target, "later"));
    EXPECT_EQ(bytes(history), "new");
    ASSERT_TRUE(snap::publish(target, history));
    EXPECT_EQ(bytes(history), "later");
    EXPECT_FALSE(fs::exists(target));
  }

  TEST_F(DisplaySnapshotFile, DeniedReplacementPreservesBothSnapshots) {
    const auto source = dir / L"candidate.json";
    ASSERT_TRUE(snap::save(target, "valid baseline"));
    ASSERT_TRUE(snap::save(source, "candidate"));
    HANDLE reader = CreateFileW(target.c_str(), GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, OPEN_EXISTING, 0, nullptr);
    ASSERT_NE(reader, INVALID_HANDLE_VALUE);
    EXPECT_FALSE(snap::save(target, "new"));
    EXPECT_FALSE(snap::copy(source, target));
    EXPECT_FALSE(snap::publish(source, target));
    EXPECT_TRUE(CloseHandle(reader));
    EXPECT_EQ(bytes(target), "valid baseline");
    EXPECT_EQ(bytes(source), "candidate");
    EXPECT_EQ(std::distance(fs::directory_iterator(dir), fs::directory_iterator()), 2);
  }

  TEST_F(DisplaySnapshotFile, PartialWriteNeverBecomesCurrent) {
    ASSERT_TRUE(snap::save(target, "valid baseline"));
    EXPECT_FALSE(snap::stage_and_publish(target, [](FILE *file) {
      EXPECT_EQ(std::fwrite("part", 1, 4, file), 4u);
      return false;
    }));
    EXPECT_EQ(bytes(target), "valid baseline");
    EXPECT_EQ(std::distance(fs::directory_iterator(dir), fs::directory_iterator()), 1);
  }
}
#endif
