#pragma once

#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <mutex>
#include <optional>
#include <vector>

#include <openssl/crypto.h>
#include <openssl/evp.h>
#include <openssl/rand.h>

namespace roaming {

  inline constexpr std::array<std::uint8_t, 4> kMagic {0x0F, 0xFE, 0x52, 0x4D};
  inline constexpr std::uint8_t kProtocolVersion = 1;
  inline constexpr std::size_t kHeaderBytes = 20;
  inline constexpr std::size_t kTagBytes = 16;
  inline constexpr std::size_t kPlaintextBytes = 16;
  inline constexpr std::size_t kPacketBytes = kHeaderBytes + kTagBytes + kPlaintextBytes;  // 52
  inline constexpr std::chrono::milliseconds kChallengeTtl {2000};

  enum class packet_type_e : std::uint8_t {
    probe = 1,
    challenge = 2,
    confirm = 3,
    migrated = 4,
  };

  enum class direction_e : std::uint8_t {
    client_to_host = 1,
    host_to_client = 2,
  };

  namespace detail {
    constexpr std::uint32_t read_u32_le(const std::uint8_t *p) noexcept {
      return static_cast<std::uint32_t>(p[0]) |
             (static_cast<std::uint32_t>(p[1]) << 8) |
             (static_cast<std::uint32_t>(p[2]) << 16) |
             (static_cast<std::uint32_t>(p[3]) << 24);
    }

    constexpr void write_u32_le(std::uint8_t *p, std::uint32_t v) noexcept {
      p[0] = static_cast<std::uint8_t>(v & 0xFFu);
      p[1] = static_cast<std::uint8_t>((v >> 8) & 0xFFu);
      p[2] = static_cast<std::uint8_t>((v >> 16) & 0xFFu);
      p[3] = static_cast<std::uint8_t>((v >> 24) & 0xFFu);
    }

    inline bool aes_128_ecb_block(
      const std::uint8_t key[16],
      const std::uint8_t in[16],
      std::uint8_t out[16]
    ) noexcept {
      EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
      if (!ctx) {
        return false;
      }
      int out_len = 0;
      int final_len = 0;
      const bool ok =
        EVP_EncryptInit_ex(ctx, EVP_aes_128_ecb(), nullptr, key, nullptr) == 1 &&
        EVP_CIPHER_CTX_set_padding(ctx, 0) == 1 &&
        EVP_EncryptUpdate(ctx, out, &out_len, in, 16) == 1 &&
        out_len == 16 &&
        EVP_EncryptFinal_ex(ctx, out + out_len, &final_len) == 1;
      EVP_CIPHER_CTX_free(ctx);
      return ok;
    }

    inline std::array<std::uint8_t, 12> build_nonce(
      packet_type_e type,
      direction_e dir,
      std::uint32_t seq
    ) noexcept {
      std::array<std::uint8_t, 12> iv {};
      iv[0] = static_cast<std::uint8_t>(type);
      iv[1] = static_cast<std::uint8_t>(dir);
      write_u32_le(iv.data() + 4, seq);
      return iv;
    }

    inline bool aes_128_gcm_seal(
      const std::uint8_t key[16],
      const std::uint8_t iv[12],
      const std::uint8_t *aad,
      std::size_t aad_len,
      const std::uint8_t *pt,
      std::size_t pt_len,
      std::uint8_t *tag_out,
      std::uint8_t *ct_out
    ) noexcept {
      EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
      if (!ctx) {
        return false;
      }
      int len = 0;
      int total = 0;
      bool ok =
        EVP_EncryptInit_ex(ctx, EVP_aes_128_gcm(), nullptr, nullptr, nullptr) == 1 &&
        EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, 12, nullptr) == 1 &&
        EVP_EncryptInit_ex(ctx, nullptr, nullptr, key, iv) == 1;
      if (ok && aad && aad_len > 0) {
        ok = EVP_EncryptUpdate(ctx, nullptr, &len, aad, static_cast<int>(aad_len)) == 1;
      }
      if (ok && pt && pt_len > 0) {
        ok = EVP_EncryptUpdate(ctx, ct_out, &len, pt, static_cast<int>(pt_len)) == 1;
        total = len;
      }
      if (ok) {
        ok = EVP_EncryptFinal_ex(ctx, ct_out + total, &len) == 1 &&
             (total + len) == static_cast<int>(pt_len) &&
             EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, static_cast<int>(kTagBytes), tag_out) == 1;
      }
      EVP_CIPHER_CTX_free(ctx);
      return ok;
    }

    inline bool aes_128_gcm_open(
      const std::uint8_t key[16],
      const std::uint8_t iv[12],
      const std::uint8_t *aad,
      std::size_t aad_len,
      const std::uint8_t *ct,
      std::size_t ct_len,
      const std::uint8_t *tag,
      std::uint8_t *pt_out
    ) noexcept {
      EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
      if (!ctx) {
        return false;
      }
      int len = 0;
      int total = 0;
      bool ok =
        EVP_DecryptInit_ex(ctx, EVP_aes_128_gcm(), nullptr, nullptr, nullptr) == 1 &&
        EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, 12, nullptr) == 1 &&
        EVP_DecryptInit_ex(ctx, nullptr, nullptr, key, iv) == 1;
      if (ok && aad && aad_len > 0) {
        ok = EVP_DecryptUpdate(ctx, nullptr, &len, aad, static_cast<int>(aad_len)) == 1;
      }
      if (ok && ct && ct_len > 0) {
        ok = EVP_DecryptUpdate(ctx, pt_out, &len, ct, static_cast<int>(ct_len)) == 1;
        total = len;
      }
      if (ok) {
        ok = EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, static_cast<int>(kTagBytes), const_cast<std::uint8_t *>(tag)) == 1 &&
             EVP_DecryptFinal_ex(ctx, pt_out + total, &len) > 0 &&
             (total + len) == static_cast<int>(ct_len);
      }
      EVP_CIPHER_CTX_free(ctx);
      return ok;
    }
  }  // namespace detail

  [[nodiscard]] inline bool is_roaming_packet(const std::uint8_t *data, std::size_t len) noexcept {
    return data && len == kPacketBytes &&
           data[0] == kMagic[0] && data[1] == kMagic[1] &&
           data[2] == kMagic[2] && data[3] == kMagic[3];
  }

  [[nodiscard]] inline bool derive_roaming_key(
    const std::uint8_t rikey[16],
    std::array<std::uint8_t, 16> &out_key
  ) noexcept {
    static constexpr std::uint8_t label[16] {
      'R', 'L', 'R', 'O', 'A', 'M', '-', 'K', 'E', 'Y', '-', 'v', '1', 0, 0, 0
    };
    return detail::aes_128_ecb_block(rikey, label, out_key.data());
  }

  [[nodiscard]] inline bool derive_session_tag(
    const std::uint8_t rikey[16],
    std::array<std::uint8_t, 8> &out_tag
  ) noexcept {
    static constexpr std::uint8_t label[16] {
      'R', 'L', 'R', 'O', 'A', 'M', '-', 'T', 'A', 'G', '-', 'v', '1', 0, 0, 0
    };
    std::uint8_t block[16] {};
    if (!detail::aes_128_ecb_block(rikey, label, block)) {
      return false;
    }
    std::copy_n(block, 8, out_tag.begin());
    return true;
  }

  [[nodiscard]] inline bool seal_packet(
    const std::array<std::uint8_t, 16> &roaming_key,
    const std::array<std::uint8_t, 8> &session_tag,
    packet_type_e type,
    direction_e dir,
    std::uint32_t seq,
    const std::array<std::uint8_t, kPlaintextBytes> &plaintext,
    std::array<std::uint8_t, kPacketBytes> &packet_out
  ) noexcept {
    std::copy(kMagic.begin(), kMagic.end(), packet_out.begin());
    packet_out[4] = kProtocolVersion;
    packet_out[5] = static_cast<std::uint8_t>(type);
    packet_out[6] = 0;
    packet_out[7] = 0;
    std::copy(session_tag.begin(), session_tag.end(), packet_out.begin() + 8);
    detail::write_u32_le(packet_out.data() + 16, seq);

    const auto nonce = detail::build_nonce(type, dir, seq);
    return detail::aes_128_gcm_seal(
      roaming_key.data(),
      nonce.data(),
      packet_out.data(),
      kHeaderBytes,
      plaintext.data(),
      plaintext.size(),
      packet_out.data() + kHeaderBytes,
      packet_out.data() + kHeaderBytes + kTagBytes
    );
  }

  struct parsed_packet_t {
    packet_type_e type;
    std::array<std::uint8_t, 8> session_tag;
    std::uint32_t seq;
    std::array<std::uint8_t, kPlaintextBytes> plaintext;
  };

  [[nodiscard]] inline std::optional<parsed_packet_t> open_packet(
    const std::array<std::uint8_t, 16> &roaming_key,
    const std::array<std::uint8_t, 8> &expected_tag,
    direction_e expected_dir,
    const std::uint8_t *data,
    std::size_t len
  ) noexcept {
    if (!is_roaming_packet(data, len)) {
      return std::nullopt;
    }
    if (data[4] != kProtocolVersion) {
      return std::nullopt;
    }
    if (CRYPTO_memcmp(data + 8, expected_tag.data(), expected_tag.size()) != 0) {
      return std::nullopt;
    }
    const auto type = static_cast<packet_type_e>(data[5]);
    const auto seq = detail::read_u32_le(data + 16);
    if (seq == 0) {
      return std::nullopt;
    }

    parsed_packet_t parsed {};
    parsed.type = type;
    std::copy_n(data + 8, 8, parsed.session_tag.begin());
    parsed.seq = seq;

    const auto nonce = detail::build_nonce(type, expected_dir, seq);
    if (!detail::aes_128_gcm_open(
          roaming_key.data(),
          nonce.data(),
          data,
          kHeaderBytes,
          data + kHeaderBytes + kTagBytes,
          kPlaintextBytes,
          data + kHeaderBytes,
          parsed.plaintext.data()
        )) {
      return std::nullopt;
    }
    return parsed;
  }

  struct session_state_t {
    bool enabled {false};
    std::array<std::uint8_t, 16> roaming_key {};
    std::array<std::uint8_t, 8> session_tag {};
    std::uint32_t last_rx_seq {0};
    bool has_pending_challenge {false};
    std::array<std::uint8_t, 8> pending_challenge {};
    std::chrono::steady_clock::time_point challenge_expiry {};
    std::mutex mutex;

    bool init_from_rikey(const std::vector<std::uint8_t> &rikey) noexcept {
      if (rikey.size() < 16) {
        enabled = false;
        return false;
      }
      std::array<std::uint8_t, 16> key {};
      std::array<std::uint8_t, 8> tag {};
      if (!derive_roaming_key(rikey.data(), key) || !derive_session_tag(rikey.data(), tag)) {
        enabled = false;
        return false;
      }
      std::lock_guard lg {mutex};
      roaming_key = key;
      session_tag = tag;
      last_rx_seq = 0;
      has_pending_challenge = false;
      enabled = true;
      return true;
    }

    [[nodiscard]] bool matches_tag(const std::uint8_t *data, std::size_t len) noexcept {
      if (!enabled || !is_roaming_packet(data, len)) {
        return false;
      }
      return CRYPTO_memcmp(data + 8, session_tag.data(), session_tag.size()) == 0;
    }
  };

  struct handle_result_t {
    bool handled {false};
    bool migrated {false};
    std::array<std::uint8_t, kPacketBytes> reply {};
    bool has_reply {false};
  };

  [[nodiscard]] inline handle_result_t handle_c2h_packet(
    session_state_t &state,
    const std::uint8_t *data,
    std::size_t len,
    std::chrono::steady_clock::time_point now = std::chrono::steady_clock::now(),
    const std::array<std::uint8_t, 8> *deterministic_challenge = nullptr
  ) noexcept {
    handle_result_t res {};
    if (!is_roaming_packet(data, len)) {
      return res;
    }

    std::lock_guard lg {state.mutex};
    if (!state.enabled) {
      return res;
    }

    const auto parsed = open_packet(
      state.roaming_key,
      state.session_tag,
      direction_e::client_to_host,
      data,
      len
    );
    if (!parsed) {
      return res;
    }

    // Strict replay protection: seq must strictly increase for a session
    if (parsed->seq <= state.last_rx_seq) {
      return res;
    }

    if (parsed->type == packet_type_e::probe) {
      std::array<std::uint8_t, 8> challenge {};
      if (deterministic_challenge) {
        challenge = *deterministic_challenge;
      } else if (RAND_bytes(challenge.data(), static_cast<int>(challenge.size())) != 1) {
        return res;
      }

      state.last_rx_seq = parsed->seq;
      state.pending_challenge = challenge;
      state.has_pending_challenge = true;
      state.challenge_expiry = now + kChallengeTtl;

      std::array<std::uint8_t, kPlaintextBytes> reply_pt {};
      std::copy_n(parsed->plaintext.data(), 8, reply_pt.begin());
      std::copy_n(challenge.data(), 8, reply_pt.begin() + 8);

      res.handled = true;
      res.has_reply = seal_packet(
        state.roaming_key,
        state.session_tag,
        packet_type_e::challenge,
        direction_e::host_to_client,
        parsed->seq,
        reply_pt,
        res.reply
      );
      return res;
    }

    if (parsed->type == packet_type_e::confirm) {
      if (!state.has_pending_challenge || now > state.challenge_expiry) {
        state.has_pending_challenge = false;
        return res;
      }
      if (CRYPTO_memcmp(parsed->plaintext.data(), state.pending_challenge.data(), 8) != 0) {
        return res;
      }

      state.last_rx_seq = parsed->seq;
      state.has_pending_challenge = false;

      std::array<std::uint8_t, kPlaintextBytes> reply_pt {};
      std::copy_n(parsed->plaintext.data(), 8, reply_pt.begin());

      res.handled = true;
      res.migrated = true;
      res.has_reply = seal_packet(
        state.roaming_key,
        state.session_tag,
        packet_type_e::migrated,
        direction_e::host_to_client,
        parsed->seq,
        reply_pt,
        res.reply
      );
      return res;
    }

    return res;
  }

}  // namespace roaming
