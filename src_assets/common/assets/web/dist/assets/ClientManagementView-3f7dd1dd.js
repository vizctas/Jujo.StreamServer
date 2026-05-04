import { k as defineComponent, R as useI18n, $ as storeToRefs, r as ref, c as computed, o as onMounted, Q as openBlock, M as createBlock, S as withCtx, V as createBaseVNode, U as createVNode, j as createTextVNode, P as toDisplayString, Z as unref, O as createElementBlock, F as Fragment, a1 as renderList, W as createCommentVNode, b as onBeforeUnmount, a2 as resolveComponent, X as withModifiers, H as normalizeClass, Y as withKeys, m as h } from "./vue-core-de07660f.js";
import { a as useAuthStore, L as LucideIcon, _ as _export_sfc, u as useConfigStore, h as http } from "./index-f3a48eb0.js";
import { aQ as useDialog, au as useMessage, aq as NButton, aE as NTag, aR as NSpin, aC as NCard, aS as NForm, aT as NFormItem, an as __unplugin_components_0, ap as NAlert, aH as NSelect, ao as NCheckbox, aJ as NRadioGroup, aI as NRadio, at as NModal } from "./vendor-33781bfc.js";
import { A as AppEditConfigOverridesSection } from "./AppEditConfigOverridesSection-b39bbf4d.js";
import "./ConfigFieldRenderer-f2409336.js";
const _hoisted_1$1 = { class: "flex flex-wrap items-center justify-between gap-3" };
const _hoisted_2$1 = { class: "text-lg font-medium flex items-center gap-2" };
const _hoisted_3$1 = { class: "text-xs opacity-70 max-w-2xl" };
const _hoisted_4$1 = { class: "ml-2" };
const _hoisted_5$1 = {
  key: 0,
  class: "text-xs text-danger"
};
const _hoisted_6$1 = {
  key: 1,
  class: "text-xs opacity-60"
};
const _hoisted_7$1 = {
  key: 2,
  class: "overflow-x-auto"
};
const _hoisted_8$1 = { class: "min-w-full text-sm" };
const _hoisted_9$1 = { class: "text-left text-xs uppercase tracking-wide opacity-70 border-b border-dark/10 dark:border-light/10" };
const _hoisted_10$1 = { class: "py-2 pr-4 font-semibold" };
const _hoisted_11$1 = { class: "py-2 pr-4 font-semibold" };
const _hoisted_12$1 = { class: "py-2 pr-4 font-semibold" };
const _hoisted_13$1 = { class: "py-2 text-right font-semibold" };
const _hoisted_14$1 = { class: "divide-y divide-dark/10 dark:divide-light/10" };
const _hoisted_15$1 = { class: "py-3 pr-4" };
const _hoisted_16$1 = { class: "flex flex-col gap-1" };
const _hoisted_17$1 = { class: "font-medium break-words" };
const _hoisted_18$1 = { class: "text-xs opacity-70 break-words" };
const _hoisted_19$1 = { class: "py-3 pr-4" };
const _hoisted_20$1 = { class: "flex flex-col gap-1 text-xs" };
const _hoisted_21$1 = { class: "opacity-70" };
const _hoisted_22$1 = { class: "opacity-70" };
const _hoisted_23$1 = { class: "py-3 pr-4" };
const _hoisted_24$1 = { class: "flex flex-wrap items-center gap-2 text-xs" };
const _hoisted_25$1 = { class: "py-3 text-right" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TrustedDevicesCard",
  setup(__props) {
    const auth = useAuthStore();
    const { t } = useI18n();
    const dialog = useDialog();
    const message = useMessage();
    const { sessions, sessionsLoading, sessionsError } = storeToRefs(auth);
    const revokingId = ref("");
    const sessionsList = computed(() => sessions.value || []);
    const loading = computed(() => sessionsLoading.value);
    const errorMessage = computed(() => {
      if (!sessionsError.value)
        return "";
      if (sessionsError.value === "error")
        return t("auth.sessions_load_failed");
      return sessionsError.value;
    });
    const formatter = new Intl.DateTimeFormat(void 0, {
      dateStyle: "medium",
      timeStyle: "short"
    });
    function formatTimestamp(seconds) {
      if (!seconds)
        return t("auth.sessions_time_unknown");
      if (!Number.isFinite(seconds))
        return t("auth.sessions_time_unknown");
      return formatter.format(new Date(seconds * 1e3));
    }
    function sessionExpiry(session) {
      const refreshExpiry = session.refresh_expires_at;
      if (Number.isFinite(refreshExpiry)) {
        return refreshExpiry;
      }
      return session.expires_at;
    }
    function primaryLabel(session) {
      return session.device_label || fallbackAgent(session.user_agent) || t("auth.sessions_unknown_device");
    }
    function secondaryLabel(session) {
      const parts = [];
      if (session.remote_address) {
        parts.push(session.remote_address);
      }
      const agentSummary = fallbackAgent(session.user_agent, true);
      if (agentSummary) {
        parts.push(agentSummary);
      }
      return parts.join(" • ");
    }
    function fallbackAgent(agent, compact = false) {
      if (!agent)
        return "";
      const limit = compact ? 48 : 80;
      if (agent.length <= limit)
        return agent;
      return `${agent.slice(0, limit - 1)}…`;
    }
    async function refresh() {
      await auth.fetchSessions();
    }
    function confirmRevoke(session) {
      const isCurrent = session.current;
      dialog.warning({
        title: t("auth.sessions_revoke_title"),
        content: t("auth.sessions_revoke_message", {
          device: primaryLabel(session)
        }),
        positiveText: isCurrent ? t("auth.sessions_logout") : t("auth.sessions_revoke"),
        negativeText: t("auth.sessions_cancel"),
        onPositiveClick: async () => {
          revokingId.value = session.id;
          const ok = await auth.revokeSession(session.id);
          revokingId.value = "";
          if (ok) {
            message.success(t("auth.sessions_revoke_success"));
          } else {
            message.error(t("auth.sessions_revoke_failed"));
          }
        }
      });
    }
    onMounted(() => {
      auth.fetchSessions().catch(() => {
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NCard), {
        class: "mb-8",
        segmented: { content: true, footer: false }
      }, {
        header: withCtx(() => [
          createBaseVNode("div", _hoisted_1$1, [
            createBaseVNode("div", null, [
              createBaseVNode("h2", _hoisted_2$1, [
                createVNode(LucideIcon, {
                  name: "fa-shield-heart",
                  size: 18
                }),
                createTextVNode(
                  " " + toDisplayString(unref(t)("auth.sessions_heading")),
                  1
                  /* TEXT */
                )
              ]),
              createBaseVNode(
                "p",
                _hoisted_3$1,
                toDisplayString(unref(t)("auth.sessions_description")),
                1
                /* TEXT */
              )
            ]),
            createVNode(unref(NButton), {
              size: "small",
              loading: loading.value,
              onClick: refresh
            }, {
              default: withCtx(() => [
                createVNode(LucideIcon, {
                  name: "fa-rotate",
                  size: 14
                }),
                createBaseVNode(
                  "span",
                  _hoisted_4$1,
                  toDisplayString(unref(t)("auth.refresh")),
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
          createVNode(unref(NSpin), { show: loading.value }, {
            default: withCtx(() => [
              errorMessage.value ? (openBlock(), createElementBlock(
                "div",
                _hoisted_5$1,
                toDisplayString(errorMessage.value),
                1
                /* TEXT */
              )) : !sessionsList.value.length ? (openBlock(), createElementBlock(
                "div",
                _hoisted_6$1,
                toDisplayString(unref(t)("auth.sessions_empty")),
                1
                /* TEXT */
              )) : (openBlock(), createElementBlock("div", _hoisted_7$1, [
                createBaseVNode("table", _hoisted_8$1, [
                  createBaseVNode("thead", _hoisted_9$1, [
                    createBaseVNode("tr", null, [
                      createBaseVNode(
                        "th",
                        _hoisted_10$1,
                        toDisplayString(unref(t)("auth.sessions_device")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "th",
                        _hoisted_11$1,
                        toDisplayString(unref(t)("auth.sessions_activity")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "th",
                        _hoisted_12$1,
                        toDisplayString(unref(t)("auth.sessions_status")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "th",
                        _hoisted_13$1,
                        toDisplayString(unref(t)("auth.sessions_actions")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  createBaseVNode("tbody", _hoisted_14$1, [
                    (openBlock(true), createElementBlock(
                      Fragment,
                      null,
                      renderList(sessionsList.value, (session) => {
                        return openBlock(), createElementBlock("tr", {
                          key: session.id,
                          class: "align-top"
                        }, [
                          createBaseVNode("td", _hoisted_15$1, [
                            createBaseVNode("div", _hoisted_16$1, [
                              createBaseVNode(
                                "span",
                                _hoisted_17$1,
                                toDisplayString(primaryLabel(session)),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "span",
                                _hoisted_18$1,
                                toDisplayString(secondaryLabel(session)),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          createBaseVNode("td", _hoisted_19$1, [
                            createBaseVNode("div", _hoisted_20$1, [
                              createBaseVNode(
                                "span",
                                null,
                                toDisplayString(formatTimestamp(session.created_at)),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "span",
                                _hoisted_21$1,
                                toDisplayString(unref(t)("auth.sessions_last_seen", { time: formatTimestamp(session.last_seen) })),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "span",
                                _hoisted_22$1,
                                toDisplayString(unref(t)("auth.sessions_expires", { time: formatTimestamp(sessionExpiry(session)) })),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          createBaseVNode("td", _hoisted_23$1, [
                            createBaseVNode("div", _hoisted_24$1, [
                              session.remember_me ? (openBlock(), createBlock(unref(NTag), {
                                key: 0,
                                size: "small",
                                type: "info",
                                bordered: false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(
                                    toDisplayString(unref(t)("auth.sessions_remember_flag")),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                _: 1
                                /* STABLE */
                              })) : (openBlock(), createBlock(unref(NTag), {
                                key: 1,
                                size: "small",
                                bordered: false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(
                                    toDisplayString(unref(t)("auth.sessions_session_flag")),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                _: 1
                                /* STABLE */
                              })),
                              session.current ? (openBlock(), createBlock(unref(NTag), {
                                key: 2,
                                size: "small",
                                type: "success",
                                bordered: false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(
                                    toDisplayString(unref(t)("auth.sessions_current_device")),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                _: 1
                                /* STABLE */
                              })) : createCommentVNode("v-if", true)
                            ])
                          ]),
                          createBaseVNode("td", _hoisted_25$1, [
                            createVNode(unref(NButton), {
                              size: "tiny",
                              type: "error",
                              strong: "",
                              loading: revokingId.value === session.id,
                              onClick: ($event) => confirmRevoke(session)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(session.current ? unref(t)("auth.sessions_logout") : unref(t)("auth.sessions_revoke")),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["loading", "onClick"])
                          ])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ]))
            ]),
            _: 1
            /* STABLE */
          }, 8, ["show"])
        ]),
        _: 1
        /* STABLE */
      });
    };
  }
});
const TrustedDevicesCard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/components/TrustedDevicesCard.vue"]]);
const _hoisted_1 = { class: "clients-page max-w-5xl mx-auto px-4 pb-10 space-y-10" };
const _hoisted_2 = { class: "text-2xl font-semibold my-6 flex items-center gap-3 text-brand" };
const _hoisted_3 = { class: "text-lg font-medium flex items-center gap-2" };
const _hoisted_4 = { class: "space-y-4" };
const _hoisted_5 = { class: "text-sm opacity-75" };
const _hoisted_6 = { key: 0 };
const _hoisted_7 = { key: 1 };
const _hoisted_8 = { class: "space-y-2" };
const _hoisted_9 = { class: "text-lg font-medium flex items-center gap-2" };
const _hoisted_10 = { class: "flex flex-col gap-3 md:flex-row md:items-center" };
const _hoisted_11 = { class: "text-sm opacity-75 md:flex-1" };
const _hoisted_12 = { class: "flex items-center gap-2" };
const _hoisted_13 = { class: "text-xs opacity-70" };
const _hoisted_14 = {
  key: 2,
  class: "mt-4 space-y-4"
};
const _hoisted_15 = { class: "flex flex-wrap items-center gap-3" };
const _hoisted_16 = { class: "text-base font-medium" };
const _hoisted_17 = { class: "ml-auto flex items-center gap-2" };
const _hoisted_18 = {
  key: 0,
  class: "mt-1 text-xs opacity-60"
};
const _hoisted_19 = {
  key: 1,
  class: "mt-4"
};
const _hoisted_20 = { class: "space-y-3" };
const _hoisted_21 = { class: "grid gap-4 md:grid-cols-3" };
const _hoisted_22 = { class: "text-xs font-medium uppercase tracking-wide opacity-70" };
const _hoisted_23 = { class: "flex flex-wrap gap-2" };
const _hoisted_24 = { class: "text-xs opacity-70" };
const _hoisted_25 = {
  key: 0,
  class: "space-y-4"
};
const _hoisted_26 = { class: "space-y-3 rounded-xl border border-dark/10 dark:border-light/10 bg-light/60 dark:bg-dark/40 p-4" };
const _hoisted_27 = { class: "flex items-center justify-between gap-3" };
const _hoisted_28 = {
  key: 0,
  class: "text-xs opacity-70"
};
const _hoisted_29 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_30 = { class: "grid gap-3 md:grid-cols-[1fr_auto_auto]" };
const _hoisted_31 = { class: "space-y-3 rounded-xl border border-dark/10 dark:border-light/10 bg-light/60 dark:bg-dark/40 p-4" };
const _hoisted_32 = { class: "flex items-center justify-between gap-3" };
const _hoisted_33 = {
  key: 0,
  class: "text-xs opacity-70"
};
const _hoisted_34 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_35 = { class: "grid gap-3 md:grid-cols-[1fr_auto_auto]" };
const _hoisted_36 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_37 = { class: "flex flex-col" };
const _hoisted_38 = { class: "text-xs opacity-80" };
const _hoisted_39 = {
  key: 0,
  class: "space-y-5 rounded-xl border border-dark/10 dark:border-light/10 bg-light/60 dark:bg-dark/40 p-4"
};
const _hoisted_40 = { class: "space-y-2" };
const _hoisted_41 = { class: "flex items-center justify-between gap-3" };
const _hoisted_42 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_43 = { class: "text-xs opacity-70" };
const _hoisted_44 = { class: "space-y-2" };
const _hoisted_45 = { class: "app-radio-card-title" };
const _hoisted_46 = { class: "app-radio-card-title" };
const _hoisted_47 = {
  key: 0,
  class: "space-y-2"
};
const _hoisted_48 = { class: "flex items-center justify-between gap-3" };
const _hoisted_49 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_50 = { class: "text-xs opacity-70" };
const _hoisted_51 = { class: "text-xs opacity-70" };
const _hoisted_52 = {
  key: 0,
  class: "text-red-500"
};
const _hoisted_53 = { key: 1 };
const _hoisted_54 = {
  key: 1,
  class: "space-y-5"
};
const _hoisted_55 = { class: "space-y-2" };
const _hoisted_56 = { class: "flex items-center justify-between gap-3" };
const _hoisted_57 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_58 = { class: "text-xs opacity-70" };
const _hoisted_59 = { class: "app-radio-card-title" };
const _hoisted_60 = {
  key: 0,
  class: "text-xs opacity-70"
};
const _hoisted_61 = { class: "space-y-2" };
const _hoisted_62 = { class: "flex items-center justify-between gap-3" };
const _hoisted_63 = { class: "text-xs font-semibold uppercase tracking-wide opacity-70" };
const _hoisted_64 = { class: "text-xs opacity-70" };
const _hoisted_65 = ["onClick", "onKeydown"];
const _hoisted_66 = { class: "flex items-center gap-3" };
const _hoisted_67 = { class: "text-sm font-semibold" };
const _hoisted_68 = { class: "text-xs opacity-70 leading-snug ml-6" };
const _hoisted_69 = {
  key: 0,
  class: "text-xs opacity-70"
};
const _hoisted_70 = { class: "text-xs opacity-70" };
const _hoisted_71 = {
  key: 0,
  class: "text-xs text-red-500 block"
};
const _hoisted_72 = { class: "text-xs opacity-70" };
const _hoisted_73 = {
  key: 0,
  class: "text-xs opacity-70 block"
};
const _hoisted_74 = {
  key: 3,
  class: "flex flex-col items-center gap-4 px-8 py-14 text-center"
};
const _hoisted_75 = { class: "text-sm text-center" };
const _hoisted_76 = { class: "flex justify-end gap-2" };
const _hoisted_77 = { class: "text-sm text-center" };
const _hoisted_78 = { class: "flex justify-end gap-2" };
const highlightPermissionThreshold = 67108864;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ClientManagementView",
  setup(__props) {
    const permissionMapping = {
      input_controller: 256,
      input_touch: 512,
      input_pen: 1024,
      input_mouse: 2048,
      input_kbd: 4096,
      _all_inputs: 7936,
      clipboard_set: 65536,
      clipboard_read: 131072,
      file_upload: 262144,
      file_dwnload: 524288,
      server_cmd: 1048576,
      _all_operations: 2031616,
      list: 16777216,
      view: 33554432,
      launch: 67108864,
      _allow_view: 100663296,
      _all_actions: 117440512,
      _default: 50331648,
      _no: 0,
      _all: 119480064
    };
    const permissionGroups = [
      {
        id: "actions",
        labelKey: "permissions.group_action",
        permissions: [
          { key: "list", suppressedBy: ["view", "launch"] },
          { key: "view", suppressedBy: ["launch"] },
          { key: "launch", suppressedBy: [] }
        ]
      },
      {
        id: "operations",
        labelKey: "permissions.group_operation",
        permissions: [
          { key: "clipboard_set", suppressedBy: [] },
          { key: "clipboard_read", suppressedBy: [] },
          { key: "server_cmd", suppressedBy: [] }
        ]
      },
      {
        id: "inputs",
        labelKey: "permissions.group_input",
        permissions: [
          { key: "input_controller", suppressedBy: [] },
          { key: "input_touch", suppressedBy: [] },
          { key: "input_pen", suppressedBy: [] },
          { key: "input_mouse", suppressedBy: [] },
          { key: "input_kbd", suppressedBy: [] }
        ]
      }
    ];
    const { t } = useI18n();
    const message = useMessage();
    const configStore = useConfigStore();
    const globalPrefer10BitSdr = computed(
      () => {
        var _a;
        return toBool((_a = configStore.config) == null ? void 0 : _a.prefer_10bit_sdr, false);
      }
    );
    const prefer10BitSdrOptions = computed(() => [
      { label: t("_common.enabled"), value: "enabled" },
      { label: t("_common.disabled"), value: "disabled" }
    ]);
    const clients = ref([]);
    const platform = ref("");
    const clientSortMode = ref("recent");
    const pin = ref("");
    const deviceName = ref("");
    const pairing = ref(false);
    const pairStatus = ref(null);
    const unpairAllPressed = ref(false);
    const unpairAllStatus = ref(null);
    const removing = ref({});
    const saving = ref({});
    const disconnecting = ref({});
    let refreshIntervalId = null;
    const showConfirmRemove = ref(false);
    const pendingRemoveUuid = ref("");
    const pendingRemoveName = ref("");
    const showConfirmUnpairAll = ref(false);
    const isWindows = computed(() => {
      var _a;
      const p = (platform.value || "").toLowerCase();
      if (p)
        return p.startsWith("win") || p === "windows";
      const meta = String(((_a = configStore.metadata) == null ? void 0 : _a.platform) || "").toLowerCase();
      return meta === "windows" || meta.startsWith("win");
    });
    function toBool(value, fallback = false) {
      if (typeof value === "boolean")
        return value;
      if (typeof value === "number")
        return value !== 0;
      if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (["1", "true", "yes", "on", "enabled"].includes(v))
          return true;
        if (["0", "false", "no", "off", "disabled", ""].includes(v))
          return false;
      }
      return fallback;
    }
    function permToStr(perm) {
      const segments = [];
      segments.push(perm >> 24 & 255);
      segments.push(perm >> 16 & 255);
      segments.push(perm >> 8 & 255);
      return segments.map((seg) => seg.toString(16).toUpperCase().padStart(2, "0")).join(" ");
    }
    function checkPermission(perm, permission) {
      return (perm & permissionMapping[permission]) !== 0;
    }
    function isSuppressed(perm, permission, suppressedBy) {
      return suppressedBy.some((suppressed) => checkPermission(perm, suppressed));
    }
    function togglePermission(client, permission) {
      client.editPerm ^= permissionMapping[permission];
    }
    function parseClientVirtualDisplayMode(value) {
      const v = String(value ?? "").trim().toLowerCase();
      if (!v)
        return null;
      if (v === "disabled" || v === "per_client" || v === "shared" || v === "global")
        return v;
      return null;
    }
    function parseClientVirtualDisplayLayout(value) {
      const v = String(value ?? "").trim().toLowerCase();
      if (!v)
        return null;
      if (v === "exclusive" || v === "extended" || v === "extended_primary" || v === "extended_isolated" || v === "extended_primary_isolated")
        return v;
      return null;
    }
    function parseLastSeen(value) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0)
        return value;
      if (typeof value === "string") {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0)
          return n;
      }
      return null;
    }
    function normalizeClientCommandEntry(value) {
      if (typeof value === "string") {
        return { cmd: value, elevated: false };
      }
      if (!value || typeof value !== "object")
        return null;
      const obj = value;
      const cmd = String(obj["cmd"] ?? "").trim();
      if (!cmd)
        return null;
      return {
        cmd,
        elevated: toBool(obj["elevated"], false)
      };
    }
    function normalizeClientCommandList(value) {
      if (!Array.isArray(value))
        return [];
      return value.map((entry) => normalizeClientCommandEntry(entry)).filter((entry) => !!entry);
    }
    function createClientViewModel(entry) {
      const name = entry.name ?? "";
      const displayMode = entry.display_mode ?? "";
      const outputOverride = entry.output_name_override ?? "";
      const alwaysVirtual = toBool(entry.always_use_virtual_display, false);
      const hdrProfile = String(entry.hdr_profile ?? "").trim();
      const lastSeen = parseLastSeen(entry.last_seen);
      const perm = typeof entry.perm === "number" ? entry.perm : Number.parseInt(String(entry.perm ?? "0"), 10) || 0;
      const configOverrides = entry.config_overrides && typeof entry.config_overrides === "object" && !Array.isArray(entry.config_overrides) ? JSON.parse(JSON.stringify(entry.config_overrides)) : {};
      const prefer10 = entry.prefer_10bit_sdr === void 0 || entry.prefer_10bit_sdr === null ? null : toBool(entry.prefer_10bit_sdr, false) ? "enabled" : "disabled";
      const virtualMode = parseClientVirtualDisplayMode(entry.virtual_display_mode ?? "");
      const virtualLayout = parseClientVirtualDisplayLayout(entry.virtual_display_layout ?? "");
      const allowClientCommands = toBool(entry.allow_client_commands, true);
      const doCommands = normalizeClientCommandList(entry.do);
      const undoCommands = normalizeClientCommandList(entry.undo);
      const overrideEnabled = alwaysVirtual || !!outputOverride.trim() || virtualMode !== null || virtualLayout !== null;
      const selection = alwaysVirtual || virtualMode !== null && virtualMode !== "disabled" ? "virtual" : "physical";
      const client = {
        uuid: entry.uuid ?? "",
        name,
        connected: !!entry.connected,
        lastSeen,
        perm,
        hdrProfile,
        displayMode,
        outputOverride,
        alwaysUseVirtualDisplay: alwaysVirtual,
        prefer10BitSdr: prefer10,
        virtualDisplayMode: virtualMode,
        virtualDisplayLayout: virtualLayout,
        configOverrides,
        allowClientCommands,
        doCommands,
        undoCommands,
        editing: false,
        editHdrProfile: hdrProfile || null,
        editName: name,
        editDisplayMode: displayMode,
        editPerm: perm,
        editDisplayOverrideEnabled: overrideEnabled,
        editDisplaySelection: selection,
        editPhysicalOutputOverride: outputOverride || null,
        editVirtualDisplayMode: virtualMode,
        editVirtualDisplayLayout: virtualLayout,
        editPrefer10BitSdr: prefer10,
        editConfigOverrides: JSON.parse(JSON.stringify(configOverrides)),
        editAllowClientCommands: allowClientCommands,
        editDoCommands: JSON.parse(JSON.stringify(doCommands)),
        editUndoCommands: JSON.parse(JSON.stringify(undoCommands))
      };
      if (client.editDisplayOverrideEnabled) {
        applyClientDisplaySelection(client, client.editDisplaySelection);
      }
      return client;
    }
    function resetClientEdits(client) {
      client.editName = client.name;
      client.editHdrProfile = (client.hdrProfile || "").trim() || null;
      client.editDisplayMode = client.displayMode;
      client.editPerm = client.perm;
      client.editDisplayOverrideEnabled = client.alwaysUseVirtualDisplay || !!(client.outputOverride || "").trim() || client.virtualDisplayMode !== null || client.virtualDisplayLayout !== null;
      client.editDisplaySelection = client.alwaysUseVirtualDisplay || client.virtualDisplayMode !== null && client.virtualDisplayMode !== "disabled" ? "virtual" : "physical";
      client.editPhysicalOutputOverride = client.outputOverride || null;
      client.editVirtualDisplayMode = client.virtualDisplayMode;
      client.editVirtualDisplayLayout = client.virtualDisplayLayout;
      client.editPrefer10BitSdr = client.prefer10BitSdr;
      client.editConfigOverrides = JSON.parse(JSON.stringify(client.configOverrides || {}));
      client.editAllowClientCommands = client.allowClientCommands;
      client.editDoCommands = JSON.parse(JSON.stringify(client.doCommands || []));
      client.editUndoCommands = JSON.parse(JSON.stringify(client.undoCommands || []));
      if (client.editDisplayOverrideEnabled) {
        applyClientDisplaySelection(client, client.editDisplaySelection);
      }
    }
    function addClientCommand(commands, index = -1) {
      const next = {
        cmd: "",
        elevated: false
      };
      if (index < 0 || index >= commands.length) {
        commands.push(next);
        return;
      }
      commands.splice(index + 1, 0, next);
    }
    function removeClientCommand(commands, index) {
      if (index < 0 || index >= commands.length)
        return;
      commands.splice(index, 1);
    }
    const virtualDisplayModeOptions = computed(() => [
      { label: t("config.app_virtual_display_mode_follow_global"), value: "global" },
      { label: t("config.virtual_display_mode_per_client"), value: "per_client" },
      { label: t("config.virtual_display_mode_shared"), value: "shared" }
    ]);
    const globalVirtualDisplayLayout = computed(
      () => {
        var _a;
        return parseClientVirtualDisplayLayout((_a = configStore.config) == null ? void 0 : _a.virtual_display_layout);
      }
    );
    const virtualDisplayLayoutOptions = computed(() => {
      const values = [
        "exclusive",
        "extended",
        "extended_primary",
        "extended_isolated",
        "extended_primary_isolated"
      ];
      return values.map((value) => ({ label: t(`config.virtual_display_layout_${value}`), value }));
    });
    function renderDisplayDeviceLabel(option) {
      const opt = option;
      return h("div", { class: "leading-tight" }, [
        h("div", {}, String(opt.displayName || opt.label || "")),
        h("div", { class: "text-xs opacity-60 font-mono" }, String(opt.id || opt.value || ""))
      ]);
    }
    function renderDisplayDeviceOption(info) {
      const opt = info.option;
      const metaChildren = [String(opt.id || opt.value || "")];
      if (opt.active === true) {
        metaChildren.push(h("span", { class: "ml-1 text-green-600 dark:text-green-400" }, `(${t("config.app_display_status_active")})`));
      } else if (opt.active === false) {
        metaChildren.push(h("span", { class: "ml-1 opacity-70" }, `(${t("config.app_display_status_inactive")})`));
      }
      return h("div", { class: "leading-tight" }, [
        h("div", {}, String(opt.displayName || opt.label || "")),
        h("div", { class: "text-xs opacity-60 font-mono" }, metaChildren)
      ]);
    }
    const hdrProfiles = ref([]);
    const hdrProfilesLoading = ref(false);
    const hdrProfilesError = ref("");
    const hdrProfileOptions = computed(() => {
      const list = Array.isArray(hdrProfiles.value) ? [...hdrProfiles.value] : [];
      list.sort((a, b) => (Number(b.added_ms || 0) || 0) - (Number(a.added_ms || 0) || 0));
      const options = [
        { label: t("clients.hdr_profile_auto"), value: null }
      ];
      for (const p of list) {
        const filename = String((p == null ? void 0 : p.filename) || "").trim();
        if (!filename)
          continue;
        options.push({ label: filename, value: filename });
      }
      return options;
    });
    async function loadHdrProfiles() {
      if (!isWindows.value)
        return;
      hdrProfilesLoading.value = true;
      hdrProfilesError.value = "";
      try {
        const r = await http.get("./api/clients/hdr-profiles", {
          validateStatus: () => true
        });
        const response = r.data || {};
        const ok = r.status >= 200 && r.status < 300 && response.status === true && Array.isArray(response.profiles);
        if (!ok) {
          hdrProfiles.value = [];
          hdrProfilesError.value = response.error || t("clients.hdr_profile_load_failed");
          return;
        }
        hdrProfiles.value = response.profiles || [];
      } catch (e) {
        hdrProfiles.value = [];
        hdrProfilesError.value = (e == null ? void 0 : e.message) || t("clients.hdr_profile_load_failed");
      } finally {
        hdrProfilesLoading.value = false;
      }
    }
    function ensureHdrProfilesLoaded() {
      if (!isWindows.value)
        return;
      if (!hdrProfilesLoading.value && hdrProfiles.value.length === 0) {
        void loadHdrProfiles();
      }
    }
    function applyClientDisplayOverrideEnabled(client, enabled) {
      client.editDisplayOverrideEnabled = enabled;
      if (!enabled) {
        client.editDisplaySelection = "physical";
        client.editPhysicalOutputOverride = null;
        client.editVirtualDisplayMode = null;
        client.editVirtualDisplayLayout = null;
        return;
      }
      applyClientDisplaySelection(client, client.editDisplaySelection);
    }
    function applyClientDisplaySelection(client, selection) {
      client.editDisplaySelection = selection;
      if (selection === "physical") {
        client.editVirtualDisplayMode = "disabled";
        client.editVirtualDisplayLayout = null;
        return;
      }
      client.editPhysicalOutputOverride = null;
      if (client.editVirtualDisplayMode === null || client.editVirtualDisplayMode === "disabled") {
        client.editVirtualDisplayMode = "global";
      }
    }
    const isClientDisplayOverrideValid = computed(() => {
      for (const client of clients.value) {
        if (!client.editing)
          continue;
        if (!client.editDisplayOverrideEnabled)
          continue;
        if (client.editDisplaySelection === "virtual") {
          if (client.editVirtualDisplayMode !== "global" && client.editVirtualDisplayMode !== "per_client" && client.editVirtualDisplayMode !== "shared") {
            return false;
          }
        }
      }
      return true;
    });
    async function refreshClients() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated)
        return;
      try {
        const r = await http.get("./api/clients/list", {
          validateStatus: () => true
        });
        const response = r.data || {};
        if (typeof response.platform === "string") {
          platform.value = response.platform;
        }
        if (response.status === true && Array.isArray(response.named_certs)) {
          const prior = new Map(clients.value.map((client) => [client.uuid, client]));
          const mapped = response.named_certs.map((entry) => {
            const uuid = entry.uuid ?? "";
            const existing = uuid ? prior.get(uuid) : void 0;
            if (existing == null ? void 0 : existing.editing) {
              existing.connected = !!entry.connected;
              existing.lastSeen = parseLastSeen(entry.last_seen);
              return existing;
            }
            return createClientViewModel(entry);
          });
          clients.value = mapped;
          ensureDisplayDevicesLoaded();
        } else {
          clients.value = [];
        }
      } catch {
        clients.value = [];
      }
    }
    const clientSortOptions = computed(() => [
      { label: t("clients.sort_recent"), value: "recent" },
      { label: t("clients.sort_name"), value: "name" }
    ]);
    function compareByName(a, b) {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (nameA === nameB)
        return a.uuid.localeCompare(b.uuid);
      if (nameA === "")
        return 1;
      if (nameB === "")
        return -1;
      return nameA.localeCompare(nameB);
    }
    const clientTimeFormatter = new Intl.DateTimeFormat(void 0, {
      dateStyle: "medium",
      timeStyle: "short"
    });
    function formatClientTimestamp(seconds) {
      return clientTimeFormatter.format(new Date(seconds * 1e3));
    }
    function lastSeenLabel(client) {
      if (!client.lastSeen || !Number.isFinite(client.lastSeen)) {
        return t("clients.last_seen_unknown");
      }
      return t("clients.last_seen", { time: formatClientTimestamp(client.lastSeen) });
    }
    const sortedClients = computed(() => {
      const list = [...clients.value];
      if (clientSortMode.value === "recent") {
        list.sort((a, b) => {
          if (a.connected !== b.connected)
            return a.connected ? -1 : 1;
          const lastA = a.lastSeen ?? 0;
          const lastB = b.lastSeen ?? 0;
          if (lastA !== lastB)
            return lastB - lastA;
          return compareByName(a, b);
        });
        return list;
      }
      list.sort(compareByName);
      return list;
    });
    async function registerDevice() {
      var _a, _b, _c, _d, _e, _f;
      if (pairing.value)
        return;
      pairStatus.value = null;
      pairing.value = true;
      try {
        const trimmedName = deviceName.value.trim();
        const body = { pin: pin.value.trim(), name: trimmedName };
        const r = await http.post("./api/pin", body, { validateStatus: () => true });
        const ok = r && r.status >= 200 && r.status < 300 && (((_a = r.data) == null ? void 0 : _a.status) === true || ((_b = r.data) == null ? void 0 : _b.status) === "true" || ((_c = r.data) == null ? void 0 : _c.status) === 1);
        pairStatus.value = !!ok;
        if (ok) {
          const prevCount = ((_d = clients.value) == null ? void 0 : _d.length) || 0;
          await refreshClients();
          const deadline = Date.now() + 5e3;
          const target = trimmedName.toLowerCase();
          while (Date.now() < deadline) {
            const found = (_e = clients.value) == null ? void 0 : _e.some((c) => (c.name || "").toLowerCase() === target);
            if (found || (((_f = clients.value) == null ? void 0 : _f.length) || 0) > prevCount)
              break;
            await new Promise((res) => setTimeout(res, 400));
            await refreshClients();
          }
          pin.value = "";
          deviceName.value = "";
        }
      } catch {
        pairStatus.value = false;
      } finally {
        pairing.value = false;
        setTimeout(() => {
          pairStatus.value = null;
        }, 5e3);
      }
    }
    function askConfirmUnpair(client) {
      pendingRemoveUuid.value = client.uuid;
      pendingRemoveName.value = client && client.name ? client.name : "";
      showConfirmRemove.value = true;
    }
    async function confirmRemove() {
      const uuid = pendingRemoveUuid.value;
      showConfirmRemove.value = false;
      pendingRemoveUuid.value = "";
      pendingRemoveName.value = "";
      if (!uuid)
        return;
      await unpairSingle(uuid);
    }
    async function unpairSingle(uuid) {
      if (removing.value[uuid])
        return;
      removing.value = { ...removing.value, [uuid]: true };
      try {
        await http.post("./api/clients/unpair", { uuid }, { validateStatus: () => true });
      } catch {
      } finally {
        delete removing.value[uuid];
        removing.value = { ...removing.value };
        refreshClients();
      }
    }
    function askConfirmUnpairAll() {
      showConfirmUnpairAll.value = true;
    }
    async function confirmUnpairAll() {
      showConfirmUnpairAll.value = false;
      await unpairAll();
    }
    async function unpairAll() {
      var _a;
      unpairAllPressed.value = true;
      try {
        const r = await http.post("./api/clients/unpair-all", {}, { validateStatus: () => true });
        unpairAllStatus.value = ((_a = r.data) == null ? void 0 : _a.status) === true;
      } catch {
        unpairAllStatus.value = false;
      } finally {
        unpairAllPressed.value = false;
        setTimeout(() => {
          unpairAllStatus.value = null;
        }, 5e3);
        refreshClients();
      }
    }
    function editClient(client) {
      for (const c of clients.value) {
        if (c.uuid !== client.uuid && c.editing) {
          c.editing = false;
          resetClientEdits(c);
        }
      }
      resetClientEdits(client);
      client.editing = true;
      ensureDisplayDevicesLoaded();
      ensureHdrProfilesLoaded();
    }
    function cancelEdit(client) {
      resetClientEdits(client);
      client.editing = false;
    }
    async function saveClient(client) {
      var _a;
      if (saving.value[client.uuid])
        return;
      saving.value = { ...saving.value, [client.uuid]: true };
      try {
        const payload = {
          uuid: client.uuid,
          name: (client.editName || "").trim(),
          hdr_profile: String(client.editHdrProfile ?? "").trim(),
          display_mode: (client.editDisplayMode || "").trim(),
          perm: client.editPerm & permissionMapping._all,
          allow_client_commands: !!client.editAllowClientCommands,
          do: client.editDoCommands.reduce((result, entry) => {
            const cmd = String((entry == null ? void 0 : entry.cmd) ?? "").trim();
            if (!cmd)
              return result;
            result.push({
              cmd,
              elevated: !!(entry == null ? void 0 : entry.elevated)
            });
            return result;
          }, []),
          undo: client.editUndoCommands.reduce((result, entry) => {
            const cmd = String((entry == null ? void 0 : entry.cmd) ?? "").trim();
            if (!cmd)
              return result;
            result.push({
              cmd,
              elevated: !!(entry == null ? void 0 : entry.elevated)
            });
            return result;
          }, [])
        };
        if (!client.editDisplayOverrideEnabled) {
          payload.output_name_override = "";
          payload.always_use_virtual_display = false;
          payload.virtual_display_mode = "";
          payload.virtual_display_layout = "";
        } else if (client.editDisplaySelection === "physical") {
          payload.output_name_override = String(client.editPhysicalOutputOverride || "").trim();
          payload.always_use_virtual_display = false;
          payload.virtual_display_mode = "disabled";
          payload.virtual_display_layout = "";
        } else {
          payload.output_name_override = "";
          if (client.editVirtualDisplayMode === "global" || client.editVirtualDisplayMode === null) {
            payload.always_use_virtual_display = false;
            payload.virtual_display_mode = "global";
          } else {
            payload.always_use_virtual_display = true;
            payload.virtual_display_mode = client.editVirtualDisplayMode;
          }
          payload.virtual_display_layout = client.editVirtualDisplayLayout ?? "";
        }
        if (!isClientDisplayOverrideValid.value) {
          message.error(t("clients.update_failed"));
          return;
        }
        payload.config_overrides = client.editConfigOverrides && typeof client.editConfigOverrides === "object" && !Array.isArray(client.editConfigOverrides) ? Object.fromEntries(
          Object.entries(client.editConfigOverrides).filter(
            ([k, v]) => typeof k === "string" && k.length > 0 && v !== void 0 && v !== null
          )
        ) : {};
        if (client.editPrefer10BitSdr !== null) {
          payload.prefer_10bit_sdr = client.editPrefer10BitSdr === "enabled";
        }
        payload.hdr_profile = String(client.editHdrProfile ?? "").trim();
        const r = await http.post("./api/clients/update", payload, { validateStatus: () => true });
        const ok = r && r.status >= 200 && r.status < 300 && ((_a = r.data) == null ? void 0 : _a.status) === true;
        if (!ok) {
          message.error(t("clients.update_failed"));
          return;
        }
        client.name = payload.name;
        client.perm = payload.perm;
        client.hdrProfile = payload.hdr_profile;
        client.displayMode = payload.display_mode;
        client.outputOverride = payload.output_name_override;
        client.alwaysUseVirtualDisplay = payload.always_use_virtual_display;
        client.virtualDisplayMode = parseClientVirtualDisplayMode(payload.virtual_display_mode);
        client.virtualDisplayLayout = parseClientVirtualDisplayLayout(payload.virtual_display_layout);
        client.hdrProfile = payload.hdr_profile || "";
        client.allowClientCommands = payload.allow_client_commands;
        client.doCommands = JSON.parse(JSON.stringify(payload.do || []));
        client.undoCommands = JSON.parse(JSON.stringify(payload.undo || []));
        client.prefer10BitSdr = payload.prefer_10bit_sdr === void 0 ? null : payload.prefer_10bit_sdr ? "enabled" : "disabled";
        client.configOverrides = payload.config_overrides && typeof payload.config_overrides === "object" && !Array.isArray(payload.config_overrides) ? JSON.parse(JSON.stringify(payload.config_overrides)) : {};
        resetClientEdits(client);
        client.editing = false;
        message.success(t("clients.update_success"));
      } catch (e) {
        message.error((e == null ? void 0 : e.message) || t("clients.update_failed"));
      } finally {
        delete saving.value[client.uuid];
        saving.value = { ...saving.value };
        refreshClients();
      }
    }
    async function disconnectClient(client) {
      var _a;
      if (disconnecting.value[client.uuid])
        return;
      disconnecting.value = { ...disconnecting.value, [client.uuid]: true };
      try {
        const r = await http.post(
          "./api/clients/disconnect",
          { uuid: client.uuid },
          { validateStatus: () => true }
        );
        const ok = r && r.status >= 200 && r.status < 300 && ((_a = r.data) == null ? void 0 : _a.status) === true;
        if (!ok) {
          message.error(t("clients.disconnect_failed"));
          return;
        }
        message.success(t("clients.disconnect_success"));
      } catch (e) {
        message.error((e == null ? void 0 : e.message) || t("clients.disconnect_failed"));
      } finally {
        delete disconnecting.value[client.uuid];
        disconnecting.value = { ...disconnecting.value };
        refreshClients();
      }
    }
    const displayDevices = ref([]);
    const displayDevicesLoading = ref(false);
    const displayDevicesError = ref("");
    async function loadDisplayDevices() {
      if (!isWindows.value)
        return;
      displayDevicesLoading.value = true;
      displayDevicesError.value = "";
      try {
        const res = await http.get("/api/display-devices", {
          params: { detail: "full" }
        });
        displayDevices.value = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        displayDevicesError.value = (e == null ? void 0 : e.message) || "Failed to load display devices";
        displayDevices.value = [];
      } finally {
        displayDevicesLoading.value = false;
      }
    }
    function ensureDisplayDevicesLoaded() {
      if (!isWindows.value)
        return;
      if (!displayDevicesLoading.value && displayDevices.value.length === 0) {
        void loadDisplayDevices();
      }
    }
    const displayDeviceOptions = computed(() => {
      const opts = [];
      const seen = /* @__PURE__ */ new Set();
      for (const d of displayDevices.value) {
        const value = d.device_id || d.display_name || "";
        if (!value || seen.has(value))
          continue;
        const displayName = d.friendly_name || d.display_name || "Display";
        const info = d.info;
        let active = null;
        if (info && typeof info === "object" && "active" in info) {
          active = !!info.active;
        } else if (info) {
          active = true;
        }
        const suffix = active === null ? "" : active ? ` (${t("config.app_display_status_active")})` : ` (${t("config.app_display_status_inactive")})`;
        opts.push({
          label: `${displayName} - ${value}${suffix}`,
          value,
          displayName,
          id: value,
          active
        });
        seen.add(value);
      }
      return opts;
    });
    onMounted(async () => {
      const auth = useAuthStore();
      await configStore.fetchConfig().catch(() => {
      });
      await auth.waitForAuthentication();
      await refreshClients();
      if (refreshIntervalId === null) {
        refreshIntervalId = setInterval(() => {
          void refreshClients();
        }, 5e3);
      }
    });
    onBeforeUnmount(() => {
      if (refreshIntervalId !== null) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }
    });
    return (_ctx, _cache) => {
      const _component_ApiTokenManager = resolveComponent("ApiTokenManager");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("h1", _hoisted_2, [
          createVNode(LucideIcon, {
            name: "fa-users-cog",
            size: 28
          }),
          createTextVNode(
            " " + toDisplayString(_ctx.$t("clients.title")),
            1
            /* TEXT */
          )
        ]),
        createCommentVNode(" Pair New Client "),
        createVNode(unref(NCard), {
          class: "mb-8",
          segmented: { content: true, footer: true }
        }, {
          header: withCtx(() => [
            createBaseVNode("h2", _hoisted_3, [
              createVNode(LucideIcon, {
                name: "fa-link",
                size: 20
              }),
              createTextVNode(
                " " + toDisplayString(_ctx.$t("clients.pair_title")),
                1
                /* TEXT */
              )
            ])
          ]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode(
                "p",
                _hoisted_5,
                toDisplayString(_ctx.$t("clients.pair_desc")),
                1
                /* TEXT */
              ),
              createVNode(unref(NForm), {
                class: "grid grid-cols-1 md:grid-cols-3 gap-4 items-end",
                onSubmit: withModifiers(registerDevice, ["prevent"])
              }, {
                default: withCtx(() => [
                  createVNode(unref(NFormItem), {
                    class: "flex flex-col",
                    label: _ctx.$t("navbar.pin"),
                    "label-placement": "top"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(__unplugin_components_0), {
                        value: pin.value,
                        "onUpdate:value": _cache[0] || (_cache[0] = ($event) => pin.value = $event),
                        placeholder: _ctx.$t("navbar.pin"),
                        "input-props": {
                          inputmode: "numeric",
                          pattern: "^[0-9]{4}$",
                          maxlength: 4,
                          required: true
                        }
                      }, null, 8, ["value", "placeholder"])
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["label"]),
                  createVNode(unref(NFormItem), {
                    class: "flex flex-col",
                    label: _ctx.$t("pin.device_name"),
                    "label-placement": "top"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(__unplugin_components_0), {
                        value: deviceName.value,
                        "onUpdate:value": _cache[1] || (_cache[1] = ($event) => deviceName.value = $event),
                        placeholder: _ctx.$t("pin.device_name")
                      }, null, 8, ["value", "placeholder"])
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["label"]),
                  createVNode(unref(NFormItem), { class: "flex flex-col md:items-end" }, {
                    default: withCtx(() => [
                      createVNode(unref(NButton), {
                        disabled: pairing.value,
                        class: "w-full md:w-auto",
                        type: "primary",
                        "attr-type": "submit"
                      }, {
                        default: withCtx(() => [
                          !pairing.value ? (openBlock(), createElementBlock(
                            "span",
                            _hoisted_6,
                            toDisplayString(_ctx.$t("pin.send")),
                            1
                            /* TEXT */
                          )) : (openBlock(), createElementBlock(
                            "span",
                            _hoisted_7,
                            toDisplayString(_ctx.$t("clients.pairing")),
                            1
                            /* TEXT */
                          ))
                        ]),
                        _: 1
                        /* STABLE */
                      }, 8, ["disabled"])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                _: 1
                /* STABLE */
              }),
              createBaseVNode("div", _hoisted_8, [
                pairStatus.value === true ? (openBlock(), createBlock(unref(NAlert), {
                  key: 0,
                  type: "success"
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("pin.pair_success")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                })) : createCommentVNode("v-if", true),
                pairStatus.value === false ? (openBlock(), createBlock(unref(NAlert), {
                  key: 1,
                  type: "error"
                }, {
                  default: withCtx(() => [
                    createTextVNode(
                      toDisplayString(_ctx.$t("pin.pair_failure")),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                })) : createCommentVNode("v-if", true)
              ]),
              createVNode(unref(NAlert), {
                type: "warning",
                title: _ctx.$t("_common.warning"),
                class: "text-sm"
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(_ctx.$t("pin.warning_msg")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title"])
            ])
          ]),
          _: 1
          /* STABLE */
        }),
        createCommentVNode(" Existing Clients "),
        createVNode(unref(NCard), {
          class: "mb-8",
          segmented: { content: true, footer: true }
        }, {
          header: withCtx(() => [
            createBaseVNode("h2", _hoisted_9, [
              createVNode(LucideIcon, {
                name: "fa-users",
                size: 18
              }),
              createTextVNode(
                " " + toDisplayString(_ctx.$t("clients.existing_title")),
                1
                /* TEXT */
              )
            ])
          ]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_10, [
              createBaseVNode(
                "p",
                _hoisted_11,
                toDisplayString(_ctx.$t("troubleshooting.unpair_desc")),
                1
                /* TEXT */
              ),
              createBaseVNode("div", _hoisted_12, [
                createBaseVNode(
                  "span",
                  _hoisted_13,
                  toDisplayString(_ctx.$t("clients.sort_label")),
                  1
                  /* TEXT */
                ),
                createVNode(unref(NSelect), {
                  value: clientSortMode.value,
                  "onUpdate:value": _cache[2] || (_cache[2] = ($event) => clientSortMode.value = $event),
                  options: clientSortOptions.value,
                  size: "small",
                  class: "min-w-[160px]"
                }, null, 8, ["value", "options"])
              ]),
              createVNode(unref(NButton), {
                class: "md:ml-auto",
                type: "error",
                strong: "",
                disabled: unpairAllPressed.value || clients.value.length === 0,
                onClick: askConfirmUnpairAll
              }, {
                default: withCtx(() => [
                  createVNode(LucideIcon, {
                    name: "fa-user-slash",
                    size: 16
                  }),
                  createTextVNode(
                    " " + toDisplayString(_ctx.$t("troubleshooting.unpair_all")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["disabled"])
            ]),
            unpairAllStatus.value === true ? (openBlock(), createBlock(unref(NAlert), {
              key: 0,
              type: "success",
              class: "mt-3"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.unpair_all_success")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true),
            unpairAllStatus.value === false ? (openBlock(), createBlock(unref(NAlert), {
              key: 1,
              type: "error",
              class: "mt-3"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.unpair_all_error")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true),
            clients.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_14, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(sortedClients.value, (client) => {
                  return openBlock(), createElementBlock("div", {
                    key: client.uuid,
                    class: "rounded-2xl border border-dark/[0.06] bg-light/[0.02] p-4 shadow-sm dark:border-light/[0.12]"
                  }, [
                    createBaseVNode("div", _hoisted_15, [
                      createBaseVNode(
                        "span",
                        {
                          class: normalizeClass(["rounded-full px-3 py-1 text-xs font-semibold text-white", client.perm >= highlightPermissionThreshold ? "bg-red-500" : "bg-brand"])
                        },
                        " [ " + toDisplayString(permToStr(client.perm)) + " ] ",
                        3
                        /* TEXT, CLASS */
                      ),
                      createBaseVNode(
                        "span",
                        _hoisted_16,
                        toDisplayString(client.name !== "" ? client.name : _ctx.$t("troubleshooting.unpair_single_unknown")),
                        1
                        /* TEXT */
                      ),
                      client.connected ? (openBlock(), createBlock(unref(NTag), {
                        key: 0,
                        type: "warning",
                        size: "small"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(
                            toDisplayString(_ctx.$t("clients.connected")),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 1
                        /* STABLE */
                      })) : createCommentVNode("v-if", true),
                      createBaseVNode("div", _hoisted_17, [
                        client.connected ? (openBlock(), createBlock(unref(NButton), {
                          key: 0,
                          size: "medium",
                          type: "warning",
                          quaternary: "",
                          class: "min-w-11 min-h-11",
                          disabled: disconnecting.value[client.uuid] === true,
                          "aria-label": "Disconnect client",
                          onClick: ($event) => disconnectClient(client)
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-link-slash",
                              size: 18
                            })
                          ]),
                          _: 2
                          /* DYNAMIC */
                        }, 1032, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                        client.editing ? (openBlock(), createBlock(unref(NButton), {
                          key: 1,
                          size: "medium",
                          type: "success",
                          quaternary: "",
                          class: "min-w-11 min-h-11",
                          disabled: saving.value[client.uuid] === true || !isClientDisplayOverrideValid.value,
                          "aria-label": "Save changes",
                          onClick: ($event) => saveClient(client)
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-check",
                              size: 18
                            })
                          ]),
                          _: 2
                          /* DYNAMIC */
                        }, 1032, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                        client.editing ? (openBlock(), createBlock(unref(NButton), {
                          key: 2,
                          size: "medium",
                          quaternary: "",
                          class: "min-w-11 min-h-11",
                          disabled: saving.value[client.uuid] === true,
                          "aria-label": "Cancel editing",
                          onClick: ($event) => cancelEdit(client)
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-times",
                              size: 18
                            })
                          ]),
                          _: 2
                          /* DYNAMIC */
                        }, 1032, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                        !client.editing ? (openBlock(), createBlock(unref(NButton), {
                          key: 3,
                          size: "medium",
                          quaternary: "",
                          type: "primary",
                          class: "min-w-11 min-h-11",
                          "aria-label": "Edit client",
                          onClick: ($event) => editClient(client)
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-edit",
                              size: 18
                            })
                          ]),
                          _: 2
                          /* DYNAMIC */
                        }, 1032, ["onClick"])) : createCommentVNode("v-if", true),
                        createVNode(unref(NButton), {
                          size: "medium",
                          quaternary: "",
                          type: "error",
                          class: "min-w-11 min-h-11",
                          disabled: removing.value[client.uuid] === true,
                          "aria-label": "Unpair client",
                          onClick: ($event) => askConfirmUnpair(client)
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-trash",
                              size: 18
                            })
                          ]),
                          _: 2
                          /* DYNAMIC */
                        }, 1032, ["disabled", "onClick"])
                      ])
                    ]),
                    client.lastSeen ? (openBlock(), createElementBlock(
                      "div",
                      _hoisted_18,
                      toDisplayString(lastSeenLabel(client)),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true),
                    client.editing ? (openBlock(), createElementBlock("div", _hoisted_19, [
                      createVNode(
                        unref(NForm),
                        {
                          "label-placement": "top",
                          class: "space-y-4",
                          onSubmit: _cache[3] || (_cache[3] = withModifiers(() => {
                          }, ["prevent"]))
                        },
                        {
                          default: withCtx(() => [
                            createVNode(unref(NFormItem), {
                              label: _ctx.$t("pin.device_name")
                            }, {
                              default: withCtx(() => [
                                createVNode(unref(__unplugin_components_0), {
                                  value: client.editName,
                                  "onUpdate:value": ($event) => client.editName = $event
                                }, null, 8, ["value", "onUpdate:value"])
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["label"]),
                            createBaseVNode("div", _hoisted_20, [
                              createBaseVNode("div", _hoisted_21, [
                                (openBlock(), createElementBlock(
                                  Fragment,
                                  null,
                                  renderList(permissionGroups, (group) => {
                                    return createBaseVNode("div", {
                                      key: group.id,
                                      class: "space-y-2"
                                    }, [
                                      createBaseVNode(
                                        "div",
                                        _hoisted_22,
                                        toDisplayString(_ctx.$t(group.labelKey)),
                                        1
                                        /* TEXT */
                                      ),
                                      createBaseVNode("div", _hoisted_23, [
                                        (openBlock(true), createElementBlock(
                                          Fragment,
                                          null,
                                          renderList(group.permissions, (perm) => {
                                            return openBlock(), createBlock(unref(NButton), {
                                              key: perm.key,
                                              size: "small",
                                              type: isSuppressed(client.editPerm, perm.key, perm.suppressedBy) || checkPermission(client.editPerm, perm.key) ? "primary" : "default",
                                              ghost: !checkPermission(client.editPerm, perm.key),
                                              disabled: isSuppressed(client.editPerm, perm.key, perm.suppressedBy),
                                              onClick: ($event) => togglePermission(client, perm.key)
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(
                                                  toDisplayString(_ctx.$t(`permissions.${perm.key}`)),
                                                  1
                                                  /* TEXT */
                                                )
                                              ]),
                                              _: 2
                                              /* DYNAMIC */
                                            }, 1032, ["type", "ghost", "disabled", "onClick"]);
                                          }),
                                          128
                                          /* KEYED_FRAGMENT */
                                        ))
                                      ])
                                    ]);
                                  }),
                                  64
                                  /* STABLE_FRAGMENT */
                                ))
                              ])
                            ]),
                            createVNode(unref(NFormItem), {
                              label: _ctx.$t("pin.display_mode_override")
                            }, {
                              feedback: withCtx(() => [
                                createBaseVNode(
                                  "span",
                                  _hoisted_24,
                                  toDisplayString(_ctx.$t("pin.display_mode_override_desc")),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              default: withCtx(() => [
                                createVNode(unref(__unplugin_components_0), {
                                  value: client.editDisplayMode,
                                  "onUpdate:value": ($event) => client.editDisplayMode = $event,
                                  placeholder: "1920x1080x60"
                                }, null, 8, ["value", "onUpdate:value"])
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["label"]),
                            createVNode(
                              unref(NFormItem),
                              null,
                              {
                                default: withCtx(() => [
                                  createVNode(unref(NCheckbox), {
                                    checked: client.editAllowClientCommands,
                                    "onUpdate:checked": ($event) => client.editAllowClientCommands = $event,
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [..._cache[8] || (_cache[8] = [
                                      createBaseVNode(
                                        "div",
                                        { class: "flex flex-col" },
                                        [
                                          createBaseVNode("span", null, "Allow Client Commands"),
                                          createBaseVNode("span", { class: "text-xs opacity-80" }, " Allow this client to run connect and disconnect commands. ")
                                        ],
                                        -1
                                        /* CACHED */
                                      )
                                    ])]),
                                    _: 2,
                                    __: [8]
                                  }, 1032, ["checked", "onUpdate:checked"])
                                ]),
                                _: 2
                                /* DYNAMIC */
                              },
                              1024
                              /* DYNAMIC_SLOTS */
                            ),
                            client.editAllowClientCommands ? (openBlock(), createElementBlock("div", _hoisted_25, [
                              createBaseVNode("div", _hoisted_26, [
                                createBaseVNode("div", _hoisted_27, [
                                  _cache[9] || (_cache[9] = createBaseVNode(
                                    "div",
                                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                                    " Connect Commands ",
                                    -1
                                    /* CACHED */
                                  )),
                                  createVNode(unref(NButton), {
                                    size: "tiny",
                                    tertiary: "",
                                    onClick: ($event) => addClientCommand(client.editDoCommands)
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(LucideIcon, {
                                        name: "fa-plus",
                                        size: 14
                                      }),
                                      createTextVNode(
                                        " " + toDisplayString(_ctx.$t("_common.add")),
                                        1
                                        /* TEXT */
                                      )
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["onClick"])
                                ]),
                                client.editDoCommands.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_28, " No commands configured. ")) : (openBlock(), createElementBlock("div", _hoisted_29, [
                                  (openBlock(true), createElementBlock(
                                    Fragment,
                                    null,
                                    renderList(client.editDoCommands, (command, index) => {
                                      return openBlock(), createElementBlock("div", {
                                        key: `do-${client.uuid}-${index}`,
                                        class: "rounded-md border border-dark/10 dark:border-light/10 p-3"
                                      }, [
                                        createBaseVNode("div", _hoisted_30, [
                                          createVNode(unref(__unplugin_components_0), {
                                            value: command.cmd,
                                            "onUpdate:value": ($event) => command.cmd = $event,
                                            class: "font-mono",
                                            placeholder: _ctx.$t("_common.cmd")
                                          }, null, 8, ["value", "onUpdate:value", "placeholder"]),
                                          isWindows.value ? (openBlock(), createBlock(unref(NCheckbox), {
                                            key: 0,
                                            checked: command.elevated,
                                            "onUpdate:checked": ($event) => command.elevated = $event,
                                            size: "small"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(
                                                toDisplayString(_ctx.$t("_common.elevated")),
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
                                            secondary: "",
                                            onClick: ($event) => removeClientCommand(client.editDoCommands, index)
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(LucideIcon, {
                                                name: "fa-trash",
                                                size: 18
                                              })
                                            ]),
                                            _: 2
                                            /* DYNAMIC */
                                          }, 1032, ["onClick"])
                                        ])
                                      ]);
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ]))
                              ]),
                              createBaseVNode("div", _hoisted_31, [
                                createBaseVNode("div", _hoisted_32, [
                                  _cache[10] || (_cache[10] = createBaseVNode(
                                    "div",
                                    { class: "text-xs font-semibold uppercase tracking-wide opacity-70" },
                                    " Disconnect Commands ",
                                    -1
                                    /* CACHED */
                                  )),
                                  createVNode(unref(NButton), {
                                    size: "tiny",
                                    tertiary: "",
                                    onClick: ($event) => addClientCommand(client.editUndoCommands)
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(LucideIcon, {
                                        name: "fa-plus",
                                        size: 14
                                      }),
                                      createTextVNode(
                                        " " + toDisplayString(_ctx.$t("_common.add")),
                                        1
                                        /* TEXT */
                                      )
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["onClick"])
                                ]),
                                client.editUndoCommands.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_33, " No commands configured. ")) : (openBlock(), createElementBlock("div", _hoisted_34, [
                                  (openBlock(true), createElementBlock(
                                    Fragment,
                                    null,
                                    renderList(client.editUndoCommands, (command, index) => {
                                      return openBlock(), createElementBlock("div", {
                                        key: `undo-${client.uuid}-${index}`,
                                        class: "rounded-md border border-dark/10 dark:border-light/10 p-3"
                                      }, [
                                        createBaseVNode("div", _hoisted_35, [
                                          createVNode(unref(__unplugin_components_0), {
                                            value: command.cmd,
                                            "onUpdate:value": ($event) => command.cmd = $event,
                                            class: "font-mono",
                                            placeholder: _ctx.$t("_common.cmd")
                                          }, null, 8, ["value", "onUpdate:value", "placeholder"]),
                                          isWindows.value ? (openBlock(), createBlock(unref(NCheckbox), {
                                            key: 0,
                                            checked: command.elevated,
                                            "onUpdate:checked": ($event) => command.elevated = $event,
                                            size: "small"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(
                                                toDisplayString(_ctx.$t("_common.elevated")),
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
                                            secondary: "",
                                            onClick: ($event) => removeClientCommand(client.editUndoCommands, index)
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(LucideIcon, {
                                                name: "fa-trash",
                                                size: 18
                                              })
                                            ]),
                                            _: 2
                                            /* DYNAMIC */
                                          }, 1032, ["onClick"])
                                        ])
                                      ]);
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ]))
                              ])
                            ])) : createCommentVNode("v-if", true),
                            isWindows.value ? (openBlock(), createElementBlock("div", _hoisted_36, [
                              createVNode(unref(NCheckbox), {
                                checked: client.editDisplayOverrideEnabled,
                                "onUpdate:checked": [($event) => client.editDisplayOverrideEnabled = $event, (v) => applyClientDisplayOverrideEnabled(client, v)],
                                size: "small"
                              }, {
                                default: withCtx(() => [
                                  createBaseVNode("div", _hoisted_37, [
                                    createBaseVNode(
                                      "span",
                                      null,
                                      toDisplayString(unref(t)("config.client_display_override_label")),
                                      1
                                      /* TEXT */
                                    ),
                                    createBaseVNode(
                                      "span",
                                      _hoisted_38,
                                      toDisplayString(unref(t)("config.client_display_override_hint")),
                                      1
                                      /* TEXT */
                                    )
                                  ])
                                ]),
                                _: 2
                                /* DYNAMIC */
                              }, 1032, ["checked", "onUpdate:checked"]),
                              client.editDisplayOverrideEnabled ? (openBlock(), createElementBlock("div", _hoisted_39, [
                                createBaseVNode("div", _hoisted_40, [
                                  createBaseVNode("div", _hoisted_41, [
                                    createBaseVNode(
                                      "span",
                                      _hoisted_42,
                                      toDisplayString(unref(t)("config.client_display_override_label")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  createBaseVNode(
                                    "p",
                                    _hoisted_43,
                                    toDisplayString(unref(t)("config.client_display_override_hint")),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                createBaseVNode("div", _hoisted_44, [
                                  createVNode(unref(NRadioGroup), {
                                    value: client.editDisplaySelection,
                                    "onUpdate:value": (v) => applyClientDisplaySelection(client, v),
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
                                            _hoisted_45,
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
                                            _hoisted_46,
                                            toDisplayString(unref(t)("config.app_display_override_physical")),
                                            1
                                            /* TEXT */
                                          )
                                        ]),
                                        _: 1
                                        /* STABLE */
                                      })
                                    ]),
                                    _: 2
                                    /* DYNAMIC */
                                  }, 1032, ["value", "onUpdate:value"])
                                ]),
                                client.editDisplaySelection === "physical" ? (openBlock(), createElementBlock("div", _hoisted_47, [
                                  createBaseVNode("div", _hoisted_48, [
                                    createBaseVNode(
                                      "span",
                                      _hoisted_49,
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
                                    _hoisted_50,
                                    toDisplayString(unref(t)("config.app_display_physical_hint")),
                                    1
                                    /* TEXT */
                                  ),
                                  createVNode(unref(NSelect), {
                                    value: client.editPhysicalOutputOverride,
                                    "onUpdate:value": ($event) => client.editPhysicalOutputOverride = $event,
                                    options: displayDeviceOptions.value,
                                    loading: displayDevicesLoading.value,
                                    placeholder: unref(t)("config.app_display_physical_placeholder"),
                                    filterable: "",
                                    clearable: "",
                                    "fallback-option": (value) => ({
                                      label: value,
                                      value,
                                      displayName: value,
                                      id: value,
                                      active: null
                                    }),
                                    "render-label": renderDisplayDeviceLabel,
                                    "render-option": renderDisplayDeviceOption,
                                    onFocus: ensureDisplayDevicesLoaded
                                  }, null, 8, ["value", "onUpdate:value", "options", "loading", "placeholder", "fallback-option"]),
                                  createBaseVNode("div", _hoisted_51, [
                                    displayDevicesError.value ? (openBlock(), createElementBlock(
                                      "span",
                                      _hoisted_52,
                                      toDisplayString(displayDevicesError.value),
                                      1
                                      /* TEXT */
                                    )) : (openBlock(), createElementBlock(
                                      "span",
                                      _hoisted_53,
                                      toDisplayString(unref(t)("config.app_display_physical_status_hint")),
                                      1
                                      /* TEXT */
                                    ))
                                  ])
                                ])) : (openBlock(), createElementBlock("div", _hoisted_54, [
                                  createBaseVNode("div", _hoisted_55, [
                                    createBaseVNode("div", _hoisted_56, [
                                      createBaseVNode(
                                        "span",
                                        _hoisted_57,
                                        toDisplayString(unref(t)("config.virtual_display_mode_label")),
                                        1
                                        /* TEXT */
                                      )
                                    ]),
                                    createBaseVNode(
                                      "p",
                                      _hoisted_58,
                                      toDisplayString(unref(t)("config.virtual_display_mode_step_hint")),
                                      1
                                      /* TEXT */
                                    ),
                                    createVNode(unref(NRadioGroup), {
                                      value: client.editVirtualDisplayMode,
                                      "onUpdate:value": ($event) => client.editVirtualDisplayMode = $event,
                                      class: "grid gap-3 sm:grid-cols-2"
                                    }, {
                                      default: withCtx(() => [
                                        (openBlock(true), createElementBlock(
                                          Fragment,
                                          null,
                                          renderList(virtualDisplayModeOptions.value, (option) => {
                                            return openBlock(), createBlock(unref(NRadio), {
                                              key: String(option.value),
                                              value: option.value,
                                              class: "app-radio-card cursor-pointer"
                                            }, {
                                              default: withCtx(() => [
                                                createBaseVNode(
                                                  "span",
                                                  _hoisted_59,
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
                                      _: 2
                                      /* DYNAMIC */
                                    }, 1032, ["value", "onUpdate:value"]),
                                    client.editVirtualDisplayMode === "global" ? (openBlock(), createElementBlock(
                                      "div",
                                      _hoisted_60,
                                      toDisplayString(unref(t)("config.app_virtual_display_mode_follow_global")),
                                      1
                                      /* TEXT */
                                    )) : createCommentVNode("v-if", true)
                                  ]),
                                  createBaseVNode("div", _hoisted_61, [
                                    createBaseVNode("div", _hoisted_62, [
                                      createBaseVNode(
                                        "span",
                                        _hoisted_63,
                                        toDisplayString(unref(t)("config.virtual_display_layout_label")),
                                        1
                                        /* TEXT */
                                      ),
                                      client.editVirtualDisplayLayout !== null ? (openBlock(), createBlock(unref(NButton), {
                                        key: 0,
                                        size: "tiny",
                                        tertiary: "",
                                        onClick: ($event) => client.editVirtualDisplayLayout = null
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(
                                            toDisplayString(unref(t)("config.app_virtual_display_layout_reset")),
                                            1
                                            /* TEXT */
                                          )
                                        ]),
                                        _: 2
                                        /* DYNAMIC */
                                      }, 1032, ["onClick"])) : createCommentVNode("v-if", true)
                                    ]),
                                    createBaseVNode(
                                      "p",
                                      _hoisted_64,
                                      toDisplayString(unref(t)("config.virtual_display_layout_hint")),
                                      1
                                      /* TEXT */
                                    ),
                                    createVNode(unref(NRadioGroup), {
                                      value: client.editVirtualDisplayLayout ?? globalVirtualDisplayLayout.value ?? "exclusive",
                                      "onUpdate:value": (v) => client.editVirtualDisplayLayout = v === globalVirtualDisplayLayout.value ? null : v,
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
                                              onClick: ($event) => client.editVirtualDisplayLayout = option.value === globalVirtualDisplayLayout.value ? null : option.value,
                                              onKeydown: [
                                                withKeys(withModifiers(($event) => client.editVirtualDisplayLayout = option.value === globalVirtualDisplayLayout.value ? null : option.value, ["prevent"]), ["enter"]),
                                                withKeys(withModifiers(($event) => client.editVirtualDisplayLayout = option.value === globalVirtualDisplayLayout.value ? null : option.value, ["prevent"]), ["space"])
                                              ],
                                              tabindex: "0"
                                            }, [
                                              createBaseVNode("div", _hoisted_66, [
                                                createVNode(unref(NRadio), {
                                                  value: option.value
                                                }, null, 8, ["value"]),
                                                createBaseVNode(
                                                  "span",
                                                  _hoisted_67,
                                                  toDisplayString(option.label),
                                                  1
                                                  /* TEXT */
                                                )
                                              ]),
                                              createBaseVNode(
                                                "span",
                                                _hoisted_68,
                                                toDisplayString(unref(t)(`config.virtual_display_layout_${option.value}_desc`)),
                                                1
                                                /* TEXT */
                                              )
                                            ], 40, _hoisted_65);
                                          }),
                                          128
                                          /* KEYED_FRAGMENT */
                                        ))
                                      ]),
                                      _: 2
                                      /* DYNAMIC */
                                    }, 1032, ["value", "onUpdate:value"]),
                                    client.editVirtualDisplayLayout === null ? (openBlock(), createElementBlock(
                                      "div",
                                      _hoisted_69,
                                      toDisplayString(unref(t)("config.app_virtual_display_layout_follow_global")),
                                      1
                                      /* TEXT */
                                    )) : createCommentVNode("v-if", true)
                                  ])
                                ]))
                              ])) : createCommentVNode("v-if", true)
                            ])) : createCommentVNode("v-if", true),
                            isWindows.value ? (openBlock(), createBlock(unref(NFormItem), {
                              key: 2,
                              label: unref(t)("clients.hdr_profile_label")
                            }, {
                              feedback: withCtx(() => [
                                createBaseVNode(
                                  "span",
                                  _hoisted_70,
                                  toDisplayString(unref(t)("clients.hdr_profile_desc")),
                                  1
                                  /* TEXT */
                                ),
                                hdrProfilesError.value ? (openBlock(), createElementBlock(
                                  "span",
                                  _hoisted_71,
                                  toDisplayString(hdrProfilesError.value),
                                  1
                                  /* TEXT */
                                )) : createCommentVNode("v-if", true)
                              ]),
                              default: withCtx(() => [
                                createVNode(unref(NSelect), {
                                  value: client.editHdrProfile,
                                  "onUpdate:value": ($event) => client.editHdrProfile = $event,
                                  options: hdrProfileOptions.value,
                                  loading: hdrProfilesLoading.value,
                                  placeholder: unref(t)("clients.hdr_profile_placeholder"),
                                  filterable: "",
                                  clearable: "",
                                  onFocus: ensureHdrProfilesLoaded
                                }, null, 8, ["value", "onUpdate:value", "options", "loading", "placeholder"])
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["label"])) : createCommentVNode("v-if", true),
                            createVNode(unref(NFormItem), {
                              label: unref(t)("config.prefer_10bit_sdr")
                            }, {
                              feedback: withCtx(() => [
                                createBaseVNode(
                                  "span",
                                  _hoisted_72,
                                  toDisplayString(unref(t)("config.prefer_10bit_sdr_desc")),
                                  1
                                  /* TEXT */
                                ),
                                client.editPrefer10BitSdr === null ? (openBlock(), createElementBlock(
                                  "span",
                                  _hoisted_73,
                                  toDisplayString(unref(t)("config.prefer_10bit_sdr_follow_global")) + " (" + toDisplayString(globalPrefer10BitSdr.value ? unref(t)("_common.enabled") : unref(t)("_common.disabled")) + ") ",
                                  1
                                  /* TEXT */
                                )) : createCommentVNode("v-if", true)
                              ]),
                              default: withCtx(() => [
                                createVNode(unref(NSelect), {
                                  value: client.editPrefer10BitSdr,
                                  "onUpdate:value": ($event) => client.editPrefer10BitSdr = $event,
                                  options: prefer10BitSdrOptions.value,
                                  clearable: "",
                                  placeholder: unref(t)("config.prefer_10bit_sdr_follow_global")
                                }, null, 8, ["value", "onUpdate:value", "options", "placeholder"])
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["label"]),
                            createVNode(AppEditConfigOverridesSection, {
                              overrides: client.editConfigOverrides,
                              "onUpdate:overrides": ($event) => client.editConfigOverrides = $event,
                              "scope-label": "client"
                            }, null, 8, ["overrides", "onUpdate:overrides"])
                          ]),
                          _: 2
                          /* DYNAMIC */
                        },
                        1024
                        /* DYNAMIC_SLOTS */
                      )
                    ])) : createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (openBlock(), createElementBlock("div", _hoisted_74, _cache[11] || (_cache[11] = [
              createBaseVNode(
                "div",
                { class: "rounded-2xl bg-brand/8 dark:bg-brand/12 p-5 mb-1" },
                [
                  createBaseVNode("svg", {
                    class: "w-10 h-10 text-brand opacity-70",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "aria-hidden": ""
                  }, [
                    createBaseVNode("rect", {
                      x: "2",
                      y: "6",
                      width: "10",
                      height: "8",
                      rx: "2",
                      "stroke-width": "1.5"
                    }),
                    createBaseVNode("rect", {
                      x: "14",
                      y: "3",
                      width: "8",
                      height: "6",
                      rx: "2",
                      "stroke-width": "1.5"
                    }),
                    createBaseVNode("rect", {
                      x: "14",
                      y: "14",
                      width: "8",
                      height: "6",
                      rx: "2",
                      "stroke-width": "1.5"
                    }),
                    createBaseVNode("path", {
                      d: "M12 10h2M12 17h2",
                      "stroke-width": "1.5",
                      "stroke-linecap": "round"
                    })
                  ])
                ],
                -1
                /* CACHED */
              ),
              createBaseVNode(
                "div",
                { class: "space-y-1.5 max-w-xs" },
                [
                  createBaseVNode("p", { class: "text-sm font-semibold text-dark dark:text-light" }, "No paired clients"),
                  createBaseVNode("p", { class: "text-xs leading-relaxed opacity-60" }, " Pair your first device using a PIN from the Sunshine app or a Moonlight-compatible client. ")
                ],
                -1
                /* CACHED */
              )
            ])))
          ]),
          _: 1
          /* STABLE */
        }),
        createVNode(TrustedDevicesCard),
        createVNode(_component_ApiTokenManager),
        createCommentVNode(" Confirm remove single client "),
        createVNode(unref(NModal), {
          show: showConfirmRemove.value,
          "onUpdate:show": _cache[5] || (_cache[5] = (v) => showConfirmRemove.value = v)
        }, {
          default: withCtx(() => [
            createVNode(unref(NCard), {
              title: _ctx.$t("clients.confirm_remove_title_named", {
                name: pendingRemoveName.value || _ctx.$t("troubleshooting.unpair_single_unknown")
              }),
              style: { "max-width": "32rem", "width": "100%" },
              bordered: false
            }, {
              footer: withCtx(() => [
                createBaseVNode("div", _hoisted_76, [
                  createVNode(unref(NButton), {
                    onClick: _cache[4] || (_cache[4] = ($event) => showConfirmRemove.value = false)
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
                    secondary: "",
                    onClick: confirmRemove
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        toDisplayString(_ctx.$t("clients.remove")),
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
                createBaseVNode(
                  "div",
                  _hoisted_75,
                  toDisplayString(_ctx.$t("clients.confirm_remove_message_named", {
                    name: pendingRemoveName.value || _ctx.$t("troubleshooting.unpair_single_unknown")
                  })),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["show"]),
        createCommentVNode(" Confirm unpair all "),
        createVNode(unref(NModal), {
          show: showConfirmUnpairAll.value,
          "onUpdate:show": _cache[7] || (_cache[7] = (v) => showConfirmUnpairAll.value = v)
        }, {
          default: withCtx(() => [
            createVNode(unref(NCard), {
              title: _ctx.$t("clients.confirm_unpair_all_title"),
              style: { "max-width": "32rem", "width": "100%" },
              bordered: false
            }, {
              footer: withCtx(() => [
                createBaseVNode("div", _hoisted_78, [
                  createVNode(unref(NButton), {
                    onClick: _cache[6] || (_cache[6] = ($event) => showConfirmUnpairAll.value = false)
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
                    secondary: "",
                    onClick: confirmUnpairAll
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        toDisplayString(_ctx.$t("troubleshooting.unpair_all")),
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
                createBaseVNode(
                  "div",
                  _hoisted_77,
                  toDisplayString(_ctx.$t("clients.confirm_unpair_all_message_count", {
                    count: clients.value.length
                  })),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["show"])
      ]);
    };
  }
});
const ClientManagementView_vue_vue_type_style_index_0_scoped_c47dd971_lang = "";
const ClientManagementView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c47dd971"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/ClientManagementView.vue"]]);
export {
  ClientManagementView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50TWFuYWdlbWVudFZpZXctM2Y3ZGQxZGQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2NvbXBvbmVudHMvVHJ1c3RlZERldmljZXNDYXJkLnZ1ZSIsIi4uLy4uL3ZpZXdzL0NsaWVudE1hbmFnZW1lbnRWaWV3LnZ1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8dGVtcGxhdGU+XHJcbiAgPG4tY2FyZCBjbGFzcz1cIm1iLThcIiA6c2VnbWVudGVkPVwieyBjb250ZW50OiB0cnVlLCBmb290ZXI6IGZhbHNlIH1cIj5cclxuICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWxnIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zaGllbGQtaGVhcnRcIiA6c2l6ZT1cIjE4XCIgLz4ge3sgdCgnYXV0aC5zZXNzaW9uc19oZWFkaW5nJykgfX1cclxuICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MCBtYXgtdy0yeGxcIj57eyB0KCdhdXRoLnNlc3Npb25zX2Rlc2NyaXB0aW9uJykgfX08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIDpsb2FkaW5nPVwibG9hZGluZ1wiIEBjbGljaz1cInJlZnJlc2hcIj5cclxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1yb3RhdGVcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWwtMlwiPnt7IHQoJ2F1dGgucmVmcmVzaCcpIH19PC9zcGFuPlxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC90ZW1wbGF0ZT5cclxuXHJcbiAgICA8bi1zcGluIDpzaG93PVwibG9hZGluZ1wiPlxyXG4gICAgICA8ZGl2IHYtaWY9XCJlcnJvck1lc3NhZ2VcIiBjbGFzcz1cInRleHQteHMgdGV4dC1kYW5nZXJcIj57eyBlcnJvck1lc3NhZ2UgfX08L2Rpdj5cclxuICAgICAgPGRpdiB2LWVsc2UtaWY9XCIhc2Vzc2lvbnNMaXN0Lmxlbmd0aFwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAge3sgdCgnYXV0aC5zZXNzaW9uc19lbXB0eScpIH19XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cIm92ZXJmbG93LXgtYXV0b1wiPlxyXG4gICAgICAgIDx0YWJsZSBjbGFzcz1cIm1pbi13LWZ1bGwgdGV4dC1zbVwiPlxyXG4gICAgICAgICAgPHRoZWFkXHJcbiAgICAgICAgICAgIGNsYXNzPVwidGV4dC1sZWZ0IHRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MCBib3JkZXItYiBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMFwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICA8dGggY2xhc3M9XCJweS0yIHByLTQgZm9udC1zZW1pYm9sZFwiPnt7IHQoJ2F1dGguc2Vzc2lvbnNfZGV2aWNlJykgfX08L3RoPlxyXG4gICAgICAgICAgICAgIDx0aCBjbGFzcz1cInB5LTIgcHItNCBmb250LXNlbWlib2xkXCI+e3sgdCgnYXV0aC5zZXNzaW9uc19hY3Rpdml0eScpIH19PC90aD5cclxuICAgICAgICAgICAgICA8dGggY2xhc3M9XCJweS0yIHByLTQgZm9udC1zZW1pYm9sZFwiPnt7IHQoJ2F1dGguc2Vzc2lvbnNfc3RhdHVzJykgfX08L3RoPlxyXG4gICAgICAgICAgICAgIDx0aCBjbGFzcz1cInB5LTIgdGV4dC1yaWdodCBmb250LXNlbWlib2xkXCI+e3sgdCgnYXV0aC5zZXNzaW9uc19hY3Rpb25zJykgfX08L3RoPlxyXG4gICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgIDx0Ym9keSBjbGFzcz1cImRpdmlkZS15IGRpdmlkZS1kYXJrLzEwIGRhcms6ZGl2aWRlLWxpZ2h0LzEwXCI+XHJcbiAgICAgICAgICAgIDx0ciB2LWZvcj1cInNlc3Npb24gaW4gc2Vzc2lvbnNMaXN0XCIgOmtleT1cInNlc3Npb24uaWRcIiBjbGFzcz1cImFsaWduLXRvcFwiPlxyXG4gICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInB5LTMgcHItNFwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTFcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1lZGl1bSBicmVhay13b3Jkc1wiPnt7IHByaW1hcnlMYWJlbChzZXNzaW9uKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgYnJlYWstd29yZHNcIj5cclxuICAgICAgICAgICAgICAgICAgICB7eyBzZWNvbmRhcnlMYWJlbChzZXNzaW9uKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInB5LTMgcHItNFwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTEgdGV4dC14c1wiPlxyXG4gICAgICAgICAgICAgICAgICA8c3Bhbj57eyBmb3JtYXRUaW1lc3RhbXAoc2Vzc2lvbi5jcmVhdGVkX2F0KSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcGFjaXR5LTcwXCI+e3tcclxuICAgICAgICAgICAgICAgICAgICB0KCdhdXRoLnNlc3Npb25zX2xhc3Rfc2VlbicsIHsgdGltZTogZm9ybWF0VGltZXN0YW1wKHNlc3Npb24ubGFzdF9zZWVuKSB9KVxyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcGFjaXR5LTcwXCI+e3tcclxuICAgICAgICAgICAgICAgICAgICB0KCdhdXRoLnNlc3Npb25zX2V4cGlyZXMnLCB7IHRpbWU6IGZvcm1hdFRpbWVzdGFtcChzZXNzaW9uRXhwaXJ5KHNlc3Npb24pKSB9KVxyXG4gICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicHktMyBwci00XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHNcIj5cclxuICAgICAgICAgICAgICAgICAgPG4tdGFnIHYtaWY9XCJzZXNzaW9uLnJlbWVtYmVyX21lXCIgc2l6ZT1cInNtYWxsXCIgdHlwZT1cImluZm9cIiA6Ym9yZGVyZWQ9XCJmYWxzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2F1dGguc2Vzc2lvbnNfcmVtZW1iZXJfZmxhZycpIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvbi10YWc+XHJcbiAgICAgICAgICAgICAgICAgIDxuLXRhZyB2LWVsc2Ugc2l6ZT1cInNtYWxsXCIgOmJvcmRlcmVkPVwiZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICB7eyB0KCdhdXRoLnNlc3Npb25zX3Nlc3Npb25fZmxhZycpIH19XHJcbiAgICAgICAgICAgICAgICAgIDwvbi10YWc+XHJcbiAgICAgICAgICAgICAgICAgIDxuLXRhZyB2LWlmPVwic2Vzc2lvbi5jdXJyZW50XCIgc2l6ZT1cInNtYWxsXCIgdHlwZT1cInN1Y2Nlc3NcIiA6Ym9yZGVyZWQ9XCJmYWxzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt7IHQoJ2F1dGguc2Vzc2lvbnNfY3VycmVudF9kZXZpY2UnKSB9fVxyXG4gICAgICAgICAgICAgICAgICA8L24tdGFnPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJweS0zIHRleHQtcmlnaHRcIj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJlcnJvclwiXHJcbiAgICAgICAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICAgICAgICA6bG9hZGluZz1cInJldm9raW5nSWQgPT09IHNlc3Npb24uaWRcIlxyXG4gICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjb25maXJtUmV2b2tlKHNlc3Npb24pXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAge3sgc2Vzc2lvbi5jdXJyZW50ID8gdCgnYXV0aC5zZXNzaW9uc19sb2dvdXQnKSA6IHQoJ2F1dGguc2Vzc2lvbnNfcmV2b2tlJykgfX1cclxuICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgPC90YWJsZT5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L24tc3Bpbj5cclxuICA8L24tY2FyZD5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCByZWYsIG9uTW91bnRlZCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHN0b3JlVG9SZWZzIH0gZnJvbSAncGluaWEnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5pbXBvcnQgeyB1c2VJMThuIH0gZnJvbSAndnVlLWkxOG4nO1xyXG5pbXBvcnQgeyB1c2VEaWFsb2csIHVzZU1lc3NhZ2UsIE5DYXJkLCBOQnV0dG9uLCBOU3BpbiwgTlRhZyB9IGZyb20gJ25haXZlLXVpJztcclxuaW1wb3J0IHsgdXNlQXV0aFN0b3JlLCB0eXBlIEF1dGhTZXNzaW9uIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XHJcblxyXG5jb25zdCBhdXRoID0gdXNlQXV0aFN0b3JlKCk7XHJcbmNvbnN0IHsgdCB9ID0gdXNlSTE4bigpO1xyXG5jb25zdCBkaWFsb2cgPSB1c2VEaWFsb2coKTtcclxuY29uc3QgbWVzc2FnZSA9IHVzZU1lc3NhZ2UoKTtcclxuXHJcbmNvbnN0IHsgc2Vzc2lvbnMsIHNlc3Npb25zTG9hZGluZywgc2Vzc2lvbnNFcnJvciB9ID0gc3RvcmVUb1JlZnMoYXV0aCk7XHJcbmNvbnN0IHJldm9raW5nSWQgPSByZWYoJycpO1xyXG5cclxuY29uc3Qgc2Vzc2lvbnNMaXN0ID0gY29tcHV0ZWQoKCkgPT4gc2Vzc2lvbnMudmFsdWUgfHwgW10pO1xyXG5jb25zdCBsb2FkaW5nID0gY29tcHV0ZWQoKCkgPT4gc2Vzc2lvbnNMb2FkaW5nLnZhbHVlKTtcclxuXHJcbmNvbnN0IGVycm9yTWVzc2FnZSA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoIXNlc3Npb25zRXJyb3IudmFsdWUpIHJldHVybiAnJztcclxuICBpZiAoc2Vzc2lvbnNFcnJvci52YWx1ZSA9PT0gJ2Vycm9yJykgcmV0dXJuIHQoJ2F1dGguc2Vzc2lvbnNfbG9hZF9mYWlsZWQnKTtcclxuICByZXR1cm4gc2Vzc2lvbnNFcnJvci52YWx1ZTtcclxufSk7XHJcblxyXG5jb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh1bmRlZmluZWQsIHtcclxuICBkYXRlU3R5bGU6ICdtZWRpdW0nLFxyXG4gIHRpbWVTdHlsZTogJ3Nob3J0JyxcclxufSk7XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRUaW1lc3RhbXAoc2Vjb25kcz86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgaWYgKCFzZWNvbmRzKSByZXR1cm4gdCgnYXV0aC5zZXNzaW9uc190aW1lX3Vua25vd24nKTtcclxuICBpZiAoIU51bWJlci5pc0Zpbml0ZShzZWNvbmRzKSkgcmV0dXJuIHQoJ2F1dGguc2Vzc2lvbnNfdGltZV91bmtub3duJyk7XHJcbiAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQobmV3IERhdGUoc2Vjb25kcyAqIDEwMDApKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2Vzc2lvbkV4cGlyeShzZXNzaW9uOiBBdXRoU2Vzc2lvbik6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgY29uc3QgcmVmcmVzaEV4cGlyeSA9IHNlc3Npb24ucmVmcmVzaF9leHBpcmVzX2F0O1xyXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUocmVmcmVzaEV4cGlyeSkpIHtcclxuICAgIHJldHVybiByZWZyZXNoRXhwaXJ5O1xyXG4gIH1cclxuICByZXR1cm4gc2Vzc2lvbi5leHBpcmVzX2F0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmltYXJ5TGFiZWwoc2Vzc2lvbjogQXV0aFNlc3Npb24pOiBzdHJpbmcge1xyXG4gIHJldHVybiAoXHJcbiAgICBzZXNzaW9uLmRldmljZV9sYWJlbCB8fCBmYWxsYmFja0FnZW50KHNlc3Npb24udXNlcl9hZ2VudCkgfHwgdCgnYXV0aC5zZXNzaW9uc191bmtub3duX2RldmljZScpXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2Vjb25kYXJ5TGFiZWwoc2Vzc2lvbjogQXV0aFNlc3Npb24pOiBzdHJpbmcge1xyXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIGlmIChzZXNzaW9uLnJlbW90ZV9hZGRyZXNzKSB7XHJcbiAgICBwYXJ0cy5wdXNoKHNlc3Npb24ucmVtb3RlX2FkZHJlc3MpO1xyXG4gIH1cclxuICBjb25zdCBhZ2VudFN1bW1hcnkgPSBmYWxsYmFja0FnZW50KHNlc3Npb24udXNlcl9hZ2VudCwgdHJ1ZSk7XHJcbiAgaWYgKGFnZW50U3VtbWFyeSkge1xyXG4gICAgcGFydHMucHVzaChhZ2VudFN1bW1hcnkpO1xyXG4gIH1cclxuICByZXR1cm4gcGFydHMuam9pbignIOKAoiAnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmFsbGJhY2tBZ2VudChhZ2VudD86IHN0cmluZywgY29tcGFjdCA9IGZhbHNlKTogc3RyaW5nIHtcclxuICBpZiAoIWFnZW50KSByZXR1cm4gJyc7XHJcbiAgY29uc3QgbGltaXQgPSBjb21wYWN0ID8gNDggOiA4MDtcclxuICBpZiAoYWdlbnQubGVuZ3RoIDw9IGxpbWl0KSByZXR1cm4gYWdlbnQ7XHJcbiAgcmV0dXJuIGAke2FnZW50LnNsaWNlKDAsIGxpbWl0IC0gMSl94oCmYDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBhd2FpdCBhdXRoLmZldGNoU2Vzc2lvbnMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29uZmlybVJldm9rZShzZXNzaW9uOiBBdXRoU2Vzc2lvbik6IHZvaWQge1xyXG4gIGNvbnN0IGlzQ3VycmVudCA9IHNlc3Npb24uY3VycmVudDtcclxuICBkaWFsb2cud2FybmluZyh7XHJcbiAgICB0aXRsZTogdCgnYXV0aC5zZXNzaW9uc19yZXZva2VfdGl0bGUnKSxcclxuICAgIGNvbnRlbnQ6IHQoJ2F1dGguc2Vzc2lvbnNfcmV2b2tlX21lc3NhZ2UnLCB7XHJcbiAgICAgIGRldmljZTogcHJpbWFyeUxhYmVsKHNlc3Npb24pLFxyXG4gICAgfSksXHJcbiAgICBwb3NpdGl2ZVRleHQ6IGlzQ3VycmVudCA/IHQoJ2F1dGguc2Vzc2lvbnNfbG9nb3V0JykgOiB0KCdhdXRoLnNlc3Npb25zX3Jldm9rZScpLFxyXG4gICAgbmVnYXRpdmVUZXh0OiB0KCdhdXRoLnNlc3Npb25zX2NhbmNlbCcpLFxyXG4gICAgb25Qb3NpdGl2ZUNsaWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHJldm9raW5nSWQudmFsdWUgPSBzZXNzaW9uLmlkO1xyXG4gICAgICBjb25zdCBvayA9IGF3YWl0IGF1dGgucmV2b2tlU2Vzc2lvbihzZXNzaW9uLmlkKTtcclxuICAgICAgcmV2b2tpbmdJZC52YWx1ZSA9ICcnO1xyXG4gICAgICBpZiAob2spIHtcclxuICAgICAgICBtZXNzYWdlLnN1Y2Nlc3ModCgnYXV0aC5zZXNzaW9uc19yZXZva2Vfc3VjY2VzcycpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtZXNzYWdlLmVycm9yKHQoJ2F1dGguc2Vzc2lvbnNfcmV2b2tlX2ZhaWxlZCcpKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICBhdXRoLmZldGNoU2Vzc2lvbnMoKS5jYXRjaCgoKSA9PiB7fSk7XHJcbn0pO1xyXG48L3NjcmlwdD5cclxuIiwiPHRlbXBsYXRlPlxyXG4gIDxkaXYgY2xhc3M9XCJjbGllbnRzLXBhZ2UgbWF4LXctNXhsIG14LWF1dG8gcHgtNCBwYi0xMCBzcGFjZS15LTEwXCI+XHJcbiAgICA8aDEgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LXNlbWlib2xkIG15LTYgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgdGV4dC1icmFuZFwiPlxyXG4gICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdXNlcnMtY29nXCIgOnNpemU9XCIyOFwiIC8+IHt7ICR0KCdjbGllbnRzLnRpdGxlJykgfX1cclxuICAgIDwvaDE+XHJcblxyXG4gICAgPCEtLSBQYWlyIE5ldyBDbGllbnQgLS0+XHJcbiAgICA8bi1jYXJkIGNsYXNzPVwibWItOFwiIDpzZWdtZW50ZWQ9XCJ7IGNvbnRlbnQ6IHRydWUsIGZvb3RlcjogdHJ1ZSB9XCI+XHJcbiAgICAgIDx0ZW1wbGF0ZSAjaGVhZGVyPlxyXG4gICAgICAgIDxoMiBjbGFzcz1cInRleHQtbGcgZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1saW5rXCIgOnNpemU9XCIyMFwiIC8+IHt7ICR0KCdjbGllbnRzLnBhaXJfdGl0bGUnKSB9fVxyXG4gICAgICAgIDwvaDI+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTRcIj5cclxuICAgICAgICA8cCBjbGFzcz1cInRleHQtc20gb3BhY2l0eS03NVwiPnt7ICR0KCdjbGllbnRzLnBhaXJfZGVzYycpIH19PC9wPlxyXG4gICAgICAgIDxuLWZvcm1cclxuICAgICAgICAgIGNsYXNzPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNCBpdGVtcy1lbmRcIlxyXG4gICAgICAgICAgQHN1Ym1pdC5wcmV2ZW50PVwicmVnaXN0ZXJEZXZpY2VcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxuLWZvcm0taXRlbSBjbGFzcz1cImZsZXggZmxleC1jb2xcIiA6bGFiZWw9XCIkdCgnbmF2YmFyLnBpbicpXCIgbGFiZWwtcGxhY2VtZW50PVwidG9wXCI+XHJcbiAgICAgICAgICAgIDxuLWlucHV0XHJcbiAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cInBpblwiXHJcbiAgICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwiJHQoJ25hdmJhci5waW4nKVwiXHJcbiAgICAgICAgICAgICAgOmlucHV0LXByb3BzPVwie1xyXG4gICAgICAgICAgICAgICAgaW5wdXRtb2RlOiAnbnVtZXJpYycsXHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiAnXlswLTldezR9JCcsXHJcbiAgICAgICAgICAgICAgICBtYXhsZW5ndGg6IDQsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICB9XCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvbi1mb3JtLWl0ZW0+XHJcbiAgICAgICAgICA8bi1mb3JtLWl0ZW0gY2xhc3M9XCJmbGV4IGZsZXgtY29sXCIgOmxhYmVsPVwiJHQoJ3Bpbi5kZXZpY2VfbmFtZScpXCIgbGFiZWwtcGxhY2VtZW50PVwidG9wXCI+XHJcbiAgICAgICAgICAgIDxuLWlucHV0IHYtbW9kZWw6dmFsdWU9XCJkZXZpY2VOYW1lXCIgOnBsYWNlaG9sZGVyPVwiJHQoJ3Bpbi5kZXZpY2VfbmFtZScpXCIgLz5cclxuICAgICAgICAgIDwvbi1mb3JtLWl0ZW0+XHJcbiAgICAgICAgICA8bi1mb3JtLWl0ZW0gY2xhc3M9XCJmbGV4IGZsZXgtY29sIG1kOml0ZW1zLWVuZFwiPlxyXG4gICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJwYWlyaW5nXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cInctZnVsbCBtZDp3LWF1dG9cIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgICBhdHRyLXR5cGU9XCJzdWJtaXRcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cIiFwYWlyaW5nXCI+e3sgJHQoJ3Bpbi5zZW5kJykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlPnt7ICR0KCdjbGllbnRzLnBhaXJpbmcnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgIDwvbi1mb3JtLWl0ZW0+XHJcbiAgICAgICAgPC9uLWZvcm0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgPG4tYWxlcnQgdi1pZj1cInBhaXJTdGF0dXMgPT09IHRydWVcIiB0eXBlPVwic3VjY2Vzc1wiPnt7ICR0KCdwaW4ucGFpcl9zdWNjZXNzJykgfX08L24tYWxlcnQ+XHJcbiAgICAgICAgICA8bi1hbGVydCB2LWlmPVwicGFpclN0YXR1cyA9PT0gZmFsc2VcIiB0eXBlPVwiZXJyb3JcIj57eyAkdCgncGluLnBhaXJfZmFpbHVyZScpIH19PC9uLWFsZXJ0PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxuLWFsZXJ0IHR5cGU9XCJ3YXJuaW5nXCIgOnRpdGxlPVwiJHQoJ19jb21tb24ud2FybmluZycpXCIgY2xhc3M9XCJ0ZXh0LXNtXCI+XHJcbiAgICAgICAgICB7eyAkdCgncGluLndhcm5pbmdfbXNnJykgfX1cclxuICAgICAgICA8L24tYWxlcnQ+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9uLWNhcmQ+XHJcblxyXG4gICAgPCEtLSBFeGlzdGluZyBDbGllbnRzIC0tPlxyXG4gICAgPG4tY2FyZCBjbGFzcz1cIm1iLThcIiA6c2VnbWVudGVkPVwieyBjb250ZW50OiB0cnVlLCBmb290ZXI6IHRydWUgfVwiPlxyXG4gICAgICA8dGVtcGxhdGUgI2hlYWRlcj5cclxuICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWxnIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdXNlcnNcIiA6c2l6ZT1cIjE4XCIgLz4ge3sgJHQoJ2NsaWVudHMuZXhpc3RpbmdfdGl0bGUnKSB9fVxyXG4gICAgICAgIDwvaDI+XHJcbiAgICAgIDwvdGVtcGxhdGU+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMyBtZDpmbGV4LXJvdyBtZDppdGVtcy1jZW50ZXJcIj5cclxuICAgICAgICA8cCBjbGFzcz1cInRleHQtc20gb3BhY2l0eS03NSBtZDpmbGV4LTFcIj57eyAkdCgndHJvdWJsZXNob290aW5nLnVucGFpcl9kZXNjJykgfX08L3A+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPnt7ICR0KCdjbGllbnRzLnNvcnRfbGFiZWwnKSB9fTwvc3Bhbj5cclxuICAgICAgICAgIDxuLXNlbGVjdFxyXG4gICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY2xpZW50U29ydE1vZGVcIlxyXG4gICAgICAgICAgICA6b3B0aW9ucz1cImNsaWVudFNvcnRPcHRpb25zXCJcclxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJtaW4tdy1bMTYwcHhdXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICBjbGFzcz1cIm1kOm1sLWF1dG9cIlxyXG4gICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgOmRpc2FibGVkPVwidW5wYWlyQWxsUHJlc3NlZCB8fCBjbGllbnRzLmxlbmd0aCA9PT0gMFwiXHJcbiAgICAgICAgICBAY2xpY2s9XCJhc2tDb25maXJtVW5wYWlyQWxsXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdXNlci1zbGFzaFwiIDpzaXplPVwiMTZcIiAvPlxyXG4gICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy51bnBhaXJfYWxsJykgfX1cclxuICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxuLWFsZXJ0IHYtaWY9XCJ1bnBhaXJBbGxTdGF0dXMgPT09IHRydWVcIiB0eXBlPVwic3VjY2Vzc1wiIGNsYXNzPVwibXQtM1wiPnt7XHJcbiAgICAgICAgJHQoJ3Ryb3VibGVzaG9vdGluZy51bnBhaXJfYWxsX3N1Y2Nlc3MnKVxyXG4gICAgICB9fTwvbi1hbGVydD5cclxuICAgICAgPG4tYWxlcnQgdi1pZj1cInVucGFpckFsbFN0YXR1cyA9PT0gZmFsc2VcIiB0eXBlPVwiZXJyb3JcIiBjbGFzcz1cIm10LTNcIj57e1xyXG4gICAgICAgICR0KCd0cm91Ymxlc2hvb3RpbmcudW5wYWlyX2FsbF9lcnJvcicpXHJcbiAgICAgIH19PC9uLWFsZXJ0PlxyXG5cclxuICAgICAgPGRpdiB2LWlmPVwiY2xpZW50cy5sZW5ndGggPiAwXCIgY2xhc3M9XCJtdC00IHNwYWNlLXktNFwiPlxyXG4gICAgICAgIDxkaXZcclxuICAgICAgICAgIHYtZm9yPVwiY2xpZW50IGluIHNvcnRlZENsaWVudHNcIlxyXG4gICAgICAgICAgOmtleT1cImNsaWVudC51dWlkXCJcclxuICAgICAgICAgIGNsYXNzPVwicm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1kYXJrL1swLjA2XSBiZy1saWdodC9bMC4wMl0gcC00IHNoYWRvdy1zbSBkYXJrOmJvcmRlci1saWdodC9bMC4xMl1cIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtZnVsbCBweC0zIHB5LTEgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtd2hpdGVcIlxyXG4gICAgICAgICAgICAgIDpjbGFzcz1cImNsaWVudC5wZXJtID49IGhpZ2hsaWdodFBlcm1pc3Npb25UaHJlc2hvbGQgPyAnYmctcmVkLTUwMCcgOiAnYmctYnJhbmQnXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFsge3sgcGVybVRvU3RyKGNsaWVudC5wZXJtKSB9fSBdXHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1tZWRpdW1cIj5cclxuICAgICAgICAgICAgICB7eyBjbGllbnQubmFtZSAhPT0gJycgPyBjbGllbnQubmFtZSA6ICR0KCd0cm91Ymxlc2hvb3RpbmcudW5wYWlyX3NpbmdsZV91bmtub3duJykgfX1cclxuICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICA8bi10YWcgdi1pZj1cImNsaWVudC5jb25uZWN0ZWRcIiB0eXBlPVwid2FybmluZ1wiIHNpemU9XCJzbWFsbFwiPnt7XHJcbiAgICAgICAgICAgICAgJHQoJ2NsaWVudHMuY29ubmVjdGVkJylcclxuICAgICAgICAgICAgfX08L24tdGFnPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtYXV0byBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgdi1pZj1cImNsaWVudC5jb25uZWN0ZWRcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cIm1lZGl1bVwiXHJcbiAgICAgICAgICAgICAgICB0eXBlPVwid2FybmluZ1wiXHJcbiAgICAgICAgICAgICAgICBxdWF0ZXJuYXJ5XHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cIm1pbi13LTExIG1pbi1oLTExXCJcclxuICAgICAgICAgICAgICAgIDpkaXNhYmxlZD1cImRpc2Nvbm5lY3RpbmdbY2xpZW50LnV1aWRdID09PSB0cnVlXCJcclxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJEaXNjb25uZWN0IGNsaWVudFwiXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJkaXNjb25uZWN0Q2xpZW50KGNsaWVudClcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1saW5rLXNsYXNoXCIgOnNpemU9XCIxOFwiIC8+XHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICAgIHYtaWY9XCJjbGllbnQuZWRpdGluZ1wiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwibWVkaXVtXCJcclxuICAgICAgICAgICAgICAgIHR5cGU9XCJzdWNjZXNzXCJcclxuICAgICAgICAgICAgICAgIHF1YXRlcm5hcnlcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWluLXctMTEgbWluLWgtMTFcIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwic2F2aW5nW2NsaWVudC51dWlkXSA9PT0gdHJ1ZSB8fCAhaXNDbGllbnREaXNwbGF5T3ZlcnJpZGVWYWxpZFwiXHJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2F2ZSBjaGFuZ2VzXCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cInNhdmVDbGllbnQoY2xpZW50KVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWNoZWNrXCIgOnNpemU9XCIxOFwiIC8+XHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICAgIHYtaWY9XCJjbGllbnQuZWRpdGluZ1wiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwibWVkaXVtXCJcclxuICAgICAgICAgICAgICAgIHF1YXRlcm5hcnlcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWluLXctMTEgbWluLWgtMTFcIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwic2F2aW5nW2NsaWVudC51dWlkXSA9PT0gdHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiQ2FuY2VsIGVkaXRpbmdcIlxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiY2FuY2VsRWRpdChjbGllbnQpXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdGltZXNcIiA6c2l6ZT1cIjE4XCIgLz5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgdi1pZj1cIiFjbGllbnQuZWRpdGluZ1wiXHJcbiAgICAgICAgICAgICAgICBzaXplPVwibWVkaXVtXCJcclxuICAgICAgICAgICAgICAgIHF1YXRlcm5hcnlcclxuICAgICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwibWluLXctMTEgbWluLWgtMTFcIlxyXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIkVkaXQgY2xpZW50XCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cImVkaXRDbGllbnQoY2xpZW50KVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWVkaXRcIiA6c2l6ZT1cIjE4XCIgLz5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cIm1lZGl1bVwiXHJcbiAgICAgICAgICAgICAgICBxdWF0ZXJuYXJ5XHJcbiAgICAgICAgICAgICAgICB0eXBlPVwiZXJyb3JcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJtaW4tdy0xMSBtaW4taC0xMVwiXHJcbiAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJyZW1vdmluZ1tjbGllbnQudXVpZF0gPT09IHRydWVcIlxyXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlVucGFpciBjbGllbnRcIlxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiYXNrQ29uZmlybVVucGFpcihjbGllbnQpXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdHJhc2hcIiA6c2l6ZT1cIjE4XCIgLz5cclxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiB2LWlmPVwiY2xpZW50Lmxhc3RTZWVuXCIgY2xhc3M9XCJtdC0xIHRleHQteHMgb3BhY2l0eS02MFwiPnt7IGxhc3RTZWVuTGFiZWwoY2xpZW50KSB9fTwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgdi1pZj1cImNsaWVudC5lZGl0aW5nXCIgY2xhc3M9XCJtdC00XCI+XHJcbiAgICAgICAgICAgIDxuLWZvcm0gbGFiZWwtcGxhY2VtZW50PVwidG9wXCIgY2xhc3M9XCJzcGFjZS15LTRcIiBAc3VibWl0LnByZXZlbnQ+XHJcbiAgICAgICAgICAgICAgPG4tZm9ybS1pdGVtIDpsYWJlbD1cIiR0KCdwaW4uZGV2aWNlX25hbWUnKVwiPlxyXG4gICAgICAgICAgICAgICAgPG4taW5wdXQgdi1tb2RlbDp2YWx1ZT1cImNsaWVudC5lZGl0TmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgPC9uLWZvcm0taXRlbT5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktM1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ2FwLTQgbWQ6Z3JpZC1jb2xzLTNcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIHYtZm9yPVwiZ3JvdXAgaW4gcGVybWlzc2lvbkdyb3Vwc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgOmtleT1cImdyb3VwLmlkXCJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInNwYWNlLXktMlwiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7eyAkdChncm91cC5sYWJlbEtleSkgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXdyYXAgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWZvcj1cInBlcm0gaW4gZ3JvdXAucGVybWlzc2lvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwicGVybS5rZXlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6dHlwZT1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VwcHJlc3NlZChjbGllbnQuZWRpdFBlcm0sIHBlcm0ua2V5LCBwZXJtLnN1cHByZXNzZWRCeSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja1Blcm1pc3Npb24oY2xpZW50LmVkaXRQZXJtLCBwZXJtLmtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3ByaW1hcnknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdkZWZhdWx0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6Z2hvc3Q9XCIhY2hlY2tQZXJtaXNzaW9uKGNsaWVudC5lZGl0UGVybSwgcGVybS5rZXkpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiaXNTdXBwcmVzc2VkKGNsaWVudC5lZGl0UGVybSwgcGVybS5rZXksIHBlcm0uc3VwcHJlc3NlZEJ5KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInRvZ2dsZVBlcm1pc3Npb24oY2xpZW50LCBwZXJtLmtleSlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyAkdChgcGVybWlzc2lvbnMuJHtwZXJtLmtleX1gKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPG4tZm9ybS1pdGVtIDpsYWJlbD1cIiR0KCdwaW4uZGlzcGxheV9tb2RlX292ZXJyaWRlJylcIj5cclxuICAgICAgICAgICAgICAgIDxuLWlucHV0IHYtbW9kZWw6dmFsdWU9XCJjbGllbnQuZWRpdERpc3BsYXlNb2RlXCIgcGxhY2Vob2xkZXI9XCIxOTIweDEwODB4NjBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPHRlbXBsYXRlICNmZWVkYmFjaz5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj57eyAkdCgncGluLmRpc3BsYXlfbW9kZV9vdmVycmlkZV9kZXNjJykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgIDwvbi1mb3JtLWl0ZW0+XHJcblxyXG4gICAgICAgICAgICAgIDxuLWZvcm0taXRlbT5cclxuICAgICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtbW9kZWw6Y2hlY2tlZD1cImNsaWVudC5lZGl0QWxsb3dDbGllbnRDb21tYW5kc1wiIHNpemU9XCJzbWFsbFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkFsbG93IENsaWVudCBDb21tYW5kczwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS04MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgQWxsb3cgdGhpcyBjbGllbnQgdG8gcnVuIGNvbm5lY3QgYW5kIGRpc2Nvbm5lY3QgY29tbWFuZHMuXHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgICA8L24tZm9ybS1pdGVtPlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJjbGllbnQuZWRpdEFsbG93Q2xpZW50Q29tbWFuZHNcIiBjbGFzcz1cInNwYWNlLXktNFwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cInNwYWNlLXktMyByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy1saWdodC82MCBkYXJrOmJnLWRhcmsvNDAgcC00XCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgQ29ubmVjdCBDb21tYW5kc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvbiBzaXplPVwidGlueVwiIHRlcnRpYXJ5IEBjbGljaz1cImFkZENsaWVudENvbW1hbmQoY2xpZW50LmVkaXREb0NvbW1hbmRzKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdXNcIiA6c2l6ZT1cIjE0XCIgLz4ge3sgJHQoJ19jb21tb24uYWRkJykgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWlmPVwiY2xpZW50LmVkaXREb0NvbW1hbmRzLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgTm8gY29tbWFuZHMgY29uZmlndXJlZC5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCIoY29tbWFuZCwgaW5kZXgpIGluIGNsaWVudC5lZGl0RG9Db21tYW5kc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwiYGRvLSR7Y2xpZW50LnV1aWR9LSR7aW5kZXh9YFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHAtM1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ2FwLTMgbWQ6Z3JpZC1jb2xzLVsxZnJfYXV0b19hdXRvXVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bi1pbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtbW9kZWw6dmFsdWU9XCJjb21tYW5kLmNtZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb250LW1vbm9cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cIiR0KCdfY29tbW9uLmNtZCcpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG4tY2hlY2tib3ggdi1pZj1cImlzV2luZG93c1wiIHYtbW9kZWw6Y2hlY2tlZD1cImNvbW1hbmQuZWxldmF0ZWRcIiBzaXplPVwic21hbGxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7eyAkdCgnX2NvbW1vbi5lbGV2YXRlZCcpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbi1jaGVja2JveD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiZXJyb3JcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljaz1cInJlbW92ZUNsaWVudENvbW1hbmQoY2xpZW50LmVkaXREb0NvbW1hbmRzLCBpbmRleClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRyYXNoXCIgOnNpemU9XCIxOFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwic3BhY2UteS0zIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLWxpZ2h0LzYwIGRhcms6YmctZGFyay80MCBwLTRcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICBEaXNjb25uZWN0IENvbW1hbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJ0aW55XCIgdGVydGlhcnkgQGNsaWNrPVwiYWRkQ2xpZW50Q29tbWFuZChjbGllbnQuZWRpdFVuZG9Db21tYW5kcylcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1wbHVzXCIgOnNpemU9XCIxNFwiIC8+IHt7ICR0KCdfY29tbW9uLmFkZCcpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1pZj1cImNsaWVudC5lZGl0VW5kb0NvbW1hbmRzLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgTm8gY29tbWFuZHMgY29uZmlndXJlZC5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCIoY29tbWFuZCwgaW5kZXgpIGluIGNsaWVudC5lZGl0VW5kb0NvbW1hbmRzXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDprZXk9XCJgdW5kby0ke2NsaWVudC51dWlkfS0ke2luZGV4fWBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLW1kIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBwLTNcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdhcC0zIG1kOmdyaWQtY29scy1bMWZyX2F1dG9fYXV0b11cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG4taW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY29tbWFuZC5jbWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZm9udC1tb25vXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCIkdCgnX2NvbW1vbi5jbWQnKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWNoZWNrYm94IHYtaWY9XCJpc1dpbmRvd3NcIiB2LW1vZGVsOmNoZWNrZWQ9XCJjb21tYW5kLmVsZXZhdGVkXCIgc2l6ZT1cInNtYWxsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3sgJHQoJ19jb21tb24uZWxldmF0ZWQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L24tY2hlY2tib3g+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVycm9yXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJyZW1vdmVDbGllbnRDb21tYW5kKGNsaWVudC5lZGl0VW5kb0NvbW1hbmRzLCBpbmRleClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRyYXNoXCIgOnNpemU9XCIxOFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwiaXNXaW5kb3dzXCIgY2xhc3M9XCJzcGFjZS15LTNcIj5cclxuICAgICAgICAgICAgICAgIDxuLWNoZWNrYm94XHJcbiAgICAgICAgICAgICAgICAgIHYtbW9kZWw6Y2hlY2tlZD1cImNsaWVudC5lZGl0RGlzcGxheU92ZXJyaWRlRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgIEB1cGRhdGU6Y2hlY2tlZD1cIih2KSA9PiBhcHBseUNsaWVudERpc3BsYXlPdmVycmlkZUVuYWJsZWQoY2xpZW50LCB2KVwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgdCgnY29uZmlnLmNsaWVudF9kaXNwbGF5X292ZXJyaWRlX2xhYmVsJykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktODBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5jbGllbnRfZGlzcGxheV9vdmVycmlkZV9oaW50JykgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9uLWNoZWNrYm94PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgdi1pZj1cImNsaWVudC5lZGl0RGlzcGxheU92ZXJyaWRlRW5hYmxlZFwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwic3BhY2UteS01IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLWxpZ2h0LzYwIGRhcms6YmctZGFyay80MCBwLTRcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuY2xpZW50X2Rpc3BsYXlfb3ZlcnJpZGVfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuY2xpZW50X2Rpc3BsYXlfb3ZlcnJpZGVfaGludCcpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bi1yYWRpby1ncm91cFxyXG4gICAgICAgICAgICAgICAgICAgICAgOnZhbHVlPVwiY2xpZW50LmVkaXREaXNwbGF5U2VsZWN0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHYpID0+IGFwcGx5Q2xpZW50RGlzcGxheVNlbGVjdGlvbihjbGllbnQsIHYgYXMgQ2xpZW50RGlzcGxheVNlbGVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImdyaWQgZ2FwLTMgc206Z3JpZC1jb2xzLTJcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLXJhZGlvIHZhbHVlPVwidmlydHVhbFwiIGNsYXNzPVwiYXBwLXJhZGlvLWNhcmQgY3Vyc29yLXBvaW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhcHAtcmFkaW8tY2FyZC10aXRsZVwiPnt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdCgnY29uZmlnLmFwcF9kaXNwbGF5X292ZXJyaWRlX3ZpcnR1YWwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbi1yYWRpbz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLXJhZGlvIHZhbHVlPVwicGh5c2ljYWxcIiBjbGFzcz1cImFwcC1yYWRpby1jYXJkIGN1cnNvci1wb2ludGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYXBwLXJhZGlvLWNhcmQtdGl0bGVcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9vdmVycmlkZV9waHlzaWNhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLXJhZGlvPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbi1yYWRpby1ncm91cD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJjbGllbnQuZWRpdERpc3BsYXlTZWxlY3Rpb24gPT09ICdwaHlzaWNhbCdcIiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLmFwcF9kaXNwbGF5X3BoeXNpY2FsX2xhYmVsJykgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlcnRpYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwiZGlzcGxheURldmljZXNMb2FkaW5nXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwibG9hZERpc3BsYXlEZXZpY2VzXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3sgdCgnX2NvbW1vbi5yZWZyZXNoJykgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5hcHBfZGlzcGxheV9waHlzaWNhbF9oaW50JykgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwiY2xpZW50LmVkaXRQaHlzaWNhbE91dHB1dE92ZXJyaWRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwiZGlzcGxheURldmljZU9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgOmxvYWRpbmc9XCJkaXNwbGF5RGV2aWNlc0xvYWRpbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwidCgnY29uZmlnLmFwcF9kaXNwbGF5X3BoeXNpY2FsX3BsYWNlaG9sZGVyJylcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICA6ZmFsbGJhY2stb3B0aW9uPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2YWx1ZSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdmFsdWUgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHZhbHVlIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdmFsdWUgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6cmVuZGVyLWxhYmVsPVwicmVuZGVyRGlzcGxheURldmljZUxhYmVsXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDpyZW5kZXItb3B0aW9uPVwicmVuZGVyRGlzcGxheURldmljZU9wdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBAZm9jdXM9XCJlbnN1cmVEaXNwbGF5RGV2aWNlc0xvYWRlZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiZGlzcGxheURldmljZXNFcnJvclwiIGNsYXNzPVwidGV4dC1yZWQtNTAwXCI+e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheURldmljZXNFcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWVsc2U+e3sgdCgnY29uZmlnLmFwcF9kaXNwbGF5X3BoeXNpY2FsX3N0YXR1c19oaW50JykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9XCJzcGFjZS15LTVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIG9wYWNpdHktNzBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbW9kZV9zdGVwX2hpbnQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG4tcmFkaW8tZ3JvdXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJncmlkIGdhcC0zIHNtOmdyaWQtY29scy0yXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG4tcmFkaW9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2LWZvcj1cIm9wdGlvbiBpbiB2aXJ0dWFsRGlzcGxheU1vZGVPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwiU3RyaW5nKG9wdGlvbi52YWx1ZSlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDp2YWx1ZT1cIm9wdGlvbi52YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJhcHAtcmFkaW8tY2FyZCBjdXJzb3ItcG9pbnRlclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFwcC1yYWRpby1jYXJkLXRpdGxlXCI+e3sgb3B0aW9uLmxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L24tcmFkaW8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L24tcmFkaW8tZ3JvdXA+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9XCJjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9PT0gJ2dsb2JhbCdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7IHQoJ2NvbmZpZy5hcHBfdmlydHVhbF9kaXNwbGF5X21vZGVfZm9sbG93X2dsb2JhbCcpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBvcGFjaXR5LTcwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9sYXlvdXRfbGFiZWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9XCJjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ICE9PSBudWxsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwidGlueVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVydGlhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2s9XCJjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gbnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcuYXBwX3ZpcnR1YWxfZGlzcGxheV9sYXlvdXRfcmVzZXQnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7eyB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF9oaW50JykgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgIDxuLXJhZGlvLWdyb3VwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDp2YWx1ZT1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlMYXlvdXQgPz9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxWaXJ0dWFsRGlzcGxheUxheW91dCA/P1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdleGNsdXNpdmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAodikgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9PT0gZ2xvYmFsVmlydHVhbERpc3BsYXlMYXlvdXQgPyBudWxsIDogKHYgYXMgYW55KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJzcGFjZS15LTRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCJvcHRpb24gaW4gdmlydHVhbERpc3BsYXlMYXlvdXRPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwib3B0aW9uLnZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZsZXggZmxleC1jb2wgY3Vyc29yLXBvaW50ZXIgcHktMiBweC0yIHJvdW5kZWQtbWQgaG92ZXI6Ymctc3VyZmFjZS8xMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnZhbHVlID09PSBnbG9iYWxWaXJ0dWFsRGlzcGxheUxheW91dCA/IG51bGwgOiBvcHRpb24udmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBrZXlkb3duLmVudGVyLnByZXZlbnQ9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlMYXlvdXQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24udmFsdWUgPT09IGdsb2JhbFZpcnR1YWxEaXNwbGF5TGF5b3V0ID8gbnVsbCA6IG9wdGlvbi52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGtleWRvd24uc3BhY2UucHJldmVudD1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50LmVkaXRWaXJ0dWFsRGlzcGxheUxheW91dCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi52YWx1ZSA9PT0gZ2xvYmFsVmlydHVhbERpc3BsYXlMYXlvdXQgPyBudWxsIDogb3B0aW9uLnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJpbmRleD1cIjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bi1yYWRpbyA6dmFsdWU9XCJvcHRpb24udmFsdWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIj57eyBvcHRpb24ubGFiZWwgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1zbnVnIG1sLTZcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IHQoYGNvbmZpZy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0XyR7b3B0aW9uLnZhbHVlfV9kZXNjYCkgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9uLXJhZGlvLWdyb3VwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWlmPVwiY2xpZW50LmVkaXRWaXJ0dWFsRGlzcGxheUxheW91dCA9PT0gbnVsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLmFwcF92aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0X2ZvbGxvd19nbG9iYWwnKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIDxuLWZvcm0taXRlbSB2LWlmPVwiaXNXaW5kb3dzXCIgOmxhYmVsPVwidCgnY2xpZW50cy5oZHJfcHJvZmlsZV9sYWJlbCcpXCI+XHJcbiAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNsaWVudC5lZGl0SGRyUHJvZmlsZVwiXHJcbiAgICAgICAgICAgICAgICAgIDpvcHRpb25zPVwiaGRyUHJvZmlsZU9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICA6bG9hZGluZz1cImhkclByb2ZpbGVzTG9hZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cInQoJ2NsaWVudHMuaGRyX3Byb2ZpbGVfcGxhY2Vob2xkZXInKVwiXHJcbiAgICAgICAgICAgICAgICAgIGZpbHRlcmFibGVcclxuICAgICAgICAgICAgICAgICAgY2xlYXJhYmxlXHJcbiAgICAgICAgICAgICAgICAgIEBmb2N1cz1cImVuc3VyZUhkclByb2ZpbGVzTG9hZGVkXCJcclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8dGVtcGxhdGUgI2ZlZWRiYWNrPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MFwiPnt7IHQoJ2NsaWVudHMuaGRyX3Byb2ZpbGVfZGVzYycpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiaGRyUHJvZmlsZXNFcnJvclwiIGNsYXNzPVwidGV4dC14cyB0ZXh0LXJlZC01MDAgYmxvY2tcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgIGhkclByb2ZpbGVzRXJyb3JcclxuICAgICAgICAgICAgICAgICAgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICAgICAgICAgIDwvbi1mb3JtLWl0ZW0+XHJcblxyXG4gICAgICAgICAgICAgIDxuLWZvcm0taXRlbSA6bGFiZWw9XCJ0KCdjb25maWcucHJlZmVyXzEwYml0X3NkcicpXCI+XHJcbiAgICAgICAgICAgICAgICA8bi1zZWxlY3RcclxuICAgICAgICAgICAgICAgICAgdi1tb2RlbDp2YWx1ZT1cImNsaWVudC5lZGl0UHJlZmVyMTBCaXRTZHJcIlxyXG4gICAgICAgICAgICAgICAgICA6b3B0aW9ucz1cInByZWZlcjEwQml0U2RyT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAgIGNsZWFyYWJsZVxyXG4gICAgICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCJ0KCdjb25maWcucHJlZmVyXzEwYml0X3Nkcl9mb2xsb3dfZ2xvYmFsJylcIlxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSAjZmVlZGJhY2s+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwXCI+e3sgdCgnY29uZmlnLnByZWZlcl8xMGJpdF9zZHJfZGVzYycpIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiY2xpZW50LmVkaXRQcmVmZXIxMEJpdFNkciA9PT0gbnVsbFwiIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGJsb2NrXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3sgdCgnY29uZmlnLnByZWZlcl8xMGJpdF9zZHJfZm9sbG93X2dsb2JhbCcpIH19XHJcbiAgICAgICAgICAgICAgICAgICAgKHt7IGdsb2JhbFByZWZlcjEwQml0U2RyID8gdCgnX2NvbW1vbi5lbmFibGVkJykgOiB0KCdfY29tbW9uLmRpc2FibGVkJykgfX0pXHJcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgPC9uLWZvcm0taXRlbT5cclxuXHJcbiAgICAgICAgICAgICAgPEFwcEVkaXRDb25maWdPdmVycmlkZXNTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOm92ZXJyaWRlcz1cImNsaWVudC5lZGl0Q29uZmlnT3ZlcnJpZGVzXCJcclxuICAgICAgICAgICAgICAgIHNjb3BlLWxhYmVsPVwiY2xpZW50XCJcclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L24tZm9ybT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtNCBweC04IHB5LTE0IHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInJvdW5kZWQtMnhsIGJnLWJyYW5kLzggZGFyazpiZy1icmFuZC8xMiBwLTUgbWItMVwiPlxyXG4gICAgICAgICAgPHN2ZyBjbGFzcz1cInctMTAgaC0xMCB0ZXh0LWJyYW5kIG9wYWNpdHktNzBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBhcmlhLWhpZGRlbj5cclxuICAgICAgICAgICAgPHJlY3QgeD1cIjJcIiB5PVwiNlwiIHdpZHRoPVwiMTBcIiBoZWlnaHQ9XCI4XCIgcng9XCIyXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIvPlxyXG4gICAgICAgICAgICA8cmVjdCB4PVwiMTRcIiB5PVwiM1wiIHdpZHRoPVwiOFwiIGhlaWdodD1cIjZcIiByeD1cIjJcIiBzdHJva2Utd2lkdGg9XCIxLjVcIi8+XHJcbiAgICAgICAgICAgIDxyZWN0IHg9XCIxNFwiIHk9XCIxNFwiIHdpZHRoPVwiOFwiIGhlaWdodD1cIjZcIiByeD1cIjJcIiBzdHJva2Utd2lkdGg9XCIxLjVcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgMTBoMk0xMiAxN2gyXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiLz5cclxuICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTEuNSBtYXgtdy14c1wiPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPk5vIHBhaXJlZCBjbGllbnRzPC9wPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBvcGFjaXR5LTYwXCI+XHJcbiAgICAgICAgICAgIFBhaXIgeW91ciBmaXJzdCBkZXZpY2UgdXNpbmcgYSBQSU4gZnJvbSB0aGUgU3Vuc2hpbmUgYXBwIG9yIGEgTW9vbmxpZ2h0LWNvbXBhdGlibGUgY2xpZW50LlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvbi1jYXJkPlxyXG5cclxuICAgIDxUcnVzdGVkRGV2aWNlc0NhcmQgLz5cclxuICAgIDxBcGlUb2tlbk1hbmFnZXIgLz5cclxuXHJcbiAgICA8IS0tIENvbmZpcm0gcmVtb3ZlIHNpbmdsZSBjbGllbnQgLS0+XHJcbiAgICA8bi1tb2RhbCA6c2hvdz1cInNob3dDb25maXJtUmVtb3ZlXCIgQHVwZGF0ZTpzaG93PVwiKHYpID0+IChzaG93Q29uZmlybVJlbW92ZSA9IHYpXCI+XHJcbiAgICAgIDxuLWNhcmRcclxuICAgICAgICA6dGl0bGU9XCJcclxuICAgICAgICAgICR0KCdjbGllbnRzLmNvbmZpcm1fcmVtb3ZlX3RpdGxlX25hbWVkJywge1xyXG4gICAgICAgICAgICBuYW1lOiBwZW5kaW5nUmVtb3ZlTmFtZSB8fCAkdCgndHJvdWJsZXNob290aW5nLnVucGFpcl9zaW5nbGVfdW5rbm93bicpLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICBcIlxyXG4gICAgICAgIHN0eWxlPVwibWF4LXdpZHRoOiAzMnJlbTsgd2lkdGg6IDEwMCVcIlxyXG4gICAgICAgIDpib3JkZXJlZD1cImZhbHNlXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNtIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICB7e1xyXG4gICAgICAgICAgICAkdCgnY2xpZW50cy5jb25maXJtX3JlbW92ZV9tZXNzYWdlX25hbWVkJywge1xyXG4gICAgICAgICAgICAgIG5hbWU6IHBlbmRpbmdSZW1vdmVOYW1lIHx8ICR0KCd0cm91Ymxlc2hvb3RpbmcudW5wYWlyX3NpbmdsZV91bmtub3duJyksXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDx0ZW1wbGF0ZSAjZm9vdGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgganVzdGlmeS1lbmQgZ2FwLTJcIj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIEBjbGljaz1cInNob3dDb25maXJtUmVtb3ZlID0gZmFsc2VcIj57eyAkdCgnX2NvbW1vbi5jYW5jZWwnKSB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwiZXJyb3JcIiBzZWNvbmRhcnkgQGNsaWNrPVwiY29uZmlybVJlbW92ZVwiPnt7XHJcbiAgICAgICAgICAgICAgJHQoJ2NsaWVudHMucmVtb3ZlJylcclxuICAgICAgICAgICAgfX08L24tYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgPC9uLWNhcmQ+XHJcbiAgICA8L24tbW9kYWw+XHJcblxyXG4gICAgPCEtLSBDb25maXJtIHVucGFpciBhbGwgLS0+XHJcbiAgICA8bi1tb2RhbCA6c2hvdz1cInNob3dDb25maXJtVW5wYWlyQWxsXCIgQHVwZGF0ZTpzaG93PVwiKHYpID0+IChzaG93Q29uZmlybVVucGFpckFsbCA9IHYpXCI+XHJcbiAgICAgIDxuLWNhcmRcclxuICAgICAgICA6dGl0bGU9XCIkdCgnY2xpZW50cy5jb25maXJtX3VucGFpcl9hbGxfdGl0bGUnKVwiXHJcbiAgICAgICAgc3R5bGU9XCJtYXgtd2lkdGg6IDMycmVtOyB3aWR0aDogMTAwJVwiXHJcbiAgICAgICAgOmJvcmRlcmVkPVwiZmFsc2VcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtc20gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICR0KCdjbGllbnRzLmNvbmZpcm1fdW5wYWlyX2FsbF9tZXNzYWdlX2NvdW50Jywge1xyXG4gICAgICAgICAgICAgIGNvdW50OiBjbGllbnRzLmxlbmd0aCxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPHRlbXBsYXRlICNmb290ZXI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBqdXN0aWZ5LWVuZCBnYXAtMlwiPlxyXG4gICAgICAgICAgICA8bi1idXR0b24gQGNsaWNrPVwic2hvd0NvbmZpcm1VbnBhaXJBbGwgPSBmYWxzZVwiPnt7ICR0KCdfY29tbW9uLmNhbmNlbCcpIH19PC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIHNlY29uZGFyeSBAY2xpY2s9XCJjb25maXJtVW5wYWlyQWxsXCI+e3tcclxuICAgICAgICAgICAgICAkdCgndHJvdWJsZXNob290aW5nLnVucGFpcl9hbGwnKVxyXG4gICAgICAgICAgICB9fTwvbi1idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L3RlbXBsYXRlPlxyXG4gICAgICA8L24tY2FyZD5cclxuICAgIDwvbi1tb2RhbD5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgc2V0dXAgbGFuZz1cInRzXCI+XHJcbmltcG9ydCB7IGNvbXB1dGVkLCBoLCBvbkJlZm9yZVVubW91bnQsIG9uTW91bnRlZCwgcmVmIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHR5cGUgeyBWTm9kZSwgVk5vZGVDaGlsZCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQge1xyXG4gIE5BbGVydCxcclxuICBOQnV0dG9uLFxyXG4gIE5DYXJkLFxyXG4gIE5DaGVja2JveCxcclxuICBORm9ybSxcclxuICBORm9ybUl0ZW0sXHJcbiAgTklucHV0LFxyXG4gIE5Nb2RhbCxcclxuICBOUmFkaW8sXHJcbiAgTlJhZGlvR3JvdXAsXHJcbiAgTlNlbGVjdCxcclxuICBOVGFnLFxyXG4gIHVzZU1lc3NhZ2UsXHJcbn0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VsZWN0R3JvdXBPcHRpb24gfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCBUcnVzdGVkRGV2aWNlc0NhcmQgZnJvbSAnQC9jb21wb25lbnRzL1RydXN0ZWREZXZpY2VzQ2FyZC52dWUnO1xyXG5pbXBvcnQgQXBwRWRpdENvbmZpZ092ZXJyaWRlc1NlY3Rpb24gZnJvbSAnQC9jb21wb25lbnRzL2FwcC1lZGl0L0FwcEVkaXRDb25maWdPdmVycmlkZXNTZWN0aW9uLnZ1ZSc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2F1dGgnO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcblxyXG50eXBlIENsaWVudERpc3BsYXlTZWxlY3Rpb24gPSAncGh5c2ljYWwnIHwgJ3ZpcnR1YWwnO1xyXG50eXBlIENsaWVudFZpcnR1YWxEaXNwbGF5TW9kZSA9ICdkaXNhYmxlZCcgfCAncGVyX2NsaWVudCcgfCAnc2hhcmVkJyB8ICdnbG9iYWwnIHwgbnVsbDtcclxudHlwZSBDbGllbnRWaXJ0dWFsRGlzcGxheUxheW91dCA9XHJcbiAgfCAnZXhjbHVzaXZlJ1xyXG4gIHwgJ2V4dGVuZGVkJ1xyXG4gIHwgJ2V4dGVuZGVkX3ByaW1hcnknXHJcbiAgfCAnZXh0ZW5kZWRfaXNvbGF0ZWQnXHJcbiAgfCAnZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCdcclxuICB8IG51bGw7XHJcbnR5cGUgQ2xpZW50UHJlZmVyMTBCaXRTZHJPdmVycmlkZSA9ICdlbmFibGVkJyB8ICdkaXNhYmxlZCcgfCBudWxsO1xyXG50eXBlIENsaWVudFNvcnRNb2RlID0gJ3JlY2VudCcgfCAnbmFtZSc7XHJcblxyXG50eXBlIFBlcm1pc3Npb25Ub2dnbGVLZXkgPVxyXG4gIHwgJ2xpc3QnXHJcbiAgfCAndmlldydcclxuICB8ICdsYXVuY2gnXHJcbiAgfCAnY2xpcGJvYXJkX3NldCdcclxuICB8ICdjbGlwYm9hcmRfcmVhZCdcclxuICB8ICdzZXJ2ZXJfY21kJ1xyXG4gIHwgJ2lucHV0X2NvbnRyb2xsZXInXHJcbiAgfCAnaW5wdXRfdG91Y2gnXHJcbiAgfCAnaW5wdXRfcGVuJ1xyXG4gIHwgJ2lucHV0X21vdXNlJ1xyXG4gIHwgJ2lucHV0X2tiZCc7XHJcblxyXG5pbnRlcmZhY2UgUGVybWlzc2lvbkdyb3VwIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGxhYmVsS2V5OiBzdHJpbmc7XHJcbiAgcGVybWlzc2lvbnM6IEFycmF5PHsga2V5OiBQZXJtaXNzaW9uVG9nZ2xlS2V5OyBzdXBwcmVzc2VkQnk6IFBlcm1pc3Npb25Ub2dnbGVLZXlbXSB9PjtcclxufVxyXG5cclxuY29uc3QgcGVybWlzc2lvbk1hcHBpbmcgPSB7XHJcbiAgaW5wdXRfY29udHJvbGxlcjogMHgwMDAwMDEwMCxcclxuICBpbnB1dF90b3VjaDogMHgwMDAwMDIwMCxcclxuICBpbnB1dF9wZW46IDB4MDAwMDA0MDAsXHJcbiAgaW5wdXRfbW91c2U6IDB4MDAwMDA4MDAsXHJcbiAgaW5wdXRfa2JkOiAweDAwMDAxMDAwLFxyXG4gIF9hbGxfaW5wdXRzOiAweDAwMDAxZjAwLFxyXG4gIGNsaXBib2FyZF9zZXQ6IDB4MDAwMTAwMDAsXHJcbiAgY2xpcGJvYXJkX3JlYWQ6IDB4MDAwMjAwMDAsXHJcbiAgZmlsZV91cGxvYWQ6IDB4MDAwNDAwMDAsXHJcbiAgZmlsZV9kd25sb2FkOiAweDAwMDgwMDAwLFxyXG4gIHNlcnZlcl9jbWQ6IDB4MDAxMDAwMDAsXHJcbiAgX2FsbF9vcGVyYXRpb25zOiAweDAwMWYwMDAwLFxyXG4gIGxpc3Q6IDB4MDEwMDAwMDAsXHJcbiAgdmlldzogMHgwMjAwMDAwMCxcclxuICBsYXVuY2g6IDB4MDQwMDAwMDAsXHJcbiAgX2FsbG93X3ZpZXc6IDB4MDYwMDAwMDAsXHJcbiAgX2FsbF9hY3Rpb25zOiAweDA3MDAwMDAwLFxyXG4gIF9kZWZhdWx0OiAweDAzMDAwMDAwLFxyXG4gIF9ubzogMHgwMDAwMDAwMCxcclxuICBfYWxsOiAweDA3MWYxZjAwLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuY29uc3QgcGVybWlzc2lvbkdyb3VwczogUGVybWlzc2lvbkdyb3VwW10gPSBbXHJcbiAge1xyXG4gICAgaWQ6ICdhY3Rpb25zJyxcclxuICAgIGxhYmVsS2V5OiAncGVybWlzc2lvbnMuZ3JvdXBfYWN0aW9uJyxcclxuICAgIHBlcm1pc3Npb25zOiBbXHJcbiAgICAgIHsga2V5OiAnbGlzdCcsIHN1cHByZXNzZWRCeTogWyd2aWV3JywgJ2xhdW5jaCddIH0sXHJcbiAgICAgIHsga2V5OiAndmlldycsIHN1cHByZXNzZWRCeTogWydsYXVuY2gnXSB9LFxyXG4gICAgICB7IGtleTogJ2xhdW5jaCcsIHN1cHByZXNzZWRCeTogW10gfSxcclxuICAgIF0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ29wZXJhdGlvbnMnLFxyXG4gICAgbGFiZWxLZXk6ICdwZXJtaXNzaW9ucy5ncm91cF9vcGVyYXRpb24nLFxyXG4gICAgcGVybWlzc2lvbnM6IFtcclxuICAgICAgeyBrZXk6ICdjbGlwYm9hcmRfc2V0Jywgc3VwcHJlc3NlZEJ5OiBbXSB9LFxyXG4gICAgICB7IGtleTogJ2NsaXBib2FyZF9yZWFkJywgc3VwcHJlc3NlZEJ5OiBbXSB9LFxyXG4gICAgICB7IGtleTogJ3NlcnZlcl9jbWQnLCBzdXBwcmVzc2VkQnk6IFtdIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdpbnB1dHMnLFxyXG4gICAgbGFiZWxLZXk6ICdwZXJtaXNzaW9ucy5ncm91cF9pbnB1dCcsXHJcbiAgICBwZXJtaXNzaW9uczogW1xyXG4gICAgICB7IGtleTogJ2lucHV0X2NvbnRyb2xsZXInLCBzdXBwcmVzc2VkQnk6IFtdIH0sXHJcbiAgICAgIHsga2V5OiAnaW5wdXRfdG91Y2gnLCBzdXBwcmVzc2VkQnk6IFtdIH0sXHJcbiAgICAgIHsga2V5OiAnaW5wdXRfcGVuJywgc3VwcHJlc3NlZEJ5OiBbXSB9LFxyXG4gICAgICB7IGtleTogJ2lucHV0X21vdXNlJywgc3VwcHJlc3NlZEJ5OiBbXSB9LFxyXG4gICAgICB7IGtleTogJ2lucHV0X2tiZCcsIHN1cHByZXNzZWRCeTogW10gfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXTtcclxuXHJcbmNvbnN0IGhpZ2hsaWdodFBlcm1pc3Npb25UaHJlc2hvbGQgPSAweDA0MDAwMDAwO1xyXG5cclxuaW50ZXJmYWNlIENsaWVudEFwaUVudHJ5IHtcclxuICB1dWlkPzogc3RyaW5nO1xyXG4gIG5hbWU/OiBzdHJpbmc7XHJcbiAgY29ubmVjdGVkPzogYm9vbGVhbjtcclxuICBsYXN0X3NlZW4/OiBudW1iZXIgfCBzdHJpbmcgfCBudWxsO1xyXG4gIHBlcm0/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgaGRyX3Byb2ZpbGU/OiBzdHJpbmc7XHJcbiAgZGlzcGxheV9tb2RlPzogc3RyaW5nO1xyXG4gIG91dHB1dF9uYW1lX292ZXJyaWRlPzogc3RyaW5nO1xyXG4gIGFsd2F5c191c2VfdmlydHVhbF9kaXNwbGF5PzogYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlcjtcclxuICB2aXJ0dWFsX2Rpc3BsYXlfbW9kZT86IHN0cmluZztcclxuICB2aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0Pzogc3RyaW5nO1xyXG4gIHByZWZlcl8xMGJpdF9zZHI/OiBib29sZWFuIHwgc3RyaW5nIHwgbnVtYmVyIHwgbnVsbDtcclxuICBjb25maWdfb3ZlcnJpZGVzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xyXG4gIGFsbG93X2NsaWVudF9jb21tYW5kcz86IGJvb2xlYW4gfCBzdHJpbmcgfCBudW1iZXI7XHJcbiAgZG8/OiB1bmtub3duO1xyXG4gIHVuZG8/OiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2xpZW50c0xpc3RSZXNwb25zZSB7XHJcbiAgc3RhdHVzOiBib29sZWFuO1xyXG4gIG5hbWVkX2NlcnRzOiBDbGllbnRBcGlFbnRyeVtdO1xyXG4gIHBsYXRmb3JtPzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSGRyUHJvZmlsZUVudHJ5IHtcclxuICBmaWxlbmFtZT86IHN0cmluZztcclxuICBhZGRlZF9tcz86IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEhkclByb2ZpbGVzUmVzcG9uc2Uge1xyXG4gIHN0YXR1cz86IGJvb2xlYW47XHJcbiAgcHJvZmlsZXM/OiBIZHJQcm9maWxlRW50cnlbXTtcclxuICBlcnJvcj86IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIENsaWVudFZpZXdNb2RlbCB7XHJcbiAgdXVpZDogc3RyaW5nO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBjb25uZWN0ZWQ6IGJvb2xlYW47XHJcbiAgbGFzdFNlZW46IG51bWJlciB8IG51bGw7XHJcbiAgcGVybTogbnVtYmVyO1xyXG4gIGhkclByb2ZpbGU6IHN0cmluZztcclxuICBkaXNwbGF5TW9kZTogc3RyaW5nO1xyXG4gIG91dHB1dE92ZXJyaWRlOiBzdHJpbmc7XHJcbiAgYWx3YXlzVXNlVmlydHVhbERpc3BsYXk6IGJvb2xlYW47XHJcbiAgcHJlZmVyMTBCaXRTZHI6IENsaWVudFByZWZlcjEwQml0U2RyT3ZlcnJpZGU7XHJcbiAgdmlydHVhbERpc3BsYXlNb2RlOiBDbGllbnRWaXJ0dWFsRGlzcGxheU1vZGU7XHJcbiAgdmlydHVhbERpc3BsYXlMYXlvdXQ6IENsaWVudFZpcnR1YWxEaXNwbGF5TGF5b3V0O1xyXG4gIGNvbmZpZ092ZXJyaWRlczogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgYWxsb3dDbGllbnRDb21tYW5kczogYm9vbGVhbjtcclxuICBkb0NvbW1hbmRzOiBDbGllbnRDb21tYW5kRW50cnlbXTtcclxuICB1bmRvQ29tbWFuZHM6IENsaWVudENvbW1hbmRFbnRyeVtdO1xyXG5cclxuICBlZGl0aW5nOiBib29sZWFuO1xyXG4gIGVkaXRIZHJQcm9maWxlOiBzdHJpbmcgfCBudWxsO1xyXG4gIGVkaXROYW1lOiBzdHJpbmc7XHJcbiAgZWRpdERpc3BsYXlNb2RlOiBzdHJpbmc7XHJcbiAgZWRpdFBlcm06IG51bWJlcjtcclxuICBlZGl0RGlzcGxheU92ZXJyaWRlRW5hYmxlZDogYm9vbGVhbjtcclxuICBlZGl0RGlzcGxheVNlbGVjdGlvbjogQ2xpZW50RGlzcGxheVNlbGVjdGlvbjtcclxuICBlZGl0UGh5c2ljYWxPdXRwdXRPdmVycmlkZTogc3RyaW5nIHwgbnVsbDtcclxuICBlZGl0VmlydHVhbERpc3BsYXlNb2RlOiBDbGllbnRWaXJ0dWFsRGlzcGxheU1vZGU7XHJcbiAgZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0OiBDbGllbnRWaXJ0dWFsRGlzcGxheUxheW91dDtcclxuICBlZGl0UHJlZmVyMTBCaXRTZHI6IENsaWVudFByZWZlcjEwQml0U2RyT3ZlcnJpZGU7XHJcbiAgZWRpdENvbmZpZ092ZXJyaWRlczogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgZWRpdEFsbG93Q2xpZW50Q29tbWFuZHM6IGJvb2xlYW47XHJcbiAgZWRpdERvQ29tbWFuZHM6IENsaWVudENvbW1hbmRFbnRyeVtdO1xyXG4gIGVkaXRVbmRvQ29tbWFuZHM6IENsaWVudENvbW1hbmRFbnRyeVtdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2xpZW50Q29tbWFuZEVudHJ5IHtcclxuICBjbWQ6IHN0cmluZztcclxuICBlbGV2YXRlZDogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIERpc3BsYXlEZXZpY2Uge1xyXG4gIGRldmljZV9pZD86IHN0cmluZztcclxuICBkaXNwbGF5X25hbWU/OiBzdHJpbmc7XHJcbiAgZnJpZW5kbHlfbmFtZT86IHN0cmluZztcclxuICBpbmZvPzogdW5rbm93bjtcclxufVxyXG5cclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcbmNvbnN0IG1lc3NhZ2UgPSB1c2VNZXNzYWdlKCk7XHJcbmNvbnN0IGNvbmZpZ1N0b3JlID0gdXNlQ29uZmlnU3RvcmUoKTtcclxuY29uc3QgZ2xvYmFsUHJlZmVyMTBCaXRTZHIgPSBjb21wdXRlZDxib29sZWFuPigoKSA9PlxyXG4gIHRvQm9vbCgoY29uZmlnU3RvcmUuY29uZmlnIGFzIGFueSk/LnByZWZlcl8xMGJpdF9zZHIsIGZhbHNlKSxcclxuKTtcclxuY29uc3QgcHJlZmVyMTBCaXRTZHJPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gW1xyXG4gIHsgbGFiZWw6IHQoJ19jb21tb24uZW5hYmxlZCcpLCB2YWx1ZTogJ2VuYWJsZWQnIH0sXHJcbiAgeyBsYWJlbDogdCgnX2NvbW1vbi5kaXNhYmxlZCcpLCB2YWx1ZTogJ2Rpc2FibGVkJyB9LFxyXG5dKTtcclxuXHJcbmNvbnN0IGNsaWVudHMgPSByZWY8Q2xpZW50Vmlld01vZGVsW10+KFtdKTtcclxuY29uc3QgcGxhdGZvcm0gPSByZWY8c3RyaW5nPignJyk7XHJcbmNvbnN0IGNsaWVudFNvcnRNb2RlID0gcmVmPENsaWVudFNvcnRNb2RlPigncmVjZW50Jyk7XHJcblxyXG5jb25zdCBwaW4gPSByZWY8c3RyaW5nPignJyk7XHJcbmNvbnN0IGRldmljZU5hbWUgPSByZWY8c3RyaW5nPignJyk7XHJcbmNvbnN0IHBhaXJpbmcgPSByZWY8Ym9vbGVhbj4oZmFsc2UpO1xyXG5jb25zdCBwYWlyU3RhdHVzID0gcmVmPGJvb2xlYW4gfCBudWxsPihudWxsKTtcclxuXHJcbmNvbnN0IHVucGFpckFsbFByZXNzZWQgPSByZWY8Ym9vbGVhbj4oZmFsc2UpO1xyXG5jb25zdCB1bnBhaXJBbGxTdGF0dXMgPSByZWY8Ym9vbGVhbiB8IG51bGw+KG51bGwpO1xyXG5jb25zdCByZW1vdmluZyA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBib29sZWFuPj4oe30pO1xyXG5jb25zdCBzYXZpbmcgPSByZWY8UmVjb3JkPHN0cmluZywgYm9vbGVhbj4+KHt9KTtcclxuY29uc3QgZGlzY29ubmVjdGluZyA9IHJlZjxSZWNvcmQ8c3RyaW5nLCBib29sZWFuPj4oe30pO1xyXG5sZXQgcmVmcmVzaEludGVydmFsSWQ6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5cclxuY29uc3Qgc2hvd0NvbmZpcm1SZW1vdmUgPSByZWY8Ym9vbGVhbj4oZmFsc2UpO1xyXG5jb25zdCBwZW5kaW5nUmVtb3ZlVXVpZCA9IHJlZjxzdHJpbmc+KCcnKTtcclxuY29uc3QgcGVuZGluZ1JlbW92ZU5hbWUgPSByZWY8c3RyaW5nPignJyk7XHJcbmNvbnN0IHNob3dDb25maXJtVW5wYWlyQWxsID0gcmVmPGJvb2xlYW4+KGZhbHNlKTtcclxuXHJcbmNvbnN0IGlzV2luZG93cyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBwID0gKHBsYXRmb3JtLnZhbHVlIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChwKSByZXR1cm4gcC5zdGFydHNXaXRoKCd3aW4nKSB8fCBwID09PSAnd2luZG93cyc7XHJcbiAgY29uc3QgbWV0YSA9IFN0cmluZygoY29uZmlnU3RvcmUubWV0YWRhdGEgYXMgYW55KT8ucGxhdGZvcm0gfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgcmV0dXJuIG1ldGEgPT09ICd3aW5kb3dzJyB8fCBtZXRhLnN0YXJ0c1dpdGgoJ3dpbicpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHRvQm9vbCh2YWx1ZTogdW5rbm93biwgZmFsbGJhY2sgPSBmYWxzZSk6IGJvb2xlYW4ge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykgcmV0dXJuIHZhbHVlO1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gdmFsdWUgIT09IDA7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIGNvbnN0IHYgPSB2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChbJzEnLCAndHJ1ZScsICd5ZXMnLCAnb24nLCAnZW5hYmxlZCddLmluY2x1ZGVzKHYpKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChbJzAnLCAnZmFsc2UnLCAnbm8nLCAnb2ZmJywgJ2Rpc2FibGVkJywgJyddLmluY2x1ZGVzKHYpKSByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxsYmFjaztcclxufVxyXG5cclxuZnVuY3Rpb24gcGVybVRvU3RyKHBlcm06IG51bWJlcik6IHN0cmluZyB7XHJcbiAgY29uc3Qgc2VnbWVudHMgPSBbXTtcclxuICBzZWdtZW50cy5wdXNoKChwZXJtID4+IDI0KSAmIDB4ZmYpO1xyXG4gIHNlZ21lbnRzLnB1c2goKHBlcm0gPj4gMTYpICYgMHhmZik7XHJcbiAgc2VnbWVudHMucHVzaCgocGVybSA+PiA4KSAmIDB4ZmYpO1xyXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHNlZykgPT4gc2VnLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJyAnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tQZXJtaXNzaW9uKHBlcm06IG51bWJlciwgcGVybWlzc2lvbjogUGVybWlzc2lvblRvZ2dsZUtleSk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiAocGVybSAmIHBlcm1pc3Npb25NYXBwaW5nW3Blcm1pc3Npb25dKSAhPT0gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNTdXBwcmVzc2VkKFxyXG4gIHBlcm06IG51bWJlcixcclxuICBwZXJtaXNzaW9uOiBQZXJtaXNzaW9uVG9nZ2xlS2V5LFxyXG4gIHN1cHByZXNzZWRCeTogUGVybWlzc2lvblRvZ2dsZUtleVtdLFxyXG4pOiBib29sZWFuIHtcclxuICByZXR1cm4gc3VwcHJlc3NlZEJ5LnNvbWUoKHN1cHByZXNzZWQpID0+IGNoZWNrUGVybWlzc2lvbihwZXJtLCBzdXBwcmVzc2VkKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvZ2dsZVBlcm1pc3Npb24oY2xpZW50OiBDbGllbnRWaWV3TW9kZWwsIHBlcm1pc3Npb246IFBlcm1pc3Npb25Ub2dnbGVLZXkpOiB2b2lkIHtcclxuICBjbGllbnQuZWRpdFBlcm0gXj0gcGVybWlzc2lvbk1hcHBpbmdbcGVybWlzc2lvbl07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlQ2xpZW50VmlydHVhbERpc3BsYXlNb2RlKHZhbHVlOiB1bmtub3duKTogQ2xpZW50VmlydHVhbERpc3BsYXlNb2RlIHtcclxuICBjb25zdCB2ID0gU3RyaW5nKHZhbHVlID8/ICcnKVxyXG4gICAgLnRyaW0oKVxyXG4gICAgLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKCF2KSByZXR1cm4gbnVsbDtcclxuICBpZiAodiA9PT0gJ2Rpc2FibGVkJyB8fCB2ID09PSAncGVyX2NsaWVudCcgfHwgdiA9PT0gJ3NoYXJlZCcgfHwgdiA9PT0gJ2dsb2JhbCcpXHJcbiAgICByZXR1cm4gdiBhcyBDbGllbnRWaXJ0dWFsRGlzcGxheU1vZGU7XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlQ2xpZW50VmlydHVhbERpc3BsYXlMYXlvdXQodmFsdWU6IHVua25vd24pOiBDbGllbnRWaXJ0dWFsRGlzcGxheUxheW91dCB7XHJcbiAgY29uc3QgdiA9IFN0cmluZyh2YWx1ZSA/PyAnJylcclxuICAgIC50cmltKClcclxuICAgIC50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmICghdikgcmV0dXJuIG51bGw7XHJcbiAgaWYgKFxyXG4gICAgdiA9PT0gJ2V4Y2x1c2l2ZScgfHxcclxuICAgIHYgPT09ICdleHRlbmRlZCcgfHxcclxuICAgIHYgPT09ICdleHRlbmRlZF9wcmltYXJ5JyB8fFxyXG4gICAgdiA9PT0gJ2V4dGVuZGVkX2lzb2xhdGVkJyB8fFxyXG4gICAgdiA9PT0gJ2V4dGVuZGVkX3ByaW1hcnlfaXNvbGF0ZWQnXHJcbiAgKVxyXG4gICAgcmV0dXJuIHYgYXMgQ2xpZW50VmlydHVhbERpc3BsYXlMYXlvdXQ7XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlTGFzdFNlZW4odmFsdWU6IHVua25vd24pOiBudW1iZXIgfCBudWxsIHtcclxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIHZhbHVlO1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBjb25zdCBuID0gTnVtYmVyKHZhbHVlKTtcclxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobikgJiYgbiA+IDApIHJldHVybiBuO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplQ2xpZW50Q29tbWFuZEVudHJ5KHZhbHVlOiB1bmtub3duKTogQ2xpZW50Q29tbWFuZEVudHJ5IHwgbnVsbCB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHJldHVybiB7IGNtZDogdmFsdWUsIGVsZXZhdGVkOiBmYWxzZSB9O1xyXG4gIH1cclxuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsO1xyXG4gIGNvbnN0IG9iaiA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gIGNvbnN0IGNtZCA9IFN0cmluZyhvYmpbJ2NtZCddID8/ICcnKS50cmltKCk7XHJcbiAgaWYgKCFjbWQpIHJldHVybiBudWxsO1xyXG4gIHJldHVybiB7XHJcbiAgICBjbWQsXHJcbiAgICBlbGV2YXRlZDogdG9Cb29sKG9ialsnZWxldmF0ZWQnXSwgZmFsc2UpLFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaWVudENvbW1hbmRMaXN0KHZhbHVlOiB1bmtub3duKTogQ2xpZW50Q29tbWFuZEVudHJ5W10ge1xyXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiBbXTtcclxuICByZXR1cm4gdmFsdWVcclxuICAgIC5tYXAoKGVudHJ5KSA9PiBub3JtYWxpemVDbGllbnRDb21tYW5kRW50cnkoZW50cnkpKVxyXG4gICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBDbGllbnRDb21tYW5kRW50cnkgPT4gISFlbnRyeSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNsaWVudFZpZXdNb2RlbChlbnRyeTogQ2xpZW50QXBpRW50cnkpOiBDbGllbnRWaWV3TW9kZWwge1xyXG4gIGNvbnN0IG5hbWUgPSBlbnRyeS5uYW1lID8/ICcnO1xyXG4gIGNvbnN0IGRpc3BsYXlNb2RlID0gZW50cnkuZGlzcGxheV9tb2RlID8/ICcnO1xyXG4gIGNvbnN0IG91dHB1dE92ZXJyaWRlID0gZW50cnkub3V0cHV0X25hbWVfb3ZlcnJpZGUgPz8gJyc7XHJcbiAgY29uc3QgYWx3YXlzVmlydHVhbCA9IHRvQm9vbChlbnRyeS5hbHdheXNfdXNlX3ZpcnR1YWxfZGlzcGxheSwgZmFsc2UpO1xyXG4gIGNvbnN0IGhkclByb2ZpbGUgPSBTdHJpbmcoZW50cnkuaGRyX3Byb2ZpbGUgPz8gJycpLnRyaW0oKTtcclxuICBjb25zdCBsYXN0U2VlbiA9IHBhcnNlTGFzdFNlZW4oZW50cnkubGFzdF9zZWVuKTtcclxuICBjb25zdCBwZXJtID1cclxuICAgIHR5cGVvZiBlbnRyeS5wZXJtID09PSAnbnVtYmVyJ1xyXG4gICAgICA/IGVudHJ5LnBlcm1cclxuICAgICAgOiBOdW1iZXIucGFyc2VJbnQoU3RyaW5nKGVudHJ5LnBlcm0gPz8gJzAnKSwgMTApIHx8IDA7XHJcbiAgY29uc3QgY29uZmlnT3ZlcnJpZGVzID1cclxuICAgIGVudHJ5LmNvbmZpZ19vdmVycmlkZXMgJiZcclxuICAgIHR5cGVvZiBlbnRyeS5jb25maWdfb3ZlcnJpZGVzID09PSAnb2JqZWN0JyAmJlxyXG4gICAgIUFycmF5LmlzQXJyYXkoZW50cnkuY29uZmlnX292ZXJyaWRlcylcclxuICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVudHJ5LmNvbmZpZ19vdmVycmlkZXMpKVxyXG4gICAgICA6IHt9O1xyXG4gIGNvbnN0IHByZWZlcjEwOiBDbGllbnRQcmVmZXIxMEJpdFNkck92ZXJyaWRlID1cclxuICAgIGVudHJ5LnByZWZlcl8xMGJpdF9zZHIgPT09IHVuZGVmaW5lZCB8fCBlbnRyeS5wcmVmZXJfMTBiaXRfc2RyID09PSBudWxsXHJcbiAgICAgID8gbnVsbFxyXG4gICAgICA6IHRvQm9vbChlbnRyeS5wcmVmZXJfMTBiaXRfc2RyLCBmYWxzZSlcclxuICAgICAgICA/ICdlbmFibGVkJ1xyXG4gICAgICAgIDogJ2Rpc2FibGVkJztcclxuICBjb25zdCB2aXJ0dWFsTW9kZSA9IHBhcnNlQ2xpZW50VmlydHVhbERpc3BsYXlNb2RlKGVudHJ5LnZpcnR1YWxfZGlzcGxheV9tb2RlID8/ICcnKTtcclxuICBjb25zdCB2aXJ0dWFsTGF5b3V0ID0gcGFyc2VDbGllbnRWaXJ0dWFsRGlzcGxheUxheW91dChlbnRyeS52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0ID8/ICcnKTtcclxuICBjb25zdCBhbGxvd0NsaWVudENvbW1hbmRzID0gdG9Cb29sKGVudHJ5LmFsbG93X2NsaWVudF9jb21tYW5kcywgdHJ1ZSk7XHJcbiAgY29uc3QgZG9Db21tYW5kcyA9IG5vcm1hbGl6ZUNsaWVudENvbW1hbmRMaXN0KGVudHJ5LmRvKTtcclxuICBjb25zdCB1bmRvQ29tbWFuZHMgPSBub3JtYWxpemVDbGllbnRDb21tYW5kTGlzdChlbnRyeS51bmRvKTtcclxuICBjb25zdCBvdmVycmlkZUVuYWJsZWQgPVxyXG4gICAgYWx3YXlzVmlydHVhbCB8fCAhIW91dHB1dE92ZXJyaWRlLnRyaW0oKSB8fCB2aXJ0dWFsTW9kZSAhPT0gbnVsbCB8fCB2aXJ0dWFsTGF5b3V0ICE9PSBudWxsO1xyXG4gIGNvbnN0IHNlbGVjdGlvbjogQ2xpZW50RGlzcGxheVNlbGVjdGlvbiA9XHJcbiAgICBhbHdheXNWaXJ0dWFsIHx8ICh2aXJ0dWFsTW9kZSAhPT0gbnVsbCAmJiB2aXJ0dWFsTW9kZSAhPT0gJ2Rpc2FibGVkJykgPyAndmlydHVhbCcgOiAncGh5c2ljYWwnO1xyXG4gIGNvbnN0IGNsaWVudDogQ2xpZW50Vmlld01vZGVsID0ge1xyXG4gICAgdXVpZDogZW50cnkudXVpZCA/PyAnJyxcclxuICAgIG5hbWUsXHJcbiAgICBjb25uZWN0ZWQ6ICEhZW50cnkuY29ubmVjdGVkLFxyXG4gICAgbGFzdFNlZW4sXHJcbiAgICBwZXJtLFxyXG4gICAgaGRyUHJvZmlsZSxcclxuICAgIGRpc3BsYXlNb2RlLFxyXG4gICAgb3V0cHV0T3ZlcnJpZGUsXHJcbiAgICBhbHdheXNVc2VWaXJ0dWFsRGlzcGxheTogYWx3YXlzVmlydHVhbCxcclxuICAgIHByZWZlcjEwQml0U2RyOiBwcmVmZXIxMCxcclxuICAgIHZpcnR1YWxEaXNwbGF5TW9kZTogdmlydHVhbE1vZGUsXHJcbiAgICB2aXJ0dWFsRGlzcGxheUxheW91dDogdmlydHVhbExheW91dCxcclxuICAgIGNvbmZpZ092ZXJyaWRlcyxcclxuICAgIGFsbG93Q2xpZW50Q29tbWFuZHMsXHJcbiAgICBkb0NvbW1hbmRzLFxyXG4gICAgdW5kb0NvbW1hbmRzLFxyXG4gICAgZWRpdGluZzogZmFsc2UsXHJcbiAgICBlZGl0SGRyUHJvZmlsZTogaGRyUHJvZmlsZSB8fCBudWxsLFxyXG4gICAgZWRpdE5hbWU6IG5hbWUsXHJcbiAgICBlZGl0RGlzcGxheU1vZGU6IGRpc3BsYXlNb2RlLFxyXG4gICAgZWRpdFBlcm06IHBlcm0sXHJcbiAgICBlZGl0RGlzcGxheU92ZXJyaWRlRW5hYmxlZDogb3ZlcnJpZGVFbmFibGVkLFxyXG4gICAgZWRpdERpc3BsYXlTZWxlY3Rpb246IHNlbGVjdGlvbixcclxuICAgIGVkaXRQaHlzaWNhbE91dHB1dE92ZXJyaWRlOiBvdXRwdXRPdmVycmlkZSB8fCBudWxsLFxyXG4gICAgZWRpdFZpcnR1YWxEaXNwbGF5TW9kZTogdmlydHVhbE1vZGUsXHJcbiAgICBlZGl0VmlydHVhbERpc3BsYXlMYXlvdXQ6IHZpcnR1YWxMYXlvdXQsXHJcbiAgICBlZGl0UHJlZmVyMTBCaXRTZHI6IHByZWZlcjEwLFxyXG4gICAgZWRpdENvbmZpZ092ZXJyaWRlczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25maWdPdmVycmlkZXMpKSxcclxuICAgIGVkaXRBbGxvd0NsaWVudENvbW1hbmRzOiBhbGxvd0NsaWVudENvbW1hbmRzLFxyXG4gICAgZWRpdERvQ29tbWFuZHM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZG9Db21tYW5kcykpLFxyXG4gICAgZWRpdFVuZG9Db21tYW5kczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh1bmRvQ29tbWFuZHMpKSxcclxuICB9O1xyXG5cclxuICBpZiAoY2xpZW50LmVkaXREaXNwbGF5T3ZlcnJpZGVFbmFibGVkKSB7XHJcbiAgICBhcHBseUNsaWVudERpc3BsYXlTZWxlY3Rpb24oY2xpZW50LCBjbGllbnQuZWRpdERpc3BsYXlTZWxlY3Rpb24pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNsaWVudDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRDbGllbnRFZGl0cyhjbGllbnQ6IENsaWVudFZpZXdNb2RlbCk6IHZvaWQge1xyXG4gIGNsaWVudC5lZGl0TmFtZSA9IGNsaWVudC5uYW1lO1xyXG4gIGNsaWVudC5lZGl0SGRyUHJvZmlsZSA9IChjbGllbnQuaGRyUHJvZmlsZSB8fCAnJykudHJpbSgpIHx8IG51bGw7XHJcbiAgY2xpZW50LmVkaXREaXNwbGF5TW9kZSA9IGNsaWVudC5kaXNwbGF5TW9kZTtcclxuICBjbGllbnQuZWRpdFBlcm0gPSBjbGllbnQucGVybTtcclxuICBjbGllbnQuZWRpdERpc3BsYXlPdmVycmlkZUVuYWJsZWQgPVxyXG4gICAgY2xpZW50LmFsd2F5c1VzZVZpcnR1YWxEaXNwbGF5IHx8XHJcbiAgICAhIShjbGllbnQub3V0cHV0T3ZlcnJpZGUgfHwgJycpLnRyaW0oKSB8fFxyXG4gICAgY2xpZW50LnZpcnR1YWxEaXNwbGF5TW9kZSAhPT0gbnVsbCB8fFxyXG4gICAgY2xpZW50LnZpcnR1YWxEaXNwbGF5TGF5b3V0ICE9PSBudWxsO1xyXG4gIGNsaWVudC5lZGl0RGlzcGxheVNlbGVjdGlvbiA9XHJcbiAgICBjbGllbnQuYWx3YXlzVXNlVmlydHVhbERpc3BsYXkgfHxcclxuICAgIChjbGllbnQudmlydHVhbERpc3BsYXlNb2RlICE9PSBudWxsICYmIGNsaWVudC52aXJ0dWFsRGlzcGxheU1vZGUgIT09ICdkaXNhYmxlZCcpXHJcbiAgICAgID8gJ3ZpcnR1YWwnXHJcbiAgICAgIDogJ3BoeXNpY2FsJztcclxuICBjbGllbnQuZWRpdFBoeXNpY2FsT3V0cHV0T3ZlcnJpZGUgPSBjbGllbnQub3V0cHV0T3ZlcnJpZGUgfHwgbnVsbDtcclxuICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9IGNsaWVudC52aXJ0dWFsRGlzcGxheU1vZGU7XHJcbiAgY2xpZW50LmVkaXRWaXJ0dWFsRGlzcGxheUxheW91dCA9IGNsaWVudC52aXJ0dWFsRGlzcGxheUxheW91dDtcclxuICBjbGllbnQuZWRpdFByZWZlcjEwQml0U2RyID0gY2xpZW50LnByZWZlcjEwQml0U2RyO1xyXG4gIGNsaWVudC5lZGl0Q29uZmlnT3ZlcnJpZGVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjbGllbnQuY29uZmlnT3ZlcnJpZGVzIHx8IHt9KSk7XHJcbiAgY2xpZW50LmVkaXRBbGxvd0NsaWVudENvbW1hbmRzID0gY2xpZW50LmFsbG93Q2xpZW50Q29tbWFuZHM7XHJcbiAgY2xpZW50LmVkaXREb0NvbW1hbmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjbGllbnQuZG9Db21tYW5kcyB8fCBbXSkpO1xyXG4gIGNsaWVudC5lZGl0VW5kb0NvbW1hbmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjbGllbnQudW5kb0NvbW1hbmRzIHx8IFtdKSk7XHJcblxyXG4gIGlmIChjbGllbnQuZWRpdERpc3BsYXlPdmVycmlkZUVuYWJsZWQpIHtcclxuICAgIGFwcGx5Q2xpZW50RGlzcGxheVNlbGVjdGlvbihjbGllbnQsIGNsaWVudC5lZGl0RGlzcGxheVNlbGVjdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRDbGllbnRDb21tYW5kKGNvbW1hbmRzOiBDbGllbnRDb21tYW5kRW50cnlbXSwgaW5kZXggPSAtMSk6IHZvaWQge1xyXG4gIGNvbnN0IG5leHQ6IENsaWVudENvbW1hbmRFbnRyeSA9IHtcclxuICAgIGNtZDogJycsXHJcbiAgICBlbGV2YXRlZDogZmFsc2UsXHJcbiAgfTtcclxuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IGNvbW1hbmRzLmxlbmd0aCkge1xyXG4gICAgY29tbWFuZHMucHVzaChuZXh0KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY29tbWFuZHMuc3BsaWNlKGluZGV4ICsgMSwgMCwgbmV4dCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUNsaWVudENvbW1hbmQoY29tbWFuZHM6IENsaWVudENvbW1hbmRFbnRyeVtdLCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBjb21tYW5kcy5sZW5ndGgpIHJldHVybjtcclxuICBjb21tYW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59XHJcblxyXG5jb25zdCB2aXJ0dWFsRGlzcGxheU1vZGVPcHRpb25zID0gY29tcHV0ZWQoKCkgPT4gW1xyXG4gIHsgbGFiZWw6IHQoJ2NvbmZpZy5hcHBfdmlydHVhbF9kaXNwbGF5X21vZGVfZm9sbG93X2dsb2JhbCcpLCB2YWx1ZTogJ2dsb2JhbCcgfSxcclxuICB7IGxhYmVsOiB0KCdjb25maWcudmlydHVhbF9kaXNwbGF5X21vZGVfcGVyX2NsaWVudCcpLCB2YWx1ZTogJ3Blcl9jbGllbnQnIH0sXHJcbiAgeyBsYWJlbDogdCgnY29uZmlnLnZpcnR1YWxfZGlzcGxheV9tb2RlX3NoYXJlZCcpLCB2YWx1ZTogJ3NoYXJlZCcgfSxcclxuXSk7XHJcblxyXG5jb25zdCBnbG9iYWxWaXJ0dWFsRGlzcGxheUxheW91dCA9IGNvbXB1dGVkPENsaWVudFZpcnR1YWxEaXNwbGF5TGF5b3V0PigoKSA9PlxyXG4gIHBhcnNlQ2xpZW50VmlydHVhbERpc3BsYXlMYXlvdXQoKGNvbmZpZ1N0b3JlLmNvbmZpZyBhcyBhbnkpPy52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0KSxcclxuKTtcclxuXHJcbmNvbnN0IHZpcnR1YWxEaXNwbGF5TGF5b3V0T3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCB2YWx1ZXM6IEFycmF5PEV4Y2x1ZGU8Q2xpZW50VmlydHVhbERpc3BsYXlMYXlvdXQsIG51bGw+PiA9IFtcclxuICAgICdleGNsdXNpdmUnLFxyXG4gICAgJ2V4dGVuZGVkJyxcclxuICAgICdleHRlbmRlZF9wcmltYXJ5JyxcclxuICAgICdleHRlbmRlZF9pc29sYXRlZCcsXHJcbiAgICAnZXh0ZW5kZWRfcHJpbWFyeV9pc29sYXRlZCcsXHJcbiAgXTtcclxuICByZXR1cm4gdmFsdWVzLm1hcCgodmFsdWUpID0+ICh7IGxhYmVsOiB0KGBjb25maWcudmlydHVhbF9kaXNwbGF5X2xheW91dF8ke3ZhbHVlfWApLCB2YWx1ZSB9KSk7XHJcbn0pO1xyXG5cclxuLy8gUmVuZGVyIGhlbHBlcnMgZm9yIGRpc3BsYXktZGV2aWNlIE5TZWxlY3QgKGF2b2lkcyB1bnR5cGVkICNvcHRpb24vI3ZhbHVlIHRlbXBsYXRlIHNsb3RzKVxyXG50eXBlIERpc3BsYXlEZXZpY2VPcHRpb24gPSBTZWxlY3RPcHRpb24gJiB7IGRpc3BsYXlOYW1lPzogc3RyaW5nOyBpZD86IHN0cmluZzsgYWN0aXZlPzogYm9vbGVhbiB8IG51bGwgfTtcclxuXHJcbmZ1bmN0aW9uIHJlbmRlckRpc3BsYXlEZXZpY2VMYWJlbChvcHRpb246IFNlbGVjdE9wdGlvbiB8IFNlbGVjdEdyb3VwT3B0aW9uKTogVk5vZGVDaGlsZCB7XHJcbiAgY29uc3Qgb3B0ID0gb3B0aW9uIGFzIERpc3BsYXlEZXZpY2VPcHRpb247XHJcbiAgcmV0dXJuIGgoJ2RpdicsIHsgY2xhc3M6ICdsZWFkaW5nLXRpZ2h0JyB9LCBbXHJcbiAgICBoKCdkaXYnLCB7fSwgU3RyaW5nKG9wdC5kaXNwbGF5TmFtZSB8fCBvcHQubGFiZWwgfHwgJycpKSxcclxuICAgIGgoJ2RpdicsIHsgY2xhc3M6ICd0ZXh0LXhzIG9wYWNpdHktNjAgZm9udC1tb25vJyB9LCBTdHJpbmcob3B0LmlkIHx8IG9wdC52YWx1ZSB8fCAnJykpLFxyXG4gIF0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJEaXNwbGF5RGV2aWNlT3B0aW9uKGluZm86IHtcclxuICBub2RlOiBWTm9kZTtcclxuICBvcHRpb246IFNlbGVjdE9wdGlvbiB8IFNlbGVjdEdyb3VwT3B0aW9uO1xyXG4gIHNlbGVjdGVkOiBib29sZWFuO1xyXG59KTogVk5vZGVDaGlsZCB7XHJcbiAgY29uc3Qgb3B0ID0gaW5mby5vcHRpb24gYXMgRGlzcGxheURldmljZU9wdGlvbjtcclxuICBjb25zdCBtZXRhQ2hpbGRyZW46IFZOb2RlQ2hpbGRbXSA9IFtTdHJpbmcob3B0LmlkIHx8IG9wdC52YWx1ZSB8fCAnJyldO1xyXG4gIGlmIChvcHQuYWN0aXZlID09PSB0cnVlKSB7XHJcbiAgICBtZXRhQ2hpbGRyZW4ucHVzaChoKCdzcGFuJywgeyBjbGFzczogJ21sLTEgdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCcgfSwgYCgke3QoJ2NvbmZpZy5hcHBfZGlzcGxheV9zdGF0dXNfYWN0aXZlJyl9KWApKTtcclxuICB9IGVsc2UgaWYgKG9wdC5hY3RpdmUgPT09IGZhbHNlKSB7XHJcbiAgICBtZXRhQ2hpbGRyZW4ucHVzaChoKCdzcGFuJywgeyBjbGFzczogJ21sLTEgb3BhY2l0eS03MCcgfSwgYCgke3QoJ2NvbmZpZy5hcHBfZGlzcGxheV9zdGF0dXNfaW5hY3RpdmUnKX0pYCkpO1xyXG4gIH1cclxuICByZXR1cm4gaCgnZGl2JywgeyBjbGFzczogJ2xlYWRpbmctdGlnaHQnIH0sIFtcclxuICAgIGgoJ2RpdicsIHt9LCBTdHJpbmcob3B0LmRpc3BsYXlOYW1lIHx8IG9wdC5sYWJlbCB8fCAnJykpLFxyXG4gICAgaCgnZGl2JywgeyBjbGFzczogJ3RleHQteHMgb3BhY2l0eS02MCBmb250LW1vbm8nIH0sIG1ldGFDaGlsZHJlbiksXHJcbiAgXSk7XHJcbn1cclxuXHJcbmNvbnN0IGhkclByb2ZpbGVzID0gcmVmPEhkclByb2ZpbGVFbnRyeVtdPihbXSk7XHJcbmNvbnN0IGhkclByb2ZpbGVzTG9hZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGhkclByb2ZpbGVzRXJyb3IgPSByZWYoJycpO1xyXG5cclxuY29uc3QgaGRyUHJvZmlsZU9wdGlvbnMgPSBjb21wdXRlZCgoKTogQXJyYXk8U2VsZWN0T3B0aW9uIHwgU2VsZWN0R3JvdXBPcHRpb24+ID0+IHtcclxuICBjb25zdCBsaXN0ID0gQXJyYXkuaXNBcnJheShoZHJQcm9maWxlcy52YWx1ZSkgPyBbLi4uaGRyUHJvZmlsZXMudmFsdWVdIDogW107XHJcbiAgbGlzdC5zb3J0KChhLCBiKSA9PiAoTnVtYmVyKGIuYWRkZWRfbXMgfHwgMCkgfHwgMCkgLSAoTnVtYmVyKGEuYWRkZWRfbXMgfHwgMCkgfHwgMCkpO1xyXG4gIGNvbnN0IG9wdGlvbnM6IEFycmF5PFNlbGVjdE9wdGlvbiB8IFNlbGVjdEdyb3VwT3B0aW9uPiA9IFtcclxuICAgIHsgbGFiZWw6IHQoJ2NsaWVudHMuaGRyX3Byb2ZpbGVfYXV0bycpLCB2YWx1ZTogbnVsbCBhcyB1bmtub3duIGFzIHN0cmluZyB9LFxyXG4gIF07XHJcbiAgZm9yIChjb25zdCBwIG9mIGxpc3QpIHtcclxuICAgIGNvbnN0IGZpbGVuYW1lID0gU3RyaW5nKHA/LmZpbGVuYW1lIHx8ICcnKS50cmltKCk7XHJcbiAgICBpZiAoIWZpbGVuYW1lKSBjb250aW51ZTtcclxuICAgIG9wdGlvbnMucHVzaCh7IGxhYmVsOiBmaWxlbmFtZSwgdmFsdWU6IGZpbGVuYW1lIH0pO1xyXG4gIH1cclxuICByZXR1cm4gb3B0aW9ucztcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkSGRyUHJvZmlsZXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICBoZHJQcm9maWxlc0xvYWRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIGhkclByb2ZpbGVzRXJyb3IudmFsdWUgPSAnJztcclxuICB0cnkge1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAuZ2V0PEhkclByb2ZpbGVzUmVzcG9uc2U+KCcuL2FwaS9jbGllbnRzL2hkci1wcm9maWxlcycsIHtcclxuICAgICAgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gci5kYXRhIHx8ICh7fSBhcyBIZHJQcm9maWxlc1Jlc3BvbnNlKTtcclxuICAgIGNvbnN0IG9rID1cclxuICAgICAgci5zdGF0dXMgPj0gMjAwICYmXHJcbiAgICAgIHIuc3RhdHVzIDwgMzAwICYmXHJcbiAgICAgIHJlc3BvbnNlLnN0YXR1cyA9PT0gdHJ1ZSAmJlxyXG4gICAgICBBcnJheS5pc0FycmF5KHJlc3BvbnNlLnByb2ZpbGVzKTtcclxuICAgIGlmICghb2spIHtcclxuICAgICAgaGRyUHJvZmlsZXMudmFsdWUgPSBbXTtcclxuICAgICAgaGRyUHJvZmlsZXNFcnJvci52YWx1ZSA9IHJlc3BvbnNlLmVycm9yIHx8IHQoJ2NsaWVudHMuaGRyX3Byb2ZpbGVfbG9hZF9mYWlsZWQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaGRyUHJvZmlsZXMudmFsdWUgPSByZXNwb25zZS5wcm9maWxlcyB8fCBbXTtcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIGhkclByb2ZpbGVzLnZhbHVlID0gW107XHJcbiAgICBoZHJQcm9maWxlc0Vycm9yLnZhbHVlID0gZT8ubWVzc2FnZSB8fCB0KCdjbGllbnRzLmhkcl9wcm9maWxlX2xvYWRfZmFpbGVkJyk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGhkclByb2ZpbGVzTG9hZGluZy52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZW5zdXJlSGRyUHJvZmlsZXNMb2FkZWQoKTogdm9pZCB7XHJcbiAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICBpZiAoIWhkclByb2ZpbGVzTG9hZGluZy52YWx1ZSAmJiBoZHJQcm9maWxlcy52YWx1ZS5sZW5ndGggPT09IDApIHtcclxuICAgIHZvaWQgbG9hZEhkclByb2ZpbGVzKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUNsaWVudERpc3BsYXlPdmVycmlkZUVuYWJsZWQoY2xpZW50OiBDbGllbnRWaWV3TW9kZWwsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICBjbGllbnQuZWRpdERpc3BsYXlPdmVycmlkZUVuYWJsZWQgPSBlbmFibGVkO1xyXG4gIGlmICghZW5hYmxlZCkge1xyXG4gICAgY2xpZW50LmVkaXREaXNwbGF5U2VsZWN0aW9uID0gJ3BoeXNpY2FsJztcclxuICAgIGNsaWVudC5lZGl0UGh5c2ljYWxPdXRwdXRPdmVycmlkZSA9IG51bGw7XHJcbiAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9IG51bGw7XHJcbiAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gbnVsbDtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGFwcGx5Q2xpZW50RGlzcGxheVNlbGVjdGlvbihjbGllbnQsIGNsaWVudC5lZGl0RGlzcGxheVNlbGVjdGlvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5Q2xpZW50RGlzcGxheVNlbGVjdGlvbihcclxuICBjbGllbnQ6IENsaWVudFZpZXdNb2RlbCxcclxuICBzZWxlY3Rpb246IENsaWVudERpc3BsYXlTZWxlY3Rpb24sXHJcbik6IHZvaWQge1xyXG4gIGNsaWVudC5lZGl0RGlzcGxheVNlbGVjdGlvbiA9IHNlbGVjdGlvbjtcclxuICBpZiAoc2VsZWN0aW9uID09PSAncGh5c2ljYWwnKSB7XHJcbiAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9ICdkaXNhYmxlZCc7XHJcbiAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TGF5b3V0ID0gbnVsbDtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNsaWVudC5lZGl0UGh5c2ljYWxPdXRwdXRPdmVycmlkZSA9IG51bGw7XHJcbiAgaWYgKGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlID09PSBudWxsIHx8IGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlID09PSAnZGlzYWJsZWQnKSB7XHJcbiAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9ICdnbG9iYWwnO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgaXNDbGllbnREaXNwbGF5T3ZlcnJpZGVWYWxpZCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBmb3IgKGNvbnN0IGNsaWVudCBvZiBjbGllbnRzLnZhbHVlKSB7XHJcbiAgICBpZiAoIWNsaWVudC5lZGl0aW5nKSBjb250aW51ZTtcclxuICAgIGlmICghY2xpZW50LmVkaXREaXNwbGF5T3ZlcnJpZGVFbmFibGVkKSBjb250aW51ZTtcclxuXHJcbiAgICBpZiAoY2xpZW50LmVkaXREaXNwbGF5U2VsZWN0aW9uID09PSAndmlydHVhbCcpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlICE9PSAnZ2xvYmFsJyAmJlxyXG4gICAgICAgIGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlICE9PSAncGVyX2NsaWVudCcgJiZcclxuICAgICAgICBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSAhPT0gJ3NoYXJlZCdcclxuICAgICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hDbGllbnRzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGF1dGggPSB1c2VBdXRoU3RvcmUoKTtcclxuICBpZiAoIWF1dGguaXNBdXRoZW50aWNhdGVkKSByZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldDxDbGllbnRzTGlzdFJlc3BvbnNlPignLi9hcGkvY2xpZW50cy9saXN0Jywge1xyXG4gICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSByLmRhdGEgfHwgKHt9IGFzIENsaWVudHNMaXN0UmVzcG9uc2UpO1xyXG4gICAgaWYgKHR5cGVvZiByZXNwb25zZS5wbGF0Zm9ybSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcGxhdGZvcm0udmFsdWUgPSByZXNwb25zZS5wbGF0Zm9ybTtcclxuICAgIH1cclxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IHRydWUgJiYgQXJyYXkuaXNBcnJheShyZXNwb25zZS5uYW1lZF9jZXJ0cykpIHtcclxuICAgICAgY29uc3QgcHJpb3IgPSBuZXcgTWFwKGNsaWVudHMudmFsdWUubWFwKChjbGllbnQpID0+IFtjbGllbnQudXVpZCwgY2xpZW50XSBhcyBjb25zdCkpO1xyXG4gICAgICBjb25zdCBtYXBwZWQgPSByZXNwb25zZS5uYW1lZF9jZXJ0cy5tYXAoKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdXVpZCA9IGVudHJ5LnV1aWQgPz8gJyc7XHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB1dWlkID8gcHJpb3IuZ2V0KHV1aWQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChleGlzdGluZz8uZWRpdGluZykge1xyXG4gICAgICAgICAgZXhpc3RpbmcuY29ubmVjdGVkID0gISFlbnRyeS5jb25uZWN0ZWQ7XHJcbiAgICAgICAgICBleGlzdGluZy5sYXN0U2VlbiA9IHBhcnNlTGFzdFNlZW4oZW50cnkubGFzdF9zZWVuKTtcclxuICAgICAgICAgIHJldHVybiBleGlzdGluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUNsaWVudFZpZXdNb2RlbChlbnRyeSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjbGllbnRzLnZhbHVlID0gbWFwcGVkO1xyXG4gICAgICBlbnN1cmVEaXNwbGF5RGV2aWNlc0xvYWRlZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2xpZW50cy52YWx1ZSA9IFtdO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgY2xpZW50cy52YWx1ZSA9IFtdO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgY2xpZW50U29ydE9wdGlvbnMgPSBjb21wdXRlZCgoKSA9PiBbXHJcbiAgeyBsYWJlbDogdCgnY2xpZW50cy5zb3J0X3JlY2VudCcpLCB2YWx1ZTogJ3JlY2VudCcgfSxcclxuICB7IGxhYmVsOiB0KCdjbGllbnRzLnNvcnRfbmFtZScpLCB2YWx1ZTogJ25hbWUnIH0sXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gY29tcGFyZUJ5TmFtZShhOiBDbGllbnRWaWV3TW9kZWwsIGI6IENsaWVudFZpZXdNb2RlbCk6IG51bWJlciB7XHJcbiAgY29uc3QgbmFtZUEgPSAoYS5uYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IG5hbWVCID0gKGIubmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICBpZiAobmFtZUEgPT09IG5hbWVCKSByZXR1cm4gYS51dWlkLmxvY2FsZUNvbXBhcmUoYi51dWlkKTtcclxuICBpZiAobmFtZUEgPT09ICcnKSByZXR1cm4gMTtcclxuICBpZiAobmFtZUIgPT09ICcnKSByZXR1cm4gLTE7XHJcbiAgcmV0dXJuIG5hbWVBLmxvY2FsZUNvbXBhcmUobmFtZUIpO1xyXG59XHJcblxyXG5jb25zdCBjbGllbnRUaW1lRm9ybWF0dGVyID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQodW5kZWZpbmVkLCB7XHJcbiAgZGF0ZVN0eWxlOiAnbWVkaXVtJyxcclxuICB0aW1lU3R5bGU6ICdzaG9ydCcsXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZm9ybWF0Q2xpZW50VGltZXN0YW1wKHNlY29uZHM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGNsaWVudFRpbWVGb3JtYXR0ZXIuZm9ybWF0KG5ldyBEYXRlKHNlY29uZHMgKiAxMDAwKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxhc3RTZWVuTGFiZWwoY2xpZW50OiBDbGllbnRWaWV3TW9kZWwpOiBzdHJpbmcge1xyXG4gIGlmICghY2xpZW50Lmxhc3RTZWVuIHx8ICFOdW1iZXIuaXNGaW5pdGUoY2xpZW50Lmxhc3RTZWVuKSkge1xyXG4gICAgcmV0dXJuIHQoJ2NsaWVudHMubGFzdF9zZWVuX3Vua25vd24nKTtcclxuICB9XHJcbiAgcmV0dXJuIHQoJ2NsaWVudHMubGFzdF9zZWVuJywgeyB0aW1lOiBmb3JtYXRDbGllbnRUaW1lc3RhbXAoY2xpZW50Lmxhc3RTZWVuKSB9KTtcclxufVxyXG5cclxuY29uc3Qgc29ydGVkQ2xpZW50cyA9IGNvbXB1dGVkPENsaWVudFZpZXdNb2RlbFtdPigoKSA9PiB7XHJcbiAgY29uc3QgbGlzdCA9IFsuLi5jbGllbnRzLnZhbHVlXTtcclxuICBpZiAoY2xpZW50U29ydE1vZGUudmFsdWUgPT09ICdyZWNlbnQnKSB7XHJcbiAgICBsaXN0LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgaWYgKGEuY29ubmVjdGVkICE9PSBiLmNvbm5lY3RlZCkgcmV0dXJuIGEuY29ubmVjdGVkID8gLTEgOiAxO1xyXG4gICAgICBjb25zdCBsYXN0QSA9IGEubGFzdFNlZW4gPz8gMDtcclxuICAgICAgY29uc3QgbGFzdEIgPSBiLmxhc3RTZWVuID8/IDA7XHJcbiAgICAgIGlmIChsYXN0QSAhPT0gbGFzdEIpIHJldHVybiBsYXN0QiAtIGxhc3RBO1xyXG4gICAgICByZXR1cm4gY29tcGFyZUJ5TmFtZShhLCBiKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGxpc3Q7XHJcbiAgfVxyXG4gIGxpc3Quc29ydChjb21wYXJlQnlOYW1lKTtcclxuICByZXR1cm4gbGlzdDtcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWdpc3RlckRldmljZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAocGFpcmluZy52YWx1ZSkgcmV0dXJuO1xyXG4gIHBhaXJTdGF0dXMudmFsdWUgPSBudWxsO1xyXG4gIHBhaXJpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IGRldmljZU5hbWUudmFsdWUudHJpbSgpO1xyXG4gICAgY29uc3QgYm9keSA9IHsgcGluOiBwaW4udmFsdWUudHJpbSgpLCBuYW1lOiB0cmltbWVkTmFtZSB9O1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAucG9zdCgnLi9hcGkvcGluJywgYm9keSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGNvbnN0IG9rID1cclxuICAgICAgciAmJlxyXG4gICAgICByLnN0YXR1cyA+PSAyMDAgJiZcclxuICAgICAgci5zdGF0dXMgPCAzMDAgJiZcclxuICAgICAgKHIuZGF0YT8uc3RhdHVzID09PSB0cnVlIHx8IHIuZGF0YT8uc3RhdHVzID09PSAndHJ1ZScgfHwgci5kYXRhPy5zdGF0dXMgPT09IDEpO1xyXG4gICAgcGFpclN0YXR1cy52YWx1ZSA9ICEhb2s7XHJcbiAgICBpZiAob2spIHtcclxuICAgICAgY29uc3QgcHJldkNvdW50ID0gY2xpZW50cy52YWx1ZT8ubGVuZ3RoIHx8IDA7XHJcbiAgICAgIGF3YWl0IHJlZnJlc2hDbGllbnRzKCk7XHJcbiAgICAgIGNvbnN0IGRlYWRsaW5lID0gRGF0ZS5ub3coKSArIDUwMDA7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRyaW1tZWROYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIHdoaWxlIChEYXRlLm5vdygpIDwgZGVhZGxpbmUpIHtcclxuICAgICAgICBjb25zdCBmb3VuZCA9IGNsaWVudHMudmFsdWU/LnNvbWUoKGMpID0+IChjLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09IHRhcmdldCk7XHJcbiAgICAgICAgaWYgKGZvdW5kIHx8IChjbGllbnRzLnZhbHVlPy5sZW5ndGggfHwgMCkgPiBwcmV2Q291bnQpIGJyZWFrO1xyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXMpID0+IHNldFRpbWVvdXQocmVzLCA0MDApKTtcclxuICAgICAgICBhd2FpdCByZWZyZXNoQ2xpZW50cygpO1xyXG4gICAgICB9XHJcbiAgICAgIHBpbi52YWx1ZSA9ICcnO1xyXG4gICAgICBkZXZpY2VOYW1lLnZhbHVlID0gJyc7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBwYWlyU3RhdHVzLnZhbHVlID0gZmFsc2U7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHBhaXJpbmcudmFsdWUgPSBmYWxzZTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBwYWlyU3RhdHVzLnZhbHVlID0gbnVsbDtcclxuICAgIH0sIDUwMDApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYXNrQ29uZmlybVVucGFpcihjbGllbnQ6IENsaWVudFZpZXdNb2RlbCk6IHZvaWQge1xyXG4gIHBlbmRpbmdSZW1vdmVVdWlkLnZhbHVlID0gY2xpZW50LnV1aWQ7XHJcbiAgcGVuZGluZ1JlbW92ZU5hbWUudmFsdWUgPSBjbGllbnQgJiYgY2xpZW50Lm5hbWUgPyBjbGllbnQubmFtZSA6ICcnO1xyXG4gIHNob3dDb25maXJtUmVtb3ZlLnZhbHVlID0gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29uZmlybVJlbW92ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCB1dWlkID0gcGVuZGluZ1JlbW92ZVV1aWQudmFsdWU7XHJcbiAgc2hvd0NvbmZpcm1SZW1vdmUudmFsdWUgPSBmYWxzZTtcclxuICBwZW5kaW5nUmVtb3ZlVXVpZC52YWx1ZSA9ICcnO1xyXG4gIHBlbmRpbmdSZW1vdmVOYW1lLnZhbHVlID0gJyc7XHJcbiAgaWYgKCF1dWlkKSByZXR1cm47XHJcbiAgYXdhaXQgdW5wYWlyU2luZ2xlKHV1aWQpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1bnBhaXJTaW5nbGUodXVpZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKHJlbW92aW5nLnZhbHVlW3V1aWRdKSByZXR1cm47XHJcbiAgcmVtb3ZpbmcudmFsdWUgPSB7IC4uLnJlbW92aW5nLnZhbHVlLCBbdXVpZF06IHRydWUgfTtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgaHR0cC5wb3N0KCcuL2FwaS9jbGllbnRzL3VucGFpcicsIHsgdXVpZCB9LCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gIH0gY2F0Y2gge1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBkZWxldGUgcmVtb3ZpbmcudmFsdWVbdXVpZF07XHJcbiAgICByZW1vdmluZy52YWx1ZSA9IHsgLi4ucmVtb3ZpbmcudmFsdWUgfTtcclxuICAgIHJlZnJlc2hDbGllbnRzKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc2tDb25maXJtVW5wYWlyQWxsKCk6IHZvaWQge1xyXG4gIHNob3dDb25maXJtVW5wYWlyQWxsLnZhbHVlID0gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29uZmlybVVucGFpckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBzaG93Q29uZmlybVVucGFpckFsbC52YWx1ZSA9IGZhbHNlO1xyXG4gIGF3YWl0IHVucGFpckFsbCgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1bnBhaXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdW5wYWlyQWxsUHJlc3NlZC52YWx1ZSA9IHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLnBvc3QoJy4vYXBpL2NsaWVudHMvdW5wYWlyLWFsbCcsIHt9LCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgdW5wYWlyQWxsU3RhdHVzLnZhbHVlID0gci5kYXRhPy5zdGF0dXMgPT09IHRydWU7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICB1bnBhaXJBbGxTdGF0dXMudmFsdWUgPSBmYWxzZTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgdW5wYWlyQWxsUHJlc3NlZC52YWx1ZSA9IGZhbHNlO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHVucGFpckFsbFN0YXR1cy52YWx1ZSA9IG51bGw7XHJcbiAgICB9LCA1MDAwKTtcclxuICAgIHJlZnJlc2hDbGllbnRzKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0Q2xpZW50KGNsaWVudDogQ2xpZW50Vmlld01vZGVsKTogdm9pZCB7XHJcbiAgZm9yIChjb25zdCBjIG9mIGNsaWVudHMudmFsdWUpIHtcclxuICAgIGlmIChjLnV1aWQgIT09IGNsaWVudC51dWlkICYmIGMuZWRpdGluZykge1xyXG4gICAgICBjLmVkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgcmVzZXRDbGllbnRFZGl0cyhjKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmVzZXRDbGllbnRFZGl0cyhjbGllbnQpO1xyXG4gIGNsaWVudC5lZGl0aW5nID0gdHJ1ZTtcclxuICBlbnN1cmVEaXNwbGF5RGV2aWNlc0xvYWRlZCgpO1xyXG4gIGVuc3VyZUhkclByb2ZpbGVzTG9hZGVkKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbEVkaXQoY2xpZW50OiBDbGllbnRWaWV3TW9kZWwpOiB2b2lkIHtcclxuICByZXNldENsaWVudEVkaXRzKGNsaWVudCk7XHJcbiAgY2xpZW50LmVkaXRpbmcgPSBmYWxzZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZUNsaWVudChjbGllbnQ6IENsaWVudFZpZXdNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmIChzYXZpbmcudmFsdWVbY2xpZW50LnV1aWRdKSByZXR1cm47XHJcbiAgc2F2aW5nLnZhbHVlID0geyAuLi5zYXZpbmcudmFsdWUsIFtjbGllbnQudXVpZF06IHRydWUgfTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGF5bG9hZDogYW55ID0ge1xyXG4gICAgICB1dWlkOiBjbGllbnQudXVpZCxcclxuICAgICAgbmFtZTogKGNsaWVudC5lZGl0TmFtZSB8fCAnJykudHJpbSgpLFxyXG4gICAgICBoZHJfcHJvZmlsZTogU3RyaW5nKGNsaWVudC5lZGl0SGRyUHJvZmlsZSA/PyAnJykudHJpbSgpLFxyXG4gICAgICBkaXNwbGF5X21vZGU6IChjbGllbnQuZWRpdERpc3BsYXlNb2RlIHx8ICcnKS50cmltKCksXHJcbiAgICAgIHBlcm06IGNsaWVudC5lZGl0UGVybSAmIHBlcm1pc3Npb25NYXBwaW5nLl9hbGwsXHJcbiAgICAgIGFsbG93X2NsaWVudF9jb21tYW5kczogISFjbGllbnQuZWRpdEFsbG93Q2xpZW50Q29tbWFuZHMsXHJcbiAgICAgIGRvOiBjbGllbnQuZWRpdERvQ29tbWFuZHMucmVkdWNlKChyZXN1bHQ6IENsaWVudENvbW1hbmRFbnRyeVtdLCBlbnRyeSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNtZCA9IFN0cmluZyhlbnRyeT8uY21kID8/ICcnKS50cmltKCk7XHJcbiAgICAgICAgaWYgKCFjbWQpIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgY21kLFxyXG4gICAgICAgICAgZWxldmF0ZWQ6ICEhZW50cnk/LmVsZXZhdGVkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH0sIFtdKSxcclxuICAgICAgdW5kbzogY2xpZW50LmVkaXRVbmRvQ29tbWFuZHMucmVkdWNlKChyZXN1bHQ6IENsaWVudENvbW1hbmRFbnRyeVtdLCBlbnRyeSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNtZCA9IFN0cmluZyhlbnRyeT8uY21kID8/ICcnKS50cmltKCk7XHJcbiAgICAgICAgaWYgKCFjbWQpIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgY21kLFxyXG4gICAgICAgICAgZWxldmF0ZWQ6ICEhZW50cnk/LmVsZXZhdGVkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH0sIFtdKSxcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCFjbGllbnQuZWRpdERpc3BsYXlPdmVycmlkZUVuYWJsZWQpIHtcclxuICAgICAgcGF5bG9hZC5vdXRwdXRfbmFtZV9vdmVycmlkZSA9ICcnO1xyXG4gICAgICBwYXlsb2FkLmFsd2F5c191c2VfdmlydHVhbF9kaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgIHBheWxvYWQudmlydHVhbF9kaXNwbGF5X21vZGUgPSAnJztcclxuICAgICAgcGF5bG9hZC52aXJ0dWFsX2Rpc3BsYXlfbGF5b3V0ID0gJyc7XHJcbiAgICB9IGVsc2UgaWYgKGNsaWVudC5lZGl0RGlzcGxheVNlbGVjdGlvbiA9PT0gJ3BoeXNpY2FsJykge1xyXG4gICAgICBwYXlsb2FkLm91dHB1dF9uYW1lX292ZXJyaWRlID0gU3RyaW5nKGNsaWVudC5lZGl0UGh5c2ljYWxPdXRwdXRPdmVycmlkZSB8fCAnJykudHJpbSgpO1xyXG4gICAgICBwYXlsb2FkLmFsd2F5c191c2VfdmlydHVhbF9kaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgIHBheWxvYWQudmlydHVhbF9kaXNwbGF5X21vZGUgPSAnZGlzYWJsZWQnO1xyXG4gICAgICBwYXlsb2FkLnZpcnR1YWxfZGlzcGxheV9sYXlvdXQgPSAnJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBheWxvYWQub3V0cHV0X25hbWVfb3ZlcnJpZGUgPSAnJztcclxuICAgICAgaWYgKGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlID09PSAnZ2xvYmFsJyB8fCBjbGllbnQuZWRpdFZpcnR1YWxEaXNwbGF5TW9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHBheWxvYWQuYWx3YXlzX3VzZV92aXJ0dWFsX2Rpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICBwYXlsb2FkLnZpcnR1YWxfZGlzcGxheV9tb2RlID0gJ2dsb2JhbCc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF5bG9hZC5hbHdheXNfdXNlX3ZpcnR1YWxfZGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgcGF5bG9hZC52aXJ0dWFsX2Rpc3BsYXlfbW9kZSA9IGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlNb2RlO1xyXG4gICAgICB9XHJcbiAgICAgIHBheWxvYWQudmlydHVhbF9kaXNwbGF5X2xheW91dCA9IGNsaWVudC5lZGl0VmlydHVhbERpc3BsYXlMYXlvdXQgPz8gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc0NsaWVudERpc3BsYXlPdmVycmlkZVZhbGlkLnZhbHVlKSB7XHJcbiAgICAgIG1lc3NhZ2UuZXJyb3IodCgnY2xpZW50cy51cGRhdGVfZmFpbGVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcGF5bG9hZC5jb25maWdfb3ZlcnJpZGVzID1cclxuICAgICAgY2xpZW50LmVkaXRDb25maWdPdmVycmlkZXMgJiZcclxuICAgICAgdHlwZW9mIGNsaWVudC5lZGl0Q29uZmlnT3ZlcnJpZGVzID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICAhQXJyYXkuaXNBcnJheShjbGllbnQuZWRpdENvbmZpZ092ZXJyaWRlcylcclxuICAgICAgICA/IE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY2xpZW50LmVkaXRDb25maWdPdmVycmlkZXMpLmZpbHRlcihcclxuICAgICAgICAgICAgICAoW2ssIHZdKSA9PiB0eXBlb2YgayA9PT0gJ3N0cmluZycgJiYgay5sZW5ndGggPiAwICYmIHYgIT09IHVuZGVmaW5lZCAmJiB2ICE9PSBudWxsLFxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIDoge307XHJcbiAgICBpZiAoY2xpZW50LmVkaXRQcmVmZXIxMEJpdFNkciAhPT0gbnVsbCkge1xyXG4gICAgICBwYXlsb2FkLnByZWZlcl8xMGJpdF9zZHIgPSBjbGllbnQuZWRpdFByZWZlcjEwQml0U2RyID09PSAnZW5hYmxlZCc7XHJcbiAgICB9XHJcbiAgICBwYXlsb2FkLmhkcl9wcm9maWxlID0gU3RyaW5nKGNsaWVudC5lZGl0SGRyUHJvZmlsZSA/PyAnJykudHJpbSgpO1xyXG5cclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLnBvc3QoJy4vYXBpL2NsaWVudHMvdXBkYXRlJywgcGF5bG9hZCwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGNvbnN0IG9rID0gciAmJiByLnN0YXR1cyA+PSAyMDAgJiYgci5zdGF0dXMgPCAzMDAgJiYgci5kYXRhPy5zdGF0dXMgPT09IHRydWU7XHJcbiAgICBpZiAoIW9rKSB7XHJcbiAgICAgIG1lc3NhZ2UuZXJyb3IodCgnY2xpZW50cy51cGRhdGVfZmFpbGVkJykpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50Lm5hbWUgPSBwYXlsb2FkLm5hbWU7XHJcbiAgICBjbGllbnQucGVybSA9IHBheWxvYWQucGVybTtcclxuICAgIGNsaWVudC5oZHJQcm9maWxlID0gcGF5bG9hZC5oZHJfcHJvZmlsZTtcclxuICAgIGNsaWVudC5kaXNwbGF5TW9kZSA9IHBheWxvYWQuZGlzcGxheV9tb2RlO1xyXG4gICAgY2xpZW50Lm91dHB1dE92ZXJyaWRlID0gcGF5bG9hZC5vdXRwdXRfbmFtZV9vdmVycmlkZTtcclxuICAgIGNsaWVudC5hbHdheXNVc2VWaXJ0dWFsRGlzcGxheSA9IHBheWxvYWQuYWx3YXlzX3VzZV92aXJ0dWFsX2Rpc3BsYXk7XHJcbiAgICBjbGllbnQudmlydHVhbERpc3BsYXlNb2RlID0gcGFyc2VDbGllbnRWaXJ0dWFsRGlzcGxheU1vZGUocGF5bG9hZC52aXJ0dWFsX2Rpc3BsYXlfbW9kZSk7XHJcbiAgICBjbGllbnQudmlydHVhbERpc3BsYXlMYXlvdXQgPSBwYXJzZUNsaWVudFZpcnR1YWxEaXNwbGF5TGF5b3V0KHBheWxvYWQudmlydHVhbF9kaXNwbGF5X2xheW91dCk7XHJcbiAgICBjbGllbnQuaGRyUHJvZmlsZSA9IHBheWxvYWQuaGRyX3Byb2ZpbGUgfHwgJyc7XHJcbiAgICBjbGllbnQuYWxsb3dDbGllbnRDb21tYW5kcyA9IHBheWxvYWQuYWxsb3dfY2xpZW50X2NvbW1hbmRzO1xyXG4gICAgY2xpZW50LmRvQ29tbWFuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQuZG8gfHwgW10pKTtcclxuICAgIGNsaWVudC51bmRvQ29tbWFuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQudW5kbyB8fCBbXSkpO1xyXG4gICAgY2xpZW50LnByZWZlcjEwQml0U2RyID1cclxuICAgICAgcGF5bG9hZC5wcmVmZXJfMTBiaXRfc2RyID09PSB1bmRlZmluZWRcclxuICAgICAgICA/IG51bGxcclxuICAgICAgICA6IHBheWxvYWQucHJlZmVyXzEwYml0X3NkclxyXG4gICAgICAgICAgPyAnZW5hYmxlZCdcclxuICAgICAgICAgIDogJ2Rpc2FibGVkJztcclxuICAgIGNsaWVudC5jb25maWdPdmVycmlkZXMgPVxyXG4gICAgICBwYXlsb2FkLmNvbmZpZ19vdmVycmlkZXMgJiZcclxuICAgICAgdHlwZW9mIHBheWxvYWQuY29uZmlnX292ZXJyaWRlcyA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgIUFycmF5LmlzQXJyYXkocGF5bG9hZC5jb25maWdfb3ZlcnJpZGVzKVxyXG4gICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwYXlsb2FkLmNvbmZpZ19vdmVycmlkZXMpKVxyXG4gICAgICAgIDoge307XHJcblxyXG4gICAgcmVzZXRDbGllbnRFZGl0cyhjbGllbnQpO1xyXG4gICAgY2xpZW50LmVkaXRpbmcgPSBmYWxzZTtcclxuICAgIG1lc3NhZ2Uuc3VjY2Vzcyh0KCdjbGllbnRzLnVwZGF0ZV9zdWNjZXNzJykpO1xyXG4gIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgbWVzc2FnZS5lcnJvcihlPy5tZXNzYWdlIHx8IHQoJ2NsaWVudHMudXBkYXRlX2ZhaWxlZCcpKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgZGVsZXRlIHNhdmluZy52YWx1ZVtjbGllbnQudXVpZF07XHJcbiAgICBzYXZpbmcudmFsdWUgPSB7IC4uLnNhdmluZy52YWx1ZSB9O1xyXG4gICAgcmVmcmVzaENsaWVudHMoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRpc2Nvbm5lY3RDbGllbnQoY2xpZW50OiBDbGllbnRWaWV3TW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoZGlzY29ubmVjdGluZy52YWx1ZVtjbGllbnQudXVpZF0pIHJldHVybjtcclxuICBkaXNjb25uZWN0aW5nLnZhbHVlID0geyAuLi5kaXNjb25uZWN0aW5nLnZhbHVlLCBbY2xpZW50LnV1aWRdOiB0cnVlIH07XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLnBvc3QoXHJcbiAgICAgICcuL2FwaS9jbGllbnRzL2Rpc2Nvbm5lY3QnLFxyXG4gICAgICB7IHV1aWQ6IGNsaWVudC51dWlkIH0sXHJcbiAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBjb25zdCBvayA9IHIgJiYgci5zdGF0dXMgPj0gMjAwICYmIHIuc3RhdHVzIDwgMzAwICYmIHIuZGF0YT8uc3RhdHVzID09PSB0cnVlO1xyXG4gICAgaWYgKCFvaykge1xyXG4gICAgICBtZXNzYWdlLmVycm9yKHQoJ2NsaWVudHMuZGlzY29ubmVjdF9mYWlsZWQnKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIG1lc3NhZ2Uuc3VjY2Vzcyh0KCdjbGllbnRzLmRpc2Nvbm5lY3Rfc3VjY2VzcycpKTtcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIG1lc3NhZ2UuZXJyb3IoZT8ubWVzc2FnZSB8fCB0KCdjbGllbnRzLmRpc2Nvbm5lY3RfZmFpbGVkJykpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBkZWxldGUgZGlzY29ubmVjdGluZy52YWx1ZVtjbGllbnQudXVpZF07XHJcbiAgICBkaXNjb25uZWN0aW5nLnZhbHVlID0geyAuLi5kaXNjb25uZWN0aW5nLnZhbHVlIH07XHJcbiAgICByZWZyZXNoQ2xpZW50cygpO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgZGlzcGxheURldmljZXMgPSByZWY8RGlzcGxheURldmljZVtdPihbXSk7XHJcbmNvbnN0IGRpc3BsYXlEZXZpY2VzTG9hZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGRpc3BsYXlEZXZpY2VzRXJyb3IgPSByZWYoJycpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZERpc3BsYXlEZXZpY2VzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghaXNXaW5kb3dzLnZhbHVlKSByZXR1cm47XHJcbiAgZGlzcGxheURldmljZXNMb2FkaW5nLnZhbHVlID0gdHJ1ZTtcclxuICBkaXNwbGF5RGV2aWNlc0Vycm9yLnZhbHVlID0gJyc7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0PERpc3BsYXlEZXZpY2VbXT4oJy9hcGkvZGlzcGxheS1kZXZpY2VzJywge1xyXG4gICAgICBwYXJhbXM6IHsgZGV0YWlsOiAnZnVsbCcgfSxcclxuICAgIH0pO1xyXG4gICAgZGlzcGxheURldmljZXMudmFsdWUgPSBBcnJheS5pc0FycmF5KHJlcy5kYXRhKSA/IHJlcy5kYXRhIDogW107XHJcbiAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICBkaXNwbGF5RGV2aWNlc0Vycm9yLnZhbHVlID0gZT8ubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGxvYWQgZGlzcGxheSBkZXZpY2VzJztcclxuICAgIGRpc3BsYXlEZXZpY2VzLnZhbHVlID0gW107XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGRpc3BsYXlEZXZpY2VzTG9hZGluZy52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZW5zdXJlRGlzcGxheURldmljZXNMb2FkZWQoKTogdm9pZCB7XHJcbiAgaWYgKCFpc1dpbmRvd3MudmFsdWUpIHJldHVybjtcclxuICBpZiAoIWRpc3BsYXlEZXZpY2VzTG9hZGluZy52YWx1ZSAmJiBkaXNwbGF5RGV2aWNlcy52YWx1ZS5sZW5ndGggPT09IDApIHtcclxuICAgIHZvaWQgbG9hZERpc3BsYXlEZXZpY2VzKCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBkaXNwbGF5RGV2aWNlT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBvcHRzOiBBcnJheTx7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgdmFsdWU6IHN0cmluZztcclxuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmc7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgYWN0aXZlOiBib29sZWFuIHwgbnVsbDtcclxuICB9PiA9IFtdO1xyXG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICBmb3IgKGNvbnN0IGQgb2YgZGlzcGxheURldmljZXMudmFsdWUpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gZC5kZXZpY2VfaWQgfHwgZC5kaXNwbGF5X25hbWUgfHwgJyc7XHJcbiAgICBpZiAoIXZhbHVlIHx8IHNlZW4uaGFzKHZhbHVlKSkgY29udGludWU7XHJcbiAgICBjb25zdCBkaXNwbGF5TmFtZSA9IGQuZnJpZW5kbHlfbmFtZSB8fCBkLmRpc3BsYXlfbmFtZSB8fCAnRGlzcGxheSc7XHJcbiAgICBjb25zdCBpbmZvID0gZC5pbmZvIGFzIGFueTtcclxuICAgIGxldCBhY3RpdmU6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcclxuICAgIGlmIChpbmZvICYmIHR5cGVvZiBpbmZvID09PSAnb2JqZWN0JyAmJiAnYWN0aXZlJyBpbiBpbmZvKSB7XHJcbiAgICAgIGFjdGl2ZSA9ICEhKGluZm8gYXMgYW55KS5hY3RpdmU7XHJcbiAgICB9IGVsc2UgaWYgKGluZm8pIHtcclxuICAgICAgYWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHN1ZmZpeCA9XHJcbiAgICAgIGFjdGl2ZSA9PT0gbnVsbFxyXG4gICAgICAgID8gJydcclxuICAgICAgICA6IGFjdGl2ZVxyXG4gICAgICAgICAgPyBgICgke3QoJ2NvbmZpZy5hcHBfZGlzcGxheV9zdGF0dXNfYWN0aXZlJyl9KWBcclxuICAgICAgICAgIDogYCAoJHt0KCdjb25maWcuYXBwX2Rpc3BsYXlfc3RhdHVzX2luYWN0aXZlJyl9KWA7XHJcbiAgICBvcHRzLnB1c2goe1xyXG4gICAgICBsYWJlbDogYCR7ZGlzcGxheU5hbWV9IC0gJHt2YWx1ZX0ke3N1ZmZpeH1gLFxyXG4gICAgICB2YWx1ZSxcclxuICAgICAgZGlzcGxheU5hbWUsXHJcbiAgICAgIGlkOiB2YWx1ZSxcclxuICAgICAgYWN0aXZlLFxyXG4gICAgfSk7XHJcbiAgICBzZWVuLmFkZCh2YWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBvcHRzO1xyXG59KTtcclxuXHJcbm9uTW91bnRlZChhc3luYyAoKSA9PiB7XHJcbiAgY29uc3QgYXV0aCA9IHVzZUF1dGhTdG9yZSgpO1xyXG4gIGF3YWl0IGNvbmZpZ1N0b3JlLmZldGNoQ29uZmlnKCkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIGF3YWl0IGF1dGgud2FpdEZvckF1dGhlbnRpY2F0aW9uKCk7XHJcbiAgYXdhaXQgcmVmcmVzaENsaWVudHMoKTtcclxuICBpZiAocmVmcmVzaEludGVydmFsSWQgPT09IG51bGwpIHtcclxuICAgIHJlZnJlc2hJbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICB2b2lkIHJlZnJlc2hDbGllbnRzKCk7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcbn0pO1xyXG5cclxub25CZWZvcmVVbm1vdW50KCgpID0+IHtcclxuICBpZiAocmVmcmVzaEludGVydmFsSWQgIT09IG51bGwpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwocmVmcmVzaEludGVydmFsSWQpO1xyXG4gICAgcmVmcmVzaEludGVydmFsSWQgPSBudWxsO1xyXG4gIH1cclxufSk7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHN0eWxlIHNjb3BlZD5cclxuLmNsaWVudHMtcGFnZSA6ZGVlcCgubi1jYXJkKSB7XHJcbiAgYm9yZGVyLXJhZGl1czogMXJlbTtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMSk7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuOCk7XHJcbiAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDZweCk7XHJcbn1cclxuXHJcbi5kYXJrIC5jbGllbnRzLXBhZ2UgOmRlZXAoLm4tY2FyZCkge1xyXG4gIGJvcmRlci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMTQpO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1zdXJmYWNlKSAvIDAuNzQpO1xyXG59XHJcblxyXG4uY2xpZW50cy1wYWdlIDpkZWVwKC5uLWNhcmQgLm4tY2FyZF9faGVhZGVyKSxcclxuLmNsaWVudHMtcGFnZSA6ZGVlcCgubi1jYXJkIC5uLWNhcmQtaGVhZGVyKSxcclxuLmNsaWVudHMtcGFnZSA6ZGVlcCgubi1jYXJkIC5uLWNhcmRfX2Zvb3RlciksXHJcbi5jbGllbnRzLXBhZ2UgOmRlZXAoLm4tY2FyZCAubi1jYXJkLWZvb3Rlcikge1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuOTVyZW07XHJcbn1cclxuXHJcbi5jbGllbnRzLXBhZ2UgOmRlZXAoLm4tYWxlcnQpLFxyXG4uY2xpZW50cy1wYWdlIDpkZWVwKC5uLWVtcHR5KSxcclxuLmNsaWVudHMtcGFnZSA6ZGVlcCgubi1pbnB1dCAubi1pbnB1dC13cmFwcGVyKSxcclxuLmNsaWVudHMtcGFnZSA6ZGVlcCgubi1iYXNlLXNlbGVjdGlvbiksXHJcbi5jbGllbnRzLXBhZ2UgOmRlZXAoLm4tYmFzZS1zZWxlY3Rpb24gLm4tYmFzZS1zZWxlY3Rpb24tbGFiZWwpLFxyXG4uY2xpZW50cy1wYWdlIDpkZWVwKC5uLWRhdGEtdGFibGUtd3JhcHBlciksXHJcbi5jbGllbnRzLXBhZ2UgOmRlZXAoLm4tdGFibGUtd3JhcHBlcikge1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuOHJlbSAhaW1wb3J0YW50O1xyXG59XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6WyJfY3JlYXRlQmxvY2siLCJfdW5yZWYiLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2hvaXN0ZWRfMSIsIl9ob2lzdGVkXzIiLCJfY3JlYXRlVk5vZGUiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX2hvaXN0ZWRfMyIsIl90b0Rpc3BsYXlTdHJpbmciLCJfaG9pc3RlZF80IiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl9ob2lzdGVkXzUiLCJfaG9pc3RlZF82IiwiX29wZW5CbG9jayIsIl9ob2lzdGVkXzciLCJfaG9pc3RlZF84IiwiX2hvaXN0ZWRfOSIsIl9ob2lzdGVkXzEwIiwiX2hvaXN0ZWRfMTEiLCJfaG9pc3RlZF8xMiIsIl9ob2lzdGVkXzEzIiwiX2hvaXN0ZWRfMTQiLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9ob2lzdGVkXzE1IiwiX2hvaXN0ZWRfMTYiLCJfaG9pc3RlZF8xNyIsIl9ob2lzdGVkXzE4IiwiX2hvaXN0ZWRfMTkiLCJfaG9pc3RlZF8yMCIsIl9ob2lzdGVkXzIxIiwiX2hvaXN0ZWRfMjIiLCJfaG9pc3RlZF8yMyIsIl9ob2lzdGVkXzI0IiwiX2hvaXN0ZWRfMjUiLCIkdCIsIl9jcmVhdGVDb21tZW50Vk5vZGUiLCJOSW5wdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStGQSxVQUFNLE9BQU87QUFDUCxVQUFBLEVBQUUsTUFBTTtBQUNkLFVBQU0sU0FBUztBQUNmLFVBQU0sVUFBVTtBQUVoQixVQUFNLEVBQUUsVUFBVSxpQkFBaUIsY0FBYyxJQUFJLFlBQVksSUFBSTtBQUMvRCxVQUFBLGFBQWEsSUFBSSxFQUFFO0FBRXpCLFVBQU0sZUFBZSxTQUFTLE1BQU0sU0FBUyxTQUFTLENBQUUsQ0FBQTtBQUN4RCxVQUFNLFVBQVUsU0FBUyxNQUFNLGdCQUFnQixLQUFLO0FBRTlDLFVBQUEsZUFBZSxTQUFTLE1BQU07QUFDbEMsVUFBSSxDQUFDLGNBQWM7QUFBYyxlQUFBO0FBQ2pDLFVBQUksY0FBYyxV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
