import { k as defineComponent, $ as storeToRefs, r as ref, o as onMounted, c as computed, O as createElementBlock, V as createBaseVNode, P as toDisplayString, F as Fragment, a1 as renderList, U as createVNode, S as withCtx, Z as unref, Q as openBlock, H as normalizeClass, j as createTextVNode, a0 as RouterLink } from "./vue-core-de07660f.js";
import { b as useAppsStore, a as useAuthStore, h as http, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { aE as NTag, aq as NButton } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "home-page mx-auto max-w-6xl space-y-6" };
const _hoisted_2 = { class: "page-surface p-5 md:p-6" };
const _hoisted_3 = { class: "grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start" };
const _hoisted_4 = { class: "min-w-0 space-y-2" };
const _hoisted_5 = { class: "text-2xl font-semibold tracking-tight md:text-3xl" };
const _hoisted_6 = { class: "max-w-2xl text-sm leading-6 text-dark/70 dark:text-light/70" };
const _hoisted_7 = { class: "grid grid-cols-3 gap-2 text-center" };
const _hoisted_8 = { class: "metric-tile" };
const _hoisted_9 = { class: "metric-value" };
const _hoisted_10 = { class: "metric-tile" };
const _hoisted_11 = { class: "metric-value" };
const _hoisted_12 = { class: "metric-tile" };
const _hoisted_13 = { class: "metric-value" };
const _hoisted_14 = {
  key: 0,
  class: "grid gap-4 lg:grid-cols-2"
};
const _hoisted_15 = { class: "flex items-start gap-4" };
const _hoisted_16 = { class: "min-w-0 flex-1 space-y-2" };
const _hoisted_17 = { class: "flex flex-wrap items-center gap-2" };
const _hoisted_18 = { class: "text-base font-semibold" };
const _hoisted_19 = { class: "text-sm leading-6 text-dark/70 dark:text-light/70" };
const _hoisted_20 = ["href", "onClick"];
const _hoisted_21 = {
  key: 1,
  class: "grid gap-4 lg:grid-cols-[2fr_1fr]"
};
const _hoisted_22 = { class: "page-surface p-5" };
const _hoisted_23 = { class: "mb-4 flex items-center justify-between gap-3" };
const _hoisted_24 = ["href", "onClick"];
const _hoisted_25 = { class: "grid gap-3 md:grid-cols-2" };
const _hoisted_26 = { class: "min-w-0" };
const _hoisted_27 = { class: "truncate text-sm font-semibold" };
const _hoisted_28 = { class: "truncate text-xs text-dark/60 dark:text-light/60" };
const _hoisted_29 = { class: "page-surface p-5" };
const _hoisted_30 = { class: "space-y-3" };
const _hoisted_31 = { class: "min-w-0 flex-1 text-sm" };
const _hoisted_32 = { class: "grid gap-4 lg:grid-cols-3" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DashboardView",
  setup(__props) {
    const appsStore = useAppsStore();
    const authStore = useAuthStore();
    const { apps } = storeToRefs(appsStore);
    const { sessions } = storeToRefs(authStore);
    const setupStatus = ref(null);
    onMounted(() => {
      void appsStore.loadApps(false);
      void authStore.fetchSessions();
      void loadSetupStatus();
    });
    async function loadSetupStatus() {
      var _a;
      try {
        const res = await http.get("/api/setup/status", { validateStatus: () => true });
        if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.status)) {
          setupStatus.value = res.data;
        }
      } catch {
        setupStatus.value = null;
      }
    }
    const fallbackPairedClientCount = computed(() => sessions.value.length);
    const fallbackConnectedSourceCount = computed(() => {
      const sources = /* @__PURE__ */ new Set();
      for (const app of apps.value) {
        if (app["playnite-id"])
          sources.add("playniteLegacy");
        else
          sources.add("manual");
      }
      return sources.size;
    });
    const fallbackPlayableGameCount = computed(() => apps.value.length);
    const pairedClientCount = computed(() => {
      var _a;
      return ((_a = setupStatus.value) == null ? void 0 : _a.pairedClientCount) ?? fallbackPairedClientCount.value;
    });
    const connectedSourceCount = computed(() => {
      var _a;
      return ((_a = setupStatus.value) == null ? void 0 : _a.connectedSourceCount) ?? fallbackConnectedSourceCount.value;
    });
    const playableGameCount = computed(() => {
      var _a;
      return ((_a = setupStatus.value) == null ? void 0 : _a.playableGameCount) ?? fallbackPlayableGameCount.value;
    });
    const setupComplete = computed(
      () => {
        var _a;
        return ((_a = setupStatus.value) == null ? void 0 : _a.setupComplete) ?? (pairedClientCount.value > 0 && connectedSourceCount.value > 0 && playableGameCount.value > 0);
      }
    );
    const fallbackReadinessChecks = computed(() => [
      {
        id: "client",
        label: "Client paired",
        status: pairedClientCount.value > 0 ? "ready" : "pending"
      },
      {
        id: "game",
        label: "Playable game available",
        status: playableGameCount.value > 0 ? "ready" : "pending"
      },
      { id: "encoder", label: "Encoder ready", status: "warning" },
      { id: "capture", label: "Display capture ready", status: "warning" },
      { id: "network", label: "Network reachable", status: "warning" }
    ]);
    const readinessChecks = computed(() => {
      var _a, _b;
      return ((_b = (_a = setupStatus.value) == null ? void 0 : _a.readiness) == null ? void 0 : _b.checks) ?? fallbackReadinessChecks.value;
    });
    const fallbackSetupSteps = computed(() => [
      {
        id: "pair",
        title: "Pair a device",
        description: "Connect a Jujo or Moonlight-compatible client to this host.",
        action: "Open Pairing",
        path: "/pairing",
        icon: "fa-link",
        status: pairedClientCount.value > 0 ? "ready" : "pending"
      },
      {
        id: "sources",
        title: "Connect a library",
        description: "Sign in to Steam, Epic Games, GOG, or Xbox, or add games manually.",
        action: "Open Game Sources",
        path: "/game-sources",
        icon: "fa-plug",
        status: connectedSourceCount.value > 0 ? "ready" : "pending"
      },
      {
        id: "readiness",
        title: "Verify readiness",
        description: "Review encoder, display capture, network, and Windows-specific checks.",
        action: "Open System",
        path: "/system",
        icon: "fa-stethoscope",
        status: setupComplete.value ? "ready" : "warning"
      },
      {
        id: "play",
        title: "Start streaming",
        description: "Open the library when at least one game is playable.",
        action: "Open Library",
        path: "/library",
        icon: "fa-play",
        status: playableGameCount.value > 0 ? "ready" : "pending"
      }
    ]);
    const setupSteps = computed(() => {
      var _a;
      return ((_a = setupStatus.value) == null ? void 0 : _a.steps) ?? fallbackSetupSteps.value;
    });
    const featuredApps = computed(() => apps.value.slice(0, 4));
    function appKey(app, index) {
      return app.uuid || app.name || `app-${index}`;
    }
    function statusIcon(status) {
      if (status === "ready")
        return "fa-check-circle";
      if (status === "warning")
        return "fa-exclamation-triangle";
      return "fa-circle-info";
    }
    function statusLabel(status) {
      if (status === "ready")
        return "Ready";
      if (status === "warning")
        return "Review";
      return "Not set";
    }
    function tagType(status) {
      if (status === "ready")
        return "success";
      if (status === "warning")
        return "warning";
      return "info";
    }
    function statusClass(status) {
      if (status === "ready")
        return "bg-success/12 text-success";
      if (status === "warning")
        return "bg-warning/14 text-warning";
      return "bg-primary/10 text-primary";
    }
    function statusTextClass(status) {
      if (status === "ready")
        return "text-success";
      if (status === "warning")
        return "text-warning";
      return "text-primary";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("section", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              _cache[0] || (_cache[0] = createBaseVNode(
                "p",
                { class: "text-xs font-semibold uppercase tracking-wide text-primary" },
                "Jujo.Stream Server",
                -1
                /* CACHED */
              )),
              createBaseVNode(
                "h1",
                _hoisted_5,
                toDisplayString(setupComplete.value ? "Server ready" : "Finish setup when you are ready"),
                1
                /* TEXT */
              ),
              createBaseVNode(
                "p",
                _hoisted_6,
                toDisplayString(setupComplete.value ? "Your server has the essentials needed to start streaming." : "Pair a device, connect a game library, verify the host, and start from the library. You can skip any step and return later."),
                1
                /* TEXT */
              )
            ]),
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode(
                  "span",
                  _hoisted_9,
                  toDisplayString(pairedClientCount.value),
                  1
                  /* TEXT */
                ),
                _cache[1] || (_cache[1] = createBaseVNode(
                  "span",
                  { class: "metric-label" },
                  "Clients",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_10, [
                createBaseVNode(
                  "span",
                  _hoisted_11,
                  toDisplayString(connectedSourceCount.value),
                  1
                  /* TEXT */
                ),
                _cache[2] || (_cache[2] = createBaseVNode(
                  "span",
                  { class: "metric-label" },
                  "Sources",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_12, [
                createBaseVNode(
                  "span",
                  _hoisted_13,
                  toDisplayString(playableGameCount.value),
                  1
                  /* TEXT */
                ),
                _cache[3] || (_cache[3] = createBaseVNode(
                  "span",
                  { class: "metric-label" },
                  "Games",
                  -1
                  /* CACHED */
                ))
              ])
            ])
          ])
        ]),
        !setupComplete.value ? (openBlock(), createElementBlock("section", _hoisted_14, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(setupSteps.value, (item) => {
              return openBlock(), createElementBlock("article", {
                key: item.id,
                class: "page-surface setup-step p-4"
              }, [
                createBaseVNode("div", _hoisted_15, [
                  createBaseVNode(
                    "span",
                    {
                      class: normalizeClass(["status-icon", statusClass(item.status)])
                    },
                    [
                      createVNode(LucideIcon, {
                        name: statusIcon(item.status),
                        size: 18
                      }, null, 8, ["name"])
                    ],
                    2
                    /* CLASS */
                  ),
                  createBaseVNode("div", _hoisted_16, [
                    createBaseVNode("div", _hoisted_17, [
                      createBaseVNode(
                        "h2",
                        _hoisted_18,
                        toDisplayString(item.title),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTag), {
                        type: tagType(item.status),
                        bordered: false,
                        size: "small"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(
                            toDisplayString(statusLabel(item.status)),
                            1
                            /* TEXT */
                          )
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["type"])
                    ]),
                    createBaseVNode(
                      "p",
                      _hoisted_19,
                      toDisplayString(item.description),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(RouterLink), {
                      to: item.path,
                      custom: ""
                    }, {
                      default: withCtx(({ navigate, href }) => [
                        createBaseVNode("a", {
                          href,
                          onClick: navigate
                        }, [
                          createVNode(
                            unref(NButton),
                            {
                              tag: "span",
                              type: "primary",
                              secondary: "",
                              strong: ""
                            },
                            {
                              default: withCtx(() => [
                                createVNode(LucideIcon, {
                                  name: item.icon,
                                  size: 16
                                }, null, 8, ["name"]),
                                createBaseVNode(
                                  "span",
                                  null,
                                  toDisplayString(item.action),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 2
                              /* DYNAMIC */
                            },
                            1024
                            /* DYNAMIC_SLOTS */
                          )
                        ], 8, _hoisted_20)
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["to"])
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (openBlock(), createElementBlock("section", _hoisted_21, [
          createBaseVNode("div", _hoisted_22, [
            createBaseVNode("div", _hoisted_23, [
              _cache[5] || (_cache[5] = createBaseVNode(
                "div",
                null,
                [
                  createBaseVNode("h2", { class: "text-lg font-semibold" }, "Ready to stream"),
                  createBaseVNode("p", { class: "text-sm text-dark/65 dark:text-light/65" }, "Launch from your playable library.")
                ],
                -1
                /* CACHED */
              )),
              createVNode(unref(RouterLink), {
                to: "/library",
                custom: ""
              }, {
                default: withCtx(({ navigate, href }) => [
                  createBaseVNode("a", {
                    href,
                    onClick: navigate
                  }, [
                    createVNode(unref(NButton), {
                      tag: "span",
                      type: "primary",
                      strong: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: "fa-play",
                          size: 16
                        }),
                        _cache[4] || (_cache[4] = createBaseVNode(
                          "span",
                          null,
                          "Open Library",
                          -1
                          /* CACHED */
                        ))
                      ]),
                      _: 1,
                      __: [4]
                    })
                  ], 8, _hoisted_24)
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            createBaseVNode("div", _hoisted_25, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(featuredApps.value, (app, index) => {
                  return openBlock(), createElementBlock("div", {
                    key: appKey(app, index),
                    class: "library-shortcut"
                  }, [
                    createBaseVNode("div", _hoisted_26, [
                      createBaseVNode(
                        "p",
                        _hoisted_27,
                        toDisplayString(app.name || "Untitled game"),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        _hoisted_28,
                        toDisplayString(app["working-dir"] || "Ready from local library"),
                        1
                        /* TEXT */
                      )
                    ]),
                    createVNode(LucideIcon, {
                      name: "fa-chevron-right",
                      size: 16,
                      class: "text-dark/40 dark:text-light/40"
                    })
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          createBaseVNode("div", _hoisted_29, [
            _cache[6] || (_cache[6] = createBaseVNode(
              "h2",
              { class: "mb-4 text-lg font-semibold" },
              "Readiness",
              -1
              /* CACHED */
            )),
            createBaseVNode("div", _hoisted_30, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(readinessChecks.value, (check) => {
                  return openBlock(), createElementBlock("div", {
                    key: check.id,
                    class: "readiness-row"
                  }, [
                    createVNode(LucideIcon, {
                      name: statusIcon(check.status),
                      size: 16,
                      class: normalizeClass(statusTextClass(check.status))
                    }, null, 8, ["name", "class"]),
                    createBaseVNode(
                      "span",
                      _hoisted_31,
                      toDisplayString(check.label),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(NTag), {
                      type: tagType(check.status),
                      bordered: false,
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(statusLabel(check.status)),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["type"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])),
        createBaseVNode("section", _hoisted_32, [
          createVNode(unref(RouterLink), {
            to: "/game-sources",
            class: "quick-card"
          }, {
            default: withCtx(() => [
              createVNode(LucideIcon, {
                name: "fa-plug",
                size: 20
              }),
              _cache[7] || (_cache[7] = createBaseVNode(
                "span",
                null,
                "Game Sources",
                -1
                /* CACHED */
              ))
            ]),
            _: 1,
            __: [7]
          }),
          createVNode(unref(RouterLink), {
            to: "/system",
            class: "quick-card"
          }, {
            default: withCtx(() => [
              createVNode(LucideIcon, {
                name: "fa-stethoscope",
                size: 20
              }),
              _cache[8] || (_cache[8] = createBaseVNode(
                "span",
                null,
                "System Readiness",
                -1
                /* CACHED */
              ))
            ]),
            _: 1,
            __: [8]
          }),
          createVNode(unref(RouterLink), {
            to: "/pairing",
            class: "quick-card"
          }, {
            default: withCtx(() => [
              createVNode(LucideIcon, {
                name: "fa-link",
                size: 20
              }),
              _cache[9] || (_cache[9] = createBaseVNode(
                "span",
                null,
                "Pairing",
                -1
                /* CACHED */
              ))
            ]),
            _: 1,
            __: [9]
          })
        ])
      ]);
    };
  }
});
const DashboardView_vue_vue_type_style_index_0_scoped_0823d7b1_lang = "";
const DashboardView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0823d7b1"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/DashboardView.vue"]]);
export {
  DashboardView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGFzaGJvYXJkVmlldy05MDMxN2RiYi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vdmlld3MvRGFzaGJvYXJkVmlldy52dWUiXSwic291cmNlc0NvbnRlbnQiOlsiPHRlbXBsYXRlPlxuICA8ZGl2IGNsYXNzPVwiaG9tZS1wYWdlIG14LWF1dG8gbWF4LXctNnhsIHNwYWNlLXktNlwiPlxuICAgIDxzZWN0aW9uIGNsYXNzPVwicGFnZS1zdXJmYWNlIHAtNSBtZDpwLTZcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdhcC01IGxnOmdyaWQtY29scy1bMWZyX2F1dG9dIGxnOml0ZW1zLXN0YXJ0XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIHNwYWNlLXktMlwiPlxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIHRleHQtcHJpbWFyeVwiPkp1am8uU3RyZWFtIFNlcnZlcjwvcD5cbiAgICAgICAgICA8aDEgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LXNlbWlib2xkIHRyYWNraW5nLXRpZ2h0IG1kOnRleHQtM3hsXCI+XG4gICAgICAgICAgICB7eyBzZXR1cENvbXBsZXRlID8gJ1NlcnZlciByZWFkeScgOiAnRmluaXNoIHNldHVwIHdoZW4geW91IGFyZSByZWFkeScgfX1cbiAgICAgICAgICA8L2gxPlxuICAgICAgICAgIDxwIGNsYXNzPVwibWF4LXctMnhsIHRleHQtc20gbGVhZGluZy02IHRleHQtZGFyay83MCBkYXJrOnRleHQtbGlnaHQvNzBcIj5cbiAgICAgICAgICAgIHt7XG4gICAgICAgICAgICAgIHNldHVwQ29tcGxldGVcbiAgICAgICAgICAgICAgICA/ICdZb3VyIHNlcnZlciBoYXMgdGhlIGVzc2VudGlhbHMgbmVlZGVkIHRvIHN0YXJ0IHN0cmVhbWluZy4nXG4gICAgICAgICAgICAgICAgOiAnUGFpciBhIGRldmljZSwgY29ubmVjdCBhIGdhbWUgbGlicmFyeSwgdmVyaWZ5IHRoZSBob3N0LCBhbmQgc3RhcnQgZnJvbSB0aGUgbGlicmFyeS4gWW91IGNhbiBza2lwIGFueSBzdGVwIGFuZCByZXR1cm4gbGF0ZXIuJ1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtMiB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXRyaWMtdGlsZVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtZXRyaWMtdmFsdWVcIj57eyBwYWlyZWRDbGllbnRDb3VudCB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWV0cmljLWxhYmVsXCI+Q2xpZW50czwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWV0cmljLXRpbGVcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWV0cmljLXZhbHVlXCI+e3sgY29ubmVjdGVkU291cmNlQ291bnQgfX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1ldHJpYy1sYWJlbFwiPlNvdXJjZXM8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1ldHJpYy10aWxlXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1ldHJpYy12YWx1ZVwiPnt7IHBsYXlhYmxlR2FtZUNvdW50IH19PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtZXRyaWMtbGFiZWxcIj5HYW1lczwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG5cbiAgICA8c2VjdGlvbiB2LWlmPVwiIXNldHVwQ29tcGxldGVcIiBjbGFzcz1cImdyaWQgZ2FwLTQgbGc6Z3JpZC1jb2xzLTJcIj5cbiAgICAgIDxhcnRpY2xlXG4gICAgICAgIHYtZm9yPVwiaXRlbSBpbiBzZXR1cFN0ZXBzXCJcbiAgICAgICAgOmtleT1cIml0ZW0uaWRcIlxuICAgICAgICBjbGFzcz1cInBhZ2Utc3VyZmFjZSBzZXR1cC1zdGVwIHAtNFwiXG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC00XCI+XG4gICAgICAgICAgPHNwYW4gOmNsYXNzPVwiWydzdGF0dXMtaWNvbicsIHN0YXR1c0NsYXNzKGl0ZW0uc3RhdHVzKV1cIj5cbiAgICAgICAgICAgIDxMdWNpZGVJY29uIDpuYW1lPVwic3RhdHVzSWNvbihpdGVtLnN0YXR1cylcIiA6c2l6ZT1cIjE4XCIgLz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1pbi13LTAgZmxleC0xIHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZFwiPnt7IGl0ZW0udGl0bGUgfX08L2gyPlxuICAgICAgICAgICAgICA8bi10YWcgOnR5cGU9XCJ0YWdUeXBlKGl0ZW0uc3RhdHVzKVwiIDpib3JkZXJlZD1cImZhbHNlXCIgc2l6ZT1cInNtYWxsXCI+XG4gICAgICAgICAgICAgICAge3sgc3RhdHVzTGFiZWwoaXRlbS5zdGF0dXMpIH19XG4gICAgICAgICAgICAgIDwvbi10YWc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1zbSBsZWFkaW5nLTYgdGV4dC1kYXJrLzcwIGRhcms6dGV4dC1saWdodC83MFwiPnt7IGl0ZW0uZGVzY3JpcHRpb24gfX08L3A+XG4gICAgICAgICAgICA8Um91dGVyTGluayA6dG89XCJpdGVtLnBhdGhcIiBjdXN0b20gdi1zbG90PVwieyBuYXZpZ2F0ZSwgaHJlZiB9XCI+XG4gICAgICAgICAgICAgIDxhIDpocmVmPVwiaHJlZlwiIEBjbGljaz1cIm5hdmlnYXRlXCI+XG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uIHRhZz1cInNwYW5cIiB0eXBlPVwicHJpbWFyeVwiIHNlY29uZGFyeSBzdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cIml0ZW0uaWNvblwiIDpzaXplPVwiMTZcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgaXRlbS5hY3Rpb24gfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9Sb3V0ZXJMaW5rPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXJ0aWNsZT5cbiAgICA8L3NlY3Rpb24+XG5cbiAgICA8c2VjdGlvbiB2LWVsc2UgY2xhc3M9XCJncmlkIGdhcC00IGxnOmdyaWQtY29scy1bMmZyXzFmcl1cIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwYWdlLXN1cmZhY2UgcC01XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtYi00IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGRcIj5SZWFkeSB0byBzdHJlYW08L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIHRleHQtZGFyay82NSBkYXJrOnRleHQtbGlnaHQvNjVcIj5MYXVuY2ggZnJvbSB5b3VyIHBsYXlhYmxlIGxpYnJhcnkuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxSb3V0ZXJMaW5rIHRvPVwiL2xpYnJhcnlcIiBjdXN0b20gdi1zbG90PVwieyBuYXZpZ2F0ZSwgaHJlZiB9XCI+XG4gICAgICAgICAgICA8YSA6aHJlZj1cImhyZWZcIiBAY2xpY2s9XCJuYXZpZ2F0ZVwiPlxuICAgICAgICAgICAgICA8bi1idXR0b24gdGFnPVwic3BhblwiIHR5cGU9XCJwcmltYXJ5XCIgc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1wbGF5XCIgOnNpemU9XCIxNlwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+T3BlbiBMaWJyYXJ5PC9zcGFuPlxuICAgICAgICAgICAgICA8L24tYnV0dG9uPlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIDwvUm91dGVyTGluaz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdhcC0zIG1kOmdyaWQtY29scy0yXCI+XG4gICAgICAgICAgPGRpdiB2LWZvcj1cIihhcHAsIGluZGV4KSBpbiBmZWF0dXJlZEFwcHNcIiA6a2V5PVwiYXBwS2V5KGFwcCwgaW5kZXgpXCIgY2xhc3M9XCJsaWJyYXJ5LXNob3J0Y3V0XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWluLXctMFwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cInRydW5jYXRlIHRleHQtc20gZm9udC1zZW1pYm9sZFwiPnt7IGFwcC5uYW1lIHx8ICdVbnRpdGxlZCBnYW1lJyB9fTwvcD5cbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0cnVuY2F0ZSB0ZXh0LXhzIHRleHQtZGFyay82MCBkYXJrOnRleHQtbGlnaHQvNjBcIj5cbiAgICAgICAgICAgICAgICB7eyBhcHBbJ3dvcmtpbmctZGlyJ10gfHwgJ1JlYWR5IGZyb20gbG9jYWwgbGlicmFyeScgfX1cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtY2hldnJvbi1yaWdodFwiIDpzaXplPVwiMTZcIiBjbGFzcz1cInRleHQtZGFyay80MCBkYXJrOnRleHQtbGlnaHQvNDBcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwicGFnZS1zdXJmYWNlIHAtNVwiPlxuICAgICAgICA8aDIgY2xhc3M9XCJtYi00IHRleHQtbGcgZm9udC1zZW1pYm9sZFwiPlJlYWRpbmVzczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTNcIj5cbiAgICAgICAgICA8ZGl2IHYtZm9yPVwiY2hlY2sgaW4gcmVhZGluZXNzQ2hlY2tzXCIgOmtleT1cImNoZWNrLmlkXCIgY2xhc3M9XCJyZWFkaW5lc3Mtcm93XCI+XG4gICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cInN0YXR1c0ljb24oY2hlY2suc3RhdHVzKVwiIDpzaXplPVwiMTZcIiA6Y2xhc3M9XCJzdGF0dXNUZXh0Q2xhc3MoY2hlY2suc3RhdHVzKVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1pbi13LTAgZmxleC0xIHRleHQtc21cIj57eyBjaGVjay5sYWJlbCB9fTwvc3Bhbj5cbiAgICAgICAgICAgIDxuLXRhZyA6dHlwZT1cInRhZ1R5cGUoY2hlY2suc3RhdHVzKVwiIDpib3JkZXJlZD1cImZhbHNlXCIgc2l6ZT1cInNtYWxsXCI+XG4gICAgICAgICAgICAgIHt7IHN0YXR1c0xhYmVsKGNoZWNrLnN0YXR1cykgfX1cbiAgICAgICAgICAgIDwvbi10YWc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuXG4gICAgPHNlY3Rpb24gY2xhc3M9XCJncmlkIGdhcC00IGxnOmdyaWQtY29scy0zXCI+XG4gICAgICA8Um91dGVyTGluayB0bz1cIi9nYW1lLXNvdXJjZXNcIiBjbGFzcz1cInF1aWNrLWNhcmRcIj5cbiAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdWdcIiA6c2l6ZT1cIjIwXCIgLz5cbiAgICAgICAgPHNwYW4+R2FtZSBTb3VyY2VzPC9zcGFuPlxuICAgICAgPC9Sb3V0ZXJMaW5rPlxuICAgICAgPFJvdXRlckxpbmsgdG89XCIvc3lzdGVtXCIgY2xhc3M9XCJxdWljay1jYXJkXCI+XG4gICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zdGV0aG9zY29wZVwiIDpzaXplPVwiMjBcIiAvPlxuICAgICAgICA8c3Bhbj5TeXN0ZW0gUmVhZGluZXNzPC9zcGFuPlxuICAgICAgPC9Sb3V0ZXJMaW5rPlxuICAgICAgPFJvdXRlckxpbmsgdG89XCIvcGFpcmluZ1wiIGNsYXNzPVwicXVpY2stY2FyZFwiPlxuICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtbGlua1wiIDpzaXplPVwiMjBcIiAvPlxuICAgICAgICA8c3Bhbj5QYWlyaW5nPC9zcGFuPlxuICAgICAgPC9Sb3V0ZXJMaW5rPlxuICAgIDwvc2VjdGlvbj5cbiAgPC9kaXY+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgcmVmIH0gZnJvbSAndnVlJztcbmltcG9ydCB7IFJvdXRlckxpbmsgfSBmcm9tICd2dWUtcm91dGVyJztcbmltcG9ydCB7IE5CdXR0b24sIE5UYWcgfSBmcm9tICduYWl2ZS11aSc7XG5pbXBvcnQgeyBzdG9yZVRvUmVmcyB9IGZyb20gJ3BpbmlhJztcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcbmltcG9ydCB7IHVzZUFwcHNTdG9yZSwgdHlwZSBBcHAgfSBmcm9tICdAL3N0b3Jlcy9hcHBzJztcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2F1dGgnO1xuXG50eXBlIFNldHVwU3RhdHVzID0gJ3JlYWR5JyB8ICd3YXJuaW5nJyB8ICdwZW5kaW5nJztcbnR5cGUgU2V0dXBTdGVwID0ge1xuICBpZDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBhY3Rpb246IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xuICBpY29uOiBzdHJpbmc7XG4gIHN0YXR1czogU2V0dXBTdGF0dXM7XG59O1xudHlwZSBSZWFkaW5lc3NDaGVjayA9IHtcbiAgaWQ6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgc3RhdHVzOiBTZXR1cFN0YXR1cztcbn07XG50eXBlIFNldHVwU3RhdHVzUmVzcG9uc2UgPSB7XG4gIHN0YXR1cz86IGJvb2xlYW47XG4gIHNldHVwQ29tcGxldGU/OiBib29sZWFuO1xuICBwYWlyZWRDbGllbnRDb3VudD86IG51bWJlcjtcbiAgY29ubmVjdGVkU291cmNlQ291bnQ/OiBudW1iZXI7XG4gIHBsYXlhYmxlR2FtZUNvdW50PzogbnVtYmVyO1xuICBzdGVwcz86IFNldHVwU3RlcFtdO1xuICByZWFkaW5lc3M/OiB7XG4gICAgY2hlY2tzPzogUmVhZGluZXNzQ2hlY2tbXTtcbiAgfTtcbn07XG5cbmNvbnN0IGFwcHNTdG9yZSA9IHVzZUFwcHNTdG9yZSgpO1xuY29uc3QgYXV0aFN0b3JlID0gdXNlQXV0aFN0b3JlKCk7XG5jb25zdCB7IGFwcHMgfSA9IHN0b3JlVG9SZWZzKGFwcHNTdG9yZSk7XG5jb25zdCB7IHNlc3Npb25zIH0gPSBzdG9yZVRvUmVmcyhhdXRoU3RvcmUpO1xuY29uc3Qgc2V0dXBTdGF0dXMgPSByZWY8U2V0dXBTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpO1xuXG5vbk1vdW50ZWQoKCkgPT4ge1xuICB2b2lkIGFwcHNTdG9yZS5sb2FkQXBwcyhmYWxzZSk7XG4gIHZvaWQgYXV0aFN0b3JlLmZldGNoU2Vzc2lvbnMoKTtcbiAgdm9pZCBsb2FkU2V0dXBTdGF0dXMoKTtcbn0pO1xuXG5hc3luYyBmdW5jdGlvbiBsb2FkU2V0dXBTdGF0dXMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgaHR0cC5nZXQ8U2V0dXBTdGF0dXNSZXNwb25zZT4oJy9hcGkvc2V0dXAvc3RhdHVzJywgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcbiAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhPy5zdGF0dXMpIHtcbiAgICAgIHNldHVwU3RhdHVzLnZhbHVlID0gcmVzLmRhdGE7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBzZXR1cFN0YXR1cy52YWx1ZSA9IG51bGw7XG4gIH1cbn1cblxuY29uc3QgZmFsbGJhY2tQYWlyZWRDbGllbnRDb3VudCA9IGNvbXB1dGVkKCgpID0+IHNlc3Npb25zLnZhbHVlLmxlbmd0aCk7XG5jb25zdCBmYWxsYmFja0Nvbm5lY3RlZFNvdXJjZUNvdW50ID0gY29tcHV0ZWQoKCkgPT4ge1xuICBjb25zdCBzb3VyY2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgYXBwIG9mIGFwcHMudmFsdWUpIHtcbiAgICBpZiAoYXBwWydwbGF5bml0ZS1pZCddKSBzb3VyY2VzLmFkZCgncGxheW5pdGVMZWdhY3knKTtcbiAgICBlbHNlIHNvdXJjZXMuYWRkKCdtYW51YWwnKTtcbiAgfVxuICByZXR1cm4gc291cmNlcy5zaXplO1xufSk7XG5jb25zdCBmYWxsYmFja1BsYXlhYmxlR2FtZUNvdW50ID0gY29tcHV0ZWQoKCkgPT4gYXBwcy52YWx1ZS5sZW5ndGgpO1xuXG5jb25zdCBwYWlyZWRDbGllbnRDb3VudCA9IGNvbXB1dGVkKCgpID0+IHNldHVwU3RhdHVzLnZhbHVlPy5wYWlyZWRDbGllbnRDb3VudCA/PyBmYWxsYmFja1BhaXJlZENsaWVudENvdW50LnZhbHVlKTtcbmNvbnN0IGNvbm5lY3RlZFNvdXJjZUNvdW50ID0gY29tcHV0ZWQoKCkgPT4gc2V0dXBTdGF0dXMudmFsdWU/LmNvbm5lY3RlZFNvdXJjZUNvdW50ID8/IGZhbGxiYWNrQ29ubmVjdGVkU291cmNlQ291bnQudmFsdWUpO1xuY29uc3QgcGxheWFibGVHYW1lQ291bnQgPSBjb21wdXRlZCgoKSA9PiBzZXR1cFN0YXR1cy52YWx1ZT8ucGxheWFibGVHYW1lQ291bnQgPz8gZmFsbGJhY2tQbGF5YWJsZUdhbWVDb3VudC52YWx1ZSk7XG5jb25zdCBzZXR1cENvbXBsZXRlID0gY29tcHV0ZWQoXG4gICgpID0+XG4gICAgc2V0dXBTdGF0dXMudmFsdWU/LnNldHVwQ29tcGxldGUgPz9cbiAgICAocGFpcmVkQ2xpZW50Q291bnQudmFsdWUgPiAwICYmXG4gICAgICBjb25uZWN0ZWRTb3VyY2VDb3VudC52YWx1ZSA+IDAgJiZcbiAgICAgIHBsYXlhYmxlR2FtZUNvdW50LnZhbHVlID4gMCksXG4pO1xuXG5jb25zdCBmYWxsYmFja1JlYWRpbmVzc0NoZWNrcyA9IGNvbXB1dGVkPFJlYWRpbmVzc0NoZWNrW10+KCgpID0+IFtcbiAge1xuICAgIGlkOiAnY2xpZW50JyxcbiAgICBsYWJlbDogJ0NsaWVudCBwYWlyZWQnLFxuICAgIHN0YXR1czogcGFpcmVkQ2xpZW50Q291bnQudmFsdWUgPiAwID8gJ3JlYWR5JyA6ICdwZW5kaW5nJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnZ2FtZScsXG4gICAgbGFiZWw6ICdQbGF5YWJsZSBnYW1lIGF2YWlsYWJsZScsXG4gICAgc3RhdHVzOiBwbGF5YWJsZUdhbWVDb3VudC52YWx1ZSA+IDAgPyAncmVhZHknIDogJ3BlbmRpbmcnLFxuICB9LFxuICB7IGlkOiAnZW5jb2RlcicsIGxhYmVsOiAnRW5jb2RlciByZWFkeScsIHN0YXR1czogJ3dhcm5pbmcnIH0sXG4gIHsgaWQ6ICdjYXB0dXJlJywgbGFiZWw6ICdEaXNwbGF5IGNhcHR1cmUgcmVhZHknLCBzdGF0dXM6ICd3YXJuaW5nJyB9LFxuICB7IGlkOiAnbmV0d29yaycsIGxhYmVsOiAnTmV0d29yayByZWFjaGFibGUnLCBzdGF0dXM6ICd3YXJuaW5nJyB9LFxuXSBzYXRpc2ZpZXMgUmVhZGluZXNzQ2hlY2tbXSk7XG5cbmNvbnN0IHJlYWRpbmVzc0NoZWNrcyA9IGNvbXB1dGVkKCgpID0+IHNldHVwU3RhdHVzLnZhbHVlPy5yZWFkaW5lc3M/LmNoZWNrcyA/PyBmYWxsYmFja1JlYWRpbmVzc0NoZWNrcy52YWx1ZSk7XG5cbmNvbnN0IGZhbGxiYWNrU2V0dXBTdGVwcyA9IGNvbXB1dGVkPFNldHVwU3RlcFtdPigoKSA9PiBbXG4gIHtcbiAgICBpZDogJ3BhaXInLFxuICAgIHRpdGxlOiAnUGFpciBhIGRldmljZScsXG4gICAgZGVzY3JpcHRpb246ICdDb25uZWN0IGEgSnVqbyBvciBNb29ubGlnaHQtY29tcGF0aWJsZSBjbGllbnQgdG8gdGhpcyBob3N0LicsXG4gICAgYWN0aW9uOiAnT3BlbiBQYWlyaW5nJyxcbiAgICBwYXRoOiAnL3BhaXJpbmcnLFxuICAgIGljb246ICdmYS1saW5rJyxcbiAgICBzdGF0dXM6IHBhaXJlZENsaWVudENvdW50LnZhbHVlID4gMCA/ICdyZWFkeScgOiAncGVuZGluZycsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3NvdXJjZXMnLFxuICAgIHRpdGxlOiAnQ29ubmVjdCBhIGxpYnJhcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2lnbiBpbiB0byBTdGVhbSwgRXBpYyBHYW1lcywgR09HLCBvciBYYm94LCBvciBhZGQgZ2FtZXMgbWFudWFsbHkuJyxcbiAgICBhY3Rpb246ICdPcGVuIEdhbWUgU291cmNlcycsXG4gICAgcGF0aDogJy9nYW1lLXNvdXJjZXMnLFxuICAgIGljb246ICdmYS1wbHVnJyxcbiAgICBzdGF0dXM6IGNvbm5lY3RlZFNvdXJjZUNvdW50LnZhbHVlID4gMCA/ICdyZWFkeScgOiAncGVuZGluZycsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3JlYWRpbmVzcycsXG4gICAgdGl0bGU6ICdWZXJpZnkgcmVhZGluZXNzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JldmlldyBlbmNvZGVyLCBkaXNwbGF5IGNhcHR1cmUsIG5ldHdvcmssIGFuZCBXaW5kb3dzLXNwZWNpZmljIGNoZWNrcy4nLFxuICAgIGFjdGlvbjogJ09wZW4gU3lzdGVtJyxcbiAgICBwYXRoOiAnL3N5c3RlbScsXG4gICAgaWNvbjogJ2ZhLXN0ZXRob3Njb3BlJyxcbiAgICBzdGF0dXM6IHNldHVwQ29tcGxldGUudmFsdWUgPyAncmVhZHknIDogJ3dhcm5pbmcnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdwbGF5JyxcbiAgICB0aXRsZTogJ1N0YXJ0IHN0cmVhbWluZycsXG4gICAgZGVzY3JpcHRpb246ICdPcGVuIHRoZSBsaWJyYXJ5IHdoZW4gYXQgbGVhc3Qgb25lIGdhbWUgaXMgcGxheWFibGUuJyxcbiAgICBhY3Rpb246ICdPcGVuIExpYnJhcnknLFxuICAgIHBhdGg6ICcvbGlicmFyeScsXG4gICAgaWNvbjogJ2ZhLXBsYXknLFxuICAgIHN0YXR1czogcGxheWFibGVHYW1lQ291bnQudmFsdWUgPiAwID8gJ3JlYWR5JyA6ICdwZW5kaW5nJyxcbiAgfSxcbl0gc2F0aXNmaWVzIFNldHVwU3RlcFtdKTtcblxuY29uc3Qgc2V0dXBTdGVwcyA9IGNvbXB1dGVkKCgpID0+IHNldHVwU3RhdHVzLnZhbHVlPy5zdGVwcyA/PyBmYWxsYmFja1NldHVwU3RlcHMudmFsdWUpO1xuXG5jb25zdCBmZWF0dXJlZEFwcHMgPSBjb21wdXRlZDxBcHBbXT4oKCkgPT4gYXBwcy52YWx1ZS5zbGljZSgwLCA0KSk7XG5cbmZ1bmN0aW9uIGFwcEtleShhcHA6IEFwcCwgaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBhcHAudXVpZCB8fCBhcHAubmFtZSB8fCBgYXBwLSR7aW5kZXh9YDtcbn1cblxuZnVuY3Rpb24gc3RhdHVzSWNvbihzdGF0dXM6IFNldHVwU3RhdHVzKTogc3RyaW5nIHtcbiAgaWYgKHN0YXR1cyA9PT0gJ3JlYWR5JykgcmV0dXJuICdmYS1jaGVjay1jaXJjbGUnO1xuICBpZiAoc3RhdHVzID09PSAnd2FybmluZycpIHJldHVybiAnZmEtZXhjbGFtYXRpb24tdHJpYW5nbGUnO1xuICByZXR1cm4gJ2ZhLWNpcmNsZS1pbmZvJztcbn1cblxuZnVuY3Rpb24gc3RhdHVzTGFiZWwoc3RhdHVzOiBTZXR1cFN0YXR1cyk6IHN0cmluZyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAnUmVhZHknO1xuICBpZiAoc3RhdHVzID09PSAnd2FybmluZycpIHJldHVybiAnUmV2aWV3JztcbiAgcmV0dXJuICdOb3Qgc2V0Jztcbn1cblxuZnVuY3Rpb24gdGFnVHlwZShzdGF0dXM6IFNldHVwU3RhdHVzKTogJ3N1Y2Nlc3MnIHwgJ3dhcm5pbmcnIHwgJ2luZm8nIHtcbiAgaWYgKHN0YXR1cyA9PT0gJ3JlYWR5JykgcmV0dXJuICdzdWNjZXNzJztcbiAgaWYgKHN0YXR1cyA9PT0gJ3dhcm5pbmcnKSByZXR1cm4gJ3dhcm5pbmcnO1xuICByZXR1cm4gJ2luZm8nO1xufVxuXG5mdW5jdGlvbiBzdGF0dXNDbGFzcyhzdGF0dXM6IFNldHVwU3RhdHVzKTogc3RyaW5nIHtcbiAgaWYgKHN0YXR1cyA9PT0gJ3JlYWR5JykgcmV0dXJuICdiZy1zdWNjZXNzLzEyIHRleHQtc3VjY2Vzcyc7XG4gIGlmIChzdGF0dXMgPT09ICd3YXJuaW5nJykgcmV0dXJuICdiZy13YXJuaW5nLzE0IHRleHQtd2FybmluZyc7XG4gIHJldHVybiAnYmctcHJpbWFyeS8xMCB0ZXh0LXByaW1hcnknO1xufVxuXG5mdW5jdGlvbiBzdGF0dXNUZXh0Q2xhc3Moc3RhdHVzOiBTZXR1cFN0YXR1cyk6IHN0cmluZyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAndGV4dC1zdWNjZXNzJztcbiAgaWYgKHN0YXR1cyA9PT0gJ3dhcm5pbmcnKSByZXR1cm4gJ3RleHQtd2FybmluZyc7XG4gIHJldHVybiAndGV4dC1wcmltYXJ5Jztcbn1cbjwvc2NyaXB0PlxuXG48c3R5bGUgc2NvcGVkPlxuLm1ldHJpYy10aWxlLFxuLmxpYnJhcnktc2hvcnRjdXQsXG4ucXVpY2stY2FyZCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMDgpO1xuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC40OCk7XG59XG5cbi5kYXJrIC5tZXRyaWMtdGlsZSxcbi5kYXJrIC5saWJyYXJ5LXNob3J0Y3V0LFxuLmRhcmsgLnF1aWNrLWNhcmQge1xuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjEpO1xuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjI0KTtcbn1cblxuLm1ldHJpYy10aWxlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgbWluLXdpZHRoOiA1cmVtO1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDAuMXJlbTtcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xuICBwYWRkaW5nOiAwLjc1cmVtIDAuOXJlbTtcbn1cblxuLm1ldHJpYy12YWx1ZSB7XG4gIGZvbnQtc2l6ZTogMS4zNXJlbTtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgbGluZS1oZWlnaHQ6IDE7XG59XG5cbi5tZXRyaWMtbGFiZWwge1xuICBmb250LXNpemU6IDAuNzJyZW07XG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjYyKTtcbn1cblxuLmRhcmsgLm1ldHJpYy1sYWJlbCB7XG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC42Mik7XG59XG5cbi5zZXR1cC1zdGVwLFxuLmxpYnJhcnktc2hvcnRjdXQsXG4ucmVhZGluZXNzLXJvdyxcbi5xdWljay1jYXJkIHtcbiAgdHJhbnNpdGlvbjpcbiAgICBib3JkZXItY29sb3IgMTUwbXMgZWFzZSxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yIDE1MG1zIGVhc2UsXG4gICAgdHJhbnNmb3JtIDE1MG1zIGVhc2U7XG59XG5cbi5zZXR1cC1zdGVwOmhvdmVyLFxuLmxpYnJhcnktc2hvcnRjdXQ6aG92ZXIsXG4ucXVpY2stY2FyZDpob3ZlciB7XG4gIGJvcmRlci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4yNik7XG59XG5cbi5zdGF0dXMtaWNvbiB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBoZWlnaHQ6IDIuNXJlbTtcbiAgd2lkdGg6IDIuNXJlbTtcbiAgZmxleC1zaHJpbms6IDA7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBib3JkZXItcmFkaXVzOiAwLjVyZW07XG59XG5cbi5saWJyYXJ5LXNob3J0Y3V0LFxuLnJlYWRpbmVzcy1yb3csXG4ucXVpY2stY2FyZCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1pbi13aWR0aDogMDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjc1cmVtO1xuICBib3JkZXItcmFkaXVzOiAwLjVyZW07XG4gIHBhZGRpbmc6IDAuODVyZW0gMC45NXJlbTtcbn1cblxuLnF1aWNrLWNhcmQge1xuICBjb2xvcjogaW5oZXJpdDtcbiAgZm9udC1zaXplOiAwLjlyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbn1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOlsiX29wZW5CbG9jayIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX3RvRGlzcGxheVN0cmluZyIsIl9GcmFnbWVudCIsIl9yZW5kZXJMaXN0IiwiX25vcm1hbGl6ZUNsYXNzIiwiX2NyZWF0ZVZOb2RlIiwiX3VucmVmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtLQSxVQUFNLFlBQVk7QUFDbEIsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sRUFBRSxLQUFBLElBQVMsWUFBWSxTQUFTO0FBQ3RDLFVBQU0sRUFBRSxTQUFBLElBQWEsWUFBWSxTQUFTO0FBQ3BDLFVBQUEsY0FBYyxJQUFnQyxJQUFJO0FBRXhELGNBQVUsTUFBTTtBQUNULFdBQUEsVUFBVSxTQUFTLEtBQUs7QUFDN0IsV0FBSyxVQUFVO0FBQ2YsV0FBSyxnQkFBZ0I7QUFBQSxJQUFBLENBQ3RCO0FBRUQsbUJBQWUsa0JBQWtCOztBQUMzQixVQUFBO0FBQ0ksY0FBQSxNQUFNLE1BQU0sS0FBSyxJQUF5QixxQkFBcUIsRUFBRSxnQkFBZ0IsTUFBTSxLQUFB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
