# MiBox 4K 2nd Gen — JUJO Reference

## Device
- **Model:** Xiaomi TV Box S (2nd Gen)
- **Codename:** MiTV-AFKR0 / MDZ-28-AA / jaws

## Specs Relevant to JUJO

| Spec | Value |
|---|---|
| **Chipset** | AMlogic S905X4 |
| **CPU** | Quad-core Cortex-A55 @ 2.0GHz (64-bit) |
| **GPU** | ARM Mali-G31 MP2 |
| **Codecs** | AV1, VP9 Profile-2, H.265, H.264 |
| **HDR** | Dolby Vision, HDR10+ |

## Additional Hardware

| Spec | Value |
|---|---|
| RAM | 2GB DDR3 |
| Storage | 8GB eMMC |
| OS | Google TV (Android 11) |
| Wi-Fi | Dual-band 2.4/5GHz (802.11ac) |
| Bluetooth | 5.2 |
| HDMI | 2.1 (4K@60Hz max) |
| DRM | Widevine L1 |

## JUJO Server Codec Support

The server (Jujo.StreamServer) supports:
- **H.264** — baseline fallback
- **HEVC (H.265)** — preferred for quality/bandwidth
- **AV1** — next-gen, best compression

The MiBox S905X4 hardware decoder handles all three, making it a solid JUJO client device.
