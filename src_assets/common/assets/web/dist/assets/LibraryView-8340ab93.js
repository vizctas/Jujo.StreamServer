import { k as defineComponent, $ as storeToRefs, r as ref, o as onMounted, G as onUnmounted, w as watch, c as computed, O as createElementBlock, V as createBaseVNode, P as toDisplayString, M as createBlock, S as withCtx, Z as unref, W as createCommentVNode, U as createVNode, l as withDirectives, a6 as vModelText, F as Fragment, a1 as renderList, Q as openBlock, j as createTextVNode, H as normalizeClass, a0 as RouterLink } from "./vue-core-de07660f.js";
import { b as useAppsStore, h as http, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { ap as NAlert, aE as NTag, aq as NButton } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "mx-auto max-w-7xl space-y-5" };
const _hoisted_2 = { class: "page-surface p-5 md:p-6" };
const _hoisted_3 = { class: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" };
const _hoisted_4 = { class: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[28rem]" };
const _hoisted_5 = { class: "library-metric" };
const _hoisted_6 = { class: "library-metric" };
const _hoisted_7 = { class: "library-metric" };
const _hoisted_8 = { class: "library-metric" };
const _hoisted_9 = { class: "page-surface p-4" };
const _hoisted_10 = { class: "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between" };
const _hoisted_11 = { class: "relative w-full xl:max-w-sm" };
const _hoisted_12 = { class: "filter-bar" };
const _hoisted_13 = ["onClick"];
const _hoisted_14 = ["onClick"];
const _hoisted_15 = {
  key: 3,
  class: "library-grid"
};
const _hoisted_16 = { class: "game-poster" };
const _hoisted_17 = ["src", "alt", "onError"];
const _hoisted_18 = {
  key: 1,
  class: "game-poster-empty"
};
const _hoisted_19 = { class: "poster-topline" };
const _hoisted_20 = { class: "source-badge" };
const _hoisted_21 = { class: "flex min-h-0 flex-1 flex-col gap-3 p-4" };
const _hoisted_22 = { class: "min-w-0 space-y-1" };
const _hoisted_23 = { class: "truncate text-sm font-semibold leading-snug" };
const _hoisted_24 = { class: "line-clamp-2 text-xs leading-5 text-dark/62 dark:text-light/62" };
const _hoisted_25 = { class: "mt-auto flex items-center justify-between gap-2" };
const _hoisted_26 = { class: "text-xs text-dark/55 dark:text-light/55" };
const _hoisted_27 = {
  key: 4,
  class: "page-surface p-10 text-center"
};
const _hoisted_28 = { class: "mx-auto flex max-w-sm flex-col items-center gap-3" };
const _hoisted_29 = { class: "empty-icon" };
const _hoisted_30 = {
  key: 5,
  class: "page-surface p-10 text-center"
};
const _hoisted_31 = { class: "mx-auto flex max-w-md flex-col items-center gap-4" };
const _hoisted_32 = { class: "empty-icon" };
const _hoisted_33 = ["href", "onClick"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LibraryView",
  setup(__props) {
    const appsStore = useAppsStore();
    const { apps } = storeToRefs(appsStore);
    const apiGames = ref(null);
    const apiSummary = ref(null);
    const metadataNotice = ref(null);
    const searchQuery = ref("");
    const sourceFilter = ref("all");
    const installFilter = ref("all");
    const coverErrors = ref(/* @__PURE__ */ new Set());
    const pendingLaunch = ref(null);
    const actionMessage = ref(null);
    const prefetchActive = ref(false);
    const prefetchDone = ref(0);
    const prefetchTotal = ref(0);
    let prefetchPollTimer = null;
    let lastPrefetchDone = -1;
    async function pollPrefetchProgress() {
      var _a;
      try {
        const res = await http.get(
          "/api/library/steam/prefetch-progress",
          { validateStatus: () => true }
        );
        if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.status)) {
          prefetchActive.value = res.data.active;
          prefetchDone.value = res.data.done;
          prefetchTotal.value = res.data.total;
          if (res.data.done > lastPrefetchDone && lastPrefetchDone >= 0) {
            void loadLibrary();
          }
          lastPrefetchDone = res.data.done;
          if (!res.data.active) {
            stopPrefetchPoll();
          }
        }
      } catch {
      }
    }
    function startPrefetchPoll() {
      if (prefetchPollTimer !== null)
        return;
      prefetchPollTimer = setInterval(() => {
        void pollPrefetchProgress();
      }, 5e3);
      void pollPrefetchProgress();
    }
    function stopPrefetchPoll() {
      if (prefetchPollTimer !== null) {
        clearInterval(prefetchPollTimer);
        prefetchPollTimer = null;
      }
    }
    const installFilters = [
      { id: "all", label: "All" },
      { id: "installed", label: "Installed" },
      { id: "not_installed", label: "Not installed" }
    ];
    onMounted(() => {
      void appsStore.loadApps(false);
      void loadLibrary();
      startPrefetchPoll();
    });
    onUnmounted(() => {
      stopPrefetchPoll();
    });
    watch(
      () => apps.value.length,
      () => {
        void loadLibrary();
      }
    );
    async function loadLibrary() {
      var _a, _b;
      try {
        const res = await http.get("/api/library/games", { validateStatus: () => true });
        if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.status) && Array.isArray(res.data.games)) {
          apiGames.value = res.data.games;
          apiSummary.value = res.data.summary ?? null;
          metadataNotice.value = ((_b = res.data.metadata) == null ? void 0 : _b.status) === "pending_configuration" ? res.data.metadata.message ?? "Metadata providers are not configured yet." : null;
          return;
        }
      } catch {
      }
      apiGames.value = null;
      apiSummary.value = null;
      metadataNotice.value = null;
    }
    const fallbackGames = computed(
      () => (
        // Only show apps that have a meaningful name or command — skip bare/unnamed entries
        apps.value.filter((app) => {
          var _a;
          const name = (_a = app.name) == null ? void 0 : _a.trim();
          const cmd = Array.isArray(app.cmd) ? app.cmd.join("") : app.cmd ?? "";
          return !!(name || cmd.trim());
        }).map((app, index) => appToLibraryGame(app, index))
      )
    );
    const games = computed(() => apiGames.value ?? fallbackGames.value);
    const summary = computed(() => {
      if (apiSummary.value) {
        return {
          ownedGameCount: apiSummary.value.ownedGameCount ?? games.value.length,
          installedGameCount: apiSummary.value.installedGameCount ?? games.value.filter((game) => game.installed).length,
          playableGameCount: apiSummary.value.playableGameCount ?? games.value.filter((game) => game.playable).length,
          posterAvailableCount: apiSummary.value.posterAvailableCount ?? games.value.filter((game) => !!game.posterUrl).length,
          metadataAvailableCount: apiSummary.value.metadataAvailableCount ?? games.value.filter((game) => game.metadataState === "available").length
        };
      }
      return {
        ownedGameCount: games.value.length,
        installedGameCount: games.value.filter((game) => game.installed).length,
        playableGameCount: games.value.filter((game) => game.playable).length,
        posterAvailableCount: games.value.filter((game) => !!game.posterUrl).length,
        metadataAvailableCount: games.value.filter((game) => game.metadataState === "available").length
      };
    });
    const sourceFilters = computed(() => {
      const seen = /* @__PURE__ */ new Map();
      for (const game of games.value) {
        seen.set(game.sourceId, game.sourceName);
      }
      return [
        { id: "all", label: "All sources" },
        ...Array.from(seen.entries()).map(([id, label]) => ({ id, label }))
      ];
    });
    const filteredGames = computed(() => {
      const q = searchQuery.value.trim().toLowerCase();
      return games.value.filter((game) => {
        var _a, _b, _c;
        if (sourceFilter.value !== "all" && game.sourceId !== sourceFilter.value)
          return false;
        if (installFilter.value === "installed" && !game.installed)
          return false;
        if (installFilter.value === "not_installed" && game.installed)
          return false;
        if (!q)
          return true;
        return [
          game.title,
          game.sourceName,
          (_a = game.metadata) == null ? void 0 : _a.developer,
          (_b = game.metadata) == null ? void 0 : _b.publisher,
          (_c = game.metadata) == null ? void 0 : _c.description
        ].some((value) => String(value || "").toLowerCase().includes(q));
      });
    });
    function appToLibraryGame(app, index) {
      const uuid = app.uuid ?? null;
      const sourceId = app["playnite-id"] ? "playniteLegacy" : "manual";
      const playable = !!(app.name || app.cmd || app["playnite-id"]);
      const game = {
        id: uuid || app["playnite-id"] || `local:${index}`,
        uuid,
        sourceId,
        sourceName: sourceId === "playniteLegacy" ? "Playnite Legacy" : "Manual",
        title: app.name || "Untitled game",
        owned: true,
        installed: playable,
        playable,
        installState: playable ? "installed" : "not_installed",
        posterState: uuid && (app["image-path"] || app["playnite-id"]) ? "available" : "missing",
        metadataState: "partial",
        metadata: {}
      };
      if (app["working-dir"]) {
        game.installPath = app["working-dir"];
      }
      if (typeof app.cmd === "string" && app.cmd.length > 0) {
        game.executablePath = app.cmd;
      }
      if (uuid && (app["image-path"] || app["playnite-id"])) {
        game.posterUrl = `/api/apps/${encodeURIComponent(uuid)}/cover`;
      }
      return game;
    }
    function posterUrl(game) {
      if (!game.posterUrl || coverErrors.value.has(game.id))
        return void 0;
      return game.posterUrl;
    }
    function onCoverError(game) {
      coverErrors.value.add(game.id);
    }
    function gameSubtitle(game) {
      var _a, _b, _c, _d;
      const description = (_b = (_a = game.metadata) == null ? void 0 : _a.description) == null ? void 0 : _b.trim();
      if (description)
        return description;
      const developer = (_d = (_c = game.metadata) == null ? void 0 : _c.developer) == null ? void 0 : _d.trim();
      if (developer)
        return developer;
      if (game.installPath)
        return game.installPath;
      return game.installed ? "Ready from local configuration" : "Available after install detection";
    }
    async function launchGame(game) {
      if (!game.uuid) {
        await addProviderGame(game);
        return;
      }
      if (!game.playable)
        return;
      pendingLaunch.value = game.uuid;
      actionMessage.value = null;
      const result = await appsStore.launchApp(game.uuid);
      pendingLaunch.value = null;
      actionMessage.value = result.ok ? { type: "success", text: `Starting ${game.title}.` } : { type: "error", text: result.error || `Could not start ${game.title}.` };
    }
    function canRunOrAdd(game) {
      if (game.uuid)
        return game.playable;
      return (game.sourceId === "steam" || game.sourceId === "epic") && game.installed && !!game.providerGameId;
    }
    async function addProviderGame(game) {
      var _a, _b;
      if (game.sourceId !== "steam" && game.sourceId !== "epic" || !game.providerGameId)
        return;
      const command = game.sourceId === "steam" ? `cmd /c start "" "steam://rungameid/${game.providerGameId}"` : `cmd /c start "" "com.epicgames.launcher://apps/${game.providerGameId}?action=launch&silent=true"`;
      pendingLaunch.value = game.id;
      actionMessage.value = null;
      try {
        const response = await http.post(
          "/api/apps",
          {
            index: -1,
            name: game.title,
            cmd: command,
            "working-dir": game.installPath || "",
            "source-id": game.sourceId,
            "provider-game-id": game.providerGameId,
            "auto-detach": true
          },
          { validateStatus: () => true }
        );
        if (response.status === 200 && ((_a = response.data) == null ? void 0 : _a.status)) {
          actionMessage.value = { type: "success", text: `${game.title} was added to the server library.` };
          await appsStore.loadApps(true);
          await loadLibrary();
          return;
        }
        actionMessage.value = {
          type: "error",
          text: ((_b = response.data) == null ? void 0 : _b.error) || `Could not add ${game.title}.`
        };
      } catch (error) {
        actionMessage.value = {
          type: "error",
          text: error instanceof Error ? error.message : `Could not add ${game.title}.`
        };
      } finally {
        pendingLaunch.value = null;
      }
    }
    function clearFilters() {
      searchQuery.value = "";
      sourceFilter.value = "all";
      installFilter.value = "all";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("section", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[6] || (_cache[6] = createBaseVNode(
              "div",
              { class: "max-w-2xl space-y-2" },
              [
                createBaseVNode("p", { class: "text-xs font-semibold uppercase tracking-wide text-primary" }, "Library"),
                createBaseVNode("h1", { class: "text-2xl font-semibold tracking-tight" }, "Your game library"),
                createBaseVNode("p", { class: "text-sm leading-6 text-dark/68 dark:text-light/68" }, " Owned, installed, and stream-ready games from connected platforms. Store connectors will enrich this view with posters and metadata as each provider is enabled. ")
              ],
              -1
              /* CACHED */
            )),
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode("div", _hoisted_5, [
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(summary.value.ownedGameCount),
                  1
                  /* TEXT */
                ),
                _cache[2] || (_cache[2] = createBaseVNode(
                  "small",
                  null,
                  "Owned",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(summary.value.installedGameCount),
                  1
                  /* TEXT */
                ),
                _cache[3] || (_cache[3] = createBaseVNode(
                  "small",
                  null,
                  "Installed",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_7, [
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(summary.value.playableGameCount),
                  1
                  /* TEXT */
                ),
                _cache[4] || (_cache[4] = createBaseVNode(
                  "small",
                  null,
                  "Playable",
                  -1
                  /* CACHED */
                ))
              ]),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(summary.value.posterAvailableCount),
                  1
                  /* TEXT */
                ),
                _cache[5] || (_cache[5] = createBaseVNode(
                  "small",
                  null,
                  "Posters",
                  -1
                  /* CACHED */
                ))
              ])
            ])
          ])
        ]),
        metadataNotice.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 0,
          type: "info",
          bordered: false
        }, {
          default: withCtx(() => [
            createTextVNode(
              toDisplayString(metadataNotice.value),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        })) : createCommentVNode("v-if", true),
        prefetchActive.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 1,
          type: "info",
          bordered: false
        }, {
          default: withCtx(() => [
            createTextVNode(
              " Downloading posters & metadata in background — " + toDisplayString(prefetchDone.value) + "/" + toDisplayString(prefetchTotal.value) + " done. The library updates automatically. ",
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        })) : createCommentVNode("v-if", true),
        actionMessage.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 2,
          type: actionMessage.value.type,
          bordered: false,
          closable: "",
          onClose: _cache[0] || (_cache[0] = ($event) => actionMessage.value = null)
        }, {
          default: withCtx(() => [
            createTextVNode(
              toDisplayString(actionMessage.value.text),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["type"])) : createCommentVNode("v-if", true),
        createBaseVNode("section", _hoisted_9, [
          createBaseVNode("div", _hoisted_10, [
            createBaseVNode("div", _hoisted_11, [
              createVNode(LucideIcon, {
                name: "fa-search",
                size: 15,
                class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-45"
              }),
              withDirectives(createBaseVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchQuery.value = $event),
                  type: "text",
                  placeholder: "Search by title, source, or developer...",
                  class: "h-10 w-full rounded-lg border border-dark/12 bg-transparent pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60 dark:border-light/14 dark:focus:border-primary/60"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vModelText, searchQuery.value]
              ])
            ]),
            createBaseVNode("div", _hoisted_12, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(sourceFilters.value, (filter) => {
                  return openBlock(), createElementBlock("button", {
                    key: filter.id,
                    type: "button",
                    class: normalizeClass(["filter-chip", { active: sourceFilter.value === filter.id }]),
                    onClick: ($event) => sourceFilter.value = filter.id
                  }, toDisplayString(filter.label), 11, _hoisted_13);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              _cache[7] || (_cache[7] = createBaseVNode(
                "span",
                {
                  class: "filter-bar-sep",
                  "aria-hidden": "true"
                },
                null,
                -1
                /* CACHED */
              )),
              (openBlock(), createElementBlock(
                Fragment,
                null,
                renderList(installFilters, (filter) => {
                  return createBaseVNode("button", {
                    key: filter.id,
                    type: "button",
                    class: normalizeClass(["filter-chip", { active: installFilter.value === filter.id }]),
                    onClick: ($event) => installFilter.value = filter.id
                  }, toDisplayString(filter.label), 11, _hoisted_14);
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])
        ]),
        filteredGames.value.length ? (openBlock(), createElementBlock("section", _hoisted_15, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(filteredGames.value, (game) => {
              return openBlock(), createElementBlock("article", {
                key: game.id,
                class: "game-card page-surface"
              }, [
                createBaseVNode("div", _hoisted_16, [
                  posterUrl(game) ? (openBlock(), createElementBlock("img", {
                    key: 0,
                    src: posterUrl(game) || "",
                    alt: game.title,
                    loading: "lazy",
                    class: "game-poster-img",
                    onError: ($event) => onCoverError(game)
                  }, null, 40, _hoisted_17)) : (openBlock(), createElementBlock("div", _hoisted_18, [
                    createVNode(LucideIcon, {
                      name: "fa-gamepad",
                      size: 32
                    })
                  ])),
                  createBaseVNode("div", _hoisted_19, [
                    createBaseVNode(
                      "span",
                      _hoisted_20,
                      toDisplayString(game.sourceName),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(NTag), {
                      type: game.playable ? "success" : "warning",
                      bordered: false,
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(game.playable ? "Ready" : "Not installed"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["type"])
                  ])
                ]),
                createBaseVNode("div", _hoisted_21, [
                  createBaseVNode("div", _hoisted_22, [
                    createBaseVNode(
                      "h2",
                      _hoisted_23,
                      toDisplayString(game.title),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode(
                      "p",
                      _hoisted_24,
                      toDisplayString(gameSubtitle(game)),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("div", _hoisted_25, [
                    createBaseVNode(
                      "span",
                      _hoisted_26,
                      toDisplayString(game.installState === "installed" ? "Local install detected" : "Owned library item"),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(NButton), {
                      size: "small",
                      type: "primary",
                      secondary: "",
                      strong: "",
                      disabled: !canRunOrAdd(game),
                      loading: pendingLaunch.value === (game.uuid || game.id),
                      onClick: ($event) => launchGame(game)
                    }, {
                      default: withCtx(() => [
                        createVNode(LucideIcon, {
                          name: game.uuid ? "fa-play" : "fa-plus",
                          size: 13
                        }, null, 8, ["name"]),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(game.uuid ? "Play" : "Add"),
                          1
                          /* TEXT */
                        )
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["disabled", "loading", "onClick"])
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : games.value.length ? (openBlock(), createElementBlock("section", _hoisted_27, [
          createBaseVNode("div", _hoisted_28, [
            createBaseVNode("div", _hoisted_29, [
              createVNode(LucideIcon, {
                name: "fa-search",
                size: 24
              })
            ]),
            _cache[9] || (_cache[9] = createBaseVNode(
              "div",
              { class: "space-y-1" },
              [
                createBaseVNode("h2", { class: "text-base font-semibold" }, "No matching games"),
                createBaseVNode("p", { class: "text-sm text-dark/62 dark:text-light/62" }, "Adjust filters or clear your search.")
              ],
              -1
              /* CACHED */
            )),
            createVNode(unref(NButton), {
              size: "small",
              secondary: "",
              strong: "",
              onClick: clearFilters
            }, {
              default: withCtx(() => _cache[8] || (_cache[8] = [
                createTextVNode(
                  "Clear filters",
                  -1
                  /* CACHED */
                )
              ])),
              _: 1,
              __: [8]
            })
          ])
        ])) : (openBlock(), createElementBlock("section", _hoisted_30, [
          createBaseVNode("div", _hoisted_31, [
            createBaseVNode("div", _hoisted_32, [
              createVNode(LucideIcon, {
                name: "fa-plug",
                size: 28
              })
            ]),
            _cache[11] || (_cache[11] = createBaseVNode(
              "div",
              { class: "space-y-2" },
              [
                createBaseVNode("h2", { class: "text-lg font-semibold" }, "No library items yet"),
                createBaseVNode("p", { class: "text-sm leading-6 text-dark/65 dark:text-light/65" }, " Connect Steam, Epic, GOG, Xbox, or add a manual game. Library items can be synced now and enriched with metadata once providers are configured. ")
              ],
              -1
              /* CACHED */
            )),
            createVNode(unref(RouterLink), {
              to: "/game-sources",
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
                        name: "fa-plug",
                        size: 16
                      }),
                      _cache[10] || (_cache[10] = createBaseVNode(
                        "span",
                        null,
                        "Connect a library",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    _: 1,
                    __: [10]
                  })
                ], 8, _hoisted_33)
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ]))
      ]);
    };
  }
});
const LibraryView_vue_vue_type_style_index_0_scoped_dce97bcc_lang = "";
const LibraryView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-dce97bcc"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/LibraryView.vue"]]);
export {
  LibraryView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlicmFyeVZpZXctODM0MGFiOTMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3ZpZXdzL0xpYnJhcnlWaWV3LnZ1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8dGVtcGxhdGU+XHJcbiAgPGRpdiBjbGFzcz1cIm14LWF1dG8gbWF4LXctN3hsIHNwYWNlLXktNVwiPlxyXG4gICAgPHNlY3Rpb24gY2xhc3M9XCJwYWdlLXN1cmZhY2UgcC01IG1kOnAtNlwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtNSBsZzpmbGV4LXJvdyBsZzppdGVtcy1lbmQgbGc6anVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1heC13LTJ4bCBzcGFjZS15LTJcIj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIHRleHQtcHJpbWFyeVwiPkxpYnJhcnk8L3A+XHJcbiAgICAgICAgICA8aDEgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LXNlbWlib2xkIHRyYWNraW5nLXRpZ2h0XCI+WW91ciBnYW1lIGxpYnJhcnk8L2gxPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIGxlYWRpbmctNiB0ZXh0LWRhcmsvNjggZGFyazp0ZXh0LWxpZ2h0LzY4XCI+XHJcbiAgICAgICAgICAgIE93bmVkLCBpbnN0YWxsZWQsIGFuZCBzdHJlYW0tcmVhZHkgZ2FtZXMgZnJvbSBjb25uZWN0ZWQgcGxhdGZvcm1zLiBTdG9yZSBjb25uZWN0b3JzIHdpbGxcclxuICAgICAgICAgICAgZW5yaWNoIHRoaXMgdmlldyB3aXRoIHBvc3RlcnMgYW5kIG1ldGFkYXRhIGFzIGVhY2ggcHJvdmlkZXIgaXMgZW5hYmxlZC5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTIgc206Z3JpZC1jb2xzLTQgbGc6bWluLXctWzI4cmVtXVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnJhcnktbWV0cmljXCI+XHJcbiAgICAgICAgICAgIDxzcGFuPnt7IHN1bW1hcnkub3duZWRHYW1lQ291bnQgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzbWFsbD5Pd25lZDwvc21hbGw+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWJyYXJ5LW1ldHJpY1wiPlxyXG4gICAgICAgICAgICA8c3Bhbj57eyBzdW1tYXJ5Lmluc3RhbGxlZEdhbWVDb3VudCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNtYWxsPkluc3RhbGxlZDwvc21hbGw+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWJyYXJ5LW1ldHJpY1wiPlxyXG4gICAgICAgICAgICA8c3Bhbj57eyBzdW1tYXJ5LnBsYXlhYmxlR2FtZUNvdW50IH19PC9zcGFuPlxyXG4gICAgICAgICAgICA8c21hbGw+UGxheWFibGU8L3NtYWxsPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicmFyeS1tZXRyaWNcIj5cclxuICAgICAgICAgICAgPHNwYW4+e3sgc3VtbWFyeS5wb3N0ZXJBdmFpbGFibGVDb3VudCB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNtYWxsPlBvc3RlcnM8L3NtYWxsPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9zZWN0aW9uPlxyXG5cclxuICAgIDxuLWFsZXJ0IHYtaWY9XCJtZXRhZGF0YU5vdGljZVwiIHR5cGU9XCJpbmZvXCIgOmJvcmRlcmVkPVwiZmFsc2VcIj5cclxuICAgICAge3sgbWV0YWRhdGFOb3RpY2UgfX1cclxuICAgIDwvbi1hbGVydD5cclxuXHJcbiAgICA8bi1hbGVydCB2LWlmPVwicHJlZmV0Y2hBY3RpdmVcIiB0eXBlPVwiaW5mb1wiIDpib3JkZXJlZD1cImZhbHNlXCI+XHJcbiAgICAgIERvd25sb2FkaW5nIHBvc3RlcnMgJmFtcDsgbWV0YWRhdGEgaW4gYmFja2dyb3VuZCDigJQge3sgcHJlZmV0Y2hEb25lIH19L3t7IHByZWZldGNoVG90YWwgfX0gZG9uZS4gVGhlIGxpYnJhcnkgdXBkYXRlcyBhdXRvbWF0aWNhbGx5LlxyXG4gICAgPC9uLWFsZXJ0PlxyXG5cclxuICAgIDxuLWFsZXJ0IHYtaWY9XCJhY3Rpb25NZXNzYWdlXCIgOnR5cGU9XCJhY3Rpb25NZXNzYWdlLnR5cGVcIiA6Ym9yZGVyZWQ9XCJmYWxzZVwiIGNsb3NhYmxlIEBjbG9zZT1cImFjdGlvbk1lc3NhZ2UgPSBudWxsXCI+XHJcbiAgICAgIHt7IGFjdGlvbk1lc3NhZ2UudGV4dCB9fVxyXG4gICAgPC9uLWFsZXJ0PlxyXG5cclxuICAgIDxzZWN0aW9uIGNsYXNzPVwicGFnZS1zdXJmYWNlIHAtNFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMyB4bDpmbGV4LXJvdyB4bDppdGVtcy1jZW50ZXIgeGw6anVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInJlbGF0aXZlIHctZnVsbCB4bDptYXgtdy1zbVwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb25cclxuICAgICAgICAgICAgbmFtZT1cImZhLXNlYXJjaFwiXHJcbiAgICAgICAgICAgIDpzaXplPVwiMTVcIlxyXG4gICAgICAgICAgICBjbGFzcz1cInBvaW50ZXItZXZlbnRzLW5vbmUgYWJzb2x1dGUgbGVmdC0zIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBvcGFjaXR5LTQ1XCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgdi1tb2RlbD1cInNlYXJjaFF1ZXJ5XCJcclxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBieSB0aXRsZSwgc291cmNlLCBvciBkZXZlbG9wZXIuLi5cIlxyXG4gICAgICAgICAgICBjbGFzcz1cImgtMTAgdy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1kYXJrLzEyIGJnLXRyYW5zcGFyZW50IHBsLTkgcHItMyB0ZXh0LXNtIG91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWNvbG9ycyBmb2N1czpib3JkZXItcHJpbWFyeS82MCBkYXJrOmJvcmRlci1saWdodC8xNCBkYXJrOmZvY3VzOmJvcmRlci1wcmltYXJ5LzYwXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWx0ZXItYmFyXCI+XHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIHYtZm9yPVwiZmlsdGVyIGluIHNvdXJjZUZpbHRlcnNcIlxyXG4gICAgICAgICAgICA6a2V5PVwiZmlsdGVyLmlkXCJcclxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwiZmlsdGVyLWNoaXBcIlxyXG4gICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogc291cmNlRmlsdGVyID09PSBmaWx0ZXIuaWQgfVwiXHJcbiAgICAgICAgICAgIEBjbGljaz1cInNvdXJjZUZpbHRlciA9IGZpbHRlci5pZFwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIHt7IGZpbHRlci5sYWJlbCB9fVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJmaWx0ZXItYmFyLXNlcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XHJcblxyXG4gICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICB2LWZvcj1cImZpbHRlciBpbiBpbnN0YWxsRmlsdGVyc1wiXHJcbiAgICAgICAgICAgIDprZXk9XCJmaWx0ZXIuaWRcIlxyXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJmaWx0ZXItY2hpcFwiXHJcbiAgICAgICAgICAgIDpjbGFzcz1cInsgYWN0aXZlOiBpbnN0YWxsRmlsdGVyID09PSBmaWx0ZXIuaWQgfVwiXHJcbiAgICAgICAgICAgIEBjbGljaz1cImluc3RhbGxGaWx0ZXIgPSBmaWx0ZXIuaWRcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICB7eyBmaWx0ZXIubGFiZWwgfX1cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICA8c2VjdGlvbiB2LWlmPVwiZmlsdGVyZWRHYW1lcy5sZW5ndGhcIiBjbGFzcz1cImxpYnJhcnktZ3JpZFwiPlxyXG4gICAgICA8YXJ0aWNsZSB2LWZvcj1cImdhbWUgaW4gZmlsdGVyZWRHYW1lc1wiIDprZXk9XCJnYW1lLmlkXCIgY2xhc3M9XCJnYW1lLWNhcmQgcGFnZS1zdXJmYWNlXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImdhbWUtcG9zdGVyXCI+XHJcbiAgICAgICAgICA8aW1nXHJcbiAgICAgICAgICAgIHYtaWY9XCJwb3N0ZXJVcmwoZ2FtZSlcIlxyXG4gICAgICAgICAgICA6c3JjPVwicG9zdGVyVXJsKGdhbWUpIHx8ICcnXCJcclxuICAgICAgICAgICAgOmFsdD1cImdhbWUudGl0bGVcIlxyXG4gICAgICAgICAgICBsb2FkaW5nPVwibGF6eVwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwiZ2FtZS1wb3N0ZXItaW1nXCJcclxuICAgICAgICAgICAgQGVycm9yPVwib25Db3ZlckVycm9yKGdhbWUpXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cImdhbWUtcG9zdGVyLWVtcHR5XCI+XHJcbiAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1nYW1lcGFkXCIgOnNpemU9XCIzMlwiIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3N0ZXItdG9wbGluZVwiPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNvdXJjZS1iYWRnZVwiPnt7IGdhbWUuc291cmNlTmFtZSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgPG4tdGFnIDp0eXBlPVwiZ2FtZS5wbGF5YWJsZSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJ1wiIDpib3JkZXJlZD1cImZhbHNlXCIgc2l6ZT1cInNtYWxsXCI+XHJcbiAgICAgICAgICAgICAge3sgZ2FtZS5wbGF5YWJsZSA/ICdSZWFkeScgOiAnTm90IGluc3RhbGxlZCcgfX1cclxuICAgICAgICAgICAgPC9uLXRhZz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBtaW4taC0wIGZsZXgtMSBmbGV4LWNvbCBnYXAtMyBwLTRcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIHNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJ0cnVuY2F0ZSB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgbGVhZGluZy1zbnVnXCI+e3sgZ2FtZS50aXRsZSB9fTwvaDI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwibGluZS1jbGFtcC0yIHRleHQteHMgbGVhZGluZy01IHRleHQtZGFyay82MiBkYXJrOnRleHQtbGlnaHQvNjJcIj5cclxuICAgICAgICAgICAgICB7eyBnYW1lU3VidGl0bGUoZ2FtZSkgfX1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm10LWF1dG8gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC14cyB0ZXh0LWRhcmsvNTUgZGFyazp0ZXh0LWxpZ2h0LzU1XCI+e3sgZ2FtZS5pbnN0YWxsU3RhdGUgPT09ICdpbnN0YWxsZWQnID8gJ0xvY2FsIGluc3RhbGwgZGV0ZWN0ZWQnIDogJ093bmVkIGxpYnJhcnkgaXRlbScgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICAgIHNlY29uZGFyeVxyXG4gICAgICAgICAgICAgIHN0cm9uZ1xyXG4gICAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFjYW5SdW5PckFkZChnYW1lKVwiXHJcbiAgICAgICAgICAgICAgOmxvYWRpbmc9XCJwZW5kaW5nTGF1bmNoID09PSAoZ2FtZS51dWlkIHx8IGdhbWUuaWQpXCJcclxuICAgICAgICAgICAgICBAY2xpY2s9XCJsYXVuY2hHYW1lKGdhbWUpXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxMdWNpZGVJY29uIDpuYW1lPVwiZ2FtZS51dWlkID8gJ2ZhLXBsYXknIDogJ2ZhLXBsdXMnXCIgOnNpemU9XCIxM1wiIC8+XHJcbiAgICAgICAgICAgICAgPHNwYW4+e3sgZ2FtZS51dWlkID8gJ1BsYXknIDogJ0FkZCcgfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9hcnRpY2xlPlxyXG4gICAgPC9zZWN0aW9uPlxyXG5cclxuICAgIDxzZWN0aW9uIHYtZWxzZS1pZj1cImdhbWVzLmxlbmd0aFwiIGNsYXNzPVwicGFnZS1zdXJmYWNlIHAtMTAgdGV4dC1jZW50ZXJcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cIm14LWF1dG8gZmxleCBtYXgtdy1zbSBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZW1wdHktaWNvblwiPlxyXG4gICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXNlYXJjaFwiIDpzaXplPVwiMjRcIiAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTFcIj5cclxuICAgICAgICAgIDxoMiBjbGFzcz1cInRleHQtYmFzZSBmb250LXNlbWlib2xkXCI+Tm8gbWF0Y2hpbmcgZ2FtZXM8L2gyPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIHRleHQtZGFyay82MiBkYXJrOnRleHQtbGlnaHQvNjJcIj5BZGp1c3QgZmlsdGVycyBvciBjbGVhciB5b3VyIHNlYXJjaC48L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPG4tYnV0dG9uIHNpemU9XCJzbWFsbFwiIHNlY29uZGFyeSBzdHJvbmcgQGNsaWNrPVwiY2xlYXJGaWx0ZXJzXCI+Q2xlYXIgZmlsdGVyczwvbi1idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9zZWN0aW9uPlxyXG5cclxuICAgIDxzZWN0aW9uIHYtZWxzZSBjbGFzcz1cInBhZ2Utc3VyZmFjZSBwLTEwIHRleHQtY2VudGVyXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJteC1hdXRvIGZsZXggbWF4LXctbWQgZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC00XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImVtcHR5LWljb25cIj5cclxuICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1wbHVnXCIgOnNpemU9XCIyOFwiIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1sZyBmb250LXNlbWlib2xkXCI+Tm8gbGlicmFyeSBpdGVtcyB5ZXQ8L2gyPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIGxlYWRpbmctNiB0ZXh0LWRhcmsvNjUgZGFyazp0ZXh0LWxpZ2h0LzY1XCI+XHJcbiAgICAgICAgICAgIENvbm5lY3QgU3RlYW0sIEVwaWMsIEdPRywgWGJveCwgb3IgYWRkIGEgbWFudWFsIGdhbWUuIExpYnJhcnkgaXRlbXMgY2FuIGJlIHN5bmNlZCBub3dcclxuICAgICAgICAgICAgYW5kIGVucmljaGVkIHdpdGggbWV0YWRhdGEgb25jZSBwcm92aWRlcnMgYXJlIGNvbmZpZ3VyZWQuXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPFJvdXRlckxpbmsgdG89XCIvZ2FtZS1zb3VyY2VzXCIgY3VzdG9tIHYtc2xvdD1cInsgbmF2aWdhdGUsIGhyZWYgfVwiPlxyXG4gICAgICAgICAgPGEgOmhyZWY9XCJocmVmXCIgQGNsaWNrPVwibmF2aWdhdGVcIj5cclxuICAgICAgICAgICAgPG4tYnV0dG9uIHRhZz1cInNwYW5cIiB0eXBlPVwicHJpbWFyeVwiIHN0cm9uZz5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtcGx1Z1wiIDpzaXplPVwiMTZcIiAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuPkNvbm5lY3QgYSBsaWJyYXJ5PC9zcGFuPlxyXG4gICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPC9hPlxyXG4gICAgICAgIDwvUm91dGVyTGluaz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L3NlY3Rpb24+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyBjb21wdXRlZCwgb25Nb3VudGVkLCBvblVubW91bnRlZCwgcmVmLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IFJvdXRlckxpbmsgfSBmcm9tICd2dWUtcm91dGVyJztcclxuaW1wb3J0IHsgTkFsZXJ0LCBOQnV0dG9uLCBOVGFnIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyBzdG9yZVRvUmVmcyB9IGZyb20gJ3BpbmlhJztcclxuaW1wb3J0IEx1Y2lkZUljb24gZnJvbSAnQC9jb21wb25lbnRzL0x1Y2lkZUljb24udnVlJztcclxuaW1wb3J0IHsgaHR0cCB9IGZyb20gJ0AvaHR0cCc7XHJcbmltcG9ydCB7IHVzZUFwcHNTdG9yZSwgdHlwZSBBcHAgfSBmcm9tICdAL3N0b3Jlcy9hcHBzJztcclxuXHJcbnR5cGUgTGlicmFyeUdhbWUgPSB7XHJcbiAgaWQ6IHN0cmluZztcclxuICB1dWlkPzogc3RyaW5nIHwgbnVsbDtcclxuICBwcm92aWRlckdhbWVJZD86IHN0cmluZztcclxuICBzb3VyY2VJZDogc3RyaW5nO1xyXG4gIHNvdXJjZU5hbWU6IHN0cmluZztcclxuICB0aXRsZTogc3RyaW5nO1xyXG4gIG93bmVkOiBib29sZWFuO1xyXG4gIGluc3RhbGxlZDogYm9vbGVhbjtcclxuICBwbGF5YWJsZTogYm9vbGVhbjtcclxuICBpbnN0YWxsU3RhdGU6ICdpbnN0YWxsZWQnIHwgJ25vdF9pbnN0YWxsZWQnIHwgc3RyaW5nO1xyXG4gIGluc3RhbGxQYXRoPzogc3RyaW5nO1xyXG4gIGV4ZWN1dGFibGVQYXRoPzogc3RyaW5nO1xyXG4gIHBvc3RlclVybD86IHN0cmluZztcclxuICBwb3N0ZXJTdGF0ZT86IHN0cmluZztcclxuICBtZXRhZGF0YVN0YXRlPzogc3RyaW5nO1xyXG4gIG1ldGFkYXRhPzoge1xyXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgICBkZXZlbG9wZXI/OiBzdHJpbmc7XHJcbiAgICBwdWJsaXNoZXI/OiBzdHJpbmc7XHJcbiAgICByZWxlYXNlRGF0ZT86IHN0cmluZztcclxuICAgIGdlbnJlcz86IHN0cmluZ1tdO1xyXG4gIH07XHJcbn07XHJcblxyXG50eXBlIExpYnJhcnlTdW1tYXJ5ID0ge1xyXG4gIG93bmVkR2FtZUNvdW50OiBudW1iZXI7XHJcbiAgaW5zdGFsbGVkR2FtZUNvdW50OiBudW1iZXI7XHJcbiAgcGxheWFibGVHYW1lQ291bnQ6IG51bWJlcjtcclxuICBwb3N0ZXJBdmFpbGFibGVDb3VudDogbnVtYmVyO1xyXG4gIG1ldGFkYXRhQXZhaWxhYmxlQ291bnQ6IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgTGlicmFyeVJlc3BvbnNlID0ge1xyXG4gIHN0YXR1cz86IGJvb2xlYW47XHJcbiAgZ2FtZXM/OiBMaWJyYXJ5R2FtZVtdO1xyXG4gIHN1bW1hcnk/OiBQYXJ0aWFsPExpYnJhcnlTdW1tYXJ5PjtcclxuICBtZXRhZGF0YT86IHtcclxuICAgIHN0YXR1cz86IHN0cmluZztcclxuICAgIG1lc3NhZ2U/OiBzdHJpbmc7XHJcbiAgfTtcclxufTtcclxuXHJcbnR5cGUgQWN0aW9uTWVzc2FnZSA9IHtcclxuICB0eXBlOiAnc3VjY2VzcycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2luZm8nO1xyXG4gIHRleHQ6IHN0cmluZztcclxufTtcclxuXHJcbmNvbnN0IGFwcHNTdG9yZSA9IHVzZUFwcHNTdG9yZSgpO1xyXG5jb25zdCB7IGFwcHMgfSA9IHN0b3JlVG9SZWZzKGFwcHNTdG9yZSk7XHJcblxyXG5jb25zdCBhcGlHYW1lcyA9IHJlZjxMaWJyYXJ5R2FtZVtdIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGFwaVN1bW1hcnkgPSByZWY8UGFydGlhbDxMaWJyYXJ5U3VtbWFyeT4gfCBudWxsPihudWxsKTtcclxuY29uc3QgbWV0YWRhdGFOb3RpY2UgPSByZWY8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHNlYXJjaFF1ZXJ5ID0gcmVmKCcnKTtcclxuY29uc3Qgc291cmNlRmlsdGVyID0gcmVmKCdhbGwnKTtcclxuY29uc3QgaW5zdGFsbEZpbHRlciA9IHJlZignYWxsJyk7XHJcbmNvbnN0IGNvdmVyRXJyb3JzID0gcmVmKG5ldyBTZXQ8c3RyaW5nPigpKTtcclxuY29uc3QgcGVuZGluZ0xhdW5jaCA9IHJlZjxzdHJpbmcgfCBudWxsPihudWxsKTtcclxuY29uc3QgYWN0aW9uTWVzc2FnZSA9IHJlZjxBY3Rpb25NZXNzYWdlIHwgbnVsbD4obnVsbCk7XHJcblxyXG4vLyBQcmVmZXRjaCBwcm9ncmVzc1xyXG5jb25zdCBwcmVmZXRjaEFjdGl2ZSA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHByZWZldGNoRG9uZSA9IHJlZigwKTtcclxuY29uc3QgcHJlZmV0Y2hUb3RhbCA9IHJlZigwKTtcclxubGV0IHByZWZldGNoUG9sbFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcclxubGV0IGxhc3RQcmVmZXRjaERvbmUgPSAtMTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBvbGxQcmVmZXRjaFByb2dyZXNzKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBodHRwLmdldDx7IHN0YXR1czogYm9vbGVhbjsgYWN0aXZlOiBib29sZWFuOyBkb25lOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfT4oXHJcbiAgICAgICcvYXBpL2xpYnJhcnkvc3RlYW0vcHJlZmV0Y2gtcHJvZ3Jlc3MnLFxyXG4gICAgICB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0sXHJcbiAgICApO1xyXG4gICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiByZXMuZGF0YT8uc3RhdHVzKSB7XHJcbiAgICAgIHByZWZldGNoQWN0aXZlLnZhbHVlID0gcmVzLmRhdGEuYWN0aXZlO1xyXG4gICAgICBwcmVmZXRjaERvbmUudmFsdWUgPSByZXMuZGF0YS5kb25lO1xyXG4gICAgICBwcmVmZXRjaFRvdGFsLnZhbHVlID0gcmVzLmRhdGEudG90YWw7XHJcbiAgICAgIC8vIFJlZnJlc2ggbGlicmFyeSB3aGVuIG5ldyBpdGVtcyBmaW5pc2ggKG5ldyB0aXRsZXMvcG9zdGVycyBhdmFpbGFibGUpXHJcbiAgICAgIGlmIChyZXMuZGF0YS5kb25lID4gbGFzdFByZWZldGNoRG9uZSAmJiBsYXN0UHJlZmV0Y2hEb25lID49IDApIHtcclxuICAgICAgICB2b2lkIGxvYWRMaWJyYXJ5KCk7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdFByZWZldGNoRG9uZSA9IHJlcy5kYXRhLmRvbmU7XHJcbiAgICAgIGlmICghcmVzLmRhdGEuYWN0aXZlKSB7XHJcbiAgICAgICAgc3RvcFByZWZldGNoUG9sbCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBpZ25vcmUgdHJhbnNpZW50IGVycm9yc1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRQcmVmZXRjaFBvbGwoKSB7XHJcbiAgaWYgKHByZWZldGNoUG9sbFRpbWVyICE9PSBudWxsKSByZXR1cm47XHJcbiAgcHJlZmV0Y2hQb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICB2b2lkIHBvbGxQcmVmZXRjaFByb2dyZXNzKCk7XHJcbiAgfSwgNTAwMCk7XHJcbiAgdm9pZCBwb2xsUHJlZmV0Y2hQcm9ncmVzcygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wUHJlZmV0Y2hQb2xsKCkge1xyXG4gIGlmIChwcmVmZXRjaFBvbGxUaW1lciAhPT0gbnVsbCkge1xyXG4gICAgY2xlYXJJbnRlcnZhbChwcmVmZXRjaFBvbGxUaW1lcik7XHJcbiAgICBwcmVmZXRjaFBvbGxUaW1lciA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBpbnN0YWxsRmlsdGVycyA9IFtcclxuICB7IGlkOiAnYWxsJywgbGFiZWw6ICdBbGwnIH0sXHJcbiAgeyBpZDogJ2luc3RhbGxlZCcsIGxhYmVsOiAnSW5zdGFsbGVkJyB9LFxyXG4gIHsgaWQ6ICdub3RfaW5zdGFsbGVkJywgbGFiZWw6ICdOb3QgaW5zdGFsbGVkJyB9LFxyXG5dO1xyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICB2b2lkIGFwcHNTdG9yZS5sb2FkQXBwcyhmYWxzZSk7XHJcbiAgdm9pZCBsb2FkTGlicmFyeSgpO1xyXG4gIHN0YXJ0UHJlZmV0Y2hQb2xsKCk7XHJcbn0pO1xyXG5cclxub25Vbm1vdW50ZWQoKCkgPT4ge1xyXG4gIHN0b3BQcmVmZXRjaFBvbGwoKTtcclxufSk7XHJcblxyXG4vLyBSZS1mZXRjaCB0aGUgbGlicmFyeSBmcm9tIHRoZSBBUEkgd2hlbmV2ZXIgdGhlIGFwcHMgc3RvcmUgaXMgcmVmcmVzaGVkXHJcbi8vIChlLmcuIGFmdGVyIFBsYXluaXRlIGlzIGRpc2FibGVkKSwgc28gdGhlIHZpZXcgcmVmbGVjdHMgdGhlIGxhdGVzdCBzdGF0ZVxyXG4vLyB3aXRob3V0IHJlcXVpcmluZyBhIGZ1bGwgcGFnZSBuYXZpZ2F0aW9uLlxyXG53YXRjaChcclxuICAoKSA9PiBhcHBzLnZhbHVlLmxlbmd0aCxcclxuICAoKSA9PiB7XHJcbiAgICB2b2lkIGxvYWRMaWJyYXJ5KCk7XHJcbiAgfSxcclxuKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRMaWJyYXJ5KCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBodHRwLmdldDxMaWJyYXJ5UmVzcG9uc2U+KCcvYXBpL2xpYnJhcnkvZ2FtZXMnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiByZXMuZGF0YT8uc3RhdHVzICYmIEFycmF5LmlzQXJyYXkocmVzLmRhdGEuZ2FtZXMpKSB7XHJcbiAgICAgIGFwaUdhbWVzLnZhbHVlID0gcmVzLmRhdGEuZ2FtZXM7XHJcbiAgICAgIGFwaVN1bW1hcnkudmFsdWUgPSByZXMuZGF0YS5zdW1tYXJ5ID8/IG51bGw7XHJcbiAgICAgIG1ldGFkYXRhTm90aWNlLnZhbHVlID0gcmVzLmRhdGEubWV0YWRhdGE/LnN0YXR1cyA9PT0gJ3BlbmRpbmdfY29uZmlndXJhdGlvbidcclxuICAgICAgICA/IHJlcy5kYXRhLm1ldGFkYXRhLm1lc3NhZ2UgPz8gJ01ldGFkYXRhIHByb3ZpZGVycyBhcmUgbm90IGNvbmZpZ3VyZWQgeWV0LidcclxuICAgICAgICA6IG51bGw7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8vIEZhbGxiYWNrIGtlZXBzIHRoaXMgcm91dGUgdXNhYmxlIGFnYWluc3Qgb2xkZXIgc2VydmVyIGJ1aWxkcy5cclxuICB9XHJcbiAgYXBpR2FtZXMudmFsdWUgPSBudWxsO1xyXG4gIGFwaVN1bW1hcnkudmFsdWUgPSBudWxsO1xyXG4gIG1ldGFkYXRhTm90aWNlLnZhbHVlID0gbnVsbDtcclxufVxyXG5cclxuY29uc3QgZmFsbGJhY2tHYW1lcyA9IGNvbXB1dGVkPExpYnJhcnlHYW1lW10+KCgpID0+XHJcbiAgLy8gT25seSBzaG93IGFwcHMgdGhhdCBoYXZlIGEgbWVhbmluZ2Z1bCBuYW1lIG9yIGNvbW1hbmQg4oCUIHNraXAgYmFyZS91bm5hbWVkIGVudHJpZXNcclxuICBhcHBzLnZhbHVlXHJcbiAgICAuZmlsdGVyKChhcHApID0+IHtcclxuICAgICAgY29uc3QgbmFtZSA9IGFwcC5uYW1lPy50cmltKCk7XHJcbiAgICAgIGNvbnN0IGNtZCA9IEFycmF5LmlzQXJyYXkoYXBwLmNtZCkgPyBhcHAuY21kLmpvaW4oJycpIDogKGFwcC5jbWQgPz8gJycpO1xyXG4gICAgICByZXR1cm4gISEobmFtZSB8fCBjbWQudHJpbSgpKTtcclxuICAgIH0pXHJcbiAgICAubWFwKChhcHAsIGluZGV4KSA9PiBhcHBUb0xpYnJhcnlHYW1lKGFwcCwgaW5kZXgpKSxcclxuKTtcclxuY29uc3QgZ2FtZXMgPSBjb21wdXRlZCgoKSA9PiBhcGlHYW1lcy52YWx1ZSA/PyBmYWxsYmFja0dhbWVzLnZhbHVlKTtcclxuXHJcbmNvbnN0IHN1bW1hcnkgPSBjb21wdXRlZDxMaWJyYXJ5U3VtbWFyeT4oKCkgPT4ge1xyXG4gIGlmIChhcGlTdW1tYXJ5LnZhbHVlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvd25lZEdhbWVDb3VudDogYXBpU3VtbWFyeS52YWx1ZS5vd25lZEdhbWVDb3VudCA/PyBnYW1lcy52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIGluc3RhbGxlZEdhbWVDb3VudDogYXBpU3VtbWFyeS52YWx1ZS5pbnN0YWxsZWRHYW1lQ291bnQgPz8gZ2FtZXMudmFsdWUuZmlsdGVyKChnYW1lKSA9PiBnYW1lLmluc3RhbGxlZCkubGVuZ3RoLFxyXG4gICAgICBwbGF5YWJsZUdhbWVDb3VudDogYXBpU3VtbWFyeS52YWx1ZS5wbGF5YWJsZUdhbWVDb3VudCA/PyBnYW1lcy52YWx1ZS5maWx0ZXIoKGdhbWUpID0+IGdhbWUucGxheWFibGUpLmxlbmd0aCxcclxuICAgICAgcG9zdGVyQXZhaWxhYmxlQ291bnQ6IGFwaVN1bW1hcnkudmFsdWUucG9zdGVyQXZhaWxhYmxlQ291bnQgPz8gZ2FtZXMudmFsdWUuZmlsdGVyKChnYW1lKSA9PiAhIWdhbWUucG9zdGVyVXJsKS5sZW5ndGgsXHJcbiAgICAgIG1ldGFkYXRhQXZhaWxhYmxlQ291bnQ6IGFwaVN1bW1hcnkudmFsdWUubWV0YWRhdGFBdmFpbGFibGVDb3VudCA/PyBnYW1lcy52YWx1ZS5maWx0ZXIoKGdhbWUpID0+IGdhbWUubWV0YWRhdGFTdGF0ZSA9PT0gJ2F2YWlsYWJsZScpLmxlbmd0aCxcclxuICAgIH07XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBvd25lZEdhbWVDb3VudDogZ2FtZXMudmFsdWUubGVuZ3RoLFxyXG4gICAgaW5zdGFsbGVkR2FtZUNvdW50OiBnYW1lcy52YWx1ZS5maWx0ZXIoKGdhbWUpID0+IGdhbWUuaW5zdGFsbGVkKS5sZW5ndGgsXHJcbiAgICBwbGF5YWJsZUdhbWVDb3VudDogZ2FtZXMudmFsdWUuZmlsdGVyKChnYW1lKSA9PiBnYW1lLnBsYXlhYmxlKS5sZW5ndGgsXHJcbiAgICBwb3N0ZXJBdmFpbGFibGVDb3VudDogZ2FtZXMudmFsdWUuZmlsdGVyKChnYW1lKSA9PiAhIWdhbWUucG9zdGVyVXJsKS5sZW5ndGgsXHJcbiAgICBtZXRhZGF0YUF2YWlsYWJsZUNvdW50OiBnYW1lcy52YWx1ZS5maWx0ZXIoKGdhbWUpID0+IGdhbWUubWV0YWRhdGFTdGF0ZSA9PT0gJ2F2YWlsYWJsZScpLmxlbmd0aCxcclxuICB9O1xyXG59KTtcclxuXHJcbmNvbnN0IHNvdXJjZUZpbHRlcnMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3Qgc2VlbiA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XHJcbiAgZm9yIChjb25zdCBnYW1lIG9mIGdhbWVzLnZhbHVlKSB7XHJcbiAgICBzZWVuLnNldChnYW1lLnNvdXJjZUlkLCBnYW1lLnNvdXJjZU5hbWUpO1xyXG4gIH1cclxuICByZXR1cm4gW1xyXG4gICAgeyBpZDogJ2FsbCcsIGxhYmVsOiAnQWxsIHNvdXJjZXMnIH0sXHJcbiAgICAuLi5BcnJheS5mcm9tKHNlZW4uZW50cmllcygpKS5tYXAoKFtpZCwgbGFiZWxdKSA9PiAoeyBpZCwgbGFiZWwgfSkpLFxyXG4gIF07XHJcbn0pO1xyXG5cclxuY29uc3QgZmlsdGVyZWRHYW1lcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBxID0gc2VhcmNoUXVlcnkudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgcmV0dXJuIGdhbWVzLnZhbHVlLmZpbHRlcigoZ2FtZSkgPT4ge1xyXG4gICAgaWYgKHNvdXJjZUZpbHRlci52YWx1ZSAhPT0gJ2FsbCcgJiYgZ2FtZS5zb3VyY2VJZCAhPT0gc291cmNlRmlsdGVyLnZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoaW5zdGFsbEZpbHRlci52YWx1ZSA9PT0gJ2luc3RhbGxlZCcgJiYgIWdhbWUuaW5zdGFsbGVkKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoaW5zdGFsbEZpbHRlci52YWx1ZSA9PT0gJ25vdF9pbnN0YWxsZWQnICYmIGdhbWUuaW5zdGFsbGVkKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoIXEpIHJldHVybiB0cnVlO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgZ2FtZS50aXRsZSxcclxuICAgICAgZ2FtZS5zb3VyY2VOYW1lLFxyXG4gICAgICBnYW1lLm1ldGFkYXRhPy5kZXZlbG9wZXIsXHJcbiAgICAgIGdhbWUubWV0YWRhdGE/LnB1Ymxpc2hlcixcclxuICAgICAgZ2FtZS5tZXRhZGF0YT8uZGVzY3JpcHRpb24sXHJcbiAgICBdLnNvbWUoKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSkpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGFwcFRvTGlicmFyeUdhbWUoYXBwOiBBcHAsIGluZGV4OiBudW1iZXIpOiBMaWJyYXJ5R2FtZSB7XHJcbiAgY29uc3QgdXVpZCA9IGFwcC51dWlkID8/IG51bGw7XHJcbiAgY29uc3Qgc291cmNlSWQgPSBhcHBbJ3BsYXluaXRlLWlkJ10gPyAncGxheW5pdGVMZWdhY3knIDogJ21hbnVhbCc7XHJcbiAgY29uc3QgcGxheWFibGUgPSAhIShhcHAubmFtZSB8fCBhcHAuY21kIHx8IGFwcFsncGxheW5pdGUtaWQnXSk7XHJcbiAgY29uc3QgZ2FtZTogTGlicmFyeUdhbWUgPSB7XHJcbiAgICBpZDogdXVpZCB8fCBhcHBbJ3BsYXluaXRlLWlkJ10gfHwgYGxvY2FsOiR7aW5kZXh9YCxcclxuICAgIHV1aWQsXHJcbiAgICBzb3VyY2VJZCxcclxuICAgIHNvdXJjZU5hbWU6IHNvdXJjZUlkID09PSAncGxheW5pdGVMZWdhY3knID8gJ1BsYXluaXRlIExlZ2FjeScgOiAnTWFudWFsJyxcclxuICAgIHRpdGxlOiBhcHAubmFtZSB8fCAnVW50aXRsZWQgZ2FtZScsXHJcbiAgICBvd25lZDogdHJ1ZSxcclxuICAgIGluc3RhbGxlZDogcGxheWFibGUsXHJcbiAgICBwbGF5YWJsZSxcclxuICAgIGluc3RhbGxTdGF0ZTogcGxheWFibGUgPyAnaW5zdGFsbGVkJyA6ICdub3RfaW5zdGFsbGVkJyxcclxuICAgIHBvc3RlclN0YXRlOiB1dWlkICYmIChhcHBbJ2ltYWdlLXBhdGgnXSB8fCBhcHBbJ3BsYXluaXRlLWlkJ10pID8gJ2F2YWlsYWJsZScgOiAnbWlzc2luZycsXHJcbiAgICBtZXRhZGF0YVN0YXRlOiAncGFydGlhbCcsXHJcbiAgICBtZXRhZGF0YToge30sXHJcbiAgfTtcclxuICBpZiAoYXBwWyd3b3JraW5nLWRpciddKSB7XHJcbiAgICBnYW1lLmluc3RhbGxQYXRoID0gYXBwWyd3b3JraW5nLWRpciddO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIGFwcC5jbWQgPT09ICdzdHJpbmcnICYmIGFwcC5jbWQubGVuZ3RoID4gMCkge1xyXG4gICAgZ2FtZS5leGVjdXRhYmxlUGF0aCA9IGFwcC5jbWQ7XHJcbiAgfVxyXG4gIGlmICh1dWlkICYmIChhcHBbJ2ltYWdlLXBhdGgnXSB8fCBhcHBbJ3BsYXluaXRlLWlkJ10pKSB7XHJcbiAgICBnYW1lLnBvc3RlclVybCA9IGAvYXBpL2FwcHMvJHtlbmNvZGVVUklDb21wb25lbnQodXVpZCl9L2NvdmVyYDtcclxuICB9XHJcbiAgcmV0dXJuIGdhbWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvc3RlclVybChnYW1lOiBMaWJyYXJ5R2FtZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgaWYgKCFnYW1lLnBvc3RlclVybCB8fCBjb3ZlckVycm9ycy52YWx1ZS5oYXMoZ2FtZS5pZCkpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgcmV0dXJuIGdhbWUucG9zdGVyVXJsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkNvdmVyRXJyb3IoZ2FtZTogTGlicmFyeUdhbWUpIHtcclxuICBjb3ZlckVycm9ycy52YWx1ZS5hZGQoZ2FtZS5pZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdhbWVTdWJ0aXRsZShnYW1lOiBMaWJyYXJ5R2FtZSk6IHN0cmluZyB7XHJcbiAgY29uc3QgZGVzY3JpcHRpb24gPSBnYW1lLm1ldGFkYXRhPy5kZXNjcmlwdGlvbj8udHJpbSgpO1xyXG4gIGlmIChkZXNjcmlwdGlvbikgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIGNvbnN0IGRldmVsb3BlciA9IGdhbWUubWV0YWRhdGE/LmRldmVsb3Blcj8udHJpbSgpO1xyXG4gIGlmIChkZXZlbG9wZXIpIHJldHVybiBkZXZlbG9wZXI7XHJcbiAgaWYgKGdhbWUuaW5zdGFsbFBhdGgpIHJldHVybiBnYW1lLmluc3RhbGxQYXRoO1xyXG4gIHJldHVybiBnYW1lLmluc3RhbGxlZCA/ICdSZWFkeSBmcm9tIGxvY2FsIGNvbmZpZ3VyYXRpb24nIDogJ0F2YWlsYWJsZSBhZnRlciBpbnN0YWxsIGRldGVjdGlvbic7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxhdW5jaEdhbWUoZ2FtZTogTGlicmFyeUdhbWUpIHtcclxuICBpZiAoIWdhbWUudXVpZCkge1xyXG4gICAgYXdhaXQgYWRkUHJvdmlkZXJHYW1lKGdhbWUpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAoIWdhbWUucGxheWFibGUpIHJldHVybjtcclxuICBwZW5kaW5nTGF1bmNoLnZhbHVlID0gZ2FtZS51dWlkO1xyXG4gIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSBudWxsO1xyXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcHNTdG9yZS5sYXVuY2hBcHAoZ2FtZS51dWlkKTtcclxuICBwZW5kaW5nTGF1bmNoLnZhbHVlID0gbnVsbDtcclxuICBhY3Rpb25NZXNzYWdlLnZhbHVlID0gcmVzdWx0Lm9rXHJcbiAgICA/IHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiBgU3RhcnRpbmcgJHtnYW1lLnRpdGxlfS5gIH1cclxuICAgIDogeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgYENvdWxkIG5vdCBzdGFydCAke2dhbWUudGl0bGV9LmAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuUnVuT3JBZGQoZ2FtZTogTGlicmFyeUdhbWUpOiBib29sZWFuIHtcclxuICBpZiAoZ2FtZS51dWlkKSByZXR1cm4gZ2FtZS5wbGF5YWJsZTtcclxuICByZXR1cm4gKGdhbWUuc291cmNlSWQgPT09ICdzdGVhbScgfHwgZ2FtZS5zb3VyY2VJZCA9PT0gJ2VwaWMnKSAmJiBnYW1lLmluc3RhbGxlZCAmJiAhIWdhbWUucHJvdmlkZXJHYW1lSWQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFkZFByb3ZpZGVyR2FtZShnYW1lOiBMaWJyYXJ5R2FtZSkge1xyXG4gIGlmICgoZ2FtZS5zb3VyY2VJZCAhPT0gJ3N0ZWFtJyAmJiBnYW1lLnNvdXJjZUlkICE9PSAnZXBpYycpIHx8ICFnYW1lLnByb3ZpZGVyR2FtZUlkKSByZXR1cm47XHJcbiAgY29uc3QgY29tbWFuZCA9IGdhbWUuc291cmNlSWQgPT09ICdzdGVhbSdcclxuICAgID8gYGNtZCAvYyBzdGFydCBcIlwiIFwic3RlYW06Ly9ydW5nYW1laWQvJHtnYW1lLnByb3ZpZGVyR2FtZUlkfVwiYFxyXG4gICAgOiBgY21kIC9jIHN0YXJ0IFwiXCIgXCJjb20uZXBpY2dhbWVzLmxhdW5jaGVyOi8vYXBwcy8ke2dhbWUucHJvdmlkZXJHYW1lSWR9P2FjdGlvbj1sYXVuY2gmc2lsZW50PXRydWVcImA7XHJcbiAgcGVuZGluZ0xhdW5jaC52YWx1ZSA9IGdhbWUuaWQ7XHJcbiAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IG51bGw7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaHR0cC5wb3N0PHsgc3RhdHVzPzogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4oXHJcbiAgICAgICcvYXBpL2FwcHMnLFxyXG4gICAgICB7XHJcbiAgICAgICAgaW5kZXg6IC0xLFxyXG4gICAgICAgIG5hbWU6IGdhbWUudGl0bGUsXHJcbiAgICAgICAgY21kOiBjb21tYW5kLFxyXG4gICAgICAgICd3b3JraW5nLWRpcic6IGdhbWUuaW5zdGFsbFBhdGggfHwgJycsXHJcbiAgICAgICAgJ3NvdXJjZS1pZCc6IGdhbWUuc291cmNlSWQsXHJcbiAgICAgICAgJ3Byb3ZpZGVyLWdhbWUtaWQnOiBnYW1lLnByb3ZpZGVyR2FtZUlkLFxyXG4gICAgICAgICdhdXRvLWRldGFjaCc6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDAgJiYgcmVzcG9uc2UuZGF0YT8uc3RhdHVzKSB7XHJcbiAgICAgIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSB7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogYCR7Z2FtZS50aXRsZX0gd2FzIGFkZGVkIHRvIHRoZSBzZXJ2ZXIgbGlicmFyeS5gIH07XHJcbiAgICAgIGF3YWl0IGFwcHNTdG9yZS5sb2FkQXBwcyh0cnVlKTtcclxuICAgICAgYXdhaXQgbG9hZExpYnJhcnkoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IHtcclxuICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgdGV4dDogcmVzcG9uc2UuZGF0YT8uZXJyb3IgfHwgYENvdWxkIG5vdCBhZGQgJHtnYW1lLnRpdGxlfS5gLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IHtcclxuICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgdGV4dDogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBgQ291bGQgbm90IGFkZCAke2dhbWUudGl0bGV9LmAsXHJcbiAgICB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBwZW5kaW5nTGF1bmNoLnZhbHVlID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyRmlsdGVycygpIHtcclxuICBzZWFyY2hRdWVyeS52YWx1ZSA9ICcnO1xyXG4gIHNvdXJjZUZpbHRlci52YWx1ZSA9ICdhbGwnO1xyXG4gIGluc3RhbGxGaWx0ZXIudmFsdWUgPSAnYWxsJztcclxufVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi5saWJyYXJ5LW1ldHJpYyB7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41NXJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjA0NSk7XHJcbiAgcGFkZGluZzogMC42NXJlbSAwLjc1cmVtO1xyXG59XHJcblxyXG4ubGlicmFyeS1tZXRyaWMgc3BhbixcclxuLmxpYnJhcnktbWV0cmljIHNtYWxsIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuLmxpYnJhcnktbWV0cmljIHNwYW4ge1xyXG4gIGZvbnQtc2l6ZTogMS4wNXJlbTtcclxuICBmb250LXdlaWdodDogNzUwO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjg2KTtcclxufVxyXG5cclxuLmxpYnJhcnktbWV0cmljIHNtYWxsIHtcclxuICBtYXJnaW4tdG9wOiAwLjFyZW07XHJcbiAgZm9udC1zaXplOiAwLjcycmVtO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjU4KTtcclxufVxyXG5cclxuLmZpbHRlci1iYXIge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC13cmFwOiB3cmFwO1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjM3NXJlbTtcclxufVxyXG5cclxuLmZpbHRlci1iYXItc2VwIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICB3aWR0aDogMXB4O1xyXG4gIGhlaWdodDogMS4yNXJlbTtcclxuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4xNCk7XHJcbiAgZmxleC1zaHJpbms6IDA7XHJcbiAgbWFyZ2luOiAwIDAuMTI1cmVtO1xyXG59XHJcblxyXG4uZGFyayAuZmlsdGVyLWJhci1zZXAge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjE0KTtcclxufVxyXG5cclxuLmZpbHRlci1jaGlwIHtcclxuICBoZWlnaHQ6IDIuMTI1cmVtO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMSk7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41NXJlbTtcclxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxuICBwYWRkaW5nOiAwIDAuNzVyZW07XHJcbiAgZm9udC1zaXplOiAwLjc4cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA2NTA7XHJcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC42Nik7XHJcbiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIDE0MG1zIGVhc2UsIGJhY2tncm91bmQtY29sb3IgMTQwbXMgZWFzZSwgY29sb3IgMTQwbXMgZWFzZTtcclxufVxyXG5cclxuLmZpbHRlci1jaGlwOmhvdmVyLFxyXG4uZmlsdGVyLWNoaXAuYWN0aXZlIHtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMzUpO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMSk7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbn1cclxuXHJcbi5saWJyYXJ5LWdyaWQge1xyXG4gIGRpc3BsYXk6IGdyaWQ7XHJcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMTMuNXJlbSwgMWZyKSk7XHJcbiAgZ2FwOiAxcmVtO1xyXG59XHJcblxyXG4uZ2FtZS1jYXJkIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIG1pbi1oZWlnaHQ6IDIwcmVtO1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IDE1MG1zIGVhc2Utb3V0LCB0cmFuc2Zvcm0gMTUwbXMgZWFzZS1vdXQ7XHJcbn1cclxuXHJcbi5nYW1lLWNhcmQ6aG92ZXIge1xyXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcclxuICBib3gtc2hhZG93OiAwIDAuNDVyZW0gMS41cmVtIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMSk7XHJcbn1cclxuXHJcbi5nYW1lLXBvc3RlciB7XHJcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIGFzcGVjdC1yYXRpbzogMyAvIDQ7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICBiYWNrZ3JvdW5kOlxyXG4gICAgbGluZWFyLWdyYWRpZW50KDE0NWRlZywgcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xMiksIHRyYW5zcGFyZW50IDU4JSksXHJcbiAgICByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjA0NSk7XHJcbn1cclxuXHJcbi5nYW1lLXBvc3Rlci1pbWcge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIGhlaWdodDogMTAwJTtcclxuICB3aWR0aDogMTAwJTtcclxuICBvYmplY3QtZml0OiBjb3ZlcjtcclxufVxyXG5cclxuLmdhbWUtcG9zdGVyLWVtcHR5IHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGhlaWdodDogMTAwJTtcclxuICB3aWR0aDogMTAwJTtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG59XHJcblxyXG4ucG9zdGVyLXRvcGxpbmUge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBsZWZ0OiAwLjVyZW07XHJcbiAgcmlnaHQ6IDAuNXJlbTtcclxuICB0b3A6IDAuNXJlbTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gIGdhcDogMC41cmVtO1xyXG59XHJcblxyXG4uc291cmNlLWJhZGdlIHtcclxuICBtYXgtd2lkdGg6IDguNXJlbTtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuNjIpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC45NCk7XHJcbiAgZm9udC1zaXplOiAwLjY4cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgcGFkZGluZzogMC4xNXJlbSAwLjVyZW07XHJcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XHJcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcclxuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNnB4KTtcclxufVxyXG5cclxuLmVtcHR5LWljb24ge1xyXG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xyXG4gIGhlaWdodDogMy41cmVtO1xyXG4gIHdpZHRoOiAzLjVyZW07XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICBib3JkZXItcmFkaXVzOiAwLjg3NXJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjEpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG59XHJcblxyXG4uZGFyayAubGlicmFyeS1tZXRyaWMsXHJcbi5kYXJrIC5nYW1lLXBvc3RlciB7XHJcbiAgYmFja2dyb3VuZDpcclxuICAgIGxpbmVhci1ncmFkaWVudCgxNDVkZWcsIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMTQpLCB0cmFuc3BhcmVudCA1OCUpLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMDU1KTtcclxufVxyXG5cclxuLmRhcmsgLmxpYnJhcnktbWV0cmljIHNwYW4ge1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC44Nik7XHJcbn1cclxuXHJcbi5kYXJrIC5saWJyYXJ5LW1ldHJpYyBzbWFsbCB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjU4KTtcclxufVxyXG5cclxuLmRhcmsgLmZpbHRlci1jaGlwIHtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjEyKTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuNjYpO1xyXG59XHJcblxyXG4uZGFyayAuZ2FtZS1jYXJkOmhvdmVyIHtcclxuICBib3gtc2hhZG93OiAwIDAuNDVyZW0gMS41cmVtIHJnYigwIDAgMCAvIDAuMjgpO1xyXG59XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6WyJfb3BlbkJsb2NrIiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfdG9EaXNwbGF5U3RyaW5nIiwiX2NyZWF0ZUJsb2NrIiwiX3VucmVmIiwiX2NyZWF0ZVRleHRWTm9kZSIsIl9jcmVhdGVWTm9kZSIsIl9GcmFnbWVudCIsIl9yZW5kZXJMaXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwT0EsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sRUFBRSxLQUFBLElBQVMsWUFBWSxTQUFTO0FBRWhDLFVBQUEsV0FBVyxJQUEwQixJQUFJO0FBQ3pDLFVBQUEsYUFBYSxJQUFvQyxJQUFJO0FBQ3JELFVBQUEsaUJBQWlCLElBQW1CLElBQUk7QUFDeEMsVUFBQSxjQUFjLElBQUksRUFBRTtBQUNwQixVQUFBLGVBQWUsSUFBSSxLQUFLO0FBQ3hCLFVBQUEsZ0JBQWdCLElBQUksS0FBSztBQUMvQixVQUFNLGNBQWMsSUFBUSxvQkFBQSxJQUFhLENBQUE7QUFDbkMsVUFBQSxnQkFBZ0IsSUFBbUIsSUFBSTtBQUN2QyxVQUFBLGdCQUFnQixJQUEwQixJQUFJO0FBRzlDLFVBQUEsaUJBQWlCLElBQUksS0FBSztBQUMxQixVQUFBLGVBQWUsSUFBSSxDQUFDO0FBQ3BCLFVBQUEsZ0JBQWdCLElBQUksQ0FBQztBQUMzQixRQUFJLG9CQUEyRDtBQUMvRCxRQUFJLG1CQUFtQjtBQUV2QixtQkFBZSx1QkFBdUI7O0FBQ2hDLFVBQUE7QUFDSSxjQUFBLE1BQU0sTUFBTSxLQUFLO0FBQUEsVUFDckI7QUFBQSxVQUNBLEVBQUUsZ0JBQWdCLE1BQU0sS0FBSztBQUFBLFFBQUE7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
