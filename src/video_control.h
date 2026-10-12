#pragma once

namespace video {
  // A busy publisher leaves the update pending for the next encoder iteration.
  template<class Mailbox, class Apply>
  void drain_control_events(Mailbox &mailbox, Apply &&apply) {
    while (auto update = mailbox.try_pop()) {
      apply(*update);
    }
  }
}  // namespace video
