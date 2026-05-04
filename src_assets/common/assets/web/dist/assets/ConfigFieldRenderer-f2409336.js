import { k as defineComponent, aa as mergeModels, ac as useModel, ad as useSlots, c as computed, O as createElementBlock, V as createBaseVNode, U as createVNode, Z as unref, P as toDisplayString, j as createTextVNode, q as renderSlot, W as createCommentVNode, Q as openBlock, ae as useAttrs, r as ref, w as watch, M as createBlock, S as withCtx, s as mergeProps, R as useI18n } from "./vue-core-de07660f.js";
import { ao as NCheckbox, aG as NInputNumber, an as __unplugin_components_0, aH as NSelect, aO as NSwitch } from "./vendor-33781bfc.js";
import { _ as _export_sfc, u as useConfigStore } from "./index-f3a48eb0.js";
const _hoisted_1$2 = ["id"];
const _hoisted_2$2 = { class: "flex items-start justify-between gap-3" };
const _hoisted_3$2 = { class: "flex min-w-0 flex-1 items-start gap-3" };
const _hoisted_4$2 = { class: "pt-0.5" };
const _hoisted_5$2 = { class: "min-w-0 flex-1 space-y-1" };
const _hoisted_6$1 = ["for"];
const _hoisted_7$1 = {
  key: 0,
  class: "form-text mt-0"
};
const _hoisted_8$1 = {
  key: 1,
  class: "form-text mt-0"
};
const _hoisted_9 = {
  key: 2,
  class: "mt-1 text-xs opacity-60"
};
const _hoisted_10 = {
  key: 0,
  class: "shrink-0 pt-0.5"
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "Checkbox",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: [String, null], required: false, default: null },
    desc: { type: [String, null], required: false, default: null },
    localePrefix: { type: String, required: false, default: "missing-prefix" },
    inverseValues: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false },
    default: { type: null, required: false, default: null }
  }, {
    "modelValue": { required: true },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const slots = useSlots();
    const props = __props;
    function mapToBoolRepresentation(value) {
      if (value === true || value === false)
        return { possibleValues: [true, false], value };
      if (value === 1 || value === 0)
        return { possibleValues: [1, 0], value };
      const stringPairs = [
        ["true", "false"],
        ["1", "0"],
        ["enabled", "disabled"],
        ["enable", "disable"],
        ["yes", "no"],
        ["on", "off"]
      ];
      if (value === void 0 || value === null)
        return null;
      const norm = String(value).toLowerCase().trim();
      for (const pair of stringPairs) {
        if (norm === pair[0] || norm === pair[1])
          return { possibleValues: pair, value: norm };
      }
      return null;
    }
    const checkboxValues = computed(() => {
      const fromModel = mapToBoolRepresentation(model.value);
      if (fromModel) {
        const truthyIndex = props.inverseValues ? 1 : 0;
        const falsyIndex = props.inverseValues ? 0 : 1;
        return {
          truthy: fromModel.possibleValues[truthyIndex],
          falsy: fromModel.possibleValues[falsyIndex]
        };
      }
      const fromDefault = mapToBoolRepresentation(props.default);
      if (fromDefault) {
        const truthyIndex = props.inverseValues ? 1 : 0;
        const falsyIndex = props.inverseValues ? 0 : 1;
        return {
          truthy: fromDefault.possibleValues[truthyIndex],
          falsy: fromDefault.possibleValues[falsyIndex]
        };
      }
      return { truthy: !props.inverseValues, falsy: !!props.inverseValues };
    });
    const isChecked = computed({
      get() {
        const { truthy, falsy } = checkboxValues.value;
        const cur = model.value;
        const mapped = mapToBoolRepresentation(cur);
        if (mapped)
          return mapped.value === mapped.possibleValues[0] ? !props.inverseValues : !!props.inverseValues;
        const def = mapToBoolRepresentation(props.default);
        if (def)
          return def.value === def.possibleValues[0] ? !props.inverseValues : !!props.inverseValues;
        return cur === truthy;
      },
      set(checked) {
        const { truthy, falsy } = checkboxValues.value;
        model.value = checked ? truthy : falsy;
      }
    });
    const parsedDefaultPropValue = (() => {
      const boolValues = mapToBoolRepresentation(props.default);
      if (boolValues)
        return boolValues.value === boolValues.possibleValues[0];
      return null;
    })();
    const labelField = props.label ?? `${props.localePrefix}.${props.id}`;
    const descField = props.desc ?? `${props.localePrefix}.${props.id}_desc`;
    const showDesc = computed(() => props.desc !== "" || Boolean(slots["default"]));
    const showActions = computed(() => Boolean(slots["actions"]));
    const showMeta = computed(() => Boolean(slots["meta"]));
    const showDefValue = parsedDefaultPropValue !== null;
    const defValue = parsedDefaultPropValue ? "_common.enabled_def_cbox" : "_common.disabled_def_cbox";
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "form-check",
        id: props.id
      }, [
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("div", _hoisted_3$2, [
            createBaseVNode("div", _hoisted_4$2, [
              createVNode(unref(NCheckbox), {
                id: `${props.id}_cb`,
                checked: isChecked.value,
                "onUpdate:checked": _cache[0] || (_cache[0] = ($event) => isChecked.value = $event),
                disabled: props.disabled
              }, null, 8, ["id", "checked", "disabled"])
            ]),
            createBaseVNode("div", _hoisted_5$2, [
              createBaseVNode("label", {
                for: `${props.id}_cb`,
                class: "form-label cursor-pointer leading-snug"
              }, toDisplayString(_ctx.$t(unref(labelField))), 9, _hoisted_6$1),
              showDesc.value ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
                createTextVNode(
                  toDisplayString(_ctx.$t(unref(descField))) + " ",
                  1
                  /* TEXT */
                ),
                renderSlot(_ctx.$slots, "default")
              ])) : createCommentVNode("v-if", true),
              showDefValue ? (openBlock(), createElementBlock(
                "div",
                _hoisted_8$1,
                toDisplayString(_ctx.$t(unref(defValue))),
                1
                /* TEXT */
              )) : createCommentVNode("v-if", true),
              showMeta.value ? (openBlock(), createElementBlock("div", _hoisted_9, [
                renderSlot(_ctx.$slots, "meta")
              ])) : createCommentVNode("v-if", true)
            ])
          ]),
          showActions.value ? (openBlock(), createElementBlock("div", _hoisted_10, [
            renderSlot(_ctx.$slots, "actions")
          ])) : createCommentVNode("v-if", true)
        ])
      ], 8, _hoisted_1$2);
    };
  }
});
const Checkbox = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/Checkbox.vue"]]);
const _hoisted_1$1 = { class: "space-y-1" };
const _hoisted_2$1 = { class: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between" };
const _hoisted_3$1 = ["for"];
const _hoisted_4$1 = {
  key: 1,
  class: "form-label"
};
const _hoisted_5$1 = {
  key: 2,
  class: "self-start shrink-0 sm:pt-0.5"
};
const _hoisted_6 = {
  key: 0,
  class: "form-text"
};
const _hoisted_7 = { key: 0 };
const _hoisted_8 = {
  key: 1,
  class: "text-xs opacity-60 mt-1"
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "ConfigFieldShell",
  props: {
    id: { type: String, required: false, default: "" },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" }
  },
  setup(__props) {
    const slots = useSlots();
    const props = __props;
    const hasDescription = computed(() => Boolean(props.desc) || Boolean(slots["default"]));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          props.id ? (openBlock(), createElementBlock("label", {
            key: 0,
            for: props.id,
            class: "form-label"
          }, toDisplayString(props.label), 9, _hoisted_3$1)) : (openBlock(), createElementBlock(
            "div",
            _hoisted_4$1,
            toDisplayString(props.label),
            1
            /* TEXT */
          )),
          _ctx.$slots["actions"] ? (openBlock(), createElementBlock("div", _hoisted_5$1, [
            renderSlot(_ctx.$slots, "actions")
          ])) : createCommentVNode("v-if", true)
        ]),
        renderSlot(_ctx.$slots, "control"),
        hasDescription.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
          props.desc ? (openBlock(), createElementBlock(
            "span",
            _hoisted_7,
            toDisplayString(props.desc),
            1
            /* TEXT */
          )) : createCommentVNode("v-if", true),
          renderSlot(_ctx.$slots, "default")
        ])) : createCommentVNode("v-if", true),
        _ctx.$slots["meta"] ? (openBlock(), createElementBlock("div", _hoisted_8, [
          renderSlot(_ctx.$slots, "meta")
        ])) : createCommentVNode("v-if", true)
      ]);
    };
  }
});
const ConfigFieldShell = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigFieldShell.vue"]]);
const _hoisted_1 = { class: "grid grid-cols-3 gap-2" };
const _hoisted_2 = { class: "space-y-1" };
const _hoisted_3 = { class: "space-y-1" };
const _hoisted_4 = { class: "space-y-1" };
const _hoisted_5 = { class: "flex flex-wrap items-center gap-x-3 gap-y-1" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigDurationField",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" },
    size: { type: String, required: false, default: "medium" },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false }
  }, {
    "modelValue": { type: [Number, null], ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const props = __props;
    const hoursPart = ref(null);
    const minutesPart = ref(null);
    const secondsPart = ref(null);
    function sanitizePart(value, max) {
      if (value === null || value === void 0 || !Number.isFinite(value))
        return null;
      const normalized = Math.max(0, Math.floor(value));
      return max !== void 0 ? Math.min(max, normalized) : normalized;
    }
    function clampTotalSeconds(value) {
      const withMin = props.min !== void 0 ? Math.max(props.min, value) : value;
      return props.max !== void 0 ? Math.min(props.max, withMin) : withMin;
    }
    function syncFromModel(value) {
      if (value === null || value === void 0 || !Number.isFinite(value)) {
        hoursPart.value = null;
        minutesPart.value = null;
        secondsPart.value = null;
        return;
      }
      const totalSeconds = Math.max(0, Math.floor(value));
      hoursPart.value = Math.floor(totalSeconds / 3600);
      minutesPart.value = Math.floor(totalSeconds % 3600 / 60);
      secondsPart.value = totalSeconds % 60;
    }
    watch(
      () => model.value,
      (value) => syncFromModel(value),
      { immediate: true }
    );
    function updateDurationPart(part, value) {
      const normalized = sanitizePart(value, part === "hours" ? void 0 : 59);
      if (part === "hours")
        hoursPart.value = normalized;
      else if (part === "minutes")
        minutesPart.value = normalized;
      else
        secondsPart.value = normalized;
      if (hoursPart.value === null && minutesPart.value === null && secondsPart.value === null) {
        model.value = null;
        return;
      }
      const totalSeconds = (hoursPart.value ?? 0) * 3600 + (minutesPart.value ?? 0) * 60 + (secondsPart.value ?? 0);
      model.value = clampTotalSeconds(totalSeconds);
      syncFromModel(model.value);
    }
    const durationSummary = computed(() => {
      if (model.value === null || model.value === void 0 || !Number.isFinite(model.value)) {
        return "Stored as seconds.";
      }
      const totalSeconds = Math.max(0, Math.floor(model.value));
      const parts = [];
      if (hoursPart.value)
        parts.push(`${hoursPart.value}h`);
      if (minutesPart.value)
        parts.push(`${minutesPart.value}m`);
      if (secondsPart.value || parts.length === 0)
        parts.push(`${secondsPart.value ?? 0}s`);
      return `${parts.join(" ")} (${totalSeconds} seconds)`;
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ConfigFieldShell, mergeProps({
        id: `${props.id}-hours`,
        label: props.label,
        desc: props.desc
      }, unref(attrs)), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        control: withCtx(() => [
          createBaseVNode("div", _hoisted_1, [
            createBaseVNode("div", _hoisted_2, [
              _cache[3] || (_cache[3] = createBaseVNode(
                "div",
                { class: "text-xs font-medium uppercase tracking-wide opacity-60" },
                "Hours",
                -1
                /* CACHED */
              )),
              createVNode(unref(NInputNumber), {
                id: `${props.id}-hours`,
                value: hoursPart.value,
                size: props.size,
                min: 0,
                precision: 0,
                "show-button": false,
                placeholder: "0",
                class: "w-full",
                "onUpdate:value": _cache[0] || (_cache[0] = (value) => updateDurationPart("hours", value))
              }, null, 8, ["id", "value", "size"])
            ]),
            createBaseVNode("div", _hoisted_3, [
              _cache[4] || (_cache[4] = createBaseVNode(
                "div",
                { class: "text-xs font-medium uppercase tracking-wide opacity-60" },
                "Minutes",
                -1
                /* CACHED */
              )),
              createVNode(unref(NInputNumber), {
                id: `${props.id}-minutes`,
                value: minutesPart.value,
                size: props.size,
                min: 0,
                max: 59,
                precision: 0,
                "show-button": false,
                placeholder: "0",
                class: "w-full",
                "onUpdate:value": _cache[1] || (_cache[1] = (value) => updateDurationPart("minutes", value))
              }, null, 8, ["id", "value", "size"])
            ]),
            createBaseVNode("div", _hoisted_4, [
              _cache[5] || (_cache[5] = createBaseVNode(
                "div",
                { class: "text-xs font-medium uppercase tracking-wide opacity-60" },
                "Seconds",
                -1
                /* CACHED */
              )),
              createVNode(unref(NInputNumber), {
                id: `${props.id}-seconds`,
                value: secondsPart.value,
                size: props.size,
                min: 0,
                max: 59,
                precision: 0,
                "show-button": false,
                placeholder: "0",
                class: "w-full",
                "onUpdate:value": _cache[2] || (_cache[2] = (value) => updateDurationPart("seconds", value))
              }, null, 8, ["id", "value", "size"])
            ])
          ])
        ]),
        meta: withCtx(() => [
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode(
              "span",
              null,
              toDisplayString(durationSummary.value),
              1
              /* TEXT */
            ),
            renderSlot(_ctx.$slots, "meta")
          ])
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "label", "desc"]);
    };
  }
});
const ConfigDurationField = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigDurationField.vue"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigInputField",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" },
    placeholder: { type: String, required: false, default: "" },
    type: { type: String, required: false, default: "text" },
    size: { type: String, required: false, default: "medium" },
    clearable: { type: Boolean, required: false, default: false },
    monospace: { type: Boolean, required: false, default: false },
    autosize: { type: [Boolean, Object], required: false, default: false },
    inputmode: { type: String, required: false, default: "" }
  }, {
    "modelValue": { type: String, ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const props = __props;
    const inputClass = computed(() => props.monospace ? "font-mono" : "");
    const inputProps = computed(() => ({
      ...props.type === "textarea" && props.autosize ? { autosize: props.autosize } : {},
      ...props.inputmode ? { inputmode: props.inputmode } : {}
    }));
    const mergedInputProps = computed(() => ({
      ...inputProps.value,
      ...attrs
    }));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ConfigFieldShell, {
        id: props.id,
        label: props.label,
        desc: props.desc
      }, {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        control: withCtx(() => [
          createVNode(unref(__unplugin_components_0), mergeProps({
            id: props.id,
            value: model.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => model.value = $event),
            type: props.type,
            size: props.size,
            placeholder: props.placeholder,
            clearable: props.clearable,
            class: inputClass.value
          }, mergedInputProps.value), null, 16, ["id", "value", "type", "size", "placeholder", "clearable", "class"])
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["id", "label", "desc"]);
    };
  }
});
const ConfigInputField = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigInputField.vue"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigNumberField",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" },
    placeholder: { type: String, required: false, default: "" },
    size: { type: String, required: false, default: "medium" },
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    step: { type: Number, required: false },
    precision: { type: Number, required: false }
  }, {
    "modelValue": { type: [Number, null], ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const props = __props;
    const numberProps = computed(() => ({
      ...props.min !== void 0 ? { min: props.min } : {},
      ...props.max !== void 0 ? { max: props.max } : {},
      ...props.step !== void 0 ? { step: props.step } : {},
      ...props.precision !== void 0 ? { precision: props.precision } : {}
    }));
    const mergedNumberProps = computed(() => ({
      ...numberProps.value,
      ...attrs
    }));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ConfigFieldShell, {
        id: props.id,
        label: props.label,
        desc: props.desc
      }, {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        control: withCtx(() => [
          createVNode(unref(NInputNumber), mergeProps({
            id: props.id,
            value: model.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => model.value = $event),
            size: props.size,
            placeholder: props.placeholder
          }, mergedNumberProps.value), null, 16, ["id", "value", "size", "placeholder"])
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["id", "label", "desc"]);
    };
  }
});
const ConfigNumberField = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigNumberField.vue"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigSelectField",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" },
    options: { type: Array, required: true },
    placeholder: { type: String, required: false, default: "" },
    filterable: { type: Boolean, required: false, default: false },
    clearable: { type: Boolean, required: false, default: false },
    size: { type: String, required: false, default: "medium" }
  }, {
    "modelValue": { type: [String, Number, null], ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const props = __props;
    const searchOptions = computed(
      () => props.options.map((option) => `${option.label ?? ""}::${option.value ?? ""}`).join("|")
    );
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ConfigFieldShell, {
        id: props.id,
        label: props.label,
        desc: props.desc
      }, {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        control: withCtx(() => [
          createVNode(unref(NSelect), mergeProps({
            id: props.id,
            value: model.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => model.value = $event),
            size: props.size,
            options: props.options,
            placeholder: props.placeholder,
            filterable: props.filterable,
            clearable: props.clearable,
            "data-search-options": searchOptions.value
          }, unref(attrs)), null, 16, ["id", "value", "size", "options", "placeholder", "filterable", "clearable", "data-search-options"])
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["id", "label", "desc"]);
    };
  }
});
const ConfigSelectField = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigSelectField.vue"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigSwitchField",
  props: /* @__PURE__ */ mergeModels({
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: false, default: "" },
    size: { type: String, required: false, default: "medium" }
  }, {
    "modelValue": { type: Boolean, ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const props = __props;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ConfigFieldShell, {
        id: props.id,
        label: props.label,
        desc: props.desc
      }, {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        control: withCtx(() => [
          createVNode(unref(NSwitch), mergeProps({
            id: props.id,
            value: model.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => model.value = $event),
            size: props.size
          }, unref(attrs)), null, 16, ["id", "value", "size"])
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["id", "label", "desc"]);
    };
  }
});
const ConfigSwitchField = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigSwitchField.vue"]]);
function translateOr(t, key, fallback) {
  const value = t(key);
  if (!value || value === key)
    return fallback;
  return value;
}
function isSelectValue(value) {
  return typeof value === "string" || typeof value === "number" && Number.isFinite(value);
}
function ensureIncludesCurrentValue(options, currentValue) {
  if (!isSelectValue(currentValue))
    return options;
  if (options.some((option) => option.value === currentValue))
    return options;
  return options.concat([{ label: String(currentValue), value: currentValue }]);
}
function gpuFlags(metadata) {
  const gpus = Array.isArray(metadata == null ? void 0 : metadata.gpus) ? metadata.gpus : [];
  const hasVendor = (vendorId) => gpus.some((gpu) => Number((gpu == null ? void 0 : gpu.vendor_id) ?? (gpu == null ? void 0 : gpu.vendorId) ?? 0) === vendorId);
  const metaNvidia = metadata == null ? void 0 : metadata.has_nvidia_gpu;
  const metaIntel = metadata == null ? void 0 : metadata.has_intel_gpu;
  const metaAmd = metadata == null ? void 0 : metadata.has_amd_gpu;
  const hasNvidia = typeof metaNvidia === "boolean" ? metaNvidia : gpus.length ? hasVendor(4318) : true;
  const hasIntel = typeof metaIntel === "boolean" ? metaIntel : gpus.length ? hasVendor(32902) : true;
  const hasAmd = typeof metaAmd === "boolean" ? metaAmd : gpus.length ? gpus.some((gpu) => {
    const vendor = Number((gpu == null ? void 0 : gpu.vendor_id) ?? (gpu == null ? void 0 : gpu.vendorId) ?? 0);
    return vendor === 4098 || vendor === 4130;
  }) : true;
  return { hasNvidia, hasIntel, hasAmd };
}
const localeOptions = [
  { label: "Български (Bulgarian)", value: "bg" },
  { label: "Čeština (Czech)", value: "cs" },
  { label: "Deutsch (German)", value: "de" },
  { label: "English", value: "en" },
  { label: "English, UK", value: "en_GB" },
  { label: "English, US", value: "en_US" },
  { label: "Español (Spanish)", value: "es" },
  { label: "Français (French)", value: "fr" },
  { label: "Magyar (Hungarian)", value: "hu" },
  { label: "Italiano (Italian)", value: "it" },
  { label: "日本語 (Japanese)", value: "ja" },
  { label: "한국어 (Korean)", value: "ko" },
  { label: "Polski (Polish)", value: "pl" },
  { label: "Português (Portuguese)", value: "pt" },
  { label: "Português, Brasileiro (Portuguese, Brazilian)", value: "pt_BR" },
  { label: "Русский (Russian)", value: "ru" },
  { label: "svenska (Swedish)", value: "sv" },
  { label: "Türkçe (Turkish)", value: "tr" },
  { label: "Українська (Ukrainian)", value: "uk" },
  { label: "Tiếng Việt (Vietnamese)", value: "vi" },
  { label: "简体中文 (Chinese Simplified)", value: "zh" },
  { label: "繁體中文 (Chinese Traditional)", value: "zh_TW" }
];
function getConfigSelectOptions(key, ctx) {
  const platform = String(ctx.platform || "").toLowerCase();
  const { t } = ctx;
  switch (key) {
    case "locale":
      return ensureIncludesCurrentValue(localeOptions, ctx.currentValue);
    case "min_log_level": {
      const options = [0, 1, 2, 3, 4, 5, 6].map((value) => ({
        label: translateOr(t, `config.min_log_level_${value}`, String(value)),
        value
      }));
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "address_family": {
      const options = [
        { label: translateOr(t, "config.address_family_ipv4", "IPv4"), value: "ipv4" },
        { label: translateOr(t, "config.address_family_both", "Both"), value: "both" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "origin_web_ui_allowed": {
      const options = [
        { label: translateOr(t, "config.origin_web_ui_allowed_pc", "PC"), value: "pc" },
        { label: translateOr(t, "config.origin_web_ui_allowed_lan", "LAN"), value: "lan" },
        { label: translateOr(t, "config.origin_web_ui_allowed_wan", "WAN"), value: "wan" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "lan_encryption_mode": {
      const options = [
        { label: translateOr(t, "_common.disabled_def", "Disabled (default)"), value: 0 },
        {
          label: translateOr(t, "config.lan_encryption_mode_1", "Opportunistic"),
          value: 1
        },
        { label: translateOr(t, "config.lan_encryption_mode_2", "Forced"), value: 2 }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "wan_encryption_mode": {
      const options = [
        { label: translateOr(t, "_common.disabled", "Disabled"), value: 0 },
        {
          label: translateOr(t, "config.wan_encryption_mode_1", "Opportunistic"),
          value: 1
        },
        { label: translateOr(t, "config.wan_encryption_mode_2", "Forced"), value: 2 }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "video_max_batch_size_kb": {
      const options = [
        { label: "64 KiB (default)", value: 64 },
        { label: "32 KiB", value: 32 },
        { label: "16 KiB", value: 16 }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "hevc_mode": {
      const options = [0, 1, 2, 3].map((value) => ({
        label: translateOr(t, `config.hevc_mode_${value}`, String(value)),
        value
      }));
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "av1_mode": {
      const options = [0, 1, 2, 3].map((value) => ({
        label: translateOr(t, `config.av1_mode_${value}`, String(value)),
        value
      }));
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "gamepad": {
      const labelMap = {
        auto: "_common.auto",
        ds4: "config.gamepad_ds4",
        ds5: "config.gamepad_ds5",
        switch: "config.gamepad_switch",
        x360: "config.gamepad_x360",
        xone: "config.gamepad_xone"
      };
      const prioritizedByPlatform = {
        freebsd: ["switch", "xone"],
        linux: ["ds5", "xone", "switch", "x360"],
        windows: ["x360", "ds4"]
      };
      const fallbackOrder = ["x360", "ds5", "ds4"];
      const options = [
        { label: translateOr(t, "_common.auto", "Auto"), value: "auto" }
      ];
      const seen = new Set(options.map((option) => String(option.value)));
      const addOption = (value) => {
        if (!value || seen.has(value))
          return;
        const labelKey = labelMap[value] || `config.gamepad_${value}`;
        options.push({ label: translateOr(t, labelKey, value), value });
        seen.add(value);
      };
      const platformOrder = prioritizedByPlatform[platform] ?? fallbackOrder;
      platformOrder.forEach(addOption);
      if (typeof ctx.currentValue === "string" && ctx.currentValue !== "auto") {
        addOption(ctx.currentValue);
      }
      return options;
    }
    case "capture": {
      const options = [
        { label: translateOr(t, "_common.autodetect", "Autodetect"), value: "" }
      ];
      if (platform === "windows") {
        options.push(
          { label: "Windows Graphics Capture (variable)", value: "wgc" },
          { label: "Windows Graphics Capture (constant)", value: "wgcc" },
          { label: "Desktop Duplication API", value: "ddx" }
        );
      } else if (platform === "linux") {
        options.push(
          { label: "NvFBC", value: "nvfbc" },
          { label: "wlroots", value: "wlr" },
          { label: "KMS", value: "kms" },
          { label: "X11", value: "x11" }
        );
      }
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "encoder": {
      const options = [
        { label: translateOr(t, "_common.autodetect", "Autodetect"), value: "" }
      ];
      const { hasNvidia, hasIntel, hasAmd } = gpuFlags(ctx.metadata);
      if (platform === "windows") {
        if (hasNvidia)
          options.push({ label: "NVIDIA NVENC", value: "nvenc" });
        if (hasIntel)
          options.push({ label: "Intel QuickSync", value: "quicksync" });
        if (hasAmd)
          options.push({ label: "AMD AMF/VCE", value: "amdvce" });
      } else if (platform === "linux") {
        options.push(
          { label: "NVIDIA NVENC", value: "nvenc" },
          { label: "VA-API", value: "vaapi" }
        );
      } else if (platform === "macos") {
        options.push({ label: "VideoToolbox", value: "videotoolbox" });
      }
      options.push({
        label: translateOr(t, "config.encoder_software", "Software"),
        value: "software"
      });
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "nvenc_preset": {
      const fallbackExtra = {
        1: "(fastest, default)",
        4: "(balanced quality)",
        7: "(slowest)"
      };
      const presetExtra = (id) => {
        const labelKey = `config.nvenc_preset_${id}`;
        const translated = t(labelKey);
        return translated && translated !== labelKey ? translated : fallbackExtra[id];
      };
      const options = [
        { label: `P1 ${presetExtra(1)}`.trim(), value: 1 },
        { label: "P2", value: 2 },
        { label: "P3", value: 3 },
        { label: `P4 ${presetExtra(4)}`.trim(), value: 4 },
        { label: "P5", value: 5 },
        { label: "P6", value: 6 },
        { label: `P7 ${presetExtra(7)}`.trim(), value: 7 }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "nvenc_twopass": {
      const options = [
        {
          label: translateOr(t, "config.nvenc_twopass_disabled", "Disabled"),
          value: "disabled"
        },
        {
          label: translateOr(t, "config.nvenc_twopass_quarter_res", "Quarter res"),
          value: "quarter_res"
        },
        {
          label: translateOr(t, "config.nvenc_twopass_full_res", "Full res"),
          value: "full_res"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "nvenc_split_encode":
    case "nvenc_force_split_encode": {
      const options = [
        { label: translateOr(t, "_common.auto", "Auto"), value: "auto" },
        { label: translateOr(t, "_common.enabled", "Enabled"), value: "enabled" },
        { label: translateOr(t, "_common.disabled", "Disabled"), value: "disabled" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "qsv_preset": {
      const options = [
        { label: translateOr(t, "config.qsv_preset_veryfast", "veryfast"), value: "veryfast" },
        { label: translateOr(t, "config.qsv_preset_faster", "faster"), value: "faster" },
        { label: translateOr(t, "config.qsv_preset_fast", "fast"), value: "fast" },
        { label: translateOr(t, "config.qsv_preset_medium", "medium"), value: "medium" },
        { label: translateOr(t, "config.qsv_preset_slow", "slow"), value: "slow" },
        { label: translateOr(t, "config.qsv_preset_slower", "slower"), value: "slower" },
        { label: translateOr(t, "config.qsv_preset_slowest", "slowest"), value: "slowest" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "qsv_coder":
    case "amd_coder":
    case "vt_coder": {
      const options = [
        { label: translateOr(t, "config.ffmpeg_auto", "Auto"), value: "auto" },
        { label: translateOr(t, "config.coder_cabac", "CABAC"), value: "cabac" },
        { label: translateOr(t, "config.coder_cavlc", "CAVLC"), value: "cavlc" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "amd_usage": {
      const options = [
        {
          label: translateOr(t, "config.amd_usage_transcoding", "Transcoding"),
          value: "transcoding"
        },
        { label: translateOr(t, "config.amd_usage_webcam", "Webcam"), value: "webcam" },
        {
          label: translateOr(
            t,
            "config.amd_usage_lowlatency_high_quality",
            "Low latency (high quality)"
          ),
          value: "lowlatency_high_quality"
        },
        {
          label: translateOr(t, "config.amd_usage_lowlatency", "Low latency"),
          value: "lowlatency"
        },
        {
          label: translateOr(t, "config.amd_usage_ultralowlatency", "Ultra low latency"),
          value: "ultralowlatency"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "amd_rc": {
      const options = [
        { label: translateOr(t, "config.amd_rc_cbr", "CBR"), value: "cbr" },
        { label: translateOr(t, "config.amd_rc_cqp", "CQP"), value: "cqp" },
        {
          label: translateOr(t, "config.amd_rc_vbr_latency", "VBR (latency)"),
          value: "vbr_latency"
        },
        { label: translateOr(t, "config.amd_rc_vbr_peak", "VBR (peak)"), value: "vbr_peak" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "amd_quality": {
      const options = [
        { label: translateOr(t, "config.amd_quality_speed", "Speed"), value: "speed" },
        { label: translateOr(t, "config.amd_quality_balanced", "Balanced"), value: "balanced" },
        { label: translateOr(t, "config.amd_quality_quality", "Quality"), value: "quality" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "vt_software": {
      const options = [
        { label: translateOr(t, "_common.auto", "Auto"), value: "auto" },
        { label: translateOr(t, "_common.disabled", "Disabled"), value: "disabled" },
        { label: translateOr(t, "config.vt_software_allowed", "Allowed"), value: "allowed" },
        { label: translateOr(t, "config.vt_software_forced", "Forced"), value: "forced" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "sw_preset": {
      const options = [
        { label: translateOr(t, "config.sw_preset_ultrafast", "ultrafast"), value: "ultrafast" },
        { label: translateOr(t, "config.sw_preset_superfast", "superfast"), value: "superfast" },
        { label: translateOr(t, "config.sw_preset_veryfast", "veryfast"), value: "veryfast" },
        { label: translateOr(t, "config.sw_preset_faster", "faster"), value: "faster" },
        { label: translateOr(t, "config.sw_preset_fast", "fast"), value: "fast" },
        { label: translateOr(t, "config.sw_preset_medium", "medium"), value: "medium" },
        { label: translateOr(t, "config.sw_preset_slow", "slow"), value: "slow" },
        { label: translateOr(t, "config.sw_preset_slower", "slower"), value: "slower" },
        { label: translateOr(t, "config.sw_preset_veryslow", "veryslow"), value: "veryslow" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "sw_tune": {
      const options = [
        { label: translateOr(t, "config.sw_tune_film", "film"), value: "film" },
        { label: translateOr(t, "config.sw_tune_animation", "animation"), value: "animation" },
        { label: translateOr(t, "config.sw_tune_grain", "grain"), value: "grain" },
        { label: translateOr(t, "config.sw_tune_stillimage", "stillimage"), value: "stillimage" },
        { label: translateOr(t, "config.sw_tune_fastdecode", "fastdecode"), value: "fastdecode" },
        {
          label: translateOr(t, "config.sw_tune_zerolatency", "zerolatency"),
          value: "zerolatency"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "frame_limiter_provider": {
      const options = [
        { label: translateOr(t, "frameLimiter.provider.auto", "Auto"), value: "auto" },
        { label: translateOr(t, "frameLimiter.provider.rtss", "RTSS"), value: "rtss" },
        {
          label: translateOr(t, "frameLimiter.provider.nvcp", "NVIDIA Control Panel"),
          value: "nvidia-control-panel"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "rtss_frame_limit_type": {
      const options = [
        { label: translateOr(t, "frameLimiter.syncLimiter.keep", "Keep"), value: "" },
        { label: translateOr(t, "frameLimiter.syncLimiter.async", "Async"), value: "async" },
        {
          label: translateOr(t, "frameLimiter.syncLimiter.front", "Front edge sync"),
          value: "front edge sync"
        },
        {
          label: translateOr(t, "frameLimiter.syncLimiter.back", "Back edge sync"),
          value: "back edge sync"
        },
        {
          label: translateOr(t, "frameLimiter.syncLimiter.reflex", "NVIDIA Reflex"),
          value: "nvidia reflex"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "dd_configuration_option": {
      const options = [
        { label: translateOr(t, "_common.disabled", "Disabled"), value: "disabled" },
        {
          label: translateOr(t, "config.dd_config_verify_only", "Verify only"),
          value: "verify_only"
        },
        {
          label: translateOr(t, "config.dd_config_ensure_active", "Ensure active"),
          value: "ensure_active"
        },
        {
          label: translateOr(t, "config.dd_config_ensure_primary", "Ensure primary"),
          value: "ensure_primary"
        },
        {
          label: translateOr(t, "config.dd_config_ensure_only_display", "Ensure only display"),
          value: "ensure_only_display"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "dd_resolution_option": {
      const options = [
        {
          label: translateOr(t, "config.dd_resolution_option_disabled", "Disabled"),
          value: "disabled"
        },
        { label: translateOr(t, "config.dd_resolution_option_auto", "Auto"), value: "auto" },
        { label: translateOr(t, "config.dd_resolution_option_manual", "Manual"), value: "manual" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "dd_refresh_rate_option": {
      const options = [
        {
          label: translateOr(t, "config.dd_refresh_rate_option_disabled", "Disabled"),
          value: "disabled"
        },
        { label: translateOr(t, "config.dd_refresh_rate_option_auto", "Auto"), value: "auto" },
        {
          label: translateOr(t, "config.dd_refresh_rate_option_manual", "Manual"),
          value: "manual"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "dd_hdr_option": {
      const options = [
        { label: translateOr(t, "config.dd_hdr_option_disabled", "Disabled"), value: "disabled" },
        { label: translateOr(t, "config.dd_hdr_option_auto", "Auto"), value: "auto" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "virtual_display_mode": {
      const options = [
        {
          label: translateOr(t, "config.virtual_display_mode_disabled", "Disabled"),
          value: "disabled"
        },
        {
          label: translateOr(t, "config.virtual_display_mode_per_client", "Per client"),
          value: "per_client"
        },
        { label: translateOr(t, "config.virtual_display_mode_shared", "Shared"), value: "shared" }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    case "virtual_display_layout": {
      const options = [
        {
          label: translateOr(t, "config.virtual_display_layout_exclusive", "Exclusive"),
          value: "exclusive"
        },
        {
          label: translateOr(t, "config.virtual_display_layout_extended", "Extended"),
          value: "extended"
        },
        {
          label: translateOr(
            t,
            "config.virtual_display_layout_extended_primary",
            "Extended (primary)"
          ),
          value: "extended_primary"
        },
        {
          label: translateOr(
            t,
            "config.virtual_display_layout_extended_isolated",
            "Extended (isolated)"
          ),
          value: "extended_isolated"
        },
        {
          label: translateOr(
            t,
            "config.virtual_display_layout_extended_primary_isolated",
            "Extended (primary isolated)"
          ),
          value: "extended_primary_isolated"
        }
      ];
      return ensureIncludesCurrentValue(options, ctx.currentValue);
    }
    default:
      return [];
  }
}
function buildConfigOptionsText(options) {
  if (options.length === 0)
    return "";
  return options.map((option) => `${option.label || ""} ${String(option.value ?? "")}`.trim()).filter(Boolean).join(" | ");
}
const SWITCH_KEYS = /* @__PURE__ */ new Set(["frame_limiter_enable", "frame_limiter_disable_vsync"]);
const NUMBER_FIELD_OVERRIDES = {
  fec_percentage: { placeholder: "20" },
  qp: { placeholder: "28" },
  min_threads: { placeholder: "2", min: 1 },
  back_button_timeout: { placeholder: "-1" },
  key_repeat_delay: { placeholder: "500" },
  key_repeat_frequency: { placeholder: "24.9", step: 0.1 },
  session_token_ttl_seconds: { min: 60, step: 60, placeholder: "86400" },
  remember_me_refresh_token_ttl_seconds: { min: 3600, step: 3600, placeholder: "604800" },
  update_check_interval: { min: 0, step: 60, placeholder: "86400" },
  port: { min: 1029, max: 65514, placeholder: "47989" },
  ping_timeout: { min: 0, step: 100, placeholder: "10000" },
  max_bitrate: { min: 0, placeholder: "0" },
  minimum_fps_target: { min: 0, max: 1e3, placeholder: "0" },
  nvenc_vbv_increase: { min: 0, max: 400, placeholder: "0" },
  frame_limiter_fps_limit: { min: 0, max: 1e3, step: 1, precision: 0, placeholder: "0" }
};
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function inferDurationUnit(key) {
  if (key === "update_check_interval")
    return "seconds";
  if (key.endsWith("_seconds") || key.endsWith("_secs"))
    return "seconds";
  return void 0;
}
function kindSampleValue(ctx) {
  if (ctx.defaultValue !== void 0)
    return ctx.defaultValue;
  return ctx.currentValue;
}
function isBooleanLike(value) {
  if (value === true || value === false)
    return true;
  if (value === 1 || value === 0)
    return true;
  if (typeof value !== "string")
    return false;
  const normalized = value.toLowerCase().trim();
  return [
    "true",
    "false",
    "1",
    "0",
    "enabled",
    "disabled",
    "enable",
    "disable",
    "yes",
    "no",
    "on",
    "off"
  ].includes(normalized);
}
function prettifyConfigKey(key) {
  return key.split("_").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function getConfigFieldDefinition(key, ctx) {
  if (ctx.kind) {
    const overrideOptions = ctx.options ?? (ctx.kind === "select" ? getConfigSelectOptions(key, {
      t: ctx.t,
      platform: ctx.platform,
      metadata: ctx.metadata,
      currentValue: ctx.currentValue
    }) : void 0);
    return {
      kind: ctx.kind,
      ...ctx.kind === "select" && overrideOptions ? { options: overrideOptions, filterable: true } : ctx.kind === "select" ? { filterable: true } : {},
      ...ctx.kind === "number" ? {
        ...NUMBER_FIELD_OVERRIDES[key] ?? {},
        ...inferDurationUnit(key) ? { durationUnit: inferDurationUnit(key) } : {}
      } : {},
      localePrefix: "config"
    };
  }
  const selectOptions = ctx.options ?? getConfigSelectOptions(key, {
    t: ctx.t,
    platform: ctx.platform,
    metadata: ctx.metadata,
    currentValue: ctx.currentValue
  });
  if (selectOptions.length > 0) {
    return {
      kind: "select",
      options: selectOptions,
      filterable: selectOptions.length >= 8
    };
  }
  if (SWITCH_KEYS.has(key)) {
    return {
      kind: "switch"
    };
  }
  const sampleValue = kindSampleValue(ctx);
  if (Object.prototype.hasOwnProperty.call(NUMBER_FIELD_OVERRIDES, key) || isFiniteNumber(sampleValue)) {
    return {
      kind: "number",
      ...NUMBER_FIELD_OVERRIDES[key] ?? {},
      ...inferDurationUnit(key) ? { durationUnit: inferDurationUnit(key) } : {}
    };
  }
  if (isBooleanLike(sampleValue)) {
    return {
      kind: "checkbox",
      localePrefix: "config"
    };
  }
  return {
    kind: "input"
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "ConfigFieldRenderer",
  props: /* @__PURE__ */ mergeModels({
    settingKey: { type: String, required: true },
    label: { type: String, required: false },
    desc: { type: String, required: false },
    kind: { type: String, required: false },
    size: { type: String, required: false },
    placeholder: { type: String, required: false },
    options: { type: Array, required: false },
    filterable: { type: Boolean, required: false },
    clearable: { type: Boolean, required: false },
    monospace: { type: Boolean, required: false },
    autosize: { type: [Boolean, Object], required: false },
    inputmode: { type: String, required: false },
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    step: { type: Number, required: false },
    precision: { type: Number, required: false },
    defaultValue: { type: null, required: false },
    inverseValues: { type: Boolean, required: false },
    localePrefix: { type: String, required: false }
  }, {
    "modelValue": { type: null, ...{ required: true } },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const attrs = useAttrs();
    const store = useConfigStore();
    const { t } = useI18n();
    const props = __props;
    function translateLabel(key) {
      const translationKey = `config.${key}`;
      const value = t(translationKey);
      if (!value || value === translationKey)
        return prettifyConfigKey(key);
      return value;
    }
    function translateDesc(key) {
      const translationKey = `config.${key}_desc`;
      const value = t(translationKey);
      if (!value || value === translationKey)
        return "";
      return value;
    }
    const platform = computed(
      () => {
        var _a, _b;
        return String(((_a = store.metadata) == null ? void 0 : _a.platform) || ((_b = store.config) == null ? void 0 : _b.platform) || "").toLowerCase();
      }
    );
    const resolvedDefaultValue = computed(() => {
      var _a;
      if (props.defaultValue !== void 0)
        return props.defaultValue;
      return (_a = store.defaults) == null ? void 0 : _a[props.settingKey];
    });
    const field = computed(() => {
      const context = {
        t,
        platform: platform.value,
        metadata: store.metadata,
        currentValue: model.value
      };
      if (resolvedDefaultValue.value !== void 0) {
        context.defaultValue = resolvedDefaultValue.value;
      }
      if (props.kind !== void 0) {
        context.kind = props.kind;
      }
      if (props.options !== void 0) {
        context.options = props.options;
      }
      return getConfigFieldDefinition(props.settingKey, context);
    });
    const resolvedLabel = computed(
      () => props.label !== void 0 ? props.label : translateLabel(props.settingKey)
    );
    const resolvedDesc = computed(
      () => props.desc !== void 0 ? props.desc : translateDesc(props.settingKey)
    );
    const resolvedSize = computed(() => props.size ?? "medium");
    const resolvedPlaceholder = computed(() => props.placeholder ?? field.value.placeholder ?? "");
    const resolvedFilterable = computed(() => props.filterable ?? field.value.filterable ?? false);
    const resolvedClearable = computed(() => props.clearable ?? field.value.clearable ?? false);
    const resolvedMonospace = computed(() => props.monospace ?? field.value.monospace ?? false);
    const resolvedAutosize = computed(() => props.autosize ?? field.value.autosize ?? false);
    const resolvedInputMode = computed(() => props.inputmode ?? field.value.inputmode ?? "");
    const resolvedMin = computed(() => props.min ?? field.value.min);
    const resolvedMax = computed(() => props.max ?? field.value.max);
    const resolvedStep = computed(() => props.step ?? field.value.step);
    const resolvedPrecision = computed(() => props.precision ?? field.value.precision);
    const resolvedLocalePrefix = computed(
      () => props.localePrefix ?? field.value.localePrefix ?? "config"
    );
    const resolvedInverseValues = computed(
      () => props.inverseValues ?? field.value.inverseValues ?? false
    );
    const resolvedOptions = computed(() => props.options ?? field.value.options ?? []);
    const resolvedNumberProps = computed(() => ({
      ...resolvedMin.value !== void 0 ? { min: resolvedMin.value } : {},
      ...resolvedMax.value !== void 0 ? { max: resolvedMax.value } : {},
      ...resolvedStep.value !== void 0 ? { step: resolvedStep.value } : {},
      ...resolvedPrecision.value !== void 0 ? { precision: resolvedPrecision.value } : {}
    }));
    const resolvedDurationProps = computed(() => ({
      ...resolvedMin.value !== void 0 ? { min: resolvedMin.value } : {},
      ...resolvedMax.value !== void 0 ? { max: resolvedMax.value } : {}
    }));
    const mergedDurationAttrs = computed(() => ({
      ...resolvedDurationProps.value,
      ...attrs
    }));
    const mergedNumberAttrs = computed(() => ({
      ...resolvedNumberProps.value,
      ...attrs
    }));
    const stringModel = computed({
      get() {
        if (typeof model.value === "string")
          return model.value;
        if (model.value === null || model.value === void 0)
          return "";
        return String(model.value);
      },
      set(value) {
        model.value = value;
      }
    });
    const numberModel = computed({
      get() {
        if (typeof model.value === "number" && Number.isFinite(model.value))
          return model.value;
        if (typeof model.value === "string") {
          const parsed = Number(model.value);
          if (Number.isFinite(parsed))
            return parsed;
        }
        return null;
      },
      set(value) {
        model.value = value;
      }
    });
    const selectModel = computed({
      get() {
        if (typeof model.value === "string" || typeof model.value === "number" && Number.isFinite(model.value)) {
          return model.value;
        }
        return null;
      },
      set(value) {
        model.value = value;
      }
    });
    const switchModel = computed({
      get() {
        return Boolean(model.value);
      },
      set(value) {
        model.value = value;
      }
    });
    return (_ctx, _cache) => {
      return field.value.kind === "checkbox" ? (openBlock(), createBlock(Checkbox, mergeProps({
        key: 0,
        id: props.settingKey,
        modelValue: model.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => model.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        default: resolvedDefaultValue.value,
        "locale-prefix": resolvedLocalePrefix.value,
        "inverse-values": resolvedInverseValues.value
      }, unref(attrs)), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "default", "locale-prefix", "inverse-values"])) : field.value.kind === "switch" ? (openBlock(), createBlock(ConfigSwitchField, mergeProps({
        key: 1,
        id: props.settingKey,
        modelValue: switchModel.value,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => switchModel.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        size: resolvedSize.value
      }, unref(attrs)), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "size"])) : field.value.kind === "select" ? (openBlock(), createBlock(ConfigSelectField, mergeProps({
        key: 2,
        id: props.settingKey,
        modelValue: selectModel.value,
        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => selectModel.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        size: resolvedSize.value,
        options: resolvedOptions.value,
        placeholder: resolvedPlaceholder.value,
        filterable: resolvedFilterable.value,
        clearable: resolvedClearable.value
      }, unref(attrs)), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "size", "options", "placeholder", "filterable", "clearable"])) : field.value.kind === "number" && field.value.durationUnit === "seconds" ? (openBlock(), createBlock(ConfigDurationField, mergeProps({
        key: 3,
        id: props.settingKey,
        modelValue: numberModel.value,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => numberModel.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        size: resolvedSize.value
      }, mergedDurationAttrs.value), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "size"])) : field.value.kind === "number" ? (openBlock(), createBlock(ConfigNumberField, mergeProps({
        key: 4,
        id: props.settingKey,
        modelValue: numberModel.value,
        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => numberModel.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        size: resolvedSize.value,
        placeholder: resolvedPlaceholder.value
      }, mergedNumberAttrs.value), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "size", "placeholder"])) : (openBlock(), createBlock(ConfigInputField, mergeProps({
        key: 5,
        id: props.settingKey,
        modelValue: stringModel.value,
        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => stringModel.value = $event),
        label: resolvedLabel.value,
        desc: resolvedDesc.value,
        size: resolvedSize.value,
        type: field.value.kind === "textarea" ? "textarea" : "text",
        placeholder: resolvedPlaceholder.value,
        clearable: resolvedClearable.value,
        monospace: resolvedMonospace.value,
        autosize: resolvedAutosize.value,
        inputmode: resolvedInputMode.value
      }, unref(attrs)), {
        actions: withCtx(() => [
          renderSlot(_ctx.$slots, "actions")
        ]),
        meta: withCtx(() => [
          renderSlot(_ctx.$slots, "meta")
        ]),
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      }, 16, ["id", "modelValue", "label", "desc", "size", "type", "placeholder", "clearable", "monospace", "autosize", "inputmode"]));
    };
  }
});
const ConfigFieldRenderer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/ConfigFieldRenderer.vue"]]);
export {
  ConfigFieldRenderer as C,
  Checkbox as a,
  ConfigInputField as b,
  ConfigDurationField as c,
  ConfigSwitchField as d,
  ConfigSelectField as e,
  buildConfigOptionsText as f,
  getConfigSelectOptions as g
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnRmllbGRSZW5kZXJlci1mMjQwOTMzNi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vQ2hlY2tib3gudnVlIiwiLi4vLi4vQ29uZmlnRmllbGRTaGVsbC52dWUiLCIuLi8uLi9Db25maWdEdXJhdGlvbkZpZWxkLnZ1ZSIsIi4uLy4uL0NvbmZpZ0lucHV0RmllbGQudnVlIiwiLi4vLi4vQ29uZmlnTnVtYmVyRmllbGQudnVlIiwiLi4vLi4vQ29uZmlnU2VsZWN0RmllbGQudnVlIiwiLi4vLi4vQ29uZmlnU3dpdGNoRmllbGQudnVlIiwiLi4vLi4vY29uZmlncy9jb25maWdTZWxlY3RPcHRpb25zLnRzIiwiLi4vLi4vY29uZmlncy9jb25maWdGaWVsZFNjaGVtYS50cyIsIi4uLy4uL0NvbmZpZ0ZpZWxkUmVuZGVyZXIudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTkNoZWNrYm94IH0gZnJvbSAnbmFpdmUtdWknO1xyXG5cclxuY29uc3QgbW9kZWwgPSBkZWZpbmVNb2RlbCh7IHJlcXVpcmVkOiB0cnVlIH0pO1xyXG5jb25zdCBzbG90cyA9IGRlZmluZVNsb3RzPHtcbiAgZGVmYXVsdD86ICgpID0+IHVua25vd247XG4gIG1ldGE/OiAoKSA9PiB1bmtub3duO1xuICBhY3Rpb25zPzogKCkgPT4gdW5rbm93bjtcbn0+KCk7XG5pbnRlcmZhY2UgUHJvcHMge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgbGFiZWw/OiBzdHJpbmcgfCBudWxsO1xyXG4gIGRlc2M/OiBzdHJpbmcgfCBudWxsO1xyXG4gIGxvY2FsZVByZWZpeD86IHN0cmluZztcclxuICBpbnZlcnNlVmFsdWVzPzogYm9vbGVhbjtcclxuICBkaXNhYmxlZD86IGJvb2xlYW47XHJcbiAgLy8gRGVmYXVsdCBiYWNraW5nIHZhbHVlIHVzZWQgdG8gaW5mZXIgbWFwcGluZyB3aGVuIG1vZGVsIGlzIG51bGwvdW5kZWZpbmVkXHJcbiAgZGVmYXVsdD86IGFueTtcclxufVxyXG5jb25zdCBwcm9wcyA9IHdpdGhEZWZhdWx0cyhkZWZpbmVQcm9wczxQcm9wcz4oKSwge1xyXG4gIGxhYmVsOiBudWxsLFxyXG4gIGRlc2M6IG51bGwsXHJcbiAgbG9jYWxlUHJlZml4OiAnbWlzc2luZy1wcmVmaXgnLFxyXG4gIGludmVyc2VWYWx1ZXM6IGZhbHNlLFxyXG4gIGRpc2FibGVkOiBmYWxzZSxcclxuICBkZWZhdWx0OiBudWxsLFxyXG59KTtcclxuXHJcbi8vIEFsd2F5cyBpbmNsdWRlIHRoZSBtYW5kYXRvcnkgY2xhc3Mgb24gdGhlIHdyYXBwZXI7IHVzZXItc3VwcGxpZWQgY2xhc3Mgb24gdGhlXHJcbi8vIGNvbXBvbmVudCBpdHNlbGYgd2lsbCBiZSBtZXJnZWQgYnkgVnVlIG9udG8gdGhlIHJvb3QgZWxlbWVudCBhdXRvbWF0aWNhbGx5LlxyXG5cclxuLy8gTWFwIGFuIGFyYml0cmFyeSB2YWx1ZSBpbnRvIGEgYm9vbGVhbi1wYWlyIHJlcHJlc2VudGF0aW9uIGlmIHJlY29nbml6YWJsZS5cclxuLy8gUmV0dXJucyBudWxsIHdoZW4gdGhlIHByb3ZpZGVkIHZhbHVlIGNhbm5vdCBiZSBpbnRlcnByZXRlZC5cclxuZnVuY3Rpb24gbWFwVG9Cb29sUmVwcmVzZW50YXRpb24odmFsdWU6IGFueSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UpIHJldHVybiB7IHBvc3NpYmxlVmFsdWVzOiBbdHJ1ZSwgZmFsc2VdLCB2YWx1ZSB9O1xyXG4gIGlmICh2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gMCkgcmV0dXJuIHsgcG9zc2libGVWYWx1ZXM6IFsxLCAwXSwgdmFsdWUgfTtcclxuXHJcbiAgY29uc3Qgc3RyaW5nUGFpcnMgPSBbXHJcbiAgICBbJ3RydWUnLCAnZmFsc2UnXSxcclxuICAgIFsnMScsICcwJ10sXHJcbiAgICBbJ2VuYWJsZWQnLCAnZGlzYWJsZWQnXSxcclxuICAgIFsnZW5hYmxlJywgJ2Rpc2FibGUnXSxcclxuICAgIFsneWVzJywgJ25vJ10sXHJcbiAgICBbJ29uJywgJ29mZiddLFxyXG4gIF0gYXMgY29uc3Q7XHJcblxyXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCBub3JtID0gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcclxuICBmb3IgKGNvbnN0IHBhaXIgb2Ygc3RyaW5nUGFpcnMpIHtcclxuICAgIGlmIChub3JtID09PSBwYWlyWzBdIHx8IG5vcm0gPT09IHBhaXJbMV0pIHJldHVybiB7IHBvc3NpYmxlVmFsdWVzOiBwYWlyIGFzIGFueSwgdmFsdWU6IG5vcm0gfTtcclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8vIERldGVybWluZSB0aGUgYmFja2luZyB0cnV0aHkvZmFsc3kgdmFsdWVzIHRoaXMgY2hlY2tib3ggc2hvdWxkIHdyaXRlIHRvIHRoZSBtb2RlbFxyXG5jb25zdCBjaGVja2JveFZhbHVlcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICAvLyBQcmVmZXIgZXhwbGljaXQgbW9kZWwgbWFwcGluZ1xyXG4gIGNvbnN0IGZyb21Nb2RlbCA9IG1hcFRvQm9vbFJlcHJlc2VudGF0aW9uKG1vZGVsLnZhbHVlKTtcclxuICBpZiAoZnJvbU1vZGVsKSB7XHJcbiAgICBjb25zdCB0cnV0aHlJbmRleCA9IHByb3BzLmludmVyc2VWYWx1ZXMgPyAxIDogMDtcclxuICAgIGNvbnN0IGZhbHN5SW5kZXggPSBwcm9wcy5pbnZlcnNlVmFsdWVzID8gMCA6IDE7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0cnV0aHk6IGZyb21Nb2RlbC5wb3NzaWJsZVZhbHVlc1t0cnV0aHlJbmRleF0sXHJcbiAgICAgIGZhbHN5OiBmcm9tTW9kZWwucG9zc2libGVWYWx1ZXNbZmFsc3lJbmRleF0sXHJcbiAgICB9O1xyXG4gIH1cclxuICAvLyBGYWxsIGJhY2sgdG8gcHJvdmlkZWQgZGVmYXVsdCBtYXBwaW5nXHJcbiAgY29uc3QgZnJvbURlZmF1bHQgPSBtYXBUb0Jvb2xSZXByZXNlbnRhdGlvbihwcm9wcy5kZWZhdWx0KTtcclxuICBpZiAoZnJvbURlZmF1bHQpIHtcclxuICAgIGNvbnN0IHRydXRoeUluZGV4ID0gcHJvcHMuaW52ZXJzZVZhbHVlcyA/IDEgOiAwO1xyXG4gICAgY29uc3QgZmFsc3lJbmRleCA9IHByb3BzLmludmVyc2VWYWx1ZXMgPyAwIDogMTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRydXRoeTogZnJvbURlZmF1bHQucG9zc2libGVWYWx1ZXNbdHJ1dGh5SW5kZXhdLFxyXG4gICAgICBmYWxzeTogZnJvbURlZmF1bHQucG9zc2libGVWYWx1ZXNbZmFsc3lJbmRleF0sXHJcbiAgICB9O1xyXG4gIH1cclxuICAvLyBGaW5hbCBmYWxsYmFjayBpcyBib29sZWFuIG1hcHBpbmdcclxuICByZXR1cm4geyB0cnV0aHk6ICFwcm9wcy5pbnZlcnNlVmFsdWVzLCBmYWxzeTogISFwcm9wcy5pbnZlcnNlVmFsdWVzIH07XHJcbn0pO1xyXG5cclxuLy8gRXhwb3NlIGEgcmVhbCBib29sZWFuIGZvciB0aGUgVUksIHdoaWxlIG1hcHBpbmcgdG8gdGhlIGNvbmZpZ3VyZWQgYmFja2VuZCB2YWx1ZXNcclxuY29uc3QgaXNDaGVja2VkID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldCgpIHtcclxuICAgIGNvbnN0IHsgdHJ1dGh5LCBmYWxzeSB9ID0gY2hlY2tib3hWYWx1ZXMudmFsdWU7XHJcbiAgICBjb25zdCBjdXIgPSBtb2RlbC52YWx1ZTtcclxuICAgIC8vIFRyZWF0IHVuZGVmaW5lZC9udWxsIGFzIGRlZmF1bHQgaWYgcHJvdmlkZWRcclxuICAgIGNvbnN0IG1hcHBlZCA9IG1hcFRvQm9vbFJlcHJlc2VudGF0aW9uKGN1cik7XHJcbiAgICBpZiAobWFwcGVkKVxyXG4gICAgICByZXR1cm4gbWFwcGVkLnZhbHVlID09PSBtYXBwZWQucG9zc2libGVWYWx1ZXNbMF1cclxuICAgICAgICA/ICFwcm9wcy5pbnZlcnNlVmFsdWVzXHJcbiAgICAgICAgOiAhIXByb3BzLmludmVyc2VWYWx1ZXM7XHJcblxyXG4gICAgLy8gSWYgbW9kZWwgaXMgbm90IHJlY29nbml6YWJsZSwgdHJ5IGRlZmF1bHQgdG8gZGVjaWRlIHZpc3VhbCBzdGF0ZVxyXG4gICAgY29uc3QgZGVmID0gbWFwVG9Cb29sUmVwcmVzZW50YXRpb24ocHJvcHMuZGVmYXVsdCk7XHJcbiAgICBpZiAoZGVmKVxyXG4gICAgICByZXR1cm4gZGVmLnZhbHVlID09PSBkZWYucG9zc2libGVWYWx1ZXNbMF0gPyAhcHJvcHMuaW52ZXJzZVZhbHVlcyA6ICEhcHJvcHMuaW52ZXJzZVZhbHVlcztcclxuXHJcbiAgICAvLyBGYWxsYmFjazogb25seSB0cnVlIGlmIGVxdWFscyBvdXIgdHJ1dGh5IGxpdGVyYWxcclxuICAgIHJldHVybiBjdXIgPT09IHRydXRoeTtcclxuICB9LFxyXG4gIHNldChjaGVja2VkOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCB7IHRydXRoeSwgZmFsc3kgfSA9IGNoZWNrYm94VmFsdWVzLnZhbHVlO1xyXG4gICAgbW9kZWwudmFsdWUgPSBjaGVja2VkID8gdHJ1dGh5IDogZmFsc3k7XHJcbiAgfSxcclxufSk7XHJcblxyXG4vLyBGb3IgaGVscGVyIHRleHQgc2hvd2luZyB3aGF0IHRoZSBkZWZhdWx0IHJlc29sdmVzIHRvIChlbmFibGVkL2Rpc2FibGVkKVxyXG5jb25zdCBwYXJzZWREZWZhdWx0UHJvcFZhbHVlID0gKCgpID0+IHtcclxuICBjb25zdCBib29sVmFsdWVzID0gbWFwVG9Cb29sUmVwcmVzZW50YXRpb24ocHJvcHMuZGVmYXVsdCk7XHJcbiAgaWYgKGJvb2xWYWx1ZXMpIHJldHVybiBib29sVmFsdWVzLnZhbHVlID09PSBib29sVmFsdWVzLnBvc3NpYmxlVmFsdWVzWzBdO1xyXG4gIHJldHVybiBudWxsIGFzIGJvb2xlYW4gfCBudWxsO1xyXG59KSgpO1xyXG5cclxuY29uc3QgbGFiZWxGaWVsZCA9IHByb3BzLmxhYmVsID8/IGAke3Byb3BzLmxvY2FsZVByZWZpeH0uJHtwcm9wcy5pZH1gO1xyXG5jb25zdCBkZXNjRmllbGQgPSBwcm9wcy5kZXNjID8/IGAke3Byb3BzLmxvY2FsZVByZWZpeH0uJHtwcm9wcy5pZH1fZGVzY2A7XHJcbmNvbnN0IHNob3dEZXNjID0gY29tcHV0ZWQoKCkgPT4gcHJvcHMuZGVzYyAhPT0gJycgfHwgQm9vbGVhbihzbG90c1snZGVmYXVsdCddKSk7XHJcbmNvbnN0IHNob3dBY3Rpb25zID0gY29tcHV0ZWQoKCkgPT4gQm9vbGVhbihzbG90c1snYWN0aW9ucyddKSk7XHJcbmNvbnN0IHNob3dNZXRhID0gY29tcHV0ZWQoKCkgPT4gQm9vbGVhbihzbG90c1snbWV0YSddKSk7XHJcbmNvbnN0IHNob3dEZWZWYWx1ZSA9IHBhcnNlZERlZmF1bHRQcm9wVmFsdWUgIT09IG51bGw7XHJcbmNvbnN0IGRlZlZhbHVlID0gcGFyc2VkRGVmYXVsdFByb3BWYWx1ZSA/ICdfY29tbW9uLmVuYWJsZWRfZGVmX2Nib3gnIDogJ19jb21tb24uZGlzYWJsZWRfZGVmX2Nib3gnO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiZm9ybS1jaGVja1wiIDppZD1cInByb3BzLmlkXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImZsZXggbWluLXctMCBmbGV4LTEgaXRlbXMtc3RhcnQgZ2FwLTNcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicHQtMC41XCI+XHJcbiAgICAgICAgICA8bi1jaGVja2JveCA6aWQ9XCJgJHtwcm9wcy5pZH1fY2JgXCIgdi1tb2RlbDpjaGVja2VkPVwiaXNDaGVja2VkXCIgOmRpc2FibGVkPVwicHJvcHMuZGlzYWJsZWRcIiAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIGZsZXgtMSBzcGFjZS15LTFcIj5cclxuICAgICAgICAgIDxsYWJlbCA6Zm9yPVwiYCR7cHJvcHMuaWR9X2NiYFwiIGNsYXNzPVwiZm9ybS1sYWJlbCBjdXJzb3ItcG9pbnRlciBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAge3sgJHQobGFiZWxGaWVsZCkgfX1cclxuICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzaG93RGVzY1wiIGNsYXNzPVwiZm9ybS10ZXh0IG10LTBcIj5cclxuICAgICAgICAgICAge3sgJHQoZGVzY0ZpZWxkKSB9fVxyXG4gICAgICAgICAgICA8c2xvdCAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzaG93RGVmVmFsdWVcIiBjbGFzcz1cImZvcm0tdGV4dCBtdC0wXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KGRlZlZhbHVlKSB9fVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzaG93TWV0YVwiIGNsYXNzPVwibXQtMSB0ZXh0LXhzIG9wYWNpdHktNjBcIj5cbiAgICAgICAgICAgIDxzbG90IG5hbWU9XCJtZXRhXCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgdi1pZj1cInNob3dBY3Rpb25zXCIgY2xhc3M9XCJzaHJpbmstMCBwdC0wLjVcIj5cclxuICAgICAgICA8c2xvdCBuYW1lPVwiYWN0aW9uc1wiIC8+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCB1c2VTbG90cyB9IGZyb20gJ3Z1ZSc7XHJcblxyXG5jb25zdCBzbG90cyA9IHVzZVNsb3RzKCk7XHJcblxyXG5jb25zdCBwcm9wcyA9IHdpdGhEZWZhdWx0cyhcclxuICBkZWZpbmVQcm9wczx7XHJcbiAgICBpZD86IHN0cmluZztcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBkZXNjPzogc3RyaW5nO1xyXG4gIH0+KCksXHJcbiAge1xyXG4gICAgaWQ6ICcnLFxyXG4gICAgZGVzYzogJycsXHJcbiAgfSxcclxuKTtcclxuXHJcbmNvbnN0IGhhc0Rlc2NyaXB0aW9uID0gY29tcHV0ZWQoKCkgPT4gQm9vbGVhbihwcm9wcy5kZXNjKSB8fCBCb29sZWFuKHNsb3RzWydkZWZhdWx0J10pKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTIgc206ZmxleC1yb3cgc206aXRlbXMtc3RhcnQgc206anVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgIDxsYWJlbCB2LWlmPVwicHJvcHMuaWRcIiA6Zm9yPVwicHJvcHMuaWRcIiBjbGFzcz1cImZvcm0tbGFiZWxcIj57eyBwcm9wcy5sYWJlbCB9fTwvbGFiZWw+XHJcbiAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7IHByb3BzLmxhYmVsIH19PC9kaXY+XHJcbiAgICAgIDxkaXYgdi1pZj1cIiRzbG90c1snYWN0aW9ucyddXCIgY2xhc3M9XCJzZWxmLXN0YXJ0IHNocmluay0wIHNtOnB0LTAuNVwiPlxyXG4gICAgICAgIDxzbG90IG5hbWU9XCJhY3Rpb25zXCIgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8c2xvdCBuYW1lPVwiY29udHJvbFwiIC8+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiaGFzRGVzY3JpcHRpb25cIiBjbGFzcz1cImZvcm0tdGV4dFwiPlxyXG4gICAgICA8c3BhbiB2LWlmPVwicHJvcHMuZGVzY1wiPnt7IHByb3BzLmRlc2MgfX08L3NwYW4+XHJcbiAgICAgIDxzbG90IC8+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8ZGl2IHYtaWY9XCIkc2xvdHNbJ21ldGEnXVwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIG10LTFcIj5cclxuICAgICAgPHNsb3QgbmFtZT1cIm1ldGFcIiAvPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmRlZmluZU9wdGlvbnMoeyBpbmhlcml0QXR0cnM6IGZhbHNlIH0pO1xyXG5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIHJlZiwgdXNlQXR0cnMsIHdhdGNoIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTklucHV0TnVtYmVyIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgQ29uZmlnRmllbGRTaGVsbCBmcm9tICcuL0NvbmZpZ0ZpZWxkU2hlbGwudnVlJztcclxuXHJcbmNvbnN0IG1vZGVsID0gZGVmaW5lTW9kZWw8bnVtYmVyIHwgbnVsbD4oeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3QgYXR0cnMgPSB1c2VBdHRycygpO1xyXG5cclxuY29uc3QgcHJvcHMgPSB3aXRoRGVmYXVsdHMoXHJcbiAgZGVmaW5lUHJvcHM8e1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBkZXNjPzogc3RyaW5nO1xyXG4gICAgc2l6ZT86ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XHJcbiAgICBtaW4/OiBudW1iZXI7XHJcbiAgICBtYXg/OiBudW1iZXI7XHJcbiAgfT4oKSxcclxuICB7XHJcbiAgICBkZXNjOiAnJyxcclxuICAgIHNpemU6ICdtZWRpdW0nLFxyXG4gICAgbWluOiAwLFxyXG4gIH0sXHJcbik7XHJcblxyXG5jb25zdCBob3Vyc1BhcnQgPSByZWY8bnVtYmVyIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IG1pbnV0ZXNQYXJ0ID0gcmVmPG51bWJlciB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBzZWNvbmRzUGFydCA9IHJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcclxuXHJcbmZ1bmN0aW9uIHNhbml0aXplUGFydCh2YWx1ZTogbnVtYmVyIHwgbnVsbCwgbWF4PzogbnVtYmVyKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBudWxsO1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHZhbHVlKSk7XHJcbiAgcmV0dXJuIG1heCAhPT0gdW5kZWZpbmVkID8gTWF0aC5taW4obWF4LCBub3JtYWxpemVkKSA6IG5vcm1hbGl6ZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wVG90YWxTZWNvbmRzKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gIGNvbnN0IHdpdGhNaW4gPSBwcm9wcy5taW4gIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByb3BzLm1pbiwgdmFsdWUpIDogdmFsdWU7XHJcbiAgcmV0dXJuIHByb3BzLm1heCAhPT0gdW5kZWZpbmVkID8gTWF0aC5taW4ocHJvcHMubWF4LCB3aXRoTWluKSA6IHdpdGhNaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN5bmNGcm9tTW9kZWwodmFsdWU6IG51bWJlciB8IG51bGwpIHtcclxuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xyXG4gICAgaG91cnNQYXJ0LnZhbHVlID0gbnVsbDtcclxuICAgIG1pbnV0ZXNQYXJ0LnZhbHVlID0gbnVsbDtcclxuICAgIHNlY29uZHNQYXJ0LnZhbHVlID0gbnVsbDtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRvdGFsU2Vjb25kcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IodmFsdWUpKTtcclxuICBob3Vyc1BhcnQudmFsdWUgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDM2MDApO1xyXG4gIG1pbnV0ZXNQYXJ0LnZhbHVlID0gTWF0aC5mbG9vcigodG90YWxTZWNvbmRzICUgMzYwMCkgLyA2MCk7XHJcbiAgc2Vjb25kc1BhcnQudmFsdWUgPSB0b3RhbFNlY29uZHMgJSA2MDtcclxufVxyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gbW9kZWwudmFsdWUsXHJcbiAgKHZhbHVlKSA9PiBzeW5jRnJvbU1vZGVsKHZhbHVlKSxcclxuICB7IGltbWVkaWF0ZTogdHJ1ZSB9LFxyXG4pO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlRHVyYXRpb25QYXJ0KHBhcnQ6ICdob3VycycgfCAnbWludXRlcycgfCAnc2Vjb25kcycsIHZhbHVlOiBudW1iZXIgfCBudWxsKSB7XHJcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHNhbml0aXplUGFydCh2YWx1ZSwgcGFydCA9PT0gJ2hvdXJzJyA/IHVuZGVmaW5lZCA6IDU5KTtcclxuICBpZiAocGFydCA9PT0gJ2hvdXJzJykgaG91cnNQYXJ0LnZhbHVlID0gbm9ybWFsaXplZDtcclxuICBlbHNlIGlmIChwYXJ0ID09PSAnbWludXRlcycpIG1pbnV0ZXNQYXJ0LnZhbHVlID0gbm9ybWFsaXplZDtcclxuICBlbHNlIHNlY29uZHNQYXJ0LnZhbHVlID0gbm9ybWFsaXplZDtcclxuXHJcbiAgaWYgKGhvdXJzUGFydC52YWx1ZSA9PT0gbnVsbCAmJiBtaW51dGVzUGFydC52YWx1ZSA9PT0gbnVsbCAmJiBzZWNvbmRzUGFydC52YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgbW9kZWwudmFsdWUgPSBudWxsO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG90YWxTZWNvbmRzID1cclxuICAgIChob3Vyc1BhcnQudmFsdWUgPz8gMCkgKiAzNjAwICsgKG1pbnV0ZXNQYXJ0LnZhbHVlID8/IDApICogNjAgKyAoc2Vjb25kc1BhcnQudmFsdWUgPz8gMCk7XHJcbiAgbW9kZWwudmFsdWUgPSBjbGFtcFRvdGFsU2Vjb25kcyh0b3RhbFNlY29uZHMpO1xyXG4gIHN5bmNGcm9tTW9kZWwobW9kZWwudmFsdWUpO1xyXG59XHJcblxyXG5jb25zdCBkdXJhdGlvblN1bW1hcnkgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKG1vZGVsLnZhbHVlID09PSBudWxsIHx8IG1vZGVsLnZhbHVlID09PSB1bmRlZmluZWQgfHwgIU51bWJlci5pc0Zpbml0ZShtb2RlbC52YWx1ZSkpIHtcclxuICAgIHJldHVybiAnU3RvcmVkIGFzIHNlY29uZHMuJztcclxuICB9XHJcblxyXG4gIGNvbnN0IHRvdGFsU2Vjb25kcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IobW9kZWwudmFsdWUpKTtcclxuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcclxuICBpZiAoaG91cnNQYXJ0LnZhbHVlKSBwYXJ0cy5wdXNoKGAke2hvdXJzUGFydC52YWx1ZX1oYCk7XHJcbiAgaWYgKG1pbnV0ZXNQYXJ0LnZhbHVlKSBwYXJ0cy5wdXNoKGAke21pbnV0ZXNQYXJ0LnZhbHVlfW1gKTtcclxuICBpZiAoc2Vjb25kc1BhcnQudmFsdWUgfHwgcGFydHMubGVuZ3RoID09PSAwKSBwYXJ0cy5wdXNoKGAke3NlY29uZHNQYXJ0LnZhbHVlID8/IDB9c2ApO1xyXG4gIHJldHVybiBgJHtwYXJ0cy5qb2luKCcgJyl9ICgke3RvdGFsU2Vjb25kc30gc2Vjb25kcylgO1xyXG59KTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPENvbmZpZ0ZpZWxkU2hlbGxcclxuICAgIDppZD1cImAke3Byb3BzLmlkfS1ob3Vyc2BcIlxyXG4gICAgOmxhYmVsPVwicHJvcHMubGFiZWxcIlxyXG4gICAgOmRlc2M9XCJwcm9wcy5kZXNjXCJcclxuICAgIHYtYmluZD1cImF0dHJzXCJcclxuICA+XHJcbiAgICA8dGVtcGxhdGUgI2FjdGlvbnM+PHNsb3QgbmFtZT1cImFjdGlvbnNcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI2NvbnRyb2w+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0zIGdhcC0yXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1tZWRpdW0gdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS02MFwiPkhvdXJzPC9kaXY+XHJcbiAgICAgICAgICA8bi1pbnB1dC1udW1iZXJcclxuICAgICAgICAgICAgOmlkPVwiYCR7cHJvcHMuaWR9LWhvdXJzYFwiXHJcbiAgICAgICAgICAgIDp2YWx1ZT1cImhvdXJzUGFydFwiXHJcbiAgICAgICAgICAgIDpzaXplPVwicHJvcHMuc2l6ZVwiXHJcbiAgICAgICAgICAgIDptaW49XCIwXCJcclxuICAgICAgICAgICAgOnByZWNpc2lvbj1cIjBcIlxyXG4gICAgICAgICAgICA6c2hvdy1idXR0b249XCJmYWxzZVwiXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMFwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsXCJcclxuICAgICAgICAgICAgQHVwZGF0ZTp2YWx1ZT1cIih2YWx1ZSkgPT4gdXBkYXRlRHVyYXRpb25QYXJ0KCdob3VycycsIHZhbHVlKVwiXHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0xXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTYwXCI+TWludXRlczwvZGl2PlxyXG4gICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgIDppZD1cImAke3Byb3BzLmlkfS1taW51dGVzYFwiXHJcbiAgICAgICAgICAgIDp2YWx1ZT1cIm1pbnV0ZXNQYXJ0XCJcclxuICAgICAgICAgICAgOnNpemU9XCJwcm9wcy5zaXplXCJcclxuICAgICAgICAgICAgOm1pbj1cIjBcIlxyXG4gICAgICAgICAgICA6bWF4PVwiNTlcIlxyXG4gICAgICAgICAgICA6cHJlY2lzaW9uPVwiMFwiXHJcbiAgICAgICAgICAgIDpzaG93LWJ1dHRvbj1cImZhbHNlXCJcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIwXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGxcIlxyXG4gICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwiKHZhbHVlKSA9PiB1cGRhdGVEdXJhdGlvblBhcnQoJ21pbnV0ZXMnLCB2YWx1ZSlcIlxyXG4gICAgICAgICAgLz5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1tZWRpdW0gdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS02MFwiPlNlY29uZHM8L2Rpdj5cclxuICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICA6aWQ9XCJgJHtwcm9wcy5pZH0tc2Vjb25kc2BcIlxyXG4gICAgICAgICAgICA6dmFsdWU9XCJzZWNvbmRzUGFydFwiXHJcbiAgICAgICAgICAgIDpzaXplPVwicHJvcHMuc2l6ZVwiXHJcbiAgICAgICAgICAgIDptaW49XCIwXCJcclxuICAgICAgICAgICAgOm1heD1cIjU5XCJcclxuICAgICAgICAgICAgOnByZWNpc2lvbj1cIjBcIlxyXG4gICAgICAgICAgICA6c2hvdy1idXR0b249XCJmYWxzZVwiXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMFwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsXCJcclxuICAgICAgICAgICAgQHVwZGF0ZTp2YWx1ZT1cIih2YWx1ZSkgPT4gdXBkYXRlRHVyYXRpb25QYXJ0KCdzZWNvbmRzJywgdmFsdWUpXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAteC0zIGdhcC15LTFcIj5cclxuICAgICAgICA8c3Bhbj57eyBkdXJhdGlvblN1bW1hcnkgfX08L3NwYW4+XHJcbiAgICAgICAgPHNsb3QgbmFtZT1cIm1ldGFcIiAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8c2xvdCAvPlxyXG4gIDwvQ29uZmlnRmllbGRTaGVsbD5cclxuPC90ZW1wbGF0ZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuZGVmaW5lT3B0aW9ucyh7IGluaGVyaXRBdHRyczogZmFsc2UgfSk7XHJcblxyXG5pbXBvcnQgeyBjb21wdXRlZCwgdXNlQXR0cnMgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyBOSW5wdXQgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCBDb25maWdGaWVsZFNoZWxsIGZyb20gJy4vQ29uZmlnRmllbGRTaGVsbC52dWUnO1xyXG5cclxuY29uc3QgbW9kZWwgPSBkZWZpbmVNb2RlbDxzdHJpbmc+KHsgcmVxdWlyZWQ6IHRydWUgfSk7XHJcbmNvbnN0IGF0dHJzID0gdXNlQXR0cnMoKTtcclxuXHJcbmNvbnN0IHByb3BzID0gd2l0aERlZmF1bHRzKFxyXG4gIGRlZmluZVByb3BzPHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZGVzYz86IHN0cmluZztcclxuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xyXG4gICAgdHlwZT86ICd0ZXh0JyB8ICd0ZXh0YXJlYScgfCAncGFzc3dvcmQnO1xyXG4gICAgc2l6ZT86ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XHJcbiAgICBjbGVhcmFibGU/OiBib29sZWFuO1xyXG4gICAgbW9ub3NwYWNlPzogYm9vbGVhbjtcclxuICAgIGF1dG9zaXplPzogYm9vbGVhbiB8IHsgbWluUm93czogbnVtYmVyOyBtYXhSb3dzOiBudW1iZXIgfTtcclxuICAgIGlucHV0bW9kZT86IHN0cmluZztcclxuICB9PigpLFxyXG4gIHtcclxuICAgIGRlc2M6ICcnLFxyXG4gICAgcGxhY2Vob2xkZXI6ICcnLFxyXG4gICAgdHlwZTogJ3RleHQnLFxyXG4gICAgc2l6ZTogJ21lZGl1bScsXHJcbiAgICBjbGVhcmFibGU6IGZhbHNlLFxyXG4gICAgbW9ub3NwYWNlOiBmYWxzZSxcclxuICAgIGF1dG9zaXplOiBmYWxzZSxcclxuICAgIGlucHV0bW9kZTogJycsXHJcbiAgfSxcclxuKTtcclxuXHJcbmNvbnN0IGlucHV0Q2xhc3MgPSBjb21wdXRlZCgoKSA9PiAocHJvcHMubW9ub3NwYWNlID8gJ2ZvbnQtbW9ubycgOiAnJykpO1xyXG5jb25zdCBpbnB1dFByb3BzID0gY29tcHV0ZWQoKCkgPT4gKHtcclxuICAuLi4ocHJvcHMudHlwZSA9PT0gJ3RleHRhcmVhJyAmJiBwcm9wcy5hdXRvc2l6ZSA/IHsgYXV0b3NpemU6IHByb3BzLmF1dG9zaXplIH0gOiB7fSksXHJcbiAgLi4uKHByb3BzLmlucHV0bW9kZSA/IHsgaW5wdXRtb2RlOiBwcm9wcy5pbnB1dG1vZGUgfSA6IHt9KSxcclxufSkpO1xyXG5jb25zdCBtZXJnZWRJbnB1dFByb3BzID0gY29tcHV0ZWQoKCkgPT4gKHtcclxuICAuLi5pbnB1dFByb3BzLnZhbHVlLFxyXG4gIC4uLmF0dHJzLFxyXG59KSk7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxDb25maWdGaWVsZFNoZWxsIDppZD1cInByb3BzLmlkXCIgOmxhYmVsPVwicHJvcHMubGFiZWxcIiA6ZGVzYz1cInByb3BzLmRlc2NcIj5cclxuICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz48c2xvdCBuYW1lPVwiYWN0aW9uc1wiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjY29udHJvbD5cclxuICAgICAgPG4taW5wdXRcclxuICAgICAgICA6aWQ9XCJwcm9wcy5pZFwiXHJcbiAgICAgICAgdi1tb2RlbDp2YWx1ZT1cIm1vZGVsXCJcclxuICAgICAgICA6dHlwZT1cInByb3BzLnR5cGVcIlxyXG4gICAgICAgIDpzaXplPVwicHJvcHMuc2l6ZVwiXHJcbiAgICAgICAgOnBsYWNlaG9sZGVyPVwicHJvcHMucGxhY2Vob2xkZXJcIlxyXG4gICAgICAgIDpjbGVhcmFibGU9XCJwcm9wcy5jbGVhcmFibGVcIlxyXG4gICAgICAgIDpjbGFzcz1cImlucHV0Q2xhc3NcIlxyXG4gICAgICAgIHYtYmluZD1cIm1lcmdlZElucHV0UHJvcHNcIlxyXG4gICAgICAvPlxyXG4gICAgPC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjbWV0YT48c2xvdCBuYW1lPVwibWV0YVwiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDxzbG90IC8+XHJcbiAgPC9Db25maWdGaWVsZFNoZWxsPlxyXG48L3RlbXBsYXRlPlxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5kZWZpbmVPcHRpb25zKHsgaW5oZXJpdEF0dHJzOiBmYWxzZSB9KTtcclxuXHJcbmltcG9ydCB7IGNvbXB1dGVkLCB1c2VBdHRycyB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IE5JbnB1dE51bWJlciB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkU2hlbGwgZnJvbSAnLi9Db25maWdGaWVsZFNoZWxsLnZ1ZSc7XHJcblxyXG5jb25zdCBtb2RlbCA9IGRlZmluZU1vZGVsPG51bWJlciB8IG51bGw+KHsgcmVxdWlyZWQ6IHRydWUgfSk7XHJcbmNvbnN0IGF0dHJzID0gdXNlQXR0cnMoKTtcclxuXHJcbmNvbnN0IHByb3BzID0gd2l0aERlZmF1bHRzKFxyXG4gIGRlZmluZVByb3BzPHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZGVzYz86IHN0cmluZztcclxuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xyXG4gICAgc2l6ZT86ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XHJcbiAgICBtaW4/OiBudW1iZXI7XHJcbiAgICBtYXg/OiBudW1iZXI7XHJcbiAgICBzdGVwPzogbnVtYmVyO1xyXG4gICAgcHJlY2lzaW9uPzogbnVtYmVyO1xyXG4gIH0+KCksXHJcbiAge1xyXG4gICAgZGVzYzogJycsXHJcbiAgICBwbGFjZWhvbGRlcjogJycsXHJcbiAgICBzaXplOiAnbWVkaXVtJyxcclxuICB9LFxyXG4pO1xyXG5cclxuY29uc3QgbnVtYmVyUHJvcHMgPSBjb21wdXRlZCgoKSA9PiAoe1xyXG4gIC4uLihwcm9wcy5taW4gIT09IHVuZGVmaW5lZCA/IHsgbWluOiBwcm9wcy5taW4gfSA6IHt9KSxcclxuICAuLi4ocHJvcHMubWF4ICE9PSB1bmRlZmluZWQgPyB7IG1heDogcHJvcHMubWF4IH0gOiB7fSksXHJcbiAgLi4uKHByb3BzLnN0ZXAgIT09IHVuZGVmaW5lZCA/IHsgc3RlcDogcHJvcHMuc3RlcCB9IDoge30pLFxyXG4gIC4uLihwcm9wcy5wcmVjaXNpb24gIT09IHVuZGVmaW5lZCA/IHsgcHJlY2lzaW9uOiBwcm9wcy5wcmVjaXNpb24gfSA6IHt9KSxcclxufSkpO1xyXG5jb25zdCBtZXJnZWROdW1iZXJQcm9wcyA9IGNvbXB1dGVkKCgpID0+ICh7XHJcbiAgLi4ubnVtYmVyUHJvcHMudmFsdWUsXHJcbiAgLi4uYXR0cnMsXHJcbn0pKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPENvbmZpZ0ZpZWxkU2hlbGwgOmlkPVwicHJvcHMuaWRcIiA6bGFiZWw9XCJwcm9wcy5sYWJlbFwiIDpkZXNjPVwicHJvcHMuZGVzY1wiPlxyXG4gICAgPHRlbXBsYXRlICNhY3Rpb25zPjxzbG90IG5hbWU9XCJhY3Rpb25zXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHRlbXBsYXRlICNjb250cm9sPlxyXG4gICAgICA8bi1pbnB1dC1udW1iZXJcclxuICAgICAgICA6aWQ9XCJwcm9wcy5pZFwiXHJcbiAgICAgICAgdi1tb2RlbDp2YWx1ZT1cIm1vZGVsXCJcclxuICAgICAgICA6c2l6ZT1cInByb3BzLnNpemVcIlxyXG4gICAgICAgIDpwbGFjZWhvbGRlcj1cInByb3BzLnBsYWNlaG9sZGVyXCJcclxuICAgICAgICB2LWJpbmQ9XCJtZXJnZWROdW1iZXJQcm9wc1wiXHJcbiAgICAgIC8+XHJcbiAgICA8L3RlbXBsYXRlPlxyXG4gICAgPHRlbXBsYXRlICNtZXRhPjxzbG90IG5hbWU9XCJtZXRhXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHNsb3QgLz5cclxuICA8L0NvbmZpZ0ZpZWxkU2hlbGw+XHJcbjwvdGVtcGxhdGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmRlZmluZU9wdGlvbnMoeyBpbmhlcml0QXR0cnM6IGZhbHNlIH0pO1xyXG5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIHVzZUF0dHJzIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTlNlbGVjdCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkU2hlbGwgZnJvbSAnLi9Db25maWdGaWVsZFNoZWxsLnZ1ZSc7XHJcblxyXG50eXBlIFNlbGVjdE9wdGlvbiA9IHtcclxuICBsYWJlbDogc3RyaW5nO1xyXG4gIHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xyXG59O1xyXG5cclxuY29uc3QgbW9kZWwgPSBkZWZpbmVNb2RlbDxzdHJpbmcgfCBudW1iZXIgfCBudWxsPih7IHJlcXVpcmVkOiB0cnVlIH0pO1xyXG5jb25zdCBhdHRycyA9IHVzZUF0dHJzKCk7XHJcblxyXG5jb25zdCBwcm9wcyA9IHdpdGhEZWZhdWx0cyhcclxuICBkZWZpbmVQcm9wczx7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGRlc2M/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zOiBTZWxlY3RPcHRpb25bXTtcclxuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xyXG4gICAgZmlsdGVyYWJsZT86IGJvb2xlYW47XHJcbiAgICBjbGVhcmFibGU/OiBib29sZWFuO1xyXG4gICAgc2l6ZT86ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XHJcbiAgfT4oKSxcclxuICB7XHJcbiAgICBkZXNjOiAnJyxcclxuICAgIHBsYWNlaG9sZGVyOiAnJyxcclxuICAgIGZpbHRlcmFibGU6IGZhbHNlLFxyXG4gICAgY2xlYXJhYmxlOiBmYWxzZSxcclxuICAgIHNpemU6ICdtZWRpdW0nLFxyXG4gIH0sXHJcbik7XHJcblxyXG5jb25zdCBzZWFyY2hPcHRpb25zID0gY29tcHV0ZWQoKCkgPT5cclxuICBwcm9wcy5vcHRpb25zLm1hcCgob3B0aW9uKSA9PiBgJHtvcHRpb24ubGFiZWwgPz8gJyd9Ojoke29wdGlvbi52YWx1ZSA/PyAnJ31gKS5qb2luKCd8JyksXHJcbik7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxDb25maWdGaWVsZFNoZWxsIDppZD1cInByb3BzLmlkXCIgOmxhYmVsPVwicHJvcHMubGFiZWxcIiA6ZGVzYz1cInByb3BzLmRlc2NcIj5cclxuICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz48c2xvdCBuYW1lPVwiYWN0aW9uc1wiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjY29udHJvbD5cclxuICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgOmlkPVwicHJvcHMuaWRcIlxyXG4gICAgICAgIHYtbW9kZWw6dmFsdWU9XCJtb2RlbFwiXHJcbiAgICAgICAgOnNpemU9XCJwcm9wcy5zaXplXCJcclxuICAgICAgICA6b3B0aW9ucz1cInByb3BzLm9wdGlvbnNcIlxyXG4gICAgICAgIDpwbGFjZWhvbGRlcj1cInByb3BzLnBsYWNlaG9sZGVyXCJcclxuICAgICAgICA6ZmlsdGVyYWJsZT1cInByb3BzLmZpbHRlcmFibGVcIlxyXG4gICAgICAgIDpjbGVhcmFibGU9XCJwcm9wcy5jbGVhcmFibGVcIlxyXG4gICAgICAgIDpkYXRhLXNlYXJjaC1vcHRpb25zPVwic2VhcmNoT3B0aW9uc1wiXHJcbiAgICAgICAgdi1iaW5kPVwiYXR0cnNcIlxyXG4gICAgICAvPlxyXG4gICAgPC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjbWV0YT48c2xvdCBuYW1lPVwibWV0YVwiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDxzbG90IC8+XHJcbiAgPC9Db25maWdGaWVsZFNoZWxsPlxyXG48L3RlbXBsYXRlPlxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5kZWZpbmVPcHRpb25zKHsgaW5oZXJpdEF0dHJzOiBmYWxzZSB9KTtcclxuXHJcbmltcG9ydCB7IHVzZUF0dHJzIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTlN3aXRjaCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkU2hlbGwgZnJvbSAnLi9Db25maWdGaWVsZFNoZWxsLnZ1ZSc7XHJcblxyXG5jb25zdCBtb2RlbCA9IGRlZmluZU1vZGVsPGJvb2xlYW4+KHsgcmVxdWlyZWQ6IHRydWUgfSk7XHJcbmNvbnN0IGF0dHJzID0gdXNlQXR0cnMoKTtcclxuXHJcbmNvbnN0IHByb3BzID0gd2l0aERlZmF1bHRzKFxyXG4gIGRlZmluZVByb3BzPHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZGVzYz86IHN0cmluZztcclxuICAgIHNpemU/OiAnc21hbGwnIHwgJ21lZGl1bScgfCAnbGFyZ2UnO1xyXG4gIH0+KCksXHJcbiAge1xyXG4gICAgZGVzYzogJycsXHJcbiAgICBzaXplOiAnbWVkaXVtJyxcclxuICB9LFxyXG4pO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8Q29uZmlnRmllbGRTaGVsbCA6aWQ9XCJwcm9wcy5pZFwiIDpsYWJlbD1cInByb3BzLmxhYmVsXCIgOmRlc2M9XCJwcm9wcy5kZXNjXCI+XHJcbiAgICA8dGVtcGxhdGUgI2FjdGlvbnM+PHNsb3QgbmFtZT1cImFjdGlvbnNcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI2NvbnRyb2w+XHJcbiAgICAgIDxuLXN3aXRjaCA6aWQ9XCJwcm9wcy5pZFwiIHYtbW9kZWw6dmFsdWU9XCJtb2RlbFwiIDpzaXplPVwicHJvcHMuc2l6ZVwiIHYtYmluZD1cImF0dHJzXCIgLz5cclxuICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI21ldGE+PHNsb3QgbmFtZT1cIm1ldGFcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8c2xvdCAvPlxyXG4gIDwvQ29uZmlnRmllbGRTaGVsbD5cclxuPC90ZW1wbGF0ZT5cclxuIiwiZXhwb3J0IHR5cGUgQ29uZmlnU2VsZWN0T3B0aW9uID0geyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyOyBkaXNhYmxlZD86IGJvb2xlYW4gfTtcclxuXHJcbmV4cG9ydCB0eXBlIENvbmZpZ1NlbGVjdE9wdGlvbnNDb250ZXh0ID0ge1xyXG4gIHQ6IChrZXk6IHN0cmluZykgPT4gc3RyaW5nO1xyXG4gIHBsYXRmb3JtOiBzdHJpbmc7XHJcbiAgbWV0YWRhdGE/OiBhbnk7XHJcbiAgY3VycmVudFZhbHVlPzogdW5rbm93bjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVPcih0OiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZywga2V5OiBzdHJpbmcsIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHZhbHVlID0gdChrZXkpO1xyXG4gIGlmICghdmFsdWUgfHwgdmFsdWUgPT09IGtleSkgcmV0dXJuIGZhbGxiYWNrO1xyXG4gIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNTZWxlY3RWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIHN0cmluZyB8IG51bWJlciB7XHJcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKFxyXG4gIG9wdGlvbnM6IENvbmZpZ1NlbGVjdE9wdGlvbltdLFxyXG4gIGN1cnJlbnRWYWx1ZTogdW5rbm93bixcclxuKTogQ29uZmlnU2VsZWN0T3B0aW9uW10ge1xyXG4gIGlmICghaXNTZWxlY3RWYWx1ZShjdXJyZW50VmFsdWUpKSByZXR1cm4gb3B0aW9ucztcclxuICBpZiAob3B0aW9ucy5zb21lKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gY3VycmVudFZhbHVlKSkgcmV0dXJuIG9wdGlvbnM7XHJcbiAgcmV0dXJuIG9wdGlvbnMuY29uY2F0KFt7IGxhYmVsOiBTdHJpbmcoY3VycmVudFZhbHVlKSwgdmFsdWU6IGN1cnJlbnRWYWx1ZSB9XSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdwdUZsYWdzKG1ldGFkYXRhOiBhbnkpIHtcclxuICBjb25zdCBncHVzID0gQXJyYXkuaXNBcnJheShtZXRhZGF0YT8uZ3B1cykgPyBtZXRhZGF0YS5ncHVzIDogW107XHJcbiAgY29uc3QgaGFzVmVuZG9yID0gKHZlbmRvcklkOiBudW1iZXIpID0+XHJcbiAgICBncHVzLnNvbWUoKGdwdTogYW55KSA9PiBOdW1iZXIoZ3B1Py52ZW5kb3JfaWQgPz8gZ3B1Py52ZW5kb3JJZCA/PyAwKSA9PT0gdmVuZG9ySWQpO1xyXG5cclxuICBjb25zdCBtZXRhTnZpZGlhID0gbWV0YWRhdGE/Lmhhc19udmlkaWFfZ3B1O1xyXG4gIGNvbnN0IG1ldGFJbnRlbCA9IG1ldGFkYXRhPy5oYXNfaW50ZWxfZ3B1O1xyXG4gIGNvbnN0IG1ldGFBbWQgPSBtZXRhZGF0YT8uaGFzX2FtZF9ncHU7XHJcblxyXG4gIGNvbnN0IGhhc052aWRpYSA9XHJcbiAgICB0eXBlb2YgbWV0YU52aWRpYSA9PT0gJ2Jvb2xlYW4nID8gbWV0YU52aWRpYSA6IGdwdXMubGVuZ3RoID8gaGFzVmVuZG9yKDB4MTBkZSkgOiB0cnVlO1xyXG4gIGNvbnN0IGhhc0ludGVsID1cclxuICAgIHR5cGVvZiBtZXRhSW50ZWwgPT09ICdib29sZWFuJyA/IG1ldGFJbnRlbCA6IGdwdXMubGVuZ3RoID8gaGFzVmVuZG9yKDB4ODA4NikgOiB0cnVlO1xyXG4gIGNvbnN0IGhhc0FtZCA9XHJcbiAgICB0eXBlb2YgbWV0YUFtZCA9PT0gJ2Jvb2xlYW4nXHJcbiAgICAgID8gbWV0YUFtZFxyXG4gICAgICA6IGdwdXMubGVuZ3RoXHJcbiAgICAgICAgPyBncHVzLnNvbWUoKGdwdTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlbmRvciA9IE51bWJlcihncHU/LnZlbmRvcl9pZCA/PyBncHU/LnZlbmRvcklkID8/IDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVuZG9yID09PSAweDEwMDIgfHwgdmVuZG9yID09PSAweDEwMjI7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIDogdHJ1ZTtcclxuXHJcbiAgcmV0dXJuIHsgaGFzTnZpZGlhLCBoYXNJbnRlbCwgaGFzQW1kIH07XHJcbn1cclxuXHJcbmNvbnN0IGxvY2FsZU9wdGlvbnM6IENvbmZpZ1NlbGVjdE9wdGlvbltdID0gW1xyXG4gIHsgbGFiZWw6ICfQkdGK0LvQs9Cw0YDRgdC60LggKEJ1bGdhcmlhbiknLCB2YWx1ZTogJ2JnJyB9LFxyXG4gIHsgbGFiZWw6ICfEjGXFoXRpbmEgKEN6ZWNoKScsIHZhbHVlOiAnY3MnIH0sXHJcbiAgeyBsYWJlbDogJ0RldXRzY2ggKEdlcm1hbiknLCB2YWx1ZTogJ2RlJyB9LFxyXG4gIHsgbGFiZWw6ICdFbmdsaXNoJywgdmFsdWU6ICdlbicgfSxcclxuICB7IGxhYmVsOiAnRW5nbGlzaCwgVUsnLCB2YWx1ZTogJ2VuX0dCJyB9LFxyXG4gIHsgbGFiZWw6ICdFbmdsaXNoLCBVUycsIHZhbHVlOiAnZW5fVVMnIH0sXHJcbiAgeyBsYWJlbDogJ0VzcGHDsW9sIChTcGFuaXNoKScsIHZhbHVlOiAnZXMnIH0sXHJcbiAgeyBsYWJlbDogJ0ZyYW7Dp2FpcyAoRnJlbmNoKScsIHZhbHVlOiAnZnInIH0sXHJcbiAgeyBsYWJlbDogJ01hZ3lhciAoSHVuZ2FyaWFuKScsIHZhbHVlOiAnaHUnIH0sXHJcbiAgeyBsYWJlbDogJ0l0YWxpYW5vIChJdGFsaWFuKScsIHZhbHVlOiAnaXQnIH0sXHJcbiAgeyBsYWJlbDogJ+aXpeacrOiqniAoSmFwYW5lc2UpJywgdmFsdWU6ICdqYScgfSxcclxuICB7IGxhYmVsOiAn7ZWc6rWt7Ja0IChLb3JlYW4pJywgdmFsdWU6ICdrbycgfSxcclxuICB7IGxhYmVsOiAnUG9sc2tpIChQb2xpc2gpJywgdmFsdWU6ICdwbCcgfSxcclxuICB7IGxhYmVsOiAnUG9ydHVndcOqcyAoUG9ydHVndWVzZSknLCB2YWx1ZTogJ3B0JyB9LFxyXG4gIHsgbGFiZWw6ICdQb3J0dWd1w6pzLCBCcmFzaWxlaXJvIChQb3J0dWd1ZXNlLCBCcmF6aWxpYW4pJywgdmFsdWU6ICdwdF9CUicgfSxcclxuICB7IGxhYmVsOiAn0KDRg9GB0YHQutC40LkgKFJ1c3NpYW4pJywgdmFsdWU6ICdydScgfSxcclxuICB7IGxhYmVsOiAnc3ZlbnNrYSAoU3dlZGlzaCknLCB2YWx1ZTogJ3N2JyB9LFxyXG4gIHsgbGFiZWw6ICdUw7xya8OnZSAoVHVya2lzaCknLCB2YWx1ZTogJ3RyJyB9LFxyXG4gIHsgbGFiZWw6ICfQo9C60YDQsNGX0L3RgdGM0LrQsCAoVWtyYWluaWFuKScsIHZhbHVlOiAndWsnIH0sXHJcbiAgeyBsYWJlbDogJ1Rp4bq/bmcgVmnhu4d0IChWaWV0bmFtZXNlKScsIHZhbHVlOiAndmknIH0sXHJcbiAgeyBsYWJlbDogJ+eugOS9k+S4reaWhyAoQ2hpbmVzZSBTaW1wbGlmaWVkKScsIHZhbHVlOiAnemgnIH0sXHJcbiAgeyBsYWJlbDogJ+e5gemrlOS4reaWhyAoQ2hpbmVzZSBUcmFkaXRpb25hbCknLCB2YWx1ZTogJ3poX1RXJyB9LFxyXG5dO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZ1NlbGVjdE9wdGlvbnMoXHJcbiAga2V5OiBzdHJpbmcsXHJcbiAgY3R4OiBDb25maWdTZWxlY3RPcHRpb25zQ29udGV4dCxcclxuKTogQ29uZmlnU2VsZWN0T3B0aW9uW10ge1xyXG4gIGNvbnN0IHBsYXRmb3JtID0gU3RyaW5nKGN0eC5wbGF0Zm9ybSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCB7IHQgfSA9IGN0eDtcclxuXHJcbiAgc3dpdGNoIChrZXkpIHtcclxuICAgIGNhc2UgJ2xvY2FsZSc6XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShsb2NhbGVPcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIGNhc2UgJ21pbl9sb2dfbGV2ZWwnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNl0ubWFwKCh2YWx1ZSkgPT4gKHtcclxuICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgYGNvbmZpZy5taW5fbG9nX2xldmVsXyR7dmFsdWV9YCwgU3RyaW5nKHZhbHVlKSksXHJcbiAgICAgICAgdmFsdWUsXHJcbiAgICAgIH0pKTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnYWRkcmVzc19mYW1pbHknOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5hZGRyZXNzX2ZhbWlseV9pcHY0JywgJ0lQdjQnKSwgdmFsdWU6ICdpcHY0JyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuYWRkcmVzc19mYW1pbHlfYm90aCcsICdCb3RoJyksIHZhbHVlOiAnYm90aCcgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnb3JpZ2luX3dlYl91aV9hbGxvd2VkJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcub3JpZ2luX3dlYl91aV9hbGxvd2VkX3BjJywgJ1BDJyksIHZhbHVlOiAncGMnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5vcmlnaW5fd2ViX3VpX2FsbG93ZWRfbGFuJywgJ0xBTicpLCB2YWx1ZTogJ2xhbicgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLm9yaWdpbl93ZWJfdWlfYWxsb3dlZF93YW4nLCAnV0FOJyksIHZhbHVlOiAnd2FuJyB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdsYW5fZW5jcnlwdGlvbl9tb2RlJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmRpc2FibGVkX2RlZicsICdEaXNhYmxlZCAoZGVmYXVsdCknKSwgdmFsdWU6IDAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5sYW5fZW5jcnlwdGlvbl9tb2RlXzEnLCAnT3Bwb3J0dW5pc3RpYycpLFxyXG4gICAgICAgICAgdmFsdWU6IDEsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmxhbl9lbmNyeXB0aW9uX21vZGVfMicsICdGb3JjZWQnKSwgdmFsdWU6IDIgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnd2FuX2VuY3J5cHRpb25fbW9kZSc6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnX2NvbW1vbi5kaXNhYmxlZCcsICdEaXNhYmxlZCcpLCB2YWx1ZTogMCB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLndhbl9lbmNyeXB0aW9uX21vZGVfMScsICdPcHBvcnR1bmlzdGljJyksXHJcbiAgICAgICAgICB2YWx1ZTogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcud2FuX2VuY3J5cHRpb25fbW9kZV8yJywgJ0ZvcmNlZCcpLCB2YWx1ZTogMiB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICd2aWRlb19tYXhfYmF0Y2hfc2l6ZV9rYic6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7IGxhYmVsOiAnNjQgS2lCIChkZWZhdWx0KScsIHZhbHVlOiA2NCB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICczMiBLaUInLCB2YWx1ZTogMzIgfSxcclxuICAgICAgICB7IGxhYmVsOiAnMTYgS2lCJywgdmFsdWU6IDE2IH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ2hldmNfbW9kZSc6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFswLCAxLCAyLCAzXS5tYXAoKHZhbHVlKSA9PiAoe1xyXG4gICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCBgY29uZmlnLmhldmNfbW9kZV8ke3ZhbHVlfWAsIFN0cmluZyh2YWx1ZSkpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICB9KSk7XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ2F2MV9tb2RlJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gWzAsIDEsIDIsIDNdLm1hcCgodmFsdWUpID0+ICh7XHJcbiAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsIGBjb25maWcuYXYxX21vZGVfJHt2YWx1ZX1gLCBTdHJpbmcodmFsdWUpKSxcclxuICAgICAgICB2YWx1ZSxcclxuICAgICAgfSkpO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdnYW1lcGFkJzoge1xyXG4gICAgICBjb25zdCBsYWJlbE1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICBhdXRvOiAnX2NvbW1vbi5hdXRvJyxcclxuICAgICAgICBkczQ6ICdjb25maWcuZ2FtZXBhZF9kczQnLFxyXG4gICAgICAgIGRzNTogJ2NvbmZpZy5nYW1lcGFkX2RzNScsXHJcbiAgICAgICAgc3dpdGNoOiAnY29uZmlnLmdhbWVwYWRfc3dpdGNoJyxcclxuICAgICAgICB4MzYwOiAnY29uZmlnLmdhbWVwYWRfeDM2MCcsXHJcbiAgICAgICAgeG9uZTogJ2NvbmZpZy5nYW1lcGFkX3hvbmUnLFxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCBwcmlvcml0aXplZEJ5UGxhdGZvcm06IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcclxuICAgICAgICBmcmVlYnNkOiBbJ3N3aXRjaCcsICd4b25lJ10sXHJcbiAgICAgICAgbGludXg6IFsnZHM1JywgJ3hvbmUnLCAnc3dpdGNoJywgJ3gzNjAnXSxcclxuICAgICAgICB3aW5kb3dzOiBbJ3gzNjAnLCAnZHM0J10sXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IGZhbGxiYWNrT3JkZXIgPSBbJ3gzNjAnLCAnZHM1JywgJ2RzNCddO1xyXG5cclxuICAgICAgY29uc3Qgb3B0aW9uczogQ29uZmlnU2VsZWN0T3B0aW9uW10gPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ19jb21tb24uYXV0bycsICdBdXRvJyksIHZhbHVlOiAnYXV0bycgfSxcclxuICAgICAgXTtcclxuICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPihvcHRpb25zLm1hcCgob3B0aW9uKSA9PiBTdHJpbmcob3B0aW9uLnZhbHVlKSkpO1xyXG5cclxuICAgICAgY29uc3QgYWRkT3B0aW9uID0gKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IHtcclxuICAgICAgICBpZiAoIXZhbHVlIHx8IHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGxhYmVsS2V5ID0gbGFiZWxNYXBbdmFsdWVdIHx8IGBjb25maWcuZ2FtZXBhZF8ke3ZhbHVlfWA7XHJcbiAgICAgICAgb3B0aW9ucy5wdXNoKHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsIGxhYmVsS2V5LCB2YWx1ZSksIHZhbHVlIH0pO1xyXG4gICAgICAgIHNlZW4uYWRkKHZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IHBsYXRmb3JtT3JkZXIgPSBwcmlvcml0aXplZEJ5UGxhdGZvcm1bcGxhdGZvcm1dID8/IGZhbGxiYWNrT3JkZXI7XHJcbiAgICAgIHBsYXRmb3JtT3JkZXIuZm9yRWFjaChhZGRPcHRpb24pO1xyXG4gICAgICBpZiAodHlwZW9mIGN0eC5jdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnICYmIGN0eC5jdXJyZW50VmFsdWUgIT09ICdhdXRvJykge1xyXG4gICAgICAgIGFkZE9wdGlvbihjdHguY3VycmVudFZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuICAgIGNhc2UgJ2NhcHR1cmUnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IENvbmZpZ1NlbGVjdE9wdGlvbltdID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmF1dG9kZXRlY3QnLCAnQXV0b2RldGVjdCcpLCB2YWx1ZTogJycgfSxcclxuICAgICAgXTtcclxuICAgICAgaWYgKHBsYXRmb3JtID09PSAnd2luZG93cycpIHtcclxuICAgICAgICBvcHRpb25zLnB1c2goXHJcbiAgICAgICAgICB7IGxhYmVsOiAnV2luZG93cyBHcmFwaGljcyBDYXB0dXJlICh2YXJpYWJsZSknLCB2YWx1ZTogJ3dnYycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdXaW5kb3dzIEdyYXBoaWNzIENhcHR1cmUgKGNvbnN0YW50KScsIHZhbHVlOiAnd2djYycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdEZXNrdG9wIER1cGxpY2F0aW9uIEFQSScsIHZhbHVlOiAnZGR4JyB9LFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09ICdsaW51eCcpIHtcclxuICAgICAgICBvcHRpb25zLnB1c2goXHJcbiAgICAgICAgICB7IGxhYmVsOiAnTnZGQkMnLCB2YWx1ZTogJ252ZmJjJyB9LFxyXG4gICAgICAgICAgeyBsYWJlbDogJ3dscm9vdHMnLCB2YWx1ZTogJ3dscicgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdLTVMnLCB2YWx1ZTogJ2ttcycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdYMTEnLCB2YWx1ZTogJ3gxMScgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ2VuY29kZXInOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IENvbmZpZ1NlbGVjdE9wdGlvbltdID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmF1dG9kZXRlY3QnLCAnQXV0b2RldGVjdCcpLCB2YWx1ZTogJycgfSxcclxuICAgICAgXTtcclxuICAgICAgY29uc3QgeyBoYXNOdmlkaWEsIGhhc0ludGVsLCBoYXNBbWQgfSA9IGdwdUZsYWdzKGN0eC5tZXRhZGF0YSk7XHJcbiAgICAgIGlmIChwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnKSB7XHJcbiAgICAgICAgaWYgKGhhc052aWRpYSkgb3B0aW9ucy5wdXNoKHsgbGFiZWw6ICdOVklESUEgTlZFTkMnLCB2YWx1ZTogJ252ZW5jJyB9KTtcclxuICAgICAgICBpZiAoaGFzSW50ZWwpIG9wdGlvbnMucHVzaCh7IGxhYmVsOiAnSW50ZWwgUXVpY2tTeW5jJywgdmFsdWU6ICdxdWlja3N5bmMnIH0pO1xyXG4gICAgICAgIGlmIChoYXNBbWQpIG9wdGlvbnMucHVzaCh7IGxhYmVsOiAnQU1EIEFNRi9WQ0UnLCB2YWx1ZTogJ2FtZHZjZScgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09ICdsaW51eCcpIHtcclxuICAgICAgICBvcHRpb25zLnB1c2goXHJcbiAgICAgICAgICB7IGxhYmVsOiAnTlZJRElBIE5WRU5DJywgdmFsdWU6ICdudmVuYycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdWQS1BUEknLCB2YWx1ZTogJ3ZhYXBpJyB9LFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09ICdtYWNvcycpIHtcclxuICAgICAgICBvcHRpb25zLnB1c2goeyBsYWJlbDogJ1ZpZGVvVG9vbGJveCcsIHZhbHVlOiAndmlkZW90b29sYm94JyB9KTtcclxuICAgICAgfVxyXG4gICAgICBvcHRpb25zLnB1c2goe1xyXG4gICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmVuY29kZXJfc29mdHdhcmUnLCAnU29mdHdhcmUnKSxcclxuICAgICAgICB2YWx1ZTogJ3NvZnR3YXJlJyxcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ252ZW5jX3ByZXNldCc6IHtcclxuICAgICAgY29uc3QgZmFsbGJhY2tFeHRyYTogUmVjb3JkPDEgfCA0IHwgNywgc3RyaW5nPiA9IHtcclxuICAgICAgICAxOiAnKGZhc3Rlc3QsIGRlZmF1bHQpJyxcclxuICAgICAgICA0OiAnKGJhbGFuY2VkIHF1YWxpdHkpJyxcclxuICAgICAgICA3OiAnKHNsb3dlc3QpJyxcclxuICAgICAgfTtcclxuICAgICAgY29uc3QgcHJlc2V0RXh0cmEgPSAoaWQ6IDEgfCA0IHwgNykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxhYmVsS2V5ID0gYGNvbmZpZy5udmVuY19wcmVzZXRfJHtpZH1gO1xyXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZWQgPSB0KGxhYmVsS2V5KTtcclxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlZCAmJiB0cmFuc2xhdGVkICE9PSBsYWJlbEtleSA/IHRyYW5zbGF0ZWQgOiBmYWxsYmFja0V4dHJhW2lkXTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IENvbmZpZ1NlbGVjdE9wdGlvbltdID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IGBQMSAke3ByZXNldEV4dHJhKDEpfWAudHJpbSgpLCB2YWx1ZTogMSB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdQMicsIHZhbHVlOiAyIH0sXHJcbiAgICAgICAgeyBsYWJlbDogJ1AzJywgdmFsdWU6IDMgfSxcclxuICAgICAgICB7IGxhYmVsOiBgUDQgJHtwcmVzZXRFeHRyYSg0KX1gLnRyaW0oKSwgdmFsdWU6IDQgfSxcclxuICAgICAgICB7IGxhYmVsOiAnUDUnLCB2YWx1ZTogNSB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdQNicsIHZhbHVlOiA2IH0sXHJcbiAgICAgICAgeyBsYWJlbDogYFA3ICR7cHJlc2V0RXh0cmEoNyl9YC50cmltKCksIHZhbHVlOiA3IH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ252ZW5jX3R3b3Bhc3MnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcubnZlbmNfdHdvcGFzc19kaXNhYmxlZCcsICdEaXNhYmxlZCcpLFxyXG4gICAgICAgICAgdmFsdWU6ICdkaXNhYmxlZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5udmVuY190d29wYXNzX3F1YXJ0ZXJfcmVzJywgJ1F1YXJ0ZXIgcmVzJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ3F1YXJ0ZXJfcmVzJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLm52ZW5jX3R3b3Bhc3NfZnVsbF9yZXMnLCAnRnVsbCByZXMnKSxcclxuICAgICAgICAgIHZhbHVlOiAnZnVsbF9yZXMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ252ZW5jX3NwbGl0X2VuY29kZSc6XHJcbiAgICBjYXNlICdudmVuY19mb3JjZV9zcGxpdF9lbmNvZGUnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ19jb21tb24uYXV0bycsICdBdXRvJyksIHZhbHVlOiAnYXV0bycgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnX2NvbW1vbi5lbmFibGVkJywgJ0VuYWJsZWQnKSwgdmFsdWU6ICdlbmFibGVkJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmRpc2FibGVkJywgJ0Rpc2FibGVkJyksIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ3Fzdl9wcmVzZXQnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X3ZlcnlmYXN0JywgJ3ZlcnlmYXN0JyksIHZhbHVlOiAndmVyeWZhc3QnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X2Zhc3RlcicsICdmYXN0ZXInKSwgdmFsdWU6ICdmYXN0ZXInIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X2Zhc3QnLCAnZmFzdCcpLCB2YWx1ZTogJ2Zhc3QnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X21lZGl1bScsICdtZWRpdW0nKSwgdmFsdWU6ICdtZWRpdW0nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X3Nsb3cnLCAnc2xvdycpLCB2YWx1ZTogJ3Nsb3cnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X3Nsb3dlcicsICdzbG93ZXInKSwgdmFsdWU6ICdzbG93ZXInIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5xc3ZfcHJlc2V0X3Nsb3dlc3QnLCAnc2xvd2VzdCcpLCB2YWx1ZTogJ3Nsb3dlc3QnIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ3Fzdl9jb2Rlcic6XHJcbiAgICBjYXNlICdhbWRfY29kZXInOlxyXG4gICAgY2FzZSAndnRfY29kZXInOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5mZm1wZWdfYXV0bycsICdBdXRvJyksIHZhbHVlOiAnYXV0bycgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmNvZGVyX2NhYmFjJywgJ0NBQkFDJyksIHZhbHVlOiAnY2FiYWMnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5jb2Rlcl9jYXZsYycsICdDQVZMQycpLCB2YWx1ZTogJ2NhdmxjJyB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdhbWRfdXNhZ2UnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuYW1kX3VzYWdlX3RyYW5zY29kaW5nJywgJ1RyYW5zY29kaW5nJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ3RyYW5zY29kaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuYW1kX3VzYWdlX3dlYmNhbScsICdXZWJjYW0nKSwgdmFsdWU6ICd3ZWJjYW0nIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKFxyXG4gICAgICAgICAgICB0LFxyXG4gICAgICAgICAgICAnY29uZmlnLmFtZF91c2FnZV9sb3dsYXRlbmN5X2hpZ2hfcXVhbGl0eScsXHJcbiAgICAgICAgICAgICdMb3cgbGF0ZW5jeSAoaGlnaCBxdWFsaXR5KScsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgdmFsdWU6ICdsb3dsYXRlbmN5X2hpZ2hfcXVhbGl0eScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5hbWRfdXNhZ2VfbG93bGF0ZW5jeScsICdMb3cgbGF0ZW5jeScpLFxyXG4gICAgICAgICAgdmFsdWU6ICdsb3dsYXRlbmN5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmFtZF91c2FnZV91bHRyYWxvd2xhdGVuY3knLCAnVWx0cmEgbG93IGxhdGVuY3knKSxcclxuICAgICAgICAgIHZhbHVlOiAndWx0cmFsb3dsYXRlbmN5JyxcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdhbWRfcmMnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5hbWRfcmNfY2JyJywgJ0NCUicpLCB2YWx1ZTogJ2NicicgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmFtZF9yY19jcXAnLCAnQ1FQJyksIHZhbHVlOiAnY3FwJyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmFtZF9yY192YnJfbGF0ZW5jeScsICdWQlIgKGxhdGVuY3kpJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ3Zicl9sYXRlbmN5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuYW1kX3JjX3Zicl9wZWFrJywgJ1ZCUiAocGVhayknKSwgdmFsdWU6ICd2YnJfcGVhaycgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnYW1kX3F1YWxpdHknOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5hbWRfcXVhbGl0eV9zcGVlZCcsICdTcGVlZCcpLCB2YWx1ZTogJ3NwZWVkJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuYW1kX3F1YWxpdHlfYmFsYW5jZWQnLCAnQmFsYW5jZWQnKSwgdmFsdWU6ICdiYWxhbmNlZCcgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmFtZF9xdWFsaXR5X3F1YWxpdHknLCAnUXVhbGl0eScpLCB2YWx1ZTogJ3F1YWxpdHknIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ3Z0X3NvZnR3YXJlJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmF1dG8nLCAnQXV0bycpLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ19jb21tb24uZGlzYWJsZWQnLCAnRGlzYWJsZWQnKSwgdmFsdWU6ICdkaXNhYmxlZCcgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLnZ0X3NvZnR3YXJlX2FsbG93ZWQnLCAnQWxsb3dlZCcpLCB2YWx1ZTogJ2FsbG93ZWQnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy52dF9zb2Z0d2FyZV9mb3JjZWQnLCAnRm9yY2VkJyksIHZhbHVlOiAnZm9yY2VkJyB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdzd19wcmVzZXQnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd19wcmVzZXRfdWx0cmFmYXN0JywgJ3VsdHJhZmFzdCcpLCB2YWx1ZTogJ3VsdHJhZmFzdCcgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLnN3X3ByZXNldF9zdXBlcmZhc3QnLCAnc3VwZXJmYXN0JyksIHZhbHVlOiAnc3VwZXJmYXN0JyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuc3dfcHJlc2V0X3ZlcnlmYXN0JywgJ3ZlcnlmYXN0JyksIHZhbHVlOiAndmVyeWZhc3QnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd19wcmVzZXRfZmFzdGVyJywgJ2Zhc3RlcicpLCB2YWx1ZTogJ2Zhc3RlcicgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLnN3X3ByZXNldF9mYXN0JywgJ2Zhc3QnKSwgdmFsdWU6ICdmYXN0JyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuc3dfcHJlc2V0X21lZGl1bScsICdtZWRpdW0nKSwgdmFsdWU6ICdtZWRpdW0nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd19wcmVzZXRfc2xvdycsICdzbG93JyksIHZhbHVlOiAnc2xvdycgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLnN3X3ByZXNldF9zbG93ZXInLCAnc2xvd2VyJyksIHZhbHVlOiAnc2xvd2VyJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuc3dfcHJlc2V0X3ZlcnlzbG93JywgJ3ZlcnlzbG93JyksIHZhbHVlOiAndmVyeXNsb3cnIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ3N3X3R1bmUnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd190dW5lX2ZpbG0nLCAnZmlsbScpLCB2YWx1ZTogJ2ZpbG0nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd190dW5lX2FuaW1hdGlvbicsICdhbmltYXRpb24nKSwgdmFsdWU6ICdhbmltYXRpb24nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd190dW5lX2dyYWluJywgJ2dyYWluJyksIHZhbHVlOiAnZ3JhaW4nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd190dW5lX3N0aWxsaW1hZ2UnLCAnc3RpbGxpbWFnZScpLCB2YWx1ZTogJ3N0aWxsaW1hZ2UnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5zd190dW5lX2Zhc3RkZWNvZGUnLCAnZmFzdGRlY29kZScpLCB2YWx1ZTogJ2Zhc3RkZWNvZGUnIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuc3dfdHVuZV96ZXJvbGF0ZW5jeScsICd6ZXJvbGF0ZW5jeScpLFxyXG4gICAgICAgICAgdmFsdWU6ICd6ZXJvbGF0ZW5jeScsXHJcbiAgICAgICAgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnZnJhbWVfbGltaXRlcl9wcm92aWRlcic6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnZnJhbWVMaW1pdGVyLnByb3ZpZGVyLmF1dG8nLCAnQXV0bycpLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2ZyYW1lTGltaXRlci5wcm92aWRlci5ydHNzJywgJ1JUU1MnKSwgdmFsdWU6ICdydHNzJyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnZnJhbWVMaW1pdGVyLnByb3ZpZGVyLm52Y3AnLCAnTlZJRElBIENvbnRyb2wgUGFuZWwnKSxcclxuICAgICAgICAgIHZhbHVlOiAnbnZpZGlhLWNvbnRyb2wtcGFuZWwnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ3J0c3NfZnJhbWVfbGltaXRfdHlwZSc6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLmtlZXAnLCAnS2VlcCcpLCB2YWx1ZTogJycgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLmFzeW5jJywgJ0FzeW5jJyksIHZhbHVlOiAnYXN5bmMnIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdmcmFtZUxpbWl0ZXIuc3luY0xpbWl0ZXIuZnJvbnQnLCAnRnJvbnQgZWRnZSBzeW5jJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ2Zyb250IGVkZ2Ugc3luYycsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2ZyYW1lTGltaXRlci5zeW5jTGltaXRlci5iYWNrJywgJ0JhY2sgZWRnZSBzeW5jJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ2JhY2sgZWRnZSBzeW5jJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLnJlZmxleCcsICdOVklESUEgUmVmbGV4JyksXHJcbiAgICAgICAgICB2YWx1ZTogJ252aWRpYSByZWZsZXgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHJldHVybiBlbnN1cmVJbmNsdWRlc0N1cnJlbnRWYWx1ZShvcHRpb25zLCBjdHguY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhc2UgJ2RkX2NvbmZpZ3VyYXRpb25fb3B0aW9uJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHsgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdfY29tbW9uLmRpc2FibGVkJywgJ0Rpc2FibGVkJyksIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuZGRfY29uZmlnX3ZlcmlmeV9vbmx5JywgJ1ZlcmlmeSBvbmx5JyksXHJcbiAgICAgICAgICB2YWx1ZTogJ3ZlcmlmeV9vbmx5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmRkX2NvbmZpZ19lbnN1cmVfYWN0aXZlJywgJ0Vuc3VyZSBhY3RpdmUnKSxcclxuICAgICAgICAgIHZhbHVlOiAnZW5zdXJlX2FjdGl2ZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5kZF9jb25maWdfZW5zdXJlX3ByaW1hcnknLCAnRW5zdXJlIHByaW1hcnknKSxcclxuICAgICAgICAgIHZhbHVlOiAnZW5zdXJlX3ByaW1hcnknLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuZGRfY29uZmlnX2Vuc3VyZV9vbmx5X2Rpc3BsYXknLCAnRW5zdXJlIG9ubHkgZGlzcGxheScpLFxyXG4gICAgICAgICAgdmFsdWU6ICdlbnN1cmVfb25seV9kaXNwbGF5JyxcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdkZF9yZXNvbHV0aW9uX29wdGlvbic6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbl9kaXNhYmxlZCcsICdEaXNhYmxlZCcpLFxyXG4gICAgICAgICAgdmFsdWU6ICdkaXNhYmxlZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmRkX3Jlc29sdXRpb25fb3B0aW9uX2F1dG8nLCAnQXV0bycpLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbl9tYW51YWwnLCAnTWFudWFsJyksIHZhbHVlOiAnbWFudWFsJyB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICdkZF9yZWZyZXNoX3JhdGVfb3B0aW9uJzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmRkX3JlZnJlc2hfcmF0ZV9vcHRpb25fZGlzYWJsZWQnLCAnRGlzYWJsZWQnKSxcclxuICAgICAgICAgIHZhbHVlOiAnZGlzYWJsZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy5kZF9yZWZyZXNoX3JhdGVfb3B0aW9uX2F1dG8nLCAnQXV0bycpLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcuZGRfcmVmcmVzaF9yYXRlX29wdGlvbl9tYW51YWwnLCAnTWFudWFsJyksXHJcbiAgICAgICAgICB2YWx1ZTogJ21hbnVhbCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAnZGRfaGRyX29wdGlvbic6IHtcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmRkX2hkcl9vcHRpb25fZGlzYWJsZWQnLCAnRGlzYWJsZWQnKSwgdmFsdWU6ICdkaXNhYmxlZCcgfSxcclxuICAgICAgICB7IGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLmRkX2hkcl9vcHRpb25fYXV0bycsICdBdXRvJyksIHZhbHVlOiAnYXV0bycgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAndmlydHVhbF9kaXNwbGF5X21vZGUnOiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfZGlzYWJsZWQnLCAnRGlzYWJsZWQnKSxcclxuICAgICAgICAgIHZhbHVlOiAnZGlzYWJsZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfcGVyX2NsaWVudCcsICdQZXIgY2xpZW50JyksXHJcbiAgICAgICAgICB2YWx1ZTogJ3Blcl9jbGllbnQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyBsYWJlbDogdHJhbnNsYXRlT3IodCwgJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbW9kZV9zaGFyZWQnLCAnU2hhcmVkJyksIHZhbHVlOiAnc2hhcmVkJyB9LFxyXG4gICAgICBdO1xyXG4gICAgICByZXR1cm4gZW5zdXJlSW5jbHVkZXNDdXJyZW50VmFsdWUob3B0aW9ucywgY3R4LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXNlICd2aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0Jzoge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcih0LCAnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfZXhjbHVzaXZlJywgJ0V4Y2x1c2l2ZScpLFxyXG4gICAgICAgICAgdmFsdWU6ICdleGNsdXNpdmUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKHQsICdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9leHRlbmRlZCcsICdFeHRlbmRlZCcpLFxyXG4gICAgICAgICAgdmFsdWU6ICdleHRlbmRlZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlT3IoXHJcbiAgICAgICAgICAgIHQsXHJcbiAgICAgICAgICAgICdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9leHRlbmRlZF9wcmltYXJ5JyxcclxuICAgICAgICAgICAgJ0V4dGVuZGVkIChwcmltYXJ5KScsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgdmFsdWU6ICdleHRlbmRlZF9wcmltYXJ5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVPcihcclxuICAgICAgICAgICAgdCxcclxuICAgICAgICAgICAgJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4dGVuZGVkX2lzb2xhdGVkJyxcclxuICAgICAgICAgICAgJ0V4dGVuZGVkIChpc29sYXRlZCknLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIHZhbHVlOiAnZXh0ZW5kZWRfaXNvbGF0ZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZU9yKFxyXG4gICAgICAgICAgICB0LFxyXG4gICAgICAgICAgICAnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCcsXHJcbiAgICAgICAgICAgICdFeHRlbmRlZCAocHJpbWFyeSBpc29sYXRlZCknLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIHZhbHVlOiAnZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuIGVuc3VyZUluY2x1ZGVzQ3VycmVudFZhbHVlKG9wdGlvbnMsIGN0eC5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29uZmlnT3B0aW9uc1RleHQob3B0aW9uczogQ29uZmlnU2VsZWN0T3B0aW9uW10pOiBzdHJpbmcge1xyXG4gIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xyXG4gIHJldHVybiBvcHRpb25zXHJcbiAgICAubWFwKChvcHRpb24pID0+IGAke29wdGlvbi5sYWJlbCB8fCAnJ30gJHtTdHJpbmcob3B0aW9uLnZhbHVlID8/ICcnKX1gLnRyaW0oKSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgIC5qb2luKCcgfCAnKTtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGdldENvbmZpZ1NlbGVjdE9wdGlvbnMsXHJcbiAgdHlwZSBDb25maWdTZWxlY3RPcHRpb24sXHJcbiAgdHlwZSBDb25maWdTZWxlY3RPcHRpb25zQ29udGV4dCxcclxufSBmcm9tICcuL2NvbmZpZ1NlbGVjdE9wdGlvbnMnO1xyXG5cclxuZXhwb3J0IHR5cGUgQ29uZmlnRmllbGRLaW5kID0gJ2NoZWNrYm94JyB8ICdzd2l0Y2gnIHwgJ3NlbGVjdCcgfCAnbnVtYmVyJyB8ICdpbnB1dCcgfCAndGV4dGFyZWEnO1xyXG5cclxuZXhwb3J0IHR5cGUgQ29uZmlnRmllbGREZWZpbml0aW9uID0ge1xuICBraW5kOiBDb25maWdGaWVsZEtpbmQ7XG4gIG9wdGlvbnM/OiBDb25maWdTZWxlY3RPcHRpb25bXSB8IHVuZGVmaW5lZDtcbiAgZHVyYXRpb25Vbml0PzogJ3NlY29uZHMnIHwgdW5kZWZpbmVkO1xuICBwbGFjZWhvbGRlcj86IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgY2xlYXJhYmxlPzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgZmlsdGVyYWJsZT86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIG1vbm9zcGFjZT86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGF1dG9zaXplPzogYm9vbGVhbiB8IHsgbWluUm93czogbnVtYmVyOyBtYXhSb3dzOiBudW1iZXIgfSB8IHVuZGVmaW5lZDtcbiAgaW5wdXRtb2RlPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBtaW4/OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIG1heD86IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgc3RlcD86IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgcHJlY2lzaW9uPzogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICBsb2NhbGVQcmVmaXg/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGludmVyc2VWYWx1ZXM/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IHR5cGUgQ29uZmlnRmllbGRTY2hlbWFDb250ZXh0ID0gQ29uZmlnU2VsZWN0T3B0aW9uc0NvbnRleHQgJiB7XG4gIGN1cnJlbnRWYWx1ZT86IHVua25vd247XG4gIGRlZmF1bHRWYWx1ZT86IHVua25vd247XG4gIGtpbmQ/OiBDb25maWdGaWVsZEtpbmQgfCB1bmRlZmluZWQ7XG4gIG9wdGlvbnM/OiBDb25maWdTZWxlY3RPcHRpb25bXSB8IHVuZGVmaW5lZDtcbn07XG5cclxuY29uc3QgU1dJVENIX0tFWVMgPSBuZXcgU2V0PHN0cmluZz4oWydmcmFtZV9saW1pdGVyX2VuYWJsZScsICdmcmFtZV9saW1pdGVyX2Rpc2FibGVfdnN5bmMnXSk7XHJcblxyXG5jb25zdCBOVU1CRVJfRklFTERfT1ZFUlJJREVTOiBSZWNvcmQ8c3RyaW5nLCBQYXJ0aWFsPENvbmZpZ0ZpZWxkRGVmaW5pdGlvbj4+ID0ge1xyXG4gIGZlY19wZXJjZW50YWdlOiB7IHBsYWNlaG9sZGVyOiAnMjAnIH0sXHJcbiAgcXA6IHsgcGxhY2Vob2xkZXI6ICcyOCcgfSxcclxuICBtaW5fdGhyZWFkczogeyBwbGFjZWhvbGRlcjogJzInLCBtaW46IDEgfSxcclxuICBiYWNrX2J1dHRvbl90aW1lb3V0OiB7IHBsYWNlaG9sZGVyOiAnLTEnIH0sXHJcbiAga2V5X3JlcGVhdF9kZWxheTogeyBwbGFjZWhvbGRlcjogJzUwMCcgfSxcclxuICBrZXlfcmVwZWF0X2ZyZXF1ZW5jeTogeyBwbGFjZWhvbGRlcjogJzI0LjknLCBzdGVwOiAwLjEgfSxcclxuICBzZXNzaW9uX3Rva2VuX3R0bF9zZWNvbmRzOiB7IG1pbjogNjAsIHN0ZXA6IDYwLCBwbGFjZWhvbGRlcjogJzg2NDAwJyB9LFxyXG4gIHJlbWVtYmVyX21lX3JlZnJlc2hfdG9rZW5fdHRsX3NlY29uZHM6IHsgbWluOiAzNjAwLCBzdGVwOiAzNjAwLCBwbGFjZWhvbGRlcjogJzYwNDgwMCcgfSxcclxuICB1cGRhdGVfY2hlY2tfaW50ZXJ2YWw6IHsgbWluOiAwLCBzdGVwOiA2MCwgcGxhY2Vob2xkZXI6ICc4NjQwMCcgfSxcclxuICBwb3J0OiB7IG1pbjogMTAyOSwgbWF4OiA2NTUxNCwgcGxhY2Vob2xkZXI6ICc0Nzk4OScgfSxcclxuICBwaW5nX3RpbWVvdXQ6IHsgbWluOiAwLCBzdGVwOiAxMDAsIHBsYWNlaG9sZGVyOiAnMTAwMDAnIH0sXHJcbiAgbWF4X2JpdHJhdGU6IHsgbWluOiAwLCBwbGFjZWhvbGRlcjogJzAnIH0sXHJcbiAgbWluaW11bV9mcHNfdGFyZ2V0OiB7IG1pbjogMCwgbWF4OiAxMDAwLCBwbGFjZWhvbGRlcjogJzAnIH0sXHJcbiAgbnZlbmNfdmJ2X2luY3JlYXNlOiB7IG1pbjogMCwgbWF4OiA0MDAsIHBsYWNlaG9sZGVyOiAnMCcgfSxcclxuICBmcmFtZV9saW1pdGVyX2Zwc19saW1pdDogeyBtaW46IDAsIG1heDogMTAwMCwgc3RlcDogMSwgcHJlY2lzaW9uOiAwLCBwbGFjZWhvbGRlcjogJzAnIH0sXHJcbn07XHJcblxyXG5mdW5jdGlvbiBpc0Zpbml0ZU51bWJlcih2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIG51bWJlciB7XHJcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5mZXJEdXJhdGlvblVuaXQoa2V5OiBzdHJpbmcpOiBDb25maWdGaWVsZERlZmluaXRpb25bJ2R1cmF0aW9uVW5pdCddIHwgdW5kZWZpbmVkIHtcclxuICBpZiAoa2V5ID09PSAndXBkYXRlX2NoZWNrX2ludGVydmFsJykgcmV0dXJuICdzZWNvbmRzJztcclxuICBpZiAoa2V5LmVuZHNXaXRoKCdfc2Vjb25kcycpIHx8IGtleS5lbmRzV2l0aCgnX3NlY3MnKSkgcmV0dXJuICdzZWNvbmRzJztcclxuICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBraW5kU2FtcGxlVmFsdWUoY3R4OiBDb25maWdGaWVsZFNjaGVtYUNvbnRleHQpOiB1bmtub3duIHtcclxuICAvLyBBbmNob3Iga25vd24gY29uZmlnIGZpZWxkcyB0byB0aGVpciBkZWZhdWx0IHR5cGUgc28gdGhlIHJlbmRlcmVkIGNvbnRyb2xcclxuICAvLyBkb2VzIG5vdCBjaGFuZ2Ugd2hpbGUgdGhlIHVzZXIgZWRpdHMgdGhlIHZhbHVlLlxyXG4gIGlmIChjdHguZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjdHguZGVmYXVsdFZhbHVlO1xyXG4gIHJldHVybiBjdHguY3VycmVudFZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0Jvb2xlYW5MaWtlKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgaWYgKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSkgcmV0dXJuIHRydWU7XHJcbiAgaWYgKHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAwKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUudG9Mb3dlckNhc2UoKS50cmltKCk7XHJcbiAgcmV0dXJuIFtcclxuICAgICd0cnVlJyxcclxuICAgICdmYWxzZScsXHJcbiAgICAnMScsXHJcbiAgICAnMCcsXHJcbiAgICAnZW5hYmxlZCcsXHJcbiAgICAnZGlzYWJsZWQnLFxyXG4gICAgJ2VuYWJsZScsXHJcbiAgICAnZGlzYWJsZScsXHJcbiAgICAneWVzJyxcclxuICAgICdubycsXHJcbiAgICAnb24nLFxyXG4gICAgJ29mZicsXHJcbiAgXS5pbmNsdWRlcyhub3JtYWxpemVkKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXR0aWZ5Q29uZmlnS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4ga2V5XHJcbiAgICAuc3BsaXQoJ18nKVxyXG4gICAgLmZpbHRlcihCb29sZWFuKVxyXG4gICAgLm1hcCgocGFydCkgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXHJcbiAgICAuam9pbignICcpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnRmllbGREZWZpbml0aW9uKFxyXG4gIGtleTogc3RyaW5nLFxyXG4gIGN0eDogQ29uZmlnRmllbGRTY2hlbWFDb250ZXh0LFxyXG4pOiBDb25maWdGaWVsZERlZmluaXRpb24ge1xyXG4gIGlmIChjdHgua2luZCkge1xyXG4gICAgY29uc3Qgb3ZlcnJpZGVPcHRpb25zID1cclxuICAgICAgY3R4Lm9wdGlvbnMgPz9cclxuICAgICAgKGN0eC5raW5kID09PSAnc2VsZWN0J1xyXG4gICAgICAgID8gZ2V0Q29uZmlnU2VsZWN0T3B0aW9ucyhrZXksIHtcclxuICAgICAgICAgICAgdDogY3R4LnQsXHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiBjdHgucGxhdGZvcm0sXHJcbiAgICAgICAgICAgIG1ldGFkYXRhOiBjdHgubWV0YWRhdGEsXHJcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTogY3R4LmN1cnJlbnRWYWx1ZSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgOiB1bmRlZmluZWQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGtpbmQ6IGN0eC5raW5kLFxyXG4gICAgICAuLi4oY3R4LmtpbmQgPT09ICdzZWxlY3QnICYmIG92ZXJyaWRlT3B0aW9uc1xyXG4gICAgICAgID8geyBvcHRpb25zOiBvdmVycmlkZU9wdGlvbnMsIGZpbHRlcmFibGU6IHRydWUgfVxyXG4gICAgICAgIDogY3R4LmtpbmQgPT09ICdzZWxlY3QnXHJcbiAgICAgICAgICA/IHsgZmlsdGVyYWJsZTogdHJ1ZSB9XHJcbiAgICAgICAgICA6IHt9KSxcclxuICAgICAgLi4uKGN0eC5raW5kID09PSAnbnVtYmVyJ1xyXG4gICAgICAgID8ge1xyXG4gICAgICAgICAgICAuLi4oTlVNQkVSX0ZJRUxEX09WRVJSSURFU1trZXldID8/IHt9KSxcclxuICAgICAgICAgICAgLi4uKGluZmVyRHVyYXRpb25Vbml0KGtleSkgPyB7IGR1cmF0aW9uVW5pdDogaW5mZXJEdXJhdGlvblVuaXQoa2V5KSB9IDoge30pLFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIDoge30pLFxyXG4gICAgICBsb2NhbGVQcmVmaXg6ICdjb25maWcnLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHNlbGVjdE9wdGlvbnMgPVxyXG4gICAgY3R4Lm9wdGlvbnMgPz9cclxuICAgIGdldENvbmZpZ1NlbGVjdE9wdGlvbnMoa2V5LCB7XHJcbiAgICAgIHQ6IGN0eC50LFxyXG4gICAgICBwbGF0Zm9ybTogY3R4LnBsYXRmb3JtLFxyXG4gICAgICBtZXRhZGF0YTogY3R4Lm1ldGFkYXRhLFxyXG4gICAgICBjdXJyZW50VmFsdWU6IGN0eC5jdXJyZW50VmFsdWUsXHJcbiAgICB9KTtcclxuXHJcbiAgaWYgKHNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAga2luZDogJ3NlbGVjdCcsXHJcbiAgICAgIG9wdGlvbnM6IHNlbGVjdE9wdGlvbnMsXHJcbiAgICAgIGZpbHRlcmFibGU6IHNlbGVjdE9wdGlvbnMubGVuZ3RoID49IDgsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKFNXSVRDSF9LRVlTLmhhcyhrZXkpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBraW5kOiAnc3dpdGNoJyxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBzYW1wbGVWYWx1ZSA9IGtpbmRTYW1wbGVWYWx1ZShjdHgpO1xyXG5cclxuICBpZiAoXHJcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoTlVNQkVSX0ZJRUxEX09WRVJSSURFUywga2V5KSB8fFxyXG4gICAgaXNGaW5pdGVOdW1iZXIoc2FtcGxlVmFsdWUpXHJcbiAgKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBraW5kOiAnbnVtYmVyJyxcclxuICAgICAgLi4uKE5VTUJFUl9GSUVMRF9PVkVSUklERVNba2V5XSA/PyB7fSksXHJcbiAgICAgIC4uLihpbmZlckR1cmF0aW9uVW5pdChrZXkpID8geyBkdXJhdGlvblVuaXQ6IGluZmVyRHVyYXRpb25Vbml0KGtleSkgfSA6IHt9KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAoaXNCb29sZWFuTGlrZShzYW1wbGVWYWx1ZSkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGtpbmQ6ICdjaGVja2JveCcsXHJcbiAgICAgIGxvY2FsZVByZWZpeDogJ2NvbmZpZycsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGtpbmQ6ICdpbnB1dCcsXHJcbiAgfTtcclxufVxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5kZWZpbmVPcHRpb25zKHsgaW5oZXJpdEF0dHJzOiBmYWxzZSB9KTtcclxuXHJcbmltcG9ydCB7IGNvbXB1dGVkLCB1c2VBdHRycyB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICdAL0NoZWNrYm94LnZ1ZSc7XHJcbmltcG9ydCBDb25maWdEdXJhdGlvbkZpZWxkIGZyb20gJ0AvQ29uZmlnRHVyYXRpb25GaWVsZC52dWUnO1xyXG5pbXBvcnQgQ29uZmlnSW5wdXRGaWVsZCBmcm9tICdAL0NvbmZpZ0lucHV0RmllbGQudnVlJztcclxuaW1wb3J0IENvbmZpZ051bWJlckZpZWxkIGZyb20gJ0AvQ29uZmlnTnVtYmVyRmllbGQudnVlJztcclxuaW1wb3J0IENvbmZpZ1NlbGVjdEZpZWxkIGZyb20gJ0AvQ29uZmlnU2VsZWN0RmllbGQudnVlJztcclxuaW1wb3J0IENvbmZpZ1N3aXRjaEZpZWxkIGZyb20gJ0AvQ29uZmlnU3dpdGNoRmllbGQudnVlJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQge1xyXG4gIGdldENvbmZpZ0ZpZWxkRGVmaW5pdGlvbixcclxuICBwcmV0dGlmeUNvbmZpZ0tleSxcclxuICB0eXBlIENvbmZpZ0ZpZWxkU2NoZW1hQ29udGV4dCxcclxuICB0eXBlIENvbmZpZ0ZpZWxkS2luZCxcclxufSBmcm9tICdAL2NvbmZpZ3MvY29uZmlnRmllbGRTY2hlbWEnO1xyXG5pbXBvcnQgdHlwZSB7IENvbmZpZ1NlbGVjdE9wdGlvbiB9IGZyb20gJ0AvY29uZmlncy9jb25maWdTZWxlY3RPcHRpb25zJztcclxuXHJcbmNvbnN0IG1vZGVsID0gZGVmaW5lTW9kZWw8dW5rbm93bj4oeyByZXF1aXJlZDogdHJ1ZSB9KTtcclxuY29uc3QgYXR0cnMgPSB1c2VBdHRycygpO1xyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5cclxuY29uc3QgcHJvcHMgPSBkZWZpbmVQcm9wczx7XHJcbiAgc2V0dGluZ0tleTogc3RyaW5nO1xyXG4gIGxhYmVsPzogc3RyaW5nO1xyXG4gIGRlc2M/OiBzdHJpbmc7XHJcbiAga2luZD86IENvbmZpZ0ZpZWxkS2luZDtcclxuICBzaXplPzogJ3NtYWxsJyB8ICdtZWRpdW0nIHwgJ2xhcmdlJztcclxuICBwbGFjZWhvbGRlcj86IHN0cmluZztcclxuICBvcHRpb25zPzogQ29uZmlnU2VsZWN0T3B0aW9uW107XHJcbiAgZmlsdGVyYWJsZT86IGJvb2xlYW47XHJcbiAgY2xlYXJhYmxlPzogYm9vbGVhbjtcclxuICBtb25vc3BhY2U/OiBib29sZWFuO1xyXG4gIGF1dG9zaXplPzogYm9vbGVhbiB8IHsgbWluUm93czogbnVtYmVyOyBtYXhSb3dzOiBudW1iZXIgfTtcclxuICBpbnB1dG1vZGU/OiBzdHJpbmc7XHJcbiAgbWluPzogbnVtYmVyO1xyXG4gIG1heD86IG51bWJlcjtcclxuICBzdGVwPzogbnVtYmVyO1xyXG4gIHByZWNpc2lvbj86IG51bWJlcjtcclxuICBkZWZhdWx0VmFsdWU/OiB1bmtub3duO1xyXG4gIGludmVyc2VWYWx1ZXM/OiBib29sZWFuO1xyXG4gIGxvY2FsZVByZWZpeD86IHN0cmluZztcclxufT4oKTtcclxuXHJcbmZ1bmN0aW9uIHRyYW5zbGF0ZUxhYmVsKGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCB0cmFuc2xhdGlvbktleSA9IGBjb25maWcuJHtrZXl9YDtcclxuICBjb25zdCB2YWx1ZSA9IHQodHJhbnNsYXRpb25LZXkpO1xyXG4gIGlmICghdmFsdWUgfHwgdmFsdWUgPT09IHRyYW5zbGF0aW9uS2V5KSByZXR1cm4gcHJldHRpZnlDb25maWdLZXkoa2V5KTtcclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyYW5zbGF0ZURlc2Moa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHRyYW5zbGF0aW9uS2V5ID0gYGNvbmZpZy4ke2tleX1fZGVzY2A7XHJcbiAgY29uc3QgdmFsdWUgPSB0KHRyYW5zbGF0aW9uS2V5KTtcclxuICBpZiAoIXZhbHVlIHx8IHZhbHVlID09PSB0cmFuc2xhdGlvbktleSkgcmV0dXJuICcnO1xyXG4gIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuY29uc3QgcGxhdGZvcm0gPSBjb21wdXRlZCgoKSA9PlxyXG4gIFN0cmluZyhzdG9yZS5tZXRhZGF0YT8ucGxhdGZvcm0gfHwgKHN0b3JlLmNvbmZpZyBhcyBhbnkpPy5wbGF0Zm9ybSB8fCAnJykudG9Mb3dlckNhc2UoKSxcclxuKTtcclxuXHJcbmNvbnN0IHJlc29sdmVkRGVmYXVsdFZhbHVlID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChwcm9wcy5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BzLmRlZmF1bHRWYWx1ZTtcclxuICByZXR1cm4gKHN0b3JlLmRlZmF1bHRzIGFzIGFueSk/Lltwcm9wcy5zZXR0aW5nS2V5XTtcclxufSk7XHJcblxyXG5jb25zdCBmaWVsZCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBjb250ZXh0OiBDb25maWdGaWVsZFNjaGVtYUNvbnRleHQgPSB7XHJcbiAgICB0LFxyXG4gICAgcGxhdGZvcm06IHBsYXRmb3JtLnZhbHVlLFxyXG4gICAgbWV0YWRhdGE6IHN0b3JlLm1ldGFkYXRhLFxyXG4gICAgY3VycmVudFZhbHVlOiBtb2RlbC52YWx1ZSxcclxuICB9O1xyXG5cclxuICBpZiAocmVzb2x2ZWREZWZhdWx0VmFsdWUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgY29udGV4dC5kZWZhdWx0VmFsdWUgPSByZXNvbHZlZERlZmF1bHRWYWx1ZS52YWx1ZTtcclxuICB9XHJcbiAgaWYgKHByb3BzLmtpbmQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgY29udGV4dC5raW5kID0gcHJvcHMua2luZDtcclxuICB9XHJcbiAgaWYgKHByb3BzLm9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgY29udGV4dC5vcHRpb25zID0gcHJvcHMub3B0aW9ucztcclxuICB9XHJcblxyXG4gIHJldHVybiBnZXRDb25maWdGaWVsZERlZmluaXRpb24ocHJvcHMuc2V0dGluZ0tleSwgY29udGV4dCk7XHJcbn0pO1xyXG5cclxuY29uc3QgcmVzb2x2ZWRMYWJlbCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgcHJvcHMubGFiZWwgIT09IHVuZGVmaW5lZCA/IHByb3BzLmxhYmVsIDogdHJhbnNsYXRlTGFiZWwocHJvcHMuc2V0dGluZ0tleSksXHJcbik7XHJcbmNvbnN0IHJlc29sdmVkRGVzYyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgcHJvcHMuZGVzYyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuZGVzYyA6IHRyYW5zbGF0ZURlc2MocHJvcHMuc2V0dGluZ0tleSksXHJcbik7XHJcbmNvbnN0IHJlc29sdmVkU2l6ZSA9IGNvbXB1dGVkKCgpID0+IHByb3BzLnNpemUgPz8gJ21lZGl1bScpO1xyXG5jb25zdCByZXNvbHZlZFBsYWNlaG9sZGVyID0gY29tcHV0ZWQoKCkgPT4gcHJvcHMucGxhY2Vob2xkZXIgPz8gZmllbGQudmFsdWUucGxhY2Vob2xkZXIgPz8gJycpO1xyXG5jb25zdCByZXNvbHZlZEZpbHRlcmFibGUgPSBjb21wdXRlZCgoKSA9PiBwcm9wcy5maWx0ZXJhYmxlID8/IGZpZWxkLnZhbHVlLmZpbHRlcmFibGUgPz8gZmFsc2UpO1xyXG5jb25zdCByZXNvbHZlZENsZWFyYWJsZSA9IGNvbXB1dGVkKCgpID0+IHByb3BzLmNsZWFyYWJsZSA/PyBmaWVsZC52YWx1ZS5jbGVhcmFibGUgPz8gZmFsc2UpO1xyXG5jb25zdCByZXNvbHZlZE1vbm9zcGFjZSA9IGNvbXB1dGVkKCgpID0+IHByb3BzLm1vbm9zcGFjZSA/PyBmaWVsZC52YWx1ZS5tb25vc3BhY2UgPz8gZmFsc2UpO1xyXG5jb25zdCByZXNvbHZlZEF1dG9zaXplID0gY29tcHV0ZWQoKCkgPT4gcHJvcHMuYXV0b3NpemUgPz8gZmllbGQudmFsdWUuYXV0b3NpemUgPz8gZmFsc2UpO1xyXG5jb25zdCByZXNvbHZlZElucHV0TW9kZSA9IGNvbXB1dGVkKCgpID0+IHByb3BzLmlucHV0bW9kZSA/PyBmaWVsZC52YWx1ZS5pbnB1dG1vZGUgPz8gJycpO1xyXG5jb25zdCByZXNvbHZlZE1pbiA9IGNvbXB1dGVkKCgpID0+IHByb3BzLm1pbiA/PyBmaWVsZC52YWx1ZS5taW4pO1xyXG5jb25zdCByZXNvbHZlZE1heCA9IGNvbXB1dGVkKCgpID0+IHByb3BzLm1heCA/PyBmaWVsZC52YWx1ZS5tYXgpO1xyXG5jb25zdCByZXNvbHZlZFN0ZXAgPSBjb21wdXRlZCgoKSA9PiBwcm9wcy5zdGVwID8/IGZpZWxkLnZhbHVlLnN0ZXApO1xyXG5jb25zdCByZXNvbHZlZFByZWNpc2lvbiA9IGNvbXB1dGVkKCgpID0+IHByb3BzLnByZWNpc2lvbiA/PyBmaWVsZC52YWx1ZS5wcmVjaXNpb24pO1xyXG5jb25zdCByZXNvbHZlZExvY2FsZVByZWZpeCA9IGNvbXB1dGVkKFxyXG4gICgpID0+IHByb3BzLmxvY2FsZVByZWZpeCA/PyBmaWVsZC52YWx1ZS5sb2NhbGVQcmVmaXggPz8gJ2NvbmZpZycsXHJcbik7XHJcbmNvbnN0IHJlc29sdmVkSW52ZXJzZVZhbHVlcyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IHByb3BzLmludmVyc2VWYWx1ZXMgPz8gZmllbGQudmFsdWUuaW52ZXJzZVZhbHVlcyA/PyBmYWxzZSxcclxuKTtcclxuY29uc3QgcmVzb2x2ZWRPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gcHJvcHMub3B0aW9ucyA/PyBmaWVsZC52YWx1ZS5vcHRpb25zID8/IFtdKTtcclxuY29uc3QgcmVzb2x2ZWROdW1iZXJQcm9wcyA9IGNvbXB1dGVkKCgpID0+ICh7XG4gIC4uLihyZXNvbHZlZE1pbi52YWx1ZSAhPT0gdW5kZWZpbmVkID8geyBtaW46IHJlc29sdmVkTWluLnZhbHVlIH0gOiB7fSksXG4gIC4uLihyZXNvbHZlZE1heC52YWx1ZSAhPT0gdW5kZWZpbmVkID8geyBtYXg6IHJlc29sdmVkTWF4LnZhbHVlIH0gOiB7fSksXG4gIC4uLihyZXNvbHZlZFN0ZXAudmFsdWUgIT09IHVuZGVmaW5lZCA/IHsgc3RlcDogcmVzb2x2ZWRTdGVwLnZhbHVlIH0gOiB7fSksXG4gIC4uLihyZXNvbHZlZFByZWNpc2lvbi52YWx1ZSAhPT0gdW5kZWZpbmVkID8geyBwcmVjaXNpb246IHJlc29sdmVkUHJlY2lzaW9uLnZhbHVlIH0gOiB7fSksXG59KSk7XG5jb25zdCByZXNvbHZlZER1cmF0aW9uUHJvcHMgPSBjb21wdXRlZCgoKSA9PiAoe1xuICAuLi4ocmVzb2x2ZWRNaW4udmFsdWUgIT09IHVuZGVmaW5lZCA/IHsgbWluOiByZXNvbHZlZE1pbi52YWx1ZSB9IDoge30pLFxuICAuLi4ocmVzb2x2ZWRNYXgudmFsdWUgIT09IHVuZGVmaW5lZCA/IHsgbWF4OiByZXNvbHZlZE1heC52YWx1ZSB9IDoge30pLFxufSkpO1xuY29uc3QgbWVyZ2VkRHVyYXRpb25BdHRycyA9IGNvbXB1dGVkKCgpID0+ICh7XG4gIC4uLnJlc29sdmVkRHVyYXRpb25Qcm9wcy52YWx1ZSxcbiAgLi4uYXR0cnMsXG59KSk7XG5jb25zdCBtZXJnZWROdW1iZXJBdHRycyA9IGNvbXB1dGVkKCgpID0+ICh7XG4gIC4uLnJlc29sdmVkTnVtYmVyUHJvcHMudmFsdWUsXG4gIC4uLmF0dHJzLFxufSkpO1xyXG5cclxuY29uc3Qgc3RyaW5nTW9kZWwgPSBjb21wdXRlZDxzdHJpbmc+KHtcclxuICBnZXQoKSB7XHJcbiAgICBpZiAodHlwZW9mIG1vZGVsLnZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIG1vZGVsLnZhbHVlO1xyXG4gICAgaWYgKG1vZGVsLnZhbHVlID09PSBudWxsIHx8IG1vZGVsLnZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiAnJztcclxuICAgIHJldHVybiBTdHJpbmcobW9kZWwudmFsdWUpO1xyXG4gIH0sXHJcbiAgc2V0KHZhbHVlKSB7XHJcbiAgICBtb2RlbC52YWx1ZSA9IHZhbHVlO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgbnVtYmVyTW9kZWwgPSBjb21wdXRlZDxudW1iZXIgfCBudWxsPih7XHJcbiAgZ2V0KCkge1xyXG4gICAgaWYgKHR5cGVvZiBtb2RlbC52YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKG1vZGVsLnZhbHVlKSkgcmV0dXJuIG1vZGVsLnZhbHVlO1xyXG4gICAgaWYgKHR5cGVvZiBtb2RlbC52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyKG1vZGVsLnZhbHVlKTtcclxuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShwYXJzZWQpKSByZXR1cm4gcGFyc2VkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfSxcclxuICBzZXQodmFsdWUpIHtcclxuICAgIG1vZGVsLnZhbHVlID0gdmFsdWU7XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCBzZWxlY3RNb2RlbCA9IGNvbXB1dGVkPHN0cmluZyB8IG51bWJlciB8IG51bGw+KHtcclxuICBnZXQoKSB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHR5cGVvZiBtb2RlbC52YWx1ZSA9PT0gJ3N0cmluZycgfHxcclxuICAgICAgKHR5cGVvZiBtb2RlbC52YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKG1vZGVsLnZhbHVlKSlcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gbW9kZWwudmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9LFxyXG4gIHNldCh2YWx1ZSkge1xyXG4gICAgbW9kZWwudmFsdWUgPSB2YWx1ZTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IHN3aXRjaE1vZGVsID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldCgpIHtcclxuICAgIHJldHVybiBCb29sZWFuKG1vZGVsLnZhbHVlKTtcclxuICB9LFxyXG4gIHNldCh2YWx1ZSkge1xyXG4gICAgbW9kZWwudmFsdWUgPSB2YWx1ZTtcclxuICB9LFxyXG59KTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPENoZWNrYm94XHJcbiAgICB2LWlmPVwiZmllbGQua2luZCA9PT0gJ2NoZWNrYm94J1wiXHJcbiAgICA6aWQ9XCJwcm9wcy5zZXR0aW5nS2V5XCJcclxuICAgIHYtbW9kZWw9XCJtb2RlbFwiXHJcbiAgICA6bGFiZWw9XCJyZXNvbHZlZExhYmVsXCJcclxuICAgIDpkZXNjPVwicmVzb2x2ZWREZXNjXCJcclxuICAgIDpkZWZhdWx0PVwicmVzb2x2ZWREZWZhdWx0VmFsdWVcIlxyXG4gICAgOmxvY2FsZS1wcmVmaXg9XCJyZXNvbHZlZExvY2FsZVByZWZpeFwiXHJcbiAgICA6aW52ZXJzZS12YWx1ZXM9XCJyZXNvbHZlZEludmVyc2VWYWx1ZXNcIlxyXG4gICAgdi1iaW5kPVwiYXR0cnNcIlxyXG4gID5cclxuICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz48c2xvdCBuYW1lPVwiYWN0aW9uc1wiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjbWV0YT48c2xvdCBuYW1lPVwibWV0YVwiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDxzbG90IC8+XHJcbiAgPC9DaGVja2JveD5cclxuXHJcbiAgPENvbmZpZ1N3aXRjaEZpZWxkXHJcbiAgICB2LWVsc2UtaWY9XCJmaWVsZC5raW5kID09PSAnc3dpdGNoJ1wiXHJcbiAgICA6aWQ9XCJwcm9wcy5zZXR0aW5nS2V5XCJcclxuICAgIHYtbW9kZWw9XCJzd2l0Y2hNb2RlbFwiXHJcbiAgICA6bGFiZWw9XCJyZXNvbHZlZExhYmVsXCJcclxuICAgIDpkZXNjPVwicmVzb2x2ZWREZXNjXCJcclxuICAgIDpzaXplPVwicmVzb2x2ZWRTaXplXCJcclxuICAgIHYtYmluZD1cImF0dHJzXCJcclxuICA+XHJcbiAgICA8dGVtcGxhdGUgI2FjdGlvbnM+PHNsb3QgbmFtZT1cImFjdGlvbnNcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI21ldGE+PHNsb3QgbmFtZT1cIm1ldGFcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8c2xvdCAvPlxyXG4gIDwvQ29uZmlnU3dpdGNoRmllbGQ+XHJcblxyXG4gIDxDb25maWdTZWxlY3RGaWVsZFxyXG4gICAgdi1lbHNlLWlmPVwiZmllbGQua2luZCA9PT0gJ3NlbGVjdCdcIlxyXG4gICAgOmlkPVwicHJvcHMuc2V0dGluZ0tleVwiXHJcbiAgICB2LW1vZGVsPVwic2VsZWN0TW9kZWxcIlxyXG4gICAgOmxhYmVsPVwicmVzb2x2ZWRMYWJlbFwiXHJcbiAgICA6ZGVzYz1cInJlc29sdmVkRGVzY1wiXHJcbiAgICA6c2l6ZT1cInJlc29sdmVkU2l6ZVwiXHJcbiAgICA6b3B0aW9ucz1cInJlc29sdmVkT3B0aW9uc1wiXHJcbiAgICA6cGxhY2Vob2xkZXI9XCJyZXNvbHZlZFBsYWNlaG9sZGVyXCJcclxuICAgIDpmaWx0ZXJhYmxlPVwicmVzb2x2ZWRGaWx0ZXJhYmxlXCJcclxuICAgIDpjbGVhcmFibGU9XCJyZXNvbHZlZENsZWFyYWJsZVwiXHJcbiAgICB2LWJpbmQ9XCJhdHRyc1wiXHJcbiAgPlxyXG4gICAgPHRlbXBsYXRlICNhY3Rpb25zPjxzbG90IG5hbWU9XCJhY3Rpb25zXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHRlbXBsYXRlICNtZXRhPjxzbG90IG5hbWU9XCJtZXRhXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHNsb3QgLz5cclxuICA8L0NvbmZpZ1NlbGVjdEZpZWxkPlxyXG5cclxuICA8Q29uZmlnRHVyYXRpb25GaWVsZFxyXG4gICAgdi1lbHNlLWlmPVwiZmllbGQua2luZCA9PT0gJ251bWJlcicgJiYgZmllbGQuZHVyYXRpb25Vbml0ID09PSAnc2Vjb25kcydcIlxyXG4gICAgOmlkPVwicHJvcHMuc2V0dGluZ0tleVwiXHJcbiAgICB2LW1vZGVsPVwibnVtYmVyTW9kZWxcIlxyXG4gICAgOmxhYmVsPVwicmVzb2x2ZWRMYWJlbFwiXG4gICAgOmRlc2M9XCJyZXNvbHZlZERlc2NcIlxuICAgIDpzaXplPVwicmVzb2x2ZWRTaXplXCJcbiAgICB2LWJpbmQ9XCJtZXJnZWREdXJhdGlvbkF0dHJzXCJcbiAgPlxuICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz48c2xvdCBuYW1lPVwiYWN0aW9uc1wiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDx0ZW1wbGF0ZSAjbWV0YT48c2xvdCBuYW1lPVwibWV0YVwiIC8+PC90ZW1wbGF0ZT5cclxuICAgIDxzbG90IC8+XHJcbiAgPC9Db25maWdEdXJhdGlvbkZpZWxkPlxyXG5cclxuICA8Q29uZmlnTnVtYmVyRmllbGRcclxuICAgIHYtZWxzZS1pZj1cImZpZWxkLmtpbmQgPT09ICdudW1iZXInXCJcclxuICAgIDppZD1cInByb3BzLnNldHRpbmdLZXlcIlxyXG4gICAgdi1tb2RlbD1cIm51bWJlck1vZGVsXCJcclxuICAgIDpsYWJlbD1cInJlc29sdmVkTGFiZWxcIlxyXG4gICAgOmRlc2M9XCJyZXNvbHZlZERlc2NcIlxyXG4gICAgOnNpemU9XCJyZXNvbHZlZFNpemVcIlxyXG4gICAgOnBsYWNlaG9sZGVyPVwicmVzb2x2ZWRQbGFjZWhvbGRlclwiXHJcbiAgICB2LWJpbmQ9XCJtZXJnZWROdW1iZXJBdHRyc1wiXHJcbiAgPlxyXG4gICAgPHRlbXBsYXRlICNhY3Rpb25zPjxzbG90IG5hbWU9XCJhY3Rpb25zXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHRlbXBsYXRlICNtZXRhPjxzbG90IG5hbWU9XCJtZXRhXCIgLz48L3RlbXBsYXRlPlxyXG4gICAgPHNsb3QgLz5cclxuICA8L0NvbmZpZ051bWJlckZpZWxkPlxyXG5cclxuICA8Q29uZmlnSW5wdXRGaWVsZFxyXG4gICAgdi1lbHNlXHJcbiAgICA6aWQ9XCJwcm9wcy5zZXR0aW5nS2V5XCJcclxuICAgIHYtbW9kZWw9XCJzdHJpbmdNb2RlbFwiXHJcbiAgICA6bGFiZWw9XCJyZXNvbHZlZExhYmVsXCJcclxuICAgIDpkZXNjPVwicmVzb2x2ZWREZXNjXCJcclxuICAgIDpzaXplPVwicmVzb2x2ZWRTaXplXCJcclxuICAgIDp0eXBlPVwiZmllbGQua2luZCA9PT0gJ3RleHRhcmVhJyA/ICd0ZXh0YXJlYScgOiAndGV4dCdcIlxyXG4gICAgOnBsYWNlaG9sZGVyPVwicmVzb2x2ZWRQbGFjZWhvbGRlclwiXHJcbiAgICA6Y2xlYXJhYmxlPVwicmVzb2x2ZWRDbGVhcmFibGVcIlxyXG4gICAgOm1vbm9zcGFjZT1cInJlc29sdmVkTW9ub3NwYWNlXCJcclxuICAgIDphdXRvc2l6ZT1cInJlc29sdmVkQXV0b3NpemVcIlxyXG4gICAgOmlucHV0bW9kZT1cInJlc29sdmVkSW5wdXRNb2RlXCJcclxuICAgIHYtYmluZD1cImF0dHJzXCJcclxuICA+XHJcbiAgICA8dGVtcGxhdGUgI2FjdGlvbnM+PHNsb3QgbmFtZT1cImFjdGlvbnNcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI21ldGE+PHNsb3QgbmFtZT1cIm1ldGFcIiAvPjwvdGVtcGxhdGU+XHJcbiAgICA8c2xvdCAvPlxyXG4gIDwvQ29uZmlnSW5wdXRGaWVsZD5cclxuPC90ZW1wbGF0ZT5cclxuIl0sIm5hbWVzIjpbIl91c2VNb2RlbCIsIl91c2VTbG90cyIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2hvaXN0ZWRfMiIsIl9ob2lzdGVkXzMiLCJfaG9pc3RlZF80IiwiX2NyZWF0ZVZOb2RlIiwiX3VucmVmIiwiX2hvaXN0ZWRfNSIsIiR0IiwiX2hvaXN0ZWRfNiIsIl9vcGVuQmxvY2siLCJfaG9pc3RlZF83IiwiX3JlbmRlclNsb3QiLCJfaG9pc3RlZF84IiwiX2hvaXN0ZWRfMSIsIl90b0Rpc3BsYXlTdHJpbmciLCIkc2xvdHMiLCJfY3JlYXRlQmxvY2siLCJfbWVyZ2VQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7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
