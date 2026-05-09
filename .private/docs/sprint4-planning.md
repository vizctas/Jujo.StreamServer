# Sprint 4 — Planning

## Executive Summary
Major UX/config overhaul: typography fix, stream config expansion (Simple + Advanced tabs), dashboard server awareness, System & Readiness enhancement, Library poster auto-fetch.

## Task Ledger

### T4.1 [DONE] Typography & Font Audit
- **Problem**: Current font/size combo not visually pleasant
- **Action**: Audit theme typography scale, adjust font family/sizes/weights
- **Deps**: None
- **Criteria**: Readable, modern, consistent hierarchy

### T4.2 [DONE] Dashboard — Server Connection Awareness
- **Problem**: Dashboard doesn't reflect server connection status (rest of app does)
- **Action**: Wire `serverStatusProvider` into dashboard, show connected/disconnected state
- **Deps**: None
- **Criteria**: Dashboard shows green/red connection indicator + server name

### T4.3 [PENDING] System & Readiness — Enhanced Info + Graphs
- **Problem**: Too sparse, could be in dashboard
- **Action**: Add GPU/CPU usage graphs, encoder capability matrix, network stats
- **Deps**: T4.2
- **Criteria**: Visually rich, justifies its own screen

### T4.4 [PENDING] Stream Config — Simple Mode Redesign
- **Problem**: Simple mode only has 3 quality presets, needs category-based choices
- **Action**: Split into categories (Display, Speed, Quality) with 3 options each
- **Deps**: None
- **Criteria**: Each category has 3 AI-curated options, clear visual separation

### T4.5 [DONE] Stream Config — Advanced Mode Full Expansion
- **Problem**: Missing 80%+ of server configurations
- **Action**: Add ALL configs organized by tabs. Exclude: WebRTC, Playnite
- **Tabs**:
  - General (sunshine_name, locale, log_level, system_tray, prep_cmds, etc.)
  - Video/Encoder (qp, min_threads, capture, encoder-specific: NVENC/QSV/AMD/VT/VAAPI/SW)
  - Display Device (all dd_* options, virtual display mode/layout)
  - Audio (sink, virtual_sink, stream_audio, steam drivers, etc.)
  - Input (controller, keyboard, mouse, gamepad, DS4/DS5, keybindings, etc.)
  - Network (port, address_family, upnp, external_ip, encryption, ping_timeout, etc.)
  - Frame Limiter (enable, provider, fps_limit, vsync, RTSS settings)
- **Deps**: T4.4
- **Criteria**: Every config key from config.h represented (except WebRTC/Playnite)

### T4.6 [PENDING] Library — Poster Auto-Fetch Overhaul
- **Problem**: No automatic poster fetching
- **Action**: Implement fallback chain:
  1. Local Steam cache (appid → header image on disk)
  2. Steam AppID lookup online (name → appid)
  3. Steam CDN poster fetch (appid → image URL)
  4. SteamGridDB (fallback for non-Steam games)
  5. IGDB (final fallback, pending API key)
- **Deps**: T4.5
- **Criteria**: "Fetch All Posters" button, progress indicator, fallback chain works

---

## Missing Configurations Catalog (from config.h + configuration.md)

### General/Server
| Config Key | Type | Default | Description |
|---|---|---|---|
| sunshine_name | string | hostname | Display name in Moonlight |
| locale | string | en | UI locale |
| min_log_level | enum | info | verbose/debug/info/warning/error/fatal/none |
| system_tray | bool | enabled | Show system tray icon |
| notify_pre_releases | bool | enabled | Notify pre-release updates |
| update_check_interval | int | 86400 | Seconds between update checks (0=disable) |
| global_prep_cmd | json | [] | Commands before/after all apps |
| enable_pairing | bool | true | Allow new device pairing |
| enable_discovery | bool | true | Allow network discovery |

### Video/Encoder
| Config Key | Type | Default | Description |
|---|---|---|---|
| qp | int | 28 | Quantization parameter (higher=more compression) |
| min_threads | int | 2 | Min CPU threads for encoding |
| prefer_10bit_sdr | bool | disabled | 10-bit SDR when HEVC/AV1 Main10 available |
| capture | enum | auto | nvfbc/wlr/kms/x11/ddx/wgc/wgcc |
| adapter_name | string | auto | GPU adapter |
| minimum_fps_target | float | 0 | Lowest FPS (0=half client FPS) |
| limit_framerate | bool | - | Limit framerate |
| fallback_mode | string | - | Fallback mode |

### NVENC-specific
| Config Key | Type | Default | Description |
|---|---|---|---|
| nvenc_preset | int(1-7) | 1 | P1(fastest)→P7(slowest) |
| nvenc_twopass | enum | quarter_res | disabled/quarter_res/full_res |
| nvenc_spatial_aq | bool | disabled | Spatial adaptive quantization |
| nv_realtime_hags | bool | - | Realtime HAGS |
| nv_opengl_vulkan_on_dxgi | bool | - | OpenGL/Vulkan on DXGI |
| nv_sunshine_high_power_mode | bool | - | High power mode |

### QSV-specific
| Config Key | Type | Default | Description |
|---|---|---|---|
| qsv_preset | int | - | QSV preset |
| qsv_cavlc | int | - | CAVLC mode |
| qsv_slow_hevc | bool | - | Slow HEVC mode |

### AMD-specific
| Config Key | Type | Default | Description |
|---|---|---|---|
| amd_usage_h264/hevc/av1 | int | - | Usage preset per codec |
| amd_rc_h264/hevc/av1 | int | - | Rate control per codec |
| amd_enforce_hrd | int | - | Enforce HRD |
| amd_quality_h264/hevc/av1 | int | - | Quality preset per codec |
| amd_preanalysis | int | - | Pre-analysis |
| amd_vbaq | int | - | VBAQ |
| amd_coder | int | - | Coder type |

### SW Encoder
| Config Key | Type | Default | Description |
|---|---|---|---|
| sw_preset | string | - | x264/x265 preset |
| sw_tune | string | - | x264/x265 tune |
| svtav1_preset | int | - | SVT-AV1 preset |

### Display Device (dd_*)
| Config Key | Type | Default | Description |
|---|---|---|---|
| virtual_display_mode | enum | disabled | disabled/per_client/shared |
| virtual_display_layout | enum | exclusive | exclusive/extended/extended_primary/extended_isolated/extended_primary_isolated |
| dd_configuration_option | enum | verify_only | disabled/verify_only/ensure_active/ensure_primary/ensure_only_display |
| dd_resolution_option | enum | auto | disabled/auto/manual |
| dd_manual_resolution | string | - | e.g. "1920x1080" |
| dd_refresh_rate_option | enum | auto | disabled/auto/manual/prefer_highest |
| dd_manual_refresh_rate | string | - | e.g. "120" |
| dd_hdr_option | enum | auto | disabled/auto |
| dd_hdr_request_override | enum | auto | auto/force_on/force_off |
| dd_config_revert_delay | int | 3000 | ms before reverting config |
| dd_config_revert_on_disconnect | bool | disabled | Revert on disconnect |
| dd_always_restore_from_golden | bool | false | Prefer golden snapshot |
| dd_activate_virtual_display | bool | false | Auto-activate virtual display |
| dd_snapshot_exclude_devices | json | [] | Device IDs to skip |
| dd_snapshot_restore_hotkey | string | - | Hotkey for restore |
| dd_snapshot_restore_hotkey_modifiers | string | ctrl+alt+shift | Modifier keys |
| dd_mode_remapping | json | {} | Resolution/FPS remapping |
| dd_wa_virtual_double_refresh | bool | true | Double refresh for virtual |
| dd_wa_dummy_plug_hdr10 | bool | false | Dummy plug HDR workaround |

### Audio
| Config Key | Type | Default | Description |
|---|---|---|---|
| audio_sink | string | default | Audio output device |
| virtual_sink | string | - | Virtual audio (mutes host) |
| stream_audio | bool | enabled | Stream audio to client |
| install_steam_audio_drivers | bool | enabled | Install Steam audio drivers |

### Input
| Config Key | Type | Default | Description |
|---|---|---|---|
| controller | bool | enabled | Allow controller input |
| keyboard | bool | enabled | Allow keyboard input |
| mouse | bool | enabled | Allow mouse input |
| gamepad | enum | auto | auto/ds4/ds5/switch/x360/xone |
| ds4_back_as_touchpad_click | bool | enabled | Back→touchpad click |
| motion_as_ds4 | bool | enabled | Motion sensor��DS4 |
| touchpad_as_ds4 | bool | enabled | Touchpad→DS4 |
| back_button_timeout | int | -1 | ms for Home emulation (-1=disabled) |
| key_repeat_delay | int | 500 | ms before key repeat |
| key_repeat_frequency | float | 24.9 | Keys per second |
| always_send_scancodes | bool | enabled | Send scancodes (Windows) |
| high_resolution_scrolling | bool | enabled | High-res scroll events |
| native_pen_touch | bool | enabled | Native pen/touch |
| enable_input_only_mode | bool | - | Input-only mode |
| forward_rumble | bool | - | Forward rumble to client |

### Network
| Config Key | Type | Default | Description |
|---|---|---|---|
| port | int | 47989 | Base port (offsets others) |
| address_family | enum | ipv4 | ipv4/both |
| upnp | bool | disabled | UPnP port forwarding |
| external_ip | string | auto | External IP override |
| origin_web_ui_allowed | enum | lan | pc/lan/wan |
| ping_timeout | int | 10000 | ms before stream shutdown |
| video_max_batch_size_kb | int | 64 | Max video batch (16/32/64) |

### Frame Limiter
| Config Key | Type | Default | Description |
|---|---|---|---|
| frame_limiter_enable | bool | disabled | Enable frame limiter |
| frame_limiter_provider | enum | auto | auto/rtss/nvidia-control-panel/none |
| frame_limiter_fps_limit | int | 0 | FPS limit (0=stream FPS) |
| frame_limiter_disable_vsync | bool | disabled | Force VSYNC off |
| rtss_install_path | string | auto | RTSS directory |
| rtss_frame_limit_type | enum | async | async/front edge sync/back edge sync/nvidia reflex |

### Lossless Scaling
| Config Key | Type | Default | Description |
|---|---|---|---|
| lossless_scaling_path | string | auto | Path to LosslessScaling.exe |
