import { k as defineComponent, $ as storeToRefs, c as computed, O as createElementBlock, U as createVNode, Z as unref, F as Fragment, a1 as renderList, V as createBaseVNode, P as toDisplayString, W as createCommentVNode, S as withCtx, M as createBlock, Q as openBlock, j as createTextVNode, r as ref, H as normalizeClass, R as useI18n, e as reactive, o as onMounted, w as watch, G as onUnmounted, m as h, i as inject, q as renderSlot, b as onBeforeUnmount, z as Transition, s as mergeProps, X as withModifiers, Y as withKeys, E as markRaw, _ as useRoute, a5 as useRouter, n as nextTick, l as withDirectives, v as vShow, N as resolveDynamicComponent } from "./vue-core-de07660f.js";
import { C as ConfigFieldRenderer, a as Checkbox, b as ConfigInputField, c as ConfigDurationField, d as ConfigSwitchField } from "./ConfigFieldRenderer-f2409336.js";
import { u as useConfigStore, L as LucideIcon, _ as _export_sfc, h as http, a as useAuthStore } from "./index-f3a48eb0.js";
import { aq as NButton, aC as NCard, at as NModal, aD as useNotification, ap as NAlert, aE as NTag, aF as NTooltip, aG as NInputNumber, aH as NSelect, aI as NRadio, aJ as NRadioGroup, aK as NDataTable, an as __unplugin_components_0, aL as NGi, aM as NGrid, aN as NTable, aO as NSwitch, au as useMessage } from "./vendor-33781bfc.js";
const _hoisted_1$j = {
  id: "general",
  class: "config-page"
};
const _hoisted_2$d = ["id"];
const _hoisted_3$d = { class: "block text-sm font-medium mb-1 text-dark dark:text-light" };
const _hoisted_4$c = { class: "text-xs opacity-60 mt-1" };
const _hoisted_5$a = {
  key: 0,
  class: "mt-3 space-y-3"
};
const _hoisted_6$a = { class: "flex items-center justify-between gap-2" };
const _hoisted_7$a = { class: "text-xs opacity-70" };
const _hoisted_8$9 = { class: "flex items-center gap-2" };
const _hoisted_9$9 = { class: "grid grid-cols-1 gap-3" };
const _hoisted_10$9 = { class: "mt-4" };
const _hoisted_11$9 = {
  id: "server_cmd",
  class: "mb-6 flex flex-col"
};
const _hoisted_12$7 = { class: "block text-sm font-medium mb-1 text-dark dark:text-light" };
const _hoisted_13$7 = { class: "text-xs opacity-60 mt-1" };
const _hoisted_14$7 = {
  key: 0,
  class: "mt-3 space-y-3"
};
const _hoisted_15$7 = { class: "flex items-center justify-between gap-2" };
const _hoisted_16$7 = { class: "text-xs opacity-70" };
const _hoisted_17$7 = { class: "flex items-center gap-2" };
const _hoisted_18$7 = { class: "grid grid-cols-1 gap-3" };
const _hoisted_19$7 = { class: "mt-4" };
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "General",
  setup(__props) {
    const store = useConfigStore();
    const { config, metadata } = storeToRefs(store);
    const platform = computed(() => {
      var _a;
      return ((_a = metadata.value) == null ? void 0 : _a.platform) || "";
    });
    const prepCommandSections = [
      {
        key: "global_prep_cmd",
        labelKey: "config.global_prep_cmd",
        descKey: "config.global_prep_cmd_desc"
      },
      {
        key: "global_state_cmd",
        labelKey: "config.global_state_cmd",
        descKey: "config.global_state_cmd_desc"
      }
    ];
    function prepCommands(key) {
      var _a;
      const current = (_a = config.value) == null ? void 0 : _a[key];
      return Array.isArray(current) ? current : [];
    }
    function serverCommands() {
      var _a;
      const current = (_a = config.value) == null ? void 0 : _a.server_cmd;
      return Array.isArray(current) ? current : [];
    }
    function markManualDirty() {
      var _a;
      (_a = store.markManualDirty) == null ? void 0 : _a.call(store);
    }
    function addPrepCommand(key) {
      const template = {
        do: "",
        undo: "",
        ...platform.value === "windows" ? { elevated: false } : {}
      };
      const current = prepCommands(key);
      const next = [...current, template];
      store.updateOption(key, next);
      markManualDirty();
    }
    function removePrepCommand(key, index) {
      const current = [...prepCommands(key)];
      if (index < 0 || index >= current.length)
        return;
      current.splice(index, 1);
      store.updateOption(key, current);
      markManualDirty();
    }
    function addServerCommand() {
      const template = {
        name: "",
        cmd: "",
        ...platform.value === "windows" ? { elevated: false } : {}
      };
      const next = [...serverCommands(), template];
      store.updateOption("server_cmd", next);
      markManualDirty();
    }
    function removeServerCommand(index) {
      const current = [...serverCommands()];
      if (index < 0 || index >= current.length)
        return;
      current.splice(index, 1);
      store.updateOption("server_cmd", current);
      markManualDirty();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$j, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "locale",
          modelValue: unref(config).locale,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).locale = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "sunshine_name",
          modelValue: unref(config).sunshine_name,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).sunshine_name = $event),
          class: "mb-6",
          placeholder: "Vibeshine"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "min_log_level",
          modelValue: unref(config).min_log_level,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).min_log_level = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        (openBlock(), createElementBlock(
          Fragment,
          null,
          renderList(prepCommandSections, (section) => {
            return createBaseVNode("div", {
              id: section.key,
              key: section.key,
              class: "mb-6 flex flex-col"
            }, [
              createBaseVNode(
                "label",
                _hoisted_3$d,
                toDisplayString(_ctx.$t(section.labelKey)),
                1
                /* TEXT */
              ),
              createBaseVNode(
                "div",
                _hoisted_4$c,
                toDisplayString(_ctx.$t(section.descKey)),
                1
                /* TEXT */
              ),
              prepCommands(section.key).length > 0 ? (openBlock(), createElementBlock("div", _hoisted_5$a, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(prepCommands(section.key), (command, index) => {
                    return openBlock(), createElementBlock("div", {
                      key: index,
                      class: "rounded-md border border-dark/10 dark:border-light/10 p-3 space-y-3"
                    }, [
                      createBaseVNode("div", _hoisted_6$a, [
                        createBaseVNode(
                          "div",
                          _hoisted_7$a,
                          "Step " + toDisplayString(index + 1),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode("div", _hoisted_8$9, [
                          platform.value === "windows" ? (openBlock(), createBlock(Checkbox, {
                            key: 0,
                            id: `${section.key}_elevated_${index}`,
                            modelValue: command.elevated,
                            "onUpdate:modelValue": [
                              ($event) => command.elevated = $event,
                              _cache[3] || (_cache[3] = ($event) => markManualDirty())
                            ],
                            label: _ctx.$t("_common.elevated"),
                            desc: "",
                            class: "mb-0"
                          }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"])) : createCommentVNode("v-if", true),
                          createVNode(unref(NButton), {
                            secondary: "",
                            size: "small",
                            onClick: ($event) => removePrepCommand(section.key, index)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: "fa-trash",
                                size: 14
                              })
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["onClick"]),
                          createVNode(unref(NButton), {
                            primary: "",
                            size: "small",
                            onClick: ($event) => addPrepCommand(section.key)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: "fa-plus",
                                size: 14
                              })
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["onClick"])
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_9$9, [
                        createVNode(ConfigInputField, {
                          id: `${section.key}_do_${index}`,
                          modelValue: command.do,
                          "onUpdate:modelValue": [
                            ($event) => command.do = $event,
                            _cache[4] || (_cache[4] = ($event) => markManualDirty())
                          ],
                          label: _ctx.$t("_common.do_cmd"),
                          desc: "",
                          type: "textarea",
                          monospace: "",
                          autosize: { minRows: 1, maxRows: 3 }
                        }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"]),
                        createVNode(ConfigInputField, {
                          id: `${section.key}_undo_${index}`,
                          modelValue: command.undo,
                          "onUpdate:modelValue": [
                            ($event) => command.undo = $event,
                            _cache[5] || (_cache[5] = ($event) => markManualDirty())
                          ],
                          label: _ctx.$t("_common.undo_cmd"),
                          desc: "",
                          type: "textarea",
                          monospace: "",
                          autosize: { minRows: 1, maxRows: 3 }
                        }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"])
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : createCommentVNode("v-if", true),
              createBaseVNode("div", _hoisted_10$9, [
                createVNode(unref(NButton), {
                  primary: "",
                  class: "mx-auto block",
                  onClick: ($event) => addPrepCommand(section.key)
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      " + " + toDisplayString(_ctx.$t("config.add")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 2
                  /* DYNAMIC */
                }, 1032, ["onClick"])
              ])
            ], 8, _hoisted_2$d);
          }),
          64
          /* STABLE_FRAGMENT */
        )),
        createBaseVNode("div", _hoisted_11$9, [
          createBaseVNode(
            "label",
            _hoisted_12$7,
            toDisplayString(_ctx.$t("config.server_cmd")),
            1
            /* TEXT */
          ),
          createBaseVNode(
            "div",
            _hoisted_13$7,
            toDisplayString(_ctx.$t("config.server_cmd_desc")),
            1
            /* TEXT */
          ),
          serverCommands().length > 0 ? (openBlock(), createElementBlock("div", _hoisted_14$7, [
            (openBlock(true), createElementBlock(
              Fragment,
              null,
              renderList(serverCommands(), (command, index) => {
                return openBlock(), createElementBlock("div", {
                  key: index,
                  class: "rounded-md border border-dark/10 dark:border-light/10 p-3 space-y-3"
                }, [
                  createBaseVNode("div", _hoisted_15$7, [
                    createBaseVNode(
                      "div",
                      _hoisted_16$7,
                      "Command " + toDisplayString(index + 1),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_17$7, [
                      platform.value === "windows" ? (openBlock(), createBlock(Checkbox, {
                        key: 0,
                        id: `server_cmd_elevated_${index}`,
                        modelValue: command.elevated,
                        "onUpdate:modelValue": [
                          ($event) => command.elevated = $event,
                          _cache[6] || (_cache[6] = ($event) => markManualDirty())
                        ],
                        label: _ctx.$t("_common.elevated"),
                        desc: "",
                        class: "mb-0"
                      }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"])) : createCommentVNode("v-if", true),
                      createVNode(unref(NButton), {
                        secondary: "",
                        size: "small",
                        onClick: ($event) => removeServerCommand(index)
                      }, {
                        default: withCtx(() => [
                          createVNode(LucideIcon, {
                            name: "fa-trash",
                            size: 14
                          })
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["onClick"]),
                      createVNode(unref(NButton), {
                        primary: "",
                        size: "small",
                        onClick: addServerCommand
                      }, {
                        default: withCtx(() => [
                          createVNode(LucideIcon, {
                            name: "fa-plus",
                            size: 14
                          })
                        ]),
                        _: 1
                        /* STABLE */
                      })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_18$7, [
                    createVNode(ConfigInputField, {
                      id: `server_cmd_name_${index}`,
                      modelValue: command.name,
                      "onUpdate:modelValue": [
                        ($event) => command.name = $event,
                        _cache[7] || (_cache[7] = ($event) => markManualDirty())
                      ],
                      label: _ctx.$t("_common.name"),
                      desc: ""
                    }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"]),
                    createVNode(ConfigInputField, {
                      id: `server_cmd_cmd_${index}`,
                      modelValue: command.cmd,
                      "onUpdate:modelValue": [
                        ($event) => command.cmd = $event,
                        _cache[8] || (_cache[8] = ($event) => markManualDirty())
                      ],
                      label: _ctx.$t("_common.cmd"),
                      desc: "",
                      type: "textarea",
                      monospace: "",
                      autosize: { minRows: 1, maxRows: 3 }
                    }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "label"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : createCommentVNode("v-if", true),
          createBaseVNode("div", _hoisted_19$7, [
            createVNode(unref(NButton), {
              primary: "",
              class: "mx-auto block",
              onClick: addServerCommand
            }, {
              default: withCtx(() => [
                createTextVNode(
                  " + " + toDisplayString(_ctx.$t("config.add")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "enable_pairing",
          modelValue: unref(config).enable_pairing,
          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(config).enable_pairing = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "enable_discovery",
          modelValue: unref(config).enable_discovery,
          "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(config).enable_discovery = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "session_token_ttl_seconds",
          modelValue: unref(config).session_token_ttl_seconds,
          "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(config).session_token_ttl_seconds = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "remember_me_refresh_token_ttl_seconds",
          modelValue: unref(config).remember_me_refresh_token_ttl_seconds,
          "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(config).remember_me_refresh_token_ttl_seconds = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "update_check_interval",
          modelValue: unref(config).update_check_interval,
          "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(config).update_check_interval = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "notify_pre_releases",
          modelValue: unref(config).notify_pre_releases,
          "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(config).notify_pre_releases = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "system_tray",
          modelValue: unref(config).system_tray,
          "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(config).system_tray = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        unref(config).system_tray ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 0,
          "setting-key": "hide_tray_controls",
          modelValue: unref(config).hide_tray_controls,
          "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(config).hide_tray_controls = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true)
      ]);
    };
  }
});
const General = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/General.vue"]]);
const _hoisted_1$i = {
  id: "input",
  class: "config-page"
};
const _hoisted_2$c = {
  key: 0,
  class: "mb-6"
};
const _hoisted_3$c = {
  key: 0,
  class: "mb-3 accordion"
};
const _hoisted_4$b = { class: "accordion-item" };
const _hoisted_5$9 = { class: "accordion-header" };
const _hoisted_6$9 = {
  class: "accordion-button",
  type: "button",
  "data-bs-toggle": "collapse",
  "data-bs-target": "#panelsStayOpen-collapseOne"
};
const _hoisted_7$9 = {
  id: "panelsStayOpen-collapseOne",
  class: "accordion-collapse collapse show",
  "aria-labelledby": "panelsStayOpen-headingOne"
};
const _hoisted_8$8 = { class: "accordion-body" };
const _hoisted_9$8 = {
  key: 2,
  class: "mb-4"
};
const _hoisted_10$8 = {
  key: 4,
  class: "mb-4"
};
const _hoisted_11$8 = {
  key: 5,
  class: "mb-4"
};
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "Inputs",
  setup(__props) {
    const store = useConfigStore();
    const { config, metadata } = storeToRefs(store);
    const platform = computed(
      () => {
        var _a, _b;
        return (((_a = metadata.value) == null ? void 0 : _a.platform) || ((_b = config.value) == null ? void 0 : _b.platform) || "").toLowerCase();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$i, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "controller",
          modelValue: unref(config).controller,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).controller = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        unref(config).controller === "enabled" && platform.value !== "macos" ? (openBlock(), createElementBlock("div", _hoisted_2$c, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "gamepad",
            modelValue: unref(config).gamepad,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).gamepad = $event)
          }, null, 8, ["modelValue"])
        ])) : createCommentVNode("v-if", true),
        unref(config).controller === "enabled" ? (openBlock(), createElementBlock(
          Fragment,
          { key: 1 },
          [
            unref(config).gamepad === "ds4" || unref(config).gamepad === "ds5" || unref(config).gamepad === "auto" && platform.value !== "macos" ? (openBlock(), createElementBlock("div", _hoisted_3$c, [
              createBaseVNode("div", _hoisted_4$b, [
                createBaseVNode("h2", _hoisted_5$9, [
                  createBaseVNode(
                    "button",
                    _hoisted_6$9,
                    toDisplayString(_ctx.$t(
                      unref(config).gamepad === "ds4" ? "config.gamepad_ds4_manual" : unref(config).gamepad === "ds5" ? "config.gamepad_ds5_manual" : "config.gamepad_auto"
                    )),
                    1
                    /* TEXT */
                  )
                ]),
                createBaseVNode("div", _hoisted_7$9, [
                  createBaseVNode("div", _hoisted_8$8, [
                    unref(config).gamepad === "auto" && (platform.value === "windows" || platform.value === "linux") ? (openBlock(), createElementBlock(
                      Fragment,
                      { key: 0 },
                      [
                        createVNode(ConfigFieldRenderer, {
                          "setting-key": "motion_as_ds4",
                          modelValue: unref(config).motion_as_ds4,
                          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).motion_as_ds4 = $event),
                          class: "mb-3"
                        }, null, 8, ["modelValue"]),
                        createVNode(ConfigFieldRenderer, {
                          "setting-key": "touchpad_as_ds4",
                          modelValue: unref(config).touchpad_as_ds4,
                          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).touchpad_as_ds4 = $event),
                          class: "mb-3"
                        }, null, 8, ["modelValue"])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : createCommentVNode("v-if", true),
                    unref(config).gamepad === "ds4" || unref(config).gamepad === "auto" && platform.value === "windows" ? (openBlock(), createBlock(ConfigFieldRenderer, {
                      key: 1,
                      "setting-key": "ds4_back_as_touchpad_click",
                      modelValue: unref(config).ds4_back_as_touchpad_click,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).ds4_back_as_touchpad_click = $event),
                      class: "mb-3"
                    }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
                    unref(config).gamepad === "ds5" || unref(config).gamepad === "auto" && platform.value === "linux" ? (openBlock(), createBlock(ConfigFieldRenderer, {
                      key: 2,
                      "setting-key": "ds5_inputtino_randomize_mac",
                      modelValue: unref(config).ds5_inputtino_randomize_mac,
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).ds5_inputtino_randomize_mac = $event),
                      class: "mb-3"
                    }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true)
                  ])
                ])
              ])
            ])) : createCommentVNode("v-if", true)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : createCommentVNode("v-if", true),
        unref(config).controller === "enabled" ? (openBlock(), createElementBlock("div", _hoisted_9$8, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "back_button_timeout",
            modelValue: unref(config).back_button_timeout,
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).back_button_timeout = $event)
          }, null, 8, ["modelValue"])
        ])) : createCommentVNode("v-if", true),
        unref(config).controller === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 3,
          "setting-key": "forward_rumble",
          modelValue: unref(config).forward_rumble,
          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(config).forward_rumble = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        _cache[17] || (_cache[17] = createBaseVNode(
          "hr",
          null,
          null,
          -1
          /* CACHED */
        )),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "keyboard",
          modelValue: unref(config).keyboard,
          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(config).keyboard = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        unref(config).keyboard === "enabled" && platform.value === "windows" ? (openBlock(), createElementBlock("div", _hoisted_10$8, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "key_repeat_delay",
            modelValue: unref(config).key_repeat_delay,
            "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(config).key_repeat_delay = $event)
          }, null, 8, ["modelValue"])
        ])) : createCommentVNode("v-if", true),
        unref(config).keyboard === "enabled" && platform.value === "windows" ? (openBlock(), createElementBlock("div", _hoisted_11$8, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "key_repeat_frequency",
            modelValue: unref(config).key_repeat_frequency,
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(config).key_repeat_frequency = $event)
          }, null, 8, ["modelValue"])
        ])) : createCommentVNode("v-if", true),
        unref(config).keyboard === "enabled" && platform.value === "windows" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 6,
          "setting-key": "always_send_scancodes",
          modelValue: unref(config).always_send_scancodes,
          "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(config).always_send_scancodes = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        unref(config).keyboard === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 7,
          "setting-key": "key_rightalt_to_key_win",
          modelValue: unref(config).key_rightalt_to_key_win,
          "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(config).key_rightalt_to_key_win = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "mouse",
          modelValue: unref(config).mouse,
          "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(config).mouse = $event),
          class: "mt-5 mb-3"
        }, null, 8, ["modelValue"]),
        unref(config).mouse === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 8,
          "setting-key": "high_resolution_scrolling",
          modelValue: unref(config).high_resolution_scrolling,
          "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(config).high_resolution_scrolling = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        unref(config).mouse === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 9,
          "setting-key": "native_pen_touch",
          modelValue: unref(config).native_pen_touch,
          "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(config).native_pen_touch = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        _cache[18] || (_cache[18] = createBaseVNode(
          "hr",
          null,
          null,
          -1
          /* CACHED */
        )),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "enable_input_only_mode",
          modelValue: unref(config).enable_input_only_mode,
          "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(config).enable_input_only_mode = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const Inputs = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Inputs.vue"]]);
const _hoisted_1$h = {
  id: "network",
  class: "config-page"
};
const _hoisted_2$b = { class: "mb-6" };
const _hoisted_3$b = {
  key: 0,
  class: "mt-2 alert alert-danger p-2 flex items-start gap-2 rounded-md"
};
const _hoisted_4$a = { class: "text-sm" };
const _hoisted_5$8 = {
  key: 1,
  class: "mt-2 alert alert-danger p-2 flex items-start gap-2 rounded-md"
};
const _hoisted_6$8 = { class: "text-sm" };
const _hoisted_7$8 = { class: "mt-4 grid grid-cols-12 gap-2 text-sm" };
const _hoisted_8$7 = { class: "col-span-4 font-semibold" };
const _hoisted_9$7 = { class: "col-span-4 font-semibold" };
const _hoisted_10$7 = { class: "col-span-4 font-semibold" };
const _hoisted_11$7 = { class: "col-span-4" };
const _hoisted_12$6 = { class: "col-span-4" };
const _hoisted_13$6 = { class: "col-span-4" };
const _hoisted_14$6 = { class: "col-span-4" };
const _hoisted_15$6 = { class: "col-span-4" };
const _hoisted_16$6 = {
  key: 0,
  class: "mt-1 alert alert-info p-2 rounded-md"
};
const _hoisted_17$6 = { class: "col-span-4" };
const _hoisted_18$6 = { class: "col-span-4" };
const _hoisted_19$6 = { class: "col-span-4" };
const _hoisted_20$6 = { class: "col-span-4" };
const _hoisted_21$5 = { class: "col-span-4" };
const _hoisted_22$5 = { class: "col-span-4" };
const _hoisted_23$5 = { class: "col-span-4" };
const _hoisted_24$5 = {
  key: 2,
  class: "mt-3 alert alert-warning p-2 flex items-start gap-2 rounded-md"
};
const defaultMoonlightPort = 47989;
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "Network",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    const effectivePort = computed(() => Number(config.port ?? defaultMoonlightPort));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$h, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "upnp",
          modelValue: unref(config).upnp,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).upnp = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "address_family",
          modelValue: unref(config).address_family,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).address_family = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "bind_address",
          modelValue: unref(config)["bind_address"],
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config)["bind_address"] = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createBaseVNode("div", _hoisted_2$b, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "port",
            modelValue: unref(config).port,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).port = $event)
          }, null, 8, ["modelValue"]),
          +effectivePort.value - 5 < 1024 ? (openBlock(), createElementBlock("div", _hoisted_3$b, [
            createVNode(LucideIcon, {
              name: "fa-triangle-exclamation",
              size: 20
            }),
            createBaseVNode(
              "div",
              _hoisted_4$a,
              toDisplayString(_ctx.$t("config.port_alert_1")),
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true),
          +effectivePort.value + 21 > 65535 ? (openBlock(), createElementBlock("div", _hoisted_5$8, [
            createVNode(LucideIcon, {
              name: "fa-triangle-exclamation",
              size: 20
            }),
            createBaseVNode(
              "div",
              _hoisted_6$8,
              toDisplayString(_ctx.$t("config.port_alert_2")),
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true),
          createBaseVNode("div", _hoisted_7$8, [
            createBaseVNode(
              "div",
              _hoisted_8$7,
              toDisplayString(_ctx.$t("config.port_protocol")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_9$7,
              toDisplayString(_ctx.$t("config.port_port")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_10$7,
              toDisplayString(_ctx.$t("config.port_note")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_11$7,
              toDisplayString(_ctx.$t("config.port_tcp")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_12$6,
              toDisplayString(+effectivePort.value - 5),
              1
              /* TEXT */
            ),
            _cache[10] || (_cache[10] = createBaseVNode(
              "div",
              { class: "col-span-4" },
              null,
              -1
              /* CACHED */
            )),
            createBaseVNode(
              "div",
              _hoisted_13$6,
              toDisplayString(_ctx.$t("config.port_tcp")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_14$6,
              toDisplayString(+effectivePort.value),
              1
              /* TEXT */
            ),
            createBaseVNode("div", _hoisted_15$6, [
              +effectivePort.value !== defaultMoonlightPort ? (openBlock(), createElementBlock("div", _hoisted_16$6, [
                createVNode(LucideIcon, {
                  name: "fa-circle-info",
                  size: 20
                }),
                createTextVNode(
                  " " + toDisplayString(_ctx.$t("config.port_http_port_note")),
                  1
                  /* TEXT */
                )
              ])) : createCommentVNode("v-if", true)
            ]),
            createBaseVNode(
              "div",
              _hoisted_17$6,
              toDisplayString(_ctx.$t("config.port_tcp")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_18$6,
              toDisplayString(+effectivePort.value + 1),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_19$6,
              toDisplayString(_ctx.$t("config.port_web_ui")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_20$6,
              toDisplayString(_ctx.$t("config.port_tcp")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_21$5,
              toDisplayString(+effectivePort.value + 21),
              1
              /* TEXT */
            ),
            _cache[11] || (_cache[11] = createBaseVNode(
              "div",
              { class: "col-span-4" },
              null,
              -1
              /* CACHED */
            )),
            createBaseVNode(
              "div",
              _hoisted_22$5,
              toDisplayString(_ctx.$t("config.port_udp")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_23$5,
              toDisplayString(+effectivePort.value + 9) + " - " + toDisplayString(+effectivePort.value + 11),
              1
              /* TEXT */
            ),
            _cache[12] || (_cache[12] = createBaseVNode(
              "div",
              { class: "col-span-4" },
              null,
              -1
              /* CACHED */
            ))
          ]),
          unref(config).origin_web_ui_allowed === "wan" ? (openBlock(), createElementBlock("div", _hoisted_24$5, [
            createVNode(LucideIcon, {
              name: "fa-triangle-exclamation",
              size: 20
            }),
            createTextVNode(
              " " + toDisplayString(_ctx.$t("config.port_warning")),
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true)
        ]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "origin_web_ui_allowed",
          modelValue: unref(config).origin_web_ui_allowed,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).origin_web_ui_allowed = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "external_ip",
          modelValue: unref(config).external_ip,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).external_ip = $event),
          class: "mb-6",
          placeholder: "123.456.789.12"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "lan_encryption_mode",
          modelValue: unref(config).lan_encryption_mode,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).lan_encryption_mode = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "wan_encryption_mode",
          modelValue: unref(config).wan_encryption_mode,
          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(config).wan_encryption_mode = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "ping_timeout",
          modelValue: unref(config).ping_timeout,
          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(config).ping_timeout = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "video_max_batch_size_kb",
          modelValue: unref(config).video_max_batch_size_kb,
          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(config).video_max_batch_size_kb = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const Network = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Network.vue"]]);
const _hoisted_1$g = {
  id: "files",
  class: "config-page"
};
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "Files",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$g, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "file_apps",
          modelValue: unref(config).file_apps,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).file_apps = $event),
          class: "mb-6",
          placeholder: "apps.json"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "credentials_file",
          modelValue: unref(config).credentials_file,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).credentials_file = $event),
          class: "mb-6",
          placeholder: "sunshine_state.json"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "log_path",
          modelValue: unref(config).log_path,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).log_path = $event),
          class: "mb-6",
          placeholder: "sunshine.log"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "pkey",
          modelValue: unref(config).pkey,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).pkey = $event),
          class: "mb-6",
          placeholder: "/dir/pkey.pem"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "cert",
          modelValue: unref(config).cert,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).cert = $event),
          class: "mb-6",
          placeholder: "/dir/cert.pem"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "file_state",
          modelValue: unref(config).file_state,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).file_state = $event),
          class: "mb-6",
          placeholder: "sunshine_state.json"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "vibeshine_file_state",
          modelValue: unref(config).vibeshine_file_state,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).vibeshine_file_state = $event),
          class: "mb-6",
          placeholder: "vibeshine_state.json"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const Files = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Files.vue"]]);
const _hoisted_1$f = { class: "config-page" };
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "Advanced",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "fec_percentage",
          modelValue: unref(config).fec_percentage,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).fec_percentage = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "qp",
          modelValue: unref(config).qp,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).qp = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "min_threads",
          modelValue: unref(config).min_threads,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).min_threads = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "limit_framerate",
          modelValue: unref(config).limit_framerate,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).limit_framerate = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "envvar_compatibility_mode",
          modelValue: unref(config).envvar_compatibility_mode,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).envvar_compatibility_mode = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "legacy_ordering",
          modelValue: unref(config).legacy_ordering,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).legacy_ordering = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "ignore_encoder_probe_failure",
          modelValue: unref(config).ignore_encoder_probe_failure,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).ignore_encoder_probe_failure = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "hevc_mode",
          modelValue: unref(config).hevc_mode,
          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(config).hevc_mode = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "av1_mode",
          modelValue: unref(config).av1_mode,
          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(config).av1_mode = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const Advanced = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Advanced.vue"]]);
const _hoisted_1$e = { class: "inline-flex" };
const _hoisted_2$a = { class: "flex items-center gap-2" };
const _hoisted_3$a = { class: "text-sm" };
const _hoisted_4$9 = { class: "w-full flex items-center justify-center gap-3" };
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "PlayniteReinstallButton",
  props: {
    label: { type: String, required: false },
    icon: { type: String, required: false },
    confirmTitle: { type: String, required: false },
    confirmMessage: { type: String, required: false },
    cancelText: { type: String, required: false },
    continueText: { type: String, required: false },
    size: { type: String, required: false },
    type: { type: String, required: false },
    strong: { type: Boolean, required: false },
    restart: { type: Boolean, required: false }
  },
  emits: ["done"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const show = ref(false);
    const loading = ref(false);
    const label = props.label ?? "Install/Update Playnite Extension";
    const icon = props.icon ?? "fa-plug";
    const confirmTitle = props.confirmTitle ?? "Install/Update Playnite Extension";
    const confirmMessage = props.confirmMessage ?? "This will (re)install the Vibepollo Playnite extension and restart Playnite if needed. Continue?";
    const cancelText = props.cancelText ?? "Cancel";
    const continueText = props.continueText ?? "Continue";
    const size = props.size ?? "small";
    const type = props.type ?? "primary";
    const strong = props.strong ?? true;
    const restart = props.restart ?? true;
    function open() {
      show.value = true;
    }
    async function confirm() {
      if (loading.value)
        return;
      loading.value = true;
      show.value = false;
      let ok = false;
      let body = null;
      let error = "";
      try {
        const r = await http.post("/api/playnite/install", { restart }, { validateStatus: () => true });
        try {
          body = r.data;
        } catch {
        }
        ok = r.status >= 200 && r.status < 300 && body && body.status === true;
        if (!ok) {
          error = body && (body.error || body.message) || `HTTP ${r.status}`;
        }
      } catch (e) {
        error = (e == null ? void 0 : e.message) || "Request failed";
      }
      loading.value = false;
      emit("done", {
        ok,
        data: body,
        ...ok ? {} : { error }
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createVNode(unref(NButton), {
          type: unref(type),
          size: unref(size),
          strong: unref(strong),
          loading: loading.value,
          disabled: loading.value,
          onClick: open
        }, {
          icon: withCtx(() => [
            createVNode(LucideIcon, {
              name: loading.value ? "fa-spinner" : unref(icon),
              class: normalizeClass(loading.value ? "animate-spin" : ""),
              size: 16
            }, null, 8, ["name", "class"])
          ]),
          default: withCtx(() => [
            createBaseVNode(
              "span",
              null,
              toDisplayString(unref(label)),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["type", "size", "strong", "loading", "disabled"]),
        createVNode(unref(NModal), {
          show: show.value,
          "onUpdate:show": _cache[1] || (_cache[1] = (v) => show.value = v)
        }, {
          default: withCtx(() => [
            createVNode(unref(NCard), {
              bordered: false,
              style: { "max-width": "32rem", "width": "100%" }
            }, {
              header: withCtx(() => [
                createBaseVNode("div", _hoisted_2$a, [
                  createVNode(LucideIcon, {
                    name: "fa-plug",
                    size: 16
                  }),
                  createBaseVNode(
                    "span",
                    null,
                    toDisplayString(unref(confirmTitle)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              footer: withCtx(() => [
                createBaseVNode("div", _hoisted_4$9, [
                  createVNode(unref(NButton), {
                    type: "default",
                    strong: "",
                    onClick: _cache[0] || (_cache[0] = ($event) => show.value = false)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        toDisplayString(unref(cancelText)),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createVNode(unref(NButton), {
                    type: "primary",
                    loading: loading.value,
                    onClick: confirm
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        toDisplayString(unref(continueText)),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["loading"])
                ])
              ]),
              default: withCtx(() => [
                createBaseVNode(
                  "div",
                  _hoisted_3$a,
                  toDisplayString(unref(confirmMessage)),
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
        }, 8, ["show"])
      ]);
    };
  }
});
const PlayniteReinstallButton = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/PlayniteReinstallButton.vue"]]);
const _hoisted_1$d = { class: "space-y-8 playnite-tab" };
const _hoisted_2$9 = { key: 1 };
const _hoisted_3$9 = { class: "text-base font-semibold" };
const _hoisted_4$8 = { class: "bg-light/70 dark:bg-surface/70 border border-dark/10 dark:border-light/10 rounded-lg p-4 space-y-4 playnite-card" };
const _hoisted_5$7 = { class: "text-sm grid md:grid-cols-3 gap-3" };
const _hoisted_6$7 = { class: "flex items-center gap-2" };
const _hoisted_7$7 = {
  key: 1,
  class: "text-xs opacity-80"
};
const _hoisted_8$6 = { class: "flex items-center gap-2" };
const _hoisted_9$6 = { class: "ml-2" };
const _hoisted_10$6 = { class: "ml-2" };
const _hoisted_11$6 = {
  key: 2,
  class: "text-sm flex items-center gap-2 inline-info"
};
const _hoisted_12$5 = { class: "shrink-0" };
const _hoisted_13$5 = { class: "text-xs whitespace-nowrap overflow-x-auto px-1 rounded bg-black/5 dark:bg-white/5" };
const _hoisted_14$5 = { class: "ml-1" };
const _hoisted_15$5 = {
  key: 3,
  class: "text-sm flex items-center gap-2 inline-info"
};
const _hoisted_16$5 = { class: "pt-2 border-t border-dark/10 dark:border-light/10 mt-2" };
const _hoisted_17$5 = { class: "flex items-center justify-end gap-2 playnite-actions" };
const _hoisted_18$5 = { class: "ml-2" };
const _hoisted_19$5 = {
  key: 2,
  class: "space-y-6"
};
const _hoisted_20$5 = { class: "text-base font-semibold" };
const _hoisted_21$4 = { class: "bg-light/70 dark:bg-surface/70 border border-dark/10 dark:border-light/10 rounded-lg section-card" };
const _hoisted_22$4 = { class: "px-4 pt-3 pb-2 flex items-baseline justify-between section-header" };
const _hoisted_23$4 = { class: "text-sm font-semibold" };
const _hoisted_24$4 = { class: "ml-1" };
const _hoisted_25$4 = { class: "ml-1" };
const _hoisted_26$4 = { class: "px-4 pb-4 section-body" };
const _hoisted_27$4 = { class: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 items-start" };
const _hoisted_28$4 = {
  key: 0,
  class: "form-text"
};
const _hoisted_29$4 = {
  for: "playnite_recent_games",
  class: "form-label"
};
const _hoisted_30$4 = { class: "form-text" };
const _hoisted_31$4 = {
  for: "playnite_recent_max_age_days",
  class: "form-label"
};
const _hoisted_32$4 = { class: "form-text" };
const _hoisted_33$3 = { class: "md:col-span-1" };
const _hoisted_34$3 = {
  for: "playnite_sync_categories",
  class: "form-label"
};
const _hoisted_35$2 = { class: "form-text" };
const _hoisted_36$2 = {
  for: "playnite_sync_plugins",
  class: "form-label"
};
const _hoisted_37$2 = { class: "form-text" };
const _hoisted_38$2 = { class: "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" };
const _hoisted_39$2 = {
  for: "playnite_autosync_delete_after_days",
  class: "form-label"
};
const _hoisted_40$2 = { class: "form-text" };
const _hoisted_41$2 = {
  class: "form-label",
  for: "playnite_cleanup_policy"
};
const _hoisted_42$2 = { class: "flex flex-col gap-1 text-sm" };
const _hoisted_43$2 = { class: "flex items-center gap-2" };
const _hoisted_44$2 = { class: "flex items-center gap-2" };
const _hoisted_45$2 = { class: "form-text" };
const _hoisted_46$2 = { class: "md:col-span-2" };
const _hoisted_47$2 = {
  key: 0,
  class: "md:col-span-2 form-text"
};
const _hoisted_48$2 = { class: "bg-light/70 dark:bg-surface/70 border border-dark/10 dark:border-light/10 rounded-lg section-card" };
const _hoisted_49$2 = { class: "px-4 pt-3 pb-2 flex items-baseline justify-between section-header" };
const _hoisted_50$1 = { class: "text-sm font-semibold" };
const _hoisted_51$1 = { class: "ml-1" };
const _hoisted_52$1 = { class: "px-4 pb-4 section-body" };
const _hoisted_53$1 = { class: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 items-start" };
const _hoisted_54$1 = { class: "md:col-span-2" };
const _hoisted_55$1 = {
  for: "playnite_focus_attempts",
  class: "form-label"
};
const _hoisted_56$1 = { class: "form-text" };
const _hoisted_57$1 = { class: "md:col-span-2" };
const _hoisted_58$1 = { class: "bg-light/70 dark:bg-surface/70 border border-dark/10 dark:border-light/10 rounded-lg" };
const _hoisted_59$1 = { class: "px-4 pt-3 pb-2 flex items-baseline justify-between" };
const _hoisted_60$1 = { class: "text-sm font-semibold" };
const _hoisted_61$1 = { class: "ml-1" };
const _hoisted_62$1 = { class: "px-4 pb-4" };
const _hoisted_63$1 = { class: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 items-start" };
const _hoisted_64$1 = {
  for: "playnite_exclude_categories",
  class: "form-label"
};
const _hoisted_65$1 = { class: "form-text" };
const _hoisted_66$1 = {
  for: "playnite_exclude_plugins",
  class: "form-label"
};
const _hoisted_67$1 = { class: "form-text" };
const _hoisted_68$1 = { class: "md:col-span-2" };
const _hoisted_69$1 = { class: "flex flex-col gap-2" };
const _hoisted_70$1 = { class: "form-label" };
const _hoisted_71$1 = { class: "text-xs" };
const _hoisted_72$1 = { class: "playnite-exclusions" };
const _hoisted_73$1 = { class: "flex items-center justify-between mb-2" };
const _hoisted_74$1 = { class: "text-sm font-medium" };
const _hoisted_75$1 = { class: "flex items-center gap-2" };
const _hoisted_76$1 = { class: "ml-1" };
const _hoisted_77$1 = { class: "ml-1" };
const _hoisted_78$1 = { class: "text-xs opacity-60" };
const _hoisted_79$1 = { key: 0 };
const _hoisted_80$1 = { key: 1 };
const _hoisted_81$1 = { key: 2 };
const _hoisted_82$1 = { class: "form-text" };
const _hoisted_83$1 = { class: "form-text" };
const _hoisted_84$1 = { class: "flex items-center gap-2" };
const _hoisted_85$1 = { class: "space-y-2 text-sm" };
const _hoisted_86$1 = { class: "w-full flex items-center justify-center gap-3" };
const _hoisted_87$1 = { class: "flex items-center gap-2" };
const _hoisted_88$1 = { class: "text-sm" };
const _hoisted_89$1 = { class: "w-full flex items-center justify-center gap-3" };
const _hoisted_90$1 = { class: "flex items-center gap-2" };
const _hoisted_91$1 = { class: "space-y-2" };
const _hoisted_92 = { class: "text-xs opacity-70" };
const _hoisted_93 = { class: "w-full flex items-center justify-center gap-3" };
const NULL_GUID = "00000000-0000-0000-0000-000000000000";
const GAMES_CACHE_KEY = "playnite_games_cache_v2";
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "Playnite",
  setup(__props) {
    const store = useConfigStore();
    const { config, metadata } = storeToRefs(store);
    const platform = computed(
      () => {
        var _a, _b;
        return (((_a = metadata.value) == null ? void 0 : _a.platform) || ((_b = config.value) == null ? void 0 : _b.platform) || "").toLowerCase();
      }
    );
    const { t } = useI18n();
    const status = reactive({ installed: null, active: false, extensions_dir: "" });
    const launching = ref(false);
    const uninstalling = ref(false);
    const deletingAutosync = ref(false);
    const showUninstallConfirm = ref(false);
    const showDeleteAutosyncConfirm = ref(false);
    const notification = useNotification();
    function notify(type, content) {
      notification.create({ type, content, duration: 5e3 });
    }
    const categoriesLoading = ref(false);
    const pluginsLoading = ref(false);
    const gamesLoading = ref(false);
    const categoryOptions = ref([]);
    const pluginOptions = ref([]);
    const gamesList = ref([]);
    const gamesSource = ref("none");
    const gamesCacheTime = ref(null);
    const transferValue = ref([]);
    function normalizeIdNameEntries(value) {
      if (Array.isArray(value))
        return value;
      if (value && typeof value === "object")
        return [value];
      return [];
    }
    const selectedCategories = computed({
      get() {
        var _a;
        const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_sync_categories);
        return arr.map((o) => o.id || o.name || "").filter(Boolean);
      },
      set(v) {
        const mapByVal = new Map(categoryOptions.value.map((o) => [o.value, o.label]));
        const next = (v || []).map((val) => ({
          id: val && mapByVal.has(val) ? val : "",
          name: mapByVal.get(val) || val
        }));
        store.updateOption("playnite_sync_categories", next);
      }
    });
    const excludedCategories = computed({
      get() {
        var _a;
        const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_exclude_categories);
        return arr.map((o) => o.id || o.name || "").filter(Boolean);
      },
      set(v) {
        const mapByVal = new Map(categoryOptions.value.map((o) => [o.value, o.label]));
        const next = (v || []).map((val) => ({
          id: val && mapByVal.has(val) ? val : "",
          name: mapByVal.get(val) || val
        }));
        store.updateOption("playnite_exclude_categories", next);
      }
    });
    const excludedPlugins = computed({
      get() {
        var _a;
        const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_exclude_plugins);
        return arr.map((o) => o.id || o.name || "").filter(Boolean);
      },
      set(v) {
        const mapByVal = new Map(pluginOptions.value.map((o) => [o.value, o.label]));
        const next = (v || []).map((val) => ({
          id: val && mapByVal.has(val) ? val : "",
          name: mapByVal.get(val) || val
        }));
        store.updateOption("playnite_exclude_plugins", next);
      }
    });
    const includedPlugins = computed({
      get() {
        var _a;
        const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_sync_plugins);
        return arr.map((o) => o.id || o.name || "").filter(Boolean);
      },
      set(v) {
        const mapByVal = new Map(pluginOptions.value.map((o) => [o.value, o.label]));
        const next = (v || []).map((val) => ({
          id: val && mapByVal.has(val) ? val : "",
          name: mapByVal.get(val) || val
        }));
        store.updateOption("playnite_sync_plugins", next);
      }
    });
    const excludedIds = computed({
      get() {
        var _a;
        const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_exclude_games);
        return arr.map((o) => o.id || "").filter(Boolean);
      },
      set(v) {
        const nameById = new Map(gamesList.value.map((g) => [g.id, g.name]));
        const next = (v || []).map((id) => ({ id, name: nameById.get(id) || "" }));
        store.updateOption("playnite_exclude_games", next);
      }
    });
    const excludedDisplayList = computed(() => {
      var _a;
      const arr = normalizeIdNameEntries((_a = config.value) == null ? void 0 : _a.playnite_exclude_games);
      const nameById = new Map(gamesList.value.map((g) => [g.id, g.name]));
      return (arr || []).map(({ id, name }) => ({ id: id || "", name: name || nameById.get(id || "") || "" })).filter((entry) => !!entry.id);
    });
    const limitedConnectivity = computed(() => statusKind.value !== "active");
    const hasCachedGames = computed(
      () => gamesSource.value === "cache" || Array.isArray(gamesList.value) && gamesList.value.length > 0
    );
    const limitedNoCache = computed(() => limitedConnectivity.value && !hasCachedGames.value);
    const limitedWithCache = computed(() => limitedConnectivity.value && hasCachedGames.value);
    computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const g of gamesList.value)
        map.set(g.id, g.name || t("playnite.unknown_game") || "Unknown");
      for (const g of excludedDisplayList.value)
        if (!map.has(g.id))
          map.set(g.id, g.name || t("playnite.unknown_game") || "Unknown");
      const arr = Array.from(map.entries()).map(([value, label]) => ({ value, label }));
      return arr.sort((a, b) => a.label.localeCompare(b.label));
    });
    async function refreshStatus() {
      if (platform.value !== "windows")
        return;
      try {
        const r = await http.get("/api/playnite/status");
        if (r.status === 200 && r.data) {
          const d = r.data;
          status.installed = typeof d.installed === "boolean" ? d.installed : null;
          status.active = !!d.active;
          if (typeof d.playnite_running === "boolean")
            status.playnite_running = !!d.playnite_running;
          status.extensions_dir = d.extensions_dir || "";
          status.plugin_version = d.installed_version || d.plugin_version || d.version || status.plugin_version;
          status.plugin_latest = d.packaged_version || d.plugin_latest || d.latest_version || status.plugin_latest;
        }
      } catch (_) {
      }
    }
    const diagnosticText = computed(() => {
      switch (statusKind.value) {
        case "uninstalled":
          return t("playnite.diagnostic_not_installed") || "Playnite plugin is not installed in the Extensions directory.";
        case "waiting":
          return t("playnite.diagnostic_not_running") || "Playnite is not running. Launch it to resume syncing.";
        case "active":
          return "";
        default:
          return "";
      }
    });
    async function loadCategories() {
      if (platform.value !== "windows")
        return;
      if (categoriesLoading.value || categoryOptions.value.length)
        return;
      categoriesLoading.value = true;
      try {
        try {
          const rc = await http.get("/api/playnite/categories", { validateStatus: () => true });
          if (rc.status >= 200 && rc.status < 300 && Array.isArray(rc.data) && rc.data.length) {
            const cats = rc.data.map((c) => {
              if (c && typeof c === "object") {
                const id = String(c.id || "");
                const name = String(c.name || id);
                return { label: name, value: id || name };
              }
              const s = String(c || "");
              return s ? { label: s, value: s } : null;
            }).filter((x) => !!x).sort((a, b) => a.label.localeCompare(b.label));
            categoryOptions.value = cats;
            categoriesLoading.value = false;
            return;
          }
        } catch {
        }
        const rg = await http.get("/api/playnite/games");
        const games = Array.isArray(rg.data) ? rg.data : [];
        const set = /* @__PURE__ */ new Set();
        for (const g of games)
          for (const c of (g == null ? void 0 : g.categories) || [])
            if (c && typeof c === "string")
              set.add(c);
        categoryOptions.value = Array.from(set).sort((a, b) => a.localeCompare(b)).map((c) => ({ label: c, value: c }));
      } catch (_) {
      }
      categoriesLoading.value = false;
    }
    function ensurePluginOptionsIncludeSelection() {
      var _a, _b;
      const current = pluginOptions.value.slice();
      const byValue = new Map(current.map((o) => [o.value, o]));
      const selected = [
        ...((_a = config.value) == null ? void 0 : _a.playnite_exclude_plugins) || [],
        ...((_b = config.value) == null ? void 0 : _b.playnite_sync_plugins) || []
      ];
      let changed = false;
      for (const entry of selected || []) {
        const value = (entry == null ? void 0 : entry.id) || (entry == null ? void 0 : entry.name) || "";
        if (!value || value === NULL_GUID)
          continue;
        const label = (entry == null ? void 0 : entry.name) || (entry == null ? void 0 : entry.id) || value;
        if (!byValue.has(value)) {
          const option = { value, label };
          current.push(option);
          byValue.set(value, option);
          changed = true;
        } else {
          const existing = byValue.get(value);
          if (existing && !existing.label && label) {
            existing.label = label;
            changed = true;
          }
        }
      }
      if (changed) {
        pluginOptions.value = current.sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    async function loadPlugins() {
      if (platform.value !== "windows")
        return;
      if (pluginsLoading.value || pluginOptions.value.length) {
        ensurePluginOptionsIncludeSelection();
        return;
      }
      pluginsLoading.value = true;
      try {
        const map = /* @__PURE__ */ new Map();
        const ingestGames = (rows) => {
          for (const g of rows) {
            if (!g)
              continue;
            const pid = g.pluginId ? String(g.pluginId) : "";
            const pname = g.pluginName ? String(g.pluginName) : "";
            if (!pid || pid === NULL_GUID)
              continue;
            if (!map.has(pid)) {
              map.set(pid, pname || pid);
            } else if (!map.get(pid) && pname) {
              map.set(pid, pname);
            }
          }
        };
        if (gamesList.value.length) {
          ingestGames(gamesList.value);
        }
        if (!map.size) {
          try {
            const rg = await http.get("/api/playnite/games", { validateStatus: () => true });
            if (rg.status >= 200 && rg.status < 300 && Array.isArray(rg.data)) {
              ingestGames(
                rg.data.map((g) => ({
                  id: String((g == null ? void 0 : g.id) || ""),
                  name: String((g == null ? void 0 : g.name) || (g == null ? void 0 : g.id) || ""),
                  pluginId: (g == null ? void 0 : g.pluginId) ? String(g.pluginId) : "",
                  pluginName: (g == null ? void 0 : g.pluginName) ? String(g.pluginName) : ""
                }))
              );
            }
          } catch {
          }
        }
        const opts = Array.from(map.entries()).map(([value, label]) => ({ value, label: label || value })).sort((a, b) => a.label.localeCompare(b.label));
        pluginOptions.value = opts;
        ensurePluginOptionsIncludeSelection();
      } finally {
        pluginsLoading.value = false;
      }
    }
    function saveGamesCache(list) {
      try {
        const payload = {
          t: Date.now(),
          games: list.map((g) => ({
            id: g.id,
            name: g.name,
            installed: !!g.installed,
            categories: Array.isArray(g.categories) ? g.categories : [],
            pluginId: g.pluginId || "",
            pluginName: g.pluginName || ""
          }))
        };
        localStorage.setItem(GAMES_CACHE_KEY, JSON.stringify(payload));
      } catch {
      }
    }
    function loadGamesCache() {
      try {
        const raw = localStorage.getItem(GAMES_CACHE_KEY);
        if (!raw)
          return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.games))
          return null;
        return {
          t: Number(parsed.t) || Date.now(),
          games: parsed.games.map((g) => ({
            id: String((g == null ? void 0 : g.id) || ""),
            name: String((g == null ? void 0 : g.name) || (g == null ? void 0 : g.id) || ""),
            installed: !!(g == null ? void 0 : g.installed),
            categories: Array.isArray(g == null ? void 0 : g.categories) ? g.categories : [],
            pluginId: (g == null ? void 0 : g.pluginId) ? String(g.pluginId) : "",
            pluginName: (g == null ? void 0 : g.pluginName) ? String(g.pluginName) : ""
          }))
        };
      } catch {
        return null;
      }
    }
    async function loadGames(useCacheFirst = true) {
      if (platform.value !== "windows")
        return;
      if (gamesLoading.value)
        return;
      gamesLoading.value = true;
      if (useCacheFirst) {
        const cached = loadGamesCache();
        if (cached && cached.games.length) {
          gamesList.value = cached.games.slice().sort((a, b) => a.name.localeCompare(b.name));
          gamesSource.value = "cache";
          gamesCacheTime.value = cached.t;
        }
      }
      try {
        const r = await http.get("/api/playnite/games", { validateStatus: () => true });
        if (r.status >= 200 && r.status < 300 && Array.isArray(r.data)) {
          const games = r.data;
          const list = games.filter((g) => !!g.installed).map((g) => ({
            id: String(g.id),
            name: String(g.name || g.id),
            installed: !!g.installed,
            categories: Array.isArray(g.categories) ? g.categories : [],
            pluginId: g.pluginId ? String(g.pluginId) : "",
            pluginName: g.pluginName ? String(g.pluginName) : ""
          })).sort((a, b) => a.name.localeCompare(b.name));
          gamesList.value = list;
          gamesSource.value = "live";
          gamesCacheTime.value = Date.now();
          saveGamesCache(list);
        } else if (gamesSource.value === "none") {
          const cached = loadGamesCache();
          if (cached && cached.games.length) {
            gamesList.value = cached.games.slice().sort((a, b) => a.name.localeCompare(b.name));
            gamesSource.value = "cache";
            gamesCacheTime.value = cached.t;
          } else {
            gamesSource.value = "none";
          }
        }
      } catch (_) {
        if (gamesSource.value === "none") {
          const cached = loadGamesCache();
          if (cached && cached.games.length) {
            gamesList.value = cached.games.slice().sort((a, b) => a.name.localeCompare(b.name));
            gamesSource.value = "cache";
            gamesCacheTime.value = cached.t;
          }
        }
      }
      gamesLoading.value = false;
    }
    async function onReinstallDone(res) {
      if (res.ok) {
        notify("success", t("playnite.install_success") || "Plugin installed successfully.");
        await refreshStatus();
      } else {
        const msg = (t("playnite.install_error") || "Failed to install plugin.") + (res.error ? `: ${res.error}` : "");
        notify("error", msg);
      }
    }
    function openDeleteAutosyncConfirm() {
      showDeleteAutosyncConfirm.value = true;
    }
    async function confirmDeleteAutosync() {
      deletingAutosync.value = true;
      try {
        const r = await http.post("/api/apps/purge_autosync", {}, { validateStatus: () => true });
        let body = null;
        try {
          body = r.data;
        } catch {
        }
        const ok = r.status >= 200 && r.status < 300 && body && body.status === true;
        if (ok) {
          notify(
            "success",
            t("playnite.delete_autosync_success") || "Removed auto-synced Playnite games."
          );
          showDeleteAutosyncConfirm.value = false;
        } else {
          const msg = (t("playnite.delete_autosync_error") || "Failed to delete auto-synced Playnite games.") + ((body == null ? void 0 : body.error) ? `: ${body.error}` : "");
          notify("error", msg);
        }
      } catch (e) {
        const msg = (t("playnite.delete_autosync_error") || "Failed to delete auto-synced Playnite games.") + ((e == null ? void 0 : e.message) ? `: ${e.message}` : "");
        notify("error", msg);
      }
      deletingAutosync.value = false;
    }
    function openUninstallConfirm() {
      showUninstallConfirm.value = true;
    }
    async function confirmUninstall() {
      uninstalling.value = true;
      showUninstallConfirm.value = false;
      try {
        const r = await http.post(
          "/api/playnite/uninstall",
          { restart: true },
          { validateStatus: () => true }
        );
        let ok = false;
        let body = null;
        try {
          body = r.data;
        } catch {
        }
        ok = r.status >= 200 && r.status < 300 && body && body.status === true;
        if (ok) {
          notify(
            "success",
            t("playnite.uninstall_success") || "Plugin uninstalled successfully."
          );
          await refreshStatus();
        } else {
          const msg = (t("playnite.uninstall_error") || "Failed to uninstall plugin.") + (body && body.error ? `: ${body.error}` : "");
          notify("error", msg);
        }
      } catch (e) {
        const msg = (t("playnite.uninstall_error") || "Failed to uninstall plugin.") + ((e == null ? void 0 : e.message) ? `: ${e.message}` : "");
        notify("error", msg);
      }
      uninstalling.value = false;
    }
    onMounted(async () => {
      if (!config.value)
        await store.fetchConfig();
      await refreshStatus();
      loadGames();
      loadCategories();
      loadPlugins();
      ensurePluginOptionsIncludeSelection();
      if (platform.value === "windows") {
        statusTimer.value = window.setInterval(() => {
          refreshStatus();
        }, 3e3);
      }
      transferValue.value = excludedIds.value.slice();
      watch(excludedIds, (v) => {
        transferValue.value = (v || []).slice();
      });
      watch(
        () => {
          var _a;
          return (_a = config.value) == null ? void 0 : _a.playnite_exclude_plugins;
        },
        () => {
          ensurePluginOptionsIncludeSelection();
        },
        { deep: true }
      );
      watch(
        () => {
          var _a;
          return (_a = config.value) == null ? void 0 : _a.playnite_sync_plugins;
        },
        () => {
          ensurePluginOptionsIncludeSelection();
        },
        { deep: true }
      );
    });
    onUnmounted(() => {
      if (statusTimer.value) {
        window.clearInterval(statusTimer.value);
        statusTimer.value = void 0;
      }
    });
    const statusKind = computed(() => {
      if (status.active)
        return "active";
      if (!status.extensions_dir)
        return "unknown";
      if (status.installed === false)
        return "uninstalled";
      if (status.installed === true)
        return "waiting";
      return "unknown";
    });
    const statusType = computed(() => {
      switch (statusKind.value) {
        case "active":
          return "success";
        case "waiting":
          return "warning";
        case "uninstalled":
          return "error";
        case "unknown":
          return "default";
        default:
          return "default";
      }
    });
    const statusText = computed(() => {
      switch (statusKind.value) {
        case "active":
          return t("playnite.status_connected");
        case "waiting":
          return t("playnite.status_waiting");
        case "uninstalled":
          return t("playnite.status_uninstalled");
        case "unknown":
          return t("playnite.status_unknown") || t("playnite.status_not_running_unknown");
        default:
          return "";
      }
    });
    function cmpSemver(a, b) {
      if (!a || !b)
        return 0;
      const na = String(a).replace(/^v/i, "").split(".").map((x) => parseInt(x, 10));
      const nb = String(b).replace(/^v/i, "").split(".").map((x) => parseInt(x, 10));
      const len = Math.max(na.length, nb.length);
      for (let i = 0; i < len; i++) {
        const va = Number.isFinite(na[i]) ? na[i] ?? 0 : 0;
        const vb = Number.isFinite(nb[i]) ? nb[i] ?? 0 : 0;
        if (va < vb)
          return -1;
        if (va > vb)
          return 1;
      }
      return 0;
    }
    const pluginOutdated = computed(() => {
      if (status.installed !== true)
        return false;
      if (!status.plugin_version || !status.plugin_latest)
        return false;
      return cmpSemver(status.plugin_version, status.plugin_latest) < 0;
    });
    const canLaunch = computed(() => {
      return !!(status.extensions_dir && status.installed === true && !status.active);
    });
    const statusTimer = ref();
    const autoSyncEnabled = computed(() => {
      var _a;
      return !!((_a = config.value) == null ? void 0 : _a.playnite_auto_sync);
    });
    const disablePlayniteSelection = computed(() => statusKind.value !== "active");
    const disabledHint = computed(() => {
      return t("playnite.selects_disabled_hint") || "Cannot modify without Playnite connectivity. Start Playnite to continue.";
    });
    function copyExtensionsPath() {
      var _a;
      try {
        if (status.extensions_dir)
          (_a = navigator.clipboard) == null ? void 0 : _a.writeText(status.extensions_dir);
        notify("success", t("playnite.copied_path") || "Copied path to clipboard.");
      } catch {
      }
    }
    const policySummary = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!autoSyncEnabled.value)
        return "";
      const n = Number(((_a = config.value) == null ? void 0 : _a.playnite_recent_games) ?? 0);
      const days = Number(((_b = config.value) == null ? void 0 : _b.playnite_recent_max_age_days) ?? 0);
      const pruneDays = Number(((_c = config.value) == null ? void 0 : _c.playnite_autosync_delete_after_days) ?? 0);
      const keepUntilReplaced = !!((_d = config.value) == null ? void 0 : _d.playnite_autosync_require_replacement);
      const syncAll = !!((_e = config.value) == null ? void 0 : _e.playnite_sync_all_installed);
      const includePluginCount = normalizeIdNameEntries((_f = config.value) == null ? void 0 : _f.playnite_sync_plugins).length;
      const removeUninstalled = ((_g = config.value) == null ? void 0 : _g.playnite_autosync_remove_uninstalled) !== false;
      const parts = [];
      parts.push(
        t("playnite.summary_recent_limit", { n }) || `Up to ${n} most-recently played games will be auto-synced.`
      );
      parts.push(
        days > 0 ? t("playnite.summary_activity_window", { days }) || `Activity window: last ${days} days.` : t("playnite.summary_activity_ignored") || "Activity window is ignored."
      );
      parts.push(
        keepUntilReplaced ? t("playnite.summary_keep_until_replaced") || "Games stay until a newer game replaces them." : t("playnite.summary_prune_immediately") || "Games are pruned when they no longer qualify."
      );
      if (syncAll) {
        parts.push(
          t("playnite.summary_all_installed") || "All installed Playnite games will be kept in Vibepollo."
        );
      } else if (includePluginCount > 0) {
        parts.push(
          t("playnite.summary_plugin_include", { count: includePluginCount }) || `Includes every game from ${includePluginCount} selected library plugins.`
        );
      }
      if (pruneDays > 0) {
        parts.push(
          t("playnite.summary_delete_after", { days: pruneDays }) || `Also remove games never launched after ${pruneDays} days.`
        );
      }
      parts.push(
        removeUninstalled ? t("playnite.summary_remove_uninstalled_on") || "Uninstalled games are removed automatically." : t("playnite.summary_remove_uninstalled_off") || "Uninstalled games remain until removed manually."
      );
      const excluded = (((_h = config.value) == null ? void 0 : _h.playnite_exclude_categories) || []).map((o) => ((o == null ? void 0 : o.name) || (o == null ? void 0 : o.id) || "").toString().trim()).filter(Boolean);
      if (excluded.length) {
        const shown = excluded.slice(0, 3);
        const sample = shown.join(", ");
        const more = excluded.length > shown.length ? excluded.length - shown.length : 0;
        if (more > 0) {
          parts.push(
            t("playnite.summary_excluded_categories_more", {
              categories: sample,
              count: more
            }) || `Excluded categories: ${sample} (+${more} more).`
          );
        } else {
          parts.push(
            t("playnite.summary_excluded_categories", { categories: sample }) || `Excluded categories: ${sample}.`
          );
        }
      }
      return parts.join(" ");
    });
    async function launchPlaynite() {
      if (platform.value !== "windows" || !canLaunch.value)
        return;
      launching.value = true;
      try {
        await http.post("/api/playnite/launch", {}, { validateStatus: () => true });
        window.setTimeout(() => refreshStatus(), 1e3);
      } catch (_) {
      }
      launching.value = false;
    }
    function handleTransferUpdate(next) {
      const prev = new Set(excludedIds.value);
      const nextSet = new Set(next);
      for (const v of nextSet)
        if (!prev.has(v))
          ;
      for (const v of prev)
        if (!nextSet.has(v))
          ;
      const final = Array.from(nextSet);
      excludedIds.value = final;
      transferValue.value = final;
    }
    function resetAutoSyncSection() {
      const d = store.defaults;
      store.updateOption("playnite_auto_sync", d.playnite_auto_sync);
      store.updateOption("playnite_sync_all_installed", d.playnite_sync_all_installed);
      store.updateOption("playnite_recent_games", d.playnite_recent_games);
      store.updateOption("playnite_recent_max_age_days", d.playnite_recent_max_age_days);
      store.updateOption("playnite_autosync_delete_after_days", d.playnite_autosync_delete_after_days);
      store.updateOption(
        "playnite_autosync_require_replacement",
        d.playnite_autosync_require_replacement
      );
      store.updateOption(
        "playnite_autosync_remove_uninstalled",
        d.playnite_autosync_remove_uninstalled
      );
      store.updateOption("playnite_sync_categories", d.playnite_sync_categories);
      store.updateOption("playnite_sync_plugins", d.playnite_sync_plugins);
      notify("success", t("playnite.reset_done") || "Section reset to defaults.");
    }
    function resetLaunchSection() {
      const d = store.defaults;
      store.updateOption("playnite_focus_attempts", d.playnite_focus_attempts);
      store.updateOption("playnite_focus_timeout_secs", d.playnite_focus_timeout_secs);
      store.updateOption("playnite_focus_exit_on_first", d.playnite_focus_exit_on_first);
      notify("success", t("playnite.reset_done") || "Section reset to defaults.");
    }
    function resetFiltersSection() {
      const d = store.defaults;
      store.updateOption("playnite_exclude_categories", d.playnite_exclude_categories);
      store.updateOption("playnite_exclude_plugins", d.playnite_exclude_plugins);
      store.updateOption("playnite_exclude_games", d.playnite_exclude_games);
      notify("success", t("playnite.reset_done") || "Section reset to defaults.");
    }
    const exclusionsColumns = computed(() => [
      { title: t("playnite.table_game") || "Game", key: "name" },
      {
        title: t("playnite.table_actions") || "Actions",
        key: "actions",
        width: 120,
        render: (row) => h("div", { class: "flex items-center gap-2 justify-end" }, [
          h(
            NButton,
            { type: "error", size: "tiny", strong: true, onClick: () => removeExclusion(row.id) },
            {
              default: () => [
                h(LucideIcon, { name: "fa-trash", size: 14 }),
                h("span", { class: "ml-1" }, t("_common.remove") || "Remove")
              ]
            }
          )
        ])
      }
    ]);
    function removeExclusion(id) {
      const next = transferValue.value.filter((x) => x !== id);
      handleTransferUpdate(next);
    }
    function clearAllExclusions() {
      handleTransferUpdate([]);
    }
    const showAddModal = ref(false);
    const addSelection = ref([]);
    const addOptions = computed(() => {
      const excluded = new Set(excludedIds.value);
      return gamesList.value.filter((g) => !excluded.has(g.id)).map((g) => ({
        label: g.name || t("playnite.unknown_game") || "Unknown",
        value: g.id
      })).sort((a, b) => a.label.localeCompare(b.label));
    });
    function openAddExclusions() {
      addSelection.value = [];
      showAddModal.value = true;
      loadGames();
    }
    function confirmAddExclusions() {
      const merged = Array.from(/* @__PURE__ */ new Set([...transferValue.value, ...addSelection.value]));
      handleTransferUpdate(merged);
      showAddModal.value = false;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        Fragment,
        null,
        [
          createBaseVNode("div", _hoisted_1$d, [
            platform.value && platform.value !== "windows" ? (openBlock(), createBlock(unref(NAlert), {
              key: 0,
              type: "info",
              "show-icon": true
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("playnite.only_windows")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true),
            platform.value === "windows" ? (openBlock(), createElementBlock("section", _hoisted_2$9, [
              createBaseVNode(
                "h3",
                _hoisted_3$9,
                toDisplayString(_ctx.$t("playnite.status_title")),
                1
                /* TEXT */
              ),
              createBaseVNode("div", _hoisted_4$8, [
                createCommentVNode(" Integration is always on; no enable/disable toggle "),
                createBaseVNode("div", _hoisted_5$7, [
                  createBaseVNode("div", _hoisted_6$7, [
                    createBaseVNode(
                      "b",
                      null,
                      toDisplayString(_ctx.$t("playnite.status_overall")),
                      1
                      /* TEXT */
                    ),
                    statusKind.value === "waiting" ? (openBlock(), createBlock(unref(NTooltip), {
                      key: 0,
                      trigger: "hover"
                    }, {
                      trigger: withCtx(() => [
                        createVNode(unref(NTag), {
                          size: "small",
                          type: statusType.value
                        }, {
                          default: withCtx(() => [
                            createTextVNode(
                              toDisplayString(statusText.value),
                              1
                              /* TEXT */
                            )
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["type"])
                      ]),
                      default: withCtx(() => [
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(_ctx.$t("playnite.limited_tooltip")),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    })) : (openBlock(), createBlock(unref(NTag), {
                      key: 1,
                      size: "small",
                      type: statusType.value
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(statusText.value),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["type"]))
                  ])
                ]),
                pluginOutdated.value ? (openBlock(), createBlock(unref(NAlert), {
                  key: 0,
                  type: "warning",
                  "show-icon": true
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("playnite.plugin_outdated", {
                        installed: status.plugin_version || "?",
                        latest: status.plugin_latest || "?"
                      })),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                })) : createCommentVNode("v-if", true),
                diagnosticText.value ? (openBlock(), createElementBlock(
                  "div",
                  _hoisted_7$7,
                  toDisplayString(diagnosticText.value),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true),
                createBaseVNode("div", _hoisted_8$6, [
                  canLaunch.value ? (openBlock(), createBlock(unref(NButton), {
                    key: 0,
                    size: "small",
                    type: "primary",
                    strong: "",
                    loading: launching.value,
                    onClick: launchPlaynite
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:rocket",
                        size: 16
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_9$6,
                        toDisplayString(_ctx.$t("playnite.launch_button") || "Launch Playnite"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["loading"])) : createCommentVNode("v-if", true),
                  createVNode(unref(NButton), {
                    size: "small",
                    type: "primary",
                    strong: "",
                    onClick: refreshStatus
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:refresh",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_10$6,
                        toDisplayString(_ctx.$t("playnite.refresh_status") || "Refresh Status"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                createCommentVNode(" Merged maintenance details "),
                status.extensions_dir ? (openBlock(), createElementBlock("div", _hoisted_11$6, [
                  createBaseVNode(
                    "b",
                    _hoisted_12$5,
                    toDisplayString(_ctx.$t("playnite.extensions_dir")) + ":",
                    1
                    /* TEXT */
                  ),
                  createBaseVNode(
                    "code",
                    _hoisted_13$5,
                    toDisplayString(status.extensions_dir),
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NButton), {
                    size: "tiny",
                    type: "default",
                    strong: "",
                    onClick: copyExtensionsPath
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:clipboard-copy",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_14$5,
                        toDisplayString(_ctx.$t("playnite.copy_path") || "Copy"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])) : createCommentVNode("v-if", true),
                status.plugin_version ? (openBlock(), createElementBlock("div", _hoisted_15$5, [
                  createBaseVNode(
                    "b",
                    null,
                    toDisplayString(_ctx.$t("playnite.plugin_version") || "Plugin") + ":",
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NTag), {
                    size: "small",
                    type: "default"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        "v" + toDisplayString(status.plugin_version),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  status.plugin_latest ? (openBlock(), createElementBlock(
                    Fragment,
                    { key: 0 },
                    [
                      _cache[27] || (_cache[27] = createBaseVNode(
                        "span",
                        { class: "opacity-70" },
                        "→",
                        -1
                        /* CACHED */
                      )),
                      createVNode(unref(NTag), {
                        size: "small",
                        type: pluginOutdated.value ? "warning" : "success"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(
                            "v" + toDisplayString(status.plugin_latest),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 1
                        /* STABLE */
                      }, 8, ["type"])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : createCommentVNode("v-if", true)
                ])) : createCommentVNode("v-if", true),
                createBaseVNode("div", _hoisted_16$5, [
                  createBaseVNode("div", _hoisted_17$5, [
                    status.extensions_dir ? (openBlock(), createBlock(PlayniteReinstallButton, {
                      key: 0,
                      size: "small",
                      strong: true,
                      restart: true,
                      label: status.installed ? pluginOutdated.value ? _ctx.$t("playnite.upgrade_button") || "Upgrade Plugin" : _ctx.$t("playnite.reinstall_button") || _ctx.$t("playnite.repair_button") || "Reinstall Plugin" : _ctx.$t("playnite.install_button") || "Install Plugin",
                      onDone: onReinstallDone
                    }, null, 8, ["label"])) : createCommentVNode("v-if", true),
                    status.extensions_dir && status.installed ? (openBlock(), createBlock(unref(NButton), {
                      key: 1,
                      size: "small",
                      type: "error",
                      strong: "",
                      loading: uninstalling.value,
                      onClick: openUninstallConfirm
                    }, {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: "heroicons-solid:trash",
                          size: 14
                        }),
                        createBaseVNode(
                          "span",
                          _hoisted_18$5,
                          toDisplayString(_ctx.$t("playnite.uninstall_button") || "Uninstall Plugin"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["loading"])) : createCommentVNode("v-if", true)
                  ])
                ])
              ])
            ])) : createCommentVNode("v-if", true),
            platform.value === "windows" ? (openBlock(), createElementBlock("section", _hoisted_19$5, [
              createBaseVNode(
                "h3",
                _hoisted_20$5,
                toDisplayString(_ctx.$t("playnite.settings_title")),
                1
                /* TEXT */
              ),
              createCommentVNode(" Auto-sync card "),
              createBaseVNode("div", _hoisted_21$4, [
                createBaseVNode("div", _hoisted_22$4, [
                  createBaseVNode(
                    "h4",
                    _hoisted_23$4,
                    toDisplayString(_ctx.$t("playnite.section_auto_sync") || "Auto-sync"),
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NButton), {
                    size: "tiny",
                    type: "default",
                    strong: "",
                    onClick: resetAutoSyncSection
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:undo",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_24$4,
                        toDisplayString(_ctx.$t("playnite.reset_defaults") || "Reset to defaults"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createVNode(unref(NButton), {
                    size: "tiny",
                    type: "error",
                    strong: "",
                    loading: deletingAutosync.value,
                    onClick: openDeleteAutosyncConfirm
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:trash",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_25$4,
                        toDisplayString(_ctx.$t("playnite.delete_all_autosync") || "Delete Auto-sync Games"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["loading"])
                ]),
                createBaseVNode("div", _hoisted_26$4, [
                  createBaseVNode("div", _hoisted_27$4, [
                    createBaseVNode("div", null, [
                      createVNode(Checkbox, {
                        modelValue: unref(config).playnite_auto_sync,
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).playnite_auto_sync = $event),
                        id: "playnite_auto_sync",
                        default: unref(store).defaults.playnite_auto_sync,
                        localePrefix: "playnite",
                        label: "playnite.auto_sync",
                        desc: ""
                      }, null, 8, ["modelValue", "default"]),
                      !autoSyncEnabled.value ? (openBlock(), createElementBlock(
                        "div",
                        _hoisted_28$4,
                        toDisplayString(_ctx.$t("playnite.enable_autosync_hint") || "Enable Auto-sync to edit these settings."),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    createBaseVNode("div", null, [
                      createVNode(Checkbox, {
                        modelValue: unref(config).playnite_sync_all_installed,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).playnite_sync_all_installed = $event),
                        id: "playnite_sync_all_installed",
                        default: unref(store).defaults.playnite_sync_all_installed,
                        localePrefix: "playnite",
                        label: "playnite.sync_all_installed",
                        desc: "playnite.sync_all_installed_desc",
                        disabled: !autoSyncEnabled.value
                      }, null, 8, ["modelValue", "default", "disabled"])
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_29$4,
                        toDisplayString(_ctx.$t("playnite.recent_games")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NInputNumber), {
                        id: "playnite_recent_games",
                        value: unref(config).playnite_recent_games,
                        "onUpdate:value": _cache[2] || (_cache[2] = ($event) => unref(config).playnite_recent_games = $event),
                        min: 0,
                        max: 50,
                        "show-button": true,
                        class: "w-32",
                        disabled: !autoSyncEnabled.value
                      }, null, 8, ["value", "disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_30$4,
                        toDisplayString(_ctx.$t("playnite.recent_games_desc")) + " (0 = " + toDisplayString(_ctx.$t("_common.disabled") || "disabled") + ") ",
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_31$4,
                        toDisplayString(_ctx.$t("playnite.recent_max_age_days")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NInputNumber), {
                        id: "playnite_recent_max_age_days",
                        value: unref(config).playnite_recent_max_age_days,
                        "onUpdate:value": _cache[3] || (_cache[3] = ($event) => unref(config).playnite_recent_max_age_days = $event),
                        min: 0,
                        max: 3650,
                        "show-button": true,
                        class: "w-32",
                        disabled: !autoSyncEnabled.value
                      }, null, 8, ["value", "disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_32$4,
                        toDisplayString(_ctx.$t("playnite.recent_max_age_days_desc")) + " (0 = " + toDisplayString(_ctx.$t("_common.disabled") || "disabled") + ") ",
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", _hoisted_33$3, [
                      createBaseVNode(
                        "label",
                        _hoisted_34$3,
                        toDisplayString(_ctx.$t("playnite.sync_categories")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTooltip), {
                        disabled: !disablePlayniteSelection.value && autoSyncEnabled.value,
                        trigger: "hover"
                      }, {
                        trigger: withCtx(() => [
                          createVNode(unref(NSelect), {
                            id: "playnite_sync_categories",
                            value: selectedCategories.value,
                            "onUpdate:value": _cache[4] || (_cache[4] = ($event) => selectedCategories.value = $event),
                            multiple: "",
                            options: categoryOptions.value,
                            filterable: "",
                            tag: "",
                            clearable: "",
                            placeholder: _ctx.$t("playnite.categories_placeholder") || "All categories (default)",
                            loading: categoriesLoading.value,
                            disabled: disablePlayniteSelection.value || !autoSyncEnabled.value,
                            onFocus: _cache[5] || (_cache[5] = () => loadCategories()),
                            class: "w-full"
                          }, null, 8, ["value", "options", "placeholder", "loading", "disabled"])
                        ]),
                        default: withCtx(() => [
                          createBaseVNode(
                            "span",
                            null,
                            toDisplayString(!autoSyncEnabled.value ? _ctx.$t("playnite.enable_autosync_hint") || "Enable Auto-sync to edit these settings." : disabledHint.value),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 1
                        /* STABLE */
                      }, 8, ["disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_35$2,
                        toDisplayString(_ctx.$t("playnite.sync_categories_help")),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_36$2,
                        toDisplayString(_ctx.$t("playnite.sync_plugins") || "Include library plugins"),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTooltip), {
                        disabled: !disablePlayniteSelection.value && autoSyncEnabled.value,
                        trigger: "hover"
                      }, {
                        trigger: withCtx(() => [
                          createVNode(unref(NSelect), {
                            id: "playnite_sync_plugins",
                            value: includedPlugins.value,
                            "onUpdate:value": _cache[6] || (_cache[6] = ($event) => includedPlugins.value = $event),
                            multiple: "",
                            options: pluginOptions.value,
                            filterable: "",
                            clearable: "",
                            placeholder: _ctx.$t("playnite.plugins_include_placeholder") || "Include all games from...",
                            loading: pluginsLoading.value,
                            disabled: disablePlayniteSelection.value || !autoSyncEnabled.value,
                            onFocus: _cache[7] || (_cache[7] = () => loadPlugins()),
                            class: "w-full"
                          }, null, 8, ["value", "options", "placeholder", "loading", "disabled"])
                        ]),
                        default: withCtx(() => [
                          _cache[28] || (_cache[28] = createBaseVNode(
                            "span",
                            null,
                            "{ !autoSyncEnabled ? $t('playnite.enable_autosync_hint') || 'Enable Auto-sync to edit these settings.' : disabledHint }",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        _: 1,
                        __: [28]
                      }, 8, ["disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_37$2,
                        toDisplayString(_ctx.$t("playnite.sync_plugins_help")),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", _hoisted_38$2, [
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "label",
                          _hoisted_39$2,
                          toDisplayString(_ctx.$t("playnite.delete_after_days")),
                          1
                          /* TEXT */
                        ),
                        createVNode(unref(NInputNumber), {
                          id: "playnite_autosync_delete_after_days",
                          value: unref(config).playnite_autosync_delete_after_days,
                          "onUpdate:value": _cache[8] || (_cache[8] = ($event) => unref(config).playnite_autosync_delete_after_days = $event),
                          min: 0,
                          max: 3650,
                          "show-button": true,
                          class: "w-32",
                          disabled: !autoSyncEnabled.value
                        }, null, 8, ["value", "disabled"]),
                        createBaseVNode(
                          "div",
                          _hoisted_40$2,
                          toDisplayString(_ctx.$t("playnite.delete_after_days_desc")) + " (0 = " + toDisplayString(_ctx.$t("_common.disabled") || "disabled") + ") ",
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "label",
                          _hoisted_41$2,
                          toDisplayString(_ctx.$t("playnite.cleanup_policy") || "Cleanup policy"),
                          1
                          /* TEXT */
                        ),
                        createVNode(unref(NRadioGroup), {
                          id: "playnite_cleanup_policy",
                          value: unref(config).playnite_autosync_require_replacement,
                          "onUpdate:value": _cache[9] || (_cache[9] = ($event) => unref(config).playnite_autosync_require_replacement = $event),
                          disabled: !autoSyncEnabled.value
                        }, {
                          default: withCtx(() => [
                            createBaseVNode("div", _hoisted_42$2, [
                              createBaseVNode("label", _hoisted_43$2, [
                                createVNode(unref(NRadio), { value: true }),
                                createBaseVNode(
                                  "span",
                                  null,
                                  toDisplayString(_ctx.$t("playnite.policy_keep_until_replaced") || "Keep until replaced (default)"),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              createBaseVNode("label", _hoisted_44$2, [
                                createVNode(unref(NRadio), { value: false }),
                                createBaseVNode(
                                  "span",
                                  null,
                                  toDisplayString(_ctx.$t("playnite.policy_prune_immediately") || "Always prune games that no longer qualify"),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ])
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["value", "disabled"]),
                        createBaseVNode(
                          "div",
                          _hoisted_45$2,
                          toDisplayString(_ctx.$t("playnite.policy_explainer") || "Choose how Vibepollo removes old auto-synced games."),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", _hoisted_46$2, [
                        createVNode(Checkbox, {
                          modelValue: unref(config).playnite_autosync_remove_uninstalled,
                          "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(config).playnite_autosync_remove_uninstalled = $event),
                          id: "playnite_autosync_remove_uninstalled",
                          default: unref(store).defaults.playnite_autosync_remove_uninstalled,
                          localePrefix: "playnite",
                          label: "playnite.remove_uninstalled",
                          desc: "playnite.remove_uninstalled_desc",
                          disabled: !autoSyncEnabled.value
                        }, null, 8, ["modelValue", "default", "disabled"])
                      ]),
                      autoSyncEnabled.value ? (openBlock(), createElementBlock(
                        "div",
                        _hoisted_47$2,
                        toDisplayString(policySummary.value),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ])
                  ])
                ])
              ]),
              createCommentVNode(" Launch Behavior card "),
              createBaseVNode("div", _hoisted_48$2, [
                createBaseVNode("div", _hoisted_49$2, [
                  createBaseVNode(
                    "h4",
                    _hoisted_50$1,
                    toDisplayString(_ctx.$t("playnite.section_launch_behavior") || "Launch Behavior"),
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NButton), {
                    size: "tiny",
                    type: "default",
                    strong: "",
                    onClick: resetLaunchSection
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:undo",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_51$1,
                        toDisplayString(_ctx.$t("playnite.reset_defaults") || "Reset to defaults"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                createBaseVNode("div", _hoisted_52$1, [
                  createBaseVNode("div", _hoisted_53$1, [
                    createBaseVNode("div", _hoisted_54$1, [
                      createVNode(Checkbox, {
                        modelValue: unref(config).playnite_fullscreen_entry_enabled,
                        "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(config).playnite_fullscreen_entry_enabled = $event),
                        id: "playnite_fullscreen_entry_enabled",
                        default: unref(store).defaults.playnite_fullscreen_entry_enabled,
                        localePrefix: "playnite",
                        label: "Add 'Playnite (Fullscreen)' to Applications",
                        desc: "When enabled, Vibepollo adds a launcher entry that opens Playnite in fullscreen desktop mode."
                      }, null, 8, ["modelValue", "default"])
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_55$1,
                        toDisplayString(_ctx.$t("playnite.focus_attempts") || "Auto-focus attempts"),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NInputNumber), {
                        id: "playnite_focus_attempts",
                        value: unref(config).playnite_focus_attempts,
                        "onUpdate:value": _cache[12] || (_cache[12] = ($event) => unref(config).playnite_focus_attempts = $event),
                        min: 0,
                        max: 30,
                        "show-button": true,
                        class: "w-32"
                      }, null, 8, ["value"]),
                      createBaseVNode(
                        "div",
                        _hoisted_56$1,
                        toDisplayString(_ctx.$t("playnite.focus_attempts_help") || "Number of times to try to bring Playnite windows to the foreground when launching."),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", null, [
                      createVNode(ConfigDurationField, {
                        id: "playnite_focus_timeout_secs",
                        modelValue: unref(config).playnite_focus_timeout_secs,
                        "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(config).playnite_focus_timeout_secs = $event),
                        label: String(_ctx.$t("playnite.focus_timeout_secs") || "Auto-focus timeout window (seconds)"),
                        desc: String(
                          _ctx.$t("playnite.focus_timeout_secs_help") || "How long auto-focus runs while re-applying focus (0 to disable)."
                        ),
                        min: 0,
                        max: 120,
                        size: "small"
                      }, null, 8, ["modelValue", "label", "desc"])
                    ]),
                    createBaseVNode("div", _hoisted_57$1, [
                      createVNode(Checkbox, {
                        modelValue: unref(config).playnite_focus_exit_on_first,
                        "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(config).playnite_focus_exit_on_first = $event),
                        id: "playnite_focus_exit_on_first",
                        default: unref(store).defaults.playnite_focus_exit_on_first,
                        localePrefix: "playnite",
                        label: "playnite.focus_exit_on_first",
                        desc: "playnite.focus_exit_on_first_help"
                      }, null, 8, ["modelValue", "default"])
                    ])
                  ])
                ])
              ]),
              createCommentVNode(" Exclusions & Filters card "),
              createBaseVNode("div", _hoisted_58$1, [
                createBaseVNode("div", _hoisted_59$1, [
                  createBaseVNode(
                    "h4",
                    _hoisted_60$1,
                    toDisplayString(_ctx.$t("playnite.section_exclusions_filters") || "Exclusions & Filters"),
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NButton), {
                    size: "tiny",
                    type: "default",
                    strong: "",
                    onClick: resetFiltersSection
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "heroicons-solid:undo",
                        size: 14
                      }),
                      createBaseVNode(
                        "span",
                        _hoisted_61$1,
                        toDisplayString(_ctx.$t("playnite.reset_defaults") || "Reset to defaults"),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                createBaseVNode("div", _hoisted_62$1, [
                  createBaseVNode("div", _hoisted_63$1, [
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_64$1,
                        toDisplayString(_ctx.$t("playnite.exclude_categories") || "Exclude categories"),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTooltip), {
                        disabled: !disablePlayniteSelection.value && autoSyncEnabled.value,
                        trigger: "hover"
                      }, {
                        trigger: withCtx(() => [
                          createVNode(unref(NSelect), {
                            id: "playnite_exclude_categories",
                            value: excludedCategories.value,
                            "onUpdate:value": _cache[15] || (_cache[15] = ($event) => excludedCategories.value = $event),
                            multiple: "",
                            options: categoryOptions.value,
                            filterable: "",
                            tag: "",
                            clearable: "",
                            placeholder: _ctx.$t("playnite.categories_placeholder") || "All categories (default)",
                            loading: categoriesLoading.value,
                            disabled: disablePlayniteSelection.value || !autoSyncEnabled.value,
                            onFocus: _cache[16] || (_cache[16] = () => loadCategories()),
                            class: "w-full"
                          }, null, 8, ["value", "options", "placeholder", "loading", "disabled"])
                        ]),
                        default: withCtx(() => [
                          _cache[29] || (_cache[29] = createBaseVNode(
                            "span",
                            null,
                            "{ !autoSyncEnabled ? $t('playnite.enable_autosync_hint') || 'Enable Auto-sync to edit these settings.' : disabledHint }",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        _: 1,
                        __: [29]
                      }, 8, ["disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_65$1,
                        toDisplayString(_ctx.$t("playnite.exclude_categories_help") || "Games tagged with these categories will never be auto-synced."),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode(
                        "label",
                        _hoisted_66$1,
                        toDisplayString(_ctx.$t("playnite.exclude_plugins") || "Exclude library plugins"),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTooltip), {
                        disabled: !disablePlayniteSelection.value && autoSyncEnabled.value,
                        trigger: "hover"
                      }, {
                        trigger: withCtx(() => [
                          createVNode(unref(NSelect), {
                            id: "playnite_exclude_plugins",
                            value: excludedPlugins.value,
                            "onUpdate:value": _cache[17] || (_cache[17] = ($event) => excludedPlugins.value = $event),
                            multiple: "",
                            options: pluginOptions.value,
                            filterable: "",
                            clearable: "",
                            placeholder: _ctx.$t("playnite.plugins_placeholder") || "All library plugins (default)",
                            loading: pluginsLoading.value,
                            disabled: disablePlayniteSelection.value || !autoSyncEnabled.value,
                            onFocus: _cache[18] || (_cache[18] = () => loadPlugins()),
                            class: "w-full"
                          }, null, 8, ["value", "options", "placeholder", "loading", "disabled"])
                        ]),
                        default: withCtx(() => [
                          _cache[30] || (_cache[30] = createBaseVNode(
                            "span",
                            null,
                            "{ !autoSyncEnabled ? $t('playnite.enable_autosync_hint') || 'Enable Auto-sync to edit these settings.' : disabledHint }",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        _: 1,
                        __: [30]
                      }, 8, ["disabled"]),
                      createBaseVNode(
                        "div",
                        _hoisted_67$1,
                        toDisplayString(_ctx.$t("playnite.exclude_plugins_help") || "Games imported from these plugins will never be auto-synced."),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", _hoisted_68$1, [
                      createBaseVNode("div", _hoisted_69$1, [
                        createBaseVNode(
                          "label",
                          _hoisted_70$1,
                          toDisplayString(_ctx.$t("playnite.exclude_games") || "Exclude games from auto-sync"),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode("div", _hoisted_71$1, [
                          limitedNoCache.value ? (openBlock(), createBlock(unref(NAlert), {
                            key: 0,
                            type: "warning",
                            "show-icon": true
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(_ctx.$t("playnite.games_unavailable_indicator") || "Cannot retrieve Playnite games right now. Start Playnite to load games."),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          })) : limitedWithCache.value ? (openBlock(), createBlock(unref(NAlert), {
                            key: 1,
                            type: "info",
                            "show-icon": true
                          }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(_ctx.$t("playnite.games_cached_indicator") || "Showing cached Playnite games due to limited connectivity."),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 1
                            /* STABLE */
                          })) : createCommentVNode("v-if", true)
                        ]),
                        createBaseVNode("div", _hoisted_72$1, [
                          createBaseVNode("div", _hoisted_73$1, [
                            createBaseVNode(
                              "div",
                              _hoisted_74$1,
                              toDisplayString(_ctx.$t("playnite.exclude_games_table_title") || "Excluded Games"),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode("div", _hoisted_75$1, [
                              createVNode(unref(NButton), {
                                size: "small",
                                type: "default",
                                strong: "",
                                onClick: openAddExclusions,
                                disabled: disablePlayniteSelection.value
                              }, {
                                default: withCtx(() => [
                                  createVNode(LucideIcon, {
                                    name: "heroicons-solid:plus",
                                    size: 14
                                  }),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_76$1,
                                    toDisplayString(_ctx.$t("playnite.add_exclusions") || "Add"),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                _: 1
                                /* STABLE */
                              }, 8, ["disabled"]),
                              createVNode(unref(NButton), {
                                size: "small",
                                type: "default",
                                strong: "",
                                onClick: clearAllExclusions,
                                disabled: !excludedIds.value.length
                              }, {
                                default: withCtx(() => [
                                  createVNode(LucideIcon, {
                                    name: "heroicons-solid:times",
                                    size: 14
                                  }),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_77$1,
                                    toDisplayString(_ctx.$t("_common.clear_all") || "Clear All"),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                _: 1
                                /* STABLE */
                              }, 8, ["disabled"])
                            ])
                          ]),
                          createVNode(unref(NDataTable), {
                            columns: exclusionsColumns.value,
                            data: excludedDisplayList.value,
                            bordered: true,
                            "single-line": false,
                            pagination: false,
                            size: "small"
                          }, null, 8, ["columns", "data"])
                        ]),
                        createBaseVNode("div", _hoisted_78$1, [
                          gamesSource.value === "live" ? (openBlock(), createElementBlock(
                            "span",
                            _hoisted_79$1,
                            toDisplayString(_ctx.$t("playnite.games_loaded_live") || "Loaded from Playnite"),
                            1
                            /* TEXT */
                          )) : gamesSource.value === "cache" ? (openBlock(), createElementBlock("span", _hoisted_80$1, [
                            createTextVNode(
                              toDisplayString(_ctx.$t("playnite.games_loaded_cache") || "Loaded from cache"),
                              1
                              /* TEXT */
                            ),
                            gamesCacheTime.value ? (openBlock(), createElementBlock(
                              Fragment,
                              { key: 0 },
                              [
                                createTextVNode(
                                  " — " + toDisplayString(new Date(gamesCacheTime.value).toLocaleString()),
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : createCommentVNode("v-if", true)
                          ])) : (openBlock(), createElementBlock(
                            "span",
                            _hoisted_81$1,
                            toDisplayString(_ctx.$t("playnite.games_not_available") || "No games available. Start Playnite to fetch games."),
                            1
                            /* TEXT */
                          ))
                        ]),
                        createBaseVNode(
                          "div",
                          _hoisted_82$1,
                          toDisplayString(_ctx.$t("playnite.exclude_games_desc") || "Selected games will not be auto-synced from Playnite."),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "div",
                          _hoisted_83$1,
                          toDisplayString(_ctx.$t("playnite.exclusions_override_note") || "Exclusions override categories."),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ])
                ])
              ])
            ])) : createCommentVNode("v-if", true)
          ]),
          createCommentVNode(" Uninstall confirmation "),
          createVNode(unref(NModal), {
            show: showDeleteAutosyncConfirm.value,
            "onUpdate:show": _cache[20] || (_cache[20] = (v) => showDeleteAutosyncConfirm.value = v)
          }, {
            default: withCtx(() => [
              createVNode(unref(NCard), {
                bordered: false,
                style: { "max-width": "32rem", "width": "100%" }
              }, {
                header: withCtx(() => [
                  createBaseVNode("div", _hoisted_84$1, [
                    createVNode(LucideIcon, {
                      name: "heroicons-solid:trash",
                      size: 14
                    }),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(_ctx.$t("playnite.delete_autosync_title") || "Delete auto-synced games?"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                footer: withCtx(() => [
                  createBaseVNode("div", _hoisted_86$1, [
                    createVNode(unref(NButton), {
                      type: "default",
                      strong: "",
                      onClick: _cache[19] || (_cache[19] = ($event) => showDeleteAutosyncConfirm.value = false)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("_common.cancel") || "Cancel"),
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
                      loading: deletingAutosync.value,
                      onClick: confirmDeleteAutosync
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("_common.continue") || "Continue"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["loading"])
                  ])
                ]),
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_85$1, [
                    createBaseVNode(
                      "p",
                      null,
                      toDisplayString(_ctx.$t("playnite.delete_autosync_body") || "This removes every Playnite-managed auto-sync entry from the Applications list. Apps added manually are not affected."),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }, 8, ["show"]),
          createVNode(unref(NModal), {
            show: showUninstallConfirm.value,
            "onUpdate:show": _cache[22] || (_cache[22] = (v) => showUninstallConfirm.value = v)
          }, {
            default: withCtx(() => [
              createVNode(unref(NCard), {
                bordered: false,
                style: { "max-width": "32rem", "width": "100%" }
              }, {
                header: withCtx(() => [
                  createBaseVNode("div", _hoisted_87$1, [
                    createVNode(LucideIcon, {
                      name: "heroicons-solid:trash",
                      size: 14
                    }),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(_ctx.$t("playnite.uninstall_button") || "Uninstall Plugin"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                footer: withCtx(() => [
                  createBaseVNode("div", _hoisted_89$1, [
                    createVNode(unref(NButton), {
                      type: "default",
                      strong: "",
                      onClick: _cache[21] || (_cache[21] = ($event) => showUninstallConfirm.value = false)
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
                      loading: uninstalling.value,
                      onClick: confirmUninstall
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("_common.continue") || "Continue"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["loading"])
                  ])
                ]),
                default: withCtx(() => [
                  createBaseVNode(
                    "div",
                    _hoisted_88$1,
                    toDisplayString(_ctx.$t("playnite.uninstall_requires_restart") || "Uninstalling the Playnite plugin may require restarting Playnite. Continue?"),
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
          }, 8, ["show"]),
          createCommentVNode(" Add Exclusions modal "),
          createVNode(unref(NModal), {
            show: showAddModal.value,
            "onUpdate:show": _cache[26] || (_cache[26] = (v) => showAddModal.value = v)
          }, {
            default: withCtx(() => [
              createVNode(unref(NCard), {
                bordered: false,
                style: { "max-width": "40rem", "width": "100%", "height": "auto", "max-height": "calc(100dvh - 2rem)" }
              }, {
                header: withCtx(() => [
                  createBaseVNode("div", _hoisted_90$1, [
                    createVNode(LucideIcon, {
                      name: "heroicons-solid:list-check",
                      size: 16
                    }),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(_ctx.$t("playnite.add_exclusions") || "Add Exclusions"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                footer: withCtx(() => [
                  createBaseVNode("div", _hoisted_93, [
                    createVNode(unref(NButton), {
                      type: "default",
                      strong: "",
                      onClick: _cache[25] || (_cache[25] = ($event) => showAddModal.value = false)
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
                      type: "primary",
                      disabled: !addSelection.value.length,
                      onClick: confirmAddExclusions
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("_common.add") || "Add"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["disabled"])
                  ])
                ]),
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_91$1, [
                    createVNode(unref(NSelect), {
                      value: addSelection.value,
                      "onUpdate:value": _cache[23] || (_cache[23] = ($event) => addSelection.value = $event),
                      options: addOptions.value,
                      multiple: "",
                      filterable: "",
                      clearable: "",
                      loading: gamesLoading.value,
                      disabled: disablePlayniteSelection.value,
                      placeholder: _ctx.$t("playnite.add_exclusions_placeholder") || "Search and select games",
                      class: "w-full",
                      onFocus: _cache[24] || (_cache[24] = () => loadGames())
                    }, null, 8, ["value", "options", "loading", "disabled", "placeholder"]),
                    createBaseVNode(
                      "div",
                      _hoisted_92,
                      toDisplayString(_ctx.$t("playnite.add_exclusions_hint") || "Pick one or more games to exclude from auto-sync."),
                      1
                      /* TEXT */
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
const Playnite_vue_vue_type_style_index_0_scoped_f5325694_lang = "";
const Playnite = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-f5325694"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Playnite.vue"]]);
class PlatformMessageI18n {
  constructor(platform) {
    this.platform = platform;
  }
  getPlatformKey(key, platform) {
    return key + "_" + platform;
  }
  getMessageUsingPlatform(key, defaultMsg) {
    const realKey = this.getPlatformKey(key, this.platform);
    const i18n = inject("i18n");
    if (!i18n || typeof i18n.t !== "function")
      return defaultMsg ?? realKey;
    let message = i18n.t(realKey);
    if (message !== realKey) {
      return message;
    }
    if (this.platform === "windows") {
      return defaultMsg ? defaultMsg : message;
    }
    const unixKey = this.getPlatformKey(key, "unix");
    message = i18n.t(unixKey);
    if (message === unixKey && defaultMsg) {
      return defaultMsg;
    }
    return message;
  }
}
function usePlatformI18n(platform) {
  if (!platform) {
    const injected = inject("platform", null);
    if (injected) {
      platform = typeof injected === "object" && "value" in injected ? injected.value : injected;
    }
  }
  if (!platform) {
    platform = "windows";
  }
  return inject("platformMessage", () => new PlatformMessageI18n(platform), true);
}
function $tp(key, defaultMsg) {
  try {
    const pm = usePlatformI18n();
    return pm.getMessageUsingPlatform(key, defaultMsg);
  } catch (e) {
    return defaultMsg || key;
  }
}
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "PlatformLayout",
  setup(__props) {
    const store = useConfigStore();
    const platform = computed(() => store.metadata && store.metadata.platform || "");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        Fragment,
        null,
        [
          _ctx.$slots["windows"] && platform.value === "windows" ? renderSlot(_ctx.$slots, "windows", { key: 0 }) : createCommentVNode("v-if", true),
          _ctx.$slots["linux"] && platform.value === "linux" ? renderSlot(_ctx.$slots, "linux", { key: 1 }) : createCommentVNode("v-if", true),
          _ctx.$slots["macos"] && platform.value === "macos" ? renderSlot(_ctx.$slots, "macos", { key: 2 }) : createCommentVNode("v-if", true)
        ],
        64
        /* STABLE_FRAGMENT */
      );
    };
  }
});
const PlatformLayout = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/PlatformLayout.vue"]]);
const _hoisted_1$c = {
  key: 0,
  class: "mb-4"
};
const _hoisted_2$8 = {
  for: "adapter_name",
  class: "form-label"
};
const _hoisted_3$8 = { class: "text-xs opacity-60" };
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "AdapterNameSelector",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    const platform = computed(() => config.platform || "");
    return (_ctx, _cache) => {
      return platform.value !== "macos" ? (openBlock(), createElementBlock("div", _hoisted_1$c, [
        createBaseVNode(
          "label",
          _hoisted_2$8,
          toDisplayString(_ctx.$t("config.adapter_name")),
          1
          /* TEXT */
        ),
        createVNode(unref(__unplugin_components_0), {
          id: "adapter_name",
          value: unref(config).adapter_name,
          "onUpdate:value": _cache[0] || (_cache[0] = ($event) => unref(config).adapter_name = $event),
          type: "text",
          placeholder: unref($tp)("config.adapter_name_placeholder", "/dev/dri/renderD128")
        }, null, 8, ["value", "placeholder"]),
        createBaseVNode("div", _hoisted_3$8, [
          createVNode(PlatformLayout, null, {
            windows: withCtx(() => [
              createTextVNode(
                toDisplayString(_ctx.$t("config.adapter_name_desc_windows")),
                1
                /* TEXT */
              ),
              _cache[1] || (_cache[1] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              )),
              _cache[2] || (_cache[2] = createBaseVNode(
                "pre",
                null,
                "tools\\dxgi-info.exe",
                -1
                /* CACHED */
              ))
            ]),
            freebsd: withCtx(() => [
              createTextVNode(
                toDisplayString(_ctx.$t("config.adapter_name_desc_linux_1")),
                1
                /* TEXT */
              ),
              _cache[3] || (_cache[3] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              )),
              createBaseVNode(
                "pre",
                null,
                "ls /dev/dri/renderD*  # " + toDisplayString(_ctx.$t("config.adapter_name_desc_linux_2")),
                1
                /* TEXT */
              ),
              _cache[4] || (_cache[4] = createBaseVNode(
                "pre",
                null,
                '              vainfo --display drm --device /dev/dri/renderD129 | \\\n                grep -E "((VAProfileH264High|VAProfileHEVCMain|VAProfileHEVCMain10).*VAEntrypointEncSlice)|Driver version"\n            ',
                -1
                /* CACHED */
              )),
              createTextVNode(
                " " + toDisplayString(_ctx.$t("config.adapter_name_desc_linux_3")),
                1
                /* TEXT */
              ),
              _cache[5] || (_cache[5] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              )),
              _cache[6] || (_cache[6] = createBaseVNode(
                "i",
                null,
                "VAProfileH264High : VAEntrypointEncSlice",
                -1
                /* CACHED */
              ))
            ]),
            linux: withCtx(() => [
              createTextVNode(
                toDisplayString(_ctx.$t("config.adapter_name_desc_linux_1")),
                1
                /* TEXT */
              ),
              _cache[7] || (_cache[7] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              )),
              createBaseVNode(
                "pre",
                null,
                "ls /dev/dri/renderD*  # " + toDisplayString(_ctx.$t("config.adapter_name_desc_linux_2")),
                1
                /* TEXT */
              ),
              _cache[8] || (_cache[8] = createBaseVNode(
                "pre",
                null,
                '              vainfo --display drm --device /dev/dri/renderD129 | \\\n                grep -E "((VAProfileH264High|VAProfileHEVCMain|VAProfileHEVCMain10).*VAEntrypointEncSlice)|Driver version"\n            ',
                -1
                /* CACHED */
              )),
              createTextVNode(
                " " + toDisplayString(_ctx.$t("config.adapter_name_desc_linux_3")),
                1
                /* TEXT */
              ),
              _cache[9] || (_cache[9] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              )),
              _cache[10] || (_cache[10] = createBaseVNode(
                "i",
                null,
                "VAProfileH264High : VAEntrypointEncSlice",
                -1
                /* CACHED */
              ))
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ])) : createCommentVNode("v-if", true);
    };
  }
});
const AdapterNameSelector = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/audiovideo/AdapterNameSelector.vue"]]);
const _hoisted_1$b = { class: "mb-4" };
const _hoisted_2$7 = {
  for: "output_name",
  class: "form-label"
};
const _hoisted_3$7 = { class: "text-xs opacity-60" };
const _hoisted_4$7 = { class: "text-red-500" };
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "DisplayOutputSelector",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    const platform = computed(() => store.metadata && store.metadata.platform || "");
    const devices = ref([]);
    const loading = ref(false);
    const loadError = ref("");
    const { t } = useI18n();
    function tFirst(keys, fallback) {
      for (const k of keys) {
        const m = t(k);
        if (m && m !== k)
          return m;
      }
      return fallback;
    }
    const outputNameLabel = computed(
      () => tFirst(["config.output_name", "offline.output_name"], "Display Id")
    );
    const outputNameDefaultLabel = computed(
      () => tFirst(
        ["offline.output_name_default", "config.output_name_default"],
        "Primary display (default)"
      )
    );
    const outputNameDesc = computed(
      () => $tp("config.output_name_desc", $tp("offline.output_name_desc", ""))
    );
    async function loadDisplayDevices() {
      loading.value = true;
      loadError.value = "";
      try {
        const res = await http.get("/api/display-devices", {
          params: { detail: "full" }
        });
        const arr = Array.isArray(res.data) ? res.data : [];
        devices.value = arr;
      } catch (e) {
        loadError.value = (e == null ? void 0 : e.message) || "Failed to load display devices";
        devices.value = [];
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      if (!loading.value && devices.value.length === 0)
        void loadDisplayDevices();
    });
    const stopWatch = watch(
      () => platform.value,
      (p) => {
        if (p === "windows" && devices.value.length === 0 && !loading.value) {
          void loadDisplayDevices();
        }
      },
      { immediate: false }
    );
    onBeforeUnmount(() => {
      stopWatch();
    });
    const outputNamePlaceholder = computed(
      () => platform.value === "windows" ? "{de9bb7e2-186e-505b-9e93-f48793333810}" : "0"
    );
    function toOptions() {
      const opts = [
        {
          label: outputNameDefaultLabel.value,
          value: "",
          displayName: outputNameDefaultLabel.value,
          id: ""
        }
      ];
      for (const d of devices.value) {
        const displayName = d.friendly_name || d.display_name || "Display";
        const guid = d.device_id || "";
        const dispName = d.display_name || "";
        const parts = [displayName];
        if (guid)
          parts.push(guid);
        if (dispName)
          parts.push(dispName + (d.info ? " (active)" : ""));
        const label = parts.join(" — ");
        const value = d.device_id || d.display_name || "";
        if (value)
          opts.push({
            label,
            value,
            displayName,
            id: guid && dispName ? `${guid} — ${dispName}` : guid || dispName
          });
      }
      return opts;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$b, [
        createBaseVNode(
          "label",
          _hoisted_2$7,
          toDisplayString(outputNameLabel.value),
          1
          /* TEXT */
        ),
        createCommentVNode(" Windows: dropdown of available displays from API "),
        createVNode(PlatformLayout, null, {
          windows: withCtx(() => [
            createVNode(unref(NSelect), {
              id: "output_name",
              value: unref(config).output_name,
              "onUpdate:value": _cache[0] || (_cache[0] = ($event) => unref(config).output_name = $event),
              options: toOptions(),
              loading: loading.value,
              onFocus: _cache[1] || (_cache[1] = () => {
                if (!loading.value && devices.value.length === 0)
                  void loadDisplayDevices();
              }),
              clearable: "",
              filterable: "",
              placeholder: outputNameLabel.value
            }, null, 8, ["value", "options", "loading", "placeholder"])
          ]),
          freebsd: withCtx(() => [
            createVNode(unref(__unplugin_components_0), {
              id: "output_name",
              value: unref(config).output_name,
              "onUpdate:value": _cache[2] || (_cache[2] = ($event) => unref(config).output_name = $event),
              type: "text",
              placeholder: outputNamePlaceholder.value
            }, null, 8, ["value", "placeholder"])
          ]),
          linux: withCtx(() => [
            createVNode(unref(__unplugin_components_0), {
              id: "output_name",
              value: unref(config).output_name,
              "onUpdate:value": _cache[3] || (_cache[3] = ($event) => unref(config).output_name = $event),
              type: "text",
              placeholder: outputNamePlaceholder.value
            }, null, 8, ["value", "placeholder"])
          ]),
          macos: withCtx(() => [
            createVNode(unref(__unplugin_components_0), {
              id: "output_name",
              value: unref(config).output_name,
              "onUpdate:value": _cache[4] || (_cache[4] = ($event) => unref(config).output_name = $event),
              type: "text",
              placeholder: outputNamePlaceholder.value
            }, null, 8, ["value", "placeholder"])
          ]),
          _: 1
          /* STABLE */
        }),
        createBaseVNode("div", _hoisted_3$7, [
          createTextVNode(
            toDisplayString(outputNameDesc.value),
            1
            /* TEXT */
          ),
          _cache[10] || (_cache[10] = createBaseVNode(
            "br",
            null,
            null,
            -1
            /* CACHED */
          )),
          platform.value === "windows" && loadError.value ? (openBlock(), createElementBlock(
            Fragment,
            { key: 0 },
            [
              createBaseVNode(
                "span",
                _hoisted_4$7,
                toDisplayString(loadError.value),
                1
                /* TEXT */
              ),
              _cache[5] || (_cache[5] = createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              ))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : createCommentVNode("v-if", true),
          createVNode(PlatformLayout, null, {
            windows: withCtx(() => _cache[6] || (_cache[6] = [
              createBaseVNode(
                "pre",
                { style: { "white-space": "pre-line" } },
                [
                  createTextVNode("            "),
                  createBaseVNode("b", null, "  {"),
                  createTextVNode("\n            "),
                  createBaseVNode("b", null, '    "device_id": "{de9bb7e2-186e-505b-9e93-f48793333810}"'),
                  createTextVNode("\n            "),
                  createBaseVNode("b", null, '    "display_name": "\\\\\\\\.\\\\DISPLAY1"'),
                  createTextVNode("\n            "),
                  createBaseVNode("b", null, '    "friendly_name": "ROG PG279Q"'),
                  createTextVNode("\n            "),
                  createBaseVNode("b", null, "    ..."),
                  createTextVNode("\n            "),
                  createBaseVNode("b", null, "  }"),
                  createTextVNode("\n          ")
                ],
                -1
                /* CACHED */
              )
            ])),
            freebsd: withCtx(() => _cache[7] || (_cache[7] = [
              createBaseVNode(
                "pre",
                { style: { "white-space": "pre-line" } },
                "            Info: Detecting displays\n            Info: Detected display: DVI-D-0 (id: 0) connected: false\n            Info: Detected display: HDMI-0 (id: 1) connected: true\n            Info: Detected display: DP-0 (id: 2) connected: true\n            Info: Detected display: DP-1 (id: 3) connected: false\n            Info: Detected display: DVI-D-1 (id: 4) connected: false\n          ",
                -1
                /* CACHED */
              )
            ])),
            linux: withCtx(() => _cache[8] || (_cache[8] = [
              createBaseVNode(
                "pre",
                { style: { "white-space": "pre-line" } },
                "            Info: Detecting displays\n            Info: Detected display: DVI-D-0 (id: 0) connected: false\n            Info: Detected display: HDMI-0 (id: 1) connected: true\n            Info: Detected display: DP-0 (id: 2) connected: true\n            Info: Detected display: DP-1 (id: 3) connected: false\n            Info: Detected display: DVI-D-1 (id: 4) connected: false\n          ",
                -1
                /* CACHED */
              )
            ])),
            macos: withCtx(() => _cache[9] || (_cache[9] = [
              createBaseVNode(
                "pre",
                { style: { "white-space": "pre-line" } },
                "            Info: Detecting displays\n            Info: Detected display: Monitor-0 (id: 3) connected: true\n            Info: Detected display: Monitor-1 (id: 2) connected: true\n          ",
                -1
                /* CACHED */
              )
            ])),
            _: 1
            /* STABLE */
          })
        ])
      ]);
    };
  }
});
const DisplayOutputSelector = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/audiovideo/DisplayOutputSelector.vue"]]);
const _hoisted_1$a = { class: "space-y-4" };
const _hoisted_2$6 = {
  key: 0,
  class: "border border-dark/35 dark:border-light/25 rounded-xl p-4"
};
const _hoisted_3$6 = { class: "px-2 text-sm font-medium" };
const _hoisted_4$6 = { class: "text-sm font-medium mb-2" };
const _hoisted_5$6 = { class: "grid gap-2" };
const _hoisted_6$6 = {
  key: 0,
  class: "mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3"
};
const _hoisted_7$6 = { class: "text-xs text-amber-900 dark:text-amber-100" };
const _hoisted_8$5 = { class: "flex items-start gap-2" };
const _hoisted_9$5 = { class: "block" };
const _hoisted_10$5 = { class: "text-xs opacity-60 mt-1" };
const _hoisted_11$5 = { class: "text-xs opacity-60 mt-1" };
const _hoisted_12$4 = { class: "flex items-center gap-2 golden-status-label" };
const _hoisted_13$4 = { class: "font-semibold" };
const _hoisted_14$4 = { class: "golden-actions flex flex-wrap items-center gap-2 md:ml-auto" };
const _hoisted_15$4 = { class: "ml-1" };
const _hoisted_16$4 = {
  key: 0,
  class: "mt-2 alert alert-success rounded px-3 py-2 text-sm"
};
const _hoisted_17$4 = {
  key: 0,
  class: "mt-2 alert alert-danger rounded px-3 py-2 text-sm"
};
const _hoisted_18$4 = {
  key: 0,
  class: "mt-2 alert alert-success rounded px-3 py-2 text-sm"
};
const _hoisted_19$4 = {
  key: 0,
  class: "mt-2 alert alert-danger rounded px-3 py-2 text-sm"
};
const _hoisted_20$4 = { class: "mt-4 space-y-2" };
const _hoisted_21$3 = { class: "flex items-center gap-2" };
const _hoisted_22$3 = { class: "text-sm font-medium" };
const _hoisted_23$3 = { class: "text-xs opacity-60" };
const _hoisted_24$3 = {
  key: 0,
  class: "text-xs text-red-500"
};
const _hoisted_25$3 = {
  key: 1,
  class: "text-xs text-red-500"
};
const _hoisted_26$3 = {
  key: 0,
  class: "mt-4 border-l-2 border-dark/10 dark:border-light/10 pl-3"
};
const _hoisted_27$3 = {
  key: 1,
  class: "mt-4 rounded-lg border border-dark/10 dark:border-light/10 p-3 space-y-2"
};
const _hoisted_28$3 = {
  key: 0,
  class: "text-amber-600"
};
const _hoisted_29$3 = { class: "text-xs opacity-60" };
const _hoisted_30$3 = { class: "mt-4 space-y-2" };
const _hoisted_31$3 = {
  for: "dd_snapshot_restore_hotkey",
  class: "form-label"
};
const _hoisted_32$3 = { class: "text-xs opacity-60" };
const _hoisted_33$2 = { class: "flex items-center gap-2" };
const _hoisted_34$2 = { class: "text-xs opacity-60" };
const _hoisted_35$1 = {
  key: 0,
  class: "text-xs text-red-500"
};
const _hoisted_36$1 = {
  key: 1,
  class: "border border-dark/35 dark:border-light/25 rounded-xl p-4"
};
const _hoisted_37$1 = { class: "px-2 text-sm font-medium" };
const _hoisted_38$1 = { class: "space-y-6" };
const _hoisted_39$1 = {
  key: 0,
  class: "space-y-3"
};
const _hoisted_40$1 = { class: "space-y-2" };
const _hoisted_41$1 = {
  for: "dd_mode_remapping",
  class: "block text-sm font-medium text-dark dark:text-light"
};
const _hoisted_42$1 = {
  key: 0,
  class: "rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3"
};
const _hoisted_43$1 = { class: "text-xs text-blue-900 dark:text-blue-100 space-y-1.5" };
const _hoisted_44$1 = { class: "flex items-start gap-2" };
const _hoisted_45$1 = { class: "text-xs opacity-60 space-y-1" };
const _hoisted_46$1 = {
  key: 0,
  class: "space-y-2"
};
const _hoisted_47$1 = { class: "rounded-lg border border-dark/10 dark:border-light/10 overflow-hidden" };
const _hoisted_48$1 = {
  class: "max-h-[360px] overflow-y-auto p-2 w-full",
  "data-testid": "dd-remap-scroll"
};
const _hoisted_49$1 = {
  key: 0,
  class: "remap-col lg:col-span-3"
};
const _hoisted_50 = ["for"];
const _hoisted_51 = {
  key: 1,
  class: "remap-col lg:col-span-2"
};
const _hoisted_52 = ["for"];
const _hoisted_53 = {
  key: 2,
  class: "remap-col lg:col-span-3"
};
const _hoisted_54 = ["for"];
const _hoisted_55 = {
  key: 3,
  class: "remap-col lg:col-span-2"
};
const _hoisted_56 = ["for"];
const _hoisted_57 = { class: "remap-actions flex w-full items-start justify-start lg:col-span-2 lg:w-auto lg:justify-end" };
const _hoisted_58 = {
  key: 4,
  class: "remap-message w-full lg:col-span-3 text-xs text-red-500 mt-1"
};
const _hoisted_59 = {
  key: 5,
  class: "remap-message w-full lg:col-span-2 text-xs text-red-500 mt-1"
};
const _hoisted_60 = {
  key: 6,
  class: "remap-message w-full lg:col-span-3 text-xs text-red-500 mt-1"
};
const _hoisted_61 = {
  key: 7,
  class: "remap-message w-full lg:col-span-2 text-xs text-red-500 mt-1"
};
const _hoisted_62 = {
  key: 8,
  class: "remap-message w-full lg:col-span-12 text-xs text-red-500"
};
const _hoisted_63 = { class: "flex justify-end pt-2" };
const _hoisted_64 = { class: "space-y-3" };
const _hoisted_65 = { class: "space-y-2" };
const _hoisted_66 = {
  for: "dd_resolution_option",
  class: "form-label"
};
const _hoisted_67 = {
  key: 0,
  class: "optional-subsection space-y-2 border-l border-amber-400 dark:border-amber-500 pl-3"
};
const _hoisted_68 = { class: "rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3" };
const _hoisted_69 = { class: "text-xs text-amber-900 dark:text-amber-100 space-y-1.5" };
const _hoisted_70 = { class: "flex items-start gap-2" };
const _hoisted_71 = { class: "block" };
const _hoisted_72 = {
  key: 0,
  class: "text-xs text-red-500"
};
const _hoisted_73 = { class: "space-y-3" };
const _hoisted_74 = { class: "space-y-2" };
const _hoisted_75 = {
  for: "dd_refresh_rate_option",
  class: "form-label"
};
const _hoisted_76 = {
  key: 0,
  class: "optional-subsection space-y-2 border-l border-amber-400 dark:border-amber-500 pl-3"
};
const _hoisted_77 = { class: "rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3" };
const _hoisted_78 = { class: "text-xs text-amber-900 dark:text-amber-100 space-y-1.5" };
const _hoisted_79 = { class: "flex items-start gap-2" };
const _hoisted_80 = { class: "block" };
const _hoisted_81 = {
  key: 0,
  class: "text-xs text-red-500"
};
const _hoisted_82 = { class: "space-y-3" };
const _hoisted_83 = { class: "space-y-2" };
const _hoisted_84 = {
  for: "dd_hdr_option",
  class: "form-label"
};
const _hoisted_85 = { class: "optional-subsection space-y-2 border-l border-dark/10 dark:border-light/10 pl-3" };
const _hoisted_86 = { class: "block" };
const _hoisted_87 = { class: "space-y-3" };
const _hoisted_88 = { class: "space-y-2" };
const _hoisted_89 = {
  for: "dd_config_revert_delay",
  class: "form-label"
};
const _hoisted_90 = { class: "text-xs opacity-60" };
const _hoisted_91 = { class: "optional-subsection space-y-2 border-l border-dark/10 dark:border-light/10 pl-3" };
const dummyPlugWikiUrl = "https://github.com/Nonary/documentation/wiki/DummyPlugs#enabling-10-bit-color-on-dummy-plugs-at-high-resolutions";
const VIRTUAL_DISPLAY_SELECTION = "sunshine:sudovda_virtual_display";
const REFRESH_RATE_ONLY = "refresh_rate_only";
const RESOLUTION_ONLY = "resolution_only";
const MIXED = "mixed";
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "DisplayDeviceOptions",
  props: {
    section: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const section = computed(() => props.section ?? "pre");
    const store = useConfigStore();
    const config = store.config;
    watch(
      () => config.dd_wa_dummy_plug_hdr10,
      (value) => {
        if (value && !config.frame_limiter_disable_vsync) {
          config.frame_limiter_disable_vsync = true;
        }
      },
      { immediate: true }
    );
    const usingVirtualDisplay = computed(() => {
      const mode = config.virtual_display_mode;
      if (mode === "per_client" || mode === "shared") {
        return true;
      }
      if (mode === "disabled") {
        return false;
      }
      return config.output_name === VIRTUAL_DISPLAY_SELECTION;
    });
    function isObject(v) {
      return !!v && typeof v === "object";
    }
    function isRemapping(obj) {
      if (!isObject(obj))
        return false;
      const r = obj;
      return Array.isArray(r.refresh_rate_only) && Array.isArray(r.resolution_only) && Array.isArray(r.mixed);
    }
    function getRemapping() {
      const v = config.dd_mode_remapping;
      return isRemapping(v) ? v : null;
    }
    function canBeRemapped() {
      return config.dd_configuration_option !== "disabled";
    }
    function getRemappingType() {
      return MIXED;
    }
    function addRemappingEntry() {
      var _a;
      const remap = getRemapping();
      if (!remap)
        return;
      {
        const entry = {
          requested_fps: "",
          final_refresh_rate: "",
          requested_resolution: "",
          final_resolution: ""
        };
        remap.mixed.push(entry);
      }
      store.updateOption("dd_mode_remapping", JSON.parse(JSON.stringify(remap)));
      (_a = store.markManualDirty) == null ? void 0 : _a.call(store, "dd_mode_remapping");
    }
    function removeRemappingEntry(idx) {
      var _a;
      const remap = getRemapping();
      if (!remap)
        return;
      {
        remap.mixed.splice(idx, 1);
      }
      store.updateOption("dd_mode_remapping", JSON.parse(JSON.stringify(remap)));
      (_a = store.markManualDirty) == null ? void 0 : _a.call(store, "dd_mode_remapping");
    }
    const remappingArray = computed(() => {
      const type = getRemappingType();
      const dd = config.dd_mode_remapping;
      const arr = dd == null ? void 0 : dd[type];
      return Array.isArray(arr) ? arr : [];
    });
    const { t } = useI18n();
    const goldenBusy = ref(false);
    const exportStatus = ref(null);
    const deleteStatus = ref(null);
    const goldenExists = ref(null);
    const snapshotDevices = ref([]);
    const snapshotDevicesLoading = ref(false);
    const snapshotDevicesError = ref("");
    const excludeAllWarning = ref(false);
    async function loadGoldenStatus() {
      var _a;
      try {
        const r = await http.get("/api/display/golden_status", { validateStatus: () => true });
        goldenExists.value = ((_a = r == null ? void 0 : r.data) == null ? void 0 : _a.exists) === true;
      } catch {
        goldenExists.value = false;
      }
    }
    const createOrRecreateLabel = computed(
      () => goldenExists.value ? t("troubleshooting.dd_golden_recreate") : t("troubleshooting.dd_golden_create")
    );
    async function exportGolden() {
      var _a;
      goldenBusy.value = true;
      exportStatus.value = null;
      try {
        const r = await http.post("/api/display/export_golden", {}, { validateStatus: () => true });
        exportStatus.value = ((_a = r == null ? void 0 : r.data) == null ? void 0 : _a.status) === true;
        await loadGoldenStatus();
      } catch {
        exportStatus.value = false;
      } finally {
        setTimeout(() => goldenBusy.value = false, 600);
      }
    }
    async function loadSnapshotDevices() {
      snapshotDevicesLoading.value = true;
      snapshotDevicesError.value = "";
      try {
        const res = await http.get("/api/display-devices", {
          params: { detail: "full" }
        });
        snapshotDevices.value = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        snapshotDevicesError.value = (e == null ? void 0 : e.message) || "Failed to load display devices";
        snapshotDevices.value = [];
      } finally {
        snapshotDevicesLoading.value = false;
      }
    }
    const snapshotExcludeOptions = computed(() => {
      const opts = [];
      const seen = /* @__PURE__ */ new Set();
      for (const d of snapshotDevices.value) {
        const value = d.device_id || d.display_name || "";
        if (!value)
          continue;
        const displayName = d.friendly_name || d.display_name || "Display";
        const guid = d.device_id || "";
        const dispName = d.display_name || "";
        const parts = [displayName];
        if (guid)
          parts.push(guid);
        if (dispName)
          parts.push(dispName + (d.info ? " (active)" : ""));
        const label = parts.join(" - ");
        const idLine = guid && dispName ? `${guid} - ${dispName}` : guid || dispName;
        opts.push({ label, value, displayName, id: idLine });
        seen.add(value);
      }
      const current = Array.isArray(config.dd_snapshot_exclude_devices) ? config.dd_snapshot_exclude_devices.map((v) => String(v ?? "").trim()).filter(Boolean) : [];
      for (const id of current) {
        if (!seen.has(id)) {
          opts.push({ label: id, value: id, displayName: id, id });
          seen.add(id);
        }
      }
      return opts;
    });
    const availableExcludeDeviceIds = computed(
      () => snapshotExcludeOptions.value.map((opt) => opt.value ? String(opt.value) : "").filter(Boolean)
    );
    const excludedSnapshotDevices = computed({
      get() {
        const raw = config.dd_snapshot_exclude_devices;
        if (Array.isArray(raw)) {
          return raw.map((v) => String(v ?? "").trim()).filter(Boolean);
        }
        return [];
      },
      set(next) {
        excludeAllWarning.value = false;
        const normalized = Array.isArray(next) ? Array.from(new Set(next.map((v) => String(v ?? "").trim()).filter(Boolean))) : [];
        const available = availableExcludeDeviceIds.value;
        const wouldExcludeAll = available.length > 0 && available.every((id) => normalized.includes(id));
        if (wouldExcludeAll) {
          excludeAllWarning.value = true;
          return;
        }
        if (typeof store.updateOption === "function") {
          store.updateOption("dd_snapshot_exclude_devices", normalized);
        } else {
          config.dd_snapshot_exclude_devices = normalized;
        }
      }
    });
    async function deleteGolden() {
      var _a;
      goldenBusy.value = true;
      deleteStatus.value = null;
      try {
        const r = await http.delete("/api/display/golden", { validateStatus: () => true });
        deleteStatus.value = ((_a = r == null ? void 0 : r.data) == null ? void 0 : _a.deleted) === true;
        await loadGoldenStatus();
      } catch {
        deleteStatus.value = false;
      } finally {
        setTimeout(() => goldenBusy.value = false, 600);
      }
    }
    onMounted(() => {
      loadGoldenStatus();
      if (!snapshotDevicesLoading.value && snapshotDevices.value.length === 0) {
        void loadSnapshotDevices();
      }
    });
    const ddConfigurationOptions = computed(() => [
      { label: t("_common.disabled"), value: "disabled" },
      { label: t("config.dd_config_verify_only"), value: "verify_only" },
      { label: t("config.dd_config_ensure_active"), value: "ensure_active" },
      { label: t("config.dd_config_ensure_primary"), value: "ensure_primary" },
      { label: t("config.dd_config_ensure_only_display"), value: "ensure_only_display" }
    ]);
    const ddResolutionOptions = computed(() => [
      { label: t("config.dd_resolution_option_disabled"), value: "disabled" },
      { label: t("config.dd_resolution_option_auto"), value: "auto" },
      { label: t("config.dd_resolution_option_manual"), value: "manual" }
    ]);
    const ddRefreshRateOptions = computed(() => [
      { label: t("config.dd_refresh_rate_option_disabled"), value: "disabled" },
      { label: t("config.dd_refresh_rate_option_auto"), value: "auto" },
      { label: t("config.dd_refresh_rate_option_manual"), value: "manual" }
    ]);
    const ddHdrOptions = computed(() => [
      { label: t("config.dd_hdr_option_disabled"), value: "disabled" },
      { label: t("config.dd_hdr_option_auto"), value: "auto" }
    ]);
    const manualResolutionPattern = /^(\s*\d{2,5}\s*[xX×]\s*\d{2,5}\s*)$/;
    const manualResolutionValid = computed(() => {
      if (config.dd_resolution_option !== "manual")
        return true;
      const v = String(config.dd_manual_resolution || "");
      return manualResolutionPattern.test(v);
    });
    function isResolutionFieldValid(v) {
      if (!v)
        return true;
      return manualResolutionPattern.test(String(v));
    }
    function isPositiveNumber(value) {
      if (value === void 0 || value === null || String(value).trim() === "")
        return false;
      const n = Number(value);
      return Number.isFinite(n) && n > 0;
    }
    function isRefreshFieldValid(v) {
      if (!v)
        return true;
      const s = String(v).trim();
      if (s === "")
        return true;
      return /^\d+(?:\.\d+)?$/.test(s) && isPositiveNumber(s);
    }
    const isManualEnforcementActive = computed(() => {
      return config.dd_resolution_option === "manual" || config.dd_refresh_rate_option === "manual";
    });
    const hotkeyComboPreview = computed(() => {
      const key = String(config.dd_snapshot_restore_hotkey || "").trim();
      if (!key)
        return "";
      const raw = String(config.dd_snapshot_restore_hotkey_modifiers || "").trim();
      if (!raw)
        return key;
      const lower = raw.toLowerCase();
      if (lower === "none" || lower === "off" || lower === "disabled") {
        return key;
      }
      const tokens = lower.split(/[\s+|,;]+/).filter(Boolean);
      const hasCtrl = tokens.includes("ctrl") || tokens.includes("control");
      const hasAlt = tokens.includes("alt");
      const hasShift = tokens.includes("shift");
      const hasWin = tokens.includes("win") || tokens.includes("windows") || tokens.includes("meta");
      const parts = [];
      if (hasCtrl)
        parts.push("Ctrl");
      if (hasAlt)
        parts.push("Alt");
      if (hasShift)
        parts.push("Shift");
      if (hasWin)
        parts.push("Win");
      if (parts.length === 0) {
        return key;
      }
      return `${parts.join("+")}+${key}`;
    });
    const hotkeyCaptureActive = ref(false);
    const hotkeyCaptureError = ref("");
    function normalizeHotkeyKey(raw) {
      if (/^F\d{1,2}$/i.test(raw)) {
        const num = Number(raw.slice(1));
        if (Number.isInteger(num) && num >= 1 && num <= 24) {
          return `F${num}`;
        }
        return null;
      }
      if (raw.length === 1) {
        if (/[a-z]/i.test(raw)) {
          return raw.toUpperCase();
        }
        if (/[0-9]/.test(raw)) {
          return raw;
        }
      }
      return null;
    }
    function updateSnapshotHotkey(e) {
      const key = e.key || "";
      const ignored = ["Shift", "Control", "Alt", "Meta"];
      if (ignored.includes(key)) {
        return;
      }
      e.preventDefault();
      hotkeyCaptureError.value = "";
      const normalizedKey = normalizeHotkeyKey(key);
      if (!normalizedKey) {
        hotkeyCaptureError.value = t("config.dd_snapshot_restore_hotkey_invalid");
        return;
      }
      const modifiers = [];
      if (e.ctrlKey)
        modifiers.push("ctrl");
      if (e.altKey)
        modifiers.push("alt");
      if (e.shiftKey)
        modifiers.push("shift");
      if (e.metaKey)
        modifiers.push("win");
      config.dd_snapshot_restore_hotkey = normalizedKey;
      config.dd_snapshot_restore_hotkey_modifiers = modifiers.length > 0 ? modifiers.join("+") : "none";
    }
    function clearSnapshotHotkey() {
      hotkeyCaptureError.value = "";
      config.dd_snapshot_restore_hotkey = "";
      config.dd_snapshot_restore_hotkey_modifiers = "";
    }
    return (_ctx, _cache) => {
      return unref(config) ? (openBlock(), createBlock(PlatformLayout, { key: 0 }, {
        windows: withCtx(() => [
          createBaseVNode("div", _hoisted_1$a, [
            createCommentVNode(" Step 2 content combined: configuration + snapshot (single card) "),
            section.value === "pre" ? (openBlock(), createElementBlock("fieldset", _hoisted_2$6, [
              createBaseVNode(
                "legend",
                _hoisted_3$6,
                toDisplayString(_ctx.$t("config.dd_step_2")) + ": " + toDisplayString(_ctx.$t("config.dd_pre_stream_setup")),
                1
                /* TEXT */
              ),
              createCommentVNode(" Configuration option "),
              createBaseVNode(
                "div",
                _hoisted_4$6,
                toDisplayString(_ctx.$t("config.dd_config_label")),
                1
                /* TEXT */
              ),
              !usingVirtualDisplay.value ? (openBlock(), createBlock(unref(NRadioGroup), {
                key: 0,
                value: unref(config).dd_configuration_option,
                "onUpdate:value": _cache[0] || (_cache[0] = ($event) => unref(config).dd_configuration_option = $event)
              }, {
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_5$6, [
                    (openBlock(true), createElementBlock(
                      Fragment,
                      null,
                      renderList(ddConfigurationOptions.value, (opt) => {
                        return openBlock(), createBlock(unref(NRadio), {
                          key: opt.value,
                          value: opt.value,
                          label: opt.label
                        }, null, 8, ["value", "label"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["value"])) : createCommentVNode("v-if", true),
              createVNode(Transition, { name: "fade" }, {
                default: withCtx(() => [
                  unref(config).dd_configuration_option === "ensure_active" ? (openBlock(), createElementBlock("div", _hoisted_6$6, [
                    createBaseVNode("p", _hoisted_7$6, [
                      createBaseVNode("span", _hoisted_8$5, [
                        createVNode(LucideIcon, {
                          name: "fa-exclamation-triangle",
                          size: 14,
                          class: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                        }),
                        createBaseVNode(
                          "span",
                          _hoisted_9$5,
                          toDisplayString(_ctx.$t("config.dd_config_ensure_active_warning")),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ])) : createCommentVNode("v-if", true)
                ]),
                _: 1
                /* STABLE */
              }),
              createBaseVNode(
                "div",
                _hoisted_10$5,
                toDisplayString(_ctx.$t("config.dd_config_hint")),
                1
                /* TEXT */
              ),
              _cache[23] || (_cache[23] = createBaseVNode(
                "div",
                { class: "my-4 border-t border-dark/5 dark:border-light/5" },
                null,
                -1
                /* CACHED */
              )),
              createCommentVNode(" Snapshot for recovery "),
              unref(config).dd_configuration_option !== "disabled" ? (openBlock(), createElementBlock(
                Fragment,
                { key: 1 },
                [
                  _cache[22] || (_cache[22] = createBaseVNode(
                    "div",
                    { class: "px-0 text-sm font-medium" },
                    "Save a display snapshot (improves stability)",
                    -1
                    /* CACHED */
                  )),
                  createBaseVNode(
                    "p",
                    _hoisted_11$5,
                    toDisplayString(_ctx.$t("troubleshooting.dd_golden_help")) + " Saving a snapshot of your ideal monitor setup helps Vibepollo recover when Windows fails to restore displays after streaming. ",
                    1
                    /* TEXT */
                  ),
                  createBaseVNode(
                    "div",
                    {
                      class: normalizeClass([
                        "golden-status mt-3 flex flex-wrap items-center gap-2 rounded px-3 py-2 text-xs",
                        goldenExists.value === true ? "bg-success/10 text-success" : goldenExists.value === false ? "bg-warning/10 text-warning" : "bg-light/80 dark:bg-dark/60 text-dark dark:text-light"
                      ])
                    },
                    [
                      createBaseVNode("div", _hoisted_12$4, [
                        createVNode(LucideIcon, {
                          name: goldenExists.value === true ? "fa-check-circle" : goldenExists.value === false ? "fa-exclamation-triangle" : "fa-spinner",
                          class: normalizeClass(goldenExists.value === null ? "text-sm animate-spin" : "text-sm"),
                          size: 14
                        }, null, 8, ["name", "class"]),
                        createBaseVNode(
                          "span",
                          _hoisted_13$4,
                          toDisplayString(goldenExists.value === true ? _ctx.$t("troubleshooting.dd_golden_status_present") : goldenExists.value === false ? _ctx.$t("troubleshooting.dd_golden_status_missing") : "Checking…"),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", _hoisted_14$4, [
                        createVNode(unref(NButton), {
                          size: "tiny",
                          type: "default",
                          strong: "",
                          onClick: loadGoldenStatus
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-sync",
                              size: 14
                            }),
                            createBaseVNode(
                              "span",
                              _hoisted_15$4,
                              toDisplayString(_ctx.$t("troubleshooting.dd_golden_refresh")),
                              1
                              /* TEXT */
                            )
                          ]),
                          _: 1
                          /* STABLE */
                        }),
                        _cache[21] || (_cache[21] = createBaseVNode(
                          "div",
                          { class: "hidden sm:block h-4 w-px bg-current/25" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        createVNode(unref(NButton), {
                          size: "tiny",
                          type: "primary",
                          strong: "",
                          disabled: goldenBusy.value,
                          loading: goldenBusy.value && exportStatus.value === null && deleteStatus.value === null,
                          onClick: exportGolden
                        }, {
                          default: withCtx(() => [
                            createBaseVNode(
                              "span",
                              null,
                              toDisplayString(createOrRecreateLabel.value),
                              1
                              /* TEXT */
                            )
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["disabled", "loading"]),
                        createVNode(unref(NButton), {
                          size: "tiny",
                          type: "error",
                          strong: "",
                          disabled: goldenBusy.value || goldenExists.value !== true,
                          loading: goldenBusy.value && deleteStatus.value === null,
                          onClick: deleteGolden
                        }, {
                          default: withCtx(() => [
                            createTextVNode(
                              toDisplayString(_ctx.$t("troubleshooting.dd_golden_delete")),
                              1
                              /* TEXT */
                            )
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["disabled", "loading"])
                      ])
                    ],
                    2
                    /* CLASS */
                  ),
                  createVNode(Transition, { name: "fade" }, {
                    default: withCtx(() => [
                      exportStatus.value === true ? (openBlock(), createElementBlock(
                        "p",
                        _hoisted_16$4,
                        toDisplayString(_ctx.$t("troubleshooting.dd_export_golden_success")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createVNode(Transition, { name: "fade" }, {
                    default: withCtx(() => [
                      exportStatus.value === false ? (openBlock(), createElementBlock(
                        "p",
                        _hoisted_17$4,
                        toDisplayString(_ctx.$t("troubleshooting.dd_export_golden_error")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createVNode(Transition, { name: "fade" }, {
                    default: withCtx(() => [
                      deleteStatus.value === true ? (openBlock(), createElementBlock(
                        "p",
                        _hoisted_18$4,
                        toDisplayString(_ctx.$t("troubleshooting.dd_golden_deleted")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createVNode(Transition, { name: "fade" }, {
                    default: withCtx(() => [
                      deleteStatus.value === false ? (openBlock(), createElementBlock(
                        "p",
                        _hoisted_19$4,
                        toDisplayString(_ctx.$t("troubleshooting.dd_golden_delete_error")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  createBaseVNode("div", _hoisted_20$4, [
                    createBaseVNode("div", _hoisted_21$3, [
                      createBaseVNode(
                        "div",
                        _hoisted_22$3,
                        toDisplayString(_ctx.$t("config.dd_snapshot_exclude_title")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NButton), {
                        size: "tiny",
                        quaternary: "",
                        loading: snapshotDevicesLoading.value,
                        onClick: loadSnapshotDevices
                      }, {
                        default: withCtx(() => [
                          createVNode(LucideIcon, {
                            name: "fa-sync",
                            size: 14
                          })
                        ]),
                        _: 1
                        /* STABLE */
                      }, 8, ["loading"])
                    ]),
                    createBaseVNode(
                      "p",
                      _hoisted_23$3,
                      toDisplayString(_ctx.$t("config.dd_snapshot_exclude_desc")),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(NSelect), {
                      value: excludedSnapshotDevices.value,
                      "onUpdate:value": _cache[1] || (_cache[1] = ($event) => excludedSnapshotDevices.value = $event),
                      options: snapshotExcludeOptions.value,
                      multiple: "",
                      tag: "",
                      filterable: "",
                      loading: snapshotDevicesLoading.value,
                      disabled: snapshotDevicesLoading.value,
                      placeholder: _ctx.$t("config.dd_snapshot_exclude_placeholder"),
                      onFocus: _cache[2] || (_cache[2] = () => {
                        if (!snapshotDevicesLoading.value && snapshotDevices.value.length === 0) {
                          void loadSnapshotDevices();
                        }
                      })
                    }, null, 8, ["value", "options", "loading", "disabled", "placeholder"]),
                    excludeAllWarning.value ? (openBlock(), createElementBlock(
                      "p",
                      _hoisted_24$3,
                      toDisplayString(_ctx.$t("config.dd_snapshot_exclude_warning")),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true),
                    snapshotDevicesError.value ? (openBlock(), createElementBlock(
                      "p",
                      _hoisted_25$3,
                      toDisplayString(snapshotDevicesError.value),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true)
                  ]),
                  createCommentVNode(" Always restore from golden snapshot option "),
                  goldenExists.value === true ? (openBlock(), createElementBlock("div", _hoisted_26$3, [
                    createVNode(Checkbox, {
                      id: "dd_always_restore_from_golden",
                      modelValue: unref(config).dd_always_restore_from_golden,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).dd_always_restore_from_golden = $event),
                      "locale-prefix": "config",
                      default: "false"
                    }, null, 8, ["modelValue"])
                  ])) : createCommentVNode("v-if", true),
                  usingVirtualDisplay.value && unref(config).dd_configuration_option !== "disabled" ? (openBlock(), createElementBlock("div", _hoisted_27$3, [
                    createVNode(ConfigDurationField, {
                      id: "dd_paused_virtual_display_timeout_secs",
                      modelValue: unref(config).dd_paused_virtual_display_timeout_secs,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).dd_paused_virtual_display_timeout_secs = $event),
                      label: String(_ctx.$t("config.dd_paused_virtual_display_timeout_secs")),
                      desc: String(_ctx.$t("config.dd_paused_virtual_display_timeout_secs_desc")),
                      min: 0
                    }, {
                      meta: withCtx(() => [
                        Number(unref(config).dd_paused_virtual_display_timeout_secs || 0) > 0 ? (openBlock(), createElementBlock(
                          "span",
                          _hoisted_28$3,
                          toDisplayString(_ctx.$t("config.dd_paused_virtual_display_timeout_secs_warning")),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true)
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["modelValue", "label", "desc"]),
                    createBaseVNode(
                      "p",
                      _hoisted_29$3,
                      toDisplayString(_ctx.$t("config.dd_paused_virtual_display_timeout_secs_hotkey_hint")),
                      1
                      /* TEXT */
                    )
                  ])) : createCommentVNode("v-if", true),
                  createBaseVNode("div", _hoisted_30$3, [
                    createBaseVNode(
                      "label",
                      _hoisted_31$3,
                      toDisplayString(_ctx.$t("config.dd_snapshot_restore_hotkey")),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(__unplugin_components_0), {
                      id: "dd_snapshot_restore_hotkey",
                      value: hotkeyComboPreview.value,
                      placeholder: "Click and press a combo",
                      class: "font-mono w-full",
                      readonly: "",
                      onFocus: _cache[5] || (_cache[5] = ($event) => hotkeyCaptureActive.value = true),
                      onBlur: _cache[6] || (_cache[6] = ($event) => hotkeyCaptureActive.value = false),
                      onKeydown: updateSnapshotHotkey
                    }, null, 8, ["value"]),
                    createBaseVNode(
                      "p",
                      _hoisted_32$3,
                      toDisplayString(_ctx.$t("config.dd_snapshot_restore_hotkey_desc")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_33$2, [
                      createVNode(unref(NButton), {
                        size: "tiny",
                        quaternary: "",
                        onClick: clearSnapshotHotkey
                      }, {
                        default: withCtx(() => [
                          createTextVNode(
                            toDisplayString(_ctx.$t("config.dd_snapshot_restore_hotkey_reset")),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 1
                        /* STABLE */
                      }),
                      createBaseVNode(
                        "p",
                        _hoisted_34$2,
                        toDisplayString(hotkeyCaptureActive.value ? _ctx.$t("config.dd_snapshot_restore_hotkey_capture") : " "),
                        1
                        /* TEXT */
                      )
                    ]),
                    hotkeyCaptureError.value ? (openBlock(), createElementBlock(
                      "p",
                      _hoisted_35$1,
                      toDisplayString(hotkeyCaptureError.value),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true)
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : createCommentVNode("v-if", true)
            ])) : createCommentVNode("v-if", true),
            createCommentVNode(" Optional adjustments (belongs to Step 3 in parent) "),
            section.value === "options" && unref(config).dd_configuration_option !== "disabled" ? (openBlock(), createElementBlock("fieldset", _hoisted_36$1, [
              createBaseVNode(
                "legend",
                _hoisted_37$1,
                toDisplayString(_ctx.$t("config.dd_step_3")) + ": " + toDisplayString(_ctx.$t("config.dd_optional_adjustments")),
                1
                /* TEXT */
              ),
              createBaseVNode("div", _hoisted_38$1, [
                createCommentVNode(" Display overrides (formerly Display mode remapping) "),
                canBeRemapped() ? (openBlock(), createElementBlock("section", _hoisted_39$1, [
                  createBaseVNode("div", _hoisted_40$1, [
                    createBaseVNode(
                      "label",
                      _hoisted_41$1,
                      toDisplayString(_ctx.$t("config.dd_display_overrides")),
                      1
                      /* TEXT */
                    ),
                    createVNode(Transition, { name: "fade" }, {
                      default: withCtx(() => [
                        isManualEnforcementActive.value ? (openBlock(), createElementBlock("div", _hoisted_42$1, [
                          createBaseVNode("p", _hoisted_43$1, [
                            createBaseVNode("span", _hoisted_44$1, [
                              createVNode(LucideIcon, {
                                name: "fa-info-circle",
                                size: 14,
                                class: "text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                              }),
                              _cache[24] || (_cache[24] = createBaseVNode(
                                "span",
                                { class: "block" },
                                "Overrides below are disabled while manual resolution or refresh rate is enforced. Manual refresh rates are applied forcefully and disable the double refresh rate fix.",
                                -1
                                /* CACHED */
                              ))
                            ])
                          ])
                        ])) : createCommentVNode("v-if", true)
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createBaseVNode("div", _hoisted_45$1, [
                      createBaseVNode(
                        "p",
                        null,
                        toDisplayString(_ctx.$t("config.dd_mode_remapping_desc_1")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        null,
                        toDisplayString(_ctx.$t("config.dd_mode_remapping_desc_2")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        null,
                        toDisplayString(_ctx.$t("config.dd_mode_remapping_desc_3")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        null,
                        toDisplayString(_ctx.$t("config.dd_mode_remapping_desc_example")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        null,
                        toDisplayString(_ctx.$t(
                          getRemappingType() === MIXED ? "config.dd_mode_remapping_desc_4_final_values_mixed" : "config.dd_mode_remapping_desc_4_final_values_non_mixed"
                        )),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  remappingArray.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_46$1, [
                    createBaseVNode("div", _hoisted_47$1, [
                      createBaseVNode("div", _hoisted_48$1, [
                        (openBlock(true), createElementBlock(
                          Fragment,
                          null,
                          renderList(remappingArray.value, (value, idx) => {
                            return openBlock(), createElementBlock("div", {
                              key: idx,
                              class: "remap-row flex flex-wrap gap-2 lg:grid lg:grid-cols-12 lg:gap-2 lg:items-start"
                            }, [
                              getRemappingType() !== REFRESH_RATE_ONLY ? (openBlock(), createElementBlock("div", _hoisted_49$1, [
                                createBaseVNode("label", {
                                  for: `dd-remap-${idx}-requested-resolution`,
                                  class: "remap-label text-xs font-semibold text-dark dark:text-light"
                                }, toDisplayString(_ctx.$t("config.dd_mode_remapping_requested_resolution")), 9, _hoisted_50),
                                createVNode(unref(__unplugin_components_0), mergeProps(
                                  {
                                    value: value.requested_resolution,
                                    "onUpdate:value": [
                                      ($event) => value.requested_resolution = $event,
                                      _cache[7] || (_cache[7] = ($event) => {
                                        var _a, _b;
                                        return (_b = (_a = unref(store)).markManualDirty) == null ? void 0 : _b.call(_a, "dd_mode_remapping");
                                      })
                                    ],
                                    type: "text",
                                    class: "font-mono w-full",
                                    placeholder: "1920x1080",
                                    "input-props": { id: `dd-remap-${idx}-requested-resolution` }
                                  },
                                  { ref_for: true },
                                  isResolutionFieldValid(value.requested_resolution) ? {} : { status: "error" }
                                ), null, 16, ["value", "onUpdate:value", "input-props"])
                              ])) : createCommentVNode("v-if", true),
                              getRemappingType() !== RESOLUTION_ONLY ? (openBlock(), createElementBlock("div", _hoisted_51, [
                                createBaseVNode("label", {
                                  for: `dd-remap-${idx}-requested-fps`,
                                  class: "remap-label text-xs font-semibold text-dark dark:text-light"
                                }, toDisplayString(_ctx.$t("config.dd_mode_remapping_requested_fps")), 9, _hoisted_52),
                                createVNode(unref(__unplugin_components_0), mergeProps(
                                  {
                                    value: value.requested_fps,
                                    "onUpdate:value": [
                                      ($event) => value.requested_fps = $event,
                                      _cache[8] || (_cache[8] = ($event) => {
                                        var _a, _b;
                                        return (_b = (_a = unref(store)).markManualDirty) == null ? void 0 : _b.call(_a, "dd_mode_remapping");
                                      })
                                    ],
                                    type: "text",
                                    class: "font-mono w-full",
                                    placeholder: "60",
                                    "input-props": { id: `dd-remap-${idx}-requested-fps` }
                                  },
                                  { ref_for: true },
                                  isRefreshFieldValid(value.requested_fps) ? {} : { status: "error" }
                                ), null, 16, ["value", "onUpdate:value", "input-props"])
                              ])) : createCommentVNode("v-if", true),
                              getRemappingType() !== REFRESH_RATE_ONLY ? (openBlock(), createElementBlock("div", _hoisted_53, [
                                createBaseVNode("label", {
                                  for: `dd-remap-${idx}-final-resolution`,
                                  class: "remap-label text-xs font-semibold text-dark dark:text-light"
                                }, toDisplayString(_ctx.$t("config.dd_mode_remapping_final_resolution")), 9, _hoisted_54),
                                createVNode(unref(__unplugin_components_0), mergeProps(
                                  {
                                    value: value.final_resolution,
                                    "onUpdate:value": [
                                      ($event) => value.final_resolution = $event,
                                      _cache[9] || (_cache[9] = ($event) => {
                                        var _a, _b;
                                        return (_b = (_a = unref(store)).markManualDirty) == null ? void 0 : _b.call(_a, "dd_mode_remapping");
                                      })
                                    ],
                                    type: "text",
                                    class: "font-mono w-full",
                                    placeholder: "2560x1440",
                                    "input-props": { id: `dd-remap-${idx}-final-resolution` }
                                  },
                                  { ref_for: true },
                                  isResolutionFieldValid(value.final_resolution) ? {} : { status: "error" }
                                ), null, 16, ["value", "onUpdate:value", "input-props"])
                              ])) : createCommentVNode("v-if", true),
                              getRemappingType() !== RESOLUTION_ONLY ? (openBlock(), createElementBlock("div", _hoisted_55, [
                                createBaseVNode("label", {
                                  for: `dd-remap-${idx}-final-refresh`,
                                  class: "remap-label text-xs font-semibold text-dark dark:text-light"
                                }, toDisplayString(_ctx.$t("config.dd_mode_remapping_final_refresh_rate")), 9, _hoisted_56),
                                createVNode(unref(__unplugin_components_0), mergeProps(
                                  {
                                    value: value.final_refresh_rate,
                                    "onUpdate:value": [
                                      ($event) => value.final_refresh_rate = $event,
                                      _cache[10] || (_cache[10] = ($event) => {
                                        var _a, _b;
                                        return (_b = (_a = unref(store)).markManualDirty) == null ? void 0 : _b.call(_a, "dd_mode_remapping");
                                      })
                                    ],
                                    type: "text",
                                    class: "font-mono w-full",
                                    placeholder: "119.95",
                                    "input-props": { id: `dd-remap-${idx}-final-refresh` }
                                  },
                                  { ref_for: true },
                                  isRefreshFieldValid(value.final_refresh_rate) ? {} : { status: "error" }
                                ), null, 16, ["value", "onUpdate:value", "input-props"])
                              ])) : createCommentVNode("v-if", true),
                              createBaseVNode("div", _hoisted_57, [
                                createVNode(unref(NButton), {
                                  size: "small",
                                  type: "error",
                                  strong: "",
                                  onClick: ($event) => removeRemappingEntry(idx)
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
                              ]),
                              createCommentVNode(" Second grid row for validation messages to preserve top alignment "),
                              getRemappingType() !== REFRESH_RATE_ONLY && !isResolutionFieldValid(value.requested_resolution) ? (openBlock(), createElementBlock("div", _hoisted_58, " Invalid. Use WIDTHxHEIGHT (e.g., 1920x1080, x or ×) or leave blank. ")) : createCommentVNode("v-if", true),
                              getRemappingType() !== RESOLUTION_ONLY && !isRefreshFieldValid(value.requested_fps) ? (openBlock(), createElementBlock("div", _hoisted_59, " Invalid. Use a positive number or leave blank. ")) : createCommentVNode("v-if", true),
                              getRemappingType() !== REFRESH_RATE_ONLY && !isResolutionFieldValid(value.final_resolution) ? (openBlock(), createElementBlock("div", _hoisted_60, " Invalid. Use WIDTHxHEIGHT (e.g., 2560x1440, x or ×) or leave blank. ")) : createCommentVNode("v-if", true),
                              getRemappingType() !== RESOLUTION_ONLY && !isRefreshFieldValid(value.final_refresh_rate) ? (openBlock(), createElementBlock("div", _hoisted_61, " Invalid. Use a positive number or leave blank. ")) : createCommentVNode("v-if", true),
                              getRemappingType() === MIXED && !value.final_resolution && !value.final_refresh_rate ? (openBlock(), createElementBlock("div", _hoisted_62, " For mixed mappings, specify at least one Final field. ")) : createCommentVNode("v-if", true)
                            ]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : createCommentVNode("v-if", true),
                  createBaseVNode("div", _hoisted_63, [
                    createVNode(unref(NButton), {
                      type: "primary",
                      strong: "",
                      size: "small",
                      onClick: _cache[11] || (_cache[11] = ($event) => addRemappingEntry())
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          " + " + toDisplayString(_ctx.$t("config.dd_mode_remapping_add")),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    })
                  ])
                ])) : createCommentVNode("v-if", true),
                createVNode(unref(NGrid), {
                  cols: 12,
                  "x-gap": "16",
                  "y-gap": "16",
                  class: "optional-adjustments-grid"
                }, {
                  default: withCtx(() => [
                    createCommentVNode(" Resolution option "),
                    createVNode(unref(NGi), {
                      span: 12,
                      lg: 6
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_64, [
                          createBaseVNode("div", _hoisted_65, [
                            createBaseVNode(
                              "label",
                              _hoisted_66,
                              toDisplayString(_ctx.$t("config.dd_resolution_option")),
                              1
                              /* TEXT */
                            ),
                            createVNode(unref(NSelect), {
                              id: "dd_resolution_option",
                              value: unref(config).dd_resolution_option,
                              "onUpdate:value": _cache[12] || (_cache[12] = ($event) => unref(config).dd_resolution_option = $event),
                              options: ddResolutionOptions.value,
                              "data-search-options": ddResolutionOptions.value.map((o) => `${o.label}::${o.value}`).join("|"),
                              class: "w-full"
                            }, null, 8, ["value", "options", "data-search-options"])
                          ]),
                          unref(config).dd_resolution_option === "manual" ? (openBlock(), createElementBlock("div", _hoisted_67, [
                            createBaseVNode("div", _hoisted_68, [
                              createBaseVNode("p", _hoisted_69, [
                                createBaseVNode("span", _hoisted_70, [
                                  createVNode(LucideIcon, {
                                    name: "fa-exclamation-circle",
                                    size: 14,
                                    class: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                  }),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_71,
                                    toDisplayString(_ctx.$t("config.dd_resolution_option_manual_desc")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ])
                            ]),
                            createVNode(unref(__unplugin_components_0), mergeProps({
                              id: "dd_manual_resolution",
                              value: unref(config).dd_manual_resolution,
                              "onUpdate:value": [
                                _cache[13] || (_cache[13] = ($event) => unref(config).dd_manual_resolution = $event),
                                _cache[14] || (_cache[14] = ($event) => {
                                  var _a, _b;
                                  return (_b = (_a = unref(store)).markManualDirty) == null ? void 0 : _b.call(_a, "dd_manual_resolution");
                                })
                              ],
                              type: "text",
                              class: "font-mono w-full",
                              placeholder: "2560x1440"
                            }, manualResolutionValid.value ? {} : { status: "error" }), null, 16, ["value"]),
                            !manualResolutionValid.value ? (openBlock(), createElementBlock("p", _hoisted_72, " Invalid format. Use WIDTHxHEIGHT, e.g., 2560x1440 (x or ×). ")) : createCommentVNode("v-if", true)
                          ])) : createCommentVNode("v-if", true)
                        ])
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createCommentVNode(" Refresh rate option "),
                    createVNode(unref(NGi), {
                      span: 12,
                      lg: 6
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_73, [
                          createBaseVNode("div", _hoisted_74, [
                            createBaseVNode(
                              "label",
                              _hoisted_75,
                              toDisplayString(_ctx.$t("config.dd_refresh_rate_option")),
                              1
                              /* TEXT */
                            ),
                            createVNode(unref(NSelect), {
                              id: "dd_refresh_rate_option",
                              value: unref(config).dd_refresh_rate_option,
                              "onUpdate:value": _cache[15] || (_cache[15] = ($event) => unref(config).dd_refresh_rate_option = $event),
                              options: ddRefreshRateOptions.value,
                              "data-search-options": ddRefreshRateOptions.value.map((o) => `${o.label}::${o.value}`).join("|"),
                              class: "w-full"
                            }, null, 8, ["value", "options", "data-search-options"])
                          ]),
                          unref(config).dd_refresh_rate_option === "manual" ? (openBlock(), createElementBlock("div", _hoisted_76, [
                            createBaseVNode("div", _hoisted_77, [
                              createBaseVNode("p", _hoisted_78, [
                                createBaseVNode("span", _hoisted_79, [
                                  createVNode(LucideIcon, {
                                    name: "fa-exclamation-circle",
                                    size: 14,
                                    class: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                  }),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_80,
                                    toDisplayString(_ctx.$t("config.dd_refresh_rate_option_manual_desc")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ])
                            ]),
                            createVNode(unref(__unplugin_components_0), mergeProps(
                              {
                                id: "dd_manual_refresh_rate",
                                value: unref(config).dd_manual_refresh_rate,
                                "onUpdate:value": _cache[16] || (_cache[16] = ($event) => unref(config).dd_manual_refresh_rate = $event),
                                type: "text",
                                class: "font-mono w-full",
                                placeholder: "59.9558"
                              },
                              isRefreshFieldValid(unref(config).dd_manual_refresh_rate) ? {} : { status: "error" }
                            ), null, 16, ["value"]),
                            !isRefreshFieldValid(unref(config).dd_manual_refresh_rate) ? (openBlock(), createElementBlock("p", _hoisted_81, " Invalid refresh rate. Use a positive number, e.g., 60 or 59.94. ")) : createCommentVNode("v-if", true)
                          ])) : createCommentVNode("v-if", true)
                        ])
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createCommentVNode(" HDR option "),
                    createVNode(unref(NGi), {
                      span: 12,
                      lg: 6
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_82, [
                          createBaseVNode("div", _hoisted_83, [
                            createBaseVNode(
                              "label",
                              _hoisted_84,
                              toDisplayString(_ctx.$t("config.dd_hdr_option")),
                              1
                              /* TEXT */
                            ),
                            createVNode(unref(NSelect), {
                              id: "dd_hdr_option",
                              value: unref(config).dd_hdr_option,
                              "onUpdate:value": _cache[17] || (_cache[17] = ($event) => unref(config).dd_hdr_option = $event),
                              options: ddHdrOptions.value,
                              "data-search-options": ddHdrOptions.value.map((o) => `${o.label}::${o.value}`).join("|"),
                              class: "w-full"
                            }, null, 8, ["value", "options", "data-search-options"])
                          ]),
                          createBaseVNode("div", _hoisted_85, [
                            createVNode(Checkbox, {
                              id: "dd_wa_dummy_plug_hdr10",
                              modelValue: unref(config).dd_wa_dummy_plug_hdr10,
                              "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(config).dd_wa_dummy_plug_hdr10 = $event),
                              "locale-prefix": "config",
                              default: false
                            }, {
                              default: withCtx(() => [
                                createBaseVNode("span", _hoisted_86, [
                                  createBaseVNode(
                                    "a",
                                    {
                                      href: dummyPlugWikiUrl,
                                      class: "underline break-words",
                                      rel: "noopener",
                                      target: "_blank"
                                    },
                                    toDisplayString(_ctx.$t("config.dd_wa_dummy_plug_hdr10_link")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ]),
                              _: 1
                              /* STABLE */
                            }, 8, ["modelValue"])
                          ])
                        ])
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createCommentVNode(" Revert behavior "),
                    createVNode(unref(NGi), {
                      span: 12,
                      lg: 6
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_87, [
                          createBaseVNode("div", _hoisted_88, [
                            createBaseVNode(
                              "label",
                              _hoisted_89,
                              toDisplayString(_ctx.$t("config.dd_config_revert_delay")),
                              1
                              /* TEXT */
                            ),
                            createVNode(unref(NInputNumber), {
                              id: "dd_config_revert_delay",
                              value: unref(config).dd_config_revert_delay,
                              "onUpdate:value": _cache[19] || (_cache[19] = ($event) => unref(config).dd_config_revert_delay = $event),
                              placeholder: "3000",
                              min: 0,
                              class: "w-full"
                            }, null, 8, ["value"]),
                            createBaseVNode(
                              "p",
                              _hoisted_90,
                              toDisplayString(_ctx.$t("config.dd_config_revert_delay_desc")),
                              1
                              /* TEXT */
                            )
                          ]),
                          createBaseVNode("div", _hoisted_91, [
                            createVNode(Checkbox, {
                              id: "dd_config_revert_on_disconnect",
                              modelValue: unref(config).dd_config_revert_on_disconnect,
                              "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(config).dd_config_revert_on_disconnect = $event),
                              "locale-prefix": "config",
                              default: "false"
                            }, null, 8, ["modelValue"])
                          ])
                        ])
                      ]),
                      _: 1
                      /* STABLE */
                    })
                  ]),
                  _: 1
                  /* STABLE */
                })
              ])
            ])) : createCommentVNode("v-if", true)
          ])
        ]),
        linux: withCtx(() => _cache[25] || (_cache[25] = [])),
        macos: withCtx(() => _cache[26] || (_cache[26] = [])),
        _: 1
        /* STABLE */
      })) : createCommentVNode("v-if", true);
    };
  }
});
const DisplayDeviceOptions_vue_vue_type_style_index_0_scoped_f390c4e2_lang = "";
const DisplayDeviceOptions = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-f390c4e2"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/audiovideo/DisplayDeviceOptions.vue"]]);
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "DisplayModesSettings",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        Fragment,
        null,
        [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "fallback_mode",
            modelValue: unref(config).fallback_mode,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).fallback_mode = $event),
            class: "mb-4"
          }, null, 8, ["modelValue"]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "max_bitrate",
            modelValue: unref(config).max_bitrate,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).max_bitrate = $event),
            class: "mb-4"
          }, null, 8, ["modelValue"]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "minimum_fps_target",
            modelValue: unref(config).minimum_fps_target,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).minimum_fps_target = $event),
            class: "mb-4"
          }, null, 8, ["modelValue"])
        ],
        64
        /* STABLE_FRAGMENT */
      );
    };
  }
});
const DisplayModesSettings_vue_vue_type_style_index_0_scoped_2666a59c_lang = "";
const DisplayModesSettings = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-2666a59c"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/audiovideo/DisplayModesSettings.vue"]]);
const _hoisted_1$9 = { class: "border border-dark/35 dark:border-light/25 rounded-xl p-4" };
const _hoisted_2$5 = { class: "px-2 text-sm font-medium" };
const _hoisted_3$5 = { class: "mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-xs" };
const _hoisted_4$5 = { class: "font-medium" };
const _hoisted_5$5 = { class: "mt-1 opacity-80" };
const _hoisted_6$5 = { class: "space-y-4" };
const _hoisted_7$5 = { class: "flex items-center justify-between gap-3" };
const _hoisted_8$4 = { class: "flex items-center gap-2" };
const _hoisted_9$4 = { class: "font-medium leading-tight" };
const _hoisted_10$4 = { class: "ml-1" };
const _hoisted_11$4 = {
  key: 0,
  class: "mt-2 text-xs opacity-80"
};
const _hoisted_12$3 = { key: 0 };
const _hoisted_13$3 = { key: 1 };
const _hoisted_14$3 = {
  key: 1,
  class: "mt-2 text-xs text-warning"
};
const _hoisted_15$3 = { class: "grid gap-4 md:grid-cols-2" };
const _hoisted_16$3 = {
  key: 1,
  class: "space-y-4"
};
const _hoisted_17$3 = {
  key: 1,
  class: "text-xs text-warning"
};
const _hoisted_18$3 = {
  key: 2,
  class: "rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs"
};
const _hoisted_19$3 = { class: "text-[13px] font-medium" };
const _hoisted_20$3 = { class: "mt-1 opacity-80" };
const _hoisted_21$2 = { class: "mt-3 desktop-sync-table" };
const _hoisted_22$2 = { class: "overflow-x-auto" };
const _hoisted_23$2 = { class: "border-b border-primary/30 text-xs uppercase tracking-wide opacity-70" };
const _hoisted_24$2 = {
  scope: "col",
  class: "pb-2 pr-4 font-medium"
};
const _hoisted_25$2 = {
  scope: "col",
  class: "pb-2 pr-4 font-medium"
};
const _hoisted_26$2 = {
  scope: "col",
  class: "pb-2 pr-4 font-medium"
};
const _hoisted_27$2 = {
  scope: "col",
  class: "pb-2 pr-4 font-medium"
};
const _hoisted_28$2 = {
  scope: "col",
  class: "pb-2 pr-4 font-medium"
};
const _hoisted_29$2 = {
  scope: "col",
  class: "pb-2 font-medium"
};
const _hoisted_30$2 = {
  scope: "row",
  class: "py-3 pr-4 text-xs font-medium align-top"
};
const _hoisted_31$2 = { class: "font-semibold" };
const _hoisted_32$2 = { class: "py-3 pr-4 align-top text-xs" };
const _hoisted_33$1 = { class: "py-3 pr-4 align-top text-xs" };
const _hoisted_34$1 = { class: "py-3 pr-4 align-top text-xs" };
const _hoisted_35 = { class: "py-3 pr-4 align-top text-xs" };
const _hoisted_36 = { class: "py-3 align-top text-xs" };
const _hoisted_37 = { class: "mt-3 space-y-3 mobile-sync-list" };
const _hoisted_38 = { class: "text-[13px] font-semibold" };
const _hoisted_39 = { class: "mt-2 space-y-2" };
const _hoisted_40 = { class: "text-xs uppercase tracking-wide opacity-70" };
const _hoisted_41 = { class: "text-xs leading-snug" };
const _hoisted_42 = { class: "text-xs uppercase tracking-wide opacity-70" };
const _hoisted_43 = { class: "text-xs leading-snug" };
const _hoisted_44 = { class: "text-xs uppercase tracking-wide opacity-70" };
const _hoisted_45 = { class: "text-xs leading-snug" };
const _hoisted_46 = { class: "text-xs uppercase tracking-wide opacity-70" };
const _hoisted_47 = { class: "text-xs leading-snug" };
const _hoisted_48 = { class: "text-xs uppercase tracking-wide opacity-70" };
const _hoisted_49 = { class: "text-xs leading-snug" };
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "FrameLimiterStep",
  props: {
    stepLabel: { type: String, required: true }
  },
  setup(__props) {
    const { t } = useI18n();
    const store = useConfigStore();
    const config = store.config;
    const dummyPlugHdrActive = computed(() => !!config.dd_wa_dummy_plug_hdr10);
    watch(
      () => config.dd_wa_dummy_plug_hdr10,
      (value) => {
        if (value && !config.frame_limiter_disable_vsync) {
          config.frame_limiter_disable_vsync = true;
        }
      },
      { immediate: true }
    );
    const status = ref(null);
    const statusError = ref(null);
    const loading = ref(false);
    const frameLimiterEnabled = computed({
      get: () => !!config.frame_limiter_enable,
      set: (value) => {
        config.frame_limiter_enable = value;
      }
    });
    const frameLimiterProvider = computed({
      get: () => config.frame_limiter_provider || "auto",
      set: (value) => {
        config.frame_limiter_provider = value;
      }
    });
    const providerLabelFor = (id) => {
      switch (id) {
        case "nvidia-control-panel":
          return t("frameLimiter.provider.nvcp");
        case "rtss":
          return t("frameLimiter.provider.rtss");
        case "none":
          return t("frameLimiter.provider.none");
        case "auto":
        default:
          return t("frameLimiter.provider.auto");
      }
    };
    const providerOptions = computed(() => [
      { label: providerLabelFor("auto"), value: "auto" },
      { label: providerLabelFor("rtss"), value: "rtss" },
      { label: providerLabelFor("nvidia-control-panel"), value: "nvidia-control-panel" }
    ]);
    const syncLimiterOptions = computed(() => [
      { label: t("frameLimiter.syncLimiter.keep"), value: "" },
      { label: t("frameLimiter.syncLimiter.async"), value: "async" },
      { label: t("frameLimiter.syncLimiter.front"), value: "front edge sync" },
      { label: t("frameLimiter.syncLimiter.back"), value: "back edge sync" },
      { label: t("frameLimiter.syncLimiter.reflex"), value: "nvidia reflex" }
    ]);
    const syncLimiterHelpRows = computed(() => [
      {
        id: "async",
        label: t("rtss.sync_limiter_async_short"),
        latency: t("rtss.sync_limiter_async_latency"),
        stutter: t("rtss.sync_limiter_async_stutter"),
        advantages: t("rtss.sync_limiter_async_advantages"),
        disadvantages: t("rtss.sync_limiter_async_disadvantages"),
        use: t("rtss.sync_limiter_async_use")
      },
      {
        id: "front",
        label: t("rtss.sync_limiter_front_short"),
        latency: t("rtss.sync_limiter_front_latency"),
        stutter: t("rtss.sync_limiter_front_stutter"),
        advantages: t("rtss.sync_limiter_front_advantages"),
        disadvantages: t("rtss.sync_limiter_front_disadvantages"),
        use: t("rtss.sync_limiter_front_use")
      },
      {
        id: "back",
        label: t("rtss.sync_limiter_back_short"),
        latency: t("rtss.sync_limiter_back_latency"),
        stutter: t("rtss.sync_limiter_back_stutter"),
        advantages: t("rtss.sync_limiter_back_advantages"),
        disadvantages: t("rtss.sync_limiter_back_disadvantages"),
        use: t("rtss.sync_limiter_back_use")
      },
      {
        id: "reflex",
        label: t("rtss.sync_limiter_reflex_short"),
        latency: t("rtss.sync_limiter_reflex_latency"),
        stutter: t("rtss.sync_limiter_reflex_stutter"),
        advantages: t("rtss.sync_limiter_reflex_advantages"),
        disadvantages: t("rtss.sync_limiter_reflex_disadvantages"),
        use: t("rtss.sync_limiter_reflex_use")
      }
    ]);
    const nvidiaDetected = computed(() => {
      var _a;
      return !!((_a = status.value) == null ? void 0 : _a.nvidia_available);
    });
    const nvcpReady = computed(() => {
      var _a;
      return !!((_a = status.value) == null ? void 0 : _a.nvcp_ready);
    });
    const rtssDetected = computed(() => {
      const s = status.value;
      return !!(s && s.path_exists && s.hooks_found);
    });
    const effectiveProvider = computed(() => {
      var _a, _b;
      const active = (_a = status.value) == null ? void 0 : _a.active_provider;
      if (active && active !== "none" && active !== "auto") {
        return active;
      }
      const provider = frameLimiterProvider.value;
      if (provider === "auto") {
        if (((_b = status.value) == null ? void 0 : _b.rtss_available) || rtssDetected.value) {
          return "rtss";
        }
        if (nvcpReady.value && nvidiaDetected.value) {
          return "nvidia-control-panel";
        }
        return "rtss";
      }
      return provider;
    });
    const rtssBootstrapPending = computed(() => {
      const s = status.value;
      return !!(s && s.can_bootstrap_profile && !s.profile_found);
    });
    const rtssAutoLaunchPlanned = computed(() => {
      const s = status.value;
      return !!(s && s.path_exists && s.hooks_found && !s.process_running);
    });
    const shouldShowRtssConfig = computed(() => {
      const provider = frameLimiterProvider.value;
      return provider === "rtss" || provider === "auto";
    });
    const showRtssInstallHint = computed(() => shouldShowRtssConfig.value && !rtssDetected.value);
    const showRtssInstallInput = computed(() => shouldShowRtssConfig.value && !rtssDetected.value);
    const showSyncLimiterSelect = computed(() => {
      const provider = frameLimiterProvider.value;
      if (provider === "rtss") {
        return true;
      }
      if (provider === "auto") {
        return effectiveProvider.value === "rtss";
      }
      return false;
    });
    const showSyncLimiterHelp = computed(() => showSyncLimiterSelect.value);
    const statusBadgeClass = computed(() => {
      if (!status.value || !frameLimiterEnabled.value) {
        return "bg-warning/10 text-warning";
      }
      if (effectiveProvider.value === "nvidia-control-panel") {
        return nvidiaDetected.value && nvcpReady.value ? "bg-success/10 text-success" : "bg-warning/10 text-warning";
      }
      if (effectiveProvider.value === "rtss") {
        return rtssDetected.value || rtssBootstrapPending.value ? "bg-success/10 text-success" : "bg-warning/10 text-warning";
      }
      return "bg-warning/10 text-warning";
    });
    const statusIcon = computed(
      () => statusBadgeClass.value.includes("bg-success") ? "fa-check-circle" : "fa-exclamation-triangle"
    );
    const statusMessage = computed(() => {
      if (!status.value) {
        return t("frameLimiter.status.unknown");
      }
      if (!frameLimiterEnabled.value) {
        return t("frameLimiter.status.limiterDisabled");
      }
      if (effectiveProvider.value === "nvidia-control-panel") {
        if (!nvidiaDetected.value) {
          return t("frameLimiter.status.nvcpNotDetected");
        }
        if (!nvcpReady.value) {
          return t("frameLimiter.status.nvcpUnavailable");
        }
        return t("frameLimiter.status.nvcpDetected");
      }
      if (effectiveProvider.value === "rtss") {
        if (rtssDetected.value) {
          return t("frameLimiter.status.rtssDetected");
        }
        if (rtssBootstrapPending.value) {
          return t("frameLimiter.status.rtssBootstrap");
        }
        return t("frameLimiter.status.rtssNotDetected");
      }
      return t("frameLimiter.status.unknown");
    });
    watch(frameLimiterProvider, () => {
      refreshStatus();
    });
    watch(frameLimiterEnabled, () => {
      refreshStatus();
    });
    async function refreshStatus() {
      if (loading.value)
        return;
      loading.value = true;
      statusError.value = null;
      try {
        const res = await http.get("/api/rtss/status", { params: { _ts: Date.now() } });
        status.value = (res == null ? void 0 : res.data) || null;
      } catch (e) {
        statusError.value = (e == null ? void 0 : e.message) || t("frameLimiter.status.error");
      } finally {
        loading.value = false;
      }
    }
    function handleProviderDropdown(show) {
      if (show) {
        refreshStatus();
      }
    }
    onMounted(() => {
      refreshStatus();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("fieldset", _hoisted_1$9, [
        createBaseVNode(
          "legend",
          _hoisted_2$5,
          toDisplayString(_ctx.stepLabel) + ": " + toDisplayString(unref(t)("frameLimiter.stepTitle")),
          1
          /* TEXT */
        ),
        createBaseVNode("div", _hoisted_3$5, [
          createBaseVNode(
            "div",
            _hoisted_4$5,
            toDisplayString(unref(t)("frameLimiter.noticeTitle")),
            1
            /* TEXT */
          ),
          createBaseVNode(
            "div",
            _hoisted_5$5,
            toDisplayString(unref(t)("frameLimiter.noticeCopy")),
            1
            /* TEXT */
          )
        ]),
        createBaseVNode("div", _hoisted_6$5, [
          status.value || statusError.value ? (openBlock(), createElementBlock(
            "div",
            {
              key: 0,
              class: normalizeClass(["rounded-lg px-4 py-3 text-xs", statusBadgeClass.value])
            },
            [
              createBaseVNode("div", _hoisted_7$5, [
                createBaseVNode("div", _hoisted_8$4, [
                  createVNode(LucideIcon, {
                    name: statusIcon.value,
                    size: 14
                  }, null, 8, ["name"]),
                  createBaseVNode(
                    "span",
                    _hoisted_9$4,
                    toDisplayString(statusMessage.value),
                    1
                    /* TEXT */
                  )
                ]),
                createVNode(unref(NButton), {
                  size: "tiny",
                  type: "default",
                  strong: "",
                  loading: loading.value,
                  onClick: refreshStatus
                }, {
                  default: withCtx(() => [
                    createVNode(LucideIcon, {
                      name: "fa-sync",
                      size: 14
                    }),
                    createBaseVNode(
                      "span",
                      _hoisted_10$4,
                      toDisplayString(unref(t)("frameLimiter.actions.refresh")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["loading"])
              ]),
              status.value && effectiveProvider.value === "rtss" && (rtssBootstrapPending.value || rtssAutoLaunchPlanned.value) ? (openBlock(), createElementBlock("p", _hoisted_11$4, [
                rtssBootstrapPending.value ? (openBlock(), createElementBlock(
                  "span",
                  _hoisted_12$3,
                  toDisplayString(unref(t)("frameLimiter.status.rtssBootstrapHint")),
                  1
                  /* TEXT */
                )) : rtssAutoLaunchPlanned.value ? (openBlock(), createElementBlock(
                  "span",
                  _hoisted_13$3,
                  toDisplayString(unref(t)("frameLimiter.status.rtssAutolaunchHint")),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true)
              ])) : createCommentVNode("v-if", true),
              statusError.value ? (openBlock(), createElementBlock(
                "p",
                _hoisted_14$3,
                toDisplayString(statusError.value),
                1
                /* TEXT */
              )) : createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )) : createCommentVNode("v-if", true),
          createBaseVNode("div", _hoisted_15$3, [
            createVNode(ConfigFieldRenderer, {
              "setting-key": "frame_limiter_enable",
              modelValue: frameLimiterEnabled.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => frameLimiterEnabled.value = $event),
              label: unref(t)("frameLimiter.enable"),
              desc: unref(t)("frameLimiter.enableHint")
            }, null, 8, ["modelValue", "label", "desc"]),
            createVNode(ConfigFieldRenderer, {
              "setting-key": "frame_limiter_provider",
              modelValue: frameLimiterProvider.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => frameLimiterProvider.value = $event),
              label: unref(t)("frameLimiter.providerLabel"),
              desc: unref(t)("frameLimiter.providerHint"),
              options: providerOptions.value,
              "onUpdate:show": handleProviderDropdown
            }, null, 8, ["modelValue", "label", "desc", "options"])
          ]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "frame_limiter_fps_limit",
            modelValue: unref(config).frame_limiter_fps_limit,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).frame_limiter_fps_limit = $event),
            label: unref(t)("frameLimiter.limitLabel"),
            desc: unref(t)("frameLimiter.limitHint"),
            placeholder: unref(t)("frameLimiter.limitPlaceholder")
          }, null, 8, ["modelValue", "label", "desc", "placeholder"]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "frame_limiter_disable_vsync",
            modelValue: unref(config).frame_limiter_disable_vsync,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).frame_limiter_disable_vsync = $event),
            label: unref(t)("frameLimiter.vsyncUllmLabel"),
            desc: dummyPlugHdrActive.value ? unref(t)("frameLimiter.vsyncUllmForcedByDummyPlug") : nvidiaDetected.value && nvcpReady.value ? unref(t)("frameLimiter.vsyncUllmHintNv") : unref(t)("frameLimiter.vsyncUllmHintGeneric"),
            disabled: dummyPlugHdrActive.value
          }, null, 8, ["modelValue", "label", "desc", "disabled"]),
          shouldShowRtssConfig.value ? (openBlock(), createElementBlock("div", _hoisted_16$3, [
            showRtssInstallInput.value ? (openBlock(), createBlock(ConfigFieldRenderer, {
              key: 0,
              "setting-key": "rtss_install_path",
              modelValue: unref(config).rtss_install_path,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).rtss_install_path = $event),
              label: unref(t)("frameLimiter.rtssPath"),
              desc: unref(t)("frameLimiter.rtssPathHint"),
              placeholder: unref(t)("frameLimiter.rtssPathPlaceholder")
            }, null, 8, ["modelValue", "label", "desc", "placeholder"])) : createCommentVNode("v-if", true),
            showRtssInstallHint.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_17$3,
              toDisplayString(unref(t)("frameLimiter.rtssMissing")),
              1
              /* TEXT */
            )) : createCommentVNode("v-if", true)
          ])) : createCommentVNode("v-if", true),
          showSyncLimiterHelp.value ? (openBlock(), createElementBlock("div", _hoisted_18$3, [
            createBaseVNode(
              "div",
              _hoisted_19$3,
              toDisplayString(unref(t)("rtss.sync_limiter_help_heading")),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_20$3,
              toDisplayString(unref(t)("rtss.sync_limiter_help_blurb")),
              1
              /* TEXT */
            ),
            createBaseVNode("div", _hoisted_21$2, [
              createBaseVNode("div", _hoisted_22$2, [
                createVNode(unref(NTable), {
                  size: "small",
                  "single-line": false,
                  bordered: false,
                  class: "min-w-full text-left whitespace-normal break-words"
                }, {
                  default: withCtx(() => [
                    createBaseVNode("thead", null, [
                      createBaseVNode("tr", _hoisted_23$2, [
                        createBaseVNode(
                          "th",
                          _hoisted_24$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_mode")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "th",
                          _hoisted_25$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_latency")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "th",
                          _hoisted_26$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_stutter")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "th",
                          _hoisted_27$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_advantages")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "th",
                          _hoisted_28$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_disadvantages")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "th",
                          _hoisted_29$2,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_usage")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    createBaseVNode("tbody", null, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(syncLimiterHelpRows.value, (row) => {
                          return openBlock(), createElementBlock("tr", {
                            key: row.id,
                            class: "border-b border-primary/20 last:border-0"
                          }, [
                            createBaseVNode("th", _hoisted_30$2, [
                              createBaseVNode(
                                "span",
                                _hoisted_31$2,
                                toDisplayString(row.label),
                                1
                                /* TEXT */
                              )
                            ]),
                            createBaseVNode(
                              "td",
                              _hoisted_32$2,
                              toDisplayString(row.latency),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode(
                              "td",
                              _hoisted_33$1,
                              toDisplayString(row.stutter),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode(
                              "td",
                              _hoisted_34$1,
                              toDisplayString(row.advantages),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode(
                              "td",
                              _hoisted_35,
                              toDisplayString(row.disadvantages),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode(
                              "td",
                              _hoisted_36,
                              toDisplayString(row.use),
                              1
                              /* TEXT */
                            )
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                })
              ])
            ]),
            createBaseVNode("div", _hoisted_37, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(syncLimiterHelpRows.value, (row) => {
                  return openBlock(), createElementBlock("div", {
                    key: row.id,
                    class: "rounded-lg border border-primary/20 bg-primary/10 p-3"
                  }, [
                    createBaseVNode(
                      "div",
                      _hoisted_38,
                      toDisplayString(row.label),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("dl", _hoisted_39, [
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "dt",
                          _hoisted_40,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_latency")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "dd",
                          _hoisted_41,
                          toDisplayString(row.latency),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "dt",
                          _hoisted_42,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_stutter")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "dd",
                          _hoisted_43,
                          toDisplayString(row.stutter),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "dt",
                          _hoisted_44,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_advantages")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "dd",
                          _hoisted_45,
                          toDisplayString(row.advantages),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "dt",
                          _hoisted_46,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_disadvantages")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "dd",
                          _hoisted_47,
                          toDisplayString(row.disadvantages),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", null, [
                        createBaseVNode(
                          "dt",
                          _hoisted_48,
                          toDisplayString(unref(t)("rtss.sync_limiter_help_usage")),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "dd",
                          _hoisted_49,
                          toDisplayString(row.use),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            showSyncLimiterSelect.value ? (openBlock(), createBlock(ConfigFieldRenderer, {
              key: 0,
              "setting-key": "rtss_frame_limit_type",
              modelValue: unref(config).rtss_frame_limit_type,
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).rtss_frame_limit_type = $event),
              label: unref(t)("frameLimiter.syncLimiterLabel"),
              desc: unref(t)("frameLimiter.syncLimiterHint"),
              options: syncLimiterOptions.value
            }, null, 8, ["modelValue", "label", "desc", "options"])) : createCommentVNode("v-if", true)
          ])) : createCommentVNode("v-if", true)
        ])
      ]);
    };
  }
});
const FrameLimiterStep_vue_vue_type_style_index_0_scoped_b8f5ed83_lang = "";
const FrameLimiterStep = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-b8f5ed83"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/audiovideo/FrameLimiterStep.vue"]]);
const _hoisted_1$8 = {
  id: "av",
  class: "config-page"
};
const _hoisted_2$4 = { class: "mb-8" };
const _hoisted_3$4 = { class: "rounded-md overflow-hidden border border-dark/10 dark:border-light/10" };
const _hoisted_4$4 = { class: "bg-surface/40 px-4 py-3" };
const _hoisted_5$4 = { class: "text-sm font-medium" };
const _hoisted_6$4 = { class: "text-xs opacity-70 mt-1" };
const _hoisted_7$4 = { class: "p-4" };
const _hoisted_8$3 = { class: "mb-4 border border-dark/35 dark:border-light/25 rounded-xl p-4" };
const _hoisted_9$3 = { class: "px-2 text-sm font-medium" };
const _hoisted_10$3 = { class: "mt-3" };
const _hoisted_11$3 = {
  key: 0,
  class: "text-xs opacity-70 mt-2 leading-snug"
};
const _hoisted_12$2 = { class: "text-xs opacity-70 mt-2 leading-snug" };
const _hoisted_13$2 = { class: "mt-4 border-l-2 border-dark/10 dark:border-light/10 pl-3" };
const _hoisted_14$2 = {
  key: 0,
  class: "mt-3"
};
const _hoisted_15$2 = {
  key: 1,
  class: "mt-3 space-y-2"
};
const _hoisted_16$2 = { class: "text-sm font-medium" };
const _hoisted_17$2 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_18$2 = ["onClick", "onKeydown"];
const _hoisted_19$2 = { class: "flex items-center gap-3" };
const _hoisted_20$2 = { class: "text-sm font-semibold" };
const _hoisted_21$1 = { class: "text-xs opacity-70 leading-snug ml-6" };
const _hoisted_22$1 = {
  key: 0,
  class: "mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3"
};
const _hoisted_23$1 = { class: "text-xs text-amber-900 dark:text-amber-100" };
const _hoisted_24$1 = { class: "flex items-start gap-2" };
const _hoisted_25$1 = { class: "block" };
const _hoisted_26$1 = {
  key: 0,
  class: "mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3"
};
const _hoisted_27$1 = { class: "text-xs text-blue-900 dark:text-blue-100" };
const _hoisted_28$1 = { class: "flex items-start gap-2" };
const _hoisted_29$1 = { class: "block" };
const _hoisted_30$1 = { class: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" };
const _hoisted_31$1 = { class: "text-sm font-medium" };
const _hoisted_32$1 = { class: "text-xs opacity-70 mt-1 max-w-xl" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "AudioVideo",
  setup(__props) {
    const { t } = useI18n();
    const store = useConfigStore();
    const { config } = storeToRefs(store);
    computed(() => {
      var _a;
      return ((_a = config.value) == null ? void 0 : _a.platform) || "";
    });
    const ddConfigDisabled = computed(
      () => {
        var _a;
        return ((_a = config.value) == null ? void 0 : _a.dd_configuration_option) === "disabled";
      }
    );
    const frameLimiterStepLabel = computed(
      () => ddConfigDisabled.value ? t("config.dd_step_3") : t("config.dd_step_4")
    );
    const sudovdaStatus = computed(() => ({
      "1": t("config.sudovda_status_unknown"),
      "0": t("config.sudovda_status_ready"),
      "-1": t("config.sudovda_status_uninitialized"),
      "-2": t("config.sudovda_status_version_incompatible"),
      "-3": t("config.sudovda_status_watchdog_failed")
    }));
    const vdisplay = computed(() => (config == null ? void 0 : config.vdisplay) || 0);
    const currentDriverStatus = computed(
      () => sudovdaStatus.value[String(vdisplay.value)] || t("config.sudovda_status_unknown")
    );
    const lastAutomationOption = ref("verify_only");
    watch(
      () => {
        var _a;
        return (_a = config.value) == null ? void 0 : _a.dd_configuration_option;
      },
      (next) => {
        if (typeof next === "string" && next !== "disabled") {
          lastAutomationOption.value = next;
        }
      },
      { immediate: true }
    );
    watch(
      () => {
        var _a;
        return (_a = config.value) == null ? void 0 : _a.virtual_display_mode;
      },
      (next, prev) => {
        var _a;
        if (typeof next === "string" && next !== "disabled" && prev === "disabled") {
          const currentLayout = (_a = config.value) == null ? void 0 : _a["virtual_display_layout"];
          if (!currentLayout || currentLayout === "disabled") {
            store.updateOption("virtual_display_layout", "exclusive");
          }
        }
      }
    );
    const displayAutomationEnabled = computed({
      get() {
        var _a;
        return ((_a = config.value) == null ? void 0 : _a.dd_configuration_option) !== "disabled";
      },
      set(enabled) {
        if (!config.value)
          return;
        if (!enabled) {
          const next = "disabled";
          if (typeof store.updateOption === "function") {
            store.updateOption("dd_configuration_option", next);
          } else {
            config.value.dd_configuration_option = next;
          }
          return;
        }
        if (config.value.dd_configuration_option === "disabled") {
          const fallback = lastAutomationOption.value || "verify_only";
          const next = fallback === "disabled" ? "verify_only" : fallback;
          if (typeof store.updateOption === "function") {
            store.updateOption("dd_configuration_option", next);
          } else {
            config.value.dd_configuration_option = next;
          }
        }
      }
    });
    const virtualDisplayMode = computed({
      get() {
        var _a;
        const mode = (_a = config.value) == null ? void 0 : _a["virtual_display_mode"];
        if (typeof mode === "string") {
          if (mode === "disabled" || mode === "per_client" || mode === "shared") {
            return mode;
          }
        }
        return "disabled";
      },
      set(mode) {
        if (!config.value)
          return;
        store.updateOption("virtual_display_mode", mode);
      }
    });
    const virtualDisplayLayout = computed({
      get() {
        var _a;
        const layout = (_a = config.value) == null ? void 0 : _a["virtual_display_layout"];
        if (layout === "extended" || layout === "extended_primary" || layout === "extended_isolated" || layout === "extended_primary_isolated") {
          return layout;
        }
        return "exclusive";
      },
      set(layout) {
        if (!config.value)
          return;
        store.updateOption("virtual_display_layout", layout);
      }
    });
    const virtualDisplayLayoutOptions = computed(() => [
      {
        value: "exclusive",
        label: t("config.virtual_display_layout_exclusive") + " (default)",
        description: t("config.virtual_display_layout_exclusive_desc")
      },
      {
        value: "extended",
        label: t("config.virtual_display_layout_extended"),
        description: t("config.virtual_display_layout_extended_desc")
      },
      {
        value: "extended_primary",
        label: t("config.virtual_display_layout_extended_primary"),
        description: t("config.virtual_display_layout_extended_primary_desc")
      },
      {
        value: "extended_isolated",
        label: t("config.virtual_display_layout_extended_isolated"),
        description: t("config.virtual_display_layout_extended_isolated_desc")
      },
      {
        value: "extended_primary_isolated",
        label: t("config.virtual_display_layout_extended_primary_isolated"),
        description: t("config.virtual_display_layout_extended_primary_isolated_desc")
      }
    ]);
    function selectVirtualDisplayLayout(v) {
      const sv = String(v);
      const opts = virtualDisplayLayoutOptions.value.map((o) => o.value);
      if (opts.includes(sv)) {
        virtualDisplayLayout.value = sv;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "audio_sink",
          modelValue: unref(config).audio_sink,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).audio_sink = $event),
          class: "mb-6",
          desc: unref($tp)("config.audio_sink_desc"),
          placeholder: unref($tp)("config.audio_sink_placeholder", "alsa_output.pci-0000_09_00.3.analog-stereo")
        }, {
          default: withCtx(() => [
            _cache[14] || (_cache[14] = createBaseVNode(
              "br",
              null,
              null,
              -1
              /* CACHED */
            )),
            createVNode(PlatformLayout, null, {
              windows: withCtx(() => _cache[10] || (_cache[10] = [
                createBaseVNode(
                  "pre",
                  null,
                  "tools\\audio-info.exe",
                  -1
                  /* CACHED */
                )
              ])),
              freebsd: withCtx(() => _cache[11] || (_cache[11] = [
                createBaseVNode(
                  "pre",
                  null,
                  'pacmd list-sinks | grep "name:"',
                  -1
                  /* CACHED */
                ),
                createBaseVNode(
                  "pre",
                  null,
                  "pactl info | grep Source",
                  -1
                  /* CACHED */
                )
              ])),
              linux: withCtx(() => _cache[12] || (_cache[12] = [
                createBaseVNode(
                  "pre",
                  null,
                  'pacmd list-sinks | grep "name:"',
                  -1
                  /* CACHED */
                ),
                createBaseVNode(
                  "pre",
                  null,
                  "pactl info | grep Source",
                  -1
                  /* CACHED */
                )
              ])),
              macos: withCtx(() => _cache[13] || (_cache[13] = [
                createBaseVNode(
                  "a",
                  {
                    href: "https://github.com/mattingalls/Soundflower",
                    target: "_blank"
                  },
                  "Soundflower",
                  -1
                  /* CACHED */
                ),
                createBaseVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                ),
                createBaseVNode(
                  "a",
                  {
                    href: "https://github.com/ExistentialAudio/BlackHole",
                    target: "_blank"
                  },
                  "BlackHole",
                  -1
                  /* CACHED */
                ),
                createTextVNode(
                  ". ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1
              /* STABLE */
            })
          ]),
          _: 1,
          __: [14]
        }, 8, ["modelValue", "desc", "placeholder"]),
        createVNode(PlatformLayout, null, {
          windows: withCtx(() => [
            createVNode(ConfigFieldRenderer, {
              "setting-key": "virtual_sink",
              modelValue: unref(config).virtual_sink,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).virtual_sink = $event),
              class: "mb-6",
              placeholder: _ctx.$t("config.virtual_sink_placeholder")
            }, null, 8, ["modelValue", "placeholder"]),
            createVNode(ConfigFieldRenderer, {
              "setting-key": "install_steam_audio_drivers",
              modelValue: unref(config).install_steam_audio_drivers,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).install_steam_audio_drivers = $event),
              class: "mb-3"
            }, null, 8, ["modelValue"])
          ]),
          _: 1
          /* STABLE */
        }),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "stream_audio",
          modelValue: unref(config).stream_audio,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).stream_audio = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        unref(config).stream_audio === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 0,
          "setting-key": "keep_sink_default",
          modelValue: unref(config).keep_sink_default,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).keep_sink_default = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        unref(config).stream_audio === "enabled" ? (openBlock(), createBlock(ConfigFieldRenderer, {
          key: 1,
          "setting-key": "auto_capture_sink",
          modelValue: unref(config).auto_capture_sink,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).auto_capture_sink = $event),
          class: "mb-6"
        }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
        createVNode(AdapterNameSelector),
        createCommentVNode(" Display configuration: clear, guided, pre-stream focused "),
        createBaseVNode("section", _hoisted_2$4, [
          createBaseVNode("div", _hoisted_3$4, [
            createBaseVNode("div", _hoisted_4$4, [
              createBaseVNode(
                "h3",
                _hoisted_5$4,
                toDisplayString(_ctx.$t("config.dd_display_setup_title")),
                1
                /* TEXT */
              ),
              createBaseVNode(
                "p",
                _hoisted_6$4,
                toDisplayString(_ctx.$t("config.dd_display_setup_intro")),
                1
                /* TEXT */
              )
            ]),
            createBaseVNode("div", _hoisted_7$4, [
              createCommentVNode(" Step 1: Which display to capture "),
              createBaseVNode("fieldset", _hoisted_8$3, [
                createBaseVNode(
                  "legend",
                  _hoisted_9$3,
                  toDisplayString(_ctx.$t("config.dd_step_1")) + ": " + toDisplayString(_ctx.$t("config.dd_choose_display")),
                  1
                  /* TEXT */
                ),
                createCommentVNode(" Highlight driver health before picking a mode "),
                createVNode(PlatformLayout, null, {
                  windows: withCtx(() => [
                    createBaseVNode("div", _hoisted_10$3, [
                      createBaseVNode(
                        "div",
                        {
                          class: normalizeClass(["px-4 py-3 rounded-md", [
                            vdisplay.value ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                          ]])
                        },
                        [
                          createVNode(LucideIcon, {
                            name: "fa-circle-info",
                            size: 14,
                            class: "mr-2"
                          }),
                          createTextVNode(
                            " " + toDisplayString(unref(t)("config.virtual_display_status_label")) + " " + toDisplayString(currentDriverStatus.value),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      vdisplay.value ? (openBlock(), createElementBlock(
                        "p",
                        _hoisted_11$3,
                        toDisplayString(unref(t)("config.virtual_display_status_hint")),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                createBaseVNode(
                  "p",
                  _hoisted_12$2,
                  toDisplayString(_ctx.$t("config.virtual_display_mode_step_hint")),
                  1
                  /* TEXT */
                ),
                createVNode(unref(NRadioGroup), {
                  value: virtualDisplayMode.value,
                  "onUpdate:value": _cache[6] || (_cache[6] = ($event) => virtualDisplayMode.value = $event),
                  class: "grid gap-2 sm:grid-cols-3"
                }, {
                  default: withCtx(() => [
                    createVNode(unref(NRadio), { value: "disabled" }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("config.virtual_display_mode_disabled")),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createVNode(unref(NRadio), { value: "per_client" }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("config.virtual_display_mode_per_client")),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 1
                      /* STABLE */
                    }),
                    createVNode(unref(NRadio), { value: "shared" }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(_ctx.$t("config.virtual_display_mode_shared")),
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
                }, 8, ["value"]),
                createVNode(PlatformLayout, null, {
                  windows: withCtx(() => [
                    createBaseVNode("div", _hoisted_13$2, [
                      createVNode(Checkbox, {
                        id: "dd_wa_virtual_double_refresh",
                        modelValue: unref(config).dd_wa_virtual_double_refresh,
                        "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(config).dd_wa_virtual_double_refresh = $event),
                        "locale-prefix": "config",
                        default: true,
                        disabled: virtualDisplayMode.value === "disabled"
                      }, null, 8, ["modelValue", "disabled"])
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                virtualDisplayMode.value === "disabled" ? (openBlock(), createElementBlock("div", _hoisted_14$2, [
                  createVNode(DisplayOutputSelector)
                ])) : (openBlock(), createElementBlock("div", _hoisted_15$2, [
                  createBaseVNode(
                    "div",
                    _hoisted_16$2,
                    toDisplayString(_ctx.$t("config.virtual_display_layout_label")),
                    1
                    /* TEXT */
                  ),
                  createBaseVNode(
                    "p",
                    _hoisted_17$2,
                    toDisplayString(_ctx.$t("config.virtual_display_layout_hint")),
                    1
                    /* TEXT */
                  ),
                  createVNode(unref(NRadioGroup), {
                    value: virtualDisplayLayout.value,
                    "onUpdate:value": _cache[8] || (_cache[8] = ($event) => virtualDisplayLayout.value = $event),
                    class: "space-y-4"
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(virtualDisplayLayoutOptions.value, (option) => {
                          return openBlock(), createElementBlock("div", {
                            key: option.value,
                            class: "flex flex-col cursor-pointer py-2 px-2 rounded-md hover:bg-surface/10",
                            onClick: withModifiers(($event) => selectVirtualDisplayLayout(option.value), ["prevent"]),
                            onKeydown: [
                              withKeys(withModifiers(($event) => selectVirtualDisplayLayout(option.value), ["prevent"]), ["enter"]),
                              withKeys(withModifiers(($event) => selectVirtualDisplayLayout(option.value), ["prevent"]), ["space"])
                            ],
                            tabindex: "0"
                          }, [
                            createBaseVNode("div", _hoisted_19$2, [
                              createVNode(unref(NRadio), {
                                value: option.value
                              }, null, 8, ["value"]),
                              createBaseVNode(
                                "span",
                                _hoisted_20$2,
                                toDisplayString(option.label),
                                1
                                /* TEXT */
                              )
                            ]),
                            createBaseVNode(
                              "span",
                              _hoisted_21$1,
                              toDisplayString(option.description),
                              1
                              /* TEXT */
                            )
                          ], 40, _hoisted_18$2);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["value"]),
                  createCommentVNode(" Warning for extended modes without primary "),
                  createVNode(Transition, { name: "fade" }, {
                    default: withCtx(() => [
                      virtualDisplayLayout.value === "extended" || virtualDisplayLayout.value === "extended_isolated" ? (openBlock(), createElementBlock("div", _hoisted_22$1, [
                        createBaseVNode("p", _hoisted_23$1, [
                          createBaseVNode("span", _hoisted_24$1, [
                            createVNode(LucideIcon, {
                              name: "fa-exclamation-triangle",
                              size: 14,
                              class: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                            }),
                            createBaseVNode(
                              "span",
                              _hoisted_25$1,
                              toDisplayString(_ctx.$t("config.dd_config_ensure_active_warning")),
                              1
                              /* TEXT */
                            )
                          ])
                        ])
                      ])) : createCommentVNode("v-if", true)
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ])),
                createCommentVNode(" HDR Calibration Tip for per-client virtual display "),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    virtualDisplayMode.value === "per_client" ? (openBlock(), createElementBlock("div", _hoisted_26$1, [
                      createBaseVNode("p", _hoisted_27$1, [
                        createBaseVNode("span", _hoisted_28$1, [
                          createVNode(LucideIcon, {
                            name: "fa-lightbulb",
                            size: 14,
                            class: "text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                          }),
                          createBaseVNode(
                            "span",
                            _hoisted_29$1,
                            toDisplayString(_ctx.$t("config.virtual_display_hdr_tip")),
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ])) : createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }),
                createBaseVNode("div", _hoisted_30$1, [
                  createBaseVNode("div", null, [
                    createBaseVNode(
                      "div",
                      _hoisted_31$1,
                      toDisplayString(_ctx.$t("config.dd_automation_label")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode(
                      "p",
                      _hoisted_32$1,
                      toDisplayString(_ctx.$t("config.dd_automation_desc")),
                      1
                      /* TEXT */
                    )
                  ]),
                  createVNode(unref(NSwitch), {
                    value: displayAutomationEnabled.value,
                    "onUpdate:value": _cache[9] || (_cache[9] = ($event) => displayAutomationEnabled.value = $event),
                    size: "medium",
                    class: "self-start sm:self-center"
                  }, {
                    checked: withCtx(() => [
                      createTextVNode(
                        toDisplayString(_ctx.$t("_common.enabled")),
                        1
                        /* TEXT */
                      )
                    ]),
                    unchecked: withCtx(() => [
                      createTextVNode(
                        toDisplayString(_ctx.$t("_common.disabled")),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["value"])
                ])
              ]),
              _cache[15] || (_cache[15] = createBaseVNode(
                "div",
                { class: "my-4 border-t border-dark/5 dark:border-light/5" },
                null,
                -1
                /* CACHED */
              )),
              createCommentVNode(" Step 2: What to do before the stream starts "),
              createBaseVNode("div", null, [
                createVNode(DisplayDeviceOptions, { section: "pre" })
              ]),
              _cache[16] || (_cache[16] = createBaseVNode(
                "div",
                { class: "my-4 border-t border-dark/5 dark:border-light/5" },
                null,
                -1
                /* CACHED */
              )),
              createCommentVNode(" Step 3: Optional adjustments "),
              createBaseVNode("div", null, [
                createVNode(DisplayDeviceOptions, { section: "options" })
              ]),
              _cache[17] || (_cache[17] = createBaseVNode(
                "div",
                { class: "my-4 border-t border-dark/5 dark:border-light/5" },
                null,
                -1
                /* CACHED */
              )),
              createVNode(FrameLimiterStep, { "step-label": frameLimiterStepLabel.value }, null, 8, ["step-label"])
            ])
          ])
        ]),
        createCommentVNode(" Display Modes "),
        createVNode(DisplayModesSettings)
      ]);
    };
  }
});
const AudioVideo_vue_vue_type_style_index_0_scoped_7cdd0407_lang = "";
const AudioVideo = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-7cdd0407"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/AudioVideo.vue"]]);
const _hoisted_1$7 = {
  id: "nvidia-nvenc-encoder",
  class: "config-page"
};
const _hoisted_2$3 = { class: "section-header" };
const _hoisted_3$3 = { class: "text-sm font-medium" };
const _hoisted_4$3 = {
  key: 0,
  class: "text-xs opacity-70 mt-1"
};
const _hoisted_5$3 = { class: "mb-4 rounded-md overflow-hidden border border-dark/10 dark:border-light/10" };
const _hoisted_6$3 = { class: "bg-surface/40 dark:bg-surface/30 px-4 py-3" };
const _hoisted_7$3 = { class: "text-sm font-medium" };
const _hoisted_8$2 = { class: "p-4" };
const _hoisted_9$2 = { class: "mb-4" };
const _hoisted_10$2 = {
  for: "nvenc_intra_refresh",
  class: "form-label"
};
const _hoisted_11$2 = { class: "text-xs opacity-60 mt-1" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "NvidiaNvencEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    const platform = computed(() => config.platform || "");
    return (_ctx, _cache) => {
      const _component_n_select = NSelect;
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createBaseVNode("header", _hoisted_2$3, [
          createBaseVNode(
            "h3",
            _hoisted_3$3,
            toDisplayString(_ctx.$t("config.nvenc_section_title") || "NVIDIA NVENC Encoder"),
            1
            /* TEXT */
          ),
          _ctx.$t("config.nvenc_section_desc") !== "config.nvenc_section_desc" ? (openBlock(), createElementBlock(
            "p",
            _hoisted_4$3,
            toDisplayString(_ctx.$t("config.nvenc_section_desc")),
            1
            /* TEXT */
          )) : createCommentVNode("v-if", true)
        ]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "nvenc_preset",
          modelValue: unref(config).nvenc_preset,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).nvenc_preset = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "nvenc_twopass",
          modelValue: unref(config).nvenc_twopass,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).nvenc_twopass = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "nvenc_spatial_aq",
          modelValue: unref(config).nvenc_spatial_aq,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).nvenc_spatial_aq = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "nvenc_split_encode",
          modelValue: unref(config).nvenc_split_encode,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).nvenc_split_encode = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "nvenc_vbv_increase",
          modelValue: unref(config).nvenc_vbv_increase,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).nvenc_vbv_increase = $event),
          class: "mb-4"
        }, {
          default: withCtx(() => _cache[10] || (_cache[10] = [
            createBaseVNode(
              "span",
              { class: "mt-2 inline-flex flex-wrap items-center gap-1 text-xs opacity-80" },
              [
                createBaseVNode("span", null, "Learn more:"),
                createBaseVNode("a", {
                  class: "text-primary underline decoration-primary/40 underline-offset-2",
                  href: "https://en.wikipedia.org/wiki/Video_buffering_verifier",
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, " VBV/HRD ")
              ],
              -1
              /* CACHED */
            )
          ])),
          _: 1,
          __: [10]
        }, 8, ["modelValue"]),
        createBaseVNode("div", _hoisted_5$3, [
          createBaseVNode("div", _hoisted_6$3, [
            createBaseVNode(
              "h3",
              _hoisted_7$3,
              toDisplayString(_ctx.$t("config.misc")),
              1
              /* TEXT */
            )
          ]),
          createBaseVNode("div", _hoisted_8$2, [
            platform.value === "windows" ? (openBlock(), createBlock(ConfigFieldRenderer, {
              key: 0,
              "setting-key": "nvenc_realtime_hags",
              modelValue: unref(config).nvenc_realtime_hags,
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).nvenc_realtime_hags = $event),
              class: "mb-3"
            }, {
              default: withCtx(() => _cache[11] || (_cache[11] = [
                createBaseVNode(
                  "span",
                  { class: "mt-2 inline-flex flex-wrap items-center gap-1 text-xs opacity-80" },
                  [
                    createBaseVNode("span", null, "Learn more:"),
                    createBaseVNode("a", {
                      class: "text-primary underline decoration-primary/40 underline-offset-2",
                      href: "https://devblogs.microsoft.com/directx/hardware-accelerated-gpu-scheduling/",
                      target: "_blank",
                      rel: "noopener noreferrer"
                    }, " HAGS ")
                  ],
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [11]
            }, 8, ["modelValue"])) : createCommentVNode("v-if", true),
            platform.value === "windows" ? (openBlock(), createBlock(ConfigFieldRenderer, {
              key: 1,
              "setting-key": "nvenc_latency_over_power",
              modelValue: unref(config).nvenc_latency_over_power,
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).nvenc_latency_over_power = $event),
              class: "mb-3"
            }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
            platform.value === "windows" ? (openBlock(), createBlock(ConfigFieldRenderer, {
              key: 2,
              "setting-key": "nvenc_opengl_vulkan_on_dxgi",
              modelValue: unref(config).nvenc_opengl_vulkan_on_dxgi,
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(config).nvenc_opengl_vulkan_on_dxgi = $event),
              class: "mb-3"
            }, null, 8, ["modelValue"])) : createCommentVNode("v-if", true),
            createVNode(ConfigFieldRenderer, {
              "setting-key": "nvenc_h264_cavlc",
              modelValue: unref(config).nvenc_h264_cavlc,
              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(config).nvenc_h264_cavlc = $event),
              class: "mb-3"
            }, null, 8, ["modelValue"]),
            createCommentVNode(" NVENC Intra Refresh "),
            createBaseVNode("div", _hoisted_9$2, [
              createBaseVNode(
                "label",
                _hoisted_10$2,
                toDisplayString(_ctx.$t("config.nvenc_intra_refresh")),
                1
                /* TEXT */
              ),
              createVNode(_component_n_select, {
                id: "nvenc_intra_refresh",
                value: unref(config).nvenc_intra_refresh,
                "onUpdate:value": _cache[9] || (_cache[9] = ($event) => unref(config).nvenc_intra_refresh = $event),
                options: [
                  { label: _ctx.$t("_common.auto"), value: "disabled" },
                  { label: _ctx.$t("_common.enabled"), value: "enabled" }
                ],
                "data-search-options": [_ctx.$t("_common.auto") + "::disabled", _ctx.$t("_common.enabled") + "::enabled"].join("|")
              }, null, 8, ["value", "options", "data-search-options"]),
              createBaseVNode(
                "p",
                _hoisted_11$2,
                toDisplayString(_ctx.$t("config.nvenc_intra_refresh_desc")),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ]);
    };
  }
});
const NvidiaNvencEncoder_vue_vue_type_style_index_0_scoped_63f656b3_lang = "";
const NvidiaNvencEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-63f656b3"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/NvidiaNvencEncoder.vue"]]);
const _hoisted_1$6 = {
  id: "intel-quicksync-encoder",
  class: "config-page"
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "IntelQuickSyncEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        _cache[3] || (_cache[3] = createBaseVNode(
          "header",
          { class: "section-header" },
          [
            createBaseVNode("h3", { class: "text-sm font-medium" }, " Intel Encoder ")
          ],
          -1
          /* CACHED */
        )),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "qsv_preset",
          modelValue: unref(config).qsv_preset,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).qsv_preset = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "qsv_coder",
          modelValue: unref(config).qsv_coder,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).qsv_coder = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "qsv_slow_hevc",
          modelValue: unref(config).qsv_slow_hevc,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).qsv_slow_hevc = $event),
          class: "mb-0"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const IntelQuickSyncEncoder_vue_vue_type_style_index_0_scoped_71d0b651_lang = "";
const IntelQuickSyncEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-71d0b651"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/IntelQuickSyncEncoder.vue"]]);
const _hoisted_1$5 = {
  id: "amd-amf-encoder",
  class: "config-page"
};
const _hoisted_2$2 = { class: "mb-4 rounded-md overflow-hidden border border-dark/10 dark:border-light/10" };
const _hoisted_3$2 = { class: "p-4" };
const _hoisted_4$2 = { class: "border-t border-dark/10 pt-5 dark:border-light/10" };
const _hoisted_5$2 = { class: "group-heading" };
const _hoisted_6$2 = { class: "border-t border-dark/10 pt-5 dark:border-light/10" };
const _hoisted_7$2 = { class: "group-heading" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AmdAmfEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("div", _hoisted_2$2, [
          _cache[7] || (_cache[7] = createBaseVNode(
            "div",
            { class: "bg-surface/40 dark:bg-surface/30 px-4 py-3" },
            [
              createBaseVNode("h3", { class: "text-sm font-medium" }, " AMD AMF Encoder ")
            ],
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_3$2, [
            createVNode(ConfigFieldRenderer, {
              "setting-key": "amd_usage",
              modelValue: unref(config).amd_usage,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).amd_usage = $event),
              class: "mb-6"
            }, null, 8, ["modelValue"]),
            createBaseVNode("section", _hoisted_4$2, [
              createBaseVNode(
                "h4",
                _hoisted_5$2,
                toDisplayString(_ctx.$t("config.amd_rc_group")),
                1
                /* TEXT */
              ),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_rc",
                modelValue: unref(config).amd_rc,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).amd_rc = $event),
                class: "mb-4"
              }, null, 8, ["modelValue"]),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_enforce_hrd",
                modelValue: unref(config).amd_enforce_hrd,
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).amd_enforce_hrd = $event),
                class: "mb-0"
              }, null, 8, ["modelValue"])
            ]),
            createBaseVNode("section", _hoisted_6$2, [
              createBaseVNode(
                "h4",
                _hoisted_7$2,
                toDisplayString(_ctx.$t("config.amd_quality_group")),
                1
                /* TEXT */
              ),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_quality",
                modelValue: unref(config).amd_quality,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(config).amd_quality = $event),
                class: "mb-6"
              }, null, 8, ["modelValue"]),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_preanalysis",
                modelValue: unref(config).amd_preanalysis,
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).amd_preanalysis = $event),
                class: "mb-3"
              }, null, 8, ["modelValue"]),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_vbaq",
                modelValue: unref(config).amd_vbaq,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(config).amd_vbaq = $event),
                class: "mb-3"
              }, null, 8, ["modelValue"]),
              createVNode(ConfigFieldRenderer, {
                "setting-key": "amd_coder",
                modelValue: unref(config).amd_coder,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(config).amd_coder = $event),
                class: "mb-0"
              }, null, 8, ["modelValue"])
            ])
          ])
        ])
      ]);
    };
  }
});
const AmdAmfEncoder_vue_vue_type_style_index_0_scoped_081dc2e1_lang = "";
const AmdAmfEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-081dc2e1"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/AmdAmfEncoder.vue"]]);
const _hoisted_1$4 = {
  id: "videotoolbox-encoder",
  class: "config-page"
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "VideotoolboxEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "vt_coder",
          modelValue: unref(config).vt_coder,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).vt_coder = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "vt_software",
          modelValue: unref(config).vt_software,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).vt_software = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "vt_realtime",
          modelValue: unref(config).vt_realtime,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).vt_realtime = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const VideotoolboxEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/VideotoolboxEncoder.vue"]]);
const _hoisted_1$3 = {
  id: "software-encoder",
  class: "config-page"
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SoftwareEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "sw_preset",
          modelValue: unref(config).sw_preset,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).sw_preset = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"]),
        createVNode(ConfigFieldRenderer, {
          "setting-key": "sw_tune",
          modelValue: unref(config).sw_tune,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).sw_tune = $event),
          class: "mb-4"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const SoftwareEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/SoftwareEncoder.vue"]]);
const _hoisted_1$2 = {
  id: "vaapi-encoder",
  class: "config-page"
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "VAAPIEncoder",
  setup(__props) {
    const store = useConfigStore();
    const config = store.config;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createVNode(ConfigFieldRenderer, {
          "setting-key": "vaapi_strict_rc_buffer",
          modelValue: unref(config).vaapi_strict_rc_buffer,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).vaapi_strict_rc_buffer = $event),
          class: "mb-3"
        }, null, 8, ["modelValue"])
      ]);
    };
  }
});
const VAAPIEncoder = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/encoders/VAAPIEncoder.vue"]]);
const _hoisted_1$1 = { class: "config-page space-y-6" };
const _hoisted_2$1 = { class: "space-y-4" };
const _hoisted_3$1 = {
  key: 0,
  class: "space-y-4 rounded-xl border border-dark/35 p-4 dark:border-light/25"
};
const _hoisted_4$1 = { class: "flex items-center justify-between gap-3" };
const _hoisted_5$1 = { class: "flex items-center gap-2" };
const _hoisted_6$1 = { class: "font-medium leading-tight" };
const _hoisted_7$1 = { class: "flex items-center gap-2" };
const _hoisted_8$1 = {
  key: 0,
  class: "mt-2 text-xs opacity-80"
};
const _hoisted_9$1 = {
  key: 1,
  class: "mt-1 text-xs opacity-70"
};
const _hoisted_10$1 = { class: "mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3" };
const _hoisted_11$1 = { class: "flex items-start gap-2" };
const _hoisted_12$1 = {
  key: 0,
  class: "space-y-2"
};
const _hoisted_13$1 = { class: "flex items-center gap-2 text-xs" };
const _hoisted_14$1 = {
  key: 0,
  class: "encoder-outline"
};
const _hoisted_15$1 = {
  key: 1,
  class: "encoder-outline"
};
const _hoisted_16$1 = {
  key: 5,
  class: "encoder-outline"
};
const _hoisted_17$1 = { class: "space-y-4" };
const _hoisted_18$1 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_19$1 = { class: "flex items-center justify-between pt-2" };
const _hoisted_20$1 = { class: "flex items-center gap-2" };
const LOSSLESS_DEFAULT_PATH = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Lossless Scaling\\LosslessScaling.exe";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Capture",
  props: {
    currentTab: { type: String, default: "" }
  },
  setup(__props) {
    const props = __props;
    const store = useConfigStore();
    const { config, metadata } = storeToRefs(store);
    useI18n();
    const showAll = () => !props.currentTab;
    const platform = computed(
      () => {
        var _a, _b;
        return (((_a = metadata.value) == null ? void 0 : _a.platform) || ((_b = config.value) == null ? void 0 : _b.platform) || "").toString().toLowerCase();
      }
    );
    const gpuList = computed(() => {
      var _a;
      const raw = (_a = metadata.value) == null ? void 0 : _a.gpus;
      return Array.isArray(raw) ? raw : [];
    });
    function normalizeWindowsPath(raw) {
      if (!raw)
        return "";
      let value = String(raw).replace(/\//g, "\\").trim();
      if (!value)
        return "";
      let prefix = "";
      if (value.startsWith("\\\\?\\")) {
        prefix = "\\\\?\\";
        value = value.slice(4);
      } else if (value.startsWith("\\\\")) {
        prefix = "\\\\";
        value = value.slice(2);
      }
      value = value.replace(/\\{2,}/g, "\\");
      if (prefix === "\\\\" && value.startsWith("\\")) {
        value = value.slice(1);
      }
      return prefix + value;
    }
    const losslessStatus = ref(null);
    const losslessLoading = ref(false);
    const losslessError = ref(null);
    const losslessBrowseVisible = ref(false);
    const losslessBrowseSelection = ref("");
    const losslessResolvedPath = computed(() => {
      var _a;
      const raw = (_a = losslessStatus.value) == null ? void 0 : _a.resolved_path;
      if (typeof raw !== "string")
        return "";
      return normalizeWindowsPath(raw);
    });
    const losslessForceAdvanced = ref(false);
    const hasNvidia = computed(() => {
      var _a;
      const metaFlag = (_a = metadata.value) == null ? void 0 : _a.has_nvidia_gpu;
      if (typeof metaFlag === "boolean")
        return metaFlag;
      if (gpuList.value.length) {
        return gpuList.value.some(
          (gpu) => Number((gpu == null ? void 0 : gpu.vendor_id) ?? (gpu == null ? void 0 : gpu.vendorId) ?? 0) === 4318
        );
      }
      return true;
    });
    const hasIntel = computed(() => {
      var _a;
      const metaFlag = (_a = metadata.value) == null ? void 0 : _a.has_intel_gpu;
      if (typeof metaFlag === "boolean")
        return metaFlag;
      if (gpuList.value.length) {
        return gpuList.value.some(
          (gpu) => Number((gpu == null ? void 0 : gpu.vendor_id) ?? (gpu == null ? void 0 : gpu.vendorId) ?? 0) === 32902
        );
      }
      return true;
    });
    const hasAmd = computed(() => {
      var _a;
      const metaFlag = (_a = metadata.value) == null ? void 0 : _a.has_amd_gpu;
      if (typeof metaFlag === "boolean")
        return metaFlag;
      if (gpuList.value.length) {
        return gpuList.value.some((gpu) => {
          const vendor = Number((gpu == null ? void 0 : gpu.vendor_id) ?? (gpu == null ? void 0 : gpu.vendorId) ?? 0);
          return vendor === 4098 || vendor === 4130;
        });
      }
      return true;
    });
    const losslessConfiguredPath = computed(() => {
      var _a;
      return ((_a = config.value) == null ? void 0 : _a.lossless_scaling_path) ?? "";
    });
    const losslessLegacyAutoDetect = computed({
      get: () => {
        var _a;
        return !!((_a = config.value) == null ? void 0 : _a.lossless_scaling_legacy_auto_detect);
      },
      set: (value) => {
        config.value.lossless_scaling_legacy_auto_detect = !!value;
      }
    });
    const losslessSuggestedPath = computed(() => {
      var _a;
      if (losslessConfiguredPath.value)
        return normalizeWindowsPath(losslessConfiguredPath.value);
      const suggested = (_a = losslessStatus.value) == null ? void 0 : _a.suggested_path;
      return normalizeWindowsPath(suggested) || LOSSLESS_DEFAULT_PATH;
    });
    const losslessCandidates = computed(() => {
      var _a;
      const raw = (_a = losslessStatus.value) == null ? void 0 : _a.candidates;
      if (!Array.isArray(raw))
        return [];
      return raw.map((item) => typeof item === "string" ? normalizeWindowsPath(item) : "").filter((item) => !!item);
    });
    const losslessCheckedIsDirectory = computed(() => {
      var _a;
      return !!((_a = losslessStatus.value) == null ? void 0 : _a.checked_is_directory);
    });
    const losslessPathExists = computed(() => {
      var _a;
      return !!((_a = losslessStatus.value) == null ? void 0 : _a.checked_exists);
    });
    const losslessDetected = computed(() => {
      if (!losslessStatus.value)
        return false;
      if (losslessError.value)
        return false;
      if (losslessStatus.value.checked_exists && !losslessCheckedIsDirectory.value)
        return true;
      if (losslessStatus.value.resolved_path)
        return true;
      if (losslessStatus.value.configured_exists && !losslessStatus.value.configured_is_directory) {
        return true;
      }
      if (losslessStatus.value.default_exists)
        return true;
      if (losslessCandidates.value.length > 0)
        return true;
      return false;
    });
    const showLosslessAdvanced = computed(() => !losslessDetected.value || losslessForceAdvanced.value);
    const losslessStatusClass = computed(() => {
      if (losslessLoading.value) {
        return "bg-primary/10 text-primary";
      }
      if (losslessDetected.value) {
        return "bg-success/10 text-success";
      }
      return "bg-warning/10 text-warning";
    });
    const losslessStatusIcon = computed(
      () => losslessDetected.value ? "fa-check-circle" : "fa-exclamation-triangle"
    );
    const losslessDefaultPath = computed(() => {
      var _a;
      const raw = (_a = losslessStatus.value) == null ? void 0 : _a.default_path;
      return typeof raw === "string" ? normalizeWindowsPath(raw) : "";
    });
    const losslessActivePath = computed(() => {
      if (!losslessStatus.value)
        return "";
      if (losslessStatus.value.resolved_path)
        return losslessResolvedPath.value;
      if (losslessStatus.value.checked_exists && typeof losslessStatus.value.checked_path === "string" && !losslessCheckedIsDirectory.value) {
        return normalizeWindowsPath(losslessStatus.value.checked_path);
      }
      if (losslessStatus.value.configured_exists && typeof losslessStatus.value.configured_path === "string" && !losslessStatus.value.configured_is_directory) {
        return normalizeWindowsPath(losslessStatus.value.configured_path);
      }
      if (losslessStatus.value.default_exists && losslessDefaultPath.value) {
        return losslessDefaultPath.value;
      }
      if (losslessCandidates.value.length > 0) {
        return losslessCandidates.value[0];
      }
      return "";
    });
    const losslessStatusText = computed(() => {
      var _a;
      if (losslessLoading.value) {
        return "Checking…";
      }
      if (losslessError.value) {
        return losslessError.value;
      }
      if (losslessDetected.value) {
        return `Lossless Scaling is Ready`;
      }
      if ((_a = losslessStatus.value) == null ? void 0 : _a.message) {
        return losslessStatus.value.message;
      }
      return "Lossless Scaling status unavailable.";
    });
    const losslessStatusHint = computed(() => {
      if (losslessLoading.value) {
        return "";
      }
      if (losslessError.value) {
        return "";
      }
      if (losslessDetected.value) {
        return `Lossless Scaling is detected and will be launched when selected as the primary frame generation in any application.`;
      }
      return "Vibeshine could not find Lossless Scaling. Scan for an installation or provide the executable path below.";
    });
    async function refreshLosslessStatus() {
      if (platform.value !== "windows") {
        return;
      }
      losslessLoading.value = true;
      losslessError.value = null;
      try {
        const params = {};
        if (losslessConfiguredPath.value) {
          params["path"] = normalizeWindowsPath(String(losslessConfiguredPath.value));
        }
        const response = await http.get("/api/lossless_scaling/status", {
          params,
          validateStatus: () => true
        });
        if (response.status >= 200 && response.status < 300) {
          const payload = response.data ?? {};
          if (payload && typeof payload === "object") {
            if (typeof payload.suggested_path === "string") {
              payload.suggested_path = normalizeWindowsPath(payload.suggested_path);
            }
            if (typeof payload.resolved_path === "string") {
              payload.resolved_path = normalizeWindowsPath(payload.resolved_path);
            }
            if (typeof payload.default_path === "string") {
              payload.default_path = normalizeWindowsPath(payload.default_path);
            }
            if (typeof payload.configured_path === "string") {
              payload.configured_path = normalizeWindowsPath(payload.configured_path);
            }
            if (typeof payload.checked_path === "string") {
              payload.checked_path = normalizeWindowsPath(payload.checked_path);
            }
            if (Array.isArray(payload.candidates)) {
              payload.candidates = payload.candidates.map((item) => typeof item === "string" ? normalizeWindowsPath(item) : "").filter((item) => !!item);
            }
          }
          losslessStatus.value = payload;
          losslessError.value = null;
        } else {
          losslessError.value = "Unable to query Lossless Scaling status.";
          losslessStatus.value = null;
        }
      } catch (err) {
        losslessError.value = "Unable to query Lossless Scaling status.";
        losslessStatus.value = null;
      } finally {
        losslessLoading.value = false;
      }
    }
    function applyLosslessSuggestion() {
      if (!config.value)
        return;
      config.value.lossless_scaling_path = losslessSuggestedPath.value;
    }
    function applyLosslessBrowseSelection() {
      if (!config.value)
        return;
      const selected = normalizeWindowsPath(losslessBrowseSelection.value);
      if (!selected)
        return;
      config.value.lossless_scaling_path = selected;
      losslessBrowseVisible.value = false;
    }
    function showLosslessOverride() {
      losslessForceAdvanced.value = true;
    }
    function hideLosslessOverride() {
      losslessForceAdvanced.value = false;
    }
    async function openLosslessBrowse() {
      if (platform.value !== "windows")
        return;
      if (!losslessStatus.value && !losslessLoading.value) {
        await refreshLosslessStatus();
      }
      const initial = normalizeWindowsPath(losslessConfiguredPath.value) || losslessActivePath.value || losslessCandidates.value[0] || losslessSuggestedPath.value || "";
      losslessBrowseSelection.value = initial;
      losslessBrowseVisible.value = true;
    }
    async function rescanLosslessCandidates() {
      await refreshLosslessStatus();
      const existing = normalizeWindowsPath(losslessBrowseSelection.value);
      if (existing) {
        losslessBrowseSelection.value = existing;
        return;
      }
      const first = losslessCandidates.value[0];
      if (first) {
        losslessBrowseSelection.value = first;
      }
    }
    onMounted(() => {
      if (platform.value === "windows") {
        refreshLosslessStatus().catch(() => {
        });
      }
    });
    watch(
      () => losslessConfiguredPath.value,
      () => {
        if (platform.value === "windows") {
          refreshLosslessStatus().catch(() => {
          });
        }
      }
    );
    watch(
      () => {
        var _a;
        return (_a = config.value) == null ? void 0 : _a.lossless_scaling_path;
      },
      (value) => {
        if (typeof value !== "string")
          return;
        const normalized = normalizeWindowsPath(value);
        if (normalized !== value) {
          config.value.lossless_scaling_path = normalized;
        }
      }
    );
    const shouldShowNvenc = computed(() => (showAll() || props.currentTab === "nv") && hasNvidia.value);
    const shouldShowQsv = computed(
      () => (showAll() || props.currentTab === "qsv") && hasIntel.value && platform.value === "windows"
    );
    const shouldShowAmd = computed(
      () => (showAll() || props.currentTab === "amd") && hasAmd.value && platform.value === "windows"
    );
    const shouldShowVideotoolbox = computed(
      () => (showAll() || props.currentTab === "vt") && platform.value === "macos"
    );
    const shouldShowVaapi = computed(
      () => (showAll() || props.currentTab === "vaapi") && platform.value === "linux"
    );
    const shouldShowSoftware = computed(() => showAll() || props.currentTab === "sw");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createVNode(ConfigFieldRenderer, {
            "setting-key": "capture",
            modelValue: unref(config).capture,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).capture = $event)
          }, null, 8, ["modelValue"]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "encoder",
            modelValue: unref(config).encoder,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(config).encoder = $event)
          }, null, 8, ["modelValue"]),
          createVNode(ConfigFieldRenderer, {
            "setting-key": "prefer_10bit_sdr",
            modelValue: unref(config).prefer_10bit_sdr,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(config).prefer_10bit_sdr = $event)
          }, null, 8, ["modelValue"]),
          platform.value === "windows" ? (openBlock(), createElementBlock("fieldset", _hoisted_3$1, [
            _cache[13] || (_cache[13] = createBaseVNode(
              "legend",
              { class: "px-2 text-sm font-medium" },
              "Lossless Scaling",
              -1
              /* CACHED */
            )),
            createBaseVNode(
              "div",
              {
                class: normalizeClass(["rounded-lg px-4 py-3 text-xs", losslessStatusClass.value])
              },
              [
                createBaseVNode("div", _hoisted_4$1, [
                  createBaseVNode("div", _hoisted_5$1, [
                    createVNode(LucideIcon, {
                      name: losslessStatusIcon.value,
                      size: 14
                    }, null, 8, ["name"]),
                    createBaseVNode(
                      "span",
                      _hoisted_6$1,
                      toDisplayString(losslessStatusText.value),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("div", _hoisted_7$1, [
                    createVNode(unref(NButton), {
                      size: "tiny",
                      type: "default",
                      strong: "",
                      loading: losslessLoading.value,
                      onClick: refreshLosslessStatus
                    }, {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: "fa-sync",
                          size: 14
                        }),
                        _cache[8] || (_cache[8] = createBaseVNode(
                          "span",
                          { class: "ml-1" },
                          "Check",
                          -1
                          /* CACHED */
                        ))
                      ]),
                      _: 1,
                      __: [8]
                    }, 8, ["loading"]),
                    losslessDetected.value && !losslessForceAdvanced.value ? (openBlock(), createBlock(unref(NButton), {
                      key: 0,
                      size: "tiny",
                      tertiary: "",
                      onClick: showLosslessOverride
                    }, {
                      default: withCtx(() => _cache[9] || (_cache[9] = [
                        createTextVNode(
                          " Override Path ",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [9]
                    })) : losslessDetected.value && losslessForceAdvanced.value ? (openBlock(), createBlock(unref(NButton), {
                      key: 1,
                      size: "tiny",
                      tertiary: "",
                      onClick: hideLosslessOverride
                    }, {
                      default: withCtx(() => _cache[10] || (_cache[10] = [
                        createTextVNode(
                          " Hide Override ",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [10]
                    })) : createCommentVNode("v-if", true)
                  ])
                ]),
                losslessStatusHint.value ? (openBlock(), createElementBlock(
                  "p",
                  _hoisted_8$1,
                  toDisplayString(losslessStatusHint.value),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true),
                !losslessLoading.value && losslessActivePath.value ? (openBlock(), createElementBlock(
                  "p",
                  _hoisted_9$1,
                  " Using: " + toDisplayString(losslessActivePath.value),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            ),
            _cache[14] || (_cache[14] = createBaseVNode(
              "p",
              { class: "mt-3 text-xs opacity-70" },
              " Enable Lossless Scaling per application from the Apps editor when you need frame generation or upscaling on a specific title. ",
              -1
              /* CACHED */
            )),
            createBaseVNode("div", _hoisted_10$1, [
              createBaseVNode("div", _hoisted_11$1, [
                createVNode(LucideIcon, {
                  name: "fa-exclamation-triangle",
                  size: 14,
                  class: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                }),
                createVNode(ConfigSwitchField, {
                  id: "lossless_scaling_legacy_auto_detect",
                  modelValue: losslessLegacyAutoDetect.value,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => losslessLegacyAutoDetect.value = $event),
                  label: _ctx.$t("config.lossless_scaling_legacy_auto_detect_label"),
                  desc: _ctx.$t("config.lossless_scaling_legacy_auto_detect_desc"),
                  class: "flex-1",
                  size: "small"
                }, null, 8, ["modelValue", "label", "desc"])
              ])
            ]),
            showLosslessAdvanced.value ? (openBlock(), createElementBlock("div", _hoisted_12$1, [
              createVNode(ConfigFieldRenderer, {
                "setting-key": "lossless_scaling_path",
                modelValue: unref(config).lossless_scaling_path,
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(config).lossless_scaling_path = $event),
                label: "Lossless Scaling executable",
                desc: "",
                placeholder: LOSSLESS_DEFAULT_PATH,
                clearable: ""
              }, {
                actions: withCtx(() => [
                  createBaseVNode("div", _hoisted_13$1, [
                    createVNode(unref(NButton), {
                      size: "tiny",
                      tertiary: "",
                      onClick: applyLosslessSuggestion
                    }, {
                      default: withCtx(() => _cache[11] || (_cache[11] = [
                        createTextVNode(
                          " Use Suggested ",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [11]
                    }),
                    createVNode(unref(NButton), {
                      size: "tiny",
                      tertiary: "",
                      onClick: openLosslessBrowse
                    }, {
                      default: withCtx(() => _cache[12] || (_cache[12] = [
                        createTextVNode(
                          "Browse…",
                          -1
                          /* CACHED */
                        )
                      ])),
                      _: 1,
                      __: [12]
                    })
                  ])
                ]),
                default: withCtx(() => [
                  createTextVNode(" Default installation: " + toDisplayString(LOSSLESS_DEFAULT_PATH))
                ]),
                _: 1
                /* STABLE */
              }, 8, ["modelValue"])
            ])) : createCommentVNode("v-if", true)
          ])) : createCommentVNode("v-if", true)
        ]),
        shouldShowNvenc.value ? (openBlock(), createElementBlock("div", _hoisted_14$1, [
          createVNode(NvidiaNvencEncoder)
        ])) : createCommentVNode("v-if", true),
        shouldShowQsv.value ? (openBlock(), createElementBlock("div", _hoisted_15$1, [
          createVNode(IntelQuickSyncEncoder)
        ])) : createCommentVNode("v-if", true),
        shouldShowAmd.value ? (openBlock(), createBlock(AmdAmfEncoder, { key: 2 })) : createCommentVNode("v-if", true),
        shouldShowVideotoolbox.value ? (openBlock(), createBlock(VideotoolboxEncoder, { key: 3 })) : createCommentVNode("v-if", true),
        shouldShowVaapi.value ? (openBlock(), createBlock(VAAPIEncoder, { key: 4 })) : createCommentVNode("v-if", true),
        shouldShowSoftware.value ? (openBlock(), createElementBlock("div", _hoisted_16$1, [
          createVNode(SoftwareEncoder)
        ])) : createCommentVNode("v-if", true),
        createVNode(unref(NModal), {
          show: losslessBrowseVisible.value,
          "onUpdate:show": _cache[7] || (_cache[7] = ($event) => losslessBrowseVisible.value = $event),
          preset: "card",
          class: "max-w-2xl",
          title: "Select Lossless Scaling Executable"
        }, {
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_17$1, [
              !losslessCandidates.value.length ? (openBlock(), createBlock(unref(NAlert), {
                key: 0,
                type: "info",
                size: "small"
              }, {
                default: withCtx(() => _cache[15] || (_cache[15] = [
                  createTextVNode(
                    " Vibeshine searched common Steam and program directories but could not locate LosslessScaling.exe. Install Lossless Scaling from Steam or set the full path manually. ",
                    -1
                    /* CACHED */
                  )
                ])),
                _: 1,
                __: [15]
              })) : (openBlock(), createElementBlock("div", _hoisted_18$1, [
                _cache[16] || (_cache[16] = createBaseVNode(
                  "div",
                  { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                  " Detected installations ",
                  -1
                  /* CACHED */
                )),
                createVNode(unref(NRadioGroup), {
                  value: losslessBrowseSelection.value,
                  "onUpdate:value": _cache[5] || (_cache[5] = ($event) => losslessBrowseSelection.value = $event),
                  class: "space-y-2"
                }, {
                  default: withCtx(() => [
                    (openBlock(true), createElementBlock(
                      Fragment,
                      null,
                      renderList(losslessCandidates.value, (candidate) => {
                        return openBlock(), createElementBlock("div", {
                          key: candidate,
                          class: "rounded-md border border-dark/10 px-3 py-2 text-xs dark:border-light/10"
                        }, [
                          createVNode(unref(NRadio), { value: candidate }, {
                            default: withCtx(() => [
                              createTextVNode(
                                toDisplayString(candidate),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["value"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["value"])
              ])),
              losslessCheckedIsDirectory.value && !losslessPathExists.value ? (openBlock(), createBlock(unref(NAlert), {
                key: 2,
                type: "warning",
                size: "small"
              }, {
                default: withCtx(() => _cache[17] || (_cache[17] = [
                  createTextVNode(
                    " The current configuration points at a folder. Choose LosslessScaling.exe directly. ",
                    -1
                    /* CACHED */
                  )
                ])),
                _: 1,
                __: [17]
              })) : createCommentVNode("v-if", true),
              createBaseVNode("div", _hoisted_19$1, [
                createVNode(unref(NButton), {
                  size: "small",
                  tertiary: "",
                  onClick: rescanLosslessCandidates,
                  loading: losslessLoading.value
                }, {
                  default: withCtx(() => _cache[18] || (_cache[18] = [
                    createTextVNode(
                      " Rescan ",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [18]
                }, 8, ["loading"]),
                createBaseVNode("div", _hoisted_20$1, [
                  createVNode(unref(NButton), {
                    size: "small",
                    tertiary: "",
                    onClick: _cache[6] || (_cache[6] = ($event) => losslessBrowseVisible.value = false)
                  }, {
                    default: withCtx(() => _cache[19] || (_cache[19] = [
                      createTextVNode(
                        "Cancel",
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [19]
                  }),
                  createVNode(unref(NButton), {
                    size: "small",
                    type: "primary",
                    disabled: !losslessBrowseSelection.value,
                    onClick: applyLosslessBrowseSelection
                  }, {
                    default: withCtx(() => _cache[20] || (_cache[20] = [
                      createTextVNode(
                        " Use Selected Path ",
                        -1
                        /* CACHED */
                      )
                    ])),
                    _: 1,
                    __: [20]
                  }, 8, ["disabled"])
                ])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["show"])
      ]);
    };
  }
});
const Capture_vue_vue_type_style_index_0_scoped_8dad9499_lang = "";
const Capture = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-8dad9499"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/configs/tabs/Capture.vue"]]);
const _hoisted_1 = { class: "sticky top-0 z-20 -mx-0 md:-mx-2 xl:-mx-6 px-0 md:px-2 xl:px-6 py-3 bg-light/70 dark:bg-dark/60 backdrop-blur supports-[backdrop-filter]:bg-light/50 supports-[backdrop-filter]:dark:bg-dark/40 border-b border-dark/10 dark:border-light/10" };
const _hoisted_2 = { class: "flex items-center justify-between gap-4 flex-wrap" };
const _hoisted_3 = { class: "min-w-0" };
const _hoisted_4 = {
  key: 0,
  class: "mt-2 inline-flex items-center gap-2 rounded-md border border-warning/35 bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning dark:border-warning/40 dark:bg-warning/10 dark:text-warning/90"
};
const _hoisted_5 = { class: "relative flex-1 max-w-2xl min-w-[260px]" };
const _hoisted_6 = {
  key: 0,
  class: "absolute mt-2 w-full max-w-full z-30 bg-light/95 dark:bg-surface/95 backdrop-blur rounded-md shadow-lg border border-dark/10 dark:border-light/10 max-h-80 overflow-auto overflow-x-hidden overscroll-contain scroll-stable pr-2 py-1"
};
const _hoisted_7 = {
  key: 0,
  class: "px-3 py-2 text-xs opacity-60"
};
const _hoisted_8 = { class: "w-full max-w-full text-left flex items-start gap-2 py-0.5" };
const _hoisted_9 = { class: "shrink-0 mt-0.5" };
const _hoisted_10 = { class: "min-w-0" };
const _hoisted_11 = { class: "block font-medium break-words whitespace-normal" };
const _hoisted_12 = { class: "block text-xs opacity-80 leading-5 break-words whitespace-normal" };
const _hoisted_13 = {
  key: 0,
  class: "block text-xs opacity-70 break-words whitespace-normal leading-5"
};
const _hoisted_14 = {
  key: 1,
  class: "block text-xs opacity-80 mt-1 break-words whitespace-normal leading-5"
};
const _hoisted_15 = {
  key: 0,
  class: "flex items-center gap-3"
};
const _hoisted_16 = {
  key: 1,
  class: "text-xs font-medium min-h-[1rem] flex items-center gap-2"
};
const _hoisted_17 = { key: 0 };
const _hoisted_18 = {
  key: 0,
  class: "text-success"
};
const _hoisted_19 = {
  key: 0,
  class: "space-y-4"
};
const _hoisted_20 = ["id"];
const _hoisted_21 = { class: "w-full flex items-center justify-between" };
const _hoisted_22 = { class: "font-semibold" };
const _hoisted_23 = ["id"];
const _hoisted_24 = {
  key: 1,
  class: "text-xs opacity-60 space-y-2"
};
const _hoisted_25 = { key: 0 };
const _hoisted_26 = {
  key: 1,
  class: "text-danger space-y-2"
};
const _hoisted_27 = {
  key: 2,
  class: "opacity-60"
};
const _hoisted_28 = { class: "text-xs" };
const _hoisted_29 = {
  key: 0,
  class: "text-success"
};
const _hoisted_30 = {
  key: 0,
  class: "text-success"
};
const _hoisted_31 = {
  key: 0,
  class: "fixed bottom-4 right-6 z-30"
};
const _hoisted_32 = { class: "flex items-center gap-3" };
const _hoisted_33 = { class: "text-xs font-medium inline-flex items-center gap-2" };
const _hoisted_34 = {
  key: 0,
  class: "mt-1 text-xs text-danger leading-snug"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SettingsView",
  setup(__props) {
    const store = useConfigStore();
    const { config, metadata } = storeToRefs(store);
    const platform = computed(() => {
      var _a;
      return (((_a = metadata.value) == null ? void 0 : _a.platform) || "").toLowerCase();
    });
    const message = useMessage();
    const auth = useAuthStore();
    const isLoading = computed(() => store.loading === true);
    const isError = computed(() => store.error != null);
    const isReady = computed(() => !!config.value && !isLoading.value && !isError.value);
    const saveState = computed(() => store.savingState || "idle");
    const restarted = ref(false);
    const dirty = ref(false);
    const autoSave = ref(true);
    const manualUnsaved = computed(() => store.manualDirty === true);
    const showSave = computed(() => manualUnsaved.value || !autoSave.value);
    const unsavedLabel = computed(
      () => manualUnsaved.value ? "Manual save required for recent changes; these settings will not auto-save." : "Unsaved changes"
    );
    const mainEl = ref(null);
    const searchQuery = ref("");
    const searchOpen = ref(false);
    const searchResults = ref([]);
    const searchIndex = ref([]);
    const sectionRefs = /* @__PURE__ */ new Map();
    function setSectionRef(id, el) {
      if (el)
        sectionRefs.set(id, el);
      else
        sectionRefs.delete(id);
    }
    const tabs = [
      { id: "general", name: "General", component: markRaw(General) },
      { id: "input", name: "Input", component: markRaw(Inputs) },
      { id: "av", name: "Audio / Video", component: markRaw(AudioVideo) },
      { id: "capture", name: "Capture", component: markRaw(Capture) },
      { id: "network", name: "Network", component: markRaw(Network) },
      { id: "files", name: "Files", component: markRaw(Files) },
      { id: "advanced", name: "Advanced", component: markRaw(Advanced) },
      { id: "playnite", name: "Playnite", component: markRaw(Playnite) }
    ];
    const tabsFiltered = computed(
      () => tabs.filter((t) => t.id === "rtss" ? platform.value === "windows" : true)
    );
    const openSections = ref(/* @__PURE__ */ new Set(["general"]));
    const isOpen = (id) => openSections.value.has(id);
    const toggle = (id) => {
      const s = new Set(openSections.value);
      s.has(id) ? s.delete(id) : s.add(id);
      openSections.value = s;
      if (s.has(id))
        queueBuildIndex();
    };
    let suppressRouteScroll = false;
    const route = useRoute();
    const router = useRouter();
    async function runRouteJump(rawJump) {
      if (typeof rawJump !== "string")
        return;
      const query = rawJump.trim();
      if (!query)
        return;
      queueBuildIndex();
      await nextTick();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      searchQuery.value = query;
      await nextTick();
      if (searchResults.value.length) {
        await goTo(searchResults.value[0]);
      }
    }
    onMounted(async () => {
      try {
        if (auth && typeof auth.init === "function")
          await auth.init();
      } catch (err) {
        console.warn("auth.init failed", err);
      }
      await auth.waitForAuthentication();
      await store.fetchConfig();
      if (config.value)
        queueBuildIndex();
      if (typeof route.query.sec === "string") {
        if (isReady.value) {
          await nextTick();
          setTimeout(() => scrollToOpen(route.query.sec), 0);
        } else {
          const stop = watch(
            () => isReady.value,
            async (ready) => {
              if (ready) {
                stop();
                await nextTick();
                setTimeout(() => scrollToOpen(route.query.sec), 0);
              }
            },
            { immediate: false }
          );
        }
      }
      if (typeof route.query.jump === "string") {
        if (isReady.value) {
          await runRouteJump(route.query.jump);
        } else {
          const stop = watch(
            () => isReady.value,
            async (ready) => {
              if (ready) {
                stop();
                await runRouteJump(route.query.jump);
              }
            },
            { immediate: false }
          );
        }
      }
    });
    let authTimer = null;
    watch(
      () => ({ ready: auth.ready, authed: auth.isAuthenticated }),
      () => {
        clearTimeout(authTimer);
        authTimer = setTimeout(() => queueBuildIndex(), 120);
      },
      { deep: true }
    );
    onUnmounted(() => {
      if (authTimer)
        clearTimeout(authTimer);
    });
    async function save() {
      if (!auth.isAuthenticated)
        return;
      if (!config.value)
        return;
      restarted.value = false;
      const ok = await (store.save ? store.save() : Promise.resolve(false));
      if (ok) {
        dirty.value = false;
      } else {
        try {
          message.error(store.validationError || "Save failed. Check fields for errors.", {
            duration: 5e3
          });
        } catch {
        }
      }
    }
    async function apply() {
      await save();
      if (saveState.value !== "saved")
        return;
      restarted.value = true;
      try {
        const res = await http.post(
          "/api/restart",
          {},
          { headers: { "Content-Type": "application/json" }, validateStatus: () => true }
        );
        if (!res || res.status >= 400) {
          console.warn("Restart request failed", res == null ? void 0 : res.status);
          restarted.value = false;
        }
      } catch (err) {
        console.warn("Restart failed", err);
        restarted.value = false;
      } finally {
        setTimeout(() => {
          restarted.value = false;
        }, 5e3);
      }
    }
    watch(
      () => store.version,
      (v, oldV) => {
        if (!isReady.value || oldV === void 0)
          return;
        dirty.value = true;
        if (store.savingState !== void 0)
          store.savingState = "dirty";
      }
    );
    const goSection = (id) => {
      const dest = { path: "/settings", query: { sec: id } };
      route.path === "/settings" ? router.replace(dest) : router.push(dest);
    };
    async function ensureSectionOpen(id) {
      if (!id)
        return;
      if (!isOpen(id))
        toggle(id);
      await nextTick();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    async function scrollToOpen(id) {
      if (!id)
        return;
      await ensureSectionOpen(id);
      const el = sectionRefs.get(id);
      if (el)
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    watch(
      () => route.query.sec,
      (id) => {
        if (typeof id !== "string")
          return;
        if (suppressRouteScroll)
          return;
        if (isReady.value) {
          scrollToOpen(id);
        } else {
          const stop = watch(
            () => isReady.value,
            (ready) => {
              if (ready) {
                stop();
                scrollToOpen(id);
              }
            },
            { immediate: false }
          );
        }
      }
    );
    watch(
      () => route.query.jump,
      async (jump) => {
        if (!isReady.value)
          return;
        await runRouteJump(jump);
      }
    );
    function buildSearchIndex() {
      var _a, _b;
      const root = mainEl.value;
      if (!root)
        return;
      const items = [];
      const seen = /* @__PURE__ */ new Set();
      const selectorTargets = 'input,select,textarea,.form-control,.n-input,.n-select,.n-input-number,.n-checkbox input,.n-switch input,[contenteditable="true"]';
      const sections = Array.from(root.querySelectorAll("section[id]"));
      const isDescClass = (cls) => !!cls && (cls.includes("text-xs") || cls.includes("form-text") || cls.includes("text-xs"));
      const extractDescription = (sourceEl, explicit) => {
        if (explicit && explicit.trim().length)
          return explicit.trim();
        if (!sourceEl)
          return "";
        let descText = "";
        try {
          const container = sourceEl.parentElement;
          if (container) {
            const candidate = Array.from(container.querySelectorAll("div,p,small")).find(
              (d) => d !== sourceEl && isDescClass(d.className) && d.textContent.trim().length > 0
            );
            if (candidate)
              descText = candidate.textContent.trim();
          }
          if (!descText) {
            let sib = sourceEl.nextElementSibling;
            let steps = 0;
            while (sib && steps < 6) {
              if (isDescClass(sib.className) && sib.textContent.trim()) {
                descText = sib.textContent.trim();
                break;
              }
              sib = sib.nextElementSibling;
              steps++;
            }
          }
        } catch (err) {
          console.warn("buildSearchIndex: description extraction failed", err);
        }
        return descText;
      };
      const resolveTarget = (sectionEl, sourceEl, forId, targetOverride) => {
        var _a2, _b2, _c, _d;
        if (targetOverride)
          return targetOverride;
        let target = null;
        const lookupId = forId || ((_a2 = sourceEl == null ? void 0 : sourceEl.getAttribute) == null ? void 0 : _a2.call(sourceEl, "data-search-target")) || null;
        if (lookupId) {
          try {
            target = sectionEl.querySelector("#" + CSS.escape(lookupId));
          } catch (err) {
            console.warn("buildSearchIndex: CSS.escape lookup failed", err);
          }
        }
        if (!target && sourceEl) {
          const container = ((_b2 = sourceEl.closest) == null ? void 0 : _b2.call(sourceEl, "div")) || sourceEl.parentElement;
          if (container) {
            target = container.querySelector(selectorTargets);
            if (!target)
              target = container.querySelector(".n-checkbox, .n-switch");
          }
          if (!target)
            target = ((_c = sourceEl.querySelector) == null ? void 0 : _c.call(sourceEl, selectorTargets)) || null;
        }
        if (!target && lookupId) {
          target = sectionEl.querySelector(selectorTargets + `[name="${lookupId}"]`);
        }
        if (!target && sourceEl) {
          target = ((_d = sourceEl.closest) == null ? void 0 : _d.call(sourceEl, ".n-checkbox, .n-switch")) || null;
        }
        return target;
      };
      const extractOptions = (target, sourceEl) => {
        var _a2, _b2;
        let optionsList = [];
        let optionsText = "";
        const optionSource = ((_a2 = target == null ? void 0 : target.closest) == null ? void 0 : _a2.call(target, "[data-search-options]")) || target || sourceEl;
        try {
          if (target && target.tagName && target.tagName.toLowerCase() === "select") {
            optionsList = Array.from(target.querySelectorAll("option")).map((o) => {
              var _a3;
              return {
                text: (o.textContent || "").trim(),
                value: ((_a3 = o.value) == null ? void 0 : _a3.trim()) || ""
              };
            });
          }
          if ((!optionsList || optionsList.length === 0) && optionSource) {
            const ds = ((_b2 = optionSource.getAttribute) == null ? void 0 : _b2.call(optionSource, "data-search-options")) || "";
            if (ds && typeof ds === "string") {
              optionsList = ds.split("|").map((chunk) => chunk.trim()).filter(Boolean).map((pair) => {
                const [textRaw, valRaw] = pair.split("::");
                const text = (textRaw || "").trim();
                const value = (valRaw || "").trim();
                return { text, value };
              }).filter((o) => o.text || o.value);
            }
          }
          if (optionsList && optionsList.length) {
            optionsText = optionsList.map((o) => `${o.text || ""} ${o.value || ""}`.trim()).filter(Boolean).join(" | ");
          }
        } catch (err) {
          optionsList = [];
          optionsText = "";
          console.warn("buildSearchIndex: options extraction failed", err);
        }
        return { optionsList, optionsText };
      };
      const register = (sectionEl, sectionId, sectionTitle, labelText, sourceEl, explicitDesc, targetOverride) => {
        var _a2;
        const label = (labelText || "").trim();
        if (!label)
          return;
        const target = resolveTarget(sectionEl, sourceEl, (_a2 = sourceEl == null ? void 0 : sourceEl.getAttribute) == null ? void 0 : _a2.call(sourceEl, "for"), targetOverride);
        if (!target)
          return;
        const key = `${sectionId ?? "unknown"}::${label}`;
        if (seen.has(key))
          return;
        seen.add(key);
        const desc = extractDescription(sourceEl, explicitDesc);
        const { optionsList, optionsText } = extractOptions(target, sourceEl);
        items.push({
          sectionId,
          label,
          path: `${sectionTitle} › ${label}`,
          el: target,
          desc,
          options: optionsList,
          optionsText
        });
      };
      for (const sec of sections) {
        const sectionId = sec.getAttribute("id");
        const sectionTitle = ((_b = (_a = sec.querySelector("h3")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || sectionId || "";
        for (const lbl of Array.from(sec.querySelectorAll("label"))) {
          register(sec, sectionId, sectionTitle, lbl.textContent || "", lbl);
        }
        for (const proxy of Array.from(sec.querySelectorAll("[data-search-label]"))) {
          const label = proxy.getAttribute("data-search-label") || "";
          const desc = proxy.getAttribute("data-search-desc") || "";
          const defText = proxy.getAttribute("data-search-default") || "";
          const combinedDesc = [desc, defText].filter((part) => part && part.trim().length).join(" ");
          let target = null;
          const targetId = proxy.getAttribute("data-search-target");
          if (targetId) {
            try {
              target = sec.querySelector("#" + CSS.escape(targetId));
            } catch (err) {
              console.warn("buildSearchIndex: CSS.escape lookup failed", err);
            }
          }
          register(sec, sectionId, sectionTitle, label, proxy, combinedDesc, target);
        }
      }
      searchIndex.value = items;
    }
    let buildPending = false;
    function queueBuildIndex() {
      if (buildPending)
        return;
      buildPending = true;
      requestAnimationFrame(() => {
        buildPending = false;
        buildSearchIndex();
      });
    }
    watch(searchQuery, (q) => {
      const v = (q || "").trim().toLowerCase();
      const terms = v.split(/\s+/).filter(Boolean);
      searchOpen.value = terms.length > 0;
      if (!terms.length) {
        searchResults.value = [];
        return;
      }
      const scoreFor = (it) => {
        const lv = it.label.toLowerCase();
        const pv = it.path.toLowerCase();
        const dv = (it.desc || "").toLowerCase();
        const ov = (it.optionsText || "").toLowerCase();
        const kv = (it.key || "").toLowerCase();
        let total = 0;
        for (const term of terms) {
          let s = 0;
          if (lv.includes(term)) {
            s += 100 - lv.indexOf(term);
            if (lv.startsWith(term))
              s += 50;
          } else if (kv.includes(term)) {
            s += 90 - kv.indexOf(term);
          } else if (ov.includes(term)) {
            s += 60 - ov.indexOf(term) / 10;
          } else if (pv.includes(term)) {
            s += 40 - pv.indexOf(term) / 100;
          } else if (dv.includes(term)) {
            s += 20 - dv.indexOf(term) / 1e3;
          } else {
            return 0;
          }
          total += s;
        }
        total -= (pv.length + dv.length + ov.length) / 1e3;
        return total;
      };
      searchResults.value = searchIndex.value.map((it) => ({ it, s: scoreFor(it) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 15).map((x) => x.it);
    });
    async function jumpFirstResult() {
      if (searchResults.value.length)
        await goTo(searchResults.value[0]);
    }
    async function goTo(item) {
      if (!item)
        return;
      searchOpen.value = false;
      let suppressing = false;
      try {
        if (item.sectionId) {
          suppressRouteScroll = true;
          suppressing = true;
          goSection(item.sectionId);
          await ensureSectionOpen(item.sectionId);
        }
        await nextTick();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        let target = item.el || null;
        if (target) {
          try {
            const wrapper = target.closest(
              ".n-input, .n-select, .n-input-number, .n-checkbox, .n-switch, .form-control"
            );
            if (wrapper)
              target = wrapper;
          } catch {
          }
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          flash(target);
        }
      } catch (err) {
        console.warn("goTo: scroll/flash failed", err);
      } finally {
        if (suppressing)
          suppressRouteScroll = false;
      }
    }
    function flash(el) {
      var _a;
      let target = el;
      try {
        const wrapper = (_a = target == null ? void 0 : target.closest) == null ? void 0 : _a.call(
          target,
          ".n-input, .n-select, .n-input-number, .n-checkbox, .n-switch, .form-control"
        );
        if (wrapper)
          target = wrapper;
      } catch {
      }
      target == null ? void 0 : target.classList.add("flash-highlight");
      setTimeout(() => target == null ? void 0 : target.classList.remove("flash-highlight"), 5200);
    }
    function onSearchFocus() {
      searchOpen.value = (searchQuery.value || "").length > 0;
    }
    function onSearchBlur() {
      setTimeout(() => {
        searchOpen.value = false;
      }, 120);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        "main",
        {
          ref_key: "mainEl",
          ref: mainEl,
          class: "flex-1 px-0 md:px-2 xl:px-6 py-2 md:py-6 space-y-6 overflow-x-hidden"
        },
        [
          createBaseVNode("header", _hoisted_1, [
            createBaseVNode("div", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                _cache[2] || (_cache[2] = createBaseVNode(
                  "h2",
                  { class: "text-base font-semibold" },
                  "Settings",
                  -1
                  /* CACHED */
                )),
                _cache[3] || (_cache[3] = createBaseVNode(
                  "p",
                  { class: "text-xs opacity-80" },
                  " Configuration auto-saves; restart to apply runtime changes. ",
                  -1
                  /* CACHED */
                )),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    manualUnsaved.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
                      createVNode(LucideIcon, {
                        name: "fa-circle-exclamation",
                        size: 12
                      }),
                      createBaseVNode(
                        "span",
                        null,
                        toDisplayString(unsavedLabel.value),
                        1
                        /* TEXT */
                      )
                    ])) : createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                })
              ]),
              createBaseVNode("div", _hoisted_5, [
                createVNode(unref(__unplugin_components_0), {
                  value: searchQuery.value,
                  "onUpdate:value": _cache[0] || (_cache[0] = ($event) => searchQuery.value = $event),
                  type: "text",
                  placeholder: "Search settings... (Enter to jump)",
                  onFocus: onSearchFocus,
                  onBlur: onSearchBlur,
                  onKeydown: withKeys(withModifiers(jumpFirstResult, ["prevent"]), ["enter"])
                }, {
                  suffix: withCtx(() => [
                    createVNode(LucideIcon, {
                      name: "fa-magnifying-glass",
                      size: 14,
                      class: "opacity-60"
                    })
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["value", "onKeydown"]),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    searchOpen.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
                      searchResults.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_7, " No results ")) : createCommentVNode("v-if", true),
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(searchResults.value, (r, idx) => {
                          return openBlock(), createBlock(unref(NButton), {
                            key: idx,
                            type: "default",
                            strong: "",
                            block: "",
                            class: "justify-start !px-3 !py-2.5 !h-auto text-left leading-5 text-[13px] whitespace-normal",
                            onClick: ($event) => goTo(r)
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_8, [
                                createBaseVNode("span", _hoisted_9, [
                                  createVNode(LucideIcon, {
                                    name: "fa-compass",
                                    size: 14,
                                    class: "text-primary"
                                  })
                                ]),
                                createBaseVNode("span", _hoisted_10, [
                                  createBaseVNode(
                                    "span",
                                    _hoisted_11,
                                    toDisplayString(r.label),
                                    1
                                    /* TEXT */
                                  ),
                                  createBaseVNode(
                                    "span",
                                    _hoisted_12,
                                    toDisplayString(r.path),
                                    1
                                    /* TEXT */
                                  ),
                                  r.desc ? (openBlock(), createElementBlock(
                                    "span",
                                    _hoisted_13,
                                    toDisplayString(r.desc),
                                    1
                                    /* TEXT */
                                  )) : createCommentVNode("v-if", true),
                                  r.options && r.options.length ? (openBlock(), createElementBlock(
                                    "span",
                                    _hoisted_14,
                                    "Options: " + toDisplayString(r.options.map(
                                      (o) => o.text && o.value ? `${o.text} (${o.value})` : o.text || o.value
                                    ).filter(Boolean).join(", ")),
                                    1
                                    /* TEXT */
                                  )) : createCommentVNode("v-if", true)
                                ])
                              ])
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                })
              ]),
              showSave.value ? (openBlock(), createElementBlock("div", _hoisted_15, [
                saveState.value === "saved" && !restarted.value ? (openBlock(), createBlock(unref(NButton), {
                  key: 0,
                  type: "primary",
                  strong: "",
                  onClick: apply
                }, {
                  default: withCtx(() => _cache[4] || (_cache[4] = [
                    createTextVNode(
                      "Apply",
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [4]
                })) : createCommentVNode("v-if", true)
              ])) : (openBlock(), createElementBlock("div", _hoisted_16, [
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    saveState.value === "saving" ? (openBlock(), createElementBlock("span", _hoisted_17, "Saving…")) : createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }),
                createVNode(Transition, { name: "fade" }, {
                  default: withCtx(() => [
                    saveState.value === "saved" ? (openBlock(), createElementBlock("span", _hoisted_18, "Saved")) : createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                })
              ]))
            ])
          ]),
          isReady.value ? (openBlock(), createElementBlock("div", _hoisted_19, [
            (openBlock(true), createElementBlock(
              Fragment,
              null,
              renderList(tabsFiltered.value, (tab) => {
                return openBlock(), createElementBlock("section", {
                  id: tab.id,
                  key: tab.id,
                  ref_for: true,
                  ref: (el) => setSectionRef(tab.id, el),
                  class: "scroll-mt-24"
                }, [
                  createVNode(unref(NButton), {
                    block: "",
                    type: "default",
                    strong: "",
                    class: "justify-between !px-3 !py-2 bg-light/80 dark:bg-surface/70 backdrop-blur border border-dark/10 dark:border-light/10 rounded-xl",
                    "aria-expanded": isOpen(tab.id),
                    "aria-controls": tab.id + "-panel",
                    onClick: ($event) => toggle(tab.id)
                  }, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_21, [
                        createBaseVNode(
                          "span",
                          _hoisted_22,
                          toDisplayString(_ctx.$t(tab.name)),
                          1
                          /* TEXT */
                        ),
                        createBaseVNode(
                          "i",
                          {
                            class: normalizeClass([
                              "fas text-xs transition-transform",
                              isOpen(tab.id) ? "fa-chevron-up" : "fa-chevron-down"
                            ])
                          },
                          null,
                          2
                          /* CLASS */
                        )
                      ])
                    ]),
                    _: 2
                    /* DYNAMIC */
                  }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
                  createVNode(
                    Transition,
                    {
                      name: "fade",
                      persisted: ""
                    },
                    {
                      default: withCtx(() => [
                        withDirectives(createBaseVNode("div", {
                          id: tab.id + "-panel",
                          class: "mt-2 bg-light/80 dark:bg-surface/70 backdrop-blur-sm border border-dark/5 dark:border-light/5 rounded-xl shadow-sm p-6 space-y-6"
                        }, [
                          (openBlock(), createBlock(resolveDynamicComponent(tab.component)))
                        ], 8, _hoisted_23), [
                          [vShow, isOpen(tab.id)]
                        ])
                      ]),
                      _: 2
                      /* DYNAMIC */
                    },
                    1024
                    /* DYNAMIC_SLOTS */
                  )
                ], 8, _hoisted_20);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (openBlock(), createElementBlock("div", _hoisted_24, [
            isLoading.value ? (openBlock(), createElementBlock("div", _hoisted_25, "Loading...")) : isError.value ? (openBlock(), createElementBlock("div", _hoisted_26, [
              _cache[6] || (_cache[6] = createBaseVNode(
                "div",
                null,
                "Failed to load configuration.",
                -1
                /* CACHED */
              )),
              createVNode(unref(NButton), {
                type: "primary",
                strong: "",
                disabled: isLoading.value,
                onClick: _cache[1] || (_cache[1] = ($event) => {
                  var _a, _b;
                  return (_b = (_a = unref(store)).reloadConfig) == null ? void 0 : _b.call(_a);
                })
              }, {
                default: withCtx(() => _cache[5] || (_cache[5] = [
                  createTextVNode(
                    "Retry",
                    -1
                    /* CACHED */
                  )
                ])),
                _: 1,
                __: [5]
              }, 8, ["disabled"])
            ])) : (openBlock(), createElementBlock("div", _hoisted_27, "No configuration loaded."))
          ])),
          createBaseVNode("div", _hoisted_28, [
            createVNode(Transition, { name: "fade" }, {
              default: withCtx(() => [
                saveState.value === "saved" && !restarted.value && !autoSave.value ? (openBlock(), createElementBlock("div", _hoisted_29, " Saved. Click Apply to restart. ")) : createCommentVNode("v-if", true)
              ]),
              _: 1
              /* STABLE */
            }),
            createVNode(Transition, { name: "fade" }, {
              default: withCtx(() => [
                restarted.value ? (openBlock(), createElementBlock("div", _hoisted_30, "Restart triggered.")) : createCommentVNode("v-if", true)
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          createVNode(Transition, { name: "slide-fade" }, {
            default: withCtx(() => [
              dirty.value && !autoSave.value || manualUnsaved.value ? (openBlock(), createElementBlock("div", _hoisted_31, [
                createBaseVNode(
                  "div",
                  {
                    class: normalizeClass([
                      "backdrop-blur rounded-lg shadow px-4 py-2 border transition-colors duration-200 ease-out",
                      manualUnsaved.value ? "bg-warning/95 text-dark border-warning/60 dark:bg-warning/20 dark:text-warning dark:border-warning/40" : "bg-light/90 dark:bg-surface/90 border-dark/10 dark:border-light/10"
                    ])
                  },
                  [
                    createBaseVNode("div", _hoisted_32, [
                      createBaseVNode("span", _hoisted_33, [
                        manualUnsaved.value ? (openBlock(), createBlock(LucideIcon, {
                          key: 0,
                          name: "fa-circle-exclamation",
                          size: 14,
                          class: "text-warning dark:text-warning"
                        })) : createCommentVNode("v-if", true),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(unsavedLabel.value),
                          1
                          /* TEXT */
                        )
                      ]),
                      createVNode(unref(NButton), {
                        type: manualUnsaved.value ? "warning" : "primary",
                        strong: "",
                        disabled: saveState.value === "saving",
                        onClick: save
                      }, {
                        default: withCtx(() => _cache[7] || (_cache[7] = [
                          createTextVNode(
                            "Save",
                            -1
                            /* CACHED */
                          )
                        ])),
                        _: 1,
                        __: [7]
                      }, 8, ["type", "disabled"])
                    ]),
                    saveState.value === "error" ? (openBlock(), createElementBlock(
                      "div",
                      _hoisted_34,
                      toDisplayString(unref(store).validationError || "Save failed. Check fields for errors."),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])) : createCommentVNode("v-if", true)
            ]),
            _: 1
            /* STABLE */
          })
        ],
        512
        /* NEED_PATCH */
      );
    };
  }
});
const SettingsView_vue_vue_type_style_index_0_scoped_ccfec7b0_lang = "";
const SettingsView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ccfec7b0"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/SettingsView.vue"]]);
export {
  SettingsView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NWaWV3LTg0ZGE0ZDk0LmpzIiwic291cmNlcyI6WyIuLi8uLi9jb25maWdzL3RhYnMvR2VuZXJhbC52dWUiLCIuLi8uLi9jb25maWdzL3RhYnMvSW5wdXRzLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9OZXR3b3JrLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9GaWxlcy52dWUiLCIuLi8uLi9jb25maWdzL3RhYnMvQWR2YW5jZWQudnVlIiwiLi4vLi4vY29tcG9uZW50cy9QbGF5bml0ZVJlaW5zdGFsbEJ1dHRvbi52dWUiLCIuLi8uLi9jb25maWdzL3RhYnMvUGxheW5pdGUudnVlIiwiLi4vLi4vcGxhdGZvcm0taTE4bi50cyIsIi4uLy4uL1BsYXRmb3JtTGF5b3V0LnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0FkYXB0ZXJOYW1lU2VsZWN0b3IudnVlIiwiLi4vLi4vY29uZmlncy90YWJzL2F1ZGlvdmlkZW8vRGlzcGxheU91dHB1dFNlbGVjdG9yLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0Rpc3BsYXlEZXZpY2VPcHRpb25zLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0Rpc3BsYXlNb2Rlc1NldHRpbmdzLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0ZyYW1lTGltaXRlclN0ZXAudnVlIiwiLi4vLi4vY29uZmlncy90YWJzL0F1ZGlvVmlkZW8udnVlIiwiLi4vLi4vY29uZmlncy90YWJzL2VuY29kZXJzL052aWRpYU52ZW5jRW5jb2Rlci52dWUiLCIuLi8uLi9jb25maWdzL3RhYnMvZW5jb2RlcnMvSW50ZWxRdWlja1N5bmNFbmNvZGVyLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9lbmNvZGVycy9BbWRBbWZFbmNvZGVyLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9lbmNvZGVycy9WaWRlb3Rvb2xib3hFbmNvZGVyLnZ1ZSIsIi4uLy4uL2NvbmZpZ3MvdGFicy9lbmNvZGVycy9Tb2Z0d2FyZUVuY29kZXIudnVlIiwiLi4vLi4vY29uZmlncy90YWJzL2VuY29kZXJzL1ZBQVBJRW5jb2Rlci52dWUiLCIuLi8uLi9jb25maWdzL3RhYnMvQ2FwdHVyZS52dWUiLCIuLi8uLi92aWV3cy9TZXR0aW5nc1ZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICdAL0NoZWNrYm94LnZ1ZSc7XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgQ29uZmlnSW5wdXRGaWVsZCBmcm9tICdAL0NvbmZpZ0lucHV0RmllbGQudnVlJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQgeyBOQnV0dG9uIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5cclxudHlwZSBQcmVwQ29tbWFuZEtleSA9ICdnbG9iYWxfcHJlcF9jbWQnIHwgJ2dsb2JhbF9zdGF0ZV9jbWQnO1xyXG50eXBlIFByZXBDb21tYW5kID0geyBkbzogc3RyaW5nOyB1bmRvOiBzdHJpbmc7IGVsZXZhdGVkPzogYm9vbGVhbiB9O1xyXG50eXBlIFNlcnZlckNvbW1hbmQgPSB7IG5hbWU6IHN0cmluZzsgY21kOiBzdHJpbmc7IGVsZXZhdGVkPzogYm9vbGVhbiB9O1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCB7IGNvbmZpZywgbWV0YWRhdGEgfSA9IHN0b3JlVG9SZWZzKHN0b3JlKTtcclxuY29uc3QgcGxhdGZvcm0gPSBjb21wdXRlZCgoKSA9PiBtZXRhZGF0YS52YWx1ZT8ucGxhdGZvcm0gfHwgJycpO1xyXG5jb25zdCBwcmVwQ29tbWFuZFNlY3Rpb25zOiBSZWFkb25seUFycmF5PHtcclxuICBrZXk6IFByZXBDb21tYW5kS2V5O1xyXG4gIGxhYmVsS2V5OiBzdHJpbmc7XHJcbiAgZGVzY0tleTogc3RyaW5nO1xyXG59PiA9IFtcclxuICB7XHJcbiAgICBrZXk6ICdnbG9iYWxfcHJlcF9jbWQnLFxyXG4gICAgbGFiZWxLZXk6ICdjb25maWcuZ2xvYmFsX3ByZXBfY21kJyxcclxuICAgIGRlc2NLZXk6ICdjb25maWcuZ2xvYmFsX3ByZXBfY21kX2Rlc2MnLFxyXG4gIH0sXHJcbiAge1xyXG4gICAga2V5OiAnZ2xvYmFsX3N0YXRlX2NtZCcsXHJcbiAgICBsYWJlbEtleTogJ2NvbmZpZy5nbG9iYWxfc3RhdGVfY21kJyxcclxuICAgIGRlc2NLZXk6ICdjb25maWcuZ2xvYmFsX3N0YXRlX2NtZF9kZXNjJyxcclxuICB9LFxyXG5dO1xyXG5cclxuZnVuY3Rpb24gcHJlcENvbW1hbmRzKGtleTogUHJlcENvbW1hbmRLZXkpOiBQcmVwQ29tbWFuZFtdIHtcclxuICBjb25zdCBjdXJyZW50ID0gY29uZmlnLnZhbHVlPy5ba2V5XTtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheShjdXJyZW50KSA/IChjdXJyZW50IGFzIFByZXBDb21tYW5kW10pIDogW107XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlcnZlckNvbW1hbmRzKCk6IFNlcnZlckNvbW1hbmRbXSB7XHJcbiAgY29uc3QgY3VycmVudCA9IGNvbmZpZy52YWx1ZT8uc2VydmVyX2NtZDtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheShjdXJyZW50KSA/IChjdXJyZW50IGFzIFNlcnZlckNvbW1hbmRbXSkgOiBbXTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWFya01hbnVhbERpcnR5KCkge1xyXG4gIHN0b3JlLm1hcmtNYW51YWxEaXJ0eT8uKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFByZXBDb21tYW5kKGtleTogUHJlcENvbW1hbmRLZXkpIHtcclxuICBjb25zdCB0ZW1wbGF0ZSA9IHtcclxuICAgIGRvOiAnJyxcclxuICAgIHVuZG86ICcnLFxyXG4gICAgLi4uKHBsYXRmb3JtLnZhbHVlID09PSAnd2luZG93cycgPyB7IGVsZXZhdGVkOiBmYWxzZSB9IDoge30pLFxyXG4gIH07XHJcbiAgY29uc3QgY3VycmVudCA9IHByZXBDb21tYW5kcyhrZXkpO1xyXG4gIGNvbnN0IG5leHQgPSBbLi4uY3VycmVudCwgdGVtcGxhdGVdO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbihrZXksIG5leHQpO1xyXG4gIG1hcmtNYW51YWxEaXJ0eSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVQcmVwQ29tbWFuZChrZXk6IFByZXBDb21tYW5kS2V5LCBpbmRleDogbnVtYmVyKSB7XHJcbiAgY29uc3QgY3VycmVudCA9IFsuLi5wcmVwQ29tbWFuZHMoa2V5KV07XHJcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBjdXJyZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG4gIGN1cnJlbnQuc3BsaWNlKGluZGV4LCAxKTtcclxuICBzdG9yZS51cGRhdGVPcHRpb24oa2V5LCBjdXJyZW50KTtcclxuICBtYXJrTWFudWFsRGlydHkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU2VydmVyQ29tbWFuZCgpIHtcclxuICBjb25zdCB0ZW1wbGF0ZSA9IHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgY21kOiAnJyxcclxuICAgIC4uLihwbGF0Zm9ybS52YWx1ZSA9PT0gJ3dpbmRvd3MnID8geyBlbGV2YXRlZDogZmFsc2UgfSA6IHt9KSxcclxuICB9O1xyXG4gIGNvbnN0IG5leHQgPSBbLi4uc2VydmVyQ29tbWFuZHMoKSwgdGVtcGxhdGVdO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbignc2VydmVyX2NtZCcsIG5leHQpO1xyXG4gIG1hcmtNYW51YWxEaXJ0eSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTZXJ2ZXJDb21tYW5kKGluZGV4OiBudW1iZXIpIHtcclxuICBjb25zdCBjdXJyZW50ID0gWy4uLnNlcnZlckNvbW1hbmRzKCldO1xyXG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gY3VycmVudC5sZW5ndGgpIHJldHVybjtcclxuICBjdXJyZW50LnNwbGljZShpbmRleCwgMSk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdzZXJ2ZXJfY21kJywgY3VycmVudCk7XHJcbiAgbWFya01hbnVhbERpcnR5KCk7XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cImdlbmVyYWxcIiBjbGFzcz1cImNvbmZpZy1wYWdlXCI+XHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cImxvY2FsZVwiIHYtbW9kZWw9XCJjb25maWcubG9jYWxlXCIgY2xhc3M9XCJtYi02XCIgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cInN1bnNoaW5lX25hbWVcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnN1bnNoaW5lX25hbWVcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgICBwbGFjZWhvbGRlcj1cIlZpYmVzaGluZVwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwibWluX2xvZ19sZXZlbFwiIHYtbW9kZWw9XCJjb25maWcubWluX2xvZ19sZXZlbFwiIGNsYXNzPVwibWItNlwiIC8+XHJcblxyXG4gICAgPGRpdlxyXG4gICAgICB2LWZvcj1cInNlY3Rpb24gaW4gcHJlcENvbW1hbmRTZWN0aW9uc1wiXHJcbiAgICAgIDppZD1cInNlY3Rpb24ua2V5XCJcclxuICAgICAgOmtleT1cInNlY3Rpb24ua2V5XCJcclxuICAgICAgY2xhc3M9XCJtYi02IGZsZXggZmxleC1jb2xcIlxyXG4gICAgPlxyXG4gICAgICA8bGFiZWwgY2xhc3M9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIG1iLTEgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlxyXG4gICAgICAgIHt7ICR0KHNlY3Rpb24ubGFiZWxLZXkpIH19XHJcbiAgICAgIDwvbGFiZWw+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjAgbXQtMVwiPlxyXG4gICAgICAgIHt7ICR0KHNlY3Rpb24uZGVzY0tleSkgfX1cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgdi1pZj1cInByZXBDb21tYW5kcyhzZWN0aW9uLmtleSkubGVuZ3RoID4gMFwiIGNsYXNzPVwibXQtMyBzcGFjZS15LTNcIj5cclxuICAgICAgICA8ZGl2XHJcbiAgICAgICAgICB2LWZvcj1cIihjb21tYW5kLCBpbmRleCkgaW4gcHJlcENvbW1hbmRzKHNlY3Rpb24ua2V5KVwiXHJcbiAgICAgICAgICA6a2V5PVwiaW5kZXhcIlxyXG4gICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLW1kIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBwLTMgc3BhY2UteS0zXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj5TdGVwIHt7IGluZGV4ICsgMSB9fTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICA8Q2hlY2tib3hcclxuICAgICAgICAgICAgICAgIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCJcclxuICAgICAgICAgICAgICAgIDppZD1cImAke3NlY3Rpb24ua2V5fV9lbGV2YXRlZF8ke2luZGV4fWBcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbW1hbmQuZWxldmF0ZWRcIlxyXG4gICAgICAgICAgICAgICAgOmxhYmVsPVwiJHQoJ19jb21tb24uZWxldmF0ZWQnKVwiXHJcbiAgICAgICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWItMFwiXHJcbiAgICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwibWFya01hbnVhbERpcnR5KClcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uIHNlY29uZGFyeSBzaXplPVwic21hbGxcIiBAY2xpY2s9XCJyZW1vdmVQcmVwQ29tbWFuZChzZWN0aW9uLmtleSwgaW5kZXgpXCI+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdHJhc2hcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvbiBwcmltYXJ5IHNpemU9XCJzbWFsbFwiIEBjbGljaz1cImFkZFByZXBDb21tYW5kKHNlY3Rpb24ua2V5KVwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdXNcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0xIGdhcC0zXCI+XHJcbiAgICAgICAgICAgIDxDb25maWdJbnB1dEZpZWxkXHJcbiAgICAgICAgICAgICAgOmlkPVwiYCR7c2VjdGlvbi5rZXl9X2RvXyR7aW5kZXh9YFwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbW1hbmQuZG9cIlxyXG4gICAgICAgICAgICAgIDpsYWJlbD1cIiR0KCdfY29tbW9uLmRvX2NtZCcpXCJcclxuICAgICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxyXG4gICAgICAgICAgICAgIG1vbm9zcGFjZVxyXG4gICAgICAgICAgICAgIDphdXRvc2l6ZT1cInsgbWluUm93czogMSwgbWF4Um93czogMyB9XCJcclxuICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwibWFya01hbnVhbERpcnR5KClcIlxyXG4gICAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgICAgPENvbmZpZ0lucHV0RmllbGRcclxuICAgICAgICAgICAgICA6aWQ9XCJgJHtzZWN0aW9uLmtleX1fdW5kb18ke2luZGV4fWBcIlxyXG4gICAgICAgICAgICAgIHYtbW9kZWw9XCJjb21tYW5kLnVuZG9cIlxyXG4gICAgICAgICAgICAgIDpsYWJlbD1cIiR0KCdfY29tbW9uLnVuZG9fY21kJylcIlxyXG4gICAgICAgICAgICAgIGRlc2M9XCJcIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0YXJlYVwiXHJcbiAgICAgICAgICAgICAgbW9ub3NwYWNlXHJcbiAgICAgICAgICAgICAgOmF1dG9zaXplPVwieyBtaW5Sb3dzOiAxLCBtYXhSb3dzOiAzIH1cIlxyXG4gICAgICAgICAgICAgIEB1cGRhdGU6bW9kZWwtdmFsdWU9XCJtYXJrTWFudWFsRGlydHkoKVwiXHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwibXQtNFwiPlxyXG4gICAgICAgIDxuLWJ1dHRvbiBwcmltYXJ5IGNsYXNzPVwibXgtYXV0byBibG9ja1wiIEBjbGljaz1cImFkZFByZXBDb21tYW5kKHNlY3Rpb24ua2V5KVwiPlxyXG4gICAgICAgICAgJnBsdXM7IHt7ICR0KCdjb25maWcuYWRkJykgfX1cclxuICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgaWQ9XCJzZXJ2ZXJfY21kXCIgY2xhc3M9XCJtYi02IGZsZXggZmxleC1jb2xcIj5cclxuICAgICAgPGxhYmVsIGNsYXNzPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSBtYi0xIHRleHQtZGFyayBkYXJrOnRleHQtbGlnaHRcIj5cclxuICAgICAgICB7eyAkdCgnY29uZmlnLnNlcnZlcl9jbWQnKSB9fVxyXG4gICAgICA8L2xhYmVsPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwIG10LTFcIj5cclxuICAgICAgICB7eyAkdCgnY29uZmlnLnNlcnZlcl9jbWRfZGVzYycpIH19XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IHYtaWY9XCJzZXJ2ZXJDb21tYW5kcygpLmxlbmd0aCA+IDBcIiBjbGFzcz1cIm10LTMgc3BhY2UteS0zXCI+XHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgdi1mb3I9XCIoY29tbWFuZCwgaW5kZXgpIGluIHNlcnZlckNvbW1hbmRzKClcIlxyXG4gICAgICAgICAgOmtleT1cImluZGV4XCJcclxuICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcC0zIHNwYWNlLXktM1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+Q29tbWFuZCB7eyBpbmRleCArIDEgfX08L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgPENoZWNrYm94XHJcbiAgICAgICAgICAgICAgICB2LWlmPVwicGxhdGZvcm0gPT09ICd3aW5kb3dzJ1wiXHJcbiAgICAgICAgICAgICAgICA6aWQ9XCJgc2VydmVyX2NtZF9lbGV2YXRlZF8ke2luZGV4fWBcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbW1hbmQuZWxldmF0ZWRcIlxyXG4gICAgICAgICAgICAgICAgOmxhYmVsPVwiJHQoJ19jb21tb24uZWxldmF0ZWQnKVwiXHJcbiAgICAgICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWItMFwiXHJcbiAgICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwibWFya01hbnVhbERpcnR5KClcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uIHNlY29uZGFyeSBzaXplPVwic21hbGxcIiBAY2xpY2s9XCJyZW1vdmVTZXJ2ZXJDb21tYW5kKGluZGV4KVwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRyYXNoXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8bi1idXR0b24gcHJpbWFyeSBzaXplPVwic21hbGxcIiBAY2xpY2s9XCJhZGRTZXJ2ZXJDb21tYW5kXCI+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtcGx1c1wiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTEgZ2FwLTNcIj5cclxuICAgICAgICAgICAgPENvbmZpZ0lucHV0RmllbGRcclxuICAgICAgICAgICAgICA6aWQ9XCJgc2VydmVyX2NtZF9uYW1lXyR7aW5kZXh9YFwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbW1hbmQubmFtZVwiXHJcbiAgICAgICAgICAgICAgOmxhYmVsPVwiJHQoJ19jb21tb24ubmFtZScpXCJcclxuICAgICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwibWFya01hbnVhbERpcnR5KClcIlxyXG4gICAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgICAgPENvbmZpZ0lucHV0RmllbGRcclxuICAgICAgICAgICAgICA6aWQ9XCJgc2VydmVyX2NtZF9jbWRfJHtpbmRleH1gXCJcclxuICAgICAgICAgICAgICB2LW1vZGVsPVwiY29tbWFuZC5jbWRcIlxyXG4gICAgICAgICAgICAgIDpsYWJlbD1cIiR0KCdfY29tbW9uLmNtZCcpXCJcclxuICAgICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxyXG4gICAgICAgICAgICAgIG1vbm9zcGFjZVxyXG4gICAgICAgICAgICAgIDphdXRvc2l6ZT1cInsgbWluUm93czogMSwgbWF4Um93czogMyB9XCJcclxuICAgICAgICAgICAgICBAdXBkYXRlOm1vZGVsLXZhbHVlPVwibWFya01hbnVhbERpcnR5KClcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBjbGFzcz1cIm10LTRcIj5cclxuICAgICAgICA8bi1idXR0b24gcHJpbWFyeSBjbGFzcz1cIm14LWF1dG8gYmxvY2tcIiBAY2xpY2s9XCJhZGRTZXJ2ZXJDb21tYW5kXCI+XHJcbiAgICAgICAgICAmcGx1czsge3sgJHQoJ2NvbmZpZy5hZGQnKSB9fVxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJlbmFibGVfcGFpcmluZ1wiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuZW5hYmxlX3BhaXJpbmdcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cImVuYWJsZV9kaXNjb3ZlcnlcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmVuYWJsZV9kaXNjb3ZlcnlcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cInNlc3Npb25fdG9rZW5fdHRsX3NlY29uZHNcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnNlc3Npb25fdG9rZW5fdHRsX3NlY29uZHNcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cInJlbWVtYmVyX21lX3JlZnJlc2hfdG9rZW5fdHRsX3NlY29uZHNcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnJlbWVtYmVyX21lX3JlZnJlc2hfdG9rZW5fdHRsX3NlY29uZHNcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cInVwZGF0ZV9jaGVja19pbnRlcnZhbFwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcudXBkYXRlX2NoZWNrX2ludGVydmFsXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJub3RpZnlfcHJlX3JlbGVhc2VzXCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5ub3RpZnlfcHJlX3JlbGVhc2VzXCJcclxuICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJzeXN0ZW1fdHJheVwiIHYtbW9kZWw9XCJjb25maWcuc3lzdGVtX3RyYXlcIiBjbGFzcz1cIm1iLTNcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHYtaWY9XCJjb25maWcuc3lzdGVtX3RyYXlcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cImhpZGVfdHJheV9jb250cm9sc1wiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuaGlkZV90cmF5X2NvbnRyb2xzXCJcclxuICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgIC8+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IHsgY29uZmlnLCBtZXRhZGF0YSB9ID0gc3RvcmVUb1JlZnMoc3RvcmUpO1xyXG5cclxuY29uc3QgcGxhdGZvcm0gPSBjb21wdXRlZCgoKSA9PlxyXG4gIChtZXRhZGF0YS52YWx1ZT8ucGxhdGZvcm0gfHwgY29uZmlnLnZhbHVlPy5wbGF0Zm9ybSB8fCAnJykudG9Mb3dlckNhc2UoKSxcclxuKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cImlucHV0XCIgY2xhc3M9XCJjb25maWctcGFnZVwiPlxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJjb250cm9sbGVyXCIgdi1tb2RlbD1cImNvbmZpZy5jb250cm9sbGVyXCIgY2xhc3M9XCJtYi0zXCIgLz5cclxuXHJcbiAgICA8ZGl2IHYtaWY9XCJjb25maWcuY29udHJvbGxlciA9PT0gJ2VuYWJsZWQnICYmIHBsYXRmb3JtICE9PSAnbWFjb3MnXCIgY2xhc3M9XCJtYi02XCI+XHJcbiAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiZ2FtZXBhZFwiIHYtbW9kZWw9XCJjb25maWcuZ2FtZXBhZFwiIC8+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8dGVtcGxhdGUgdi1pZj1cImNvbmZpZy5jb250cm9sbGVyID09PSAnZW5hYmxlZCdcIj5cclxuICAgICAgPHRlbXBsYXRlXHJcbiAgICAgICAgdi1pZj1cIlxyXG4gICAgICAgICAgY29uZmlnLmdhbWVwYWQgPT09ICdkczQnIHx8XHJcbiAgICAgICAgICBjb25maWcuZ2FtZXBhZCA9PT0gJ2RzNScgfHxcclxuICAgICAgICAgIChjb25maWcuZ2FtZXBhZCA9PT0gJ2F1dG8nICYmIHBsYXRmb3JtICE9PSAnbWFjb3MnKVxyXG4gICAgICAgIFwiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibWItMyBhY2NvcmRpb25cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvcmRpb24taXRlbVwiPlxyXG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJhY2NvcmRpb24taGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJhY2NvcmRpb24tYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgZGF0YS1icy10b2dnbGU9XCJjb2xsYXBzZVwiXHJcbiAgICAgICAgICAgICAgICBkYXRhLWJzLXRhcmdldD1cIiNwYW5lbHNTdGF5T3Blbi1jb2xsYXBzZU9uZVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3tcclxuICAgICAgICAgICAgICAgICAgJHQoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmdhbWVwYWQgPT09ICdkczQnXHJcbiAgICAgICAgICAgICAgICAgICAgICA/ICdjb25maWcuZ2FtZXBhZF9kczRfbWFudWFsJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgOiBjb25maWcuZ2FtZXBhZCA9PT0gJ2RzNSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyAnY29uZmlnLmdhbWVwYWRfZHM1X21hbnVhbCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnY29uZmlnLmdhbWVwYWRfYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICBpZD1cInBhbmVsc1N0YXlPcGVuLWNvbGxhcHNlT25lXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImFjY29yZGlvbi1jb2xsYXBzZSBjb2xsYXBzZSBzaG93XCJcclxuICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJwYW5lbHNTdGF5T3Blbi1oZWFkaW5nT25lXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvcmRpb24tYm9keVwiPlxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlXHJcbiAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuZ2FtZXBhZCA9PT0gJ2F1dG8nICYmIChwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnIHx8IHBsYXRmb3JtID09PSAnbGludXgnKVxyXG4gICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmcta2V5PVwibW90aW9uX2FzX2RzNFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5tb3Rpb25fYXNfZHM0XCJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmcta2V5PVwidG91Y2hwYWRfYXNfZHM0XCJcclxuICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLnRvdWNocGFkX2FzX2RzNFwiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcblxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlXHJcbiAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuZ2FtZXBhZCA9PT0gJ2RzNCcgfHxcclxuICAgICAgICAgICAgICAgICAgICAoY29uZmlnLmdhbWVwYWQgPT09ICdhdXRvJyAmJiBwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnKVxyXG4gICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmcta2V5PVwiZHM0X2JhY2tfYXNfdG91Y2hwYWRfY2xpY2tcIlxyXG4gICAgICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcuZHM0X2JhY2tfYXNfdG91Y2hwYWRfY2xpY2tcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibWItM1wiXHJcbiAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZVxyXG4gICAgICAgICAgICAgICAgICB2LWlmPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmdhbWVwYWQgPT09ICdkczUnIHx8IChjb25maWcuZ2FtZXBhZCA9PT0gJ2F1dG8nICYmIHBsYXRmb3JtID09PSAnbGludXgnKVxyXG4gICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmcta2V5PVwiZHM1X2lucHV0dGlub19yYW5kb21pemVfbWFjXCJcclxuICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLmRzNV9pbnB1dHRpbm9fcmFuZG9taXplX21hY1wiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8L3RlbXBsYXRlPlxyXG5cclxuICAgIDxkaXYgdi1pZj1cImNvbmZpZy5jb250cm9sbGVyID09PSAnZW5hYmxlZCdcIiBjbGFzcz1cIm1iLTRcIj5cclxuICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJiYWNrX2J1dHRvbl90aW1lb3V0XCIgdi1tb2RlbD1cImNvbmZpZy5iYWNrX2J1dHRvbl90aW1lb3V0XCIgLz5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHYtaWY9XCJjb25maWcuY29udHJvbGxlciA9PT0gJ2VuYWJsZWQnXCJcclxuICAgICAgc2V0dGluZy1rZXk9XCJmb3J3YXJkX3J1bWJsZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuZm9yd2FyZF9ydW1ibGVcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8aHIgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cImtleWJvYXJkXCIgdi1tb2RlbD1cImNvbmZpZy5rZXlib2FyZFwiIGNsYXNzPVwibWItM1wiIC8+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiY29uZmlnLmtleWJvYXJkID09PSAnZW5hYmxlZCcgJiYgcGxhdGZvcm0gPT09ICd3aW5kb3dzJ1wiIGNsYXNzPVwibWItNFwiPlxyXG4gICAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cImtleV9yZXBlYXRfZGVsYXlcIiB2LW1vZGVsPVwiY29uZmlnLmtleV9yZXBlYXRfZGVsYXlcIiAvPlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiY29uZmlnLmtleWJvYXJkID09PSAnZW5hYmxlZCcgJiYgcGxhdGZvcm0gPT09ICd3aW5kb3dzJ1wiIGNsYXNzPVwibWItNFwiPlxyXG4gICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgIHNldHRpbmcta2V5PVwia2V5X3JlcGVhdF9mcmVxdWVuY3lcIlxyXG4gICAgICAgIHYtbW9kZWw9XCJjb25maWcua2V5X3JlcGVhdF9mcmVxdWVuY3lcIlxyXG4gICAgICAvPlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgdi1pZj1cImNvbmZpZy5rZXlib2FyZCA9PT0gJ2VuYWJsZWQnICYmIHBsYXRmb3JtID09PSAnd2luZG93cydcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cImFsd2F5c19zZW5kX3NjYW5jb2Rlc1wiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuYWx3YXlzX3NlbmRfc2NhbmNvZGVzXCJcclxuICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgdi1pZj1cImNvbmZpZy5rZXlib2FyZCA9PT0gJ2VuYWJsZWQnXCJcclxuICAgICAgc2V0dGluZy1rZXk9XCJrZXlfcmlnaHRhbHRfdG9fa2V5X3dpblwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcua2V5X3JpZ2h0YWx0X3RvX2tleV93aW5cIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cIm1vdXNlXCIgdi1tb2RlbD1cImNvbmZpZy5tb3VzZVwiIGNsYXNzPVwibXQtNSBtYi0zXCIgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICB2LWlmPVwiY29uZmlnLm1vdXNlID09PSAnZW5hYmxlZCdcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cImhpZ2hfcmVzb2x1dGlvbl9zY3JvbGxpbmdcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmhpZ2hfcmVzb2x1dGlvbl9zY3JvbGxpbmdcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICB2LWlmPVwiY29uZmlnLm1vdXNlID09PSAnZW5hYmxlZCdcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cIm5hdGl2ZV9wZW5fdG91Y2hcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLm5hdGl2ZV9wZW5fdG91Y2hcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8aHIgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cImVuYWJsZV9pbnB1dF9vbmx5X21vZGVcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmVuYWJsZV9pbnB1dF9vbmx5X21vZGVcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+PC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgQ29uZmlnRmllbGRSZW5kZXJlciBmcm9tICdAL0NvbmZpZ0ZpZWxkUmVuZGVyZXIudnVlJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCBjb25maWcgPSBzdG9yZS5jb25maWc7XHJcbmNvbnN0IGRlZmF1bHRNb29ubGlnaHRQb3J0ID0gNDc5ODk7XHJcbmNvbnN0IGVmZmVjdGl2ZVBvcnQgPSBjb21wdXRlZCgoKSA9PiBOdW1iZXIoY29uZmlnLnBvcnQgPz8gZGVmYXVsdE1vb25saWdodFBvcnQpKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cIm5ldHdvcmtcIiBjbGFzcz1cImNvbmZpZy1wYWdlXCI+XHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cInVwbnBcIiB2LW1vZGVsPVwiY29uZmlnLnVwbnBcIiBjbGFzcz1cIm1iLTNcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwiYWRkcmVzc19mYW1pbHlcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmFkZHJlc3NfZmFtaWx5XCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJiaW5kX2FkZHJlc3NcIiB2LW1vZGVsPVwiY29uZmlnWydiaW5kX2FkZHJlc3MnXVwiIGNsYXNzPVwibWItNlwiIC8+XHJcblxyXG4gICAgPGRpdiBjbGFzcz1cIm1iLTZcIj5cclxuICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJwb3J0XCIgdi1tb2RlbD1cImNvbmZpZy5wb3J0XCIgLz5cclxuXHJcbiAgICAgIDxkaXZcclxuICAgICAgICB2LWlmPVwiK2VmZmVjdGl2ZVBvcnQgLSA1IDwgMTAyNFwiXHJcbiAgICAgICAgY2xhc3M9XCJtdC0yIGFsZXJ0IGFsZXJ0LWRhbmdlciBwLTIgZmxleCBpdGVtcy1zdGFydCBnYXAtMiByb3VuZGVkLW1kXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS10cmlhbmdsZS1leGNsYW1hdGlvblwiIDpzaXplPVwiMjBcIiAvPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtXCI+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLnBvcnRfYWxlcnRfMScpIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIHYtaWY9XCIrZWZmZWN0aXZlUG9ydCArIDIxID4gNjU1MzVcIlxyXG4gICAgICAgIGNsYXNzPVwibXQtMiBhbGVydCBhbGVydC1kYW5nZXIgcC0yIGZsZXggaXRlbXMtc3RhcnQgZ2FwLTIgcm91bmRlZC1tZFwiXHJcbiAgICAgID5cclxuICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdHJpYW5nbGUtZXhjbGFtYXRpb25cIiA6c2l6ZT1cIjIwXCIgLz5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbVwiPlxyXG4gICAgICAgICAge3sgJHQoJ2NvbmZpZy5wb3J0X2FsZXJ0XzInKSB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJtdC00IGdyaWQgZ3JpZC1jb2xzLTEyIGdhcC0yIHRleHQtc21cIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNCBmb250LXNlbWlib2xkXCI+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLnBvcnRfcHJvdG9jb2wnKSB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00IGZvbnQtc2VtaWJvbGRcIj5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcucG9ydF9wb3J0JykgfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNCBmb250LXNlbWlib2xkXCI+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLnBvcnRfbm90ZScpIH19XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCI+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLnBvcnRfdGNwJykgfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNFwiPlxyXG4gICAgICAgICAge3sgK2VmZmVjdGl2ZVBvcnQgLSA1IH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zcGFuLTRcIiAvPlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNFwiPlxyXG4gICAgICAgICAge3sgJHQoJ2NvbmZpZy5wb3J0X3RjcCcpIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zcGFuLTRcIj5cclxuICAgICAgICAgIHt7ICtlZmZlY3RpdmVQb3J0IH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zcGFuLTRcIj5cclxuICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgdi1pZj1cIitlZmZlY3RpdmVQb3J0ICE9PSBkZWZhdWx0TW9vbmxpZ2h0UG9ydFwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwibXQtMSBhbGVydCBhbGVydC1pbmZvIHAtMiByb3VuZGVkLW1kXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWNpcmNsZS1pbmZvXCIgOnNpemU9XCIyMFwiIC8+IHt7ICR0KCdjb25maWcucG9ydF9odHRwX3BvcnRfbm90ZScpIH19XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zcGFuLTRcIj5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcucG9ydF90Y3AnKSB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCI+XHJcbiAgICAgICAgICB7eyArZWZmZWN0aXZlUG9ydCArIDEgfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNFwiPlxyXG4gICAgICAgICAge3sgJHQoJ2NvbmZpZy5wb3J0X3dlYl91aScpIH19XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCI+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLnBvcnRfdGNwJykgfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNwYW4tNFwiPlxyXG4gICAgICAgICAge3sgK2VmZmVjdGl2ZVBvcnQgKyAyMSB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCIgLz5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zcGFuLTRcIj5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcucG9ydF91ZHAnKSB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCI+e3sgK2VmZmVjdGl2ZVBvcnQgKyA5IH19IC0ge3sgK2VmZmVjdGl2ZVBvcnQgKyAxMSB9fTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc3Bhbi00XCIgLz5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgdi1pZj1cImNvbmZpZy5vcmlnaW5fd2ViX3VpX2FsbG93ZWQgPT09ICd3YW4nXCJcclxuICAgICAgICBjbGFzcz1cIm10LTMgYWxlcnQgYWxlcnQtd2FybmluZyBwLTIgZmxleCBpdGVtcy1zdGFydCBnYXAtMiByb3VuZGVkLW1kXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS10cmlhbmdsZS1leGNsYW1hdGlvblwiIDpzaXplPVwiMjBcIiAvPiB7eyAkdCgnY29uZmlnLnBvcnRfd2FybmluZycpIH19XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJvcmlnaW5fd2ViX3VpX2FsbG93ZWRcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLm9yaWdpbl93ZWJfdWlfYWxsb3dlZFwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwiZXh0ZXJuYWxfaXBcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmV4dGVybmFsX2lwXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgICAgcGxhY2Vob2xkZXI9XCIxMjMuNDU2Ljc4OS4xMlwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwibGFuX2VuY3J5cHRpb25fbW9kZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcubGFuX2VuY3J5cHRpb25fbW9kZVwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwid2FuX2VuY3J5cHRpb25fbW9kZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcud2FuX2VuY3J5cHRpb25fbW9kZVwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwicGluZ190aW1lb3V0XCIgdi1tb2RlbD1cImNvbmZpZy5waW5nX3RpbWVvdXRcIiBjbGFzcz1cIm1iLTZcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwidmlkZW9fbWF4X2JhdGNoX3NpemVfa2JcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnZpZGVvX21heF9iYXRjaF9zaXplX2tiXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgIC8+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHN0b3JlLmNvbmZpZztcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cImZpbGVzXCIgY2xhc3M9XCJjb25maWctcGFnZVwiPlxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJmaWxlX2FwcHNcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmZpbGVfYXBwc1wiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAgIHBsYWNlaG9sZGVyPVwiYXBwcy5qc29uXCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJjcmVkZW50aWFsc19maWxlXCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5jcmVkZW50aWFsc19maWxlXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgICAgcGxhY2Vob2xkZXI9XCJzdW5zaGluZV9zdGF0ZS5qc29uXCJcclxuICAgIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJsb2dfcGF0aFwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcubG9nX3BhdGhcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgICBwbGFjZWhvbGRlcj1cInN1bnNoaW5lLmxvZ1wiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwicGtleVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcucGtleVwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAgIHBsYWNlaG9sZGVyPVwiL2Rpci9wa2V5LnBlbVwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwiY2VydFwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuY2VydFwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAgIHBsYWNlaG9sZGVyPVwiL2Rpci9jZXJ0LnBlbVwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwiZmlsZV9zdGF0ZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuZmlsZV9zdGF0ZVwiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAgIHBsYWNlaG9sZGVyPVwic3Vuc2hpbmVfc3RhdGUuanNvblwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwidmliZXNoaW5lX2ZpbGVfc3RhdGVcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnZpYmVzaGluZV9maWxlX3N0YXRlXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgICAgcGxhY2Vob2xkZXI9XCJ2aWJlc2hpbmVfc3RhdGUuanNvblwiXHJcbiAgICAvPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHN0eWxlIHNjb3BlZD48L3N0eWxlPlxyXG4iLCI8c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgQ29uZmlnRmllbGRSZW5kZXJlciBmcm9tICdAL0NvbmZpZ0ZpZWxkUmVuZGVyZXIudnVlJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCBjb25maWcgPSBzdG9yZS5jb25maWc7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxkaXYgY2xhc3M9XCJjb25maWctcGFnZVwiPlxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJmZWNfcGVyY2VudGFnZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuZmVjX3BlcmNlbnRhZ2VcIlxyXG4gICAgICBjbGFzcz1cIm1iLTZcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cInFwXCIgdi1tb2RlbD1cImNvbmZpZy5xcFwiIGNsYXNzPVwibWItNlwiIC8+XHJcblxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwibWluX3RocmVhZHNcIiB2LW1vZGVsPVwiY29uZmlnLm1pbl90aHJlYWRzXCIgY2xhc3M9XCJtYi02XCIgLz5cblxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXG4gICAgICBzZXR0aW5nLWtleT1cImxpbWl0X2ZyYW1lcmF0ZVwiXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmxpbWl0X2ZyYW1lcmF0ZVwiXG4gICAgICBjbGFzcz1cIm1iLTNcIlxuICAgIC8+XG5cbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxuICAgICAgc2V0dGluZy1rZXk9XCJlbnZ2YXJfY29tcGF0aWJpbGl0eV9tb2RlXCJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcuZW52dmFyX2NvbXBhdGliaWxpdHlfbW9kZVwiXG4gICAgICBjbGFzcz1cIm1iLTNcIlxuICAgIC8+XG5cbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxuICAgICAgc2V0dGluZy1rZXk9XCJsZWdhY3lfb3JkZXJpbmdcIlxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5sZWdhY3lfb3JkZXJpbmdcIlxuICAgICAgY2xhc3M9XCJtYi0zXCJcbiAgICAvPlxuXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcbiAgICAgIHNldHRpbmcta2V5PVwiaWdub3JlX2VuY29kZXJfcHJvYmVfZmFpbHVyZVwiXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLmlnbm9yZV9lbmNvZGVyX3Byb2JlX2ZhaWx1cmVcIlxuICAgICAgY2xhc3M9XCJtYi02XCJcbiAgICAvPlxuXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJoZXZjX21vZGVcIiB2LW1vZGVsPVwiY29uZmlnLmhldmNfbW9kZVwiIGNsYXNzPVwibWItNlwiIC8+XG5cbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cImF2MV9tb2RlXCIgdi1tb2RlbD1cImNvbmZpZy5hdjFfbW9kZVwiIGNsYXNzPVwibWItNlwiIC8+XG4gIDwvZGl2PlxuPC90ZW1wbGF0ZT5cblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiaW5saW5lLWZsZXhcIj5cclxuICAgIDxuLWJ1dHRvblxyXG4gICAgICA6dHlwZT1cInR5cGVcIlxyXG4gICAgICA6c2l6ZT1cInNpemVcIlxyXG4gICAgICA6c3Ryb25nPVwic3Ryb25nXCJcclxuICAgICAgOmxvYWRpbmc9XCJsb2FkaW5nXCJcclxuICAgICAgOmRpc2FibGVkPVwibG9hZGluZ1wiXHJcbiAgICAgIEBjbGljaz1cIm9wZW5cIlxyXG4gICAgPlxyXG4gICAgICA8dGVtcGxhdGUgI2ljb24+XHJcbiAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJsb2FkaW5nID8gJ2ZhLXNwaW5uZXInIDogaWNvblwiIDpjbGFzcz1cImxvYWRpbmcgPyAnYW5pbWF0ZS1zcGluJyA6ICcnXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDxzcGFuPnt7IGxhYmVsIH19PC9zcGFuPlxyXG4gICAgPC9uLWJ1dHRvbj5cclxuXHJcbiAgICA8bi1tb2RhbCA6c2hvdz1cInNob3dcIiBAdXBkYXRlOnNob3c9XCIodikgPT4gKHNob3cgPSB2KVwiPlxyXG4gICAgICA8bi1jYXJkIDpib3JkZXJlZD1cImZhbHNlXCIgc3R5bGU9XCJtYXgtd2lkdGg6IDMycmVtOyB3aWR0aDogMTAwJVwiPlxyXG4gICAgICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1wbHVnXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuPnt7IGNvbmZpcm1UaXRsZSB9fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtc21cIj5cclxuICAgICAgICAgIHt7IGNvbmZpcm1NZXNzYWdlIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPHRlbXBsYXRlICNmb290ZXI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zXCI+XHJcbiAgICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwiZGVmYXVsdFwiIHN0cm9uZyBAY2xpY2s9XCJzaG93ID0gZmFsc2VcIj57eyBjYW5jZWxUZXh0IH19PC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIHR5cGU9XCJwcmltYXJ5XCIgOmxvYWRpbmc9XCJsb2FkaW5nXCIgQGNsaWNrPVwiY29uZmlybVwiPnt7XHJcbiAgICAgICAgICAgICAgY29udGludWVUZXh0XHJcbiAgICAgICAgICAgIH19PC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDwvbi1jYXJkPlxyXG4gICAgPC9uLW1vZGFsPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgcmVmIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgTkJ1dHRvbiwgTk1vZGFsLCBOQ2FyZCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcblxyXG5jb25zdCBwcm9wcyA9IGRlZmluZVByb3BzPHtcclxuICBsYWJlbD86IHN0cmluZztcclxuICBpY29uPzogc3RyaW5nO1xyXG4gIGNvbmZpcm1UaXRsZT86IHN0cmluZztcclxuICBjb25maXJtTWVzc2FnZT86IHN0cmluZztcclxuICBjYW5jZWxUZXh0Pzogc3RyaW5nO1xyXG4gIGNvbnRpbnVlVGV4dD86IHN0cmluZztcclxuICBzaXplPzogJ3RpbnknIHwgJ3NtYWxsJyB8ICdtZWRpdW0nIHwgJ2xhcmdlJztcclxuICB0eXBlPzogJ2RlZmF1bHQnIHwgJ3ByaW1hcnknIHwgJ2luZm8nIHwgJ3N1Y2Nlc3MnIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJztcclxuICBzdHJvbmc/OiBib29sZWFuO1xyXG4gIHJlc3RhcnQ/OiBib29sZWFuO1xyXG59PigpO1xyXG5cclxuY29uc3QgZW1pdCA9IGRlZmluZUVtaXRzPHtcclxuICAoZTogJ2RvbmUnLCBwYXlsb2FkOiB7IG9rOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9KTogdm9pZDtcclxufT4oKTtcclxuXHJcbmNvbnN0IHNob3cgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBsb2FkaW5nID0gcmVmKGZhbHNlKTtcclxuXHJcbmNvbnN0IGxhYmVsID0gcHJvcHMubGFiZWwgPz8gJ0luc3RhbGwvVXBkYXRlIFBsYXluaXRlIEV4dGVuc2lvbic7XHJcbmNvbnN0IGljb24gPSBwcm9wcy5pY29uID8/ICdmYS1wbHVnJztcclxuY29uc3QgY29uZmlybVRpdGxlID0gcHJvcHMuY29uZmlybVRpdGxlID8/ICdJbnN0YWxsL1VwZGF0ZSBQbGF5bml0ZSBFeHRlbnNpb24nO1xyXG5jb25zdCBjb25maXJtTWVzc2FnZSA9XHJcbiAgcHJvcHMuY29uZmlybU1lc3NhZ2UgPz9cclxuICAnVGhpcyB3aWxsIChyZSlpbnN0YWxsIHRoZSBWaWJlcG9sbG8gUGxheW5pdGUgZXh0ZW5zaW9uIGFuZCByZXN0YXJ0IFBsYXluaXRlIGlmIG5lZWRlZC4gQ29udGludWU/JztcclxuY29uc3QgY2FuY2VsVGV4dCA9IHByb3BzLmNhbmNlbFRleHQgPz8gJ0NhbmNlbCc7XHJcbmNvbnN0IGNvbnRpbnVlVGV4dCA9IHByb3BzLmNvbnRpbnVlVGV4dCA/PyAnQ29udGludWUnO1xyXG5jb25zdCBzaXplID0gcHJvcHMuc2l6ZSA/PyAnc21hbGwnO1xyXG5jb25zdCB0eXBlID0gcHJvcHMudHlwZSA/PyAncHJpbWFyeSc7XHJcbmNvbnN0IHN0cm9uZyA9IHByb3BzLnN0cm9uZyA/PyB0cnVlO1xyXG5jb25zdCByZXN0YXJ0ID0gcHJvcHMucmVzdGFydCA/PyB0cnVlO1xyXG5cclxuZnVuY3Rpb24gb3BlbigpIHtcclxuICBzaG93LnZhbHVlID0gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29uZmlybSgpIHtcclxuICBpZiAobG9hZGluZy52YWx1ZSkgcmV0dXJuO1xyXG4gIGxvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHNob3cudmFsdWUgPSBmYWxzZTtcclxuICBsZXQgb2sgPSBmYWxzZTtcclxuICBsZXQgYm9keTogYW55ID0gbnVsbDtcclxuICBsZXQgZXJyb3IgPSAnJztcclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAucG9zdCgnL2FwaS9wbGF5bml0ZS9pbnN0YWxsJywgeyByZXN0YXJ0IH0sIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBib2R5ID0gci5kYXRhO1xyXG4gICAgfSBjYXRjaCB7fVxyXG4gICAgb2sgPSByLnN0YXR1cyA+PSAyMDAgJiYgci5zdGF0dXMgPCAzMDAgJiYgYm9keSAmJiBib2R5LnN0YXR1cyA9PT0gdHJ1ZTtcclxuICAgIGlmICghb2spIHtcclxuICAgICAgZXJyb3IgPSAoYm9keSAmJiAoYm9keS5lcnJvciB8fCBib2R5Lm1lc3NhZ2UpKSB8fCBgSFRUUCAke3Iuc3RhdHVzfWA7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICBlcnJvciA9IGU/Lm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZmFpbGVkJztcclxuICB9XHJcbiAgbG9hZGluZy52YWx1ZSA9IGZhbHNlO1xyXG4gIGVtaXQoJ2RvbmUnLCB7XG4gICAgb2ssXG4gICAgZGF0YTogYm9keSxcbiAgICAuLi4ob2sgPyB7fSA6IHsgZXJyb3IgfSksXG4gIH0pO1xufVxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwic3BhY2UteS04IHBsYXluaXRlLXRhYlwiPlxyXG4gICAgPG4tYWxlcnQgdi1pZj1cInBsYXRmb3JtICYmIHBsYXRmb3JtICE9PSAnd2luZG93cydcIiB0eXBlPVwiaW5mb1wiIDpzaG93LWljb249XCJ0cnVlXCI+XHJcbiAgICAgIHt7ICR0KCdwbGF5bml0ZS5vbmx5X3dpbmRvd3MnKSB9fVxyXG4gICAgPC9uLWFsZXJ0PlxyXG5cclxuICAgIDxzZWN0aW9uIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCI+XHJcbiAgICAgIDxoMyBjbGFzcz1cInRleHQtYmFzZSBmb250LXNlbWlib2xkXCI+XHJcbiAgICAgICAge3sgJHQoJ3BsYXluaXRlLnN0YXR1c190aXRsZScpIH19XHJcbiAgICAgIDwvaDM+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cImJnLWxpZ2h0LzcwIGRhcms6Ymctc3VyZmFjZS83MCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcm91bmRlZC1sZyBwLTQgc3BhY2UteS00IHBsYXluaXRlLWNhcmRcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPCEtLSBJbnRlZ3JhdGlvbiBpcyBhbHdheXMgb247IG5vIGVuYWJsZS9kaXNhYmxlIHRvZ2dsZSAtLT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBncmlkIG1kOmdyaWQtY29scy0zIGdhcC0zXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgPGI+e3sgJHQoJ3BsYXluaXRlLnN0YXR1c19vdmVyYWxsJykgfX08L2I+XHJcbiAgICAgICAgICAgIDxuLXRvb2x0aXAgdi1pZj1cInN0YXR1c0tpbmQgPT09ICd3YWl0aW5nJ1wiIHRyaWdnZXI9XCJob3ZlclwiPlxyXG4gICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjdHJpZ2dlcj5cclxuICAgICAgICAgICAgICAgIDxuLXRhZyBzaXplPVwic21hbGxcIiA6dHlwZT1cInN0YXR1c1R5cGVcIj57eyBzdGF0dXNUZXh0IH19PC9uLXRhZz5cclxuICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgIDxzcGFuPnt7ICR0KCdwbGF5bml0ZS5saW1pdGVkX3Rvb2x0aXAnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9uLXRvb2x0aXA+XHJcbiAgICAgICAgICAgIDxuLXRhZyB2LWVsc2Ugc2l6ZT1cInNtYWxsXCIgOnR5cGU9XCJzdGF0dXNUeXBlXCI+e3sgc3RhdHVzVGV4dCB9fTwvbi10YWc+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8bi1hbGVydCB2LWlmPVwicGx1Z2luT3V0ZGF0ZWRcIiB0eXBlPVwid2FybmluZ1wiIDpzaG93LWljb249XCJ0cnVlXCI+XHJcbiAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAkdCgncGxheW5pdGUucGx1Z2luX291dGRhdGVkJywge1xyXG4gICAgICAgICAgICAgIGluc3RhbGxlZDogc3RhdHVzLnBsdWdpbl92ZXJzaW9uIHx8ICc/JyxcclxuICAgICAgICAgICAgICBsYXRlc3Q6IHN0YXR1cy5wbHVnaW5fbGF0ZXN0IHx8ICc/JyxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktODBcIiB2LWlmPVwiZGlhZ25vc3RpY1RleHRcIj5cclxuICAgICAgICAgIHt7IGRpYWdub3N0aWNUZXh0IH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgdi1pZj1cImNhbkxhdW5jaFwiXHJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgIDpsb2FkaW5nPVwibGF1bmNoaW5nXCJcclxuICAgICAgICAgICAgQGNsaWNrPVwibGF1bmNoUGxheW5pdGVcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiaGVyb2ljb25zLXNvbGlkOnJvY2tldFwiIDpzaXplPVwiMTZcIiAvPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLTJcIj57eyAkdCgncGxheW5pdGUubGF1bmNoX2J1dHRvbicpIHx8ICdMYXVuY2ggUGxheW5pdGUnIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwic21hbGxcIiB0eXBlPVwicHJpbWFyeVwiIHN0cm9uZyBAY2xpY2s9XCJyZWZyZXNoU3RhdHVzXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJoZXJvaWNvbnMtc29saWQ6cmVmcmVzaFwiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLTJcIj57eyAkdCgncGxheW5pdGUucmVmcmVzaF9zdGF0dXMnKSB8fCAnUmVmcmVzaCBTdGF0dXMnIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPCEtLSBNZXJnZWQgbWFpbnRlbmFuY2UgZGV0YWlscyAtLT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBpbmxpbmUtaW5mb1wiIHYtaWY9XCJzdGF0dXMuZXh0ZW5zaW9uc19kaXJcIj5cclxuICAgICAgICAgIDxiIGNsYXNzPVwic2hyaW5rLTBcIj57eyAkdCgncGxheW5pdGUuZXh0ZW5zaW9uc19kaXInKSB9fTo8L2I+XHJcbiAgICAgICAgICA8Y29kZVxyXG4gICAgICAgICAgICBjbGFzcz1cInRleHQteHMgd2hpdGVzcGFjZS1ub3dyYXAgb3ZlcmZsb3cteC1hdXRvIHB4LTEgcm91bmRlZCBiZy1ibGFjay81IGRhcms6Ymctd2hpdGUvNVwiXHJcbiAgICAgICAgICAgID57eyBzdGF0dXMuZXh0ZW5zaW9uc19kaXIgfX08L2NvZGVcclxuICAgICAgICAgID5cclxuICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwidGlueVwiIHR5cGU9XCJkZWZhdWx0XCIgc3Ryb25nIEBjbGljaz1cImNvcHlFeHRlbnNpb25zUGF0aFwiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiaGVyb2ljb25zLXNvbGlkOmNsaXBib2FyZC1jb3B5XCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPnt7ICR0KCdwbGF5bml0ZS5jb3B5X3BhdGgnKSB8fCAnQ29weScgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGlubGluZS1pbmZvXCIgdi1pZj1cInN0YXR1cy5wbHVnaW5fdmVyc2lvblwiPlxyXG4gICAgICAgICAgPGI+e3sgJHQoJ3BsYXluaXRlLnBsdWdpbl92ZXJzaW9uJykgfHwgJ1BsdWdpbicgfX06PC9iPlxyXG4gICAgICAgICAgPG4tdGFnIHNpemU9XCJzbWFsbFwiIHR5cGU9XCJkZWZhdWx0XCI+dnt7IHN0YXR1cy5wbHVnaW5fdmVyc2lvbiB9fTwvbi10YWc+XHJcbiAgICAgICAgICA8dGVtcGxhdGUgdi1pZj1cInN0YXR1cy5wbHVnaW5fbGF0ZXN0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3BhY2l0eS03MFwiPuKGkjwvc3Bhbj5cclxuICAgICAgICAgICAgPG4tdGFnIHNpemU9XCJzbWFsbFwiIDp0eXBlPVwicGx1Z2luT3V0ZGF0ZWQgPyAnd2FybmluZycgOiAnc3VjY2VzcydcIlxyXG4gICAgICAgICAgICAgID52e3sgc3RhdHVzLnBsdWdpbl9sYXRlc3QgfX08L24tdGFnXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInB0LTIgYm9yZGVyLXQgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgbXQtMlwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0yIHBsYXluaXRlLWFjdGlvbnNcIj5cclxuICAgICAgICAgICAgPFBsYXluaXRlUmVpbnN0YWxsQnV0dG9uXHJcbiAgICAgICAgICAgICAgdi1pZj1cInN0YXR1cy5leHRlbnNpb25zX2RpclwiXHJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICA6c3Ryb25nPVwidHJ1ZVwiXHJcbiAgICAgICAgICAgICAgOnJlc3RhcnQ9XCJ0cnVlXCJcclxuICAgICAgICAgICAgICA6bGFiZWw9XCJcclxuICAgICAgICAgICAgICAgIHN0YXR1cy5pbnN0YWxsZWRcclxuICAgICAgICAgICAgICAgICAgPyBwbHVnaW5PdXRkYXRlZFxyXG4gICAgICAgICAgICAgICAgICAgID8gKCR0KCdwbGF5bml0ZS51cGdyYWRlX2J1dHRvbicpIGFzIGFueSkgfHwgJ1VwZ3JhZGUgUGx1Z2luJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogKCR0KCdwbGF5bml0ZS5yZWluc3RhbGxfYnV0dG9uJykgYXMgYW55KSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKCR0KCdwbGF5bml0ZS5yZXBhaXJfYnV0dG9uJykgYXMgYW55KSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgJ1JlaW5zdGFsbCBQbHVnaW4nXHJcbiAgICAgICAgICAgICAgICAgIDogKCR0KCdwbGF5bml0ZS5pbnN0YWxsX2J1dHRvbicpIGFzIGFueSkgfHwgJ0luc3RhbGwgUGx1Z2luJ1xyXG4gICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgQGRvbmU9XCJvblJlaW5zdGFsbERvbmVcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICB2LWlmPVwic3RhdHVzLmV4dGVuc2lvbnNfZGlyICYmIHN0YXR1cy5pbnN0YWxsZWRcIlxyXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICA6bG9hZGluZz1cInVuaW5zdGFsbGluZ1wiXHJcbiAgICAgICAgICAgICAgQGNsaWNrPVwib3BlblVuaW5zdGFsbENvbmZpcm1cIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDp0cmFzaFwiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMlwiPnt7ICR0KCdwbGF5bml0ZS51bmluc3RhbGxfYnV0dG9uJykgfHwgJ1VuaW5zdGFsbCBQbHVnaW4nIH19PC9zcGFuPlxyXG4gICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9zZWN0aW9uPlxyXG4gICAgPHNlY3Rpb24gdi1pZj1cInBsYXRmb3JtID09PSAnd2luZG93cydcIiBjbGFzcz1cInNwYWNlLXktNlwiPlxyXG4gICAgICA8aDMgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZFwiPlxyXG4gICAgICAgIHt7ICR0KCdwbGF5bml0ZS5zZXR0aW5nc190aXRsZScpIH19XHJcbiAgICAgIDwvaDM+XHJcblxyXG4gICAgICA8IS0tIEF1dG8tc3luYyBjYXJkIC0tPlxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgY2xhc3M9XCJiZy1saWdodC83MCBkYXJrOmJnLXN1cmZhY2UvNzAgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHJvdW5kZWQtbGcgc2VjdGlvbi1jYXJkXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJweC00IHB0LTMgcGItMiBmbGV4IGl0ZW1zLWJhc2VsaW5lIGp1c3RpZnktYmV0d2VlbiBzZWN0aW9uLWhlYWRlclwiPlxyXG4gICAgICAgICAgPGg0IGNsYXNzPVwidGV4dC1zbSBmb250LXNlbWlib2xkXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCdwbGF5bml0ZS5zZWN0aW9uX2F1dG9fc3luYycpIHx8ICdBdXRvLXN5bmMnIH19XHJcbiAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgQGNsaWNrPVwicmVzZXRBdXRvU3luY1NlY3Rpb25cIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDp1bmRvXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPnt7ICR0KCdwbGF5bml0ZS5yZXNldF9kZWZhdWx0cycpIHx8ICdSZXNldCB0byBkZWZhdWx0cycgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgIHNpemU9XCJ0aW55XCJcclxuICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgIDpsb2FkaW5nPVwiZGVsZXRpbmdBdXRvc3luY1wiXHJcbiAgICAgICAgICAgIEBjbGljaz1cIm9wZW5EZWxldGVBdXRvc3luY0NvbmZpcm1cIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiaGVyb2ljb25zLXNvbGlkOnRyYXNoXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCdwbGF5bml0ZS5kZWxldGVfYWxsX2F1dG9zeW5jJykgfHwgJ0RlbGV0ZSBBdXRvLXN5bmMgR2FtZXMnIH19XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInB4LTQgcGItNCBzZWN0aW9uLWJvZHlcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGdhcC14LTYgZ2FwLXktMyBpdGVtcy1zdGFydFwiPlxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxDaGVja2JveFxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5wbGF5bml0ZV9hdXRvX3N5bmNcIlxyXG4gICAgICAgICAgICAgICAgaWQ9XCJwbGF5bml0ZV9hdXRvX3N5bmNcIlxyXG4gICAgICAgICAgICAgICAgOmRlZmF1bHQ9XCJzdG9yZS5kZWZhdWx0cy5wbGF5bml0ZV9hdXRvX3N5bmNcIlxyXG4gICAgICAgICAgICAgICAgOmxvY2FsZVByZWZpeD1cIidwbGF5bml0ZSdcIlxyXG4gICAgICAgICAgICAgICAgbGFiZWw9XCJwbGF5bml0ZS5hdXRvX3N5bmNcIlxyXG4gICAgICAgICAgICAgICAgOmRlc2M9XCInJ1wiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCIhYXV0b1N5bmNFbmFibGVkXCIgY2xhc3M9XCJmb3JtLXRleHRcIj5cclxuICAgICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5lbmFibGVfYXV0b3N5bmNfaGludCcpIHx8ICdFbmFibGUgQXV0by1zeW5jIHRvIGVkaXQgdGhlc2Ugc2V0dGluZ3MuJ1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPENoZWNrYm94XHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLnBsYXluaXRlX3N5bmNfYWxsX2luc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX3N5bmNfYWxsX2luc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICA6ZGVmYXVsdD1cInN0b3JlLmRlZmF1bHRzLnBsYXluaXRlX3N5bmNfYWxsX2luc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICA6bG9jYWxlUHJlZml4PVwiJ3BsYXluaXRlJ1wiXHJcbiAgICAgICAgICAgICAgICBsYWJlbD1cInBsYXluaXRlLnN5bmNfYWxsX2luc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICBkZXNjPVwicGxheW5pdGUuc3luY19hbGxfaW5zdGFsbGVkX2Rlc2NcIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiIWF1dG9TeW5jRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInBsYXluaXRlX3JlY2VudF9nYW1lc1wiIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7XHJcbiAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUucmVjZW50X2dhbWVzJylcclxuICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX3JlY2VudF9nYW1lc1wiXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLnBsYXluaXRlX3JlY2VudF9nYW1lc1wiXHJcbiAgICAgICAgICAgICAgICA6bWluPVwiMFwiXHJcbiAgICAgICAgICAgICAgICA6bWF4PVwiNTBcIlxyXG4gICAgICAgICAgICAgICAgOnNob3ctYnV0dG9uPVwidHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInctMzJcIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiIWF1dG9TeW5jRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgncGxheW5pdGUucmVjZW50X2dhbWVzX2Rlc2MnKSB9fSAoMCA9XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgnX2NvbW1vbi5kaXNhYmxlZCcpIHx8ICdkaXNhYmxlZCcgfX0pXHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJwbGF5bml0ZV9yZWNlbnRfbWF4X2FnZV9kYXlzXCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3tcclxuICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5yZWNlbnRfbWF4X2FnZV9kYXlzJylcclxuICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX3JlY2VudF9tYXhfYWdlX2RheXNcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5wbGF5bml0ZV9yZWNlbnRfbWF4X2FnZV9kYXlzXCJcclxuICAgICAgICAgICAgICAgIDptaW49XCIwXCJcclxuICAgICAgICAgICAgICAgIDptYXg9XCIzNjUwXCJcclxuICAgICAgICAgICAgICAgIDpzaG93LWJ1dHRvbj1cInRydWVcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJ3LTMyXCJcclxuICAgICAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFhdXRvU3luY0VuYWJsZWRcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAge3sgJHQoJ3BsYXluaXRlLnJlY2VudF9tYXhfYWdlX2RheXNfZGVzYycpIH19ICgwID1cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdfY29tbW9uLmRpc2FibGVkJykgfHwgJ2Rpc2FibGVkJyB9fSlcclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZDpjb2wtc3Bhbi0xXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInBsYXluaXRlX3N5bmNfY2F0ZWdvcmllc1wiIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7XHJcbiAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuc3luY19jYXRlZ29yaWVzJylcclxuICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4tdG9vbHRpcCA6ZGlzYWJsZWQ9XCIhZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uICYmIGF1dG9TeW5jRW5hYmxlZFwiIHRyaWdnZXI9XCJob3ZlclwiPlxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlICN0cmlnZ2VyPlxyXG4gICAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX3N5bmNfY2F0ZWdvcmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInNlbGVjdGVkQ2F0ZWdvcmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVcclxuICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cImNhdGVnb3J5T3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmNhdGVnb3JpZXNfcGxhY2Vob2xkZXInKSB8fCAnQWxsIGNhdGVnb3JpZXMgKGRlZmF1bHQpJ1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJjYXRlZ29yaWVzTG9hZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uIHx8ICFhdXRvU3luY0VuYWJsZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgIEBmb2N1cz1cIigpID0+IGxvYWRDYXRlZ29yaWVzKClcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8c3Bhbj57e1xyXG4gICAgICAgICAgICAgICAgICAhYXV0b1N5bmNFbmFibGVkXHJcbiAgICAgICAgICAgICAgICAgICAgPyAkdCgncGxheW5pdGUuZW5hYmxlX2F1dG9zeW5jX2hpbnQnKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgJ0VuYWJsZSBBdXRvLXN5bmMgdG8gZWRpdCB0aGVzZSBzZXR0aW5ncy4nXHJcbiAgICAgICAgICAgICAgICAgICAgOiBkaXNhYmxlZEhpbnRcclxuICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvbi10b29sdGlwPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXRleHRcIj57eyAkdCgncGxheW5pdGUuc3luY19jYXRlZ29yaWVzX2hlbHAnKSB9fTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwicGxheW5pdGVfc3luY19wbHVnaW5zXCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3tcclxuICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5zeW5jX3BsdWdpbnMnKSB8fCAnSW5jbHVkZSBsaWJyYXJ5IHBsdWdpbnMnXHJcbiAgICAgICAgICAgICAgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxuLXRvb2x0aXAgOmRpc2FibGVkPVwiIWRpc2FibGVQbGF5bml0ZVNlbGVjdGlvbiAmJiBhdXRvU3luY0VuYWJsZWRcIiB0cmlnZ2VyPVwiaG92ZXJcIj5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjdHJpZ2dlcj5cclxuICAgICAgICAgICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJwbGF5bml0ZV9zeW5jX3BsdWdpbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJpbmNsdWRlZFBsdWdpbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlXHJcbiAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XCJwbHVnaW5PcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUucGx1Z2luc19pbmNsdWRlX3BsYWNlaG9sZGVyJykgfHwgJ0luY2x1ZGUgYWxsIGdhbWVzIGZyb20uLi4nXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICA6bG9hZGluZz1cInBsdWdpbnNMb2FkaW5nXCJcclxuICAgICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJkaXNhYmxlUGxheW5pdGVTZWxlY3Rpb24gfHwgIWF1dG9TeW5jRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgQGZvY3VzPVwiKCkgPT4gbG9hZFBsdWdpbnMoKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgICAgICAgID57ICFhdXRvU3luY0VuYWJsZWQgPyAkdCgncGxheW5pdGUuZW5hYmxlX2F1dG9zeW5jX2hpbnQnKSB8fCAnRW5hYmxlIEF1dG8tc3luYyB0b1xyXG4gICAgICAgICAgICAgICAgICBlZGl0IHRoZXNlIHNldHRpbmdzLicgOiBkaXNhYmxlZEhpbnQgfTwvc3BhblxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDwvbi10b29sdGlwPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXRleHRcIj57eyAkdCgncGxheW5pdGUuc3luY19wbHVnaW5zX2hlbHAnKSB9fTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1kOmNvbC1zcGFuLTIgZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBnYXAteC02IGdhcC15LTNcIj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInBsYXluaXRlX2F1dG9zeW5jX2RlbGV0ZV9hZnRlcl9kYXlzXCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3tcclxuICAgICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmRlbGV0ZV9hZnRlcl9kYXlzJylcclxuICAgICAgICAgICAgICAgIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX2F1dG9zeW5jX2RlbGV0ZV9hZnRlcl9kYXlzXCJcclxuICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5wbGF5bml0ZV9hdXRvc3luY19kZWxldGVfYWZ0ZXJfZGF5c1wiXHJcbiAgICAgICAgICAgICAgICAgIDptaW49XCIwXCJcclxuICAgICAgICAgICAgICAgICAgOm1heD1cIjM2NTBcIlxyXG4gICAgICAgICAgICAgICAgICA6c2hvdy1idXR0b249XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJ3LTMyXCJcclxuICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiIWF1dG9TeW5jRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyAkdCgncGxheW5pdGUuZGVsZXRlX2FmdGVyX2RheXNfZGVzYycpIH19ICgwID1cclxuICAgICAgICAgICAgICAgICAge3sgJHQoJ19jb21tb24uZGlzYWJsZWQnKSB8fCAnZGlzYWJsZWQnIH19KVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZvcm0tbGFiZWxcIiBmb3I9XCJwbGF5bml0ZV9jbGVhbnVwX3BvbGljeVwiPnt7XHJcbiAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5jbGVhbnVwX3BvbGljeScpIHx8ICdDbGVhbnVwIHBvbGljeSdcclxuICAgICAgICAgICAgICAgIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxuLXJhZGlvLWdyb3VwXHJcbiAgICAgICAgICAgICAgICAgIGlkPVwicGxheW5pdGVfY2xlYW51cF9wb2xpY3lcIlxyXG4gICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLnBsYXluaXRlX2F1dG9zeW5jX3JlcXVpcmVfcmVwbGFjZW1lbnRcIlxyXG4gICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCIhYXV0b1N5bmNFbmFibGVkXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTEgdGV4dC1zbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8bi1yYWRpbyA6dmFsdWU9XCJ0cnVlXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5wb2xpY3lfa2VlcF91bnRpbF9yZXBsYWNlZCcpIHx8ICdLZWVwIHVudGlsIHJlcGxhY2VkIChkZWZhdWx0KSdcclxuICAgICAgICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLXJhZGlvIDp2YWx1ZT1cImZhbHNlXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5wb2xpY3lfcHJ1bmVfaW1tZWRpYXRlbHknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQWx3YXlzIHBydW5lIGdhbWVzIHRoYXQgbm8gbG9uZ2VyIHF1YWxpZnknXHJcbiAgICAgICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXRleHRcIj5cclxuICAgICAgICAgICAgICAgICAge3tcclxuICAgICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUucG9saWN5X2V4cGxhaW5lcicpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgJ0Nob29zZSBob3cgVmliZXBvbGxvIHJlbW92ZXMgb2xkIGF1dG8tc3luY2VkIGdhbWVzLidcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZDpjb2wtc3Bhbi0yXCI+XHJcbiAgICAgICAgICAgICAgICA8Q2hlY2tib3hcclxuICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5wbGF5bml0ZV9hdXRvc3luY19yZW1vdmVfdW5pbnN0YWxsZWRcIlxyXG4gICAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX2F1dG9zeW5jX3JlbW92ZV91bmluc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICAgIDpkZWZhdWx0PVwic3RvcmUuZGVmYXVsdHMucGxheW5pdGVfYXV0b3N5bmNfcmVtb3ZlX3VuaW5zdGFsbGVkXCJcclxuICAgICAgICAgICAgICAgICAgOmxvY2FsZVByZWZpeD1cIidwbGF5bml0ZSdcIlxyXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cInBsYXluaXRlLnJlbW92ZV91bmluc3RhbGxlZFwiXHJcbiAgICAgICAgICAgICAgICAgIGRlc2M9XCJwbGF5bml0ZS5yZW1vdmVfdW5pbnN0YWxsZWRfZGVzY1wiXHJcbiAgICAgICAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFhdXRvU3luY0VuYWJsZWRcIlxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWQ6Y29sLXNwYW4tMiBmb3JtLXRleHRcIiB2LWlmPVwiYXV0b1N5bmNFbmFibGVkXCI+e3sgcG9saWN5U3VtbWFyeSB9fTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDwhLS0gTGF1bmNoIEJlaGF2aW9yIGNhcmQgLS0+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cImJnLWxpZ2h0LzcwIGRhcms6Ymctc3VyZmFjZS83MCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcm91bmRlZC1sZyBzZWN0aW9uLWNhcmRcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInB4LTQgcHQtMyBwYi0yIGZsZXggaXRlbXMtYmFzZWxpbmUganVzdGlmeS1iZXR3ZWVuIHNlY3Rpb24taGVhZGVyXCI+XHJcbiAgICAgICAgICA8aDQgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIj5cclxuICAgICAgICAgICAge3sgJHQoJ3BsYXluaXRlLnNlY3Rpb25fbGF1bmNoX2JlaGF2aW9yJykgfHwgJ0xhdW5jaCBCZWhhdmlvcicgfX1cclxuICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInRpbnlcIiB0eXBlPVwiZGVmYXVsdFwiIHN0cm9uZyBAY2xpY2s9XCJyZXNldExhdW5jaFNlY3Rpb25cIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDp1bmRvXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPnt7ICR0KCdwbGF5bml0ZS5yZXNldF9kZWZhdWx0cycpIHx8ICdSZXNldCB0byBkZWZhdWx0cycgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJweC00IHBiLTQgc2VjdGlvbi1ib2R5XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBnYXAteC02IGdhcC15LTMgaXRlbXMtc3RhcnRcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1kOmNvbC1zcGFuLTJcIj5cclxuICAgICAgICAgICAgICA8Q2hlY2tib3hcclxuICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcucGxheW5pdGVfZnVsbHNjcmVlbl9lbnRyeV9lbmFibGVkXCJcclxuICAgICAgICAgICAgICAgIGlkPVwicGxheW5pdGVfZnVsbHNjcmVlbl9lbnRyeV9lbmFibGVkXCJcclxuICAgICAgICAgICAgICAgIDpkZWZhdWx0PVwic3RvcmUuZGVmYXVsdHMucGxheW5pdGVfZnVsbHNjcmVlbl9lbnRyeV9lbmFibGVkXCJcclxuICAgICAgICAgICAgICAgIDpsb2NhbGVQcmVmaXg9XCIncGxheW5pdGUnXCJcclxuICAgICAgICAgICAgICAgIGxhYmVsPVwiQWRkICdQbGF5bml0ZSAoRnVsbHNjcmVlbiknIHRvIEFwcGxpY2F0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICBkZXNjPVwiV2hlbiBlbmFibGVkLCBWaWJlcG9sbG8gYWRkcyBhIGxhdW5jaGVyIGVudHJ5IHRoYXQgb3BlbnMgUGxheW5pdGUgaW4gZnVsbHNjcmVlbiBkZXNrdG9wIG1vZGUuXCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwicGxheW5pdGVfZm9jdXNfYXR0ZW1wdHNcIiBjbGFzcz1cImZvcm0tbGFiZWxcIj57e1xyXG4gICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmZvY3VzX2F0dGVtcHRzJykgfHwgJ0F1dG8tZm9jdXMgYXR0ZW1wdHMnXHJcbiAgICAgICAgICAgICAgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgaWQ9XCJwbGF5bml0ZV9mb2N1c19hdHRlbXB0c1wiXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLnBsYXluaXRlX2ZvY3VzX2F0dGVtcHRzXCJcclxuICAgICAgICAgICAgICAgIDptaW49XCIwXCJcclxuICAgICAgICAgICAgICAgIDptYXg9XCIzMFwiXHJcbiAgICAgICAgICAgICAgICA6c2hvdy1idXR0b249XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwidy0zMlwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZm9jdXNfYXR0ZW1wdHNfaGVscCcpIHx8XHJcbiAgICAgICAgICAgICAgICAgICdOdW1iZXIgb2YgdGltZXMgdG8gdHJ5IHRvIGJyaW5nIFBsYXluaXRlIHdpbmRvd3MgdG8gdGhlIGZvcmVncm91bmQgd2hlbiBsYXVuY2hpbmcuJ1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPENvbmZpZ0R1cmF0aW9uRmllbGRcclxuICAgICAgICAgICAgICAgIGlkPVwicGxheW5pdGVfZm9jdXNfdGltZW91dF9zZWNzXCJcclxuICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcucGxheW5pdGVfZm9jdXNfdGltZW91dF9zZWNzXCJcclxuICAgICAgICAgICAgICAgIDpsYWJlbD1cIlxyXG4gICAgICAgICAgICAgICAgICBTdHJpbmcoJHQoJ3BsYXluaXRlLmZvY3VzX3RpbWVvdXRfc2VjcycpIHx8ICdBdXRvLWZvY3VzIHRpbWVvdXQgd2luZG93IChzZWNvbmRzKScpXHJcbiAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgOmRlc2M9XCJcclxuICAgICAgICAgICAgICAgICAgU3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5mb2N1c190aW1lb3V0X3NlY3NfaGVscCcpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAnSG93IGxvbmcgYXV0by1mb2N1cyBydW5zIHdoaWxlIHJlLWFwcGx5aW5nIGZvY3VzICgwIHRvIGRpc2FibGUpLicsXHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICA6bWluPVwiMFwiXHJcbiAgICAgICAgICAgICAgICA6bWF4PVwiMTIwXCJcclxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZDpjb2wtc3Bhbi0yXCI+XHJcbiAgICAgICAgICAgICAgPENoZWNrYm94XHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLnBsYXluaXRlX2ZvY3VzX2V4aXRfb25fZmlyc3RcIlxyXG4gICAgICAgICAgICAgICAgaWQ9XCJwbGF5bml0ZV9mb2N1c19leGl0X29uX2ZpcnN0XCJcclxuICAgICAgICAgICAgICAgIDpkZWZhdWx0PVwic3RvcmUuZGVmYXVsdHMucGxheW5pdGVfZm9jdXNfZXhpdF9vbl9maXJzdFwiXHJcbiAgICAgICAgICAgICAgICA6bG9jYWxlUHJlZml4PVwiJ3BsYXluaXRlJ1wiXHJcbiAgICAgICAgICAgICAgICBsYWJlbD1cInBsYXluaXRlLmZvY3VzX2V4aXRfb25fZmlyc3RcIlxyXG4gICAgICAgICAgICAgICAgZGVzYz1cInBsYXluaXRlLmZvY3VzX2V4aXRfb25fZmlyc3RfaGVscFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8IS0tIEV4Y2x1c2lvbnMgJiBGaWx0ZXJzIGNhcmQgLS0+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cImJnLWxpZ2h0LzcwIGRhcms6Ymctc3VyZmFjZS83MCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcm91bmRlZC1sZ1wiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicHgtNCBwdC0zIHBiLTIgZmxleCBpdGVtcy1iYXNlbGluZSBqdXN0aWZ5LWJldHdlZW5cIj5cclxuICAgICAgICAgIDxoNCBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZFwiPlxyXG4gICAgICAgICAgICB7eyAkdCgncGxheW5pdGUuc2VjdGlvbl9leGNsdXNpb25zX2ZpbHRlcnMnKSB8fCAnRXhjbHVzaW9ucyAmIEZpbHRlcnMnIH19XHJcbiAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgQGNsaWNrPVwicmVzZXRGaWx0ZXJzU2VjdGlvblwiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiaGVyb2ljb25zLXNvbGlkOnVuZG9cIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtbC0xXCI+e3sgJHQoJ3BsYXluaXRlLnJlc2V0X2RlZmF1bHRzJykgfHwgJ1Jlc2V0IHRvIGRlZmF1bHRzJyB9fTwvc3Bhbj5cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInB4LTQgcGItNFwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgZ2FwLXgtNiBnYXAteS0zIGl0ZW1zLXN0YXJ0XCI+XHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInBsYXluaXRlX2V4Y2x1ZGVfY2F0ZWdvcmllc1wiIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7XHJcbiAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZXhjbHVkZV9jYXRlZ29yaWVzJykgfHwgJ0V4Y2x1ZGUgY2F0ZWdvcmllcydcclxuICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4tdG9vbHRpcCA6ZGlzYWJsZWQ9XCIhZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uICYmIGF1dG9TeW5jRW5hYmxlZFwiIHRyaWdnZXI9XCJob3ZlclwiPlxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlICN0cmlnZ2VyPlxyXG4gICAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX2V4Y2x1ZGVfY2F0ZWdvcmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImV4Y2x1ZGVkQ2F0ZWdvcmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVcclxuICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cImNhdGVnb3J5T3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmNhdGVnb3JpZXNfcGxhY2Vob2xkZXInKSB8fCAnQWxsIGNhdGVnb3JpZXMgKGRlZmF1bHQpJ1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJjYXRlZ29yaWVzTG9hZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uIHx8ICFhdXRvU3luY0VuYWJsZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgIEBmb2N1cz1cIigpID0+IGxvYWRDYXRlZ29yaWVzKClcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8c3BhblxyXG4gICAgICAgICAgICAgICAgICA+eyAhYXV0b1N5bmNFbmFibGVkID8gJHQoJ3BsYXluaXRlLmVuYWJsZV9hdXRvc3luY19oaW50JykgfHwgJ0VuYWJsZSBBdXRvLXN5bmMgdG9cclxuICAgICAgICAgICAgICAgICAgZWRpdCB0aGVzZSBzZXR0aW5ncy4nIDogZGlzYWJsZWRIaW50IH08L3NwYW5cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8L24tdG9vbHRpcD5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZXhjbHVkZV9jYXRlZ29yaWVzX2hlbHAnKSB8fFxyXG4gICAgICAgICAgICAgICAgICAnR2FtZXMgdGFnZ2VkIHdpdGggdGhlc2UgY2F0ZWdvcmllcyB3aWxsIG5ldmVyIGJlIGF1dG8tc3luY2VkLidcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJwbGF5bml0ZV9leGNsdWRlX3BsdWdpbnNcIiBjbGFzcz1cImZvcm0tbGFiZWxcIj57e1xyXG4gICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmV4Y2x1ZGVfcGx1Z2lucycpIHx8ICdFeGNsdWRlIGxpYnJhcnkgcGx1Z2lucydcclxuICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4tdG9vbHRpcCA6ZGlzYWJsZWQ9XCIhZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uICYmIGF1dG9TeW5jRW5hYmxlZFwiIHRyaWdnZXI9XCJob3ZlclwiPlxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlICN0cmlnZ2VyPlxyXG4gICAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgICBpZD1cInBsYXluaXRlX2V4Y2x1ZGVfcGx1Z2luc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImV4Y2x1ZGVkUGx1Z2luc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVcclxuICAgICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cInBsdWdpbk9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmFibGVcclxuICAgICAgICAgICAgICAgICAgICBjbGVhcmFibGVcclxuICAgICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5wbHVnaW5zX3BsYWNlaG9sZGVyJykgfHwgJ0FsbCBsaWJyYXJ5IHBsdWdpbnMgKGRlZmF1bHQpJ1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJwbHVnaW5zTG9hZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uIHx8ICFhdXRvU3luY0VuYWJsZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgIEBmb2N1cz1cIigpID0+IGxvYWRQbHVnaW5zKClcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8c3BhblxyXG4gICAgICAgICAgICAgICAgICA+eyAhYXV0b1N5bmNFbmFibGVkID8gJHQoJ3BsYXluaXRlLmVuYWJsZV9hdXRvc3luY19oaW50JykgfHwgJ0VuYWJsZSBBdXRvLXN5bmMgdG9cclxuICAgICAgICAgICAgICAgICAgZWRpdCB0aGVzZSBzZXR0aW5ncy4nIDogZGlzYWJsZWRIaW50IH08L3NwYW5cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8L24tdG9vbHRpcD5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZXhjbHVkZV9wbHVnaW5zX2hlbHAnKSB8fFxyXG4gICAgICAgICAgICAgICAgICAnR2FtZXMgaW1wb3J0ZWQgZnJvbSB0aGVzZSBwbHVnaW5zIHdpbGwgbmV2ZXIgYmUgYXV0by1zeW5jZWQuJ1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZDpjb2wtc3Bhbi0yXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZvcm0tbGFiZWxcIj57e1xyXG4gICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZXhjbHVkZV9nYW1lcycpIHx8ICdFeGNsdWRlIGdhbWVzIGZyb20gYXV0by1zeW5jJ1xyXG4gICAgICAgICAgICAgICAgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHNcIj5cclxuICAgICAgICAgICAgICAgICAgPG4tYWxlcnQgdi1pZj1cImxpbWl0ZWROb0NhY2hlXCIgdHlwZT1cIndhcm5pbmdcIiA6c2hvdy1pY29uPVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZ2FtZXNfdW5hdmFpbGFibGVfaW5kaWNhdG9yJykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICdDYW5ub3QgcmV0cmlldmUgUGxheW5pdGUgZ2FtZXMgcmlnaHQgbm93LiBTdGFydCBQbGF5bml0ZSB0byBsb2FkIGdhbWVzLidcclxuICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICA8L24tYWxlcnQ+XHJcbiAgICAgICAgICAgICAgICAgIDxuLWFsZXJ0IHYtZWxzZS1pZj1cImxpbWl0ZWRXaXRoQ2FjaGVcIiB0eXBlPVwiaW5mb1wiIDpzaG93LWljb249XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3tcclxuICAgICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5nYW1lc19jYWNoZWRfaW5kaWNhdG9yJykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICdTaG93aW5nIGNhY2hlZCBQbGF5bml0ZSBnYW1lcyBkdWUgdG8gbGltaXRlZCBjb25uZWN0aXZpdHkuJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvbi1hbGVydD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXluaXRlLWV4Y2x1c2lvbnNcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtc20gZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdwbGF5bml0ZS5leGNsdWRlX2dhbWVzX3RhYmxlX3RpdGxlJykgfHwgJ0V4Y2x1ZGVkIEdhbWVzJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cIm9wZW5BZGRFeGNsdXNpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiZGlzYWJsZVBsYXluaXRlU2VsZWN0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDpwbHVzXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPnt7ICR0KCdwbGF5bml0ZS5hZGRfZXhjbHVzaW9ucycpIHx8ICdBZGQnIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiZGVmYXVsdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjbGVhckFsbEV4Y2x1c2lvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCIhZXhjbHVkZWRJZHMubGVuZ3RoXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDp0aW1lc1wiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLTFcIj57eyAkdCgnX2NvbW1vbi5jbGVhcl9hbGwnKSB8fCAnQ2xlYXIgQWxsJyB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8bi1kYXRhLXRhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgOmNvbHVtbnM9XCJleGNsdXNpb25zQ29sdW1uc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOmRhdGE9XCJleGNsdWRlZERpc3BsYXlMaXN0XCJcclxuICAgICAgICAgICAgICAgICAgICA6Ym9yZGVyZWQ9XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgICAgICA6c2luZ2xlLWxpbmU9XCJmYWxzZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOnBhZ2luYXRpb249XCJmYWxzZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiZ2FtZXNTb3VyY2UgPT09ICdsaXZlJ1wiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmdhbWVzX2xvYWRlZF9saXZlJykgfHwgJ0xvYWRlZCBmcm9tIFBsYXluaXRlJ1xyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlLWlmPVwiZ2FtZXNTb3VyY2UgPT09ICdjYWNoZSdcIlxyXG4gICAgICAgICAgICAgICAgICAgID57eyAkdCgncGxheW5pdGUuZ2FtZXNfbG9hZGVkX2NhY2hlJykgfHwgJ0xvYWRlZCBmcm9tIGNhY2hlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19PHRlbXBsYXRlIHYtaWY9XCJnYW1lc0NhY2hlVGltZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAg4oCUIHt7IG5ldyBEYXRlKGdhbWVzQ2FjaGVUaW1lKS50b0xvY2FsZVN0cmluZygpIH19PC90ZW1wbGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgID48L3NwYW5cclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWVsc2U+e3tcclxuICAgICAgICAgICAgICAgICAgICAkdCgncGxheW5pdGUuZ2FtZXNfbm90X2F2YWlsYWJsZScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgJ05vIGdhbWVzIGF2YWlsYWJsZS4gU3RhcnQgUGxheW5pdGUgdG8gZmV0Y2ggZ2FtZXMuJ1xyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAgICAgICAgICR0KCdwbGF5bml0ZS5leGNsdWRlX2dhbWVzX2Rlc2MnKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICdTZWxlY3RlZCBnYW1lcyB3aWxsIG5vdCBiZSBhdXRvLXN5bmNlZCBmcm9tIFBsYXluaXRlLidcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyAkdCgncGxheW5pdGUuZXhjbHVzaW9uc19vdmVycmlkZV9ub3RlJykgfHwgJ0V4Y2x1c2lvbnMgb3ZlcnJpZGUgY2F0ZWdvcmllcy4nIH19XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L3NlY3Rpb24+XHJcbiAgPC9kaXY+XHJcbiAgPCEtLSBVbmluc3RhbGwgY29uZmlybWF0aW9uIC0tPlxyXG4gIDxuLW1vZGFsIDpzaG93PVwic2hvd0RlbGV0ZUF1dG9zeW5jQ29uZmlybVwiIEB1cGRhdGU6c2hvdz1cIih2KSA9PiAoc2hvd0RlbGV0ZUF1dG9zeW5jQ29uZmlybSA9IHYpXCI+XHJcbiAgICA8bi1jYXJkIDpib3JkZXJlZD1cImZhbHNlXCIgc3R5bGU9XCJtYXgtd2lkdGg6IDMycmVtOyB3aWR0aDogMTAwJVwiPlxyXG4gICAgICA8dGVtcGxhdGUgI2hlYWRlcj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJoZXJvaWNvbnMtc29saWQ6dHJhc2hcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgIDxzcGFuPnt7ICR0KCdwbGF5bml0ZS5kZWxldGVfYXV0b3N5bmNfdGl0bGUnKSB8fCAnRGVsZXRlIGF1dG8tc3luY2VkIGdhbWVzPycgfX08L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTIgdGV4dC1zbVwiPlxyXG4gICAgICAgIDxwPlxyXG4gICAgICAgICAge3tcclxuICAgICAgICAgICAgJHQoJ3BsYXluaXRlLmRlbGV0ZV9hdXRvc3luY19ib2R5JykgfHxcclxuICAgICAgICAgICAgJ1RoaXMgcmVtb3ZlcyBldmVyeSBQbGF5bml0ZS1tYW5hZ2VkIGF1dG8tc3luYyBlbnRyeSBmcm9tIHRoZSBBcHBsaWNhdGlvbnMgbGlzdC4gQXBwcyBhZGRlZCBtYW51YWxseSBhcmUgbm90IGFmZmVjdGVkLidcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPHRlbXBsYXRlICNmb290ZXI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtM1wiPlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHR5cGU9XCJkZWZhdWx0XCIgc3Ryb25nIEBjbGljaz1cInNob3dEZWxldGVBdXRvc3luY0NvbmZpcm0gPSBmYWxzZVwiPnt7XHJcbiAgICAgICAgICAgICR0KCdfY29tbW9uLmNhbmNlbCcpIHx8ICdDYW5jZWwnXHJcbiAgICAgICAgICB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgIDpsb2FkaW5nPVwiZGVsZXRpbmdBdXRvc3luY1wiXHJcbiAgICAgICAgICAgIEBjbGljaz1cImNvbmZpcm1EZWxldGVBdXRvc3luY1wiXHJcbiAgICAgICAgICAgID57eyAkdCgnX2NvbW1vbi5jb250aW51ZScpIHx8ICdDb250aW51ZScgfX08L24tYnV0dG9uXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8L24tY2FyZD5cclxuICA8L24tbW9kYWw+XHJcblxyXG4gIDxuLW1vZGFsIDpzaG93PVwic2hvd1VuaW5zdGFsbENvbmZpcm1cIiBAdXBkYXRlOnNob3c9XCIodikgPT4gKHNob3dVbmluc3RhbGxDb25maXJtID0gdilcIj5cclxuICAgIDxuLWNhcmQgOmJvcmRlcmVkPVwiZmFsc2VcIiBzdHlsZT1cIm1heC13aWR0aDogMzJyZW07IHdpZHRoOiAxMDAlXCI+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDp0cmFzaFwiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgPHNwYW4+e3sgJHQoJ3BsYXluaXRlLnVuaW5zdGFsbF9idXR0b24nKSB8fCAnVW5pbnN0YWxsIFBsdWdpbicgfX08L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtXCI+XHJcbiAgICAgICAge3tcclxuICAgICAgICAgICR0KCdwbGF5bml0ZS51bmluc3RhbGxfcmVxdWlyZXNfcmVzdGFydCcpIHx8XHJcbiAgICAgICAgICAnVW5pbnN0YWxsaW5nIHRoZSBQbGF5bml0ZSBwbHVnaW4gbWF5IHJlcXVpcmUgcmVzdGFydGluZyBQbGF5bml0ZS4gQ29udGludWU/J1xyXG4gICAgICAgIH19XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8dGVtcGxhdGUgI2Zvb3Rlcj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zXCI+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgQGNsaWNrPVwic2hvd1VuaW5zdGFsbENvbmZpcm0gPSBmYWxzZVwiPnt7XHJcbiAgICAgICAgICAgICR0KCdfY29tbW9uLmNhbmNlbCcpXHJcbiAgICAgICAgICB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cImVycm9yXCIgc3Ryb25nIDpsb2FkaW5nPVwidW5pbnN0YWxsaW5nXCIgQGNsaWNrPVwiY29uZmlybVVuaW5zdGFsbFwiPnt7XHJcbiAgICAgICAgICAgICR0KCdfY29tbW9uLmNvbnRpbnVlJykgfHwgJ0NvbnRpbnVlJ1xyXG4gICAgICAgICAgfX08L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgPC9uLWNhcmQ+XHJcbiAgPC9uLW1vZGFsPlxyXG5cclxuICA8IS0tIEFkZCBFeGNsdXNpb25zIG1vZGFsIC0tPlxyXG4gIDxuLW1vZGFsIDpzaG93PVwic2hvd0FkZE1vZGFsXCIgQHVwZGF0ZTpzaG93PVwiKHYpID0+IChzaG93QWRkTW9kYWwgPSB2KVwiPlxyXG4gICAgPG4tY2FyZFxyXG4gICAgICA6Ym9yZGVyZWQ9XCJmYWxzZVwiXHJcbiAgICAgIHN0eWxlPVwibWF4LXdpZHRoOiA0MHJlbTsgd2lkdGg6IDEwMCU7IGhlaWdodDogYXV0bzsgbWF4LWhlaWdodDogY2FsYygxMDBkdmggLSAycmVtKVwiXHJcbiAgICA+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImhlcm9pY29ucy1zb2xpZDpsaXN0LWNoZWNrXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICA8c3Bhbj57eyAkdCgncGxheW5pdGUuYWRkX2V4Y2x1c2lvbnMnKSB8fCAnQWRkIEV4Y2x1c2lvbnMnIH19PC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiYWRkU2VsZWN0aW9uXCJcclxuICAgICAgICAgIDpvcHRpb25zPVwiYWRkT3B0aW9uc1wiXHJcbiAgICAgICAgICBtdWx0aXBsZVxyXG4gICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICA6bG9hZGluZz1cImdhbWVzTG9hZGluZ1wiXHJcbiAgICAgICAgICA6ZGlzYWJsZWQ9XCJkaXNhYmxlUGxheW5pdGVTZWxlY3Rpb25cIlxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwiJHQoJ3BsYXluaXRlLmFkZF9leGNsdXNpb25zX3BsYWNlaG9sZGVyJykgfHwgJ1NlYXJjaCBhbmQgc2VsZWN0IGdhbWVzJ1wiXHJcbiAgICAgICAgICBjbGFzcz1cInctZnVsbFwiXHJcbiAgICAgICAgICBAZm9jdXM9XCIoKSA9PiBsb2FkR2FtZXMoKVwiXHJcbiAgICAgICAgLz5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAkdCgncGxheW5pdGUuYWRkX2V4Y2x1c2lvbnNfaGludCcpIHx8XHJcbiAgICAgICAgICAgICdQaWNrIG9uZSBvciBtb3JlIGdhbWVzIHRvIGV4Y2x1ZGUgZnJvbSBhdXRvLXN5bmMuJ1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjZm9vdGVyPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwiZGVmYXVsdFwiIHN0cm9uZyBAY2xpY2s9XCJzaG93QWRkTW9kYWwgPSBmYWxzZVwiPnt7XHJcbiAgICAgICAgICAgICR0KCdfY29tbW9uLmNhbmNlbCcpXHJcbiAgICAgICAgICB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cInByaW1hcnlcIiA6ZGlzYWJsZWQ9XCIhYWRkU2VsZWN0aW9uLmxlbmd0aFwiIEBjbGljaz1cImNvbmZpcm1BZGRFeGNsdXNpb25zXCI+e3tcclxuICAgICAgICAgICAgJHQoJ19jb21tb24uYWRkJykgfHwgJ0FkZCdcclxuICAgICAgICAgIH19PC9uLWJ1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC90ZW1wbGF0ZT5cclxuICAgIDwvbi1jYXJkPlxyXG4gIDwvbi1tb2RhbD5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCBvbk1vdW50ZWQsIHJlYWN0aXZlLCByZWYsIG9uVW5tb3VudGVkLCB3YXRjaCwgaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7XHJcbiAgTklucHV0TnVtYmVyLFxyXG4gIE5TZWxlY3QsXHJcbiAgTkJ1dHRvbixcclxuICBOQWxlcnQsXHJcbiAgTlRhZyxcclxuICBOVG9vbHRpcCxcclxuICBOTW9kYWwsXHJcbiAgTkNhcmQsXHJcbiAgTlJhZGlvR3JvdXAsXHJcbiAgTlJhZGlvLFxyXG4gIE5EYXRhVGFibGUsXHJcbiAgdXNlTm90aWZpY2F0aW9uLFxyXG59IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgdXNlSTE4biB9IGZyb20gJ3Z1ZS1pMThuJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJ0AvQ2hlY2tib3gudnVlJztcclxuaW1wb3J0IENvbmZpZ0R1cmF0aW9uRmllbGQgZnJvbSAnQC9Db25maWdEdXJhdGlvbkZpZWxkLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgUGxheW5pdGVSZWluc3RhbGxCdXR0b24gZnJvbSAnQC9jb21wb25lbnRzL1BsYXluaXRlUmVpbnN0YWxsQnV0dG9uLnZ1ZSc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcblxyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IHsgY29uZmlnLCBtZXRhZGF0YSB9ID0gc3RvcmVUb1JlZnMoc3RvcmUpO1xyXG5jb25zdCBwbGF0Zm9ybSA9IGNvbXB1dGVkKCgpID0+XHJcbiAgKG1ldGFkYXRhLnZhbHVlPy5wbGF0Zm9ybSB8fCBjb25maWcudmFsdWU/LnBsYXRmb3JtIHx8ICcnKS50b0xvd2VyQ2FzZSgpLFxyXG4pO1xyXG5jb25zdCB7IHQgfSA9IHVzZUkxOG4oKTtcclxuXHJcbmNvbnN0IHN0YXR1cyA9IHJlYWN0aXZlPHtcclxuICBpbnN0YWxsZWQ6IGJvb2xlYW4gfCBudWxsO1xyXG4gIGluc3RhbGxlZF91bmtub3duPzogYm9vbGVhbjtcclxuICBhY3RpdmU6IGJvb2xlYW47XHJcbiAgZW5hYmxlZD86IGJvb2xlYW47XHJcbiAgcGxheW5pdGVfcnVubmluZz86IGJvb2xlYW47XHJcbiAgZXh0ZW5zaW9uc19kaXI6IHN0cmluZztcclxuICBwbHVnaW5fdmVyc2lvbj86IHN0cmluZztcclxuICBwbHVnaW5fbGF0ZXN0Pzogc3RyaW5nO1xyXG59Pih7IGluc3RhbGxlZDogbnVsbCwgYWN0aXZlOiBmYWxzZSwgZXh0ZW5zaW9uc19kaXI6ICcnIH0pO1xyXG5jb25zdCBsYXVuY2hpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCB1bmluc3RhbGxpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBkZWxldGluZ0F1dG9zeW5jID0gcmVmKGZhbHNlKTtcclxuY29uc3Qgc2hvd1VuaW5zdGFsbENvbmZpcm0gPSByZWYoZmFsc2UpO1xyXG5jb25zdCBzaG93RGVsZXRlQXV0b3N5bmNDb25maXJtID0gcmVmKGZhbHNlKTtcclxuLy8gTmFpdmUgVUkgbm90aWZpY2F0aW9ucyBmb3IgdHJhbnNpZW50IG1lc3NhZ2VzXHJcbmNvbnN0IG5vdGlmaWNhdGlvbiA9IHVzZU5vdGlmaWNhdGlvbigpO1xyXG5mdW5jdGlvbiBub3RpZnkodHlwZTogJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICdpbmZvJyB8ICd3YXJuaW5nJywgY29udGVudDogc3RyaW5nKSB7XHJcbiAgbm90aWZpY2F0aW9uLmNyZWF0ZSh7IHR5cGUsIGNvbnRlbnQsIGR1cmF0aW9uOiA1MDAwIH0pO1xyXG59XHJcblxyXG5jb25zdCBOVUxMX0dVSUQgPSAnMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwJztcclxuY29uc3QgY2F0ZWdvcmllc0xvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBwbHVnaW5zTG9hZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGdhbWVzTG9hZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGNhdGVnb3J5T3B0aW9ucyA9IHJlZjx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdPihbXSk7XHJcbmNvbnN0IHBsdWdpbk9wdGlvbnMgPSByZWY8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH1bXT4oW10pO1xyXG50eXBlIEdhbWVSb3cgPSB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgaW5zdGFsbGVkPzogYm9vbGVhbjtcclxuICBjYXRlZ29yaWVzPzogc3RyaW5nW107XHJcbiAgcGx1Z2luSWQ/OiBzdHJpbmc7XHJcbiAgcGx1Z2luTmFtZT86IHN0cmluZztcclxufTtcclxuY29uc3QgZ2FtZXNMaXN0ID0gcmVmPEdhbWVSb3dbXT4oW10pO1xyXG5jb25zdCBnYW1lc1NvdXJjZSA9IHJlZjwnbGl2ZScgfCAnY2FjaGUnIHwgJ25vbmUnPignbm9uZScpO1xyXG5jb25zdCBnYW1lc0NhY2hlVGltZSA9IHJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcclxuLy8gRHVhbC1saXN0IHRyYW5zZmVyIHZhbHVlIG1pcnJvcnMgdGhlIGV4Y2x1ZGVkIElEc1xyXG5jb25zdCB0cmFuc2ZlclZhbHVlID0gcmVmPHN0cmluZ1tdPihbXSk7XHJcblxyXG50eXBlIElkTmFtZUVudHJ5ID0geyBpZD86IHN0cmluZzsgbmFtZT86IHN0cmluZyB9O1xyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplSWROYW1lRW50cmllcyh2YWx1ZTogdW5rbm93bik6IElkTmFtZUVudHJ5W10ge1xyXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlIGFzIElkTmFtZUVudHJ5W107XHJcbiAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHJldHVybiBbdmFsdWUgYXMgSWROYW1lRW50cnldO1xyXG4gIHJldHVybiBbXTtcclxufVxyXG5cclxuY29uc3Qgc2VsZWN0ZWRDYXRlZ29yaWVzID0gY29tcHV0ZWQ8c3RyaW5nW10+KHtcclxuICBnZXQoKSB7XHJcbiAgICBjb25zdCBhcnIgPSBub3JtYWxpemVJZE5hbWVFbnRyaWVzKGNvbmZpZy52YWx1ZT8ucGxheW5pdGVfc3luY19jYXRlZ29yaWVzKTtcclxuICAgIHJldHVybiBhcnIubWFwKChvKSA9PiBvLmlkIHx8IG8ubmFtZSB8fCAnJykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0sXHJcbiAgc2V0KHY6IHN0cmluZ1tdKSB7XHJcbiAgICBjb25zdCBtYXBCeVZhbCA9IG5ldyBNYXAoY2F0ZWdvcnlPcHRpb25zLnZhbHVlLm1hcCgobykgPT4gW28udmFsdWUsIG8ubGFiZWxdIGFzIGNvbnN0KSk7XHJcbiAgICBjb25zdCBuZXh0ID0gKHYgfHwgW10pLm1hcCgodmFsKSA9PiAoe1xyXG4gICAgICBpZDogdmFsICYmIG1hcEJ5VmFsLmhhcyh2YWwpID8gdmFsIDogJycsXHJcbiAgICAgIG5hbWU6IG1hcEJ5VmFsLmdldCh2YWwpIHx8IHZhbCxcclxuICAgIH0pKTtcclxuICAgIHN0b3JlLnVwZGF0ZU9wdGlvbigncGxheW5pdGVfc3luY19jYXRlZ29yaWVzJywgbmV4dCk7XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCBleGNsdWRlZENhdGVnb3JpZXMgPSBjb21wdXRlZDxzdHJpbmdbXT4oe1xyXG4gIGdldCgpIHtcclxuICAgIGNvbnN0IGFyciA9IG5vcm1hbGl6ZUlkTmFtZUVudHJpZXMoY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9leGNsdWRlX2NhdGVnb3JpZXMpO1xyXG4gICAgcmV0dXJuIGFyci5tYXAoKG8pID0+IG8uaWQgfHwgby5uYW1lIHx8ICcnKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgfSxcclxuICBzZXQodjogc3RyaW5nW10pIHtcclxuICAgIGNvbnN0IG1hcEJ5VmFsID0gbmV3IE1hcChjYXRlZ29yeU9wdGlvbnMudmFsdWUubWFwKChvKSA9PiBbby52YWx1ZSwgby5sYWJlbF0gYXMgY29uc3QpKTtcclxuICAgIGNvbnN0IG5leHQgPSAodiB8fCBbXSkubWFwKCh2YWwpID0+ICh7XHJcbiAgICAgIGlkOiB2YWwgJiYgbWFwQnlWYWwuaGFzKHZhbCkgPyB2YWwgOiAnJyxcclxuICAgICAgbmFtZTogbWFwQnlWYWwuZ2V0KHZhbCkgfHwgdmFsLFxyXG4gICAgfSkpO1xyXG4gICAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX2NhdGVnb3JpZXMnLCBuZXh0KTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGV4Y2x1ZGVkUGx1Z2lucyA9IGNvbXB1dGVkPHN0cmluZ1tdPih7XHJcbiAgZ2V0KCkge1xyXG4gICAgY29uc3QgYXJyID0gbm9ybWFsaXplSWROYW1lRW50cmllcyhjb25maWcudmFsdWU/LnBsYXluaXRlX2V4Y2x1ZGVfcGx1Z2lucyk7XHJcbiAgICByZXR1cm4gYXJyLm1hcCgobykgPT4gby5pZCB8fCBvLm5hbWUgfHwgJycpLmZpbHRlcihCb29sZWFuKTtcclxuICB9LFxyXG4gIHNldCh2OiBzdHJpbmdbXSkge1xyXG4gICAgY29uc3QgbWFwQnlWYWwgPSBuZXcgTWFwKHBsdWdpbk9wdGlvbnMudmFsdWUubWFwKChvKSA9PiBbby52YWx1ZSwgby5sYWJlbF0gYXMgY29uc3QpKTtcclxuICAgIGNvbnN0IG5leHQgPSAodiB8fCBbXSkubWFwKCh2YWwpID0+ICh7XHJcbiAgICAgIGlkOiB2YWwgJiYgbWFwQnlWYWwuaGFzKHZhbCkgPyB2YWwgOiAnJyxcclxuICAgICAgbmFtZTogbWFwQnlWYWwuZ2V0KHZhbCkgfHwgdmFsLFxyXG4gICAgfSkpO1xyXG4gICAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX3BsdWdpbnMnLCBuZXh0KTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGluY2x1ZGVkUGx1Z2lucyA9IGNvbXB1dGVkPHN0cmluZ1tdPih7XHJcbiAgZ2V0KCkge1xyXG4gICAgY29uc3QgYXJyID0gbm9ybWFsaXplSWROYW1lRW50cmllcyhjb25maWcudmFsdWU/LnBsYXluaXRlX3N5bmNfcGx1Z2lucyk7XHJcbiAgICByZXR1cm4gYXJyLm1hcCgobykgPT4gby5pZCB8fCBvLm5hbWUgfHwgJycpLmZpbHRlcihCb29sZWFuKTtcclxuICB9LFxyXG4gIHNldCh2OiBzdHJpbmdbXSkge1xyXG4gICAgY29uc3QgbWFwQnlWYWwgPSBuZXcgTWFwKHBsdWdpbk9wdGlvbnMudmFsdWUubWFwKChvKSA9PiBbby52YWx1ZSwgby5sYWJlbF0gYXMgY29uc3QpKTtcclxuICAgIGNvbnN0IG5leHQgPSAodiB8fCBbXSkubWFwKCh2YWwpID0+ICh7XHJcbiAgICAgIGlkOiB2YWwgJiYgbWFwQnlWYWwuaGFzKHZhbCkgPyB2YWwgOiAnJyxcclxuICAgICAgbmFtZTogbWFwQnlWYWwuZ2V0KHZhbCkgfHwgdmFsLFxyXG4gICAgfSkpO1xyXG4gICAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9zeW5jX3BsdWdpbnMnLCBuZXh0KTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGV4Y2x1ZGVkSWRzID0gY29tcHV0ZWQ8c3RyaW5nW10+KHtcclxuICBnZXQoKSB7XHJcbiAgICBjb25zdCBhcnIgPSBub3JtYWxpemVJZE5hbWVFbnRyaWVzKGNvbmZpZy52YWx1ZT8ucGxheW5pdGVfZXhjbHVkZV9nYW1lcyk7XHJcbiAgICByZXR1cm4gYXJyLm1hcCgobykgPT4gby5pZCB8fCAnJykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0sXHJcbiAgc2V0KHY6IHN0cmluZ1tdKSB7XHJcbiAgICBjb25zdCBuYW1lQnlJZCA9IG5ldyBNYXAoZ2FtZXNMaXN0LnZhbHVlLm1hcCgoZykgPT4gW2cuaWQsIGcubmFtZV0gYXMgY29uc3QpKTtcclxuICAgIGNvbnN0IG5leHQgPSAodiB8fCBbXSkubWFwKChpZCkgPT4gKHsgaWQsIG5hbWU6IG5hbWVCeUlkLmdldChpZCkgfHwgJycgfSkpO1xyXG4gICAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX2dhbWVzJywgbmV4dCk7XHJcbiAgfSxcclxufSk7XHJcblxyXG4vLyBCdWlsZCB0aGUgZGlzcGxheSBsaXN0IG9mIGN1cnJlbnQgZXhjbHVzaW9ucywgcmVzb2x2aW5nIG5hbWVzIGZyb20gY2FjaGUgaWYgbWlzc2luZ1xyXG5jb25zdCBleGNsdWRlZERpc3BsYXlMaXN0ID0gY29tcHV0ZWQ8QXJyYXk8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfT4+KCgpID0+IHtcbiAgY29uc3QgYXJyID0gbm9ybWFsaXplSWROYW1lRW50cmllcyhjb25maWcudmFsdWU/LnBsYXluaXRlX2V4Y2x1ZGVfZ2FtZXMpO1xuICBjb25zdCBuYW1lQnlJZCA9IG5ldyBNYXAoZ2FtZXNMaXN0LnZhbHVlLm1hcCgoZykgPT4gW2cuaWQsIGcubmFtZV0gYXMgY29uc3QpKTtcbiAgcmV0dXJuIChhcnIgfHwgW10pXG4gICAgLm1hcCgoeyBpZCwgbmFtZSB9KSA9PiAoeyBpZDogaWQgfHwgJycsIG5hbWU6IG5hbWUgfHwgbmFtZUJ5SWQuZ2V0KGlkIHx8ICcnKSB8fCAnJyB9KSlcbiAgICAuZmlsdGVyKChlbnRyeSkgPT4gISFlbnRyeS5pZCk7XG59KTtcblxyXG4vLyBDb25uZWN0aXZpdHkgaW5kaWNhdG9yIGhlbHBlcnMgZm9yIHRyYW5zZmVyIFVJXHJcbmNvbnN0IGxpbWl0ZWRDb25uZWN0aXZpdHkgPSBjb21wdXRlZCgoKSA9PiBzdGF0dXNLaW5kLnZhbHVlICE9PSAnYWN0aXZlJyk7XHJcbmNvbnN0IGhhc0NhY2hlZEdhbWVzID0gY29tcHV0ZWQoXHJcbiAgKCkgPT5cclxuICAgIGdhbWVzU291cmNlLnZhbHVlID09PSAnY2FjaGUnIHx8IChBcnJheS5pc0FycmF5KGdhbWVzTGlzdC52YWx1ZSkgJiYgZ2FtZXNMaXN0LnZhbHVlLmxlbmd0aCA+IDApLFxyXG4pO1xyXG5jb25zdCBsaW1pdGVkTm9DYWNoZSA9IGNvbXB1dGVkKCgpID0+IGxpbWl0ZWRDb25uZWN0aXZpdHkudmFsdWUgJiYgIWhhc0NhY2hlZEdhbWVzLnZhbHVlKTtcclxuY29uc3QgbGltaXRlZFdpdGhDYWNoZSA9IGNvbXB1dGVkKCgpID0+IGxpbWl0ZWRDb25uZWN0aXZpdHkudmFsdWUgJiYgaGFzQ2FjaGVkR2FtZXMudmFsdWUpO1xyXG5cclxuLy8gVHJhbnNmZXIgb3B0aW9ucyBpbmNsdWRlIGFsbCBnYW1lcyBhbmQgYW55IGV4Y2x1ZGVkIGl0ZW1zIG5vdCBpbiBnYW1lcyAoc28gcmlnaHQgbGlzdCBhbHdheXMgc2hvd3MpXHJcbmNvbnN0IHRyYW5zZmVyT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xyXG4gIGZvciAoY29uc3QgZyBvZiBnYW1lc0xpc3QudmFsdWUpXHJcbiAgICBtYXAuc2V0KGcuaWQsIGcubmFtZSB8fCAodCgncGxheW5pdGUudW5rbm93bl9nYW1lJykgYXMgYW55KSB8fCAnVW5rbm93bicpO1xyXG4gIGZvciAoY29uc3QgZyBvZiBleGNsdWRlZERpc3BsYXlMaXN0LnZhbHVlKVxyXG4gICAgaWYgKCFtYXAuaGFzKGcuaWQpKSBtYXAuc2V0KGcuaWQsIGcubmFtZSB8fCAodCgncGxheW5pdGUudW5rbm93bl9nYW1lJykgYXMgYW55KSB8fCAnVW5rbm93bicpO1xyXG4gIGNvbnN0IGFyciA9IEFycmF5LmZyb20obWFwLmVudHJpZXMoKSkubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKHsgdmFsdWUsIGxhYmVsIH0pKTtcclxuICByZXR1cm4gYXJyLnNvcnQoKGEsIGIpID0+IGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsKSk7XHJcbn0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFN0YXR1cygpIHtcclxuICBpZiAocGxhdGZvcm0udmFsdWUgIT09ICd3aW5kb3dzJykgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvcGxheW5pdGUvc3RhdHVzJyk7XHJcbiAgICBpZiAoci5zdGF0dXMgPT09IDIwMCAmJiByLmRhdGEpIHtcclxuICAgICAgY29uc3QgZCA9IHIuZGF0YSBhcyBhbnk7XHJcbiAgICAgIHN0YXR1cy5pbnN0YWxsZWQgPSB0eXBlb2YgZC5pbnN0YWxsZWQgPT09ICdib29sZWFuJyA/IGQuaW5zdGFsbGVkIDogbnVsbDtcclxuICAgICAgc3RhdHVzLmFjdGl2ZSA9ICEhZC5hY3RpdmU7XHJcbiAgICAgIC8vICdlbmFibGVkJyBpcyBubyBsb25nZXIgYSBjb25maWc7IHByZXNlbmNlIGlzIGluZGljYXRlZCBieSAnaW5zdGFsbGVkJ1xyXG4gICAgICBpZiAodHlwZW9mIGQucGxheW5pdGVfcnVubmluZyA9PT0gJ2Jvb2xlYW4nKSBzdGF0dXMucGxheW5pdGVfcnVubmluZyA9ICEhZC5wbGF5bml0ZV9ydW5uaW5nO1xyXG4gICAgICBzdGF0dXMuZXh0ZW5zaW9uc19kaXIgPSBkLmV4dGVuc2lvbnNfZGlyIHx8ICcnO1xyXG4gICAgICBzdGF0dXMucGx1Z2luX3ZlcnNpb24gPVxyXG4gICAgICAgIGQuaW5zdGFsbGVkX3ZlcnNpb24gfHwgZC5wbHVnaW5fdmVyc2lvbiB8fCBkLnZlcnNpb24gfHwgc3RhdHVzLnBsdWdpbl92ZXJzaW9uO1xyXG4gICAgICBzdGF0dXMucGx1Z2luX2xhdGVzdCA9XHJcbiAgICAgICAgZC5wYWNrYWdlZF92ZXJzaW9uIHx8IGQucGx1Z2luX2xhdGVzdCB8fCBkLmxhdGVzdF92ZXJzaW9uIHx8IHN0YXR1cy5wbHVnaW5fbGF0ZXN0O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKF8pIHt9XHJcbn1cclxuXHJcbmNvbnN0IGRpYWdub3N0aWNUZXh0ID0gY29tcHV0ZWQ8c3RyaW5nIHwgJyc+KCgpID0+IHtcclxuICBzd2l0Y2ggKHN0YXR1c0tpbmQudmFsdWUpIHtcclxuICAgIGNhc2UgJ3VuaW5zdGFsbGVkJzpcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICAodCgncGxheW5pdGUuZGlhZ25vc3RpY19ub3RfaW5zdGFsbGVkJykgYXMgYW55KSB8fFxyXG4gICAgICAgICdQbGF5bml0ZSBwbHVnaW4gaXMgbm90IGluc3RhbGxlZCBpbiB0aGUgRXh0ZW5zaW9ucyBkaXJlY3RvcnkuJ1xyXG4gICAgICApO1xyXG4gICAgY2FzZSAnd2FpdGluZyc6XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgKHQoJ3BsYXluaXRlLmRpYWdub3N0aWNfbm90X3J1bm5pbmcnKSBhcyBhbnkpIHx8XHJcbiAgICAgICAgJ1BsYXluaXRlIGlzIG5vdCBydW5uaW5nLiBMYXVuY2ggaXQgdG8gcmVzdW1lIHN5bmNpbmcuJ1xyXG4gICAgICApO1xyXG4gICAgY2FzZSAnYWN0aXZlJzpcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICcnO1xyXG4gIH1cclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkQ2F0ZWdvcmllcygpIHtcclxuICBpZiAocGxhdGZvcm0udmFsdWUgIT09ICd3aW5kb3dzJykgcmV0dXJuO1xyXG4gIGlmIChjYXRlZ29yaWVzTG9hZGluZy52YWx1ZSB8fCBjYXRlZ29yeU9wdGlvbnMudmFsdWUubGVuZ3RoKSByZXR1cm47XHJcbiAgY2F0ZWdvcmllc0xvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICAvLyBQcmVmZXIgY2F0ZWdvcmllcyBlbmRwb2ludCBpZiBhdmFpbGFibGVcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJjID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvcGxheW5pdGUvY2F0ZWdvcmllcycsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XHJcbiAgICAgIGlmIChyYy5zdGF0dXMgPj0gMjAwICYmIHJjLnN0YXR1cyA8IDMwMCAmJiBBcnJheS5pc0FycmF5KHJjLmRhdGEpICYmIHJjLmRhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgY2F0cyA9IChyYy5kYXRhIGFzIGFueVtdKVxyXG4gICAgICAgICAgLm1hcCgoYykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZygoYyBhcyBhbnkpLmlkIHx8ICcnKTtcclxuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gU3RyaW5nKChjIGFzIGFueSkubmFtZSB8fCBpZCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHsgbGFiZWw6IG5hbWUsIHZhbHVlOiBpZCB8fCBuYW1lIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcyA9IFN0cmluZyhjIHx8ICcnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHMgPyB7IGxhYmVsOiBzLCB2YWx1ZTogcyB9IDogbnVsbDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuZmlsdGVyKCh4KTogeCBpcyB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfSA9PiAhIXgpXHJcbiAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpKTtcclxuICAgICAgICBjYXRlZ29yeU9wdGlvbnMudmFsdWUgPSBjYXRzIGFzIHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9W107XHJcbiAgICAgICAgY2F0ZWdvcmllc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge31cclxuICAgIC8vIEZhbGxiYWNrOiBkZXJpdmUgZnJvbSBnYW1lcyBsaXN0XHJcbiAgICBjb25zdCByZyA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL3BsYXluaXRlL2dhbWVzJyk7XHJcbiAgICBjb25zdCBnYW1lczogYW55W10gPSBBcnJheS5pc0FycmF5KHJnLmRhdGEpID8gcmcuZGF0YSA6IFtdO1xyXG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGcgb2YgZ2FtZXMpXHJcbiAgICAgIGZvciAoY29uc3QgYyBvZiBnPy5jYXRlZ29yaWVzIHx8IFtdKSBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ3N0cmluZycpIHNldC5hZGQoYyk7XHJcbiAgICBjYXRlZ29yeU9wdGlvbnMudmFsdWUgPSBBcnJheS5mcm9tKHNldClcclxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSlcclxuICAgICAgLm1hcCgoYykgPT4gKHsgbGFiZWw6IGMsIHZhbHVlOiBjIH0pKTtcclxuICB9IGNhdGNoIChfKSB7fVxyXG4gIGNhdGVnb3JpZXNMb2FkaW5nLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuc3VyZVBsdWdpbk9wdGlvbnNJbmNsdWRlU2VsZWN0aW9uKCkge1xyXG4gIGNvbnN0IGN1cnJlbnQgPSBwbHVnaW5PcHRpb25zLnZhbHVlLnNsaWNlKCk7XHJcbiAgY29uc3QgYnlWYWx1ZSA9IG5ldyBNYXAoY3VycmVudC5tYXAoKG8pID0+IFtvLnZhbHVlLCBvXSBhcyBjb25zdCkpO1xyXG4gIGNvbnN0IHNlbGVjdGVkID0gW1xyXG4gICAgLi4uKChjb25maWcudmFsdWU/LnBsYXluaXRlX2V4Y2x1ZGVfcGx1Z2lucyB8fCBbXSkgYXMgQXJyYXk8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfT4pLFxyXG4gICAgLi4uKChjb25maWcudmFsdWU/LnBsYXluaXRlX3N5bmNfcGx1Z2lucyB8fCBbXSkgYXMgQXJyYXk8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfT4pLFxyXG4gIF07XHJcbiAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIHNlbGVjdGVkIHx8IFtdKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IGVudHJ5Py5pZCB8fCBlbnRyeT8ubmFtZSB8fCAnJztcclxuICAgIGlmICghdmFsdWUgfHwgdmFsdWUgPT09IE5VTExfR1VJRCkgY29udGludWU7XHJcbiAgICBjb25zdCBsYWJlbCA9IGVudHJ5Py5uYW1lIHx8IGVudHJ5Py5pZCB8fCB2YWx1ZTtcbiAgICBpZiAoIWJ5VmFsdWUuaGFzKHZhbHVlKSkge1xuICAgICAgY29uc3Qgb3B0aW9uID0geyB2YWx1ZSwgbGFiZWwgfTtcbiAgICAgIGN1cnJlbnQucHVzaChvcHRpb24pO1xuICAgICAgYnlWYWx1ZS5zZXQodmFsdWUsIG9wdGlvbik7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGJ5VmFsdWUuZ2V0KHZhbHVlKTtcclxuICAgICAgaWYgKGV4aXN0aW5nICYmICFleGlzdGluZy5sYWJlbCAmJiBsYWJlbCkge1xyXG4gICAgICAgIGV4aXN0aW5nLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGNoYW5nZWQpIHtcclxuICAgIHBsdWdpbk9wdGlvbnMudmFsdWUgPSBjdXJyZW50LnNvcnQoKGEsIGIpID0+IGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsKSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkUGx1Z2lucygpIHtcclxuICBpZiAocGxhdGZvcm0udmFsdWUgIT09ICd3aW5kb3dzJykgcmV0dXJuO1xyXG4gIGlmIChwbHVnaW5zTG9hZGluZy52YWx1ZSB8fCBwbHVnaW5PcHRpb25zLnZhbHVlLmxlbmd0aCkge1xyXG4gICAgZW5zdXJlUGx1Z2luT3B0aW9uc0luY2x1ZGVTZWxlY3Rpb24oKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgcGx1Z2luc0xvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xyXG4gICAgY29uc3QgaW5nZXN0R2FtZXMgPSAocm93czogR2FtZVJvd1tdKSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3QgZyBvZiByb3dzKSB7XHJcbiAgICAgICAgaWYgKCFnKSBjb250aW51ZTtcclxuICAgICAgICBjb25zdCBwaWQgPSBnLnBsdWdpbklkID8gU3RyaW5nKGcucGx1Z2luSWQpIDogJyc7XHJcbiAgICAgICAgY29uc3QgcG5hbWUgPSBnLnBsdWdpbk5hbWUgPyBTdHJpbmcoZy5wbHVnaW5OYW1lKSA6ICcnO1xyXG4gICAgICAgIGlmICghcGlkIHx8IHBpZCA9PT0gTlVMTF9HVUlEKSBjb250aW51ZTtcclxuICAgICAgICBpZiAoIW1hcC5oYXMocGlkKSkge1xyXG4gICAgICAgICAgbWFwLnNldChwaWQsIHBuYW1lIHx8IHBpZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghbWFwLmdldChwaWQpICYmIHBuYW1lKSB7XHJcbiAgICAgICAgICBtYXAuc2V0KHBpZCwgcG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlmIChnYW1lc0xpc3QudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgIGluZ2VzdEdhbWVzKGdhbWVzTGlzdC52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIW1hcC5zaXplKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmcgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9wbGF5bml0ZS9nYW1lcycsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XHJcbiAgICAgICAgaWYgKHJnLnN0YXR1cyA+PSAyMDAgJiYgcmcuc3RhdHVzIDwgMzAwICYmIEFycmF5LmlzQXJyYXkocmcuZGF0YSkpIHtcclxuICAgICAgICAgIGluZ2VzdEdhbWVzKFxyXG4gICAgICAgICAgICAocmcuZGF0YSBhcyBhbnlbXSkubWFwKChnKSA9PiAoe1xyXG4gICAgICAgICAgICAgIGlkOiBTdHJpbmcoZz8uaWQgfHwgJycpLFxyXG4gICAgICAgICAgICAgIG5hbWU6IFN0cmluZyhnPy5uYW1lIHx8IGc/LmlkIHx8ICcnKSxcclxuICAgICAgICAgICAgICBwbHVnaW5JZDogZz8ucGx1Z2luSWQgPyBTdHJpbmcoZy5wbHVnaW5JZCkgOiAnJyxcclxuICAgICAgICAgICAgICBwbHVnaW5OYW1lOiBnPy5wbHVnaW5OYW1lID8gU3RyaW5nKGcucGx1Z2luTmFtZSkgOiAnJyxcclxuICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge31cclxuICAgIH1cclxuICAgIGNvbnN0IG9wdHMgPSBBcnJheS5mcm9tKG1hcC5lbnRyaWVzKCkpXHJcbiAgICAgIC5tYXAoKFt2YWx1ZSwgbGFiZWxdKSA9PiAoeyB2YWx1ZSwgbGFiZWw6IGxhYmVsIHx8IHZhbHVlIH0pKVxyXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpKTtcclxuICAgIHBsdWdpbk9wdGlvbnMudmFsdWUgPSBvcHRzO1xyXG4gICAgZW5zdXJlUGx1Z2luT3B0aW9uc0luY2x1ZGVTZWxlY3Rpb24oKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgcGx1Z2luc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEdBTUVTX0NBQ0hFX0tFWSA9ICdwbGF5bml0ZV9nYW1lc19jYWNoZV92Mic7XHJcbmZ1bmN0aW9uIHNhdmVHYW1lc0NhY2hlKGxpc3Q6IEdhbWVSb3dbXSkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICB0OiBEYXRlLm5vdygpLFxyXG4gICAgICBnYW1lczogbGlzdC5tYXAoKGcpID0+ICh7XHJcbiAgICAgICAgaWQ6IGcuaWQsXHJcbiAgICAgICAgbmFtZTogZy5uYW1lLFxyXG4gICAgICAgIGluc3RhbGxlZDogISFnLmluc3RhbGxlZCxcclxuICAgICAgICBjYXRlZ29yaWVzOiBBcnJheS5pc0FycmF5KGcuY2F0ZWdvcmllcykgPyBnLmNhdGVnb3JpZXMgOiBbXSxcclxuICAgICAgICBwbHVnaW5JZDogZy5wbHVnaW5JZCB8fCAnJyxcclxuICAgICAgICBwbHVnaW5OYW1lOiBnLnBsdWdpbk5hbWUgfHwgJycsXHJcbiAgICAgIH0pKSxcclxuICAgIH07XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShHQU1FU19DQUNIRV9LRVksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcclxuICB9IGNhdGNoIHt9XHJcbn1cclxuZnVuY3Rpb24gbG9hZEdhbWVzQ2FjaGUoKTogeyB0OiBudW1iZXI7IGdhbWVzOiBHYW1lUm93W10gfSB8IG51bGwge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByYXcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShHQU1FU19DQUNIRV9LRVkpO1xyXG4gICAgaWYgKCFyYXcpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpO1xyXG4gICAgaWYgKCFwYXJzZWQgfHwgIUFycmF5LmlzQXJyYXkocGFyc2VkLmdhbWVzKSkgcmV0dXJuIG51bGw7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0OiBOdW1iZXIocGFyc2VkLnQpIHx8IERhdGUubm93KCksXHJcbiAgICAgIGdhbWVzOiAocGFyc2VkLmdhbWVzIGFzIGFueVtdKS5tYXAoKGcpID0+ICh7XHJcbiAgICAgICAgaWQ6IFN0cmluZyhnPy5pZCB8fCAnJyksXHJcbiAgICAgICAgbmFtZTogU3RyaW5nKGc/Lm5hbWUgfHwgZz8uaWQgfHwgJycpLFxyXG4gICAgICAgIGluc3RhbGxlZDogISFnPy5pbnN0YWxsZWQsXHJcbiAgICAgICAgY2F0ZWdvcmllczogQXJyYXkuaXNBcnJheShnPy5jYXRlZ29yaWVzKSA/IGcuY2F0ZWdvcmllcyA6IFtdLFxyXG4gICAgICAgIHBsdWdpbklkOiBnPy5wbHVnaW5JZCA/IFN0cmluZyhnLnBsdWdpbklkKSA6ICcnLFxyXG4gICAgICAgIHBsdWdpbk5hbWU6IGc/LnBsdWdpbk5hbWUgPyBTdHJpbmcoZy5wbHVnaW5OYW1lKSA6ICcnLFxyXG4gICAgICB9KSkgYXMgR2FtZVJvd1tdLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEdhbWVzKHVzZUNhY2hlRmlyc3QgPSB0cnVlKSB7XHJcbiAgaWYgKHBsYXRmb3JtLnZhbHVlICE9PSAnd2luZG93cycpIHJldHVybjtcclxuICBpZiAoZ2FtZXNMb2FkaW5nLnZhbHVlKSByZXR1cm47XHJcbiAgZ2FtZXNMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICBpZiAodXNlQ2FjaGVGaXJzdCkge1xyXG4gICAgY29uc3QgY2FjaGVkID0gbG9hZEdhbWVzQ2FjaGUoKTtcclxuICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLmdhbWVzLmxlbmd0aCkge1xyXG4gICAgICBnYW1lc0xpc3QudmFsdWUgPSBjYWNoZWQuZ2FtZXMuc2xpY2UoKS5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKTtcclxuICAgICAgZ2FtZXNTb3VyY2UudmFsdWUgPSAnY2FjaGUnO1xyXG4gICAgICBnYW1lc0NhY2hlVGltZS52YWx1ZSA9IGNhY2hlZC50O1xyXG4gICAgfVxyXG4gIH1cclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL3BsYXluaXRlL2dhbWVzJywgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGlmIChyLnN0YXR1cyA+PSAyMDAgJiYgci5zdGF0dXMgPCAzMDAgJiYgQXJyYXkuaXNBcnJheShyLmRhdGEpKSB7XHJcbiAgICAgIGNvbnN0IGdhbWVzOiBhbnlbXSA9IHIuZGF0YSBhcyBhbnlbXTtcclxuICAgICAgY29uc3QgbGlzdDogR2FtZVJvd1tdID0gZ2FtZXNcclxuICAgICAgICAuZmlsdGVyKChnKSA9PiAhIWcuaW5zdGFsbGVkKVxyXG4gICAgICAgIC5tYXAoKGcpID0+ICh7XHJcbiAgICAgICAgICBpZDogU3RyaW5nKGcuaWQpLFxyXG4gICAgICAgICAgbmFtZTogU3RyaW5nKGcubmFtZSB8fCBnLmlkKSxcclxuICAgICAgICAgIGluc3RhbGxlZDogISFnLmluc3RhbGxlZCxcclxuICAgICAgICAgIGNhdGVnb3JpZXM6IEFycmF5LmlzQXJyYXkoZy5jYXRlZ29yaWVzKSA/IGcuY2F0ZWdvcmllcyA6IFtdLFxyXG4gICAgICAgICAgcGx1Z2luSWQ6IGcucGx1Z2luSWQgPyBTdHJpbmcoZy5wbHVnaW5JZCkgOiAnJyxcclxuICAgICAgICAgIHBsdWdpbk5hbWU6IGcucGx1Z2luTmFtZSA/IFN0cmluZyhnLnBsdWdpbk5hbWUpIDogJycsXHJcbiAgICAgICAgfSkpXHJcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xyXG4gICAgICBnYW1lc0xpc3QudmFsdWUgPSBsaXN0O1xyXG4gICAgICBnYW1lc1NvdXJjZS52YWx1ZSA9ICdsaXZlJztcclxuICAgICAgZ2FtZXNDYWNoZVRpbWUudmFsdWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICBzYXZlR2FtZXNDYWNoZShsaXN0KTtcclxuICAgIH0gZWxzZSBpZiAoZ2FtZXNTb3VyY2UudmFsdWUgPT09ICdub25lJykge1xyXG4gICAgICBjb25zdCBjYWNoZWQgPSBsb2FkR2FtZXNDYWNoZSgpO1xyXG4gICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5nYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBnYW1lc0xpc3QudmFsdWUgPSBjYWNoZWQuZ2FtZXMuc2xpY2UoKS5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKTtcclxuICAgICAgICBnYW1lc1NvdXJjZS52YWx1ZSA9ICdjYWNoZSc7XHJcbiAgICAgICAgZ2FtZXNDYWNoZVRpbWUudmFsdWUgPSBjYWNoZWQudDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBnYW1lc1NvdXJjZS52YWx1ZSA9ICdub25lJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKF8pIHtcclxuICAgIGlmIChnYW1lc1NvdXJjZS52YWx1ZSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgIGNvbnN0IGNhY2hlZCA9IGxvYWRHYW1lc0NhY2hlKCk7XHJcbiAgICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLmdhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGdhbWVzTGlzdC52YWx1ZSA9IGNhY2hlZC5nYW1lcy5zbGljZSgpLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xyXG4gICAgICAgIGdhbWVzU291cmNlLnZhbHVlID0gJ2NhY2hlJztcclxuICAgICAgICBnYW1lc0NhY2hlVGltZS52YWx1ZSA9IGNhY2hlZC50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGdhbWVzTG9hZGluZy52YWx1ZSA9IGZhbHNlO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvblJlaW5zdGFsbERvbmUocmVzOiB7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9KSB7XHJcbiAgaWYgKHJlcy5vaykge1xyXG4gICAgbm90aWZ5KCdzdWNjZXNzJywgKHQoJ3BsYXluaXRlLmluc3RhbGxfc3VjY2VzcycpIGFzIGFueSkgfHwgJ1BsdWdpbiBpbnN0YWxsZWQgc3VjY2Vzc2Z1bGx5LicpO1xyXG4gICAgYXdhaXQgcmVmcmVzaFN0YXR1cygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zdCBtc2cgPVxyXG4gICAgICAoKHQoJ3BsYXluaXRlLmluc3RhbGxfZXJyb3InKSBhcyBhbnkpIHx8ICdGYWlsZWQgdG8gaW5zdGFsbCBwbHVnaW4uJykgK1xyXG4gICAgICAocmVzLmVycm9yID8gYDogJHtyZXMuZXJyb3J9YCA6ICcnKTtcclxuICAgIG5vdGlmeSgnZXJyb3InLCBtc2cpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb3BlbkRlbGV0ZUF1dG9zeW5jQ29uZmlybSgpIHtcclxuICBzaG93RGVsZXRlQXV0b3N5bmNDb25maXJtLnZhbHVlID0gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29uZmlybURlbGV0ZUF1dG9zeW5jKCkge1xyXG4gIGRlbGV0aW5nQXV0b3N5bmMudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5wb3N0KCcvYXBpL2FwcHMvcHVyZ2VfYXV0b3N5bmMnLCB7fSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGxldCBib2R5OiBhbnkgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgYm9keSA9IHIuZGF0YTtcclxuICAgIH0gY2F0Y2gge31cclxuICAgIGNvbnN0IG9rID0gci5zdGF0dXMgPj0gMjAwICYmIHIuc3RhdHVzIDwgMzAwICYmIGJvZHkgJiYgYm9keS5zdGF0dXMgPT09IHRydWU7XHJcbiAgICBpZiAob2spIHtcclxuICAgICAgbm90aWZ5KFxyXG4gICAgICAgICdzdWNjZXNzJyxcclxuICAgICAgICAodCgncGxheW5pdGUuZGVsZXRlX2F1dG9zeW5jX3N1Y2Nlc3MnKSBhcyBhbnkpIHx8ICdSZW1vdmVkIGF1dG8tc3luY2VkIFBsYXluaXRlIGdhbWVzLicsXHJcbiAgICAgICk7XHJcbiAgICAgIHNob3dEZWxldGVBdXRvc3luY0NvbmZpcm0udmFsdWUgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9XHJcbiAgICAgICAgKCh0KCdwbGF5bml0ZS5kZWxldGVfYXV0b3N5bmNfZXJyb3InKSBhcyBhbnkpIHx8XHJcbiAgICAgICAgICAnRmFpbGVkIHRvIGRlbGV0ZSBhdXRvLXN5bmNlZCBQbGF5bml0ZSBnYW1lcy4nKSArIChib2R5Py5lcnJvciA/IGA6ICR7Ym9keS5lcnJvcn1gIDogJycpO1xyXG4gICAgICBub3RpZnkoJ2Vycm9yJywgbXNnKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIGNvbnN0IG1zZyA9XHJcbiAgICAgICgodCgncGxheW5pdGUuZGVsZXRlX2F1dG9zeW5jX2Vycm9yJykgYXMgYW55KSB8fFxyXG4gICAgICAgICdGYWlsZWQgdG8gZGVsZXRlIGF1dG8tc3luY2VkIFBsYXluaXRlIGdhbWVzLicpICsgKGU/Lm1lc3NhZ2UgPyBgOiAke2UubWVzc2FnZX1gIDogJycpO1xyXG4gICAgbm90aWZ5KCdlcnJvcicsIG1zZyk7XHJcbiAgfVxyXG4gIGRlbGV0aW5nQXV0b3N5bmMudmFsdWUgPSBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gb3BlblVuaW5zdGFsbENvbmZpcm0oKSB7XHJcbiAgc2hvd1VuaW5zdGFsbENvbmZpcm0udmFsdWUgPSB0cnVlO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjb25maXJtVW5pbnN0YWxsKCkge1xyXG4gIHVuaW5zdGFsbGluZy52YWx1ZSA9IHRydWU7XHJcbiAgc2hvd1VuaW5zdGFsbENvbmZpcm0udmFsdWUgPSBmYWxzZTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAucG9zdChcclxuICAgICAgJy9hcGkvcGxheW5pdGUvdW5pbnN0YWxsJyxcclxuICAgICAgeyByZXN0YXJ0OiB0cnVlIH0sXHJcbiAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBsZXQgb2sgPSBmYWxzZTtcclxuICAgIGxldCBib2R5OiBhbnkgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgYm9keSA9IHIuZGF0YTtcclxuICAgIH0gY2F0Y2gge31cclxuICAgIG9rID0gci5zdGF0dXMgPj0gMjAwICYmIHIuc3RhdHVzIDwgMzAwICYmIGJvZHkgJiYgYm9keS5zdGF0dXMgPT09IHRydWU7XHJcbiAgICBpZiAob2spIHtcclxuICAgICAgbm90aWZ5KFxyXG4gICAgICAgICdzdWNjZXNzJyxcclxuICAgICAgICAodCgncGxheW5pdGUudW5pbnN0YWxsX3N1Y2Nlc3MnKSBhcyBhbnkpIHx8ICdQbHVnaW4gdW5pbnN0YWxsZWQgc3VjY2Vzc2Z1bGx5LicsXHJcbiAgICAgICk7XHJcbiAgICAgIGF3YWl0IHJlZnJlc2hTdGF0dXMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9XHJcbiAgICAgICAgKCh0KCdwbGF5bml0ZS51bmluc3RhbGxfZXJyb3InKSBhcyBhbnkpIHx8ICdGYWlsZWQgdG8gdW5pbnN0YWxsIHBsdWdpbi4nKSArXHJcbiAgICAgICAgKGJvZHkgJiYgYm9keS5lcnJvciA/IGA6ICR7Ym9keS5lcnJvcn1gIDogJycpO1xyXG4gICAgICBub3RpZnkoJ2Vycm9yJywgbXNnKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIGNvbnN0IG1zZyA9XHJcbiAgICAgICgodCgncGxheW5pdGUudW5pbnN0YWxsX2Vycm9yJykgYXMgYW55KSB8fCAnRmFpbGVkIHRvIHVuaW5zdGFsbCBwbHVnaW4uJykgK1xyXG4gICAgICAoZT8ubWVzc2FnZSA/IGA6ICR7ZS5tZXNzYWdlfWAgOiAnJyk7XHJcbiAgICBub3RpZnkoJ2Vycm9yJywgbXNnKTtcclxuICB9XHJcbiAgdW5pbnN0YWxsaW5nLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuXHJcbm9uTW91bnRlZChhc3luYyAoKSA9PiB7XHJcbiAgLy8gZW5zdXJlIGNvbmZpZyBpcyBsb2FkZWQgc28gcGxhdGZvcm0va2V5cyBhdmFpbGFibGVcclxuICBpZiAoIWNvbmZpZy52YWx1ZSkgYXdhaXQgc3RvcmUuZmV0Y2hDb25maWcoKTtcclxuICBhd2FpdCByZWZyZXNoU3RhdHVzKCk7XHJcbiAgLy8gUHJlbG9hZCBsaXN0cyBzbyBleGlzdGluZyBzZWxlY3Rpb25zIGRpc3BsYXkgd2l0aCBuYW1lcyBpbW1lZGlhdGVseVxyXG4gIGxvYWRHYW1lcygpO1xyXG4gIGxvYWRDYXRlZ29yaWVzKCk7XHJcbiAgbG9hZFBsdWdpbnMoKTtcclxuICBlbnN1cmVQbHVnaW5PcHRpb25zSW5jbHVkZVNlbGVjdGlvbigpO1xyXG4gIC8vIFBlcmlvZGljYWxseSByZWZyZXNoIFBsYXluaXRlIHN0YXR1cyB3aGlsZSBvbiBXaW5kb3dzXHJcbiAgaWYgKHBsYXRmb3JtLnZhbHVlID09PSAnd2luZG93cycpIHtcclxuICAgIHN0YXR1c1RpbWVyLnZhbHVlID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgcmVmcmVzaFN0YXR1cygpO1xyXG4gICAgfSwgMzAwMCk7XHJcbiAgfVxyXG4gIC8vIEluaXRpYWxpemUgdHJhbnNmZXIgdmFsdWUgZnJvbSBjdXJyZW50IGV4Y2x1c2lvbnMgYW5kIHN0YXkgaW4gc3luY1xyXG4gIHRyYW5zZmVyVmFsdWUudmFsdWUgPSBleGNsdWRlZElkcy52YWx1ZS5zbGljZSgpO1xyXG4gIHdhdGNoKGV4Y2x1ZGVkSWRzLCAodikgPT4ge1xyXG4gICAgdHJhbnNmZXJWYWx1ZS52YWx1ZSA9ICh2IHx8IFtdKS5zbGljZSgpO1xyXG4gIH0pO1xyXG4gIHdhdGNoKFxyXG4gICAgKCkgPT4gY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9leGNsdWRlX3BsdWdpbnMsXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIGVuc3VyZVBsdWdpbk9wdGlvbnNJbmNsdWRlU2VsZWN0aW9uKCk7XHJcbiAgICB9LFxyXG4gICAgeyBkZWVwOiB0cnVlIH0sXHJcbiAgKTtcclxuICB3YXRjaChcclxuICAgICgpID0+IGNvbmZpZy52YWx1ZT8ucGxheW5pdGVfc3luY19wbHVnaW5zLFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICBlbnN1cmVQbHVnaW5PcHRpb25zSW5jbHVkZVNlbGVjdGlvbigpO1xyXG4gICAgfSxcclxuICAgIHsgZGVlcDogdHJ1ZSB9LFxyXG4gICk7XHJcbiAgLy8gbm8gc2NyZWVuLXNpemUgd2F0Y2hlcnMgbmVlZGVkIGZvciBleGNsdXNpb25zIHRhYmxlXHJcbn0pO1xyXG5vblVubW91bnRlZCgoKSA9PiB7XHJcbiAgaWYgKHN0YXR1c1RpbWVyLnZhbHVlKSB7XHJcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChzdGF0dXNUaW1lci52YWx1ZSk7XHJcbiAgICBzdGF0dXNUaW1lci52YWx1ZSA9IHVuZGVmaW5lZDtcclxuICB9XHJcbiAgLy8gbm90aGluZyB0byB1bmJpbmRcclxufSk7XHJcblxyXG5jb25zdCBzdGF0dXNLaW5kID0gY29tcHV0ZWQ8J2FjdGl2ZScgfCAnd2FpdGluZycgfCAndW5pbnN0YWxsZWQnIHwgJ3Vua25vd24nPigoKSA9PiB7XHJcbiAgaWYgKHN0YXR1cy5hY3RpdmUpIHJldHVybiAnYWN0aXZlJztcclxuICBpZiAoIXN0YXR1cy5leHRlbnNpb25zX2RpcikgcmV0dXJuICd1bmtub3duJztcclxuICBpZiAoc3RhdHVzLmluc3RhbGxlZCA9PT0gZmFsc2UpIHJldHVybiAndW5pbnN0YWxsZWQnO1xyXG4gIGlmIChzdGF0dXMuaW5zdGFsbGVkID09PSB0cnVlKSByZXR1cm4gJ3dhaXRpbmcnO1xyXG4gIHJldHVybiAndW5rbm93bic7XHJcbn0pO1xyXG5jb25zdCBzdGF0dXNUeXBlID0gY29tcHV0ZWQ8J3N1Y2Nlc3MnIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJyB8ICdkZWZhdWx0Jz4oKCkgPT4ge1xyXG4gIHN3aXRjaCAoc3RhdHVzS2luZC52YWx1ZSkge1xyXG4gICAgY2FzZSAnYWN0aXZlJzpcclxuICAgICAgcmV0dXJuICdzdWNjZXNzJztcclxuICAgIGNhc2UgJ3dhaXRpbmcnOlxyXG4gICAgICByZXR1cm4gJ3dhcm5pbmcnO1xyXG4gICAgY2FzZSAndW5pbnN0YWxsZWQnOlxyXG4gICAgICByZXR1cm4gJ2Vycm9yJztcclxuICAgIGNhc2UgJ3Vua25vd24nOlxyXG4gICAgICByZXR1cm4gJ2RlZmF1bHQnO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdkZWZhdWx0JztcclxuICB9XHJcbn0pO1xyXG5jb25zdCBzdGF0dXNUZXh0ID0gY29tcHV0ZWQ8c3RyaW5nPigoKSA9PiB7XHJcbiAgc3dpdGNoIChzdGF0dXNLaW5kLnZhbHVlKSB7XHJcbiAgICBjYXNlICdhY3RpdmUnOlxyXG4gICAgICByZXR1cm4gdCgncGxheW5pdGUuc3RhdHVzX2Nvbm5lY3RlZCcpO1xyXG4gICAgY2FzZSAnd2FpdGluZyc6XHJcbiAgICAgIHJldHVybiB0KCdwbGF5bml0ZS5zdGF0dXNfd2FpdGluZycpO1xyXG4gICAgY2FzZSAndW5pbnN0YWxsZWQnOlxyXG4gICAgICByZXR1cm4gdCgncGxheW5pdGUuc3RhdHVzX3VuaW5zdGFsbGVkJyk7XHJcbiAgICBjYXNlICd1bmtub3duJzpcclxuICAgICAgcmV0dXJuICh0KCdwbGF5bml0ZS5zdGF0dXNfdW5rbm93bicpIGFzIGFueSkgfHwgdCgncGxheW5pdGUuc3RhdHVzX25vdF9ydW5uaW5nX3Vua25vd24nKTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiAnJztcclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gY21wU2VtdmVyKGE/OiBzdHJpbmcsIGI/OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gIGlmICghYSB8fCAhYikgcmV0dXJuIDA7XHJcbiAgY29uc3QgbmEgPSBTdHJpbmcoYSlcclxuICAgIC5yZXBsYWNlKC9edi9pLCAnJylcclxuICAgIC5zcGxpdCgnLicpXHJcbiAgICAubWFwKCh4KSA9PiBwYXJzZUludCh4LCAxMCkpO1xyXG4gIGNvbnN0IG5iID0gU3RyaW5nKGIpXHJcbiAgICAucmVwbGFjZSgvXnYvaSwgJycpXHJcbiAgICAuc3BsaXQoJy4nKVxyXG4gICAgLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCwgMTApKTtcclxuICBjb25zdCBsZW4gPSBNYXRoLm1heChuYS5sZW5ndGgsIG5iLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCB2YSA9IE51bWJlci5pc0Zpbml0ZShuYVtpXSkgPyAobmFbaV0gPz8gMCkgOiAwO1xuICAgIGNvbnN0IHZiID0gTnVtYmVyLmlzRmluaXRlKG5iW2ldKSA/IChuYltpXSA/PyAwKSA6IDA7XG4gICAgaWYgKHZhIDwgdmIpIHJldHVybiAtMTtcclxuICAgIGlmICh2YSA+IHZiKSByZXR1cm4gMTtcclxuICB9XHJcbiAgcmV0dXJuIDA7XHJcbn1cclxuXHJcbmNvbnN0IHBsdWdpbk91dGRhdGVkID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChzdGF0dXMuaW5zdGFsbGVkICE9PSB0cnVlKSByZXR1cm4gZmFsc2U7XHJcbiAgaWYgKCFzdGF0dXMucGx1Z2luX3ZlcnNpb24gfHwgIXN0YXR1cy5wbHVnaW5fbGF0ZXN0KSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIGNtcFNlbXZlcihzdGF0dXMucGx1Z2luX3ZlcnNpb24sIHN0YXR1cy5wbHVnaW5fbGF0ZXN0KSA8IDA7XHJcbn0pO1xyXG5jb25zdCBjYW5MYXVuY2ggPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgcmV0dXJuICEhKHN0YXR1cy5leHRlbnNpb25zX2RpciAmJiBzdGF0dXMuaW5zdGFsbGVkID09PSB0cnVlICYmICFzdGF0dXMuYWN0aXZlKTtcclxufSk7XHJcblxyXG5jb25zdCBzdGF0dXNUaW1lciA9IHJlZjxudW1iZXIgfCB1bmRlZmluZWQ+KCk7XHJcblxyXG5jb25zdCBhdXRvU3luY0VuYWJsZWQgPSBjb21wdXRlZDxib29sZWFuPigoKSA9PiAhIWNvbmZpZy52YWx1ZT8ucGxheW5pdGVfYXV0b19zeW5jKTtcclxuXHJcbi8vIERpc2FibGUgY2F0ZWdvcnkvZ2FtZSBzZWxlY3Rpb24gd2hlbiBQbGF5bml0ZSBpcyBub3QgZnVsbHkgY29ubmVjdGVkXHJcbmNvbnN0IGRpc2FibGVQbGF5bml0ZVNlbGVjdGlvbiA9IGNvbXB1dGVkPGJvb2xlYW4+KCgpID0+IHN0YXR1c0tpbmQudmFsdWUgIT09ICdhY3RpdmUnKTtcclxuY29uc3QgZGlzYWJsZWRIaW50ID0gY29tcHV0ZWQ8c3RyaW5nPigoKSA9PiB7XHJcbiAgcmV0dXJuIChcclxuICAgICh0KCdwbGF5bml0ZS5zZWxlY3RzX2Rpc2FibGVkX2hpbnQnKSBhcyBhbnkpIHx8XHJcbiAgICAnQ2Fubm90IG1vZGlmeSB3aXRob3V0IFBsYXluaXRlIGNvbm5lY3Rpdml0eS4gU3RhcnQgUGxheW5pdGUgdG8gY29udGludWUuJ1xyXG4gICk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gY29weUV4dGVuc2lvbnNQYXRoKCkge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAoc3RhdHVzLmV4dGVuc2lvbnNfZGlyKSBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoc3RhdHVzLmV4dGVuc2lvbnNfZGlyKTtcclxuICAgIG5vdGlmeSgnc3VjY2VzcycsICh0KCdwbGF5bml0ZS5jb3BpZWRfcGF0aCcpIGFzIGFueSkgfHwgJ0NvcGllZCBwYXRoIHRvIGNsaXBib2FyZC4nKTtcclxuICB9IGNhdGNoIHt9XHJcbn1cclxuXHJcbi8vIG9sZCB0YWJsZS1iYXNlZCBleGNsdXNpb24gY29kZSByZW1vdmVkIGluIGZhdm9yIG9mIGFjdGlvbiBsaXN0IFVJXHJcblxyXG5jb25zdCBwb2xpY3lTdW1tYXJ5ID0gY29tcHV0ZWQ8c3RyaW5nPigoKSA9PiB7XHJcbiAgaWYgKCFhdXRvU3luY0VuYWJsZWQudmFsdWUpIHJldHVybiAnJztcclxuICBjb25zdCBuID0gTnVtYmVyKGNvbmZpZy52YWx1ZT8ucGxheW5pdGVfcmVjZW50X2dhbWVzID8/IDApO1xyXG4gIGNvbnN0IGRheXMgPSBOdW1iZXIoY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9yZWNlbnRfbWF4X2FnZV9kYXlzID8/IDApO1xyXG4gIGNvbnN0IHBydW5lRGF5cyA9IE51bWJlcihjb25maWcudmFsdWU/LnBsYXluaXRlX2F1dG9zeW5jX2RlbGV0ZV9hZnRlcl9kYXlzID8/IDApO1xyXG4gIGNvbnN0IGtlZXBVbnRpbFJlcGxhY2VkID0gISFjb25maWcudmFsdWU/LnBsYXluaXRlX2F1dG9zeW5jX3JlcXVpcmVfcmVwbGFjZW1lbnQ7XHJcbiAgY29uc3Qgc3luY0FsbCA9ICEhY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9zeW5jX2FsbF9pbnN0YWxsZWQ7XHJcbiAgY29uc3QgaW5jbHVkZVBsdWdpbkNvdW50ID0gbm9ybWFsaXplSWROYW1lRW50cmllcyhjb25maWcudmFsdWU/LnBsYXluaXRlX3N5bmNfcGx1Z2lucykubGVuZ3RoO1xyXG4gIGNvbnN0IHJlbW92ZVVuaW5zdGFsbGVkID0gY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9hdXRvc3luY19yZW1vdmVfdW5pbnN0YWxsZWQgIT09IGZhbHNlO1xyXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIHBhcnRzLnB1c2goXHJcbiAgICAodCgncGxheW5pdGUuc3VtbWFyeV9yZWNlbnRfbGltaXQnLCB7IG4gfSkgYXMgYW55KSB8fFxyXG4gICAgICBgVXAgdG8gJHtufSBtb3N0LXJlY2VudGx5IHBsYXllZCBnYW1lcyB3aWxsIGJlIGF1dG8tc3luY2VkLmAsXHJcbiAgKTtcclxuICBwYXJ0cy5wdXNoKFxyXG4gICAgZGF5cyA+IDBcclxuICAgICAgPyAodCgncGxheW5pdGUuc3VtbWFyeV9hY3Rpdml0eV93aW5kb3cnLCB7IGRheXMgfSkgYXMgYW55KSB8fFxyXG4gICAgICAgICAgYEFjdGl2aXR5IHdpbmRvdzogbGFzdCAke2RheXN9IGRheXMuYFxyXG4gICAgICA6ICh0KCdwbGF5bml0ZS5zdW1tYXJ5X2FjdGl2aXR5X2lnbm9yZWQnKSBhcyBhbnkpIHx8ICdBY3Rpdml0eSB3aW5kb3cgaXMgaWdub3JlZC4nLFxyXG4gICk7XHJcbiAgcGFydHMucHVzaChcclxuICAgIGtlZXBVbnRpbFJlcGxhY2VkXHJcbiAgICAgID8gKHQoJ3BsYXluaXRlLnN1bW1hcnlfa2VlcF91bnRpbF9yZXBsYWNlZCcpIGFzIGFueSkgfHxcclxuICAgICAgICAgICdHYW1lcyBzdGF5IHVudGlsIGEgbmV3ZXIgZ2FtZSByZXBsYWNlcyB0aGVtLidcclxuICAgICAgOiAodCgncGxheW5pdGUuc3VtbWFyeV9wcnVuZV9pbW1lZGlhdGVseScpIGFzIGFueSkgfHxcclxuICAgICAgICAgICdHYW1lcyBhcmUgcHJ1bmVkIHdoZW4gdGhleSBubyBsb25nZXIgcXVhbGlmeS4nLFxyXG4gICk7XHJcbiAgaWYgKHN5bmNBbGwpIHtcclxuICAgIHBhcnRzLnB1c2goXHJcbiAgICAgICh0KCdwbGF5bml0ZS5zdW1tYXJ5X2FsbF9pbnN0YWxsZWQnKSBhcyBhbnkpIHx8XHJcbiAgICAgICAgJ0FsbCBpbnN0YWxsZWQgUGxheW5pdGUgZ2FtZXMgd2lsbCBiZSBrZXB0IGluIFZpYmVwb2xsby4nLFxyXG4gICAgKTtcclxuICB9IGVsc2UgaWYgKGluY2x1ZGVQbHVnaW5Db3VudCA+IDApIHtcclxuICAgIHBhcnRzLnB1c2goXHJcbiAgICAgICh0KCdwbGF5bml0ZS5zdW1tYXJ5X3BsdWdpbl9pbmNsdWRlJywgeyBjb3VudDogaW5jbHVkZVBsdWdpbkNvdW50IH0pIGFzIGFueSkgfHxcclxuICAgICAgICBgSW5jbHVkZXMgZXZlcnkgZ2FtZSBmcm9tICR7aW5jbHVkZVBsdWdpbkNvdW50fSBzZWxlY3RlZCBsaWJyYXJ5IHBsdWdpbnMuYCxcclxuICAgICk7XHJcbiAgfVxyXG4gIGlmIChwcnVuZURheXMgPiAwKSB7XHJcbiAgICBwYXJ0cy5wdXNoKFxyXG4gICAgICAodCgncGxheW5pdGUuc3VtbWFyeV9kZWxldGVfYWZ0ZXInLCB7IGRheXM6IHBydW5lRGF5cyB9KSBhcyBhbnkpIHx8XHJcbiAgICAgICAgYEFsc28gcmVtb3ZlIGdhbWVzIG5ldmVyIGxhdW5jaGVkIGFmdGVyICR7cHJ1bmVEYXlzfSBkYXlzLmAsXHJcbiAgICApO1xyXG4gIH1cclxuICBwYXJ0cy5wdXNoKFxyXG4gICAgcmVtb3ZlVW5pbnN0YWxsZWRcclxuICAgICAgPyAodCgncGxheW5pdGUuc3VtbWFyeV9yZW1vdmVfdW5pbnN0YWxsZWRfb24nKSBhcyBhbnkpIHx8XHJcbiAgICAgICAgICAnVW5pbnN0YWxsZWQgZ2FtZXMgYXJlIHJlbW92ZWQgYXV0b21hdGljYWxseS4nXHJcbiAgICAgIDogKHQoJ3BsYXluaXRlLnN1bW1hcnlfcmVtb3ZlX3VuaW5zdGFsbGVkX29mZicpIGFzIGFueSkgfHxcclxuICAgICAgICAgICdVbmluc3RhbGxlZCBnYW1lcyByZW1haW4gdW50aWwgcmVtb3ZlZCBtYW51YWxseS4nLFxyXG4gICk7XHJcbiAgY29uc3QgZXhjbHVkZWQgPSAoXHJcbiAgICAoY29uZmlnLnZhbHVlPy5wbGF5bml0ZV9leGNsdWRlX2NhdGVnb3JpZXMgfHwgW10pIGFzIEFycmF5PHtcclxuICAgICAgaWQ6IHN0cmluZztcclxuICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgfT5cclxuICApXHJcbiAgICAubWFwKChvKSA9PiAobz8ubmFtZSB8fCBvPy5pZCB8fCAnJykudG9TdHJpbmcoKS50cmltKCkpXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIGlmIChleGNsdWRlZC5sZW5ndGgpIHtcclxuICAgIGNvbnN0IHNob3duID0gZXhjbHVkZWQuc2xpY2UoMCwgMyk7XHJcbiAgICBjb25zdCBzYW1wbGUgPSBzaG93bi5qb2luKCcsICcpO1xyXG4gICAgY29uc3QgbW9yZSA9IGV4Y2x1ZGVkLmxlbmd0aCA+IHNob3duLmxlbmd0aCA/IGV4Y2x1ZGVkLmxlbmd0aCAtIHNob3duLmxlbmd0aCA6IDA7XHJcbiAgICBpZiAobW9yZSA+IDApIHtcclxuICAgICAgcGFydHMucHVzaChcclxuICAgICAgICAodCgncGxheW5pdGUuc3VtbWFyeV9leGNsdWRlZF9jYXRlZ29yaWVzX21vcmUnLCB7XHJcbiAgICAgICAgICBjYXRlZ29yaWVzOiBzYW1wbGUsXHJcbiAgICAgICAgICBjb3VudDogbW9yZSxcclxuICAgICAgICB9KSBhcyBhbnkpIHx8IGBFeGNsdWRlZCBjYXRlZ29yaWVzOiAke3NhbXBsZX0gKCske21vcmV9IG1vcmUpLmAsXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYXJ0cy5wdXNoKFxyXG4gICAgICAgICh0KCdwbGF5bml0ZS5zdW1tYXJ5X2V4Y2x1ZGVkX2NhdGVnb3JpZXMnLCB7IGNhdGVnb3JpZXM6IHNhbXBsZSB9KSBhcyBhbnkpIHx8XHJcbiAgICAgICAgICBgRXhjbHVkZWQgY2F0ZWdvcmllczogJHtzYW1wbGV9LmAsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJyk7XHJcbn0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbGF1bmNoUGxheW5pdGUoKSB7XHJcbiAgaWYgKHBsYXRmb3JtLnZhbHVlICE9PSAnd2luZG93cycgfHwgIWNhbkxhdW5jaC52YWx1ZSkgcmV0dXJuO1xyXG4gIGxhdW5jaGluZy52YWx1ZSA9IHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGh0dHAucG9zdCgnL2FwaS9wbGF5bml0ZS9sYXVuY2gnLCB7fSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHJlZnJlc2hTdGF0dXMoKSwgMTAwMCk7XHJcbiAgfSBjYXRjaCAoXykge31cclxuICBsYXVuY2hpbmcudmFsdWUgPSBmYWxzZTtcclxufVxyXG5cclxuLy8gLS0tIEV4Y2x1c2lvbnMgdXBkYXRlIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gaGFuZGxlVHJhbnNmZXJVcGRhdGUobmV4dDogc3RyaW5nW10pIHtcclxuICBjb25zdCBwcmV2ID0gbmV3IFNldChleGNsdWRlZElkcy52YWx1ZSk7XHJcbiAgY29uc3QgbmV4dFNldCA9IG5ldyBTZXQobmV4dCk7XHJcbiAgY29uc3QgYWRkZWQ6IHN0cmluZ1tdID0gW107XHJcbiAgY29uc3QgcmVtb3ZlZDogc3RyaW5nW10gPSBbXTtcclxuICBmb3IgKGNvbnN0IHYgb2YgbmV4dFNldCkgaWYgKCFwcmV2Lmhhcyh2KSkgYWRkZWQucHVzaCh2KTtcclxuICBmb3IgKGNvbnN0IHYgb2YgcHJldikgaWYgKCFuZXh0U2V0Lmhhcyh2KSkgcmVtb3ZlZC5wdXNoKHYpO1xyXG5cclxuICBjb25zdCBmaW5hbCA9IEFycmF5LmZyb20obmV4dFNldCk7XHJcbiAgZXhjbHVkZWRJZHMudmFsdWUgPSBmaW5hbDtcclxuICB0cmFuc2ZlclZhbHVlLnZhbHVlID0gZmluYWw7XHJcbiAgLy8gTm8gdG9hc3QgZm9yIGFkZGl0aW9ucyBwZXIgZGVzaWduXHJcbiAgLy8gTm8gdG9hc3QgZm9yIHJlbW92YWxzIHBlciBkZXNpZ25cclxufVxyXG5cclxuLy8gLS0tIFJlc2V0IHRvIGRlZmF1bHRzIChwZXIgc2VjdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIHJlc2V0QXV0b1N5bmNTZWN0aW9uKCkge1xyXG4gIGNvbnN0IGQgPSBzdG9yZS5kZWZhdWx0cyBhcyBhbnk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9hdXRvX3N5bmMnLCBkLnBsYXluaXRlX2F1dG9fc3luYyk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9zeW5jX2FsbF9pbnN0YWxsZWQnLCBkLnBsYXluaXRlX3N5bmNfYWxsX2luc3RhbGxlZCk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9yZWNlbnRfZ2FtZXMnLCBkLnBsYXluaXRlX3JlY2VudF9nYW1lcyk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9yZWNlbnRfbWF4X2FnZV9kYXlzJywgZC5wbGF5bml0ZV9yZWNlbnRfbWF4X2FnZV9kYXlzKTtcclxuICBzdG9yZS51cGRhdGVPcHRpb24oJ3BsYXluaXRlX2F1dG9zeW5jX2RlbGV0ZV9hZnRlcl9kYXlzJywgZC5wbGF5bml0ZV9hdXRvc3luY19kZWxldGVfYWZ0ZXJfZGF5cyk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKFxyXG4gICAgJ3BsYXluaXRlX2F1dG9zeW5jX3JlcXVpcmVfcmVwbGFjZW1lbnQnLFxyXG4gICAgZC5wbGF5bml0ZV9hdXRvc3luY19yZXF1aXJlX3JlcGxhY2VtZW50LFxyXG4gICk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKFxyXG4gICAgJ3BsYXluaXRlX2F1dG9zeW5jX3JlbW92ZV91bmluc3RhbGxlZCcsXHJcbiAgICBkLnBsYXluaXRlX2F1dG9zeW5jX3JlbW92ZV91bmluc3RhbGxlZCxcclxuICApO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbigncGxheW5pdGVfc3luY19jYXRlZ29yaWVzJywgZC5wbGF5bml0ZV9zeW5jX2NhdGVnb3JpZXMpO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbigncGxheW5pdGVfc3luY19wbHVnaW5zJywgZC5wbGF5bml0ZV9zeW5jX3BsdWdpbnMpO1xyXG4gIG5vdGlmeSgnc3VjY2VzcycsICh0KCdwbGF5bml0ZS5yZXNldF9kb25lJykgYXMgYW55KSB8fCAnU2VjdGlvbiByZXNldCB0byBkZWZhdWx0cy4nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRMYXVuY2hTZWN0aW9uKCkge1xyXG4gIGNvbnN0IGQgPSBzdG9yZS5kZWZhdWx0cyBhcyBhbnk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9mb2N1c19hdHRlbXB0cycsIGQucGxheW5pdGVfZm9jdXNfYXR0ZW1wdHMpO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbigncGxheW5pdGVfZm9jdXNfdGltZW91dF9zZWNzJywgZC5wbGF5bml0ZV9mb2N1c190aW1lb3V0X3NlY3MpO1xyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbigncGxheW5pdGVfZm9jdXNfZXhpdF9vbl9maXJzdCcsIGQucGxheW5pdGVfZm9jdXNfZXhpdF9vbl9maXJzdCk7XHJcbiAgbm90aWZ5KCdzdWNjZXNzJywgKHQoJ3BsYXluaXRlLnJlc2V0X2RvbmUnKSBhcyBhbnkpIHx8ICdTZWN0aW9uIHJlc2V0IHRvIGRlZmF1bHRzLicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEZpbHRlcnNTZWN0aW9uKCkge1xyXG4gIGNvbnN0IGQgPSBzdG9yZS5kZWZhdWx0cyBhcyBhbnk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX2NhdGVnb3JpZXMnLCBkLnBsYXluaXRlX2V4Y2x1ZGVfY2F0ZWdvcmllcyk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX3BsdWdpbnMnLCBkLnBsYXluaXRlX2V4Y2x1ZGVfcGx1Z2lucyk7XHJcbiAgc3RvcmUudXBkYXRlT3B0aW9uKCdwbGF5bml0ZV9leGNsdWRlX2dhbWVzJywgZC5wbGF5bml0ZV9leGNsdWRlX2dhbWVzKTtcclxuICBub3RpZnkoJ3N1Y2Nlc3MnLCAodCgncGxheW5pdGUucmVzZXRfZG9uZScpIGFzIGFueSkgfHwgJ1NlY3Rpb24gcmVzZXQgdG8gZGVmYXVsdHMuJyk7XHJcbn1cclxuXHJcbi8vIERhdGEgdGFibGUgY29sdW1ucyBhbmQgYWN0aW9uc1xyXG50eXBlIEV4Y2x1ZGVkUm93ID0geyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfTtcclxuY29uc3QgZXhjbHVzaW9uc0NvbHVtbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyB0aXRsZTogKHQoJ3BsYXluaXRlLnRhYmxlX2dhbWUnKSBhcyBhbnkpIHx8ICdHYW1lJywga2V5OiAnbmFtZScgfSxcclxuICB7XHJcbiAgICB0aXRsZTogKHQoJ3BsYXluaXRlLnRhYmxlX2FjdGlvbnMnKSBhcyBhbnkpIHx8ICdBY3Rpb25zJyxcclxuICAgIGtleTogJ2FjdGlvbnMnLFxyXG4gICAgd2lkdGg6IDEyMCxcclxuICAgIHJlbmRlcjogKHJvdzogRXhjbHVkZWRSb3cpID0+XHJcbiAgICAgIGgoJ2RpdicsIHsgY2xhc3M6ICdmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBqdXN0aWZ5LWVuZCcgfSwgW1xyXG4gICAgICAgIGgoXHJcbiAgICAgICAgICBOQnV0dG9uIGFzIGFueSxcclxuICAgICAgICAgIHsgdHlwZTogJ2Vycm9yJywgc2l6ZTogJ3RpbnknLCBzdHJvbmc6IHRydWUsIG9uQ2xpY2s6ICgpID0+IHJlbW92ZUV4Y2x1c2lvbihyb3cuaWQpIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICgpID0+IFtcclxuICAgICAgICAgICAgICBoKEx1Y2lkZUljb24sIHsgbmFtZTogJ2ZhLXRyYXNoJywgc2l6ZTogMTQgfSksXHJcbiAgICAgICAgICAgICAgaCgnc3BhbicsIHsgY2xhc3M6ICdtbC0xJyB9LCAodCgnX2NvbW1vbi5yZW1vdmUnKSBhcyBhbnkpIHx8ICdSZW1vdmUnKSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgKSxcclxuICAgICAgXSksXHJcbiAgfSxcclxuXSk7XHJcblxyXG5mdW5jdGlvbiByZW1vdmVFeGNsdXNpb24oaWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IG5leHQgPSB0cmFuc2ZlclZhbHVlLnZhbHVlLmZpbHRlcigoeCkgPT4geCAhPT0gaWQpO1xyXG4gIGhhbmRsZVRyYW5zZmVyVXBkYXRlKG5leHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhckFsbEV4Y2x1c2lvbnMoKSB7XHJcbiAgaGFuZGxlVHJhbnNmZXJVcGRhdGUoW10pO1xyXG59XHJcblxyXG4vLyBBZGQgbW9kYWwgc3RhdGUgYW5kIGFjdGlvbnNcclxuY29uc3Qgc2hvd0FkZE1vZGFsID0gcmVmKGZhbHNlKTtcclxuY29uc3QgYWRkU2VsZWN0aW9uID0gcmVmPHN0cmluZ1tdPihbXSk7XHJcbmNvbnN0IGFkZE9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgZXhjbHVkZWQgPSBuZXcgU2V0KGV4Y2x1ZGVkSWRzLnZhbHVlKTtcclxuICByZXR1cm4gZ2FtZXNMaXN0LnZhbHVlXHJcbiAgICAuZmlsdGVyKChnKSA9PiAhZXhjbHVkZWQuaGFzKGcuaWQpKVxyXG4gICAgLm1hcCgoZykgPT4gKHtcclxuICAgICAgbGFiZWw6IGcubmFtZSB8fCAodCgncGxheW5pdGUudW5rbm93bl9nYW1lJykgYXMgYW55KSB8fCAnVW5rbm93bicsXHJcbiAgICAgIHZhbHVlOiBnLmlkLFxyXG4gICAgfSkpXHJcbiAgICAuc29ydCgoYSwgYikgPT4gYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBvcGVuQWRkRXhjbHVzaW9ucygpIHtcclxuICBhZGRTZWxlY3Rpb24udmFsdWUgPSBbXTtcclxuICBzaG93QWRkTW9kYWwudmFsdWUgPSB0cnVlO1xyXG4gIGxvYWRHYW1lcygpO1xyXG59XHJcbmZ1bmN0aW9uIGNvbmZpcm1BZGRFeGNsdXNpb25zKCkge1xyXG4gIGNvbnN0IG1lcmdlZCA9IEFycmF5LmZyb20obmV3IFNldChbLi4udHJhbnNmZXJWYWx1ZS52YWx1ZSwgLi4uYWRkU2VsZWN0aW9uLnZhbHVlXSkpO1xyXG4gIGhhbmRsZVRyYW5zZmVyVXBkYXRlKG1lcmdlZCk7XHJcbiAgc2hvd0FkZE1vZGFsLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG4vKiBObyBnbG9iYWwgaGVpZ2h0cyBmb3IgdHJhbnNmZXIgbGlzdHM7IG9ubHkgYWRqdXN0IG9uIG1vYmlsZSBiZWxvdyAqL1xyXG4vKiBDb21wYWN0IG5lc3RlZCBjYXJkcyBhbmQgcmVzcG9uc2l2ZSBhY3Rpb25zIG9uIHNtYWxsIHNjcmVlbnMgKi9cclxuQG1lZGlhIChtYXgtd2lkdGg6IDY0MHB4KSB7XHJcbiAgLnBsYXluaXRlLXRhYiAucGxheW5pdGUtY2FyZCB7XHJcbiAgICBwYWRkaW5nOiAwLjc1cmVtICFpbXBvcnRhbnQ7IC8qIHJlZHVjZSBwLTQgKi9cclxuICB9XHJcbiAgLnBsYXluaXRlLXRhYiAuc2VjdGlvbi1jYXJkIC5zZWN0aW9uLWhlYWRlciB7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDAuNzVyZW0gIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmctcmlnaHQ6IDAuNzVyZW0gIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmctdG9wOiAwLjVyZW0gIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmctYm90dG9tOiAwLjI1cmVtICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG4gIC5wbGF5bml0ZS10YWIgLnNlY3Rpb24tY2FyZCAuc2VjdGlvbi1ib2R5IHtcclxuICAgIHBhZGRpbmctbGVmdDogMC43NXJlbSAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZy1yaWdodDogMC43NXJlbSAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZy1ib3R0b206IDAuNzVyZW0gIWltcG9ydGFudDtcclxuICB9XHJcbiAgLyogU3RhY2sgaW5mbyByb3dzIHRvIGF2b2lkIGNyYW1waW5nICovXHJcbiAgLnBsYXluaXRlLXRhYiAuaW5saW5lLWluZm8ge1xyXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xyXG4gICAgZ2FwOiAwLjI1cmVtO1xyXG4gIH1cclxuICAucGxheW5pdGUtdGFiIC5pbmxpbmUtaW5mbyBjb2RlIHtcclxuICAgIG1heC13aWR0aDogMTAwJTtcclxuICB9XHJcbiAgLyogUGx1Z2luIGFjdGlvbnM6IHN0YWNrIGFuZCBsZXQgdGV4dCB3cmFwIHRvIHByZXZlbnQgb3ZlcmZsb3cgKi9cclxuICAucGxheW5pdGUtdGFiIC5wbGF5bml0ZS1hY3Rpb25zIHtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcclxuICB9XHJcbiAgLnBsYXluaXRlLXRhYiAucGxheW5pdGUtYWN0aW9ucyA6ZGVlcCgubi1idXR0b24pIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gIH1cclxuICAucGxheW5pdGUtdGFiIC5wbGF5bml0ZS1hY3Rpb25zIDpkZWVwKC5uLWJ1dHRvbiAubi1idXR0b25fX2NvbnRlbnQpIHtcclxuICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7IC8qIGFsbG93IHdyYXBwaW5nICovXHJcbiAgICBsaW5lLWhlaWdodDogMS4yO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgLyogTm8gc3BlY2lhbCBtb2JpbGUgc3R5bGVzIG5lZWRlZCBmb3IgZXhjbHVzaW9ucyB0YWJsZSAqL1xyXG59XHJcbjwvc3R5bGU+XHJcbiIsImltcG9ydCB7IGluamVjdCwgUmVmIH0gZnJvbSAndnVlJztcclxuXHJcbmNsYXNzIFBsYXRmb3JtTWVzc2FnZUkxOG4ge1xyXG4gIHBsYXRmb3JtOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXRmb3JtOiBzdHJpbmcpIHtcclxuICAgIHRoaXMucGxhdGZvcm0gPSBwbGF0Zm9ybTtcclxuICB9XHJcblxyXG4gIGdldFBsYXRmb3JtS2V5KGtleTogc3RyaW5nLCBwbGF0Zm9ybTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBrZXkgKyAnXycgKyBwbGF0Zm9ybTtcclxuICB9XHJcblxyXG4gIGdldE1lc3NhZ2VVc2luZ1BsYXRmb3JtKGtleTogc3RyaW5nLCBkZWZhdWx0TXNnPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHJlYWxLZXkgPSB0aGlzLmdldFBsYXRmb3JtS2V5KGtleSwgdGhpcy5wbGF0Zm9ybSk7XHJcbiAgICBjb25zdCBpMThuID0gaW5qZWN0PHsgdDogKGs6IHN0cmluZykgPT4gc3RyaW5nIH0gfCB1bmRlZmluZWQ+KCdpMThuJyk7XHJcbiAgICBpZiAoIWkxOG4gfHwgdHlwZW9mIGkxOG4udCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGRlZmF1bHRNc2cgPz8gcmVhbEtleTtcclxuICAgIGxldCBtZXNzYWdlID0gaTE4bi50KHJlYWxLZXkpO1xyXG5cclxuICAgIGlmIChtZXNzYWdlICE9PSByZWFsS2V5KSB7XHJcbiAgICAgIC8vIFdlIGdvdCBhIG1lc3NhZ2UgYmFjaywgcmV0dXJuIGVhcmx5XHJcbiAgICAgIHJldHVybiBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIG9uIFdpbmRvd3MsIHdlIGRvbid0IGZhbGxiYWNrIHRvIHVuaXgsIHNvIHJldHVybiBlYXJseVxyXG4gICAgaWYgKHRoaXMucGxhdGZvcm0gPT09ICd3aW5kb3dzJykge1xyXG4gICAgICByZXR1cm4gZGVmYXVsdE1zZyA/IGRlZmF1bHRNc2cgOiBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZXJlJ3Mgbm8gbWVzc2FnZSBmb3Iga2V5LCBjaGVjayBmb3IgdW5peCB2ZXJzaW9uXHJcbiAgICBjb25zdCB1bml4S2V5ID0gdGhpcy5nZXRQbGF0Zm9ybUtleShrZXksICd1bml4Jyk7XHJcbiAgICBtZXNzYWdlID0gaTE4bi50KHVuaXhLZXkpO1xyXG5cclxuICAgIGlmIChtZXNzYWdlID09PSB1bml4S2V5ICYmIGRlZmF1bHRNc2cpIHtcclxuICAgICAgLy8gdGhlcmUncyBubyBtZXNzYWdlIGZvciB1bml4IGtleSwgcmV0dXJuIGRlZmF1bHRNc2dcclxuICAgICAgcmV0dXJuIGRlZmF1bHRNc2c7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWVzc2FnZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VQbGF0Zm9ybUkxOG4ocGxhdGZvcm0/OiBzdHJpbmcpOiBQbGF0Zm9ybU1lc3NhZ2VJMThuIHtcclxuICAvLyBSZXNvbHZlIHBsYXRmb3JtIGZyb20gaW5qZWN0ZWQgcmVmIGlmIG5vdCBleHBsaWNpdGx5IHBhc3NlZC5cclxuICBpZiAoIXBsYXRmb3JtKSB7XHJcbiAgICBjb25zdCBpbmplY3RlZCA9IGluamVjdCgncGxhdGZvcm0nLCBudWxsKSBhcyBzdHJpbmcgfCBSZWY8c3RyaW5nPiB8IG51bGw7XHJcbiAgICBpZiAoaW5qZWN0ZWQpIHtcclxuICAgICAgLy8gU3VwcG9ydCBlaXRoZXIgYSByZWYgb3IgcGxhaW4gdmFsdWVcclxuICAgICAgcGxhdGZvcm0gPSB0eXBlb2YgaW5qZWN0ZWQgPT09ICdvYmplY3QnICYmICd2YWx1ZScgaW4gaW5qZWN0ZWQgPyBpbmplY3RlZC52YWx1ZSA6IGluamVjdGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRmFsbGJhY2sgZGVmZW5zaXZlbHkgaW5zdGVhZCBvZiB0aHJvd2luZyB0byBhdm9pZCBoYXJkIHJlbmRlciBlcnJvcnNcclxuICBpZiAoIXBsYXRmb3JtKSB7XHJcbiAgICAvLyBEZWZhdWx0IHRvIFwid2luZG93c1wiIChwbGF0Zm9ybSB3aXRoIG5vIHVuaXggZmFsbGJhY2spIHRvIGtlZXAgYmVoYXZpb3IgcHJlZGljdGFibGUuXHJcbiAgICBwbGF0Zm9ybSA9ICd3aW5kb3dzJztcclxuICB9XHJcblxyXG4gIHJldHVybiBpbmplY3QoJ3BsYXRmb3JtTWVzc2FnZScsICgpID0+IG5ldyBQbGF0Zm9ybU1lc3NhZ2VJMThuKHBsYXRmb3JtKSwgdHJ1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkdHAoa2V5OiBzdHJpbmcsIGRlZmF1bHRNc2c/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwbSA9IHVzZVBsYXRmb3JtSTE4bigpO1xyXG4gICAgLy8gR3VhcmQgaTE4biBpbmplY3Rpb24gYWJzZW5jZSAoZWFybHkgcmVuZGVyIGJlZm9yZSBpbml0KSBpbnNpZGUgbWVzc2FnZSBnZXR0ZXJcclxuICAgIHJldHVybiBwbS5nZXRNZXNzYWdlVXNpbmdQbGF0Zm9ybShrZXksIGRlZmF1bHRNc2cpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBkZWZhdWx0TXNnIHx8IGtleTtcclxuICB9XHJcbn1cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG4vLyBSZWFkIHBsYXRmb3JtIGZyb20gY2VudHJhbGl6ZWQgY29uZmlnIHN0b3JlIG1ldGFkYXRhXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgcGxhdGZvcm0gPSBjb21wdXRlZCgoKSA9PiAoc3RvcmUubWV0YWRhdGEgJiYgc3RvcmUubWV0YWRhdGEucGxhdGZvcm0pIHx8ICcnKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPHRlbXBsYXRlIHYtaWY9XCIkc2xvdHNbJ3dpbmRvd3MnXSAmJiBwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCI+XHJcbiAgICA8c2xvdCBuYW1lPVwid2luZG93c1wiIC8+XHJcbiAgPC90ZW1wbGF0ZT5cclxuXHJcbiAgPHRlbXBsYXRlIHYtaWY9XCIkc2xvdHNbJ2xpbnV4J10gJiYgcGxhdGZvcm0gPT09ICdsaW51eCdcIj5cclxuICAgIDxzbG90IG5hbWU9XCJsaW51eFwiIC8+XHJcbiAgPC90ZW1wbGF0ZT5cclxuXHJcbiAgPHRlbXBsYXRlIHYtaWY9XCIkc2xvdHNbJ21hY29zJ10gJiYgcGxhdGZvcm0gPT09ICdtYWNvcydcIj5cclxuICAgIDxzbG90IG5hbWU9XCJtYWNvc1wiIC8+XHJcbiAgPC90ZW1wbGF0ZT5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+PC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgJHRwIH0gZnJvbSAnQC9wbGF0Zm9ybS1pMThuJztcclxuaW1wb3J0IFBsYXRmb3JtTGF5b3V0IGZyb20gJ0AvUGxhdGZvcm1MYXlvdXQudnVlJztcclxuaW1wb3J0IHsgTklucHV0IH0gZnJvbSAnbmFpdmUtdWknO1xyXG5cclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQgeyBjb21wdXRlZCB9IGZyb20gJ3Z1ZSc7XHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG5jb25zdCBwbGF0Zm9ybSA9IGNvbXB1dGVkKCgpID0+IGNvbmZpZy5wbGF0Zm9ybSB8fCAnJyk7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxkaXYgdi1pZj1cInBsYXRmb3JtICE9PSAnbWFjb3MnXCIgY2xhc3M9XCJtYi00XCI+XHJcbiAgICA8bGFiZWwgZm9yPVwiYWRhcHRlcl9uYW1lXCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3sgJHQoJ2NvbmZpZy5hZGFwdGVyX25hbWUnKSB9fTwvbGFiZWw+XHJcbiAgICA8bi1pbnB1dFxyXG4gICAgICBpZD1cImFkYXB0ZXJfbmFtZVwiXHJcbiAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb25maWcuYWRhcHRlcl9uYW1lXCJcclxuICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICA6cGxhY2Vob2xkZXI9XCIkdHAoJ2NvbmZpZy5hZGFwdGVyX25hbWVfcGxhY2Vob2xkZXInLCAnL2Rldi9kcmkvcmVuZGVyRDEyOCcpXCJcclxuICAgIC8+XHJcbiAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgIDxQbGF0Zm9ybUxheW91dD5cclxuICAgICAgICA8dGVtcGxhdGUgI3dpbmRvd3M+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLmFkYXB0ZXJfbmFtZV9kZXNjX3dpbmRvd3MnKSB9fTxiciAvPlxyXG4gICAgICAgICAgPHByZT50b29sc1xcZHhnaS1pbmZvLmV4ZTwvcHJlPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPHRlbXBsYXRlICNmcmVlYnNkPlxyXG4gICAgICAgICAge3sgJHQoJ2NvbmZpZy5hZGFwdGVyX25hbWVfZGVzY19saW51eF8xJykgfX08YnIgLz5cclxuICAgICAgICAgIDxwcmU+bHMgL2Rldi9kcmkvcmVuZGVyRCogICMge3sgJHQoJ2NvbmZpZy5hZGFwdGVyX25hbWVfZGVzY19saW51eF8yJykgfX08L3ByZT5cclxuICAgICAgICAgIDxwcmU+XHJcbiAgICAgICAgICAgICAgdmFpbmZvIC0tZGlzcGxheSBkcm0gLS1kZXZpY2UgL2Rldi9kcmkvcmVuZGVyRDEyOSB8IFxcXHJcbiAgICAgICAgICAgICAgICBncmVwIC1FIFwiKChWQVByb2ZpbGVIMjY0SGlnaHxWQVByb2ZpbGVIRVZDTWFpbnxWQVByb2ZpbGVIRVZDTWFpbjEwKS4qVkFFbnRyeXBvaW50RW5jU2xpY2UpfERyaXZlciB2ZXJzaW9uXCJcclxuICAgICAgICAgICAgPC9wcmVcclxuICAgICAgICAgID5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcuYWRhcHRlcl9uYW1lX2Rlc2NfbGludXhfMycpIH19PGJyIC8+XHJcbiAgICAgICAgICA8aT5WQVByb2ZpbGVIMjY0SGlnaCA6IFZBRW50cnlwb2ludEVuY1NsaWNlPC9pPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPHRlbXBsYXRlICNsaW51eD5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcuYWRhcHRlcl9uYW1lX2Rlc2NfbGludXhfMScpIH19PGJyIC8+XHJcbiAgICAgICAgICA8cHJlPmxzIC9kZXYvZHJpL3JlbmRlckQqICAjIHt7ICR0KCdjb25maWcuYWRhcHRlcl9uYW1lX2Rlc2NfbGludXhfMicpIH19PC9wcmU+XHJcbiAgICAgICAgICA8cHJlPlxyXG4gICAgICAgICAgICAgIHZhaW5mbyAtLWRpc3BsYXkgZHJtIC0tZGV2aWNlIC9kZXYvZHJpL3JlbmRlckQxMjkgfCBcXFxyXG4gICAgICAgICAgICAgICAgZ3JlcCAtRSBcIigoVkFQcm9maWxlSDI2NEhpZ2h8VkFQcm9maWxlSEVWQ01haW58VkFQcm9maWxlSEVWQ01haW4xMCkuKlZBRW50cnlwb2ludEVuY1NsaWNlKXxEcml2ZXIgdmVyc2lvblwiXHJcbiAgICAgICAgICAgIDwvcHJlXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICB7eyAkdCgnY29uZmlnLmFkYXB0ZXJfbmFtZV9kZXNjX2xpbnV4XzMnKSB9fTxiciAvPlxyXG4gICAgICAgICAgPGk+VkFQcm9maWxlSDI2NEhpZ2ggOiBWQUVudHJ5cG9pbnRFbmNTbGljZTwvaT5cclxuICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8L1BsYXRmb3JtTGF5b3V0PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCBvbk1vdW50ZWQsIG9uQmVmb3JlVW5tb3VudCwgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7ICR0cCB9IGZyb20gJ0AvcGxhdGZvcm0taTE4bic7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCBQbGF0Zm9ybUxheW91dCBmcm9tICdAL1BsYXRmb3JtTGF5b3V0LnZ1ZSc7XHJcbmltcG9ydCB7IE5JbnB1dCwgTlNlbGVjdCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgdXNlQ29uZmlnU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9jb25maWcnO1xyXG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcclxuXHJcbnR5cGUgRGlzcGxheURldmljZSA9IHtcclxuICBkZXZpY2VfaWQ/OiBzdHJpbmc7XHJcbiAgZGlzcGxheV9uYW1lPzogc3RyaW5nOyAvLyBlLmcuIFxcXFwgXFxcXC5cXFxcRElTUExBWTFcclxuICBmcmllbmRseV9uYW1lPzogc3RyaW5nOyAvLyBlLmcuIFJPRyBQRzI3OVFcclxuICAvLyBQcmVzZW50IHdoZW4gZGV2aWNlIGlzIGN1cnJlbnRseSBhY3RpdmU7IHNoYXBlIG1pcnJvcnMgbGliZGlzcGxheWRldmljZSB0eXBlcyBidXQgd2Ugb25seSBjaGVjayBwcmVzZW5jZVxyXG4gIGluZm8/OiB1bmtub3duO1xyXG59O1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCBjb25maWcgPSBzdG9yZS5jb25maWc7XHJcbi8vIFJlYWQgcGxhdGZvcm0gZGlyZWN0bHkgZnJvbSBzdG9yZSBtZXRhZGF0YSB0byBhdm9pZCB0aW1pbmcvcmFjZSBvbiB3cmFwcGVyXHJcbmNvbnN0IHBsYXRmb3JtID0gY29tcHV0ZWQoKCkgPT4gKHN0b3JlLm1ldGFkYXRhICYmIHN0b3JlLm1ldGFkYXRhLnBsYXRmb3JtKSB8fCAnJyk7XHJcblxyXG5jb25zdCBkZXZpY2VzID0gcmVmPERpc3BsYXlEZXZpY2VbXT4oW10pO1xyXG5jb25zdCBsb2FkaW5nID0gcmVmKGZhbHNlKTtcclxuY29uc3QgbG9hZEVycm9yID0gcmVmKCcnKTtcclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcblxyXG5mdW5jdGlvbiB0Rmlyc3Qoa2V5czogc3RyaW5nW10sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XHJcbiAgICBjb25zdCBtID0gdChrKSBhcyB1bmtub3duIGFzIHN0cmluZztcclxuICAgIGlmIChtICYmIG0gIT09IGspIHJldHVybiBtO1xyXG4gIH1cclxuICByZXR1cm4gZmFsbGJhY2s7XHJcbn1cclxuXHJcbmNvbnN0IG91dHB1dE5hbWVMYWJlbCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgdEZpcnN0KFsnY29uZmlnLm91dHB1dF9uYW1lJywgJ29mZmxpbmUub3V0cHV0X25hbWUnXSwgJ0Rpc3BsYXkgSWQnKSxcclxuKTtcclxuY29uc3Qgb3V0cHV0TmFtZURlZmF1bHRMYWJlbCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgdEZpcnN0KFxyXG4gICAgWydvZmZsaW5lLm91dHB1dF9uYW1lX2RlZmF1bHQnLCAnY29uZmlnLm91dHB1dF9uYW1lX2RlZmF1bHQnXSxcclxuICAgICdQcmltYXJ5IGRpc3BsYXkgKGRlZmF1bHQpJyxcclxuICApLFxyXG4pO1xyXG5jb25zdCBvdXRwdXROYW1lRGVzYyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgJHRwKCdjb25maWcub3V0cHV0X25hbWVfZGVzYycsICR0cCgnb2ZmbGluZS5vdXRwdXRfbmFtZV9kZXNjJywgJycpKSxcclxuKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWREaXNwbGF5RGV2aWNlcygpIHtcclxuICBsb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICBsb2FkRXJyb3IudmFsdWUgPSAnJztcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgaHR0cC5nZXQ8RGlzcGxheURldmljZVtdPignL2FwaS9kaXNwbGF5LWRldmljZXMnLCB7XHJcbiAgICAgIHBhcmFtczogeyBkZXRhaWw6ICdmdWxsJyB9LFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBhcnIgPSBBcnJheS5pc0FycmF5KHJlcy5kYXRhKSA/IHJlcy5kYXRhIDogW107XHJcbiAgICBkZXZpY2VzLnZhbHVlID0gYXJyO1xyXG4gIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgLy8gTm9uLWZhdGFsOiBrZWVwIG1hbnVhbCBlbnRyeSBhdmFpbGFibGUgYXMgZmFsbGJhY2tcclxuICAgIGxvYWRFcnJvci52YWx1ZSA9IGU/Lm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIGRpc3BsYXkgZGV2aWNlcyc7XHJcbiAgICBkZXZpY2VzLnZhbHVlID0gW107XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGxvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbm9uTW91bnRlZCgoKSA9PiB7XHJcbiAgLy8gUHJvYWN0aXZlbHkgbG9hZCBvbmNlIG9uIG1vdW50OyBiYWNrZW5kIGdyYWNlZnVsbHkgaGFuZGxlcyBub24tV2luZG93c1xyXG4gIGlmICghbG9hZGluZy52YWx1ZSAmJiBkZXZpY2VzLnZhbHVlLmxlbmd0aCA9PT0gMCkgdm9pZCBsb2FkRGlzcGxheURldmljZXMoKTtcclxufSk7XHJcblxyXG4vLyBJZiBwbGF0Zm9ybSBtZXRhZGF0YSBhcnJpdmVzIGFmdGVyIG1vdW50LCBsb2FkIHRoZW5cclxuY29uc3Qgc3RvcFdhdGNoID0gd2F0Y2goXHJcbiAgKCkgPT4gcGxhdGZvcm0udmFsdWUsXHJcbiAgKHApID0+IHtcclxuICAgIGlmIChwID09PSAnd2luZG93cycgJiYgZGV2aWNlcy52YWx1ZS5sZW5ndGggPT09IDAgJiYgIWxvYWRpbmcudmFsdWUpIHtcclxuICAgICAgdm9pZCBsb2FkRGlzcGxheURldmljZXMoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHsgaW1tZWRpYXRlOiBmYWxzZSB9LFxyXG4pO1xyXG5cclxub25CZWZvcmVVbm1vdW50KCgpID0+IHtcclxuICBzdG9wV2F0Y2goKTtcclxufSk7XHJcblxyXG5jb25zdCBvdXRwdXROYW1lUGxhY2Vob2xkZXIgPSBjb21wdXRlZCgoKSA9PlxyXG4gIHBsYXRmb3JtLnZhbHVlID09PSAnd2luZG93cycgPyAne2RlOWJiN2UyLTE4NmUtNTA1Yi05ZTkzLWY0ODc5MzMzMzgxMH0nIDogJzAnLFxyXG4pO1xyXG5cclxuZnVuY3Rpb24gdG9PcHRpb25zKCkge1xuICAvLyBGaXJzdCBvcHRpb24gcmVwcmVzZW50cyBkZWZhdWx0IGJlaGF2aW9yIChwcmltYXJ5IGRpc3BsYXkpXHJcbiAgY29uc3Qgb3B0czogQXJyYXk8e1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZztcclxuICAgIGlkPzogc3RyaW5nO1xyXG4gIH0+ID0gW1xyXG4gICAge1xyXG4gICAgICBsYWJlbDogb3V0cHV0TmFtZURlZmF1bHRMYWJlbC52YWx1ZSxcclxuICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICBkaXNwbGF5TmFtZTogb3V0cHV0TmFtZURlZmF1bHRMYWJlbC52YWx1ZSxcclxuICAgICAgaWQ6ICcnLFxyXG4gICAgfSxcclxuICBdO1xyXG5cclxuICBmb3IgKGNvbnN0IGQgb2YgZGV2aWNlcy52YWx1ZSkge1xyXG4gICAgLy8gUHJlZmVyIGEgaHVtYW4tZnJpZW5kbHkgbmFtZSBmb3IgdGhlIGZpcnN0IGxpbmUsIGZhbGwgYmFjayB0byBkaXNwbGF5X25hbWVcclxuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gZC5mcmllbmRseV9uYW1lIHx8IGQuZGlzcGxheV9uYW1lIHx8ICdEaXNwbGF5JztcclxuICAgIC8vIEZvciB0aGUgSUQgbGluZSBwcmVmZXIgZGV2aWNlX2lkLCBmYWxsIGJhY2sgdG8gdGhlIHJhdyBkaXNwbGF5X25hbWVcclxuICAgIGNvbnN0IGd1aWQgPSBkLmRldmljZV9pZCB8fCAnJztcclxuICAgIGNvbnN0IGRpc3BOYW1lID0gZC5kaXNwbGF5X25hbWUgfHwgJyc7XHJcbiAgICBjb25zdCBpZCA9IGd1aWQgfHwgZGlzcE5hbWU7XHJcbiAgICAvLyBDb21wb3NlIGxhYmVsIHRvIGluY2x1ZGUgaWRlbnRpZnlpbmcgaW5mbyBldmVuIGlmIHNsb3RzIGFyZSBub3QgYXBwbGllZFxyXG4gICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW2Rpc3BsYXlOYW1lXTtcclxuICAgIGlmIChndWlkKSBwYXJ0cy5wdXNoKGd1aWQpO1xyXG4gICAgaWYgKGRpc3BOYW1lKSBwYXJ0cy5wdXNoKGRpc3BOYW1lICsgKGQuaW5mbyA/ICcgKGFjdGl2ZSknIDogJycpKTtcclxuICAgIGNvbnN0IGxhYmVsID0gcGFydHMuam9pbignIOKAlCAnKTtcclxuICAgIC8vIE9ubHkgaW5jbHVkZSBlbnRyaWVzIHRoYXQgY2FuIGJlIHNlbGVjdGVkIGJ5IGNvbmZpZzogcHJlZmVyIGRldmljZV9pZCwgZWxzZSBkaXNwbGF5X25hbWVcclxuICAgIGNvbnN0IHZhbHVlID0gZC5kZXZpY2VfaWQgfHwgZC5kaXNwbGF5X25hbWUgfHwgJyc7XHJcbiAgICBpZiAodmFsdWUpXHJcbiAgICAgIG9wdHMucHVzaCh7XHJcbiAgICAgICAgbGFiZWwsXHJcbiAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgZGlzcGxheU5hbWUsXHJcbiAgICAgICAgaWQ6IGd1aWQgJiYgZGlzcE5hbWUgPyBgJHtndWlkfSDigJQgJHtkaXNwTmFtZX1gIDogZ3VpZCB8fCBkaXNwTmFtZSxcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3B0cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0T3B0aW9uKHNsb3RQcm9wczogdW5rbm93bik6IGFueSB7XG4gIHJldHVybiAoc2xvdFByb3BzIGFzIGFueSk/Lm9wdGlvbiA/PyB7fTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0T3B0aW9uTmFtZShzbG90UHJvcHM6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCBvcHRpb24gPSBzZWxlY3RPcHRpb24oc2xvdFByb3BzKTtcbiAgcmV0dXJuIFN0cmluZyhvcHRpb24uZGlzcGxheU5hbWUgfHwgb3B0aW9uLmxhYmVsIHx8ICcnKTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0T3B0aW9uSWQoc2xvdFByb3BzOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3Qgb3B0aW9uID0gc2VsZWN0T3B0aW9uKHNsb3RQcm9wcyk7XG4gIHJldHVybiBTdHJpbmcob3B0aW9uLmlkIHx8IG9wdGlvbi52YWx1ZSB8fCAnJyk7XG59XG48L3NjcmlwdD5cblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBjbGFzcz1cIm1iLTRcIj5cclxuICAgIDxsYWJlbCBmb3I9XCJvdXRwdXRfbmFtZVwiIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7IG91dHB1dE5hbWVMYWJlbCB9fTwvbGFiZWw+XHJcblxyXG4gICAgPCEtLSBXaW5kb3dzOiBkcm9wZG93biBvZiBhdmFpbGFibGUgZGlzcGxheXMgZnJvbSBBUEkgLS0+XHJcbiAgICA8UGxhdGZvcm1MYXlvdXQ+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjd2luZG93cz5cclxuICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgIGlkPVwib3V0cHV0X25hbWVcIlxyXG4gICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5vdXRwdXRfbmFtZVwiXHJcbiAgICAgICAgICA6b3B0aW9ucz1cInRvT3B0aW9ucygpXCJcclxuICAgICAgICAgIDpsb2FkaW5nPVwibG9hZGluZ1wiXHJcbiAgICAgICAgICBAZm9jdXM9XCJcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmICghbG9hZGluZyAmJiBkZXZpY2VzLmxlbmd0aCA9PT0gMCkgdm9pZCBsb2FkRGlzcGxheURldmljZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXCJcclxuICAgICAgICAgIGNsZWFyYWJsZVxyXG4gICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwib3V0cHV0TmFtZUxhYmVsXCJcclxuICAgICAgICAvPlxuICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgPHRlbXBsYXRlICNmcmVlYnNkPlxyXG4gICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICBpZD1cIm91dHB1dF9uYW1lXCJcclxuICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb25maWcub3V0cHV0X25hbWVcIlxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwib3V0cHV0TmFtZVBsYWNlaG9sZGVyXCJcclxuICAgICAgICAvPlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8dGVtcGxhdGUgI2xpbnV4PlxyXG4gICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICBpZD1cIm91dHB1dF9uYW1lXCJcclxuICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb25maWcub3V0cHV0X25hbWVcIlxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwib3V0cHV0TmFtZVBsYWNlaG9sZGVyXCJcclxuICAgICAgICAvPlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8dGVtcGxhdGUgI21hY29zPlxyXG4gICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICBpZD1cIm91dHB1dF9uYW1lXCJcclxuICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb25maWcub3V0cHV0X25hbWVcIlxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwib3V0cHV0TmFtZVBsYWNlaG9sZGVyXCJcclxuICAgICAgICAvPlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgPC9QbGF0Zm9ybUxheW91dD5cclxuICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5cclxuICAgICAge3sgb3V0cHV0TmFtZURlc2MgfX08YnIgLz5cclxuICAgICAgPHRlbXBsYXRlIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnICYmIGxvYWRFcnJvclwiPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1yZWQtNTAwXCI+e3sgbG9hZEVycm9yIH19PC9zcGFuXHJcbiAgICAgICAgPjxiciAvPlxyXG4gICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8UGxhdGZvcm1MYXlvdXQ+XHJcbiAgICAgICAgPHRlbXBsYXRlICN3aW5kb3dzPlxyXG4gICAgICAgICAgPHByZSBzdHlsZT1cIndoaXRlLXNwYWNlOiBwcmUtbGluZVwiPlxyXG4gICAgICAgICAgICA8Yj4mbmJzcDsmbmJzcDt7PC9iPlxyXG4gICAgICAgICAgICA8Yj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcImRldmljZV9pZFwiOiBcIntkZTliYjdlMi0xODZlLTUwNWItOWU5My1mNDg3OTMzMzM4MTB9XCI8L2I+XHJcbiAgICAgICAgICAgIDxiPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiZGlzcGxheV9uYW1lXCI6IFwiXFxcXFxcXFwuXFxcXERJU1BMQVkxXCI8L2I+XHJcbiAgICAgICAgICAgIDxiPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiZnJpZW5kbHlfbmFtZVwiOiBcIlJPRyBQRzI3OVFcIjwvYj5cclxuICAgICAgICAgICAgPGI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Li4uPC9iPlxyXG4gICAgICAgICAgICA8Yj4mbmJzcDsmbmJzcDt9PC9iPlxyXG4gICAgICAgICAgPC9wcmU+XHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICA8dGVtcGxhdGUgI2ZyZWVic2Q+XHJcbiAgICAgICAgICA8cHJlIHN0eWxlPVwid2hpdGUtc3BhY2U6IHByZS1saW5lXCI+XHJcbiAgICAgICAgICAgIEluZm86IERldGVjdGluZyBkaXNwbGF5c1xyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RlZCBkaXNwbGF5OiBEVkktRC0wIChpZDogMCkgY29ubmVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RlZCBkaXNwbGF5OiBIRE1JLTAgKGlkOiAxKSBjb25uZWN0ZWQ6IHRydWVcclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0ZWQgZGlzcGxheTogRFAtMCAoaWQ6IDIpIGNvbm5lY3RlZDogdHJ1ZVxyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RlZCBkaXNwbGF5OiBEUC0xIChpZDogMykgY29ubmVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RlZCBkaXNwbGF5OiBEVkktRC0xIChpZDogNCkgY29ubmVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgPC9wcmU+XHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICA8dGVtcGxhdGUgI2xpbnV4PlxyXG4gICAgICAgICAgPHByZSBzdHlsZT1cIndoaXRlLXNwYWNlOiBwcmUtbGluZVwiPlxyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RpbmcgZGlzcGxheXNcclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0ZWQgZGlzcGxheTogRFZJLUQtMCAoaWQ6IDApIGNvbm5lY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0ZWQgZGlzcGxheTogSERNSS0wIChpZDogMSkgY29ubmVjdGVkOiB0cnVlXHJcbiAgICAgICAgICAgIEluZm86IERldGVjdGVkIGRpc3BsYXk6IERQLTAgKGlkOiAyKSBjb25uZWN0ZWQ6IHRydWVcclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0ZWQgZGlzcGxheTogRFAtMSAoaWQ6IDMpIGNvbm5lY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0ZWQgZGlzcGxheTogRFZJLUQtMSAoaWQ6IDQpIGNvbm5lY3RlZDogZmFsc2VcclxuICAgICAgICAgIDwvcHJlPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPHRlbXBsYXRlICNtYWNvcz5cclxuICAgICAgICAgIDxwcmUgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogcHJlLWxpbmVcIj5cclxuICAgICAgICAgICAgSW5mbzogRGV0ZWN0aW5nIGRpc3BsYXlzXHJcbiAgICAgICAgICAgIEluZm86IERldGVjdGVkIGRpc3BsYXk6IE1vbml0b3ItMCAoaWQ6IDMpIGNvbm5lY3RlZDogdHJ1ZVxyXG4gICAgICAgICAgICBJbmZvOiBEZXRlY3RlZCBkaXNwbGF5OiBNb25pdG9yLTEgKGlkOiAyKSBjb25uZWN0ZWQ6IHRydWVcclxuICAgICAgICAgIDwvcHJlPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDwvUGxhdGZvcm1MYXlvdXQ+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgcmVmLCBjb21wdXRlZCwgb25Nb3VudGVkLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCBQbGF0Zm9ybUxheW91dCBmcm9tICdAL1BsYXRmb3JtTGF5b3V0LnZ1ZSc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICdAL0NoZWNrYm94LnZ1ZSc7XHJcbmltcG9ydCBDb25maWdEdXJhdGlvbkZpZWxkIGZyb20gJ0AvQ29uZmlnRHVyYXRpb25GaWVsZC52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB7IE5TZWxlY3QsIE5JbnB1dCwgTklucHV0TnVtYmVyLCBOQnV0dG9uLCBOUmFkaW9Hcm91cCwgTlJhZGlvLCBOR3JpZCwgTkdpIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyB1c2VJMThuIH0gZnJvbSAndnVlLWkxOG4nO1xyXG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcclxuXHJcbi8vIFByb3BzXHJcbmNvbnN0IHByb3BzID0gZGVmaW5lUHJvcHM8eyBzZWN0aW9uPzogJ3ByZScgfCAnb3B0aW9ucycgfT4oKTtcclxuY29uc3Qgc2VjdGlvbiA9IGNvbXB1dGVkKCgpID0+IHByb3BzLnNlY3Rpb24gPz8gJ3ByZScpO1xyXG5cclxuLy8gVXNlIGNlbnRyYWxpemVkIHN0b3JlIGZvciBjb25maWcgYW5kIHBsYXRmb3JtXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG53YXRjaChcclxuICAoKSA9PiBjb25maWcuZGRfd2FfZHVtbXlfcGx1Z19oZHIxMCxcclxuICAodmFsdWUpID0+IHtcclxuICAgIGlmICh2YWx1ZSAmJiAhY29uZmlnLmZyYW1lX2xpbWl0ZXJfZGlzYWJsZV92c3luYykge1xyXG4gICAgICBjb25maWcuZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jID0gdHJ1ZTtcclxuICAgIH1cclxuICB9LFxyXG4gIHsgaW1tZWRpYXRlOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBkdW1teVBsdWdXaWtpVXJsID1cclxuICAnaHR0cHM6Ly9naXRodWIuY29tL05vbmFyeS9kb2N1bWVudGF0aW9uL3dpa2kvRHVtbXlQbHVncyNlbmFibGluZy0xMC1iaXQtY29sb3Itb24tZHVtbXktcGx1Z3MtYXQtaGlnaC1yZXNvbHV0aW9ucyc7XHJcbmNvbnN0IFZJUlRVQUxfRElTUExBWV9TRUxFQ1RJT04gPSAnc3Vuc2hpbmU6c3Vkb3ZkYV92aXJ0dWFsX2Rpc3BsYXknO1xyXG5jb25zdCB1c2luZ1ZpcnR1YWxEaXNwbGF5ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IG1vZGUgPSBjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGU7XHJcbiAgaWYgKG1vZGUgPT09ICdwZXJfY2xpZW50JyB8fCBtb2RlID09PSAnc2hhcmVkJykge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGlmIChtb2RlID09PSAnZGlzYWJsZWQnKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiBjb25maWcub3V0cHV0X25hbWUgPT09IFZJUlRVQUxfRElTUExBWV9TRUxFQ1RJT047XHJcbn0pO1xyXG5cclxudHlwZSBEaXNwbGF5RGV2aWNlID0ge1xyXG4gIGRldmljZV9pZD86IHN0cmluZztcclxuICBkaXNwbGF5X25hbWU/OiBzdHJpbmc7XHJcbiAgZnJpZW5kbHlfbmFtZT86IHN0cmluZztcclxuICBpbmZvPzogdW5rbm93bjtcclxufTtcclxuXHJcbi8vIC0tLS0tIFR5cGVzIC0tLS0tXHJcbnR5cGUgUmVmcmVzaFJhdGVPbmx5ID0ge1xyXG4gIHJlcXVlc3RlZF9mcHM6IHN0cmluZztcclxuICBmaW5hbF9yZWZyZXNoX3JhdGU6IHN0cmluZztcclxufTtcclxudHlwZSBSZXNvbHV0aW9uT25seSA9IHtcclxuICByZXF1ZXN0ZWRfcmVzb2x1dGlvbjogc3RyaW5nO1xyXG4gIGZpbmFsX3Jlc29sdXRpb246IHN0cmluZztcclxufTtcclxudHlwZSBNaXhlZFJlbWFwID0gUmVmcmVzaFJhdGVPbmx5ICYgUmVzb2x1dGlvbk9ubHk7XHJcbnR5cGUgUmVtYXBUeXBlID0gJ3JlZnJlc2hfcmF0ZV9vbmx5JyB8ICdyZXNvbHV0aW9uX29ubHknIHwgJ21peGVkJztcclxudHlwZSBEZE1vZGVSZW1hcHBpbmcgPSB7XHJcbiAgcmVmcmVzaF9yYXRlX29ubHk6IFJlZnJlc2hSYXRlT25seVtdO1xyXG4gIHJlc29sdXRpb25fb25seTogUmVzb2x1dGlvbk9ubHlbXTtcclxuICBtaXhlZDogTWl4ZWRSZW1hcFtdO1xyXG59O1xyXG5cclxuY29uc3QgUkVGUkVTSF9SQVRFX09OTFk6IFJlbWFwVHlwZSA9ICdyZWZyZXNoX3JhdGVfb25seSc7XHJcbmNvbnN0IFJFU09MVVRJT05fT05MWTogUmVtYXBUeXBlID0gJ3Jlc29sdXRpb25fb25seSc7XHJcbmNvbnN0IE1JWEVEOiBSZW1hcFR5cGUgPSAnbWl4ZWQnO1xyXG5cclxuZnVuY3Rpb24gaXNPYmplY3QodjogdW5rbm93bik6IHYgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xyXG4gIHJldHVybiAhIXYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnO1xyXG59XHJcbmZ1bmN0aW9uIGlzU3RyaW5nUmVjb3JkKHY6IHVua25vd24sIGtleXM6IHN0cmluZ1tdKTogdiBpcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcclxuICBpZiAoIWlzT2JqZWN0KHYpKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIGtleXMuZXZlcnkoKGspID0+IHR5cGVvZiAodiBhcyBhbnkpW2tdID09PSAnc3RyaW5nJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNSZWZyZXNoUmF0ZU9ubHkodjogdW5rbm93bik6IHYgaXMgUmVmcmVzaFJhdGVPbmx5IHtcclxuICByZXR1cm4gaXNTdHJpbmdSZWNvcmQodiwgWydyZXF1ZXN0ZWRfZnBzJywgJ2ZpbmFsX3JlZnJlc2hfcmF0ZSddKTtcclxufVxyXG5mdW5jdGlvbiBpc1Jlc29sdXRpb25Pbmx5KHY6IHVua25vd24pOiB2IGlzIFJlc29sdXRpb25Pbmx5IHtcclxuICByZXR1cm4gaXNTdHJpbmdSZWNvcmQodiwgWydyZXF1ZXN0ZWRfcmVzb2x1dGlvbicsICdmaW5hbF9yZXNvbHV0aW9uJ10pO1xyXG59XHJcbmZ1bmN0aW9uIGlzTWl4ZWQodjogdW5rbm93bik6IHYgaXMgTWl4ZWRSZW1hcCB7XHJcbiAgcmV0dXJuIGlzUmVmcmVzaFJhdGVPbmx5KHYpICYmIGlzUmVzb2x1dGlvbk9ubHkodik7XHJcbn1cclxuZnVuY3Rpb24gaXNSZW1hcHBpbmcob2JqOiB1bmtub3duKTogb2JqIGlzIERkTW9kZVJlbWFwcGluZyB7XHJcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3QgciA9IG9iaiBhcyBhbnk7XHJcbiAgcmV0dXJuIChcclxuICAgIEFycmF5LmlzQXJyYXkoci5yZWZyZXNoX3JhdGVfb25seSkgJiYgQXJyYXkuaXNBcnJheShyLnJlc29sdXRpb25fb25seSkgJiYgQXJyYXkuaXNBcnJheShyLm1peGVkKVxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlbWFwcGluZygpOiBEZE1vZGVSZW1hcHBpbmcgfCBudWxsIHtcclxuICBjb25zdCB2ID0gY29uZmlnLmRkX21vZGVfcmVtYXBwaW5nO1xyXG4gIHJldHVybiBpc1JlbWFwcGluZyh2KSA/IHYgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5CZVJlbWFwcGVkKCk6IGJvb2xlYW4ge1xyXG4gIC8vIEFsd2F5cyBzaG93IHJlbWFwcGVyIFVJIGFzIGxvbmcgYXMgdGhlIGRpc3BsYXkgZGV2aWNlIGNvbmZpZ3VyYXRpb24gaXNuJ3QgZGlzYWJsZWRcclxuICByZXR1cm4gY29uZmlnLmRkX2NvbmZpZ3VyYXRpb25fb3B0aW9uICE9PSAnZGlzYWJsZWQnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSZW1hcHBpbmdUeXBlKCk6IFJlbWFwVHlwZSB7XHJcbiAgLy8gQWx3YXlzIGV4cG9zZSByZXNvbHV0aW9uIG92ZXJyaWRlIGZpZWxkcyByZWdhcmRsZXNzIG9mIHNlbGVjdGVkIG9wdGlvbnNcclxuICAvLyBEZXNpZ24gcmVxdWlyZW1lbnQ6IHJlbWFwcGVyIHNob3dzIGJvdGggcmVzb2x1dGlvbiBhbmQgcmVmcmVzaCByYXRlIGlucHV0c1xyXG4gIC8vIHdoZW5ldmVyIGRpc3BsYXkgZGV2aWNlIGNvbmZpZ3VyYXRpb24gaXMgZW5hYmxlZC4gRGVmYXVsdCB0byBNSVhFRC5cclxuICByZXR1cm4gTUlYRUQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFJlbWFwcGluZ0VudHJ5KCk6IHZvaWQge1xyXG4gIGNvbnN0IHR5cGUgPSBnZXRSZW1hcHBpbmdUeXBlKCk7XHJcbiAgY29uc3QgcmVtYXAgPSBnZXRSZW1hcHBpbmcoKTtcclxuICBpZiAoIXJlbWFwKSByZXR1cm47XHJcblxyXG4gIGlmICh0eXBlID09PSBSRUZSRVNIX1JBVEVfT05MWSkge1xyXG4gICAgY29uc3QgZW50cnk6IFJlZnJlc2hSYXRlT25seSA9IHsgcmVxdWVzdGVkX2ZwczogJycsIGZpbmFsX3JlZnJlc2hfcmF0ZTogJycgfTtcclxuICAgIHJlbWFwLnJlZnJlc2hfcmF0ZV9vbmx5LnB1c2goZW50cnkpO1xyXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gUkVTT0xVVElPTl9PTkxZKSB7XHJcbiAgICBjb25zdCBlbnRyeTogUmVzb2x1dGlvbk9ubHkgPSB7IHJlcXVlc3RlZF9yZXNvbHV0aW9uOiAnJywgZmluYWxfcmVzb2x1dGlvbjogJycgfTtcclxuICAgIHJlbWFwLnJlc29sdXRpb25fb25seS5wdXNoKGVudHJ5KTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3QgZW50cnk6IE1peGVkUmVtYXAgPSB7XHJcbiAgICAgIHJlcXVlc3RlZF9mcHM6ICcnLFxyXG4gICAgICBmaW5hbF9yZWZyZXNoX3JhdGU6ICcnLFxyXG4gICAgICByZXF1ZXN0ZWRfcmVzb2x1dGlvbjogJycsXHJcbiAgICAgIGZpbmFsX3Jlc29sdXRpb246ICcnLFxyXG4gICAgfTtcclxuICAgIHJlbWFwLm1peGVkLnB1c2goZW50cnkpO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVhc3NpZ24gdG8gdHJpZ2dlciB2ZXJzaW9uIGJ1bXBcclxuICBzdG9yZS51cGRhdGVPcHRpb24oJ2RkX21vZGVfcmVtYXBwaW5nJywgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZW1hcCkpKTtcclxuICBzdG9yZS5tYXJrTWFudWFsRGlydHk/LignZGRfbW9kZV9yZW1hcHBpbmcnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlUmVtYXBwaW5nRW50cnkoaWR4OiBudW1iZXIpOiB2b2lkIHtcclxuICBjb25zdCB0eXBlID0gZ2V0UmVtYXBwaW5nVHlwZSgpO1xyXG4gIGNvbnN0IHJlbWFwID0gZ2V0UmVtYXBwaW5nKCk7XHJcbiAgaWYgKCFyZW1hcCkgcmV0dXJuO1xyXG4gIGlmICh0eXBlID09PSBSRUZSRVNIX1JBVEVfT05MWSkge1xyXG4gICAgcmVtYXAucmVmcmVzaF9yYXRlX29ubHkuc3BsaWNlKGlkeCwgMSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSBSRVNPTFVUSU9OX09OTFkpIHtcclxuICAgIHJlbWFwLnJlc29sdXRpb25fb25seS5zcGxpY2UoaWR4LCAxKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmVtYXAubWl4ZWQuc3BsaWNlKGlkeCwgMSk7XHJcbiAgfVxyXG4gIHN0b3JlLnVwZGF0ZU9wdGlvbignZGRfbW9kZV9yZW1hcHBpbmcnLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbWFwKSkpO1xyXG4gIHN0b3JlLm1hcmtNYW51YWxEaXJ0eT8uKCdkZF9tb2RlX3JlbWFwcGluZycpO1xyXG59XHJcblxyXG4vLyBTYWZlIGFjY2Vzc29yIGZvciB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHJlbWFwcGluZyBsaXN0XHJcbmNvbnN0IHJlbWFwcGluZ0FycmF5ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHR5cGUgPSBnZXRSZW1hcHBpbmdUeXBlKCk7XHJcbiAgY29uc3QgZGQgPSBjb25maWcuZGRfbW9kZV9yZW1hcHBpbmcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgY29uc3QgYXJyID0gZGQ/Llt0eXBlXTtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpID8gYXJyIDogW107XHJcbn0pO1xyXG5cclxuLy8gLS0tLS0gaTE4biBoZWxwZXJzIC0tLS0tXHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5cclxuLy8gLS0tLS0gR29sZGVuIFJlc3RvcmUgKFdpbmRvd3MpIC0tLS0tXHJcbmNvbnN0IGdvbGRlbkJ1c3kgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBleHBvcnRTdGF0dXMgPSByZWY8bnVsbCB8IGJvb2xlYW4+KG51bGwpO1xyXG5jb25zdCBkZWxldGVTdGF0dXMgPSByZWY8bnVsbCB8IGJvb2xlYW4+KG51bGwpO1xyXG5jb25zdCBnb2xkZW5FeGlzdHMgPSByZWY8bnVsbCB8IGJvb2xlYW4+KG51bGwpO1xyXG5jb25zdCBzbmFwc2hvdERldmljZXMgPSByZWY8RGlzcGxheURldmljZVtdPihbXSk7XHJcbmNvbnN0IHNuYXBzaG90RGV2aWNlc0xvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBzbmFwc2hvdERldmljZXNFcnJvciA9IHJlZignJyk7XHJcbmNvbnN0IGV4Y2x1ZGVBbGxXYXJuaW5nID0gcmVmKGZhbHNlKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRHb2xkZW5TdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9kaXNwbGF5L2dvbGRlbl9zdGF0dXMnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgZ29sZGVuRXhpc3RzLnZhbHVlID0gcj8uZGF0YT8uZXhpc3RzID09PSB0cnVlO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgZ29sZGVuRXhpc3RzLnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBjcmVhdGVPclJlY3JlYXRlTGFiZWwgPSBjb21wdXRlZCgoKSA9PlxyXG4gIGdvbGRlbkV4aXN0cy52YWx1ZVxyXG4gICAgPyB0KCd0cm91Ymxlc2hvb3RpbmcuZGRfZ29sZGVuX3JlY3JlYXRlJylcclxuICAgIDogdCgndHJvdWJsZXNob290aW5nLmRkX2dvbGRlbl9jcmVhdGUnKSxcclxuKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGV4cG9ydEdvbGRlbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBnb2xkZW5CdXN5LnZhbHVlID0gdHJ1ZTtcclxuICBleHBvcnRTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5wb3N0KCcvYXBpL2Rpc3BsYXkvZXhwb3J0X2dvbGRlbicsIHt9LCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgZXhwb3J0U3RhdHVzLnZhbHVlID0gcj8uZGF0YT8uc3RhdHVzID09PSB0cnVlO1xyXG4gICAgYXdhaXQgbG9hZEdvbGRlblN0YXR1cygpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgZXhwb3J0U3RhdHVzLnZhbHVlID0gZmFsc2U7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4gKGdvbGRlbkJ1c3kudmFsdWUgPSBmYWxzZSksIDYwMCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkU25hcHNob3REZXZpY2VzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHNuYXBzaG90RGV2aWNlc0xvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHNuYXBzaG90RGV2aWNlc0Vycm9yLnZhbHVlID0gJyc7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0PERpc3BsYXlEZXZpY2VbXT4oJy9hcGkvZGlzcGxheS1kZXZpY2VzJywge1xyXG4gICAgICBwYXJhbXM6IHsgZGV0YWlsOiAnZnVsbCcgfSxcclxuICAgIH0pO1xyXG4gICAgc25hcHNob3REZXZpY2VzLnZhbHVlID0gQXJyYXkuaXNBcnJheShyZXMuZGF0YSkgPyByZXMuZGF0YSA6IFtdO1xyXG4gIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgc25hcHNob3REZXZpY2VzRXJyb3IudmFsdWUgPSBlPy5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gbG9hZCBkaXNwbGF5IGRldmljZXMnO1xyXG4gICAgc25hcHNob3REZXZpY2VzLnZhbHVlID0gW107XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNuYXBzaG90RGV2aWNlc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNuYXBzaG90RXhjbHVkZU9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3Qgb3B0czogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogc3RyaW5nOyBkaXNwbGF5TmFtZT86IHN0cmluZzsgaWQ/OiBzdHJpbmcgfT4gPSBbXTtcclxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgZm9yIChjb25zdCBkIG9mIHNuYXBzaG90RGV2aWNlcy52YWx1ZSkge1xyXG4gICAgY29uc3QgdmFsdWUgPSBkLmRldmljZV9pZCB8fCBkLmRpc3BsYXlfbmFtZSB8fCAnJztcclxuICAgIGlmICghdmFsdWUpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBkLmZyaWVuZGx5X25hbWUgfHwgZC5kaXNwbGF5X25hbWUgfHwgJ0Rpc3BsYXknO1xyXG4gICAgY29uc3QgZ3VpZCA9IGQuZGV2aWNlX2lkIHx8ICcnO1xyXG4gICAgY29uc3QgZGlzcE5hbWUgPSBkLmRpc3BsYXlfbmFtZSB8fCAnJztcclxuICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtkaXNwbGF5TmFtZV07XHJcbiAgICBpZiAoZ3VpZCkgcGFydHMucHVzaChndWlkKTtcclxuICAgIGlmIChkaXNwTmFtZSkgcGFydHMucHVzaChkaXNwTmFtZSArIChkLmluZm8gPyAnIChhY3RpdmUpJyA6ICcnKSk7XHJcbiAgICBjb25zdCBsYWJlbCA9IHBhcnRzLmpvaW4oJyAtICcpO1xyXG4gICAgY29uc3QgaWRMaW5lID0gZ3VpZCAmJiBkaXNwTmFtZSA/IGAke2d1aWR9IC0gJHtkaXNwTmFtZX1gIDogZ3VpZCB8fCBkaXNwTmFtZTtcclxuICAgIG9wdHMucHVzaCh7IGxhYmVsLCB2YWx1ZSwgZGlzcGxheU5hbWUsIGlkOiBpZExpbmUgfSk7XHJcbiAgICBzZWVuLmFkZCh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjdXJyZW50ID0gQXJyYXkuaXNBcnJheSgoY29uZmlnIGFzIGFueSkuZGRfc25hcHNob3RfZXhjbHVkZV9kZXZpY2VzKVxyXG4gICAgPyAoKGNvbmZpZyBhcyBhbnkpLmRkX3NuYXBzaG90X2V4Y2x1ZGVfZGV2aWNlcyBhcyB1bmtub3duW10pXHJcbiAgICAgICAgLm1hcCgodikgPT4gU3RyaW5nKHYgPz8gJycpLnRyaW0oKSlcclxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICA6IFtdO1xyXG4gIGZvciAoY29uc3QgaWQgb2YgY3VycmVudCkge1xyXG4gICAgaWYgKCFzZWVuLmhhcyhpZCkpIHtcclxuICAgICAgb3B0cy5wdXNoKHsgbGFiZWw6IGlkLCB2YWx1ZTogaWQsIGRpc3BsYXlOYW1lOiBpZCwgaWQgfSk7XHJcbiAgICAgIHNlZW4uYWRkKGlkKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG9wdHM7XHJcbn0pO1xyXG5cclxuY29uc3QgYXZhaWxhYmxlRXhjbHVkZURldmljZUlkcyA9IGNvbXB1dGVkKCgpID0+XHJcbiAgc25hcHNob3RFeGNsdWRlT3B0aW9ucy52YWx1ZS5tYXAoKG9wdCkgPT4gKG9wdC52YWx1ZSA/IFN0cmluZyhvcHQudmFsdWUpIDogJycpKS5maWx0ZXIoQm9vbGVhbiksXHJcbik7XHJcblxyXG5jb25zdCBleGNsdWRlZFNuYXBzaG90RGV2aWNlcyA9IGNvbXB1dGVkPHN0cmluZ1tdPih7XG4gIGdldCgpIHtcclxuICAgIGNvbnN0IHJhdyA9IChjb25maWcgYXMgYW55KS5kZF9zbmFwc2hvdF9leGNsdWRlX2RldmljZXM7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XHJcbiAgICAgIHJldHVybiByYXcubWFwKCh2OiBhbnkpID0+IFN0cmluZyh2ID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcclxuICAgIH1cclxuICAgIHJldHVybiBbXTtcclxuICB9LFxyXG4gIHNldChuZXh0KSB7XHJcbiAgICBleGNsdWRlQWxsV2FybmluZy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IEFycmF5LmlzQXJyYXkobmV4dClcclxuICAgICAgPyBBcnJheS5mcm9tKG5ldyBTZXQobmV4dC5tYXAoKHYpID0+IFN0cmluZyh2ID8/ICcnKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSkpXHJcbiAgICAgIDogW107XHJcbiAgICBjb25zdCBhdmFpbGFibGUgPSBhdmFpbGFibGVFeGNsdWRlRGV2aWNlSWRzLnZhbHVlO1xyXG4gICAgY29uc3Qgd291bGRFeGNsdWRlQWxsID1cclxuICAgICAgYXZhaWxhYmxlLmxlbmd0aCA+IDAgJiYgYXZhaWxhYmxlLmV2ZXJ5KChpZCkgPT4gbm9ybWFsaXplZC5pbmNsdWRlcyhpZCkpO1xyXG4gICAgaWYgKHdvdWxkRXhjbHVkZUFsbCkge1xyXG4gICAgICBleGNsdWRlQWxsV2FybmluZy52YWx1ZSA9IHRydWU7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygc3RvcmUudXBkYXRlT3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHN0b3JlLnVwZGF0ZU9wdGlvbignZGRfc25hcHNob3RfZXhjbHVkZV9kZXZpY2VzJywgbm9ybWFsaXplZCBhcyBhbnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgKGNvbmZpZyBhcyBhbnkpLmRkX3NuYXBzaG90X2V4Y2x1ZGVfZGV2aWNlcyA9IG5vcm1hbGl6ZWQgYXMgYW55O1xyXG4gICAgfVxyXG4gIH0sXG59KTtcblxuZnVuY3Rpb24gc25hcHNob3RPcHRpb24oc2xvdFByb3BzOiB1bmtub3duKTogYW55IHtcbiAgcmV0dXJuIChzbG90UHJvcHMgYXMgYW55KT8ub3B0aW9uID8/IHt9O1xufVxuXG5mdW5jdGlvbiBzbmFwc2hvdE9wdGlvbk5hbWUoc2xvdFByb3BzOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3Qgb3B0aW9uID0gc25hcHNob3RPcHRpb24oc2xvdFByb3BzKTtcbiAgcmV0dXJuIFN0cmluZyhvcHRpb24uZGlzcGxheU5hbWUgfHwgb3B0aW9uLmxhYmVsIHx8ICcnKTtcbn1cblxuZnVuY3Rpb24gc25hcHNob3RPcHRpb25JZChzbG90UHJvcHM6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCBvcHRpb24gPSBzbmFwc2hvdE9wdGlvbihzbG90UHJvcHMpO1xuICByZXR1cm4gU3RyaW5nKG9wdGlvbi5pZCB8fCBvcHRpb24udmFsdWUgfHwgJycpO1xufVxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUdvbGRlbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBnb2xkZW5CdXN5LnZhbHVlID0gdHJ1ZTtcclxuICBkZWxldGVTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5kZWxldGUoJy9hcGkvZGlzcGxheS9nb2xkZW4nLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgZGVsZXRlU3RhdHVzLnZhbHVlID0gcj8uZGF0YT8uZGVsZXRlZCA9PT0gdHJ1ZTtcclxuICAgIGF3YWl0IGxvYWRHb2xkZW5TdGF0dXMoKTtcclxuICB9IGNhdGNoIHtcclxuICAgIGRlbGV0ZVN0YXR1cy52YWx1ZSA9IGZhbHNlO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IChnb2xkZW5CdXN5LnZhbHVlID0gZmFsc2UpLCA2MDApO1xyXG4gIH1cclxufVxyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICBsb2FkR29sZGVuU3RhdHVzKCk7XHJcbiAgaWYgKCFzbmFwc2hvdERldmljZXNMb2FkaW5nLnZhbHVlICYmIHNuYXBzaG90RGV2aWNlcy52YWx1ZS5sZW5ndGggPT09IDApIHtcclxuICAgIHZvaWQgbG9hZFNuYXBzaG90RGV2aWNlcygpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBCdWlsZCB0cmFuc2xhdGVkIG9wdGlvbiBsaXN0cyBhcyBjb21wdXRlZHMgc28gdGhleSByZWFjdCB0byBsb2NhbGUgY2hhbmdlc1xyXG5jb25zdCBkZENvbmZpZ3VyYXRpb25PcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gW1xyXG4gIHsgbGFiZWw6IHQoJ19jb21tb24uZGlzYWJsZWQnKSBhcyBzdHJpbmcsIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX2NvbmZpZ192ZXJpZnlfb25seScpIGFzIHN0cmluZywgdmFsdWU6ICd2ZXJpZnlfb25seScgfSxcclxuICB7IGxhYmVsOiB0KCdjb25maWcuZGRfY29uZmlnX2Vuc3VyZV9hY3RpdmUnKSBhcyBzdHJpbmcsIHZhbHVlOiAnZW5zdXJlX2FjdGl2ZScgfSxcclxuICB7IGxhYmVsOiB0KCdjb25maWcuZGRfY29uZmlnX2Vuc3VyZV9wcmltYXJ5JykgYXMgc3RyaW5nLCB2YWx1ZTogJ2Vuc3VyZV9wcmltYXJ5JyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9jb25maWdfZW5zdXJlX29ubHlfZGlzcGxheScpIGFzIHN0cmluZywgdmFsdWU6ICdlbnN1cmVfb25seV9kaXNwbGF5JyB9LFxyXG5dKTtcclxuXHJcbmNvbnN0IGRkUmVzb2x1dGlvbk9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX3Jlc29sdXRpb25fb3B0aW9uX2Rpc2FibGVkJykgYXMgc3RyaW5nLCB2YWx1ZTogJ2Rpc2FibGVkJyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbl9hdXRvJykgYXMgc3RyaW5nLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX3Jlc29sdXRpb25fb3B0aW9uX21hbnVhbCcpIGFzIHN0cmluZywgdmFsdWU6ICdtYW51YWwnIH0sXHJcbl0pO1xyXG5cclxuY29uc3QgZGRSZWZyZXNoUmF0ZU9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX3JlZnJlc2hfcmF0ZV9vcHRpb25fZGlzYWJsZWQnKSBhcyBzdHJpbmcsIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLmRkX3JlZnJlc2hfcmF0ZV9vcHRpb25fYXV0bycpIGFzIHN0cmluZywgdmFsdWU6ICdhdXRvJyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9yZWZyZXNoX3JhdGVfb3B0aW9uX21hbnVhbCcpIGFzIHN0cmluZywgdmFsdWU6ICdtYW51YWwnIH0sXHJcbl0pO1xyXG5cclxuY29uc3QgZGRIZHJPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gW1xyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9oZHJfb3B0aW9uX2Rpc2FibGVkJykgYXMgc3RyaW5nLCB2YWx1ZTogJ2Rpc2FibGVkJyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5kZF9oZHJfb3B0aW9uX2F1dG8nKSBhcyBzdHJpbmcsIHZhbHVlOiAnYXV0bycgfSxcclxuXSk7XHJcblxyXG4vLyAtLS0tLSBNYW51YWwgUmVzb2x1dGlvbiBWYWxpZGF0aW9uIC0tLS0tXHJcbi8vIFZhbGlkYXRlIGZvcm1hdHMgbGlrZSAxOTIweDEwODAgKG9wdGlvbmFsbHkgYWxsb3dpbmcgc3BhY2VzIGFyb3VuZCB0aGUgc2VwYXJhdG9yKVxyXG5jb25zdCBtYW51YWxSZXNvbHV0aW9uUGF0dGVybiA9IC9eKFxccypcXGR7Miw1fVxccypbeFjDl11cXHMqXFxkezIsNX1cXHMqKSQvO1xyXG5jb25zdCBtYW51YWxSZXNvbHV0aW9uVmFsaWQgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKGNvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbiAhPT0gJ21hbnVhbCcpIHJldHVybiB0cnVlO1xyXG4gIGNvbnN0IHYgPSBTdHJpbmcoY29uZmlnLmRkX21hbnVhbF9yZXNvbHV0aW9uIHx8ICcnKTtcclxuICByZXR1cm4gbWFudWFsUmVzb2x1dGlvblBhdHRlcm4udGVzdCh2KTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBpc1Jlc29sdXRpb25GaWVsZFZhbGlkKHY6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpOiBib29sZWFuIHtcclxuICBpZiAoIXYpIHJldHVybiB0cnVlOyAvLyBhbGxvdyBlbXB0eSB0byBzdXBwb3J0IHJlZnJlc2gtcmF0ZS1vbmx5IG1hcHBpbmdzXHJcbiAgcmV0dXJuIG1hbnVhbFJlc29sdXRpb25QYXR0ZXJuLnRlc3QoU3RyaW5nKHYpKTtcclxufVxyXG5cclxuLy8gLS0tLS0gUmVmcmVzaCBSYXRlIFZhbGlkYXRpb24gLS0tLS1cclxuLy8gQWxsb3cgaW50ZWdlcnMgb3IgZGVjaW1hbHMsIG11c3QgYmUgPiAwXHJcbmZ1bmN0aW9uIGlzUG9zaXRpdmVOdW1iZXIodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IFN0cmluZyh2YWx1ZSkudHJpbSgpID09PSAnJykgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IG4gPSBOdW1iZXIodmFsdWUpO1xyXG4gIHJldHVybiBOdW1iZXIuaXNGaW5pdGUobikgJiYgbiA+IDA7XHJcbn1cclxuZnVuY3Rpb24gaXNSZWZyZXNoRmllbGRWYWxpZCh2OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgaWYgKCF2KSByZXR1cm4gdHJ1ZTsgLy8gYWxsb3cgZW1wdHkgd2hlbiBub3QgcmVxdWlyZWRcclxuICBjb25zdCBzID0gU3RyaW5nKHYpLnRyaW0oKTtcclxuICBpZiAocyA9PT0gJycpIHJldHVybiB0cnVlOyAvLyBlbXB0eSBhbGxvd2VkIGluIHNvbWUgY29udGV4dHNcclxuICByZXR1cm4gL15cXGQrKD86XFwuXFxkKyk/JC8udGVzdChzKSAmJiBpc1Bvc2l0aXZlTnVtYmVyKHMpO1xyXG59XHJcblxyXG4vLyAtLS0tLSBNYW51YWwgRW5mb3JjZW1lbnQgQ2hlY2sgLS0tLS1cclxuLy8gQ2hlY2sgaWYgbWFudWFsIHJlc29sdXRpb24gb3IgcmVmcmVzaCByYXRlIGlzIGVuZm9yY2VkICh3aGljaCBkaXNhYmxlcyBkaXNwbGF5IG92ZXJyaWRlcylcclxuY29uc3QgaXNNYW51YWxFbmZvcmNlbWVudEFjdGl2ZSA9IGNvbXB1dGVkKCgpID0+IHtcclxuICByZXR1cm4gY29uZmlnLmRkX3Jlc29sdXRpb25fb3B0aW9uID09PSAnbWFudWFsJyB8fCBjb25maWcuZGRfcmVmcmVzaF9yYXRlX29wdGlvbiA9PT0gJ21hbnVhbCc7XHJcbn0pO1xyXG5cclxuY29uc3QgaG90a2V5Q29tYm9QcmV2aWV3ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IGtleSA9IFN0cmluZyhjb25maWcuZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXkgfHwgJycpLnRyaW0oKTtcclxuICBpZiAoIWtleSkgcmV0dXJuICcnO1xyXG5cclxuICBjb25zdCByYXcgPSBTdHJpbmcoY29uZmlnLmRkX3NuYXBzaG90X3Jlc3RvcmVfaG90a2V5X21vZGlmaWVycyB8fCAnJykudHJpbSgpO1xyXG4gIGlmICghcmF3KSByZXR1cm4ga2V5O1xyXG5cclxuICBjb25zdCBsb3dlciA9IHJhdy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChsb3dlciA9PT0gJ25vbmUnIHx8IGxvd2VyID09PSAnb2ZmJyB8fCBsb3dlciA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VucyA9IGxvd2VyLnNwbGl0KC9bXFxzK3wsO10rLykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIGNvbnN0IGhhc0N0cmwgPSB0b2tlbnMuaW5jbHVkZXMoJ2N0cmwnKSB8fCB0b2tlbnMuaW5jbHVkZXMoJ2NvbnRyb2wnKTtcclxuICBjb25zdCBoYXNBbHQgPSB0b2tlbnMuaW5jbHVkZXMoJ2FsdCcpO1xyXG4gIGNvbnN0IGhhc1NoaWZ0ID0gdG9rZW5zLmluY2x1ZGVzKCdzaGlmdCcpO1xyXG4gIGNvbnN0IGhhc1dpbiA9IHRva2Vucy5pbmNsdWRlcygnd2luJykgfHwgdG9rZW5zLmluY2x1ZGVzKCd3aW5kb3dzJykgfHwgdG9rZW5zLmluY2x1ZGVzKCdtZXRhJyk7XHJcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XHJcbiAgaWYgKGhhc0N0cmwpIHBhcnRzLnB1c2goJ0N0cmwnKTtcclxuICBpZiAoaGFzQWx0KSBwYXJ0cy5wdXNoKCdBbHQnKTtcclxuICBpZiAoaGFzU2hpZnQpIHBhcnRzLnB1c2goJ1NoaWZ0Jyk7XHJcbiAgaWYgKGhhc1dpbikgcGFydHMucHVzaCgnV2luJyk7XHJcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcbiAgcmV0dXJuIGAke3BhcnRzLmpvaW4oJysnKX0rJHtrZXl9YDtcclxufSk7XHJcblxyXG5jb25zdCBob3RrZXlDYXB0dXJlQWN0aXZlID0gcmVmKGZhbHNlKTtcclxuY29uc3QgaG90a2V5Q2FwdHVyZUVycm9yID0gcmVmKCcnKTtcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhvdGtleUtleShyYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gIGlmICgvXkZcXGR7MSwyfSQvaS50ZXN0KHJhdykpIHtcclxuICAgIGNvbnN0IG51bSA9IE51bWJlcihyYXcuc2xpY2UoMSkpO1xyXG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIobnVtKSAmJiBudW0gPj0gMSAmJiBudW0gPD0gMjQpIHtcclxuICAgICAgcmV0dXJuIGBGJHtudW19YDtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBpZiAocmF3Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgaWYgKC9bYS16XS9pLnRlc3QocmF3KSkge1xyXG4gICAgICByZXR1cm4gcmF3LnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoL1swLTldLy50ZXN0KHJhdykpIHtcclxuICAgICAgcmV0dXJuIHJhdztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVNuYXBzaG90SG90a2V5KGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICBjb25zdCBrZXkgPSBlLmtleSB8fCAnJztcclxuICBjb25zdCBpZ25vcmVkID0gWydTaGlmdCcsICdDb250cm9sJywgJ0FsdCcsICdNZXRhJ107XHJcbiAgaWYgKGlnbm9yZWQuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGhvdGtleUNhcHR1cmVFcnJvci52YWx1ZSA9ICcnO1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWRLZXkgPSBub3JtYWxpemVIb3RrZXlLZXkoa2V5KTtcclxuICBpZiAoIW5vcm1hbGl6ZWRLZXkpIHtcclxuICAgIGhvdGtleUNhcHR1cmVFcnJvci52YWx1ZSA9IHQoJ2NvbmZpZy5kZF9zbmFwc2hvdF9yZXN0b3JlX2hvdGtleV9pbnZhbGlkJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCBtb2RpZmllcnM6IHN0cmluZ1tdID0gW107XHJcbiAgaWYgKGUuY3RybEtleSkgbW9kaWZpZXJzLnB1c2goJ2N0cmwnKTtcclxuICBpZiAoZS5hbHRLZXkpIG1vZGlmaWVycy5wdXNoKCdhbHQnKTtcclxuICBpZiAoZS5zaGlmdEtleSkgbW9kaWZpZXJzLnB1c2goJ3NoaWZ0Jyk7XHJcbiAgaWYgKGUubWV0YUtleSkgbW9kaWZpZXJzLnB1c2goJ3dpbicpO1xyXG4gIGNvbmZpZy5kZF9zbmFwc2hvdF9yZXN0b3JlX2hvdGtleSA9IG5vcm1hbGl6ZWRLZXk7XHJcbiAgY29uZmlnLmRkX3NuYXBzaG90X3Jlc3RvcmVfaG90a2V5X21vZGlmaWVycyA9IG1vZGlmaWVycy5sZW5ndGggPiAwID8gbW9kaWZpZXJzLmpvaW4oJysnKSA6ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJTbmFwc2hvdEhvdGtleSgpOiB2b2lkIHtcclxuICBob3RrZXlDYXB0dXJlRXJyb3IudmFsdWUgPSAnJztcclxuICBjb25maWcuZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXkgPSAnJztcclxuICBjb25maWcuZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXlfbW9kaWZpZXJzID0gJyc7XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPFBsYXRmb3JtTGF5b3V0IHYtaWY9XCJjb25maWdcIj5cclxuICAgIDx0ZW1wbGF0ZSAjd2luZG93cz5cclxuICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktNFwiPlxyXG4gICAgICAgIDwhLS0gU3RlcCAyIGNvbnRlbnQgY29tYmluZWQ6IGNvbmZpZ3VyYXRpb24gKyBzbmFwc2hvdCAoc2luZ2xlIGNhcmQpIC0tPlxyXG4gICAgICAgIDxmaWVsZHNldFxyXG4gICAgICAgICAgdi1pZj1cInNlY3Rpb24gPT09ICdwcmUnXCJcclxuICAgICAgICAgIGNsYXNzPVwiYm9yZGVyIGJvcmRlci1kYXJrLzM1IGRhcms6Ym9yZGVyLWxpZ2h0LzI1IHJvdW5kZWQteGwgcC00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8bGVnZW5kIGNsYXNzPVwicHgtMiB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfc3RlcF8yJykgfX06IHt7ICR0KCdjb25maWcuZGRfcHJlX3N0cmVhbV9zZXR1cCcpIH19XHJcbiAgICAgICAgICA8L2xlZ2VuZD5cclxuICAgICAgICAgIDwhLS0gQ29uZmlndXJhdGlvbiBvcHRpb24gLS0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBmb250LW1lZGl1bSBtYi0yXCI+e3sgJHQoJ2NvbmZpZy5kZF9jb25maWdfbGFiZWwnKSB9fTwvZGl2PlxyXG4gICAgICAgICAgPG4tcmFkaW8tZ3JvdXAgdi1pZj1cIiF1c2luZ1ZpcnR1YWxEaXNwbGF5XCIgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5kZF9jb25maWd1cmF0aW9uX29wdGlvblwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvXHJcbiAgICAgICAgICAgICAgICB2LWZvcj1cIm9wdCBpbiBkZENvbmZpZ3VyYXRpb25PcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIDprZXk9XCJvcHQudmFsdWVcIlxyXG4gICAgICAgICAgICAgICAgOnZhbHVlPVwib3B0LnZhbHVlXCJcclxuICAgICAgICAgICAgICAgIDpsYWJlbD1cIm9wdC5sYWJlbFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L24tcmFkaW8tZ3JvdXA+XHJcbiAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgdi1pZj1cImNvbmZpZy5kZF9jb25maWd1cmF0aW9uX29wdGlvbiA9PT0gJ2Vuc3VyZV9hY3RpdmUnXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cIm10LTMgcm91bmRlZC1sZyBiZy1hbWJlci01MCBkYXJrOmJnLWFtYmVyLTk1MC8zMCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBkYXJrOmJvcmRlci1hbWJlci04MDAgcC0zXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyB0ZXh0LWFtYmVyLTkwMCBkYXJrOnRleHQtYW1iZXItMTAwXCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlXCIgOnNpemU9XCIxNFwiIGNsYXNzPVwidGV4dC1hbWJlci02MDAgZGFyazp0ZXh0LWFtYmVyLTQwMCBmbGV4LXNocmluay0wIG10LTAuNVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmxvY2tcIj57eyAkdCgnY29uZmlnLmRkX2NvbmZpZ19lbnN1cmVfYWN0aXZlX3dhcm5pbmcnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC90cmFuc2l0aW9uPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBtdC0xXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfY29uZmlnX2hpbnQnKSB9fVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm15LTQgYm9yZGVyLXQgYm9yZGVyLWRhcmsvNSBkYXJrOmJvcmRlci1saWdodC81XCIgLz5cclxuXHJcbiAgICAgICAgICA8IS0tIFNuYXBzaG90IGZvciByZWNvdmVyeSAtLT5cclxuICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwiY29uZmlnLmRkX2NvbmZpZ3VyYXRpb25fb3B0aW9uICE9PSAnZGlzYWJsZWQnXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJweC0wIHRleHQtc20gZm9udC1tZWRpdW1cIj5TYXZlIGEgZGlzcGxheSBzbmFwc2hvdCAoaW1wcm92ZXMgc3RhYmlsaXR5KTwvZGl2PlxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBtdC0xXCI+XHJcbiAgICAgICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5kZF9nb2xkZW5faGVscCcpIH19XHJcbiAgICAgICAgICAgICAgU2F2aW5nIGEgc25hcHNob3Qgb2YgeW91ciBpZGVhbCBtb25pdG9yIHNldHVwIGhlbHBzIFZpYmVwb2xsbyByZWNvdmVyIHdoZW4gV2luZG93c1xyXG4gICAgICAgICAgICAgIGZhaWxzIHRvIHJlc3RvcmUgZGlzcGxheXMgYWZ0ZXIgc3RyZWFtaW5nLlxyXG4gICAgICAgICAgICA8L3A+XHJcblxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgOmNsYXNzPVwiW1xyXG4gICAgICAgICAgICAgICAgJ2dvbGRlbi1zdGF0dXMgbXQtMyBmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTIgcm91bmRlZCBweC0zIHB5LTIgdGV4dC14cycsXHJcbiAgICAgICAgICAgICAgICBnb2xkZW5FeGlzdHMgPT09IHRydWVcclxuICAgICAgICAgICAgICAgICAgPyAnYmctc3VjY2Vzcy8xMCB0ZXh0LXN1Y2Nlc3MnXHJcbiAgICAgICAgICAgICAgICAgIDogZ29sZGVuRXhpc3RzID09PSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgID8gJ2JnLXdhcm5pbmcvMTAgdGV4dC13YXJuaW5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2JnLWxpZ2h0LzgwIGRhcms6YmctZGFyay82MCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0JyxcclxuICAgICAgICAgICAgICBdXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBnb2xkZW4tc3RhdHVzLWxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvblxuICAgICAgICAgICAgICAgICAgOm5hbWU9XCJnb2xkZW5FeGlzdHMgPT09IHRydWUgPyAnZmEtY2hlY2stY2lyY2xlJyA6IGdvbGRlbkV4aXN0cyA9PT0gZmFsc2UgPyAnZmEtZXhjbGFtYXRpb24tdHJpYW5nbGUnIDogJ2ZhLXNwaW5uZXInXCJcbiAgICAgICAgICAgICAgICAgIDpjbGFzcz1cImdvbGRlbkV4aXN0cyA9PT0gbnVsbCA/ICd0ZXh0LXNtIGFuaW1hdGUtc3BpbicgOiAndGV4dC1zbSdcIlxuICAgICAgICAgICAgICAgICAgOnNpemU9XCIxNFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtc2VtaWJvbGRcIj5cclxuICAgICAgICAgICAgICAgICAge3tcclxuICAgICAgICAgICAgICAgICAgICBnb2xkZW5FeGlzdHMgPT09IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgID8gJHQoJ3Ryb3VibGVzaG9vdGluZy5kZF9nb2xkZW5fc3RhdHVzX3ByZXNlbnQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBnb2xkZW5FeGlzdHMgPT09IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJHQoJ3Ryb3VibGVzaG9vdGluZy5kZF9nb2xkZW5fc3RhdHVzX21pc3NpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdDaGVja2luZ+KApidcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdvbGRlbi1hY3Rpb25zIGZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMiBtZDptbC1hdXRvXCI+XHJcbiAgICAgICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInRpbnlcIiB0eXBlPVwiZGVmYXVsdFwiIHN0cm9uZyBAY2xpY2s9XCJsb2FkR29sZGVuU3RhdHVzXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zeW5jXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPnt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZGRfZ29sZGVuX3JlZnJlc2gnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGlkZGVuIHNtOmJsb2NrIGgtNCB3LXB4IGJnLWN1cnJlbnQvMjVcIiAvPlxyXG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJ0aW55XCJcclxuICAgICAgICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiZ29sZGVuQnVzeVwiXHJcbiAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwiZ29sZGVuQnVzeSAmJiBleHBvcnRTdGF0dXMgPT09IG51bGwgJiYgZGVsZXRlU3RhdHVzID09PSBudWxsXCJcclxuICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiZXhwb3J0R29sZGVuXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgY3JlYXRlT3JSZWNyZWF0ZUxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJlcnJvclwiXHJcbiAgICAgICAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJnb2xkZW5CdXN5IHx8IGdvbGRlbkV4aXN0cyAhPT0gdHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwiZ29sZGVuQnVzeSAmJiBkZWxldGVTdGF0dXMgPT09IG51bGxcIlxyXG4gICAgICAgICAgICAgICAgICBAY2xpY2s9XCJkZWxldGVHb2xkZW5cIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLmRkX2dvbGRlbl9kZWxldGUnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICAgIDxwXHJcbiAgICAgICAgICAgICAgICB2LWlmPVwiZXhwb3J0U3RhdHVzID09PSB0cnVlXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibXQtMiBhbGVydCBhbGVydC1zdWNjZXNzIHJvdW5kZWQgcHgtMyBweS0yIHRleHQtc21cIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZGRfZXhwb3J0X2dvbGRlbl9zdWNjZXNzJykgfX1cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvdHJhbnNpdGlvbj5cclxuICAgICAgICAgICAgPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgICAgICAgICA8cFxyXG4gICAgICAgICAgICAgICAgdi1pZj1cImV4cG9ydFN0YXR1cyA9PT0gZmFsc2VcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJtdC0yIGFsZXJ0IGFsZXJ0LWRhbmdlciByb3VuZGVkIHB4LTMgcHktMiB0ZXh0LXNtXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLmRkX2V4cG9ydF9nb2xkZW5fZXJyb3InKSB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC90cmFuc2l0aW9uPlxyXG4gICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICAgIDxwXHJcbiAgICAgICAgICAgICAgICB2LWlmPVwiZGVsZXRlU3RhdHVzID09PSB0cnVlXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibXQtMiBhbGVydCBhbGVydC1zdWNjZXNzIHJvdW5kZWQgcHgtMyBweS0yIHRleHQtc21cIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZGRfZ29sZGVuX2RlbGV0ZWQnKSB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC90cmFuc2l0aW9uPlxyXG4gICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICAgIDxwXHJcbiAgICAgICAgICAgICAgICB2LWlmPVwiZGVsZXRlU3RhdHVzID09PSBmYWxzZVwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cIm10LTIgYWxlcnQgYWxlcnQtZGFuZ2VyIHJvdW5kZWQgcHgtMyBweS0yIHRleHQtc21cIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZGRfZ29sZGVuX2RlbGV0ZV9lcnJvcicpIH19XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtNCBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfc25hcHNob3RfZXhjbHVkZV90aXRsZScpIH19XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgIHF1YXRlcm5hcnlcclxuICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJzbmFwc2hvdERldmljZXNMb2FkaW5nXCJcclxuICAgICAgICAgICAgICAgICAgQGNsaWNrPVwibG9hZFNuYXBzaG90RGV2aWNlc1wiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zeW5jXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX3NuYXBzaG90X2V4Y2x1ZGVfZGVzYycpIH19XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDxuLXNlbGVjdFxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImV4Y2x1ZGVkU25hcHNob3REZXZpY2VzXCJcclxuICAgICAgICAgICAgICAgIDpvcHRpb25zPVwic25hcHNob3RFeGNsdWRlT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZVxyXG4gICAgICAgICAgICAgICAgdGFnXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJhYmxlXHJcbiAgICAgICAgICAgICAgICA6bG9hZGluZz1cInNuYXBzaG90RGV2aWNlc0xvYWRpbmdcIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwic25hcHNob3REZXZpY2VzTG9hZGluZ1wiXHJcbiAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCIkdCgnY29uZmlnLmRkX3NuYXBzaG90X2V4Y2x1ZGVfcGxhY2Vob2xkZXInKVwiXHJcbiAgICAgICAgICAgICAgICBAZm9jdXM9XCJcclxuICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc25hcHNob3REZXZpY2VzTG9hZGluZyAmJiBzbmFwc2hvdERldmljZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB2b2lkIGxvYWRTbmFwc2hvdERldmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHAgdi1pZj1cImV4Y2x1ZGVBbGxXYXJuaW5nXCIgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtcmVkLTUwMFwiPlxyXG4gICAgICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5kZF9zbmFwc2hvdF9leGNsdWRlX3dhcm5pbmcnKSB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8cCB2LWlmPVwic25hcHNob3REZXZpY2VzRXJyb3JcIiBjbGFzcz1cInRleHQteHMgdGV4dC1yZWQtNTAwXCI+XHJcbiAgICAgICAgICAgICAgICB7eyBzbmFwc2hvdERldmljZXNFcnJvciB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8IS0tIEFsd2F5cyByZXN0b3JlIGZyb20gZ29sZGVuIHNuYXBzaG90IG9wdGlvbiAtLT5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtaWY9XCJnb2xkZW5FeGlzdHMgPT09IHRydWVcIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwibXQtNCBib3JkZXItbC0yIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHBsLTNcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPENoZWNrYm94XHJcbiAgICAgICAgICAgICAgICBpZD1cImRkX2Fsd2F5c19yZXN0b3JlX2Zyb21fZ29sZGVuXCJcclxuICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcuZGRfYWx3YXlzX3Jlc3RvcmVfZnJvbV9nb2xkZW5cIlxyXG4gICAgICAgICAgICAgICAgbG9jYWxlLXByZWZpeD1cImNvbmZpZ1wiXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0PVwiZmFsc2VcIlxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtaWY9XCJ1c2luZ1ZpcnR1YWxEaXNwbGF5ICYmIGNvbmZpZy5kZF9jb25maWd1cmF0aW9uX29wdGlvbiAhPT0gJ2Rpc2FibGVkJ1wiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJtdC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHAtMyBzcGFjZS15LTJcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPENvbmZpZ0R1cmF0aW9uRmllbGRcclxuICAgICAgICAgICAgICAgIGlkPVwiZGRfcGF1c2VkX3ZpcnR1YWxfZGlzcGxheV90aW1lb3V0X3NlY3NcIlxyXG4gICAgICAgICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5kZF9wYXVzZWRfdmlydHVhbF9kaXNwbGF5X3RpbWVvdXRfc2Vjc1wiXHJcbiAgICAgICAgICAgICAgICA6bGFiZWw9XCJTdHJpbmcoJHQoJ2NvbmZpZy5kZF9wYXVzZWRfdmlydHVhbF9kaXNwbGF5X3RpbWVvdXRfc2VjcycpKVwiXHJcbiAgICAgICAgICAgICAgICA6ZGVzYz1cIlN0cmluZygkdCgnY29uZmlnLmRkX3BhdXNlZF92aXJ0dWFsX2Rpc3BsYXlfdGltZW91dF9zZWNzX2Rlc2MnKSlcIlxyXG4gICAgICAgICAgICAgICAgOm1pbj1cIjBcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjbWV0YT5cclxuICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICB2LWlmPVwiTnVtYmVyKGNvbmZpZy5kZF9wYXVzZWRfdmlydHVhbF9kaXNwbGF5X3RpbWVvdXRfc2VjcyB8fCAwKSA+IDBcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidGV4dC1hbWJlci02MDBcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5kZF9wYXVzZWRfdmlydHVhbF9kaXNwbGF5X3RpbWVvdXRfc2Vjc193YXJuaW5nJykgfX1cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICA8L0NvbmZpZ0R1cmF0aW9uRmllbGQ+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfcGF1c2VkX3ZpcnR1YWxfZGlzcGxheV90aW1lb3V0X3NlY3NfaG90a2V5X2hpbnQnKSB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtNCBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXlcIiBjbGFzcz1cImZvcm0tbGFiZWxcIj5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXknKSB9fVxyXG4gICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgIGlkPVwiZGRfc25hcHNob3RfcmVzdG9yZV9ob3RrZXlcIlxyXG4gICAgICAgICAgICAgICAgOnZhbHVlPVwiaG90a2V5Q29tYm9QcmV2aWV3XCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQ2xpY2sgYW5kIHByZXNzIGEgY29tYm9cIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJmb250LW1vbm8gdy1mdWxsXCJcclxuICAgICAgICAgICAgICAgIHJlYWRvbmx5XHJcbiAgICAgICAgICAgICAgICBAZm9jdXM9XCJob3RrZXlDYXB0dXJlQWN0aXZlID0gdHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICBAYmx1cj1cImhvdGtleUNhcHR1cmVBY3RpdmUgPSBmYWxzZVwiXHJcbiAgICAgICAgICAgICAgICBAa2V5ZG93bj1cInVwZGF0ZVNuYXBzaG90SG90a2V5XCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX3NuYXBzaG90X3Jlc3RvcmVfaG90a2V5X2Rlc2MnKSB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwidGlueVwiIHF1YXRlcm5hcnkgQGNsaWNrPVwiY2xlYXJTbmFwc2hvdEhvdGtleVwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX3NuYXBzaG90X3Jlc3RvcmVfaG90a2V5X3Jlc2V0JykgfX1cclxuICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyBob3RrZXlDYXB0dXJlQWN0aXZlID8gJHQoJ2NvbmZpZy5kZF9zbmFwc2hvdF9yZXN0b3JlX2hvdGtleV9jYXB0dXJlJykgOiAnICcgfX1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8cCB2LWlmPVwiaG90a2V5Q2FwdHVyZUVycm9yXCIgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtcmVkLTUwMFwiPlxyXG4gICAgICAgICAgICAgICAge3sgaG90a2V5Q2FwdHVyZUVycm9yIH19XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgPCEtLSBPcHRpb25hbCBhZGp1c3RtZW50cyAoYmVsb25ncyB0byBTdGVwIDMgaW4gcGFyZW50KSAtLT5cclxuICAgICAgICA8ZmllbGRzZXRcclxuICAgICAgICAgIHYtaWY9XCJzZWN0aW9uID09PSAnb3B0aW9ucycgJiYgY29uZmlnLmRkX2NvbmZpZ3VyYXRpb25fb3B0aW9uICE9PSAnZGlzYWJsZWQnXCJcclxuICAgICAgICAgIGNsYXNzPVwiYm9yZGVyIGJvcmRlci1kYXJrLzM1IGRhcms6Ym9yZGVyLWxpZ2h0LzI1IHJvdW5kZWQteGwgcC00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8bGVnZW5kIGNsYXNzPVwicHgtMiB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfc3RlcF8zJykgfX06IHt7ICR0KCdjb25maWcuZGRfb3B0aW9uYWxfYWRqdXN0bWVudHMnKSB9fVxyXG4gICAgICAgICAgPC9sZWdlbmQ+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS02XCI+XHJcbiAgICAgICAgICAgIDwhLS0gRGlzcGxheSBvdmVycmlkZXMgKGZvcm1lcmx5IERpc3BsYXkgbW9kZSByZW1hcHBpbmcpIC0tPlxyXG4gICAgICAgICAgICA8c2VjdGlvbiB2LWlmPVwiY2FuQmVSZW1hcHBlZCgpXCIgY2xhc3M9XCJzcGFjZS15LTNcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWxcclxuICAgICAgICAgICAgICAgICAgZm9yPVwiZGRfbW9kZV9yZW1hcHBpbmdcIlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfZGlzcGxheV9vdmVycmlkZXMnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuXHJcbiAgICAgICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgdi1pZj1cImlzTWFudWFsRW5mb3JjZW1lbnRBY3RpdmVcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm91bmRlZC1sZyBiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05NTAvMzAgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCBkYXJrOmJvcmRlci1ibHVlLTgwMCBwLTNcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYmx1ZS05MDAgZGFyazp0ZXh0LWJsdWUtMTAwIHNwYWNlLXktMS41XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWluZm8tY2lyY2xlXCIgOnNpemU9XCIxNFwiIGNsYXNzPVwidGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgZmxleC1zaHJpbmstMCBtdC0wLjVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJsb2NrXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA+T3ZlcnJpZGVzIGJlbG93IGFyZSBkaXNhYmxlZCB3aGlsZSBtYW51YWwgcmVzb2x1dGlvbiBvciByZWZyZXNoIHJhdGUgaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbmZvcmNlZC4gTWFudWFsIHJlZnJlc2ggcmF0ZXMgYXJlIGFwcGxpZWQgZm9yY2VmdWxseSBhbmQgZGlzYWJsZSB0aGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBkb3VibGUgcmVmcmVzaCByYXRlIGZpeC48L3NwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBzcGFjZS15LTFcIj5cclxuICAgICAgICAgICAgICAgICAgPHA+e3sgJHQoJ2NvbmZpZy5kZF9tb2RlX3JlbWFwcGluZ19kZXNjXzEnKSB9fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPHA+e3sgJHQoJ2NvbmZpZy5kZF9tb2RlX3JlbWFwcGluZ19kZXNjXzInKSB9fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPHA+e3sgJHQoJ2NvbmZpZy5kZF9tb2RlX3JlbWFwcGluZ19kZXNjXzMnKSB9fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPHA+e3sgJHQoJ2NvbmZpZy5kZF9tb2RlX3JlbWFwcGluZ19kZXNjX2V4YW1wbGUnKSB9fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPHA+XHJcbiAgICAgICAgICAgICAgICAgICAge3tcclxuICAgICAgICAgICAgICAgICAgICAgICR0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRSZW1hcHBpbmdUeXBlKCkgPT09IE1JWEVEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnY29uZmlnLmRkX21vZGVfcmVtYXBwaW5nX2Rlc2NfNF9maW5hbF92YWx1ZXNfbWl4ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnY29uZmlnLmRkX21vZGVfcmVtYXBwaW5nX2Rlc2NfNF9maW5hbF92YWx1ZXNfbm9uX21peGVkJyxcclxuICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwicmVtYXBwaW5nQXJyYXkubGVuZ3RoID4gMFwiIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgb3ZlcmZsb3ctaGlkZGVuXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIm1heC1oLVszNjBweF0gb3ZlcmZsb3cteS1hdXRvIHAtMiB3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtdGVzdGlkPVwiZGQtcmVtYXAtc2Nyb2xsXCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgIHYtZm9yPVwiKHZhbHVlLCBpZHgpIGluIHJlbWFwcGluZ0FycmF5XCJcclxuICAgICAgICAgICAgICAgICAgICAgIDprZXk9XCJpZHhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1yb3cgZmxleCBmbGV4LXdyYXAgZ2FwLTIgbGc6Z3JpZCBsZzpncmlkLWNvbHMtMTIgbGc6Z2FwLTIgbGc6aXRlbXMtc3RhcnRcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cImdldFJlbWFwcGluZ1R5cGUoKSAhPT0gUkVGUkVTSF9SQVRFX09OTFlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJlbWFwLWNvbCBsZzpjb2wtc3Bhbi0zXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcj1cImBkZC1yZW1hcC0ke2lkeH0tcmVxdWVzdGVkLXJlc29sdXRpb25gXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJlbWFwLWxhYmVsIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfbW9kZV9yZW1hcHBpbmdfcmVxdWVzdGVkX3Jlc29sdXRpb24nKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJ2YWx1ZS5yZXF1ZXN0ZWRfcmVzb2x1dGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vIHctZnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwiJzE5MjB4MTA4MCdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDppbnB1dC1wcm9wcz1cInsgaWQ6IGBkZC1yZW1hcC0ke2lkeH0tcmVxdWVzdGVkLXJlc29sdXRpb25gIH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCJzdG9yZS5tYXJrTWFudWFsRGlydHk/LignZGRfbW9kZV9yZW1hcHBpbmcnKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1iaW5kPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Jlc29sdXRpb25GaWVsZFZhbGlkKHZhbHVlLnJlcXVlc3RlZF9yZXNvbHV0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogeyBzdGF0dXM6ICdlcnJvcicgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cImdldFJlbWFwcGluZ1R5cGUoKSAhPT0gUkVTT0xVVElPTl9PTkxZXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1jb2wgbGc6Y29sLXNwYW4tMlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3I9XCJgZGQtcmVtYXAtJHtpZHh9LXJlcXVlc3RlZC1mcHNgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJlbWFwLWxhYmVsIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfbW9kZV9yZW1hcHBpbmdfcmVxdWVzdGVkX2ZwcycpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInZhbHVlLnJlcXVlc3RlZF9mcHNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZvbnQtbW9ubyB3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cIic2MCdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDppbnB1dC1wcm9wcz1cInsgaWQ6IGBkZC1yZW1hcC0ke2lkeH0tcmVxdWVzdGVkLWZwc2AgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZTp2YWx1ZT1cInN0b3JlLm1hcmtNYW51YWxEaXJ0eT8uKCdkZF9tb2RlX3JlbWFwcGluZycpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2LWJpbmQ9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVmcmVzaEZpZWxkVmFsaWQodmFsdWUucmVxdWVzdGVkX2ZwcykgPyB7fSA6IHsgc3RhdHVzOiAnZXJyb3InIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWlmPVwiZ2V0UmVtYXBwaW5nVHlwZSgpICE9PSBSRUZSRVNIX1JBVEVfT05MWVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicmVtYXAtY29sIGxnOmNvbC1zcGFuLTNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9yPVwiYGRkLXJlbWFwLSR7aWR4fS1maW5hbC1yZXNvbHV0aW9uYFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1sYWJlbCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX21vZGVfcmVtYXBwaW5nX2ZpbmFsX3Jlc29sdXRpb24nKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJ2YWx1ZS5maW5hbF9yZXNvbHV0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb250LW1vbm8gdy1mdWxsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCInMjU2MHgxNDQwJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOmlucHV0LXByb3BzPVwieyBpZDogYGRkLXJlbWFwLSR7aWR4fS1maW5hbC1yZXNvbHV0aW9uYCB9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwic3RvcmUubWFya01hbnVhbERpcnR5Py4oJ2RkX21vZGVfcmVtYXBwaW5nJylcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtYmluZD1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXNvbHV0aW9uRmllbGRWYWxpZCh2YWx1ZS5maW5hbF9yZXNvbHV0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogeyBzdGF0dXM6ICdlcnJvcicgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cImdldFJlbWFwcGluZ1R5cGUoKSAhPT0gUkVTT0xVVElPTl9PTkxZXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1jb2wgbGc6Y29sLXNwYW4tMlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3I9XCJgZGQtcmVtYXAtJHtpZHh9LWZpbmFsLXJlZnJlc2hgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJlbWFwLWxhYmVsIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfbW9kZV9yZW1hcHBpbmdfZmluYWxfcmVmcmVzaF9yYXRlJykgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwidmFsdWUuZmluYWxfcmVmcmVzaF9yYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb250LW1vbm8gdy1mdWxsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCInMTE5Ljk1J1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOmlucHV0LXByb3BzPVwieyBpZDogYGRkLXJlbWFwLSR7aWR4fS1maW5hbC1yZWZyZXNoYCB9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwic3RvcmUubWFya01hbnVhbERpcnR5Py4oJ2RkX21vZGVfcmVtYXBwaW5nJylcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtYmluZD1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWZyZXNoRmllbGRWYWxpZCh2YWx1ZS5maW5hbF9yZWZyZXNoX3JhdGUpID8ge30gOiB7IHN0YXR1czogJ2Vycm9yJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJlbWFwLWFjdGlvbnMgZmxleCB3LWZ1bGwgaXRlbXMtc3RhcnQganVzdGlmeS1zdGFydCBsZzpjb2wtc3Bhbi0yIGxnOnctYXV0byBsZzpqdXN0aWZ5LWVuZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJyZW1vdmVSZW1hcHBpbmdFbnRyeShpZHgpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS10cmFzaFwiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgPCEtLSBTZWNvbmQgZ3JpZCByb3cgZm9yIHZhbGlkYXRpb24gbWVzc2FnZXMgdG8gcHJlc2VydmUgdG9wIGFsaWdubWVudCAtLT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGdldFJlbWFwcGluZ1R5cGUoKSAhPT0gUkVGUkVTSF9SQVRFX09OTFkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAhaXNSZXNvbHV0aW9uRmllbGRWYWxpZCh2YWx1ZS5yZXF1ZXN0ZWRfcmVzb2x1dGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1tZXNzYWdlIHctZnVsbCBsZzpjb2wtc3Bhbi0zIHRleHQteHMgdGV4dC1yZWQtNTAwIG10LTFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBJbnZhbGlkLiBVc2UgV0lEVEh4SEVJR0hUIChlLmcuLCAxOTIweDEwODAsIHggb3Igw5cpIG9yIGxlYXZlIGJsYW5rLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRSZW1hcHBpbmdUeXBlKCkgIT09IFJFU09MVVRJT05fT05MWSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICFpc1JlZnJlc2hGaWVsZFZhbGlkKHZhbHVlLnJlcXVlc3RlZF9mcHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicmVtYXAtbWVzc2FnZSB3LWZ1bGwgbGc6Y29sLXNwYW4tMiB0ZXh0LXhzIHRleHQtcmVkLTUwMCBtdC0xXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgSW52YWxpZC4gVXNlIGEgcG9zaXRpdmUgbnVtYmVyIG9yIGxlYXZlIGJsYW5rLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRSZW1hcHBpbmdUeXBlKCkgIT09IFJFRlJFU0hfUkFURV9PTkxZICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIWlzUmVzb2x1dGlvbkZpZWxkVmFsaWQodmFsdWUuZmluYWxfcmVzb2x1dGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1tZXNzYWdlIHctZnVsbCBsZzpjb2wtc3Bhbi0zIHRleHQteHMgdGV4dC1yZWQtNTAwIG10LTFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBJbnZhbGlkLiBVc2UgV0lEVEh4SEVJR0hUIChlLmcuLCAyNTYweDE0NDAsIHggb3Igw5cpIG9yIGxlYXZlIGJsYW5rLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRSZW1hcHBpbmdUeXBlKCkgIT09IFJFU09MVVRJT05fT05MWSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICFpc1JlZnJlc2hGaWVsZFZhbGlkKHZhbHVlLmZpbmFsX3JlZnJlc2hfcmF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1tZXNzYWdlIHctZnVsbCBsZzpjb2wtc3Bhbi0yIHRleHQteHMgdGV4dC1yZWQtNTAwIG10LTFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBJbnZhbGlkLiBVc2UgYSBwb3NpdGl2ZSBudW1iZXIgb3IgbGVhdmUgYmxhbmsuXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGdldFJlbWFwcGluZ1R5cGUoKSA9PT0gTUlYRUQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAhdmFsdWUuZmluYWxfcmVzb2x1dGlvbiAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICF2YWx1ZS5maW5hbF9yZWZyZXNoX3JhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyZW1hcC1tZXNzYWdlIHctZnVsbCBsZzpjb2wtc3Bhbi0xMiB0ZXh0LXhzIHRleHQtcmVkLTUwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEZvciBtaXhlZCBtYXBwaW5ncywgc3BlY2lmeSBhdCBsZWFzdCBvbmUgRmluYWwgZmllbGQuXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBqdXN0aWZ5LWVuZCBwdC0yXCI+XHJcbiAgICAgICAgICAgICAgICA8bi1idXR0b24gdHlwZT1cInByaW1hcnlcIiBzdHJvbmcgc2l6ZT1cInNtYWxsXCIgQGNsaWNrPVwiYWRkUmVtYXBwaW5nRW50cnkoKVwiPlxyXG4gICAgICAgICAgICAgICAgICAmcGx1czsge3sgJHQoJ2NvbmZpZy5kZF9tb2RlX3JlbWFwcGluZ19hZGQnKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG5cclxuICAgICAgICAgICAgPG4tZ3JpZCA6Y29scz1cIjEyXCIgeC1nYXA9XCIxNlwiIHktZ2FwPVwiMTZcIiBjbGFzcz1cIm9wdGlvbmFsLWFkanVzdG1lbnRzLWdyaWRcIj5cclxuICAgICAgICAgICAgICA8IS0tIFJlc29sdXRpb24gb3B0aW9uIC0tPlxyXG4gICAgICAgICAgICAgIDxuLWdpIDpzcGFuPVwiMTJcIiA6bGc9XCI2XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0zXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGRfcmVzb2x1dGlvbl9vcHRpb25cIiBjbGFzcz1cImZvcm0tbGFiZWxcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHQoJ2NvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxuLXNlbGVjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgaWQ9XCJkZF9yZXNvbHV0aW9uX29wdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLmRkX3Jlc29sdXRpb25fb3B0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwiZGRSZXNvbHV0aW9uT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6ZGF0YS1zZWFyY2gtb3B0aW9ucz1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZFJlc29sdXRpb25PcHRpb25zLm1hcCgobykgPT4gYCR7by5sYWJlbH06OiR7by52YWx1ZX1gKS5qb2luKCd8JylcclxuICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInctZnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgdi1pZj1cImNvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbiA9PT0gJ21hbnVhbCdcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwib3B0aW9uYWwtc3Vic2VjdGlvbiBzcGFjZS15LTIgYm9yZGVyLWwgYm9yZGVyLWFtYmVyLTQwMCBkYXJrOmJvcmRlci1hbWJlci01MDAgcGwtM1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbGcgYmctYW1iZXItNTAgZGFyazpiZy1hbWJlci05NTAvMzAgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgZGFyazpib3JkZXItYW1iZXItODAwIHAtM1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYW1iZXItOTAwIGRhcms6dGV4dC1hbWJlci0xMDAgc3BhY2UteS0xLjVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWV4Y2xhbWF0aW9uLWNpcmNsZVwiIDpzaXplPVwiMTRcIiBjbGFzcz1cInRleHQtYW1iZXItNjAwIGRhcms6dGV4dC1hbWJlci00MDAgZmxleC1zaHJpbmstMCBtdC0wLjVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmxvY2tcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHQoJ2NvbmZpZy5kZF9yZXNvbHV0aW9uX29wdGlvbl9tYW51YWxfZGVzYycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgaWQ9XCJkZF9tYW51YWxfcmVzb2x1dGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLmRkX21hbnVhbF9yZXNvbHV0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vIHctZnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjI1NjB4MTQ0MFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlOnZhbHVlPVwic3RvcmUubWFya01hbnVhbERpcnR5Py4oJ2RkX21hbnVhbF9yZXNvbHV0aW9uJylcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1iaW5kPVwibWFudWFsUmVzb2x1dGlvblZhbGlkID8ge30gOiB7IHN0YXR1czogJ2Vycm9yJyB9XCJcclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwIHYtaWY9XCIhbWFudWFsUmVzb2x1dGlvblZhbGlkXCIgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtcmVkLTUwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgSW52YWxpZCBmb3JtYXQuIFVzZSBXSURUSHhIRUlHSFQsIGUuZy4sIDI1NjB4MTQ0MCAoeCBvciDDlykuXHJcbiAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvbi1naT5cclxuXHJcbiAgICAgICAgICAgICAgPCEtLSBSZWZyZXNoIHJhdGUgb3B0aW9uIC0tPlxyXG4gICAgICAgICAgICAgIDxuLWdpIDpzcGFuPVwiMTJcIiA6bGc9XCI2XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0zXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGRfcmVmcmVzaF9yYXRlX29wdGlvblwiIGNsYXNzPVwiZm9ybS1sYWJlbFwiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkdCgnY29uZmlnLmRkX3JlZnJlc2hfcmF0ZV9vcHRpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgICAgIGlkPVwiZGRfcmVmcmVzaF9yYXRlX29wdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLmRkX3JlZnJlc2hfcmF0ZV9vcHRpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XCJkZFJlZnJlc2hSYXRlT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6ZGF0YS1zZWFyY2gtb3B0aW9ucz1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZFJlZnJlc2hSYXRlT3B0aW9ucy5tYXAoKG8pID0+IGAke28ubGFiZWx9Ojoke28udmFsdWV9YCkuam9pbignfCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIHYtaWY9XCJjb25maWcuZGRfcmVmcmVzaF9yYXRlX29wdGlvbiA9PT0gJ21hbnVhbCdcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwib3B0aW9uYWwtc3Vic2VjdGlvbiBzcGFjZS15LTIgYm9yZGVyLWwgYm9yZGVyLWFtYmVyLTQwMCBkYXJrOmJvcmRlci1hbWJlci01MDAgcGwtM1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbGcgYmctYW1iZXItNTAgZGFyazpiZy1hbWJlci05NTAvMzAgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgZGFyazpib3JkZXItYW1iZXItODAwIHAtM1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYW1iZXItOTAwIGRhcms6dGV4dC1hbWJlci0xMDAgc3BhY2UteS0xLjVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWV4Y2xhbWF0aW9uLWNpcmNsZVwiIDpzaXplPVwiMTRcIiBjbGFzcz1cInRleHQtYW1iZXItNjAwIGRhcms6dGV4dC1hbWJlci00MDAgZmxleC1zaHJpbmstMCBtdC0wLjVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmxvY2tcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHQoJ2NvbmZpZy5kZF9yZWZyZXNoX3JhdGVfb3B0aW9uX21hbnVhbF9kZXNjJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZD1cImRkX21hbnVhbF9yZWZyZXNoX3JhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5kZF9tYW51YWxfcmVmcmVzaF9yYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vIHctZnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjU5Ljk1NThcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1iaW5kPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVmcmVzaEZpZWxkVmFsaWQoY29uZmlnLmRkX21hbnVhbF9yZWZyZXNoX3JhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogeyBzdGF0dXM6ICdlcnJvcicgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LWlmPVwiIWlzUmVmcmVzaEZpZWxkVmFsaWQoY29uZmlnLmRkX21hbnVhbF9yZWZyZXNoX3JhdGUpXCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidGV4dC14cyB0ZXh0LXJlZC01MDBcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIEludmFsaWQgcmVmcmVzaCByYXRlLiBVc2UgYSBwb3NpdGl2ZSBudW1iZXIsIGUuZy4sIDYwIG9yIDU5Ljk0LlxyXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L24tZ2k+XHJcblxyXG4gICAgICAgICAgICAgIDwhLS0gSERSIG9wdGlvbiAtLT5cclxuICAgICAgICAgICAgICA8bi1naSA6c3Bhbj1cIjEyXCIgOmxnPVwiNlwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRkX2hkcl9vcHRpb25cIiBjbGFzcz1cImZvcm0tbGFiZWxcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHQoJ2NvbmZpZy5kZF9oZHJfb3B0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZD1cImRkX2hkcl9vcHRpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNvbmZpZy5kZF9oZHJfb3B0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwiZGRIZHJPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDpkYXRhLXNlYXJjaC1vcHRpb25zPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRkSGRyT3B0aW9ucy5tYXAoKG8pID0+IGAke28ubGFiZWx9Ojoke28udmFsdWV9YCkuam9pbignfCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwib3B0aW9uYWwtc3Vic2VjdGlvbiBzcGFjZS15LTIgYm9yZGVyLWwgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcGwtM1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8Q2hlY2tib3hcclxuICAgICAgICAgICAgICAgICAgICAgIGlkPVwiZGRfd2FfZHVtbXlfcGx1Z19oZHIxMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLmRkX3dhX2R1bW15X3BsdWdfaGRyMTBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgbG9jYWxlLXByZWZpeD1cImNvbmZpZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6ZGVmYXVsdD1cImZhbHNlXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI2RlZmF1bHQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmxvY2tcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOmhyZWY9XCJkdW1teVBsdWdXaWtpVXJsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidW5kZXJsaW5lIGJyZWFrLXdvcmRzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5kZF93YV9kdW1teV9wbHVnX2hkcjEwX2xpbmsnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8L0NoZWNrYm94PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvbi1naT5cclxuXHJcbiAgICAgICAgICAgICAgPCEtLSBSZXZlcnQgYmVoYXZpb3IgLS0+XHJcbiAgICAgICAgICAgICAgPG4tZ2kgOnNwYW49XCIxMlwiIDpsZz1cIjZcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTNcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkZF9jb25maWdfcmV2ZXJ0X2RlbGF5XCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3tcclxuICAgICAgICAgICAgICAgICAgICAgICR0KCdjb25maWcuZGRfY29uZmlnX3JldmVydF9kZWxheScpXHJcbiAgICAgICAgICAgICAgICAgICAgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgICAgICAgaWQ9XCJkZF9jb25maWdfcmV2ZXJ0X2RlbGF5XCJcclxuICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb25maWcuZGRfY29uZmlnX3JldmVydF9kZWxheVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjMwMDBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgOm1pbj1cIjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfY29uZmlnX3JldmVydF9kZWxheV9kZXNjJykgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwib3B0aW9uYWwtc3Vic2VjdGlvbiBzcGFjZS15LTIgYm9yZGVyLWwgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgcGwtM1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8Q2hlY2tib3hcclxuICAgICAgICAgICAgICAgICAgICAgIGlkPVwiZGRfY29uZmlnX3JldmVydF9vbl9kaXNjb25uZWN0XCJcclxuICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcuZGRfY29uZmlnX3JldmVydF9vbl9kaXNjb25uZWN0XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGxvY2FsZS1wcmVmaXg9XCJjb25maWdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdD1cImZhbHNlXCJcclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvbi1naT5cclxuICAgICAgICAgICAgPC9uLWdyaWQ+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2ZpZWxkc2V0PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI2xpbnV4PjwvdGVtcGxhdGU+XHJcbiAgICA8dGVtcGxhdGUgI21hY29zPjwvdGVtcGxhdGU+XHJcbiAgPC9QbGF0Zm9ybUxheW91dD5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5nb2xkZW4tc3RhdHVzIHtcclxuICB3aWR0aDogMTAwJTtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xyXG59XHJcblxyXG4uZ29sZGVuLXN0YXR1cy1sYWJlbCB7XHJcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XHJcbn1cclxuXHJcbi5nb2xkZW4tYWN0aW9ucyB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xyXG59XHJcblxyXG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcclxuICAuZ29sZGVuLXN0YXR1cyB7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICB9XHJcblxyXG4gIC5nb2xkZW4tc3RhdHVzLWxhYmVsIHtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgfVxyXG5cclxuICAuZ29sZGVuLWFjdGlvbnMge1xyXG4gICAgd2lkdGg6IGF1dG87XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xyXG4gIH1cclxufVxyXG5cclxuLnJlbWFwLXJvdyB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbn1cclxuXHJcbi5yZW1hcC1yb3cgPiAqIHtcclxuICBtaW4td2lkdGg6IDA7XHJcbn1cclxuXHJcbi5yZW1hcC1jb2wge1xyXG4gIGZsZXg6IDEgMSAyMjBweDtcclxufVxyXG5cclxuLnJlbWFwLWFjdGlvbnMge1xyXG4gIGZsZXg6IDEgMSAxNjBweDtcclxufVxyXG5cclxuLnJlbWFwLWxhYmVsIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICBtYXJnaW4tYm90dG9tOiA0cHg7XHJcbn1cclxuXHJcbi5yZW1hcC1tZXNzYWdlIHtcclxuICBmbGV4OiAxIDEgMTAwJTtcclxufVxyXG5cclxuLnJlbWFwLXJvdyBpbnB1dCxcclxuLnJlbWFwLXJvdyAubi1pbnB1dCxcclxuLnJlbWFwLXJvdyAubi1pbnB1dF9faW5wdXQge1xyXG4gIG1heC13aWR0aDogMTAwJTtcclxufVxyXG5cclxuLnJlbWFwLXJvdyxcclxuLnJlbWFwLXJvdyAqIHtcclxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xyXG59XHJcbjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHN0b3JlLmNvbmZpZztcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJmYWxsYmFja19tb2RlXCIgdi1tb2RlbD1cImNvbmZpZy5mYWxsYmFja19tb2RlXCIgY2xhc3M9XCJtYi00XCIgLz5cclxuXHJcbiAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJtYXhfYml0cmF0ZVwiIHYtbW9kZWw9XCJjb25maWcubWF4X2JpdHJhdGVcIiBjbGFzcz1cIm1iLTRcIiAvPlxyXG5cclxuICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgc2V0dGluZy1rZXk9XCJtaW5pbXVtX2Zwc190YXJnZXRcIlxyXG4gICAgdi1tb2RlbD1cImNvbmZpZy5taW5pbXVtX2Zwc190YXJnZXRcIlxyXG4gICAgY2xhc3M9XCJtYi00XCJcclxuICAvPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHN0eWxlIHNjb3BlZD5cclxuLm1zLWl0ZW0ge1xyXG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJzLWRhcmstYmctc3VidGxlKTtcclxuICBmb250LXNpemU6IDEycHg7XHJcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XHJcbn1cclxuPC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IE5CdXR0b24sIE5UYWJsZSB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcblxyXG5jb25zdCBwcm9wcyA9IGRlZmluZVByb3BzPHsgc3RlcExhYmVsOiBzdHJpbmcgfT4oKTtcclxuXHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHN0b3JlLmNvbmZpZztcclxuY29uc3QgZHVtbXlQbHVnSGRyQWN0aXZlID0gY29tcHV0ZWQoKCkgPT4gISFjb25maWcuZGRfd2FfZHVtbXlfcGx1Z19oZHIxMCk7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBjb25maWcuZGRfd2FfZHVtbXlfcGx1Z19oZHIxMCxcclxuICAodmFsdWUpID0+IHtcclxuICAgIGlmICh2YWx1ZSAmJiAhY29uZmlnLmZyYW1lX2xpbWl0ZXJfZGlzYWJsZV92c3luYykge1xyXG4gICAgICBjb25maWcuZnJhbWVfbGltaXRlcl9kaXNhYmxlX3ZzeW5jID0gdHJ1ZTtcclxuICAgIH1cclxuICB9LFxyXG4gIHsgaW1tZWRpYXRlOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBzdGF0dXMgPSByZWY8YW55PihudWxsKTtcclxuY29uc3Qgc3RhdHVzRXJyb3IgPSByZWY8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGxvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG5cclxuY29uc3QgZnJhbWVMaW1pdGVyRW5hYmxlZCA9IGNvbXB1dGVkKHtcclxuICBnZXQ6ICgpID0+ICEhY29uZmlnLmZyYW1lX2xpbWl0ZXJfZW5hYmxlLFxyXG4gIHNldDogKHZhbHVlOiBib29sZWFuKSA9PiB7XHJcbiAgICBjb25maWcuZnJhbWVfbGltaXRlcl9lbmFibGUgPSB2YWx1ZTtcclxuICB9LFxyXG59KTtcclxuXHJcbmNvbnN0IGZyYW1lTGltaXRlclByb3ZpZGVyID0gY29tcHV0ZWQoe1xyXG4gIGdldDogKCkgPT4gY29uZmlnLmZyYW1lX2xpbWl0ZXJfcHJvdmlkZXIgfHwgJ2F1dG8nLFxyXG4gIHNldDogKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbmZpZy5mcmFtZV9saW1pdGVyX3Byb3ZpZGVyID0gdmFsdWU7XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCBwcm92aWRlckxhYmVsRm9yID0gKGlkOiBzdHJpbmcpID0+IHtcclxuICBzd2l0Y2ggKGlkKSB7XHJcbiAgICBjYXNlICdudmlkaWEtY29udHJvbC1wYW5lbCc6XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIucHJvdmlkZXIubnZjcCcpO1xyXG4gICAgY2FzZSAncnRzcyc6XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIucHJvdmlkZXIucnRzcycpO1xyXG4gICAgY2FzZSAnbm9uZSc6XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIucHJvdmlkZXIubm9uZScpO1xyXG4gICAgY2FzZSAnYXV0byc6XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdCgnZnJhbWVMaW1pdGVyLnByb3ZpZGVyLmF1dG8nKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm92aWRlck9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogcHJvdmlkZXJMYWJlbEZvcignYXV0bycpLCB2YWx1ZTogJ2F1dG8nIH0sXHJcbiAgeyBsYWJlbDogcHJvdmlkZXJMYWJlbEZvcigncnRzcycpLCB2YWx1ZTogJ3J0c3MnIH0sXHJcbiAgeyBsYWJlbDogcHJvdmlkZXJMYWJlbEZvcignbnZpZGlhLWNvbnRyb2wtcGFuZWwnKSwgdmFsdWU6ICdudmlkaWEtY29udHJvbC1wYW5lbCcgfSxcclxuXSk7XHJcblxyXG5jb25zdCBzeW5jTGltaXRlck9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogdCgnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLmtlZXAnKSwgdmFsdWU6ICcnIH0sXHJcbiAgeyBsYWJlbDogdCgnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLmFzeW5jJyksIHZhbHVlOiAnYXN5bmMnIH0sXHJcbiAgeyBsYWJlbDogdCgnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLmZyb250JyksIHZhbHVlOiAnZnJvbnQgZWRnZSBzeW5jJyB9LFxyXG4gIHsgbGFiZWw6IHQoJ2ZyYW1lTGltaXRlci5zeW5jTGltaXRlci5iYWNrJyksIHZhbHVlOiAnYmFjayBlZGdlIHN5bmMnIH0sXHJcbiAgeyBsYWJlbDogdCgnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyLnJlZmxleCcpLCB2YWx1ZTogJ252aWRpYSByZWZsZXgnIH0sXHJcbl0pO1xyXG5cclxuY29uc3Qgc3luY0xpbWl0ZXJIZWxwUm93cyA9IGNvbXB1dGVkKCgpID0+IFtcclxuICB7XHJcbiAgICBpZDogJ2FzeW5jJyxcclxuICAgIGxhYmVsOiB0KCdydHNzLnN5bmNfbGltaXRlcl9hc3luY19zaG9ydCcpLFxyXG4gICAgbGF0ZW5jeTogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYXN5bmNfbGF0ZW5jeScpLFxyXG4gICAgc3R1dHRlcjogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYXN5bmNfc3R1dHRlcicpLFxyXG4gICAgYWR2YW50YWdlczogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYXN5bmNfYWR2YW50YWdlcycpLFxyXG4gICAgZGlzYWR2YW50YWdlczogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYXN5bmNfZGlzYWR2YW50YWdlcycpLFxyXG4gICAgdXNlOiB0KCdydHNzLnN5bmNfbGltaXRlcl9hc3luY191c2UnKSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnZnJvbnQnLFxyXG4gICAgbGFiZWw6IHQoJ3J0c3Muc3luY19saW1pdGVyX2Zyb250X3Nob3J0JyksXHJcbiAgICBsYXRlbmN5OiB0KCdydHNzLnN5bmNfbGltaXRlcl9mcm9udF9sYXRlbmN5JyksXHJcbiAgICBzdHV0dGVyOiB0KCdydHNzLnN5bmNfbGltaXRlcl9mcm9udF9zdHV0dGVyJyksXHJcbiAgICBhZHZhbnRhZ2VzOiB0KCdydHNzLnN5bmNfbGltaXRlcl9mcm9udF9hZHZhbnRhZ2VzJyksXHJcbiAgICBkaXNhZHZhbnRhZ2VzOiB0KCdydHNzLnN5bmNfbGltaXRlcl9mcm9udF9kaXNhZHZhbnRhZ2VzJyksXHJcbiAgICB1c2U6IHQoJ3J0c3Muc3luY19saW1pdGVyX2Zyb250X3VzZScpLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdiYWNrJyxcclxuICAgIGxhYmVsOiB0KCdydHNzLnN5bmNfbGltaXRlcl9iYWNrX3Nob3J0JyksXHJcbiAgICBsYXRlbmN5OiB0KCdydHNzLnN5bmNfbGltaXRlcl9iYWNrX2xhdGVuY3knKSxcclxuICAgIHN0dXR0ZXI6IHQoJ3J0c3Muc3luY19saW1pdGVyX2JhY2tfc3R1dHRlcicpLFxyXG4gICAgYWR2YW50YWdlczogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYmFja19hZHZhbnRhZ2VzJyksXHJcbiAgICBkaXNhZHZhbnRhZ2VzOiB0KCdydHNzLnN5bmNfbGltaXRlcl9iYWNrX2Rpc2FkdmFudGFnZXMnKSxcclxuICAgIHVzZTogdCgncnRzcy5zeW5jX2xpbWl0ZXJfYmFja191c2UnKSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAncmVmbGV4JyxcclxuICAgIGxhYmVsOiB0KCdydHNzLnN5bmNfbGltaXRlcl9yZWZsZXhfc2hvcnQnKSxcclxuICAgIGxhdGVuY3k6IHQoJ3J0c3Muc3luY19saW1pdGVyX3JlZmxleF9sYXRlbmN5JyksXHJcbiAgICBzdHV0dGVyOiB0KCdydHNzLnN5bmNfbGltaXRlcl9yZWZsZXhfc3R1dHRlcicpLFxyXG4gICAgYWR2YW50YWdlczogdCgncnRzcy5zeW5jX2xpbWl0ZXJfcmVmbGV4X2FkdmFudGFnZXMnKSxcclxuICAgIGRpc2FkdmFudGFnZXM6IHQoJ3J0c3Muc3luY19saW1pdGVyX3JlZmxleF9kaXNhZHZhbnRhZ2VzJyksXHJcbiAgICB1c2U6IHQoJ3J0c3Muc3luY19saW1pdGVyX3JlZmxleF91c2UnKSxcclxuICB9LFxyXG5dKTtcclxuXHJcbmNvbnN0IG52aWRpYURldGVjdGVkID0gY29tcHV0ZWQoKCkgPT4gISFzdGF0dXMudmFsdWU/Lm52aWRpYV9hdmFpbGFibGUpO1xyXG5jb25zdCBudmNwUmVhZHkgPSBjb21wdXRlZCgoKSA9PiAhIXN0YXR1cy52YWx1ZT8ubnZjcF9yZWFkeSk7XHJcbmNvbnN0IHJ0c3NEZXRlY3RlZCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBzID0gc3RhdHVzLnZhbHVlO1xyXG4gIHJldHVybiAhIShzICYmIHMucGF0aF9leGlzdHMgJiYgcy5ob29rc19mb3VuZCk7XHJcbn0pO1xyXG5cclxuY29uc3QgZWZmZWN0aXZlUHJvdmlkZXIgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgYWN0aXZlID0gc3RhdHVzLnZhbHVlPy5hY3RpdmVfcHJvdmlkZXI7XHJcbiAgaWYgKGFjdGl2ZSAmJiBhY3RpdmUgIT09ICdub25lJyAmJiBhY3RpdmUgIT09ICdhdXRvJykge1xyXG4gICAgcmV0dXJuIGFjdGl2ZTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHByb3ZpZGVyID0gZnJhbWVMaW1pdGVyUHJvdmlkZXIudmFsdWU7XHJcbiAgaWYgKHByb3ZpZGVyID09PSAnYXV0bycpIHtcclxuICAgIGlmIChzdGF0dXMudmFsdWU/LnJ0c3NfYXZhaWxhYmxlIHx8IHJ0c3NEZXRlY3RlZC52YWx1ZSkge1xyXG4gICAgICByZXR1cm4gJ3J0c3MnO1xyXG4gICAgfVxyXG4gICAgaWYgKG52Y3BSZWFkeS52YWx1ZSAmJiBudmlkaWFEZXRlY3RlZC52YWx1ZSkge1xyXG4gICAgICByZXR1cm4gJ252aWRpYS1jb250cm9sLXBhbmVsJztcclxuICAgIH1cclxuICAgIHJldHVybiAncnRzcyc7XHJcbiAgfVxyXG4gIHJldHVybiBwcm92aWRlcjtcclxufSk7XHJcblxyXG5jb25zdCBydHNzQm9vdHN0cmFwUGVuZGluZyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBzID0gc3RhdHVzLnZhbHVlO1xyXG4gIHJldHVybiAhIShzICYmIHMuY2FuX2Jvb3RzdHJhcF9wcm9maWxlICYmICFzLnByb2ZpbGVfZm91bmQpO1xyXG59KTtcclxuXHJcbmNvbnN0IHJ0c3NBdXRvTGF1bmNoUGxhbm5lZCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBzID0gc3RhdHVzLnZhbHVlO1xyXG4gIHJldHVybiAhIShzICYmIHMucGF0aF9leGlzdHMgJiYgcy5ob29rc19mb3VuZCAmJiAhcy5wcm9jZXNzX3J1bm5pbmcpO1xyXG59KTtcclxuXHJcbmNvbnN0IHNob3VsZFNob3dSdHNzQ29uZmlnID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gZnJhbWVMaW1pdGVyUHJvdmlkZXIudmFsdWU7XHJcbiAgcmV0dXJuIHByb3ZpZGVyID09PSAncnRzcycgfHwgcHJvdmlkZXIgPT09ICdhdXRvJztcclxufSk7XHJcblxyXG5jb25zdCBzaG93UnRzc0luc3RhbGxIaW50ID0gY29tcHV0ZWQoKCkgPT4gc2hvdWxkU2hvd1J0c3NDb25maWcudmFsdWUgJiYgIXJ0c3NEZXRlY3RlZC52YWx1ZSk7XHJcblxyXG5jb25zdCBzaG93UnRzc0luc3RhbGxJbnB1dCA9IGNvbXB1dGVkKCgpID0+IHNob3VsZFNob3dSdHNzQ29uZmlnLnZhbHVlICYmICFydHNzRGV0ZWN0ZWQudmFsdWUpO1xyXG5cclxuY29uc3Qgc2hvd1N5bmNMaW1pdGVyU2VsZWN0ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gZnJhbWVMaW1pdGVyUHJvdmlkZXIudmFsdWU7XHJcbiAgaWYgKHByb3ZpZGVyID09PSAncnRzcycpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBpZiAocHJvdmlkZXIgPT09ICdhdXRvJykge1xyXG4gICAgcmV0dXJuIGVmZmVjdGl2ZVByb3ZpZGVyLnZhbHVlID09PSAncnRzcyc7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcblxyXG5jb25zdCBzaG93U3luY0xpbWl0ZXJIZWxwID0gY29tcHV0ZWQoKCkgPT4gc2hvd1N5bmNMaW1pdGVyU2VsZWN0LnZhbHVlKTtcclxuXHJcbmNvbnN0IHN0YXR1c0JhZGdlQ2xhc3MgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFzdGF0dXMudmFsdWUgfHwgIWZyYW1lTGltaXRlckVuYWJsZWQudmFsdWUpIHtcclxuICAgIHJldHVybiAnYmctd2FybmluZy8xMCB0ZXh0LXdhcm5pbmcnO1xyXG4gIH1cclxuICBpZiAoZWZmZWN0aXZlUHJvdmlkZXIudmFsdWUgPT09ICdudmlkaWEtY29udHJvbC1wYW5lbCcpIHtcclxuICAgIHJldHVybiBudmlkaWFEZXRlY3RlZC52YWx1ZSAmJiBudmNwUmVhZHkudmFsdWVcclxuICAgICAgPyAnYmctc3VjY2Vzcy8xMCB0ZXh0LXN1Y2Nlc3MnXHJcbiAgICAgIDogJ2JnLXdhcm5pbmcvMTAgdGV4dC13YXJuaW5nJztcclxuICB9XHJcbiAgaWYgKGVmZmVjdGl2ZVByb3ZpZGVyLnZhbHVlID09PSAncnRzcycpIHtcclxuICAgIHJldHVybiBydHNzRGV0ZWN0ZWQudmFsdWUgfHwgcnRzc0Jvb3RzdHJhcFBlbmRpbmcudmFsdWVcclxuICAgICAgPyAnYmctc3VjY2Vzcy8xMCB0ZXh0LXN1Y2Nlc3MnXHJcbiAgICAgIDogJ2JnLXdhcm5pbmcvMTAgdGV4dC13YXJuaW5nJztcclxuICB9XHJcbiAgcmV0dXJuICdiZy13YXJuaW5nLzEwIHRleHQtd2FybmluZyc7XHJcbn0pO1xyXG5cclxuY29uc3Qgc3RhdHVzSWNvbiA9IGNvbXB1dGVkKCgpID0+XHJcbiAgc3RhdHVzQmFkZ2VDbGFzcy52YWx1ZS5pbmNsdWRlcygnYmctc3VjY2VzcycpXHJcbiAgICA/ICdmYS1jaGVjay1jaXJjbGUnXHJcbiAgICA6ICdmYS1leGNsYW1hdGlvbi10cmlhbmdsZScsXHJcbik7XHJcblxyXG5jb25zdCBzdGF0dXNNZXNzYWdlID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghc3RhdHVzLnZhbHVlKSB7XHJcbiAgICByZXR1cm4gdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy51bmtub3duJyk7XHJcbiAgfVxyXG4gIGlmICghZnJhbWVMaW1pdGVyRW5hYmxlZC52YWx1ZSkge1xyXG4gICAgcmV0dXJuIHQoJ2ZyYW1lTGltaXRlci5zdGF0dXMubGltaXRlckRpc2FibGVkJyk7XHJcbiAgfVxyXG4gIGlmIChlZmZlY3RpdmVQcm92aWRlci52YWx1ZSA9PT0gJ252aWRpYS1jb250cm9sLXBhbmVsJykge1xyXG4gICAgaWYgKCFudmlkaWFEZXRlY3RlZC52YWx1ZSkge1xyXG4gICAgICByZXR1cm4gdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy5udmNwTm90RGV0ZWN0ZWQnKTtcclxuICAgIH1cclxuICAgIGlmICghbnZjcFJlYWR5LnZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIuc3RhdHVzLm52Y3BVbmF2YWlsYWJsZScpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHQoJ2ZyYW1lTGltaXRlci5zdGF0dXMubnZjcERldGVjdGVkJyk7XHJcbiAgfVxyXG4gIGlmIChlZmZlY3RpdmVQcm92aWRlci52YWx1ZSA9PT0gJ3J0c3MnKSB7XHJcbiAgICBpZiAocnRzc0RldGVjdGVkLnZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIuc3RhdHVzLnJ0c3NEZXRlY3RlZCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKHJ0c3NCb290c3RyYXBQZW5kaW5nLnZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIuc3RhdHVzLnJ0c3NCb290c3RyYXAnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0KCdmcmFtZUxpbWl0ZXIuc3RhdHVzLnJ0c3NOb3REZXRlY3RlZCcpO1xyXG4gIH1cclxuICByZXR1cm4gdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy51bmtub3duJyk7XHJcbn0pO1xyXG5cclxud2F0Y2goZnJhbWVMaW1pdGVyUHJvdmlkZXIsICgpID0+IHtcclxuICByZWZyZXNoU3RhdHVzKCk7XHJcbn0pO1xyXG5cclxud2F0Y2goZnJhbWVMaW1pdGVyRW5hYmxlZCwgKCkgPT4ge1xyXG4gIHJlZnJlc2hTdGF0dXMoKTtcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoU3RhdHVzKCkge1xyXG4gIGlmIChsb2FkaW5nLnZhbHVlKSByZXR1cm47XHJcbiAgbG9hZGluZy52YWx1ZSA9IHRydWU7XHJcbiAgc3RhdHVzRXJyb3IudmFsdWUgPSBudWxsO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9ydHNzL3N0YXR1cycsIHsgcGFyYW1zOiB7IF90czogRGF0ZS5ub3coKSB9IH0pO1xyXG4gICAgc3RhdHVzLnZhbHVlID0gcmVzPy5kYXRhIHx8IG51bGw7XHJcbiAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICBzdGF0dXNFcnJvci52YWx1ZSA9IGU/Lm1lc3NhZ2UgfHwgdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy5lcnJvcicpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBsb2FkaW5nLnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVQcm92aWRlckRyb3Bkb3duKHNob3c6IGJvb2xlYW4pIHtcclxuICBpZiAoc2hvdykge1xyXG4gICAgcmVmcmVzaFN0YXR1cygpO1xyXG4gIH1cclxufVxyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICByZWZyZXNoU3RhdHVzKCk7XHJcbn0pO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZmllbGRzZXQgY2xhc3M9XCJib3JkZXIgYm9yZGVyLWRhcmsvMzUgZGFyazpib3JkZXItbGlnaHQvMjUgcm91bmRlZC14bCBwLTRcIj5cclxuICAgIDxsZWdlbmQgY2xhc3M9XCJweC0yIHRleHQtc20gZm9udC1tZWRpdW1cIj5cclxuICAgICAge3sgc3RlcExhYmVsIH19OiB7eyB0KCdmcmFtZUxpbWl0ZXIuc3RlcFRpdGxlJykgfX1cclxuICAgIDwvbGVnZW5kPlxyXG5cclxuICAgIDxkaXYgY2xhc3M9XCJtYi00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzMwIGJnLXByaW1hcnkvMTAgcHgtNCBweS0zIHRleHQteHNcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImZvbnQtbWVkaXVtXCI+e3sgdCgnZnJhbWVMaW1pdGVyLm5vdGljZVRpdGxlJykgfX08L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIm10LTEgb3BhY2l0eS04MFwiPnt7IHQoJ2ZyYW1lTGltaXRlci5ub3RpY2VDb3B5JykgfX08L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTRcIj5cclxuICAgICAgPGRpdlxyXG4gICAgICAgIHYtaWY9XCJzdGF0dXMgfHwgc3RhdHVzRXJyb3JcIlxyXG4gICAgICAgIDpjbGFzcz1cIlsncm91bmRlZC1sZyBweC00IHB5LTMgdGV4dC14cycsIHN0YXR1c0JhZGdlQ2xhc3NdXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cInN0YXR1c0ljb25cIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1lZGl1bSBsZWFkaW5nLXRpZ2h0XCI+e3sgc3RhdHVzTWVzc2FnZSB9fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdHlwZT1cImRlZmF1bHRcIiBzdHJvbmcgOmxvYWRpbmc9XCJsb2FkaW5nXCIgQGNsaWNrPVwicmVmcmVzaFN0YXR1c1wiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtc3luY1wiIDpzaXplPVwiMTRcIiAvPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1sLTFcIj57eyB0KCdmcmFtZUxpbWl0ZXIuYWN0aW9ucy5yZWZyZXNoJykgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxwXHJcbiAgICAgICAgICB2LWlmPVwiXHJcbiAgICAgICAgICAgIHN0YXR1cyAmJlxyXG4gICAgICAgICAgICBlZmZlY3RpdmVQcm92aWRlciA9PT0gJ3J0c3MnICYmXHJcbiAgICAgICAgICAgIChydHNzQm9vdHN0cmFwUGVuZGluZyB8fCBydHNzQXV0b0xhdW5jaFBsYW5uZWQpXHJcbiAgICAgICAgICBcIlxyXG4gICAgICAgICAgY2xhc3M9XCJtdC0yIHRleHQteHMgb3BhY2l0eS04MFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPHNwYW4gdi1pZj1cInJ0c3NCb290c3RyYXBQZW5kaW5nXCI+e3sgdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy5ydHNzQm9vdHN0cmFwSGludCcpIH19PC9zcGFuPlxyXG4gICAgICAgICAgPHNwYW4gdi1lbHNlLWlmPVwicnRzc0F1dG9MYXVuY2hQbGFubmVkXCI+e3tcclxuICAgICAgICAgICAgdCgnZnJhbWVMaW1pdGVyLnN0YXR1cy5ydHNzQXV0b2xhdW5jaEhpbnQnKVxyXG4gICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxwIHYtaWY9XCJzdGF0dXNFcnJvclwiIGNsYXNzPVwibXQtMiB0ZXh0LXhzIHRleHQtd2FybmluZ1wiPnt7IHN0YXR1c0Vycm9yIH19PC9wPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdhcC00IG1kOmdyaWQtY29scy0yXCI+XHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHNldHRpbmcta2V5PVwiZnJhbWVfbGltaXRlcl9lbmFibGVcIlxyXG4gICAgICAgICAgdi1tb2RlbD1cImZyYW1lTGltaXRlckVuYWJsZWRcIlxyXG4gICAgICAgICAgOmxhYmVsPVwidCgnZnJhbWVMaW1pdGVyLmVuYWJsZScpXCJcclxuICAgICAgICAgIDpkZXNjPVwidCgnZnJhbWVMaW1pdGVyLmVuYWJsZUhpbnQnKVwiXHJcbiAgICAgICAgLz5cclxuXHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHNldHRpbmcta2V5PVwiZnJhbWVfbGltaXRlcl9wcm92aWRlclwiXHJcbiAgICAgICAgICB2LW1vZGVsPVwiZnJhbWVMaW1pdGVyUHJvdmlkZXJcIlxyXG4gICAgICAgICAgOmxhYmVsPVwidCgnZnJhbWVMaW1pdGVyLnByb3ZpZGVyTGFiZWwnKVwiXHJcbiAgICAgICAgICA6ZGVzYz1cInQoJ2ZyYW1lTGltaXRlci5wcm92aWRlckhpbnQnKVwiXHJcbiAgICAgICAgICA6b3B0aW9ucz1cInByb3ZpZGVyT3B0aW9uc1wiXHJcbiAgICAgICAgICBAdXBkYXRlOnNob3c9XCJoYW5kbGVQcm92aWRlckRyb3Bkb3duXCJcclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgICAgc2V0dGluZy1rZXk9XCJmcmFtZV9saW1pdGVyX2Zwc19saW1pdFwiXHJcbiAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5mcmFtZV9saW1pdGVyX2Zwc19saW1pdFwiXHJcbiAgICAgICAgOmxhYmVsPVwidCgnZnJhbWVMaW1pdGVyLmxpbWl0TGFiZWwnKVwiXHJcbiAgICAgICAgOmRlc2M9XCJ0KCdmcmFtZUxpbWl0ZXIubGltaXRIaW50JylcIlxyXG4gICAgICAgIDpwbGFjZWhvbGRlcj1cInQoJ2ZyYW1lTGltaXRlci5saW1pdFBsYWNlaG9sZGVyJylcIlxyXG4gICAgICAvPlxyXG5cclxuICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICBzZXR0aW5nLWtleT1cImZyYW1lX2xpbWl0ZXJfZGlzYWJsZV92c3luY1wiXHJcbiAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5mcmFtZV9saW1pdGVyX2Rpc2FibGVfdnN5bmNcIlxyXG4gICAgICAgIDpsYWJlbD1cInQoJ2ZyYW1lTGltaXRlci52c3luY1VsbG1MYWJlbCcpXCJcclxuICAgICAgICA6ZGVzYz1cIlxyXG4gICAgICAgICAgZHVtbXlQbHVnSGRyQWN0aXZlXHJcbiAgICAgICAgICAgID8gdCgnZnJhbWVMaW1pdGVyLnZzeW5jVWxsbUZvcmNlZEJ5RHVtbXlQbHVnJylcclxuICAgICAgICAgICAgOiBudmlkaWFEZXRlY3RlZCAmJiBudmNwUmVhZHlcclxuICAgICAgICAgICAgICA/IHQoJ2ZyYW1lTGltaXRlci52c3luY1VsbG1IaW50TnYnKVxyXG4gICAgICAgICAgICAgIDogdCgnZnJhbWVMaW1pdGVyLnZzeW5jVWxsbUhpbnRHZW5lcmljJylcclxuICAgICAgICBcIlxyXG4gICAgICAgIDpkaXNhYmxlZD1cImR1bW15UGx1Z0hkckFjdGl2ZVwiXHJcbiAgICAgIC8+XHJcblxyXG4gICAgICA8ZGl2IHYtaWY9XCJzaG91bGRTaG93UnRzc0NvbmZpZ1wiIGNsYXNzPVwic3BhY2UteS00XCI+XHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHYtaWY9XCJzaG93UnRzc0luc3RhbGxJbnB1dFwiXHJcbiAgICAgICAgICBzZXR0aW5nLWtleT1cInJ0c3NfaW5zdGFsbF9wYXRoXCJcclxuICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcucnRzc19pbnN0YWxsX3BhdGhcIlxyXG4gICAgICAgICAgOmxhYmVsPVwidCgnZnJhbWVMaW1pdGVyLnJ0c3NQYXRoJylcIlxyXG4gICAgICAgICAgOmRlc2M9XCJ0KCdmcmFtZUxpbWl0ZXIucnRzc1BhdGhIaW50JylcIlxyXG4gICAgICAgICAgOnBsYWNlaG9sZGVyPVwidCgnZnJhbWVMaW1pdGVyLnJ0c3NQYXRoUGxhY2Vob2xkZXInKVwiXHJcbiAgICAgICAgLz5cclxuICAgICAgICA8cCB2LWlmPVwic2hvd1J0c3NJbnN0YWxsSGludFwiIGNsYXNzPVwidGV4dC14cyB0ZXh0LXdhcm5pbmdcIj5cclxuICAgICAgICAgIHt7IHQoJ2ZyYW1lTGltaXRlci5ydHNzTWlzc2luZycpIH19XHJcbiAgICAgICAgPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXZcclxuICAgICAgICB2LWlmPVwic2hvd1N5bmNMaW1pdGVySGVscFwiXHJcbiAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWxnIGJvcmRlciBib3JkZXItcHJpbWFyeS8zMCBiZy1wcmltYXJ5LzUgcC00IHRleHQteHNcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtWzEzcHhdIGZvbnQtbWVkaXVtXCI+e3sgdCgncnRzcy5zeW5jX2xpbWl0ZXJfaGVscF9oZWFkaW5nJykgfX08L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMSBvcGFjaXR5LTgwXCI+e3sgdCgncnRzcy5zeW5jX2xpbWl0ZXJfaGVscF9ibHVyYicpIH19PC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm10LTMgZGVza3RvcC1zeW5jLXRhYmxlXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib3ZlcmZsb3cteC1hdXRvXCI+XHJcbiAgICAgICAgICAgIDxuLXRhYmxlXHJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICA6c2luZ2xlLWxpbmU9XCJmYWxzZVwiXHJcbiAgICAgICAgICAgICAgOmJvcmRlcmVkPVwiZmFsc2VcIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwibWluLXctZnVsbCB0ZXh0LWxlZnQgd2hpdGVzcGFjZS1ub3JtYWwgYnJlYWstd29yZHNcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRyXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYm9yZGVyLWIgYm9yZGVyLXByaW1hcnkvMzAgdGV4dC14cyB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJwYi0yIHByLTQgZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICAgICAgICB7eyB0KCdydHNzLnN5bmNfbGltaXRlcl9oZWxwX21vZGUnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cInBiLTIgcHItNCBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ3J0c3Muc3luY19saW1pdGVyX2hlbHBfbGF0ZW5jeScpIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwicGItMiBwci00IGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3sgdCgncnRzcy5zeW5jX2xpbWl0ZXJfaGVscF9zdHV0dGVyJykgfX1cclxuICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJwYi0yIHByLTQgZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICAgICAgICB7eyB0KCdydHNzLnN5bmNfbGltaXRlcl9oZWxwX2FkdmFudGFnZXMnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cInBiLTIgcHItNCBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ3J0c3Muc3luY19saW1pdGVyX2hlbHBfZGlzYWR2YW50YWdlcycpIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwicGItMiBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ3J0c3Muc3luY19saW1pdGVyX2hlbHBfdXNhZ2UnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgIDx0clxyXG4gICAgICAgICAgICAgICAgICB2LWZvcj1cInJvdyBpbiBzeW5jTGltaXRlckhlbHBSb3dzXCJcclxuICAgICAgICAgICAgICAgICAgOmtleT1cInJvdy5pZFwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYm9yZGVyLWIgYm9yZGVyLXByaW1hcnkvMjAgbGFzdDpib3JkZXItMFwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cInJvd1wiIGNsYXNzPVwicHktMyBwci00IHRleHQteHMgZm9udC1tZWRpdW0gYWxpZ24tdG9wXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LXNlbWlib2xkXCI+e3sgcm93LmxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJweS0zIHByLTQgYWxpZ24tdG9wIHRleHQteHNcIj57eyByb3cubGF0ZW5jeSB9fTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInB5LTMgcHItNCBhbGlnbi10b3AgdGV4dC14c1wiPnt7IHJvdy5zdHV0dGVyIH19PC90ZD5cclxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicHktMyBwci00IGFsaWduLXRvcCB0ZXh0LXhzXCI+e3sgcm93LmFkdmFudGFnZXMgfX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJweS0zIHByLTQgYWxpZ24tdG9wIHRleHQteHNcIj57eyByb3cuZGlzYWR2YW50YWdlcyB9fTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInB5LTMgYWxpZ24tdG9wIHRleHQteHNcIj57eyByb3cudXNlIH19PC90ZD5cclxuICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgPC9uLXRhYmxlPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm10LTMgc3BhY2UteS0zIG1vYmlsZS1zeW5jLWxpc3RcIj5cclxuICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgdi1mb3I9XCJyb3cgaW4gc3luY0xpbWl0ZXJIZWxwUm93c1wiXHJcbiAgICAgICAgICAgIDprZXk9XCJyb3cuaWRcIlxyXG4gICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIGJnLXByaW1hcnkvMTAgcC0zXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtWzEzcHhdIGZvbnQtc2VtaWJvbGRcIj57eyByb3cubGFiZWwgfX08L2Rpdj5cclxuICAgICAgICAgICAgPGRsIGNsYXNzPVwibXQtMiBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGR0IGNsYXNzPVwidGV4dC14cyB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgIHt7IHQoJ3J0c3Muc3luY19saW1pdGVyX2hlbHBfbGF0ZW5jeScpIH19XHJcbiAgICAgICAgICAgICAgICA8L2R0PlxyXG4gICAgICAgICAgICAgICAgPGRkIGNsYXNzPVwidGV4dC14cyBsZWFkaW5nLXNudWdcIj57eyByb3cubGF0ZW5jeSB9fTwvZGQ+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxkdCBjbGFzcz1cInRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdydHNzLnN5bmNfbGltaXRlcl9oZWxwX3N0dXR0ZXInKSB9fVxyXG4gICAgICAgICAgICAgICAgPC9kdD5cclxuICAgICAgICAgICAgICAgIDxkZCBjbGFzcz1cInRleHQteHMgbGVhZGluZy1zbnVnXCI+e3sgcm93LnN0dXR0ZXIgfX08L2RkPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZHQgY2xhc3M9XCJ0ZXh0LXhzIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgICAge3sgdCgncnRzcy5zeW5jX2xpbWl0ZXJfaGVscF9hZHZhbnRhZ2VzJykgfX1cclxuICAgICAgICAgICAgICAgIDwvZHQ+XHJcbiAgICAgICAgICAgICAgICA8ZGQgY2xhc3M9XCJ0ZXh0LXhzIGxlYWRpbmctc251Z1wiPnt7IHJvdy5hZHZhbnRhZ2VzIH19PC9kZD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGR0IGNsYXNzPVwidGV4dC14cyB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgIHt7IHQoJ3J0c3Muc3luY19saW1pdGVyX2hlbHBfZGlzYWR2YW50YWdlcycpIH19XHJcbiAgICAgICAgICAgICAgICA8L2R0PlxyXG4gICAgICAgICAgICAgICAgPGRkIGNsYXNzPVwidGV4dC14cyBsZWFkaW5nLXNudWdcIj57eyByb3cuZGlzYWR2YW50YWdlcyB9fTwvZGQ+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxkdCBjbGFzcz1cInRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyB0KCdydHNzLnN5bmNfbGltaXRlcl9oZWxwX3VzYWdlJykgfX1cclxuICAgICAgICAgICAgICAgIDwvZHQ+XHJcbiAgICAgICAgICAgICAgICA8ZGQgY2xhc3M9XCJ0ZXh0LXhzIGxlYWRpbmctc251Z1wiPnt7IHJvdy51c2UgfX08L2RkPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2RsPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHYtaWY9XCJzaG93U3luY0xpbWl0ZXJTZWxlY3RcIlxyXG4gICAgICAgICAgc2V0dGluZy1rZXk9XCJydHNzX2ZyYW1lX2xpbWl0X3R5cGVcIlxyXG4gICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy5ydHNzX2ZyYW1lX2xpbWl0X3R5cGVcIlxyXG4gICAgICAgICAgOmxhYmVsPVwidCgnZnJhbWVMaW1pdGVyLnN5bmNMaW1pdGVyTGFiZWwnKVwiXHJcbiAgICAgICAgICA6ZGVzYz1cInQoJ2ZyYW1lTGltaXRlci5zeW5jTGltaXRlckhpbnQnKVwiXHJcbiAgICAgICAgICA6b3B0aW9ucz1cInN5bmNMaW1pdGVyT3B0aW9uc1wiXHJcbiAgICAgICAgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L2ZpZWxkc2V0PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHN0eWxlIHNjb3BlZD5cclxuLmRlc2t0b3Atc3luYy10YWJsZSB7XHJcbiAgZGlzcGxheTogbm9uZTtcclxufVxyXG5cclxuLm1vYmlsZS1zeW5jLWxpc3Qge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxufVxyXG5cclxuQG1lZGlhIChtaW4td2lkdGg6IDc2OHB4KSB7XHJcbiAgLmRlc2t0b3Atc3luYy10YWJsZSB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICB9XHJcblxyXG4gIC5tb2JpbGUtc3luYy1saXN0IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgfVxyXG59XHJcbjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCByZWYsIHdhdGNoIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgdXNlSTE4biB9IGZyb20gJ3Z1ZS1pMThuJztcclxuaW1wb3J0IHsgJHRwIH0gZnJvbSAnQC9wbGF0Zm9ybS1pMThuJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJ0AvQ2hlY2tib3gudnVlJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCBQbGF0Zm9ybUxheW91dCBmcm9tICdAL1BsYXRmb3JtTGF5b3V0LnZ1ZSc7XHJcbmltcG9ydCBBZGFwdGVyTmFtZVNlbGVjdG9yIGZyb20gJ0AvY29uZmlncy90YWJzL2F1ZGlvdmlkZW8vQWRhcHRlck5hbWVTZWxlY3Rvci52dWUnO1xyXG5pbXBvcnQgRGlzcGxheU91dHB1dFNlbGVjdG9yIGZyb20gJ0AvY29uZmlncy90YWJzL2F1ZGlvdmlkZW8vRGlzcGxheU91dHB1dFNlbGVjdG9yLnZ1ZSc7XHJcbmltcG9ydCBEaXNwbGF5RGV2aWNlT3B0aW9ucyBmcm9tICdAL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0Rpc3BsYXlEZXZpY2VPcHRpb25zLnZ1ZSc7XHJcbmltcG9ydCBEaXNwbGF5TW9kZXNTZXR0aW5ncyBmcm9tICdAL2NvbmZpZ3MvdGFicy9hdWRpb3ZpZGVvL0Rpc3BsYXlNb2Rlc1NldHRpbmdzLnZ1ZSc7XHJcbmltcG9ydCBGcmFtZUxpbWl0ZXJTdGVwIGZyb20gJ0AvY29uZmlncy90YWJzL2F1ZGlvdmlkZW8vRnJhbWVMaW1pdGVyU3RlcC52dWUnO1xyXG5pbXBvcnQgeyBOU3dpdGNoLCBOUmFkaW9Hcm91cCwgTlJhZGlvIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB7IHN0b3JlVG9SZWZzIH0gZnJvbSAncGluaWEnO1xyXG5cclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgeyBjb25maWcgfSA9IHN0b3JlVG9SZWZzKHN0b3JlKTtcclxuY29uc3QgcGxhdGZvcm0gPSBjb21wdXRlZCgoKSA9PiAoY29uZmlnLnZhbHVlIGFzIGFueSk/LnBsYXRmb3JtIHx8ICcnKTtcclxuY29uc3QgZGRDb25maWdEaXNhYmxlZCA9IGNvbXB1dGVkKFxyXG4gICgpID0+IChjb25maWcudmFsdWUgYXMgYW55KT8uZGRfY29uZmlndXJhdGlvbl9vcHRpb24gPT09ICdkaXNhYmxlZCcsXHJcbik7XHJcbmNvbnN0IGZyYW1lTGltaXRlclN0ZXBMYWJlbCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgZGRDb25maWdEaXNhYmxlZC52YWx1ZSA/IHQoJ2NvbmZpZy5kZF9zdGVwXzMnKSA6IHQoJ2NvbmZpZy5kZF9zdGVwXzQnKSxcclxuKTtcclxuXHJcbi8vIFN1ZG9WREEgc3RhdHVzIG1hcHBpbmcgKEFwb2xsby1zcGVjaWZpYylcclxuY29uc3Qgc3Vkb3ZkYVN0YXR1cyA9IGNvbXB1dGVkKCgpID0+ICh7XHJcbiAgJzEnOiB0KCdjb25maWcuc3Vkb3ZkYV9zdGF0dXNfdW5rbm93bicpLFxyXG4gICcwJzogdCgnY29uZmlnLnN1ZG92ZGFfc3RhdHVzX3JlYWR5JyksXHJcbiAgJy0xJzogdCgnY29uZmlnLnN1ZG92ZGFfc3RhdHVzX3VuaW5pdGlhbGl6ZWQnKSxcclxuICAnLTInOiB0KCdjb25maWcuc3Vkb3ZkYV9zdGF0dXNfdmVyc2lvbl9pbmNvbXBhdGlibGUnKSxcclxuICAnLTMnOiB0KCdjb25maWcuc3Vkb3ZkYV9zdGF0dXNfd2F0Y2hkb2dfZmFpbGVkJyksXHJcbn0pKTtcclxuY29uc3QgdmRpc3BsYXkgPSBjb21wdXRlZCgoKSA9PiAoY29uZmlnIGFzIGFueSk/LnZkaXNwbGF5IHx8IDApO1xyXG5jb25zdCBjdXJyZW50RHJpdmVyU3RhdHVzID0gY29tcHV0ZWQoXHJcbiAgKCkgPT5cclxuICAgIHN1ZG92ZGFTdGF0dXMudmFsdWVbU3RyaW5nKHZkaXNwbGF5LnZhbHVlKSBhcyBrZXlvZiB0eXBlb2Ygc3Vkb3ZkYVN0YXR1cy52YWx1ZV0gfHxcclxuICAgIHQoJ2NvbmZpZy5zdWRvdmRhX3N0YXR1c191bmtub3duJyksXHJcbik7XHJcblxyXG5jb25zdCBsYXN0QXV0b21hdGlvbk9wdGlvbiA9IHJlZigndmVyaWZ5X29ubHknKTtcclxud2F0Y2goXHJcbiAgKCkgPT4gY29uZmlnLnZhbHVlPy5kZF9jb25maWd1cmF0aW9uX29wdGlvbixcclxuICAobmV4dCkgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBuZXh0ID09PSAnc3RyaW5nJyAmJiBuZXh0ICE9PSAnZGlzYWJsZWQnKSB7XHJcbiAgICAgIGxhc3RBdXRvbWF0aW9uT3B0aW9uLnZhbHVlID0gbmV4dDtcclxuICAgIH1cclxuICB9LFxyXG4gIHsgaW1tZWRpYXRlOiB0cnVlIH0sXHJcbik7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBjb25maWcudmFsdWU/LnZpcnR1YWxfZGlzcGxheV9tb2RlLFxyXG4gIChuZXh0LCBwcmV2KSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIG5leHQgPT09ICdzdHJpbmcnICYmIG5leHQgIT09ICdkaXNhYmxlZCcgJiYgcHJldiA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgICBjb25zdCBjdXJyZW50TGF5b3V0ID0gY29uZmlnLnZhbHVlPy5bJ3ZpcnR1YWxfZGlzcGxheV9sYXlvdXQnXTtcclxuICAgICAgaWYgKCFjdXJyZW50TGF5b3V0IHx8IGN1cnJlbnRMYXlvdXQgPT09ICdkaXNhYmxlZCcpIHtcclxuICAgICAgICBzdG9yZS51cGRhdGVPcHRpb24oJ3ZpcnR1YWxfZGlzcGxheV9sYXlvdXQnLCAnZXhjbHVzaXZlJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxuY29uc3QgZGlzcGxheUF1dG9tYXRpb25FbmFibGVkID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldCgpIHtcclxuICAgIHJldHVybiBjb25maWcudmFsdWU/LmRkX2NvbmZpZ3VyYXRpb25fb3B0aW9uICE9PSAnZGlzYWJsZWQnO1xyXG4gIH0sXHJcbiAgc2V0KGVuYWJsZWQpIHtcclxuICAgIGlmICghY29uZmlnLnZhbHVlKSByZXR1cm47XHJcbiAgICBpZiAoIWVuYWJsZWQpIHtcclxuICAgICAgY29uc3QgbmV4dCA9ICdkaXNhYmxlZCc7XHJcbiAgICAgIGlmICh0eXBlb2Ygc3RvcmUudXBkYXRlT3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgc3RvcmUudXBkYXRlT3B0aW9uKCdkZF9jb25maWd1cmF0aW9uX29wdGlvbicsIG5leHQgYXMgYW55KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAoY29uZmlnLnZhbHVlIGFzIGFueSkuZGRfY29uZmlndXJhdGlvbl9vcHRpb24gPSBuZXh0IGFzIGFueTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbmZpZy52YWx1ZS5kZF9jb25maWd1cmF0aW9uX29wdGlvbiA9PT0gJ2Rpc2FibGVkJykge1xyXG4gICAgICBjb25zdCBmYWxsYmFjayA9IGxhc3RBdXRvbWF0aW9uT3B0aW9uLnZhbHVlIHx8ICd2ZXJpZnlfb25seSc7XHJcbiAgICAgIGNvbnN0IG5leHQgPSBmYWxsYmFjayA9PT0gJ2Rpc2FibGVkJyA/ICd2ZXJpZnlfb25seScgOiBmYWxsYmFjaztcclxuICAgICAgaWYgKHR5cGVvZiBzdG9yZS51cGRhdGVPcHRpb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBzdG9yZS51cGRhdGVPcHRpb24oJ2RkX2NvbmZpZ3VyYXRpb25fb3B0aW9uJywgbmV4dCBhcyBhbnkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIChjb25maWcudmFsdWUgYXMgYW55KS5kZF9jb25maWd1cmF0aW9uX29wdGlvbiA9IG5leHQgYXMgYW55O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCB2aXJ0dWFsRGlzcGxheU1vZGUgPSBjb21wdXRlZDwnZGlzYWJsZWQnIHwgJ3Blcl9jbGllbnQnIHwgJ3NoYXJlZCc+KHtcclxuICBnZXQoKSB7XHJcbiAgICBjb25zdCBtb2RlID0gY29uZmlnLnZhbHVlPy5bJ3ZpcnR1YWxfZGlzcGxheV9tb2RlJ107XHJcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGlmIChtb2RlID09PSAnZGlzYWJsZWQnIHx8IG1vZGUgPT09ICdwZXJfY2xpZW50JyB8fCBtb2RlID09PSAnc2hhcmVkJykge1xyXG4gICAgICAgIHJldHVybiBtb2RlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJ2Rpc2FibGVkJztcclxuICB9LFxyXG4gIHNldChtb2RlKSB7XHJcbiAgICBpZiAoIWNvbmZpZy52YWx1ZSkgcmV0dXJuO1xyXG4gICAgc3RvcmUudXBkYXRlT3B0aW9uKCd2aXJ0dWFsX2Rpc3BsYXlfbW9kZScsIG1vZGUpO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgdmlydHVhbERpc3BsYXlMYXlvdXQgPSBjb21wdXRlZDxcclxuICAnZXhjbHVzaXZlJyB8ICdleHRlbmRlZCcgfCAnZXh0ZW5kZWRfcHJpbWFyeScgfCAnZXh0ZW5kZWRfaXNvbGF0ZWQnIHwgJ2V4dGVuZGVkX3ByaW1hcnlfaXNvbGF0ZWQnXHJcbj4oe1xyXG4gIGdldCgpIHtcclxuICAgIGNvbnN0IGxheW91dCA9IGNvbmZpZy52YWx1ZT8uWyd2aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0J107XHJcbiAgICBpZiAoXHJcbiAgICAgIGxheW91dCA9PT0gJ2V4dGVuZGVkJyB8fFxyXG4gICAgICBsYXlvdXQgPT09ICdleHRlbmRlZF9wcmltYXJ5JyB8fFxyXG4gICAgICBsYXlvdXQgPT09ICdleHRlbmRlZF9pc29sYXRlZCcgfHxcclxuICAgICAgbGF5b3V0ID09PSAnZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCdcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gbGF5b3V0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuICdleGNsdXNpdmUnO1xyXG4gIH0sXHJcbiAgc2V0KGxheW91dCkge1xyXG4gICAgaWYgKCFjb25maWcudmFsdWUpIHJldHVybjtcclxuICAgIHN0b3JlLnVwZGF0ZU9wdGlvbigndmlydHVhbF9kaXNwbGF5X2xheW91dCcsIGxheW91dCk7XHJcbiAgfSxcclxufSk7XHJcblxyXG5jb25zdCB2aXJ0dWFsRGlzcGxheUxheW91dE9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAge1xyXG4gICAgdmFsdWU6ICdleGNsdXNpdmUnLFxyXG4gICAgbGFiZWw6IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4Y2x1c2l2ZScpICsgJyAoZGVmYXVsdCknLFxyXG4gICAgZGVzY3JpcHRpb246IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4Y2x1c2l2ZV9kZXNjJyksXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogJ2V4dGVuZGVkJyxcclxuICAgIGxhYmVsOiB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9leHRlbmRlZCcpLFxyXG4gICAgZGVzY3JpcHRpb246IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4dGVuZGVkX2Rlc2MnKSxcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiAnZXh0ZW5kZWRfcHJpbWFyeScsXHJcbiAgICBsYWJlbDogdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfZXh0ZW5kZWRfcHJpbWFyeScpLFxyXG4gICAgZGVzY3JpcHRpb246IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4dGVuZGVkX3ByaW1hcnlfZGVzYycpLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6ICdleHRlbmRlZF9pc29sYXRlZCcsXHJcbiAgICBsYWJlbDogdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfZXh0ZW5kZWRfaXNvbGF0ZWQnKSxcclxuICAgIGRlc2NyaXB0aW9uOiB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9leHRlbmRlZF9pc29sYXRlZF9kZXNjJyksXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogJ2V4dGVuZGVkX3ByaW1hcnlfaXNvbGF0ZWQnLFxyXG4gICAgbGFiZWw6IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2V4dGVuZGVkX3ByaW1hcnlfaXNvbGF0ZWQnKSxcclxuICAgIGRlc2NyaXB0aW9uOiB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9leHRlbmRlZF9wcmltYXJ5X2lzb2xhdGVkX2Rlc2MnKSxcclxuICB9LFxyXG5dKTtcclxuXHJcbmZ1bmN0aW9uIHNlbGVjdFZpcnR1YWxEaXNwbGF5TGF5b3V0KHY6IHVua25vd24pIHtcclxuICBjb25zdCBzdiA9IFN0cmluZyh2KTtcclxuICBjb25zdCBvcHRzID0gdmlydHVhbERpc3BsYXlMYXlvdXRPcHRpb25zLnZhbHVlLm1hcCgobykgPT4gby52YWx1ZSk7XHJcbiAgaWYgKG9wdHMuaW5jbHVkZXMoc3YpKSB7XHJcbiAgICB2aXJ0dWFsRGlzcGxheUxheW91dC52YWx1ZSA9IHN2IGFzIGFueTtcclxuICB9XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cImF2XCIgY2xhc3M9XCJjb25maWctcGFnZVwiPlxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgc2V0dGluZy1rZXk9XCJhdWRpb19zaW5rXCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5hdWRpb19zaW5rXCJcclxuICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgICAgOmRlc2M9XCIkdHAoJ2NvbmZpZy5hdWRpb19zaW5rX2Rlc2MnKVwiXHJcbiAgICAgIDpwbGFjZWhvbGRlcj1cIlxyXG4gICAgICAgICR0cCgnY29uZmlnLmF1ZGlvX3NpbmtfcGxhY2Vob2xkZXInLCAnYWxzYV9vdXRwdXQucGNpLTAwMDBfMDlfMDAuMy5hbmFsb2ctc3RlcmVvJylcclxuICAgICAgXCJcclxuICAgID5cclxuICAgICAgPGJyIC8+XHJcbiAgICAgIDxQbGF0Zm9ybUxheW91dD5cclxuICAgICAgICA8dGVtcGxhdGUgI3dpbmRvd3M+XHJcbiAgICAgICAgICA8cHJlPnRvb2xzXFxhdWRpby1pbmZvLmV4ZTwvcHJlPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgPHRlbXBsYXRlICNmcmVlYnNkPlxyXG4gICAgICAgICAgPHByZT5wYWNtZCBsaXN0LXNpbmtzIHwgZ3JlcCBcIm5hbWU6XCI8L3ByZT5cclxuICAgICAgICAgIDxwcmU+cGFjdGwgaW5mbyB8IGdyZXAgU291cmNlPC9wcmU+XHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICA8dGVtcGxhdGUgI2xpbnV4PlxyXG4gICAgICAgICAgPHByZT5wYWNtZCBsaXN0LXNpbmtzIHwgZ3JlcCBcIm5hbWU6XCI8L3ByZT5cclxuICAgICAgICAgIDxwcmU+cGFjdGwgaW5mbyB8IGdyZXAgU291cmNlPC9wcmU+XHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICA8dGVtcGxhdGUgI21hY29zPlxyXG4gICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0aW5nYWxscy9Tb3VuZGZsb3dlclwiIHRhcmdldD1cIl9ibGFua1wiPlNvdW5kZmxvd2VyPC9hPjxiciAvPlxyXG4gICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9FeGlzdGVudGlhbEF1ZGlvL0JsYWNrSG9sZVwiIHRhcmdldD1cIl9ibGFua1wiPkJsYWNrSG9sZTwvYT4uXHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgPC9QbGF0Zm9ybUxheW91dD5cclxuICAgIDwvQ29uZmlnRmllbGRSZW5kZXJlcj5cclxuXHJcbiAgICA8UGxhdGZvcm1MYXlvdXQ+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjd2luZG93cz5cclxuICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgc2V0dGluZy1rZXk9XCJ2aXJ0dWFsX3NpbmtcIlxyXG4gICAgICAgICAgdi1tb2RlbD1cImNvbmZpZy52aXJ0dWFsX3NpbmtcIlxyXG4gICAgICAgICAgY2xhc3M9XCJtYi02XCJcclxuICAgICAgICAgIDpwbGFjZWhvbGRlcj1cIiR0KCdjb25maWcudmlydHVhbF9zaW5rX3BsYWNlaG9sZGVyJylcIlxyXG4gICAgICAgIC8+XHJcblxyXG4gICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgICAgICBzZXR0aW5nLWtleT1cImluc3RhbGxfc3RlYW1fYXVkaW9fZHJpdmVyc1wiXHJcbiAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLmluc3RhbGxfc3RlYW1fYXVkaW9fZHJpdmVyc1wiXHJcbiAgICAgICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgICAgIC8+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICA8L1BsYXRmb3JtTGF5b3V0PlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwic3RyZWFtX2F1ZGlvXCIgdi1tb2RlbD1cImNvbmZpZy5zdHJlYW1fYXVkaW9cIiBjbGFzcz1cIm1iLTNcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHYtaWY9XCJjb25maWcuc3RyZWFtX2F1ZGlvID09PSAnZW5hYmxlZCdcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cImtlZXBfc2lua19kZWZhdWx0XCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5rZWVwX3NpbmtfZGVmYXVsdFwiXHJcbiAgICAgIGNsYXNzPVwibWItM1wiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHYtaWY9XCJjb25maWcuc3RyZWFtX2F1ZGlvID09PSAnZW5hYmxlZCdcIlxyXG4gICAgICBzZXR0aW5nLWtleT1cImF1dG9fY2FwdHVyZV9zaW5rXCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5hdXRvX2NhcHR1cmVfc2lua1wiXHJcbiAgICAgIGNsYXNzPVwibWItNlwiXHJcbiAgICAvPlxyXG5cclxuICAgIDxBZGFwdGVyTmFtZVNlbGVjdG9yIC8+XHJcblxyXG4gICAgPCEtLSBEaXNwbGF5IGNvbmZpZ3VyYXRpb246IGNsZWFyLCBndWlkZWQsIHByZS1zdHJlYW0gZm9jdXNlZCAtLT5cclxuICAgIDxzZWN0aW9uIGNsYXNzPVwibWItOFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwicm91bmRlZC1tZCBvdmVyZmxvdy1oaWRkZW4gYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImJnLXN1cmZhY2UvNDAgcHgtNCBweS0zXCI+XHJcbiAgICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+e3sgJHQoJ2NvbmZpZy5kZF9kaXNwbGF5X3NldHVwX3RpdGxlJykgfX08L2gzPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbXQtMVwiPlxyXG4gICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX2Rpc3BsYXlfc2V0dXBfaW50cm8nKSB9fVxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicC00XCI+XHJcbiAgICAgICAgICA8IS0tIFN0ZXAgMTogV2hpY2ggZGlzcGxheSB0byBjYXB0dXJlIC0tPlxyXG4gICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwibWItNCBib3JkZXIgYm9yZGVyLWRhcmsvMzUgZGFyazpib3JkZXItbGlnaHQvMjUgcm91bmRlZC14bCBwLTRcIj5cclxuICAgICAgICAgICAgPGxlZ2VuZCBjbGFzcz1cInB4LTIgdGV4dC1zbSBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCdjb25maWcuZGRfc3RlcF8xJykgfX06IHt7ICR0KCdjb25maWcuZGRfY2hvb3NlX2Rpc3BsYXknKSB9fVxyXG4gICAgICAgICAgICA8L2xlZ2VuZD5cclxuICAgICAgICAgICAgPCEtLSBIaWdobGlnaHQgZHJpdmVyIGhlYWx0aCBiZWZvcmUgcGlja2luZyBhIG1vZGUgLS0+XHJcbiAgICAgICAgICAgIDxQbGF0Zm9ybUxheW91dD5cclxuICAgICAgICAgICAgICA8dGVtcGxhdGUgI3dpbmRvd3M+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtM1wiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJweC00IHB5LTMgcm91bmRlZC1tZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmNsYXNzPVwiW1xyXG4gICAgICAgICAgICAgICAgICAgICAgdmRpc3BsYXkgPyAnYmctd2FybmluZy8xMCB0ZXh0LXdhcm5pbmcnIDogJ2JnLXN1Y2Nlc3MvMTAgdGV4dC1zdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICBdXCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1jaXJjbGUtaW5mb1wiIDpzaXplPVwiMTRcIiBjbGFzcz1cIm1yLTJcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfc3RhdHVzX2xhYmVsJykgfX0ge3sgY3VycmVudERyaXZlclN0YXR1cyB9fVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHAgdi1pZj1cInZkaXNwbGF5XCIgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbXQtMiBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X3N0YXR1c19oaW50JykgfX1cclxuICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgPC9QbGF0Zm9ybUxheW91dD5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbXQtMiBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9tb2RlX3N0ZXBfaGludCcpIH19XHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPG4tcmFkaW8tZ3JvdXAgdi1tb2RlbDp2YWx1ZT1cInZpcnR1YWxEaXNwbGF5TW9kZVwiIGNsYXNzPVwiZ3JpZCBnYXAtMiBzbTpncmlkLWNvbHMtM1wiPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvIHZhbHVlPVwiZGlzYWJsZWRcIj5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfZGlzYWJsZWQnKSB9fVxyXG4gICAgICAgICAgICAgIDwvbi1yYWRpbz5cclxuICAgICAgICAgICAgICA8bi1yYWRpbyB2YWx1ZT1cInBlcl9jbGllbnRcIj5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfcGVyX2NsaWVudCcpIH19XHJcbiAgICAgICAgICAgICAgPC9uLXJhZGlvPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvIHZhbHVlPVwic2hhcmVkXCI+XHJcbiAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9tb2RlX3NoYXJlZCcpIH19XHJcbiAgICAgICAgICAgICAgPC9uLXJhZGlvPlxyXG4gICAgICAgICAgICA8L24tcmFkaW8tZ3JvdXA+XHJcbiAgICAgICAgICAgIDxQbGF0Zm9ybUxheW91dD5cclxuICAgICAgICAgICAgICA8dGVtcGxhdGUgI3dpbmRvd3M+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtNCBib3JkZXItbC0yIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHBsLTNcIj5cclxuICAgICAgICAgICAgICAgICAgPENoZWNrYm94XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJkZF93YV92aXJ0dWFsX2RvdWJsZV9yZWZyZXNoXCJcclxuICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLmRkX3dhX3ZpcnR1YWxfZG91YmxlX3JlZnJlc2hcIlxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZS1wcmVmaXg9XCJjb25maWdcIlxyXG4gICAgICAgICAgICAgICAgICAgIDpkZWZhdWx0PVwidHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwidmlydHVhbERpc3BsYXlNb2RlID09PSAnZGlzYWJsZWQnXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDwvUGxhdGZvcm1MYXlvdXQ+XHJcbiAgICAgICAgICAgIDxkaXYgdi1pZj1cInZpcnR1YWxEaXNwbGF5TW9kZSA9PT0gJ2Rpc2FibGVkJ1wiIGNsYXNzPVwibXQtM1wiPlxyXG4gICAgICAgICAgICAgIDxEaXNwbGF5T3V0cHV0U2VsZWN0b3IgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwibXQtMyBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2xhYmVsJykgfX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MCBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAgICAgIHt7ICR0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9oaW50JykgfX1cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgPG4tcmFkaW8tZ3JvdXAgdi1tb2RlbDp2YWx1ZT1cInZpcnR1YWxEaXNwbGF5TGF5b3V0XCIgY2xhc3M9XCJzcGFjZS15LTRcIj5cclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgdi1mb3I9XCJvcHRpb24gaW4gdmlydHVhbERpc3BsYXlMYXlvdXRPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgOmtleT1cIm9wdGlvbi52YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZmxleCBmbGV4LWNvbCBjdXJzb3ItcG9pbnRlciBweS0yIHB4LTIgcm91bmRlZC1tZCBob3ZlcjpiZy1zdXJmYWNlLzEwXCJcclxuICAgICAgICAgICAgICAgICAgQGNsaWNrLnByZXZlbnQ9XCJzZWxlY3RWaXJ0dWFsRGlzcGxheUxheW91dChvcHRpb24udmFsdWUpXCJcclxuICAgICAgICAgICAgICAgICAgQGtleWRvd24uZW50ZXIucHJldmVudD1cInNlbGVjdFZpcnR1YWxEaXNwbGF5TGF5b3V0KG9wdGlvbi52YWx1ZSlcIlxyXG4gICAgICAgICAgICAgICAgICBAa2V5ZG93bi5zcGFjZS5wcmV2ZW50PVwic2VsZWN0VmlydHVhbERpc3BsYXlMYXlvdXQob3B0aW9uLnZhbHVlKVwiXHJcbiAgICAgICAgICAgICAgICAgIHRhYmluZGV4PVwiMFwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxuLXJhZGlvIDp2YWx1ZT1cIm9wdGlvbi52YWx1ZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIj57eyBvcHRpb24ubGFiZWwgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MCBsZWFkaW5nLXNudWcgbWwtNlwiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9uLXJhZGlvLWdyb3VwPlxyXG5cclxuICAgICAgICAgICAgICA8IS0tIFdhcm5pbmcgZm9yIGV4dGVuZGVkIG1vZGVzIHdpdGhvdXQgcHJpbWFyeSAtLT5cclxuICAgICAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICB2LWlmPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmlydHVhbERpc3BsYXlMYXlvdXQgPT09ICdleHRlbmRlZCcgfHxcclxuICAgICAgICAgICAgICAgICAgICB2aXJ0dWFsRGlzcGxheUxheW91dCA9PT0gJ2V4dGVuZGVkX2lzb2xhdGVkJ1xyXG4gICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cIm10LTMgcm91bmRlZC1sZyBiZy1hbWJlci01MCBkYXJrOmJnLWFtYmVyLTk1MC8zMCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBkYXJrOmJvcmRlci1hbWJlci04MDAgcC0zXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYW1iZXItOTAwIGRhcms6dGV4dC1hbWJlci0xMDBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1leGNsYW1hdGlvbi10cmlhbmdsZVwiIDpzaXplPVwiMTRcIiBjbGFzcz1cInRleHQtYW1iZXItNjAwIGRhcms6dGV4dC1hbWJlci00MDAgZmxleC1zaHJpbmstMCBtdC0wLjVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJibG9ja1wiPnt7ICR0KCdjb25maWcuZGRfY29uZmlnX2Vuc3VyZV9hY3RpdmVfd2FybmluZycpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC90cmFuc2l0aW9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDwhLS0gSERSIENhbGlicmF0aW9uIFRpcCBmb3IgcGVyLWNsaWVudCB2aXJ0dWFsIGRpc3BsYXkgLS0+XHJcbiAgICAgICAgICAgIDx0cmFuc2l0aW9uIG5hbWU9XCJmYWRlXCI+XHJcbiAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgdi1pZj1cInZpcnR1YWxEaXNwbGF5TW9kZSA9PT0gJ3Blcl9jbGllbnQnXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibXQtNCByb3VuZGVkLWxnIGJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTk1MC8zMCBib3JkZXIgYm9yZGVyLWJsdWUtMjAwIGRhcms6Ym9yZGVyLWJsdWUtODAwIHAtM1wiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYmx1ZS05MDAgZGFyazp0ZXh0LWJsdWUtMTAwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydCBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1saWdodGJ1bGJcIiA6c2l6ZT1cIjE0XCIgY2xhc3M9XCJ0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCBmbGV4LXNocmluay0wIG10LTAuNVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJibG9ja1wiPnt7ICR0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2hkcl90aXAnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcblxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJtdC00IGZsZXggZmxleC1jb2wgZ2FwLTMgc206ZmxleC1yb3cgc206aXRlbXMtY2VudGVyIHNtOmp1c3RpZnktYmV0d2VlbiBzbTpnYXAtNFwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtc20gZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5kZF9hdXRvbWF0aW9uX2xhYmVsJykgfX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbXQtMSBtYXgtdy14bFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyAkdCgnY29uZmlnLmRkX2F1dG9tYXRpb25fZGVzYycpIH19XHJcbiAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPG4tc3dpdGNoXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiZGlzcGxheUF1dG9tYXRpb25FbmFibGVkXCJcclxuICAgICAgICAgICAgICAgIHNpemU9XCJtZWRpdW1cIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJzZWxmLXN0YXJ0IHNtOnNlbGYtY2VudGVyXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI2NoZWNrZWQ+e3sgJHQoJ19jb21tb24uZW5hYmxlZCcpIH19PC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjdW5jaGVja2VkPnt7ICR0KCdfY29tbW9uLmRpc2FibGVkJykgfX08L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgIDwvbi1zd2l0Y2g+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibXktNCBib3JkZXItdCBib3JkZXItZGFyay81IGRhcms6Ym9yZGVyLWxpZ2h0LzVcIiAvPlxyXG5cclxuICAgICAgICAgIDwhLS0gU3RlcCAyOiBXaGF0IHRvIGRvIGJlZm9yZSB0aGUgc3RyZWFtIHN0YXJ0cyAtLT5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxEaXNwbGF5RGV2aWNlT3B0aW9ucyBzZWN0aW9uPVwicHJlXCIgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJteS00IGJvcmRlci10IGJvcmRlci1kYXJrLzUgZGFyazpib3JkZXItbGlnaHQvNVwiIC8+XHJcblxyXG4gICAgICAgICAgPCEtLSBTdGVwIDM6IE9wdGlvbmFsIGFkanVzdG1lbnRzIC0tPlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPERpc3BsYXlEZXZpY2VPcHRpb25zIHNlY3Rpb249XCJvcHRpb25zXCIgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJteS00IGJvcmRlci10IGJvcmRlci1kYXJrLzUgZGFyazpib3JkZXItbGlnaHQvNVwiIC8+XHJcblxyXG4gICAgICAgICAgPEZyYW1lTGltaXRlclN0ZXAgOnN0ZXAtbGFiZWw9XCJmcmFtZUxpbWl0ZXJTdGVwTGFiZWxcIiAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICA8IS0tIERpc3BsYXkgTW9kZXMgLS0+XHJcbiAgICA8RGlzcGxheU1vZGVzU2V0dGluZ3MgLz5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5kaXNwbGF5LW1vZGUtb3B0aW9uIHtcclxuICBAYXBwbHkgYmxvY2sgdy1mdWxsIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHB4LTQgcHktMyB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1jb2xvcnM7XHJcbiAgbWluLWhlaWdodDogNTZweDtcclxufVxyXG5cclxuLmRpc3BsYXktbW9kZS1vcHRpb24gOmRlZXAoLm4tcmFkaW9fX2xhYmVsKSB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgQGFwcGx5IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zO1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxufVxyXG5cclxuLmRpc3BsYXktbW9kZS1vcHRpb24gOmRlZXAoLm4tcmFkaW9fX2luZGljYXRvcikge1xyXG4gIEBhcHBseSBmbGV4LXNocmluay0wO1xyXG59XHJcbjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG5jb25zdCBwbGF0Zm9ybSA9IGNvbXB1dGVkKCgpID0+IGNvbmZpZy5wbGF0Zm9ybSB8fCAnJyk7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxkaXYgaWQ9XCJudmlkaWEtbnZlbmMtZW5jb2RlclwiIGNsYXNzPVwiY29uZmlnLXBhZ2VcIj5cclxuICAgIDxoZWFkZXIgY2xhc3M9XCJzZWN0aW9uLWhlYWRlclwiPlxyXG4gICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAge3sgJHQoJ2NvbmZpZy5udmVuY19zZWN0aW9uX3RpdGxlJykgfHwgJ05WSURJQSBOVkVOQyBFbmNvZGVyJyB9fVxyXG4gICAgICA8L2gzPlxyXG4gICAgICA8cFxyXG4gICAgICAgIHYtaWY9XCIkdCgnY29uZmlnLm52ZW5jX3NlY3Rpb25fZGVzYycpICE9PSAnY29uZmlnLm52ZW5jX3NlY3Rpb25fZGVzYydcIlxyXG4gICAgICAgIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIG10LTFcIlxyXG4gICAgICA+XHJcbiAgICAgICAge3sgJHQoJ2NvbmZpZy5udmVuY19zZWN0aW9uX2Rlc2MnKSB9fVxyXG4gICAgICA8L3A+XHJcbiAgICA8L2hlYWRlcj5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cIm52ZW5jX3ByZXNldFwiIHYtbW9kZWw9XCJjb25maWcubnZlbmNfcHJlc2V0XCIgY2xhc3M9XCJtYi00XCIgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cIm52ZW5jX3R3b3Bhc3NcIiB2LW1vZGVsPVwiY29uZmlnLm52ZW5jX3R3b3Bhc3NcIiBjbGFzcz1cIm1iLTRcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwibnZlbmNfc3BhdGlhbF9hcVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcubnZlbmNfc3BhdGlhbF9hcVwiXHJcbiAgICAgIGNsYXNzPVwibWItM1wiXHJcbiAgICAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyXHJcbiAgICAgIHNldHRpbmcta2V5PVwibnZlbmNfc3BsaXRfZW5jb2RlXCJcclxuICAgICAgdi1tb2RlbD1cImNvbmZpZy5udmVuY19zcGxpdF9lbmNvZGVcIlxyXG4gICAgICBjbGFzcz1cIm1iLTRcIlxyXG4gICAgLz5cclxuXHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cIm52ZW5jX3Zidl9pbmNyZWFzZVwiXHJcbiAgICAgIHYtbW9kZWw9XCJjb25maWcubnZlbmNfdmJ2X2luY3JlYXNlXCJcclxuICAgICAgY2xhc3M9XCJtYi00XCJcclxuICAgID5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJtdC0yIGlubGluZS1mbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTEgdGV4dC14cyBvcGFjaXR5LTgwXCI+XHJcbiAgICAgICAgPHNwYW4+TGVhcm4gbW9yZTo8L3NwYW4+XHJcbiAgICAgICAgPGFcclxuICAgICAgICAgIGNsYXNzPVwidGV4dC1wcmltYXJ5IHVuZGVybGluZSBkZWNvcmF0aW9uLXByaW1hcnkvNDAgdW5kZXJsaW5lLW9mZnNldC0yXCJcclxuICAgICAgICAgIGhyZWY9XCJodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9WaWRlb19idWZmZXJpbmdfdmVyaWZpZXJcIlxyXG4gICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIFZCVi9IUkRcclxuICAgICAgICA8L2E+XHJcbiAgICAgIDwvc3Bhbj5cclxuICAgIDwvQ29uZmlnRmllbGRSZW5kZXJlcj5cclxuXHJcbiAgICA8ZGl2IGNsYXNzPVwibWItNCByb3VuZGVkLW1kIG92ZXJmbG93LWhpZGRlbiBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTBcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImJnLXN1cmZhY2UvNDAgZGFyazpiZy1zdXJmYWNlLzMwIHB4LTQgcHktM1wiPlxyXG4gICAgICAgIDxoMyBjbGFzcz1cInRleHQtc20gZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgIHt7ICR0KCdjb25maWcubWlzYycpIH19XHJcbiAgICAgICAgPC9oMz5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJwLTRcIj5cclxuICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgdi1pZj1cInBsYXRmb3JtID09PSAnd2luZG93cydcIlxyXG4gICAgICAgICAgc2V0dGluZy1rZXk9XCJudmVuY19yZWFsdGltZV9oYWdzXCJcclxuICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcubnZlbmNfcmVhbHRpbWVfaGFnc1wiXHJcbiAgICAgICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibXQtMiBpbmxpbmUtZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC0xIHRleHQteHMgb3BhY2l0eS04MFwiPlxyXG4gICAgICAgICAgICA8c3Bhbj5MZWFybiBtb3JlOjwvc3Bhbj5cclxuICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICBjbGFzcz1cInRleHQtcHJpbWFyeSB1bmRlcmxpbmUgZGVjb3JhdGlvbi1wcmltYXJ5LzQwIHVuZGVybGluZS1vZmZzZXQtMlwiXHJcbiAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZGV2YmxvZ3MubWljcm9zb2Z0LmNvbS9kaXJlY3R4L2hhcmR3YXJlLWFjY2VsZXJhdGVkLWdwdS1zY2hlZHVsaW5nL1wiXHJcbiAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIEhBR1NcclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgIDwvQ29uZmlnRmllbGRSZW5kZXJlcj5cclxuXHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCJcclxuICAgICAgICAgIHNldHRpbmcta2V5PVwibnZlbmNfbGF0ZW5jeV9vdmVyX3Bvd2VyXCJcclxuICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcubnZlbmNfbGF0ZW5jeV9vdmVyX3Bvd2VyXCJcclxuICAgICAgICAgIGNsYXNzPVwibWItM1wiXHJcbiAgICAgICAgLz5cclxuXHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCJcclxuICAgICAgICAgIHNldHRpbmcta2V5PVwibnZlbmNfb3BlbmdsX3Z1bGthbl9vbl9keGdpXCJcclxuICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcubnZlbmNfb3BlbmdsX3Z1bGthbl9vbl9keGdpXCJcclxuICAgICAgICAgIGNsYXNzPVwibWItM1wiXHJcbiAgICAgICAgLz5cclxuXHJcbiAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXJcclxuICAgICAgICAgIHNldHRpbmcta2V5PVwibnZlbmNfaDI2NF9jYXZsY1wiXHJcbiAgICAgICAgICB2LW1vZGVsPVwiY29uZmlnLm52ZW5jX2gyNjRfY2F2bGNcIlxyXG4gICAgICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgICAgICAvPlxyXG5cclxuICAgICAgICA8IS0tIE5WRU5DIEludHJhIFJlZnJlc2ggLS0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1iLTRcIj5cclxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJudmVuY19pbnRyYV9yZWZyZXNoXCIgY2xhc3M9XCJmb3JtLWxhYmVsXCI+e3tcclxuICAgICAgICAgICAgJHQoJ2NvbmZpZy5udmVuY19pbnRyYV9yZWZyZXNoJylcclxuICAgICAgICAgIH19PC9sYWJlbD5cclxuICAgICAgICAgIDxuLXNlbGVjdFxyXG4gICAgICAgICAgICBpZD1cIm52ZW5jX2ludHJhX3JlZnJlc2hcIlxyXG4gICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29uZmlnLm52ZW5jX2ludHJhX3JlZnJlc2hcIlxyXG4gICAgICAgICAgICA6b3B0aW9ucz1cIltcclxuICAgICAgICAgICAgICB7IGxhYmVsOiAkdCgnX2NvbW1vbi5hdXRvJyksIHZhbHVlOiAnZGlzYWJsZWQnIH0sXHJcbiAgICAgICAgICAgICAgeyBsYWJlbDogJHQoJ19jb21tb24uZW5hYmxlZCcpLCB2YWx1ZTogJ2VuYWJsZWQnIH0sXHJcbiAgICAgICAgICAgIF1cIlxyXG4gICAgICAgICAgICA6ZGF0YS1zZWFyY2gtb3B0aW9ucz1cIlxyXG4gICAgICAgICAgICAgIFskdCgnX2NvbW1vbi5hdXRvJykgKyAnOjpkaXNhYmxlZCcsICR0KCdfY29tbW9uLmVuYWJsZWQnKSArICc6OmVuYWJsZWQnXS5qb2luKCd8JylcclxuICAgICAgICAgICAgXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MCBtdC0xXCI+e3sgJHQoJ2NvbmZpZy5udmVuY19pbnRyYV9yZWZyZXNoX2Rlc2MnKSB9fTwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5zZWN0aW9uLWhlYWRlciB7XHJcbiAgQGFwcGx5IG1iLTQ7XHJcbn1cclxuPC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGlkPVwiaW50ZWwtcXVpY2tzeW5jLWVuY29kZXJcIiBjbGFzcz1cImNvbmZpZy1wYWdlXCI+XHJcbiAgICA8aGVhZGVyIGNsYXNzPVwic2VjdGlvbi1oZWFkZXJcIj5cclxuICAgICAgPGgzIGNsYXNzPVwidGV4dC1zbSBmb250LW1lZGl1bVwiPlxyXG4gICAgICAgIEludGVsIEVuY29kZXJcclxuICAgICAgPC9oMz5cclxuICAgIDwvaGVhZGVyPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwicXN2X3ByZXNldFwiIHYtbW9kZWw9XCJjb25maWcucXN2X3ByZXNldFwiIGNsYXNzPVwibWItNFwiIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJxc3ZfY29kZXJcIiB2LW1vZGVsPVwiY29uZmlnLnFzdl9jb2RlclwiIGNsYXNzPVwibWItNFwiIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJxc3Zfc2xvd19oZXZjXCIgdi1tb2RlbD1cImNvbmZpZy5xc3Zfc2xvd19oZXZjXCIgY2xhc3M9XCJtYi0wXCIgLz5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5zZWN0aW9uLWhlYWRlciB7XHJcbiAgQGFwcGx5IG1iLTQ7XHJcbn1cclxuPC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGlkPVwiYW1kLWFtZi1lbmNvZGVyXCIgY2xhc3M9XCJjb25maWctcGFnZVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cIm1iLTQgcm91bmRlZC1tZCBvdmVyZmxvdy1oaWRkZW4gYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJiZy1zdXJmYWNlLzQwIGRhcms6Ymctc3VyZmFjZS8zMCBweC00IHB5LTNcIj5cclxuICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XHJcbiAgICAgICAgICBBTUQgQU1GIEVuY29kZXJcclxuICAgICAgICA8L2gzPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cInAtNFwiPlxyXG4gICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiYW1kX3VzYWdlXCIgdi1tb2RlbD1cImNvbmZpZy5hbWRfdXNhZ2VcIiBjbGFzcz1cIm1iLTZcIiAvPlxyXG5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImJvcmRlci10IGJvcmRlci1kYXJrLzEwIHB0LTUgZGFyazpib3JkZXItbGlnaHQvMTBcIj5cclxuICAgICAgICAgIDxoNCBjbGFzcz1cImdyb3VwLWhlYWRpbmdcIj5cclxuICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5hbWRfcmNfZ3JvdXAnKSB9fVxyXG4gICAgICAgICAgPC9oND5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cImFtZF9yY1wiIHYtbW9kZWw9XCJjb25maWcuYW1kX3JjXCIgY2xhc3M9XCJtYi00XCIgLz5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICBzZXR0aW5nLWtleT1cImFtZF9lbmZvcmNlX2hyZFwiXHJcbiAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcuYW1kX2VuZm9yY2VfaHJkXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJtYi0wXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9zZWN0aW9uPlxyXG5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImJvcmRlci10IGJvcmRlci1kYXJrLzEwIHB0LTUgZGFyazpib3JkZXItbGlnaHQvMTBcIj5cclxuICAgICAgICAgIDxoNCBjbGFzcz1cImdyb3VwLWhlYWRpbmdcIj5cclxuICAgICAgICAgICAge3sgJHQoJ2NvbmZpZy5hbWRfcXVhbGl0eV9ncm91cCcpIH19XHJcbiAgICAgICAgICA8L2g0PlxyXG5cclxuICAgICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiYW1kX3F1YWxpdHlcIiB2LW1vZGVsPVwiY29uZmlnLmFtZF9xdWFsaXR5XCIgY2xhc3M9XCJtYi02XCIgLz5cclxuXHJcbiAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICBzZXR0aW5nLWtleT1cImFtZF9wcmVhbmFseXNpc1wiXHJcbiAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcuYW1kX3ByZWFuYWx5c2lzXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJtYi0zXCJcclxuICAgICAgICAgIC8+XHJcblxyXG4gICAgICAgICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJhbWRfdmJhcVwiIHYtbW9kZWw9XCJjb25maWcuYW1kX3ZiYXFcIiBjbGFzcz1cIm1iLTNcIiAvPlxyXG5cclxuICAgICAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiYW1kX2NvZGVyXCIgdi1tb2RlbD1cImNvbmZpZy5hbWRfY29kZXJcIiBjbGFzcz1cIm1iLTBcIiAvPlxyXG4gICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5ncm91cC1oZWFkaW5nIHtcclxuICBAYXBwbHkgbWItMyB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLVswLjA4ZW1dIG9wYWNpdHktNzA7XHJcbn1cclxuPC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGlkPVwidmlkZW90b29sYm94LWVuY29kZXJcIiBjbGFzcz1cImNvbmZpZy1wYWdlXCI+XHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlciBzZXR0aW5nLWtleT1cInZ0X2NvZGVyXCIgdi1tb2RlbD1cImNvbmZpZy52dF9jb2RlclwiIGNsYXNzPVwibWItNFwiIC8+XHJcblxyXG4gICAgPENvbmZpZ0ZpZWxkUmVuZGVyZXIgc2V0dGluZy1rZXk9XCJ2dF9zb2Z0d2FyZVwiIHYtbW9kZWw9XCJjb25maWcudnRfc29mdHdhcmVcIiBjbGFzcz1cIm1iLTRcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwidnRfcmVhbHRpbWVcIiB2LW1vZGVsPVwiY29uZmlnLnZ0X3JlYWx0aW1lXCIgY2xhc3M9XCJtYi00XCIgLz5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+PC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgY29uZmlnID0gc3RvcmUuY29uZmlnO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGlkPVwic29mdHdhcmUtZW5jb2RlclwiIGNsYXNzPVwiY29uZmlnLXBhZ2VcIj5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwic3dfcHJlc2V0XCIgdi1tb2RlbD1cImNvbmZpZy5zd19wcmVzZXRcIiBjbGFzcz1cIm1iLTRcIiAvPlxyXG5cclxuICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwic3dfdHVuZVwiIHYtbW9kZWw9XCJjb25maWcuc3dfdHVuZVwiIGNsYXNzPVwibWItNFwiIC8+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c3R5bGUgc2NvcGVkPjwvc3R5bGU+XHJcbiIsIjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCBDb25maWdGaWVsZFJlbmRlcmVyIGZyb20gJ0AvQ29uZmlnRmllbGRSZW5kZXJlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG5jb25zdCBzdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHN0b3JlLmNvbmZpZztcclxuPC9zY3JpcHQ+XHJcblxyXG48dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cInZhYXBpLWVuY29kZXJcIiBjbGFzcz1cImNvbmZpZy1wYWdlXCI+XHJcbiAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICBzZXR0aW5nLWtleT1cInZhYXBpX3N0cmljdF9yY19idWZmZXJcIlxyXG4gICAgICB2LW1vZGVsPVwiY29uZmlnLnZhYXBpX3N0cmljdF9yY19idWZmZXJcIlxyXG4gICAgICBjbGFzcz1cIm1iLTNcIlxyXG4gICAgLz5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+PC9zdHlsZT5cclxuIiwiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHN0b3JlVG9SZWZzIH0gZnJvbSAncGluaWEnO1xyXG5pbXBvcnQgeyB1c2VJMThuIH0gZnJvbSAndnVlLWkxOG4nO1xyXG5pbXBvcnQgeyBOQWxlcnQsIE5CdXR0b24sIE5Nb2RhbCwgTlJhZGlvLCBOUmFkaW9Hcm91cCB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IENvbmZpZ0ZpZWxkUmVuZGVyZXIgZnJvbSAnQC9Db25maWdGaWVsZFJlbmRlcmVyLnZ1ZSc7XHJcbmltcG9ydCBDb25maWdTd2l0Y2hGaWVsZCBmcm9tICdAL0NvbmZpZ1N3aXRjaEZpZWxkLnZ1ZSc7XHJcbmltcG9ydCBOdmlkaWFOdmVuY0VuY29kZXIgZnJvbSAnQC9jb25maWdzL3RhYnMvZW5jb2RlcnMvTnZpZGlhTnZlbmNFbmNvZGVyLnZ1ZSc7XHJcbmltcG9ydCBJbnRlbFF1aWNrU3luY0VuY29kZXIgZnJvbSAnQC9jb25maWdzL3RhYnMvZW5jb2RlcnMvSW50ZWxRdWlja1N5bmNFbmNvZGVyLnZ1ZSc7XHJcbmltcG9ydCBBbWRBbWZFbmNvZGVyIGZyb20gJ0AvY29uZmlncy90YWJzL2VuY29kZXJzL0FtZEFtZkVuY29kZXIudnVlJztcclxuaW1wb3J0IFZpZGVvdG9vbGJveEVuY29kZXIgZnJvbSAnQC9jb25maWdzL3RhYnMvZW5jb2RlcnMvVmlkZW90b29sYm94RW5jb2Rlci52dWUnO1xyXG5pbXBvcnQgU29mdHdhcmVFbmNvZGVyIGZyb20gJ0AvY29uZmlncy90YWJzL2VuY29kZXJzL1NvZnR3YXJlRW5jb2Rlci52dWUnO1xyXG5pbXBvcnQgVkFBUElFbmNvZGVyIGZyb20gJ0AvY29uZmlncy90YWJzL2VuY29kZXJzL1ZBQVBJRW5jb2Rlci52dWUnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5cclxuY29uc3QgcHJvcHMgPSBkZWZpbmVQcm9wcyh7XHJcbiAgY3VycmVudFRhYjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXHJcbn0pO1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCB7IGNvbmZpZywgbWV0YWRhdGEgfSA9IHN0b3JlVG9SZWZzKHN0b3JlKTtcclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcblxyXG4vLyBGYWxsYmFjazogaWYgbm8gY3VycmVudFRhYiBwcm92aWRlZCwgc2hvdyBhbGwgc3RhY2tlZCAobW9kZXJuIHNpbmdsZSBwYWdlIG1vZGUpXHJcbmNvbnN0IHNob3dBbGwgPSAoKSA9PiAhcHJvcHMuY3VycmVudFRhYjtcclxuXHJcbmNvbnN0IHBsYXRmb3JtID0gY29tcHV0ZWQoKCkgPT5cclxuICAobWV0YWRhdGEudmFsdWU/LnBsYXRmb3JtIHx8IGNvbmZpZy52YWx1ZT8ucGxhdGZvcm0gfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSxcclxuKTtcclxuXHJcbmNvbnN0IGdwdUxpc3QgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgcmF3ID0gKG1ldGFkYXRhLnZhbHVlIGFzIGFueSk/LmdwdXM7XHJcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmF3KSA/IHJhdyA6IFtdO1xyXG59KTtcclxuXHJcbmNvbnN0IExPU1NMRVNTX0RFRkFVTFRfUEFUSCA9XHJcbiAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg4NilcXFxcU3RlYW1cXFxcc3RlYW1hcHBzXFxcXGNvbW1vblxcXFxMb3NzbGVzcyBTY2FsaW5nXFxcXExvc3NsZXNzU2NhbGluZy5leGUnO1xyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplV2luZG93c1BhdGgocmF3OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcclxuICBpZiAoIXJhdykgcmV0dXJuICcnO1xyXG4gIGxldCB2YWx1ZSA9IFN0cmluZyhyYXcpLnJlcGxhY2UoL1xcLy9nLCAnXFxcXCcpLnRyaW0oKTtcclxuICBpZiAoIXZhbHVlKSByZXR1cm4gJyc7XHJcbiAgbGV0IHByZWZpeCA9ICcnO1xyXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCdcXFxcXFxcXD9cXFxcJykpIHtcclxuICAgIHByZWZpeCA9ICdcXFxcXFxcXD9cXFxcJztcclxuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoNCk7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZS5zdGFydHNXaXRoKCdcXFxcXFxcXCcpKSB7XHJcbiAgICBwcmVmaXggPSAnXFxcXFxcXFwnO1xyXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgyKTtcclxuICB9XHJcbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXFxcezIsfS9nLCAnXFxcXCcpO1xyXG4gIGlmIChwcmVmaXggPT09ICdcXFxcXFxcXCcgJiYgdmFsdWUuc3RhcnRzV2l0aCgnXFxcXCcpKSB7XHJcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpO1xyXG4gIH1cclxuICByZXR1cm4gcHJlZml4ICsgdmFsdWU7XHJcbn1cclxuXHJcbmNvbnN0IGxvc3NsZXNzU3RhdHVzID0gcmVmPGFueSB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBsb3NzbGVzc0xvYWRpbmcgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBsb3NzbGVzc0Vycm9yID0gcmVmPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBsb3NzbGVzc0Jyb3dzZVZpc2libGUgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBsb3NzbGVzc0Jyb3dzZVNlbGVjdGlvbiA9IHJlZignJyk7XHJcblxyXG5jb25zdCBsb3NzbGVzc1Jlc29sdmVkUGF0aCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCByYXcgPSBsb3NzbGVzc1N0YXR1cy52YWx1ZT8ucmVzb2x2ZWRfcGF0aDtcclxuICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcclxuICByZXR1cm4gbm9ybWFsaXplV2luZG93c1BhdGgocmF3KTtcclxufSk7XHJcblxyXG5jb25zdCBsb3NzbGVzc0ZvcmNlQWR2YW5jZWQgPSByZWYoZmFsc2UpO1xyXG5cclxuY29uc3QgaGFzTnZpZGlhID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IG1ldGFGbGFnID0gKG1ldGFkYXRhLnZhbHVlIGFzIGFueSk/Lmhhc19udmlkaWFfZ3B1O1xyXG4gIGlmICh0eXBlb2YgbWV0YUZsYWcgPT09ICdib29sZWFuJykgcmV0dXJuIG1ldGFGbGFnO1xyXG4gIGlmIChncHVMaXN0LnZhbHVlLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGdwdUxpc3QudmFsdWUuc29tZShcclxuICAgICAgKGdwdTogYW55KSA9PiBOdW1iZXIoZ3B1Py52ZW5kb3JfaWQgPz8gZ3B1Py52ZW5kb3JJZCA/PyAwKSA9PT0gMHgxMGRlLFxyXG4gICAgKTtcclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn0pO1xyXG5cclxuY29uc3QgaGFzSW50ZWwgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgbWV0YUZsYWcgPSAobWV0YWRhdGEudmFsdWUgYXMgYW55KT8uaGFzX2ludGVsX2dwdTtcclxuICBpZiAodHlwZW9mIG1ldGFGbGFnID09PSAnYm9vbGVhbicpIHJldHVybiBtZXRhRmxhZztcclxuICBpZiAoZ3B1TGlzdC52YWx1ZS5sZW5ndGgpIHtcclxuICAgIHJldHVybiBncHVMaXN0LnZhbHVlLnNvbWUoXHJcbiAgICAgIChncHU6IGFueSkgPT4gTnVtYmVyKGdwdT8udmVuZG9yX2lkID8/IGdwdT8udmVuZG9ySWQgPz8gMCkgPT09IDB4ODA4NixcclxuICAgICk7XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59KTtcclxuXHJcbmNvbnN0IGhhc0FtZCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBtZXRhRmxhZyA9IChtZXRhZGF0YS52YWx1ZSBhcyBhbnkpPy5oYXNfYW1kX2dwdTtcclxuICBpZiAodHlwZW9mIG1ldGFGbGFnID09PSAnYm9vbGVhbicpIHJldHVybiBtZXRhRmxhZztcclxuICBpZiAoZ3B1TGlzdC52YWx1ZS5sZW5ndGgpIHtcclxuICAgIHJldHVybiBncHVMaXN0LnZhbHVlLnNvbWUoKGdwdTogYW55KSA9PiB7XHJcbiAgICAgIGNvbnN0IHZlbmRvciA9IE51bWJlcihncHU/LnZlbmRvcl9pZCA/PyBncHU/LnZlbmRvcklkID8/IDApO1xyXG4gICAgICByZXR1cm4gdmVuZG9yID09PSAweDEwMDIgfHwgdmVuZG9yID09PSAweDEwMjI7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn0pO1xyXG5cclxuY29uc3QgbG9zc2xlc3NDb25maWd1cmVkUGF0aCA9IGNvbXB1dGVkKCgpID0+IChjb25maWcudmFsdWUgYXMgYW55KT8ubG9zc2xlc3Nfc2NhbGluZ19wYXRoID8/ICcnKTtcclxuY29uc3QgbG9zc2xlc3NMZWdhY3lBdXRvRGV0ZWN0ID0gY29tcHV0ZWQ8Ym9vbGVhbj4oe1xyXG4gIGdldDogKCkgPT4gISEoY29uZmlnLnZhbHVlIGFzIGFueSk/Lmxvc3NsZXNzX3NjYWxpbmdfbGVnYWN5X2F1dG9fZGV0ZWN0LFxyXG4gIHNldDogKHZhbHVlKSA9PiB7XHJcbiAgICAoY29uZmlnLnZhbHVlIGFzIGFueSkubG9zc2xlc3Nfc2NhbGluZ19sZWdhY3lfYXV0b19kZXRlY3QgPSAhIXZhbHVlO1xyXG4gIH0sXHJcbn0pO1xyXG5jb25zdCBsb3NzbGVzc1N1Z2dlc3RlZFBhdGggPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKGxvc3NsZXNzQ29uZmlndXJlZFBhdGgudmFsdWUpIHJldHVybiBub3JtYWxpemVXaW5kb3dzUGF0aChsb3NzbGVzc0NvbmZpZ3VyZWRQYXRoLnZhbHVlKTtcclxuICBjb25zdCBzdWdnZXN0ZWQgPSBsb3NzbGVzc1N0YXR1cy52YWx1ZT8uc3VnZ2VzdGVkX3BhdGggYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gIHJldHVybiBub3JtYWxpemVXaW5kb3dzUGF0aChzdWdnZXN0ZWQpIHx8IExPU1NMRVNTX0RFRkFVTFRfUEFUSDtcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzQ2FuZGlkYXRlcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCByYXcgPSBsb3NzbGVzc1N0YXR1cy52YWx1ZT8uY2FuZGlkYXRlcztcclxuICBpZiAoIUFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIFtdIGFzIHN0cmluZ1tdO1xyXG4gIHJldHVybiByYXdcclxuICAgIC5tYXAoKGl0ZW06IHVua25vd24pID0+ICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycgPyBub3JtYWxpemVXaW5kb3dzUGF0aChpdGVtKSA6ICcnKSlcclxuICAgIC5maWx0ZXIoKGl0ZW0pID0+ICEhaXRlbSk7XHJcbn0pO1xyXG5jb25zdCBsb3NzbGVzc0NoZWNrZWRJc0RpcmVjdG9yeSA9IGNvbXB1dGVkKCgpID0+ICEhbG9zc2xlc3NTdGF0dXMudmFsdWU/LmNoZWNrZWRfaXNfZGlyZWN0b3J5KTtcclxuY29uc3QgbG9zc2xlc3NQYXRoRXhpc3RzID0gY29tcHV0ZWQoKCkgPT4gISFsb3NzbGVzc1N0YXR1cy52YWx1ZT8uY2hlY2tlZF9leGlzdHMpO1xyXG5jb25zdCBsb3NzbGVzc0RldGVjdGVkID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghbG9zc2xlc3NTdGF0dXMudmFsdWUpIHJldHVybiBmYWxzZTtcclxuICBpZiAobG9zc2xlc3NFcnJvci52YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gIGlmIChsb3NzbGVzc1N0YXR1cy52YWx1ZS5jaGVja2VkX2V4aXN0cyAmJiAhbG9zc2xlc3NDaGVja2VkSXNEaXJlY3RvcnkudmFsdWUpIHJldHVybiB0cnVlO1xyXG4gIGlmIChsb3NzbGVzc1N0YXR1cy52YWx1ZS5yZXNvbHZlZF9wYXRoKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAobG9zc2xlc3NTdGF0dXMudmFsdWUuY29uZmlndXJlZF9leGlzdHMgJiYgIWxvc3NsZXNzU3RhdHVzLnZhbHVlLmNvbmZpZ3VyZWRfaXNfZGlyZWN0b3J5KSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzU3RhdHVzLnZhbHVlLmRlZmF1bHRfZXhpc3RzKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAobG9zc2xlc3NDYW5kaWRhdGVzLnZhbHVlLmxlbmd0aCA+IDApIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcbmNvbnN0IHNob3dMb3NzbGVzc0FkdmFuY2VkID0gY29tcHV0ZWQoKCkgPT4gIWxvc3NsZXNzRGV0ZWN0ZWQudmFsdWUgfHwgbG9zc2xlc3NGb3JjZUFkdmFuY2VkLnZhbHVlKTtcclxuY29uc3QgbG9zc2xlc3NTdGF0dXNDbGFzcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAobG9zc2xlc3NMb2FkaW5nLnZhbHVlKSB7XHJcbiAgICByZXR1cm4gJ2JnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5JztcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzRGV0ZWN0ZWQudmFsdWUpIHtcclxuICAgIHJldHVybiAnYmctc3VjY2Vzcy8xMCB0ZXh0LXN1Y2Nlc3MnO1xyXG4gIH1cclxuICByZXR1cm4gJ2JnLXdhcm5pbmcvMTAgdGV4dC13YXJuaW5nJztcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzU3RhdHVzSWNvbiA9IGNvbXB1dGVkKCgpID0+XHJcbiAgbG9zc2xlc3NEZXRlY3RlZC52YWx1ZSA/ICdmYS1jaGVjay1jaXJjbGUnIDogJ2ZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlJyxcclxuKTtcclxuY29uc3QgbG9zc2xlc3NEZWZhdWx0UGF0aCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCByYXcgPSBsb3NzbGVzc1N0YXR1cy52YWx1ZT8uZGVmYXVsdF9wYXRoO1xyXG4gIHJldHVybiB0eXBlb2YgcmF3ID09PSAnc3RyaW5nJyA/IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHJhdykgOiAnJztcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzQWN0aXZlUGF0aCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoIWxvc3NsZXNzU3RhdHVzLnZhbHVlKSByZXR1cm4gJyc7XHJcbiAgaWYgKGxvc3NsZXNzU3RhdHVzLnZhbHVlLnJlc29sdmVkX3BhdGgpIHJldHVybiBsb3NzbGVzc1Jlc29sdmVkUGF0aC52YWx1ZTtcclxuICBpZiAoXHJcbiAgICBsb3NzbGVzc1N0YXR1cy52YWx1ZS5jaGVja2VkX2V4aXN0cyAmJlxyXG4gICAgdHlwZW9mIGxvc3NsZXNzU3RhdHVzLnZhbHVlLmNoZWNrZWRfcGF0aCA9PT0gJ3N0cmluZycgJiZcclxuICAgICFsb3NzbGVzc0NoZWNrZWRJc0RpcmVjdG9yeS52YWx1ZVxyXG4gICkge1xyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZVdpbmRvd3NQYXRoKGxvc3NsZXNzU3RhdHVzLnZhbHVlLmNoZWNrZWRfcGF0aCk7XHJcbiAgfVxyXG4gIGlmIChcclxuICAgIGxvc3NsZXNzU3RhdHVzLnZhbHVlLmNvbmZpZ3VyZWRfZXhpc3RzICYmXHJcbiAgICB0eXBlb2YgbG9zc2xlc3NTdGF0dXMudmFsdWUuY29uZmlndXJlZF9wYXRoID09PSAnc3RyaW5nJyAmJlxyXG4gICAgIWxvc3NsZXNzU3RhdHVzLnZhbHVlLmNvbmZpZ3VyZWRfaXNfZGlyZWN0b3J5XHJcbiAgKSB7XHJcbiAgICByZXR1cm4gbm9ybWFsaXplV2luZG93c1BhdGgobG9zc2xlc3NTdGF0dXMudmFsdWUuY29uZmlndXJlZF9wYXRoKTtcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzU3RhdHVzLnZhbHVlLmRlZmF1bHRfZXhpc3RzICYmIGxvc3NsZXNzRGVmYXVsdFBhdGgudmFsdWUpIHtcclxuICAgIHJldHVybiBsb3NzbGVzc0RlZmF1bHRQYXRoLnZhbHVlO1xyXG4gIH1cclxuICBpZiAobG9zc2xlc3NDYW5kaWRhdGVzLnZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgIHJldHVybiBsb3NzbGVzc0NhbmRpZGF0ZXMudmFsdWVbMF07XHJcbiAgfVxyXG4gIHJldHVybiAnJztcclxufSk7XHJcbmNvbnN0IGxvc3NsZXNzU3RhdHVzVGV4dCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAobG9zc2xlc3NMb2FkaW5nLnZhbHVlKSB7XHJcbiAgICByZXR1cm4gJ0NoZWNraW5n4oCmJztcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzRXJyb3IudmFsdWUpIHtcclxuICAgIHJldHVybiBsb3NzbGVzc0Vycm9yLnZhbHVlO1xyXG4gIH1cclxuICBpZiAobG9zc2xlc3NEZXRlY3RlZC52YWx1ZSkge1xyXG4gICAgcmV0dXJuIGBMb3NzbGVzcyBTY2FsaW5nIGlzIFJlYWR5YDtcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzU3RhdHVzLnZhbHVlPy5tZXNzYWdlKSB7XHJcbiAgICByZXR1cm4gbG9zc2xlc3NTdGF0dXMudmFsdWUubWVzc2FnZTtcclxuICB9XHJcbiAgcmV0dXJuICdMb3NzbGVzcyBTY2FsaW5nIHN0YXR1cyB1bmF2YWlsYWJsZS4nO1xyXG59KTtcclxuY29uc3QgbG9zc2xlc3NTdGF0dXNIaW50ID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChsb3NzbGVzc0xvYWRpbmcudmFsdWUpIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzRXJyb3IudmFsdWUpIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgaWYgKGxvc3NsZXNzRGV0ZWN0ZWQudmFsdWUpIHtcclxuICAgIHJldHVybiBgTG9zc2xlc3MgU2NhbGluZyBpcyBkZXRlY3RlZCBhbmQgd2lsbCBiZSBsYXVuY2hlZCB3aGVuIHNlbGVjdGVkIGFzIHRoZSBwcmltYXJ5IGZyYW1lIGdlbmVyYXRpb24gaW4gYW55IGFwcGxpY2F0aW9uLmA7XHJcbiAgfVxyXG4gIHJldHVybiAnVmliZXNoaW5lIGNvdWxkIG5vdCBmaW5kIExvc3NsZXNzIFNjYWxpbmcuIFNjYW4gZm9yIGFuIGluc3RhbGxhdGlvbiBvciBwcm92aWRlIHRoZSBleGVjdXRhYmxlIHBhdGggYmVsb3cuJztcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoTG9zc2xlc3NTdGF0dXMoKSB7XHJcbiAgaWYgKHBsYXRmb3JtLnZhbHVlICE9PSAnd2luZG93cycpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgbG9zc2xlc3NMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICBsb3NzbGVzc0Vycm9yLnZhbHVlID0gbnVsbDtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICBpZiAobG9zc2xlc3NDb25maWd1cmVkUGF0aC52YWx1ZSkge1xyXG4gICAgICBwYXJhbXNbJ3BhdGgnXSA9IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKFN0cmluZyhsb3NzbGVzc0NvbmZpZ3VyZWRQYXRoLnZhbHVlKSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHAuZ2V0KCcvYXBpL2xvc3NsZXNzX3NjYWxpbmcvc3RhdHVzJywge1xyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgY29uc3QgcGF5bG9hZCA9IHJlc3BvbnNlLmRhdGEgPz8ge307XHJcbiAgICAgIGlmIChwYXlsb2FkICYmIHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5zdWdnZXN0ZWRfcGF0aCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIHBheWxvYWQuc3VnZ2VzdGVkX3BhdGggPSBub3JtYWxpemVXaW5kb3dzUGF0aChwYXlsb2FkLnN1Z2dlc3RlZF9wYXRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnJlc29sdmVkX3BhdGggPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBwYXlsb2FkLnJlc29sdmVkX3BhdGggPSBub3JtYWxpemVXaW5kb3dzUGF0aChwYXlsb2FkLnJlc29sdmVkX3BhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuZGVmYXVsdF9wYXRoID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgcGF5bG9hZC5kZWZhdWx0X3BhdGggPSBub3JtYWxpemVXaW5kb3dzUGF0aChwYXlsb2FkLmRlZmF1bHRfcGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5jb25maWd1cmVkX3BhdGggPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBwYXlsb2FkLmNvbmZpZ3VyZWRfcGF0aCA9IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHBheWxvYWQuY29uZmlndXJlZF9wYXRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmNoZWNrZWRfcGF0aCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIHBheWxvYWQuY2hlY2tlZF9wYXRoID0gbm9ybWFsaXplV2luZG93c1BhdGgocGF5bG9hZC5jaGVja2VkX3BhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXlsb2FkLmNhbmRpZGF0ZXMpKSB7XHJcbiAgICAgICAgICBwYXlsb2FkLmNhbmRpZGF0ZXMgPSBwYXlsb2FkLmNhbmRpZGF0ZXNcclxuICAgICAgICAgICAgLm1hcCgoaXRlbTogdW5rbm93bikgPT4gKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyA/IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKGl0ZW0pIDogJycpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChpdGVtOiBzdHJpbmcpID0+ICEhaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxvc3NsZXNzU3RhdHVzLnZhbHVlID0gcGF5bG9hZDtcclxuICAgICAgbG9zc2xlc3NFcnJvci52YWx1ZSA9IG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsb3NzbGVzc0Vycm9yLnZhbHVlID0gJ1VuYWJsZSB0byBxdWVyeSBMb3NzbGVzcyBTY2FsaW5nIHN0YXR1cy4nO1xyXG4gICAgICBsb3NzbGVzc1N0YXR1cy52YWx1ZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBsb3NzbGVzc0Vycm9yLnZhbHVlID0gJ1VuYWJsZSB0byBxdWVyeSBMb3NzbGVzcyBTY2FsaW5nIHN0YXR1cy4nO1xyXG4gICAgbG9zc2xlc3NTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBsb3NzbGVzc0xvYWRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5TG9zc2xlc3NTdWdnZXN0aW9uKCkge1xyXG4gIGlmICghY29uZmlnLnZhbHVlKSByZXR1cm47XHJcbiAgKGNvbmZpZy52YWx1ZSBhcyBhbnkpLmxvc3NsZXNzX3NjYWxpbmdfcGF0aCA9IGxvc3NsZXNzU3VnZ2VzdGVkUGF0aC52YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlMb3NzbGVzc0Jyb3dzZVNlbGVjdGlvbigpIHtcclxuICBpZiAoIWNvbmZpZy52YWx1ZSkgcmV0dXJuO1xyXG4gIGNvbnN0IHNlbGVjdGVkID0gbm9ybWFsaXplV2luZG93c1BhdGgobG9zc2xlc3NCcm93c2VTZWxlY3Rpb24udmFsdWUpO1xyXG4gIGlmICghc2VsZWN0ZWQpIHJldHVybjtcclxuICAoY29uZmlnLnZhbHVlIGFzIGFueSkubG9zc2xlc3Nfc2NhbGluZ19wYXRoID0gc2VsZWN0ZWQ7XHJcbiAgbG9zc2xlc3NCcm93c2VWaXNpYmxlLnZhbHVlID0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dMb3NzbGVzc092ZXJyaWRlKCkge1xyXG4gIGxvc3NsZXNzRm9yY2VBZHZhbmNlZC52YWx1ZSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZGVMb3NzbGVzc092ZXJyaWRlKCkge1xyXG4gIGxvc3NsZXNzRm9yY2VBZHZhbmNlZC52YWx1ZSA9IGZhbHNlO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvcGVuTG9zc2xlc3NCcm93c2UoKSB7XHJcbiAgaWYgKHBsYXRmb3JtLnZhbHVlICE9PSAnd2luZG93cycpIHJldHVybjtcclxuICBpZiAoIWxvc3NsZXNzU3RhdHVzLnZhbHVlICYmICFsb3NzbGVzc0xvYWRpbmcudmFsdWUpIHtcclxuICAgIGF3YWl0IHJlZnJlc2hMb3NzbGVzc1N0YXR1cygpO1xyXG4gIH1cclxuICBjb25zdCBpbml0aWFsID1cclxuICAgIG5vcm1hbGl6ZVdpbmRvd3NQYXRoKGxvc3NsZXNzQ29uZmlndXJlZFBhdGgudmFsdWUpIHx8XHJcbiAgICBsb3NzbGVzc0FjdGl2ZVBhdGgudmFsdWUgfHxcclxuICAgIGxvc3NsZXNzQ2FuZGlkYXRlcy52YWx1ZVswXSB8fFxyXG4gICAgbG9zc2xlc3NTdWdnZXN0ZWRQYXRoLnZhbHVlIHx8XHJcbiAgICAnJztcclxuICBsb3NzbGVzc0Jyb3dzZVNlbGVjdGlvbi52YWx1ZSA9IGluaXRpYWw7XHJcbiAgbG9zc2xlc3NCcm93c2VWaXNpYmxlLnZhbHVlID0gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVzY2FuTG9zc2xlc3NDYW5kaWRhdGVzKCkge1xyXG4gIGF3YWl0IHJlZnJlc2hMb3NzbGVzc1N0YXR1cygpO1xyXG4gIGNvbnN0IGV4aXN0aW5nID0gbm9ybWFsaXplV2luZG93c1BhdGgobG9zc2xlc3NCcm93c2VTZWxlY3Rpb24udmFsdWUpO1xyXG4gIGlmIChleGlzdGluZykge1xyXG4gICAgbG9zc2xlc3NCcm93c2VTZWxlY3Rpb24udmFsdWUgPSBleGlzdGluZztcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY29uc3QgZmlyc3QgPSBsb3NzbGVzc0NhbmRpZGF0ZXMudmFsdWVbMF07XHJcbiAgaWYgKGZpcnN0KSB7XHJcbiAgICBsb3NzbGVzc0Jyb3dzZVNlbGVjdGlvbi52YWx1ZSA9IGZpcnN0O1xyXG4gIH1cclxufVxyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICBpZiAocGxhdGZvcm0udmFsdWUgPT09ICd3aW5kb3dzJykge1xyXG4gICAgcmVmcmVzaExvc3NsZXNzU3RhdHVzKCkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIH1cclxufSk7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBsb3NzbGVzc0NvbmZpZ3VyZWRQYXRoLnZhbHVlLFxyXG4gICgpID0+IHtcclxuICAgIGlmIChwbGF0Zm9ybS52YWx1ZSA9PT0gJ3dpbmRvd3MnKSB7XHJcbiAgICAgIHJlZnJlc2hMb3NzbGVzc1N0YXR1cygpLmNhdGNoKCgpID0+IHt9KTtcclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gKGNvbmZpZy52YWx1ZSBhcyBhbnkpPy5sb3NzbGVzc19zY2FsaW5nX3BhdGgsXHJcbiAgKHZhbHVlKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHZhbHVlKTtcclxuICAgIGlmIChub3JtYWxpemVkICE9PSB2YWx1ZSkge1xyXG4gICAgICAoY29uZmlnLnZhbHVlIGFzIGFueSkubG9zc2xlc3Nfc2NhbGluZ19wYXRoID0gbm9ybWFsaXplZDtcclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxuY29uc3Qgc2hvdWxkU2hvd052ZW5jID0gY29tcHV0ZWQoKCkgPT4gKHNob3dBbGwoKSB8fCBwcm9wcy5jdXJyZW50VGFiID09PSAnbnYnKSAmJiBoYXNOdmlkaWEudmFsdWUpO1xyXG5jb25zdCBzaG91bGRTaG93UXN2ID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gKHNob3dBbGwoKSB8fCBwcm9wcy5jdXJyZW50VGFiID09PSAncXN2JykgJiYgaGFzSW50ZWwudmFsdWUgJiYgcGxhdGZvcm0udmFsdWUgPT09ICd3aW5kb3dzJyxcclxuKTtcclxuY29uc3Qgc2hvdWxkU2hvd0FtZCA9IGNvbXB1dGVkKFxyXG4gICgpID0+IChzaG93QWxsKCkgfHwgcHJvcHMuY3VycmVudFRhYiA9PT0gJ2FtZCcpICYmIGhhc0FtZC52YWx1ZSAmJiBwbGF0Zm9ybS52YWx1ZSA9PT0gJ3dpbmRvd3MnLFxyXG4pO1xyXG5jb25zdCBzaG91bGRTaG93VmlkZW90b29sYm94ID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gKHNob3dBbGwoKSB8fCBwcm9wcy5jdXJyZW50VGFiID09PSAndnQnKSAmJiBwbGF0Zm9ybS52YWx1ZSA9PT0gJ21hY29zJyxcclxuKTtcclxuY29uc3Qgc2hvdWxkU2hvd1ZhYXBpID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gKHNob3dBbGwoKSB8fCBwcm9wcy5jdXJyZW50VGFiID09PSAndmFhcGknKSAmJiBwbGF0Zm9ybS52YWx1ZSA9PT0gJ2xpbnV4JyxcclxuKTtcclxuY29uc3Qgc2hvdWxkU2hvd1NvZnR3YXJlID0gY29tcHV0ZWQoKCkgPT4gc2hvd0FsbCgpIHx8IHByb3BzLmN1cnJlbnRUYWIgPT09ICdzdycpO1xyXG48L3NjcmlwdD5cclxuXHJcbjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiY29uZmlnLXBhZ2Ugc3BhY2UteS02XCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS00XCI+XHJcbiAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiY2FwdHVyZVwiIHYtbW9kZWw9XCJjb25maWcuY2FwdHVyZVwiIC8+XHJcbiAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwiZW5jb2RlclwiIHYtbW9kZWw9XCJjb25maWcuZW5jb2RlclwiIC8+XHJcbiAgICAgIDxDb25maWdGaWVsZFJlbmRlcmVyIHNldHRpbmcta2V5PVwicHJlZmVyXzEwYml0X3NkclwiIHYtbW9kZWw9XCJjb25maWcucHJlZmVyXzEwYml0X3NkclwiIC8+XHJcbiAgICAgIDxmaWVsZHNldFxyXG4gICAgICAgIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnXCJcclxuICAgICAgICBjbGFzcz1cInNwYWNlLXktNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8zNSBwLTQgZGFyazpib3JkZXItbGlnaHQvMjVcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGxlZ2VuZCBjbGFzcz1cInB4LTIgdGV4dC1zbSBmb250LW1lZGl1bVwiPkxvc3NsZXNzIFNjYWxpbmc8L2xlZ2VuZD5cclxuICAgICAgICA8ZGl2IDpjbGFzcz1cIlsncm91bmRlZC1sZyBweC00IHB5LTMgdGV4dC14cycsIGxvc3NsZXNzU3RhdHVzQ2xhc3NdXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxMdWNpZGVJY29uIDpuYW1lPVwibG9zc2xlc3NTdGF0dXNJY29uXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1lZGl1bSBsZWFkaW5nLXRpZ2h0XCI+e3sgbG9zc2xlc3NTdGF0dXNUZXh0IH19PC9zcGFuPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICB0eXBlPVwiZGVmYXVsdFwiXHJcbiAgICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwibG9zc2xlc3NMb2FkaW5nXCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cInJlZnJlc2hMb3NzbGVzc1N0YXR1c1wiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXN5bmNcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMVwiPkNoZWNrPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICB2LWlmPVwibG9zc2xlc3NEZXRlY3RlZCAmJiAhbG9zc2xlc3NGb3JjZUFkdmFuY2VkXCJcclxuICAgICAgICAgICAgICAgIHNpemU9XCJ0aW55XCJcclxuICAgICAgICAgICAgICAgIHRlcnRpYXJ5XHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzaG93TG9zc2xlc3NPdmVycmlkZVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgT3ZlcnJpZGUgUGF0aFxyXG4gICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICB2LWVsc2UtaWY9XCJsb3NzbGVzc0RldGVjdGVkICYmIGxvc3NsZXNzRm9yY2VBZHZhbmNlZFwiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICB0ZXJ0aWFyeVxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiaGlkZUxvc3NsZXNzT3ZlcnJpZGVcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIEhpZGUgT3ZlcnJpZGVcclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPHAgdi1pZj1cImxvc3NsZXNzU3RhdHVzSGludFwiIGNsYXNzPVwibXQtMiB0ZXh0LXhzIG9wYWNpdHktODBcIj5cclxuICAgICAgICAgICAge3sgbG9zc2xlc3NTdGF0dXNIaW50IH19XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8cCB2LWlmPVwiIWxvc3NsZXNzTG9hZGluZyAmJiBsb3NzbGVzc0FjdGl2ZVBhdGhcIiBjbGFzcz1cIm10LTEgdGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgIFVzaW5nOiB7eyBsb3NzbGVzc0FjdGl2ZVBhdGggfX1cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPHAgY2xhc3M9XCJtdC0zIHRleHQteHMgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgRW5hYmxlIExvc3NsZXNzIFNjYWxpbmcgcGVyIGFwcGxpY2F0aW9uIGZyb20gdGhlIEFwcHMgZWRpdG9yIHdoZW4geW91IG5lZWQgZnJhbWVcclxuICAgICAgICAgIGdlbmVyYXRpb24gb3IgdXBzY2FsaW5nIG9uIGEgc3BlY2lmaWMgdGl0bGUuXHJcbiAgICAgICAgPC9wPlxyXG5cclxuICAgICAgICA8ZGl2XHJcbiAgICAgICAgICBjbGFzcz1cIm10LTMgcm91bmRlZC1sZyBiZy1hbWJlci01MCBkYXJrOmJnLWFtYmVyLTk1MC8zMCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBkYXJrOmJvcmRlci1hbWJlci04MDAgcC0zXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydCBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtZXhjbGFtYXRpb24tdHJpYW5nbGVcIiA6c2l6ZT1cIjE0XCIgY2xhc3M9XCJ0ZXh0LWFtYmVyLTYwMCBkYXJrOnRleHQtYW1iZXItNDAwIGZsZXgtc2hyaW5rLTAgbXQtMC41XCIgLz5cclxuICAgICAgICAgICAgPENvbmZpZ1N3aXRjaEZpZWxkXHJcbiAgICAgICAgICAgICAgaWQ9XCJsb3NzbGVzc19zY2FsaW5nX2xlZ2FjeV9hdXRvX2RldGVjdFwiXHJcbiAgICAgICAgICAgICAgdi1tb2RlbD1cImxvc3NsZXNzTGVnYWN5QXV0b0RldGVjdFwiXHJcbiAgICAgICAgICAgICAgOmxhYmVsPVwiJHQoJ2NvbmZpZy5sb3NzbGVzc19zY2FsaW5nX2xlZ2FjeV9hdXRvX2RldGVjdF9sYWJlbCcpXCJcclxuICAgICAgICAgICAgICA6ZGVzYz1cIiR0KCdjb25maWcubG9zc2xlc3Nfc2NhbGluZ19sZWdhY3lfYXV0b19kZXRlY3RfZGVzYycpXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImZsZXgtMVwiXHJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IHYtaWY9XCJzaG93TG9zc2xlc3NBZHZhbmNlZFwiIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICA8Q29uZmlnRmllbGRSZW5kZXJlclxyXG4gICAgICAgICAgICBzZXR0aW5nLWtleT1cImxvc3NsZXNzX3NjYWxpbmdfcGF0aFwiXHJcbiAgICAgICAgICAgIHYtbW9kZWw9XCJjb25maWcubG9zc2xlc3Nfc2NhbGluZ19wYXRoXCJcclxuICAgICAgICAgICAgbGFiZWw9XCJMb3NzbGVzcyBTY2FsaW5nIGV4ZWN1dGFibGVcIlxyXG4gICAgICAgICAgICBkZXNjPVwiXCJcclxuICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwiTE9TU0xFU1NfREVGQVVMVF9QQVRIXCJcclxuICAgICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjYWN0aW9ucz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC14c1wiPlxyXG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwiYXBwbHlMb3NzbGVzc1N1Z2dlc3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgVXNlIFN1Z2dlc3RlZFxyXG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwidGlueVwiIHRlcnRpYXJ5IEBjbGljaz1cIm9wZW5Mb3NzbGVzc0Jyb3dzZVwiPkJyb3dzZeKApjwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIERlZmF1bHQgaW5zdGFsbGF0aW9uOiB7eyBMT1NTTEVTU19ERUZBVUxUX1BBVEggfX1cclxuICAgICAgICAgIDwvQ29uZmlnRmllbGRSZW5kZXJlcj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9maWVsZHNldD5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgdi1pZj1cInNob3VsZFNob3dOdmVuY1wiIGNsYXNzPVwiZW5jb2Rlci1vdXRsaW5lXCI+XHJcbiAgICAgIDxOdmlkaWFOdmVuY0VuY29kZXIgLz5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgdi1pZj1cInNob3VsZFNob3dRc3ZcIiBjbGFzcz1cImVuY29kZXItb3V0bGluZVwiPlxyXG4gICAgICA8SW50ZWxRdWlja1N5bmNFbmNvZGVyIC8+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8QW1kQW1mRW5jb2RlciB2LWlmPVwic2hvdWxkU2hvd0FtZFwiIC8+XHJcbiAgICA8VmlkZW90b29sYm94RW5jb2RlciB2LWlmPVwic2hvdWxkU2hvd1ZpZGVvdG9vbGJveFwiIC8+XHJcbiAgICA8VkFBUElFbmNvZGVyIHYtaWY9XCJzaG91bGRTaG93VmFhcGlcIiAvPlxyXG5cclxuICAgIDxkaXYgdi1pZj1cInNob3VsZFNob3dTb2Z0d2FyZVwiIGNsYXNzPVwiZW5jb2Rlci1vdXRsaW5lXCI+XHJcbiAgICAgIDxTb2Z0d2FyZUVuY29kZXIgLz5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxuLW1vZGFsXHJcbiAgICAgIHYtbW9kZWw6c2hvdz1cImxvc3NsZXNzQnJvd3NlVmlzaWJsZVwiXHJcbiAgICAgIHByZXNldD1cImNhcmRcIlxyXG4gICAgICBjbGFzcz1cIm1heC13LTJ4bFwiXHJcbiAgICAgIHRpdGxlPVwiU2VsZWN0IExvc3NsZXNzIFNjYWxpbmcgRXhlY3V0YWJsZVwiXHJcbiAgICA+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTRcIj5cclxuICAgICAgICA8bi1hbGVydCB0eXBlPVwiaW5mb1wiIHNpemU9XCJzbWFsbFwiIHYtaWY9XCIhbG9zc2xlc3NDYW5kaWRhdGVzLmxlbmd0aFwiPlxyXG4gICAgICAgICAgVmliZXNoaW5lIHNlYXJjaGVkIGNvbW1vbiBTdGVhbSBhbmQgcHJvZ3JhbSBkaXJlY3RvcmllcyBidXQgY291bGQgbm90IGxvY2F0ZVxyXG4gICAgICAgICAgTG9zc2xlc3NTY2FsaW5nLmV4ZS4gSW5zdGFsbCBMb3NzbGVzcyBTY2FsaW5nIGZyb20gU3RlYW0gb3Igc2V0IHRoZSBmdWxsIHBhdGggbWFudWFsbHkuXHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgRGV0ZWN0ZWQgaW5zdGFsbGF0aW9uc1xyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8bi1yYWRpby1ncm91cCB2LW1vZGVsOnZhbHVlPVwibG9zc2xlc3NCcm93c2VTZWxlY3Rpb25cIiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgdi1mb3I9XCJjYW5kaWRhdGUgaW4gbG9zc2xlc3NDYW5kaWRhdGVzXCJcclxuICAgICAgICAgICAgICA6a2V5PVwiY2FuZGlkYXRlXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIHB4LTMgcHktMiB0ZXh0LXhzIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxuLXJhZGlvIDp2YWx1ZT1cImNhbmRpZGF0ZVwiPnt7IGNhbmRpZGF0ZSB9fTwvbi1yYWRpbz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L24tcmFkaW8tZ3JvdXA+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPG4tYWxlcnRcclxuICAgICAgICAgIHYtaWY9XCJsb3NzbGVzc0NoZWNrZWRJc0RpcmVjdG9yeSAmJiAhbG9zc2xlc3NQYXRoRXhpc3RzXCJcclxuICAgICAgICAgIHR5cGU9XCJ3YXJuaW5nXCJcclxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgVGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBwb2ludHMgYXQgYSBmb2xkZXIuIENob29zZSBMb3NzbGVzc1NjYWxpbmcuZXhlIGRpcmVjdGx5LlxyXG4gICAgICAgIDwvbi1hbGVydD5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB0LTJcIj5cclxuICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICB0ZXJ0aWFyeVxyXG4gICAgICAgICAgICBAY2xpY2s9XCJyZXNjYW5Mb3NzbGVzc0NhbmRpZGF0ZXNcIlxyXG4gICAgICAgICAgICA6bG9hZGluZz1cImxvc3NsZXNzTG9hZGluZ1wiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIFJlc2NhblxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8bi1idXR0b24gc2l6ZT1cInNtYWxsXCIgdGVydGlhcnkgQGNsaWNrPVwibG9zc2xlc3NCcm93c2VWaXNpYmxlID0gZmFsc2VcIj5DYW5jZWw8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCIhbG9zc2xlc3NCcm93c2VTZWxlY3Rpb25cIlxyXG4gICAgICAgICAgICAgIEBjbGljaz1cImFwcGx5TG9zc2xlc3NCcm93c2VTZWxlY3Rpb25cIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgVXNlIFNlbGVjdGVkIFBhdGhcclxuICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvbi1tb2RhbD5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5lbmNvZGVyLW91dGxpbmUge1xyXG4gIEBhcHBseSBib3JkZXIgYm9yZGVyLWRhcmsvMzUgZGFyazpib3JkZXItbGlnaHQvMjUgcm91bmRlZC14bCBwLTQgYmctbGlnaHQvNjAgZGFyazpiZy1kYXJrLzQwIHNwYWNlLXktNDtcclxufVxyXG48L3N0eWxlPlxyXG4iLCI8dGVtcGxhdGU+XHJcbiAgPG1haW4gcmVmPVwibWFpbkVsXCIgY2xhc3M9XCJmbGV4LTEgcHgtMCBtZDpweC0yIHhsOnB4LTYgcHktMiBtZDpweS02IHNwYWNlLXktNiBvdmVyZmxvdy14LWhpZGRlblwiPlxyXG4gICAgPGhlYWRlclxyXG4gICAgICBjbGFzcz1cInN0aWNreSB0b3AtMCB6LTIwIC1teC0wIG1kOi1teC0yIHhsOi1teC02IHB4LTAgbWQ6cHgtMiB4bDpweC02IHB5LTMgYmctbGlnaHQvNzAgZGFyazpiZy1kYXJrLzYwIGJhY2tkcm9wLWJsdXIgc3VwcG9ydHMtW2JhY2tkcm9wLWZpbHRlcl06YmctbGlnaHQvNTAgc3VwcG9ydHMtW2JhY2tkcm9wLWZpbHRlcl06ZGFyazpiZy1kYXJrLzQwIGJvcmRlci1iIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwXCJcclxuICAgID5cclxuICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtNCBmbGV4LXdyYXBcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibWluLXctMFwiPlxyXG4gICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGRcIj5TZXR0aW5nczwvaDI+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS04MFwiPlxyXG4gICAgICAgICAgICBDb25maWd1cmF0aW9uIGF1dG8tc2F2ZXM7IHJlc3RhcnQgdG8gYXBwbHkgcnVudGltZSBjaGFuZ2VzLlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtaWY9XCJtYW51YWxVbnNhdmVkXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cIm10LTIgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci13YXJuaW5nLzM1IGJnLXdhcm5pbmcvMTUgcHgtMi41IHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LXdhcm5pbmcgZGFyazpib3JkZXItd2FybmluZy80MCBkYXJrOmJnLXdhcm5pbmcvMTAgZGFyazp0ZXh0LXdhcm5pbmcvOTBcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWNpcmNsZS1leGNsYW1hdGlvblwiIDpzaXplPVwiMTJcIiAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuPnt7IHVuc2F2ZWRMYWJlbCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZSBmbGV4LTEgbWF4LXctMnhsIG1pbi13LVsyNjBweF1cIj5cclxuICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJzZWFyY2hRdWVyeVwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggc2V0dGluZ3MuLi4gKEVudGVyIHRvIGp1bXApXCJcclxuICAgICAgICAgICAgQGZvY3VzPVwib25TZWFyY2hGb2N1c1wiXHJcbiAgICAgICAgICAgIEBibHVyPVwib25TZWFyY2hCbHVyXCJcclxuICAgICAgICAgICAgQGtleWRvd24uZW50ZXIucHJldmVudD1cImp1bXBGaXJzdFJlc3VsdFwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDx0ZW1wbGF0ZSAjc3VmZml4PlxyXG4gICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1tYWduaWZ5aW5nLWdsYXNzXCIgOnNpemU9XCIxNFwiIGNsYXNzPVwib3BhY2l0eS02MFwiIC8+XHJcbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICA8L24taW5wdXQ+XHJcbiAgICAgICAgICA8dHJhbnNpdGlvbiBuYW1lPVwiZmFkZVwiPlxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgdi1pZj1cInNlYXJjaE9wZW5cIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiYWJzb2x1dGUgbXQtMiB3LWZ1bGwgbWF4LXctZnVsbCB6LTMwIGJnLWxpZ2h0Lzk1IGRhcms6Ymctc3VyZmFjZS85NSBiYWNrZHJvcC1ibHVyIHJvdW5kZWQtbWQgc2hhZG93LWxnIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBtYXgtaC04MCBvdmVyZmxvdy1hdXRvIG92ZXJmbG93LXgtaGlkZGVuIG92ZXJzY3JvbGwtY29udGFpbiBzY3JvbGwtc3RhYmxlIHByLTIgcHktMVwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwicHgtMyBweS0yIHRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgTm8gcmVzdWx0c1xyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgdi1mb3I9XCIociwgaWR4KSBpbiBzZWFyY2hSZXN1bHRzXCJcclxuICAgICAgICAgICAgICAgIDprZXk9XCJpZHhcIlxyXG4gICAgICAgICAgICAgICAgdHlwZT1cImRlZmF1bHRcIlxyXG4gICAgICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgICAgICBibG9ja1xyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJqdXN0aWZ5LXN0YXJ0ICFweC0zICFweS0yLjUgIWgtYXV0byB0ZXh0LWxlZnQgbGVhZGluZy01IHRleHQtWzEzcHhdIHdoaXRlc3BhY2Utbm9ybWFsXCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cImdvVG8ocilcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgbWF4LXctZnVsbCB0ZXh0LWxlZnQgZmxleCBpdGVtcy1zdGFydCBnYXAtMiBweS0wLjVcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzaHJpbmstMCBtdC0wLjVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtY29tcGFzc1wiIDpzaXplPVwiMTRcIiBjbGFzcz1cInRleHQtcHJpbWFyeVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtaW4tdy0wXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJibG9jayBmb250LW1lZGl1bSBicmVhay13b3JkcyB3aGl0ZXNwYWNlLW5vcm1hbFwiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICByLmxhYmVsXHJcbiAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYmxvY2sgdGV4dC14cyBvcGFjaXR5LTgwIGxlYWRpbmctNSBicmVhay13b3JkcyB3aGl0ZXNwYWNlLW5vcm1hbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+e3sgci5wYXRoIH19PC9zcGFuXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LWlmPVwici5kZXNjXCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYmxvY2sgdGV4dC14cyBvcGFjaXR5LTcwIGJyZWFrLXdvcmRzIHdoaXRlc3BhY2Utbm9ybWFsIGxlYWRpbmctNVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+e3sgci5kZXNjIH19PC9zcGFuXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgICAgICAgICAgICB2LWlmPVwici5vcHRpb25zICYmIHIub3B0aW9ucy5sZW5ndGhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJibG9jayB0ZXh0LXhzIG9wYWNpdHktODAgbXQtMSBicmVhay13b3JkcyB3aGl0ZXNwYWNlLW5vcm1hbCBsZWFkaW5nLTVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPk9wdGlvbnM6XHJcbiAgICAgICAgICAgICAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByLm9wdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChvKSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby50ZXh0ICYmIG8udmFsdWUgPyBgJHtvLnRleHR9ICgke28udmFsdWV9KWAgOiBvLnRleHQgfHwgby52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpXHJcbiAgICAgICAgICAgICAgICAgICAgICB9fTwvc3BhblxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgdi1pZj1cInNob3dTYXZlXCIgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxyXG4gICAgICAgICAgPG4tYnV0dG9uIHYtaWY9XCJzYXZlU3RhdGUgPT09ICdzYXZlZCcgJiYgIXJlc3RhcnRlZFwiIHR5cGU9XCJwcmltYXJ5XCIgc3Ryb25nIEBjbGljaz1cImFwcGx5XCJcclxuICAgICAgICAgICAgPkFwcGx5PC9uLWJ1dHRvblxyXG4gICAgICAgICAgPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwidGV4dC14cyBmb250LW1lZGl1bSBtaW4taC1bMXJlbV0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgIDx0cmFuc2l0aW9uIG5hbWU9XCJmYWRlXCI+PHNwYW4gdi1pZj1cInNhdmVTdGF0ZSA9PT0gJ3NhdmluZydcIj5TYXZpbmfigKY8L3NwYW4+PC90cmFuc2l0aW9uPlxyXG4gICAgICAgICAgPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgICAgICAgPHNwYW4gdi1pZj1cInNhdmVTdGF0ZSA9PT0gJ3NhdmVkJ1wiIGNsYXNzPVwidGV4dC1zdWNjZXNzXCI+U2F2ZWQ8L3NwYW4+XHJcbiAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9oZWFkZXI+XHJcblxyXG4gICAgPGRpdiB2LWlmPVwiaXNSZWFkeVwiIGNsYXNzPVwic3BhY2UteS00XCI+XHJcbiAgICAgIDxzZWN0aW9uXHJcbiAgICAgICAgdi1mb3I9XCJ0YWIgaW4gdGFic0ZpbHRlcmVkXCJcclxuICAgICAgICA6aWQ9XCJ0YWIuaWRcIlxyXG4gICAgICAgIDprZXk9XCJ0YWIuaWRcIlxyXG4gICAgICAgIDpyZWY9XCIoZWwpID0+IHNldFNlY3Rpb25SZWYodGFiLmlkLCBlbClcIlxyXG4gICAgICAgIGNsYXNzPVwic2Nyb2xsLW10LTI0XCJcclxuICAgICAgPlxyXG4gICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgYmxvY2tcclxuICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgY2xhc3M9XCJqdXN0aWZ5LWJldHdlZW4gIXB4LTMgIXB5LTIgYmctbGlnaHQvODAgZGFyazpiZy1zdXJmYWNlLzcwIGJhY2tkcm9wLWJsdXIgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHJvdW5kZWQteGxcIlxyXG4gICAgICAgICAgOmFyaWEtZXhwYW5kZWQ9XCJpc09wZW4odGFiLmlkKVwiXHJcbiAgICAgICAgICA6YXJpYS1jb250cm9scz1cInRhYi5pZCArICctcGFuZWwnXCJcclxuICAgICAgICAgIEBjbGljaz1cInRvZ2dsZSh0YWIuaWQpXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtc2VtaWJvbGRcIj57eyAkdCh0YWIubmFtZSkgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxpXHJcbiAgICAgICAgICAgICAgOmNsYXNzPVwiW1xyXG4gICAgICAgICAgICAgICAgJ2ZhcyB0ZXh0LXhzIHRyYW5zaXRpb24tdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgIGlzT3Blbih0YWIuaWQpID8gJ2ZhLWNoZXZyb24tdXAnIDogJ2ZhLWNoZXZyb24tZG93bicsXHJcbiAgICAgICAgICAgICAgXVwiXHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDx0cmFuc2l0aW9uIG5hbWU9XCJmYWRlXCI+XHJcbiAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgIHYtc2hvdz1cImlzT3Blbih0YWIuaWQpXCJcclxuICAgICAgICAgICAgOmlkPVwidGFiLmlkICsgJy1wYW5lbCdcIlxyXG4gICAgICAgICAgICBjbGFzcz1cIm10LTIgYmctbGlnaHQvODAgZGFyazpiZy1zdXJmYWNlLzcwIGJhY2tkcm9wLWJsdXItc20gYm9yZGVyIGJvcmRlci1kYXJrLzUgZGFyazpib3JkZXItbGlnaHQvNSByb3VuZGVkLXhsIHNoYWRvdy1zbSBwLTYgc3BhY2UteS02XCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGNvbXBvbmVudCA6aXM9XCJ0YWIuY29tcG9uZW50XCIgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvdHJhbnNpdGlvbj5cclxuICAgICAgPC9zZWN0aW9uPlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiB2LWVsc2UgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjAgc3BhY2UteS0yXCI+XHJcbiAgICAgIDxkaXYgdi1pZj1cImlzTG9hZGluZ1wiPkxvYWRpbmcuLi48L2Rpdj5cclxuICAgICAgPGRpdiB2LWVsc2UtaWY9XCJpc0Vycm9yXCIgY2xhc3M9XCJ0ZXh0LWRhbmdlciBzcGFjZS15LTJcIj5cclxuICAgICAgICA8ZGl2PkZhaWxlZCB0byBsb2FkIGNvbmZpZ3VyYXRpb24uPC9kaXY+XHJcbiAgICAgICAgPG4tYnV0dG9uIHR5cGU9XCJwcmltYXJ5XCIgc3Ryb25nIDpkaXNhYmxlZD1cImlzTG9hZGluZ1wiIEBjbGljaz1cInN0b3JlLnJlbG9hZENvbmZpZz8uKClcIlxyXG4gICAgICAgICAgPlJldHJ5PC9uLWJ1dHRvblxyXG4gICAgICAgID5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwib3BhY2l0eS02MFwiPk5vIGNvbmZpZ3VyYXRpb24gbG9hZGVkLjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPGRpdiBjbGFzcz1cInRleHQteHNcIj5cclxuICAgICAgPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgICA8ZGl2IHYtaWY9XCJzYXZlU3RhdGUgPT09ICdzYXZlZCcgJiYgIXJlc3RhcnRlZCAmJiAhYXV0b1NhdmVcIiBjbGFzcz1cInRleHQtc3VjY2Vzc1wiPlxyXG4gICAgICAgICAgU2F2ZWQuIENsaWNrIEFwcGx5IHRvIHJlc3RhcnQuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvdHJhbnNpdGlvbj5cclxuICAgICAgPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgICA8ZGl2IHYtaWY9XCJyZXN0YXJ0ZWRcIiBjbGFzcz1cInRleHQtc3VjY2Vzc1wiPlJlc3RhcnQgdHJpZ2dlcmVkLjwvZGl2PlxyXG4gICAgICA8L3RyYW5zaXRpb24+XHJcbiAgICA8L2Rpdj5cclxuICAgIDx0cmFuc2l0aW9uIG5hbWU9XCJzbGlkZS1mYWRlXCI+XHJcbiAgICAgIDxkaXYgdi1pZj1cIihkaXJ0eSAmJiAhYXV0b1NhdmUpIHx8IG1hbnVhbFVuc2F2ZWRcIiBjbGFzcz1cImZpeGVkIGJvdHRvbS00IHJpZ2h0LTYgei0zMFwiPlxyXG4gICAgICAgIDxkaXZcclxuICAgICAgICAgIDpjbGFzcz1cIltcclxuICAgICAgICAgICAgJ2JhY2tkcm9wLWJsdXIgcm91bmRlZC1sZyBzaGFkb3cgcHgtNCBweS0yIGJvcmRlciB0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAgZWFzZS1vdXQnLFxyXG4gICAgICAgICAgICBtYW51YWxVbnNhdmVkXHJcbiAgICAgICAgICAgICAgPyAnYmctd2FybmluZy85NSB0ZXh0LWRhcmsgYm9yZGVyLXdhcm5pbmcvNjAgZGFyazpiZy13YXJuaW5nLzIwIGRhcms6dGV4dC13YXJuaW5nIGRhcms6Ym9yZGVyLXdhcm5pbmcvNDAnXHJcbiAgICAgICAgICAgICAgOiAnYmctbGlnaHQvOTAgZGFyazpiZy1zdXJmYWNlLzkwIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwJyxcclxuICAgICAgICAgIF1cIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1tZWRpdW0gaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgPEx1Y2lkZUljb25cclxuICAgICAgICAgICAgICAgIHYtaWY9XCJtYW51YWxVbnNhdmVkXCJcclxuICAgICAgICAgICAgICAgIG5hbWU9XCJmYS1jaXJjbGUtZXhjbGFtYXRpb25cIlxyXG4gICAgICAgICAgICAgICAgOnNpemU9XCIxNFwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInRleHQtd2FybmluZyBkYXJrOnRleHQtd2FybmluZ1wiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8c3Bhbj57eyB1bnNhdmVkTGFiZWwgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgOnR5cGU9XCJtYW51YWxVbnNhdmVkID8gJ3dhcm5pbmcnIDogJ3ByaW1hcnknXCJcclxuICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJzYXZlU3RhdGUgPT09ICdzYXZpbmcnXCJcclxuICAgICAgICAgICAgICBAY2xpY2s9XCJzYXZlXCJcclxuICAgICAgICAgICAgICA+U2F2ZTwvbi1idXR0b25cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzYXZlU3RhdGUgPT09ICdlcnJvcidcIiBjbGFzcz1cIm10LTEgdGV4dC14cyB0ZXh0LWRhbmdlciBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAge3sgc3RvcmUudmFsaWRhdGlvbkVycm9yIHx8ICdTYXZlIGZhaWxlZC4gQ2hlY2sgZmllbGRzIGZvciBlcnJvcnMuJyB9fVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC90cmFuc2l0aW9uPlxyXG4gIDwvbWFpbj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbi8vIEB0cy1ub2NoZWNrXHJcbmltcG9ydCB7XHJcbiAgcmVmLFxyXG4gIGNvbXB1dGVkLFxyXG4gIG9uTW91bnRlZCxcclxuICBvblVubW91bnRlZCxcclxuICB3YXRjaCxcclxuICBtYXJrUmF3LFxyXG4gIGRlZmluZUFzeW5jQ29tcG9uZW50LFxyXG4gIG5leHRUaWNrLFxyXG59IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IE5JbnB1dCwgTkJ1dHRvbiwgdXNlTWVzc2FnZSB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgdXNlUm91dGUsIHVzZVJvdXRlciB9IGZyb20gJ3Z1ZS1yb3V0ZXInO1xyXG5pbXBvcnQgR2VuZXJhbCBmcm9tICdAL2NvbmZpZ3MvdGFicy9HZW5lcmFsLnZ1ZSc7XHJcbmltcG9ydCBJbnB1dHMgZnJvbSAnQC9jb25maWdzL3RhYnMvSW5wdXRzLnZ1ZSc7XHJcbmltcG9ydCBOZXR3b3JrIGZyb20gJ0AvY29uZmlncy90YWJzL05ldHdvcmsudnVlJztcclxuaW1wb3J0IEZpbGVzIGZyb20gJ0AvY29uZmlncy90YWJzL0ZpbGVzLnZ1ZSc7XHJcbmltcG9ydCBBZHZhbmNlZCBmcm9tICdAL2NvbmZpZ3MvdGFicy9BZHZhbmNlZC52dWUnO1xyXG5pbXBvcnQgUGxheW5pdGUgZnJvbSAnQC9jb25maWdzL3RhYnMvUGxheW5pdGUudnVlJztcclxuaW1wb3J0IEF1ZGlvVmlkZW8gZnJvbSAnQC9jb25maWdzL3RhYnMvQXVkaW9WaWRlby52dWUnO1xyXG5pbXBvcnQgQ2FwdHVyZSBmcm9tICdAL2NvbmZpZ3MvdGFicy9DYXB0dXJlLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgeyBzdG9yZVRvUmVmcyB9IGZyb20gJ3BpbmlhJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuXHJcbmNvbnN0IHN0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgeyBjb25maWcsIG1ldGFkYXRhIH0gPSBzdG9yZVRvUmVmcyhzdG9yZSk7XHJcbmNvbnN0IHBsYXRmb3JtID0gY29tcHV0ZWQoKCkgPT4gKG1ldGFkYXRhLnZhbHVlPy5wbGF0Zm9ybSB8fCAnJykudG9Mb3dlckNhc2UoKSk7XHJcbmNvbnN0IG1lc3NhZ2UgPSB1c2VNZXNzYWdlKCk7XHJcbi8vIEF1dGggc3RvcmUgKHRvcC1sZXZlbCwgc2luZ2xlIGluc3RhbmNlKVxyXG5jb25zdCBhdXRoID0gdXNlQXV0aFN0b3JlKCk7XHJcblxyXG4vLyBkZXJpdmUgbG9hZGluZy9lcnJvci9yZWFkeSBmcm9tIHRoZSBzdG9yZSBpbnN0ZWFkIG9mIGxvY2FsIGZsYWdzXHJcbmNvbnN0IGlzTG9hZGluZyA9IGNvbXB1dGVkKCgpID0+IHN0b3JlLmxvYWRpbmcgPT09IHRydWUpO1xyXG5jb25zdCBpc0Vycm9yID0gY29tcHV0ZWQoKCkgPT4gc3RvcmUuZXJyb3IgIT0gbnVsbCk7XHJcbmNvbnN0IGlzUmVhZHkgPSBjb21wdXRlZCgoKSA9PiAhIWNvbmZpZy52YWx1ZSAmJiAhaXNMb2FkaW5nLnZhbHVlICYmICFpc0Vycm9yLnZhbHVlKTtcclxuXHJcbmNvbnN0IHNhdmVTdGF0ZSA9IGNvbXB1dGVkKCgpID0+IHN0b3JlLnNhdmluZ1N0YXRlIHx8ICdpZGxlJyk7XHJcbmNvbnN0IHJlc3RhcnRlZCA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGRpcnR5ID0gcmVmKGZhbHNlKTtcclxuY29uc3QgYXV0b1NhdmUgPSByZWYodHJ1ZSk7XHJcbmNvbnN0IG1hbnVhbFVuc2F2ZWQgPSBjb21wdXRlZCgoKSA9PiBzdG9yZS5tYW51YWxEaXJ0eSA9PT0gdHJ1ZSk7XHJcbmNvbnN0IHNob3dTYXZlID0gY29tcHV0ZWQoKCkgPT4gbWFudWFsVW5zYXZlZC52YWx1ZSB8fCAhYXV0b1NhdmUudmFsdWUpO1xyXG5jb25zdCB1bnNhdmVkTGFiZWwgPSBjb21wdXRlZCgoKSA9PlxyXG4gIG1hbnVhbFVuc2F2ZWQudmFsdWVcclxuICAgID8gJ01hbnVhbCBzYXZlIHJlcXVpcmVkIGZvciByZWNlbnQgY2hhbmdlczsgdGhlc2Ugc2V0dGluZ3Mgd2lsbCBub3QgYXV0by1zYXZlLidcclxuICAgIDogJ1Vuc2F2ZWQgY2hhbmdlcycsXHJcbik7XHJcblxyXG5jb25zdCBtYWluRWwgPSByZWYobnVsbCk7XHJcbmNvbnN0IHNlYXJjaFF1ZXJ5ID0gcmVmKCcnKTtcclxuY29uc3Qgc2VhcmNoT3BlbiA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHNlYXJjaFJlc3VsdHMgPSByZWYoW10pO1xyXG5jb25zdCBzZWFyY2hJbmRleCA9IHJlZihbXSk7IC8vIHsgc2VjdGlvbklkLCBsYWJlbCwgcGF0aCwgZWwgfVxyXG5jb25zdCBzZWN0aW9uUmVmcyA9IG5ldyBNYXAoKTtcclxuXHJcbmZ1bmN0aW9uIHNldFNlY3Rpb25SZWYoaWQsIGVsKSB7XHJcbiAgaWYgKGVsKSBzZWN0aW9uUmVmcy5zZXQoaWQsIGVsKTtcclxuICBlbHNlIHNlY3Rpb25SZWZzLmRlbGV0ZShpZCk7XHJcbn1cclxuXHJcbmNvbnN0IHRhYnMgPSBbXHJcbiAgeyBpZDogJ2dlbmVyYWwnLCBuYW1lOiAnR2VuZXJhbCcsIGNvbXBvbmVudDogbWFya1JhdyhHZW5lcmFsKSB9LFxyXG4gIHsgaWQ6ICdpbnB1dCcsIG5hbWU6ICdJbnB1dCcsIGNvbXBvbmVudDogbWFya1JhdyhJbnB1dHMpIH0sXHJcbiAgeyBpZDogJ2F2JywgbmFtZTogJ0F1ZGlvIC8gVmlkZW8nLCBjb21wb25lbnQ6IG1hcmtSYXcoQXVkaW9WaWRlbykgfSxcclxuICB7IGlkOiAnY2FwdHVyZScsIG5hbWU6ICdDYXB0dXJlJywgY29tcG9uZW50OiBtYXJrUmF3KENhcHR1cmUpIH0sXHJcbiAgeyBpZDogJ25ldHdvcmsnLCBuYW1lOiAnTmV0d29yaycsIGNvbXBvbmVudDogbWFya1JhdyhOZXR3b3JrKSB9LFxyXG4gIHsgaWQ6ICdmaWxlcycsIG5hbWU6ICdGaWxlcycsIGNvbXBvbmVudDogbWFya1JhdyhGaWxlcykgfSxcclxuICB7IGlkOiAnYWR2YW5jZWQnLCBuYW1lOiAnQWR2YW5jZWQnLCBjb21wb25lbnQ6IG1hcmtSYXcoQWR2YW5jZWQpIH0sXHJcbiAgeyBpZDogJ3BsYXluaXRlJywgbmFtZTogJ1BsYXluaXRlJywgY29tcG9uZW50OiBtYXJrUmF3KFBsYXluaXRlKSB9LFxyXG5dO1xyXG5cclxuY29uc3QgdGFic0ZpbHRlcmVkID0gY29tcHV0ZWQoKCkgPT5cclxuICB0YWJzLmZpbHRlcigodCkgPT4gKHQuaWQgPT09ICdydHNzJyA/IHBsYXRmb3JtLnZhbHVlID09PSAnd2luZG93cycgOiB0cnVlKSksXHJcbik7XHJcblxyXG5jb25zdCBvcGVuU2VjdGlvbnMgPSByZWYobmV3IFNldChbJ2dlbmVyYWwnXSkpO1xyXG5jb25zdCBpc09wZW4gPSAoaWQpID0+IG9wZW5TZWN0aW9ucy52YWx1ZS5oYXMoaWQpO1xyXG5jb25zdCB0b2dnbGUgPSAoaWQpID0+IHtcclxuICBjb25zdCBzID0gbmV3IFNldChvcGVuU2VjdGlvbnMudmFsdWUpO1xyXG4gIHMuaGFzKGlkKSA/IHMuZGVsZXRlKGlkKSA6IHMuYWRkKGlkKTtcclxuICBvcGVuU2VjdGlvbnMudmFsdWUgPSBzO1xyXG4gIC8vIFdoZW4gZXhwYW5kaW5nLCAoY2hlYXBseSkgcmVidWlsZCBpbmRleCBzbyBuZXcgY29udHJvbHMgYXJlIHNlYXJjaGFibGVcclxuICBpZiAocy5oYXMoaWQpKSBxdWV1ZUJ1aWxkSW5kZXgoKTtcclxufTtcclxuXHJcbmxldCBzdXBwcmVzc1JvdXRlU2Nyb2xsID0gZmFsc2U7XHJcblxyXG5jb25zdCByb3V0ZSA9IHVzZVJvdXRlKCk7XHJcbmNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gcnVuUm91dGVKdW1wKHJhd0p1bXA6IHVua25vd24pIHtcclxuICBpZiAodHlwZW9mIHJhd0p1bXAgIT09ICdzdHJpbmcnKSByZXR1cm47XHJcbiAgY29uc3QgcXVlcnkgPSByYXdKdW1wLnRyaW0oKTtcclxuICBpZiAoIXF1ZXJ5KSByZXR1cm47XHJcblxyXG4gIHF1ZXVlQnVpbGRJbmRleCgpO1xyXG4gIGF3YWl0IG5leHRUaWNrKCk7XHJcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKSk7XHJcblxyXG4gIHNlYXJjaFF1ZXJ5LnZhbHVlID0gcXVlcnk7XHJcbiAgYXdhaXQgbmV4dFRpY2soKTtcclxuXHJcbiAgaWYgKHNlYXJjaFJlc3VsdHMudmFsdWUubGVuZ3RoKSB7XHJcbiAgICBhd2FpdCBnb1RvKHNlYXJjaFJlc3VsdHMudmFsdWVbMF0pO1xyXG4gIH1cclxufVxyXG5cclxub25Nb3VudGVkKGFzeW5jICgpID0+IHtcclxuICB0cnkge1xyXG4gICAgaWYgKGF1dGggJiYgdHlwZW9mIGF1dGguaW5pdCA9PT0gJ2Z1bmN0aW9uJykgYXdhaXQgYXV0aC5pbml0KCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ2F1dGguaW5pdCBmYWlsZWQnLCBlcnIpO1xyXG4gIH1cclxuXHJcbiAgLy8gV2FpdCBmb3IgYXV0aGVudGljYXRpb24gYmVmb3JlIGNhbGxpbmcgQVBJcyBkdXJpbmcgbW91bnRcclxuICBhd2FpdCBhdXRoLndhaXRGb3JBdXRoZW50aWNhdGlvbigpO1xyXG4gIGF3YWl0IHN0b3JlLmZldGNoQ29uZmlnKCk7XHJcbiAgaWYgKGNvbmZpZy52YWx1ZSkgcXVldWVCdWlsZEluZGV4KCk7XHJcblxyXG4gIC8vIElmIGEgdGFyZ2V0IHNlY3Rpb24gaXMgaW4gdGhlIFVSTCwgc2Nyb2xsIG9uY2UgcmVhZHkvcmVuZGVyZWRcclxuICBpZiAodHlwZW9mIHJvdXRlLnF1ZXJ5LnNlYyA9PT0gJ3N0cmluZycpIHtcclxuICAgIGlmIChpc1JlYWR5LnZhbHVlKSB7XHJcbiAgICAgIGF3YWl0IG5leHRUaWNrKCk7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2Nyb2xsVG9PcGVuKHJvdXRlLnF1ZXJ5LnNlYyBhcyBzdHJpbmcpLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHN0b3AgPSB3YXRjaChcclxuICAgICAgICAoKSA9PiBpc1JlYWR5LnZhbHVlLFxyXG4gICAgICAgIGFzeW5jIChyZWFkeSkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgIHN0b3AoKTtcclxuICAgICAgICAgICAgYXdhaXQgbmV4dFRpY2soKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzY3JvbGxUb09wZW4ocm91dGUucXVlcnkuc2VjIGFzIHN0cmluZyksIDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyBpbW1lZGlhdGU6IGZhbHNlIH0sXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHJvdXRlLnF1ZXJ5Lmp1bXAgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBpZiAoaXNSZWFkeS52YWx1ZSkge1xyXG4gICAgICBhd2FpdCBydW5Sb3V0ZUp1bXAocm91dGUucXVlcnkuanVtcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBzdG9wID0gd2F0Y2goXHJcbiAgICAgICAgKCkgPT4gaXNSZWFkeS52YWx1ZSxcclxuICAgICAgICBhc3luYyAocmVhZHkpID0+IHtcclxuICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICBzdG9wKCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHJ1blJvdXRlSnVtcChyb3V0ZS5xdWVyeS5qdW1wKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgaW1tZWRpYXRlOiBmYWxzZSB9LFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBXaGVuIGF1dGggYmVjb21lcyByZWFkeSBvciBhdXRoZW50aWNhdGVkLCByZWJ1aWxkIGluZGV4IChkZWJvdW5jZWQgYSBiaXQpXHJcbmxldCBhdXRoVGltZXIgPSBudWxsO1xyXG53YXRjaChcclxuICAoKSA9PiAoeyByZWFkeTogYXV0aC5yZWFkeSwgYXV0aGVkOiBhdXRoLmlzQXV0aGVudGljYXRlZCB9KSxcclxuICAoKSA9PiB7XHJcbiAgICBjbGVhclRpbWVvdXQoYXV0aFRpbWVyKTtcclxuICAgIGF1dGhUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gcXVldWVCdWlsZEluZGV4KCksIDEyMCk7XHJcbiAgfSxcclxuICB7IGRlZXA6IHRydWUgfSxcclxuKTtcclxub25Vbm1vdW50ZWQoKCkgPT4ge1xyXG4gIGlmIChhdXRoVGltZXIpIGNsZWFyVGltZW91dChhdXRoVGltZXIpO1xyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmUoKSB7XHJcbiAgLy8gR3VhcmQgYXV0b3NhdmUvYmFja2dyb3VuZCBzYXZlIHdoZW4gbm90IGF1dGhlbnRpY2F0ZWRcclxuICBpZiAoIWF1dGguaXNBdXRoZW50aWNhdGVkKSByZXR1cm47XHJcbiAgaWYgKCFjb25maWcudmFsdWUpIHJldHVybjtcclxuICByZXN0YXJ0ZWQudmFsdWUgPSBmYWxzZTtcclxuICBjb25zdCBvayA9IGF3YWl0IChzdG9yZS5zYXZlID8gc3RvcmUuc2F2ZSgpIDogUHJvbWlzZS5yZXNvbHZlKGZhbHNlKSk7XHJcbiAgaWYgKG9rKSB7XHJcbiAgICBkaXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBtZXNzYWdlLmVycm9yKHN0b3JlLnZhbGlkYXRpb25FcnJvciB8fCAnU2F2ZSBmYWlsZWQuIENoZWNrIGZpZWxkcyBmb3IgZXJyb3JzLicsIHtcclxuICAgICAgICBkdXJhdGlvbjogNTAwMCxcclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIHt9XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBhcHBseSgpIHtcclxuICBhd2FpdCBzYXZlKCk7XHJcbiAgaWYgKHNhdmVTdGF0ZS52YWx1ZSAhPT0gJ3NhdmVkJykgcmV0dXJuO1xyXG4gIHJlc3RhcnRlZC52YWx1ZSA9IHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAucG9zdChcclxuICAgICAgJy9hcGkvcmVzdGFydCcsXHJcbiAgICAgIHt9LFxyXG4gICAgICB7IGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LCB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9LFxyXG4gICAgKTtcclxuICAgIGlmICghcmVzIHx8IHJlcy5zdGF0dXMgPj0gNDAwKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignUmVzdGFydCByZXF1ZXN0IGZhaWxlZCcsIHJlcz8uc3RhdHVzKTtcclxuICAgICAgcmVzdGFydGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ1Jlc3RhcnQgZmFpbGVkJywgZXJyKTtcclxuICAgIHJlc3RhcnRlZC52YWx1ZSA9IGZhbHNlO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gc3RhdGUgd2lsbCBzZXR0bGUgYmFjayB0byBpZGxlIHZpYSB0aGUgc3RvcmVcclxuICAgICAgcmVzdGFydGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIE1hcmsgZGlydHkgLyBhdXRvc2F2ZSB3aGVuIHZlcnNpb24gaW5jcmVtZW50cyAodXNlciBjaGFuZ2VkIHNvbWV0aGluZylcclxud2F0Y2goXHJcbiAgKCkgPT4gc3RvcmUudmVyc2lvbixcclxuICAodiwgb2xkVikgPT4ge1xyXG4gICAgaWYgKCFpc1JlYWR5LnZhbHVlIHx8IG9sZFYgPT09IHVuZGVmaW5lZCkgcmV0dXJuOyAvLyBpZ25vcmUgYmVmb3JlIHJlYWR5XHJcbiAgICBkaXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICBpZiAoc3RvcmUuc2F2aW5nU3RhdGUgIT09IHVuZGVmaW5lZCkgc3RvcmUuc2F2aW5nU3RhdGUgPSAnZGlydHknO1xyXG4gIH0sXHJcbik7XHJcblxyXG5jb25zdCBnb1NlY3Rpb24gPSAoaWQpID0+IHtcclxuICBjb25zdCBkZXN0ID0geyBwYXRoOiAnL3NldHRpbmdzJywgcXVlcnk6IHsgc2VjOiBpZCB9IH07XHJcbiAgcm91dGUucGF0aCA9PT0gJy9zZXR0aW5ncycgPyByb3V0ZXIucmVwbGFjZShkZXN0KSA6IHJvdXRlci5wdXNoKGRlc3QpO1xyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlU2VjdGlvbk9wZW4oaWQpIHtcclxuICBpZiAoIWlkKSByZXR1cm47XHJcbiAgaWYgKCFpc09wZW4oaWQpKSB0b2dnbGUoaWQpO1xyXG4gIGF3YWl0IG5leHRUaWNrKCk7XHJcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNjcm9sbFRvT3BlbihpZCkge1xyXG4gIGlmICghaWQpIHJldHVybjtcclxuICBhd2FpdCBlbnN1cmVTZWN0aW9uT3BlbihpZCk7XHJcbiAgY29uc3QgZWwgPSBzZWN0aW9uUmVmcy5nZXQoaWQpO1xyXG4gIGlmIChlbCkgZWwuc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogJ3Ntb290aCcsIGJsb2NrOiAnc3RhcnQnIH0pO1xyXG59XHJcbndhdGNoKFxyXG4gICgpID0+IHJvdXRlLnF1ZXJ5LnNlYyxcclxuICAoaWQpID0+IHtcclxuICAgIGlmICh0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSByZXR1cm47XHJcbiAgICBpZiAoc3VwcHJlc3NSb3V0ZVNjcm9sbCkgcmV0dXJuO1xyXG4gICAgaWYgKGlzUmVhZHkudmFsdWUpIHtcclxuICAgICAgc2Nyb2xsVG9PcGVuKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHN0b3AgPSB3YXRjaChcclxuICAgICAgICAoKSA9PiBpc1JlYWR5LnZhbHVlLFxyXG4gICAgICAgIChyZWFkeSkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgIHN0b3AoKTtcclxuICAgICAgICAgICAgc2Nyb2xsVG9PcGVuKGlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgaW1tZWRpYXRlOiBmYWxzZSB9LFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH0sXHJcbik7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiByb3V0ZS5xdWVyeS5qdW1wLFxyXG4gIGFzeW5jIChqdW1wKSA9PiB7XHJcbiAgICBpZiAoIWlzUmVhZHkudmFsdWUpIHJldHVybjtcclxuICAgIGF3YWl0IHJ1blJvdXRlSnVtcChqdW1wKTtcclxuICB9LFxyXG4pO1xyXG5cclxuZnVuY3Rpb24gYnVpbGRTZWFyY2hJbmRleCgpIHtcclxuICBjb25zdCByb290ID0gbWFpbkVsLnZhbHVlO1xyXG4gIGlmICghcm9vdCkgcmV0dXJuO1xyXG4gIGNvbnN0IGl0ZW1zID0gW10gYXMgQXJyYXk8e1xyXG4gICAgc2VjdGlvbklkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHBhdGg6IHN0cmluZztcclxuICAgIGVsOiBFbGVtZW50O1xyXG4gICAgZGVzYz86IHN0cmluZztcclxuICAgIG9wdGlvbnM/OiBBcnJheTx7IHRleHQ6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9PjtcclxuICAgIG9wdGlvbnNUZXh0Pzogc3RyaW5nO1xyXG4gIH0+O1xyXG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICBjb25zdCBzZWxlY3RvclRhcmdldHMgPVxyXG4gICAgJ2lucHV0LHNlbGVjdCx0ZXh0YXJlYSwuZm9ybS1jb250cm9sLC5uLWlucHV0LC5uLXNlbGVjdCwubi1pbnB1dC1udW1iZXIsLm4tY2hlY2tib3ggaW5wdXQsLm4tc3dpdGNoIGlucHV0LFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJztcclxuXHJcbiAgY29uc3Qgc2VjdGlvbnMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbCgnc2VjdGlvbltpZF0nKSkgYXMgSFRNTEVsZW1lbnRbXTtcclxuXHJcbiAgY29uc3QgaXNEZXNjQ2xhc3MgPSAoY2xzPzogc3RyaW5nIHwgbnVsbCkgPT5cclxuICAgICEhY2xzICYmIChjbHMuaW5jbHVkZXMoJ3RleHQteHMnKSB8fCBjbHMuaW5jbHVkZXMoJ2Zvcm0tdGV4dCcpIHx8IGNscy5pbmNsdWRlcygndGV4dC14cycpKTtcclxuXHJcbiAgY29uc3QgZXh0cmFjdERlc2NyaXB0aW9uID0gKHNvdXJjZUVsOiBFbGVtZW50IHwgbnVsbCwgZXhwbGljaXQ/OiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChleHBsaWNpdCAmJiBleHBsaWNpdC50cmltKCkubGVuZ3RoKSByZXR1cm4gZXhwbGljaXQudHJpbSgpO1xyXG4gICAgaWYgKCFzb3VyY2VFbCkgcmV0dXJuICcnO1xyXG4gICAgbGV0IGRlc2NUZXh0ID0gJyc7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBzb3VyY2VFbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlID0gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGl2LHAsc21hbGwnKSkuZmluZChcclxuICAgICAgICAgIChkKSA9PiBkICE9PSBzb3VyY2VFbCAmJiBpc0Rlc2NDbGFzcyhkLmNsYXNzTmFtZSkgJiYgZC50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoID4gMCxcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChjYW5kaWRhdGUpIGRlc2NUZXh0ID0gY2FuZGlkYXRlLnRleHRDb250ZW50LnRyaW0oKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWRlc2NUZXh0KSB7XHJcbiAgICAgICAgbGV0IHNpYiA9IHNvdXJjZUVsLm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICBsZXQgc3RlcHMgPSAwO1xyXG4gICAgICAgIHdoaWxlIChzaWIgJiYgc3RlcHMgPCA2KSB7XHJcbiAgICAgICAgICBpZiAoaXNEZXNjQ2xhc3Moc2liLmNsYXNzTmFtZSkgJiYgc2liLnRleHRDb250ZW50LnRyaW0oKSkge1xyXG4gICAgICAgICAgICBkZXNjVGV4dCA9IHNpYi50ZXh0Q29udGVudC50cmltKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2liID0gc2liLm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgIHN0ZXBzKys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCdidWlsZFNlYXJjaEluZGV4OiBkZXNjcmlwdGlvbiBleHRyYWN0aW9uIGZhaWxlZCcsIGVycik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVzY1RleHQ7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVzb2x2ZVRhcmdldCA9IChcclxuICAgIHNlY3Rpb25FbDogSFRNTEVsZW1lbnQsXHJcbiAgICBzb3VyY2VFbDogRWxlbWVudCB8IG51bGwsXHJcbiAgICBmb3JJZD86IHN0cmluZyB8IG51bGwsXHJcbiAgICB0YXJnZXRPdmVycmlkZT86IEVsZW1lbnQgfCBudWxsLFxyXG4gICkgPT4ge1xyXG4gICAgaWYgKHRhcmdldE92ZXJyaWRlKSByZXR1cm4gdGFyZ2V0T3ZlcnJpZGU7XHJcbiAgICBsZXQgdGFyZ2V0OiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBjb25zdCBsb29rdXBJZCA9IGZvcklkIHx8IHNvdXJjZUVsPy5nZXRBdHRyaWJ1dGU/LignZGF0YS1zZWFyY2gtdGFyZ2V0JykgfHwgbnVsbDtcclxuICAgIGlmIChsb29rdXBJZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRhcmdldCA9IHNlY3Rpb25FbC5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUobG9va3VwSWQpKTtcclxuICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdidWlsZFNlYXJjaEluZGV4OiBDU1MuZXNjYXBlIGxvb2t1cCBmYWlsZWQnLCBlcnIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIXRhcmdldCAmJiBzb3VyY2VFbCkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBzb3VyY2VFbC5jbG9zZXN0Py4oJ2RpdicpIHx8IHNvdXJjZUVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICB0YXJnZXQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWxlY3RvclRhcmdldHMpO1xyXG4gICAgICAgIGlmICghdGFyZ2V0KSB0YXJnZXQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLm4tY2hlY2tib3gsIC5uLXN3aXRjaCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghdGFyZ2V0KSB0YXJnZXQgPSBzb3VyY2VFbC5xdWVyeVNlbGVjdG9yPy4oc2VsZWN0b3JUYXJnZXRzKSB8fCBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKCF0YXJnZXQgJiYgbG9va3VwSWQpIHtcclxuICAgICAgdGFyZ2V0ID0gc2VjdGlvbkVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JUYXJnZXRzICsgYFtuYW1lPVwiJHtsb29rdXBJZH1cIl1gKTtcclxuICAgIH1cclxuICAgIGlmICghdGFyZ2V0ICYmIHNvdXJjZUVsKSB7XHJcbiAgICAgIHRhcmdldCA9IHNvdXJjZUVsLmNsb3Nlc3Q/LignLm4tY2hlY2tib3gsIC5uLXN3aXRjaCcpIHx8IG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGV4dHJhY3RPcHRpb25zID0gKHRhcmdldDogRWxlbWVudCB8IG51bGwsIHNvdXJjZUVsOiBFbGVtZW50IHwgbnVsbCkgPT4ge1xyXG4gICAgbGV0IG9wdGlvbnNMaXN0OiBBcnJheTx7IHRleHQ6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9PiA9IFtdO1xyXG4gICAgbGV0IG9wdGlvbnNUZXh0ID0gJyc7XHJcbiAgICBjb25zdCBvcHRpb25Tb3VyY2UgPSB0YXJnZXQ/LmNsb3Nlc3Q/LignW2RhdGEtc2VhcmNoLW9wdGlvbnNdJykgfHwgdGFyZ2V0IHx8IHNvdXJjZUVsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQudGFnTmFtZSAmJiB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xyXG4gICAgICAgIG9wdGlvbnNMaXN0ID0gQXJyYXkuZnJvbSh0YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uJykpLm1hcCgobykgPT4gKHtcclxuICAgICAgICAgIHRleHQ6IChvLnRleHRDb250ZW50IHx8ICcnKS50cmltKCksXHJcbiAgICAgICAgICB2YWx1ZTogKG8gYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU/LnRyaW0oKSB8fCAnJyxcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCghb3B0aW9uc0xpc3QgfHwgb3B0aW9uc0xpc3QubGVuZ3RoID09PSAwKSAmJiBvcHRpb25Tb3VyY2UpIHtcclxuICAgICAgICBjb25zdCBkcyA9IG9wdGlvblNvdXJjZS5nZXRBdHRyaWJ1dGU/LignZGF0YS1zZWFyY2gtb3B0aW9ucycpIHx8ICcnO1xyXG4gICAgICAgIGlmIChkcyAmJiB0eXBlb2YgZHMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBvcHRpb25zTGlzdCA9IGRzXHJcbiAgICAgICAgICAgIC5zcGxpdCgnfCcpXHJcbiAgICAgICAgICAgIC5tYXAoKGNodW5rKSA9PiBjaHVuay50cmltKCkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgICAgICAgICAgLm1hcCgocGFpcikgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IFt0ZXh0UmF3LCB2YWxSYXddID0gcGFpci5zcGxpdCgnOjonKTtcclxuICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gKHRleHRSYXcgfHwgJycpLnRyaW0oKTtcclxuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9ICh2YWxSYXcgfHwgJycpLnRyaW0oKTtcclxuICAgICAgICAgICAgICByZXR1cm4geyB0ZXh0LCB2YWx1ZSB9O1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmlsdGVyKChvKSA9PiBvLnRleHQgfHwgby52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChvcHRpb25zTGlzdCAmJiBvcHRpb25zTGlzdC5sZW5ndGgpIHtcclxuICAgICAgICBvcHRpb25zVGV4dCA9IG9wdGlvbnNMaXN0XHJcbiAgICAgICAgICAubWFwKChvKSA9PiBgJHtvLnRleHQgfHwgJyd9ICR7by52YWx1ZSB8fCAnJ31gLnRyaW0oKSlcclxuICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgICAgICAgIC5qb2luKCcgfCAnKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG9wdGlvbnNMaXN0ID0gW107XHJcbiAgICAgIG9wdGlvbnNUZXh0ID0gJyc7XHJcbiAgICAgIGNvbnNvbGUud2FybignYnVpbGRTZWFyY2hJbmRleDogb3B0aW9ucyBleHRyYWN0aW9uIGZhaWxlZCcsIGVycik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBvcHRpb25zTGlzdCwgb3B0aW9uc1RleHQgfTtcclxuICB9O1xyXG5cclxuICBjb25zdCByZWdpc3RlciA9IChcclxuICAgIHNlY3Rpb25FbDogSFRNTEVsZW1lbnQsXHJcbiAgICBzZWN0aW9uSWQ6IHN0cmluZyB8IG51bGwsXHJcbiAgICBzZWN0aW9uVGl0bGU6IHN0cmluZyxcclxuICAgIGxhYmVsVGV4dDogc3RyaW5nLFxyXG4gICAgc291cmNlRWw6IEVsZW1lbnQgfCBudWxsLFxyXG4gICAgZXhwbGljaXREZXNjPzogc3RyaW5nLFxyXG4gICAgdGFyZ2V0T3ZlcnJpZGU/OiBFbGVtZW50IHwgbnVsbCxcclxuICApID0+IHtcclxuICAgIGNvbnN0IGxhYmVsID0gKGxhYmVsVGV4dCB8fCAnJykudHJpbSgpO1xyXG4gICAgaWYgKCFsYWJlbCkgcmV0dXJuO1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChzZWN0aW9uRWwsIHNvdXJjZUVsLCBzb3VyY2VFbD8uZ2V0QXR0cmlidXRlPy4oJ2ZvcicpLCB0YXJnZXRPdmVycmlkZSk7XHJcbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuO1xyXG4gICAgY29uc3Qga2V5ID0gYCR7c2VjdGlvbklkID8/ICd1bmtub3duJ306OiR7bGFiZWx9YDtcclxuICAgIGlmIChzZWVuLmhhcyhrZXkpKSByZXR1cm47XHJcbiAgICBzZWVuLmFkZChrZXkpO1xyXG4gICAgY29uc3QgZGVzYyA9IGV4dHJhY3REZXNjcmlwdGlvbihzb3VyY2VFbCwgZXhwbGljaXREZXNjKTtcclxuICAgIGNvbnN0IHsgb3B0aW9uc0xpc3QsIG9wdGlvbnNUZXh0IH0gPSBleHRyYWN0T3B0aW9ucyh0YXJnZXQsIHNvdXJjZUVsKTtcclxuICAgIGl0ZW1zLnB1c2goe1xyXG4gICAgICBzZWN0aW9uSWQsXHJcbiAgICAgIGxhYmVsLFxyXG4gICAgICBwYXRoOiBgJHtzZWN0aW9uVGl0bGV9IOKAuiAke2xhYmVsfWAsXHJcbiAgICAgIGVsOiB0YXJnZXQsXHJcbiAgICAgIGRlc2MsXHJcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNMaXN0LFxyXG4gICAgICBvcHRpb25zVGV4dCxcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGZvciAoY29uc3Qgc2VjIG9mIHNlY3Rpb25zKSB7XHJcbiAgICBjb25zdCBzZWN0aW9uSWQgPSBzZWMuZ2V0QXR0cmlidXRlKCdpZCcpO1xyXG4gICAgY29uc3Qgc2VjdGlvblRpdGxlID0gc2VjLnF1ZXJ5U2VsZWN0b3IoJ2gzJyk/LnRleHRDb250ZW50Py50cmltKCkgfHwgc2VjdGlvbklkIHx8ICcnO1xyXG4gICAgZm9yIChjb25zdCBsYmwgb2YgQXJyYXkuZnJvbShzZWMucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKSkpIHtcclxuICAgICAgcmVnaXN0ZXIoc2VjLCBzZWN0aW9uSWQsIHNlY3Rpb25UaXRsZSwgbGJsLnRleHRDb250ZW50IHx8ICcnLCBsYmwpO1xyXG4gICAgfVxyXG4gICAgZm9yIChjb25zdCBwcm94eSBvZiBBcnJheS5mcm9tKHNlYy5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zZWFyY2gtbGFiZWxdJykpKSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsID0gcHJveHkuZ2V0QXR0cmlidXRlKCdkYXRhLXNlYXJjaC1sYWJlbCcpIHx8ICcnO1xyXG4gICAgICBjb25zdCBkZXNjID0gcHJveHkuZ2V0QXR0cmlidXRlKCdkYXRhLXNlYXJjaC1kZXNjJykgfHwgJyc7XHJcbiAgICAgIGNvbnN0IGRlZlRleHQgPSBwcm94eS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VhcmNoLWRlZmF1bHQnKSB8fCAnJztcclxuICAgICAgY29uc3QgY29tYmluZWREZXNjID0gW2Rlc2MsIGRlZlRleHRdLmZpbHRlcigocGFydCkgPT4gcGFydCAmJiBwYXJ0LnRyaW0oKS5sZW5ndGgpLmpvaW4oJyAnKTtcclxuICAgICAgbGV0IHRhcmdldDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgICBjb25zdCB0YXJnZXRJZCA9IHByb3h5LmdldEF0dHJpYnV0ZSgnZGF0YS1zZWFyY2gtdGFyZ2V0Jyk7XHJcbiAgICAgIGlmICh0YXJnZXRJZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0YXJnZXQgPSBzZWMucXVlcnlTZWxlY3RvcignIycgKyBDU1MuZXNjYXBlKHRhcmdldElkKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ2J1aWxkU2VhcmNoSW5kZXg6IENTUy5lc2NhcGUgbG9va3VwIGZhaWxlZCcsIGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJlZ2lzdGVyKHNlYywgc2VjdGlvbklkLCBzZWN0aW9uVGl0bGUsIGxhYmVsLCBwcm94eSwgY29tYmluZWREZXNjLCB0YXJnZXQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2VhcmNoSW5kZXgudmFsdWUgPSBpdGVtcztcclxufVxyXG5cclxubGV0IGJ1aWxkUGVuZGluZyA9IGZhbHNlO1xyXG5mdW5jdGlvbiBxdWV1ZUJ1aWxkSW5kZXgoKSB7XHJcbiAgaWYgKGJ1aWxkUGVuZGluZykgcmV0dXJuO1xyXG4gIGJ1aWxkUGVuZGluZyA9IHRydWU7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgIGJ1aWxkUGVuZGluZyA9IGZhbHNlO1xyXG4gICAgYnVpbGRTZWFyY2hJbmRleCgpO1xyXG4gIH0pO1xyXG59XHJcblxyXG53YXRjaChzZWFyY2hRdWVyeSwgKHEpID0+IHtcclxuICBjb25zdCB2ID0gKHEgfHwgJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHRlcm1zID0gdi5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKTtcclxuICBzZWFyY2hPcGVuLnZhbHVlID0gdGVybXMubGVuZ3RoID4gMDtcclxuICBpZiAoIXRlcm1zLmxlbmd0aCkge1xyXG4gICAgc2VhcmNoUmVzdWx0cy52YWx1ZSA9IFtdO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2NvcmUgbWF0Y2hlczogcmVxdWlyZSBhbGwgdGVybXMgdG8gbWF0Y2ggb25lIG9mIHRoZSBmaWVsZHMuIExhYmVsIGhpZ2hlc3QsIG9wdGlvbnMsIHBhdGgsIHRoZW4gZGVzYy5cclxuICBjb25zdCBzY29yZUZvciA9IChpdCkgPT4ge1xyXG4gICAgY29uc3QgbHYgPSBpdC5sYWJlbC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgY29uc3QgcHYgPSBpdC5wYXRoLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBjb25zdCBkdiA9IChpdC5kZXNjIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgY29uc3Qgb3YgPSAoaXQub3B0aW9uc1RleHQgfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBjb25zdCBrdiA9IChpdC5rZXkgfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKSB7XHJcbiAgICAgIGxldCBzID0gMDtcclxuICAgICAgaWYgKGx2LmluY2x1ZGVzKHRlcm0pKSB7XHJcbiAgICAgICAgcyArPSAxMDAgLSBsdi5pbmRleE9mKHRlcm0pO1xyXG4gICAgICAgIGlmIChsdi5zdGFydHNXaXRoKHRlcm0pKSBzICs9IDUwO1xyXG4gICAgICB9IGVsc2UgaWYgKGt2LmluY2x1ZGVzKHRlcm0pKSB7XHJcbiAgICAgICAgcyArPSA5MCAtIGt2LmluZGV4T2YodGVybSk7XHJcbiAgICAgIH0gZWxzZSBpZiAob3YuaW5jbHVkZXModGVybSkpIHtcclxuICAgICAgICBzICs9IDYwIC0gb3YuaW5kZXhPZih0ZXJtKSAvIDEwO1xyXG4gICAgICB9IGVsc2UgaWYgKHB2LmluY2x1ZGVzKHRlcm0pKSB7XHJcbiAgICAgICAgcyArPSA0MCAtIHB2LmluZGV4T2YodGVybSkgLyAxMDA7XHJcbiAgICAgIH0gZWxzZSBpZiAoZHYuaW5jbHVkZXModGVybSkpIHtcclxuICAgICAgICBzICs9IDIwIC0gZHYuaW5kZXhPZih0ZXJtKSAvIDEwMDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIDA7IC8vIG1pc3NpbmcgdGVybVxyXG4gICAgICB9XHJcbiAgICAgIHRvdGFsICs9IHM7XHJcbiAgICB9XHJcbiAgICAvLyBwZW5hbGl6ZSB2ZXJ5IGxvbmcgZGVzY3JpcHRpb25zL3BhdGgvb3B0aW9ucyB0byBwcmVmZXIgY29uY2lzZSBtYXRjaGVzXHJcbiAgICB0b3RhbCAtPSAocHYubGVuZ3RoICsgZHYubGVuZ3RoICsgb3YubGVuZ3RoKSAvIDEwMDA7XHJcbiAgICByZXR1cm4gdG90YWw7XHJcbiAgfTtcclxuXHJcbiAgc2VhcmNoUmVzdWx0cy52YWx1ZSA9IHNlYXJjaEluZGV4LnZhbHVlXHJcbiAgICAubWFwKChpdCkgPT4gKHsgaXQsIHM6IHNjb3JlRm9yKGl0KSB9KSlcclxuICAgIC5maWx0ZXIoKHgpID0+IHgucyA+IDApXHJcbiAgICAuc29ydCgoYSwgYikgPT4gYi5zIC0gYS5zKVxyXG4gICAgLnNsaWNlKDAsIDE1KVxyXG4gICAgLm1hcCgoeCkgPT4geC5pdCk7XHJcbn0pO1xyXG5hc3luYyBmdW5jdGlvbiBqdW1wRmlyc3RSZXN1bHQoKSB7XHJcbiAgaWYgKHNlYXJjaFJlc3VsdHMudmFsdWUubGVuZ3RoKSBhd2FpdCBnb1RvKHNlYXJjaFJlc3VsdHMudmFsdWVbMF0pO1xyXG59XHJcbmFzeW5jIGZ1bmN0aW9uIGdvVG8oaXRlbSkge1xyXG4gIGlmICghaXRlbSkgcmV0dXJuO1xyXG4gIHNlYXJjaE9wZW4udmFsdWUgPSBmYWxzZTtcclxuICBsZXQgc3VwcHJlc3NpbmcgPSBmYWxzZTtcclxuICB0cnkge1xyXG4gICAgaWYgKGl0ZW0uc2VjdGlvbklkKSB7XHJcbiAgICAgIHN1cHByZXNzUm91dGVTY3JvbGwgPSB0cnVlO1xyXG4gICAgICBzdXBwcmVzc2luZyA9IHRydWU7XHJcbiAgICAgIGdvU2VjdGlvbihpdGVtLnNlY3Rpb25JZCk7XHJcbiAgICAgIGF3YWl0IGVuc3VyZVNlY3Rpb25PcGVuKGl0ZW0uc2VjdGlvbklkKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBuZXh0VGljaygpO1xyXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKSk7XHJcblxyXG4gICAgbGV0IHRhcmdldCA9IChpdGVtLmVsIHx8IG51bGwpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB3cmFwcGVyID0gdGFyZ2V0LmNsb3Nlc3QoXHJcbiAgICAgICAgICAnLm4taW5wdXQsIC5uLXNlbGVjdCwgLm4taW5wdXQtbnVtYmVyLCAubi1jaGVja2JveCwgLm4tc3dpdGNoLCAuZm9ybS1jb250cm9sJyxcclxuICAgICAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICAgICAgICBpZiAod3JhcHBlcikgdGFyZ2V0ID0gd3JhcHBlcjtcclxuICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICB0YXJnZXQuc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogJ3Ntb290aCcsIGJsb2NrOiAnY2VudGVyJyB9KTtcclxuICAgICAgZmxhc2godGFyZ2V0KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGNvbnNvbGUud2FybignZ29Ubzogc2Nyb2xsL2ZsYXNoIGZhaWxlZCcsIGVycik7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGlmIChzdXBwcmVzc2luZykgc3VwcHJlc3NSb3V0ZVNjcm9sbCA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBmbGFzaChlbDogSFRNTEVsZW1lbnQgfCBudWxsKSB7XHJcbiAgLy8gRmxhc2ggb24gd3JhcHBlciBpZiBhdmFpbGFibGUgc28gdGhlIHJpbmcgaXNuJ3QgaGlkZGVuIGJ5IGludGVybmFsIHN0cnVjdHVyZVxyXG4gIGxldCB0YXJnZXQgPSBlbDtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgd3JhcHBlciA9IHRhcmdldD8uY2xvc2VzdD8uKFxyXG4gICAgICAnLm4taW5wdXQsIC5uLXNlbGVjdCwgLm4taW5wdXQtbnVtYmVyLCAubi1jaGVja2JveCwgLm4tc3dpdGNoLCAuZm9ybS1jb250cm9sJyxcclxuICAgICk7XHJcbiAgICBpZiAod3JhcHBlcikgdGFyZ2V0ID0gd3JhcHBlcjtcclxuICB9IGNhdGNoIHt9XHJcbiAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdmbGFzaC1oaWdobGlnaHQnKTtcclxuICAvLyBMZXQgdGhlIENTUyBhbmltYXRpb24gcnVuIHRvIGNvbXBsZXRpb24gYmVmb3JlIGNsZWFudXBcclxuICBzZXRUaW1lb3V0KCgpID0+IHRhcmdldD8uY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gtaGlnaGxpZ2h0JyksIDUyMDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblNlYXJjaEZvY3VzKCkge1xyXG4gIHNlYXJjaE9wZW4udmFsdWUgPSAoc2VhcmNoUXVlcnkudmFsdWUgfHwgJycpLmxlbmd0aCA+IDA7XHJcbn1cclxuZnVuY3Rpb24gb25TZWFyY2hCbHVyKCkge1xyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgc2VhcmNoT3Blbi52YWx1ZSA9IGZhbHNlO1xyXG4gIH0sIDEyMCk7XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG4uZmFkZS1lbnRlci1hY3RpdmUsXHJcbi5mYWRlLWxlYXZlLWFjdGl2ZSB7XHJcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcclxufVxyXG5cclxuLmZhZGUtZW50ZXItZnJvbSxcclxuLmZhZGUtbGVhdmUtdG8ge1xyXG4gIG9wYWNpdHk6IDA7XHJcbn1cclxuXHJcbi5zbGlkZS1mYWRlLWVudGVyLWFjdGl2ZSxcclxuLnNsaWRlLWZhZGUtbGVhdmUtYWN0aXZlIHtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4yNXM7XHJcbn1cclxuXHJcbi5zbGlkZS1mYWRlLWVudGVyLWZyb20sXHJcbi5zbGlkZS1mYWRlLWxlYXZlLXRvIHtcclxuICBvcGFjaXR5OiAwO1xyXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSg2cHgpO1xyXG59XHJcblxyXG4vKiBNYWtlIGhpZ2hsaWdodCBnbG9iYWwgc28gaXQgYXBwbGllcyB0byBjb250cm9scyBpbnNpZGUgY2hpbGQgdGFiIGNvbXBvbmVudHMgKi9cclxuOmdsb2JhbCguZmxhc2gtaGlnaGxpZ2h0KSB7XHJcbiAgLyogU3Ryb25nZXIgY29udHJhc3QgaW4gbGlnaHQgbW9kZSB1c2luZyBzZWNvbmRhcnkgdG9rZW4gKi9cclxuICBib3gtc2hhZG93OlxyXG4gICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC41NSksXHJcbiAgICAwIDAgMCA2cHggcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjI4KTtcclxuICBvdXRsaW5lOiAycHggc29saWQgcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjY1KTtcclxuICBvdXRsaW5lLW9mZnNldDogMnB4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcclxuICB0cmFuc2l0aW9uOlxyXG4gICAgYm94LXNoYWRvdyAwLjI1cyxcclxuICAgIG91dGxpbmUtY29sb3IgMC4yNXM7XHJcbiAgYW5pbWF0aW9uOiBmbGFzaC1yaW5nLWZhZGUgNXMgZWFzZS1vdXQgZm9yd2FyZHM7XHJcbiAgd2lsbC1jaGFuZ2U6IGJveC1zaGFkb3csIG91dGxpbmUtY29sb3I7XHJcbn1cclxuXHJcbi5kYXJrIDpnbG9iYWwoLmZsYXNoLWhpZ2hsaWdodCkge1xyXG4gIC8qIEluIGRhcmsgbW9kZSwga2VlcCBhIHNvZnRlciByaW5nIHRvIGF2b2lkIGdsYXJlICovXHJcbiAgYm94LXNoYWRvdzpcclxuICAgIDAgMCAwIDNweCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjQ1KSxcclxuICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjE4KTtcclxuICBvdXRsaW5lLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjUpO1xyXG59XHJcblxyXG5Aa2V5ZnJhbWVzIGZsYXNoLXJpbmctZmFkZSB7XHJcbiAgMCUge1xyXG4gICAgYm94LXNoYWRvdzpcclxuICAgICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC41NSksXHJcbiAgICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMjgpO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjY1KTtcclxuICB9XHJcbiAgNjAlIHtcclxuICAgIGJveC1zaGFkb3c6XHJcbiAgICAgIDAgMCAwIDNweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMzUpLFxyXG4gICAgICAwIDAgMCA2cHggcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjE2KTtcclxuICAgIG91dGxpbmUtY29sb3I6IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC40NSk7XHJcbiAgfVxyXG4gIDEwMCUge1xyXG4gICAgYm94LXNoYWRvdzpcclxuICAgICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMCksXHJcbiAgICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDApO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwKTtcclxuICB9XHJcbn1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbIl9vcGVuQmxvY2siLCJfY3JlYXRlRWxlbWVudEJsb2NrIiwiX2hvaXN0ZWRfMSIsIl9jcmVhdGVWTm9kZSIsIl91bnJlZiIsIl9GcmFnbWVudCIsIl9yZW5kZXJMaXN0IiwiX2NyZWF0ZUVsZW1lbnRWTm9kZSIsIl9ob2lzdGVkXzMiLCJfdG9EaXNwbGF5U3RyaW5nIiwiJHQiLCJfaG9pc3RlZF80IiwiX2hvaXN0ZWRfNSIsIl9ob2lzdGVkXzYiLCJfaG9pc3RlZF83IiwiX2hvaXN0ZWRfOCIsIl9jcmVhdGVCbG9jayIsIl9ob2lzdGVkXzkiLCJfaG9pc3RlZF8xMCIsIl9jcmVhdGVUZXh0Vk5vZGUiLCJfaG9pc3RlZF8xMSIsIl9ob2lzdGVkXzEyIiwiX2hvaXN0ZWRfMTMiLCJfaG9pc3RlZF8xNCIsIl9ob2lzdGVkXzE1IiwiX2hvaXN0ZWRfMTYiLCJfaG9pc3RlZF8xNyIsIl9ob2lzdGVkXzE4IiwiX2hvaXN0ZWRfMTkiLCJfaG9pc3RlZF8yIiwiX2hvaXN0ZWRfMjAiLCJfaG9pc3RlZF8yMSIsIl9ob2lzdGVkXzIyIiwiX2hvaXN0ZWRfMjMiLCJfaG9pc3RlZF8yNCIsIl9jcmVhdGVDb21tZW50Vk5vZGUiLCJfaG9pc3RlZF8yNSIsIl9ob2lzdGVkXzI2IiwiX2hvaXN0ZWRfMjciLCJfaG9pc3RlZF8yOCIsIl9ob2lzdGVkXzI5IiwiX2hvaXN0ZWRfMzAiLCJfaG9pc3RlZF8zMSIsIl9ob2lzdGVkXzMyIiwiX2hvaXN0ZWRfMzMiLCJfaG9pc3RlZF8zNCIsIl9ob2lzdGVkXzM1IiwiX2hvaXN0ZWRfMzYiLCJfaG9pc3RlZF8zNyIsIl9ob2lzdGVkXzM4IiwiX2hvaXN0ZWRfMzkiLCJfaG9pc3RlZF80MCIsIl9ob2lzdGVkXzQxIiwiX2hvaXN0ZWRfNDIiLCJfaG9pc3RlZF80MyIsIl9ob2lzdGVkXzQ0IiwiX2hvaXN0ZWRfNDUiLCJfaG9pc3RlZF80NiIsIl9ob2lzdGVkXzQ3IiwiX2hvaXN0ZWRfNDgiLCJfaG9pc3RlZF80OSIsIl9ob2lzdGVkXzUwIiwiX2hvaXN0ZWRfNTEiLCJfaG9pc3RlZF81MiIsIl9ob2lzdGVkXzUzIiwiX2hvaXN0ZWRfNTQiLCJfaG9pc3RlZF81NSIsIl9ob2lzdGVkXzU2IiwiX2hvaXN0ZWRfNTciLCJfaG9pc3RlZF81OCIsIl9ob2lzdGVkXzU5IiwiX2hvaXN0ZWRfNjAiLCJfaG9pc3RlZF82MSIsIl9ob2lzdGVkXzYyIiwiX2hvaXN0ZWRfNjMiLCJfaG9pc3RlZF82NCIsIl9ob2lzdGVkXzY1IiwiX2hvaXN0ZWRfNjYiLCJfaG9pc3RlZF82NyIsIl9ob2lzdGVkXzY4IiwiX2hvaXN0ZWRfNjkiLCJfaG9pc3RlZF83MCIsIl9ob2lzdGVkXzcxIiwiX2hvaXN0ZWRfNzIiLCJfaG9pc3RlZF83MyIsIl9ob2lzdGVkXzc0IiwiX2hvaXN0ZWRfNzUiLCJfaG9pc3RlZF83NiIsIl9ob2lzdGVkXzc3IiwiX2hvaXN0ZWRfNzgiLCJfaG9pc3RlZF84MCIsIl9ob2lzdGVkXzgyIiwiX2hvaXN0ZWRfODMiLCJfaG9pc3RlZF84NCIsIl9ob2lzdGVkXzg2IiwiX2hvaXN0ZWRfODUiLCJfaG9pc3RlZF84NyIsIl9ob2lzdGVkXzg5IiwiX2hvaXN0ZWRfODgiLCJfaG9pc3RlZF85MCIsIl9ob2lzdGVkXzkxIiwiJHNsb3RzIiwiX3JlbmRlclNsb3QiLCJOSW5wdXQiLCJfVHJhbnNpdGlvbiIsIl9ub3JtYWxpemVDbGFzcyIsIl9tZXJnZVByb3BzIiwic3RlcExhYmVsIiwiX3dpdGhNb2RpZmllcnMiLCJfYSIsIl9iIiwiX3Jlc29sdmVEeW5hbWljQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWNBLFVBQU0sUUFBUTtBQUNkLFVBQU0sRUFBRSxRQUFRLFNBQVMsSUFBSSxZQUFZLEtBQUs7QUFDOUMsVUFBTSxXQUFXLFNBQVMsTUFBTTs7QUFBQSw2QkFBUyxVQUFULG1CQUFnQixhQUFZO0FBQUEsS0FBRTtBQUM5RCxVQUFNLHNCQUlEO0FBQUEsTUFDSDtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsVUFBVTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxVQUFVO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQUE7QUFHRixhQUFTLGFBQWEsS0FBb0M7O0FBQ2xELFlBQUEsV0FBVSxZQUFPLFVBQVAsbUJBQWU7QUFDL0IsYUFBTyxNQUFNLFFBQVEsT0FBTyxJQUFLLFVBQTRCLENBQUE7QUFBQSxJQUMvRDtBQUVBLGFBQVMsaUJBQWtDOztBQUNuQyxZQUFBLFdBQVUsWUFBTyxVQUFQLG1CQUFjO0FBQzlCLGFBQU8sTUFBTSxRQUFRLE9BQU8sSUFBSyxVQUE4QixDQUFBO0FBQUEsSUFDakU7QUFFQSxhQUFTLGtCQUFrQjs7QUFDekIsa0JBQU0sb0JBQU47QUFBQSxJQUNGO0FBRUEsYUFBUyxlQUFlLEtBQXFCO0FBQzNDLFlBQU0sV0FBVztBQUFBLFFBQ2YsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sR0FBSSxTQUFTLFVBQVUsWUFBWSxFQUFFLFVBQVUsTUFBQSxJQUFVLENBQUM7QUFBQSxNQUFBO0FBRXRELFlBQUEsVUFBVSxhQUFhLEdBQUc7QUFDaEMsWUFBTSxPQUFPLENBQUMsR0FBRyxTQUFTLFFBQVE7QUFDNUIsWUFBQSxhQUFhLEtBQUssSUFB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
