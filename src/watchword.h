/**
 * @file watchword.h
 * @brief Consigna / Watchword pairing — word-based pairing challenge.
 *
 * The server picks K secret words and shows the client N of them (K real plus
 * decoys). The client must select the K secret words IN ORDER. The secret
 * never travels in clear: the ordered words become the OTP passphrase, and the
 * client proves knowledge with hash(challengeId + salt + words), which the
 * existing `otpauth` path already validates.
 *
 * Security rests on three rules, in order of importance:
 *   1. Only one challenge is active at a time.
 *   2. The failure counter survives a rotation — otherwise an attacker just
 *      waits for the words to change and keeps guessing for free.
 *   3. All counting and locking happens here, server-side. A client-side
 *      penalty is ignored by the modified client an attacker would use.
 *
 * See docs/superpowers/specs/2026-08-04-consigna-watchword-pairing-design.md
 */

#pragma once

#include <chrono>
#include <optional>
#include <string>
#include <vector>

namespace watchword {

  /// Default and permitted range for the number of secret words.
  constexpr int DEFAULT_WORD_COUNT = 4;
  constexpr int MIN_WORD_COUNT = 3;
  constexpr int MAX_WORD_COUNT = 6;

  /// Shown words are clamp(3K, 12, 15): never so few that the search space
  /// collapses, never so many that the grid stops being D-pad friendly.
  constexpr int MIN_SHOWN = 12;
  constexpr int MAX_SHOWN = 15;

  constexpr auto DEFAULT_ROUND_DURATION = std::chrono::seconds(30);
  constexpr int MAX_ROUNDS = 3;

  /// A client that has begun selecting keeps its words alive, but only for
  /// this long — the "I started" signal is otherwise an easy way to pin a
  /// challenge open forever.
  constexpr auto MAX_FREEZE_EXTENSION = std::chrono::seconds(60);

  /// Escalating waits. The third failure rotates instead of locking.
  constexpr auto FIRST_FAILURE_LOCK = std::chrono::seconds(3);
  constexpr auto SECOND_FAILURE_LOCK = std::chrono::seconds(10);
  constexpr int FAILURES_BEFORE_ROTATE = 3;

  /// What the caller should tell the user after a submission.
  enum class attempt_e {
    ok,       ///< Correct words in the correct order.
    wrong,    ///< Wrong; `lock_remaining` says how long before retrying.
    locked,   ///< Still inside a penalty wait; nothing was checked.
    rotated,  ///< Wrong, and the words have just been replaced.
    expired,  ///< No live challenge (timed out or rounds exhausted).
  };

  struct attempt_result_t {
    attempt_e result;
    std::chrono::seconds lock_remaining {0};
    int failures {0};
    int round {0};
  };

  /// Snapshot handed to the UIs. `secret` is only ever sent to StreamAdmin.
  struct challenge_t {
    std::string challenge_id;         ///< The OTP pin; not secret.
    std::vector<std::string> secret;  ///< The K words, in order.
    std::vector<std::string> shown;   ///< The N shuffled words.
    int word_count {DEFAULT_WORD_COUNT};  ///< How many to pick. Not a secret.
    int round {1};
    int failures {0};
    std::chrono::seconds remaining {0};
    bool frozen {false};
  };

  /**
   * @brief Starts a challenge, replacing any existing one.
   * @param word_count Secret words; clamped to [MIN_WORD_COUNT, MAX_WORD_COUNT].
   * @param language "es" or "en"; anything else falls back to English.
   * @param device_name Friendly name assigned to the client that pairs.
   * @return The new challenge, or nullopt if the OTP layer refused it.
   */
  std::optional<challenge_t> begin(
    int word_count,
    const std::string &language,
    const std::string &device_name
  );

  /// Current challenge, or nullopt when none is live. Expires rounds lazily.
  std::optional<challenge_t> current();

  /// Words shown to a pairing client. Excludes the secret ordering.
  std::optional<challenge_t> for_client();

  /**
   * @brief Marks the challenge as being answered, pausing rotation.
   *
   * Only the first caller freezes it, and only for MAX_FREEZE_EXTENSION.
   * @param client_id Identifies the caller so later callers cannot re-freeze.
   */
  void freeze(const std::string &client_id);

  /// Records a failed submission and applies the penalty.
  attempt_result_t register_failure();

  /// True while a penalty wait is in effect.
  bool is_locked();

  /// Ends the challenge. Called on success or from StreamAdmin.
  void clear();

}  // namespace watchword
