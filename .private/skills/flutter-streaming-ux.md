# Skill: flutter-streaming-ux

## Role
Specialized agent for designing streaming server management UX patterns — pairing flows, stream configuration, telemetry dashboards, and game library experiences.

## Core Directive: Plex-Grade UX for Game Streaming
Act as a Senior Product Designer specializing in media streaming platforms. The experience must feel as polished as Plex, Steam Big Picture, or Apple TV.

## 1. Pairing UX Patterns

### QR Code Pairing (Primary — New)
```
Server generates:
  - One-time pairing token (UUID, 5-min TTL)
  - Connection info (host:port, cert fingerprint)
  - Encoded as QR code displayed on server dashboard

Client scans:
  - Decodes QR → extracts token + connection info
  - POST /api/pair/qr { token, clientName, clientUuid }
  - Server validates token, creates trusted client
  - Both sides confirm with animation
```

### PIN Pairing (Fallback — Existing)
```
Client requests pairing → Server shows 4-digit PIN
User types PIN on server dashboard
Server validates → Client becomes trusted
```

### Deep Link Pairing (Future)
```
Server generates: jujostream://pair?token=xxx&host=192.168.1.x&port=47990
User shares link → Client opens → Auto-pairs
```

## 2. Stream Configuration UX

### Casual Mode (Default)
```
┌─────────────────────────────────────────┐
│  Stream Quality                          │
│                                          │
│  ○ Balanced (recommended)                │
│  ○ Performance (lower latency)           │
│  ○ Quality (higher bitrate)              │
│                                          │
│  Auto-detected: NVENC H.265, 1080p60    │
│  Network: 45 Mbps available              │
│                                          │
│  [Start Streaming]                       │
└─────────────────────────────────────────┘
```

### Advanced Mode (Toggle)
```
┌─────────────────────────────────────────┐
│  Encoder: [NVENC ▾]                      │
│  Codec: [H.265/HEVC ▾]                  │
│  Resolution: [1920x1080 ▾]              │
│  FPS: [60 ▾]                            │
│  Bitrate: [━━━━━━━━━━━━━] 20 Mbps       │
│  HDR: [Toggle]                           │
│  FEC: [━━━━━━] 20%                       │
│  Encryption: [Opportunistic ▾]           │
│                                          │
│  Audio Device: [Default ▾]               │
│  Audio Channels: [Stereo ▾]              │
│                                          │
│  Display: [Primary Monitor ▾]            │
│  Virtual Display: [Per-client ▾]         │
│                                          │
│  [Apply] [Reset to Defaults]             │
└─────────────────────────────────────────┘
```

## 3. Telemetry Dashboard

### Casual View
```
┌─────────────────────────────────────────┐
│  Server Status: ● Streaming              │
│  Client: "Living Room PC" (192.168.1.5)  │
│  Quality: Excellent                      │
│  Duration: 2h 15m                        │
└─────────��───────────────────────────────┘
```

### Advanced View
```
┌─────────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 58.2 fps │ │ 18.4 Mbps│ │ 2.1 ms   ││
│  │ Framerate│ │ Bitrate  │ │ Encode   ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                          │
│  ┌──────────────────────────────────────┐│
│  │ [Throughput graph — last 60s]        ││
│  └──────────────────────────────────────┘│
│                                          │
│  Encoder: NVENC (RTX 4070)               │
│  Codec: HEVC Main10                      │
│  Resolution: 2560x1440 @ 60fps           │
│  Network: 0 drops, 0.3ms jitter          │
│  Client RTT: 4.2ms                       │
│  FEC recovery: 0.02%                     │
└─────────────────────────────────────────┘
```

## 4. Game Library UX

### Grid Layout (Default)
- Poster-first design (3:4 aspect ratio cards)
- Hover/focus: title overlay + platform badge
- Filter bar: All | Steam | Epic | GOG | Xbox | Manual
- Sort: A-Z | Recently Played | Recently Added
- Search: instant filter with debounce

### List Layout (Alternative)
- Compact rows with small poster + title + platform + status
- Better for large libraries (500+ games)

### Empty States
- No games: "Connect a game library to get started" + CTA
- No installed: "Games owned but not installed on this PC"
- Search no results: "No games match your search"

## 5. Onboarding Flow

```
Step 1: Welcome
  "Welcome to Jujo.Stream Server"
  "Let's get you streaming in under 5 minutes"
  [Get Started] [Skip Setup]

Step 2: Server Discovery (if client app)
  Auto-scan LAN for servers
  Or manual IP entry
  
Step 3: Pair Device
  Show QR code (primary)
  Or show PIN (fallback)
  
Step 4: Connect Library
  Show source cards (Steam, Epic, GOG, Xbox)
  "Connect at least one, or add games manually"
  [Connect Steam] [Skip]

Step 5: Verify Readiness
  Auto-check encoder, display, network
  Show green/yellow/red status
  [Fix Issues] or [Looks Good]

Step 6: Ready
  "You're all set! Open your library to start streaming."
  [Open Library]
```

## 6. Rules

- **NEVER** show raw technical errors to casual users (translate to human language)
- **ALWAYS** provide a recovery action for every error state
- **NEVER** block the user in a modal wizard (allow escape at any step)
- **ALWAYS** show what's happening during long operations (progress, not spinner)
- **NEVER** auto-play or auto-start without explicit user action
- **ALWAYS** remember user preferences (last used quality preset, last source filter)

## Output Rules
- When proposing UX, provide wireframe-style text layouts.
- When implementing, deliver complete screen widgets with state integration.
- Flag any UX anti-pattern as **[UX VIOLATION]**.
- Flag any missing empty state as **[EMPTY STATE MISSING]**.
