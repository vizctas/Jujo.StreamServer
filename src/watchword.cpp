/**
 * @file watchword.cpp
 * @brief Consigna / Watchword pairing implementation.
 */

#include "watchword.h"

#include <algorithm>
#include <cstdint>
#include <cstring>
#include <limits>
#include <mutex>

#include "crypto.h"
#include "logging.h"
#include "nvhttp.h"

using namespace std::literals;

namespace watchword {

  namespace {

    // Word lists. Two or three syllables, concrete nouns, readable across a
    // room, no accents (so they survive any terminal/encoding on the way), and
    // nothing that could offend. Obvious confusable pairs are kept out of the
    // list entirely; near-misses are handled per-challenge by the prefix rule.
    //
    // List size barely affects security — an attacker picks among the shown
    // words, not the whole list — so this is sized for variety between
    // sessions, not for entropy.
    const std::vector<std::string> WORDS_ES = {
      "PERRO", "GATO", "CABALLO", "VACA", "OVEJA", "CERDO", "POLLO", "PATO",
      "AGUILA", "LOBO", "ZORRO", "OSO", "TIGRE", "LEON", "MONO", "RATON",
      "ARDILLA", "CONEJO", "TORTUGA", "RANA", "BALLENA", "DELFIN", "PULPO",
      "ABEJA", "HORMIGA", "MARIPOSA", "CIERVO", "BUHO",
      "BARCO", "TORRE", "LLAVE", "RELOJ", "PLUMA", "LIBRO", "SILLA", "MESA",
      "PLATO", "VASO", "CUCHARA", "OLLA", "HORNO", "PUERTA", "VENTANA",
      "ESCALERA", "PUENTE", "ANCLA", "VELA", "ESPEJO", "PEINE", "BOTON",
      "AGUJA", "MARTILLO", "CLAVO", "CUERDA", "CESTA", "BOLSA", "SOMBRERO",
      "ZAPATO", "GUANTE", "ANILLO", "CORONA", "ESCUDO", "FLECHA", "TAMBOR",
      "FLAUTA", "GUITARRA", "LINTERNA", "BRUJULA",
      "NUBE", "FUEGO", "TIERRA", "VIENTO", "PIEDRA", "ARBOL", "FLOR", "RAIZ",
      "HOJA", "RAMA", "SEMILLA", "BOSQUE", "MONTE", "RIO", "LAGO", "PLAYA",
      "ISLA", "CUEVA", "DESIERTO", "VOLCAN", "NIEVE", "LLUVIA", "TRUENO",
      "ESTRELLA", "LUNA", "PLANETA", "COMETA", "ARENA", "NIEBLA",
      "QUESO", "LECHE", "MIEL", "AZUCAR", "VINO", "FRUTA", "MANZANA",
      "NARANJA", "LIMON", "MELON", "TOMATE", "CEBOLLA", "ARROZ", "HARINA",
      "HUEVO", "GALLETA", "MIGAJA", "CANELA",
      "CORAZON", "SOMBRA", "HUMO", "CHISPA", "NUDO", "FAROL", "MONEDA",
      "JARDIN", "CASTILLO", "MOLINO",
    };

    const std::vector<std::string> WORDS_EN = {
      "HORSE", "SHEEP", "GOOSE", "EAGLE", "WOLF", "BEAR", "TIGER", "MONKEY",
      "SQUIRREL", "RABBIT", "TURTLE", "WHALE", "DOLPHIN", "OCTOPUS", "BEETLE",
      "SPIDER", "BUTTERFLY", "SPARROW", "FALCON", "OTTER",
      "ANCHOR", "TOWER", "BRIDGE", "LADDER", "MIRROR", "CANDLE", "HAMMER",
      "NEEDLE", "BASKET", "POCKET", "HELMET", "GLOVE", "RIBBON", "CROWN",
      "SHIELD", "ARROW", "DRUM", "FLUTE", "GUITAR", "LANTERN", "COMPASS",
      "KETTLE", "SADDLE", "MARBLE", "PUZZLE", "TICKET", "BUTTON", "PILLOW",
      "CLOUD", "THUNDER", "MEADOW", "FOREST", "CANYON", "DESERT", "VOLCANO",
      "GLACIER", "HARBOR", "ISLAND", "JUNGLE", "PRAIRIE", "SUMMIT", "VALLEY",
      "BOULDER", "BLOSSOM", "BRANCH", "PEBBLE", "COMET", "PLANET", "GALAXY",
      "SHADOW", "EMBER", "FROST", "BREEZE",
      "HONEY", "PEPPER", "WALNUT", "PUMPKIN", "MELON", "CHERRY", "GINGER",
      "BISCUIT", "MUFFIN", "NOODLE", "PRETZEL", "VANILLA", "SUGAR", "BUTTER",
      "COPPER", "SILVER", "MARKET", "GARDEN", "CASTLE", "WINDMILL", "CHIMNEY",
      "TROLLEY", "PARCEL", "SIGNAL", "GARLAND", "RIDDLE", "ECHO", "SPIRAL",
      "SANDAL", "BEACON", "HARVEST", "THIMBLE", "SATCHEL", "TRUMPET",
      "COTTAGE", "THICKET", "TIMBER", "QUARRY", "ORCHARD", "CAVERN",
    };

    std::mutex g_mutex;
    bool g_active = false;
    challenge_t g_challenge;
    std::chrono::steady_clock::time_point g_round_started;
    std::chrono::steady_clock::time_point g_locked_until;
    std::string g_frozen_by;
    std::string g_language;
    std::string g_device_name;
    int g_word_count = DEFAULT_WORD_COUNT;

    /// Uniform index in [0, bound) from the OpenSSL CSPRNG, rejection-sampled
    /// so the modulo does not skew the distribution.
    std::size_t rand_index(std::size_t bound) {
      if (bound <= 1) {
        return 0;
      }
      const std::uint32_t limit = std::numeric_limits<std::uint32_t>::max() -
                                  (std::numeric_limits<std::uint32_t>::max() % bound);
      while (true) {
        const auto bytes = crypto::rand(sizeof(std::uint32_t));
        std::uint32_t value = 0;
        std::memcpy(&value, bytes.data(), sizeof(value));
        if (value < limit) {
          return value % bound;
        }
      }
    }

    /// Two words clash when they share a three-letter prefix — the whole point
    /// is that a user reading across the room can tell them apart at a glance.
    bool clashes(const std::string &candidate, const std::vector<std::string> &chosen) {
      for (const auto &word : chosen) {
        if (word == candidate) {
          return true;
        }
        const auto n = std::min<std::size_t>(3, std::min(word.size(), candidate.size()));
        if (word.compare(0, n, candidate, 0, n) == 0) {
          return true;
        }
      }
      return false;
    }

    const std::vector<std::string> &word_list(const std::string &language) {
      return language == "es" ? WORDS_ES : WORDS_EN;
    }

    /// Picks `count` mutually distinguishable words.
    std::vector<std::string> pick_words(const std::string &language, int count) {
      const auto &list = word_list(language);
      std::vector<std::string> chosen;
      chosen.reserve(count);

      // Bounded so a pathological list cannot spin here forever; the prefix
      // rule is a nicety, not a correctness requirement.
      const int max_tries = count * 200;
      for (int tries = 0; tries < max_tries && (int) chosen.size() < count; ++tries) {
        const auto &candidate = list[rand_index(list.size())];
        if (!clashes(candidate, chosen)) {
          chosen.push_back(candidate);
        }
      }

      // Fill any shortfall while still refusing exact duplicates.
      while ((int) chosen.size() < count) {
        const auto &candidate = list[rand_index(list.size())];
        if (std::find(chosen.begin(), chosen.end(), candidate) == chosen.end()) {
          chosen.push_back(candidate);
        }
      }
      return chosen;
    }

    int shown_for(int word_count) {
      return std::clamp(word_count * 3, MIN_SHOWN, MAX_SHOWN);
    }

    std::chrono::seconds round_deadline_remaining() {
      auto elapsed = std::chrono::steady_clock::now() - g_round_started;
      auto budget = DEFAULT_ROUND_DURATION;
      if (!g_frozen_by.empty()) {
        // A client is answering: extend, but never without bound.
        budget += MAX_FREEZE_EXTENSION;
      }
      auto left = budget - std::chrono::duration_cast<std::chrono::seconds>(elapsed);
      return left.count() > 0 ? std::chrono::duration_cast<std::chrono::seconds>(left)
                              : std::chrono::seconds(0);
    }

    /// Builds a fresh word set for the current challenge. Caller holds g_mutex.
    void reroll_words() {
      const auto secret = pick_words(g_language, g_word_count);
      const int shown_count = shown_for(g_word_count);

      auto shown = secret;
      while ((int) shown.size() < shown_count) {
        const auto &list = word_list(g_language);
        const auto &candidate = list[rand_index(list.size())];
        if (!clashes(candidate, shown)) {
          shown.push_back(candidate);
        }
      }

      // Fisher-Yates so the secret words do not sit at the front.
      for (std::size_t i = shown.size(); i > 1; --i) {
        std::swap(shown[i - 1], shown[rand_index(i)]);
      }

      g_challenge.secret = secret;
      g_challenge.shown = std::move(shown);
      g_challenge.word_count = g_word_count;
      g_round_started = std::chrono::steady_clock::now();
      g_frozen_by.clear();

      // The ordered secret is the OTP passphrase; the returned pin is the
      // (non-secret) challenge id.
      std::string passphrase;
      for (const auto &word : secret) {
        if (!passphrase.empty()) {
          passphrase.push_back('-');
        }
        passphrase += word;
      }
      g_challenge.challenge_id = nvhttp::request_otp(passphrase, g_device_name);
    }

    /// Drops the challenge when its round budget or round count runs out.
    /// Caller holds g_mutex.
    void expire_if_due() {
      if (!g_active) {
        return;
      }
      if (round_deadline_remaining().count() > 0) {
        return;
      }
      if (g_challenge.round >= MAX_ROUNDS) {
        BOOST_LOG(info) << "Watchword: challenge expired after "sv << MAX_ROUNDS << " rounds"sv;
        g_active = false;
        g_challenge = {};
        return;
      }
      ++g_challenge.round;
      BOOST_LOG(debug) << "Watchword: round "sv << g_challenge.round << " starting"sv;
      reroll_words();
    }

    challenge_t snapshot() {
      auto copy = g_challenge;
      copy.remaining = round_deadline_remaining();
      copy.frozen = !g_frozen_by.empty();
      return copy;
    }

  }  // namespace

  std::optional<challenge_t> begin(
    int word_count,
    const std::string &language,
    const std::string &device_name
  ) {
    std::lock_guard lg(g_mutex);

    g_word_count = std::clamp(word_count, MIN_WORD_COUNT, MAX_WORD_COUNT);
    g_language = language;
    g_device_name = device_name;

    g_challenge = {};
    g_challenge.round = 1;
    g_challenge.failures = 0;
    g_locked_until = {};
    g_frozen_by.clear();
    reroll_words();

    if (g_challenge.challenge_id.empty()) {
      BOOST_LOG(warning) << "Watchword: OTP layer refused the challenge"sv;
      g_active = false;
      return std::nullopt;
    }

    g_active = true;
    BOOST_LOG(info) << "Watchword: challenge started ("sv << g_word_count
                    << " of "sv << g_challenge.shown.size() << " words)"sv;
    return snapshot();
  }

  std::optional<challenge_t> current() {
    std::lock_guard lg(g_mutex);
    expire_if_due();
    if (!g_active) {
      return std::nullopt;
    }
    return snapshot();
  }

  std::optional<challenge_t> for_client() {
    std::lock_guard lg(g_mutex);
    expire_if_due();
    if (!g_active) {
      return std::nullopt;
    }
    auto copy = snapshot();
    copy.secret.clear();  // never leaves the server
    return copy;
  }

  void freeze(const std::string &client_id) {
    std::lock_guard lg(g_mutex);
    expire_if_due();
    if (!g_active || !g_frozen_by.empty()) {
      return;
    }
    g_frozen_by = client_id.empty() ? "unknown" : client_id;
    BOOST_LOG(debug) << "Watchword: answering started; rotation paused"sv;
  }

  bool is_locked() {
    std::lock_guard lg(g_mutex);
    return std::chrono::steady_clock::now() < g_locked_until;
  }

  attempt_result_t register_failure() {
    std::lock_guard lg(g_mutex);
    expire_if_due();

    if (!g_active) {
      return {attempt_e::expired, {}, 0, 0};
    }

    const auto now = std::chrono::steady_clock::now();
    if (now < g_locked_until) {
      return {
        attempt_e::locked,
        std::chrono::duration_cast<std::chrono::seconds>(g_locked_until - now),
        g_challenge.failures,
        g_challenge.round,
      };
    }

    // Deliberately NOT reset on rotation: an attacker would otherwise wait out
    // a round and resume guessing at zero cost.
    ++g_challenge.failures;

    if (g_challenge.failures % FAILURES_BEFORE_ROTATE == 0) {
      if (g_challenge.round >= MAX_ROUNDS) {
        BOOST_LOG(info) << "Watchword: challenge exhausted after "sv
                        << g_challenge.failures << " failed attempts"sv;
        g_active = false;
        g_challenge = {};
        return {attempt_e::expired, {}, 0, 0};
      }
      ++g_challenge.round;
      reroll_words();
      BOOST_LOG(info) << "Watchword: wrong answer; words rotated (round "sv
                      << g_challenge.round << ")"sv;
      return {attempt_e::rotated, {}, g_challenge.failures, g_challenge.round};
    }

    const auto wait = (g_challenge.failures % FAILURES_BEFORE_ROTATE) == 1
                        ? FIRST_FAILURE_LOCK
                        : SECOND_FAILURE_LOCK;
    g_locked_until = now + wait;
    BOOST_LOG(info) << "Watchword: wrong answer; locked for "sv << wait.count() << "s"sv;
    return {attempt_e::wrong, wait, g_challenge.failures, g_challenge.round};
  }

  void clear() {
    std::lock_guard lg(g_mutex);
    if (g_active) {
      BOOST_LOG(debug) << "Watchword: challenge cleared"sv;
    }
    g_active = false;
    g_challenge = {};
    g_frozen_by.clear();
    g_locked_until = {};
  }

}  // namespace watchword
