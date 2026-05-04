import { I as defineStore, r as ref, J as createI18n, K as createRouter, L as createWebHistory, o as onMounted, w as watch, b as onBeforeUnmount, k as defineComponent, c as computed, M as createBlock, H as normalizeClass, N as resolveDynamicComponent, O as createElementBlock, P as toDisplayString, Q as openBlock, R as useI18n, S as withCtx, U as createVNode, V as createBaseVNode, W as createCommentVNode, X as withModifiers, Y as withKeys, Z as unref, F as Fragment, j as createTextVNode, z as Transition, _ as useRoute, $ as storeToRefs, G as onUnmounted, m as h, a0 as RouterLink, a1 as renderList, s as mergeProps, a2 as resolveComponent, a3 as createApp, a4 as createPinia } from "./vue-core-de07660f.js";
import { a as axios, G as Gauge, b as Gamepad2, S as SlidersHorizontal, W as Wrench, L as LogOut, M as Menu, U as Users, c as UserCog, d as UserX, e as Search, X, C as Check, P as Pencil, T as Trash2, f as Link, g as Unlink, h as LoaderCircle, i as Cog, j as Settings, k as Play, l as Pause, m as Square, n as Power, o as LayoutGrid, p as Grid3x3, R as Radio, q as Wifi, r as Plug, B as Bug, D as Download, F as FileArchive, s as FileText, t as RotateCcw, u as GitBranch, H as Hash, v as FlaskConical, w as List, Z as Zap, x as Plus, A as ArrowLeft, y as ChevronUp, z as ChevronDown, E as ChevronRight, I as Save, J as ExternalLink, K as Copy, N as Key, O as Lock, Q as Image, V as Lightbulb, Y as Stethoscope, _ as Timer, $ as MousePointerClick, a0 as Cpu, a1 as Monitor, a2 as Sun, a3 as Moon, a4 as SunMoon, a5 as CircleAlert, a6 as TriangleAlert, a7 as Info, a8 as CircleCheck, a9 as CircleX, aa as CircleQuestionMark, ab as ShieldCheck, ac as Smartphone, ad as Laptop, ae as Tv, af as Disc, ag as Maximize2, ah as Minimize2, ai as Volume2, aj as Github, ak as MessageCircle, al as Compass, am as CircleSlash, an as __unplugin_components_0, ao as NCheckbox, ap as NAlert, aq as NButton, ar as darkTheme, as as NConfigProvider, at as NModal, au as useMessage, av as NDropdown, aw as NDrawerContent, ax as NDrawer, ay as NDialogProvider, az as NNotificationProvider, aA as NMessageProvider, aB as NLoadingBarProvider } from "./vendor-33781bfc.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep, importerUrl) {
  return new URL(dep, importerUrl).href;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep, importerUrl);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
const en = {
  "_common": {
    "apply": "Apply",
    "auto": "Automatic",
    "autodetect": "Autodetect (recommended)",
    "beta": "(beta)",
    "cancel": "Cancel",
    "continue": "Continue",
    "disabled": "Disabled",
    "disabled_def": "Disabled (default)",
    "disabled_def_cbox": "Default: unchecked",
    "dismiss": "Dismiss",
    "do_cmd": "Do Command",
    "elevated": "Elevated",
    "enabled": "Enabled",
    "enabled_def": "Enabled (default)",
    "enabled_def_cbox": "Default: checked",
    "error": "Error!",
    "note": "Note:",
    "password": "Password",
    "run_as": "Run as Admin",
    "save": "Save",
    "see_more": "See More",
    "success": "Success!",
    "undo_cmd": "Undo Command",
    "username": "Username",
    "warning": "Warning!",
    "unknown": "Unknown",
    "search": "Search",
    "select_all": "Select all",
    "clear": "Clear",
    "delete": "Delete",
    "add": "Add",
    "remove": "Remove",
    "clear_all": "Clear All",
    "refresh": "Refresh",
    "learn_more": "Learn More"
  },
  "apps": {
    "actions": "Actions",
    "add_cmds": "Add Commands",
    "add_new": "Add New",
    "app_name": "Application Name",
    "app_name_desc": "Application Name, as shown on Moonlight",
    "applications_desc": "Applications are refreshed only when Client is restarted",
    "applications_title": "Applications",
    "auto_detach": "Continue streaming if the application exits quickly",
    "auto_detach_desc": "This will attempt to automatically detect launcher-type apps that close quickly after launching another program or instance of themselves. When a launcher-type app is detected, it is treated as a detached app.",
    "cmd": "Command",
    "cmd_desc": "The main application to start. If blank, no application will be started.",
    "cmd_note": "If the path to the command executable contains spaces, you must enclose it in quotes.",
    "cmd_prep_desc": "A list of commands to be run before/after this application. If any of the prep-commands fail, starting the application is aborted.",
    "cmd_prep_name": "Command Preparations",
    "covers_found": "Covers Found",
    "delete": "Delete",
    "confirm_delete_title": "Delete Application",
    "confirm_delete_title_named": 'Delete "{name}"?',
    "confirm_delete_message_named": 'This removes the application entry "{name}" from your list. It does not delete files on disk.',
    "detached_cmds": "Detached Commands",
    "detached_cmds_add": "Add Detached Command",
    "detached_cmds_desc": "A list of commands to be run in the background.",
    "detached_cmds_note": "If the path to the command executable contains spaces, you must enclose it in quotes.",
    "delete_all_autosync": "Delete All Playnite Auto-Sync Apps",
    "delete_autosync_title": "Delete auto-synced games?",
    "delete_autosync_body": "This removes every Playnite-managed auto-sync entry from Applications. Manual entries are not affected.",
    "delete_autosync_success": "Removed auto-synced Playnite games.",
    "delete_autosync_error": "Failed to delete auto-synced Playnite games.",
    "edit": "Edit",
    "exclude_from_autosync": "Exclude from auto-sync",
    "remove_exclusion": "Remove exclusion",
    "playnite_badge": "Playnite",
    "playnite_source_recent": "Auto-sync: Recent",
    "playnite_source_category": "Auto-sync: Category",
    "playnite_source_both": "Auto-sync: Recent + Category",
    "playnite_source_unknown": "Auto-sync",
    "playnite_manual": "Playnite (Manual)",
    "add_playnite": "Add Playnite Game",
    "add_playnite_search": "Search Playnite games...",
    "cannot_delete_autosync": "Auto-synced Playnite app cannot be deleted.",
    "playnite_edit_notice": "This application is managed by Playnite. Command, Working Directory, and Detached commands are ignored. Prep commands still run before and after the game.",
    "env_app_id": "App ID",
    "env_app_name": "App Name",
    "env_client_audio_config": "The Audio Configuration requested by the client (2.0/5.1/7.1)",
    "env_client_enable_sops": "The client has requested the option to optimize the game for optimal streaming (true/false)",
    "env_client_fps": "The FPS requested by the client (int)",
    "env_client_gcmap": "The requested gamepad mask, in a bitset/bitfield format (int)",
    "env_client_hdr": "HDR is enabled by the client (true/false)",
    "env_client_height": "The Height requested by the client (int)",
    "env_client_host_audio": "The client has requested host audio (true/false)",
    "env_client_width": "The Width requested by the client (int)",
    "env_displayplacer_example": "Example - displayplacer for Resolution Automation:",
    "env_qres_example": "Example - QRes for Resolution Automation:",
    "env_qres_path": "qres path",
    "env_var_name": "Var Name",
    "env_vars_about": "About Environment Variables",
    "env_vars_desc": "All commands get these environment variables by default:",
    "env_xrandr_example": "Example - Xrandr for Resolution Automation:",
    "exit_timeout": "Exit Timeout",
    "exit_timeout_desc": "Number of seconds to wait for all app processes to gracefully exit when requested to quit. If unset, the default is to wait up to 5 seconds. If set to 0, the app will be immediately terminated.",
    "find_cover": "Find Cover",
    "global_prep_desc": "Enable/Disable the execution of Global Prep Commands for this application.",
    "global_prep_name": "Global Prep Commands",
    "image": "Image",
    "image_desc": "Application icon/picture/image path that will be sent to client. Image must be a PNG file. If not set, Vibepollo will send default box image.",
    "loading": "Loading...",
    "name": "Name",
    "output_desc": "The file where the output of the command is stored, if it is not specified, the output is ignored",
    "output_name": "Output",
    "run_as_desc": "This can be necessary for some applications that require administrator permissions to run properly.",
    "wait_all": "Continue streaming until all app processes exit",
    "wait_all_desc": "This will continue streaming until all processes started by the app have terminated. When unchecked, streaming will stop when the initial app process exits, even if other app processes are still running.",
    "working_dir": "Working Directory",
    "working_dir_desc": "The working directory that should be passed to the process. For example, some applications use the working directory to search for configuration files. If not set, Vibepollo will default to the parent directory of the command",
    "more_fields_below": "More fields below — scroll"
  },
  "offline": {
    "title": "Lost Connection to Vibepollo",
    "description": "The web interface lost connectivity to the Vibepollo service.",
    "retrying": "Attempting to reconnect… The page will refresh once available.",
    "refresh_now": "Refresh now",
    "close_hint": "If you stopped Vibepollo intentionally, you may close this tab.",
    "output_name_desc_unix": "During Vibepollo startup, you should see the list of detected displays. Note: You need to use the id value inside the parenthesis. Below is an example; the actual output can be found in the Troubleshooting tab.",
    "output_name_desc_windows": "Manually specify a display device id to use for capture. If unset, the primary display is captured. Note: If you specified a GPU above, this display must be connected to that GPU. During Vibepollo startup, you should see the list of detected displays. Below is an example; the actual output can be found in the Troubleshooting tab.",
    "close_hint": "If you stopped Vibepollo intentionally, you may close this tab."
  },
  "config": {
    "amf": {
      "quality": "AMF Usage",
      "rate_control": "AMF Rate Control"
    },
    "adapter_name": "Adapter Name",
    "adapter_name_desc_linux_1": "Manually specify a GPU to use for capture.",
    "adapter_name_desc_linux_2": "to find all devices capable of VAAPI",
    "adapter_name_desc_linux_3": "Replace ``renderD129`` with the device from above to lists the name and capabilities of the device. To be supported by Vibepollo, it needs to have at the very minimum:",
    "adapter_name_desc_windows": "Manually specify a GPU to use for capture. If unset, the GPU is chosen automatically. We strongly recommend leaving this field blank to use automatic GPU selection! Note: This GPU must have a display connected and powered on. The appropriate values can be found using the following command:",
    "adapter_name_placeholder_windows": "Radeon RX 580 Series",
    "add": "Add",
    "address_family": "Address Family",
    "address_family_both": "IPv4+IPv6",
    "address_family_desc": "Set the address family used by Vibepollo",
    "address_family_ipv4": "IPv4 only",
    "always_send_scancodes": "Always Send Scancodes",
    "always_send_scancodes_desc": "Sending scancodes enhances compatibility with games and apps but may result in incorrect keyboard input from certain clients that aren't using a US English keyboard layout. Enable if keyboard input is not working at all in certain applications. Disable if keys on the client are generating the wrong input on the host.",
    "amd_coder": "AMF Coder (H264)",
    "amd_coder_desc": "Allows you to select the entropy encoding to prioritize quality or encoding speed. H.264 only.",
    "amd_enforce_hrd": "AMF Hypothetical Reference Decoder (HRD) Enforcement",
    "amd_enforce_hrd_desc": "Increases the constraints on rate control to meet HRD model requirements. This greatly reduces bitrate overflows, but may cause encoding artifacts or reduced quality on certain cards.",
    "amd_preanalysis": "AMF Preanalysis",
    "amd_preanalysis_desc": "This enables rate-control preanalysis, which may increase quality at the expense of increased encoding latency.",
    "amd_quality": "AMF Quality",
    "amd_quality_balanced": "balanced -- balanced (default)",
    "amd_quality_desc": "This controls the balance between encoding speed and quality.",
    "amd_quality_group": "AMF Quality Settings",
    "amd_quality_quality": "quality -- prefer quality",
    "amd_quality_speed": "speed -- prefer speed",
    "amd_rc": "AMF Rate Control",
    "amd_rc_cbr": "cbr -- constant bitrate (recommended if HRD is enabled)",
    "amd_rc_cqp": "cqp -- constant qp mode",
    "amd_rc_desc": "This controls the rate control method to ensure we are not exceeding the client bitrate target. 'cqp' is not suitable for bitrate targeting, and other options besides 'vbr_latency' depend on HRD Enforcement to help constrain bitrate overflows.",
    "amd_rc_group": "AMF Rate Control Settings",
    "amd_rc_vbr_latency": "vbr_latency -- latency constrained variable bitrate (recommended if HRD is disabled; default)",
    "amd_rc_vbr_peak": "vbr_peak -- peak constrained variable bitrate",
    "amd_usage": "AMF Usage",
    "amd_usage_desc": "This sets the base encoding profile. All options presented below will override a subset of the usage profile, but there are additional hidden settings applied that cannot be configured elsewhere.",
    "amd_usage_lowlatency": "lowlatency - low latency (fastest)",
    "amd_usage_lowlatency_high_quality": "lowlatency_high_quality - low latency, high quality (fast)",
    "amd_usage_transcoding": "transcoding -- transcoding (slowest)",
    "amd_usage_ultralowlatency": "ultralowlatency - ultra low latency (fastest; default)",
    "amd_usage_webcam": "webcam -- webcam (slow)",
    "amd_vbaq": "AMF Variance Based Adaptive Quantization (VBAQ)",
    "amd_vbaq_desc": "The human visual system is typically less sensitive to artifacts in highly textured areas. In VBAQ mode, pixel variance is used to indicate the complexity of spatial textures, allowing the encoder to allocate more bits to smoother areas. Enabling this feature leads to improvements in subjective visual quality with some content.",
    "apply_note": "Click 'Apply' to restart Vibepollo and apply changes. This will terminate any running sessions.",
    "audio_sink": "Audio Sink",
    "audio_sink_desc_linux": "The name of the audio sink used for Audio Loopback. If you do not specify this variable, pulseaudio will select the default monitor device. You can find the name of the audio sink using either command:",
    "audio_sink_desc_macos": "The name of the audio sink used for Audio Loopback. Vibepollo can only access microphones on macOS due to system limitations. To stream system audio using Soundflower or BlackHole.",
    "audio_sink_desc_windows": "Manually specify a specific audio device to capture. If unset, the device is chosen automatically. We strongly recommend leaving this field blank to use automatic device selection! If you have multiple audio devices with identical names, you can get the Device ID using the following command:",
    "audio_sink_placeholder_macos": "BlackHole 2ch",
    "audio_sink_placeholder_windows": "Speakers (High Definition Audio Device)",
    "av1_mode": "AV1 Support",
    "av1_mode_0": "Vibepollo will advertise support for AV1 based on encoder capabilities (recommended)",
    "av1_mode_1": "Vibepollo will not advertise support for AV1",
    "av1_mode_2": "Vibepollo will advertise support for AV1 Main 8-bit profile",
    "av1_mode_3": "Vibepollo will advertise support for AV1 Main 8-bit and 10-bit (HDR) profiles",
    "av1_mode_desc": "Allows the client to request AV1 Main 8-bit or 10-bit video streams. AV1 is more CPU-intensive to encode, so enabling this may reduce performance when using software encoding.",
    "prefer_10bit_sdr": "Prefer 10-bit SDR",
    "prefer_10bit_sdr_follow_global": "Following the global 10-bit SDR setting.",
    "prefer_10bit_sdr_desc": "Capture and encode SDR sessions in 10-bit when the client and encoder negotiated HEVC/AV1 Main10 support (HDR stays off). Warning: May cause crashes on client devices with older GPUs that don't support HEVC 10-bit decoding.",
    "back_button_timeout": "Home/Guide Button Emulation Timeout",
    "back_button_timeout_desc": "If the Back/Select button is held down for the specified number of milliseconds, a Home/Guide button press is emulated. If set to a value < 0 (default), holding the Back/Select button will not emulate the Home/Guide button.",
    "capture": "Force a Specific Capture Method",
    "capture_desc": "On automatic mode Vibepollo will use the first one that works. NvFBC requires patched nvidia drivers.",
    "capture_auto_wgc": "Automatic (Windows Graphics Capture)",
    "capture_wgc_auto": "Windows Graphics Capture (variable)",
    "capture_ddx_legacy": "Desktop Duplication API (legacy)",
    "capture_autodetect_legacy": "Automatic (legacy fallback)",
    "cert": "Certificate",
    "cert_desc": "The certificate used for the web UI and Moonlight client pairing. For best compatibility, this should have an RSA-2048 public key.",
    "channels": "Maximum Connected Clients",
    "channels_desc_1": "Vibepollo can allow a single streaming session to be shared with multiple clients simultaneously.",
    "channels_desc_2": "Some hardware encoders may have limitations that reduce performance with multiple streams.",
    "coder_cabac": "cabac -- context adaptive binary arithmetic coding - higher quality",
    "coder_cavlc": "cavlc -- context adaptive variable-length coding - faster decode",
    "configuration": "Configuration",
    "controller": "Enable Gamepad Input",
    "controller_desc": "Allows guests to control the host system with a gamepad / controller",
    "credentials_file": "Credentials File",
    "credentials_file_desc": "Store Username/Password separately from Vibepollo's state file.",
    "dd_config_ensure_active": "Activate the display automatically",
    "dd_config_ensure_active_warning": "Windows does not display the lock screen on external monitors until you click on them, which can cause black screens when streaming. If this is an issue, use the primary display option instead.",
    "dd_config_ensure_only_display": "Deactivate other displays and activate only the specified display",
    "dd_config_ensure_primary": "Activate the display automatically and make it a primary display",
    "dd_configuration_option": "Device configuration",
    "dd_config_label": "Device configuration",
    "dd_config_revert_delay": "Config revert delay",
    "dd_config_revert_delay_desc": "Additional delay in milliseconds to wait before reverting configuration when the app has been closed or the last session terminated. Main purpose is to provide a smoother transition when quickly switching between apps.",
    "dd_config_revert_on_disconnect": "Config revert on disconnect",
    "dd_config_revert_on_disconnect_desc": "Revert configuration upon disconnect of all clients instead of app close or last session termination.",
    "dd_paused_virtual_display_timeout_secs": "Paused session virtual display timeout (seconds)",
    "dd_paused_virtual_display_timeout_secs_desc": "Optional timeout while a session is paused and revert-on-disconnect is disabled. 0 keeps current behavior (no timeout).",
    "dd_paused_virtual_display_timeout_secs_warning": "Removing a virtual display while a game is still running can cause crashes regardless of trigger (timeout, hotkey, or manual restore). This option helps prevent returning to a stuck virtual screen after inactivity.",
    "dd_paused_virtual_display_timeout_secs_hotkey_hint": "Alternative: use the restore hotkey to immediately terminate and restore display state when needed.",
    "dd_snapshot_exclude_title": "Exclude devices from snapshots",
    "dd_snapshot_exclude_desc": "Exclude physical dummy plugs from golden/session snapshots. Helpful when using both a virtual display and a physical dummy plug so restores avoid the plug.",
    "dd_snapshot_exclude_placeholder": "Choose devices (e.g., physical dummy plug) to exclude",
    "dd_snapshot_exclude_warning": "Keep at least one display unexcluded.",
    "dd_always_restore_from_golden": "Always restore from snapshot",
    "dd_always_restore_from_golden_desc": "When enabled, the saved snapshot above is used first during display restore (reduces risk of stuck virtual screens). If the snapshot fails, falls back to session-based restore. Leave off unless you experience stuck displays.",
    "golden_layout_upgrade_title": "Golden display snapshot needs an update",
    "golden_layout_upgrade_desc": "Your saved snapshot predates display layout support. Recreate it to restore portrait and landscape monitor layouts correctly.",
    "golden_layout_upgrade_action": "Open Display Settings",
    "dd_snapshot_restore_hotkey": "Restore snapshot hotkey",
    "dd_snapshot_restore_hotkey_desc": "Windows-only global hotkey. Useful for forcing virtual displays off and restoring snapshots when Vibepollo is paused or stuck. Click the field and press the combo you want.",
    "dd_snapshot_restore_hotkey_capture": "Listening... press a combo now.",
    "dd_snapshot_restore_hotkey_reset": "Clear hotkey",
    "dd_snapshot_restore_hotkey_invalid": "Unsupported key. Use F1-F24, letters, or digits.",
    "dd_snapshot_restore_hotkey_modifiers": "Restore hotkey modifiers",
    "dd_snapshot_restore_hotkey_modifiers_desc": "Modifiers for the restore hotkey (e.g., ctrl+alt+shift, ctrl|shift, win, none). Supported tokens: ctrl/control, alt, shift, win/windows/meta, none/off/disabled.",
    "dd_config_verify_only": "Verify that the display is enabled (default)",
    "dd_hdr_option": "HDR",
    "dd_hdr_option_auto": "Switch on/off the HDR mode as requested by the client (default)",
    "dd_hdr_option_disabled": "Do not change HDR settings",
    "dd_wa_virtual_double_refresh": "Double refresh rate for virtual displays",
    "dd_wa_virtual_double_refresh_desc": "Creates Vibepollo virtual displays at 2x the target refresh to prevent unexplained FPS drops. Leave this on unless a specific game or monitor behaves incorrectly. Note: Manual refresh rate overrides this (no doubling).",
    "dd_wa_dummy_plug_hdr10": "HDR 10-bit workaround for physical dummy plugs",
    "dd_wa_dummy_plug_hdr10_desc": "Locks physical dummy plugs to 30 Hz and keeps the VSYNC override active so HDR10 is recognized. Only enable this when you are using a hardware dummy plug. Applied to game launches only (Desktop streams keep their normal refresh rate).",
    "dd_wa_dummy_plug_hdr10_link": "Dummy Plugs setup guide",
    "dd_display_overrides": "Display overrides",
    "dd_manual_refresh_rate": "Manual refresh rate",
    "dd_manual_resolution": "Manual resolution",
    "dd_mode_remapping": "Display mode remapping",
    "dd_mode_remapping_add": "Add remapping entry",
    "dd_mode_remapping_desc_1": "Specify remapping entries to change the requested resolution and/or refresh rate to other values.",
    "dd_mode_remapping_desc_2": "The list is iterated from top to bottom and the first match is used.",
    "dd_mode_remapping_desc_3": '"Requested" fields can be left empty to match any requested value.',
    "dd_mode_remapping_desc_example": "Example: stream 1920×1080 to the client while keeping the desktop at 3840×2160 on the host display.",
    "dd_mode_remapping_desc_4_final_values_mixed": 'At least one "Final" field must be specified. The unspecified resolution or refresh rate will not be changed.',
    "dd_mode_remapping_desc_4_final_values_non_mixed": '"Final" field must be specified and cannot be empty.',
    "dd_mode_remapping_final_refresh_rate": "Final refresh rate",
    "dd_mode_remapping_final_resolution": "Final resolution",
    "dd_mode_remapping_requested_fps": "Requested FPS",
    "dd_mode_remapping_requested_resolution": "Requested resolution",
    "dd_options_header": "Advanced display device options",
    "dd_display_setup_title": "Display Setup (Before Stream)",
    "dd_display_setup_intro": "Choose the display to capture and how Vibepollo should prepare Windows just before a stream starts (turn on a monitor, switch primary, set resolution/refresh rate, HDR).",
    "dd_automation_label": "Display automation",
    "dd_automation_desc": "Automatically adjust the host display to match the client's requested resolution and refresh rate before streaming.",
    "dd_step_1": "Step 1",
    "dd_step_2": "Step 2",
    "dd_step_3": "Step 3",
    "dd_choose_display": "Choose the display",
    "dd_virtual_display_choice_virtual": "Use virtualized display",
    "dd_virtual_display_choice_physical": "Use my own display",
    "virtual_display_mode_disabled": "Use Physical Display",
    "virtual_display_mode_per_client": "Virtual Display (Per Client)",
    "virtual_display_mode_shared": "Shared Virtual Display",
    "virtual_display_mode_label": "Virtual display mode",
    "virtual_display_mode_step_hint": "Select which display Vibepollo should prepare: keep your physical monitor, create a per-client virtual display, or reuse a shared virtual screen.",
    "virtual_display_hdr_tip": "HDR Tip: Run Windows HDR Calibration while streaming and save the profile. Then open the Clients tab and click HDR Color Profile for the client to choose the saved profile.",
    "virtual_display_layout_label": "Virtual Display Layout",
    "virtual_display_layout_hint": "Choose how Vibepollo positions and prioritizes your virtual display when it is enabled.",
    "virtual_display_toggle_label": "Configure Physical or Virtual Display",
    "virtual_display_toggle_hint": "Override the display Vibepollo uses for this app: switch to the Vibepollo virtual display or pick a specific physical monitor. Leave unchecked to follow the global/client choice.",
    "app_display_override_label": "Per-app display override",
    "client_display_override_label": "Per-client display override",
    "client_display_override_hint": "Override how Vibepollo chooses a display for this client. Leave unchecked to follow the global display settings.",
    "app_display_override_hint": "Choose whether this app should launch on the Vibepollo virtual display or target a specific physical monitor instead of the global default.",
    "app_display_override_virtual": "Use Vibepollo virtual display",
    "app_display_override_physical": "Use a physical display",
    "app_display_physical_label": "Select physical display",
    "app_display_physical_hint": "Pick the monitor to use when launching this app. Physical dummy plugs show up here even if they are inactive.",
    "app_display_physical_placeholder": "Choose a display",
    "app_display_physical_status_hint": "Clear the selection to follow the global display setting for this app.",
    "app_display_status_active": "active",
    "app_display_status_inactive": "inactive",
    "virtual_display_layout_exclusive": "Exclusive",
    "virtual_display_layout_exclusive_desc": "Disable every other monitor so only the Vibepollo virtual display stays visible.",
    "virtual_display_layout_extended": "Extended",
    "virtual_display_layout_extended_desc": "Keep your physical monitors active and simply add the virtual display as another screen.",
    "virtual_display_layout_extended_primary": "Extended + Primary",
    "virtual_display_layout_extended_primary_desc": "Extend the desktop and make the virtual display the primary monitor (taskbar, login, etc.).",
    "virtual_display_layout_extended_isolated": "Extended + Isolated",
    "virtual_display_layout_extended_isolated_desc": "Extend the desktop but park the virtual display far away so the mouse never wanders into it.",
    "virtual_display_layout_extended_primary_isolated": "Extended + Primary (Isolated)",
    "virtual_display_layout_extended_primary_isolated_desc": "Combine primary + isolation: make the virtual display primary while keeping it out of reach of physical monitors.",
    "virtual_display_status_label": "Vibepollo virtual display driver:",
    "virtual_display_status_hint": "Use Vibepollo's virtual display to spin up a high-refresh virtual monitor automatically. If the driver reports an error, reinstall Vibepollo or repair the driver before streaming.",
    "app_virtual_display_mode_label": "App display preference",
    "app_virtual_display_mode_hint": "When this app runs on the Vibepollo virtual display, choose whether to use a per-client or shared virtual screen and configure the layout below. Reset to follow the global display configuration.",
    "app_virtual_display_mode_follow_global": "Following the global display configuration.",
    "app_virtual_display_mode_reset": "Reset to global display",
    "app_virtual_display_layout_reset": "Reset to global layout",
    "app_virtual_display_layout_follow_global": "Following the global virtual display layout.",
    "sudovda_status_unknown": "Unknown",
    "sudovda_status_ready": "Ready",
    "sudovda_status_uninitialized": "Not initialized",
    "sudovda_status_version_incompatible": "Driver version mismatch",
    "sudovda_status_watchdog_failed": "Watchdog failed",
    "dd_pre_stream_setup": "Pre-stream setup",
    "dd_pre_stream_intro": "Vibepollo applies these settings automatically when starting a stream. Use them to activate a display, make it primary, and optionally adjust resolution, refresh rate, and HDR.",
    "dd_config_hint": "Choose how Vibepollo prepares the display before streaming.",
    "dd_activate_virtual_display": "Auto-activate Vibepollo virtual display",
    "dd_activate_virtual_display_desc": "When using Vibepollo's virtual display driver, turn the virtual monitor on and temporarily make it the only active display while a stream is starting.",
    "dd_optional_adjustments": "Optional adjustments",
    "dd_advanced_remapping_title": "Advanced: Mode remapping",
    "dd_refresh_rate_option": "Refresh rate",
    "dd_refresh_rate_option_auto": "Use FPS value provided by the client (default)",
    "dd_refresh_rate_option_disabled": "Do not change refresh rate",
    "dd_refresh_rate_option_manual": "Use manually entered refresh rate",
    "dd_resolution_option": "Resolution",
    "dd_resolution_option_auto": "Use resolution provided by the client (default)",
    "dd_resolution_option_disabled": "Do not change resolution",
    "dd_resolution_option_manual": "Use manually entered resolution",
    "dd_resolution_option_manual_desc": "⚠️ Enforcing a manual resolution disables all display overrides below. The host will always be set to this resolution regardless of any override rules.",
    "dd_refresh_rate_option_manual_desc": '⚠️ Enforcing a manual refresh rate forces the host to this refresh for all streams, overriding any refresh rules below and the "Double refresh rate for virtual displays" option.',
    "dd_wa_hdr_toggle_delay_desc_1": "When using virtual display device (VDD) for streaming, it might incorrectly display HDR color. Vibepollo can try to mitigate this issue, by turning HDR off and then on again.",
    "dd_wa_hdr_toggle_delay_desc_2": "If the value is set to 0, the workaround is disabled (default). If the value is between 0 and 3000 milliseconds, Vibepollo will turn off HDR, wait for the specified amount of time and then turn HDR on again. The recommended delay time is around 500 milliseconds in most cases.",
    "dd_wa_hdr_toggle_delay_desc_3": "DO NOT use this workaround unless you actually have issues with HDR as it directly impacts stream start time!",
    "dd_wa_hdr_toggle_delay": "High-contrast workaround for HDR",
    "dd_wa_hdr_toggle": "High-contrast workaround for HDR",
    "dd_wa_hdr_toggle_desc": "When using a virtual display device (VDD), HDR colors can be wrong. Vibepollo can toggle HDR off and back on to mitigate this. Enable only if you see HDR color issues.",
    "ds4_back_as_touchpad_click": "Map Back/Select to Touchpad Click",
    "ds4_back_as_touchpad_click_desc": "When forcing DS4 emulation, map Back/Select to Touchpad Click",
    "ds5_inputtino_randomize_mac": "Randomize virtual controller MAC",
    "ds5_inputtino_randomize_mac_desc": "Upon controller registration use a random MAC instead of one based on the controllers internal index to avoid mixing configuration settings of different controllers when the are swapped on client-side.",
    "encoder": "Force a Specific Encoder",
    "encoder_desc": "Force a specific encoder, otherwise Vibepollo will select the best available option. Note: If you specify a hardware encoder on Windows, it must match the GPU where the display is connected.",
    "encoder_software": "Software",
    "external_ip": "External IP",
    "external_ip_desc": "If no external IP address is given, Vibepollo will automatically detect external IP",
    "fec_percentage": "FEC Percentage",
    "fec_percentage_desc": "Percentage of error correcting packets per data packet in each video frame. Higher values can correct for more network packet loss, but at the cost of increasing bandwidth usage.",
    "frame_limiter_fps_limit": "Frame limiter FPS limit",
    "frame_limiter_fps_limit_desc": "Optional global FPS limit for the frame limiter. Set to 0 to use the stream's requested FPS.",
    "ffmpeg_auto": "auto -- let ffmpeg decide (default)",
    "file_apps": "Apps File",
    "file_apps_desc": "The file where current apps of Vibepollo are stored.",
    "file_state": "State File",
    "file_state_desc": "The file where current state of Vibepollo is stored",
    "gamepad": "Emulated Gamepad Type",
    "gamepad_auto": "Automatic selection options",
    "gamepad_desc": "Choose which type of gamepad to emulate on the host",
    "gamepad_ds4": "DS4 (PS4)",
    "gamepad_ds4_manual": "DS4 selection options",
    "gamepad_ds5": "DS5 (PS5)",
    "gamepad_ds5_manual": "DS5 selection options",
    "gamepad_switch": "Nintendo Pro (Switch)",
    "gamepad_manual": "Manual DS4 options",
    "gamepad_x360": "X360 (Xbox 360)",
    "gamepad_xone": "XOne (Xbox One)",
    "vigem_missing_title": "Virtual Gamepad Driver (ViGEm) not installed",
    "vigem_missing_desc": "Vibepollo requires the ViGEmBus driver to emulate controllers on Windows. It is no longer bundled. Please download and install it manually:",
    "vigem_install": "Download ViGEmBus",
    "vigem_detected_version": "Detected",
    "crash_dump_title": "Recent crash detected",
    "crash_dump_desc": "Vibepollo detected a crash dump within the last week. Please export a crash bundle and include it when opening an issue.",
    "crash_dump_export": "Export Crash Bundle",
    "crash_dump_export_preparing": "Preparing Crash Bundle...",
    "crash_dump_export_error": "Failed to export crash bundle.",
    "crash_dump_report": "Report Issue",
    "crash_dump_dismiss": "Dismiss",
    "crash_dump_dismiss_success": "Crash notification dismissed.",
    "crash_dump_dismiss_error": "Failed to dismiss crash notification.",
    "global_prep_cmd": "Command Preparations",
    "global_prep_cmd_desc": "Configure a list of commands to be executed before or after running any application. If any of the specified preparation commands fail, the application launch process will be aborted.",
    "hevc_mode": "HEVC Support",
    "hevc_mode_0": "Vibepollo will advertise support for HEVC based on encoder capabilities (recommended)",
    "hevc_mode_1": "Vibepollo will not advertise support for HEVC",
    "hevc_mode_2": "Vibepollo will advertise support for HEVC Main profile",
    "hevc_mode_3": "Vibepollo will advertise support for HEVC Main and Main10 (HDR) profiles",
    "hevc_mode_desc": "Allows the client to request HEVC Main or HEVC Main10 video streams. HEVC is more CPU-intensive to encode, so enabling this may reduce performance when using software encoding.",
    "high_resolution_scrolling": "High Resolution Scrolling Support",
    "high_resolution_scrolling_desc": "When enabled, Vibepollo will pass through high resolution scroll events from Moonlight clients. This can be useful to disable for older applications that scroll too fast with high resolution scroll events.",
    "install_steam_audio_drivers": "Install Steam Audio Drivers",
    "install_steam_audio_drivers_desc": "If Steam is installed, this will automatically install the Steam Streaming Speakers driver to support 5.1/7.1 surround sound and muting host audio.",
    "key_repeat_delay": "Key Repeat Delay",
    "key_repeat_delay_desc": "Control how fast keys will repeat themselves. The initial delay in milliseconds before repeating keys.",
    "key_repeat_frequency": "Key Repeat Frequency",
    "key_repeat_frequency_desc": "How often keys repeat every second. This configurable option supports decimals.",
    "key_rightalt_to_key_win": "Map Right Alt key to Windows key",
    "key_rightalt_to_key_win_desc": "It may be possible that you cannot send the Windows Key from Moonlight directly. In those cases it may be useful to make Vibepollo think the Right Alt key is the Windows key",
    "keybindings": "Keybindings",
    "keyboard": "Enable Keyboard Input",
    "keyboard_desc": "Allows guests to control the host system with the keyboard",
    "lan_encryption_mode": "LAN Encryption Mode",
    "lan_encryption_mode_1": "Enabled for supported clients",
    "lan_encryption_mode_2": "Required for all clients",
    "lan_encryption_mode_desc": "This determines when encryption will be used when streaming over your local network. Encryption can reduce streaming performance, particularly on less powerful hosts and clients.",
    "locale": "Locale",
    "locale_desc": "The locale used for Vibepollo's user interface.",
    "log_path": "Logfile Path",
    "log_path_desc": "The file where the current logs of Vibepollo are stored.",
    "max_bitrate": "Maximum Bitrate",
    "max_bitrate_desc": "The maximum bitrate (in Kbps) that Vibepollo will encode the stream at. If set to 0, it will always use the bitrate requested by Moonlight.",
    "minimum_fps_target": "Minimum FPS Target",
    "minimum_fps_target_desc": "The lowest effective FPS a stream can reach. A value of 0 is treated as roughly half of the stream's FPS. A setting of 20 is recommended if you stream 24 or 30fps content.",
    "session_token_ttl_seconds": "Web UI Session Timeout (seconds)",
    "session_token_ttl_seconds_desc": "How long a Web UI login session remains valid before requiring re-authentication. Reduce for higher security; increase for convenience.",
    "remember_me_refresh_token_ttl_seconds": "Trusted device lifetime (seconds)",
    "remember_me_refresh_token_ttl_seconds_desc": "How long a remembered device stays trusted before requiring sign-in again. Use a lower value for higher security.",
    "min_log_level": "Log Level",
    "min_log_level_0": "Verbose",
    "min_log_level_1": "Debug",
    "min_log_level_2": "Info",
    "min_log_level_3": "Warning",
    "min_log_level_4": "Error",
    "min_log_level_5": "Fatal",
    "min_log_level_6": "None",
    "min_log_level_desc": "The minimum log level printed to standard out",
    "min_threads": "Minimum CPU Thread Count",
    "min_threads_desc": "Increasing the value slightly reduces encoding efficiency, but the tradeoff is usually worth it to gain the use of more CPU cores for encoding. The ideal value is the lowest value that can reliably encode at your desired streaming settings on your hardware.",
    "misc": "Miscellaneous options",
    "motion_as_ds4": "Emulate a DS4 gamepad if the client gamepad reports motion sensors are present",
    "motion_as_ds4_desc": "If disabled, motion sensors will not be taken into account during gamepad type selection.",
    "mouse": "Enable Mouse Input",
    "mouse_desc": "Allows guests to control the host system with the mouse",
    "native_pen_touch": "Native Pen/Touch Support",
    "native_pen_touch_desc": "When enabled, Vibepollo will pass through native pen/touch events from Moonlight clients. This can be useful to disable for older applications without native pen/touch support.",
    "notify_pre_releases": "PreRelease Notifications",
    "notify_pre_releases_desc": "Whether to be notified of new pre-release versions of Vibepollo",
    "update_check_interval": "Update Check Interval (seconds)",
    "update_check_interval_desc": "How often Vibepollo should check for updates automatically (based on git tags). Set 0 to disable periodic checks.",
    "nvenc_h264_cavlc": "Prefer CAVLC over CABAC in H.264",
    "nvenc_h264_cavlc_desc": "Simpler form of entropy coding. CAVLC needs around 10% more bitrate for same quality. Only relevant for really old decoding devices.",
    "nvenc_latency_over_power": "Prefer lower encoding latency over power savings",
    "nvenc_latency_over_power_desc": "Vibepollo requests maximum GPU clock speed while streaming to reduce encoding latency. Disabling it is not recommended since this can lead to significantly increased encoding latency.",
    "nvenc_opengl_vulkan_on_dxgi": "Present OpenGL/Vulkan on top of DXGI",
    "nvenc_opengl_vulkan_on_dxgi_desc": "Vibepollo can't capture fullscreen OpenGL and Vulkan programs at full frame rate unless they present on top of DXGI. This is system-wide setting that is reverted on sunshine program exit.",
    "nvenc_preset": "Performance preset",
    "nvenc_preset_1": "(fastest, default)",
    "nvenc_preset_4": "(balanced quality)",
    "nvenc_preset_7": "(slowest)",
    "nvenc_preset_desc": "Higher numbers improve compression (quality at given bitrate) at the cost of increased encoding latency. Recommended to change only when limited by network or decoder, otherwise similar effect can be accomplished by increasing bitrate.",
    "nvenc_section_title": "NVIDIA NVENC Encoder",
    "nvenc_realtime_hags": "Use realtime priority in hardware accelerated gpu scheduling",
    "nvenc_realtime_hags_desc": "Currently NVIDIA drivers may freeze in encoder when HAGS is enabled, realtime priority is used and VRAM utilization is close to maximum. Disabling this option lowers the priority to high, sidestepping the freeze at the cost of reduced capture performance when the GPU is heavily loaded. Alternatively, you can swap your capture method to Windows.Graphics.Capture in advanced settings tab. This also mitigates this freezing issue without any performance hit.",
    "nvenc_spatial_aq": "Spatial AQ",
    "nvenc_spatial_aq_desc": "Assign higher QP values to flat regions of the video. Recommended to enable when streaming at lower bitrates.",
    "nvenc_split_encode": "Split Frame Encoding",
    "nvenc_split_encode_desc": "Controls NVENC split-frame encoding for HEVC and AV1. NVIDIA drivers already enable it automatically for many 4K-and-higher workloads, so use Enabled to force it on for lower resolutions too, or Disabled to keep it off.",
    "nvenc_twopass": "Two-pass mode",
    "nvenc_twopass_desc": "Adds preliminary encoding pass. This allows to detect more motion vectors, better distribute bitrate across the frame and more strictly adhere to bitrate limits. Disabling it is not recommended since this can lead to occasional bitrate overshoot and subsequent packet loss.",
    "nvenc_twopass_disabled": "Disabled (fastest, not recommended)",
    "nvenc_twopass_full_res": "Full resolution (slower)",
    "nvenc_twopass_quarter_res": "Quarter resolution (faster, default)",
    "nvenc_vbv_increase": "Single-frame VBV/HRD percentage increase",
    "nvenc_vbv_increase_desc": "By default sunshine uses single-frame VBV/HRD, which means any encoded video frame size is not expected to exceed requested bitrate divided by requested frame rate. Relaxing this restriction can be beneficial and act as low-latency variable bitrate, but may also lead to packet loss if the network doesn't have buffer headroom to handle bitrate spikes. Maximum accepted value is 400, which corresponds to 5x increased encoded video frame upper size limit.",
    "origin_web_ui_allowed": "Origin Web UI Allowed",
    "origin_web_ui_allowed_desc": "The origin of the remote endpoint address that is not denied access to Web UI",
    "origin_web_ui_allowed_lan": "Only those in LAN may access Web UI",
    "origin_web_ui_allowed_pc": "Only localhost may access Web UI",
    "origin_web_ui_allowed_wan": "Anyone may access Web UI",
    "output_name": "Display Id",
    "output_name_default": "Primary display (default)",
    "output_name_desc_unix": "During Vibepollo startup, you should see the list of detected displays. Note: You need to use the id value inside the parenthesis. Below is an example; the actual output can be found in the Troubleshooting tab.",
    "output_name_desc_windows": "Manually specify a display device id to use for capture. If unset, the primary display is captured. Note: If you specified a GPU above, this display must be connected to that GPU. During Vibepollo startup, you should see the list of detected displays. Below is an example; the actual output can be found in the Troubleshooting tab.",
    "ping_timeout": "Ping Timeout",
    "ping_timeout_desc": "How long to wait in milliseconds for data from moonlight before shutting down the stream",
    "video_max_batch_size_kb": "Max Video Batch Size",
    "video_max_batch_size_kb_desc": "Maximum size in KiB for each outgoing video send batch. The default is 64 KiB. Lower values can improve stream stability on cheaper switches, routers, and Wi-Fi gear, at the cost of less than 1 ms of extra host-side delay.",
    "pkey": "Private Key",
    "pkey_desc": "The private key used for the web UI and Moonlight client pairing. For best compatibility, this should be an RSA-2048 private key.",
    "port": "Port",
    "port_alert_1": "Vibepollo cannot use ports below 1024!",
    "port_alert_2": "Ports above 65535 are not available!",
    "port_desc": "Set the family of ports used by Vibepollo",
    "port_http_port_note": "Use this port to connect with Moonlight.",
    "port_note": "Note",
    "port_port": "Port",
    "port_protocol": "Protocol",
    "port_tcp": "TCP",
    "port_udp": "UDP",
    "port_warning": "Exposing the Web UI to the internet is a security risk! Proceed at your own risk!",
    "port_web_ui": "Web UI",
    "qp": "Quantization Parameter",
    "qp_desc": "Some devices may not support Constant Bit Rate. For those devices, QP is used instead. Higher value means more compression, but less quality.",
    "qsv_coder": "QuickSync Coder (H264)",
    "qsv_preset": "QuickSync Preset",
    "qsv_preset_fast": "fast (low quality)",
    "qsv_preset_faster": "faster (lower quality)",
    "qsv_preset_medium": "medium (default)",
    "qsv_preset_slow": "slow (good quality)",
    "qsv_preset_slower": "slower (better quality)",
    "qsv_preset_slowest": "slowest (best quality)",
    "qsv_preset_veryfast": "fastest (lowest quality)",
    "qsv_slow_hevc": "Allow Slow HEVC Encoding",
    "qsv_slow_hevc_desc": "This can enable HEVC encoding on older Intel GPUs, at the cost of higher GPU usage and worse performance.",
    "hot_applied_now": "Settings saved and applied immediately.",
    "hot_deferred": "Settings saved. Changes will apply when the current stream ends (or on next start).",
    "saving": "Saving…",
    "saved_success": "Saved successfully",
    "saved_deferred": "Changes will apply on next stream",
    "restart_required": "Restart Vibepollo to apply changes",
    "manual_save_needed": "Manual save required (restart changes)",
    "waiting_for_changes": "Waiting for changes…",
    "restart_note": "Vibepollo is restarting to apply changes.",
    "stream_audio": "Stream Audio",
    "stream_audio_desc": "Whether to stream audio or not. Disabling this can be useful for streaming headless displays as second monitors.",
    "sunshine_name": "Vibepollo Name",
    "sunshine_name_desc": "The name displayed by Moonlight. If not specified, the PC's hostname is used",
    "sw_preset": "SW Presets",
    "sw_preset_desc": "Optimize the trade-off between encoding speed (encoded frames per second) and compression efficiency (quality per bit in the bitstream). Defaults to superfast.",
    "sw_preset_fast": "fast",
    "sw_preset_faster": "faster",
    "sw_preset_medium": "medium",
    "sw_preset_slow": "slow",
    "sw_preset_slower": "slower",
    "sw_preset_superfast": "superfast (default)",
    "sw_preset_ultrafast": "ultrafast",
    "sw_preset_veryfast": "veryfast",
    "sw_preset_veryslow": "veryslow",
    "sw_tune": "SW Tune",
    "sw_tune_animation": "animation -- good for cartoons; uses higher deblocking and more reference frames",
    "sw_tune_desc": "Tuning options, which are applied after the preset. Defaults to zerolatency.",
    "sw_tune_fastdecode": "fastdecode -- allows faster decoding by disabling certain filters",
    "sw_tune_film": "film -- use for high quality movie content; lowers deblocking",
    "sw_tune_grain": "grain -- preserves the grain structure in old, grainy film material",
    "sw_tune_stillimage": "stillimage -- good for slideshow-like content",
    "sw_tune_zerolatency": "zerolatency -- good for fast encoding and low-latency streaming (default)",
    "system_tray": "Enable system tray",
    "system_tray_desc": "Show icon in system tray and display desktop notifications",
    "touchpad_as_ds4": "Emulate a DS4 gamepad if the client gamepad reports a touchpad is present",
    "touchpad_as_ds4_desc": "If disabled, touchpad presence will not be taken into account during gamepad type selection.",
    "upnp": "UPnP",
    "upnp_desc": "Automatically configure port forwarding for streaming over the Internet",
    "vaapi_strict_rc_buffer": "Strictly enforce frame bitrate limits for H.264/HEVC on AMD GPUs",
    "vaapi_strict_rc_buffer_desc": "Enabling this option can avoid dropped frames over the network during scene changes, but video quality may be reduced during motion.",
    "virtual_sink": "Virtual Sink",
    "virtual_sink_desc": "Manually specify a virtual audio device to use. If unset, the device is chosen automatically. We strongly recommend leaving this field blank to use automatic device selection!",
    "virtual_sink_placeholder": "Steam Streaming Speakers",
    "vt_coder": "VideoToolbox Coder",
    "vt_realtime": "VideoToolbox Realtime Encoding",
    "vt_software": "VideoToolbox Software Encoding",
    "vt_software_allowed": "Allowed",
    "vt_software_forced": "Forced",
    "wan_encryption_mode": "WAN Encryption Mode",
    "wan_encryption_mode_1": "Enabled for supported clients (default)",
    "wan_encryption_mode_2": "Required for all clients",
    "wan_encryption_mode_desc": "This determines when encryption will be used when streaming over the Internet. Encryption can reduce streaming performance, particularly on less powerful hosts and clients.",
    "dd_hdr_request_override": "HDR request override",
    "dd_snapshot_exclude_devices": "Exclude devices from snapshots",
    "frame_limiter_disable_vsync": "Disable VSYNC during streams",
    "frame_limiter_enable": "Enable frame limiter",
    "frame_limiter_provider": "Frame limiter provider",
    "lossless_scaling_path": "Lossless Scaling executable",
    "lossless_scaling_legacy_auto_detect_label": "Use legacy Lossless auto-detection",
    "lossless_scaling_legacy_auto_detect_desc": "Uses a timer-based auto-apply flow instead of the Lossless Scaling hotkey. Not recommended unless the hotkey method fails, because detection can be less reliable.",
    "rtss_frame_limit_type": "RTSS frame limit type",
    "rtss_install_path": "RTSS install path",
    "vibeshine_file_state": "Vibepollo state file",
    "virtual_display_layout": "Virtual display layout",
    "virtual_display_mode": "Virtual display mode",
    "dd_step_4": "Step 4",
    "adapter_name_placeholder_unix": "/dev/dri/renderD128",
    "audio_sink_placeholder_unix": "alsa_output.pci-0000_09_00.3.analog-stereo",
    "audio_sink_desc_unix": "The name of the audio sink used for Audio Loopback. If you do not specify this, the system default is used. On Linux, pulseaudio selects the default monitor device; on macOS, use a loopback device such as Soundflower or BlackHole.",
    "nvenc_section_desc": "Advanced NVIDIA NVENC tuning options. Change only if you need to address specific encoder behavior or performance issues.",
    "nvenc_intra_refresh": "Intra refresh",
    "nvenc_intra_refresh_desc": "Use gradual intra refresh instead of full IDR frames to smooth bitrate spikes. Disable if your client has decoder issues.",
    "global_state_cmd": "State Commands",
    "global_state_cmd_desc": "Configure commands that run when the stream state changes. These are saved with the rest of the server configuration and require a manual save.",
    "server_cmd": "Server Commands",
    "server_cmd_desc": "Configure a list of commands to be executed when called from client during streaming.",
    "enable_pairing": "Enable Pairing",
    "enable_pairing_desc": "Enable pairing for the Moonlight client. This allows the client to authenticate with the host and establish a secure connection.",
    "enable_discovery": "Enable Auto Discovery",
    "enable_discovery_desc": "When disabled, you'll need to manually enter host IP on the client to pair.",
    "enable_input_only_mode": "Enable Input Only Mode",
    "enable_input_only_mode_desc": "Add an Input Only app entry. When enabled, the app list will only show the current running app and the Input Only entry when streaming. The Input Only entry will not receive any image or audio. Useful for operating the desktop on TV or connecting peripherals which the TV doesn't support with a phone.",
    "forward_rumble": "Forward Rumble Messages",
    "forward_rumble_desc": "Forward Rumble Messages to clients",
    "hide_tray_controls": "Hide tray control options",
    "hide_tray_controls_desc": 'Do not show "Force Stop", "Restart" and "Quit" in tray menu.',
    "fallback_mode": "Fallback Display Mode",
    "fallback_mode_desc": "Vibepollo will use this mode when the client does not provide a mode or when the app is launched through the web UI. Format: [Width]x[Height]x[FPS]",
    "keep_sink_default": "Keep virtual sink as default",
    "keep_sink_default_desc": "Leave the virtual audio sink selected as the default playback device while streaming audio is active.",
    "auto_capture_sink": "Auto capture current sink",
    "auto_capture_sink_desc": "Automatically follow the current default audio sink instead of sticking to the originally selected device.",
    "limit_framerate": "Limit capture framerate",
    "limit_framerate_desc": "Limit the framerate being captured to client requested framerate. May not run at full framerate if vsync is enabled and display refreshrate does not match requested framerate. Could cause lag on some clients if disabled.",
    "envvar_compatibility_mode": "ENVVAR compatibility mode",
    "envvar_compatibility_mode_desc": "Enable compatibility mode for environment variables. This will modify the behavior of certain environment variables to be more compatible with older tools.",
    "ignore_encoder_probe_failure": "Ignore Encoder Probe Failure",
    "ignore_encoder_probe_failure_desc": "Allow streaming to continue even if probing for encoders fails. This may result in streaming failure if no encoder is available.",
    "legacy_ordering": "App ordering for legacy clients",
    "legacy_ordering_desc": "Enable ordering support workaround for legacy clients. Can cause issues with clients or scripts that can't handle UTF8 correctly. Artemis clients support this by default."
  },
  "index": {
    "description": "Vibepollo is a self-hosted game stream host for Moonlight.",
    "download": "Download",
    "view_notes": "Release Notes",
    "hide_notes": "Hide Notes",
    "installed_version_not_stable": "You are running a pre-release version of Vibepollo. You may experience bugs or other issues. Please report any issues you encounter. Thank you for helping to make Vibepollo a better software!",
    "loading_latest": "Loading latest release...",
    "new_pre_release": "A new Pre-Release Version is Available!",
    "new_stable": "A new Stable Version is Available!",
    "startup_errors": "<b>Attention!</b> Vibepollo detected these errors during startup. We <b>STRONGLY RECOMMEND</b> fixing them before streaming.",
    "version_dirty": "Thank you for helping to make Vibepollo a better software!",
    "version_latest": "You are running the latest version of Vibepollo",
    "version_ahead": "You are running a development build ahead of the latest release ({ahead} commits)",
    "version_behind": "Your build is {behind} commits behind the latest release; consider updating.",
    "version_compare_unknown": "Unable to determine commit distance to latest release.",
    "version_branch": "Branch: {branch} (commit {commit})",
    "view_logs": "Open Troubleshooting — Logs",
    "welcome": "Hello, Vibepollo!"
  },
  "resources": {
    "title": "Resources"
  },
  "navbar": {
    "applications": "Applications",
    "configuration": "Configuration",
    "home": "Home",
    "playnite": "Playnite",
    "password": "Change Password",
    "pin": "PIN",
    "theme_auto": "Auto",
    "theme_dark": "Dark",
    "theme_light": "Light",
    "toggle_theme": "Theme",
    "troubleshoot": "Troubleshooting",
    "logout": "Logout",
    "api_tokens": "API Tokens"
  },
  "webrtc": {
    "nav": "Stream",
    "title": "WebRTC Streaming",
    "subtitle": "Experimental browser streaming with higher latency and lower quality than native streaming.",
    "experimental_notice": "Experimental: expect higher latency and lower quality than native streaming.",
    "session_settings": "Session Settings",
    "client_profile": "Client profile",
    "client_profile_new": "New client",
    "client_profile_save": "Save profile",
    "client_profile_delete": "Delete",
    "client_profile_hint": "Save stream settings under a client name to reuse them later.",
    "client_name_placeholder": "Client name",
    "resolution": "Resolution",
    "framerate": "Framerate",
    "frame_pacing": "Frame pacing",
    "frame_pacing_desc": "Balance latency and smoothness by delaying early frames and dropping late ones.",
    "frame_pacing_slack": "Pacing slack (ms)",
    "frame_pacing_max_delay": "Max frame age (frames)",
    "encoding": "Encoding",
    "hdr": "HDR",
    "hdr_desc": "Requires HEVC or AV1 and an HDR-capable browser/decoder. Enabling HDR may switch codecs.",
    "hdr_unavailable": "HDR isn't available in this browser.",
    "bitrate": "Bitrate (kbps)",
    "mute_host_audio": "Mute host audio",
    "mute_host_audio_desc": "Silences audio playback on the host PC during streaming.",
    "select_game": "Select a Game",
    "search_placeholder": "Search applications...",
    "idle_game_selected": "Press Start to launch the selected game",
    "idle_no_selection": "Select a game or stream the desktop",
    "no_selection": "No game selected - will resume current session",
    "connect": "Start Streaming",
    "stream_desktop": "Stream Desktop",
    "resume": "Resume",
    "disconnect": "End Session",
    "terminate": "Terminate Session",
    "terminate_desc": "Ends streaming and closes the running app.",
    "terminate_confirm_title": "Terminate existing session?",
    "terminate_confirm_message": "A session is already running. Starting {app} will terminate the current session. Continue?",
    "terminate_confirm_action": "Terminate & Start",
    "terminate_confirm_app_fallback": "this app",
    "connecting": "Connecting...",
    "live_stats": "Live Statistics",
    "debug_panel": "Debug Information",
    "fullscreen": "Fullscreen",
    "connection_quality": "Connection Quality",
    "excellent": "Excellent",
    "good": "Good",
    "fair": "Fair",
    "poor": "Poor"
  },
  "clients": {
    "nav": "Clients",
    "title": "Client Management",
    "pair_title": "Pair Client",
    "pair_desc": "Enter the 4-digit PIN shown in Moonlight along with a friendly device name to pair this client.",
    "existing_title": "Paired Clients",
    "connected": "Connected",
    "last_seen": "Last seen: {time}",
    "last_seen_unknown": "Last seen: Unknown",
    "sort_label": "Sort by",
    "sort_recent": "Recent activity",
    "sort_name": "Name",
    "pairing": "Pairing...",
    "remove": "Remove",
    "hdr_profile_label": "HDR Color Profile",
    "hdr_profile_placeholder": "Automatic (no override)",
    "hdr_profile_auto": "Automatic (no override)",
    "hdr_profile_desc": "Install and run the Windows HDR Calibration app from the Microsoft Store while this client is streaming, save the profile, then come back here (Clients tab → HDR Color Profile) and select the profile you saved. Profiles are loaded from the system color profile directory and sorted by newest first.",
    "hdr_profile_load_failed": "Failed to load HDR color profiles.",
    "disconnect_success": "Client disconnected.",
    "disconnect_failed": "Failed to disconnect client.",
    "update_success": "Client updated.",
    "update_failed": "Failed to update client.",
    "confirm_remove_title": "Remove Client",
    "confirm_remove_message": "Are you sure you want to remove this client? It will need to be re-paired.",
    "confirm_remove_title_named": 'Remove Client "{name}"?',
    "confirm_remove_message_named": "This will unpair {name} from Vibepollo. They will need to pair again to connect.",
    "confirm_unpair_all_title": "Unpair All Clients",
    "confirm_unpair_all_message": "Are you sure you want to unpair all clients? They will all need to be re-paired.",
    "confirm_unpair_all_message_count": "This will unpair all {count} client(s). They will all need to pair again to connect."
  },
  "playnite": {
    "title": "Playnite Integration",
    "desc": "Vibepollo can sync your Playnite library so your installed games appear automatically. First, install Playnite, run it, and configure it to start with Windows. Then install the Vibepollo plugin below to enable the integration.",
    "only_windows": "Playnite integration is available on Windows only.",
    "status_title": "Plugin Status",
    "status_overall": "Status",
    "integration_enabled": "Integration Enabled",
    "status_installed": "Plugin Installed",
    "status_active": "Connected",
    "status_connected": "Connected",
    "status_disabled": "Disabled",
    "status_waiting": "Limited",
    "limited_tooltip": "Games cannot be auto-synced while Playnite is closed. Existing games added to Vibepollo will still work. Once you launch Playnite, syncing resumes automatically.",
    "refresh_status": "Refresh Status",
    "maintenance_title": "Maintenance",
    "copy_path": "Copy",
    "copied_path": "Copied path to clipboard.",
    "repair_button": "Repair Plugin",
    "reset_defaults": "Reset to defaults",
    "reset_done": "Section reset to defaults.",
    "status_uninstalled": "Uninstalled",
    "status_not_running": "Playnite not running",
    "status_not_running_unknown": "Playnite not running — plugin status unknown",
    "status_unknown": "Playnite not detected",
    "selects_disabled_hint": "Cannot modify without Playnite connectivity. Start Playnite to enable this.",
    "install_button": "Install Vibepollo Plugin",
    "reinstall_button": "Reinstall Vibepollo Plugin",
    "upgrade_button": "Upgrade Plugin",
    "uninstall_button": "Uninstall Plugin",
    "uninstall_success": "Plugin uninstalled successfully.",
    "uninstall_error": "Failed to uninstall plugin.",
    "uninstall_requires_restart": "Uninstalling the Playnite plugin may require restarting Playnite. Continue?",
    "launch_button": "Launch Playnite",
    "setup_integration": "Setup Playnite Integration",
    "install_success": "Plugin installed successfully.",
    "install_error": "Failed to install plugin.",
    "install_requires_restart": "Installing or updating the Playnite plugin requires restarting Playnite. Continue?",
    "settings_title": "Settings",
    "plugin_version": "Plugin Version",
    "plugin_outdated": "A newer Playnite plugin is available. Installed: v{installed}, Latest: v{latest}.",
    "auto_sync": "Synchronize recently played games automatically",
    "sync_all_installed": "Synchronize every installed Playnite game",
    "sync_all_installed_desc": "Adds every installed Playnite game to Vibepollo, alongside recent and category selections.",
    "enable_autosync_hint": "Enable synchronization to edit these settings.",
    "recent_games": "Recent games to sync",
    "recent_games_desc": "Maximum number of recent games to auto-sync. 0 = disable recent syncing.",
    "recent_max_age_days": "Recent activity window (days)",
    "recent_max_age_days_desc": "A game counts as recent only if played in the last N days. 0 = ignore play date.",
    "delete_after_days": "Auto-delete unplayed after (days)",
    "delete_after_days_desc": "Remove auto-synced games that haven’t been launched within N days of being added. 0 = never remove.",
    "cleanup_policy": "Cleanup Policy",
    "policy_keep_until_replaced": "Keep until replaced (default)",
    "policy_prune_immediately": "Always prune games that no longer qualify (may leave empty slots)",
    "policy_explainer": "Choose how Vibepollo removes old auto-synced games.",
    "sync_categories": "Categories to sync",
    "sync_categories_help": "Pick Playnite categories sync, which will add all games in that category regardless if they are recently played or not. This will not consume any recently played slot counts, it is simply appended to them.",
    "sync_plugins": "Include library plugins",
    "sync_plugins_help": "Auto-sync every installed game provided by the selected library plugins.",
    "exclude_categories": "Exclude categories",
    "exclude_categories_help": "Games tagged with these categories will never be auto-synced.",
    "exclude_plugins": "Exclude library plugins",
    "exclude_plugins_help": "Games imported from these plugins will never be auto-synced.",
    "categories_placeholder": "None (do not synchronize any categories)",
    "plugins_placeholder": "Pick library plugins to exclude",
    "plugins_include_placeholder": "Include games from these plugins",
    "remove_uninstalled": "Remove uninstalled games automatically",
    "remove_uninstalled_desc": "When enabled, Vibepollo removes auto-synced games as soon as they are uninstalled in Playnite.",
    "extensions_dir": "Extensions directory",
    "install_dir": "Installation path override",
    "save_success": "Settings saved.",
    "force_sync": "Force Sync Now",
    "focus_attempts": "Auto-focus attempts",
    "focus_attempts_help": "Times to try bringing Playnite windows to foreground when launching.",
    "focus_timeout_secs": "Auto-focus timeout window (seconds)",
    "focus_timeout_secs_help": "How long auto-focus runs while re-applying focus (0 to disable).",
    "focus_exit_on_first": "Stop auto-focus after first successful focus",
    "focus_exit_on_first_help": "Stop auto-focus after the first success; otherwise, re-apply until attempts or timeout elapse.",
    "diagnostic_not_installed": "Playnite plugin is not installed in the Extensions directory.",
    "diagnostic_not_running": "Playnite is not running. Launch it to resume syncing.",
    "section_auto_sync": "Auto-sync",
    "section_launch_behavior": "Launch Behavior",
    "section_exclusions_filters": "Exclusions & Filters",
    "exclusions_override_note": "Exclusions override categories.",
    "exclude_games": "Exclude games from auto-sync",
    "exclude_games_desc": "Selected games will not be auto-synced from Playnite.",
    "exclude_games_table_title": "Excluded Games",
    "table_game": "Game",
    "table_actions": "Actions",
    "add_exclusions": "Add Exclusions",
    "add_exclusions_placeholder": "Search and select games",
    "add_exclusions_hint": "Pick one or more games to exclude from auto-sync.",
    "games_loaded_live": "Loaded from Playnite",
    "games_loaded_cache": "Loaded from cache",
    "games_not_available": "No games available. Start Playnite to fetch games.",
    "games_unavailable_indicator": "Cannot retrieve Playnite games right now. Start Playnite to load games.",
    "games_cached_indicator": "Showing cached Playnite games due to limited connectivity.",
    "add_exclusion_placeholder": "Add games to exclusions",
    "add_to_exclusions": "Add to exclusions",
    "delete_selected": "Delete selected",
    "no_exclusions": "No excluded games.",
    "exclusions_list_hint": "Showing your current exclusion list.",
    "unknown_game": "Unknown",
    "delete_all_autosync": "Delete All Playnite Auto-Sync Apps",
    "delete_autosync_title": "Delete auto-synced games?",
    "delete_autosync_body": "This removes every Playnite-managed auto-sync entry from the Applications list. Apps added manually are not affected.",
    "delete_autosync_success": "Removed auto-synced Playnite games.",
    "delete_autosync_error": "Failed to delete auto-synced Playnite games.",
    "summary_recent_limit": "Up to {n} most-recently played games will be auto-synced.",
    "summary_activity_window": "Activity window: last {days} days.",
    "summary_activity_ignored": "Activity window is ignored.",
    "summary_keep_until_replaced": "Games stay until a newer game replaces them.",
    "summary_prune_immediately": "Games are pruned when they no longer qualify.",
    "summary_all_installed": "All installed Playnite games are kept in Vibepollo.",
    "summary_plugin_include": "Includes all games from {count} selected library plugins.",
    "summary_remove_uninstalled_on": "Uninstalled games are removed automatically.",
    "summary_remove_uninstalled_off": "Uninstalled games remain until you remove them manually.",
    "summary_delete_after": "Also remove games never launched after {days} days.",
    "summary_excluded_categories": "Excluded categories: {categories}.",
    "summary_excluded_categories_more": "Excluded categories: {categories} (+{count} more)."
  },
  "password": {
    "confirm_password": "Confirm Password",
    "current_creds": "Current Credentials",
    "new_creds": "New Credentials",
    "new_username_desc": "If not specified, the username will not change",
    "password_change": "Password Change",
    "success_msg": "Password has been changed successfully! This page will reload soon, your browser will ask you for the new credentials."
  },
  "pin": {
    "device_name": "Device Name",
    "display_mode_override": "Display mode override",
    "display_mode_override_desc": "Force Vibepollo to use this resolution and refresh rate for this client (format: 1920x1080x60). Leave blank to use the client's request.",
    "pair_failure": "Pairing Failed: Check if the PIN is typed correctly",
    "pair_success": "Success! Please check Moonlight to continue",
    "pin_pairing": "PIN Pairing",
    "send": "Pair",
    "warning_msg": "Make sure you have access to the client you are pairing with. This software can give total control to your computer, so be careful!"
  },
  "permissions": {
    "group_action": "Action",
    "group_operation": "Operation",
    "group_input": "Input",
    "list": "List Apps",
    "view": "View Streams",
    "launch": "Launch Apps",
    "clipboard_set": "Write Clipboard",
    "clipboard_read": "Read Clipboard",
    "file_upload": "Upload Files",
    "file_dwnload": "Download Files",
    "server_cmd": "Server Commands",
    "input_controller": "Controller Input",
    "input_touch": "Touch Input",
    "input_pen": "Pen Input",
    "input_mouse": "Mouse Input",
    "input_kbd": "Keyboard Input"
  },
  "resource_card": {
    "github_discussions": "GitHub Discussions",
    "legal": "Legal",
    "legal_desc": "By continuing to use this software you agree to the terms and conditions in the following documents.",
    "license": "License",
    "resources": "Resources",
    "discord_desc": "Join the community",
    "resources_desc": "Resources for Vibepollo!",
    "third_party_notice": "Third Party Notice"
  },
  "troubleshooting": {
    "dd_reset": "Reset Persistent Display Device Settings",
    "dd_reset_desc": "If Vibepollo is stuck trying to restore the changed display device settings, you can reset the settings and proceed to restore the display state manually.",
    "dd_reset_error": "Error while resetting persistence!",
    "dd_reset_success": "Success resetting persistence!",
    "dd_export_golden": "Export Golden Display Restore",
    "dd_export_golden_desc": "Create a backup of your current Windows display layout. This backup is used to safely restore your monitor if Windows doesn’t keep your settings.",
    "dd_export_golden_success": "Exported golden display snapshot.",
    "dd_export_golden_error": "Failed to export golden display snapshot.",
    "dd_golden_title": "Golden Display Restore",
    "dd_golden_help": "Save a snapshot of your current Windows display layout (which screens are on, primary display, resolution, HDR). Vibepollo uses this if your monitor settings don’t stick — for example after a reboot or at the sign‑in screen. This reduces the chance of coming back to a PC with the primary display still turned off.",
    "dd_golden_status_present": "Snapshot present",
    "dd_golden_status_missing": "No snapshot found",
    "dd_golden_create": "Create Snapshot",
    "dd_golden_recreate": "Recreate Snapshot",
    "dd_golden_delete": "Delete Snapshot",
    "dd_golden_deleted": "Deleted golden display snapshot.",
    "dd_golden_delete_error": "Failed to delete golden display snapshot.",
    "dd_golden_refresh": "Check Again",
    "force_close": "Force Close",
    "force_close_desc": "If Moonlight complains about an app currently running, force closing the app should fix the issue.",
    "force_close_error": "Error while closing Application",
    "force_close_success": "Application Closed Successfully!",
    "logs": "Logs",
    "logs_desc": "See the logs uploaded by Vibepollo",
    "logs_source": "Log source",
    "logs_source_sunshine": "Vibepollo",
    "logs_source_display_helper": "Display helper",
    "logs_source_playnite": "Playnite",
    "logs_source_playnite_launcher": "Playnite launcher",
    "logs_source_wgc": "WGC helper",
    "logs_find": "Find...",
    "search_matches": "{count} matches",
    "search_no_matches": "No matches",
    "search_pending": "Searching...",
    "search_prev": "Prev",
    "search_next": "Next",
    "search_clear": "Clear",
    "search_results": "Results",
    "search_context": "{count} lines of context",
    "search_line": "Line",
    "wrap": "Wrap",
    "no_wrap": "No Wrap",
    "new_logs_available": "New logs available — jump to latest",
    "jump_to_latest": "Jump to latest logs",
    "export_logs": "Export Logs",
    "collect_playnite_logs": "Export Logs",
    "collect_playnite_logs_desc": "Export Vibepollo log, Playnite/plugin logs, and display-helper logs.",
    "export_crash_bundle": "Export Crash Bundle",
    "export_crash_bundle_preparing": "Preparing Crash Bundle...",
    "export_crash_bundle_desc": "Download logs along with the most recent Vibepollo crash dump.",
    "restart_sunshine": "Restart Vibepollo",
    "restart_sunshine_desc": "If Vibepollo isn't working properly, you can try restarting it. This will terminate any running sessions.",
    "restart_sunshine_success": "Vibepollo is restarting",
    "troubleshooting": "Troubleshooting",
    "unpair_all": "Unpair All",
    "unpair_all_error": "Error while unpairing",
    "unpair_all_success": "All devices unpaired.",
    "unpair_desc": "Remove your paired devices. Individually unpaired devices with an active session will remain connected, but cannot start or resume a session.",
    "unpair_single_no_devices": "There are no paired devices.",
    "unpair_single_success": "However, the device(s) may still be in an active session. Use the 'Force Close' button above to end any open sessions.",
    "unpair_single_unknown": "Unknown Client",
    "unpair_title": "Unpair Devices"
  },
  "welcome": {
    "confirm_password": "Confirm password",
    "create_creds": "Before Getting Started, we need you to make a new username and password for accessing the Web UI.",
    "create_creds_alert": "The credentials below are needed to access Vibepollo's Web UI. Keep them safe, since you will never see them again!",
    "greeting": "Welcome to Vibepollo!",
    "login": "Login",
    "welcome_success": "This page will reload soon, your browser will ask you for the new credentials"
  },
  "auth": {
    "title": "API Token Management",
    "generate_new_token": "Generate New Token",
    "select_api_path": "Select API Path",
    "remove": "Remove",
    "add_scope": "Add Scope",
    "generate_token": "Generate Token",
    "token_success": "Success! Copy this token now as you will not see it again:",
    "active_tokens": "Active Tokens",
    "hash": "Hash",
    "username": "Username",
    "created": "Created",
    "scopes": "Scopes",
    "no_active_tokens": "No active tokens.",
    "revoke": "Revoke",
    "test_api_token": "Test API Token",
    "api_path_get_only": "API Path (GET requests only)",
    "select_api_path_to_test": "Select API Path to Test",
    "token": "Token",
    "paste_token_here": "Paste API token here",
    "test_token": "Test Token",
    "result": "Result:",
    "please_specify_scope": "Please specify at least one path and corresponding method(s).",
    "failed_to_generate_token": "Failed to generate token.",
    "request_failed": "Request failed",
    "confirm_revoke": "Are you sure you want to revoke this token? This action cannot be undone.",
    "confirm_revoke_title": "Revoke API Token?",
    "confirm_revoke_message_hash": "Revoke token {hash}? This immediately disables the token and cannot be undone.",
    "failed_to_revoke_token": "Failed to revoke token.",
    "error_revoking_token": "Error revoking token",
    "select_api_path_and_token": "Please select an API path and provide a token.",
    "login_title": "Login",
    "login_sign_in": "Sign In",
    "login_loading": "Loading...",
    "login_failed": "Login failed",
    "login_network_error": "Network error. Please try again.",
    "login_success": "Login successful! Redirecting...",
    "remember_me_label": "Stay signed in on this device",
    "password": "Password",
    "create_first_user": "Create First User",
    "first_user_subtitle": "Initial administrator account",
    "new_password": "New Password",
    "confirm_new_password": "Confirm New Password",
    "password_mismatch": "Passwords do not match",
    "create_user": "Create User",
    "creating_user": "Creating...",
    "create_user_failed": "Failed to create user",
    "user_created": "User created successfully",
    "generate_token_help": "Select one or more API routes and allowed HTTP methods to embed in the new token.",
    "selected_scopes": "Selected Scopes",
    "copy_token": "Copy Token",
    "token_copied": "Copied!",
    "refresh": "Refresh",
    "search_tokens": "Search by hash, user, or path...",
    "no_matching_tokens": "No tokens match your search.",
    "generate_disabled_hint": "Add at least one scope to generate a token.",
    "testing_help": "Use this form to validate an existing token against a read-only endpoint.",
    "loading": "Loading...",
    "copy_hash": "Copy",
    "hash_copied": "Copied!",
    "sort_field": "Sort",
    "sort_direction": "Direction",
    "asc": "Asc",
    "desc": "Desc",
    "logout_success": "You have been securely logged out.",
    "logout_refresh_hint": "You may now close this tab or refresh the page to sign back in.",
    "logout_refresh_button": "Refresh to Sign In",
    "sessions_heading": "Trusted Devices",
    "sessions_description": "Devices with active Vibepollo sessions. Remove entries to sign them out remotely.",
    "sessions_device": "Device",
    "sessions_activity": "Activity",
    "sessions_status": "Status",
    "sessions_actions": "Actions",
    "sessions_remember_flag": "Remembered",
    "sessions_session_flag": "Session",
    "sessions_current_device": "This device",
    "sessions_revoke": "Revoke",
    "sessions_logout": "Log out",
    "sessions_revoke_title": "Remove session?",
    "sessions_revoke_message": "Are you sure you want to revoke access for {device}?",
    "sessions_revoke_success": "Session revoked",
    "sessions_revoke_failed": "Failed to revoke session",
    "sessions_cancel": "Cancel",
    "sessions_empty": "No trusted devices yet.",
    "sessions_load_failed": "Failed to load sessions.",
    "sessions_last_seen": "Last seen: {time}",
    "sessions_expires": "Expires: {time}",
    "sessions_time_unknown": "Unknown",
    "sessions_unknown_device": "Unknown device",
    "sessions_unknown_address": "Unknown address"
  },
  "rtss": {
    "tab": "Frame Limiter",
    "desc": "Vibepollo can apply a global frame limit via RTSS (recommended) or NVIDIA Control Panel (experimental), then restores the original driver settings when streaming stops.",
    "frame_limiter_disable_vsync": "Force VSYNC off while streaming",
    "frame_limiter_disable_vsync_desc": "When enabled, Vibepollo sets the NVIDIA driver VSYNC setting to Off for the duration of the stream and restores the previous value afterward. If NVIDIA overrides are unavailable, Vibepollo forces the display to run at its highest refresh rate as a best-effort fallback.",
    "frame_limiter_fps_limit": "Frame limiter FPS limit",
    "frame_limiter_fps_limit_desc": "Optional global FPS limit for the frame limiter. Set to 0 to use the stream's requested FPS.",
    "provider_label": "Frame limiter provider",
    "provider_desc": "Auto prefers RTSS whenever it is detected and falls back to the NVIDIA Control Panel limiter if needed. NVIDIA's limiter is not recommended because it cannot guarantee perfect frame pacing.",
    "provider_auto": "Auto (prefer RTSS)",
    "provider_nvcp": "NVIDIA Control Panel (not recommended)",
    "provider_rtss": "RTSS (recommended)",
    "provider_none": "None",
    "provider_unknown": "Unknown",
    "status_detected": "RTSS detected and ready",
    "status_not_detected": "RTSS not detected",
    "status_install_not_found": "Install not found at {path}",
    "status_hooks_missing": "Hooks DLL missing",
    "status_profile_missing": "RTSS configuration missing",
    "status_limiter_disabled": "(limiter disabled in settings)",
    "status_configured_provider": "Configured provider: {provider}",
    "status_active_provider": "Active provider: {provider}",
    "status_nvcp_detected": "NVIDIA Control Panel detected (not recommended)",
    "status_nvcp_not_detected": "NVIDIA Control Panel not detected",
    "status_nvcp_unavailable": "NVIDIA Control Panel integration unavailable",
    "status_unknown": "Unable to determine frame limiter status",
    "refresh": "Refresh",
    "resolved_path": "Resolved path:",
    "attempted_path": "Attempted path:",
    "error_query_status": "Failed to query RTSS status",
    "install_path": "RTSS install path",
    "install_path_placeholder": "C:\\Program Files (x86)\\RivaTuner Statistics Server",
    "install_path_desc": "Root install folder (leave blank to auto-detect under Program Files / Program Files (x86)).",
    "enable_frame_limiter": "Enable frame limiter",
    "enable_frame_limiter_desc": "When enabled, Vibepollo applies a global frame limit using your chosen provider for the duration of each stream, then restores the previous driver setting afterward.",
    "sync_limiter_mode": "SyncLimiter mode",
    "sync_limiter_desc": "Advanced users only. Vibepollo mirrors this into RTSS. See the comparison below before changing it.",
    "sync_limiter_do_not_change": "Do not change",
    "sync_limiter_async": "Async (recommended, eliminates microstuttering)",
    "sync_limiter_front_edge": "Front edge sync",
    "sync_limiter_back_edge": "Back edge sync",
    "sync_limiter_reflex": "NVIDIA Reflex (may cause microstuttering)",
    "sync_limiter_help_heading": "SyncLimiter modes overview",
    "sync_limiter_help_blurb": "Async is recommended. It adds a small amount of latency but all but removes microstuttering, which is usually more noticeable to viewers.",
    "sync_limiter_help_mode": "Mode",
    "sync_limiter_help_latency": "Added Latency (typical)",
    "sync_limiter_help_stutter": "Microstutter / Pacing",
    "sync_limiter_help_advantages": "Advantages",
    "sync_limiter_help_disadvantages": "Disadvantages",
    "sync_limiter_help_usage": "Best Use Case",
    "sync_limiter_async_short": "Async",
    "sync_limiter_async_latency": "+1-2 ms vs Reflex",
    "sync_limiter_async_stutter": "Practically eliminated",
    "sync_limiter_async_advantages": "Stable timing regardless of refresh alignment; very smooth at odd FPS or Hz combos",
    "sync_limiter_async_disadvantages": "Slightly higher latency than Front Edge or Reflex",
    "sync_limiter_async_use": "General use where smoothness matters more than absolute latency",
    "sync_limiter_front_short": "Front edge",
    "sync_limiter_front_latency": "Lowest possible (~0 ms when GPU-bound; adds headroom otherwise)",
    "sync_limiter_front_stutter": "Can reintroduce judder if FPS is not a divisor of refresh",
    "sync_limiter_front_advantages": "Absolute lowest latency if FPS divides evenly into refresh; required for Scanline Sync",
    "sync_limiter_front_disadvantages": "Adds latency when CPU-bound because finished frames wait; fragile pacing at mismatched caps",
    "sync_limiter_front_use": "DLSS 3 / FSR 3 frame generation capture; enable Frame Gen Limiter Fix per game in Applications when only some titles need RTSS Front Edge Sync",
    "sync_limiter_back_short": "Back edge",
    "sync_limiter_back_latency": "Moderate (+2-3 ms)",
    "sync_limiter_back_stutter": "Reduced tearing; may stutter when frametimes spike",
    "sync_limiter_back_advantages": "Scan-aligned pacing, smoother than Front Edge at non-divisor FPS",
    "sync_limiter_back_disadvantages": "Slightly higher latency; not as low as Reflex or Async",
    "sync_limiter_back_use": "Displays or games that behave better with vsync-style even pacing",
    "sync_limiter_reflex_short": "NVIDIA Reflex",
    "sync_limiter_reflex_latency": "Variable; depends on driver and game",
    "sync_limiter_reflex_stutter": "Often unreliable; may introduce microstutter if the game is not optimized",
    "sync_limiter_reflex_advantages": "Can reduce latency in Reflex-optimized titles; integrates with DLSS 3 Frame Generation",
    "sync_limiter_reflex_disadvantages": "Requires explicit game support; inconsistent behavior; microstutter issues are common",
    "sync_limiter_reflex_use": "Only worth testing when Reflex is properly supported and tuned",
    "recommend_title": "RTSS recommended",
    "recommend_copy": "RTSS delivers the smoothest streaming experience. Install it if missing; NVIDIA's frame limiter is not recommended because it cannot guarantee perfect frame pacing.",
    "status_bootstrap": "RTSS detected; Vibepollo will refresh RTSS configuration on the next stream",
    "status_bootstrap_hint": "Vibepollo manages RTSS configuration automatically; no action needed.",
    "status_autolaunch_hint": "Vibepollo will launch RTSS automatically when streaming starts."
  },
  "frameLimiter": {
    "stepTitle": "Frame pacing and limiter",
    "enable": "Enable frame limiter",
    "enableHint": "Vibepollo applies the selected limiter provider at stream start and restores the previous driver setting when the stream ends.",
    "providerLabel": "Limiter provider",
    "providerHint": "Auto prefers RTSS whenever it is available and falls back to the NVIDIA Control Panel limiter if needed. NVIDIA's limiter is not recommended because it cannot guarantee perfect frame pacing.",
    "limitLabel": "FPS limit override",
    "limitHint": "Optional global FPS limit for NVIDIA or RTSS. Set to 0 to use the stream's requested FPS.",
    "limitPlaceholder": "0",
    "provider": {
      "auto": "Auto (prefer RTSS)",
      "nvcp": "NVIDIA Control Panel (not recommended)",
      "rtss": "RTSS (recommended)",
      "none": "None"
    },
    "syncLimiter": {
      "keep": "Do not change",
      "async": "Async",
      "front": "Front edge sync",
      "back": "Back edge sync",
      "reflex": "NVIDIA Reflex"
    },
    "vsyncUllmLabel": "Disable VSYNC while streaming",
    "vsyncUllmForcedByDummyPlug": "Forced on because the dummy plug HDR workaround requires VSYNC to be off for 10-bit output.",
    "vsyncUllmHintNv": "Vibepollo will force the NVIDIA driver VSYNC setting to Off during the stream and restore it afterward. Use this if you globally enable VSYNC but want Vibepollo sessions without it.",
    "vsyncUllmHintGeneric": "Vibepollo will run the display at its highest available refresh rate during the stream as a best-effort VSYNC workaround. NVIDIA overrides are not available on this system.",
    "rtssPath": "RTSS install path",
    "rtssPathPlaceholder": "C:\\Program Files (x86)\\RivaTuner Statistics Server",
    "rtssPathHint": "Root install folder (leave blank to auto-detect under Program Files / Program Files (x86)).",
    "syncLimiterLabel": "RTSS SyncLimiter mode",
    "syncLimiterHint": "Optional: adjust RTSS SyncLimiter when Vibepollo uses RTSS to limit framerate.",
    "rtssMissing": "RTSS was not detected. Install RTSS or adjust the install path to use it as a limiter.",
    "status": {
      "unknown": "Frame limiter status unavailable.",
      "error": "Failed to query frame limiter status.",
      "configuredLabel": "Configured provider",
      "activeLabel": "Active provider",
      "configured": "Configured provider: {provider}",
      "active": "Active provider: {provider}",
      "limiterDisabled": "Frame limiter disabled.",
      "nvcpDetected": "NVIDIA Control Panel detected (not recommended).",
      "nvcpNotDetected": "NVIDIA Control Panel not detected.",
      "nvcpUnavailable": "NVIDIA Control Panel integration unavailable.",
      "rtssDetected": "RTSS detected and ready.",
      "rtssNotDetected": "RTSS not detected.",
      "none": "None",
      "rtssBootstrap": "RTSS detected; Vibepollo will refresh RTSS configuration when streaming starts.",
      "rtssBootstrapHint": "Vibepollo manages RTSS configuration automatically; no action needed.",
      "rtssAutolaunchHint": "Vibepollo will launch RTSS automatically when a stream begins."
    },
    "actions": {
      "refresh": "Refresh"
    },
    "noticeTitle": "RTSS recommended",
    "noticeCopy": "RTSS offers the most stable frame pacing. Vibepollo will use it automatically when available; NVIDIA's limiter is not recommended because it cannot guarantee perfect frame pacing."
  }
};
const rememberStorageKey = "sunshine.auth.remember";
function readRememberPreference() {
  if (typeof window === "undefined")
    return false;
  try {
    return window.localStorage.getItem(rememberStorageKey) === "1";
  } catch {
    return false;
  }
}
const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const ready = ref(false);
  const _listeners = [];
  const showLoginModal = ref(false);
  const credentialsConfigured = ref(true);
  const serverResponded = ref(false);
  const loggingIn = ref(false);
  const logoutInitiated = ref(false);
  const _lastAuthSuccess = ref(0);
  const sessions = ref([]);
  const sessionsLoading = ref(false);
  const sessionsError = ref("");
  function setAuthenticated(v) {
    const changed = v !== isAuthenticated.value;
    if (changed) {
      const becameAuthed = !isAuthenticated.value && v;
      isAuthenticated.value = v;
      if (becameAuthed) {
        _lastAuthSuccess.value = Date.now();
        logoutInitiated.value = false;
        fetchSessions().catch(() => {
        });
        for (const cb of _listeners) {
          try {
            cb();
          } catch (e) {
            console.error("auth listener error", e);
          }
        }
      }
      if (!v) {
        sessions.value = [];
        sessionsError.value = "";
      }
    }
    if (v && showLoginModal.value) {
      showLoginModal.value = false;
    }
  }
  function initiateLogout() {
    logoutInitiated.value = true;
    setAuthenticated(false);
    showLoginModal.value = false;
  }
  async function init() {
    if (ready.value)
      return;
    const preferRemember = readRememberPreference();
    const fetchStatus = async () => {
      try {
        const res = await http.get("/api/auth/status", {
          validateStatus: () => true
        });
        if (res && res.status === 200 && res.data) {
          return res.data;
        }
      } catch {
      }
      return null;
    };
    const applyStatus = (payload) => {
      if (!payload)
        return false;
      serverResponded.value = true;
      if (typeof payload.credentials_configured === "boolean") {
        credentialsConfigured.value = payload.credentials_configured;
      }
      if (payload.authenticated || !payload.login_required) {
        setAuthenticated(true);
      }
      return !!(payload.login_required && !payload.authenticated);
    };
    try {
      let status = await fetchStatus();
      let requiresLogin = applyStatus(status);
      if (requiresLogin && !logoutInitiated.value) {
        const refreshed = await refreshSession();
        if (refreshed) {
          status = await fetchStatus();
          requiresLogin = applyStatus(status);
        }
      }
      if (requiresLogin && preferRemember && !logoutInitiated.value) {
        const retryDelays = [250, 600];
        for (const delay of retryDelays) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          status = await fetchStatus();
          requiresLogin = applyStatus(status);
          if (!requiresLogin) {
            break;
          }
        }
      }
      if (requiresLogin && !logoutInitiated.value) {
        showLoginModal.value = true;
      }
    } finally {
      ready.value = true;
    }
  }
  function onLogin(cb) {
    if (typeof cb !== "function")
      return () => {
      };
    _listeners.push(cb);
    if (isAuthenticated.value)
      setTimeout(() => {
        try {
          cb();
        } catch {
        }
      }, 0);
    return () => {
      const idx = _listeners.indexOf(cb);
      if (idx !== -1)
        _listeners.splice(idx, 1);
    };
  }
  function requireLogin(options) {
    const bypassGuard = (options == null ? void 0 : options.bypassLogoutGuard) === true;
    if (logoutInitiated.value && !bypassGuard)
      return;
    if (isAuthenticated.value)
      return;
    if (bypassGuard)
      logoutInitiated.value = false;
    showLoginModal.value = true;
  }
  function hideLogin() {
    showLoginModal.value = false;
  }
  function setCredentialsConfigured(v) {
    credentialsConfigured.value = !!v;
  }
  async function waitForAuthentication() {
    while (!isAuthenticated.value) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  function currentSessionId() {
    var _a;
    return (_a = sessions.value.find((s) => s.current)) == null ? void 0 : _a.id;
  }
  async function fetchSessions() {
    if (!isAuthenticated.value)
      return;
    sessionsLoading.value = true;
    sessionsError.value = "";
    try {
      const res = await http.get("/api/auth/sessions", { validateStatus: () => true });
      if (res.status === 200 && res.data && res.data.status && Array.isArray(res.data.sessions)) {
        sessions.value = res.data.sessions;
        sessionsError.value = "";
        return;
      }
      sessionsError.value = res.data && res.data.error ? res.data.error : "error";
    } catch (e) {
      sessionsError.value = "error";
    } finally {
      sessionsLoading.value = false;
    }
  }
  async function revokeSession(id) {
    if (!id)
      return false;
    try {
      const res = await http.delete(`/api/auth/sessions/${id}`, { validateStatus: () => true });
      if (res.status === 200 && res.data && res.data.status) {
        sessions.value = sessions.value.filter((session) => session.id !== id);
        if (currentSessionId() === id) {
          setAuthenticated(false);
          requireLogin({ bypassLogoutGuard: true });
        }
        if (isAuthenticated.value) {
          await fetchSessions();
        }
        return true;
      }
    } catch (e) {
    }
    return false;
  }
  return {
    isAuthenticated,
    ready,
    serverResponded,
    init,
    setAuthenticated,
    initiateLogout,
    onLogin,
    showLoginModal,
    requireLogin,
    hideLogin,
    credentialsConfigured,
    setCredentialsConfigured,
    waitForAuthentication,
    loggingIn,
    logoutInitiated,
    sessions,
    sessionsLoading,
    sessionsError,
    fetchSessions,
    revokeSession,
    currentSessionId,
    _lastAuthSuccess
  };
});
const SESSION_KEY = "__jujo_session";
const REFRESH_KEY = "__jujo_refresh";
const REMEMBER_KEY = "sunshine.auth.remember";
let _sessionToken = null;
let _refreshToken = null;
function loadTokens() {
  try {
    _sessionToken = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    _refreshToken = sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
  } catch {
  }
}
function saveTokens(session, refresh, remember = false) {
  _sessionToken = session;
  if (refresh !== void 0)
    _refreshToken = refresh;
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, session);
      if (remember) {
        localStorage.setItem(SESSION_KEY, session);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
    if (refresh !== void 0) {
      sessionStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(REFRESH_KEY);
      if (refresh) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(REFRESH_KEY, refresh);
      }
    }
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, "1");
    } else if (refresh !== void 0) {
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
  }
}
function clearSessionTokens() {
  saveTokens(null, null, false);
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
  }
}
function applyLoginResponse(data, rememberOverride) {
  const sessionToken = data == null ? void 0 : data.token;
  const refreshToken = (data == null ? void 0 : data.refresh_token) ?? void 0;
  const remember = rememberOverride ?? (data == null ? void 0 : data.remember_me) === true;
  if (sessionToken) {
    saveTokens(sessionToken, refreshToken ?? null, remember);
  }
}
loadTokens();
const http = axios.create({
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest"
  }
});
let authInitialized = false;
let refreshPromise = null;
async function refreshSession() {
  if (refreshPromise)
    return refreshPromise;
  const auth = useAuthStore();
  const cfg = {
    validateStatus: () => true,
    headers: {
      "X-Skip-Auth-Refresh": "1"
    }
  };
  cfg.__skipAuthRefresh = true;
  if (_refreshToken) {
    cfg.headers["Authorization"] = `Refresh ${_refreshToken}`;
  }
  refreshPromise = http.post("/api/auth/refresh", {}, cfg).then((res) => {
    if ((res == null ? void 0 : res.status) === 200 && res.data && res.data.status) {
      applyLoginResponse(res.data);
      auth.setAuthenticated(true);
      return true;
    }
    clearSessionTokens();
    auth.setAuthenticated(false);
    return false;
  }).catch(() => {
    clearSessionTokens();
    return false;
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
function initAuthHandling() {
  if (authInitialized)
    return;
  authInitialized = true;
  const auth = useAuthStore();
  http.interceptors.request.use((config) => {
    try {
      const urlRaw = String(config.url || "");
      let path = urlRaw;
      try {
        const u = new URL(urlRaw, window.location.origin);
        path = u.pathname;
      } catch {
      }
      if (auth.logoutInitiated) {
        const err = new Error("Request blocked: user logged out");
        err.code = "ERR_CANCELED";
        return Promise.reject(err);
      }
      const allowWhenLoggedOut = /(\s*\/api\/auth\/(login|status|refresh)\b|\s*\/api\/password\b|\s*\/api\/configLocale\b)/.test(
        path
      );
      const isCredentialExchange = /(\s*\/api\/auth\/(login|refresh)\b|\s*\/api\/password\b)/.test(path);
      const allowUnauthenticated = (config == null ? void 0 : config.__allowUnauthenticated) === true;
      if (!auth.isAuthenticated && !allowWhenLoggedOut && !allowUnauthenticated && auth.serverResponded) {
        const err = new Error("Request blocked: unauthenticated");
        err.code = "ERR_CANCELED";
        return Promise.reject(err);
      }
      if (_sessionToken && !isCredentialExchange) {
        config.headers = config.headers ?? {};
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Session ${_sessionToken}`;
        }
      }
      return config;
    } catch {
      return config;
    }
  });
  function triggerLoginModal() {
    if (typeof window === "undefined")
      return;
    try {
      auth.requireLogin({ bypassLogoutGuard: true });
    } catch {
    }
  }
  http.interceptors.response.use(
    async (response) => {
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sunshine:online"));
        }
      } catch {
      }
      return response;
    },
    async (error) => {
      var _a, _b, _c;
      try {
        if (typeof window !== "undefined") {
          const isCanceled = (error == null ? void 0 : error.code) === "ERR_CANCELED";
          const auth2 = useAuthStore();
          const userLoggedOut2 = auth2.logoutInitiated === true;
          if (!(error == null ? void 0 : error.response)) {
            if (!isCanceled && !userLoggedOut2) {
              window.dispatchEvent(new CustomEvent("sunshine:offline"));
            }
          } else {
            window.dispatchEvent(new CustomEvent("sunshine:online"));
          }
        }
      } catch {
      }
      const status = (_a = error == null ? void 0 : error.response) == null ? void 0 : _a.status;
      const originalRequest = error.config || {};
      const skipAuthRetry = (originalRequest == null ? void 0 : originalRequest.__skipAuthRefresh) === true || (originalRequest == null ? void 0 : originalRequest.headers) && originalRequest.headers["X-Skip-Auth-Refresh"];
      const isAuthRequest = /\/api\/auth\/(login|refresh)\b/.test(
        String((originalRequest == null ? void 0 : originalRequest.url) || "")
      );
      const userLoggedOut = auth.logoutInitiated === true;
      if (status === 401) {
        const lastAuth = auth._lastAuthSuccess;
        const inGracePeriod = lastAuth ? Date.now() - lastAuth < 5e3 : false;
        if (inGracePeriod) {
          if (!originalRequest.__graceRetry) {
            originalRequest.__graceRetry = true;
            await new Promise((r) => setTimeout(r, 400));
            return http(originalRequest);
          }
          {
            console.warn(
              `[Auth] 401 suppressed (grace period): ${(originalRequest == null ? void 0 : originalRequest.url) || "unknown"}`
            );
          }
          return Promise.reject(error);
        }
        if (!skipAuthRetry && !isAuthRequest && !userLoggedOut) {
          const refreshed = await refreshSession();
          if (refreshed) {
            originalRequest.__skipAuthRefresh = true;
            originalRequest.__isRetryRequest = true;
            if (_sessionToken) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers["Authorization"] = `Session ${_sessionToken}`;
            }
            return http(originalRequest);
          }
        }
        clearSessionTokens();
        if (auth.isAuthenticated)
          auth.setAuthenticated(false);
        if (!userLoggedOut)
          triggerLoginModal();
      } else if (((_b = error == null ? void 0 : error.response) == null ? void 0 : _b.status) === 400 && ((_c = error == null ? void 0 : error.response) == null ? void 0 : _c.data) && /Credentials not configured/i.test(JSON.stringify(error.response.data))) {
        auth.setCredentialsConfigured(false);
        triggerLoginModal();
      }
      return Promise.reject(error);
    }
  );
}
function initHttpLayer() {
  initAuthHandling();
}
async function i18n() {
  var _a;
  const r = await http.get("./api/configLocale", { validateStatus: () => true }).then((r2) => r2.status === 200 ? r2.data : {}).catch(() => ({}));
  const locale = r.locale ?? "en";
  (_a = document.querySelector("html")) == null ? void 0 : _a.setAttribute("lang", locale);
  const messages = {
    en
  };
  try {
    if (locale !== "en") {
      const r2 = await http.get(`/assets/locale/${locale}.json`, { validateStatus: () => true }).then((r3) => r3.status === 200 ? r3.data : null);
      if (r2)
        messages[locale] = r2;
    }
  } catch (e) {
    console.error("Failed to download translations", e);
  }
  const i18n2 = createI18n({
    // Use the Composition API and inject global helpers so `$t` works in templates
    legacy: false,
    globalInjection: true,
    locale,
    // set locale
    fallbackLocale: "en",
    // set fallback locale
    messages
  });
  return i18n2;
}
let _i18n = null;
function setI18nGlobal(i18n2) {
  _i18n = i18n2;
}
async function ensureLocaleLoaded(locale) {
  var _a, _b;
  if (!_i18n)
    return;
  try {
    const has = (_a = _i18n.global.availableLocales) == null ? void 0 : _a.includes(locale);
    if (!has) {
      const r = await http.get(`/assets/locale/${locale}.json`, { validateStatus: () => true }).then((r2) => r2.status === 200 ? r2.data : null);
      if (r) {
        _i18n.global.setLocaleMessage(locale, r);
      }
    }
    _i18n.global.locale = locale;
    (_b = document.querySelector("html")) == null ? void 0 : _b.setAttribute("lang", locale);
  } catch (e) {
    console.error("ensureLocaleLoaded failed", e);
  }
}
function initApp(app2, config) {
  i18n().then(async (i18n2) => {
    app2.use(i18n2);
    app2.provide("i18n", i18n2.global);
    setI18nGlobal(i18n2);
    if (config) {
      try {
        await config(app2);
      } catch (e) {
        console.error("initApp: config loader failed", e);
      }
    }
    app2.mount("#app");
  });
}
const DashboardView = () => __vitePreload(() => import("./DashboardView-90317dbb.js"), true ? ["./DashboardView-90317dbb.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./DashboardView-0151df78.css"] : void 0, import.meta.url);
const LibraryView = () => __vitePreload(() => import("./LibraryView-8340ab93.js"), true ? ["./LibraryView-8340ab93.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./LibraryView-e772f451.css"] : void 0, import.meta.url);
const GameSourcesView = () => __vitePreload(() => import("./GameSourcesView-bd34b22b.js"), true ? ["./GameSourcesView-bd34b22b.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./GameSourcesView-19a40f83.css"] : void 0, import.meta.url);
const SystemView = () => __vitePreload(() => import("./SystemView-3790f718.js"), true ? ["./SystemView-3790f718.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./SystemView-b239ffcd.css"] : void 0, import.meta.url);
const SettingsView = () => __vitePreload(() => import("./SettingsView-84da4d94.js"), true ? ["./SettingsView-84da4d94.js","./vue-core-de07660f.js","./ConfigFieldRenderer-f2409336.js","./vendor-33781bfc.js","./SettingsView-4650019d.css"] : void 0, import.meta.url);
const TroubleshootingView = () => __vitePreload(() => import("./TroubleshootingView-7fe3043b.js"), true ? ["./TroubleshootingView-7fe3043b.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./TroubleshootingView-5cd2585a.css"] : void 0, import.meta.url);
const ClientManagementView = () => __vitePreload(() => import("./ClientManagementView-3f7dd1dd.js"), true ? ["./ClientManagementView-3f7dd1dd.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./AppEditConfigOverridesSection-b39bbf4d.js","./ConfigFieldRenderer-f2409336.js","./AppEditConfigOverridesSection-2bbd0409.css","./ClientManagementView-a4f6d513.css"] : void 0, import.meta.url);
const WebRtcClientView = () => __vitePreload(() => import("./WebRtcClientView-b8df5467.js"), true ? ["./WebRtcClientView-b8df5467.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./WebRtcClientView-6d5043ac.css"] : void 0, import.meta.url);
const routes = [
  { path: "/", component: DashboardView },
  { path: "/pairing", component: ClientManagementView },
  { path: "/library", component: LibraryView },
  { path: "/applications", component: () => __vitePreload(() => import("./ApplicationsView-657cfdb0.js"), true ? ["./ApplicationsView-657cfdb0.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./ApplicationsView-ab7033e9.css"] : void 0, import.meta.url) },
  { path: "/game-sources", component: GameSourcesView },
  { path: "/system", component: SystemView },
  { path: "/settings", component: SettingsView, meta: { container: "lg" } },
  { path: "/logs", component: DashboardView },
  { path: "/troubleshooting", component: TroubleshootingView },
  { path: "/clients", component: ClientManagementView },
  { path: "/webrtc", component: WebRtcClientView, meta: { container: "full" } },
  // Legacy/unknown routes → redirect to home
  { path: "/welcome", redirect: "/" },
  { path: "/login", redirect: "/" },
  { path: "/password", redirect: "/" },
  { path: "/:pathMatch(.*)*", redirect: "/" }
];
const CHUNK_RELOAD_FLAG = "sunshine:chunk-reload";
const chunkErrorPatterns = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed"
];
function isChunkLoadError(error) {
  if (!error)
    return false;
  if (typeof error === "string") {
    return chunkErrorPatterns.some((pattern) => error.includes(pattern));
  }
  if (error instanceof Error) {
    const message = error.message ?? "";
    if (chunkErrorPatterns.some((pattern) => message.includes(pattern))) {
      return true;
    }
    if (error.name === "ChunkLoadError") {
      return true;
    }
    if ("code" in error && typeof error.code === "string") {
      const code = error.code ?? "";
      return code === "ERR_MODULE_NOT_FOUND";
    }
  }
  return false;
}
const router = createRouter({
  // Use HTML5 history mode (no # in URLs)
  history: createWebHistory("/"),
  routes
});
router.beforeEach(async (_to) => {
  if (typeof window === "undefined")
    return true;
  try {
    const auth = useAuthStore();
    if (!auth.ready && typeof auth.init === "function") {
      try {
        await auth.init();
      } catch {
      }
    }
    if (auth.serverResponded && !auth.isAuthenticated && !auth.loggingIn && !auth.showLoginModal) {
      auth.requireLogin();
    }
  } catch {
  }
  return true;
});
router.onError((error) => {
  if (typeof window === "undefined")
    return;
  if (!isChunkLoadError(error))
    return;
  try {
    const storage = window.sessionStorage;
    if (storage && !storage.getItem(CHUNK_RELOAD_FLAG)) {
      storage.setItem(CHUNK_RELOAD_FLAG, Date.now().toString());
      window.location.reload();
      return;
    }
    storage == null ? void 0 : storage.removeItem(CHUNK_RELOAD_FLAG);
  } catch {
  }
  window.location.replace(window.location.origin);
});
const _imports_0 = "" + new URL("../images/logo-apollo-45.png", import.meta.url).href;
function cssVarRgb(name, fallback) {
  if (typeof window === "undefined")
    return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw)
    return fallback;
  const parts = raw.replace(/\s+/g, " ").replace(/,/g, " ").trim().split(" ");
  if (parts.length < 3)
    return fallback;
  const [r, g, b] = parts;
  const nr = Number(r), ng = Number(g), nb = Number(b);
  if ([nr, ng, nb].some((n) => !isFinite(n)))
    return fallback;
  return `rgb(${nr}, ${ng}, ${nb})`;
}
function cssVarRgbComma(name, fallback) {
  if (typeof window === "undefined")
    return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw)
    return fallback;
  const parts = raw.replace(/\s+/g, " ").replace(/,/g, " ").trim().split(" ");
  if (parts.length < 3)
    return fallback;
  const [r, g, b] = parts;
  const nr = Number(r), ng = Number(g), nb = Number(b);
  if ([nr, ng, nb].some((n) => !isFinite(n)))
    return fallback;
  return `${nr}, ${ng}, ${nb}`;
}
function useNaiveThemeOverrides() {
  const overrides = ref({});
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const parse = (rgb) => {
    const m = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m)
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    const mm = rgb.match(/(\d+)\s+(\d+)\s+(\d+)/);
    if (mm)
      return [Number(mm[1]), Number(mm[2]), Number(mm[3])];
    return [0, 0, 0];
  };
  const toCss = (r, g, b) => `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
  const lighten = (rgb, amt) => {
    const [r, g, b] = parse(rgb);
    return toCss(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  };
  const darken = (rgb, amt) => {
    const [r, g, b] = parse(rgb);
    return toCss(r * (1 - amt), g * (1 - amt), b * (1 - amt));
  };
  const compute = () => {
    const primary = cssVarRgb("--color-primary", "77, 163, 255");
    const info = cssVarRgb("--color-info", "2, 136, 209");
    const success = cssVarRgb("--color-success", "76, 175, 80");
    const warning = cssVarRgb("--color-warning", "245, 124, 0");
    const danger = cssVarRgb("--color-danger", "220, 38, 38");
    overrides.value = {
      common: {
        primaryColor: primary,
        primaryColorHover: darken(primary, 0.08),
        primaryColorPressed: darken(primary, 0.16),
        primaryColorSuppl: lighten(primary, 0.12),
        infoColor: info,
        infoColorHover: darken(info, 0.08),
        infoColorPressed: darken(info, 0.16),
        infoColorSuppl: lighten(info, 0.12),
        successColor: success,
        successColorHover: darken(success, 0.08),
        successColorPressed: darken(success, 0.16),
        successColorSuppl: lighten(success, 0.12),
        warningColor: warning,
        warningColorHover: darken(warning, 0.08),
        warningColorPressed: darken(warning, 0.16),
        warningColorSuppl: lighten(warning, 0.12),
        errorColor: danger,
        errorColorHover: darken(danger, 0.08),
        errorColorPressed: darken(danger, 0.16),
        errorColorSuppl: lighten(danger, 0.12),
        baseColor: cssVarRgb("--color-light", "#ffffff"),
        bodyColor: cssVarRgb("--color-light", "#ffffff"),
        textColorBase: cssVarRgb("--color-dark", "#000000"),
        cardColor: cssVarRgb("--color-surface", "#ffffff"),
        modalColor: cssVarRgb("--color-surface", "#ffffff"),
        popoverColor: cssVarRgb("--color-surface", "#ffffff"),
        tableColor: cssVarRgb("--color-light", "#ffffff"),
        // Subtle borders/dividers using resolved theme tokens (avoid var() usage here)
        borderColor: `rgba(${cssVarRgbComma("--color-dark", "0, 0, 0")}, 0.10)`,
        dividerColor: `rgba(${cssVarRgbComma("--color-dark", "0, 0, 0")}, 0.10)`
      }
    };
  };
  onMounted(compute);
  const isDark = useDarkModeClassRef();
  watch(isDark, () => compute());
  return overrides;
}
function useDarkModeClassRef() {
  const isDark = ref(false);
  let observer = null;
  const update = () => {
    if (typeof document !== "undefined") {
      isDark.value = document.documentElement.classList.contains("dark");
    }
  };
  if (typeof window !== "undefined") {
    update();
    onMounted(() => {
      update();
      observer = new MutationObserver(update);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    });
    onBeforeUnmount(() => {
      observer == null ? void 0 : observer.disconnect();
      observer = null;
    });
  }
  return isDark;
}
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "LucideIcon",
  props: {
    name: { type: String, required: true },
    size: { type: Number, required: false, default: 16 },
    strokeWidth: { type: Number, required: false, default: 1.5 },
    class: { type: String, required: false, default: "" }
  },
  setup(__props) {
    const iconMap = {
      // Navigation
      "fa-gauge": Gauge,
      "fa-gamepad": Gamepad2,
      "fa-sliders-h": SlidersHorizontal,
      "fa-wrench": Wrench,
      "fa-sign-out-alt": LogOut,
      "fa-bars": Menu,
      "fa-users": Users,
      "fa-users-cog": UserCog,
      "fa-user-slash": UserX,
      "fa-user-cog": UserCog,
      // Actions
      "fa-search": Search,
      "fa-magnifying-glass": Search,
      "fa-times": X,
      "fa-xmark": X,
      "fa-check": Check,
      "fa-edit": Pencil,
      "fa-pencil": Pencil,
      "fa-trash": Trash2,
      "fa-link": Link,
      "fa-link-slash": Unlink,
      "fa-circle-notch": LoaderCircle,
      "fa-spinner": LoaderCircle,
      "fa-cog": Cog,
      "fa-cogs": Cog,
      "fa-gear": Cog,
      "fa-gears": Cog,
      "fa-settings": Settings,
      "fa-play": Play,
      "fa-play-circle": Play,
      "fa-pause": Pause,
      "fa-stop": Square,
      "fa-power-off": Power,
      "fa-sliders": SlidersHorizontal,
      "fa-th": LayoutGrid,
      "fa-table-cells-large": Grid3x3,
      "fa-satellite-dish": Radio,
      "fa-wifi": Wifi,
      "fa-plug": Plug,
      "fa-bug": Bug,
      "fa-download": Download,
      "fa-file-zipper": FileArchive,
      "fa-file-lines": FileText,
      "fa-file-alt": FileText,
      "fa-file-text": FileText,
      "fa-rotate-right": RotateCcw,
      "fa-rotate": RotateCcw,
      "fa-sync": RotateCcw,
      "fa-code-branch": GitBranch,
      "fa-hashtag": Hash,
      "fa-flask": FlaskConical,
      "fa-bars-staggered": List,
      "fa-list": List,
      "fa-bolt": Zap,
      "fa-plus": Plus,
      "fa-arrow-left": ArrowLeft,
      "fa-chevron-up": ChevronUp,
      "fa-chevron-down": ChevronDown,
      "fa-chevron-right": ChevronRight,
      "fa-save": Save,
      "fa-external-link-alt": ExternalLink,
      "fa-copy": Copy,
      "fa-key": Key,
      "fa-lock": Lock,
      "fa-image": Image,
      "fa-lightbulb": Lightbulb,
      "fa-stethoscope": Stethoscope,
      "fa-stopwatch": Timer,
      "fa-stopwatch-20": Timer,
      "fa-hand-point-right": MousePointerClick,
      "fa-nvidia": Cpu,
      "fa-desktop": Monitor,
      "fa-display": Monitor,
      "fa-monitor": Monitor,
      "fa-sun": Sun,
      "fa-moon": Moon,
      "fa-circle-half-stroke": SunMoon,
      // Status/Alerts
      "fa-circle-exclamation": CircleAlert,
      "fa-exclamation-circle": CircleAlert,
      "fa-exclamation": CircleAlert,
      "fa-triangle-exclamation": TriangleAlert,
      "fa-exclamation-triangle": TriangleAlert,
      "fa-circle-info": Info,
      "fa-info-circle": Info,
      "fa-info": Info,
      "fa-circle-check": CircleCheck,
      "fa-check-circle": CircleCheck,
      "fa-times-circle": CircleX,
      "fa-question-circle": CircleQuestionMark,
      "fa-shield-heart": ShieldCheck,
      "fa-shield-halved": ShieldCheck,
      // Devices/Media
      "fa-mobile": Smartphone,
      "fa-mobile-alt": Smartphone,
      "fa-laptop": Laptop,
      "fa-tv": Tv,
      "fa-disc": Disc,
      "fa-compact-disc": Disc,
      "fa-expand": Maximize2,
      "fa-compress": Minimize2,
      "fa-volume-up": Volume2,
      "fa-volume": Volume2,
      // Brands
      "fa-github": Github,
      "fa-discord": MessageCircle,
      // Misc
      "fa-compass": Compass,
      "fa-ban": CircleSlash,
      "fa-window-restore": Monitor,
      "fa-window-maximize": Maximize2
    };
    const props = __props;
    const icon = computed(() => iconMap[props.name] || null);
    if (!iconMap[props.name]) {
      console.warn(`[LucideIcon] No mapping found for: ${props.name}`);
    }
    return (_ctx, _cache) => {
      return icon.value ? (openBlock(), createBlock(resolveDynamicComponent(icon.value), {
        key: 0,
        size: _ctx.size,
        "stroke-width": _ctx.strokeWidth,
        class: normalizeClass(_ctx.class)
      }, null, 8, ["size", "stroke-width", "class"])) : (openBlock(), createElementBlock(
        "span",
        {
          key: 1,
          class: normalizeClass(["inline-block w-4 h-4", _ctx.class])
        },
        toDisplayString(_ctx.name),
        3
        /* TEXT, CLASS */
      ));
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const LucideIcon = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/LucideIcon.vue"]]);
const getStoredTheme = () => localStorage.getItem("theme");
const setStoredTheme = (theme) => localStorage.setItem("theme", theme);
const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "auto") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
const setTheme = (theme) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "auto") {
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const resolved = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", resolved);
    document.documentElement.setAttribute("data-theme", "auto");
  } else if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-bs-theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-bs-theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  }
};
const showActiveTheme = (theme, focus = false) => {
  var _a;
  const themeSwitcher = document.querySelector("#bd-theme");
  if (!themeSwitcher) {
    return;
  }
  const themeSwitcherText = document.querySelector("#bd-theme-text");
  const activeThemeIcon = document.querySelector(".theme-icon-active i");
  const iconMap = {
    light: "fa-solid fa-sun",
    dark: "fa-solid fa-moon",
    auto: "fa-solid fa-circle-half-stroke"
  };
  const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);
  if (btnToActive) {
    document.querySelectorAll("[data-bs-theme-value]").forEach((element) => {
      element.classList.remove("active");
      element.setAttribute("aria-pressed", "false");
    });
    btnToActive.classList.add("active");
    btnToActive.setAttribute("aria-pressed", "true");
    const iconInside = btnToActive.querySelector("i");
    if (activeThemeIcon && iconInside) {
      activeThemeIcon.className = iconInside.className;
    }
  } else {
    if (activeThemeIcon) {
      activeThemeIcon.className = iconMap[theme] || iconMap.auto;
    }
  }
  if (themeSwitcherText) {
    const pretty = btnToActive ? (_a = btnToActive.textContent) == null ? void 0 : _a.trim() : theme;
    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${pretty})`;
    themeSwitcher.setAttribute("aria-label", themeSwitcherLabel);
  }
  if (focus && "focus" in themeSwitcher) {
    themeSwitcher.focus();
  }
};
function setupThemeToggleListener() {
  document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const theme = toggle.getAttribute("data-bs-theme-value");
      if (theme) {
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme, true);
      }
    });
  });
  showActiveTheme(getPreferredTheme(), false);
}
function loadAutoTheme() {
  (() => {
    setTheme(getPreferredTheme());
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== "light" && storedTheme !== "dark") {
        setTheme(getPreferredTheme());
      }
    });
    window.addEventListener("DOMContentLoaded", () => {
      showActiveTheme(getPreferredTheme());
    });
  })();
}
const _hoisted_1$5 = ["aria-label"];
const _hoisted_2$3 = ["title", "aria-label"];
const _hoisted_3$3 = {
  class: "login-panel-left",
  "aria-hidden": "true"
};
const _hoisted_4$3 = { class: "login-panel-left-content" };
const _hoisted_5$3 = { class: "login-panel-logo" };
const _hoisted_6$3 = { class: "login-panel-tagline" };
const _hoisted_7$3 = { class: "login-panel-right" };
const _hoisted_8$3 = { class: "login-form-wrap" };
const _hoisted_9$2 = { class: "login-form-header" };
const _hoisted_10$2 = { class: "login-form-title" };
const _hoisted_11$2 = { class: "login-form-subtitle" };
const _hoisted_12$1 = ["onKeydown"];
const _hoisted_13 = { class: "lf-field" };
const _hoisted_14 = {
  class: "lf-label",
  for: "lf-username"
};
const _hoisted_15 = {
  key: 0,
  class: "lf-field"
};
const _hoisted_16 = {
  class: "lf-label",
  for: "lf-password"
};
const _hoisted_17 = { class: "lf-field" };
const _hoisted_18 = {
  class: "lf-label",
  for: "lf-newpw"
};
const _hoisted_19 = { class: "lf-field" };
const _hoisted_20 = {
  class: "lf-label",
  for: "lf-confirmpw"
};
const _hoisted_21 = {
  key: 2,
  class: "lf-remember-row"
};
const _hoisted_22 = {
  key: 3,
  class: "lf-feedback"
};
const _hoisted_23 = {
  key: 0,
  class: "lf-toggle-row"
};
const _hoisted_24 = { class: "lf-toggle-text" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "LoginModal",
  setup(__props) {
    const isDark = useDarkModeClassRef();
    const naiveOverrides = useNaiveThemeOverrides();
    const themeMode = ref(getPreferredTheme());
    const themeOptions = [
      { value: "light", icon: "fa-sun", label: "Light" },
      { value: "dark", icon: "fa-moon", label: "Dark" },
      { value: "auto", icon: "fa-circle-half-stroke", label: "Auto" }
    ];
    function cycleTheme() {
      const order = ["light", "dark", "auto"];
      const idx = order.indexOf(themeMode.value);
      const next = order[(idx >= 0 ? idx + 1 : 1) % order.length] ?? "auto";
      themeMode.value = next;
      setStoredTheme(next);
      setTheme(next);
    }
    const auth = useAuthStore();
    const { t } = useI18n();
    const visible = computed(
      () => auth.ready && auth.showLoginModal && !auth.isAuthenticated && !auth.logoutInitiated
    );
    const credentialsConfigured = computed(() => auth.credentialsConfigured);
    const isSignUp = ref(false);
    const effectiveSignUp = computed(() => isSignUp.value || !credentialsConfigured.value);
    const panelTitle = computed(() => {
      if (!credentialsConfigured.value)
        return t("auth.create_first_user");
      return effectiveSignUp.value ? "Create Account" : t("auth.login_title");
    });
    const panelSubtitle = computed(() => {
      if (!credentialsConfigured.value)
        return t("auth.first_user_subtitle");
      return effectiveSignUp.value ? "Fill in the details below to register." : "Welcome back! Please sign in to continue.";
    });
    const submitLabel = computed(() => {
      if (submitting.value) {
        return effectiveSignUp.value ? t("auth.creating_user") : t("auth.login_loading");
      }
      return effectiveSignUp.value ? t("auth.create_user") : t("auth.login_sign_in");
    });
    const username = ref("");
    const password = ref("");
    const newPassword = ref("");
    const confirmNewPassword = ref("");
    const error = ref("");
    const success = ref("");
    const submitting = ref(false);
    const rememberMe = ref(false);
    watch(visible, (v) => {
      if (v)
        reset();
    });
    function reset() {
      username.value = "";
      password.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
      error.value = "";
      success.value = "";
      rememberMe.value = false;
      isSignUp.value = false;
    }
    function toggleMode() {
      isSignUp.value = !isSignUp.value;
      error.value = "";
      success.value = "";
    }
    async function submit() {
      const MIN_LOGIN_DELAY_MS = 1e3;
      const start = Date.now();
      error.value = "";
      success.value = "";
      if (submitting.value)
        return;
      submitting.value = true;
      const setLogging = (state) => {
        try {
          auth.loggingIn = state;
        } catch {
        }
      };
      setLogging(true);
      try {
        const firstUserFlow = effectiveSignUp.value;
        if (firstUserFlow) {
          if (!newPassword.value || newPassword.value !== confirmNewPassword.value) {
            error.value = t("auth.password_mismatch");
            return;
          }
          const res = await http.post(
            "/api/password",
            {
              currentUsername: username.value,
              // Server ignores current* when none exist
              currentPassword: newPassword.value,
              newUsername: username.value,
              newPassword: newPassword.value,
              confirmNewPassword: confirmNewPassword.value
            },
            { validateStatus: () => true }
          );
          if (res.status !== 200 || !res.data || !res.data.status) {
            error.value = res.data && res.data.error ? res.data.error : t("auth.create_user_failed");
            return;
          }
          auth.setCredentialsConfigured(true);
          success.value = t("auth.user_created");
          await new Promise((r) => setTimeout(r, 250));
        }
        const loginRes = await http.post(
          "/api/auth/login",
          {
            username: username.value,
            password: firstUserFlow ? newPassword.value : password.value,
            remember_me: rememberMe.value
          },
          { validateStatus: () => true }
        );
        if (loginRes.status === 200 && loginRes.data && loginRes.data.status) {
          applyLoginResponse(loginRes.data, rememberMe.value);
          const elapsed = Date.now() - start;
          if (elapsed < MIN_LOGIN_DELAY_MS) {
            await new Promise((r) => setTimeout(r, MIN_LOGIN_DELAY_MS - elapsed));
          }
          auth.setAuthenticated(true);
          success.value = t("auth.login_success");
          setTimeout(() => {
            auth.hideLogin();
          }, 400);
        } else {
          error.value = loginRes.data && loginRes.data.error ? loginRes.data.error : t("auth.login_failed");
        }
      } catch (e) {
        error.value = t("auth.login_network_error");
      } finally {
        submitting.value = false;
        setLogging(false);
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NModal), {
        show: visible.value,
        "mask-closable": false,
        "close-on-esc": false
      }, {
        default: withCtx(() => [
          createVNode(unref(NConfigProvider), {
            theme: unref(isDark) ? unref(darkTheme) : null,
            "theme-overrides": unref(naiveOverrides)
          }, {
            default: withCtx(() => {
              var _a;
              return [
                createBaseVNode("div", {
                  class: "login-modal-shell",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": panelTitle.value
                }, [
                  createCommentVNode(" Theme toggle: top-left corner "),
                  createBaseVNode("button", {
                    type: "button",
                    class: "login-theme-toggle",
                    title: "Theme: " + themeMode.value,
                    "aria-label": "Switch theme, current: " + themeMode.value,
                    onClick: cycleTheme
                  }, [
                    createVNode(LucideIcon, {
                      name: ((_a = themeOptions.find((o) => o.value === themeMode.value)) == null ? void 0 : _a.icon) ?? "fa-circle-half-stroke",
                      size: 15
                    }, null, 8, ["name"])
                  ], 8, _hoisted_2$3),
                  createCommentVNode(" Left: image panel "),
                  createBaseVNode("div", _hoisted_3$3, [
                    createBaseVNode("div", _hoisted_4$3, [
                      createBaseVNode("div", _hoisted_5$3, [
                        createVNode(LucideIcon, {
                          name: "fa-satellite-dish",
                          size: 26
                        })
                      ]),
                      createBaseVNode("div", _hoisted_6$3, [
                        createBaseVNode(
                          "h2",
                          null,
                          toDisplayString(isSignUp.value ? "Create your account" : "Welcome Back!"),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "p",
                          null,
                          toDisplayString(isSignUp.value ? "Set up your Jujo.Stream admin credentials." : "Sign in to manage your stream server."),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  createCommentVNode(" Right: form panel "),
                  createBaseVNode("div", _hoisted_7$3, [
                    createBaseVNode("div", _hoisted_8$3, [
                      createBaseVNode("div", _hoisted_9$2, [
                        createBaseVNode(
                          "h1",
                          _hoisted_10$2,
                          toDisplayString(panelTitle.value),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "p",
                          _hoisted_11$2,
                          toDisplayString(panelSubtitle.value),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("form", {
                        id: "loginForm",
                        class: "login-form-body",
                        novalidate: "",
                        onSubmit: withModifiers(submit, ["prevent"]),
                        onKeydown: withKeys(withModifiers(submit, ["ctrl", "stop", "prevent"]), ["enter"])
                      }, [
                        createCommentVNode(" Username "),
                        createBaseVNode("div", _hoisted_13, [
                          createBaseVNode(
                            "label",
                            _hoisted_14,
                            toDisplayString(unref(t)("auth.username")),
                            1
                            /* TEXT */
                          ),
                          createVNode(unref(__unplugin_components_0), {
                            id: "lf-username",
                            value: username.value,
                            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => username.value = $event),
                            autocomplete: "username",
                            placeholder: isSignUp.value ? "Choose a username" : "Enter your username",
                            size: "large"
                          }, null, 8, ["value", "placeholder"])
                        ]),
                        createCommentVNode(" Password (login only) "),
                        !isSignUp.value ? (openBlock(), createElementBlock("div", _hoisted_15, [
                          createBaseVNode(
                            "label",
                            _hoisted_16,
                            toDisplayString(unref(t)("auth.password")),
                            1
                            /* TEXT */
                          ),
                          createVNode(unref(__unplugin_components_0), {
                            id: "lf-password",
                            value: password.value,
                            "onUpdate:value": _cache[1] || (_cache[1] = ($event) => password.value = $event),
                            type: "password",
                            "show-password-on": "click",
                            autocomplete: "current-password",
                            placeholder: "Enter your password",
                            size: "large"
                          }, null, 8, ["value"])
                        ])) : createCommentVNode("v-if", true),
                        createCommentVNode(" New + Confirm password (sign-up) "),
                        isSignUp.value ? (openBlock(), createElementBlock(
                          Fragment,
                          { key: 1 },
                          [
                            createBaseVNode("div", _hoisted_17, [
                              createBaseVNode(
                                "label",
                                _hoisted_18,
                                toDisplayString(unref(t)("auth.new_password")),
                                1
                                /* TEXT */
                              ),
                              createVNode(unref(__unplugin_components_0), {
                                id: "lf-newpw",
                                value: newPassword.value,
                                "onUpdate:value": _cache[2] || (_cache[2] = ($event) => newPassword.value = $event),
                                type: "password",
                                "show-password-on": "click",
                                autocomplete: "new-password",
                                placeholder: "Create a password",
                                size: "large"
                              }, null, 8, ["value"])
                            ]),
                            createBaseVNode("div", _hoisted_19, [
                              createBaseVNode(
                                "label",
                                _hoisted_20,
                                toDisplayString(unref(t)("auth.confirm_new_password")),
                                1
                                /* TEXT */
                              ),
                              createVNode(unref(__unplugin_components_0), {
                                id: "lf-confirmpw",
                                value: confirmNewPassword.value,
                                "onUpdate:value": _cache[3] || (_cache[3] = ($event) => confirmNewPassword.value = $event),
                                type: "password",
                                "show-password-on": "click",
                                autocomplete: "new-password",
                                placeholder: "Repeat your password",
                                size: "large"
                              }, null, 8, ["value"])
                            ])
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : createCommentVNode("v-if", true),
                        createCommentVNode(" Remember me + Forgot (login only) "),
                        !isSignUp.value ? (openBlock(), createElementBlock("div", _hoisted_21, [
                          createVNode(unref(NCheckbox), {
                            checked: rememberMe.value,
                            "onUpdate:checked": _cache[4] || (_cache[4] = ($event) => rememberMe.value = $event),
                            size: "small"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(unref(t)("auth.remember_me_label")),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          }, 8, ["checked"])
                        ])) : createCommentVNode("v-if", true),
                        createCommentVNode(" Feedback "),
                        error.value || success.value ? (openBlock(), createElementBlock("div", _hoisted_22, [
                          error.value ? (openBlock(), createBlock(unref(NAlert), {
                            key: 0,
                            type: "error",
                            "show-icon": true,
                            size: "small"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(error.value),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          })) : success.value ? (openBlock(), createBlock(unref(NAlert), {
                            key: 1,
                            type: "success",
                            "show-icon": true,
                            size: "small"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(success.value),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          })) : createCommentVNode("v-if", true)
                        ])) : createCommentVNode("v-if", true),
                        createCommentVNode(" Primary action "),
                        createVNode(unref(NButton), {
                          type: "primary",
                          "attr-type": "submit",
                          disabled: submitting.value,
                          loading: submitting.value,
                          size: "large",
                          class: "lf-submit-btn",
                          block: ""
                        }, {
                          default: withCtx(() => [
                            createTextVNode(
                              toDisplayString(submitLabel.value),
                              1
                              /* TEXT */
                            )
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["disabled", "loading"])
                      ], 40, _hoisted_12$1),
                      createCommentVNode(" Toggle sign-in / sign-up (only when credentials already exist) "),
                      credentialsConfigured.value ? (openBlock(), createElementBlock("div", _hoisted_23, [
                        createBaseVNode(
                          "span",
                          _hoisted_24,
                          toDisplayString(isSignUp.value ? "Already have an account?" : "New User?"),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "button",
                          {
                            type: "button",
                            class: "lf-toggle-btn",
                            onClick: toggleMode
                          },
                          toDisplayString(isSignUp.value ? "Sign In" : "Sign Up"),
                          1
                          /* TEXT */
                        )
                      ])) : createCommentVNode("v-if", true)
                    ])
                  ])
                ], 8, _hoisted_1$5)
              ];
            }),
            _: 1
            /* STABLE */
          }, 8, ["theme", "theme-overrides"])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"]);
    };
  }
});
const LoginModal_vue_vue_type_style_index_0_scoped_a773d557_lang = "";
const LoginModal = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-a773d557"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/LoginModal.vue"]]);
const useConnectivityStore = defineStore("connectivity", () => {
  const offline = ref(false);
  const checking = ref(false);
  const lastOk = ref(null);
  const retryMs = ref(15e3);
  const started = ref(false);
  let intervalId = null;
  let quickRetryTimer = null;
  let onBecameActiveHandler = null;
  let failCount = 0;
  const failThreshold = 2;
  let offlineSince = null;
  const overlayDelayMs = 0;
  const quickRetryMs = 1e3;
  const getAuth = () => {
    try {
      return useAuthStore();
    } catch {
      return null;
    }
  };
  const isLogoutInitiated = () => {
    const auth = getAuth();
    return !!(auth && auth.logoutInitiated);
  };
  const isLoggingIn = () => {
    const auth = getAuth();
    return !!(auth && auth.loggingIn && auth.loggingIn.value === true);
  };
  const isTabActive = () => {
    try {
      const visible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;
      const focus = typeof document !== "undefined" && document.hasFocus ? document.hasFocus() : true;
      return visible && focus;
    } catch {
      return true;
    }
  };
  const later = (fn, ms) => window.setTimeout(fn, ms);
  function setOffline(v) {
    if (isLogoutInitiated())
      return;
    if (offline.value === v)
      return;
    if (v && !offline.value && offlineSince == null)
      offlineSince = Date.now();
    offline.value = v;
  }
  function refreshPage() {
    window.location.reload();
  }
  function shouldAvoidAutoReload() {
    var _a;
    try {
      const path = ((_a = window.location) == null ? void 0 : _a.pathname) ?? "";
      if (path.startsWith("/webrtc"))
        return true;
      if (window.__sunshine_webrtc_active)
        return true;
    } catch {
    }
    return false;
  }
  async function checkOnce() {
    if (checking.value)
      return;
    checking.value = true;
    try {
      const res = await http.get("/api/configLocale", {
        validateStatus: () => true,
        timeout: 2500
      });
      if (res) {
        if (quickRetryTimer) {
          clearTimeout(quickRetryTimer);
          quickRetryTimer = null;
        }
        failCount = 0;
        setOffline(false);
        lastOk.value = Date.now();
        if (offlineSince != null) {
          const offlineDuration = Date.now() - offlineSince;
          const reloadAfterOfflineMs = 500;
          if (offlineDuration >= reloadAfterOfflineMs) {
            if (shouldAvoidAutoReload()) {
              offlineSince = null;
            } else {
              const delay = offlineDuration < 200 ? 200 - offlineDuration : 0;
              later(refreshPage, delay);
            }
          } else {
            offlineSince = null;
          }
        }
      }
    } catch {
      failCount += 1;
      if (failCount === 1 && !quickRetryTimer) {
        quickRetryTimer = later(() => {
          quickRetryTimer = null;
          if (!checking.value)
            checkOnce();
        }, quickRetryMs);
      } else if (failCount >= failThreshold) {
        setOffline(true);
      }
    } finally {
      checking.value = false;
    }
  }
  const overlayVisible = computed(() => {
    if (!offline.value || isLoggingIn())
      return false;
    const since = offlineSince ?? Date.now();
    return Date.now() - since >= overlayDelayMs;
  });
  function start() {
    if (started.value)
      return;
    started.value = true;
    later(checkOnce, 500);
    intervalId = window.setInterval(() => {
      if (isTabActive())
        checkOnce();
    }, retryMs.value);
    window.addEventListener("online", () => later(checkOnce, 200));
    window.addEventListener("offline", () => setOffline(true));
    onBecameActiveHandler = () => later(() => {
      if (isTabActive())
        checkOnce();
    }, 100);
    window.addEventListener("visibilitychange", onBecameActiveHandler);
    window.addEventListener("focus", onBecameActiveHandler);
    window.addEventListener("sunshine:offline", () => {
    });
    window.addEventListener("sunshine:online", () => {
      if (isLogoutInitiated())
        return;
      setOffline(false);
      lastOk.value = Date.now();
    });
  }
  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (quickRetryTimer) {
      clearTimeout(quickRetryTimer);
      quickRetryTimer = null;
    }
    if (onBecameActiveHandler) {
      try {
        window.removeEventListener("visibilitychange", onBecameActiveHandler);
        window.removeEventListener("focus", onBecameActiveHandler);
      } catch {
      }
      onBecameActiveHandler = null;
    }
    started.value = false;
  }
  return {
    offline,
    checking,
    lastOk,
    retryMs,
    overlayVisible,
    start,
    stop,
    checkOnce,
    refreshPage
  };
});
const _hoisted_1$4 = {
  key: 0,
  class: "fixed inset-0 z-[140] flex flex-col"
};
const _hoisted_2$2 = { class: "relative flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto" };
const _hoisted_3$2 = { class: "w-full max-w-md mx-auto text-center space-y-6" };
const _hoisted_4$2 = { class: "space-y-2" };
const _hoisted_5$2 = { class: "text-2xl font-semibold tracking-tight" };
const _hoisted_6$2 = { class: "text-sm opacity-80 leading-relaxed" };
const _hoisted_7$2 = { class: "text-xs opacity-70 leading-relaxed" };
const _hoisted_8$2 = { class: "mt-4 text-xs opacity-75 select-none" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "OfflineOverlay",
  setup(__props) {
    const connectivity = useConnectivityStore();
    const visible = computed(() => connectivity.overlayVisible);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, { name: "fade-fast" }, {
        default: withCtx(() => [
          visible.value ? (openBlock(), createElementBlock("div", _hoisted_1$4, [
            _cache[1] || (_cache[1] = createBaseVNode(
              "div",
              { class: "absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/70 dark:from-black/70 dark:via-black/60 dark:to-black/70 backdrop-blur-md" },
              null,
              -1
              /* CACHED */
            )),
            createBaseVNode("div", _hoisted_2$2, [
              createBaseVNode("div", _hoisted_3$2, [
                _cache[0] || (_cache[0] = createBaseVNode(
                  "div",
                  null,
                  [
                    createBaseVNode("svg", {
                      class: "h-24 w-24 opacity-80 mx-auto select-none",
                      viewBox: "0 0 256 256",
                      xmlns: "http://www.w3.org/2000/svg",
                      "aria-hidden": "true"
                    }, [
                      createBaseVNode("path", {
                        fill: "#FDD107",
                        d: "M118.769 20.712s-63.833 26-74.333 83.833 37.167 91.5 86.333 75.333 70.333-51 81.833-87c0 0-9.333 100.5-96.167 115.5s-118.167-50-82.167-119.833C44.269 67.045 80.519 29.629 118.769 20.712z"
                      }),
                      createBaseVNode("path", {
                        fill: "#F89A1C",
                        d: "M118.769 20.712s-41.125 3.667-83.25 61.042-28.125 139.125 34.25 149.375 115.875-44.875 133.5-82.375 15.167-61.458 9.75-77.875c0 0 .667 36.417-13.333 59.667s-29.75 46.333-65.083 62.167-74.167 13.75-95.417-19.25-5.917-76.083-.292-85.333S72.394 33.795 118.769 20.712z"
                      }),
                      createBaseVNode("path", {
                        fill: "#EF3E23",
                        d: "M73.019 39.629s38.125-28.125 76.875-28.125 63 28.25 68.5 52.25 6 54.125-11.5 87.625-37.375 56-79.125 76.125-84.625 2.75-84.625 2.75 25.977 25.875 71.051 16.5 82.241-40.875 98.408-69.5 28.792-57.375 27.667-92.25-23.75-54.5-31.25-60.25-23.187-17.812-58.187-16.562S86.456 29.816 73.019 39.629z"
                      }),
                      createBaseVNode("path", {
                        fill: "#F26222",
                        d: "M73.019 39.629s35-32.813 82.437-32.813 69.188 24.813 78.875 44.688 21.812 70-12.188 123S147.518 242.879 128.518 247.129s-42.431 4.269-59.111-1.23c0 0 35.195 8.397 66.778-7.437s51.667-32.167 74.083-68.834 25.917-72.75 22.167-93.917-12.167-42.417-36.5-56.333-56.729-10.531-74.479-4.531S91.988 26.41 73.019 39.629z"
                      })
                    ])
                  ],
                  -1
                  /* CACHED */
                )),
                createBaseVNode("div", _hoisted_4$2, [
                  createBaseVNode(
                    "h2",
                    _hoisted_5$2,
                    toDisplayString(_ctx.$t("offline.title")),
                    1
                    /* TEXT */
                  ),
                  createBaseVNode(
                    "p",
                    _hoisted_6$2,
                    toDisplayString(_ctx.$t("offline.description")),
                    1
                    /* TEXT */
                  ),
                  createBaseVNode(
                    "p",
                    _hoisted_7$2,
                    toDisplayString(_ctx.$t("offline.retrying")),
                    1
                    /* TEXT */
                  )
                ]),
                createBaseVNode(
                  "p",
                  _hoisted_8$2,
                  toDisplayString(_ctx.$t("offline.close_hint")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : createCommentVNode("v-if", true)
        ]),
        _: 1
        /* STABLE */
      });
    };
  }
});
const OfflineOverlay = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/OfflineOverlay.vue"]]);
const defaultGroups = [
  {
    id: "general",
    name: "General",
    options: {
      locale: "en",
      sunshine_name: "",
      min_log_level: 2,
      enable_pairing: "enabled",
      enable_discovery: "enabled",
      global_prep_cmd: [],
      global_state_cmd: [],
      server_cmd: [],
      notify_pre_releases: "disabled",
      update_check_interval: 86400,
      session_token_ttl_seconds: 86400,
      remember_me_refresh_token_ttl_seconds: 604800,
      system_tray: true,
      hide_tray_controls: "disabled"
    }
  },
  {
    id: "input",
    name: "Input",
    options: {
      controller: "enabled",
      gamepad: "auto",
      ds4_back_as_touchpad_click: "enabled",
      motion_as_ds4: "enabled",
      touchpad_as_ds4: "enabled",
      back_button_timeout: -1,
      keyboard: "enabled",
      key_repeat_delay: 500,
      key_repeat_frequency: 24.9,
      always_send_scancodes: "enabled",
      key_rightalt_to_key_win: "disabled",
      mouse: "enabled",
      high_resolution_scrolling: "enabled",
      native_pen_touch: "enabled",
      enable_input_only_mode: "disabled",
      forward_rumble: "enabled",
      keybindings: "[0x10,0xA0,0x11,0xA2,0x12,0xA4]",
      ds5_inputtino_randomize_mac: true
    }
  },
  {
    id: "av",
    name: "Audio/Video",
    options: {
      audio_sink: "",
      virtual_sink: "",
      install_steam_audio_drivers: "enabled",
      stream_audio: "enabled",
      keep_sink_default: "enabled",
      auto_capture_sink: "enabled",
      adapter_name: "",
      output_name: "",
      virtual_display_mode: "disabled",
      virtual_display_layout: "exclusive",
      dd_configuration_option: "verify_only",
      dd_resolution_option: "auto",
      dd_manual_resolution: "",
      dd_refresh_rate_option: "auto",
      dd_manual_refresh_rate: "",
      dd_hdr_option: "auto",
      dd_hdr_request_override: "auto",
      dd_config_revert_delay: 3e3,
      dd_config_revert_on_disconnect: "disabled",
      dd_paused_virtual_display_timeout_secs: 0,
      dd_always_restore_from_golden: false,
      dd_snapshot_exclude_devices: [],
      dd_snapshot_restore_hotkey: "",
      dd_snapshot_restore_hotkey_modifiers: "ctrl+alt+shift",
      dd_activate_virtual_display: false,
      dd_mode_remapping: {
        mixed: [],
        resolution_only: [],
        refresh_rate_only: []
      },
      dd_wa_virtual_double_refresh: true,
      dd_wa_dummy_plug_hdr10: false,
      max_bitrate: 0,
      minimum_fps_target: 20,
      fallback_mode: "1920x1080x60",
      lossless_scaling_path: "",
      lossless_scaling_legacy_auto_detect: false
    }
  },
  {
    id: "network",
    name: "Network",
    options: {
      upnp: "disabled",
      address_family: "ipv4",
      bind_address: "",
      port: 47989,
      origin_web_ui_allowed: "lan",
      external_ip: "",
      lan_encryption_mode: 0,
      wan_encryption_mode: 1,
      ping_timeout: 1e4,
      video_max_batch_size_kb: 64
    }
  },
  {
    id: "files",
    name: "Config Files",
    options: {
      file_apps: "",
      credentials_file: "",
      log_path: "",
      pkey: "",
      cert: "",
      file_state: "",
      vibeshine_file_state: ""
    }
  },
  {
    id: "playnite",
    name: "Playnite",
    options: {
      playnite_auto_sync: true,
      playnite_sync_all_installed: false,
      playnite_recent_games: 10,
      playnite_recent_max_age_days: 0,
      playnite_autosync_delete_after_days: 0,
      playnite_autosync_require_replacement: true,
      playnite_autosync_remove_uninstalled: true,
      playnite_focus_attempts: 3,
      playnite_focus_timeout_secs: 15,
      playnite_focus_exit_on_first: false,
      playnite_fullscreen_entry_enabled: false,
      playnite_sync_categories: [],
      playnite_sync_plugins: [],
      playnite_exclude_categories: [],
      playnite_exclude_plugins: [],
      playnite_exclude_games: [],
      playnite_install_dir: "",
      playnite_extensions_dir: ""
    }
  },
  {
    id: "advanced",
    name: "Advanced",
    options: {
      fec_percentage: 20,
      limit_framerate: "enabled",
      qp: 28,
      min_threads: 2,
      hevc_mode: 0,
      av1_mode: 0,
      prefer_10bit_sdr: false,
      envvar_compatibility_mode: "disabled",
      legacy_ordering: "disabled",
      ignore_encoder_probe_failure: "disabled",
      capture: "",
      encoder: ""
    }
  },
  {
    id: "rtss",
    name: "Frame Limiter",
    options: {
      frame_limiter_enable: false,
      frame_limiter_provider: "auto",
      frame_limiter_fps_limit: 0,
      rtss_install_path: "",
      rtss_frame_limit_type: "async",
      frame_limiter_disable_vsync: false
    }
  },
  {
    id: "nv",
    name: "NVIDIA NVENC Encoder",
    options: {
      nvenc_preset: 1,
      nvenc_twopass: "quarter_res",
      nvenc_spatial_aq: "disabled",
      nvenc_split_encode: "auto",
      nvenc_vbv_increase: 0,
      nvenc_realtime_hags: "enabled",
      nvenc_latency_over_power: "enabled",
      nvenc_opengl_vulkan_on_dxgi: "enabled",
      nvenc_h264_cavlc: "disabled",
      nvenc_intra_refresh: "disabled"
    }
  },
  {
    id: "qsv",
    name: "Intel QuickSync Encoder",
    options: {
      qsv_preset: "medium",
      qsv_coder: "auto",
      qsv_slow_hevc: "disabled"
    }
  },
  {
    id: "amd",
    name: "AMD AMF Encoder",
    options: {
      amd_usage: "ultralowlatency",
      amd_rc: "vbr_latency",
      amd_enforce_hrd: "disabled",
      amd_quality: "balanced",
      amd_preanalysis: "disabled",
      amd_vbaq: "enabled",
      amd_coder: "auto"
    }
  },
  {
    id: "vt",
    name: "VideoToolbox Encoder",
    options: {
      vt_coder: "auto",
      vt_software: "auto",
      vt_realtime: "enabled"
    }
  },
  {
    id: "vaapi",
    name: "VA-API Encoder",
    options: {
      vaapi_strict_rc_buffer: "disabled"
    }
  },
  {
    id: "sw",
    name: "Software Encoder",
    options: {
      sw_preset: "superfast",
      sw_tune: "zerolatency"
    }
  }
];
function createDefaultMap(groups) {
  const map = {};
  for (const g of groups) {
    Object.assign(map, g.options);
  }
  return map;
}
const defaultMap = createDefaultMap(defaultGroups);
function hasDefaultKey(key) {
  return Object.prototype.hasOwnProperty.call(defaultMap, key);
}
function deepClone(v) {
  return v === void 0 ? v : JSON.parse(JSON.stringify(v));
}
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
const useConfigStore = defineStore("config", () => {
  const tabs = ref(defaultGroups);
  const _data = ref(null);
  const metadata = ref({});
  const config = ref(buildWrapper());
  const version = ref(0);
  const manualSaveKeys = /* @__PURE__ */ new Set([
    "global_prep_cmd",
    "global_state_cmd",
    "server_cmd",
    "dd_resolution_option",
    "dd_manual_resolution",
    "dd_mode_remapping"
  ]);
  const manualDirty = ref(false);
  const savingState = ref("idle");
  const loading = ref(false);
  const error = ref(null);
  const validationError = ref(null);
  const patchQueue = ref({});
  let flushTimer = null;
  let flushInFlight = false;
  const autosaveIntervalMs = 3e3;
  const nextFlushAt = ref(null);
  const lastSaveResult = ref(null);
  function buildWrapper() {
    const target = {};
    const keys = /* @__PURE__ */ new Set([
      ...Object.keys(defaultMap),
      ...Object.keys(_data.value || {})
      // keep any server-only metadata keys already present
    ]);
    if (_data.value) {
      for (const k of Object.keys(_data.value))
        keys.add(k);
    }
    keys.forEach((k) => {
      Object.defineProperty(target, k, {
        enumerable: true,
        configurable: true,
        get() {
          const current = _data.value;
          if (current && Object.prototype.hasOwnProperty.call(current, k)) {
            return current[k];
          }
          if (hasDefaultKey(k)) {
            const dv = defaultMap[k];
            if (dv && typeof dv === "object") {
              if (!_data.value)
                _data.value = {};
              const storeData = _data.value;
              if (storeData && !Object.prototype.hasOwnProperty.call(storeData, k)) {
                storeData[k] = deepClone(dv);
              }
              return storeData ? storeData[k] : dv;
            }
            return dv;
          }
          return void 0;
        },
        set(v) {
          if (!_data.value)
            _data.value = {};
          const prev = _data.value[k];
          if (deepEqual(prev, v))
            return;
          _data.value[k] = v;
          if (manualSaveKeys.has(k)) {
            manualDirty.value = true;
            savingState.value = "dirty";
          } else {
            version.value++;
            savingState.value = "dirty";
            let toSend = v;
            if (hasDefaultKey(k) && deepEqual(v, defaultMap[k])) {
              toSend = null;
            }
            patchQueue.value = { ...patchQueue.value, [k]: toSend };
            scheduleAutosave();
          }
        }
      });
    });
    Object.defineProperty(target, "platform", {
      enumerable: true,
      configurable: true,
      get() {
        var _a;
        return ((_a = metadata.value) == null ? void 0 : _a.platform) || "";
      },
      set(_v) {
      }
    });
    return target;
  }
  function setConfig(obj) {
    _data.value = obj ? JSON.parse(JSON.stringify(obj)) : {};
    const data = _data.value;
    const specialOptions = [
      "dd_mode_remapping",
      "global_prep_cmd",
      "global_state_cmd",
      "server_cmd"
    ];
    for (const key of specialOptions) {
      if (data && Object.prototype.hasOwnProperty.call(data, key) && typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch {
        }
      }
    }
    if (data) {
      for (const key of Object.keys(data)) {
        if (!hasDefaultKey(key))
          continue;
        const dv = defaultMap[key];
        const cur = data[key];
        if (typeof dv === "number" && typeof cur === "string") {
          const n = Number(cur);
          if (Number.isFinite(n)) {
            data[key] = n;
          }
        }
      }
    }
    if (data) {
      if (Object.prototype.hasOwnProperty.call(data, "double_refreshrate") && !Object.prototype.hasOwnProperty.call(data, "dd_wa_virtual_double_refresh")) {
        data["dd_wa_virtual_double_refresh"] = data["double_refreshrate"];
      }
      if (Object.prototype.hasOwnProperty.call(data, "double_refreshrate")) {
        delete data["double_refreshrate"];
      }
    }
    if (data) {
      if (!Object.prototype.hasOwnProperty.call(data, "frame_limiter_enable")) {
        data["frame_limiter_enable"] = false;
      }
      if (!Object.prototype.hasOwnProperty.call(data, "frame_limiter_provider")) {
        data["frame_limiter_provider"] = "auto";
      }
      const legacyVsync = Object.prototype.hasOwnProperty.call(data, "rtss_disable_vsync_ullm");
      const hasNewVsync = Object.prototype.hasOwnProperty.call(data, "frame_limiter_disable_vsync");
      if (legacyVsync) {
        if (!hasNewVsync) {
          data["frame_limiter_disable_vsync"] = data["rtss_disable_vsync_ullm"];
        }
        delete data["rtss_disable_vsync_ullm"];
      }
    }
    const playniteBoolKeys = [
      "playnite_auto_sync",
      "playnite_sync_all_installed",
      "playnite_autosync_require_replacement",
      "playnite_autosync_remove_uninstalled",
      "playnite_focus_exit_on_first",
      "playnite_fullscreen_entry_enabled"
    ];
    const otherBoolKeys = [
      "frame_limiter_enable",
      "frame_limiter_disable_vsync",
      "dd_wa_virtual_double_refresh",
      "dd_wa_dummy_plug_hdr10"
    ];
    const allBoolKeys = playniteBoolKeys.concat(otherBoolKeys);
    const toBool = (v) => {
      if (v === true || v === false)
        return v;
      if (v === 1 || v === 0)
        return !!v;
      const s = String(v ?? "").toLowerCase().trim();
      if (!s)
        return null;
      if (["true", "yes", "enable", "enabled", "on", "1"].includes(s))
        return true;
      if (["false", "no", "disable", "disabled", "off", "0"].includes(s))
        return false;
      return null;
    };
    if (data) {
      for (const k of allBoolKeys) {
        if (!Object.prototype.hasOwnProperty.call(data, k))
          continue;
        const b = toBool(data[k]);
        if (b !== null) {
          data[k] = b;
        }
      }
    }
    if (data && Boolean(data["dd_wa_dummy_plug_hdr10"])) {
      data["frame_limiter_disable_vsync"] = true;
    }
    const normalizeIdNameArray = (v, treatStringsAsIds) => {
      const out = [];
      if (Array.isArray(v)) {
        for (const el of v) {
          if (el && typeof el === "object") {
            const id = String(el.id || "");
            const name = String(el.name || "");
            if (id || name)
              out.push({ id, name });
          } else if (typeof el === "string") {
            const s = el.trim();
            if (!s)
              continue;
            out.push(treatStringsAsIds ? { id: s, name: "" } : { id: "", name: s });
          }
        }
        return out;
      }
      if (typeof v === "string") {
        try {
          const parsed = JSON.parse(v);
          return normalizeIdNameArray(parsed, treatStringsAsIds);
        } catch {
        }
        for (const s of v.split(",").map((s2) => s2.trim()).filter(Boolean)) {
          out.push(treatStringsAsIds ? { id: s, name: "" } : { id: "", name: s });
        }
      }
      return out;
    };
    const normalizeStringArray = (v) => {
      if (Array.isArray(v)) {
        return v.map((item) => String(item ?? "").trim()).filter((item) => item.length > 0);
      }
      if (typeof v === "string") {
        try {
          const parsed = JSON.parse(v);
          return normalizeStringArray(parsed);
        } catch {
        }
        return v.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      }
      return [];
    };
    if (data) {
      const record = data;
      if (Object.prototype.hasOwnProperty.call(record, "playnite_sync_categories")) {
        record["playnite_sync_categories"] = normalizeIdNameArray(
          record["playnite_sync_categories"],
          false
        );
      }
      if (Object.prototype.hasOwnProperty.call(record, "playnite_sync_plugins")) {
        record["playnite_sync_plugins"] = normalizeIdNameArray(
          record["playnite_sync_plugins"],
          true
        );
      }
      if (Object.prototype.hasOwnProperty.call(record, "playnite_exclude_categories")) {
        record["playnite_exclude_categories"] = normalizeIdNameArray(
          record["playnite_exclude_categories"],
          false
        );
      }
      if (Object.prototype.hasOwnProperty.call(record, "playnite_exclude_games")) {
        record["playnite_exclude_games"] = normalizeIdNameArray(
          record["playnite_exclude_games"],
          true
        );
      }
      if (Object.prototype.hasOwnProperty.call(record, "dd_snapshot_exclude_devices")) {
        record["dd_snapshot_exclude_devices"] = normalizeStringArray(
          record["dd_snapshot_exclude_devices"]
        );
      }
    }
    config.value = buildWrapper();
  }
  function updateOption(key, value) {
    config.value[key] = value;
  }
  function markManualDirty(_key) {
    manualDirty.value = true;
    savingState.value = "dirty";
  }
  function resetManualDirty() {
    manualDirty.value = false;
  }
  function validateManualSave() {
    if (!manualDirty.value)
      return { ok: true };
    const data = _data.value ?? {};
    const resolutionOptionKey = "dd_resolution_option";
    const defaultResolutionOption = hasDefaultKey(resolutionOptionKey) ? defaultMap[resolutionOptionKey] : void 0;
    const resOpt = Object.prototype.hasOwnProperty.call(data, resolutionOptionKey) ? data[resolutionOptionKey] : defaultResolutionOption;
    if (resOpt === "manual") {
      const manualResolutionKey = "dd_manual_resolution";
      const raw = String(data[manualResolutionKey] ?? "").trim();
      const resolutionPattern = /^\d{2,5}\s*[xX]\s*\d{2,5}$/;
      if (!resolutionPattern.test(raw)) {
        return {
          ok: false,
          message: "Invalid manual resolution. Use WIDTHxHEIGHT (e.g., 2560x1440)."
        };
      }
    }
    const refreshOptionKey = "dd_refresh_rate_option";
    const defaultRefreshOption = hasDefaultKey(refreshOptionKey) ? defaultMap[refreshOptionKey] : void 0;
    const rrOpt = Object.prototype.hasOwnProperty.call(data, refreshOptionKey) ? data[refreshOptionKey] : defaultRefreshOption;
    if (rrOpt === "manual") {
      const manualRefreshKey = "dd_manual_refresh_rate";
      const raw = String(data[manualRefreshKey] ?? "").trim();
      const valid = /^\d+(?:\.\d+)?$/.test(raw) && Number(raw) > 0;
      if (!valid) {
        return {
          ok: false,
          message: "Invalid manual refresh rate. Use a positive number, e.g., 60 or 59.94."
        };
      }
    }
    const remap = data["dd_mode_remapping"];
    if (remap && typeof remap === "object") {
      const remapObj = remap;
      const resolutionPattern = /^\d{2,5}\s*[xX]\s*\d{2,5}$/;
      const checkResolution = (value) => !value || String(value).trim() === "" || resolutionPattern.test(String(value));
      const checkNumber = (value) => !value || String(value).trim() === "" || /^\d+(?:\.\d+)?$/.test(String(value)) && Number(value) > 0;
      const resolutionBuckets = ["mixed", "resolution_only"];
      for (const bucket of resolutionBuckets) {
        const entries = Array.isArray(remapObj[bucket]) ? remapObj[bucket] : [];
        for (const entry of entries) {
          const item = entry;
          if (!checkResolution(item == null ? void 0 : item["requested_resolution"]) || !checkResolution(item == null ? void 0 : item["final_resolution"])) {
            return {
              ok: false,
              message: "Invalid resolution in Display mode remapping. Use WIDTHxHEIGHT (e.g., 1920x1080) or leave blank."
            };
          }
        }
      }
      const refreshOnly = Array.isArray(remapObj["refresh_rate_only"]) ? remapObj["refresh_rate_only"] : [];
      for (const entry of refreshOnly) {
        const item = entry;
        if (!checkNumber(item == null ? void 0 : item["requested_fps"]) || !checkNumber(item == null ? void 0 : item["final_refresh_rate"])) {
          return {
            ok: false,
            message: "Invalid refresh rate in remapping. Use a positive number or leave blank."
          };
        }
        const finalRate = item == null ? void 0 : item["final_refresh_rate"];
        if (!finalRate || String(finalRate).trim() === "") {
          return {
            ok: false,
            message: "For refresh-rate-only mappings, Final refresh rate is required."
          };
        }
      }
      const mixed = Array.isArray(remapObj["mixed"]) ? remapObj["mixed"] : [];
      for (const entry of mixed) {
        const item = entry;
        if (!checkNumber(item == null ? void 0 : item["requested_fps"]) || !checkNumber(item == null ? void 0 : item["final_refresh_rate"])) {
          return {
            ok: false,
            message: "Invalid refresh rate in remapping. Use a positive number or leave blank."
          };
        }
        const finalRes = item == null ? void 0 : item["final_resolution"];
        const finalFps = item == null ? void 0 : item["final_refresh_rate"];
        const hasFinalRes = !!finalRes && String(finalRes).trim() !== "";
        const hasFinalFps = !!finalFps && String(finalFps).trim() !== "";
        if (!hasFinalRes && !hasFinalFps) {
          return {
            ok: false,
            message: "For mixed mappings, specify at least one Final field."
          };
        }
      }
      const resolutionOnly = Array.isArray(remapObj["resolution_only"]) ? remapObj["resolution_only"] : [];
      for (const entry of resolutionOnly) {
        const item = entry;
        const finalRes = item == null ? void 0 : item["final_resolution"];
        if (!finalRes || String(finalRes).trim() === "") {
          return {
            ok: false,
            message: "For resolution-only mappings, Final resolution is required."
          };
        }
      }
    }
    return { ok: true };
  }
  async function save() {
    var _a, _b, _c;
    try {
      const v = validateManualSave();
      if (!v.ok) {
        validationError.value = v.message || "Validation failed for pending changes.";
        savingState.value = "error";
        return false;
      }
      if (Object.keys(patchQueue.value).length) {
        const ok = await flushPatchQueue();
        if (!ok)
          return false;
      }
      savingState.value = "saving";
      const body = serialize();
      const res = await http.post("/api/config", body || {}, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true
      });
      if (res.status === 200) {
        try {
          lastSaveResult.value = {
            appliedNow: !!((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.appliedNow),
            deferred: !!((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.deferred),
            restartRequired: !!((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.restartRequired)
          };
        } catch {
        }
        savingState.value = "saved";
        manualDirty.value = false;
        validationError.value = null;
        setTimeout(() => {
          if (savingState.value === "saved" && !manualDirty.value) {
            savingState.value = "idle";
          }
        }, 3e3);
        return true;
      }
      savingState.value = "error";
      return false;
    } catch (e) {
      savingState.value = "error";
      return false;
    }
  }
  function serialize() {
    if (!_data.value)
      return null;
    const out = JSON.parse(JSON.stringify(_data.value));
    for (const k of Object.keys(out)) {
      if (hasDefaultKey(k) && deepEqual(out[k], defaultMap[k]))
        delete out[k];
    }
    delete out["platform"];
    return out;
  }
  async function fetchConfig(force = false) {
    if (_data.value && !force)
      return config.value;
    loading.value = true;
    error.value = null;
    try {
      const r = await http.get("/api/config");
      if (r.status !== 200)
        throw new Error("bad status " + r.status);
      try {
        const mr = await http.get("/api/metadata");
        if (mr.status === 200 && mr.data) {
          const m = { ...mr.data };
          const raw = String(m.platform || "").toLowerCase();
          let norm = raw;
          if (raw.startsWith("win"))
            norm = "windows";
          else if (raw === "darwin" || raw.startsWith("mac"))
            norm = "macos";
          else if (raw.startsWith("lin"))
            norm = "linux";
          m.platform = norm;
          metadata.value = m;
        }
      } catch (_) {
      }
      setConfig(r.data);
      return config.value;
    } catch (e) {
      console.error("fetchConfig failed", e);
      error.value = (e == null ? void 0 : e.message) || "fetch failed";
      return null;
    } finally {
      loading.value = false;
    }
  }
  async function flushPatchQueue() {
    var _a, _b, _c;
    if (flushInFlight)
      return true;
    const payload = patchQueue.value;
    if (!payload || Object.keys(payload).length === 0)
      return true;
    patchQueue.value = {};
    flushInFlight = true;
    if (flushTimer)
      clearTimeout(flushTimer);
    flushTimer = null;
    nextFlushAt.value = null;
    try {
      savingState.value = "saving";
      const res = await http.patch("/api/config", payload, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true
      });
      if (res.status === 200) {
        try {
          lastSaveResult.value = {
            appliedNow: !!((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.appliedNow),
            deferred: !!((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.deferred),
            restartRequired: !!((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.restartRequired)
          };
        } catch {
        }
        savingState.value = "saved";
        setTimeout(() => {
          if (savingState.value === "saved" && !manualDirty.value && Object.keys(patchQueue.value).length === 0) {
            savingState.value = "idle";
          }
        }, 3e3);
        return true;
      }
      savingState.value = "error";
      return false;
    } catch (e) {
      savingState.value = "error";
      return false;
    } finally {
      flushInFlight = false;
    }
  }
  function startAutosave() {
  }
  function stopAutosave() {
    if (flushTimer)
      clearTimeout(flushTimer);
    flushTimer = null;
    nextFlushAt.value = null;
  }
  async function reloadConfig() {
    _data.value = null;
    return await fetchConfig(true);
  }
  function hasPendingPatch() {
    return Object.keys(patchQueue.value).length > 0;
  }
  function nextAutosaveAt() {
    return nextFlushAt.value || 0;
  }
  function scheduleAutosave() {
    if (flushTimer)
      clearTimeout(flushTimer);
    nextFlushAt.value = Date.now() + autosaveIntervalMs;
    flushTimer = setTimeout(() => {
      nextFlushAt.value = null;
      if (Object.keys(patchQueue.value).length === 0)
        return;
      void flushPatchQueue();
    }, autosaveIntervalMs);
  }
  return {
    // state
    tabs,
    defaults: defaultMap,
    config,
    // exposed as value for direct usage
    version,
    // increments only on user mutation
    manualDirty,
    savingState,
    metadata,
    loading,
    error,
    validationError,
    fetchConfig,
    setConfig,
    updateOption,
    markManualDirty,
    resetManualDirty,
    save,
    serialize,
    // queue/autosave utils
    flushPatchQueue,
    startAutosave,
    stopAutosave,
    reloadConfig,
    hasPendingPatch,
    autosaveIntervalMs,
    nextAutosaveAt,
    lastSaveResult
  };
});
const _hoisted_1$3 = { class: "opacity-80" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SavingStatus",
  setup(__props) {
    const route = useRoute();
    const store = useConfigStore();
    const { savingState, manualDirty, validationError } = storeToRefs(store);
    const message = useMessage();
    const hasPending = computed(() => store.hasPendingPatch());
    const restartRequired = computed(
      () => !!(store.lastSaveResult && store.lastSaveResult.restartRequired)
    );
    const intervalMs = computed(() => store.autosaveIntervalMs || 3e3);
    const nowMs = ref(Date.now());
    const nextAt = computed(() => store.nextAutosaveAt());
    const countdown = computed(() => {
      if (!hasPending.value)
        return 0;
      const ms = Math.max(0, nextAt.value - nowMs.value);
      return Math.ceil(ms / 1e3);
    });
    let timer = null;
    onMounted(() => {
      timer = setInterval(() => nowMs.value = Date.now(), 250);
    });
    onUnmounted(() => {
      if (timer)
        clearInterval(timer);
    });
    const visible = computed(() => route.path === "/settings");
    const canSave = computed(
      () => visible.value && (savingState.value === "error" || manualDirty.value === true || hasPending.value === true || savingState.value === "saved" && restartRequired.value === true)
    );
    const label = computed(() => {
      if (hasPending.value) {
        return `Auto-save in ${countdown.value}s (Tap to Save Now)`;
      }
      switch (savingState.value) {
        case "saving":
          return "Save Status: Saving…";
        case "dirty":
          return manualDirty.value ? "Save Status: Unsaved Changes (Click to Save)" : "Save Status: Unsaved Changes";
        case "saved":
          return restartRequired.value ? "Save Status: Saved; Restart Required (Tap to Apply)" : "Save Status: Saved";
        case "error":
          return "Save Status: Error (Tap to Retry)";
        default:
          return "Save Status: Waiting for Changes";
      }
    });
    const iconClass = computed(() => {
      const base2 = "fas text-xs";
      if (hasPending.value)
        return base2 + " fa-clock text-warning";
      switch (savingState.value) {
        case "saving":
          return base2 + " fa-spinner animate-spin opacity-80";
        case "dirty":
          return base2 + " fa-circle-exclamation text-warning";
        case "saved":
          return restartRequired.value ? base2 + " fa-power-off text-secondary" : base2 + " fa-check text-success";
        case "error":
          return base2 + " fa-triangle-exclamation text-danger";
        default:
          return base2 + " fa-circle opacity-60 pulse-soft";
      }
    });
    const tooltip = computed(() => {
      if (savingState.value === "error" && validationError.value)
        return validationError.value;
      if (hasPending.value)
        return `Auto-save flushes every ${Math.round(intervalMs.value / 1e3)}s. Tap to save now.`;
      if (restartRequired.value)
        return "Saved; Restart required to apply runtime changes. Tap to apply now.";
      return "This page auto-saves most changes as you edit. Some fields may require clicking Save.";
    });
    async function onClick() {
      if (!canSave.value)
        return;
      try {
        if (restartRequired.value && savingState.value === "saved") {
          await http.post(
            "/api/restart",
            {},
            { headers: { "Content-Type": "application/json" }, validateStatus: () => true }
          );
          return;
        }
        if (hasPending.value) {
          const ok2 = await store.flushPatchQueue();
          if (!ok2) {
            try {
              message.error(validationError.value || "Save failed. Check fields for errors.", {
                duration: 5e3
              });
            } catch {
            }
          }
          return;
        }
        const ok = await store.save();
        if (!ok) {
          try {
            message.error(validationError.value || "Save failed. Check fields for errors.", {
              duration: 5e3
            });
          } catch {
          }
        }
      } catch {
      }
    }
    return (_ctx, _cache) => {
      return visible.value ? (openBlock(), createBlock(unref(NButton), {
        key: 0,
        type: "default",
        strong: "",
        size: "small",
        class: normalizeClass(["flex items-center gap-2 text-xs select-none n-button--linkish", { "cursor-pointer": canSave.value }]),
        title: tooltip.value,
        onClick
      }, {
        default: withCtx(() => [
          createBaseVNode(
            "i",
            {
              class: normalizeClass(iconClass.value)
            },
            null,
            2
            /* CLASS */
          ),
          createBaseVNode(
            "span",
            _hoisted_1$3,
            toDisplayString(label.value),
            1
            /* TEXT */
          )
        ]),
        _: 1
        /* STABLE */
      }, 8, ["class", "title"])) : createCommentVNode("v-if", true);
    };
  }
});
const SavingStatus_vue_vue_type_style_index_0_scoped_28490fdc_lang = "";
const SavingStatus = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-28490fdc"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/SavingStatus.vue"]]);
const _hoisted_1$2 = { class: "theme-icon-active" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ThemeToggle",
  setup(__props) {
    const { t } = useI18n();
    const open = ref(false);
    const current = ref("auto");
    const options = computed(() => [
      {
        key: "light",
        label: t("navbar.theme_light"),
        icon: () => h(LucideIcon, { name: "fa-sun", size: 14 })
      },
      { key: "dark", label: t("navbar.theme_dark"), icon: () => h(LucideIcon, { name: "fa-moon", size: 14 }) },
      {
        key: "auto",
        label: t("navbar.theme_auto"),
        icon: () => h(LucideIcon, { name: "fa-circle-half-stroke", size: 14 })
      }
    ]);
    const activeIcon = computed(() => {
      const m = {
        light: "fa-sun",
        dark: "fa-moon",
        auto: "fa-circle-half-stroke"
      };
      return current.value === "light" || current.value === "dark" ? m[current.value] : m.auto;
    });
    function onSelect(key) {
      const v = String(key);
      setStoredTheme(v);
      setTheme(v);
      current.value = v;
      open.value = false;
    }
    onMounted(() => {
      loadAutoTheme();
      setupThemeToggleListener();
      current.value = getPreferredTheme();
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NDropdown), {
        trigger: "click",
        options: options.value,
        onSelect
      }, {
        default: withCtx(() => [
          createVNode(unref(NButton), {
            tertiary: "",
            size: "small",
            class: "flex items-center gap-2 bg-transparent border-0 shadow-none hover:bg-transparent focus:outline-none"
          }, {
            default: withCtx(() => [
              createBaseVNode("span", _hoisted_1$2, [
                createVNode(LucideIcon, {
                  name: activeIcon.value,
                  size: 14
                }, null, 8, ["name"])
              ]),
              createBaseVNode(
                "span",
                null,
                toDisplayString(_ctx.$t("navbar.toggle_theme")),
                1
                /* TEXT */
              )
            ]),
            _: 1
            /* STABLE */
          })
        ]),
        _: 1
        /* STABLE */
      }, 8, ["options"]);
    };
  }
});
const ThemeToggle = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ThemeToggle.vue"]]);
const _hoisted_1$1 = {
  key: 0,
  class: "min-w-0"
};
const _hoisted_2$1 = ["aria-label"];
const _hoisted_3$1 = {
  class: "space-y-1",
  "aria-label": "Primary navigation"
};
const _hoisted_4$1 = { key: 0 };
const _hoisted_5$1 = {
  key: 0,
  class: "flex items-center justify-between px-2"
};
const _hoisted_6$1 = {
  key: 1,
  class: "flex justify-center"
};
const _hoisted_7$1 = { key: 0 };
const _hoisted_8$1 = { class: "sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-dark/10 bg-light/90 px-4 backdrop-blur dark:border-light/10 dark:bg-dark/90 lg:hidden" };
const _hoisted_9$1 = { class: "min-w-0 flex-1" };
const _hoisted_10$1 = { class: "truncate text-sm font-semibold" };
const _hoisted_11$1 = { class: "flex min-h-full flex-col bg-surface px-3 py-4 dark:bg-surface" };
const _hoisted_12 = {
  class: "space-y-1",
  "aria-label": "Primary navigation"
};
const baseLinkClass = "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors";
const baseLinkCollapsedClass = "flex min-h-11 items-center justify-center rounded-md text-sm font-medium transition-colors";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "OperationalSidebar",
  emits: ["logout"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const route = useRoute();
    const { t } = useI18n();
    const mobileOpen = ref(false);
    const sidebarCollapsed = ref(false);
    const desktopAsideClass = computed(() => [
      "hidden h-screen shrink-0 border-r border-dark/10 bg-surface/90 py-4 dark:border-light/10 dark:bg-surface/95 lg:flex lg:flex-col transition-[width] duration-200 overflow-hidden",
      sidebarCollapsed.value ? "w-14 px-2" : "w-64 px-3"
    ]);
    const navItems = computed(() => [
      { path: "/", label: "Home", icon: "fa-gauge" },
      { path: "/pairing", label: "Pairing", icon: "fa-link" },
      { path: "/library", label: "Library", icon: "fa-gamepad" },
      { path: "/game-sources", label: "Game Sources", icon: "fa-plug" },
      { path: "/clients", label: t("clients.nav"), icon: "fa-users-cog" },
      { path: "/system", label: "System", icon: "fa-stethoscope" },
      { path: "/settings", label: t("navbar.configuration"), icon: "fa-sliders" }
    ]);
    const currentLabel = computed(() => {
      const current = navItems.value.find((item) => isActive(item.path));
      return (current == null ? void 0 : current.label) || "Jujo.Stream Server";
    });
    const logoutBtnClass = computed(
      () => (sidebarCollapsed.value ? baseLinkCollapsedClass : baseLinkClass) + " w-full text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light"
    );
    function isActive(path) {
      if (path === "/")
        return route.path === "/";
      return route.path === path || route.path.startsWith(path + "/");
    }
    function linkClass(path) {
      const base2 = sidebarCollapsed.value ? baseLinkCollapsedClass : baseLinkClass;
      if (isActive(path)) {
        return base2 + " bg-primary/12 text-primary shadow-[inset_3px_0_0_rgb(var(--color-primary))]";
      }
      return base2 + " text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light";
    }
    function logoutFromDrawer() {
      mobileOpen.value = false;
      emit("logout");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        Fragment,
        null,
        [
          createBaseVNode(
            "aside",
            {
              class: normalizeClass(desktopAsideClass.value)
            },
            [
              createCommentVNode(" Header: logo + collapse toggle "),
              createBaseVNode(
                "div",
                {
                  class: normalizeClass(["mb-6 flex items-center", sidebarCollapsed.value ? "flex-col gap-3 px-0" : "px-2"])
                },
                [
                  createVNode(unref(RouterLink), {
                    to: "/",
                    class: normalizeClass(["flex min-w-0 flex-1 items-center gap-3", sidebarCollapsed.value ? "justify-center flex-none" : ""])
                  }, {
                    default: withCtx(() => [
                      _cache[7] || (_cache[7] = createBaseVNode(
                        "img",
                        {
                          src: _imports_0,
                          alt: "Jujo.Stream Server",
                          class: "h-9 w-9 shrink-0"
                        },
                        null,
                        -1
                        /* CACHED */
                      )),
                      !sidebarCollapsed.value ? (openBlock(), createElementBlock("div", _hoisted_1$1, _cache[6] || (_cache[6] = [
                        createBaseVNode(
                          "p",
                          { class: "truncate text-sm font-semibold leading-tight" },
                          "Jujo.Stream",
                          -1
                          /* CACHED */
                        ),
                        createBaseVNode(
                          "p",
                          { class: "truncate text-xs text-dark/60 dark:text-light/60" },
                          "Server Console",
                          -1
                          /* CACHED */
                        )
                      ]))) : createCommentVNode("v-if", true)
                    ]),
                    _: 1,
                    __: [7]
                  }, 8, ["class"]),
                  createBaseVNode("button", {
                    type: "button",
                    class: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dark/50 transition-colors hover:bg-dark/8 hover:text-dark dark:text-light/50 dark:hover:bg-light/10 dark:hover:text-light",
                    "aria-label": sidebarCollapsed.value ? "Expand sidebar" : "Collapse sidebar",
                    onClick: _cache[0] || (_cache[0] = ($event) => sidebarCollapsed.value = !sidebarCollapsed.value)
                  }, [
                    createVNode(LucideIcon, {
                      name: sidebarCollapsed.value ? "fa-chevron-right" : "fa-bars",
                      size: 15
                    }, null, 8, ["name"])
                  ], 8, _hoisted_2$1)
                ],
                2
                /* CLASS */
              ),
              createBaseVNode("nav", _hoisted_3$1, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(navItems.value, (item) => {
                    return openBlock(), createBlock(unref(RouterLink), mergeProps({
                      key: item.path,
                      to: item.path,
                      class: linkClass(item.path)
                    }, { ref_for: true }, sidebarCollapsed.value ? { title: item.label } : {}), {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: item.icon,
                          size: 17
                        }, null, 8, ["name"]),
                        !sidebarCollapsed.value ? (openBlock(), createElementBlock(
                          "span",
                          _hoisted_4$1,
                          toDisplayString(item.label),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true)
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1040, ["to", "class"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              createBaseVNode(
                "div",
                {
                  class: normalizeClass(["mt-auto border-t border-dark/10 pt-4 dark:border-light/10", sidebarCollapsed.value ? "space-y-2" : "space-y-3"])
                },
                [
                  !sidebarCollapsed.value ? (openBlock(), createElementBlock("div", _hoisted_5$1, [
                    createVNode(SavingStatus),
                    createVNode(ThemeToggle)
                  ])) : (openBlock(), createElementBlock("div", _hoisted_6$1, [
                    createVNode(ThemeToggle)
                  ])),
                  createBaseVNode(
                    "button",
                    mergeProps({
                      type: "button",
                      class: logoutBtnClass.value
                    }, sidebarCollapsed.value ? { title: unref(t)("navbar.logout") } : {}, {
                      onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("logout"))
                    }),
                    [
                      createVNode(LucideIcon, {
                        name: "fa-sign-out-alt",
                        size: 17
                      }),
                      !sidebarCollapsed.value ? (openBlock(), createElementBlock(
                        "span",
                        _hoisted_7$1,
                        toDisplayString(unref(t)("navbar.logout")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ],
                    16
                    /* FULL_PROPS */
                  )
                ],
                2
                /* CLASS */
              )
            ],
            2
            /* CLASS */
          ),
          createBaseVNode("header", _hoisted_8$1, [
            createVNode(unref(NButton), {
              quaternary: "",
              circle: "",
              "aria-label": "Open navigation",
              onClick: _cache[2] || (_cache[2] = ($event) => mobileOpen.value = true)
            }, {
              default: withCtx(() => [
                createVNode(LucideIcon, {
                  name: "fa-bars",
                  size: 19
                })
              ]),
              _: 1
              /* STABLE */
            }),
            createBaseVNode("div", _hoisted_9$1, [
              createBaseVNode(
                "p",
                _hoisted_10$1,
                toDisplayString(currentLabel.value),
                1
                /* TEXT */
              )
            ]),
            createVNode(SavingStatus),
            createVNode(ThemeToggle)
          ]),
          createVNode(unref(NDrawer), {
            show: mobileOpen.value,
            "onUpdate:show": _cache[5] || (_cache[5] = ($event) => mobileOpen.value = $event),
            placement: "left",
            width: 304
          }, {
            default: withCtx(() => [
              createVNode(unref(NDrawerContent), { "body-content-style": "padding: 0;" }, {
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_11$1, [
                    createVNode(unref(RouterLink), {
                      to: "/",
                      class: "mb-5 flex min-w-0 items-center gap-3 px-2",
                      onClick: _cache[3] || (_cache[3] = ($event) => mobileOpen.value = false)
                    }, {
                      default: withCtx(() => _cache[8] || (_cache[8] = [
                        createBaseVNode(
                          "img",
                          {
                            src: _imports_0,
                            alt: "Jujo.Stream Server",
                            class: "h-9 w-9"
                          },
                          null,
                          -1
                          /* CACHED */
                        ),
                        createBaseVNode(
                          "div",
                          { class: "min-w-0" },
                          [
                            createBaseVNode("p", { class: "truncate text-sm font-semibold leading-tight" }, "Jujo.Stream"),
                            createBaseVNode("p", { class: "truncate text-xs text-dark/60 dark:text-light/60" }, "Server Console")
                          ],
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [8]
                    }),
                    createBaseVNode("nav", _hoisted_12, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(navItems.value, (item) => {
                          return openBlock(), createBlock(unref(RouterLink), {
                            key: item.path,
                            to: item.path,
                            class: normalizeClass(linkClass(item.path)),
                            onClick: _cache[4] || (_cache[4] = ($event) => mobileOpen.value = false)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: item.icon,
                                size: 17
                              }, null, 8, ["name"]),
                              createBaseVNode(
                                "span",
                                null,
                                toDisplayString(item.label),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["to", "class"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    createBaseVNode(
                      "button",
                      {
                        type: "button",
                        class: normalizeClass(["mt-auto", baseLinkClass + " w-full text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light"]),
                        onClick: logoutFromDrawer
                      },
                      [
                        createVNode(LucideIcon, {
                          name: "fa-sign-out-alt",
                          size: 17
                        }),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(unref(t)("navbar.logout")),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ])
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }, 8, ["show"])
        ],
        64
        /* STABLE_FRAGMENT */
      );
    };
  }
});
const OperationalSidebar = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/OperationalSidebar.vue"]]);
const _hoisted_1 = { class: "min-h-screen bg-light text-dark dark:bg-dark dark:text-light lg:flex" };
const _hoisted_2 = { class: "flex min-w-0 flex-1 flex-col" };
const _hoisted_3 = { class: "flex-1 overflow-auto" };
const _hoisted_4 = {
  key: 0,
  class: "fixed inset-0 z-[110] pointer-events-none"
};
const _hoisted_5 = {
  key: 0,
  class: "fixed inset-0 z-[120] flex flex-col"
};
const _hoisted_6 = { class: "relative flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto" };
const _hoisted_7 = { class: "w-full max-w-md mx-auto text-center space-y-6" };
const _hoisted_8 = { class: "space-y-2" };
const _hoisted_9 = { class: "text-2xl font-semibold tracking-tight" };
const _hoisted_10 = { class: "text-sm opacity-80 leading-relaxed" };
const _hoisted_11 = { class: "flex items-center justify-center pt-2" };
const base = "mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    const isDark = useDarkModeClassRef();
    const naiveOverrides = useNaiveThemeOverrides();
    useRoute();
    const cfgStore = useConfigStore();
    const { metadata } = storeToRefs(cfgStore);
    const loggedOut = ref(false);
    const authForOverlay = useAuthStore();
    const loginOverlay = computed(
      () => authForOverlay.ready && authForOverlay.showLoginModal && !authForOverlay.isAuthenticated && !authForOverlay.logoutInitiated
    );
    async function logout() {
      const authStore = useAuthStore();
      const connectivity = useConnectivityStore();
      try {
        await http.post("/api/auth/logout", {}, { validateStatus: () => true });
      } catch (e) {
        console.error("Logout failed:", e);
      }
      try {
        authStore.logoutInitiated = true;
      } catch {
      }
      try {
        clearSessionTokens();
      } catch {
      }
      try {
        authStore.setAuthenticated(false);
      } catch {
      }
      try {
        connectivity.stop();
      } catch {
      }
      loggedOut.value = true;
    }
    function refreshPage() {
      window.location.reload();
    }
    const sizes = {
      sm: "max-w-2xl",
      md: "max-w-3xl",
      lg: "max-w-5xl",
      xl: "max-w-7xl",
      full: "max-w-none px-0 sm:px-0 lg:px-0"
    };
    function containerClass(r) {
      var _a, _b;
      const routeSize = (_a = r == null ? void 0 : r.meta) == null ? void 0 : _a.container;
      const size = routeSize ?? ((_b = metadata.value) == null ? void 0 : _b.container) ?? "lg";
      return `${base} ${sizes[size] || sizes["lg"]}`;
    }
    return (_ctx, _cache) => {
      const _component_RouterView = resolveComponent("RouterView");
      const _component_n_button = NButton;
      return openBlock(), createBlock(unref(NConfigProvider), {
        theme: unref(isDark) ? unref(darkTheme) : null,
        "theme-overrides": unref(naiveOverrides)
      }, {
        default: withCtx(() => [
          createVNode(unref(NLoadingBarProvider), null, {
            default: withCtx(() => [
              createVNode(unref(NDialogProvider), null, {
                default: withCtx(() => [
                  createVNode(unref(NNotificationProvider), null, {
                    default: withCtx(() => [
                      createVNode(unref(NMessageProvider), null, {
                        default: withCtx(() => [
                          createBaseVNode("div", _hoisted_1, [
                            createVNode(OperationalSidebar, { onLogout: logout }),
                            createBaseVNode("div", _hoisted_2, [
                              createCommentVNode(" Content: single shared container around RouterView; width via route meta "),
                              createBaseVNode("main", _hoisted_3, [
                                createVNode(_component_RouterView, null, {
                                  default: withCtx(({ Component, route: r }) => [
                                    createBaseVNode(
                                      "div",
                                      {
                                        class: normalizeClass(containerClass(r))
                                      },
                                      [
                                        createVNode(
                                          Transition,
                                          {
                                            name: "fade-fast",
                                            mode: "out-in"
                                          },
                                          {
                                            default: withCtx(() => [
                                              (openBlock(), createBlock(resolveDynamicComponent(Component)))
                                            ]),
                                            _: 2
                                            /* DYNAMIC */
                                          },
                                          1024
                                          /* DYNAMIC_SLOTS */
                                        )
                                      ],
                                      2
                                      /* CLASS */
                                    )
                                  ]),
                                  _: 1
                                  /* STABLE */
                                })
                              ])
                            ]),
                            createCommentVNode(" Immediate background for login modal (no transition delay) "),
                            loginOverlay.value ? (openBlock(), createElementBlock("div", _hoisted_4, _cache[0] || (_cache[0] = [
                              createBaseVNode(
                                "div",
                                { class: "absolute inset-0 bg-gradient-to-br from-white/95 via-white/92 to-white/95 dark:from-black/95 dark:via-black/92 dark:to-black/95 backdrop-blur-md" },
                                null,
                                -1
                                /* CACHED */
                              )
                            ]))) : createCommentVNode("v-if", true),
                            createVNode(LoginModal),
                            createVNode(OfflineOverlay),
                            createVNode(Transition, { name: "fade-fast" }, {
                              default: withCtx(() => [
                                loggedOut.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
                                  _cache[3] || (_cache[3] = createBaseVNode(
                                    "div",
                                    { class: "absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/70 dark:from-black/70 dark:via-black/60 dark:to-black/70 backdrop-blur-md" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  createBaseVNode("div", _hoisted_6, [
                                    createBaseVNode("div", _hoisted_7, [
                                      _cache[1] || (_cache[1] = createBaseVNode(
                                        "img",
                                        {
                                          src: _imports_0,
                                          alt: "Vibepollo",
                                          class: "h-24 w-24 opacity-80 mx-auto select-none"
                                        },
                                        null,
                                        -1
                                        /* CACHED */
                                      )),
                                      createBaseVNode("div", _hoisted_8, [
                                        createBaseVNode(
                                          "h2",
                                          _hoisted_9,
                                          toDisplayString(_ctx.$t("auth.logout_success")),
                                          1
                                          /* TEXT */
                                        ),
                                        createBaseVNode(
                                          "p",
                                          _hoisted_10,
                                          toDisplayString(_ctx.$t("auth.logout_refresh_hint")),
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createBaseVNode("div", _hoisted_11, [
                                        createVNode(_component_n_button, {
                                          type: "primary",
                                          onClick: refreshPage
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              toDisplayString(_ctx.$t("auth.logout_refresh_button")) + " ",
                                              1
                                              /* TEXT */
                                            ),
                                            createVNode(LucideIcon, {
                                              name: "fa-rotate",
                                              size: 16
                                            })
                                          ]),
                                          _: 1
                                          /* STABLE */
                                        })
                                      ]),
                                      _cache[2] || (_cache[2] = createBaseVNode(
                                        "p",
                                        { class: "mt-8 text-xs opacity-60 select-none" },
                                        " Vibepollo ",
                                        -1
                                        /* CACHED */
                                      ))
                                    ])
                                  ])
                                ])) : createCommentVNode("v-if", true)
                              ]),
                              _: 1
                              /* STABLE */
                            })
                          ])
                        ]),
                        _: 1
                        /* STABLE */
                      })
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          })
        ]),
        _: 1
        /* STABLE */
      }, 8, ["theme", "theme-overrides"]);
    };
  }
});
const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/App.vue"]]);
const tailwind = "";
const useAppsStore = defineStore("apps", () => {
  const apps = ref([]);
  const currentAppUuid = ref(null);
  function setApps(list) {
    apps.value = Array.isArray(list) ? list : [];
  }
  function setCurrentApp(uuid) {
    if (typeof uuid === "string" && uuid.length > 0) {
      currentAppUuid.value = uuid;
      return;
    }
    currentAppUuid.value = null;
  }
  async function loadApps(force = false) {
    var _a;
    if (apps.value && apps.value.length > 0 && !force)
      return apps.value;
    try {
      const r = await http.get("./api/apps");
      if (r.status !== 200) {
        setApps([]);
        setCurrentApp(null);
        return apps.value;
      }
      setApps(r.data && r.data.apps || []);
      setCurrentApp(((_a = r.data) == null ? void 0 : _a.current_app) ?? null);
    } catch (e) {
      setApps([]);
      setCurrentApp(null);
    }
    return apps.value;
  }
  async function reorderApps(order) {
    var _a, _b, _c;
    try {
      const response = await http.post(
        "./api/apps/reorder",
        { order },
        { validateStatus: () => true }
      );
      if (response.status !== 200) {
        const reason = typeof ((_a = response.data) == null ? void 0 : _a.error) === "string" ? response.data.error : void 0;
        return { ok: false, error: reason || `Request failed (${response.status})` };
      }
      if (!((_b = response.data) == null ? void 0 : _b.status)) {
        const reason = typeof ((_c = response.data) == null ? void 0 : _c.error) === "string" ? response.data.error : void 0;
        return { ok: false, error: reason || "Server rejected reorder request" };
      }
      await loadApps(true);
      return { ok: true };
    } catch (err) {
      const reason = err instanceof Error ? err.message : void 0;
      return { ok: false, error: reason || "Failed to reorder applications" };
    }
  }
  async function launchApp(uuid) {
    var _a, _b;
    if (!uuid) {
      return { ok: false, error: "missing uuid" };
    }
    try {
      const response = await http.post(
        "./api/apps/launch",
        { uuid },
        { validateStatus: () => true }
      );
      if (response.status === 200 && ((_a = response.data) == null ? void 0 : _a.status)) {
        setCurrentApp(uuid);
        return { ok: true };
      }
      const reason = typeof ((_b = response.data) == null ? void 0 : _b.error) === "string" ? response.data.error : void 0;
      return {
        ok: false,
        error: reason || `Request failed (${response.status})`
      };
    } catch (err) {
      const code = err == null ? void 0 : err.code;
      if (code === "ERR_CANCELED") {
        return { ok: false, canceled: true };
      }
      const reason = err instanceof Error ? err.message : void 0;
      return { ok: false, error: reason || "Failed to launch application" };
    }
  }
  async function closeActiveApp() {
    var _a, _b;
    try {
      const response = await http.post(
        "./api/apps/close",
        {},
        { validateStatus: () => true }
      );
      if (response.status === 200 && ((_a = response.data) == null ? void 0 : _a.status)) {
        setCurrentApp(null);
        await loadApps(true);
        return { ok: true };
      }
      const reason = typeof ((_b = response.data) == null ? void 0 : _b.error) === "string" ? response.data.error : void 0;
      return { ok: false, error: reason || `Request failed (${response.status})` };
    } catch (err) {
      const reason = err instanceof Error ? err.message : void 0;
      return { ok: false, error: reason || "Failed to close application" };
    }
  }
  return {
    apps,
    setApps,
    loadApps,
    reorderApps,
    launchApp,
    closeActiveApp,
    currentAppUuid
  };
});
const chunkReloadFlag = "sunshine:chunk-reload";
if (typeof window !== "undefined") {
  try {
    window.sessionStorage.removeItem(chunkReloadFlag);
  } catch {
  }
}
const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
{
  app.config.devtools = true;
}
const platformRef = ref("");
app.provide("platform", platformRef);
initApp(app, async () => {
  await initHttpLayer();
  const connectivity = useConnectivityStore();
  connectivity.start();
  const auth = useAuthStore();
  const configStore = useConfigStore();
  const appsStore = useAppsStore();
  watch(
    () => configStore.metadata.platform,
    (p) => {
      platformRef.value = p || "";
    },
    { immediate: true }
  );
  await auth.init();
  auth.waitForAuthentication().then(async () => {
    await configStore.fetchConfig(true);
    watch(
      () => {
        var _a;
        return (_a = configStore.config) == null ? void 0 : _a.locale;
      },
      async (loc) => {
        const locale = loc ?? "en";
        await ensureLocaleLoaded(locale);
      },
      { immediate: true }
    );
    await appsStore.loadApps(true);
  });
  try {
    const prefetch = () => {
      __vitePreload(() => import("./SettingsView-84da4d94.js"), true ? ["./SettingsView-84da4d94.js","./vue-core-de07660f.js","./ConfigFieldRenderer-f2409336.js","./vendor-33781bfc.js","./SettingsView-4650019d.css"] : void 0, import.meta.url);
      __vitePreload(() => import("./LibraryView-8340ab93.js"), true ? ["./LibraryView-8340ab93.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./LibraryView-e772f451.css"] : void 0, import.meta.url);
      __vitePreload(() => import("./GameSourcesView-bd34b22b.js"), true ? ["./GameSourcesView-bd34b22b.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./GameSourcesView-19a40f83.css"] : void 0, import.meta.url);
      __vitePreload(() => import("./SystemView-3790f718.js"), true ? ["./SystemView-3790f718.js","./vue-core-de07660f.js","./vendor-33781bfc.js","./SystemView-b239ffcd.css"] : void 0, import.meta.url);
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(prefetch, { timeout: 2e3 });
    } else {
      setTimeout(prefetch, 1500);
    }
  } catch {
  }
});
export {
  LucideIcon as L,
  _export_sfc as _,
  useAuthStore as a,
  useAppsStore as b,
  __vitePreload as c,
  http as h,
  useConfigStore as u
};


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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RWQsb0JBQVUsU0FBUyxJQUFJO0FBQUEsR0FDOUI7QUFHRztBQUNGLFVBQU0sV0FBVyxNQUFNO0FBRXJCLGlDQUFPLDRCQUEwQjtBQUNqQyxpQ0FBTywyQkFBeUI7QUFDaEMsaUNBQU8sK0JBQTZCO0FBQ3BDLGlDQUFPLDBCQUF3QjtJQUFBO0FBRzdCLGVBQVEsT0FBZSx3QkFBd0IsWUFBWTtBQUM1RCxhQUFlLG9CQUFvQixVQUFVLEVBQUUsU0FBUyxJQUFNO0FBQUEsV0FDMUQ7QUFDTCxpQkFBVyxVQUFVLElBQUk7QUFBQSxJQUMzQjtBQUFBLFVBQ007QUFBQSxFQUVSO0FBQ0YsQ0FBQyIsIm5hbWVzIjpbImF1dGgiLCJ1c2VyTG9nZ2VkT3V0IiwiciIsImkxOG4iLCJhcHAiLCJMb2FkZXIyIiwiR3JpZDNYMyIsIkltYWdlTHVjaWRlIiwiQWxlcnRDaXJjbGUiLCJBbGVydFRyaWFuZ2xlIiwiQ2hlY2tDaXJjbGUyIiwiWENpcmNsZSIsIkhlbHBDaXJjbGUiLCJfb3BlbkJsb2NrIiwiX2NyZWF0ZUJsb2NrIiwiX3Jlc29sdmVEeW5hbWljQ29tcG9uZW50Iiwic2l6ZSIsInN0cm9rZVdpZHRoIiwiY2xhc3MiLCJfY3JlYXRlRWxlbWVudEJsb2NrIiwiX25vcm1hbGl6ZUNsYXNzIiwibmFtZSIsIl91bnJlZiIsIl9jcmVhdGVWTm9kZSIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfY3JlYXRlQ29tbWVudFZOb2RlIiwiX2hvaXN0ZWRfMyIsIl9ob2lzdGVkXzQiLCJfaG9pc3RlZF81IiwiX2hvaXN0ZWRfNiIsIl9ob2lzdGVkXzciLCJfaG9pc3RlZF84IiwiX2hvaXN0ZWRfOSIsIl9ob2lzdGVkXzEwIiwiX3RvRGlzcGxheVN0cmluZyIsIl9ob2lzdGVkXzExIiwiTklucHV0IiwiX0ZyYWdtZW50IiwiX1RyYW5zaXRpb24iLCJfaG9pc3RlZF8xIiwiX2hvaXN0ZWRfMiIsIiR0IiwicyIsImJhc2UiLCJvayIsIl9yZW5kZXJMaXN0IiwiX21lcmdlUHJvcHMiLCIkZW1pdCJdLCJzb3VyY2VzIjpbIi4uLy4uL3N0b3Jlcy9hdXRoLnRzIiwiLi4vLi4vaHR0cC50cyIsIi4uLy4uL2xvY2FsZS50cyIsIi4uLy4uL2xvY2FsZS1tYW5hZ2VyLnRzIiwiLi4vLi4vaW5pdC50cyIsIi4uLy4uL3JvdXRlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2ltYWdlcy9sb2dvLWFwb2xsby00NS5wbmciLCIuLi8uLi9uYWl2ZS10aGVtZS50cyIsIi4uLy4uL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUiLCIuLi8uLi90aGVtZS50cyIsIi4uLy4uL2NvbXBvbmVudHMvTG9naW5Nb2RhbC52dWUiLCIuLi8uLi9zdG9yZXMvY29ubmVjdGl2aXR5LnRzIiwiLi4vLi4vY29tcG9uZW50cy9PZmZsaW5lT3ZlcmxheS52dWUiLCIuLi8uLi9zdG9yZXMvY29uZmlnLnRzIiwiLi4vLi4vY29tcG9uZW50cy9TYXZpbmdTdGF0dXMudnVlIiwiLi4vLi4vVGhlbWVUb2dnbGUudnVlIiwiLi4vLi4vY29tcG9uZW50cy9PcGVyYXRpb25hbFNpZGViYXIudnVlIiwiLi4vLi4vQXBwLnZ1ZSIsIi4uLy4uL3N0b3Jlcy9hcHBzLnRzIiwiLi4vLi4vbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVTdG9yZSB9IGZyb20gJ3BpbmlhJztcclxuaW1wb3J0IHsgcmVmLCBSZWYgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyBodHRwLCByZWZyZXNoU2Vzc2lvbiB9IGZyb20gJ0AvaHR0cCc7XHJcblxyXG5jb25zdCByZW1lbWJlclN0b3JhZ2VLZXkgPSAnc3Vuc2hpbmUuYXV0aC5yZW1lbWJlcic7XHJcblxyXG5mdW5jdGlvbiByZWFkUmVtZW1iZXJQcmVmZXJlbmNlKCk6IGJvb2xlYW4ge1xyXG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHJlbWVtYmVyU3RvcmFnZUtleSkgPT09ICcxJztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBBdXRoU3RhdHVzUmVzcG9uc2Uge1xyXG4gIGNyZWRlbnRpYWxzX2NvbmZpZ3VyZWQ/OiBib29sZWFuO1xyXG4gIGF1dGhlbnRpY2F0ZWQ/OiBib29sZWFuO1xyXG4gIGxvZ2luX3JlcXVpcmVkPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBdXRoU2Vzc2lvbiB7XHJcbiAgaWQ6IHN0cmluZztcclxuICB1c2VybmFtZTogc3RyaW5nO1xyXG4gIGNyZWF0ZWRfYXQ6IG51bWJlcjtcclxuICBleHBpcmVzX2F0OiBudW1iZXI7XHJcbiAgcmVmcmVzaF9leHBpcmVzX2F0PzogbnVtYmVyO1xyXG4gIGxhc3Rfc2VlbjogbnVtYmVyO1xyXG4gIHJlbWVtYmVyX21lOiBib29sZWFuO1xyXG4gIGN1cnJlbnQ6IGJvb2xlYW47XHJcbiAgdXNlcl9hZ2VudD86IHN0cmluZztcclxuICByZW1vdGVfYWRkcmVzcz86IHN0cmluZztcclxuICBkZXZpY2VfbGFiZWw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbnR5cGUgQXV0aExpc3RlbmVyID0gKCkgPT4gdm9pZDtcclxuaW50ZXJmYWNlIFJlcXVpcmVMb2dpbk9wdGlvbnMge1xyXG4gIGJ5cGFzc0xvZ291dEd1YXJkPzogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gQXV0aCBzdG9yZSBub3cgZHJpdmVuIGJ5IGF4aW9zL2h0dHAgaW50ZXJjZXB0b3IgbGF5ZXIgaW5zdGVhZCBvZiBwb2xsaW5nLlxyXG4vLyBQcm92aWRlcyBzdWJzY3JpcHRpb24gZm9yIGxvZ2luIGV2ZW50cyBhbmQgYSBzZXR0ZXIgdXNlZCBieSBodHRwLmpzLlxyXG5leHBvcnQgY29uc3QgdXNlQXV0aFN0b3JlID0gZGVmaW5lU3RvcmUoJ2F1dGgnLCAoKSA9PiB7XHJcbiAgY29uc3QgaXNBdXRoZW50aWNhdGVkOiBSZWY8Ym9vbGVhbj4gPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IHJlYWR5OiBSZWY8Ym9vbGVhbj4gPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IF9saXN0ZW5lcnM6IEF1dGhMaXN0ZW5lcltdID0gW107XHJcbiAgY29uc3Qgc2hvd0xvZ2luTW9kYWw6IFJlZjxib29sZWFuPiA9IHJlZihmYWxzZSk7XHJcbiAgY29uc3QgY3JlZGVudGlhbHNDb25maWd1cmVkOiBSZWY8Ym9vbGVhbj4gPSByZWYodHJ1ZSk7XHJcbiAgY29uc3Qgc2VydmVyUmVzcG9uZGVkOiBSZWY8Ym9vbGVhbj4gPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IGxvZ2dpbmdJbjogUmVmPGJvb2xlYW4+ID0gcmVmKGZhbHNlKTtcclxuICBjb25zdCBsb2dvdXRJbml0aWF0ZWQ6IFJlZjxib29sZWFuPiA9IHJlZihmYWxzZSk7XHJcbiAgY29uc3QgX2xhc3RBdXRoU3VjY2VzczogUmVmPG51bWJlcj4gPSByZWYoMCk7XHJcbiAgY29uc3Qgc2Vzc2lvbnM6IFJlZjxBdXRoU2Vzc2lvbltdPiA9IHJlZihbXSk7XHJcbiAgY29uc3Qgc2Vzc2lvbnNMb2FkaW5nOiBSZWY8Ym9vbGVhbj4gPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IHNlc3Npb25zRXJyb3I6IFJlZjxzdHJpbmc+ID0gcmVmKCcnKTtcclxuXHJcbiAgZnVuY3Rpb24gc2V0QXV0aGVudGljYXRlZCh2OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBjb25zdCBjaGFuZ2VkID0gdiAhPT0gaXNBdXRoZW50aWNhdGVkLnZhbHVlO1xyXG4gICAgaWYgKGNoYW5nZWQpIHtcclxuICAgICAgY29uc3QgYmVjYW1lQXV0aGVkID0gIWlzQXV0aGVudGljYXRlZC52YWx1ZSAmJiB2O1xyXG4gICAgICBpc0F1dGhlbnRpY2F0ZWQudmFsdWUgPSB2O1xyXG4gICAgICBpZiAoYmVjYW1lQXV0aGVkKSB7XHJcbiAgICAgICAgX2xhc3RBdXRoU3VjY2Vzcy52YWx1ZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgbG9nb3V0SW5pdGlhdGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgZmV0Y2hTZXNzaW9ucygpLmNhdGNoKCgpID0+IHt9KTtcclxuICAgICAgICBmb3IgKGNvbnN0IGNiIG9mIF9saXN0ZW5lcnMpIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2F1dGggbGlzdGVuZXIgZXJyb3InLCBlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF2KSB7XHJcbiAgICAgICAgc2Vzc2lvbnMudmFsdWUgPSBbXTtcclxuICAgICAgICBzZXNzaW9uc0Vycm9yLnZhbHVlID0gJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEFsd2F5cyBjbG9zZSBtb2RhbCB3aGVuIG1hcmtpbmcgYXV0aGVudGljYXRlZCwgZXZlbiBpZiBzdGF0ZSB3YXMgYWxyZWFkeSB0cnVlXHJcbiAgICBpZiAodiAmJiBzaG93TG9naW5Nb2RhbC52YWx1ZSkge1xyXG4gICAgICBzaG93TG9naW5Nb2RhbC52YWx1ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdGlhdGVMb2dvdXQoKTogdm9pZCB7XHJcbiAgICAvLyBNYXJrIHRoYXQgdGhpcyBsb2dvdXQgd2FzIHVzZXItaW5pdGlhdGVkIHNvIHdlIHN1cHByZXNzIGxvZ2luIHByb21wdHNcclxuICAgIGxvZ291dEluaXRpYXRlZC52YWx1ZSA9IHRydWU7XHJcbiAgICAvLyBJbW1lZGlhdGVseSByZWZsZWN0IHVuYXV0aGVudGljYXRlZCBzdGF0ZSBhbmQgaGlkZSBsb2dpbiBtb2RhbFxyXG4gICAgc2V0QXV0aGVudGljYXRlZChmYWxzZSk7XHJcbiAgICBzaG93TG9naW5Nb2RhbC52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gU2luZ2xlIGluaXQgY2FsbCBpbnZva2VkIGR1cmluZyBhcHAgYm9vdHN0cmFwIGFmdGVyIGh0dHAgbGF5ZXIgdmFsaWRhdGlvbi5cclxuICBhc3luYyBmdW5jdGlvbiBpbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHJlYWR5LnZhbHVlKSByZXR1cm47XHJcbiAgICBjb25zdCBwcmVmZXJSZW1lbWJlciA9IHJlYWRSZW1lbWJlclByZWZlcmVuY2UoKTtcclxuXHJcbiAgICBjb25zdCBmZXRjaFN0YXR1cyA9IGFzeW5jICgpOiBQcm9taXNlPEF1dGhTdGF0dXNSZXNwb25zZSB8IG51bGw+ID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBodHRwLmdldDxBdXRoU3RhdHVzUmVzcG9uc2U+KCcvYXBpL2F1dGgvc3RhdHVzJywge1xyXG4gICAgICAgICAgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJlcyAmJiByZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEpIHtcclxuICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8qIG5vb3AgKi9cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYXBwbHlTdGF0dXMgPSAocGF5bG9hZDogQXV0aFN0YXR1c1Jlc3BvbnNlIHwgbnVsbCk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICBpZiAoIXBheWxvYWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgc2VydmVyUmVzcG9uZGVkLnZhbHVlID0gdHJ1ZTtcclxuICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmNyZWRlbnRpYWxzX2NvbmZpZ3VyZWQgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzQ29uZmlndXJlZC52YWx1ZSA9IHBheWxvYWQuY3JlZGVudGlhbHNfY29uZmlndXJlZDtcclxuICAgICAgfVxyXG4gICAgICBpZiAocGF5bG9hZC5hdXRoZW50aWNhdGVkIHx8ICFwYXlsb2FkLmxvZ2luX3JlcXVpcmVkKSB7XHJcbiAgICAgICAgc2V0QXV0aGVudGljYXRlZCh0cnVlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gISEocGF5bG9hZC5sb2dpbl9yZXF1aXJlZCAmJiAhcGF5bG9hZC5hdXRoZW50aWNhdGVkKTtcclxuICAgIH07XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgbGV0IHN0YXR1cyA9IGF3YWl0IGZldGNoU3RhdHVzKCk7XHJcbiAgICAgIGxldCByZXF1aXJlc0xvZ2luID0gYXBwbHlTdGF0dXMoc3RhdHVzKTtcclxuXHJcbiAgICAgIGlmIChyZXF1aXJlc0xvZ2luICYmICFsb2dvdXRJbml0aWF0ZWQudmFsdWUpIHtcclxuICAgICAgICBjb25zdCByZWZyZXNoZWQgPSBhd2FpdCByZWZyZXNoU2Vzc2lvbigpO1xyXG4gICAgICAgIGlmIChyZWZyZXNoZWQpIHtcclxuICAgICAgICAgIHN0YXR1cyA9IGF3YWl0IGZldGNoU3RhdHVzKCk7XHJcbiAgICAgICAgICByZXF1aXJlc0xvZ2luID0gYXBwbHlTdGF0dXMoc3RhdHVzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZXF1aXJlc0xvZ2luICYmIHByZWZlclJlbWVtYmVyICYmICFsb2dvdXRJbml0aWF0ZWQudmFsdWUpIHtcclxuICAgICAgICBjb25zdCByZXRyeURlbGF5cyA9IFsyNTAsIDYwMF07XHJcbiAgICAgICAgZm9yIChjb25zdCBkZWxheSBvZiByZXRyeURlbGF5cykge1xyXG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcclxuICAgICAgICAgIHN0YXR1cyA9IGF3YWl0IGZldGNoU3RhdHVzKCk7XHJcbiAgICAgICAgICByZXF1aXJlc0xvZ2luID0gYXBwbHlTdGF0dXMoc3RhdHVzKTtcclxuICAgICAgICAgIGlmICghcmVxdWlyZXNMb2dpbikge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZXF1aXJlc0xvZ2luICYmICFsb2dvdXRJbml0aWF0ZWQudmFsdWUpIHtcclxuICAgICAgICBzaG93TG9naW5Nb2RhbC52YWx1ZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHJlYWR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uTG9naW4oY2I6IEF1dGhMaXN0ZW5lcik6ICgpID0+IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuICgpID0+IHt9O1xyXG4gICAgX2xpc3RlbmVycy5wdXNoKGNiKTtcclxuICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQudmFsdWUpXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjYigpO1xyXG4gICAgICAgIH0gY2F0Y2gge31cclxuICAgICAgfSwgMCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBjb25zdCBpZHggPSBfbGlzdGVuZXJzLmluZGV4T2YoY2IpO1xyXG4gICAgICBpZiAoaWR4ICE9PSAtMSkgX2xpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXF1aXJlTG9naW4ob3B0aW9ucz86IFJlcXVpcmVMb2dpbk9wdGlvbnMpOiB2b2lkIHtcclxuICAgIGNvbnN0IGJ5cGFzc0d1YXJkID0gb3B0aW9ucz8uYnlwYXNzTG9nb3V0R3VhcmQgPT09IHRydWU7XHJcbiAgICBpZiAobG9nb3V0SW5pdGlhdGVkLnZhbHVlICYmICFieXBhc3NHdWFyZCkgcmV0dXJuO1xyXG4gICAgaWYgKGlzQXV0aGVudGljYXRlZC52YWx1ZSkgcmV0dXJuO1xyXG4gICAgaWYgKGJ5cGFzc0d1YXJkKSBsb2dvdXRJbml0aWF0ZWQudmFsdWUgPSBmYWxzZTtcclxuICAgIHNob3dMb2dpbk1vZGFsLnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhpZGVMb2dpbigpOiB2b2lkIHtcclxuICAgIHNob3dMb2dpbk1vZGFsLnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXRDcmVkZW50aWFsc0NvbmZpZ3VyZWQodjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgY3JlZGVudGlhbHNDb25maWd1cmVkLnZhbHVlID0gISF2O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gd2FpdEZvckF1dGhlbnRpY2F0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgd2hpbGUgKCFpc0F1dGhlbnRpY2F0ZWQudmFsdWUpIHtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMjApKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGN1cnJlbnRTZXNzaW9uSWQoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiBzZXNzaW9ucy52YWx1ZS5maW5kKChzKSA9PiBzLmN1cnJlbnQpPy5pZDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGZldGNoU2Vzc2lvbnMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIWlzQXV0aGVudGljYXRlZC52YWx1ZSkgcmV0dXJuO1xyXG4gICAgc2Vzc2lvbnNMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICAgIHNlc3Npb25zRXJyb3IudmFsdWUgPSAnJztcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL2F1dGgvc2Vzc2lvbnMnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhICYmIHJlcy5kYXRhLnN0YXR1cyAmJiBBcnJheS5pc0FycmF5KHJlcy5kYXRhLnNlc3Npb25zKSkge1xyXG4gICAgICAgIHNlc3Npb25zLnZhbHVlID0gcmVzLmRhdGEuc2Vzc2lvbnM7XHJcbiAgICAgICAgc2Vzc2lvbnNFcnJvci52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBzZXNzaW9uc0Vycm9yLnZhbHVlID0gcmVzLmRhdGEgJiYgcmVzLmRhdGEuZXJyb3IgPyByZXMuZGF0YS5lcnJvciA6ICdlcnJvcic7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHNlc3Npb25zRXJyb3IudmFsdWUgPSAnZXJyb3InO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2Vzc2lvbnNMb2FkaW5nLnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiByZXZva2VTZXNzaW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGlmICghaWQpIHJldHVybiBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZGVsZXRlKGAvYXBpL2F1dGgvc2Vzc2lvbnMvJHtpZH1gLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhICYmIHJlcy5kYXRhLnN0YXR1cykge1xyXG4gICAgICAgIHNlc3Npb25zLnZhbHVlID0gc2Vzc2lvbnMudmFsdWUuZmlsdGVyKChzZXNzaW9uKSA9PiBzZXNzaW9uLmlkICE9PSBpZCk7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRTZXNzaW9uSWQoKSA9PT0gaWQpIHtcclxuICAgICAgICAgIHNldEF1dGhlbnRpY2F0ZWQoZmFsc2UpO1xyXG4gICAgICAgICAgcmVxdWlyZUxvZ2luKHsgYnlwYXNzTG9nb3V0R3VhcmQ6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQudmFsdWUpIHtcclxuICAgICAgICAgIGF3YWl0IGZldGNoU2Vzc2lvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgLyogc3dhbGxvdyAqL1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGlzQXV0aGVudGljYXRlZCxcclxuICAgIHJlYWR5LFxyXG4gICAgc2VydmVyUmVzcG9uZGVkLFxyXG4gICAgaW5pdCxcclxuICAgIHNldEF1dGhlbnRpY2F0ZWQsXHJcbiAgICBpbml0aWF0ZUxvZ291dCxcclxuICAgIG9uTG9naW4sXHJcbiAgICBzaG93TG9naW5Nb2RhbCxcclxuICAgIHJlcXVpcmVMb2dpbixcclxuICAgIGhpZGVMb2dpbixcclxuICAgIGNyZWRlbnRpYWxzQ29uZmlndXJlZCxcclxuICAgIHNldENyZWRlbnRpYWxzQ29uZmlndXJlZCxcclxuICAgIHdhaXRGb3JBdXRoZW50aWNhdGlvbixcclxuICAgIGxvZ2dpbmdJbixcclxuICAgIGxvZ291dEluaXRpYXRlZCxcclxuICAgIHNlc3Npb25zLFxyXG4gICAgc2Vzc2lvbnNMb2FkaW5nLFxyXG4gICAgc2Vzc2lvbnNFcnJvcixcclxuICAgIGZldGNoU2Vzc2lvbnMsXHJcbiAgICByZXZva2VTZXNzaW9uLFxyXG4gICAgY3VycmVudFNlc3Npb25JZCxcclxuICAgIF9sYXN0QXV0aFN1Y2Nlc3MsXHJcbiAgfTtcclxufSk7XHJcbiIsIi8vIEF4aW9zIEhUVFAgY2xpZW50IHdpdGggY2VudHJhbGl6ZWQgYXV0aCBoYW5kbGluZ1xuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UsIEF4aW9zRXJyb3IgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyB1c2VBdXRoU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9hdXRoJztcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBTZXNzaW9uIHRva2VuIHN0b3JlIChpbi1tZW1vcnkgKyBzZXNzaW9uU3RvcmFnZSBmYWxsYmFjaylcbi8vIFRoZSBiYWNrZW5kIHVzZXMgX19Ib3N0LXByZWZpeGVkIGNvb2tpZXMgd2hpY2ggcmVxdWlyZSBIVFRQUy5cbi8vIEluIEhUVFAgZGV2IG1vZGUgKFZpdGUgcHJveHkpIHdlIHN0b3JlIHRoZSB0b2tlbiBpbiBzZXNzaW9uU3RvcmFnZSBhbmRcbi8vIGluamVjdCBpdCBhcyAgQXV0aG9yaXphdGlvbjogU2Vzc2lvbiA8dG9rZW4+ICBvbiBldmVyeSByZXF1ZXN0IGluc3RlYWQuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmNvbnN0IFNFU1NJT05fS0VZID0gJ19fanVqb19zZXNzaW9uJztcbmNvbnN0IFJFRlJFU0hfS0VZID0gJ19fanVqb19yZWZyZXNoJztcbmNvbnN0IFJFTUVNQkVSX0tFWSA9ICdzdW5zaGluZS5hdXRoLnJlbWVtYmVyJztcblxubGV0IF9zZXNzaW9uVG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xubGV0IF9yZWZyZXNoVG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5mdW5jdGlvbiBsb2FkVG9rZW5zKCk6IHZvaWQge1xuICB0cnkge1xuICAgIC8vIFByZWZlciBzZXNzaW9uU3RvcmFnZSAocGVyLXRhYiwgc2VjdXJlKTsgZmFsbCBiYWNrIHRvIGxvY2FsU3RvcmFnZSAocGVyc2lzdGVkIHdoZW4gcmVtZW1iZXJfbWU9dHJ1ZSlcbiAgICBfc2Vzc2lvblRva2VuID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTRVNTSU9OX0tFWSkgfHwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9LRVkpO1xuICAgIF9yZWZyZXNoVG9rZW4gPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFJFRlJFU0hfS0VZKSB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShSRUZSRVNIX0tFWSk7XG4gIH0gY2F0Y2gge1xuICAgIC8qIHN0b3JhZ2UgYmxvY2tlZCAqL1xuICB9XG59XG5cbmZ1bmN0aW9uIHNhdmVUb2tlbnMoc2Vzc2lvbjogc3RyaW5nIHwgbnVsbCwgcmVmcmVzaD86IHN0cmluZyB8IG51bGwsIHJlbWVtYmVyID0gZmFsc2UpOiB2b2lkIHtcbiAgX3Nlc3Npb25Ub2tlbiA9IHNlc3Npb247XG4gIGlmIChyZWZyZXNoICE9PSB1bmRlZmluZWQpIF9yZWZyZXNoVG9rZW4gPSByZWZyZXNoO1xuICB0cnkge1xuICAgIGlmIChzZXNzaW9uKSB7XG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFNFU1NJT05fS0VZLCBzZXNzaW9uKTtcbiAgICAgIC8vIFdoZW4gcmVtZW1iZXJfbWUgaXMgYWN0aXZlLCBhbHNvIHBlcnNpc3Qgc2Vzc2lvbiB0byBsb2NhbFN0b3JhZ2Ugc28gaXQgc3Vydml2ZXNcbiAgICAgIC8vIHRhYi9icm93c2VyIHJlc3RhcnRzICh3aXRoaW4gdGhlIHNlc3Npb24gVFRMIHdpbmRvdykuXG4gICAgICBpZiAocmVtZW1iZXIpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU0VTU0lPTl9LRVksIHNlc3Npb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oU0VTU0lPTl9LRVkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFNFU1NJT05fS0VZKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFNFU1NJT05fS0VZKTtcbiAgICB9XG4gICAgaWYgKHJlZnJlc2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShSRUZSRVNIX0tFWSk7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShSRUZSRVNIX0tFWSk7XG4gICAgICBpZiAocmVmcmVzaCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gcmVtZW1iZXIgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKFJFRlJFU0hfS0VZLCByZWZyZXNoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlbWVtYmVyKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShSRU1FTUJFUl9LRVksICcxJyk7XG4gICAgfSBlbHNlIGlmIChyZWZyZXNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFJFTUVNQkVSX0tFWSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvKiBzdG9yYWdlIGJsb2NrZWQgKi9cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uVG9rZW5zKCk6IHZvaWQge1xuICBzYXZlVG9rZW5zKG51bGwsIG51bGwsIGZhbHNlKTtcbiAgdHJ5IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShTRVNTSU9OX0tFWSk7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oUkVGUkVTSF9LRVkpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFJFTUVNQkVSX0tFWSk7XG4gIH0gY2F0Y2gge1xuICAgIC8qIHN0b3JhZ2UgYmxvY2tlZCAqL1xuICB9XG59XG5cbi8qKlxuICogQ2FsbGVkIGFmdGVyIGEgc3VjY2Vzc2Z1bCBsb2dpbi9yZWZyZXNoIHJlc3BvbnNlLlxuICogRXh0cmFjdHMgdG9rZW4gZnJvbSB0aGUgcmVzcG9uc2UgYm9keSAocHJlZmVycmVkKSBvciBmYWxscyBiYWNrIHRvIGNvb2tpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUxvZ2luUmVzcG9uc2UoZGF0YTogYW55LCByZW1lbWJlck92ZXJyaWRlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBzZXNzaW9uVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZCA9IGRhdGE/LnRva2VuO1xuICBjb25zdCByZWZyZXNoVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZCA9IGRhdGE/LnJlZnJlc2hfdG9rZW4gPz8gdW5kZWZpbmVkO1xuICBjb25zdCByZW1lbWJlciA9IHJlbWVtYmVyT3ZlcnJpZGUgPz8gZGF0YT8ucmVtZW1iZXJfbWUgPT09IHRydWU7XG4gIGlmIChzZXNzaW9uVG9rZW4pIHtcbiAgICBzYXZlVG9rZW5zKHNlc3Npb25Ub2tlbiwgcmVmcmVzaFRva2VuID8/IG51bGwsIHJlbWVtYmVyKTtcbiAgfVxufVxuXG4vLyBCb290c3RyYXA6IGxvYWQgYW55IHByZXZpb3VzbHkgc3RvcmVkIHRva2Vuc1xubG9hZFRva2VucygpO1xuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEF4aW9zIGluc3RhbmNlXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmV4cG9ydCBjb25zdCBodHRwID0gYXhpb3MuY3JlYXRlKHtcbiAgd2l0aENyZWRlbnRpYWxzOiB0cnVlLFxuICBoZWFkZXJzOiB7XG4gICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICB9LFxufSk7XG5cbmxldCBhdXRoSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCByZWZyZXNoUHJvbWlzZTogUHJvbWlzZTxib29sZWFuPiB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFNlc3Npb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmIChyZWZyZXNoUHJvbWlzZSkgcmV0dXJuIHJlZnJlc2hQcm9taXNlO1xuICBjb25zdCBhdXRoID0gdXNlQXV0aFN0b3JlKCk7XG4gIGNvbnN0IGNmZzogYW55ID0ge1xuICAgIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdYLVNraXAtQXV0aC1SZWZyZXNoJzogJzEnLFxuICAgIH0sXG4gIH07XG4gIGNmZy5fX3NraXBBdXRoUmVmcmVzaCA9IHRydWU7XG5cbiAgLy8gSW5jbHVkZSByZWZyZXNoIHRva2VuIGFzIEF1dGhvcml6YXRpb24gaGVhZGVyIGlmIHdlIGhhdmUgb25lIHN0b3JlZFxuICBpZiAoX3JlZnJlc2hUb2tlbikge1xuICAgIGNmZy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgUmVmcmVzaCAke19yZWZyZXNoVG9rZW59YDtcbiAgfVxuXG4gIHJlZnJlc2hQcm9taXNlID0gaHR0cFxuICAgIC5wb3N0KCcvYXBpL2F1dGgvcmVmcmVzaCcsIHt9LCBjZmcpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgaWYgKHJlcz8uc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEgJiYgKHJlcy5kYXRhIGFzIGFueSkuc3RhdHVzKSB7XG4gICAgICAgIGFwcGx5TG9naW5SZXNwb25zZShyZXMuZGF0YSk7XG4gICAgICAgIGF1dGguc2V0QXV0aGVudGljYXRlZCh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjbGVhclNlc3Npb25Ub2tlbnMoKTtcbiAgICAgIGF1dGguc2V0QXV0aGVudGljYXRlZChmYWxzZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgY2xlYXJTZXNzaW9uVG9rZW5zKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICByZWZyZXNoUHJvbWlzZSA9IG51bGw7XG4gICAgfSk7XG4gIHJldHVybiByZWZyZXNoUHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gaW5pdEF1dGhIYW5kbGluZygpOiB2b2lkIHtcbiAgaWYgKGF1dGhJbml0aWFsaXplZCkgcmV0dXJuO1xuICBhdXRoSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBjb25zdCBhdXRoID0gdXNlQXV0aFN0b3JlKCk7XG5cbiAgLy8g4pSA4pSAIFJlcXVlc3QgaW50ZXJjZXB0b3Ig4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIC8vIDEuIEJsb2NrIHVuYXV0aGVudGljYXRlZCByZXF1ZXN0cyAoZXhjZXB0IHB1YmxpYyBlbmRwb2ludHMpXG4gIC8vIDIuIEluamVjdCBBdXRob3JpemF0aW9uOiBTZXNzaW9uIDx0b2tlbj4gaGVhZGVyIHdoZW4gd2UgaGF2ZSBhIHN0b3JlZCB0b2tlblxuICBodHRwLmludGVyY2VwdG9ycy5yZXF1ZXN0LnVzZSgoY29uZmlnKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHVybFJhdyA9IFN0cmluZyhjb25maWcudXJsIHx8ICcnKTtcbiAgICAgIGxldCBwYXRoID0gdXJsUmF3O1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwodXJsUmF3LCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICAgICAgcGF0aCA9IHUucGF0aG5hbWU7XG4gICAgICB9IGNhdGNoIHt9XG5cbiAgICAgIGlmICgoYXV0aCBhcyBhbnkpLmxvZ291dEluaXRpYXRlZCkge1xuICAgICAgICBjb25zdCBlcnI6IGFueSA9IG5ldyBFcnJvcignUmVxdWVzdCBibG9ja2VkOiB1c2VyIGxvZ2dlZCBvdXQnKTtcbiAgICAgICAgZXJyLmNvZGUgPSAnRVJSX0NBTkNFTEVEJztcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFsbG93V2hlbkxvZ2dlZE91dCA9XG4gICAgICAgIC8oXFxzKlxcL2FwaVxcL2F1dGhcXC8obG9naW58c3RhdHVzfHJlZnJlc2gpXFxifFxccypcXC9hcGlcXC9wYXNzd29yZFxcYnxcXHMqXFwvYXBpXFwvY29uZmlnTG9jYWxlXFxiKS8udGVzdChcbiAgICAgICAgICBwYXRoLFxuICAgICAgICApO1xuICAgICAgY29uc3QgaXNDcmVkZW50aWFsRXhjaGFuZ2UgPVxuICAgICAgICAvKFxccypcXC9hcGlcXC9hdXRoXFwvKGxvZ2lufHJlZnJlc2gpXFxifFxccypcXC9hcGlcXC9wYXNzd29yZFxcYikvLnRlc3QocGF0aCk7XG4gICAgICBjb25zdCBhbGxvd1VuYXV0aGVudGljYXRlZCA9IChjb25maWcgYXMgYW55KT8uX19hbGxvd1VuYXV0aGVudGljYXRlZCA9PT0gdHJ1ZTtcblxuICAgICAgaWYgKCFhdXRoLmlzQXV0aGVudGljYXRlZCAmJiAhYWxsb3dXaGVuTG9nZ2VkT3V0ICYmICFhbGxvd1VuYXV0aGVudGljYXRlZCAmJiBhdXRoLnNlcnZlclJlc3BvbmRlZCkge1xuICAgICAgICBjb25zdCBlcnI6IGFueSA9IG5ldyBFcnJvcignUmVxdWVzdCBibG9ja2VkOiB1bmF1dGhlbnRpY2F0ZWQnKTtcbiAgICAgICAgZXJyLmNvZGUgPSAnRVJSX0NBTkNFTEVEJztcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICB9XG5cbiAgICAgIC8vIEluamVjdCBzdG9yZWQgc2Vzc2lvbiB0b2tlbiBhcyBBdXRob3JpemF0aW9uIGhlYWRlclxuICAgICAgLy8gVGhpcyBieXBhc3NlcyBfX0hvc3QtIGNvb2tpZSByZXN0cmljdGlvbnMgaW4gSFRUUCBkZXYgbW9kZVxuICAgICAgaWYgKF9zZXNzaW9uVG9rZW4gJiYgIWlzQ3JlZGVudGlhbEV4Y2hhbmdlKSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgPz8ge307XG4gICAgICAgIC8vIE9ubHkgaW5qZWN0IGlmIG5vdCBhbHJlYWR5IHNldCAoZG9uJ3Qgb3ZlcndyaXRlIGV4cGxpY2l0IEJlYXJlciB0b2tlbnMpXG4gICAgICAgIGlmICghY29uZmlnLmhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSkge1xuICAgICAgICAgIGNvbmZpZy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgU2Vzc2lvbiAke19zZXNzaW9uVG9rZW59YDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHRyaWdnZXJMb2dpbk1vZGFsKCk6IHZvaWQge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICBhdXRoLnJlcXVpcmVMb2dpbih7IGJ5cGFzc0xvZ291dEd1YXJkOiB0cnVlIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogbm9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIC8vIOKUgOKUgCBSZXNwb25zZSBpbnRlcmNlcHRvciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgaHR0cC5pbnRlcmNlcHRvcnMucmVzcG9uc2UudXNlKFxuICAgIGFzeW5jIChyZXNwb25zZTogQXhpb3NSZXNwb25zZSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzdW5zaGluZTpvbmxpbmUnKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge31cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuICAgIGFzeW5jIChlcnJvcjogQXhpb3NFcnJvcikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY29uc3QgaXNDYW5jZWxlZCA9IChlcnJvciBhcyBhbnkpPy5jb2RlID09PSAnRVJSX0NBTkNFTEVEJztcbiAgICAgICAgICBjb25zdCBhdXRoID0gdXNlQXV0aFN0b3JlKCk7XG4gICAgICAgICAgY29uc3QgdXNlckxvZ2dlZE91dCA9IChhdXRoIGFzIGFueSkubG9nb3V0SW5pdGlhdGVkID09PSB0cnVlO1xuICAgICAgICAgIGlmICghZXJyb3I/LnJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2FuY2VsZWQgJiYgIXVzZXJMb2dnZWRPdXQpIHtcbiAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzdW5zaGluZTpvZmZsaW5lJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3N1bnNoaW5lOm9ubGluZScpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge31cblxuICAgICAgY29uc3Qgc3RhdHVzID0gZXJyb3I/LnJlc3BvbnNlPy5zdGF0dXM7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlcXVlc3Q6IGFueSA9IGVycm9yLmNvbmZpZyB8fCB7fTtcbiAgICAgIGNvbnN0IHNraXBBdXRoUmV0cnkgPVxuICAgICAgICBvcmlnaW5hbFJlcXVlc3Q/Ll9fc2tpcEF1dGhSZWZyZXNoID09PSB0cnVlIHx8XG4gICAgICAgIChvcmlnaW5hbFJlcXVlc3Q/LmhlYWRlcnMgJiYgb3JpZ2luYWxSZXF1ZXN0LmhlYWRlcnNbJ1gtU2tpcC1BdXRoLVJlZnJlc2gnXSk7XG4gICAgICBjb25zdCBpc0F1dGhSZXF1ZXN0ID0gL1xcL2FwaVxcL2F1dGhcXC8obG9naW58cmVmcmVzaClcXGIvLnRlc3QoXG4gICAgICAgIFN0cmluZyhvcmlnaW5hbFJlcXVlc3Q/LnVybCB8fCAnJyksXG4gICAgICApO1xuICAgICAgY29uc3QgdXNlckxvZ2dlZE91dCA9IChhdXRoIGFzIGFueSkubG9nb3V0SW5pdGlhdGVkID09PSB0cnVlO1xuXG4gICAgICBpZiAoc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgLy8gR3JhY2UgcGVyaW9kOiA1cyBhZnRlciBsb2dpbiwgc3VwcHJlc3Mgc3RhdGUgbXV0YXRpb25zIGFuZCBtb2RhbFxuICAgICAgICBjb25zdCBsYXN0QXV0aCA9IChhdXRoIGFzIGFueSkuX2xhc3RBdXRoU3VjY2VzcyBhcyBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGluR3JhY2VQZXJpb2QgPSBsYXN0QXV0aCA/IERhdGUubm93KCkgLSBsYXN0QXV0aCA8IDUwMDAgOiBmYWxzZTtcbiAgICAgICAgaWYgKGluR3JhY2VQZXJpb2QpIHtcbiAgICAgICAgICBpZiAoIW9yaWdpbmFsUmVxdWVzdC5fX2dyYWNlUmV0cnkpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5fX2dyYWNlUmV0cnkgPSB0cnVlO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgNDAwKSk7XG4gICAgICAgICAgICByZXR1cm4gaHR0cChvcmlnaW5hbFJlcXVlc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgW0F1dGhdIDQwMSBzdXBwcmVzc2VkIChncmFjZSBwZXJpb2QpOiAke29yaWdpbmFsUmVxdWVzdD8udXJsIHx8ICd1bmtub3duJ31gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE91dHNpZGUgZ3JhY2UgcGVyaW9kOiB0cnkgdG9rZW4gcmVmcmVzaFxuICAgICAgICBpZiAoIXNraXBBdXRoUmV0cnkgJiYgIWlzQXV0aFJlcXVlc3QgJiYgIXVzZXJMb2dnZWRPdXQpIHtcbiAgICAgICAgICBjb25zdCByZWZyZXNoZWQgPSBhd2FpdCByZWZyZXNoU2Vzc2lvbigpO1xuICAgICAgICAgIGlmIChyZWZyZXNoZWQpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5fX3NraXBBdXRoUmVmcmVzaCA9IHRydWU7XG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3QuX19pc1JldHJ5UmVxdWVzdCA9IHRydWU7XG4gICAgICAgICAgICAvLyBVcGRhdGUgQXV0aG9yaXphdGlvbiBoZWFkZXIgb24gdGhlIHJldHJ5IHJlcXVlc3RcbiAgICAgICAgICAgIGlmIChfc2Vzc2lvblRva2VuKSB7XG4gICAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5oZWFkZXJzID0gb3JpZ2luYWxSZXF1ZXN0LmhlYWRlcnMgPz8ge307XG4gICAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgU2Vzc2lvbiAke19zZXNzaW9uVG9rZW59YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBodHRwKG9yaWdpbmFsUmVxdWVzdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJTZXNzaW9uVG9rZW5zKCk7XG4gICAgICAgIGlmIChhdXRoLmlzQXV0aGVudGljYXRlZCkgYXV0aC5zZXRBdXRoZW50aWNhdGVkKGZhbHNlKTtcbiAgICAgICAgaWYgKCF1c2VyTG9nZ2VkT3V0KSB0cmlnZ2VyTG9naW5Nb2RhbCgpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZXJyb3I/LnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwMCAmJlxuICAgICAgICBlcnJvcj8ucmVzcG9uc2U/LmRhdGEgJiZcbiAgICAgICAgL0NyZWRlbnRpYWxzIG5vdCBjb25maWd1cmVkL2kudGVzdChKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKSlcbiAgICAgICkge1xuICAgICAgICBhdXRoLnNldENyZWRlbnRpYWxzQ29uZmlndXJlZChmYWxzZSk7XG4gICAgICAgIHRyaWdnZXJMb2dpbk1vZGFsKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH0sXG4gICk7XG59XG5cbi8vIENhbGxlZCBmcm9tIG1haW4gaW5pdCBhZnRlciBwaW5pYSBpcyByZWFkeVxuZXhwb3J0IGZ1bmN0aW9uIGluaXRIdHRwTGF5ZXIoKTogdm9pZCB7XG4gIGluaXRBdXRoSGFuZGxpbmcoKTtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUkxOG4sIEkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcblxyXG4vLyBJbXBvcnQgb25seSB0aGUgZmFsbGJhY2sgbGFuZ3VhZ2UgZmlsZXNcclxuaW1wb3J0IGVuIGZyb20gJ0AvcHVibGljL2Fzc2V0cy9sb2NhbGUvZW4uanNvbic7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5cclxuaW50ZXJmYWNlIExvY2FsZVJlc3BvbnNlIHtcclxuICBsb2NhbGU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbnR5cGUgTWVzc2FnZVNjaGVtYSA9IHR5cGVvZiBlbjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uICgpOiBQcm9taXNlPGFueT4ge1xyXG4gIGNvbnN0IHI6IExvY2FsZVJlc3BvbnNlID0gYXdhaXQgaHR0cFxyXG4gICAgLmdldCgnLi9hcGkvY29uZmlnTG9jYWxlJywgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KVxyXG4gICAgLnRoZW4oKHIpID0+IChyLnN0YXR1cyA9PT0gMjAwID8gci5kYXRhIDoge30pKVxyXG4gICAgLmNhdGNoKCgpID0+ICh7fSkpO1xyXG4gIGNvbnN0IGxvY2FsZSA9IHIubG9jYWxlID8/ICdlbic7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpPy5zZXRBdHRyaWJ1dGUoJ2xhbmcnLCBsb2NhbGUpO1xyXG4gIGNvbnN0IG1lc3NhZ2VzOiBSZWNvcmQ8c3RyaW5nLCBNZXNzYWdlU2NoZW1hPiA9IHtcclxuICAgIGVuLFxyXG4gIH07XHJcbiAgdHJ5IHtcclxuICAgIGlmIChsb2NhbGUgIT09ICdlbicpIHtcclxuICAgICAgY29uc3QgciA9IGF3YWl0IGh0dHBcclxuICAgICAgICAuZ2V0KGAvYXNzZXRzL2xvY2FsZS8ke2xvY2FsZX0uanNvbmAsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSlcclxuICAgICAgICAudGhlbigocikgPT4gKHIuc3RhdHVzID09PSAyMDAgPyByLmRhdGEgOiBudWxsKSk7XHJcbiAgICAgIGlmIChyKSBtZXNzYWdlc1tsb2NhbGVdID0gcjtcclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZG93bmxvYWQgdHJhbnNsYXRpb25zJywgZSk7XHJcbiAgfVxyXG4gIGNvbnN0IGkxOG4gPSBjcmVhdGVJMThuKHtcclxuICAgIC8vIFVzZSB0aGUgQ29tcG9zaXRpb24gQVBJIGFuZCBpbmplY3QgZ2xvYmFsIGhlbHBlcnMgc28gYCR0YCB3b3JrcyBpbiB0ZW1wbGF0ZXNcclxuICAgIGxlZ2FjeTogZmFsc2UsXHJcbiAgICBnbG9iYWxJbmplY3Rpb246IHRydWUsXHJcbiAgICBsb2NhbGU6IGxvY2FsZSwgLy8gc2V0IGxvY2FsZVxyXG4gICAgZmFsbGJhY2tMb2NhbGU6ICdlbicsIC8vIHNldCBmYWxsYmFjayBsb2NhbGVcclxuICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcclxuICB9KTtcclxuICByZXR1cm4gaTE4bjtcclxufVxyXG4iLCJpbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcclxuXHJcbmxldCBfaTE4bjogYW55ID0gbnVsbDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRJMThuR2xvYmFsKGkxOG46IGFueSkge1xyXG4gIF9pMThuID0gaTE4bjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEkxOG5HbG9iYWwoKSB7XHJcbiAgcmV0dXJuIF9pMThuO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlTG9jYWxlTG9hZGVkKGxvY2FsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFfaTE4bikgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICAvLyBTaG9ydC1jaXJjdWl0IGlmIHdlIGFscmVhZHkgaGF2ZSBtZXNzYWdlcyBmb3IgdGhpcyBsb2NhbGVcclxuICAgIGNvbnN0IGhhcyA9IF9pMThuLmdsb2JhbC5hdmFpbGFibGVMb2NhbGVzPy5pbmNsdWRlcyhsb2NhbGUpO1xyXG4gICAgaWYgKCFoYXMpIHtcclxuICAgICAgY29uc3QgciA9IGF3YWl0IGh0dHBcclxuICAgICAgICAuZ2V0KGAvYXNzZXRzL2xvY2FsZS8ke2xvY2FsZX0uanNvbmAsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSlcclxuICAgICAgICAudGhlbigocikgPT4gKHIuc3RhdHVzID09PSAyMDAgPyByLmRhdGEgOiBudWxsKSk7XHJcbiAgICAgIGlmIChyKSB7XHJcbiAgICAgICAgX2kxOG4uZ2xvYmFsLnNldExvY2FsZU1lc3NhZ2UobG9jYWxlLCByKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgX2kxOG4uZ2xvYmFsLmxvY2FsZSA9IGxvY2FsZTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKT8uc2V0QXR0cmlidXRlKCdsYW5nJywgbG9jYWxlKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdlbnN1cmVMb2NhbGVMb2FkZWQgZmFpbGVkJywgZSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IEFwcCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCBpMThuIGZyb20gJ0AvbG9jYWxlJztcclxuaW1wb3J0IHsgc2V0STE4bkdsb2JhbCB9IGZyb20gJ0AvbG9jYWxlLW1hbmFnZXInO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBcHAoXHJcbiAgYXBwOiBBcHA8RWxlbWVudD4sXHJcbiAgY29uZmlnPzogKGFwcDogQXBwPEVsZW1lbnQ+KSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCxcclxuKTogdm9pZCB7XHJcbiAgLy8gV2FpdCBmb3IgbG9jYWxlIGluaXRpYWxpemF0aW9uLCB0aGVuIHJ1biBvcHRpb25hbCBhcHAtbGV2ZWwgc2V0dXAgKGxpa2UgbG9hZGluZyBjb25maWcpXHJcbiAgLy8gSWYgYSBgY29uZmlnYCBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCBtYXkgYmUgYXN5bmMg4oCUIHJ1biBpdCBiZWZvcmUgbW91bnRpbmcgc29cclxuICAvLyBzdG9yZXMgYW5kIGNvbXBvbmVudHMgc2VlIHRoZSBydW50aW1lIGNvbmZpZyBpbW1lZGlhdGVseS5cclxuICBpMThuKCkudGhlbihhc3luYyAoaTE4bikgPT4ge1xyXG4gICAgYXBwLnVzZShpMThuKTtcclxuICAgIGFwcC5wcm92aWRlKCdpMThuJywgaTE4bi5nbG9iYWwpO1xyXG4gICAgLy8gZXhwb3NlIGkxOG4gaW5zdGFuY2UgZm9yIHJ1bnRpbWUgbG9jYWxlIHN3aXRjaGluZ1xyXG4gICAgc2V0STE4bkdsb2JhbChpMThuKTtcclxuICAgIGlmIChjb25maWcpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBhbGxvdyBgY29uZmlnYCB0byBiZSBhc3luYyBhbmQgd2FpdCBmb3IgaXQgdG8gY29tcGxldGVcclxuICAgICAgICBhd2FpdCBjb25maWcoYXBwKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vIHN3YWxsb3cgZXJyb3JzIHRvIGF2b2lkIGJsb2NraW5nIGFwcCBlbnRpcmVseVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2luaXRBcHA6IGNvbmZpZyBsb2FkZXIgZmFpbGVkJywgZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE1vdW50IGFmdGVyIGFueSBlYXJseSBpbml0aWFsaXphdGlvblxyXG4gICAgYXBwLm1vdW50KCcjYXBwJyk7XHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHsgY3JlYXRlUm91dGVyLCBjcmVhdGVXZWJIaXN0b3J5LCBSb3V0ZUxvY2F0aW9uTm9ybWFsaXplZCB9IGZyb20gJ3Z1ZS1yb3V0ZXInO1xyXG5pbXBvcnQgeyB1c2VBdXRoU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9hdXRoJztcclxuXHJcbi8vIFJvdXRlLWxldmVsIGNvZGUgc3BsaXR0aW5nIHZpYSBkeW5hbWljIGltcG9ydHNcclxuLy8gRWFjaCB2aWV3IGJlY29tZXMgYSBzZXBhcmF0ZSBjaHVuayBsb2FkZWQgb24gZGVtYW5kXHJcbmNvbnN0IERhc2hib2FyZFZpZXcgPSAoKSA9PiBpbXBvcnQoJ0Avdmlld3MvRGFzaGJvYXJkVmlldy52dWUnKTtcclxuY29uc3QgTGlicmFyeVZpZXcgPSAoKSA9PiBpbXBvcnQoJ0Avdmlld3MvTGlicmFyeVZpZXcudnVlJyk7XHJcbmNvbnN0IEdhbWVTb3VyY2VzVmlldyA9ICgpID0+IGltcG9ydCgnQC92aWV3cy9HYW1lU291cmNlc1ZpZXcudnVlJyk7XHJcbmNvbnN0IFN5c3RlbVZpZXcgPSAoKSA9PiBpbXBvcnQoJ0Avdmlld3MvU3lzdGVtVmlldy52dWUnKTtcclxuY29uc3QgU2V0dGluZ3NWaWV3ID0gKCkgPT4gaW1wb3J0KCdAL3ZpZXdzL1NldHRpbmdzVmlldy52dWUnKTtcclxuY29uc3QgVHJvdWJsZXNob290aW5nVmlldyA9ICgpID0+IGltcG9ydCgnQC92aWV3cy9Ucm91Ymxlc2hvb3RpbmdWaWV3LnZ1ZScpO1xyXG5jb25zdCBDbGllbnRNYW5hZ2VtZW50VmlldyA9ICgpID0+IGltcG9ydCgnQC92aWV3cy9DbGllbnRNYW5hZ2VtZW50Vmlldy52dWUnKTtcclxuY29uc3QgV2ViUnRjQ2xpZW50VmlldyA9ICgpID0+IGltcG9ydCgnQC92aWV3cy9XZWJSdGNDbGllbnRWaWV3LnZ1ZScpO1xyXG5cclxuY29uc3Qgcm91dGVzID0gW1xyXG4gIHsgcGF0aDogJy8nLCBjb21wb25lbnQ6IERhc2hib2FyZFZpZXcgfSxcclxuICB7IHBhdGg6ICcvcGFpcmluZycsIGNvbXBvbmVudDogQ2xpZW50TWFuYWdlbWVudFZpZXcgfSxcclxuICB7IHBhdGg6ICcvbGlicmFyeScsIGNvbXBvbmVudDogTGlicmFyeVZpZXcgfSxcclxuICB7IHBhdGg6ICcvYXBwbGljYXRpb25zJywgY29tcG9uZW50OiAoKSA9PiBpbXBvcnQoJ0Avdmlld3MvQXBwbGljYXRpb25zVmlldy52dWUnKSB9LFxyXG4gIHsgcGF0aDogJy9nYW1lLXNvdXJjZXMnLCBjb21wb25lbnQ6IEdhbWVTb3VyY2VzVmlldyB9LFxyXG4gIHsgcGF0aDogJy9zeXN0ZW0nLCBjb21wb25lbnQ6IFN5c3RlbVZpZXcgfSxcclxuICB7IHBhdGg6ICcvc2V0dGluZ3MnLCBjb21wb25lbnQ6IFNldHRpbmdzVmlldywgbWV0YTogeyBjb250YWluZXI6ICdsZycgfSB9LFxyXG4gIHsgcGF0aDogJy9sb2dzJywgY29tcG9uZW50OiBEYXNoYm9hcmRWaWV3IH0sXHJcbiAgeyBwYXRoOiAnL3Ryb3VibGVzaG9vdGluZycsIGNvbXBvbmVudDogVHJvdWJsZXNob290aW5nVmlldyB9LFxyXG4gIHsgcGF0aDogJy9jbGllbnRzJywgY29tcG9uZW50OiBDbGllbnRNYW5hZ2VtZW50VmlldyB9LFxyXG4gIHsgcGF0aDogJy93ZWJydGMnLCBjb21wb25lbnQ6IFdlYlJ0Y0NsaWVudFZpZXcsIG1ldGE6IHsgY29udGFpbmVyOiAnZnVsbCcgfSB9LFxyXG4gIC8vIExlZ2FjeS91bmtub3duIHJvdXRlcyDihpIgcmVkaXJlY3QgdG8gaG9tZVxyXG4gIHsgcGF0aDogJy93ZWxjb21lJywgcmVkaXJlY3Q6ICcvJyB9LFxyXG4gIHsgcGF0aDogJy9sb2dpbicsIHJlZGlyZWN0OiAnLycgfSxcclxuICB7IHBhdGg6ICcvcGFzc3dvcmQnLCByZWRpcmVjdDogJy8nIH0sXHJcbiAgeyBwYXRoOiAnLzpwYXRoTWF0Y2goLiopKicsIHJlZGlyZWN0OiAnLycgfSxcclxuXTtcclxuXHJcbmNvbnN0IENIVU5LX1JFTE9BRF9GTEFHID0gJ3N1bnNoaW5lOmNodW5rLXJlbG9hZCc7XHJcbmNvbnN0IGNodW5rRXJyb3JQYXR0ZXJucyA9IFtcclxuICAnRmFpbGVkIHRvIGZldGNoIGR5bmFtaWNhbGx5IGltcG9ydGVkIG1vZHVsZScsXHJcbiAgJ0ltcG9ydGluZyBhIG1vZHVsZSBzY3JpcHQgZmFpbGVkJyxcclxuXTtcclxuXHJcbmZ1bmN0aW9uIGlzQ2h1bmtMb2FkRXJyb3IoZXJyb3I6IHVua25vd24pOiBib29sZWFuIHtcclxuICBpZiAoIWVycm9yKSByZXR1cm4gZmFsc2U7XHJcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcclxuICAgIHJldHVybiBjaHVua0Vycm9yUGF0dGVybnMuc29tZSgocGF0dGVybikgPT4gZXJyb3IuaW5jbHVkZXMocGF0dGVybikpO1xyXG4gIH1cclxuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgPz8gJyc7XHJcbiAgICBpZiAoY2h1bmtFcnJvclBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+IG1lc3NhZ2UuaW5jbHVkZXMocGF0dGVybikpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGVycm9yLm5hbWUgPT09ICdDaHVua0xvYWRFcnJvcicpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoJ2NvZGUnIGluIGVycm9yICYmIHR5cGVvZiAoZXJyb3IgYXMgeyBjb2RlPzogdW5rbm93biB9KS5jb2RlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBjb25zdCBjb2RlID0gKGVycm9yIGFzIHsgY29kZT86IHN0cmluZyB9KS5jb2RlID8/ICcnO1xyXG4gICAgICByZXR1cm4gY29kZSA9PT0gJ0VSUl9NT0RVTEVfTk9UX0ZPVU5EJztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgcm91dGVyID0gY3JlYXRlUm91dGVyKHtcclxuICAvLyBVc2UgSFRNTDUgaGlzdG9yeSBtb2RlIChubyAjIGluIFVSTHMpXHJcbiAgaGlzdG9yeTogY3JlYXRlV2ViSGlzdG9yeSgnLycpLFxyXG4gIHJvdXRlcyxcclxufSk7XHJcblxyXG4vLyBMaWdodHdlaWdodCBndWFyZDogaWYgbmF2aWdhdGluZyB0byBhIHByb3RlY3RlZCByb3V0ZSBhbmQgbm90IGF1dGhlbnRpY2F0ZWQsXHJcbi8vIG9wZW4gbG9naW4gbW9kYWwgKGluLW1lbW9yeSByZWRpcmVjdCkgYnV0IGFsbG93IG5hdmlnYXRpb24gc28gVVJMIHN0YXlzLlxyXG5yb3V0ZXIuYmVmb3JlRWFjaChhc3luYyAoX3RvOiBSb3V0ZUxvY2F0aW9uTm9ybWFsaXplZCkgPT4ge1xyXG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGF1dGggPSB1c2VBdXRoU3RvcmUoKTtcclxuICAgIC8vIEVuc3VyZSBhdXRoIHN0b3JlIGluaXRpYWxpemVkIGJlZm9yZSByb3V0ZSBjb21wb25lbnRzIG1vdW50XHJcbiAgICBpZiAoIWF1dGgucmVhZHkgJiYgdHlwZW9mIGF1dGguaW5pdCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGF1dGguaW5pdCgpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gT25seSByZXF1aXJlIGxvZ2luIGlmIHRoZSBzZXJ2ZXIgYWN0dWFsbHkgcmVzcG9uZGVkIChhdm9pZHMgYmxvY2tpbmcgc3RhdGljIHByZXZpZXdzKVxyXG4gICAgLy8gU2tpcCBpZiBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQsIGFjdGl2ZWx5IGxvZ2dpbmcgaW4sIG9yIG1vZGFsIGFscmVhZHkgdmlzaWJsZVxyXG4gICAgaWYgKFxyXG4gICAgICBhdXRoLnNlcnZlclJlc3BvbmRlZCAmJlxyXG4gICAgICAhYXV0aC5pc0F1dGhlbnRpY2F0ZWQgJiZcclxuICAgICAgIWF1dGgubG9nZ2luZ0luICYmXHJcbiAgICAgICFhdXRoLnNob3dMb2dpbk1vZGFsXHJcbiAgICApIHtcclxuICAgICAgYXV0aC5yZXF1aXJlTG9naW4oKTtcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxuICAvLyBBbHdheXMgYWxsb3cgbmF2aWdhdGlvbiBzbyBVUkwgcmVtYWlucyBpbnRhY3RcclxuICByZXR1cm4gdHJ1ZTtcclxufSk7XHJcblxyXG5yb3V0ZXIub25FcnJvcigoZXJyb3IpID0+IHtcclxuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuICBpZiAoIWlzQ2h1bmtMb2FkRXJyb3IoZXJyb3IpKSByZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHN0b3JhZ2UgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7XHJcbiAgICBpZiAoc3RvcmFnZSAmJiAhc3RvcmFnZS5nZXRJdGVtKENIVU5LX1JFTE9BRF9GTEFHKSkge1xyXG4gICAgICBzdG9yYWdlLnNldEl0ZW0oQ0hVTktfUkVMT0FEX0ZMQUcsIERhdGUubm93KCkudG9TdHJpbmcoKSk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc3RvcmFnZT8ucmVtb3ZlSXRlbShDSFVOS19SRUxPQURfRkxBRyk7XHJcbiAgfSBjYXRjaCB7fVxyXG4gIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xyXG59KTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgXCJfX1ZJVEVfUFVCTElDX0FTU0VUX184NWJiMjM3OF9fXCIiLCJpbXBvcnQgdHlwZSB7IEdsb2JhbFRoZW1lT3ZlcnJpZGVzIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyByZWYsIG9uTW91bnRlZCwgb25CZWZvcmVVbm1vdW50LCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcblxyXG4vLyBVc2UgeW91ciBleGlzdGluZyBDU1MgdmFyaWFibGVzIHRvIGtlZXAgdGhlIGN1cnJlbnQgY29sb3Igc2NoZW1lLlxyXG4vLyBOYWl2ZSBVSSBhY2NlcHRzIGFueSB2YWxpZCBDU1MgY29sb3Igc3RyaW5nLCBzbyB3ZSByZWZlcmVuY2UgdGhlXHJcbi8vIHNhbWUgdG9rZW5zIHRvIG1haW50YWluIHZpc3VhbCBjb25zaXN0ZW5jeSBhY3Jvc3MgbGlnaHQvZGFyay5cclxuXHJcbi8vIFJlc29sdmUgYC0tY29sb3IteHh4YCAoc3BhY2Utc2VwYXJhdGVkIFJHQiBsaWtlIFwiNzcgMTYzIDI1NVwiKSB0byAncmdiKHIsIGcsIGIpJ1xyXG5mdW5jdGlvbiBjc3NWYXJSZ2IobmFtZTogc3RyaW5nLCBmYWxsYmFjazogc3RyaW5nKTogc3RyaW5nIHtcclxuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxsYmFjaztcclxuICBjb25zdCByYXcgPSBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKS50cmltKCk7XHJcbiAgaWYgKCFyYXcpIHJldHVybiBmYWxsYmFjaztcclxuICAvLyBBY2NlcHQgZm9ybWF0cyBsaWtlIFwiNzcgMTYzIDI1NVwiIG9yIFwiNzcsIDE2MywgMjU1XCJcclxuICBjb25zdCBwYXJ0cyA9IHJhdy5yZXBsYWNlKC9cXHMrL2csICcgJykucmVwbGFjZSgvLC9nLCAnICcpLnRyaW0oKS5zcGxpdCgnICcpO1xyXG4gIGlmIChwYXJ0cy5sZW5ndGggPCAzKSByZXR1cm4gZmFsbGJhY2s7XHJcbiAgY29uc3QgW3IsIGcsIGJdID0gcGFydHM7XHJcbiAgY29uc3QgbnIgPSBOdW1iZXIociksXHJcbiAgICBuZyA9IE51bWJlcihnKSxcclxuICAgIG5iID0gTnVtYmVyKGIpO1xyXG4gIGlmIChbbnIsIG5nLCBuYl0uc29tZSgobikgPT4gIWlzRmluaXRlKG4pKSkgcmV0dXJuIGZhbGxiYWNrO1xyXG4gIHJldHVybiBgcmdiKCR7bnJ9LCAke25nfSwgJHtuYn0pYDtcclxufVxyXG5cclxuLy8gUmVzb2x2ZSBgLS1jb2xvci14eHhgIHRvIGEgY29tbWEtc2VwYXJhdGVkIFwiciwgZywgYlwiIHN0cmluZyBmb3IgcmdiYSgpXHJcbmZ1bmN0aW9uIGNzc1ZhclJnYkNvbW1hKG5hbWU6IHN0cmluZywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsbGJhY2s7XHJcbiAgY29uc3QgcmF3ID0gZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUobmFtZSkudHJpbSgpO1xyXG4gIGlmICghcmF3KSByZXR1cm4gZmFsbGJhY2s7XHJcbiAgY29uc3QgcGFydHMgPSByYXcucmVwbGFjZSgvXFxzKy9nLCAnICcpLnJlcGxhY2UoLywvZywgJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcclxuICBpZiAocGFydHMubGVuZ3RoIDwgMykgcmV0dXJuIGZhbGxiYWNrO1xyXG4gIGNvbnN0IFtyLCBnLCBiXSA9IHBhcnRzO1xyXG4gIGNvbnN0IG5yID0gTnVtYmVyKHIpLFxyXG4gICAgbmcgPSBOdW1iZXIoZyksXHJcbiAgICBuYiA9IE51bWJlcihiKTtcclxuICBpZiAoW25yLCBuZywgbmJdLnNvbWUoKG4pID0+ICFpc0Zpbml0ZShuKSkpIHJldHVybiBmYWxsYmFjaztcclxuICByZXR1cm4gYCR7bnJ9LCAke25nfSwgJHtuYn1gO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXNlTmFpdmVUaGVtZU92ZXJyaWRlcygpIHtcclxuICBjb25zdCBvdmVycmlkZXMgPSByZWY8R2xvYmFsVGhlbWVPdmVycmlkZXM+KHt9KTtcclxuICBjb25zdCBjbGFtcCA9IChuOiBudW1iZXIpID0+IE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZChuKSkpO1xyXG4gIGNvbnN0IHBhcnNlID0gKHJnYjogc3RyaW5nKTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgIGNvbnN0IG0gPSByZ2IubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQrKS8pO1xyXG4gICAgaWYgKG0pIHJldHVybiBbTnVtYmVyKG1bMV0pLCBOdW1iZXIobVsyXSksIE51bWJlcihtWzNdKV07XHJcbiAgICBjb25zdCBtbSA9IHJnYi5tYXRjaCgvKFxcZCspXFxzKyhcXGQrKVxccysoXFxkKykvKTtcclxuICAgIGlmIChtbSkgcmV0dXJuIFtOdW1iZXIobW1bMV0pLCBOdW1iZXIobW1bMl0pLCBOdW1iZXIobW1bM10pXTtcclxuICAgIHJldHVybiBbMCwgMCwgMF07XHJcbiAgfTtcclxuICBjb25zdCB0b0NzcyA9IChyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyKSA9PiBgcmdiKCR7Y2xhbXAocil9LCAke2NsYW1wKGcpfSwgJHtjbGFtcChiKX0pYDtcclxuICBjb25zdCBsaWdodGVuID0gKHJnYjogc3RyaW5nLCBhbXQ6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgW3IsIGcsIGJdID0gcGFyc2UocmdiKTtcclxuICAgIHJldHVybiB0b0NzcyhyICsgKDI1NSAtIHIpICogYW10LCBnICsgKDI1NSAtIGcpICogYW10LCBiICsgKDI1NSAtIGIpICogYW10KTtcclxuICB9O1xyXG4gIGNvbnN0IGRhcmtlbiA9IChyZ2I6IHN0cmluZywgYW10OiBudW1iZXIpID0+IHtcclxuICAgIGNvbnN0IFtyLCBnLCBiXSA9IHBhcnNlKHJnYik7XHJcbiAgICByZXR1cm4gdG9Dc3MociAqICgxIC0gYW10KSwgZyAqICgxIC0gYW10KSwgYiAqICgxIC0gYW10KSk7XHJcbiAgfTtcclxuICBjb25zdCBjb21wdXRlID0gKCkgPT4ge1xyXG4gICAgY29uc3QgcHJpbWFyeSA9IGNzc1ZhclJnYignLS1jb2xvci1wcmltYXJ5JywgJzc3LCAxNjMsIDI1NScpO1xyXG4gICAgY29uc3QgaW5mbyA9IGNzc1ZhclJnYignLS1jb2xvci1pbmZvJywgJzIsIDEzNiwgMjA5Jyk7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gY3NzVmFyUmdiKCctLWNvbG9yLXN1Y2Nlc3MnLCAnNzYsIDE3NSwgODAnKTtcclxuICAgIGNvbnN0IHdhcm5pbmcgPSBjc3NWYXJSZ2IoJy0tY29sb3Itd2FybmluZycsICcyNDUsIDEyNCwgMCcpO1xyXG4gICAgY29uc3QgZGFuZ2VyID0gY3NzVmFyUmdiKCctLWNvbG9yLWRhbmdlcicsICcyMjAsIDM4LCAzOCcpO1xyXG4gICAgb3ZlcnJpZGVzLnZhbHVlID0ge1xyXG4gICAgICBjb21tb246IHtcclxuICAgICAgICBwcmltYXJ5Q29sb3I6IHByaW1hcnksXHJcbiAgICAgICAgcHJpbWFyeUNvbG9ySG92ZXI6IGRhcmtlbihwcmltYXJ5LCAwLjA4KSxcclxuICAgICAgICBwcmltYXJ5Q29sb3JQcmVzc2VkOiBkYXJrZW4ocHJpbWFyeSwgMC4xNiksXHJcbiAgICAgICAgcHJpbWFyeUNvbG9yU3VwcGw6IGxpZ2h0ZW4ocHJpbWFyeSwgMC4xMiksXHJcbiAgICAgICAgaW5mb0NvbG9yOiBpbmZvLFxyXG4gICAgICAgIGluZm9Db2xvckhvdmVyOiBkYXJrZW4oaW5mbywgMC4wOCksXHJcbiAgICAgICAgaW5mb0NvbG9yUHJlc3NlZDogZGFya2VuKGluZm8sIDAuMTYpLFxyXG4gICAgICAgIGluZm9Db2xvclN1cHBsOiBsaWdodGVuKGluZm8sIDAuMTIpLFxyXG4gICAgICAgIHN1Y2Nlc3NDb2xvcjogc3VjY2VzcyxcclxuICAgICAgICBzdWNjZXNzQ29sb3JIb3ZlcjogZGFya2VuKHN1Y2Nlc3MsIDAuMDgpLFxyXG4gICAgICAgIHN1Y2Nlc3NDb2xvclByZXNzZWQ6IGRhcmtlbihzdWNjZXNzLCAwLjE2KSxcclxuICAgICAgICBzdWNjZXNzQ29sb3JTdXBwbDogbGlnaHRlbihzdWNjZXNzLCAwLjEyKSxcclxuICAgICAgICB3YXJuaW5nQ29sb3I6IHdhcm5pbmcsXHJcbiAgICAgICAgd2FybmluZ0NvbG9ySG92ZXI6IGRhcmtlbih3YXJuaW5nLCAwLjA4KSxcclxuICAgICAgICB3YXJuaW5nQ29sb3JQcmVzc2VkOiBkYXJrZW4od2FybmluZywgMC4xNiksXHJcbiAgICAgICAgd2FybmluZ0NvbG9yU3VwcGw6IGxpZ2h0ZW4od2FybmluZywgMC4xMiksXHJcbiAgICAgICAgZXJyb3JDb2xvcjogZGFuZ2VyLFxyXG4gICAgICAgIGVycm9yQ29sb3JIb3ZlcjogZGFya2VuKGRhbmdlciwgMC4wOCksXHJcbiAgICAgICAgZXJyb3JDb2xvclByZXNzZWQ6IGRhcmtlbihkYW5nZXIsIDAuMTYpLFxyXG4gICAgICAgIGVycm9yQ29sb3JTdXBwbDogbGlnaHRlbihkYW5nZXIsIDAuMTIpLFxyXG5cclxuICAgICAgICBiYXNlQ29sb3I6IGNzc1ZhclJnYignLS1jb2xvci1saWdodCcsICcjZmZmZmZmJyksXHJcbiAgICAgICAgYm9keUNvbG9yOiBjc3NWYXJSZ2IoJy0tY29sb3ItbGlnaHQnLCAnI2ZmZmZmZicpLFxyXG4gICAgICAgIHRleHRDb2xvckJhc2U6IGNzc1ZhclJnYignLS1jb2xvci1kYXJrJywgJyMwMDAwMDAnKSxcclxuICAgICAgICBjYXJkQ29sb3I6IGNzc1ZhclJnYignLS1jb2xvci1zdXJmYWNlJywgJyNmZmZmZmYnKSxcclxuICAgICAgICBtb2RhbENvbG9yOiBjc3NWYXJSZ2IoJy0tY29sb3Itc3VyZmFjZScsICcjZmZmZmZmJyksXHJcbiAgICAgICAgcG9wb3ZlckNvbG9yOiBjc3NWYXJSZ2IoJy0tY29sb3Itc3VyZmFjZScsICcjZmZmZmZmJyksXHJcbiAgICAgICAgdGFibGVDb2xvcjogY3NzVmFyUmdiKCctLWNvbG9yLWxpZ2h0JywgJyNmZmZmZmYnKSxcclxuXHJcbiAgICAgICAgLy8gU3VidGxlIGJvcmRlcnMvZGl2aWRlcnMgdXNpbmcgcmVzb2x2ZWQgdGhlbWUgdG9rZW5zIChhdm9pZCB2YXIoKSB1c2FnZSBoZXJlKVxyXG4gICAgICAgIGJvcmRlckNvbG9yOiBgcmdiYSgke2Nzc1ZhclJnYkNvbW1hKCctLWNvbG9yLWRhcmsnLCAnMCwgMCwgMCcpfSwgMC4xMClgLFxyXG4gICAgICAgIGRpdmlkZXJDb2xvcjogYHJnYmEoJHtjc3NWYXJSZ2JDb21tYSgnLS1jb2xvci1kYXJrJywgJzAsIDAsIDAnKX0sIDAuMTApYCxcclxuICAgICAgfSxcclxuICAgIH0gYXMgR2xvYmFsVGhlbWVPdmVycmlkZXM7XHJcbiAgfTtcclxuXHJcbiAgb25Nb3VudGVkKGNvbXB1dGUpO1xyXG4gIC8vIEFsc28gZXhwb3J0IGEgc21hbGwgaG9vayBiZWxvdyB0aGF0IGZsYWdzIGRhcmsgY2hhbmdlczsgcmVjb21wdXRlIG9uIGNoYW5nZXNcclxuICBjb25zdCBpc0RhcmsgPSB1c2VEYXJrTW9kZUNsYXNzUmVmKCk7XHJcbiAgd2F0Y2goaXNEYXJrLCAoKSA9PiBjb21wdXRlKCkpO1xyXG5cclxuICByZXR1cm4gb3ZlcnJpZGVzO1xyXG59XHJcblxyXG4vLyBTbWFsbCBoZWxwZXIgdG8gc3luYyBOYWl2ZSdzIHRoZW1lIHdpdGggeW91ciBleGlzdGluZyBkYXJrLW1vZGUgY2xhc3MuXHJcbi8vIFVzYWdlOiBjb25zdCBpc0RhcmsgPSB1c2VEYXJrTW9kZUNsYXNzKCk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VEYXJrTW9kZUNsYXNzUmVmKCkge1xyXG4gIGNvbnN0IGlzRGFyayA9IHJlZjxib29sZWFuPihmYWxzZSk7XHJcbiAgbGV0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGlzRGFyay52YWx1ZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHVwZGF0ZSgpO1xyXG4gICAgb25Nb3VudGVkKCgpID0+IHtcclxuICAgICAgdXBkYXRlKCk7XHJcbiAgICAgIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodXBkYXRlKTtcclxuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgYXR0cmlidXRlczogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XHJcbiAgICB9KTtcclxuICAgIG9uQmVmb3JlVW5tb3VudCgoKSA9PiB7XHJcbiAgICAgIG9ic2VydmVyPy5kaXNjb25uZWN0KCk7XHJcbiAgICAgIG9ic2VydmVyID0gbnVsbDtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGlzRGFyaztcclxufVxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxuaW1wb3J0IHtcbiAgR2F1Z2UsXG4gIEdhbWVwYWQyLFxuICBTZXR0aW5ncyxcbiAgV3JlbmNoLFxuICBMb2dPdXQsXG4gIE1lbnUsXG4gIFNlYXJjaCxcbiAgWCxcbiAgWENpcmNsZSxcbiAgQ2hlY2ssXG4gIENoZWNrQ2lyY2xlMixcbiAgUGVuY2lsLFxuICBUcmFzaDIsXG4gIExpbmssXG4gIFVubGluayxcbiAgUGx1cyxcbiAgQXJyb3dMZWZ0LFxuICBDaGV2cm9uVXAsXG4gIENoZXZyb25Eb3duLFxuICBDaGV2cm9uUmlnaHQsXG4gIFNhdmUsXG4gIFJvdGF0ZUNjdyxcbiAgRXh0ZXJuYWxMaW5rLFxuICBBbGVydENpcmNsZSxcbiAgQWxlcnRUcmlhbmdsZSxcbiAgSW5mbyxcbiAgSGVscENpcmNsZSxcbiAgUG93ZXIsXG4gIExvY2ssXG4gIEtleSxcbiAgQ29weSxcbiAgTW9uaXRvcixcbiAgU21hcnRwaG9uZSxcbiAgTGFwdG9wLFxuICBUdixcbiAgRGlzYyxcbiAgR2l0aHViLFxuICBNZXNzYWdlQ2lyY2xlLFxuICBGaWxlVGV4dCxcbiAgSW1hZ2UgYXMgSW1hZ2VMdWNpZGUsXG4gIExpZ2h0YnVsYixcbiAgQ29tcGFzcyxcbiAgQ2lyY2xlU2xhc2gsXG4gIFBsYXksXG4gIFBhdXNlLFxuICBTcXVhcmUsXG4gIE1heGltaXplMixcbiAgTWluaW1pemUyLFxuICBWb2x1bWUyLFxuICBTbGlkZXJzSG9yaXpvbnRhbCxcbiAgVXNlcnMsXG4gIFVzZXJDb2csXG4gIFVzZXJYLFxuICBMb2FkZXIyLFxuICBDb2csXG4gIExheW91dEdyaWQsXG4gIEdyaWQzWDMsXG4gIFJhZGlvLFxuICBXaWZpLFxuICBQbHVnLFxuICBCdWcsXG4gIEZpbGVBcmNoaXZlLFxuICBEb3dubG9hZCxcbiAgR2l0QnJhbmNoLFxuICBIYXNoLFxuICBGbGFza0NvbmljYWwsXG4gIExpc3QsXG4gIFphcCxcbiAgVGltZXIsXG4gIE1vdXNlUG9pbnRlckNsaWNrLFxuICBTaGllbGRDaGVjayxcbiAgQ3B1LFxuICBTdGV0aG9zY29wZSxcbiAgU3VuLFxuICBNb29uLFxuICBTdW5Nb29uLFxuICB0eXBlIEx1Y2lkZUljb24sXG59IGZyb20gJ2x1Y2lkZS12dWUtbmV4dCc7XG5cbmNvbnN0IGljb25NYXA6IFJlY29yZDxzdHJpbmcsIEx1Y2lkZUljb24+ID0ge1xuICAvLyBOYXZpZ2F0aW9uXG4gICdmYS1nYXVnZSc6IEdhdWdlLFxuICAnZmEtZ2FtZXBhZCc6IEdhbWVwYWQyLFxuICAnZmEtc2xpZGVycy1oJzogU2xpZGVyc0hvcml6b250YWwsXG4gICdmYS13cmVuY2gnOiBXcmVuY2gsXG4gICdmYS1zaWduLW91dC1hbHQnOiBMb2dPdXQsXG4gICdmYS1iYXJzJzogTWVudSxcbiAgJ2ZhLXVzZXJzJzogVXNlcnMsXG4gICdmYS11c2Vycy1jb2cnOiBVc2VyQ29nLFxuICAnZmEtdXNlci1zbGFzaCc6IFVzZXJYLFxuICAnZmEtdXNlci1jb2cnOiBVc2VyQ29nLFxuXG4gIC8vIEFjdGlvbnNcbiAgJ2ZhLXNlYXJjaCc6IFNlYXJjaCxcbiAgJ2ZhLW1hZ25pZnlpbmctZ2xhc3MnOiBTZWFyY2gsXG4gICdmYS10aW1lcyc6IFgsXG4gICdmYS14bWFyayc6IFgsXG4gICdmYS1jaGVjayc6IENoZWNrLFxuICAnZmEtZWRpdCc6IFBlbmNpbCxcbiAgJ2ZhLXBlbmNpbCc6IFBlbmNpbCxcbiAgJ2ZhLXRyYXNoJzogVHJhc2gyLFxuICAnZmEtbGluayc6IExpbmssXG4gICdmYS1saW5rLXNsYXNoJzogVW5saW5rLFxuICAnZmEtY2lyY2xlLW5vdGNoJzogTG9hZGVyMixcbiAgJ2ZhLXNwaW5uZXInOiBMb2FkZXIyLFxuICAnZmEtY29nJzogQ29nLFxuICAnZmEtY29ncyc6IENvZyxcbiAgJ2ZhLWdlYXInOiBDb2csXG4gICdmYS1nZWFycyc6IENvZyxcbiAgJ2ZhLXNldHRpbmdzJzogU2V0dGluZ3MsXG4gICdmYS1wbGF5JzogUGxheSxcbiAgJ2ZhLXBsYXktY2lyY2xlJzogUGxheSxcbiAgJ2ZhLXBhdXNlJzogUGF1c2UsXG4gICdmYS1zdG9wJzogU3F1YXJlLFxuICAnZmEtcG93ZXItb2ZmJzogUG93ZXIsXG4gICdmYS1zbGlkZXJzJzogU2xpZGVyc0hvcml6b250YWwsXG4gICdmYS10aCc6IExheW91dEdyaWQsXG4gICdmYS10YWJsZS1jZWxscy1sYXJnZSc6IEdyaWQzWDMsXG4gICdmYS1zYXRlbGxpdGUtZGlzaCc6IFJhZGlvLFxuICAnZmEtd2lmaSc6IFdpZmksXG4gICdmYS1wbHVnJzogUGx1ZyxcbiAgJ2ZhLWJ1Zyc6IEJ1ZyxcbiAgJ2ZhLWRvd25sb2FkJzogRG93bmxvYWQsXG4gICdmYS1maWxlLXppcHBlcic6IEZpbGVBcmNoaXZlLFxuICAnZmEtZmlsZS1saW5lcyc6IEZpbGVUZXh0LFxuICAnZmEtZmlsZS1hbHQnOiBGaWxlVGV4dCxcbiAgJ2ZhLWZpbGUtdGV4dCc6IEZpbGVUZXh0LFxuICAnZmEtcm90YXRlLXJpZ2h0JzogUm90YXRlQ2N3LFxuICAnZmEtcm90YXRlJzogUm90YXRlQ2N3LFxuICAnZmEtc3luYyc6IFJvdGF0ZUNjdyxcbiAgJ2ZhLWNvZGUtYnJhbmNoJzogR2l0QnJhbmNoLFxuICAnZmEtaGFzaHRhZyc6IEhhc2gsXG4gICdmYS1mbGFzayc6IEZsYXNrQ29uaWNhbCxcbiAgJ2ZhLWJhcnMtc3RhZ2dlcmVkJzogTGlzdCxcbiAgJ2ZhLWxpc3QnOiBMaXN0LFxuICAnZmEtYm9sdCc6IFphcCxcbiAgJ2ZhLXBsdXMnOiBQbHVzLFxuICAnZmEtYXJyb3ctbGVmdCc6IEFycm93TGVmdCxcbiAgJ2ZhLWNoZXZyb24tdXAnOiBDaGV2cm9uVXAsXG4gICdmYS1jaGV2cm9uLWRvd24nOiBDaGV2cm9uRG93bixcbiAgJ2ZhLWNoZXZyb24tcmlnaHQnOiBDaGV2cm9uUmlnaHQsXG4gICdmYS1zYXZlJzogU2F2ZSxcbiAgJ2ZhLWV4dGVybmFsLWxpbmstYWx0JzogRXh0ZXJuYWxMaW5rLFxuICAnZmEtY29weSc6IENvcHksXG4gICdmYS1rZXknOiBLZXksXG4gICdmYS1sb2NrJzogTG9jayxcbiAgJ2ZhLWltYWdlJzogSW1hZ2VMdWNpZGUsXG4gICdmYS1saWdodGJ1bGInOiBMaWdodGJ1bGIsXG4gICdmYS1zdGV0aG9zY29wZSc6IFN0ZXRob3Njb3BlLFxuICAnZmEtc3RvcHdhdGNoJzogVGltZXIsXG4gICdmYS1zdG9wd2F0Y2gtMjAnOiBUaW1lcixcbiAgJ2ZhLWhhbmQtcG9pbnQtcmlnaHQnOiBNb3VzZVBvaW50ZXJDbGljayxcbiAgJ2ZhLW52aWRpYSc6IENwdSxcbiAgJ2ZhLWRlc2t0b3AnOiBNb25pdG9yLFxuICAnZmEtZGlzcGxheSc6IE1vbml0b3IsXG4gICdmYS1tb25pdG9yJzogTW9uaXRvcixcbiAgJ2ZhLXN1bic6IFN1bixcbiAgJ2ZhLW1vb24nOiBNb29uLFxuICAnZmEtY2lyY2xlLWhhbGYtc3Ryb2tlJzogU3VuTW9vbixcblxuICAvLyBTdGF0dXMvQWxlcnRzXG4gICdmYS1jaXJjbGUtZXhjbGFtYXRpb24nOiBBbGVydENpcmNsZSxcbiAgJ2ZhLWV4Y2xhbWF0aW9uLWNpcmNsZSc6IEFsZXJ0Q2lyY2xlLFxuICAnZmEtZXhjbGFtYXRpb24nOiBBbGVydENpcmNsZSxcbiAgJ2ZhLXRyaWFuZ2xlLWV4Y2xhbWF0aW9uJzogQWxlcnRUcmlhbmdsZSxcbiAgJ2ZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlJzogQWxlcnRUcmlhbmdsZSxcbiAgJ2ZhLWNpcmNsZS1pbmZvJzogSW5mbyxcbiAgJ2ZhLWluZm8tY2lyY2xlJzogSW5mbyxcbiAgJ2ZhLWluZm8nOiBJbmZvLFxuICAnZmEtY2lyY2xlLWNoZWNrJzogQ2hlY2tDaXJjbGUyLFxuICAnZmEtY2hlY2stY2lyY2xlJzogQ2hlY2tDaXJjbGUyLFxuICAnZmEtdGltZXMtY2lyY2xlJzogWENpcmNsZSxcbiAgJ2ZhLXF1ZXN0aW9uLWNpcmNsZSc6IEhlbHBDaXJjbGUsXG4gICdmYS1zaGllbGQtaGVhcnQnOiBTaGllbGRDaGVjayxcbiAgJ2ZhLXNoaWVsZC1oYWx2ZWQnOiBTaGllbGRDaGVjayxcblxuICAvLyBEZXZpY2VzL01lZGlhXG4gICdmYS1tb2JpbGUnOiBTbWFydHBob25lLFxuICAnZmEtbW9iaWxlLWFsdCc6IFNtYXJ0cGhvbmUsXG4gICdmYS1sYXB0b3AnOiBMYXB0b3AsXG4gICdmYS10dic6IFR2LFxuICAnZmEtZGlzYyc6IERpc2MsXG4gICdmYS1jb21wYWN0LWRpc2MnOiBEaXNjLFxuICAnZmEtZXhwYW5kJzogTWF4aW1pemUyLFxuICAnZmEtY29tcHJlc3MnOiBNaW5pbWl6ZTIsXG4gICdmYS12b2x1bWUtdXAnOiBWb2x1bWUyLFxuICAnZmEtdm9sdW1lJzogVm9sdW1lMixcblxuICAvLyBCcmFuZHNcbiAgJ2ZhLWdpdGh1Yic6IEdpdGh1YixcbiAgJ2ZhLWRpc2NvcmQnOiBNZXNzYWdlQ2lyY2xlLFxuXG4gIC8vIE1pc2NcbiAgJ2ZhLWNvbXBhc3MnOiBDb21wYXNzLFxuICAnZmEtYmFuJzogQ2lyY2xlU2xhc2gsXG4gICdmYS13aW5kb3ctcmVzdG9yZSc6IE1vbml0b3IsXG4gICdmYS13aW5kb3ctbWF4aW1pemUnOiBNYXhpbWl6ZTIsXG59O1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHNpemU/OiBudW1iZXI7XG4gIHN0cm9rZVdpZHRoPzogbnVtYmVyO1xuICBjbGFzcz86IHN0cmluZztcbn1cblxuY29uc3QgcHJvcHMgPSB3aXRoRGVmYXVsdHMoZGVmaW5lUHJvcHM8UHJvcHM+KCksIHtcbiAgc2l6ZTogMTYsXG4gIHN0cm9rZVdpZHRoOiAxLjUsXG4gIGNsYXNzOiAnJyxcbn0pO1xuXG5jb25zdCBpY29uID0gY29tcHV0ZWQoKCkgPT4gaWNvbk1hcFtwcm9wcy5uYW1lXSB8fCBudWxsKTtcblxuLy8gV2FybiBpZiBpY29uIG5vdCBmb3VuZCAoZGV2ZWxvcG1lbnQgb25seSlcbmlmIChpbXBvcnQubWV0YS5lbnYuREVWICYmICFpY29uTWFwW3Byb3BzLm5hbWVdKSB7XG4gIGNvbnNvbGUud2FybihgW0x1Y2lkZUljb25dIE5vIG1hcHBpbmcgZm91bmQgZm9yOiAke3Byb3BzLm5hbWV9YCk7XG59XG48L3NjcmlwdD5cblxuPHNjcmlwdCBsYW5nPVwidHNcIj5cbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxjb21wb25lbnRcbiAgICA6aXM9XCJpY29uXCJcbiAgICB2LWlmPVwiaWNvblwiXG4gICAgOnNpemU9XCJzaXplXCJcbiAgICA6c3Ryb2tlLXdpZHRoPVwic3Ryb2tlV2lkdGhcIlxuICAgIDpjbGFzcz1cImNsYXNzXCJcbiAgLz5cbiAgPHNwYW4gdi1lbHNlIGNsYXNzPVwiaW5saW5lLWJsb2NrIHctNCBoLTRcIiA6Y2xhc3M9XCJjbGFzc1wiPnt7IG5hbWUgfX08L3NwYW4+XG48L3RlbXBsYXRlPlxuIiwidHlwZSBUaGVtZSA9ICdsaWdodCcgfCAnZGFyaycgfCAnYXV0byc7XHJcblxyXG5jb25zdCBnZXRTdG9yZWRUaGVtZSA9ICgpOiBzdHJpbmcgfCBudWxsID0+IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpO1xyXG5jb25zdCBzZXRTdG9yZWRUaGVtZSA9ICh0aGVtZTogc3RyaW5nKTogdm9pZCA9PiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCB0aGVtZSk7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UHJlZmVycmVkVGhlbWUgPSAoKTogVGhlbWUgPT4ge1xyXG4gIGNvbnN0IHN0b3JlZFRoZW1lID0gZ2V0U3RvcmVkVGhlbWUoKTtcclxuICBpZiAoc3RvcmVkVGhlbWUgPT09ICdsaWdodCcgfHwgc3RvcmVkVGhlbWUgPT09ICdkYXJrJyB8fCBzdG9yZWRUaGVtZSA9PT0gJ2F1dG8nKSB7XHJcbiAgICByZXR1cm4gc3RvcmVkVGhlbWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKS5tYXRjaGVzID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxufTtcclxuXHJcbi8vIFNldCB0aGVtZSBpbiBhIFRhaWx3aW5kLWZyaWVuZGx5IHdheSBieSB0b2dnbGluZyB0aGUgYGRhcmtgIGNsYXNzIG9uIDxodG1sPi5cclxuY29uc3Qgc2V0VGhlbWUgPSAodGhlbWU6IFRoZW1lKTogdm9pZCA9PiB7XHJcbiAgY29uc3QgcHJlZmVyc0RhcmsgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKScpLm1hdGNoZXM7XHJcblxyXG4gIGlmICh0aGVtZSA9PT0gJ2F1dG8nKSB7XHJcbiAgICBpZiAocHJlZmVyc0RhcmspIHtcclxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RhcmsnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkYXJrJyk7XHJcbiAgICB9XHJcbiAgICAvLyBXaGVuIHRoZW1lIGlzICdhdXRvJyB3ZSBzdGlsbCBuZWVkIHRvIHNldCBhIGNvbmNyZXRlIGRhdGEtYnMtdGhlbWVcclxuICAgIC8vIHZhbHVlIHNvIEJvb3RzdHJhcCBzZWxlY3RvcnMgbGlrZSBbZGF0YS1icy10aGVtZT1cImRhcmtcIl0gbWF0Y2guXHJcbiAgICBjb25zdCByZXNvbHZlZCA9IHByZWZlcnNEYXJrID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtdGhlbWUnLCByZXNvbHZlZCk7XHJcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgJ2F1dG8nKTtcclxuICB9IGVsc2UgaWYgKHRoZW1lID09PSAnZGFyaycpIHtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkYXJrJyk7XHJcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWJzLXRoZW1lJywgJ2RhcmsnKTtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnLCAnZGFyaycpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZGFyaycpO1xyXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1icy10aGVtZScsICdsaWdodCcpO1xyXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS10aGVtZScsICdsaWdodCcpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzaG93QWN0aXZlVGhlbWUgPSAodGhlbWU6IFRoZW1lLCBmb2N1cyA9IGZhbHNlKTogdm9pZCA9PiB7XHJcbiAgY29uc3QgdGhlbWVTd2l0Y2hlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNiZC10aGVtZScpO1xyXG5cclxuICBpZiAoIXRoZW1lU3dpdGNoZXIpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRoZW1lU3dpdGNoZXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2JkLXRoZW1lLXRleHQnKTtcclxuICBjb25zdCBhY3RpdmVUaGVtZUljb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGhlbWUtaWNvbi1hY3RpdmUgaScpO1xyXG5cclxuICAvLyBGcmllbmRseSBpY29uIG1hcCBpZiB0aGUgRE9NIGJ1dHRvbnMgYXJlIG5vdCBwcmVzZW50XHJcbiAgY29uc3QgaWNvbk1hcDogUmVjb3JkPFRoZW1lLCBzdHJpbmc+ID0ge1xyXG4gICAgbGlnaHQ6ICdmYS1zb2xpZCBmYS1zdW4nLFxyXG4gICAgZGFyazogJ2ZhLXNvbGlkIGZhLW1vb24nLFxyXG4gICAgYXV0bzogJ2ZhLXNvbGlkIGZhLWNpcmNsZS1oYWxmLXN0cm9rZScsXHJcbiAgfTtcclxuXHJcbiAgLy8gVXBkYXRlIGFueSBleGlzdGluZyBidXR0b25zIHRoYXQgdXNlIGRhdGEtYnMtdGhlbWUtdmFsdWUgKGxlZ2FjeSlcclxuICBjb25zdCBidG5Ub0FjdGl2ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWJzLXRoZW1lLXZhbHVlPVwiJHt0aGVtZX1cIl1gKTtcclxuICBpZiAoYnRuVG9BY3RpdmUpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWJzLXRoZW1lLXZhbHVlXScpLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsICdmYWxzZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYnRuVG9BY3RpdmUuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICBidG5Ub0FjdGl2ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsICd0cnVlJyk7XHJcblxyXG4gICAgY29uc3QgaWNvbkluc2lkZSA9IGJ0blRvQWN0aXZlLnF1ZXJ5U2VsZWN0b3IoJ2knKTtcclxuICAgIGlmIChhY3RpdmVUaGVtZUljb24gJiYgaWNvbkluc2lkZSkge1xyXG4gICAgICBhY3RpdmVUaGVtZUljb24uY2xhc3NOYW1lID0gaWNvbkluc2lkZS5jbGFzc05hbWU7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEZhbGxiYWNrOiBzZXQgYSBzZW5zaWJsZSBpY29uIGJhc2VkIG9uIHRoZW1lXHJcbiAgICBpZiAoYWN0aXZlVGhlbWVJY29uKSB7XHJcbiAgICAgIGFjdGl2ZVRoZW1lSWNvbi5jbGFzc05hbWUgPSBpY29uTWFwW3RoZW1lXSB8fCBpY29uTWFwLmF1dG87XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodGhlbWVTd2l0Y2hlclRleHQpIHtcclxuICAgIGNvbnN0IHByZXR0eSA9IGJ0blRvQWN0aXZlID8gYnRuVG9BY3RpdmUudGV4dENvbnRlbnQ/LnRyaW0oKSA6IHRoZW1lO1xyXG4gICAgY29uc3QgdGhlbWVTd2l0Y2hlckxhYmVsID0gYCR7dGhlbWVTd2l0Y2hlclRleHQudGV4dENvbnRlbnR9ICgke3ByZXR0eX0pYDtcclxuICAgIHRoZW1lU3dpdGNoZXIuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGhlbWVTd2l0Y2hlckxhYmVsKTtcclxuICB9XHJcblxyXG4gIGlmIChmb2N1cyAmJiAnZm9jdXMnIGluIHRoZW1lU3dpdGNoZXIpIHtcclxuICAgICh0aGVtZVN3aXRjaGVyIGFzIEhUTUxFbGVtZW50KS5mb2N1cygpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRoZW1lVG9nZ2xlTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYnMtdGhlbWUtdmFsdWVdJykuZm9yRWFjaCgodG9nZ2xlKSA9PiB7XHJcbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRoZW1lID0gdG9nZ2xlLmdldEF0dHJpYnV0ZSgnZGF0YS1icy10aGVtZS12YWx1ZScpIGFzIFRoZW1lO1xyXG4gICAgICBpZiAodGhlbWUpIHtcclxuICAgICAgICBzZXRTdG9yZWRUaGVtZSh0aGVtZSk7XHJcbiAgICAgICAgc2V0VGhlbWUodGhlbWUpO1xyXG4gICAgICAgIHNob3dBY3RpdmVUaGVtZSh0aGVtZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBzaG93QWN0aXZlVGhlbWUoZ2V0UHJlZmVycmVkVGhlbWUoKSwgZmFsc2UpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbG9hZEF1dG9UaGVtZSgpOiB2b2lkIHtcclxuICAoKCkgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNldFRoZW1lKGdldFByZWZlcnJlZFRoZW1lKCkpO1xyXG5cclxuICAgIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBzdG9yZWRUaGVtZSA9IGdldFN0b3JlZFRoZW1lKCk7XHJcbiAgICAgIGlmIChzdG9yZWRUaGVtZSAhPT0gJ2xpZ2h0JyAmJiBzdG9yZWRUaGVtZSAhPT0gJ2RhcmsnKSB7XHJcbiAgICAgICAgc2V0VGhlbWUoZ2V0UHJlZmVycmVkVGhlbWUoKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xyXG4gICAgICBzaG93QWN0aXZlVGhlbWUoZ2V0UHJlZmVycmVkVGhlbWUoKSk7XHJcbiAgICB9KTtcclxuICB9KSgpO1xyXG59XHJcblxyXG4vLyBFeHBvc2Ugc2V0dGVycyBzbyBjb21wb25lbnRzIGNhbiBjYWxsIHRoZW0gZGlyZWN0bHlcclxuZXhwb3J0IHsgc2V0U3RvcmVkVGhlbWUsIHNldFRoZW1lIH07XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8bi1tb2RhbCA6c2hvdz1cInZpc2libGVcIiA6bWFzay1jbG9zYWJsZT1cImZhbHNlXCIgOmNsb3NlLW9uLWVzYz1cImZhbHNlXCI+XHJcbiAgICA8bi1jb25maWctcHJvdmlkZXIgOnRoZW1lPVwiaXNEYXJrID8gZGFya1RoZW1lIDogbnVsbFwiIDp0aGVtZS1vdmVycmlkZXM9XCJuYWl2ZU92ZXJyaWRlc1wiPlxyXG4gICAgPGRpdiBjbGFzcz1cImxvZ2luLW1vZGFsLXNoZWxsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgOmFyaWEtbGFiZWw9XCJwYW5lbFRpdGxlXCI+XHJcbiAgICAgIDwhLS0gVGhlbWUgdG9nZ2xlOiB0b3AtbGVmdCBjb3JuZXIgLS0+XHJcbiAgICAgIDxidXR0b25cclxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICBjbGFzcz1cImxvZ2luLXRoZW1lLXRvZ2dsZVwiXHJcbiAgICAgICAgOnRpdGxlPVwiJ1RoZW1lOiAnICsgdGhlbWVNb2RlXCJcclxuICAgICAgICA6YXJpYS1sYWJlbD1cIidTd2l0Y2ggdGhlbWUsIGN1cnJlbnQ6ICcgKyB0aGVtZU1vZGVcIlxyXG4gICAgICAgIEBjbGljaz1cImN5Y2xlVGhlbWVcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJ0aGVtZU9wdGlvbnMuZmluZChvID0+IG8udmFsdWUgPT09IHRoZW1lTW9kZSk/Lmljb24gPz8gJ2ZhLWNpcmNsZS1oYWxmLXN0cm9rZSdcIiA6c2l6ZT1cIjE1XCIgLz5cclxuICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICA8IS0tIExlZnQ6IGltYWdlIHBhbmVsIC0tPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwibG9naW4tcGFuZWwtbGVmdFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsb2dpbi1wYW5lbC1sZWZ0LWNvbnRlbnRcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dpbi1wYW5lbC1sb2dvXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zYXRlbGxpdGUtZGlzaFwiIDpzaXplPVwiMjZcIiAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9naW4tcGFuZWwtdGFnbGluZVwiPlxyXG4gICAgICAgICAgICA8aDI+e3sgaXNTaWduVXAgPyAnQ3JlYXRlIHlvdXIgYWNjb3VudCcgOiAnV2VsY29tZSBCYWNrIScgfX08L2gyPlxyXG4gICAgICAgICAgICA8cD57eyBpc1NpZ25VcCA/ICdTZXQgdXAgeW91ciBKdWpvLlN0cmVhbSBhZG1pbiBjcmVkZW50aWFscy4nIDogJ1NpZ24gaW4gdG8gbWFuYWdlIHlvdXIgc3RyZWFtIHNlcnZlci4nIH19PC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPCEtLSBSaWdodDogZm9ybSBwYW5lbCAtLT5cclxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luLXBhbmVsLXJpZ2h0XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2luLWZvcm0td3JhcFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2luLWZvcm0taGVhZGVyXCI+XHJcbiAgICAgICAgICAgIDxoMSBjbGFzcz1cImxvZ2luLWZvcm0tdGl0bGVcIj57eyBwYW5lbFRpdGxlIH19PC9oMT5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJsb2dpbi1mb3JtLXN1YnRpdGxlXCI+e3sgcGFuZWxTdWJ0aXRsZSB9fTwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxmb3JtXHJcbiAgICAgICAgICAgIGlkPVwibG9naW5Gb3JtXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJsb2dpbi1mb3JtLWJvZHlcIlxyXG4gICAgICAgICAgICBub3ZhbGlkYXRlXHJcbiAgICAgICAgICAgIEBzdWJtaXQucHJldmVudD1cInN1Ym1pdFwiXHJcbiAgICAgICAgICAgIEBrZXlkb3duLmN0cmwuZW50ZXIuc3RvcC5wcmV2ZW50PVwic3VibWl0XCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPCEtLSBVc2VybmFtZSAtLT5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxmLWZpZWxkXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwibGYtbGFiZWxcIiBmb3I9XCJsZi11c2VybmFtZVwiPnt7IHQoJ2F1dGgudXNlcm5hbWUnKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgIGlkPVwibGYtdXNlcm5hbWVcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInVzZXJuYW1lXCJcclxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cInVzZXJuYW1lXCJcclxuICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cImlzU2lnblVwID8gJ0Nob29zZSBhIHVzZXJuYW1lJyA6ICdFbnRlciB5b3VyIHVzZXJuYW1lJ1wiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPCEtLSBQYXNzd29yZCAobG9naW4gb25seSkgLS0+XHJcbiAgICAgICAgICAgIDxkaXYgdi1pZj1cIiFpc1NpZ25VcFwiIGNsYXNzPVwibGYtZmllbGRcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJsZi1sYWJlbFwiIGZvcj1cImxmLXBhc3N3b3JkXCI+e3sgdCgnYXV0aC5wYXNzd29yZCcpIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgICAgaWQ9XCJsZi1wYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIHNob3ctcGFzc3dvcmQtb249XCJjbGlja1wiXHJcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJjdXJyZW50LXBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgeW91ciBwYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPCEtLSBOZXcgKyBDb25maXJtIHBhc3N3b3JkIChzaWduLXVwKSAtLT5cclxuICAgICAgICAgICAgPHRlbXBsYXRlIHYtaWY9XCJpc1NpZ25VcFwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZi1maWVsZFwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwibGYtbGFiZWxcIiBmb3I9XCJsZi1uZXdwd1wiPnt7IHQoJ2F1dGgubmV3X3Bhc3N3b3JkJykgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgICAgaWQ9XCJsZi1uZXdwd1wiXHJcbiAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJuZXdQYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHNob3ctcGFzc3dvcmQtb249XCJjbGlja1wiXHJcbiAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQ3JlYXRlIGEgcGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGYtZmllbGRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImxmLWxhYmVsXCIgZm9yPVwibGYtY29uZmlybXB3XCI+e3sgdCgnYXV0aC5jb25maXJtX25ld19wYXNzd29yZCcpIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgICAgICAgIGlkPVwibGYtY29uZmlybXB3XCJcclxuICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpcm1OZXdQYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHNob3ctcGFzc3dvcmQtb249XCJjbGlja1wiXHJcbiAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUmVwZWF0IHlvdXIgcGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuXHJcbiAgICAgICAgICAgIDwhLS0gUmVtZW1iZXIgbWUgKyBGb3Jnb3QgKGxvZ2luIG9ubHkpIC0tPlxyXG4gICAgICAgICAgICA8ZGl2IHYtaWY9XCIhaXNTaWduVXBcIiBjbGFzcz1cImxmLXJlbWVtYmVyLXJvd1wiPlxyXG4gICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cInJlbWVtYmVyTWVcIiBzaXplPVwic21hbGxcIj5cclxuICAgICAgICAgICAgICAgIHt7IHQoJ2F1dGgucmVtZW1iZXJfbWVfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8IS0tIEZlZWRiYWNrIC0tPlxyXG4gICAgICAgICAgICA8ZGl2IHYtaWY9XCJlcnJvciB8fCBzdWNjZXNzXCIgY2xhc3M9XCJsZi1mZWVkYmFja1wiPlxyXG4gICAgICAgICAgICAgIDxuLWFsZXJ0IHYtaWY9XCJlcnJvclwiIHR5cGU9XCJlcnJvclwiIDpzaG93LWljb249XCJ0cnVlXCIgc2l6ZT1cInNtYWxsXCI+e3sgZXJyb3IgfX08L24tYWxlcnQ+XHJcbiAgICAgICAgICAgICAgPG4tYWxlcnQgdi1lbHNlLWlmPVwic3VjY2Vzc1wiIHR5cGU9XCJzdWNjZXNzXCIgOnNob3ctaWNvbj1cInRydWVcIiBzaXplPVwic21hbGxcIj57eyBzdWNjZXNzIH19PC9uLWFsZXJ0PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDwhLS0gUHJpbWFyeSBhY3Rpb24gLS0+XHJcbiAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgICBhdHRyLXR5cGU9XCJzdWJtaXRcIlxyXG4gICAgICAgICAgICAgIDpkaXNhYmxlZD1cInN1Ym1pdHRpbmdcIlxyXG4gICAgICAgICAgICAgIDpsb2FkaW5nPVwic3VibWl0dGluZ1wiXHJcbiAgICAgICAgICAgICAgc2l6ZT1cImxhcmdlXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImxmLXN1Ym1pdC1idG5cIlxyXG4gICAgICAgICAgICAgIGJsb2NrXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICB7eyBzdWJtaXRMYWJlbCB9fVxyXG4gICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgICAgIDwhLS0gVG9nZ2xlIHNpZ24taW4gLyBzaWduLXVwIChvbmx5IHdoZW4gY3JlZGVudGlhbHMgYWxyZWFkeSBleGlzdCkgLS0+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJjcmVkZW50aWFsc0NvbmZpZ3VyZWRcIiBjbGFzcz1cImxmLXRvZ2dsZS1yb3dcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsZi10b2dnbGUtdGV4dFwiPlxyXG4gICAgICAgICAgICAgIHt7IGlzU2lnblVwID8gJ0FscmVhZHkgaGF2ZSBhbiBhY2NvdW50PycgOiAnTmV3IFVzZXI/JyB9fVxyXG4gICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibGYtdG9nZ2xlLWJ0blwiIEBjbGljaz1cInRvZ2dsZU1vZGVcIj5cclxuICAgICAgICAgICAgICB7eyBpc1NpZ25VcCA/ICdTaWduIEluJyA6ICdTaWduIFVwJyB9fVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICAgPC9uLWNvbmZpZy1wcm92aWRlcj5cclxuICA8L24tbW9kYWw+XHJcbjwvdGVtcGxhdGU+XHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCByZWYsIHdhdGNoIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XHJcbmltcG9ydCB7IGh0dHAsIGFwcGx5TG9naW5SZXNwb25zZSB9IGZyb20gJ0AvaHR0cCc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB7IE5Nb2RhbCwgTklucHV0LCBOQWxlcnQsIE5CdXR0b24sIE5DaGVja2JveCwgTkNvbmZpZ1Byb3ZpZGVyLCBkYXJrVGhlbWUgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IHVzZU5haXZlVGhlbWVPdmVycmlkZXMsIHVzZURhcmtNb2RlQ2xhc3NSZWYgfSBmcm9tICdAL25haXZlLXRoZW1lJztcclxuaW1wb3J0IHsgZ2V0UHJlZmVycmVkVGhlbWUsIHNldFRoZW1lLCBzZXRTdG9yZWRUaGVtZSB9IGZyb20gJ0AvdGhlbWUnO1xyXG5cclxuY29uc3QgaXNEYXJrID0gdXNlRGFya01vZGVDbGFzc1JlZigpO1xyXG5jb25zdCBuYWl2ZU92ZXJyaWRlcyA9IHVzZU5haXZlVGhlbWVPdmVycmlkZXMoKTtcclxuXHJcbnR5cGUgVGhlbWVNb2RlID0gJ2xpZ2h0JyB8ICdkYXJrJyB8ICdhdXRvJztcclxuY29uc3QgdGhlbWVNb2RlID0gcmVmPFRoZW1lTW9kZT4oZ2V0UHJlZmVycmVkVGhlbWUoKSk7XHJcbmNvbnN0IHRoZW1lT3B0aW9uczogeyB2YWx1ZTogVGhlbWVNb2RlOyBpY29uOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdID0gW1xyXG4gIHsgdmFsdWU6ICdsaWdodCcsIGljb246ICdmYS1zdW4nLCBsYWJlbDogJ0xpZ2h0JyB9LFxyXG4gIHsgdmFsdWU6ICdkYXJrJywgaWNvbjogJ2ZhLW1vb24nLCBsYWJlbDogJ0RhcmsnIH0sXHJcbiAgeyB2YWx1ZTogJ2F1dG8nLCBpY29uOiAnZmEtY2lyY2xlLWhhbGYtc3Ryb2tlJywgbGFiZWw6ICdBdXRvJyB9LFxyXG5dO1xyXG5mdW5jdGlvbiBjeWNsZVRoZW1lKCkge1xyXG4gIGNvbnN0IG9yZGVyOiBUaGVtZU1vZGVbXSA9IFsnbGlnaHQnLCAnZGFyaycsICdhdXRvJ107XHJcbiAgY29uc3QgaWR4ID0gb3JkZXIuaW5kZXhPZih0aGVtZU1vZGUudmFsdWUpO1xyXG4gIGNvbnN0IG5leHQ6IFRoZW1lTW9kZSA9IChvcmRlclsoaWR4ID49IDAgPyBpZHggKyAxIDogMSkgJSBvcmRlci5sZW5ndGhdKSA/PyAnYXV0byc7XHJcbiAgdGhlbWVNb2RlLnZhbHVlID0gbmV4dDtcclxuICBzZXRTdG9yZWRUaGVtZShuZXh0KTtcclxuICBzZXRUaGVtZShuZXh0KTtcclxufVxyXG5cclxuY29uc3QgYXV0aCA9IHVzZUF1dGhTdG9yZSgpO1xyXG5jb25zdCB7IHQgfSA9IHVzZUkxOG4oKTtcclxuXHJcbi8vIFNob3cgbW9kYWwgb25seSB3aGVuIGF1dGggbGF5ZXIgaXMgcmVhZHksIGl0IGhhcyByZXF1ZXN0ZWQgbG9naW4sXHJcbi8vIGFuZCB0aGUgdXNlciBpcyBub3QgYWxyZWFkeSBhdXRoZW50aWNhdGVkLiBUaGlzIHByZXZlbnRzIHRoZSBtb2RhbFxyXG4vLyBmcm9tIGZsYXNoaW5nIG9yIGFwcGVhcmluZyBmb3Igbm9uLWF1dGggZXJyb3JzLlxyXG5jb25zdCB2aXNpYmxlID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gYXV0aC5yZWFkeSAmJiBhdXRoLnNob3dMb2dpbk1vZGFsICYmICFhdXRoLmlzQXV0aGVudGljYXRlZCAmJiAhYXV0aC5sb2dvdXRJbml0aWF0ZWQsXHJcbik7XHJcbmNvbnN0IGNyZWRlbnRpYWxzQ29uZmlndXJlZCA9IGNvbXB1dGVkKCgpID0+IGF1dGguY3JlZGVudGlhbHNDb25maWd1cmVkKTtcclxuXHJcbi8vIFdoZW4gbm8gY3JlZGVudGlhbHMgZXhpc3Qgd2UgYWx3YXlzIHNob3cgdGhlIGNyZWF0ZS1maXJzdC11c2VyIChzaWduLXVwKSBmb3JtXHJcbmNvbnN0IGlzU2lnblVwID0gcmVmKGZhbHNlKTtcclxuY29uc3QgZWZmZWN0aXZlU2lnblVwID0gY29tcHV0ZWQoKCkgPT4gaXNTaWduVXAudmFsdWUgfHwgIWNyZWRlbnRpYWxzQ29uZmlndXJlZC52YWx1ZSk7XHJcblxyXG5jb25zdCBwYW5lbFRpdGxlID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghY3JlZGVudGlhbHNDb25maWd1cmVkLnZhbHVlKSByZXR1cm4gdCgnYXV0aC5jcmVhdGVfZmlyc3RfdXNlcicpO1xyXG4gIHJldHVybiBlZmZlY3RpdmVTaWduVXAudmFsdWUgPyAnQ3JlYXRlIEFjY291bnQnIDogdCgnYXV0aC5sb2dpbl90aXRsZScpO1xyXG59KTtcclxuXHJcbmNvbnN0IHBhbmVsU3VidGl0bGUgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFjcmVkZW50aWFsc0NvbmZpZ3VyZWQudmFsdWUpIHJldHVybiB0KCdhdXRoLmZpcnN0X3VzZXJfc3VidGl0bGUnKTtcclxuICByZXR1cm4gZWZmZWN0aXZlU2lnblVwLnZhbHVlXHJcbiAgICA/ICdGaWxsIGluIHRoZSBkZXRhaWxzIGJlbG93IHRvIHJlZ2lzdGVyLidcclxuICAgIDogJ1dlbGNvbWUgYmFjayEgUGxlYXNlIHNpZ24gaW4gdG8gY29udGludWUuJztcclxufSk7XHJcblxyXG5jb25zdCBzdWJtaXRMYWJlbCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoc3VibWl0dGluZy52YWx1ZSkge1xyXG4gICAgcmV0dXJuIGVmZmVjdGl2ZVNpZ25VcC52YWx1ZSA/IHQoJ2F1dGguY3JlYXRpbmdfdXNlcicpIDogdCgnYXV0aC5sb2dpbl9sb2FkaW5nJyk7XHJcbiAgfVxyXG4gIHJldHVybiBlZmZlY3RpdmVTaWduVXAudmFsdWUgPyB0KCdhdXRoLmNyZWF0ZV91c2VyJykgOiB0KCdhdXRoLmxvZ2luX3NpZ25faW4nKTtcclxufSk7XHJcblxyXG5jb25zdCB1c2VybmFtZSA9IHJlZignJyk7XHJcbmNvbnN0IHBhc3N3b3JkID0gcmVmKCcnKTtcclxuY29uc3QgbmV3UGFzc3dvcmQgPSByZWYoJycpO1xyXG5jb25zdCBjb25maXJtTmV3UGFzc3dvcmQgPSByZWYoJycpO1xyXG5jb25zdCBlcnJvciA9IHJlZignJyk7XHJcbmNvbnN0IHN1Y2Nlc3MgPSByZWYoJycpO1xyXG5jb25zdCBzdWJtaXR0aW5nID0gcmVmKGZhbHNlKTtcclxuY29uc3QgcmVtZW1iZXJNZSA9IHJlZihmYWxzZSk7XG5cclxud2F0Y2godmlzaWJsZSwgKHYpID0+IHtcclxuICBpZiAodikgcmVzZXQoKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiByZXNldCgpIHtcclxuICB1c2VybmFtZS52YWx1ZSA9ICcnO1xyXG4gIHBhc3N3b3JkLnZhbHVlID0gJyc7XHJcbiAgbmV3UGFzc3dvcmQudmFsdWUgPSAnJztcbiAgY29uZmlybU5ld1Bhc3N3b3JkLnZhbHVlID0gJyc7XG4gIGVycm9yLnZhbHVlID0gJyc7XG4gIHN1Y2Nlc3MudmFsdWUgPSAnJztcbiAgcmVtZW1iZXJNZS52YWx1ZSA9IGZhbHNlO1xuICBpc1NpZ25VcC52YWx1ZSA9IGZhbHNlO1xufVxuXHJcbmZ1bmN0aW9uIHRvZ2dsZU1vZGUoKSB7XHJcbiAgaXNTaWduVXAudmFsdWUgPSAhaXNTaWduVXAudmFsdWU7XHJcbiAgZXJyb3IudmFsdWUgPSAnJztcclxuICBzdWNjZXNzLnZhbHVlID0gJyc7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcclxuICBjb25zdCBNSU5fTE9HSU5fREVMQVlfTVMgPSAxMDAwO1xyXG4gIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuICBlcnJvci52YWx1ZSA9ICcnO1xyXG4gIHN1Y2Nlc3MudmFsdWUgPSAnJztcclxuICBpZiAoc3VibWl0dGluZy52YWx1ZSkgcmV0dXJuO1xyXG4gIHN1Ym1pdHRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIC8vIFRvZ2dsZSBzdG9yZSBsb2dnaW5nIHN0YXRlIOKAlCBQaW5pYSB1bndyYXBzIHJlZnMgc28gZGlyZWN0IGFzc2lnbm1lbnQgd29ya3NcclxuICBjb25zdCBzZXRMb2dnaW5nID0gKHN0YXRlOiBib29sZWFuKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAoYXV0aCBhcyBhbnkpLmxvZ2dpbmdJbiA9IHN0YXRlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIG5vb3BcclxuICAgIH1cclxuICB9O1xyXG4gIHNldExvZ2dpbmcodHJ1ZSk7XHJcbiAgdHJ5IHtcclxuICAgIC8vIENhcHR1cmUgd2hldGhlciB0aGlzIGlzIHRoZSBmaXJzdC11c2VyIGZsb3cgYmVmb3JlIHdlIHBvdGVudGlhbGx5IGZsaXAgdGhlIGZsYWdcclxuICAgIGNvbnN0IGZpcnN0VXNlckZsb3cgPSBlZmZlY3RpdmVTaWduVXAudmFsdWU7XHJcbiAgICBpZiAoZmlyc3RVc2VyRmxvdykge1xyXG4gICAgICBpZiAoIW5ld1Bhc3N3b3JkLnZhbHVlIHx8IG5ld1Bhc3N3b3JkLnZhbHVlICE9PSBjb25maXJtTmV3UGFzc3dvcmQudmFsdWUpIHtcclxuICAgICAgICBlcnJvci52YWx1ZSA9IHQoJ2F1dGgucGFzc3dvcmRfbWlzbWF0Y2gnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgLy8gVXNlIHBhc3N3b3JkIHNhdmUgZW5kcG9pbnQgdG8gY3JlYXRlIGZpcnN0IGNyZWRlbnRpYWxzIChubyBhdXRoIHJlcXVpcmVkIHdoZW4gbm9uZSBjb25maWd1cmVkKVxyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBodHRwLnBvc3QoXHJcbiAgICAgICAgJy9hcGkvcGFzc3dvcmQnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGN1cnJlbnRVc2VybmFtZTogdXNlcm5hbWUudmFsdWUsXHJcbiAgICAgICAgICAvLyBTZXJ2ZXIgaWdub3JlcyBjdXJyZW50KiB3aGVuIG5vbmUgZXhpc3RcclxuICAgICAgICAgIGN1cnJlbnRQYXNzd29yZDogbmV3UGFzc3dvcmQudmFsdWUsXHJcbiAgICAgICAgICBuZXdVc2VybmFtZTogdXNlcm5hbWUudmFsdWUsXHJcbiAgICAgICAgICBuZXdQYXNzd29yZDogbmV3UGFzc3dvcmQudmFsdWUsXHJcbiAgICAgICAgICBjb25maXJtTmV3UGFzc3dvcmQ6IGNvbmZpcm1OZXdQYXNzd29yZC52YWx1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICAgKTtcclxuICAgICAgaWYgKHJlcy5zdGF0dXMgIT09IDIwMCB8fCAhcmVzLmRhdGEgfHwgIXJlcy5kYXRhLnN0YXR1cykge1xyXG4gICAgICAgIGVycm9yLnZhbHVlID0gcmVzLmRhdGEgJiYgcmVzLmRhdGEuZXJyb3IgPyByZXMuZGF0YS5lcnJvciA6IHQoJ2F1dGguY3JlYXRlX3VzZXJfZmFpbGVkJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGF1dGguc2V0Q3JlZGVudGlhbHNDb25maWd1cmVkKHRydWUpO1xyXG4gICAgICBzdWNjZXNzLnZhbHVlID0gdCgnYXV0aC51c2VyX2NyZWF0ZWQnKTtcclxuICAgICAgLy8gQXV0byBhdHRlbXB0IGxvZ2luIGFmdGVyIHNsaWdodCBkZWxheVxyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCAyNTApKTtcclxuICAgIH1cclxuICAgIC8vIFBlcmZvcm0gbG9naW4gKGlmIGZpcnN0LXRpbWUsIHVzZSB0aGUgbmV3bHkgY3JlYXRlZCBwYXNzd29yZCBleHBsaWNpdGx5KVxyXG4gICAgY29uc3QgbG9naW5SZXMgPSBhd2FpdCBodHRwLnBvc3QoXHJcbiAgICAgICcvYXBpL2F1dGgvbG9naW4nLFxyXG4gICAgICB7XHJcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnZhbHVlLFxyXG4gICAgICAgIHBhc3N3b3JkOiBmaXJzdFVzZXJGbG93ID8gbmV3UGFzc3dvcmQudmFsdWUgOiBwYXNzd29yZC52YWx1ZSxcclxuICAgICAgICByZW1lbWJlcl9tZTogcmVtZW1iZXJNZS52YWx1ZSxcclxuICAgICAgfSxcclxuICAgICAgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9LFxyXG4gICAgKTtcclxuICAgIGlmIChsb2dpblJlcy5zdGF0dXMgPT09IDIwMCAmJiBsb2dpblJlcy5kYXRhICYmIGxvZ2luUmVzLmRhdGEuc3RhdHVzKSB7XHJcbiAgICAgIC8vIFN0b3JlIHNlc3Npb24gdG9rZW4gZm9yIEF1dGhvcml6YXRpb24gaGVhZGVyIGluamVjdGlvbiAoYnlwYXNzZXMgX19Ib3N0LSBjb29raWUgcmVzdHJpY3Rpb24gaW4gSFRUUCBkZXYpXHJcbiAgICAgIGFwcGx5TG9naW5SZXNwb25zZShsb2dpblJlcy5kYXRhLCByZW1lbWJlck1lLnZhbHVlKTtcbiAgICAgIC8vIEVuc3VyZSB0aGUgbG9naW4gZmVlbHMgZGVsaWJlcmF0ZToga2VlcCB0aGUgbG9hZGluZyBzdGF0ZSBhdCBsZWFzdCBNSU5fTE9HSU5fREVMQVlfTVNcclxuICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBzdGFydDtcclxuICAgICAgaWYgKGVsYXBzZWQgPCBNSU5fTE9HSU5fREVMQVlfTVMpIHtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCBNSU5fTE9HSU5fREVMQVlfTVMgLSBlbGFwc2VkKSk7XHJcbiAgICAgIH1cclxuICAgICAgYXV0aC5zZXRBdXRoZW50aWNhdGVkKHRydWUpO1xyXG4gICAgICBzdWNjZXNzLnZhbHVlID0gdCgnYXV0aC5sb2dpbl9zdWNjZXNzJyk7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGF1dGguaGlkZUxvZ2luKCk7XHJcbiAgICAgIH0sIDQwMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvci52YWx1ZSA9XHJcbiAgICAgICAgbG9naW5SZXMuZGF0YSAmJiBsb2dpblJlcy5kYXRhLmVycm9yID8gbG9naW5SZXMuZGF0YS5lcnJvciA6IHQoJ2F1dGgubG9naW5fZmFpbGVkJyk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZXJyb3IudmFsdWUgPSB0KCdhdXRoLmxvZ2luX25ldHdvcmtfZXJyb3InKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc3VibWl0dGluZy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgc2V0TG9nZ2luZyhmYWxzZSk7XHJcbiAgfVxyXG59XHJcbi8vIEJhY2tkcm9wIGFuZCBFc2MgYXJlIGRpc2FibGVkIHZpYSBOTW9kYWwgcHJvcHMgKG1hc2stY2xvc2FibGU9ZmFsc2UsIGNsb3NlLW9uLWVzYz1mYWxzZSlcclxuPC9zY3JpcHQ+XHJcbjxzdHlsZSBzY29wZWQ+XHJcbi8qIOKUgOKUgCBUaGVtZSB0b2dnbGUg4pSA4pSAICovXHJcbi5sb2dpbi10aGVtZS10b2dnbGUge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB0b3A6IDEwcHg7XHJcbiAgbGVmdDogMTBweDtcclxuICB6LWluZGV4OiAxMDtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgd2lkdGg6IDJyZW07XHJcbiAgaGVpZ2h0OiAycmVtO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IoMCAwIDAgLyAwLjE4KTtcclxuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNnB4KTtcclxuICBib3JkZXI6IDFweCBzb2xpZCByZ2IoMjU1IDI1NSAyNTUgLyAwLjE4KTtcclxuICBjb2xvcjogI2ZmZjtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAxNTBtcyBlYXNlLCB0cmFuc2Zvcm0gMTUwbXMgZWFzZTtcclxufVxyXG5cclxuLmxvZ2luLXRoZW1lLXRvZ2dsZTpob3ZlciB7XHJcbiAgYmFja2dyb3VuZDogcmdiKDAgMCAwIC8gMC4zMik7XHJcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjA4KTtcclxufVxyXG5cclxuLyog4pSA4pSAIFNoZWxsIOKUgOKUgCAqL1xyXG4ubG9naW4tbW9kYWwtc2hlbGwge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIHdpZHRoOiBtaW4oNThyZW0sIDk2dncpO1xyXG4gIG1pbi1oZWlnaHQ6IDMxcmVtO1xyXG4gIGJvcmRlci1yYWRpdXM6IDEuMjVyZW07XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICBib3gtc2hhZG93OiAwIDJyZW0gNXJlbSByZ2IoMCAwIDAgLyAwLjIyKTtcclxuICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG59XHJcblxyXG4vKiDilIDilIAgTGVmdCBncmFkaWVudCBwYW5lbCDilIDilIAgKi9cclxuLmxvZ2luLXBhbmVsLWxlZnQge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB3aWR0aDogNDIlO1xyXG4gIG1pbi1oZWlnaHQ6IDEwMCU7XHJcbiAgYmFja2dyb3VuZDogdXJsKCcvaW1hZ2VzL2xvZ2luLWJnLmpwZycpIGNlbnRlciBjZW50ZXIgLyBjb3ZlciBuby1yZXBlYXQ7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICBmbGV4LXNocmluazogMDtcclxufVxyXG5cclxuLyogU2NyaW0gb3ZlciBpbWFnZSBzbyB0ZXh0IHN0YXlzIGxlZ2libGUgKi9cclxuLmxvZ2luLXBhbmVsLWxlZnQ6OmFmdGVyIHtcclxuICBjb250ZW50OiAnJztcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgaW5zZXQ6IDA7XHJcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE2MGRlZywgcmdiKDAgMCAwIC8gMC4xOCkgMCUsIHJnYigwIDAgMCAvIDAuNTIpIDEwMCUpO1xyXG4gIHotaW5kZXg6IDA7XHJcbn1cclxuXHJcbi5sb2dpbi1wYW5lbC1sZWZ0LWNvbnRlbnQge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB6LWluZGV4OiAxO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBoZWlnaHQ6IDEwMCU7XHJcbiAgcGFkZGluZzogMnJlbSAxLjc1cmVtO1xyXG4gIGNvbG9yOiAjZmZmO1xyXG4gIGdhcDogMXJlbTtcclxufVxyXG5cclxuLmxvZ2luLXBhbmVsLWxvZ28ge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICB3aWR0aDogMi43NXJlbTtcclxuICBoZWlnaHQ6IDIuNzVyZW07XHJcbiAgYm9yZGVyLXJhZGl1czogMC43NXJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IoMjU1IDI1NSAyNTUgLyAwLjIyKTtcclxuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNnB4KTtcclxuICBmbGV4LXNocmluazogMDtcclxufVxyXG5cclxuLmxvZ2luLXBhbmVsLXRhZ2xpbmUge1xyXG4gIG1hcmdpbi10b3A6IGF1dG87XHJcbiAgcGFkZGluZy1ib3R0b206IDEuNXJlbTtcclxufVxyXG5cclxuLmxvZ2luLXBhbmVsLXRhZ2xpbmUgaDIge1xyXG4gIGZvbnQtc2l6ZTogMnJlbTtcclxuICBmb250LXdlaWdodDogNzAwO1xyXG4gIGxpbmUtaGVpZ2h0OiAxLjE1O1xyXG4gIG1hcmdpbjogMCAwIDAuNXJlbTtcclxufVxyXG5cclxuLmxvZ2luLXBhbmVsLXRhZ2xpbmUgcCB7XHJcbiAgZm9udC1zaXplOiAwLjg1cmVtO1xyXG4gIG9wYWNpdHk6IDAuODg7XHJcbiAgbGluZS1oZWlnaHQ6IDEuNTtcclxuICBtYXJnaW46IDA7XHJcbn1cclxuXHJcbi8qIOKUgOKUgCBSaWdodCBmb3JtIHBhbmVsIOKUgOKUgCAqL1xyXG4ubG9naW4tcGFuZWwtcmlnaHQge1xyXG4gIGZsZXg6IDE7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIHBhZGRpbmc6IDIuNXJlbSAyLjI1cmVtO1xyXG4gIGJhY2tncm91bmQ6ICNmZmY7XHJcbn1cclxuXHJcbi5sb2dpbi1mb3JtLXdyYXAge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG4gIG1heC13aWR0aDogMjJyZW07XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGdhcDogMS41cmVtO1xyXG59XHJcblxyXG4ubG9naW4tZm9ybS1oZWFkZXIge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBnYXA6IDAuMzVyZW07XHJcbn1cclxuXHJcbi5sb2dpbi1mb3JtLXRpdGxlIHtcclxuICBmb250LXNpemU6IDEuNjVyZW07XHJcbiAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICBjb2xvcjogIzFhMWEyZTtcclxuICBtYXJnaW46IDA7XHJcbiAgbGluZS1oZWlnaHQ6IDEuMjtcclxufVxyXG5cclxuLmxvZ2luLWZvcm0tc3VidGl0bGUge1xyXG4gIGZvbnQtc2l6ZTogMC44MnJlbTtcclxuICBjb2xvcjogIzZiNzI4MDtcclxuICBtYXJnaW46IDA7XHJcbiAgbGluZS1oZWlnaHQ6IDEuNTtcclxufVxyXG5cclxuLmxvZ2luLWZvcm0tYm9keSB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGdhcDogMXJlbTtcclxufVxyXG5cclxuLyog4pSA4pSAIEZpZWxkIOKUgOKUgCAqL1xyXG4ubGYtZmllbGQge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBnYXA6IDAuMzVyZW07XHJcbn1cclxuXHJcbi5sZi1sYWJlbCB7XHJcbiAgZm9udC1zaXplOiAwLjc4cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgY29sb3I6ICMzNzQxNTE7XHJcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDFlbTtcclxufVxyXG5cclxuLyog4pSA4pSAIFJlbWVtYmVyIHJvdyDilIDilIAgKi9cclxuLmxmLXJlbWVtYmVyLXJvdyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxufVxyXG5cclxuLyog4pSA4pSAIEZlZWRiYWNrIOKUgOKUgCAqL1xyXG4ubGYtZmVlZGJhY2sge1xyXG4gIG1hcmdpbi10b3A6IC0wLjI1cmVtO1xyXG59XHJcblxyXG4vKiDilIDilIAgU3VibWl0IOKUgOKUgCAqL1xyXG4ubGYtc3VibWl0LWJ0biB7XHJcbiAgbWFyZ2luLXRvcDogMC4yNXJlbTtcclxufVxyXG5cclxuLyog4pSA4pSAIFRvZ2dsZSDilIDilIAgKi9cclxuLmxmLXRvZ2dsZS1yb3cge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICBnYXA6IDAuMzVyZW07XHJcbiAgZm9udC1zaXplOiAwLjgycmVtO1xyXG59XHJcblxyXG4ubGYtdG9nZ2xlLXRleHQge1xyXG4gIGNvbG9yOiAjNmI3MjgwO1xyXG59XHJcblxyXG4ubGYtdG9nZ2xlLWJ0biB7XHJcbiAgYmFja2dyb3VuZDogbm9uZTtcclxuICBib3JkZXI6IG5vbmU7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIGZvbnQtc2l6ZTogMC44MnJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGNvbG9yOiAjN2MzYWVkO1xyXG4gIHBhZGRpbmc6IDA7XHJcbiAgdHJhbnNpdGlvbjogY29sb3IgMTUwbXMgZWFzZTtcclxufVxyXG5cclxuLmxmLXRvZ2dsZS1idG46aG92ZXIge1xyXG4gIGNvbG9yOiAjYTg1NWY3O1xyXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xyXG59XHJcblxyXG4vKiDilIDilIAgTGlnaHQgbW9kZToga2VlcCBOYWl2ZVVJIGRlZmF1bHQgKG5vIG92ZXJyaWRlIG5lZWRlZCkg4pSA4pSAICovXHJcblxyXG4vKiDilIDilIAgRGFyayBtb2RlIG92ZXJyaWRlcyDilIDilIAgKi9cclxuLmRhcmsgLmxvZ2luLW1vZGFsLXNoZWxsIHtcclxuICBiYWNrZ3JvdW5kOiAjMTgxODFiO1xyXG59XHJcblxyXG4uZGFyayAubG9naW4tcGFuZWwtcmlnaHQge1xyXG4gIGJhY2tncm91bmQ6ICMxODE4MWI7XHJcbn1cclxuXHJcbi5kYXJrIDpkZWVwKC5uLWlucHV0KSB7XHJcbiAgLS1uLWNvbG9yOiByZ2IoMjU1IDI1NSAyNTUgLyAwLjA2KSAhaW1wb3J0YW50O1xyXG4gIC0tbi1jb2xvci1mb2N1czogcmdiKDI1NSAyNTUgMjU1IC8gMC4wOCkgIWltcG9ydGFudDtcclxuICAtLW4tdGV4dC1jb2xvcjogI2Y0ZjRmNSAhaW1wb3J0YW50O1xyXG4gIC0tbi1wbGFjZWhvbGRlci1jb2xvcjogcmdiKDI1NSAyNTUgMjU1IC8gMC4zMikgIWltcG9ydGFudDtcclxuICAtLW4tYm9yZGVyOiAxcHggc29saWQgcmdiKDI1NSAyNTUgMjU1IC8gMC4xKSAhaW1wb3J0YW50O1xyXG4gIC0tbi1ib3JkZXItZm9jdXM6IDFweCBzb2xpZCAjN2MzYWVkICFpbXBvcnRhbnQ7XHJcbiAgLS1uLWJvcmRlci1ob3ZlcjogMXB4IHNvbGlkIHJnYigyNTUgMjU1IDI1NSAvIDAuMikgIWltcG9ydGFudDtcclxuICAtLW4tY2FyZXQtY29sb3I6ICNhNzhiZmEgIWltcG9ydGFudDtcclxufVxyXG5cclxuLmRhcmsgLmxvZ2luLWZvcm0tdGl0bGUge1xyXG4gIGNvbG9yOiAjZjRmNGY1O1xyXG59XHJcblxyXG4uZGFyayAubG9naW4tZm9ybS1zdWJ0aXRsZSB7XHJcbiAgY29sb3I6ICNhMWExYWE7XHJcbn1cclxuXHJcbi5kYXJrIC5sZi1sYWJlbCB7XHJcbiAgY29sb3I6ICNkNGQ0ZDg7XHJcbn1cclxuXHJcbi5kYXJrIC5sZi10b2dnbGUtdGV4dCB7XHJcbiAgY29sb3I6ICNhMWExYWE7XHJcbn1cclxuXHJcbi8qIOKUgOKUgCBSZXNwb25zaXZlOiBoaWRlIGxlZnQgcGFuZWwgb24gdmVyeSBzbWFsbCBzY3JlZW5zIOKUgOKUgCAqL1xyXG5AbWVkaWEgKG1heC13aWR0aDogMzZyZW0pIHtcclxuICAubG9naW4tcGFuZWwtbGVmdCB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuICAubG9naW4tbW9kYWwtc2hlbGwge1xyXG4gICAgd2lkdGg6IG1pbigyNnJlbSwgOTZ2dyk7XHJcbiAgfVxyXG59XHJcbjwvc3R5bGU+XHJcbiIsImltcG9ydCB7IGRlZmluZVN0b3JlIH0gZnJvbSAncGluaWEnO1xyXG5pbXBvcnQgeyByZWYsIFJlZiwgY29tcHV0ZWQgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyB1c2VBdXRoU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9hdXRoJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcblxyXG5leHBvcnQgY29uc3QgdXNlQ29ubmVjdGl2aXR5U3RvcmUgPSBkZWZpbmVTdG9yZSgnY29ubmVjdGl2aXR5JywgKCkgPT4ge1xyXG4gIGNvbnN0IG9mZmxpbmU6IFJlZjxib29sZWFuPiA9IHJlZihmYWxzZSk7XHJcbiAgY29uc3QgY2hlY2tpbmc6IFJlZjxib29sZWFuPiA9IHJlZihmYWxzZSk7XHJcbiAgY29uc3QgbGFzdE9rOiBSZWY8bnVtYmVyIHwgbnVsbD4gPSByZWYobnVsbCk7XHJcbiAgY29uc3QgcmV0cnlNczogUmVmPG51bWJlcj4gPSByZWYoMTUwMDApO1xyXG4gIGNvbnN0IHN0YXJ0ZWQ6IFJlZjxib29sZWFuPiA9IHJlZihmYWxzZSk7XHJcblxyXG4gIGxldCBpbnRlcnZhbElkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBsZXQgcXVpY2tSZXRyeVRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBsZXQgb25CZWNhbWVBY3RpdmVIYW5kbGVyOiAoKHRoaXM6IFdpbmRvdywgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGxldCBmYWlsQ291bnQgPSAwO1xyXG4gIGNvbnN0IGZhaWxUaHJlc2hvbGQgPSAyO1xyXG5cclxuICBsZXQgb2ZmbGluZVNpbmNlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBjb25zdCBvdmVybGF5RGVsYXlNcyA9IDA7XHJcbiAgY29uc3QgcXVpY2tSZXRyeU1zID0gMTAwMDtcclxuXHJcbiAgLy8gVXRpbHNcclxuICBjb25zdCBnZXRBdXRoID0gKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIHVzZUF1dGhTdG9yZSgpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgY29uc3QgaXNMb2dvdXRJbml0aWF0ZWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBhdXRoID0gZ2V0QXV0aCgpO1xyXG4gICAgcmV0dXJuICEhKGF1dGggJiYgKGF1dGggYXMgYW55KS5sb2dvdXRJbml0aWF0ZWQpO1xyXG4gIH07XHJcbiAgY29uc3QgaXNMb2dnaW5nSW4gPSAoKSA9PiB7XHJcbiAgICBjb25zdCBhdXRoID0gZ2V0QXV0aCgpO1xyXG4gICAgcmV0dXJuICEhKGF1dGggJiYgKGF1dGggYXMgYW55KS5sb2dnaW5nSW4gJiYgKGF1dGggYXMgYW55KS5sb2dnaW5nSW4udmFsdWUgPT09IHRydWUpO1xyXG4gIH07XHJcbiAgY29uc3QgaXNUYWJBY3RpdmUgPSAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB2aXNpYmxlID1cclxuICAgICAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScgOiB0cnVlO1xyXG4gICAgICBjb25zdCBmb2N1cyA9XHJcbiAgICAgICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5oYXNGb2N1cyA/IGRvY3VtZW50Lmhhc0ZvY3VzKCkgOiB0cnVlO1xyXG4gICAgICByZXR1cm4gdmlzaWJsZSAmJiBmb2N1cztcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IGxhdGVyID0gKGZuOiAoKSA9PiB2b2lkLCBtczogbnVtYmVyKSA9PiB3aW5kb3cuc2V0VGltZW91dChmbiwgbXMpO1xyXG5cclxuICBmdW5jdGlvbiBzZXRPZmZsaW5lKHY6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmIChpc0xvZ291dEluaXRpYXRlZCgpKSByZXR1cm47IC8vIGRvbid0IHNob3cgb2ZmbGluZSBkdXJpbmcgaW50ZW50aW9uYWwgbG9nb3V0XHJcbiAgICBpZiAob2ZmbGluZS52YWx1ZSA9PT0gdikgcmV0dXJuO1xyXG5cclxuICAgIGlmICh2ICYmICFvZmZsaW5lLnZhbHVlICYmIG9mZmxpbmVTaW5jZSA9PSBudWxsKSBvZmZsaW5lU2luY2UgPSBEYXRlLm5vdygpO1xyXG4gICAgb2ZmbGluZS52YWx1ZSA9IHY7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWZyZXNoUGFnZSgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZEF2b2lkQXV0b1JlbG9hZCgpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24/LnBhdGhuYW1lID8/ICcnO1xyXG4gICAgICBpZiAocGF0aC5zdGFydHNXaXRoKCcvd2VicnRjJykpIHJldHVybiB0cnVlO1xyXG4gICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9fc3Vuc2hpbmVfd2VicnRjX2FjdGl2ZSkgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgLyogaWdub3JlICovXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBjaGVja09uY2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoY2hlY2tpbmcudmFsdWUpIHJldHVybjtcclxuICAgIGNoZWNraW5nLnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBBbnkgSFRUUCBzdGF0dXMgbWVhbnMgdGhlIHNlcnZlciBpcyByZWFjaGFibGUuXHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL2NvbmZpZ0xvY2FsZScsIHtcclxuICAgICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcclxuICAgICAgICB0aW1lb3V0OiAyNTAwLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIGlmIChxdWlja1JldHJ5VGltZXIpIHtcclxuICAgICAgICAgIGNsZWFyVGltZW91dChxdWlja1JldHJ5VGltZXIpO1xyXG4gICAgICAgICAgcXVpY2tSZXRyeVRpbWVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmFpbENvdW50ID0gMDtcclxuICAgICAgICBzZXRPZmZsaW5lKGZhbHNlKTtcclxuICAgICAgICBsYXN0T2sudmFsdWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIC8vIEhhbmRsZSByZWNvdmVyeSBhZnRlciBhbiBvZmZsaW5lIHBlcmlvZFxyXG4gICAgICAgIGlmIChvZmZsaW5lU2luY2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgY29uc3Qgb2ZmbGluZUR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIG9mZmxpbmVTaW5jZTtcclxuICAgICAgICAgIGNvbnN0IHJlbG9hZEFmdGVyT2ZmbGluZU1zID0gNTAwO1xyXG4gICAgICAgICAgaWYgKG9mZmxpbmVEdXJhdGlvbiA+PSByZWxvYWRBZnRlck9mZmxpbmVNcykge1xyXG4gICAgICAgICAgICBpZiAoc2hvdWxkQXZvaWRBdXRvUmVsb2FkKCkpIHtcclxuICAgICAgICAgICAgICBvZmZsaW5lU2luY2UgPSBudWxsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gb2ZmbGluZUR1cmF0aW9uIDwgMjAwID8gMjAwIC0gb2ZmbGluZUR1cmF0aW9uIDogMDtcclxuICAgICAgICAgICAgICBsYXRlcihyZWZyZXNoUGFnZSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvZmZsaW5lU2luY2UgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIGZhaWxDb3VudCArPSAxO1xyXG5cclxuICAgICAgLy8gRmlyc3QgZmFpbHVyZTogcXVpY2sgcmVjaGVja1xyXG4gICAgICBpZiAoZmFpbENvdW50ID09PSAxICYmICFxdWlja1JldHJ5VGltZXIpIHtcclxuICAgICAgICBxdWlja1JldHJ5VGltZXIgPSBsYXRlcigoKSA9PiB7XHJcbiAgICAgICAgICBxdWlja1JldHJ5VGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgaWYgKCFjaGVja2luZy52YWx1ZSkgY2hlY2tPbmNlKCk7XHJcbiAgICAgICAgfSwgcXVpY2tSZXRyeU1zKTtcclxuICAgICAgfSBlbHNlIGlmIChmYWlsQ291bnQgPj0gZmFpbFRocmVzaG9sZCkge1xyXG4gICAgICAgIC8vIENvbmZpcm1lZCBvZmZsaW5lIGFmdGVyIHRocmVzaG9sZFxyXG4gICAgICAgIHNldE9mZmxpbmUodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGNoZWNraW5nLnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBvdmVybGF5VmlzaWJsZSA9IGNvbXB1dGVkKCgpID0+IHtcclxuICAgIGlmICghb2ZmbGluZS52YWx1ZSB8fCBpc0xvZ2dpbmdJbigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICBjb25zdCBzaW5jZSA9IG9mZmxpbmVTaW5jZSA/PyBEYXRlLm5vdygpO1xyXG4gICAgcmV0dXJuIERhdGUubm93KCkgLSBzaW5jZSA+PSBvdmVybGF5RGVsYXlNcztcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gc3RhcnQoKTogdm9pZCB7XHJcbiAgICBpZiAoc3RhcnRlZC52YWx1ZSkgcmV0dXJuO1xyXG4gICAgc3RhcnRlZC52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgbGF0ZXIoY2hlY2tPbmNlLCA1MDApO1xyXG5cclxuICAgIGludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBpZiAoaXNUYWJBY3RpdmUoKSkgY2hlY2tPbmNlKCk7XHJcbiAgICB9LCByZXRyeU1zLnZhbHVlKTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb25saW5lJywgKCkgPT4gbGF0ZXIoY2hlY2tPbmNlLCAyMDApKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvZmZsaW5lJywgKCkgPT4gc2V0T2ZmbGluZSh0cnVlKSk7XHJcblxyXG4gICAgb25CZWNhbWVBY3RpdmVIYW5kbGVyID0gKCkgPT5cclxuICAgICAgbGF0ZXIoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpc1RhYkFjdGl2ZSgpKSBjaGVja09uY2UoKTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgb25CZWNhbWVBY3RpdmVIYW5kbGVyKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIG9uQmVjYW1lQWN0aXZlSGFuZGxlcik7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N1bnNoaW5lOm9mZmxpbmUnLCAoKSA9PiB7XHJcbiAgICAgIC8qIG5vb3A6IGhlYXJ0YmVhdCBnb3Zlcm5zICovXHJcbiAgICB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdW5zaGluZTpvbmxpbmUnLCAoKSA9PiB7XHJcbiAgICAgIGlmIChpc0xvZ291dEluaXRpYXRlZCgpKSByZXR1cm47XHJcbiAgICAgIHNldE9mZmxpbmUoZmFsc2UpO1xyXG4gICAgICBsYXN0T2sudmFsdWUgPSBEYXRlLm5vdygpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdG9wKCk6IHZvaWQge1xyXG4gICAgaWYgKGludGVydmFsSWQpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcclxuICAgICAgaW50ZXJ2YWxJZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAocXVpY2tSZXRyeVRpbWVyKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dChxdWlja1JldHJ5VGltZXIpO1xyXG4gICAgICBxdWlja1JldHJ5VGltZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKG9uQmVjYW1lQWN0aXZlSGFuZGxlcikge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgb25CZWNhbWVBY3RpdmVIYW5kbGVyKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvbkJlY2FtZUFjdGl2ZUhhbmRsZXIpO1xyXG4gICAgICB9IGNhdGNoIHt9XHJcbiAgICAgIG9uQmVjYW1lQWN0aXZlSGFuZGxlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGFydGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgb2ZmbGluZSxcclxuICAgIGNoZWNraW5nLFxyXG4gICAgbGFzdE9rLFxyXG4gICAgcmV0cnlNcyxcclxuICAgIG92ZXJsYXlWaXNpYmxlLFxyXG4gICAgc3RhcnQsXHJcbiAgICBzdG9wLFxyXG4gICAgY2hlY2tPbmNlLFxyXG4gICAgcmVmcmVzaFBhZ2UsXHJcbiAgfTtcclxufSk7XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZS1mYXN0XCI+XHJcbiAgICA8ZGl2IHYtaWY9XCJ2aXNpYmxlXCIgY2xhc3M9XCJmaXhlZCBpbnNldC0wIHotWzE0MF0gZmxleCBmbGV4LWNvbFwiPlxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgY2xhc3M9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLWdyYWRpZW50LXRvLWJyIGZyb20td2hpdGUvNzAgdmlhLXdoaXRlLzYwIHRvLXdoaXRlLzcwIGRhcms6ZnJvbS1ibGFjay83MCBkYXJrOnZpYS1ibGFjay82MCBkYXJrOnRvLWJsYWNrLzcwIGJhY2tkcm9wLWJsdXItbWRcIlxyXG4gICAgICA+PC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZSBmbGV4LTEgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC02IG92ZXJmbG93LXktYXV0b1wiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgbWF4LXctbWQgbXgtYXV0byB0ZXh0LWNlbnRlciBzcGFjZS15LTZcIj5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxzdmdcclxuICAgICAgICAgICAgICBjbGFzcz1cImgtMjQgdy0yNCBvcGFjaXR5LTgwIG14LWF1dG8gc2VsZWN0LW5vbmVcIlxyXG4gICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjU2IDI1NlwiXHJcbiAgICAgICAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXHJcbiAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxwYXRoXHJcbiAgICAgICAgICAgICAgICBmaWxsPVwiI0ZERDEwN1wiXHJcbiAgICAgICAgICAgICAgICBkPVwiTTExOC43NjkgMjAuNzEycy02My44MzMgMjYtNzQuMzMzIDgzLjgzMyAzNy4xNjcgOTEuNSA4Ni4zMzMgNzUuMzMzIDcwLjMzMy01MSA4MS44MzMtODdjMCAwLTkuMzMzIDEwMC41LTk2LjE2NyAxMTUuNXMtMTE4LjE2Ny01MC04Mi4xNjctMTE5LjgzM0M0NC4yNjkgNjcuMDQ1IDgwLjUxOSAyOS42MjkgMTE4Ljc2OSAyMC43MTJ6XCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxwYXRoXHJcbiAgICAgICAgICAgICAgICBmaWxsPVwiI0Y4OUExQ1wiXHJcbiAgICAgICAgICAgICAgICBkPVwiTTExOC43NjkgMjAuNzEycy00MS4xMjUgMy42NjctODMuMjUgNjEuMDQyLTI4LjEyNSAxMzkuMTI1IDM0LjI1IDE0OS4zNzUgMTE1Ljg3NS00NC44NzUgMTMzLjUtODIuMzc1IDE1LjE2Ny02MS40NTggOS43NS03Ny44NzVjMCAwIC42NjcgMzYuNDE3LTEzLjMzMyA1OS42NjdzLTI5Ljc1IDQ2LjMzMy02NS4wODMgNjIuMTY3LTc0LjE2NyAxMy43NS05NS40MTctMTkuMjUtNS45MTctNzYuMDgzLS4yOTItODUuMzMzUzcyLjM5NCAzMy43OTUgMTE4Ljc2OSAyMC43MTJ6XCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxwYXRoXHJcbiAgICAgICAgICAgICAgICBmaWxsPVwiI0VGM0UyM1wiXHJcbiAgICAgICAgICAgICAgICBkPVwiTTczLjAxOSAzOS42MjlzMzguMTI1LTI4LjEyNSA3Ni44NzUtMjguMTI1IDYzIDI4LjI1IDY4LjUgNTIuMjUgNiA1NC4xMjUtMTEuNSA4Ny42MjUtMzcuMzc1IDU2LTc5LjEyNSA3Ni4xMjUtODQuNjI1IDIuNzUtODQuNjI1IDIuNzUgMjUuOTc3IDI1Ljg3NSA3MS4wNTEgMTYuNSA4Mi4yNDEtNDAuODc1IDk4LjQwOC02OS41IDI4Ljc5Mi01Ny4zNzUgMjcuNjY3LTkyLjI1LTIzLjc1LTU0LjUtMzEuMjUtNjAuMjUtMjMuMTg3LTE3LjgxMi01OC4xODctMTYuNTYyUzg2LjQ1NiAyOS44MTYgNzMuMDE5IDM5LjYyOXpcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPHBhdGhcclxuICAgICAgICAgICAgICAgIGZpbGw9XCIjRjI2MjIyXCJcclxuICAgICAgICAgICAgICAgIGQ9XCJNNzMuMDE5IDM5LjYyOXMzNS0zMi44MTMgODIuNDM3LTMyLjgxMyA2OS4xODggMjQuODEzIDc4Ljg3NSA0NC42ODggMjEuODEyIDcwLTEyLjE4OCAxMjNTMTQ3LjUxOCAyNDIuODc5IDEyOC41MTggMjQ3LjEyOXMtNDIuNDMxIDQuMjY5LTU5LjExMS0xLjIzYzAgMCAzNS4xOTUgOC4zOTcgNjYuNzc4LTcuNDM3czUxLjY2Ny0zMi4xNjcgNzQuMDgzLTY4LjgzNCAyNS45MTctNzIuNzUgMjIuMTY3LTkzLjkxNy0xMi4xNjctNDIuNDE3LTM2LjUtNTYuMzMzLTU2LjcyOS0xMC41MzEtNzQuNDc5LTQuNTMxUzkxLjk4OCAyNi40MSA3My4wMTkgMzkuNjI5elwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC0yeGwgZm9udC1zZW1pYm9sZCB0cmFja2luZy10aWdodFwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCdvZmZsaW5lLnRpdGxlJykgfX1cclxuICAgICAgICAgICAgPC9oMj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIG9wYWNpdHktODAgbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgICAge3sgJHQoJ29mZmxpbmUuZGVzY3JpcHRpb24nKSB9fVxyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCdvZmZsaW5lLnJldHJ5aW5nJykgfX1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cIm10LTQgdGV4dC14cyBvcGFjaXR5LTc1IHNlbGVjdC1ub25lXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCdvZmZsaW5lLmNsb3NlX2hpbnQnKSB9fVxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIDwvdHJhbnNpdGlvbj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgdXNlQ29ubmVjdGl2aXR5U3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25uZWN0aXZpdHknO1xyXG5cclxuY29uc3QgY29ubmVjdGl2aXR5ID0gdXNlQ29ubmVjdGl2aXR5U3RvcmUoKTtcclxuY29uc3QgdmlzaWJsZSA9IGNvbXB1dGVkKCgpID0+IGNvbm5lY3Rpdml0eS5vdmVybGF5VmlzaWJsZSk7XHJcbjwvc2NyaXB0PlxyXG4iLCJpbXBvcnQgeyBkZWZpbmVTdG9yZSB9IGZyb20gJ3BpbmlhJztcclxuaW1wb3J0IHsgcmVmIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcblxyXG4vLyBNZXRhZGF0YSBkZXNjcmliaW5nIGJ1aWxkL3J1bnRpbWUgaW5mbyByZXR1cm5lZCBieSAvYXBpL21ldGFcclxuZXhwb3J0IGludGVyZmFjZSBNZXRhSW5mbyB7XHJcbiAgcGxhdGZvcm0/OiBzdHJpbmc7XHJcbiAgc3RhdHVzPzogYm9vbGVhbjtcclxuICB2ZXJzaW9uPzogc3RyaW5nO1xyXG4gIGNvbW1pdD86IHN0cmluZztcclxuICBicmFuY2g/OiBzdHJpbmc7XHJcbiAgcmVsZWFzZV9kYXRlPzogc3RyaW5nOyAvLyBJU08gODYwMSB3aGVuIGF2YWlsYWJsZVxyXG4gIGdwdXM/OiBBcnJheTx7XHJcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcclxuICAgIHZlbmRvcl9pZD86IG51bWJlciB8IHN0cmluZztcclxuICAgIGRldmljZV9pZD86IG51bWJlciB8IHN0cmluZztcclxuICAgIGRlZGljYXRlZF92aWRlb19tZW1vcnk/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgfT47XHJcbiAgaGFzX252aWRpYV9ncHU/OiBib29sZWFuO1xyXG4gIGhhc19hbWRfZ3B1PzogYm9vbGVhbjtcclxuICBoYXNfaW50ZWxfZ3B1PzogYm9vbGVhbjtcclxuICB3aW5kb3dzX2Rpc3BsYXlfdmVyc2lvbj86IHN0cmluZztcclxuICB3aW5kb3dzX3JlbGVhc2VfaWQ/OiBzdHJpbmc7XHJcbiAgd2luZG93c19wcm9kdWN0X25hbWU/OiBzdHJpbmc7XHJcbiAgd2luZG93c19jdXJyZW50X2J1aWxkPzogc3RyaW5nO1xyXG4gIHdpbmRvd3NfYnVpbGRfbnVtYmVyPzogbnVtYmVyO1xyXG4gIHdpbmRvd3NfbWFqb3JfdmVyc2lvbj86IG51bWJlcjtcclxuICB3aW5kb3dzX21pbm9yX3ZlcnNpb24/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8vIC0tLSBEZWZhdWx0cyAoZmxhdCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBLZWVwIHRoZXNlIHNlcGFyYXRlIGZyb20gcnVudGltZSBzdGF0ZSBzbyByZWFkaW5nIGRlZmF1bHRzIGRvZXMgTk9UIG11dGF0ZVxyXG4vLyB0aGUgYWN0dWFsIGNvbmZpZyBvYmplY3QgdGhhdCB3aWxsIGJlIFBPU1RlZCBiYWNrIHRvIHRoZSBzZXJ2ZXIuXHJcblxyXG50eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VT4gPSAoVSBleHRlbmRzIHVua25vd24gPyAoYXJnOiBVKSA9PiB2b2lkIDogbmV2ZXIpIGV4dGVuZHMgKFxyXG4gIGFyZzogaW5mZXIgSSxcclxuKSA9PiB2b2lkXHJcbiAgPyBJXHJcbiAgOiBuZXZlcjtcclxuXHJcbnR5cGUgTXV0YWJsZTxUPiA9IHsgLXJlYWRvbmx5IFtLIGluIGtleW9mIFRdOiBUW0tdIH07XHJcblxyXG50eXBlIFdpZGVuTGl0ZXJhbDxUPiA9IFQgZXh0ZW5kcyBzdHJpbmdcclxuICA/IHN0cmluZ1xyXG4gIDogVCBleHRlbmRzIG51bWJlclxyXG4gICAgPyBudW1iZXJcclxuICAgIDogVCBleHRlbmRzIGJvb2xlYW5cclxuICAgICAgPyBib29sZWFuXHJcbiAgICAgIDogVCBleHRlbmRzIG51bGxcclxuICAgICAgICA/IG51bGxcclxuICAgICAgICA6IFQgZXh0ZW5kcyB1bmRlZmluZWRcclxuICAgICAgICAgID8gdW5kZWZpbmVkXHJcbiAgICAgICAgICA6IFQgZXh0ZW5kcyBSZWFkb25seUFycmF5PGluZmVyIFU+XHJcbiAgICAgICAgICAgID8gQXJyYXk8V2lkZW5MaXRlcmFsPFU+PlxyXG4gICAgICAgICAgICA6IFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxyXG4gICAgICAgICAgICAgID8geyBbSyBpbiBrZXlvZiBNdXRhYmxlPFQ+XTogV2lkZW5MaXRlcmFsPE11dGFibGU8VD5bS10+IH1cclxuICAgICAgICAgICAgICA6IFQ7XHJcbmNvbnN0IGRlZmF1bHRHcm91cHMgPSBbXHJcbiAge1xyXG4gICAgaWQ6ICdnZW5lcmFsJyxcclxuICAgIG5hbWU6ICdHZW5lcmFsJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgbG9jYWxlOiAnZW4nLFxyXG4gICAgICBzdW5zaGluZV9uYW1lOiAnJyxcclxuICAgICAgbWluX2xvZ19sZXZlbDogMixcclxuICAgICAgZW5hYmxlX3BhaXJpbmc6ICdlbmFibGVkJyxcclxuICAgICAgZW5hYmxlX2Rpc2NvdmVyeTogJ2VuYWJsZWQnLFxyXG4gICAgICBnbG9iYWxfcHJlcF9jbWQ6IFtdIGFzIEFycmF5PHsgZG86IHN0cmluZzsgdW5kbzogc3RyaW5nOyBlbGV2YXRlZD86IGJvb2xlYW4gfT4sXHJcbiAgICAgIGdsb2JhbF9zdGF0ZV9jbWQ6IFtdIGFzIEFycmF5PHsgZG86IHN0cmluZzsgdW5kbzogc3RyaW5nOyBlbGV2YXRlZD86IGJvb2xlYW4gfT4sXHJcbiAgICAgIHNlcnZlcl9jbWQ6IFtdIGFzIEFycmF5PHsgbmFtZTogc3RyaW5nOyBjbWQ6IHN0cmluZzsgZWxldmF0ZWQ/OiBib29sZWFuIH0+LFxyXG4gICAgICBub3RpZnlfcHJlX3JlbGVhc2VzOiAnZGlzYWJsZWQnLFxyXG4gICAgICB1cGRhdGVfY2hlY2tfaW50ZXJ2YWw6IDg2NDAwLFxyXG4gICAgICBzZXNzaW9uX3Rva2VuX3R0bF9zZWNvbmRzOiA4NjQwMCxcclxuICAgICAgcmVtZW1iZXJfbWVfcmVmcmVzaF90b2tlbl90dGxfc2Vjb25kczogNjA0ODAwLFxyXG4gICAgICBzeXN0ZW1fdHJheTogdHJ1ZSxcclxuICAgICAgaGlkZV90cmF5X2NvbnRyb2xzOiAnZGlzYWJsZWQnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnaW5wdXQnLFxyXG4gICAgbmFtZTogJ0lucHV0JyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgY29udHJvbGxlcjogJ2VuYWJsZWQnLFxyXG4gICAgICBnYW1lcGFkOiAnYXV0bycsXHJcbiAgICAgIGRzNF9iYWNrX2FzX3RvdWNocGFkX2NsaWNrOiAnZW5hYmxlZCcsXHJcbiAgICAgIG1vdGlvbl9hc19kczQ6ICdlbmFibGVkJyxcclxuICAgICAgdG91Y2hwYWRfYXNfZHM0OiAnZW5hYmxlZCcsXHJcbiAgICAgIGJhY2tfYnV0dG9uX3RpbWVvdXQ6IC0xLFxyXG4gICAgICBrZXlib2FyZDogJ2VuYWJsZWQnLFxyXG4gICAgICBrZXlfcmVwZWF0X2RlbGF5OiA1MDAsXHJcbiAgICAgIGtleV9yZXBlYXRfZnJlcXVlbmN5OiAyNC45LFxyXG4gICAgICBhbHdheXNfc2VuZF9zY2FuY29kZXM6ICdlbmFibGVkJyxcclxuICAgICAga2V5X3JpZ2h0YWx0X3RvX2tleV93aW46ICdkaXNhYmxlZCcsXHJcbiAgICAgIG1vdXNlOiAnZW5hYmxlZCcsXHJcbiAgICAgIGhpZ2hfcmVzb2x1dGlvbl9zY3JvbGxpbmc6ICdlbmFibGVkJyxcclxuICAgICAgbmF0aXZlX3Blbl90b3VjaDogJ2VuYWJsZWQnLFxyXG4gICAgICBlbmFibGVfaW5wdXRfb25seV9tb2RlOiAnZGlzYWJsZWQnLFxyXG4gICAgICBmb3J3YXJkX3J1bWJsZTogJ2VuYWJsZWQnLFxyXG4gICAgICBrZXliaW5kaW5nczogJ1sweDEwLDB4QTAsMHgxMSwweEEyLDB4MTIsMHhBNF0nLFxyXG4gICAgICBkczVfaW5wdXR0aW5vX3JhbmRvbWl6ZV9tYWM6IHRydWUsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdhdicsXHJcbiAgICBuYW1lOiAnQXVkaW8vVmlkZW8nLFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICBhdWRpb19zaW5rOiAnJyxcclxuICAgICAgdmlydHVhbF9zaW5rOiAnJyxcclxuICAgICAgaW5zdGFsbF9zdGVhbV9hdWRpb19kcml2ZXJzOiAnZW5hYmxlZCcsXHJcbiAgICAgIHN0cmVhbV9hdWRpbzogJ2VuYWJsZWQnLFxyXG4gICAgICBrZWVwX3NpbmtfZGVmYXVsdDogJ2VuYWJsZWQnLFxyXG4gICAgICBhdXRvX2NhcHR1cmVfc2luazogJ2VuYWJsZWQnLFxyXG4gICAgICBhZGFwdGVyX25hbWU6ICcnLFxyXG4gICAgICBvdXRwdXRfbmFtZTogJycsXHJcbiAgICAgIHZpcnR1YWxfZGlzcGxheV9tb2RlOiAnZGlzYWJsZWQnLFxyXG4gICAgICB2aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0OiAnZXhjbHVzaXZlJyxcclxuICAgICAgZGRfY29uZmlndXJhdGlvbl9vcHRpb246ICd2ZXJpZnlfb25seScsXHJcbiAgICAgIGRkX3Jlc29sdXRpb25fb3B0aW9uOiAnYXV0bycsXHJcbiAgICAgIGRkX21hbnVhbF9yZXNvbHV0aW9uOiAnJyxcclxuICAgICAgZGRfcmVmcmVzaF9yYXRlX29wdGlvbjogJ2F1dG8nLFxyXG4gICAgICBkZF9tYW51YWxfcmVmcmVzaF9yYXRlOiAnJyxcclxuICAgICAgZGRfaGRyX29wdGlvbjogJ2F1dG8nLFxyXG4gICAgICBkZF9oZHJfcmVxdWVzdF9vdmVycmlkZTogJ2F1dG8nLFxyXG4gICAgICBkZF9jb25maWdfcmV2ZXJ0X2RlbGF5OiAzMDAwLFxyXG4gICAgICBkZF9jb25maWdfcmV2ZXJ0X29uX2Rpc2Nvbm5lY3Q6ICdkaXNhYmxlZCcsXHJcbiAgICAgIGRkX3BhdXNlZF92aXJ0dWFsX2Rpc3BsYXlfdGltZW91dF9zZWNzOiAwLFxyXG4gICAgICBkZF9hbHdheXNfcmVzdG9yZV9mcm9tX2dvbGRlbjogZmFsc2UsXHJcbiAgICAgIGRkX3NuYXBzaG90X2V4Y2x1ZGVfZGV2aWNlczogW10gYXMgQXJyYXk8c3RyaW5nPixcclxuICAgICAgZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXk6ICcnLFxyXG4gICAgICBkZF9zbmFwc2hvdF9yZXN0b3JlX2hvdGtleV9tb2RpZmllcnM6ICdjdHJsK2FsdCtzaGlmdCcsXHJcbiAgICAgIGRkX2FjdGl2YXRlX3ZpcnR1YWxfZGlzcGxheTogZmFsc2UsXHJcbiAgICAgIGRkX21vZGVfcmVtYXBwaW5nOiB7XHJcbiAgICAgICAgbWl4ZWQ6IFtdIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+LFxyXG4gICAgICAgIHJlc29sdXRpb25fb25seTogW10gYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4sXHJcbiAgICAgICAgcmVmcmVzaF9yYXRlX29ubHk6IFtdIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+LFxyXG4gICAgICB9LFxyXG4gICAgICBkZF93YV92aXJ0dWFsX2RvdWJsZV9yZWZyZXNoOiB0cnVlLFxyXG4gICAgICBkZF93YV9kdW1teV9wbHVnX2hkcjEwOiBmYWxzZSxcclxuICAgICAgbWF4X2JpdHJhdGU6IDAsXHJcbiAgICAgIG1pbmltdW1fZnBzX3RhcmdldDogMjAsXHJcbiAgICAgIGZhbGxiYWNrX21vZGU6ICcxOTIweDEwODB4NjAnLFxyXG4gICAgICBsb3NzbGVzc19zY2FsaW5nX3BhdGg6ICcnLFxyXG4gICAgICBsb3NzbGVzc19zY2FsaW5nX2xlZ2FjeV9hdXRvX2RldGVjdDogZmFsc2UsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICduZXR3b3JrJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgdXBucDogJ2Rpc2FibGVkJyxcclxuICAgICAgYWRkcmVzc19mYW1pbHk6ICdpcHY0JyxcclxuICAgICAgYmluZF9hZGRyZXNzOiAnJyxcclxuICAgICAgcG9ydDogNDc5ODksXHJcbiAgICAgIG9yaWdpbl93ZWJfdWlfYWxsb3dlZDogJ2xhbicsXHJcbiAgICAgIGV4dGVybmFsX2lwOiAnJyxcclxuICAgICAgbGFuX2VuY3J5cHRpb25fbW9kZTogMCxcclxuICAgICAgd2FuX2VuY3J5cHRpb25fbW9kZTogMSxcclxuICAgICAgcGluZ190aW1lb3V0OiAxMDAwMCxcclxuICAgICAgdmlkZW9fbWF4X2JhdGNoX3NpemVfa2I6IDY0LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnZmlsZXMnLFxyXG4gICAgbmFtZTogJ0NvbmZpZyBGaWxlcycsXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgIGZpbGVfYXBwczogJycsXHJcbiAgICAgIGNyZWRlbnRpYWxzX2ZpbGU6ICcnLFxyXG4gICAgICBsb2dfcGF0aDogJycsXHJcbiAgICAgIHBrZXk6ICcnLFxyXG4gICAgICBjZXJ0OiAnJyxcclxuICAgICAgZmlsZV9zdGF0ZTogJycsXHJcbiAgICAgIHZpYmVzaGluZV9maWxlX3N0YXRlOiAnJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ3BsYXluaXRlJyxcclxuICAgIG5hbWU6ICdQbGF5bml0ZScsXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgIHBsYXluaXRlX2F1dG9fc3luYzogdHJ1ZSxcclxuICAgICAgcGxheW5pdGVfc3luY19hbGxfaW5zdGFsbGVkOiBmYWxzZSxcclxuICAgICAgcGxheW5pdGVfcmVjZW50X2dhbWVzOiAxMCxcclxuICAgICAgcGxheW5pdGVfcmVjZW50X21heF9hZ2VfZGF5czogMCxcclxuICAgICAgcGxheW5pdGVfYXV0b3N5bmNfZGVsZXRlX2FmdGVyX2RheXM6IDAsXHJcbiAgICAgIHBsYXluaXRlX2F1dG9zeW5jX3JlcXVpcmVfcmVwbGFjZW1lbnQ6IHRydWUsXHJcbiAgICAgIHBsYXluaXRlX2F1dG9zeW5jX3JlbW92ZV91bmluc3RhbGxlZDogdHJ1ZSxcclxuICAgICAgcGxheW5pdGVfZm9jdXNfYXR0ZW1wdHM6IDMsXHJcbiAgICAgIHBsYXluaXRlX2ZvY3VzX3RpbWVvdXRfc2VjczogMTUsXHJcbiAgICAgIHBsYXluaXRlX2ZvY3VzX2V4aXRfb25fZmlyc3Q6IGZhbHNlLFxyXG4gICAgICBwbGF5bml0ZV9mdWxsc2NyZWVuX2VudHJ5X2VuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICBwbGF5bml0ZV9zeW5jX2NhdGVnb3JpZXM6IFtdIGFzIEFycmF5PHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0+LFxyXG4gICAgICBwbGF5bml0ZV9zeW5jX3BsdWdpbnM6IFtdIGFzIEFycmF5PHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0+LFxyXG4gICAgICBwbGF5bml0ZV9leGNsdWRlX2NhdGVnb3JpZXM6IFtdIGFzIEFycmF5PHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0+LFxyXG4gICAgICBwbGF5bml0ZV9leGNsdWRlX3BsdWdpbnM6IFtdIGFzIEFycmF5PHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0+LFxyXG4gICAgICBwbGF5bml0ZV9leGNsdWRlX2dhbWVzOiBbXSBhcyBBcnJheTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9PixcclxuICAgICAgcGxheW5pdGVfaW5zdGFsbF9kaXI6ICcnLFxyXG4gICAgICBwbGF5bml0ZV9leHRlbnNpb25zX2RpcjogJycsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdhZHZhbmNlZCcsXHJcbiAgICBuYW1lOiAnQWR2YW5jZWQnLFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICBmZWNfcGVyY2VudGFnZTogMjAsXHJcbiAgICAgIGxpbWl0X2ZyYW1lcmF0ZTogJ2VuYWJsZWQnLFxyXG4gICAgICBxcDogMjgsXHJcbiAgICAgIG1pbl90aHJlYWRzOiAyLFxyXG4gICAgICBoZXZjX21vZGU6IDAsXHJcbiAgICAgIGF2MV9tb2RlOiAwLFxyXG4gICAgICBwcmVmZXJfMTBiaXRfc2RyOiBmYWxzZSxcclxuICAgICAgZW52dmFyX2NvbXBhdGliaWxpdHlfbW9kZTogJ2Rpc2FibGVkJyxcclxuICAgICAgbGVnYWN5X29yZGVyaW5nOiAnZGlzYWJsZWQnLFxyXG4gICAgICBpZ25vcmVfZW5jb2Rlcl9wcm9iZV9mYWlsdXJlOiAnZGlzYWJsZWQnLFxyXG4gICAgICBjYXB0dXJlOiAnJyxcclxuICAgICAgZW5jb2RlcjogJycsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdydHNzJyxcclxuICAgIG5hbWU6ICdGcmFtZSBMaW1pdGVyJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgZnJhbWVfbGltaXRlcl9lbmFibGU6IGZhbHNlLFxyXG4gICAgICBmcmFtZV9saW1pdGVyX3Byb3ZpZGVyOiAnYXV0bycsXHJcbiAgICAgIGZyYW1lX2xpbWl0ZXJfZnBzX2xpbWl0OiAwLFxyXG4gICAgICBydHNzX2luc3RhbGxfcGF0aDogJycsXHJcbiAgICAgIHJ0c3NfZnJhbWVfbGltaXRfdHlwZTogJ2FzeW5jJyxcclxuICAgICAgZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ252JyxcclxuICAgIG5hbWU6ICdOVklESUEgTlZFTkMgRW5jb2RlcicsXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgIG52ZW5jX3ByZXNldDogMSxcclxuICAgICAgbnZlbmNfdHdvcGFzczogJ3F1YXJ0ZXJfcmVzJyxcclxuICAgICAgbnZlbmNfc3BhdGlhbF9hcTogJ2Rpc2FibGVkJyxcclxuICAgICAgbnZlbmNfc3BsaXRfZW5jb2RlOiAnYXV0bycsXHJcbiAgICAgIG52ZW5jX3Zidl9pbmNyZWFzZTogMCxcclxuICAgICAgbnZlbmNfcmVhbHRpbWVfaGFnczogJ2VuYWJsZWQnLFxyXG4gICAgICBudmVuY19sYXRlbmN5X292ZXJfcG93ZXI6ICdlbmFibGVkJyxcclxuICAgICAgbnZlbmNfb3BlbmdsX3Z1bGthbl9vbl9keGdpOiAnZW5hYmxlZCcsXHJcbiAgICAgIG52ZW5jX2gyNjRfY2F2bGM6ICdkaXNhYmxlZCcsXHJcbiAgICAgIG52ZW5jX2ludHJhX3JlZnJlc2g6ICdkaXNhYmxlZCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdxc3YnLFxyXG4gICAgbmFtZTogJ0ludGVsIFF1aWNrU3luYyBFbmNvZGVyJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgcXN2X3ByZXNldDogJ21lZGl1bScsXHJcbiAgICAgIHFzdl9jb2RlcjogJ2F1dG8nLFxyXG4gICAgICBxc3Zfc2xvd19oZXZjOiAnZGlzYWJsZWQnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnYW1kJyxcclxuICAgIG5hbWU6ICdBTUQgQU1GIEVuY29kZXInLFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICBhbWRfdXNhZ2U6ICd1bHRyYWxvd2xhdGVuY3knLFxyXG4gICAgICBhbWRfcmM6ICd2YnJfbGF0ZW5jeScsXHJcbiAgICAgIGFtZF9lbmZvcmNlX2hyZDogJ2Rpc2FibGVkJyxcclxuICAgICAgYW1kX3F1YWxpdHk6ICdiYWxhbmNlZCcsXHJcbiAgICAgIGFtZF9wcmVhbmFseXNpczogJ2Rpc2FibGVkJyxcclxuICAgICAgYW1kX3ZiYXE6ICdlbmFibGVkJyxcclxuICAgICAgYW1kX2NvZGVyOiAnYXV0bycsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICd2dCcsXHJcbiAgICBuYW1lOiAnVmlkZW9Ub29sYm94IEVuY29kZXInLFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICB2dF9jb2RlcjogJ2F1dG8nLFxyXG4gICAgICB2dF9zb2Z0d2FyZTogJ2F1dG8nLFxyXG4gICAgICB2dF9yZWFsdGltZTogJ2VuYWJsZWQnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAndmFhcGknLFxyXG4gICAgbmFtZTogJ1ZBLUFQSSBFbmNvZGVyJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgdmFhcGlfc3RyaWN0X3JjX2J1ZmZlcjogJ2Rpc2FibGVkJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ3N3JyxcclxuICAgIG5hbWU6ICdTb2Z0d2FyZSBFbmNvZGVyJyxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgc3dfcHJlc2V0OiAnc3VwZXJmYXN0JyxcclxuICAgICAgc3dfdHVuZTogJ3plcm9sYXRlbmN5JyxcclxuICAgIH0sXHJcbiAgfSxcclxuXSBhcyBjb25zdCBzYXRpc2ZpZXMgUmVhZG9ubHlBcnJheTx7XHJcbiAgaWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgb3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbn0+O1xyXG5cclxuLy8gRmxhdHRlbiBmb3IgZWFzeSBsb29rdXBcclxudHlwZSBEZWZhdWx0R3JvdXBzID0gdHlwZW9mIGRlZmF1bHRHcm91cHM7XHJcbnR5cGUgQ29uZmlnRGVmYXVsdHMgPSBXaWRlbkxpdGVyYWw8VW5pb25Ub0ludGVyc2VjdGlvbjxEZWZhdWx0R3JvdXBzW251bWJlcl1bJ29wdGlvbnMnXT4+O1xyXG50eXBlIENvbmZpZ0tleSA9IGtleW9mIENvbmZpZ0RlZmF1bHRzO1xyXG50eXBlIENvbmZpZ0RhdGEgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuZXhwb3J0IHR5cGUgQ29uZmlnU3RhdGUgPSBDb25maWdEZWZhdWx0cyAmIHsgcGxhdGZvcm06IHN0cmluZyB9ICYgUmVjb3JkPHN0cmluZywgYW55PjtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRNYXA8VCBleHRlbmRzIHJlYWRvbmx5IHsgb3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfVtdPihncm91cHM6IFQpIHtcclxuICB0eXBlIFJlc3VsdCA9IFdpZGVuTGl0ZXJhbDxVbmlvblRvSW50ZXJzZWN0aW9uPFRbbnVtYmVyXVsnb3B0aW9ucyddPj47XHJcbiAgY29uc3QgbWFwID0ge30gYXMgUmVzdWx0O1xyXG4gIGZvciAoY29uc3QgZyBvZiBncm91cHMpIHtcclxuICAgIE9iamVjdC5hc3NpZ24obWFwIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBnLm9wdGlvbnMpO1xyXG4gIH1cclxuICByZXR1cm4gbWFwO1xyXG59XHJcblxyXG5jb25zdCBkZWZhdWx0TWFwOiBDb25maWdEZWZhdWx0cyA9IGNyZWF0ZURlZmF1bHRNYXAoZGVmYXVsdEdyb3Vwcyk7XHJcblxyXG5mdW5jdGlvbiBoYXNEZWZhdWx0S2V5KGtleTogc3RyaW5nKToga2V5IGlzIENvbmZpZ0tleSB7XHJcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkZWZhdWx0TWFwLCBrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWVwQ2xvbmU8VD4odjogVCk6IFQge1xyXG4gIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyB2IDogKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodikpIGFzIFQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWVwRXF1YWw8VD4oYTogVCwgYjogVCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShhKSA9PT0gSlNPTi5zdHJpbmdpZnkoYik7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCB1c2VDb25maWdTdG9yZSA9IGRlZmluZVN0b3JlKCdjb25maWcnLCAoKSA9PiB7XHJcbiAgY29uc3QgdGFicyA9IHJlZihkZWZhdWx0R3JvdXBzKTsgLy8ga2VlcCBleGlzdGluZyBleHBvcnQgc2hhcGVcclxuICBjb25zdCBfZGF0YSA9IHJlZjxDb25maWdEYXRhIHwgbnVsbD4obnVsbCk7IC8vIG9ubHkgdXNlci9zZXJ2ZXIgdmFsdWVzXHJcbiAgLy8gU2luZ2xlIG1ldGEgb2JqZWN0IGtlcHQgY29tcGxldGVseSBzZXBhcmF0ZSBmcm9tIHVzZXIgY29uZmlnXHJcbiAgY29uc3QgbWV0YWRhdGEgPSByZWY8TWV0YUluZm8+KHt9KTtcclxuICBjb25zdCBjb25maWcgPSByZWY8Q29uZmlnU3RhdGU+KGJ1aWxkV3JhcHBlcigpKTsgLy8gd3JhcHBlciB3aXRoIGdldHRlcnMvc2V0dGVycyBmb3IgVUkgYmluZGluZ1xyXG4gIGNvbnN0IHZlcnNpb24gPSByZWYoMCk7IC8vIGluY3JlbWVudHMgb25seSBvbiByZWFsIHVzZXIgY2hhbmdlc1xyXG4gIC8vIFRyYWNrIGtleXMgdGhhdCBzaG91bGQgcmVxdWlyZSBtYW51YWwgc2F2ZSAobm8gYXV0b3NhdmUpXHJcbiAgY29uc3QgbWFudWFsU2F2ZUtleXMgPSBuZXcgU2V0PHN0cmluZz4oW1xyXG4gICAgJ2dsb2JhbF9wcmVwX2NtZCcsXHJcbiAgICAnZ2xvYmFsX3N0YXRlX2NtZCcsXHJcbiAgICAnc2VydmVyX2NtZCcsXHJcbiAgICAnZGRfcmVzb2x1dGlvbl9vcHRpb24nLFxyXG4gICAgJ2RkX21hbnVhbF9yZXNvbHV0aW9uJyxcclxuICAgICdkZF9tb2RlX3JlbWFwcGluZycsXHJcbiAgXSk7XHJcbiAgY29uc3QgbWFudWFsRGlydHkgPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IHNhdmluZ1N0YXRlID0gcmVmPCdpZGxlJyB8ICdkaXJ0eScgfCAnc2F2aW5nJyB8ICdzYXZlZCcgfCAnZXJyb3InPignaWRsZScpO1xyXG4gIGNvbnN0IGxvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG4gIGNvbnN0IGVycm9yID0gcmVmPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG4gIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHJlZjxzdHJpbmcgfCBudWxsPihudWxsKTtcclxuXHJcbiAgLy8gLS0tIEF1dG9zYXZlIChQQVRDSCkgcXVldWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gSG9sZHMgb25seSBub24tbWFudWFsIGNoYW5nZXMgc2luY2UgbGFzdCBmbHVzaC4gS2V5cyBhcmUgcmVwbGFjZWQgd2l0aFxyXG4gIC8vIHRoZSBtb3N0IHJlY2VudCB2YWx1ZS4gVmFsdWVzIGVxdWFsIHRvIGRlZmF1bHRzIGFyZSBjb252ZXJ0ZWQgdG8gbnVsbFxyXG4gIC8vIHNvIHRoZSBzZXJ2ZXIgcmVtb3ZlcyB0aGVtIHRvIGZhbGwgYmFjayB0byBkZWZhdWx0IGJlaGF2aW9yLlxyXG4gIGNvbnN0IHBhdGNoUXVldWUgPSByZWY8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KHt9KTtcclxuICBsZXQgZmx1c2hUaW1lcjogYW55ID0gbnVsbDsgLy8gb25lLXNob3QgdGltZXJcclxuICBsZXQgZmx1c2hJbkZsaWdodCA9IGZhbHNlO1xyXG4gIGNvbnN0IGF1dG9zYXZlSW50ZXJ2YWxNcyA9IDMwMDA7XHJcbiAgY29uc3QgbmV4dEZsdXNoQXQgPSByZWY8bnVtYmVyIHwgbnVsbD4obnVsbCk7IC8vIHdoZW4gdGhlIGN1cnJlbnQgdGltZXIgd2lsbCBmaXJlXHJcbiAgY29uc3QgbGFzdFNhdmVSZXN1bHQgPSByZWY8e1xyXG4gICAgYXBwbGllZE5vdz86IGJvb2xlYW47XHJcbiAgICBkZWZlcnJlZD86IGJvb2xlYW47XHJcbiAgICByZXN0YXJ0UmVxdWlyZWQ/OiBib29sZWFuO1xyXG4gIH0gfCBudWxsPihudWxsKTtcclxuXHJcbiAgZnVuY3Rpb24gYnVpbGRXcmFwcGVyKCk6IENvbmZpZ1N0YXRlIHtcclxuICAgIGNvbnN0IHRhcmdldCA9IHt9IGFzIENvbmZpZ1N0YXRlO1xyXG4gICAgLy8gdW5pb24gb2Yga2V5cyAoZGVmYXVsdHMgKyBjdXJyZW50IGRhdGEpXHJcbiAgICBjb25zdCBrZXlzID0gbmV3IFNldDxzdHJpbmc+KFtcclxuICAgICAgLi4uT2JqZWN0LmtleXMoZGVmYXVsdE1hcCksXHJcbiAgICAgIC4uLk9iamVjdC5rZXlzKF9kYXRhLnZhbHVlIHx8IHt9KSxcclxuICAgICAgLy8ga2VlcCBhbnkgc2VydmVyLW9ubHkgbWV0YWRhdGEga2V5cyBhbHJlYWR5IHByZXNlbnRcclxuICAgIF0pO1xyXG4gICAgaWYgKF9kYXRhLnZhbHVlKSB7XHJcbiAgICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhfZGF0YS52YWx1ZSkpIGtleXMuYWRkKGspO1xyXG4gICAgfVxyXG4gICAga2V5cy5mb3JFYWNoKChrKSA9PiB7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGssIHtcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBnZXQoKSB7XHJcbiAgICAgICAgICBjb25zdCBjdXJyZW50ID0gX2RhdGEudmFsdWU7XHJcbiAgICAgICAgICBpZiAoY3VycmVudCAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY3VycmVudCwgaykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRba107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBGb3Igb2JqZWN0cy9hcnJheXMgcmV0dXJuIGEgZnJlc2ggY2xvbmUgc28gYWNjaWRlbnRhbCBtdXRhdGlvblxyXG4gICAgICAgICAgLy8gZG9lcyBub3Qgc2lsZW50bHkgZGl2ZXJnZSBmcm9tIHBlcnNpc3RlbmNlLiBUbyBzdXBwb3J0IGluLXBsYWNlXHJcbiAgICAgICAgICAvLyBtdXRhdGlvbiAoZS5nLiBwdXNoKSB3ZSBsYXppbHkgbWF0ZXJpYWxpemUgb2JqZWN0L2FycmF5IGRlZmF1bHRzXHJcbiAgICAgICAgICAvLyBpbnRvIF9kYXRhIFdJVEhPVVQgYnVtcGluZyB2ZXJzaW9uIChub3QgYSB1c2VyIGNoYW5nZSB5ZXQpLlxyXG4gICAgICAgICAgaWYgKGhhc0RlZmF1bHRLZXkoaykpIHtcclxuICAgICAgICAgICAgY29uc3QgZHYgPSBkZWZhdWx0TWFwW2tdO1xyXG4gICAgICAgICAgICBpZiAoZHYgJiYgdHlwZW9mIGR2ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgIGlmICghX2RhdGEudmFsdWUpIF9kYXRhLnZhbHVlID0ge30gYXMgQ29uZmlnRGF0YTtcclxuICAgICAgICAgICAgICBjb25zdCBzdG9yZURhdGEgPSBfZGF0YS52YWx1ZTtcclxuICAgICAgICAgICAgICBpZiAoc3RvcmVEYXRhICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RvcmVEYXRhLCBrKSkge1xyXG4gICAgICAgICAgICAgICAgKHN0b3JlRGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilba10gPSBkZWVwQ2xvbmUoZHYpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gc3RvcmVEYXRhID8gc3RvcmVEYXRhW2tdIDogZHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGR2O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldCh2KSB7XHJcbiAgICAgICAgICBpZiAoIV9kYXRhLnZhbHVlKSBfZGF0YS52YWx1ZSA9IHt9IGFzIENvbmZpZ0RhdGE7XHJcbiAgICAgICAgICBjb25zdCBwcmV2ID0gX2RhdGEudmFsdWVba107XHJcbiAgICAgICAgICBpZiAoZGVlcEVxdWFsKHByZXYsIHYpKSByZXR1cm47IC8vIGlnbm9yZSBuby1vcFxyXG4gICAgICAgICAgX2RhdGEudmFsdWVba10gPSB2O1xyXG4gICAgICAgICAgLy8gSWYgdGhpcyBrZXkgcmVxdWlyZXMgbWFudWFsIHNhdmUsIGRvIG5vdCBidW1wIHZlcnNpb24gc29cclxuICAgICAgICAgIC8vIGF1dG9zYXZlIGxvZ2ljIHdvbid0IHRyaWdnZXI7IG1hcmsgbWFudWFsIGRpcnR5IGluc3RlYWRcclxuICAgICAgICAgIGlmIChtYW51YWxTYXZlS2V5cy5oYXMoaykpIHtcclxuICAgICAgICAgICAgbWFudWFsRGlydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9ICdkaXJ0eSc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2ZXJzaW9uLnZhbHVlKys7XHJcbiAgICAgICAgICAgIHNhdmluZ1N0YXRlLnZhbHVlID0gJ2RpcnR5JztcclxuICAgICAgICAgICAgLy8gcXVldWUgZm9yIHBhdGNoOiBzZW5kIG51bGwgd2hlbiB2YWx1ZSBtYXRjaGVzIGRlZmF1bHRcclxuICAgICAgICAgICAgbGV0IHRvU2VuZDogdW5rbm93biA9IHY7XHJcbiAgICAgICAgICAgIGlmIChoYXNEZWZhdWx0S2V5KGspICYmIGRlZXBFcXVhbCh2LCBkZWZhdWx0TWFwW2tdKSkge1xyXG4gICAgICAgICAgICAgIHRvU2VuZCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0Y2hRdWV1ZS52YWx1ZSA9IHsgLi4ucGF0Y2hRdWV1ZS52YWx1ZSwgW2tdOiB0b1NlbmQgfTtcclxuICAgICAgICAgICAgLy8gcmVzZXQgYXV0b3NhdmUgdGltZXIgdG8gZnVsbCBpbnRlcnZhbCBvbiBhbnkgcGVuZGluZyBjaGFuZ2VcclxuICAgICAgICAgICAgc2NoZWR1bGVBdXRvc2F2ZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICAvLyBWaXJ0dWFsLCByZWFkLW9ubHkgcGxhdGZvcm0gcHJvcGVydHkgc291cmNlZCBmcm9tIG1ldGFkYXRhXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCAncGxhdGZvcm0nLCB7XHJcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiBtZXRhZGF0YS52YWx1ZT8ucGxhdGZvcm0gfHwgJyc7XHJcbiAgICAgIH0sXHJcbiAgICAgIHNldChfdikge1xyXG4gICAgICAgIC8vIGlnbm9yZSB3cml0ZXM7IHBsYXRmb3JtIGlzIHNlcnZlci1wcm92aWRlZCBvbmx5XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXRDb25maWcob2JqOiB1bmtub3duKSB7XHJcbiAgICAvLyBjb25maWcgcGF5bG9hZCBzaG91bGQgbm90IGluY2x1ZGUgbWV0YWRhdGEgYW55bW9yZTsganVzdCBjbG9uZVxyXG4gICAgX2RhdGEudmFsdWUgPSAob2JqID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKSA6IHt9KSBhcyBDb25maWdEYXRhO1xyXG4gICAgY29uc3QgZGF0YSA9IF9kYXRhLnZhbHVlO1xyXG5cclxuICAgIC8vIGRlY29kZSBrbm93biBKU09OIHN0cmluZyBmaWVsZHNcclxuICAgIGNvbnN0IHNwZWNpYWxPcHRpb25zOiBBcnJheTxrZXlvZiBDb25maWdEZWZhdWx0cz4gPSBbXHJcbiAgICAgICdkZF9tb2RlX3JlbWFwcGluZycsXHJcbiAgICAgICdnbG9iYWxfcHJlcF9jbWQnLFxyXG4gICAgICAnZ2xvYmFsX3N0YXRlX2NtZCcsXHJcbiAgICAgICdzZXJ2ZXJfY21kJyxcclxuICAgIF07XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzcGVjaWFsT3B0aW9ucykge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZGF0YSAmJlxyXG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpICYmXHJcbiAgICAgICAgdHlwZW9mIGRhdGFba2V5XSA9PT0gJ3N0cmluZydcclxuICAgICAgKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGRhdGFba2V5XSA9IEpTT04ucGFyc2UoZGF0YVtrZXldIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDb2VyY2UgcHJpbWl0aXZlIHR5cGVzIGJhc2VkIG9uIGRlZmF1bHRzIHNvIFVJIHdpZGdldHMgbWF0Y2ggb3B0aW9ucy5cclxuICAgIC8vIFRoaXMgZml4ZXMgY2FzZXMgd2hlcmUgc2VydmVyIHJldHVybnMgbnVtZXJpYyBmaWVsZHMgYXMgc3RyaW5ncywgY2F1c2luZ1xyXG4gICAgLy8gc2VsZWN0cyB0byBzaG93IHJhdyB2YWx1ZXMgaW5zdGVhZCBvZiB0aGVpciBmcmllbmRseSBsYWJlbHMuXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkYXRhKSkge1xyXG4gICAgICAgIGlmICghaGFzRGVmYXVsdEtleShrZXkpKSBjb250aW51ZTtcclxuICAgICAgICBjb25zdCBkdiA9IGRlZmF1bHRNYXBba2V5XTtcclxuICAgICAgICBjb25zdCBjdXIgPSBkYXRhW2tleV07XHJcbiAgICAgICAgLy8gSWYgZGVmYXVsdCBpcyBhIG51bWJlciwgY29lcmNlIHN0cmluZyBudW1lcmljcyB0byBudW1iZXJzXHJcbiAgICAgICAgaWYgKHR5cGVvZiBkdiA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGN1ciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIoY3VyKTtcclxuICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobikpIHtcclxuICAgICAgICAgICAgZGF0YVtrZXldID0gbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBMZWdhY3k6IG5vcm1hbGl6ZSB2aXJ0dWFsIGRvdWJsZSByZWZyZXNoIGtleSB0byBTdW5zaGluZSBuYW1pbmcuXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdkb3VibGVfcmVmcmVzaHJhdGUnKSAmJlxyXG4gICAgICAgICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgJ2RkX3dhX3ZpcnR1YWxfZG91YmxlX3JlZnJlc2gnKVxyXG4gICAgICApIHtcclxuICAgICAgICAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbJ2RkX3dhX3ZpcnR1YWxfZG91YmxlX3JlZnJlc2gnXSA9IChcclxuICAgICAgICAgIGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cclxuICAgICAgICApWydkb3VibGVfcmVmcmVzaHJhdGUnXTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdkb3VibGVfcmVmcmVzaHJhdGUnKSkge1xyXG4gICAgICAgIGRlbGV0ZSAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbJ2RvdWJsZV9yZWZyZXNocmF0ZSddO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2VlcCBmcmFtZSBsaW1pdGVyIGxlZ2FjeSBhbmQgbmV3IGZsYWdzIGluIHN5bmMgc28gdG9nZ2xlcyB3b3JrIGFjcm9zcyB2ZXJzaW9ucy5cclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdmcmFtZV9saW1pdGVyX2VuYWJsZScpKSB7XHJcbiAgICAgICAgKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pWydmcmFtZV9saW1pdGVyX2VuYWJsZSddID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgJ2ZyYW1lX2xpbWl0ZXJfcHJvdmlkZXInKSkge1xyXG4gICAgICAgIChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVsnZnJhbWVfbGltaXRlcl9wcm92aWRlciddID0gJ2F1dG8nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGxlZ2FjeVZzeW5jID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdydHNzX2Rpc2FibGVfdnN5bmNfdWxsbScpO1xyXG4gICAgICBjb25zdCBoYXNOZXdWc3luYyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCAnZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jJyk7XHJcbiAgICAgIGlmIChsZWdhY3lWc3luYykge1xyXG4gICAgICAgIGlmICghaGFzTmV3VnN5bmMpIHtcclxuICAgICAgICAgIChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVsnZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jJ10gPSAoXHJcbiAgICAgICAgICAgIGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cclxuICAgICAgICAgIClbJ3J0c3NfZGlzYWJsZV92c3luY191bGxtJ107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbJ3J0c3NfZGlzYWJsZV92c3luY191bGxtJ107XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBOb3JtYWxpemUgUGxheW5pdGUgYm9vbGVhbi1saWtlIGZpZWxkcyB0byByZWFsIGJvb2xlYW5zIHNvIHRvZ2dsZXNcclxuICAgIC8vIHBlcnNpc3QgYXMgdHJ1ZS9mYWxzZSBpbnN0ZWFkIG9mIGVuYWJsZWQvZGlzYWJsZWQgc3RyaW5ncy5cclxuICAgIGNvbnN0IHBsYXluaXRlQm9vbEtleXMgPSBbXHJcbiAgICAgICdwbGF5bml0ZV9hdXRvX3N5bmMnLFxyXG4gICAgICAncGxheW5pdGVfc3luY19hbGxfaW5zdGFsbGVkJyxcclxuICAgICAgJ3BsYXluaXRlX2F1dG9zeW5jX3JlcXVpcmVfcmVwbGFjZW1lbnQnLFxyXG4gICAgICAncGxheW5pdGVfYXV0b3N5bmNfcmVtb3ZlX3VuaW5zdGFsbGVkJyxcclxuICAgICAgJ3BsYXluaXRlX2ZvY3VzX2V4aXRfb25fZmlyc3QnLFxyXG4gICAgICAncGxheW5pdGVfZnVsbHNjcmVlbl9lbnRyeV9lbmFibGVkJyxcclxuICAgIF07XHJcbiAgICAvLyBFeHRlbmQgYm9vbGVhbiBub3JtYWxpemF0aW9uIHRvIGNvdmVyIFJUU1MgZW5hYmxlIGZsYWdcclxuICAgIGNvbnN0IG90aGVyQm9vbEtleXMgPSBbXHJcbiAgICAgICdmcmFtZV9saW1pdGVyX2VuYWJsZScsXHJcbiAgICAgICdmcmFtZV9saW1pdGVyX2Rpc2FibGVfdnN5bmMnLFxyXG4gICAgICAnZGRfd2FfdmlydHVhbF9kb3VibGVfcmVmcmVzaCcsXHJcbiAgICAgICdkZF93YV9kdW1teV9wbHVnX2hkcjEwJyxcclxuICAgIF07XHJcbiAgICBjb25zdCBhbGxCb29sS2V5cyA9IHBsYXluaXRlQm9vbEtleXMuY29uY2F0KG90aGVyQm9vbEtleXMpO1xyXG4gICAgY29uc3QgdG9Cb29sID0gKHY6IGFueSk6IGJvb2xlYW4gfCBudWxsID0+IHtcclxuICAgICAgaWYgKHYgPT09IHRydWUgfHwgdiA9PT0gZmFsc2UpIHJldHVybiB2O1xyXG4gICAgICBpZiAodiA9PT0gMSB8fCB2ID09PSAwKSByZXR1cm4gISF2O1xyXG4gICAgICBjb25zdCBzID0gU3RyaW5nKHYgPz8gJycpXHJcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAudHJpbSgpO1xyXG4gICAgICBpZiAoIXMpIHJldHVybiBudWxsO1xyXG4gICAgICBpZiAoWyd0cnVlJywgJ3llcycsICdlbmFibGUnLCAnZW5hYmxlZCcsICdvbicsICcxJ10uaW5jbHVkZXMocykpIHJldHVybiB0cnVlO1xyXG4gICAgICBpZiAoWydmYWxzZScsICdubycsICdkaXNhYmxlJywgJ2Rpc2FibGVkJywgJ29mZicsICcwJ10uaW5jbHVkZXMocykpIHJldHVybiBmYWxzZTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgZm9yIChjb25zdCBrIG9mIGFsbEJvb2xLZXlzKSB7XHJcbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgaykpIGNvbnRpbnVlO1xyXG4gICAgICAgIGNvbnN0IGIgPSB0b0Jvb2woZGF0YVtrXSk7XHJcbiAgICAgICAgaWYgKGIgIT09IG51bGwpIHtcclxuICAgICAgICAgIGRhdGFba10gPSBiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhICYmIEJvb2xlYW4oKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pWydkZF93YV9kdW1teV9wbHVnX2hkcjEwJ10pKSB7XHJcbiAgICAgIChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVsnZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jJ10gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vcm1hbGl6ZSBQbGF5bml0ZSBjYXRlZ29yeS9leGNsdXNpb24gbGlzdHMgdG8gYXJyYXlzIG9mIHtpZCxuYW1lfVxyXG4gICAgY29uc3Qgbm9ybWFsaXplSWROYW1lQXJyYXkgPSAoXHJcbiAgICAgIHY6IGFueSxcclxuICAgICAgdHJlYXRTdHJpbmdzQXNJZHM6IGJvb2xlYW4sXHJcbiAgICApOiBBcnJheTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9PiA9PiB7XHJcbiAgICAgIGNvbnN0IG91dDogQXJyYXk8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfT4gPSBbXTtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIHYpIHtcclxuICAgICAgICAgIGlmIChlbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKChlbCBhcyBhbnkpLmlkIHx8ICcnKTtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IFN0cmluZygoZWwgYXMgYW55KS5uYW1lIHx8ICcnKTtcclxuICAgICAgICAgICAgaWYgKGlkIHx8IG5hbWUpIG91dC5wdXNoKHsgaWQsIG5hbWUgfSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgY29uc3QgcyA9IGVsLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKCFzKSBjb250aW51ZTtcclxuICAgICAgICAgICAgb3V0LnB1c2godHJlYXRTdHJpbmdzQXNJZHMgPyB7IGlkOiBzLCBuYW1lOiAnJyB9IDogeyBpZDogJycsIG5hbWU6IHMgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIFRyeSBKU09OIGZpcnN0XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uodik7XHJcbiAgICAgICAgICByZXR1cm4gbm9ybWFsaXplSWROYW1lQXJyYXkocGFyc2VkLCB0cmVhdFN0cmluZ3NBc0lkcyk7XHJcbiAgICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICAgIC8vIENTViBmYWxsYmFja1xyXG4gICAgICAgIGZvciAoY29uc3QgcyBvZiB2XHJcbiAgICAgICAgICAuc3BsaXQoJywnKVxyXG4gICAgICAgICAgLm1hcCgocykgPT4gcy50cmltKCkpXHJcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pKSB7XHJcbiAgICAgICAgICBvdXQucHVzaCh0cmVhdFN0cmluZ3NBc0lkcyA/IHsgaWQ6IHMsIG5hbWU6ICcnIH0gOiB7IGlkOiAnJywgbmFtZTogcyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG91dDtcclxuICAgIH07XHJcbiAgICBjb25zdCBub3JtYWxpemVTdHJpbmdBcnJheSA9ICh2OiBhbnkpOiBzdHJpbmdbXSA9PiB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSB7XHJcbiAgICAgICAgcmV0dXJuIHYubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSA/PyAnJykudHJpbSgpKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0ubGVuZ3RoID4gMCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIFRyeSBKU09OIGZpcnN0XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uodik7XHJcbiAgICAgICAgICByZXR1cm4gbm9ybWFsaXplU3RyaW5nQXJyYXkocGFyc2VkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdlxyXG4gICAgICAgICAgLnNwbGl0KCcsJylcclxuICAgICAgICAgIC5tYXAoKHMpID0+IHMudHJpbSgpKVxyXG4gICAgICAgICAgLmZpbHRlcigocykgPT4gcy5sZW5ndGggPiAwKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9O1xyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgY29uc3QgcmVjb3JkID0gZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZWNvcmQsICdwbGF5bml0ZV9zeW5jX2NhdGVnb3JpZXMnKSkge1xyXG4gICAgICAgIHJlY29yZFsncGxheW5pdGVfc3luY19jYXRlZ29yaWVzJ10gPSBub3JtYWxpemVJZE5hbWVBcnJheShcclxuICAgICAgICAgIHJlY29yZFsncGxheW5pdGVfc3luY19jYXRlZ29yaWVzJ10sXHJcbiAgICAgICAgICBmYWxzZSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVjb3JkLCAncGxheW5pdGVfc3luY19wbHVnaW5zJykpIHtcclxuICAgICAgICByZWNvcmRbJ3BsYXluaXRlX3N5bmNfcGx1Z2lucyddID0gbm9ybWFsaXplSWROYW1lQXJyYXkoXHJcbiAgICAgICAgICByZWNvcmRbJ3BsYXluaXRlX3N5bmNfcGx1Z2lucyddLFxyXG4gICAgICAgICAgdHJ1ZSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVjb3JkLCAncGxheW5pdGVfZXhjbHVkZV9jYXRlZ29yaWVzJykpIHtcclxuICAgICAgICByZWNvcmRbJ3BsYXluaXRlX2V4Y2x1ZGVfY2F0ZWdvcmllcyddID0gbm9ybWFsaXplSWROYW1lQXJyYXkoXHJcbiAgICAgICAgICByZWNvcmRbJ3BsYXluaXRlX2V4Y2x1ZGVfY2F0ZWdvcmllcyddLFxyXG4gICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlY29yZCwgJ3BsYXluaXRlX2V4Y2x1ZGVfZ2FtZXMnKSkge1xyXG4gICAgICAgIHJlY29yZFsncGxheW5pdGVfZXhjbHVkZV9nYW1lcyddID0gbm9ybWFsaXplSWROYW1lQXJyYXkoXHJcbiAgICAgICAgICByZWNvcmRbJ3BsYXluaXRlX2V4Y2x1ZGVfZ2FtZXMnXSxcclxuICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlY29yZCwgJ2RkX3NuYXBzaG90X2V4Y2x1ZGVfZGV2aWNlcycpKSB7XHJcbiAgICAgICAgcmVjb3JkWydkZF9zbmFwc2hvdF9leGNsdWRlX2RldmljZXMnXSA9IG5vcm1hbGl6ZVN0cmluZ0FycmF5KFxyXG4gICAgICAgICAgcmVjb3JkWydkZF9zbmFwc2hvdF9leGNsdWRlX2RldmljZXMnXSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlnLnZhbHVlID0gYnVpbGRXcmFwcGVyKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVPcHRpb248SyBleHRlbmRzIENvbmZpZ0tleT4oa2V5OiBLLCB2YWx1ZTogQ29uZmlnRGVmYXVsdHNbS10pOiB2b2lkO1xyXG4gIGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkO1xyXG4gIGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcclxuICAgIChjb25maWcudmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2tleV0gPSB2YWx1ZTsgLy8gdHJpZ2dlcnMgc2V0dGVyIChoYW5kbGVzIG1hbnVhbC9hdXRvKVxyXG4gIH1cclxuXHJcbiAgLy8gRXhwbGljaXRseSBtYXJrIGEgbWFudWFsLWRpcnR5IGNoYW5nZSAoZS5nLiwgd2hlbiBtdXRhdGluZyBuZXN0ZWQgZmllbGRzKVxyXG4gIGZ1bmN0aW9uIG1hcmtNYW51YWxEaXJ0eShfa2V5Pzogc3RyaW5nKSB7XHJcbiAgICBtYW51YWxEaXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9ICdkaXJ0eSc7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNldE1hbnVhbERpcnR5KCkge1xyXG4gICAgbWFudWFsRGlydHkudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTWFudWFsU2F2ZSgpOiB7IG9rOiB0cnVlIH0gfCB7IG9rOiBmYWxzZTsgbWVzc2FnZTogc3RyaW5nIH0ge1xyXG4gICAgaWYgKCFtYW51YWxEaXJ0eS52YWx1ZSkgcmV0dXJuIHsgb2s6IHRydWUgfTtcclxuICAgIGNvbnN0IGRhdGEgPSAoX2RhdGEudmFsdWUgPz8ge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG5cclxuICAgIGNvbnN0IHJlc29sdXRpb25PcHRpb25LZXkgPSAnZGRfcmVzb2x1dGlvbl9vcHRpb24nIGFzIGNvbnN0O1xyXG4gICAgY29uc3QgZGVmYXVsdFJlc29sdXRpb25PcHRpb24gPSBoYXNEZWZhdWx0S2V5KHJlc29sdXRpb25PcHRpb25LZXkpXHJcbiAgICAgID8gZGVmYXVsdE1hcFtyZXNvbHV0aW9uT3B0aW9uS2V5XVxyXG4gICAgICA6IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHJlc09wdCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCByZXNvbHV0aW9uT3B0aW9uS2V5KVxyXG4gICAgICA/IGRhdGFbcmVzb2x1dGlvbk9wdGlvbktleV1cclxuICAgICAgOiBkZWZhdWx0UmVzb2x1dGlvbk9wdGlvbjtcclxuICAgIGlmIChyZXNPcHQgPT09ICdtYW51YWwnKSB7XHJcbiAgICAgIGNvbnN0IG1hbnVhbFJlc29sdXRpb25LZXkgPSAnZGRfbWFudWFsX3Jlc29sdXRpb24nIGFzIGNvbnN0O1xyXG4gICAgICBjb25zdCByYXcgPSBTdHJpbmcoZGF0YVttYW51YWxSZXNvbHV0aW9uS2V5XSA/PyAnJykudHJpbSgpO1xyXG4gICAgICBjb25zdCByZXNvbHV0aW9uUGF0dGVybiA9IC9eXFxkezIsNX1cXHMqW3hYXVxccypcXGR7Miw1fSQvO1xyXG4gICAgICBpZiAoIXJlc29sdXRpb25QYXR0ZXJuLnRlc3QocmF3KSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBtYW51YWwgcmVzb2x1dGlvbi4gVXNlIFdJRFRIeEhFSUdIVCAoZS5nLiwgMjU2MHgxNDQwKS4nLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZWZyZXNoT3B0aW9uS2V5ID0gJ2RkX3JlZnJlc2hfcmF0ZV9vcHRpb24nIGFzIGNvbnN0O1xyXG4gICAgY29uc3QgZGVmYXVsdFJlZnJlc2hPcHRpb24gPSBoYXNEZWZhdWx0S2V5KHJlZnJlc2hPcHRpb25LZXkpXHJcbiAgICAgID8gZGVmYXVsdE1hcFtyZWZyZXNoT3B0aW9uS2V5XVxyXG4gICAgICA6IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHJyT3B0ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIHJlZnJlc2hPcHRpb25LZXkpXHJcbiAgICAgID8gZGF0YVtyZWZyZXNoT3B0aW9uS2V5XVxyXG4gICAgICA6IGRlZmF1bHRSZWZyZXNoT3B0aW9uO1xyXG4gICAgaWYgKHJyT3B0ID09PSAnbWFudWFsJykge1xyXG4gICAgICBjb25zdCBtYW51YWxSZWZyZXNoS2V5ID0gJ2RkX21hbnVhbF9yZWZyZXNoX3JhdGUnIGFzIGNvbnN0O1xyXG4gICAgICBjb25zdCByYXcgPSBTdHJpbmcoZGF0YVttYW51YWxSZWZyZXNoS2V5XSA/PyAnJykudHJpbSgpO1xyXG4gICAgICBjb25zdCB2YWxpZCA9IC9eXFxkKyg/OlxcLlxcZCspPyQvLnRlc3QocmF3KSAmJiBOdW1iZXIocmF3KSA+IDA7XHJcbiAgICAgIGlmICghdmFsaWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbWFudWFsIHJlZnJlc2ggcmF0ZS4gVXNlIGEgcG9zaXRpdmUgbnVtYmVyLCBlLmcuLCA2MCBvciA1OS45NC4nLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZW1hcCA9IGRhdGFbJ2RkX21vZGVfcmVtYXBwaW5nJ107XHJcbiAgICBpZiAocmVtYXAgJiYgdHlwZW9mIHJlbWFwID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBjb25zdCByZW1hcE9iaiA9IHJlbWFwIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgICBjb25zdCByZXNvbHV0aW9uUGF0dGVybiA9IC9eXFxkezIsNX1cXHMqW3hYXVxccypcXGR7Miw1fSQvO1xyXG4gICAgICBjb25zdCBjaGVja1Jlc29sdXRpb24gPSAodmFsdWU6IHVua25vd24pID0+XHJcbiAgICAgICAgIXZhbHVlIHx8IFN0cmluZyh2YWx1ZSkudHJpbSgpID09PSAnJyB8fCByZXNvbHV0aW9uUGF0dGVybi50ZXN0KFN0cmluZyh2YWx1ZSkpO1xyXG4gICAgICBjb25zdCBjaGVja051bWJlciA9ICh2YWx1ZTogdW5rbm93bikgPT5cclxuICAgICAgICAhdmFsdWUgfHxcclxuICAgICAgICBTdHJpbmcodmFsdWUpLnRyaW0oKSA9PT0gJycgfHxcclxuICAgICAgICAoL15cXGQrKD86XFwuXFxkKyk/JC8udGVzdChTdHJpbmcodmFsdWUpKSAmJiBOdW1iZXIodmFsdWUpID4gMCk7XHJcblxyXG4gICAgICBjb25zdCByZXNvbHV0aW9uQnVja2V0cyA9IFsnbWl4ZWQnLCAncmVzb2x1dGlvbl9vbmx5J10gYXMgY29uc3Q7XHJcbiAgICAgIGZvciAoY29uc3QgYnVja2V0IG9mIHJlc29sdXRpb25CdWNrZXRzKSB7XHJcbiAgICAgICAgY29uc3QgZW50cmllcyA9IEFycmF5LmlzQXJyYXkocmVtYXBPYmpbYnVja2V0XSkgPyAocmVtYXBPYmpbYnVja2V0XSBhcyB1bmtub3duW10pIDogW107XHJcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICBjb25zdCBpdGVtID0gZW50cnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICFjaGVja1Jlc29sdXRpb24oaXRlbT8uWydyZXF1ZXN0ZWRfcmVzb2x1dGlvbiddKSB8fFxyXG4gICAgICAgICAgICAhY2hlY2tSZXNvbHV0aW9uKGl0ZW0/LlsnZmluYWxfcmVzb2x1dGlvbiddKVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAgICAgICAnSW52YWxpZCByZXNvbHV0aW9uIGluIERpc3BsYXkgbW9kZSByZW1hcHBpbmcuIFVzZSBXSURUSHhIRUlHSFQgKGUuZy4sIDE5MjB4MTA4MCkgb3IgbGVhdmUgYmxhbmsuJyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlZnJlc2hPbmx5ID0gQXJyYXkuaXNBcnJheShyZW1hcE9ialsncmVmcmVzaF9yYXRlX29ubHknXSlcclxuICAgICAgICA/IChyZW1hcE9ialsncmVmcmVzaF9yYXRlX29ubHknXSBhcyB1bmtub3duW10pXHJcbiAgICAgICAgOiBbXTtcclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWZyZXNoT25seSkge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBlbnRyeSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICAgICAgICBpZiAoIWNoZWNrTnVtYmVyKGl0ZW0/LlsncmVxdWVzdGVkX2ZwcyddKSB8fCAhY2hlY2tOdW1iZXIoaXRlbT8uWydmaW5hbF9yZWZyZXNoX3JhdGUnXSkpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9rOiBmYWxzZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVmcmVzaCByYXRlIGluIHJlbWFwcGluZy4gVXNlIGEgcG9zaXRpdmUgbnVtYmVyIG9yIGxlYXZlIGJsYW5rLicsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaW5hbFJhdGUgPSBpdGVtPy5bJ2ZpbmFsX3JlZnJlc2hfcmF0ZSddO1xyXG4gICAgICAgIGlmICghZmluYWxSYXRlIHx8IFN0cmluZyhmaW5hbFJhdGUpLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9rOiBmYWxzZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ0ZvciByZWZyZXNoLXJhdGUtb25seSBtYXBwaW5ncywgRmluYWwgcmVmcmVzaCByYXRlIGlzIHJlcXVpcmVkLicsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWl4ZWQgPSBBcnJheS5pc0FycmF5KHJlbWFwT2JqWydtaXhlZCddKSA/IChyZW1hcE9ialsnbWl4ZWQnXSBhcyB1bmtub3duW10pIDogW107XHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbWl4ZWQpIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gZW50cnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgICAgICAgaWYgKCFjaGVja051bWJlcihpdGVtPy5bJ3JlcXVlc3RlZF9mcHMnXSkgfHwgIWNoZWNrTnVtYmVyKGl0ZW0/LlsnZmluYWxfcmVmcmVzaF9yYXRlJ10pKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlZnJlc2ggcmF0ZSBpbiByZW1hcHBpbmcuIFVzZSBhIHBvc2l0aXZlIG51bWJlciBvciBsZWF2ZSBibGFuay4nLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZmluYWxSZXMgPSBpdGVtPy5bJ2ZpbmFsX3Jlc29sdXRpb24nXTtcclxuICAgICAgICBjb25zdCBmaW5hbEZwcyA9IGl0ZW0/LlsnZmluYWxfcmVmcmVzaF9yYXRlJ107XHJcbiAgICAgICAgY29uc3QgaGFzRmluYWxSZXMgPSAhIWZpbmFsUmVzICYmIFN0cmluZyhmaW5hbFJlcykudHJpbSgpICE9PSAnJztcclxuICAgICAgICBjb25zdCBoYXNGaW5hbEZwcyA9ICEhZmluYWxGcHMgJiYgU3RyaW5nKGZpbmFsRnBzKS50cmltKCkgIT09ICcnO1xyXG4gICAgICAgIGlmICghaGFzRmluYWxSZXMgJiYgIWhhc0ZpbmFsRnBzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdGb3IgbWl4ZWQgbWFwcGluZ3MsIHNwZWNpZnkgYXQgbGVhc3Qgb25lIEZpbmFsIGZpZWxkLicsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVzb2x1dGlvbk9ubHkgPSBBcnJheS5pc0FycmF5KHJlbWFwT2JqWydyZXNvbHV0aW9uX29ubHknXSlcclxuICAgICAgICA/IChyZW1hcE9ialsncmVzb2x1dGlvbl9vbmx5J10gYXMgdW5rbm93bltdKVxyXG4gICAgICAgIDogW107XHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVzb2x1dGlvbk9ubHkpIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gZW50cnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgICAgICAgY29uc3QgZmluYWxSZXMgPSBpdGVtPy5bJ2ZpbmFsX3Jlc29sdXRpb24nXTtcclxuICAgICAgICBpZiAoIWZpbmFsUmVzIHx8IFN0cmluZyhmaW5hbFJlcykudHJpbSgpID09PSAnJykge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnRm9yIHJlc29sdXRpb24tb25seSBtYXBwaW5ncywgRmluYWwgcmVzb2x1dGlvbiBpcyByZXF1aXJlZC4nLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geyBvazogdHJ1ZSB9O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2F2ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFZhbGlkYXRlIG1hbnVhbC1zYXZlIGZpZWxkcyBiZWZvcmUgYXR0ZW1wdGluZyB0byBwZXJzaXN0XHJcbiAgICAgIGNvbnN0IHYgPSB2YWxpZGF0ZU1hbnVhbFNhdmUoKTtcclxuICAgICAgaWYgKCF2Lm9rKSB7XHJcbiAgICAgICAgdmFsaWRhdGlvbkVycm9yLnZhbHVlID0gdi5tZXNzYWdlIHx8ICdWYWxpZGF0aW9uIGZhaWxlZCBmb3IgcGVuZGluZyBjaGFuZ2VzLic7XHJcbiAgICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnZXJyb3InO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAvLyBGaXJzdCBmbHVzaCBhbnkgcGVuZGluZyBQQVRDSCBjaGFuZ2VzIGZvciBhdXRvLXNhdmVkIGtleXNcclxuICAgICAgaWYgKE9iamVjdC5rZXlzKHBhdGNoUXVldWUudmFsdWUpLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnN0IG9rID0gYXdhaXQgZmx1c2hQYXRjaFF1ZXVlKCk7XHJcbiAgICAgICAgaWYgKCFvaykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHNhdmluZ1N0YXRlLnZhbHVlID0gJ3NhdmluZyc7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSBzZXJpYWxpemUoKTtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaHR0cC5wb3N0KCcvYXBpL2NvbmZpZycsIGJvZHkgfHwge30sIHtcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgbGFzdFNhdmVSZXN1bHQudmFsdWUgPSB7XHJcbiAgICAgICAgICAgIGFwcGxpZWROb3c6ICEhKHJlcyBhcyBhbnkpPy5kYXRhPy5hcHBsaWVkTm93LFxyXG4gICAgICAgICAgICBkZWZlcnJlZDogISEocmVzIGFzIGFueSk/LmRhdGE/LmRlZmVycmVkLFxyXG4gICAgICAgICAgICByZXN0YXJ0UmVxdWlyZWQ6ICEhKHJlcyBhcyBhbnkpPy5kYXRhPy5yZXN0YXJ0UmVxdWlyZWQsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2gge31cclxuICAgICAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9ICdzYXZlZCc7XHJcbiAgICAgICAgbWFudWFsRGlydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB2YWxpZGF0aW9uRXJyb3IudmFsdWUgPSBudWxsO1xyXG4gICAgICAgIC8vIFJlc2V0IHRvIGlkbGUgYWZ0ZXIgYSBzaG9ydCBkZWxheSBpZiBubyBuZXcgY2hhbmdlc1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHNhdmluZ1N0YXRlLnZhbHVlID09PSAnc2F2ZWQnICYmICFtYW51YWxEaXJ0eS52YWx1ZSkge1xyXG4gICAgICAgICAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9ICdpZGxlJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9ICdlcnJvcic7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnZXJyb3InO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXJpYWxpemUoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsIHtcclxuICAgIGlmICghX2RhdGEudmFsdWUpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoX2RhdGEudmFsdWUpKTtcclxuICAgIC8vIHBydW5lIGRlZmF1bHRzICh2YWx1ZSBleGFjdGx5IGVxdWFscyBkZWZhdWx0KVxyXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKG91dCkpIHtcclxuICAgICAgaWYgKGhhc0RlZmF1bHRLZXkoaykgJiYgZGVlcEVxdWFsKG91dFtrXSwgZGVmYXVsdE1hcFtrXSkpIGRlbGV0ZSBvdXRba107XHJcbiAgICB9XHJcbiAgICAvLyBuZXZlciBwZXJzaXN0IHZpcnR1YWwga2V5c1xyXG4gICAgZGVsZXRlIG91dFsncGxhdGZvcm0nXTtcclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBmZXRjaENvbmZpZyhmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICBpZiAoX2RhdGEudmFsdWUgJiYgIWZvcmNlKSByZXR1cm4gY29uZmlnLnZhbHVlO1xyXG4gICAgbG9hZGluZy52YWx1ZSA9IHRydWU7XHJcbiAgICBlcnJvci52YWx1ZSA9IG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvY29uZmlnJyk7XHJcbiAgICAgIGlmIChyLnN0YXR1cyAhPT0gMjAwKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBzdGF0dXMgJyArIHIuc3RhdHVzKTtcclxuICAgICAgLy8gRmV0Y2ggbWV0YWRhdGEgKG5vbi1mYXRhbCBpZiBpdCBmYWlscylcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBtciA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL21ldGFkYXRhJyk7XHJcbiAgICAgICAgaWYgKG1yLnN0YXR1cyA9PT0gMjAwICYmIG1yLmRhdGEpIHtcclxuICAgICAgICAgIGNvbnN0IG0gPSB7IC4uLm1yLmRhdGEgfSBhcyBNZXRhSW5mbztcclxuICAgICAgICAgIC8vIE5vcm1hbGl6ZSBwbGF0Zm9ybSBpZGVudGlmaWVycyBhY3Jvc3MgYnVpbGQvcnVudGltZSB2YXJpYXRpb25zXHJcbiAgICAgICAgICBjb25zdCByYXcgPSBTdHJpbmcoKG0gYXMgYW55KS5wbGF0Zm9ybSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGxldCBub3JtID0gcmF3O1xyXG4gICAgICAgICAgaWYgKHJhdy5zdGFydHNXaXRoKCd3aW4nKSkgbm9ybSA9ICd3aW5kb3dzJztcclxuICAgICAgICAgIGVsc2UgaWYgKHJhdyA9PT0gJ2RhcndpbicgfHwgcmF3LnN0YXJ0c1dpdGgoJ21hYycpKSBub3JtID0gJ21hY29zJztcclxuICAgICAgICAgIGVsc2UgaWYgKHJhdy5zdGFydHNXaXRoKCdsaW4nKSkgbm9ybSA9ICdsaW51eCc7XHJcbiAgICAgICAgICAobSBhcyBhbnkpLnBsYXRmb3JtID0gbm9ybTtcclxuICAgICAgICAgIG1ldGFkYXRhLnZhbHVlID0gbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKF8pIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG4gICAgICAvLyBrZWVwIHNldHRpbmdzIGFuZCBtZXRhZGF0YSBzZXBhcmF0ZVxyXG4gICAgICBzZXRDb25maWcoci5kYXRhKTtcclxuICAgICAgcmV0dXJuIGNvbmZpZy52YWx1ZTtcclxuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdmZXRjaENvbmZpZyBmYWlsZWQnLCBlKTtcclxuICAgICAgZXJyb3IudmFsdWUgPSBlPy5tZXNzYWdlIHx8ICdmZXRjaCBmYWlsZWQnO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGxvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGZsdXNoUGF0Y2hRdWV1ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGlmIChmbHVzaEluRmxpZ2h0KSByZXR1cm4gdHJ1ZTtcclxuICAgIGNvbnN0IHBheWxvYWQgPSBwYXRjaFF1ZXVlLnZhbHVlO1xyXG4gICAgaWYgKCFwYXlsb2FkIHx8IE9iamVjdC5rZXlzKHBheWxvYWQpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRydWU7XHJcbiAgICAvLyBDbGVhciBxdWV1ZSBpbW1lZGlhdGVseSAod2UnbGwgbWVyZ2UgYW55IG5ldyBjaGFuZ2VzIG9uIHRvcCBpZiByZXF1ZXN0IGZhaWxzKVxyXG4gICAgcGF0Y2hRdWV1ZS52YWx1ZSA9IHt9O1xyXG4gICAgZmx1c2hJbkZsaWdodCA9IHRydWU7XHJcbiAgICAvLyBDbGVhciBhbnkgc2NoZWR1bGVkIHRpbWVyIHNpbmNlIHdlJ3JlIGZsdXNoaW5nIG5vd1xyXG4gICAgaWYgKGZsdXNoVGltZXIpIGNsZWFyVGltZW91dChmbHVzaFRpbWVyKTtcclxuICAgIGZsdXNoVGltZXIgPSBudWxsO1xyXG4gICAgbmV4dEZsdXNoQXQudmFsdWUgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnc2F2aW5nJztcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaHR0cC5wYXRjaCgnL2FwaS9jb25maWcnLCBwYXlsb2FkLCB7XHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGxhc3RTYXZlUmVzdWx0LnZhbHVlID0ge1xyXG4gICAgICAgICAgICBhcHBsaWVkTm93OiAhIShyZXMgYXMgYW55KT8uZGF0YT8uYXBwbGllZE5vdyxcclxuICAgICAgICAgICAgZGVmZXJyZWQ6ICEhKHJlcyBhcyBhbnkpPy5kYXRhPy5kZWZlcnJlZCxcclxuICAgICAgICAgICAgcmVzdGFydFJlcXVpcmVkOiAhIShyZXMgYXMgYW55KT8uZGF0YT8ucmVzdGFydFJlcXVpcmVkLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnc2F2ZWQnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBzYXZpbmdTdGF0ZS52YWx1ZSA9PT0gJ3NhdmVkJyAmJlxyXG4gICAgICAgICAgICAhbWFudWFsRGlydHkudmFsdWUgJiZcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGF0Y2hRdWV1ZS52YWx1ZSkubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnaWRsZSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgc2F2aW5nU3RhdGUudmFsdWUgPSAnZXJyb3InO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHNhdmluZ1N0YXRlLnZhbHVlID0gJ2Vycm9yJztcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgZmx1c2hJbkZsaWdodCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRBdXRvc2F2ZSgpIHtcclxuICAgIC8vIG5vLW9wOyBhdXRvc2F2ZSB1c2VzIGEgZGVib3VuY2VkIG9uZS1zaG90IHRpbWVyIHZpYSBzY2hlZHVsZUF1dG9zYXZlKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0b3BBdXRvc2F2ZSgpIHtcclxuICAgIGlmIChmbHVzaFRpbWVyKSBjbGVhclRpbWVvdXQoZmx1c2hUaW1lcik7XHJcbiAgICBmbHVzaFRpbWVyID0gbnVsbDtcclxuICAgIG5leHRGbHVzaEF0LnZhbHVlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHJlbG9hZENvbmZpZygpIHtcclxuICAgIF9kYXRhLnZhbHVlID0gbnVsbDtcclxuICAgIHJldHVybiBhd2FpdCBmZXRjaENvbmZpZyh0cnVlKTtcclxuICB9XHJcblxyXG4gIC8vIFN0YXJ0IGF1dG9zYXZlIHF1ZXVlIHdhdGNoZXIgYnkgZGVmYXVsdFxyXG4gIHN0YXJ0QXV0b3NhdmUoKTtcclxuXHJcbiAgZnVuY3Rpb24gaGFzUGVuZGluZ1BhdGNoKCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhdGNoUXVldWUudmFsdWUpLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIG5leHRBdXRvc2F2ZUF0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gbmV4dEZsdXNoQXQudmFsdWUgfHwgMDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNjaGVkdWxlQXV0b3NhdmUoKSB7XHJcbiAgICBpZiAoZmx1c2hUaW1lcikgY2xlYXJUaW1lb3V0KGZsdXNoVGltZXIpO1xyXG4gICAgbmV4dEZsdXNoQXQudmFsdWUgPSBEYXRlLm5vdygpICsgYXV0b3NhdmVJbnRlcnZhbE1zO1xyXG4gICAgZmx1c2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBuZXh0Rmx1c2hBdC52YWx1ZSA9IG51bGw7XHJcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwYXRjaFF1ZXVlLnZhbHVlKS5sZW5ndGggPT09IDApIHJldHVybjtcclxuICAgICAgdm9pZCBmbHVzaFBhdGNoUXVldWUoKTtcclxuICAgIH0sIGF1dG9zYXZlSW50ZXJ2YWxNcyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgLy8gc3RhdGVcclxuICAgIHRhYnMsXHJcbiAgICBkZWZhdWx0czogZGVmYXVsdE1hcCxcclxuICAgIGNvbmZpZzogY29uZmlnIGFzIHVua25vd24gYXMgQ29uZmlnU3RhdGUsIC8vIGV4cG9zZWQgYXMgdmFsdWUgZm9yIGRpcmVjdCB1c2FnZVxyXG4gICAgdmVyc2lvbiwgLy8gaW5jcmVtZW50cyBvbmx5IG9uIHVzZXIgbXV0YXRpb25cclxuICAgIG1hbnVhbERpcnR5LFxyXG4gICAgc2F2aW5nU3RhdGUsXHJcbiAgICBtZXRhZGF0YSxcclxuICAgIGxvYWRpbmcsXHJcbiAgICBlcnJvcixcclxuICAgIHZhbGlkYXRpb25FcnJvcixcclxuICAgIGZldGNoQ29uZmlnLFxyXG4gICAgc2V0Q29uZmlnLFxyXG4gICAgdXBkYXRlT3B0aW9uLFxyXG4gICAgbWFya01hbnVhbERpcnR5LFxyXG4gICAgcmVzZXRNYW51YWxEaXJ0eSxcclxuICAgIHNhdmUsXHJcbiAgICBzZXJpYWxpemUsXHJcbiAgICAvLyBxdWV1ZS9hdXRvc2F2ZSB1dGlsc1xyXG4gICAgZmx1c2hQYXRjaFF1ZXVlLFxyXG4gICAgc3RhcnRBdXRvc2F2ZSxcclxuICAgIHN0b3BBdXRvc2F2ZSxcclxuICAgIHJlbG9hZENvbmZpZyxcclxuICAgIGhhc1BlbmRpbmdQYXRjaCxcclxuICAgIGF1dG9zYXZlSW50ZXJ2YWxNcyxcclxuICAgIG5leHRBdXRvc2F2ZUF0LFxyXG4gICAgbGFzdFNhdmVSZXN1bHQsXHJcbiAgfTtcclxufSk7XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8bi1idXR0b25cclxuICAgIHYtaWY9XCJ2aXNpYmxlXCJcclxuICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgIHN0cm9uZ1xyXG4gICAgc2l6ZT1cInNtYWxsXCJcclxuICAgIGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC14cyBzZWxlY3Qtbm9uZSBuLWJ1dHRvbi0tbGlua2lzaFwiXHJcbiAgICA6Y2xhc3M9XCJ7ICdjdXJzb3ItcG9pbnRlcic6IGNhblNhdmUgfVwiXHJcbiAgICA6dGl0bGU9XCJ0b29sdGlwXCJcclxuICAgIEBjbGljaz1cIm9uQ2xpY2tcIlxyXG4gID5cclxuICAgIDxpIDpjbGFzcz1cImljb25DbGFzc1wiIC8+XHJcbiAgICA8c3BhbiBjbGFzcz1cIm9wYWNpdHktODBcIj57eyBsYWJlbCB9fTwvc3Bhbj5cclxuICA8L24tYnV0dG9uPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgb25Vbm1vdW50ZWQsIHJlZiB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZVJvdXRlIH0gZnJvbSAndnVlLXJvdXRlcic7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCB7IE5CdXR0b24sIHVzZU1lc3NhZ2UgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5cclxuY29uc3Qgcm91dGUgPSB1c2VSb3V0ZSgpO1xyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IHsgc2F2aW5nU3RhdGUsIG1hbnVhbERpcnR5LCB2YWxpZGF0aW9uRXJyb3IgfSA9IHN0b3JlVG9SZWZzKHN0b3JlKTtcclxuY29uc3QgbWVzc2FnZSA9IHVzZU1lc3NhZ2UoKTtcclxuY29uc3QgaGFzUGVuZGluZyA9IGNvbXB1dGVkKCgpID0+IHN0b3JlLmhhc1BlbmRpbmdQYXRjaCgpKTtcclxuY29uc3QgcmVzdGFydFJlcXVpcmVkID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gISEoc3RvcmUubGFzdFNhdmVSZXN1bHQgJiYgc3RvcmUubGFzdFNhdmVSZXN1bHQucmVzdGFydFJlcXVpcmVkKSxcclxuKTtcclxuY29uc3QgaW50ZXJ2YWxNcyA9IGNvbXB1dGVkKCgpID0+IHN0b3JlLmF1dG9zYXZlSW50ZXJ2YWxNcyB8fCAzMDAwKTtcclxuY29uc3Qgbm93TXMgPSByZWYoRGF0ZS5ub3coKSk7XHJcbmNvbnN0IG5leHRBdCA9IGNvbXB1dGVkKCgpID0+IHN0b3JlLm5leHRBdXRvc2F2ZUF0KCkpO1xyXG5jb25zdCBjb3VudGRvd24gPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFoYXNQZW5kaW5nLnZhbHVlKSByZXR1cm4gMDtcclxuICBjb25zdCBtcyA9IE1hdGgubWF4KDAsIG5leHRBdC52YWx1ZSAtIG5vd01zLnZhbHVlKTtcclxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gMTAwMCk7XHJcbn0pO1xyXG5cclxubGV0IHRpbWVyOiBhbnkgPSBudWxsO1xyXG5vbk1vdW50ZWQoKCkgPT4ge1xyXG4gIHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4gKG5vd01zLnZhbHVlID0gRGF0ZS5ub3coKSksIDI1MCk7XHJcbn0pO1xyXG5vblVubW91bnRlZCgoKSA9PiB7XHJcbiAgaWYgKHRpbWVyKSBjbGVhckludGVydmFsKHRpbWVyKTtcclxufSk7XHJcblxyXG5jb25zdCB2aXNpYmxlID0gY29tcHV0ZWQoKCkgPT4gcm91dGUucGF0aCA9PT0gJy9zZXR0aW5ncycpO1xyXG5jb25zdCBjYW5TYXZlID0gY29tcHV0ZWQoXHJcbiAgKCkgPT5cclxuICAgIHZpc2libGUudmFsdWUgJiZcclxuICAgIChzYXZpbmdTdGF0ZS52YWx1ZSA9PT0gJ2Vycm9yJyB8fFxyXG4gICAgICBtYW51YWxEaXJ0eS52YWx1ZSA9PT0gdHJ1ZSB8fFxyXG4gICAgICBoYXNQZW5kaW5nLnZhbHVlID09PSB0cnVlIHx8XHJcbiAgICAgIChzYXZpbmdTdGF0ZS52YWx1ZSA9PT0gJ3NhdmVkJyAmJiByZXN0YXJ0UmVxdWlyZWQudmFsdWUgPT09IHRydWUpKSxcclxuKTtcclxuXHJcbmNvbnN0IGxhYmVsID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChoYXNQZW5kaW5nLnZhbHVlKSB7XHJcbiAgICByZXR1cm4gYEF1dG8tc2F2ZSBpbiAke2NvdW50ZG93bi52YWx1ZX1zIChUYXAgdG8gU2F2ZSBOb3cpYDtcclxuICB9XHJcbiAgc3dpdGNoIChzYXZpbmdTdGF0ZS52YWx1ZSkge1xyXG4gICAgY2FzZSAnc2F2aW5nJzpcclxuICAgICAgcmV0dXJuICdTYXZlIFN0YXR1czogU2F2aW5n4oCmJztcclxuICAgIGNhc2UgJ2RpcnR5JzpcclxuICAgICAgcmV0dXJuIG1hbnVhbERpcnR5LnZhbHVlXHJcbiAgICAgICAgPyAnU2F2ZSBTdGF0dXM6IFVuc2F2ZWQgQ2hhbmdlcyAoQ2xpY2sgdG8gU2F2ZSknXHJcbiAgICAgICAgOiAnU2F2ZSBTdGF0dXM6IFVuc2F2ZWQgQ2hhbmdlcyc7XHJcbiAgICBjYXNlICdzYXZlZCc6XHJcbiAgICAgIHJldHVybiByZXN0YXJ0UmVxdWlyZWQudmFsdWVcclxuICAgICAgICA/ICdTYXZlIFN0YXR1czogU2F2ZWQ7IFJlc3RhcnQgUmVxdWlyZWQgKFRhcCB0byBBcHBseSknXHJcbiAgICAgICAgOiAnU2F2ZSBTdGF0dXM6IFNhdmVkJztcclxuICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgcmV0dXJuICdTYXZlIFN0YXR1czogRXJyb3IgKFRhcCB0byBSZXRyeSknO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdTYXZlIFN0YXR1czogV2FpdGluZyBmb3IgQ2hhbmdlcyc7XHJcbiAgfVxyXG59KTtcclxuXHJcbmNvbnN0IGljb25DbGFzcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBiYXNlID0gJ2ZhcyB0ZXh0LXhzJztcclxuICBpZiAoaGFzUGVuZGluZy52YWx1ZSkgcmV0dXJuIGJhc2UgKyAnIGZhLWNsb2NrIHRleHQtd2FybmluZyc7XHJcbiAgc3dpdGNoIChzYXZpbmdTdGF0ZS52YWx1ZSkge1xyXG4gICAgY2FzZSAnc2F2aW5nJzpcclxuICAgICAgcmV0dXJuIGJhc2UgKyAnIGZhLXNwaW5uZXIgYW5pbWF0ZS1zcGluIG9wYWNpdHktODAnO1xyXG4gICAgY2FzZSAnZGlydHknOlxyXG4gICAgICByZXR1cm4gYmFzZSArICcgZmEtY2lyY2xlLWV4Y2xhbWF0aW9uIHRleHQtd2FybmluZyc7XHJcbiAgICBjYXNlICdzYXZlZCc6XHJcbiAgICAgIHJldHVybiByZXN0YXJ0UmVxdWlyZWQudmFsdWVcclxuICAgICAgICA/IGJhc2UgKyAnIGZhLXBvd2VyLW9mZiB0ZXh0LXNlY29uZGFyeSdcclxuICAgICAgICA6IGJhc2UgKyAnIGZhLWNoZWNrIHRleHQtc3VjY2Vzcyc7XHJcbiAgICBjYXNlICdlcnJvcic6XHJcbiAgICAgIHJldHVybiBiYXNlICsgJyBmYS10cmlhbmdsZS1leGNsYW1hdGlvbiB0ZXh0LWRhbmdlcic7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gYmFzZSArICcgZmEtY2lyY2xlIG9wYWNpdHktNjAgcHVsc2Utc29mdCc7XHJcbiAgfVxyXG59KTtcclxuXHJcbmNvbnN0IHRvb2x0aXAgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKHNhdmluZ1N0YXRlLnZhbHVlID09PSAnZXJyb3InICYmIHZhbGlkYXRpb25FcnJvci52YWx1ZSkgcmV0dXJuIHZhbGlkYXRpb25FcnJvci52YWx1ZTtcclxuICBpZiAoaGFzUGVuZGluZy52YWx1ZSlcclxuICAgIHJldHVybiBgQXV0by1zYXZlIGZsdXNoZXMgZXZlcnkgJHtNYXRoLnJvdW5kKGludGVydmFsTXMudmFsdWUgLyAxMDAwKX1zLiBUYXAgdG8gc2F2ZSBub3cuYDtcclxuICBpZiAocmVzdGFydFJlcXVpcmVkLnZhbHVlKVxyXG4gICAgcmV0dXJuICdTYXZlZDsgUmVzdGFydCByZXF1aXJlZCB0byBhcHBseSBydW50aW1lIGNoYW5nZXMuIFRhcCB0byBhcHBseSBub3cuJztcclxuICByZXR1cm4gJ1RoaXMgcGFnZSBhdXRvLXNhdmVzIG1vc3QgY2hhbmdlcyBhcyB5b3UgZWRpdC4gU29tZSBmaWVsZHMgbWF5IHJlcXVpcmUgY2xpY2tpbmcgU2F2ZS4nO1xyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG9uQ2xpY2soKSB7XHJcbiAgaWYgKCFjYW5TYXZlLnZhbHVlKSByZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGlmIChyZXN0YXJ0UmVxdWlyZWQudmFsdWUgJiYgc2F2aW5nU3RhdGUudmFsdWUgPT09ICdzYXZlZCcpIHtcclxuICAgICAgYXdhaXQgaHR0cC5wb3N0KFxyXG4gICAgICAgICcvYXBpL3Jlc3RhcnQnLFxyXG4gICAgICAgIHt9LFxyXG4gICAgICAgIHsgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0sXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChoYXNQZW5kaW5nLnZhbHVlKSB7XHJcbiAgICAgIGNvbnN0IG9rID0gYXdhaXQgc3RvcmUuZmx1c2hQYXRjaFF1ZXVlKCk7XHJcbiAgICAgIGlmICghb2spIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgbWVzc2FnZS5lcnJvcih2YWxpZGF0aW9uRXJyb3IudmFsdWUgfHwgJ1NhdmUgZmFpbGVkLiBDaGVjayBmaWVsZHMgZm9yIGVycm9ycy4nLCB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiA1MDAwLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG9rID0gYXdhaXQgc3RvcmUuc2F2ZSgpO1xyXG4gICAgaWYgKCFvaykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG1lc3NhZ2UuZXJyb3IodmFsaWRhdGlvbkVycm9yLnZhbHVlIHx8ICdTYXZlIGZhaWxlZC4gQ2hlY2sgZmllbGRzIGZvciBlcnJvcnMuJywge1xyXG4gICAgICAgICAgZHVyYXRpb246IDUwMDAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gY2F0Y2gge31cclxuICAgIH1cclxuICB9IGNhdGNoIHt9XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG5Aa2V5ZnJhbWVzIHB1bHNlU29mdCB7XHJcbiAgMCUsXHJcbiAgMTAwJSB7XHJcbiAgICBvcGFjaXR5OiAwLjU1O1xyXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcclxuICB9XHJcbiAgNTAlIHtcclxuICAgIG9wYWNpdHk6IDAuOTtcclxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wNik7XHJcbiAgfVxyXG59XHJcbi5wdWxzZS1zb2Z0IHtcclxuICBhbmltYXRpb246IHB1bHNlU29mdCAxLjZzIGVhc2UtaW4tb3V0IGluZmluaXRlO1xyXG59XHJcbjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IHJlZiwgb25Nb3VudGVkLCBjb21wdXRlZCwgaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCB7IE5Ecm9wZG93biwgTkJ1dHRvbiB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuaW1wb3J0IHtcclxuICBsb2FkQXV0b1RoZW1lLFxyXG4gIHNldHVwVGhlbWVUb2dnbGVMaXN0ZW5lcixcclxuICBnZXRQcmVmZXJyZWRUaGVtZSxcclxuICBzZXRTdG9yZWRUaGVtZSxcclxuICBzZXRUaGVtZSxcclxufSBmcm9tICdAL3RoZW1lJztcclxuXHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5cclxuY29uc3Qgb3BlbiA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGN1cnJlbnQgPSByZWYoJ2F1dG8nKTtcclxuXHJcbmNvbnN0IG9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAge1xyXG4gICAga2V5OiAnbGlnaHQnLFxyXG4gICAgbGFiZWw6IHQoJ25hdmJhci50aGVtZV9saWdodCcpLFxyXG4gICAgaWNvbjogKCkgPT4gaChMdWNpZGVJY29uLCB7IG5hbWU6ICdmYS1zdW4nLCBzaXplOiAxNCB9KSxcclxuICB9LFxyXG4gIHsga2V5OiAnZGFyaycsIGxhYmVsOiB0KCduYXZiYXIudGhlbWVfZGFyaycpLCBpY29uOiAoKSA9PiBoKEx1Y2lkZUljb24sIHsgbmFtZTogJ2ZhLW1vb24nLCBzaXplOiAxNCB9KSB9LFxyXG4gIHtcclxuICAgIGtleTogJ2F1dG8nLFxyXG4gICAgbGFiZWw6IHQoJ25hdmJhci50aGVtZV9hdXRvJyksXHJcbiAgICBpY29uOiAoKSA9PiBoKEx1Y2lkZUljb24sIHsgbmFtZTogJ2ZhLWNpcmNsZS1oYWxmLXN0cm9rZScsIHNpemU6IDE0IH0pLFxyXG4gIH0sXHJcbl0pO1xyXG5cclxuY29uc3QgYWN0aXZlSWNvbiA9IGNvbXB1dGVkKCgpID0+IHtcbiAgY29uc3QgbTogUmVjb3JkPFRoZW1lS2V5LCBzdHJpbmc+ID0ge1xuICAgIGxpZ2h0OiAnZmEtc3VuJyxcbiAgICBkYXJrOiAnZmEtbW9vbicsXG4gICAgYXV0bzogJ2ZhLWNpcmNsZS1oYWxmLXN0cm9rZScsXG4gIH07XG4gIHJldHVybiBjdXJyZW50LnZhbHVlID09PSAnbGlnaHQnIHx8IGN1cnJlbnQudmFsdWUgPT09ICdkYXJrJyA/IG1bY3VycmVudC52YWx1ZV0gOiBtLmF1dG87XG59KTtcblxyXG50eXBlIFRoZW1lS2V5ID0gJ2xpZ2h0JyB8ICdkYXJrJyB8ICdhdXRvJztcclxuXHJcbmludGVyZmFjZSBUaGVtZU9wdGlvbiB7XHJcbiAga2V5OiBUaGVtZUtleTtcclxuICBsYWJlbDogc3RyaW5nO1xyXG4gIGljb246ICgpID0+IFJldHVyblR5cGU8dHlwZW9mIGg+O1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblNlbGVjdChrZXk6IHN0cmluZyB8IG51bWJlcik6IHZvaWQge1xyXG4gIGNvbnN0IHYgPSBTdHJpbmcoa2V5KSBhcyBUaGVtZUtleTtcclxuICBzZXRTdG9yZWRUaGVtZSh2KTtcclxuICBzZXRUaGVtZSh2KTtcclxuICBjdXJyZW50LnZhbHVlID0gdjtcclxuICBvcGVuLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuXHJcbm9uTW91bnRlZCgoKSA9PiB7XHJcbiAgbG9hZEF1dG9UaGVtZSgpO1xyXG4gIHNldHVwVGhlbWVUb2dnbGVMaXN0ZW5lcigpO1xyXG4gIGN1cnJlbnQudmFsdWUgPSBnZXRQcmVmZXJyZWRUaGVtZSgpO1xyXG59KTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPG4tZHJvcGRvd24gdHJpZ2dlcj1cImNsaWNrXCIgOm9wdGlvbnM9XCJvcHRpb25zXCIgQHNlbGVjdD1cIm9uU2VsZWN0XCI+XHJcbiAgICA8bi1idXR0b25cclxuICAgICAgdGVydGlhcnlcclxuICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBiZy10cmFuc3BhcmVudCBib3JkZXItMCBzaGFkb3ctbm9uZSBob3ZlcjpiZy10cmFuc3BhcmVudCBmb2N1czpvdXRsaW5lLW5vbmVcIlxyXG4gICAgPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cInRoZW1lLWljb24tYWN0aXZlXCI+PEx1Y2lkZUljb24gOm5hbWU9XCJhY3RpdmVJY29uXCIgOnNpemU9XCIxNFwiIC8+PC9zcGFuPlxyXG4gICAgICA8c3Bhbj57eyAkdCgnbmF2YmFyLnRvZ2dsZV90aGVtZScpIH19PC9zcGFuPlxyXG4gICAgPC9uLWJ1dHRvbj5cclxuICA8L24tZHJvcGRvd24+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjx0ZW1wbGF0ZT5cbiAgPGFzaWRlIDpjbGFzcz1cImRlc2t0b3BBc2lkZUNsYXNzXCI+XG4gICAgPCEtLSBIZWFkZXI6IGxvZ28gKyBjb2xsYXBzZSB0b2dnbGUgLS0+XG4gICAgPGRpdiBjbGFzcz1cIm1iLTYgZmxleCBpdGVtcy1jZW50ZXJcIiA6Y2xhc3M9XCJzaWRlYmFyQ29sbGFwc2VkID8gJ2ZsZXgtY29sIGdhcC0zIHB4LTAnIDogJ3B4LTInXCI+XG4gICAgICA8Um91dGVyTGlua1xuICAgICAgICB0bz1cIi9cIlxuICAgICAgICBjbGFzcz1cImZsZXggbWluLXctMCBmbGV4LTEgaXRlbXMtY2VudGVyIGdhcC0zXCJcbiAgICAgICAgOmNsYXNzPVwic2lkZWJhckNvbGxhcHNlZCA/ICdqdXN0aWZ5LWNlbnRlciBmbGV4LW5vbmUnIDogJydcIlxuICAgICAgPlxuICAgICAgICA8aW1nIHNyYz1cIi9pbWFnZXMvbG9nby1hcG9sbG8tNDUucG5nXCIgYWx0PVwiSnVqby5TdHJlYW0gU2VydmVyXCIgY2xhc3M9XCJoLTkgdy05IHNocmluay0wXCIgLz5cbiAgICAgICAgPGRpdiB2LWlmPVwiIXNpZGViYXJDb2xsYXBzZWRcIiBjbGFzcz1cIm1pbi13LTBcIj5cbiAgICAgICAgICA8cCBjbGFzcz1cInRydW5jYXRlIHRleHQtc20gZm9udC1zZW1pYm9sZCBsZWFkaW5nLXRpZ2h0XCI+SnVqby5TdHJlYW08L3A+XG4gICAgICAgICAgPHAgY2xhc3M9XCJ0cnVuY2F0ZSB0ZXh0LXhzIHRleHQtZGFyay82MCBkYXJrOnRleHQtbGlnaHQvNjBcIj5TZXJ2ZXIgQ29uc29sZTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1JvdXRlckxpbms+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzcz1cImZsZXggaC04IHctOCBzaHJpbmstMCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcm91bmRlZC1tZCB0ZXh0LWRhcmsvNTAgdHJhbnNpdGlvbi1jb2xvcnMgaG92ZXI6YmctZGFyay84IGhvdmVyOnRleHQtZGFyayBkYXJrOnRleHQtbGlnaHQvNTAgZGFyazpob3ZlcjpiZy1saWdodC8xMCBkYXJrOmhvdmVyOnRleHQtbGlnaHRcIlxuICAgICAgICA6YXJpYS1sYWJlbD1cInNpZGViYXJDb2xsYXBzZWQgPyAnRXhwYW5kIHNpZGViYXInIDogJ0NvbGxhcHNlIHNpZGViYXInXCJcbiAgICAgICAgQGNsaWNrPVwic2lkZWJhckNvbGxhcHNlZCA9ICFzaWRlYmFyQ29sbGFwc2VkXCJcbiAgICAgID5cbiAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJzaWRlYmFyQ29sbGFwc2VkID8gJ2ZhLWNoZXZyb24tcmlnaHQnIDogJ2ZhLWJhcnMnXCIgOnNpemU9XCIxNVwiIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cblxuICAgIDxuYXYgY2xhc3M9XCJzcGFjZS15LTFcIiBhcmlhLWxhYmVsPVwiUHJpbWFyeSBuYXZpZ2F0aW9uXCI+XG4gICAgICA8Um91dGVyTGlua1xuICAgICAgICB2LWZvcj1cIml0ZW0gaW4gbmF2SXRlbXNcIlxuICAgICAgICA6a2V5PVwiaXRlbS5wYXRoXCJcbiAgICAgICAgOnRvPVwiaXRlbS5wYXRoXCJcbiAgICAgICAgOmNsYXNzPVwibGlua0NsYXNzKGl0ZW0ucGF0aClcIlxuICAgICAgICB2LWJpbmQ9XCJzaWRlYmFyQ29sbGFwc2VkID8geyB0aXRsZTogaXRlbS5sYWJlbCB9IDoge31cIlxuICAgICAgPlxuICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cIml0ZW0uaWNvblwiIDpzaXplPVwiMTdcIiAvPlxuICAgICAgICA8c3BhbiB2LWlmPVwiIXNpZGViYXJDb2xsYXBzZWRcIj57eyBpdGVtLmxhYmVsIH19PC9zcGFuPlxuICAgICAgPC9Sb3V0ZXJMaW5rPlxuICAgIDwvbmF2PlxuXG4gICAgPGRpdlxuICAgICAgY2xhc3M9XCJtdC1hdXRvIGJvcmRlci10IGJvcmRlci1kYXJrLzEwIHB0LTQgZGFyazpib3JkZXItbGlnaHQvMTBcIlxuICAgICAgOmNsYXNzPVwic2lkZWJhckNvbGxhcHNlZCA/ICdzcGFjZS15LTInIDogJ3NwYWNlLXktMydcIlxuICAgID5cbiAgICAgIDxkaXYgdi1pZj1cIiFzaWRlYmFyQ29sbGFwc2VkXCIgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtMlwiPlxuICAgICAgICA8U2F2aW5nU3RhdHVzIC8+XG4gICAgICAgIDxUaGVtZVRvZ2dsZSAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cImZsZXgganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIDpjbGFzcz1cImxvZ291dEJ0bkNsYXNzXCJcbiAgICAgICAgdi1iaW5kPVwic2lkZWJhckNvbGxhcHNlZCA/IHsgdGl0bGU6IHQoJ25hdmJhci5sb2dvdXQnKSB9IDoge31cIlxuICAgICAgICBAY2xpY2s9XCIkZW1pdCgnbG9nb3V0JylcIlxuICAgICAgPlxuICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtc2lnbi1vdXQtYWx0XCIgOnNpemU9XCIxN1wiIC8+XG4gICAgICAgIDxzcGFuIHYtaWY9XCIhc2lkZWJhckNvbGxhcHNlZFwiPnt7IHQoJ25hdmJhci5sb2dvdXQnKSB9fTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2FzaWRlPlxuXG4gIDxoZWFkZXJcbiAgICBjbGFzcz1cInN0aWNreSB0b3AtMCB6LTQwIGZsZXggaC0xNCBpdGVtcy1jZW50ZXIgZ2FwLTMgYm9yZGVyLWIgYm9yZGVyLWRhcmsvMTAgYmctbGlnaHQvOTAgcHgtNCBiYWNrZHJvcC1ibHVyIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGRhcms6YmctZGFyay85MCBsZzpoaWRkZW5cIlxuICA+XG4gICAgPG4tYnV0dG9uIHF1YXRlcm5hcnkgY2lyY2xlIGFyaWEtbGFiZWw9XCJPcGVuIG5hdmlnYXRpb25cIiBAY2xpY2s9XCJtb2JpbGVPcGVuID0gdHJ1ZVwiPlxuICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWJhcnNcIiA6c2l6ZT1cIjE5XCIgLz5cbiAgICA8L24tYnV0dG9uPlxuICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIGZsZXgtMVwiPlxuICAgICAgPHAgY2xhc3M9XCJ0cnVuY2F0ZSB0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIj57eyBjdXJyZW50TGFiZWwgfX08L3A+XG4gICAgPC9kaXY+XG4gICAgPFNhdmluZ1N0YXR1cyAvPlxuICAgIDxUaGVtZVRvZ2dsZSAvPlxuICA8L2hlYWRlcj5cblxuICA8bi1kcmF3ZXIgdi1tb2RlbDpzaG93PVwibW9iaWxlT3BlblwiIHBsYWNlbWVudD1cImxlZnRcIiA6d2lkdGg9XCIzMDRcIj5cbiAgICA8bi1kcmF3ZXItY29udGVudCBib2R5LWNvbnRlbnQtc3R5bGU9XCJwYWRkaW5nOiAwO1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImZsZXggbWluLWgtZnVsbCBmbGV4LWNvbCBiZy1zdXJmYWNlIHB4LTMgcHktNCBkYXJrOmJnLXN1cmZhY2VcIj5cbiAgICAgICAgPFJvdXRlckxpbmsgdG89XCIvXCIgY2xhc3M9XCJtYi01IGZsZXggbWluLXctMCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMlwiIEBjbGljaz1cIm1vYmlsZU9wZW4gPSBmYWxzZVwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiL2ltYWdlcy9sb2dvLWFwb2xsby00NS5wbmdcIiBhbHQ9XCJKdWpvLlN0cmVhbSBTZXJ2ZXJcIiBjbGFzcz1cImgtOSB3LTlcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wXCI+XG4gICAgICAgICAgICA8cCBjbGFzcz1cInRydW5jYXRlIHRleHQtc20gZm9udC1zZW1pYm9sZCBsZWFkaW5nLXRpZ2h0XCI+SnVqby5TdHJlYW08L3A+XG4gICAgICAgICAgICA8cCBjbGFzcz1cInRydW5jYXRlIHRleHQteHMgdGV4dC1kYXJrLzYwIGRhcms6dGV4dC1saWdodC82MFwiPlNlcnZlciBDb25zb2xlPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1JvdXRlckxpbms+XG4gICAgICAgIDxuYXYgY2xhc3M9XCJzcGFjZS15LTFcIiBhcmlhLWxhYmVsPVwiUHJpbWFyeSBuYXZpZ2F0aW9uXCI+XG4gICAgICAgICAgPFJvdXRlckxpbmtcbiAgICAgICAgICAgIHYtZm9yPVwiaXRlbSBpbiBuYXZJdGVtc1wiXG4gICAgICAgICAgICA6a2V5PVwiaXRlbS5wYXRoXCJcbiAgICAgICAgICAgIDp0bz1cIml0ZW0ucGF0aFwiXG4gICAgICAgICAgICA6Y2xhc3M9XCJsaW5rQ2xhc3MoaXRlbS5wYXRoKVwiXG4gICAgICAgICAgICBAY2xpY2s9XCJtb2JpbGVPcGVuID0gZmFsc2VcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxMdWNpZGVJY29uIDpuYW1lPVwiaXRlbS5pY29uXCIgOnNpemU9XCIxN1wiIC8+XG4gICAgICAgICAgICA8c3Bhbj57eyBpdGVtLmxhYmVsIH19PC9zcGFuPlxuICAgICAgICAgIDwvUm91dGVyTGluaz5cbiAgICAgICAgPC9uYXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXQtYXV0b1wiIDpjbGFzcz1cImJhc2VMaW5rQ2xhc3MgKyAnIHctZnVsbCB0ZXh0LWRhcmsvNzAgaG92ZXI6YmctZGFyay81IGhvdmVyOnRleHQtZGFyayBkYXJrOnRleHQtbGlnaHQvNzAgZGFyazpob3ZlcjpiZy1saWdodC8xMCBkYXJrOmhvdmVyOnRleHQtbGlnaHQnXCIgQGNsaWNrPVwibG9nb3V0RnJvbURyYXdlclwiPlxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zaWduLW91dC1hbHRcIiA6c2l6ZT1cIjE3XCIgLz5cbiAgICAgICAgICA8c3Bhbj57eyB0KCduYXZiYXIubG9nb3V0JykgfX08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9uLWRyYXdlci1jb250ZW50PlxuICA8L24tZHJhd2VyPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cbmltcG9ydCB7IGNvbXB1dGVkLCByZWYgfSBmcm9tICd2dWUnO1xuaW1wb3J0IHsgUm91dGVyTGluaywgdXNlUm91dGUgfSBmcm9tICd2dWUtcm91dGVyJztcbmltcG9ydCB7IE5CdXR0b24sIE5EcmF3ZXIsIE5EcmF3ZXJDb250ZW50IH0gZnJvbSAnbmFpdmUtdWknO1xuaW1wb3J0IHsgdXNlSTE4biB9IGZyb20gJ3Z1ZS1pMThuJztcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XG5pbXBvcnQgU2F2aW5nU3RhdHVzIGZyb20gJ0AvY29tcG9uZW50cy9TYXZpbmdTdGF0dXMudnVlJztcbmltcG9ydCBUaGVtZVRvZ2dsZSBmcm9tICdAL1RoZW1lVG9nZ2xlLnZ1ZSc7XG5cbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0czx7XG4gIGxvZ291dDogW107XG59PigpO1xuXG5jb25zdCByb3V0ZSA9IHVzZVJvdXRlKCk7XG5jb25zdCB7IHQgfSA9IHVzZUkxOG4oKTtcbmNvbnN0IG1vYmlsZU9wZW4gPSByZWYoZmFsc2UpO1xuY29uc3Qgc2lkZWJhckNvbGxhcHNlZCA9IHJlZihmYWxzZSk7XG5cbmNvbnN0IGRlc2t0b3BBc2lkZUNsYXNzID0gY29tcHV0ZWQoKCkgPT4gW1xuICAnaGlkZGVuIGgtc2NyZWVuIHNocmluay0wIGJvcmRlci1yIGJvcmRlci1kYXJrLzEwIGJnLXN1cmZhY2UvOTAgcHktNCBkYXJrOmJvcmRlci1saWdodC8xMCBkYXJrOmJnLXN1cmZhY2UvOTUgbGc6ZmxleCBsZzpmbGV4LWNvbCB0cmFuc2l0aW9uLVt3aWR0aF0gZHVyYXRpb24tMjAwIG92ZXJmbG93LWhpZGRlbicsXG4gIHNpZGViYXJDb2xsYXBzZWQudmFsdWUgPyAndy0xNCBweC0yJyA6ICd3LTY0IHB4LTMnLFxuXSk7XG5cbmNvbnN0IG5hdkl0ZW1zID0gY29tcHV0ZWQoKCkgPT4gW1xuICB7IHBhdGg6ICcvJywgbGFiZWw6ICdIb21lJywgaWNvbjogJ2ZhLWdhdWdlJyB9LFxuICB7IHBhdGg6ICcvcGFpcmluZycsIGxhYmVsOiAnUGFpcmluZycsIGljb246ICdmYS1saW5rJyB9LFxuICB7IHBhdGg6ICcvbGlicmFyeScsIGxhYmVsOiAnTGlicmFyeScsIGljb246ICdmYS1nYW1lcGFkJyB9LFxuICB7IHBhdGg6ICcvZ2FtZS1zb3VyY2VzJywgbGFiZWw6ICdHYW1lIFNvdXJjZXMnLCBpY29uOiAnZmEtcGx1ZycgfSxcbiAgeyBwYXRoOiAnL2NsaWVudHMnLCBsYWJlbDogdCgnY2xpZW50cy5uYXYnKSwgaWNvbjogJ2ZhLXVzZXJzLWNvZycgfSxcbiAgeyBwYXRoOiAnL3N5c3RlbScsIGxhYmVsOiAnU3lzdGVtJywgaWNvbjogJ2ZhLXN0ZXRob3Njb3BlJyB9LFxuICB7IHBhdGg6ICcvc2V0dGluZ3MnLCBsYWJlbDogdCgnbmF2YmFyLmNvbmZpZ3VyYXRpb24nKSwgaWNvbjogJ2ZhLXNsaWRlcnMnIH0sXG5dKTtcblxuY29uc3QgY3VycmVudExhYmVsID0gY29tcHV0ZWQoKCkgPT4ge1xuICBjb25zdCBjdXJyZW50ID0gbmF2SXRlbXMudmFsdWUuZmluZCgoaXRlbSkgPT4gaXNBY3RpdmUoaXRlbS5wYXRoKSk7XG4gIHJldHVybiBjdXJyZW50Py5sYWJlbCB8fCAnSnVqby5TdHJlYW0gU2VydmVyJztcbn0pO1xuXG5jb25zdCBiYXNlTGlua0NsYXNzID1cbiAgJ2ZsZXggbWluLWgtMTEgaXRlbXMtY2VudGVyIGdhcC0zIHJvdW5kZWQtbWQgcHgtMyB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tY29sb3JzJztcbmNvbnN0IGJhc2VMaW5rQ29sbGFwc2VkQ2xhc3MgPVxuICAnZmxleCBtaW4taC0xMSBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcm91bmRlZC1tZCB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tY29sb3JzJztcbmNvbnN0IGxvZ291dEJ0bkNsYXNzID0gY29tcHV0ZWQoKCkgPT5cbiAgKHNpZGViYXJDb2xsYXBzZWQudmFsdWUgPyBiYXNlTGlua0NvbGxhcHNlZENsYXNzIDogYmFzZUxpbmtDbGFzcykgK1xuICAnIHctZnVsbCB0ZXh0LWRhcmsvNzAgaG92ZXI6YmctZGFyay81IGhvdmVyOnRleHQtZGFyayBkYXJrOnRleHQtbGlnaHQvNzAgZGFyazpob3ZlcjpiZy1saWdodC8xMCBkYXJrOmhvdmVyOnRleHQtbGlnaHQnLFxuKTtcblxuZnVuY3Rpb24gaXNBY3RpdmUocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChwYXRoID09PSAnLycpIHJldHVybiByb3V0ZS5wYXRoID09PSAnLyc7XG4gIHJldHVybiByb3V0ZS5wYXRoID09PSBwYXRoIHx8IHJvdXRlLnBhdGguc3RhcnRzV2l0aChwYXRoICsgJy8nKTtcbn1cblxuZnVuY3Rpb24gbGlua0NsYXNzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJhc2UgPSBzaWRlYmFyQ29sbGFwc2VkLnZhbHVlID8gYmFzZUxpbmtDb2xsYXBzZWRDbGFzcyA6IGJhc2VMaW5rQ2xhc3M7XG4gIGlmIChpc0FjdGl2ZShwYXRoKSkge1xuICAgIHJldHVybiAoXG4gICAgICBiYXNlICsgJyBiZy1wcmltYXJ5LzEyIHRleHQtcHJpbWFyeSBzaGFkb3ctW2luc2V0XzNweF8wXzBfcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKV0nXG4gICAgKTtcbiAgfVxuICByZXR1cm4gKFxuICAgIGJhc2UgK1xuICAgICcgdGV4dC1kYXJrLzcwIGhvdmVyOmJnLWRhcmsvNSBob3Zlcjp0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0LzcwIGRhcms6aG92ZXI6YmctbGlnaHQvMTAgZGFyazpob3Zlcjp0ZXh0LWxpZ2h0J1xuICApO1xufVxuXG5mdW5jdGlvbiBsb2dvdXRGcm9tRHJhd2VyKCk6IHZvaWQge1xuICBtb2JpbGVPcGVuLnZhbHVlID0gZmFsc2U7XG4gIGVtaXQoJ2xvZ291dCcpO1xufVxuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxuLWNvbmZpZy1wcm92aWRlciA6dGhlbWU9XCJpc0RhcmsgPyBkYXJrVGhlbWUgOiBudWxsXCIgOnRoZW1lLW92ZXJyaWRlcz1cIm5haXZlT3ZlcnJpZGVzXCI+XG4gICAgPG4tbG9hZGluZy1iYXItcHJvdmlkZXI+XG4gICAgICA8bi1kaWFsb2ctcHJvdmlkZXI+XG4gICAgICAgIDxuLW5vdGlmaWNhdGlvbi1wcm92aWRlcj5cbiAgICAgICAgICA8bi1tZXNzYWdlLXByb3ZpZGVyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1pbi1oLXNjcmVlbiBiZy1saWdodCB0ZXh0LWRhcmsgZGFyazpiZy1kYXJrIGRhcms6dGV4dC1saWdodCBsZzpmbGV4XCI+XG4gICAgICAgICAgICAgIDxPcGVyYXRpb25hbFNpZGViYXIgQGxvZ291dD1cImxvZ291dFwiIC8+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggbWluLXctMCBmbGV4LTEgZmxleC1jb2xcIj5cbiAgICAgICAgICAgICAgICA8IS0tIENvbnRlbnQ6IHNpbmdsZSBzaGFyZWQgY29udGFpbmVyIGFyb3VuZCBSb3V0ZXJWaWV3OyB3aWR0aCB2aWEgcm91dGUgbWV0YSAtLT5cbiAgICAgICAgICAgICAgICA8bWFpbiBjbGFzcz1cImZsZXgtMSBvdmVyZmxvdy1hdXRvXCI+XG4gICAgICAgICAgICAgICAgICA8Um91dGVyVmlldyB2LXNsb3Q9XCJ7IENvbXBvbmVudCwgcm91dGU6IHIgfVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IDpjbGFzcz1cImNvbnRhaW5lckNsYXNzKHIpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPFRyYW5zaXRpb24gbmFtZT1cImZhZGUtZmFzdFwiIG1vZGU9XCJvdXQtaW5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxjb21wb25lbnQgOmlzPVwiQ29tcG9uZW50XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L1RyYW5zaXRpb24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9Sb3V0ZXJWaWV3PlxuICAgICAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPCEtLSBJbW1lZGlhdGUgYmFja2dyb3VuZCBmb3IgbG9naW4gbW9kYWwgKG5vIHRyYW5zaXRpb24gZGVsYXkpIC0tPlxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJsb2dpbk92ZXJsYXlcIiBjbGFzcz1cImZpeGVkIGluc2V0LTAgei1bMTEwXSBwb2ludGVyLWV2ZW50cy1ub25lXCI+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLWdyYWRpZW50LXRvLWJyIGZyb20td2hpdGUvOTUgdmlhLXdoaXRlLzkyIHRvLXdoaXRlLzk1IGRhcms6ZnJvbS1ibGFjay85NSBkYXJrOnZpYS1ibGFjay85MiBkYXJrOnRvLWJsYWNrLzk1IGJhY2tkcm9wLWJsdXItbWRcIlxuICAgICAgICAgICAgICAgID48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxMb2dpbk1vZGFsIC8+XG4gICAgICAgICAgICAgIDxPZmZsaW5lT3ZlcmxheSAvPlxuICAgICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZS1mYXN0XCI+XG4gICAgICAgICAgICAgICAgPGRpdiB2LWlmPVwibG9nZ2VkT3V0XCIgY2xhc3M9XCJmaXhlZCBpbnNldC0wIHotWzEyMF0gZmxleCBmbGV4LWNvbFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImFic29sdXRlIGluc2V0LTAgYmctZ3JhZGllbnQtdG8tYnIgZnJvbS13aGl0ZS83MCB2aWEtd2hpdGUvNjAgdG8td2hpdGUvNzAgZGFyazpmcm9tLWJsYWNrLzcwIGRhcms6dmlhLWJsYWNrLzYwIGRhcms6dG8tYmxhY2svNzAgYmFja2Ryb3AtYmx1ci1tZFwiXG4gICAgICAgICAgICAgICAgICA+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicmVsYXRpdmUgZmxleC0xIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNiBvdmVyZmxvdy15LWF1dG9cIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIG1heC13LW1kIG14LWF1dG8gdGV4dC1jZW50ZXIgc3BhY2UteS02XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjPVwiL2ltYWdlcy9sb2dvLWFwb2xsby00NS5wbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PVwiVmliZXBvbGxvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaC0yNCB3LTI0IG9wYWNpdHktODAgbXgtYXV0byBzZWxlY3Qtbm9uZVwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LXNlbWlib2xkIHRyYWNraW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdhdXRoLmxvZ291dF9zdWNjZXNzJykgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQtc20gb3BhY2l0eS04MCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3sgJHQoJ2F1dGgubG9nb3V0X3JlZnJlc2hfaGludCcpIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB0LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwicHJpbWFyeVwiIEBjbGljaz1cInJlZnJlc2hQYWdlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdhdXRoLmxvZ291dF9yZWZyZXNoX2J1dHRvbicpIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1yb3RhdGVcIiA6c2l6ZT1cIjE2XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtdC04IHRleHQteHMgb3BhY2l0eS02MCBzZWxlY3Qtbm9uZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVmliZXBvbGxvXG4gICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RyYW5zaXRpb24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L24tbWVzc2FnZS1wcm92aWRlcj5cbiAgICAgICAgPC9uLW5vdGlmaWNhdGlvbi1wcm92aWRlcj5cbiAgICAgIDwvbi1kaWFsb2ctcHJvdmlkZXI+XG4gICAgPC9uLWxvYWRpbmctYmFyLXByb3ZpZGVyPlxuICA8L24tY29uZmlnLXByb3ZpZGVyPlxuPC90ZW1wbGF0ZT5cbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XG5pbXBvcnQgeyByZWYsIHdhdGNoLCBjb21wdXRlZCB9IGZyb20gJ3Z1ZSc7XG5pbXBvcnQge1xuICBOQ29uZmlnUHJvdmlkZXIsXG4gIE5EaWFsb2dQcm92aWRlcixcbiAgTk1lc3NhZ2VQcm92aWRlcixcbiAgTk5vdGlmaWNhdGlvblByb3ZpZGVyLFxuICBOTG9hZGluZ0JhclByb3ZpZGVyLFxuICBkYXJrVGhlbWUsXG59IGZyb20gJ25haXZlLXVpJztcbmltcG9ydCB7IHVzZU5haXZlVGhlbWVPdmVycmlkZXMsIHVzZURhcmtNb2RlQ2xhc3NSZWYgfSBmcm9tICdAL25haXZlLXRoZW1lJztcbmltcG9ydCB7IHVzZVJvdXRlIH0gZnJvbSAndnVlLXJvdXRlcic7XG5pbXBvcnQgTG9naW5Nb2RhbCBmcm9tICdAL2NvbXBvbmVudHMvTG9naW5Nb2RhbC52dWUnO1xuaW1wb3J0IE9mZmxpbmVPdmVybGF5IGZyb20gJ0AvY29tcG9uZW50cy9PZmZsaW5lT3ZlcmxheS52dWUnO1xuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcbmltcG9ydCBPcGVyYXRpb25hbFNpZGViYXIgZnJvbSAnQC9jb21wb25lbnRzL09wZXJhdGlvbmFsU2lkZWJhci52dWUnO1xuaW1wb3J0IHsgaHR0cCwgY2xlYXJTZXNzaW9uVG9rZW5zIH0gZnJvbSAnQC9odHRwJztcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJy4vc3RvcmVzL2F1dGgnO1xuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XG5pbXBvcnQgeyB1c2VDb25uZWN0aXZpdHlTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2Nvbm5lY3Rpdml0eSc7XG5cbi8vIFN5bmMgTmFpdmUgdGhlbWUgdG8gZXhpc3RpbmcgZGFyayBtb2RlIGNsYXNzIGFuZCBwaWNrIGNvbG9ycyBmcm9tIENTUyB2YXJzXG5jb25zdCBpc0RhcmsgPSB1c2VEYXJrTW9kZUNsYXNzUmVmKCk7XG5jb25zdCBuYWl2ZU92ZXJyaWRlcyA9IHVzZU5haXZlVGhlbWVPdmVycmlkZXMoKTtcblxuY29uc3Qgcm91dGUgPSB1c2VSb3V0ZSgpO1xuXG5cbi8vIFVzZSBjb25maWcgbWV0YWRhdGEgYXMgYSBmYWxsYmFjayBmb3IgY29udGFpbmVyIHNpemluZyB3aGVuIHJvdXRlIG1ldGEgaXNuJ3Qgc2V0XG5jb25zdCBjZmdTdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XG5jb25zdCB7IG1ldGFkYXRhIH0gPSBzdG9yZVRvUmVmcyhjZmdTdG9yZSk7XG5cbmNvbnN0IGxvZ2dlZE91dCA9IHJlZihmYWxzZSk7XG5cbi8vIE1pcnJvciBMb2dpbk1vZGFsIHZpc2liaWxpdHkgZm9yIGluc3RhbnQgYmFja2dyb3VuZCBhcHBsaWNhdGlvblxuY29uc3QgYXV0aEZvck92ZXJsYXkgPSB1c2VBdXRoU3RvcmUoKTtcbmNvbnN0IGxvZ2luT3ZlcmxheSA9IGNvbXB1dGVkKFxuICAoKSA9PlxuICAgIGF1dGhGb3JPdmVybGF5LnJlYWR5ICYmXG4gICAgYXV0aEZvck92ZXJsYXkuc2hvd0xvZ2luTW9kYWwgJiZcbiAgICAhYXV0aEZvck92ZXJsYXkuaXNBdXRoZW50aWNhdGVkICYmXG4gICAgIWF1dGhGb3JPdmVybGF5LmxvZ291dEluaXRpYXRlZCxcbik7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgY29uc3QgYXV0aFN0b3JlID0gdXNlQXV0aFN0b3JlKCk7XG4gIGNvbnN0IGNvbm5lY3Rpdml0eSA9IHVzZUNvbm5lY3Rpdml0eVN0b3JlKCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgaHR0cC5wb3N0KCcvYXBpL2F1dGgvbG9nb3V0Jywge30sIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdMb2dvdXQgZmFpbGVkOicsIGUpO1xuICB9XG4gIHRyeSB7XG4gICAgKGF1dGhTdG9yZSBhcyBhbnkpLmxvZ291dEluaXRpYXRlZCA9IHRydWU7XG4gIH0gY2F0Y2gge31cbiAgdHJ5IHtcbiAgICBjbGVhclNlc3Npb25Ub2tlbnMoKTtcbiAgfSBjYXRjaCB7fVxuICB0cnkge1xuICAgIGF1dGhTdG9yZS5zZXRBdXRoZW50aWNhdGVkKGZhbHNlKTtcbiAgfSBjYXRjaCB7fVxuICAvLyBTdG9wIGJhY2tncm91bmQgY29ubmVjdGl2aXR5IGNoZWNrcyBhbmQgYW55IG90aGVyIGJhY2tncm91bmQgcG9sbGluZ1xuICB0cnkge1xuICAgIGNvbm5lY3Rpdml0eS5zdG9wKCk7XG4gIH0gY2F0Y2gge31cbiAgbG9nZ2VkT3V0LnZhbHVlID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVmcmVzaFBhZ2UoKSB7XG4gIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbn1cblxuLy8gTGF5b3V0IGNvbnRhaW5lciBzaXppbmcgdmlhIHJvdXRlIG1ldGE6IHsgY29udGFpbmVyOiAnc20nfCdtZCd8J2xnJ3wneGwnfCdmdWxsJyB9XG5jb25zdCBiYXNlID0gJ214LWF1dG8gcHgtNCBzbTpweC02IGxnOnB4LTggcHktNCBtZDpweS02JztcbmNvbnN0IHNpemVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBzbTogJ21heC13LTJ4bCcsXG4gIG1kOiAnbWF4LXctM3hsJyxcbiAgbGc6ICdtYXgtdy01eGwnLFxuICB4bDogJ21heC13LTd4bCcsXG4gIGZ1bGw6ICdtYXgtdy1ub25lIHB4LTAgc206cHgtMCBsZzpweC0wJyxcbn07XG5mdW5jdGlvbiBjb250YWluZXJDbGFzcyhyOiBhbnkpIHtcbiAgY29uc3Qgcm91dGVTaXplID0gcj8ubWV0YT8uY29udGFpbmVyO1xuICBjb25zdCBzaXplID0gcm91dGVTaXplID8/IChtZXRhZGF0YS52YWx1ZSBhcyBhbnkpPy5jb250YWluZXIgPz8gJ2xnJztcbiAgcmV0dXJuIGAke2Jhc2V9ICR7c2l6ZXNbc2l6ZV0gfHwgc2l6ZXNbJ2xnJ119YDtcbn1cbjwvc2NyaXB0PlxuIiwiaW1wb3J0IHsgZGVmaW5lU3RvcmUgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCB7IHJlZiwgUmVmIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByZXBDbWQge1xyXG4gIGRvPzogc3RyaW5nO1xyXG4gIHVuZG8/OiBzdHJpbmc7XHJcbiAgZWxldmF0ZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFwcCB7XHJcbiAgbmFtZT86IHN0cmluZztcclxuICBvdXRwdXQ/OiBzdHJpbmc7XHJcbiAgY21kPzogc3RyaW5nIHwgc3RyaW5nW107XHJcbiAgdXVpZD86IHN0cmluZztcclxuICAnd29ya2luZy1kaXInPzogc3RyaW5nO1xyXG4gICdpbWFnZS1wYXRoJz86IHN0cmluZztcbiAgJ2V4Y2x1ZGUtZ2xvYmFsLXByZXAtY21kJz86IGJvb2xlYW47XG4gICdleGNsdWRlLWdsb2JhbC1zdGF0ZS1jbWQnPzogYm9vbGVhbjtcbiAgJ2NvbmZpZy1vdmVycmlkZXMnPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGVsZXZhdGVkPzogYm9vbGVhbjtcbiAgJ2F1dG8tZGV0YWNoJz86IGJvb2xlYW47XHJcbiAgJ3dhaXQtYWxsJz86IGJvb2xlYW47XHJcbiAgJ3Rlcm1pbmF0ZS1vbi1wYXVzZSc/OiBib29sZWFuO1xyXG4gICd2aXJ0dWFsLWRpc3BsYXknPzogYm9vbGVhbjtcclxuICAndXNlLWFwcC1pZGVudGl0eSc/OiBib29sZWFuO1xyXG4gICdwZXItY2xpZW50LWFwcC1pZGVudGl0eSc/OiBib29sZWFuO1xyXG4gICdhbGxvdy1jbGllbnQtY29tbWFuZHMnPzogYm9vbGVhbjtcclxuICAnZnJhbWUtZ2VuLWxpbWl0ZXItZml4Jz86IGJvb2xlYW47XHJcbiAgJ2dlbjEtZnJhbWVnZW4tZml4Jz86IGJvb2xlYW47XHJcbiAgJ2dlbjItZnJhbWVnZW4tZml4Jz86IGJvb2xlYW47XHJcbiAgJ2V4aXQtdGltZW91dCc/OiBudW1iZXI7XHJcbiAgJ3ByZXAtY21kJz86IFByZXBDbWRbXTtcclxuICAnc3RhdGUtY21kJz86IFByZXBDbWRbXTtcclxuICBkZXRhY2hlZD86IHN0cmluZ1tdO1xyXG4gICdzY2FsZS1mYWN0b3InPzogbnVtYmVyO1xyXG4gIGdhbWVwYWQ/OiBzdHJpbmc7XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctZW5hYmxlZCc/OiBib29sZWFuO1xyXG4gICdsb3NzbGVzcy1zY2FsaW5nLWZyYW1lZ2VuJz86IGJvb2xlYW47XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctdGFyZ2V0LWZwcyc/OiBudW1iZXI7XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctcnRzcy1saW1pdCc/OiBudW1iZXI7XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctcHJvZmlsZSc/OiBzdHJpbmc7XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctcmVjb21tZW5kZWQnPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgJ2xvc3NsZXNzLXNjYWxpbmctY3VzdG9tJz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICdsb3NzbGVzcy1zY2FsaW5nLWxhdW5jaC1kZWxheSc/OiBudW1iZXI7XHJcbiAgLy8gRmFsbGJhY2sgZm9yIGFueSBvdGhlciBzZXJ2ZXIgZmllbGRzIHdlIGRvbid0IG1vZGVsIHlldFxyXG4gIFtrZXk6IHN0cmluZ106IGFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEFwcHNSZXNwb25zZSB7XHJcbiAgYXBwcz86IEFwcFtdO1xyXG4gIGN1cnJlbnRfYXBwPzogc3RyaW5nIHwgbnVsbDtcclxuICBob3N0X3V1aWQ/OiBzdHJpbmc7XHJcbiAgaG9zdF9uYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyBDZW50cmFsaXplZCBzdG9yZSBmb3IgYXBwbGljYXRpb25zIGxpc3RcclxuZXhwb3J0IGNvbnN0IHVzZUFwcHNTdG9yZSA9IGRlZmluZVN0b3JlKCdhcHBzJywgKCkgPT4ge1xyXG4gIGNvbnN0IGFwcHM6IFJlZjxBcHBbXT4gPSByZWYoW10pO1xyXG4gIGNvbnN0IGN1cnJlbnRBcHBVdWlkOiBSZWY8c3RyaW5nIHwgbnVsbD4gPSByZWYobnVsbCk7XHJcblxyXG4gIGZ1bmN0aW9uIHNldEFwcHMobGlzdDogQXBwW10pOiB2b2lkIHtcclxuICAgIGFwcHMudmFsdWUgPSBBcnJheS5pc0FycmF5KGxpc3QpID8gbGlzdCA6IFtdO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0Q3VycmVudEFwcCh1dWlkOiB1bmtub3duKTogdm9pZCB7XHJcbiAgICBpZiAodHlwZW9mIHV1aWQgPT09ICdzdHJpbmcnICYmIHV1aWQubGVuZ3RoID4gMCkge1xyXG4gICAgICBjdXJyZW50QXBwVXVpZC52YWx1ZSA9IHV1aWQ7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGN1cnJlbnRBcHBVdWlkLnZhbHVlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vIExvYWQgYXBwcyBmcm9tIHNlcnZlci4gSWYgZm9yY2UgaXMgZmFsc2UgYW5kIGFwcHMgYWxyZWFkeSBwcmVzZW50LCByZXR1cm5zIGNhY2hlZCBsaXN0LlxyXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRBcHBzKGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPEFwcFtdPiB7XHJcbiAgICBpZiAoYXBwcy52YWx1ZSAmJiBhcHBzLnZhbHVlLmxlbmd0aCA+IDAgJiYgIWZvcmNlKSByZXR1cm4gYXBwcy52YWx1ZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldDxBcHBzUmVzcG9uc2U+KCcuL2FwaS9hcHBzJyk7XHJcbiAgICAgIGlmIChyLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgICAgc2V0QXBwcyhbXSk7XHJcbiAgICAgICAgc2V0Q3VycmVudEFwcChudWxsKTtcclxuICAgICAgICByZXR1cm4gYXBwcy52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBzZXRBcHBzKChyLmRhdGEgJiYgci5kYXRhLmFwcHMpIHx8IFtdKTtcclxuICAgICAgc2V0Q3VycmVudEFwcChyLmRhdGE/LmN1cnJlbnRfYXBwID8/IG51bGwpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBzZXRBcHBzKFtdKTtcclxuICAgICAgc2V0Q3VycmVudEFwcChudWxsKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcHBzLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gcmVvcmRlckFwcHMob3JkZXI6IHN0cmluZ1tdKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHAucG9zdDx7IHN0YXR1cz86IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+KFxyXG4gICAgICAgICcuL2FwaS9hcHBzL3Jlb3JkZXInLFxyXG4gICAgICAgIHsgb3JkZXIgfSxcclxuICAgICAgICB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0sXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcclxuICAgICAgICBjb25zdCByZWFzb24gPSB0eXBlb2YgcmVzcG9uc2UuZGF0YT8uZXJyb3IgPT09ICdzdHJpbmcnID8gcmVzcG9uc2UuZGF0YS5lcnJvciA6IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiByZWFzb24gfHwgYFJlcXVlc3QgZmFpbGVkICgke3Jlc3BvbnNlLnN0YXR1c30pYCB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXJlc3BvbnNlLmRhdGE/LnN0YXR1cykge1xyXG4gICAgICAgIGNvbnN0IHJlYXNvbiA9IHR5cGVvZiByZXNwb25zZS5kYXRhPy5lcnJvciA9PT0gJ3N0cmluZycgPyByZXNwb25zZS5kYXRhLmVycm9yIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHJlYXNvbiB8fCAnU2VydmVyIHJlamVjdGVkIHJlb3JkZXIgcmVxdWVzdCcgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgbG9hZEFwcHModHJ1ZSk7XHJcbiAgICAgIHJldHVybiB7IG9rOiB0cnVlIH07XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc3QgcmVhc29uID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IHVuZGVmaW5lZDtcclxuICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogcmVhc29uIHx8ICdGYWlsZWQgdG8gcmVvcmRlciBhcHBsaWNhdGlvbnMnIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBsYXVuY2hBcHAoXHJcbiAgICB1dWlkOiBzdHJpbmcsXHJcbiAgKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZzsgY2FuY2VsZWQ/OiBib29sZWFuIH0+IHtcclxuICAgIGlmICghdXVpZCkge1xyXG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnbWlzc2luZyB1dWlkJyB9O1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwLnBvc3Q8eyBzdGF0dXM/OiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PihcclxuICAgICAgICAnLi9hcGkvYXBwcy9sYXVuY2gnLFxyXG4gICAgICAgIHsgdXVpZCB9LFxyXG4gICAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCAmJiByZXNwb25zZS5kYXRhPy5zdGF0dXMpIHtcclxuICAgICAgICBzZXRDdXJyZW50QXBwKHV1aWQpO1xyXG4gICAgICAgIHJldHVybiB7IG9rOiB0cnVlIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlYXNvbiA9IHR5cGVvZiByZXNwb25zZS5kYXRhPy5lcnJvciA9PT0gJ3N0cmluZycgPyByZXNwb25zZS5kYXRhLmVycm9yIDogdW5kZWZpbmVkO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG9rOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogcmVhc29uIHx8IGBSZXF1ZXN0IGZhaWxlZCAoJHtyZXNwb25zZS5zdGF0dXN9KWAsXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc3QgY29kZSA9IChlcnIgYXMgeyBjb2RlPzogc3RyaW5nIH0gfCBudWxsKT8uY29kZTtcclxuICAgICAgaWYgKGNvZGUgPT09ICdFUlJfQ0FOQ0VMRUQnKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBjYW5jZWxlZDogdHJ1ZSB9O1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHJlYXNvbiA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiB1bmRlZmluZWQ7XHJcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHJlYXNvbiB8fCAnRmFpbGVkIHRvIGxhdW5jaCBhcHBsaWNhdGlvbicgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGNsb3NlQWN0aXZlQXBwKCk6IFByb21pc2U8eyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwLnBvc3Q8eyBzdGF0dXM/OiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PihcclxuICAgICAgICAnLi9hcGkvYXBwcy9jbG9zZScsXHJcbiAgICAgICAge30sXHJcbiAgICAgICAgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9LFxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwICYmIHJlc3BvbnNlLmRhdGE/LnN0YXR1cykge1xyXG4gICAgICAgIHNldEN1cnJlbnRBcHAobnVsbCk7XHJcbiAgICAgICAgYXdhaXQgbG9hZEFwcHModHJ1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHsgb2s6IHRydWUgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVhc29uID0gdHlwZW9mIHJlc3BvbnNlLmRhdGE/LmVycm9yID09PSAnc3RyaW5nJyA/IHJlc3BvbnNlLmRhdGEuZXJyb3IgOiB1bmRlZmluZWQ7XHJcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHJlYXNvbiB8fCBgUmVxdWVzdCBmYWlsZWQgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgIH07XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc3QgcmVhc29uID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IHVuZGVmaW5lZDtcclxuICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogcmVhc29uIHx8ICdGYWlsZWQgdG8gY2xvc2UgYXBwbGljYXRpb24nIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYXBwcyxcclxuICAgIHNldEFwcHMsXHJcbiAgICBsb2FkQXBwcyxcclxuICAgIHJlb3JkZXJBcHBzLFxyXG4gICAgbGF1bmNoQXBwLFxyXG4gICAgY2xvc2VBY3RpdmVBcHAsXHJcbiAgICBjdXJyZW50QXBwVXVpZCxcclxuICB9O1xyXG59KTtcclxuIiwiaW1wb3J0IHsgY3JlYXRlQXBwLCByZWYsIHdhdGNoLCBBcHAgYXMgVnVlQXBwIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgY3JlYXRlUGluaWEgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCB7IGluaXRBcHAgfSBmcm9tICdAL2luaXQnO1xyXG5pbXBvcnQgeyByb3V0ZXIgfSBmcm9tICdAL3JvdXRlcic7XHJcbmltcG9ydCBBcHAgZnJvbSAnQC9BcHAudnVlJztcclxuaW1wb3J0ICcuL3N0eWxlcy90YWlsd2luZC5jc3MnO1xyXG5pbXBvcnQgeyBpbml0SHR0cExheWVyIH0gZnJvbSAnQC9odHRwJztcclxuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XHJcbmltcG9ydCB7IHVzZUFwcHNTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2FwcHMnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IHVzZUNvbm5lY3Rpdml0eVN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29ubmVjdGl2aXR5JztcclxuaW1wb3J0IHsgZW5zdXJlTG9jYWxlTG9hZGVkIH0gZnJvbSAnQC9sb2NhbGUtbWFuYWdlcic7XHJcblxyXG5jb25zdCBjaHVua1JlbG9hZEZsYWcgPSAnc3Vuc2hpbmU6Y2h1bmstcmVsb2FkJztcclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGNodW5rUmVsb2FkRmxhZyk7XHJcbiAgfSBjYXRjaCB7fVxyXG59XHJcblxyXG4vLyBDb3JlIGFwcGxpY2F0aW9uIGluc3RhbmNlICYgc3RvcmVzXHJcbmNvbnN0IGFwcDogVnVlQXBwPEVsZW1lbnQ+ID0gY3JlYXRlQXBwKEFwcCk7XHJcbmNvbnN0IHBpbmlhID0gY3JlYXRlUGluaWEoKTtcclxuYXBwLnVzZShyb3V0ZXIpO1xyXG5hcHAudXNlKHBpbmlhKTtcclxuXHJcbi8vIEVuYWJsZSBWdWUgZGV2dG9vbHMgd2hlbiBidWlsZGluZyB3aXRoIFZpdGUgbW9kZSBcImRlYnVnXCJcclxuaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSAnZGVidWcnKSB7XG4gIC8vIFJlcXVpcmVzIF9fVlVFX1BST0RfREVWVE9PTFNfXyB0byBiZSB0cnVlIGF0IGJ1aWxkIHRpbWVcbiAgKGFwcC5jb25maWcgYXMgdHlwZW9mIGFwcC5jb25maWcgJiB7IGRldnRvb2xzPzogYm9vbGVhbiB9KS5kZXZ0b29scyA9IHRydWU7XG59XG5cclxuLy8gRXhwb3NlIHBsYXRmb3JtIHJlZiBlYXJseSAodXBkYXRlZCBhZnRlciBjb25maWcgbG9hZClcclxuY29uc3QgcGxhdGZvcm1SZWYgPSByZWYoJycpO1xyXG5hcHAucHJvdmlkZSgncGxhdGZvcm0nLCBwbGF0Zm9ybVJlZik7XHJcblxyXG4vLyBDZW50cmFsIGJvb3RzdHJhcDogaW5pdGlhbGl6ZSBpMThuICsgYXV0aCBzdGF0dXMsIHRoZW4gd2hlbiBhdXRoZW50aWNhdGVkIGxvYWRcclxuLy8gY29uZmlnICYgYXBwcyBleGFjdGx5IG9uY2UuIFN1YnNlcXVlbnQgbG9nb3V0cyAoNDAxKSB3aWxsIHJlLXRyaWdnZXIgbG9naW4gbW9kYWxcclxuLy8gYW5kIGEgbGF0ZXIgc3VjY2Vzc2Z1bCBsb2dpbiB3aWxsIHJlLWxvYWQgZnJlc2ggZGF0YS5cclxuaW5pdEFwcChhcHAsIGFzeW5jICgpID0+IHtcclxuICBhd2FpdCBpbml0SHR0cExheWVyKCk7XHJcbiAgLy8gU3RhcnQgY29ubmVjdGl2aXR5IGhlYXJ0YmVhdCBlYXJseSBzbyB3ZSBjYW4gZGV0ZWN0IHNlcnZlciBsb3NzXHJcbiAgY29uc3QgY29ubmVjdGl2aXR5ID0gdXNlQ29ubmVjdGl2aXR5U3RvcmUoKTtcclxuICBjb25uZWN0aXZpdHkuc3RhcnQoKTtcclxuXHJcbiAgY29uc3QgYXV0aCA9IHVzZUF1dGhTdG9yZSgpO1xyXG4gIGNvbnN0IGNvbmZpZ1N0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuICBjb25zdCBhcHBzU3RvcmUgPSB1c2VBcHBzU3RvcmUoKTtcclxuXHJcbiAgLy8gS2VlcCBwcm92aWRlZCBwbGF0Zm9ybSByZWYgaW4gc3luYyB3aXRoIHN0b3JlIG1ldGFkYXRhIGZvciBhbnkgY29uc3VtZXJzXHJcbiAgd2F0Y2goXHJcbiAgICAoKSA9PiBjb25maWdTdG9yZS5tZXRhZGF0YS5wbGF0Zm9ybSxcclxuICAgIChwKSA9PiB7XHJcbiAgICAgIHBsYXRmb3JtUmVmLnZhbHVlID0gcCB8fCAnJztcclxuICAgIH0sXHJcbiAgICB7IGltbWVkaWF0ZTogdHJ1ZSB9LFxyXG4gICk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgYXV0aCBzdGF0dXMgZnJvbSBzZXJ2ZXJcclxuICBhd2FpdCBhdXRoLmluaXQoKTtcclxuXHJcbiAgYXV0aC53YWl0Rm9yQXV0aGVudGljYXRpb24oKS50aGVuKGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IGNvbmZpZ1N0b3JlLmZldGNoQ29uZmlnKHRydWUpO1xyXG4gICAgLy8gUmVhY3QgdG8gbG9jYWxlIHNldHRpbmcgY2hhbmdlcyBieSBzd2l0Y2hpbmcgaTE4biBhdCBydW50aW1lXHJcbiAgICB3YXRjaChcclxuICAgICAgKCkgPT4gY29uZmlnU3RvcmUuY29uZmlnPy5sb2NhbGUsXHJcbiAgICAgIGFzeW5jIChsb2MpID0+IHtcclxuICAgICAgICBjb25zdCBsb2NhbGUgPSBsb2MgPz8gJ2VuJztcclxuICAgICAgICBhd2FpdCBlbnN1cmVMb2NhbGVMb2FkZWQobG9jYWxlKTtcclxuICAgICAgfSxcclxuICAgICAgeyBpbW1lZGlhdGU6IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBhd2FpdCBhcHBzU3RvcmUubG9hZEFwcHModHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFByZWZldGNoIGNvbW1vbiByb3V0ZSBjaHVua3MgKHNldHRpbmdzLCBhcHBsaWNhdGlvbnMpIGFmdGVyIGlkbGUgdG8gaW1wcm92ZSBVWFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcmVmZXRjaCA9ICgpID0+IHtcclxuICAgICAgLy8gVHJpZ2dlciBkeW5hbWljIGltcG9ydHM7IGJyb3dzZXIgY2FjaGVzIGNodW5rcyBmb3IgbmV4dCBuYXZpZ2F0aW9uXG4gICAgICBpbXBvcnQoJ0Avdmlld3MvU2V0dGluZ3NWaWV3LnZ1ZScpO1xuICAgICAgaW1wb3J0KCdAL3ZpZXdzL0xpYnJhcnlWaWV3LnZ1ZScpO1xuICAgICAgaW1wb3J0KCdAL3ZpZXdzL0dhbWVTb3VyY2VzVmlldy52dWUnKTtcbiAgICAgIGltcG9ydCgnQC92aWV3cy9TeXN0ZW1WaWV3LnZ1ZScpO1xuICAgIH07XG4gICAgLy8gVXNlIHJlcXVlc3RJZGxlQ2FsbGJhY2sgd2hlbiBhdmFpbGFibGUgdG8gYXZvaWQgY29tcGV0aW5nIHdpdGggY3JpdGljYWwgd29ya1xyXG4gICAgaWYgKHR5cGVvZiAod2luZG93IGFzIGFueSkucmVxdWVzdElkbGVDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAod2luZG93IGFzIGFueSkucmVxdWVzdElkbGVDYWxsYmFjayhwcmVmZXRjaCwgeyB0aW1lb3V0OiAyMDAwIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0VGltZW91dChwcmVmZXRjaCwgMTUwMCk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBpZ25vcmUgcHJlZmV0Y2ggZXJyb3JzXHJcbiAgfVxyXG59KTtcclxuIl0sImZpbGUiOiJhc3NldHMvaW5kZXgtZjNhNDhlYjAuanMifQ==