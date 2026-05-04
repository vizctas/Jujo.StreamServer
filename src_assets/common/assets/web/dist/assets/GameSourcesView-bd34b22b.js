import { k as defineComponent, $ as storeToRefs, r as ref, o as onMounted, c as computed, O as createElementBlock, V as createBaseVNode, U as createVNode, S as withCtx, Z as unref, M as createBlock, W as createCommentVNode, F as Fragment, a1 as renderList, Q as openBlock, a0 as RouterLink, j as createTextVNode, P as toDisplayString, a7 as normalizeStyle, l as withDirectives, a6 as vModelText, Y as withKeys, X as withModifiers, H as normalizeClass } from "./vue-core-de07660f.js";
import { b as useAppsStore, h as http, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { aq as NButton, ap as NAlert, aE as NTag } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "mx-auto max-w-6xl space-y-6" };
const _hoisted_2 = { class: "page-surface p-5 md:p-6" };
const _hoisted_3 = { class: "flex flex-col gap-4 md:flex-row md:items-start md:justify-between" };
const _hoisted_4 = ["href", "onClick"];
const _hoisted_5 = { class: "grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3" };
const _hoisted_6 = ["aria-label"];
const _hoisted_7 = { class: "source-banner-media" };
const _hoisted_8 = ["src", "alt"];
const _hoisted_9 = {
  key: 1,
  class: "source-mark-text"
};
const _hoisted_10 = { class: "source-body" };
const _hoisted_11 = { class: "min-w-0 space-y-4" };
const _hoisted_12 = { class: "space-y-1" };
const _hoisted_13 = { class: "flex min-h-[1.75rem] flex-wrap items-center gap-2" };
const _hoisted_14 = { class: "text-base font-semibold" };
const _hoisted_15 = { class: "text-sm leading-6 text-dark/68 dark:text-light/68" };
const _hoisted_16 = { class: "space-y-2 text-xs text-dark/62 dark:text-light/62" };
const _hoisted_17 = { class: "grid grid-cols-2 gap-2 text-center" };
const _hoisted_18 = { class: "source-stat" };
const _hoisted_19 = { class: "source-stat" };
const _hoisted_20 = { class: "flex items-center gap-2" };
const _hoisted_21 = { class: "flex items-center gap-2" };
const _hoisted_22 = { class: "source-actions" };
const _hoisted_23 = {
  key: 0,
  class: "steam-fallback"
};
const _hoisted_24 = { class: "steam-key-row" };
const _hoisted_25 = ["placeholder", "onKeydown"];
const _hoisted_26 = ["aria-label"];
const _hoisted_27 = { class: "sync-step-dot" };
const _hoisted_28 = {
  key: 2,
  class: "sync-step-spinner"
};
const _hoisted_29 = { class: "sync-step-label" };
const _hoisted_30 = { class: "source-actions-main" };
const _hoisted_31 = ["href", "onClick"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GameSourcesView",
  setup(__props) {
    const SYNC_STEPS = [
      { id: "connect", label: "Verifying connection", state: "pending" },
      { id: "fetch", label: "Fetching owned library", state: "pending" },
      { id: "match", label: "Matching installed games", state: "pending" },
      { id: "meta", label: "Loading metadata & posters", state: "pending" }
    ];
    const appsStore = useAppsStore();
    const { apps } = storeToRefs(appsStore);
    const apiSources = ref(null);
    const pendingAction = ref(null);
    const actionMessage = ref(null);
    const syncProgress = ref({});
    const steamApiKey = ref("");
    onMounted(() => {
      void appsStore.loadApps(false);
      void loadGameSources();
    });
    async function loadGameSources() {
      var _a;
      try {
        const res = await http.get("/api/game-sources", { validateStatus: () => true });
        if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.status) && Array.isArray(res.data.sources)) {
          apiSources.value = res.data.sources;
        }
      } catch {
        apiSources.value = null;
      }
    }
    const hasManual = computed(() => apps.value.some((app) => !app["playnite-id"]));
    const hasPlaynite = computed(() => apps.value.some((app) => !!app["playnite-id"]));
    const fallbackSourceContracts = computed(() => [
      { id: "steam", name: "Steam", connected: false, connectionState: "requires_action", syncState: "not_started" },
      { id: "epic", name: "Epic Games", connected: false, connectionState: "requires_action", syncState: "not_started" },
      { id: "gog", name: "GOG", connected: false, connectionState: "requires_action", syncState: "not_started" },
      { id: "xbox", name: "Xbox", connected: false, connectionState: "requires_action", syncState: "not_started" },
      { id: "manual", name: "Manual", connected: hasManual.value, connectionState: hasManual.value ? "connected" : "available", syncState: "ready", ownedGameCount: apps.value.length, installedGameCount: apps.value.length, playableGameCount: apps.value.length }
    ]);
    const sources = computed(
      () => (apiSources.value ?? fallbackSourceContracts.value).filter((item) => {
        if (item.id === "playniteLegacy") {
          return hasPlaynite.value || item.disabled !== true && item.connectionState !== "disabled";
        }
        return true;
      }).map(source)
    );
    function source(item) {
      var _a;
      const connected = !!item.connected;
      const requiresAction = item.connectionState === "requires_action";
      const disabled = item.connectionState === "disabled" || item.disabled === true;
      return {
        id: item.id,
        name: item.name,
        connected,
        mark: sourceMark(item.id),
        logoUrl: sourceLogo(item.id),
        logoPosition: sourceBannerPosition(item.id),
        description: sourceDescription(item.id),
        ownedGameCount: item.ownedGameCount ?? item.gamesCount ?? 0,
        installedGameCount: item.installedGameCount ?? item.playableGameCount ?? 0,
        playableGameCount: item.playableGameCount ?? 0,
        apiKeyConfigured: ((_a = item.publicConfig) == null ? void 0 : _a["apiKeyConfigured"]) === true,
        statusLabel: disabled ? "Disabled" : connected ? "Connected" : requiresAction ? "Setup needed" : item.id === "manual" ? "Available" : "Not connected",
        statusType: connected ? "success" : requiresAction ? "warning" : item.id === "manual" ? "info" : "default",
        security: item.id === "manual" ? "No account token required" : connected ? item.tokenEncrypted ? "Account token is stored encrypted" : "Connected token state requires encryption audit" : item.statusMessage ?? "Provider account setup required before syncing owned games",
        sync: connected ? sourceSyncLabel(item) : "Sync not started"
      };
    }
    async function connectSource(id) {
      await runSourceAction(id, "connect");
    }
    async function saveSteamApiKey() {
      const apiKey = steamApiKey.value.trim();
      if (!apiKey)
        return;
      await runSourceAction("steam", "connect", { apiKey });
      steamApiKey.value = "";
      await loadGameSources();
    }
    async function syncSource(id) {
      syncProgress.value[id] = SYNC_STEPS.map((s) => ({ ...s, state: "pending" }));
      const steps = syncProgress.value[id];
      const advance = (stepId, state) => {
        const s = steps.find((x) => x.id === stepId);
        if (s)
          s.state = state;
      };
      advance("connect", "active");
      await new Promise((r) => setTimeout(r, 300));
      advance("connect", "done");
      advance("fetch", "active");
      if (id === "steam") {
        const captured = await captureSteamWebLibrary();
        if (captured) {
          advance("fetch", "done");
          advance("match", "done");
          advance("meta", "active");
          await new Promise((r) => setTimeout(r, 250));
          advance("meta", "done");
          await loadGameSources();
          await appsStore.loadApps(false);
          await new Promise((r) => setTimeout(r, 800));
          delete syncProgress.value[id];
          return;
        }
        advance("fetch", "error");
        actionMessage.value = {
          type: "warning",
          text: "Could not fetch your Steam owned library from the web — ensure you are logged into Steam in this browser. Falling back to local installed game detection."
        };
      }
      await new Promise((r) => setTimeout(r, 400));
      advance("fetch", "done");
      advance("match", "active");
      await runSourceAction(id, "sync");
      advance("match", "done");
      advance("meta", "active");
      await new Promise((r) => setTimeout(r, 250));
      advance("meta", "done");
      await new Promise((r) => setTimeout(r, 800));
      delete syncProgress.value[id];
    }
    function steamAccountIdFromSteamId(steamId) {
      if (typeof steamId !== "string" || !/^\d+$/.test(steamId))
        return null;
      try {
        return (BigInt(steamId) - 76561197960265728n).toString();
      } catch {
        return null;
      }
    }
    async function captureSteamWebLibrary() {
      var _a, _b, _c;
      const steam = (_a = apiSources.value) == null ? void 0 : _a.find((x) => x.id === "steam");
      const accountId = steamAccountIdFromSteamId((_b = steam == null ? void 0 : steam.publicConfig) == null ? void 0 : _b["steamId"]);
      if (!accountId)
        return false;
      try {
        const url = new URL("https://store.steampowered.com/dynamicstore/userdata/");
        url.searchParams.set("id", accountId);
        url.searchParams.set("l", "english");
        url.searchParams.set("origin", window.location.origin);
        url.searchParams.set("v", String(Date.now()));
        const steamRes = await fetch(url.toString(), {
          credentials: "include",
          mode: "cors",
          cache: "no-store"
        });
        if (!steamRes.ok)
          return false;
        const data = await steamRes.json();
        const ownedAppIds = Array.isArray(data == null ? void 0 : data.rgOwnedApps) ? data.rgOwnedApps : [];
        if (ownedAppIds.length === 0)
          return false;
        const importRes = await http.post(
          "/api/game-sources/steam/web-library",
          { ownedAppIds },
          { validateStatus: () => true }
        );
        if (importRes.status < 200 || importRes.status >= 300 || ((_c = importRes.data) == null ? void 0 : _c.status) === false) {
          return false;
        }
        const count = importRes.data.ownedGameCount ?? ownedAppIds.length;
        actionMessage.value = {
          type: "success",
          text: `Steam web library synced: ${count} owned, ${importRes.data.installedGameCount ?? 0} installed.`
        };
        return true;
      } catch {
        actionMessage.value = {
          type: "info",
          text: "To import your full Steam library, open store.steampowered.com in this browser, sign in, then click Sync again. Your profile can remain private."
        };
        return false;
      }
    }
    async function disconnectSource(id) {
      await runSourceAction(id, "disconnect");
      if (id === "playniteLegacy") {
        await appsStore.loadApps(false);
      }
    }
    async function runSourceAction(id, action, payload = {}) {
      pendingAction.value = `${id}:${action}`;
      actionMessage.value = null;
      try {
        const res = await http.post(
          `/api/game-sources/${encodeURIComponent(id)}/${action}`,
          payload,
          { validateStatus: () => true }
        );
        const body = res.data ?? {};
        if (res.status >= 200 && res.status < 300 && body.status !== false) {
          if (body.authUrl) {
            const popup = window.open(body.authUrl, "_blank", "width=980,height=760");
            if (popup) {
              const onMessage = async (e) => {
                var _a;
                if (((_a = e.data) == null ? void 0 : _a.type) === "sunshine:source-connected") {
                  window.removeEventListener("message", onMessage);
                  clearInterval(pollTimer);
                  await loadGameSources();
                  if (e.data.sourceId) {
                    await syncSource(e.data.sourceId);
                  }
                }
              };
              window.addEventListener("message", onMessage);
              let pollCount = 0;
              const pollTimer = setInterval(async () => {
                var _a;
                pollCount++;
                await loadGameSources();
                if (popup.closed || pollCount > 80) {
                  clearInterval(pollTimer);
                  window.removeEventListener("message", onMessage);
                  const s = (_a = apiSources.value) == null ? void 0 : _a.find((x) => x.id === id);
                  if ((s == null ? void 0 : s.connected) && s.syncState === "not_started") {
                    await syncSource(id);
                  }
                }
              }, 1500);
            }
          }
          const requirements = Array.isArray(body.requirements) && body.requirements.length ? ` Requirements: ${body.requirements.join(", ")}.` : "";
          actionMessage.value = {
            type: body.connectionState === "requires_action" || body.syncState === "requires_connection" ? "warning" : "success",
            text: `${body.message || "Source action completed."}${requirements}`
          };
          await loadGameSources();
          return;
        }
        actionMessage.value = {
          type: "error",
          text: body.error || `Source action failed (${res.status}).`
        };
      } catch (error) {
        actionMessage.value = {
          type: "error",
          text: error instanceof Error ? error.message : "Source action failed."
        };
      } finally {
        pendingAction.value = null;
      }
    }
    function sourceLogo(id) {
      const base = "./";
      const logos = {
        steam: `${base}images/platforms/steam.jpg`,
        epic: `${base}images/platforms/epic.jpg`,
        gog: `${base}images/platforms/gog.jpg`,
        xbox: `${base}images/platforms/xbox.jpg`,
        playniteLegacy: `${base}images/platforms/playnite.jpg`
      };
      return logos[id] ?? null;
    }
    function sourceBannerPosition(id) {
      const positions = {
        xbox: "center 60%"
      };
      return positions[id] ?? null;
    }
    function sourceMark(id) {
      const marks = {
        steam: "ST",
        epic: "EP",
        gog: "GOG",
        xbox: "XB",
        manual: "+",
        playniteLegacy: "PL"
      };
      return marks[id] ?? id.slice(0, 2).toUpperCase();
    }
    function sourceDescription(id) {
      const descriptions = {
        steam: "Web login imports your Steam library, then local manifests mark installed titles.",
        epic: "Connect Epic Games and detect installed launcher titles.",
        gog: "Connect GOG/Galaxy ownership and local installs.",
        xbox: "Connect Microsoft/Xbox libraries and PC Game Pass installs.",
        manual: "Add a game by executable path when it is not tied to a connected store.",
        playniteLegacy: "Import existing Playnite-backed entries as a compatibility path."
      };
      return descriptions[id] ?? "Connect and sync this source.";
    }
    function sourceSyncLabel(item) {
      const count = item.playableGameCount ?? item.gamesCount ?? 0;
      if (count > 0)
        return `${count} playable game${count === 1 ? "" : "s"} detected`;
      return item.syncState === "ready" ? "Connected, no playable games detected" : "Local entries found in current library";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("section", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[3] || (_cache[3] = createBaseVNode(
              "div",
              { class: "max-w-2xl space-y-2" },
              [
                createBaseVNode("p", { class: "text-xs font-semibold uppercase tracking-wide text-primary" }, "Game Sources"),
                createBaseVNode("h1", { class: "text-2xl font-semibold tracking-tight" }, "Connect your game libraries"),
                createBaseVNode("p", { class: "text-sm leading-6 text-dark/70 dark:text-light/70" }, " Sign in to your platforms so Jujo.Stream can validate your library, detect installed games on this PC, and keep the streaming library current. Manual games remain available for anything outside a store. ")
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
                    strong: ""
                  }, {
                    default: withCtx(() => [
                      createVNode(LucideIcon, {
                        name: "fa-gamepad",
                        size: 16
                      }),
                      _cache[2] || (_cache[2] = createBaseVNode(
                        "span",
                        null,
                        "Open Library",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    _: 1,
                    __: [2]
                  })
                ], 8, _hoisted_4)
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ]),
        actionMessage.value ? (openBlock(), createBlock(unref(NAlert), {
          key: 0,
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
        createBaseVNode("section", _hoisted_5, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(sources.value, (source2) => {
              return openBlock(), createElementBlock("article", {
                key: source2.id,
                class: "source-card page-surface"
              }, [
                createBaseVNode("div", {
                  class: "source-banner",
                  "aria-label": source2.name + " banner"
                }, [
                  createBaseVNode("div", _hoisted_7, [
                    source2.logoUrl ? (openBlock(), createElementBlock("img", {
                      key: 0,
                      src: source2.logoUrl,
                      alt: source2.name + " logo",
                      class: "source-banner-img",
                      style: normalizeStyle(source2.logoPosition ? { objectPosition: source2.logoPosition } : {})
                    }, null, 12, _hoisted_8)) : (openBlock(), createElementBlock(
                      "span",
                      _hoisted_9,
                      toDisplayString(source2.mark),
                      1
                      /* TEXT */
                    ))
                  ])
                ], 8, _hoisted_6),
                createBaseVNode("div", _hoisted_10, [
                  createBaseVNode("div", _hoisted_11, [
                    createBaseVNode("div", _hoisted_12, [
                      createBaseVNode("div", _hoisted_13, [
                        createBaseVNode(
                          "h2",
                          _hoisted_14,
                          toDisplayString(source2.name),
                          1
                          /* TEXT */
                        ),
                        createVNode(unref(NTag), {
                          type: source2.statusType,
                          bordered: false,
                          size: "small"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(
                              toDisplayString(source2.statusLabel),
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
                        _hoisted_15,
                        toDisplayString(source2.description),
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("div", _hoisted_16, [
                      createBaseVNode("div", _hoisted_17, [
                        createBaseVNode("div", _hoisted_18, [
                          createBaseVNode(
                            "span",
                            null,
                            toDisplayString(source2.ownedGameCount),
                            1
                            /* TEXT */
                          ),
                          _cache[4] || (_cache[4] = createBaseVNode(
                            "small",
                            null,
                            "Owned",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        createBaseVNode("div", _hoisted_19, [
                          createBaseVNode(
                            "span",
                            null,
                            toDisplayString(source2.installedGameCount),
                            1
                            /* TEXT */
                          ),
                          _cache[5] || (_cache[5] = createBaseVNode(
                            "small",
                            null,
                            "Installed",
                            -1
                            /* CACHED */
                          ))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_20, [
                        createVNode(LucideIcon, {
                          name: "fa-shield-halved",
                          size: 14
                        }),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(source2.security),
                          1
                          /* TEXT */
                        )
                      ]),
                      createBaseVNode("div", _hoisted_21, [
                        createVNode(LucideIcon, {
                          name: "fa-sync",
                          size: 14
                        }),
                        createBaseVNode(
                          "span",
                          null,
                          toDisplayString(source2.sync),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_22, [
                    source2.id === "steam" ? (openBlock(), createElementBlock("details", _hoisted_23, [
                      createBaseVNode("summary", null, [
                        createVNode(LucideIcon, {
                          name: "fa-key",
                          size: 13
                        }),
                        _cache[6] || (_cache[6] = createBaseVNode(
                          "span",
                          null,
                          "Private account fallback",
                          -1
                          /* CACHED */
                        ))
                      ]),
                      createBaseVNode("div", _hoisted_24, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => steamApiKey.value = $event),
                          type: "password",
                          autocomplete: "off",
                          spellcheck: "false",
                          class: "steam-key-input",
                          placeholder: source2.apiKeyConfigured ? "Fallback key saved" : "Optional Steam Web API key",
                          onKeydown: withKeys(withModifiers(saveSteamApiKey, ["prevent"]), ["enter"])
                        }, null, 40, _hoisted_25), [
                          [vModelText, steamApiKey.value]
                        ]),
                        createVNode(unref(NButton), {
                          secondary: "",
                          strong: "",
                          class: "steam-key-save",
                          disabled: !steamApiKey.value.trim(),
                          loading: pendingAction.value === "steam:connect",
                          onClick: saveSteamApiKey
                        }, {
                          default: withCtx(() => [
                            createVNode(LucideIcon, {
                              name: "fa-save",
                              size: 14
                            }),
                            _cache[7] || (_cache[7] = createBaseVNode(
                              "span",
                              null,
                              "Save",
                              -1
                              /* CACHED */
                            ))
                          ]),
                          _: 1,
                          __: [7]
                        }, 8, ["disabled", "loading"])
                      ])
                    ])) : createCommentVNode("v-if", true),
                    createCommentVNode(" Sync progress pipeline "),
                    syncProgress.value[source2.id] ? (openBlock(), createElementBlock("div", {
                      key: 1,
                      class: "sync-pipeline",
                      "aria-label": "Syncing " + source2.name
                    }, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(syncProgress.value[source2.id], (step) => {
                          return openBlock(), createElementBlock(
                            "div",
                            {
                              key: step.id,
                              class: normalizeClass(["sync-step", "sync-step--" + step.state])
                            },
                            [
                              createBaseVNode("span", _hoisted_27, [
                                step.state === "done" ? (openBlock(), createBlock(LucideIcon, {
                                  key: 0,
                                  name: "fa-check",
                                  size: 10
                                })) : step.state === "error" ? (openBlock(), createBlock(LucideIcon, {
                                  key: 1,
                                  name: "fa-xmark",
                                  size: 10
                                })) : step.state === "active" ? (openBlock(), createElementBlock("span", _hoisted_28)) : createCommentVNode("v-if", true)
                              ]),
                              createBaseVNode(
                                "span",
                                _hoisted_29,
                                toDisplayString(step.label),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 8, _hoisted_26)) : createCommentVNode("v-if", true),
                    createBaseVNode("div", _hoisted_30, [
                      createCommentVNode(" Store sources: show Connect or Disconnect depending on connection state "),
                      source2.id !== "manual" ? (openBlock(), createElementBlock(
                        Fragment,
                        { key: 0 },
                        [
                          !source2.connected ? (openBlock(), createBlock(unref(NButton), {
                            key: 0,
                            type: "primary",
                            secondary: "",
                            strong: "",
                            class: "source-connect",
                            loading: pendingAction.value === source2.id + ":connect",
                            "aria-label": "Connect " + source2.name,
                            onClick: ($event) => connectSource(source2.id)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: "fa-plug",
                                size: 15
                              }),
                              createBaseVNode(
                                "span",
                                null,
                                toDisplayString(source2.id === "playniteLegacy" ? "Enable" : "Connect"),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["loading", "aria-label", "onClick"])) : (openBlock(), createBlock(unref(NButton), {
                            key: 1,
                            type: "error",
                            secondary: "",
                            strong: "",
                            class: "source-connect",
                            loading: pendingAction.value === source2.id + ":disconnect",
                            "aria-label": "Disconnect " + source2.name,
                            onClick: ($event) => disconnectSource(source2.id)
                          }, {
                            default: withCtx(() => [
                              createVNode(LucideIcon, {
                                name: "fa-link-slash",
                                size: 15
                              }),
                              createBaseVNode(
                                "span",
                                null,
                                toDisplayString(source2.id === "playniteLegacy" ? "Disable" : "Disconnect"),
                                1
                                /* TEXT */
                              )
                            ]),
                            _: 2
                            /* DYNAMIC */
                          }, 1032, ["loading", "aria-label", "onClick"]))
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : source2.id === "manual" ? (openBlock(), createElementBlock(
                        Fragment,
                        { key: 1 },
                        [
                          createCommentVNode(" Manual: open add game form "),
                          createVNode(unref(RouterLink), {
                            to: "/applications?add=1",
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
                                  secondary: "",
                                  strong: "",
                                  class: "source-connect"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(LucideIcon, {
                                      name: "fa-plus",
                                      size: 15
                                    }),
                                    _cache[8] || (_cache[8] = createBaseVNode(
                                      "span",
                                      null,
                                      "Add Game",
                                      -1
                                      /* CACHED */
                                    ))
                                  ]),
                                  _: 1,
                                  __: [8]
                                })
                              ], 8, _hoisted_31)
                            ]),
                            _: 1
                            /* STABLE */
                          })
                        ],
                        2112
                        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                      )) : createCommentVNode("v-if", true),
                      createCommentVNode(" Sync button: only when connected "),
                      source2.id !== "manual" && source2.id !== "playniteLegacy" && source2.connected ? (openBlock(), createBlock(unref(NButton), {
                        key: 2,
                        class: "source-sync-btn",
                        type: "default",
                        secondary: "",
                        strong: "",
                        loading: pendingAction.value === source2.id + ":sync",
                        "aria-label": "Sync " + source2.name,
                        title: "Sync " + source2.name,
                        onClick: ($event) => syncSource(source2.id)
                      }, {
                        default: withCtx(() => [
                          createVNode(LucideIcon, {
                            name: "fa-sync",
                            size: 15
                          }),
                          _cache[9] || (_cache[9] = createBaseVNode(
                            "span",
                            null,
                            "Sync",
                            -1
                            /* CACHED */
                          ))
                        ]),
                        _: 2,
                        __: [9]
                      }, 1032, ["loading", "aria-label", "title", "onClick"])) : createCommentVNode("v-if", true)
                    ])
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]);
    };
  }
});
const GameSourcesView_vue_vue_type_style_index_0_scoped_72476dc6_lang = "";
const GameSourcesView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-72476dc6"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/GameSourcesView.vue"]]);
export {
  GameSourcesView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVNvdXJjZXNWaWV3LWJkMzRiMjJiLmpzIiwic291cmNlcyI6WyIuLi8uLi92aWV3cy9HYW1lU291cmNlc1ZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwibXgtYXV0byBtYXgtdy02eGwgc3BhY2UteS02XCI+XHJcbiAgICA8c2VjdGlvbiBjbGFzcz1cInBhZ2Utc3VyZmFjZSBwLTUgbWQ6cC02XCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC00IG1kOmZsZXgtcm93IG1kOml0ZW1zLXN0YXJ0IG1kOmp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtYXgtdy0yeGwgc3BhY2UteS0yXCI+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSB0ZXh0LXByaW1hcnlcIj5HYW1lIFNvdXJjZXM8L3A+XHJcbiAgICAgICAgICA8aDEgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LXNlbWlib2xkIHRyYWNraW5nLXRpZ2h0XCI+Q29ubmVjdCB5b3VyIGdhbWUgbGlicmFyaWVzPC9oMT5cclxuICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1zbSBsZWFkaW5nLTYgdGV4dC1kYXJrLzcwIGRhcms6dGV4dC1saWdodC83MFwiPlxyXG4gICAgICAgICAgICBTaWduIGluIHRvIHlvdXIgcGxhdGZvcm1zIHNvIEp1am8uU3RyZWFtIGNhbiB2YWxpZGF0ZSB5b3VyIGxpYnJhcnksIGRldGVjdCBpbnN0YWxsZWQgZ2FtZXNcclxuICAgICAgICAgICAgb24gdGhpcyBQQywgYW5kIGtlZXAgdGhlIHN0cmVhbWluZyBsaWJyYXJ5IGN1cnJlbnQuIE1hbnVhbCBnYW1lcyByZW1haW4gYXZhaWxhYmxlIGZvclxyXG4gICAgICAgICAgICBhbnl0aGluZyBvdXRzaWRlIGEgc3RvcmUuXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPFJvdXRlckxpbmsgdG89XCIvbGlicmFyeVwiIGN1c3RvbSB2LXNsb3Q9XCJ7IG5hdmlnYXRlLCBocmVmIH1cIj5cclxuICAgICAgICAgIDxhIDpocmVmPVwiaHJlZlwiIEBjbGljaz1cIm5hdmlnYXRlXCI+XHJcbiAgICAgICAgICAgIDxuLWJ1dHRvbiB0YWc9XCJzcGFuXCIgc3Ryb25nPlxyXG4gICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1nYW1lcGFkXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgICAgPHNwYW4+T3BlbiBMaWJyYXJ5PC9zcGFuPlxyXG4gICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgPC9hPlxyXG4gICAgICAgIDwvUm91dGVyTGluaz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L3NlY3Rpb24+XHJcblxyXG4gICAgPG4tYWxlcnQgdi1pZj1cImFjdGlvbk1lc3NhZ2VcIiA6dHlwZT1cImFjdGlvbk1lc3NhZ2UudHlwZVwiIDpib3JkZXJlZD1cImZhbHNlXCIgY2xvc2FibGUgQGNsb3NlPVwiYWN0aW9uTWVzc2FnZSA9IG51bGxcIj5cclxuICAgICAge3sgYWN0aW9uTWVzc2FnZS50ZXh0IH19XHJcbiAgICA8L24tYWxlcnQ+XHJcblxyXG4gICAgPHNlY3Rpb24gY2xhc3M9XCJncmlkIGl0ZW1zLXN0cmV0Y2ggZ2FwLTUgbWQ6Z3JpZC1jb2xzLTIgeGw6Z3JpZC1jb2xzLTNcIj5cclxuICAgICAgPGFydGljbGUgdi1mb3I9XCJzb3VyY2UgaW4gc291cmNlc1wiIDprZXk9XCJzb3VyY2UuaWRcIiBjbGFzcz1cInNvdXJjZS1jYXJkIHBhZ2Utc3VyZmFjZVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzb3VyY2UtYmFubmVyXCIgOmFyaWEtbGFiZWw9XCJzb3VyY2UubmFtZSArICcgYmFubmVyJ1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNvdXJjZS1iYW5uZXItbWVkaWFcIj5cclxuICAgICAgICAgICAgPGltZ1xyXG4gICAgICAgICAgICAgIHYtaWY9XCJzb3VyY2UubG9nb1VybFwiXHJcbiAgICAgICAgICAgICAgOnNyYz1cInNvdXJjZS5sb2dvVXJsXCJcclxuICAgICAgICAgICAgICA6YWx0PVwic291cmNlLm5hbWUgKyAnIGxvZ28nXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cInNvdXJjZS1iYW5uZXItaW1nXCJcclxuICAgICAgICAgICAgICA6c3R5bGU9XCJzb3VyY2UubG9nb1Bvc2l0aW9uID8geyBvYmplY3RQb3NpdGlvbjogc291cmNlLmxvZ29Qb3NpdGlvbiB9IDoge31cIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8c3BhbiB2LWVsc2UgY2xhc3M9XCJzb3VyY2UtbWFyay10ZXh0XCI+e3sgc291cmNlLm1hcmsgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNvdXJjZS1ib2R5XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWluLXctMCBzcGFjZS15LTRcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNlLXktMVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IG1pbi1oLVsxLjc1cmVtXSBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZFwiPnt7IHNvdXJjZS5uYW1lIH19PC9oMj5cclxuICAgICAgICAgICAgICAgIDxuLXRhZyA6dHlwZT1cInNvdXJjZS5zdGF0dXNUeXBlXCIgOmJvcmRlcmVkPVwiZmFsc2VcIiBzaXplPVwic21hbGxcIj5cclxuICAgICAgICAgICAgICAgICAge3sgc291cmNlLnN0YXR1c0xhYmVsIH19XHJcbiAgICAgICAgICAgICAgICA8L24tdGFnPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1zbSBsZWFkaW5nLTYgdGV4dC1kYXJrLzY4IGRhcms6dGV4dC1saWdodC82OFwiPlxyXG4gICAgICAgICAgICAgICAge3sgc291cmNlLmRlc2NyaXB0aW9uIH19XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFjZS15LTIgdGV4dC14cyB0ZXh0LWRhcmsvNjIgZGFyazp0ZXh0LWxpZ2h0LzYyXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTIgdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VyY2Utc3RhdFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3Bhbj57eyBzb3VyY2Uub3duZWRHYW1lQ291bnQgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxzbWFsbD5Pd25lZDwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VyY2Utc3RhdFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3Bhbj57eyBzb3VyY2UuaW5zdGFsbGVkR2FtZUNvdW50IH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8c21hbGw+SW5zdGFsbGVkPC9zbWFsbD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXNoaWVsZC1oYWx2ZWRcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICAgIDxzcGFuPnt7IHNvdXJjZS5zZWN1cml0eSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zeW5jXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICA8c3Bhbj57eyBzb3VyY2Uuc3luYyB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic291cmNlLWFjdGlvbnNcIj5cclxuICAgICAgICAgICAgPGRldGFpbHMgdi1pZj1cInNvdXJjZS5pZCA9PT0gJ3N0ZWFtJ1wiIGNsYXNzPVwic3RlYW0tZmFsbGJhY2tcIj5cclxuICAgICAgICAgICAgICA8c3VtbWFyeT5cclxuICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1rZXlcIiA6c2l6ZT1cIjEzXCIgLz5cclxuICAgICAgICAgICAgICAgIDxzcGFuPlByaXZhdGUgYWNjb3VudCBmYWxsYmFjazwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L3N1bW1hcnk+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0ZWFtLWtleS1yb3dcIj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICB2LW1vZGVsPVwic3RlYW1BcGlLZXlcIlxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxyXG4gICAgICAgICAgICAgICAgICBzcGVsbGNoZWNrPVwiZmFsc2VcIlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cInN0ZWFtLWtleS1pbnB1dFwiXHJcbiAgICAgICAgICAgICAgICAgIDpwbGFjZWhvbGRlcj1cInNvdXJjZS5hcGlLZXlDb25maWd1cmVkID8gJ0ZhbGxiYWNrIGtleSBzYXZlZCcgOiAnT3B0aW9uYWwgU3RlYW0gV2ViIEFQSSBrZXknXCJcclxuICAgICAgICAgICAgICAgICAgQGtleWRvd24uZW50ZXIucHJldmVudD1cInNhdmVTdGVhbUFwaUtleVwiXHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxyXG4gICAgICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJzdGVhbS1rZXktc2F2ZVwiXHJcbiAgICAgICAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFzdGVhbUFwaUtleS50cmltKClcIlxyXG4gICAgICAgICAgICAgICAgICA6bG9hZGluZz1cInBlbmRpbmdBY3Rpb24gPT09ICdzdGVhbTpjb25uZWN0J1wiXHJcbiAgICAgICAgICAgICAgICAgIEBjbGljaz1cInNhdmVTdGVhbUFwaUtleVwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1zYXZlXCIgOnNpemU9XCIxNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuPlNhdmU8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2RldGFpbHM+XHJcbiAgICAgICAgICAgIDwhLS0gU3luYyBwcm9ncmVzcyBwaXBlbGluZSAtLT5cclxuICAgICAgICAgICAgPGRpdiB2LWlmPVwic3luY1Byb2dyZXNzW3NvdXJjZS5pZF1cIiBjbGFzcz1cInN5bmMtcGlwZWxpbmVcIiA6YXJpYS1sYWJlbD1cIidTeW5jaW5nICcgKyBzb3VyY2UubmFtZVwiPlxyXG4gICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIHYtZm9yPVwic3RlcCBpbiBzeW5jUHJvZ3Jlc3Nbc291cmNlLmlkXVwiXHJcbiAgICAgICAgICAgICAgICA6a2V5PVwic3RlcC5pZFwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInN5bmMtc3RlcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCInc3luYy1zdGVwLS0nICsgc3RlcC5zdGF0ZVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzeW5jLXN0ZXAtZG90XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIHYtaWY9XCJzdGVwLnN0YXRlID09PSAnZG9uZSdcIiBuYW1lPVwiZmEtY2hlY2tcIiA6c2l6ZT1cIjEwXCIgLz5cclxuICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gdi1lbHNlLWlmPVwic3RlcC5zdGF0ZSA9PT0gJ2Vycm9yJ1wiIG5hbWU9XCJmYS14bWFya1wiIDpzaXplPVwiMTBcIiAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiB2LWVsc2UtaWY9XCJzdGVwLnN0YXRlID09PSAnYWN0aXZlJ1wiIGNsYXNzPVwic3luYy1zdGVwLXNwaW5uZXJcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzeW5jLXN0ZXAtbGFiZWxcIj57eyBzdGVwLmxhYmVsIH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VyY2UtYWN0aW9ucy1tYWluXCI+XHJcbiAgICAgICAgICAgICAgPCEtLSBTdG9yZSBzb3VyY2VzOiBzaG93IENvbm5lY3Qgb3IgRGlzY29ubmVjdCBkZXBlbmRpbmcgb24gY29ubmVjdGlvbiBzdGF0ZSAtLT5cclxuICAgICAgICAgICAgICA8dGVtcGxhdGUgdi1pZj1cInNvdXJjZS5pZCAhPT0gJ21hbnVhbCdcIj5cclxuICAgICAgICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICB2LWlmPVwiIXNvdXJjZS5jb25uZWN0ZWRcIlxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwicHJpbWFyeVwiXHJcbiAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxyXG4gICAgICAgICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJzb3VyY2UtY29ubmVjdFwiXHJcbiAgICAgICAgICAgICAgICAgIDpsb2FkaW5nPVwicGVuZGluZ0FjdGlvbiA9PT0gc291cmNlLmlkICsgJzpjb25uZWN0J1wiXHJcbiAgICAgICAgICAgICAgICAgIDphcmlhLWxhYmVsPVwiJ0Nvbm5lY3QgJyArIHNvdXJjZS5uYW1lXCJcclxuICAgICAgICAgICAgICAgICAgQGNsaWNrPVwiY29ubmVjdFNvdXJjZShzb3VyY2UuaWQpXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdWdcIiA6c2l6ZT1cIjE1XCIgLz5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgc291cmNlLmlkID09PSAncGxheW5pdGVMZWdhY3knID8gJ0VuYWJsZScgOiAnQ29ubmVjdCcgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHYtZWxzZVxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiZXJyb3JcIlxyXG4gICAgICAgICAgICAgICAgICBzZWNvbmRhcnlcclxuICAgICAgICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwic291cmNlLWNvbm5lY3RcIlxyXG4gICAgICAgICAgICAgICAgICA6bG9hZGluZz1cInBlbmRpbmdBY3Rpb24gPT09IHNvdXJjZS5pZCArICc6ZGlzY29ubmVjdCdcIlxyXG4gICAgICAgICAgICAgICAgICA6YXJpYS1sYWJlbD1cIidEaXNjb25uZWN0ICcgKyBzb3VyY2UubmFtZVwiXHJcbiAgICAgICAgICAgICAgICAgIEBjbGljaz1cImRpc2Nvbm5lY3RTb3VyY2Uoc291cmNlLmlkKVwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS1saW5rLXNsYXNoXCIgOnNpemU9XCIxNVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IHNvdXJjZS5pZCA9PT0gJ3BsYXluaXRlTGVnYWN5JyA/ICdEaXNhYmxlJyA6ICdEaXNjb25uZWN0JyB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICA8IS0tIE1hbnVhbDogb3BlbiBhZGQgZ2FtZSBmb3JtIC0tPlxyXG4gICAgICAgICAgICAgIDxSb3V0ZXJMaW5rIHYtZWxzZS1pZj1cInNvdXJjZS5pZCA9PT0gJ21hbnVhbCdcIiB0bz1cIi9hcHBsaWNhdGlvbnM/YWRkPTFcIiBjdXN0b20gdi1zbG90PVwieyBuYXZpZ2F0ZSwgaHJlZiB9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSA6aHJlZj1cImhyZWZcIiBAY2xpY2s9XCJuYXZpZ2F0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8bi1idXR0b24gdGFnPVwic3BhblwiIHR5cGU9XCJwcmltYXJ5XCIgc2Vjb25kYXJ5IHN0cm9uZyBjbGFzcz1cInNvdXJjZS1jb25uZWN0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsdXNcIiA6c2l6ZT1cIjE1XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5BZGQgR2FtZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICA8L1JvdXRlckxpbms+XHJcbiAgICAgICAgICAgICAgPCEtLSBTeW5jIGJ1dHRvbjogb25seSB3aGVuIGNvbm5lY3RlZCAtLT5cclxuICAgICAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgICAgIHYtaWY9XCJzb3VyY2UuaWQgIT09ICdtYW51YWwnICYmIHNvdXJjZS5pZCAhPT0gJ3BsYXluaXRlTGVnYWN5JyAmJiBzb3VyY2UuY29ubmVjdGVkXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwic291cmNlLXN5bmMtYnRuXCJcclxuICAgICAgICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeVxyXG4gICAgICAgICAgICAgICAgc3Ryb25nXHJcbiAgICAgICAgICAgICAgICA6bG9hZGluZz1cInBlbmRpbmdBY3Rpb24gPT09IHNvdXJjZS5pZCArICc6c3luYydcIlxyXG4gICAgICAgICAgICAgICAgOmFyaWEtbGFiZWw9XCInU3luYyAnICsgc291cmNlLm5hbWVcIlxyXG4gICAgICAgICAgICAgICAgOnRpdGxlPVwiJ1N5bmMgJyArIHNvdXJjZS5uYW1lXCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cInN5bmNTb3VyY2Uoc291cmNlLmlkKVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXN5bmNcIiA6c2l6ZT1cIjE1XCIgLz5cclxuICAgICAgICAgICAgICAgIDxzcGFuPlN5bmM8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9hcnRpY2xlPlxyXG4gICAgPC9zZWN0aW9uPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgcmVmIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgUm91dGVyTGluayB9IGZyb20gJ3Z1ZS1yb3V0ZXInO1xyXG5pbXBvcnQgeyBOQWxlcnQsIE5CdXR0b24sIE5UYWcgfSBmcm9tICduYWl2ZS11aSc7XHJcbmltcG9ydCB7IHN0b3JlVG9SZWZzIH0gZnJvbSAncGluaWEnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcclxuaW1wb3J0IHsgdXNlQXBwc1N0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXBwcyc7XHJcblxyXG50eXBlIEdhbWVTb3VyY2VDb250cmFjdCA9IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBraW5kPzogc3RyaW5nO1xyXG4gIGNvbm5lY3RlZD86IGJvb2xlYW47XHJcbiAgY29ubmVjdGlvblN0YXRlPzogc3RyaW5nO1xyXG4gIHN5bmNTdGF0ZT86IHN0cmluZztcclxuICBnYW1lc0NvdW50PzogbnVtYmVyO1xyXG4gIHBsYXlhYmxlR2FtZUNvdW50PzogbnVtYmVyO1xyXG4gIG93bmVkR2FtZUNvdW50PzogbnVtYmVyO1xyXG4gIGluc3RhbGxlZEdhbWVDb3VudD86IG51bWJlcjtcclxuICB0b2tlbkVuY3J5cHRlZD86IGJvb2xlYW47XHJcbiAgYXV0aEF2YWlsYWJsZT86IGJvb2xlYW47XHJcbiAgc3RhdHVzTWVzc2FnZT86IHN0cmluZztcclxuICBwdWJsaWNDb25maWc/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBkaXNhYmxlZD86IGJvb2xlYW47XHJcbn07XHJcbnR5cGUgR2FtZVNvdXJjZXNSZXNwb25zZSA9IHtcclxuICBzdGF0dXM/OiBib29sZWFuO1xyXG4gIHNvdXJjZXM/OiBHYW1lU291cmNlQ29udHJhY3RbXTtcclxufTtcclxudHlwZSBHYW1lU291cmNlQWN0aW9uUmVzcG9uc2UgPSB7XHJcbiAgc3RhdHVzPzogYm9vbGVhbjtcclxuICBzb3VyY2VJZD86IHN0cmluZztcclxuICBjb25uZWN0aW9uU3RhdGU/OiBzdHJpbmc7XHJcbiAgc3luY1N0YXRlPzogc3RyaW5nO1xyXG4gIGFjdGlvbj86IHN0cmluZztcclxuICBhdXRoVXJsPzogc3RyaW5nIHwgbnVsbDtcclxuICBtZXNzYWdlPzogc3RyaW5nO1xyXG4gIGVycm9yPzogc3RyaW5nO1xyXG4gIHJlcXVpcmVtZW50cz86IHN0cmluZ1tdO1xyXG4gIG93bmVkR2FtZUNvdW50PzogbnVtYmVyO1xyXG4gIGluc3RhbGxlZEdhbWVDb3VudD86IG51bWJlcjtcclxuICBwbGF5YWJsZUdhbWVDb3VudD86IG51bWJlcjtcclxuICBpbXBvcnRlZEdhbWVDb3VudD86IG51bWJlcjtcclxufTtcclxudHlwZSBBY3Rpb25NZXNzYWdlID0ge1xyXG4gIHR5cGU6ICdzdWNjZXNzJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnaW5mbyc7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG59O1xyXG5cclxudHlwZSBTeW5jU3RlcCA9IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGxhYmVsOiBzdHJpbmc7XHJcbiAgc3RhdGU6ICdwZW5kaW5nJyB8ICdhY3RpdmUnIHwgJ2RvbmUnIHwgJ2Vycm9yJztcclxufTtcclxuXHJcbmNvbnN0IFNZTkNfU1RFUFM6IFN5bmNTdGVwW10gPSBbXHJcbiAgeyBpZDogJ2Nvbm5lY3QnLCBsYWJlbDogJ1ZlcmlmeWluZyBjb25uZWN0aW9uJywgc3RhdGU6ICdwZW5kaW5nJyB9LFxyXG4gIHsgaWQ6ICdmZXRjaCcsIGxhYmVsOiAnRmV0Y2hpbmcgb3duZWQgbGlicmFyeScsIHN0YXRlOiAncGVuZGluZycgfSxcclxuICB7IGlkOiAnbWF0Y2gnLCBsYWJlbDogJ01hdGNoaW5nIGluc3RhbGxlZCBnYW1lcycsIHN0YXRlOiAncGVuZGluZycgfSxcclxuICB7IGlkOiAnbWV0YScsIGxhYmVsOiAnTG9hZGluZyBtZXRhZGF0YSAmIHBvc3RlcnMnLCBzdGF0ZTogJ3BlbmRpbmcnIH0sXHJcbl07XHJcblxyXG5jb25zdCBhcHBzU3RvcmUgPSB1c2VBcHBzU3RvcmUoKTtcclxuY29uc3QgeyBhcHBzIH0gPSBzdG9yZVRvUmVmcyhhcHBzU3RvcmUpO1xyXG5jb25zdCBhcGlTb3VyY2VzID0gcmVmPEdhbWVTb3VyY2VDb250cmFjdFtdIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHBlbmRpbmdBY3Rpb24gPSByZWY8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGFjdGlvbk1lc3NhZ2UgPSByZWY8QWN0aW9uTWVzc2FnZSB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBzeW5jUHJvZ3Jlc3MgPSByZWY8UmVjb3JkPHN0cmluZywgU3luY1N0ZXBbXT4+KHt9KTtcclxuY29uc3Qgc3RlYW1BcGlLZXkgPSByZWYoJycpO1xyXG5cclxub25Nb3VudGVkKCgpID0+IHtcclxuICB2b2lkIGFwcHNTdG9yZS5sb2FkQXBwcyhmYWxzZSk7XHJcbiAgdm9pZCBsb2FkR2FtZVNvdXJjZXMoKTtcclxufSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkR2FtZVNvdXJjZXMoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAuZ2V0PEdhbWVTb3VyY2VzUmVzcG9uc2U+KCcvYXBpL2dhbWUtc291cmNlcycsIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSk7XHJcbiAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhPy5zdGF0dXMgJiYgQXJyYXkuaXNBcnJheShyZXMuZGF0YS5zb3VyY2VzKSkge1xyXG4gICAgICBhcGlTb3VyY2VzLnZhbHVlID0gcmVzLmRhdGEuc291cmNlcztcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIGFwaVNvdXJjZXMudmFsdWUgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgaGFzTWFudWFsID0gY29tcHV0ZWQoKCkgPT4gYXBwcy52YWx1ZS5zb21lKChhcHApID0+ICFhcHBbJ3BsYXluaXRlLWlkJ10pKTtcclxuY29uc3QgaGFzUGxheW5pdGUgPSBjb21wdXRlZCgoKSA9PiBhcHBzLnZhbHVlLnNvbWUoKGFwcCkgPT4gISFhcHBbJ3BsYXluaXRlLWlkJ10pKTtcclxuXHJcbmNvbnN0IGZhbGxiYWNrU291cmNlQ29udHJhY3RzID0gY29tcHV0ZWQ8R2FtZVNvdXJjZUNvbnRyYWN0W10+KCgpID0+IFtcclxuICB7IGlkOiAnc3RlYW0nLCBuYW1lOiAnU3RlYW0nLCBjb25uZWN0ZWQ6IGZhbHNlLCBjb25uZWN0aW9uU3RhdGU6ICdyZXF1aXJlc19hY3Rpb24nLCBzeW5jU3RhdGU6ICdub3Rfc3RhcnRlZCcgfSxcclxuICB7IGlkOiAnZXBpYycsIG5hbWU6ICdFcGljIEdhbWVzJywgY29ubmVjdGVkOiBmYWxzZSwgY29ubmVjdGlvblN0YXRlOiAncmVxdWlyZXNfYWN0aW9uJywgc3luY1N0YXRlOiAnbm90X3N0YXJ0ZWQnIH0sXHJcbiAgeyBpZDogJ2dvZycsIG5hbWU6ICdHT0cnLCBjb25uZWN0ZWQ6IGZhbHNlLCBjb25uZWN0aW9uU3RhdGU6ICdyZXF1aXJlc19hY3Rpb24nLCBzeW5jU3RhdGU6ICdub3Rfc3RhcnRlZCcgfSxcclxuICB7IGlkOiAneGJveCcsIG5hbWU6ICdYYm94JywgY29ubmVjdGVkOiBmYWxzZSwgY29ubmVjdGlvblN0YXRlOiAncmVxdWlyZXNfYWN0aW9uJywgc3luY1N0YXRlOiAnbm90X3N0YXJ0ZWQnIH0sXHJcbiAgeyBpZDogJ21hbnVhbCcsIG5hbWU6ICdNYW51YWwnLCBjb25uZWN0ZWQ6IGhhc01hbnVhbC52YWx1ZSwgY29ubmVjdGlvblN0YXRlOiBoYXNNYW51YWwudmFsdWUgPyAnY29ubmVjdGVkJyA6ICdhdmFpbGFibGUnLCBzeW5jU3RhdGU6ICdyZWFkeScsIG93bmVkR2FtZUNvdW50OiBhcHBzLnZhbHVlLmxlbmd0aCwgaW5zdGFsbGVkR2FtZUNvdW50OiBhcHBzLnZhbHVlLmxlbmd0aCwgcGxheWFibGVHYW1lQ291bnQ6IGFwcHMudmFsdWUubGVuZ3RoIH0sXHJcbl0pO1xyXG5cclxuLy8gRmlsdGVyIG91dCB0aGUgUGxheW5pdGUgTGVnYWN5IHNvdXJjZSDigJQgaXQgaXMgZGlzYWJsZWQ7IG9ubHkgc2hvdyBpdCBpZiB0aGVyZSBhcmUgc3RpbGxcclxuLy8gUGxheW5pdGUtaW1wb3J0ZWQgZW50cmllcyAoc28gdGhlIHVzZXIgY2FuIHB1cmdlIHRoZW0gdmlhIHRoZSBkaXNjb25uZWN0IGJ1dHRvbikuXHJcbmNvbnN0IHNvdXJjZXMgPSBjb21wdXRlZCgoKSA9PlxyXG4gIChhcGlTb3VyY2VzLnZhbHVlID8/IGZhbGxiYWNrU291cmNlQ29udHJhY3RzLnZhbHVlKVxyXG4gICAgLmZpbHRlcigoaXRlbSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS5pZCA9PT0gJ3BsYXluaXRlTGVnYWN5Jykge1xyXG4gICAgICAgIC8vIFNob3cgb25seSB3aGVuIHRoZXJlIGFyZSBzdGlsbCBQbGF5bml0ZS1iYWNrZWQgYXBwcyB0byBhbGxvdyB0aGUgdXNlciB0byByZW1vdmUgdGhlbS5cclxuICAgICAgICByZXR1cm4gaGFzUGxheW5pdGUudmFsdWUgfHwgKGl0ZW0uZGlzYWJsZWQgIT09IHRydWUgJiYgaXRlbS5jb25uZWN0aW9uU3RhdGUgIT09ICdkaXNhYmxlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSlcclxuICAgIC5tYXAoc291cmNlKSxcclxuKTtcclxuXHJcbmZ1bmN0aW9uIHNvdXJjZShpdGVtOiBHYW1lU291cmNlQ29udHJhY3QpIHtcclxuICBjb25zdCBjb25uZWN0ZWQgPSAhIWl0ZW0uY29ubmVjdGVkO1xyXG4gIGNvbnN0IHJlcXVpcmVzQWN0aW9uID0gaXRlbS5jb25uZWN0aW9uU3RhdGUgPT09ICdyZXF1aXJlc19hY3Rpb24nO1xyXG4gIGNvbnN0IGRpc2FibGVkID0gaXRlbS5jb25uZWN0aW9uU3RhdGUgPT09ICdkaXNhYmxlZCcgfHwgaXRlbS5kaXNhYmxlZCA9PT0gdHJ1ZTtcclxuICByZXR1cm4ge1xyXG4gICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICBuYW1lOiBpdGVtLm5hbWUsXHJcbiAgICBjb25uZWN0ZWQsXHJcbiAgICBtYXJrOiBzb3VyY2VNYXJrKGl0ZW0uaWQpLFxyXG4gICAgbG9nb1VybDogc291cmNlTG9nbyhpdGVtLmlkKSxcclxuICAgIGxvZ29Qb3NpdGlvbjogc291cmNlQmFubmVyUG9zaXRpb24oaXRlbS5pZCksXHJcbiAgICBkZXNjcmlwdGlvbjogc291cmNlRGVzY3JpcHRpb24oaXRlbS5pZCksXHJcbiAgICBvd25lZEdhbWVDb3VudDogaXRlbS5vd25lZEdhbWVDb3VudCA/PyBpdGVtLmdhbWVzQ291bnQgPz8gMCxcclxuICAgIGluc3RhbGxlZEdhbWVDb3VudDogaXRlbS5pbnN0YWxsZWRHYW1lQ291bnQgPz8gaXRlbS5wbGF5YWJsZUdhbWVDb3VudCA/PyAwLFxyXG4gICAgcGxheWFibGVHYW1lQ291bnQ6IGl0ZW0ucGxheWFibGVHYW1lQ291bnQgPz8gMCxcclxuICAgIGFwaUtleUNvbmZpZ3VyZWQ6IGl0ZW0ucHVibGljQ29uZmlnPy5bJ2FwaUtleUNvbmZpZ3VyZWQnXSA9PT0gdHJ1ZSxcclxuICAgIHN0YXR1c0xhYmVsOiBkaXNhYmxlZCA/ICdEaXNhYmxlZCcgOiBjb25uZWN0ZWQgPyAnQ29ubmVjdGVkJyA6IHJlcXVpcmVzQWN0aW9uID8gJ1NldHVwIG5lZWRlZCcgOiBpdGVtLmlkID09PSAnbWFudWFsJyA/ICdBdmFpbGFibGUnIDogJ05vdCBjb25uZWN0ZWQnLFxyXG4gICAgc3RhdHVzVHlwZTogY29ubmVjdGVkID8gKCdzdWNjZXNzJyBhcyBjb25zdCkgOiByZXF1aXJlc0FjdGlvbiA/ICgnd2FybmluZycgYXMgY29uc3QpIDogaXRlbS5pZCA9PT0gJ21hbnVhbCcgPyAoJ2luZm8nIGFzIGNvbnN0KSA6ICgnZGVmYXVsdCcgYXMgY29uc3QpLFxyXG4gICAgc2VjdXJpdHk6XHJcbiAgICAgIGl0ZW0uaWQgPT09ICdtYW51YWwnXHJcbiAgICAgICAgPyAnTm8gYWNjb3VudCB0b2tlbiByZXF1aXJlZCdcclxuICAgICAgICA6IGNvbm5lY3RlZFxyXG4gICAgICAgICAgPyBpdGVtLnRva2VuRW5jcnlwdGVkXHJcbiAgICAgICAgICAgID8gJ0FjY291bnQgdG9rZW4gaXMgc3RvcmVkIGVuY3J5cHRlZCdcclxuICAgICAgICAgICAgOiAnQ29ubmVjdGVkIHRva2VuIHN0YXRlIHJlcXVpcmVzIGVuY3J5cHRpb24gYXVkaXQnXHJcbiAgICAgICAgICA6IGl0ZW0uc3RhdHVzTWVzc2FnZSA/PyAnUHJvdmlkZXIgYWNjb3VudCBzZXR1cCByZXF1aXJlZCBiZWZvcmUgc3luY2luZyBvd25lZCBnYW1lcycsXHJcbiAgICBzeW5jOiBjb25uZWN0ZWQgPyBzb3VyY2VTeW5jTGFiZWwoaXRlbSkgOiAnU3luYyBub3Qgc3RhcnRlZCcsXHJcbiAgfTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29ubmVjdFNvdXJjZShpZDogc3RyaW5nKSB7XHJcbiAgYXdhaXQgcnVuU291cmNlQWN0aW9uKGlkLCAnY29ubmVjdCcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlU3RlYW1BcGlLZXkoKSB7XHJcbiAgY29uc3QgYXBpS2V5ID0gc3RlYW1BcGlLZXkudmFsdWUudHJpbSgpO1xyXG4gIGlmICghYXBpS2V5KSByZXR1cm47XHJcbiAgYXdhaXQgcnVuU291cmNlQWN0aW9uKCdzdGVhbScsICdjb25uZWN0JywgeyBhcGlLZXkgfSk7XHJcbiAgc3RlYW1BcGlLZXkudmFsdWUgPSAnJztcclxuICBhd2FpdCBsb2FkR2FtZVNvdXJjZXMoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc3luY1NvdXJjZShpZDogc3RyaW5nKSB7XHJcbiAgc3luY1Byb2dyZXNzLnZhbHVlW2lkXSA9IFNZTkNfU1RFUFMubWFwKChzKSA9PiAoeyAuLi5zLCBzdGF0ZTogJ3BlbmRpbmcnIGFzIGNvbnN0IH0pKTtcclxuICBjb25zdCBzdGVwcyA9IHN5bmNQcm9ncmVzcy52YWx1ZVtpZF07XHJcbiAgY29uc3QgYWR2YW5jZSA9IChzdGVwSWQ6IHN0cmluZywgc3RhdGU6IFN5bmNTdGVwWydzdGF0ZSddKSA9PiB7XHJcbiAgICBjb25zdCBzID0gc3RlcHMuZmluZCgoeCkgPT4geC5pZCA9PT0gc3RlcElkKTtcclxuICAgIGlmIChzKSBzLnN0YXRlID0gc3RhdGU7XHJcbiAgfTtcclxuICBhZHZhbmNlKCdjb25uZWN0JywgJ2FjdGl2ZScpO1xyXG4gIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDMwMCkpO1xyXG4gIGFkdmFuY2UoJ2Nvbm5lY3QnLCAnZG9uZScpO1xyXG4gIGFkdmFuY2UoJ2ZldGNoJywgJ2FjdGl2ZScpO1xyXG4gIGlmIChpZCA9PT0gJ3N0ZWFtJykge1xyXG4gICAgY29uc3QgY2FwdHVyZWQgPSBhd2FpdCBjYXB0dXJlU3RlYW1XZWJMaWJyYXJ5KCk7XHJcbiAgICBpZiAoY2FwdHVyZWQpIHtcclxuICAgICAgYWR2YW5jZSgnZmV0Y2gnLCAnZG9uZScpO1xyXG4gICAgICBhZHZhbmNlKCdtYXRjaCcsICdkb25lJyk7XHJcbiAgICAgIGFkdmFuY2UoJ21ldGEnLCAnYWN0aXZlJyk7XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDI1MCkpO1xyXG4gICAgICBhZHZhbmNlKCdtZXRhJywgJ2RvbmUnKTtcclxuICAgICAgYXdhaXQgbG9hZEdhbWVTb3VyY2VzKCk7XHJcbiAgICAgIGF3YWl0IGFwcHNTdG9yZS5sb2FkQXBwcyhmYWxzZSk7XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDgwMCkpO1xyXG4gICAgICBkZWxldGUgc3luY1Byb2dyZXNzLnZhbHVlW2lkXTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gV2ViIGxpYnJhcnkgZmV0Y2ggZmFpbGVkIChDT1JTIHJlc3RyaWN0aW9uIG9yIHVzZXIgbm90IGxvZ2dlZCBpbnRvIFN0ZWFtIGluIHRoaXMgYnJvd3NlcikuXHJcbiAgICAvLyBNYXJrIHRoZSBzdGVwIGFzIGVycm9yZWQgYW5kIHdhcm4gdGhlIHVzZXIsIHRoZW4gZmFsbCB0aHJvdWdoIHRvIHRoZSBsb2NhbCBpbnN0YWxsZWQtZ2FtZXNcclxuICAgIC8vIGRldGVjdGlvbiBwYXRoIHdoaWNoIGRvZXMgbm90IHJlcXVpcmUgdGhlIFN0ZWFtIHdlYiBzZXNzaW9uLlxyXG4gICAgYWR2YW5jZSgnZmV0Y2gnLCAnZXJyb3InKTtcclxuICAgIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSB7XHJcbiAgICAgIHR5cGU6ICd3YXJuaW5nJyxcclxuICAgICAgdGV4dDogJ0NvdWxkIG5vdCBmZXRjaCB5b3VyIFN0ZWFtIG93bmVkIGxpYnJhcnkgZnJvbSB0aGUgd2ViIOKAlCBlbnN1cmUgeW91IGFyZSBsb2dnZWQgaW50byBTdGVhbSBpbiB0aGlzIGJyb3dzZXIuIEZhbGxpbmcgYmFjayB0byBsb2NhbCBpbnN0YWxsZWQgZ2FtZSBkZXRlY3Rpb24uJyxcclxuICAgIH07XHJcbiAgfVxyXG4gIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDQwMCkpO1xyXG4gIGFkdmFuY2UoJ2ZldGNoJywgJ2RvbmUnKTtcclxuICBhZHZhbmNlKCdtYXRjaCcsICdhY3RpdmUnKTtcclxuICBhd2FpdCBydW5Tb3VyY2VBY3Rpb24oaWQsICdzeW5jJyk7XHJcbiAgYWR2YW5jZSgnbWF0Y2gnLCAnZG9uZScpO1xyXG4gIGFkdmFuY2UoJ21ldGEnLCAnYWN0aXZlJyk7XHJcbiAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgMjUwKSk7XHJcbiAgYWR2YW5jZSgnbWV0YScsICdkb25lJyk7XHJcbiAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgODAwKSk7XHJcbiAgZGVsZXRlIHN5bmNQcm9ncmVzcy52YWx1ZVtpZF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0ZWFtQWNjb3VudElkRnJvbVN0ZWFtSWQoc3RlYW1JZDogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xyXG4gIGlmICh0eXBlb2Ygc3RlYW1JZCAhPT0gJ3N0cmluZycgfHwgIS9eXFxkKyQvLnRlc3Qoc3RlYW1JZCkpIHJldHVybiBudWxsO1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gKEJpZ0ludChzdGVhbUlkKSAtIDc2NTYxMTk3OTYwMjY1NzI4bikudG9TdHJpbmcoKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVN0ZWFtV2ViTGlicmFyeSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICBjb25zdCBzdGVhbSA9IGFwaVNvdXJjZXMudmFsdWU/LmZpbmQoKHgpID0+IHguaWQgPT09ICdzdGVhbScpO1xyXG4gIGNvbnN0IGFjY291bnRJZCA9IHN0ZWFtQWNjb3VudElkRnJvbVN0ZWFtSWQoc3RlYW0/LnB1YmxpY0NvbmZpZz8uWydzdGVhbUlkJ10pO1xyXG4gIGlmICghYWNjb3VudElkKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKCdodHRwczovL3N0b3JlLnN0ZWFtcG93ZXJlZC5jb20vZHluYW1pY3N0b3JlL3VzZXJkYXRhLycpO1xyXG4gICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ2lkJywgYWNjb3VudElkKTtcclxuICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdsJywgJ2VuZ2xpc2gnKTtcclxuICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdvcmlnaW4nLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcclxuICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCd2JywgU3RyaW5nKERhdGUubm93KCkpKTtcclxuXHJcbiAgICBjb25zdCBzdGVhbVJlcyA9IGF3YWl0IGZldGNoKHVybC50b1N0cmluZygpLCB7XHJcbiAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIG1vZGU6ICdjb3JzJyxcclxuICAgICAgY2FjaGU6ICduby1zdG9yZScsXHJcbiAgICB9KTtcclxuICAgIGlmICghc3RlYW1SZXMub2spIHJldHVybiBmYWxzZTtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdGVhbVJlcy5qc29uKCk7XHJcbiAgICBjb25zdCBvd25lZEFwcElkcyA9IEFycmF5LmlzQXJyYXkoZGF0YT8ucmdPd25lZEFwcHMpID8gZGF0YS5yZ093bmVkQXBwcyA6IFtdO1xyXG4gICAgaWYgKG93bmVkQXBwSWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IGltcG9ydFJlcyA9IGF3YWl0IGh0dHAucG9zdDxHYW1lU291cmNlQWN0aW9uUmVzcG9uc2U+KFxyXG4gICAgICAnL2FwaS9nYW1lLXNvdXJjZXMvc3RlYW0vd2ViLWxpYnJhcnknLFxyXG4gICAgICB7IG93bmVkQXBwSWRzIH0sXHJcbiAgICAgIHsgdmFsaWRhdGVTdGF0dXM6ICgpID0+IHRydWUgfSxcclxuICAgICk7XHJcbiAgICBpZiAoaW1wb3J0UmVzLnN0YXR1cyA8IDIwMCB8fCBpbXBvcnRSZXMuc3RhdHVzID49IDMwMCB8fCBpbXBvcnRSZXMuZGF0YT8uc3RhdHVzID09PSBmYWxzZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb3VudCA9IGltcG9ydFJlcy5kYXRhLm93bmVkR2FtZUNvdW50ID8/IG93bmVkQXBwSWRzLmxlbmd0aDtcclxuICAgIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSB7XHJcbiAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgdGV4dDogYFN0ZWFtIHdlYiBsaWJyYXJ5IHN5bmNlZDogJHtjb3VudH0gb3duZWQsICR7aW1wb3J0UmVzLmRhdGEuaW5zdGFsbGVkR2FtZUNvdW50ID8/IDB9IGluc3RhbGxlZC5gLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gQ09SUyBmYWlsdXJlIG9yIG5ldHdvcmsgZXJyb3Ig4oCUIHNob3cgZ3VpZGFuY2UgdG8gdGhlIHVzZXJcclxuICAgIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSB7XHJcbiAgICAgIHR5cGU6ICdpbmZvJyxcclxuICAgICAgdGV4dDogJ1RvIGltcG9ydCB5b3VyIGZ1bGwgU3RlYW0gbGlicmFyeSwgb3BlbiBzdG9yZS5zdGVhbXBvd2VyZWQuY29tIGluIHRoaXMgYnJvd3Nlciwgc2lnbiBpbiwgdGhlbiBjbGljayBTeW5jIGFnYWluLiBZb3VyIHByb2ZpbGUgY2FuIHJlbWFpbiBwcml2YXRlLicsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGlzY29ubmVjdFNvdXJjZShpZDogc3RyaW5nKSB7XHJcbiAgYXdhaXQgcnVuU291cmNlQWN0aW9uKGlkLCAnZGlzY29ubmVjdCcpO1xyXG4gIC8vIEFmdGVyIGRpc2FibGluZyBQbGF5bml0ZSwgZm9yY2UtcmVmcmVzaCB0aGUgYXBwcyBzdG9yZSBzbyBMaWJyYXJ5VmlldydzXHJcbiAgLy8gZmFsbGJhY2sgYW5kIGFueSBvdGhlciBjb25zdW1lciByZWZsZWN0IHRoZSB1cGRhdGVkIChmaWx0ZXJlZCkgbGlzdCBpbW1lZGlhdGVseS5cclxuICBpZiAoaWQgPT09ICdwbGF5bml0ZUxlZ2FjeScpIHtcclxuICAgIGF3YWl0IGFwcHNTdG9yZS5sb2FkQXBwcyhmYWxzZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW5Tb3VyY2VBY3Rpb24oaWQ6IHN0cmluZywgYWN0aW9uOiAnY29ubmVjdCcgfCAnc3luYycgfCAnZGlzY29ubmVjdCcsIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pIHtcclxuICBwZW5kaW5nQWN0aW9uLnZhbHVlID0gYCR7aWR9OiR7YWN0aW9ufWA7XHJcbiAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IG51bGw7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGh0dHAucG9zdDxHYW1lU291cmNlQWN0aW9uUmVzcG9uc2U+KFxyXG4gICAgICBgL2FwaS9nYW1lLXNvdXJjZXMvJHtlbmNvZGVVUklDb21wb25lbnQoaWQpfS8ke2FjdGlvbn1gLFxyXG4gICAgICBwYXlsb2FkLFxyXG4gICAgICB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0sXHJcbiAgICApO1xyXG4gICAgY29uc3QgYm9keSA9IHJlcy5kYXRhID8/IHt9O1xyXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDAgJiYgYm9keS5zdGF0dXMgIT09IGZhbHNlKSB7XHJcbiAgICAgIGlmIChib2R5LmF1dGhVcmwpIHtcclxuICAgICAgICAvLyBPcGVuIGF1dGggcG9wdXAg4oCUIG5vIG5vb3BlbmVyIHNvIHBvc3RNZXNzYWdlIGNhbiByZWFjaCB0aGlzIHdpbmRvdy5cclxuICAgICAgICBjb25zdCBwb3B1cCA9IHdpbmRvdy5vcGVuKGJvZHkuYXV0aFVybCwgJ19ibGFuaycsICd3aWR0aD05ODAsaGVpZ2h0PTc2MCcpO1xyXG4gICAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgICAgLy8gUHJpbWFyeSBzaWduYWw6IHBvc3RNZXNzYWdlIGZyb20gdGhlIGNhbGxiYWNrIHBhZ2UuXHJcbiAgICAgICAgICBjb25zdCBvbk1lc3NhZ2UgPSBhc3luYyAoZTogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmRhdGE/LnR5cGUgPT09ICdzdW5zaGluZTpzb3VyY2UtY29ubmVjdGVkJykge1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgb25NZXNzYWdlKTtcclxuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxUaW1lcik7XHJcbiAgICAgICAgICAgICAgYXdhaXQgbG9hZEdhbWVTb3VyY2VzKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGUuZGF0YS5zb3VyY2VJZCkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgc3luY1NvdXJjZShlLmRhdGEuc291cmNlSWQpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgb25NZXNzYWdlKTtcclxuICAgICAgICAgIC8vIEZhbGxiYWNrOiBwb2xsIGV2ZXJ5IDEuNSBzLiBSZWZyZXNoZXMgc2VydmVyIHN0YXRlIGVhY2ggdGljayBzbyB0aGVcclxuICAgICAgICAgIC8vIFVJIHVwZGF0ZXMgYXMgc29vbiBhcyB0aGUgY2FsbGJhY2sgc2F2ZXMgdGhlIGNvbm5lY3Rpb24gZXZlbiB3aGVuIENPT1BcclxuICAgICAgICAgIC8vIG9yIG90aGVyIGJyb3dzZXIgcG9saWNpZXMgcHJldmVudCBwb3B1cC5jbG9zZWQgZnJvbSBldmVyIHR1cm5pbmcgdHJ1ZS5cclxuICAgICAgICAgIGxldCBwb2xsQ291bnQgPSAwO1xyXG4gICAgICAgICAgY29uc3QgcG9sbFRpbWVyID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBwb2xsQ291bnQrKztcclxuICAgICAgICAgICAgYXdhaXQgbG9hZEdhbWVTb3VyY2VzKCk7XHJcbiAgICAgICAgICAgIGlmIChwb3B1cC5jbG9zZWQgfHwgcG9sbENvdW50ID4gODApIHtcclxuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHBvbGxUaW1lcik7XHJcbiAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBvbk1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHMgPSBhcGlTb3VyY2VzLnZhbHVlPy5maW5kKCh4KSA9PiB4LmlkID09PSBpZCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM/LmNvbm5lY3RlZCAmJiBzLnN5bmNTdGF0ZSA9PT0gJ25vdF9zdGFydGVkJykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgc3luY1NvdXJjZShpZCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCAxNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcmVxdWlyZW1lbnRzID0gQXJyYXkuaXNBcnJheShib2R5LnJlcXVpcmVtZW50cykgJiYgYm9keS5yZXF1aXJlbWVudHMubGVuZ3RoXHJcbiAgICAgICAgPyBgIFJlcXVpcmVtZW50czogJHtib2R5LnJlcXVpcmVtZW50cy5qb2luKCcsICcpfS5gXHJcbiAgICAgICAgOiAnJztcclxuICAgICAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IHtcclxuICAgICAgICB0eXBlOiBib2R5LmNvbm5lY3Rpb25TdGF0ZSA9PT0gJ3JlcXVpcmVzX2FjdGlvbicgfHwgYm9keS5zeW5jU3RhdGUgPT09ICdyZXF1aXJlc19jb25uZWN0aW9uJyA/ICd3YXJuaW5nJyA6ICdzdWNjZXNzJyxcclxuICAgICAgICB0ZXh0OiBgJHtib2R5Lm1lc3NhZ2UgfHwgJ1NvdXJjZSBhY3Rpb24gY29tcGxldGVkLid9JHtyZXF1aXJlbWVudHN9YCxcclxuICAgICAgfTtcclxuICAgICAgYXdhaXQgbG9hZEdhbWVTb3VyY2VzKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGFjdGlvbk1lc3NhZ2UudmFsdWUgPSB7XHJcbiAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgIHRleHQ6IGJvZHkuZXJyb3IgfHwgYFNvdXJjZSBhY3Rpb24gZmFpbGVkICgke3Jlcy5zdGF0dXN9KS5gLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgYWN0aW9uTWVzc2FnZS52YWx1ZSA9IHtcclxuICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgdGV4dDogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnU291cmNlIGFjdGlvbiBmYWlsZWQuJyxcclxuICAgIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHBlbmRpbmdBY3Rpb24udmFsdWUgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc291cmNlTG9nbyhpZDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgY29uc3QgYmFzZSA9IGltcG9ydC5tZXRhLmVudi5CQVNFX1VSTDtcclxuICBjb25zdCBsb2dvczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgIHN0ZWFtOiBgJHtiYXNlfWltYWdlcy9wbGF0Zm9ybXMvc3RlYW0uanBnYCxcclxuICAgIGVwaWM6IGAke2Jhc2V9aW1hZ2VzL3BsYXRmb3Jtcy9lcGljLmpwZ2AsXHJcbiAgICBnb2c6IGAke2Jhc2V9aW1hZ2VzL3BsYXRmb3Jtcy9nb2cuanBnYCxcclxuICAgIHhib3g6IGAke2Jhc2V9aW1hZ2VzL3BsYXRmb3Jtcy94Ym94LmpwZ2AsXHJcbiAgICBwbGF5bml0ZUxlZ2FjeTogYCR7YmFzZX1pbWFnZXMvcGxhdGZvcm1zL3BsYXluaXRlLmpwZ2AsXHJcbiAgfTtcclxuICByZXR1cm4gbG9nb3NbaWRdID8/IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNvdXJjZUJhbm5lclBvc2l0aW9uKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICBjb25zdCBwb3NpdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICB4Ym94OiAnY2VudGVyIDYwJScsXHJcbiAgfTtcclxuICByZXR1cm4gcG9zaXRpb25zW2lkXSA/PyBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzb3VyY2VNYXJrKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgc3RlYW06ICdTVCcsXHJcbiAgICBlcGljOiAnRVAnLFxyXG4gICAgZ29nOiAnR09HJyxcclxuICAgIHhib3g6ICdYQicsXHJcbiAgICBtYW51YWw6ICcrJyxcclxuICAgIHBsYXluaXRlTGVnYWN5OiAnUEwnLFxyXG4gIH07XHJcbiAgcmV0dXJuIG1hcmtzW2lkXSA/PyBpZC5zbGljZSgwLCAyKS50b1VwcGVyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzb3VyY2VEZXNjcmlwdGlvbihpZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBkZXNjcmlwdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICBzdGVhbTogJ1dlYiBsb2dpbiBpbXBvcnRzIHlvdXIgU3RlYW0gbGlicmFyeSwgdGhlbiBsb2NhbCBtYW5pZmVzdHMgbWFyayBpbnN0YWxsZWQgdGl0bGVzLicsXHJcbiAgICBlcGljOiAnQ29ubmVjdCBFcGljIEdhbWVzIGFuZCBkZXRlY3QgaW5zdGFsbGVkIGxhdW5jaGVyIHRpdGxlcy4nLFxyXG4gICAgZ29nOiAnQ29ubmVjdCBHT0cvR2FsYXh5IG93bmVyc2hpcCBhbmQgbG9jYWwgaW5zdGFsbHMuJyxcclxuICAgIHhib3g6ICdDb25uZWN0IE1pY3Jvc29mdC9YYm94IGxpYnJhcmllcyBhbmQgUEMgR2FtZSBQYXNzIGluc3RhbGxzLicsXHJcbiAgICBtYW51YWw6ICdBZGQgYSBnYW1lIGJ5IGV4ZWN1dGFibGUgcGF0aCB3aGVuIGl0IGlzIG5vdCB0aWVkIHRvIGEgY29ubmVjdGVkIHN0b3JlLicsXHJcbiAgICBwbGF5bml0ZUxlZ2FjeTogJ0ltcG9ydCBleGlzdGluZyBQbGF5bml0ZS1iYWNrZWQgZW50cmllcyBhcyBhIGNvbXBhdGliaWxpdHkgcGF0aC4nLFxyXG4gIH07XHJcbiAgcmV0dXJuIGRlc2NyaXB0aW9uc1tpZF0gPz8gJ0Nvbm5lY3QgYW5kIHN5bmMgdGhpcyBzb3VyY2UuJztcclxufVxyXG5cclxuZnVuY3Rpb24gc291cmNlU3luY0xhYmVsKGl0ZW06IEdhbWVTb3VyY2VDb250cmFjdCk6IHN0cmluZyB7XHJcbiAgY29uc3QgY291bnQgPSBpdGVtLnBsYXlhYmxlR2FtZUNvdW50ID8/IGl0ZW0uZ2FtZXNDb3VudCA/PyAwO1xyXG4gIGlmIChjb3VudCA+IDApIHJldHVybiBgJHtjb3VudH0gcGxheWFibGUgZ2FtZSR7Y291bnQgPT09IDEgPyAnJyA6ICdzJ30gZGV0ZWN0ZWRgO1xyXG4gIHJldHVybiBpdGVtLnN5bmNTdGF0ZSA9PT0gJ3JlYWR5JyA/ICdDb25uZWN0ZWQsIG5vIHBsYXlhYmxlIGdhbWVzIGRldGVjdGVkJyA6ICdMb2NhbCBlbnRyaWVzIGZvdW5kIGluIGN1cnJlbnQgbGlicmFyeSc7XHJcbn1cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG4uc291cmNlLWNhcmQge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgbWluLWhlaWdodDogMjVyZW07XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gIGJveC1zaGFkb3c6IDAgMC40NXJlbSAxLjRyZW0gcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wOCk7XHJcbiAgdHJhbnNpdGlvbjogYm94LXNoYWRvdyAxNjBtcyBlYXNlLCB0cmFuc2Zvcm0gMTYwbXMgZWFzZTtcclxufVxyXG5cclxuLnNvdXJjZS1jYXJkOmhvdmVyIHtcclxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XHJcbiAgYm94LXNoYWRvdzogMCAwLjdyZW0gMS44cmVtIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMTIpO1xyXG59XHJcblxyXG4uc291cmNlLWJhbm5lciB7XHJcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIGhlaWdodDogNy42cmVtO1xyXG4gIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgYmFja2dyb3VuZDpcclxuICAgIGxpbmVhci1ncmFkaWVudCgxNDVkZWcsIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMTIpLCB0cmFuc3BhcmVudCA2MiUpLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wNDUpO1xyXG59XHJcblxyXG4uc291cmNlLWJhbm5lcjo6YWZ0ZXIge1xyXG4gIGNvbnRlbnQ6ICcnO1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBpbnNldDogMDtcclxuICB6LWluZGV4OiAxO1xyXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xyXG4gIGJhY2tncm91bmQ6XHJcbiAgICBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB0cmFuc3BhcmVudCAzMCUsIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuNTUpIDEwMCUpLFxyXG4gICAgbGluZWFyLWdyYWRpZW50KDE0NWRlZywgcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4wOCksIHRyYW5zcGFyZW50IDYwJSk7XHJcbiAgbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5O1xyXG59XHJcblxyXG4uc291cmNlLWJhbm5lci1tZWRpYSB7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIGluc2V0OiAwO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC43OCk7XHJcbn1cclxuXHJcbi5zb3VyY2UtYmFubmVyLWltZyB7XHJcbiAgZGlzcGxheTogYmxvY2s7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG4gIHdpZHRoOiAxMDAlO1xyXG4gIG9iamVjdC1maXQ6IGNvdmVyO1xyXG4gIG9iamVjdC1wb3NpdGlvbjogY2VudGVyO1xyXG4gIGZpbHRlcjogc2F0dXJhdGUoMC44NSkgYnJpZ2h0bmVzcygwLjk1KTtcclxuICB0cmFuc2l0aW9uOiBmaWx0ZXIgMjAwbXMgZWFzZTtcclxufVxyXG5cclxuLnNvdXJjZS1jYXJkOmhvdmVyIC5zb3VyY2UtYmFubmVyLWltZyB7XHJcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxKSBicmlnaHRuZXNzKDEpO1xyXG59XHJcblxyXG4uc291cmNlLW1hcmstdGV4dCB7XHJcbiAgZm9udC1zaXplOiAwLjc4cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA4MDA7XHJcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTtcclxufVxyXG5cclxuLnNvdXJjZS1ib2R5IHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXg6IDE7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBnYXA6IDFyZW07XHJcbiAgcGFkZGluZzogMXJlbTtcclxufVxyXG5cclxuLnNvdXJjZS1hY3Rpb25zIHtcclxuICBtYXJnaW4tdG9wOiBhdXRvO1xyXG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBnYXA6IDAuNXJlbTtcclxufVxyXG5cclxuLnN0ZWFtLWtleS1yb3cge1xyXG4gIGRpc3BsYXk6IGdyaWQ7XHJcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBtaW5tYXgoMCwgMWZyKSBhdXRvO1xyXG4gIGdhcDogMC41cmVtO1xyXG59XHJcblxyXG4uc3RlYW0tZmFsbGJhY2sge1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBib3JkZXI6IDFweCBzb2xpZCByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjA4KTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjAyNSk7XHJcbiAgcGFkZGluZzogMC41NXJlbSAwLjY1cmVtO1xyXG59XHJcblxyXG4uc3RlYW0tZmFsbGJhY2sgc3VtbWFyeSB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgbGlzdC1zdHlsZTogbm9uZTtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC40cmVtO1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxuICBmb250LXdlaWdodDogNjUwO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjY4KTtcclxufVxyXG5cclxuLnN0ZWFtLWZhbGxiYWNrIHN1bW1hcnk6Oi13ZWJraXQtZGV0YWlscy1tYXJrZXIge1xyXG4gIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuXHJcbi5zdGVhbS1mYWxsYmFja1tvcGVuXSBzdW1tYXJ5IHtcclxuICBtYXJnaW4tYm90dG9tOiAwLjU1cmVtO1xyXG59XHJcblxyXG4uc3RlYW0ta2V5LWlucHV0IHtcclxuICBtaW4td2lkdGg6IDA7XHJcbiAgaGVpZ2h0OiAyLjM1cmVtO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNDVyZW07XHJcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4xMik7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuNzIpO1xyXG4gIHBhZGRpbmc6IDAgMC43cmVtO1xyXG4gIGZvbnQtc2l6ZTogMC43OHJlbTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC44Mik7XHJcbiAgb3V0bGluZTogbm9uZTtcclxufVxyXG5cclxuLnN0ZWFtLWtleS1pbnB1dDpmb2N1cyB7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjU1KTtcclxuICBib3gtc2hhZG93OiAwIDAgMCAycHggcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xNik7XHJcbn1cclxuXHJcbi5zdGVhbS1rZXktc2F2ZSB7XHJcbiAgbWluLXdpZHRoOiA2LjhyZW07XHJcbn1cclxuXHJcbi5zb3VyY2UtYWN0aW9ucy1tYWluIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xyXG4gIGdhcDogMC41cmVtO1xyXG4gIHdpZHRoOiAxMDAlO1xyXG59XHJcblxyXG4uc291cmNlLWNvbm5lY3Qge1xyXG4gIGZsZXg6IDEgMSAwO1xyXG4gIG1pbi13aWR0aDogNy41cmVtO1xyXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbn1cclxuXHJcbi5zb3VyY2Utc3luYy1idG4ge1xyXG4gIGZsZXg6IDAgMCA2cmVtO1xyXG4gIG1pbi13aWR0aDogNnJlbTtcclxufVxyXG5cclxuLyogU3luYyBwaXBlbGluZSAqL1xyXG4uc3luYy1waXBlbGluZSB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGdhcDogMC4zcmVtO1xyXG4gIHBhZGRpbmc6IDAuNnJlbSAwLjc1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMDM1KTtcclxuICBib3JkZXItcmFkaXVzOiAwLjVyZW07XHJcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wNyk7XHJcbn1cclxuXHJcbi5kYXJrIC5zeW5jLXBpcGVsaW5lIHtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC4wNSk7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC4wOCk7XHJcbn1cclxuXHJcbi5zeW5jLXN0ZXAge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNDVyZW07XHJcbiAgZm9udC1zaXplOiAwLjcycmVtO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjQ1KTtcclxuICB0cmFuc2l0aW9uOiBjb2xvciAxODBtcyBlYXNlO1xyXG59XHJcblxyXG4uZGFyayAuc3luYy1zdGVwIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuNCk7XHJcbn1cclxuXHJcbi5zeW5jLXN0ZXAtLWFjdGl2ZSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgZm9udC13ZWlnaHQ6IDYwMDtcclxufVxyXG5cclxuLnN5bmMtc3RlcC0tZG9uZSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuNjIpO1xyXG59XHJcblxyXG4uZGFyayAuc3luYy1zdGVwLS1kb25lIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuNTgpO1xyXG59XHJcblxyXG4uc3luYy1zdGVwLS1lcnJvciB7XHJcbiAgY29sb3I6ICNlZjQ0NDQ7XHJcbn1cclxuXHJcbi5zeW5jLXN0ZXAtZG90IHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgd2lkdGg6IDFyZW07XHJcbiAgaGVpZ2h0OiAxcmVtO1xyXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICBmbGV4LXNocmluazogMDtcclxuICBib3JkZXI6IDEuNXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcclxufVxyXG5cclxuLnN5bmMtc3RlcC0tZG9uZSAuc3luYy1zdGVwLWRvdCB7XHJcbiAgYmFja2dyb3VuZDogIzIyYzU1ZTtcclxuICBib3JkZXItY29sb3I6ICMyMmM1NWU7XHJcbiAgY29sb3I6ICNmZmY7XHJcbn1cclxuXHJcbi5zeW5jLXN0ZXAtLWVycm9yIC5zeW5jLXN0ZXAtZG90IHtcclxuICBiYWNrZ3JvdW5kOiAjZWY0NDQ0O1xyXG4gIGJvcmRlci1jb2xvcjogI2VmNDQ0NDtcclxuICBjb2xvcjogI2ZmZjtcclxufVxyXG5cclxuLnN5bmMtc3RlcC1zcGlubmVyIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICB3aWR0aDogMC41cmVtO1xyXG4gIGhlaWdodDogMC41cmVtO1xyXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICBib3JkZXI6IDEuNXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcclxuICBib3JkZXItdG9wLWNvbG9yOiB0cmFuc3BhcmVudDtcclxuICBhbmltYXRpb246IHNwaW4tc3RlcCAwLjdzIGxpbmVhciBpbmZpbml0ZTtcclxufVxyXG5cclxuQGtleWZyYW1lcyBzcGluLXN0ZXAge1xyXG4gIHRvIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG59XHJcblxyXG4uc3luYy1zdGVwLWxhYmVsIHtcclxuICBmbGV4OiAxO1xyXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcclxufVxyXG5cclxuLnNvdXJjZS1zdGF0IHtcclxuICBib3JkZXItcmFkaXVzOiAwLjQ1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMDQpO1xyXG4gIHBhZGRpbmc6IDAuNDVyZW0gMC4zNXJlbTtcclxufVxyXG5cclxuLnNvdXJjZS1zdGF0IHNwYW4sXHJcbi5zb3VyY2Utc3RhdCBzbWFsbCB7XHJcbiAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuXHJcbi5zb3VyY2Utc3RhdCBzcGFuIHtcclxuICBmb250LXNpemU6IDAuOXJlbTtcclxuICBmb250LXdlaWdodDogNzAwO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjgyKTtcclxufVxyXG5cclxuLnNvdXJjZS1zdGF0IHNtYWxsIHtcclxuICBtYXJnaW4tdG9wOiAwLjFyZW07XHJcbiAgZm9udC1zaXplOiAwLjY4cmVtO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjU2KTtcclxufVxyXG5cclxuLmRhcmsgLnNvdXJjZS1zdGF0IHtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC4wNik7XHJcbn1cclxuXHJcbi5kYXJrIC5zb3VyY2Utc3RhdCBzcGFuIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuODIpO1xyXG59XHJcblxyXG4uZGFyayAuc291cmNlLXN0YXQgc21hbGwge1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC41Nik7XHJcbn1cclxuXHJcbi5kYXJrIC5zb3VyY2UtY2FyZCB7XHJcbiAgYm94LXNoYWRvdzogMCAwLjU1cmVtIDEuNXJlbSByZ2IoMCAwIDAgLyAwLjI2KTtcclxufVxyXG5cclxuLmRhcmsgLnN0ZWFtLWtleS1pbnB1dCB7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC4xMik7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMDYpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC44OCk7XHJcbn1cclxuXHJcbi5kYXJrIC5zdGVhbS1mYWxsYmFjayB7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItbGlnaHQpIC8gMC4wOCk7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMDQpO1xyXG59XHJcblxyXG4uZGFyayAuc3RlYW0tZmFsbGJhY2sgc3VtbWFyeSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjY2KTtcclxufVxyXG5cclxuLmRhcmsgLnNvdXJjZS1jYXJkOmhvdmVyIHtcclxuICBib3gtc2hhZG93OiAwIDAuOHJlbSAycmVtIHJnYigwIDAgMCAvIDAuMzQpO1xyXG59XHJcblxyXG4uZGFyayAuc291cmNlLWJhbm5lciB7XHJcbiAgYmFja2dyb3VuZDpcclxuICAgIGxpbmVhci1ncmFkaWVudCgxNDVkZWcsIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMTQpLCB0cmFuc3BhcmVudCA2MiUpLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLWxpZ2h0KSAvIDAuMDUpO1xyXG59XHJcblxyXG4uZGFyayAuc291cmNlLWJhbm5lcjo6YWZ0ZXIge1xyXG4gIGJhY2tncm91bmQ6XHJcbiAgICBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB0cmFuc3BhcmVudCAyNSUsIHJnYigwIDAgMCAvIDAuNikgMTAwJSksXHJcbiAgICBsaW5lYXItZ3JhZGllbnQoMTQ1ZGVnLCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjEpLCB0cmFuc3BhcmVudCA2MCUpO1xyXG59XHJcblxyXG4uZGFyayAuc291cmNlLWJhbm5lci1tZWRpYSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1saWdodCkgLyAwLjc4KTtcclxufVxyXG48L3N0eWxlPlxyXG4iXSwibmFtZXMiOlsiX29wZW5CbG9jayIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2NyZWF0ZVZOb2RlIiwiX3VucmVmIiwiX2NyZWF0ZUJsb2NrIiwiX2NyZWF0ZVRleHRWTm9kZSIsIl90b0Rpc3BsYXlTdHJpbmciLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsInNvdXJjZSIsIl9jcmVhdGVDb21tZW50Vk5vZGUiLCJfbm9ybWFsaXplQ2xhc3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtUEEsVUFBTSxhQUF5QjtBQUFBLE1BQzdCLEVBQUUsSUFBSSxXQUFXLE9BQU8sd0JBQXdCLE9BQU8sVUFBVTtBQUFBLE1BQ2pFLEVBQUUsSUFBSSxTQUFTLE9BQU8sMEJBQTBCLE9BQU8sVUFBVTtBQUFBLE1BQ2pFLEVBQUUsSUFBSSxTQUFTLE9BQU8sNEJBQTRCLE9BQU8sVUFBVTtBQUFBLE1BQ25FLEVBQUUsSUFBSSxRQUFRLE9BQU8sOEJBQThCLE9BQU8sVUFBVTtBQUFBLElBQUE7QUFHdEUsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sRUFBRSxLQUFBLElBQVMsWUFBWSxTQUFTO0FBQ2hDLFVBQUEsYUFBYSxJQUFpQyxJQUFJO0FBQ2xELFVBQUEsZ0JBQWdCLElBQW1CLElBQUk7QUFDdkMsVUFBQSxnQkFBZ0IsSUFBMEIsSUFBSTtBQUM5QyxVQUFBLGVBQWUsSUFBZ0MsQ0FBQSxDQUFFO0FBQ2pELFVBQUEsY0FBYyxJQUFJLEVBQUU7QUFFMUIsY0FBVSxNQUFNO0FBQ1QsV0FBQSxVQUFVLFNBQVMsS0FBSztBQUM3QixXQUFLLGdCQUFnQjtBQUFBLElBQUEsQ0FDdEI7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
