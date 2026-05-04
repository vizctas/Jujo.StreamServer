import { b as useAppsStore, u as useConfigStore, a as useAuthStore, h as http, c as __vitePreload, _ as _export_sfc } from "./index-f3a48eb0.js";
import { k as defineComponent, $ as storeToRefs, a5 as useRouter, _ as useRoute, R as useI18n, r as ref, c as computed, o as onMounted, O as createElementBlock, V as createBaseVNode, W as createCommentVNode, F as Fragment, M as createBlock, S as withCtx, Z as unref, U as createVNode, a1 as renderList, a8 as createStaticVNode, Q as openBlock, j as createTextVNode, P as toDisplayString, Y as withKeys, X as withModifiers, a9 as defineAsyncComponent } from "./vue-core-de07660f.js";
import { aq as NButton, av as NDropdown, aE as NTag } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "max-w-5xl mx-auto px-4 py-6 space-y-4 sm:px-6 sm:py-8 sm:space-y-5" };
const _hoisted_2 = { class: "flex flex-col gap-3 rounded-2xl border border-dark/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-light/10 dark:bg-surface/70 sm:flex-row sm:items-center sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none" };
const _hoisted_3 = { class: "flex items-center gap-2 sm:flex-wrap sm:justify-end sm:gap-4" };
const _hoisted_4 = { class: "rounded-2xl overflow-hidden border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-surface/80 backdrop-blur" };
const _hoisted_5 = {
  key: 0,
  class: "divide-y divide-black/5 dark:divide-white/10"
};
const _hoisted_6 = ["aria-label", "onClick", "onKeydown"];
const _hoisted_7 = { class: "flex items-center justify-between px-6 py-4 min-h-[56px] hover:bg-dark/10 dark:hover:bg-light/10" };
const _hoisted_8 = { class: "min-w-0 flex-1" };
const _hoisted_9 = { class: "text-sm font-semibold truncate flex items-center gap-2" };
const _hoisted_10 = { class: "truncate" };
const _hoisted_11 = {
  key: 0,
  class: "text-[10px] opacity-70"
};
const _hoisted_12 = {
  key: 1,
  class: "text-[10px] opacity-70"
};
const _hoisted_13 = {
  key: 2,
  class: "text-[10px] opacity-70"
};
const _hoisted_14 = {
  key: 0,
  class: "mt-0.5 text-xs opacity-80 truncate"
};
const _hoisted_15 = {
  key: 1,
  class: "flex flex-col items-center gap-4 px-8 py-14 text-center"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ApplicationsView",
  setup(__props) {
    const AppEditModal = defineAsyncComponent(() => __vitePreload(() => import("./AppEditModal-d131fc18.js"), true ? ["./AppEditModal-d131fc18.js","./vue-core-de07660f.js","./index-f3a48eb0.js","./vendor-33781bfc.js","./index-d04f0b18.css","./AppEditConfigOverridesSection-b39bbf4d.js","./ConfigFieldRenderer-f2409336.js","./AppEditConfigOverridesSection-2bbd0409.css","./AppEditModal-ce68b797.css"] : void 0, import.meta.url));
    const appsStore = useAppsStore();
    const { apps } = storeToRefs(appsStore);
    const configStore = useConfigStore();
    const auth = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const syncBusy = ref(false);
    const isWindows = computed(
      () => {
        var _a;
        return (((_a = configStore.metadata) == null ? void 0 : _a.platform) || "").toLowerCase() === "windows";
      }
    );
    const playniteInstalled = ref(false);
    const playniteStatusReady = ref(false);
    const playniteEnabled = computed(() => playniteInstalled.value);
    const showModal = ref(false);
    const modalKey = ref(0);
    const currentApp = ref(null);
    const currentIndex = ref(-1);
    async function reload() {
      await appsStore.loadApps(true);
    }
    function openAdd() {
      currentApp.value = null;
      currentIndex.value = -1;
      showModal.value = true;
    }
    function openEdit(app, i) {
      currentApp.value = app;
      currentIndex.value = i;
      showModal.value = true;
    }
    function appKey(app, index) {
      const id = (app == null ? void 0 : app.uuid) || "";
      return `${(app == null ? void 0 : app.name) || "app"}|${id}|${index}`;
    }
    async function forceSync() {
      syncBusy.value = true;
      try {
        await http.post("./api/playnite/force_sync", {}, { validateStatus: () => true });
        await reload();
      } catch {
      } finally {
        syncBusy.value = false;
      }
    }
    function gotoPlaynite() {
      try {
        router.push({ path: "/settings", query: { sec: "playnite" } });
      } catch {
      }
    }
    async function fetchPlayniteStatus() {
      if (!auth.isAuthenticated)
        return;
      try {
        const r = await http.get("/api/playnite/status", { validateStatus: () => true });
        if (r.status === 200 && r.data && typeof r.data === "object" && r.data !== null && "installed" in r.data) {
          const data = r.data;
          playniteInstalled.value = data.installed === true || data.active === true;
        }
      } catch {
      } finally {
        playniteStatusReady.value = true;
      }
    }
    onMounted(async () => {
      var _a;
      try {
        await ((_a = configStore.fetchConfig) == null ? void 0 : _a.call(configStore));
      } catch {
      }
      if (auth.isAuthenticated) {
        void fetchPlayniteStatus();
      } else {
        playniteStatusReady.value = false;
      }
      try {
        await appsStore.loadApps(true);
      } catch {
      }
      if (route.query["add"] === "1") {
        openAdd();
      }
    });
    auth.onLogin(() => {
      playniteStatusReady.value = false;
      void fetchPlayniteStatus();
    });
    const mobileOverflowOptions = computed(() => {
      if (!isWindows.value)
        return [];
      if (playniteEnabled.value) {
        return [
          {
            label: syncBusy.value ? "Syncing…" : t("playnite.force_sync") || "Force Sync",
            key: "force-sync",
            disabled: syncBusy.value
          }
        ];
      }
      return [
        {
          label: t("playnite.setup_integration") || "Setup Playnite",
          key: "setup-playnite"
        }
      ];
    });
    function handleMobileOverflow(key) {
      if (key === "force-sync")
        void forceSync();
      else if (key === "setup-playnite")
        gotoPlaynite();
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[5] || (_cache[5] = createBaseVNode(
            "div",
            { class: "min-w-0 space-y-1" },
            [
              createBaseVNode("h2", { class: "text-base font-semibold text-dark dark:text-light" }, " Applications "),
              createBaseVNode("p", { class: "text-xs leading-relaxed opacity-65 sm:hidden" }, " Add manual apps or connect Playnite to keep your library ready for streaming. ")
            ],
            -1
            /* CACHED */
          )),
          createBaseVNode("div", _hoisted_3, [
            createCommentVNode(" Desktop: all actions visible "),
            isWindows.value ? (openBlock(), createElementBlock(
              Fragment,
              { key: 0 },
              [
                playniteEnabled.value ? (openBlock(), createBlock(unref(NButton), {
                  key: 0,
                  size: "medium",
                  type: "default",
                  strong: "",
                  class: "hidden sm:inline-flex h-10 rounded-md px-3",
                  loading: syncBusy.value,
                  disabled: syncBusy.value,
                  onClick: forceSync,
                  "aria-label": "Force sync now"
                }, {
                  default: withCtx(() => [
                    _cache[1] || (_cache[1] = createBaseVNode(
                      "svg",
                      {
                        class: "mr-2 h-4 w-4 shrink-0",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor"
                      },
                      [
                        createBaseVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "1.6",
                          d: "M21 12a9 9 0 11-3.2-6.6M21 3v6h-6"
                        })
                      ],
                      -1
                      /* CACHED */
                    )),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("playnite.force_sync") || "Force Sync"),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1,
                  __: [1]
                }, 8, ["loading", "disabled"])) : (openBlock(), createBlock(unref(NButton), {
                  key: 1,
                  size: "medium",
                  type: "default",
                  strong: "",
                  class: "hidden sm:inline-flex h-10 rounded-md px-3",
                  onClick: gotoPlaynite
                }, {
                  default: withCtx(() => [
                    _cache[2] || (_cache[2] = createBaseVNode(
                      "svg",
                      {
                        class: "mr-2 h-4 w-4 shrink-0",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor"
                      },
                      [
                        createBaseVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "1.6",
                          d: "M12 3v3m0 12v3m9-9h-3M6 12H3m13.95 5.657l-2.121-2.121M8.172 8.172 6.05 6.05m11.9 0-2.121 2.121M8.172 15.828 6.05 17.95"
                        })
                      ],
                      -1
                      /* CACHED */
                    )),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("playnite.setup_integration") || "Setup Playnite"),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1,
                  __: [2]
                }))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : createCommentVNode("v-if", true),
            createCommentVNode(" Primary: Add (always visible) "),
            createVNode(unref(NButton), {
              type: "primary",
              size: "medium",
              strong: "",
              class: "h-10 rounded-md px-4",
              onClick: openAdd
            }, {
              default: withCtx(() => _cache[3] || (_cache[3] = [
                createBaseVNode(
                  "svg",
                  {
                    class: "mr-1.5 h-4 w-4 shrink-0",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor"
                  },
                  [
                    createBaseVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "1.6",
                      d: "M12 5v14M5 12h14"
                    })
                  ],
                  -1
                  /* CACHED */
                ),
                createTextVNode(
                  " Add ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [3]
            }),
            createCommentVNode(" Mobile overflow: secondary actions in dropdown "),
            isWindows.value ? (openBlock(), createBlock(unref(NDropdown), {
              key: 1,
              trigger: "click",
              placement: "bottom-end",
              class: "sm:hidden",
              options: mobileOverflowOptions.value,
              onSelect: handleMobileOverflow
            }, {
              default: withCtx(() => [
                createVNode(unref(NButton), {
                  size: "medium",
                  type: "default",
                  class: "sm:hidden h-10 w-10 rounded-md px-0",
                  "aria-label": "More actions"
                }, {
                  default: withCtx(() => _cache[4] || (_cache[4] = [
                    createBaseVNode(
                      "svg",
                      {
                        class: "h-4 w-4",
                        viewBox: "0 0 24 24",
                        fill: "currentColor",
                        "aria-hidden": ""
                      },
                      [
                        createBaseVNode("circle", {
                          cx: "5",
                          cy: "12",
                          r: "1.5"
                        }),
                        createBaseVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "1.5"
                        }),
                        createBaseVNode("circle", {
                          cx: "19",
                          cy: "12",
                          r: "1.5"
                        })
                      ],
                      -1
                      /* CACHED */
                    )
                  ])),
                  _: 1,
                  __: [4]
                })
              ]),
              _: 1
              /* STABLE */
            }, 8, ["options"])) : createCommentVNode("v-if", true)
          ])
        ]),
        createCommentVNode(" Redesigned list view "),
        createBaseVNode("div", _hoisted_4, [
          unref(apps) && unref(apps).length ? (openBlock(), createElementBlock("div", _hoisted_5, [
            (openBlock(true), createElementBlock(
              Fragment,
              null,
              renderList(unref(apps), (app, i) => {
                return openBlock(), createElementBlock("button", {
                  key: appKey(app, i),
                  type: "button",
                  class: "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  "aria-label": "Edit " + (app.name || "application"),
                  onClick: ($event) => openEdit(app, i),
                  onKeydown: [
                    withKeys(withModifiers(($event) => openEdit(app, i), ["prevent"]), ["enter"]),
                    withKeys(withModifiers(($event) => openEdit(app, i), ["prevent"]), ["space"])
                  ]
                }, [
                  createBaseVNode("div", _hoisted_7, [
                    createBaseVNode("div", _hoisted_8, [
                      createBaseVNode("div", _hoisted_9, [
                        createBaseVNode(
                          "span",
                          _hoisted_10,
                          toDisplayString(app.name || "(untitled)"),
                          1
                          /* TEXT */
                        ),
                        createCommentVNode(" Playnite or Custom badges "),
                        app["playnite-id"] ? (openBlock(), createElementBlock(
                          Fragment,
                          { key: 0 },
                          [
                            createVNode(unref(NTag), {
                              size: "small",
                              class: "!px-2 !py-0.5 text-xs bg-slate-700 border-none text-slate-200"
                            }, {
                              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                                createTextVNode(
                                  "Playnite",
                                  -1
                                  /* CACHED */
                                )
                              ])]),
                              _: 1,
                              __: [6]
                            }),
                            app["playnite-managed"] === "manual" ? (openBlock(), createElementBlock("span", _hoisted_11, "manual")) : app["playnite-source"] ? (openBlock(), createElementBlock(
                              "span",
                              _hoisted_12,
                              toDisplayString(String(app["playnite-source"]).split("+").join(" + ")),
                              1
                              /* TEXT */
                            )) : (openBlock(), createElementBlock("span", _hoisted_13, "managed"))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : (openBlock(), createBlock(unref(NTag), {
                          key: 1,
                          size: "small",
                          class: "!px-2 !py-0.5 text-xs bg-slate-700/70 border-none text-slate-200"
                        }, {
                          default: withCtx(() => [..._cache[7] || (_cache[7] = [
                            createTextVNode(
                              "Custom",
                              -1
                              /* CACHED */
                            )
                          ])]),
                          _: 1,
                          __: [7]
                        }))
                      ]),
                      app["working-dir"] ? (openBlock(), createElementBlock(
                        "div",
                        _hoisted_14,
                        toDisplayString(app["working-dir"]),
                        1
                        /* TEXT */
                      )) : createCommentVNode("v-if", true)
                    ]),
                    _cache[8] || (_cache[8] = createBaseVNode(
                      "div",
                      { class: "shrink-0 text-dark/50 dark:text-light/70" },
                      [
                        createBaseVNode("svg", {
                          class: "w-4 h-4",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          "aria-hidden": ""
                        }, [
                          createBaseVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "1.6",
                            d: "M9 6l6 6-6 6"
                          })
                        ])
                      ],
                      -1
                      /* CACHED */
                    ))
                  ])
                ], 40, _hoisted_6);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (openBlock(), createElementBlock("div", _hoisted_15, [
            createCommentVNode(" Empty state illustration "),
            _cache[10] || (_cache[10] = createStaticVNode('<div class="rounded-2xl bg-primary/8 dark:bg-primary/12 p-5 mb-1" data-v-26ab996d><svg class="w-10 h-10 text-primary opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden data-v-26ab996d><rect x="3" y="3" width="18" height="14" rx="3" stroke-width="1.5" data-v-26ab996d></rect><path d="M7 21h10M12 17v4" stroke-width="1.5" stroke-linecap="round" data-v-26ab996d></path><path d="M12 8v4m-2-2h4" stroke-width="1.75" stroke-linecap="round" data-v-26ab996d></path></svg></div><div class="space-y-1.5 max-w-xs" data-v-26ab996d><p class="text-sm font-semibold text-dark dark:text-light" data-v-26ab996d>No applications yet</p><p class="text-xs leading-relaxed opacity-60" data-v-26ab996d> Add a custom app or connect Playnite to build your streaming library. </p></div>', 2)),
            createVNode(unref(NButton), {
              type: "primary",
              size: "medium",
              strong: "",
              class: "mt-2 rounded-xl",
              onClick: openAdd
            }, {
              default: withCtx(() => _cache[9] || (_cache[9] = [
                createBaseVNode(
                  "svg",
                  {
                    class: "w-4 h-4 mr-1.5",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "aria-hidden": ""
                  },
                  [
                    createBaseVNode("path", {
                      d: "M12 5v14M5 12h14",
                      "stroke-width": "2",
                      "stroke-linecap": "round"
                    })
                  ],
                  -1
                  /* CACHED */
                ),
                createTextVNode(
                  " Add Application ",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [9]
            })
          ]))
        ]),
        (openBlock(), createBlock(unref(AppEditModal), {
          modelValue: showModal.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => showModal.value = $event),
          app: currentApp.value,
          index: currentIndex.value,
          key: modalKey.value + "|" + (currentIndex.value ?? -1) + "|" + (((_a = currentApp.value) == null ? void 0 : _a.uuid) || ((_b = currentApp.value) == null ? void 0 : _b.name) || "new"),
          onSaved: reload,
          onDeleted: reload
        }, null, 8, ["modelValue", "app", "index"])),
        createCommentVNode(" Playnite integration removed for now ")
      ]);
    };
  }
});
const ApplicationsView_vue_vue_type_style_index_0_scoped_26ab996d_lang = "";
const ApplicationsView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-26ab996d"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/ApplicationsView.vue"]]);
export {
  ApplicationsView as default
};


//# sourceMappingURL=data:application/json;base64,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LFNBQVE7QUFBQSwwQkFDUixNQUFLO0FBQUEsMEJBQ0wsUUFBTztBQUFBLDBCQUNQO0FBQUE7MEJBRUFBLGdCQUtFO0FBQUEsNEJBSkEsa0JBQWU7QUFBQSw0QkFDZixtQkFBZ0I7QUFBQSw0QkFDaEIsZ0JBQWE7QUFBQSw0QkFDYixHQUFFO0FBQUE7Ozs7Ozs7Ozs7OztpQkFPZEYsVUFBQSxHQUFBQyxtQkFxQk0sT0FyQk4sYUFxQk07QUFBQSxZQXBCSkUsbUJBQWlDO0FBQUE7WUFjakNNLFlBS1dILE1BQUE7QUFBQSxjQUxELE1BQUs7QUFBQSxjQUFVLE1BQUs7QUFBQSxjQUFTO0FBQUEsY0FBTyxPQUFNO0FBQUEsY0FBbUIsU0FBTztBQUFBOytCQUM1RSxNQUVNO0FBQUEsZ0JBRk5KO0FBQUFBLGtCQUVNO0FBQUE7QUFBQSxvQkFGRCxPQUFNO0FBQUEsb0JBQWlCLFNBQVE7QUFBQSxvQkFBWSxNQUFLO0FBQUEsb0JBQU8sUUFBTztBQUFBLG9CQUFlO0FBQUE7O29CQUNoRkEsZ0JBQW9FO0FBQUEsc0JBQTlELEdBQUU7QUFBQSxzQkFBbUIsZ0JBQWE7QUFBQSxzQkFBSSxrQkFBZTtBQUFBOzs7Ozs7a0JBQ3ZEO0FBQUEsa0JBRVI7QUFBQTtBQUFBO0FBQUE7Ozs7OztzQkFJSkcsWUFhRUMsTUFBQTtBQUFBLHNCQVpTLFVBQVM7QUFBQSx1RUFBVCxVQUFTO0FBQUEsVUFDakIsS0FBSyxXQUFVO0FBQUEsVUFDZixPQUFPLGFBQVk7QUFBQSxVQUNuQixLQUFlLFNBQVEsZUFBNEIsYUFBWSx3QkFBbUMsNkNBQVksV0FBUSw2Q0FBWSxTQUFJO0FBQUEsVUFPdEksU0FBTztBQUFBLFVBQ1AsV0FBUztBQUFBO1FBRVpILG1CQUE2QztBQUFBIiwibmFtZXMiOlsiX29wZW5CbG9jayIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2NyZWF0ZUNvbW1lbnRWTm9kZSIsIl9GcmFnbWVudCIsIl9jcmVhdGVCbG9jayIsIl91bnJlZiIsIl9jcmVhdGVUZXh0Vk5vZGUiLCIkdCIsIl9jcmVhdGVWTm9kZSIsIl9yZW5kZXJMaXN0IiwiX3RvRGlzcGxheVN0cmluZyJdLCJzb3VyY2VzIjpbIi4uLy4uL3ZpZXdzL0FwcGxpY2F0aW9uc1ZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwibWF4LXctNXhsIG14LWF1dG8gcHgtNCBweS02IHNwYWNlLXktNCBzbTpweC02IHNtOnB5LTggc206c3BhY2UteS01XCI+XHJcbiAgICA8ZGl2XHJcbiAgICAgIGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMyByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWRhcmsvMTAgYmctd2hpdGUvNzUgcC00IHNoYWRvdy1zbSBiYWNrZHJvcC1ibHVyIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGRhcms6Ymctc3VyZmFjZS83MCBzbTpmbGV4LXJvdyBzbTppdGVtcy1jZW50ZXIgc206anVzdGlmeS1iZXR3ZWVuIHNtOnJvdW5kZWQtbm9uZSBzbTpib3JkZXItMCBzbTpiZy10cmFuc3BhcmVudCBzbTpwLTAgc206c2hhZG93LW5vbmUgc206YmFja2Ryb3AtYmx1ci1ub25lXCJcclxuICAgID5cclxuICAgICAgPGRpdiBjbGFzcz1cIm1pbi13LTAgc3BhY2UteS0xXCI+XHJcbiAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlxyXG4gICAgICAgICAgQXBwbGljYXRpb25zXHJcbiAgICAgICAgPC9oMj5cclxuICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgbGVhZGluZy1yZWxheGVkIG9wYWNpdHktNjUgc206aGlkZGVuXCI+XHJcbiAgICAgICAgICBBZGQgbWFudWFsIGFwcHMgb3IgY29ubmVjdCBQbGF5bml0ZSB0byBrZWVwIHlvdXIgbGlicmFyeSByZWFkeSBmb3Igc3RyZWFtaW5nLlxyXG4gICAgICAgIDwvcD5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgc206ZmxleC13cmFwIHNtOmp1c3RpZnktZW5kIHNtOmdhcC00XCI+XHJcbiAgICAgICAgPCEtLSBEZXNrdG9wOiBhbGwgYWN0aW9ucyB2aXNpYmxlIC0tPlxyXG4gICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwiaXNXaW5kb3dzXCIgY2xhc3M9XCJoaWRkZW4gc206Y29udGVudHNcIj5cclxuICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICB2LWlmPVwicGxheW5pdGVFbmFibGVkXCJcclxuICAgICAgICAgICAgc2l6ZT1cIm1lZGl1bVwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgIGNsYXNzPVwiaGlkZGVuIHNtOmlubGluZS1mbGV4IGgtMTAgcm91bmRlZC1tZCBweC0zXCJcclxuICAgICAgICAgICAgOmxvYWRpbmc9XCJzeW5jQnVzeVwiXHJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cInN5bmNCdXN5XCJcclxuICAgICAgICAgICAgQGNsaWNrPVwiZm9yY2VTeW5jXCJcclxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIkZvcmNlIHN5bmMgbm93XCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIm1yLTIgaC00IHctNCBzaHJpbmstMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiPlxyXG4gICAgICAgICAgICAgIDxwYXRoIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZS13aWR0aD1cIjEuNlwiIGQ9XCJNMjEgMTJhOSA5IDAgMTEtMy4yLTYuNk0yMSAzdjZoLTZcIiAvPlxyXG4gICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAge3sgJHQoJ3BsYXluaXRlLmZvcmNlX3N5bmMnKSB8fCAnRm9yY2UgU3luYycgfX1cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgdi1lbHNlXHJcbiAgICAgICAgICAgIHNpemU9XCJtZWRpdW1cIlxyXG4gICAgICAgICAgICB0eXBlPVwiZGVmYXVsdFwiXHJcbiAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICBjbGFzcz1cImhpZGRlbiBzbTppbmxpbmUtZmxleCBoLTEwIHJvdW5kZWQtbWQgcHgtM1wiXHJcbiAgICAgICAgICAgIEBjbGljaz1cImdvdG9QbGF5bml0ZVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJtci0yIGgtNCB3LTQgc2hyaW5rLTBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIj5cclxuICAgICAgICAgICAgICA8cGF0aCBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIiBzdHJva2Utd2lkdGg9XCIxLjZcIiBkPVwiTTEyIDN2M20wIDEydjNtOS05aC0zTTYgMTJIM20xMy45NSA1LjY1N2wtMi4xMjEtMi4xMjFNOC4xNzIgOC4xNzIgNi4wNSA2LjA1bTExLjkgMC0yLjEyMSAyLjEyMU04LjE3MiAxNS44MjggNi4wNSAxNy45NVwiIC8+XHJcbiAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICB7eyAkdCgncGxheW5pdGUuc2V0dXBfaW50ZWdyYXRpb24nKSB8fCAnU2V0dXAgUGxheW5pdGUnIH19XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcblxyXG4gICAgICAgIDwhLS0gUHJpbWFyeTogQWRkIChhbHdheXMgdmlzaWJsZSkgLS0+XHJcbiAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICB0eXBlPVwicHJpbWFyeVwiXHJcbiAgICAgICAgICBzaXplPVwibWVkaXVtXCJcclxuICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgY2xhc3M9XCJoLTEwIHJvdW5kZWQtbWQgcHgtNFwiXHJcbiAgICAgICAgICBAY2xpY2s9XCJvcGVuQWRkXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8c3ZnIGNsYXNzPVwibXItMS41IGgtNCB3LTQgc2hyaW5rLTBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIj5cclxuICAgICAgICAgICAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlLXdpZHRoPVwiMS42XCIgZD1cIk0xMiA1djE0TTUgMTJoMTRcIiAvPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICBBZGRcclxuICAgICAgICA8L24tYnV0dG9uPlxyXG5cclxuICAgICAgICA8IS0tIE1vYmlsZSBvdmVyZmxvdzogc2Vjb25kYXJ5IGFjdGlvbnMgaW4gZHJvcGRvd24gLS0+XHJcbiAgICAgICAgPG4tZHJvcGRvd25cclxuICAgICAgICAgIHYtaWY9XCJpc1dpbmRvd3NcIlxyXG4gICAgICAgICAgdHJpZ2dlcj1cImNsaWNrXCJcclxuICAgICAgICAgIHBsYWNlbWVudD1cImJvdHRvbS1lbmRcIlxyXG4gICAgICAgICAgY2xhc3M9XCJzbTpoaWRkZW5cIlxyXG4gICAgICAgICAgOm9wdGlvbnM9XCJtb2JpbGVPdmVyZmxvd09wdGlvbnNcIlxyXG4gICAgICAgICAgQHNlbGVjdD1cImhhbmRsZU1vYmlsZU92ZXJmbG93XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgc2l6ZT1cIm1lZGl1bVwiXHJcbiAgICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgICAgICAgICAgY2xhc3M9XCJzbTpoaWRkZW4gaC0xMCB3LTEwIHJvdW5kZWQtbWQgcHgtMFwiXHJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJNb3JlIGFjdGlvbnNcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaC00IHctNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgYXJpYS1oaWRkZW4+XHJcbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjVcIiBjeT1cIjEyXCIgcj1cIjEuNVwiLz48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEuNVwiLz48Y2lyY2xlIGN4PVwiMTlcIiBjeT1cIjEyXCIgcj1cIjEuNVwiLz5cclxuICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvbi1kcm9wZG93bj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuXHJcbiAgICA8IS0tIFJlZGVzaWduZWQgbGlzdCB2aWV3IC0tPlxyXG4gICAgPGRpdlxyXG4gICAgICBjbGFzcz1cInJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBib3JkZXIgYm9yZGVyLWRhcmsvMTAgZGFyazpib3JkZXItbGlnaHQvMTAgYmctbGlnaHQvODAgZGFyazpiZy1zdXJmYWNlLzgwIGJhY2tkcm9wLWJsdXJcIlxyXG4gICAgPlxyXG4gICAgICA8ZGl2IHYtaWY9XCJhcHBzICYmIGFwcHMubGVuZ3RoXCIgY2xhc3M9XCJkaXZpZGUteSBkaXZpZGUtYmxhY2svNSBkYXJrOmRpdmlkZS13aGl0ZS8xMFwiPlxyXG4gICAgICAgIDxidXR0b25cclxuICAgICAgICAgIHYtZm9yPVwiKGFwcCwgaSkgaW4gYXBwc1wiXHJcbiAgICAgICAgICA6a2V5PVwiYXBwS2V5KGFwcCwgaSlcIlxyXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICBjbGFzcz1cInctZnVsbCB0ZXh0LWxlZnQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzLXZpc2libGU6cmluZy0yIGZvY3VzLXZpc2libGU6cmluZy1wcmltYXJ5LzQwXCJcclxuICAgICAgICAgIDphcmlhLWxhYmVsPVwiJ0VkaXQgJyArIChhcHAubmFtZSB8fCAnYXBwbGljYXRpb24nKVwiXHJcbiAgICAgICAgICBAY2xpY2s9XCJvcGVuRWRpdChhcHAsIGkpXCJcclxuICAgICAgICAgIEBrZXlkb3duLmVudGVyLnByZXZlbnQ9XCJvcGVuRWRpdChhcHAsIGkpXCJcclxuICAgICAgICAgIEBrZXlkb3duLnNwYWNlLnByZXZlbnQ9XCJvcGVuRWRpdChhcHAsIGkpXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgIGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTYgcHktNCBtaW4taC1bNTZweF0gaG92ZXI6YmctZGFyay8xMCBkYXJrOmhvdmVyOmJnLWxpZ2h0LzEwXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1pbi13LTAgZmxleC0xXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0cnVuY2F0ZSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVuY2F0ZVwiPnt7IGFwcC5uYW1lIHx8ICcodW50aXRsZWQpJyB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwhLS0gUGxheW5pdGUgb3IgQ3VzdG9tIGJhZGdlcyAtLT5cclxuICAgICAgICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwiYXBwWydwbGF5bml0ZS1pZCddXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxuLXRhZ1xyXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCIhcHgtMiAhcHktMC41IHRleHQteHMgYmctc2xhdGUtNzAwIGJvcmRlci1ub25lIHRleHQtc2xhdGUtMjAwXCJcclxuICAgICAgICAgICAgICAgICAgICA+UGxheW5pdGU8L24tdGFnXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gdi1pZj1cImFwcFsncGxheW5pdGUtbWFuYWdlZCddID09PSAnbWFudWFsJ1wiIGNsYXNzPVwidGV4dC1bMTBweF0gb3BhY2l0eS03MFwiXHJcbiAgICAgICAgICAgICAgICAgICAgPm1hbnVhbDwvc3BhblxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHYtZWxzZS1pZj1cImFwcFsncGxheW5pdGUtc291cmNlJ11cIiBjbGFzcz1cInRleHQtWzEwcHhdIG9wYWNpdHktNzBcIj57e1xyXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZyhhcHBbJ3BsYXluaXRlLXNvdXJjZSddKS5zcGxpdCgnKycpLmpvaW4oJyArICcpXHJcbiAgICAgICAgICAgICAgICAgIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWVsc2UgY2xhc3M9XCJ0ZXh0LVsxMHB4XSBvcGFjaXR5LTcwXCI+bWFuYWdlZDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8dGVtcGxhdGUgdi1lbHNlPlxyXG4gICAgICAgICAgICAgICAgICA8bi10YWdcclxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiIXB4LTIgIXB5LTAuNSB0ZXh0LXhzIGJnLXNsYXRlLTcwMC83MCBib3JkZXItbm9uZSB0ZXh0LXNsYXRlLTIwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgPkN1c3RvbTwvbi10YWdcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMC41IHRleHQteHMgb3BhY2l0eS04MCB0cnVuY2F0ZVwiIHYtaWY9XCJhcHBbJ3dvcmtpbmctZGlyJ11cIj5cclxuICAgICAgICAgICAgICAgIHt7IGFwcFsnd29ya2luZy1kaXInXSB9fVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNocmluay0wIHRleHQtZGFyay81MCBkYXJrOnRleHQtbGlnaHQvNzBcIj5cclxuICAgICAgICAgICAgICA8c3ZnXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInctNCBoLTRcIlxyXG4gICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXHJcbiAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXHJcbiAgICAgICAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxyXG4gICAgICAgICAgICAgICAgYXJpYS1oaWRkZW5cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8cGF0aFxyXG4gICAgICAgICAgICAgICAgICBzdHJva2UtbGluZWNhcD1cInJvdW5kXCJcclxuICAgICAgICAgICAgICAgICAgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIlxyXG4gICAgICAgICAgICAgICAgICBzdHJva2Utd2lkdGg9XCIxLjZcIlxyXG4gICAgICAgICAgICAgICAgICBkPVwiTTkgNmw2IDYtNiA2XCJcclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC00IHB4LTggcHktMTQgdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICA8IS0tIEVtcHR5IHN0YXRlIGlsbHVzdHJhdGlvbiAtLT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicm91bmRlZC0yeGwgYmctcHJpbWFyeS84IGRhcms6YmctcHJpbWFyeS8xMiBwLTUgbWItMVwiPlxyXG4gICAgICAgICAgPHN2ZyBjbGFzcz1cInctMTAgaC0xMCB0ZXh0LXByaW1hcnkgb3BhY2l0eS03MFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIGFyaWEtaGlkZGVuPlxyXG4gICAgICAgICAgICA8cmVjdCB4PVwiM1wiIHk9XCIzXCIgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE0XCIgcng9XCIzXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIvPlxyXG4gICAgICAgICAgICA8cGF0aCBkPVwiTTcgMjFoMTBNMTIgMTd2NFwiIHN0cm9rZS13aWR0aD1cIjEuNVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgOHY0bS0yLTJoNFwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIvPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMS41IG1heC13LXhzXCI+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCI+Tm8gYXBwbGljYXRpb25zIHlldDwvcD5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBsZWFkaW5nLXJlbGF4ZWQgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICBBZGQgYSBjdXN0b20gYXBwIG9yIGNvbm5lY3QgUGxheW5pdGUgdG8gYnVpbGQgeW91ciBzdHJlYW1pbmcgbGlicmFyeS5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8bi1idXR0b24gdHlwZT1cInByaW1hcnlcIiBzaXplPVwibWVkaXVtXCIgc3Ryb25nIGNsYXNzPVwibXQtMiByb3VuZGVkLXhsXCIgQGNsaWNrPVwib3BlbkFkZFwiPlxyXG4gICAgICAgICAgPHN2ZyBjbGFzcz1cInctNCBoLTQgbXItMS41XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgYXJpYS1oaWRkZW4+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgNXYxNE01IDEyaDE0XCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIi8+XHJcbiAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgIEFkZCBBcHBsaWNhdGlvblxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcblxyXG4gICAgPEFwcEVkaXRNb2RhbFxyXG4gICAgICB2LW1vZGVsPVwic2hvd01vZGFsXCJcclxuICAgICAgOmFwcD1cImN1cnJlbnRBcHBcIlxyXG4gICAgICA6aW5kZXg9XCJjdXJyZW50SW5kZXhcIlxyXG4gICAgICA6a2V5PVwiXHJcbiAgICAgICAgbW9kYWxLZXkgK1xyXG4gICAgICAgICd8JyArXHJcbiAgICAgICAgKGN1cnJlbnRJbmRleCA/PyAtMSkgK1xyXG4gICAgICAgICd8JyArXHJcbiAgICAgICAgKGN1cnJlbnRBcHA/LnV1aWQgfHwgY3VycmVudEFwcD8ubmFtZSB8fCAnbmV3JylcclxuICAgICAgXCJcclxuICAgICAgQHNhdmVkPVwicmVsb2FkXCJcclxuICAgICAgQGRlbGV0ZWQ9XCJyZWxvYWRcIlxyXG4gICAgLz5cclxuICAgIDwhLS0gUGxheW5pdGUgaW50ZWdyYXRpb24gcmVtb3ZlZCBmb3Igbm93IC0tPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyByZWYsIG9uTW91bnRlZCwgY29tcHV0ZWQsIHdhdGNoLCBkZWZpbmVBc3luY0NvbXBvbmVudCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbi8vIExhenktbG9hZCB0aGUgbW9kYWwgd2hlbiBmaXJzdCBvcGVuZWRcclxuY29uc3QgQXBwRWRpdE1vZGFsID0gZGVmaW5lQXN5bmNDb21wb25lbnQoKCkgPT4gaW1wb3J0KCdAL2NvbXBvbmVudHMvQXBwRWRpdE1vZGFsLnZ1ZScpKTtcclxuaW1wb3J0IHsgdXNlQXBwc1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXBwcyc7XHJcbmltcG9ydCB7IHN0b3JlVG9SZWZzIH0gZnJvbSAncGluaWEnO1xyXG5pbXBvcnQgeyBOQnV0dG9uLCBOVGFnLCBORHJvcGRvd24gfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB0eXBlIHsgRHJvcGRvd25PcHRpb24gfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IHVzZUNvbmZpZ1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvY29uZmlnJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcbmltcG9ydCB7IHVzZVJvdXRlciwgdXNlUm91dGUgfSBmcm9tICd2dWUtcm91dGVyJztcclxuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XHJcbmltcG9ydCB0eXBlIHsgQXBwIH0gZnJvbSAnQC9zdG9yZXMvYXBwcyc7XHJcblxyXG4vLyBNaW5pbWFsIHNoYXBlIHVzZWQgZm9yIHJlbmRlcmluZyBpdGVtcyByZXR1cm5lZCBieSB0aGUgYmFja2VuZFxyXG4vLyBVc2Ugc2hhcmVkIEFwcCB0eXBlIGZyb20gc3RvcmUgZm9yIGNvbnNpc3RlbmN5XHJcblxyXG5jb25zdCBhcHBzU3RvcmUgPSB1c2VBcHBzU3RvcmUoKTtcclxuY29uc3QgeyBhcHBzIH0gPSBzdG9yZVRvUmVmcyhhcHBzU3RvcmUpO1xyXG5jb25zdCBjb25maWdTdG9yZSA9IHVzZUNvbmZpZ1N0b3JlKCk7XHJcbmNvbnN0IGF1dGggPSB1c2VBdXRoU3RvcmUoKTtcclxuY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XHJcbmNvbnN0IHJvdXRlID0gdXNlUm91dGUoKTtcclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcblxyXG5jb25zdCBzeW5jQnVzeSA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGlzV2luZG93cyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IChjb25maWdTdG9yZS5tZXRhZGF0YT8ucGxhdGZvcm0gfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09ICd3aW5kb3dzJyxcclxuKTtcclxuXHJcbmNvbnN0IHBsYXluaXRlSW5zdGFsbGVkID0gcmVmKGZhbHNlKTtcclxuY29uc3QgcGxheW5pdGVTdGF0dXNSZWFkeSA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHBsYXluaXRlRW5hYmxlZCA9IGNvbXB1dGVkKCgpID0+IHBsYXluaXRlSW5zdGFsbGVkLnZhbHVlKTtcclxuXHJcbmNvbnN0IHNob3dNb2RhbCA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IG1vZGFsS2V5ID0gcmVmKDApO1xyXG5jb25zdCBjdXJyZW50QXBwID0gcmVmPEFwcCB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBjdXJyZW50SW5kZXggPSByZWY8bnVtYmVyPigtMSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgYXdhaXQgYXBwc1N0b3JlLmxvYWRBcHBzKHRydWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvcGVuQWRkKCk6IHZvaWQge1xyXG4gIGN1cnJlbnRBcHAudmFsdWUgPSBudWxsO1xyXG4gIGN1cnJlbnRJbmRleC52YWx1ZSA9IC0xO1xyXG4gIHNob3dNb2RhbC52YWx1ZSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9wZW5FZGl0KGFwcDogQXBwLCBpOiBudW1iZXIpOiB2b2lkIHtcclxuICBjdXJyZW50QXBwLnZhbHVlID0gYXBwO1xyXG4gIGN1cnJlbnRJbmRleC52YWx1ZSA9IGk7XHJcbiAgc2hvd01vZGFsLnZhbHVlID0gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiBhcHBLZXkoYXBwOiBBcHAgfCBudWxsIHwgdW5kZWZpbmVkLCBpbmRleDogbnVtYmVyKSB7XHJcbiAgY29uc3QgaWQgPSBhcHA/LnV1aWQgfHwgJyc7XHJcbiAgcmV0dXJuIGAke2FwcD8ubmFtZSB8fCAnYXBwJ318JHtpZH18JHtpbmRleH1gO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmb3JjZVN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgc3luY0J1c3kudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBodHRwLnBvc3QoJy4vYXBpL3BsYXluaXRlL2ZvcmNlX3N5bmMnLCB7fSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGF3YWl0IHJlbG9hZCgpO1xyXG4gIH0gY2F0Y2gge1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzeW5jQnVzeS52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ290b1BsYXluaXRlKCk6IHZvaWQge1xyXG4gIHRyeSB7XHJcbiAgICByb3V0ZXIucHVzaCh7IHBhdGg6ICcvc2V0dGluZ3MnLCBxdWVyeTogeyBzZWM6ICdwbGF5bml0ZScgfSB9KTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8vIGlnbm9yZSBuYXZpZ2F0aW9uIGVycm9yc1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQbGF5bml0ZVN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAvLyBPbmx5IGF0dGVtcHQgd2hlbiBhdXRoZW50aWNhdGVkOyBodHRwIGxheWVyIGJsb2NrcyBvdGhlcndpc2VcclxuICBpZiAoIWF1dGguaXNBdXRoZW50aWNhdGVkKSByZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9wbGF5bml0ZS9zdGF0dXMnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgaWYgKFxyXG4gICAgICByLnN0YXR1cyA9PT0gMjAwICYmXHJcbiAgICAgIHIuZGF0YSAmJlxyXG4gICAgICB0eXBlb2Ygci5kYXRhID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICByLmRhdGEgIT09IG51bGwgJiZcclxuICAgICAgJ2luc3RhbGxlZCcgaW4gKHIuZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilcclxuICAgICkge1xyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICBjb25zdCBkYXRhID0gci5kYXRhIGFzIGFueTtcclxuICAgICAgcGxheW5pdGVJbnN0YWxsZWQudmFsdWUgPSBkYXRhLmluc3RhbGxlZCA9PT0gdHJ1ZSB8fCBkYXRhLmFjdGl2ZSA9PT0gdHJ1ZTtcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8vIGlnbm9yZTsgd2lsbCByZXRyeSBvbiBuZXh0IGF1dGggY2hhbmdlXHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHBsYXluaXRlU3RhdHVzUmVhZHkudmFsdWUgPSB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxub25Nb3VudGVkKGFzeW5jICgpID0+IHtcclxuICAvLyBFbnN1cmUgbWV0YWRhdGEvY29uZmlnIHByZXNlbnQgZm9yIHBsYXRmb3JtICsgcGxheW5pdGUgZGV0ZWN0aW9uXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGNvbmZpZ1N0b3JlLmZldGNoQ29uZmlnPy4oKTtcclxuICB9IGNhdGNoIHt9XHJcbiAgLy8gRGVmZXIgUGxheW5pdGUgc3RhdHVzIHVudGlsIGF1dGhlbnRpY2F0ZWQgdG8gYXZvaWQgNDAxL2NhbmNlbGVkIHJlcXVlc3RzXHJcbiAgaWYgKGF1dGguaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICB2b2lkIGZldGNoUGxheW5pdGVTdGF0dXMoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcGxheW5pdGVTdGF0dXNSZWFkeS52YWx1ZSA9IGZhbHNlOyAvLyBub3QgcmVhZHkgeWV0XHJcbiAgfVxyXG4gIC8vIEFsc28gbG9hZCBhcHBzIGxpc3QgKHNhZmUgaWYgYWxyZWFkeSBsb2FkZWQgYnkgYm9vdHN0cmFwKVxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhcHBzU3RvcmUubG9hZEFwcHModHJ1ZSk7XHJcbiAgfSBjYXRjaCB7fVxyXG4gIC8vIEF1dG8tb3BlbiBBZGQgbW9kYWwgd2hlbiBuYXZpZ2F0ZWQgaGVyZSB3aXRoID9hZGQ9MSAoZS5nLiBmcm9tIE1hbnVhbCBjYXJkKVxyXG4gIGlmIChyb3V0ZS5xdWVyeVsnYWRkJ10gPT09ICcxJykge1xyXG4gICAgb3BlbkFkZCgpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBXaGVuIHVzZXIgbG9ncyBpbiB3aGlsZSB0aGlzIHZpZXcgaXMgbW91bnRlZCwgcmVmcmVzaCBQbGF5bml0ZSBzdGF0dXNcclxuYXV0aC5vbkxvZ2luKCgpID0+IHtcclxuICBwbGF5bml0ZVN0YXR1c1JlYWR5LnZhbHVlID0gZmFsc2U7XHJcbiAgdm9pZCBmZXRjaFBsYXluaXRlU3RhdHVzKCk7XHJcbn0pO1xyXG5cclxuLy8gTW9iaWxlIG92ZXJmbG93IGRyb3Bkb3duIG9wdGlvbnNcclxuY29uc3QgbW9iaWxlT3ZlcmZsb3dPcHRpb25zID0gY29tcHV0ZWQ8RHJvcGRvd25PcHRpb25bXT4oKCkgPT4ge1xyXG4gIGlmICghaXNXaW5kb3dzLnZhbHVlKSByZXR1cm4gW107XHJcbiAgaWYgKHBsYXluaXRlRW5hYmxlZC52YWx1ZSkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAge1xyXG4gICAgICAgIGxhYmVsOiBzeW5jQnVzeS52YWx1ZSA/ICdTeW5jaW5n4oCmJyA6ICh0KCdwbGF5bml0ZS5mb3JjZV9zeW5jJykgfHwgJ0ZvcmNlIFN5bmMnKSxcclxuICAgICAgICBrZXk6ICdmb3JjZS1zeW5jJyxcclxuICAgICAgICBkaXNhYmxlZDogc3luY0J1c3kudmFsdWUsXHJcbiAgICAgIH0sXHJcbiAgICBdO1xyXG4gIH1cclxuICByZXR1cm4gW1xyXG4gICAge1xyXG4gICAgICBsYWJlbDogdCgncGxheW5pdGUuc2V0dXBfaW50ZWdyYXRpb24nKSB8fCAnU2V0dXAgUGxheW5pdGUnLFxyXG4gICAgICBrZXk6ICdzZXR1cC1wbGF5bml0ZScsXHJcbiAgICB9LFxyXG4gIF07XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlTW9iaWxlT3ZlcmZsb3coa2V5OiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZiAoa2V5ID09PSAnZm9yY2Utc3luYycpIHZvaWQgZm9yY2VTeW5jKCk7XHJcbiAgZWxzZSBpZiAoa2V5ID09PSAnc2V0dXAtcGxheW5pdGUnKSBnb3RvUGxheW5pdGUoKTtcclxufVxyXG48L3NjcmlwdD5cclxuPHN0eWxlIHNjb3BlZD5cclxuLm1haW4tYnRuIHtcclxuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogNnB4O1xyXG4gIGJhY2tncm91bmQ6IHJnYmEoMjUzLCAxODQsIDE5LCAwLjkpO1xyXG4gIGNvbG9yOiAjMjEyMTIxO1xyXG4gIGZvbnQtc2l6ZTogMTFweDtcclxuICBmb250LXdlaWdodDogNTAwO1xyXG4gIHBhZGRpbmc6IDZweCAxMnB4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcclxufVxyXG5cclxuLm1haW4tYnRuOmhvdmVyIHtcclxuICBiYWNrZ3JvdW5kOiAjZmRiODEzO1xyXG59XHJcblxyXG4uZGFyayAubWFpbi1idG4ge1xyXG4gIGJhY2tncm91bmQ6IHJnYmEoNzcsIDE2MywgMjU1LCAwLjg1KTtcclxuICBjb2xvcjogIzA1MGIxZTtcclxufVxyXG5cclxuLmRhcmsgLm1haW4tYnRuOmhvdmVyIHtcclxuICBiYWNrZ3JvdW5kOiAjNGRhM2ZmO1xyXG59XHJcbi8qIFJvdyBjaGV2cm9uIHN0eWxpbmcgYWRhcHRzIHZpYSB0ZXh0IGNvbG9yIHNldCBpbmxpbmUgKi9cclxuPC9zdHlsZT5cclxuIl0sImZpbGUiOiJhc3NldHMvQXBwbGljYXRpb25zVmlldy02NTdjZmRiMC5qcyJ9