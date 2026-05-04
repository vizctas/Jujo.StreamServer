import { k as defineComponent, $ as storeToRefs, r as ref, o as onMounted, c as computed, O as createElementBlock, V as createBaseVNode, F as Fragment, a1 as renderList, Q as openBlock, H as normalizeClass, U as createVNode, P as toDisplayString, S as withCtx, j as createTextVNode, Z as unref, M as createBlock, a0 as RouterLink, W as createCommentVNode } from "./vue-core-de07660f.js";
import { b as useAppsStore, a as useAuthStore, h as http, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { aE as NTag, aq as NButton } from "./vendor-33781bfc.js";
const _hoisted_1 = { class: "mx-auto max-w-6xl space-y-6" };
const _hoisted_2 = { class: "grid gap-4 lg:grid-cols-2" };
const _hoisted_3 = { class: "flex items-start gap-4" };
const _hoisted_4 = { class: "min-w-0 flex-1 space-y-2" };
const _hoisted_5 = { class: "flex flex-wrap items-center gap-2" };
const _hoisted_6 = { class: "text-base font-semibold" };
const _hoisted_7 = { class: "text-sm leading-6 text-dark/68 dark:text-light/68" };
const _hoisted_8 = ["href", "onClick"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SystemView",
  setup(__props) {
    const appsStore = useAppsStore();
    const authStore = useAuthStore();
    const { apps } = storeToRefs(appsStore);
    const { sessions } = storeToRefs(authStore);
    const apiChecks = ref(null);
    onMounted(() => {
      void appsStore.loadApps(false);
      void authStore.fetchSessions();
      void loadSystemReadiness();
    });
    async function loadSystemReadiness() {
      var _a;
      try {
        const res = await http.get("/api/system/readiness", { validateStatus: () => true });
        if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.status) && Array.isArray(res.data.checks)) {
          apiChecks.value = res.data.checks;
        }
      } catch {
        apiChecks.value = null;
      }
    }
    const fallbackChecks = computed(() => [
      readyCheck(
        "client",
        "Client paired",
        sessions.value.length > 0,
        "Pair at least one client before launching a stream.",
        "/pairing",
        "Open Pairing"
      ),
      readyCheck(
        "game",
        "Playable game available",
        apps.value.length > 0,
        "Add a manual game or connect a source so the client has something to launch.",
        "/game-sources",
        "Open Game Sources"
      ),
      reviewCheck("encoder", "Encoder ready", "Backend readiness endpoint pending. This will report NVENC/AMF/QSV/software availability."),
      reviewCheck("capture", "Display capture ready", "Backend readiness endpoint pending. This will validate WGC/DXGI/display-helper state."),
      reviewCheck("network", "Network reachable", "Backend readiness endpoint pending. This will validate discovery, bind address, and ports."),
      reviewCheck("controller", "Controller driver ready", "Windows check pending. This will validate ViGEm or replacement controller routing."),
      reviewCheck("virtualDisplay", "Virtual display ready", "Windows check pending. This will validate virtual display driver state when configured.")
    ]);
    const checks = computed(() => (apiChecks.value ?? fallbackChecks.value).map(mapReadinessCheck));
    function readyCheck(id, label, ready, description, path, action) {
      return {
        id,
        label,
        summary: description,
        path,
        action,
        status: ready ? "ready" : "pending"
      };
    }
    function reviewCheck(id, label, description) {
      return {
        id,
        label,
        summary: description,
        path: "/settings",
        action: "Open Settings",
        status: "warning"
      };
    }
    function mapReadinessCheck(check) {
      return {
        id: check.id,
        label: check.label,
        description: check.summary ?? "",
        path: check.path,
        action: check.action ?? "Open Settings",
        state: statusLabel(check.status),
        tagType: tagType(check.status),
        icon: statusIcon(check.status),
        iconClass: iconClass(check.status)
      };
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
    function statusIcon(status) {
      if (status === "ready")
        return "fa-check-circle";
      if (status === "warning")
        return "fa-exclamation-triangle";
      return "fa-circle-info";
    }
    function iconClass(status) {
      if (status === "ready")
        return "bg-success/12 text-success";
      if (status === "warning")
        return "bg-warning/14 text-warning";
      return "bg-primary/10 text-primary";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[0] || (_cache[0] = createBaseVNode(
          "section",
          { class: "page-surface p-5 md:p-6" },
          [
            createBaseVNode("p", { class: "text-xs font-semibold uppercase tracking-wide text-primary" }, "System"),
            createBaseVNode("h1", { class: "mt-2 text-2xl font-semibold tracking-tight" }, "Streaming readiness"),
            createBaseVNode("p", { class: "mt-2 max-w-2xl text-sm leading-6 text-dark/70 dark:text-light/70" }, " Review the host requirements that affect first stream success. ")
          ],
          -1
          /* CACHED */
        )),
        createBaseVNode("section", _hoisted_2, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(checks.value, (check) => {
              return openBlock(), createElementBlock("article", {
                key: check.id,
                class: "page-surface p-4"
              }, [
                createBaseVNode("div", _hoisted_3, [
                  createBaseVNode(
                    "span",
                    {
                      class: normalizeClass(["check-icon", check.iconClass])
                    },
                    [
                      createVNode(LucideIcon, {
                        name: check.icon,
                        size: 18
                      }, null, 8, ["name"])
                    ],
                    2
                    /* CLASS */
                  ),
                  createBaseVNode("div", _hoisted_4, [
                    createBaseVNode("div", _hoisted_5, [
                      createBaseVNode(
                        "h2",
                        _hoisted_6,
                        toDisplayString(check.label),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NTag), {
                        type: check.tagType,
                        bordered: false,
                        size: "small"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(
                            toDisplayString(check.state),
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
                      _hoisted_7,
                      toDisplayString(check.description),
                      1
                      /* TEXT */
                    ),
                    check.path ? (openBlock(), createBlock(unref(RouterLink), {
                      key: 0,
                      to: check.path,
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
                              secondary: "",
                              strong: "",
                              size: "small"
                            },
                            {
                              default: withCtx(() => [
                                createVNode(LucideIcon, {
                                  name: "fa-chevron-right",
                                  size: 14
                                }),
                                createBaseVNode(
                                  "span",
                                  null,
                                  toDisplayString(check.action),
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
                        ], 8, _hoisted_8)
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["to"])) : createCommentVNode("v-if", true)
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
const SystemView_vue_vue_type_style_index_0_scoped_cfa1f7ec_lang = "";
const SystemView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cfa1f7ec"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/SystemView.vue"]]);
export {
  SystemView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtVmlldy0zNzkwZjcxOC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vdmlld3MvU3lzdGVtVmlldy52dWUiXSwic291cmNlc0NvbnRlbnQiOlsiPHRlbXBsYXRlPlxuICA8ZGl2IGNsYXNzPVwibXgtYXV0byBtYXgtdy02eGwgc3BhY2UteS02XCI+XG4gICAgPHNlY3Rpb24gY2xhc3M9XCJwYWdlLXN1cmZhY2UgcC01IG1kOnAtNlwiPlxuICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgdGV4dC1wcmltYXJ5XCI+U3lzdGVtPC9wPlxuICAgICAgPGgxIGNsYXNzPVwibXQtMiB0ZXh0LTJ4bCBmb250LXNlbWlib2xkIHRyYWNraW5nLXRpZ2h0XCI+U3RyZWFtaW5nIHJlYWRpbmVzczwvaDE+XG4gICAgICA8cCBjbGFzcz1cIm10LTIgbWF4LXctMnhsIHRleHQtc20gbGVhZGluZy02IHRleHQtZGFyay83MCBkYXJrOnRleHQtbGlnaHQvNzBcIj5cbiAgICAgICAgUmV2aWV3IHRoZSBob3N0IHJlcXVpcmVtZW50cyB0aGF0IGFmZmVjdCBmaXJzdCBzdHJlYW0gc3VjY2Vzcy5cbiAgICAgIDwvcD5cbiAgICA8L3NlY3Rpb24+XG5cbiAgICA8c2VjdGlvbiBjbGFzcz1cImdyaWQgZ2FwLTQgbGc6Z3JpZC1jb2xzLTJcIj5cbiAgICAgIDxhcnRpY2xlIHYtZm9yPVwiY2hlY2sgaW4gY2hlY2tzXCIgOmtleT1cImNoZWNrLmlkXCIgY2xhc3M9XCJwYWdlLXN1cmZhY2UgcC00XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC00XCI+XG4gICAgICAgICAgPHNwYW4gOmNsYXNzPVwiWydjaGVjay1pY29uJywgY2hlY2suaWNvbkNsYXNzXVwiPlxuICAgICAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJjaGVjay5pY29uXCIgOnNpemU9XCIxOFwiIC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtaW4tdy0wIGZsZXgtMSBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGRcIj57eyBjaGVjay5sYWJlbCB9fTwvaDI+XG4gICAgICAgICAgICAgIDxuLXRhZyA6dHlwZT1cImNoZWNrLnRhZ1R5cGVcIiA6Ym9yZGVyZWQ9XCJmYWxzZVwiIHNpemU9XCJzbWFsbFwiPnt7IGNoZWNrLnN0YXRlIH19PC9uLXRhZz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNtIGxlYWRpbmctNiB0ZXh0LWRhcmsvNjggZGFyazp0ZXh0LWxpZ2h0LzY4XCI+e3sgY2hlY2suZGVzY3JpcHRpb24gfX08L3A+XG4gICAgICAgICAgICA8Um91dGVyTGluayB2LWlmPVwiY2hlY2sucGF0aFwiIDp0bz1cImNoZWNrLnBhdGhcIiBjdXN0b20gdi1zbG90PVwieyBuYXZpZ2F0ZSwgaHJlZiB9XCI+XG4gICAgICAgICAgICAgIDxhIDpocmVmPVwiaHJlZlwiIEBjbGljaz1cIm5hdmlnYXRlXCI+XG4gICAgICAgICAgICAgICAgPG4tYnV0dG9uIHRhZz1cInNwYW5cIiBzZWNvbmRhcnkgc3Ryb25nIHNpemU9XCJzbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWNoZXZyb24tcmlnaHRcIiA6c2l6ZT1cIjE0XCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGNoZWNrLmFjdGlvbiB9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L24tYnV0dG9uPlxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L1JvdXRlckxpbms+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hcnRpY2xlPlxuICAgIDwvc2VjdGlvbj5cbiAgPC9kaXY+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxuaW1wb3J0IHsgY29tcHV0ZWQsIG9uTW91bnRlZCwgcmVmIH0gZnJvbSAndnVlJztcbmltcG9ydCB7IFJvdXRlckxpbmsgfSBmcm9tICd2dWUtcm91dGVyJztcbmltcG9ydCB7IE5CdXR0b24sIE5UYWcgfSBmcm9tICduYWl2ZS11aSc7XG5pbXBvcnQgeyBzdG9yZVRvUmVmcyB9IGZyb20gJ3BpbmlhJztcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcbmltcG9ydCB7IHVzZUFwcHNTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2FwcHMnO1xuaW1wb3J0IHsgdXNlQXV0aFN0b3JlIH0gZnJvbSAnQC9zdG9yZXMvYXV0aCc7XG5cbnR5cGUgUmVhZGluZXNzU3RhdHVzID0gJ3JlYWR5JyB8ICd3YXJuaW5nJyB8ICdwZW5kaW5nJztcbnR5cGUgUmVhZGluZXNzQ29udHJhY3QgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHN0YXR1czogUmVhZGluZXNzU3RhdHVzO1xuICBzdW1tYXJ5Pzogc3RyaW5nO1xuICBhY3Rpb24/OiBzdHJpbmc7XG4gIHBhdGg/OiBzdHJpbmc7XG59O1xudHlwZSBTeXN0ZW1SZWFkaW5lc3NSZXNwb25zZSA9IHtcbiAgc3RhdHVzPzogYm9vbGVhbjtcbiAgb3ZlcmFsbD86IHN0cmluZztcbiAgY2hlY2tzPzogUmVhZGluZXNzQ29udHJhY3RbXTtcbn07XG5cbmNvbnN0IGFwcHNTdG9yZSA9IHVzZUFwcHNTdG9yZSgpO1xuY29uc3QgYXV0aFN0b3JlID0gdXNlQXV0aFN0b3JlKCk7XG5jb25zdCB7IGFwcHMgfSA9IHN0b3JlVG9SZWZzKGFwcHNTdG9yZSk7XG5jb25zdCB7IHNlc3Npb25zIH0gPSBzdG9yZVRvUmVmcyhhdXRoU3RvcmUpO1xuY29uc3QgYXBpQ2hlY2tzID0gcmVmPFJlYWRpbmVzc0NvbnRyYWN0W10gfCBudWxsPihudWxsKTtcblxub25Nb3VudGVkKCgpID0+IHtcbiAgdm9pZCBhcHBzU3RvcmUubG9hZEFwcHMoZmFsc2UpO1xuICB2b2lkIGF1dGhTdG9yZS5mZXRjaFNlc3Npb25zKCk7XG4gIHZvaWQgbG9hZFN5c3RlbVJlYWRpbmVzcygpO1xufSk7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTeXN0ZW1SZWFkaW5lc3MoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgaHR0cC5nZXQ8U3lzdGVtUmVhZGluZXNzUmVzcG9uc2U+KCcvYXBpL3N5c3RlbS9yZWFkaW5lc3MnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xuICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGE/LnN0YXR1cyAmJiBBcnJheS5pc0FycmF5KHJlcy5kYXRhLmNoZWNrcykpIHtcbiAgICAgIGFwaUNoZWNrcy52YWx1ZSA9IHJlcy5kYXRhLmNoZWNrcztcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGFwaUNoZWNrcy52YWx1ZSA9IG51bGw7XG4gIH1cbn1cblxuY29uc3QgZmFsbGJhY2tDaGVja3MgPSBjb21wdXRlZDxSZWFkaW5lc3NDb250cmFjdFtdPigoKSA9PiBbXG4gIHJlYWR5Q2hlY2soXG4gICAgJ2NsaWVudCcsXG4gICAgJ0NsaWVudCBwYWlyZWQnLFxuICAgIHNlc3Npb25zLnZhbHVlLmxlbmd0aCA+IDAsXG4gICAgJ1BhaXIgYXQgbGVhc3Qgb25lIGNsaWVudCBiZWZvcmUgbGF1bmNoaW5nIGEgc3RyZWFtLicsXG4gICAgJy9wYWlyaW5nJyxcbiAgICAnT3BlbiBQYWlyaW5nJyxcbiAgKSxcbiAgcmVhZHlDaGVjayhcbiAgICAnZ2FtZScsXG4gICAgJ1BsYXlhYmxlIGdhbWUgYXZhaWxhYmxlJyxcbiAgICBhcHBzLnZhbHVlLmxlbmd0aCA+IDAsXG4gICAgJ0FkZCBhIG1hbnVhbCBnYW1lIG9yIGNvbm5lY3QgYSBzb3VyY2Ugc28gdGhlIGNsaWVudCBoYXMgc29tZXRoaW5nIHRvIGxhdW5jaC4nLFxuICAgICcvZ2FtZS1zb3VyY2VzJyxcbiAgICAnT3BlbiBHYW1lIFNvdXJjZXMnLFxuICApLFxuICByZXZpZXdDaGVjaygnZW5jb2RlcicsICdFbmNvZGVyIHJlYWR5JywgJ0JhY2tlbmQgcmVhZGluZXNzIGVuZHBvaW50IHBlbmRpbmcuIFRoaXMgd2lsbCByZXBvcnQgTlZFTkMvQU1GL1FTVi9zb2Z0d2FyZSBhdmFpbGFiaWxpdHkuJyksXG4gIHJldmlld0NoZWNrKCdjYXB0dXJlJywgJ0Rpc3BsYXkgY2FwdHVyZSByZWFkeScsICdCYWNrZW5kIHJlYWRpbmVzcyBlbmRwb2ludCBwZW5kaW5nLiBUaGlzIHdpbGwgdmFsaWRhdGUgV0dDL0RYR0kvZGlzcGxheS1oZWxwZXIgc3RhdGUuJyksXG4gIHJldmlld0NoZWNrKCduZXR3b3JrJywgJ05ldHdvcmsgcmVhY2hhYmxlJywgJ0JhY2tlbmQgcmVhZGluZXNzIGVuZHBvaW50IHBlbmRpbmcuIFRoaXMgd2lsbCB2YWxpZGF0ZSBkaXNjb3ZlcnksIGJpbmQgYWRkcmVzcywgYW5kIHBvcnRzLicpLFxuICByZXZpZXdDaGVjaygnY29udHJvbGxlcicsICdDb250cm9sbGVyIGRyaXZlciByZWFkeScsICdXaW5kb3dzIGNoZWNrIHBlbmRpbmcuIFRoaXMgd2lsbCB2YWxpZGF0ZSBWaUdFbSBvciByZXBsYWNlbWVudCBjb250cm9sbGVyIHJvdXRpbmcuJyksXG4gIHJldmlld0NoZWNrKCd2aXJ0dWFsRGlzcGxheScsICdWaXJ0dWFsIGRpc3BsYXkgcmVhZHknLCAnV2luZG93cyBjaGVjayBwZW5kaW5nLiBUaGlzIHdpbGwgdmFsaWRhdGUgdmlydHVhbCBkaXNwbGF5IGRyaXZlciBzdGF0ZSB3aGVuIGNvbmZpZ3VyZWQuJyksXG5dKTtcblxuY29uc3QgY2hlY2tzID0gY29tcHV0ZWQoKCkgPT4gKGFwaUNoZWNrcy52YWx1ZSA/PyBmYWxsYmFja0NoZWNrcy52YWx1ZSkubWFwKG1hcFJlYWRpbmVzc0NoZWNrKSk7XG5cbmZ1bmN0aW9uIHJlYWR5Q2hlY2soXG4gIGlkOiBzdHJpbmcsXG4gIGxhYmVsOiBzdHJpbmcsXG4gIHJlYWR5OiBib29sZWFuLFxuICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICBwYXRoOiBzdHJpbmcsXG4gIGFjdGlvbjogc3RyaW5nLFxuKSB7XG4gIHJldHVybiB7XG4gICAgaWQsXG4gICAgbGFiZWwsXG4gICAgc3VtbWFyeTogZGVzY3JpcHRpb24sXG4gICAgcGF0aCxcbiAgICBhY3Rpb24sXG4gICAgc3RhdHVzOiByZWFkeSA/ICgncmVhZHknIGFzIGNvbnN0KSA6ICgncGVuZGluZycgYXMgY29uc3QpLFxuICB9O1xufVxuXG5mdW5jdGlvbiByZXZpZXdDaGVjayhpZDogc3RyaW5nLCBsYWJlbDogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiB7XG4gICAgaWQsXG4gICAgbGFiZWwsXG4gICAgc3VtbWFyeTogZGVzY3JpcHRpb24sXG4gICAgcGF0aDogJy9zZXR0aW5ncycsXG4gICAgYWN0aW9uOiAnT3BlbiBTZXR0aW5ncycsXG4gICAgc3RhdHVzOiAnd2FybmluZycgYXMgY29uc3QsXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1hcFJlYWRpbmVzc0NoZWNrKGNoZWNrOiBSZWFkaW5lc3NDb250cmFjdCkge1xuICByZXR1cm4ge1xuICAgIGlkOiBjaGVjay5pZCxcbiAgICBsYWJlbDogY2hlY2subGFiZWwsXG4gICAgZGVzY3JpcHRpb246IGNoZWNrLnN1bW1hcnkgPz8gJycsXG4gICAgcGF0aDogY2hlY2sucGF0aCxcbiAgICBhY3Rpb246IGNoZWNrLmFjdGlvbiA/PyAnT3BlbiBTZXR0aW5ncycsXG4gICAgc3RhdGU6IHN0YXR1c0xhYmVsKGNoZWNrLnN0YXR1cyksXG4gICAgdGFnVHlwZTogdGFnVHlwZShjaGVjay5zdGF0dXMpLFxuICAgIGljb246IHN0YXR1c0ljb24oY2hlY2suc3RhdHVzKSxcbiAgICBpY29uQ2xhc3M6IGljb25DbGFzcyhjaGVjay5zdGF0dXMpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzdGF0dXNMYWJlbChzdGF0dXM6IFJlYWRpbmVzc1N0YXR1cyk6IHN0cmluZyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAnUmVhZHknO1xuICBpZiAoc3RhdHVzID09PSAnd2FybmluZycpIHJldHVybiAnUmV2aWV3JztcbiAgcmV0dXJuICdOb3Qgc2V0Jztcbn1cblxuZnVuY3Rpb24gdGFnVHlwZShzdGF0dXM6IFJlYWRpbmVzc1N0YXR1cyk6ICdzdWNjZXNzJyB8ICd3YXJuaW5nJyB8ICdpbmZvJyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAnc3VjY2Vzcyc7XG4gIGlmIChzdGF0dXMgPT09ICd3YXJuaW5nJykgcmV0dXJuICd3YXJuaW5nJztcbiAgcmV0dXJuICdpbmZvJztcbn1cblxuZnVuY3Rpb24gc3RhdHVzSWNvbihzdGF0dXM6IFJlYWRpbmVzc1N0YXR1cyk6IHN0cmluZyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAnZmEtY2hlY2stY2lyY2xlJztcbiAgaWYgKHN0YXR1cyA9PT0gJ3dhcm5pbmcnKSByZXR1cm4gJ2ZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlJztcbiAgcmV0dXJuICdmYS1jaXJjbGUtaW5mbyc7XG59XG5cbmZ1bmN0aW9uIGljb25DbGFzcyhzdGF0dXM6IFJlYWRpbmVzc1N0YXR1cyk6IHN0cmluZyB7XG4gIGlmIChzdGF0dXMgPT09ICdyZWFkeScpIHJldHVybiAnYmctc3VjY2Vzcy8xMiB0ZXh0LXN1Y2Nlc3MnO1xuICBpZiAoc3RhdHVzID09PSAnd2FybmluZycpIHJldHVybiAnYmctd2FybmluZy8xNCB0ZXh0LXdhcm5pbmcnO1xuICByZXR1cm4gJ2JnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5Jztcbn1cbjwvc2NyaXB0PlxuXG48c3R5bGUgc2NvcGVkPlxuLmNoZWNrLWljb24ge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgaGVpZ2h0OiAyLjVyZW07XG4gIHdpZHRoOiAyLjVyZW07XG4gIGZsZXgtc2hyaW5rOiAwO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xufVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6WyJfb3BlbkJsb2NrIiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9ub3JtYWxpemVDbGFzcyIsIl9jcmVhdGVWTm9kZSIsIl90b0Rpc3BsYXlTdHJpbmciLCJfdW5yZWYiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX2NyZWF0ZUJsb2NrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQThEQSxVQUFNLFlBQVk7QUFDbEIsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sRUFBRSxLQUFBLElBQVMsWUFBWSxTQUFTO0FBQ3RDLFVBQU0sRUFBRSxTQUFBLElBQWEsWUFBWSxTQUFTO0FBQ3BDLFVBQUEsWUFBWSxJQUFnQyxJQUFJO0FBRXRELGNBQVUsTUFBTTtBQUNULFdBQUEsVUFBVSxTQUFTLEtBQUs7QUFDN0IsV0FBSyxVQUFVO0FBQ2YsV0FBSyxvQkFBb0I7QUFBQSxJQUFBLENBQzFCO0FBRUQsbUJBQWUsc0JBQXNCOztBQUMvQixVQUFBO0FBQ0ksY0FBQSxNQUFNLE1BQU0sS0FBSyxJQUE2Qix5QkFBeUIsRUFBRSxnQkFBZ0IsTUFBTSxLQUFBLENBQU07QUFDdkcsWUFBQSxJQUFJLFdBQVcsU0FBTyxTQUFJLFNBQUosbUJBQVUsV0FBVSxNQUFNLFFBQVEsSUFBSSxLQUFLLE1BQU0sR0FBRztBQUNsRSxvQkFBQSxRQUFRLElBQUksS0FBSztBQUFBLFFBQzdCO0FBQUEsTUFBQSxRQUNNO0FBQ04sa0JBQVUsUUFBUTtBQUFBLE1BQ3BCO0FBQUEsSUFDRjtBQUVNLFVBQUEsaUJBQWlCLFNBQThC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
