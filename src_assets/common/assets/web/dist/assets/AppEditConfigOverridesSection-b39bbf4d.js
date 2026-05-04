import { k as defineComponent, aa as mergeModels, ac as useModel, r as ref, R as useI18n, c as computed, w as watch, Q as openBlock, O as createElementBlock, V as createBaseVNode, P as toDisplayString, U as createVNode, S as withCtx, j as createTextVNode, Z as unref, M as createBlock, W as createCommentVNode, F as Fragment, a1 as renderList, H as normalizeClass, Y as withKeys, X as withModifiers, T as Teleport, n as nextTick } from "./vue-core-de07660f.js";
import { b as ConfigInputField, e as ConfigSelectField, C as ConfigFieldRenderer, g as getConfigSelectOptions, f as buildConfigOptionsText } from "./ConfigFieldRenderer-f2409336.js";
import { u as useConfigStore, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { aq as NButton, an as __unplugin_components_0, aE as NTag } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "rounded-2xl border border-dark/10 dark:border-light/10 bg-light/60 dark:bg-surface/40 p-4 space-y-4" };
const _hoisted_2 = { class: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between" };
const _hoisted_3 = { class: "space-y-1" };
const _hoisted_4 = { class: "text-xs leading-relaxed opacity-70" };
const _hoisted_5 = { class: "flex flex-wrap items-center gap-2" };
const _hoisted_6 = { class: "min-w-0 space-y-3" };
const _hoisted_7 = { class: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" };
const _hoisted_8 = { class: "space-y-1" };
const _hoisted_9 = { class: "text-xs opacity-60 leading-relaxed" };
const _hoisted_10 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-3 py-1 text-xs font-medium opacity-70" };
const _hoisted_11 = {
  key: 0,
  class: "rounded-xl border border-dashed border-dark/15 dark:border-light/15 px-4 py-8 text-center space-y-3"
};
const _hoisted_12 = { class: "text-sm font-medium" };
const _hoisted_13 = {
  key: 1,
  class: "rounded-xl border border-dark/10 dark:border-light/10 bg-white/40 dark:bg-white/5 divide-y divide-dark/10 dark:divide-light/10"
};
const _hoisted_14 = { class: "hidden sm:inline" };
const _hoisted_15 = { class: "font-mono" };
const _hoisted_16 = { class: "hidden sm:inline" };
const _hoisted_17 = { class: "font-mono" };
const _hoisted_18 = { class: "hidden sm:inline" };
const _hoisted_19 = { class: "font-mono" };
const _hoisted_20 = { class: "hidden sm:inline" };
const _hoisted_21 = { class: "font-mono" };
const _hoisted_22 = { class: "font-mono" };
const _hoisted_23 = { class: "hidden sm:inline" };
const _hoisted_24 = { class: "font-mono" };
const _hoisted_25 = { class: "font-mono" };
const _hoisted_26 = {
  key: 0,
  class: "text-xs text-danger"
};
const _hoisted_27 = {
  key: 0,
  class: "fixed inset-0 z-[2100] px-2 py-2 md:px-3 md:py-3 xl:px-5 xl:py-4"
};
const _hoisted_28 = { class: "relative mx-auto flex h-full max-w-[112rem] flex-col overflow-hidden rounded-[1.75rem] border border-dark/10 dark:border-light/10 bg-white/95 shadow-2xl dark:bg-surface/95" };
const _hoisted_29 = { class: "sticky top-0 z-20 border-b border-dark/10 dark:border-light/10 bg-white/95 px-4 py-4 backdrop-blur dark:bg-surface/95" };
const _hoisted_30 = { class: "flex flex-col gap-3" };
const _hoisted_31 = { class: "flex min-w-0 items-start gap-2" };
const _hoisted_32 = { class: "min-w-0 space-y-1" };
const _hoisted_33 = { class: "text-xs leading-relaxed opacity-70" };
const _hoisted_34 = { class: "grid grid-cols-2 gap-2 xl:hidden" };
const _hoisted_35 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px]" };
const _hoisted_36 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px]" };
const _hoisted_37 = { class: "min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4" };
const _hoisted_38 = { class: "grid h-full min-h-0 gap-3 sm:gap-4 xl:grid-cols-[minmax(27rem,0.84fr)_minmax(42rem,1.16fr)] 2xl:grid-cols-[minmax(28rem,0.8fr)_minmax(50rem,1.2fr)]" };
const _hoisted_39 = { class: "border-b border-dark/10 px-4 py-4 dark:border-light/10" };
const _hoisted_40 = { class: "flex items-center justify-between gap-3" };
const _hoisted_41 = { class: "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary" };
const _hoisted_42 = { class: "vb-scroll min-h-0 flex-1" };
const _hoisted_43 = {
  key: 0,
  class: "px-4 py-4"
};
const _hoisted_44 = { class: "rounded-xl border border-dashed border-dark/15 dark:border-light/15 bg-white/40 px-4 py-6 text-center dark:bg-surface/30" };
const _hoisted_45 = { class: "mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary" };
const _hoisted_46 = {
  key: 1,
  class: "m-4 rounded-xl border border-dark/10 dark:border-light/10 bg-white/60 dark:bg-surface/40 divide-y divide-dark/10 dark:divide-light/10"
};
const _hoisted_47 = { class: "hidden sm:inline" };
const _hoisted_48 = { class: "font-mono" };
const _hoisted_49 = { class: "hidden sm:inline" };
const _hoisted_50 = { class: "font-mono" };
const _hoisted_51 = { class: "hidden sm:inline" };
const _hoisted_52 = { class: "font-mono" };
const _hoisted_53 = { class: "hidden sm:inline" };
const _hoisted_54 = { class: "font-mono" };
const _hoisted_55 = { class: "font-mono" };
const _hoisted_56 = { class: "hidden sm:inline" };
const _hoisted_57 = { class: "font-mono" };
const _hoisted_58 = { class: "font-mono" };
const _hoisted_59 = {
  key: 0,
  class: "text-xs text-danger"
};
const _hoisted_60 = { class: "border-b border-dark/10 px-4 py-3 dark:border-light/10" };
const _hoisted_61 = { class: "space-y-2.5" };
const _hoisted_62 = { class: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between" };
const _hoisted_63 = { class: "self-start text-xs opacity-60" };
const _hoisted_64 = { key: 0 };
const _hoisted_65 = { class: "flex flex-col gap-2 md:flex-row md:items-center" };
const _hoisted_66 = { class: "min-h-0 flex-1 p-3" };
const _hoisted_67 = { class: "grid h-full min-h-0 gap-3 xl:grid-cols-[12.5rem_minmax(0,1fr)] 2xl:grid-cols-[13.5rem_minmax(0,1fr)]" };
const _hoisted_68 = {
  key: 0,
  class: "hidden min-h-0 xl:flex xl:flex-col"
};
const _hoisted_69 = { class: "vb-scroll flex-1 min-h-0 rounded-xl border border-dark/10 bg-light/70 dark:border-light/10 dark:bg-surface/40" };
const _hoisted_70 = { class: "p-2" };
const _hoisted_71 = { class: "space-y-1" };
const _hoisted_72 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px] opacity-70" };
const _hoisted_73 = ["onClick"];
const _hoisted_74 = { class: "truncate" };
const _hoisted_75 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px] opacity-70" };
const _hoisted_76 = { class: "min-h-0 min-w-0 flex flex-col" };
const _hoisted_77 = { class: "space-y-3 pr-1" };
const _hoisted_78 = {
  key: 0,
  class: "grid grid-cols-2 gap-1.5 xl:hidden"
};
const _hoisted_79 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px] opacity-70" };
const _hoisted_80 = ["onClick"];
const _hoisted_81 = { class: "truncate" };
const _hoisted_82 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-0.5 text-[10px] opacity-70" };
const _hoisted_83 = { class: "flex items-center justify-between gap-3" };
const _hoisted_84 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_85 = { class: "text-xs opacity-50" };
const _hoisted_86 = { class: "grid gap-2 2xl:grid-cols-2" };
const _hoisted_87 = ["onClick"];
const _hoisted_88 = { class: "flex items-start justify-between gap-3" };
const _hoisted_89 = { class: "min-w-0 space-y-0.5" };
const _hoisted_90 = { class: "text-sm font-semibold leading-snug" };
const _hoisted_91 = { class: "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs opacity-60" };
const _hoisted_92 = { class: "hidden break-all font-mono md:block" };
const _hoisted_93 = { class: "flex shrink-0 items-center gap-2" };
const _hoisted_94 = { class: "rounded-full bg-dark/5 dark:bg-light/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_95 = { class: "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary" };
const _hoisted_96 = {
  key: 0,
  class: "mt-2 text-xs leading-relaxed opacity-70"
};
const _hoisted_97 = {
  key: 2,
  class: "rounded-xl border border-dashed border-dark/15 dark:border-light/15 px-4 py-6 text-center space-y-2"
};
const _hoisted_98 = { class: "text-sm font-medium" };
const _hoisted_99 = { class: "text-xs opacity-60 leading-relaxed" };
const _hoisted_100 = { class: "sticky bottom-0 z-20 border-t border-dark/10 dark:border-light/10 bg-white/95 px-4 py-3 backdrop-blur dark:bg-surface/95" };
const _hoisted_101 = { class: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" };
const _hoisted_102 = { class: "text-xs leading-relaxed opacity-70" };
const _hoisted_103 = { class: "xl:hidden" };
const _hoisted_104 = { class: "flex flex-wrap items-center justify-end gap-2" };
const _hoisted_105 = { class: "ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold" };
const ALL_GROUPS_ID = "all";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppEditConfigOverridesSection",
  props: /* @__PURE__ */ mergeModels({
    scopeLabel: { type: String, required: false, default: "application" },
    description: { type: String, required: false, default: "" }
  }, {
    "overrides": { type: Object, ...{ required: true } },
    "overridesModifiers": {},
    "pickerOpen": { type: Boolean, ...{ default: false } },
    "pickerOpenModifiers": {}
  }),
  emits: ["update:overrides", "update:pickerOpen"],
  setup(__props) {
    const overrides = useModel(__props, "overrides");
    const browseModalOpen = useModel(__props, "pickerOpen");
    const draftOverrides = ref({});
    const { t } = useI18n();
    const props = __props;
    const descriptionText = computed(() => {
      if (props.description)
        return props.description;
      const scope = String(props.scopeLabel || "application").toLowerCase().trim();
      if (scope === "client") {
        return "Override global settings for this client. Client overrides take precedence over app overrides and global config.";
      }
      return "Override global settings for this application only. Network, security, and file-path settings are intentionally excluded.";
    });
    const scopeSummaryLabel = computed(
      () => String(props.scopeLabel || "application").toLowerCase().trim() === "client" ? "client" : "application"
    );
    const configStore = useConfigStore();
    const configRef = configStore.config;
    const tabsRef = configStore.tabs;
    const metadataRef = configStore.metadata;
    const DD_KEYS = {
      configurationOption: "dd_configuration_option",
      resolutionOption: "dd_resolution_option",
      manualResolution: "dd_manual_resolution",
      refreshRateOption: "dd_refresh_rate_option",
      manualRefreshRate: "dd_manual_refresh_rate",
      hdrOption: "dd_hdr_option",
      hdrRequestOverride: "dd_hdr_request_override"
    };
    const OVERRIDE_KEY_ALIASES = {
      nvenc_force_split_encode: "nvenc_split_encode"
    };
    function normalizeOverrideKey(key) {
      return OVERRIDE_KEY_ALIASES[key] ?? key;
    }
    function normalizeOverrideRecord(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
      }
      const normalized = {};
      for (const [rawKey, rawValue] of Object.entries(value)) {
        const key = normalizeOverrideKey(rawKey);
        if (rawKey !== key && Object.prototype.hasOwnProperty.call(normalized, key)) {
          continue;
        }
        normalized[key] = cloneValue(rawValue);
      }
      return normalized;
    }
    function overrideRecordsEqual(a, b) {
      try {
        return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
      } catch {
        return false;
      }
    }
    const HIDDEN_OVERRIDE_KEYS = /* @__PURE__ */ new Set([
      DD_KEYS.configurationOption,
      DD_KEYS.resolutionOption,
      DD_KEYS.manualResolution,
      DD_KEYS.refreshRateOption,
      DD_KEYS.manualRefreshRate,
      DD_KEYS.hdrOption,
      DD_KEYS.hdrRequestOverride
    ]);
    function isHiddenOverrideKey(key) {
      return HIDDEN_OVERRIDE_KEYS.has(key);
    }
    function getConfigState() {
      return (configRef == null ? void 0 : configRef.value) ?? configRef;
    }
    function getTabsState() {
      const v = (tabsRef == null ? void 0 : tabsRef.value) ?? tabsRef;
      return Array.isArray(v) ? v : [];
    }
    function getMetadataState() {
      return (metadataRef == null ? void 0 : metadataRef.value) ?? metadataRef;
    }
    function platformKey() {
      try {
        const meta = getMetadataState();
        const cfg = getConfigState();
        return String((meta == null ? void 0 : meta.platform) ?? (cfg == null ? void 0 : cfg.platform) ?? "").toLowerCase().trim();
      } catch {
        return "";
      }
    }
    const ALLOWED_OVERRIDE_KEYS = /* @__PURE__ */ new Set([
      // Input behavior
      "controller",
      "gamepad",
      "ds4_back_as_touchpad_click",
      "motion_as_ds4",
      "touchpad_as_ds4",
      "back_button_timeout",
      "keyboard",
      "key_repeat_delay",
      "key_repeat_frequency",
      "always_send_scancodes",
      "key_rightalt_to_key_win",
      "mouse",
      "high_resolution_scrolling",
      "native_pen_touch",
      "keybindings",
      "ds5_inputtino_randomize_mac",
      // Stream audio/video and display automation
      "audio_sink",
      "virtual_sink",
      "stream_audio",
      "adapter_name",
      "dd_configuration_option",
      "dd_resolution_option",
      "dd_manual_resolution",
      "dd_refresh_rate_option",
      "dd_manual_refresh_rate",
      "dd_hdr_option",
      "dd_hdr_request_override",
      "dd_config_revert_delay",
      "dd_config_revert_on_disconnect",
      "dd_paused_virtual_display_timeout_secs",
      "dd_always_restore_from_golden",
      "dd_snapshot_exclude_devices",
      "dd_snapshot_restore_hotkey",
      "dd_snapshot_restore_hotkey_modifiers",
      "dd_activate_virtual_display",
      "dd_mode_remapping",
      "dd_wa_virtual_double_refresh",
      "dd_wa_dummy_plug_hdr10",
      "max_bitrate",
      "minimum_fps_target",
      // Codec / capture negotiation
      "fec_percentage",
      "qp",
      "min_threads",
      "hevc_mode",
      "av1_mode",
      "prefer_10bit_sdr",
      "capture",
      "encoder",
      // Frame limiter behavior
      "frame_limiter_enable",
      "frame_limiter_provider",
      "frame_limiter_fps_limit",
      "rtss_frame_limit_type",
      "frame_limiter_disable_vsync",
      // Encoder tuning
      "nvenc_preset",
      "nvenc_twopass",
      "nvenc_spatial_aq",
      "nvenc_split_encode",
      "nvenc_vbv_increase",
      "nvenc_realtime_hags",
      "nvenc_latency_over_power",
      "nvenc_opengl_vulkan_on_dxgi",
      "nvenc_h264_cavlc",
      "qsv_preset",
      "qsv_coder",
      "qsv_slow_hevc",
      "amd_usage",
      "amd_rc",
      "amd_enforce_hrd",
      "amd_quality",
      "amd_preanalysis",
      "amd_vbaq",
      "amd_coder",
      "vt_coder",
      "vt_software",
      "vt_realtime",
      "vaapi_strict_rc_buffer",
      "sw_preset",
      "sw_tune"
    ]);
    function isAllowedKey(key) {
      if (!key)
        return false;
      return ALLOWED_OVERRIDE_KEYS.has(key);
    }
    function prettifyKey(key) {
      return key.split("_").filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    }
    function labelFor(key) {
      const k = `config.${key}`;
      const v = t(k);
      if (!v || v === k)
        return prettifyKey(key);
      return v;
    }
    function descFor(key) {
      const k = `config.${key}_desc`;
      const v = t(k);
      if (!v || v === k)
        return "";
      return v;
    }
    function cloneValue(v) {
      if (v === null || v === void 0)
        return v;
      if (typeof v !== "object")
        return v;
      try {
        return JSON.parse(JSON.stringify(v));
      } catch {
        return v;
      }
    }
    function getGlobalValue(key) {
      var _a;
      try {
        const state = getConfigState();
        const cur = state == null ? void 0 : state[key];
        if (cur !== void 0)
          return cur;
        return (_a = configStore == null ? void 0 : configStore.defaults) == null ? void 0 : _a[key];
      } catch {
        return void 0;
      }
    }
    function getOverridesSource(target) {
      const source = target === "draft" ? draftOverrides.value : overrides.value;
      if (!source || typeof source !== "object" || Array.isArray(source)) {
        return {};
      }
      return source;
    }
    function ensureOverridesObjectFor(target) {
      if (target === "draft") {
        if (!draftOverrides.value || typeof draftOverrides.value !== "object" || Array.isArray(draftOverrides.value)) {
          draftOverrides.value = {};
        }
        return;
      }
      if (!overrides.value || typeof overrides.value !== "object" || Array.isArray(overrides.value)) {
        overrides.value = {};
      }
    }
    function replaceOverridesFor(target, nextValue) {
      const next = normalizeOverrideRecord(nextValue);
      if (target === "draft") {
        draftOverrides.value = next;
        return;
      }
      ensureOverridesObjectFor("live");
      const current = overrides.value;
      for (const key of Object.keys(current)) {
        if (!Object.prototype.hasOwnProperty.call(next, key)) {
          delete current[key];
        }
      }
      for (const [key, value] of Object.entries(next)) {
        current[key] = value;
      }
    }
    function setOverrideKeyFor(target, key, value) {
      ensureOverridesObjectFor(target);
      const normalizedKey = normalizeOverrideKey(key);
      if (target === "draft") {
        draftOverrides.value[normalizedKey] = value;
        return;
      }
      overrides.value[normalizedKey] = value;
    }
    function clearOverrideKeyFor(target, key) {
      ensureOverridesObjectFor(target);
      const normalizedKey = normalizeOverrideKey(key);
      try {
        if (target === "draft") {
          delete draftOverrides.value[normalizedKey];
        } else {
          delete overrides.value[normalizedKey];
        }
      } catch {
      }
      clearJsonStateFor(target, normalizedKey);
    }
    function clearOverrideKey(key) {
      clearOverrideKeyFor("live", key);
    }
    const overrideKeys = computed(() => {
      return Object.keys(getOverridesSource("live")).filter(
        (k) => typeof k === "string" && k.length > 0
      );
    });
    const visibleOverrideKeys = computed(
      () => overrideKeys.value.filter((k) => !isHiddenOverrideKey(k))
    );
    const draftOverrideKeys = computed(
      () => Object.keys(getOverridesSource("draft")).filter((k) => typeof k === "string" && k.length > 0)
    );
    const visibleDraftOverrideKeys = computed(
      () => draftOverrideKeys.value.filter((k) => !isHiddenOverrideKey(k))
    );
    const SYN_KEYS = {
      configureDisplayResolution: "configure_display_resolution",
      configureDisplayRefreshRate: "configure_display_refresh_rate",
      configureDisplayHdr: "configure_display_hdr"
    };
    const SYNTHETIC_KEYS = new Set(Object.values(SYN_KEYS));
    function isSyntheticKey(key) {
      return SYNTHETIC_KEYS.has(key);
    }
    function isWindowsPlatform() {
      return platformKey() === "windows";
    }
    function getOverrideStringFor(target, key) {
      const o = getOverridesSource(target);
      if (!o || typeof o !== "object" || Array.isArray(o))
        return null;
      const v = o[key];
      if (v === void 0 || v === null)
        return null;
      return String(v);
    }
    function globalDdConfigDisabled() {
      const gv = getGlobalValue(DD_KEYS.configurationOption);
      return String(gv ?? "disabled") === "disabled";
    }
    function ensureDdEnabledForDisplayOverrides(target) {
      if (!globalDdConfigDisabled())
        return;
      const cur = getOverrideStringFor(target, DD_KEYS.configurationOption);
      if (!cur || cur === "disabled") {
        setOverrideKeyFor(target, DD_KEYS.configurationOption, "verify_only");
      }
    }
    function cleanupDdConfigurationOptionIfUnused(target) {
      if (!globalDdConfigDisabled())
        return;
      const o = getOverridesSource(target);
      if (!o || typeof o !== "object" || Array.isArray(o))
        return;
      const ddKeys = Object.keys(o).filter((k) => k.startsWith("dd_"));
      const hasOtherDdKeys = ddKeys.some((k) => k !== DD_KEYS.configurationOption);
      if (!hasOtherDdKeys && o[DD_KEYS.configurationOption] === "verify_only") {
        clearOverrideKeyFor(target, DD_KEYS.configurationOption);
      }
    }
    function isForcedResolutionActiveFor(target) {
      if (!isWindowsPlatform())
        return false;
      const opt = getOverrideStringFor(target, DD_KEYS.resolutionOption);
      if (opt === "manual")
        return true;
      const o = getOverridesSource(target);
      return !!o && typeof o === "object" && !Array.isArray(o) && o[DD_KEYS.manualResolution] !== void 0;
    }
    function isForcedRefreshRateActiveFor(target) {
      if (!isWindowsPlatform())
        return false;
      const opt = getOverrideStringFor(target, DD_KEYS.refreshRateOption);
      if (opt === "manual")
        return true;
      const o = getOverridesSource(target);
      return !!o && typeof o === "object" && !Array.isArray(o) && o[DD_KEYS.manualRefreshRate] !== void 0;
    }
    function isForcedHdrActiveFor(target) {
      if (!isWindowsPlatform())
        return false;
      const req = getOverrideStringFor(target, DD_KEYS.hdrRequestOverride);
      return req === "force_on" || req === "force_off";
    }
    const forcedResolution = computed(
      () => getOverrideStringFor("live", DD_KEYS.manualResolution) ?? ""
    );
    const forcedRefreshRate = computed(
      () => getOverrideStringFor("live", DD_KEYS.manualRefreshRate) ?? ""
    );
    const draftForcedResolution = computed(
      () => getOverrideStringFor("draft", DD_KEYS.manualResolution) ?? ""
    );
    const draftForcedRefreshRate = computed(
      () => getOverrideStringFor("draft", DD_KEYS.manualRefreshRate) ?? ""
    );
    const forcedHdrOptions = [
      { label: "On", value: "on" },
      { label: "Off", value: "off" }
    ];
    const forcedHdr = computed(() => {
      const req = getOverrideStringFor("live", DD_KEYS.hdrRequestOverride);
      return req === "force_off" ? "off" : "on";
    });
    const draftForcedHdr = computed(() => {
      const req = getOverrideStringFor("draft", DD_KEYS.hdrRequestOverride);
      return req === "force_off" ? "off" : "on";
    });
    function setForcedResolutionFor(target, value) {
      if (!isWindowsPlatform())
        return;
      ensureDdEnabledForDisplayOverrides(target);
      setOverrideKeyFor(target, DD_KEYS.resolutionOption, "manual");
      setOverrideKeyFor(target, DD_KEYS.manualResolution, String(value ?? ""));
    }
    function clearForcedResolutionFor(target) {
      clearOverrideKeyFor(target, DD_KEYS.resolutionOption);
      clearOverrideKeyFor(target, DD_KEYS.manualResolution);
      cleanupDdConfigurationOptionIfUnused(target);
    }
    function setForcedRefreshRateFor(target, value) {
      if (!isWindowsPlatform())
        return;
      ensureDdEnabledForDisplayOverrides(target);
      setOverrideKeyFor(target, DD_KEYS.refreshRateOption, "manual");
      setOverrideKeyFor(target, DD_KEYS.manualRefreshRate, String(value ?? ""));
    }
    function clearForcedRefreshRateFor(target) {
      clearOverrideKeyFor(target, DD_KEYS.refreshRateOption);
      clearOverrideKeyFor(target, DD_KEYS.manualRefreshRate);
      cleanupDdConfigurationOptionIfUnused(target);
    }
    function setForcedHdrFor(target, value) {
      if (!isWindowsPlatform())
        return;
      ensureDdEnabledForDisplayOverrides(target);
      setOverrideKeyFor(target, DD_KEYS.hdrOption, "auto");
      setOverrideKeyFor(target, DD_KEYS.hdrRequestOverride, value === "off" ? "force_off" : "force_on");
    }
    function clearForcedHdrFor(target) {
      clearOverrideKeyFor(target, DD_KEYS.hdrRequestOverride);
      clearOverrideKeyFor(target, DD_KEYS.hdrOption);
      cleanupDdConfigurationOptionIfUnused(target);
    }
    const activeSyntheticKeys = computed(() => {
      const keys = [];
      if (isForcedResolutionActiveFor("live"))
        keys.push(SYN_KEYS.configureDisplayResolution);
      if (isForcedRefreshRateActiveFor("live"))
        keys.push(SYN_KEYS.configureDisplayRefreshRate);
      if (isForcedHdrActiveFor("live"))
        keys.push(SYN_KEYS.configureDisplayHdr);
      return keys;
    });
    const draftSyntheticKeys = computed(() => {
      const keys = [];
      if (isForcedResolutionActiveFor("draft"))
        keys.push(SYN_KEYS.configureDisplayResolution);
      if (isForcedRefreshRateActiveFor("draft"))
        keys.push(SYN_KEYS.configureDisplayRefreshRate);
      if (isForcedHdrActiveFor("draft"))
        keys.push(SYN_KEYS.configureDisplayHdr);
      return keys;
    });
    const showResetAll = computed(
      () => overrideKeys.value.length > 0 || activeSyntheticKeys.value.length > 0
    );
    function addSyntheticOverrideFor(target, key) {
      if (!isWindowsPlatform())
        return;
      if (key === SYN_KEYS.configureDisplayResolution) {
        setForcedResolutionFor(
          target,
          target === "draft" ? draftForcedResolution.value : forcedResolution.value
        );
      } else if (key === SYN_KEYS.configureDisplayRefreshRate) {
        setForcedRefreshRateFor(
          target,
          target === "draft" ? draftForcedRefreshRate.value : forcedRefreshRate.value
        );
      } else if (key === SYN_KEYS.configureDisplayHdr) {
        setForcedHdrFor(target, target === "draft" ? draftForcedHdr.value : forcedHdr.value);
      }
    }
    function removeSyntheticOverrideFor(target, key) {
      if (key === SYN_KEYS.configureDisplayResolution) {
        clearForcedResolutionFor(target);
      } else if (key === SYN_KEYS.configureDisplayRefreshRate) {
        clearForcedRefreshRateFor(target);
      } else if (key === SYN_KEYS.configureDisplayHdr) {
        clearForcedHdrFor(target);
      }
    }
    function setForcedResolution(value) {
      setForcedResolutionFor("live", value);
    }
    function setDraftForcedResolution(value) {
      setForcedResolutionFor("draft", value);
    }
    function setForcedRefreshRate(value) {
      setForcedRefreshRateFor("live", value);
    }
    function setDraftForcedRefreshRate(value) {
      setForcedRefreshRateFor("draft", value);
    }
    function setForcedHdr(value) {
      setForcedHdrFor("live", value);
    }
    function setDraftForcedHdr(value) {
      setForcedHdrFor("draft", value);
    }
    const allEntries = computed(() => {
      const out = [];
      const tabList = getTabsState();
      const platform = platformKey();
      for (const tab of tabList) {
        const groupId = String((tab == null ? void 0 : tab.id) ?? "");
        const groupName = String((tab == null ? void 0 : tab.name) ?? groupId);
        const options = (tab == null ? void 0 : tab.options) ?? {};
        if (!options || typeof options !== "object")
          continue;
        for (const key of Object.keys(options)) {
          if (!isAllowedKey(key))
            continue;
          const globalValue = getGlobalValue(key);
          const selectOptions2 = getConfigSelectOptions(key, {
            t,
            platform,
            metadata: getMetadataState(),
            currentValue: globalValue
          });
          out.push({
            key,
            label: labelFor(key),
            desc: descFor(key),
            path: `${groupName} > ${labelFor(key)}`,
            groupId,
            groupName,
            globalValue,
            options: selectOptions2,
            optionsText: buildConfigOptionsText(selectOptions2)
          });
        }
      }
      if (platform === "windows") {
        const groupId = "display";
        const groupName = "Display";
        out.push(
          {
            key: SYN_KEYS.configureDisplayResolution,
            label: "Configure Resolution",
            desc: "Configure a specific display resolution during streams (uses display automation behind the scenes).",
            path: `${groupName} > Configure Resolution`,
            groupId,
            groupName,
            synthetic: true,
            globalValue: void 0,
            options: [],
            optionsText: ""
          },
          {
            key: SYN_KEYS.configureDisplayRefreshRate,
            label: "Configure Refresh Rate",
            desc: "Configure a specific display refresh rate during streams (uses display automation behind the scenes).",
            path: `${groupName} > Configure Refresh Rate`,
            groupId,
            groupName,
            synthetic: true,
            globalValue: void 0,
            options: [],
            optionsText: ""
          },
          {
            key: SYN_KEYS.configureDisplayHdr,
            label: "Configure HDR",
            desc: "Configure HDR on or off during streams (uses display automation behind the scenes).",
            path: `${groupName} > Configure HDR`,
            groupId,
            groupName,
            synthetic: true,
            globalValue: void 0,
            options: forcedHdrOptions,
            optionsText: buildConfigOptionsText(forcedHdrOptions)
          }
        );
      }
      return out;
    });
    const searchQuery = ref("");
    const selectedGroupId = ref(ALL_GROUPS_ID);
    function normalizedSearchTerms(query) {
      return String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    }
    function scoreEntryMatch(entry, terms) {
      if (!terms.length)
        return 0;
      const lv = entry.label.toLowerCase();
      const kv = entry.key.toLowerCase();
      const pv = entry.path.toLowerCase();
      const dv = (entry.desc || "").toLowerCase();
      const ov = (entry.optionsText || "").toLowerCase();
      let total = 0;
      for (const term of terms) {
        let score = 0;
        if (lv.includes(term)) {
          score += 100 - lv.indexOf(term);
          if (lv.startsWith(term))
            score += 40;
        } else if (kv.includes(term)) {
          score += 85 - kv.indexOf(term);
          if (kv.startsWith(term))
            score += 30;
        } else if (ov.includes(term)) {
          score += 55 - ov.indexOf(term) / 10;
        } else if (pv.includes(term)) {
          score += 40 - pv.indexOf(term) / 50;
        } else if (dv.includes(term)) {
          score += 20 - dv.indexOf(term) / 200;
        } else {
          return 0;
        }
        total += score;
      }
      total -= (pv.length + dv.length + ov.length) / 1500;
      return total;
    }
    const searchTerms = computed(() => normalizedSearchTerms(searchQuery.value));
    const usedOverrideKeys = computed(
      () => /* @__PURE__ */ new Set([...visibleOverrideKeys.value, ...activeSyntheticKeys.value])
    );
    const pendingAddKeys = ref([]);
    const pickerPane = ref("browse");
    const modalUsedOverrideKeys = computed(
      () => /* @__PURE__ */ new Set([...visibleDraftOverrideKeys.value, ...draftSyntheticKeys.value])
    );
    const pickerReservedKeys = computed(
      () => browseModalOpen.value ? modalUsedOverrideKeys.value : usedOverrideKeys.value
    );
    watch(
      overrides,
      (value) => {
        const normalized = normalizeOverrideRecord(value);
        if (!overrideRecordsEqual(value, normalized)) {
          replaceOverridesFor("live", normalized);
        }
      },
      { immediate: true }
    );
    const availableEntries = computed(
      () => allEntries.value.filter(
        (entry) => !pickerReservedKeys.value.has(entry.key) && !isHiddenOverrideKey(entry.key)
      )
    );
    const groupOrder = computed(() => {
      const order = /* @__PURE__ */ new Map();
      for (const entry of allEntries.value) {
        if (!order.has(entry.groupId)) {
          order.set(entry.groupId, order.size);
        }
      }
      return order;
    });
    const availableGroups = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      for (const entry of availableEntries.value) {
        const existing = groups.get(entry.groupId);
        if (existing) {
          existing.count += 1;
        } else {
          groups.set(entry.groupId, {
            id: entry.groupId,
            name: entry.groupName,
            count: 1
          });
        }
      }
      return Array.from(groups.values()).sort(
        (a, b) => (groupOrder.value.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (groupOrder.value.get(b.id) ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name)
      );
    });
    watch(
      availableGroups,
      (groups) => {
        if (selectedGroupId.value === ALL_GROUPS_ID)
          return;
        if (!groups.some((group) => group.id === selectedGroupId.value)) {
          selectedGroupId.value = ALL_GROUPS_ID;
        }
      },
      { immediate: true }
    );
    const filteredAvailableGroups = computed(() => {
      const grouped = /* @__PURE__ */ new Map();
      for (const entry of availableEntries.value) {
        if (selectedGroupId.value !== ALL_GROUPS_ID && entry.groupId !== selectedGroupId.value) {
          continue;
        }
        const matchScore = searchTerms.value.length ? scoreEntryMatch(entry, searchTerms.value) : 1;
        if (searchTerms.value.length && matchScore <= 0) {
          continue;
        }
        const bucket = grouped.get(entry.groupId) ?? [];
        bucket.push({
          ...entry,
          matchScore
        });
        grouped.set(entry.groupId, bucket);
      }
      return Array.from(grouped.entries()).map(([groupId, entries]) => {
        var _a;
        return {
          id: groupId,
          name: ((_a = entries[0]) == null ? void 0 : _a.groupName) ?? groupId,
          entries: entries.sort(
            (a, b) => searchTerms.value.length ? b.matchScore - a.matchScore || a.label.localeCompare(b.label) : a.label.localeCompare(b.label)
          )
        };
      }).sort(
        (a, b) => (groupOrder.value.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (groupOrder.value.get(b.id) ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name)
      );
    });
    const filteredAvailableCount = computed(
      () => filteredAvailableGroups.value.reduce((total, group) => total + group.entries.length, 0)
    );
    const browseHasMultipleGroups = computed(() => availableGroups.value.length > 1);
    const browseResultsScrollRef = ref(null);
    const hasFilterControls = computed(
      () => searchTerms.value.length > 0 || selectedGroupId.value !== ALL_GROUPS_ID
    );
    const compactPickerFooterText = computed(
      () => pickerPane.value === "editor" ? "Review and fine-tune the picked settings, then save when you are done." : "Browse supported settings and add what you need. Open Configure Picks when you are ready to review them."
    );
    async function scrollBrowseResultsToTop() {
      await nextTick();
      if (browseResultsScrollRef.value)
        browseResultsScrollRef.value.scrollTop = 0;
    }
    function setPickerPane(pane) {
      pickerPane.value = pane;
    }
    function pickerPaneClass(pane) {
      return [pickerPane.value === pane ? "flex" : "hidden", "xl:flex"];
    }
    function pickerPaneToggleClass(pane) {
      return [
        "inline-flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
        pickerPane.value === pane ? "border-primary/35 bg-primary/10 text-primary shadow-sm" : "border-dark/10 bg-light/70 text-dark/75 hover:border-primary/25 hover:text-primary dark:border-light/10 dark:bg-surface/60 dark:text-light/80"
      ];
    }
    function selectAvailableGroup(groupId) {
      selectedGroupId.value = groupId;
      void scrollBrowseResultsToTop();
    }
    function resetFilters() {
      searchQuery.value = "";
      selectedGroupId.value = ALL_GROUPS_ID;
      void scrollBrowseResultsToTop();
    }
    function resetAddSettingsState() {
      pendingAddKeys.value = [];
      draftOverrides.value = {};
      draftJsonDrafts.value = {};
      draftJsonErrors.value = {};
      pickerPane.value = "browse";
      resetFilters();
    }
    function openAddSettings() {
      replaceOverridesFor("draft", getOverridesSource("live"));
      pendingAddKeys.value = [];
      draftJsonDrafts.value = {};
      draftJsonErrors.value = {};
      pickerPane.value = "browse";
      resetFilters();
      browseModalOpen.value = true;
    }
    function cancelAddSettings() {
      browseModalOpen.value = false;
      resetAddSettingsState();
    }
    function addFirstFilteredEntry() {
      var _a;
      const first = (_a = filteredAvailableGroups.value[0]) == null ? void 0 : _a.entries[0];
      if (first) {
        queueOverrideAddition(first.key);
      }
    }
    function addOverrideToDraft(key) {
      if (isHiddenOverrideKey(key))
        return;
      if (isSyntheticKey(key)) {
        addSyntheticOverrideFor("draft", key);
        return;
      }
      if (!isAllowedKey(key))
        return;
      ensureOverridesObjectFor("draft");
      if (draftOverrides.value[key] !== void 0)
        return;
      const current = getGlobalValue(key);
      draftOverrides.value[key] = cloneValue(current);
    }
    function queueOverrideAddition(key) {
      if (isHiddenOverrideKey(key))
        return;
      if (!isSyntheticKey(key) && !isAllowedKey(key))
        return;
      if (modalUsedOverrideKeys.value.has(key))
        return;
      addOverrideToDraft(key);
      if (!usedOverrideKeys.value.has(key) && !pendingAddKeys.value.includes(key)) {
        pendingAddKeys.value = [...pendingAddKeys.value, key];
      }
    }
    function savePendingAdditions() {
      commitAllJsonFor("draft");
      replaceOverridesFor("live", draftOverrides.value ?? {});
      browseModalOpen.value = false;
      resetAddSettingsState();
    }
    function removeOverride(key) {
      if (isSyntheticKey(key)) {
        removeSyntheticOverrideFor("live", key);
        return;
      }
      clearOverrideKey(key);
    }
    function removeDraftOverride(key) {
      if (isSyntheticKey(key)) {
        removeSyntheticOverrideFor("draft", key);
      } else {
        clearOverrideKeyFor("draft", key);
      }
      pendingAddKeys.value = pendingAddKeys.value.filter((value) => value !== key);
    }
    function clearAll() {
      replaceOverridesFor("live", {});
      jsonDrafts.value = {};
      jsonErrors.value = {};
    }
    function mapEntries(keys) {
      const byKey = new Map(allEntries.value.map((e) => [e.key, e]));
      return Array.from(new Set(keys)).map((k) => {
        const base = byKey.get(k);
        return {
          key: k,
          label: (base == null ? void 0 : base.label) ?? prettifyKey(k),
          desc: (base == null ? void 0 : base.desc) ?? "",
          path: (base == null ? void 0 : base.path) ?? k,
          groupId: (base == null ? void 0 : base.groupId) ?? "unknown",
          groupName: (base == null ? void 0 : base.groupName) ?? "Unknown",
          synthetic: base == null ? void 0 : base.synthetic,
          globalValue: base == null ? void 0 : base.globalValue,
          options: (base == null ? void 0 : base.options) ?? [],
          optionsText: (base == null ? void 0 : base.optionsText) ?? ""
        };
      }).sort((a, b) => a.path.localeCompare(b.path));
    }
    const overrideEntries = computed(
      () => mapEntries([...visibleOverrideKeys.value, ...activeSyntheticKeys.value])
    );
    const modalOverrideEntries = computed(
      () => mapEntries([...visibleDraftOverrideKeys.value, ...draftSyntheticKeys.value])
    );
    const activeOverrideCount = computed(() => overrideEntries.value.length);
    function formatValue(v) {
      if (v === null)
        return "null";
      if (v === void 0)
        return "-";
      if (typeof v === "string")
        return v.length > 120 ? `${v.slice(0, 117)}...` : v;
      try {
        const s = JSON.stringify(v);
        return s.length > 120 ? `${s.slice(0, 117)}...` : s;
      } catch {
        return String(v);
      }
    }
    function formatValueForKey(key, value) {
      const options = getConfigSelectOptions(key, {
        t,
        platform: platformKey(),
        metadata: getMetadataState(),
        currentValue: value
      });
      if (options.length) {
        const found = options.find((o) => o.value === value);
        if (found) {
          const raw = String(found.value ?? "");
          if (raw === "")
            return found.label || raw;
          if (found.label && found.label !== raw)
            return `${found.label} (${raw})`;
          return raw;
        }
      }
      return formatValue(value);
    }
    function rawOverrideValueFor(target, key) {
      var _a;
      return (_a = getOverridesSource(target)) == null ? void 0 : _a[key];
    }
    function rawOverrideValue(key) {
      return rawOverrideValueFor("live", key);
    }
    function entryTypeLabel(key) {
      if (isSyntheticKey(key))
        return "Shortcut";
      switch (editorKind(key, browseModalOpen.value ? "draft" : "live")) {
        case "boolean":
          return "Toggle";
        case "select":
          return "Choice";
        case "number":
          return "Number";
        case "json":
          return "JSON";
        default:
          return "Text";
      }
    }
    function filterNavClass(active) {
      return [
        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
        active ? "border-primary/35 bg-primary/10 text-primary shadow-sm" : "border-dark/10 dark:border-light/10 bg-light/80 dark:bg-surface/60 hover:border-primary/25 hover:text-primary"
      ];
    }
    const BOOL_STRING_PAIRS = [
      ["enabled", "disabled"],
      ["enable", "disable"],
      ["yes", "no"],
      ["on", "off"],
      ["true", "false"],
      ["1", "0"]
    ];
    const NUMERIC_OVERRIDE_KEYS = /* @__PURE__ */ new Set(["frame_limiter_fps_limit"]);
    function boolPairFromValue(value) {
      if (value === true || value === false)
        return { truthy: true, falsy: false };
      if (value === 1 || value === 0)
        return { truthy: 1, falsy: 0 };
      if (typeof value !== "string")
        return null;
      const norm = value.toLowerCase().trim();
      for (const [t2, f] of BOOL_STRING_PAIRS) {
        if (norm === t2 || norm === f) {
          return { truthy: t2, falsy: f, truthyNorm: t2, falsyNorm: f };
        }
      }
      return null;
    }
    function selectOptions(key, target = "live") {
      const cur = rawOverrideValueFor(target, key);
      const global = getGlobalValue(key);
      const currentValue = cur !== void 0 ? cur : global;
      return getConfigSelectOptions(key, {
        t,
        platform: platformKey(),
        metadata: getMetadataState(),
        currentValue
      });
    }
    function editorKind(key, target = "live") {
      const opts = selectOptions(key, target);
      if (opts && opts.length)
        return "select";
      const gv = getGlobalValue(key);
      if (NUMERIC_OVERRIDE_KEYS.has(key))
        return "number";
      if (typeof gv === "number")
        return "number";
      if (boolPairFromValue(gv))
        return "boolean";
      if (typeof gv === "string")
        return "string";
      if (gv && typeof gv === "object")
        return "json";
      const ov = rawOverrideValueFor(target, key);
      if (typeof ov === "number")
        return "number";
      if (boolPairFromValue(ov))
        return "boolean";
      if (typeof ov === "string")
        return "string";
      if (ov && typeof ov === "object")
        return "json";
      return "string";
    }
    function overridePlaceholder(key, target = "live") {
      switch (editorKind(key, target)) {
        case "number":
          return "(number)";
        case "string":
          return "(value)";
        default:
          return "";
      }
    }
    function setRenderedOverrideValueFor(target, key, value) {
      const kind = editorKind(key, target);
      if (value === null || value === void 0) {
        if (kind === "number" || kind === "select") {
          if (target === "draft") {
            removeDraftOverride(key);
          } else {
            removeOverride(key);
          }
          return;
        }
        setOverrideKeyFor(target, key, value);
        return;
      }
      if (kind === "number") {
        if (typeof value === "number" && Number.isFinite(value)) {
          setOverrideKeyFor(target, key, value);
          return;
        }
        if (typeof value === "string") {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) {
            setOverrideKeyFor(target, key, parsed);
          }
        }
        return;
      }
      if (kind === "string") {
        setOverrideKeyFor(target, key, String(value));
        return;
      }
      setOverrideKeyFor(target, key, value);
    }
    function setRenderedOverrideValue(key, value) {
      setRenderedOverrideValueFor("live", key, value);
    }
    const jsonDrafts = ref({});
    const jsonErrors = ref({});
    const draftJsonDrafts = ref({});
    const draftJsonErrors = ref({});
    function clearJsonStateFor(target, key) {
      const drafts = target === "draft" ? draftJsonDrafts : jsonDrafts;
      const errors = target === "draft" ? draftJsonErrors : jsonErrors;
      const d = { ...drafts.value };
      const e = { ...errors.value };
      delete d[key];
      delete e[key];
      drafts.value = d;
      errors.value = e;
    }
    function jsonDraftFor(target, key) {
      const drafts = target === "draft" ? draftJsonDrafts : jsonDrafts;
      if (Object.prototype.hasOwnProperty.call(drafts.value, key)) {
        return drafts.value[key] ?? "";
      }
      const cur = rawOverrideValueFor(target, key);
      let text = "";
      try {
        text = JSON.stringify(cur, null, 2);
      } catch {
        text = String(cur ?? "");
      }
      drafts.value = { ...drafts.value, [key]: text };
      return text;
    }
    function jsonDraft(key) {
      return jsonDraftFor("live", key);
    }
    function updateJsonDraftFor(target, key, value) {
      const drafts = target === "draft" ? draftJsonDrafts : jsonDrafts;
      drafts.value = { ...drafts.value, [key]: String(value ?? "") };
    }
    function updateJsonDraft(key, value) {
      updateJsonDraftFor("live", key, value);
    }
    function jsonErrorFor(target, key) {
      const errors = target === "draft" ? draftJsonErrors : jsonErrors;
      return errors.value[key] || "";
    }
    function jsonError(key) {
      return jsonErrorFor("live", key);
    }
    function commitJsonFor(target, key) {
      const drafts = target === "draft" ? draftJsonDrafts : jsonDrafts;
      const errors = target === "draft" ? draftJsonErrors : jsonErrors;
      const raw = (drafts.value[key] ?? "").trim();
      if (!raw) {
        if (target === "draft") {
          removeDraftOverride(key);
        } else {
          removeOverride(key);
        }
        errors.value = { ...errors.value, [key]: "" };
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        setOverrideKeyFor(target, key, parsed);
        errors.value = { ...errors.value, [key]: "" };
      } catch (e) {
        errors.value = {
          ...errors.value,
          [key]: (e == null ? void 0 : e.message) ? String(e.message) : "Invalid JSON"
        };
      }
    }
    function commitJson(key) {
      commitJsonFor("live", key);
    }
    function commitAllJsonFor(target) {
      const drafts = target === "draft" ? draftJsonDrafts.value : jsonDrafts.value;
      for (const key of Object.keys(drafts)) {
        commitJsonFor(target, key);
      }
    }
    return (_ctx, _cache) => {
      const _component_n_tag = NTag;
      return openBlock(), createElementBlock(
        Fragment,
        null,
        [
          createBaseVNode("section", _hoisted_1, [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                _cache[11] || (_cache[11] = createBaseVNode(
                  "h3",
                  { class: "text-base font-semibold text-dark dark:text-light" },
                  "Setting Overrides",
                  -1
                  /* CACHED */
                )),
                createBaseVNode(
                  "p",
                  _hoisted_4,
                  toDisplayString(descriptionText.value),
                  1
                  /* TEXT */
                )
              ]),
              createBaseVNode("div", _hoisted_5, [
                createVNode(_component_n_tag, {
                  size: "small",
                  type: "primary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(activeOverrideCount.value) + " active",
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }),
                createVNode(unref(NButton), {
                  size: "small",
                  type: "primary",
                  onClick: openAddSettings
                }, {
                  default: withCtx(() => _cache[12] || (_cache[12] = [
                    createTextVNode(
                      "Add Setting",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [12]
                }),
                showResetAll.value ? (openBlock(), createBlock(unref(NButton), {
                  key: 0,
                  size: "small",
                  tertiary: "",
                  onClick: clearAll
                }, {
                  default: withCtx(() => _cache[13] || (_cache[13] = [
                    createTextVNode(
                      "Delete All",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [13]
                })) : createCommentVNode("v-if", true)
              ])
            ]),
            createBaseVNode("div", _hoisted_6, [
              createBaseVNode("div", _hoisted_7, [
                createBaseVNode("div", _hoisted_8, [
                  _cache[14] || (_cache[14] = createBaseVNode(
                    "h4",
                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                    "Active Overrides",
                    -1
                    /* CACHED */
                  )),
                  createBaseVNode(
                    "p",
                    _hoisted_9,
                    " Adjust the values below to override the current global setting only for this " + toDisplayString(scopeSummaryLabel.value) + ". ",
                    1
                    /* TEXT */
                  )
                ]),
                createBaseVNode(
                  "div",
                  _hoisted_10,
                  toDisplayString(activeOverrideCount.value) + " configured ",
                  1
                  /* TEXT */
                )
              ]),
              overrideEntries.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_11, [
                createBaseVNode(
                  "div",
                  _hoisted_12,
                  "No " + toDisplayString(scopeSummaryLabel.value) + "-specific overrides yet.",
                  1
                  /* TEXT */
                ),
                _cache[16] || (_cache[16] = createBaseVNode(
                  "p",
                  { class: "mx-auto max-w-xl text-xs leading-relaxed opacity-60" },
                  " Add settings from the picker, then tune them here using the same controls as the main configuration tabs. ",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NButton), {
                  size: "small",
                  type: "primary",
                  onClick: openAddSettings
                }, {
                  default: withCtx(() => _cache[15] || (_cache[15] = [
                    createTextVNode(
                      "Add Setting",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [15]
                })
              ])) : (openBlock(), createElementBlock("div", _hoisted_13, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(overrideEntries.value, (entry) => {
                    return openBlock(), createElementBlock("div", {
                      key: entry.key,
                      class: "px-4 py-4"
                    }, [
                      isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayResolution ? (openBlock(), createBlock(ConfigInputField, {
                        key: 0,
                        id: entry.key,
                        label: entry.label,
                        desc: entry.desc,
                        size: "small",
                        monospace: "",
                        placeholder: "e.g. 1920x1080",
                        "model-value": forcedResolution.value,
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = (v) => setForcedResolution(String(v || "")))
                      }, {
                        actions: withCtx(() => [
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            onClick: ($event) => removeOverride(entry.key)
                          }, {
                            default: withCtx(() => [..._cache[17] || (_cache[17] = [
                              createTextVNode(
                                "Delete",
                                -1
                                /* CACHED */
                              )
                            ])]),
                            _: 2,
                            __: [17]
                          }, 1032, ["onClick"])
                        ]),
                        meta: withCtx(() => [
                          createBaseVNode("span", _hoisted_14, [
                            createBaseVNode(
                              "span",
                              _hoisted_15,
                              toDisplayString(entry.key),
                              1
                              /* TEXT */
                            ),
                            createTextVNode(
                              " · " + toDisplayString(entry.groupName),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["id", "label", "desc", "model-value"])) : isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayRefreshRate ? (openBlock(), createBlock(ConfigInputField, {
                        key: 1,
                        id: entry.key,
                        label: entry.label,
                        desc: entry.desc,
                        size: "small",
                        monospace: "",
                        inputmode: "numeric",
                        placeholder: "e.g. 60",
                        "model-value": forcedRefreshRate.value,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = (v) => setForcedRefreshRate(String(v || "")))
                      }, {
                        actions: withCtx(() => [
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            onClick: ($event) => removeOverride(entry.key)
                          }, {
                            default: withCtx(() => [..._cache[18] || (_cache[18] = [
                              createTextVNode(
                                "Delete",
                                -1
                                /* CACHED */
                              )
                            ])]),
                            _: 2,
                            __: [18]
                          }, 1032, ["onClick"])
                        ]),
                        meta: withCtx(() => [
                          createBaseVNode("span", _hoisted_16, [
                            createBaseVNode(
                              "span",
                              _hoisted_17,
                              toDisplayString(entry.key),
                              1
                              /* TEXT */
                            ),
                            createTextVNode(
                              " · " + toDisplayString(entry.groupName),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["id", "label", "desc", "model-value"])) : isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayHdr ? (openBlock(), createBlock(ConfigSelectField, {
                        key: 2,
                        id: entry.key,
                        label: entry.label,
                        desc: entry.desc,
                        size: "small",
                        options: forcedHdrOptions,
                        "model-value": forcedHdr.value,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = (v) => setForcedHdr(String(v || "")))
                      }, {
                        actions: withCtx(() => [
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            onClick: ($event) => removeOverride(entry.key)
                          }, {
                            default: withCtx(() => [..._cache[19] || (_cache[19] = [
                              createTextVNode(
                                "Delete",
                                -1
                                /* CACHED */
                              )
                            ])]),
                            _: 2,
                            __: [19]
                          }, 1032, ["onClick"])
                        ]),
                        meta: withCtx(() => [
                          createBaseVNode("span", _hoisted_18, [
                            createBaseVNode(
                              "span",
                              _hoisted_19,
                              toDisplayString(entry.key),
                              1
                              /* TEXT */
                            ),
                            createTextVNode(
                              " · " + toDisplayString(entry.groupName),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["id", "label", "desc", "model-value"])) : editorKind(entry.key) !== "json" ? (openBlock(), createBlock(ConfigFieldRenderer, {
                        key: 3,
                        "setting-key": entry.key,
                        label: entry.label,
                        desc: entry.desc,
                        options: selectOptions(entry.key),
                        "default-value": entry.globalValue,
                        size: "small",
                        "model-value": rawOverrideValue(entry.key),
                        placeholder: overridePlaceholder(entry.key),
                        filterable: editorKind(entry.key) === "select",
                        monospace: editorKind(entry.key) === "string",
                        "onUpdate:modelValue": (v) => setRenderedOverrideValue(entry.key, v)
                      }, {
                        actions: withCtx(() => [
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            onClick: ($event) => removeOverride(entry.key)
                          }, {
                            default: withCtx(() => [..._cache[20] || (_cache[20] = [
                              createTextVNode(
                                "Delete",
                                -1
                                /* CACHED */
                              )
                            ])]),
                            _: 2,
                            __: [20]
                          }, 1032, ["onClick"])
                        ]),
                        meta: withCtx(() => [
                          createBaseVNode("span", _hoisted_20, [
                            createBaseVNode(
                              "span",
                              _hoisted_21,
                              toDisplayString(entry.key),
                              1
                              /* TEXT */
                            ),
                            createTextVNode(
                              " · " + toDisplayString(entry.groupName) + " · ",
                              1
                              /* TEXT */
                            )
                          ]),
                          createBaseVNode("span", null, [
                            _cache[21] || (_cache[21] = createTextVNode(
                              " Inherited: ",
                              -1
                              /* CACHED */
                            )),
                            createBaseVNode(
                              "span",
                              _hoisted_22,
                              toDisplayString(formatValueForKey(entry.key, entry.globalValue)),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["setting-key", "label", "desc", "options", "default-value", "model-value", "placeholder", "filterable", "monospace", "onUpdate:modelValue"])) : (openBlock(), createBlock(ConfigInputField, {
                        key: 4,
                        id: entry.key,
                        label: entry.label,
                        desc: entry.desc,
                        type: "textarea",
                        size: "small",
                        monospace: "",
                        autosize: { minRows: 2, maxRows: 10 },
                        placeholder: "JSON value",
                        "model-value": jsonDraft(entry.key),
                        "onUpdate:modelValue": (v) => updateJsonDraft(entry.key, v),
                        onBlur: () => commitJson(entry.key)
                      }, {
                        actions: withCtx(() => [
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            onClick: ($event) => removeOverride(entry.key)
                          }, {
                            default: withCtx(() => [..._cache[22] || (_cache[22] = [
                              createTextVNode(
                                "Delete",
                                -1
                                /* CACHED */
                              )
                            ])]),
                            _: 2,
                            __: [22]
                          }, 1032, ["onClick"])
                        ]),
                        meta: withCtx(() => [
                          createBaseVNode("span", _hoisted_23, [
                            createBaseVNode(
                              "span",
                              _hoisted_24,
                              toDisplayString(entry.key),
                              1
                              /* TEXT */
                            ),
                            createTextVNode(
                              " · " + toDisplayString(entry.groupName) + " · ",
                              1
                              /* TEXT */
                            )
                          ]),
                          createBaseVNode("span", null, [
                            _cache[23] || (_cache[23] = createTextVNode(
                              " Inherited: ",
                              -1
                              /* CACHED */
                            )),
                            createBaseVNode(
                              "span",
                              _hoisted_25,
                              toDisplayString(formatValueForKey(entry.key, entry.globalValue)),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        default: withCtx(() => [
                          jsonError(entry.key) ? (openBlock(), createElementBlock(
                            "div",
                            _hoisted_26,
                            toDisplayString(jsonError(entry.key)),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true)
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["id", "label", "desc", "model-value", "onUpdate:modelValue", "onBlur"]))
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]))
            ])
          ]),
          (openBlock(), createBlock(Teleport, { to: "body" }, [
            browseModalOpen.value ? (openBlock(), createElementBlock("div", _hoisted_27, [
              _cache[51] || (_cache[51] = createBaseVNode(
                "div",
                { class: "absolute inset-0 bg-dark/50 dark:bg-black/70" },
                null,
                -1
                /* CACHED */
              )),
              createBaseVNode("div", _hoisted_28, [
                createBaseVNode("div", _hoisted_29, [
                  createBaseVNode("div", _hoisted_30, [
                    createBaseVNode("div", _hoisted_31, [
                      createVNode(unref(NButton), {
                        size: "small",
                        quaternary: "",
                        onClick: cancelAddSettings
                      }, {
                        default: withCtx(() => [
                          createVNode(LucideIcon, {
                            name: "fa-arrow-left",
                            size: 12
                          }),
                          _cache[24] || (_cache[24] = createBaseVNode(
                            "span",
                            { class: "ml-1" },
                            "Back",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        _: 1,
                        __: [24]
                      }),
                      createBaseVNode("div", _hoisted_32, [
                        _cache[25] || (_cache[25] = createBaseVNode(
                          "div",
                          { class: "text-base font-semibold text-dark dark:text-light" },
                          " Add Setting Overrides ",
                          -1
                          /* CACHED */
                        )),
                        createBaseVNode(
                          "p",
                          _hoisted_33,
                          " Browse all supported settings, stage the ones you want, then save to add them to this " + toDisplayString(scopeSummaryLabel.value) + ". ",
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_34, [
                      createBaseVNode(
                        "button",
                        {
                          type: "button",
                          class: normalizeClass(pickerPaneToggleClass("browse")),
                          onClick: _cache[3] || (_cache[3] = ($event) => setPickerPane("browse"))
                        },
                        [
                          _cache[26] || (_cache[26] = createBaseVNode(
                            "span",
                            null,
                            "Browse Settings",
                            -1
                            /* CACHED */
                          )),
                          createBaseVNode(
                            "span",
                            _hoisted_35,
                            toDisplayString(filteredAvailableCount.value),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          type: "button",
                          class: normalizeClass(pickerPaneToggleClass("editor")),
                          onClick: _cache[4] || (_cache[4] = ($event) => setPickerPane("editor"))
                        },
                        [
                          _cache[27] || (_cache[27] = createBaseVNode(
                            "span",
                            null,
                            "Configure Picks",
                            -1
                            /* CACHED */
                          )),
                          createBaseVNode(
                            "span",
                            _hoisted_36,
                            toDisplayString(modalOverrideEntries.value.length),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    _cache[28] || (_cache[28] = createBaseVNode(
                      "div",
                      { class: "text-xs leading-relaxed opacity-60 xl:hidden" },
                      " Browse supported settings first, then switch to Configure Picks when you want to review or fine-tune what you selected. ",
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                createBaseVNode("div", _hoisted_37, [
                  createBaseVNode("div", _hoisted_38, [
                    createBaseVNode(
                      "aside",
                      {
                        class: normalizeClass([pickerPaneClass("editor"), "min-h-0 flex-col rounded-xl border border-dark/10 dark:border-light/10 bg-light/70 dark:bg-white/5"])
                      },
                      [
                        createBaseVNode("div", _hoisted_39, [
                          createBaseVNode("div", _hoisted_40, [
                            _cache[29] || (_cache[29] = createBaseVNode(
                              "div",
                              { class: "space-y-1" },
                              [
                                createBaseVNode("h4", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, " Override Editor "),
                                createBaseVNode("p", { class: "text-xs leading-relaxed opacity-60" }, " Added settings appear here immediately so you can refine them before saving. ")
                              ],
                              -1
                              /* CACHED */
                            )),
                            createBaseVNode(
                              "div",
                              _hoisted_41,
                              toDisplayString(modalOverrideEntries.value.length),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_42, [
                          modalOverrideEntries.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_43, [
                            createBaseVNode("div", _hoisted_44, [
                              createBaseVNode("div", _hoisted_45, [
                                createVNode(LucideIcon, {
                                  name: "fa-hand-point-right",
                                  size: 16
                                })
                              ]),
                              _cache[30] || (_cache[30] = createBaseVNode(
                                "div",
                                { class: "mt-3 text-sm font-medium" },
                                "Start by picking settings from the browser.",
                                -1
                                /* CACHED */
                              )),
                              _cache[31] || (_cache[31] = createBaseVNode(
                                "p",
                                { class: "mx-auto mt-2 max-w-xl text-xs leading-relaxed opacity-60" },
                                " Select a section or search on the right, click Add on the settings you want, then refine them here before saving. ",
                                -1
                                /* CACHED */
                              )),
                              _cache[32] || (_cache[32] = createBaseVNode(
                                "div",
                                { class: "mx-auto mt-4 max-w-sm rounded-xl border border-dark/10 bg-dark/5 p-3 text-left dark:border-light/10 dark:bg-light/5" },
                                [
                                  createBaseVNode("div", { class: "text-xs font-semibold uppercase tracking-wide opacity-60" }, " Getting started "),
                                  createBaseVNode("ol", { class: "mt-2 space-y-1 text-xs leading-relaxed opacity-70" }, [
                                    createBaseVNode("li", null, "1. Search or pick a section on the right."),
                                    createBaseVNode("li", null, "2. Click Add on each setting you want to override."),
                                    createBaseVNode("li", null, "3. Review the selected list here, then save.")
                                  ])
                                ],
                                -1
                                /* CACHED */
                              ))
                            ])
                          ])) : (openBlock(), createElementBlock("div", _hoisted_46, [
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(modalOverrideEntries.value, (entry) => {
                                return openBlock(), createElementBlock("div", {
                                  key: entry.key,
                                  class: "px-4 py-4"
                                }, [
                                  isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayResolution ? (openBlock(), createBlock(ConfigInputField, {
                                    key: 0,
                                    id: `modal-${entry.key}`,
                                    label: entry.label,
                                    desc: entry.desc,
                                    size: "small",
                                    monospace: "",
                                    placeholder: "e.g. 1920x1080",
                                    "model-value": draftForcedResolution.value,
                                    "onUpdate:modelValue": _cache[5] || (_cache[5] = (v) => setDraftForcedResolution(String(v || "")))
                                  }, {
                                    actions: withCtx(() => [
                                      createVNode(unref(NButton), {
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => removeDraftOverride(entry.key)
                                      }, {
                                        default: withCtx(() => [..._cache[33] || (_cache[33] = [
                                          createTextVNode(
                                            " Delete ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])]),
                                        _: 2,
                                        __: [33]
                                      }, 1032, ["onClick"])
                                    ]),
                                    meta: withCtx(() => [
                                      createBaseVNode("span", _hoisted_47, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_48,
                                          toDisplayString(entry.key),
                                          1
                                          /* TEXT */
                                        ),
                                        createTextVNode(
                                          " · " + toDisplayString(entry.groupName),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["id", "label", "desc", "model-value"])) : isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayRefreshRate ? (openBlock(), createBlock(ConfigInputField, {
                                    key: 1,
                                    id: `modal-${entry.key}`,
                                    label: entry.label,
                                    desc: entry.desc,
                                    size: "small",
                                    monospace: "",
                                    inputmode: "numeric",
                                    placeholder: "e.g. 60",
                                    "model-value": draftForcedRefreshRate.value,
                                    "onUpdate:modelValue": _cache[6] || (_cache[6] = (v) => setDraftForcedRefreshRate(String(v || "")))
                                  }, {
                                    actions: withCtx(() => [
                                      createVNode(unref(NButton), {
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => removeDraftOverride(entry.key)
                                      }, {
                                        default: withCtx(() => [..._cache[34] || (_cache[34] = [
                                          createTextVNode(
                                            " Delete ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])]),
                                        _: 2,
                                        __: [34]
                                      }, 1032, ["onClick"])
                                    ]),
                                    meta: withCtx(() => [
                                      createBaseVNode("span", _hoisted_49, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_50,
                                          toDisplayString(entry.key),
                                          1
                                          /* TEXT */
                                        ),
                                        createTextVNode(
                                          " · " + toDisplayString(entry.groupName),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["id", "label", "desc", "model-value"])) : isSyntheticKey(entry.key) && entry.key === SYN_KEYS.configureDisplayHdr ? (openBlock(), createBlock(ConfigSelectField, {
                                    key: 2,
                                    id: `modal-${entry.key}`,
                                    label: entry.label,
                                    desc: entry.desc,
                                    size: "small",
                                    options: forcedHdrOptions,
                                    "model-value": draftForcedHdr.value,
                                    "onUpdate:modelValue": _cache[7] || (_cache[7] = (v) => setDraftForcedHdr(String(v || "")))
                                  }, {
                                    actions: withCtx(() => [
                                      createVNode(unref(NButton), {
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => removeDraftOverride(entry.key)
                                      }, {
                                        default: withCtx(() => [..._cache[35] || (_cache[35] = [
                                          createTextVNode(
                                            " Delete ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])]),
                                        _: 2,
                                        __: [35]
                                      }, 1032, ["onClick"])
                                    ]),
                                    meta: withCtx(() => [
                                      createBaseVNode("span", _hoisted_51, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_52,
                                          toDisplayString(entry.key),
                                          1
                                          /* TEXT */
                                        ),
                                        createTextVNode(
                                          " · " + toDisplayString(entry.groupName),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["id", "label", "desc", "model-value"])) : editorKind(entry.key, "draft") !== "json" ? (openBlock(), createBlock(ConfigFieldRenderer, {
                                    key: 3,
                                    "setting-key": entry.key,
                                    label: entry.label,
                                    desc: entry.desc,
                                    options: selectOptions(entry.key, "draft"),
                                    "default-value": entry.globalValue,
                                    size: "small",
                                    "model-value": rawOverrideValueFor("draft", entry.key),
                                    placeholder: overridePlaceholder(entry.key, "draft"),
                                    filterable: editorKind(entry.key, "draft") === "select",
                                    monospace: editorKind(entry.key, "draft") === "string",
                                    "onUpdate:modelValue": (v) => setRenderedOverrideValueFor("draft", entry.key, v)
                                  }, {
                                    actions: withCtx(() => [
                                      createVNode(unref(NButton), {
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => removeDraftOverride(entry.key)
                                      }, {
                                        default: withCtx(() => [..._cache[36] || (_cache[36] = [
                                          createTextVNode(
                                            " Delete ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])]),
                                        _: 2,
                                        __: [36]
                                      }, 1032, ["onClick"])
                                    ]),
                                    meta: withCtx(() => [
                                      createBaseVNode("span", _hoisted_53, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_54,
                                          toDisplayString(entry.key),
                                          1
                                          /* TEXT */
                                        ),
                                        createTextVNode(
                                          " · " + toDisplayString(entry.groupName) + " · ",
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createBaseVNode("span", null, [
                                        _cache[37] || (_cache[37] = createTextVNode(
                                          " Inherited: ",
                                          -1
                                          /* CACHED */
                                        )),
                                        createBaseVNode(
                                          "span",
                                          _hoisted_55,
                                          toDisplayString(formatValueForKey(entry.key, entry.globalValue)),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["setting-key", "label", "desc", "options", "default-value", "model-value", "placeholder", "filterable", "monospace", "onUpdate:modelValue"])) : (openBlock(), createBlock(ConfigInputField, {
                                    key: 4,
                                    id: `modal-${entry.key}`,
                                    label: entry.label,
                                    desc: entry.desc,
                                    type: "textarea",
                                    size: "small",
                                    monospace: "",
                                    autosize: { minRows: 2, maxRows: 10 },
                                    placeholder: "JSON value",
                                    "model-value": jsonDraftFor("draft", entry.key),
                                    "onUpdate:modelValue": (v) => updateJsonDraftFor("draft", entry.key, v),
                                    onBlur: () => commitJsonFor("draft", entry.key)
                                  }, {
                                    actions: withCtx(() => [
                                      createVNode(unref(NButton), {
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => removeDraftOverride(entry.key)
                                      }, {
                                        default: withCtx(() => [..._cache[38] || (_cache[38] = [
                                          createTextVNode(
                                            " Delete ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])]),
                                        _: 2,
                                        __: [38]
                                      }, 1032, ["onClick"])
                                    ]),
                                    meta: withCtx(() => [
                                      createBaseVNode("span", _hoisted_56, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_57,
                                          toDisplayString(entry.key),
                                          1
                                          /* TEXT */
                                        ),
                                        createTextVNode(
                                          " · " + toDisplayString(entry.groupName) + " · ",
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createBaseVNode("span", null, [
                                        _cache[39] || (_cache[39] = createTextVNode(
                                          " Inherited: ",
                                          -1
                                          /* CACHED */
                                        )),
                                        createBaseVNode(
                                          "span",
                                          _hoisted_58,
                                          toDisplayString(formatValueForKey(entry.key, entry.globalValue)),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    default: withCtx(() => [
                                      jsonErrorFor("draft", entry.key) ? (openBlock(), createElementBlock(
                                        "div",
                                        _hoisted_59,
                                        toDisplayString(jsonErrorFor("draft", entry.key)),
                                        1
                                        /* TEXT */
                                      )) : createCommentVNode("v-if", true)
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["id", "label", "desc", "model-value", "onUpdate:modelValue", "onBlur"]))
                                ]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ]))
                        ])
                      ],
                      2
                      /* CLASS */
                    ),
                    createBaseVNode(
                      "div",
                      {
                        class: normalizeClass([pickerPaneClass("browse"), "min-h-0 min-w-0 flex-col rounded-xl border border-dark/10 dark:border-light/10 bg-white/60 dark:bg-white/5"])
                      },
                      [
                        createBaseVNode("div", _hoisted_60, [
                          createBaseVNode("div", _hoisted_61, [
                            createBaseVNode("div", _hoisted_62, [
                              _cache[40] || (_cache[40] = createBaseVNode(
                                "div",
                                { class: "space-y-1" },
                                [
                                  createBaseVNode("h4", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, " Browse Available Settings "),
                                  createBaseVNode("p", { class: "text-xs opacity-70 leading-relaxed" }, " Explore every supported override by section. Search is optional and only narrows the list. ")
                                ],
                                -1
                                /* CACHED */
                              )),
                              createBaseVNode("div", _hoisted_63, [
                                createTextVNode(
                                  toDisplayString(filteredAvailableCount.value) + " showing ",
                                  1
                                  /* TEXT */
                                ),
                                filteredAvailableCount.value !== availableEntries.value.length ? (openBlock(), createElementBlock(
                                  "span",
                                  _hoisted_64,
                                  " of " + toDisplayString(availableEntries.value.length),
                                  1
                                  /* TEXT */
                                )) : createCommentVNode("v-if", true)
                              ])
                            ]),
                            createBaseVNode("div", _hoisted_65, [
                              createVNode(unref(__unplugin_components_0), {
                                value: searchQuery.value,
                                "onUpdate:value": _cache[8] || (_cache[8] = ($event) => searchQuery.value = $event),
                                type: "text",
                                clearable: "",
                                class: "min-w-0 flex-1",
                                placeholder: "Filter by setting name, key, description, or option value",
                                onKeydown: withKeys(withModifiers(addFirstFilteredEntry, ["prevent"]), ["enter"])
                              }, {
                                suffix: withCtx(() => [
                                  createVNode(LucideIcon, {
                                    name: "fa-magnifying-glass",
                                    size: 12,
                                    class: "opacity-60"
                                  })
                                ]),
                                _: 1
                                /* STABLE */
                              }, 8, ["value", "onKeydown"]),
                              hasFilterControls.value ? (openBlock(), createBlock(unref(NButton), {
                                key: 0,
                                size: "small",
                                tertiary: "",
                                class: "self-start md:shrink-0",
                                onClick: resetFilters
                              }, {
                                default: withCtx(() => _cache[41] || (_cache[41] = [
                                  createTextVNode(
                                    " Clear Filters ",
                                    -1
                                    /* CACHED */
                                  )
                                ])),
                                _: 1,
                                __: [41]
                              })) : createCommentVNode("v-if", true)
                            ])
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_66, [
                          createBaseVNode("div", _hoisted_67, [
                            browseHasMultipleGroups.value ? (openBlock(), createElementBlock("aside", _hoisted_68, [
                              createBaseVNode("div", _hoisted_69, [
                                createBaseVNode("div", _hoisted_70, [
                                  _cache[43] || (_cache[43] = createBaseVNode(
                                    "div",
                                    { class: "px-2 pb-2 text-xs font-semibold uppercase tracking-wide opacity-60" },
                                    " Sections ",
                                    -1
                                    /* CACHED */
                                  )),
                                  createBaseVNode("div", _hoisted_71, [
                                    createBaseVNode(
                                      "button",
                                      {
                                        type: "button",
                                        class: normalizeClass(filterNavClass(selectedGroupId.value === ALL_GROUPS_ID)),
                                        onClick: _cache[9] || (_cache[9] = ($event) => selectAvailableGroup(ALL_GROUPS_ID))
                                      },
                                      [
                                        _cache[42] || (_cache[42] = createBaseVNode(
                                          "span",
                                          { class: "truncate" },
                                          "All sections",
                                          -1
                                          /* CACHED */
                                        )),
                                        createBaseVNode(
                                          "span",
                                          _hoisted_72,
                                          toDisplayString(availableEntries.value.length),
                                          1
                                          /* TEXT */
                                        )
                                      ],
                                      2
                                      /* CLASS */
                                    ),
                                    (openBlock(true), createElementBlock(
                                      Fragment,
                                      null,
                                      renderList(availableGroups.value, (group) => {
                                        return openBlock(), createElementBlock("button", {
                                          key: group.id,
                                          type: "button",
                                          class: normalizeClass(filterNavClass(selectedGroupId.value === group.id)),
                                          onClick: ($event) => selectAvailableGroup(group.id)
                                        }, [
                                          createBaseVNode(
                                            "span",
                                            _hoisted_74,
                                            toDisplayString(group.name),
                                            1
                                            /* TEXT */
                                          ),
                                          createBaseVNode(
                                            "span",
                                            _hoisted_75,
                                            toDisplayString(group.count),
                                            1
                                            /* TEXT */
                                          )
                                        ], 10, _hoisted_73);
                                      }),
                                      128
                                      /* KEYED_FRAGMENT */
                                    ))
                                  ])
                                ])
                              ])
                            ])) : createCommentVNode("v-if", true),
                            createBaseVNode("div", _hoisted_76, [
                              createBaseVNode(
                                "div",
                                {
                                  ref_key: "browseResultsScrollRef",
                                  ref: browseResultsScrollRef,
                                  class: "vb-scroll flex-1 min-h-0"
                                },
                                [
                                  createBaseVNode("div", _hoisted_77, [
                                    browseHasMultipleGroups.value ? (openBlock(), createElementBlock("div", _hoisted_78, [
                                      createBaseVNode(
                                        "button",
                                        {
                                          type: "button",
                                          class: normalizeClass(filterNavClass(selectedGroupId.value === ALL_GROUPS_ID)),
                                          onClick: _cache[10] || (_cache[10] = ($event) => selectAvailableGroup(ALL_GROUPS_ID))
                                        },
                                        [
                                          _cache[44] || (_cache[44] = createBaseVNode(
                                            "span",
                                            { class: "truncate" },
                                            "All sections",
                                            -1
                                            /* CACHED */
                                          )),
                                          createBaseVNode(
                                            "span",
                                            _hoisted_79,
                                            toDisplayString(availableEntries.value.length),
                                            1
                                            /* TEXT */
                                          )
                                        ],
                                        2
                                        /* CLASS */
                                      ),
                                      (openBlock(true), createElementBlock(
                                        Fragment,
                                        null,
                                        renderList(availableGroups.value, (group) => {
                                          return openBlock(), createElementBlock("button", {
                                            key: group.id,
                                            type: "button",
                                            class: normalizeClass(filterNavClass(selectedGroupId.value === group.id)),
                                            onClick: ($event) => selectAvailableGroup(group.id)
                                          }, [
                                            createBaseVNode(
                                              "span",
                                              _hoisted_81,
                                              toDisplayString(group.name),
                                              1
                                              /* TEXT */
                                            ),
                                            createBaseVNode(
                                              "span",
                                              _hoisted_82,
                                              toDisplayString(group.count),
                                              1
                                              /* TEXT */
                                            )
                                          ], 10, _hoisted_80);
                                        }),
                                        128
                                        /* KEYED_FRAGMENT */
                                      ))
                                    ])) : createCommentVNode("v-if", true),
                                    filteredAvailableGroups.value.length ? (openBlock(true), createElementBlock(
                                      Fragment,
                                      { key: 1 },
                                      renderList(filteredAvailableGroups.value, (group) => {
                                        return openBlock(), createElementBlock("section", {
                                          key: group.id,
                                          class: "space-y-1.5"
                                        }, [
                                          createBaseVNode("div", _hoisted_83, [
                                            createBaseVNode(
                                              "h4",
                                              _hoisted_84,
                                              toDisplayString(group.name),
                                              1
                                              /* TEXT */
                                            ),
                                            createBaseVNode(
                                              "span",
                                              _hoisted_85,
                                              toDisplayString(group.entries.length),
                                              1
                                              /* TEXT */
                                            )
                                          ]),
                                          createBaseVNode("div", _hoisted_86, [
                                            (openBlock(true), createElementBlock(
                                              Fragment,
                                              null,
                                              renderList(group.entries, (entry) => {
                                                return openBlock(), createElementBlock("button", {
                                                  key: entry.key,
                                                  type: "button",
                                                  class: "group flex h-full min-h-[8.75rem] flex-col rounded-xl border border-dark/10 dark:border-light/10 bg-light/70 px-3 py-2.5 text-left transition-colors hover:border-primary/35 hover:bg-primary/5 dark:bg-surface/40",
                                                  onClick: ($event) => queueOverrideAddition(entry.key)
                                                }, [
                                                  createBaseVNode("div", _hoisted_88, [
                                                    createBaseVNode("div", _hoisted_89, [
                                                      createBaseVNode(
                                                        "div",
                                                        _hoisted_90,
                                                        toDisplayString(entry.label),
                                                        1
                                                        /* TEXT */
                                                      ),
                                                      createBaseVNode("div", _hoisted_91, [
                                                        createBaseVNode(
                                                          "span",
                                                          null,
                                                          toDisplayString(entry.groupName),
                                                          1
                                                          /* TEXT */
                                                        ),
                                                        _cache[45] || (_cache[45] = createBaseVNode(
                                                          "span",
                                                          { class: "hidden text-[10px] opacity-40 md:inline" },
                                                          "•",
                                                          -1
                                                          /* CACHED */
                                                        )),
                                                        createBaseVNode(
                                                          "span",
                                                          _hoisted_92,
                                                          toDisplayString(entry.key),
                                                          1
                                                          /* TEXT */
                                                        )
                                                      ])
                                                    ]),
                                                    createBaseVNode("div", _hoisted_93, [
                                                      createBaseVNode(
                                                        "span",
                                                        _hoisted_94,
                                                        toDisplayString(entryTypeLabel(entry.key)),
                                                        1
                                                        /* TEXT */
                                                      ),
                                                      createBaseVNode("span", _hoisted_95, [
                                                        createVNode(LucideIcon, {
                                                          name: "fa-plus",
                                                          size: 10
                                                        }),
                                                        _cache[46] || (_cache[46] = createTextVNode(
                                                          " Add ",
                                                          -1
                                                          /* CACHED */
                                                        ))
                                                      ])
                                                    ])
                                                  ]),
                                                  entry.desc ? (openBlock(), createElementBlock(
                                                    "p",
                                                    _hoisted_96,
                                                    toDisplayString(entry.desc),
                                                    1
                                                    /* TEXT */
                                                  )) : createCommentVNode("v-if", true)
                                                ], 8, _hoisted_87);
                                              }),
                                              128
                                              /* KEYED_FRAGMENT */
                                            ))
                                          ])
                                        ]);
                                      }),
                                      128
                                      /* KEYED_FRAGMENT */
                                    )) : (openBlock(), createElementBlock("div", _hoisted_97, [
                                      createBaseVNode(
                                        "div",
                                        _hoisted_98,
                                        toDisplayString(availableEntries.value.length === 0 ? "All supported settings are already added." : "No settings match the current filters."),
                                        1
                                        /* TEXT */
                                      ),
                                      createBaseVNode(
                                        "p",
                                        _hoisted_99,
                                        toDisplayString(availableEntries.value.length === 0 ? "Delete an existing override to free up its setting slot." : "Try a broader term or switch back to all sections."),
                                        1
                                        /* TEXT */
                                      ),
                                      hasFilterControls.value ? (openBlock(), createBlock(unref(NButton), {
                                        key: 0,
                                        size: "small",
                                        tertiary: "",
                                        onClick: resetFilters
                                      }, {
                                        default: withCtx(() => _cache[47] || (_cache[47] = [
                                          createTextVNode(
                                            " Reset Filters ",
                                            -1
                                            /* CACHED */
                                          )
                                        ])),
                                        _: 1,
                                        __: [47]
                                      })) : createCommentVNode("v-if", true)
                                    ]))
                                  ])
                                ],
                                512
                                /* NEED_PATCH */
                              )
                            ])
                          ])
                        ])
                      ],
                      2
                      /* CLASS */
                    )
                  ])
                ]),
                createBaseVNode("div", _hoisted_100, [
                  createBaseVNode("div", _hoisted_101, [
                    createBaseVNode("div", _hoisted_102, [
                      createBaseVNode(
                        "span",
                        _hoisted_103,
                        toDisplayString(compactPickerFooterText.value),
                        1
                        /* TEXT */
                      ),
                      _cache[48] || (_cache[48] = createBaseVNode(
                        "span",
                        { class: "hidden xl:inline" },
                        " Review the override fields, then save when you are done. ",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    createBaseVNode("div", _hoisted_104, [
                      createVNode(unref(NButton), {
                        size: "small",
                        tertiary: "",
                        onClick: cancelAddSettings
                      }, {
                        default: withCtx(() => _cache[49] || (_cache[49] = [
                          createTextVNode(
                            "Cancel",
                            -1
                            /* CACHED */
                          )
                        ])),
                        _: 1,
                        __: [49]
                      }),
                      createVNode(unref(NButton), {
                        size: "small",
                        type: "primary",
                        onClick: savePendingAdditions
                      }, {
                        default: withCtx(() => [
                          _cache[50] || (_cache[50] = createBaseVNode(
                            "span",
                            null,
                            "Save",
                            -1
                            /* CACHED */
                          )),
                          createBaseVNode(
                            "span",
                            _hoisted_105,
                            toDisplayString(modalOverrideEntries.value.length),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 1,
                        __: [50]
                      })
                    ])
                  ])
                ])
              ])
            ])) : createCommentVNode("v-if", true)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      );
    };
  }
});
const AppEditConfigOverridesSection_vue_vue_type_style_index_0_scoped_8c5c3ff1_lang = "";
const AppEditConfigOverridesSection = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8c5c3ff1"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditConfigOverridesSection.vue"]]);
export {
  AppEditConfigOverridesSection as A
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwRWRpdENvbmZpZ092ZXJyaWRlc1NlY3Rpb24tYjM5YmJmNGQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2NvbXBvbmVudHMvYXBwLWVkaXQvQXBwRWRpdENvbmZpZ092ZXJyaWRlc1NlY3Rpb24udnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cclxuICA8c2VjdGlvblxyXG4gICAgY2xhc3M9XCJyb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctbGlnaHQvNjAgZGFyazpiZy1zdXJmYWNlLzQwIHAtNCBzcGFjZS15LTRcIlxyXG4gID5cclxuICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0zIG1kOmZsZXgtcm93IG1kOml0ZW1zLXN0YXJ0IG1kOmp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgPGgzIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlNldHRpbmcgT3ZlcnJpZGVzPC9oMz5cclxuICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgbGVhZGluZy1yZWxheGVkIG9wYWNpdHktNzBcIj57eyBkZXNjcmlwdGlvblRleHQgfX08L3A+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgPG4tdGFnIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJwcmltYXJ5XCI+e3sgYWN0aXZlT3ZlcnJpZGVDb3VudCB9fSBhY3RpdmU8L24tdGFnPlxyXG4gICAgICAgIDxuLWJ1dHRvbiBzaXplPVwic21hbGxcIiB0eXBlPVwicHJpbWFyeVwiIEBjbGljaz1cIm9wZW5BZGRTZXR0aW5nc1wiPkFkZCBTZXR0aW5nPC9uLWJ1dHRvbj5cclxuICAgICAgICA8bi1idXR0b24gdi1pZj1cInNob3dSZXNldEFsbFwiIHNpemU9XCJzbWFsbFwiIHRlcnRpYXJ5IEBjbGljaz1cImNsZWFyQWxsXCI+RGVsZXRlIEFsbDwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiBjbGFzcz1cIm1pbi13LTAgc3BhY2UteS0zXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0yIHNtOmZsZXgtcm93IHNtOml0ZW1zLWNlbnRlciBzbTpqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgICA8aDQgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPkFjdGl2ZSBPdmVycmlkZXM8L2g0PlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjAgbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgIEFkanVzdCB0aGUgdmFsdWVzIGJlbG93IHRvIG92ZXJyaWRlIHRoZSBjdXJyZW50IGdsb2JhbCBzZXR0aW5nIG9ubHkgZm9yIHRoaXNcclxuICAgICAgICAgICAge3sgc2NvcGVTdW1tYXJ5TGFiZWwgfX0uXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWZ1bGwgYmctZGFyay81IGRhcms6YmctbGlnaHQvMTAgcHgtMyBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gb3BhY2l0eS03MFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge3sgYWN0aXZlT3ZlcnJpZGVDb3VudCB9fSBjb25maWd1cmVkXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIHYtaWY9XCJvdmVycmlkZUVudHJpZXMubGVuZ3RoID09PSAwXCJcclxuICAgICAgICBjbGFzcz1cInJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXNoZWQgYm9yZGVyLWRhcmsvMTUgZGFyazpib3JkZXItbGlnaHQvMTUgcHgtNCBweS04IHRleHQtY2VudGVyIHNwYWNlLXktM1wiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBmb250LW1lZGl1bVwiPk5vIHt7IHNjb3BlU3VtbWFyeUxhYmVsIH19LXNwZWNpZmljIG92ZXJyaWRlcyB5ZXQuPC9kaXY+XHJcbiAgICAgICAgPHAgY2xhc3M9XCJteC1hdXRvIG1heC13LXhsIHRleHQteHMgbGVhZGluZy1yZWxheGVkIG9wYWNpdHktNjBcIj5cclxuICAgICAgICAgIEFkZCBzZXR0aW5ncyBmcm9tIHRoZSBwaWNrZXIsIHRoZW4gdHVuZSB0aGVtIGhlcmUgdXNpbmcgdGhlIHNhbWUgY29udHJvbHMgYXMgdGhlIG1haW5cclxuICAgICAgICAgIGNvbmZpZ3VyYXRpb24gdGFicy5cclxuICAgICAgICA8L3A+XHJcbiAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJwcmltYXJ5XCIgQGNsaWNrPVwib3BlbkFkZFNldHRpbmdzXCI+QWRkIFNldHRpbmc8L24tYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXZcclxuICAgICAgICB2LWVsc2VcclxuICAgICAgICBjbGFzcz1cInJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLXdoaXRlLzQwIGRhcms6Ymctd2hpdGUvNSBkaXZpZGUteSBkaXZpZGUtZGFyay8xMCBkYXJrOmRpdmlkZS1saWdodC8xMFwiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IHYtZm9yPVwiZW50cnkgaW4gb3ZlcnJpZGVFbnRyaWVzXCIgOmtleT1cImVudHJ5LmtleVwiIGNsYXNzPVwicHgtNCBweS00XCI+XHJcbiAgICAgICAgICA8Q29uZmlnSW5wdXRGaWVsZFxyXG4gICAgICAgICAgICB2LWlmPVwiaXNTeW50aGV0aWNLZXkoZW50cnkua2V5KSAmJiBlbnRyeS5rZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlSZXNvbHV0aW9uXCJcclxuICAgICAgICAgICAgOmlkPVwiZW50cnkua2V5XCJcclxuICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICA6ZGVzYz1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICBtb25vc3BhY2VcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIDE5MjB4MTA4MFwiXHJcbiAgICAgICAgICAgIDptb2RlbC12YWx1ZT1cImZvcmNlZFJlc29sdXRpb25cIlxyXG4gICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwiKHYpID0+IHNldEZvcmNlZFJlc29sdXRpb24oU3RyaW5nKHYgfHwgJycpKVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz5cclxuICAgICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInRpbnlcIiB0ZXJ0aWFyeSBAY2xpY2s9XCJyZW1vdmVPdmVycmlkZShlbnRyeS5rZXkpXCI+RGVsZXRlPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgPHRlbXBsYXRlICNtZXRhPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1vbm9cIj57eyBlbnRyeS5rZXkgfX08L3NwYW4+IMK3IHt7IGVudHJ5Lmdyb3VwTmFtZSB9fVxyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgIDwvQ29uZmlnSW5wdXRGaWVsZD5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnSW5wdXRGaWVsZFxyXG4gICAgICAgICAgICB2LWVsc2UtaWY9XCJcclxuICAgICAgICAgICAgICBpc1N5bnRoZXRpY0tleShlbnRyeS5rZXkpICYmIGVudHJ5LmtleSA9PT0gU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlXHJcbiAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgIDppZD1cImVudHJ5LmtleVwiXHJcbiAgICAgICAgICAgIDpsYWJlbD1cImVudHJ5LmxhYmVsXCJcclxuICAgICAgICAgICAgOmRlc2M9XCJlbnRyeS5kZXNjXCJcclxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgbW9ub3NwYWNlXHJcbiAgICAgICAgICAgIGlucHV0bW9kZT1cIm51bWVyaWNcIlxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cImUuZy4gNjBcIlxyXG4gICAgICAgICAgICA6bW9kZWwtdmFsdWU9XCJmb3JjZWRSZWZyZXNoUmF0ZVwiXHJcbiAgICAgICAgICAgIEB1cGRhdGU6bW9kZWwtdmFsdWU9XCIodikgPT4gc2V0Rm9yY2VkUmVmcmVzaFJhdGUoU3RyaW5nKHYgfHwgJycpKVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz5cclxuICAgICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInRpbnlcIiB0ZXJ0aWFyeSBAY2xpY2s9XCJyZW1vdmVPdmVycmlkZShlbnRyeS5rZXkpXCI+RGVsZXRlPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgPHRlbXBsYXRlICNtZXRhPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1vbm9cIj57eyBlbnRyeS5rZXkgfX08L3NwYW4+IMK3IHt7IGVudHJ5Lmdyb3VwTmFtZSB9fVxyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgIDwvQ29uZmlnSW5wdXRGaWVsZD5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnU2VsZWN0RmllbGRcclxuICAgICAgICAgICAgdi1lbHNlLWlmPVwiaXNTeW50aGV0aWNLZXkoZW50cnkua2V5KSAmJiBlbnRyeS5rZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlIZHJcIlxyXG4gICAgICAgICAgICA6aWQ9XCJlbnRyeS5rZXlcIlxyXG4gICAgICAgICAgICA6bGFiZWw9XCJlbnRyeS5sYWJlbFwiXHJcbiAgICAgICAgICAgIDpkZXNjPVwiZW50cnkuZGVzY1wiXHJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgIDpvcHRpb25zPVwiZm9yY2VkSGRyT3B0aW9uc1wiXHJcbiAgICAgICAgICAgIDptb2RlbC12YWx1ZT1cImZvcmNlZEhkclwiXHJcbiAgICAgICAgICAgIEB1cGRhdGU6bW9kZWwtdmFsdWU9XCIodikgPT4gc2V0Rm9yY2VkSGRyKFN0cmluZyh2IHx8ICcnKSlcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2FjdGlvbnM+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlT3ZlcnJpZGUoZW50cnkua2V5KVwiPkRlbGV0ZTwvbi1idXR0b24+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpZGRlbiBzbTppbmxpbmVcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1tb25vXCI+e3sgZW50cnkua2V5IH19PC9zcGFuPiDCtyB7eyBlbnRyeS5ncm91cE5hbWUgfX1cclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICA8L0NvbmZpZ1NlbGVjdEZpZWxkPlxyXG5cclxuICAgICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgICAgICAgIHYtZWxzZS1pZj1cImVkaXRvcktpbmQoZW50cnkua2V5KSAhPT0gJ2pzb24nXCJcclxuICAgICAgICAgICAgOnNldHRpbmcta2V5PVwiZW50cnkua2V5XCJcclxuICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICA6ZGVzYz1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICA6b3B0aW9ucz1cInNlbGVjdE9wdGlvbnMoZW50cnkua2V5KVwiXHJcbiAgICAgICAgICAgIDpkZWZhdWx0LXZhbHVlPVwiZW50cnkuZ2xvYmFsVmFsdWVcIlxyXG4gICAgICAgICAgICA6c2l6ZT1cIidzbWFsbCdcIlxyXG4gICAgICAgICAgICA6bW9kZWwtdmFsdWU9XCJyYXdPdmVycmlkZVZhbHVlKGVudHJ5LmtleSlcIlxyXG4gICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCJvdmVycmlkZVBsYWNlaG9sZGVyKGVudHJ5LmtleSlcIlxyXG4gICAgICAgICAgICA6ZmlsdGVyYWJsZT1cImVkaXRvcktpbmQoZW50cnkua2V5KSA9PT0gJ3NlbGVjdCdcIlxyXG4gICAgICAgICAgICA6bW9ub3NwYWNlPVwiZWRpdG9yS2luZChlbnRyeS5rZXkpID09PSAnc3RyaW5nJ1wiXHJcbiAgICAgICAgICAgIEB1cGRhdGU6bW9kZWwtdmFsdWU9XCIodikgPT4gc2V0UmVuZGVyZWRPdmVycmlkZVZhbHVlKGVudHJ5LmtleSwgdilcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2FjdGlvbnM+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlT3ZlcnJpZGUoZW50cnkua2V5KVwiPkRlbGV0ZTwvbi1idXR0b24+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpZGRlbiBzbTppbmxpbmVcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1tb25vXCI+e3sgZW50cnkua2V5IH19PC9zcGFuPiDCtyB7eyBlbnRyeS5ncm91cE5hbWUgfX0gwrdcclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPHNwYW4+XHJcbiAgICAgICAgICAgICAgICBJbmhlcml0ZWQ6XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7IGZvcm1hdFZhbHVlRm9yS2V5KGVudHJ5LmtleSwgZW50cnkuZ2xvYmFsVmFsdWUpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgIDwvQ29uZmlnRmllbGRSZW5kZXJlcj5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnSW5wdXRGaWVsZFxyXG4gICAgICAgICAgICB2LWVsc2VcclxuICAgICAgICAgICAgOmlkPVwiZW50cnkua2V5XCJcclxuICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICA6ZGVzYz1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxyXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICBtb25vc3BhY2VcclxuICAgICAgICAgICAgOmF1dG9zaXplPVwieyBtaW5Sb3dzOiAyLCBtYXhSb3dzOiAxMCB9XCJcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJKU09OIHZhbHVlXCJcclxuICAgICAgICAgICAgOm1vZGVsLXZhbHVlPVwianNvbkRyYWZ0KGVudHJ5LmtleSlcIlxyXG4gICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwiKHYpID0+IHVwZGF0ZUpzb25EcmFmdChlbnRyeS5rZXksIHYpXCJcclxuICAgICAgICAgICAgQGJsdXI9XCIoKSA9PiBjb21taXRKc29uKGVudHJ5LmtleSlcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8dGVtcGxhdGUgI2FjdGlvbnM+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlT3ZlcnJpZGUoZW50cnkua2V5KVwiPkRlbGV0ZTwvbi1idXR0b24+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpZGRlbiBzbTppbmxpbmVcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1tb25vXCI+e3sgZW50cnkua2V5IH19PC9zcGFuPiDCtyB7eyBlbnRyeS5ncm91cE5hbWUgfX0gwrdcclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPHNwYW4+XHJcbiAgICAgICAgICAgICAgICBJbmhlcml0ZWQ6XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7IGZvcm1hdFZhbHVlRm9yS2V5KGVudHJ5LmtleSwgZW50cnkuZ2xvYmFsVmFsdWUpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgPGRpdiB2LWlmPVwianNvbkVycm9yKGVudHJ5LmtleSlcIiBjbGFzcz1cInRleHQteHMgdGV4dC1kYW5nZXJcIj5cclxuICAgICAgICAgICAgICB7eyBqc29uRXJyb3IoZW50cnkua2V5KSB9fVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvQ29uZmlnSW5wdXRGaWVsZD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L3NlY3Rpb24+XHJcblxyXG4gIDxUZWxlcG9ydCB0bz1cImJvZHlcIj5cclxuICAgIDxkaXZcclxuICAgICAgdi1pZj1cImJyb3dzZU1vZGFsT3BlblwiXHJcbiAgICAgIGNsYXNzPVwiZml4ZWQgaW5zZXQtMCB6LVsyMTAwXSBweC0yIHB5LTIgbWQ6cHgtMyBtZDpweS0zIHhsOnB4LTUgeGw6cHktNFwiXHJcbiAgICA+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLWRhcmsvNTAgZGFyazpiZy1ibGFjay83MFwiIC8+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cInJlbGF0aXZlIG14LWF1dG8gZmxleCBoLWZ1bGwgbWF4LXctWzExMnJlbV0gZmxleC1jb2wgb3ZlcmZsb3ctaGlkZGVuIHJvdW5kZWQtWzEuNzVyZW1dIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS85NSBzaGFkb3ctMnhsIGRhcms6Ymctc3VyZmFjZS85NVwiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2XHJcbiAgICAgICAgICBjbGFzcz1cInN0aWNreSB0b3AtMCB6LTIwIGJvcmRlci1iIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLXdoaXRlLzk1IHB4LTQgcHktNCBiYWNrZHJvcC1ibHVyIGRhcms6Ymctc3VyZmFjZS85NVwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTNcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggbWluLXctMCBpdGVtcy1zdGFydCBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwic21hbGxcIiBxdWF0ZXJuYXJ5IEBjbGljaz1cImNhbmNlbEFkZFNldHRpbmdzXCI+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtYXJyb3ctbGVmdFwiIDpzaXplPVwiMTJcIiAvPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtbC0xXCI+QmFjazwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIHNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtYmFzZSBmb250LXNlbWlib2xkIHRleHQtZGFyayBkYXJrOnRleHQtbGlnaHRcIj5cclxuICAgICAgICAgICAgICAgICAgQWRkIFNldHRpbmcgT3ZlcnJpZGVzXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBsZWFkaW5nLXJlbGF4ZWQgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICBCcm93c2UgYWxsIHN1cHBvcnRlZCBzZXR0aW5ncywgc3RhZ2UgdGhlIG9uZXMgeW91IHdhbnQsIHRoZW4gc2F2ZSB0byBhZGQgdGhlbSB0b1xyXG4gICAgICAgICAgICAgICAgICB0aGlzIHt7IHNjb3BlU3VtbWFyeUxhYmVsIH19LlxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0yIGdhcC0yIHhsOmhpZGRlblwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgOmNsYXNzPVwicGlja2VyUGFuZVRvZ2dsZUNsYXNzKCdicm93c2UnKVwiXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZXRQaWNrZXJQYW5lKCdicm93c2UnKVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4+QnJvd3NlIFNldHRpbmdzPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyb3VuZGVkLWZ1bGwgYmctZGFyay81IGRhcms6YmctbGlnaHQvMTAgcHgtMiBweS0wLjUgdGV4dC1bMTBweF1cIj5cclxuICAgICAgICAgICAgICAgICAge3sgZmlsdGVyZWRBdmFpbGFibGVDb3VudCB9fVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgOmNsYXNzPVwicGlja2VyUGFuZVRvZ2dsZUNsYXNzKCdlZGl0b3InKVwiXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZXRQaWNrZXJQYW5lKCdlZGl0b3InKVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4+Q29uZmlndXJlIFBpY2tzPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyb3VuZGVkLWZ1bGwgYmctZGFyay81IGRhcms6YmctbGlnaHQvMTAgcHgtMiBweS0wLjUgdGV4dC1bMTBweF1cIj5cclxuICAgICAgICAgICAgICAgICAge3sgbW9kYWxPdmVycmlkZUVudHJpZXMubGVuZ3RoIH19XHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgbGVhZGluZy1yZWxheGVkIG9wYWNpdHktNjAgeGw6aGlkZGVuXCI+XHJcbiAgICAgICAgICAgICAgQnJvd3NlIHN1cHBvcnRlZCBzZXR0aW5ncyBmaXJzdCwgdGhlbiBzd2l0Y2ggdG8gQ29uZmlndXJlIFBpY2tzIHdoZW4geW91IHdhbnQgdG9cclxuICAgICAgICAgICAgICByZXZpZXcgb3IgZmluZS10dW5lIHdoYXQgeW91IHNlbGVjdGVkLlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibWluLWgtMCBmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuIHB4LTMgcHktMyBzbTpweC00IHNtOnB5LTRcIj5cclxuICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgY2xhc3M9XCJncmlkIGgtZnVsbCBtaW4taC0wIGdhcC0zIHNtOmdhcC00IHhsOmdyaWQtY29scy1bbWlubWF4KDI3cmVtLDAuODRmcilfbWlubWF4KDQycmVtLDEuMTZmcildIDJ4bDpncmlkLWNvbHMtW21pbm1heCgyOHJlbSwwLjhmcilfbWlubWF4KDUwcmVtLDEuMmZyKV1cIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8YXNpZGVcclxuICAgICAgICAgICAgICA6Y2xhc3M9XCJwaWNrZXJQYW5lQ2xhc3MoJ2VkaXRvcicpXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cIm1pbi1oLTAgZmxleC1jb2wgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctbGlnaHQvNzAgZGFyazpiZy13aGl0ZS81XCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm9yZGVyLWIgYm9yZGVyLWRhcmsvMTAgcHgtNCBweS00IGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIE92ZXJyaWRlIEVkaXRvclxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgbGVhZGluZy1yZWxheGVkIG9wYWNpdHktNjBcIj5cclxuICAgICAgICAgICAgICAgICAgICBBZGRlZCBzZXR0aW5ncyBhcHBlYXIgaGVyZSBpbW1lZGlhdGVseSBzbyB5b3UgY2FuIHJlZmluZSB0aGVtIGJlZm9yZSBzYXZpbmcuXHJcbiAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtZnVsbCBiZy1wcmltYXJ5LzEwIHB4LTMgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtcHJpbWFyeVwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIHt7IG1vZGFsT3ZlcnJpZGVFbnRyaWVzLmxlbmd0aCB9fVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInZiLXNjcm9sbCBtaW4taC0wIGZsZXgtMVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1pZj1cIm1vZGFsT3ZlcnJpZGVFbnRyaWVzLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwicHgtNCBweS00XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWRhc2hlZCBib3JkZXItZGFyay8xNSBkYXJrOmJvcmRlci1saWdodC8xNSBiZy13aGl0ZS80MCBweC00IHB5LTYgdGV4dC1jZW50ZXIgZGFyazpiZy1zdXJmYWNlLzMwXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibXgtYXV0byBmbGV4IGgtMTEgdy0xMSBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1oYW5kLXBvaW50LXJpZ2h0XCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMyB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+U3RhcnQgYnkgcGlja2luZyBzZXR0aW5ncyBmcm9tIHRoZSBicm93c2VyLjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm14LWF1dG8gbXQtMiBtYXgtdy14bCB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgU2VsZWN0IGEgc2VjdGlvbiBvciBzZWFyY2ggb24gdGhlIHJpZ2h0LCBjbGljayBBZGQgb24gdGhlIHNldHRpbmdzIHlvdSB3YW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoZW4gcmVmaW5lIHRoZW0gaGVyZSBiZWZvcmUgc2F2aW5nLlxyXG4gICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIm14LWF1dG8gbXQtNCBtYXgtdy1zbSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBiZy1kYXJrLzUgcC0zIHRleHQtbGVmdCBkYXJrOmJvcmRlci1saWdodC8xMCBkYXJrOmJnLWxpZ2h0LzVcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICBHZXR0aW5nIHN0YXJ0ZWRcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8b2wgY2xhc3M9XCJtdC0yIHNwYWNlLXktMSB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8bGk+MS4gU2VhcmNoIG9yIHBpY2sgYSBzZWN0aW9uIG9uIHRoZSByaWdodC48L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGxpPjIuIENsaWNrIEFkZCBvbiBlYWNoIHNldHRpbmcgeW91IHdhbnQgdG8gb3ZlcnJpZGUuPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsaT4zLiBSZXZpZXcgdGhlIHNlbGVjdGVkIGxpc3QgaGVyZSwgdGhlbiBzYXZlLjwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9vbD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgdi1lbHNlXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cIm0tNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS82MCBkYXJrOmJnLXN1cmZhY2UvNDAgZGl2aWRlLXkgZGl2aWRlLWRhcmsvMTAgZGFyazpkaXZpZGUtbGlnaHQvMTBcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxkaXYgdi1mb3I9XCJlbnRyeSBpbiBtb2RhbE92ZXJyaWRlRW50cmllc1wiIDprZXk9XCJlbnRyeS5rZXlcIiBjbGFzcz1cInB4LTQgcHktNFwiPlxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnSW5wdXRGaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGlzU3ludGhldGljS2V5KGVudHJ5LmtleSkgJiYgZW50cnkua2V5ID09PSBTWU5fS0VZUy5jb25maWd1cmVEaXNwbGF5UmVzb2x1dGlvblxyXG4gICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmlkPVwiYG1vZGFsLSR7ZW50cnkua2V5fWBcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpsYWJlbD1cImVudHJ5LmxhYmVsXCJcclxuICAgICAgICAgICAgICAgICAgICA6ZGVzYz1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgbW9ub3NwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIDE5MjB4MTA4MFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOm1vZGVsLXZhbHVlPVwiZHJhZnRGb3JjZWRSZXNvbHV0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwiKHYpID0+IHNldERyYWZ0Rm9yY2VkUmVzb2x1dGlvbihTdHJpbmcodiB8fCAnJykpXCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwidGlueVwiIHRlcnRpYXJ5IEBjbGljaz1cInJlbW92ZURyYWZ0T3ZlcnJpZGUoZW50cnkua2V5KVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBEZWxldGVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI21ldGE+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpZGRlbiBzbTppbmxpbmVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1vbm9cIj57eyBlbnRyeS5rZXkgfX08L3NwYW4+IMK3IHt7IGVudHJ5Lmdyb3VwTmFtZSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgIDwvQ29uZmlnSW5wdXRGaWVsZD5cclxuXHJcbiAgICAgICAgICAgICAgICAgIDxDb25maWdJbnB1dEZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBpc1N5bnRoZXRpY0tleShlbnRyeS5rZXkpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5rZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlSZWZyZXNoUmF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmlkPVwiYG1vZGFsLSR7ZW50cnkua2V5fWBcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpsYWJlbD1cImVudHJ5LmxhYmVsXCJcclxuICAgICAgICAgICAgICAgICAgICA6ZGVzYz1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgbW9ub3NwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRtb2RlPVwibnVtZXJpY1wiXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJlLmcuIDYwXCJcclxuICAgICAgICAgICAgICAgICAgICA6bW9kZWwtdmFsdWU9XCJkcmFmdEZvcmNlZFJlZnJlc2hSYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwiKHYpID0+IHNldERyYWZ0Rm9yY2VkUmVmcmVzaFJhdGUoU3RyaW5nKHYgfHwgJycpKVwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI2FjdGlvbnM+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInRpbnlcIiB0ZXJ0aWFyeSBAY2xpY2s9XCJyZW1vdmVEcmFmdE92ZXJyaWRlKGVudHJ5LmtleSlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlICNtZXRhPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJoaWRkZW4gc206aW5saW5lXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1tb25vXCI+e3sgZW50cnkua2V5IH19PC9zcGFuPiDCtyB7eyBlbnRyeS5ncm91cE5hbWUgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICA8L0NvbmZpZ0lucHV0RmllbGQ+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnU2VsZWN0RmllbGRcclxuICAgICAgICAgICAgICAgICAgICB2LWVsc2UtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGlzU3ludGhldGljS2V5KGVudHJ5LmtleSkgJiYgZW50cnkua2V5ID09PSBTWU5fS0VZUy5jb25maWd1cmVEaXNwbGF5SGRyXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICA6aWQ9XCJgbW9kYWwtJHtlbnRyeS5rZXl9YFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpkZXNjPVwiZW50cnkuZGVzY1wiXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cImZvcmNlZEhkck9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgIDptb2RlbC12YWx1ZT1cImRyYWZ0Rm9yY2VkSGRyXCJcclxuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwiKHYpID0+IHNldERyYWZ0Rm9yY2VkSGRyKFN0cmluZyh2IHx8ICcnKSlcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlICNhY3Rpb25zPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlRHJhZnRPdmVycmlkZShlbnRyeS5rZXkpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7IGVudHJ5LmtleSB9fTwvc3Bhbj4gwrcge3sgZW50cnkuZ3JvdXBOYW1lIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgPC9Db25maWdTZWxlY3RGaWVsZD5cclxuXHJcbiAgICAgICAgICAgICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPVwiZWRpdG9yS2luZChlbnRyeS5rZXksICdkcmFmdCcpICE9PSAnanNvbidcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpzZXR0aW5nLWtleT1cImVudHJ5LmtleVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpkZXNjPVwiZW50cnkuZGVzY1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XCJzZWxlY3RPcHRpb25zKGVudHJ5LmtleSwgJ2RyYWZ0JylcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpkZWZhdWx0LXZhbHVlPVwiZW50cnkuZ2xvYmFsVmFsdWVcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpzaXplPVwiJ3NtYWxsJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOm1vZGVsLXZhbHVlPVwicmF3T3ZlcnJpZGVWYWx1ZUZvcignZHJhZnQnLCBlbnRyeS5rZXkpXCJcclxuICAgICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCJvdmVycmlkZVBsYWNlaG9sZGVyKGVudHJ5LmtleSwgJ2RyYWZ0JylcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpmaWx0ZXJhYmxlPVwiZWRpdG9yS2luZChlbnRyeS5rZXksICdkcmFmdCcpID09PSAnc2VsZWN0J1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOm1vbm9zcGFjZT1cImVkaXRvcktpbmQoZW50cnkua2V5LCAnZHJhZnQnKSA9PT0gJ3N0cmluZydcIlxyXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGU6bW9kZWwtdmFsdWU9XCIodikgPT4gc2V0UmVuZGVyZWRPdmVycmlkZVZhbHVlRm9yKCdkcmFmdCcsIGVudHJ5LmtleSwgdilcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlICNhY3Rpb25zPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlRHJhZnRPdmVycmlkZShlbnRyeS5rZXkpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7IGVudHJ5LmtleSB9fTwvc3Bhbj4gwrcge3sgZW50cnkuZ3JvdXBOYW1lIH19IMK3XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgSW5oZXJpdGVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0VmFsdWVGb3JLZXkoZW50cnkua2V5LCBlbnRyeS5nbG9iYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgPC9Db25maWdGaWVsZFJlbmRlcmVyPlxyXG5cclxuICAgICAgICAgICAgICAgICAgPENvbmZpZ0lucHV0RmllbGRcclxuICAgICAgICAgICAgICAgICAgICB2LWVsc2VcclxuICAgICAgICAgICAgICAgICAgICA6aWQ9XCJgbW9kYWwtJHtlbnRyeS5rZXl9YFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxhYmVsPVwiZW50cnkubGFiZWxcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpkZXNjPVwiZW50cnkuZGVzY1wiXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRhcmVhXCJcclxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIG1vbm9zcGFjZVxyXG4gICAgICAgICAgICAgICAgICAgIDphdXRvc2l6ZT1cInsgbWluUm93czogMiwgbWF4Um93czogMTAgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJKU09OIHZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgICA6bW9kZWwtdmFsdWU9XCJqc29uRHJhZnRGb3IoJ2RyYWZ0JywgZW50cnkua2V5KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZTptb2RlbC12YWx1ZT1cIih2KSA9PiB1cGRhdGVKc29uRHJhZnRGb3IoJ2RyYWZ0JywgZW50cnkua2V5LCB2KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgQGJsdXI9XCIoKSA9PiBjb21taXRKc29uRm9yKCdkcmFmdCcsIGVudHJ5LmtleSlcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlICNhY3Rpb25zPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwicmVtb3ZlRHJhZnRPdmVycmlkZShlbnRyeS5rZXkpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7IGVudHJ5LmtleSB9fTwvc3Bhbj4gwrcge3sgZW50cnkuZ3JvdXBOYW1lIH19IMK3XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgSW5oZXJpdGVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtbW9ub1wiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0VmFsdWVGb3JLZXkoZW50cnkua2V5LCBlbnRyeS5nbG9iYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJqc29uRXJyb3JGb3IoJ2RyYWZ0JywgZW50cnkua2V5KVwiIGNsYXNzPVwidGV4dC14cyB0ZXh0LWRhbmdlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAge3sganNvbkVycm9yRm9yKCdkcmFmdCcsIGVudHJ5LmtleSkgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9Db25maWdJbnB1dEZpZWxkPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2FzaWRlPlxyXG5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIDpjbGFzcz1cInBpY2tlclBhbmVDbGFzcygnYnJvd3NlJylcIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwibWluLWgtMCBtaW4tdy0wIGZsZXgtY29sIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLXdoaXRlLzYwIGRhcms6Ymctd2hpdGUvNVwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJvcmRlci1iIGJvcmRlci1kYXJrLzEwIHB4LTQgcHktMyBkYXJrOmJvcmRlci1saWdodC8xMFwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTIuNVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTMgbWQ6ZmxleC1yb3cgbWQ6aXRlbXMtc3RhcnQgbWQ6anVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgQnJvd3NlIEF2YWlsYWJsZSBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICBFeHBsb3JlIGV2ZXJ5IHN1cHBvcnRlZCBvdmVycmlkZSBieSBzZWN0aW9uLiBTZWFyY2ggaXMgb3B0aW9uYWwgYW5kIG9ubHlcclxuICAgICAgICAgICAgICAgICAgICAgIG5hcnJvd3MgdGhlIGxpc3QuXHJcbiAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGYtc3RhcnQgdGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3sgZmlsdGVyZWRBdmFpbGFibGVDb3VudCB9fSBzaG93aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImZpbHRlcmVkQXZhaWxhYmxlQ291bnQgIT09IGF2YWlsYWJsZUVudHJpZXMubGVuZ3RoXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICBvZiB7eyBhdmFpbGFibGVFbnRyaWVzLmxlbmd0aCB9fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMiBtZDpmbGV4LXJvdyBtZDppdGVtcy1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwic2VhcmNoUXVlcnlcIlxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICBjbGVhcmFibGVcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIm1pbi13LTAgZmxleC0xXCJcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkZpbHRlciBieSBzZXR0aW5nIG5hbWUsIGtleSwgZGVzY3JpcHRpb24sIG9yIG9wdGlvbiB2YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgQGtleWRvd24uZW50ZXIucHJldmVudD1cImFkZEZpcnN0RmlsdGVyZWRFbnRyeVwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI3N1ZmZpeD5cclxuICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1tYWduaWZ5aW5nLWdsYXNzXCIgOnNpemU9XCIxMlwiIGNsYXNzPVwib3BhY2l0eS02MFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgPC9uLWlucHV0PlxyXG4gICAgICAgICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICAgICAgICB2LWlmPVwiaGFzRmlsdGVyQ29udHJvbHNcIlxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdGVydGlhcnlcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInNlbGYtc3RhcnQgbWQ6c2hyaW5rLTBcIlxyXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInJlc2V0RmlsdGVyc1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICBDbGVhciBGaWx0ZXJzXHJcbiAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWluLWgtMCBmbGV4LTEgcC0zXCI+XHJcbiAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJncmlkIGgtZnVsbCBtaW4taC0wIGdhcC0zIHhsOmdyaWQtY29scy1bMTIuNXJlbV9taW5tYXgoMCwxZnIpXSAyeGw6Z3JpZC1jb2xzLVsxMy41cmVtX21pbm1heCgwLDFmcildXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8YXNpZGVcclxuICAgICAgICAgICAgICAgICAgdi1pZj1cImJyb3dzZUhhc011bHRpcGxlR3JvdXBzXCJcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJoaWRkZW4gbWluLWgtMCB4bDpmbGV4IHhsOmZsZXgtY29sXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidmItc2Nyb2xsIGZsZXgtMSBtaW4taC0wIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGJnLWxpZ2h0LzcwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGRhcms6Ymctc3VyZmFjZS80MFwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHgtMiBwYi0yIHRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNlY3Rpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz1cImZpbHRlck5hdkNsYXNzKHNlbGVjdGVkR3JvdXBJZCA9PT0gQUxMX0dST1VQU19JRClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNlbGVjdEF2YWlsYWJsZUdyb3VwKEFMTF9HUk9VUFNfSUQpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidHJ1bmNhdGVcIj5BbGwgc2VjdGlvbnM8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1mdWxsIGJnLWRhcmsvNSBkYXJrOmJnLWxpZ2h0LzEwIHB4LTIgcHktMC41IHRleHQtWzEwcHhdIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGF2YWlsYWJsZUVudHJpZXMubGVuZ3RoIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtZm9yPVwiZ3JvdXAgaW4gYXZhaWxhYmxlR3JvdXBzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwiZ3JvdXAuaWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz1cImZpbHRlck5hdkNsYXNzKHNlbGVjdGVkR3JvdXBJZCA9PT0gZ3JvdXAuaWQpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZWxlY3RBdmFpbGFibGVHcm91cChncm91cC5pZClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVuY2F0ZVwiPnt7IGdyb3VwLm5hbWUgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1mdWxsIGJnLWRhcmsvNSBkYXJrOmJnLWxpZ2h0LzEwIHB4LTIgcHktMC41IHRleHQtWzEwcHhdIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGdyb3VwLmNvdW50IH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvYXNpZGU+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1pbi1oLTAgbWluLXctMCBmbGV4IGZsZXgtY29sXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICByZWY9XCJicm93c2VSZXN1bHRzU2Nyb2xsUmVmXCJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInZiLXNjcm9sbCBmbGV4LTEgbWluLWgtMFwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0zIHByLTFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cImJyb3dzZUhhc011bHRpcGxlR3JvdXBzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJncmlkIGdyaWQtY29scy0yIGdhcC0xLjUgeGw6aGlkZGVuXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz1cImZpbHRlck5hdkNsYXNzKHNlbGVjdGVkR3JvdXBJZCA9PT0gQUxMX0dST1VQU19JRClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNlbGVjdEF2YWlsYWJsZUdyb3VwKEFMTF9HUk9VUFNfSUQpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidHJ1bmNhdGVcIj5BbGwgc2VjdGlvbnM8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1mdWxsIGJnLWRhcmsvNSBkYXJrOmJnLWxpZ2h0LzEwIHB4LTIgcHktMC41IHRleHQtWzEwcHhdIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGF2YWlsYWJsZUVudHJpZXMubGVuZ3RoIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtZm9yPVwiZ3JvdXAgaW4gYXZhaWxhYmxlR3JvdXBzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwiZ3JvdXAuaWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz1cImZpbHRlck5hdkNsYXNzKHNlbGVjdGVkR3JvdXBJZCA9PT0gZ3JvdXAuaWQpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZWxlY3RBdmFpbGFibGVHcm91cChncm91cC5pZClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVuY2F0ZVwiPnt7IGdyb3VwLm5hbWUgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1mdWxsIGJnLWRhcmsvNSBkYXJrOmJnLWxpZ2h0LzEwIHB4LTIgcHktMC41IHRleHQtWzEwcHhdIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGdyb3VwLmNvdW50IH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwiZmlsdGVyZWRBdmFpbGFibGVHcm91cHMubGVuZ3RoXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCJncm91cCBpbiBmaWx0ZXJlZEF2YWlsYWJsZUdyb3Vwc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOmtleT1cImdyb3VwLmlkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInNwYWNlLXktMS41XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGdyb3VwLm5hbWUgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS01MFwiPnt7IGdyb3VwLmVudHJpZXMubGVuZ3RoIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBnYXAtMiAyeGw6Z3JpZC1jb2xzLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCJlbnRyeSBpbiBncm91cC5lbnRyaWVzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmtleT1cImVudHJ5LmtleVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImdyb3VwIGZsZXggaC1mdWxsIG1pbi1oLVs4Ljc1cmVtXSBmbGV4LWNvbCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy1saWdodC83MCBweC0zIHB5LTIuNSB0ZXh0LWxlZnQgdHJhbnNpdGlvbi1jb2xvcnMgaG92ZXI6Ym9yZGVyLXByaW1hcnkvMzUgaG92ZXI6YmctcHJpbWFyeS81IGRhcms6Ymctc3VyZmFjZS80MFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInF1ZXVlT3ZlcnJpZGVBZGRpdGlvbihlbnRyeS5rZXkpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1pbi13LTAgc3BhY2UteS0wLjVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgbGVhZGluZy1zbnVnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGVudHJ5LmxhYmVsIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLXgtMiBnYXAteS0wLjUgdGV4dC14cyBvcGFjaXR5LTYwXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgZW50cnkuZ3JvdXBOYW1lIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpZGRlbiB0ZXh0LVsxMHB4XSBvcGFjaXR5LTQwIG1kOmlubGluZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPiZidWxsOzwvc3BhblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIGJyZWFrLWFsbCBmb250LW1vbm8gbWQ6YmxvY2tcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyBlbnRyeS5rZXkgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggc2hyaW5rLTAgaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtZnVsbCBiZy1kYXJrLzUgZGFyazpiZy1saWdodC8xMCBweC0yIHB5LTEgdGV4dC1bMTBweF0gZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3sgZW50cnlUeXBlTGFiZWwoZW50cnkua2V5KSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgcm91bmRlZC1mdWxsIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBiZy1wcmltYXJ5LzEwIHB4LTIgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtcHJpbWFyeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1wbHVzXCIgOnNpemU9XCIxMFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cImVudHJ5LmRlc2NcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibXQtMiB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTcwXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGVudHJ5LmRlc2MgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFzaGVkIGJvcmRlci1kYXJrLzE1IGRhcms6Ym9yZGVyLWxpZ2h0LzE1IHB4LTQgcHktNiB0ZXh0LWNlbnRlciBzcGFjZS15LTJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVFbnRyaWVzLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdBbGwgc3VwcG9ydGVkIHNldHRpbmdzIGFyZSBhbHJlYWR5IGFkZGVkLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnTm8gc2V0dGluZ3MgbWF0Y2ggdGhlIGN1cnJlbnQgZmlsdGVycy4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVFbnRyaWVzLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdEZWxldGUgYW4gZXhpc3Rpbmcgb3ZlcnJpZGUgdG8gZnJlZSB1cCBpdHMgc2V0dGluZyBzbG90LidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnVHJ5IGEgYnJvYWRlciB0ZXJtIG9yIHN3aXRjaCBiYWNrIHRvIGFsbCBzZWN0aW9ucy4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bi1idXR0b24gdi1pZj1cImhhc0ZpbHRlckNvbnRyb2xzXCIgc2l6ZT1cInNtYWxsXCIgdGVydGlhcnkgQGNsaWNrPVwicmVzZXRGaWx0ZXJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzZXQgRmlsdGVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIGNsYXNzPVwic3RpY2t5IGJvdHRvbS0wIHotMjAgYm9yZGVyLXQgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctd2hpdGUvOTUgcHgtNCBweS0zIGJhY2tkcm9wLWJsdXIgZGFyazpiZy1zdXJmYWNlLzk1XCJcclxuICAgICAgPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0zIHNtOmZsZXgtcm93IHNtOml0ZW1zLWNlbnRlciBzbTpqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwieGw6aGlkZGVuXCI+e3sgY29tcGFjdFBpY2tlckZvb3RlclRleHQgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlkZGVuIHhsOmlubGluZVwiPlxyXG4gICAgICAgICAgICAgIFJldmlldyB0aGUgb3ZlcnJpZGUgZmllbGRzLCB0aGVuIHNhdmUgd2hlbiB5b3UgYXJlIGRvbmUuXHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdGVydGlhcnkgQGNsaWNrPVwiY2FuY2VsQWRkU2V0dGluZ3NcIj5DYW5jZWw8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdHlwZT1cInByaW1hcnlcIiBAY2xpY2s9XCJzYXZlUGVuZGluZ0FkZGl0aW9uc1wiPlxyXG4gICAgICAgICAgICAgIDxzcGFuPlNhdmU8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWwtMiBpbmxpbmUtZmxleCBtaW4tdy1bMS41cmVtXSBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcm91bmRlZC1mdWxsIGJnLXdoaXRlLzIwIHB4LTEuNSBweS0wLjUgdGV4dC1bMTBweF0gZm9udC1zZW1pYm9sZFwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3sgbW9kYWxPdmVycmlkZUVudHJpZXMubGVuZ3RoIH19XHJcbiAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIDwvVGVsZXBvcnQ+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgQ29uZmlnRmllbGRSZW5kZXJlciBmcm9tICdAL0NvbmZpZ0ZpZWxkUmVuZGVyZXIudnVlJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuaW1wb3J0IENvbmZpZ0lucHV0RmllbGQgZnJvbSAnQC9Db25maWdJbnB1dEZpZWxkLnZ1ZSc7XHJcbmltcG9ydCBDb25maWdTZWxlY3RGaWVsZCBmcm9tICdAL0NvbmZpZ1NlbGVjdEZpZWxkLnZ1ZSc7XHJcbmltcG9ydCB7IGNvbXB1dGVkLCBuZXh0VGljaywgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCB7IE5CdXR0b24sIE5JbnB1dCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQge1xyXG4gIGJ1aWxkT3ZlcnJpZGVPcHRpb25zVGV4dCxcclxuICBnZXRPdmVycmlkZVNlbGVjdE9wdGlvbnMsXHJcbiAgdHlwZSBPdmVycmlkZVNlbGVjdE9wdGlvbixcclxufSBmcm9tICcuL2NvbmZpZ092ZXJyaWRlT3B0aW9ucyc7XHJcblxyXG50eXBlIEVudHJ5ID0ge1xyXG4gIGtleTogc3RyaW5nO1xyXG4gIGxhYmVsOiBzdHJpbmc7XHJcbiAgZGVzYzogc3RyaW5nO1xyXG4gIHBhdGg6IHN0cmluZztcclxuICBncm91cElkOiBzdHJpbmc7XHJcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XHJcbiAgc3ludGhldGljPzogYm9vbGVhbjtcclxuICBnbG9iYWxWYWx1ZTogdW5rbm93bjtcclxuICBvcHRpb25zOiBPdmVycmlkZVNlbGVjdE9wdGlvbltdO1xyXG4gIG9wdGlvbnNUZXh0OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIEF2YWlsYWJsZUdyb3VwID0ge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGNvdW50OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIFNjb3JlZEVudHJ5ID0gRW50cnkgJiB7XHJcbiAgbWF0Y2hTY29yZTogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBGaWx0ZXJlZEdyb3VwID0ge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGVudHJpZXM6IFNjb3JlZEVudHJ5W107XHJcbn07XHJcblxyXG50eXBlIEVkaXRUYXJnZXQgPSAnbGl2ZScgfCAnZHJhZnQnO1xyXG5cclxuY29uc3Qgb3ZlcnJpZGVzID0gZGVmaW5lTW9kZWw8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCdvdmVycmlkZXMnLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xyXG5jb25zdCBicm93c2VNb2RhbE9wZW4gPSBkZWZpbmVNb2RlbDxib29sZWFuPigncGlja2VyT3BlbicsIHsgZGVmYXVsdDogZmFsc2UgfSk7XHJcbmNvbnN0IGRyYWZ0T3ZlcnJpZGVzID0gcmVmPFJlY29yZDxzdHJpbmcsIHVua25vd24+Pih7fSk7XHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5cclxuY29uc3QgcHJvcHMgPSB3aXRoRGVmYXVsdHMoXHJcbiAgZGVmaW5lUHJvcHM8e1xyXG4gICAgc2NvcGVMYWJlbD86IHN0cmluZztcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIH0+KCksXHJcbiAge1xyXG4gICAgc2NvcGVMYWJlbDogJ2FwcGxpY2F0aW9uJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICB9LFxyXG4pO1xyXG5cclxuY29uc3QgZGVzY3JpcHRpb25UZXh0ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChwcm9wcy5kZXNjcmlwdGlvbikgcmV0dXJuIHByb3BzLmRlc2NyaXB0aW9uO1xyXG4gIGNvbnN0IHNjb3BlID0gU3RyaW5nKHByb3BzLnNjb3BlTGFiZWwgfHwgJ2FwcGxpY2F0aW9uJylcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAudHJpbSgpO1xyXG4gIGlmIChzY29wZSA9PT0gJ2NsaWVudCcpIHtcclxuICAgIHJldHVybiAnT3ZlcnJpZGUgZ2xvYmFsIHNldHRpbmdzIGZvciB0aGlzIGNsaWVudC4gQ2xpZW50IG92ZXJyaWRlcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhcHAgb3ZlcnJpZGVzIGFuZCBnbG9iYWwgY29uZmlnLic7XHJcbiAgfVxyXG4gIHJldHVybiAnT3ZlcnJpZGUgZ2xvYmFsIHNldHRpbmdzIGZvciB0aGlzIGFwcGxpY2F0aW9uIG9ubHkuIE5ldHdvcmssIHNlY3VyaXR5LCBhbmQgZmlsZS1wYXRoIHNldHRpbmdzIGFyZSBpbnRlbnRpb25hbGx5IGV4Y2x1ZGVkLic7XHJcbn0pO1xyXG5cclxuY29uc3Qgc2NvcGVTdW1tYXJ5TGFiZWwgPSBjb21wdXRlZCgoKSA9PlxyXG4gIFN0cmluZyhwcm9wcy5zY29wZUxhYmVsIHx8ICdhcHBsaWNhdGlvbicpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnRyaW0oKSA9PT0gJ2NsaWVudCdcclxuICAgID8gJ2NsaWVudCdcclxuICAgIDogJ2FwcGxpY2F0aW9uJyxcclxuKTtcclxuXHJcbmNvbnN0IGNvbmZpZ1N0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnUmVmID0gKGNvbmZpZ1N0b3JlIGFzIGFueSkuY29uZmlnO1xyXG5jb25zdCB0YWJzUmVmID0gKGNvbmZpZ1N0b3JlIGFzIGFueSkudGFicztcclxuY29uc3QgbWV0YWRhdGFSZWYgPSAoY29uZmlnU3RvcmUgYXMgYW55KS5tZXRhZGF0YTtcclxuXHJcbmNvbnN0IEREX0tFWVMgPSB7XHJcbiAgY29uZmlndXJhdGlvbk9wdGlvbjogJ2RkX2NvbmZpZ3VyYXRpb25fb3B0aW9uJyxcclxuICByZXNvbHV0aW9uT3B0aW9uOiAnZGRfcmVzb2x1dGlvbl9vcHRpb24nLFxyXG4gIG1hbnVhbFJlc29sdXRpb246ICdkZF9tYW51YWxfcmVzb2x1dGlvbicsXHJcbiAgcmVmcmVzaFJhdGVPcHRpb246ICdkZF9yZWZyZXNoX3JhdGVfb3B0aW9uJyxcclxuICBtYW51YWxSZWZyZXNoUmF0ZTogJ2RkX21hbnVhbF9yZWZyZXNoX3JhdGUnLFxyXG4gIGhkck9wdGlvbjogJ2RkX2hkcl9vcHRpb24nLFxyXG4gIGhkclJlcXVlc3RPdmVycmlkZTogJ2RkX2hkcl9yZXF1ZXN0X292ZXJyaWRlJyxcclxufSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IE9WRVJSSURFX0tFWV9BTElBU0VTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gIG52ZW5jX2ZvcmNlX3NwbGl0X2VuY29kZTogJ252ZW5jX3NwbGl0X2VuY29kZScsXHJcbn07XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVPdmVycmlkZUtleShrZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIE9WRVJSSURFX0tFWV9BTElBU0VTW2tleV0gPz8ga2V5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVPdmVycmlkZVJlY29yZCh2YWx1ZTogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcclxuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgIHJldHVybiB7fTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG5vcm1hbGl6ZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XHJcbiAgZm9yIChjb25zdCBbcmF3S2V5LCByYXdWYWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKSB7XHJcbiAgICBjb25zdCBrZXkgPSBub3JtYWxpemVPdmVycmlkZUtleShyYXdLZXkpO1xyXG4gICAgaWYgKHJhd0tleSAhPT0ga2V5ICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChub3JtYWxpemVkLCBrZXkpKSB7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplZFtrZXldID0gY2xvbmVWYWx1ZShyYXdWYWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBub3JtYWxpemVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvdmVycmlkZVJlY29yZHNFcXVhbChhOiB1bmtub3duLCBiOiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhID8/IHt9KSA9PT0gSlNPTi5zdHJpbmdpZnkoYiA/PyB7fSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBISURERU5fT1ZFUlJJREVfS0VZUyA9IG5ldyBTZXQ8c3RyaW5nPihbXHJcbiAgRERfS0VZUy5jb25maWd1cmF0aW9uT3B0aW9uLFxyXG4gIEREX0tFWVMucmVzb2x1dGlvbk9wdGlvbixcclxuICBERF9LRVlTLm1hbnVhbFJlc29sdXRpb24sXHJcbiAgRERfS0VZUy5yZWZyZXNoUmF0ZU9wdGlvbixcclxuICBERF9LRVlTLm1hbnVhbFJlZnJlc2hSYXRlLFxyXG4gIEREX0tFWVMuaGRyT3B0aW9uLFxyXG4gIEREX0tFWVMuaGRyUmVxdWVzdE92ZXJyaWRlLFxyXG5dKTtcclxuXHJcbmZ1bmN0aW9uIGlzSGlkZGVuT3ZlcnJpZGVLZXkoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICByZXR1cm4gSElEREVOX09WRVJSSURFX0tFWVMuaGFzKGtleSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbmZpZ1N0YXRlKCk6IGFueSB7XHJcbiAgcmV0dXJuIChjb25maWdSZWYgYXMgYW55KT8udmFsdWUgPz8gY29uZmlnUmVmO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUYWJzU3RhdGUoKTogYW55W10ge1xyXG4gIGNvbnN0IHYgPSAodGFic1JlZiBhcyBhbnkpPy52YWx1ZSA/PyB0YWJzUmVmO1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdiA6IFtdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNZXRhZGF0YVN0YXRlKCk6IGFueSB7XHJcbiAgcmV0dXJuIChtZXRhZGF0YVJlZiBhcyBhbnkpPy52YWx1ZSA/PyBtZXRhZGF0YVJlZjtcclxufVxyXG5cclxuZnVuY3Rpb24gcGxhdGZvcm1LZXkoKTogc3RyaW5nIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbWV0YSA9IGdldE1ldGFkYXRhU3RhdGUoKTtcclxuICAgIGNvbnN0IGNmZyA9IGdldENvbmZpZ1N0YXRlKCk7XHJcbiAgICByZXR1cm4gU3RyaW5nKG1ldGE/LnBsYXRmb3JtID8/IGNmZz8ucGxhdGZvcm0gPz8gJycpXHJcbiAgICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIC50cmltKCk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBBTExPV0VEX09WRVJSSURFX0tFWVMgPSBuZXcgU2V0PHN0cmluZz4oW1xyXG4gIC8vIElucHV0IGJlaGF2aW9yXHJcbiAgJ2NvbnRyb2xsZXInLFxyXG4gICdnYW1lcGFkJyxcclxuICAnZHM0X2JhY2tfYXNfdG91Y2hwYWRfY2xpY2snLFxyXG4gICdtb3Rpb25fYXNfZHM0JyxcclxuICAndG91Y2hwYWRfYXNfZHM0JyxcclxuICAnYmFja19idXR0b25fdGltZW91dCcsXHJcbiAgJ2tleWJvYXJkJyxcclxuICAna2V5X3JlcGVhdF9kZWxheScsXHJcbiAgJ2tleV9yZXBlYXRfZnJlcXVlbmN5JyxcclxuICAnYWx3YXlzX3NlbmRfc2NhbmNvZGVzJyxcclxuICAna2V5X3JpZ2h0YWx0X3RvX2tleV93aW4nLFxyXG4gICdtb3VzZScsXHJcbiAgJ2hpZ2hfcmVzb2x1dGlvbl9zY3JvbGxpbmcnLFxyXG4gICduYXRpdmVfcGVuX3RvdWNoJyxcclxuICAna2V5YmluZGluZ3MnLFxyXG4gICdkczVfaW5wdXR0aW5vX3JhbmRvbWl6ZV9tYWMnLFxyXG5cclxuICAvLyBTdHJlYW0gYXVkaW8vdmlkZW8gYW5kIGRpc3BsYXkgYXV0b21hdGlvblxyXG4gICdhdWRpb19zaW5rJyxcclxuICAndmlydHVhbF9zaW5rJyxcclxuICAnc3RyZWFtX2F1ZGlvJyxcclxuICAnYWRhcHRlcl9uYW1lJyxcclxuICAnZGRfY29uZmlndXJhdGlvbl9vcHRpb24nLFxyXG4gICdkZF9yZXNvbHV0aW9uX29wdGlvbicsXHJcbiAgJ2RkX21hbnVhbF9yZXNvbHV0aW9uJyxcclxuICAnZGRfcmVmcmVzaF9yYXRlX29wdGlvbicsXHJcbiAgJ2RkX21hbnVhbF9yZWZyZXNoX3JhdGUnLFxyXG4gICdkZF9oZHJfb3B0aW9uJyxcclxuICAnZGRfaGRyX3JlcXVlc3Rfb3ZlcnJpZGUnLFxyXG4gICdkZF9jb25maWdfcmV2ZXJ0X2RlbGF5JyxcclxuICAnZGRfY29uZmlnX3JldmVydF9vbl9kaXNjb25uZWN0JyxcclxuICAnZGRfcGF1c2VkX3ZpcnR1YWxfZGlzcGxheV90aW1lb3V0X3NlY3MnLFxyXG4gICdkZF9hbHdheXNfcmVzdG9yZV9mcm9tX2dvbGRlbicsXHJcbiAgJ2RkX3NuYXBzaG90X2V4Y2x1ZGVfZGV2aWNlcycsXHJcbiAgJ2RkX3NuYXBzaG90X3Jlc3RvcmVfaG90a2V5JyxcclxuICAnZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXlfbW9kaWZpZXJzJyxcclxuICAnZGRfYWN0aXZhdGVfdmlydHVhbF9kaXNwbGF5JyxcclxuICAnZGRfbW9kZV9yZW1hcHBpbmcnLFxyXG4gICdkZF93YV92aXJ0dWFsX2RvdWJsZV9yZWZyZXNoJyxcclxuICAnZGRfd2FfZHVtbXlfcGx1Z19oZHIxMCcsXHJcbiAgJ21heF9iaXRyYXRlJyxcclxuICAnbWluaW11bV9mcHNfdGFyZ2V0JyxcclxuXHJcbiAgLy8gQ29kZWMgLyBjYXB0dXJlIG5lZ290aWF0aW9uXHJcbiAgJ2ZlY19wZXJjZW50YWdlJyxcclxuICAncXAnLFxyXG4gICdtaW5fdGhyZWFkcycsXHJcbiAgJ2hldmNfbW9kZScsXHJcbiAgJ2F2MV9tb2RlJyxcclxuICAncHJlZmVyXzEwYml0X3NkcicsXHJcbiAgJ2NhcHR1cmUnLFxyXG4gICdlbmNvZGVyJyxcclxuXHJcbiAgLy8gRnJhbWUgbGltaXRlciBiZWhhdmlvclxyXG4gICdmcmFtZV9saW1pdGVyX2VuYWJsZScsXHJcbiAgJ2ZyYW1lX2xpbWl0ZXJfcHJvdmlkZXInLFxyXG4gICdmcmFtZV9saW1pdGVyX2Zwc19saW1pdCcsXHJcbiAgJ3J0c3NfZnJhbWVfbGltaXRfdHlwZScsXHJcbiAgJ2ZyYW1lX2xpbWl0ZXJfZGlzYWJsZV92c3luYycsXHJcblxyXG4gIC8vIEVuY29kZXIgdHVuaW5nXHJcbiAgJ252ZW5jX3ByZXNldCcsXHJcbiAgJ252ZW5jX3R3b3Bhc3MnLFxyXG4gICdudmVuY19zcGF0aWFsX2FxJyxcclxuICAnbnZlbmNfc3BsaXRfZW5jb2RlJyxcclxuICAnbnZlbmNfdmJ2X2luY3JlYXNlJyxcclxuICAnbnZlbmNfcmVhbHRpbWVfaGFncycsXHJcbiAgJ252ZW5jX2xhdGVuY3lfb3Zlcl9wb3dlcicsXHJcbiAgJ252ZW5jX29wZW5nbF92dWxrYW5fb25fZHhnaScsXHJcbiAgJ252ZW5jX2gyNjRfY2F2bGMnLFxyXG4gICdxc3ZfcHJlc2V0JyxcclxuICAncXN2X2NvZGVyJyxcclxuICAncXN2X3Nsb3dfaGV2YycsXHJcbiAgJ2FtZF91c2FnZScsXHJcbiAgJ2FtZF9yYycsXHJcbiAgJ2FtZF9lbmZvcmNlX2hyZCcsXHJcbiAgJ2FtZF9xdWFsaXR5JyxcclxuICAnYW1kX3ByZWFuYWx5c2lzJyxcclxuICAnYW1kX3ZiYXEnLFxyXG4gICdhbWRfY29kZXInLFxyXG4gICd2dF9jb2RlcicsXHJcbiAgJ3Z0X3NvZnR3YXJlJyxcclxuICAndnRfcmVhbHRpbWUnLFxyXG4gICd2YWFwaV9zdHJpY3RfcmNfYnVmZmVyJyxcclxuICAnc3dfcHJlc2V0JyxcclxuICAnc3dfdHVuZScsXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gaXNBbGxvd2VkS2V5KGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgaWYgKCFrZXkpIHJldHVybiBmYWxzZTtcclxuICByZXR1cm4gQUxMT1dFRF9PVkVSUklERV9LRVlTLmhhcyhrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmV0dGlmeUtleShrZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGtleVxyXG4gICAgLnNwbGl0KCdfJylcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgIC5tYXAoKHApID0+IHAuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwLnNsaWNlKDEpKVxyXG4gICAgLmpvaW4oJyAnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbGFiZWxGb3Ioa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IGsgPSBgY29uZmlnLiR7a2V5fWA7XHJcbiAgY29uc3QgdiA9IHQoayk7XHJcbiAgaWYgKCF2IHx8IHYgPT09IGspIHJldHVybiBwcmV0dGlmeUtleShrZXkpO1xyXG4gIHJldHVybiB2O1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZXNjRm9yKGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBrID0gYGNvbmZpZy4ke2tleX1fZGVzY2A7XHJcbiAgY29uc3QgdiA9IHQoayk7XHJcbiAgaWYgKCF2IHx8IHYgPT09IGspIHJldHVybiAnJztcclxuICByZXR1cm4gdjtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvbmVWYWx1ZSh2OiB1bmtub3duKTogdW5rbm93biB7XHJcbiAgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdjtcclxuICBpZiAodHlwZW9mIHYgIT09ICdvYmplY3QnKSByZXR1cm4gdjtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodikpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIHY7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRHbG9iYWxWYWx1ZShrZXk6IHN0cmluZyk6IHVua25vd24ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IGdldENvbmZpZ1N0YXRlKCk7XHJcbiAgICBjb25zdCBjdXIgPSBzdGF0ZT8uW2tleV07XHJcbiAgICBpZiAoY3VyICE9PSB1bmRlZmluZWQpIHJldHVybiBjdXI7XHJcbiAgICByZXR1cm4gKGNvbmZpZ1N0b3JlIGFzIGFueSk/LmRlZmF1bHRzPy5ba2V5XTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPdmVycmlkZXNTb3VyY2UodGFyZ2V0OiBFZGl0VGFyZ2V0KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xyXG4gIGNvbnN0IHNvdXJjZSA9IHRhcmdldCA9PT0gJ2RyYWZ0JyA/IGRyYWZ0T3ZlcnJpZGVzLnZhbHVlIDogb3ZlcnJpZGVzLnZhbHVlO1xyXG4gIGlmICghc291cmNlIHx8IHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xyXG4gICAgcmV0dXJuIHt9O1xyXG4gIH1cclxuICByZXR1cm4gc291cmNlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG59XHJcblxyXG5mdW5jdGlvbiBlbnN1cmVPdmVycmlkZXNPYmplY3RGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0KTogdm9pZCB7XHJcbiAgaWYgKHRhcmdldCA9PT0gJ2RyYWZ0Jykge1xyXG4gICAgaWYgKFxyXG4gICAgICAhZHJhZnRPdmVycmlkZXMudmFsdWUgfHxcclxuICAgICAgdHlwZW9mIGRyYWZ0T3ZlcnJpZGVzLnZhbHVlICE9PSAnb2JqZWN0JyB8fFxyXG4gICAgICBBcnJheS5pc0FycmF5KGRyYWZ0T3ZlcnJpZGVzLnZhbHVlKVxyXG4gICAgKSB7XHJcbiAgICAgIGRyYWZ0T3ZlcnJpZGVzLnZhbHVlID0ge307XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoIW92ZXJyaWRlcy52YWx1ZSB8fCB0eXBlb2Ygb3ZlcnJpZGVzLnZhbHVlICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG92ZXJyaWRlcy52YWx1ZSkpIHtcclxuICAgIG92ZXJyaWRlcy52YWx1ZSA9IHt9O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVwbGFjZU92ZXJyaWRlc0Zvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIG5leHRWYWx1ZTogdW5rbm93bik6IHZvaWQge1xyXG4gIGNvbnN0IG5leHQgPSBub3JtYWxpemVPdmVycmlkZVJlY29yZChuZXh0VmFsdWUpO1xyXG4gIGlmICh0YXJnZXQgPT09ICdkcmFmdCcpIHtcclxuICAgIGRyYWZ0T3ZlcnJpZGVzLnZhbHVlID0gbmV4dDtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGVuc3VyZU92ZXJyaWRlc09iamVjdEZvcignbGl2ZScpO1xyXG4gIGNvbnN0IGN1cnJlbnQgPSBvdmVycmlkZXMudmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoY3VycmVudCkpIHtcclxuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5leHQsIGtleSkpIHtcclxuICAgICAgZGVsZXRlIGN1cnJlbnRba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMobmV4dCkpIHtcclxuICAgIGN1cnJlbnRba2V5XSA9IHZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0LCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcclxuICBlbnN1cmVPdmVycmlkZXNPYmplY3RGb3IodGFyZ2V0KTtcclxuICBjb25zdCBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplT3ZlcnJpZGVLZXkoa2V5KTtcclxuICBpZiAodGFyZ2V0ID09PSAnZHJhZnQnKSB7XHJcbiAgICAoZHJhZnRPdmVycmlkZXMudmFsdWUgYXMgYW55KVtub3JtYWxpemVkS2V5XSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICAob3ZlcnJpZGVzLnZhbHVlIGFzIGFueSlbbm9ybWFsaXplZEtleV0gPSB2YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJPdmVycmlkZUtleUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKTogdm9pZCB7XHJcbiAgZW5zdXJlT3ZlcnJpZGVzT2JqZWN0Rm9yKHRhcmdldCk7XHJcbiAgY29uc3Qgbm9ybWFsaXplZEtleSA9IG5vcm1hbGl6ZU92ZXJyaWRlS2V5KGtleSk7XHJcbiAgdHJ5IHtcclxuICAgIGlmICh0YXJnZXQgPT09ICdkcmFmdCcpIHtcclxuICAgICAgZGVsZXRlIChkcmFmdE92ZXJyaWRlcy52YWx1ZSBhcyBhbnkpW25vcm1hbGl6ZWRLZXldO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVsZXRlIChvdmVycmlkZXMudmFsdWUgYXMgYW55KVtub3JtYWxpemVkS2V5XTtcclxuICAgIH1cclxuICB9IGNhdGNoIHt9XHJcbiAgY2xlYXJKc29uU3RhdGVGb3IodGFyZ2V0LCBub3JtYWxpemVkS2V5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0T3ZlcnJpZGVLZXkoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XHJcbiAgc2V0T3ZlcnJpZGVLZXlGb3IoJ2xpdmUnLCBrZXksIHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJPdmVycmlkZUtleShrZXk6IHN0cmluZyk6IHZvaWQge1xyXG4gIGNsZWFyT3ZlcnJpZGVLZXlGb3IoJ2xpdmUnLCBrZXkpO1xyXG59XHJcblxyXG5jb25zdCBvdmVycmlkZUtleXMgPSBjb21wdXRlZDxzdHJpbmdbXT4oKCkgPT4ge1xyXG4gIHJldHVybiBPYmplY3Qua2V5cyhnZXRPdmVycmlkZXNTb3VyY2UoJ2xpdmUnKSkuZmlsdGVyKFxyXG4gICAgKGspID0+IHR5cGVvZiBrID09PSAnc3RyaW5nJyAmJiBrLmxlbmd0aCA+IDAsXHJcbiAgKTtcclxufSk7XHJcblxyXG5jb25zdCB2aXNpYmxlT3ZlcnJpZGVLZXlzID0gY29tcHV0ZWQ8c3RyaW5nW10+KCgpID0+XHJcbiAgb3ZlcnJpZGVLZXlzLnZhbHVlLmZpbHRlcigoaykgPT4gIWlzSGlkZGVuT3ZlcnJpZGVLZXkoaykpLFxyXG4pO1xyXG5cclxuY29uc3QgZHJhZnRPdmVycmlkZUtleXMgPSBjb21wdXRlZDxzdHJpbmdbXT4oKCkgPT5cclxuICBPYmplY3Qua2V5cyhnZXRPdmVycmlkZXNTb3VyY2UoJ2RyYWZ0JykpLmZpbHRlcigoaykgPT4gdHlwZW9mIGsgPT09ICdzdHJpbmcnICYmIGsubGVuZ3RoID4gMCksXHJcbik7XHJcblxyXG5jb25zdCB2aXNpYmxlRHJhZnRPdmVycmlkZUtleXMgPSBjb21wdXRlZDxzdHJpbmdbXT4oKCkgPT5cclxuICBkcmFmdE92ZXJyaWRlS2V5cy52YWx1ZS5maWx0ZXIoKGspID0+ICFpc0hpZGRlbk92ZXJyaWRlS2V5KGspKSxcclxuKTtcclxuXHJcbmNvbnN0IFNZTl9LRVlTID0ge1xyXG4gIGNvbmZpZ3VyZURpc3BsYXlSZXNvbHV0aW9uOiAnY29uZmlndXJlX2Rpc3BsYXlfcmVzb2x1dGlvbicsXHJcbiAgY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlOiAnY29uZmlndXJlX2Rpc3BsYXlfcmVmcmVzaF9yYXRlJyxcclxuICBjb25maWd1cmVEaXNwbGF5SGRyOiAnY29uZmlndXJlX2Rpc3BsYXlfaGRyJyxcclxufSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IFNZTlRIRVRJQ19LRVlTID0gbmV3IFNldDxzdHJpbmc+KE9iamVjdC52YWx1ZXMoU1lOX0tFWVMpKTtcclxuXHJcbmZ1bmN0aW9uIGlzU3ludGhldGljS2V5KGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIFNZTlRIRVRJQ19LRVlTLmhhcyhrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1dpbmRvd3NQbGF0Zm9ybSgpOiBib29sZWFuIHtcclxuICByZXR1cm4gcGxhdGZvcm1LZXkoKSA9PT0gJ3dpbmRvd3MnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPdmVycmlkZVN0cmluZ0Zvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgY29uc3QgbyA9IGdldE92ZXJyaWRlc1NvdXJjZSh0YXJnZXQpIGFzIGFueTtcclxuICBpZiAoIW8gfHwgdHlwZW9mIG8gIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkobykpIHJldHVybiBudWxsO1xyXG4gIGNvbnN0IHYgPSBvW2tleV07XHJcbiAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICByZXR1cm4gU3RyaW5nKHYpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnbG9iYWxEZENvbmZpZ0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IGd2ID0gZ2V0R2xvYmFsVmFsdWUoRERfS0VZUy5jb25maWd1cmF0aW9uT3B0aW9uKTtcclxuICByZXR1cm4gU3RyaW5nKGd2ID8/ICdkaXNhYmxlZCcpID09PSAnZGlzYWJsZWQnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlbnN1cmVEZEVuYWJsZWRGb3JEaXNwbGF5T3ZlcnJpZGVzKHRhcmdldDogRWRpdFRhcmdldCk6IHZvaWQge1xyXG4gIGlmICghZ2xvYmFsRGRDb25maWdEaXNhYmxlZCgpKSByZXR1cm47XHJcbiAgY29uc3QgY3VyID0gZ2V0T3ZlcnJpZGVTdHJpbmdGb3IodGFyZ2V0LCBERF9LRVlTLmNvbmZpZ3VyYXRpb25PcHRpb24pO1xyXG4gIGlmICghY3VyIHx8IGN1ciA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLmNvbmZpZ3VyYXRpb25PcHRpb24sICd2ZXJpZnlfb25seScpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYW51cERkQ29uZmlndXJhdGlvbk9wdGlvbklmVW51c2VkKHRhcmdldDogRWRpdFRhcmdldCk6IHZvaWQge1xyXG4gIGlmICghZ2xvYmFsRGRDb25maWdEaXNhYmxlZCgpKSByZXR1cm47XHJcbiAgY29uc3QgbyA9IGdldE92ZXJyaWRlc1NvdXJjZSh0YXJnZXQpIGFzIGFueTtcclxuICBpZiAoIW8gfHwgdHlwZW9mIG8gIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkobykpIHJldHVybjtcclxuICBjb25zdCBkZEtleXMgPSBPYmplY3Qua2V5cyhvKS5maWx0ZXIoKGspID0+IGsuc3RhcnRzV2l0aCgnZGRfJykpO1xyXG4gIGNvbnN0IGhhc090aGVyRGRLZXlzID0gZGRLZXlzLnNvbWUoKGspID0+IGsgIT09IEREX0tFWVMuY29uZmlndXJhdGlvbk9wdGlvbik7XHJcbiAgaWYgKCFoYXNPdGhlckRkS2V5cyAmJiBvW0REX0tFWVMuY29uZmlndXJhdGlvbk9wdGlvbl0gPT09ICd2ZXJpZnlfb25seScpIHtcclxuICAgIGNsZWFyT3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLmNvbmZpZ3VyYXRpb25PcHRpb24pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNGb3JjZWRSZXNvbHV0aW9uQWN0aXZlRm9yKHRhcmdldDogRWRpdFRhcmdldCk6IGJvb2xlYW4ge1xyXG4gIGlmICghaXNXaW5kb3dzUGxhdGZvcm0oKSkgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IG9wdCA9IGdldE92ZXJyaWRlU3RyaW5nRm9yKHRhcmdldCwgRERfS0VZUy5yZXNvbHV0aW9uT3B0aW9uKTtcclxuICBpZiAob3B0ID09PSAnbWFudWFsJykgcmV0dXJuIHRydWU7XHJcbiAgY29uc3QgbyA9IGdldE92ZXJyaWRlc1NvdXJjZSh0YXJnZXQpIGFzIGFueTtcclxuICByZXR1cm4gKFxyXG4gICAgISFvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvKSAmJiBvW0REX0tFWVMubWFudWFsUmVzb2x1dGlvbl0gIT09IHVuZGVmaW5lZFxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRm9yY2VkUmVmcmVzaFJhdGVBY3RpdmVGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0KTogYm9vbGVhbiB7XHJcbiAgaWYgKCFpc1dpbmRvd3NQbGF0Zm9ybSgpKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3Qgb3B0ID0gZ2V0T3ZlcnJpZGVTdHJpbmdGb3IodGFyZ2V0LCBERF9LRVlTLnJlZnJlc2hSYXRlT3B0aW9uKTtcclxuICBpZiAob3B0ID09PSAnbWFudWFsJykgcmV0dXJuIHRydWU7XHJcbiAgY29uc3QgbyA9IGdldE92ZXJyaWRlc1NvdXJjZSh0YXJnZXQpIGFzIGFueTtcclxuICByZXR1cm4gKFxyXG4gICAgISFvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvKSAmJiBvW0REX0tFWVMubWFudWFsUmVmcmVzaFJhdGVdICE9PSB1bmRlZmluZWRcclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0ZvcmNlZEhkckFjdGl2ZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQpOiBib29sZWFuIHtcclxuICBpZiAoIWlzV2luZG93c1BsYXRmb3JtKCkpIHJldHVybiBmYWxzZTtcclxuICBjb25zdCByZXEgPSBnZXRPdmVycmlkZVN0cmluZ0Zvcih0YXJnZXQsIEREX0tFWVMuaGRyUmVxdWVzdE92ZXJyaWRlKTtcclxuICByZXR1cm4gcmVxID09PSAnZm9yY2Vfb24nIHx8IHJlcSA9PT0gJ2ZvcmNlX29mZic7XHJcbn1cclxuXHJcbmNvbnN0IGZvcmNlZFJlc29sdXRpb24gPSBjb21wdXRlZDxzdHJpbmc+KFxyXG4gICgpID0+IGdldE92ZXJyaWRlU3RyaW5nRm9yKCdsaXZlJywgRERfS0VZUy5tYW51YWxSZXNvbHV0aW9uKSA/PyAnJyxcclxuKTtcclxuY29uc3QgZm9yY2VkUmVmcmVzaFJhdGUgPSBjb21wdXRlZDxzdHJpbmc+KFxyXG4gICgpID0+IGdldE92ZXJyaWRlU3RyaW5nRm9yKCdsaXZlJywgRERfS0VZUy5tYW51YWxSZWZyZXNoUmF0ZSkgPz8gJycsXHJcbik7XHJcbmNvbnN0IGRyYWZ0Rm9yY2VkUmVzb2x1dGlvbiA9IGNvbXB1dGVkPHN0cmluZz4oXHJcbiAgKCkgPT4gZ2V0T3ZlcnJpZGVTdHJpbmdGb3IoJ2RyYWZ0JywgRERfS0VZUy5tYW51YWxSZXNvbHV0aW9uKSA/PyAnJyxcclxuKTtcclxuY29uc3QgZHJhZnRGb3JjZWRSZWZyZXNoUmF0ZSA9IGNvbXB1dGVkPHN0cmluZz4oXHJcbiAgKCkgPT4gZ2V0T3ZlcnJpZGVTdHJpbmdGb3IoJ2RyYWZ0JywgRERfS0VZUy5tYW51YWxSZWZyZXNoUmF0ZSkgPz8gJycsXHJcbik7XHJcblxyXG5jb25zdCBmb3JjZWRIZHJPcHRpb25zID0gW1xyXG4gIHsgbGFiZWw6ICdPbicsIHZhbHVlOiAnb24nIH0sXHJcbiAgeyBsYWJlbDogJ09mZicsIHZhbHVlOiAnb2ZmJyB9LFxyXG5dO1xyXG5cclxuY29uc3QgZm9yY2VkSGRyID0gY29tcHV0ZWQ8J29uJyB8ICdvZmYnPigoKSA9PiB7XHJcbiAgY29uc3QgcmVxID0gZ2V0T3ZlcnJpZGVTdHJpbmdGb3IoJ2xpdmUnLCBERF9LRVlTLmhkclJlcXVlc3RPdmVycmlkZSk7XHJcbiAgcmV0dXJuIHJlcSA9PT0gJ2ZvcmNlX29mZicgPyAnb2ZmJyA6ICdvbic7XHJcbn0pO1xyXG5jb25zdCBkcmFmdEZvcmNlZEhkciA9IGNvbXB1dGVkPCdvbicgfCAnb2ZmJz4oKCkgPT4ge1xyXG4gIGNvbnN0IHJlcSA9IGdldE92ZXJyaWRlU3RyaW5nRm9yKCdkcmFmdCcsIEREX0tFWVMuaGRyUmVxdWVzdE92ZXJyaWRlKTtcclxuICByZXR1cm4gcmVxID09PSAnZm9yY2Vfb2ZmJyA/ICdvZmYnIDogJ29uJztcclxufSk7XHJcblxyXG5mdW5jdGlvbiBzZXRGb3JjZWRSZXNvbHV0aW9uRm9yKHRhcmdldDogRWRpdFRhcmdldCwgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xyXG4gIGlmICghaXNXaW5kb3dzUGxhdGZvcm0oKSkgcmV0dXJuO1xyXG4gIGVuc3VyZURkRW5hYmxlZEZvckRpc3BsYXlPdmVycmlkZXModGFyZ2V0KTtcclxuICBzZXRPdmVycmlkZUtleUZvcih0YXJnZXQsIEREX0tFWVMucmVzb2x1dGlvbk9wdGlvbiwgJ21hbnVhbCcpO1xyXG4gIHNldE92ZXJyaWRlS2V5Rm9yKHRhcmdldCwgRERfS0VZUy5tYW51YWxSZXNvbHV0aW9uLCBTdHJpbmcodmFsdWUgPz8gJycpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJGb3JjZWRSZXNvbHV0aW9uRm9yKHRhcmdldDogRWRpdFRhcmdldCk6IHZvaWQge1xyXG4gIGNsZWFyT3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLnJlc29sdXRpb25PcHRpb24pO1xyXG4gIGNsZWFyT3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLm1hbnVhbFJlc29sdXRpb24pO1xyXG4gIGNsZWFudXBEZENvbmZpZ3VyYXRpb25PcHRpb25JZlVudXNlZCh0YXJnZXQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRGb3JjZWRSZWZyZXNoUmF0ZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZiAoIWlzV2luZG93c1BsYXRmb3JtKCkpIHJldHVybjtcclxuICBlbnN1cmVEZEVuYWJsZWRGb3JEaXNwbGF5T3ZlcnJpZGVzKHRhcmdldCk7XHJcbiAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLnJlZnJlc2hSYXRlT3B0aW9uLCAnbWFudWFsJyk7XHJcbiAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLm1hbnVhbFJlZnJlc2hSYXRlLCBTdHJpbmcodmFsdWUgPz8gJycpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJGb3JjZWRSZWZyZXNoUmF0ZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQpOiB2b2lkIHtcclxuICBjbGVhck92ZXJyaWRlS2V5Rm9yKHRhcmdldCwgRERfS0VZUy5yZWZyZXNoUmF0ZU9wdGlvbik7XHJcbiAgY2xlYXJPdmVycmlkZUtleUZvcih0YXJnZXQsIEREX0tFWVMubWFudWFsUmVmcmVzaFJhdGUpO1xyXG4gIGNsZWFudXBEZENvbmZpZ3VyYXRpb25PcHRpb25JZlVudXNlZCh0YXJnZXQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRGb3JjZWRIZHJGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0LCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYgKCFpc1dpbmRvd3NQbGF0Zm9ybSgpKSByZXR1cm47XHJcbiAgZW5zdXJlRGRFbmFibGVkRm9yRGlzcGxheU92ZXJyaWRlcyh0YXJnZXQpO1xyXG4gIHNldE92ZXJyaWRlS2V5Rm9yKHRhcmdldCwgRERfS0VZUy5oZHJPcHRpb24sICdhdXRvJyk7XHJcbiAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBERF9LRVlTLmhkclJlcXVlc3RPdmVycmlkZSwgdmFsdWUgPT09ICdvZmYnID8gJ2ZvcmNlX29mZicgOiAnZm9yY2Vfb24nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJGb3JjZWRIZHJGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0KTogdm9pZCB7XHJcbiAgY2xlYXJPdmVycmlkZUtleUZvcih0YXJnZXQsIEREX0tFWVMuaGRyUmVxdWVzdE92ZXJyaWRlKTtcclxuICBjbGVhck92ZXJyaWRlS2V5Rm9yKHRhcmdldCwgRERfS0VZUy5oZHJPcHRpb24pO1xyXG4gIGNsZWFudXBEZENvbmZpZ3VyYXRpb25PcHRpb25JZlVudXNlZCh0YXJnZXQpO1xyXG59XHJcblxyXG5jb25zdCBhY3RpdmVTeW50aGV0aWNLZXlzID0gY29tcHV0ZWQ8c3RyaW5nW10+KCgpID0+IHtcclxuICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIGlmIChpc0ZvcmNlZFJlc29sdXRpb25BY3RpdmVGb3IoJ2xpdmUnKSkga2V5cy5wdXNoKFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlSZXNvbHV0aW9uKTtcclxuICBpZiAoaXNGb3JjZWRSZWZyZXNoUmF0ZUFjdGl2ZUZvcignbGl2ZScpKSBrZXlzLnB1c2goU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlKTtcclxuICBpZiAoaXNGb3JjZWRIZHJBY3RpdmVGb3IoJ2xpdmUnKSkga2V5cy5wdXNoKFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlIZHIpO1xyXG4gIHJldHVybiBrZXlzO1xyXG59KTtcclxuXHJcbmNvbnN0IGRyYWZ0U3ludGhldGljS2V5cyA9IGNvbXB1dGVkPHN0cmluZ1tdPigoKSA9PiB7XHJcbiAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcclxuICBpZiAoaXNGb3JjZWRSZXNvbHV0aW9uQWN0aXZlRm9yKCdkcmFmdCcpKSBrZXlzLnB1c2goU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlc29sdXRpb24pO1xyXG4gIGlmIChpc0ZvcmNlZFJlZnJlc2hSYXRlQWN0aXZlRm9yKCdkcmFmdCcpKSBrZXlzLnB1c2goU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlKTtcclxuICBpZiAoaXNGb3JjZWRIZHJBY3RpdmVGb3IoJ2RyYWZ0JykpIGtleXMucHVzaChTWU5fS0VZUy5jb25maWd1cmVEaXNwbGF5SGRyKTtcclxuICByZXR1cm4ga2V5cztcclxufSk7XHJcblxyXG5jb25zdCBzaG93UmVzZXRBbGwgPSBjb21wdXRlZChcclxuICAoKSA9PiBvdmVycmlkZUtleXMudmFsdWUubGVuZ3RoID4gMCB8fCBhY3RpdmVTeW50aGV0aWNLZXlzLnZhbHVlLmxlbmd0aCA+IDAsXHJcbik7XHJcblxyXG5mdW5jdGlvbiBhZGRTeW50aGV0aWNPdmVycmlkZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYgKCFpc1dpbmRvd3NQbGF0Zm9ybSgpKSByZXR1cm47XHJcbiAgaWYgKGtleSA9PT0gU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlc29sdXRpb24pIHtcclxuICAgIHNldEZvcmNlZFJlc29sdXRpb25Gb3IoXHJcbiAgICAgIHRhcmdldCxcclxuICAgICAgdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRGb3JjZWRSZXNvbHV0aW9uLnZhbHVlIDogZm9yY2VkUmVzb2x1dGlvbi52YWx1ZSxcclxuICAgICk7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlSZWZyZXNoUmF0ZSkge1xyXG4gICAgc2V0Rm9yY2VkUmVmcmVzaFJhdGVGb3IoXHJcbiAgICAgIHRhcmdldCxcclxuICAgICAgdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRGb3JjZWRSZWZyZXNoUmF0ZS52YWx1ZSA6IGZvcmNlZFJlZnJlc2hSYXRlLnZhbHVlLFxyXG4gICAgKTtcclxuICB9IGVsc2UgaWYgKGtleSA9PT0gU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheUhkcikge1xyXG4gICAgc2V0Rm9yY2VkSGRyRm9yKHRhcmdldCwgdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRGb3JjZWRIZHIudmFsdWUgOiBmb3JjZWRIZHIudmFsdWUpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3ludGhldGljT3ZlcnJpZGVGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0LCBrZXk6IHN0cmluZyk6IHZvaWQge1xyXG4gIGlmIChrZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlSZXNvbHV0aW9uKSB7XHJcbiAgICBjbGVhckZvcmNlZFJlc29sdXRpb25Gb3IodGFyZ2V0KTtcclxuICB9IGVsc2UgaWYgKGtleSA9PT0gU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlKSB7XHJcbiAgICBjbGVhckZvcmNlZFJlZnJlc2hSYXRlRm9yKHRhcmdldCk7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFNZTl9LRVlTLmNvbmZpZ3VyZURpc3BsYXlIZHIpIHtcclxuICAgIGNsZWFyRm9yY2VkSGRyRm9yKHRhcmdldCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRGb3JjZWRSZXNvbHV0aW9uKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcclxuICBzZXRGb3JjZWRSZXNvbHV0aW9uRm9yKCdsaXZlJywgdmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXREcmFmdEZvcmNlZFJlc29sdXRpb24odmFsdWU6IHN0cmluZyk6IHZvaWQge1xyXG4gIHNldEZvcmNlZFJlc29sdXRpb25Gb3IoJ2RyYWZ0JywgdmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRGb3JjZWRSZWZyZXNoUmF0ZSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgc2V0Rm9yY2VkUmVmcmVzaFJhdGVGb3IoJ2xpdmUnLCB2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldERyYWZ0Rm9yY2VkUmVmcmVzaFJhdGUodmFsdWU6IHN0cmluZyk6IHZvaWQge1xyXG4gIHNldEZvcmNlZFJlZnJlc2hSYXRlRm9yKCdkcmFmdCcsIHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0Rm9yY2VkSGRyKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcclxuICBzZXRGb3JjZWRIZHJGb3IoJ2xpdmUnLCB2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldERyYWZ0Rm9yY2VkSGRyKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcclxuICBzZXRGb3JjZWRIZHJGb3IoJ2RyYWZ0JywgdmFsdWUpO1xyXG59XHJcblxyXG5jb25zdCBhbGxFbnRyaWVzID0gY29tcHV0ZWQ8RW50cnlbXT4oKCkgPT4ge1xyXG4gIGNvbnN0IG91dDogRW50cnlbXSA9IFtdO1xyXG4gIGNvbnN0IHRhYkxpc3QgPSBnZXRUYWJzU3RhdGUoKTtcclxuICBjb25zdCBwbGF0Zm9ybSA9IHBsYXRmb3JtS2V5KCk7XHJcbiAgZm9yIChjb25zdCB0YWIgb2YgdGFiTGlzdCkge1xyXG4gICAgY29uc3QgZ3JvdXBJZCA9IFN0cmluZygodGFiIGFzIGFueSk/LmlkID8/ICcnKTtcclxuICAgIGNvbnN0IGdyb3VwTmFtZSA9IFN0cmluZygodGFiIGFzIGFueSk/Lm5hbWUgPz8gZ3JvdXBJZCk7XHJcbiAgICBjb25zdCBvcHRpb25zID0gKHRhYiBhcyBhbnkpPy5vcHRpb25zID8/IHt9O1xyXG4gICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JykgY29udGludWU7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xyXG4gICAgICBpZiAoIWlzQWxsb3dlZEtleShrZXkpKSBjb250aW51ZTtcclxuICAgICAgY29uc3QgZ2xvYmFsVmFsdWUgPSBnZXRHbG9iYWxWYWx1ZShrZXkpO1xyXG4gICAgICBjb25zdCBzZWxlY3RPcHRpb25zID0gZ2V0T3ZlcnJpZGVTZWxlY3RPcHRpb25zKGtleSwge1xyXG4gICAgICAgIHQsXHJcbiAgICAgICAgcGxhdGZvcm0sXHJcbiAgICAgICAgbWV0YWRhdGE6IGdldE1ldGFkYXRhU3RhdGUoKSxcclxuICAgICAgICBjdXJyZW50VmFsdWU6IGdsb2JhbFZhbHVlLFxyXG4gICAgICB9KTtcclxuICAgICAgb3V0LnB1c2goe1xyXG4gICAgICAgIGtleSxcclxuICAgICAgICBsYWJlbDogbGFiZWxGb3Ioa2V5KSxcclxuICAgICAgICBkZXNjOiBkZXNjRm9yKGtleSksXHJcbiAgICAgICAgcGF0aDogYCR7Z3JvdXBOYW1lfSA+ICR7bGFiZWxGb3Ioa2V5KX1gLFxyXG4gICAgICAgIGdyb3VwSWQsXHJcbiAgICAgICAgZ3JvdXBOYW1lLFxyXG4gICAgICAgIGdsb2JhbFZhbHVlLFxyXG4gICAgICAgIG9wdGlvbnM6IHNlbGVjdE9wdGlvbnMsXHJcbiAgICAgICAgb3B0aW9uc1RleHQ6IGJ1aWxkT3ZlcnJpZGVPcHRpb25zVGV4dChzZWxlY3RPcHRpb25zKSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAocGxhdGZvcm0gPT09ICd3aW5kb3dzJykge1xyXG4gICAgY29uc3QgZ3JvdXBJZCA9ICdkaXNwbGF5JztcclxuICAgIGNvbnN0IGdyb3VwTmFtZSA9ICdEaXNwbGF5JztcclxuICAgIG91dC5wdXNoKFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiBTWU5fS0VZUy5jb25maWd1cmVEaXNwbGF5UmVzb2x1dGlvbixcclxuICAgICAgICBsYWJlbDogJ0NvbmZpZ3VyZSBSZXNvbHV0aW9uJyxcclxuICAgICAgICBkZXNjOiAnQ29uZmlndXJlIGEgc3BlY2lmaWMgZGlzcGxheSByZXNvbHV0aW9uIGR1cmluZyBzdHJlYW1zICh1c2VzIGRpc3BsYXkgYXV0b21hdGlvbiBiZWhpbmQgdGhlIHNjZW5lcykuJyxcclxuICAgICAgICBwYXRoOiBgJHtncm91cE5hbWV9ID4gQ29uZmlndXJlIFJlc29sdXRpb25gLFxyXG4gICAgICAgIGdyb3VwSWQsXHJcbiAgICAgICAgZ3JvdXBOYW1lLFxyXG4gICAgICAgIHN5bnRoZXRpYzogdHJ1ZSxcclxuICAgICAgICBnbG9iYWxWYWx1ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgIG9wdGlvbnM6IFtdLFxyXG4gICAgICAgIG9wdGlvbnNUZXh0OiAnJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogU1lOX0tFWVMuY29uZmlndXJlRGlzcGxheVJlZnJlc2hSYXRlLFxyXG4gICAgICAgIGxhYmVsOiAnQ29uZmlndXJlIFJlZnJlc2ggUmF0ZScsXHJcbiAgICAgICAgZGVzYzogJ0NvbmZpZ3VyZSBhIHNwZWNpZmljIGRpc3BsYXkgcmVmcmVzaCByYXRlIGR1cmluZyBzdHJlYW1zICh1c2VzIGRpc3BsYXkgYXV0b21hdGlvbiBiZWhpbmQgdGhlIHNjZW5lcykuJyxcclxuICAgICAgICBwYXRoOiBgJHtncm91cE5hbWV9ID4gQ29uZmlndXJlIFJlZnJlc2ggUmF0ZWAsXHJcbiAgICAgICAgZ3JvdXBJZCxcclxuICAgICAgICBncm91cE5hbWUsXHJcbiAgICAgICAgc3ludGhldGljOiB0cnVlLFxyXG4gICAgICAgIGdsb2JhbFZhbHVlOiB1bmRlZmluZWQsXHJcbiAgICAgICAgb3B0aW9uczogW10sXHJcbiAgICAgICAgb3B0aW9uc1RleHQ6ICcnLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiBTWU5fS0VZUy5jb25maWd1cmVEaXNwbGF5SGRyLFxyXG4gICAgICAgIGxhYmVsOiAnQ29uZmlndXJlIEhEUicsXHJcbiAgICAgICAgZGVzYzogJ0NvbmZpZ3VyZSBIRFIgb24gb3Igb2ZmIGR1cmluZyBzdHJlYW1zICh1c2VzIGRpc3BsYXkgYXV0b21hdGlvbiBiZWhpbmQgdGhlIHNjZW5lcykuJyxcclxuICAgICAgICBwYXRoOiBgJHtncm91cE5hbWV9ID4gQ29uZmlndXJlIEhEUmAsXHJcbiAgICAgICAgZ3JvdXBJZCxcclxuICAgICAgICBncm91cE5hbWUsXHJcbiAgICAgICAgc3ludGhldGljOiB0cnVlLFxyXG4gICAgICAgIGdsb2JhbFZhbHVlOiB1bmRlZmluZWQsXHJcbiAgICAgICAgb3B0aW9uczogZm9yY2VkSGRyT3B0aW9ucyBhcyBhbnksXHJcbiAgICAgICAgb3B0aW9uc1RleHQ6IGJ1aWxkT3ZlcnJpZGVPcHRpb25zVGV4dChmb3JjZWRIZHJPcHRpb25zIGFzIGFueSksXHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59KTtcclxuXHJcbmNvbnN0IHNlYXJjaFF1ZXJ5ID0gcmVmKCcnKTtcclxuY29uc3QgQUxMX0dST1VQU19JRCA9ICdhbGwnO1xyXG5jb25zdCBzZWxlY3RlZEdyb3VwSWQgPSByZWY8c3RyaW5nPihBTExfR1JPVVBTX0lEKTtcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZWRTZWFyY2hUZXJtcyhxdWVyeTogc3RyaW5nKTogc3RyaW5nW10ge1xyXG4gIHJldHVybiBTdHJpbmcocXVlcnkgfHwgJycpXHJcbiAgICAudHJpbSgpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnNwbGl0KC9cXHMrLylcclxuICAgIC5maWx0ZXIoQm9vbGVhbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjb3JlRW50cnlNYXRjaChlbnRyeTogRW50cnksIHRlcm1zOiBzdHJpbmdbXSk6IG51bWJlciB7XHJcbiAgaWYgKCF0ZXJtcy5sZW5ndGgpIHJldHVybiAwO1xyXG4gIGNvbnN0IGx2ID0gZW50cnkubGFiZWwudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCBrdiA9IGVudHJ5LmtleS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHB2ID0gZW50cnkucGF0aC50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IGR2ID0gKGVudHJ5LmRlc2MgfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qgb3YgPSAoZW50cnkub3B0aW9uc1RleHQgfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgbGV0IHRvdGFsID0gMDtcclxuICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpIHtcclxuICAgIGxldCBzY29yZSA9IDA7XHJcbiAgICBpZiAobHYuaW5jbHVkZXModGVybSkpIHtcclxuICAgICAgc2NvcmUgKz0gMTAwIC0gbHYuaW5kZXhPZih0ZXJtKTtcclxuICAgICAgaWYgKGx2LnN0YXJ0c1dpdGgodGVybSkpIHNjb3JlICs9IDQwO1xyXG4gICAgfSBlbHNlIGlmIChrdi5pbmNsdWRlcyh0ZXJtKSkge1xyXG4gICAgICBzY29yZSArPSA4NSAtIGt2LmluZGV4T2YodGVybSk7XHJcbiAgICAgIGlmIChrdi5zdGFydHNXaXRoKHRlcm0pKSBzY29yZSArPSAzMDtcclxuICAgIH0gZWxzZSBpZiAob3YuaW5jbHVkZXModGVybSkpIHtcclxuICAgICAgc2NvcmUgKz0gNTUgLSBvdi5pbmRleE9mKHRlcm0pIC8gMTA7XHJcbiAgICB9IGVsc2UgaWYgKHB2LmluY2x1ZGVzKHRlcm0pKSB7XHJcbiAgICAgIHNjb3JlICs9IDQwIC0gcHYuaW5kZXhPZih0ZXJtKSAvIDUwO1xyXG4gICAgfSBlbHNlIGlmIChkdi5pbmNsdWRlcyh0ZXJtKSkge1xyXG4gICAgICBzY29yZSArPSAyMCAtIGR2LmluZGV4T2YodGVybSkgLyAyMDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHRvdGFsICs9IHNjb3JlO1xyXG4gIH1cclxuICB0b3RhbCAtPSAocHYubGVuZ3RoICsgZHYubGVuZ3RoICsgb3YubGVuZ3RoKSAvIDE1MDA7XHJcbiAgcmV0dXJuIHRvdGFsO1xyXG59XHJcblxyXG5jb25zdCBzZWFyY2hUZXJtcyA9IGNvbXB1dGVkKCgpID0+IG5vcm1hbGl6ZWRTZWFyY2hUZXJtcyhzZWFyY2hRdWVyeS52YWx1ZSkpO1xyXG5cclxuY29uc3QgdXNlZE92ZXJyaWRlS2V5cyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IG5ldyBTZXQoWy4uLnZpc2libGVPdmVycmlkZUtleXMudmFsdWUsIC4uLmFjdGl2ZVN5bnRoZXRpY0tleXMudmFsdWVdKSxcclxuKTtcclxuY29uc3QgcGVuZGluZ0FkZEtleXMgPSByZWY8c3RyaW5nW10+KFtdKTtcclxuY29uc3QgcGlja2VyUGFuZSA9IHJlZjwnYnJvd3NlJyB8ICdlZGl0b3InPignYnJvd3NlJyk7XHJcbmNvbnN0IG1vZGFsVXNlZE92ZXJyaWRlS2V5cyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IG5ldyBTZXQoWy4uLnZpc2libGVEcmFmdE92ZXJyaWRlS2V5cy52YWx1ZSwgLi4uZHJhZnRTeW50aGV0aWNLZXlzLnZhbHVlXSksXHJcbik7XHJcbmNvbnN0IHBpY2tlclJlc2VydmVkS2V5cyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgYnJvd3NlTW9kYWxPcGVuLnZhbHVlID8gbW9kYWxVc2VkT3ZlcnJpZGVLZXlzLnZhbHVlIDogdXNlZE92ZXJyaWRlS2V5cy52YWx1ZSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gIG92ZXJyaWRlcyxcclxuICAodmFsdWUpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVPdmVycmlkZVJlY29yZCh2YWx1ZSk7XHJcbiAgICBpZiAoIW92ZXJyaWRlUmVjb3Jkc0VxdWFsKHZhbHVlLCBub3JtYWxpemVkKSkge1xyXG4gICAgICByZXBsYWNlT3ZlcnJpZGVzRm9yKCdsaXZlJywgbm9ybWFsaXplZCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICB7IGltbWVkaWF0ZTogdHJ1ZSB9LFxyXG4pO1xyXG5cclxuY29uc3QgYXZhaWxhYmxlRW50cmllcyA9IGNvbXB1dGVkPEVudHJ5W10+KCgpID0+XHJcbiAgYWxsRW50cmllcy52YWx1ZS5maWx0ZXIoXHJcbiAgICAoZW50cnkpID0+ICFwaWNrZXJSZXNlcnZlZEtleXMudmFsdWUuaGFzKGVudHJ5LmtleSkgJiYgIWlzSGlkZGVuT3ZlcnJpZGVLZXkoZW50cnkua2V5KSxcclxuICApLFxyXG4pO1xyXG5cclxuY29uc3QgZ3JvdXBPcmRlciA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBvcmRlciA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XHJcbiAgZm9yIChjb25zdCBlbnRyeSBvZiBhbGxFbnRyaWVzLnZhbHVlKSB7XHJcbiAgICBpZiAoIW9yZGVyLmhhcyhlbnRyeS5ncm91cElkKSkge1xyXG4gICAgICBvcmRlci5zZXQoZW50cnkuZ3JvdXBJZCwgb3JkZXIuc2l6ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBvcmRlcjtcclxufSk7XHJcblxyXG5jb25zdCBhdmFpbGFibGVHcm91cHMgPSBjb21wdXRlZDxBdmFpbGFibGVHcm91cFtdPigoKSA9PiB7XHJcbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIEF2YWlsYWJsZUdyb3VwPigpO1xyXG4gIGZvciAoY29uc3QgZW50cnkgb2YgYXZhaWxhYmxlRW50cmllcy52YWx1ZSkge1xyXG4gICAgY29uc3QgZXhpc3RpbmcgPSBncm91cHMuZ2V0KGVudHJ5Lmdyb3VwSWQpO1xyXG4gICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgIGV4aXN0aW5nLmNvdW50ICs9IDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBncm91cHMuc2V0KGVudHJ5Lmdyb3VwSWQsIHtcclxuICAgICAgICBpZDogZW50cnkuZ3JvdXBJZCxcclxuICAgICAgICBuYW1lOiBlbnRyeS5ncm91cE5hbWUsXHJcbiAgICAgICAgY291bnQ6IDEsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gQXJyYXkuZnJvbShncm91cHMudmFsdWVzKCkpLnNvcnQoXHJcbiAgICAoYSwgYikgPT5cclxuICAgICAgKGdyb3VwT3JkZXIudmFsdWUuZ2V0KGEuaWQpID8/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSAtXHJcbiAgICAgICAgKGdyb3VwT3JkZXIudmFsdWUuZ2V0KGIuaWQpID8/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB8fCBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpLFxyXG4gICk7XHJcbn0pO1xyXG5cclxud2F0Y2goXHJcbiAgYXZhaWxhYmxlR3JvdXBzLFxyXG4gIChncm91cHMpID0+IHtcclxuICAgIGlmIChzZWxlY3RlZEdyb3VwSWQudmFsdWUgPT09IEFMTF9HUk9VUFNfSUQpIHJldHVybjtcclxuICAgIGlmICghZ3JvdXBzLnNvbWUoKGdyb3VwKSA9PiBncm91cC5pZCA9PT0gc2VsZWN0ZWRHcm91cElkLnZhbHVlKSkge1xyXG4gICAgICBzZWxlY3RlZEdyb3VwSWQudmFsdWUgPSBBTExfR1JPVVBTX0lEO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgeyBpbW1lZGlhdGU6IHRydWUgfSxcclxuKTtcclxuXHJcbmNvbnN0IGZpbHRlcmVkQXZhaWxhYmxlR3JvdXBzID0gY29tcHV0ZWQ8RmlsdGVyZWRHcm91cFtdPigoKSA9PiB7XHJcbiAgY29uc3QgZ3JvdXBlZCA9IG5ldyBNYXA8c3RyaW5nLCBTY29yZWRFbnRyeVtdPigpO1xyXG4gIGZvciAoY29uc3QgZW50cnkgb2YgYXZhaWxhYmxlRW50cmllcy52YWx1ZSkge1xyXG4gICAgaWYgKHNlbGVjdGVkR3JvdXBJZC52YWx1ZSAhPT0gQUxMX0dST1VQU19JRCAmJiBlbnRyeS5ncm91cElkICE9PSBzZWxlY3RlZEdyb3VwSWQudmFsdWUpIHtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBtYXRjaFNjb3JlID0gc2VhcmNoVGVybXMudmFsdWUubGVuZ3RoID8gc2NvcmVFbnRyeU1hdGNoKGVudHJ5LCBzZWFyY2hUZXJtcy52YWx1ZSkgOiAxO1xyXG4gICAgaWYgKHNlYXJjaFRlcm1zLnZhbHVlLmxlbmd0aCAmJiBtYXRjaFNjb3JlIDw9IDApIHtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBidWNrZXQgPSBncm91cGVkLmdldChlbnRyeS5ncm91cElkKSA/PyBbXTtcclxuICAgIGJ1Y2tldC5wdXNoKHtcclxuICAgICAgLi4uZW50cnksXHJcbiAgICAgIG1hdGNoU2NvcmUsXHJcbiAgICB9KTtcclxuICAgIGdyb3VwZWQuc2V0KGVudHJ5Lmdyb3VwSWQsIGJ1Y2tldCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gQXJyYXkuZnJvbShncm91cGVkLmVudHJpZXMoKSlcclxuICAgIC5tYXAoKFtncm91cElkLCBlbnRyaWVzXSkgPT4gKHtcclxuICAgICAgaWQ6IGdyb3VwSWQsXHJcbiAgICAgIG5hbWU6IGVudHJpZXNbMF0/Lmdyb3VwTmFtZSA/PyBncm91cElkLFxyXG4gICAgICBlbnRyaWVzOiBlbnRyaWVzLnNvcnQoKGEsIGIpID0+XHJcbiAgICAgICAgc2VhcmNoVGVybXMudmFsdWUubGVuZ3RoXHJcbiAgICAgICAgICA/IGIubWF0Y2hTY29yZSAtIGEubWF0Y2hTY29yZSB8fCBhLmxhYmVsLmxvY2FsZUNvbXBhcmUoYi5sYWJlbClcclxuICAgICAgICAgIDogYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpLFxyXG4gICAgICApLFxyXG4gICAgfSkpXHJcbiAgICAuc29ydChcclxuICAgICAgKGEsIGIpID0+XHJcbiAgICAgICAgKGdyb3VwT3JkZXIudmFsdWUuZ2V0KGEuaWQpID8/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSAtXHJcbiAgICAgICAgICAoZ3JvdXBPcmRlci52YWx1ZS5nZXQoYi5pZCkgPz8gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSksXHJcbiAgICApO1xyXG59KTtcclxuXHJcbmNvbnN0IGZpbHRlcmVkQXZhaWxhYmxlQ291bnQgPSBjb21wdXRlZCgoKSA9PlxyXG4gIGZpbHRlcmVkQXZhaWxhYmxlR3JvdXBzLnZhbHVlLnJlZHVjZSgodG90YWwsIGdyb3VwKSA9PiB0b3RhbCArIGdyb3VwLmVudHJpZXMubGVuZ3RoLCAwKSxcclxuKTtcclxuXHJcbmNvbnN0IGJyb3dzZUhhc011bHRpcGxlR3JvdXBzID0gY29tcHV0ZWQoKCkgPT4gYXZhaWxhYmxlR3JvdXBzLnZhbHVlLmxlbmd0aCA+IDEpO1xyXG5jb25zdCBicm93c2VSZXN1bHRzU2Nyb2xsUmVmID0gcmVmPEhUTUxFbGVtZW50IHwgbnVsbD4obnVsbCk7XHJcblxyXG5jb25zdCBoYXNGaWx0ZXJDb250cm9scyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IHNlYXJjaFRlcm1zLnZhbHVlLmxlbmd0aCA+IDAgfHwgc2VsZWN0ZWRHcm91cElkLnZhbHVlICE9PSBBTExfR1JPVVBTX0lELFxyXG4pO1xyXG5jb25zdCBjb21wYWN0UGlja2VyRm9vdGVyVGV4dCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgcGlja2VyUGFuZS52YWx1ZSA9PT0gJ2VkaXRvcidcclxuICAgID8gJ1JldmlldyBhbmQgZmluZS10dW5lIHRoZSBwaWNrZWQgc2V0dGluZ3MsIHRoZW4gc2F2ZSB3aGVuIHlvdSBhcmUgZG9uZS4nXHJcbiAgICA6ICdCcm93c2Ugc3VwcG9ydGVkIHNldHRpbmdzIGFuZCBhZGQgd2hhdCB5b3UgbmVlZC4gT3BlbiBDb25maWd1cmUgUGlja3Mgd2hlbiB5b3UgYXJlIHJlYWR5IHRvIHJldmlldyB0aGVtLicsXHJcbik7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzY3JvbGxCcm93c2VSZXN1bHRzVG9Ub3AoKSB7XHJcbiAgYXdhaXQgbmV4dFRpY2soKTtcclxuICBpZiAoYnJvd3NlUmVzdWx0c1Njcm9sbFJlZi52YWx1ZSkgYnJvd3NlUmVzdWx0c1Njcm9sbFJlZi52YWx1ZS5zY3JvbGxUb3AgPSAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRQaWNrZXJQYW5lKHBhbmU6ICdicm93c2UnIHwgJ2VkaXRvcicpIHtcclxuICBwaWNrZXJQYW5lLnZhbHVlID0gcGFuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGlja2VyUGFuZUNsYXNzKHBhbmU6ICdicm93c2UnIHwgJ2VkaXRvcicpOiBzdHJpbmdbXSB7XHJcbiAgcmV0dXJuIFtwaWNrZXJQYW5lLnZhbHVlID09PSBwYW5lID8gJ2ZsZXgnIDogJ2hpZGRlbicsICd4bDpmbGV4J107XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBpY2tlclBhbmVUb2dnbGVDbGFzcyhwYW5lOiAnYnJvd3NlJyB8ICdlZGl0b3InKTogc3RyaW5nW10ge1xyXG4gIHJldHVybiBbXHJcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtMiByb3VuZGVkLXhsIGJvcmRlciBweC0zIHB5LTIgdGV4dC1zbSBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWNvbG9ycycsXHJcbiAgICBwaWNrZXJQYW5lLnZhbHVlID09PSBwYW5lXHJcbiAgICAgID8gJ2JvcmRlci1wcmltYXJ5LzM1IGJnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5IHNoYWRvdy1zbSdcclxuICAgICAgOiAnYm9yZGVyLWRhcmsvMTAgYmctbGlnaHQvNzAgdGV4dC1kYXJrLzc1IGhvdmVyOmJvcmRlci1wcmltYXJ5LzI1IGhvdmVyOnRleHQtcHJpbWFyeSBkYXJrOmJvcmRlci1saWdodC8xMCBkYXJrOmJnLXN1cmZhY2UvNjAgZGFyazp0ZXh0LWxpZ2h0LzgwJyxcclxuICBdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3RBdmFpbGFibGVHcm91cChncm91cElkOiBzdHJpbmcpIHtcclxuICBzZWxlY3RlZEdyb3VwSWQudmFsdWUgPSBncm91cElkO1xyXG4gIHZvaWQgc2Nyb2xsQnJvd3NlUmVzdWx0c1RvVG9wKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0RmlsdGVycygpIHtcclxuICBzZWFyY2hRdWVyeS52YWx1ZSA9ICcnO1xyXG4gIHNlbGVjdGVkR3JvdXBJZC52YWx1ZSA9IEFMTF9HUk9VUFNfSUQ7XHJcbiAgdm9pZCBzY3JvbGxCcm93c2VSZXN1bHRzVG9Ub3AoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRBZGRTZXR0aW5nc1N0YXRlKCkge1xyXG4gIHBlbmRpbmdBZGRLZXlzLnZhbHVlID0gW107XHJcbiAgZHJhZnRPdmVycmlkZXMudmFsdWUgPSB7fTtcclxuICBkcmFmdEpzb25EcmFmdHMudmFsdWUgPSB7fTtcclxuICBkcmFmdEpzb25FcnJvcnMudmFsdWUgPSB7fTtcclxuICBwaWNrZXJQYW5lLnZhbHVlID0gJ2Jyb3dzZSc7XHJcbiAgcmVzZXRGaWx0ZXJzKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9wZW5BZGRTZXR0aW5ncygpIHtcclxuICByZXBsYWNlT3ZlcnJpZGVzRm9yKCdkcmFmdCcsIGdldE92ZXJyaWRlc1NvdXJjZSgnbGl2ZScpKTtcclxuICBwZW5kaW5nQWRkS2V5cy52YWx1ZSA9IFtdO1xyXG4gIGRyYWZ0SnNvbkRyYWZ0cy52YWx1ZSA9IHt9O1xyXG4gIGRyYWZ0SnNvbkVycm9ycy52YWx1ZSA9IHt9O1xyXG4gIHBpY2tlclBhbmUudmFsdWUgPSAnYnJvd3NlJztcclxuICByZXNldEZpbHRlcnMoKTtcclxuICBicm93c2VNb2RhbE9wZW4udmFsdWUgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxBZGRTZXR0aW5ncygpIHtcclxuICBicm93c2VNb2RhbE9wZW4udmFsdWUgPSBmYWxzZTtcclxuICByZXNldEFkZFNldHRpbmdzU3RhdGUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRmlyc3RGaWx0ZXJlZEVudHJ5KCkge1xyXG4gIGNvbnN0IGZpcnN0ID0gZmlsdGVyZWRBdmFpbGFibGVHcm91cHMudmFsdWVbMF0/LmVudHJpZXNbMF07XHJcbiAgaWYgKGZpcnN0KSB7XHJcbiAgICBxdWV1ZU92ZXJyaWRlQWRkaXRpb24oZmlyc3Qua2V5KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZE92ZXJyaWRlVG9EcmFmdChrZXk6IHN0cmluZykge1xyXG4gIGlmIChpc0hpZGRlbk92ZXJyaWRlS2V5KGtleSkpIHJldHVybjtcclxuICBpZiAoaXNTeW50aGV0aWNLZXkoa2V5KSkge1xyXG4gICAgYWRkU3ludGhldGljT3ZlcnJpZGVGb3IoJ2RyYWZ0Jywga2V5KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgaWYgKCFpc0FsbG93ZWRLZXkoa2V5KSkgcmV0dXJuO1xyXG4gIGVuc3VyZU92ZXJyaWRlc09iamVjdEZvcignZHJhZnQnKTtcclxuICBpZiAoKGRyYWZ0T3ZlcnJpZGVzLnZhbHVlIGFzIGFueSlba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm47XHJcbiAgY29uc3QgY3VycmVudCA9IGdldEdsb2JhbFZhbHVlKGtleSk7XHJcbiAgKGRyYWZ0T3ZlcnJpZGVzLnZhbHVlIGFzIGFueSlba2V5XSA9IGNsb25lVmFsdWUoY3VycmVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHF1ZXVlT3ZlcnJpZGVBZGRpdGlvbihrZXk6IHN0cmluZykge1xyXG4gIGlmIChpc0hpZGRlbk92ZXJyaWRlS2V5KGtleSkpIHJldHVybjtcclxuICBpZiAoIWlzU3ludGhldGljS2V5KGtleSkgJiYgIWlzQWxsb3dlZEtleShrZXkpKSByZXR1cm47XHJcbiAgaWYgKG1vZGFsVXNlZE92ZXJyaWRlS2V5cy52YWx1ZS5oYXMoa2V5KSkgcmV0dXJuO1xyXG4gIGFkZE92ZXJyaWRlVG9EcmFmdChrZXkpO1xyXG4gIGlmICghdXNlZE92ZXJyaWRlS2V5cy52YWx1ZS5oYXMoa2V5KSAmJiAhcGVuZGluZ0FkZEtleXMudmFsdWUuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgcGVuZGluZ0FkZEtleXMudmFsdWUgPSBbLi4ucGVuZGluZ0FkZEtleXMudmFsdWUsIGtleV07XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlUGVuZGluZ0FkZGl0aW9ucygpIHtcclxuICBjb21taXRBbGxKc29uRm9yKCdkcmFmdCcpO1xyXG4gIHJlcGxhY2VPdmVycmlkZXNGb3IoJ2xpdmUnLCBkcmFmdE92ZXJyaWRlcy52YWx1ZSA/PyB7fSk7XHJcbiAgYnJvd3NlTW9kYWxPcGVuLnZhbHVlID0gZmFsc2U7XHJcbiAgcmVzZXRBZGRTZXR0aW5nc1N0YXRlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZU92ZXJyaWRlKGtleTogc3RyaW5nKSB7XHJcbiAgaWYgKGlzU3ludGhldGljS2V5KGtleSkpIHtcclxuICAgIHJlbW92ZVN5bnRoZXRpY092ZXJyaWRlRm9yKCdsaXZlJywga2V5KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY2xlYXJPdmVycmlkZUtleShrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVEcmFmdE92ZXJyaWRlKGtleTogc3RyaW5nKSB7XHJcbiAgaWYgKGlzU3ludGhldGljS2V5KGtleSkpIHtcclxuICAgIHJlbW92ZVN5bnRoZXRpY092ZXJyaWRlRm9yKCdkcmFmdCcsIGtleSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNsZWFyT3ZlcnJpZGVLZXlGb3IoJ2RyYWZ0Jywga2V5KTtcclxuICB9XHJcbiAgcGVuZGluZ0FkZEtleXMudmFsdWUgPSBwZW5kaW5nQWRkS2V5cy52YWx1ZS5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZSAhPT0ga2V5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJBbGwoKSB7XHJcbiAgcmVwbGFjZU92ZXJyaWRlc0ZvcignbGl2ZScsIHt9KTtcclxuICBqc29uRHJhZnRzLnZhbHVlID0ge307XHJcbiAganNvbkVycm9ycy52YWx1ZSA9IHt9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXBFbnRyaWVzKGtleXM6IHN0cmluZ1tdKTogRW50cnlbXSB7XHJcbiAgY29uc3QgYnlLZXkgPSBuZXcgTWFwKGFsbEVudHJpZXMudmFsdWUubWFwKChlKSA9PiBbZS5rZXksIGVdIGFzIGNvbnN0KSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChrZXlzKSlcclxuICAgIC5tYXAoKGspID0+IHtcclxuICAgICAgY29uc3QgYmFzZSA9IGJ5S2V5LmdldChrKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBrZXk6IGssXHJcbiAgICAgICAgbGFiZWw6IGJhc2U/LmxhYmVsID8/IHByZXR0aWZ5S2V5KGspLFxyXG4gICAgICAgIGRlc2M6IGJhc2U/LmRlc2MgPz8gJycsXHJcbiAgICAgICAgcGF0aDogYmFzZT8ucGF0aCA/PyBrLFxyXG4gICAgICAgIGdyb3VwSWQ6IGJhc2U/Lmdyb3VwSWQgPz8gJ3Vua25vd24nLFxyXG4gICAgICAgIGdyb3VwTmFtZTogYmFzZT8uZ3JvdXBOYW1lID8/ICdVbmtub3duJyxcclxuICAgICAgICBzeW50aGV0aWM6IGJhc2U/LnN5bnRoZXRpYyxcclxuICAgICAgICBnbG9iYWxWYWx1ZTogYmFzZT8uZ2xvYmFsVmFsdWUsXHJcbiAgICAgICAgb3B0aW9uczogYmFzZT8ub3B0aW9ucyA/PyBbXSxcclxuICAgICAgICBvcHRpb25zVGV4dDogYmFzZT8ub3B0aW9uc1RleHQgPz8gJycsXHJcbiAgICAgIH0gYXMgRW50cnk7XHJcbiAgICB9KVxyXG4gICAgLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xyXG59XHJcblxyXG5jb25zdCBvdmVycmlkZUVudHJpZXMgPSBjb21wdXRlZDxFbnRyeVtdPigoKSA9PlxyXG4gIG1hcEVudHJpZXMoWy4uLnZpc2libGVPdmVycmlkZUtleXMudmFsdWUsIC4uLmFjdGl2ZVN5bnRoZXRpY0tleXMudmFsdWVdKSxcclxuKTtcclxuXHJcbmNvbnN0IG1vZGFsT3ZlcnJpZGVFbnRyaWVzID0gY29tcHV0ZWQ8RW50cnlbXT4oKCkgPT5cclxuICBtYXBFbnRyaWVzKFsuLi52aXNpYmxlRHJhZnRPdmVycmlkZUtleXMudmFsdWUsIC4uLmRyYWZ0U3ludGhldGljS2V5cy52YWx1ZV0pLFxyXG4pO1xyXG5cclxuY29uc3QgYWN0aXZlT3ZlcnJpZGVDb3VudCA9IGNvbXB1dGVkKCgpID0+IG92ZXJyaWRlRW50cmllcy52YWx1ZS5sZW5ndGgpO1xyXG5cclxuZnVuY3Rpb24gZm9ybWF0VmFsdWUodjogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgaWYgKHYgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XHJcbiAgaWYgKHYgPT09IHVuZGVmaW5lZCkgcmV0dXJuICctJztcclxuICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSByZXR1cm4gdi5sZW5ndGggPiAxMjAgPyBgJHt2LnNsaWNlKDAsIDExNyl9Li4uYCA6IHY7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHMgPSBKU09OLnN0cmluZ2lmeSh2KTtcclxuICAgIHJldHVybiBzLmxlbmd0aCA+IDEyMCA/IGAke3Muc2xpY2UoMCwgMTE3KX0uLi5gIDogcztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBTdHJpbmcodik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZUZvcktleShrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xyXG4gIGNvbnN0IG9wdGlvbnMgPSBnZXRPdmVycmlkZVNlbGVjdE9wdGlvbnMoa2V5LCB7XHJcbiAgICB0LFxyXG4gICAgcGxhdGZvcm06IHBsYXRmb3JtS2V5KCksXHJcbiAgICBtZXRhZGF0YTogZ2V0TWV0YWRhdGFTdGF0ZSgpLFxyXG4gICAgY3VycmVudFZhbHVlOiB2YWx1ZSxcclxuICB9KTtcclxuICBpZiAob3B0aW9ucy5sZW5ndGgpIHtcclxuICAgIGNvbnN0IGZvdW5kID0gb3B0aW9ucy5maW5kKChvKSA9PiBvLnZhbHVlID09PSAodmFsdWUgYXMgYW55KSk7XHJcbiAgICBpZiAoZm91bmQpIHtcclxuICAgICAgY29uc3QgcmF3ID0gU3RyaW5nKGZvdW5kLnZhbHVlID8/ICcnKTtcclxuICAgICAgaWYgKHJhdyA9PT0gJycpIHJldHVybiBmb3VuZC5sYWJlbCB8fCByYXc7XHJcbiAgICAgIGlmIChmb3VuZC5sYWJlbCAmJiBmb3VuZC5sYWJlbCAhPT0gcmF3KSByZXR1cm4gYCR7Zm91bmQubGFiZWx9ICgke3Jhd30pYDtcclxuICAgICAgcmV0dXJuIHJhdztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmF3T3ZlcnJpZGVWYWx1ZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKTogdW5rbm93biB7XHJcbiAgcmV0dXJuIChnZXRPdmVycmlkZXNTb3VyY2UodGFyZ2V0KSBhcyBhbnkpPy5ba2V5XTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmF3T3ZlcnJpZGVWYWx1ZShrZXk6IHN0cmluZyk6IHVua25vd24ge1xyXG4gIHJldHVybiByYXdPdmVycmlkZVZhbHVlRm9yKCdsaXZlJywga2V5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZW50cnlUeXBlTGFiZWwoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmIChpc1N5bnRoZXRpY0tleShrZXkpKSByZXR1cm4gJ1Nob3J0Y3V0JztcclxuICBzd2l0Y2ggKGVkaXRvcktpbmQoa2V5LCBicm93c2VNb2RhbE9wZW4udmFsdWUgPyAnZHJhZnQnIDogJ2xpdmUnKSkge1xyXG4gICAgY2FzZSAnYm9vbGVhbic6XHJcbiAgICAgIHJldHVybiAnVG9nZ2xlJztcclxuICAgIGNhc2UgJ3NlbGVjdCc6XHJcbiAgICAgIHJldHVybiAnQ2hvaWNlJztcclxuICAgIGNhc2UgJ251bWJlcic6XHJcbiAgICAgIHJldHVybiAnTnVtYmVyJztcclxuICAgIGNhc2UgJ2pzb24nOlxyXG4gICAgICByZXR1cm4gJ0pTT04nO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdUZXh0JztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbHRlck5hdkNsYXNzKGFjdGl2ZTogYm9vbGVhbik6IHN0cmluZ1tdIHtcclxuICByZXR1cm4gW1xyXG4gICAgJ2ZsZXggdy1mdWxsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTIgcm91bmRlZC1sZyBib3JkZXIgcHgtMyBweS0yIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tY29sb3JzJyxcclxuICAgIGFjdGl2ZVxyXG4gICAgICA/ICdib3JkZXItcHJpbWFyeS8zNSBiZy1wcmltYXJ5LzEwIHRleHQtcHJpbWFyeSBzaGFkb3ctc20nXHJcbiAgICAgIDogJ2JvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLWxpZ2h0LzgwIGRhcms6Ymctc3VyZmFjZS82MCBob3Zlcjpib3JkZXItcHJpbWFyeS8yNSBob3Zlcjp0ZXh0LXByaW1hcnknLFxyXG4gIF07XHJcbn1cclxuXHJcbi8vIC0tLSBFZGl0b3JzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxudHlwZSBCb29sUGFpciA9IHsgdHJ1dGh5OiBhbnk7IGZhbHN5OiBhbnk7IHRydXRoeU5vcm0/OiBzdHJpbmc7IGZhbHN5Tm9ybT86IHN0cmluZyB9O1xyXG5jb25zdCBCT09MX1NUUklOR19QQUlSUyA9IFtcclxuICBbJ2VuYWJsZWQnLCAnZGlzYWJsZWQnXSxcclxuICBbJ2VuYWJsZScsICdkaXNhYmxlJ10sXHJcbiAgWyd5ZXMnLCAnbm8nXSxcclxuICBbJ29uJywgJ29mZiddLFxyXG4gIFsndHJ1ZScsICdmYWxzZSddLFxyXG4gIFsnMScsICcwJ10sXHJcbl0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBOVU1FUklDX09WRVJSSURFX0tFWVMgPSBuZXcgU2V0PHN0cmluZz4oWydmcmFtZV9saW1pdGVyX2Zwc19saW1pdCddKTtcclxuXHJcbmZ1bmN0aW9uIGJvb2xQYWlyRnJvbVZhbHVlKHZhbHVlOiB1bmtub3duKTogQm9vbFBhaXIgfCBudWxsIHtcclxuICBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlKSByZXR1cm4geyB0cnV0aHk6IHRydWUsIGZhbHN5OiBmYWxzZSB9O1xyXG4gIGlmICh2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gMCkgcmV0dXJuIHsgdHJ1dGh5OiAxLCBmYWxzeTogMCB9O1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCBub3JtID0gdmFsdWUudG9Mb3dlckNhc2UoKS50cmltKCk7XHJcbiAgZm9yIChjb25zdCBbdCwgZl0gb2YgQk9PTF9TVFJJTkdfUEFJUlMpIHtcclxuICAgIGlmIChub3JtID09PSB0IHx8IG5vcm0gPT09IGYpIHtcclxuICAgICAgcmV0dXJuIHsgdHJ1dGh5OiB0LCBmYWxzeTogZiwgdHJ1dGh5Tm9ybTogdCwgZmFsc3lOb3JtOiBmIH07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3RPcHRpb25zKGtleTogc3RyaW5nLCB0YXJnZXQ6IEVkaXRUYXJnZXQgPSAnbGl2ZScpOiBPdmVycmlkZVNlbGVjdE9wdGlvbltdIHtcclxuICBjb25zdCBjdXIgPSByYXdPdmVycmlkZVZhbHVlRm9yKHRhcmdldCwga2V5KTtcclxuICBjb25zdCBnbG9iYWwgPSBnZXRHbG9iYWxWYWx1ZShrZXkpO1xyXG4gIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGN1ciAhPT0gdW5kZWZpbmVkID8gY3VyIDogZ2xvYmFsO1xyXG4gIHJldHVybiBnZXRPdmVycmlkZVNlbGVjdE9wdGlvbnMoa2V5LCB7XHJcbiAgICB0LFxyXG4gICAgcGxhdGZvcm06IHBsYXRmb3JtS2V5KCksXHJcbiAgICBtZXRhZGF0YTogZ2V0TWV0YWRhdGFTdGF0ZSgpLFxyXG4gICAgY3VycmVudFZhbHVlLFxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0b3JLaW5kKFxyXG4gIGtleTogc3RyaW5nLFxyXG4gIHRhcmdldDogRWRpdFRhcmdldCA9ICdsaXZlJyxcclxuKTogJ2Jvb2xlYW4nIHwgJ3NlbGVjdCcgfCAnbnVtYmVyJyB8ICdzdHJpbmcnIHwgJ2pzb24nIHtcclxuICBjb25zdCBvcHRzID0gc2VsZWN0T3B0aW9ucyhrZXksIHRhcmdldCk7XHJcbiAgaWYgKG9wdHMgJiYgb3B0cy5sZW5ndGgpIHJldHVybiAnc2VsZWN0JztcclxuXHJcbiAgY29uc3QgZ3YgPSBnZXRHbG9iYWxWYWx1ZShrZXkpO1xyXG4gIGlmIChOVU1FUklDX09WRVJSSURFX0tFWVMuaGFzKGtleSkpIHJldHVybiAnbnVtYmVyJztcclxuICBpZiAodHlwZW9mIGd2ID09PSAnbnVtYmVyJykgcmV0dXJuICdudW1iZXInO1xyXG4gIGlmIChib29sUGFpckZyb21WYWx1ZShndikpIHJldHVybiAnYm9vbGVhbic7XHJcbiAgaWYgKHR5cGVvZiBndiA9PT0gJ3N0cmluZycpIHJldHVybiAnc3RyaW5nJztcclxuICBpZiAoZ3YgJiYgdHlwZW9mIGd2ID09PSAnb2JqZWN0JykgcmV0dXJuICdqc29uJztcclxuXHJcbiAgY29uc3Qgb3YgPSByYXdPdmVycmlkZVZhbHVlRm9yKHRhcmdldCwga2V5KTtcclxuICBpZiAodHlwZW9mIG92ID09PSAnbnVtYmVyJykgcmV0dXJuICdudW1iZXInO1xyXG4gIGlmIChib29sUGFpckZyb21WYWx1ZShvdikpIHJldHVybiAnYm9vbGVhbic7XHJcbiAgaWYgKHR5cGVvZiBvdiA9PT0gJ3N0cmluZycpIHJldHVybiAnc3RyaW5nJztcclxuICBpZiAob3YgJiYgdHlwZW9mIG92ID09PSAnb2JqZWN0JykgcmV0dXJuICdqc29uJztcclxuICByZXR1cm4gJ3N0cmluZyc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG92ZXJyaWRlUGxhY2Vob2xkZXIoa2V5OiBzdHJpbmcsIHRhcmdldDogRWRpdFRhcmdldCA9ICdsaXZlJyk6IHN0cmluZyB7XHJcbiAgc3dpdGNoIChlZGl0b3JLaW5kKGtleSwgdGFyZ2V0KSkge1xyXG4gICAgY2FzZSAnbnVtYmVyJzpcclxuICAgICAgcmV0dXJuICcobnVtYmVyKSc7XHJcbiAgICBjYXNlICdzdHJpbmcnOlxyXG4gICAgICByZXR1cm4gJyh2YWx1ZSknO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICcnO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UmVuZGVyZWRPdmVycmlkZVZhbHVlRm9yKHRhcmdldDogRWRpdFRhcmdldCwga2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XHJcbiAgY29uc3Qga2luZCA9IGVkaXRvcktpbmQoa2V5LCB0YXJnZXQpO1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gJ251bWJlcicgfHwga2luZCA9PT0gJ3NlbGVjdCcpIHtcclxuICAgICAgaWYgKHRhcmdldCA9PT0gJ2RyYWZ0Jykge1xyXG4gICAgICAgIHJlbW92ZURyYWZ0T3ZlcnJpZGUoa2V5KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZW1vdmVPdmVycmlkZShrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHNldE92ZXJyaWRlS2V5Rm9yKHRhcmdldCwga2V5LCB2YWx1ZSk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoa2luZCA9PT0gJ251bWJlcicpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHtcclxuICAgICAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBrZXksIHZhbHVlKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyKHZhbHVlKTtcclxuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShwYXJzZWQpKSB7XHJcbiAgICAgICAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBrZXksIHBhcnNlZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChraW5kID09PSAnc3RyaW5nJykge1xyXG4gICAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBrZXksIFN0cmluZyh2YWx1ZSkpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgc2V0T3ZlcnJpZGVLZXlGb3IodGFyZ2V0LCBrZXksIHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UmVuZGVyZWRPdmVycmlkZVZhbHVlKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xyXG4gIHNldFJlbmRlcmVkT3ZlcnJpZGVWYWx1ZUZvcignbGl2ZScsIGtleSwgdmFsdWUpO1xyXG59XHJcblxyXG5jb25zdCBqc29uRHJhZnRzID0gcmVmPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KHt9KTtcclxuY29uc3QganNvbkVycm9ycyA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pih7fSk7XHJcbmNvbnN0IGRyYWZ0SnNvbkRyYWZ0cyA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pih7fSk7XHJcbmNvbnN0IGRyYWZ0SnNvbkVycm9ycyA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pih7fSk7XHJcblxyXG5mdW5jdGlvbiBjbGVhckpzb25TdGF0ZUZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKSB7XHJcbiAgY29uc3QgZHJhZnRzID0gdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRKc29uRHJhZnRzIDoganNvbkRyYWZ0cztcclxuICBjb25zdCBlcnJvcnMgPSB0YXJnZXQgPT09ICdkcmFmdCcgPyBkcmFmdEpzb25FcnJvcnMgOiBqc29uRXJyb3JzO1xyXG4gIGNvbnN0IGQgPSB7IC4uLmRyYWZ0cy52YWx1ZSB9O1xyXG4gIGNvbnN0IGUgPSB7IC4uLmVycm9ycy52YWx1ZSB9O1xyXG4gIGRlbGV0ZSBkW2tleV07XHJcbiAgZGVsZXRlIGVba2V5XTtcclxuICBkcmFmdHMudmFsdWUgPSBkO1xyXG4gIGVycm9ycy52YWx1ZSA9IGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFySnNvblN0YXRlKGtleTogc3RyaW5nKSB7XHJcbiAgY2xlYXJKc29uU3RhdGVGb3IoJ2xpdmUnLCBrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBqc29uRHJhZnRGb3IodGFyZ2V0OiBFZGl0VGFyZ2V0LCBrZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgZHJhZnRzID0gdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRKc29uRHJhZnRzIDoganNvbkRyYWZ0cztcclxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRyYWZ0cy52YWx1ZSwga2V5KSkge1xyXG4gICAgcmV0dXJuIGRyYWZ0cy52YWx1ZVtrZXldID8/ICcnO1xyXG4gIH1cclxuICBjb25zdCBjdXIgPSByYXdPdmVycmlkZVZhbHVlRm9yKHRhcmdldCwga2V5KTtcclxuICBsZXQgdGV4dCA9ICcnO1xyXG4gIHRyeSB7XHJcbiAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoY3VyLCBudWxsLCAyKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHRleHQgPSBTdHJpbmcoY3VyID8/ICcnKTtcclxuICB9XHJcbiAgZHJhZnRzLnZhbHVlID0geyAuLi5kcmFmdHMudmFsdWUsIFtrZXldOiB0ZXh0IH07XHJcbiAgcmV0dXJuIHRleHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzb25EcmFmdChrZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGpzb25EcmFmdEZvcignbGl2ZScsIGtleSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUpzb25EcmFmdEZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgY29uc3QgZHJhZnRzID0gdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRKc29uRHJhZnRzIDoganNvbkRyYWZ0cztcclxuICBkcmFmdHMudmFsdWUgPSB7IC4uLmRyYWZ0cy52YWx1ZSwgW2tleV06IFN0cmluZyh2YWx1ZSA/PyAnJykgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSnNvbkRyYWZ0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgdXBkYXRlSnNvbkRyYWZ0Rm9yKCdsaXZlJywga2V5LCB2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzb25FcnJvckZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBlcnJvcnMgPSB0YXJnZXQgPT09ICdkcmFmdCcgPyBkcmFmdEpzb25FcnJvcnMgOiBqc29uRXJyb3JzO1xyXG4gIHJldHVybiBlcnJvcnMudmFsdWVba2V5XSB8fCAnJztcclxufVxyXG5cclxuZnVuY3Rpb24ganNvbkVycm9yKGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4ganNvbkVycm9yRm9yKCdsaXZlJywga2V5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tbWl0SnNvbkZvcih0YXJnZXQ6IEVkaXRUYXJnZXQsIGtleTogc3RyaW5nKSB7XHJcbiAgY29uc3QgZHJhZnRzID0gdGFyZ2V0ID09PSAnZHJhZnQnID8gZHJhZnRKc29uRHJhZnRzIDoganNvbkRyYWZ0cztcclxuICBjb25zdCBlcnJvcnMgPSB0YXJnZXQgPT09ICdkcmFmdCcgPyBkcmFmdEpzb25FcnJvcnMgOiBqc29uRXJyb3JzO1xyXG4gIGNvbnN0IHJhdyA9IChkcmFmdHMudmFsdWVba2V5XSA/PyAnJykudHJpbSgpO1xyXG4gIGlmICghcmF3KSB7XHJcbiAgICBpZiAodGFyZ2V0ID09PSAnZHJhZnQnKSB7XHJcbiAgICAgIHJlbW92ZURyYWZ0T3ZlcnJpZGUoa2V5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlbW92ZU92ZXJyaWRlKGtleSk7XHJcbiAgICB9XHJcbiAgICBlcnJvcnMudmFsdWUgPSB7IC4uLmVycm9ycy52YWx1ZSwgW2tleV06ICcnIH07XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdyk7XHJcbiAgICBzZXRPdmVycmlkZUtleUZvcih0YXJnZXQsIGtleSwgcGFyc2VkKTtcclxuICAgIGVycm9ycy52YWx1ZSA9IHsgLi4uZXJyb3JzLnZhbHVlLCBba2V5XTogJycgfTtcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIGVycm9ycy52YWx1ZSA9IHtcclxuICAgICAgLi4uZXJyb3JzLnZhbHVlLFxyXG4gICAgICBba2V5XTogZT8ubWVzc2FnZSA/IFN0cmluZyhlLm1lc3NhZ2UpIDogJ0ludmFsaWQgSlNPTicsXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29tbWl0SnNvbihrZXk6IHN0cmluZykge1xyXG4gIGNvbW1pdEpzb25Gb3IoJ2xpdmUnLCBrZXkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21taXRBbGxKc29uRm9yKHRhcmdldDogRWRpdFRhcmdldCkge1xyXG4gIGNvbnN0IGRyYWZ0cyA9IHRhcmdldCA9PT0gJ2RyYWZ0JyA/IGRyYWZ0SnNvbkRyYWZ0cy52YWx1ZSA6IGpzb25EcmFmdHMudmFsdWU7XHJcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZHJhZnRzKSkge1xyXG4gICAgY29tbWl0SnNvbkZvcih0YXJnZXQsIGtleSk7XHJcbiAgfVxyXG59XHJcbjwvc2NyaXB0PlxyXG5cclxuPHN0eWxlIHNjb3BlZD5cclxuLnZiLXNjcm9sbCB7XHJcbiAgb3ZlcmZsb3cteTogc2Nyb2xsO1xyXG59XHJcblxyXG5Ac3VwcG9ydHMgbm90IHNlbGVjdG9yKDo6LXdlYmtpdC1zY3JvbGxiYXIpIHtcclxuICAudmItc2Nyb2xsIHtcclxuICAgIHNjcm9sbGJhci13aWR0aDogdGhpbjtcclxuICAgIHNjcm9sbGJhci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC40MikgcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wNyk7XHJcbiAgfVxyXG5cclxuICAuZGFyayAudmItc2Nyb2xsIHtcclxuICAgIHNjcm9sbGJhci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC41MikgcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMDkpO1xyXG4gIH1cclxufVxyXG5cclxuLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gIHdpZHRoOiAxMnB4O1xyXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcclxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjA2KTtcclxufVxyXG5cclxuLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xyXG4gIG1hcmdpbjogMC4zNXJlbSAwLjJyZW0gMC4zNXJlbSAwLjFyZW07XHJcbiAgYm9yZGVyLXJhZGl1czogOTk5cHg7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wNik7XHJcbn1cclxuXHJcbi52Yi1zY3JvbGw6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcclxuICBtaW4taGVpZ2h0OiAyLjc1cmVtO1xyXG4gIGJvcmRlcjogM3B4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xyXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcclxuICAgIDE4MGRlZyxcclxuICAgIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuNSksXHJcbiAgICByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMzYpXHJcbiAgKTtcclxuICBiYWNrZ3JvdW5kLWNsaXA6IHBhZGRpbmctYm94O1xyXG4gIGJveC1zaGFkb3c6XHJcbiAgICBpbnNldCAwIDAgMCAxcHggcmdiKDI1NSAyNTUgMjU1IC8gMC4xOCksXHJcbiAgICAwIDhweCAxOHB4IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMDgpO1xyXG59XHJcblxyXG4udmItc2Nyb2xsOmhvdmVyOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XHJcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KFxyXG4gICAgMTgwZGVnLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC42MiksXHJcbiAgICByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuNDgpXHJcbiAgKTtcclxufVxyXG5cclxuLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXItY29ybmVyIHtcclxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxufVxyXG5cclxuLmRhcmsgLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjA4KTtcclxufVxyXG5cclxuLmRhcmsgLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjA4KTtcclxufVxyXG5cclxuLmRhcmsgLnZiLXNjcm9sbDo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xyXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcclxuICAgIDE4MGRlZyxcclxuICAgIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuNjIpLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMjQpXHJcbiAgKTtcclxuICBib3gtc2hhZG93OlxyXG4gICAgaW5zZXQgMCAwIDAgMXB4IHJnYigyNTUgMjU1IDI1NSAvIDAuMTQpLFxyXG4gICAgMCAxMHB4IDIycHggcmdiKDAgMCAwIC8gMC4yNCk7XHJcbn1cclxuXHJcbi5kYXJrIC52Yi1zY3JvbGw6aG92ZXI6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoXHJcbiAgICAxODBkZWcsXHJcbiAgICByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjc0KSxcclxuICAgIHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjMyKVxyXG4gICk7XHJcbn1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbIl91c2VNb2RlbCIsInNlbGVjdE9wdGlvbnMiLCJnZXRPdmVycmlkZVNlbGVjdE9wdGlvbnMiLCJidWlsZE92ZXJyaWRlT3B0aW9uc1RleHQiLCJ0IiwiX2NyZWF0ZUVsZW1lbnRWTm9kZSIsIl90b0Rpc3BsYXlTdHJpbmciLCJfY3JlYXRlVk5vZGUiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX3VucmVmIiwiX2NyZWF0ZUJsb2NrIiwiX29wZW5CbG9jayIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9UZWxlcG9ydCIsIl9ub3JtYWxpemVDbGFzcyIsIk5JbnB1dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTYyQ0EsTUFBTSxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7O0FBam9CaEIsVUFBQSxZQUFZQSxrQkFBcUMsV0FBK0I7QUFDaEYsVUFBQSxrQkFBa0JBLFNBQW9CLFNBQUMsWUFBZ0M7QUFDdkUsVUFBQSxpQkFBaUIsSUFBNkIsQ0FBQSxDQUFFO0FBQ2hELFVBQUEsRUFBRSxNQUFNO0FBRWQsVUFBTSxRQUFRO0FBV1IsVUFBQSxrQkFBa0IsU0FBUyxNQUFNO0FBQ3JDLFVBQUks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
