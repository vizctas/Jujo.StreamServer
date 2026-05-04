import { k as defineComponent, aa as mergeModels, ab as toRefs, ac as useModel, Q as openBlock, O as createElementBlock, V as createBaseVNode, U as createVNode, Z as unref, H as normalizeClass, P as toDisplayString, W as createCommentVNode, M as createBlock, S as withCtx, j as createTextVNode, F as Fragment, a1 as renderList, t as toRef, r as ref, c as computed, R as useI18n, w as watch, o as onMounted, b as onBeforeUnmount, X as withModifiers, Y as withKeys } from "./vue-core-de07660f.js";
import { L as LucideIcon, _ as _export_sfc, u as useConfigStore, h as http } from "./index-f3a48eb0.js";
import { aH as NSelect, aq as NButton, an as __unplugin_components_0, aG as NInputNumber, aO as NSwitch, ap as NAlert, aI as NRadio, aJ as NRadioGroup, aU as NRadioButton, ao as NCheckbox, aE as NTag, aC as NCard, aR as NSpin, at as NModal, au as useMessage } from "./vendor-33781bfc.js";
import { A as AppEditConfigOverridesSection } from "./AppEditConfigOverridesSection-b39bbf4d.js";
import "./ConfigFieldRenderer-f2409336.js";
const LOSSLESS_FLOW_MIN = 0;
const LOSSLESS_FLOW_MAX = 100;
const LOSSLESS_RESOLUTION_MIN = 10;
const LOSSLESS_RESOLUTION_MAX = 100;
const LOSSLESS_SHARPNESS_MIN = 1;
const LOSSLESS_SHARPNESS_MAX = 10;
const LOSSLESS_SCALING_OPTIONS = [
  { label: "Off", value: "off" },
  { label: "LS1", value: "ls1" },
  { label: "FSR 1.0", value: "fsr" },
  { label: "NIS", value: "nis" },
  { label: "SGSR", value: "sgsr" },
  { label: "BCAS (Anime)", value: "bcas" },
  { label: "Anime4K", value: "anime4k" },
  { label: "xBR", value: "xbr" },
  { label: "Sharp Bilinear", value: "sharp-bilinear" },
  { label: "Integer Scale", value: "integer" },
  { label: "Nearest Neighbour", value: "nearest" }
];
const LOSSLESS_SCALING_SHARPENING = /* @__PURE__ */ new Set([
  "ls1",
  "fsr",
  "nis",
  "sgsr"
]);
const LOSSLESS_ANIME_SIZES = [
  { label: "Small", value: "S" },
  { label: "Medium", value: "M" },
  { label: "Large", value: "L" },
  { label: "Very Large", value: "VL" },
  { label: "Ultra Large", value: "UL" }
];
const FRAME_GENERATION_PROVIDERS = [
  { label: "Game Provided", value: "game-provided" },
  { label: "Lossless Scaling", value: "lossless-scaling" },
  { label: "NVIDIA Smooth Motion", value: "nvidia-smooth-motion" }
];
const LOSSLESS_PROFILE_DEFAULTS = {
  recommended: {
    performanceMode: true,
    flowScale: 50,
    resolutionScale: 100,
    scalingMode: "off",
    sharpening: 5,
    anime4kSize: "M",
    anime4kVrs: false
  },
  custom: {
    performanceMode: false,
    flowScale: 50,
    resolutionScale: 100,
    scalingMode: "off",
    sharpening: 5,
    anime4kSize: "S",
    anime4kVrs: false
  }
};
function emptyLosslessOverrides() {
  return {
    performanceMode: null,
    flowScale: null,
    resolutionScale: null,
    scalingMode: null,
    sharpening: null,
    anime4kSize: null,
    anime4kVrs: null
  };
}
function emptyLosslessProfileState() {
  return {
    recommended: emptyLosslessOverrides(),
    custom: emptyLosslessOverrides()
  };
}
function normalizeFrameGenerationProvider(value) {
  if (typeof value !== "string") {
    return "lossless-scaling";
  }
  const compact = value.toLowerCase().split("").filter((ch) => /[a-z0-9]/.test(ch)).join("");
  if (compact === "nvidiasmoothmotion" || compact === "smoothmotion" || compact === "nvidia") {
    return "nvidia-smooth-motion";
  }
  if (compact === "gameprovided" || compact === "game") {
    return "game-provided";
  }
  if (compact === "losslessscaling" || compact === "lossless") {
    return "lossless-scaling";
  }
  return "lossless-scaling";
}
function parseFrameGenerationMode(value) {
  if (typeof value !== "string") {
    return null;
  }
  const compact = value.toLowerCase().split("").filter((ch) => /[a-z0-9]/.test(ch)).join("");
  if (compact === "off" || compact === "none") {
    return "off";
  }
  if (compact === "nvidiasmoothmotion" || compact === "smoothmotion" || compact === "nvidia") {
    return "nvidia-smooth-motion";
  }
  if (compact === "gameprovided" || compact === "game") {
    return "game-provided";
  }
  if (compact === "losslessscaling" || compact === "lossless") {
    return "lossless-scaling";
  }
  return null;
}
function parseNumeric(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0)
      return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}
function clampFlow(value) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return null;
  const rounded = Math.round(value);
  return Math.min(LOSSLESS_FLOW_MAX, Math.max(LOSSLESS_FLOW_MIN, rounded));
}
function clampResolution(value) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return null;
  const rounded = Math.round(value);
  return Math.min(LOSSLESS_RESOLUTION_MAX, Math.max(LOSSLESS_RESOLUTION_MIN, rounded));
}
function clampSharpness(value) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return null;
  const rounded = Math.round(value);
  return Math.min(LOSSLESS_SHARPNESS_MAX, Math.max(LOSSLESS_SHARPNESS_MIN, rounded));
}
function defaultRtssFromTarget(target) {
  if (typeof target !== "number" || !Number.isFinite(target) || target <= 0) {
    return null;
  }
  return Math.min(360, Math.max(1, Math.round(target / 2)));
}
function parseLosslessProfileKey(value) {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "custom") {
      return "custom";
    }
    if (normalized === "recommended") {
      return "recommended";
    }
  }
  return "recommended";
}
function parseLosslessOverrides(input) {
  const overrides = emptyLosslessOverrides();
  if (!input || typeof input !== "object") {
    return overrides;
  }
  const source = input;
  if (typeof source["performance-mode"] === "boolean") {
    overrides.performanceMode = source["performance-mode"];
  }
  const rawFlow = clampFlow(parseNumeric(source["flow-scale"]));
  if (rawFlow !== null) {
    overrides.flowScale = rawFlow;
  }
  const rawResolution = clampResolution(parseNumeric(source["resolution-scale"]));
  if (rawResolution !== null) {
    overrides.resolutionScale = rawResolution;
  }
  const modeRaw = typeof source["scaling-type"] === "string" ? source["scaling-type"] : null;
  if (modeRaw) {
    const normalized = modeRaw.toLowerCase();
    if (LOSSLESS_SCALING_OPTIONS.some((o) => o.value === normalized)) {
      overrides.scalingMode = normalized;
    }
  }
  const rawSharpness = clampSharpness(parseNumeric(source["sharpening"]));
  if (rawSharpness !== null) {
    overrides.sharpening = rawSharpness;
  }
  const animeSizeRaw = typeof source["anime4k-size"] === "string" ? source["anime4k-size"].toUpperCase() : null;
  if (animeSizeRaw && LOSSLESS_ANIME_SIZES.some((o) => o.value === animeSizeRaw)) {
    overrides.anime4kSize = animeSizeRaw;
  }
  if (typeof source["anime4k-vrs"] === "boolean") {
    overrides.anime4kVrs = source["anime4k-vrs"];
  }
  return overrides;
}
const _hoisted_1$6 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" };
const _hoisted_2$6 = { class: "space-y-1 md:col-span-2" };
const _hoisted_3$5 = { class: "flex items-center gap-2 mb-1" };
const _hoisted_4$5 = {
  key: 0,
  class: "text-xs text-danger leading-snug",
  role: "alert",
  "aria-live": "polite"
};
const _hoisted_5$5 = {
  key: 1,
  class: "flex items-center gap-2"
};
const _hoisted_6$5 = { class: "text-xs opacity-60" };
const _hoisted_7$5 = {
  key: 0,
  class: "md:col-span-2"
};
const _hoisted_8$5 = { class: "grid grid-cols-1 gap-4 md:grid-cols-2" };
const _hoisted_9$5 = { class: "rounded-xl border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-dark/40 p-4 space-y-3" };
const _hoisted_10$5 = { class: "space-y-1" };
const _hoisted_11$4 = { class: "rounded-xl border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-dark/40 p-4 space-y-3" };
const _hoisted_12$3 = { class: "flex items-center justify-between gap-3" };
const _hoisted_13$3 = {
  key: 0,
  class: "rounded-lg border border-dashed border-dark/15 dark:border-light/15 px-3 py-4 text-xs text-center opacity-60"
};
const _hoisted_14$3 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_15$3 = { class: "rounded-lg border border-dark/10 dark:border-light/10 bg-white/80 dark:bg-surface/60 shadow-sm" };
const _hoisted_16$3 = { class: "flex items-center justify-between gap-2 px-3 py-2 border-b border-dark/10 dark:border-light/10" };
const _hoisted_17$3 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_18$3 = { class: "p-3 space-y-2" };
const _hoisted_19$3 = {
  key: 1,
  class: "space-y-1 md:col-span-1"
};
const _hoisted_20$3 = { class: "space-y-1 md:col-span-1" };
const _hoisted_21$3 = { class: "flex items-center gap-2" };
const _hoisted_22$3 = {
  key: 2,
  class: "space-y-1 md:col-span-2"
};
const _hoisted_23$3 = { class: "flex items-center gap-2" };
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "AppEditBasicsSection",
  props: /* @__PURE__ */ mergeModels({
    isPlaynite: { type: Boolean, required: true },
    showPlaynitePicker: { type: Boolean, required: true },
    playniteInstalled: { type: Boolean, required: true },
    nameSelectOptions: { type: Array, required: true },
    gamesLoading: { type: Boolean, required: true },
    fallbackOption: { type: Function, required: true },
    playniteOptions: { type: Array, required: true },
    lockPlaynite: { type: Boolean, required: true },
    nameError: { type: String, required: false }
  }, {
    "form": { type: Object, ...{ required: true } },
    "formModifiers": {},
    "cmdText": { type: String, ...{ required: true } },
    "cmdTextModifiers": {},
    "nameSelectValue": { type: String, ...{ required: true } },
    "nameSelectValueModifiers": {},
    "selectedPlayniteId": { type: String, ...{ required: true } },
    "selectedPlayniteIdModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["name-focus", "name-blur", "name-search", "name-picked", "load-playnite-games", "pick-playnite", "unlock-playnite", "open-cover-finder"], ["update:form", "update:cmdText", "update:nameSelectValue", "update:selectedPlayniteId"]),
  setup(__props, { emit: __emit }) {
    const rawProps = __props;
    const {
      isPlaynite,
      showPlaynitePicker,
      playniteInstalled,
      nameSelectOptions,
      gamesLoading,
      fallbackOption,
      playniteOptions,
      lockPlaynite,
      nameError
    } = toRefs(rawProps);
    const emit = __emit;
    const form = useModel(__props, "form");
    const cmdText = useModel(__props, "cmdText");
    const nameSelectValue = useModel(__props, "nameSelectValue");
    const selectedPlayniteId = useModel(__props, "selectedPlayniteId");
    function addDetached() {
      form.value.detached.push("");
    }
    function removeDetached(index) {
      form.value.detached.splice(index, 1);
    }
    function detachedValue(index) {
      return form.value.detached[index] ?? "";
    }
    function setDetachedValue(index, value) {
      form.value.detached[index] = value;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$6, [
          _cache[15] || (_cache[15] = createBaseVNode(
            "label",
            { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
            "Name",
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_3$5, [
            createVNode(unref(NSelect), {
              value: nameSelectValue.value,
              "onUpdate:value": [
                _cache[0] || (_cache[0] = ($event) => nameSelectValue.value = $event),
                _cache[4] || (_cache[4] = (val) => emit("name-picked", val))
              ],
              options: unref(nameSelectOptions),
              loading: unref(gamesLoading),
              filterable: "",
              clearable: "",
              placeholder: "Type to search or enter a custom name",
              class: normalizeClass(["flex-1", unref(nameError) ? "ring-1 ring-danger rounded" : ""]),
              "fallback-option": unref(fallbackOption),
              onFocus: _cache[1] || (_cache[1] = ($event) => emit("name-focus")),
              onBlur: _cache[2] || (_cache[2] = ($event) => emit("name-blur")),
              onSearch: _cache[3] || (_cache[3] = (q) => emit("name-search", q))
            }, null, 8, ["value", "options", "loading", "class", "fallback-option"])
          ]),
          unref(nameError) ? (openBlock(), createElementBlock(
            "p",
            _hoisted_4$5,
            toDisplayString(unref(nameError)),
            1
            /* TEXT */
          )) : createCommentVNode("v-if", true),
          unref(showPlaynitePicker) ? (openBlock(), createElementBlock("div", _hoisted_5$5, [
            createVNode(unref(NSelect), {
              value: selectedPlayniteId.value,
              "onUpdate:value": [
                _cache[5] || (_cache[5] = ($event) => selectedPlayniteId.value = $event),
                _cache[7] || (_cache[7] = (val) => emit("pick-playnite", String(val ?? "")))
              ],
              options: unref(playniteOptions),
              loading: unref(gamesLoading),
              filterable: "",
              disabled: unref(lockPlaynite) || !unref(playniteInstalled),
              placeholder: unref(playniteInstalled) ? "Select a Playnite game…" : "Playnite plugin not detected",
              class: "flex-1",
              onFocus: _cache[6] || (_cache[6] = ($event) => emit("load-playnite-games"))
            }, null, 8, ["value", "options", "loading", "disabled", "placeholder"]),
            unref(lockPlaynite) ? (openBlock(), createBlock(unref(NButton), {
              key: 0,
              size: "small",
              type: "default",
              strong: "",
              onClick: _cache[8] || (_cache[8] = ($event) => emit("unlock-playnite"))
            }, {
              default: withCtx(() => _cache[14] || (_cache[14] = [
                createTextVNode(
                  " Change ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [14]
            })) : createCommentVNode("v-if", true)
          ])) : createCommentVNode("v-if", true),
          createBaseVNode(
            "div",
            _hoisted_6$5,
            toDisplayString(unref(isPlaynite) ? "Linked to Playnite" : "Custom application"),
            1
            /* TEXT */
          )
        ]),
        !unref(isPlaynite) ? (openBlock(), createElementBlock("div", _hoisted_7$5, [
          createBaseVNode("div", _hoisted_8$5, [
            createBaseVNode("section", _hoisted_9$5, [
              createBaseVNode("div", _hoisted_10$5, [
                _cache[16] || (_cache[16] = createBaseVNode(
                  "label",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  "Command",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(__unplugin_components_0), {
                  value: cmdText.value,
                  "onUpdate:value": _cache[9] || (_cache[9] = ($event) => cmdText.value = $event),
                  type: "textarea",
                  class: "font-mono",
                  autosize: { minRows: 4, maxRows: 8 },
                  placeholder: "Executable command line"
                }, null, 8, ["value"])
              ]),
              _cache[17] || (_cache[17] = createBaseVNode(
                "p",
                { class: "text-xs opacity-60" },
                " Vibepollo waits for this process. When it closes, the stream ends. ",
                -1
                /* CACHED */
              ))
            ]),
            createBaseVNode("section", _hoisted_11$4, [
              createBaseVNode("div", _hoisted_12$3, [
                _cache[19] || (_cache[19] = createBaseVNode(
                  "div",
                  null,
                  [
                    createBaseVNode("h3", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, " Detached Commands "),
                    createBaseVNode("p", { class: "text-xs opacity-60" }, " Optional commands that run first and keep the stream alive when they finish. ")
                  ],
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NButton), {
                  size: "small",
                  type: "primary",
                  onClick: addDetached
                }, {
                  default: withCtx(() => [
                    createVNode(LucideIcon, {
                      name: "fa-plus",
                      size: 14
                    }),
                    _cache[18] || (_cache[18] = createTextVNode(
                      " Add ",
                      -1
                      /* CACHED */
                    ))
                  ]),
                  _: 1,
                  __: [18]
                })
              ]),
              form.value.detached.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_13$3, " No detached commands yet. Use Add to set up prep scripts or launchers. ")) : (openBlock(), createElementBlock("ol", _hoisted_14$3, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(form.value.detached, (value, index) => {
                    return openBlock(), createElementBlock("li", { key: index }, [
                      createBaseVNode("div", _hoisted_15$3, [
                        createBaseVNode("header", _hoisted_16$3, [
                          createBaseVNode(
                            "span",
                            _hoisted_17$3,
                            " Detached Command #" + toDisplayString(index + 1),
                            1
                            /* TEXT */
                          ),
                          createVNode(unref(NButton), {
                            size: "tiny",
                            secondary: "",
                            type: "error",
                            onClick: ($event) => removeDetached(index)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: "fa-trash",
                                size: 14
                              }),
                              _cache[20] || (_cache[20] = createTextVNode(
                                " Delete ",
                                -1
                                /* CACHED */
                              ))
                            ]),
                            _: 2,
                            __: [20]
                          }, 1032, ["onClick"])
                        ]),
                        createBaseVNode("div", _hoisted_18$3, [
                          createVNode(unref(__unplugin_components_0), {
                            value: detachedValue(index),
                            "onUpdate:value": (value2) => setDetachedValue(index, value2),
                            type: "textarea",
                            class: "font-mono",
                            autosize: { minRows: 2, maxRows: 6 },
                            placeholder: "Command to execute before the stream"
                          }, null, 8, ["value", "onUpdate:value"]),
                          _cache[21] || (_cache[21] = createBaseVNode(
                            "p",
                            { class: "text-xs opacity-60" },
                            " Runs before the primary command. Vibepollo continues even if this command exits. ",
                            -1
                            /* CACHED */
                          ))
                        ])
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]))
            ])
          ])
        ])) : createCommentVNode("v-if", true),
        !unref(isPlaynite) ? (openBlock(), createElementBlock("div", _hoisted_19$3, [
          _cache[22] || (_cache[22] = createBaseVNode(
            "label",
            { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
            "Working Dir",
            -1
            /* CACHED */
          )),
          createVNode(unref(__unplugin_components_0), {
            value: form.value.workingDir,
            "onUpdate:value": _cache[10] || (_cache[10] = ($event) => form.value.workingDir = $event),
            class: "font-mono",
            placeholder: "C:/Games/App"
          }, null, 8, ["value"])
        ])) : createCommentVNode("v-if", true),
        createBaseVNode("div", _hoisted_20$3, [
          _cache[24] || (_cache[24] = createBaseVNode(
            "label",
            { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
            "Exit Timeout",
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_21$3, [
            createVNode(unref(NInputNumber), {
              value: form.value.exitTimeout,
              "onUpdate:value": _cache[11] || (_cache[11] = ($event) => form.value.exitTimeout = $event),
              min: 0,
              class: "w-28"
            }, null, 8, ["value"]),
            _cache[23] || (_cache[23] = createBaseVNode(
              "span",
              { class: "text-xs opacity-60" },
              "seconds",
              -1
              /* CACHED */
            ))
          ])
        ]),
        !unref(isPlaynite) ? (openBlock(), createElementBlock("div", _hoisted_22$3, [
          _cache[26] || (_cache[26] = createBaseVNode(
            "label",
            { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
            "Image Path",
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_23$3, [
            createVNode(unref(__unplugin_components_0), {
              value: form.value.imagePath,
              "onUpdate:value": _cache[12] || (_cache[12] = ($event) => form.value.imagePath = $event),
              class: "font-mono flex-1",
              placeholder: "/path/to/image.png"
            }, null, 8, ["value"]),
            createVNode(unref(NButton), {
              type: "default",
              strong: "",
              disabled: !form.value.name,
              onClick: _cache[13] || (_cache[13] = ($event) => emit("open-cover-finder"))
            }, {
              default: withCtx(() => [
                createVNode(LucideIcon, {
                  name: "fa-image",
                  size: 14
                }),
                _cache[25] || (_cache[25] = createTextVNode(
                  " Find Cover ",
                  -1
                  /* CACHED */
                ))
              ]),
              _: 1,
              __: [25]
            }, 8, ["disabled"])
          ]),
          _cache[27] || (_cache[27] = createBaseVNode(
            "p",
            { class: "text-xs opacity-60" },
            "Optional; stored only and not fetched by Vibepollo.",
            -1
            /* CACHED */
          ))
        ])) : createCommentVNode("v-if", true)
      ]);
    };
  }
});
const AppEditBasicsSection = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditBasicsSection.vue"]]);
const _hoisted_1$5 = { class: "mt-4 space-y-4 rounded-md border border-dark/10 p-3 dark:border-light/10" };
const _hoisted_2$5 = { class: "flex items-center justify-between gap-3" };
const _hoisted_3$4 = {
  key: 2,
  class: "space-y-4"
};
const _hoisted_4$4 = { class: "grid gap-3 md:grid-cols-2" };
const _hoisted_5$4 = { class: "space-y-1" };
const _hoisted_6$4 = { class: "flex items-end justify-end" };
const _hoisted_7$4 = { class: "space-y-3 p-3 rounded-md border border-primary/20 bg-primary/5" };
const _hoisted_8$4 = { class: "flex items-center gap-2" };
const _hoisted_9$4 = { class: "grid gap-3 md:grid-cols-2" };
const _hoisted_10$4 = { class: "space-y-1" };
const _hoisted_11$3 = {
  key: 0,
  class: "space-y-1"
};
const _hoisted_12$2 = { class: "flex items-center justify-between" };
const _hoisted_13$2 = {
  key: 0,
  class: "space-y-1"
};
const _hoisted_14$2 = {
  key: 1,
  class: "space-y-1"
};
const _hoisted_15$2 = { class: "text-xs opacity-60" };
const _hoisted_16$2 = {
  key: 1,
  class: "space-y-1"
};
const _hoisted_17$2 = { class: "text-xs opacity-60" };
const _hoisted_18$2 = {
  key: 2,
  class: "grid gap-3 md:grid-cols-2"
};
const _hoisted_19$2 = { class: "space-y-1" };
const _hoisted_20$2 = { class: "flex items-center justify-between gap-3 rounded-md border border-dark/10 px-3 py-2 dark:border-light/10" };
const _hoisted_21$2 = {
  key: 3,
  class: "flex items-center justify-between gap-3 rounded-md border border-dark/10 px-3 py-2 dark:border-light/10"
};
const _hoisted_22$2 = {
  key: 4,
  class: "space-y-3 rounded-md border border-dark/10 px-3 py-2 dark:border-light/10"
};
const _hoisted_23$2 = { class: "space-y-1" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AppEditLosslessScalingSection",
  props: /* @__PURE__ */ mergeModels({
    isPlayniteManaged: { type: Boolean, required: true },
    showLosslessResolution: { type: Boolean, required: true },
    showLosslessSharpening: { type: Boolean, required: true },
    showLosslessAnimeOptions: { type: Boolean, required: true },
    hasActiveLosslessOverrides: { type: Boolean, required: true },
    losslessExecutableDetected: { type: Boolean, required: true },
    losslessExecutableCheckComplete: { type: Boolean, required: true },
    resetActiveLosslessProfile: { type: Function, required: true }
  }, {
    "form": { type: Object, ...{ required: true } },
    "formModifiers": {},
    "losslessPerformanceMode": { type: Boolean, ...{
      required: true
    } },
    "losslessPerformanceModeModifiers": {},
    "losslessResolutionScale": { type: [Number, null], ...{
      required: true
    } },
    "losslessResolutionScaleModifiers": {},
    "losslessScalingMode": { type: String, ...{
      required: true
    } },
    "losslessScalingModeModifiers": {},
    "losslessSharpening": { type: Number, ...{ required: true } },
    "losslessSharpeningModifiers": {},
    "losslessAnimeSize": { type: String, ...{ required: true } },
    "losslessAnimeSizeModifiers": {},
    "losslessAnimeVrs": { type: Boolean, ...{ required: true } },
    "losslessAnimeVrsModifiers": {}
  }),
  emits: ["update:form", "update:losslessPerformanceMode", "update:losslessResolutionScale", "update:losslessScalingMode", "update:losslessSharpening", "update:losslessAnimeSize", "update:losslessAnimeVrs"],
  setup(__props) {
    const form = useModel(__props, "form");
    const losslessPerformanceModeModel = useModel(__props, "losslessPerformanceMode");
    const losslessResolutionScaleModel = useModel(__props, "losslessResolutionScale");
    const losslessScalingModeModel = useModel(__props, "losslessScalingMode");
    const losslessSharpeningModel = useModel(__props, "losslessSharpening");
    const losslessAnimeSizeModel = useModel(__props, "losslessAnimeSize");
    const losslessAnimeVrsModel = useModel(__props, "losslessAnimeVrs");
    const props = __props;
    const isPlayniteManaged = toRef(props, "isPlayniteManaged");
    const showLosslessResolution = toRef(props, "showLosslessResolution");
    const showLosslessSharpening = toRef(props, "showLosslessSharpening");
    const showLosslessAnimeOptions = toRef(props, "showLosslessAnimeOptions");
    const hasActiveLosslessOverrides = toRef(props, "hasActiveLosslessOverrides");
    const losslessExecutableDetected = toRef(props, "losslessExecutableDetected");
    const losslessExecutableCheckComplete = toRef(props, "losslessExecutableCheckComplete");
    const resetActiveLosslessProfile = props.resetActiveLosslessProfile;
    const resolutionInputMode = ref("factor");
    const resolutionPercentModel = computed({
      get: () => {
        const raw = losslessResolutionScaleModel.value;
        if (typeof raw === "number" && Number.isFinite(raw)) {
          return raw;
        }
        return 100;
      },
      set: (value) => {
        const clamped = clampResolution(value);
        losslessResolutionScaleModel.value = clamped ?? LOSSLESS_RESOLUTION_MAX;
      }
    });
    const resolutionFactorModel = computed({
      get: () => {
        const percent = resolutionPercentModel.value;
        if (!percent || percent <= 0)
          return 1;
        return Number((100 / percent).toFixed(2));
      },
      set: (factor) => {
        const normalized = Math.min(10, Math.max(1, factor || 1));
        const currentPercent = resolutionPercentModel.value;
        const currentFactor = Number((100 / currentPercent).toFixed(2));
        const basePercent = 100 / normalized;
        const clampToRange = (value) => Math.max(LOSSLESS_RESOLUTION_MIN, Math.min(LOSSLESS_RESOLUTION_MAX, value));
        const snapDown = (value) => clampToRange(Math.floor(value / 5) * 5);
        const snapUp = (value) => clampToRange(Math.ceil(value / 5) * 5);
        const snapNearest = (value) => clampToRange(Math.round(value / 5) * 5);
        const EPSILON = 1e-3;
        let nextPercent;
        if (normalized > currentFactor + EPSILON) {
          nextPercent = snapDown(basePercent);
        } else if (normalized < currentFactor - EPSILON) {
          nextPercent = snapUp(basePercent);
        } else {
          nextPercent = snapNearest(basePercent);
        }
        if (nextPercent === currentPercent) {
          if (normalized > currentFactor + EPSILON && currentPercent > LOSSLESS_RESOLUTION_MIN) {
            nextPercent = clampToRange(currentPercent - 5);
          } else if (normalized < currentFactor - EPSILON && currentPercent < LOSSLESS_RESOLUTION_MAX) {
            nextPercent = clampToRange(currentPercent + 5);
          }
        }
        resolutionPercentModel.value = nextPercent;
      }
    });
    const resolutionPercentDisplay = computed(() => resolutionPercentModel.value.toFixed(0));
    const resolutionFactorDisplay = computed(() => resolutionFactorModel.value.toFixed(2));
    const showLosslessLaunchSettings = computed(
      () => form.value.losslessScalingEnabled || form.value.frameGenerationMode === "lossless-scaling"
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("div", _hoisted_2$5, [
          _cache[11] || (_cache[11] = createBaseVNode(
            "div",
            null,
            [
              createBaseVNode("div", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, " Lossless Scaling Upscaling "),
              createBaseVNode("p", { class: "text-xs opacity-60" }, " Enable Lossless Scaling when you want Vibepollo to manage upscaling before encoding. ")
            ],
            -1
            /* CACHED */
          )),
          createVNode(unref(NSwitch), {
            value: form.value.losslessScalingEnabled,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => form.value.losslessScalingEnabled = $event),
            size: "small"
          }, null, 8, ["value"])
        ]),
        form.value.losslessScalingEnabled && !isPlayniteManaged.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 0,
          type: "warning",
          "show-icon": true,
          size: "small",
          class: "text-xs"
        }, {
          default: withCtx(() => _cache[12] || (_cache[12] = [
            createTextVNode(
              " This application isn't managed by Playnite. Vibepollo will try to guess which game executable is running and apply the Lossless Scaling profile automatically, but that detection is best-effort and may not always succeed. Configure Playnite integration for more reliable results. ",
              -1
              /* CACHED */
            )
          ])),
          _: 1,
          __: [12]
        })) : createCommentVNode("v-if", true),
        form.value.losslessScalingEnabled && losslessExecutableCheckComplete.value && !losslessExecutableDetected.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 1,
          type: "error",
          "show-icon": true,
          size: "small",
          class: "text-xs"
        }, {
          default: withCtx(() => _cache[13] || (_cache[13] = [
            createTextVNode(
              " Lossless Scaling executable not detected. Configure the executable path under Settings → Capture. ",
              -1
              /* CACHED */
            )
          ])),
          _: 1,
          __: [13]
        })) : createCommentVNode("v-if", true),
        form.value.losslessScalingEnabled ? (openBlock(), createElementBlock("div", _hoisted_3$4, [
          createBaseVNode("div", _hoisted_4$4, [
            createBaseVNode("div", _hoisted_5$4, [
              _cache[16] || (_cache[16] = createBaseVNode(
                "label",
                { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                "Profile",
                -1
                /* CACHED */
              )),
              createVNode(unref(NRadioGroup), {
                value: form.value.losslessScalingProfile,
                "onUpdate:value": _cache[1] || (_cache[1] = ($event) => form.value.losslessScalingProfile = $event)
              }, {
                default: withCtx(() => [
                  createVNode(unref(NRadio), { value: "recommended" }, {
                    default: withCtx(() => _cache[14] || (_cache[14] = [
                      createTextVNode(
                        "Recommended (Lowest Latency & Frame Pacing)",
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [14]
                  }),
                  createVNode(unref(NRadio), { value: "custom" }, {
                    default: withCtx(() => _cache[15] || (_cache[15] = [
                      createTextVNode(
                        "Custom: Use my Lossless Scaling default profile",
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [15]
                  })
                ]),
                _: 1
                /* STABLE */
              }, 8, ["value"]),
              _cache[17] || (_cache[17] = createBaseVNode(
                "p",
                { class: "text-xs opacity-60" },
                " Recommended keeps Vibepollo-tuned values for consistent latency and frame pacing. Custom runs the profile you maintain inside Lossless Scaling. ",
                -1
                /* CACHED */
              ))
            ]),
            createBaseVNode("div", _hoisted_6$4, [
              createVNode(unref(NButton), {
                size: "small",
                tertiary: "",
                disabled: !hasActiveLosslessOverrides.value,
                onClick: unref(resetActiveLosslessProfile)
              }, {
                default: withCtx(() => _cache[18] || (_cache[18] = [
                  createTextVNode(
                    " Reset to Profile Defaults ",
                    -1
                    /* CACHED */
                  )
                ])),
                _: 1,
                __: [18]
              }, 8, ["disabled", "onClick"])
            ])
          ]),
          createBaseVNode("div", _hoisted_7$4, [
            createBaseVNode("div", _hoisted_8$4, [
              createVNode(LucideIcon, {
                name: "fa-info-circle",
                size: 14,
                class: "text-primary"
              }),
              _cache[19] || (_cache[19] = createBaseVNode(
                "div",
                { class: "text-xs font-semibold" },
                "How Lossless Scaling Works",
                -1
                /* CACHED */
              ))
            ]),
            _cache[20] || (_cache[20] = createBaseVNode(
              "p",
              { class: "text-xs opacity-70" },
              [
                createTextVNode(" Lossless Scaling "),
                createBaseVNode("strong", null, "downscales"),
                createTextVNode(" the game using the resolution scale, then "),
                createBaseVNode("strong", null, "upscales"),
                createTextVNode(" back to the original resolution using the selected filter. This can improve performance but may reduce visual quality. ")
              ],
              -1
              /* CACHED */
            ))
          ]),
          createBaseVNode("div", _hoisted_9$4, [
            createBaseVNode("div", _hoisted_10$4, [
              _cache[21] || (_cache[21] = createBaseVNode(
                "label",
                { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                " Upscaling Filter ",
                -1
                /* CACHED */
              )),
              createVNode(unref(NSelect), {
                value: losslessScalingModeModel.value,
                "onUpdate:value": _cache[2] || (_cache[2] = ($event) => losslessScalingModeModel.value = $event),
                options: unref(LOSSLESS_SCALING_OPTIONS),
                size: "small",
                clearable: false
              }, null, 8, ["value", "options"]),
              _cache[22] || (_cache[22] = createBaseVNode(
                "p",
                { class: "text-xs opacity-60" },
                ' Filter used after downscaling. "Off" disables scaling entirely. ',
                -1
                /* CACHED */
              ))
            ]),
            showLosslessResolution.value ? (openBlock(), createElementBlock("div", _hoisted_11$3, [
              createBaseVNode("div", _hoisted_12$2, [
                _cache[25] || (_cache[25] = createBaseVNode(
                  "label",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  " Resolution Scale ",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NRadioGroup), {
                  value: resolutionInputMode.value,
                  "onUpdate:value": _cache[3] || (_cache[3] = ($event) => resolutionInputMode.value = $event),
                  size: "small",
                  class: "text-xs",
                  "button-style": "solid"
                }, {
                  default: withCtx(() => [
                    createVNode(unref(NRadioButton), { value: "factor" }, {
                      default: withCtx(() => _cache[23] || (_cache[23] = [
                        createTextVNode(
                          "Scale Factor",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [23]
                    }),
                    createVNode(unref(NRadioButton), { value: "percent" }, {
                      default: withCtx(() => _cache[24] || (_cache[24] = [
                        createTextVNode(
                          "Percent",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [24]
                    })
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["value"])
              ]),
              resolutionInputMode.value === "factor" ? (openBlock(), createElementBlock("div", _hoisted_13$2, [
                createVNode(unref(NInputNumber), {
                  value: resolutionFactorModel.value,
                  "onUpdate:value": _cache[4] || (_cache[4] = ($event) => resolutionFactorModel.value = $event),
                  min: 1,
                  max: 10,
                  step: 0.05,
                  precision: 2,
                  placeholder: "1.00",
                  size: "small"
                }, null, 8, ["value"])
              ])) : (openBlock(), createElementBlock("div", _hoisted_14$2, [
                createVNode(unref(NInputNumber), {
                  value: resolutionPercentModel.value,
                  "onUpdate:value": _cache[5] || (_cache[5] = ($event) => resolutionPercentModel.value = $event),
                  min: unref(LOSSLESS_RESOLUTION_MIN),
                  max: unref(LOSSLESS_RESOLUTION_MAX),
                  step: 5,
                  precision: 0,
                  placeholder: "100",
                  size: "small"
                }, null, 8, ["value", "min", "max"])
              ])),
              createBaseVNode(
                "div",
                _hoisted_15$2,
                toDisplayString(resolutionPercentDisplay.value) + "% • " + toDisplayString(resolutionFactorDisplay.value) + "x ",
                1
                /* TEXT */
              )
            ])) : createCommentVNode("v-if", true)
          ]),
          losslessScalingModeModel.value !== "off" ? (openBlock(), createBlock(unref(NAlert), {
            key: 0,
            type: "warning",
            "show-icon": true,
            size: "small",
            class: "text-xs"
          }, {
            default: withCtx(() => _cache[26] || (_cache[26] = [
              createBaseVNode(
                "strong",
                null,
                "Performance Note:",
                -1
                /* CACHED */
              ),
              createTextVNode(
                " Only use upscaling if the game lacks native FSR/DLSS support. ",
                -1
                /* CACHED */
              )
            ])),
            _: 1,
            __: [26]
          })) : createCommentVNode("v-if", true),
          showLosslessSharpening.value ? (openBlock(), createElementBlock("div", _hoisted_16$2, [
            _cache[27] || (_cache[27] = createBaseVNode(
              "label",
              { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
              " Sharpening (1-10) ",
              -1
              /* CACHED */
            )),
            createVNode(unref(NInputNumber), {
              value: losslessSharpeningModel.value,
              "onUpdate:value": _cache[6] || (_cache[6] = ($event) => losslessSharpeningModel.value = $event),
              min: unref(LOSSLESS_SHARPNESS_MIN),
              max: unref(LOSSLESS_SHARPNESS_MAX),
              step: 1,
              precision: 0,
              size: "small"
            }, null, 8, ["value", "min", "max"]),
            createBaseVNode(
              "p",
              _hoisted_17$2,
              " Post-upscaling sharpness for " + toDisplayString(losslessScalingModeModel.value.toUpperCase()) + " filter. ",
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true),
          showLosslessAnimeOptions.value ? (openBlock(), createElementBlock("div", _hoisted_18$2, [
            createBaseVNode("div", _hoisted_19$2, [
              _cache[28] || (_cache[28] = createBaseVNode(
                "label",
                { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                " Anime4K Size ",
                -1
                /* CACHED */
              )),
              createVNode(unref(NSelect), {
                value: losslessAnimeSizeModel.value,
                "onUpdate:value": _cache[7] || (_cache[7] = ($event) => losslessAnimeSizeModel.value = $event),
                options: unref(LOSSLESS_ANIME_SIZES),
                size: "small",
                clearable: false
              }, null, 8, ["value", "options"])
            ]),
            createBaseVNode("div", _hoisted_20$2, [
              _cache[29] || (_cache[29] = createBaseVNode(
                "div",
                null,
                [
                  createBaseVNode("div", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, "VRS"),
                  createBaseVNode("p", { class: "text-xs opacity-60" }, "Enable Variable Rate Shading where supported.")
                ],
                -1
                /* CACHED */
              )),
              createVNode(unref(NSwitch), {
                value: losslessAnimeVrsModel.value,
                "onUpdate:value": _cache[8] || (_cache[8] = ($event) => losslessAnimeVrsModel.value = $event),
                size: "small"
              }, null, 8, ["value"])
            ])
          ])) : createCommentVNode("v-if", true)
        ])) : createCommentVNode("v-if", true),
        form.value.losslessScalingEnabled ? (openBlock(), createElementBlock("div", _hoisted_21$2, [
          _cache[30] || (_cache[30] = createBaseVNode(
            "div",
            null,
            [
              createBaseVNode("div", { class: "text-xs font-semibold uppercase tracking-wide opacity-70" }, "Performance Mode"),
              createBaseVNode("p", { class: "text-xs opacity-60" }, "Reduces GPU usage with minimal quality impact.")
            ],
            -1
            /* CACHED */
          )),
          createVNode(unref(NSwitch), {
            value: losslessPerformanceModeModel.value,
            "onUpdate:value": _cache[9] || (_cache[9] = ($event) => losslessPerformanceModeModel.value = $event),
            size: "small"
          }, null, 8, ["value"])
        ])) : createCommentVNode("v-if", true),
        showLosslessLaunchSettings.value ? (openBlock(), createElementBlock("div", _hoisted_22$2, [
          _cache[33] || (_cache[33] = createBaseVNode(
            "div",
            { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
            "Advanced Launch",
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_23$2, [
            _cache[31] || (_cache[31] = createBaseVNode(
              "label",
              { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
              " Lossless Launch Delay (seconds) ",
              -1
              /* CACHED */
            )),
            createVNode(unref(NInputNumber), {
              value: form.value.losslessScalingLaunchDelay,
              "onUpdate:value": _cache[10] || (_cache[10] = ($event) => form.value.losslessScalingLaunchDelay = $event),
              min: 0,
              max: 600,
              step: 1,
              precision: 0,
              placeholder: "8",
              size: "small"
            }, null, 8, ["value"]),
            _cache[32] || (_cache[32] = createBaseVNode(
              "p",
              { class: "text-xs opacity-60" },
              " Wait additional seconds after the game starts before opening Lossless Scaling. Leave blank to use the default 8-second delay. ",
              -1
              /* CACHED */
            ))
          ])
        ])) : createCommentVNode("v-if", true)
      ]);
    };
  }
});
const AppEditLosslessScalingSection = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditLosslessScalingSection.vue"]]);
const _hoisted_1$4 = { class: "space-y-3" };
const _hoisted_2$4 = { class: "flex items-center justify-between" };
const _hoisted_3$3 = {
  key: 0,
  class: "text-xs opacity-60"
};
const _hoisted_4$3 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_5$3 = { class: "flex items-center justify-between gap-2 mb-2" };
const _hoisted_6$3 = { class: "text-xs opacity-70" };
const _hoisted_7$3 = { class: "flex items-center gap-2" };
const _hoisted_8$3 = { class: "grid grid-cols-1 gap-2" };
const _hoisted_9$3 = { class: "text-xs opacity-60" };
const _hoisted_10$3 = { class: "text-xs opacity-60" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "AppEditPrepCommandsSection",
  props: /* @__PURE__ */ mergeModels({
    isWindows: { type: Boolean, required: true }
  }, {
    "form": { type: Object, ...{ required: true } },
    "formModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["add-prep"], ["update:form"]),
  setup(__props, { emit: __emit }) {
    const { t: $t } = useI18n();
    const form = useModel(__props, "form");
    const props = __props;
    const emit = __emit;
    function remove(index) {
      form.value.prepCmd.splice(index, 1);
    }
    const isWindows = props.isWindows;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$4, [
        createBaseVNode("div", _hoisted_2$4, [
          _cache[2] || (_cache[2] = createBaseVNode(
            "h3",
            { class: "text-xs font-semibold opacity-70" },
            "Prep Commands",
            -1
            /* CACHED */
          )),
          createVNode(unref(NButton), {
            size: "small",
            type: "primary",
            onClick: _cache[0] || (_cache[0] = ($event) => emit("add-prep"))
          }, {
            default: withCtx(() => [
              createVNode(LucideIcon, {
                name: "fa-plus",
                size: 14
              }),
              _cache[1] || (_cache[1] = createTextVNode(
                " Add ",
                -1
                /* CACHED */
              ))
            ]),
            _: 1,
            __: [1]
          })
        ]),
        form.value.prepCmd.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$3, "None")) : (openBlock(), createElementBlock("div", _hoisted_4$3, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(form.value.prepCmd, (p, i) => {
              return openBlock(), createElementBlock("div", {
                key: i,
                class: "rounded-md border border-dark/10 dark:border-light/10 p-2"
              }, [
                createBaseVNode("div", _hoisted_5$3, [
                  createBaseVNode(
                    "div",
                    _hoisted_6$3,
                    "Step " + toDisplayString(i + 1),
                    1
                    /* TEXT */
                  ),
                  createBaseVNode("div", _hoisted_7$3, [
                    unref(isWindows) ? (openBlock(), createBlock(unref(NCheckbox), {
                      key: 0,
                      checked: p.elevated,
                      "onUpdate:checked": ($event) => p.elevated = $event,
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(unref($t)("_common.elevated")),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["checked", "onUpdate:checked"])) : createCommentVNode("v-if", true),
                    createVNode(unref(NButton), {
                      size: "small",
                      type: "error",
                      strong: "",
                      onClick: ($event) => remove(i)
                    }, {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: "fa-trash",
                          size: 14
                        })
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["onClick"])
                  ])
                ]),
                createBaseVNode("div", _hoisted_8$3, [
                  createBaseVNode("div", null, [
                    createBaseVNode(
                      "label",
                      _hoisted_9$3,
                      toDisplayString(unref($t)("_common.do_cmd")),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(__unplugin_components_0), {
                      value: p.do,
                      "onUpdate:value": ($event) => p.do = $event,
                      type: "textarea",
                      autosize: { minRows: 1, maxRows: 3 },
                      class: "font-mono",
                      placeholder: "Command to run before start"
                    }, null, 8, ["value", "onUpdate:value"])
                  ]),
                  createBaseVNode("div", null, [
                    createBaseVNode(
                      "label",
                      _hoisted_10$3,
                      toDisplayString(unref($t)("_common.undo_cmd")),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(__unplugin_components_0), {
                      value: p.undo,
                      "onUpdate:value": ($event) => p.undo = $event,
                      type: "textarea",
                      autosize: { minRows: 1, maxRows: 3 },
                      class: "font-mono",
                      placeholder: "Command to run on stop"
                    }, null, 8, ["value", "onUpdate:value"])
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]))
      ]);
    };
  }
});
const AppEditPrepCommandsSection = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditPrepCommandsSection.vue"]]);
const _hoisted_1$3 = { class: "rounded-2xl border border-dark/10 dark:border-light/10 bg-light/60 dark:bg-surface/40 p-4 space-y-4" };
const _hoisted_2$3 = { class: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between" };
const _hoisted_3$2 = { class: "space-y-1" };
const _hoisted_4$2 = { class: "flex flex-wrap items-center gap-2" };
const _hoisted_5$2 = { class: "flex items-center gap-2" };
const _hoisted_6$2 = { class: "space-y-4" };
const _hoisted_7$2 = { class: "space-y-2" };
const _hoisted_8$2 = {
  key: 0,
  class: "space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3"
};
const _hoisted_9$2 = { class: "flex flex-col gap-2 md:flex-row md:items-start md:justify-between" };
const _hoisted_10$2 = { class: "space-y-2" };
const _hoisted_11$2 = { class: "space-y-3" };
const _hoisted_12$1 = { class: "space-y-2" };
const _hoisted_13$1 = { class: "flex flex-wrap items-center gap-2" };
const _hoisted_14$1 = {
  key: 0,
  class: "grid gap-3 md:grid-cols-2"
};
const _hoisted_15$1 = { class: "space-y-1" };
const _hoisted_16$1 = { class: "space-y-1" };
const _hoisted_17$1 = { class: "space-y-1" };
const _hoisted_18$1 = { class: "space-y-1" };
const _hoisted_19$1 = { class: "grid gap-3" };
const _hoisted_20$1 = { class: "flex flex-wrap items-start justify-between gap-3 rounded-xl border border-dark/10 dark:border-light/10 bg-white/50 dark:bg-white/5 px-3 py-3" };
const _hoisted_21$1 = { class: "space-y-1" };
const _hoisted_22$1 = { class: "text-xs opacity-70 leading-relaxed" };
const _hoisted_23$1 = { class: "space-y-3" };
const _hoisted_24$1 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_25$1 = { class: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" };
const _hoisted_26$1 = { class: "flex items-start gap-3" };
const _hoisted_27$1 = { class: "text-primary text-base" };
const _hoisted_28$1 = { class: "space-y-1" };
const _hoisted_29$1 = { class: "font-medium text-sm" };
const _hoisted_30$1 = { class: "text-xs opacity-70 leading-relaxed" };
const _hoisted_31$1 = { class: "rounded-xl border border-dark/10 dark:border-light/10 bg-white/40 dark:bg-white/5 p-3 space-y-3" };
const _hoisted_32$1 = { class: "space-y-1" };
const _hoisted_33$1 = { class: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between" };
const _hoisted_34$1 = { class: "text-xs opacity-70" };
const _hoisted_35$1 = { class: "text-xs opacity-70 leading-relaxed" };
const _hoisted_36$1 = { class: "grid gap-2 sm:grid-cols-2" };
const _hoisted_37$1 = { class: "flex items-center gap-2 text-sm font-medium" };
const _hoisted_38$1 = { class: "text-xs opacity-70 leading-relaxed" };
const _hoisted_39$1 = { class: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AppEditFrameGenSection",
  props: /* @__PURE__ */ mergeModels({
    health: { type: [Object, null], required: true },
    healthLoading: { type: Boolean, required: true },
    healthError: { type: [String, null], required: true },
    losslessActive: { type: Boolean, required: true },
    nvidiaActive: { type: Boolean, required: true },
    usingVirtualDisplay: { type: Boolean, required: true },
    hasActiveLosslessOverrides: { type: Boolean, required: true },
    onLosslessRtssLimitChange: { type: Function, required: true },
    resetActiveLosslessProfile: { type: Function, required: true }
  }, {
    "mode": { type: String, ...{ default: "off" } },
    "modeModifiers": {},
    "gen1": { type: Boolean, ...{ default: false } },
    "gen1Modifiers": {},
    "gen2": { type: Boolean, ...{ default: false } },
    "gen2Modifiers": {},
    "losslessProfile": { type: String, ...{
      default: "recommended"
    } },
    "losslessProfileModifiers": {},
    "losslessTargetFps": { type: [Number, null], ...{ default: null } },
    "losslessTargetFpsModifiers": {},
    "losslessRtssLimit": { type: [Number, null], ...{ default: null } },
    "losslessRtssLimitModifiers": {},
    "losslessFlowScale": { type: [Number, null], ...{ default: null } },
    "losslessFlowScaleModifiers": {},
    "losslessLaunchDelay": { type: [Number, null], ...{
      default: null
    } },
    "losslessLaunchDelayModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["refresh-health", "enable-virtual-screen"], ["update:mode", "update:gen1", "update:gen2", "update:losslessProfile", "update:losslessTargetFps", "update:losslessRtssLimit", "update:losslessFlowScale", "update:losslessLaunchDelay"]),
  setup(__props, { emit: __emit }) {
    const modeModel = useModel(__props, "mode");
    const gen1Model = useModel(__props, "gen1");
    const gen2Model = useModel(__props, "gen2");
    const losslessProfileModel = useModel(__props, "losslessProfile");
    const losslessTargetModel = useModel(__props, "losslessTargetFps");
    const losslessRtssModel = useModel(__props, "losslessRtssLimit");
    const losslessFlowModel = useModel(__props, "losslessFlowScale");
    const losslessLaunchDelayModel = useModel(__props, "losslessLaunchDelay");
    const props = __props;
    const emit = __emit;
    const hasHealthData = computed(() => !!props.health);
    const frameGenOptions = computed(() => [
      { label: "None", value: "off" },
      ...FRAME_GENERATION_PROVIDERS
    ]);
    const isLosslessMode = computed(() => modeModel.value === "lossless-scaling");
    const hasFrameGenSelection = computed(() => modeModel.value !== "off");
    const captureFixModel = computed({
      get: () => gen1Model.value || gen2Model.value,
      set: (enabled) => {
        gen1Model.value = enabled;
        gen2Model.value = false;
      }
    });
    const captureFixDescription = computed(() => {
      if (modeModel.value === "lossless-scaling") {
        return "Uses RTSS Front Edge Sync for Lossless Scaling frame generation. Not required for pure upscaling.";
      }
      if (modeModel.value === "nvidia-smooth-motion") {
        return "Uses RTSS Front Edge Sync while NVIDIA Smooth Motion is active.";
      }
      if (modeModel.value === "game-provided") {
        return "Uses NVIDIA Reflex for game-provided frame generation on NVIDIA systems, and falls back to RTSS Front Edge Sync on AMD systems.";
      }
      return "Enable when the app uses frame generation. Lossless Scaling and NVIDIA Smooth Motion use RTSS Front Edge Sync, while Game Provided uses NVIDIA Reflex unless an AMD GPU is present.";
    });
    const losslessAdvancedTargets = ref(
      losslessTargetModel.value !== null || losslessRtssModel.value !== null
    );
    watch(
      () => [losslessTargetModel.value, losslessRtssModel.value],
      ([target, rtss]) => {
        if (target !== null || rtss !== null) {
          losslessAdvancedTargets.value = true;
        }
      }
    );
    function handleLosslessAdvancedToggle(enabled) {
      losslessAdvancedTargets.value = enabled;
      if (!enabled) {
        losslessTargetModel.value = null;
        losslessRtssModel.value = null;
        props.onLosslessRtssLimitChange(null);
      }
    }
    const requirementRows = computed(() => {
      if (!props.health)
        return [];
      return [
        {
          id: "capture",
          icon: "fa-desktop",
          label: "Windows Graphics Capture (recommended)",
          status: props.health.capture.status,
          message: props.health.capture.message
        },
        {
          id: "rtss",
          icon: "fa-stopwatch",
          label: "RTSS installed (recommended)",
          status: props.health.rtss.status,
          message: props.health.rtss.message
        },
        {
          id: "display",
          icon: "fa-tv",
          label: "Display can double your stream FPS",
          status: props.health.display.status,
          message: props.health.display.message
        }
      ];
    });
    function statusClasses(status) {
      switch (status) {
        case "pass":
          return "bg-emerald-500/10 text-emerald-500";
        case "warn":
          return "bg-amber-500/10 text-amber-500";
        case "fail":
          return "bg-rose-500/10 text-rose-500";
        default:
          return "bg-slate-500/10 text-slate-400";
      }
    }
    function statusIcon(status) {
      switch (status) {
        case "pass":
          return "fa-check-circle";
        case "warn":
          return "fa-exclamation-triangle";
        case "fail":
          return "fa-times-circle";
        default:
          return "fa-question-circle";
      }
    }
    function statusLabel(status) {
      switch (status) {
        case "pass":
          return "Ready";
        case "warn":
          return "Needs attention";
        case "fail":
          return "Fail";
        default:
          return "Unknown";
      }
    }
    function targetIconName(supported) {
      if (supported === true)
        return "fa-check-circle";
      if (supported === false)
        return "fa-times-circle";
      return "fa-question-circle";
    }
    function targetIconClass(supported) {
      if (supported === true)
        return "text-emerald-500";
      if (supported === false)
        return "text-rose-500";
      return "text-amber-500";
    }
    function targetStatusLabel(supported) {
      if (supported === true)
        return "Supported";
      if (supported === false)
        return "Not supported";
      return "Unknown";
    }
    const showSuggestion = computed(() => {
      const health = props.health;
      if (!health || !health.suggestion)
        return null;
      return health.suggestion;
    });
    const canEnableVirtualScreen = computed(() => !props.usingVirtualDisplay);
    const displayTargets = computed(() => {
      var _a;
      return ((_a = props.health) == null ? void 0 : _a.display.targets) || [];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$3, [
          createBaseVNode("div", _hoisted_3$2, [
            _cache[13] || (_cache[13] = createBaseVNode(
              "h3",
              { class: "text-base font-semibold text-dark dark:text-light" },
              " Frame Generation Configuration ",
              -1
              /* CACHED */
            )),
            _cache[14] || (_cache[14] = createBaseVNode(
              "p",
              { class: "text-xs leading-relaxed opacity-70" },
              " Select how Vibepollo coordinates frame generation and review the capture safeguards needed for smooth playback. ",
              -1
              /* CACHED */
            )),
            createBaseVNode("div", _hoisted_4$2, [
              _ctx.losslessActive ? (openBlock(), createBlock(unref(NTag), {
                key: 0,
                size: "small",
                type: "primary"
              }, {
                default: withCtx(() => [
                  createVNode(LucideIcon, {
                    name: "fa-bolt",
                    size: 12,
                    class: "mr-1"
                  }),
                  _cache[10] || (_cache[10] = createTextVNode(
                    " Lossless Scaling frame generation active ",
                    -1
                    /* CACHED */
                  ))
                ]),
                _: 1,
                __: [10]
              })) : createCommentVNode("v-if", true),
              _ctx.nvidiaActive ? (openBlock(), createBlock(unref(NTag), {
                key: 1,
                size: "small",
                type: "info"
              }, {
                default: withCtx(() => [
                  createVNode(LucideIcon, {
                    name: "fa-nvidia",
                    size: 12,
                    class: "mr-1"
                  }),
                  _cache[11] || (_cache[11] = createTextVNode(
                    " NVIDIA Smooth Motion active ",
                    -1
                    /* CACHED */
                  ))
                ]),
                _: 1,
                __: [11]
              })) : createCommentVNode("v-if", true),
              _ctx.usingVirtualDisplay ? (openBlock(), createBlock(unref(NTag), {
                key: 2,
                size: "small",
                type: "success"
              }, {
                default: withCtx(() => [
                  createVNode(LucideIcon, {
                    name: "fa-display",
                    size: 12,
                    class: "mr-1"
                  }),
                  _cache[12] || (_cache[12] = createTextVNode(
                    " Vibepollo virtual screen in use ",
                    -1
                    /* CACHED */
                  ))
                ]),
                _: 1,
                __: [12]
              })) : createCommentVNode("v-if", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_5$2, [
            createVNode(unref(NButton), {
              size: "small",
              tertiary: "",
              loading: _ctx.healthLoading,
              onClick: _cache[0] || (_cache[0] = ($event) => emit("refresh-health"))
            }, {
              default: withCtx(() => [
                createVNode(LucideIcon, {
                  name: "fa-stethoscope",
                  size: 14
                }),
                _cache[15] || (_cache[15] = createBaseVNode(
                  "span",
                  { class: "ml-2" },
                  "Run health check",
                  -1
                  /* CACHED */
                ))
              ]),
              _: 1,
              __: [15]
            }, 8, ["loading"])
          ])
        ]),
        createBaseVNode("div", _hoisted_6$2, [
          createBaseVNode("div", _hoisted_7$2, [
            _cache[16] || (_cache[16] = createBaseVNode(
              "label",
              { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
              " Frame Generation Kind ",
              -1
              /* CACHED */
            )),
            createVNode(unref(NSelect), {
              value: modeModel.value,
              "onUpdate:value": _cache[1] || (_cache[1] = ($event) => modeModel.value = $event),
              options: frameGenOptions.value,
              size: "small",
              clearable: false
            }, null, 8, ["value", "options"]),
            _cache[17] || (_cache[17] = createBaseVNode(
              "p",
              { class: "text-xs opacity-70 leading-relaxed" },
              " None keeps Vibepollo out of the loop, Game Provided trusts in-game frame generation, Lossless Scaling wraps LSFG, and NVIDIA Smooth Motion configures the driver each launch. ",
              -1
              /* CACHED */
            ))
          ]),
          isLosslessMode.value ? (openBlock(), createElementBlock("div", _hoisted_8$2, [
            createBaseVNode("div", _hoisted_9$2, [
              _cache[19] || (_cache[19] = createBaseVNode(
                "div",
                { class: "space-y-1" },
                [
                  createBaseVNode("div", { class: "font-medium text-sm" }, "Lossless Scaling Frame Generation"),
                  createBaseVNode("p", { class: "text-xs opacity-70 leading-relaxed" }, " Use Vibepollo’s tuned profile or your Lossless Scaling defaults, then fine-tune the runtime targets. ")
                ],
                -1
                /* CACHED */
              )),
              createVNode(unref(NButton), {
                size: "small",
                tertiary: "",
                disabled: !props.hasActiveLosslessOverrides,
                onClick: _cache[2] || (_cache[2] = ($event) => props.resetActiveLosslessProfile())
              }, {
                default: withCtx(() => _cache[18] || (_cache[18] = [
                  createTextVNode(
                    " Reset to Profile Defaults ",
                    -1
                    /* CACHED */
                  )
                ])),
                _: 1,
                __: [18]
              }, 8, ["disabled"])
            ]),
            createBaseVNode("div", _hoisted_10$2, [
              _cache[22] || (_cache[22] = createBaseVNode(
                "label",
                { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                "Profile",
                -1
                /* CACHED */
              )),
              createVNode(unref(NRadioGroup), {
                value: losslessProfileModel.value,
                "onUpdate:value": _cache[3] || (_cache[3] = ($event) => losslessProfileModel.value = $event),
                class: "flex flex-col space-y-2"
              }, {
                default: withCtx(() => [
                  createVNode(unref(NRadio), {
                    value: "recommended",
                    class: "w-full py-2 px-2 rounded-md hover:bg-surface/10"
                  }, {
                    default: withCtx(() => _cache[20] || (_cache[20] = [
                      createBaseVNode(
                        "div",
                        { class: "flex items-center gap-2 w-full" },
                        [
                          createBaseVNode("span", { class: "block text-sm" }, "Recommended (Lowest Latency & Frame Pacing)")
                        ],
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [20]
                  }),
                  createVNode(unref(NRadio), {
                    value: "custom",
                    class: "w-full py-2 px-2 rounded-md hover:bg-surface/10"
                  }, {
                    default: withCtx(() => _cache[21] || (_cache[21] = [
                      createBaseVNode(
                        "div",
                        { class: "flex items-center gap-2 w-full" },
                        [
                          createBaseVNode("span", { class: "block text-sm" }, "Custom: Use my Lossless Scaling default profile")
                        ],
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [21]
                  })
                ]),
                _: 1
                /* STABLE */
              }, 8, ["value"]),
              _cache[23] || (_cache[23] = createBaseVNode(
                "p",
                { class: "text-xs opacity-60 leading-relaxed" },
                " Recommended mirrors Vibepollo’s latency-focused template. Custom runs the profile you maintain inside Lossless Scaling. ",
                -1
                /* CACHED */
              ))
            ]),
            createBaseVNode("div", _hoisted_11$2, [
              createBaseVNode("div", _hoisted_12$1, [
                _cache[26] || (_cache[26] = createBaseVNode(
                  "label",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  " Frame Targets ",
                  -1
                  /* CACHED */
                )),
                _cache[27] || (_cache[27] = createBaseVNode(
                  "p",
                  { class: "text-xs opacity-60 leading-relaxed" },
                  " Vibepollo inherits the FPS your streaming client requests and forwards it to Lossless Scaling automatically. When RTSS is available we cap it at half of that request for steadier pacing. ",
                  -1
                  /* CACHED */
                )),
                createBaseVNode("div", _hoisted_13$1, [
                  createVNode(unref(NSwitch), {
                    size: "small",
                    value: losslessAdvancedTargets.value,
                    "onUpdate:value": handleLosslessAdvancedToggle
                  }, null, 8, ["value"]),
                  _cache[24] || (_cache[24] = createBaseVNode(
                    "span",
                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                    " Advanced overrides ",
                    -1
                    /* CACHED */
                  )),
                  _cache[25] || (_cache[25] = createBaseVNode(
                    "span",
                    { class: "text-xs opacity-60" },
                    "Manual FPS & RTSS",
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              losslessAdvancedTargets.value ? (openBlock(), createElementBlock("div", _hoisted_14$1, [
                createBaseVNode("div", _hoisted_15$1, [
                  _cache[28] || (_cache[28] = createBaseVNode(
                    "label",
                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                    " Target Frame Rate Override ",
                    -1
                    /* CACHED */
                  )),
                  createVNode(unref(NInputNumber), {
                    value: losslessTargetModel.value,
                    "onUpdate:value": _cache[4] || (_cache[4] = ($event) => losslessTargetModel.value = $event),
                    min: 1,
                    max: 360,
                    step: 1,
                    precision: 0,
                    placeholder: "120",
                    size: "small"
                  }, null, 8, ["value"]),
                  _cache[29] || (_cache[29] = createBaseVNode(
                    "p",
                    { class: "text-xs opacity-60 leading-relaxed" },
                    " Only set this when you need to override the client’s requested FPS for Lossless Scaling. ",
                    -1
                    /* CACHED */
                  ))
                ]),
                createBaseVNode("div", _hoisted_16$1, [
                  _cache[30] || (_cache[30] = createBaseVNode(
                    "label",
                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                    " RTSS Frame Limit Override ",
                    -1
                    /* CACHED */
                  )),
                  createVNode(unref(NInputNumber), {
                    value: losslessRtssModel.value,
                    "onUpdate:value": [
                      _cache[5] || (_cache[5] = ($event) => losslessRtssModel.value = $event),
                      props.onLosslessRtssLimitChange
                    ],
                    min: 1,
                    max: 360,
                    step: 1,
                    precision: 0,
                    placeholder: "60",
                    size: "small"
                  }, null, 8, ["value", "onUpdate:value"]),
                  _cache[31] || (_cache[31] = createBaseVNode(
                    "p",
                    { class: "text-xs opacity-60 leading-relaxed" },
                    " Vibepollo defaults to half of the client request when left blank. Requires RTSS installed and running. ",
                    -1
                    /* CACHED */
                  ))
                ])
              ])) : createCommentVNode("v-if", true),
              createBaseVNode("div", _hoisted_17$1, [
                _cache[32] || (_cache[32] = createBaseVNode(
                  "label",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  " Flow Scale (%) ",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NInputNumber), {
                  value: losslessFlowModel.value,
                  "onUpdate:value": _cache[6] || (_cache[6] = ($event) => losslessFlowModel.value = $event),
                  min: unref(LOSSLESS_FLOW_MIN),
                  max: unref(LOSSLESS_FLOW_MAX),
                  step: 1,
                  precision: 0,
                  placeholder: "50",
                  size: "small"
                }, null, 8, ["value", "min", "max"]),
                _cache[33] || (_cache[33] = createBaseVNode(
                  "p",
                  { class: "text-xs opacity-60 leading-relaxed" },
                  " Frame blending strength (0–100). Vibepollo recommends 50% as a balanced default. ",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_18$1, [
                _cache[34] || (_cache[34] = createBaseVNode(
                  "label",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  " Lossless Launch Delay (seconds) ",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NInputNumber), {
                  value: losslessLaunchDelayModel.value,
                  "onUpdate:value": _cache[7] || (_cache[7] = ($event) => losslessLaunchDelayModel.value = $event),
                  min: 0,
                  max: 600,
                  step: 1,
                  precision: 0,
                  placeholder: "8",
                  size: "small"
                }, null, 8, ["value"]),
                _cache[35] || (_cache[35] = createBaseVNode(
                  "p",
                  { class: "text-xs opacity-60 leading-relaxed" },
                  " Wait additional seconds after the game starts before opening Lossless Scaling. Leave blank to use the default 8-second delay. ",
                  -1
                  /* CACHED */
                ))
              ])
            ])
          ])) : createCommentVNode("v-if", true),
          createBaseVNode("div", _hoisted_19$1, [
            createBaseVNode("div", _hoisted_20$1, [
              createBaseVNode("div", _hoisted_21$1, [
                _cache[36] || (_cache[36] = createBaseVNode(
                  "div",
                  { class: "font-medium text-sm" },
                  "Frame Generation Capture Fix",
                  -1
                  /* CACHED */
                )),
                createBaseVNode(
                  "p",
                  _hoisted_22$1,
                  toDisplayString(captureFixDescription.value),
                  1
                  /* TEXT */
                )
              ]),
              createVNode(unref(NSwitch), {
                value: captureFixModel.value,
                "onUpdate:value": _cache[8] || (_cache[8] = ($event) => captureFixModel.value = $event),
                size: "large",
                disabled: !hasFrameGenSelection.value
              }, null, 8, ["value", "disabled"])
            ])
          ]),
          createBaseVNode("div", _hoisted_23$1, [
            _ctx.healthError ? (openBlock(), createBlock(unref(NAlert), {
              key: 0,
              type: "error",
              size: "small"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.healthError),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : !hasHealthData.value && !_ctx.healthLoading ? (openBlock(), createBlock(unref(NAlert), {
              key: 1,
              size: "small",
              type: "info"
            }, {
              default: withCtx(() => _cache[37] || (_cache[37] = [
                createTextVNode(
                  " Run the health check to verify capture method, RTSS, and display refresh requirements before streaming with frame generation. ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [37]
            })) : _ctx.healthLoading && !hasHealthData.value ? (openBlock(), createBlock(unref(NAlert), {
              key: 2,
              type: "info",
              size: "small",
              bordered: false
            }, {
              default: withCtx(() => _cache[38] || (_cache[38] = [
                createTextVNode(
                  " Checking requirements... ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [38]
            })) : createCommentVNode("v-if", true)
          ]),
          _ctx.health ? (openBlock(), createElementBlock("div", _hoisted_24$1, [
            (openBlock(true), createElementBlock(
              Fragment,
              null,
              renderList(requirementRows.value, (row) => {
                return openBlock(), createElementBlock("div", {
                  key: row.id,
                  class: "rounded-xl border border-dark/10 dark:border-light/10 bg-white/40 dark:bg-white/5 p-3"
                }, [
                  createBaseVNode("div", _hoisted_25$1, [
                    createBaseVNode("div", _hoisted_26$1, [
                      createBaseVNode("div", _hoisted_27$1, [
                        createVNode(LucideIcon, {
                          name: row.icon,
                          size: 16
                        }, null, 8, ["name"])
                      ]),
                      createBaseVNode("div", _hoisted_28$1, [
                        createBaseVNode(
                          "div",
                          _hoisted_29$1,
                          toDisplayString(row.label),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "p",
                          _hoisted_30$1,
                          toDisplayString(row.message),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    createBaseVNode(
                      "div",
                      {
                        class: normalizeClass([
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap",
                          statusClasses(row.status)
                        ])
                      },
                      [
                        createVNode(LucideIcon, {
                          name: statusIcon(row.status),
                          size: 14
                        }, null, 8, ["name"]),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(statusLabel(row.status)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            createBaseVNode("div", _hoisted_31$1, [
              createBaseVNode("div", _hoisted_32$1, [
                createBaseVNode("div", _hoisted_33$1, [
                  _cache[39] || (_cache[39] = createBaseVNode(
                    "div",
                    { class: "font-medium text-sm" },
                    "Refresh rate coverage",
                    -1
                    /* CACHED */
                  )),
                  createBaseVNode(
                    "div",
                    _hoisted_34$1,
                    " Targeted display: " + toDisplayString(_ctx.health.display.deviceLabel || "Targeted display"),
                    1
                    /* TEXT */
                  )
                ]),
                createBaseVNode(
                  "p",
                  _hoisted_35$1,
                  toDisplayString(_ctx.health.display.message),
                  1
                  /* TEXT */
                )
              ]),
              createBaseVNode("div", _hoisted_36$1, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(displayTargets.value, (target) => {
                    return openBlock(), createElementBlock("div", {
                      key: target.fps,
                      class: "rounded-lg border border-dark/10 dark:border-light/10 bg-white/50 dark:bg-white/10 px-3 py-2 space-y-1"
                    }, [
                      createBaseVNode("div", _hoisted_37$1, [
                        createVNode(LucideIcon, {
                          name: targetIconName(target.supported),
                          size: 14,
                          class: normalizeClass(targetIconClass(target.supported))
                        }, null, 8, ["name", "class"]),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(target.fps) + " FPS stream",
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode(
                        "div",
                        _hoisted_38$1,
                        " Needs " + toDisplayString(target.requiredHz) + " Hz - " + toDisplayString(targetStatusLabel(target.supported)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              _ctx.health.display.error ? (openBlock(), createBlock(unref(NAlert), {
                key: 0,
                type: "warning",
                size: "small",
                "show-icon": false,
                class: "text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(_ctx.health.display.error),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              })) : createCommentVNode("v-if", true)
            ])
          ])) : createCommentVNode("v-if", true),
          showSuggestion.value ? (openBlock(), createBlock(unref(NAlert), {
            key: 2,
            type: showSuggestion.value.emphasis === "warning" ? "warning" : "info",
            size: "small"
          }, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_39$1, [
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(showSuggestion.value.message),
                  1
                  /* TEXT */
                ),
                canEnableVirtualScreen.value ? (openBlock(), createBlock(unref(NButton), {
                  key: 0,
                  size: "small",
                  type: "primary",
                  onClick: _cache[9] || (_cache[9] = ($event) => emit("enable-virtual-screen"))
                }, {
                  default: withCtx(() => _cache[40] || (_cache[40] = [
                    createTextVNode(
                      " Use Virtual Screen ",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [40]
                })) : createCommentVNode("v-if", true)
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["type"])) : createCommentVNode("v-if", true),
          _cache[41] || (_cache[41] = createBaseVNode(
            "p",
            { class: "text-xs opacity-70 leading-relaxed" },
            " Frame generation capture fixes are only needed when using frame generation technologies. Upscaling alone can stay disabled. ",
            -1
            /* CACHED */
          ))
        ])
      ]);
    };
  }
});
const AppEditFrameGenSection = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditFrameGenSection.vue"]]);
const _hoisted_1$2 = { class: "flex items-center justify-between w-full" };
const _hoisted_2$2 = { class: "min-h-[160px]" };
const _hoisted_3$1 = {
  key: 0,
  class: "flex items-center justify-center py-10"
};
const _hoisted_4$1 = { key: 1 };
const _hoisted_5$1 = { class: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[420px] overflow-auto pr-1" };
const _hoisted_6$1 = ["onClick"];
const _hoisted_7$1 = { class: "relative rounded overflow-hidden aspect-[3/4] bg-black/5 dark:bg-white/5" };
const _hoisted_8$1 = ["src"];
const _hoisted_9$1 = {
  key: 0,
  class: "absolute inset-0 bg-black/20 dark:bg-white/10 flex items-center justify-center"
};
const _hoisted_10$1 = ["title"];
const _hoisted_11$1 = {
  key: 0,
  class: "col-span-full text-center opacity-70 py-8"
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppEditCoverModal",
  props: {
    visible: { type: Boolean, required: true },
    coverSearching: { type: Boolean, required: true },
    coverBusy: { type: Boolean, required: true },
    coverCandidates: { type: Array, required: true }
  },
  emits: ["update:visible", "pick"],
  setup(__props, { emit: __emit }) {
    const rawProps = __props;
    const emit = __emit;
    const { visible, coverSearching, coverBusy, coverCandidates } = toRefs(rawProps);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NModal), {
        show: unref(visible),
        "z-index": 3300,
        "mask-style": { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" },
        "onUpdate:show": _cache[1] || (_cache[1] = (v) => emit("update:visible", v))
      }, {
        default: withCtx(() => [
          createVNode(unref(NCard), {
            bordered: false,
            style: { "max-width": "48rem", "width": "100%" }
          }, {
            header: withCtx(() => [
              createBaseVNode("div", _hoisted_1$2, [
                _cache[3] || (_cache[3] = createBaseVNode(
                  "span",
                  { class: "font-semibold" },
                  "Covers Found",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NButton), {
                  type: "default",
                  strong: "",
                  size: "small",
                  onClick: _cache[0] || (_cache[0] = ($event) => emit("update:visible", false))
                }, {
                  default: withCtx(() => _cache[2] || (_cache[2] = [
                    createTextVNode(
                      " Close ",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [2]
                })
              ])
            ]),
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_2$2, [
                unref(coverSearching) ? (openBlock(), createElementBlock("div", _hoisted_3$1, [
                  createVNode(unref(NSpin), { size: "large" }, {
                    default: withCtx(() => _cache[4] || (_cache[4] = [
                      createTextVNode(
                        "Loading…",
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [4]
                  })
                ])) : (openBlock(), createElementBlock("div", _hoisted_4$1, [
                  createBaseVNode("div", _hoisted_5$1, [
                    (openBlock(true), createElementBlock(
                      Fragment,
                      null,
                      renderList(unref(coverCandidates), (cover, i) => {
                        return openBlock(), createElementBlock("div", {
                          key: i,
                          class: "cursor-pointer group",
                          onClick: ($event) => emit("pick", cover)
                        }, [
                          createBaseVNode("div", _hoisted_7$1, [
                            createBaseVNode("img", {
                              src: cover.url,
                              class: "absolute inset-0 w-full h-full object-cover"
                            }, null, 8, _hoisted_8$1),
                            unref(coverBusy) ? (openBlock(), createElementBlock("div", _hoisted_9$1, [
                              createVNode(unref(NSpin), { size: "small" })
                            ])) : createCommentVNode("v-if", true)
                          ]),
                          createBaseVNode("div", {
                            class: "mt-1 text-xs text-center truncate",
                            title: cover.name
                          }, toDisplayString(cover.name), 9, _hoisted_10$1)
                        ], 8, _hoisted_6$1);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    !unref(coverCandidates).length ? (openBlock(), createElementBlock("div", _hoisted_11$1, " No results. Try adjusting the app name. ")) : createCommentVNode("v-if", true)
                  ])
                ]))
              ])
            ]),
            _: 1
            /* STABLE */
          })
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"]);
    };
  }
});
const AppEditCoverModal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditCoverModal.vue"]]);
const _hoisted_1$1 = { class: "text-sm text-center space-y-2" };
const _hoisted_2$1 = { class: "w-full flex items-center justify-center gap-3" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AppEditDeleteConfirmModal",
  props: {
    visible: { type: Boolean, required: true },
    isPlayniteAuto: { type: Boolean, required: true },
    name: { type: String, required: true }
  },
  emits: ["update:visible", "cancel", "confirm"],
  setup(__props, { emit: __emit }) {
    const rawProps = __props;
    const { visible, isPlayniteAuto, name } = toRefs(rawProps);
    const emit = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NModal), {
        show: unref(visible),
        "z-index": 3300,
        "mask-style": { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" },
        "onUpdate:show": _cache[2] || (_cache[2] = (v) => emit("update:visible", v))
      }, {
        default: withCtx(() => [
          createVNode(unref(NCard), {
            title: unref(isPlayniteAuto) ? "Remove and Exclude from Auto‑Sync?" : _ctx.$t("apps.confirm_delete_title_named", { name: unref(name) }),
            bordered: false,
            style: { "max-width": "32rem", "width": "100%" }
          }, {
            footer: withCtx(() => [
              createBaseVNode("div", _hoisted_2$1, [
                createVNode(unref(NButton), {
                  type: "default",
                  strong: "",
                  onClick: _cache[0] || (_cache[0] = ($event) => emit("cancel"))
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("_common.cancel")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }),
                createVNode(unref(NButton), {
                  type: "error",
                  strong: "",
                  onClick: _cache[1] || (_cache[1] = ($event) => emit("confirm"))
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("apps.delete")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                })
              ])
            ]),
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_1$1, [
                unref(isPlayniteAuto) ? (openBlock(), createElementBlock(
                  Fragment,
                  { key: 0 },
                  [
                    _cache[3] || (_cache[3] = createBaseVNode(
                      "div",
                      null,
                      " This application is managed by Playnite. Removing it will also add it to the Excluded Games list so it won’t be auto‑synced back. ",
                      -1
                      /* CACHED */
                    )),
                    _cache[4] || (_cache[4] = createBaseVNode(
                      "div",
                      { class: "opacity-80" },
                      " You can restore it later by manually adding it, or by removing the exclusion under Settings → Playnite. ",
                      -1
                      /* CACHED */
                    )),
                    _cache[5] || (_cache[5] = createBaseVNode(
                      "div",
                      { class: "opacity-70" },
                      "Do you want to continue?",
                      -1
                      /* CACHED */
                    ))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (openBlock(), createElementBlock(
                  Fragment,
                  { key: 1 },
                  [
                    createTextVNode(
                      toDisplayString(_ctx.$t("apps.confirm_delete_message_named", { name: unref(name) })),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title"])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"]);
    };
  }
});
const AppEditDeleteConfirmModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/app-edit/AppEditDeleteConfirmModal.vue"]]);
const _hoisted_1 = { class: "flex items-center justify-between gap-3" };
const _hoisted_2 = { class: "flex items-center gap-3" };
const _hoisted_3 = { class: "h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center shadow-inner" };
const _hoisted_4 = { class: "flex flex-col" };
const _hoisted_5 = { class: "text-xl font-semibold" };
const _hoisted_6 = { class: "shrink-0" };
const _hoisted_7 = {
  key: 0,
  class: "inline-flex items-center px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-semibold"
};
const _hoisted_8 = {
  key: 1,
  class: "inline-flex items-center px-2 py-0.5 rounded bg-dark/10 dark:bg-light/10 text-xs font-semibold"
};
const _hoisted_9 = {
  key: 0,
  class: "scroll-shadow-top",
  "aria-hidden": "true"
};
const _hoisted_10 = {
  key: 1,
  class: "scroll-shadow-bottom",
  "aria-hidden": "true"
};
const _hoisted_11 = ["onKeydown"];
const _hoisted_12 = { class: "rounded-lg border border-dark/10 dark:border-light/10 px-3 pb-3 pt-1" };
const _hoisted_13 = { class: "grid grid-cols-2 gap-3" };
const _hoisted_14 = { class: "flex flex-col" };
const _hoisted_15 = { class: "text-xs opacity-60" };
const _hoisted_16 = {
  key: 0,
  class: "space-y-5 rounded-xl bg-light/60 dark:bg-dark/40 p-4"
};
const _hoisted_17 = { class: "space-y-2" };
const _hoisted_18 = { class: "flex items-center justify-between gap-3" };
const _hoisted_19 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_20 = { class: "text-xs opacity-70" };
const _hoisted_21 = { class: "space-y-2" };
const _hoisted_22 = { class: "app-radio-card-title" };
const _hoisted_23 = { class: "app-radio-card-title" };
const _hoisted_24 = {
  key: 0,
  class: "space-y-2"
};
const _hoisted_25 = { class: "flex items-center justify-between gap-3" };
const _hoisted_26 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_27 = { class: "text-xs opacity-70" };
const _hoisted_28 = { class: "text-xs opacity-70" };
const _hoisted_29 = {
  key: 0,
  class: "text-red-500"
};
const _hoisted_30 = { key: 1 };
const _hoisted_31 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_32 = { class: "flex items-center justify-between gap-3" };
const _hoisted_33 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_34 = { class: "text-xs opacity-70" };
const _hoisted_35 = {
  key: 2,
  class: "space-y-5 rounded-xl bg-light/40 dark:bg-dark/40 p-3 md:p-4"
};
const _hoisted_36 = { class: "space-y-2" };
const _hoisted_37 = { class: "flex items-center justify-between gap-3" };
const _hoisted_38 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_39 = { class: "text-xs opacity-70" };
const _hoisted_40 = { class: "app-radio-card-title" };
const _hoisted_41 = {
  key: 0,
  class: "text-xs opacity-70"
};
const _hoisted_42 = { class: "space-y-2" };
const _hoisted_43 = { class: "flex items-center justify-between gap-3" };
const _hoisted_44 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_45 = { class: "text-xs opacity-70" };
const _hoisted_46 = ["onClick", "onKeydown"];
const _hoisted_47 = { class: "flex items-center gap-3" };
const _hoisted_48 = { class: "text-sm font-semibold" };
const _hoisted_49 = { class: "text-xs opacity-70 leading-snug ml-6" };
const _hoisted_50 = { class: "flex items-center justify-center pt-1" };
const _hoisted_51 = { class: "space-y-3" };
const _hoisted_52 = { class: "flex items-center justify-between" };
const _hoisted_53 = {
  key: 0,
  class: "text-xs opacity-60"
};
const _hoisted_54 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_55 = { class: "flex items-center justify-between gap-2 mb-2" };
const _hoisted_56 = { class: "text-xs opacity-70" };
const _hoisted_57 = { class: "flex items-center gap-2" };
const _hoisted_58 = { class: "grid grid-cols-1 gap-2" };
const _hoisted_59 = { class: "flex items-center justify-end w-full gap-2 border-t border-dark/10 dark:border-light/10 bg-light/80 dark:bg-surface/80 backdrop-blur px-2 py-2" };
const SCALE_FACTOR_MIN = 20;
const SCALE_FACTOR_MAX = 200;
const VIRTUAL_DISPLAY_SELECTION = "sunshine:sudovda_virtual_display";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppEditModal",
  props: {
    modelValue: { type: Boolean, required: true },
    app: { type: [Object, null], required: false },
    index: { type: Number, required: false }
  },
  emits: ["update:modelValue", "saved", "deleted"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const open = computed(() => !!props.modelValue);
    const message = useMessage();
    const { t } = useI18n();
    function fresh() {
      return {
        index: -1,
        name: "",
        cmd: "",
        workingDir: "",
        imagePath: "",
        excludeGlobalPrepCmd: false,
        excludeGlobalStateCmd: false,
        configOverrides: {},
        elevated: false,
        autoDetach: true,
        waitAll: true,
        terminateOnPause: false,
        allowClientCommands: true,
        useAppIdentity: false,
        perClientAppIdentity: false,
        gamepad: "",
        scaleFactor: 100,
        frameGenLimiterFix: false,
        exitTimeout: 5,
        prepCmd: [],
        stateCmd: [],
        detached: [],
        virtualScreen: false,
        gen1FramegenFix: false,
        gen2FramegenFix: false,
        output: "",
        frameGenerationProvider: "game-provided",
        frameGenerationMode: "off",
        losslessScalingEnabled: false,
        losslessScalingTargetFps: null,
        losslessScalingRtssLimit: null,
        losslessScalingRtssTouched: false,
        losslessScalingProfile: "recommended",
        losslessScalingProfiles: emptyLosslessProfileState(),
        losslessScalingLaunchDelay: null,
        virtualDisplayMode: null,
        virtualDisplayLayout: null,
        ddConfigurationOption: null
      };
    }
    const form = ref(fresh());
    const overridesPickerOpen = ref(false);
    const APP_VIRTUAL_DISPLAY_MODES = ["disabled", "per_client", "shared"];
    const APP_VIRTUAL_DISPLAY_LAYOUTS = [
      "exclusive",
      "extended",
      "extended_primary",
      "extended_isolated",
      "extended_primary_isolated"
    ];
    function parseAppVirtualDisplayMode(value) {
      if (typeof value !== "string") {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      if (APP_VIRTUAL_DISPLAY_MODES.includes(normalized)) {
        return normalized;
      }
      return null;
    }
    function parseAppVirtualDisplayLayout(value) {
      if (typeof value !== "string") {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      if (APP_VIRTUAL_DISPLAY_LAYOUTS.includes(normalized)) {
        return normalized;
      }
      return null;
    }
    watch(
      () => form.value.playniteId,
      () => {
        const et = form.value.exitTimeout;
        if (form.value.playniteId && (typeof et !== "number" || et === 5)) {
          form.value.exitTimeout = 10;
        }
      }
    );
    watch(
      () => form.value.useAppIdentity,
      (enabled) => {
        if (!enabled) {
          form.value.perClientAppIdentity = false;
        }
      }
    );
    watch(
      () => form.value.scaleFactor,
      (value) => {
        const clamped = clampScaleFactor(
          typeof value === "number" && Number.isFinite(value) ? value : null
        );
        if (clamped !== value) {
          form.value.scaleFactor = clamped;
        }
      }
    );
    function clampScaleFactor(value) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return 100;
      }
      const rounded = Math.round(value);
      return Math.min(SCALE_FACTOR_MAX, Math.max(SCALE_FACTOR_MIN, rounded));
    }
    function fromServerApp(src, idx = -1) {
      const base = fresh();
      if (!src)
        return { ...base, index: idx };
      const cmdStr = Array.isArray(src.cmd) ? src.cmd.join(" ") : src.cmd ?? "";
      const prep = Array.isArray(src["prep-cmd"]) ? src["prep-cmd"].map((p) => ({
        do: String((p == null ? void 0 : p.do) ?? ""),
        undo: String((p == null ? void 0 : p.undo) ?? ""),
        elevated: !!(p == null ? void 0 : p.elevated)
      })) : [];
      const state = Array.isArray(src["state-cmd"]) ? src["state-cmd"].map((p) => ({
        do: String((p == null ? void 0 : p.do) ?? ""),
        undo: String((p == null ? void 0 : p.undo) ?? ""),
        elevated: !!(p == null ? void 0 : p.elevated)
      })) : [];
      const isPlayniteLinked = !!src["playnite-id"];
      const derivedExitTimeout = typeof src["exit-timeout"] === "number" ? src["exit-timeout"] : isPlayniteLinked ? 10 : base.exitTimeout;
      const legacyLosslessFlag = !!src["lossless-scaling-framegen"];
      const lsTarget = parseNumeric(src["lossless-scaling-target-fps"]);
      const lsLimit = parseNumeric(src["lossless-scaling-rtss-limit"]);
      const lsLaunchDelayRaw = parseNumeric(src["lossless-scaling-launch-delay"]);
      const lsLaunchDelay = lsLaunchDelayRaw && lsLaunchDelayRaw > 0 ? Math.round(lsLaunchDelayRaw) : null;
      const profileKey = parseLosslessProfileKey(src["lossless-scaling-profile"]);
      const losslessProfiles = emptyLosslessProfileState();
      losslessProfiles.recommended = parseLosslessOverrides(src["lossless-scaling-recommended"]);
      losslessProfiles.custom = parseLosslessOverrides(src["lossless-scaling-custom"]);
      const frameGenerationModeFromConfig = parseFrameGenerationMode(
        src == null ? void 0 : src["frame-generation-mode"]
      );
      const useAppIdentity = !!src["use-app-identity"];
      const normalizedProvider = normalizeFrameGenerationProvider(src["frame-generation-provider"]);
      let frameGenerationMode = frameGenerationModeFromConfig ?? "off";
      if (!frameGenerationModeFromConfig) {
        if (normalizedProvider === "nvidia-smooth-motion") {
          frameGenerationMode = "nvidia-smooth-motion";
        } else if (normalizedProvider === "lossless-scaling") {
          const hasLosslessFrameGen = legacyLosslessFlag || lsTarget !== null || lsLimit !== null;
          frameGenerationMode = hasLosslessFrameGen ? "lossless-scaling" : "off";
        } else if (normalizedProvider === "game-provided") {
          frameGenerationMode = "game-provided";
        }
      }
      const hasExplicitLosslessEnabled = Object.prototype.hasOwnProperty.call(
        src,
        "lossless-scaling-enabled"
      );
      const lsEnabled = typeof src["lossless-scaling-enabled"] === "boolean" ? src["lossless-scaling-enabled"] : !hasExplicitLosslessEnabled && frameGenerationMode !== "lossless-scaling" && legacyLosslessFlag;
      const frameGenerationProvider = frameGenerationModeFromConfig && frameGenerationModeFromConfig !== "off" ? frameGenerationModeFromConfig : normalizedProvider;
      const rawOutput = String(src.output ?? "");
      const rawVirtualScreen = src["virtual-screen"];
      const virtualScreen = typeof rawVirtualScreen === "boolean" ? rawVirtualScreen : rawOutput === VIRTUAL_DISPLAY_SELECTION;
      const serverVirtualDisplayMode = parseAppVirtualDisplayMode(
        src == null ? void 0 : src["virtual-display-mode"]
      );
      const serverVirtualDisplayLayout = parseAppVirtualDisplayLayout(
        src == null ? void 0 : src["virtual-display-layout"]
      );
      const ddConfigRaw = src == null ? void 0 : src["dd-configuration-option"];
      let ddConfigValue = null;
      if (typeof ddConfigRaw === "string") {
        const normalized = ddConfigRaw.trim().toLowerCase();
        const allowed = [
          "disabled",
          "verify_only",
          "ensure_active",
          "ensure_primary",
          "ensure_only_display"
        ];
        if (allowed.includes(normalized)) {
          ddConfigValue = normalized;
        }
      }
      const captureFixEnabled = !!(src["gen1-framegen-fix"] || src["dlss-framegen-capture-fix"] || src["gen2-framegen-fix"]);
      return {
        index: idx,
        uuid: typeof src.uuid === "string" ? src.uuid : void 0,
        name: String(src.name ?? ""),
        output: rawOutput,
        cmd: String(cmdStr ?? ""),
        workingDir: String(src["working-dir"] ?? ""),
        imagePath: String(src["image-path"] ?? ""),
        excludeGlobalPrepCmd: !!src["exclude-global-prep-cmd"],
        excludeGlobalStateCmd: !!src["exclude-global-state-cmd"],
        configOverrides: (src == null ? void 0 : src["config-overrides"]) && typeof src["config-overrides"] === "object" && !Array.isArray(src["config-overrides"]) ? JSON.parse(JSON.stringify(src["config-overrides"])) : {},
        elevated: !!src.elevated,
        autoDetach: src["auto-detach"] !== void 0 ? !!src["auto-detach"] : base.autoDetach,
        waitAll: src["wait-all"] !== void 0 ? !!src["wait-all"] : base.waitAll,
        terminateOnPause: src["terminate-on-pause"] !== void 0 ? !!src["terminate-on-pause"] : base.terminateOnPause,
        allowClientCommands: src["allow-client-commands"] !== void 0 ? !!src["allow-client-commands"] : base.allowClientCommands,
        useAppIdentity,
        perClientAppIdentity: useAppIdentity && src["per-client-app-identity"] !== void 0 ? !!src["per-client-app-identity"] : base.perClientAppIdentity,
        gamepad: typeof src.gamepad === "string" ? src.gamepad : "",
        scaleFactor: clampScaleFactor(parseNumeric(src["scale-factor"])),
        frameGenLimiterFix: src["frame-gen-limiter-fix"] !== void 0 ? !!src["frame-gen-limiter-fix"] : base.frameGenLimiterFix,
        exitTimeout: derivedExitTimeout,
        prepCmd: prep,
        stateCmd: state,
        detached: Array.isArray(src.detached) ? src.detached.map((s) => String(s)) : [],
        virtualScreen,
        gen1FramegenFix: captureFixEnabled,
        gen2FramegenFix: false,
        playniteId: src["playnite-id"] || void 0,
        playniteManaged: src["playnite-managed"] || void 0,
        frameGenerationProvider,
        frameGenerationMode,
        losslessScalingEnabled: lsEnabled,
        losslessScalingTargetFps: lsTarget,
        losslessScalingRtssLimit: lsLimit,
        losslessScalingRtssTouched: lsLimit !== null,
        losslessScalingProfile: profileKey,
        losslessScalingProfiles: losslessProfiles,
        losslessScalingLaunchDelay: lsLaunchDelay,
        virtualDisplayMode: serverVirtualDisplayMode,
        virtualDisplayLayout: serverVirtualDisplayLayout,
        ddConfigurationOption: ddConfigValue
      };
    }
    function toServerPayload(f) {
      const selection = displaySelection.value;
      const captureFixEnabled = !!(f.gen1FramegenFix || f.gen2FramegenFix);
      const payload = {
        // Index is required by the backend to determine add (-1) vs update (>= 0)
        index: typeof f.index === "number" ? f.index : -1,
        name: f.name,
        cmd: f.cmd,
        "working-dir": f.workingDir,
        "image-path": String(f.imagePath || "").replace(/\"/g, ""),
        "exclude-global-prep-cmd": !!f.excludeGlobalPrepCmd,
        "exclude-global-state-cmd": !!f.excludeGlobalStateCmd,
        ...f.configOverrides && typeof f.configOverrides === "object" && !Array.isArray(f.configOverrides) && Object.keys(f.configOverrides).length ? {
          "config-overrides": Object.fromEntries(
            Object.entries(f.configOverrides).filter(
              ([k, v]) => typeof k === "string" && k.length > 0 && v !== void 0 && v !== null
            )
          )
        } : {},
        elevated: !!f.elevated,
        "auto-detach": !!f.autoDetach,
        "wait-all": !!f.waitAll,
        "terminate-on-pause": !!f.terminateOnPause,
        "allow-client-commands": !!f.allowClientCommands,
        "use-app-identity": !!f.useAppIdentity,
        "per-client-app-identity": f.useAppIdentity ? !!f.perClientAppIdentity : false,
        gamepad: String(f.gamepad || ""),
        "scale-factor": clampScaleFactor(
          typeof f.scaleFactor === "number" && Number.isFinite(f.scaleFactor) ? f.scaleFactor : null
        ),
        "gen1-framegen-fix": captureFixEnabled,
        "gen2-framegen-fix": false,
        "exit-timeout": Number.isFinite(f.exitTimeout) ? f.exitTimeout : 5,
        "prep-cmd": f.prepCmd.map((p) => ({
          do: p.do,
          undo: p.undo,
          ...isWindows.value ? { elevated: !!p.elevated } : {}
        })),
        "state-cmd": f.stateCmd.map((p) => ({
          do: p.do,
          undo: p.undo,
          ...isWindows.value ? { elevated: !!p.elevated } : {}
        })),
        detached: Array.isArray(f.detached) ? f.detached : []
        // Leave 'virtual-screen' to be persisted only if explicitly different from the global setting.
      };
      if (f.uuid) {
        payload["uuid"] = f.uuid;
      }
      const _globalVDMode = globalVirtualDisplayMode.value;
      const _globalVDLayout = globalVirtualDisplayLayout.value;
      const _globalOutput = globalOutputName.value;
      if (f.virtualDisplayMode !== null && f.virtualDisplayMode !== _globalVDMode) {
        payload["virtual-display-mode"] = f.virtualDisplayMode;
      }
      if (f.virtualDisplayLayout !== null && f.virtualDisplayLayout !== _globalVDLayout) {
        payload["virtual-display-layout"] = f.virtualDisplayLayout;
      }
      if (f.playniteId)
        payload["playnite-id"] = f.playniteId;
      if (f.playniteManaged)
        payload["playnite-managed"] = f.playniteManaged;
      const provider = normalizeFrameGenerationProvider(f.frameGenerationProvider);
      const mode = f.frameGenerationMode ?? "off";
      let resolvedProvider = provider;
      if (mode === "nvidia-smooth-motion") {
        resolvedProvider = "nvidia-smooth-motion";
      } else if (mode === "lossless-scaling") {
        resolvedProvider = "lossless-scaling";
      } else if (mode === "game-provided") {
        resolvedProvider = "game-provided";
      } else {
        resolvedProvider = provider;
      }
      payload["frame-generation-provider"] = resolvedProvider;
      payload["frame-generation-mode"] = mode;
      const payloadLosslessTarget = parseNumeric(f.losslessScalingTargetFps);
      const payloadLosslessLimit = parseNumeric(f.losslessScalingRtssLimit);
      const losslessFramegenActive = mode === "lossless-scaling";
      const losslessRuntimeActive = !!f.losslessScalingEnabled || losslessFramegenActive;
      payload["lossless-scaling-enabled"] = !!f.losslessScalingEnabled;
      payload["lossless-scaling-framegen"] = losslessFramegenActive;
      payload["lossless-scaling-target-fps"] = losslessFramegenActive ? payloadLosslessTarget : null;
      payload["lossless-scaling-rtss-limit"] = losslessFramegenActive ? payloadLosslessLimit : null;
      const payloadLosslessDelayRaw = parseNumeric(f.losslessScalingLaunchDelay);
      const payloadLosslessDelay = payloadLosslessDelayRaw && payloadLosslessDelayRaw > 0 ? Math.round(payloadLosslessDelayRaw) : null;
      payload["lossless-scaling-launch-delay"] = losslessRuntimeActive ? payloadLosslessDelay : null;
      payload["lossless-scaling-profile"] = f.losslessScalingProfile === "recommended" ? "recommended" : "custom";
      const buildLosslessProfilePayload = (profile) => {
        const profilePayload = {};
        if (profile.performanceMode !== null) {
          profilePayload["performance-mode"] = profile.performanceMode;
        }
        if (profile.flowScale !== null) {
          profilePayload["flow-scale"] = profile.flowScale;
        }
        if (profile.resolutionScale !== null) {
          profilePayload["resolution-scale"] = profile.resolutionScale;
        }
        if (profile.scalingMode !== null) {
          profilePayload["scaling-type"] = profile.scalingMode;
        }
        if (profile.sharpening !== null) {
          profilePayload["sharpening"] = profile.sharpening;
        }
        if (profile.anime4kSize !== null) {
          profilePayload["anime4k-size"] = profile.anime4kSize;
        }
        if (profile.anime4kVrs !== null) {
          profilePayload["anime4k-vrs"] = profile.anime4kVrs;
        }
        return profilePayload;
      };
      const recommendedPayload = buildLosslessProfilePayload(f.losslessScalingProfiles.recommended);
      const customPayload = buildLosslessProfilePayload(f.losslessScalingProfiles.custom);
      if (Object.keys(recommendedPayload).length > 0) {
        payload["lossless-scaling-recommended"] = recommendedPayload;
      }
      if (Object.keys(customPayload).length > 0) {
        payload["lossless-scaling-custom"] = customPayload;
      }
      if (typeof f.output === "string") {
        const curOut = String(f.output || "");
        if (curOut !== "" && (curOut !== _globalOutput || selection === "physical")) {
          payload["output"] = curOut;
        }
      }
      const globalIsVirtual = _globalOutput === VIRTUAL_DISPLAY_SELECTION;
      if (!!f.virtualScreen !== globalIsVirtual) {
        payload["virtual-screen"] = !!f.virtualScreen;
      }
      if (f.ddConfigurationOption) {
        payload["dd-configuration-option"] = f.ddConfigurationOption;
      }
      return payload;
    }
    watch(
      () => props.app,
      (val) => {
        if (!open.value)
          return;
        form.value = fromServerApp(val, props.index ?? -1);
      },
      { immediate: true }
    );
    const cmdText = computed({
      get: () => form.value.cmd || "",
      set: (v) => {
        form.value.cmd = v;
      }
    });
    computed({
      get: () => form.value.scaleFactor,
      set: (v) => {
        form.value.scaleFactor = clampScaleFactor(
          typeof v === "number" && Number.isFinite(v) ? v : null
        );
      }
    });
    const isPlayniteManaged = computed(() => !!form.value.playniteId);
    const isPlayniteAuto = computed(
      () => isPlayniteManaged.value && form.value.playniteManaged !== "manual"
    );
    const losslessExecutableStatus = ref(null);
    const losslessExecutableCheckComplete = ref(false);
    function hasLosslessCandidates(status) {
      return Array.isArray(status == null ? void 0 : status.candidates) && status.candidates.length > 0;
    }
    const losslessExecutableDetected = computed(() => {
      const status = losslessExecutableStatus.value;
      if (!status) {
        return false;
      }
      if (status.checked_exists || status.configured_exists || status.default_exists) {
        return true;
      }
      return hasLosslessCandidates(status);
    });
    async function refreshLosslessExecutableStatus() {
      var _a;
      if (!isWindows.value) {
        losslessExecutableStatus.value = null;
        losslessExecutableCheckComplete.value = true;
        return;
      }
      losslessExecutableCheckComplete.value = false;
      try {
        const params = {};
        const configuredPath = (_a = configStore.config) == null ? void 0 : _a.lossless_scaling_path;
        if (configuredPath) {
          params["path"] = String(configuredPath);
        }
        const response = await http.get("/api/lossless_scaling/status", {
          params,
          validateStatus: () => true
        });
        if (response.status >= 200 && response.status < 300) {
          losslessExecutableStatus.value = response.data ?? {};
        } else {
          losslessExecutableStatus.value = null;
        }
        losslessExecutableCheckComplete.value = true;
      } catch {
        losslessExecutableStatus.value = null;
        losslessExecutableCheckComplete.value = true;
      }
    }
    const frameGenerationSelection = computed({
      get: () => form.value.frameGenerationMode ?? "off",
      set: (mode) => {
        form.value.frameGenerationMode = mode;
        if (mode === "nvidia-smooth-motion") {
          form.value.frameGenerationProvider = "nvidia-smooth-motion";
          form.value.losslessScalingTargetFps = null;
          form.value.losslessScalingRtssLimit = null;
          form.value.losslessScalingRtssTouched = false;
        } else if (mode === "lossless-scaling") {
          form.value.frameGenerationProvider = "lossless-scaling";
        } else if (mode === "game-provided") {
          form.value.frameGenerationProvider = "game-provided";
          form.value.losslessScalingTargetFps = null;
          form.value.losslessScalingRtssLimit = null;
          form.value.losslessScalingRtssTouched = false;
        } else {
          form.value.frameGenerationProvider = "game-provided";
          form.value.losslessScalingTargetFps = null;
          form.value.losslessScalingRtssLimit = null;
          form.value.losslessScalingRtssTouched = false;
        }
      }
    });
    const nvidiaFrameGenEnabled = computed({
      get: () => frameGenerationSelection.value === "nvidia-smooth-motion",
      set: (enabled) => {
        if (enabled) {
          frameGenerationSelection.value = "nvidia-smooth-motion";
        } else if (frameGenerationSelection.value === "nvidia-smooth-motion") {
          frameGenerationSelection.value = "off";
        }
      }
    });
    const losslessFrameGenEnabled = computed({
      get: () => frameGenerationSelection.value === "lossless-scaling",
      set: (enabled) => {
        if (enabled) {
          frameGenerationSelection.value = "lossless-scaling";
        } else if (frameGenerationSelection.value === "lossless-scaling") {
          frameGenerationSelection.value = "off";
        }
      }
    });
    watch(
      () => form.value.frameGenerationProvider,
      (provider) => {
        const normalized = normalizeFrameGenerationProvider(provider);
        if (provider !== normalized) {
          form.value.frameGenerationProvider = normalized;
          return;
        }
        if (normalized === "nvidia-smooth-motion") {
          if (form.value.frameGenerationMode !== "nvidia-smooth-motion") {
            form.value.frameGenerationMode = "nvidia-smooth-motion";
          }
        } else if (normalized === "lossless-scaling") {
          if (form.value.frameGenerationMode !== "lossless-scaling") {
            form.value.frameGenerationMode = "lossless-scaling";
          }
        } else if (normalized === "game-provided") {
          if (form.value.frameGenerationMode === "lossless-scaling" || form.value.frameGenerationMode === "nvidia-smooth-motion") {
            form.value.frameGenerationMode = "game-provided";
          }
        }
        if (normalized === "lossless-scaling" && losslessFrameGenEnabled.value && !form.value.losslessScalingRtssTouched) {
          form.value.losslessScalingRtssLimit = defaultRtssFromTarget(
            parseNumeric(form.value.losslessScalingTargetFps)
          );
        }
      }
    );
    watch(
      () => form.value.losslessScalingTargetFps,
      (value) => {
        const normalized = parseNumeric(value);
        if (normalized !== value) {
          form.value.losslessScalingTargetFps = normalized;
          return;
        }
        if (losslessFrameGenEnabled.value && !form.value.losslessScalingRtssTouched) {
          form.value.losslessScalingRtssLimit = defaultRtssFromTarget(normalized);
        }
      }
    );
    function onLosslessRtssLimitChange(value) {
      const normalized = parseNumeric(value);
      if (normalized === null) {
        form.value.losslessScalingRtssTouched = false;
        form.value.losslessScalingRtssLimit = null;
        return;
      }
      form.value.losslessScalingRtssTouched = true;
      form.value.losslessScalingRtssLimit = Math.min(360, Math.max(1, Math.round(normalized)));
    }
    const activeLosslessProfile = computed(
      () => form.value.losslessScalingProfile === "recommended" ? "recommended" : "custom"
    );
    function getEffectivePerformanceMode(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.performanceMode ?? LOSSLESS_PROFILE_DEFAULTS[profile].performanceMode;
    }
    function setPerformanceMode(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      form.value.losslessScalingProfiles[profile].performanceMode = value === defaults.performanceMode ? null : value;
    }
    function getEffectiveFlowScale(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.flowScale ?? LOSSLESS_PROFILE_DEFAULTS[profile].flowScale;
    }
    function setFlowScale(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      const clamped = clampFlow(value);
      form.value.losslessScalingProfiles[profile].flowScale = clamped === null || clamped === defaults.flowScale ? null : clamped;
    }
    function getEffectiveResolutionScale(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.resolutionScale ?? LOSSLESS_PROFILE_DEFAULTS[profile].resolutionScale;
    }
    function setResolutionScale(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      const clamped = clampResolution(value);
      form.value.losslessScalingProfiles[profile].resolutionScale = clamped === null || clamped === defaults.resolutionScale ? null : clamped;
    }
    function getEffectiveScalingMode(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.scalingMode ?? LOSSLESS_PROFILE_DEFAULTS[profile].scalingMode;
    }
    function setScalingMode(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      const overrides = form.value.losslessScalingProfiles[profile];
      overrides.scalingMode = value === defaults.scalingMode ? null : value;
      if (!LOSSLESS_SCALING_SHARPENING.has(value)) {
        overrides.sharpening = null;
      }
      if (value !== "anime4k") {
        overrides.anime4kSize = null;
        overrides.anime4kVrs = null;
      }
      if (value === "off") {
        overrides.resolutionScale = null;
      }
      if (profile === activeLosslessProfile.value)
        ;
    }
    function getEffectiveSharpening(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      return overrides.sharpening ?? defaults.sharpening;
    }
    function setSharpening(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      const clamped = clampSharpness(value);
      form.value.losslessScalingProfiles[profile].sharpening = clamped === null || clamped === defaults.sharpening ? null : clamped;
    }
    function getEffectiveAnimeSize(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.anime4kSize ?? LOSSLESS_PROFILE_DEFAULTS[profile].anime4kSize;
    }
    function setAnimeSize(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      const resolved = value ?? defaults.anime4kSize;
      form.value.losslessScalingProfiles[profile].anime4kSize = resolved === defaults.anime4kSize ? null : resolved;
    }
    function getEffectiveAnimeVrs(profile) {
      const overrides = form.value.losslessScalingProfiles[profile];
      return overrides.anime4kVrs ?? LOSSLESS_PROFILE_DEFAULTS[profile].anime4kVrs;
    }
    function setAnimeVrs(profile, value) {
      const defaults = LOSSLESS_PROFILE_DEFAULTS[profile];
      form.value.losslessScalingProfiles[profile].anime4kVrs = value === defaults.anime4kVrs ? null : value;
    }
    const losslessPerformanceModeModel = computed({
      get: () => getEffectivePerformanceMode(activeLosslessProfile.value),
      set: (value) => {
        setPerformanceMode(activeLosslessProfile.value, !!value);
      }
    });
    const losslessFlowScaleModel = computed({
      get: () => getEffectiveFlowScale(activeLosslessProfile.value),
      set: (value) => {
        setFlowScale(activeLosslessProfile.value, value ?? null);
      }
    });
    const losslessResolutionScaleModel = computed({
      get: () => getEffectiveResolutionScale(activeLosslessProfile.value),
      set: (value) => {
        setResolutionScale(activeLosslessProfile.value, value ?? null);
      }
    });
    const losslessScalingModeModel = computed({
      get: () => getEffectiveScalingMode(activeLosslessProfile.value),
      set: (value) => {
        setScalingMode(activeLosslessProfile.value, value);
      }
    });
    const losslessSharpeningModel = computed({
      get: () => getEffectiveSharpening(activeLosslessProfile.value),
      set: (value) => {
        setSharpening(activeLosslessProfile.value, value ?? null);
      }
    });
    const losslessAnimeSizeModel = computed({
      get: () => getEffectiveAnimeSize(activeLosslessProfile.value),
      set: (value) => {
        setAnimeSize(activeLosslessProfile.value, value);
      }
    });
    const losslessAnimeVrsModel = computed({
      get: () => getEffectiveAnimeVrs(activeLosslessProfile.value),
      set: (value) => {
        setAnimeVrs(activeLosslessProfile.value, !!value);
      }
    });
    const showLosslessSharpening = computed(
      () => LOSSLESS_SCALING_SHARPENING.has(losslessScalingModeModel.value)
    );
    const showLosslessResolution = computed(() => {
      const mode = losslessScalingModeModel.value;
      return mode !== null && mode !== "off";
    });
    const showLosslessAnimeOptions = computed(() => losslessScalingModeModel.value === "anime4k");
    const hasActiveLosslessOverrides = computed(() => {
      const overrides = form.value.losslessScalingProfiles[activeLosslessProfile.value];
      return overrides.performanceMode !== null || overrides.flowScale !== null || overrides.resolutionScale !== null || overrides.scalingMode !== null || overrides.sharpening !== null || overrides.anime4kSize !== null || overrides.anime4kVrs !== null;
    });
    function resetActiveLosslessProfile() {
      const overrides = form.value.losslessScalingProfiles[activeLosslessProfile.value];
      overrides.performanceMode = null;
      overrides.flowScale = null;
      overrides.resolutionScale = null;
      overrides.scalingMode = null;
      overrides.sharpening = null;
      overrides.anime4kSize = null;
      overrides.anime4kVrs = null;
    }
    const nameSelectValue = ref("");
    const nameOptions = ref([]);
    const nameError = ref("");
    function validateName() {
      nameError.value = !String(form.value.name ?? "").trim() ? "Name is required" : "";
    }
    const fallbackOption = (value) => {
      const v = String(value ?? "");
      const label = String(form.value.name || "").trim() || v;
      return { label, value: v };
    };
    const nameSearchQuery = ref("");
    const nameSelectOptions = computed(() => {
      if (nameOptions.value.length)
        return nameOptions.value;
      const list = [];
      const cur = String(form.value.name || "").trim();
      if (cur)
        list.push({ label: `Custom: "${cur}"`, value: `__custom__:${cur}` });
      if (playniteOptions.value.length) {
        list.push(...playniteOptions.value.slice(0, 20));
      }
      return list;
    });
    async function onNameFocus() {
      if (!playniteOptions.value.length) {
        nameOptions.value = [
          { label: "Loading Playnite games…", value: "__loading__", disabled: true }
        ];
      }
      loadPlayniteGames().catch(() => {
      }).finally(() => {
        onNameSearch(nameSearchQuery.value);
      });
    }
    function ensureNameSelectionFromForm() {
      const currentName = String(form.value.name || "").trim();
      const opts = [];
      if (currentName) {
        opts.push({ label: `Custom: "${currentName}"`, value: `__custom__:${currentName}` });
      }
      const pid = form.value.playniteId;
      if (pid) {
        const found = playniteOptions.value.find((o) => o.value === String(pid));
        if (found)
          opts.push(found);
        else if (currentName)
          opts.push({ label: currentName, value: String(pid) });
      }
      nameOptions.value = opts;
      nameSelectValue.value = pid ? String(pid) : currentName ? `__custom__:${currentName}` : "";
    }
    function close() {
      emit("update:modelValue", false);
    }
    function addPrep() {
      form.value.prepCmd.push({
        do: "",
        undo: "",
        ...isWindows.value ? { elevated: false } : {}
      });
      requestAnimationFrame(() => updateShadows());
    }
    function addState() {
      form.value.stateCmd.push({
        do: "",
        undo: "",
        ...isWindows.value ? { elevated: false } : {}
      });
      requestAnimationFrame(() => updateShadows());
    }
    const saving = ref(false);
    const showDeleteConfirm = ref(false);
    const showAdvanced = ref(false);
    const showCoverModal = ref(false);
    const coverSearching = ref(false);
    const coverBusy = ref(false);
    const coverCandidates = ref([]);
    function getSearchBucket(name) {
      const prefix = (name || "").substring(0, Math.min((name || "").length, 2)).toLowerCase().replace(/[^a-z\d]/g, "");
      return prefix || "@";
    }
    async function searchCovers(name) {
      if (!name)
        return [];
      const searchName = name.replace(/\s+/g, ".").toLowerCase();
      const dbUrl = "https://raw.githubusercontent.com/LizardByte/GameDB/gh-pages";
      const bucket = getSearchBucket(name);
      const res = await fetch(`${dbUrl}/buckets/${bucket}.json`);
      if (!res.ok)
        return [];
      const maps = await res.json();
      const ids = Object.keys(maps || {});
      const promises = ids.map(async (id) => {
        const item = maps[id];
        if (!(item == null ? void 0 : item.name))
          return null;
        if (String(item.name).replace(/\s+/g, ".").toLowerCase().startsWith(searchName)) {
          try {
            const r = await fetch(`${dbUrl}/games/${id}.json`);
            return await r.json();
          } catch {
            return null;
          }
        }
        return null;
      });
      const results = (await Promise.all(promises)).filter(Boolean);
      return results.filter((item) => item && item.cover && item.cover.url).map((game) => {
        const thumb = game.cover.url;
        const dotIndex = thumb.lastIndexOf(".");
        const slashIndex = thumb.lastIndexOf("/");
        if (dotIndex < 0 || slashIndex < 0)
          return null;
        const slug = thumb.substring(slashIndex + 1, dotIndex);
        return {
          name: game.name,
          key: `igdb_${game.id}`,
          url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${slug}.jpg`,
          saveUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${slug}.png`
        };
      }).filter(Boolean);
    }
    async function openCoverFinder() {
      if (isPlayniteManaged.value)
        return;
      coverCandidates.value = [];
      showCoverModal.value = true;
      coverSearching.value = true;
      try {
        coverCandidates.value = await searchCovers(String(form.value.name || ""));
      } finally {
        coverSearching.value = false;
      }
    }
    async function useCover(cover) {
      if (!cover || coverBusy.value)
        return;
      coverBusy.value = true;
      try {
        const r = await http.post(
          "./api/covers/upload",
          { key: cover.key, url: cover.saveUrl },
          { headers: { "Content-Type": "application/json" }, validateStatus: () => true }
        );
        if (r.status >= 200 && r.status < 300 && r.data && r.data.path) {
          form.value.imagePath = String(r.data.path || "");
          showCoverModal.value = false;
        }
      } finally {
        coverBusy.value = false;
      }
    }
    const configStore = useConfigStore();
    const platformName = computed(() => {
      var _a;
      return (((_a = configStore.metadata) == null ? void 0 : _a.platform) || "").toLowerCase();
    });
    const isWindows = computed(() => platformName.value === "windows");
    const isLinux = computed(() => platformName.value === "linux");
    computed(() => platformName.value === "macos");
    computed(() => {
      const options = [
        { label: "Default (Global)", value: "" },
        { label: "Disabled", value: "disabled" },
        { label: "Auto", value: "auto" }
      ];
      if (isLinux.value) {
        options.push(
          { label: "DualSense (PS5)", value: "ds5" },
          { label: "Switch Pro", value: "switch" },
          { label: "Xbox One", value: "xone" }
        );
      }
      if (isWindows.value) {
        options.push({ label: "DualShock 4", value: "ds4" }, { label: "Xbox 360", value: "x360" });
      }
      return options;
    });
    const ddConfigOption = computed(
      () => {
        var _a;
        return ((_a = configStore.config) == null ? void 0 : _a.dd_configuration_option) ?? "disabled";
      }
    );
    const captureMethod = computed(() => {
      var _a;
      return ((_a = configStore.config) == null ? void 0 : _a.capture) ?? "";
    });
    const globalOutputName = computed(() => {
      var _a;
      const name = (_a = configStore.config) == null ? void 0 : _a.output_name;
      return typeof name === "string" ? name : "";
    });
    const globalVirtualDisplayMode = computed(() => {
      var _a;
      const mode = (_a = configStore.config) == null ? void 0 : _a.virtual_display_mode;
      return parseAppVirtualDisplayMode(mode) ?? "disabled";
    });
    const globalVirtualDisplayLayout = computed(() => {
      var _a;
      const layout = (_a = configStore.config) == null ? void 0 : _a.virtual_display_layout;
      return parseAppVirtualDisplayLayout(layout) ?? "exclusive";
    });
    const resolvedVirtualDisplayMode = computed(
      () => form.value.virtualDisplayMode ?? globalVirtualDisplayMode.value
    );
    const resolvedVirtualDisplayLayout = computed(
      () => form.value.virtualDisplayLayout ?? globalVirtualDisplayLayout.value
    );
    const APP_VIRTUAL_DISPLAY_MODE_LABEL_KEYS = {
      disabled: "config.virtual_display_mode_disabled",
      per_client: "config.virtual_display_mode_per_client",
      shared: "config.virtual_display_mode_shared"
    };
    const appVirtualDisplayModeOptions = computed(
      () => ["global", ...APP_VIRTUAL_DISPLAY_MODES.filter((value) => value !== "disabled")].map(
        (value) => ({
          value,
          label: value === "global" ? t("config.app_virtual_display_mode_follow_global") : t(APP_VIRTUAL_DISPLAY_MODE_LABEL_KEYS[value])
        })
      )
    );
    const appVirtualDisplayModeSelection = computed({
      get: () => form.value.virtualDisplayMode ?? "global",
      set: (value) => {
        form.value.virtualDisplayMode = value === "global" ? null : value;
      }
    });
    const appVirtualDisplayLayoutOptions = computed(
      () => APP_VIRTUAL_DISPLAY_LAYOUTS.map((value) => ({
        value,
        label: t(`config.virtual_display_layout_${value}`),
        description: t(`config.virtual_display_layout_${value}_desc`)
      }))
    );
    const appDdConfigurationOptions = computed(() => [
      { label: t("_common.disabled"), value: "disabled" },
      { label: t("config.dd_config_verify_only"), value: "verify_only" },
      { label: t("config.dd_config_ensure_active"), value: "ensure_active" },
      { label: t("config.dd_config_ensure_primary"), value: "ensure_primary" },
      { label: t("config.dd_config_ensure_only_display"), value: "ensure_only_display" }
    ]);
    function selectVirtualDisplayLayout(v) {
      const sv = String(v).trim().toLowerCase();
      if (APP_VIRTUAL_DISPLAY_LAYOUTS.includes(sv)) {
        form.value.virtualDisplayLayout = sv;
      }
    }
    const lastPhysicalOutput = ref("");
    const lastVirtualDisplayMode = ref(null);
    const displaySelection = computed({
      get: () => {
        const currentOutput = typeof form.value.output === "string" ? form.value.output.trim() : "";
        const globalMode = globalVirtualDisplayMode.value;
        const appMode = form.value.virtualDisplayMode;
        if (form.value.virtualScreen || form.value.output === VIRTUAL_DISPLAY_SELECTION) {
          return "virtual";
        }
        if (currentOutput) {
          return "physical";
        }
        if (appMode === "disabled") {
          return "physical";
        }
        if (appMode !== null && appMode !== globalMode) {
          return "virtual";
        }
        return "global";
      },
      set: (selection) => {
        if (selection === "virtual") {
          form.value.virtualScreen = true;
          if (form.value.virtualDisplayMode === "disabled") {
            form.value.virtualDisplayMode = lastVirtualDisplayMode.value ?? globalVirtualDisplayMode.value ?? null;
          }
          form.value.output = "";
          form.value.ddConfigurationOption = null;
        } else if (selection === "physical") {
          if (form.value.virtualDisplayMode && form.value.virtualDisplayMode !== "disabled") {
            lastVirtualDisplayMode.value = form.value.virtualDisplayMode;
          }
          form.value.virtualDisplayMode = "disabled";
          form.value.virtualScreen = false;
          const current = typeof form.value.output === "string" ? form.value.output.trim() : "";
          if (!current || current === VIRTUAL_DISPLAY_SELECTION) {
            if (lastPhysicalOutput.value) {
              form.value.output = lastPhysicalOutput.value;
            } else if (globalOutputName.value && globalOutputName.value !== VIRTUAL_DISPLAY_SELECTION) {
              form.value.output = globalOutputName.value;
            }
          }
        } else {
          form.value.virtualScreen = false;
          form.value.virtualDisplayMode = null;
          form.value.output = "";
          form.value.ddConfigurationOption = null;
        }
      }
    });
    const displayOverrideEnabled = computed({
      get: () => displaySelection.value !== "global",
      set: (enabled) => {
        if (!enabled) {
          displaySelection.value = "global";
        } else if (displaySelection.value === "global") {
          displaySelection.value = "virtual";
        }
      }
    });
    const windowsDisplayVersion = computed(() => {
      var _a;
      const v = (_a = configStore.metadata) == null ? void 0 : _a.windows_display_version;
      return typeof v === "string" ? v : "";
    });
    const windowsBuildNumber = computed(() => {
      var _a;
      const raw = (_a = configStore.metadata) == null ? void 0 : _a.windows_build_number;
      if (typeof raw === "number" && Number.isFinite(raw))
        return raw;
      if (typeof raw === "string") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed))
          return parsed;
      }
      return null;
    });
    const autoCaptureUsesWgc = computed(() => {
      if (!isWindows.value)
        return false;
      const displayVersion = windowsDisplayVersion.value.toUpperCase();
      if (displayVersion.includes("23H2") || displayVersion.includes("24H1") || displayVersion.includes("24H2")) {
        return true;
      }
      const build = windowsBuildNumber.value;
      if (build !== null) {
        return build >= 22631;
      }
      return false;
    });
    const virtualOutputName = computed(() => {
      var _a;
      const outputName = (_a = configStore.config) == null ? void 0 : _a.output_name;
      return typeof outputName === "string" ? outputName : "";
    });
    const usingVirtualDisplay = computed(() => {
      const selection = displaySelection.value;
      if (selection === "virtual")
        return true;
      if (selection === "physical")
        return false;
      const mode = resolvedVirtualDisplayMode.value;
      if (mode === "per_client" || mode === "shared") {
        return true;
      }
      if (mode === "disabled") {
        return virtualOutputName.value === VIRTUAL_DISPLAY_SELECTION;
      }
      return false;
    });
    const skipDisplayWarnings = computed(() => usingVirtualDisplay.value);
    const displayDevices = ref([]);
    const displayDevicesLoading = ref(false);
    const displayDevicesError = ref("");
    const displayNameCache = ref({});
    const physicalOutputModel = computed({
      get: () => {
        const value = typeof form.value.output === "string" ? form.value.output.trim() : "";
        return value || null;
      },
      set: (value) => {
        const normalized = typeof value === "string" ? value.trim() : "";
        if (!normalized) {
          displaySelection.value = "global";
          displayOverrideEnabled.value = false;
          return;
        }
        form.value.output = normalized;
        form.value.virtualScreen = false;
        lastPhysicalOutput.value = normalized;
        displaySelection.value = "physical";
        displayOverrideEnabled.value = true;
      }
    });
    async function loadDisplayDevices() {
      displayDevicesLoading.value = true;
      displayDevicesError.value = "";
      try {
        const res = await http.get("/api/display-devices", {
          params: { detail: "full" }
        });
        const devices = Array.isArray(res.data) ? res.data : [];
        displayDevices.value = devices;
        cacheDisplayNames(devices);
      } catch (e) {
        displayDevicesError.value = (e == null ? void 0 : e.message) || "Failed to load display devices";
        displayDevices.value = [];
      } finally {
        displayDevicesLoading.value = false;
      }
    }
    function normalizeDisplayKey(value) {
      if (typeof value !== "string")
        return "";
      return value.trim().toLowerCase();
    }
    function cacheDisplayNames(devices) {
      if (!devices.length)
        return;
      const updated = { ...displayNameCache.value };
      for (const device of devices) {
        const label = device.friendly_name || device.display_name;
        if (!label)
          continue;
        for (const candidate of [device.device_id, device.display_name]) {
          const key = normalizeDisplayKey(candidate);
          if (!key)
            continue;
          updated[key] = label;
        }
      }
      displayNameCache.value = updated;
    }
    function getCachedDisplayLabel(value) {
      const key = normalizeDisplayKey(value);
      if (!key)
        return null;
      return displayNameCache.value[key] ?? null;
    }
    const displayDeviceOptions = computed(() => {
      const opts = [];
      const seen = /* @__PURE__ */ new Set();
      for (const d of displayDevices.value) {
        const value = d.device_id || d.display_name || "";
        if (!value || seen.has(value))
          continue;
        const displayName = d.friendly_name || d.display_name || "Display";
        const guid = d.device_id || "";
        const dispName = d.display_name || "";
        const info = d.info;
        let active = null;
        if (info && typeof info === "object" && "active" in info) {
          active = !!info.active;
        } else if (info) {
          active = true;
        }
        const parts = [displayName];
        if (guid)
          parts.push(guid);
        if (dispName) {
          const status = active === null ? "" : active ? " (active)" : " (inactive)";
          parts.push(dispName + status);
        }
        const label = parts.join(" - ");
        const idLine = guid && dispName ? `${guid} - ${dispName}` : guid || dispName;
        opts.push({ label, value, displayName, id: idLine, active });
        seen.add(value);
      }
      const current = typeof form.value.output === "string" ? form.value.output.trim() : "";
      if (current && !seen.has(current)) {
        const label = getCachedDisplayLabel(current) ?? current;
        opts.push({ label, value: current, displayName: label, id: current, active: null });
      }
      if (lastPhysicalOutput.value && !seen.has(lastPhysicalOutput.value) && lastPhysicalOutput.value !== current) {
        const id = lastPhysicalOutput.value;
        const label = getCachedDisplayLabel(id) ?? id;
        opts.push({ label, value: id, displayName: label, id, active: null });
      }
      return opts;
    });
    const ddConfigurationModel = computed({
      get() {
        return form.value.ddConfigurationOption ?? null;
      },
      set(value) {
        form.value.ddConfigurationOption = typeof value === "string" ? value : null;
      }
    });
    function onDisplaySelectFocus() {
      if (!displayDevicesLoading.value && displayDevices.value.length === 0) {
        void loadDisplayDevices();
      }
    }
    watch(
      () => form.value.output,
      (value) => {
        const normalized = typeof value === "string" ? value.trim() : "";
        if (normalized && normalized !== VIRTUAL_DISPLAY_SELECTION) {
          lastPhysicalOutput.value = normalized;
        }
      },
      { immediate: true }
    );
    watch(
      () => form.value.virtualDisplayMode,
      (mode) => {
        if (mode && mode !== "disabled") {
          lastVirtualDisplayMode.value = mode;
        }
      },
      { immediate: true }
    );
    const frameGenHealth = ref(null);
    const frameGenHealthLoading = ref(false);
    const frameGenHealthError = ref(null);
    let frameGenHealthPromise = null;
    watch(open, (o) => {
      if (o) {
        form.value = fromServerApp(props.app ?? void 0, props.index ?? -1);
        if (displaySelection.value === "physical") {
          const currentOutput = typeof form.value.output === "string" ? form.value.output.trim() : "";
          if (!currentOutput && globalOutputName.value && globalOutputName.value !== VIRTUAL_DISPLAY_SELECTION) {
            form.value.output = globalOutputName.value;
          }
        }
        selectedPlayniteId.value = "";
        lockPlaynite.value = false;
        newAppSource.value = "custom";
        refreshPlayniteStatus().then(() => {
          if (playniteInstalled.value)
            void loadPlayniteGames();
        });
        requestAnimationFrame(() => updateShadows());
        ensureNameSelectionFromForm();
        nameError.value = "";
        showAdvanced.value = false;
        if (isWindows.value && (form.value.gen1FramegenFix || form.value.gen2FramegenFix)) {
          refreshFrameGenHealth({ reason: "open", silent: true }).catch(() => {
          });
        } else {
          frameGenHealth.value = null;
          frameGenHealthError.value = null;
        }
        if (isWindows.value) {
          refreshLosslessExecutableStatus().catch(() => {
          });
          if (displaySelection.value === "physical" && displayDevices.value.length === 0) {
            loadDisplayDevices().catch(() => {
            });
          }
        }
      } else {
        overridesPickerOpen.value = false;
        frameGenHealth.value = null;
        frameGenHealthError.value = null;
      }
    });
    watch(
      () => {
        var _a;
        return (_a = configStore.config) == null ? void 0 : _a.lossless_scaling_path;
      },
      () => {
        if (!open.value || !isWindows.value)
          return;
        refreshLosslessExecutableStatus().catch(() => {
        });
      }
    );
    watch(
      () => displaySelection.value,
      (selection) => {
        if (selection === "physical" && isWindows.value && displayDevices.value.length === 0 && !displayDevicesLoading.value) {
          loadDisplayDevices().catch(() => {
          });
        }
        if (selection === "physical" && !form.value.ddConfigurationOption) {
          form.value.ddConfigurationOption = "verify_only";
        }
      }
    );
    function normalizeDeviceId(value) {
      return typeof value === "string" ? value.trim().toLowerCase() : "";
    }
    function parseRefreshHz(raw) {
      if (raw === null || raw === void 0)
        return null;
      if (Array.isArray(raw)) {
        for (const item of raw) {
          const candidate = parseRefreshHz(item);
          if (candidate !== null)
            return candidate;
        }
        return null;
      }
      if (typeof raw === "number") {
        return Number.isFinite(raw) ? raw : null;
      }
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed)
          return null;
        const sanitized = trimmed.replace(/(hz|fps|frames|refresh)/gi, "").trim();
        const fractionMatch = sanitized.match(/^([-+]?\d+(?:\.\d+)?)\s*\/\s*([-+]?\d+(?:\.\d+)?)/);
        if (fractionMatch) {
          const numerator = Number(fractionMatch[1]);
          const denominator = Number(fractionMatch[2]);
          if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
            return numerator / denominator;
          }
        }
        const valueMatch = sanitized.match(/[-+]?\d+(?:\.\d+)?/);
        if (valueMatch) {
          const num = Number(valueMatch[0]);
          if (Number.isFinite(num))
            return num;
        }
        return null;
      }
      if (typeof raw === "object") {
        if ("hz" in raw) {
          const hzCandidate = parseRefreshHz(raw.hz);
          if (hzCandidate !== null)
            return hzCandidate;
        }
        if ("value" in raw) {
          const valueCandidate = parseRefreshHz(raw.value);
          if (valueCandidate !== null)
            return valueCandidate;
        }
        if (typeof raw.type === "string" && raw.value !== void 0) {
          const typed = raw;
          if (typed.type === "double") {
            return parseRefreshHz(typed.value);
          }
          if (typed.type === "rational") {
            const val = typed.value ?? {};
            const numerator2 = Number(
              (val == null ? void 0 : val.numerator) ?? (val == null ? void 0 : val.m_numerator) ?? (val == null ? void 0 : val.num)
            );
            const denominator2 = Number(
              (val == null ? void 0 : val.denominator) ?? (val == null ? void 0 : val.m_denominator) ?? (val == null ? void 0 : val.den) ?? 1
            );
            if (Number.isFinite(numerator2) && Number.isFinite(denominator2) && denominator2 !== 0) {
              return numerator2 / denominator2;
            }
          }
        }
        const numerator = Number(
          (raw == null ? void 0 : raw.numerator) ?? (raw == null ? void 0 : raw.m_numerator) ?? (raw == null ? void 0 : raw.num) ?? (raw == null ? void 0 : raw.n) ?? null
        );
        const denominator = Number(
          (raw == null ? void 0 : raw.denominator) ?? (raw == null ? void 0 : raw.m_denominator) ?? (raw == null ? void 0 : raw.den) ?? 1
        );
        if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
      return null;
    }
    function parseRefreshList(raw) {
      const values = [];
      const collect = (entry) => {
        const hz = parseRefreshHz(entry);
        if (hz !== null && Number.isFinite(hz)) {
          values.push(hz);
        }
      };
      if (Array.isArray(raw)) {
        raw.forEach(collect);
      } else if (raw !== null && raw !== void 0) {
        collect(raw);
      }
      const seen = /* @__PURE__ */ new Set();
      const result = [];
      for (const hz of values) {
        if (hz <= 0)
          continue;
        const key = hz.toFixed(3);
        if (seen.has(key))
          continue;
        seen.add(key);
        result.push(hz);
      }
      result.sort((a, b) => a - b);
      return result;
    }
    async function refreshFrameGenHealth(options = {}) {
      if (!isWindows.value)
        return;
      if (frameGenHealthPromise)
        return frameGenHealthPromise;
      const run = async () => {
        frameGenHealthLoading.value = true;
        frameGenHealthError.value = null;
        try {
          const [rtssResult, displayResult] = await Promise.allSettled([
            http.get("/api/rtss/status", { validateStatus: () => true }),
            http.get("/api/display-devices?detail=full", { validateStatus: () => true })
          ]);
          const captureValue = (captureMethod.value || "").toString().toLowerCase();
          let captureStatus;
          let captureMessage;
          const autoTreatsAsWgc = captureValue === "" && autoCaptureUsesWgc.value;
          if (captureValue === "wgc" || captureValue === "wgcc" || autoTreatsAsWgc) {
            captureStatus = "pass";
            captureMessage = autoTreatsAsWgc ? "Automatic capture uses Windows Graphics Capture on this Windows build." : "Windows Graphics Capture is active for this system.";
          } else if (captureValue === "") {
            captureStatus = "warn";
            captureMessage = "Autodetect may fall back to Desktop Duplication. Select Windows Graphics Capture in Settings -> Capture.";
          } else {
            captureStatus = "fail";
            captureMessage = "Switch capture method to Windows Graphics Capture in Settings -> Capture to keep frame generation compatible.";
          }
          let rtssInstalled = false;
          let rtssHooks = false;
          let rtssRunning = false;
          let rtssStatus = "unknown";
          let rtssMessage = "Unable to verify RTSS.";
          if (rtssResult.status === "fulfilled") {
            const res = rtssResult.value;
            const ok = res.status >= 200 && res.status < 300;
            if (ok) {
              const data = res.data;
              rtssInstalled = !!(data == null ? void 0 : data.path_exists);
              rtssHooks = !!(data == null ? void 0 : data.hooks_found);
              rtssRunning = !!(data == null ? void 0 : data.process_running);
              if (rtssInstalled && rtssHooks) {
                rtssStatus = "pass";
                rtssMessage = "RTSS hooks detected. Vibepollo can control the frame limiter.";
              } else if (rtssInstalled) {
                rtssStatus = "warn";
                rtssMessage = "RTSS is installed but hooks were not detected. Launch RTSS and ensure the Vibepollo profile is active.";
              } else {
                rtssStatus = "fail";
                rtssMessage = "Install RTSS to avoid microstutter when frame generation is enabled.";
              }
            } else {
              rtssStatus = "unknown";
              rtssMessage = "RTSS status endpoint returned an error.";
            }
          } else {
            rtssStatus = "unknown";
            rtssMessage = "Unable to reach the RTSS status endpoint.";
          }
          const usingVirtual = usingVirtualDisplay.value;
          const fpsTargets = [60, 90, 120, 144];
          const tolerance = 0.5;
          let displayStatus = "unknown";
          let displayMessage = "Unable to determine display refresh capabilities.";
          let displayLabel = usingVirtual ? "Vibepollo Virtual Screen" : "Active display";
          let displayId = usingVirtual ? VIRTUAL_DISPLAY_SELECTION : "";
          let displayHz = null;
          let displayError = null;
          let displayTargets = fpsTargets.map((fps) => ({
            fps,
            requiredHz: fps * 2,
            supported: usingVirtual ? true : null
          }));
          let highestFailUnder144 = null;
          let only144Fails = false;
          const edidSupport = {};
          let edidCapHz = null;
          let edidFetchError = null;
          if (!usingVirtual) {
            if (displayResult.status === "fulfilled") {
              const res = displayResult.value;
              const ok = res.status >= 200 && res.status < 300;
              if (ok && Array.isArray(res.data)) {
                const devices = res.data;
                const appOutput = form.value.output;
                const globalOutput = globalOutputName.value;
                const candidates = [
                  appOutput && appOutput !== VIRTUAL_DISPLAY_SELECTION ? appOutput : "",
                  globalOutput && globalOutput !== VIRTUAL_DISPLAY_SELECTION ? globalOutput : ""
                ].filter(Boolean);
                const normalizedCandidates = candidates.map((c) => normalizeDeviceId(c));
                let target = devices.find((item) => {
                  const id = normalizeDeviceId(item == null ? void 0 : item.device_id);
                  const displayName = normalizeDeviceId(item == null ? void 0 : item.display_name);
                  return normalizedCandidates.includes(id) || normalizedCandidates.includes(displayName);
                });
                if (!target) {
                  target = devices.find((item) => item && item.info) || devices[0];
                }
                if (target) {
                  displayLabel = typeof target.friendly_name === "string" && target.friendly_name || typeof target.display_name === "string" && target.display_name || "Active display";
                  displayId = typeof target.device_id === "string" && target.device_id || typeof target.display_name === "string" && target.display_name || "";
                  const info = target.info;
                  const refreshRaw = (info == null ? void 0 : info.refresh_rate) ?? (info == null ? void 0 : info.refreshRate);
                  const activeRefresh = parseRefreshHz(refreshRaw);
                  const supportedRatesRaw = (target == null ? void 0 : target.supported_refresh_rates) ?? (target == null ? void 0 : target.supportedRefreshRates);
                  const supportedRates = parseRefreshList(supportedRatesRaw);
                  const highestSupportedDxgi = supportedRates.length > 0 ? supportedRates[supportedRates.length - 1] ?? null : null;
                  try {
                    const deviceHint = displayId || displayLabel;
                    if (deviceHint) {
                      const edidRes = await http.get("/api/framegen/edid-refresh", {
                        params: {
                          device_id: deviceHint,
                          targets: fpsTargets.map((fps) => fps * 2).join(",")
                        },
                        validateStatus: () => true
                      });
                      if (edidRes.status >= 200 && edidRes.status < 300 && edidRes.data && edidRes.data.status !== false) {
                        const data = edidRes.data;
                        if (!displayLabel && typeof (data == null ? void 0 : data.device_label) === "string") {
                          displayLabel = data.device_label;
                        }
                        const rangeHz = parseRefreshHz(data == null ? void 0 : data.max_vertical_hz);
                        const timingHz = parseRefreshHz(data == null ? void 0 : data.max_timing_hz);
                        const capCandidate = rangeHz !== null && rangeHz > 0 ? rangeHz : timingHz !== null && timingHz > 0 ? timingHz : null;
                        if (capCandidate !== null) {
                          edidCapHz = capCandidate;
                        }
                        const targetEntries = Array.isArray(data == null ? void 0 : data.targets) ? data.targets : [];
                        for (const entry of targetEntries) {
                          const hz = parseRefreshHz(entry == null ? void 0 : entry.hz);
                          if (hz === null)
                            continue;
                          const key = hz.toFixed(3);
                          if (typeof (entry == null ? void 0 : entry.supported) === "boolean") {
                            edidSupport[key] = entry.supported;
                          } else if (!(key in edidSupport)) {
                            edidSupport[key] = null;
                          }
                        }
                      } else if (edidRes.data && typeof edidRes.data.error === "string") {
                        edidFetchError = edidRes.data.error;
                      }
                    }
                  } catch (e) {
                    if (!edidFetchError) {
                      edidFetchError = (e == null ? void 0 : e.message) || "EDID refresh validation failed.";
                    }
                  }
                  const highestSupported = edidCapHz !== null && Number.isFinite(edidCapHz) ? edidCapHz : highestSupportedDxgi;
                  displayHz = activeRefresh;
                  displayTargets = fpsTargets.map((fps) => {
                    const required = fps * 2;
                    const edidKey = required.toFixed(3);
                    let supported;
                    if (Object.prototype.hasOwnProperty.call(edidSupport, edidKey) && typeof edidSupport[edidKey] === "boolean") {
                      supported = edidSupport[edidKey];
                    } else if (supportedRates.length > 0) {
                      supported = supportedRates.some((rate) => rate >= required - tolerance);
                    } else if (activeRefresh !== null) {
                      supported = activeRefresh >= required - tolerance;
                    } else {
                      supported = null;
                    }
                    return { fps, requiredHz: required, supported };
                  });
                  const failingUnder144 = displayTargets.filter(
                    (entry) => entry.supported === false && entry.fps < 144
                  );
                  highestFailUnder144 = failingUnder144.length ? Math.max(...failingUnder144.map((entry) => entry.fps)) : null;
                  only144Fails = displayTargets.some((entry) => entry.fps === 144 && entry.supported === false) && highestFailUnder144 === null;
                  const evaluationHz = highestSupported ?? activeRefresh;
                  const hasActive = activeRefresh !== null;
                  const activeRefreshValue = activeRefresh ?? evaluationHz ?? 0;
                  const deltaSupported = highestSupported !== null && hasActive && Math.abs(highestSupported - activeRefreshValue) > tolerance;
                  if (!displayError && edidFetchError) {
                    displayError = edidFetchError;
                  }
                  if (evaluationHz === null) {
                    displayStatus = "unknown";
                    displayMessage = "Unable to read the refresh rate from the configured display. Double-check Display Device Step 1.";
                  } else if (evaluationHz >= 240 - tolerance) {
                    displayStatus = "pass";
                    if (only144Fails) {
                      const baseHz = hasActive ? activeRefreshValue : evaluationHz;
                      displayMessage = `Current refresh is ${Math.round(baseHz)} Hz. Streams up to 120 FPS are covered. Only 144 FPS streams require the Vibepollo virtual screen or a higher-refresh display.`;
                      if (!hasActive && highestSupported !== null) {
                        displayMessage = `Display supports up to ${Math.round(highestSupported)} Hz. Streams up to 120 FPS are covered. Only 144 FPS streams require the Vibepollo virtual screen or a higher-refresh display.`;
                      } else if (deltaSupported && highestSupported !== null) {
                        displayMessage += ` Vibepollo can switch to ${Math.round(highestSupported)} Hz when a stream starts if Display Device Step 1 keeps that monitor active.`;
                      }
                    } else if (!hasActive && highestSupported !== null) {
                      displayMessage = `Display supports up to ${Math.round(highestSupported)} Hz. Vibepollo can double 120 FPS streams.`;
                    } else if (deltaSupported && highestSupported !== null) {
                      displayMessage = `Current refresh is ${Math.round(activeRefreshValue)} Hz. Vibepollo can switch to ${Math.round(highestSupported)} Hz during streams to keep frame generation smooth.`;
                    } else {
                      displayMessage = "Display refresh is high enough to double 120 FPS streams.";
                    }
                  } else if (evaluationHz >= 180 - tolerance) {
                    displayStatus = "warn";
                    if (!hasActive && highestSupported !== null) {
                      displayMessage = `Display supports up to ${Math.round(evaluationHz)} Hz. Configure Display Device Step 1 to enforce the higher refresh or use the display override below to switch to the Vibepollo virtual display.`;
                    } else if (hasActive) {
                      if (highestFailUnder144 !== null) {
                        displayMessage = `Current refresh is ${Math.round(activeRefreshValue)} Hz. Streams targeting up to ${highestFailUnder144} FPS need the Vibepollo virtual screen or a higher-refresh display.`;
                      } else {
                        displayMessage = `Current refresh is ${Math.round(activeRefreshValue)} Hz. 120 FPS frame generation may stutter without a higher refresh display. Use the display override below to switch to the Vibepollo virtual display or move the stream to a higher-refresh monitor.`;
                      }
                      if (deltaSupported && highestSupported !== null) {
                        displayMessage += ` Vibepollo can switch up to ${Math.round(highestSupported)} Hz if Display Device Step 1 keeps only that monitor active.`;
                      }
                    } else {
                      displayMessage = "Unable to read the current refresh rate, but the display may not reach the required 240 Hz. Use the display override below to switch to the Vibepollo virtual display or move the stream to a higher-refresh monitor.";
                    }
                  } else {
                    displayStatus = "fail";
                    if (!hasActive && highestSupported !== null) {
                      displayMessage = `Display tops out at ${Math.round(evaluationHz)} Hz. Use the display override below to switch to the Vibepollo virtual display or switch to a 240 Hz display for frame generation.`;
                    } else if (hasActive) {
                      const mention = highestFailUnder144 ?? 120;
                      displayMessage = `Current refresh is ${Math.round(activeRefreshValue)} Hz. Streams targeting up to ${mention} FPS need the Vibepollo virtual screen or a higher-refresh display.`;
                      if (deltaSupported && highestSupported !== null) {
                        displayMessage += ` Vibepollo can switch up to ${Math.round(highestSupported)} Hz if configured in Display Device Step 1.`;
                      }
                    } else {
                      displayMessage = "Display refresh information was unavailable. Use the display override below to switch to the Vibepollo virtual display or switch to a 240 Hz display for frame generation.";
                    }
                  }
                } else {
                  displayStatus = "unknown";
                  displayMessage = "No display devices were returned by Vibepollo’s helper. Frame generation may not be able to enforce refresh changes.";
                  displayError = "Display helper returned no devices.";
                }
              } else {
                displayStatus = "unknown";
                displayMessage = "Display helper did not respond with device information.";
                displayError = "Display device enumeration failed.";
              }
            } else {
              displayStatus = "unknown";
              displayMessage = "Unable to reach the display helper.";
              displayError = "Display helper request failed.";
            }
          } else {
            displayStatus = "pass";
            displayMessage = "Vibepollo virtual screen guarantees a high refresh surface for frame generation.";
          }
          if (usingVirtual) {
            displayTargets = fpsTargets.map((fps) => ({
              fps,
              requiredHz: fps * 2,
              supported: true
            }));
          }
          const health = {
            checkedAt: Date.now(),
            capture: {
              status: captureStatus,
              method: captureValue,
              message: captureMessage
            },
            rtss: {
              status: rtssStatus,
              installed: rtssInstalled,
              running: rtssRunning,
              hooksDetected: rtssHooks,
              message: rtssMessage
            },
            display: {
              status: displayStatus,
              deviceLabel: displayLabel,
              deviceId: displayId,
              currentHz: displayHz,
              targets: displayTargets,
              virtualActive: usingVirtual,
              message: displayMessage,
              error: displayError
            }
          };
          if (highestFailUnder144 !== null) {
            health.suggestion = {
              message: `Use the display override above to switch to the Vibepollo virtual display or configure Display Device Step 1 to target the virtual display so ${highestFailUnder144} FPS streams stay smooth.`,
              emphasis: "warning"
            };
          } else if (captureStatus === "warn" || captureStatus === "fail") {
            health.suggestion = {
              message: "Set Capture -> Method to Windows Graphics Capture so frame generation stays stable.",
              emphasis: "info"
            };
          }
          frameGenHealth.value = health;
          frameGenHealthError.value = null;
        } catch (error) {
          frameGenHealth.value = null;
          frameGenHealthError.value = error instanceof Error ? error.message : "Unable to run frame generation health check.";
          if (!options.silent) {
            message == null ? void 0 : message.error("Unable to run frame generation health check.");
          }
        } finally {
          frameGenHealthLoading.value = false;
          frameGenHealthPromise = null;
        }
      };
      frameGenHealthPromise = run();
      return frameGenHealthPromise;
    }
    function handleFrameGenHealthRequest() {
      refreshFrameGenHealth({ reason: "manual" }).catch(() => {
      });
    }
    function handleEnableVirtualScreen() {
      if (!isWindows.value)
        return;
      displayOverrideEnabled.value = true;
      displaySelection.value = "virtual";
      refreshFrameGenHealth({ reason: "virtual-toggle", silent: true }).catch(() => {
      });
    }
    function warnIfHealthIssues(reason) {
      if (reason === "auto" || reason === "virtual-toggle" || reason === "capture-change" || reason === "output-change" || reason === "open") {
        return;
      }
      if (!message)
        return;
      const health = frameGenHealth.value;
      if (!health)
        return;
      if (health.capture.status === "warn" || health.capture.status === "fail") {
        message.warning(
          "Switch capture method to Windows Graphics Capture in Settings -> Capture to keep frame generation compatible.",
          { duration: 8e3 }
        );
      }
      if (health.rtss.status === "warn" || health.rtss.status === "fail") {
        message.warning(
          "RTSS is required for this fix. Install and launch RTSS to avoid microstutter.",
          { duration: 8e3 }
        );
      }
      if (!skipDisplayWarnings.value && !health.display.virtualActive) {
        const requiresHigh = health.display.targets.some(
          (target) => target.fps < 144 && target.supported === false
        );
        if (requiresHigh) {
          message.warning(
            "Use the display override to switch to the Vibepollo virtual display or adjust Display Device Step 1 to keep only the high-refresh monitor active.",
            { duration: 8e3 }
          );
        }
      }
    }
    const playniteInstalled = ref(false);
    const isNew = computed(() => form.value.index === -1);
    const newAppSource = ref("custom");
    const showPlaynitePicker = computed(
      () => isNew.value && isWindows.value && newAppSource.value === "playnite"
    );
    const gamesLoading = ref(false);
    const playniteOptions = ref([]);
    const selectedPlayniteId = ref("");
    const lockPlaynite = ref(false);
    async function loadPlayniteGames() {
      if (!isWindows.value || gamesLoading.value || playniteOptions.value.length)
        return;
      await refreshPlayniteStatus();
      if (!playniteInstalled.value)
        return;
      gamesLoading.value = true;
      try {
        const r = await http.get("/api/playnite/games");
        const games = Array.isArray(r.data) ? r.data : [];
        playniteOptions.value = games.filter((g) => !!g.installed).map((g) => ({ label: g.name || g.id, value: g.id })).sort((a, b) => a.label.localeCompare(b.label));
      } catch (_) {
      }
      gamesLoading.value = false;
      try {
        onNameSearch(nameSearchQuery.value);
      } catch {
      }
    }
    async function refreshPlayniteStatus() {
      try {
        const r = await http.get("/api/playnite/status", { validateStatus: () => true });
        if (r.status === 200 && r.data && typeof r.data === "object" && r.data !== null) {
          const data = r.data;
          playniteInstalled.value = data.installed === true || data.active === true;
        }
      } catch (_) {
      }
    }
    function onPickPlaynite(id) {
      const opt = playniteOptions.value.find((o) => o.value === id);
      if (!opt)
        return;
      form.value.name = opt.label;
      form.value.playniteId = id;
      form.value.playniteManaged = "manual";
      if (!form.value.cmd)
        form.value.cmd = "";
      lockPlaynite.value = true;
      ensureNameSelectionFromForm();
    }
    function unlockPlaynite() {
      lockPlaynite.value = false;
    }
    watch(newAppSource, (v) => {
      if (v === "custom") {
        form.value.playniteId = void 0;
        form.value.playniteManaged = void 0;
        lockPlaynite.value = false;
        selectedPlayniteId.value = "";
      }
    });
    let autoEnablingCaptureFix = false;
    watch(
      () => form.value.gen1FramegenFix,
      async (enabled) => {
        if (!enabled) {
          return;
        }
        if (form.value.gen2FramegenFix) {
          form.value.gen2FramegenFix = false;
        }
        if (autoEnablingCaptureFix) {
          return;
        }
        message == null ? void 0 : message.info(
          "Frame Generation Capture Fix requires Windows Graphics Capture (WGC), RTSS, and a display capable of 240 Hz or higher. Vibepollo's virtual screen or any display that satisfies the doubled refresh requirement will work.",
          { duration: 8e3 }
        );
        if (!skipDisplayWarnings.value) {
          if (!ddConfigOption.value || ddConfigOption.value === "disabled") {
            message == null ? void 0 : message.warning(
              `Configure Step 1 for Vibepollo's virtual screen or enable Display Device and set it to "Deactivate all other displays" so the doubled refresh requirement is met during the stream.`,
              { duration: 8e3 }
            );
          } else if (ddConfigOption.value !== "ensure_only_display") {
            message == null ? void 0 : message.warning(
              `Set Step 1 to use Vibepollo's virtual screen or adjust Display Device to "Deactivate all other displays" so only the high-refresh monitor stays active.`,
              { duration: 8e3 }
            );
          }
        }
        await refreshFrameGenHealth({ reason: "gen1" });
        warnIfHealthIssues("gen1");
      }
    );
    watch(
      () => form.value.gen2FramegenFix,
      (enabled) => {
        if (!enabled) {
          return;
        }
        form.value.gen1FramegenFix = true;
        form.value.gen2FramegenFix = false;
      }
    );
    watch(
      () => displaySelection.value,
      (selection, prev) => {
        if (!isWindows.value)
          return;
        if (!(form.value.gen1FramegenFix || form.value.gen2FramegenFix || frameGenHealth.value))
          return;
        if (selection === prev)
          return;
        const reason = selection === "virtual" || prev === "virtual" ? "virtual-toggle" : "output-change";
        refreshFrameGenHealth({ reason, silent: true }).catch(() => {
        });
      }
    );
    watch(
      () => captureMethod.value,
      () => {
        if (!isWindows.value)
          return;
        if (!(form.value.gen1FramegenFix || form.value.gen2FramegenFix || frameGenHealth.value))
          return;
        refreshFrameGenHealth({ reason: "capture-change", silent: true }).catch(() => {
        });
      }
    );
    watch(
      () => autoCaptureUsesWgc.value,
      (enabled, prev) => {
        if (enabled === prev)
          return;
        if (!isWindows.value)
          return;
        if (!(form.value.gen1FramegenFix || form.value.gen2FramegenFix || frameGenHealth.value))
          return;
        refreshFrameGenHealth({ reason: "capture-change", silent: true }).catch(() => {
        });
      }
    );
    watch(
      () => [form.value.output, globalOutputName.value],
      () => {
        if (!isWindows.value)
          return;
        if (!(form.value.gen1FramegenFix || form.value.gen2FramegenFix || frameGenHealth.value))
          return;
        refreshFrameGenHealth({ reason: "output-change", silent: true }).catch(() => {
        });
      }
    );
    watch(
      () => frameGenerationSelection.value,
      (mode, prevMode) => {
        const anyFrameGenEnabled = mode !== "off";
        const wasFrameGenEnabled = prevMode !== "off";
        if (anyFrameGenEnabled && !form.value.gen1FramegenFix) {
          autoEnablingCaptureFix = true;
          form.value.gen1FramegenFix = true;
          if (mode === "nvidia-smooth-motion") {
            message == null ? void 0 : message.info(
              "Frame Generation Capture Fix has been automatically enabled. NVIDIA Smooth Motion uses RTSS Front Edge Sync during streams.",
              { duration: 8e3 }
            );
          } else if (mode === "lossless-scaling") {
            message == null ? void 0 : message.info(
              "Frame Generation Capture Fix has been automatically enabled because Lossless Scaling frame generation uses RTSS Front Edge Sync.",
              { duration: 8e3 }
            );
          } else if (mode === "game-provided") {
            message == null ? void 0 : message.info(
              "Frame Generation Capture Fix has been automatically enabled. Game-provided frame generation uses NVIDIA Reflex on NVIDIA systems and Front Edge Sync on AMD systems.",
              { duration: 8e3 }
            );
          }
          refreshFrameGenHealth({ reason: "auto", silent: true }).catch(() => {
          });
          setTimeout(() => {
            autoEnablingCaptureFix = false;
          }, 100);
        } else if (!anyFrameGenEnabled && wasFrameGenEnabled && form.value.gen1FramegenFix) {
          autoEnablingCaptureFix = true;
          form.value.gen1FramegenFix = false;
          setTimeout(() => {
            autoEnablingCaptureFix = false;
          }, 100);
        }
      }
    );
    const bodyRef = ref(null);
    const showTopShadow = ref(false);
    const showBottomShadow = ref(false);
    function updateShadows() {
      const el = bodyRef.value;
      if (!el)
        return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight > clientHeight + 1;
      showTopShadow.value = hasOverflow && scrollTop > 4;
      showBottomShadow.value = hasOverflow && scrollTop + clientHeight < scrollHeight - 4;
    }
    function onBodyScroll() {
      updateShadows();
    }
    let ro = null;
    onMounted(() => {
      const el = bodyRef.value;
      if (el) {
        el.addEventListener("scroll", onBodyScroll, { passive: true });
      }
      try {
        ro = new ResizeObserver(() => updateShadows());
        if (el)
          ro.observe(el);
      } catch {
      }
      requestAnimationFrame(() => updateShadows());
    });
    onBeforeUnmount(() => {
      const el = bodyRef.value;
      if (el)
        el.removeEventListener("scroll", onBodyScroll);
      try {
        ro == null ? void 0 : ro.disconnect();
      } catch {
      }
      ro = null;
    });
    function onNameSearch(q) {
      nameSearchQuery.value = q || "";
      const query = String(q || "").trim().toLowerCase();
      const list = [];
      if (query.length) {
        list.push({ label: `Custom: "${q}"`, value: `__custom__:${q}` });
      } else {
        const cur = String(form.value.name || "").trim();
        if (cur)
          list.push({ label: `Custom: "${cur}"`, value: `__custom__:${cur}` });
      }
      if (playniteOptions.value.length) {
        const filtered = (query ? playniteOptions.value.filter((o) => o.label.toLowerCase().includes(query)) : playniteOptions.value.slice(0, 100)).slice(0, 100);
        list.push(...filtered);
      }
      nameOptions.value = list;
    }
    function onNamePicked(val) {
      const v = String(val || "");
      if (!v) {
        nameSelectValue.value = "";
        form.value.name = "";
        form.value.playniteId = void 0;
        form.value.playniteManaged = void 0;
        validateName();
        return;
      }
      if (v.startsWith("__custom__:")) {
        const name = v.substring("__custom__:".length).trim();
        form.value.name = name;
        form.value.playniteId = void 0;
        form.value.playniteManaged = void 0;
        validateName();
        return;
      }
      const opt = playniteOptions.value.find((o) => o.value === v);
      if (opt) {
        form.value.name = opt.label;
        form.value.playniteId = v;
        form.value.playniteManaged = "manual";
      }
      validateName();
    }
    async function save() {
      validateName();
      if (nameError.value)
        return;
      saving.value = true;
      try {
        try {
          if (isWindows.value && !form.value.playniteId && Array.isArray(playniteOptions.value) && playniteOptions.value.length && typeof form.value.name === "string") {
            const target = String(form.value.name || "").trim().toLowerCase();
            const exact = playniteOptions.value.find((o) => o.label.trim().toLowerCase() === target);
            if (exact) {
              form.value.playniteId = exact.value;
              form.value.playniteManaged = "manual";
            }
          }
        } catch (_) {
        }
        const payload = toServerPayload(form.value);
        const response = await http.post("./api/apps", payload, {
          headers: { "Content-Type": "application/json" },
          validateStatus: () => true
        });
        const okStatus = response.status >= 200 && response.status < 300;
        const responseData = response == null ? void 0 : response.data;
        if (!okStatus || responseData && responseData.status === false) {
          const errMessage = responseData && typeof responseData === "object" && "error" in responseData ? String(responseData.error ?? "Failed to save application.") : "Failed to save application.";
          message == null ? void 0 : message.error(errMessage);
          return;
        }
        emit("saved");
        close();
      } finally {
        saving.value = false;
      }
    }
    async function del() {
      var _a, _b, _c;
      saving.value = true;
      try {
        const pid = form.value.playniteId;
        if (isPlayniteAuto.value && pid) {
          try {
            try {
              if (!configStore.config)
                await (((_a = configStore.fetchConfig) == null ? void 0 : _a.call(configStore)) || Promise.resolve());
            } catch {
            }
            const current = Array.isArray(
              (_b = configStore.config) == null ? void 0 : _b.playnite_exclude_games
            ) ? configStore.config.playnite_exclude_games : [];
            const map = new Map(current.map((e) => [String(e.id), String(e.name || "")]));
            const name = ((_c = playniteOptions.value.find((o) => o.value === String(pid))) == null ? void 0 : _c.label) || "";
            map.set(String(pid), name);
            const next = Array.from(map.entries()).map(([id, name2]) => ({ id, name: name2 }));
            configStore.updateOption("playnite_exclude_games", next);
            await configStore.save();
          } catch (_) {
          }
        }
        const r = await http.delete(`./api/apps/${form.value.index}`, { validateStatus: () => true });
        try {
          if (r && r.data && r.data.playniteFullscreenDisabled) {
            try {
              configStore.updateOption("playnite_fullscreen_entry_enabled", false);
            } catch {
            }
            try {
              message == null ? void 0 : message.info(
                "Playnite Fullscreen entry removed. The Playnite Desktop option was turned off in Settings -> Playnite."
              );
            } catch {
            }
          }
        } catch {
        }
        try {
          await http.post("./api/playnite/force_sync", {}, { validateStatus: () => true });
        } catch (_) {
        }
        emit("deleted");
        close();
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_n_input = __unplugin_components_0;
      return openBlock(), createBlock(unref(NModal), {
        show: open.value,
        "mask-closable": true,
        "trap-focus": !overridesPickerOpen.value,
        "onUpdate:show": _cache[45] || (_cache[45] = (v) => emit("update:modelValue", v))
      }, {
        default: withCtx(() => [
          createVNode(unref(NCard), {
            bordered: false,
            "content-style": {
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden"
            },
            class: "overflow-hidden",
            style: { "max-width": "56rem", "width": "100%", "height": "min(85dvh, calc(100dvh - 2rem))", "max-height": "calc(100dvh - 2rem)" }
          }, {
            header: withCtx(() => [
              createBaseVNode("div", _hoisted_1, [
                createBaseVNode("div", _hoisted_2, [
                  createBaseVNode("div", _hoisted_3, [
                    createVNode(LucideIcon, {
                      name: "fa-window-restore",
                      size: 24
                    })
                  ]),
                  createBaseVNode("div", _hoisted_4, [
                    createBaseVNode(
                      "span",
                      _hoisted_5,
                      toDisplayString(form.value.index === -1 ? "Add Application" : "Edit Application"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                createBaseVNode("div", _hoisted_6, [
                  isPlayniteManaged.value ? (openBlock(), createElementBlock("span", _hoisted_7, " Playnite ")) : (openBlock(), createElementBlock("span", _hoisted_8, " Custom "))
                ])
              ])
            ]),
            footer: withCtx(() => [
              createBaseVNode("div", _hoisted_59, [
                createVNode(unref(NButton), {
                  type: "default",
                  strong: "",
                  onClick: close
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("_common.cancel")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }),
                form.value.index !== -1 ? (openBlock(), createBlock(unref(NButton), {
                  key: 0,
                  type: "error",
                  disabled: saving.value,
                  onClick: _cache[41] || (_cache[41] = ($event) => showDeleteConfirm.value = true)
                }, {
                  default: withCtx(() => [
                    createVNode(LucideIcon, {
                      name: "fa-trash",
                      size: 16
                    }),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("apps.delete")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["disabled"])) : createCommentVNode("v-if", true),
                createVNode(unref(NButton), {
                  type: "primary",
                  loading: saving.value,
                  disabled: saving.value || !!nameError.value,
                  onClick: save
                }, {
                  default: withCtx(() => [
                    createVNode(LucideIcon, {
                      name: "fa-save",
                      size: 16
                    }),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("_common.save")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["loading", "disabled"])
              ])
            ]),
            default: withCtx(() => [
              createBaseVNode(
                "div",
                {
                  ref_key: "bodyRef",
                  ref: bodyRef,
                  class: "relative flex-1 min-h-0 overflow-auto pr-1",
                  style: { "padding-bottom": "calc(env(safe-area-inset-bottom) + 0.5rem)" }
                },
                [
                  createCommentVNode(" Scroll affordance shadows: appear when more content is available "),
                  showTopShadow.value ? (openBlock(), createElementBlock("div", _hoisted_9)) : createCommentVNode("v-if", true),
                  showBottomShadow.value ? (openBlock(), createElementBlock("div", _hoisted_10)) : createCommentVNode("v-if", true),
                  createBaseVNode("form", {
                    class: "space-y-6 text-sm",
                    onSubmit: withModifiers(save, ["prevent"]),
                    onKeydown: withKeys(withModifiers(save, ["ctrl", "stop", "prevent"]), ["enter"])
                  }, [
                    createVNode(AppEditBasicsSection, {
                      form: form.value,
                      "onUpdate:form": _cache[0] || (_cache[0] = ($event) => form.value = $event),
                      "cmd-text": cmdText.value,
                      "onUpdate:cmdText": _cache[1] || (_cache[1] = ($event) => cmdText.value = $event),
                      "name-select-value": nameSelectValue.value,
                      "onUpdate:nameSelectValue": _cache[2] || (_cache[2] = ($event) => nameSelectValue.value = $event),
                      "selected-playnite-id": selectedPlayniteId.value,
                      "onUpdate:selectedPlayniteId": _cache[3] || (_cache[3] = ($event) => selectedPlayniteId.value = $event),
                      "is-playnite": isPlayniteManaged.value,
                      "show-playnite-picker": showPlaynitePicker.value,
                      "playnite-installed": playniteInstalled.value,
                      "name-select-options": nameSelectOptions.value,
                      "games-loading": gamesLoading.value,
                      "fallback-option": fallbackOption,
                      "playnite-options": playniteOptions.value,
                      "lock-playnite": lockPlaynite.value,
                      "name-error": nameError.value,
                      onNameFocus,
                      onNameBlur: validateName,
                      onNameSearch,
                      onNamePicked,
                      onLoadPlayniteGames: loadPlayniteGames,
                      onPickPlaynite,
                      onUnlockPlaynite: unlockPlaynite,
                      onOpenCoverFinder: openCoverFinder
                    }, null, 8, ["form", "cmd-text", "name-select-value", "selected-playnite-id", "is-playnite", "show-playnite-picker", "playnite-installed", "name-select-options", "games-loading", "playnite-options", "lock-playnite", "name-error"]),
                    createBaseVNode("fieldset", _hoisted_12, [
                      _cache[54] || (_cache[54] = createBaseVNode(
                        "legend",
                        { class: "px-1 text-xs font-semibold opacity-60" },
                        "App Behavior",
                        -1
                        /* CACHED */
                      )),
                      createBaseVNode("div", _hoisted_13, [
                        createVNode(unref(NCheckbox), {
                          checked: form.value.excludeGlobalPrepCmd,
                          "onUpdate:checked": _cache[4] || (_cache[4] = ($event) => form.value.excludeGlobalPrepCmd = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[46] || (_cache[46] = [
                            createTextVNode(
                              " Exclude Global Prep ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [46]
                        }, 8, ["checked"]),
                        !isPlayniteManaged.value ? (openBlock(), createBlock(unref(NCheckbox), {
                          key: 0,
                          checked: form.value.autoDetach,
                          "onUpdate:checked": _cache[5] || (_cache[5] = ($event) => form.value.autoDetach = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[47] || (_cache[47] = [
                            createTextVNode(
                              " Auto Detach ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [47]
                        }, 8, ["checked"])) : createCommentVNode("v-if", true),
                        !isPlayniteManaged.value ? (openBlock(), createBlock(unref(NCheckbox), {
                          key: 1,
                          checked: form.value.waitAll,
                          "onUpdate:checked": _cache[6] || (_cache[6] = ($event) => form.value.waitAll = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[48] || (_cache[48] = [
                            createTextVNode(
                              " Wait All ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [48]
                        }, 8, ["checked"])) : createCommentVNode("v-if", true),
                        isWindows.value && !isPlayniteManaged.value ? (openBlock(), createBlock(unref(NCheckbox), {
                          key: 2,
                          checked: form.value.elevated,
                          "onUpdate:checked": _cache[7] || (_cache[7] = ($event) => form.value.elevated = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[49] || (_cache[49] = [
                            createTextVNode(
                              " Elevated ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [49]
                        }, 8, ["checked"])) : createCommentVNode("v-if", true),
                        createVNode(unref(NCheckbox), {
                          checked: form.value.terminateOnPause,
                          "onUpdate:checked": _cache[8] || (_cache[8] = ($event) => form.value.terminateOnPause = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[50] || (_cache[50] = [
                            createTextVNode(
                              " Terminate On Pause ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [50]
                        }, 8, ["checked"]),
                        createVNode(unref(NCheckbox), {
                          checked: form.value.allowClientCommands,
                          "onUpdate:checked": _cache[9] || (_cache[9] = ($event) => form.value.allowClientCommands = $event),
                          size: "small",
                          class: "md:col-span-2"
                        }, {
                          default: withCtx(() => _cache[51] || (_cache[51] = [
                            createTextVNode(
                              " Allow Client Commands ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [51]
                        }, 8, ["checked"]),
                        createVNode(unref(NCheckbox), {
                          checked: form.value.useAppIdentity,
                          "onUpdate:checked": _cache[10] || (_cache[10] = ($event) => form.value.useAppIdentity = $event),
                          size: "small"
                        }, {
                          default: withCtx(() => _cache[52] || (_cache[52] = [
                            createTextVNode(
                              " Use App Identity ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [52]
                        }, 8, ["checked"]),
                        form.value.useAppIdentity ? (openBlock(), createBlock(unref(NCheckbox), {
                          key: 3,
                          checked: form.value.perClientAppIdentity,
                          "onUpdate:checked": _cache[11] || (_cache[11] = ($event) => form.value.perClientAppIdentity = $event),
                          size: "small",
                          class: "md:col-span-2"
                        }, {
                          default: withCtx(() => _cache[53] || (_cache[53] = [
                            createTextVNode(
                              " Per-client App Identity ",
                              -1
                              /* CACHED */
                            )
                          ])),
                          _: 1,
                          __: [53]
                        }, 8, ["checked"])) : createCommentVNode("v-if", true),
                        isWindows.value ? (openBlock(), createBlock(unref(NCheckbox), {
                          key: 4,
                          checked: displayOverrideEnabled.value,
                          "onUpdate:checked": _cache[12] || (_cache[12] = ($event) => displayOverrideEnabled.value = $event),
                          size: "small",
                          class: "md:col-span-2"
                        }, {
                          default: withCtx(() => [
                            createBaseVNode("div", _hoisted_14, [
                              createBaseVNode(
                                "span",
                                null,
                                toDisplayString(unref(t)("config.virtual_display_toggle_label")),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "span",
                                _hoisted_15,
                                toDisplayString(unref(t)("config.virtual_display_toggle_hint")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["checked"])) : createCommentVNode("v-if", true)
                      ])
                    ]),
                    isWindows.value && displayOverrideEnabled.value ? (openBlock(), createElementBlock("div", _hoisted_16, [
                      createBaseVNode("div", _hoisted_17, [
                        createBaseVNode("div", _hoisted_18, [
                          createBaseVNode(
                            "span",
                            _hoisted_19,
                            toDisplayString(unref(t)("config.app_display_override_label")),
                            1
                            /* TEXT */
                          )
                        ]),
                        createBaseVNode(
                          "p",
                          _hoisted_20,
                          toDisplayString(unref(t)("config.app_display_override_hint")),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", _hoisted_21, [
                        createVNode(unref(NRadioGroup), {
                          value: displaySelection.value,
                          "onUpdate:value": _cache[13] || (_cache[13] = ($event) => displaySelection.value = $event),
                          class: "grid gap-3 sm:grid-cols-2"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(NRadio), {
                              value: "virtual",
                              class: "app-radio-card cursor-pointer"
                            }, {
                              default: withCtx(() => [
                                createBaseVNode(
                                  "span",
                                  _hoisted_22,
                                  toDisplayString(unref(t)("config.app_display_override_virtual")),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 1
                              /* STABLE */
                            }),
                            createVNode(unref(NRadio), {
                              value: "physical",
                              class: "app-radio-card cursor-pointer"
                            }, {
                              default: withCtx(() => [
                                createBaseVNode(
                                  "span",
                                  _hoisted_23,
                                  toDisplayString(unref(t)("config.app_display_override_physical")),
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
                        }, 8, ["value"])
                      ]),
                      displaySelection.value === "physical" ? (openBlock(), createElementBlock("div", _hoisted_24, [
                        createBaseVNode("div", _hoisted_25, [
                          createBaseVNode(
                            "span",
                            _hoisted_26,
                            toDisplayString(unref(t)("config.app_display_physical_label")),
                            1
                            /* TEXT */
                          ),
                          createVNode(unref(NButton), {
                            size: "tiny",
                            tertiary: "",
                            loading: displayDevicesLoading.value,
                            onClick: loadDisplayDevices
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(unref(t)("_common.refresh")),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          }, 8, ["loading"])
                        ]),
                        createBaseVNode(
                          "p",
                          _hoisted_27,
                          toDisplayString(unref(t)("config.app_display_physical_hint")),
                          1
                          /* TEXT */
                        ),
                        createVNode(unref(NSelect), {
                          value: physicalOutputModel.value,
                          "onUpdate:value": _cache[14] || (_cache[14] = ($event) => physicalOutputModel.value = $event),
                          options: displayDeviceOptions.value,
                          loading: displayDevicesLoading.value,
                          placeholder: unref(t)("config.app_display_physical_placeholder"),
                          filterable: "",
                          clearable: "",
                          onFocus: onDisplaySelectFocus
                        }, null, 8, ["value", "options", "loading", "placeholder"]),
                        createBaseVNode("div", _hoisted_28, [
                          displayDevicesError.value ? (openBlock(), createElementBlock(
                            "span",
                            _hoisted_29,
                            toDisplayString(displayDevicesError.value),
                            1
                            /* TEXT */
                          )) : (openBlock(), createElementBlock(
                            "span",
                            _hoisted_30,
                            toDisplayString(unref(t)("config.app_display_physical_status_hint")),
                            1
                            /* TEXT */
                          ))
                        ])
                      ])) : createCommentVNode("v-if", true),
                      displaySelection.value === "physical" ? (openBlock(), createElementBlock("div", _hoisted_31, [
                        createBaseVNode("div", _hoisted_32, [
                          createBaseVNode(
                            "span",
                            _hoisted_33,
                            toDisplayString(unref(t)("config.dd_config_label")),
                            1
                            /* TEXT */
                          ),
                          form.value.ddConfigurationOption ? (openBlock(), createBlock(unref(NButton), {
                            key: 0,
                            size: "tiny",
                            tertiary: "",
                            onClick: _cache[15] || (_cache[15] = ($event) => form.value.ddConfigurationOption = null)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(unref(t)("config.app_virtual_display_mode_reset")),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          })) : createCommentVNode("v-if", true)
                        ]),
                        createBaseVNode(
                          "p",
                          _hoisted_34,
                          toDisplayString(unref(t)("config.dd_config_hint")),
                          1
                          /* TEXT */
                        ),
                        createVNode(unref(NRadioGroup), {
                          value: ddConfigurationModel.value,
                          "onUpdate:value": _cache[16] || (_cache[16] = ($event) => ddConfigurationModel.value = $event),
                          class: "grid gap-2"
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(appDdConfigurationOptions.value, (opt) => {
                                return openBlock(), createBlock(unref(NRadio), {
                                  key: opt.value,
                                  value: opt.value,
                                  label: opt.label
                                }, null, 8, ["value", "label"]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["value"])
                      ])) : createCommentVNode("v-if", true),
                      displaySelection.value === "virtual" ? (openBlock(), createElementBlock("div", _hoisted_35, [
                        createBaseVNode("div", _hoisted_36, [
                          createBaseVNode("div", _hoisted_37, [
                            createBaseVNode(
                              "span",
                              _hoisted_38,
                              toDisplayString(unref(t)("config.app_virtual_display_mode_label")),
                              1
                              /* TEXT */
                            ),
                            form.value.virtualDisplayMode !== null ? (openBlock(), createBlock(unref(NButton), {
                              key: 0,
                              size: "tiny",
                              tertiary: "",
                              onClick: _cache[17] || (_cache[17] = ($event) => form.value.virtualDisplayMode = null)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(unref(t)("config.app_virtual_display_mode_reset")),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 1
                              /* STABLE */
                            })) : createCommentVNode("v-if", true)
                          ]),
                          createBaseVNode(
                            "p",
                            _hoisted_39,
                            toDisplayString(unref(t)("config.app_virtual_display_mode_hint")),
                            1
                            /* TEXT */
                          )
                        ]),
                        createVNode(unref(NRadioGroup), {
                          value: appVirtualDisplayModeSelection.value,
                          "onUpdate:value": _cache[18] || (_cache[18] = ($event) => appVirtualDisplayModeSelection.value = $event),
                          class: "grid gap-3 sm:grid-cols-3"
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(appVirtualDisplayModeOptions.value, (option) => {
                                return openBlock(), createBlock(unref(NRadio), {
                                  key: String(option.value),
                                  value: option.value,
                                  class: "app-radio-card cursor-pointer"
                                }, {
                                  default: withCtx(() => [
                                    createBaseVNode(
                                      "span",
                                      _hoisted_40,
                                      toDisplayString(option.label),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  _: 2
                                  /* DYNAMIC */
                                }, 1032, ["value"]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["value"]),
                        appVirtualDisplayModeSelection.value === "global" ? (openBlock(), createElementBlock(
                          "div",
                          _hoisted_41,
                          toDisplayString(unref(t)("config.app_virtual_display_mode_follow_global")),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true),
                        createBaseVNode("div", _hoisted_42, [
                          createBaseVNode("div", _hoisted_43, [
                            createBaseVNode(
                              "span",
                              _hoisted_44,
                              toDisplayString(unref(t)("config.virtual_display_layout_label")),
                              1
                              /* TEXT */
                            ),
                            form.value.virtualDisplayLayout !== null ? (openBlock(), createBlock(unref(NButton), {
                              key: 0,
                              size: "tiny",
                              tertiary: "",
                              onClick: _cache[19] || (_cache[19] = ($event) => form.value.virtualDisplayLayout = null)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(unref(t)("config.app_virtual_display_layout_reset")),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 1
                              /* STABLE */
                            })) : createCommentVNode("v-if", true)
                          ]),
                          createBaseVNode(
                            "p",
                            _hoisted_45,
                            toDisplayString(unref(t)("config.virtual_display_layout_hint")),
                            1
                            /* TEXT */
                          )
                        ]),
                        createVNode(unref(NRadioGroup), {
                          value: resolvedVirtualDisplayLayout.value,
                          "onUpdate:value": _cache[20] || (_cache[20] = (v) => form.value.virtualDisplayLayout = v === globalVirtualDisplayLayout.value ? null : v),
                          class: "space-y-4"
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(appVirtualDisplayLayoutOptions.value, (option) => {
                                return openBlock(), createElementBlock("div", {
                                  key: option.value,
                                  class: "flex flex-col cursor-pointer py-2 px-2 rounded-md hover:bg-surface/10",
                                  onClick: ($event) => selectVirtualDisplayLayout(option.value),
                                  onKeydown: [
                                    withKeys(withModifiers(($event) => selectVirtualDisplayLayout(option.value), ["prevent"]), ["enter"]),
                                    withKeys(withModifiers(($event) => selectVirtualDisplayLayout(option.value), ["prevent"]), ["space"])
                                  ],
                                  tabindex: "0"
                                }, [
                                  createBaseVNode("div", _hoisted_47, [
                                    createVNode(unref(NRadio), {
                                      value: option.value
                                    }, null, 8, ["value"]),
                                    createBaseVNode(
                                      "span",
                                      _hoisted_48,
                                      toDisplayString(option.label),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_49,
                                    toDisplayString(option.description),
                                    1
                                    /* TEXT */
                                  )
                                ], 40, _hoisted_46);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["value"])
                      ])) : createCommentVNode("v-if", true)
                    ])) : createCommentVNode("v-if", true),
                    createCommentVNode(" Advanced settings toggle "),
                    createBaseVNode("div", _hoisted_50, [
                      createBaseVNode("button", {
                        type: "button",
                        class: "flex items-center gap-1.5 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg hover:bg-dark/5 dark:hover:bg-light/5",
                        onClick: _cache[21] || (_cache[21] = ($event) => showAdvanced.value = !showAdvanced.value)
                      }, [
                        (openBlock(), createElementBlock(
                          "svg",
                          {
                            class: normalizeClass(["w-3.5 h-3.5 transition-transform", showAdvanced.value ? "rotate-180" : ""]),
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "aria-hidden": ""
                          },
                          _cache[55] || (_cache[55] = [
                            createBaseVNode(
                              "path",
                              {
                                d: "M6 9l6 6 6-6",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              },
                              null,
                              -1
                              /* CACHED */
                            )
                          ]),
                          2
                          /* CLASS */
                        )),
                        createTextVNode(
                          " " + toDisplayString(showAdvanced.value ? "Hide advanced" : "Show advanced"),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    showAdvanced.value ? (openBlock(), createElementBlock(
                      Fragment,
                      { key: 1 },
                      [
                        createVNode(AppEditConfigOverridesSection, {
                          overrides: form.value.configOverrides,
                          "onUpdate:overrides": _cache[22] || (_cache[22] = ($event) => form.value.configOverrides = $event),
                          "picker-open": overridesPickerOpen.value,
                          "onUpdate:pickerOpen": _cache[23] || (_cache[23] = ($event) => overridesPickerOpen.value = $event)
                        }, null, 8, ["overrides", "picker-open"]),
                        isWindows.value ? (openBlock(), createBlock(AppEditFrameGenSection, {
                          key: 0,
                          mode: frameGenerationSelection.value,
                          "onUpdate:mode": _cache[24] || (_cache[24] = ($event) => frameGenerationSelection.value = $event),
                          gen1: form.value.gen1FramegenFix,
                          "onUpdate:gen1": _cache[25] || (_cache[25] = ($event) => form.value.gen1FramegenFix = $event),
                          gen2: form.value.gen2FramegenFix,
                          "onUpdate:gen2": _cache[26] || (_cache[26] = ($event) => form.value.gen2FramegenFix = $event),
                          "lossless-profile": form.value.losslessScalingProfile,
                          "onUpdate:losslessProfile": _cache[27] || (_cache[27] = ($event) => form.value.losslessScalingProfile = $event),
                          "lossless-target-fps": form.value.losslessScalingTargetFps,
                          "onUpdate:losslessTargetFps": _cache[28] || (_cache[28] = ($event) => form.value.losslessScalingTargetFps = $event),
                          "lossless-rtss-limit": form.value.losslessScalingRtssLimit,
                          "onUpdate:losslessRtssLimit": _cache[29] || (_cache[29] = ($event) => form.value.losslessScalingRtssLimit = $event),
                          "lossless-flow-scale": losslessFlowScaleModel.value,
                          "onUpdate:losslessFlowScale": _cache[30] || (_cache[30] = ($event) => losslessFlowScaleModel.value = $event),
                          "lossless-launch-delay": form.value.losslessScalingLaunchDelay,
                          "onUpdate:losslessLaunchDelay": _cache[31] || (_cache[31] = ($event) => form.value.losslessScalingLaunchDelay = $event),
                          health: frameGenHealth.value,
                          "health-loading": frameGenHealthLoading.value,
                          "health-error": frameGenHealthError.value,
                          "lossless-active": losslessFrameGenEnabled.value,
                          "nvidia-active": nvidiaFrameGenEnabled.value,
                          "using-virtual-display": usingVirtualDisplay.value,
                          "has-active-lossless-overrides": hasActiveLosslessOverrides.value,
                          "on-lossless-rtss-limit-change": onLosslessRtssLimitChange,
                          "reset-active-lossless-profile": resetActiveLosslessProfile,
                          onRefreshHealth: handleFrameGenHealthRequest,
                          onEnableVirtualScreen: handleEnableVirtualScreen
                        }, null, 8, ["mode", "gen1", "gen2", "lossless-profile", "lossless-target-fps", "lossless-rtss-limit", "lossless-flow-scale", "lossless-launch-delay", "health", "health-loading", "health-error", "lossless-active", "nvidia-active", "using-virtual-display", "has-active-lossless-overrides"])) : createCommentVNode("v-if", true),
                        isWindows.value ? (openBlock(), createBlock(AppEditLosslessScalingSection, {
                          key: 1,
                          form: form.value,
                          "onUpdate:form": _cache[32] || (_cache[32] = ($event) => form.value = $event),
                          "lossless-performance-mode": losslessPerformanceModeModel.value,
                          "onUpdate:losslessPerformanceMode": _cache[33] || (_cache[33] = ($event) => losslessPerformanceModeModel.value = $event),
                          "lossless-resolution-scale": losslessResolutionScaleModel.value,
                          "onUpdate:losslessResolutionScale": _cache[34] || (_cache[34] = ($event) => losslessResolutionScaleModel.value = $event),
                          "lossless-scaling-mode": losslessScalingModeModel.value,
                          "onUpdate:losslessScalingMode": _cache[35] || (_cache[35] = ($event) => losslessScalingModeModel.value = $event),
                          "lossless-sharpening": losslessSharpeningModel.value,
                          "onUpdate:losslessSharpening": _cache[36] || (_cache[36] = ($event) => losslessSharpeningModel.value = $event),
                          "lossless-anime-size": losslessAnimeSizeModel.value,
                          "onUpdate:losslessAnimeSize": _cache[37] || (_cache[37] = ($event) => losslessAnimeSizeModel.value = $event),
                          "lossless-anime-vrs": losslessAnimeVrsModel.value,
                          "onUpdate:losslessAnimeVrs": _cache[38] || (_cache[38] = ($event) => losslessAnimeVrsModel.value = $event),
                          "is-playnite-managed": isPlayniteManaged.value,
                          "show-lossless-resolution": showLosslessResolution.value,
                          "show-lossless-sharpening": showLosslessSharpening.value,
                          "show-lossless-anime-options": showLosslessAnimeOptions.value,
                          "has-active-lossless-overrides": hasActiveLosslessOverrides.value,
                          "lossless-executable-detected": losslessExecutableDetected.value,
                          "lossless-executable-check-complete": losslessExecutableCheckComplete.value,
                          "reset-active-lossless-profile": resetActiveLosslessProfile
                        }, null, 8, ["form", "lossless-performance-mode", "lossless-resolution-scale", "lossless-scaling-mode", "lossless-sharpening", "lossless-anime-size", "lossless-anime-vrs", "is-playnite-managed", "show-lossless-resolution", "show-lossless-sharpening", "show-lossless-anime-options", "has-active-lossless-overrides", "lossless-executable-detected", "lossless-executable-check-complete"])) : createCommentVNode("v-if", true)
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : createCommentVNode("v-if", true),
                    createVNode(AppEditPrepCommandsSection, {
                      form: form.value,
                      "onUpdate:form": _cache[39] || (_cache[39] = ($event) => form.value = $event),
                      "is-windows": isWindows.value,
                      onAddPrep: addPrep
                    }, null, 8, ["form", "is-windows"]),
                    createBaseVNode("section", _hoisted_51, [
                      createBaseVNode("div", _hoisted_52, [
                        _cache[57] || (_cache[57] = createBaseVNode(
                          "h3",
                          { class: "text-xs font-semibold opacity-70" },
                          " State Commands ",
                          -1
                          /* CACHED */
                        )),
                        createVNode(unref(NButton), {
                          size: "small",
                          type: "primary",
                          onClick: addState
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-plus",
                              size: 14
                            }),
                            _cache[56] || (_cache[56] = createTextVNode(
                              " Add ",
                              -1
                              /* CACHED */
                            ))
                          ]),
                          _: 1,
                          __: [56]
                        })
                      ]),
                      createVNode(unref(NCheckbox), {
                        checked: form.value.excludeGlobalStateCmd,
                        "onUpdate:checked": _cache[40] || (_cache[40] = ($event) => form.value.excludeGlobalStateCmd = $event),
                        size: "small"
                      }, {
                        default: withCtx(() => _cache[58] || (_cache[58] = [
                          createTextVNode(
                            " Exclude Global State Commands ",
                            -1
                            /* CACHED */
                          )
                        ])),
                        _: 1,
                        __: [58]
                      }, 8, ["checked"]),
                      form.value.stateCmd.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_53, "None")) : (openBlock(), createElementBlock("div", _hoisted_54, [
                        (openBlock(true), createElementBlock(
                          Fragment,
                          null,
                          renderList(form.value.stateCmd, (s, i) => {
                            return openBlock(), createElementBlock("div", {
                              key: `state-${i}`,
                              class: "rounded-md border border-dark/10 dark:border-light/10 p-2"
                            }, [
                              createBaseVNode("div", _hoisted_55, [
                                createBaseVNode(
                                  "div",
                                  _hoisted_56,
                                  "Step " + toDisplayString(i + 1),
                                  1
                                  /* TEXT */
                                ),
                                createBaseVNode("div", _hoisted_57, [
                                  isWindows.value ? (openBlock(), createBlock(unref(NCheckbox), {
                                    key: 0,
                                    checked: s.elevated,
                                    "onUpdate:checked": ($event) => s.elevated = $event,
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [..._cache[59] || (_cache[59] = [
                                      createTextVNode(
                                        " Elevated ",
                                        -1
                                        /* CACHED */
                                      )
                                    ])]),
                                    _: 2,
                                    __: [59]
                                  }, 1032, ["checked", "onUpdate:checked"])) : createCommentVNode("v-if", true),
                                  createVNode(unref(NButton), {
                                    size: "small",
                                    type: "error",
                                    strong: "",
                                    onClick: ($event) => form.value.stateCmd.splice(i, 1)
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(LucideIcon, {
                                        name: "fa-trash",
                                        size: 14
                                      })
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["onClick"])
                                ])
                              ]),
                              createBaseVNode("div", _hoisted_58, [
                                createBaseVNode("div", null, [
                                  _cache[60] || (_cache[60] = createBaseVNode(
                                    "label",
                                    { class: "text-xs opacity-60" },
                                    "Do Command",
                                    -1
                                    /* CACHED */
                                  )),
                                  createVNode(_component_n_input, {
                                    value: s.do,
                                    "onUpdate:value": ($event) => s.do = $event,
                                    type: "textarea",
                                    autosize: { minRows: 1, maxRows: 3 },
                                    class: "font-mono",
                                    placeholder: "Command to run when stream starts"
                                  }, null, 8, ["value", "onUpdate:value"])
                                ]),
                                createBaseVNode("div", null, [
                                  _cache[61] || (_cache[61] = createBaseVNode(
                                    "label",
                                    { class: "text-xs opacity-60" },
                                    "Undo Command",
                                    -1
                                    /* CACHED */
                                  )),
                                  createVNode(_component_n_input, {
                                    value: s.undo,
                                    "onUpdate:value": ($event) => s.undo = $event,
                                    type: "textarea",
                                    autosize: { minRows: 1, maxRows: 3 },
                                    class: "font-mono",
                                    placeholder: "Command to run when stream stops"
                                  }, null, 8, ["value", "onUpdate:value"])
                                ])
                              ])
                            ]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]))
                    ]),
                    _cache[62] || (_cache[62] = createBaseVNode(
                      "section",
                      { class: "sr-only" },
                      [
                        createCommentVNode(" hidden submit to allow Enter to save within fields "),
                        createBaseVNode("button", {
                          type: "submit",
                          tabindex: "-1",
                          "aria-hidden": "true"
                        })
                      ],
                      -1
                      /* CACHED */
                    ))
                  ], 40, _hoisted_11)
                ],
                512
                /* NEED_PATCH */
              ),
              createVNode(AppEditCoverModal, {
                visible: showCoverModal.value,
                "onUpdate:visible": _cache[42] || (_cache[42] = ($event) => showCoverModal.value = $event),
                "cover-searching": coverSearching.value,
                "cover-busy": coverBusy.value,
                "cover-candidates": coverCandidates.value,
                onPick: useCover
              }, null, 8, ["visible", "cover-searching", "cover-busy", "cover-candidates"]),
              createVNode(AppEditDeleteConfirmModal, {
                visible: showDeleteConfirm.value,
                "onUpdate:visible": _cache[43] || (_cache[43] = ($event) => showDeleteConfirm.value = $event),
                "is-playnite-auto": isPlayniteAuto.value,
                name: form.value.name || "",
                onCancel: _cache[44] || (_cache[44] = ($event) => showDeleteConfirm.value = false),
                onConfirm: del
              }, null, 8, ["visible", "is-playnite-auto", "name"])
            ]),
            _: 1
            /* STABLE */
          })
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show", "trap-focus"]);
    };
  }
});
const AppEditModal_vue_vue_type_style_index_0_scoped_c7cbd437_lang = "";
const AppEditModal = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c7cbd437"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/AppEditModal.vue"]]);
export {
  AppEditModal as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwRWRpdE1vZGFsLWQxMzFmYzE4LmpzIiwic291cmNlcyI6WyIuLi8uLi9jb21wb25lbnRzL2FwcC1lZGl0L2xvc3NsZXNzLnRzIiwiLi4vLi4vY29tcG9uZW50cy9hcHAtZWRpdC9BcHBFZGl0QmFzaWNzU2VjdGlvbi52dWUiLCIuLi8uLi9jb21wb25lbnRzL2FwcC1lZGl0L0FwcEVkaXRMb3NzbGVzc1NjYWxpbmdTZWN0aW9uLnZ1ZSIsIi4uLy4uL2NvbXBvbmVudHMvYXBwLWVkaXQvQXBwRWRpdFByZXBDb21tYW5kc1NlY3Rpb24udnVlIiwiLi4vLi4vY29tcG9uZW50cy9hcHAtZWRpdC9BcHBFZGl0RnJhbWVHZW5TZWN0aW9uLnZ1ZSIsIi4uLy4uL2NvbXBvbmVudHMvYXBwLWVkaXQvQXBwRWRpdENvdmVyTW9kYWwudnVlIiwiLi4vLi4vY29tcG9uZW50cy9hcHAtZWRpdC9BcHBFZGl0RGVsZXRlQ29uZmlybU1vZGFsLnZ1ZSIsIi4uLy4uL2NvbXBvbmVudHMvQXBwRWRpdE1vZGFsLnZ1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XHJcbiAgQW5pbWU0a1NpemUsXHJcbiAgRnJhbWVHZW5lcmF0aW9uTW9kZSxcclxuICBGcmFtZUdlbmVyYXRpb25Qcm92aWRlcixcclxuICBMb3NzbGVzc1Byb2ZpbGVEZWZhdWx0cyxcclxuICBMb3NzbGVzc1Byb2ZpbGVLZXksXHJcbiAgTG9zc2xlc3NQcm9maWxlT3ZlcnJpZGVzLFxyXG4gIExvc3NsZXNzU2NhbGluZ01vZGUsXHJcbn0gZnJvbSAnLi90eXBlcyc7XHJcblxyXG5leHBvcnQgY29uc3QgTE9TU0xFU1NfRkxPV19NSU4gPSAwO1xyXG5leHBvcnQgY29uc3QgTE9TU0xFU1NfRkxPV19NQVggPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBMT1NTTEVTU19SRVNPTFVUSU9OX01JTiA9IDEwO1xyXG5leHBvcnQgY29uc3QgTE9TU0xFU1NfUkVTT0xVVElPTl9NQVggPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBMT1NTTEVTU19TSEFSUE5FU1NfTUlOID0gMTtcclxuZXhwb3J0IGNvbnN0IExPU1NMRVNTX1NIQVJQTkVTU19NQVggPSAxMDtcclxuXHJcbmV4cG9ydCBjb25zdCBMT1NTTEVTU19TQ0FMSU5HX09QVElPTlM6IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IExvc3NsZXNzU2NhbGluZ01vZGUgfVtdID0gW1xyXG4gIHsgbGFiZWw6ICdPZmYnLCB2YWx1ZTogJ29mZicgfSxcclxuICB7IGxhYmVsOiAnTFMxJywgdmFsdWU6ICdsczEnIH0sXHJcbiAgeyBsYWJlbDogJ0ZTUiAxLjAnLCB2YWx1ZTogJ2ZzcicgfSxcclxuICB7IGxhYmVsOiAnTklTJywgdmFsdWU6ICduaXMnIH0sXHJcbiAgeyBsYWJlbDogJ1NHU1InLCB2YWx1ZTogJ3Nnc3InIH0sXHJcbiAgeyBsYWJlbDogJ0JDQVMgKEFuaW1lKScsIHZhbHVlOiAnYmNhcycgfSxcclxuICB7IGxhYmVsOiAnQW5pbWU0SycsIHZhbHVlOiAnYW5pbWU0aycgfSxcclxuICB7IGxhYmVsOiAneEJSJywgdmFsdWU6ICd4YnInIH0sXHJcbiAgeyBsYWJlbDogJ1NoYXJwIEJpbGluZWFyJywgdmFsdWU6ICdzaGFycC1iaWxpbmVhcicgfSxcclxuICB7IGxhYmVsOiAnSW50ZWdlciBTY2FsZScsIHZhbHVlOiAnaW50ZWdlcicgfSxcclxuICB7IGxhYmVsOiAnTmVhcmVzdCBOZWlnaGJvdXInLCB2YWx1ZTogJ25lYXJlc3QnIH0sXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgTE9TU0xFU1NfU0NBTElOR19TSEFSUEVOSU5HID0gbmV3IFNldDxMb3NzbGVzc1NjYWxpbmdNb2RlPihbXHJcbiAgJ2xzMScsXHJcbiAgJ2ZzcicsXHJcbiAgJ25pcycsXHJcbiAgJ3Nnc3InLFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBMT1NTTEVTU19BTklNRV9TSVpFUzogeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogQW5pbWU0a1NpemUgfVtdID0gW1xyXG4gIHsgbGFiZWw6ICdTbWFsbCcsIHZhbHVlOiAnUycgfSxcclxuICB7IGxhYmVsOiAnTWVkaXVtJywgdmFsdWU6ICdNJyB9LFxyXG4gIHsgbGFiZWw6ICdMYXJnZScsIHZhbHVlOiAnTCcgfSxcclxuICB7IGxhYmVsOiAnVmVyeSBMYXJnZScsIHZhbHVlOiAnVkwnIH0sXHJcbiAgeyBsYWJlbDogJ1VsdHJhIExhcmdlJywgdmFsdWU6ICdVTCcgfSxcclxuXTtcclxuXHJcbmV4cG9ydCBjb25zdCBGUkFNRV9HRU5FUkFUSU9OX1BST1ZJREVSUzogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogRnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIgfT4gPVxyXG4gIFtcclxuICAgIHsgbGFiZWw6ICdHYW1lIFByb3ZpZGVkJywgdmFsdWU6ICdnYW1lLXByb3ZpZGVkJyB9LFxyXG4gICAgeyBsYWJlbDogJ0xvc3NsZXNzIFNjYWxpbmcnLCB2YWx1ZTogJ2xvc3NsZXNzLXNjYWxpbmcnIH0sXHJcbiAgICB7IGxhYmVsOiAnTlZJRElBIFNtb290aCBNb3Rpb24nLCB2YWx1ZTogJ252aWRpYS1zbW9vdGgtbW90aW9uJyB9LFxyXG4gIF07XHJcblxyXG5leHBvcnQgY29uc3QgTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUUzogUmVjb3JkPExvc3NsZXNzUHJvZmlsZUtleSwgTG9zc2xlc3NQcm9maWxlRGVmYXVsdHM+ID0ge1xyXG4gIHJlY29tbWVuZGVkOiB7XHJcbiAgICBwZXJmb3JtYW5jZU1vZGU6IHRydWUsXHJcbiAgICBmbG93U2NhbGU6IDUwLFxyXG4gICAgcmVzb2x1dGlvblNjYWxlOiAxMDAsXHJcbiAgICBzY2FsaW5nTW9kZTogJ29mZicsXHJcbiAgICBzaGFycGVuaW5nOiA1LFxyXG4gICAgYW5pbWU0a1NpemU6ICdNJyxcclxuICAgIGFuaW1lNGtWcnM6IGZhbHNlLFxyXG4gIH0sXHJcbiAgY3VzdG9tOiB7XHJcbiAgICBwZXJmb3JtYW5jZU1vZGU6IGZhbHNlLFxyXG4gICAgZmxvd1NjYWxlOiA1MCxcclxuICAgIHJlc29sdXRpb25TY2FsZTogMTAwLFxyXG4gICAgc2NhbGluZ01vZGU6ICdvZmYnLFxyXG4gICAgc2hhcnBlbmluZzogNSxcclxuICAgIGFuaW1lNGtTaXplOiAnUycsXHJcbiAgICBhbmltZTRrVnJzOiBmYWxzZSxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVtcHR5TG9zc2xlc3NPdmVycmlkZXMoKTogTG9zc2xlc3NQcm9maWxlT3ZlcnJpZGVzIHtcclxuICByZXR1cm4ge1xyXG4gICAgcGVyZm9ybWFuY2VNb2RlOiBudWxsLFxyXG4gICAgZmxvd1NjYWxlOiBudWxsLFxyXG4gICAgcmVzb2x1dGlvblNjYWxlOiBudWxsLFxyXG4gICAgc2NhbGluZ01vZGU6IG51bGwsXHJcbiAgICBzaGFycGVuaW5nOiBudWxsLFxyXG4gICAgYW5pbWU0a1NpemU6IG51bGwsXHJcbiAgICBhbmltZTRrVnJzOiBudWxsLFxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbXB0eUxvc3NsZXNzUHJvZmlsZVN0YXRlKCk6IFJlY29yZDxMb3NzbGVzc1Byb2ZpbGVLZXksIExvc3NsZXNzUHJvZmlsZU92ZXJyaWRlcz4ge1xyXG4gIHJldHVybiB7XHJcbiAgICByZWNvbW1lbmRlZDogZW1wdHlMb3NzbGVzc092ZXJyaWRlcygpLFxyXG4gICAgY3VzdG9tOiBlbXB0eUxvc3NsZXNzT3ZlcnJpZGVzKCksXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUZyYW1lR2VuZXJhdGlvblByb3ZpZGVyKHZhbHVlOiB1bmtub3duKTogRnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICByZXR1cm4gJ2xvc3NsZXNzLXNjYWxpbmcnO1xyXG4gIH1cclxuICBjb25zdCBjb21wYWN0ID0gdmFsdWVcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAuc3BsaXQoJycpXHJcbiAgICAuZmlsdGVyKChjaCkgPT4gL1thLXowLTldLy50ZXN0KGNoKSlcclxuICAgIC5qb2luKCcnKTtcclxuICBpZiAoY29tcGFjdCA9PT0gJ252aWRpYXNtb290aG1vdGlvbicgfHwgY29tcGFjdCA9PT0gJ3Ntb290aG1vdGlvbicgfHwgY29tcGFjdCA9PT0gJ252aWRpYScpIHtcclxuICAgIHJldHVybiAnbnZpZGlhLXNtb290aC1tb3Rpb24nO1xyXG4gIH1cclxuICBpZiAoY29tcGFjdCA9PT0gJ2dhbWVwcm92aWRlZCcgfHwgY29tcGFjdCA9PT0gJ2dhbWUnKSB7XHJcbiAgICByZXR1cm4gJ2dhbWUtcHJvdmlkZWQnO1xyXG4gIH1cclxuICBpZiAoY29tcGFjdCA9PT0gJ2xvc3NsZXNzc2NhbGluZycgfHwgY29tcGFjdCA9PT0gJ2xvc3NsZXNzJykge1xyXG4gICAgcmV0dXJuICdsb3NzbGVzcy1zY2FsaW5nJztcclxuICB9XHJcbiAgcmV0dXJuICdsb3NzbGVzcy1zY2FsaW5nJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJhbWVHZW5lcmF0aW9uTW9kZSh2YWx1ZTogdW5rbm93bik6IEZyYW1lR2VuZXJhdGlvbk1vZGUgfCBudWxsIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGNvbnN0IGNvbXBhY3QgPSB2YWx1ZVxyXG4gICAgLnRvTG93ZXJDYXNlKClcclxuICAgIC5zcGxpdCgnJylcclxuICAgIC5maWx0ZXIoKGNoKSA9PiAvW2EtejAtOV0vLnRlc3QoY2gpKVxyXG4gICAgLmpvaW4oJycpO1xyXG4gIGlmIChjb21wYWN0ID09PSAnb2ZmJyB8fCBjb21wYWN0ID09PSAnbm9uZScpIHtcclxuICAgIHJldHVybiAnb2ZmJztcclxuICB9XHJcbiAgaWYgKGNvbXBhY3QgPT09ICdudmlkaWFzbW9vdGhtb3Rpb24nIHx8IGNvbXBhY3QgPT09ICdzbW9vdGhtb3Rpb24nIHx8IGNvbXBhY3QgPT09ICdudmlkaWEnKSB7XHJcbiAgICByZXR1cm4gJ252aWRpYS1zbW9vdGgtbW90aW9uJztcclxuICB9XHJcbiAgaWYgKGNvbXBhY3QgPT09ICdnYW1lcHJvdmlkZWQnIHx8IGNvbXBhY3QgPT09ICdnYW1lJykge1xyXG4gICAgcmV0dXJuICdnYW1lLXByb3ZpZGVkJztcclxuICB9XHJcbiAgaWYgKGNvbXBhY3QgPT09ICdsb3NzbGVzc3NjYWxpbmcnIHx8IGNvbXBhY3QgPT09ICdsb3NzbGVzcycpIHtcclxuICAgIHJldHVybiAnbG9zc2xlc3Mtc2NhbGluZyc7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VOdW1lcmljKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgY29uc3QgdHJpbW1lZCA9IHZhbHVlLnRyaW0oKTtcclxuICAgIGlmICh0cmltbWVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIodHJpbW1lZCk7XHJcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkpIHtcclxuICAgICAgcmV0dXJuIHBhcnNlZDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcEZsb3codmFsdWU6IG51bWJlciB8IG51bGwpOiBudW1iZXIgfCBudWxsIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIG51bGw7XHJcbiAgY29uc3Qgcm91bmRlZCA9IE1hdGgucm91bmQodmFsdWUpO1xyXG4gIHJldHVybiBNYXRoLm1pbihMT1NTTEVTU19GTE9XX01BWCwgTWF0aC5tYXgoTE9TU0xFU1NfRkxPV19NSU4sIHJvdW5kZWQpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wUmVzb2x1dGlvbih2YWx1ZTogbnVtYmVyIHwgbnVsbCk6IG51bWJlciB8IG51bGwge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCByb3VuZGVkID0gTWF0aC5yb3VuZCh2YWx1ZSk7XHJcbiAgcmV0dXJuIE1hdGgubWluKExPU1NMRVNTX1JFU09MVVRJT05fTUFYLCBNYXRoLm1heChMT1NTTEVTU19SRVNPTFVUSU9OX01JTiwgcm91bmRlZCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xhbXBTaGFycG5lc3ModmFsdWU6IG51bWJlciB8IG51bGwpOiBudW1iZXIgfCBudWxsIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIG51bGw7XHJcbiAgY29uc3Qgcm91bmRlZCA9IE1hdGgucm91bmQodmFsdWUpO1xyXG4gIHJldHVybiBNYXRoLm1pbihMT1NTTEVTU19TSEFSUE5FU1NfTUFYLCBNYXRoLm1heChMT1NTTEVTU19TSEFSUE5FU1NfTUlOLCByb3VuZGVkKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0UnRzc0Zyb21UYXJnZXQodGFyZ2V0OiBudW1iZXIgfCBudWxsKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNGaW5pdGUodGFyZ2V0KSB8fCB0YXJnZXQgPD0gMCkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHJldHVybiBNYXRoLm1pbigzNjAsIE1hdGgubWF4KDEsIE1hdGgucm91bmQodGFyZ2V0IC8gMikpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9zc2xlc3NQcm9maWxlS2V5KHZhbHVlOiB1bmtub3duKTogTG9zc2xlc3NQcm9maWxlS2V5IHtcclxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAobm9ybWFsaXplZCA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgcmV0dXJuICdjdXN0b20nO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vcm1hbGl6ZWQgPT09ICdyZWNvbW1lbmRlZCcpIHtcclxuICAgICAgcmV0dXJuICdyZWNvbW1lbmRlZCc7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAncmVjb21tZW5kZWQnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb3NzbGVzc092ZXJyaWRlcyhpbnB1dDogdW5rbm93bik6IExvc3NsZXNzUHJvZmlsZU92ZXJyaWRlcyB7XHJcbiAgY29uc3Qgb3ZlcnJpZGVzID0gZW1wdHlMb3NzbGVzc092ZXJyaWRlcygpO1xyXG4gIGlmICghaW5wdXQgfHwgdHlwZW9mIGlucHV0ICE9PSAnb2JqZWN0Jykge1xyXG4gICAgcmV0dXJuIG92ZXJyaWRlcztcclxuICB9XHJcbiAgY29uc3Qgc291cmNlID0gaW5wdXQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgaWYgKHR5cGVvZiBzb3VyY2VbJ3BlcmZvcm1hbmNlLW1vZGUnXSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICBvdmVycmlkZXMucGVyZm9ybWFuY2VNb2RlID0gc291cmNlWydwZXJmb3JtYW5jZS1tb2RlJ10gYXMgYm9vbGVhbjtcclxuICB9XHJcbiAgY29uc3QgcmF3RmxvdyA9IGNsYW1wRmxvdyhwYXJzZU51bWVyaWMoc291cmNlWydmbG93LXNjYWxlJ10pKTtcclxuICBpZiAocmF3RmxvdyAhPT0gbnVsbCkge1xyXG4gICAgb3ZlcnJpZGVzLmZsb3dTY2FsZSA9IHJhd0Zsb3c7XHJcbiAgfVxyXG4gIGNvbnN0IHJhd1Jlc29sdXRpb24gPSBjbGFtcFJlc29sdXRpb24ocGFyc2VOdW1lcmljKHNvdXJjZVsncmVzb2x1dGlvbi1zY2FsZSddKSk7XHJcbiAgaWYgKHJhd1Jlc29sdXRpb24gIT09IG51bGwpIHtcclxuICAgIG92ZXJyaWRlcy5yZXNvbHV0aW9uU2NhbGUgPSByYXdSZXNvbHV0aW9uO1xyXG4gIH1cclxuICBjb25zdCBtb2RlUmF3ID0gdHlwZW9mIHNvdXJjZVsnc2NhbGluZy10eXBlJ10gPT09ICdzdHJpbmcnID8gc291cmNlWydzY2FsaW5nLXR5cGUnXSA6IG51bGw7XHJcbiAgaWYgKG1vZGVSYXcpIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBtb2RlUmF3LnRvTG93ZXJDYXNlKCkgYXMgTG9zc2xlc3NTY2FsaW5nTW9kZTtcclxuICAgIGlmIChMT1NTTEVTU19TQ0FMSU5HX09QVElPTlMuc29tZSgobykgPT4gby52YWx1ZSA9PT0gbm9ybWFsaXplZCkpIHtcclxuICAgICAgb3ZlcnJpZGVzLnNjYWxpbmdNb2RlID0gbm9ybWFsaXplZDtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgcmF3U2hhcnBuZXNzID0gY2xhbXBTaGFycG5lc3MocGFyc2VOdW1lcmljKHNvdXJjZVsnc2hhcnBlbmluZyddKSk7XHJcbiAgaWYgKHJhd1NoYXJwbmVzcyAhPT0gbnVsbCkge1xyXG4gICAgb3ZlcnJpZGVzLnNoYXJwZW5pbmcgPSByYXdTaGFycG5lc3M7XHJcbiAgfVxyXG4gIGNvbnN0IGFuaW1lU2l6ZVJhdyA9XHJcbiAgICB0eXBlb2Ygc291cmNlWydhbmltZTRrLXNpemUnXSA9PT0gJ3N0cmluZycgPyBzb3VyY2VbJ2FuaW1lNGstc2l6ZSddLnRvVXBwZXJDYXNlKCkgOiBudWxsO1xyXG4gIGlmIChhbmltZVNpemVSYXcgJiYgTE9TU0xFU1NfQU5JTUVfU0laRVMuc29tZSgobykgPT4gby52YWx1ZSA9PT0gYW5pbWVTaXplUmF3KSkge1xyXG4gICAgb3ZlcnJpZGVzLmFuaW1lNGtTaXplID0gYW5pbWVTaXplUmF3IGFzIEFuaW1lNGtTaXplO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIHNvdXJjZVsnYW5pbWU0ay12cnMnXSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICBvdmVycmlkZXMuYW5pbWU0a1ZycyA9IHNvdXJjZVsnYW5pbWU0ay12cnMnXSBhcyBib29sZWFuO1xyXG4gIH1cclxuICByZXR1cm4gb3ZlcnJpZGVzO1xyXG59XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBnYXAtNFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMSBtZDpjb2wtc3Bhbi0yXCI+XHJcbiAgICAgIDxsYWJlbCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+TmFtZTwvbGFiZWw+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtYi0xXCI+XHJcbiAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibmFtZVNlbGVjdFZhbHVlXCJcclxuICAgICAgICAgIDpvcHRpb25zPVwibmFtZVNlbGVjdE9wdGlvbnNcIlxyXG4gICAgICAgICAgOmxvYWRpbmc9XCJnYW1lc0xvYWRpbmdcIlxyXG4gICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICA6cGxhY2Vob2xkZXI9XCInVHlwZSB0byBzZWFyY2ggb3IgZW50ZXIgYSBjdXN0b20gbmFtZSdcIlxyXG4gICAgICAgICAgY2xhc3M9XCJmbGV4LTFcIlxyXG4gICAgICAgICAgOmNsYXNzPVwibmFtZUVycm9yID8gJ3JpbmctMSByaW5nLWRhbmdlciByb3VuZGVkJyA6ICcnXCJcclxuICAgICAgICAgIDpmYWxsYmFjay1vcHRpb249XCJmYWxsYmFja09wdGlvblwiXHJcbiAgICAgICAgICBAZm9jdXM9XCJlbWl0KCduYW1lLWZvY3VzJylcIlxyXG4gICAgICAgICAgQGJsdXI9XCJlbWl0KCduYW1lLWJsdXInKVwiXHJcbiAgICAgICAgICBAc2VhcmNoPVwiKHEpID0+IGVtaXQoJ25hbWUtc2VhcmNoJywgcSlcIlxyXG4gICAgICAgICAgQHVwZGF0ZTp2YWx1ZT1cIih2YWwpID0+IGVtaXQoJ25hbWUtcGlja2VkJywgdmFsKVwiXHJcbiAgICAgICAgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxwIHYtaWY9XCJuYW1lRXJyb3JcIiBjbGFzcz1cInRleHQteHMgdGV4dC1kYW5nZXIgbGVhZGluZy1zbnVnXCIgcm9sZT1cImFsZXJ0XCIgYXJpYS1saXZlPVwicG9saXRlXCI+e3sgbmFtZUVycm9yIH19PC9wPlxyXG4gICAgICA8dGVtcGxhdGUgdi1pZj1cInNob3dQbGF5bml0ZVBpY2tlclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJzZWxlY3RlZFBsYXluaXRlSWRcIlxyXG4gICAgICAgICAgICA6b3B0aW9ucz1cInBsYXluaXRlT3B0aW9uc1wiXHJcbiAgICAgICAgICAgIDpsb2FkaW5nPVwiZ2FtZXNMb2FkaW5nXCJcclxuICAgICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgICA6ZGlzYWJsZWQ9XCJsb2NrUGxheW5pdGUgfHwgIXBsYXluaXRlSW5zdGFsbGVkXCJcclxuICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwiXHJcbiAgICAgICAgICAgICAgcGxheW5pdGVJbnN0YWxsZWQgPyAnU2VsZWN0IGEgUGxheW5pdGUgZ2FtZeKApicgOiAnUGxheW5pdGUgcGx1Z2luIG5vdCBkZXRlY3RlZCdcclxuICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJmbGV4LTFcIlxyXG4gICAgICAgICAgICBAZm9jdXM9XCJlbWl0KCdsb2FkLXBsYXluaXRlLWdhbWVzJylcIlxyXG4gICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwiKHZhbCkgPT4gZW1pdCgncGljay1wbGF5bml0ZScsIFN0cmluZyh2YWwgPz8gJycpKVwiXHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgIHYtaWY9XCJsb2NrUGxheW5pdGVcIlxyXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICB0eXBlPVwiZGVmYXVsdFwiXHJcbiAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICBAY2xpY2s9XCJlbWl0KCd1bmxvY2stcGxheW5pdGUnKVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIENoYW5nZVxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgIHt7IGlzUGxheW5pdGUgPyAnTGlua2VkIHRvIFBsYXluaXRlJyA6ICdDdXN0b20gYXBwbGljYXRpb24nIH19XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiIWlzUGxheW5pdGVcIiBjbGFzcz1cIm1kOmNvbC1zcGFuLTJcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTEgZ2FwLTQgbWQ6Z3JpZC1jb2xzLTJcIj5cclxuICAgICAgICA8c2VjdGlvblxyXG4gICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy1saWdodC84MCBkYXJrOmJnLWRhcmsvNDAgcC00IHNwYWNlLXktM1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPkNvbW1hbmQ8L2xhYmVsPlxyXG4gICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjbWRUZXh0XCJcclxuICAgICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vXCJcclxuICAgICAgICAgICAgICA6YXV0b3NpemU9XCJ7IG1pblJvd3M6IDQsIG1heFJvd3M6IDggfVwiXHJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFeGVjdXRhYmxlIGNvbW1hbmQgbGluZVwiXHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgIFZpYmVwb2xsbyB3YWl0cyBmb3IgdGhpcyBwcm9jZXNzLiBXaGVuIGl0IGNsb3NlcywgdGhlIHN0cmVhbSBlbmRzLlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICAgICAgPHNlY3Rpb25cclxuICAgICAgICAgIGNsYXNzPVwicm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctbGlnaHQvODAgZGFyazpiZy1kYXJrLzQwIHAtNCBzcGFjZS15LTNcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgRGV0YWNoZWQgQ29tbWFuZHNcclxuICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICBPcHRpb25hbCBjb21tYW5kcyB0aGF0IHJ1biBmaXJzdCBhbmQga2VlcCB0aGUgc3RyZWFtIGFsaXZlIHdoZW4gdGhleSBmaW5pc2guXHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJwcmltYXJ5XCIgQGNsaWNrPVwiYWRkRGV0YWNoZWRcIj5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtcGx1c1wiIDpzaXplPVwiMTRcIiAvPiBBZGRcclxuICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgdi1pZj1cImZvcm0uZGV0YWNoZWQubGVuZ3RoID09PSAwXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZGFzaGVkIGJvcmRlci1kYXJrLzE1IGRhcms6Ym9yZGVyLWxpZ2h0LzE1IHB4LTMgcHktNCB0ZXh0LXhzIHRleHQtY2VudGVyIG9wYWNpdHktNjBcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBObyBkZXRhY2hlZCBjb21tYW5kcyB5ZXQuIFVzZSBBZGQgdG8gc2V0IHVwIHByZXAgc2NyaXB0cyBvciBsYXVuY2hlcnMuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxvbCB2LWVsc2UgY2xhc3M9XCJzcGFjZS15LTNcIj5cclxuICAgICAgICAgICAgPGxpIHYtZm9yPVwiKHZhbHVlLCBpbmRleCkgaW4gZm9ybS5kZXRhY2hlZFwiIDprZXk9XCJpbmRleFwiPlxyXG4gICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctd2hpdGUvODAgZGFyazpiZy1zdXJmYWNlLzYwIHNoYWRvdy1zbVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPGhlYWRlclxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtMiBweC0zIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTBcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgRGV0YWNoZWQgQ29tbWFuZCAje3sgaW5kZXggKyAxIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgc2Vjb25kYXJ5IHR5cGU9XCJlcnJvclwiIEBjbGljaz1cInJlbW92ZURldGFjaGVkKGluZGV4KVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS10cmFzaFwiIDpzaXplPVwiMTRcIiAvPiBEZWxldGVcclxuICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtMyBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgICAgICA6dmFsdWU9XCJkZXRhY2hlZFZhbHVlKGluZGV4KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZTp2YWx1ZT1cIih2YWx1ZSkgPT4gc2V0RGV0YWNoZWRWYWx1ZShpbmRleCwgdmFsdWUpXCJcclxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vXCJcclxuICAgICAgICAgICAgICAgICAgICA6YXV0b3NpemU9XCJ7IG1pblJvd3M6IDIsIG1heFJvd3M6IDYgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDb21tYW5kIHRvIGV4ZWN1dGUgYmVmb3JlIHRoZSBzdHJlYW1cIlxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIFJ1bnMgYmVmb3JlIHRoZSBwcmltYXJ5IGNvbW1hbmQuIFZpYmVwb2xsbyBjb250aW51ZXMgZXZlbiBpZiB0aGlzIGNvbW1hbmQgZXhpdHMuXHJcbiAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgPC9vbD5cclxuICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiIWlzUGxheW5pdGVcIiBjbGFzcz1cInNwYWNlLXktMSBtZDpjb2wtc3Bhbi0xXCI+XHJcbiAgICAgIDxsYWJlbCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+V29ya2luZyBEaXI8L2xhYmVsPlxyXG4gICAgICA8bi1pbnB1dCB2LW1vZGVsOnZhbHVlPVwiZm9ybS53b3JraW5nRGlyXCIgY2xhc3M9XCJmb250LW1vbm9cIiBwbGFjZWhvbGRlcj1cIkM6L0dhbWVzL0FwcFwiIC8+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xIG1kOmNvbC1zcGFuLTFcIj5cclxuICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5FeGl0IFRpbWVvdXQ8L2xhYmVsPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICA8bi1pbnB1dC1udW1iZXIgdi1tb2RlbDp2YWx1ZT1cImZvcm0uZXhpdFRpbWVvdXRcIiA6bWluPVwiMFwiIGNsYXNzPVwidy0yOFwiIC8+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5zZWNvbmRzPC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgdi1pZj1cIiFpc1BsYXluaXRlXCIgY2xhc3M9XCJzcGFjZS15LTEgbWQ6Y29sLXNwYW4tMlwiPlxyXG4gICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPkltYWdlIFBhdGg8L2xhYmVsPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImZvcm0uaW1hZ2VQYXRoXCJcclxuICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vIGZsZXgtMVwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIi9wYXRoL3RvL2ltYWdlLnBuZ1wiXHJcbiAgICAgICAgLz5cclxuICAgICAgICA8bi1idXR0b24gdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgOmRpc2FibGVkPVwiIWZvcm0ubmFtZVwiIEBjbGljaz1cImVtaXQoJ29wZW4tY292ZXItZmluZGVyJylcIj5cclxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1pbWFnZVwiIDpzaXplPVwiMTRcIiAvPiBGaW5kIENvdmVyXHJcbiAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+T3B0aW9uYWw7IHN0b3JlZCBvbmx5IGFuZCBub3QgZmV0Y2hlZCBieSBWaWJlcG9sbG8uPC9wPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyB0b1JlZnMgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgdHlwZSB7IEFwcEZvcm0gfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHsgTlNlbGVjdCwgTkJ1dHRvbiwgTklucHV0LCBOSW5wdXROdW1iZXIsIE5DaGVja2JveCwgTlN3aXRjaCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuXHJcbmNvbnN0IHJhd1Byb3BzID0gZGVmaW5lUHJvcHM8e1xyXG4gIGlzUGxheW5pdGU6IGJvb2xlYW47XHJcbiAgc2hvd1BsYXluaXRlUGlja2VyOiBib29sZWFuO1xyXG4gIHBsYXluaXRlSW5zdGFsbGVkOiBib29sZWFuO1xyXG4gIG5hbWVTZWxlY3RPcHRpb25zOiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmc7IGRpc2FibGVkPzogYm9vbGVhbiB9PjtcclxuICBnYW1lc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgZmFsbGJhY2tPcHRpb246ICh2YWx1ZTogdW5rbm93bikgPT4geyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH07XHJcbiAgcGxheW5pdGVPcHRpb25zOiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfT47XHJcbiAgbG9ja1BsYXluaXRlOiBib29sZWFuO1xyXG4gIG5hbWVFcnJvcj86IHN0cmluZztcclxufT4oKTtcclxuY29uc3Qge1xyXG4gIGlzUGxheW5pdGUsXHJcbiAgc2hvd1BsYXluaXRlUGlja2VyLFxyXG4gIHBsYXluaXRlSW5zdGFsbGVkLFxyXG4gIG5hbWVTZWxlY3RPcHRpb25zLFxyXG4gIGdhbWVzTG9hZGluZyxcclxuICBmYWxsYmFja09wdGlvbixcclxuICBwbGF5bml0ZU9wdGlvbnMsXHJcbiAgbG9ja1BsYXluaXRlLFxyXG4gIG5hbWVFcnJvcixcclxufSA9IHRvUmVmcyhyYXdQcm9wcyk7XHJcblxyXG5jb25zdCBlbWl0ID0gZGVmaW5lRW1pdHM8e1xyXG4gIChlOiAnbmFtZS1mb2N1cycpOiB2b2lkO1xyXG4gIChlOiAnbmFtZS1ibHVyJyk6IHZvaWQ7XHJcbiAgKGU6ICduYW1lLXNlYXJjaCcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkO1xyXG4gIChlOiAnbmFtZS1waWNrZWQnLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCk6IHZvaWQ7XHJcbiAgKGU6ICdsb2FkLXBsYXluaXRlLWdhbWVzJyk6IHZvaWQ7XHJcbiAgKGU6ICdwaWNrLXBsYXluaXRlJywgaWQ6IHN0cmluZyk6IHZvaWQ7XHJcbiAgKGU6ICd1bmxvY2stcGxheW5pdGUnKTogdm9pZDtcclxuICAoZTogJ29wZW4tY292ZXItZmluZGVyJyk6IHZvaWQ7XHJcbn0+KCk7XHJcblxyXG4vLyBUd28td2F5IGJpbmRpbmdzXHJcbmNvbnN0IGZvcm0gPSBkZWZpbmVNb2RlbDxBcHBGb3JtPignZm9ybScsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XHJcbmNvbnN0IGNtZFRleHQgPSBkZWZpbmVNb2RlbDxzdHJpbmc+KCdjbWRUZXh0JywgeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3QgbmFtZVNlbGVjdFZhbHVlID0gZGVmaW5lTW9kZWw8c3RyaW5nPignbmFtZVNlbGVjdFZhbHVlJywgeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3Qgc2VsZWN0ZWRQbGF5bml0ZUlkID0gZGVmaW5lTW9kZWw8c3RyaW5nPignc2VsZWN0ZWRQbGF5bml0ZUlkJywgeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuXHJcbmZ1bmN0aW9uIGFkZERldGFjaGVkKCkge1xyXG4gIGZvcm0udmFsdWUuZGV0YWNoZWQucHVzaCgnJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZURldGFjaGVkKGluZGV4OiBudW1iZXIpIHtcclxuICBmb3JtLnZhbHVlLmRldGFjaGVkLnNwbGljZShpbmRleCwgMSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGFjaGVkVmFsdWUoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGZvcm0udmFsdWUuZGV0YWNoZWRbaW5kZXhdID8/ICcnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXREZXRhY2hlZFZhbHVlKGluZGV4OiBudW1iZXIsIHZhbHVlOiBzdHJpbmcpIHtcclxuICBmb3JtLnZhbHVlLmRldGFjaGVkW2luZGV4XSA9IHZhbHVlO1xyXG59XHJcbjwvc2NyaXB0PlxyXG4iLCI8dGVtcGxhdGU+XHJcbiAgPGRpdiBjbGFzcz1cIm10LTQgc3BhY2UteS00IHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIHAtMyBkYXJrOmJvcmRlci1saWdodC8xMFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICA8ZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgTG9zc2xlc3MgU2NhbGluZyBVcHNjYWxpbmdcclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgRW5hYmxlIExvc3NsZXNzIFNjYWxpbmcgd2hlbiB5b3Ugd2FudCBWaWJlcG9sbG8gdG8gbWFuYWdlIHVwc2NhbGluZyBiZWZvcmUgZW5jb2RpbmcuXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPG4tc3dpdGNoIHYtbW9kZWw6dmFsdWU9XCJmb3JtLmxvc3NsZXNzU2NhbGluZ0VuYWJsZWRcIiBzaXplPVwic21hbGxcIiAvPlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPG4tYWxlcnRcclxuICAgICAgdi1pZj1cImZvcm0ubG9zc2xlc3NTY2FsaW5nRW5hYmxlZCAmJiAhaXNQbGF5bml0ZU1hbmFnZWRcIlxyXG4gICAgICB0eXBlPVwid2FybmluZ1wiXHJcbiAgICAgIDpzaG93LWljb249XCJ0cnVlXCJcclxuICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgY2xhc3M9XCJ0ZXh0LXhzXCJcclxuICAgID5cclxuICAgICAgVGhpcyBhcHBsaWNhdGlvbiBpc24ndCBtYW5hZ2VkIGJ5IFBsYXluaXRlLiBWaWJlcG9sbG8gd2lsbCB0cnkgdG8gZ3Vlc3Mgd2hpY2ggZ2FtZSBleGVjdXRhYmxlXHJcbiAgICAgIGlzIHJ1bm5pbmcgYW5kIGFwcGx5IHRoZSBMb3NzbGVzcyBTY2FsaW5nIHByb2ZpbGUgYXV0b21hdGljYWxseSwgYnV0IHRoYXQgZGV0ZWN0aW9uIGlzXHJcbiAgICAgIGJlc3QtZWZmb3J0IGFuZCBtYXkgbm90IGFsd2F5cyBzdWNjZWVkLiBDb25maWd1cmUgUGxheW5pdGUgaW50ZWdyYXRpb24gZm9yIG1vcmUgcmVsaWFibGVcclxuICAgICAgcmVzdWx0cy5cclxuICAgIDwvbi1hbGVydD5cclxuICAgIDxuLWFsZXJ0XHJcbiAgICAgIHYtaWY9XCJcclxuICAgICAgICBmb3JtLmxvc3NsZXNzU2NhbGluZ0VuYWJsZWQgJiZcclxuICAgICAgICBsb3NzbGVzc0V4ZWN1dGFibGVDaGVja0NvbXBsZXRlICYmXHJcbiAgICAgICAgIWxvc3NsZXNzRXhlY3V0YWJsZURldGVjdGVkXHJcbiAgICAgIFwiXHJcbiAgICAgIHR5cGU9XCJlcnJvclwiXHJcbiAgICAgIDpzaG93LWljb249XCJ0cnVlXCJcclxuICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgY2xhc3M9XCJ0ZXh0LXhzXCJcclxuICAgID5cclxuICAgICAgTG9zc2xlc3MgU2NhbGluZyBleGVjdXRhYmxlIG5vdCBkZXRlY3RlZC4gQ29uZmlndXJlIHRoZSBleGVjdXRhYmxlIHBhdGggdW5kZXIgU2V0dGluZ3Mg4oaSXHJcbiAgICAgIENhcHR1cmUuXHJcbiAgICA8L24tYWxlcnQ+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiZm9ybS5sb3NzbGVzc1NjYWxpbmdFbmFibGVkXCIgY2xhc3M9XCJzcGFjZS15LTRcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ2FwLTMgbWQ6Z3JpZC1jb2xzLTJcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlByb2ZpbGU8L2xhYmVsPlxyXG4gICAgICAgICAgPG4tcmFkaW8tZ3JvdXAgdi1tb2RlbDp2YWx1ZT1cImZvcm0ubG9zc2xlc3NTY2FsaW5nUHJvZmlsZVwiPlxyXG4gICAgICAgICAgICA8bi1yYWRpbyB2YWx1ZT1cInJlY29tbWVuZGVkXCI+UmVjb21tZW5kZWQgKExvd2VzdCBMYXRlbmN5ICYgRnJhbWUgUGFjaW5nKTwvbi1yYWRpbz5cclxuICAgICAgICAgICAgPG4tcmFkaW8gdmFsdWU9XCJjdXN0b21cIj5DdXN0b206IFVzZSBteSBMb3NzbGVzcyBTY2FsaW5nIGRlZmF1bHQgcHJvZmlsZTwvbi1yYWRpbz5cclxuICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgIFJlY29tbWVuZGVkIGtlZXBzIFZpYmVwb2xsby10dW5lZCB2YWx1ZXMgZm9yIGNvbnNpc3RlbnQgbGF0ZW5jeSBhbmQgZnJhbWUgcGFjaW5nLiBDdXN0b21cclxuICAgICAgICAgICAgcnVucyB0aGUgcHJvZmlsZSB5b3UgbWFpbnRhaW4gaW5zaWRlIExvc3NsZXNzIFNjYWxpbmcuXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtZW5kIGp1c3RpZnktZW5kXCI+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgdGVydGlhcnlcclxuICAgICAgICAgICAgOmRpc2FibGVkPVwiIWhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzXCJcclxuICAgICAgICAgICAgQGNsaWNrPVwicmVzZXRBY3RpdmVMb3NzbGVzc1Byb2ZpbGVcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBSZXNldCB0byBQcm9maWxlIERlZmF1bHRzXHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTMgcC0zIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIGJnLXByaW1hcnkvNVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWluZm8tY2lyY2xlXCIgOnNpemU9XCIxNFwiIGNsYXNzPVwidGV4dC1wcmltYXJ5XCIgLz5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGRcIj5Ib3cgTG9zc2xlc3MgU2NhbGluZyBXb3JrczwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICBMb3NzbGVzcyBTY2FsaW5nIDxzdHJvbmc+ZG93bnNjYWxlczwvc3Ryb25nPiB0aGUgZ2FtZSB1c2luZyB0aGUgcmVzb2x1dGlvbiBzY2FsZSwgdGhlblxyXG4gICAgICAgICAgPHN0cm9uZz51cHNjYWxlczwvc3Ryb25nPiBiYWNrIHRvIHRoZSBvcmlnaW5hbCByZXNvbHV0aW9uIHVzaW5nIHRoZSBzZWxlY3RlZCBmaWx0ZXIuIFRoaXNcclxuICAgICAgICAgIGNhbiBpbXByb3ZlIHBlcmZvcm1hbmNlIGJ1dCBtYXkgcmVkdWNlIHZpc3VhbCBxdWFsaXR5LlxyXG4gICAgICAgIDwvcD5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBnYXAtMyBtZDpncmlkLWNvbHMtMlwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgIFVwc2NhbGluZyBGaWx0ZXJcclxuICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImxvc3NsZXNzU2NhbGluZ01vZGVNb2RlbFwiXHJcbiAgICAgICAgICAgIDpvcHRpb25zPVwiTE9TU0xFU1NfU0NBTElOR19PUFRJT05TXCJcclxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgOmNsZWFyYWJsZT1cImZhbHNlXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICBGaWx0ZXIgdXNlZCBhZnRlciBkb3duc2NhbGluZy4gXCJPZmZcIiBkaXNhYmxlcyBzY2FsaW5nIGVudGlyZWx5LlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IHYtaWY9XCJzaG93TG9zc2xlc3NSZXNvbHV0aW9uXCIgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICBSZXNvbHV0aW9uIFNjYWxlXHJcbiAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxuLXJhZGlvLWdyb3VwXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInJlc29sdXRpb25JbnB1dE1vZGVcIlxyXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJ0ZXh0LXhzXCJcclxuICAgICAgICAgICAgICBidXR0b24tc3R5bGU9XCJzb2xpZFwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8bi1yYWRpby1idXR0b24gdmFsdWU9XCJmYWN0b3JcIj5TY2FsZSBGYWN0b3I8L24tcmFkaW8tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvLWJ1dHRvbiB2YWx1ZT1cInBlcmNlbnRcIj5QZXJjZW50PC9uLXJhZGlvLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC9uLXJhZGlvLWdyb3VwPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJyZXNvbHV0aW9uSW5wdXRNb2RlID09PSAnZmFjdG9yJ1wiIGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJyZXNvbHV0aW9uRmFjdG9yTW9kZWxcIlxyXG4gICAgICAgICAgICAgIDptaW49XCIxXCJcclxuICAgICAgICAgICAgICA6bWF4PVwiMTBcIlxyXG4gICAgICAgICAgICAgIDpzdGVwPVwiMC4wNVwiXHJcbiAgICAgICAgICAgICAgOnByZWNpc2lvbj1cIjJcIlxyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMS4wMFwiXHJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInJlc29sdXRpb25QZXJjZW50TW9kZWxcIlxyXG4gICAgICAgICAgICAgIDptaW49XCJMT1NTTEVTU19SRVNPTFVUSU9OX01JTlwiXHJcbiAgICAgICAgICAgICAgOm1heD1cIkxPU1NMRVNTX1JFU09MVVRJT05fTUFYXCJcclxuICAgICAgICAgICAgICA6c3RlcD1cIjVcIlxyXG4gICAgICAgICAgICAgIDpwcmVjaXNpb249XCIwXCJcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjEwMFwiXHJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICB7eyByZXNvbHV0aW9uUGVyY2VudERpc3BsYXkgfX0lIOKAoiB7eyByZXNvbHV0aW9uRmFjdG9yRGlzcGxheSB9fXhcclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxuLWFsZXJ0XHJcbiAgICAgICAgdi1pZj1cImxvc3NsZXNzU2NhbGluZ01vZGVNb2RlbCAhPT0gJ29mZidcIlxyXG4gICAgICAgIHR5cGU9XCJ3YXJuaW5nXCJcclxuICAgICAgICA6c2hvdy1pY29uPVwidHJ1ZVwiXHJcbiAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICBjbGFzcz1cInRleHQteHNcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPHN0cm9uZz5QZXJmb3JtYW5jZSBOb3RlOjwvc3Ryb25nPiBPbmx5IHVzZSB1cHNjYWxpbmcgaWYgdGhlIGdhbWUgbGFja3MgbmF0aXZlIEZTUi9ETFNTXHJcbiAgICAgICAgc3VwcG9ydC5cclxuICAgICAgPC9uLWFsZXJ0PlxyXG5cclxuICAgICAgPGRpdiB2LWlmPVwic2hvd0xvc3NsZXNzU2hhcnBlbmluZ1wiIGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgIFNoYXJwZW5pbmcgKDEtMTApXHJcbiAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICA8bi1pbnB1dC1udW1iZXJcclxuICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJsb3NzbGVzc1NoYXJwZW5pbmdNb2RlbFwiXHJcbiAgICAgICAgICA6bWluPVwiTE9TU0xFU1NfU0hBUlBORVNTX01JTlwiXHJcbiAgICAgICAgICA6bWF4PVwiTE9TU0xFU1NfU0hBUlBORVNTX01BWFwiXHJcbiAgICAgICAgICA6c3RlcD1cIjFcIlxyXG4gICAgICAgICAgOnByZWNpc2lvbj1cIjBcIlxyXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAvPlxyXG4gICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICBQb3N0LXVwc2NhbGluZyBzaGFycG5lc3MgZm9yIHt7IGxvc3NsZXNzU2NhbGluZ01vZGVNb2RlbC50b1VwcGVyQ2FzZSgpIH19IGZpbHRlci5cclxuICAgICAgICA8L3A+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiB2LWlmPVwic2hvd0xvc3NsZXNzQW5pbWVPcHRpb25zXCIgY2xhc3M9XCJncmlkIGdhcC0zIG1kOmdyaWQtY29scy0yXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgQW5pbWU0SyBTaXplXHJcbiAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJsb3NzbGVzc0FuaW1lU2l6ZU1vZGVsXCJcclxuICAgICAgICAgICAgOm9wdGlvbnM9XCJMT1NTTEVTU19BTklNRV9TSVpFU1wiXHJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgIDpjbGVhcmFibGU9XCJmYWxzZVwiXHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXZcclxuICAgICAgICAgIGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIHB4LTMgcHktMiBkYXJrOmJvcmRlci1saWdodC8xMFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+VlJTPC9kaXY+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+RW5hYmxlIFZhcmlhYmxlIFJhdGUgU2hhZGluZyB3aGVyZSBzdXBwb3J0ZWQuPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8bi1zd2l0Y2ggdi1tb2RlbDp2YWx1ZT1cImxvc3NsZXNzQW5pbWVWcnNNb2RlbFwiIHNpemU9XCJzbWFsbFwiIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdlxyXG4gICAgICB2LWlmPVwiZm9ybS5sb3NzbGVzc1NjYWxpbmdFbmFibGVkXCJcclxuICAgICAgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTMgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgcHgtMyBweS0yIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCJcclxuICAgID5cclxuICAgICAgPGRpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5QZXJmb3JtYW5jZSBNb2RlPC9kaXY+XHJcbiAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5SZWR1Y2VzIEdQVSB1c2FnZSB3aXRoIG1pbmltYWwgcXVhbGl0eSBpbXBhY3QuPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPG4tc3dpdGNoIHYtbW9kZWw6dmFsdWU9XCJsb3NzbGVzc1BlcmZvcm1hbmNlTW9kZU1vZGVsXCIgc2l6ZT1cInNtYWxsXCIgLz5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXZcclxuICAgICAgdi1pZj1cInNob3dMb3NzbGVzc0xhdW5jaFNldHRpbmdzXCJcclxuICAgICAgY2xhc3M9XCJzcGFjZS15LTMgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgcHgtMyBweS0yIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCJcclxuICAgID5cclxuICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+QWR2YW5jZWQgTGF1bmNoPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgTG9zc2xlc3MgTGF1bmNoIERlbGF5IChzZWNvbmRzKVxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiZm9ybS5sb3NzbGVzc1NjYWxpbmdMYXVuY2hEZWxheVwiXHJcbiAgICAgICAgICA6bWluPVwiMFwiXHJcbiAgICAgICAgICA6bWF4PVwiNjAwXCJcclxuICAgICAgICAgIDpzdGVwPVwiMVwiXHJcbiAgICAgICAgICA6cHJlY2lzaW9uPVwiMFwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIjhcIlxyXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAvPlxyXG4gICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICBXYWl0IGFkZGl0aW9uYWwgc2Vjb25kcyBhZnRlciB0aGUgZ2FtZSBzdGFydHMgYmVmb3JlIG9wZW5pbmcgTG9zc2xlc3MgU2NhbGluZy5cclxuICAgICAgICAgIExlYXZlIGJsYW5rIHRvIHVzZSB0aGUgZGVmYXVsdCA4LXNlY29uZCBkZWxheS5cclxuICAgICAgICA8L3A+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyBjb21wdXRlZCwgcmVmLCB0b1JlZiB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB0eXBlIHsgQW5pbWU0a1NpemUsIEFwcEZvcm0sIExvc3NsZXNzU2NhbGluZ01vZGUgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHtcclxuICBMT1NTTEVTU19BTklNRV9TSVpFUyxcclxuICBMT1NTTEVTU19SRVNPTFVUSU9OX01BWCxcclxuICBMT1NTTEVTU19SRVNPTFVUSU9OX01JTixcclxuICBMT1NTTEVTU19TQ0FMSU5HX09QVElPTlMsXHJcbiAgTE9TU0xFU1NfU0hBUlBORVNTX01BWCxcclxuICBMT1NTTEVTU19TSEFSUE5FU1NfTUlOLFxyXG4gIGNsYW1wUmVzb2x1dGlvbixcclxufSBmcm9tICcuL2xvc3NsZXNzJztcclxuaW1wb3J0IHtcclxuICBOQWxlcnQsXHJcbiAgTkJ1dHRvbixcclxuICBOSW5wdXROdW1iZXIsXHJcbiAgTlJhZGlvLFxyXG4gIE5SYWRpb0J1dHRvbixcclxuICBOUmFkaW9Hcm91cCxcclxuICBOU2VsZWN0LFxyXG4gIE5Td2l0Y2gsXHJcbn0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5cclxuY29uc3QgZm9ybSA9IGRlZmluZU1vZGVsPEFwcEZvcm0+KCdmb3JtJywgeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3QgbG9zc2xlc3NQZXJmb3JtYW5jZU1vZGVNb2RlbCA9IGRlZmluZU1vZGVsPGJvb2xlYW4+KCdsb3NzbGVzc1BlcmZvcm1hbmNlTW9kZScsIHtcclxuICByZXF1aXJlZDogdHJ1ZSxcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzUmVzb2x1dGlvblNjYWxlTW9kZWwgPSBkZWZpbmVNb2RlbDxudW1iZXIgfCBudWxsPignbG9zc2xlc3NSZXNvbHV0aW9uU2NhbGUnLCB7XHJcbiAgcmVxdWlyZWQ6IHRydWUsXHJcbn0pO1xyXG5jb25zdCBsb3NzbGVzc1NjYWxpbmdNb2RlTW9kZWwgPSBkZWZpbmVNb2RlbDxMb3NzbGVzc1NjYWxpbmdNb2RlPignbG9zc2xlc3NTY2FsaW5nTW9kZScsIHtcclxuICByZXF1aXJlZDogdHJ1ZSxcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzU2hhcnBlbmluZ01vZGVsID0gZGVmaW5lTW9kZWw8bnVtYmVyPignbG9zc2xlc3NTaGFycGVuaW5nJywgeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3QgbG9zc2xlc3NBbmltZVNpemVNb2RlbCA9IGRlZmluZU1vZGVsPEFuaW1lNGtTaXplPignbG9zc2xlc3NBbmltZVNpemUnLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xyXG5jb25zdCBsb3NzbGVzc0FuaW1lVnJzTW9kZWwgPSBkZWZpbmVNb2RlbDxib29sZWFuPignbG9zc2xlc3NBbmltZVZycycsIHsgcmVxdWlyZWQ6IHRydWUgfSk7XHJcblxyXG5jb25zdCBwcm9wcyA9IGRlZmluZVByb3BzPHtcclxuICBpc1BsYXluaXRlTWFuYWdlZDogYm9vbGVhbjtcclxuICBzaG93TG9zc2xlc3NSZXNvbHV0aW9uOiBib29sZWFuO1xyXG4gIHNob3dMb3NzbGVzc1NoYXJwZW5pbmc6IGJvb2xlYW47XHJcbiAgc2hvd0xvc3NsZXNzQW5pbWVPcHRpb25zOiBib29sZWFuO1xyXG4gIGhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzOiBib29sZWFuO1xyXG4gIGxvc3NsZXNzRXhlY3V0YWJsZURldGVjdGVkOiBib29sZWFuO1xyXG4gIGxvc3NsZXNzRXhlY3V0YWJsZUNoZWNrQ29tcGxldGU6IGJvb2xlYW47XHJcbiAgcmVzZXRBY3RpdmVMb3NzbGVzc1Byb2ZpbGU6ICgpID0+IHZvaWQ7XHJcbn0+KCk7XHJcblxyXG5jb25zdCBpc1BsYXluaXRlTWFuYWdlZCA9IHRvUmVmKHByb3BzLCAnaXNQbGF5bml0ZU1hbmFnZWQnKTtcclxuY29uc3Qgc2hvd0xvc3NsZXNzUmVzb2x1dGlvbiA9IHRvUmVmKHByb3BzLCAnc2hvd0xvc3NsZXNzUmVzb2x1dGlvbicpO1xyXG5jb25zdCBzaG93TG9zc2xlc3NTaGFycGVuaW5nID0gdG9SZWYocHJvcHMsICdzaG93TG9zc2xlc3NTaGFycGVuaW5nJyk7XHJcbmNvbnN0IHNob3dMb3NzbGVzc0FuaW1lT3B0aW9ucyA9IHRvUmVmKHByb3BzLCAnc2hvd0xvc3NsZXNzQW5pbWVPcHRpb25zJyk7XHJcbmNvbnN0IGhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzID0gdG9SZWYocHJvcHMsICdoYXNBY3RpdmVMb3NzbGVzc092ZXJyaWRlcycpO1xyXG5jb25zdCBsb3NzbGVzc0V4ZWN1dGFibGVEZXRlY3RlZCA9IHRvUmVmKHByb3BzLCAnbG9zc2xlc3NFeGVjdXRhYmxlRGV0ZWN0ZWQnKTtcclxuY29uc3QgbG9zc2xlc3NFeGVjdXRhYmxlQ2hlY2tDb21wbGV0ZSA9IHRvUmVmKHByb3BzLCAnbG9zc2xlc3NFeGVjdXRhYmxlQ2hlY2tDb21wbGV0ZScpO1xyXG5jb25zdCByZXNldEFjdGl2ZUxvc3NsZXNzUHJvZmlsZSA9IHByb3BzLnJlc2V0QWN0aXZlTG9zc2xlc3NQcm9maWxlO1xyXG5cclxuY29uc3QgcmVzb2x1dGlvbklucHV0TW9kZSA9IHJlZjwnZmFjdG9yJyB8ICdwZXJjZW50Jz4oJ2ZhY3RvcicpO1xyXG5cclxuY29uc3QgcmVzb2x1dGlvblBlcmNlbnRNb2RlbCA9IGNvbXB1dGVkPG51bWJlcj4oe1xyXG4gIGdldDogKCkgPT4ge1xyXG4gICAgY29uc3QgcmF3ID0gbG9zc2xlc3NSZXNvbHV0aW9uU2NhbGVNb2RlbC52YWx1ZTtcclxuICAgIGlmICh0eXBlb2YgcmF3ID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUocmF3KSkge1xyXG4gICAgICByZXR1cm4gcmF3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDEwMDtcclxuICB9LFxyXG4gIHNldDogKHZhbHVlKSA9PiB7XHJcbiAgICBjb25zdCBjbGFtcGVkID0gY2xhbXBSZXNvbHV0aW9uKHZhbHVlKTtcclxuICAgIGxvc3NsZXNzUmVzb2x1dGlvblNjYWxlTW9kZWwudmFsdWUgPSBjbGFtcGVkID8/IExPU1NMRVNTX1JFU09MVVRJT05fTUFYO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgcmVzb2x1dGlvbkZhY3Rvck1vZGVsID0gY29tcHV0ZWQ8bnVtYmVyPih7XHJcbiAgZ2V0OiAoKSA9PiB7XHJcbiAgICBjb25zdCBwZXJjZW50ID0gcmVzb2x1dGlvblBlcmNlbnRNb2RlbC52YWx1ZTtcclxuICAgIGlmICghcGVyY2VudCB8fCBwZXJjZW50IDw9IDApIHJldHVybiAxO1xyXG4gICAgcmV0dXJuIE51bWJlcigoMTAwIC8gcGVyY2VudCkudG9GaXhlZCgyKSk7XHJcbiAgfSxcclxuICBzZXQ6IChmYWN0b3IpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBNYXRoLm1pbigxMCwgTWF0aC5tYXgoMSwgZmFjdG9yIHx8IDEpKTtcclxuICAgIGNvbnN0IGN1cnJlbnRQZXJjZW50ID0gcmVzb2x1dGlvblBlcmNlbnRNb2RlbC52YWx1ZTtcclxuICAgIGNvbnN0IGN1cnJlbnRGYWN0b3IgPSBOdW1iZXIoKDEwMCAvIGN1cnJlbnRQZXJjZW50KS50b0ZpeGVkKDIpKTtcclxuICAgIGNvbnN0IGJhc2VQZXJjZW50ID0gMTAwIC8gbm9ybWFsaXplZDtcclxuICAgIGNvbnN0IGNsYW1wVG9SYW5nZSA9ICh2YWx1ZTogbnVtYmVyKSA9PlxyXG4gICAgICBNYXRoLm1heChMT1NTTEVTU19SRVNPTFVUSU9OX01JTiwgTWF0aC5taW4oTE9TU0xFU1NfUkVTT0xVVElPTl9NQVgsIHZhbHVlKSk7XHJcbiAgICBjb25zdCBzbmFwRG93biA9ICh2YWx1ZTogbnVtYmVyKSA9PiBjbGFtcFRvUmFuZ2UoTWF0aC5mbG9vcih2YWx1ZSAvIDUpICogNSk7XHJcbiAgICBjb25zdCBzbmFwVXAgPSAodmFsdWU6IG51bWJlcikgPT4gY2xhbXBUb1JhbmdlKE1hdGguY2VpbCh2YWx1ZSAvIDUpICogNSk7XHJcbiAgICBjb25zdCBzbmFwTmVhcmVzdCA9ICh2YWx1ZTogbnVtYmVyKSA9PiBjbGFtcFRvUmFuZ2UoTWF0aC5yb3VuZCh2YWx1ZSAvIDUpICogNSk7XHJcbiAgICBjb25zdCBFUFNJTE9OID0gMWUtMztcclxuXHJcbiAgICBsZXQgbmV4dFBlcmNlbnQ6IG51bWJlcjtcclxuXHJcbiAgICBpZiAobm9ybWFsaXplZCA+IGN1cnJlbnRGYWN0b3IgKyBFUFNJTE9OKSB7XHJcbiAgICAgIG5leHRQZXJjZW50ID0gc25hcERvd24oYmFzZVBlcmNlbnQpO1xyXG4gICAgfSBlbHNlIGlmIChub3JtYWxpemVkIDwgY3VycmVudEZhY3RvciAtIEVQU0lMT04pIHtcclxuICAgICAgbmV4dFBlcmNlbnQgPSBzbmFwVXAoYmFzZVBlcmNlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV4dFBlcmNlbnQgPSBzbmFwTmVhcmVzdChiYXNlUGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5leHRQZXJjZW50ID09PSBjdXJyZW50UGVyY2VudCkge1xyXG4gICAgICBpZiAobm9ybWFsaXplZCA+IGN1cnJlbnRGYWN0b3IgKyBFUFNJTE9OICYmIGN1cnJlbnRQZXJjZW50ID4gTE9TU0xFU1NfUkVTT0xVVElPTl9NSU4pIHtcclxuICAgICAgICBuZXh0UGVyY2VudCA9IGNsYW1wVG9SYW5nZShjdXJyZW50UGVyY2VudCAtIDUpO1xyXG4gICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWQgPCBjdXJyZW50RmFjdG9yIC0gRVBTSUxPTiAmJiBjdXJyZW50UGVyY2VudCA8IExPU1NMRVNTX1JFU09MVVRJT05fTUFYKSB7XHJcbiAgICAgICAgbmV4dFBlcmNlbnQgPSBjbGFtcFRvUmFuZ2UoY3VycmVudFBlcmNlbnQgKyA1KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc29sdXRpb25QZXJjZW50TW9kZWwudmFsdWUgPSBuZXh0UGVyY2VudDtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IHJlc29sdXRpb25QZXJjZW50RGlzcGxheSA9IGNvbXB1dGVkKCgpID0+IHJlc29sdXRpb25QZXJjZW50TW9kZWwudmFsdWUudG9GaXhlZCgwKSk7XHJcbmNvbnN0IHJlc29sdXRpb25GYWN0b3JEaXNwbGF5ID0gY29tcHV0ZWQoKCkgPT4gcmVzb2x1dGlvbkZhY3Rvck1vZGVsLnZhbHVlLnRvRml4ZWQoMikpO1xyXG5jb25zdCBzaG93TG9zc2xlc3NMYXVuY2hTZXR0aW5ncyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nRW5hYmxlZCB8fCBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJyxcclxuKTtcclxuPC9zY3JpcHQ+XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8c2VjdGlvbiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgb3BhY2l0eS03MFwiPlByZXAgQ29tbWFuZHM8L2gzPlxyXG4gICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdHlwZT1cInByaW1hcnlcIiBAY2xpY2s9XCJlbWl0KCdhZGQtcHJlcCcpXCI+XHJcbiAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdXNcIiA6c2l6ZT1cIjE0XCIgLz4gQWRkXHJcbiAgICAgIDwvbi1idXR0b24+XHJcbiAgICA8L2Rpdj5cclxuICAgIDxkaXYgdi1pZj1cImZvcm0ucHJlcENtZC5sZW5ndGggPT09IDBcIiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPk5vbmU8L2Rpdj5cclxuICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICB2LWZvcj1cIihwLCBpKSBpbiBmb3JtLnByZXBDbWRcIlxyXG4gICAgICAgIDprZXk9XCJpXCJcclxuICAgICAgICBjbGFzcz1cInJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHAtMlwiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yIG1iLTJcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj5TdGVwIHt7IGkgKyAxIH19PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgPG4tY2hlY2tib3ggdi1pZj1cImlzV2luZG93c1wiIHYtbW9kZWw6Y2hlY2tlZD1cInAuZWxldmF0ZWRcIiBzaXplPVwic21hbGxcIj5cclxuICAgICAgICAgICAgICB7eyAkdCgnX2NvbW1vbi5lbGV2YXRlZCcpIH19XHJcbiAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJlcnJvclwiIHN0cm9uZyBAY2xpY2s9XCJyZW1vdmUoaSlcIj5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdHJhc2hcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0xIGdhcC0yXCI+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj57eyAkdCgnX2NvbW1vbi5kb19jbWQnKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInAuZG9cIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0YXJlYVwiXHJcbiAgICAgICAgICAgICAgOmF1dG9zaXplPVwieyBtaW5Sb3dzOiAxLCBtYXhSb3dzOiAzIH1cIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vXCJcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNvbW1hbmQgdG8gcnVuIGJlZm9yZSBzdGFydFwiXHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPnt7ICR0KCdfY29tbW9uLnVuZG9fY21kJykgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJwLnVuZG9cIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0YXJlYVwiXHJcbiAgICAgICAgICAgICAgOmF1dG9zaXplPVwieyBtaW5Sb3dzOiAxLCBtYXhSb3dzOiAzIH1cIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vXCJcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNvbW1hbmQgdG8gcnVuIG9uIHN0b3BcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9zZWN0aW9uPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgTkJ1dHRvbiwgTkNoZWNrYm94LCBOSW5wdXQgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB0eXBlIHsgQXBwRm9ybSB9IGZyb20gJy4vdHlwZXMnO1xyXG5cclxuY29uc3QgeyB0OiAkdCB9ID0gdXNlSTE4bigpO1xyXG5jb25zdCBmb3JtID0gZGVmaW5lTW9kZWw8QXBwRm9ybT4oJ2Zvcm0nLCB7IHJlcXVpcmVkOiB0cnVlIH0pO1xyXG5cclxuY29uc3QgcHJvcHMgPSBkZWZpbmVQcm9wczx7XHJcbiAgaXNXaW5kb3dzOiBib29sZWFuO1xyXG59PigpO1xyXG5cclxuY29uc3QgZW1pdCA9IGRlZmluZUVtaXRzPHtcclxuICAoZTogJ2FkZC1wcmVwJyk6IHZvaWQ7XHJcbn0+KCk7XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoaW5kZXg6IG51bWJlcikge1xyXG4gIGZvcm0udmFsdWUucHJlcENtZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG59XHJcblxyXG5jb25zdCBpc1dpbmRvd3MgPSBwcm9wcy5pc1dpbmRvd3M7XHJcbjwvc2NyaXB0PlxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyBjb21wdXRlZCwgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7XHJcbiAgTkJ1dHRvbixcclxuICBOU3dpdGNoLFxyXG4gIE5BbGVydCxcclxuICBOVGFnLFxyXG4gIE5TZWxlY3QsXHJcbiAgTklucHV0TnVtYmVyLFxyXG4gIE5SYWRpb0dyb3VwLFxyXG4gIE5SYWRpbyxcclxufSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB0eXBlIHtcclxuICBGcmFtZUdlbkhlYWx0aCxcclxuICBGcmFtZUdlblJlcXVpcmVtZW50U3RhdHVzLFxyXG4gIEZyYW1lR2VuZXJhdGlvbk1vZGUsXHJcbiAgTG9zc2xlc3NQcm9maWxlS2V5LFxyXG59IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBGUkFNRV9HRU5FUkFUSU9OX1BST1ZJREVSUywgTE9TU0xFU1NfRkxPV19NSU4sIExPU1NMRVNTX0ZMT1dfTUFYIH0gZnJvbSAnLi9sb3NzbGVzcyc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5cclxuY29uc3QgbW9kZU1vZGVsID0gZGVmaW5lTW9kZWw8RnJhbWVHZW5lcmF0aW9uTW9kZT4oJ21vZGUnLCB7IGRlZmF1bHQ6ICdvZmYnIH0pO1xyXG5jb25zdCBnZW4xTW9kZWwgPSBkZWZpbmVNb2RlbDxib29sZWFuPignZ2VuMScsIHsgZGVmYXVsdDogZmFsc2UgfSk7XHJcbmNvbnN0IGdlbjJNb2RlbCA9IGRlZmluZU1vZGVsPGJvb2xlYW4+KCdnZW4yJywgeyBkZWZhdWx0OiBmYWxzZSB9KTtcclxuY29uc3QgbG9zc2xlc3NQcm9maWxlTW9kZWwgPSBkZWZpbmVNb2RlbDxMb3NzbGVzc1Byb2ZpbGVLZXk+KCdsb3NzbGVzc1Byb2ZpbGUnLCB7XHJcbiAgZGVmYXVsdDogJ3JlY29tbWVuZGVkJyxcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzVGFyZ2V0TW9kZWwgPSBkZWZpbmVNb2RlbDxudW1iZXIgfCBudWxsPignbG9zc2xlc3NUYXJnZXRGcHMnLCB7IGRlZmF1bHQ6IG51bGwgfSk7XHJcbmNvbnN0IGxvc3NsZXNzUnRzc01vZGVsID0gZGVmaW5lTW9kZWw8bnVtYmVyIHwgbnVsbD4oJ2xvc3NsZXNzUnRzc0xpbWl0JywgeyBkZWZhdWx0OiBudWxsIH0pO1xyXG5jb25zdCBsb3NzbGVzc0Zsb3dNb2RlbCA9IGRlZmluZU1vZGVsPG51bWJlciB8IG51bGw+KCdsb3NzbGVzc0Zsb3dTY2FsZScsIHsgZGVmYXVsdDogbnVsbCB9KTtcclxuY29uc3QgbG9zc2xlc3NMYXVuY2hEZWxheU1vZGVsID0gZGVmaW5lTW9kZWw8bnVtYmVyIHwgbnVsbD4oJ2xvc3NsZXNzTGF1bmNoRGVsYXknLCB7XHJcbiAgZGVmYXVsdDogbnVsbCxcclxufSk7XHJcblxyXG5jb25zdCBwcm9wcyA9IGRlZmluZVByb3BzPHtcclxuICBoZWFsdGg6IEZyYW1lR2VuSGVhbHRoIHwgbnVsbDtcclxuICBoZWFsdGhMb2FkaW5nOiBib29sZWFuO1xyXG4gIGhlYWx0aEVycm9yOiBzdHJpbmcgfCBudWxsO1xyXG4gIGxvc3NsZXNzQWN0aXZlOiBib29sZWFuO1xyXG4gIG52aWRpYUFjdGl2ZTogYm9vbGVhbjtcclxuICB1c2luZ1ZpcnR1YWxEaXNwbGF5OiBib29sZWFuO1xyXG4gIGhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzOiBib29sZWFuO1xyXG4gIG9uTG9zc2xlc3NSdHNzTGltaXRDaGFuZ2U6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZDtcclxuICByZXNldEFjdGl2ZUxvc3NsZXNzUHJvZmlsZTogKCkgPT4gdm9pZDtcclxufT4oKTtcclxuXHJcbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0czx7XHJcbiAgKGU6ICdyZWZyZXNoLWhlYWx0aCcpOiB2b2lkO1xyXG4gIChlOiAnZW5hYmxlLXZpcnR1YWwtc2NyZWVuJyk6IHZvaWQ7XHJcbn0+KCk7XHJcblxyXG5jb25zdCBoYXNIZWFsdGhEYXRhID0gY29tcHV0ZWQoKCkgPT4gISFwcm9wcy5oZWFsdGgpO1xyXG5jb25zdCBmcmFtZUdlbk9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogJ05vbmUnLCB2YWx1ZTogJ29mZicgYXMgY29uc3QgfSxcclxuICAuLi5GUkFNRV9HRU5FUkFUSU9OX1BST1ZJREVSUyxcclxuXSk7XHJcbmNvbnN0IGlzTG9zc2xlc3NNb2RlID0gY29tcHV0ZWQoKCkgPT4gbW9kZU1vZGVsLnZhbHVlID09PSAnbG9zc2xlc3Mtc2NhbGluZycpO1xyXG5jb25zdCBoYXNGcmFtZUdlblNlbGVjdGlvbiA9IGNvbXB1dGVkKCgpID0+IG1vZGVNb2RlbC52YWx1ZSAhPT0gJ29mZicpO1xyXG5jb25zdCBjYXB0dXJlRml4TW9kZWwgPSBjb21wdXRlZDxib29sZWFuPih7XHJcbiAgZ2V0OiAoKSA9PiBnZW4xTW9kZWwudmFsdWUgfHwgZ2VuMk1vZGVsLnZhbHVlLFxyXG4gIHNldDogKGVuYWJsZWQpID0+IHtcclxuICAgIGdlbjFNb2RlbC52YWx1ZSA9IGVuYWJsZWQ7XHJcbiAgICBnZW4yTW9kZWwudmFsdWUgPSBmYWxzZTtcclxuICB9LFxyXG59KTtcclxuY29uc3QgY2FwdHVyZUZpeERlc2NyaXB0aW9uID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChtb2RlTW9kZWwudmFsdWUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJykge1xyXG4gICAgcmV0dXJuICdVc2VzIFJUU1MgRnJvbnQgRWRnZSBTeW5jIGZvciBMb3NzbGVzcyBTY2FsaW5nIGZyYW1lIGdlbmVyYXRpb24uIE5vdCByZXF1aXJlZCBmb3IgcHVyZSB1cHNjYWxpbmcuJztcclxuICB9XHJcbiAgaWYgKG1vZGVNb2RlbC52YWx1ZSA9PT0gJ252aWRpYS1zbW9vdGgtbW90aW9uJykge1xyXG4gICAgcmV0dXJuICdVc2VzIFJUU1MgRnJvbnQgRWRnZSBTeW5jIHdoaWxlIE5WSURJQSBTbW9vdGggTW90aW9uIGlzIGFjdGl2ZS4nO1xyXG4gIH1cclxuICBpZiAobW9kZU1vZGVsLnZhbHVlID09PSAnZ2FtZS1wcm92aWRlZCcpIHtcclxuICAgIHJldHVybiAnVXNlcyBOVklESUEgUmVmbGV4IGZvciBnYW1lLXByb3ZpZGVkIGZyYW1lIGdlbmVyYXRpb24gb24gTlZJRElBIHN5c3RlbXMsIGFuZCBmYWxscyBiYWNrIHRvIFJUU1MgRnJvbnQgRWRnZSBTeW5jIG9uIEFNRCBzeXN0ZW1zLic7XHJcbiAgfVxyXG4gIHJldHVybiAnRW5hYmxlIHdoZW4gdGhlIGFwcCB1c2VzIGZyYW1lIGdlbmVyYXRpb24uIExvc3NsZXNzIFNjYWxpbmcgYW5kIE5WSURJQSBTbW9vdGggTW90aW9uIHVzZSBSVFNTIEZyb250IEVkZ2UgU3luYywgd2hpbGUgR2FtZSBQcm92aWRlZCB1c2VzIE5WSURJQSBSZWZsZXggdW5sZXNzIGFuIEFNRCBHUFUgaXMgcHJlc2VudC4nO1xyXG59KTtcclxuY29uc3QgbG9zc2xlc3NBZHZhbmNlZFRhcmdldHMgPSByZWYoXHJcbiAgbG9zc2xlc3NUYXJnZXRNb2RlbC52YWx1ZSAhPT0gbnVsbCB8fCBsb3NzbGVzc1J0c3NNb2RlbC52YWx1ZSAhPT0gbnVsbCxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IFtsb3NzbGVzc1RhcmdldE1vZGVsLnZhbHVlLCBsb3NzbGVzc1J0c3NNb2RlbC52YWx1ZV0sXHJcbiAgKFt0YXJnZXQsIHJ0c3NdKSA9PiB7XHJcbiAgICBpZiAodGFyZ2V0ICE9PSBudWxsIHx8IHJ0c3MgIT09IG51bGwpIHtcclxuICAgICAgbG9zc2xlc3NBZHZhbmNlZFRhcmdldHMudmFsdWUgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH0sXHJcbik7XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVMb3NzbGVzc0FkdmFuY2VkVG9nZ2xlKGVuYWJsZWQ6IGJvb2xlYW4pIHtcclxuICBsb3NzbGVzc0FkdmFuY2VkVGFyZ2V0cy52YWx1ZSA9IGVuYWJsZWQ7XHJcbiAgaWYgKCFlbmFibGVkKSB7XHJcbiAgICBsb3NzbGVzc1RhcmdldE1vZGVsLnZhbHVlID0gbnVsbDtcclxuICAgIGxvc3NsZXNzUnRzc01vZGVsLnZhbHVlID0gbnVsbDtcclxuICAgIHByb3BzLm9uTG9zc2xlc3NSdHNzTGltaXRDaGFuZ2UobnVsbCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCByZXF1aXJlbWVudFJvd3MgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFwcm9wcy5oZWFsdGgpIHJldHVybiBbXTtcclxuICByZXR1cm4gW1xyXG4gICAge1xyXG4gICAgICBpZDogJ2NhcHR1cmUnLFxyXG4gICAgICBpY29uOiAnZmEtZGVza3RvcCcsXHJcbiAgICAgIGxhYmVsOiAnV2luZG93cyBHcmFwaGljcyBDYXB0dXJlIChyZWNvbW1lbmRlZCknLFxyXG4gICAgICBzdGF0dXM6IHByb3BzLmhlYWx0aC5jYXB0dXJlLnN0YXR1cyxcclxuICAgICAgbWVzc2FnZTogcHJvcHMuaGVhbHRoLmNhcHR1cmUubWVzc2FnZSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAncnRzcycsXHJcbiAgICAgIGljb246ICdmYS1zdG9wd2F0Y2gnLFxyXG4gICAgICBsYWJlbDogJ1JUU1MgaW5zdGFsbGVkIChyZWNvbW1lbmRlZCknLFxyXG4gICAgICBzdGF0dXM6IHByb3BzLmhlYWx0aC5ydHNzLnN0YXR1cyxcclxuICAgICAgbWVzc2FnZTogcHJvcHMuaGVhbHRoLnJ0c3MubWVzc2FnZSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnZGlzcGxheScsXHJcbiAgICAgIGljb246ICdmYS10dicsXHJcbiAgICAgIGxhYmVsOiAnRGlzcGxheSBjYW4gZG91YmxlIHlvdXIgc3RyZWFtIEZQUycsXHJcbiAgICAgIHN0YXR1czogcHJvcHMuaGVhbHRoLmRpc3BsYXkuc3RhdHVzLFxyXG4gICAgICBtZXNzYWdlOiBwcm9wcy5oZWFsdGguZGlzcGxheS5tZXNzYWdlLFxyXG4gICAgfSxcclxuICBdO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHN0YXR1c0NsYXNzZXMoc3RhdHVzOiBGcmFtZUdlblJlcXVpcmVtZW50U3RhdHVzKSB7XHJcbiAgc3dpdGNoIChzdGF0dXMpIHtcclxuICAgIGNhc2UgJ3Bhc3MnOlxyXG4gICAgICByZXR1cm4gJ2JnLWVtZXJhbGQtNTAwLzEwIHRleHQtZW1lcmFsZC01MDAnO1xyXG4gICAgY2FzZSAnd2Fybic6XHJcbiAgICAgIHJldHVybiAnYmctYW1iZXItNTAwLzEwIHRleHQtYW1iZXItNTAwJztcclxuICAgIGNhc2UgJ2ZhaWwnOlxyXG4gICAgICByZXR1cm4gJ2JnLXJvc2UtNTAwLzEwIHRleHQtcm9zZS01MDAnO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdiZy1zbGF0ZS01MDAvMTAgdGV4dC1zbGF0ZS00MDAnO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RhdHVzSWNvbihzdGF0dXM6IEZyYW1lR2VuUmVxdWlyZW1lbnRTdGF0dXMpIHtcclxuICBzd2l0Y2ggKHN0YXR1cykge1xyXG4gICAgY2FzZSAncGFzcyc6XHJcbiAgICAgIHJldHVybiAnZmEtY2hlY2stY2lyY2xlJztcclxuICAgIGNhc2UgJ3dhcm4nOlxyXG4gICAgICByZXR1cm4gJ2ZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlJztcclxuICAgIGNhc2UgJ2ZhaWwnOlxyXG4gICAgICByZXR1cm4gJ2ZhLXRpbWVzLWNpcmNsZSc7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gJ2ZhLXF1ZXN0aW9uLWNpcmNsZSc7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzdGF0dXNMYWJlbChzdGF0dXM6IEZyYW1lR2VuUmVxdWlyZW1lbnRTdGF0dXMpIHtcclxuICBzd2l0Y2ggKHN0YXR1cykge1xyXG4gICAgY2FzZSAncGFzcyc6XHJcbiAgICAgIHJldHVybiAnUmVhZHknO1xyXG4gICAgY2FzZSAnd2Fybic6XHJcbiAgICAgIHJldHVybiAnTmVlZHMgYXR0ZW50aW9uJztcclxuICAgIGNhc2UgJ2ZhaWwnOlxyXG4gICAgICByZXR1cm4gJ0ZhaWwnO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdVbmtub3duJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRhcmdldEljb25OYW1lKHN1cHBvcnRlZDogYm9vbGVhbiB8IG51bGwpIHtcclxuICBpZiAoc3VwcG9ydGVkID09PSB0cnVlKSByZXR1cm4gJ2ZhLWNoZWNrLWNpcmNsZSc7XHJcbiAgaWYgKHN1cHBvcnRlZCA9PT0gZmFsc2UpIHJldHVybiAnZmEtdGltZXMtY2lyY2xlJztcclxuICByZXR1cm4gJ2ZhLXF1ZXN0aW9uLWNpcmNsZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRhcmdldEljb25DbGFzcyhzdXBwb3J0ZWQ6IGJvb2xlYW4gfCBudWxsKSB7XHJcbiAgaWYgKHN1cHBvcnRlZCA9PT0gdHJ1ZSkgcmV0dXJuICd0ZXh0LWVtZXJhbGQtNTAwJztcclxuICBpZiAoc3VwcG9ydGVkID09PSBmYWxzZSkgcmV0dXJuICd0ZXh0LXJvc2UtNTAwJztcclxuICByZXR1cm4gJ3RleHQtYW1iZXItNTAwJztcclxufVxyXG5cclxuZnVuY3Rpb24gdGFyZ2V0U3RhdHVzTGFiZWwoc3VwcG9ydGVkOiBib29sZWFuIHwgbnVsbCkge1xyXG4gIGlmIChzdXBwb3J0ZWQgPT09IHRydWUpIHJldHVybiAnU3VwcG9ydGVkJztcclxuICBpZiAoc3VwcG9ydGVkID09PSBmYWxzZSkgcmV0dXJuICdOb3Qgc3VwcG9ydGVkJztcclxuICByZXR1cm4gJ1Vua25vd24nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRIeihoejogbnVtYmVyIHwgbnVsbCkge1xyXG4gIGlmIChoeiA9PT0gbnVsbCB8fCBOdW1iZXIuaXNOYU4oaHopKSByZXR1cm4gJ1Vua25vd24gcmVmcmVzaCByYXRlJztcclxuICBpZiAoaHogPj0gMjAwKSByZXR1cm4gYCR7TWF0aC5yb3VuZChoeil9IEh6YDtcclxuICByZXR1cm4gYCR7TWF0aC5yb3VuZChoeiAqIDEwKSAvIDEwfSBIemA7XHJcbn1cclxuXHJcbmNvbnN0IHNob3dTdWdnZXN0aW9uID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IGhlYWx0aCA9IHByb3BzLmhlYWx0aDtcclxuICBpZiAoIWhlYWx0aCB8fCAhaGVhbHRoLnN1Z2dlc3Rpb24pIHJldHVybiBudWxsO1xyXG4gIHJldHVybiBoZWFsdGguc3VnZ2VzdGlvbjtcclxufSk7XHJcbmNvbnN0IGNhbkVuYWJsZVZpcnR1YWxTY3JlZW4gPSBjb21wdXRlZCgoKSA9PiAhcHJvcHMudXNpbmdWaXJ0dWFsRGlzcGxheSk7XHJcblxyXG5jb25zdCBkaXNwbGF5VGFyZ2V0cyA9IGNvbXB1dGVkKCgpID0+IHByb3BzLmhlYWx0aD8uZGlzcGxheS50YXJnZXRzIHx8IFtdKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPHNlY3Rpb25cclxuICAgIGNsYXNzPVwicm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLWxpZ2h0LzYwIGRhcms6Ymctc3VyZmFjZS80MCBwLTQgc3BhY2UteS00XCJcclxuICA+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMyBtZDpmbGV4LXJvdyBtZDppdGVtcy1zdGFydCBtZDpqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgIDxoMyBjbGFzcz1cInRleHQtYmFzZSBmb250LXNlbWlib2xkIHRleHQtZGFyayBkYXJrOnRleHQtbGlnaHRcIj5cclxuICAgICAgICAgIEZyYW1lIEdlbmVyYXRpb24gQ29uZmlndXJhdGlvblxyXG4gICAgICAgIDwvaDM+XHJcbiAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICBTZWxlY3QgaG93IFZpYmVwb2xsbyBjb29yZGluYXRlcyBmcmFtZSBnZW5lcmF0aW9uIGFuZCByZXZpZXcgdGhlIGNhcHR1cmUgc2FmZWd1YXJkcyBuZWVkZWRcclxuICAgICAgICAgIGZvciBzbW9vdGggcGxheWJhY2suXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgIDxuLXRhZyB2LWlmPVwibG9zc2xlc3NBY3RpdmVcIiBzaXplPVwic21hbGxcIiB0eXBlPVwicHJpbWFyeVwiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtYm9sdFwiIDpzaXplPVwiMTJcIiBjbGFzcz1cIm1yLTFcIiAvPiBMb3NzbGVzcyBTY2FsaW5nIGZyYW1lIGdlbmVyYXRpb24gYWN0aXZlXHJcbiAgICAgICAgICA8L24tdGFnPlxyXG4gICAgICAgICAgPG4tdGFnIHYtaWY9XCJudmlkaWFBY3RpdmVcIiBzaXplPVwic21hbGxcIiB0eXBlPVwiaW5mb1wiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtbnZpZGlhXCIgOnNpemU9XCIxMlwiIGNsYXNzPVwibXItMVwiIC8+IE5WSURJQSBTbW9vdGggTW90aW9uIGFjdGl2ZVxyXG4gICAgICAgICAgPC9uLXRhZz5cclxuICAgICAgICAgIDxuLXRhZyB2LWlmPVwidXNpbmdWaXJ0dWFsRGlzcGxheVwiIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJzdWNjZXNzXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1kaXNwbGF5XCIgOnNpemU9XCIxMlwiIGNsYXNzPVwibXItMVwiIC8+IFZpYmVwb2xsbyB2aXJ0dWFsIHNjcmVlbiBpbiB1c2VcclxuICAgICAgICAgIDwvbi10YWc+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdGVydGlhcnkgOmxvYWRpbmc9XCJoZWFsdGhMb2FkaW5nXCIgQGNsaWNrPVwiZW1pdCgncmVmcmVzaC1oZWFsdGgnKVwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXN0ZXRob3Njb3BlXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLTJcIj5SdW4gaGVhbHRoIGNoZWNrPC9zcGFuPlxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiBjbGFzcz1cInNwYWNlLXktNFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgIEZyYW1lIEdlbmVyYXRpb24gS2luZFxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibW9kZU1vZGVsXCJcclxuICAgICAgICAgIDpvcHRpb25zPVwiZnJhbWVHZW5PcHRpb25zXCJcclxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICA6Y2xlYXJhYmxlPVwiZmFsc2VcIlxyXG4gICAgICAgIC8+XHJcbiAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICBOb25lIGtlZXBzIFZpYmVwb2xsbyBvdXQgb2YgdGhlIGxvb3AsIEdhbWUgUHJvdmlkZWQgdHJ1c3RzIGluLWdhbWUgZnJhbWUgZ2VuZXJhdGlvbixcclxuICAgICAgICAgIExvc3NsZXNzIFNjYWxpbmcgd3JhcHMgTFNGRywgYW5kIE5WSURJQSBTbW9vdGggTW90aW9uIGNvbmZpZ3VyZXMgdGhlIGRyaXZlciBlYWNoIGxhdW5jaC5cclxuICAgICAgICA8L3A+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIHYtaWY9XCJpc0xvc3NsZXNzTW9kZVwiXHJcbiAgICAgICAgY2xhc3M9XCJzcGFjZS15LTMgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMjAgYmctcHJpbWFyeS81IHAtM1wiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMiBtZDpmbGV4LXJvdyBtZDppdGVtcy1zdGFydCBtZDpqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvbnQtbWVkaXVtIHRleHQtc21cIj5Mb3NzbGVzcyBTY2FsaW5nIEZyYW1lIEdlbmVyYXRpb248L2Rpdj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgICAgVXNlIFZpYmVwb2xsbyZyc3F1bztzIHR1bmVkIHByb2ZpbGUgb3IgeW91ciBMb3NzbGVzcyBTY2FsaW5nIGRlZmF1bHRzLCB0aGVuIGZpbmUtdHVuZVxyXG4gICAgICAgICAgICAgIHRoZSBydW50aW1lIHRhcmdldHMuXHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgIHRlcnRpYXJ5XHJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFwcm9wcy5oYXNBY3RpdmVMb3NzbGVzc092ZXJyaWRlc1wiXHJcbiAgICAgICAgICAgIEBjbGljaz1cInByb3BzLnJlc2V0QWN0aXZlTG9zc2xlc3NQcm9maWxlKClcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBSZXNldCB0byBQcm9maWxlIERlZmF1bHRzXHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlByb2ZpbGU8L2xhYmVsPlxyXG4gICAgICAgICAgPG4tcmFkaW8tZ3JvdXAgdi1tb2RlbDp2YWx1ZT1cImxvc3NsZXNzUHJvZmlsZU1vZGVsXCIgY2xhc3M9XCJmbGV4IGZsZXgtY29sIHNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICA8bi1yYWRpbyB2YWx1ZT1cInJlY29tbWVuZGVkXCIgY2xhc3M9XCJ3LWZ1bGwgcHktMiBweC0yIHJvdW5kZWQtbWQgaG92ZXI6Ymctc3VyZmFjZS8xMFwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB3LWZ1bGxcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmxvY2sgdGV4dC1zbVwiPlJlY29tbWVuZGVkIChMb3dlc3QgTGF0ZW5jeSAmIEZyYW1lIFBhY2luZyk8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvbi1yYWRpbz5cclxuICAgICAgICAgICAgPG4tcmFkaW8gdmFsdWU9XCJjdXN0b21cIiBjbGFzcz1cInctZnVsbCBweS0yIHB4LTIgcm91bmRlZC1tZCBob3ZlcjpiZy1zdXJmYWNlLzEwXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHctZnVsbFwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJibG9jayB0ZXh0LXNtXCI+Q3VzdG9tOiBVc2UgbXkgTG9zc2xlc3MgU2NhbGluZyBkZWZhdWx0IHByb2ZpbGU8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvbi1yYWRpbz5cclxuICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICBSZWNvbW1lbmRlZCBtaXJyb3JzIFZpYmVwb2xsbyZyc3F1bztzIGxhdGVuY3ktZm9jdXNlZCB0ZW1wbGF0ZS4gQ3VzdG9tIHJ1bnMgdGhlIHByb2ZpbGVcclxuICAgICAgICAgICAgeW91IG1haW50YWluIGluc2lkZSBMb3NzbGVzcyBTY2FsaW5nLlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0zXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgRnJhbWUgVGFyZ2V0c1xyXG4gICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBsZWFkaW5nLXJlbGF4ZWRcIj5cclxuICAgICAgICAgICAgICBWaWJlcG9sbG8gaW5oZXJpdHMgdGhlIEZQUyB5b3VyIHN0cmVhbWluZyBjbGllbnQgcmVxdWVzdHMgYW5kIGZvcndhcmRzIGl0IHRvIExvc3NsZXNzXHJcbiAgICAgICAgICAgICAgU2NhbGluZyBhdXRvbWF0aWNhbGx5LiBXaGVuIFJUU1MgaXMgYXZhaWxhYmxlIHdlIGNhcCBpdCBhdCBoYWxmIG9mIHRoYXQgcmVxdWVzdCBmb3JcclxuICAgICAgICAgICAgICBzdGVhZGllciBwYWNpbmcuXHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxuLXN3aXRjaFxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgIDp2YWx1ZT1cImxvc3NsZXNzQWR2YW5jZWRUYXJnZXRzXCJcclxuICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCJoYW5kbGVMb3NzbGVzc0FkdmFuY2VkVG9nZ2xlXCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgIEFkdmFuY2VkIG92ZXJyaWRlc1xyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPk1hbnVhbCBGUFMgJmFtcDsgUlRTUzwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgdi1pZj1cImxvc3NsZXNzQWR2YW5jZWRUYXJnZXRzXCIgY2xhc3M9XCJncmlkIGdhcC0zIG1kOmdyaWQtY29scy0yXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgVGFyZ2V0IEZyYW1lIFJhdGUgT3ZlcnJpZGVcclxuICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImxvc3NsZXNzVGFyZ2V0TW9kZWxcIlxyXG4gICAgICAgICAgICAgICAgOm1pbj1cIjFcIlxyXG4gICAgICAgICAgICAgICAgOm1heD1cIjM2MFwiXHJcbiAgICAgICAgICAgICAgICA6c3RlcD1cIjFcIlxyXG4gICAgICAgICAgICAgICAgOnByZWNpc2lvbj1cIjBcIlxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIxMjBcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICAgT25seSBzZXQgdGhpcyB3aGVuIHlvdSBuZWVkIHRvIG92ZXJyaWRlIHRoZSBjbGllbnQmcnNxdW87cyByZXF1ZXN0ZWQgRlBTIGZvclxyXG4gICAgICAgICAgICAgICAgTG9zc2xlc3MgU2NhbGluZy5cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgIFJUU1MgRnJhbWUgTGltaXQgT3ZlcnJpZGVcclxuICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImxvc3NsZXNzUnRzc01vZGVsXCJcclxuICAgICAgICAgICAgICAgIDptaW49XCIxXCJcclxuICAgICAgICAgICAgICAgIDptYXg9XCIzNjBcIlxyXG4gICAgICAgICAgICAgICAgOnN0ZXA9XCIxXCJcclxuICAgICAgICAgICAgICAgIDpwcmVjaXNpb249XCIwXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiNjBcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCJwcm9wcy5vbkxvc3NsZXNzUnRzc0xpbWl0Q2hhbmdlXCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICAgVmliZXBvbGxvIGRlZmF1bHRzIHRvIGhhbGYgb2YgdGhlIGNsaWVudCByZXF1ZXN0IHdoZW4gbGVmdCBibGFuay4gUmVxdWlyZXMgUlRTU1xyXG4gICAgICAgICAgICAgICAgaW5zdGFsbGVkIGFuZCBydW5uaW5nLlxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICBGbG93IFNjYWxlICglKVxyXG4gICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICA8bi1pbnB1dC1udW1iZXJcclxuICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibG9zc2xlc3NGbG93TW9kZWxcIlxyXG4gICAgICAgICAgICAgIDptaW49XCJMT1NTTEVTU19GTE9XX01JTlwiXHJcbiAgICAgICAgICAgICAgOm1heD1cIkxPU1NMRVNTX0ZMT1dfTUFYXCJcclxuICAgICAgICAgICAgICA6c3RlcD1cIjFcIlxyXG4gICAgICAgICAgICAgIDpwcmVjaXNpb249XCIwXCJcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjUwXCJcclxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBsZWFkaW5nLXJlbGF4ZWRcIj5cclxuICAgICAgICAgICAgICBGcmFtZSBibGVuZGluZyBzdHJlbmd0aCAoMOKAkzEwMCkuIFZpYmVwb2xsbyByZWNvbW1lbmRzIDUwJSBhcyBhIGJhbGFuY2VkIGRlZmF1bHQuXHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgIExvc3NsZXNzIExhdW5jaCBEZWxheSAoc2Vjb25kcylcclxuICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibG9zc2xlc3NMYXVuY2hEZWxheU1vZGVsXCJcclxuICAgICAgICAgICAgICAgOm1pbj1cIjBcIlxyXG4gICAgICAgICAgICAgICA6bWF4PVwiNjAwXCJcclxuICAgICAgICAgICAgICAgOnN0ZXA9XCIxXCJcclxuICAgICAgICAgICAgICAgOnByZWNpc2lvbj1cIjBcIlxyXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjhcIlxyXG4gICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICBXYWl0IGFkZGl0aW9uYWwgc2Vjb25kcyBhZnRlciB0aGUgZ2FtZSBzdGFydHMgYmVmb3JlIG9wZW5pbmcgTG9zc2xlc3MgU2NhbGluZy5cclxuICAgICAgICAgICAgICAgTGVhdmUgYmxhbmsgdG8gdXNlIHRoZSBkZWZhdWx0IDgtc2Vjb25kIGRlbGF5LlxyXG4gICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdhcC0zXCI+XHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gZ2FwLTMgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctd2hpdGUvNTAgZGFyazpiZy13aGl0ZS81IHB4LTMgcHktM1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9udC1tZWRpdW0gdGV4dC1zbVwiPkZyYW1lIEdlbmVyYXRpb24gQ2FwdHVyZSBGaXg8L2Rpdj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1yZWxheGVkXCI+e3sgY2FwdHVyZUZpeERlc2NyaXB0aW9uIH19PC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8bi1zd2l0Y2hcclxuICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNhcHR1cmVGaXhNb2RlbFwiXHJcbiAgICAgICAgICAgIHNpemU9XCJsYXJnZVwiXHJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFoYXNGcmFtZUdlblNlbGVjdGlvblwiXHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgICAgIDxuLWFsZXJ0IHYtaWY9XCJoZWFsdGhFcnJvclwiIHR5cGU9XCJlcnJvclwiIHNpemU9XCJzbWFsbFwiPlxyXG4gICAgICAgICAge3sgaGVhbHRoRXJyb3IgfX1cclxuICAgICAgICA8L24tYWxlcnQ+XHJcbiAgICAgICAgPG4tYWxlcnQgdi1lbHNlLWlmPVwiIWhhc0hlYWx0aERhdGEgJiYgIWhlYWx0aExvYWRpbmdcIiBzaXplPVwic21hbGxcIiB0eXBlPVwiaW5mb1wiPlxyXG4gICAgICAgICAgUnVuIHRoZSBoZWFsdGggY2hlY2sgdG8gdmVyaWZ5IGNhcHR1cmUgbWV0aG9kLCBSVFNTLCBhbmQgZGlzcGxheSByZWZyZXNoIHJlcXVpcmVtZW50c1xyXG4gICAgICAgICAgYmVmb3JlIHN0cmVhbWluZyB3aXRoIGZyYW1lIGdlbmVyYXRpb24uXHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICAgIDxuLWFsZXJ0XHJcbiAgICAgICAgICB2LWVsc2UtaWY9XCJoZWFsdGhMb2FkaW5nICYmICFoYXNIZWFsdGhEYXRhXCJcclxuICAgICAgICAgIHR5cGU9XCJpbmZvXCJcclxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICA6Ym9yZGVyZWQ9XCJmYWxzZVwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgQ2hlY2tpbmcgcmVxdWlyZW1lbnRzLi4uXHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgdi1pZj1cImhlYWx0aFwiIGNsYXNzPVwic3BhY2UteS0zXCI+XHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgdi1mb3I9XCJyb3cgaW4gcmVxdWlyZW1lbnRSb3dzXCJcclxuICAgICAgICAgIDprZXk9XCJyb3cuaWRcIlxyXG4gICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS80MCBkYXJrOmJnLXdoaXRlLzUgcC0zXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMyBzbTpmbGV4LXJvdyBzbTppdGVtcy1zdGFydCBzbTpqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQgZ2FwLTNcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1wcmltYXJ5IHRleHQtYmFzZVwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJyb3cuaWNvblwiIDpzaXplPVwiMTZcIiAvPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb250LW1lZGl1bSB0ZXh0LXNtXCI+e3sgcm93LmxhYmVsIH19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MCBsZWFkaW5nLXJlbGF4ZWRcIj5cclxuICAgICAgICAgICAgICAgICAge3sgcm93Lm1lc3NhZ2UgfX1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICA6Y2xhc3M9XCJbXHJcbiAgICAgICAgICAgICAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHJvdW5kZWQtZnVsbCBweC0yIHB5LTEgdGV4dC14cyBmb250LXNlbWlib2xkIHdoaXRlc3BhY2Utbm93cmFwJyxcclxuICAgICAgICAgICAgICAgIHN0YXR1c0NsYXNzZXMocm93LnN0YXR1cyksXHJcbiAgICAgICAgICAgICAgXVwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cInN0YXR1c0ljb24ocm93LnN0YXR1cylcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICA8c3Bhbj57eyBzdGF0dXNMYWJlbChyb3cuc3RhdHVzKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS80MCBkYXJrOmJnLXdoaXRlLzUgcC0zIHNwYWNlLXktM1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMSBzbTpmbGV4LXJvdyBzbTppdGVtcy1jZW50ZXIgc206anVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvbnQtbWVkaXVtIHRleHQtc21cIj5SZWZyZXNoIHJhdGUgY292ZXJhZ2U8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICBUYXJnZXRlZCBkaXNwbGF5OiB7eyBoZWFsdGguZGlzcGxheS5kZXZpY2VMYWJlbCB8fCAnVGFyZ2V0ZWQgZGlzcGxheScgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgIHt7IGhlYWx0aC5kaXNwbGF5Lm1lc3NhZ2UgfX1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ2FwLTIgc206Z3JpZC1jb2xzLTJcIj5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtZm9yPVwidGFyZ2V0IGluIGRpc3BsYXlUYXJnZXRzXCJcclxuICAgICAgICAgICAgICA6a2V5PVwidGFyZ2V0LmZwc1wiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS81MCBkYXJrOmJnLXdoaXRlLzEwIHB4LTMgcHktMiBzcGFjZS15LTFcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc20gZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIDpuYW1lPVwidGFyZ2V0SWNvbk5hbWUodGFyZ2V0LnN1cHBvcnRlZClcIiA6c2l6ZT1cIjE0XCIgOmNsYXNzPVwidGFyZ2V0SWNvbkNsYXNzKHRhcmdldC5zdXBwb3J0ZWQpXCIgLz5cclxuICAgICAgICAgICAgICAgIDxzcGFuPnt7IHRhcmdldC5mcHMgfX0gRlBTIHN0cmVhbTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICAgTmVlZHMge3sgdGFyZ2V0LnJlcXVpcmVkSHogfX0gSHogLSB7eyB0YXJnZXRTdGF0dXNMYWJlbCh0YXJnZXQuc3VwcG9ydGVkKSB9fVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxuLWFsZXJ0XHJcbiAgICAgICAgICAgIHYtaWY9XCJoZWFsdGguZGlzcGxheS5lcnJvclwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJ3YXJuaW5nXCJcclxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgOnNob3ctaWNvbj1cImZhbHNlXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJ0ZXh0LXhzXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAge3sgaGVhbHRoLmRpc3BsYXkuZXJyb3IgfX1cclxuICAgICAgICAgIDwvbi1hbGVydD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8bi1hbGVydFxyXG4gICAgICAgIHYtaWY9XCJzaG93U3VnZ2VzdGlvblwiXHJcbiAgICAgICAgOnR5cGU9XCJzaG93U3VnZ2VzdGlvbi5lbXBoYXNpcyA9PT0gJ3dhcm5pbmcnID8gJ3dhcm5pbmcnIDogJ2luZm8nXCJcclxuICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTIgc206ZmxleC1yb3cgc206aXRlbXMtY2VudGVyIHNtOmp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICAgICAgPHNwYW4+e3sgc2hvd1N1Z2dlc3Rpb24ubWVzc2FnZSB9fTwvc3Bhbj5cclxuICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICB2LWlmPVwiY2FuRW5hYmxlVmlydHVhbFNjcmVlblwiXHJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgQGNsaWNrPVwiZW1pdCgnZW5hYmxlLXZpcnR1YWwtc2NyZWVuJylcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBVc2UgVmlydHVhbCBTY3JlZW5cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvbi1hbGVydD5cclxuXHJcbiAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgIEZyYW1lIGdlbmVyYXRpb24gY2FwdHVyZSBmaXhlcyBhcmUgb25seSBuZWVkZWQgd2hlbiB1c2luZyBmcmFtZSBnZW5lcmF0aW9uIHRlY2hub2xvZ2llcy5cclxuICAgICAgICBVcHNjYWxpbmcgYWxvbmUgY2FuIHN0YXkgZGlzYWJsZWQuXHJcbiAgICAgIDwvcD5cclxuICAgIDwvZGl2PlxyXG4gIDwvc2VjdGlvbj5cclxuPC90ZW1wbGF0ZT5cclxuIiwiPHRlbXBsYXRlPlxyXG4gIDxuLW1vZGFsXHJcbiAgICA6c2hvdz1cInZpc2libGVcIlxyXG4gICAgOnotaW5kZXg9XCIzMzAwXCJcclxuICAgIDptYXNrLXN0eWxlPVwieyBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsMCwwLDAuNTUpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDJweCknIH1cIlxyXG4gICAgQHVwZGF0ZTpzaG93PVwiKHYpID0+IGVtaXQoJ3VwZGF0ZTp2aXNpYmxlJywgdilcIlxyXG4gID5cclxuICAgIDxuLWNhcmQgOmJvcmRlcmVkPVwiZmFsc2VcIiBzdHlsZT1cIm1heC13aWR0aDogNDhyZW07IHdpZHRoOiAxMDAlXCI+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdy1mdWxsXCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtc2VtaWJvbGRcIj5Db3ZlcnMgRm91bmQ8L3NwYW4+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgc2l6ZT1cInNtYWxsXCIgQGNsaWNrPVwiZW1pdCgndXBkYXRlOnZpc2libGUnLCBmYWxzZSlcIj5cclxuICAgICAgICAgICAgQ2xvc2VcclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJtaW4taC1bMTYwcHhdXCI+XHJcbiAgICAgICAgPGRpdiB2LWlmPVwiY292ZXJTZWFyY2hpbmdcIiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB5LTEwXCI+XHJcbiAgICAgICAgICA8bi1zcGluIHNpemU9XCJsYXJnZVwiPkxvYWRpbmfigKY8L24tc3Bpbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IHYtZWxzZT5cclxuICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgY2xhc3M9XCJncmlkIGdyaWQtY29scy0yIHNtOmdyaWQtY29scy0zIG1kOmdyaWQtY29scy00IGdhcC0zIG1heC1oLVs0MjBweF0gb3ZlcmZsb3ctYXV0byBwci0xXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtZm9yPVwiKGNvdmVyLCBpKSBpbiBjb3ZlckNhbmRpZGF0ZXNcIlxyXG4gICAgICAgICAgICAgIDprZXk9XCJpXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImN1cnNvci1wb2ludGVyIGdyb3VwXCJcclxuICAgICAgICAgICAgICBAY2xpY2s9XCJlbWl0KCdwaWNrJywgY292ZXIpXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZSByb3VuZGVkIG92ZXJmbG93LWhpZGRlbiBhc3BlY3QtWzMvNF0gYmctYmxhY2svNSBkYXJrOmJnLXdoaXRlLzVcIj5cclxuICAgICAgICAgICAgICAgIDxpbWcgOnNyYz1cImNvdmVyLnVybFwiIGNsYXNzPVwiYWJzb2x1dGUgaW5zZXQtMCB3LWZ1bGwgaC1mdWxsIG9iamVjdC1jb3ZlclwiIC8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgIHYtaWY9XCJjb3ZlckJ1c3lcIlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImFic29sdXRlIGluc2V0LTAgYmctYmxhY2svMjAgZGFyazpiZy13aGl0ZS8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxuLXNwaW4gc2l6ZT1cInNtYWxsXCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdC0xIHRleHQteHMgdGV4dC1jZW50ZXIgdHJ1bmNhdGVcIiA6dGl0bGU9XCJjb3Zlci5uYW1lXCI+XHJcbiAgICAgICAgICAgICAgICB7eyBjb3Zlci5uYW1lIH19XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHYtaWY9XCIhY292ZXJDYW5kaWRhdGVzLmxlbmd0aFwiIGNsYXNzPVwiY29sLXNwYW4tZnVsbCB0ZXh0LWNlbnRlciBvcGFjaXR5LTcwIHB5LThcIj5cclxuICAgICAgICAgICAgICBObyByZXN1bHRzLiBUcnkgYWRqdXN0aW5nIHRoZSBhcHAgbmFtZS5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L24tY2FyZD5cclxuICA8L24tbW9kYWw+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyB0b1JlZnMgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyBOTW9kYWwsIE5DYXJkLCBOQnV0dG9uLCBOU3BpbiB9IGZyb20gJ25haXZlLXVpJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ292ZXJDYW5kaWRhdGUge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBrZXk6IHN0cmluZztcclxuICB1cmw6IHN0cmluZztcclxuICBzYXZlVXJsOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IHJhd1Byb3BzID0gZGVmaW5lUHJvcHM8e1xyXG4gIHZpc2libGU6IGJvb2xlYW47XHJcbiAgY292ZXJTZWFyY2hpbmc6IGJvb2xlYW47XHJcbiAgY292ZXJCdXN5OiBib29sZWFuO1xyXG4gIGNvdmVyQ2FuZGlkYXRlczogQ292ZXJDYW5kaWRhdGVbXTtcclxufT4oKTtcclxuXHJcbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0czx7XHJcbiAgKGU6ICd1cGRhdGU6dmlzaWJsZScsIHZhbHVlOiBib29sZWFuKTogdm9pZDtcclxuICAoZTogJ3BpY2snLCBjb3ZlcjogQ292ZXJDYW5kaWRhdGUpOiB2b2lkO1xyXG59PigpO1xyXG5cclxuY29uc3QgeyB2aXNpYmxlLCBjb3ZlclNlYXJjaGluZywgY292ZXJCdXN5LCBjb3ZlckNhbmRpZGF0ZXMgfSA9IHRvUmVmcyhyYXdQcm9wcyk7XHJcbjwvc2NyaXB0PlxyXG4iLCI8dGVtcGxhdGU+XHJcbiAgPG4tbW9kYWxcclxuICAgIDpzaG93PVwidmlzaWJsZVwiXHJcbiAgICA6ei1pbmRleD1cIjMzMDBcIlxyXG4gICAgOm1hc2stc3R5bGU9XCJ7IGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwwLDAsMC41NSknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoMnB4KScgfVwiXHJcbiAgICBAdXBkYXRlOnNob3c9XCIodikgPT4gZW1pdCgndXBkYXRlOnZpc2libGUnLCB2KVwiXHJcbiAgPlxyXG4gICAgPG4tY2FyZFxyXG4gICAgICA6dGl0bGU9XCJcclxuICAgICAgICBpc1BsYXluaXRlQXV0b1xyXG4gICAgICAgICAgPyAnUmVtb3ZlIGFuZCBFeGNsdWRlIGZyb20gQXV0b+KAkVN5bmM/J1xyXG4gICAgICAgICAgOiAoJHQoJ2FwcHMuY29uZmlybV9kZWxldGVfdGl0bGVfbmFtZWQnLCB7IG5hbWU6IG5hbWUgfSkgYXMgYW55KVxyXG4gICAgICBcIlxyXG4gICAgICA6Ym9yZGVyZWQ9XCJmYWxzZVwiXHJcbiAgICAgIHN0eWxlPVwibWF4LXdpZHRoOiAzMnJlbTsgd2lkdGg6IDEwMCVcIlxyXG4gICAgPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBzcGFjZS15LTJcIj5cclxuICAgICAgICA8dGVtcGxhdGUgdi1pZj1cImlzUGxheW5pdGVBdXRvXCI+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICBUaGlzIGFwcGxpY2F0aW9uIGlzIG1hbmFnZWQgYnkgUGxheW5pdGUuIFJlbW92aW5nIGl0IHdpbGwgYWxzbyBhZGQgaXQgdG8gdGhlIEV4Y2x1ZGVkXHJcbiAgICAgICAgICAgIEdhbWVzIGxpc3Qgc28gaXQgd29u4oCZdCBiZSBhdXRv4oCRc3luY2VkIGJhY2suXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvcGFjaXR5LTgwXCI+XHJcbiAgICAgICAgICAgIFlvdSBjYW4gcmVzdG9yZSBpdCBsYXRlciBieSBtYW51YWxseSBhZGRpbmcgaXQsIG9yIGJ5IHJlbW92aW5nIHRoZSBleGNsdXNpb24gdW5kZXJcclxuICAgICAgICAgICAgU2V0dGluZ3Mg4oaSIFBsYXluaXRlLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib3BhY2l0eS03MFwiPkRvIHlvdSB3YW50IHRvIGNvbnRpbnVlPzwvZGl2PlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPHRlbXBsYXRlIHYtZWxzZT5cclxuICAgICAgICAgIHt7ICR0KCdhcHBzLmNvbmZpcm1fZGVsZXRlX21lc3NhZ2VfbmFtZWQnLCB7IG5hbWUgfSkgfX1cclxuICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPHRlbXBsYXRlICNmb290ZXI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtM1wiPlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHR5cGU9XCJkZWZhdWx0XCIgc3Ryb25nIEBjbGljaz1cImVtaXQoJ2NhbmNlbCcpXCI+e3tcclxuICAgICAgICAgICAgJHQoJ19jb21tb24uY2FuY2VsJylcclxuICAgICAgICAgIH19PC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwiZXJyb3JcIiBzdHJvbmcgQGNsaWNrPVwiZW1pdCgnY29uZmlybScpXCI+e3sgJHQoJ2FwcHMuZGVsZXRlJykgfX08L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgPC9uLWNhcmQ+XHJcbiAgPC9uLW1vZGFsPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgdG9SZWZzIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTk1vZGFsLCBOQ2FyZCwgTkJ1dHRvbiB9IGZyb20gJ25haXZlLXVpJztcclxuXHJcbmNvbnN0IHJhd1Byb3BzID0gZGVmaW5lUHJvcHM8e1xyXG4gIHZpc2libGU6IGJvb2xlYW47XHJcbiAgaXNQbGF5bml0ZUF1dG86IGJvb2xlYW47XHJcbiAgbmFtZTogc3RyaW5nO1xyXG59PigpO1xyXG5cclxuY29uc3QgeyB2aXNpYmxlLCBpc1BsYXluaXRlQXV0bywgbmFtZSB9ID0gdG9SZWZzKHJhd1Byb3BzKTtcclxuXHJcbmNvbnN0IGVtaXQgPSBkZWZpbmVFbWl0czx7XHJcbiAgKGU6ICd1cGRhdGU6dmlzaWJsZScsIHZhbHVlOiBib29sZWFuKTogdm9pZDtcclxuICAoZTogJ2NhbmNlbCcpOiB2b2lkO1xyXG4gIChlOiAnY29uZmlybScpOiB2b2lkO1xyXG59PigpO1xyXG48L3NjcmlwdD5cclxuIiwiPHRlbXBsYXRlPlxyXG4gIDxuLW1vZGFsXHJcbiAgICA6c2hvdz1cIm9wZW5cIlxyXG4gICAgOm1hc2stY2xvc2FibGU9XCJ0cnVlXCJcclxuICAgIDp0cmFwLWZvY3VzPVwiIW92ZXJyaWRlc1BpY2tlck9wZW5cIlxyXG4gICAgQHVwZGF0ZTpzaG93PVwiKHYpID0+IGVtaXQoJ3VwZGF0ZTptb2RlbFZhbHVlJywgdilcIlxyXG4gID5cclxuICAgIDxuLWNhcmRcclxuICAgICAgOmJvcmRlcmVkPVwiZmFsc2VcIlxyXG4gICAgICA6Y29udGVudC1zdHlsZT1cIntcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgbWluSGVpZ2h0OiAwLFxyXG4gICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgICAgfVwiXHJcbiAgICAgIGNsYXNzPVwib3ZlcmZsb3ctaGlkZGVuXCJcclxuICAgICAgc3R5bGU9XCJcclxuICAgICAgICBtYXgtd2lkdGg6IDU2cmVtO1xyXG4gICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgIGhlaWdodDogbWluKDg1ZHZoLCBjYWxjKDEwMGR2aCAtIDJyZW0pKTtcclxuICAgICAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMGR2aCAtIDJyZW0pO1xyXG4gICAgICBcIlxyXG4gICAgPlxyXG4gICAgICA8dGVtcGxhdGUgI2hlYWRlcj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiaC0xNCB3LTE0IHJvdW5kZWQtZnVsbCBiZy1ncmFkaWVudC10by1iciBmcm9tLXByaW1hcnkvMjAgdG8tcHJpbWFyeS8xMCB0ZXh0LXByaW1hcnkgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LWlubmVyXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS13aW5kb3ctcmVzdG9yZVwiIDpzaXplPVwiMjRcIiAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2xcIj5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteGwgZm9udC1zZW1pYm9sZFwiPnt7XHJcbiAgICAgICAgICAgICAgICBmb3JtLmluZGV4ID09PSAtMSA/ICdBZGQgQXBwbGljYXRpb24nIDogJ0VkaXQgQXBwbGljYXRpb24nXHJcbiAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2hyaW5rLTBcIj5cclxuICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICB2LWlmPVwiaXNQbGF5bml0ZU1hbmFnZWRcIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHB4LTIgcHktMC41IHJvdW5kZWQgYmctcHJpbWFyeS8xNSB0ZXh0LXByaW1hcnkgdGV4dC14cyBmb250LXNlbWlib2xkXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFBsYXluaXRlXHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICB2LWVsc2VcclxuICAgICAgICAgICAgICBjbGFzcz1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBweC0yIHB5LTAuNSByb3VuZGVkIGJnLWRhcmsvMTAgZGFyazpiZy1saWdodC8xMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGRcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgQ3VzdG9tXHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIHJlZj1cImJvZHlSZWZcIlxyXG4gICAgICAgIGNsYXNzPVwicmVsYXRpdmUgZmxleC0xIG1pbi1oLTAgb3ZlcmZsb3ctYXV0byBwci0xXCJcclxuICAgICAgICBzdHlsZT1cInBhZGRpbmctYm90dG9tOiBjYWxjKGVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tKSArIDAuNXJlbSlcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPCEtLSBTY3JvbGwgYWZmb3JkYW5jZSBzaGFkb3dzOiBhcHBlYXIgd2hlbiBtb3JlIGNvbnRlbnQgaXMgYXZhaWxhYmxlIC0tPlxyXG4gICAgICAgIDxkaXYgdi1pZj1cInNob3dUb3BTaGFkb3dcIiBjbGFzcz1cInNjcm9sbC1zaGFkb3ctdG9wXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9kaXY+XHJcbiAgICAgICAgPGRpdiB2LWlmPVwic2hvd0JvdHRvbVNoYWRvd1wiIGNsYXNzPVwic2Nyb2xsLXNoYWRvdy1ib3R0b21cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2Rpdj5cclxuXHJcbiAgICAgICAgPGZvcm1cclxuICAgICAgICAgIGNsYXNzPVwic3BhY2UteS02IHRleHQtc21cIlxyXG4gICAgICAgICAgQHN1Ym1pdC5wcmV2ZW50PVwic2F2ZVwiXHJcbiAgICAgICAgICBAa2V5ZG93bi5jdHJsLmVudGVyLnN0b3AucHJldmVudD1cInNhdmVcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxBcHBFZGl0QmFzaWNzU2VjdGlvblxyXG4gICAgICAgICAgICB2LW1vZGVsOmZvcm09XCJmb3JtXCJcclxuICAgICAgICAgICAgdi1tb2RlbDpjbWQtdGV4dD1cImNtZFRleHRcIlxyXG4gICAgICAgICAgICB2LW1vZGVsOm5hbWUtc2VsZWN0LXZhbHVlPVwibmFtZVNlbGVjdFZhbHVlXCJcclxuICAgICAgICAgICAgdi1tb2RlbDpzZWxlY3RlZC1wbGF5bml0ZS1pZD1cInNlbGVjdGVkUGxheW5pdGVJZFwiXHJcbiAgICAgICAgICAgIDppcy1wbGF5bml0ZT1cImlzUGxheW5pdGVNYW5hZ2VkXCJcclxuICAgICAgICAgICAgOnNob3ctcGxheW5pdGUtcGlja2VyPVwic2hvd1BsYXluaXRlUGlja2VyXCJcclxuICAgICAgICAgICAgOnBsYXluaXRlLWluc3RhbGxlZD1cInBsYXluaXRlSW5zdGFsbGVkXCJcclxuICAgICAgICAgICAgOm5hbWUtc2VsZWN0LW9wdGlvbnM9XCJuYW1lU2VsZWN0T3B0aW9uc1wiXHJcbiAgICAgICAgICAgIDpnYW1lcy1sb2FkaW5nPVwiZ2FtZXNMb2FkaW5nXCJcclxuICAgICAgICAgICAgOmZhbGxiYWNrLW9wdGlvbj1cImZhbGxiYWNrT3B0aW9uXCJcclxuICAgICAgICAgICAgOnBsYXluaXRlLW9wdGlvbnM9XCJwbGF5bml0ZU9wdGlvbnNcIlxyXG4gICAgICAgICAgICA6bG9jay1wbGF5bml0ZT1cImxvY2tQbGF5bml0ZVwiXHJcbiAgICAgICAgICAgIDpuYW1lLWVycm9yPVwibmFtZUVycm9yXCJcclxuICAgICAgICAgICAgQG5hbWUtZm9jdXM9XCJvbk5hbWVGb2N1c1wiXHJcbiAgICAgICAgICAgIEBuYW1lLWJsdXI9XCJ2YWxpZGF0ZU5hbWVcIlxyXG4gICAgICAgICAgICBAbmFtZS1zZWFyY2g9XCJvbk5hbWVTZWFyY2hcIlxyXG4gICAgICAgICAgICBAbmFtZS1waWNrZWQ9XCJvbk5hbWVQaWNrZWRcIlxyXG4gICAgICAgICAgICBAbG9hZC1wbGF5bml0ZS1nYW1lcz1cImxvYWRQbGF5bml0ZUdhbWVzXCJcclxuICAgICAgICAgICAgQHBpY2stcGxheW5pdGU9XCJvblBpY2tQbGF5bml0ZVwiXHJcbiAgICAgICAgICAgIEB1bmxvY2stcGxheW5pdGU9XCJ1bmxvY2tQbGF5bml0ZVwiXHJcbiAgICAgICAgICAgIEBvcGVuLWNvdmVyLWZpbmRlcj1cIm9wZW5Db3ZlckZpbmRlclwiXHJcbiAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cInJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHB4LTMgcGItMyBwdC0xXCI+XHJcbiAgICAgICAgICAgIDxsZWdlbmQgY2xhc3M9XCJweC0xIHRleHQteHMgZm9udC1zZW1pYm9sZCBvcGFjaXR5LTYwXCI+QXBwIEJlaGF2aW9yPC9sZWdlbmQ+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0yIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgPG4tY2hlY2tib3ggdi1tb2RlbDpjaGVja2VkPVwiZm9ybS5leGNsdWRlR2xvYmFsUHJlcENtZFwiIHNpemU9XCJzbWFsbFwiPlxyXG4gICAgICAgICAgICAgICAgRXhjbHVkZSBHbG9iYWwgUHJlcFxyXG4gICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgICA8bi1jaGVja2JveCB2LWlmPVwiIWlzUGxheW5pdGVNYW5hZ2VkXCIgdi1tb2RlbDpjaGVja2VkPVwiZm9ybS5hdXRvRGV0YWNoXCIgc2l6ZT1cInNtYWxsXCI+XHJcbiAgICAgICAgICAgICAgICBBdXRvIERldGFjaFxyXG4gICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgICA8bi1jaGVja2JveCB2LWlmPVwiIWlzUGxheW5pdGVNYW5hZ2VkXCIgdi1tb2RlbDpjaGVja2VkPVwiZm9ybS53YWl0QWxsXCIgc2l6ZT1cInNtYWxsXCI+XHJcbiAgICAgICAgICAgICAgICBXYWl0IEFsbFxyXG4gICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgICA8bi1jaGVja2JveFxyXG4gICAgICAgICAgICAgICAgdi1pZj1cImlzV2luZG93cyAmJiAhaXNQbGF5bml0ZU1hbmFnZWRcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDpjaGVja2VkPVwiZm9ybS5lbGV2YXRlZFwiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIEVsZXZhdGVkXHJcbiAgICAgICAgICAgICAgPC9uLWNoZWNrYm94PlxyXG4gICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cImZvcm0udGVybWluYXRlT25QYXVzZVwiIHNpemU9XCJzbWFsbFwiPlxyXG4gICAgICAgICAgICAgICAgVGVybWluYXRlIE9uIFBhdXNlXHJcbiAgICAgICAgICAgICAgPC9uLWNoZWNrYm94PlxyXG4gICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cImZvcm0uYWxsb3dDbGllbnRDb21tYW5kc1wiIHNpemU9XCJzbWFsbFwiIGNsYXNzPVwibWQ6Y29sLXNwYW4tMlwiPlxyXG4gICAgICAgICAgICAgICAgQWxsb3cgQ2xpZW50IENvbW1hbmRzXHJcbiAgICAgICAgICAgICAgPC9uLWNoZWNrYm94PlxyXG4gICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cImZvcm0udXNlQXBwSWRlbnRpdHlcIiBzaXplPVwic21hbGxcIj5cclxuICAgICAgICAgICAgICAgIFVzZSBBcHAgSWRlbnRpdHlcclxuICAgICAgICAgICAgICA8L24tY2hlY2tib3g+XHJcbiAgICAgICAgICAgICAgPG4tY2hlY2tib3hcclxuICAgICAgICAgICAgICAgIHYtaWY9XCJmb3JtLnVzZUFwcElkZW50aXR5XCJcclxuICAgICAgICAgICAgICAgIHYtbW9kZWw6Y2hlY2tlZD1cImZvcm0ucGVyQ2xpZW50QXBwSWRlbnRpdHlcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWQ6Y29sLXNwYW4tMlwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgUGVyLWNsaWVudCBBcHAgSWRlbnRpdHlcclxuICAgICAgICAgICAgICA8L24tY2hlY2tib3g+XHJcbiAgICAgICAgICAgICAgPG4tY2hlY2tib3hcclxuICAgICAgICAgICAgICAgIHYtaWY9XCJpc1dpbmRvd3NcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDpjaGVja2VkPVwiZGlzcGxheU92ZXJyaWRlRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJtZDpjb2wtc3Bhbi0yXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3Bhbj57eyB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X3RvZ2dsZV9sYWJlbCcpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfdG9nZ2xlX2hpbnQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L24tY2hlY2tib3g+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgIHYtaWY9XCJpc1dpbmRvd3MgJiYgZGlzcGxheU92ZXJyaWRlRW5hYmxlZFwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwic3BhY2UteS01IHJvdW5kZWQteGwgYmctbGlnaHQvNjAgZGFyazpiZy1kYXJrLzQwIHAtNFwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9vdmVycmlkZV9sYWJlbCcpIH19XHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj57eyB0KCdjb25maWcuYXBwX2Rpc3BsYXlfb3ZlcnJpZGVfaGludCcpIH19PC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvLWdyb3VwIHYtbW9kZWw6dmFsdWU9XCJkaXNwbGF5U2VsZWN0aW9uXCIgY2xhc3M9XCJncmlkIGdhcC0zIHNtOmdyaWQtY29scy0yXCI+XHJcbiAgICAgICAgICAgICAgICA8bi1yYWRpbyB2YWx1ZT1cInZpcnR1YWxcIiBjbGFzcz1cImFwcC1yYWRpby1jYXJkIGN1cnNvci1wb2ludGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYXBwLXJhZGlvLWNhcmQtdGl0bGVcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgIHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9vdmVycmlkZV92aXJ0dWFsJylcclxuICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L24tcmFkaW8+XHJcbiAgICAgICAgICAgICAgICA8bi1yYWRpbyB2YWx1ZT1cInBoeXNpY2FsXCIgY2xhc3M9XCJhcHAtcmFkaW8tY2FyZCBjdXJzb3ItcG9pbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFwcC1yYWRpby1jYXJkLXRpdGxlXCI+e3tcclxuICAgICAgICAgICAgICAgICAgICB0KCdjb25maWcuYXBwX2Rpc3BsYXlfb3ZlcnJpZGVfcGh5c2ljYWwnKVxyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvbi1yYWRpbz5cclxuICAgICAgICAgICAgICA8L24tcmFkaW8tZ3JvdXA+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiB2LWlmPVwiZGlzcGxheVNlbGVjdGlvbiA9PT0gJ3BoeXNpY2FsJ1wiIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuYXBwX2Rpc3BsYXlfcGh5c2ljYWxfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJ0aW55XCJcclxuICAgICAgICAgICAgICAgICAgdGVydGlhcnlcclxuICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJkaXNwbGF5RGV2aWNlc0xvYWRpbmdcIlxyXG4gICAgICAgICAgICAgICAgICBAY2xpY2s9XCJsb2FkRGlzcGxheURldmljZXNcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdfY29tbW9uLnJlZnJlc2gnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPnt7IHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9waHlzaWNhbF9oaW50JykgfX08L3A+XHJcbiAgICAgICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwicGh5c2ljYWxPdXRwdXRNb2RlbFwiXHJcbiAgICAgICAgICAgICAgICA6b3B0aW9ucz1cImRpc3BsYXlEZXZpY2VPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwiZGlzcGxheURldmljZXNMb2FkaW5nXCJcclxuICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cInQoJ2NvbmZpZy5hcHBfZGlzcGxheV9waHlzaWNhbF9wbGFjZWhvbGRlcicpXCJcclxuICAgICAgICAgICAgICAgIGZpbHRlcmFibGVcclxuICAgICAgICAgICAgICAgIGNsZWFyYWJsZVxyXG4gICAgICAgICAgICAgICAgQGZvY3VzPVwib25EaXNwbGF5U2VsZWN0Rm9jdXNcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImRpc3BsYXlEZXZpY2VzRXJyb3JcIiBjbGFzcz1cInRleHQtcmVkLTUwMFwiPnt7XHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlEZXZpY2VzRXJyb3JcclxuICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlPnt7IHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9waHlzaWNhbF9zdGF0dXNfaGludCcpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgdi1pZj1cImRpc3BsYXlTZWxlY3Rpb24gPT09ICdwaHlzaWNhbCdcIiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLmRkX2NvbmZpZ19sYWJlbCcpIH19XHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICAgICAgdi1pZj1cImZvcm0uZGRDb25maWd1cmF0aW9uT3B0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInRpbnlcIlxyXG4gICAgICAgICAgICAgICAgICB0ZXJ0aWFyeVxyXG4gICAgICAgICAgICAgICAgICBAY2xpY2s9XCJmb3JtLmRkQ29uZmlndXJhdGlvbk9wdGlvbiA9IG51bGxcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuYXBwX3ZpcnR1YWxfZGlzcGxheV9tb2RlX3Jlc2V0JykgfX1cclxuICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj57eyB0KCdjb25maWcuZGRfY29uZmlnX2hpbnQnKSB9fTwvcD5cclxuICAgICAgICAgICAgICA8bi1yYWRpby1ncm91cCB2LW1vZGVsOnZhbHVlPVwiZGRDb25maWd1cmF0aW9uTW9kZWxcIiBjbGFzcz1cImdyaWQgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxuLXJhZGlvXHJcbiAgICAgICAgICAgICAgICAgIHYtZm9yPVwib3B0IGluIGFwcERkQ29uZmlndXJhdGlvbk9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICA6a2V5PVwib3B0LnZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgOnZhbHVlPVwib3B0LnZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgOmxhYmVsPVwib3B0LmxhYmVsXCJcclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPC9uLXJhZGlvLWdyb3VwPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICB2LWlmPVwiZGlzcGxheVNlbGVjdGlvbiA9PT0gJ3ZpcnR1YWwnXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cInNwYWNlLXktNSByb3VuZGVkLXhsIGJnLWxpZ2h0LzQwIGRhcms6YmctZGFyay80MCBwLTMgbWQ6cC00XCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5hcHBfdmlydHVhbF9kaXNwbGF5X21vZGVfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIHYtaWY9XCJmb3JtLnZpcnR1YWxEaXNwbGF5TW9kZSAhPT0gbnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInRpbnlcIlxyXG4gICAgICAgICAgICAgICAgICAgIHRlcnRpYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiZm9ybS52aXJ0dWFsRGlzcGxheU1vZGUgPSBudWxsXCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5hcHBfdmlydHVhbF9kaXNwbGF5X21vZGVfcmVzZXQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuYXBwX3ZpcnR1YWxfZGlzcGxheV9tb2RlX2hpbnQnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvLWdyb3VwXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiYXBwVmlydHVhbERpc3BsYXlNb2RlU2VsZWN0aW9uXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiZ3JpZCBnYXAtMyBzbTpncmlkLWNvbHMtM1wiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPG4tcmFkaW9cclxuICAgICAgICAgICAgICAgICAgdi1mb3I9XCJvcHRpb24gaW4gYXBwVmlydHVhbERpc3BsYXlNb2RlT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgIDprZXk9XCJTdHJpbmcob3B0aW9uLnZhbHVlKVwiXHJcbiAgICAgICAgICAgICAgICAgIDp2YWx1ZT1cIm9wdGlvbi52YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYXBwLXJhZGlvLWNhcmQgY3Vyc29yLXBvaW50ZXJcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFwcC1yYWRpby1jYXJkLXRpdGxlXCI+e3sgb3B0aW9uLmxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9uLXJhZGlvPlxyXG4gICAgICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICB2LWlmPVwiYXBwVmlydHVhbERpc3BsYXlNb2RlU2VsZWN0aW9uID09PSAnZ2xvYmFsJ1wiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLmFwcF92aXJ0dWFsX2Rpc3BsYXlfbW9kZV9mb2xsb3dfZ2xvYmFsJykgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIHYtaWY9XCJmb3JtLnZpcnR1YWxEaXNwbGF5TGF5b3V0ICE9PSBudWxsXCJcclxuICAgICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgICAgdGVydGlhcnlcclxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJmb3JtLnZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gbnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuYXBwX3ZpcnR1YWxfZGlzcGxheV9sYXlvdXRfcmVzZXQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPnt7IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2hpbnQnKSB9fTwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8bi1yYWRpby1ncm91cFxyXG4gICAgICAgICAgICAgICAgOnZhbHVlPVwicmVzb2x2ZWRWaXJ0dWFsRGlzcGxheUxheW91dFwiXHJcbiAgICAgICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwiXHJcbiAgICAgICAgICAgICAgICAgICh2KSA9PiAoZm9ybS52aXJ0dWFsRGlzcGxheUxheW91dCA9IHYgPT09IGdsb2JhbFZpcnR1YWxEaXNwbGF5TGF5b3V0ID8gbnVsbCA6IHYpXHJcbiAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJzcGFjZS15LTRcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgdi1mb3I9XCJvcHRpb24gaW4gYXBwVmlydHVhbERpc3BsYXlMYXlvdXRPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgOmtleT1cIm9wdGlvbi52YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZmxleCBmbGV4LWNvbCBjdXJzb3ItcG9pbnRlciBweS0yIHB4LTIgcm91bmRlZC1tZCBob3ZlcjpiZy1zdXJmYWNlLzEwXCJcclxuICAgICAgICAgICAgICAgICAgQGNsaWNrPVwic2VsZWN0VmlydHVhbERpc3BsYXlMYXlvdXQob3B0aW9uLnZhbHVlKVwiXHJcbiAgICAgICAgICAgICAgICAgIEBrZXlkb3duLmVudGVyLnByZXZlbnQ9XCJzZWxlY3RWaXJ0dWFsRGlzcGxheUxheW91dChvcHRpb24udmFsdWUpXCJcclxuICAgICAgICAgICAgICAgICAgQGtleWRvd24uc3BhY2UucHJldmVudD1cInNlbGVjdFZpcnR1YWxEaXNwbGF5TGF5b3V0KG9wdGlvbi52YWx1ZSlcIlxyXG4gICAgICAgICAgICAgICAgICB0YWJpbmRleD1cIjBcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bi1yYWRpbyA6dmFsdWU9XCJvcHRpb24udmFsdWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zbSBmb250LXNlbWlib2xkXCI+e3sgb3B0aW9uLmxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1zbnVnIG1sLTZcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEFkdmFuY2VkIHNldHRpbmdzIHRvZ2dsZSAtLT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwdC0xXCI+XHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgdGV4dC14cyBmb250LW1lZGl1bSBvcGFjaXR5LTYwIGhvdmVyOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eSBweC0zIHB5LTEuNSByb3VuZGVkLWxnIGhvdmVyOmJnLWRhcmsvNSBkYXJrOmhvdmVyOmJnLWxpZ2h0LzVcIlxyXG4gICAgICAgICAgICAgIEBjbGljaz1cInNob3dBZHZhbmNlZCA9ICFzaG93QWR2YW5jZWRcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cInctMy41IGgtMy41IHRyYW5zaXRpb24tdHJhbnNmb3JtXCIgOmNsYXNzPVwic2hvd0FkdmFuY2VkID8gJ3JvdGF0ZS0xODAnIDogJydcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBhcmlhLWhpZGRlbj5cclxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNiA5bDYgNiA2LTZcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIvPlxyXG4gICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgIHt7IHNob3dBZHZhbmNlZCA/ICdIaWRlIGFkdmFuY2VkJyA6ICdTaG93IGFkdmFuY2VkJyB9fVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwic2hvd0FkdmFuY2VkXCI+XHJcbiAgICAgICAgICAgIDxBcHBFZGl0Q29uZmlnT3ZlcnJpZGVzU2VjdGlvblxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6b3ZlcnJpZGVzPVwiZm9ybS5jb25maWdPdmVycmlkZXNcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6cGlja2VyLW9wZW49XCJvdmVycmlkZXNQaWNrZXJPcGVuXCJcclxuICAgICAgICAgICAgLz5cclxuXHJcbiAgICAgICAgICAgIDxBcHBFZGl0RnJhbWVHZW5TZWN0aW9uXHJcbiAgICAgICAgICAgICAgdi1pZj1cImlzV2luZG93c1wiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDptb2RlPVwiZnJhbWVHZW5lcmF0aW9uU2VsZWN0aW9uXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmdlbjE9XCJmb3JtLmdlbjFGcmFtZWdlbkZpeFwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDpnZW4yPVwiZm9ybS5nZW4yRnJhbWVnZW5GaXhcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6bG9zc2xlc3MtcHJvZmlsZT1cImZvcm0ubG9zc2xlc3NTY2FsaW5nUHJvZmlsZVwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDpsb3NzbGVzcy10YXJnZXQtZnBzPVwiZm9ybS5sb3NzbGVzc1NjYWxpbmdUYXJnZXRGcHNcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6bG9zc2xlc3MtcnRzcy1saW1pdD1cImZvcm0ubG9zc2xlc3NTY2FsaW5nUnRzc0xpbWl0XCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmxvc3NsZXNzLWZsb3ctc2NhbGU9XCJsb3NzbGVzc0Zsb3dTY2FsZU1vZGVsXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmxvc3NsZXNzLWxhdW5jaC1kZWxheT1cImZvcm0ubG9zc2xlc3NTY2FsaW5nTGF1bmNoRGVsYXlcIlxyXG4gICAgICAgICAgICAgIDpoZWFsdGg9XCJmcmFtZUdlbkhlYWx0aFwiXHJcbiAgICAgICAgICAgICAgOmhlYWx0aC1sb2FkaW5nPVwiZnJhbWVHZW5IZWFsdGhMb2FkaW5nXCJcclxuICAgICAgICAgICAgICA6aGVhbHRoLWVycm9yPVwiZnJhbWVHZW5IZWFsdGhFcnJvclwiXHJcbiAgICAgICAgICAgICAgOmxvc3NsZXNzLWFjdGl2ZT1cImxvc3NsZXNzRnJhbWVHZW5FbmFibGVkXCJcclxuICAgICAgICAgICAgICA6bnZpZGlhLWFjdGl2ZT1cIm52aWRpYUZyYW1lR2VuRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgOnVzaW5nLXZpcnR1YWwtZGlzcGxheT1cInVzaW5nVmlydHVhbERpc3BsYXlcIlxyXG4gICAgICAgICAgICAgIDpoYXMtYWN0aXZlLWxvc3NsZXNzLW92ZXJyaWRlcz1cImhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzXCJcclxuICAgICAgICAgICAgICA6b24tbG9zc2xlc3MtcnRzcy1saW1pdC1jaGFuZ2U9XCJvbkxvc3NsZXNzUnRzc0xpbWl0Q2hhbmdlXCJcclxuICAgICAgICAgICAgICA6cmVzZXQtYWN0aXZlLWxvc3NsZXNzLXByb2ZpbGU9XCJyZXNldEFjdGl2ZUxvc3NsZXNzUHJvZmlsZVwiXHJcbiAgICAgICAgICAgICAgQHJlZnJlc2gtaGVhbHRoPVwiaGFuZGxlRnJhbWVHZW5IZWFsdGhSZXF1ZXN0XCJcclxuICAgICAgICAgICAgICBAZW5hYmxlLXZpcnR1YWwtc2NyZWVuPVwiaGFuZGxlRW5hYmxlVmlydHVhbFNjcmVlblwiXHJcbiAgICAgICAgICAgIC8+XHJcblxyXG4gICAgICAgICAgICA8QXBwRWRpdExvc3NsZXNzU2NhbGluZ1NlY3Rpb25cclxuICAgICAgICAgICAgICB2LWlmPVwiaXNXaW5kb3dzXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmZvcm09XCJmb3JtXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmxvc3NsZXNzLXBlcmZvcm1hbmNlLW1vZGU9XCJsb3NzbGVzc1BlcmZvcm1hbmNlTW9kZU1vZGVsXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmxvc3NsZXNzLXJlc29sdXRpb24tc2NhbGU9XCJsb3NzbGVzc1Jlc29sdXRpb25TY2FsZU1vZGVsXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsOmxvc3NsZXNzLXNjYWxpbmctbW9kZT1cImxvc3NsZXNzU2NhbGluZ01vZGVNb2RlbFwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbDpsb3NzbGVzcy1zaGFycGVuaW5nPVwibG9zc2xlc3NTaGFycGVuaW5nTW9kZWxcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6bG9zc2xlc3MtYW5pbWUtc2l6ZT1cImxvc3NsZXNzQW5pbWVTaXplTW9kZWxcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw6bG9zc2xlc3MtYW5pbWUtdnJzPVwibG9zc2xlc3NBbmltZVZyc01vZGVsXCJcclxuICAgICAgICAgICAgICA6aXMtcGxheW5pdGUtbWFuYWdlZD1cImlzUGxheW5pdGVNYW5hZ2VkXCJcclxuICAgICAgICAgICAgICA6c2hvdy1sb3NzbGVzcy1yZXNvbHV0aW9uPVwic2hvd0xvc3NsZXNzUmVzb2x1dGlvblwiXHJcbiAgICAgICAgICAgICAgOnNob3ctbG9zc2xlc3Mtc2hhcnBlbmluZz1cInNob3dMb3NzbGVzc1NoYXJwZW5pbmdcIlxyXG4gICAgICAgICAgICAgIDpzaG93LWxvc3NsZXNzLWFuaW1lLW9wdGlvbnM9XCJzaG93TG9zc2xlc3NBbmltZU9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgIDpoYXMtYWN0aXZlLWxvc3NsZXNzLW92ZXJyaWRlcz1cImhhc0FjdGl2ZUxvc3NsZXNzT3ZlcnJpZGVzXCJcclxuICAgICAgICAgICAgICA6bG9zc2xlc3MtZXhlY3V0YWJsZS1kZXRlY3RlZD1cImxvc3NsZXNzRXhlY3V0YWJsZURldGVjdGVkXCJcclxuICAgICAgICAgICAgICA6bG9zc2xlc3MtZXhlY3V0YWJsZS1jaGVjay1jb21wbGV0ZT1cImxvc3NsZXNzRXhlY3V0YWJsZUNoZWNrQ29tcGxldGVcIlxyXG4gICAgICAgICAgICAgIDpyZXNldC1hY3RpdmUtbG9zc2xlc3MtcHJvZmlsZT1cInJlc2V0QWN0aXZlTG9zc2xlc3NQcm9maWxlXCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvdGVtcGxhdGU+XHJcblxyXG4gICAgICAgICAgPEFwcEVkaXRQcmVwQ29tbWFuZHNTZWN0aW9uXHJcbiAgICAgICAgICAgIHYtbW9kZWw6Zm9ybT1cImZvcm1cIlxyXG4gICAgICAgICAgICA6aXMtd2luZG93cz1cImlzV2luZG93c1wiXHJcbiAgICAgICAgICAgIEBhZGQtcHJlcD1cImFkZFByZXBcIlxyXG4gICAgICAgICAgLz5cclxuXHJcbiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgICAgPGgzIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgIFN0YXRlIENvbW1hbmRzXHJcbiAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdHlwZT1cInByaW1hcnlcIiBAY2xpY2s9XCJhZGRTdGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdXNcIiA6c2l6ZT1cIjE0XCIgLz4gQWRkXHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cImZvcm0uZXhjbHVkZUdsb2JhbFN0YXRlQ21kXCIgc2l6ZT1cInNtYWxsXCI+XHJcbiAgICAgICAgICAgICAgRXhjbHVkZSBHbG9iYWwgU3RhdGUgQ29tbWFuZHNcclxuICAgICAgICAgICAgPC9uLWNoZWNrYm94PlxyXG4gICAgICAgICAgICA8ZGl2IHYtaWY9XCJmb3JtLnN0YXRlQ21kLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+Tm9uZTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1mb3I9XCIocywgaSkgaW4gZm9ybS5zdGF0ZUNtZFwiIDprZXk9XCJgc3RhdGUtJHtpfWBcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLW1kIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTIgbWItMlwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+U3RlcCB7eyBpICsgMSB9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bi1jaGVja2JveCB2LWlmPVwiaXNXaW5kb3dzXCIgdi1tb2RlbDpjaGVja2VkPVwicy5lbGV2YXRlZFwiIHNpemU9XCJzbWFsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgRWxldmF0ZWRcclxuICAgICAgICAgICAgICAgICAgICA8L24tY2hlY2tib3g+XHJcbiAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJlcnJvclwiIHN0cm9uZyBAY2xpY2s9XCJmb3JtLnN0YXRlQ21kLnNwbGljZShpLCAxKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRyYXNoXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0xIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+RG8gQ29tbWFuZDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgPG4taW5wdXQgdi1tb2RlbDp2YWx1ZT1cInMuZG9cIiB0eXBlPVwidGV4dGFyZWFcIiA6YXV0b3NpemU9XCJ7IG1pblJvd3M6IDEsIG1heFJvd3M6IDMgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZvbnQtbW9ub1wiIHBsYWNlaG9sZGVyPVwiQ29tbWFuZCB0byBydW4gd2hlbiBzdHJlYW0gc3RhcnRzXCIgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+VW5kbyBDb21tYW5kPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICA8bi1pbnB1dCB2LW1vZGVsOnZhbHVlPVwicy51bmRvXCIgdHlwZT1cInRleHRhcmVhXCIgOmF1dG9zaXplPVwieyBtaW5Sb3dzOiAxLCBtYXhSb3dzOiAzIH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb250LW1vbm9cIiBwbGFjZWhvbGRlcj1cIkNvbW1hbmQgdG8gcnVuIHdoZW4gc3RyZWFtIHN0b3BzXCIgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L3NlY3Rpb24+XHJcblxyXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJzci1vbmx5XCI+XHJcbiAgICAgICAgICAgIDwhLS0gaGlkZGVuIHN1Ym1pdCB0byBhbGxvdyBFbnRlciB0byBzYXZlIHdpdGhpbiBmaWVsZHMgLS0+XHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIHRhYmluZGV4PVwiLTFcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2J1dHRvbj5cclxuICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICA8L2Zvcm0+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPHRlbXBsYXRlICNmb290ZXI+XHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCB3LWZ1bGwgZ2FwLTIgYm9yZGVyLXQgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctbGlnaHQvODAgZGFyazpiZy1zdXJmYWNlLzgwIGJhY2tkcm9wLWJsdXIgcHgtMiBweS0yXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgQGNsaWNrPVwiY2xvc2VcIj57eyAkdCgnX2NvbW1vbi5jYW5jZWwnKSB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgdi1pZj1cImZvcm0uaW5kZXggIT09IC0xXCJcclxuICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgOmRpc2FibGVkPVwic2F2aW5nXCJcclxuICAgICAgICAgICAgQGNsaWNrPVwic2hvd0RlbGV0ZUNvbmZpcm0gPSB0cnVlXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRyYXNoXCIgOnNpemU9XCIxNlwiIC8+IHt7ICR0KCdhcHBzLmRlbGV0ZScpIH19XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHR5cGU9XCJwcmltYXJ5XCIgOmxvYWRpbmc9XCJzYXZpbmdcIiA6ZGlzYWJsZWQ9XCJzYXZpbmcgfHwgISFuYW1lRXJyb3JcIiBAY2xpY2s9XCJzYXZlXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zYXZlXCIgOnNpemU9XCIxNlwiIC8+IHt7ICR0KCdfY29tbW9uLnNhdmUnKSB9fVxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC90ZW1wbGF0ZT5cclxuXHJcbiAgICAgIDxBcHBFZGl0Q292ZXJNb2RhbFxyXG4gICAgICAgIHYtbW9kZWw6dmlzaWJsZT1cInNob3dDb3Zlck1vZGFsXCJcclxuICAgICAgICA6Y292ZXItc2VhcmNoaW5nPVwiY292ZXJTZWFyY2hpbmdcIlxyXG4gICAgICAgIDpjb3Zlci1idXN5PVwiY292ZXJCdXN5XCJcclxuICAgICAgICA6Y292ZXItY2FuZGlkYXRlcz1cImNvdmVyQ2FuZGlkYXRlc1wiXHJcbiAgICAgICAgQHBpY2s9XCJ1c2VDb3ZlclwiXHJcbiAgICAgIC8+XHJcblxyXG4gICAgICA8QXBwRWRpdERlbGV0ZUNvbmZpcm1Nb2RhbFxyXG4gICAgICAgIHYtbW9kZWw6dmlzaWJsZT1cInNob3dEZWxldGVDb25maXJtXCJcclxuICAgICAgICA6aXMtcGxheW5pdGUtYXV0bz1cImlzUGxheW5pdGVBdXRvXCJcclxuICAgICAgICA6bmFtZT1cImZvcm0ubmFtZSB8fCAnJ1wiXHJcbiAgICAgICAgQGNhbmNlbD1cInNob3dEZWxldGVDb25maXJtID0gZmFsc2VcIlxyXG4gICAgICAgIEBjb25maXJtPVwiZGVsXCJcclxuICAgICAgLz5cclxuICAgIDwvbi1jYXJkPlxyXG4gIDwvbi1tb2RhbD5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCByZWYsIHdhdGNoLCBvbk1vdW50ZWQsIG9uQmVmb3JlVW5tb3VudCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZU1lc3NhZ2UgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5pbXBvcnQgeyBOTW9kYWwsIE5DYXJkLCBOQnV0dG9uLCBOQ2hlY2tib3gsIE5SYWRpb0dyb3VwLCBOUmFkaW8sIE5TZWxlY3QgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuaW1wb3J0IHsgdXNlSTE4biB9IGZyb20gJ3Z1ZS1pMThuJztcclxuaW1wb3J0IHR5cGUge1xyXG4gIEFwcEZvcm0sXHJcbiAgU2VydmVyQXBwLFxyXG4gIFByZXBDbWQsXHJcbiAgTG9zc2xlc3NQcm9maWxlS2V5LFxyXG4gIExvc3NsZXNzU2NhbGluZ01vZGUsXHJcbiAgTG9zc2xlc3NQcm9maWxlT3ZlcnJpZGVzLFxyXG4gIEFuaW1lNGtTaXplLFxyXG4gIEZyYW1lR2VuZXJhdGlvblByb3ZpZGVyLFxyXG4gIEZyYW1lR2VuZXJhdGlvbk1vZGUsXHJcbiAgRnJhbWVHZW5IZWFsdGgsXHJcbiAgQXBwVmlydHVhbERpc3BsYXlNb2RlLFxyXG4gIEFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0LFxyXG59IGZyb20gJy4vYXBwLWVkaXQvdHlwZXMnO1xyXG5pbXBvcnQge1xyXG4gIExPU1NMRVNTX1BST0ZJTEVfREVGQVVMVFMsXHJcbiAgTE9TU0xFU1NfU0NBTElOR19TSEFSUEVOSU5HLFxyXG4gIGNsYW1wRmxvdyxcclxuICBjbGFtcFJlc29sdXRpb24sXHJcbiAgY2xhbXBTaGFycG5lc3MsXHJcbiAgZGVmYXVsdFJ0c3NGcm9tVGFyZ2V0LFxyXG4gIGVtcHR5TG9zc2xlc3NQcm9maWxlU3RhdGUsXHJcbiAgcGFyc2VGcmFtZUdlbmVyYXRpb25Nb2RlLFxyXG4gIG5vcm1hbGl6ZUZyYW1lR2VuZXJhdGlvblByb3ZpZGVyLFxyXG4gIHBhcnNlTG9zc2xlc3NPdmVycmlkZXMsXHJcbiAgcGFyc2VMb3NzbGVzc1Byb2ZpbGVLZXksXHJcbiAgcGFyc2VOdW1lcmljLFxyXG59IGZyb20gJy4vYXBwLWVkaXQvbG9zc2xlc3MnO1xyXG5pbXBvcnQgQXBwRWRpdEJhc2ljc1NlY3Rpb24gZnJvbSAnLi9hcHAtZWRpdC9BcHBFZGl0QmFzaWNzU2VjdGlvbi52dWUnO1xyXG5pbXBvcnQgQXBwRWRpdENvbmZpZ092ZXJyaWRlc1NlY3Rpb24gZnJvbSAnLi9hcHAtZWRpdC9BcHBFZGl0Q29uZmlnT3ZlcnJpZGVzU2VjdGlvbi52dWUnO1xyXG5pbXBvcnQgQXBwRWRpdExvc3NsZXNzU2NhbGluZ1NlY3Rpb24gZnJvbSAnLi9hcHAtZWRpdC9BcHBFZGl0TG9zc2xlc3NTY2FsaW5nU2VjdGlvbi52dWUnO1xyXG5pbXBvcnQgQXBwRWRpdFByZXBDb21tYW5kc1NlY3Rpb24gZnJvbSAnLi9hcHAtZWRpdC9BcHBFZGl0UHJlcENvbW1hbmRzU2VjdGlvbi52dWUnO1xyXG5pbXBvcnQgQXBwRWRpdEZyYW1lR2VuU2VjdGlvbiBmcm9tICcuL2FwcC1lZGl0L0FwcEVkaXRGcmFtZUdlblNlY3Rpb24udnVlJztcclxuaW1wb3J0IEFwcEVkaXRDb3Zlck1vZGFsLCB7IHR5cGUgQ292ZXJDYW5kaWRhdGUgfSBmcm9tICcuL2FwcC1lZGl0L0FwcEVkaXRDb3Zlck1vZGFsLnZ1ZSc7XHJcbmltcG9ydCBBcHBFZGl0RGVsZXRlQ29uZmlybU1vZGFsIGZyb20gJy4vYXBwLWVkaXQvQXBwRWRpdERlbGV0ZUNvbmZpcm1Nb2RhbC52dWUnO1xyXG50eXBlIERpc3BsYXlEZXZpY2UgPSB7XHJcbiAgZGV2aWNlX2lkPzogc3RyaW5nO1xyXG4gIGRpc3BsYXlfbmFtZT86IHN0cmluZztcclxuICBmcmllbmRseV9uYW1lPzogc3RyaW5nO1xyXG4gIGluZm8/OiB7XHJcbiAgICBhY3RpdmU/OiBib29sZWFuO1xyXG4gIH07XHJcbn07XHJcbnR5cGUgRGlzcGxheVNlbGVjdGlvbiA9ICdnbG9iYWwnIHwgJ3ZpcnR1YWwnIHwgJ3BoeXNpY2FsJztcclxudHlwZSBBcHBWaXJ0dWFsRGlzcGxheU1vZGVTZWxlY3Rpb24gPSBBcHBWaXJ0dWFsRGlzcGxheU1vZGUgfCAnZ2xvYmFsJztcclxuXHJcbmludGVyZmFjZSBBcHBFZGl0TW9kYWxQcm9wcyB7XHJcbiAgbW9kZWxWYWx1ZTogYm9vbGVhbjtcclxuICBhcHA/OiBTZXJ2ZXJBcHAgfCBudWxsO1xyXG4gIGluZGV4PzogbnVtYmVyO1xyXG59XHJcblxyXG5jb25zdCBTQ0FMRV9GQUNUT1JfTUlOID0gMjA7XHJcbmNvbnN0IFNDQUxFX0ZBQ1RPUl9NQVggPSAyMDA7XHJcblxyXG5jb25zdCBwcm9wcyA9IGRlZmluZVByb3BzPEFwcEVkaXRNb2RhbFByb3BzPigpO1xyXG5jb25zdCBlbWl0ID0gZGVmaW5lRW1pdHM8e1xyXG4gIChlOiAndXBkYXRlOm1vZGVsVmFsdWUnLCB2OiBib29sZWFuKTogdm9pZDtcclxuICAoZTogJ3NhdmVkJyk6IHZvaWQ7XHJcbiAgKGU6ICdkZWxldGVkJyk6IHZvaWQ7XHJcbn0+KCk7XHJcbmNvbnN0IG9wZW4gPSBjb21wdXRlZDxib29sZWFuPigoKSA9PiAhIXByb3BzLm1vZGVsVmFsdWUpO1xyXG5jb25zdCBtZXNzYWdlID0gdXNlTWVzc2FnZSgpO1xyXG5jb25zdCB7IHQgfSA9IHVzZUkxOG4oKTtcclxuZnVuY3Rpb24gZnJlc2goKTogQXBwRm9ybSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGluZGV4OiAtMSxcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgY21kOiAnJyxcclxuICAgIHdvcmtpbmdEaXI6ICcnLFxyXG4gICAgaW1hZ2VQYXRoOiAnJyxcclxuICAgIGV4Y2x1ZGVHbG9iYWxQcmVwQ21kOiBmYWxzZSxcclxuICAgIGV4Y2x1ZGVHbG9iYWxTdGF0ZUNtZDogZmFsc2UsXHJcbiAgICBjb25maWdPdmVycmlkZXM6IHt9LFxyXG4gICAgZWxldmF0ZWQ6IGZhbHNlLFxyXG4gICAgYXV0b0RldGFjaDogdHJ1ZSxcclxuICAgIHdhaXRBbGw6IHRydWUsXHJcbiAgICB0ZXJtaW5hdGVPblBhdXNlOiBmYWxzZSxcclxuICAgIGFsbG93Q2xpZW50Q29tbWFuZHM6IHRydWUsXHJcbiAgICB1c2VBcHBJZGVudGl0eTogZmFsc2UsXHJcbiAgICBwZXJDbGllbnRBcHBJZGVudGl0eTogZmFsc2UsXHJcbiAgICBnYW1lcGFkOiAnJyxcclxuICAgIHNjYWxlRmFjdG9yOiAxMDAsXHJcbiAgICBmcmFtZUdlbkxpbWl0ZXJGaXg6IGZhbHNlLFxyXG4gICAgZXhpdFRpbWVvdXQ6IDUsXHJcbiAgICBwcmVwQ21kOiBbXSxcclxuICAgIHN0YXRlQ21kOiBbXSxcclxuICAgIGRldGFjaGVkOiBbXSxcclxuICAgIHZpcnR1YWxTY3JlZW46IGZhbHNlLFxyXG4gICAgZ2VuMUZyYW1lZ2VuRml4OiBmYWxzZSxcclxuICAgIGdlbjJGcmFtZWdlbkZpeDogZmFsc2UsXHJcbiAgICBvdXRwdXQ6ICcnLFxyXG4gICAgZnJhbWVHZW5lcmF0aW9uUHJvdmlkZXI6ICdnYW1lLXByb3ZpZGVkJyxcclxuICAgIGZyYW1lR2VuZXJhdGlvbk1vZGU6ICdvZmYnLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nRW5hYmxlZDogZmFsc2UsXHJcbiAgICBsb3NzbGVzc1NjYWxpbmdUYXJnZXRGcHM6IG51bGwsXHJcbiAgICBsb3NzbGVzc1NjYWxpbmdSdHNzTGltaXQ6IG51bGwsXHJcbiAgICBsb3NzbGVzc1NjYWxpbmdSdHNzVG91Y2hlZDogZmFsc2UsXHJcbiAgICBsb3NzbGVzc1NjYWxpbmdQcm9maWxlOiAncmVjb21tZW5kZWQnLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nUHJvZmlsZXM6IGVtcHR5TG9zc2xlc3NQcm9maWxlU3RhdGUoKSxcclxuICAgIGxvc3NsZXNzU2NhbGluZ0xhdW5jaERlbGF5OiBudWxsLFxyXG4gICAgdmlydHVhbERpc3BsYXlNb2RlOiBudWxsLFxyXG4gICAgdmlydHVhbERpc3BsYXlMYXlvdXQ6IG51bGwsXHJcbiAgICBkZENvbmZpZ3VyYXRpb25PcHRpb246IG51bGwsXHJcbiAgfTtcclxufVxyXG5jb25zdCBmb3JtID0gcmVmPEFwcEZvcm0+KGZyZXNoKCkpO1xyXG5jb25zdCBvdmVycmlkZXNQaWNrZXJPcGVuID0gcmVmKGZhbHNlKTtcclxuXHJcbmNvbnN0IEFQUF9WSVJUVUFMX0RJU1BMQVlfTU9ERVM6IEFwcFZpcnR1YWxEaXNwbGF5TW9kZVtdID0gWydkaXNhYmxlZCcsICdwZXJfY2xpZW50JywgJ3NoYXJlZCddO1xyXG5jb25zdCBBUFBfVklSVFVBTF9ESVNQTEFZX0xBWU9VVFM6IEFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0W10gPSBbXHJcbiAgJ2V4Y2x1c2l2ZScsXHJcbiAgJ2V4dGVuZGVkJyxcclxuICAnZXh0ZW5kZWRfcHJpbWFyeScsXHJcbiAgJ2V4dGVuZGVkX2lzb2xhdGVkJyxcclxuICAnZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCcsXHJcbl07XHJcblxyXG5mdW5jdGlvbiBwYXJzZUFwcFZpcnR1YWxEaXNwbGF5TW9kZSh2YWx1ZTogdW5rbm93bik6IEFwcFZpcnR1YWxEaXNwbGF5TW9kZSB8IG51bGwge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChBUFBfVklSVFVBTF9ESVNQTEFZX01PREVTLmluY2x1ZGVzKG5vcm1hbGl6ZWQgYXMgQXBwVmlydHVhbERpc3BsYXlNb2RlKSkge1xyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQgYXMgQXBwVmlydHVhbERpc3BsYXlNb2RlO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VBcHBWaXJ0dWFsRGlzcGxheUxheW91dCh2YWx1ZTogdW5rbm93bik6IEFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0IHwgbnVsbCB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKEFQUF9WSVJUVUFMX0RJU1BMQVlfTEFZT1VUUy5pbmNsdWRlcyhub3JtYWxpemVkIGFzIEFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0KSkge1xyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQgYXMgQXBwVmlydHVhbERpc3BsYXlMYXlvdXQ7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBmb3JtLnZhbHVlLnBsYXluaXRlSWQsXHJcbiAgKCkgPT4ge1xyXG4gICAgY29uc3QgZXQgPSBmb3JtLnZhbHVlLmV4aXRUaW1lb3V0IGFzIGFueTtcclxuICAgIGlmIChmb3JtLnZhbHVlLnBsYXluaXRlSWQgJiYgKHR5cGVvZiBldCAhPT0gJ251bWJlcicgfHwgZXQgPT09IDUpKSB7XHJcbiAgICAgIGZvcm0udmFsdWUuZXhpdFRpbWVvdXQgPSAxMDtcclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS51c2VBcHBJZGVudGl0eSxcclxuICAoZW5hYmxlZCkgPT4ge1xyXG4gICAgaWYgKCFlbmFibGVkKSB7XHJcbiAgICAgIGZvcm0udmFsdWUucGVyQ2xpZW50QXBwSWRlbnRpdHkgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS5zY2FsZUZhY3RvcixcclxuICAodmFsdWUpID0+IHtcclxuICAgIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFNjYWxlRmFjdG9yKFxyXG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IG51bGwsXHJcbiAgICApO1xyXG4gICAgaWYgKGNsYW1wZWQgIT09IHZhbHVlKSB7XHJcbiAgICAgIGZvcm0udmFsdWUuc2NhbGVGYWN0b3IgPSBjbGFtcGVkO1xyXG4gICAgfVxyXG4gIH0sXHJcbik7XHJcblxyXG5mdW5jdGlvbiBjbGFtcFNjYWxlRmFjdG9yKHZhbHVlOiBudW1iZXIgfCBudWxsKTogbnVtYmVyIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIDEwMDtcclxuICB9XHJcbiAgY29uc3Qgcm91bmRlZCA9IE1hdGgucm91bmQodmFsdWUpO1xyXG4gIHJldHVybiBNYXRoLm1pbihTQ0FMRV9GQUNUT1JfTUFYLCBNYXRoLm1heChTQ0FMRV9GQUNUT1JfTUlOLCByb3VuZGVkKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyb21TZXJ2ZXJBcHAoc3JjPzogU2VydmVyQXBwIHwgbnVsbCwgaWR4OiBudW1iZXIgPSAtMSk6IEFwcEZvcm0ge1xyXG4gIGNvbnN0IGJhc2UgPSBmcmVzaCgpO1xyXG4gIGlmICghc3JjKSByZXR1cm4geyAuLi5iYXNlLCBpbmRleDogaWR4IH07XHJcbiAgY29uc3QgY21kU3RyID0gQXJyYXkuaXNBcnJheShzcmMuY21kKSA/IHNyYy5jbWQuam9pbignICcpIDogKHNyYy5jbWQgPz8gJycpO1xyXG4gIGNvbnN0IHByZXAgPSBBcnJheS5pc0FycmF5KHNyY1sncHJlcC1jbWQnXSlcclxuICAgID8gc3JjWydwcmVwLWNtZCddLm1hcCgocCkgPT4gKHtcclxuICAgICAgICBkbzogU3RyaW5nKHA/LmRvID8/ICcnKSxcclxuICAgICAgICB1bmRvOiBTdHJpbmcocD8udW5kbyA/PyAnJyksXHJcbiAgICAgICAgZWxldmF0ZWQ6ICEhcD8uZWxldmF0ZWQsXHJcbiAgICAgIH0pKVxyXG4gICAgOiBbXTtcclxuICBjb25zdCBzdGF0ZSA9IEFycmF5LmlzQXJyYXkoc3JjWydzdGF0ZS1jbWQnXSlcclxuICAgID8gc3JjWydzdGF0ZS1jbWQnXS5tYXAoKHApID0+ICh7XHJcbiAgICAgIGRvOiBTdHJpbmcocD8uZG8gPz8gJycpLFxyXG4gICAgICB1bmRvOiBTdHJpbmcocD8udW5kbyA/PyAnJyksXHJcbiAgICAgIGVsZXZhdGVkOiAhIXA/LmVsZXZhdGVkLFxyXG4gICAgfSkpXHJcbiAgICA6IFtdO1xyXG4gIGNvbnN0IGlzUGxheW5pdGVMaW5rZWQgPSAhIXNyY1sncGxheW5pdGUtaWQnXTtcclxuICBjb25zdCBkZXJpdmVkRXhpdFRpbWVvdXQgPVxyXG4gICAgdHlwZW9mIHNyY1snZXhpdC10aW1lb3V0J10gPT09ICdudW1iZXInXHJcbiAgICAgID8gc3JjWydleGl0LXRpbWVvdXQnXVxyXG4gICAgICA6IGlzUGxheW5pdGVMaW5rZWRcclxuICAgICAgICA/IDEwXHJcbiAgICAgICAgOiBiYXNlLmV4aXRUaW1lb3V0O1xyXG4gIGNvbnN0IGxlZ2FjeUxvc3NsZXNzRmxhZyA9ICEhc3JjWydsb3NzbGVzcy1zY2FsaW5nLWZyYW1lZ2VuJ107XHJcbiAgY29uc3QgbHNUYXJnZXQgPSBwYXJzZU51bWVyaWMoc3JjWydsb3NzbGVzcy1zY2FsaW5nLXRhcmdldC1mcHMnXSk7XHJcbiAgY29uc3QgbHNMaW1pdCA9IHBhcnNlTnVtZXJpYyhzcmNbJ2xvc3NsZXNzLXNjYWxpbmctcnRzcy1saW1pdCddKTtcclxuICBjb25zdCBsc0xhdW5jaERlbGF5UmF3ID0gcGFyc2VOdW1lcmljKHNyY1snbG9zc2xlc3Mtc2NhbGluZy1sYXVuY2gtZGVsYXknXSk7XHJcbiAgY29uc3QgbHNMYXVuY2hEZWxheSA9XHJcbiAgICBsc0xhdW5jaERlbGF5UmF3ICYmIGxzTGF1bmNoRGVsYXlSYXcgPiAwID8gTWF0aC5yb3VuZChsc0xhdW5jaERlbGF5UmF3KSA6IG51bGw7XHJcbiAgY29uc3QgcHJvZmlsZUtleSA9IHBhcnNlTG9zc2xlc3NQcm9maWxlS2V5KHNyY1snbG9zc2xlc3Mtc2NhbGluZy1wcm9maWxlJ10pO1xyXG4gIGNvbnN0IGxvc3NsZXNzUHJvZmlsZXMgPSBlbXB0eUxvc3NsZXNzUHJvZmlsZVN0YXRlKCk7XHJcbiAgbG9zc2xlc3NQcm9maWxlcy5yZWNvbW1lbmRlZCA9IHBhcnNlTG9zc2xlc3NPdmVycmlkZXMoc3JjWydsb3NzbGVzcy1zY2FsaW5nLXJlY29tbWVuZGVkJ10pO1xyXG4gIGxvc3NsZXNzUHJvZmlsZXMuY3VzdG9tID0gcGFyc2VMb3NzbGVzc092ZXJyaWRlcyhzcmNbJ2xvc3NsZXNzLXNjYWxpbmctY3VzdG9tJ10pO1xyXG4gIGNvbnN0IGZyYW1lR2VuZXJhdGlvbk1vZGVGcm9tQ29uZmlnID0gcGFyc2VGcmFtZUdlbmVyYXRpb25Nb2RlKFxyXG4gICAgKHNyYyBhcyBhbnkpPy5bJ2ZyYW1lLWdlbmVyYXRpb24tbW9kZSddLFxyXG4gICk7XHJcbiAgY29uc3QgdXNlQXBwSWRlbnRpdHkgPSAhIXNyY1sndXNlLWFwcC1pZGVudGl0eSddO1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWRQcm92aWRlciA9IG5vcm1hbGl6ZUZyYW1lR2VuZXJhdGlvblByb3ZpZGVyKHNyY1snZnJhbWUtZ2VuZXJhdGlvbi1wcm92aWRlciddKTtcclxuICBsZXQgZnJhbWVHZW5lcmF0aW9uTW9kZTogRnJhbWVHZW5lcmF0aW9uTW9kZSA9IGZyYW1lR2VuZXJhdGlvbk1vZGVGcm9tQ29uZmlnID8/ICdvZmYnO1xyXG4gIGlmICghZnJhbWVHZW5lcmF0aW9uTW9kZUZyb21Db25maWcpIHtcclxuICAgIGlmIChub3JtYWxpemVkUHJvdmlkZXIgPT09ICdudmlkaWEtc21vb3RoLW1vdGlvbicpIHtcclxuICAgICAgZnJhbWVHZW5lcmF0aW9uTW9kZSA9ICdudmlkaWEtc21vb3RoLW1vdGlvbic7XHJcbiAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRQcm92aWRlciA9PT0gJ2xvc3NsZXNzLXNjYWxpbmcnKSB7XHJcbiAgICAgIGNvbnN0IGhhc0xvc3NsZXNzRnJhbWVHZW4gPSBsZWdhY3lMb3NzbGVzc0ZsYWcgfHwgbHNUYXJnZXQgIT09IG51bGwgfHwgbHNMaW1pdCAhPT0gbnVsbDtcclxuICAgICAgZnJhbWVHZW5lcmF0aW9uTW9kZSA9IGhhc0xvc3NsZXNzRnJhbWVHZW4gPyAnbG9zc2xlc3Mtc2NhbGluZycgOiAnb2ZmJztcclxuICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFByb3ZpZGVyID09PSAnZ2FtZS1wcm92aWRlZCcpIHtcclxuICAgICAgZnJhbWVHZW5lcmF0aW9uTW9kZSA9ICdnYW1lLXByb3ZpZGVkJztcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgaGFzRXhwbGljaXRMb3NzbGVzc0VuYWJsZWQgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXHJcbiAgICBzcmMsXHJcbiAgICAnbG9zc2xlc3Mtc2NhbGluZy1lbmFibGVkJyxcclxuICApO1xyXG4gIGNvbnN0IGxzRW5hYmxlZCA9XHJcbiAgICB0eXBlb2Ygc3JjWydsb3NzbGVzcy1zY2FsaW5nLWVuYWJsZWQnXSA9PT0gJ2Jvb2xlYW4nXHJcbiAgICAgID8gc3JjWydsb3NzbGVzcy1zY2FsaW5nLWVuYWJsZWQnXVxyXG4gICAgICA6ICFoYXNFeHBsaWNpdExvc3NsZXNzRW5hYmxlZCAmJlxyXG4gICAgICAgICAgZnJhbWVHZW5lcmF0aW9uTW9kZSAhPT0gJ2xvc3NsZXNzLXNjYWxpbmcnICYmXHJcbiAgICAgICAgICBsZWdhY3lMb3NzbGVzc0ZsYWc7XHJcbiAgY29uc3QgZnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIgPVxyXG4gICAgZnJhbWVHZW5lcmF0aW9uTW9kZUZyb21Db25maWcgJiYgZnJhbWVHZW5lcmF0aW9uTW9kZUZyb21Db25maWcgIT09ICdvZmYnXHJcbiAgICAgID8gKGZyYW1lR2VuZXJhdGlvbk1vZGVGcm9tQ29uZmlnIGFzIEZyYW1lR2VuZXJhdGlvblByb3ZpZGVyKVxyXG4gICAgICA6IG5vcm1hbGl6ZWRQcm92aWRlcjtcclxuICBjb25zdCByYXdPdXRwdXQgPSBTdHJpbmcoc3JjLm91dHB1dCA/PyAnJyk7XHJcbiAgY29uc3QgcmF3VmlydHVhbFNjcmVlbiA9IHNyY1sndmlydHVhbC1zY3JlZW4nXTtcclxuICBjb25zdCB2aXJ0dWFsU2NyZWVuID1cclxuICAgIHR5cGVvZiByYXdWaXJ0dWFsU2NyZWVuID09PSAnYm9vbGVhbidcclxuICAgICAgPyByYXdWaXJ0dWFsU2NyZWVuXHJcbiAgICAgIDogcmF3T3V0cHV0ID09PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OO1xyXG4gIGNvbnN0IHNhbml0aXplZE91dHB1dCA9IHZpcnR1YWxTY3JlZW4gJiYgcmF3T3V0cHV0ID09PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OID8gJycgOiByYXdPdXRwdXQ7XHJcbiAgY29uc3Qgc2VydmVyVmlydHVhbERpc3BsYXlNb2RlID0gcGFyc2VBcHBWaXJ0dWFsRGlzcGxheU1vZGUoXHJcbiAgICAoc3JjIGFzIGFueSk/LlsndmlydHVhbC1kaXNwbGF5LW1vZGUnXSxcclxuICApO1xyXG4gIGNvbnN0IHNlcnZlclZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gcGFyc2VBcHBWaXJ0dWFsRGlzcGxheUxheW91dChcclxuICAgIChzcmMgYXMgYW55KT8uWyd2aXJ0dWFsLWRpc3BsYXktbGF5b3V0J10sXHJcbiAgKTtcclxuICBjb25zdCBkZENvbmZpZ1JhdyA9IChzcmMgYXMgYW55KT8uWydkZC1jb25maWd1cmF0aW9uLW9wdGlvbiddO1xyXG4gIGxldCBkZENvbmZpZ1ZhbHVlOiBBcHBGb3JtWydkZENvbmZpZ3VyYXRpb25PcHRpb24nXSA9IG51bGw7XHJcbiAgaWYgKHR5cGVvZiBkZENvbmZpZ1JhdyA9PT0gJ3N0cmluZycpIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBkZENvbmZpZ1Jhdy50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGNvbnN0IGFsbG93ZWQ6IEFwcEZvcm1bJ2RkQ29uZmlndXJhdGlvbk9wdGlvbiddW10gPSBbXHJcbiAgICAgICdkaXNhYmxlZCcsXHJcbiAgICAgICd2ZXJpZnlfb25seScsXHJcbiAgICAgICdlbnN1cmVfYWN0aXZlJyxcclxuICAgICAgJ2Vuc3VyZV9wcmltYXJ5JyxcclxuICAgICAgJ2Vuc3VyZV9vbmx5X2Rpc3BsYXknLFxyXG4gICAgXTtcclxuICAgIGlmIChhbGxvd2VkLmluY2x1ZGVzKG5vcm1hbGl6ZWQgYXMgQXBwRm9ybVsnZGRDb25maWd1cmF0aW9uT3B0aW9uJ10pKSB7XHJcbiAgICAgIGRkQ29uZmlnVmFsdWUgPSBub3JtYWxpemVkIGFzIEFwcEZvcm1bJ2RkQ29uZmlndXJhdGlvbk9wdGlvbiddO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBjYXB0dXJlRml4RW5hYmxlZCA9ICEhKFxyXG4gICAgc3JjWydnZW4xLWZyYW1lZ2VuLWZpeCddIHx8XHJcbiAgICBzcmNbJ2Rsc3MtZnJhbWVnZW4tY2FwdHVyZS1maXgnXSB8fFxyXG4gICAgc3JjWydnZW4yLWZyYW1lZ2VuLWZpeCddXHJcbiAgKTtcclxuICByZXR1cm4ge1xyXG4gICAgaW5kZXg6IGlkeCxcclxuICAgIHV1aWQ6IHR5cGVvZiBzcmMudXVpZCA9PT0gJ3N0cmluZycgPyBzcmMudXVpZCA6IHVuZGVmaW5lZCxcclxuICAgIG5hbWU6IFN0cmluZyhzcmMubmFtZSA/PyAnJyksXHJcbiAgICBvdXRwdXQ6IHJhd091dHB1dCxcclxuICAgIGNtZDogU3RyaW5nKGNtZFN0ciA/PyAnJyksXHJcbiAgICB3b3JraW5nRGlyOiBTdHJpbmcoc3JjWyd3b3JraW5nLWRpciddID8/ICcnKSxcclxuICAgIGltYWdlUGF0aDogU3RyaW5nKHNyY1snaW1hZ2UtcGF0aCddID8/ICcnKSxcclxuICAgIGV4Y2x1ZGVHbG9iYWxQcmVwQ21kOiAhIXNyY1snZXhjbHVkZS1nbG9iYWwtcHJlcC1jbWQnXSxcclxuICAgIGV4Y2x1ZGVHbG9iYWxTdGF0ZUNtZDogISFzcmNbJ2V4Y2x1ZGUtZ2xvYmFsLXN0YXRlLWNtZCddLFxyXG4gICAgY29uZmlnT3ZlcnJpZGVzOlxyXG4gICAgICAoc3JjIGFzIGFueSk/LlsnY29uZmlnLW92ZXJyaWRlcyddICYmXHJcbiAgICAgIHR5cGVvZiAoc3JjIGFzIGFueSlbJ2NvbmZpZy1vdmVycmlkZXMnXSA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgIUFycmF5LmlzQXJyYXkoKHNyYyBhcyBhbnkpWydjb25maWctb3ZlcnJpZGVzJ10pXHJcbiAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KChzcmMgYXMgYW55KVsnY29uZmlnLW92ZXJyaWRlcyddKSlcclxuICAgICAgICA6IHt9LFxyXG4gICAgZWxldmF0ZWQ6ICEhc3JjLmVsZXZhdGVkLFxyXG4gICAgYXV0b0RldGFjaDogc3JjWydhdXRvLWRldGFjaCddICE9PSB1bmRlZmluZWQgPyAhIXNyY1snYXV0by1kZXRhY2gnXSA6IGJhc2UuYXV0b0RldGFjaCxcclxuICAgIHdhaXRBbGw6IHNyY1snd2FpdC1hbGwnXSAhPT0gdW5kZWZpbmVkID8gISFzcmNbJ3dhaXQtYWxsJ10gOiBiYXNlLndhaXRBbGwsXHJcbiAgICB0ZXJtaW5hdGVPblBhdXNlOlxyXG4gICAgICBzcmNbJ3Rlcm1pbmF0ZS1vbi1wYXVzZSddICE9PSB1bmRlZmluZWQgPyAhIXNyY1sndGVybWluYXRlLW9uLXBhdXNlJ10gOiBiYXNlLnRlcm1pbmF0ZU9uUGF1c2UsXHJcbiAgICBhbGxvd0NsaWVudENvbW1hbmRzOlxyXG4gICAgICBzcmNbJ2FsbG93LWNsaWVudC1jb21tYW5kcyddICE9PSB1bmRlZmluZWRcclxuICAgICAgICA/ICEhc3JjWydhbGxvdy1jbGllbnQtY29tbWFuZHMnXVxyXG4gICAgICAgIDogYmFzZS5hbGxvd0NsaWVudENvbW1hbmRzLFxyXG4gICAgdXNlQXBwSWRlbnRpdHk6IHVzZUFwcElkZW50aXR5LFxyXG4gICAgcGVyQ2xpZW50QXBwSWRlbnRpdHk6XHJcbiAgICAgIHVzZUFwcElkZW50aXR5ICYmIHNyY1sncGVyLWNsaWVudC1hcHAtaWRlbnRpdHknXSAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyAhIXNyY1sncGVyLWNsaWVudC1hcHAtaWRlbnRpdHknXVxyXG4gICAgICAgIDogYmFzZS5wZXJDbGllbnRBcHBJZGVudGl0eSxcclxuICAgIGdhbWVwYWQ6IHR5cGVvZiBzcmMuZ2FtZXBhZCA9PT0gJ3N0cmluZycgPyBzcmMuZ2FtZXBhZCA6ICcnLFxyXG4gICAgc2NhbGVGYWN0b3I6IGNsYW1wU2NhbGVGYWN0b3IocGFyc2VOdW1lcmljKHNyY1snc2NhbGUtZmFjdG9yJ10pKSxcclxuICAgIGZyYW1lR2VuTGltaXRlckZpeDpcclxuICAgICAgc3JjWydmcmFtZS1nZW4tbGltaXRlci1maXgnXSAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyAhIXNyY1snZnJhbWUtZ2VuLWxpbWl0ZXItZml4J11cclxuICAgICAgICA6IGJhc2UuZnJhbWVHZW5MaW1pdGVyRml4LFxyXG4gICAgZXhpdFRpbWVvdXQ6IGRlcml2ZWRFeGl0VGltZW91dCxcclxuICAgIHByZXBDbWQ6IHByZXAsXHJcbiAgICBzdGF0ZUNtZDogc3RhdGUsXHJcbiAgICBkZXRhY2hlZDogQXJyYXkuaXNBcnJheShzcmMuZGV0YWNoZWQpID8gc3JjLmRldGFjaGVkLm1hcCgocykgPT4gU3RyaW5nKHMpKSA6IFtdLFxyXG4gICAgdmlydHVhbFNjcmVlbixcclxuICAgIGdlbjFGcmFtZWdlbkZpeDogY2FwdHVyZUZpeEVuYWJsZWQsXHJcbiAgICBnZW4yRnJhbWVnZW5GaXg6IGZhbHNlLFxyXG4gICAgcGxheW5pdGVJZDogc3JjWydwbGF5bml0ZS1pZCddIHx8IHVuZGVmaW5lZCxcclxuICAgIHBsYXluaXRlTWFuYWdlZDogc3JjWydwbGF5bml0ZS1tYW5hZ2VkJ10gfHwgdW5kZWZpbmVkLFxyXG4gICAgZnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIsXHJcbiAgICBmcmFtZUdlbmVyYXRpb25Nb2RlLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nRW5hYmxlZDogbHNFbmFibGVkLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nVGFyZ2V0RnBzOiBsc1RhcmdldCxcclxuICAgIGxvc3NsZXNzU2NhbGluZ1J0c3NMaW1pdDogbHNMaW1pdCxcclxuICAgIGxvc3NsZXNzU2NhbGluZ1J0c3NUb3VjaGVkOiBsc0xpbWl0ICE9PSBudWxsLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nUHJvZmlsZTogcHJvZmlsZUtleSxcclxuICAgIGxvc3NsZXNzU2NhbGluZ1Byb2ZpbGVzOiBsb3NzbGVzc1Byb2ZpbGVzLFxyXG4gICAgbG9zc2xlc3NTY2FsaW5nTGF1bmNoRGVsYXk6IGxzTGF1bmNoRGVsYXksXHJcbiAgICB2aXJ0dWFsRGlzcGxheU1vZGU6IHNlcnZlclZpcnR1YWxEaXNwbGF5TW9kZSxcclxuICAgIHZpcnR1YWxEaXNwbGF5TGF5b3V0OiBzZXJ2ZXJWaXJ0dWFsRGlzcGxheUxheW91dCxcclxuICAgIGRkQ29uZmlndXJhdGlvbk9wdGlvbjogZGRDb25maWdWYWx1ZSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b1NlcnZlclBheWxvYWQoZjogQXBwRm9ybSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xyXG4gIGNvbnN0IHNlbGVjdGlvbiA9IGRpc3BsYXlTZWxlY3Rpb24udmFsdWU7XHJcbiAgY29uc3QgY2FwdHVyZUZpeEVuYWJsZWQgPSAhIShmLmdlbjFGcmFtZWdlbkZpeCB8fCBmLmdlbjJGcmFtZWdlbkZpeCk7XHJcbiAgY29uc3QgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcclxuICAgIC8vIEluZGV4IGlzIHJlcXVpcmVkIGJ5IHRoZSBiYWNrZW5kIHRvIGRldGVybWluZSBhZGQgKC0xKSB2cyB1cGRhdGUgKD49IDApXHJcbiAgICBpbmRleDogdHlwZW9mIGYuaW5kZXggPT09ICdudW1iZXInID8gZi5pbmRleCA6IC0xLFxyXG4gICAgbmFtZTogZi5uYW1lLFxyXG4gICAgY21kOiBmLmNtZCxcclxuICAgICd3b3JraW5nLWRpcic6IGYud29ya2luZ0RpcixcclxuICAgICdpbWFnZS1wYXRoJzogU3RyaW5nKGYuaW1hZ2VQYXRoIHx8ICcnKS5yZXBsYWNlKC9cXFwiL2csICcnKSxcclxuICAgICdleGNsdWRlLWdsb2JhbC1wcmVwLWNtZCc6ICEhZi5leGNsdWRlR2xvYmFsUHJlcENtZCxcclxuICAgICdleGNsdWRlLWdsb2JhbC1zdGF0ZS1jbWQnOiAhIWYuZXhjbHVkZUdsb2JhbFN0YXRlQ21kLFxyXG4gICAgLi4uKGYuY29uZmlnT3ZlcnJpZGVzICYmXHJcbiAgICB0eXBlb2YgZi5jb25maWdPdmVycmlkZXMgPT09ICdvYmplY3QnICYmXHJcbiAgICAhQXJyYXkuaXNBcnJheShmLmNvbmZpZ092ZXJyaWRlcykgJiZcclxuICAgIE9iamVjdC5rZXlzKGYuY29uZmlnT3ZlcnJpZGVzKS5sZW5ndGhcclxuICAgICAgPyB7XHJcbiAgICAgICAgICAnY29uZmlnLW92ZXJyaWRlcyc6IE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZi5jb25maWdPdmVycmlkZXMpLmZpbHRlcihcclxuICAgICAgICAgICAgICAoW2ssIHZdKSA9PiB0eXBlb2YgayA9PT0gJ3N0cmluZycgJiYgay5sZW5ndGggPiAwICYmIHYgIT09IHVuZGVmaW5lZCAmJiB2ICE9PSBudWxsLFxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICB9XHJcbiAgICAgIDoge30pLFxyXG4gICAgZWxldmF0ZWQ6ICEhZi5lbGV2YXRlZCxcclxuICAgICdhdXRvLWRldGFjaCc6ICEhZi5hdXRvRGV0YWNoLFxyXG4gICAgJ3dhaXQtYWxsJzogISFmLndhaXRBbGwsXHJcbiAgICAndGVybWluYXRlLW9uLXBhdXNlJzogISFmLnRlcm1pbmF0ZU9uUGF1c2UsXHJcbiAgICAnYWxsb3ctY2xpZW50LWNvbW1hbmRzJzogISFmLmFsbG93Q2xpZW50Q29tbWFuZHMsXHJcbiAgICAndXNlLWFwcC1pZGVudGl0eSc6ICEhZi51c2VBcHBJZGVudGl0eSxcclxuICAgICdwZXItY2xpZW50LWFwcC1pZGVudGl0eSc6IGYudXNlQXBwSWRlbnRpdHkgPyAhIWYucGVyQ2xpZW50QXBwSWRlbnRpdHkgOiBmYWxzZSxcclxuICAgIGdhbWVwYWQ6IFN0cmluZyhmLmdhbWVwYWQgfHwgJycpLFxyXG4gICAgJ3NjYWxlLWZhY3Rvcic6IGNsYW1wU2NhbGVGYWN0b3IoXHJcbiAgICAgIHR5cGVvZiBmLnNjYWxlRmFjdG9yID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUoZi5zY2FsZUZhY3RvcikgPyBmLnNjYWxlRmFjdG9yIDogbnVsbCxcclxuICAgICksXHJcbiAgICAnZ2VuMS1mcmFtZWdlbi1maXgnOiBjYXB0dXJlRml4RW5hYmxlZCxcclxuICAgICdnZW4yLWZyYW1lZ2VuLWZpeCc6IGZhbHNlLFxyXG4gICAgJ2V4aXQtdGltZW91dCc6IE51bWJlci5pc0Zpbml0ZShmLmV4aXRUaW1lb3V0KSA/IGYuZXhpdFRpbWVvdXQgOiA1LFxyXG4gICAgJ3ByZXAtY21kJzogZi5wcmVwQ21kLm1hcCgocCkgPT4gKHtcclxuICAgICAgZG86IHAuZG8sXHJcbiAgICAgIHVuZG86IHAudW5kbyxcclxuICAgICAgLi4uKGlzV2luZG93cy52YWx1ZSA/IHsgZWxldmF0ZWQ6ICEhcC5lbGV2YXRlZCB9IDoge30pLFxyXG4gICAgfSkpLFxyXG4gICAgJ3N0YXRlLWNtZCc6IGYuc3RhdGVDbWQubWFwKChwKSA9PiAoe1xyXG4gICAgICBkbzogcC5kbyxcclxuICAgICAgdW5kbzogcC51bmRvLFxyXG4gICAgICAuLi4oaXNXaW5kb3dzLnZhbHVlID8geyBlbGV2YXRlZDogISFwLmVsZXZhdGVkIH0gOiB7fSksXHJcbiAgICB9KSksXHJcbiAgICBkZXRhY2hlZDogQXJyYXkuaXNBcnJheShmLmRldGFjaGVkKSA/IGYuZGV0YWNoZWQgOiBbXSxcclxuICAgIC8vIExlYXZlICd2aXJ0dWFsLXNjcmVlbicgdG8gYmUgcGVyc2lzdGVkIG9ubHkgaWYgZXhwbGljaXRseSBkaWZmZXJlbnQgZnJvbSB0aGUgZ2xvYmFsIHNldHRpbmcuXHJcbiAgfTtcclxuICBcclxuICAvLyBJbmNsdWRlIHV1aWQgdG8gZW5hYmxlIGJhY2tlbmQgVVVJRC1tYXRjaGluZyBmb3IgdXBkYXRlc1xyXG4gIGlmIChmLnV1aWQpIHtcclxuICAgIHBheWxvYWRbJ3V1aWQnXSA9IGYudXVpZDtcclxuICB9XHJcbiAgXHJcbiAgLy8gT25seSBwZXJzaXN0IHZpcnR1YWwgZGlzcGxheSBtb2RlL2xheW91dCBpZiBleHBsaWNpdGx5IHNldCBhbmQgZGlmZmVyZW50IGZyb20gZ2xvYmFsIGRlZmF1bHRzXHJcbiAgY29uc3QgX2dsb2JhbFZETW9kZSA9IGdsb2JhbFZpcnR1YWxEaXNwbGF5TW9kZS52YWx1ZTtcclxuICBjb25zdCBfZ2xvYmFsVkRMYXlvdXQgPSBnbG9iYWxWaXJ0dWFsRGlzcGxheUxheW91dC52YWx1ZTtcclxuICBjb25zdCBfZ2xvYmFsT3V0cHV0ID0gZ2xvYmFsT3V0cHV0TmFtZS52YWx1ZTtcclxuICBpZiAoZi52aXJ0dWFsRGlzcGxheU1vZGUgIT09IG51bGwgJiYgZi52aXJ0dWFsRGlzcGxheU1vZGUgIT09IF9nbG9iYWxWRE1vZGUpIHtcclxuICAgIHBheWxvYWRbJ3ZpcnR1YWwtZGlzcGxheS1tb2RlJ10gPSBmLnZpcnR1YWxEaXNwbGF5TW9kZTtcclxuICB9XHJcbiAgaWYgKGYudmlydHVhbERpc3BsYXlMYXlvdXQgIT09IG51bGwgJiYgZi52aXJ0dWFsRGlzcGxheUxheW91dCAhPT0gX2dsb2JhbFZETGF5b3V0KSB7XHJcbiAgICBwYXlsb2FkWyd2aXJ0dWFsLWRpc3BsYXktbGF5b3V0J10gPSBmLnZpcnR1YWxEaXNwbGF5TGF5b3V0O1xyXG4gIH1cclxuICBpZiAoZi5wbGF5bml0ZUlkKSBwYXlsb2FkWydwbGF5bml0ZS1pZCddID0gZi5wbGF5bml0ZUlkO1xyXG4gIGlmIChmLnBsYXluaXRlTWFuYWdlZCkgcGF5bG9hZFsncGxheW5pdGUtbWFuYWdlZCddID0gZi5wbGF5bml0ZU1hbmFnZWQ7XHJcbiAgY29uc3QgcHJvdmlkZXIgPSBub3JtYWxpemVGcmFtZUdlbmVyYXRpb25Qcm92aWRlcihmLmZyYW1lR2VuZXJhdGlvblByb3ZpZGVyKTtcclxuICBjb25zdCBtb2RlID0gZi5mcmFtZUdlbmVyYXRpb25Nb2RlID8/ICdvZmYnO1xyXG4gIGxldCByZXNvbHZlZFByb3ZpZGVyOiBGcmFtZUdlbmVyYXRpb25Qcm92aWRlciA9IHByb3ZpZGVyO1xyXG4gIGlmIChtb2RlID09PSAnbnZpZGlhLXNtb290aC1tb3Rpb24nKSB7XHJcbiAgICByZXNvbHZlZFByb3ZpZGVyID0gJ252aWRpYS1zbW9vdGgtbW90aW9uJztcclxuICB9IGVsc2UgaWYgKG1vZGUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJykge1xyXG4gICAgcmVzb2x2ZWRQcm92aWRlciA9ICdsb3NzbGVzcy1zY2FsaW5nJztcclxuICB9IGVsc2UgaWYgKG1vZGUgPT09ICdnYW1lLXByb3ZpZGVkJykge1xyXG4gICAgcmVzb2x2ZWRQcm92aWRlciA9ICdnYW1lLXByb3ZpZGVkJztcclxuICB9IGVsc2Uge1xyXG4gICAgcmVzb2x2ZWRQcm92aWRlciA9IHByb3ZpZGVyO1xyXG4gIH1cclxuICBwYXlsb2FkWydmcmFtZS1nZW5lcmF0aW9uLXByb3ZpZGVyJ10gPSByZXNvbHZlZFByb3ZpZGVyO1xyXG4gIHBheWxvYWRbJ2ZyYW1lLWdlbmVyYXRpb24tbW9kZSddID0gbW9kZTtcclxuICBjb25zdCBwYXlsb2FkTG9zc2xlc3NUYXJnZXQgPSBwYXJzZU51bWVyaWMoZi5sb3NzbGVzc1NjYWxpbmdUYXJnZXRGcHMpO1xyXG4gIGNvbnN0IHBheWxvYWRMb3NzbGVzc0xpbWl0ID0gcGFyc2VOdW1lcmljKGYubG9zc2xlc3NTY2FsaW5nUnRzc0xpbWl0KTtcclxuICBjb25zdCBsb3NzbGVzc0ZyYW1lZ2VuQWN0aXZlID0gbW9kZSA9PT0gJ2xvc3NsZXNzLXNjYWxpbmcnO1xyXG4gIGNvbnN0IGxvc3NsZXNzUnVudGltZUFjdGl2ZSA9ICEhZi5sb3NzbGVzc1NjYWxpbmdFbmFibGVkIHx8IGxvc3NsZXNzRnJhbWVnZW5BY3RpdmU7XHJcbiAgcGF5bG9hZFsnbG9zc2xlc3Mtc2NhbGluZy1lbmFibGVkJ10gPSAhIWYubG9zc2xlc3NTY2FsaW5nRW5hYmxlZDtcclxuICBwYXlsb2FkWydsb3NzbGVzcy1zY2FsaW5nLWZyYW1lZ2VuJ10gPSBsb3NzbGVzc0ZyYW1lZ2VuQWN0aXZlO1xyXG4gIHBheWxvYWRbJ2xvc3NsZXNzLXNjYWxpbmctdGFyZ2V0LWZwcyddID1cclxuICAgIGxvc3NsZXNzRnJhbWVnZW5BY3RpdmUgPyBwYXlsb2FkTG9zc2xlc3NUYXJnZXQgOiBudWxsO1xyXG4gIHBheWxvYWRbJ2xvc3NsZXNzLXNjYWxpbmctcnRzcy1saW1pdCddID1cclxuICAgIGxvc3NsZXNzRnJhbWVnZW5BY3RpdmUgPyBwYXlsb2FkTG9zc2xlc3NMaW1pdCA6IG51bGw7XHJcbiAgY29uc3QgcGF5bG9hZExvc3NsZXNzRGVsYXlSYXcgPSBwYXJzZU51bWVyaWMoZi5sb3NzbGVzc1NjYWxpbmdMYXVuY2hEZWxheSk7XHJcbiAgY29uc3QgcGF5bG9hZExvc3NsZXNzRGVsYXkgPVxyXG4gICAgcGF5bG9hZExvc3NsZXNzRGVsYXlSYXcgJiYgcGF5bG9hZExvc3NsZXNzRGVsYXlSYXcgPiAwXHJcbiAgICAgID8gTWF0aC5yb3VuZChwYXlsb2FkTG9zc2xlc3NEZWxheVJhdylcclxuICAgICAgOiBudWxsO1xyXG4gIHBheWxvYWRbJ2xvc3NsZXNzLXNjYWxpbmctbGF1bmNoLWRlbGF5J10gPSBsb3NzbGVzc1J1bnRpbWVBY3RpdmUgPyBwYXlsb2FkTG9zc2xlc3NEZWxheSA6IG51bGw7XHJcbiAgcGF5bG9hZFsnbG9zc2xlc3Mtc2NhbGluZy1wcm9maWxlJ10gPVxyXG4gICAgZi5sb3NzbGVzc1NjYWxpbmdQcm9maWxlID09PSAncmVjb21tZW5kZWQnID8gJ3JlY29tbWVuZGVkJyA6ICdjdXN0b20nO1xyXG4gIGNvbnN0IGJ1aWxkTG9zc2xlc3NQcm9maWxlUGF5bG9hZCA9IChwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVPdmVycmlkZXMpID0+IHtcclxuICAgIGNvbnN0IHByb2ZpbGVQYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XHJcbiAgICBpZiAocHJvZmlsZS5wZXJmb3JtYW5jZU1vZGUgIT09IG51bGwpIHtcclxuICAgICAgcHJvZmlsZVBheWxvYWRbJ3BlcmZvcm1hbmNlLW1vZGUnXSA9IHByb2ZpbGUucGVyZm9ybWFuY2VNb2RlO1xyXG4gICAgfVxyXG4gICAgaWYgKHByb2ZpbGUuZmxvd1NjYWxlICE9PSBudWxsKSB7XHJcbiAgICAgIHByb2ZpbGVQYXlsb2FkWydmbG93LXNjYWxlJ10gPSBwcm9maWxlLmZsb3dTY2FsZTtcclxuICAgIH1cclxuICAgIGlmIChwcm9maWxlLnJlc29sdXRpb25TY2FsZSAhPT0gbnVsbCkge1xyXG4gICAgICBwcm9maWxlUGF5bG9hZFsncmVzb2x1dGlvbi1zY2FsZSddID0gcHJvZmlsZS5yZXNvbHV0aW9uU2NhbGU7XHJcbiAgICB9XHJcbiAgICBpZiAocHJvZmlsZS5zY2FsaW5nTW9kZSAhPT0gbnVsbCkge1xyXG4gICAgICBwcm9maWxlUGF5bG9hZFsnc2NhbGluZy10eXBlJ10gPSBwcm9maWxlLnNjYWxpbmdNb2RlO1xyXG4gICAgfVxyXG4gICAgaWYgKHByb2ZpbGUuc2hhcnBlbmluZyAhPT0gbnVsbCkge1xyXG4gICAgICBwcm9maWxlUGF5bG9hZFsnc2hhcnBlbmluZyddID0gcHJvZmlsZS5zaGFycGVuaW5nO1xyXG4gICAgfVxyXG4gICAgaWYgKHByb2ZpbGUuYW5pbWU0a1NpemUgIT09IG51bGwpIHtcclxuICAgICAgcHJvZmlsZVBheWxvYWRbJ2FuaW1lNGstc2l6ZSddID0gcHJvZmlsZS5hbmltZTRrU2l6ZTtcclxuICAgIH1cclxuICAgIGlmIChwcm9maWxlLmFuaW1lNGtWcnMgIT09IG51bGwpIHtcclxuICAgICAgcHJvZmlsZVBheWxvYWRbJ2FuaW1lNGstdnJzJ10gPSBwcm9maWxlLmFuaW1lNGtWcnM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZmlsZVBheWxvYWQ7XHJcbiAgfTtcclxuICBjb25zdCByZWNvbW1lbmRlZFBheWxvYWQgPSBidWlsZExvc3NsZXNzUHJvZmlsZVBheWxvYWQoZi5sb3NzbGVzc1NjYWxpbmdQcm9maWxlcy5yZWNvbW1lbmRlZCk7XHJcbiAgY29uc3QgY3VzdG9tUGF5bG9hZCA9IGJ1aWxkTG9zc2xlc3NQcm9maWxlUGF5bG9hZChmLmxvc3NsZXNzU2NhbGluZ1Byb2ZpbGVzLmN1c3RvbSk7XHJcbiAgaWYgKE9iamVjdC5rZXlzKHJlY29tbWVuZGVkUGF5bG9hZCkubGVuZ3RoID4gMCkge1xyXG4gICAgcGF5bG9hZFsnbG9zc2xlc3Mtc2NhbGluZy1yZWNvbW1lbmRlZCddID0gcmVjb21tZW5kZWRQYXlsb2FkO1xyXG4gIH1cclxuICBpZiAoT2JqZWN0LmtleXMoY3VzdG9tUGF5bG9hZCkubGVuZ3RoID4gMCkge1xyXG4gICAgcGF5bG9hZFsnbG9zc2xlc3Mtc2NhbGluZy1jdXN0b20nXSA9IGN1c3RvbVBheWxvYWQ7XHJcbiAgfVxyXG4gIC8vIE9ubHkgcGVyc2lzdCBvdXRwdXQgaWYgaXQgZGlmZmVycyBmcm9tIGdsb2JhbCBvdXRwdXQgKGluY2x1ZGluZyB2aXJ0dWFsIHNlbGVjdGlvbiBmbGFnKVxyXG4gIGlmICh0eXBlb2YgZi5vdXRwdXQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBjb25zdCBjdXJPdXQgPSBTdHJpbmcoZi5vdXRwdXQgfHwgJycpO1xyXG4gICAgaWYgKGN1ck91dCAhPT0gJycgJiYgKGN1ck91dCAhPT0gX2dsb2JhbE91dHB1dCB8fCBzZWxlY3Rpb24gPT09ICdwaHlzaWNhbCcpKSB7XHJcbiAgICAgIHBheWxvYWRbJ291dHB1dCddID0gY3VyT3V0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gT25seSBwZXJzaXN0IHZpcnR1YWwtc2NyZWVuIGlmIGl0IGRpZmZlcnMgZnJvbSB0aGUgZ2xvYmFsIHZpcnR1YWwgb3V0cHV0IGZsYWcuXHJcbiAgY29uc3QgZ2xvYmFsSXNWaXJ0dWFsID0gX2dsb2JhbE91dHB1dCA9PT0gVklSVFVBTF9ESVNQTEFZX1NFTEVDVElPTjtcclxuICBpZiAoISFmLnZpcnR1YWxTY3JlZW4gIT09IGdsb2JhbElzVmlydHVhbCkge1xyXG4gICAgcGF5bG9hZFsndmlydHVhbC1zY3JlZW4nXSA9ICEhZi52aXJ0dWFsU2NyZWVuO1xyXG4gIH1cclxuICBpZiAoZi5kZENvbmZpZ3VyYXRpb25PcHRpb24pIHtcclxuICAgIHBheWxvYWRbJ2RkLWNvbmZpZ3VyYXRpb24tb3B0aW9uJ10gPSBmLmRkQ29uZmlndXJhdGlvbk9wdGlvbjtcclxuICB9XHJcbiAgcmV0dXJuIHBheWxvYWQ7XHJcbn1cclxuLy8gTm9ybWFsaXplIGNtZCB0byBzaW5nbGUgc3RyaW5nOyByZWh5ZHJhdGUgdHlwZWQgZm9ybSB3aGVuIHByb3BzLmFwcCBjaGFuZ2VzIHdoaWxlIG9wZW5cclxud2F0Y2goXHJcbiAgKCkgPT4gcHJvcHMuYXBwLFxyXG4gICh2YWwpID0+IHtcclxuICAgIGlmICghb3Blbi52YWx1ZSkgcmV0dXJuO1xyXG4gICAgZm9ybS52YWx1ZSA9IGZyb21TZXJ2ZXJBcHAodmFsIGFzIFNlcnZlckFwcCB8IHVuZGVmaW5lZCwgcHJvcHMuaW5kZXggPz8gLTEpO1xyXG4gIH0sXHJcbiAgeyBpbW1lZGlhdGU6IHRydWUgfSxcclxuKTtcclxuY29uc3QgY21kVGV4dCA9IGNvbXB1dGVkPHN0cmluZz4oe1xyXG4gIGdldDogKCkgPT4gZm9ybS52YWx1ZS5jbWQgfHwgJycsXHJcbiAgc2V0OiAodjogc3RyaW5nKSA9PiB7XHJcbiAgICBmb3JtLnZhbHVlLmNtZCA9IHY7XHJcbiAgfSxcclxufSk7XHJcbmNvbnN0IHNjYWxlRmFjdG9yTW9kZWwgPSBjb21wdXRlZDxudW1iZXI+KHtcclxuICBnZXQ6ICgpID0+IGZvcm0udmFsdWUuc2NhbGVGYWN0b3IsXHJcbiAgc2V0OiAodjogbnVtYmVyKSA9PiB7XHJcbiAgICBmb3JtLnZhbHVlLnNjYWxlRmFjdG9yID0gY2xhbXBTY2FsZUZhY3RvcihcclxuICAgICAgdHlwZW9mIHYgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZSh2KSA/IHYgOiBudWxsLFxyXG4gICAgKTtcclxuICB9LFxyXG59KTtcclxuY29uc3QgaXNQbGF5bml0ZU1hbmFnZWQgPSBjb21wdXRlZDxib29sZWFuPigoKSA9PiAhIWZvcm0udmFsdWUucGxheW5pdGVJZCk7XHJcbmNvbnN0IGlzUGxheW5pdGVBdXRvID0gY29tcHV0ZWQ8Ym9vbGVhbj4oXHJcbiAgKCkgPT4gaXNQbGF5bml0ZU1hbmFnZWQudmFsdWUgJiYgZm9ybS52YWx1ZS5wbGF5bml0ZU1hbmFnZWQgIT09ICdtYW51YWwnLFxyXG4pO1xyXG5cclxuY29uc3QgbG9zc2xlc3NFeGVjdXRhYmxlU3RhdHVzID0gcmVmPGFueSB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBsb3NzbGVzc0V4ZWN1dGFibGVDaGVja0NvbXBsZXRlID0gcmVmKGZhbHNlKTtcclxuZnVuY3Rpb24gaGFzTG9zc2xlc3NDYW5kaWRhdGVzKHN0YXR1czogYW55IHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHN0YXR1cz8uY2FuZGlkYXRlcykgJiYgc3RhdHVzLmNhbmRpZGF0ZXMubGVuZ3RoID4gMDtcclxufVxyXG5jb25zdCBsb3NzbGVzc0V4ZWN1dGFibGVEZXRlY3RlZCA9IGNvbXB1dGVkPGJvb2xlYW4+KCgpID0+IHtcclxuICBjb25zdCBzdGF0dXMgPSBsb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMudmFsdWU7XHJcbiAgaWYgKCFzdGF0dXMpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgaWYgKHN0YXR1cy5jaGVja2VkX2V4aXN0cyB8fCBzdGF0dXMuY29uZmlndXJlZF9leGlzdHMgfHwgc3RhdHVzLmRlZmF1bHRfZXhpc3RzKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIGhhc0xvc3NsZXNzQ2FuZGlkYXRlcyhzdGF0dXMpO1xyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hMb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMoKSB7XHJcbiAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHtcclxuICAgIGxvc3NsZXNzRXhlY3V0YWJsZVN0YXR1cy52YWx1ZSA9IG51bGw7XHJcbiAgICBsb3NzbGVzc0V4ZWN1dGFibGVDaGVja0NvbXBsZXRlLnZhbHVlID0gdHJ1ZTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgbG9zc2xlc3NFeGVjdXRhYmxlQ2hlY2tDb21wbGV0ZS52YWx1ZSA9IGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIGNvbnN0IGNvbmZpZ3VyZWRQYXRoID0gKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpPy5sb3NzbGVzc19zY2FsaW5nX3BhdGg7XHJcbiAgICBpZiAoY29uZmlndXJlZFBhdGgpIHtcclxuICAgICAgcGFyYW1zWydwYXRoJ10gPSBTdHJpbmcoY29uZmlndXJlZFBhdGgpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9sb3NzbGVzc19zY2FsaW5nL3N0YXR1cycsIHtcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcclxuICAgIH0pO1xyXG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgIGxvc3NsZXNzRXhlY3V0YWJsZVN0YXR1cy52YWx1ZSA9IHJlc3BvbnNlLmRhdGEgPz8ge307XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgbG9zc2xlc3NFeGVjdXRhYmxlQ2hlY2tDb21wbGV0ZS52YWx1ZSA9IHRydWU7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBsb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gICAgbG9zc2xlc3NFeGVjdXRhYmxlQ2hlY2tDb21wbGV0ZS52YWx1ZSA9IHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBmcmFtZUdlbmVyYXRpb25TZWxlY3Rpb24gPSBjb21wdXRlZDxGcmFtZUdlbmVyYXRpb25Nb2RlPih7XHJcbiAgZ2V0OiAoKSA9PiBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPz8gJ29mZicsXHJcbiAgc2V0OiAobW9kZSkgPT4ge1xyXG4gICAgZm9ybS52YWx1ZS5mcmFtZUdlbmVyYXRpb25Nb2RlID0gbW9kZTtcclxuICAgIGlmIChtb2RlID09PSAnbnZpZGlhLXNtb290aC1tb3Rpb24nKSB7XHJcbiAgICAgIGZvcm0udmFsdWUuZnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIgPSAnbnZpZGlhLXNtb290aC1tb3Rpb24nO1xyXG4gICAgICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1RhcmdldEZwcyA9IG51bGw7XHJcbiAgICAgIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUnRzc0xpbWl0ID0gbnVsbDtcclxuICAgICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzVG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09PSAnbG9zc2xlc3Mtc2NhbGluZycpIHtcclxuICAgICAgZm9ybS52YWx1ZS5mcmFtZUdlbmVyYXRpb25Qcm92aWRlciA9ICdsb3NzbGVzcy1zY2FsaW5nJztcclxuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gJ2dhbWUtcHJvdmlkZWQnKSB7XHJcbiAgICAgIGZvcm0udmFsdWUuZnJhbWVHZW5lcmF0aW9uUHJvdmlkZXIgPSAnZ2FtZS1wcm92aWRlZCc7XHJcbiAgICAgIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nVGFyZ2V0RnBzID0gbnVsbDtcclxuICAgICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzTGltaXQgPSBudWxsO1xyXG4gICAgICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1J0c3NUb3VjaGVkID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvblByb3ZpZGVyID0gJ2dhbWUtcHJvdmlkZWQnO1xyXG4gICAgICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1RhcmdldEZwcyA9IG51bGw7XHJcbiAgICAgIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUnRzc0xpbWl0ID0gbnVsbDtcclxuICAgICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzVG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgbnZpZGlhRnJhbWVHZW5FbmFibGVkID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldDogKCkgPT4gZnJhbWVHZW5lcmF0aW9uU2VsZWN0aW9uLnZhbHVlID09PSAnbnZpZGlhLXNtb290aC1tb3Rpb24nLFxyXG4gIHNldDogKGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcclxuICAgIGlmIChlbmFibGVkKSB7XHJcbiAgICAgIGZyYW1lR2VuZXJhdGlvblNlbGVjdGlvbi52YWx1ZSA9ICdudmlkaWEtc21vb3RoLW1vdGlvbic7XHJcbiAgICB9IGVsc2UgaWYgKGZyYW1lR2VuZXJhdGlvblNlbGVjdGlvbi52YWx1ZSA9PT0gJ252aWRpYS1zbW9vdGgtbW90aW9uJykge1xyXG4gICAgICBmcmFtZUdlbmVyYXRpb25TZWxlY3Rpb24udmFsdWUgPSAnb2ZmJztcclxuICAgIH1cclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGxvc3NsZXNzRnJhbWVHZW5FbmFibGVkID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldDogKCkgPT4gZnJhbWVHZW5lcmF0aW9uU2VsZWN0aW9uLnZhbHVlID09PSAnbG9zc2xlc3Mtc2NhbGluZycsXHJcbiAgc2V0OiAoZW5hYmxlZDogYm9vbGVhbikgPT4ge1xyXG4gICAgaWYgKGVuYWJsZWQpIHtcclxuICAgICAgZnJhbWVHZW5lcmF0aW9uU2VsZWN0aW9uLnZhbHVlID0gJ2xvc3NsZXNzLXNjYWxpbmcnO1xyXG4gICAgfSBlbHNlIGlmIChmcmFtZUdlbmVyYXRpb25TZWxlY3Rpb24udmFsdWUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJykge1xyXG4gICAgICBmcmFtZUdlbmVyYXRpb25TZWxlY3Rpb24udmFsdWUgPSAnb2ZmJztcclxuICAgIH1cclxuICB9LFxyXG59KTtcclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS5mcmFtZUdlbmVyYXRpb25Qcm92aWRlcixcclxuICAocHJvdmlkZXIpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVGcmFtZUdlbmVyYXRpb25Qcm92aWRlcihwcm92aWRlcik7XHJcbiAgICBpZiAocHJvdmlkZXIgIT09IG5vcm1hbGl6ZWQpIHtcclxuICAgICAgZm9ybS52YWx1ZS5mcmFtZUdlbmVyYXRpb25Qcm92aWRlciA9IG5vcm1hbGl6ZWQ7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChub3JtYWxpemVkID09PSAnbnZpZGlhLXNtb290aC1tb3Rpb24nKSB7XHJcbiAgICAgIGlmIChmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgIT09ICdudmlkaWEtc21vb3RoLW1vdGlvbicpIHtcclxuICAgICAgICBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPSAnbnZpZGlhLXNtb290aC1tb3Rpb24nO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWQgPT09ICdsb3NzbGVzcy1zY2FsaW5nJykge1xyXG4gICAgICBpZiAoZm9ybS52YWx1ZS5mcmFtZUdlbmVyYXRpb25Nb2RlICE9PSAnbG9zc2xlc3Mtc2NhbGluZycpIHtcclxuICAgICAgICBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPSAnbG9zc2xlc3Mtc2NhbGluZyc7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZCA9PT0gJ2dhbWUtcHJvdmlkZWQnKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJyB8fFxyXG4gICAgICAgIGZvcm0udmFsdWUuZnJhbWVHZW5lcmF0aW9uTW9kZSA9PT0gJ252aWRpYS1zbW9vdGgtbW90aW9uJ1xyXG4gICAgICApIHtcclxuICAgICAgICBmb3JtLnZhbHVlLmZyYW1lR2VuZXJhdGlvbk1vZGUgPSAnZ2FtZS1wcm92aWRlZCc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIFVwZGF0ZSBGUFMvUlRTUyBpZiB1c2luZyBsb3NzbGVzcyBhbmQgZnJhbWUgZ2VuIGlzIGVuYWJsZWRcclxuICAgIGlmIChcclxuICAgICAgbm9ybWFsaXplZCA9PT0gJ2xvc3NsZXNzLXNjYWxpbmcnICYmXHJcbiAgICAgIGxvc3NsZXNzRnJhbWVHZW5FbmFibGVkLnZhbHVlICYmXHJcbiAgICAgICFmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1J0c3NUb3VjaGVkXHJcbiAgICApIHtcclxuICAgICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzTGltaXQgPSBkZWZhdWx0UnRzc0Zyb21UYXJnZXQoXHJcbiAgICAgICAgcGFyc2VOdW1lcmljKGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nVGFyZ2V0RnBzKSxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdUYXJnZXRGcHMsXHJcbiAgKHZhbHVlKSA9PiB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gcGFyc2VOdW1lcmljKHZhbHVlKTtcclxuICAgIGlmIChub3JtYWxpemVkICE9PSB2YWx1ZSkge1xyXG4gICAgICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1RhcmdldEZwcyA9IG5vcm1hbGl6ZWQ7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIE9ubHkgYXV0by11cGRhdGUgUlRTUyBpZiBmcmFtZSBnZW4gaXMgZW5hYmxlZCBhbmQgdXNlciBoYXNuJ3QgbWFudWFsbHkgc2V0IGl0XHJcbiAgICBpZiAobG9zc2xlc3NGcmFtZUdlbkVuYWJsZWQudmFsdWUgJiYgIWZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUnRzc1RvdWNoZWQpIHtcclxuICAgICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzTGltaXQgPSBkZWZhdWx0UnRzc0Zyb21UYXJnZXQobm9ybWFsaXplZCk7XHJcbiAgICB9XHJcbiAgfSxcclxuKTtcclxuXHJcbmZ1bmN0aW9uIG9uTG9zc2xlc3NSdHNzTGltaXRDaGFuZ2UodmFsdWU6IG51bWJlciB8IG51bGwpIHtcclxuICBjb25zdCBub3JtYWxpemVkID0gcGFyc2VOdW1lcmljKHZhbHVlKTtcclxuICBpZiAobm9ybWFsaXplZCA9PT0gbnVsbCkge1xyXG4gICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzVG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdSdHNzTGltaXQgPSBudWxsO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1J0c3NUb3VjaGVkID0gdHJ1ZTtcclxuICBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1J0c3NMaW1pdCA9IE1hdGgubWluKDM2MCwgTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChub3JtYWxpemVkKSkpO1xyXG59XHJcblxyXG5jb25zdCBhY3RpdmVMb3NzbGVzc1Byb2ZpbGUgPSBjb21wdXRlZDxMb3NzbGVzc1Byb2ZpbGVLZXk+KCgpID0+XHJcbiAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdQcm9maWxlID09PSAncmVjb21tZW5kZWQnID8gJ3JlY29tbWVuZGVkJyA6ICdjdXN0b20nLFxyXG4pO1xyXG5cclxuZnVuY3Rpb24gZ2V0RWZmZWN0aXZlUGVyZm9ybWFuY2VNb2RlKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IG92ZXJyaWRlcyA9IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV07XHJcbiAgcmV0dXJuIG92ZXJyaWRlcy5wZXJmb3JtYW5jZU1vZGUgPz8gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXS5wZXJmb3JtYW5jZU1vZGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFBlcmZvcm1hbmNlTW9kZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXksIHZhbHVlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdO1xyXG4gIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV0ucGVyZm9ybWFuY2VNb2RlID1cclxuICAgIHZhbHVlID09PSBkZWZhdWx0cy5wZXJmb3JtYW5jZU1vZGUgPyBudWxsIDogdmFsdWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVmZmVjdGl2ZUZsb3dTY2FsZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXkpOiBudW1iZXIge1xyXG4gIGNvbnN0IG92ZXJyaWRlcyA9IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV07XHJcbiAgcmV0dXJuIG92ZXJyaWRlcy5mbG93U2NhbGUgPz8gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXS5mbG93U2NhbGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEZsb3dTY2FsZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXksIHZhbHVlOiBudW1iZXIgfCBudWxsKTogdm9pZCB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdO1xyXG4gIGNvbnN0IGNsYW1wZWQgPSBjbGFtcEZsb3codmFsdWUpO1xyXG4gIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV0uZmxvd1NjYWxlID1cclxuICAgIGNsYW1wZWQgPT09IG51bGwgfHwgY2xhbXBlZCA9PT0gZGVmYXVsdHMuZmxvd1NjYWxlID8gbnVsbCA6IGNsYW1wZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVmZmVjdGl2ZVJlc29sdXRpb25TY2FsZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXkpOiBudW1iZXIge1xyXG4gIGNvbnN0IG92ZXJyaWRlcyA9IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV07XHJcbiAgcmV0dXJuIG92ZXJyaWRlcy5yZXNvbHV0aW9uU2NhbGUgPz8gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXS5yZXNvbHV0aW9uU2NhbGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFJlc29sdXRpb25TY2FsZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXksIHZhbHVlOiBudW1iZXIgfCBudWxsKTogdm9pZCB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdO1xyXG4gIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFJlc29sdXRpb24odmFsdWUpO1xyXG4gIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV0ucmVzb2x1dGlvblNjYWxlID1cclxuICAgIGNsYW1wZWQgPT09IG51bGwgfHwgY2xhbXBlZCA9PT0gZGVmYXVsdHMucmVzb2x1dGlvblNjYWxlID8gbnVsbCA6IGNsYW1wZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVmZmVjdGl2ZVNjYWxpbmdNb2RlKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSk6IExvc3NsZXNzU2NhbGluZ01vZGUge1xyXG4gIGNvbnN0IG92ZXJyaWRlcyA9IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV07XHJcbiAgcmV0dXJuIG92ZXJyaWRlcy5zY2FsaW5nTW9kZSA/PyBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdLnNjYWxpbmdNb2RlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRTY2FsaW5nTW9kZShwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXksIHZhbHVlOiBMb3NzbGVzc1NjYWxpbmdNb2RlKTogdm9pZCB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdO1xyXG4gIGNvbnN0IG92ZXJyaWRlcyA9IGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV07XHJcbiAgb3ZlcnJpZGVzLnNjYWxpbmdNb2RlID0gdmFsdWUgPT09IGRlZmF1bHRzLnNjYWxpbmdNb2RlID8gbnVsbCA6IHZhbHVlO1xyXG4gIGlmICghTE9TU0xFU1NfU0NBTElOR19TSEFSUEVOSU5HLmhhcyh2YWx1ZSkpIHtcclxuICAgIG92ZXJyaWRlcy5zaGFycGVuaW5nID0gbnVsbDtcclxuICB9XHJcbiAgaWYgKHZhbHVlICE9PSAnYW5pbWU0aycpIHtcclxuICAgIG92ZXJyaWRlcy5hbmltZTRrU2l6ZSA9IG51bGw7XHJcbiAgICBvdmVycmlkZXMuYW5pbWU0a1ZycyA9IG51bGw7XHJcbiAgfVxyXG4gIC8vIFdoZW4gc2NhbGluZyBpcyBzZXQgdG8gJ29mZicsIHJlc2V0IHJlc29sdXRpb24gc2NhbGluZyB0byBkZWZhdWx0ICgxMDAlKVxyXG4gIGlmICh2YWx1ZSA9PT0gJ29mZicpIHtcclxuICAgIG92ZXJyaWRlcy5yZXNvbHV0aW9uU2NhbGUgPSBudWxsO1xyXG4gIH1cclxuICBpZiAocHJvZmlsZSA9PT0gYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlKSB7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZmZlY3RpdmVTaGFycGVuaW5nKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSk6IG51bWJlciB7XHJcbiAgY29uc3Qgb3ZlcnJpZGVzID0gZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdQcm9maWxlc1twcm9maWxlXTtcclxuICBjb25zdCBkZWZhdWx0cyA9IExPU1NMRVNTX1BST0ZJTEVfREVGQVVMVFNbcHJvZmlsZV07XHJcbiAgcmV0dXJuIG92ZXJyaWRlcy5zaGFycGVuaW5nID8/IGRlZmF1bHRzLnNoYXJwZW5pbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFNoYXJwZW5pbmcocHJvZmlsZTogTG9zc2xlc3NQcm9maWxlS2V5LCB2YWx1ZTogbnVtYmVyIHwgbnVsbCk6IHZvaWQge1xyXG4gIGNvbnN0IGRlZmF1bHRzID0gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXTtcclxuICBjb25zdCBjbGFtcGVkID0gY2xhbXBTaGFycG5lc3ModmFsdWUpO1xyXG4gIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV0uc2hhcnBlbmluZyA9XHJcbiAgICBjbGFtcGVkID09PSBudWxsIHx8IGNsYW1wZWQgPT09IGRlZmF1bHRzLnNoYXJwZW5pbmcgPyBudWxsIDogY2xhbXBlZDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWZmZWN0aXZlQW5pbWVTaXplKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSk6IEFuaW1lNGtTaXplIHtcclxuICBjb25zdCBvdmVycmlkZXMgPSBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1Byb2ZpbGVzW3Byb2ZpbGVdO1xyXG4gIHJldHVybiBvdmVycmlkZXMuYW5pbWU0a1NpemUgPz8gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXS5hbmltZTRrU2l6ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0QW5pbWVTaXplKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSwgdmFsdWU6IEFuaW1lNGtTaXplIHwgbnVsbCk6IHZvaWQge1xyXG4gIGNvbnN0IGRlZmF1bHRzID0gTE9TU0xFU1NfUFJPRklMRV9ERUZBVUxUU1twcm9maWxlXTtcclxuICBjb25zdCByZXNvbHZlZCA9IHZhbHVlID8/IGRlZmF1bHRzLmFuaW1lNGtTaXplO1xyXG4gIGZvcm0udmFsdWUubG9zc2xlc3NTY2FsaW5nUHJvZmlsZXNbcHJvZmlsZV0uYW5pbWU0a1NpemUgPVxyXG4gICAgcmVzb2x2ZWQgPT09IGRlZmF1bHRzLmFuaW1lNGtTaXplID8gbnVsbCA6IHJlc29sdmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZmZlY3RpdmVBbmltZVZycyhwcm9maWxlOiBMb3NzbGVzc1Byb2ZpbGVLZXkpOiBib29sZWFuIHtcclxuICBjb25zdCBvdmVycmlkZXMgPSBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1Byb2ZpbGVzW3Byb2ZpbGVdO1xyXG4gIHJldHVybiBvdmVycmlkZXMuYW5pbWU0a1ZycyA/PyBMT1NTTEVTU19QUk9GSUxFX0RFRkFVTFRTW3Byb2ZpbGVdLmFuaW1lNGtWcnM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEFuaW1lVnJzKHByb2ZpbGU6IExvc3NsZXNzUHJvZmlsZUtleSwgdmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICBjb25zdCBkZWZhdWx0cyA9IExPU1NMRVNTX1BST0ZJTEVfREVGQVVMVFNbcHJvZmlsZV07XHJcbiAgZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdQcm9maWxlc1twcm9maWxlXS5hbmltZTRrVnJzID1cclxuICAgIHZhbHVlID09PSBkZWZhdWx0cy5hbmltZTRrVnJzID8gbnVsbCA6IHZhbHVlO1xyXG59XHJcblxyXG5jb25zdCBsb3NzbGVzc1BlcmZvcm1hbmNlTW9kZU1vZGVsID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldDogKCkgPT4gZ2V0RWZmZWN0aXZlUGVyZm9ybWFuY2VNb2RlKGFjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZSksXHJcbiAgc2V0OiAodmFsdWU6IGJvb2xlYW4pID0+IHtcclxuICAgIHNldFBlcmZvcm1hbmNlTW9kZShhY3RpdmVMb3NzbGVzc1Byb2ZpbGUudmFsdWUsICEhdmFsdWUpO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgbG9zc2xlc3NGbG93U2NhbGVNb2RlbCA9IGNvbXB1dGVkPG51bWJlciB8IG51bGw+KHtcclxuICBnZXQ6ICgpID0+IGdldEVmZmVjdGl2ZUZsb3dTY2FsZShhY3RpdmVMb3NzbGVzc1Byb2ZpbGUudmFsdWUpLFxyXG4gIHNldDogKHZhbHVlKSA9PiB7XHJcbiAgICBzZXRGbG93U2NhbGUoYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlLCB2YWx1ZSA/PyBudWxsKTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGxvc3NsZXNzUmVzb2x1dGlvblNjYWxlTW9kZWwgPSBjb21wdXRlZDxudW1iZXIgfCBudWxsPih7XHJcbiAgZ2V0OiAoKSA9PiBnZXRFZmZlY3RpdmVSZXNvbHV0aW9uU2NhbGUoYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlKSxcclxuICBzZXQ6ICh2YWx1ZSkgPT4ge1xyXG4gICAgc2V0UmVzb2x1dGlvblNjYWxlKGFjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZSwgdmFsdWUgPz8gbnVsbCk7XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCBsb3NzbGVzc1NjYWxpbmdNb2RlTW9kZWwgPSBjb21wdXRlZDxMb3NzbGVzc1NjYWxpbmdNb2RlPih7XHJcbiAgZ2V0OiAoKSA9PiBnZXRFZmZlY3RpdmVTY2FsaW5nTW9kZShhY3RpdmVMb3NzbGVzc1Byb2ZpbGUudmFsdWUpLFxyXG4gIHNldDogKHZhbHVlOiBMb3NzbGVzc1NjYWxpbmdNb2RlKSA9PiB7XHJcbiAgICBzZXRTY2FsaW5nTW9kZShhY3RpdmVMb3NzbGVzc1Byb2ZpbGUudmFsdWUsIHZhbHVlKTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGxvc3NsZXNzU2hhcnBlbmluZ01vZGVsID0gY29tcHV0ZWQ8bnVtYmVyPih7XHJcbiAgZ2V0OiAoKSA9PiBnZXRFZmZlY3RpdmVTaGFycGVuaW5nKGFjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZSksXHJcbiAgc2V0OiAodmFsdWU6IG51bWJlciB8IG51bGwpID0+IHtcclxuICAgIHNldFNoYXJwZW5pbmcoYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlLCB2YWx1ZSA/PyBudWxsKTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGxvc3NsZXNzQW5pbWVTaXplTW9kZWwgPSBjb21wdXRlZDxBbmltZTRrU2l6ZT4oe1xyXG4gIGdldDogKCkgPT4gZ2V0RWZmZWN0aXZlQW5pbWVTaXplKGFjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZSksXHJcbiAgc2V0OiAodmFsdWU6IEFuaW1lNGtTaXplIHwgbnVsbCkgPT4ge1xyXG4gICAgc2V0QW5pbWVTaXplKGFjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZSwgdmFsdWUpO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgbG9zc2xlc3NBbmltZVZyc01vZGVsID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldDogKCkgPT4gZ2V0RWZmZWN0aXZlQW5pbWVWcnMoYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlKSxcclxuICBzZXQ6ICh2YWx1ZTogYm9vbGVhbikgPT4ge1xyXG4gICAgc2V0QW5pbWVWcnMoYWN0aXZlTG9zc2xlc3NQcm9maWxlLnZhbHVlLCAhIXZhbHVlKTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IHNob3dMb3NzbGVzc1NoYXJwZW5pbmcgPSBjb21wdXRlZCgoKSA9PlxyXG4gIExPU1NMRVNTX1NDQUxJTkdfU0hBUlBFTklORy5oYXMobG9zc2xlc3NTY2FsaW5nTW9kZU1vZGVsLnZhbHVlKSxcclxuKTtcclxuY29uc3Qgc2hvd0xvc3NsZXNzUmVzb2x1dGlvbiA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBtb2RlID0gbG9zc2xlc3NTY2FsaW5nTW9kZU1vZGVsLnZhbHVlO1xyXG4gIHJldHVybiBtb2RlICE9PSBudWxsICYmIG1vZGUgIT09ICdvZmYnO1xyXG59KTtcclxuY29uc3Qgc2hvd0xvc3NsZXNzQW5pbWVPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gbG9zc2xlc3NTY2FsaW5nTW9kZU1vZGVsLnZhbHVlID09PSAnYW5pbWU0aycpO1xyXG5cclxuY29uc3QgaGFzQWN0aXZlTG9zc2xlc3NPdmVycmlkZXMgPSBjb21wdXRlZDxib29sZWFuPigoKSA9PiB7XHJcbiAgY29uc3Qgb3ZlcnJpZGVzID0gZm9ybS52YWx1ZS5sb3NzbGVzc1NjYWxpbmdQcm9maWxlc1thY3RpdmVMb3NzbGVzc1Byb2ZpbGUudmFsdWVdO1xyXG4gIHJldHVybiAoXHJcbiAgICBvdmVycmlkZXMucGVyZm9ybWFuY2VNb2RlICE9PSBudWxsIHx8XHJcbiAgICBvdmVycmlkZXMuZmxvd1NjYWxlICE9PSBudWxsIHx8XHJcbiAgICBvdmVycmlkZXMucmVzb2x1dGlvblNjYWxlICE9PSBudWxsIHx8XHJcbiAgICBvdmVycmlkZXMuc2NhbGluZ01vZGUgIT09IG51bGwgfHxcclxuICAgIG92ZXJyaWRlcy5zaGFycGVuaW5nICE9PSBudWxsIHx8XHJcbiAgICBvdmVycmlkZXMuYW5pbWU0a1NpemUgIT09IG51bGwgfHxcclxuICAgIG92ZXJyaWRlcy5hbmltZTRrVnJzICE9PSBudWxsXHJcbiAgKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiByZXNldEFjdGl2ZUxvc3NsZXNzUHJvZmlsZSgpOiB2b2lkIHtcclxuICBjb25zdCBvdmVycmlkZXMgPSBmb3JtLnZhbHVlLmxvc3NsZXNzU2NhbGluZ1Byb2ZpbGVzW2FjdGl2ZUxvc3NsZXNzUHJvZmlsZS52YWx1ZV07XHJcbiAgb3ZlcnJpZGVzLnBlcmZvcm1hbmNlTW9kZSA9IG51bGw7XHJcbiAgb3ZlcnJpZGVzLmZsb3dTY2FsZSA9IG51bGw7XHJcbiAgb3ZlcnJpZGVzLnJlc29sdXRpb25TY2FsZSA9IG51bGw7XHJcbiAgb3ZlcnJpZGVzLnNjYWxpbmdNb2RlID0gbnVsbDtcclxuICBvdmVycmlkZXMuc2hhcnBlbmluZyA9IG51bGw7XHJcbiAgb3ZlcnJpZGVzLmFuaW1lNGtTaXplID0gbnVsbDtcclxuICBvdmVycmlkZXMuYW5pbWU0a1ZycyA9IG51bGw7XHJcbn1cclxuLy8gVW5pZmllZCBuYW1lIGNvbWJvYm94IHN0YXRlIChzdXBwb3J0cyBQbGF5bml0ZSBzdWdnZXN0aW9ucyArIGZyZWUtZm9ybSlcclxuY29uc3QgbmFtZVNlbGVjdFZhbHVlID0gcmVmPHN0cmluZz4oJycpO1xyXG5jb25zdCBuYW1lT3B0aW9ucyA9IHJlZjx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdPihbXSk7XHJcbmNvbnN0IG5hbWVFcnJvciA9IHJlZignJyk7XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZU5hbWUoKSB7XHJcbiAgbmFtZUVycm9yLnZhbHVlID0gIVN0cmluZyhmb3JtLnZhbHVlLm5hbWUgPz8gJycpLnRyaW0oKSA/ICdOYW1lIGlzIHJlcXVpcmVkJyA6ICcnO1xyXG59XHJcbmNvbnN0IGZhbGxiYWNrT3B0aW9uID0gKHZhbHVlOiB1bmtub3duKSA9PiB7XHJcbiAgY29uc3QgdiA9IFN0cmluZyh2YWx1ZSA/PyAnJyk7XHJcbiAgY29uc3QgbGFiZWwgPSBTdHJpbmcoZm9ybS52YWx1ZS5uYW1lIHx8ICcnKS50cmltKCkgfHwgdjtcclxuICByZXR1cm4geyBsYWJlbCwgdmFsdWU6IHYgfTtcclxufTtcclxuY29uc3QgbmFtZVNlYXJjaFF1ZXJ5ID0gcmVmKCcnKTtcclxuY29uc3QgbmFtZVNlbGVjdE9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgLy8gUHJlZmVyIGR5bmFtaWNhbGx5IGJ1aWx0IG9wdGlvbnMgKGZyb20gc2VhcmNoKVxyXG4gIGlmIChuYW1lT3B0aW9ucy52YWx1ZS5sZW5ndGgpIHJldHVybiBuYW1lT3B0aW9ucy52YWx1ZTtcclxuICBjb25zdCBsaXN0OiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdID0gW107XHJcbiAgY29uc3QgY3VyID0gU3RyaW5nKGZvcm0udmFsdWUubmFtZSB8fCAnJykudHJpbSgpO1xyXG4gIGlmIChjdXIpIGxpc3QucHVzaCh7IGxhYmVsOiBgQ3VzdG9tOiBcIiR7Y3VyfVwiYCwgdmFsdWU6IGBfX2N1c3RvbV9fOiR7Y3VyfWAgfSk7XHJcbiAgaWYgKHBsYXluaXRlT3B0aW9ucy52YWx1ZS5sZW5ndGgpIHtcclxuICAgIGxpc3QucHVzaCguLi5wbGF5bml0ZU9wdGlvbnMudmFsdWUuc2xpY2UoMCwgMjApKTtcclxuICB9XHJcbiAgcmV0dXJuIGxpc3Q7XHJcbn0pO1xyXG5cclxuLy8gUG9wdWxhdGUgc3VnZ2VzdGlvbnMgaW1tZWRpYXRlbHkgb24gZm9jdXMgc28gZHJvcGRvd24gaXNuJ3QgZW1wdHlcclxuYXN5bmMgZnVuY3Rpb24gb25OYW1lRm9jdXMoKSB7XHJcbiAgLy8gU2hvdyBhIGZyaWVuZGx5IHBsYWNlaG9sZGVyIGltbWVkaWF0ZWx5IHRvIGF2b2lkIFwiTm8gRGF0YVwiXHJcbiAgaWYgKCFwbGF5bml0ZU9wdGlvbnMudmFsdWUubGVuZ3RoKSB7XHJcbiAgICBuYW1lT3B0aW9ucy52YWx1ZSA9IFtcclxuICAgICAgeyBsYWJlbDogJ0xvYWRpbmcgUGxheW5pdGUgZ2FtZXPigKYnLCB2YWx1ZTogJ19fbG9hZGluZ19fJywgZGlzYWJsZWQ6IHRydWUgfSBhcyBhbnksXHJcbiAgICBdO1xyXG4gIH1cclxuICAvLyBLaWNrIG9mZiBsb2FkaW5nIChkb27igJl0IGJsb2NrIHRoZSBVSSksIHRoZW4gcmVmcmVzaCBsaXN0XHJcbiAgbG9hZFBsYXluaXRlR2FtZXMoKVxyXG4gICAgLmNhdGNoKCgpID0+IHt9KVxyXG4gICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICBvbk5hbWVTZWFyY2gobmFtZVNlYXJjaFF1ZXJ5LnZhbHVlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlbnN1cmVOYW1lU2VsZWN0aW9uRnJvbUZvcm0oKSB7XHJcbiAgY29uc3QgY3VycmVudE5hbWUgPSBTdHJpbmcoZm9ybS52YWx1ZS5uYW1lIHx8ICcnKS50cmltKCk7XHJcbiAgY29uc3Qgb3B0czogeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH1bXSA9IFtdO1xyXG4gIGlmIChjdXJyZW50TmFtZSkge1xyXG4gICAgb3B0cy5wdXNoKHsgbGFiZWw6IGBDdXN0b206IFwiJHtjdXJyZW50TmFtZX1cImAsIHZhbHVlOiBgX19jdXN0b21fXzoke2N1cnJlbnROYW1lfWAgfSk7XHJcbiAgfVxyXG4gIGNvbnN0IHBpZCA9IGZvcm0udmFsdWUucGxheW5pdGVJZDtcclxuICBpZiAocGlkKSB7XHJcbiAgICBjb25zdCBmb3VuZCA9IHBsYXluaXRlT3B0aW9ucy52YWx1ZS5maW5kKChvKSA9PiBvLnZhbHVlID09PSBTdHJpbmcocGlkKSk7XHJcbiAgICBpZiAoZm91bmQpIG9wdHMucHVzaChmb3VuZCk7XHJcbiAgICBlbHNlIGlmIChjdXJyZW50TmFtZSkgb3B0cy5wdXNoKHsgbGFiZWw6IGN1cnJlbnROYW1lLCB2YWx1ZTogU3RyaW5nKHBpZCkgfSk7XHJcbiAgfVxyXG4gIG5hbWVPcHRpb25zLnZhbHVlID0gb3B0cztcclxuICBuYW1lU2VsZWN0VmFsdWUudmFsdWUgPSBwaWQgPyBTdHJpbmcocGlkKSA6IGN1cnJlbnROYW1lID8gYF9fY3VzdG9tX186JHtjdXJyZW50TmFtZX1gIDogJyc7XHJcbn1cclxuZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgZW1pdCgndXBkYXRlOm1vZGVsVmFsdWUnLCBmYWxzZSk7XHJcbn1cclxuZnVuY3Rpb24gYWRkUHJlcCgpIHtcclxuICBmb3JtLnZhbHVlLnByZXBDbWQucHVzaCh7XHJcbiAgICBkbzogJycsXHJcbiAgICB1bmRvOiAnJyxcclxuICAgIC4uLihpc1dpbmRvd3MudmFsdWUgPyB7IGVsZXZhdGVkOiBmYWxzZSB9IDoge30pLFxyXG4gIH0pO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB1cGRhdGVTaGFkb3dzKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTdGF0ZSgpIHtcclxuICBmb3JtLnZhbHVlLnN0YXRlQ21kLnB1c2goe1xyXG4gICAgZG86ICcnLFxyXG4gICAgdW5kbzogJycsXHJcbiAgICAuLi4oaXNXaW5kb3dzLnZhbHVlID8geyBlbGV2YXRlZDogZmFsc2UgfSA6IHt9KSxcclxuICB9KTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdXBkYXRlU2hhZG93cygpKTtcclxufVxyXG5jb25zdCBzYXZpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBzaG93RGVsZXRlQ29uZmlybSA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHNob3dBZHZhbmNlZCA9IHJlZihmYWxzZSk7XHJcblxyXG4vLyBDb3ZlciBmaW5kZXIgc3RhdGUgKGRpc2FibGVkIGZvciBQbGF5bml0ZS1tYW5hZ2VkIGFwcHMpXHJcbmNvbnN0IHNob3dDb3Zlck1vZGFsID0gcmVmKGZhbHNlKTtcclxuY29uc3QgY292ZXJTZWFyY2hpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBjb3ZlckJ1c3kgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBjb3ZlckNhbmRpZGF0ZXMgPSByZWY8Q292ZXJDYW5kaWRhdGVbXT4oW10pO1xyXG5cclxuZnVuY3Rpb24gZ2V0U2VhcmNoQnVja2V0KG5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IHByZWZpeCA9IChuYW1lIHx8ICcnKVxyXG4gICAgLnN1YnN0cmluZygwLCBNYXRoLm1pbigobmFtZSB8fCAnJykubGVuZ3RoLCAyKSlcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAucmVwbGFjZSgvW15hLXpcXGRdL2csICcnKTtcclxuICByZXR1cm4gcHJlZml4IHx8ICdAJztcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2VhcmNoQ292ZXJzKG5hbWU6IHN0cmluZyk6IFByb21pc2U8Q292ZXJDYW5kaWRhdGVbXT4ge1xyXG4gIGlmICghbmFtZSkgcmV0dXJuIFtdO1xyXG4gIGNvbnN0IHNlYXJjaE5hbWUgPSBuYW1lLnJlcGxhY2UoL1xccysvZywgJy4nKS50b0xvd2VyQ2FzZSgpO1xyXG4gIC8vIFVzZSByYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tIHRvIGF2b2lkIENPUlMgaXNzdWVzXHJcbiAgY29uc3QgZGJVcmwgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0xpemFyZEJ5dGUvR2FtZURCL2doLXBhZ2VzJztcclxuICBjb25zdCBidWNrZXQgPSBnZXRTZWFyY2hCdWNrZXQobmFtZSk7XHJcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7ZGJVcmx9L2J1Y2tldHMvJHtidWNrZXR9Lmpzb25gKTtcclxuICBpZiAoIXJlcy5vaykgcmV0dXJuIFtdO1xyXG4gIGNvbnN0IG1hcHMgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gIGNvbnN0IGlkcyA9IE9iamVjdC5rZXlzKG1hcHMgfHwge30pO1xyXG4gIGNvbnN0IHByb21pc2VzID0gaWRzLm1hcChhc3luYyAoaWQpID0+IHtcclxuICAgIGNvbnN0IGl0ZW0gPSBtYXBzW2lkXTtcclxuICAgIGlmICghaXRlbT8ubmFtZSkgcmV0dXJuIG51bGw7XHJcbiAgICBpZiAoU3RyaW5nKGl0ZW0ubmFtZSkucmVwbGFjZSgvXFxzKy9nLCAnLicpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChzZWFyY2hOYW1lKSkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaChgJHtkYlVybH0vZ2FtZXMvJHtpZH0uanNvbmApO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCByLmpzb24oKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0pO1xyXG4gIGNvbnN0IHJlc3VsdHMgPSAoYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgcmV0dXJuIHJlc3VsdHNcclxuICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gJiYgaXRlbS5jb3ZlciAmJiBpdGVtLmNvdmVyLnVybClcclxuICAgIC5tYXAoKGdhbWUpID0+IHtcclxuICAgICAgY29uc3QgdGh1bWI6IHN0cmluZyA9IGdhbWUuY292ZXIudXJsO1xyXG4gICAgICBjb25zdCBkb3RJbmRleCA9IHRodW1iLmxhc3RJbmRleE9mKCcuJyk7XHJcbiAgICAgIGNvbnN0IHNsYXNoSW5kZXggPSB0aHVtYi5sYXN0SW5kZXhPZignLycpO1xyXG4gICAgICBpZiAoZG90SW5kZXggPCAwIHx8IHNsYXNoSW5kZXggPCAwKSByZXR1cm4gbnVsbCBhcyBhbnk7XHJcbiAgICAgIGNvbnN0IHNsdWcgPSB0aHVtYi5zdWJzdHJpbmcoc2xhc2hJbmRleCArIDEsIGRvdEluZGV4KTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiBnYW1lLm5hbWUsXHJcbiAgICAgICAga2V5OiBgaWdkYl8ke2dhbWUuaWR9YCxcclxuICAgICAgICB1cmw6IGBodHRwczovL2ltYWdlcy5pZ2RiLmNvbS9pZ2RiL2ltYWdlL3VwbG9hZC90X2NvdmVyX2JpZy8ke3NsdWd9LmpwZ2AsXHJcbiAgICAgICAgc2F2ZVVybDogYGh0dHBzOi8vaW1hZ2VzLmlnZGIuY29tL2lnZGIvaW1hZ2UvdXBsb2FkL3RfY292ZXJfYmlnXzJ4LyR7c2x1Z30ucG5nYCxcclxuICAgICAgfSBhcyBDb3ZlckNhbmRpZGF0ZTtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvcGVuQ292ZXJGaW5kZXIoKSB7XHJcbiAgaWYgKGlzUGxheW5pdGVNYW5hZ2VkLnZhbHVlKSByZXR1cm47XHJcbiAgY292ZXJDYW5kaWRhdGVzLnZhbHVlID0gW107XHJcbiAgc2hvd0NvdmVyTW9kYWwudmFsdWUgPSB0cnVlO1xyXG4gIGNvdmVyU2VhcmNoaW5nLnZhbHVlID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY292ZXJDYW5kaWRhdGVzLnZhbHVlID0gYXdhaXQgc2VhcmNoQ292ZXJzKFN0cmluZyhmb3JtLnZhbHVlLm5hbWUgfHwgJycpKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgY292ZXJTZWFyY2hpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHVzZUNvdmVyKGNvdmVyOiBDb3ZlckNhbmRpZGF0ZSkge1xyXG4gIGlmICghY292ZXIgfHwgY292ZXJCdXN5LnZhbHVlKSByZXR1cm47XHJcbiAgY292ZXJCdXN5LnZhbHVlID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAucG9zdChcclxuICAgICAgJy4vYXBpL2NvdmVycy91cGxvYWQnLFxyXG4gICAgICB7IGtleTogY292ZXIua2V5LCB1cmw6IGNvdmVyLnNhdmVVcmwgfSxcclxuICAgICAgeyBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSwgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBpZiAoci5zdGF0dXMgPj0gMjAwICYmIHIuc3RhdHVzIDwgMzAwICYmIHIuZGF0YSAmJiByLmRhdGEucGF0aCkge1xyXG4gICAgICBmb3JtLnZhbHVlLmltYWdlUGF0aCA9IFN0cmluZyhyLmRhdGEucGF0aCB8fCAnJyk7XHJcbiAgICAgIHNob3dDb3Zlck1vZGFsLnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGNvdmVyQnVzeS52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUGxhdGZvcm0gKyBQbGF5bml0ZSBkZXRlY3Rpb25cclxuY29uc3QgY29uZmlnU3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCBwbGF0Zm9ybU5hbWUgPSBjb21wdXRlZCgoKSA9PiAoY29uZmlnU3RvcmUubWV0YWRhdGE/LnBsYXRmb3JtIHx8ICcnKS50b0xvd2VyQ2FzZSgpKTtcclxuY29uc3QgaXNXaW5kb3dzID0gY29tcHV0ZWQoKCkgPT4gcGxhdGZvcm1OYW1lLnZhbHVlID09PSAnd2luZG93cycpO1xyXG5jb25zdCBpc0xpbnV4ID0gY29tcHV0ZWQoKCkgPT4gcGxhdGZvcm1OYW1lLnZhbHVlID09PSAnbGludXgnKTtcclxuY29uc3QgaXNNYWMgPSBjb21wdXRlZCgoKSA9PiBwbGF0Zm9ybU5hbWUudmFsdWUgPT09ICdtYWNvcycpO1xyXG5jb25zdCBnYW1lcGFkT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgeyBsYWJlbDogJ0RlZmF1bHQgKEdsb2JhbCknLCB2YWx1ZTogJycgfSxcclxuICAgIHsgbGFiZWw6ICdEaXNhYmxlZCcsIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgICB7IGxhYmVsOiAnQXV0bycsIHZhbHVlOiAnYXV0bycgfSxcclxuICBdO1xyXG4gIGlmIChpc0xpbnV4LnZhbHVlKSB7XHJcbiAgICBvcHRpb25zLnB1c2goXHJcbiAgICAgIHsgbGFiZWw6ICdEdWFsU2Vuc2UgKFBTNSknLCB2YWx1ZTogJ2RzNScgfSxcclxuICAgICAgeyBsYWJlbDogJ1N3aXRjaCBQcm8nLCB2YWx1ZTogJ3N3aXRjaCcgfSxcclxuICAgICAgeyBsYWJlbDogJ1hib3ggT25lJywgdmFsdWU6ICd4b25lJyB9LFxyXG4gICAgKTtcclxuICB9XHJcbiAgaWYgKGlzV2luZG93cy52YWx1ZSkge1xyXG4gICAgb3B0aW9ucy5wdXNoKHsgbGFiZWw6ICdEdWFsU2hvY2sgNCcsIHZhbHVlOiAnZHM0JyB9LCB7IGxhYmVsOiAnWGJveCAzNjAnLCB2YWx1ZTogJ3gzNjAnIH0pO1xyXG4gIH1cclxuICByZXR1cm4gb3B0aW9ucztcclxufSk7XHJcbmNvbnN0IGRkQ29uZmlnT3B0aW9uID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpPy5kZF9jb25maWd1cmF0aW9uX29wdGlvbiA/PyAnZGlzYWJsZWQnLFxyXG4pO1xyXG5jb25zdCBjYXB0dXJlTWV0aG9kID0gY29tcHV0ZWQoKCkgPT4gKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpPy5jYXB0dXJlID8/ICcnKTtcclxuY29uc3QgVklSVFVBTF9ESVNQTEFZX1NFTEVDVElPTiA9ICdzdW5zaGluZTpzdWRvdmRhX3ZpcnR1YWxfZGlzcGxheSc7XHJcbmNvbnN0IGdsb2JhbE91dHB1dE5hbWUgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgbmFtZSA9IChjb25maWdTdG9yZS5jb25maWcgYXMgYW55KT8ub3V0cHV0X25hbWU7XHJcbiAgcmV0dXJuIHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyA/IG5hbWUgOiAnJztcclxufSk7XHJcbmNvbnN0IGdsb2JhbFZpcnR1YWxEaXNwbGF5TW9kZSA9IGNvbXB1dGVkPEFwcFZpcnR1YWxEaXNwbGF5TW9kZT4oKCkgPT4ge1xyXG4gIGNvbnN0IG1vZGUgPSAoY29uZmlnU3RvcmUuY29uZmlnIGFzIGFueSk/LnZpcnR1YWxfZGlzcGxheV9tb2RlO1xyXG4gIHJldHVybiBwYXJzZUFwcFZpcnR1YWxEaXNwbGF5TW9kZShtb2RlKSA/PyAnZGlzYWJsZWQnO1xyXG59KTtcclxuY29uc3QgZ2xvYmFsVmlydHVhbERpc3BsYXlMYXlvdXQgPSBjb21wdXRlZDxBcHBWaXJ0dWFsRGlzcGxheUxheW91dD4oKCkgPT4ge1xyXG4gIGNvbnN0IGxheW91dCA9IChjb25maWdTdG9yZS5jb25maWcgYXMgYW55KT8udmlydHVhbF9kaXNwbGF5X2xheW91dDtcclxuICByZXR1cm4gcGFyc2VBcHBWaXJ0dWFsRGlzcGxheUxheW91dChsYXlvdXQpID8/ICdleGNsdXNpdmUnO1xyXG59KTtcclxuY29uc3QgcmVzb2x2ZWRWaXJ0dWFsRGlzcGxheU1vZGUgPSBjb21wdXRlZDxBcHBWaXJ0dWFsRGlzcGxheU1vZGU+KFxyXG4gICgpID0+IGZvcm0udmFsdWUudmlydHVhbERpc3BsYXlNb2RlID8/IGdsb2JhbFZpcnR1YWxEaXNwbGF5TW9kZS52YWx1ZSxcclxuKTtcclxuY29uc3QgcmVzb2x2ZWRWaXJ0dWFsRGlzcGxheUxheW91dCA9IGNvbXB1dGVkPEFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0PihcclxuICAoKSA9PiBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TGF5b3V0ID8/IGdsb2JhbFZpcnR1YWxEaXNwbGF5TGF5b3V0LnZhbHVlLFxyXG4pO1xyXG5jb25zdCBBUFBfVklSVFVBTF9ESVNQTEFZX01PREVfTEFCRUxfS0VZUzogUmVjb3JkPEFwcFZpcnR1YWxEaXNwbGF5TW9kZSwgc3RyaW5nPiA9IHtcclxuICBkaXNhYmxlZDogJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbW9kZV9kaXNhYmxlZCcsXHJcbiAgcGVyX2NsaWVudDogJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbW9kZV9wZXJfY2xpZW50JyxcclxuICBzaGFyZWQ6ICdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfc2hhcmVkJyxcclxufTtcclxuY29uc3QgYXBwVmlydHVhbERpc3BsYXlNb2RlT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgKFsnZ2xvYmFsJywgLi4uQVBQX1ZJUlRVQUxfRElTUExBWV9NT0RFUy5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZSAhPT0gJ2Rpc2FibGVkJyldIGFzIGNvbnN0KS5tYXAoXHJcbiAgICAodmFsdWUpID0+ICh7XHJcbiAgICAgIHZhbHVlLFxyXG4gICAgICBsYWJlbDpcclxuICAgICAgICB2YWx1ZSA9PT0gJ2dsb2JhbCdcclxuICAgICAgICAgID8gdCgnY29uZmlnLmFwcF92aXJ0dWFsX2Rpc3BsYXlfbW9kZV9mb2xsb3dfZ2xvYmFsJylcclxuICAgICAgICAgIDogdChBUFBfVklSVFVBTF9ESVNQTEFZX01PREVfTEFCRUxfS0VZU1t2YWx1ZV0pLFxyXG4gICAgfSksXHJcbiAgKSxcclxuKTtcclxuY29uc3QgYXBwVmlydHVhbERpc3BsYXlNb2RlU2VsZWN0aW9uID0gY29tcHV0ZWQ8QXBwVmlydHVhbERpc3BsYXlNb2RlU2VsZWN0aW9uPih7XHJcbiAgZ2V0OiAoKSA9PiBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZSA/PyAnZ2xvYmFsJyxcclxuICBzZXQ6ICh2YWx1ZSkgPT4ge1xyXG4gICAgZm9ybS52YWx1ZS52aXJ0dWFsRGlzcGxheU1vZGUgPSB2YWx1ZSA9PT0gJ2dsb2JhbCcgPyBudWxsIDogdmFsdWU7XHJcbiAgfSxcclxufSk7XHJcbmNvbnN0IGFwcFZpcnR1YWxEaXNwbGF5TGF5b3V0T3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgQVBQX1ZJUlRVQUxfRElTUExBWV9MQVlPVVRTLm1hcCgodmFsdWUpID0+ICh7XHJcbiAgICB2YWx1ZSxcclxuICAgIGxhYmVsOiB0KGBjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF8ke3ZhbHVlfWApLFxyXG4gICAgZGVzY3JpcHRpb246IHQoYGNvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0XyR7dmFsdWV9X2Rlc2NgKSxcclxuICB9KSksXHJcbik7XHJcbmNvbnN0IGFwcERkQ29uZmlndXJhdGlvbk9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogdCgnX2NvbW1vbi5kaXNhYmxlZCcpIGFzIHN0cmluZywgdmFsdWU6ICdkaXNhYmxlZCcgfSxcclxuICB7IGxhYmVsOiB0KCdjb25maWcuZGRfY29uZmlnX3ZlcmlmeV9vbmx5JykgYXMgc3RyaW5nLCB2YWx1ZTogJ3ZlcmlmeV9vbmx5JyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9jb25maWdfZW5zdXJlX2FjdGl2ZScpIGFzIHN0cmluZywgdmFsdWU6ICdlbnN1cmVfYWN0aXZlJyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9jb25maWdfZW5zdXJlX3ByaW1hcnknKSBhcyBzdHJpbmcsIHZhbHVlOiAnZW5zdXJlX3ByaW1hcnknIH0sXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX2NvbmZpZ19lbnN1cmVfb25seV9kaXNwbGF5JykgYXMgc3RyaW5nLCB2YWx1ZTogJ2Vuc3VyZV9vbmx5X2Rpc3BsYXknIH0sXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gc2VsZWN0VmlydHVhbERpc3BsYXlMYXlvdXQodjogdW5rbm93bikge1xyXG4gIGNvbnN0IHN2ID0gU3RyaW5nKHYpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChBUFBfVklSVFVBTF9ESVNQTEFZX0xBWU9VVFMuaW5jbHVkZXMoc3YgYXMgQXBwVmlydHVhbERpc3BsYXlMYXlvdXQpKSB7XHJcbiAgICBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gc3YgYXMgQXBwVmlydHVhbERpc3BsYXlMYXlvdXQ7XHJcbiAgfVxyXG59XHJcbmNvbnN0IGxhc3RQaHlzaWNhbE91dHB1dCA9IHJlZignJyk7XHJcbmNvbnN0IGxhc3RWaXJ0dWFsRGlzcGxheU1vZGUgPSByZWY8QXBwVmlydHVhbERpc3BsYXlNb2RlIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGRpc3BsYXlTZWxlY3Rpb24gPSBjb21wdXRlZDxEaXNwbGF5U2VsZWN0aW9uPih7XHJcbiAgZ2V0OiAoKSA9PiB7XHJcbiAgICBjb25zdCBjdXJyZW50T3V0cHV0ID0gdHlwZW9mIGZvcm0udmFsdWUub3V0cHV0ID09PSAnc3RyaW5nJyA/IGZvcm0udmFsdWUub3V0cHV0LnRyaW0oKSA6ICcnO1xyXG4gICAgY29uc3QgZ2xvYmFsTW9kZSA9IGdsb2JhbFZpcnR1YWxEaXNwbGF5TW9kZS52YWx1ZTtcclxuICAgIGNvbnN0IGFwcE1vZGUgPSBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZTtcclxuICAgIGlmIChmb3JtLnZhbHVlLnZpcnR1YWxTY3JlZW4gfHwgZm9ybS52YWx1ZS5vdXRwdXQgPT09IFZJUlRVQUxfRElTUExBWV9TRUxFQ1RJT04pIHtcclxuICAgICAgcmV0dXJuICd2aXJ0dWFsJztcclxuICAgIH1cclxuICAgIGlmIChjdXJyZW50T3V0cHV0KSB7XHJcbiAgICAgIHJldHVybiAncGh5c2ljYWwnO1xyXG4gICAgfVxyXG4gICAgaWYgKGFwcE1vZGUgPT09ICdkaXNhYmxlZCcpIHtcclxuICAgICAgcmV0dXJuICdwaHlzaWNhbCc7XHJcbiAgICB9XHJcbiAgICBpZiAoYXBwTW9kZSAhPT0gbnVsbCAmJiBhcHBNb2RlICE9PSBnbG9iYWxNb2RlKSB7XHJcbiAgICAgIHJldHVybiAndmlydHVhbCc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJ2dsb2JhbCc7XHJcbiAgfSxcclxuICBzZXQ6IChzZWxlY3Rpb24pID0+IHtcclxuICAgIGlmIChzZWxlY3Rpb24gPT09ICd2aXJ0dWFsJykge1xyXG4gICAgICBmb3JtLnZhbHVlLnZpcnR1YWxTY3JlZW4gPSB0cnVlO1xyXG4gICAgICBpZiAoZm9ybS52YWx1ZS52aXJ0dWFsRGlzcGxheU1vZGUgPT09ICdkaXNhYmxlZCcpIHtcclxuICAgICAgICBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZSA9XHJcbiAgICAgICAgICBsYXN0VmlydHVhbERpc3BsYXlNb2RlLnZhbHVlID8/IGdsb2JhbFZpcnR1YWxEaXNwbGF5TW9kZS52YWx1ZSA/PyBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGZvcm0udmFsdWUub3V0cHV0ID0gJyc7XHJcbiAgICAgIGZvcm0udmFsdWUuZGRDb25maWd1cmF0aW9uT3B0aW9uID0gbnVsbDtcclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uID09PSAncGh5c2ljYWwnKSB7XHJcbiAgICAgIGlmIChmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZSAmJiBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZSAhPT0gJ2Rpc2FibGVkJykge1xyXG4gICAgICAgIGxhc3RWaXJ0dWFsRGlzcGxheU1vZGUudmFsdWUgPSBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZTtcclxuICAgICAgfVxyXG4gICAgICBmb3JtLnZhbHVlLnZpcnR1YWxEaXNwbGF5TW9kZSA9ICdkaXNhYmxlZCc7XHJcbiAgICAgIGZvcm0udmFsdWUudmlydHVhbFNjcmVlbiA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBjdXJyZW50ID0gdHlwZW9mIGZvcm0udmFsdWUub3V0cHV0ID09PSAnc3RyaW5nJyA/IGZvcm0udmFsdWUub3V0cHV0LnRyaW0oKSA6ICcnO1xyXG4gICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudCA9PT0gVklSVFVBTF9ESVNQTEFZX1NFTEVDVElPTikge1xyXG4gICAgICAgIGlmIChsYXN0UGh5c2ljYWxPdXRwdXQudmFsdWUpIHtcclxuICAgICAgICAgIGZvcm0udmFsdWUub3V0cHV0ID0gbGFzdFBoeXNpY2FsT3V0cHV0LnZhbHVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2xvYmFsT3V0cHV0TmFtZS52YWx1ZSAmJiBnbG9iYWxPdXRwdXROYW1lLnZhbHVlICE9PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OKSB7XHJcbiAgICAgICAgICBmb3JtLnZhbHVlLm91dHB1dCA9IGdsb2JhbE91dHB1dE5hbWUudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3JtLnZhbHVlLnZpcnR1YWxTY3JlZW4gPSBmYWxzZTtcclxuICAgICAgZm9ybS52YWx1ZS52aXJ0dWFsRGlzcGxheU1vZGUgPSBudWxsO1xyXG4gICAgICBmb3JtLnZhbHVlLm91dHB1dCA9ICcnO1xyXG4gICAgICBmb3JtLnZhbHVlLmRkQ29uZmlndXJhdGlvbk9wdGlvbiA9IG51bGw7XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcbmNvbnN0IGRpc3BsYXlPdmVycmlkZUVuYWJsZWQgPSBjb21wdXRlZDxib29sZWFuPih7XHJcbiAgZ2V0OiAoKSA9PiBkaXNwbGF5U2VsZWN0aW9uLnZhbHVlICE9PSAnZ2xvYmFsJyxcclxuICBzZXQ6IChlbmFibGVkKSA9PiB7XHJcbiAgICBpZiAoIWVuYWJsZWQpIHtcclxuICAgICAgZGlzcGxheVNlbGVjdGlvbi52YWx1ZSA9ICdnbG9iYWwnO1xyXG4gICAgfSBlbHNlIGlmIChkaXNwbGF5U2VsZWN0aW9uLnZhbHVlID09PSAnZ2xvYmFsJykge1xyXG4gICAgICBkaXNwbGF5U2VsZWN0aW9uLnZhbHVlID0gJ3ZpcnR1YWwnO1xyXG4gICAgfVxyXG4gIH0sXHJcbn0pO1xyXG5jb25zdCB3aW5kb3dzRGlzcGxheVZlcnNpb24gPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgdiA9IChjb25maWdTdG9yZS5tZXRhZGF0YSBhcyBhbnkpPy53aW5kb3dzX2Rpc3BsYXlfdmVyc2lvbjtcclxuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6ICcnO1xyXG59KTtcclxuY29uc3Qgd2luZG93c0J1aWxkTnVtYmVyID0gY29tcHV0ZWQ8bnVtYmVyIHwgbnVsbD4oKCkgPT4ge1xyXG4gIGNvbnN0IHJhdyA9IChjb25maWdTdG9yZS5tZXRhZGF0YSBhcyBhbnkpPy53aW5kb3dzX2J1aWxkX251bWJlcjtcclxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHJhdykpIHJldHVybiByYXc7XHJcbiAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIocmF3KTtcclxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSkgcmV0dXJuIHBhcnNlZDtcclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn0pO1xyXG5jb25zdCBhdXRvQ2FwdHVyZVVzZXNXZ2MgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybiBmYWxzZTtcclxuICBjb25zdCBkaXNwbGF5VmVyc2lvbiA9IHdpbmRvd3NEaXNwbGF5VmVyc2lvbi52YWx1ZS50b1VwcGVyQ2FzZSgpO1xyXG4gIGlmIChcclxuICAgIGRpc3BsYXlWZXJzaW9uLmluY2x1ZGVzKCcyM0gyJykgfHxcclxuICAgIGRpc3BsYXlWZXJzaW9uLmluY2x1ZGVzKCcyNEgxJykgfHxcclxuICAgIGRpc3BsYXlWZXJzaW9uLmluY2x1ZGVzKCcyNEgyJylcclxuICApIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBjb25zdCBidWlsZCA9IHdpbmRvd3NCdWlsZE51bWJlci52YWx1ZTtcclxuICBpZiAoYnVpbGQgIT09IG51bGwpIHtcclxuICAgIC8vIFdpbmRvd3MgMTEgMjNIMiBjb3JyZXNwb25kcyB0byBidWlsZCAyMjYzMTsgdHJlYXQgbmV3ZXIgYnVpbGRzIGFzIGVxdWl2YWxlbnQgb3IgYmV0dGVyXHJcbiAgICByZXR1cm4gYnVpbGQgPj0gMjI2MzE7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcbmNvbnN0IHZpcnR1YWxPdXRwdXROYW1lID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IG91dHB1dE5hbWUgPSAoY29uZmlnU3RvcmUuY29uZmlnIGFzIGFueSk/Lm91dHB1dF9uYW1lO1xyXG4gIHJldHVybiB0eXBlb2Ygb3V0cHV0TmFtZSA9PT0gJ3N0cmluZycgPyBvdXRwdXROYW1lIDogJyc7XHJcbn0pO1xyXG5jb25zdCB1c2luZ1ZpcnR1YWxEaXNwbGF5ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHNlbGVjdGlvbiA9IGRpc3BsYXlTZWxlY3Rpb24udmFsdWU7XHJcbiAgaWYgKHNlbGVjdGlvbiA9PT0gJ3ZpcnR1YWwnKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAoc2VsZWN0aW9uID09PSAncGh5c2ljYWwnKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3QgbW9kZSA9IHJlc29sdmVkVmlydHVhbERpc3BsYXlNb2RlLnZhbHVlO1xyXG4gIGlmIChtb2RlID09PSAncGVyX2NsaWVudCcgfHwgbW9kZSA9PT0gJ3NoYXJlZCcpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBpZiAobW9kZSA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgcmV0dXJuIHZpcnR1YWxPdXRwdXROYW1lLnZhbHVlID09PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5jb25zdCBza2lwRGlzcGxheVdhcm5pbmdzID0gY29tcHV0ZWQoKCkgPT4gdXNpbmdWaXJ0dWFsRGlzcGxheS52YWx1ZSk7XHJcbmNvbnN0IGRpc3BsYXlEZXZpY2VzID0gcmVmPERpc3BsYXlEZXZpY2VbXT4oW10pO1xyXG5jb25zdCBkaXNwbGF5RGV2aWNlc0xvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBkaXNwbGF5RGV2aWNlc0Vycm9yID0gcmVmKCcnKTtcclxuY29uc3QgZGlzcGxheU5hbWVDYWNoZSA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pih7fSk7XHJcbmNvbnN0IHBoeXNpY2FsT3V0cHV0TW9kZWwgPSBjb21wdXRlZDxzdHJpbmcgfCBudWxsPih7XHJcbiAgZ2V0OiAoKSA9PiB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHR5cGVvZiBmb3JtLnZhbHVlLm91dHB1dCA9PT0gJ3N0cmluZycgPyBmb3JtLnZhbHVlLm91dHB1dC50cmltKCkgOiAnJztcclxuICAgIHJldHVybiB2YWx1ZSB8fCBudWxsO1xyXG4gIH0sXHJcbiAgc2V0OiAodmFsdWUpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUudHJpbSgpIDogJyc7XHJcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHtcclxuICAgICAgZGlzcGxheVNlbGVjdGlvbi52YWx1ZSA9ICdnbG9iYWwnO1xyXG4gICAgICBkaXNwbGF5T3ZlcnJpZGVFbmFibGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvcm0udmFsdWUub3V0cHV0ID0gbm9ybWFsaXplZDtcclxuICAgIGZvcm0udmFsdWUudmlydHVhbFNjcmVlbiA9IGZhbHNlO1xyXG4gICAgbGFzdFBoeXNpY2FsT3V0cHV0LnZhbHVlID0gbm9ybWFsaXplZDtcclxuICAgIGRpc3BsYXlTZWxlY3Rpb24udmFsdWUgPSAncGh5c2ljYWwnO1xyXG4gICAgZGlzcGxheU92ZXJyaWRlRW5hYmxlZC52YWx1ZSA9IHRydWU7XHJcbiAgfSxcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkRGlzcGxheURldmljZXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZGlzcGxheURldmljZXNMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICBkaXNwbGF5RGV2aWNlc0Vycm9yLnZhbHVlID0gJyc7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0PERpc3BsYXlEZXZpY2VbXT4oJy9hcGkvZGlzcGxheS1kZXZpY2VzJywge1xyXG4gICAgICBwYXJhbXM6IHsgZGV0YWlsOiAnZnVsbCcgfSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZGV2aWNlcyA9IEFycmF5LmlzQXJyYXkocmVzLmRhdGEpID8gcmVzLmRhdGEgOiBbXTtcclxuICAgIGRpc3BsYXlEZXZpY2VzLnZhbHVlID0gZGV2aWNlcztcclxuICAgIGNhY2hlRGlzcGxheU5hbWVzKGRldmljZXMpO1xyXG4gIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgZGlzcGxheURldmljZXNFcnJvci52YWx1ZSA9IGU/Lm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIGRpc3BsYXkgZGV2aWNlcyc7XHJcbiAgICBkaXNwbGF5RGV2aWNlcy52YWx1ZSA9IFtdO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBkaXNwbGF5RGV2aWNlc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZURpc3BsYXlLZXkodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gJyc7XHJcbiAgcmV0dXJuIHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYWNoZURpc3BsYXlOYW1lcyhkZXZpY2VzOiBEaXNwbGF5RGV2aWNlW10pOiB2b2lkIHtcclxuICBpZiAoIWRldmljZXMubGVuZ3RoKSByZXR1cm47XHJcbiAgY29uc3QgdXBkYXRlZCA9IHsgLi4uZGlzcGxheU5hbWVDYWNoZS52YWx1ZSB9O1xyXG4gIGZvciAoY29uc3QgZGV2aWNlIG9mIGRldmljZXMpIHtcclxuICAgIGNvbnN0IGxhYmVsID0gZGV2aWNlLmZyaWVuZGx5X25hbWUgfHwgZGV2aWNlLmRpc3BsYXlfbmFtZTtcclxuICAgIGlmICghbGFiZWwpIGNvbnRpbnVlO1xyXG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgW2RldmljZS5kZXZpY2VfaWQsIGRldmljZS5kaXNwbGF5X25hbWVdKSB7XHJcbiAgICAgIGNvbnN0IGtleSA9IG5vcm1hbGl6ZURpc3BsYXlLZXkoY2FuZGlkYXRlKTtcclxuICAgICAgaWYgKCFrZXkpIGNvbnRpbnVlO1xyXG4gICAgICB1cGRhdGVkW2tleV0gPSBsYWJlbDtcclxuICAgIH1cclxuICB9XHJcbiAgZGlzcGxheU5hbWVDYWNoZS52YWx1ZSA9IHVwZGF0ZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhY2hlZERpc3BsYXlMYWJlbCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgY29uc3Qga2V5ID0gbm9ybWFsaXplRGlzcGxheUtleSh2YWx1ZSk7XHJcbiAgaWYgKCFrZXkpIHJldHVybiBudWxsO1xyXG4gIHJldHVybiBkaXNwbGF5TmFtZUNhY2hlLnZhbHVlW2tleV0gPz8gbnVsbDtcclxufVxyXG5cclxuY29uc3QgZGlzcGxheURldmljZU9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3Qgb3B0czogQXJyYXk8e1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZztcclxuICAgIGlkPzogc3RyaW5nO1xyXG4gICAgYWN0aXZlPzogYm9vbGVhbiB8IG51bGw7XHJcbiAgfT4gPSBbXTtcclxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgZm9yIChjb25zdCBkIG9mIGRpc3BsYXlEZXZpY2VzLnZhbHVlKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IGQuZGV2aWNlX2lkIHx8IGQuZGlzcGxheV9uYW1lIHx8ICcnO1xyXG4gICAgaWYgKCF2YWx1ZSB8fCBzZWVuLmhhcyh2YWx1ZSkpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBkLmZyaWVuZGx5X25hbWUgfHwgZC5kaXNwbGF5X25hbWUgfHwgJ0Rpc3BsYXknO1xyXG4gICAgY29uc3QgZ3VpZCA9IGQuZGV2aWNlX2lkIHx8ICcnO1xyXG4gICAgY29uc3QgZGlzcE5hbWUgPSBkLmRpc3BsYXlfbmFtZSB8fCAnJztcclxuICAgIGNvbnN0IGluZm8gPSBkLmluZm8gYXMgYW55O1xyXG4gICAgbGV0IGFjdGl2ZTogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xyXG4gICAgaWYgKGluZm8gJiYgdHlwZW9mIGluZm8gPT09ICdvYmplY3QnICYmICdhY3RpdmUnIGluIGluZm8pIHtcclxuICAgICAgYWN0aXZlID0gISEoaW5mbyBhcyBhbnkpLmFjdGl2ZTtcclxuICAgIH0gZWxzZSBpZiAoaW5mbykge1xyXG4gICAgICBhY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW2Rpc3BsYXlOYW1lXTtcclxuICAgIGlmIChndWlkKSBwYXJ0cy5wdXNoKGd1aWQpO1xyXG4gICAgaWYgKGRpc3BOYW1lKSB7XHJcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGFjdGl2ZSA9PT0gbnVsbCA/ICcnIDogYWN0aXZlID8gJyAoYWN0aXZlKScgOiAnIChpbmFjdGl2ZSknO1xyXG4gICAgICBwYXJ0cy5wdXNoKGRpc3BOYW1lICsgc3RhdHVzKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGxhYmVsID0gcGFydHMuam9pbignIC0gJyk7XHJcbiAgICBjb25zdCBpZExpbmUgPSBndWlkICYmIGRpc3BOYW1lID8gYCR7Z3VpZH0gLSAke2Rpc3BOYW1lfWAgOiBndWlkIHx8IGRpc3BOYW1lO1xyXG4gICAgb3B0cy5wdXNoKHsgbGFiZWwsIHZhbHVlLCBkaXNwbGF5TmFtZSwgaWQ6IGlkTGluZSwgYWN0aXZlIH0pO1xyXG4gICAgc2Vlbi5hZGQodmFsdWUpO1xyXG4gIH1cclxuICBjb25zdCBjdXJyZW50ID0gdHlwZW9mIGZvcm0udmFsdWUub3V0cHV0ID09PSAnc3RyaW5nJyA/IGZvcm0udmFsdWUub3V0cHV0LnRyaW0oKSA6ICcnO1xyXG4gIGlmIChjdXJyZW50ICYmICFzZWVuLmhhcyhjdXJyZW50KSkge1xyXG4gICAgY29uc3QgbGFiZWwgPSBnZXRDYWNoZWREaXNwbGF5TGFiZWwoY3VycmVudCkgPz8gY3VycmVudDtcclxuICAgIG9wdHMucHVzaCh7IGxhYmVsLCB2YWx1ZTogY3VycmVudCwgZGlzcGxheU5hbWU6IGxhYmVsLCBpZDogY3VycmVudCwgYWN0aXZlOiBudWxsIH0pO1xyXG4gIH1cclxuICBpZiAoXHJcbiAgICBsYXN0UGh5c2ljYWxPdXRwdXQudmFsdWUgJiZcclxuICAgICFzZWVuLmhhcyhsYXN0UGh5c2ljYWxPdXRwdXQudmFsdWUpICYmXHJcbiAgICBsYXN0UGh5c2ljYWxPdXRwdXQudmFsdWUgIT09IGN1cnJlbnRcclxuICApIHtcclxuICAgIGNvbnN0IGlkID0gbGFzdFBoeXNpY2FsT3V0cHV0LnZhbHVlO1xyXG4gICAgY29uc3QgbGFiZWwgPSBnZXRDYWNoZWREaXNwbGF5TGFiZWwoaWQpID8/IGlkO1xyXG4gICAgb3B0cy5wdXNoKHsgbGFiZWwsIHZhbHVlOiBpZCwgZGlzcGxheU5hbWU6IGxhYmVsLCBpZCwgYWN0aXZlOiBudWxsIH0pO1xyXG4gIH1cclxuICByZXR1cm4gb3B0cztcclxufSk7XHJcblxyXG5jb25zdCBkZENvbmZpZ3VyYXRpb25Nb2RlbCA9IGNvbXB1dGVkPHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsPih7XHJcbiAgZ2V0KCkge1xyXG4gICAgcmV0dXJuIGZvcm0udmFsdWUuZGRDb25maWd1cmF0aW9uT3B0aW9uID8/IG51bGw7XHJcbiAgfSxcclxuICBzZXQodmFsdWUpIHtcclxuICAgIGZvcm0udmFsdWUuZGRDb25maWd1cmF0aW9uT3B0aW9uID1cclxuICAgICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/ICh2YWx1ZSBhcyBBcHBGb3JtWydkZENvbmZpZ3VyYXRpb25PcHRpb24nXSkgOiBudWxsO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZGlzcGxheU9wdGlvbihzbG90UHJvcHM6IHVua25vd24pOiBhbnkge1xyXG4gIHJldHVybiAoc2xvdFByb3BzIGFzIGFueSk/Lm9wdGlvbiA/PyB7fTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlzcGxheU9wdGlvbk5hbWUoc2xvdFByb3BzOiB1bmtub3duKTogc3RyaW5nIHtcclxuICBjb25zdCBvcHRpb24gPSBkaXNwbGF5T3B0aW9uKHNsb3RQcm9wcyk7XHJcbiAgcmV0dXJuIFN0cmluZyhvcHRpb24uZGlzcGxheU5hbWUgfHwgb3B0aW9uLmxhYmVsIHx8ICcnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlzcGxheU9wdGlvbklkKHNsb3RQcm9wczogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgY29uc3Qgb3B0aW9uID0gZGlzcGxheU9wdGlvbihzbG90UHJvcHMpO1xyXG4gIHJldHVybiBTdHJpbmcob3B0aW9uLmlkIHx8IG9wdGlvbi52YWx1ZSB8fCAnJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlPcHRpb25BY3RpdmUoc2xvdFByb3BzOiB1bmtub3duKTogYm9vbGVhbiB8IG51bGwge1xyXG4gIGNvbnN0IGFjdGl2ZSA9IGRpc3BsYXlPcHRpb24oc2xvdFByb3BzKS5hY3RpdmU7XHJcbiAgcmV0dXJuIGFjdGl2ZSA9PT0gdHJ1ZSB8fCBhY3RpdmUgPT09IGZhbHNlID8gYWN0aXZlIDogbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gb25EaXNwbGF5U2VsZWN0Rm9jdXMoKSB7XHJcbiAgaWYgKCFkaXNwbGF5RGV2aWNlc0xvYWRpbmcudmFsdWUgJiYgZGlzcGxheURldmljZXMudmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICB2b2lkIGxvYWREaXNwbGF5RGV2aWNlcygpO1xyXG4gIH1cclxufVxyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS5vdXRwdXQsXHJcbiAgKHZhbHVlKSA9PiB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6ICcnO1xyXG4gICAgaWYgKG5vcm1hbGl6ZWQgJiYgbm9ybWFsaXplZCAhPT0gVklSVFVBTF9ESVNQTEFZX1NFTEVDVElPTikge1xyXG4gICAgICBsYXN0UGh5c2ljYWxPdXRwdXQudmFsdWUgPSBub3JtYWxpemVkO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgeyBpbW1lZGlhdGU6IHRydWUgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IGZvcm0udmFsdWUudmlydHVhbERpc3BsYXlNb2RlLFxyXG4gIChtb2RlKSA9PiB7XHJcbiAgICBpZiAobW9kZSAmJiBtb2RlICE9PSAnZGlzYWJsZWQnKSB7XHJcbiAgICAgIGxhc3RWaXJ0dWFsRGlzcGxheU1vZGUudmFsdWUgPSBtb2RlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgeyBpbW1lZGlhdGU6IHRydWUgfSxcclxuKTtcclxuXHJcbmNvbnN0IGZyYW1lR2VuSGVhbHRoID0gcmVmPEZyYW1lR2VuSGVhbHRoIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGZyYW1lR2VuSGVhbHRoTG9hZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGZyYW1lR2VuSGVhbHRoRXJyb3IgPSByZWY8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbmxldCBmcmFtZUdlbkhlYWx0aFByb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcclxuXHJcbndhdGNoKG9wZW4sIChvKSA9PiB7XHJcbiAgaWYgKG8pIHtcclxuICAgIGZvcm0udmFsdWUgPSBmcm9tU2VydmVyQXBwKHByb3BzLmFwcCA/PyB1bmRlZmluZWQsIHByb3BzLmluZGV4ID8/IC0xKTtcclxuICAgIGlmIChkaXNwbGF5U2VsZWN0aW9uLnZhbHVlID09PSAncGh5c2ljYWwnKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRPdXRwdXQgPSB0eXBlb2YgZm9ybS52YWx1ZS5vdXRwdXQgPT09ICdzdHJpbmcnID8gZm9ybS52YWx1ZS5vdXRwdXQudHJpbSgpIDogJyc7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAhY3VycmVudE91dHB1dCAmJlxyXG4gICAgICAgIGdsb2JhbE91dHB1dE5hbWUudmFsdWUgJiZcclxuICAgICAgICBnbG9iYWxPdXRwdXROYW1lLnZhbHVlICE9PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OXHJcbiAgICAgICkge1xyXG4gICAgICAgIGZvcm0udmFsdWUub3V0cHV0ID0gZ2xvYmFsT3V0cHV0TmFtZS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2VsZWN0ZWRQbGF5bml0ZUlkLnZhbHVlID0gJyc7XHJcbiAgICBsb2NrUGxheW5pdGUudmFsdWUgPSBmYWxzZTtcclxuICAgIG5ld0FwcFNvdXJjZS52YWx1ZSA9ICdjdXN0b20nO1xyXG4gICAgcmVmcmVzaFBsYXluaXRlU3RhdHVzKCkudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmIChwbGF5bml0ZUluc3RhbGxlZC52YWx1ZSkgdm9pZCBsb2FkUGxheW5pdGVHYW1lcygpO1xyXG4gICAgfSk7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdXBkYXRlU2hhZG93cygpKTtcclxuICAgIGVuc3VyZU5hbWVTZWxlY3Rpb25Gcm9tRm9ybSgpO1xyXG4gICAgbmFtZUVycm9yLnZhbHVlID0gJyc7XHJcbiAgICBzaG93QWR2YW5jZWQudmFsdWUgPSBmYWxzZTtcclxuICAgIGlmIChpc1dpbmRvd3MudmFsdWUgJiYgKGZvcm0udmFsdWUuZ2VuMUZyYW1lZ2VuRml4IHx8IGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4KSkge1xyXG4gICAgICByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb246ICdvcGVuJywgc2lsZW50OiB0cnVlIH0pLmNhdGNoKCgpID0+IHt9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZyYW1lR2VuSGVhbHRoLnZhbHVlID0gbnVsbDtcclxuICAgICAgZnJhbWVHZW5IZWFsdGhFcnJvci52YWx1ZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNXaW5kb3dzLnZhbHVlKSB7XHJcbiAgICAgIHJlZnJlc2hMb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMoKS5jYXRjaCgoKSA9PiB7fSk7XHJcbiAgICAgIGlmIChkaXNwbGF5U2VsZWN0aW9uLnZhbHVlID09PSAncGh5c2ljYWwnICYmIGRpc3BsYXlEZXZpY2VzLnZhbHVlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGxvYWREaXNwbGF5RGV2aWNlcygpLmNhdGNoKCgpID0+IHt9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBvdmVycmlkZXNQaWNrZXJPcGVuLnZhbHVlID0gZmFsc2U7XHJcbiAgICBmcmFtZUdlbkhlYWx0aC52YWx1ZSA9IG51bGw7XHJcbiAgICBmcmFtZUdlbkhlYWx0aEVycm9yLnZhbHVlID0gbnVsbDtcclxuICB9XHJcbn0pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpPy5sb3NzbGVzc19zY2FsaW5nX3BhdGgsXHJcbiAgKCkgPT4ge1xyXG4gICAgaWYgKCFvcGVuLnZhbHVlIHx8ICFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICAgIHJlZnJlc2hMb3NzbGVzc0V4ZWN1dGFibGVTdGF0dXMoKS5jYXRjaCgoKSA9PiB7fSk7XHJcbiAgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IGRpc3BsYXlTZWxlY3Rpb24udmFsdWUsXHJcbiAgKHNlbGVjdGlvbikgPT4ge1xyXG4gICAgaWYgKFxyXG4gICAgICBzZWxlY3Rpb24gPT09ICdwaHlzaWNhbCcgJiZcclxuICAgICAgaXNXaW5kb3dzLnZhbHVlICYmXHJcbiAgICAgIGRpc3BsYXlEZXZpY2VzLnZhbHVlLmxlbmd0aCA9PT0gMCAmJlxyXG4gICAgICAhZGlzcGxheURldmljZXNMb2FkaW5nLnZhbHVlXHJcbiAgICApIHtcclxuICAgICAgbG9hZERpc3BsYXlEZXZpY2VzKCkuY2F0Y2goKCkgPT4ge30pO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlbGVjdGlvbiA9PT0gJ3BoeXNpY2FsJyAmJiAhZm9ybS52YWx1ZS5kZENvbmZpZ3VyYXRpb25PcHRpb24pIHtcclxuICAgICAgZm9ybS52YWx1ZS5kZENvbmZpZ3VyYXRpb25PcHRpb24gPSAndmVyaWZ5X29ubHknO1xyXG4gICAgfVxyXG4gIH0sXHJcbik7XHJcblxyXG50eXBlIEZyYW1lR2VuSGVhbHRoUmVhc29uID1cclxuICB8ICdnZW4xJ1xyXG4gIHwgJ2dlbjInXHJcbiAgfCAnbWFudWFsJ1xyXG4gIHwgJ2F1dG8nXHJcbiAgfCAndmlydHVhbC10b2dnbGUnXHJcbiAgfCAnY2FwdHVyZS1jaGFuZ2UnXHJcbiAgfCAnb3V0cHV0LWNoYW5nZSdcclxuICB8ICdvcGVuJztcclxuXHJcbmludGVyZmFjZSBGcmFtZUdlbkhlYWx0aE9wdGlvbnMge1xyXG4gIHJlYXNvbj86IEZyYW1lR2VuSGVhbHRoUmVhc29uO1xyXG4gIHNpbGVudD86IGJvb2xlYW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZURldmljZUlkKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcclxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpIDogJyc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlUmVmcmVzaEh6KHJhdzogYW55KTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgaWYgKHJhdyA9PT0gbnVsbCB8fCByYXcgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkge1xyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHJhdykge1xyXG4gICAgICBjb25zdCBjYW5kaWRhdGUgPSBwYXJzZVJlZnJlc2hIeihpdGVtKTtcclxuICAgICAgaWYgKGNhbmRpZGF0ZSAhPT0gbnVsbCkgcmV0dXJuIGNhbmRpZGF0ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIHJhdyA9PT0gJ251bWJlcicpIHtcclxuICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUocmF3KSA/IHJhdyA6IG51bGw7XHJcbiAgfVxyXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xyXG4gICAgY29uc3QgdHJpbW1lZCA9IHJhdy50cmltKCk7XHJcbiAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkID0gdHJpbW1lZC5yZXBsYWNlKC8oaHp8ZnBzfGZyYW1lc3xyZWZyZXNoKS9naSwgJycpLnRyaW0oKTtcclxuICAgIGNvbnN0IGZyYWN0aW9uTWF0Y2ggPSBzYW5pdGl6ZWQubWF0Y2goL14oWy0rXT9cXGQrKD86XFwuXFxkKyk/KVxccypcXC9cXHMqKFstK10/XFxkKyg/OlxcLlxcZCspPykvKTtcclxuICAgIGlmIChmcmFjdGlvbk1hdGNoKSB7XHJcbiAgICAgIGNvbnN0IG51bWVyYXRvciA9IE51bWJlcihmcmFjdGlvbk1hdGNoWzFdKTtcclxuICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBOdW1iZXIoZnJhY3Rpb25NYXRjaFsyXSk7XHJcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobnVtZXJhdG9yKSAmJiBOdW1iZXIuaXNGaW5pdGUoZGVub21pbmF0b3IpICYmIGRlbm9taW5hdG9yICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bWVyYXRvciAvIGRlbm9taW5hdG9yO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWx1ZU1hdGNoID0gc2FuaXRpemVkLm1hdGNoKC9bLStdP1xcZCsoPzpcXC5cXGQrKT8vKTtcclxuICAgIGlmICh2YWx1ZU1hdGNoKSB7XHJcbiAgICAgIGNvbnN0IG51bSA9IE51bWJlcih2YWx1ZU1hdGNoWzBdKTtcclxuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShudW0pKSByZXR1cm4gbnVtO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGlmICh0eXBlb2YgcmF3ID09PSAnb2JqZWN0Jykge1xyXG4gICAgaWYgKCdoeicgaW4gcmF3KSB7XHJcbiAgICAgIGNvbnN0IGh6Q2FuZGlkYXRlID0gcGFyc2VSZWZyZXNoSHooKHJhdyBhcyBhbnkpLmh6KTtcclxuICAgICAgaWYgKGh6Q2FuZGlkYXRlICE9PSBudWxsKSByZXR1cm4gaHpDYW5kaWRhdGU7XHJcbiAgICB9XHJcbiAgICBpZiAoJ3ZhbHVlJyBpbiByYXcpIHtcclxuICAgICAgY29uc3QgdmFsdWVDYW5kaWRhdGUgPSBwYXJzZVJlZnJlc2hIeigocmF3IGFzIGFueSkudmFsdWUpO1xyXG4gICAgICBpZiAodmFsdWVDYW5kaWRhdGUgIT09IG51bGwpIHJldHVybiB2YWx1ZUNhbmRpZGF0ZTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcmF3LnR5cGUgPT09ICdzdHJpbmcnICYmIHJhdy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNvbnN0IHR5cGVkID0gcmF3IGFzIHsgdHlwZTogc3RyaW5nOyB2YWx1ZTogdW5rbm93biB9O1xyXG4gICAgICBpZiAodHlwZWQudHlwZSA9PT0gJ2RvdWJsZScpIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VSZWZyZXNoSHoodHlwZWQudmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlZC50eXBlID09PSAncmF0aW9uYWwnKSB7XHJcbiAgICAgICAgY29uc3QgdmFsID0gdHlwZWQudmFsdWUgPz8ge307XHJcbiAgICAgICAgY29uc3QgbnVtZXJhdG9yID0gTnVtYmVyKFxyXG4gICAgICAgICAgKHZhbCBhcyBhbnkpPy5udW1lcmF0b3IgPz8gKHZhbCBhcyBhbnkpPy5tX251bWVyYXRvciA/PyAodmFsIGFzIGFueSk/Lm51bSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gTnVtYmVyKFxyXG4gICAgICAgICAgKHZhbCBhcyBhbnkpPy5kZW5vbWluYXRvciA/PyAodmFsIGFzIGFueSk/Lm1fZGVub21pbmF0b3IgPz8gKHZhbCBhcyBhbnkpPy5kZW4gPz8gMSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobnVtZXJhdG9yKSAmJiBOdW1iZXIuaXNGaW5pdGUoZGVub21pbmF0b3IpICYmIGRlbm9taW5hdG9yICE9PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVtZXJhdG9yIC8gZGVub21pbmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBudW1lcmF0b3IgPSBOdW1iZXIoXHJcbiAgICAgIChyYXcgYXMgYW55KT8ubnVtZXJhdG9yID8/XHJcbiAgICAgICAgKHJhdyBhcyBhbnkpPy5tX251bWVyYXRvciA/P1xyXG4gICAgICAgIChyYXcgYXMgYW55KT8ubnVtID8/XHJcbiAgICAgICAgKHJhdyBhcyBhbnkpPy5uID8/XHJcbiAgICAgICAgbnVsbCxcclxuICAgICk7XHJcbiAgICBjb25zdCBkZW5vbWluYXRvciA9IE51bWJlcihcclxuICAgICAgKHJhdyBhcyBhbnkpPy5kZW5vbWluYXRvciA/PyAocmF3IGFzIGFueSk/Lm1fZGVub21pbmF0b3IgPz8gKHJhdyBhcyBhbnkpPy5kZW4gPz8gMSxcclxuICAgICk7XHJcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG51bWVyYXRvcikgJiYgTnVtYmVyLmlzRmluaXRlKGRlbm9taW5hdG9yKSAmJiBkZW5vbWluYXRvciAhPT0gMCkge1xyXG4gICAgICByZXR1cm4gbnVtZXJhdG9yIC8gZGVub21pbmF0b3I7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZVJlZnJlc2hMaXN0KHJhdzogdW5rbm93bik6IG51bWJlcltdIHtcclxuICBjb25zdCB2YWx1ZXM6IG51bWJlcltdID0gW107XHJcbiAgY29uc3QgY29sbGVjdCA9IChlbnRyeTogdW5rbm93bikgPT4ge1xyXG4gICAgY29uc3QgaHogPSBwYXJzZVJlZnJlc2hIeihlbnRyeSk7XHJcbiAgICBpZiAoaHogIT09IG51bGwgJiYgTnVtYmVyLmlzRmluaXRlKGh6KSkge1xyXG4gICAgICB2YWx1ZXMucHVzaChoeik7XHJcbiAgICB9XHJcbiAgfTtcclxuICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XHJcbiAgICByYXcuZm9yRWFjaChjb2xsZWN0KTtcclxuICB9IGVsc2UgaWYgKHJhdyAhPT0gbnVsbCAmJiByYXcgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgY29sbGVjdChyYXcpO1xyXG4gIH1cclxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xyXG4gIGZvciAoY29uc3QgaHogb2YgdmFsdWVzKSB7XHJcbiAgICBpZiAoaHogPD0gMCkgY29udGludWU7XHJcbiAgICBjb25zdCBrZXkgPSBoei50b0ZpeGVkKDMpO1xyXG4gICAgaWYgKHNlZW4uaGFzKGtleSkpIGNvbnRpbnVlO1xyXG4gICAgc2Vlbi5hZGQoa2V5KTtcclxuICAgIHJlc3VsdC5wdXNoKGh6KTtcclxuICB9XHJcbiAgcmVzdWx0LnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoRnJhbWVHZW5IZWFsdGgob3B0aW9uczogRnJhbWVHZW5IZWFsdGhPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWlzV2luZG93cy52YWx1ZSkgcmV0dXJuO1xyXG4gIGlmIChmcmFtZUdlbkhlYWx0aFByb21pc2UpIHJldHVybiBmcmFtZUdlbkhlYWx0aFByb21pc2U7XHJcbiAgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgZnJhbWVHZW5IZWFsdGhMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICAgIGZyYW1lR2VuSGVhbHRoRXJyb3IudmFsdWUgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgW3J0c3NSZXN1bHQsIGRpc3BsYXlSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFtcclxuICAgICAgICBodHRwLmdldCgnL2FwaS9ydHNzL3N0YXR1cycsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSksXHJcbiAgICAgICAgaHR0cC5nZXQoJy9hcGkvZGlzcGxheS1kZXZpY2VzP2RldGFpbD1mdWxsJywgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KSxcclxuICAgICAgXSk7XHJcblxyXG4gICAgICBjb25zdCBjYXB0dXJlVmFsdWUgPSAoY2FwdHVyZU1ldGhvZC52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBsZXQgY2FwdHVyZVN0YXR1czogRnJhbWVHZW5IZWFsdGhbJ2NhcHR1cmUnXVsnc3RhdHVzJ107XHJcbiAgICAgIGxldCBjYXB0dXJlTWVzc2FnZTogc3RyaW5nO1xyXG4gICAgICBjb25zdCBhdXRvVHJlYXRzQXNXZ2MgPSBjYXB0dXJlVmFsdWUgPT09ICcnICYmIGF1dG9DYXB0dXJlVXNlc1dnYy52YWx1ZTtcclxuICAgICAgaWYgKGNhcHR1cmVWYWx1ZSA9PT0gJ3dnYycgfHwgY2FwdHVyZVZhbHVlID09PSAnd2djYycgfHwgYXV0b1RyZWF0c0FzV2djKSB7XHJcbiAgICAgICAgY2FwdHVyZVN0YXR1cyA9ICdwYXNzJztcclxuICAgICAgICBjYXB0dXJlTWVzc2FnZSA9IGF1dG9UcmVhdHNBc1dnY1xyXG4gICAgICAgICAgPyAnQXV0b21hdGljIGNhcHR1cmUgdXNlcyBXaW5kb3dzIEdyYXBoaWNzIENhcHR1cmUgb24gdGhpcyBXaW5kb3dzIGJ1aWxkLidcclxuICAgICAgICAgIDogJ1dpbmRvd3MgR3JhcGhpY3MgQ2FwdHVyZSBpcyBhY3RpdmUgZm9yIHRoaXMgc3lzdGVtLic7XHJcbiAgICAgIH0gZWxzZSBpZiAoY2FwdHVyZVZhbHVlID09PSAnJykge1xyXG4gICAgICAgIGNhcHR1cmVTdGF0dXMgPSAnd2Fybic7XHJcbiAgICAgICAgY2FwdHVyZU1lc3NhZ2UgPVxyXG4gICAgICAgICAgJ0F1dG9kZXRlY3QgbWF5IGZhbGwgYmFjayB0byBEZXNrdG9wIER1cGxpY2F0aW9uLiBTZWxlY3QgV2luZG93cyBHcmFwaGljcyBDYXB0dXJlIGluIFNldHRpbmdzIC0+IENhcHR1cmUuJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYXB0dXJlU3RhdHVzID0gJ2ZhaWwnO1xyXG4gICAgICAgIGNhcHR1cmVNZXNzYWdlID1cclxuICAgICAgICAgICdTd2l0Y2ggY2FwdHVyZSBtZXRob2QgdG8gV2luZG93cyBHcmFwaGljcyBDYXB0dXJlIGluIFNldHRpbmdzIC0+IENhcHR1cmUgdG8ga2VlcCBmcmFtZSBnZW5lcmF0aW9uIGNvbXBhdGlibGUuJztcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHJ0c3NJbnN0YWxsZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IHJ0c3NIb29rcyA9IGZhbHNlO1xyXG4gICAgICBsZXQgcnRzc1J1bm5pbmcgPSBmYWxzZTtcclxuICAgICAgbGV0IHJ0c3NTdGF0dXM6IEZyYW1lR2VuSGVhbHRoWydydHNzJ11bJ3N0YXR1cyddID0gJ3Vua25vd24nO1xyXG4gICAgICBsZXQgcnRzc01lc3NhZ2UgPSAnVW5hYmxlIHRvIHZlcmlmeSBSVFNTLic7XHJcbiAgICAgIGlmIChydHNzUmVzdWx0LnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcpIHtcclxuICAgICAgICBjb25zdCByZXMgPSBydHNzUmVzdWx0LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IG9rID0gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMDtcclxuICAgICAgICBpZiAob2spIHtcclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YSBhcyBhbnk7XHJcbiAgICAgICAgICBydHNzSW5zdGFsbGVkID0gISFkYXRhPy5wYXRoX2V4aXN0cztcclxuICAgICAgICAgIHJ0c3NIb29rcyA9ICEhZGF0YT8uaG9va3NfZm91bmQ7XHJcbiAgICAgICAgICBydHNzUnVubmluZyA9ICEhZGF0YT8ucHJvY2Vzc19ydW5uaW5nO1xyXG4gICAgICAgICAgaWYgKHJ0c3NJbnN0YWxsZWQgJiYgcnRzc0hvb2tzKSB7XHJcbiAgICAgICAgICAgIHJ0c3NTdGF0dXMgPSAncGFzcyc7XHJcbiAgICAgICAgICAgIHJ0c3NNZXNzYWdlID0gJ1JUU1MgaG9va3MgZGV0ZWN0ZWQuIFZpYmVwb2xsbyBjYW4gY29udHJvbCB0aGUgZnJhbWUgbGltaXRlci4nO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChydHNzSW5zdGFsbGVkKSB7XHJcbiAgICAgICAgICAgIHJ0c3NTdGF0dXMgPSAnd2Fybic7XHJcbiAgICAgICAgICAgIHJ0c3NNZXNzYWdlID1cclxuICAgICAgICAgICAgICAnUlRTUyBpcyBpbnN0YWxsZWQgYnV0IGhvb2tzIHdlcmUgbm90IGRldGVjdGVkLiBMYXVuY2ggUlRTUyBhbmQgZW5zdXJlIHRoZSBWaWJlcG9sbG8gcHJvZmlsZSBpcyBhY3RpdmUuJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJ0c3NTdGF0dXMgPSAnZmFpbCc7XHJcbiAgICAgICAgICAgIHJ0c3NNZXNzYWdlID0gJ0luc3RhbGwgUlRTUyB0byBhdm9pZCBtaWNyb3N0dXR0ZXIgd2hlbiBmcmFtZSBnZW5lcmF0aW9uIGlzIGVuYWJsZWQuJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcnRzc1N0YXR1cyA9ICd1bmtub3duJztcclxuICAgICAgICAgIHJ0c3NNZXNzYWdlID0gJ1JUU1Mgc3RhdHVzIGVuZHBvaW50IHJldHVybmVkIGFuIGVycm9yLic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJ0c3NTdGF0dXMgPSAndW5rbm93bic7XHJcbiAgICAgICAgcnRzc01lc3NhZ2UgPSAnVW5hYmxlIHRvIHJlYWNoIHRoZSBSVFNTIHN0YXR1cyBlbmRwb2ludC4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB1c2luZ1ZpcnR1YWwgPSB1c2luZ1ZpcnR1YWxEaXNwbGF5LnZhbHVlO1xyXG4gICAgICBjb25zdCBmcHNUYXJnZXRzID0gWzYwLCA5MCwgMTIwLCAxNDRdO1xyXG4gICAgICBjb25zdCB0b2xlcmFuY2UgPSAwLjU7XHJcbiAgICAgIGxldCBkaXNwbGF5U3RhdHVzOiBGcmFtZUdlbkhlYWx0aFsnZGlzcGxheSddWydzdGF0dXMnXSA9ICd1bmtub3duJztcclxuICAgICAgbGV0IGRpc3BsYXlNZXNzYWdlID0gJ1VuYWJsZSB0byBkZXRlcm1pbmUgZGlzcGxheSByZWZyZXNoIGNhcGFiaWxpdGllcy4nO1xyXG4gICAgICBsZXQgZGlzcGxheUxhYmVsID0gdXNpbmdWaXJ0dWFsID8gJ1ZpYmVwb2xsbyBWaXJ0dWFsIFNjcmVlbicgOiAnQWN0aXZlIGRpc3BsYXknO1xyXG4gICAgICBsZXQgZGlzcGxheUlkID0gdXNpbmdWaXJ0dWFsID8gVklSVFVBTF9ESVNQTEFZX1NFTEVDVElPTiA6ICcnO1xyXG4gICAgICBsZXQgZGlzcGxheUh6OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICAgICAgbGV0IGRpc3BsYXlFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgIGxldCBkaXNwbGF5VGFyZ2V0cyA9IGZwc1RhcmdldHMubWFwKChmcHMpID0+ICh7XHJcbiAgICAgICAgZnBzLFxyXG4gICAgICAgIHJlcXVpcmVkSHo6IGZwcyAqIDIsXHJcbiAgICAgICAgc3VwcG9ydGVkOiB1c2luZ1ZpcnR1YWwgPyB0cnVlIDogbnVsbCxcclxuICAgICAgfSkpO1xyXG4gICAgICBsZXQgaGlnaGVzdEZhaWxVbmRlcjE0NDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgIGxldCBvbmx5MTQ0RmFpbHMgPSBmYWxzZTtcclxuICAgICAgY29uc3QgZWRpZFN1cHBvcnQ6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBudWxsPiA9IHt9O1xyXG4gICAgICBsZXQgZWRpZENhcEh6OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICAgICAgbGV0IGVkaWRGZXRjaEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAgIGlmICghdXNpbmdWaXJ0dWFsKSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlSZXN1bHQuc3RhdHVzID09PSAnZnVsZmlsbGVkJykge1xyXG4gICAgICAgICAgY29uc3QgcmVzID0gZGlzcGxheVJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgIGNvbnN0IG9rID0gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMDtcclxuICAgICAgICAgIGlmIChvayAmJiBBcnJheS5pc0FycmF5KHJlcy5kYXRhKSkge1xyXG4gICAgICAgICAgICBjb25zdCBkZXZpY2VzID0gcmVzLmRhdGEgYXMgYW55W107XHJcbiAgICAgICAgICAgIGNvbnN0IGFwcE91dHB1dCA9IGZvcm0udmFsdWUub3V0cHV0O1xyXG4gICAgICAgICAgICBjb25zdCBnbG9iYWxPdXRwdXQgPSBnbG9iYWxPdXRwdXROYW1lLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xyXG4gICAgICAgICAgICAgIGFwcE91dHB1dCAmJiBhcHBPdXRwdXQgIT09IFZJUlRVQUxfRElTUExBWV9TRUxFQ1RJT04gPyBhcHBPdXRwdXQgOiAnJyxcclxuICAgICAgICAgICAgICBnbG9iYWxPdXRwdXQgJiYgZ2xvYmFsT3V0cHV0ICE9PSBWSVJUVUFMX0RJU1BMQVlfU0VMRUNUSU9OID8gZ2xvYmFsT3V0cHV0IDogJycsXHJcbiAgICAgICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkQ2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMubWFwKChjKSA9PiBub3JtYWxpemVEZXZpY2VJZChjKSk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBkZXZpY2VzLmZpbmQoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpZCA9IG5vcm1hbGl6ZURldmljZUlkKGl0ZW0/LmRldmljZV9pZCk7XHJcbiAgICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBub3JtYWxpemVEZXZpY2VJZChpdGVtPy5kaXNwbGF5X25hbWUpO1xyXG4gICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkQ2FuZGlkYXRlcy5pbmNsdWRlcyhpZCkgfHwgbm9ybWFsaXplZENhbmRpZGF0ZXMuaW5jbHVkZXMoZGlzcGxheU5hbWUpXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgdGFyZ2V0ID0gZGV2aWNlcy5maW5kKChpdGVtKSA9PiBpdGVtICYmIGl0ZW0uaW5mbykgfHwgZGV2aWNlc1swXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgZGlzcGxheUxhYmVsID1cclxuICAgICAgICAgICAgICAgICh0eXBlb2YgdGFyZ2V0LmZyaWVuZGx5X25hbWUgPT09ICdzdHJpbmcnICYmIHRhcmdldC5mcmllbmRseV9uYW1lKSB8fFxyXG4gICAgICAgICAgICAgICAgKHR5cGVvZiB0YXJnZXQuZGlzcGxheV9uYW1lID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuZGlzcGxheV9uYW1lKSB8fFxyXG4gICAgICAgICAgICAgICAgJ0FjdGl2ZSBkaXNwbGF5JztcclxuICAgICAgICAgICAgICBkaXNwbGF5SWQgPVxyXG4gICAgICAgICAgICAgICAgKHR5cGVvZiB0YXJnZXQuZGV2aWNlX2lkID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuZGV2aWNlX2lkKSB8fFxyXG4gICAgICAgICAgICAgICAgKHR5cGVvZiB0YXJnZXQuZGlzcGxheV9uYW1lID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuZGlzcGxheV9uYW1lKSB8fFxyXG4gICAgICAgICAgICAgICAgJyc7XHJcbiAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRhcmdldC5pbmZvIGFzIGFueTtcclxuICAgICAgICAgICAgICBjb25zdCByZWZyZXNoUmF3ID0gaW5mbz8ucmVmcmVzaF9yYXRlID8/IGluZm8/LnJlZnJlc2hSYXRlO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVJlZnJlc2ggPSBwYXJzZVJlZnJlc2hIeihyZWZyZXNoUmF3KTtcclxuICAgICAgICAgICAgICBjb25zdCBzdXBwb3J0ZWRSYXRlc1JhdyA9XHJcbiAgICAgICAgICAgICAgICAodGFyZ2V0IGFzIGFueSk/LnN1cHBvcnRlZF9yZWZyZXNoX3JhdGVzID8/ICh0YXJnZXQgYXMgYW55KT8uc3VwcG9ydGVkUmVmcmVzaFJhdGVzO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHN1cHBvcnRlZFJhdGVzID0gcGFyc2VSZWZyZXNoTGlzdChzdXBwb3J0ZWRSYXRlc1Jhdyk7XHJcbiAgICAgICAgICAgICAgY29uc3QgaGlnaGVzdFN1cHBvcnRlZER4Z2kgPVxyXG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkUmF0ZXMubGVuZ3RoID4gMCA/IChzdXBwb3J0ZWRSYXRlc1tzdXBwb3J0ZWRSYXRlcy5sZW5ndGggLSAxXSA/PyBudWxsKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VIaW50ID0gZGlzcGxheUlkIHx8IGRpc3BsYXlMYWJlbDtcclxuICAgICAgICAgICAgICAgIGlmIChkZXZpY2VIaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaWRSZXMgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9mcmFtZWdlbi9lZGlkLXJlZnJlc2gnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VfaWQ6IGRldmljZUhpbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBmcHNUYXJnZXRzLm1hcCgoZnBzKSA9PiBmcHMgKiAyKS5qb2luKCcsJyksXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBlZGlkUmVzLnN0YXR1cyA+PSAyMDAgJiZcclxuICAgICAgICAgICAgICAgICAgICBlZGlkUmVzLnN0YXR1cyA8IDMwMCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGVkaWRSZXMuZGF0YSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGVkaWRSZXMuZGF0YS5zdGF0dXMgIT09IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGE6IGFueSA9IGVkaWRSZXMuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRpc3BsYXlMYWJlbCAmJiB0eXBlb2YgZGF0YT8uZGV2aWNlX2xhYmVsID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUxhYmVsID0gZGF0YS5kZXZpY2VfbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlSHogPSBwYXJzZVJlZnJlc2hIeigoZGF0YSBhcyBhbnkpPy5tYXhfdmVydGljYWxfaHopO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWluZ0h6ID0gcGFyc2VSZWZyZXNoSHooKGRhdGEgYXMgYW55KT8ubWF4X3RpbWluZ19oeik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FwQ2FuZGlkYXRlID1cclxuICAgICAgICAgICAgICAgICAgICAgIHJhbmdlSHogIT09IG51bGwgJiYgcmFuZ2VIeiA+IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyByYW5nZUh6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGltaW5nSHogIT09IG51bGwgJiYgdGltaW5nSHogPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aW1pbmdIelxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FwQ2FuZGlkYXRlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBlZGlkQ2FwSHogPSBjYXBDYW5kaWRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEVudHJpZXMgPSBBcnJheS5pc0FycmF5KChkYXRhIGFzIGFueSk/LnRhcmdldHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICA/IChkYXRhIGFzIGFueSkudGFyZ2V0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgOiBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRhcmdldEVudHJpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGh6ID0gcGFyc2VSZWZyZXNoSHooKGVudHJ5IGFzIGFueSk/Lmh6KTtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChoeiA9PT0gbnVsbCkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBoei50b0ZpeGVkKDMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZW50cnkgYXMgYW55KT8uc3VwcG9ydGVkID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpZFN1cHBvcnRba2V5XSA9IChlbnRyeSBhcyBhbnkpLnN1cHBvcnRlZDtcclxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIShrZXkgaW4gZWRpZFN1cHBvcnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaWRTdXBwb3J0W2tleV0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlZGlkUmVzLmRhdGEgJiYgdHlwZW9mIChlZGlkUmVzLmRhdGEgYXMgYW55KS5lcnJvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGlkRmV0Y2hFcnJvciA9IChlZGlkUmVzLmRhdGEgYXMgYW55KS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlZGlkRmV0Y2hFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICBlZGlkRmV0Y2hFcnJvciA9IGU/Lm1lc3NhZ2UgfHwgJ0VESUQgcmVmcmVzaCB2YWxpZGF0aW9uIGZhaWxlZC4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgaGlnaGVzdFN1cHBvcnRlZDogbnVtYmVyIHwgbnVsbCA9XHJcbiAgICAgICAgICAgICAgICBlZGlkQ2FwSHogIT09IG51bGwgJiYgTnVtYmVyLmlzRmluaXRlKGVkaWRDYXBIeikgPyBlZGlkQ2FwSHogOiBoaWdoZXN0U3VwcG9ydGVkRHhnaTtcclxuXHJcbiAgICAgICAgICAgICAgZGlzcGxheUh6ID0gYWN0aXZlUmVmcmVzaDtcclxuICAgICAgICAgICAgICBkaXNwbGF5VGFyZ2V0cyA9IGZwc1RhcmdldHMubWFwKChmcHMpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcXVpcmVkID0gZnBzICogMjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVkaWRLZXkgPSByZXF1aXJlZC50b0ZpeGVkKDMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHN1cHBvcnRlZDogYm9vbGVhbiB8IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlZGlkU3VwcG9ydCwgZWRpZEtleSkgJiZcclxuICAgICAgICAgICAgICAgICAgdHlwZW9mIGVkaWRTdXBwb3J0W2VkaWRLZXldID09PSAnYm9vbGVhbidcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICBzdXBwb3J0ZWQgPSBlZGlkU3VwcG9ydFtlZGlkS2V5XSBhcyBib29sZWFuO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0ZWRSYXRlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIHN1cHBvcnRlZCA9IHN1cHBvcnRlZFJhdGVzLnNvbWUoKHJhdGUpID0+IHJhdGUgPj0gcmVxdWlyZWQgLSB0b2xlcmFuY2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVSZWZyZXNoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHN1cHBvcnRlZCA9IGFjdGl2ZVJlZnJlc2ggPj0gcmVxdWlyZWQgLSB0b2xlcmFuY2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBzdXBwb3J0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZnBzLCByZXF1aXJlZEh6OiByZXF1aXJlZCwgc3VwcG9ydGVkIH07XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGZhaWxpbmdVbmRlcjE0NCA9IGRpc3BsYXlUYXJnZXRzLmZpbHRlcihcclxuICAgICAgICAgICAgICAgIChlbnRyeSkgPT4gZW50cnkuc3VwcG9ydGVkID09PSBmYWxzZSAmJiBlbnRyeS5mcHMgPCAxNDQsXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBoaWdoZXN0RmFpbFVuZGVyMTQ0ID0gZmFpbGluZ1VuZGVyMTQ0Lmxlbmd0aFxyXG4gICAgICAgICAgICAgICAgPyBNYXRoLm1heCguLi5mYWlsaW5nVW5kZXIxNDQubWFwKChlbnRyeSkgPT4gZW50cnkuZnBzKSlcclxuICAgICAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICAgICAgICBvbmx5MTQ0RmFpbHMgPVxyXG4gICAgICAgICAgICAgICAgZGlzcGxheVRhcmdldHMuc29tZSgoZW50cnkpID0+IGVudHJ5LmZwcyA9PT0gMTQ0ICYmIGVudHJ5LnN1cHBvcnRlZCA9PT0gZmFsc2UpICYmXHJcbiAgICAgICAgICAgICAgICBoaWdoZXN0RmFpbFVuZGVyMTQ0ID09PSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uSHogPSBoaWdoZXN0U3VwcG9ydGVkID8/IGFjdGl2ZVJlZnJlc2g7XHJcbiAgICAgICAgICAgICAgY29uc3QgaGFzQWN0aXZlID0gYWN0aXZlUmVmcmVzaCAhPT0gbnVsbDtcclxuICAgICAgICAgICAgICBjb25zdCBhY3RpdmVSZWZyZXNoVmFsdWUgPSBhY3RpdmVSZWZyZXNoID8/IGV2YWx1YXRpb25IeiA/PyAwO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRlbHRhU3VwcG9ydGVkID1cclxuICAgICAgICAgICAgICAgIGhpZ2hlc3RTdXBwb3J0ZWQgIT09IG51bGwgJiZcclxuICAgICAgICAgICAgICAgIGhhc0FjdGl2ZSAmJlxyXG4gICAgICAgICAgICAgICAgTWF0aC5hYnMoaGlnaGVzdFN1cHBvcnRlZCAtIGFjdGl2ZVJlZnJlc2hWYWx1ZSkgPiB0b2xlcmFuY2U7XHJcbiAgICAgICAgICAgICAgaWYgKCFkaXNwbGF5RXJyb3IgJiYgZWRpZEZldGNoRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlFcnJvciA9IGVkaWRGZXRjaEVycm9yO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKGV2YWx1YXRpb25IeiA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICd1bmtub3duJztcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlID1cclxuICAgICAgICAgICAgICAgICAgJ1VuYWJsZSB0byByZWFkIHRoZSByZWZyZXNoIHJhdGUgZnJvbSB0aGUgY29uZmlndXJlZCBkaXNwbGF5LiBEb3VibGUtY2hlY2sgRGlzcGxheSBEZXZpY2UgU3RlcCAxLic7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmFsdWF0aW9uSHogPj0gMjQwIC0gdG9sZXJhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzID0gJ3Bhc3MnO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9ubHkxNDRGYWlscykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBiYXNlSHogPSBoYXNBY3RpdmUgPyBhY3RpdmVSZWZyZXNoVmFsdWUgOiBldmFsdWF0aW9uSHo7XHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlID0gYEN1cnJlbnQgcmVmcmVzaCBpcyAke01hdGgucm91bmQoYmFzZUh6KX0gSHouIFN0cmVhbXMgdXAgdG8gMTIwIEZQUyBhcmUgY292ZXJlZC4gT25seSAxNDQgRlBTIHN0cmVhbXMgcmVxdWlyZSB0aGUgVmliZXBvbGxvIHZpcnR1YWwgc2NyZWVuIG9yIGEgaGlnaGVyLXJlZnJlc2ggZGlzcGxheS5gO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIWhhc0FjdGl2ZSAmJiBoaWdoZXN0U3VwcG9ydGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgRGlzcGxheSBzdXBwb3J0cyB1cCB0byAke01hdGgucm91bmQoaGlnaGVzdFN1cHBvcnRlZCl9IEh6LiBTdHJlYW1zIHVwIHRvIDEyMCBGUFMgYXJlIGNvdmVyZWQuIE9ubHkgMTQ0IEZQUyBzdHJlYW1zIHJlcXVpcmUgdGhlIFZpYmVwb2xsbyB2aXJ0dWFsIHNjcmVlbiBvciBhIGhpZ2hlci1yZWZyZXNoIGRpc3BsYXkuYDtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZWx0YVN1cHBvcnRlZCAmJiBoaWdoZXN0U3VwcG9ydGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgKz0gYCBWaWJlcG9sbG8gY2FuIHN3aXRjaCB0byAke01hdGgucm91bmQoaGlnaGVzdFN1cHBvcnRlZCl9IEh6IHdoZW4gYSBzdHJlYW0gc3RhcnRzIGlmIERpc3BsYXkgRGV2aWNlIFN0ZXAgMSBrZWVwcyB0aGF0IG1vbml0b3IgYWN0aXZlLmA7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWhhc0FjdGl2ZSAmJiBoaWdoZXN0U3VwcG9ydGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlID0gYERpc3BsYXkgc3VwcG9ydHMgdXAgdG8gJHtNYXRoLnJvdW5kKGhpZ2hlc3RTdXBwb3J0ZWQpfSBIei4gVmliZXBvbGxvIGNhbiBkb3VibGUgMTIwIEZQUyBzdHJlYW1zLmA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlbHRhU3VwcG9ydGVkICYmIGhpZ2hlc3RTdXBwb3J0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgQ3VycmVudCByZWZyZXNoIGlzICR7TWF0aC5yb3VuZChhY3RpdmVSZWZyZXNoVmFsdWUpfSBIei4gVmliZXBvbGxvIGNhbiBzd2l0Y2ggdG8gJHtNYXRoLnJvdW5kKGhpZ2hlc3RTdXBwb3J0ZWQpfSBIeiBkdXJpbmcgc3RyZWFtcyB0byBrZWVwIGZyYW1lIGdlbmVyYXRpb24gc21vb3RoLmA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9ICdEaXNwbGF5IHJlZnJlc2ggaXMgaGlnaCBlbm91Z2ggdG8gZG91YmxlIDEyMCBGUFMgc3RyZWFtcy4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGlvbkh6ID49IDE4MCAtIHRvbGVyYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICd3YXJuJztcclxuICAgICAgICAgICAgICAgIGlmICghaGFzQWN0aXZlICYmIGhpZ2hlc3RTdXBwb3J0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgRGlzcGxheSBzdXBwb3J0cyB1cCB0byAke01hdGgucm91bmQoZXZhbHVhdGlvbkh6KX0gSHouIENvbmZpZ3VyZSBEaXNwbGF5IERldmljZSBTdGVwIDEgdG8gZW5mb3JjZSB0aGUgaGlnaGVyIHJlZnJlc2ggb3IgdXNlIHRoZSBkaXNwbGF5IG92ZXJyaWRlIGJlbG93IHRvIHN3aXRjaCB0byB0aGUgVmliZXBvbGxvIHZpcnR1YWwgZGlzcGxheS5gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hlc3RGYWlsVW5kZXIxNDQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9IGBDdXJyZW50IHJlZnJlc2ggaXMgJHtNYXRoLnJvdW5kKGFjdGl2ZVJlZnJlc2hWYWx1ZSl9IEh6LiBTdHJlYW1zIHRhcmdldGluZyB1cCB0byAke2hpZ2hlc3RGYWlsVW5kZXIxNDR9IEZQUyBuZWVkIHRoZSBWaWJlcG9sbG8gdmlydHVhbCBzY3JlZW4gb3IgYSBoaWdoZXItcmVmcmVzaCBkaXNwbGF5LmA7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgQ3VycmVudCByZWZyZXNoIGlzICR7TWF0aC5yb3VuZChhY3RpdmVSZWZyZXNoVmFsdWUpfSBIei4gMTIwIEZQUyBmcmFtZSBnZW5lcmF0aW9uIG1heSBzdHV0dGVyIHdpdGhvdXQgYSBoaWdoZXIgcmVmcmVzaCBkaXNwbGF5LiBVc2UgdGhlIGRpc3BsYXkgb3ZlcnJpZGUgYmVsb3cgdG8gc3dpdGNoIHRvIHRoZSBWaWJlcG9sbG8gdmlydHVhbCBkaXNwbGF5IG9yIG1vdmUgdGhlIHN0cmVhbSB0byBhIGhpZ2hlci1yZWZyZXNoIG1vbml0b3IuYDtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBpZiAoZGVsdGFTdXBwb3J0ZWQgJiYgaGlnaGVzdFN1cHBvcnRlZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlICs9IGAgVmliZXBvbGxvIGNhbiBzd2l0Y2ggdXAgdG8gJHtNYXRoLnJvdW5kKGhpZ2hlc3RTdXBwb3J0ZWQpfSBIeiBpZiBEaXNwbGF5IERldmljZSBTdGVwIDEga2VlcHMgb25seSB0aGF0IG1vbml0b3IgYWN0aXZlLmA7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlID1cclxuICAgICAgICAgICAgICAgICAgICAnVW5hYmxlIHRvIHJlYWQgdGhlIGN1cnJlbnQgcmVmcmVzaCByYXRlLCBidXQgdGhlIGRpc3BsYXkgbWF5IG5vdCByZWFjaCB0aGUgcmVxdWlyZWQgMjQwIEh6LiBVc2UgdGhlIGRpc3BsYXkgb3ZlcnJpZGUgYmVsb3cgdG8gc3dpdGNoIHRvIHRoZSBWaWJlcG9sbG8gdmlydHVhbCBkaXNwbGF5IG9yIG1vdmUgdGhlIHN0cmVhbSB0byBhIGhpZ2hlci1yZWZyZXNoIG1vbml0b3IuJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICdmYWlsJztcclxuICAgICAgICAgICAgICAgIGlmICghaGFzQWN0aXZlICYmIGhpZ2hlc3RTdXBwb3J0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgRGlzcGxheSB0b3BzIG91dCBhdCAke01hdGgucm91bmQoZXZhbHVhdGlvbkh6KX0gSHouIFVzZSB0aGUgZGlzcGxheSBvdmVycmlkZSBiZWxvdyB0byBzd2l0Y2ggdG8gdGhlIFZpYmVwb2xsbyB2aXJ0dWFsIGRpc3BsYXkgb3Igc3dpdGNoIHRvIGEgMjQwIEh6IGRpc3BsYXkgZm9yIGZyYW1lIGdlbmVyYXRpb24uYDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1lbnRpb24gPSBoaWdoZXN0RmFpbFVuZGVyMTQ0ID8/IDEyMDtcclxuICAgICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBgQ3VycmVudCByZWZyZXNoIGlzICR7TWF0aC5yb3VuZChhY3RpdmVSZWZyZXNoVmFsdWUpfSBIei4gU3RyZWFtcyB0YXJnZXRpbmcgdXAgdG8gJHttZW50aW9ufSBGUFMgbmVlZCB0aGUgVmliZXBvbGxvIHZpcnR1YWwgc2NyZWVuIG9yIGEgaGlnaGVyLXJlZnJlc2ggZGlzcGxheS5gO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZGVsdGFTdXBwb3J0ZWQgJiYgaGlnaGVzdFN1cHBvcnRlZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNZXNzYWdlICs9IGAgVmliZXBvbGxvIGNhbiBzd2l0Y2ggdXAgdG8gJHtNYXRoLnJvdW5kKGhpZ2hlc3RTdXBwb3J0ZWQpfSBIeiBpZiBjb25maWd1cmVkIGluIERpc3BsYXkgRGV2aWNlIFN0ZXAgMS5gO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc3BsYXkgcmVmcmVzaCBpbmZvcm1hdGlvbiB3YXMgdW5hdmFpbGFibGUuIFVzZSB0aGUgZGlzcGxheSBvdmVycmlkZSBiZWxvdyB0byBzd2l0Y2ggdG8gdGhlIFZpYmVwb2xsbyB2aXJ0dWFsIGRpc3BsYXkgb3Igc3dpdGNoIHRvIGEgMjQwIEh6IGRpc3BsYXkgZm9yIGZyYW1lIGdlbmVyYXRpb24uJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICd1bmtub3duJztcclxuICAgICAgICAgICAgICBkaXNwbGF5TWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICAnTm8gZGlzcGxheSBkZXZpY2VzIHdlcmUgcmV0dXJuZWQgYnkgVmliZXBvbGxv4oCZcyBoZWxwZXIuIEZyYW1lIGdlbmVyYXRpb24gbWF5IG5vdCBiZSBhYmxlIHRvIGVuZm9yY2UgcmVmcmVzaCBjaGFuZ2VzLic7XHJcbiAgICAgICAgICAgICAgZGlzcGxheUVycm9yID0gJ0Rpc3BsYXkgaGVscGVyIHJldHVybmVkIG5vIGRldmljZXMuJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICd1bmtub3duJztcclxuICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSAnRGlzcGxheSBoZWxwZXIgZGlkIG5vdCByZXNwb25kIHdpdGggZGV2aWNlIGluZm9ybWF0aW9uLic7XHJcbiAgICAgICAgICAgIGRpc3BsYXlFcnJvciA9ICdEaXNwbGF5IGRldmljZSBlbnVtZXJhdGlvbiBmYWlsZWQuJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGlzcGxheVN0YXR1cyA9ICd1bmtub3duJztcclxuICAgICAgICAgIGRpc3BsYXlNZXNzYWdlID0gJ1VuYWJsZSB0byByZWFjaCB0aGUgZGlzcGxheSBoZWxwZXIuJztcclxuICAgICAgICAgIGRpc3BsYXlFcnJvciA9ICdEaXNwbGF5IGhlbHBlciByZXF1ZXN0IGZhaWxlZC4nO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkaXNwbGF5U3RhdHVzID0gJ3Bhc3MnO1xyXG4gICAgICAgIGRpc3BsYXlNZXNzYWdlID1cclxuICAgICAgICAgICdWaWJlcG9sbG8gdmlydHVhbCBzY3JlZW4gZ3VhcmFudGVlcyBhIGhpZ2ggcmVmcmVzaCBzdXJmYWNlIGZvciBmcmFtZSBnZW5lcmF0aW9uLic7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh1c2luZ1ZpcnR1YWwpIHtcclxuICAgICAgICBkaXNwbGF5VGFyZ2V0cyA9IGZwc1RhcmdldHMubWFwKChmcHMpID0+ICh7XHJcbiAgICAgICAgICBmcHMsXHJcbiAgICAgICAgICByZXF1aXJlZEh6OiBmcHMgKiAyLFxyXG4gICAgICAgICAgc3VwcG9ydGVkOiB0cnVlLFxyXG4gICAgICAgIH0pKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaGVhbHRoOiBGcmFtZUdlbkhlYWx0aCA9IHtcclxuICAgICAgICBjaGVja2VkQXQ6IERhdGUubm93KCksXHJcbiAgICAgICAgY2FwdHVyZToge1xyXG4gICAgICAgICAgc3RhdHVzOiBjYXB0dXJlU3RhdHVzLFxyXG4gICAgICAgICAgbWV0aG9kOiBjYXB0dXJlVmFsdWUsXHJcbiAgICAgICAgICBtZXNzYWdlOiBjYXB0dXJlTWVzc2FnZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJ0c3M6IHtcclxuICAgICAgICAgIHN0YXR1czogcnRzc1N0YXR1cyxcclxuICAgICAgICAgIGluc3RhbGxlZDogcnRzc0luc3RhbGxlZCxcclxuICAgICAgICAgIHJ1bm5pbmc6IHJ0c3NSdW5uaW5nLFxyXG4gICAgICAgICAgaG9va3NEZXRlY3RlZDogcnRzc0hvb2tzLFxyXG4gICAgICAgICAgbWVzc2FnZTogcnRzc01lc3NhZ2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNwbGF5OiB7XHJcbiAgICAgICAgICBzdGF0dXM6IGRpc3BsYXlTdGF0dXMsXHJcbiAgICAgICAgICBkZXZpY2VMYWJlbDogZGlzcGxheUxhYmVsLFxyXG4gICAgICAgICAgZGV2aWNlSWQ6IGRpc3BsYXlJZCxcclxuICAgICAgICAgIGN1cnJlbnRIejogZGlzcGxheUh6LFxyXG4gICAgICAgICAgdGFyZ2V0czogZGlzcGxheVRhcmdldHMsXHJcbiAgICAgICAgICB2aXJ0dWFsQWN0aXZlOiB1c2luZ1ZpcnR1YWwsXHJcbiAgICAgICAgICBtZXNzYWdlOiBkaXNwbGF5TWVzc2FnZSxcclxuICAgICAgICAgIGVycm9yOiBkaXNwbGF5RXJyb3IsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChoaWdoZXN0RmFpbFVuZGVyMTQ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgaGVhbHRoLnN1Z2dlc3Rpb24gPSB7XHJcbiAgICAgICAgICBtZXNzYWdlOiBgVXNlIHRoZSBkaXNwbGF5IG92ZXJyaWRlIGFib3ZlIHRvIHN3aXRjaCB0byB0aGUgVmliZXBvbGxvIHZpcnR1YWwgZGlzcGxheSBvciBjb25maWd1cmUgRGlzcGxheSBEZXZpY2UgU3RlcCAxIHRvIHRhcmdldCB0aGUgdmlydHVhbCBkaXNwbGF5IHNvICR7aGlnaGVzdEZhaWxVbmRlcjE0NH0gRlBTIHN0cmVhbXMgc3RheSBzbW9vdGguYCxcclxuICAgICAgICAgIGVtcGhhc2lzOiAnd2FybmluZycsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIGlmIChjYXB0dXJlU3RhdHVzID09PSAnd2FybicgfHwgY2FwdHVyZVN0YXR1cyA9PT0gJ2ZhaWwnKSB7XHJcbiAgICAgICAgaGVhbHRoLnN1Z2dlc3Rpb24gPSB7XHJcbiAgICAgICAgICBtZXNzYWdlOlxyXG4gICAgICAgICAgICAnU2V0IENhcHR1cmUgLT4gTWV0aG9kIHRvIFdpbmRvd3MgR3JhcGhpY3MgQ2FwdHVyZSBzbyBmcmFtZSBnZW5lcmF0aW9uIHN0YXlzIHN0YWJsZS4nLFxyXG4gICAgICAgICAgZW1waGFzaXM6ICdpbmZvJyxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmcmFtZUdlbkhlYWx0aC52YWx1ZSA9IGhlYWx0aDtcclxuICAgICAgZnJhbWVHZW5IZWFsdGhFcnJvci52YWx1ZSA9IG51bGw7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBmcmFtZUdlbkhlYWx0aC52YWx1ZSA9IG51bGw7XHJcbiAgICAgIGZyYW1lR2VuSGVhbHRoRXJyb3IudmFsdWUgPVxyXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1VuYWJsZSB0byBydW4gZnJhbWUgZ2VuZXJhdGlvbiBoZWFsdGggY2hlY2suJztcclxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xyXG4gICAgICAgIG1lc3NhZ2U/LmVycm9yKCdVbmFibGUgdG8gcnVuIGZyYW1lIGdlbmVyYXRpb24gaGVhbHRoIGNoZWNrLicpO1xyXG4gICAgICB9XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBmcmFtZUdlbkhlYWx0aExvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICAgICAgZnJhbWVHZW5IZWFsdGhQcm9taXNlID0gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG4gIGZyYW1lR2VuSGVhbHRoUHJvbWlzZSA9IHJ1bigpO1xyXG4gIHJldHVybiBmcmFtZUdlbkhlYWx0aFByb21pc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUZyYW1lR2VuSGVhbHRoUmVxdWVzdCgpIHtcclxuICByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb246ICdtYW51YWwnIH0pLmNhdGNoKCgpID0+IHt9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlRW5hYmxlVmlydHVhbFNjcmVlbigpIHtcclxuICBpZiAoIWlzV2luZG93cy52YWx1ZSkgcmV0dXJuO1xyXG4gIGRpc3BsYXlPdmVycmlkZUVuYWJsZWQudmFsdWUgPSB0cnVlO1xyXG4gIGRpc3BsYXlTZWxlY3Rpb24udmFsdWUgPSAndmlydHVhbCc7XHJcbiAgcmVmcmVzaEZyYW1lR2VuSGVhbHRoKHsgcmVhc29uOiAndmlydHVhbC10b2dnbGUnLCBzaWxlbnQ6IHRydWUgfSkuY2F0Y2goKCkgPT4ge30pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB3YXJuSWZIZWFsdGhJc3N1ZXMocmVhc29uOiBGcmFtZUdlbkhlYWx0aFJlYXNvbikge1xyXG4gIGlmIChcclxuICAgIHJlYXNvbiA9PT0gJ2F1dG8nIHx8XHJcbiAgICByZWFzb24gPT09ICd2aXJ0dWFsLXRvZ2dsZScgfHxcclxuICAgIHJlYXNvbiA9PT0gJ2NhcHR1cmUtY2hhbmdlJyB8fFxyXG4gICAgcmVhc29uID09PSAnb3V0cHV0LWNoYW5nZScgfHxcclxuICAgIHJlYXNvbiA9PT0gJ29wZW4nXHJcbiAgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmICghbWVzc2FnZSkgcmV0dXJuO1xyXG4gIGNvbnN0IGhlYWx0aCA9IGZyYW1lR2VuSGVhbHRoLnZhbHVlO1xyXG4gIGlmICghaGVhbHRoKSByZXR1cm47XHJcbiAgaWYgKGhlYWx0aC5jYXB0dXJlLnN0YXR1cyA9PT0gJ3dhcm4nIHx8IGhlYWx0aC5jYXB0dXJlLnN0YXR1cyA9PT0gJ2ZhaWwnKSB7XHJcbiAgICBtZXNzYWdlLndhcm5pbmcoXHJcbiAgICAgICdTd2l0Y2ggY2FwdHVyZSBtZXRob2QgdG8gV2luZG93cyBHcmFwaGljcyBDYXB0dXJlIGluIFNldHRpbmdzIC0+IENhcHR1cmUgdG8ga2VlcCBmcmFtZSBnZW5lcmF0aW9uIGNvbXBhdGlibGUuJyxcclxuICAgICAgeyBkdXJhdGlvbjogODAwMCB9LFxyXG4gICAgKTtcclxuICB9XHJcbiAgaWYgKGhlYWx0aC5ydHNzLnN0YXR1cyA9PT0gJ3dhcm4nIHx8IGhlYWx0aC5ydHNzLnN0YXR1cyA9PT0gJ2ZhaWwnKSB7XHJcbiAgICBtZXNzYWdlLndhcm5pbmcoXHJcbiAgICAgICdSVFNTIGlzIHJlcXVpcmVkIGZvciB0aGlzIGZpeC4gSW5zdGFsbCBhbmQgbGF1bmNoIFJUU1MgdG8gYXZvaWQgbWljcm9zdHV0dGVyLicsXHJcbiAgICAgIHsgZHVyYXRpb246IDgwMDAgfSxcclxuICAgICk7XHJcbiAgfVxyXG4gIGlmICghc2tpcERpc3BsYXlXYXJuaW5ncy52YWx1ZSAmJiAhaGVhbHRoLmRpc3BsYXkudmlydHVhbEFjdGl2ZSkge1xyXG4gICAgY29uc3QgcmVxdWlyZXNIaWdoID0gaGVhbHRoLmRpc3BsYXkudGFyZ2V0cy5zb21lKFxyXG4gICAgICAodGFyZ2V0KSA9PiB0YXJnZXQuZnBzIDwgMTQ0ICYmIHRhcmdldC5zdXBwb3J0ZWQgPT09IGZhbHNlLFxyXG4gICAgKTtcclxuICAgIGlmIChyZXF1aXJlc0hpZ2gpIHtcclxuICAgICAgbWVzc2FnZS53YXJuaW5nKFxyXG4gICAgICAgICdVc2UgdGhlIGRpc3BsYXkgb3ZlcnJpZGUgdG8gc3dpdGNoIHRvIHRoZSBWaWJlcG9sbG8gdmlydHVhbCBkaXNwbGF5IG9yIGFkanVzdCBEaXNwbGF5IERldmljZSBTdGVwIDEgdG8ga2VlcCBvbmx5IHRoZSBoaWdoLXJlZnJlc2ggbW9uaXRvciBhY3RpdmUuJyxcclxuICAgICAgICB7IGR1cmF0aW9uOiA4MDAwIH0sXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBwbGF5bml0ZUluc3RhbGxlZCA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGlzTmV3ID0gY29tcHV0ZWQoKCkgPT4gZm9ybS52YWx1ZS5pbmRleCA9PT0gLTEpO1xyXG4vLyBOZXcgYXBwIHNvdXJjZTogJ2N1c3RvbScgb3IgJ3BsYXluaXRlJyAoV2luZG93cyBvbmx5KVxyXG5jb25zdCBuZXdBcHBTb3VyY2UgPSByZWY8J2N1c3RvbScgfCAncGxheW5pdGUnPignY3VzdG9tJyk7XHJcbmNvbnN0IHNob3dQbGF5bml0ZVBpY2tlciA9IGNvbXB1dGVkKFxyXG4gICgpID0+IGlzTmV3LnZhbHVlICYmIGlzV2luZG93cy52YWx1ZSAmJiBuZXdBcHBTb3VyY2UudmFsdWUgPT09ICdwbGF5bml0ZScsXHJcbik7XHJcblxyXG4vLyBQbGF5bml0ZSBwaWNrZXIgc3RhdGVcclxuY29uc3QgZ2FtZXNMb2FkaW5nID0gcmVmKGZhbHNlKTtcclxuY29uc3QgcGxheW5pdGVPcHRpb25zID0gcmVmPHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9W10+KFtdKTtcclxuY29uc3Qgc2VsZWN0ZWRQbGF5bml0ZUlkID0gcmVmKCcnKTtcclxuY29uc3QgbG9ja1BsYXluaXRlID0gcmVmKGZhbHNlKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbGF5bml0ZUdhbWVzKCkge1xyXG4gIGlmICghaXNXaW5kb3dzLnZhbHVlIHx8IGdhbWVzTG9hZGluZy52YWx1ZSB8fCBwbGF5bml0ZU9wdGlvbnMudmFsdWUubGVuZ3RoKSByZXR1cm47XHJcbiAgLy8gRW5zdXJlIHdlIGhhdmUgdXAtdG8tZGF0ZSBpbnN0YWxsIHN0YXR1c1xyXG4gIGF3YWl0IHJlZnJlc2hQbGF5bml0ZVN0YXR1cygpO1xyXG4gIGlmICghcGxheW5pdGVJbnN0YWxsZWQudmFsdWUpIHJldHVybjtcclxuICBnYW1lc0xvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvcGxheW5pdGUvZ2FtZXMnKTtcclxuICAgIGNvbnN0IGdhbWVzOiBhbnlbXSA9IEFycmF5LmlzQXJyYXkoci5kYXRhKSA/IHIuZGF0YSA6IFtdO1xyXG4gICAgcGxheW5pdGVPcHRpb25zLnZhbHVlID0gZ2FtZXNcclxuICAgICAgLmZpbHRlcigoZykgPT4gISFnLmluc3RhbGxlZClcclxuICAgICAgLm1hcCgoZykgPT4gKHsgbGFiZWw6IGcubmFtZSB8fCBnLmlkLCB2YWx1ZTogZy5pZCB9KSlcclxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsKSk7XHJcbiAgfSBjYXRjaCAoXykge31cclxuICBnYW1lc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICAvLyBSZWZyZXNoIHN1Z2dlc3Rpb25zIChyZXBsYWNlIHBsYWNlaG9sZGVyIHdpdGggYWN0dWFsIGl0ZW1zKVxyXG4gIHRyeSB7XHJcbiAgICBvbk5hbWVTZWFyY2gobmFtZVNlYXJjaFF1ZXJ5LnZhbHVlKTtcclxuICB9IGNhdGNoIHt9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hQbGF5bml0ZVN0YXR1cygpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL3BsYXluaXRlL3N0YXR1cycsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XHJcbiAgICBpZiAoci5zdGF0dXMgPT09IDIwMCAmJiByLmRhdGEgJiYgdHlwZW9mIHIuZGF0YSA9PT0gJ29iamVjdCcgJiYgci5kYXRhICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgIGNvbnN0IGRhdGEgPSByLmRhdGEgYXMgYW55O1xyXG4gICAgICBwbGF5bml0ZUluc3RhbGxlZC52YWx1ZSA9IGRhdGEuaW5zdGFsbGVkID09PSB0cnVlIHx8IGRhdGEuYWN0aXZlID09PSB0cnVlO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKF8pIHt9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGlja1BsYXluaXRlKGlkOiBzdHJpbmcpIHtcclxuICBjb25zdCBvcHQgPSBwbGF5bml0ZU9wdGlvbnMudmFsdWUuZmluZCgobykgPT4gby52YWx1ZSA9PT0gaWQpO1xyXG4gIGlmICghb3B0KSByZXR1cm47XHJcbiAgLy8gTG9jayBpbiBzZWxlY3Rpb24gYW5kIHNldCBmaWVsZHNcclxuICBmb3JtLnZhbHVlLm5hbWUgPSBvcHQubGFiZWw7XHJcbiAgZm9ybS52YWx1ZS5wbGF5bml0ZUlkID0gaWQ7XHJcbiAgZm9ybS52YWx1ZS5wbGF5bml0ZU1hbmFnZWQgPSAnbWFudWFsJztcclxuICAvLyBjbGVhciBjb21tYW5kIGJ5IGRlZmF1bHQgZm9yIFBsYXluaXRlIG1hbmFnZWQgZW50cmllc1xyXG4gIGlmICghZm9ybS52YWx1ZS5jbWQpIGZvcm0udmFsdWUuY21kID0gJyc7XHJcbiAgbG9ja1BsYXluaXRlLnZhbHVlID0gdHJ1ZTtcclxuICAvLyBSZWZsZWN0IHNlbGVjdGlvbiBpbiB1bmlmaWVkIGNvbWJvYm94XHJcbiAgZW5zdXJlTmFtZVNlbGVjdGlvbkZyb21Gb3JtKCk7XHJcbn1cclxuZnVuY3Rpb24gdW5sb2NrUGxheW5pdGUoKSB7XHJcbiAgbG9ja1BsYXluaXRlLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuLy8gV2hlbiBzd2l0Y2hpbmcgdG8gY3VzdG9tIHNvdXJjZSwgY2xlYXIgUGxheW5pdGUtc3BlY2lmaWMgbWFya2Vyc1xyXG53YXRjaChuZXdBcHBTb3VyY2UsICh2KSA9PiB7XHJcbiAgaWYgKHYgPT09ICdjdXN0b20nKSB7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlSWQgPSB1bmRlZmluZWQ7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlTWFuYWdlZCA9IHVuZGVmaW5lZDtcclxuICAgIGxvY2tQbGF5bml0ZS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgc2VsZWN0ZWRQbGF5bml0ZUlkLnZhbHVlID0gJyc7XHJcbiAgfVxyXG59KTtcclxuLy8gVHJhY2sgaWYgdGhlIHVuaWZpZWQgY2FwdHVyZSBmaXggaXMgYmVpbmcgYXV0by1lbmFibGVkIHRvIHByZXZlbnQgYWxlcnQgc3BhbVxyXG5sZXQgYXV0b0VuYWJsaW5nQ2FwdHVyZUZpeCA9IGZhbHNlO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gZm9ybS52YWx1ZS5nZW4xRnJhbWVnZW5GaXgsXHJcbiAgYXN5bmMgKGVuYWJsZWQpID0+IHtcclxuICAgIGlmICghZW5hYmxlZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBDb2xsYXBzZSBhbnkgR2VuMiBzdGF0ZSBpbnRvIHRoZSB1bmlmaWVkIGNhcHR1cmUgZml4LlxyXG4gICAgaWYgKGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4KSB7XHJcbiAgICAgIGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoYXV0b0VuYWJsaW5nQ2FwdHVyZUZpeCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBtZXNzYWdlPy5pbmZvKFxyXG4gICAgICBcIkZyYW1lIEdlbmVyYXRpb24gQ2FwdHVyZSBGaXggcmVxdWlyZXMgV2luZG93cyBHcmFwaGljcyBDYXB0dXJlIChXR0MpLCBSVFNTLCBhbmQgYSBkaXNwbGF5IGNhcGFibGUgb2YgMjQwIEh6IG9yIGhpZ2hlci4gVmliZXBvbGxvJ3MgdmlydHVhbCBzY3JlZW4gb3IgYW55IGRpc3BsYXkgdGhhdCBzYXRpc2ZpZXMgdGhlIGRvdWJsZWQgcmVmcmVzaCByZXF1aXJlbWVudCB3aWxsIHdvcmsuXCIsXHJcbiAgICAgIHsgZHVyYXRpb246IDgwMDAgfSxcclxuICAgICk7XHJcbiAgICBpZiAoIXNraXBEaXNwbGF5V2FybmluZ3MudmFsdWUpIHtcclxuICAgICAgaWYgKCFkZENvbmZpZ09wdGlvbi52YWx1ZSB8fCBkZENvbmZpZ09wdGlvbi52YWx1ZSA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgICAgIG1lc3NhZ2U/Lndhcm5pbmcoXHJcbiAgICAgICAgICAnQ29uZmlndXJlIFN0ZXAgMSBmb3IgVmliZXBvbGxvXFwncyB2aXJ0dWFsIHNjcmVlbiBvciBlbmFibGUgRGlzcGxheSBEZXZpY2UgYW5kIHNldCBpdCB0byBcIkRlYWN0aXZhdGUgYWxsIG90aGVyIGRpc3BsYXlzXCIgc28gdGhlIGRvdWJsZWQgcmVmcmVzaCByZXF1aXJlbWVudCBpcyBtZXQgZHVyaW5nIHRoZSBzdHJlYW0uJyxcclxuICAgICAgICAgIHsgZHVyYXRpb246IDgwMDAgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRkQ29uZmlnT3B0aW9uLnZhbHVlICE9PSAnZW5zdXJlX29ubHlfZGlzcGxheScpIHtcclxuICAgICAgICBtZXNzYWdlPy53YXJuaW5nKFxyXG4gICAgICAgICAgJ1NldCBTdGVwIDEgdG8gdXNlIFZpYmVwb2xsb1xcJ3MgdmlydHVhbCBzY3JlZW4gb3IgYWRqdXN0IERpc3BsYXkgRGV2aWNlIHRvIFwiRGVhY3RpdmF0ZSBhbGwgb3RoZXIgZGlzcGxheXNcIiBzbyBvbmx5IHRoZSBoaWdoLXJlZnJlc2ggbW9uaXRvciBzdGF5cyBhY3RpdmUuJyxcclxuICAgICAgICAgIHsgZHVyYXRpb246IDgwMDAgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhd2FpdCByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb246ICdnZW4xJyB9KTtcclxuICAgIHdhcm5JZkhlYWx0aElzc3VlcygnZ2VuMScpO1xyXG4gIH0sXHJcbik7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBmb3JtLnZhbHVlLmdlbjJGcmFtZWdlbkZpeCxcclxuICAoZW5hYmxlZCkgPT4ge1xyXG4gICAgaWYgKCFlbmFibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvcm0udmFsdWUuZ2VuMUZyYW1lZ2VuRml4ID0gdHJ1ZTtcclxuICAgIGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4ID0gZmFsc2U7XHJcbiAgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IGRpc3BsYXlTZWxlY3Rpb24udmFsdWUsXHJcbiAgKHNlbGVjdGlvbiwgcHJldikgPT4ge1xyXG4gICAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICAgIGlmICghKGZvcm0udmFsdWUuZ2VuMUZyYW1lZ2VuRml4IHx8IGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4IHx8IGZyYW1lR2VuSGVhbHRoLnZhbHVlKSkgcmV0dXJuO1xyXG4gICAgaWYgKHNlbGVjdGlvbiA9PT0gcHJldikgcmV0dXJuO1xyXG4gICAgY29uc3QgcmVhc29uOiBGcmFtZUdlbkhlYWx0aFJlYXNvbiA9XHJcbiAgICAgIHNlbGVjdGlvbiA9PT0gJ3ZpcnR1YWwnIHx8IHByZXYgPT09ICd2aXJ0dWFsJyA/ICd2aXJ0dWFsLXRvZ2dsZScgOiAnb3V0cHV0LWNoYW5nZSc7XHJcbiAgICByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb24sIHNpbGVudDogdHJ1ZSB9KS5jYXRjaCgoKSA9PiB7fSk7XHJcbiAgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IGNhcHR1cmVNZXRob2QudmFsdWUsXHJcbiAgKCkgPT4ge1xyXG4gICAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICAgIGlmICghKGZvcm0udmFsdWUuZ2VuMUZyYW1lZ2VuRml4IHx8IGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4IHx8IGZyYW1lR2VuSGVhbHRoLnZhbHVlKSkgcmV0dXJuO1xyXG4gICAgcmVmcmVzaEZyYW1lR2VuSGVhbHRoKHsgcmVhc29uOiAnY2FwdHVyZS1jaGFuZ2UnLCBzaWxlbnQ6IHRydWUgfSkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIH0sXHJcbik7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBhdXRvQ2FwdHVyZVVzZXNXZ2MudmFsdWUsXHJcbiAgKGVuYWJsZWQsIHByZXYpID0+IHtcclxuICAgIGlmIChlbmFibGVkID09PSBwcmV2KSByZXR1cm47XHJcbiAgICBpZiAoIWlzV2luZG93cy52YWx1ZSkgcmV0dXJuO1xyXG4gICAgaWYgKCEoZm9ybS52YWx1ZS5nZW4xRnJhbWVnZW5GaXggfHwgZm9ybS52YWx1ZS5nZW4yRnJhbWVnZW5GaXggfHwgZnJhbWVHZW5IZWFsdGgudmFsdWUpKSByZXR1cm47XHJcbiAgICByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb246ICdjYXB0dXJlLWNoYW5nZScsIHNpbGVudDogdHJ1ZSB9KS5jYXRjaCgoKSA9PiB7fSk7XHJcbiAgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IFtmb3JtLnZhbHVlLm91dHB1dCwgZ2xvYmFsT3V0cHV0TmFtZS52YWx1ZV0sXHJcbiAgKCkgPT4ge1xyXG4gICAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICAgIGlmICghKGZvcm0udmFsdWUuZ2VuMUZyYW1lZ2VuRml4IHx8IGZvcm0udmFsdWUuZ2VuMkZyYW1lZ2VuRml4IHx8IGZyYW1lR2VuSGVhbHRoLnZhbHVlKSkgcmV0dXJuO1xyXG4gICAgcmVmcmVzaEZyYW1lR2VuSGVhbHRoKHsgcmVhc29uOiAnb3V0cHV0LWNoYW5nZScsIHNpbGVudDogdHJ1ZSB9KS5jYXRjaCgoKSA9PiB7fSk7XHJcbiAgfSxcclxuKTtcclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgZW5hYmxlIEdlbjEgRnJhbWUgR2VuZXJhdGlvbiBmaXggd2hlbiBGcmFtZSBHZW5lcmF0aW9uIGlzIGVuYWJsZWRcclxud2F0Y2goXHJcbiAgKCkgPT4gZnJhbWVHZW5lcmF0aW9uU2VsZWN0aW9uLnZhbHVlLFxyXG4gIChtb2RlLCBwcmV2TW9kZSkgPT4ge1xyXG4gICAgY29uc3QgYW55RnJhbWVHZW5FbmFibGVkID0gbW9kZSAhPT0gJ29mZic7XHJcbiAgICBjb25zdCB3YXNGcmFtZUdlbkVuYWJsZWQgPSBwcmV2TW9kZSAhPT0gJ29mZic7XHJcbiAgICBpZiAoYW55RnJhbWVHZW5FbmFibGVkICYmICFmb3JtLnZhbHVlLmdlbjFGcmFtZWdlbkZpeCkge1xyXG4gICAgICBhdXRvRW5hYmxpbmdDYXB0dXJlRml4ID0gdHJ1ZTtcclxuICAgICAgZm9ybS52YWx1ZS5nZW4xRnJhbWVnZW5GaXggPSB0cnVlO1xyXG4gICAgICBpZiAobW9kZSA9PT0gJ252aWRpYS1zbW9vdGgtbW90aW9uJykge1xyXG4gICAgICAgIG1lc3NhZ2U/LmluZm8oXHJcbiAgICAgICAgICAnRnJhbWUgR2VuZXJhdGlvbiBDYXB0dXJlIEZpeCBoYXMgYmVlbiBhdXRvbWF0aWNhbGx5IGVuYWJsZWQuIE5WSURJQSBTbW9vdGggTW90aW9uIHVzZXMgUlRTUyBGcm9udCBFZGdlIFN5bmMgZHVyaW5nIHN0cmVhbXMuJyxcclxuICAgICAgICAgIHsgZHVyYXRpb246IDgwMDAgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdsb3NzbGVzcy1zY2FsaW5nJykge1xyXG4gICAgICAgIG1lc3NhZ2U/LmluZm8oXHJcbiAgICAgICAgICAnRnJhbWUgR2VuZXJhdGlvbiBDYXB0dXJlIEZpeCBoYXMgYmVlbiBhdXRvbWF0aWNhbGx5IGVuYWJsZWQgYmVjYXVzZSBMb3NzbGVzcyBTY2FsaW5nIGZyYW1lIGdlbmVyYXRpb24gdXNlcyBSVFNTIEZyb250IEVkZ2UgU3luYy4nLFxyXG4gICAgICAgICAgeyBkdXJhdGlvbjogODAwMCB9LFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gJ2dhbWUtcHJvdmlkZWQnKSB7XHJcbiAgICAgICAgbWVzc2FnZT8uaW5mbyhcclxuICAgICAgICAgICdGcmFtZSBHZW5lcmF0aW9uIENhcHR1cmUgRml4IGhhcyBiZWVuIGF1dG9tYXRpY2FsbHkgZW5hYmxlZC4gR2FtZS1wcm92aWRlZCBmcmFtZSBnZW5lcmF0aW9uIHVzZXMgTlZJRElBIFJlZmxleCBvbiBOVklESUEgc3lzdGVtcyBhbmQgRnJvbnQgRWRnZSBTeW5jIG9uIEFNRCBzeXN0ZW1zLicsXHJcbiAgICAgICAgICB7IGR1cmF0aW9uOiA4MDAwIH0sXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICByZWZyZXNoRnJhbWVHZW5IZWFsdGgoeyByZWFzb246ICdhdXRvJywgc2lsZW50OiB0cnVlIH0pLmNhdGNoKCgpID0+IHt9KTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYXV0b0VuYWJsaW5nQ2FwdHVyZUZpeCA9IGZhbHNlO1xyXG4gICAgICB9LCAxMDApO1xyXG4gICAgfSBlbHNlIGlmICghYW55RnJhbWVHZW5FbmFibGVkICYmIHdhc0ZyYW1lR2VuRW5hYmxlZCAmJiBmb3JtLnZhbHVlLmdlbjFGcmFtZWdlbkZpeCkge1xyXG4gICAgICBhdXRvRW5hYmxpbmdDYXB0dXJlRml4ID0gdHJ1ZTtcclxuICAgICAgZm9ybS52YWx1ZS5nZW4xRnJhbWVnZW5GaXggPSBmYWxzZTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYXV0b0VuYWJsaW5nQ2FwdHVyZUZpeCA9IGZhbHNlO1xyXG4gICAgICB9LCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbik7XHJcbi8vIFNjcm9sbCBhZmZvcmRhbmNlIGxvZ2ljIGZvciBtb2RhbCBib2R5XHJcbmNvbnN0IGJvZHlSZWYgPSByZWY8SFRNTEVsZW1lbnQgfCBudWxsPihudWxsKTtcclxuY29uc3Qgc2hvd1RvcFNoYWRvdyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHNob3dCb3R0b21TaGFkb3cgPSByZWYoZmFsc2UpO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2hhZG93cygpIHtcclxuICBjb25zdCBlbCA9IGJvZHlSZWYudmFsdWU7XHJcbiAgaWYgKCFlbCkgcmV0dXJuO1xyXG4gIGNvbnN0IHsgc2Nyb2xsVG9wLCBzY3JvbGxIZWlnaHQsIGNsaWVudEhlaWdodCB9ID0gZWw7XHJcbiAgY29uc3QgaGFzT3ZlcmZsb3cgPSBzY3JvbGxIZWlnaHQgPiBjbGllbnRIZWlnaHQgKyAxO1xyXG4gIHNob3dUb3BTaGFkb3cudmFsdWUgPSBoYXNPdmVyZmxvdyAmJiBzY3JvbGxUb3AgPiA0O1xyXG4gIHNob3dCb3R0b21TaGFkb3cudmFsdWUgPSBoYXNPdmVyZmxvdyAmJiBzY3JvbGxUb3AgKyBjbGllbnRIZWlnaHQgPCBzY3JvbGxIZWlnaHQgLSA0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkJvZHlTY3JvbGwoKSB7XHJcbiAgdXBkYXRlU2hhZG93cygpO1xyXG59XHJcblxyXG5sZXQgcm86IFJlc2l6ZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XHJcbm9uTW91bnRlZCgoKSA9PiB7XHJcbiAgY29uc3QgZWwgPSBib2R5UmVmLnZhbHVlO1xyXG4gIGlmIChlbCkge1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25Cb2R5U2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSk7XHJcbiAgfVxyXG4gIC8vIFVwZGF0ZSBvbiBzaXplL2NvbnRlbnQgY2hhbmdlc1xyXG4gIHRyeSB7XHJcbiAgICBybyA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB1cGRhdGVTaGFkb3dzKCkpO1xyXG4gICAgaWYgKGVsKSByby5vYnNlcnZlKGVsKTtcclxuICB9IGNhdGNoIHt9XHJcbiAgLy8gSW5pdGlhbCBjYWxjIGFmdGVyIG5leHQgcGFpbnRcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdXBkYXRlU2hhZG93cygpKTtcclxufSk7XHJcbm9uQmVmb3JlVW5tb3VudCgoKSA9PiB7XHJcbiAgY29uc3QgZWwgPSBib2R5UmVmLnZhbHVlO1xyXG4gIGlmIChlbCkgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25Cb2R5U2Nyb2xsIGFzIGFueSk7XHJcbiAgdHJ5IHtcclxuICAgIHJvPy5kaXNjb25uZWN0KCk7XHJcbiAgfSBjYXRjaCB7fVxyXG4gIHJvID0gbnVsbDtcclxufSk7XHJcblxyXG4vLyBVcGRhdGUgbmFtZSBvcHRpb25zIHdoaWxlIHVzZXIgc2VhcmNoZXNcclxuZnVuY3Rpb24gb25OYW1lU2VhcmNoKHE6IHN0cmluZykge1xyXG4gIG5hbWVTZWFyY2hRdWVyeS52YWx1ZSA9IHEgfHwgJyc7XHJcbiAgY29uc3QgcXVlcnkgPSBTdHJpbmcocSB8fCAnJylcclxuICAgIC50cmltKClcclxuICAgIC50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IGxpc3Q6IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9W10gPSBbXTtcclxuICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICBsaXN0LnB1c2goeyBsYWJlbDogYEN1c3RvbTogXCIke3F9XCJgLCB2YWx1ZTogYF9fY3VzdG9tX186JHtxfWAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGN1ciA9IFN0cmluZyhmb3JtLnZhbHVlLm5hbWUgfHwgJycpLnRyaW0oKTtcclxuICAgIGlmIChjdXIpIGxpc3QucHVzaCh7IGxhYmVsOiBgQ3VzdG9tOiBcIiR7Y3VyfVwiYCwgdmFsdWU6IGBfX2N1c3RvbV9fOiR7Y3VyfWAgfSk7XHJcbiAgfVxyXG4gIGlmIChwbGF5bml0ZU9wdGlvbnMudmFsdWUubGVuZ3RoKSB7XHJcbiAgICBjb25zdCBmaWx0ZXJlZCA9IChcclxuICAgICAgcXVlcnlcclxuICAgICAgICA/IHBsYXluaXRlT3B0aW9ucy52YWx1ZS5maWx0ZXIoKG8pID0+IG8ubGFiZWwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeSkpXHJcbiAgICAgICAgOiBwbGF5bml0ZU9wdGlvbnMudmFsdWUuc2xpY2UoMCwgMTAwKVxyXG4gICAgKS5zbGljZSgwLCAxMDApO1xyXG4gICAgbGlzdC5wdXNoKC4uLmZpbHRlcmVkKTtcclxuICB9XHJcbiAgbmFtZU9wdGlvbnMudmFsdWUgPSBsaXN0O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgcGlja2luZyBlaXRoZXIgYSBQbGF5bml0ZSBnYW1lIG9yIGEgY3VzdG9tIG5hbWVcclxuZnVuY3Rpb24gb25OYW1lUGlja2VkKHZhbDogc3RyaW5nIHwgbnVsbCkge1xyXG4gIGNvbnN0IHYgPSBTdHJpbmcodmFsIHx8ICcnKTtcclxuICBpZiAoIXYpIHtcclxuICAgIG5hbWVTZWxlY3RWYWx1ZS52YWx1ZSA9ICcnO1xyXG4gICAgZm9ybS52YWx1ZS5uYW1lID0gJyc7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlSWQgPSB1bmRlZmluZWQ7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlTWFuYWdlZCA9IHVuZGVmaW5lZDtcclxuICAgIHZhbGlkYXRlTmFtZSgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAodi5zdGFydHNXaXRoKCdfX2N1c3RvbV9fOicpKSB7XHJcbiAgICBjb25zdCBuYW1lID0gdi5zdWJzdHJpbmcoJ19fY3VzdG9tX186Jy5sZW5ndGgpLnRyaW0oKTtcclxuICAgIGZvcm0udmFsdWUubmFtZSA9IG5hbWU7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlSWQgPSB1bmRlZmluZWQ7XHJcbiAgICBmb3JtLnZhbHVlLnBsYXluaXRlTWFuYWdlZCA9IHVuZGVmaW5lZDtcclxuICAgIHZhbGlkYXRlTmFtZSgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjb25zdCBvcHQgPSBwbGF5bml0ZU9wdGlvbnMudmFsdWUuZmluZCgobykgPT4gby52YWx1ZSA9PT0gdik7XHJcbiAgaWYgKG9wdCkge1xyXG4gICAgZm9ybS52YWx1ZS5uYW1lID0gb3B0LmxhYmVsO1xyXG4gICAgZm9ybS52YWx1ZS5wbGF5bml0ZUlkID0gdjtcclxuICAgIGZvcm0udmFsdWUucGxheW5pdGVNYW5hZ2VkID0gJ21hbnVhbCc7XHJcbiAgfVxyXG4gIHZhbGlkYXRlTmFtZSgpO1xyXG59XHJcblxyXG4vLyBDb3ZlciBwcmV2aWV3IGxvZ2ljIHJlbW92ZWQ7IFZpYmVwb2xsbyBubyBsb25nZXIgZmV0Y2hlcyBvciBwcm94aWVzIGltYWdlc1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlKCkge1xyXG4gIHZhbGlkYXRlTmFtZSgpO1xyXG4gIGlmIChuYW1lRXJyb3IudmFsdWUpIHJldHVybjtcclxuICBzYXZpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiBvbiBXaW5kb3dzIGFuZCBuYW1lIGV4YWN0bHkgbWF0Y2hlcyBhIFBsYXluaXRlIGdhbWUsIGF1dG8tbGluayBpdFxyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIGlzV2luZG93cy52YWx1ZSAmJlxyXG4gICAgICAgICFmb3JtLnZhbHVlLnBsYXluaXRlSWQgJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHBsYXluaXRlT3B0aW9ucy52YWx1ZSkgJiZcclxuICAgICAgICBwbGF5bml0ZU9wdGlvbnMudmFsdWUubGVuZ3RoICYmXHJcbiAgICAgICAgdHlwZW9mIGZvcm0udmFsdWUubmFtZSA9PT0gJ3N0cmluZydcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gU3RyaW5nKGZvcm0udmFsdWUubmFtZSB8fCAnJylcclxuICAgICAgICAgIC50cmltKClcclxuICAgICAgICAgIC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IGV4YWN0ID0gcGxheW5pdGVPcHRpb25zLnZhbHVlLmZpbmQoKG8pID0+IG8ubGFiZWwudHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09IHRhcmdldCk7XHJcbiAgICAgICAgaWYgKGV4YWN0KSB7XHJcbiAgICAgICAgICBmb3JtLnZhbHVlLnBsYXluaXRlSWQgPSBleGFjdC52YWx1ZTtcclxuICAgICAgICAgIGZvcm0udmFsdWUucGxheW5pdGVNYW5hZ2VkID0gJ21hbnVhbCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChfKSB7fVxyXG4gICAgY29uc3QgcGF5bG9hZCA9IHRvU2VydmVyUGF5bG9hZChmb3JtLnZhbHVlKTtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaHR0cC5wb3N0KCcuL2FwaS9hcHBzJywgcGF5bG9hZCwge1xyXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IG9rU3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDA7XHJcbiAgICBjb25zdCByZXNwb25zZURhdGEgPSByZXNwb25zZT8uZGF0YSBhcyBhbnk7XHJcbiAgICBpZiAoIW9rU3RhdHVzIHx8IChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLnN0YXR1cyA9PT0gZmFsc2UpKSB7XHJcbiAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPVxyXG4gICAgICAgIHJlc3BvbnNlRGF0YSAmJiB0eXBlb2YgcmVzcG9uc2VEYXRhID09PSAnb2JqZWN0JyAmJiAnZXJyb3InIGluIHJlc3BvbnNlRGF0YVxyXG4gICAgICAgICAgPyBTdHJpbmcocmVzcG9uc2VEYXRhLmVycm9yID8/ICdGYWlsZWQgdG8gc2F2ZSBhcHBsaWNhdGlvbi4nKVxyXG4gICAgICAgICAgOiAnRmFpbGVkIHRvIHNhdmUgYXBwbGljYXRpb24uJztcclxuICAgICAgbWVzc2FnZT8uZXJyb3IoZXJyTWVzc2FnZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGVtaXQoJ3NhdmVkJyk7XHJcbiAgICBjbG9zZSgpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzYXZpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRlbCgpIHtcclxuICBzYXZpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiBQbGF5bml0ZSBhdXRvLW1hbmFnZWQsIGFkZCB0byBleGNsdXNpb24gbGlzdCBiZWZvcmUgcmVtb3ZpbmdcclxuICAgIGNvbnN0IHBpZCA9IGZvcm0udmFsdWUucGxheW5pdGVJZDtcclxuICAgIGlmIChpc1BsYXluaXRlQXV0by52YWx1ZSAmJiBwaWQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBFbnN1cmUgY29uZmlnIHN0b3JlIGlzIGxvYWRlZFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyBAdHMtaWdub3JlIG9wdGlvbmFsIGNoYWluaW5nIGZvciBvbGRlciBydW50aW1lXHJcbiAgICAgICAgICBpZiAoIWNvbmZpZ1N0b3JlLmNvbmZpZykgYXdhaXQgKGNvbmZpZ1N0b3JlLmZldGNoQ29uZmlnPy4oKSB8fCBQcm9taXNlLnJlc29sdmUoKSk7XHJcbiAgICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICAgIC8vIFN0YXJ0IGZyb20gY3VycmVudCBsb2NhbCBzdG9yZSBzdGF0ZSB0byBhdm9pZCBkZXN5bmNcclxuICAgICAgICBjb25zdCBjdXJyZW50OiBBcnJheTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9PiA9IEFycmF5LmlzQXJyYXkoXHJcbiAgICAgICAgICAoY29uZmlnU3RvcmUuY29uZmlnIGFzIGFueSk/LnBsYXluaXRlX2V4Y2x1ZGVfZ2FtZXMsXHJcbiAgICAgICAgKVxyXG4gICAgICAgICAgPyAoKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpLnBsYXluaXRlX2V4Y2x1ZGVfZ2FtZXMgYXMgYW55KVxyXG4gICAgICAgICAgOiBbXTtcclxuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKGN1cnJlbnQubWFwKChlKSA9PiBbU3RyaW5nKGUuaWQpLCBTdHJpbmcoZS5uYW1lIHx8ICcnKV0gYXMgY29uc3QpKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gcGxheW5pdGVPcHRpb25zLnZhbHVlLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IFN0cmluZyhwaWQpKT8ubGFiZWwgfHwgJyc7XHJcbiAgICAgICAgbWFwLnNldChTdHJpbmcocGlkKSwgbmFtZSk7XHJcbiAgICAgICAgY29uc3QgbmV4dCA9IEFycmF5LmZyb20obWFwLmVudHJpZXMoKSkubWFwKChbaWQsIG5hbWVdKSA9PiAoeyBpZCwgbmFtZSB9KSk7XHJcbiAgICAgICAgLy8gVXBkYXRlIGxvY2FsIHN0b3JlIChrZWVwcyBVSSBpbiBzeW5jKSBhbmQgcGVyc2lzdCB2aWEgc3RvcmUgQVBJXHJcbiAgICAgICAgY29uZmlnU3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX2dhbWVzJywgbmV4dCk7XHJcbiAgICAgICAgYXdhaXQgY29uZmlnU3RvcmUuc2F2ZSgpO1xyXG4gICAgICB9IGNhdGNoIChfKSB7XHJcbiAgICAgICAgLy8gYmVzdC1lZmZvcnQ7IGNvbnRpbnVlIHdpdGggZGVsZXRpb24gZXZlbiBpZiBleGNsdXNpb24gc2F2ZSBmYWlsc1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAuZGVsZXRlKGAuL2FwaS9hcHBzLyR7Zm9ybS52YWx1ZS5pbmRleH1gLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKHIgJiYgKHIgYXMgYW55KS5kYXRhICYmIChyIGFzIGFueSkuZGF0YS5wbGF5bml0ZUZ1bGxzY3JlZW5EaXNhYmxlZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25maWdTdG9yZS51cGRhdGVPcHRpb24oJ3BsYXluaXRlX2Z1bGxzY3JlZW5fZW50cnlfZW5hYmxlZCcsIGZhbHNlKTtcclxuICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIG1lc3NhZ2U/LmluZm8oXHJcbiAgICAgICAgICAgICdQbGF5bml0ZSBGdWxsc2NyZWVuIGVudHJ5IHJlbW92ZWQuIFRoZSBQbGF5bml0ZSBEZXNrdG9wIG9wdGlvbiB3YXMgdHVybmVkIG9mZiBpbiBTZXR0aW5ncyAtPiBQbGF5bml0ZS4nLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge31cclxuICAgIC8vIEJlc3QtZWZmb3J0IGZvcmNlIHN5bmMgb24gV2luZG93cyBlbnZpcm9ubWVudHNcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGh0dHAucG9zdCgnLi9hcGkvcGxheW5pdGUvZm9yY2Vfc3luYycsIHt9LCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgfSBjYXRjaCAoXykge31cclxuICAgIGVtaXQoJ2RlbGV0ZWQnKTtcclxuICAgIGNsb3NlKCk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNhdmluZy52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG48L3NjcmlwdD5cclxuPHN0eWxlIHNjb3BlZD5cclxuLm1vYmlsZS1vbmx5LWhpZGRlbiB7XHJcbiAgZGlzcGxheTogbm9uZTtcclxufVxyXG5cclxuLyogTW9iaWxlLWZyaWVuZGx5IG1vZGFsIHNpemluZyBhbmQgc3RpY2t5IGhlYWRlci9mb290ZXIgKi9cclxuQG1lZGlhIChtYXgtd2lkdGg6IDY0MHB4KSB7XHJcbiAgOmRlZXAoLm4tbW9kYWwgLm4tY2FyZCkge1xyXG4gICAgYm9yZGVyLXJhZGl1czogMCAhaW1wb3J0YW50O1xyXG4gICAgbWF4LXdpZHRoOiAxMDB2dyAhaW1wb3J0YW50O1xyXG4gICAgd2lkdGg6IDEwMHZ3ICFpbXBvcnRhbnQ7XHJcbiAgICBoZWlnaHQ6IDEwMGR2aCAhaW1wb3J0YW50O1xyXG4gICAgbWF4LWhlaWdodDogMTAwZHZoICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICA6ZGVlcCgubi1tb2RhbCAubi1jYXJkIC5uLWNhcmRfX2hlYWRlciksXHJcbiAgOmRlZXAoLm4tbW9kYWwgLm4tY2FyZCAubi1jYXJkLWhlYWRlcikge1xyXG4gICAgcG9zaXRpb246IHN0aWNreTtcclxuICAgIHRvcDogMDtcclxuICAgIHotaW5kZXg6IDEwO1xyXG4gICAgYmFja2Ryb3AtZmlsdGVyOiBzYXR1cmF0ZSgxLjIpIGJsdXIoOHB4KTtcclxuICAgIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjkpO1xyXG4gIH1cclxuXHJcbiAgOmRlZXAoLmRhcmsgLm4tbW9kYWwgLm4tY2FyZCAubi1jYXJkX19oZWFkZXIpLFxyXG4gIDpkZWVwKC5kYXJrIC5uLW1vZGFsIC5uLWNhcmQgLm4tY2FyZC1oZWFkZXIpIHtcclxuICAgIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1zdXJmYWNlKSAvIDAuOSk7XHJcbiAgfVxyXG5cclxuICA6ZGVlcCgubi1tb2RhbCAubi1jYXJkIC5uLWNhcmRfX2Zvb3RlciksXHJcbiAgOmRlZXAoLm4tbW9kYWwgLm4tY2FyZCAubi1jYXJkLWZvb3Rlcikge1xyXG4gICAgcG9zaXRpb246IHN0aWNreTtcclxuICAgIGJvdHRvbTogMDtcclxuICAgIHotaW5kZXg6IDEwO1xyXG4gICAgYmFja2Ryb3AtZmlsdGVyOiBzYXR1cmF0ZSgxLjIpIGJsdXIoOHB4KTtcclxuICAgIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjkpO1xyXG4gICAgcGFkZGluZy1ib3R0b206IGNhbGMoZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pICsgMC41cmVtKSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgOmRlZXAoLmRhcmsgLm4tbW9kYWwgLm4tY2FyZCAubi1jYXJkX19mb290ZXIpLFxyXG4gIDpkZWVwKC5kYXJrIC5uLW1vZGFsIC5uLWNhcmQgLm4tY2FyZC1mb290ZXIpIHtcclxuICAgIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1zdXJmYWNlKSAvIDAuOSk7XHJcbiAgfVxyXG59XHJcblxyXG4uc2Nyb2xsLXNoYWRvdy10b3Age1xyXG4gIHBvc2l0aW9uOiBzdGlja3k7XHJcbiAgdG9wOiAwO1xyXG4gIGhlaWdodDogMTZweDtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoXHJcbiAgICB0byBib3R0b20sXHJcbiAgICByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC45KSxcclxuICAgIHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwKVxyXG4gICk7XHJcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgei1pbmRleDogMTtcclxufVxyXG5cclxuLmRhcmsgLnNjcm9sbC1zaGFkb3ctdG9wIHtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoXHJcbiAgICB0byBib3R0b20sXHJcbiAgICByZ2IodmFyKC0tY29sb3Itc3VyZmFjZSkgLyAwLjkpLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLXN1cmZhY2UpIC8gMClcclxuICApO1xyXG59XHJcblxyXG4uc2Nyb2xsLXNoYWRvdy1ib3R0b20ge1xyXG4gIHBvc2l0aW9uOiBzdGlja3k7XHJcbiAgYm90dG9tOiAwO1xyXG4gIGhlaWdodDogMjBweDtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC45KSwgcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDApKTtcclxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcclxuICB6LWluZGV4OiAxO1xyXG59XHJcblxyXG4uZGFyayAuc2Nyb2xsLXNoYWRvdy1ib3R0b20ge1xyXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcclxuICAgIHRvIHRvcCxcclxuICAgIHJnYih2YXIoLS1jb2xvci1zdXJmYWNlKSAvIDAuOSksXHJcbiAgICByZ2IodmFyKC0tY29sb3Itc3VyZmFjZSkgLyAwKVxyXG4gICk7XHJcbn1cclxuXHJcbi51aS1pbnB1dCB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEyKTtcclxuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpO1xyXG4gIHBhZGRpbmc6IDhweCAxMHB4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICBmb250LXNpemU6IDEzcHg7XHJcbiAgbGluZS1oZWlnaHQ6IDEuMjtcclxufVxyXG5cclxuLmRhcmsgLnVpLWlucHV0IHtcclxuICBiYWNrZ3JvdW5kOiByZ2JhKDEzLCAxNiwgMjgsIDAuNjUpO1xyXG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE0KTtcclxuICBjb2xvcjogI2Y1ZjlmZjtcclxufVxyXG5cclxuLnVpLWNoZWNrYm94IHtcclxuICB3aWR0aDogMTRweDtcclxuICBoZWlnaHQ6IDE0cHg7XHJcbn1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbIl91c2VNb2RlbCIsIl9vcGVuQmxvY2siLCJfY3JlYXRlRWxlbWVudEJsb2NrIiwiX2hvaXN0ZWRfMSIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfaG9pc3RlZF8yIiwiX2hvaXN0ZWRfMyIsIl9jcmVhdGVWTm9kZSIsIl91bnJlZiIsIl9ub3JtYWxpemVDbGFzcyIsIl9ob2lzdGVkXzQiLCJfdG9EaXNwbGF5U3RyaW5nIiwiX2hvaXN0ZWRfNSIsIl9jcmVhdGVCbG9jayIsIl9ob2lzdGVkXzYiLCJfaG9pc3RlZF83IiwiX2hvaXN0ZWRfOCIsIl9ob2lzdGVkXzkiLCJfaG9pc3RlZF8xMCIsIk5JbnB1dCIsIl9ob2lzdGVkXzExIiwiX2hvaXN0ZWRfMTIiLCJfaG9pc3RlZF8xMyIsIl9ob2lzdGVkXzE0IiwiX0ZyYWdtZW50IiwiX2hvaXN0ZWRfMTUiLCJfaG9pc3RlZF8xNiIsIl9ob2lzdGVkXzE3IiwiX2hvaXN0ZWRfMTgiLCJ2YWx1ZSIsIl9ob2lzdGVkXzE5IiwiX2hvaXN0ZWRfMjAiLCJfaG9pc3RlZF8yMSIsIl9ob2lzdGVkXzIyIiwiX2hvaXN0ZWRfMjMiLCJsb3NzbGVzc0FjdGl2ZSIsIm52aWRpYUFjdGl2ZSIsInVzaW5nVmlydHVhbERpc3BsYXkiLCJoZWFsdGhMb2FkaW5nIiwiaGVhbHRoRXJyb3IiLCJoZWFsdGgiLCJfaG9pc3RlZF8yNCIsIl9yZW5kZXJMaXN0IiwiX2hvaXN0ZWRfMjUiLCJfaG9pc3RlZF8yNiIsIl9ob2lzdGVkXzI3IiwiX2hvaXN0ZWRfMjgiLCJfaG9pc3RlZF8yOSIsIl9ob2lzdGVkXzMwIiwiX2hvaXN0ZWRfMzEiLCJfaG9pc3RlZF8zMiIsIl9ob2lzdGVkXzMzIiwiX2hvaXN0ZWRfMzQiLCJfaG9pc3RlZF8zNSIsIl9ob2lzdGVkXzM2IiwiX2hvaXN0ZWRfMzciLCJfaG9pc3RlZF8zOCIsIl9ob2lzdGVkXzM5IiwiJHQiLCJudW1lcmF0b3IiLCJkZW5vbWluYXRvciIsIm5hbWUiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX2NyZWF0ZUNvbW1lbnRWTm9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFVTyxNQUFNLG9CQUFvQjtBQUMxQixNQUFNLG9CQUFvQjtBQUMxQixNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLHlCQUF5QjtBQUMvQixNQUFNLHlCQUF5QjtBQUUvQixNQUFNLDJCQUE0RTtBQUFBLEVBQ3ZGLEVBQUUsT0FBTyxPQUFPLE9BQU8sTUFBTTtBQUFBLEVBQzdCLEVBQUUsT0FBTyxPQUFPLE9BQU8sTUFBTTtBQUFBLEVBQzdCLEVBQUUsT0FBTyxXQUFXLE9BQU8sTUFBTTtBQUFBLEVBQ2pDLEVBQUUsT0FBTyxPQUFPLE9BQU8sTUFBTTtBQUFBLEVBQzdCLEVBQUUsT0FBTyxRQUFRLE9BQU8sT0FBTztBQUFBLEVBQy9CLEVBQUUsT0FBTyxnQkFBZ0IsT0FBTyxPQUFPO0FBQUEsRUFDdkMsRUFBRSxPQUFPLFdBQVcsT0FBTyxVQUFVO0FBQUEsRUFDckMsRUFBRSxPQUFPLE9BQU8sT0FBTyxNQUFNO0FBQUEsRUFDN0IsRUFBRSxPQUFPLGtCQUFrQixPQUFPLGlCQUFpQjtBQUFBLEVBQ25ELEVBQUUsT0FBTyxpQkFBaUIsT0FBTyxVQUFVO0FBQUEsRUFDM0MsRUFBRSxPQUFPLHFCQUFxQixPQUFPLFVBQVU7QUFDakQ7QUFFYSxNQUFBLGtEQUFrQyxJQUF5QjtBQUFBLEVBQ3RFO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUVNLE1BQU0sdUJBQWdFO0FBQUEsRUFDM0UsRUFBRSxPQUFPLFNBQVMsT0FBTyxJQUFJO0FBQUEsRUFDN0IsRUFB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
