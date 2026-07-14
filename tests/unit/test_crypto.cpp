/**
 * @file tests/unit/test_crypto.cpp
 * @brief Tests for stable X.509 certificate fingerprints.
 */

#include "../tests_common.h"

#include <src/crypto.h>

#include <iomanip>
#include <sstream>

namespace {
  std::string openssl_fingerprint(const std::string &certificate_pem) {
    const auto certificate = crypto::x509(certificate_pem);
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int digest_size = 0;
    EXPECT_TRUE(X509_digest(certificate.get(), EVP_sha256(), digest, &digest_size));

    std::ostringstream encoded;
    encoded << std::uppercase << std::hex << std::setfill('0');
    for (unsigned int index = 0; index < digest_size; ++index) {
      encoded << std::setw(2) << static_cast<unsigned int>(digest[index]);
    }
    return encoded.str();
  }
}  // namespace

TEST(CryptoCertificateFingerprint, IgnoresPemLineEndings) {
  const auto credentials = crypto::gen_creds("Jujo.Stream Test", 2048);
  auto crlf_pem = credentials.x509;
  std::string::size_type offset = 0;
  while ((offset = crlf_pem.find('\n', offset)) != std::string::npos) {
    crlf_pem.replace(offset, 1, "\r\n");
    offset += 2;
  }

  const auto lf_fingerprint = crypto::x509_der_fingerprint(credentials.x509);
  const auto crlf_fingerprint = crypto::x509_der_fingerprint(crlf_pem);

  ASSERT_TRUE(lf_fingerprint.has_value());
  ASSERT_TRUE(crlf_fingerprint.has_value());
  EXPECT_EQ(*lf_fingerprint, *crlf_fingerprint);
  EXPECT_EQ(*lf_fingerprint, openssl_fingerprint(credentials.x509));
}

TEST(CryptoCertificateFingerprint, RejectsInvalidPem) {
  EXPECT_FALSE(crypto::x509_der_fingerprint("not a certificate").has_value());
}
