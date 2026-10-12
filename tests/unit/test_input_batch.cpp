#include <array>
#include <cstring>
#include <gtest/gtest.h>

#include "src/input_batch.h"
#include "src/utility.h"

extern "C" {
#include <moonlight-common-c/src/Limelight.h>
}

namespace {
  template<class Dest, class Src>
  input::batch_result_e combine(Dest &dest, Src &src) {
    return input::batch(reinterpret_cast<PNV_INPUT_HEADER>(&dest), reinterpret_cast<PNV_INPUT_HEADER>(&src));
  }

  NV_REL_MOUSE_MOVE_PACKET motion(short x, short y) {
    NV_REL_MOUSE_MOVE_PACKET packet {};
    packet.header.magic = util::endian::little<std::uint32_t>(MOUSE_MOVE_REL_MAGIC_GEN5);
    packet.deltaX = util::endian::big(x);
    packet.deltaY = util::endian::big(y);
    return packet;
  }

  NV_SCROLL_PACKET scroll(short amount) {
    NV_SCROLL_PACKET packet {};
    packet.header.magic = util::endian::little<std::uint32_t>(SCROLL_MAGIC_GEN5);
    packet.scrollAmt1 = packet.scrollAmt2 = util::endian::big(amount);
    return packet;
  }

  template<class Packet>
  std::vector<std::uint8_t> bytes(const Packet &packet) {
    std::vector<std::uint8_t> result(sizeof(packet));
    std::memcpy(result.data(), &packet, sizeof(packet));
    return result;
  }

  template<class Packet>
  Packet read(const std::vector<std::uint8_t> &data) {
    Packet result {};
    std::memcpy(&result, data.data(), sizeof(result));
    return result;
  }
}  // namespace

TEST(InputBatch, AddsSignedMotionWithoutChangingSource) {
  auto dest = motion(120, -400);
  auto src = motion(-20, 100);
  auto original = src;
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
  EXPECT_EQ(util::endian::big(dest.deltaX), 100);
  EXPECT_EQ(util::endian::big(dest.deltaY), -300);
  EXPECT_EQ(std::memcmp(&src, &original, sizeof(src)), 0);
}

TEST(InputBatch, AllowsExactSignedBoundsAndZero) {
  auto dest = motion(32766, -32767);
  auto src = motion(1, -1);
  ASSERT_EQ(combine(dest, src), input::batch_result_e::batched);
  EXPECT_EQ(util::endian::big(dest.deltaX), 32767);
  EXPECT_EQ(util::endian::big(dest.deltaY), -32768);
  src = motion(0, 0);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
}

TEST(InputBatch, OverflowOnEitherAxisNeverPartiallyMutatesPacket) {
  for (const auto &values : std::array<std::array<short, 4>, 5> {{
         {32767, 10, 1, 20}, {10, -32768, 20, -1},
         {32767, -32768, 1, -1}, {-32768, 32767, -1, 1}, {10, 32767, 20, 1}}}) {
    auto dest = motion(values[0], values[1]);
    auto src = motion(values[2], values[3]);
    auto original = dest;
    EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
    EXPECT_EQ(std::memcmp(&dest, &original, sizeof(dest)), 0);
  }
}

TEST(InputBatch, VerticalScrollPreservesDuplicateFieldsAndRejectsOverflow) {
  auto dest = scroll(-120);
  auto src = scroll(240);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
  EXPECT_EQ(util::endian::big(dest.scrollAmt1), 120);
  EXPECT_EQ(dest.scrollAmt1, dest.scrollAmt2);
  for (auto [amount, delta] : {std::pair<short, short> {32767, 1}, {-32768, -1}}) {
    dest = scroll(amount);
    src = scroll(delta);
    auto original = dest;
    EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
    EXPECT_EQ(std::memcmp(&dest, &original, sizeof(dest)), 0);
  }
}

TEST(InputBatch, HorizontalScrollPreservesLimitsAndRejectsOverflow) {
  SS_HSCROLL_PACKET dest {}, src {};
  dest.header.magic = src.header.magic = util::endian::little<std::uint32_t>(SS_HSCROLL_MAGIC);
  for (auto [amount, delta] : {std::pair<short, short> {32760, 7}, {-32761, -7}}) {
    dest.scrollAmount = util::endian::big(amount);
    src.scrollAmount = util::endian::big(delta);
    EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
    EXPECT_EQ(util::endian::big(dest.scrollAmount), amount + delta);
    auto original = dest;
    src.scrollAmount = util::endian::big<short>(delta > 0 ? 1 : -1);
    EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
    EXPECT_EQ(std::memcmp(&dest, &original, sizeof(dest)), 0);
  }
}

TEST(InputBatch, MouseButtonIsAnOrderingBarrier) {
  auto dest = motion(1, 2);
  NV_MOUSE_BUTTON_PACKET button {};
  button.header.magic = util::endian::little<std::uint32_t>(MOUSE_BUTTON_DOWN_EVENT_MAGIC_GEN5);
  EXPECT_EQ(combine(dest, button), input::batch_result_e::terminate_batch);
  EXPECT_EQ(util::endian::big(dest.deltaX), 1);
}

TEST(InputBatch, AbsoluteMouseKeepsLatestPositionOnlyForSameGeometry) {
  NV_ABS_MOUSE_MOVE_PACKET dest {}, src {};
  dest.header.magic = src.header.magic = util::endian::little<std::uint32_t>(MOUSE_MOVE_ABS_MAGIC);
  dest.width = src.width = util::endian::big<short>(1920);
  dest.height = src.height = util::endian::big<short>(1080);
  src.x = util::endian::big<short>(800);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
  EXPECT_EQ(dest.x, src.x);
  src.width = util::endian::big<short>(1280);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
}

TEST(InputBatch, ControllerKeepsButtonsAndDeviceBoundaries) {
  NV_MULTI_CONTROLLER_PACKET dest {}, src {};
  dest.header.magic = src.header.magic = util::endian::little<std::uint32_t>(MULTI_CONTROLLER_MAGIC_GEN5);
  dest.activeGamepadMask = src.activeGamepadMask = util::endian::little<short>(3);
  src.leftStickX = util::endian::little<short>(1234);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
  EXPECT_EQ(dest.leftStickX, src.leftStickX);
  src.controllerNumber = util::endian::little<short>(1);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::not_batchable);
  src.controllerNumber = 0;
  src.buttonFlags = util::endian::little<short>(A_FLAG);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
  src.buttonFlags = 0;
  src.activeGamepadMask = util::endian::little<short>(1);
  EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
}

TEST(InputBatch, TouchDoesNotCrossReleaseOrPointerBoundaries) {
  SS_TOUCH_PACKET dest {}, src {};
  dest.header.magic = src.header.magic = util::endian::little<std::uint32_t>(SS_TOUCH_MAGIC);
  dest.eventType = src.eventType = LI_TOUCH_EVENT_MOVE;
  EXPECT_EQ(combine(dest, src), input::batch_result_e::batched);
  src.pointerId = 1;
  EXPECT_EQ(combine(dest, src), input::batch_result_e::not_batchable);
  src.pointerId = 0;
  src.eventType = LI_TOUCH_EVENT_UP;
  EXPECT_EQ(combine(dest, src), input::batch_result_e::terminate_batch);
}

TEST(InputBatchQueue, PreservesMotionOnBothSidesOfClick) {
  NV_MOUSE_BUTTON_PACKET down {};
  down.header.magic = util::endian::little<std::uint32_t>(MOUSE_BUTTON_DOWN_EVENT_MAGIC_GEN5);
  auto up = down;
  up.header.magic = util::endian::little<std::uint32_t>(MOUSE_BUTTON_UP_EVENT_MAGIC_GEN5);
  std::list<std::vector<std::uint8_t>> queue {
    bytes(motion(1, 2)), bytes(motion(3, -2)), bytes(down),
    bytes(motion(5, 6)), bytes(up), bytes(motion(7, 8))};
  auto first = read<NV_REL_MOUSE_MOVE_PACKET>(input::take_batch(queue));
  EXPECT_EQ(util::endian::big(first.deltaX), 4);
  EXPECT_EQ(util::endian::big(first.deltaY), 0);
  EXPECT_EQ(input::take_batch(queue), bytes(down));
  EXPECT_EQ(input::take_batch(queue), bytes(motion(5, 6)));
  EXPECT_EQ(input::take_batch(queue), bytes(up));
  EXPECT_EQ(input::take_batch(queue), bytes(motion(7, 8)));
  EXPECT_TRUE(input::take_batch(queue).empty());
}

TEST(InputBatchQueue, OverflowRetainsUnmergedMotionForNextDispatch) {
  std::list<std::vector<std::uint8_t>> queue {
    bytes(motion(32767, -32768)), bytes(motion(1, -1)), bytes(motion(2, -2))};
  EXPECT_EQ(input::take_batch(queue), bytes(motion(32767, -32768)));
  EXPECT_EQ(input::take_batch(queue), bytes(motion(3, -3)));
  EXPECT_TRUE(queue.empty());
}

TEST(InputBatchQueue, HighRateBurstConservesMovementAndReusesFirstStorage) {
  std::list<std::vector<std::uint8_t>> queue;
  for (int i = 0; i < 1000; ++i) {
    queue.push_back(bytes(motion(1, -1)));
  }
  const auto *storage = queue.front().data();
  const auto result = input::take_batch(queue);
  EXPECT_EQ(result.data(), storage);
  auto packet = read<NV_REL_MOUSE_MOVE_PACKET>(result);
  EXPECT_EQ(util::endian::big(packet.deltaX), 1000);
  EXPECT_EQ(util::endian::big(packet.deltaY), -1000);
  EXPECT_TRUE(queue.empty());
}

TEST(InputBatchQueue, InterleavedControllersRetainOtherDeviceState) {
  NV_MULTI_CONTROLLER_PACKET first {}, other {}, latest {};
  first.header.magic = util::endian::little<std::uint32_t>(MULTI_CONTROLLER_MAGIC_GEN5);
  first.activeGamepadMask = util::endian::little<short>(3);
  other = latest = first;
  other.controllerNumber = util::endian::little<short>(1);
  other.leftStickX = util::endian::little<short>(500);
  latest.leftStickX = util::endian::little<short>(1000);
  std::list<std::vector<std::uint8_t>> queue {bytes(first), bytes(other), bytes(latest)};
  EXPECT_EQ(input::take_batch(queue), bytes(latest));
  EXPECT_EQ(input::take_batch(queue), bytes(other));
  EXPECT_TRUE(queue.empty());
}
