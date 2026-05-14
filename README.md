# Jujo.Stream Server

## What is Jujo.Stream Server?

Jujo.Stream Server is a remote streaming server for game streaming via the Moonlight protocol. It provides display automation, virtual display management, WebRTC browser streaming, and a Flutter-based management app.

## Key Features

* **Display Setting Automation**
  Multiple safeguards prevent dummy plugs or virtual displays from getting "stuck" when you return to your PC. Resolves common Windows 11 **24H2** display issues and restores your layout after hard crashes, shutdowns, or reboots. The workflow is simplified to a dropdown—just pick the display you want to stream.

* **Windows Graphics Capture in Service Mode**
  Running Windows Graphics Capture (WGC) as a service improves performance and stability. It captures the full frame rate of frame-generated titles, avoids crashes when VRAM is exceeded, and follows Microsoft's recommended capture method. The server auto-switches capture methods on demand, so the login screen and UAC prompts are still captured even when using WGC.

* **Native Virtualized Display**
  Includes SudoVDA with multiple stability improvements. Captures output from any GPU, including those in hybrid laptops, ensuring the virtual screen connects to the correct GPU when needed. Provides simple virtual display options, allowing users to choose between a physical or virtual display. On headless setups, it enables automatically to prevent 503 errors and false encoder detections.

* **WebRTC Browser Streaming**
  Stream straight to your web browser from the `/webrtc` page without installing a separate client. Designed for fast response and smooth audio/video, while still supporting the regular Moonlight-compatible streaming path.

* **Flutter Management App**
  A cross-platform Flutter app for managing server settings, pairing clients, RBAC permissions, and monitoring streams. Supports cloud authentication via Supabase. Now maintained in a [separate repository](https://github.com/vizctas/Jujo.StreamAdmin).

* **RTSS & NVIDIA Control Panel Integration**
  Manages RTSS to apply the correct frame limit and disable V-Sync before streaming, significantly improving frame pacing and smoothness. The applied frame cap matches the client device's requested FPS.

* **Frame-Generated Capture Fixes**
  Includes workarounds so DLSS/FSR frame-generated games are captured at the game's full frame rate without micro-stutter. Requires a high-refresh-rate display (physical or virtual) at **240 Hz**.

* **Lossless Scaling & NVIDIA Smooth Motion**
  Automatically applies optimal Lossless Scaling settings to generate frames for any application. On RTX 40-series and newer GPUs, you can optionally enable **NVIDIA Smooth Motion** for better performance and image quality.

* **API Token Management**
  Access tokens can be tightly scoped—down to specific methods—so external scripts don't need full administrative rights.

* **Session-Based Authentication**
  The sign-in flow supports password managers and includes a "remember me" option to minimize prompts.

## Architecture

- **Server**: C++ daemon (fork of Sunshine) with HTTPS API, RBAC, cloud sync via Supabase
- **App**: Flutter (Riverpod + go_router) management client — [Jujo.StreamAdmin](https://github.com/vizctas/Jujo.StreamAdmin)
- **Cloud**: Supabase for authentication, server profiles, and multi-user sharing

## Related Repositories

- [Jujo.StreamAdmin](https://github.com/vizctas/Jujo.StreamAdmin) — Flutter management app (extracted from this repo)
- [Jujo.StreamServer.Releases](https://github.com/vizctas/Jujo.StreamServer.Releases) — Binary releases and update manifests
- [Jujo.StreamServer.third-party-gpl](https://github.com/vizctas/Jujo.StreamServer.third-party-gpl) — GPL compliance notices and third-party sources
