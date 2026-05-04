import { u as useConfigStore, a as useAuthStore, h as http, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { k as defineComponent, R as useI18n, c as computed, r as ref, o as onMounted, n as nextTick, b as onBeforeUnmount, w as watch, O as createElementBlock, V as createBaseVNode, P as toDisplayString, U as createVNode, S as withCtx, Z as unref, M as createBlock, W as createCommentVNode, Q as openBlock, j as createTextVNode, a7 as normalizeStyle, F as Fragment, a1 as renderList, H as normalizeClass, a2 as resolveComponent } from "./vue-core-de07660f.js";
import { aq as NButton, ap as NAlert, aH as NSelect, an as __unplugin_components_0, aP as NScrollbar } from "./vendor-33781bfc.js";
const MIN_SUNSHINE_CRASH_DUMP_SIZE_BYTES = 10 * 1024 * 1024;
function isSunshineDump(status) {
  var _a, _b;
  if (!status)
    return false;
  const proc = (_a = status.process) == null ? void 0 : _a.toLowerCase();
  if (proc)
    return proc === "sunshine.exe";
  const name = ((_b = status.filename) == null ? void 0 : _b.toLowerCase()) || "";
  return name.startsWith("sunshine.exe.");
}
function isCrashDumpEligible(status) {
  if (!status || status.available !== true) {
    return false;
  }
  if (isSunshineDump(status)) {
    const size = status.size_bytes ?? 0;
    return size >= MIN_SUNSHINE_CRASH_DUMP_SIZE_BYTES;
  }
  return true;
}
function sanitizeCrashDumpStatus(status) {
  if (!status) {
    return null;
  }
  if (status.available !== true) {
    return status;
  }
  if (!isCrashDumpEligible(status)) {
    return { available: false };
  }
  return status;
}
const _hoisted_1 = { class: "troubleshoot-root" };
const _hoisted_2 = { class: "text-2xl font-semibold tracking-tight text-dark dark:text-light" };
const _hoisted_3 = { class: "troubleshoot-grid" };
const _hoisted_4 = { class: "troubleshoot-card" };
const _hoisted_5 = { class: "flex items-start justify-between gap-4 flex-wrap" };
const _hoisted_6 = { class: "text-base font-semibold text-dark dark:text-light" };
const _hoisted_7 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_8 = { class: "troubleshoot-card" };
const _hoisted_9 = { class: "flex items-start justify-between gap-4 flex-wrap" };
const _hoisted_10 = { class: "text-base font-semibold text-dark dark:text-light" };
const _hoisted_11 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_12 = {
  key: 0,
  class: "troubleshoot-card"
};
const _hoisted_13 = { class: "flex items-start justify-between gap-4 flex-wrap" };
const _hoisted_14 = { class: "text-base font-semibold text-dark dark:text-light" };
const _hoisted_15 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_16 = {
  key: 1,
  class: "troubleshoot-card"
};
const _hoisted_17 = { class: "flex items-start justify-between gap-4 flex-wrap" };
const _hoisted_18 = { class: "text-base font-semibold text-dark dark:text-light" };
const _hoisted_19 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_20 = { class: "troubleshoot-card space-y-4" };
const _hoisted_21 = { class: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" };
const _hoisted_22 = { class: "text-base font-semibold text-dark dark:text-light" };
const _hoisted_23 = { class: "text-xs opacity-70 leading-snug" };
const _hoisted_24 = { class: "flex flex-col sm:flex-row gap-2" };
const _hoisted_25 = {
  key: 0,
  class: "flex flex-wrap items-center gap-2 text-xs text-dark/70 dark:text-light/70"
};
const _hoisted_26 = { class: "font-semibold text-dark/80 dark:text-light/80" };
const _hoisted_27 = { class: "text-xs opacity-60" };
const _hoisted_28 = { class: "relative" };
const _hoisted_29 = {
  key: 0,
  class: "ml-2 rounded bg-dark/10 dark:bg-light/10 px-2 py-0.5 text-xs"
};
const _hoisted_30 = { class: "log-line-number" };
const _hoisted_31 = { class: "log-line-text" };
const _hoisted_32 = {
  key: 1,
  class: "space-y-2"
};
const _hoisted_33 = { class: "flex items-center justify-between text-xs font-semibold text-dark/80 dark:text-light/80" };
const _hoisted_34 = { class: "text-xs opacity-60" };
const _hoisted_35 = {
  key: 0,
  class: "rounded-md border border-dark/10 dark:border-light/10 p-3 text-sm opacity-70"
};
const _hoisted_36 = {
  key: 1,
  class: "rounded-md border border-dark/10 dark:border-light/10 p-3 text-sm opacity-70"
};
const _hoisted_37 = ["onClick"];
const _hoisted_38 = { class: "text-xs font-semibold text-dark/70 dark:text-light/70" };
const _hoisted_39 = { class: "log-line-number" };
const _hoisted_40 = { class: "log-line-text" };
const searchResultLimit = 200;
const searchChunkSize = 1e3;
const contextLines = 5;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Troubleshooting",
  setup(__props) {
    const store = useConfigStore();
    const authStore = useAuthStore();
    const { t } = useI18n();
    const platform = computed(() => store.metadata.platform);
    const crashDump = ref(null);
    const crashDumpAvailable = computed(() => isCrashDumpEligible(crashDump.value));
    const exportCrashPending = ref(false);
    const closeAppPressed = ref(false);
    const closeAppStatus = ref(null);
    const restartPressed = ref(false);
    const latestLogs = ref("Loading...");
    const displayedLogs = ref("Loading...");
    const logFilter = ref("");
    const searchTerm = ref("");
    const logSource = ref("sunshine");
    const matchLines = ref([]);
    const matchCount = ref(0);
    const searchInProgress = ref(false);
    let searchTaskId = 0;
    let searchTaskTimer = null;
    const segmentCache = /* @__PURE__ */ new Map();
    const translate = (key, fallback) => {
      const value = t(key);
      return value === key ? fallback : value;
    };
    const tCount = (key, fallback, count) => {
      const value = t(key, { count });
      return value === key ? fallback.replace("{count}", String(count)) : value;
    };
    const logSourceOptions = computed(() => {
      const options = [
        { label: translate("troubleshooting.logs_source_sunshine", "Vibepollo"), value: "sunshine" }
      ];
      if (platform.value === "windows") {
        options.push(
          {
            label: translate("troubleshooting.logs_source_display_helper", "Display helper"),
            value: "display_helper"
          },
          {
            label: translate("troubleshooting.logs_source_playnite", "Playnite"),
            value: "playnite"
          },
          {
            label: translate("troubleshooting.logs_source_playnite_launcher", "Playnite launcher"),
            value: "playnite_launcher"
          },
          {
            label: translate("troubleshooting.logs_source_wgc", "WGC helper"),
            value: "wgc"
          }
        );
      }
      return options;
    });
    const logScrollbar = ref(null);
    const autoScrollEnabled = ref(true);
    const latestLineCount = ref(0);
    const displayedLineCount = ref(0);
    const isAtBottom = ref(true);
    let logInterval = null;
    let loginDisposer = null;
    let searchDebounce = null;
    const lineRefs = /* @__PURE__ */ new Map();
    const resultRefs = /* @__PURE__ */ new Map();
    const pendingJumpLine = ref(null);
    const setLineRef = (index) => (el) => {
      if (el instanceof HTMLElement) {
        lineRefs.set(index, el);
      } else {
        lineRefs.delete(index);
      }
    };
    const setResultRef = (index) => (el) => {
      if (el instanceof HTMLElement) {
        resultRefs.set(index, el);
      } else {
        resultRefs.delete(index);
      }
    };
    const rawSearch = computed(() => logFilter.value.trim());
    const rawSearchActive = computed(() => rawSearch.value.length > 0);
    const searchActive = computed(() => searchTerm.value.length > 0);
    const logLines = computed(() => (displayedLogs.value ?? "").split("\n"));
    const logLinesLower = computed(() => logLines.value.map((line) => line.toLowerCase()));
    const lineNumberWidth = computed(() => {
      const digits = Math.max(3, String(logLines.value.length || 0).length);
      return `${digits}ch`;
    });
    const activeMatchIndex = ref(-1);
    const activeLineIndex = computed(
      () => activeMatchIndex.value >= 0 ? matchLines.value[activeMatchIndex.value] ?? null : null
    );
    const searchPending = computed(
      () => rawSearchActive.value && (rawSearch.value !== searchTerm.value || searchInProgress.value)
    );
    const matchCountLabel = computed(() => {
      if (!rawSearchActive.value)
        return "";
      if (searchPending.value) {
        return translate("troubleshooting.search_pending", "Searching...");
      }
      if (matchCount.value === 0) {
        return translate("troubleshooting.search_no_matches", "No matches");
      }
      return tCount("troubleshooting.search_matches", "{count} matches", matchCount.value);
    });
    const searchContextLabel = computed(
      () => tCount("troubleshooting.search_context", "{count} lines of context", contextLines)
    );
    const resultsWindow = computed(() => {
      const total = matchLines.value.length;
      if (total <= searchResultLimit) {
        return { start: 0, end: total };
      }
      let start = 0;
      if (activeMatchIndex.value >= 0) {
        const half = Math.floor(searchResultLimit / 2);
        start = Math.max(
          0,
          Math.min(activeMatchIndex.value - half, Math.max(0, total - searchResultLimit))
        );
      }
      return { start, end: Math.min(total, start + searchResultLimit) };
    });
    const resultsRangeLabel = computed(() => {
      const total = matchLines.value.length;
      if (total <= searchResultLimit)
        return "";
      const { start, end } = resultsWindow.value;
      const translated = t("troubleshooting.search_results_window", {
        start: start + 1,
        end,
        count: total
      });
      if (translated === "troubleshooting.search_results_window") {
        return `Showing ${start + 1}-${end} of ${total} results`;
      }
      return translated;
    });
    const searchResults = computed(() => {
      if (!searchActive.value || searchInProgress.value)
        return [];
      const lines = logLines.value;
      const { start: windowStart, end: windowEnd } = resultsWindow.value;
      return matchLines.value.slice(windowStart, windowEnd).map((lineIndex, offset) => {
        const id = windowStart + offset;
        const snippetStart = Math.max(0, lineIndex - contextLines);
        const snippetEnd = Math.min(lines.length - 1, lineIndex + contextLines);
        const snippet = [];
        for (let i = snippetStart; i <= snippetEnd; i += 1) {
          snippet.push({ lineIndex: i, text: lines[i] ?? "" });
        }
        return { id, lineIndex, snippet };
      });
    });
    function getLineSegments(line, lineIndex) {
      const term = searchTerm.value.trim();
      if (!term) {
        return [{ text: line.length === 0 ? " " : line, isMatch: false }];
      }
      const cached = segmentCache.get(lineIndex);
      if (cached && cached.term === term && cached.text === line) {
        return cached.segments;
      }
      const needle = term.toLowerCase();
      const lower = line.toLowerCase();
      const segments = [];
      let cursor = 0;
      let matchIndex = lower.indexOf(needle, cursor);
      while (matchIndex !== -1) {
        if (matchIndex > cursor) {
          segments.push({ text: line.slice(cursor, matchIndex), isMatch: false });
        }
        segments.push({
          text: line.slice(matchIndex, matchIndex + needle.length),
          isMatch: true
        });
        cursor = matchIndex + needle.length;
        matchIndex = lower.indexOf(needle, cursor);
      }
      if (cursor < line.length) {
        segments.push({ text: line.slice(cursor), isMatch: false });
      }
      if (segments.length === 0) {
        segments.push({ text: line.length === 0 ? " " : line, isMatch: false });
      }
      segmentCache.set(lineIndex, { term, text: line, segments });
      return segments;
    }
    const unseenLines = computed(() => Math.max(0, latestLineCount.value - displayedLineCount.value));
    const newLogsAvailable = computed(() => unseenLines.value > 0);
    const showJumpToLatest = computed(
      () => !newLogsAvailable.value && !isAtBottom.value && !autoScrollEnabled.value
    );
    function resetLogState() {
      latestLogs.value = "Loading...";
      displayedLogs.value = "Loading...";
      latestLineCount.value = 0;
      displayedLineCount.value = 0;
      autoScrollEnabled.value = true;
      isAtBottom.value = true;
    }
    function buildLogUrl() {
      if (logSource.value === "sunshine")
        return "./api/logs";
      const params = new URLSearchParams();
      params.set("source", logSource.value);
      return `./api/logs?${params.toString()}`;
    }
    function getLogContainer() {
      var _a, _b;
      const maybe = (_a = logScrollbar.value) == null ? void 0 : _a.scrollbarInstRef;
      const internal = maybe && typeof maybe === "object" && "value" in maybe ? maybe.value : maybe;
      const fromInst = (internal == null ? void 0 : internal.containerRef) ?? null;
      if (fromInst)
        return fromInst;
      const rootEl = (_b = logScrollbar.value) == null ? void 0 : _b.$el;
      if (!rootEl)
        return null;
      return rootEl.querySelector(".n-scrollbar-container") ?? rootEl.querySelector('[class*="-scrollbar-container"]') ?? null;
    }
    function hasActiveLogSelection() {
      if (typeof window === "undefined")
        return false;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed)
        return false;
      const container = getLogContainer();
      if (!container)
        return false;
      const anchor = selection.anchorNode;
      const focus = selection.focusNode;
      return !!anchor && !!focus && container.contains(anchor) && container.contains(focus);
    }
    function onLogScroll() {
      const container = getLogContainer();
      if (!container)
        return;
      const atBottom = isNearBottom(container);
      isAtBottom.value = atBottom;
      if (atBottom) {
        if (!rawSearchActive.value) {
          autoScrollEnabled.value = true;
          displayedLogs.value = latestLogs.value;
          displayedLineCount.value = latestLineCount.value;
          scrollToBottom();
        } else {
          autoScrollEnabled.value = false;
        }
      } else {
        autoScrollEnabled.value = false;
      }
    }
    function isNearBottom(el) {
      const threshold = 24;
      return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    }
    function scrollToBottom() {
      const doScroll = () => {
        var _a, _b;
        (_a = logScrollbar.value) == null ? void 0 : _a.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "auto" });
        const container = getLogContainer();
        if (!container)
          return;
        container.scrollTop = container.scrollHeight;
        (_b = container.scrollTo) == null ? void 0 : _b.call(container, { top: container.scrollHeight, behavior: "auto" });
        isAtBottom.value = isNearBottom(container);
      };
      doScroll();
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => doScroll());
      }
    }
    function scrollToResult(index) {
      const resultEl = resultRefs.get(index);
      if (resultEl == null ? void 0 : resultEl.scrollIntoView) {
        resultEl.scrollIntoView({ block: "center" });
      }
    }
    function scrollToLogLine(lineIndex) {
      const lineEl = lineRefs.get(lineIndex);
      if (!lineEl)
        return;
      lineEl.scrollIntoView({ block: "center" });
      flashLogLine(lineEl);
      const container = getLogContainer();
      if (container)
        isAtBottom.value = isNearBottom(container);
    }
    function flashLogLine(lineEl) {
      lineEl.classList.remove("log-flash");
      void lineEl.offsetWidth;
      lineEl.classList.add("log-flash");
      if (typeof window !== "undefined") {
        window.setTimeout(() => lineEl.classList.remove("log-flash"), 3e3);
      }
    }
    function pauseAutoScroll() {
      if (!autoScrollEnabled.value)
        return;
      autoScrollEnabled.value = false;
      displayedLogs.value = latestLogs.value;
      displayedLineCount.value = latestLineCount.value;
    }
    function setActiveMatch(index) {
      if (matchLines.value.length === 0)
        return;
      const total = matchLines.value.length;
      const nextIndex = (index % total + total) % total;
      activeMatchIndex.value = nextIndex;
      autoScrollEnabled.value = false;
      nextTick(() => {
        scrollToResult(nextIndex);
      });
    }
    function openSearchResult(index) {
      const lineIndex = matchLines.value[index];
      if (lineIndex === void 0)
        return;
      pendingJumpLine.value = lineIndex;
      activeMatchIndex.value = index;
      autoScrollEnabled.value = false;
      if (searchDebounce !== null && typeof window !== "undefined") {
        window.clearTimeout(searchDebounce);
        searchDebounce = null;
      }
      cancelSearchTask();
      logFilter.value = "";
      searchTerm.value = "";
    }
    function jumpToPreviousMatch() {
      if (matchLines.value.length === 0)
        return;
      setActiveMatch(activeMatchIndex.value - 1);
    }
    function jumpToNextMatch() {
      if (matchLines.value.length === 0)
        return;
      setActiveMatch(activeMatchIndex.value + 1);
    }
    function clearSearch() {
      if (searchDebounce !== null && typeof window !== "undefined") {
        window.clearTimeout(searchDebounce);
        searchDebounce = null;
      }
      cancelSearchTask();
      pendingJumpLine.value = null;
      logFilter.value = "";
      searchTerm.value = "";
    }
    function cancelSearchTask() {
      searchTaskId += 1;
      searchInProgress.value = false;
      if (searchTaskTimer !== null && typeof window !== "undefined") {
        window.clearTimeout(searchTaskTimer);
        searchTaskTimer = null;
      }
    }
    function startSearch(term) {
      cancelSearchTask();
      segmentCache.clear();
      matchLines.value = [];
      matchCount.value = 0;
      const trimmed = term.trim();
      if (!trimmed)
        return;
      const needle = trimmed.toLowerCase();
      if (!needle)
        return;
      const linesLower = logLinesLower.value;
      const totalLines = linesLower.length;
      let index = 0;
      let count = 0;
      const matches = [];
      const jobId = searchTaskId;
      if (typeof window === "undefined") {
        for (index = 0; index < totalLines; index += 1) {
          const lower = linesLower[index] ?? "";
          let fromIndex = 0;
          let lineHasMatch = false;
          while (fromIndex <= lower.length) {
            const matchIndex = lower.indexOf(needle, fromIndex);
            if (matchIndex === -1)
              break;
            count += 1;
            lineHasMatch = true;
            fromIndex = matchIndex + needle.length;
          }
          if (lineHasMatch)
            matches.push(index);
        }
        matchLines.value = matches;
        matchCount.value = count;
        searchInProgress.value = false;
        return;
      }
      const processChunk = () => {
        if (jobId !== searchTaskId)
          return;
        const end = Math.min(totalLines, index + searchChunkSize);
        for (; index < end; index += 1) {
          const lower = linesLower[index] ?? "";
          let fromIndex = 0;
          let lineHasMatch = false;
          while (fromIndex <= lower.length) {
            const matchIndex = lower.indexOf(needle, fromIndex);
            if (matchIndex === -1)
              break;
            count += 1;
            lineHasMatch = true;
            fromIndex = matchIndex + needle.length;
          }
          if (lineHasMatch)
            matches.push(index);
        }
        if (index < totalLines) {
          searchTaskTimer = window.setTimeout(processChunk, 0);
          return;
        }
        searchTaskTimer = null;
        if (jobId !== searchTaskId)
          return;
        matchLines.value = matches;
        matchCount.value = count;
        searchInProgress.value = false;
      };
      searchInProgress.value = true;
      searchTaskTimer = window.setTimeout(processChunk, 0);
    }
    async function refreshLogs() {
      if (!authStore.isAuthenticated)
        return;
      if (authStore.loggingIn)
        return;
      try {
        const r = await http.get(buildLogUrl(), {
          responseType: "text",
          transformResponse: [(v) => v]
        });
        if (r.status !== 200 || typeof r.data !== "string")
          return;
        const nextText = r.data;
        latestLogs.value = nextText;
        const nextLines = nextText ? nextText.split("\n") : [];
        latestLineCount.value = nextLines.length;
        const selectionActive = hasActiveLogSelection();
        const searchActiveNow = searchActive.value;
        const searchInputActive = rawSearchActive.value;
        const container = getLogContainer();
        const atBottom = container ? isNearBottom(container) : true;
        isAtBottom.value = atBottom;
        if (searchInputActive) {
          autoScrollEnabled.value = false;
        } else if (!atBottom && autoScrollEnabled.value) {
          autoScrollEnabled.value = false;
        }
        const shouldAutoScroll = autoScrollEnabled.value && atBottom && !selectionActive && !searchActiveNow;
        if (shouldAutoScroll) {
          displayedLogs.value = nextText;
          displayedLineCount.value = latestLineCount.value;
          await nextTick();
          scrollToBottom();
        } else {
          if (latestLineCount.value < displayedLineCount.value) {
            displayedLogs.value = nextText;
            displayedLineCount.value = latestLineCount.value;
          }
        }
      } catch {
      }
    }
    function exportLogs() {
      try {
        if (typeof window === "undefined")
          return;
        if (platform.value === "windows") {
          window.location.href = "./api/logs/export";
          return;
        }
        const content = latestLogs.value || displayedLogs.value || "";
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
        link.href = url;
        link.download = `sunshine-logs-${timestamp}.log`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (_) {
      }
    }
    async function refreshCrashDumpStatus() {
      try {
        if (platform.value === "windows") {
          const r = await http.get("/api/health/crashdump", { validateStatus: () => true });
          if (r.status === 200 && r.data) {
            const sanitized = sanitizeCrashDumpStatus(r.data);
            crashDump.value = sanitized ?? { available: false };
          } else {
            crashDump.value = { available: false };
          }
        } else {
          crashDump.value = null;
        }
      } catch {
        crashDump.value = null;
      }
    }
    function exportCrashBundle() {
      return void exportCrashBundleAsync();
    }
    function parseContentDispositionFilename(header) {
      if (!header)
        return null;
      const filenameStar = /filename\*=UTF-8''([^;]+)/i.exec(header);
      if (filenameStar == null ? void 0 : filenameStar[1]) {
        try {
          return decodeURIComponent(filenameStar[1]);
        } catch {
          return filenameStar[1];
        }
      }
      const filenameMatch = /filename="?([^\";]+)"?/i.exec(header);
      return (filenameMatch == null ? void 0 : filenameMatch[1]) || null;
    }
    function triggerDownload(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
    async function downloadCrashBundlePart(partIndex, filenameHint) {
      var _a;
      const r = await http.get(`/api/logs/export_crash?part=${partIndex}`, {
        responseType: "blob",
        validateStatus: () => true
      });
      if (r.status !== 200) {
        throw new Error("crash bundle download failed");
      }
      const headerName = parseContentDispositionFilename((_a = r.headers) == null ? void 0 : _a["content-disposition"]);
      const filename = filenameHint || headerName || `sunshine_crashbundle-part${partIndex}.zip`;
      triggerDownload(r.data, filename);
    }
    async function exportCrashBundleAsync() {
      var _a;
      if (exportCrashPending.value)
        return;
      exportCrashPending.value = true;
      try {
        if (typeof window === "undefined")
          return;
        const manifest = await http.get("/api/logs/export_crash/manifest", {
          validateStatus: () => true
        });
        const parts = Array.isArray((_a = manifest.data) == null ? void 0 : _a.parts) ? manifest.data.parts : [];
        if (manifest.status === 200 && parts.length > 0) {
          const ordered = [...parts].sort((a, b) => Number(a.index) - Number(b.index));
          for (const part of ordered) {
            const index = Number(part.index) || 0;
            if (index <= 0)
              continue;
            await downloadCrashBundlePart(index, part.filename);
          }
        } else {
          await downloadCrashBundlePart(1);
        }
      } catch {
      } finally {
        exportCrashPending.value = false;
      }
    }
    function jumpToLatest() {
      autoScrollEnabled.value = true;
      displayedLogs.value = latestLogs.value;
      displayedLineCount.value = latestLineCount.value;
      nextTick(() => {
        scrollToBottom();
      });
    }
    async function closeApp() {
      var _a;
      closeAppPressed.value = true;
      try {
        const r = await http.post("./api/apps/close", {}, { validateStatus: () => true });
        closeAppStatus.value = ((_a = r.data) == null ? void 0 : _a.status) === true;
      } catch {
        closeAppStatus.value = false;
      } finally {
        closeAppPressed.value = false;
        setTimeout(() => closeAppStatus.value = null, 5e3);
      }
    }
    function restart() {
      restartPressed.value = true;
      setTimeout(() => restartPressed.value = false, 5e3);
      http.post("./api/restart", {}, { validateStatus: () => true });
    }
    onMounted(async () => {
      loginDisposer = authStore.onLogin(() => {
        void refreshLogs();
        void refreshCrashDumpStatus();
      });
      await authStore.waitForAuthentication();
      await refreshCrashDumpStatus();
      nextTick(() => {
        if (getLogContainer())
          scrollToBottom();
      });
      logInterval = window.setInterval(refreshLogs, 5e3);
      refreshLogs();
    });
    onBeforeUnmount(() => {
      if (logInterval)
        window.clearInterval(logInterval);
      if (loginDisposer)
        loginDisposer();
      if (searchDebounce !== null && typeof window !== "undefined") {
        window.clearTimeout(searchDebounce);
        searchDebounce = null;
      }
      cancelSearchTask();
    });
    watch(rawSearch, (value) => {
      if (searchDebounce !== null && typeof window !== "undefined") {
        window.clearTimeout(searchDebounce);
        searchDebounce = null;
      }
      if (!value) {
        searchTerm.value = "";
        activeMatchIndex.value = -1;
        return;
      }
      autoScrollEnabled.value = false;
      if (typeof window === "undefined") {
        searchTerm.value = value;
        return;
      }
      searchDebounce = window.setTimeout(() => {
        searchTerm.value = value;
      }, 150);
    });
    watch([searchTerm, logLinesLower], ([term]) => {
      startSearch(term);
    });
    watch(searchActive, (active) => {
      if (active) {
        autoScrollEnabled.value = false;
        return;
      }
      activeMatchIndex.value = -1;
      if (pendingJumpLine.value !== null) {
        const targetLine = pendingJumpLine.value;
        pendingJumpLine.value = null;
        nextTick(() => {
          scrollToLogLine(targetLine);
        });
        return;
      }
      const container = getLogContainer();
      if (container && isNearBottom(container)) {
        autoScrollEnabled.value = true;
        displayedLogs.value = latestLogs.value;
        displayedLineCount.value = latestLineCount.value;
        nextTick(() => scrollToBottom());
      }
    });
    watch(matchLines, (list) => {
      if (!searchActive.value || list.length === 0) {
        activeMatchIndex.value = -1;
        return;
      }
      if (activeMatchIndex.value >= list.length) {
        activeMatchIndex.value = list.length - 1;
      }
    });
    watch(searchTerm, (value, oldValue) => {
      if (value !== oldValue) {
        activeMatchIndex.value = -1;
      }
    });
    watch(logSource, () => {
      resetLogState();
      void refreshLogs();
      nextTick(() => scrollToBottom());
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode(
          "h1",
          _hoisted_2,
          toDisplayString(_ctx.$t("troubleshooting.troubleshooting")),
          1
          /* TEXT */
        ),
        createBaseVNode("div", _hoisted_3, [
          createBaseVNode("section", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("div", null, [
                createBaseVNode(
                  "h2",
                  _hoisted_6,
                  toDisplayString(_ctx.$t("troubleshooting.force_close")),
                  1
                  /* TEXT */
                ),
                createBaseVNode(
                  "p",
                  _hoisted_7,
                  toDisplayString(_ctx.$t("troubleshooting.force_close_desc")),
                  1
                  /* TEXT */
                )
              ]),
              createVNode(unref(NButton), {
                type: "primary",
                strong: "",
                disabled: closeAppPressed.value,
                onClick: closeApp
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(_ctx.$t("troubleshooting.force_close")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["disabled"])
            ]),
            closeAppStatus.value === true ? (openBlock(), createBlock(unref(NAlert), {
              key: 0,
              type: "success",
              class: "mt-3"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.force_close_success")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : closeAppStatus.value === false ? (openBlock(), createBlock(unref(NAlert), {
              key: 1,
              type: "error",
              class: "mt-3"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.force_close_error")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true)
          ]),
          createBaseVNode("section", _hoisted_8, [
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("div", null, [
                createBaseVNode(
                  "h2",
                  _hoisted_10,
                  toDisplayString(_ctx.$t("troubleshooting.restart_sunshine")),
                  1
                  /* TEXT */
                ),
                createBaseVNode(
                  "p",
                  _hoisted_11,
                  toDisplayString(_ctx.$t("troubleshooting.restart_sunshine_desc")),
                  1
                  /* TEXT */
                )
              ]),
              createVNode(unref(NButton), {
                type: "primary",
                strong: "",
                disabled: restartPressed.value,
                onClick: restart
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(_ctx.$t("troubleshooting.restart_sunshine")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["disabled"])
            ]),
            restartPressed.value === true ? (openBlock(), createBlock(unref(NAlert), {
              key: 0,
              type: "success",
              class: "mt-3"
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.restart_sunshine_success")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true)
          ]),
          platform.value === "windows" ? (openBlock(), createElementBlock("section", _hoisted_12, [
            createBaseVNode("div", _hoisted_13, [
              createBaseVNode("div", null, [
                createBaseVNode(
                  "h2",
                  _hoisted_14,
                  toDisplayString(_ctx.$t("troubleshooting.collect_playnite_logs") || "Export Logs"),
                  1
                  /* TEXT */
                ),
                createBaseVNode(
                  "p",
                  _hoisted_15,
                  toDisplayString(_ctx.$t("troubleshooting.collect_playnite_logs_desc") || "Export Vibepollo, Playnite, plugin, and display-helper logs."),
                  1
                  /* TEXT */
                )
              ]),
              createVNode(unref(NButton), {
                type: "primary",
                strong: "",
                onClick: exportLogs
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(_ctx.$t("troubleshooting.collect_playnite_logs") || "Export Logs"),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              })
            ])
          ])) : createCommentVNode("v-if", true),
          platform.value === "windows" && crashDumpAvailable.value ? (openBlock(), createElementBlock("section", _hoisted_16, [
            createBaseVNode("div", _hoisted_17, [
              createBaseVNode("div", null, [
                createBaseVNode(
                  "h2",
                  _hoisted_18,
                  toDisplayString(_ctx.$t("troubleshooting.export_crash_bundle") || "Export Crash Bundle"),
                  1
                  /* TEXT */
                ),
                createBaseVNode(
                  "p",
                  _hoisted_19,
                  toDisplayString(_ctx.$t("troubleshooting.export_crash_bundle_desc") || "Download logs and the most recent Vibepollo crash dump for issue reports."),
                  1
                  /* TEXT */
                )
              ]),
              createVNode(unref(NButton), {
                type: "error",
                strong: "",
                loading: exportCrashPending.value,
                disabled: exportCrashPending.value,
                onClick: exportCrashBundle
              }, {
                default: withCtx(() => [
                  createTextVNode(
                    toDisplayString(exportCrashPending.value ? translate(
                      "troubleshooting.export_crash_bundle_preparing",
                      "Preparing Crash Bundle..."
                    ) : translate("troubleshooting.export_crash_bundle", "Export Crash Bundle")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["loading", "disabled"])
            ])
          ])) : createCommentVNode("v-if", true)
        ]),
        createBaseVNode("section", _hoisted_20, [
          createBaseVNode("div", _hoisted_21, [
            createBaseVNode("div", null, [
              createBaseVNode(
                "h2",
                _hoisted_22,
                toDisplayString(_ctx.$t("troubleshooting.logs")),
                1
                /* TEXT */
              ),
              createBaseVNode(
                "p",
                _hoisted_23,
                toDisplayString(_ctx.$t("troubleshooting.logs_desc")),
                1
                /* TEXT */
              )
            ]),
            createBaseVNode("div", _hoisted_24, [
              logSourceOptions.value.length > 1 ? (openBlock(), createBlock(unref(NSelect), {
                key: 0,
                value: logSource.value,
                "onUpdate:value": _cache[0] || (_cache[0] = ($event) => logSource.value = $event),
                class: "min-w-[200px]",
                options: logSourceOptions.value,
                placeholder: translate("troubleshooting.logs_source", "Log source")
              }, null, 8, ["value", "options", "placeholder"])) : createCommentVNode("v-if", true),
              createVNode(unref(__unplugin_components_0), {
                value: logFilter.value,
                "onUpdate:value": _cache[1] || (_cache[1] = ($event) => logFilter.value = $event),
                placeholder: _ctx.$t("troubleshooting.logs_find")
              }, null, 8, ["value", "placeholder"]),
              createVNode(unref(NButton), {
                type: "primary",
                "aria-label": _ctx.$t("troubleshooting.export_logs"),
                onClick: exportLogs
              }, {
                default: withCtx(() => [
                  createVNode(LucideIcon, {
                    name: "fa-download",
                    size: 16
                  }),
                  createBaseVNode(
                    "span",
                    null,
                    toDisplayString(_ctx.$t("troubleshooting.export_logs")),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["aria-label"])
            ])
          ]),
          rawSearchActive.value ? (openBlock(), createElementBlock("div", _hoisted_25, [
            createBaseVNode(
              "span",
              _hoisted_26,
              toDisplayString(matchCountLabel.value),
              1
              /* TEXT */
            ),
            createVNode(unref(NButton), {
              size: "small",
              type: "default",
              disabled: matchCount.value === 0 || searchPending.value,
              onClick: jumpToPreviousMatch
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(translate("troubleshooting.search_prev", "Prev")),
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
              disabled: matchCount.value === 0 || searchPending.value,
              onClick: jumpToNextMatch
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(translate("troubleshooting.search_next", "Next")),
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
              disabled: logFilter.value.length === 0,
              onClick: clearSearch
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(translate("troubleshooting.search_clear", "Clear")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["disabled"]),
            createBaseVNode(
              "span",
              _hoisted_27,
              toDisplayString(searchContextLabel.value),
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true),
          createBaseVNode("div", _hoisted_28, [
            newLogsAvailable.value && !rawSearchActive.value ? (openBlock(), createBlock(unref(NButton), {
              key: 0,
              class: "absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg",
              type: "primary",
              strong: "",
              onClick: jumpToLatest
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.new_logs_available")) + " ",
                  1
                  /* TEXT */
                ),
                unseenLines.value > 0 ? (openBlock(), createElementBlock(
                  "span",
                  _hoisted_29,
                  " +" + toDisplayString(unseenLines.value),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true),
                createVNode(LucideIcon, {
                  name: "fa-arrow-down",
                  size: 14,
                  class: "ml-2"
                })
              ]),
              _: 1
              /* STABLE */
            })) : showJumpToLatest.value && !rawSearchActive.value ? (openBlock(), createBlock(unref(NButton), {
              key: 1,
              class: "absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg",
              type: "primary",
              strong: "",
              onClick: jumpToLatest
            }, {
              default: withCtx(() => [
                createTextVNode(
                  toDisplayString(_ctx.$t("troubleshooting.jump_to_latest")) + " ",
                  1
                  /* TEXT */
                ),
                createVNode(LucideIcon, {
                  name: "fa-arrow-down",
                  size: 14,
                  class: "ml-2"
                })
              ]),
              _: 1
              /* STABLE */
            })) : createCommentVNode("v-if", true),
            createVNode(
              unref(NScrollbar),
              {
                ref_key: "logScrollbar",
                ref: logScrollbar,
                style: { "height": "520px" },
                class: "border border-dark/10 dark:border-light/10 rounded-lg",
                onScroll: onLogScroll,
                onWheel: pauseAutoScroll,
                onMousedown: pauseAutoScroll,
                onTouchstart: pauseAutoScroll
              },
              {
                default: withCtx(() => [
                  createBaseVNode(
                    "div",
                    {
                      class: "m-0 bg-light dark:bg-dark font-mono text-[13px] leading-5 text-dark dark:text-light p-4 whitespace-pre-wrap break-words",
                      onMousedown: pauseAutoScroll
                    },
                    [
                      !searchActive.value ? (openBlock(), createElementBlock(
                        "div",
                        {
                          key: 0,
                          class: "log-lines",
                          style: normalizeStyle({ "--log-line-number-width": lineNumberWidth.value })
                        },
                        [
                          (openBlock(true), createElementBlock(
                            Fragment,
                            null,
                            renderList(logLines.value, (line, index) => {
                              return openBlock(), createElementBlock("div", {
                                key: index,
                                ref_for: true,
                                ref: setLineRef(index),
                                class: "log-line"
                              }, [
                                createBaseVNode(
                                  "span",
                                  _hoisted_30,
                                  toDisplayString(index + 1),
                                  1
                                  /* TEXT */
                                ),
                                createBaseVNode(
                                  "span",
                                  _hoisted_31,
                                  toDisplayString(line.length === 0 ? " " : line),
                                  1
                                  /* TEXT */
                                )
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ],
                        4
                        /* STYLE */
                      )) : (openBlock(), createElementBlock("div", _hoisted_32, [
                        createBaseVNode("div", _hoisted_33, [
                          createBaseVNode(
                            "span",
                            null,
                            toDisplayString(translate("troubleshooting.search_results", "Results")),
                            1
                            /* TEXT */
                          ),
                          createBaseVNode("span", _hoisted_34, [
                            createTextVNode(
                              toDisplayString(searchContextLabel.value) + " ",
                              1
                              /* TEXT */
                            ),
                            resultsRangeLabel.value ? (openBlock(), createElementBlock(
                              Fragment,
                              { key: 0 },
                              [
                                createTextVNode(
                                  " | " + toDisplayString(resultsRangeLabel.value),
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : createCommentVNode("v-if", true)
                          ])
                        ]),
                        searchInProgress.value ? (openBlock(), createElementBlock(
                          "div",
                          _hoisted_35,
                          toDisplayString(translate("troubleshooting.search_pending", "Searching...")),
                          1
                          /* TEXT */
                        )) : matchCount.value === 0 ? (openBlock(), createElementBlock(
                          "div",
                          _hoisted_36,
                          toDisplayString(translate("troubleshooting.search_no_matches", "No matches")),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true),
                        (openBlock(true), createElementBlock(
                          Fragment,
                          null,
                          renderList(searchResults.value, (result) => {
                            return openBlock(), createElementBlock("button", {
                              key: result.id,
                              type: "button",
                              class: normalizeClass(["w-full rounded-md border border-dark/10 dark:border-light/10 bg-white/80 dark:bg-surface/60 p-2 text-left transition hover:bg-dark/5 dark:hover:bg-light/5", {
                                "border-amber-400/70 bg-amber-100/60 dark:bg-amber-500/10": result.id === activeMatchIndex.value
                              }]),
                              ref_for: true,
                              ref: setResultRef(result.id),
                              onClick: ($event) => openSearchResult(result.id)
                            }, [
                              createBaseVNode(
                                "div",
                                _hoisted_38,
                                toDisplayString(translate("troubleshooting.search_line", "Line")) + " " + toDisplayString(result.lineIndex + 1),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "div",
                                {
                                  class: "mt-1 font-mono text-xs leading-4 text-dark dark:text-light whitespace-pre-wrap break-words",
                                  style: normalizeStyle({ "--log-line-number-width": lineNumberWidth.value })
                                },
                                [
                                  (openBlock(true), createElementBlock(
                                    Fragment,
                                    null,
                                    renderList(result.snippet, (snippetLine) => {
                                      return openBlock(), createElementBlock("div", {
                                        key: snippetLine.lineIndex,
                                        class: "log-line"
                                      }, [
                                        createBaseVNode(
                                          "span",
                                          _hoisted_39,
                                          toDisplayString(snippetLine.lineIndex + 1),
                                          1
                                          /* TEXT */
                                        ),
                                        createBaseVNode("span", _hoisted_40, [
                                          (openBlock(true), createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(getLineSegments(
                                              snippetLine.text,
                                              snippetLine.lineIndex
                                            ), (segment, sIndex) => {
                                              return openBlock(), createElementBlock(
                                                "span",
                                                {
                                                  key: sIndex,
                                                  class: normalizeClass(
                                                    segment.isMatch ? snippetLine.lineIndex === activeLineIndex.value ? "log-match-active" : "log-match" : ""
                                                  )
                                                },
                                                toDisplayString(segment.text),
                                                3
                                                /* TEXT, CLASS */
                                              );
                                            }),
                                            128
                                            /* KEYED_FRAGMENT */
                                          ))
                                        ])
                                      ]);
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ],
                                4
                                /* STYLE */
                              )
                            ], 10, _hoisted_37);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]))
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              },
              512
              /* NEED_PATCH */
            )
          ])
        ])
      ]);
    };
  }
});
const Troubleshooting_vue_vue_type_style_index_0_scoped_45c3bc55_lang = "";
const Troubleshooting = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-45c3bc55"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/Troubleshooting.vue"]]);
const _sfc_main = {
  name: "TroubleshootingView",
  components: {
    Troubleshooting,
    LucideIcon
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Troubleshooting = resolveComponent("Troubleshooting");
  return openBlock(), createBlock(_component_Troubleshooting);
}
const TroubleshootingView = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/TroubleshootingView.vue"]]);
export {
  TroubleshootingView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJvdWJsZXNob290aW5nVmlldy03ZmUzMDQzYi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vdXRpbHMvY3Jhc2hEdW1wLnRzIiwiLi4vLi4vVHJvdWJsZXNob290aW5nLnZ1ZSIsIi4uLy4uL3ZpZXdzL1Ryb3VibGVzaG9vdGluZ1ZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIENyYXNoRHVtcFN0YXR1cyA9IHtcclxuICBhdmFpbGFibGU/OiBib29sZWFuO1xyXG4gIGZpbGVuYW1lPzogc3RyaW5nO1xyXG4gIHBhdGg/OiBzdHJpbmc7XHJcbiAgcHJvY2Vzcz86IHN0cmluZztcclxuICBzaXplX2J5dGVzPzogbnVtYmVyO1xyXG4gIGNhcHR1cmVkX2F0Pzogc3RyaW5nO1xyXG4gIGFnZV9zZWNvbmRzPzogbnVtYmVyO1xyXG4gIGFnZV9ob3Vycz86IG51bWJlcjtcclxuICBkaXNtaXNzZWQ/OiBib29sZWFuO1xyXG4gIGRpc21pc3NlZF9hdD86IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBNSU5fU1VOU0hJTkVfQ1JBU0hfRFVNUF9TSVpFX0JZVEVTID0gMTAgKiAxMDI0ICogMTAyNDtcclxuXHJcbmZ1bmN0aW9uIGlzU3Vuc2hpbmVEdW1wKHN0YXR1cz86IENyYXNoRHVtcFN0YXR1cyB8IG51bGwpOiBib29sZWFuIHtcclxuICBpZiAoIXN0YXR1cykgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IHByb2MgPSBzdGF0dXMucHJvY2Vzcz8udG9Mb3dlckNhc2UoKTtcclxuICBpZiAocHJvYykgcmV0dXJuIHByb2MgPT09ICdzdW5zaGluZS5leGUnO1xyXG4gIGNvbnN0IG5hbWUgPSBzdGF0dXMuZmlsZW5hbWU/LnRvTG93ZXJDYXNlKCkgfHwgJyc7XHJcbiAgcmV0dXJuIG5hbWUuc3RhcnRzV2l0aCgnc3Vuc2hpbmUuZXhlLicpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNDcmFzaER1bXBFbGlnaWJsZShzdGF0dXM/OiBDcmFzaER1bXBTdGF0dXMgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgaWYgKCFzdGF0dXMgfHwgc3RhdHVzLmF2YWlsYWJsZSAhPT0gdHJ1ZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBpZiAoaXNTdW5zaGluZUR1bXAoc3RhdHVzKSkge1xyXG4gICAgY29uc3Qgc2l6ZSA9IHN0YXR1cy5zaXplX2J5dGVzID8/IDA7XHJcbiAgICByZXR1cm4gc2l6ZSA+PSBNSU5fU1VOU0hJTkVfQ1JBU0hfRFVNUF9TSVpFX0JZVEVTO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQ3Jhc2hEdW1wU3RhdHVzKHN0YXR1cz86IENyYXNoRHVtcFN0YXR1cyB8IG51bGwpOiBDcmFzaER1bXBTdGF0dXMgfCBudWxsIHtcclxuICBpZiAoIXN0YXR1cykge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGlmIChzdGF0dXMuYXZhaWxhYmxlICE9PSB0cnVlKSB7XHJcbiAgICByZXR1cm4gc3RhdHVzO1xyXG4gIH1cclxuICBpZiAoIWlzQ3Jhc2hEdW1wRWxpZ2libGUoc3RhdHVzKSkge1xyXG4gICAgcmV0dXJuIHsgYXZhaWxhYmxlOiBmYWxzZSB9O1xyXG4gIH1cclxuICByZXR1cm4gc3RhdHVzO1xyXG59XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwidHJvdWJsZXNob290LXJvb3RcIj5cclxuICAgIDxoMSBjbGFzcz1cInRleHQtMnhsIGZvbnQtc2VtaWJvbGQgdHJhY2tpbmctdGlnaHQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlxyXG4gICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLnRyb3VibGVzaG9vdGluZycpIH19XHJcbiAgICA8L2gxPlxyXG5cclxuICAgIDxkaXYgY2xhc3M9XCJ0cm91Ymxlc2hvb3QtZ3JpZFwiPlxyXG4gICAgICA8c2VjdGlvbiBjbGFzcz1cInRyb3VibGVzaG9vdC1jYXJkXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIGdhcC00IGZsZXgtd3JhcFwiPlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZm9yY2VfY2xvc2UnKSB9fVxyXG4gICAgICAgICAgICA8L2gyPlxyXG4gICAgICAgICAgICA8cCBjbGFzcz1cInRleHQteHMgb3BhY2l0eS03MCBsZWFkaW5nLXNudWdcIj5cclxuICAgICAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLmZvcmNlX2Nsb3NlX2Rlc2MnKSB9fVxyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxuLWJ1dHRvbiB0eXBlPVwicHJpbWFyeVwiIHN0cm9uZyA6ZGlzYWJsZWQ9XCJjbG9zZUFwcFByZXNzZWRcIiBAY2xpY2s9XCJjbG9zZUFwcFwiPlxyXG4gICAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLmZvcmNlX2Nsb3NlJykgfX1cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPG4tYWxlcnQgdi1pZj1cImNsb3NlQXBwU3RhdHVzID09PSB0cnVlXCIgdHlwZT1cInN1Y2Nlc3NcIiBjbGFzcz1cIm10LTNcIj5cclxuICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcuZm9yY2VfY2xvc2Vfc3VjY2VzcycpIH19XHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICAgIDxuLWFsZXJ0IHYtZWxzZS1pZj1cImNsb3NlQXBwU3RhdHVzID09PSBmYWxzZVwiIHR5cGU9XCJlcnJvclwiIGNsYXNzPVwibXQtM1wiPlxyXG4gICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5mb3JjZV9jbG9zZV9lcnJvcicpIH19XHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICA8L3NlY3Rpb24+XHJcblxyXG4gICAgICA8c2VjdGlvbiBjbGFzcz1cInRyb3VibGVzaG9vdC1jYXJkXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIGdhcC00IGZsZXgtd3JhcFwiPlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC1iYXNlIGZvbnQtc2VtaWJvbGQgdGV4dC1kYXJrIGRhcms6dGV4dC1saWdodFwiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcucmVzdGFydF9zdW5zaGluZScpIH19XHJcbiAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctc251Z1wiPlxyXG4gICAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcucmVzdGFydF9zdW5zaGluZV9kZXNjJykgfX1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cInByaW1hcnlcIiBzdHJvbmcgOmRpc2FibGVkPVwicmVzdGFydFByZXNzZWRcIiBAY2xpY2s9XCJyZXN0YXJ0XCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcucmVzdGFydF9zdW5zaGluZScpIH19XHJcbiAgICAgICAgICA8L24tYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxuLWFsZXJ0IHYtaWY9XCJyZXN0YXJ0UHJlc3NlZCA9PT0gdHJ1ZVwiIHR5cGU9XCJzdWNjZXNzXCIgY2xhc3M9XCJtdC0zXCI+XHJcbiAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLnJlc3RhcnRfc3Vuc2hpbmVfc3VjY2VzcycpIH19XHJcbiAgICAgICAgPC9uLWFsZXJ0PlxyXG4gICAgICA8L3NlY3Rpb24+XHJcblxyXG4gICAgICA8c2VjdGlvbiB2LWlmPVwicGxhdGZvcm0gPT09ICd3aW5kb3dzJ1wiIGNsYXNzPVwidHJvdWJsZXNob290LWNhcmRcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gZ2FwLTQgZmxleC13cmFwXCI+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCI+XHJcbiAgICAgICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5jb2xsZWN0X3BsYXluaXRlX2xvZ3MnKSB8fCAnRXhwb3J0IExvZ3MnIH19XHJcbiAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctc251Z1wiPlxyXG4gICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAkdCgndHJvdWJsZXNob290aW5nLmNvbGxlY3RfcGxheW5pdGVfbG9nc19kZXNjJykgfHxcclxuICAgICAgICAgICAgICAgICdFeHBvcnQgVmliZXBvbGxvLCBQbGF5bml0ZSwgcGx1Z2luLCBhbmQgZGlzcGxheS1oZWxwZXIgbG9ncy4nXHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8bi1idXR0b24gdHlwZT1cInByaW1hcnlcIiBzdHJvbmcgQGNsaWNrPVwiZXhwb3J0TG9nc1wiPlxyXG4gICAgICAgICAgICB7eyAkdCgndHJvdWJsZXNob290aW5nLmNvbGxlY3RfcGxheW5pdGVfbG9ncycpIHx8ICdFeHBvcnQgTG9ncycgfX1cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICAgIDxzZWN0aW9uIHYtaWY9XCJwbGF0Zm9ybSA9PT0gJ3dpbmRvd3MnICYmIGNyYXNoRHVtcEF2YWlsYWJsZVwiIGNsYXNzPVwidHJvdWJsZXNob290LWNhcmRcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gZ2FwLTQgZmxleC13cmFwXCI+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCI+XHJcbiAgICAgICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5leHBvcnRfY3Jhc2hfYnVuZGxlJykgfHwgJ0V4cG9ydCBDcmFzaCBCdW5kbGUnIH19XHJcbiAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC14cyBvcGFjaXR5LTcwIGxlYWRpbmctc251Z1wiPlxyXG4gICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAkdCgndHJvdWJsZXNob290aW5nLmV4cG9ydF9jcmFzaF9idW5kbGVfZGVzYycpIHx8XHJcbiAgICAgICAgICAgICAgICAnRG93bmxvYWQgbG9ncyBhbmQgdGhlIG1vc3QgcmVjZW50IFZpYmVwb2xsbyBjcmFzaCBkdW1wIGZvciBpc3N1ZSByZXBvcnRzLidcclxuICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxuLWJ1dHRvblxyXG4gICAgICAgICAgICB0eXBlPVwiZXJyb3JcIlxyXG4gICAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgICAgOmxvYWRpbmc9XCJleHBvcnRDcmFzaFBlbmRpbmdcIlxyXG4gICAgICAgICAgICA6ZGlzYWJsZWQ9XCJleHBvcnRDcmFzaFBlbmRpbmdcIlxyXG4gICAgICAgICAgICBAY2xpY2s9XCJleHBvcnRDcmFzaEJ1bmRsZVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgZXhwb3J0Q3Jhc2hQZW5kaW5nXHJcbiAgICAgICAgICAgICAgICA/IHRyYW5zbGF0ZShcclxuICAgICAgICAgICAgICAgICAgICAndHJvdWJsZXNob290aW5nLmV4cG9ydF9jcmFzaF9idW5kbGVfcHJlcGFyaW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAnUHJlcGFyaW5nIENyYXNoIEJ1bmRsZS4uLicsXHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIDogdHJhbnNsYXRlKCd0cm91Ymxlc2hvb3RpbmcuZXhwb3J0X2NyYXNoX2J1bmRsZScsICdFeHBvcnQgQ3Jhc2ggQnVuZGxlJylcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvc2VjdGlvbj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxzZWN0aW9uIGNsYXNzPVwidHJvdWJsZXNob290LWNhcmQgc3BhY2UteS00XCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0zIHNtOmZsZXgtcm93IHNtOml0ZW1zLXN0YXJ0IHNtOmp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8aDIgY2xhc3M9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0XCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcubG9ncycpIH19XHJcbiAgICAgICAgICA8L2gyPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNzAgbGVhZGluZy1zbnVnXCI+XHJcbiAgICAgICAgICAgIHt7ICR0KCd0cm91Ymxlc2hvb3RpbmcubG9nc19kZXNjJykgfX1cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBnYXAtMlwiPlxyXG4gICAgICAgICAgPG4tc2VsZWN0XHJcbiAgICAgICAgICAgIHYtaWY9XCJsb2dTb3VyY2VPcHRpb25zLmxlbmd0aCA+IDFcIlxyXG4gICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibG9nU291cmNlXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJtaW4tdy1bMjAwcHhdXCJcclxuICAgICAgICAgICAgOm9wdGlvbnM9XCJsb2dTb3VyY2VPcHRpb25zXCJcclxuICAgICAgICAgICAgOnBsYWNlaG9sZGVyPVwidHJhbnNsYXRlKCd0cm91Ymxlc2hvb3RpbmcubG9nc19zb3VyY2UnLCAnTG9nIHNvdXJjZScpXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8bi1pbnB1dCB2LW1vZGVsOnZhbHVlPVwibG9nRmlsdGVyXCIgOnBsYWNlaG9sZGVyPVwiJHQoJ3Ryb3VibGVzaG9vdGluZy5sb2dzX2ZpbmQnKVwiIC8+XHJcbiAgICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICA6YXJpYS1sYWJlbD1cIiR0KCd0cm91Ymxlc2hvb3RpbmcuZXhwb3J0X2xvZ3MnKVwiXHJcbiAgICAgICAgICAgIEBjbGljaz1cImV4cG9ydExvZ3NcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtZG93bmxvYWRcIiA6c2l6ZT1cIjE2XCIgLz5cclxuICAgICAgICAgICAgPHNwYW4+e3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5leHBvcnRfbG9ncycpIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgdi1pZj1cInJhd1NlYXJjaEFjdGl2ZVwiXHJcbiAgICAgICAgY2xhc3M9XCJmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC14cyB0ZXh0LWRhcmsvNzAgZGFyazp0ZXh0LWxpZ2h0LzcwXCJcclxuICAgICAgPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsvODAgZGFyazp0ZXh0LWxpZ2h0LzgwXCI+XHJcbiAgICAgICAgICB7eyBtYXRjaENvdW50TGFiZWwgfX1cclxuICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgdHlwZT1cImRlZmF1bHRcIlxyXG4gICAgICAgICAgOmRpc2FibGVkPVwibWF0Y2hDb3VudCA9PT0gMCB8fCBzZWFyY2hQZW5kaW5nXCJcclxuICAgICAgICAgIEBjbGljaz1cImp1bXBUb1ByZXZpb3VzTWF0Y2hcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIHt7IHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLnNlYXJjaF9wcmV2JywgJ1ByZXYnKSB9fVxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICAgICAgdHlwZT1cImRlZmF1bHRcIlxyXG4gICAgICAgICAgOmRpc2FibGVkPVwibWF0Y2hDb3VudCA9PT0gMCB8fCBzZWFyY2hQZW5kaW5nXCJcclxuICAgICAgICAgIEBjbGljaz1cImp1bXBUb05leHRNYXRjaFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge3sgdHJhbnNsYXRlKCd0cm91Ymxlc2hvb3Rpbmcuc2VhcmNoX25leHQnLCAnTmV4dCcpIH19XHJcbiAgICAgICAgPC9uLWJ1dHRvbj5cclxuICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICB0eXBlPVwiZGVmYXVsdFwiXHJcbiAgICAgICAgICA6ZGlzYWJsZWQ9XCJsb2dGaWx0ZXIubGVuZ3RoID09PSAwXCJcclxuICAgICAgICAgIEBjbGljaz1cImNsZWFyU2VhcmNoXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICB7eyB0cmFuc2xhdGUoJ3Ryb3VibGVzaG9vdGluZy5zZWFyY2hfY2xlYXInLCAnQ2xlYXInKSB9fVxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIG9wYWNpdHktNjBcIj5cclxuICAgICAgICAgIHt7IHNlYXJjaENvbnRleHRMYWJlbCB9fVxyXG4gICAgICAgIDwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwicmVsYXRpdmVcIj5cclxuICAgICAgICA8bi1idXR0b25cclxuICAgICAgICAgIHYtaWY9XCJuZXdMb2dzQXZhaWxhYmxlICYmICFyYXdTZWFyY2hBY3RpdmVcIlxyXG4gICAgICAgICAgY2xhc3M9XCJhYnNvbHV0ZSBib3R0b20tNCBsZWZ0LTEvMiB6LTIwIC10cmFuc2xhdGUteC0xLzIgcm91bmRlZC1mdWxsIHB4LTQgcHktMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHNoYWRvdy1sZ1wiXHJcbiAgICAgICAgICB0eXBlPVwicHJpbWFyeVwiXHJcbiAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgIEBjbGljaz1cImp1bXBUb0xhdGVzdFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5uZXdfbG9nc19hdmFpbGFibGUnKSB9fVxyXG4gICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgdi1pZj1cInVuc2VlbkxpbmVzID4gMFwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwibWwtMiByb3VuZGVkIGJnLWRhcmsvMTAgZGFyazpiZy1saWdodC8xMCBweC0yIHB5LTAuNSB0ZXh0LXhzXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgK3t7IHVuc2VlbkxpbmVzIH19XHJcbiAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtYXJyb3ctZG93blwiIDpzaXplPVwiMTRcIiBjbGFzcz1cIm1sLTJcIiAvPlxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcbiAgICAgICAgPG4tYnV0dG9uXHJcbiAgICAgICAgICB2LWVsc2UtaWY9XCJzaG93SnVtcFRvTGF0ZXN0ICYmICFyYXdTZWFyY2hBY3RpdmVcIlxyXG4gICAgICAgICAgY2xhc3M9XCJhYnNvbHV0ZSBib3R0b20tNCBsZWZ0LTEvMiB6LTIwIC10cmFuc2xhdGUteC0xLzIgcm91bmRlZC1mdWxsIHB4LTQgcHktMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHNoYWRvdy1sZ1wiXHJcbiAgICAgICAgICB0eXBlPVwicHJpbWFyeVwiXHJcbiAgICAgICAgICBzdHJvbmdcclxuICAgICAgICAgIEBjbGljaz1cImp1bXBUb0xhdGVzdFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge3sgJHQoJ3Ryb3VibGVzaG9vdGluZy5qdW1wX3RvX2xhdGVzdCcpIH19XHJcbiAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtYXJyb3ctZG93blwiIDpzaXplPVwiMTRcIiBjbGFzcz1cIm1sLTJcIiAvPlxyXG4gICAgICAgIDwvbi1idXR0b24+XHJcblxyXG4gICAgICAgIDxuLXNjcm9sbGJhclxyXG4gICAgICAgICAgcmVmPVwibG9nU2Nyb2xsYmFyXCJcclxuICAgICAgICAgIHN0eWxlPVwiaGVpZ2h0OiA1MjBweFwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCByb3VuZGVkLWxnXCJcclxuICAgICAgICAgIEBzY3JvbGw9XCJvbkxvZ1Njcm9sbFwiXHJcbiAgICAgICAgICBAd2hlZWw9XCJwYXVzZUF1dG9TY3JvbGxcIlxyXG4gICAgICAgICAgQG1vdXNlZG93bj1cInBhdXNlQXV0b1Njcm9sbFwiXHJcbiAgICAgICAgICBAdG91Y2hzdGFydD1cInBhdXNlQXV0b1Njcm9sbFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICBjbGFzcz1cIm0tMCBiZy1saWdodCBkYXJrOmJnLWRhcmsgZm9udC1tb25vIHRleHQtWzEzcHhdIGxlYWRpbmctNSB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0IHAtNCB3aGl0ZXNwYWNlLXByZS13cmFwIGJyZWFrLXdvcmRzXCJcclxuICAgICAgICAgICAgQG1vdXNlZG93bj1cInBhdXNlQXV0b1Njcm9sbFwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICB2LWlmPVwiIXNlYXJjaEFjdGl2ZVwiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJsb2ctbGluZXNcIlxyXG4gICAgICAgICAgICAgIDpzdHlsZT1cInsgJy0tbG9nLWxpbmUtbnVtYmVyLXdpZHRoJzogbGluZU51bWJlcldpZHRoIH1cIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgdi1mb3I9XCIobGluZSwgaW5kZXgpIGluIGxvZ0xpbmVzXCJcclxuICAgICAgICAgICAgICAgIDprZXk9XCJpbmRleFwiXHJcbiAgICAgICAgICAgICAgICA6cmVmPVwic2V0TGluZVJlZihpbmRleClcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJsb2ctbGluZVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2ctbGluZS1udW1iZXJcIj57eyBpbmRleCArIDEgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxvZy1saW5lLXRleHRcIj57eyBsaW5lLmxlbmd0aCA9PT0gMCA/ICcgJyA6IGxpbmUgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHYtZWxzZSBjbGFzcz1cInNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWRhcmsvODAgZGFyazp0ZXh0LWxpZ2h0LzgwXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8c3Bhbj57eyB0cmFuc2xhdGUoJ3Ryb3VibGVzaG9vdGluZy5zZWFyY2hfcmVzdWx0cycsICdSZXN1bHRzJykgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgb3BhY2l0eS02MFwiPlxyXG4gICAgICAgICAgICAgICAgICB7eyBzZWFyY2hDb250ZXh0TGFiZWwgfX1cclxuICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlIHYtaWY9XCJyZXN1bHRzUmFuZ2VMYWJlbFwiPiB8IHt7IHJlc3VsdHNSYW5nZUxhYmVsIH19PC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICB2LWlmPVwic2VhcmNoSW5Qcm9ncmVzc1wiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHAtMyB0ZXh0LXNtIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7IHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLnNlYXJjaF9wZW5kaW5nJywgJ1NlYXJjaGluZy4uLicpIH19XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgdi1lbHNlLWlmPVwibWF0Y2hDb3VudCA9PT0gMFwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIHAtMyB0ZXh0LXNtIG9wYWNpdHktNzBcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7IHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLnNlYXJjaF9ub19tYXRjaGVzJywgJ05vIG1hdGNoZXMnKSB9fVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIHYtZm9yPVwicmVzdWx0IGluIHNlYXJjaFJlc3VsdHNcIlxyXG4gICAgICAgICAgICAgICAgOmtleT1cInJlc3VsdC5pZFwiXHJcbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1kYXJrLzEwIGRhcms6Ym9yZGVyLWxpZ2h0LzEwIGJnLXdoaXRlLzgwIGRhcms6Ymctc3VyZmFjZS82MCBwLTIgdGV4dC1sZWZ0IHRyYW5zaXRpb24gaG92ZXI6YmctZGFyay81IGRhcms6aG92ZXI6YmctbGlnaHQvNVwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7XHJcbiAgICAgICAgICAgICAgICAgICdib3JkZXItYW1iZXItNDAwLzcwIGJnLWFtYmVyLTEwMC82MCBkYXJrOmJnLWFtYmVyLTUwMC8xMCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmlkID09PSBhY3RpdmVNYXRjaEluZGV4LFxyXG4gICAgICAgICAgICAgICAgfVwiXHJcbiAgICAgICAgICAgICAgICA6cmVmPVwic2V0UmVzdWx0UmVmKHJlc3VsdC5pZClcIlxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwib3BlblNlYXJjaFJlc3VsdChyZXN1bHQuaWQpXCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZGFyay83MCBkYXJrOnRleHQtbGlnaHQvNzBcIj5cclxuICAgICAgICAgICAgICAgICAge3sgdHJhbnNsYXRlKCd0cm91Ymxlc2hvb3Rpbmcuc2VhcmNoX2xpbmUnLCAnTGluZScpIH19IHt7IHJlc3VsdC5saW5lSW5kZXggKyAxIH19XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJtdC0xIGZvbnQtbW9ubyB0ZXh0LXhzIGxlYWRpbmctNCB0ZXh0LWRhcmsgZGFyazp0ZXh0LWxpZ2h0IHdoaXRlc3BhY2UtcHJlLXdyYXAgYnJlYWstd29yZHNcIlxyXG4gICAgICAgICAgICAgICAgICA6c3R5bGU9XCJ7ICctLWxvZy1saW5lLW51bWJlci13aWR0aCc6IGxpbmVOdW1iZXJXaWR0aCB9XCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICAgIHYtZm9yPVwic25pcHBldExpbmUgaW4gcmVzdWx0LnNuaXBwZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIDprZXk9XCJzbmlwcGV0TGluZS5saW5lSW5kZXhcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibG9nLWxpbmVcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2ctbGluZS1udW1iZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIHt7IHNuaXBwZXRMaW5lLmxpbmVJbmRleCArIDEgfX1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2ctbGluZS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9XCIoc2VnbWVudCwgc0luZGV4KSBpbiBnZXRMaW5lU2VnbWVudHMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc25pcHBldExpbmUudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzbmlwcGV0TGluZS5saW5lSW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6a2V5PVwic0luZGV4XCJcclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQuaXNNYXRjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHNuaXBwZXRMaW5lLmxpbmVJbmRleCA9PT0gYWN0aXZlTGluZUluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnbG9nLW1hdGNoLWFjdGl2ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdsb2ctbWF0Y2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID57eyBzZWdtZW50LnRleHQgfX08L3NwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9uLXNjcm9sbGJhcj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L3NlY3Rpb24+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyByZWYsIGNvbXB1dGVkLCBvbk1vdW50ZWQsIG9uQmVmb3JlVW5tb3VudCwgbmV4dFRpY2ssIHdhdGNoIH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHR5cGUgeyBDb21wb25lbnRQdWJsaWNJbnN0YW5jZSB9IGZyb20gJ3Z1ZSc7XHJcbmltcG9ydCB7IHVzZUkxOG4gfSBmcm9tICd2dWUtaTE4bic7XHJcbmltcG9ydCB7IE5CdXR0b24sIE5JbnB1dCwgTkFsZXJ0LCBOU2Nyb2xsYmFyLCBOU2VsZWN0IH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IHVzZUF1dGhTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2F1dGgnO1xyXG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnQC9odHRwJztcclxuaW1wb3J0IHR5cGUgeyBDcmFzaER1bXBTdGF0dXMgfSBmcm9tICdAL3V0aWxzL2NyYXNoRHVtcCc7XHJcbmltcG9ydCB7IGlzQ3Jhc2hEdW1wRWxpZ2libGUsIHNhbml0aXplQ3Jhc2hEdW1wU3RhdHVzIH0gZnJvbSAnQC91dGlscy9jcmFzaER1bXAnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5cclxuY29uc3Qgc3RvcmUgPSB1c2VDb25maWdTdG9yZSgpO1xyXG5jb25zdCBhdXRoU3RvcmUgPSB1c2VBdXRoU3RvcmUoKTtcclxuY29uc3QgeyB0IH0gPSB1c2VJMThuKCk7XHJcbmNvbnN0IHBsYXRmb3JtID0gY29tcHV0ZWQoKCkgPT4gc3RvcmUubWV0YWRhdGEucGxhdGZvcm0pO1xyXG5cclxuY29uc3QgY3Jhc2hEdW1wID0gcmVmPENyYXNoRHVtcFN0YXR1cyB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBjcmFzaER1bXBBdmFpbGFibGUgPSBjb21wdXRlZCgoKSA9PiBpc0NyYXNoRHVtcEVsaWdpYmxlKGNyYXNoRHVtcC52YWx1ZSkpO1xyXG5jb25zdCBleHBvcnRDcmFzaFBlbmRpbmcgPSByZWYoZmFsc2UpO1xyXG5cclxuY29uc3QgY2xvc2VBcHBQcmVzc2VkID0gcmVmKGZhbHNlKTtcclxuY29uc3QgY2xvc2VBcHBTdGF0dXMgPSByZWYobnVsbCBhcyBudWxsIHwgYm9vbGVhbik7XHJcbmNvbnN0IHJlc3RhcnRQcmVzc2VkID0gcmVmKGZhbHNlKTtcclxuXHJcbmNvbnN0IGxhdGVzdExvZ3MgPSByZWYoJ0xvYWRpbmcuLi4nKTtcclxuY29uc3QgZGlzcGxheWVkTG9ncyA9IHJlZignTG9hZGluZy4uLicpO1xyXG5jb25zdCBsb2dGaWx0ZXIgPSByZWYoJycpO1xyXG5jb25zdCBzZWFyY2hUZXJtID0gcmVmKCcnKTtcclxuY29uc3QgbG9nU291cmNlID0gcmVmKCdzdW5zaGluZScpO1xyXG50eXBlIExvZ1NlZ21lbnQgPSB7IHRleHQ6IHN0cmluZzsgaXNNYXRjaDogYm9vbGVhbiB9O1xyXG5jb25zdCBtYXRjaExpbmVzID0gcmVmPG51bWJlcltdPihbXSk7XHJcbmNvbnN0IG1hdGNoQ291bnQgPSByZWYoMCk7XHJcbmNvbnN0IHNlYXJjaEluUHJvZ3Jlc3MgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBzZWFyY2hSZXN1bHRMaW1pdCA9IDIwMDtcclxuY29uc3Qgc2VhcmNoQ2h1bmtTaXplID0gMTAwMDtcclxubGV0IHNlYXJjaFRhc2tJZCA9IDA7XHJcbmxldCBzZWFyY2hUYXNrVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5jb25zdCBzZWdtZW50Q2FjaGUgPSBuZXcgTWFwPG51bWJlciwgeyB0ZXJtOiBzdHJpbmc7IHRleHQ6IHN0cmluZzsgc2VnbWVudHM6IExvZ1NlZ21lbnRbXSB9PigpO1xyXG5cclxuY29uc3QgdHJhbnNsYXRlID0gKGtleTogc3RyaW5nLCBmYWxsYmFjazogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgdmFsdWUgPSB0KGtleSk7XHJcbiAgcmV0dXJuIHZhbHVlID09PSBrZXkgPyBmYWxsYmFjayA6IHZhbHVlO1xyXG59O1xyXG5cclxuY29uc3QgdENvdW50ID0gKGtleTogc3RyaW5nLCBmYWxsYmFjazogc3RyaW5nLCBjb3VudDogbnVtYmVyKSA9PiB7XHJcbiAgY29uc3QgdmFsdWUgPSB0KGtleSwgeyBjb3VudCB9KTtcclxuICByZXR1cm4gdmFsdWUgPT09IGtleSA/IGZhbGxiYWNrLnJlcGxhY2UoJ3tjb3VudH0nLCBTdHJpbmcoY291bnQpKSA6IHZhbHVlO1xyXG59O1xyXG5cclxuY29uc3QgbG9nU291cmNlT3B0aW9ucyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgeyBsYWJlbDogdHJhbnNsYXRlKCd0cm91Ymxlc2hvb3RpbmcubG9nc19zb3VyY2Vfc3Vuc2hpbmUnLCAnVmliZXBvbGxvJyksIHZhbHVlOiAnc3Vuc2hpbmUnIH0sXHJcbiAgXTtcclxuICBpZiAocGxhdGZvcm0udmFsdWUgPT09ICd3aW5kb3dzJykge1xyXG4gICAgb3B0aW9ucy5wdXNoKFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLmxvZ3Nfc291cmNlX2Rpc3BsYXlfaGVscGVyJywgJ0Rpc3BsYXkgaGVscGVyJyksXHJcbiAgICAgICAgdmFsdWU6ICdkaXNwbGF5X2hlbHBlcicsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogdHJhbnNsYXRlKCd0cm91Ymxlc2hvb3RpbmcubG9nc19zb3VyY2VfcGxheW5pdGUnLCAnUGxheW5pdGUnKSxcclxuICAgICAgICB2YWx1ZTogJ3BsYXluaXRlJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGxhYmVsOiB0cmFuc2xhdGUoJ3Ryb3VibGVzaG9vdGluZy5sb2dzX3NvdXJjZV9wbGF5bml0ZV9sYXVuY2hlcicsICdQbGF5bml0ZSBsYXVuY2hlcicpLFxyXG4gICAgICAgIHZhbHVlOiAncGxheW5pdGVfbGF1bmNoZXInLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLmxvZ3Nfc291cmNlX3dnYycsICdXR0MgaGVscGVyJyksXHJcbiAgICAgICAgdmFsdWU6ICd3Z2MnLFxyXG4gICAgICB9LFxyXG4gICAgKTtcclxuICB9XHJcbiAgcmV0dXJuIG9wdGlvbnM7XHJcbn0pO1xyXG5cclxuY29uc3QgbG9nU2Nyb2xsYmFyID0gcmVmPEluc3RhbmNlVHlwZTx0eXBlb2YgTlNjcm9sbGJhcj4gfCBudWxsPihudWxsKTtcclxuY29uc3QgYXV0b1Njcm9sbEVuYWJsZWQgPSByZWYodHJ1ZSk7XHJcbmNvbnN0IGxhdGVzdExpbmVDb3VudCA9IHJlZigwKTtcclxuY29uc3QgZGlzcGxheWVkTGluZUNvdW50ID0gcmVmKDApO1xyXG5jb25zdCBpc0F0Qm90dG9tID0gcmVmKHRydWUpO1xyXG5cclxubGV0IGxvZ0ludGVydmFsOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IGxvZ2luRGlzcG9zZXI6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2VhcmNoRGVib3VuY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuY29uc3QgbGluZVJlZnMgPSBuZXcgTWFwPG51bWJlciwgSFRNTEVsZW1lbnQ+KCk7XHJcbmNvbnN0IHJlc3VsdFJlZnMgPSBuZXcgTWFwPG51bWJlciwgSFRNTEVsZW1lbnQ+KCk7XHJcbmNvbnN0IHBlbmRpbmdKdW1wTGluZSA9IHJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcclxuXHJcbmNvbnN0IHNldExpbmVSZWYgPSAoaW5kZXg6IG51bWJlcikgPT4gKGVsOiBFbGVtZW50IHwgQ29tcG9uZW50UHVibGljSW5zdGFuY2UgfCBudWxsKSA9PiB7XHJcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgIGxpbmVSZWZzLnNldChpbmRleCwgZWwpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsaW5lUmVmcy5kZWxldGUoaW5kZXgpO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHNldFJlc3VsdFJlZiA9IChpbmRleDogbnVtYmVyKSA9PiAoZWw6IEVsZW1lbnQgfCBDb21wb25lbnRQdWJsaWNJbnN0YW5jZSB8IG51bGwpID0+IHtcclxuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgcmVzdWx0UmVmcy5zZXQoaW5kZXgsIGVsKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmVzdWx0UmVmcy5kZWxldGUoaW5kZXgpO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHJhd1NlYXJjaCA9IGNvbXB1dGVkKCgpID0+IGxvZ0ZpbHRlci52YWx1ZS50cmltKCkpO1xyXG5jb25zdCByYXdTZWFyY2hBY3RpdmUgPSBjb21wdXRlZCgoKSA9PiByYXdTZWFyY2gudmFsdWUubGVuZ3RoID4gMCk7XHJcbmNvbnN0IHNlYXJjaEFjdGl2ZSA9IGNvbXB1dGVkKCgpID0+IHNlYXJjaFRlcm0udmFsdWUubGVuZ3RoID4gMCk7XHJcbmNvbnN0IGxvZ0xpbmVzID0gY29tcHV0ZWQoKCkgPT4gKGRpc3BsYXllZExvZ3MudmFsdWUgPz8gJycpLnNwbGl0KCdcXG4nKSk7XHJcbmNvbnN0IGxvZ0xpbmVzTG93ZXIgPSBjb21wdXRlZCgoKSA9PiBsb2dMaW5lcy52YWx1ZS5tYXAoKGxpbmUpID0+IGxpbmUudG9Mb3dlckNhc2UoKSkpO1xyXG5jb25zdCBsaW5lTnVtYmVyV2lkdGggPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgZGlnaXRzID0gTWF0aC5tYXgoMywgU3RyaW5nKGxvZ0xpbmVzLnZhbHVlLmxlbmd0aCB8fCAwKS5sZW5ndGgpO1xyXG4gIHJldHVybiBgJHtkaWdpdHN9Y2hgO1xyXG59KTtcclxuY29uc3QgY29udGV4dExpbmVzID0gNTtcclxuY29uc3QgYWN0aXZlTWF0Y2hJbmRleCA9IHJlZigtMSk7XHJcbmNvbnN0IGFjdGl2ZUxpbmVJbmRleCA9IGNvbXB1dGVkKCgpID0+XHJcbiAgYWN0aXZlTWF0Y2hJbmRleC52YWx1ZSA+PSAwID8gKG1hdGNoTGluZXMudmFsdWVbYWN0aXZlTWF0Y2hJbmRleC52YWx1ZV0gPz8gbnVsbCkgOiBudWxsLFxyXG4pO1xyXG5cclxuY29uc3Qgc2VhcmNoUGVuZGluZyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IHJhd1NlYXJjaEFjdGl2ZS52YWx1ZSAmJiAocmF3U2VhcmNoLnZhbHVlICE9PSBzZWFyY2hUZXJtLnZhbHVlIHx8IHNlYXJjaEluUHJvZ3Jlc3MudmFsdWUpLFxyXG4pO1xyXG5jb25zdCBtYXRjaENvdW50TGFiZWwgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFyYXdTZWFyY2hBY3RpdmUudmFsdWUpIHJldHVybiAnJztcclxuICBpZiAoc2VhcmNoUGVuZGluZy52YWx1ZSkge1xyXG4gICAgcmV0dXJuIHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLnNlYXJjaF9wZW5kaW5nJywgJ1NlYXJjaGluZy4uLicpO1xyXG4gIH1cclxuICBpZiAobWF0Y2hDb3VudC52YWx1ZSA9PT0gMCkge1xyXG4gICAgcmV0dXJuIHRyYW5zbGF0ZSgndHJvdWJsZXNob290aW5nLnNlYXJjaF9ub19tYXRjaGVzJywgJ05vIG1hdGNoZXMnKTtcclxuICB9XHJcbiAgcmV0dXJuIHRDb3VudCgndHJvdWJsZXNob290aW5nLnNlYXJjaF9tYXRjaGVzJywgJ3tjb3VudH0gbWF0Y2hlcycsIG1hdGNoQ291bnQudmFsdWUpO1xyXG59KTtcclxuY29uc3Qgc2VhcmNoQ29udGV4dExhYmVsID0gY29tcHV0ZWQoKCkgPT5cclxuICB0Q291bnQoJ3Ryb3VibGVzaG9vdGluZy5zZWFyY2hfY29udGV4dCcsICd7Y291bnR9IGxpbmVzIG9mIGNvbnRleHQnLCBjb250ZXh0TGluZXMpLFxyXG4pO1xyXG5cclxuY29uc3QgcmVzdWx0c1dpbmRvdyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCB0b3RhbCA9IG1hdGNoTGluZXMudmFsdWUubGVuZ3RoO1xyXG4gIGlmICh0b3RhbCA8PSBzZWFyY2hSZXN1bHRMaW1pdCkge1xyXG4gICAgcmV0dXJuIHsgc3RhcnQ6IDAsIGVuZDogdG90YWwgfTtcclxuICB9XHJcbiAgbGV0IHN0YXJ0ID0gMDtcclxuICBpZiAoYWN0aXZlTWF0Y2hJbmRleC52YWx1ZSA+PSAwKSB7XHJcbiAgICBjb25zdCBoYWxmID0gTWF0aC5mbG9vcihzZWFyY2hSZXN1bHRMaW1pdCAvIDIpO1xyXG4gICAgc3RhcnQgPSBNYXRoLm1heChcclxuICAgICAgMCxcclxuICAgICAgTWF0aC5taW4oYWN0aXZlTWF0Y2hJbmRleC52YWx1ZSAtIGhhbGYsIE1hdGgubWF4KDAsIHRvdGFsIC0gc2VhcmNoUmVzdWx0TGltaXQpKSxcclxuICAgICk7XHJcbiAgfVxyXG4gIHJldHVybiB7IHN0YXJ0LCBlbmQ6IE1hdGgubWluKHRvdGFsLCBzdGFydCArIHNlYXJjaFJlc3VsdExpbWl0KSB9O1xyXG59KTtcclxuXHJcbmNvbnN0IHJlc3VsdHNSYW5nZUxhYmVsID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHRvdGFsID0gbWF0Y2hMaW5lcy52YWx1ZS5sZW5ndGg7XHJcbiAgaWYgKHRvdGFsIDw9IHNlYXJjaFJlc3VsdExpbWl0KSByZXR1cm4gJyc7XHJcbiAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSByZXN1bHRzV2luZG93LnZhbHVlO1xyXG4gIGNvbnN0IHRyYW5zbGF0ZWQgPSB0KCd0cm91Ymxlc2hvb3Rpbmcuc2VhcmNoX3Jlc3VsdHNfd2luZG93Jywge1xyXG4gICAgc3RhcnQ6IHN0YXJ0ICsgMSxcclxuICAgIGVuZCxcclxuICAgIGNvdW50OiB0b3RhbCxcclxuICB9KTtcclxuICBpZiAodHJhbnNsYXRlZCA9PT0gJ3Ryb3VibGVzaG9vdGluZy5zZWFyY2hfcmVzdWx0c193aW5kb3cnKSB7XHJcbiAgICByZXR1cm4gYFNob3dpbmcgJHtzdGFydCArIDF9LSR7ZW5kfSBvZiAke3RvdGFsfSByZXN1bHRzYDtcclxuICB9XHJcbiAgcmV0dXJuIHRyYW5zbGF0ZWQ7XHJcbn0pO1xyXG5cclxuY29uc3Qgc2VhcmNoUmVzdWx0cyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoIXNlYXJjaEFjdGl2ZS52YWx1ZSB8fCBzZWFyY2hJblByb2dyZXNzLnZhbHVlKSByZXR1cm4gW107XHJcbiAgY29uc3QgbGluZXMgPSBsb2dMaW5lcy52YWx1ZTtcclxuICBjb25zdCB7IHN0YXJ0OiB3aW5kb3dTdGFydCwgZW5kOiB3aW5kb3dFbmQgfSA9IHJlc3VsdHNXaW5kb3cudmFsdWU7XHJcbiAgcmV0dXJuIG1hdGNoTGluZXMudmFsdWUuc2xpY2Uod2luZG93U3RhcnQsIHdpbmRvd0VuZCkubWFwKChsaW5lSW5kZXgsIG9mZnNldCkgPT4ge1xyXG4gICAgY29uc3QgaWQgPSB3aW5kb3dTdGFydCArIG9mZnNldDtcclxuICAgIGNvbnN0IHNuaXBwZXRTdGFydCA9IE1hdGgubWF4KDAsIGxpbmVJbmRleCAtIGNvbnRleHRMaW5lcyk7XHJcbiAgICBjb25zdCBzbmlwcGV0RW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoIC0gMSwgbGluZUluZGV4ICsgY29udGV4dExpbmVzKTtcclxuICAgIGNvbnN0IHNuaXBwZXQgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSBzbmlwcGV0U3RhcnQ7IGkgPD0gc25pcHBldEVuZDsgaSArPSAxKSB7XHJcbiAgICAgIHNuaXBwZXQucHVzaCh7IGxpbmVJbmRleDogaSwgdGV4dDogbGluZXNbaV0gPz8gJycgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBpZCwgbGluZUluZGV4LCBzbmlwcGV0IH07XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZ2V0TGluZVNlZ21lbnRzKGxpbmU6IHN0cmluZywgbGluZUluZGV4OiBudW1iZXIpIHtcclxuICBjb25zdCB0ZXJtID0gc2VhcmNoVGVybS52YWx1ZS50cmltKCk7XHJcbiAgaWYgKCF0ZXJtKSB7XHJcbiAgICByZXR1cm4gW3sgdGV4dDogbGluZS5sZW5ndGggPT09IDAgPyAnICcgOiBsaW5lLCBpc01hdGNoOiBmYWxzZSB9XTtcclxuICB9XHJcbiAgY29uc3QgY2FjaGVkID0gc2VnbWVudENhY2hlLmdldChsaW5lSW5kZXgpO1xyXG4gIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRlcm0gPT09IHRlcm0gJiYgY2FjaGVkLnRleHQgPT09IGxpbmUpIHtcclxuICAgIHJldHVybiBjYWNoZWQuc2VnbWVudHM7XHJcbiAgfVxyXG4gIGNvbnN0IG5lZWRsZSA9IHRlcm0udG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCBsb3dlciA9IGxpbmUudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCBzZWdtZW50czogTG9nU2VnbWVudFtdID0gW107XHJcbiAgbGV0IGN1cnNvciA9IDA7XHJcbiAgbGV0IG1hdGNoSW5kZXggPSBsb3dlci5pbmRleE9mKG5lZWRsZSwgY3Vyc29yKTtcclxuICB3aGlsZSAobWF0Y2hJbmRleCAhPT0gLTEpIHtcclxuICAgIGlmIChtYXRjaEluZGV4ID4gY3Vyc29yKSB7XHJcbiAgICAgIHNlZ21lbnRzLnB1c2goeyB0ZXh0OiBsaW5lLnNsaWNlKGN1cnNvciwgbWF0Y2hJbmRleCksIGlzTWF0Y2g6IGZhbHNlIH0pO1xyXG4gICAgfVxyXG4gICAgc2VnbWVudHMucHVzaCh7XHJcbiAgICAgIHRleHQ6IGxpbmUuc2xpY2UobWF0Y2hJbmRleCwgbWF0Y2hJbmRleCArIG5lZWRsZS5sZW5ndGgpLFxyXG4gICAgICBpc01hdGNoOiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICBjdXJzb3IgPSBtYXRjaEluZGV4ICsgbmVlZGxlLmxlbmd0aDtcclxuICAgIG1hdGNoSW5kZXggPSBsb3dlci5pbmRleE9mKG5lZWRsZSwgY3Vyc29yKTtcclxuICB9XHJcbiAgaWYgKGN1cnNvciA8IGxpbmUubGVuZ3RoKSB7XHJcbiAgICBzZWdtZW50cy5wdXNoKHsgdGV4dDogbGluZS5zbGljZShjdXJzb3IpLCBpc01hdGNoOiBmYWxzZSB9KTtcclxuICB9XHJcbiAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgc2VnbWVudHMucHVzaCh7IHRleHQ6IGxpbmUubGVuZ3RoID09PSAwID8gJyAnIDogbGluZSwgaXNNYXRjaDogZmFsc2UgfSk7XHJcbiAgfVxyXG4gIHNlZ21lbnRDYWNoZS5zZXQobGluZUluZGV4LCB7IHRlcm0sIHRleHQ6IGxpbmUsIHNlZ21lbnRzIH0pO1xyXG4gIHJldHVybiBzZWdtZW50cztcclxufVxyXG5jb25zdCB1bnNlZW5MaW5lcyA9IGNvbXB1dGVkKCgpID0+IE1hdGgubWF4KDAsIGxhdGVzdExpbmVDb3VudC52YWx1ZSAtIGRpc3BsYXllZExpbmVDb3VudC52YWx1ZSkpO1xyXG5jb25zdCBuZXdMb2dzQXZhaWxhYmxlID0gY29tcHV0ZWQoKCkgPT4gdW5zZWVuTGluZXMudmFsdWUgPiAwKTtcclxuY29uc3Qgc2hvd0p1bXBUb0xhdGVzdCA9IGNvbXB1dGVkKFxyXG4gICgpID0+ICFuZXdMb2dzQXZhaWxhYmxlLnZhbHVlICYmICFpc0F0Qm90dG9tLnZhbHVlICYmICFhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSxcclxuKTtcclxuXHJcbmZ1bmN0aW9uIHJlc2V0TG9nU3RhdGUoKSB7XHJcbiAgbGF0ZXN0TG9ncy52YWx1ZSA9ICdMb2FkaW5nLi4uJztcclxuICBkaXNwbGF5ZWRMb2dzLnZhbHVlID0gJ0xvYWRpbmcuLi4nO1xyXG4gIGxhdGVzdExpbmVDb3VudC52YWx1ZSA9IDA7XHJcbiAgZGlzcGxheWVkTGluZUNvdW50LnZhbHVlID0gMDtcclxuICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IHRydWU7XHJcbiAgaXNBdEJvdHRvbS52YWx1ZSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkTG9nVXJsKCkge1xyXG4gIGlmIChsb2dTb3VyY2UudmFsdWUgPT09ICdzdW5zaGluZScpIHJldHVybiAnLi9hcGkvbG9ncyc7XHJcbiAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xyXG4gIHBhcmFtcy5zZXQoJ3NvdXJjZScsIGxvZ1NvdXJjZS52YWx1ZSk7XHJcbiAgcmV0dXJuIGAuL2FwaS9sb2dzPyR7cGFyYW1zLnRvU3RyaW5nKCl9YDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TG9nQ29udGFpbmVyKCkge1xyXG4gIC8vIE5haXZlIFVJJ3MgPG4tc2Nyb2xsYmFyPiBleHBvc2VzIGBzY3JvbGxiYXJJbnN0UmVmYCAoYSBWdWUgcmVmKSB3aGljaCBpcyBzb21ldGltZXNcclxuICAvLyBhdXRvLXVud3JhcHBlZCBieSB0aGUgY29tcG9uZW50IHB1YmxpYyBpbnN0YW5jZSBwcm94eS4gSGFuZGxlIGJvdGggc2hhcGVzLlxyXG4gIGNvbnN0IG1heWJlID0gKGxvZ1Njcm9sbGJhci52YWx1ZSBhcyBhbnkpPy5zY3JvbGxiYXJJbnN0UmVmO1xyXG4gIGNvbnN0IGludGVybmFsID0gbWF5YmUgJiYgdHlwZW9mIG1heWJlID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIG1heWJlID8gbWF5YmUudmFsdWUgOiBtYXliZTtcclxuICBjb25zdCBmcm9tSW5zdCA9IGludGVybmFsPy5jb250YWluZXJSZWYgPz8gbnVsbDtcclxuICBpZiAoZnJvbUluc3QpIHJldHVybiBmcm9tSW5zdDtcclxuXHJcbiAgLy8gRmFsbGJhY2s6IHF1ZXJ5IHRoZSBET00gaW4gY2FzZSB0aGUgaW50ZXJuYWwgaW5zdGFuY2Ugc2hhcGUgY2hhbmdlcy5cclxuICBjb25zdCByb290RWwgPSAobG9nU2Nyb2xsYmFyLnZhbHVlIGFzIGFueSk/LiRlbCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcclxuICBpZiAoIXJvb3RFbCkgcmV0dXJuIG51bGw7XHJcbiAgcmV0dXJuIChcclxuICAgIHJvb3RFbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm4tc2Nyb2xsYmFyLWNvbnRhaW5lcicpID8/XHJcbiAgICByb290RWwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJ1tjbGFzcyo9XCItc2Nyb2xsYmFyLWNvbnRhaW5lclwiXScpID8/XHJcbiAgICBudWxsXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzQWN0aXZlTG9nU2VsZWN0aW9uKCkge1xyXG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICBpZiAoIXNlbGVjdGlvbiB8fCBzZWxlY3Rpb24uaXNDb2xsYXBzZWQpIHJldHVybiBmYWxzZTtcclxuICBjb25zdCBjb250YWluZXIgPSBnZXRMb2dDb250YWluZXIoKTtcclxuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IGFuY2hvciA9IHNlbGVjdGlvbi5hbmNob3JOb2RlO1xyXG4gIGNvbnN0IGZvY3VzID0gc2VsZWN0aW9uLmZvY3VzTm9kZTtcclxuICByZXR1cm4gISFhbmNob3IgJiYgISFmb2N1cyAmJiBjb250YWluZXIuY29udGFpbnMoYW5jaG9yKSAmJiBjb250YWluZXIuY29udGFpbnMoZm9jdXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkxvZ1Njcm9sbCgpIHtcclxuICBjb25zdCBjb250YWluZXIgPSBnZXRMb2dDb250YWluZXIoKTtcclxuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG4gIGNvbnN0IGF0Qm90dG9tID0gaXNOZWFyQm90dG9tKGNvbnRhaW5lcik7XHJcbiAgaXNBdEJvdHRvbS52YWx1ZSA9IGF0Qm90dG9tO1xyXG4gIGlmIChhdEJvdHRvbSkge1xyXG4gICAgaWYgKCFyYXdTZWFyY2hBY3RpdmUudmFsdWUpIHtcclxuICAgICAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSB0cnVlO1xyXG4gICAgICBkaXNwbGF5ZWRMb2dzLnZhbHVlID0gbGF0ZXN0TG9ncy52YWx1ZTtcclxuICAgICAgZGlzcGxheWVkTGluZUNvdW50LnZhbHVlID0gbGF0ZXN0TGluZUNvdW50LnZhbHVlO1xyXG4gICAgICBzY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTmVhckJvdHRvbShlbDogSFRNTEVsZW1lbnQpIHtcclxuICBjb25zdCB0aHJlc2hvbGQgPSAyNDtcclxuICByZXR1cm4gZWwuc2Nyb2xsVG9wICsgZWwuY2xpZW50SGVpZ2h0ID49IGVsLnNjcm9sbEhlaWdodCAtIHRocmVzaG9sZDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2Nyb2xsVG9Cb3R0b20oKSB7XHJcbiAgY29uc3QgZG9TY3JvbGwgPSAoKSA9PiB7XHJcbiAgICAvLyBBdm9pZCByZWx5aW5nIG9uIHNjcm9sbEhlaWdodCBtYXRoIChhbmQga2VlcCB0eXBlcyBoYXBweSkuXHJcbiAgICAvLyBOYWl2ZSBVSSdzIGludGVybmFsIHNjcm9sbGJhciBjbGFtcHMgbGFyZ2UgdmFsdWVzIHRvIHRoZSBib3R0b20uXHJcbiAgICBsb2dTY3JvbGxiYXIudmFsdWU/LnNjcm9sbFRvKHsgdG9wOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiwgYmVoYXZpb3I6ICdhdXRvJyB9KTtcclxuXHJcbiAgICAvLyBGYWxsYmFjayBmb3IgY2FzZXMgd2hlcmUgdGhlIGNvbXBvbmVudCBtZXRob2Qgbm8tb3BzIChlLmcuLCBjb250YWluZXIgbm90IHJlYWR5IHlldCkuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBnZXRMb2dDb250YWluZXIoKTtcclxuICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XHJcbiAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgIGNvbnRhaW5lci5zY3JvbGxUbz8uKHsgdG9wOiBjb250YWluZXIuc2Nyb2xsSGVpZ2h0LCBiZWhhdmlvcjogJ2F1dG8nIH0pO1xyXG4gICAgaXNBdEJvdHRvbS52YWx1ZSA9IGlzTmVhckJvdHRvbShjb250YWluZXIpO1xyXG4gIH07XHJcblxyXG4gIGRvU2Nyb2xsKCk7XHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGRvU2Nyb2xsKCkpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2Nyb2xsVG9SZXN1bHQoaW5kZXg6IG51bWJlcikge1xyXG4gIGNvbnN0IHJlc3VsdEVsID0gcmVzdWx0UmVmcy5nZXQoaW5kZXgpO1xyXG4gIGlmIChyZXN1bHRFbD8uc2Nyb2xsSW50b1ZpZXcpIHtcclxuICAgIHJlc3VsdEVsLnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2Nyb2xsVG9Mb2dMaW5lKGxpbmVJbmRleDogbnVtYmVyKSB7XHJcbiAgY29uc3QgbGluZUVsID0gbGluZVJlZnMuZ2V0KGxpbmVJbmRleCk7XHJcbiAgaWYgKCFsaW5lRWwpIHJldHVybjtcclxuICBsaW5lRWwuc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ2NlbnRlcicgfSk7XHJcbiAgZmxhc2hMb2dMaW5lKGxpbmVFbCk7XHJcbiAgY29uc3QgY29udGFpbmVyID0gZ2V0TG9nQ29udGFpbmVyKCk7XHJcbiAgaWYgKGNvbnRhaW5lcikgaXNBdEJvdHRvbS52YWx1ZSA9IGlzTmVhckJvdHRvbShjb250YWluZXIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmbGFzaExvZ0xpbmUobGluZUVsOiBIVE1MRWxlbWVudCkge1xyXG4gIGxpbmVFbC5jbGFzc0xpc3QucmVtb3ZlKCdsb2ctZmxhc2gnKTtcclxuICAvLyBGb3JjZSByZWZsb3cgdG8gcmVzdGFydCBhbmltYXRpb24gb24gcmFwaWQgcmVwZWF0cy5cclxuICB2b2lkIGxpbmVFbC5vZmZzZXRXaWR0aDtcclxuICBsaW5lRWwuY2xhc3NMaXN0LmFkZCgnbG9nLWZsYXNoJyk7XHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBsaW5lRWwuY2xhc3NMaXN0LnJlbW92ZSgnbG9nLWZsYXNoJyksIDMwMDApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcGF1c2VBdXRvU2Nyb2xsKCkge1xyXG4gIGlmICghYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUpIHJldHVybjtcclxuICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IGZhbHNlO1xyXG4gIGRpc3BsYXllZExvZ3MudmFsdWUgPSBsYXRlc3RMb2dzLnZhbHVlO1xyXG4gIGRpc3BsYXllZExpbmVDb3VudC52YWx1ZSA9IGxhdGVzdExpbmVDb3VudC52YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0QWN0aXZlTWF0Y2goaW5kZXg6IG51bWJlcikge1xyXG4gIGlmIChtYXRjaExpbmVzLnZhbHVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG4gIGNvbnN0IHRvdGFsID0gbWF0Y2hMaW5lcy52YWx1ZS5sZW5ndGg7XHJcbiAgY29uc3QgbmV4dEluZGV4ID0gKChpbmRleCAlIHRvdGFsKSArIHRvdGFsKSAlIHRvdGFsO1xyXG4gIGFjdGl2ZU1hdGNoSW5kZXgudmFsdWUgPSBuZXh0SW5kZXg7XHJcbiAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSBmYWxzZTtcclxuICBuZXh0VGljaygoKSA9PiB7XHJcbiAgICBzY3JvbGxUb1Jlc3VsdChuZXh0SW5kZXgpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvcGVuU2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIpIHtcclxuICBjb25zdCBsaW5lSW5kZXggPSBtYXRjaExpbmVzLnZhbHVlW2luZGV4XTtcclxuICBpZiAobGluZUluZGV4ID09PSB1bmRlZmluZWQpIHJldHVybjtcclxuICBwZW5kaW5nSnVtcExpbmUudmFsdWUgPSBsaW5lSW5kZXg7XHJcbiAgYWN0aXZlTWF0Y2hJbmRleC52YWx1ZSA9IGluZGV4O1xyXG4gIGF1dG9TY3JvbGxFbmFibGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgaWYgKHNlYXJjaERlYm91bmNlICE9PSBudWxsICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlYXJjaERlYm91bmNlKTtcclxuICAgIHNlYXJjaERlYm91bmNlID0gbnVsbDtcclxuICB9XHJcbiAgY2FuY2VsU2VhcmNoVGFzaygpO1xyXG4gIGxvZ0ZpbHRlci52YWx1ZSA9ICcnO1xyXG4gIHNlYXJjaFRlcm0udmFsdWUgPSAnJztcclxufVxyXG5cclxuZnVuY3Rpb24ganVtcFRvUHJldmlvdXNNYXRjaCgpIHtcclxuICBpZiAobWF0Y2hMaW5lcy52YWx1ZS5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBzZXRBY3RpdmVNYXRjaChhY3RpdmVNYXRjaEluZGV4LnZhbHVlIC0gMSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGp1bXBUb05leHRNYXRjaCgpIHtcclxuICBpZiAobWF0Y2hMaW5lcy52YWx1ZS5sZW5ndGggPT09IDApIHJldHVybjtcclxuICBzZXRBY3RpdmVNYXRjaChhY3RpdmVNYXRjaEluZGV4LnZhbHVlICsgMSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyU2VhcmNoKCkge1xyXG4gIGlmIChzZWFyY2hEZWJvdW5jZSAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChzZWFyY2hEZWJvdW5jZSk7XHJcbiAgICBzZWFyY2hEZWJvdW5jZSA9IG51bGw7XHJcbiAgfVxyXG4gIGNhbmNlbFNlYXJjaFRhc2soKTtcclxuICBwZW5kaW5nSnVtcExpbmUudmFsdWUgPSBudWxsO1xyXG4gIGxvZ0ZpbHRlci52YWx1ZSA9ICcnO1xyXG4gIHNlYXJjaFRlcm0udmFsdWUgPSAnJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsU2VhcmNoVGFzaygpIHtcclxuICBzZWFyY2hUYXNrSWQgKz0gMTtcclxuICBzZWFyY2hJblByb2dyZXNzLnZhbHVlID0gZmFsc2U7XHJcbiAgaWYgKHNlYXJjaFRhc2tUaW1lciAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChzZWFyY2hUYXNrVGltZXIpO1xyXG4gICAgc2VhcmNoVGFza1RpbWVyID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0U2VhcmNoKHRlcm06IHN0cmluZykge1xyXG4gIGNhbmNlbFNlYXJjaFRhc2soKTtcclxuICBzZWdtZW50Q2FjaGUuY2xlYXIoKTtcclxuICBtYXRjaExpbmVzLnZhbHVlID0gW107XHJcbiAgbWF0Y2hDb3VudC52YWx1ZSA9IDA7XHJcbiAgY29uc3QgdHJpbW1lZCA9IHRlcm0udHJpbSgpO1xyXG4gIGlmICghdHJpbW1lZCkgcmV0dXJuO1xyXG4gIGNvbnN0IG5lZWRsZSA9IHRyaW1tZWQudG9Mb3dlckNhc2UoKTtcclxuICBpZiAoIW5lZWRsZSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBsaW5lc0xvd2VyID0gbG9nTGluZXNMb3dlci52YWx1ZTtcclxuICBjb25zdCB0b3RhbExpbmVzID0gbGluZXNMb3dlci5sZW5ndGg7XHJcbiAgbGV0IGluZGV4ID0gMDtcclxuICBsZXQgY291bnQgPSAwO1xyXG4gIGNvbnN0IG1hdGNoZXM6IG51bWJlcltdID0gW107XHJcbiAgY29uc3Qgam9iSWQgPSBzZWFyY2hUYXNrSWQ7XHJcblxyXG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG90YWxMaW5lczsgaW5kZXggKz0gMSkge1xyXG4gICAgICBjb25zdCBsb3dlciA9IGxpbmVzTG93ZXJbaW5kZXhdID8/ICcnO1xyXG4gICAgICBsZXQgZnJvbUluZGV4ID0gMDtcclxuICAgICAgbGV0IGxpbmVIYXNNYXRjaCA9IGZhbHNlO1xyXG4gICAgICB3aGlsZSAoZnJvbUluZGV4IDw9IGxvd2VyLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnN0IG1hdGNoSW5kZXggPSBsb3dlci5pbmRleE9mKG5lZWRsZSwgZnJvbUluZGV4KTtcclxuICAgICAgICBpZiAobWF0Y2hJbmRleCA9PT0gLTEpIGJyZWFrO1xyXG4gICAgICAgIGNvdW50ICs9IDE7XHJcbiAgICAgICAgbGluZUhhc01hdGNoID0gdHJ1ZTtcclxuICAgICAgICBmcm9tSW5kZXggPSBtYXRjaEluZGV4ICsgbmVlZGxlLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBpZiAobGluZUhhc01hdGNoKSBtYXRjaGVzLnB1c2goaW5kZXgpO1xyXG4gICAgfVxyXG4gICAgbWF0Y2hMaW5lcy52YWx1ZSA9IG1hdGNoZXM7XHJcbiAgICBtYXRjaENvdW50LnZhbHVlID0gY291bnQ7XHJcbiAgICBzZWFyY2hJblByb2dyZXNzLnZhbHVlID0gZmFsc2U7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCBwcm9jZXNzQ2h1bmsgPSAoKSA9PiB7XHJcbiAgICBpZiAoam9iSWQgIT09IHNlYXJjaFRhc2tJZCkgcmV0dXJuO1xyXG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4odG90YWxMaW5lcywgaW5kZXggKyBzZWFyY2hDaHVua1NpemUpO1xyXG4gICAgZm9yICg7IGluZGV4IDwgZW5kOyBpbmRleCArPSAxKSB7XHJcbiAgICAgIGNvbnN0IGxvd2VyID0gbGluZXNMb3dlcltpbmRleF0gPz8gJyc7XHJcbiAgICAgIGxldCBmcm9tSW5kZXggPSAwO1xyXG4gICAgICBsZXQgbGluZUhhc01hdGNoID0gZmFsc2U7XHJcbiAgICAgIHdoaWxlIChmcm9tSW5kZXggPD0gbG93ZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hJbmRleCA9IGxvd2VyLmluZGV4T2YobmVlZGxlLCBmcm9tSW5kZXgpO1xyXG4gICAgICAgIGlmIChtYXRjaEluZGV4ID09PSAtMSkgYnJlYWs7XHJcbiAgICAgICAgY291bnQgKz0gMTtcclxuICAgICAgICBsaW5lSGFzTWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgIGZyb21JbmRleCA9IG1hdGNoSW5kZXggKyBuZWVkbGUubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChsaW5lSGFzTWF0Y2gpIG1hdGNoZXMucHVzaChpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaW5kZXggPCB0b3RhbExpbmVzKSB7XHJcbiAgICAgIHNlYXJjaFRhc2tUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KHByb2Nlc3NDaHVuaywgMCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHNlYXJjaFRhc2tUaW1lciA9IG51bGw7XHJcbiAgICBpZiAoam9iSWQgIT09IHNlYXJjaFRhc2tJZCkgcmV0dXJuO1xyXG4gICAgbWF0Y2hMaW5lcy52YWx1ZSA9IG1hdGNoZXM7XHJcbiAgICBtYXRjaENvdW50LnZhbHVlID0gY291bnQ7XHJcbiAgICBzZWFyY2hJblByb2dyZXNzLnZhbHVlID0gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgc2VhcmNoSW5Qcm9ncmVzcy52YWx1ZSA9IHRydWU7XHJcbiAgc2VhcmNoVGFza1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQocHJvY2Vzc0NodW5rLCAwKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaExvZ3MoKSB7XHJcbiAgaWYgKCFhdXRoU3RvcmUuaXNBdXRoZW50aWNhdGVkKSByZXR1cm47XHJcbiAgaWYgKGF1dGhTdG9yZS5sb2dnaW5nSW4pIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldChidWlsZExvZ1VybCgpLCB7XHJcbiAgICAgIHJlc3BvbnNlVHlwZTogJ3RleHQnLFxyXG4gICAgICB0cmFuc2Zvcm1SZXNwb25zZTogWyh2KSA9PiB2XSxcclxuICAgIH0pO1xyXG4gICAgaWYgKHIuc3RhdHVzICE9PSAyMDAgfHwgdHlwZW9mIHIuZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybjtcclxuICAgIGNvbnN0IG5leHRUZXh0ID0gci5kYXRhO1xyXG5cclxuICAgIGxhdGVzdExvZ3MudmFsdWUgPSBuZXh0VGV4dDtcclxuXHJcbiAgICBjb25zdCBuZXh0TGluZXMgPSBuZXh0VGV4dCA/IG5leHRUZXh0LnNwbGl0KCdcXG4nKSA6IFtdO1xyXG4gICAgbGF0ZXN0TGluZUNvdW50LnZhbHVlID0gbmV4dExpbmVzLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCBzZWxlY3Rpb25BY3RpdmUgPSBoYXNBY3RpdmVMb2dTZWxlY3Rpb24oKTtcclxuICAgIGNvbnN0IHNlYXJjaEFjdGl2ZU5vdyA9IHNlYXJjaEFjdGl2ZS52YWx1ZTtcclxuICAgIGNvbnN0IHNlYXJjaElucHV0QWN0aXZlID0gcmF3U2VhcmNoQWN0aXZlLnZhbHVlO1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZ2V0TG9nQ29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBhdEJvdHRvbSA9IGNvbnRhaW5lciA/IGlzTmVhckJvdHRvbShjb250YWluZXIpIDogdHJ1ZTtcclxuICAgIGlzQXRCb3R0b20udmFsdWUgPSBhdEJvdHRvbTtcclxuICAgIGlmIChzZWFyY2hJbnB1dEFjdGl2ZSkge1xyXG4gICAgICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmICghYXRCb3R0b20gJiYgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUpIHtcclxuICAgICAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNob3VsZEF1dG9TY3JvbGwgPVxyXG4gICAgICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSAmJiBhdEJvdHRvbSAmJiAhc2VsZWN0aW9uQWN0aXZlICYmICFzZWFyY2hBY3RpdmVOb3c7XHJcblxyXG4gICAgaWYgKHNob3VsZEF1dG9TY3JvbGwpIHtcclxuICAgICAgZGlzcGxheWVkTG9ncy52YWx1ZSA9IG5leHRUZXh0O1xyXG4gICAgICBkaXNwbGF5ZWRMaW5lQ291bnQudmFsdWUgPSBsYXRlc3RMaW5lQ291bnQudmFsdWU7XHJcbiAgICAgIGF3YWl0IG5leHRUaWNrKCk7XHJcbiAgICAgIHNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAobGF0ZXN0TGluZUNvdW50LnZhbHVlIDwgZGlzcGxheWVkTGluZUNvdW50LnZhbHVlKSB7XHJcbiAgICAgICAgZGlzcGxheWVkTG9ncy52YWx1ZSA9IG5leHRUZXh0O1xyXG4gICAgICAgIGRpc3BsYXllZExpbmVDb3VudC52YWx1ZSA9IGxhdGVzdExpbmVDb3VudC52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gaWdub3JlIGVycm9yc1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXhwb3J0TG9ncygpIHtcclxuICB0cnkge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcbiAgICBpZiAocGxhdGZvcm0udmFsdWUgPT09ICd3aW5kb3dzJykge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcuL2FwaS9sb2dzL2V4cG9ydCc7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBsYXRlc3RMb2dzLnZhbHVlIHx8IGRpc3BsYXllZExvZ3MudmFsdWUgfHwgJyc7XHJcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgnIH0pO1xyXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICBjb25zdCBsaW5rID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKClcclxuICAgICAgLnRvSVNPU3RyaW5nKClcclxuICAgICAgLnJlcGxhY2UoL1s6Ll0vZywgJy0nKVxyXG4gICAgICAucmVwbGFjZSgnVCcsICdfJylcclxuICAgICAgLnJlcGxhY2UoJ1onLCAnJyk7XHJcbiAgICBsaW5rLmhyZWYgPSB1cmw7XHJcbiAgICBsaW5rLmRvd25sb2FkID0gYHN1bnNoaW5lLWxvZ3MtJHt0aW1lc3RhbXB9LmxvZ2A7XHJcbiAgICBsaW5rLmNsaWNrKCk7XHJcbiAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gIH0gY2F0Y2ggKF8pIHt9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hDcmFzaER1bXBTdGF0dXMoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGlmIChwbGF0Zm9ybS52YWx1ZSA9PT0gJ3dpbmRvd3MnKSB7XHJcbiAgICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldCgnL2FwaS9oZWFsdGgvY3Jhc2hkdW1wJywgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgICAgaWYgKHIuc3RhdHVzID09PSAyMDAgJiYgci5kYXRhKSB7XHJcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDcmFzaER1bXBTdGF0dXMoci5kYXRhIGFzIENyYXNoRHVtcFN0YXR1cyk7XHJcbiAgICAgICAgY3Jhc2hEdW1wLnZhbHVlID0gc2FuaXRpemVkID8/IHsgYXZhaWxhYmxlOiBmYWxzZSB9O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNyYXNoRHVtcC52YWx1ZSA9IHsgYXZhaWxhYmxlOiBmYWxzZSB9O1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjcmFzaER1bXAudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgY3Jhc2hEdW1wLnZhbHVlID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4cG9ydENyYXNoQnVuZGxlKCkge1xyXG4gIHJldHVybiB2b2lkIGV4cG9ydENyYXNoQnVuZGxlQXN5bmMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VDb250ZW50RGlzcG9zaXRpb25GaWxlbmFtZShoZWFkZXI/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICBpZiAoIWhlYWRlcikgcmV0dXJuIG51bGw7XHJcbiAgY29uc3QgZmlsZW5hbWVTdGFyID0gL2ZpbGVuYW1lXFwqPVVURi04JycoW147XSspL2kuZXhlYyhoZWFkZXIpO1xyXG4gIGlmIChmaWxlbmFtZVN0YXI/LlsxXSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChmaWxlbmFtZVN0YXJbMV0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmaWxlbmFtZVN0YXJbMV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IGZpbGVuYW1lTWF0Y2ggPSAvZmlsZW5hbWU9XCI/KFteXFxcIjtdKylcIj8vaS5leGVjKGhlYWRlcik7XHJcbiAgcmV0dXJuIGZpbGVuYW1lTWF0Y2g/LlsxXSB8fCBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmlnZ2VyRG93bmxvYWQoYmxvYjogQmxvYiwgZmlsZW5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gIGNvbnN0IGxpbmsgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gIGxpbmsuaHJlZiA9IHVybDtcclxuICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcbiAgbGluay5jbGljaygpO1xyXG4gIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQ3Jhc2hCdW5kbGVQYXJ0KHBhcnRJbmRleDogbnVtYmVyLCBmaWxlbmFtZUhpbnQ/OiBzdHJpbmcpIHtcclxuICBjb25zdCByID0gYXdhaXQgaHR0cC5nZXQoYC9hcGkvbG9ncy9leHBvcnRfY3Jhc2g/cGFydD0ke3BhcnRJbmRleH1gLCB7XHJcbiAgICByZXNwb25zZVR5cGU6ICdibG9iJyxcclxuICAgIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlLFxyXG4gIH0pO1xyXG4gIGlmIChyLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyYXNoIGJ1bmRsZSBkb3dubG9hZCBmYWlsZWQnKTtcclxuICB9XHJcbiAgY29uc3QgaGVhZGVyTmFtZSA9IHBhcnNlQ29udGVudERpc3Bvc2l0aW9uRmlsZW5hbWUoci5oZWFkZXJzPy5bJ2NvbnRlbnQtZGlzcG9zaXRpb24nXSk7XHJcbiAgY29uc3QgZmlsZW5hbWUgPSBmaWxlbmFtZUhpbnQgfHwgaGVhZGVyTmFtZSB8fCBgc3Vuc2hpbmVfY3Jhc2hidW5kbGUtcGFydCR7cGFydEluZGV4fS56aXBgO1xyXG4gIHRyaWdnZXJEb3dubG9hZChyLmRhdGEgYXMgQmxvYiwgZmlsZW5hbWUpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBleHBvcnRDcmFzaEJ1bmRsZUFzeW5jKCkge1xyXG4gIGlmIChleHBvcnRDcmFzaFBlbmRpbmcudmFsdWUpIHJldHVybjtcclxuICBleHBvcnRDcmFzaFBlbmRpbmcudmFsdWUgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuICAgIGNvbnN0IG1hbmlmZXN0ID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvbG9ncy9leHBvcnRfY3Jhc2gvbWFuaWZlc3QnLCB7XHJcbiAgICAgIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBwYXJ0cyA9IEFycmF5LmlzQXJyYXkobWFuaWZlc3QuZGF0YT8ucGFydHMpID8gbWFuaWZlc3QuZGF0YS5wYXJ0cyA6IFtdO1xyXG4gICAgaWYgKG1hbmlmZXN0LnN0YXR1cyA9PT0gMjAwICYmIHBhcnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3Qgb3JkZXJlZCA9IFsuLi5wYXJ0c10uc29ydCgoYSwgYikgPT4gTnVtYmVyKGEuaW5kZXgpIC0gTnVtYmVyKGIuaW5kZXgpKTtcclxuICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIG9yZGVyZWQpIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IE51bWJlcihwYXJ0LmluZGV4KSB8fCAwO1xyXG4gICAgICAgIGlmIChpbmRleCA8PSAwKSBjb250aW51ZTtcclxuICAgICAgICBhd2FpdCBkb3dubG9hZENyYXNoQnVuZGxlUGFydChpbmRleCwgcGFydC5maWxlbmFtZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGF3YWl0IGRvd25sb2FkQ3Jhc2hCdW5kbGVQYXJ0KDEpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gaWdub3JlIGVycm9yc1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBleHBvcnRDcmFzaFBlbmRpbmcudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGp1bXBUb0xhdGVzdCgpIHtcclxuICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IHRydWU7XHJcbiAgZGlzcGxheWVkTG9ncy52YWx1ZSA9IGxhdGVzdExvZ3MudmFsdWU7XHJcbiAgZGlzcGxheWVkTGluZUNvdW50LnZhbHVlID0gbGF0ZXN0TGluZUNvdW50LnZhbHVlO1xyXG4gIG5leHRUaWNrKCgpID0+IHtcclxuICAgIHNjcm9sbFRvQm90dG9tKCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNsb3NlQXBwKCkge1xyXG4gIGNsb3NlQXBwUHJlc3NlZC52YWx1ZSA9IHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLnBvc3QoJy4vYXBpL2FwcHMvY2xvc2UnLCB7fSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICAgIGNsb3NlQXBwU3RhdHVzLnZhbHVlID0gci5kYXRhPy5zdGF0dXMgPT09IHRydWU7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBjbG9zZUFwcFN0YXR1cy52YWx1ZSA9IGZhbHNlO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBjbG9zZUFwcFByZXNzZWQudmFsdWUgPSBmYWxzZTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4gKGNsb3NlQXBwU3RhdHVzLnZhbHVlID0gbnVsbCksIDUwMDApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzdGFydCgpIHtcclxuICByZXN0YXJ0UHJlc3NlZC52YWx1ZSA9IHRydWU7XHJcbiAgc2V0VGltZW91dCgoKSA9PiAocmVzdGFydFByZXNzZWQudmFsdWUgPSBmYWxzZSksIDUwMDApO1xyXG4gIGh0dHAucG9zdCgnLi9hcGkvcmVzdGFydCcsIHt9LCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG59XHJcblxyXG5vbk1vdW50ZWQoYXN5bmMgKCkgPT4ge1xyXG4gIGxvZ2luRGlzcG9zZXIgPSBhdXRoU3RvcmUub25Mb2dpbigoKSA9PiB7XHJcbiAgICB2b2lkIHJlZnJlc2hMb2dzKCk7XHJcbiAgICB2b2lkIHJlZnJlc2hDcmFzaER1bXBTdGF0dXMoKTtcclxuICB9KTtcclxuXHJcbiAgYXdhaXQgYXV0aFN0b3JlLndhaXRGb3JBdXRoZW50aWNhdGlvbigpO1xyXG5cclxuICBhd2FpdCByZWZyZXNoQ3Jhc2hEdW1wU3RhdHVzKCk7XHJcblxyXG4gIG5leHRUaWNrKCgpID0+IHtcclxuICAgIGlmIChnZXRMb2dDb250YWluZXIoKSkgc2Nyb2xsVG9Cb3R0b20oKTtcclxuICB9KTtcclxuXHJcbiAgbG9nSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwocmVmcmVzaExvZ3MsIDUwMDApO1xyXG4gIHJlZnJlc2hMb2dzKCk7XHJcbn0pO1xyXG5cclxub25CZWZvcmVVbm1vdW50KCgpID0+IHtcclxuICBpZiAobG9nSW50ZXJ2YWwpIHdpbmRvdy5jbGVhckludGVydmFsKGxvZ0ludGVydmFsKTtcclxuICBpZiAobG9naW5EaXNwb3NlcikgbG9naW5EaXNwb3NlcigpO1xyXG4gIGlmIChzZWFyY2hEZWJvdW5jZSAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChzZWFyY2hEZWJvdW5jZSk7XHJcbiAgICBzZWFyY2hEZWJvdW5jZSA9IG51bGw7XHJcbiAgfVxyXG4gIGNhbmNlbFNlYXJjaFRhc2soKTtcclxufSk7XHJcblxyXG53YXRjaChyYXdTZWFyY2gsICh2YWx1ZSkgPT4ge1xyXG4gIGlmIChzZWFyY2hEZWJvdW5jZSAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChzZWFyY2hEZWJvdW5jZSk7XHJcbiAgICBzZWFyY2hEZWJvdW5jZSA9IG51bGw7XHJcbiAgfVxyXG4gIGlmICghdmFsdWUpIHtcclxuICAgIHNlYXJjaFRlcm0udmFsdWUgPSAnJztcclxuICAgIGFjdGl2ZU1hdGNoSW5kZXgudmFsdWUgPSAtMTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgYXV0b1Njcm9sbEVuYWJsZWQudmFsdWUgPSBmYWxzZTtcclxuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHNlYXJjaFRlcm0udmFsdWUgPSB2YWx1ZTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgc2VhcmNoRGVib3VuY2UgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBzZWFyY2hUZXJtLnZhbHVlID0gdmFsdWU7XHJcbiAgfSwgMTUwKTtcclxufSk7XHJcblxyXG53YXRjaChbc2VhcmNoVGVybSwgbG9nTGluZXNMb3dlcl0sIChbdGVybV0pID0+IHtcclxuICBzdGFydFNlYXJjaCh0ZXJtKTtcclxufSk7XHJcblxyXG53YXRjaChzZWFyY2hBY3RpdmUsIChhY3RpdmUpID0+IHtcclxuICBpZiAoYWN0aXZlKSB7XHJcbiAgICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IGZhbHNlO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBhY3RpdmVNYXRjaEluZGV4LnZhbHVlID0gLTE7XHJcbiAgaWYgKHBlbmRpbmdKdW1wTGluZS52YWx1ZSAhPT0gbnVsbCkge1xyXG4gICAgY29uc3QgdGFyZ2V0TGluZSA9IHBlbmRpbmdKdW1wTGluZS52YWx1ZTtcclxuICAgIHBlbmRpbmdKdW1wTGluZS52YWx1ZSA9IG51bGw7XHJcbiAgICBuZXh0VGljaygoKSA9PiB7XHJcbiAgICAgIHNjcm9sbFRvTG9nTGluZSh0YXJnZXRMaW5lKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjb25zdCBjb250YWluZXIgPSBnZXRMb2dDb250YWluZXIoKTtcclxuICBpZiAoY29udGFpbmVyICYmIGlzTmVhckJvdHRvbShjb250YWluZXIpKSB7XHJcbiAgICBhdXRvU2Nyb2xsRW5hYmxlZC52YWx1ZSA9IHRydWU7XHJcbiAgICBkaXNwbGF5ZWRMb2dzLnZhbHVlID0gbGF0ZXN0TG9ncy52YWx1ZTtcclxuICAgIGRpc3BsYXllZExpbmVDb3VudC52YWx1ZSA9IGxhdGVzdExpbmVDb3VudC52YWx1ZTtcclxuICAgIG5leHRUaWNrKCgpID0+IHNjcm9sbFRvQm90dG9tKCkpO1xyXG4gIH1cclxufSk7XHJcblxyXG53YXRjaChtYXRjaExpbmVzLCAobGlzdCkgPT4ge1xyXG4gIGlmICghc2VhcmNoQWN0aXZlLnZhbHVlIHx8IGxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICBhY3RpdmVNYXRjaEluZGV4LnZhbHVlID0gLTE7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmIChhY3RpdmVNYXRjaEluZGV4LnZhbHVlID49IGxpc3QubGVuZ3RoKSB7XHJcbiAgICBhY3RpdmVNYXRjaEluZGV4LnZhbHVlID0gbGlzdC5sZW5ndGggLSAxO1xyXG4gIH1cclxufSk7XHJcblxyXG53YXRjaChzZWFyY2hUZXJtLCAodmFsdWUsIG9sZFZhbHVlKSA9PiB7XHJcbiAgaWYgKHZhbHVlICE9PSBvbGRWYWx1ZSkge1xyXG4gICAgYWN0aXZlTWF0Y2hJbmRleC52YWx1ZSA9IC0xO1xyXG4gIH1cclxufSk7XHJcblxyXG53YXRjaChsb2dTb3VyY2UsICgpID0+IHtcclxuICByZXNldExvZ1N0YXRlKCk7XHJcbiAgdm9pZCByZWZyZXNoTG9ncygpO1xyXG4gIG5leHRUaWNrKCgpID0+IHNjcm9sbFRvQm90dG9tKCkpO1xyXG59KTtcclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG4udHJvdWJsZXNob290LXJvb3Qge1xyXG4gIEBhcHBseSBzcGFjZS15LTY7XHJcbn1cclxuXHJcbi50cm91Ymxlc2hvb3QtZ3JpZCB7XHJcbiAgQGFwcGx5IGdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTQ7XHJcbn1cclxuXHJcbi50cm91Ymxlc2hvb3QtY2FyZCB7XHJcbiAgQGFwcGx5IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItZGFyay8xMCBkYXJrOmJvcmRlci1saWdodC8xMCBiZy13aGl0ZS85MCBkYXJrOmJnLXN1cmZhY2UvODAgc2hhZG93LXNtIHB4LTUgcHktNCBzcGFjZS15LTM7XHJcbn1cclxuXHJcbi5sb2ctbGluZXMge1xyXG4gIEBhcHBseSBzcGFjZS15LTA7XHJcbn1cclxuXHJcbi5sb2ctbGluZSB7XHJcbiAgZGlzcGxheTogZ3JpZDtcclxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHZhcigtLWxvZy1saW5lLW51bWJlci13aWR0aCwgNGNoKSBtaW5tYXgoMCwgMWZyKTtcclxuICBjb2x1bW4tZ2FwOiAwLjc1cmVtO1xyXG4gIGFsaWduLWl0ZW1zOiBzdGFydDtcclxuICBwYWRkaW5nOiAwLjI1cmVtIDA7XHJcbn1cclxuXHJcbi5sb2ctbGluZS1udW1iZXIge1xyXG4gIEBhcHBseSB0ZXh0LWxlZnQgb3BhY2l0eS01MCB0YWJ1bGFyLW51bXMgZm9udC1tb25vO1xyXG4gIHVzZXItc2VsZWN0OiBub25lO1xyXG59XHJcblxyXG4ubG9nLWxpbmUtdGV4dCB7XHJcbiAgQGFwcGx5IG1pbi13LTAgYnJlYWstd29yZHM7XHJcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xyXG4gIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xyXG59XHJcblxyXG4ubG9nLW1hdGNoIHtcclxuICBAYXBwbHkgcm91bmRlZC1zbSBiZy1hbWJlci0yMDAvNzAgZGFyazpiZy1hbWJlci00MDAvMzA7XHJcbn1cclxuXHJcbi5sb2ctbWF0Y2gtYWN0aXZlIHtcclxuICBAYXBwbHkgcm91bmRlZC1zbSBiZy1hbWJlci00MDAvODAgZGFyazpiZy1hbWJlci01MDAvNTA7XHJcbn1cclxuXHJcbi5sb2ctZmxhc2gge1xyXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcclxuICBib3gtc2hhZG93OlxyXG4gICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC41KSxcclxuICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMjUpO1xyXG4gIG91dGxpbmU6IDJweCBzb2xpZCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuNTUpO1xyXG4gIG91dGxpbmUtb2Zmc2V0OiAycHg7XHJcbiAgYW5pbWF0aW9uOiBsb2ctZmxhc2gtZmFkZSAzcyBlYXNlLW91dCBmb3J3YXJkcztcclxufVxyXG5cclxuOmRlZXAoLm4tc2Nyb2xsYmFyLWNvbnRhaW5lcikge1xyXG4gIG92ZXJmbG93LXg6IGhpZGRlbiAhaW1wb3J0YW50O1xyXG59XHJcblxyXG46ZGVlcCgubi1zY3JvbGxiYXItcmFpbC0taG9yaXpvbnRhbCkge1xyXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxufVxyXG5cclxuQGtleWZyYW1lcyBsb2ctZmxhc2gtZmFkZSB7XHJcbiAgMCUge1xyXG4gICAgYm94LXNoYWRvdzpcclxuICAgICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC41NSksXHJcbiAgICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMjgpO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjY1KTtcclxuICB9XHJcbiAgNzAlIHtcclxuICAgIGJveC1zaGFkb3c6XHJcbiAgICAgIDAgMCAwIDNweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDAuMjUpLFxyXG4gICAgICAwIDAgMCA2cHggcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwLjEyKTtcclxuICAgIG91dGxpbmUtY29sb3I6IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMC4zNSk7XHJcbiAgfVxyXG4gIDEwMCUge1xyXG4gICAgYm94LXNoYWRvdzpcclxuICAgICAgMCAwIDAgM3B4IHJnYih2YXIoLS1jb2xvci1zZWNvbmRhcnkpIC8gMCksXHJcbiAgICAgIDAgMCAwIDZweCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSAvIDApO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXNlY29uZGFyeSkgLyAwKTtcclxuICB9XHJcbn1cclxuXHJcbi5kYXJrIC5sb2ctZmxhc2gge1xyXG4gIGFuaW1hdGlvbi1uYW1lOiBsb2ctZmxhc2gtZmFkZS1kYXJrO1xyXG59XHJcblxyXG5Aa2V5ZnJhbWVzIGxvZy1mbGFzaC1mYWRlLWRhcmsge1xyXG4gIDAlIHtcclxuICAgIGJveC1zaGFkb3c6XHJcbiAgICAgIDAgMCAwIDNweCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjQ1KSxcclxuICAgICAgMCAwIDAgNnB4IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMjIpO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC41NSk7XHJcbiAgfVxyXG4gIDcwJSB7XHJcbiAgICBib3gtc2hhZG93OlxyXG4gICAgICAwIDAgMCAzcHggcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4yKSxcclxuICAgICAgMCAwIDAgNnB4IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMSk7XHJcbiAgICBvdXRsaW5lLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjMpO1xyXG4gIH1cclxuICAxMDAlIHtcclxuICAgIGJveC1zaGFkb3c6XHJcbiAgICAgIDAgMCAwIDNweCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwKSxcclxuICAgICAgMCAwIDAgNnB4IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDApO1xyXG4gICAgb3V0bGluZS1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMCk7XHJcbiAgfVxyXG59XHJcbjwvc3R5bGU+XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8VHJvdWJsZXNob290aW5nIC8+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0PlxyXG5pbXBvcnQgeyB1c2VDb25maWdTdG9yZSB9IGZyb20gJ0Avc3RvcmVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgTHVjaWRlSWNvbiBmcm9tICdAL2NvbXBvbmVudHMvTHVjaWRlSWNvbi52dWUnO1xyXG5pbXBvcnQgVHJvdWJsZXNob290aW5nIGZyb20gJ0AvVHJvdWJsZXNob290aW5nLnZ1ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbmFtZTogJ1Ryb3VibGVzaG9vdGluZ1ZpZXcnLFxyXG4gIGNvbXBvbmVudHM6IHtcclxuICAgIFRyb3VibGVzaG9vdGluZyxcclxuICAgIEx1Y2lkZUljb24sXHJcbiAgfSxcclxufTtcclxuPC9zY3JpcHQ+XHJcbiJdLCJuYW1lcyI6WyJfb3BlbkJsb2NrIiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfdG9EaXNwbGF5U3RyaW5nIiwiJHQiLCJfY3JlYXRlVk5vZGUiLCJfdW5yZWYiLCJfY3JlYXRlQmxvY2siLCJOSW5wdXQiLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9jcmVhdGVUZXh0Vk5vZGUiLCJfbm9ybWFsaXplQ2xhc3MiXSwibWFwcGluZ3MiOiI7OztBQWFhLE1BQUEscUNBQXFDLEtBQUssT0FBTztBQUU5RCxTQUFTLGVBQWUsUUFBMEM7O0FBQ2hFLE1BQUksQ0FBQztBQUFlLFdBQUE7QUFDZCxRQUFBLFFBQU8sWUFBTyxZQUFQLG1CQUFnQjtBQUN6QixNQUFBO0FBQU0sV0FBTyxTQUFTO0FBQzFCLFFBQU0sU0FBTyxZQUFPLGFBQVAsbUJBQWlCLGtCQUFpQjtBQUN4QyxTQUFBLEtBQUssV0FBVyxlQUFlO0FBQ3hDO0FBRU8sU0FBUyxvQkFBb0IsUUFBMEM7QUFDNUUsTUFBSSxDQUFDLFVBQVUsT0FBTyxjQUFjLE1BQU07QUFDakMsV0FBQTtBQUFBLEVBQ1Q7QUFDSSxNQUFBLGVBQWUsTUFBTSxHQUFHO0FBQ3BCLFVBQUEsT0FBTyxPQUFPLGNBQWM7QUFDbEMsV0FBTyxRQUFRO0FBQUEsRUFDakI7QUFDTyxTQUFBO0FBQ1Q7QUFFTyxTQUFTLHdCQUF3QixRQUF5RDtBQUMvRixNQUFJLENBQUMsUUFBUTtBQUNKLFdBQUE7QUFBQSxFQUNUO0FBQ0ksTUFBQSxPQUFPLGNBQWMsTUFBTTtBQUN0QixXQUFBO0FBQUEsRUFDVDtBQUNJLE1BQUEsQ0FBQyxvQkFBb0IsTUFBTSxHQUFHO0FBQ3pCLFdBQUEsRUFBRSxXQUFXO0VBQ3RCO0FBQ08sU0FBQTtBQUNUOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
