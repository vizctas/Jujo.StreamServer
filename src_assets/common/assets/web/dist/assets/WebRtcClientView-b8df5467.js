import { k as defineComponent, R as useI18n, r as ref, c as computed, e as reactive, w as watch, $ as storeToRefs, b as onBeforeUnmount, o as onMounted, O as createElementBlock, W as createCommentVNode, V as createBaseVNode, U as createVNode, P as toDisplayString, H as normalizeClass, j as createTextVNode, l as withDirectives, a6 as vModelText, a8 as createStaticVNode, F as Fragment, a1 as renderList, a7 as normalizeStyle, S as withCtx, z as Transition, Z as unref, Q as openBlock, s as mergeProps, M as createBlock, n as nextTick } from "./vue-core-de07660f.js";
import { h as http, b as useAppsStore, L as LucideIcon, _ as _export_sfc } from "./index-f3a48eb0.js";
import { aQ as useDialog, au as useMessage, aO as NSwitch, aG as NInputNumber, ap as NAlert } from "./vendor-33781bfc.js";
const VIDEO_MAX_FRAME_AGE_MIN_MS$1 = 5;
const VIDEO_MAX_FRAME_AGE_MAX_MS$1 = 100;
function resolveVideoMaxFrameAgeMs(config) {
  const fps = typeof config.fps === "number" && Number.isFinite(config.fps) && config.fps > 0 ? config.fps : 60;
  const minMs = VIDEO_MAX_FRAME_AGE_MIN_MS$1;
  const maxMs = VIDEO_MAX_FRAME_AGE_MAX_MS$1;
  if (typeof config.videoMaxFrameAgeFrames === "number" && Number.isFinite(config.videoMaxFrameAgeFrames) && config.videoMaxFrameAgeFrames > 0) {
    const frames = Math.round(config.videoMaxFrameAgeFrames);
    const computed2 = Math.round(1e3 / fps * frames);
    if (Number.isFinite(computed2)) {
      return Math.min(maxMs, Math.max(minMs, computed2));
    }
  }
  if (typeof config.videoMaxFrameAgeMs === "number" && Number.isFinite(config.videoMaxFrameAgeMs)) {
    return Math.min(maxMs, Math.max(minMs, Math.round(config.videoMaxFrameAgeMs)));
  }
  return void 0;
}
const webrtcAuthConfig = (overrides) => ({
  validateStatus: () => true,
  __allowUnauthenticated: true,
  ...overrides || {}
});
class WebRtcHttpApi {
  async createSession(config) {
    var _a, _b;
    const muteHostAudio = config.muteHostAudio ?? true;
    const videoMaxFrameAgeMs = resolveVideoMaxFrameAgeMs(config);
    const payload = {
      audio: true,
      host_audio: !muteHostAudio,
      video: true,
      encoded: true,
      width: config.width,
      height: config.height,
      fps: config.fps,
      bitrate_kbps: config.bitrateKbps,
      codec: config.encoding,
      hdr: config.hdr,
      audio_channels: config.audioChannels,
      audio_codec: config.audioCodec,
      profile: config.profile,
      app_id: config.appId,
      resume: config.resume,
      video_pacing_mode: config.videoPacingMode,
      video_pacing_slack_ms: config.videoPacingSlackMs,
      video_max_frame_age_ms: videoMaxFrameAgeMs
    };
    const r = await http.post(
      "/api/webrtc/sessions",
      payload,
      webrtcAuthConfig()
    );
    if (r.status !== 200 || !((_b = (_a = r.data) == null ? void 0 : _a.session) == null ? void 0 : _b.id)) {
      const detail = r.data ? JSON.stringify(r.data) : "no response body";
      throw new Error(`Failed to create WebRTC session (HTTP ${r.status}): ${detail}`);
    }
    return {
      sessionId: r.data.session.id,
      iceServers: r.data.ice_servers ?? [],
      ...r.data.cert_fingerprint !== void 0 ? { certFingerprint: r.data.cert_fingerprint } : {},
      ...r.data.cert_pem !== void 0 ? { certPem: r.data.cert_pem } : {}
    };
  }
  async getSessionState(sessionId) {
    var _a, _b, _c;
    const r = await http.get(
      `/api/webrtc/sessions/${encodeURIComponent(sessionId)}`,
      webrtcAuthConfig()
    );
    if (r.status !== 200) {
      const error = ((_a = r.data) == null ? void 0 : _a.error) ? String(r.data.error) : void 0;
      return { status: r.status, session: null, ...error !== void 0 ? { error } : {} };
    }
    return {
      status: r.status,
      session: ((_b = r.data) == null ? void 0 : _b.session) ?? null,
      ...((_c = r.data) == null ? void 0 : _c.error) !== void 0 ? { error: r.data.error } : {}
    };
  }
  async sendOffer(sessionId, offer) {
    var _a, _b;
    const r = await http.post(
      `/api/webrtc/sessions/${encodeURIComponent(sessionId)}/offer`,
      offer,
      webrtcAuthConfig()
    );
    if (r.status !== 200) {
      const detail = r.data ? JSON.stringify(r.data) : "no response body";
      throw new Error(`Failed to post WebRTC offer (HTTP ${r.status}): ${detail}`);
    }
    if (((_a = r.data) == null ? void 0 : _a.error) && r.data.error !== "Answer not ready") {
      throw new Error(`Failed to post WebRTC offer: ${r.data.error}`);
    }
    if (((_b = r.data) == null ? void 0 : _b.answer_ready) && r.data.sdp) {
      return { type: r.data.type ?? "answer", sdp: r.data.sdp };
    }
    return this.waitForAnswer(sessionId);
  }
  async sendIceCandidate(sessionId, candidate) {
    await this.sendIceCandidates(sessionId, [candidate]);
  }
  async sendIceCandidates(sessionId, candidates) {
    const payload = candidates.filter((candidate) => Boolean(candidate.candidate)).slice(0, 256).map((candidate) => ({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate
    }));
    if (!payload.length)
      return;
    await http.post(
      `/api/webrtc/sessions/${encodeURIComponent(sessionId)}/ice`,
      { candidates: payload },
      webrtcAuthConfig()
    );
  }
  subscribeRemoteCandidates(sessionId, onCandidate) {
    let stopped = false;
    let lastIndex = 0;
    let pollTimer;
    let eventSource = null;
    const stopPolling = () => {
      if (pollTimer) {
        window.clearTimeout(pollTimer);
        pollTimer = void 0;
      }
    };
    const poll = async () => {
      var _a;
      if (stopped)
        return;
      try {
        const r = await http.get(
          `/api/webrtc/sessions/${encodeURIComponent(sessionId)}/ice`,
          webrtcAuthConfig({ params: { since: lastIndex } })
        );
        if (r.status === 200 && Array.isArray((_a = r.data) == null ? void 0 : _a.candidates)) {
          for (const candidate of r.data.candidates) {
            onCandidate({
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
              candidate: candidate.candidate
            });
            if (typeof candidate.index === "number") {
              lastIndex = Math.max(lastIndex, candidate.index);
            }
          }
          if (typeof r.data.next_since === "number") {
            lastIndex = Math.max(lastIndex, r.data.next_since);
          }
        }
      } catch {
      }
      if (!stopped) {
        pollTimer = window.setTimeout(poll, 1e3);
      }
    };
    const startPolling = () => {
      if (pollTimer || stopped)
        return;
      poll();
    };
    try {
      eventSource = new EventSource(
        `/api/webrtc/sessions/${encodeURIComponent(sessionId)}/ice/stream?since=${lastIndex}`
      );
      eventSource.addEventListener("candidate", (event) => {
        if (stopped)
          return;
        try {
          const payload = JSON.parse(event.data);
          onCandidate({
            sdpMid: payload.sdpMid,
            sdpMLineIndex: payload.sdpMLineIndex,
            candidate: payload.candidate
          });
          const id = event.lastEventId;
          if (id) {
            const parsed = Number.parseInt(id, 10);
            if (!Number.isNaN(parsed)) {
              lastIndex = Math.max(lastIndex, parsed);
            }
          }
        } catch {
        }
      });
      eventSource.addEventListener("keepalive", () => {
      });
      eventSource.onerror = () => {
        if (stopped)
          return;
        eventSource == null ? void 0 : eventSource.close();
        eventSource = null;
        startPolling();
      };
    } catch {
      startPolling();
    }
    return () => {
      stopped = true;
      stopPolling();
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }
  async endSession(sessionId, options) {
    if ((options == null ? void 0 : options.keepalive) && typeof fetch === "function") {
      try {
        await fetch(`/api/webrtc/sessions/${encodeURIComponent(sessionId)}`, {
          method: "DELETE",
          keepalive: true,
          credentials: "include",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          }
        });
        return;
      } catch {
      }
    }
    await http.delete(
      `/api/webrtc/sessions/${encodeURIComponent(sessionId)}`,
      webrtcAuthConfig()
    );
  }
  async waitForAnswer(sessionId) {
    var _a, _b, _c;
    const start = Date.now();
    const timeoutMs = 3e4;
    while (Date.now() - start < timeoutMs) {
      try {
        const r = await http.get(
          `/api/webrtc/sessions/${encodeURIComponent(sessionId)}/answer`,
          webrtcAuthConfig()
        );
        if (r.status === 200 && ((_a = r.data) == null ? void 0 : _a.error) && r.data.error !== "Answer not ready") {
          throw new Error(`Failed to fetch WebRTC answer: ${r.data.error}`);
        }
        if (r.status === 200 && ((_b = r.data) == null ? void 0 : _b.sdp)) {
          return { type: r.data.type ?? "answer", sdp: r.data.sdp };
        }
        if (r.status === 400 && ((_c = r.data) == null ? void 0 : _c.error) && r.data.error !== "Answer not ready") {
          throw new Error(`Failed to fetch WebRTC answer: ${r.data.error}`);
        }
      } catch {
      }
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
    return null;
  }
}
const ENCODING_MIME = {
  h264: ["video/h264"],
  hevc: ["video/h265", "video/hevc"],
  av1: ["video/av1"]
};
const DEFAULT_AUDIO_JITTER_TARGET_MS = 20;
const DEFAULT_AUDIO_PLAYOUT_DELAY_MS = 20;
const RECEIVER_HINT_REFRESH_MS = 250;
const STATS_POLL_FAST_MS = 250;
const STATS_POLL_SLOW_MS = 1e3;
const STATS_POLL_FAST_BOOT_MS = 1e4;
const STATS_POLL_FAST_HOLD_MS = 2500;
const STATS_POLL_FAST_JITTER_THRESHOLD_MS = 60;
const ICE_CANDIDATE_BATCH_WINDOW_MS = 75;
const ICE_CANDIDATE_BATCH_LIMIT = 256;
function getVideoCodecCapabilities() {
  var _a, _b, _c, _d;
  try {
    const receiverCaps = typeof RTCRtpReceiver !== "undefined" ? (_a = RTCRtpReceiver.getCapabilities) == null ? void 0 : _a.call(RTCRtpReceiver, "video") : null;
    if ((_b = receiverCaps == null ? void 0 : receiverCaps.codecs) == null ? void 0 : _b.length)
      return receiverCaps;
  } catch {
  }
  try {
    const senderCaps = typeof RTCRtpSender !== "undefined" ? (_c = RTCRtpSender.getCapabilities) == null ? void 0 : _c.call(RTCRtpSender, "video") : null;
    if ((_d = senderCaps == null ? void 0 : senderCaps.codecs) == null ? void 0 : _d.length)
      return senderCaps;
  } catch {
  }
  return null;
}
function parseFmtpParams(fmtpLine) {
  const params = {};
  if (!fmtpLine)
    return params;
  for (const entry of fmtpLine.split(";")) {
    const trimmed = entry.trim();
    if (!trimmed)
      continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      params[trimmed.toLowerCase()] = "";
      continue;
    }
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    const value = trimmed.slice(eq + 1).trim();
    if (key) {
      params[key] = value;
    }
  }
  return params;
}
function getFmtpParam(fmtpLine, key) {
  const params = parseFmtpParams(fmtpLine);
  const value = params[key.toLowerCase()];
  if (value === void 0 || value === "")
    return null;
  return value;
}
function getCodecCapsForEncoding(encoding) {
  var _a;
  const mimes = ENCODING_MIME[encoding.toLowerCase()];
  if (!mimes)
    return [];
  const caps = getVideoCodecCapabilities();
  if (!((_a = caps == null ? void 0 : caps.codecs) == null ? void 0 : _a.length))
    return [];
  return caps.codecs.filter((codec) => mimes.includes(codec.mimeType.toLowerCase()));
}
function isHevcHdrCodec(codec) {
  const profileId = getFmtpParam(codec.sdpFmtpLine ?? void 0, "profile-id");
  if (!profileId) {
    return false;
  }
  return profileId !== "1";
}
function hasHevcHdrSupport() {
  const hevcCaps = getCodecCapsForEncoding("hevc");
  return hevcCaps.some((codec) => isHevcHdrCodec(codec));
}
function supportsHdrEncoding(encoding) {
  const normalized = encoding.toLowerCase();
  if (normalized === "hevc") {
    return hasHevcHdrSupport();
  }
  if (normalized === "av1") {
    return getCodecCapsForEncoding("av1").length > 0;
  }
  return false;
}
function getOfferedVideoCodecNames(sdp) {
  const codecs = /* @__PURE__ */ new Set();
  if (!sdp)
    return codecs;
  const lines = sdp.split(/\r\n/);
  let inVideo = false;
  for (const line of lines) {
    if (line.startsWith("m=")) {
      inVideo = line.startsWith("m=video");
      continue;
    }
    if (!inVideo || !line.startsWith("a=rtpmap:"))
      continue;
    const rest = line.slice("a=rtpmap:".length);
    const space = rest.indexOf(" ");
    if (space < 0)
      continue;
    const codecPart = rest.slice(space + 1).trim();
    if (!codecPart)
      continue;
    const slash = codecPart.indexOf("/");
    const codecName = (slash >= 0 ? codecPart.slice(0, slash) : codecPart).trim();
    if (codecName)
      codecs.add(codecName.toLowerCase());
  }
  return codecs;
}
function offerSupportsEncoding(sdp, encoding) {
  const offered = getOfferedVideoCodecNames(sdp);
  if (!offered.size)
    return false;
  const normalized = encoding.toLowerCase();
  if (normalized === "hevc")
    return offered.has("h265") || offered.has("hevc");
  if (normalized === "av1")
    return offered.has("av1") || offered.has("av1x");
  if (normalized === "h264")
    return offered.has("h264");
  return true;
}
function parseOfferedCodecNamesFromError(message) {
  const offered = /* @__PURE__ */ new Set();
  const match = message.match(/\(offered:\s*([^)]+)\)\s*$/i);
  if (!match)
    return offered;
  const raw = match[1].trim();
  if (!raw || raw.toLowerCase() === "none")
    return offered;
  for (const part of raw.split(",")) {
    const name = part.trim().toLowerCase();
    if (name)
      offered.add(name);
  }
  return offered;
}
function applyCodecPreferences(transceiver, encoding, preferHdr = false) {
  if (!transceiver)
    return;
  const caps = getVideoCodecCapabilities();
  if (!(caps == null ? void 0 : caps.codecs))
    return;
  const mimes = ENCODING_MIME[encoding.toLowerCase()];
  if (!mimes)
    return;
  const preferred = caps.codecs.filter((codec) => mimes.includes(codec.mimeType.toLowerCase()));
  if (!preferred.length)
    return;
  let filteredPreferred = preferred;
  if (preferHdr && (mimes.includes("video/hevc") || mimes.includes("video/h265"))) {
    const hdrPreferred = preferred.filter((codec) => isHevcHdrCodec(codec));
    if (hdrPreferred.length) {
      filteredPreferred = hdrPreferred;
    }
  }
  if (mimes.includes("video/h264")) {
    const packetizationMode1 = preferred.filter(
      (codec) => /(?:^|;)\s*packetization-mode=1(?:;|$)/i.test(codec.sdpFmtpLine ?? "")
    );
    if (packetizationMode1.length) {
      filteredPreferred = packetizationMode1;
    }
  }
  const rest = caps.codecs.filter((codec) => !mimes.includes(codec.mimeType.toLowerCase()));
  try {
    transceiver.setCodecPreferences([...filteredPreferred, ...rest]);
  } catch {
  }
}
function applyInitialBitrateHints(sdp, bitrateKbps) {
  if (!sdp || !bitrateKbps || bitrateKbps <= 0)
    return sdp;
  const normalizedBitrateKbps = Math.max(1, Math.round(bitrateKbps));
  const bitrateBps = normalizedBitrateKbps * 1e3;
  const lines = sdp.split(/\r\n/);
  const output = [];
  let inVideo = false;
  let pendingBandwidth = false;
  const pushBandwidth = () => {
    output.push(`b=AS:${normalizedBitrateKbps}`);
    output.push(`b=TIAS:${bitrateBps}`);
  };
  for (const line of lines) {
    if (line.startsWith("m=")) {
      if (inVideo && pendingBandwidth) {
        pushBandwidth();
      }
      inVideo = line.startsWith("m=video");
      pendingBandwidth = inVideo;
      output.push(line);
      continue;
    }
    if (inVideo) {
      if (line.startsWith("c=") && pendingBandwidth) {
        output.push(line);
        pushBandwidth();
        pendingBandwidth = false;
        continue;
      }
      if (line.startsWith("b=AS:") || line.startsWith("b=TIAS:")) {
        continue;
      }
      if (line.startsWith("a=fmtp:")) {
        const match = line.match(/^a=fmtp:(\d+)\s*(.*)$/);
        if (!match) {
          output.push(line);
          continue;
        }
        const payloadType = match[1];
        const params = match[2] ?? "";
        if (/(?:^|;)\s*apt=\d+/i.test(params)) {
          output.push(line);
          continue;
        }
        const trimmed = params.trim();
        let updatedParams = trimmed;
        if (!trimmed) {
          updatedParams = `x-google-start-bitrate=${normalizedBitrateKbps}`;
        } else if (/x-google-start-bitrate=\d+/i.test(trimmed)) {
          updatedParams = trimmed.replace(
            /x-google-start-bitrate=\d+/i,
            `x-google-start-bitrate=${normalizedBitrateKbps}`
          );
        } else {
          updatedParams = `${trimmed};x-google-start-bitrate=${normalizedBitrateKbps}`;
        }
        output.push(`a=fmtp:${payloadType} ${updatedParams}`);
        continue;
      }
    }
    output.push(line);
  }
  if (inVideo && pendingBandwidth) {
    pushBandwidth();
  }
  const joined = output.join("\r\n");
  return sdp.endsWith("\n") && !joined.endsWith("\r\n") ? `${joined}\r
` : joined;
}
function applyAudioReceiverHints(receiver, targetMs, playoutDelayHintMs) {
  if (!receiver)
    return;
  const receiverAny = receiver;
  const target = resolveJitterTargetMs(targetMs);
  const delayHintMs = typeof playoutDelayHintMs === "number" && Number.isFinite(playoutDelayHintMs) ? Math.max(0, playoutDelayHintMs) : void 0;
  try {
    if (delayHintMs != null && "playoutDelayHint" in receiverAny) {
      receiverAny.playoutDelayHint = delayHintMs / 1e3;
    }
  } catch {
  }
  try {
    if (target != null && typeof receiverAny.jitterBufferTarget === "number") {
      receiverAny.jitterBufferTarget = target;
    }
  } catch {
  }
  if (target == null)
    return;
  try {
    if (typeof receiverAny.getParameters === "function" && typeof receiverAny.setParameters === "function") {
      const parameters = receiverAny.getParameters();
      if (parameters && typeof parameters === "object" && "jitterBufferTarget" in parameters) {
        parameters.jitterBufferTarget = target;
        receiverAny.setParameters(parameters);
      }
    }
  } catch {
  }
}
function resolveJitterTargetMs(value) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return void 0;
  return Math.max(0, value);
}
const VIDEO_MAX_FRAME_AGE_MIN_MS = 5;
const VIDEO_MAX_FRAME_AGE_MAX_MS = 100;
function resolveVideoJitterTargetMs(config) {
  const fps = typeof config.fps === "number" && Number.isFinite(config.fps) && config.fps > 0 ? config.fps : 60;
  const minMs = VIDEO_MAX_FRAME_AGE_MIN_MS;
  const maxMs = VIDEO_MAX_FRAME_AGE_MAX_MS;
  if (typeof config.videoMaxFrameAgeFrames === "number" && Number.isFinite(config.videoMaxFrameAgeFrames) && config.videoMaxFrameAgeFrames > 0) {
    const frames = Math.round(config.videoMaxFrameAgeFrames);
    const computed2 = Math.round(1e3 / fps * frames);
    if (Number.isFinite(computed2)) {
      return Math.min(maxMs, Math.max(minMs, computed2));
    }
  }
  const targetMs = resolveJitterTargetMs(config.videoMaxFrameAgeMs);
  if (targetMs != null)
    return Math.min(maxMs, Math.max(minMs, targetMs));
  return void 0;
}
function applyVideoReceiverHints(receiver, targetMs) {
  if (!receiver)
    return;
  const target = resolveJitterTargetMs(targetMs);
  if (target == null)
    return;
  const receiverAny = receiver;
  try {
    if ("playoutDelayHint" in receiverAny) {
      receiverAny.playoutDelayHint = target / 1e3;
    }
  } catch {
  }
  try {
    if (typeof receiverAny.jitterBufferTarget === "number") {
      receiverAny.jitterBufferTarget = target;
    }
  } catch {
  }
  try {
    if (typeof receiverAny.getParameters === "function" && typeof receiverAny.setParameters === "function") {
      const parameters = receiverAny.getParameters();
      if (parameters && typeof parameters === "object" && "jitterBufferTarget" in parameters) {
        parameters.jitterBufferTarget = target;
        receiverAny.setParameters(parameters);
      }
    }
  } catch {
  }
}
class WebRtcClient {
  constructor(api) {
    this.remoteStream = new MediaStream();
    this.statsState = {};
    this.pendingRemoteCandidates = [];
    this.pendingLocalCandidates = [];
    this.disconnecting = false;
    this.pendingInput = [];
    this.maxPendingInput = 256;
    this.audioJitterTargetMs = DEFAULT_AUDIO_JITTER_TARGET_MS;
    this.audioPlayoutDelayHintMs = DEFAULT_AUDIO_PLAYOUT_DELAY_MS;
    this.api = api;
  }
  get connectionState() {
    var _a;
    return (_a = this.pc) == null ? void 0 : _a.connectionState;
  }
  get inputChannelState() {
    var _a;
    return (_a = this.inputChannel) == null ? void 0 : _a.readyState;
  }
  get inputChannelBufferedAmount() {
    var _a;
    return (_a = this.inputChannel) == null ? void 0 : _a.bufferedAmount;
  }
  get peerConnection() {
    return this.pc;
  }
  async connect(config, callbacks = {}, options = {}) {
    var _a, _b, _c, _d, _e, _f;
    const hdrRequested = Boolean(config.hdr);
    if (config.encoding.toLowerCase() === "av1" && getCodecCapsForEncoding("av1").length === 0) {
      const warning = "AV1 is selected, but this browser reports no AV1 decode support. This can be a false positive—it's not always possible to know until you try. If you get a black screen, switch to HEVC/H.264.";
      (_a = callbacks.onWarning) == null ? void 0 : _a.call(callbacks, warning);
      console.warn(warning);
    }
    if (hdrRequested) {
      const normalized = config.encoding.toLowerCase();
      if (normalized !== "hevc" && normalized !== "av1") {
        const error = new Error("HDR requires HEVC or AV1 video encoding.");
        (_b = callbacks.onError) == null ? void 0 : _b.call(callbacks, error);
        throw error;
      }
      if (!supportsHdrEncoding(config.encoding)) {
        const warning = "HDR is enabled, but this browser reports no HDR-capable decoder/profile for the selected codec. This can be a false positive—it's not always possible to know until you try. If you see a black screen, disable HDR or switch codecs.";
        (_c = callbacks.onWarning) == null ? void 0 : _c.call(callbacks, warning);
        console.warn(warning);
      }
    }
    try {
      return await this.connectAttempt(config, callbacks, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const requested = config.encoding.toLowerCase();
      const isCodecOfferMismatch = message.startsWith("Browser did not offer requested video codec");
      if (requested !== "h264" && (isCodecOfferMismatch || message.includes("Failed to process offer"))) {
        const offered = isCodecOfferMismatch ? parseOfferedCodecNamesFromError(message) : /* @__PURE__ */ new Set();
        const hdrRequestedNow = Boolean(config.hdr);
        const candidates = [];
        if (hdrRequestedNow) {
          if (requested === "hevc" && (offered.has("av1") || offered.has("av1x"))) {
            candidates.push({
              encoding: "av1",
              hdr: true,
              why: "HEVC was requested but the browser did not offer H265; trying AV1 HDR."
            });
          } else if (requested === "av1" && (offered.has("h265") || offered.has("hevc"))) {
            candidates.push({
              encoding: "hevc",
              hdr: true,
              why: "AV1 was requested but the browser did not offer AV1; trying HEVC HDR."
            });
          }
          candidates.push({
            encoding: "h264",
            hdr: false,
            why: "HDR/advanced codec negotiation failed; falling back to SDR H.264 for this session."
          });
        } else {
          candidates.push({
            encoding: "h264",
            hdr: false,
            why: "Advanced codec negotiation failed; falling back to H.264 for this session."
          });
        }
        for (const candidate of candidates) {
          if (candidate.encoding === requested && candidate.hdr === hdrRequestedNow) {
            continue;
          }
          const warning = `${hdrRequestedNow ? "HDR requested; " : ""}${candidate.why} (This does not change your saved settings.)`;
          (_d = callbacks.onWarning) == null ? void 0 : _d.call(callbacks, warning);
          console.warn(warning);
          try {
            const id = await this.connectAttempt(
              { ...config, encoding: candidate.encoding, hdr: candidate.hdr },
              callbacks,
              options
            );
            (_e = callbacks.onNegotiatedEncoding) == null ? void 0 : _e.call(callbacks, candidate.encoding);
            return id;
          } catch {
          }
        }
      }
      const finalError = error instanceof Error ? error : new Error("Failed to establish WebRTC session.");
      (_f = callbacks.onError) == null ? void 0 : _f.call(callbacks, finalError);
      throw finalError;
    }
  }
  async connectAttempt(config, callbacks = {}, options = {}) {
    await this.disconnect();
    this.clearAutoDisconnectTimer();
    this.disconnecting = false;
    const sessionConfig = config;
    const session = await this.api.createSession(sessionConfig);
    this.sessionId = session.sessionId;
    this.pendingRemoteCandidates = [];
    this.videoJitterTargetMs = resolveVideoJitterTargetMs(sessionConfig);
    this.audioJitterTargetMs = DEFAULT_AUDIO_JITTER_TARGET_MS;
    this.audioPlayoutDelayHintMs = DEFAULT_AUDIO_PLAYOUT_DELAY_MS;
    this.statsFastUntilMs = void 0;
    this.statsConnectedAtMs = void 0;
    const requestedEncoding = sessionConfig.encoding.toLowerCase();
    const bundlePolicy = requestedEncoding === "hevc" ? "balanced" : "max-bundle";
    const rtcpMuxPolicy = requestedEncoding === "hevc" ? "negotiate" : "require";
    this.pc = new RTCPeerConnection({
      iceServers: session.iceServers,
      bundlePolicy,
      rtcpMuxPolicy
    });
    const videoTransceiver = this.pc.addTransceiver("video", { direction: "recvonly" });
    this.pc.addTransceiver("audio", { direction: "recvonly" });
    applyCodecPreferences(videoTransceiver, sessionConfig.encoding, Boolean(sessionConfig.hdr));
    const inputPriority = options.inputPriority ?? "high";
    this.inputChannel = this.pc.createDataChannel("input", {
      ordered: false,
      maxRetransmits: 0,
      priority: inputPriority
    });
    this.inputChannel.onopen = () => {
      var _a;
      (_a = callbacks.onInputChannelState) == null ? void 0 : _a.call(callbacks, "open");
      this.flushPendingInput();
    };
    this.inputChannel.onclose = () => {
      var _a;
      return (_a = callbacks.onInputChannelState) == null ? void 0 : _a.call(callbacks, "closed");
    };
    this.inputChannel.onerror = () => {
      var _a;
      return (_a = callbacks.onInputChannelState) == null ? void 0 : _a.call(callbacks, "closing");
    };
    this.inputChannel.onmessage = (event) => {
      if (!callbacks.onInputMessage)
        return;
      if (typeof event.data !== "string")
        return;
      try {
        const message = JSON.parse(event.data);
        if ((message == null ? void 0 : message.type) !== "gamepad_feedback")
          return;
        callbacks.onInputMessage(message);
      } catch {
      }
    };
    this.pc.ontrack = (event) => {
      var _a;
      const track = event.track;
      const kind = track.kind;
      for (const existing of this.remoteStream.getTracks()) {
        if (existing.kind !== kind)
          continue;
        this.remoteStream.removeTrack(existing);
        try {
          existing.stop();
        } catch {
        }
      }
      const removeTrack = () => {
        this.remoteStream.removeTrack(track);
        track.removeEventListener("ended", removeTrack);
      };
      track.addEventListener("ended", removeTrack);
      this.remoteStream.addTrack(track);
      if (kind === "audio") {
        applyAudioReceiverHints(
          event.receiver,
          this.audioJitterTargetMs,
          this.audioPlayoutDelayHintMs
        );
      } else if (kind === "video") {
        track.contentHint = "motion";
        applyVideoReceiverHints(event.receiver, this.videoJitterTargetMs);
      }
      (_a = callbacks.onRemoteStream) == null ? void 0 : _a.call(callbacks, this.remoteStream);
    };
    this.pc.onconnectionstatechange = () => {
      var _a;
      if (!this.pc)
        return;
      const state = this.pc.connectionState;
      (_a = callbacks.onConnectionState) == null ? void 0 : _a.call(callbacks, state);
      if (state === "connected") {
        const now = Date.now();
        this.statsConnectedAtMs = now;
        this.statsFastUntilMs = now + STATS_POLL_FAST_BOOT_MS;
        this.clearAutoDisconnectTimer();
        this.startReceiverHintRefresh();
      } else if (state === "failed" || state === "closed") {
        this.stopReceiverHintRefresh();
        this.scheduleAutoDisconnect(0);
      } else if (state === "disconnected") {
        this.stopReceiverHintRefresh();
        this.scheduleAutoDisconnect(5e3);
      }
    };
    this.pc.oniceconnectionstatechange = () => {
      var _a;
      if (!this.pc)
        return;
      (_a = callbacks.onIceState) == null ? void 0 : _a.call(callbacks, this.pc.iceConnectionState);
    };
    this.pc.onicecandidate = (event) => {
      if (!event.candidate || !this.sessionId)
        return;
      this.queueLocalCandidate(event.candidate.toJSON());
    };
    this.unsubscribeCandidates = this.api.subscribeRemoteCandidates(
      session.sessionId,
      (candidate) => {
        if (!this.pc || !candidate)
          return;
        if (this.pc.remoteDescription) {
          void this.pc.addIceCandidate(candidate).catch(() => {
          });
          return;
        }
        this.pendingRemoteCandidates.push(candidate);
      }
    );
    try {
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      const mungedOffer = {
        type: offer.type,
        sdp: applyInitialBitrateHints(offer.sdp ?? "", sessionConfig.bitrateKbps)
      };
      if (!offerSupportsEncoding(mungedOffer.sdp ?? "", sessionConfig.encoding)) {
        const offered = Array.from(getOfferedVideoCodecNames(mungedOffer.sdp ?? "")).join(", ") || "none";
        throw new Error(
          `Browser did not offer requested video codec '${sessionConfig.encoding}' (offered: ${offered})`
        );
      }
      await this.pc.setLocalDescription(mungedOffer);
      const answer = await this.api.sendOffer(session.sessionId, {
        type: mungedOffer.type,
        sdp: mungedOffer.sdp ?? ""
      });
      if (!(answer == null ? void 0 : answer.sdp)) {
        throw new Error("WebRTC answer not received");
      }
      try {
        await this.pc.setRemoteDescription(answer);
      } catch (error) {
        const offered = Array.from(getOfferedVideoCodecNames(mungedOffer.sdp ?? "")).join(", ") || "none";
        console.error("Failed to apply WebRTC answer SDP", {
          encoding: sessionConfig.encoding,
          offered,
          offerSdp: mungedOffer.sdp,
          answerSdp: answer.sdp,
          error
        });
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to apply WebRTC answer SDP (${sessionConfig.encoding}; offered: ${offered}): ${message}`
        );
      }
      await this.flushPendingCandidates();
    } catch (error) {
      await this.disconnect();
      throw error;
    }
    this.startStatsPolling(callbacks);
    return session.sessionId;
  }
  queueLocalCandidate(candidate) {
    if (!(candidate == null ? void 0 : candidate.candidate) || !this.sessionId)
      return;
    this.pendingLocalCandidates.push(candidate);
    if (this.pendingLocalCandidates.length >= ICE_CANDIDATE_BATCH_LIMIT) {
      this.flushLocalCandidates();
      return;
    }
    if (this.pendingLocalCandidatesTimer)
      return;
    this.pendingLocalCandidatesTimer = window.setTimeout(() => {
      this.pendingLocalCandidatesTimer = void 0;
      this.flushLocalCandidates();
    }, ICE_CANDIDATE_BATCH_WINDOW_MS);
  }
  flushLocalCandidates() {
    if (!this.sessionId || !this.pendingLocalCandidates.length)
      return;
    const candidates = this.pendingLocalCandidates;
    this.pendingLocalCandidates = [];
    void this.api.sendIceCandidates(this.sessionId, candidates).catch(() => {
    });
  }
  async disconnect(options = {}) {
    var _a;
    if (this.disconnecting)
      return;
    this.disconnecting = true;
    this.clearAutoDisconnectTimer();
    this.stopReceiverHintRefresh();
    if (this.statsTimer) {
      window.clearTimeout(this.statsTimer);
      this.statsTimer = void 0;
    }
    this.statsFastUntilMs = void 0;
    this.statsConnectedAtMs = void 0;
    (_a = this.unsubscribeCandidates) == null ? void 0 : _a.call(this);
    this.unsubscribeCandidates = void 0;
    if (this.inputChannel) {
      try {
        this.inputChannel.close();
      } catch {
      }
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
      }
    }
    if (this.sessionId) {
      try {
        await this.api.endSession(this.sessionId, { ...options.keepalive !== void 0 ? { keepalive: options.keepalive } : {} });
      } catch {
      }
    }
    if (this.pendingLocalCandidatesTimer) {
      window.clearTimeout(this.pendingLocalCandidatesTimer);
      this.pendingLocalCandidatesTimer = void 0;
    }
    this.remoteStream = new MediaStream();
    this.pendingRemoteCandidates = [];
    this.pendingLocalCandidates = [];
    this.pc = void 0;
    this.sessionId = void 0;
    this.inputChannel = void 0;
    this.pendingInput = [];
    this.statsState = {};
    this.videoJitterTargetMs = void 0;
    this.statsFastUntilMs = void 0;
    this.statsConnectedAtMs = void 0;
    this.disconnecting = false;
  }
  startReceiverHintRefresh() {
    if (this.receiverHintTimer)
      return;
    this.receiverHintTimer = window.setInterval(() => {
      var _a, _b;
      if (!this.pc)
        return;
      for (const receiver of this.pc.getReceivers()) {
        if (((_a = receiver.track) == null ? void 0 : _a.kind) === "audio") {
          applyAudioReceiverHints(receiver, this.audioJitterTargetMs, this.audioPlayoutDelayHintMs);
        } else if (((_b = receiver.track) == null ? void 0 : _b.kind) === "video") {
          applyVideoReceiverHints(receiver, this.videoJitterTargetMs);
        }
      }
    }, RECEIVER_HINT_REFRESH_MS);
  }
  stopReceiverHintRefresh() {
    if (!this.receiverHintTimer)
      return;
    window.clearInterval(this.receiverHintTimer);
    this.receiverHintTimer = void 0;
  }
  setAudioLatencyTargets(targetMs, playoutDelayHintMs) {
    var _a;
    const resolvedTarget = resolveJitterTargetMs(targetMs) ?? DEFAULT_AUDIO_JITTER_TARGET_MS;
    const resolvedHint = typeof playoutDelayHintMs === "number" && Number.isFinite(playoutDelayHintMs) ? Math.max(0, playoutDelayHintMs) : resolvedTarget;
    this.audioJitterTargetMs = resolvedTarget;
    this.audioPlayoutDelayHintMs = resolvedHint;
    if (!this.pc)
      return;
    for (const receiver of this.pc.getReceivers()) {
      if (((_a = receiver.track) == null ? void 0 : _a.kind) === "audio") {
        applyAudioReceiverHints(receiver, this.audioJitterTargetMs, this.audioPlayoutDelayHintMs);
      }
    }
  }
  setVideoLatencyTarget(targetMs) {
    var _a;
    this.videoJitterTargetMs = resolveJitterTargetMs(targetMs);
    if (!this.pc)
      return;
    for (const receiver of this.pc.getReceivers()) {
      if (((_a = receiver.track) == null ? void 0 : _a.kind) === "video") {
        applyVideoReceiverHints(receiver, this.videoJitterTargetMs);
      }
    }
  }
  sendInput(payload) {
    if (!this.inputChannel || this.inputChannel.readyState !== "open") {
      this.queueInput(payload);
      return false;
    }
    try {
      this.inputChannel.send(payload);
      return true;
    } catch {
      this.queueInput(payload);
      return false;
    }
  }
  queueInput(payload) {
    if (this.pendingInput.length >= this.maxPendingInput) {
      this.pendingInput.shift();
    }
    this.pendingInput.push(payload);
  }
  flushPendingInput() {
    if (!this.inputChannel || this.inputChannel.readyState !== "open")
      return;
    if (!this.pendingInput.length)
      return;
    const pending = this.pendingInput;
    this.pendingInput = [];
    for (const payload of pending) {
      try {
        this.inputChannel.send(payload);
      } catch {
        this.queueInput(payload);
        break;
      }
    }
  }
  startStatsPolling(callbacks) {
    if (!this.pc)
      return;
    if (this.statsTimer)
      return;
    const poll = async () => {
      var _a;
      if (!this.pc)
        return;
      let snapshot = null;
      try {
        const stats = await this.pc.getStats();
        snapshot = this.extractStats(stats);
        (_a = callbacks.onStats) == null ? void 0 : _a.call(callbacks, snapshot);
      } catch {
      }
      if (!this.pc)
        return;
      const now = Date.now();
      const jitter = (snapshot == null ? void 0 : snapshot.videoPlayoutDelayMs) ?? (snapshot == null ? void 0 : snapshot.videoJitterBufferMs);
      if (typeof jitter === "number" && Number.isFinite(jitter) && jitter >= STATS_POLL_FAST_JITTER_THRESHOLD_MS) {
        this.statsFastUntilMs = Math.max(this.statsFastUntilMs ?? 0, now + STATS_POLL_FAST_HOLD_MS);
      }
      const shouldFast = this.statsFastUntilMs != null && now <= this.statsFastUntilMs || this.statsConnectedAtMs != null && now - this.statsConnectedAtMs <= STATS_POLL_FAST_BOOT_MS;
      const delay = shouldFast ? STATS_POLL_FAST_MS : STATS_POLL_SLOW_MS;
      this.statsTimer = window.setTimeout(() => {
        this.statsTimer = void 0;
        void poll();
      }, delay);
    };
    void poll();
  }
  async flushPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription || !this.pendingRemoteCandidates.length)
      return;
    const pc = this.pc;
    const pending = this.pendingRemoteCandidates;
    this.pendingRemoteCandidates = [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
      }
    }
  }
  clearAutoDisconnectTimer() {
    if (this.autoDisconnectTimer) {
      window.clearTimeout(this.autoDisconnectTimer);
      this.autoDisconnectTimer = void 0;
    }
  }
  scheduleAutoDisconnect(delayMs) {
    if (this.disconnecting || !this.sessionId)
      return;
    this.clearAutoDisconnectTimer();
    if (delayMs <= 0) {
      void this.disconnect();
      return;
    }
    this.autoDisconnectTimer = window.setTimeout(() => {
      this.autoDisconnectTimer = void 0;
      void this.disconnect();
    }, delayMs);
  }
  extractStats(report) {
    const inboundVideo = [];
    const inboundAudio = [];
    let rttMs;
    let selectedPair;
    const candidates = /* @__PURE__ */ new Map();
    report.forEach((item) => {
      if (item.type === "inbound-rtp" && item.kind === "video") {
        inboundVideo.push(item);
      }
      if (item.type === "inbound-rtp" && item.kind === "audio") {
        inboundAudio.push(item);
      }
      if (item.type === "candidate-pair" && item.state === "succeeded") {
        rttMs = item.currentRoundTripTime ? item.currentRoundTripTime * 1e3 : rttMs;
        if (item.selected || item.nominated || !selectedPair) {
          selectedPair = item;
        }
      }
      if (item.type === "local-candidate" || item.type === "remote-candidate") {
        candidates.set(item.id, item);
      }
    });
    const pickInbound = (items) => {
      if (!items.length)
        return void 0;
      const asNumber = (value) => typeof value === "number" ? value : 0;
      const sorted = [...items].sort((left, right) => {
        const leftFramesDecoded = asNumber(left.framesDecoded);
        const rightFramesDecoded = asNumber(right.framesDecoded);
        const leftFramesReceived = asNumber(left.framesReceived);
        const rightFramesReceived = asNumber(right.framesReceived);
        const leftHasFrames = leftFramesDecoded > 0 || leftFramesReceived > 0;
        const rightHasFrames = rightFramesDecoded > 0 || rightFramesReceived > 0;
        if (leftHasFrames !== rightHasFrames) {
          return leftHasFrames ? -1 : 1;
        }
        if (leftFramesDecoded !== rightFramesDecoded) {
          return rightFramesDecoded - leftFramesDecoded;
        }
        if (leftFramesReceived !== rightFramesReceived) {
          return rightFramesReceived - leftFramesReceived;
        }
        const leftBytes = asNumber(left.bytesReceived);
        const rightBytes = asNumber(right.bytesReceived);
        if (leftBytes !== rightBytes) {
          return rightBytes - leftBytes;
        }
        const leftPackets = asNumber(left.packetsReceived);
        const rightPackets = asNumber(right.packetsReceived);
        return rightPackets - leftPackets;
      });
      return sorted[0];
    };
    const videoInbound = pickInbound(inboundVideo);
    const audioInbound = pickInbound(inboundAudio);
    const videoInboundId = videoInbound == null ? void 0 : videoInbound.id;
    const audioInboundId = audioInbound == null ? void 0 : audioInbound.id;
    const videoBytes = videoInbound == null ? void 0 : videoInbound.bytesReceived;
    const audioBytes = audioInbound == null ? void 0 : audioInbound.bytesReceived;
    const inboundVideoFps = videoInbound == null ? void 0 : videoInbound.framesPerSecond;
    const packetsLost = (typeof (videoInbound == null ? void 0 : videoInbound.packetsLost) === "number" ? videoInbound.packetsLost : void 0) ?? (typeof (audioInbound == null ? void 0 : audioInbound.packetsLost) === "number" ? audioInbound.packetsLost : void 0);
    const videoPackets = videoInbound == null ? void 0 : videoInbound.packetsReceived;
    const audioPackets = audioInbound == null ? void 0 : audioInbound.packetsReceived;
    const videoFramesReceived = videoInbound == null ? void 0 : videoInbound.framesReceived;
    const videoFramesDecoded = videoInbound == null ? void 0 : videoInbound.framesDecoded;
    const videoFramesDropped = videoInbound == null ? void 0 : videoInbound.framesDropped;
    const videoTotalDecodeTime = videoInbound == null ? void 0 : videoInbound.totalDecodeTime;
    const videoJitterMs = typeof (videoInbound == null ? void 0 : videoInbound.jitter) === "number" ? videoInbound.jitter * 1e3 : void 0;
    const audioJitterMs = typeof (audioInbound == null ? void 0 : audioInbound.jitter) === "number" ? audioInbound.jitter * 1e3 : void 0;
    const videoJitterBufferDelay = videoInbound == null ? void 0 : videoInbound.jitterBufferDelay;
    const videoJitterBufferEmittedCount = videoInbound == null ? void 0 : videoInbound.jitterBufferEmittedCount;
    const audioJitterBufferDelay = audioInbound == null ? void 0 : audioInbound.jitterBufferDelay;
    const audioJitterBufferEmittedCount = audioInbound == null ? void 0 : audioInbound.jitterBufferEmittedCount;
    const videoCodecId = videoInbound == null ? void 0 : videoInbound.codecId;
    const audioCodecId = audioInbound == null ? void 0 : audioInbound.codecId;
    let videoCodec;
    let audioCodec;
    if (videoCodecId) {
      const codec = report.get(videoCodecId);
      if (codec == null ? void 0 : codec.mimeType) {
        videoCodec = codec.mimeType;
      }
    }
    if (audioCodecId) {
      const codec = report.get(audioCodecId);
      if (codec == null ? void 0 : codec.mimeType) {
        audioCodec = codec.mimeType;
      }
    }
    let candidatePair;
    if (selectedPair) {
      const local = candidates.get(selectedPair.localCandidateId);
      const remote = candidates.get(selectedPair.remoteCandidateId);
      candidatePair = {
        state: selectedPair.state,
        protocol: selectedPair.protocol,
        localAddress: local == null ? void 0 : local.address,
        localPort: local == null ? void 0 : local.port,
        localType: local == null ? void 0 : local.candidateType,
        remoteAddress: remote == null ? void 0 : remote.address,
        remotePort: remote == null ? void 0 : remote.port,
        remoteType: remote == null ? void 0 : remote.candidateType
      };
    }
    const now = Date.now();
    const last = this.statsState;
    const deltaMs = last.lastTimestampMs ? Math.max(1, now - last.lastTimestampMs) : 0;
    const sameVideoInbound = videoInboundId && last.lastVideoInboundId === videoInboundId;
    const sameAudioInbound = audioInboundId && last.lastAudioInboundId === audioInboundId;
    const calcRate = (bytes, lastBytes) => {
      if (bytes == null || lastBytes == null || !deltaMs)
        return void 0;
      return Math.round((bytes - lastBytes) * 8 / deltaMs);
    };
    const calcFps = (frames, lastFrames) => {
      if (frames == null || lastFrames == null || !deltaMs)
        return void 0;
      const deltaFrames = frames - lastFrames;
      if (deltaFrames <= 0)
        return void 0;
      return deltaFrames * 1e3 / deltaMs;
    };
    const videoBitrate = calcRate(videoBytes, sameVideoInbound ? last.lastVideoBytes : void 0);
    const audioBitrate = calcRate(audioBytes, sameAudioInbound ? last.lastAudioBytes : void 0);
    const calcJitterBufferMs = (delay, emitted, lastDelay, lastEmitted) => {
      if (delay == null || emitted == null || emitted <= 0)
        return void 0;
      if (lastDelay == null || lastEmitted == null)
        return void 0;
      const deltaDelay = delay - lastDelay;
      const deltaEmitted = emitted - lastEmitted;
      if (deltaEmitted <= 0 || deltaDelay < 0)
        return void 0;
      return deltaDelay / deltaEmitted * 1e3;
    };
    const calcPlayoutDelayMs = (inbound) => {
      return void 0;
    };
    const calcDecodeMs = (totalDecodeTime, framesDecoded, lastTotalDecodeTime, lastFramesDecoded) => {
      if (totalDecodeTime == null || framesDecoded == null || framesDecoded <= 0)
        return void 0;
      if (lastTotalDecodeTime != null && lastFramesDecoded != null) {
        const deltaTime = totalDecodeTime - lastTotalDecodeTime;
        const deltaFrames = framesDecoded - lastFramesDecoded;
        if (deltaFrames > 0 && deltaTime >= 0) {
          return deltaTime / deltaFrames * 1e3;
        }
      }
      return totalDecodeTime / framesDecoded * 1e3;
    };
    const videoJitterBufferMs = calcJitterBufferMs(
      videoJitterBufferDelay,
      videoJitterBufferEmittedCount,
      sameVideoInbound ? last.lastVideoJitterBufferDelay : void 0,
      sameVideoInbound ? last.lastVideoJitterBufferEmittedCount : void 0
    );
    const audioJitterBufferMs = calcJitterBufferMs(
      audioJitterBufferDelay,
      audioJitterBufferEmittedCount,
      sameAudioInbound ? last.lastAudioJitterBufferDelay : void 0,
      sameAudioInbound ? last.lastAudioJitterBufferEmittedCount : void 0
    );
    const videoDecodeMs = calcDecodeMs(
      videoTotalDecodeTime,
      videoFramesDecoded,
      sameVideoInbound ? last.lastVideoTotalDecodeTime : void 0,
      sameVideoInbound ? last.lastVideoFramesDecoded : void 0
    );
    const videoFpsFromDecoded = calcFps(
      videoFramesDecoded,
      sameVideoInbound ? last.lastVideoFramesDecoded : void 0
    );
    const videoFpsFromReceived = calcFps(
      videoFramesReceived,
      sameVideoInbound ? last.lastVideoFramesReceived : void 0
    );
    const videoFps = videoFpsFromDecoded ?? videoFpsFromReceived ?? inboundVideoFps;
    const videoPlayoutDelayMs = calcPlayoutDelayMs();
    const audioPlayoutDelayMs = calcPlayoutDelayMs();
    this.statsState = {
      lastTimestampMs: now,
      lastVideoInboundId: videoInboundId,
      lastAudioInboundId: audioInboundId,
      lastVideoBytes: videoBytes,
      lastAudioBytes: audioBytes,
      lastVideoJitterBufferDelay: videoJitterBufferDelay,
      lastVideoJitterBufferEmittedCount: videoJitterBufferEmittedCount,
      lastAudioJitterBufferDelay: audioJitterBufferDelay,
      lastAudioJitterBufferEmittedCount: audioJitterBufferEmittedCount,
      lastVideoTotalDecodeTime: videoTotalDecodeTime,
      lastVideoFramesDecoded: videoFramesDecoded,
      lastVideoFramesReceived: videoFramesReceived
    };
    return {
      videoBitrateKbps: videoBitrate ? Math.max(0, videoBitrate) : void 0,
      audioBitrateKbps: audioBitrate ? Math.max(0, audioBitrate) : void 0,
      videoFps,
      packetsLost,
      roundTripTimeMs: rttMs,
      videoBytesReceived: videoBytes,
      audioBytesReceived: audioBytes,
      videoPacketsReceived: videoPackets,
      audioPacketsReceived: audioPackets,
      videoFramesReceived,
      videoFramesDecoded,
      videoFramesDropped,
      videoDecodeMs,
      videoJitterMs,
      audioJitterMs,
      videoJitterBufferMs,
      audioJitterBufferMs,
      videoPlayoutDelayMs,
      audioPlayoutDelayMs,
      videoCodec,
      audioCodec,
      candidatePair
    };
  }
}
const WHEEL_STEP_PIXELS = 120;
function getKeyboardLockApi() {
  if (typeof navigator === "undefined")
    return null;
  const anyNavigator = navigator;
  return anyNavigator.keyboard ?? null;
}
let keyboardLockPending = null;
let keyboardLockActive = false;
let keyboardLockHolders = 0;
let keyboardLockPendingRequests = 0;
function requestKeyboardLock(keys) {
  const keyboardLockApi = getKeyboardLockApi();
  if (!(keyboardLockApi == null ? void 0 : keyboardLockApi.lock))
    return Promise.resolve(false);
  if (typeof window !== "undefined" && "isSecureContext" in window && !window.isSecureContext) {
    return Promise.resolve(false);
  }
  if (keyboardLockActive) {
    keyboardLockHolders += 1;
    return Promise.resolve(true);
  }
  if (keyboardLockPending) {
    keyboardLockPendingRequests += 1;
    return keyboardLockPending;
  }
  keyboardLockPendingRequests = 1;
  const pending = (keys ? keyboardLockApi.lock(keys) : keyboardLockApi.lock()).then(
    () => {
      var _a;
      keyboardLockActive = true;
      keyboardLockHolders = keyboardLockPendingRequests;
      keyboardLockPendingRequests = 0;
      if (keyboardLockHolders === 0) {
        try {
          (_a = keyboardLockApi.unlock) == null ? void 0 : _a.call(keyboardLockApi);
        } catch {
        }
        keyboardLockActive = false;
      }
      return keyboardLockActive;
    },
    () => {
      keyboardLockPendingRequests = 0;
      return false;
    }
  );
  keyboardLockPending = pending;
  pending.finally(() => {
    if (keyboardLockPending === pending) {
      keyboardLockPending = null;
    }
  });
  return pending;
}
function releaseKeyboardLock() {
  var _a;
  if (keyboardLockPending) {
    if (keyboardLockPendingRequests > 0) {
      keyboardLockPendingRequests -= 1;
    }
    return;
  }
  if (keyboardLockHolders > 0) {
    keyboardLockHolders -= 1;
  }
  if (!keyboardLockActive || keyboardLockHolders > 0)
    return;
  const keyboardLockApi = getKeyboardLockApi();
  try {
    (_a = keyboardLockApi == null ? void 0 : keyboardLockApi.unlock) == null ? void 0 : _a.call(keyboardLockApi);
  } catch {
  }
  keyboardLockActive = false;
}
function modifiersFromEvent(event) {
  return {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    meta: event.metaKey
  };
}
function isEditableTarget(target) {
  if (!target || typeof target !== "object")
    return false;
  if (!target.tagName)
    return false;
  const el = target;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select")
    return true;
  if (el.isContentEditable)
    return true;
  return false;
}
function isFullscreenElement(element) {
  try {
    const fullscreenEl = document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
    return fullscreenEl === element;
  } catch {
    return false;
  }
}
function shouldPreventDefaultKey(event) {
  if (event.code === "Escape" || event.key === "Escape")
    return true;
  if (event.code === "Space" || event.key === " " || event.key === "Spacebar")
    return true;
  if (event.code === "Tab" || event.key === "Tab")
    return true;
  if (event.code === "MetaLeft" || event.code === "MetaRight")
    return true;
  if (event.key === "Meta")
    return true;
  if (event.key === "Alt" || event.key === "AltGraph" || event.key === "Control")
    return true;
  if (event.metaKey || event.altKey || event.ctrlKey)
    return true;
  return false;
}
function isModifierCode(code) {
  return code === "AltLeft" || code === "AltRight" || code === "ControlLeft" || code === "ControlRight" || code === "MetaLeft" || code === "MetaRight" || code === "ShiftLeft" || code === "ShiftRight";
}
function resolveInputRect(element, video) {
  const rect = element.getBoundingClientRect();
  if (!video || !video.videoWidth || !video.videoHeight || rect.width <= 0 || rect.height <= 0) {
    return { rect, contentRect: rect };
  }
  const elementAspect = rect.width / rect.height;
  const videoAspect = video.videoWidth / video.videoHeight;
  let contentWidth = rect.width;
  let contentHeight = rect.height;
  let offsetX = 0;
  let offsetY = 0;
  if (videoAspect > elementAspect) {
    contentHeight = rect.width / videoAspect;
    offsetY = (rect.height - contentHeight) / 2;
  } else if (videoAspect < elementAspect) {
    contentWidth = rect.height * videoAspect;
    offsetX = (rect.width - contentWidth) / 2;
  }
  const contentRect = new DOMRect(
    rect.left + offsetX,
    rect.top + offsetY,
    contentWidth,
    contentHeight
  );
  return { rect, contentRect };
}
function normalizePoint(event, element, video) {
  const { contentRect } = resolveInputRect(element, video);
  const x = contentRect.width ? (event.clientX - contentRect.left) / contentRect.width : 0;
  const y = contentRect.height ? (event.clientY - contentRect.top) / contentRect.height : 0;
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y))
  };
}
function normalizeWheelDelta(delta, deltaMode) {
  if (deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
    return delta / WHEEL_STEP_PIXELS;
  }
  return delta;
}
const MAX_GAMEPADS = 16;
const AXIS_DEADZONE = 0.08;
const MOTION_SEND_INTERVAL_MS = 16;
const MOTION_DIFF_THRESHOLD = 0.1;
const GAMEPAD_STATE_HEARTBEAT_MS = 500;
const activeGamepads = /* @__PURE__ */ new Map();
const motionRequestState = /* @__PURE__ */ new Map();
const GAMEPAD_TYPE = {
  unknown: 0,
  xbox: 1,
  playstation: 2,
  nintendo: 3
};
const GAMEPAD_CAPS = {
  analogTriggers: 1,
  touchpad: 8,
  accel: 16,
  gyro: 32
};
const GAMEPAD_BUTTONS = {
  dpadUp: 1,
  dpadDown: 2,
  dpadLeft: 4,
  dpadRight: 8,
  start: 16,
  back: 32,
  leftStick: 64,
  rightStick: 128,
  leftButton: 256,
  rightButton: 512,
  home: 1024,
  a: 4096,
  b: 8192,
  x: 16384,
  y: 32768,
  paddle1: 65536,
  paddle2: 131072,
  paddle3: 262144,
  paddle4: 524288,
  touchpadButton: 1048576,
  miscButton: 2097152
};
const STANDARD_BUTTON_MAP = /* @__PURE__ */ new Map([
  [0, GAMEPAD_BUTTONS.a],
  [1, GAMEPAD_BUTTONS.b],
  [2, GAMEPAD_BUTTONS.x],
  [3, GAMEPAD_BUTTONS.y],
  [4, GAMEPAD_BUTTONS.leftButton],
  [5, GAMEPAD_BUTTONS.rightButton],
  [8, GAMEPAD_BUTTONS.back],
  [9, GAMEPAD_BUTTONS.start],
  [10, GAMEPAD_BUTTONS.leftStick],
  [11, GAMEPAD_BUTTONS.rightStick],
  [12, GAMEPAD_BUTTONS.dpadUp],
  [13, GAMEPAD_BUTTONS.dpadDown],
  [14, GAMEPAD_BUTTONS.dpadLeft],
  [15, GAMEPAD_BUTTONS.dpadRight],
  [16, GAMEPAD_BUTTONS.home],
  [17, GAMEPAD_BUTTONS.miscButton]
]);
function resolveGamepadType(gamepad) {
  const id = (gamepad.id || "").toLowerCase();
  if (id.includes("nintendo") || id.includes("switch") || id.includes("joy-con")) {
    return GAMEPAD_TYPE.nintendo;
  }
  if (id.includes("playstation") || id.includes("dualshock") || id.includes("dualsense") || id.includes("ps4") || id.includes("ps5")) {
    return GAMEPAD_TYPE.playstation;
  }
  if (id.includes("xbox")) {
    return GAMEPAD_TYPE.xbox;
  }
  if (id.includes("wireless controller")) {
    return GAMEPAD_TYPE.playstation;
  }
  return GAMEPAD_TYPE.unknown;
}
function resolveButtonMap(gamepad, type) {
  const map = new Map(STANDARD_BUTTON_MAP);
  if (type === GAMEPAD_TYPE.playstation) {
    map.set(17, GAMEPAD_BUTTONS.touchpadButton);
  }
  if (gamepad.buttons.length > 17) {
    map.set(18, GAMEPAD_BUTTONS.paddle1);
  }
  if (gamepad.buttons.length > 18) {
    map.set(19, GAMEPAD_BUTTONS.paddle2);
  }
  if (gamepad.buttons.length > 19) {
    map.set(20, GAMEPAD_BUTTONS.paddle3);
  }
  if (gamepad.buttons.length > 20) {
    map.set(21, GAMEPAD_BUTTONS.paddle4);
  }
  return map;
}
function applyDeadzone(value, deadzone) {
  const abs = Math.abs(value);
  if (abs <= deadzone)
    return 0;
  const scaled = (abs - deadzone) / (1 - deadzone);
  return Math.min(1, Math.max(0, scaled)) * Math.sign(value);
}
function toInt16(value) {
  const clamped = Math.min(1, Math.max(-1, value));
  return Math.round(clamped * 32767);
}
function toUint8(value) {
  const clamped = Math.min(1, Math.max(0, value));
  return Math.round(clamped * 255);
}
function readButtons(gamepad, buttonMap) {
  let mask = 0;
  buttonMap.forEach((bit, index) => {
    const button = gamepad.buttons[index];
    if (button == null ? void 0 : button.pressed) {
      mask |= bit;
    }
  });
  return mask;
}
function readGamepadState(gamepad, buttonMap) {
  var _a, _b;
  const axes = gamepad.axes || [];
  const lx = applyDeadzone(axes[0] ?? 0, AXIS_DEADZONE);
  const ly = applyDeadzone(-(axes[1] ?? 0), AXIS_DEADZONE);
  const rx = applyDeadzone(axes[2] ?? 0, AXIS_DEADZONE);
  const ry = applyDeadzone(-(axes[3] ?? 0), AXIS_DEADZONE);
  const lt = toUint8(((_a = gamepad.buttons[6]) == null ? void 0 : _a.value) ?? 0);
  const rt = toUint8(((_b = gamepad.buttons[7]) == null ? void 0 : _b.value) ?? 0);
  return {
    buttons: readButtons(gamepad, buttonMap),
    lt,
    rt,
    lsX: toInt16(lx),
    lsY: toInt16(ly),
    rsX: toInt16(rx),
    rsY: toInt16(ry)
  };
}
function readMotionVector(value) {
  if (!value || typeof value !== "object")
    return void 0;
  const array = Array.isArray(value) ? value : value;
  if (typeof array.length !== "number" || array.length < 3)
    return void 0;
  const x = Number(array[0]);
  const y = Number(array[1]);
  const z = Number(array[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z))
    return void 0;
  return [x, y, z];
}
function readGamepadMotion(gamepad) {
  const pose = gamepad.pose;
  const motion = gamepad.motion;
  const motionData = gamepad.motionData;
  const source = motion ?? motionData ?? pose ?? null;
  if (!source)
    return {};
  const gyro = readMotionVector(source.angularVelocity);
  const accel = readMotionVector(source.linearAcceleration);
  const result = {};
  if (gyro !== void 0)
    result.gyro = gyro;
  if (accel !== void 0)
    result.accel = accel;
  return result;
}
function motionChanged(previous, next) {
  if (!previous)
    return true;
  return Math.abs(previous[0] - next[0]) > MOTION_DIFF_THRESHOLD || Math.abs(previous[1] - next[1]) > MOTION_DIFF_THRESHOLD || Math.abs(previous[2] - next[2]) > MOTION_DIFF_THRESHOLD;
}
function getHapticActuator(gamepad) {
  var _a;
  const direct = gamepad.vibrationActuator;
  if (direct == null ? void 0 : direct.playEffect) {
    return direct;
  }
  const haptics = gamepad.hapticActuators;
  if ((haptics == null ? void 0 : haptics.length) && ((_a = haptics[0]) == null ? void 0 : _a.playEffect)) {
    return haptics[0];
  }
  return null;
}
function clampMagnitude(value) {
  if (!Number.isFinite(value))
    return 0;
  return Math.min(1, Math.max(0, value));
}
function setMotionRequest(id, motionType, enabled) {
  const state = motionRequestState.get(id) ?? { gyro: true, accel: true };
  if (motionType === 2) {
    state.gyro = enabled;
  } else if (motionType === 1) {
    state.accel = enabled;
  }
  motionRequestState.set(id, state);
}
function getGamepads() {
  var _a;
  if (typeof navigator === "undefined")
    return [];
  const fallback = navigator.webkitGetGamepads;
  const pads = ((_a = navigator.getGamepads) == null ? void 0 : _a.call(navigator)) ?? (fallback == null ? void 0 : fallback()) ?? [];
  return Array.isArray(pads) ? pads : Array.from(pads);
}
function isGamepadConnected(gamepad) {
  if (typeof gamepad.connected === "boolean")
    return gamepad.connected;
  return true;
}
function applyGamepadFeedback(message) {
  if (!message || typeof message !== "object")
    return;
  const payload = message;
  if (payload.type !== "gamepad_feedback")
    return;
  const id = Number(payload.id);
  if (!Number.isFinite(id))
    return;
  if (payload.event === "motion_event_state") {
    const motionType = Number(payload.motionType);
    const reportRate = Number(payload.reportRate);
    if (Number.isFinite(motionType)) {
      setMotionRequest(id, motionType, reportRate > 0);
    }
    return;
  }
  if (payload.event !== "rumble" && payload.event !== "rumble_triggers") {
    return;
  }
  const gamepad = activeGamepads.get(id) ?? getGamepads()[id];
  if (!gamepad)
    return;
  const actuator = getHapticActuator(gamepad);
  if (!actuator)
    return;
  let strong = clampMagnitude((payload.lowfreq ?? 0) / 65535);
  let weak = clampMagnitude((payload.highfreq ?? 0) / 65535);
  if (payload.event === "rumble_triggers") {
    strong = clampMagnitude((payload.left ?? 0) / 65535);
    weak = clampMagnitude((payload.right ?? 0) / 65535);
  }
  try {
    void actuator.playEffect("dual-rumble", {
      duration: 100,
      strongMagnitude: strong,
      weakMagnitude: weak
    });
  } catch {
  }
}
function attachInputCapture(element, send, options = {}) {
  const video = options.video ?? null;
  const onMetrics = options.onMetrics;
  const gamepadEnabled = options.gamepad ?? true;
  const shouldDrop = options.shouldDrop;
  let queuedMove = null;
  let queuedMoveAt = 0;
  let rafId = 0;
  let mouseMoveSeq = 0;
  const pressedKeys = /* @__PURE__ */ new Map();
  const keyAutoReleaseTimers = /* @__PURE__ */ new Map();
  const supportsPointer = typeof window !== "undefined" && "PointerEvent" in window;
  const supportsGamepad = gamepadEnabled && typeof navigator !== "undefined" && (typeof navigator.getGamepads === "function" || typeof navigator.webkitGetGamepads === "function");
  const metrics = {};
  let moveDelaySum = 0;
  let moveDelaySamples = 0;
  let moveEventLagSum = 0;
  let moveEventLagSamples = 0;
  let moveRateWindowStart = performance.now();
  let moveRateCount = 0;
  let moveSendRateCount = 0;
  let lastMetricsEmitAt = 0;
  const toU16Unit = (value) => Math.round(Math.min(1, Math.max(0, value)) * 65535);
  const encodeMouseMove = (payload) => {
    const out = new ArrayBuffer(7);
    const view = new DataView(out);
    view.setUint8(0, 1);
    view.setUint16(1, mouseMoveSeq, true);
    view.setUint16(3, toU16Unit(payload.x), true);
    view.setUint16(5, toU16Unit(payload.y), true);
    mouseMoveSeq = mouseMoveSeq + 1 & 65535;
    return out;
  };
  const sendPayload = (payload) => {
    if (shouldDrop == null ? void 0 : shouldDrop(payload)) {
      return false;
    }
    if (payload.type === "mouse_move") {
      return send(encodeMouseMove(payload)) !== false;
    }
    return send(JSON.stringify(payload)) !== false;
  };
  let keyboardLockRequested = false;
  const emitMetrics = () => {
    if (!onMetrics)
      return;
    const now = performance.now();
    if (now - lastMetricsEmitAt < 100)
      return;
    lastMetricsEmitAt = now;
    onMetrics({ ...metrics });
  };
  const flushMove = () => {
    rafId = 0;
    if (!queuedMove)
      return;
    const now = performance.now();
    const delayMs = Math.max(0, now - queuedMoveAt);
    moveDelaySum += delayMs;
    moveDelaySamples += 1;
    metrics.lastMoveDelayMs = delayMs;
    metrics.avgMoveDelayMs = moveDelaySum / moveDelaySamples;
    metrics.maxMoveDelayMs = Math.max(metrics.maxMoveDelayMs ?? 0, delayMs);
    moveSendRateCount += 1;
    const rateWindowMs = now - moveRateWindowStart;
    if (rateWindowMs >= 1e3) {
      metrics.moveRateHz = Math.round(moveRateCount / rateWindowMs * 1e3);
      metrics.moveSendRateHz = Math.round(moveSendRateCount / rateWindowMs * 1e3);
      if (moveRateCount)
        metrics.moveCoalesceRatio = moveSendRateCount / moveRateCount;
      moveRateWindowStart = now;
      moveRateCount = 0;
      moveSendRateCount = 0;
    }
    sendPayload(queuedMove);
    queuedMove = null;
    emitMetrics();
  };
  const releaseAllKeys = () => {
    if (!pressedKeys.size)
      return;
    const ts = performance.now();
    for (const entry of pressedKeys.values()) {
      const payload = {
        type: "key_up",
        key: entry.key,
        code: entry.code,
        repeat: false,
        modifiers: { alt: false, ctrl: false, shift: false, meta: false },
        ts
      };
      sendPayload(payload);
    }
    keyAutoReleaseTimers.forEach((timer) => {
      window.clearTimeout(timer);
    });
    keyAutoReleaseTimers.clear();
    pressedKeys.clear();
  };
  const clearKeyAutoRelease = (code) => {
    const timer = keyAutoReleaseTimers.get(code);
    if (!timer)
      return;
    window.clearTimeout(timer);
    keyAutoReleaseTimers.delete(code);
  };
  const scheduleKeyAutoRelease = (event) => {
    const code = event.code;
    if (isModifierCode(code))
      return;
    if (!pressedKeys.has(code))
      return;
    if (!shouldPreventDefaultKey(event))
      return;
    if (!event.metaKey && !event.ctrlKey && !event.altKey)
      return;
    clearKeyAutoRelease(code);
    const timer = window.setTimeout(() => {
      keyAutoReleaseTimers.delete(code);
      const entry = pressedKeys.get(code);
      if (!entry)
        return;
      const payload = {
        type: "key_up",
        key: entry.key,
        code: entry.code,
        repeat: false,
        modifiers: { alt: false, ctrl: false, shift: false, meta: false },
        ts: performance.now()
      };
      sendPayload(payload);
      pressedKeys.delete(code);
    }, 750);
    keyAutoReleaseTimers.set(code, timer);
  };
  const releaseStaleModifierKeys = (event) => {
    if (!pressedKeys.size)
      return;
    const ts = performance.now();
    const isPressed = (code) => pressedKeys.has(code);
    const releaseCode = (code) => {
      const entry = pressedKeys.get(code);
      if (!entry)
        return;
      const payload = {
        type: "key_up",
        key: entry.key,
        code: entry.code,
        repeat: false,
        modifiers: modifiersFromEvent(event),
        ts
      };
      sendPayload(payload);
      pressedKeys.delete(code);
    };
    if (!event.metaKey) {
      if (isPressed("MetaLeft"))
        releaseCode("MetaLeft");
      if (isPressed("MetaRight"))
        releaseCode("MetaRight");
    }
    if (!event.ctrlKey) {
      if (isPressed("ControlLeft"))
        releaseCode("ControlLeft");
      if (isPressed("ControlRight"))
        releaseCode("ControlRight");
    }
    if (!event.altKey) {
      if (isPressed("AltLeft"))
        releaseCode("AltLeft");
      if (isPressed("AltRight"))
        releaseCode("AltRight");
    }
    if (!event.shiftKey) {
      if (isPressed("ShiftLeft"))
        releaseCode("ShiftLeft");
      if (isPressed("ShiftRight"))
        releaseCode("ShiftRight");
    }
  };
  const releaseStaleChordedKeys = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey)
      return;
    if (!pressedKeys.size)
      return;
    const ts = performance.now();
    for (const [code, entry] of pressedKeys) {
      if (!entry.chorded)
        continue;
      if (isModifierCode(code))
        continue;
      clearKeyAutoRelease(code);
      const payload = {
        type: "key_up",
        key: entry.key,
        code: entry.code,
        repeat: false,
        modifiers: modifiersFromEvent(event),
        ts
      };
      sendPayload(payload);
      pressedKeys.delete(code);
    }
  };
  const requestKeyboardLockForCapture = () => {
    if (keyboardLockRequested)
      return;
    keyboardLockRequested = true;
    void requestKeyboardLock().then((locked) => {
      if (!locked) {
        keyboardLockRequested = false;
      }
    });
  };
  const releaseKeyboardLockForCapture = () => {
    if (!keyboardLockRequested)
      return;
    keyboardLockRequested = false;
    releaseKeyboardLock();
  };
  const queueMove = (event) => {
    const { x, y } = normalizePoint(event, element, video);
    const now = performance.now();
    const eventLagMs = Math.max(0, now - event.timeStamp);
    moveEventLagSum += eventLagMs;
    moveEventLagSamples += 1;
    metrics.lastMoveEventLagMs = eventLagMs;
    metrics.avgMoveEventLagMs = moveEventLagSum / moveEventLagSamples;
    metrics.maxMoveEventLagMs = Math.max(metrics.maxMoveEventLagMs ?? 0, eventLagMs);
    queuedMoveAt = performance.now();
    queuedMove = {
      type: "mouse_move",
      x,
      y,
      buttons: event.buttons,
      modifiers: modifiersFromEvent(event),
      ts: performance.now()
    };
    moveRateCount += 1;
    if (!rafId)
      rafId = requestAnimationFrame(flushMove);
  };
  const sendButton = (event, type) => {
    const { x, y } = normalizePoint(event, element, video);
    const payload = {
      type,
      button: event.button,
      x,
      y,
      modifiers: modifiersFromEvent(event),
      ts: performance.now()
    };
    sendPayload(payload);
  };
  const onWheel = (event) => {
    event.preventDefault();
    const { x, y } = normalizePoint(event, element, video);
    const dx = normalizeWheelDelta(event.deltaX, event.deltaMode);
    const dy = normalizeWheelDelta(event.deltaY, event.deltaMode);
    const payload = {
      type: "wheel",
      dx,
      dy,
      x,
      y,
      modifiers: modifiersFromEvent(event),
      ts: performance.now()
    };
    sendPayload(payload);
  };
  const onKeyDown = (event) => {
    const fullscreen = isFullscreenElement(element);
    if (!fullscreen) {
      if (typeof document !== "undefined" && document.activeElement !== element)
        return;
      if (isEditableTarget(event.target))
        return;
    }
    releaseStaleModifierKeys(event);
    releaseStaleChordedKeys(event);
    requestKeyboardLockForCapture();
    if (shouldPreventDefaultKey(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
    const existing = pressedKeys.get(event.code);
    if (existing) {
      if (isModifierCode(event.code))
        return;
      const now = performance.now();
      if (existing.lastRepeatSentAt != null && now - existing.lastRepeatSentAt < 20) {
        return;
      }
      existing.lastRepeatSentAt = now;
      const payload2 = {
        type: "key_down",
        key: existing.key,
        code: existing.code,
        repeat: true,
        modifiers: modifiersFromEvent(event),
        ts: now
      };
      sendPayload(payload2);
      return;
    }
    const chorded = shouldPreventDefaultKey(event) && (event.metaKey || event.ctrlKey || event.altKey);
    pressedKeys.set(event.code, { key: event.key, code: event.code, chorded });
    const payload = {
      type: "key_down",
      key: event.key,
      code: event.code,
      repeat: event.repeat,
      modifiers: modifiersFromEvent(event),
      ts: performance.now()
    };
    sendPayload(payload);
    scheduleKeyAutoRelease(event);
  };
  const onKeyUp = (event) => {
    const fullscreen = isFullscreenElement(element);
    if (!fullscreen) {
      if (typeof document !== "undefined" && document.activeElement !== element)
        return;
      if (isEditableTarget(event.target))
        return;
    }
    releaseStaleModifierKeys(event);
    releaseStaleChordedKeys(event);
    if (shouldPreventDefaultKey(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
    clearKeyAutoRelease(event.code);
    pressedKeys.delete(event.code);
    const payload = {
      type: "key_up",
      key: event.key,
      code: event.code,
      repeat: event.repeat,
      modifiers: modifiersFromEvent(event),
      ts: performance.now()
    };
    sendPayload(payload);
  };
  const onMouseMove = (event) => queueMove(event);
  const onMouseDown = (event) => {
    element.focus();
    requestKeyboardLockForCapture();
    sendButton(event, "mouse_down");
  };
  const onMouseUp = (event) => sendButton(event, "mouse_up");
  const onPointerMove = (event) => {
    if (event.pointerType === "touch")
      return;
    queueMove(event);
  };
  const onPointerDown = (event) => {
    if (event.pointerType === "touch")
      return;
    element.focus();
    requestKeyboardLockForCapture();
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
    }
    sendButton(event, "mouse_down");
  };
  const onPointerUp = (event) => {
    if (event.pointerType === "touch")
      return;
    sendButton(event, "mouse_up");
    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
    }
  };
  const onPointerCancel = (event) => {
    if (event.pointerType === "touch")
      return;
    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
    }
  };
  const onContextMenu = (event) => {
    event.preventDefault();
  };
  const onBlur = () => {
    releaseAllKeys();
    releaseKeyboardLockForCapture();
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      releaseAllKeys();
      releaseKeyboardLockForCapture();
    }
  };
  const gamepadStates = /* @__PURE__ */ new Map();
  const gamepadMeta = /* @__PURE__ */ new Map();
  let gamepadRaf = 0;
  const ensureGamepadMeta = (gamepad) => {
    const existing = gamepadMeta.get(gamepad.index);
    if (existing)
      return existing;
    const type = resolveGamepadType(gamepad);
    const buttonMap = resolveButtonMap(gamepad, type);
    let supportedButtons = 0;
    buttonMap.forEach((bit) => {
      supportedButtons |= bit;
    });
    const motion = readGamepadMotion(gamepad);
    const hasGyro = Boolean(motion.gyro);
    const hasAccel = Boolean(motion.accel);
    let capabilities = 0;
    if (gamepad.buttons.length > 6 || gamepad.buttons.length > 7) {
      capabilities |= GAMEPAD_CAPS.analogTriggers;
    }
    if (hasAccel || type === GAMEPAD_TYPE.playstation) {
      capabilities |= GAMEPAD_CAPS.accel;
    }
    if (hasGyro || type === GAMEPAD_TYPE.playstation) {
      capabilities |= GAMEPAD_CAPS.gyro;
    }
    const meta = {
      buttonMap,
      supportedButtons,
      capabilities,
      type,
      connected: false,
      needsResync: true
    };
    gamepadMeta.set(gamepad.index, meta);
    return meta;
  };
  const sendGamepadConnect = (gamepad, meta) => {
    const payload = {
      type: "gamepad_connect",
      id: gamepad.index,
      gamepadType: meta.type,
      capabilities: meta.capabilities,
      supportedButtons: meta.supportedButtons,
      ts: performance.now()
    };
    return sendPayload(payload);
  };
  const sendGamepadDisconnect = (index, activeMask) => {
    const payload = {
      type: "gamepad_disconnect",
      id: index,
      activeMask,
      ts: performance.now()
    };
    return sendPayload(payload);
  };
  const maybeSendMotion = (index, meta, motion, now) => {
    const motionState = motionRequestState.get(index);
    const gyroEnabled = motionState ? motionState.gyro : true;
    const accelEnabled = motionState ? motionState.accel : true;
    if (motion.gyro && gyroEnabled) {
      const lastAt = meta.lastGyroAt ?? 0;
      if (now - lastAt >= MOTION_SEND_INTERVAL_MS && motionChanged(meta.lastGyro, motion.gyro)) {
        meta.lastGyroAt = now;
        meta.lastGyro = motion.gyro;
        const payload = {
          type: "gamepad_motion",
          id: index,
          motionType: 2,
          x: motion.gyro[0] * 180 / Math.PI,
          y: motion.gyro[1] * 180 / Math.PI,
          z: motion.gyro[2] * 180 / Math.PI,
          ts: now
        };
        sendPayload(payload);
      }
    }
    if (motion.accel && accelEnabled) {
      const lastAt = meta.lastAccelAt ?? 0;
      if (now - lastAt >= MOTION_SEND_INTERVAL_MS && motionChanged(meta.lastAccel, motion.accel)) {
        meta.lastAccelAt = now;
        meta.lastAccel = motion.accel;
        const payload = {
          type: "gamepad_motion",
          id: index,
          motionType: 1,
          x: motion.accel[0],
          y: motion.accel[1],
          z: motion.accel[2],
          ts: now
        };
        sendPayload(payload);
      }
    }
  };
  const pollGamepads = () => {
    gamepadRaf = 0;
    const pads = getGamepads();
    let activeMask = 0;
    const seen = /* @__PURE__ */ new Set();
    for (const [padIndex, pad] of pads.entries()) {
      if (!pad)
        continue;
      if (!isGamepadConnected(pad))
        continue;
      const index = Number.isFinite(pad.index) ? pad.index : padIndex;
      if (index < 0 || index >= MAX_GAMEPADS)
        continue;
      activeMask |= 1 << index;
      seen.add(index);
      activeGamepads.set(index, pad);
      const meta = ensureGamepadMeta(pad);
      if (!meta.connected) {
        if (sendGamepadConnect(pad, meta)) {
          meta.connected = true;
          meta.needsResync = true;
        } else {
          meta.needsResync = true;
        }
      }
      const snapshot = readGamepadState(pad, meta.buttonMap);
      const previous = gamepadStates.get(index);
      const stateChanged = !previous || previous.buttons !== snapshot.buttons || previous.lt !== snapshot.lt || previous.rt !== snapshot.rt || previous.lsX !== snapshot.lsX || previous.lsY !== snapshot.lsY || previous.rsX !== snapshot.rsX || previous.rsY !== snapshot.rsY;
      const now = performance.now();
      const shouldHeartbeat = !meta.lastStateSentAt || now - meta.lastStateSentAt >= GAMEPAD_STATE_HEARTBEAT_MS;
      if (stateChanged || meta.needsResync || shouldHeartbeat) {
        const payload = {
          type: "gamepad_state",
          id: index,
          activeMask,
          buttons: snapshot.buttons,
          gamepadType: meta.type,
          capabilities: meta.capabilities,
          supportedButtons: meta.supportedButtons,
          lt: snapshot.lt,
          rt: snapshot.rt,
          lsX: snapshot.lsX,
          lsY: snapshot.lsY,
          rsX: snapshot.rsX,
          rsY: snapshot.rsY,
          ts: now
        };
        const sent = sendPayload(payload);
        if (sent) {
          gamepadStates.set(index, snapshot);
          meta.needsResync = false;
          meta.lastStateSentAt = now;
          meta.connected = true;
        } else {
          meta.needsResync = true;
        }
      }
      const motion = readGamepadMotion(pad);
      if (motion.gyro || motion.accel) {
        maybeSendMotion(index, meta, motion, now);
      }
    }
    if (gamepadMeta.size) {
      const missing = [];
      gamepadMeta.forEach((_value, index) => {
        if (!seen.has(index)) {
          missing.push(index);
        }
      });
      if (missing.length) {
        missing.forEach((index) => {
          gamepadMeta.delete(index);
          gamepadStates.delete(index);
          activeGamepads.delete(index);
          motionRequestState.delete(index);
          sendGamepadDisconnect(index, activeMask);
        });
      }
    }
    activeGamepads.forEach((_pad, index) => {
      if (!seen.has(index)) {
        activeGamepads.delete(index);
      }
    });
    if (supportsGamepad) {
      gamepadRaf = requestAnimationFrame(pollGamepads);
    }
  };
  const onGamepadConnected = () => {
    if (!supportsGamepad)
      return;
    if (!gamepadRaf) {
      gamepadRaf = requestAnimationFrame(pollGamepads);
    }
  };
  const onGamepadDisconnected = () => {
    if (!supportsGamepad)
      return;
    if (!gamepadRaf) {
      gamepadRaf = requestAnimationFrame(pollGamepads);
    }
  };
  if (supportsPointer) {
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerCancel);
  } else {
    element.addEventListener("mousemove", onMouseMove);
    element.addEventListener("mousedown", onMouseDown);
    element.addEventListener("mouseup", onMouseUp);
  }
  element.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  element.addEventListener("contextmenu", onContextMenu);
  element.addEventListener("blur", onBlur);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (supportsGamepad) {
    gamepadRaf = requestAnimationFrame(pollGamepads);
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
  }
  return () => {
    if (rafId)
      cancelAnimationFrame(rafId);
    if (gamepadRaf)
      cancelAnimationFrame(gamepadRaf);
    if (supportsPointer) {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerCancel);
    } else {
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("mouseup", onMouseUp);
    }
    element.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    element.removeEventListener("contextmenu", onContextMenu);
    element.removeEventListener("blur", onBlur);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    releaseKeyboardLockForCapture();
    keyAutoReleaseTimers.forEach((timer) => {
      window.clearTimeout(timer);
    });
    keyAutoReleaseTimers.clear();
    if (supportsGamepad) {
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
    }
    releaseAllKeys();
    if (gamepadMeta.size) {
      let activeMask = 0;
      gamepadMeta.forEach((_value, index) => {
        if (index < 0 || index >= MAX_GAMEPADS)
          return;
        activeMask |= 1 << index;
      });
      gamepadMeta.forEach((_value, index) => {
        if (index < 0 || index >= MAX_GAMEPADS)
          return;
        sendGamepadDisconnect(index, activeMask & ~(1 << index));
      });
      gamepadMeta.clear();
      gamepadStates.clear();
    }
    activeGamepads.clear();
    motionRequestState.clear();
  };
}
const _hoisted_1 = { class: "main-content" };
const _hoisted_2 = { class: "app-header" };
const _hoisted_3 = { class: "header-left" };
const _hoisted_4 = { class: "brand" };
const _hoisted_5 = { class: "brand-icon" };
const _hoisted_6 = { class: "header-center" };
const _hoisted_7 = { class: "header-right" };
const _hoisted_8 = { class: "library-section" };
const _hoisted_9 = { class: "library-header" };
const _hoisted_10 = { class: "library-title-row" };
const _hoisted_11 = {
  key: 0,
  class: "selection-badge"
};
const _hoisted_12 = { class: "search-box" };
const _hoisted_13 = ["placeholder"];
const _hoisted_14 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_15 = { class: "empty-state" };
const _hoisted_16 = {
  key: 0,
  class: "games-grid"
};
const _hoisted_17 = ["onClick", "onDblclick"];
const _hoisted_18 = { class: "game-cover" };
const _hoisted_19 = ["alt", "onLoad", "onError"];
const _hoisted_20 = {
  key: 0,
  class: "selected-badge"
};
const _hoisted_21 = { class: "play-overlay" };
const _hoisted_22 = { class: "game-meta" };
const _hoisted_23 = { class: "game-name" };
const _hoisted_24 = { class: "game-source" };
const _hoisted_25 = {
  key: 1,
  class: "other-apps-section"
};
const _hoisted_26 = { class: "section-label" };
const _hoisted_27 = { class: "apps-list" };
const _hoisted_28 = ["onClick", "onDblclick"];
const _hoisted_29 = { class: "app-icon" };
const _hoisted_30 = { class: "app-info" };
const _hoisted_31 = { class: "app-name" };
const _hoisted_32 = { class: "app-source" };
const _hoisted_33 = {
  key: 0,
  class: "app-selected-icon"
};
const _hoisted_34 = { class: "app-play-icon" };
const _hoisted_35 = {
  key: 0,
  class: "preview-header"
};
const _hoisted_36 = { class: "preview-title" };
const _hoisted_37 = {
  key: 0,
  class: "live-indicator"
};
const _hoisted_38 = { class: "preview-controls" };
const _hoisted_39 = {
  key: 0,
  class: "idle-state"
};
const _hoisted_40 = { class: "idle-content" };
const _hoisted_41 = { class: "idle-icon-wrap" };
const _hoisted_42 = {
  key: 0,
  class: "idle-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "aria-hidden": ""
};
const _hoisted_43 = {
  key: 1,
  class: "idle-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "aria-hidden": ""
};
const _hoisted_44 = {
  key: 1,
  class: "connecting-state"
};
const _hoisted_45 = {
  key: 2,
  class: "stats-overlay"
};
const _hoisted_46 = { class: "notification-text" };
const _hoisted_47 = { key: 0 };
const _hoisted_48 = {
  key: 1,
  class: "quick-actions"
};
const _hoisted_49 = ["disabled"];
const _hoisted_50 = ["disabled"];
const _hoisted_51 = { class: "quick-toggles" };
const _hoisted_52 = {
  class: "toggle",
  title: "Enable input forwarding"
};
const _hoisted_53 = {
  class: "toggle",
  title: "Show performance overlay"
};
const _hoisted_54 = {
  key: 2,
  class: "compact-metrics"
};
const _hoisted_55 = { class: "metric" };
const _hoisted_56 = { class: "value" };
const _hoisted_57 = { class: "metric" };
const _hoisted_58 = { class: "value" };
const _hoisted_59 = { class: "metric" };
const _hoisted_60 = { class: "value" };
const _hoisted_61 = { class: "metric" };
const _hoisted_62 = { class: "value" };
const _hoisted_63 = {
  key: 0,
  class: "settings-drawer"
};
const _hoisted_64 = { class: "drawer-header" };
const _hoisted_65 = { class: "drawer-content" };
const _hoisted_66 = { class: "setting-group" };
const _hoisted_67 = { class: "group-label" };
const _hoisted_68 = { class: "resolution-inputs" };
const _hoisted_69 = { class: "preset-chips" };
const _hoisted_70 = { class: "setting-group" };
const _hoisted_71 = { class: "group-label" };
const _hoisted_72 = { class: "preset-chips" };
const _hoisted_73 = { class: "setting-group" };
const _hoisted_74 = { class: "group-label" };
const _hoisted_75 = { class: "preset-chips" };
const _hoisted_76 = ["onClick"];
const _hoisted_77 = { class: "setting-group" };
const _hoisted_78 = { class: "group-label" };
const _hoisted_79 = { class: "preset-chips" };
const _hoisted_80 = { class: "setting-group toggle-setting" };
const _hoisted_81 = { class: "toggle-info" };
const _hoisted_82 = { class: "group-label" };
const _hoisted_83 = { class: "hint" };
const _hoisted_84 = { class: "setting-group toggle-setting" };
const _hoisted_85 = { class: "toggle-info" };
const _hoisted_86 = { class: "group-label" };
const _hoisted_87 = { class: "hint" };
const _hoisted_88 = { class: "setting-group" };
const _hoisted_89 = { class: "group-label" };
const _hoisted_90 = { class: "hint" };
const _hoisted_91 = { class: "preset-chips" };
const _hoisted_92 = ["onClick", "disabled"];
const _hoisted_93 = { class: "setting-group" };
const _hoisted_94 = { class: "group-label" };
const _hoisted_95 = { class: "setting-group" };
const _hoisted_96 = { class: "group-label" };
const _hoisted_97 = { class: "advanced-section" };
const _hoisted_98 = { class: "advanced-content" };
const _hoisted_99 = { class: "setting-group toggle-setting" };
const _hoisted_100 = { class: "drawer-footer" };
const _hoisted_101 = { class: "notice" };
const MIN_FRAME_AGE_MS = 5;
const MAX_FRAME_AGE_MS = 100;
const MAX_FRAME_AGE_FRAMES = 10;
const CLIENT_CONFIG_STORAGE_KEY = "sunshine.webrtc.session_config";
const INPUT_BUFFER_DROP_THRESHOLD_BYTES = 1024;
const DIAGNOSTICS_WINDOW_MS = 3e4;
const LATENCY_SAMPLE_WINDOW_MS = 3e4;
const LATENCY_SMOOTH_TAU_MS = 2e3;
const LATENCY_FAST_TAU_MS = 300;
const LATENCY_FAST_TRIGGER_MS = 12;
const LATENCY_FAST_TRIGGER_RATIO = 1.15;
const VIDEO_FPS_SMOOTH_TAU_MS = 1500;
const AUDIO_TARGET_BUFFER_MS = 20;
const AUDIO_TARGET_PLAYOUT_MS = 20;
const AUDIO_DRAIN_TARGET_MS = 10;
const AUDIO_DRAIN_PLAYOUT_MS = 0;
const AUDIO_DRAIN_TRIGGER_MS = 45;
const AUDIO_DRAIN_RELEASE_MS = 25;
const AUDIO_DRAIN_SUSTAIN_MS = 800;
const AUDIO_DRAIN_RELEASE_SUSTAIN_MS = 1200;
const AUDIO_BUFFER_RESET_THRESHOLD_MS = 120;
const AUDIO_BUFFER_RESET_SUSTAIN_MS = 3e3;
const AUDIO_BUFFER_RESET_COOLDOWN_MS = 15e3;
const VIDEO_BUFFER_RESET_THRESHOLD_MS = 120;
const VIDEO_RENDER_RESET_THRESHOLD_MS = 50;
const VIDEO_INTERVAL_RESET_THRESHOLD_MS = 50;
const VIDEO_BUFFER_RESET_SUSTAIN_MS = 3e3;
const VIDEO_BUFFER_RESET_COOLDOWN_MS = 15e3;
const WEBRTC_DIAG_LOG_INTERVAL_MS = 5e3;
const ESC_HOLD_MS = 2e3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "WebRtcClientView",
  setup(__props) {
    const { t } = useI18n();
    const dialog = useDialog();
    useMessage();
    const showSettings = ref(false);
    const streamMinimized = ref(false);
    const activeNotification = ref(null);
    let notificationId = 0;
    let notificationTimeout = null;
    const notificationIcon = computed(() => {
      if (!activeNotification.value)
        return "fa-info-circle";
      switch (activeNotification.value.type) {
        case "error":
          return "fa-circle-exclamation";
        case "warning":
          return "fa-triangle-exclamation";
        case "success":
          return "fa-circle-check";
        default:
          return "fa-circle-info";
      }
    });
    function showNotification(type, title, msg, duration = 5e3) {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
      }
      notificationId++;
      activeNotification.value = { id: notificationId, type, title, ...msg !== void 0 ? { message: msg } : {} };
      if (duration > 0) {
        notificationTimeout = window.setTimeout(() => dismissNotification(), duration);
      }
    }
    function dismissNotification() {
      activeNotification.value = null;
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
      }
    }
    function notifyError(title, msg) {
      showNotification("error", title, msg, 8e3);
    }
    function notifyWarning(title, msg) {
      showNotification("warning", title, msg, 6e3);
    }
    function setResolution(width, height) {
      config.width = width;
      config.height = height;
    }
    const connectionPillClass = computed(() => {
      if (isConnected.value)
        return "connected";
      if (isConnecting.value)
        return "connecting";
      return "idle";
    });
    const connectionStatusLabel = computed(() => {
      if (isConnected.value)
        return "Connected";
      if (isConnecting.value)
        return "Connecting...";
      return "Ready";
    });
    const baseEncodingOptions = [
      { label: "H.264", value: "h264" },
      { label: "HEVC", value: "hevc" },
      { label: "AV1", value: "av1" }
    ];
    const encodingMimes = {
      h264: ["video/h264"],
      hevc: ["video/h265", "video/hevc"],
      av1: ["video/av1"]
    };
    function detectEncodingSupport() {
      var _a, _b;
      const support = { h264: true, hevc: true, av1: true };
      const caps = (typeof RTCRtpReceiver !== "undefined" ? (_a = RTCRtpReceiver.getCapabilities) == null ? void 0 : _a.call(RTCRtpReceiver, "video") : null) ?? (typeof RTCRtpSender !== "undefined" ? (_b = RTCRtpSender.getCapabilities) == null ? void 0 : _b.call(RTCRtpSender, "video") : null);
      if (!(caps == null ? void 0 : caps.codecs))
        return support;
      const mimeTypes = caps.codecs.map((codec) => codec.mimeType.toLowerCase());
      Object.keys(encodingMimes).forEach((encoding) => {
        support[encoding] = encodingMimes[encoding].some((mime) => mimeTypes.includes(mime));
      });
      return support;
    }
    const encodingSupport = ref(detectEncodingSupport());
    const encodingOptions = computed(
      () => baseEncodingOptions.map((opt) => {
        const supported = opt.value === "av1" ? encodingSupport.value[opt.value] : true;
        const hint = supported ? "" : `${opt.label} may be unsupported by this browser.`;
        return { ...opt, supported, hint };
      })
    );
    const pacingOptions = [
      { label: "Latency", value: "latency" },
      { label: "Balanced", value: "balanced" },
      { label: "Smooth", value: "smoothness" }
    ];
    const pacingPresets = {
      latency: { slackMs: 0, maxAgeFrames: 1 },
      balanced: { slackMs: 2, maxAgeFrames: 1 },
      smoothness: { slackMs: 3, maxAgeFrames: 3 }
    };
    function maxAllowedFramesForFps(fps) {
      const safeFps = fps > 0 ? fps : 60;
      const maxByMs = Math.floor(MAX_FRAME_AGE_MS * safeFps / 1e3);
      return Math.max(1, Math.min(MAX_FRAME_AGE_FRAMES, maxByMs));
    }
    function clampMaxAgeFrames(value, fps, mode) {
      const resolvedMode = mode ?? "balanced";
      const preset = pacingPresets[resolvedMode].maxAgeFrames;
      const maxAllowed = maxAllowedFramesForFps(fps);
      if (value == null || !Number.isFinite(value))
        return Math.min(preset, maxAllowed);
      return Math.min(maxAllowed, Math.max(1, Math.round(value)));
    }
    function maxFrameAgeMsFromFrames(fps, frames) {
      const safeFps = fps > 0 ? fps : 60;
      return Math.round(1e3 / safeFps * frames);
    }
    function applyPacingPreset(mode) {
      const preset = pacingPresets[mode];
      config.videoPacingMode = mode;
      config.videoPacingSlackMs = preset.slackMs;
      delete config.videoMaxFrameAgeMs;
      config.videoMaxFrameAgeFrames = clampMaxAgeFrames(preset.maxAgeFrames, config.fps, mode);
    }
    const hdrCodecAdvertised = computed(() => {
      if (config.encoding === "av1")
        return encodingSupport.value.av1;
      return encodingSupport.value.hevc;
    });
    const hdrInlineWarning = computed(() => {
      if (!config.hdr)
        return null;
      if (hdrRuntimeWarning.value)
        return hdrRuntimeWarning.value;
      if (!hdrCodecAdvertised.value) {
        return `This browser reports no ${config.encoding.toUpperCase()} decode support. If you get a black screen, switch codecs or disable HDR.`;
      }
      return null;
    });
    function ensureHdrEncoding() {
      if (config.encoding === "h264")
        config.encoding = "hevc";
    }
    const config = reactive({
      width: 1920,
      height: 1080,
      fps: 60,
      encoding: "h264",
      hdr: false,
      bitrateKbps: 2e4,
      muteHostAudio: true,
      videoPacingMode: "balanced",
      videoPacingSlackMs: pacingPresets.balanced.slackMs,
      videoMaxFrameAgeFrames: pacingPresets.balanced.maxAgeFrames
    });
    const negotiatedEncoding = ref(null);
    const hdrRuntimeWarning = ref(null);
    function normalizeProfileConfig(profileConfig) {
      const normalized = { ...profileConfig };
      const fps = typeof normalized.fps === "number" && Number.isFinite(normalized.fps) ? normalized.fps : 60;
      if (typeof normalized.hdr !== "boolean")
        normalized.hdr = false;
      if (normalized.encoding !== "h264" && normalized.encoding !== "hevc" && normalized.encoding !== "av1") {
        normalized.encoding = "h264";
      }
      if (normalized.hdr && normalized.encoding === "h264")
        normalized.encoding = "hevc";
      if (typeof normalized.videoMaxFrameAgeMs === "number") {
        if (normalized.videoMaxFrameAgeFrames == null) {
          normalized.videoMaxFrameAgeFrames = Math.max(
            1,
            Math.round(normalized.videoMaxFrameAgeMs / 1e3 * fps)
          );
        }
        delete normalized.videoMaxFrameAgeMs;
      }
      const modeRaw = normalized.videoPacingMode;
      const mode = modeRaw === "latency" || modeRaw === "balanced" || modeRaw === "smoothness" ? modeRaw : "balanced";
      normalized.videoPacingMode = mode;
      const slackRaw = normalized.videoPacingSlackMs;
      const slack = typeof slackRaw === "number" && Number.isFinite(slackRaw) ? Math.round(slackRaw) : pacingPresets[mode].slackMs;
      normalized.videoPacingSlackMs = Math.max(0, Math.min(10, slack));
      normalized.videoMaxFrameAgeFrames = clampMaxAgeFrames(
        normalized.videoMaxFrameAgeFrames ?? null,
        fps,
        mode
      );
      return normalized;
    }
    function loadCachedConfig() {
      try {
        const raw = window.localStorage.getItem(CLIENT_CONFIG_STORAGE_KEY);
        if (!raw)
          return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object")
          return;
        Object.assign(config, normalizeProfileConfig(parsed));
      } catch {
      }
    }
    function persistCachedConfig() {
      try {
        const snapshot = normalizeProfileConfig({ ...config });
        window.localStorage.setItem(CLIENT_CONFIG_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
      }
    }
    const maxFrameAgeFrames = computed({
      get() {
        return clampMaxAgeFrames(
          config.videoMaxFrameAgeFrames ?? null,
          config.fps,
          config.videoPacingMode ?? "balanced"
        );
      },
      set(value) {
        delete config.videoMaxFrameAgeMs;
        config.videoMaxFrameAgeFrames = clampMaxAgeFrames(
          value,
          config.fps,
          config.videoPacingMode ?? "balanced"
        );
      }
    });
    watch(
      () => config.hdr,
      (enabled) => {
        if (enabled)
          ensureHdrEncoding();
      }
    );
    watch(
      () => config.encoding,
      () => {
        if (config.hdr)
          ensureHdrEncoding();
      }
    );
    watch(
      () => config.hdr,
      (enabled) => {
        if (!enabled)
          hdrRuntimeWarning.value = null;
      }
    );
    watch(
      () => config.encoding,
      () => {
        hdrRuntimeWarning.value = null;
      }
    );
    watch(
      () => ({ ...config }),
      () => {
        persistCachedConfig();
      },
      { deep: true }
    );
    const appsStore = useAppsStore();
    const { apps } = storeToRefs(appsStore);
    const appsList = computed(() => (apps.value || []).slice());
    const searchQuery = ref("");
    const appCoverStatus = ref(/* @__PURE__ */ new Map());
    function onCoverLoad(app) {
      if (app.uuid)
        appCoverStatus.value.set(app.uuid, true);
    }
    function onCoverError(app) {
      if (app.uuid)
        appCoverStatus.value.set(app.uuid, false);
    }
    function appHasCover(app) {
      if (app.uuid && appCoverStatus.value.has(app.uuid)) {
        return appCoverStatus.value.get(app.uuid) === true;
      }
      return !!(app["image-path"] || app["playnite-id"]);
    }
    const filteredApps = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query)
        return appsList.value;
      return appsList.value.filter((app) => {
        const name = (app.name || "").toLowerCase();
        return name.includes(query);
      });
    });
    const appsWithCovers = computed(() => filteredApps.value.filter((app) => appHasCover(app)));
    const appsWithoutCovers = computed(() => filteredApps.value.filter((app) => !appHasCover(app)));
    const selectedAppId = ref(null);
    const resumeOnConnect = ref(true);
    const terminatePending = ref(false);
    const sessionStatus = ref(
      null
    );
    let sessionStatusTimer = null;
    function appKey(app) {
      return `${app.uuid || ""}-${app.name || "app"}`;
    }
    function coverUrl(app) {
      if (!app.uuid)
        return "";
      return `/api/apps/${encodeURIComponent(app.uuid)}/cover`;
    }
    function appSubtitle(app) {
      if (app["playnite-id"])
        return "Playnite";
      if (app["working-dir"])
        return String(app["working-dir"]);
      return "Custom";
    }
    function appNumericId(app) {
      const raw = app.id ?? app.index;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    function selectApp(app) {
      const id = appNumericId(app);
      if (id == null)
        return;
      selectedAppId.value = id;
      resumeOnConnect.value = false;
    }
    async function onAppDoubleClick(app) {
      if (isConnected.value || isConnecting.value)
        return;
      selectApp(app);
      await connect();
    }
    function clearSelection() {
      selectedAppId.value = null;
      resumeOnConnect.value = true;
    }
    const selectedAppLabel = computed(() => {
      if (!selectedAppId.value)
        return "No app selected";
      const selected = appsList.value.find((app) => appNumericId(app) === selectedAppId.value);
      return (selected == null ? void 0 : selected.name) ? selected.name : `App ${selectedAppId.value}`;
    });
    const selectedAppName = computed(() => {
      if (!selectedAppId.value)
        return null;
      const selected = appsList.value.find((app) => appNumericId(app) === selectedAppId.value);
      return (selected == null ? void 0 : selected.name) ?? null;
    });
    const hasRunningSession = computed(() => {
      if (!sessionStatus.value)
        return false;
      return sessionStatus.value.appRunning || sessionStatus.value.activeSessions > 0;
    });
    const resumeAvailable = computed(() => {
      if (selectedAppId.value)
        return false;
      if (!sessionStatus.value)
        return false;
      return sessionStatus.value.activeSessions > 0 || sessionStatus.value.paused;
    });
    const api = new WebRtcHttpApi();
    const client = new WebRtcClient(api);
    const isConnecting = ref(false);
    const isConnected = ref(false);
    function setWebRtcActive(active) {
      try {
        window.__sunshine_webrtc_active = active;
      } catch {
      }
    }
    watch(
      () => [isConnecting.value, isConnected.value],
      ([connecting, connected]) => {
        setWebRtcActive(connecting || connected);
      },
      { immediate: true }
    );
    const connectLabelKey = computed(() => {
      if (isConnecting.value)
        return "webrtc.connecting";
      if (isConnected.value)
        return "webrtc.disconnect";
      if (resumeAvailable.value)
        return "webrtc.resume";
      if (selectedAppId.value)
        return "webrtc.connect";
      return "webrtc.stream_desktop";
    });
    const showStartingOverlay = computed(() => {
      if (isConnected.value)
        return false;
      return isConnecting.value || connectionState.value === "connecting";
    });
    const connectionState = ref(null);
    const iceState = ref(null);
    const inputChannelState = ref(null);
    const stats = ref({});
    const inputEnabled = ref(true);
    const showOverlay = ref(false);
    const inputTarget = ref(null);
    const videoEl = ref(null);
    const audioEl = ref(null);
    const isFullscreen = ref(false);
    const pseudoFullscreen = ref(false);
    const nativeVideoFullscreen = ref(false);
    const autoFullscreen = ref(true);
    const sessionId = ref(null);
    const serverSession = ref(null);
    const serverVideoFps = ref(void 0);
    let lastServerSample = null;
    const remoteStreamInfo = ref(null);
    const videoEvents = ref([]);
    const videoStateTick = ref(0);
    const videoDebug = computed(() => {
      void videoStateTick.value;
      const el = videoEl.value;
      if (!el)
        return null;
      return {
        readyState: el.readyState,
        width: el.videoWidth,
        height: el.videoHeight,
        currentTime: el.currentTime,
        paused: el.paused
      };
    });
    const videoSizeLabel = computed(() => {
      var _a, _b;
      const width = ((_a = videoDebug.value) == null ? void 0 : _a.width) ?? 0;
      const height = ((_b = videoDebug.value) == null ? void 0 : _b.height) ?? 0;
      return width > 0 && height > 0 ? `${width}x${height}` : "--";
    });
    const inputMetrics = ref({});
    const inputBufferedAmount = ref(null);
    const shouldDropInput = (payload) => {
      const buffered = client.inputChannelBufferedAmount ?? 0;
      inputBufferedAmount.value = buffered;
      if (buffered <= INPUT_BUFFER_DROP_THRESHOLD_BYTES)
        return false;
      if (payload.type === "mouse_move")
        return true;
      if (payload.type === "gamepad_state" || payload.type === "gamepad_motion")
        return true;
      return false;
    };
    const videoFrameMetrics = ref({});
    const videoPacingMetrics = ref({});
    const inboundVideoStats = ref({});
    const diagnosticsSamples = ref([]);
    let diagnosticsSampleTimer = null;
    const renderFps = computed(() => {
      const intervalMs = videoFrameMetrics.value.lastIntervalMs ?? videoFrameMetrics.value.avgIntervalMs;
      if (typeof intervalMs !== "number" || !Number.isFinite(intervalMs) || intervalMs <= 0)
        return void 0;
      return 1e3 / intervalMs;
    });
    const renderFps98 = computed(() => {
      const intervalMs = videoFrameMetrics.value.avg98IntervalMs ?? videoFrameMetrics.value.p98IntervalMs;
      if (typeof intervalMs !== "number" || !Number.isFinite(intervalMs) || intervalMs <= 0)
        return void 0;
      return 1e3 / intervalMs;
    });
    const renderFps99 = computed(() => {
      const intervalMs = videoFrameMetrics.value.avg99IntervalMs ?? videoFrameMetrics.value.p99IntervalMs;
      if (typeof intervalMs !== "number" || !Number.isFinite(intervalMs) || intervalMs <= 0)
        return void 0;
      return 1e3 / intervalMs;
    });
    const renderDelayMs = computed(
      () => videoFrameMetrics.value.lastDelayMs ?? videoFrameMetrics.value.avgDelayMs
    );
    const renderIntervalMs = computed(
      () => videoFrameMetrics.value.lastIntervalMs ?? videoFrameMetrics.value.avgIntervalMs
    );
    const latencySamples = ref([]);
    const smoothedLatencyMs = ref(void 0);
    let lastLatencySampleAt = null;
    computed(() => stats.value.videoJitterBufferMs);
    const oneWayRttMs = computed(
      () => stats.value.roundTripTimeMs ? stats.value.roundTripTimeMs / 2 : void 0
    );
    const videoPlayoutDelayMs = computed(
      () => stats.value.videoPlayoutDelayMs ?? stats.value.videoJitterBufferMs
    );
    const smoothedVideoFps = ref(void 0);
    let lastVideoFpsSampleAt = null;
    const displayVideoFps = computed(
      () => renderFps99.value ?? renderFps98.value ?? renderFps.value ?? smoothedVideoFps.value ?? stats.value.videoFps
    );
    const estimatedLatencyMs = computed(() => {
      const parts = [oneWayRttMs.value, videoPlayoutDelayMs.value, stats.value.videoDecodeMs].filter(
        (value) => typeof value === "number"
      );
      if (!parts.length)
        return void 0;
      return parts.reduce((total, value) => total + value, 0);
    });
    watch(
      () => estimatedLatencyMs.value,
      (value) => {
        var _a;
        if (typeof value !== "number" || Number.isNaN(value))
          return;
        const now = Date.now();
        const lastAt = lastLatencySampleAt ?? now;
        const deltaMs = Math.max(0, now - lastAt);
        const current = smoothedLatencyMs.value;
        const jumpMs = typeof current === "number" && Number.isFinite(current) ? value - current : void 0;
        const jumpRatio = typeof current === "number" && Number.isFinite(current) && current > 0 ? value / current : void 0;
        const useFastTau = jumpMs != null && (jumpMs >= LATENCY_FAST_TRIGGER_MS || jumpRatio != null && jumpRatio >= LATENCY_FAST_TRIGGER_RATIO);
        const tauMs = useFastTau ? LATENCY_FAST_TAU_MS : LATENCY_SMOOTH_TAU_MS;
        const alpha = 1 - Math.exp(-deltaMs / tauMs);
        if (smoothedLatencyMs.value == null || !Number.isFinite(smoothedLatencyMs.value)) {
          smoothedLatencyMs.value = value;
        } else {
          smoothedLatencyMs.value = smoothedLatencyMs.value + alpha * (value - smoothedLatencyMs.value);
        }
        lastLatencySampleAt = now;
        latencySamples.value.push({ ts: now, value });
        const cutoff = now - LATENCY_SAMPLE_WINDOW_MS;
        while (latencySamples.value.length && (((_a = latencySamples.value[0]) == null ? void 0 : _a.ts) ?? Infinity) < cutoff) {
          latencySamples.value.shift();
        }
      }
    );
    watch(
      () => stats.value.videoFps,
      (value) => {
        if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
          return;
        const now = Date.now();
        const lastAt = lastVideoFpsSampleAt ?? now;
        const deltaMs = Math.max(0, now - lastAt);
        const alpha = 1 - Math.exp(-deltaMs / VIDEO_FPS_SMOOTH_TAU_MS);
        if (smoothedVideoFps.value == null || !Number.isFinite(smoothedVideoFps.value)) {
          smoothedVideoFps.value = value;
        } else {
          smoothedVideoFps.value = smoothedVideoFps.value + alpha * (value - smoothedVideoFps.value);
        }
        lastVideoFpsSampleAt = now;
      }
    );
    const overlayLines = computed(() => {
      const fps = displayVideoFps.value ? displayVideoFps.value.toFixed(0) : "--";
      const bitrate = formatKbps(stats.value.videoBitrateKbps);
      const latency = formatMs(smoothedLatencyMs.value);
      const dropped = stats.value.videoFramesDropped ?? "--";
      const codec = stats.value.videoCodec ?? "--";
      return [
        `FPS: ${fps} | Bitrate: ${bitrate}`,
        `Latency: ${latency} | Dropped: ${dropped}`,
        `Codec: ${codec} | Size: ${videoSizeLabel.value}`
      ];
    });
    let videoStream = null;
    let audioStream = null;
    let audioAutoplayRequested = false;
    let audioPlaybackUnlocked = false;
    let lastAudioPlayAttemptAtMs = 0;
    let lastAudioPlayErrorAtMs = 0;
    let audioPlayRetryTimer = null;
    let audioPlayRetryUntilMs = null;
    let detachInput = null;
    let detachVideoEvents = null;
    let detachVideoFrames = null;
    let detachVideoPacing = null;
    let detachVideoFullscreenEvents = null;
    let stopInboundVideoStatsTimer = null;
    function isSafariBrowser() {
      try {
        const ua = navigator.userAgent ?? "";
        const vendor = navigator.vendor ?? "";
        if (!/\bsafari\//i.test(ua))
          return false;
        if (!/apple/i.test(vendor))
          return false;
        if (/\b(chrome|chromium|crios|fxios|edgios|edg|opr|opera)\b/i.test(ua))
          return false;
        return true;
      } catch {
        return false;
      }
    }
    const DEFAULT_VIDEO_LATENCY_PROFILE = {
      drainSustainMs: 350,
      drainReleaseSustainMs: 800,
      startupDrainMs: 2e4,
      startupReleaseSustainMs: 1e3,
      modeSwitchDrainMs: 8e3,
      riseGuardMs: 6e3,
      riseLimitMultiplier: 1.5,
      riseLimitMinMs: 8,
      drainFrameReduction: 0.5,
      playbackRateMax: 1.12,
      playbackRateBoostMax: 1.2,
      playbackRateDecayPerSec: 0.12,
      targetFallRateMsPerSec: Number.POSITIVE_INFINITY,
      targetRiseRateMsPerSec: Number.POSITIVE_INFINITY,
      startupTargetMs: 0
    };
    const SAFARI_VIDEO_LATENCY_PROFILE = {
      drainSustainMs: 180,
      drainReleaseSustainMs: 550,
      startupDrainMs: 25e3,
      startupReleaseSustainMs: 1400,
      modeSwitchDrainMs: 9e3,
      riseGuardMs: 1e4,
      riseLimitMultiplier: 1.1,
      riseLimitMinMs: 6,
      drainFrameReduction: 1,
      playbackRateMax: 1.16,
      playbackRateBoostMax: 1.24,
      playbackRateDecayPerSec: 0.15,
      targetFallRateMsPerSec: 240,
      targetRiseRateMsPerSec: 80,
      startupTargetMs: 0,
      runawayDrainTriggerMs: 80,
      runawayDrainSustainMs: 250,
      runawayDrainWindowMs: 12e3,
      runawayResetThresholdMs: 160,
      runawayResetSustainMs: 1500
    };
    const safariLatencyTuningEnabled = isSafariBrowser();
    const videoLatencyProfile = safariLatencyTuningEnabled ? SAFARI_VIDEO_LATENCY_PROFILE : DEFAULT_VIDEO_LATENCY_PROFILE;
    let audioDrainOverloadedSince = null;
    let audioDrainReleaseSince = null;
    let audioDrainActive = false;
    let audioBufferOverloadedSince = null;
    let lastAudioBufferResetAt = null;
    let videoDrainOverloadedSince = null;
    let videoDrainReleaseSince = null;
    let videoDrainMode = "off";
    let videoBufferOverloadedSince = null;
    let lastVideoBufferResetAt = null;
    let lastVideoTargetMs = void 0;
    let desiredVideoTargetMs = void 0;
    let effectiveVideoTargetMs = void 0;
    let lastVideoTargetAdjustAt = null;
    let videoStartupDrainUntil = null;
    let videoStartupDrainReleaseSince = null;
    let lastVideoPlayoutSample = null;
    let lastPlaybackRateUpdateAt = null;
    let modeSwitchDrainUntil = null;
    let safariRunawayDrainSince = null;
    let safariRunawayDrainLatched = false;
    let safariRunawayResetSince = null;
    function setAudioDrainActive(active) {
      if (audioDrainActive === active)
        return;
      audioDrainActive = active;
      client.setAudioLatencyTargets(
        active ? AUDIO_DRAIN_TARGET_MS : AUDIO_TARGET_BUFFER_MS,
        active ? AUDIO_DRAIN_PLAYOUT_MS : AUDIO_TARGET_PLAYOUT_MS
      );
      pushVideoEvent(active ? "audio-drain-on" : "audio-drain-off");
    }
    function resetAudioDrainState() {
      audioDrainOverloadedSince = null;
      audioDrainReleaseSince = null;
      if (audioDrainActive) {
        setAudioDrainActive(false);
      }
    }
    function resolveVideoBaseTargetMs() {
      const fps = typeof config.fps === "number" && Number.isFinite(config.fps) ? config.fps : 60;
      const frames = clampMaxAgeFrames(
        config.videoMaxFrameAgeFrames ?? null,
        fps,
        config.videoPacingMode ?? "balanced"
      );
      const fromFrames = maxFrameAgeMsFromFrames(fps, frames);
      const explicit = typeof config.videoMaxFrameAgeMs === "number" && Number.isFinite(config.videoMaxFrameAgeMs) ? Math.round(config.videoMaxFrameAgeMs) : fromFrames;
      return Math.min(MAX_FRAME_AGE_MS, Math.max(MIN_FRAME_AGE_MS, explicit));
    }
    function resolveVideoDrainTargetMs(baseTargetMs) {
      const fps = typeof config.fps === "number" && Number.isFinite(config.fps) ? config.fps : 60;
      const frameMs = maxFrameAgeMsFromFrames(fps, 1);
      return Math.max(
        MIN_FRAME_AGE_MS,
        Math.min(MAX_FRAME_AGE_MS, baseTargetMs - frameMs * videoLatencyProfile.drainFrameReduction)
      );
    }
    function resolveVideoStartupTargetMs() {
      return videoLatencyProfile.startupTargetMs;
    }
    function applyVideoTargetMs(targetMs) {
      const now = Date.now();
      const normalizedTarget = typeof targetMs === "number" && Number.isFinite(targetMs) ? Math.min(MAX_FRAME_AGE_MS, Math.max(MIN_FRAME_AGE_MS, targetMs)) : void 0;
      desiredVideoTargetMs = normalizedTarget;
      if (desiredVideoTargetMs == null) {
        effectiveVideoTargetMs = void 0;
        lastVideoTargetAdjustAt = now;
        if (lastVideoTargetMs === void 0)
          return;
        lastVideoTargetMs = void 0;
        client.setVideoLatencyTarget(void 0);
        return;
      }
      if (effectiveVideoTargetMs == null || !Number.isFinite(effectiveVideoTargetMs)) {
        effectiveVideoTargetMs = desiredVideoTargetMs;
      } else if (effectiveVideoTargetMs !== desiredVideoTargetMs) {
        const lastAt = lastVideoTargetAdjustAt ?? now;
        const elapsedMs = Math.max(1, now - lastAt);
        const movingDown = desiredVideoTargetMs < effectiveVideoTargetMs;
        const slewRate = movingDown ? videoLatencyProfile.targetFallRateMsPerSec : videoLatencyProfile.targetRiseRateMsPerSec;
        const maxStep = Number.isFinite(slewRate) ? slewRate * elapsedMs / 1e3 : Math.abs(desiredVideoTargetMs - effectiveVideoTargetMs);
        if (maxStep > 0) {
          const delta = desiredVideoTargetMs - effectiveVideoTargetMs;
          if (Math.abs(delta) <= maxStep) {
            effectiveVideoTargetMs = desiredVideoTargetMs;
          } else {
            effectiveVideoTargetMs += Math.sign(delta) * maxStep;
          }
        }
      }
      lastVideoTargetAdjustAt = now;
      const nextTargetMs = Math.round(effectiveVideoTargetMs);
      if (lastVideoTargetMs === nextTargetMs)
        return;
      lastVideoTargetMs = nextTargetMs;
      client.setVideoLatencyTarget(nextTargetMs);
    }
    function setVideoDrainMode(mode, baseTargetMs, overrideTargetMs) {
      const target = mode === "off" ? baseTargetMs : overrideTargetMs ?? resolveVideoDrainTargetMs(baseTargetMs);
      if (videoDrainMode === mode) {
        applyVideoTargetMs(target);
        return;
      }
      videoDrainMode = mode;
      applyVideoTargetMs(target);
      if (mode === "startup") {
        pushVideoEvent("video-drain-startup-on");
      } else if (mode === "adaptive") {
        pushVideoEvent("video-drain-on");
      } else {
        pushVideoEvent("video-drain-off");
      }
    }
    function resetVideoDrainState() {
      videoDrainOverloadedSince = null;
      videoDrainReleaseSince = null;
      videoStartupDrainUntil = null;
      videoStartupDrainReleaseSince = null;
      lastVideoPlayoutSample = null;
      safariRunawayDrainSince = null;
      safariRunawayDrainLatched = false;
      safariRunawayResetSince = null;
      const baseTargetMs = resolveVideoBaseTargetMs();
      setVideoDrainMode("off", baseTargetMs);
    }
    function triggerVideoDrainWindow(durationMs, reason) {
      if (!isConnected.value)
        return;
      const now = Date.now();
      const until = now + Math.max(0, durationMs);
      videoStartupDrainUntil = videoStartupDrainUntil != null ? Math.max(videoStartupDrainUntil, until) : until;
      videoStartupDrainReleaseSince = null;
      const baseTargetMs = resolveVideoBaseTargetMs();
      setVideoDrainMode("startup", baseTargetMs, resolveVideoStartupTargetMs());
      pushVideoEvent(`video-drain-${reason}`);
    }
    function setVideoPlaybackRate(rate) {
      const el = videoEl.value;
      if (!el)
        return;
      const clamped = Math.max(1, Math.min(videoLatencyProfile.playbackRateBoostMax, rate));
      if (Math.abs((el.playbackRate ?? 1) - clamped) < 1e-3)
        return;
      try {
        el.playbackRate = clamped;
      } catch {
      }
    }
    watch(
      () => stats.value.audioJitterBufferMs,
      (audioValue) => {
        if (!isConnected.value || !isTabActive()) {
          resetAudioDrainState();
          audioBufferOverloadedSince = null;
          return;
        }
        if (typeof audioValue !== "number" || !Number.isFinite(audioValue))
          return;
        const now = Date.now();
        if (audioValue >= AUDIO_DRAIN_TRIGGER_MS) {
          if (audioDrainOverloadedSince == null) {
            audioDrainOverloadedSince = now;
          }
          audioDrainReleaseSince = null;
          if (!audioDrainActive && now - audioDrainOverloadedSince >= AUDIO_DRAIN_SUSTAIN_MS) {
            setAudioDrainActive(true);
          }
        } else if (audioDrainActive && audioValue <= AUDIO_DRAIN_RELEASE_MS) {
          if (audioDrainReleaseSince == null) {
            audioDrainReleaseSince = now;
          }
          if (now - audioDrainReleaseSince >= AUDIO_DRAIN_RELEASE_SUSTAIN_MS) {
            setAudioDrainActive(false);
          }
        } else {
          audioDrainOverloadedSince = null;
          audioDrainReleaseSince = null;
        }
        const audioOverloaded = audioValue >= AUDIO_BUFFER_RESET_THRESHOLD_MS;
        if (!audioOverloaded) {
          audioBufferOverloadedSince = null;
          return;
        }
        if (audioBufferOverloadedSince == null) {
          audioBufferOverloadedSince = now;
          return;
        }
        if (now - audioBufferOverloadedSince < AUDIO_BUFFER_RESET_SUSTAIN_MS)
          return;
        if (lastAudioBufferResetAt != null && now - lastAudioBufferResetAt < AUDIO_BUFFER_RESET_COOLDOWN_MS) {
          return;
        }
        lastAudioBufferResetAt = now;
        audioBufferOverloadedSince = null;
        pushVideoEvent("audio-buffer-reset");
        resetAudioElement();
      }
    );
    watch(
      () => videoPlayoutDelayMs.value,
      (videoValue) => {
        if (!isConnected.value || !isTabActive()) {
          resetVideoDrainState();
          return;
        }
        if (typeof videoValue !== "number" || !Number.isFinite(videoValue))
          return;
        const now = Date.now();
        const baseTargetMs = resolveVideoBaseTargetMs();
        const fps = typeof config.fps === "number" && Number.isFinite(config.fps) ? config.fps : 60;
        const frameMs = maxFrameAgeMsFromFrames(fps, 1);
        if (safariLatencyTuningEnabled) {
          if (typeof videoLatencyProfile.runawayDrainTriggerMs === "number" && videoValue >= videoLatencyProfile.runawayDrainTriggerMs) {
            if (safariRunawayDrainSince == null) {
              safariRunawayDrainSince = now;
            }
            if (!safariRunawayDrainLatched && typeof videoLatencyProfile.runawayDrainSustainMs === "number" && now - safariRunawayDrainSince >= videoLatencyProfile.runawayDrainSustainMs) {
              safariRunawayDrainLatched = true;
              triggerVideoDrainWindow(
                videoLatencyProfile.runawayDrainWindowMs ?? videoLatencyProfile.startupDrainMs,
                "runaway"
              );
            }
          } else if (videoValue <= baseTargetMs + frameMs) {
            safariRunawayDrainSince = null;
            safariRunawayDrainLatched = false;
          }
          if (typeof videoLatencyProfile.runawayResetThresholdMs === "number" && videoValue >= videoLatencyProfile.runawayResetThresholdMs) {
            if (safariRunawayResetSince == null) {
              safariRunawayResetSince = now;
            }
            if (typeof videoLatencyProfile.runawayResetSustainMs === "number" && now - safariRunawayResetSince >= videoLatencyProfile.runawayResetSustainMs) {
              if (lastVideoBufferResetAt == null || now - lastVideoBufferResetAt >= VIDEO_BUFFER_RESET_COOLDOWN_MS) {
                lastVideoBufferResetAt = now;
                safariRunawayResetSince = null;
                pushVideoEvent("video-runaway-reset");
                resetVideoElement();
                triggerVideoDrainWindow(
                  videoLatencyProfile.runawayDrainWindowMs ?? videoLatencyProfile.startupDrainMs,
                  "runaway-reset"
                );
              }
            }
          } else {
            safariRunawayResetSince = null;
          }
        }
        if (lastVideoPlayoutSample) {
          const deltaMs = now - lastVideoPlayoutSample.ts;
          const deltaValue = videoValue - lastVideoPlayoutSample.value;
          if (deltaMs > 0 && deltaValue > 0) {
            const riseRate = deltaValue * 1e3 / deltaMs;
            const riseLimit = Math.max(
              videoLatencyProfile.riseLimitMinMs,
              frameMs * videoLatencyProfile.riseLimitMultiplier
            );
            if (riseRate > riseLimit && videoValue > baseTargetMs + frameMs) {
              const until = now + videoLatencyProfile.riseGuardMs;
              videoStartupDrainUntil = videoStartupDrainUntil != null ? Math.max(videoStartupDrainUntil, until) : until;
              videoStartupDrainReleaseSince = null;
            }
          }
        }
        lastVideoPlayoutSample = { ts: now, value: videoValue };
        if (videoEl.value) {
          const lastAt = lastPlaybackRateUpdateAt ?? now;
          const deltaMs = Math.max(0, now - lastAt);
          lastPlaybackRateUpdateAt = now;
          const errorMs = Math.max(0, videoValue - (baseTargetMs + frameMs));
          const boostActive = modeSwitchDrainUntil != null && now <= modeSwitchDrainUntil;
          if (boostActive) {
            const boosted = 1 + Math.min(
              videoLatencyProfile.playbackRateBoostMax - 1,
              errorMs / Math.max(1, frameMs * 6)
            );
            setVideoPlaybackRate(
              Math.min(videoLatencyProfile.playbackRateBoostMax, Math.max(1, boosted))
            );
          } else if (errorMs > 0) {
            const desired = 1 + Math.min(videoLatencyProfile.playbackRateMax - 1, errorMs / Math.max(1, frameMs * 10));
            setVideoPlaybackRate(Math.min(videoLatencyProfile.playbackRateMax, Math.max(1, desired)));
          } else {
            const current = videoEl.value.playbackRate ?? 1;
            if (current > 1 && deltaMs > 0) {
              const decay = videoLatencyProfile.playbackRateDecayPerSec * deltaMs / 1e3;
              setVideoPlaybackRate(Math.max(1, current - decay));
            } else {
              setVideoPlaybackRate(1);
            }
          }
        }
        if (videoStartupDrainUntil != null) {
          if (now > videoStartupDrainUntil) {
            videoStartupDrainUntil = null;
            videoStartupDrainReleaseSince = null;
            setVideoDrainMode("off", baseTargetMs);
          } else {
            const startupTargetMs = resolveVideoStartupTargetMs();
            setVideoDrainMode("startup", baseTargetMs, startupTargetMs);
            if (videoValue <= baseTargetMs + frameMs) {
              if (videoStartupDrainReleaseSince == null) {
                videoStartupDrainReleaseSince = now;
              } else if (now - videoStartupDrainReleaseSince >= videoLatencyProfile.startupReleaseSustainMs) {
                videoStartupDrainUntil = null;
                videoStartupDrainReleaseSince = null;
                setVideoDrainMode("off", baseTargetMs);
              }
            } else {
              videoStartupDrainReleaseSince = null;
            }
            return;
          }
        }
        const triggerMs = Math.max(baseTargetMs + frameMs, frameMs * 2);
        const releaseMs = Math.max(baseTargetMs + frameMs * 0.5, frameMs);
        if (videoValue >= triggerMs) {
          if (videoDrainOverloadedSince == null) {
            videoDrainOverloadedSince = now;
          }
          videoDrainReleaseSince = null;
          if (videoDrainMode !== "adaptive" && now - videoDrainOverloadedSince >= videoLatencyProfile.drainSustainMs) {
            setVideoDrainMode("adaptive", baseTargetMs);
          }
        } else if (videoDrainMode === "adaptive" && videoValue <= releaseMs) {
          if (videoDrainReleaseSince == null) {
            videoDrainReleaseSince = now;
          }
          if (now - videoDrainReleaseSince >= videoLatencyProfile.drainReleaseSustainMs) {
            setVideoDrainMode("off", baseTargetMs);
          }
        } else {
          videoDrainOverloadedSince = null;
          videoDrainReleaseSince = null;
          if (videoDrainMode !== "adaptive") {
            setVideoDrainMode("off", baseTargetMs);
          }
        }
      }
    );
    watch(
      () => stats.value.videoJitterBufferMs,
      (videoValue) => {
        if (!isConnected.value || !isTabActive()) {
          videoBufferOverloadedSince = null;
          return;
        }
        const videoOverloaded = typeof videoValue === "number" && Number.isFinite(videoValue) && videoValue >= VIDEO_BUFFER_RESET_THRESHOLD_MS;
        if (!videoOverloaded) {
          videoBufferOverloadedSince = null;
          return;
        }
        const delayValue = renderDelayMs.value;
        const intervalValue = renderIntervalMs.value;
        const hasRenderSignal = typeof delayValue === "number" || typeof intervalValue === "number";
        const renderDelayHigh = typeof delayValue === "number" && delayValue >= VIDEO_RENDER_RESET_THRESHOLD_MS;
        const renderIntervalHigh = typeof intervalValue === "number" && intervalValue >= VIDEO_INTERVAL_RESET_THRESHOLD_MS;
        const allowVideoReset = !hasRenderSignal || renderDelayHigh || renderIntervalHigh;
        if (!allowVideoReset)
          return;
        const now = Date.now();
        if (videoBufferOverloadedSince == null) {
          videoBufferOverloadedSince = now;
          return;
        }
        if (now - videoBufferOverloadedSince < VIDEO_BUFFER_RESET_SUSTAIN_MS)
          return;
        if (lastVideoBufferResetAt != null && now - lastVideoBufferResetAt < VIDEO_BUFFER_RESET_COOLDOWN_MS) {
          return;
        }
        lastVideoBufferResetAt = now;
        videoBufferOverloadedSince = null;
        pushVideoEvent("video-buffer-reset");
        resetVideoElement();
      }
    );
    function resetServerRates() {
      lastServerSample = null;
      serverVideoFps.value = void 0;
    }
    let serverSessionTimer = null;
    function stopServerSessionPolling() {
      if (serverSessionTimer) {
        window.clearInterval(serverSessionTimer);
        serverSessionTimer = null;
      }
    }
    function startServerSessionPolling() {
      stopServerSessionPolling();
      if (!sessionId.value)
        return;
      const poll = async () => {
        if (!sessionId.value)
          return;
        try {
          const result = await api.getSessionState(sessionId.value);
          if (result.session) {
            serverSession.value = result.session;
            const now = Date.now();
            if (lastServerSample && typeof result.session.video_packets === "number") {
              const dt = (now - lastServerSample.ts) / 1e3;
              const packets = result.session.video_packets - (lastServerSample.videoPackets ?? 0);
              if (dt > 0)
                serverVideoFps.value = packets / dt;
            }
            lastServerSample = { ts: now, ...typeof result.session.video_packets === "number" ? { videoPackets: result.session.video_packets } : {} };
          }
        } catch {
        }
      };
      void poll();
      serverSessionTimer = window.setInterval(poll, 1e3);
    }
    let webrtcDiagTimer = null;
    function startWebrtcDiagnostics() {
      stopWebrtcDiagnostics();
      webrtcDiagTimer = window.setInterval(() => {
        if (!isConnected.value)
          return;
      }, WEBRTC_DIAG_LOG_INTERVAL_MS);
    }
    function stopWebrtcDiagnostics() {
      if (webrtcDiagTimer != null) {
        window.clearInterval(webrtcDiagTimer);
        webrtcDiagTimer = null;
      }
    }
    function stopDiagnosticsSampling() {
      if (diagnosticsSampleTimer != null) {
        window.clearInterval(diagnosticsSampleTimer);
        diagnosticsSampleTimer = null;
      }
    }
    function startDiagnosticsSampling() {
      stopDiagnosticsSampling();
      diagnosticsSampleTimer = window.setInterval(() => {
        var _a, _b, _c, _d;
        if (!isConnected.value)
          return;
        const now = Date.now();
        const sample = {
          ts: now,
          pacingDtMs: videoPacingMetrics.value.dtMs ?? null,
          presentedDelta: videoPacingMetrics.value.presentedDelta ?? null,
          renderIntervalMs: renderIntervalMs.value,
          renderDelayMs: renderDelayMs.value,
          fpsReceived: inboundVideoStats.value.fpsReceived,
          fpsDecoded: inboundVideoStats.value.fpsDecoded,
          framesDropped: inboundVideoStats.value.framesDropped,
          avgJitterBufferMs: inboundVideoStats.value.avgJitterBufferMs ?? null,
          avgDecodeMsPerFrame: inboundVideoStats.value.avgDecodeMsPerFrame ?? null,
          packetsLostDelta: inboundVideoStats.value.packetsLostDelta,
          jitter: inboundVideoStats.value.jitter,
          serverQueue: (_a = serverSession.value) == null ? void 0 : _a.video_queue_frames,
          serverInflight: (_b = serverSession.value) == null ? void 0 : _b.video_inflight_frames,
          serverVideoAgeMs: ((_c = serverSession.value) == null ? void 0 : _c.last_video_age_ms) ?? void 0,
          serverFps: serverVideoFps.value
        };
        diagnosticsSamples.value.push(sample);
        const cutoff = now - DIAGNOSTICS_WINDOW_MS;
        while (diagnosticsSamples.value.length && (((_d = diagnosticsSamples.value[0]) == null ? void 0 : _d.ts) ?? Infinity) < cutoff) {
          diagnosticsSamples.value.shift();
        }
      }, 1e3);
    }
    function stopAudioPlayRetry() {
      if (audioPlayRetryTimer != null) {
        window.clearInterval(audioPlayRetryTimer);
        audioPlayRetryTimer = null;
      }
      audioPlayRetryUntilMs = null;
    }
    function ensureAudioPlayback(reason) {
      if (!audioAutoplayRequested)
        return;
      if (!audioEl.value)
        return;
      if (!audioStream)
        audioStream = new MediaStream();
      if (audioEl.value.srcObject !== audioStream)
        audioEl.value.srcObject = audioStream;
      audioEl.value.volume = 1;
      const hasTrack = audioStream.getAudioTracks().length > 0;
      if (!hasTrack)
        audioEl.value.muted = true;
      const now = Date.now();
      if (now - lastAudioPlayAttemptAtMs < 250)
        return;
      lastAudioPlayAttemptAtMs = now;
      const playPromise = (() => {
        try {
          return audioEl.value.play();
        } catch (error) {
          const name = error && typeof error === "object" ? error.name : "";
          if (now - lastAudioPlayErrorAtMs > 1500) {
            lastAudioPlayErrorAtMs = now;
            pushVideoEvent(`audio-play-throw${name ? `:${name}` : ""}:${reason}`);
          }
          return null;
        }
      })();
      if (!playPromise || typeof playPromise.then !== "function")
        return;
      playPromise.then(() => {
        if (!audioEl.value)
          return;
        if (!audioEl.value.paused) {
          audioPlaybackUnlocked = true;
          if (hasTrack)
            stopAudioPlayRetry();
        }
      }).catch((error) => {
        const name = error && typeof error === "object" ? error.name : "";
        if (now - lastAudioPlayErrorAtMs > 1500) {
          lastAudioPlayErrorAtMs = now;
          pushVideoEvent(`audio-play-error${name ? `:${name}` : ""}:${reason}`);
        }
      });
    }
    function primeAudioAutoplay() {
      if (!audioEl.value)
        return;
      if (!audioStream)
        audioStream = new MediaStream();
      audioPlaybackUnlocked = false;
      audioEl.value.srcObject = audioStream;
      audioEl.value.volume = 1;
      audioEl.value.muted = true;
      stopAudioPlayRetry();
      audioPlayRetryUntilMs = Date.now() + 8e3;
      audioPlayRetryTimer = window.setInterval(() => {
        if (!audioAutoplayRequested) {
          stopAudioPlayRetry();
          return;
        }
        if (audioPlayRetryUntilMs != null && Date.now() > audioPlayRetryUntilMs) {
          stopAudioPlayRetry();
          return;
        }
        ensureAudioPlayback("retry");
      }, 500);
      ensureAudioPlayback("prime");
    }
    function stopSessionStatusPolling() {
      if (sessionStatusTimer) {
        window.clearInterval(sessionStatusTimer);
        sessionStatusTimer = null;
      }
    }
    async function fetchSessionStatus() {
      var _a;
      if (isConnected.value)
        return;
      try {
        const result = await http.get("/api/session/status", { validateStatus: () => true });
        if (result.status === 200 && ((_a = result.data) == null ? void 0 : _a.status)) {
          sessionStatus.value = {
            activeSessions: Number(result.data.activeSessions ?? 0),
            appRunning: Boolean(result.data.appRunning),
            paused: Boolean(result.data.paused)
          };
          return;
        }
      } catch {
      }
      sessionStatus.value = null;
    }
    function startSessionStatusPolling() {
      stopSessionStatusPolling();
      if (isConnected.value)
        return;
      void fetchSessionStatus();
      sessionStatusTimer = window.setInterval(fetchSessionStatus, 5e3);
    }
    let escHoldTimer = null;
    let fullscreenKeyboardLockRequested = false;
    function getFullscreenElement() {
      return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
    }
    function isIosPhone() {
      try {
        const ua = navigator.userAgent ?? "";
        return /\b(iPhone|iPod)\b/i.test(ua);
      } catch {
        return false;
      }
    }
    function isNativeVideoFullscreenActive() {
      if (nativeVideoFullscreen.value)
        return true;
      try {
        const anyVideo = videoEl.value;
        return Boolean(anyVideo == null ? void 0 : anyVideo.webkitDisplayingFullscreen);
      } catch {
        return false;
      }
    }
    async function requestFullscreen(target) {
      const anyTarget = target;
      if (typeof target.requestFullscreen === "function") {
        try {
          await target.requestFullscreen();
          return true;
        } catch {
        }
      }
      if (typeof anyTarget.webkitRequestFullscreen === "function") {
        try {
          const result = anyTarget.webkitRequestFullscreen();
          if (result && typeof result.then === "function")
            await result;
          return true;
        } catch {
        }
      }
      return false;
    }
    function tryEnterNativeVideoFullscreen() {
      const video = videoEl.value;
      if (!video)
        return false;
      const anyVideo = video;
      const enter = (anyVideo == null ? void 0 : anyVideo.webkitEnterFullscreen) ?? (anyVideo == null ? void 0 : anyVideo.webkitEnterFullScreen);
      if (typeof enter !== "function")
        return false;
      try {
        enter.call(video);
        return true;
      } catch {
        return false;
      }
    }
    async function tryEnterFullscreen(target) {
      const video = videoEl.value;
      if (isIosPhone() && video) {
        if (await requestFullscreen(video))
          return true;
        if (tryEnterNativeVideoFullscreen())
          return true;
        if (await requestFullscreen(target))
          return true;
        return false;
      }
      if (await requestFullscreen(target))
        return true;
      if (video) {
        if (await requestFullscreen(video))
          return true;
        if (tryEnterNativeVideoFullscreen())
          return true;
      }
      return false;
    }
    async function exitFullscreen() {
      const anyDoc = document;
      if (typeof document.exitFullscreen === "function") {
        await document.exitFullscreen();
        return;
      }
      if (typeof anyDoc.webkitExitFullscreen === "function") {
        const result = anyDoc.webkitExitFullscreen();
        if (result && typeof result.then === "function")
          await result;
      }
    }
    function isFullscreenActive() {
      if (isNativeVideoFullscreenActive())
        return true;
      const fullscreenEl = getFullscreenElement();
      return fullscreenEl === inputTarget.value || fullscreenEl === videoEl.value;
    }
    function isTabActive() {
      try {
        const visible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;
        const focus = typeof document !== "undefined" && document.hasFocus ? document.hasFocus() : true;
        return visible && focus;
      } catch {
        return true;
      }
    }
    const onFullscreenChange = () => {
      const active = isFullscreenActive();
      if (active)
        pseudoFullscreen.value = false;
      isFullscreen.value = active || pseudoFullscreen.value;
      if (!isFullscreen.value) {
        cancelEscHold();
        releaseFullscreenKeyboardLock();
      }
      modeSwitchDrainUntil = Date.now() + videoLatencyProfile.modeSwitchDrainMs;
      triggerVideoDrainWindow(videoLatencyProfile.modeSwitchDrainMs, "fullscreen");
      ensureAudioPlayback("fullscreen");
    };
    const onOverlayHotkey = (event) => {
      if (!event.ctrlKey || !event.altKey || !event.shiftKey)
        return;
      if (event.code !== "KeyS")
        return;
      event.preventDefault();
      event.stopPropagation();
      showOverlay.value = !showOverlay.value;
    };
    const onPageHide = () => {
      void client.disconnect({ keepalive: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        modeSwitchDrainUntil = Date.now() + videoLatencyProfile.modeSwitchDrainMs;
        triggerVideoDrainWindow(videoLatencyProfile.modeSwitchDrainMs, "resume");
      }
      ensureAudioPlayback("visibility");
    };
    const onAudioUserGesture = () => {
      if (!audioAutoplayRequested)
        return;
      if (audioPlayRetryUntilMs != null && Date.now() <= audioPlayRetryUntilMs) {
        ensureAudioPlayback("gesture");
        return;
      }
      if (!audioPlaybackUnlocked && isConnected.value)
        ensureAudioPlayback("gesture");
    };
    const onFullscreenEscapeDown = (event) => {
      if (event.code !== "Escape")
        return;
      if (!isFullscreen.value)
        return;
      if (escHoldTimer) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      escHoldTimer = window.setTimeout(async () => {
        escHoldTimer = null;
        if (getFullscreenElement()) {
          try {
            await exitFullscreen();
          } catch {
          }
        }
      }, ESC_HOLD_MS);
    };
    const onFullscreenEscapeUp = (event) => {
      if (event.code !== "Escape")
        return;
      if (!isFullscreen.value)
        return;
      event.preventDefault();
      event.stopPropagation();
      cancelEscHold();
    };
    function cancelEscHold() {
      if (escHoldTimer) {
        window.clearTimeout(escHoldTimer);
        escHoldTimer = null;
      }
    }
    function requestFullscreenKeyboardLock() {
      if (fullscreenKeyboardLockRequested)
        return;
      fullscreenKeyboardLockRequested = true;
      void requestKeyboardLock().then((locked) => {
        if (!locked)
          fullscreenKeyboardLockRequested = false;
      });
    }
    function releaseFullscreenKeyboardLock() {
      if (!fullscreenKeyboardLockRequested)
        return;
      fullscreenKeyboardLockRequested = false;
      releaseKeyboardLock();
    }
    function formatKbps(value) {
      return value ? `${value.toFixed(0)} kbps` : "--";
    }
    function formatMs(value) {
      return value != null ? `${value.toFixed(1)} ms` : "--";
    }
    function pushVideoEvent(label) {
      const stamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      videoEvents.value = [`${stamp} ${label}`, ...videoEvents.value].slice(0, 8);
      videoStateTick.value += 1;
    }
    function updateRemoteStreamInfo(stream) {
      remoteStreamInfo.value = {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      };
    }
    function updateVideoElement(stream) {
      if (!videoEl.value)
        return false;
      const videoTracks = stream.getVideoTracks();
      if (!videoTracks.length)
        return false;
      if (!videoStream)
        videoStream = new MediaStream();
      videoStream.getVideoTracks().forEach((t2) => videoStream.removeTrack(t2));
      videoTracks.forEach((t2) => videoStream.addTrack(t2));
      videoEl.value.srcObject = videoStream;
      return true;
    }
    function resetVideoElement() {
      const el = videoEl.value;
      if (!el || !videoStream)
        return;
      el.srcObject = null;
      el.srcObject = videoStream;
    }
    function updateAudioElement(stream) {
      if (!audioEl.value)
        return;
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length)
        return;
      if (!audioStream)
        audioStream = new MediaStream();
      audioStream.getAudioTracks().forEach((t2) => audioStream.removeTrack(t2));
      audioTracks.forEach((t2) => audioStream.addTrack(t2));
      audioEl.value.srcObject = audioStream;
      audioEl.value.muted = false;
    }
    function resetAudioElement() {
      const el = audioEl.value;
      if (!el || !audioStream)
        return;
      el.srcObject = null;
      el.srcObject = audioStream;
      void el.play().catch(() => {
      });
    }
    function attachVideoDebug(el) {
      const events = [
        "loadedmetadata",
        "canplay",
        "playing",
        "waiting",
        "stalled",
        "suspend",
        "error",
        "ended"
      ];
      const handlers = events.map((event) => {
        const handler = () => {
          pushVideoEvent(event);
          videoStateTick.value++;
        };
        el.addEventListener(event, handler);
        return { event, handler };
      });
      return () => {
        handlers.forEach(({ event, handler }) => el.removeEventListener(event, handler));
      };
    }
    function attachVideoFrameMetrics(el) {
      const intervalSamples = [];
      const maxSamples = 120;
      let lastTs = null;
      if ("requestVideoFrameCallback" in el) {
        let handle = 0;
        const cb = (now, meta) => {
          const interval = lastTs != null ? now - lastTs : null;
          lastTs = now;
          if (interval != null) {
            intervalSamples.push(interval);
            if (intervalSamples.length > maxSamples)
              intervalSamples.shift();
            const sorted = [...intervalSamples].sort((a, b) => a - b);
            const p98Idx = Math.floor(sorted.length * 0.98);
            const p99Idx = Math.floor(sorted.length * 0.99);
            videoFrameMetrics.value = {
              lastIntervalMs: interval,
              avgIntervalMs: sorted.reduce((a, b) => a + b, 0) / sorted.length,
              maxIntervalMs: sorted[sorted.length - 1],
              p98IntervalMs: sorted[p98Idx],
              avg98IntervalMs: sorted.slice(0, p98Idx + 1).reduce((a, b) => a + b, 0) / (p98Idx + 1),
              p99IntervalMs: sorted[p99Idx],
              avg99IntervalMs: sorted.slice(0, p99Idx + 1).reduce((a, b) => a + b, 0) / (p99Idx + 1)
            };
          }
          handle = el.requestVideoFrameCallback(cb);
        };
        handle = el.requestVideoFrameCallback(cb);
        return () => {
          if (handle)
            el.cancelVideoFrameCallback(handle);
        };
      }
      let rafId = 0;
      let lastT = el.currentTime;
      const raf = (now) => {
        if (el.currentTime !== lastT) {
          const interval = lastTs != null ? now - lastTs : null;
          lastTs = now;
          lastT = el.currentTime;
          if (interval != null) {
            intervalSamples.push(interval);
            if (intervalSamples.length > maxSamples)
              intervalSamples.shift();
            videoFrameMetrics.value = {
              lastIntervalMs: interval,
              avgIntervalMs: intervalSamples.reduce((a, b) => a + b, 0) / intervalSamples.length
            };
          }
        }
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      return () => cancelAnimationFrame(rafId);
    }
    function attachVideoPacingProbe(el, onSample) {
      if ("requestVideoFrameCallback" in el) {
        let handle = 0;
        let lastNow = null;
        let lastPresented = null;
        const cb = (now, meta) => {
          const dtMs = lastNow != null ? now - lastNow : null;
          const presentedFrames = meta.presentedFrames;
          const presentedDelta = lastPresented != null && typeof presentedFrames === "number" ? presentedFrames - lastPresented : null;
          onSample({ dtMs, presentedDelta, now, mediaTime: meta.mediaTime });
          lastPresented = presentedFrames ?? lastPresented;
          lastNow = now;
          handle = el.requestVideoFrameCallback(cb);
        };
        handle = el.requestVideoFrameCallback(cb);
        return () => {
          if (handle)
            el.cancelVideoFrameCallback(handle);
        };
      }
      let rafId = 0;
      let lastT = el.currentTime;
      const raf = (now) => {
        if (el.currentTime !== lastT) {
          onSample({ dtMs: null, presentedDelta: null, now, mediaTime: el.currentTime });
          lastT = el.currentTime;
        }
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      return () => cancelAnimationFrame(rafId);
    }
    function startInboundVideoStats(pc, onStats, intervalMs = 1e3) {
      let prev = null;
      const id = window.setInterval(async () => {
        try {
          const report = await pc.getStats();
          let best = null;
          report.forEach((s) => {
            if (s.type !== "inbound-rtp")
              return;
            if (s.kind !== "video" && s.mediaType !== "video")
              return;
            const frames = typeof s.framesReceived === "number" ? s.framesReceived : 0;
            if (!best || frames > (best.framesReceived ?? 0))
              best = s;
          });
          if (!best)
            return;
          const now = performance.now();
          const cur = {
            now,
            framesReceived: best.framesReceived,
            framesDecoded: best.framesDecoded,
            framesDropped: best.framesDropped,
            packetsLost: best.packetsLost,
            jitter: best.jitter,
            jitterBufferDelay: best.jitterBufferDelay,
            jitterBufferEmittedCount: best.jitterBufferEmittedCount,
            totalDecodeTime: best.totalDecodeTime
          };
          if (prev) {
            const dt = (cur.now - prev.now) / 1e3;
            const dRecv = typeof cur.framesReceived === "number" && typeof prev.framesReceived === "number" ? cur.framesReceived - prev.framesReceived : void 0;
            const dDec = typeof cur.framesDecoded === "number" && typeof prev.framesDecoded === "number" ? cur.framesDecoded - prev.framesDecoded : void 0;
            const dDrop = typeof cur.framesDropped === "number" && typeof prev.framesDropped === "number" ? cur.framesDropped - prev.framesDropped : void 0;
            const avgJbMs = typeof cur.jitterBufferDelay === "number" && typeof cur.jitterBufferEmittedCount === "number" && cur.jitterBufferEmittedCount > 0 ? cur.jitterBufferDelay / cur.jitterBufferEmittedCount * 1e3 : null;
            const avgDecodeMs = typeof cur.totalDecodeTime === "number" && typeof cur.framesDecoded === "number" && cur.framesDecoded > 0 ? cur.totalDecodeTime / cur.framesDecoded * 1e3 : null;
            onStats({
              ...typeof dRecv === "number" ? { fpsReceived: dRecv / dt } : {},
              ...typeof dDec === "number" ? { fpsDecoded: dDec / dt } : {},
              ...typeof dDrop === "number" ? { framesDropped: dDrop } : {},
              avgJitterBufferMs: avgJbMs,
              avgDecodeMsPerFrame: avgDecodeMs,
              ...typeof cur.packetsLost === "number" && typeof prev.packetsLost === "number" ? { packetsLostDelta: cur.packetsLost - prev.packetsLost } : {},
              jitter: cur.jitter
            });
          }
          prev = cur;
        } catch {
        }
      }, intervalMs);
      return () => {
        window.clearInterval(id);
      };
    }
    async function confirmTerminateAndConnect() {
      dialog.warning({
        title: t("webrtc.terminate_confirm_title"),
        content: t("webrtc.terminate_confirm_message", {
          app: selectedAppName.value ?? t("webrtc.terminate_confirm_app_fallback")
        }),
        positiveText: t("webrtc.terminate_confirm_action"),
        negativeText: t("_common.cancel"),
        onPositiveClick: async () => {
          await terminateSession();
          await startConnect();
        }
      });
    }
    async function waitForSpinnerFrame() {
      await nextTick();
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }
    async function startConnect() {
      isConnecting.value = true;
      await waitForSpinnerFrame();
      negotiatedEncoding.value = null;
      hdrRuntimeWarning.value = null;
      audioAutoplayRequested = true;
      primeAudioAutoplay();
      resetAudioDrainState();
      client.setAudioLatencyTargets(AUDIO_TARGET_BUFFER_MS, AUDIO_TARGET_PLAYOUT_MS);
      if (autoFullscreen.value && inputTarget.value && !isFullscreen.value) {
        try {
          const target = inputTarget.value;
          const entered = await tryEnterFullscreen(target);
          if (!entered)
            pseudoFullscreen.value = true;
          onFullscreenChange();
          try {
            target.focus();
          } catch {
          }
          requestFullscreenKeyboardLock();
        } catch {
        }
      }
      ensureAudioPlayback("connect");
      stopServerSessionPolling();
      sessionId.value = null;
      serverSession.value = null;
      resetServerRates();
      try {
        const shouldResume = !selectedAppId.value && resumeOnConnect.value && resumeAvailable.value;
        const effectiveAppId = selectedAppId.value ?? void 0;
        const connectCfg = { ...config, resume: shouldResume };
        if (effectiveAppId !== void 0)
          connectCfg.appId = effectiveAppId;
        else
          delete connectCfg.appId;
        const id = await client.connect(
          connectCfg,
          {
            onRemoteStream: (stream) => {
              if (videoEl.value) {
                const hasVideo = updateVideoElement(stream);
                videoEl.value.muted = false;
                videoEl.value.volume = 1;
                updateRemoteStreamInfo(stream);
                updateAudioElement(stream);
                ensureAudioPlayback("remote-stream");
                if (hasVideo) {
                  videoStartupDrainUntil = Date.now() + videoLatencyProfile.startupDrainMs;
                  videoStartupDrainReleaseSince = null;
                  const baseTargetMs = resolveVideoBaseTargetMs();
                  setVideoDrainMode("startup", baseTargetMs, resolveVideoStartupTargetMs());
                  const playPromise = videoEl.value.play();
                  if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch((error) => {
                      const name = error && typeof error === "object" ? error.name : "";
                      pushVideoEvent(`play-error${name ? `:${name}` : ""}`);
                    });
                  }
                }
              }
            },
            onConnectionState: (state) => {
              connectionState.value = state;
              isConnected.value = state === "connected";
              if (state === "connected") {
                applyVideoTargetMs(resolveVideoBaseTargetMs());
                if (!stopInboundVideoStatsTimer) {
                  const pc = client.peerConnection;
                  if (pc)
                    stopInboundVideoStatsTimer = startInboundVideoStats(pc, (sample) => {
                      inboundVideoStats.value = sample;
                    });
                }
                if (!diagnosticsSampleTimer)
                  startDiagnosticsSampling();
              } else if (state === "failed" || state === "disconnected" || state === "closed") {
                if (stopInboundVideoStatsTimer) {
                  stopInboundVideoStatsTimer();
                  stopInboundVideoStatsTimer = null;
                }
                inboundVideoStats.value = {};
                stopDiagnosticsSampling();
                diagnosticsSamples.value = [];
              }
            },
            onIceState: (state) => {
              iceState.value = state;
            },
            onInputChannelState: (state) => {
              inputChannelState.value = state;
            },
            onInputMessage: (message2) => {
              applyGamepadFeedback(message2);
            },
            onStats: (snapshot) => {
              stats.value = snapshot;
            },
            onNegotiatedEncoding: (encoding) => {
              if (encoding === "h264" || encoding === "hevc" || encoding === "av1")
                negotiatedEncoding.value = encoding;
            },
            onWarning: (warning) => {
              notifyWarning("Configuration Warning", warning);
              if (config.hdr && /^hdr\b/i.test(warning))
                hdrRuntimeWarning.value = warning;
            }
          },
          { inputPriority: isFullscreenActive() || isTabActive() ? "high" : "low" }
        );
        sessionId.value = id;
        startServerSessionPolling();
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to establish WebRTC session.";
        notifyError("Connection Failed", msg);
        console.error(error);
        audioAutoplayRequested = false;
        stopAudioPlayRetry();
      } finally {
        isConnecting.value = false;
        if (!isConnected.value)
          startSessionStatusPolling();
      }
    }
    async function connect() {
      if (isConnecting.value)
        return;
      if (!sessionStatus.value)
        await fetchSessionStatus();
      if (selectedAppId.value && hasRunningSession.value) {
        await confirmTerminateAndConnect();
        return;
      }
      await startConnect();
    }
    async function disconnect() {
      await client.disconnect();
      stopServerSessionPolling();
      isConnected.value = false;
      connectionState.value = null;
      iceState.value = null;
      inputChannelState.value = null;
      stats.value = {};
      inputMetrics.value = {};
      inputBufferedAmount.value = null;
      videoFrameMetrics.value = {};
      videoPacingMetrics.value = {};
      inboundVideoStats.value = {};
      diagnosticsSamples.value = [];
      stopDiagnosticsSampling();
      if (stopInboundVideoStatsTimer) {
        stopInboundVideoStatsTimer();
        stopInboundVideoStatsTimer = null;
      }
      smoothedVideoFps.value = void 0;
      lastVideoFpsSampleAt = null;
      lastPlaybackRateUpdateAt = null;
      modeSwitchDrainUntil = null;
      detachInputCapture();
      if (videoEl.value) {
        try {
          videoEl.value.playbackRate = 1;
        } catch {
        }
        videoEl.value.srcObject = null;
      }
      if (audioEl.value)
        audioEl.value.srcObject = null;
      videoStream = null;
      audioStream = null;
      audioAutoplayRequested = false;
      stopAudioPlayRetry();
      resetAudioDrainState();
      resetVideoDrainState();
      lastVideoTargetMs = void 0;
      desiredVideoTargetMs = void 0;
      effectiveVideoTargetMs = void 0;
      lastVideoTargetAdjustAt = null;
      videoStartupDrainUntil = null;
      videoStartupDrainReleaseSince = null;
      safariRunawayDrainSince = null;
      safariRunawayDrainLatched = false;
      safariRunawayResetSince = null;
      sessionId.value = null;
      serverSession.value = null;
      resetServerRates();
      remoteStreamInfo.value = null;
      videoEvents.value = [];
      videoStateTick.value += 1;
      startSessionStatusPolling();
    }
    async function terminateSession() {
      if (terminatePending.value)
        return;
      terminatePending.value = true;
      try {
        await http.post("/api/apps/close", {}, { validateStatus: () => true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to terminate session.";
        notifyError("Termination Failed", msg);
      } finally {
        await disconnect();
        terminatePending.value = false;
      }
    }
    async function toggleFullscreen() {
      try {
        if (pseudoFullscreen.value && !isFullscreenActive()) {
          pseudoFullscreen.value = false;
          onFullscreenChange();
          releaseFullscreenKeyboardLock();
          return;
        }
        if (isFullscreenActive()) {
          await exitFullscreen();
          releaseFullscreenKeyboardLock();
          return;
        }
        if (!inputTarget.value)
          return;
        const target = inputTarget.value;
        const entered = await tryEnterFullscreen(target);
        if (!entered)
          pseudoFullscreen.value = true;
        onFullscreenChange();
        requestFullscreenKeyboardLock();
        try {
          target.focus();
        } catch {
        }
        requestFullscreenKeyboardLock();
      } catch {
      }
    }
    async function onFullscreenDblClick() {
      if (isFullscreenActive())
        return;
      await toggleFullscreen();
    }
    function detachInputCapture() {
      if (detachInput) {
        detachInput();
        detachInput = null;
      }
    }
    watch(
      () => [inputEnabled.value, isConnected.value],
      ([enabled, connected]) => {
        detachInputCapture();
        if (!enabled || !connected || !inputTarget.value) {
          releaseFullscreenKeyboardLock();
          return;
        }
        detachInput = attachInputCapture(
          inputTarget.value,
          (payload) => {
            client.sendInput(payload);
            inputBufferedAmount.value = client.inputChannelBufferedAmount ?? null;
          },
          {
            video: videoEl.value,
            onMetrics: (metrics) => {
              inputMetrics.value = metrics;
            },
            shouldDrop: shouldDropInput
          }
        );
        if (isFullscreenActive())
          requestFullscreenKeyboardLock();
      }
    );
    function attachVideoFullscreenEvents(el) {
      const onBegin = () => {
        nativeVideoFullscreen.value = true;
        onFullscreenChange();
      };
      const onEnd = () => {
        nativeVideoFullscreen.value = false;
        onFullscreenChange();
      };
      el.addEventListener("webkitbeginfullscreen", onBegin);
      el.addEventListener("webkitendfullscreen", onEnd);
      return () => {
        el.removeEventListener("webkitbeginfullscreen", onBegin);
        el.removeEventListener("webkitendfullscreen", onEnd);
      };
    }
    watch(videoEl, (el) => {
      if (detachVideoEvents) {
        detachVideoEvents();
        detachVideoEvents = null;
      }
      if (detachVideoFrames) {
        detachVideoFrames();
        detachVideoFrames = null;
      }
      if (detachVideoPacing) {
        detachVideoPacing();
        detachVideoPacing = null;
      }
      if (detachVideoFullscreenEvents) {
        detachVideoFullscreenEvents();
        detachVideoFullscreenEvents = null;
      }
      if (!el)
        return;
      detachVideoEvents = attachVideoDebug(el);
      detachVideoFrames = attachVideoFrameMetrics(el);
      detachVideoPacing = attachVideoPacingProbe(el, (sample) => {
        videoPacingMetrics.value = sample;
      });
      detachVideoFullscreenEvents = attachVideoFullscreenEvents(el);
    });
    onBeforeUnmount(() => {
      setWebRtcActive(false);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", onAudioUserGesture, true);
      window.removeEventListener("keydown", onAudioUserGesture, true);
      window.removeEventListener("keydown", onOverlayHotkey, true);
      window.removeEventListener("keydown", onFullscreenEscapeDown, true);
      window.removeEventListener("keyup", onFullscreenEscapeUp, true);
      window.removeEventListener("pagehide", onPageHide);
      cancelEscHold();
      if (detachVideoEvents) {
        detachVideoEvents();
        detachVideoEvents = null;
      }
      if (detachVideoFrames) {
        detachVideoFrames();
        detachVideoFrames = null;
      }
      if (detachVideoPacing) {
        detachVideoPacing();
        detachVideoPacing = null;
      }
      if (detachVideoFullscreenEvents) {
        detachVideoFullscreenEvents();
        detachVideoFullscreenEvents = null;
      }
      if (stopInboundVideoStatsTimer) {
        stopInboundVideoStatsTimer();
        stopInboundVideoStatsTimer = null;
      }
      stopDiagnosticsSampling();
      stopWebrtcDiagnostics();
      stopSessionStatusPolling();
      releaseFullscreenKeyboardLock();
      stopServerSessionPolling();
      void disconnect();
    });
    onMounted(async () => {
      loadCachedConfig();
      document.addEventListener("fullscreenchange", onFullscreenChange);
      document.addEventListener("webkitfullscreenchange", onFullscreenChange);
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("pointerdown", onAudioUserGesture, true);
      window.addEventListener("keydown", onAudioUserGesture, true);
      window.addEventListener("keydown", onOverlayHotkey, true);
      window.addEventListener("keydown", onFullscreenEscapeDown, true);
      window.addEventListener("keyup", onFullscreenEscapeUp, true);
      window.addEventListener("pagehide", onPageHide);
      try {
        await appsStore.loadApps(true);
      } catch {
      }
      encodingSupport.value = detectEncodingSupport();
      if (config.hdr)
        ensureHdrEncoding();
      startSessionStatusPolling();
    });
    watch(
      () => isConnected.value,
      (connected) => {
        if (connected) {
          stopSessionStatusPolling();
          startWebrtcDiagnostics();
          return;
        }
        stopWebrtcDiagnostics();
        startSessionStatusPolling();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        "div",
        {
          class: normalizeClass(["webrtc-app", { "settings-open": showSettings.value }])
        },
        [
          createCommentVNode(" Main Content Area "),
          createBaseVNode("div", _hoisted_1, [
            createCommentVNode(" Compact Header "),
            createBaseVNode("header", _hoisted_2, [
              createBaseVNode("div", _hoisted_3, [
                createBaseVNode("div", _hoisted_4, [
                  createBaseVNode("div", _hoisted_5, [
                    createVNode(LucideIcon, {
                      name: "fa-play",
                      size: 20
                    })
                  ]),
                  createBaseVNode(
                    "h1",
                    null,
                    toDisplayString(_ctx.$t("webrtc.title")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode(
                  "div",
                  {
                    class: normalizeClass(["status-pill", connectionPillClass.value])
                  },
                  [
                    _cache[28] || (_cache[28] = createBaseVNode(
                      "span",
                      { class: "status-dot" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(connectionStatusLabel.value),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ]),
              createBaseVNode("div", _hoisted_7, [
                createBaseVNode(
                  "button",
                  {
                    class: normalizeClass(["settings-btn", { active: showSettings.value }]),
                    onClick: _cache[0] || (_cache[0] = ($event) => showSettings.value = !showSettings.value)
                  },
                  [
                    createVNode(LucideIcon, {
                      name: "fa-sliders-h",
                      size: 18
                    }),
                    _cache[29] || (_cache[29] = createBaseVNode(
                      "span",
                      null,
                      "Settings",
                      -1
                      /* CACHED */
                    ))
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            createCommentVNode(" Game Library "),
            createBaseVNode("section", _hoisted_8, [
              createBaseVNode("div", _hoisted_9, [
                createBaseVNode("div", _hoisted_10, [
                  createBaseVNode("h2", null, [
                    createVNode(LucideIcon, {
                      name: "fa-gamepad",
                      size: 20
                    }),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("webrtc.select_game")),
                      1
                      /* TEXT */
                    )
                  ]),
                  selectedAppId.value ? (openBlock(), createElementBlock("span", _hoisted_11, [
                    createVNode(LucideIcon, {
                      name: "fa-check-circle",
                      size: 16
                    }),
                    createTextVNode(
                      " " + toDisplayString(selectedAppLabel.value) + " ",
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("button", {
                      onClick: clearSelection,
                      class: "clear-btn"
                    }, [
                      createVNode(LucideIcon, {
                        name: "fa-times",
                        size: 16
                      })
                    ])
                  ])) : createCommentVNode("v-if", true)
                ]),
                createBaseVNode("div", _hoisted_12, [
                  createVNode(LucideIcon, {
                    name: "fa-search",
                    size: 16
                  }),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchQuery.value = $event),
                    type: "text",
                    placeholder: _ctx.$t("webrtc.search_placeholder") || "Search applications...",
                    class: "search-input"
                  }, null, 8, _hoisted_13), [
                    [vModelText, searchQuery.value]
                  ]),
                  searchQuery.value ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    onClick: _cache[2] || (_cache[2] = ($event) => searchQuery.value = ""),
                    class: "search-clear",
                    "aria-label": "Clear search"
                  }, [
                    createVNode(LucideIcon, {
                      name: "fa-times",
                      size: 16
                    })
                  ])) : createCommentVNode("v-if", true)
                ])
              ]),
              createCommentVNode(" No apps at all "),
              !appsList.value.length ? (openBlock(), createElementBlock("div", _hoisted_14, _cache[30] || (_cache[30] = [
                createStaticVNode('<div class="empty-icon-wrap" data-v-c52d94df><svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden data-v-c52d94df><rect x="2" y="3" width="20" height="14" rx="3" stroke-width="1.5" data-v-c52d94df></rect><path d="M8 21h8M12 17v4" stroke-width="1.5" stroke-linecap="round" data-v-c52d94df></path><path d="M12 8v4m-2-2h4" stroke-width="1.75" stroke-linecap="round" data-v-c52d94df></path></svg></div><h3 data-v-c52d94df>No applications</h3><p data-v-c52d94df>Add games in the Applications tab to start streaming</p>', 3)
              ]))) : !filteredApps.value.length ? (openBlock(), createElementBlock(
                Fragment,
                { key: 1 },
                [
                  createCommentVNode(" No search results "),
                  createBaseVNode("div", _hoisted_15, [
                    _cache[32] || (_cache[32] = createStaticVNode('<div class="empty-icon-wrap" data-v-c52d94df><svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden data-v-c52d94df><circle cx="11" cy="11" r="7" stroke-width="1.5" data-v-c52d94df></circle><path d="M16.5 16.5L21 21" stroke-width="1.5" stroke-linecap="round" data-v-c52d94df></path><path d="M8.5 11h5M11 8.5v5" stroke-width="1.75" stroke-linecap="round" data-v-c52d94df></path><line x1="8.5" y1="8.5" x2="13.5" y2="13.5" stroke-width="1.5" stroke-linecap="round" opacity="0.4" data-v-c52d94df></line></svg></div><h3 data-v-c52d94df>No results</h3>', 2)),
                    createBaseVNode("p", null, [
                      _cache[31] || (_cache[31] = createTextVNode(
                        "No applications match ",
                        -1
                        /* CACHED */
                      )),
                      createBaseVNode(
                        "em",
                        null,
                        '"' + toDisplayString(searchQuery.value) + '"',
                        1
                        /* TEXT */
                      )
                    ]),
                    createBaseVNode("button", {
                      class: "empty-clear-btn",
                      onClick: _cache[3] || (_cache[3] = ($event) => searchQuery.value = "")
                    }, "Clear search")
                  ])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : (openBlock(), createElementBlock(
                Fragment,
                { key: 2 },
                [
                  createCommentVNode(" Games with Box Art "),
                  appsWithCovers.value.length ? (openBlock(), createElementBlock("div", _hoisted_16, [
                    (openBlock(true), createElementBlock(
                      Fragment,
                      null,
                      renderList(appsWithCovers.value, (app) => {
                        return openBlock(), createElementBlock("button", {
                          key: appKey(app),
                          onClick: ($event) => selectApp(app),
                          onDblclick: ($event) => onAppDoubleClick(app),
                          class: normalizeClass(["game-card", { selected: appNumericId(app) === selectedAppId.value }])
                        }, [
                          createBaseVNode("div", _hoisted_18, [
                            createBaseVNode("img", mergeProps({ ref_for: true }, { ...coverUrl(app) ? { src: coverUrl(app) } : {} }, {
                              alt: app.name || "Application",
                              loading: "lazy",
                              onLoad: ($event) => onCoverLoad(app),
                              onError: ($event) => onCoverError(app)
                            }), null, 16, _hoisted_19),
                            _cache[33] || (_cache[33] = createBaseVNode(
                              "div",
                              { class: "cover-gradient" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            appNumericId(app) === selectedAppId.value ? (openBlock(), createElementBlock("div", _hoisted_20, [
                              createVNode(LucideIcon, {
                                name: "fa-check",
                                size: 14
                              })
                            ])) : createCommentVNode("v-if", true),
                            createBaseVNode("div", _hoisted_21, [
                              createVNode(LucideIcon, {
                                name: "fa-play",
                                size: 20
                              })
                            ])
                          ]),
                          createBaseVNode("div", _hoisted_22, [
                            createBaseVNode(
                              "span",
                              _hoisted_23,
                              toDisplayString(app.name || " "),
                              1
                              /* TEXT */
                            ),
                            createBaseVNode(
                              "span",
                              _hoisted_24,
                              toDisplayString(appSubtitle(app)),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 42, _hoisted_17);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : createCommentVNode("v-if", true),
                  createCommentVNode(" Other Applications (no box art) "),
                  appsWithoutCovers.value.length ? (openBlock(), createElementBlock("div", _hoisted_25, [
                    createBaseVNode("h3", _hoisted_26, [
                      createVNode(LucideIcon, {
                        name: "fa-window-maximize",
                        size: 18
                      }),
                      _cache[34] || (_cache[34] = createTextVNode(
                        " Other Applications ",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    createBaseVNode("div", _hoisted_27, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(appsWithoutCovers.value, (app) => {
                          return openBlock(), createElementBlock("button", {
                            key: appKey(app),
                            onClick: ($event) => selectApp(app),
                            onDblclick: ($event) => onAppDoubleClick(app),
                            class: normalizeClass(["app-list-item", { selected: appNumericId(app) === selectedAppId.value }])
                          }, [
                            createBaseVNode("div", _hoisted_29, [
                              createVNode(LucideIcon, {
                                name: "fa-window-maximize",
                                size: 18
                              })
                            ]),
                            createBaseVNode("div", _hoisted_30, [
                              createBaseVNode(
                                "span",
                                _hoisted_31,
                                toDisplayString(app.name || " "),
                                1
                                /* TEXT */
                              ),
                              createBaseVNode(
                                "span",
                                _hoisted_32,
                                toDisplayString(appSubtitle(app)),
                                1
                                /* TEXT */
                              )
                            ]),
                            appNumericId(app) === selectedAppId.value ? (openBlock(), createElementBlock("div", _hoisted_33, [
                              createVNode(LucideIcon, {
                                name: "fa-check",
                                size: 14
                              })
                            ])) : createCommentVNode("v-if", true),
                            createBaseVNode("div", _hoisted_34, [
                              createVNode(LucideIcon, {
                                name: "fa-play",
                                size: 20
                              })
                            ])
                          ], 42, _hoisted_28);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])) : createCommentVNode("v-if", true)
                ],
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            createCommentVNode(" Floating Stream Preview "),
            createBaseVNode(
              "div",
              {
                class: normalizeClass(["stream-preview", { expanded: isFullscreen.value, minimized: streamMinimized.value && !isFullscreen.value }])
              },
              [
                !isFullscreen.value ? (openBlock(), createElementBlock("div", _hoisted_35, [
                  createBaseVNode("div", _hoisted_36, [
                    createVNode(LucideIcon, {
                      name: "fa-tv",
                      size: 16
                    }),
                    _cache[36] || (_cache[36] = createBaseVNode(
                      "span",
                      null,
                      "Stream",
                      -1
                      /* CACHED */
                    )),
                    isConnected.value ? (openBlock(), createElementBlock("span", _hoisted_37, _cache[35] || (_cache[35] = [
                      createBaseVNode(
                        "span",
                        { class: "live-dot" },
                        null,
                        -1
                        /* CACHED */
                      ),
                      createTextVNode(
                        " LIVE ",
                        -1
                        /* CACHED */
                      )
                    ]))) : createCommentVNode("v-if", true)
                  ]),
                  createBaseVNode("div", _hoisted_38, [
                    !isFullscreen.value ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      onClick: _cache[4] || (_cache[4] = ($event) => streamMinimized.value = !streamMinimized.value),
                      class: "control-btn"
                    }, [
                      createVNode(LucideIcon, {
                        name: streamMinimized.value ? "fa-chevron-up" : "fa-chevron-down",
                        size: 16
                      }, null, 8, ["name"])
                    ])) : createCommentVNode("v-if", true),
                    createBaseVNode("button", {
                      onClick: toggleFullscreen,
                      class: "control-btn"
                    }, [
                      createVNode(LucideIcon, {
                        name: isFullscreen.value ? "fa-compress" : "fa-expand",
                        size: 16
                      }, null, 8, ["name"])
                    ])
                  ])
                ])) : createCommentVNode("v-if", true),
                createBaseVNode(
                  "div",
                  {
                    ref_key: "inputTarget",
                    ref: inputTarget,
                    class: normalizeClass(["stream-viewport", { "fullscreen-mode": isFullscreen.value }]),
                    style: normalizeStyle(!isFullscreen.value ? { aspectRatio: `${config.width} / ${config.height}` } : void 0),
                    tabindex: "0",
                    onDblclick: onFullscreenDblClick
                  },
                  [
                    createBaseVNode(
                      "video",
                      {
                        ref_key: "videoEl",
                        ref: videoEl,
                        class: "stream-video",
                        autoplay: "",
                        playsinline: "",
                        controls: false,
                        disablePictureInPicture: ""
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ),
                    createBaseVNode(
                      "audio",
                      {
                        ref_key: "audioEl",
                        ref: audioEl,
                        class: "hidden",
                        autoplay: "",
                        playsinline: ""
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ),
                    createCommentVNode(" Idle State "),
                    !isConnected.value && !isConnecting.value ? (openBlock(), createElementBlock("div", _hoisted_39, [
                      createBaseVNode("div", _hoisted_40, [
                        createBaseVNode("div", _hoisted_41, [
                          selectedAppId.value ? (openBlock(), createElementBlock("svg", _hoisted_42, _cache[37] || (_cache[37] = [
                            createBaseVNode(
                              "circle",
                              {
                                cx: "12",
                                cy: "12",
                                r: "10",
                                "stroke-width": "1.5",
                                opacity: "0.5"
                              },
                              null,
                              -1
                              /* CACHED */
                            ),
                            createBaseVNode(
                              "polygon",
                              {
                                points: "10,8 18,12 10,16",
                                fill: "currentColor",
                                opacity: "0.9"
                              },
                              null,
                              -1
                              /* CACHED */
                            )
                          ]))) : (openBlock(), createElementBlock("svg", _hoisted_43, _cache[38] || (_cache[38] = [
                            createBaseVNode(
                              "rect",
                              {
                                x: "2",
                                y: "4",
                                width: "20",
                                height: "14",
                                rx: "3",
                                "stroke-width": "1.5",
                                opacity: "0.7"
                              },
                              null,
                              -1
                              /* CACHED */
                            ),
                            createBaseVNode(
                              "path",
                              {
                                d: "M8 22h8M12 18v4",
                                "stroke-width": "1.5",
                                "stroke-linecap": "round",
                                opacity: "0.5"
                              },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])))
                        ]),
                        createBaseVNode(
                          "p",
                          null,
                          toDisplayString(selectedAppId.value ? _ctx.$t("webrtc.idle_game_selected") : _ctx.$t("webrtc.idle_no_selection")),
                          1
                          /* TEXT */
                        )
                      ])
                    ])) : createCommentVNode("v-if", true),
                    createCommentVNode(" Connecting State "),
                    showStartingOverlay.value ? (openBlock(), createElementBlock("div", _hoisted_44, _cache[39] || (_cache[39] = [
                      createBaseVNode(
                        "div",
                        { class: "spinner" },
                        null,
                        -1
                        /* CACHED */
                      ),
                      createBaseVNode(
                        "span",
                        null,
                        "Connecting...",
                        -1
                        /* CACHED */
                      )
                    ]))) : createCommentVNode("v-if", true),
                    createCommentVNode(" Stats Overlay "),
                    showOverlay.value && isConnected.value ? (openBlock(), createElementBlock("div", _hoisted_45, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(overlayLines.value, (line, idx) => {
                          return openBlock(), createElementBlock(
                            "div",
                            {
                              key: idx,
                              class: "stat-line"
                            },
                            toDisplayString(line),
                            1
                            /* TEXT */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : createCommentVNode("v-if", true),
                    createCommentVNode(" Notification "),
                    createVNode(Transition, { name: "notification-fade" }, {
                      default: withCtx(() => [
                        activeNotification.value ? (openBlock(), createElementBlock(
                          "div",
                          {
                            key: 0,
                            class: normalizeClass(["notification-toast", activeNotification.value.type])
                          },
                          [
                            createVNode(LucideIcon, {
                              name: notificationIcon.value,
                              size: 16
                            }, null, 8, ["name"]),
                            createBaseVNode("div", _hoisted_46, [
                              createBaseVNode(
                                "strong",
                                null,
                                toDisplayString(activeNotification.value.title),
                                1
                                /* TEXT */
                              ),
                              activeNotification.value.message ? (openBlock(), createElementBlock(
                                "span",
                                _hoisted_47,
                                toDisplayString(activeNotification.value.message),
                                1
                                /* TEXT */
                              )) : createCommentVNode("v-if", true)
                            ]),
                            createBaseVNode("button", { onClick: dismissNotification }, [
                              createVNode(LucideIcon, {
                                name: "fa-times",
                                size: 16
                              })
                            ])
                          ],
                          2
                          /* CLASS */
                        )) : createCommentVNode("v-if", true)
                      ]),
                      _: 1
                      /* STABLE */
                    })
                  ],
                  38
                  /* CLASS, STYLE, NEED_HYDRATION */
                ),
                createCommentVNode(" Quick Actions Bar "),
                !isFullscreen.value && !streamMinimized.value ? (openBlock(), createElementBlock("div", _hoisted_48, [
                  createBaseVNode("button", {
                    onClick: _cache[5] || (_cache[5] = ($event) => isConnected.value ? disconnect() : connect()),
                    class: normalizeClass(["action-btn primary", { connected: isConnected.value, connecting: isConnecting.value }]),
                    disabled: isConnecting.value
                  }, [
                    createVNode(LucideIcon, {
                      name: isConnected.value ? "fa-stop" : isConnecting.value ? "fa-circle-notch" : "fa-play",
                      class: normalizeClass(isConnecting.value ? "animate-spin" : ""),
                      size: 18
                    }, null, 8, ["name", "class"]),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(_ctx.$t(connectLabelKey.value)),
                      1
                      /* TEXT */
                    )
                  ], 10, _hoisted_49),
                  isConnected.value ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    onClick: terminateSession,
                    class: "action-btn danger",
                    disabled: terminatePending.value
                  }, [
                    createVNode(LucideIcon, {
                      name: terminatePending.value ? "fa-circle-notch" : "fa-power-off",
                      class: normalizeClass(terminatePending.value ? "animate-spin" : ""),
                      size: 18
                    }, null, 8, ["name", "class"])
                  ], 8, _hoisted_50)) : createCommentVNode("v-if", true),
                  createBaseVNode("div", _hoisted_51, [
                    createBaseVNode("label", _hoisted_52, [
                      createVNode(unref(NSwitch), {
                        value: inputEnabled.value,
                        "onUpdate:value": _cache[6] || (_cache[6] = ($event) => inputEnabled.value = $event),
                        disabled: !isConnected.value,
                        size: "small"
                      }, null, 8, ["value", "disabled"]),
                      _cache[40] || (_cache[40] = createBaseVNode(
                        "span",
                        null,
                        "Input",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    createBaseVNode("label", _hoisted_53, [
                      createVNode(unref(NSwitch), {
                        value: showOverlay.value,
                        "onUpdate:value": _cache[7] || (_cache[7] = ($event) => showOverlay.value = $event),
                        size: "small"
                      }, null, 8, ["value"]),
                      _cache[41] || (_cache[41] = createBaseVNode(
                        "span",
                        null,
                        "Stats",
                        -1
                        /* CACHED */
                      ))
                    ])
                  ])
                ])) : createCommentVNode("v-if", true),
                createCommentVNode(" Compact Metrics "),
                isConnected.value && !isFullscreen.value && !streamMinimized.value ? (openBlock(), createElementBlock("div", _hoisted_54, [
                  createBaseVNode("div", _hoisted_55, [
                    _cache[42] || (_cache[42] = createBaseVNode(
                      "span",
                      { class: "label" },
                      "Bitrate",
                      -1
                      /* CACHED */
                    )),
                    createBaseVNode(
                      "span",
                      _hoisted_56,
                      toDisplayString(formatKbps(stats.value.videoBitrateKbps)),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("div", _hoisted_57, [
                    _cache[43] || (_cache[43] = createBaseVNode(
                      "span",
                      { class: "label" },
                      "Latency",
                      -1
                      /* CACHED */
                    )),
                    createBaseVNode(
                      "span",
                      _hoisted_58,
                      toDisplayString(formatMs(smoothedLatencyMs.value)),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("div", _hoisted_59, [
                    _cache[44] || (_cache[44] = createBaseVNode(
                      "span",
                      { class: "label" },
                      "FPS",
                      -1
                      /* CACHED */
                    )),
                    createBaseVNode(
                      "span",
                      _hoisted_60,
                      toDisplayString(displayVideoFps.value ? displayVideoFps.value.toFixed(0) : "--"),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("div", _hoisted_61, [
                    _cache[45] || (_cache[45] = createBaseVNode(
                      "span",
                      { class: "label" },
                      "Dropped",
                      -1
                      /* CACHED */
                    )),
                    createBaseVNode(
                      "span",
                      _hoisted_62,
                      toDisplayString(stats.value.videoFramesDropped ?? "--"),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )
          ]),
          createCommentVNode(" Settings Slideout "),
          createVNode(Transition, { name: "slideout" }, {
            default: withCtx(() => [
              showSettings.value ? (openBlock(), createElementBlock("aside", _hoisted_63, [
                createBaseVNode("div", _hoisted_64, [
                  createBaseVNode("h2", null, [
                    createVNode(LucideIcon, {
                      name: "fa-sliders-h",
                      size: 18
                    }),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("webrtc.session_settings")),
                      1
                      /* TEXT */
                    )
                  ]),
                  createBaseVNode("button", {
                    onClick: _cache[8] || (_cache[8] = ($event) => showSettings.value = false),
                    class: "close-btn"
                  }, [
                    createVNode(LucideIcon, {
                      name: "fa-times",
                      size: 16
                    })
                  ])
                ]),
                createBaseVNode("div", _hoisted_65, [
                  createCommentVNode(" Resolution "),
                  createBaseVNode("div", _hoisted_66, [
                    createBaseVNode(
                      "label",
                      _hoisted_67,
                      toDisplayString(_ctx.$t("webrtc.resolution")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_68, [
                      createVNode(unref(NInputNumber), {
                        value: config.width,
                        "onUpdate:value": _cache[9] || (_cache[9] = ($event) => config.width = $event),
                        min: 320,
                        max: 7680,
                        size: "small"
                      }, null, 8, ["value"]),
                      _cache[46] || (_cache[46] = createBaseVNode(
                        "span",
                        { class: "separator" },
                        "×",
                        -1
                        /* CACHED */
                      )),
                      createVNode(unref(NInputNumber), {
                        value: config.height,
                        "onUpdate:value": _cache[10] || (_cache[10] = ($event) => config.height = $event),
                        min: 180,
                        max: 4320,
                        size: "small"
                      }, null, 8, ["value"])
                    ]),
                    createBaseVNode("div", _hoisted_69, [
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[11] || (_cache[11] = ($event) => setResolution(1920, 1080)),
                          class: normalizeClass(["chip", { active: config.width === 1920 && config.height === 1080 }])
                        },
                        " 1080p ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[12] || (_cache[12] = ($event) => setResolution(2560, 1440)),
                          class: normalizeClass(["chip", { active: config.width === 2560 && config.height === 1440 }])
                        },
                        " 1440p ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[13] || (_cache[13] = ($event) => setResolution(3840, 2160)),
                          class: normalizeClass(["chip", { active: config.width === 3840 && config.height === 2160 }])
                        },
                        " 4K ",
                        2
                        /* CLASS */
                      )
                    ])
                  ]),
                  createCommentVNode(" Frame Rate "),
                  createBaseVNode("div", _hoisted_70, [
                    createBaseVNode(
                      "label",
                      _hoisted_71,
                      toDisplayString(_ctx.$t("webrtc.framerate")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_72, [
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[14] || (_cache[14] = ($event) => config.fps = 30),
                          class: normalizeClass(["chip", { active: config.fps === 30 }])
                        },
                        " 30 ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[15] || (_cache[15] = ($event) => config.fps = 60),
                          class: normalizeClass(["chip", { active: config.fps === 60 }])
                        },
                        " 60 ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[16] || (_cache[16] = ($event) => config.fps = 120),
                          class: normalizeClass(["chip", { active: config.fps === 120 }])
                        },
                        " 120 ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[17] || (_cache[17] = ($event) => config.fps = 144),
                          class: normalizeClass(["chip", { active: config.fps === 144 }])
                        },
                        " 144 ",
                        2
                        /* CLASS */
                      )
                    ])
                  ]),
                  createCommentVNode(" Encoding "),
                  createBaseVNode("div", _hoisted_73, [
                    createBaseVNode(
                      "label",
                      _hoisted_74,
                      toDisplayString(_ctx.$t("webrtc.encoding")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_75, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(encodingOptions.value, (opt) => {
                          return openBlock(), createElementBlock("button", mergeProps({
                            key: opt.value,
                            onClick: ($event) => config.encoding = opt.value,
                            class: ["chip", { active: config.encoding === opt.value, unsupported: !opt.supported }]
                          }, { ref_for: true }, !opt.supported && opt.hint ? { title: opt.hint } : {}), toDisplayString(opt.label), 17, _hoisted_76);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  createCommentVNode(" Bitrate "),
                  createBaseVNode("div", _hoisted_77, [
                    createBaseVNode(
                      "label",
                      _hoisted_78,
                      toDisplayString(_ctx.$t("webrtc.bitrate")),
                      1
                      /* TEXT */
                    ),
                    createVNode(unref(NInputNumber), {
                      value: config.bitrateKbps ?? null,
                      "onUpdate:value": _cache[18] || (_cache[18] = (v) => {
                        if (v !== null)
                          config.bitrateKbps = v;
                        else
                          delete config.bitrateKbps;
                      }),
                      min: 500,
                      max: 2e5,
                      size: "small",
                      class: "full-width"
                    }, null, 8, ["value"]),
                    createBaseVNode("div", _hoisted_79, [
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[19] || (_cache[19] = ($event) => config.bitrateKbps = 1e4),
                          class: normalizeClass(["chip", { active: config.bitrateKbps === 1e4 }])
                        },
                        " 10 Mbps ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[20] || (_cache[20] = ($event) => config.bitrateKbps = 3e4),
                          class: normalizeClass(["chip", { active: config.bitrateKbps === 3e4 }])
                        },
                        " 30 Mbps ",
                        2
                        /* CLASS */
                      ),
                      createBaseVNode(
                        "button",
                        {
                          onClick: _cache[21] || (_cache[21] = ($event) => config.bitrateKbps = 6e4),
                          class: normalizeClass(["chip", { active: config.bitrateKbps === 6e4 }])
                        },
                        " 60 Mbps ",
                        2
                        /* CLASS */
                      )
                    ])
                  ]),
                  createCommentVNode(" HDR Toggle "),
                  createBaseVNode("div", _hoisted_80, [
                    createBaseVNode("div", _hoisted_81, [
                      createBaseVNode(
                        "label",
                        _hoisted_82,
                        toDisplayString(_ctx.$t("webrtc.hdr")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        _hoisted_83,
                        toDisplayString(_ctx.$t("webrtc.hdr_desc")),
                        1
                        /* TEXT */
                      )
                    ]),
                    createVNode(unref(NSwitch), {
                      value: config.hdr,
                      "onUpdate:value": _cache[22] || (_cache[22] = ($event) => config.hdr = $event)
                    }, null, 8, ["value"])
                  ]),
                  hdrInlineWarning.value ? (openBlock(), createBlock(unref(NAlert), {
                    key: 0,
                    type: "warning",
                    "show-icon": true,
                    class: "setting-alert"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(
                        toDisplayString(hdrInlineWarning.value),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  })) : createCommentVNode("v-if", true),
                  createCommentVNode(" Mute Host Audio "),
                  createBaseVNode("div", _hoisted_84, [
                    createBaseVNode("div", _hoisted_85, [
                      createBaseVNode(
                        "label",
                        _hoisted_86,
                        toDisplayString(_ctx.$t("webrtc.mute_host_audio")),
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "p",
                        _hoisted_87,
                        toDisplayString(_ctx.$t("webrtc.mute_host_audio_desc")),
                        1
                        /* TEXT */
                      )
                    ]),
                    createVNode(unref(NSwitch), {
                      value: config.muteHostAudio,
                      "onUpdate:value": _cache[23] || (_cache[23] = ($event) => config.muteHostAudio = $event)
                    }, null, 8, ["value"])
                  ]),
                  createCommentVNode(" Frame Pacing "),
                  createBaseVNode("div", _hoisted_88, [
                    createBaseVNode(
                      "label",
                      _hoisted_89,
                      toDisplayString(_ctx.$t("webrtc.frame_pacing")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode(
                      "p",
                      _hoisted_90,
                      toDisplayString(_ctx.$t("webrtc.frame_pacing_desc")),
                      1
                      /* TEXT */
                    ),
                    createBaseVNode("div", _hoisted_91, [
                      (openBlock(), createElementBlock(
                        Fragment,
                        null,
                        renderList(pacingOptions, (opt) => {
                          return createBaseVNode("button", {
                            key: opt.value,
                            onClick: ($event) => applyPacingPreset(opt.value),
                            class: normalizeClass(["chip", { active: config.videoPacingMode === opt.value }]),
                            disabled: isConnected.value
                          }, toDisplayString(opt.label), 11, _hoisted_92);
                        }),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    createBaseVNode("div", _hoisted_93, [
                      createBaseVNode(
                        "label",
                        _hoisted_94,
                        toDisplayString(_ctx.$t("webrtc.frame_pacing_slack")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NInputNumber), {
                        value: config.videoPacingSlackMs ?? null,
                        "onUpdate:value": _cache[24] || (_cache[24] = (v) => {
                          if (v !== null)
                            config.videoPacingSlackMs = v;
                          else
                            delete config.videoPacingSlackMs;
                        }),
                        min: 0,
                        max: 10,
                        size: "small",
                        class: "full-width",
                        disabled: isConnected.value
                      }, null, 8, ["value", "disabled"])
                    ]),
                    createBaseVNode("div", _hoisted_95, [
                      createBaseVNode(
                        "label",
                        _hoisted_96,
                        toDisplayString(_ctx.$t("webrtc.frame_pacing_max_delay")),
                        1
                        /* TEXT */
                      ),
                      createVNode(unref(NInputNumber), {
                        value: maxFrameAgeFrames.value,
                        "onUpdate:value": _cache[25] || (_cache[25] = ($event) => maxFrameAgeFrames.value = $event),
                        min: 1,
                        max: maxAllowedFramesForFps(config.fps),
                        size: "small",
                        class: "full-width",
                        disabled: isConnected.value
                      }, null, 8, ["value", "max", "disabled"])
                    ])
                  ]),
                  createCommentVNode(" Advanced Options "),
                  createBaseVNode("details", _hoisted_97, [
                    createBaseVNode("summary", null, [
                      createVNode(LucideIcon, {
                        name: "fa-cogs",
                        size: 14,
                        class: "inline-block mr-1"
                      }),
                      _cache[47] || (_cache[47] = createTextVNode(
                        " Advanced Options",
                        -1
                        /* CACHED */
                      ))
                    ]),
                    createBaseVNode("div", _hoisted_98, [
                      createBaseVNode("div", _hoisted_99, [
                        _cache[48] || (_cache[48] = createBaseVNode(
                          "div",
                          { class: "toggle-info" },
                          [
                            createBaseVNode("label", { class: "group-label" }, "Auto Fullscreen"),
                            createBaseVNode("p", { class: "hint" }, "Enter fullscreen when stream starts")
                          ],
                          -1
                          /* CACHED */
                        )),
                        createVNode(unref(NSwitch), {
                          value: autoFullscreen.value,
                          "onUpdate:value": _cache[26] || (_cache[26] = ($event) => autoFullscreen.value = $event),
                          size: "small"
                        }, null, 8, ["value"])
                      ])
                    ])
                  ])
                ]),
                createCommentVNode(" Drawer Footer "),
                createBaseVNode("div", _hoisted_100, [
                  createBaseVNode("p", _hoisted_101, [
                    createVNode(LucideIcon, {
                      name: "fa-info-circle",
                      size: 14,
                      class: "inline-block mr-1"
                    }),
                    createTextVNode(
                      " " + toDisplayString(_ctx.$t("webrtc.experimental_notice")),
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
          createCommentVNode(" Backdrop for settings "),
          createVNode(Transition, { name: "fade" }, {
            default: withCtx(() => [
              showSettings.value ? (openBlock(), createElementBlock("div", {
                key: 0,
                class: "drawer-backdrop",
                onClick: _cache[27] || (_cache[27] = ($event) => showSettings.value = false)
              })) : createCommentVNode("v-if", true)
            ]),
            _: 1
            /* STABLE */
          })
        ],
        2
        /* CLASS */
      );
    };
  }
});
const WebRtcClientView_vue_vue_type_style_index_0_scoped_c52d94df_lang = "";
const WebRtcClientView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c52d94df"], ["__file", "C:/Users/Jozh/repos/Jujo.StreamServer/src_assets/common/assets/web/views/WebRtcClientView.vue"]]);
export {
  WebRtcClientView as default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUnRjQ2xpZW50Vmlldy1iOGRmNTQ2Ny5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc2VydmljZXMvd2VicnRjQXBpLnRzIiwiLi4vLi4vdXRpbHMvd2VicnRjL2NsaWVudC50cyIsIi4uLy4uL3V0aWxzL3dlYnJ0Yy9pbnB1dC50cyIsIi4uLy4uL3ZpZXdzL1dlYlJ0Y0NsaWVudFZpZXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQge1xyXG4gIFN0cmVhbUNvbmZpZyxcclxuICBXZWJSdGNJY2VDYW5kaWRhdGUsXHJcbiAgV2ViUnRjQW5zd2VyLFxyXG4gIFdlYlJ0Y09mZmVyLFxyXG4gIFdlYlJ0Y1Nlc3Npb25JbmZvLFxyXG4gIFdlYlJ0Y1Nlc3Npb25TdGF0ZSxcclxufSBmcm9tICdAL3R5cGVzL3dlYnJ0Yyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFdlYlJ0Y0FwaSB7XHJcbiAgY3JlYXRlU2Vzc2lvbihjb25maWc6IFN0cmVhbUNvbmZpZyk6IFByb21pc2U8V2ViUnRjU2Vzc2lvbkluZm8+O1xyXG4gIGdldFNlc3Npb25TdGF0ZShzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8V2ViUnRjU2Vzc2lvbkZldGNoUmVzdWx0PjtcclxuICBzZW5kT2ZmZXIoc2Vzc2lvbklkOiBzdHJpbmcsIG9mZmVyOiBXZWJSdGNPZmZlcik6IFByb21pc2U8V2ViUnRjQW5zd2VyIHwgbnVsbD47XHJcbiAgc2VuZEljZUNhbmRpZGF0ZXMoc2Vzc2lvbklkOiBzdHJpbmcsIGNhbmRpZGF0ZXM6IFJUQ0ljZUNhbmRpZGF0ZUluaXRbXSk6IFByb21pc2U8dm9pZD47XHJcbiAgc2VuZEljZUNhbmRpZGF0ZShzZXNzaW9uSWQ6IHN0cmluZywgY2FuZGlkYXRlOiBSVENJY2VDYW5kaWRhdGVJbml0KTogUHJvbWlzZTx2b2lkPjtcclxuICBzdWJzY3JpYmVSZW1vdGVDYW5kaWRhdGVzKFxyXG4gICAgc2Vzc2lvbklkOiBzdHJpbmcsXHJcbiAgICBvbkNhbmRpZGF0ZTogKGNhbmRpZGF0ZTogUlRDSWNlQ2FuZGlkYXRlSW5pdCkgPT4gdm9pZCxcclxuICApOiAoKSA9PiB2b2lkO1xyXG4gIGVuZFNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcsIG9wdGlvbnM/OiBXZWJSdGNTZXNzaW9uRW5kT3B0aW9ucyk6IFByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2ViUnRjU2Vzc2lvbkZldGNoUmVzdWx0IHtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHNlc3Npb246IFdlYlJ0Y1Nlc3Npb25TdGF0ZSB8IG51bGw7XG4gIGVycm9yPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xufVxuXHJcbmludGVyZmFjZSBXZWJSdGNTZXNzaW9uUmVzcG9uc2Uge1xyXG4gIHN0YXR1cz86IGJvb2xlYW47XHJcbiAgc2Vzc2lvbj86IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgfTtcclxuICBjZXJ0X2ZpbmdlcnByaW50Pzogc3RyaW5nO1xyXG4gIGNlcnRfcGVtPzogc3RyaW5nO1xyXG4gIGljZV9zZXJ2ZXJzPzogUlRDSWNlU2VydmVyW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBXZWJSdGNPZmZlclJlc3BvbnNlIHtcclxuICBzdGF0dXM/OiBib29sZWFuO1xyXG4gIGFuc3dlcl9yZWFkeT86IGJvb2xlYW47XHJcbiAgc2RwPzogc3RyaW5nO1xyXG4gIHR5cGU/OiBSVENTZHBUeXBlO1xyXG4gIGVycm9yPzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgV2ViUnRjU2Vzc2lvblN0YXRlUmVzcG9uc2Uge1xyXG4gIHNlc3Npb24/OiBXZWJSdGNTZXNzaW9uU3RhdGU7XHJcbiAgZXJyb3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBXZWJSdGNJY2VSZXNwb25zZSB7XHJcbiAgc3RhdHVzPzogYm9vbGVhbjtcclxuICBjYW5kaWRhdGVzPzogV2ViUnRjSWNlQ2FuZGlkYXRlW107XHJcbiAgbmV4dF9zaW5jZT86IG51bWJlcjtcclxuICBlcnJvcj86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJSdGNTZXNzaW9uRW5kT3B0aW9ucyB7XHJcbiAga2VlcGFsaXZlPzogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgVklERU9fTUFYX0ZSQU1FX0FHRV9NSU5fTVMgPSA1O1xyXG5jb25zdCBWSURFT19NQVhfRlJBTUVfQUdFX01BWF9NUyA9IDEwMDtcclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVWaWRlb01heEZyYW1lQWdlTXMoY29uZmlnOiBTdHJlYW1Db25maWcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gIGNvbnN0IGZwcyA9XHJcbiAgICB0eXBlb2YgY29uZmlnLmZwcyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKGNvbmZpZy5mcHMpICYmIGNvbmZpZy5mcHMgPiAwID8gY29uZmlnLmZwcyA6IDYwO1xyXG4gIGNvbnN0IG1pbk1zID0gVklERU9fTUFYX0ZSQU1FX0FHRV9NSU5fTVM7XHJcbiAgY29uc3QgbWF4TXMgPSBWSURFT19NQVhfRlJBTUVfQUdFX01BWF9NUztcclxuICBpZiAoXHJcbiAgICB0eXBlb2YgY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMgPT09ICdudW1iZXInICYmXHJcbiAgICBOdW1iZXIuaXNGaW5pdGUoY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMpICYmXHJcbiAgICBjb25maWcudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA+IDBcclxuICApIHtcclxuICAgIGNvbnN0IGZyYW1lcyA9IE1hdGgucm91bmQoY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMpO1xyXG4gICAgY29uc3QgY29tcHV0ZWQgPSBNYXRoLnJvdW5kKCgxMDAwIC8gZnBzKSAqIGZyYW1lcyk7XHJcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGNvbXB1dGVkKSkge1xyXG4gICAgICByZXR1cm4gTWF0aC5taW4obWF4TXMsIE1hdGgubWF4KG1pbk1zLCBjb21wdXRlZCkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAodHlwZW9mIGNvbmZpZy52aWRlb01heEZyYW1lQWdlTXMgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZShjb25maWcudmlkZW9NYXhGcmFtZUFnZU1zKSkge1xyXG4gICAgcmV0dXJuIE1hdGgubWluKG1heE1zLCBNYXRoLm1heChtaW5NcywgTWF0aC5yb3VuZChjb25maWcudmlkZW9NYXhGcmFtZUFnZU1zKSkpO1xyXG4gIH1cclxuICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5jb25zdCB3ZWJydGNBdXRoQ29uZmlnID0gKG92ZXJyaWRlcz86IFJlY29yZDxzdHJpbmcsIGFueT4pID0+XHJcbiAgKHtcclxuICAgIHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlLFxyXG4gICAgX19hbGxvd1VuYXV0aGVudGljYXRlZDogdHJ1ZSxcclxuICAgIC4uLihvdmVycmlkZXMgfHwge30pLFxyXG4gIH0pIGFzIGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBXZWJSdGNIdHRwQXBpIGltcGxlbWVudHMgV2ViUnRjQXBpIHtcclxuICBhc3luYyBjcmVhdGVTZXNzaW9uKGNvbmZpZzogU3RyZWFtQ29uZmlnKTogUHJvbWlzZTxXZWJSdGNTZXNzaW9uSW5mbz4ge1xyXG4gICAgY29uc3QgbXV0ZUhvc3RBdWRpbyA9IGNvbmZpZy5tdXRlSG9zdEF1ZGlvID8/IHRydWU7XHJcbiAgICBjb25zdCB2aWRlb01heEZyYW1lQWdlTXMgPSByZXNvbHZlVmlkZW9NYXhGcmFtZUFnZU1zKGNvbmZpZyk7XHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICBhdWRpbzogdHJ1ZSxcclxuICAgICAgaG9zdF9hdWRpbzogIW11dGVIb3N0QXVkaW8sXHJcbiAgICAgIHZpZGVvOiB0cnVlLFxyXG4gICAgICBlbmNvZGVkOiB0cnVlLFxyXG4gICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgIGZwczogY29uZmlnLmZwcyxcclxuICAgICAgYml0cmF0ZV9rYnBzOiBjb25maWcuYml0cmF0ZUticHMsXHJcbiAgICAgIGNvZGVjOiBjb25maWcuZW5jb2RpbmcsXHJcbiAgICAgIGhkcjogY29uZmlnLmhkcixcclxuICAgICAgYXVkaW9fY2hhbm5lbHM6IGNvbmZpZy5hdWRpb0NoYW5uZWxzLFxyXG4gICAgICBhdWRpb19jb2RlYzogY29uZmlnLmF1ZGlvQ29kZWMsXHJcbiAgICAgIHByb2ZpbGU6IGNvbmZpZy5wcm9maWxlLFxyXG4gICAgICBhcHBfaWQ6IGNvbmZpZy5hcHBJZCxcclxuICAgICAgcmVzdW1lOiBjb25maWcucmVzdW1lLFxyXG4gICAgICB2aWRlb19wYWNpbmdfbW9kZTogY29uZmlnLnZpZGVvUGFjaW5nTW9kZSxcclxuICAgICAgdmlkZW9fcGFjaW5nX3NsYWNrX21zOiBjb25maWcudmlkZW9QYWNpbmdTbGFja01zLFxyXG4gICAgICB2aWRlb19tYXhfZnJhbWVfYWdlX21zOiB2aWRlb01heEZyYW1lQWdlTXMsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgciA9IGF3YWl0IGh0dHAucG9zdDxXZWJSdGNTZXNzaW9uUmVzcG9uc2U+KFxyXG4gICAgICAnL2FwaS93ZWJydGMvc2Vzc2lvbnMnLFxyXG4gICAgICBwYXlsb2FkLFxyXG4gICAgICB3ZWJydGNBdXRoQ29uZmlnKCksXHJcbiAgICApO1xyXG4gICAgaWYgKHIuc3RhdHVzICE9PSAyMDAgfHwgIXIuZGF0YT8uc2Vzc2lvbj8uaWQpIHtcclxuICAgICAgY29uc3QgZGV0YWlsID0gci5kYXRhID8gSlNPTi5zdHJpbmdpZnkoci5kYXRhKSA6ICdubyByZXNwb25zZSBib2R5JztcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIFdlYlJUQyBzZXNzaW9uIChIVFRQICR7ci5zdGF0dXN9KTogJHtkZXRhaWx9YCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xuICAgICAgc2Vzc2lvbklkOiByLmRhdGEuc2Vzc2lvbi5pZCxcbiAgICAgIGljZVNlcnZlcnM6IHIuZGF0YS5pY2Vfc2VydmVycyA/PyBbXSxcbiAgICAgIC4uLihyLmRhdGEuY2VydF9maW5nZXJwcmludCAhPT0gdW5kZWZpbmVkID8geyBjZXJ0RmluZ2VycHJpbnQ6IHIuZGF0YS5jZXJ0X2ZpbmdlcnByaW50IH0gOiB7fSksXG4gICAgICAuLi4oci5kYXRhLmNlcnRfcGVtICE9PSB1bmRlZmluZWQgPyB7IGNlcnRQZW06IHIuZGF0YS5jZXJ0X3BlbSB9IDoge30pLFxuICAgIH07XG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0U2Vzc2lvblN0YXRlKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTxXZWJSdGNTZXNzaW9uRmV0Y2hSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldDxXZWJSdGNTZXNzaW9uU3RhdGVSZXNwb25zZT4oXHJcbiAgICAgIGAvYXBpL3dlYnJ0Yy9zZXNzaW9ucy8ke2VuY29kZVVSSUNvbXBvbmVudChzZXNzaW9uSWQpfWAsXHJcbiAgICAgIHdlYnJ0Y0F1dGhDb25maWcoKSxcclxuICAgICk7XHJcbiAgICBpZiAoci5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgY29uc3QgZXJyb3IgPSByLmRhdGE/LmVycm9yID8gU3RyaW5nKHIuZGF0YS5lcnJvcikgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4geyBzdGF0dXM6IHIuc3RhdHVzLCBzZXNzaW9uOiBudWxsLCAuLi4oZXJyb3IgIT09IHVuZGVmaW5lZCA/IHsgZXJyb3IgfSA6IHt9KSB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiByLnN0YXR1cyxcbiAgICAgIHNlc3Npb246IHIuZGF0YT8uc2Vzc2lvbiA/PyBudWxsLFxuICAgICAgLi4uKHIuZGF0YT8uZXJyb3IgIT09IHVuZGVmaW5lZCA/IHsgZXJyb3I6IHIuZGF0YS5lcnJvciB9IDoge30pLFxuICAgIH07XG4gIH1cblxyXG4gIGFzeW5jIHNlbmRPZmZlcihzZXNzaW9uSWQ6IHN0cmluZywgb2ZmZXI6IFdlYlJ0Y09mZmVyKTogUHJvbWlzZTxXZWJSdGNBbnN3ZXIgfCBudWxsPiB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgaHR0cC5wb3N0PFdlYlJ0Y09mZmVyUmVzcG9uc2U+KFxyXG4gICAgICBgL2FwaS93ZWJydGMvc2Vzc2lvbnMvJHtlbmNvZGVVUklDb21wb25lbnQoc2Vzc2lvbklkKX0vb2ZmZXJgLFxyXG4gICAgICBvZmZlcixcclxuICAgICAgd2VicnRjQXV0aENvbmZpZygpLFxyXG4gICAgKTtcclxuICAgIGlmIChyLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgIGNvbnN0IGRldGFpbCA9IHIuZGF0YSA/IEpTT04uc3RyaW5naWZ5KHIuZGF0YSkgOiAnbm8gcmVzcG9uc2UgYm9keSc7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBvc3QgV2ViUlRDIG9mZmVyIChIVFRQICR7ci5zdGF0dXN9KTogJHtkZXRhaWx9YCk7XHJcbiAgICB9XHJcbiAgICBpZiAoci5kYXRhPy5lcnJvciAmJiByLmRhdGEuZXJyb3IgIT09ICdBbnN3ZXIgbm90IHJlYWR5Jykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwb3N0IFdlYlJUQyBvZmZlcjogJHtyLmRhdGEuZXJyb3J9YCk7XHJcbiAgICB9XHJcbiAgICBpZiAoci5kYXRhPy5hbnN3ZXJfcmVhZHkgJiYgci5kYXRhLnNkcCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiByLmRhdGEudHlwZSA/PyAnYW5zd2VyJywgc2RwOiByLmRhdGEuc2RwIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy53YWl0Rm9yQW5zd2VyKHNlc3Npb25JZCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZW5kSWNlQ2FuZGlkYXRlKHNlc3Npb25JZDogc3RyaW5nLCBjYW5kaWRhdGU6IFJUQ0ljZUNhbmRpZGF0ZUluaXQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGF3YWl0IHRoaXMuc2VuZEljZUNhbmRpZGF0ZXMoc2Vzc2lvbklkLCBbY2FuZGlkYXRlXSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZW5kSWNlQ2FuZGlkYXRlcyhzZXNzaW9uSWQ6IHN0cmluZywgY2FuZGlkYXRlczogUlRDSWNlQ2FuZGlkYXRlSW5pdFtdKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBwYXlsb2FkID0gY2FuZGlkYXRlc1xyXG4gICAgICAuZmlsdGVyKChjYW5kaWRhdGUpID0+IEJvb2xlYW4oY2FuZGlkYXRlLmNhbmRpZGF0ZSkpXHJcbiAgICAgIC5zbGljZSgwLCAyNTYpXHJcbiAgICAgIC5tYXAoKGNhbmRpZGF0ZSkgPT4gKHtcclxuICAgICAgICBzZHBNaWQ6IGNhbmRpZGF0ZS5zZHBNaWQsXHJcbiAgICAgICAgc2RwTUxpbmVJbmRleDogY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXgsXHJcbiAgICAgICAgY2FuZGlkYXRlOiBjYW5kaWRhdGUuY2FuZGlkYXRlLFxyXG4gICAgICB9KSk7XHJcbiAgICBpZiAoIXBheWxvYWQubGVuZ3RoKSByZXR1cm47XHJcbiAgICBhd2FpdCBodHRwLnBvc3QoXHJcbiAgICAgIGAvYXBpL3dlYnJ0Yy9zZXNzaW9ucy8ke2VuY29kZVVSSUNvbXBvbmVudChzZXNzaW9uSWQpfS9pY2VgLFxyXG4gICAgICB7IGNhbmRpZGF0ZXM6IHBheWxvYWQgfSxcclxuICAgICAgd2VicnRjQXV0aENvbmZpZygpLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHN1YnNjcmliZVJlbW90ZUNhbmRpZGF0ZXMoXHJcbiAgICBzZXNzaW9uSWQ6IHN0cmluZyxcclxuICAgIG9uQ2FuZGlkYXRlOiAoY2FuZGlkYXRlOiBSVENJY2VDYW5kaWRhdGVJbml0KSA9PiB2b2lkLFxyXG4gICk6ICgpID0+IHZvaWQge1xyXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZTtcclxuICAgIGxldCBsYXN0SW5kZXggPSAwO1xyXG4gICAgbGV0IHBvbGxUaW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gICAgbGV0IGV2ZW50U291cmNlOiBFdmVudFNvdXJjZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IHN0b3BQb2xsaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAocG9sbFRpbWVyKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChwb2xsVGltZXIpO1xyXG4gICAgICAgIHBvbGxUaW1lciA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoc3RvcHBlZCkgcmV0dXJuO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCBodHRwLmdldDxXZWJSdGNJY2VSZXNwb25zZT4oXHJcbiAgICAgICAgICBgL2FwaS93ZWJydGMvc2Vzc2lvbnMvJHtlbmNvZGVVUklDb21wb25lbnQoc2Vzc2lvbklkKX0vaWNlYCxcclxuICAgICAgICAgIHdlYnJ0Y0F1dGhDb25maWcoeyBwYXJhbXM6IHsgc2luY2U6IGxhc3RJbmRleCB9IH0pLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHIuc3RhdHVzID09PSAyMDAgJiYgQXJyYXkuaXNBcnJheShyLmRhdGE/LmNhbmRpZGF0ZXMpKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiByLmRhdGEuY2FuZGlkYXRlcykge1xyXG4gICAgICAgICAgICBvbkNhbmRpZGF0ZSh7XHJcbiAgICAgICAgICAgICAgc2RwTWlkOiBjYW5kaWRhdGUuc2RwTWlkLFxyXG4gICAgICAgICAgICAgIHNkcE1MaW5lSW5kZXg6IGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4LFxyXG4gICAgICAgICAgICAgIGNhbmRpZGF0ZTogY2FuZGlkYXRlLmNhbmRpZGF0ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FuZGlkYXRlLmluZGV4ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgIGxhc3RJbmRleCA9IE1hdGgubWF4KGxhc3RJbmRleCwgY2FuZGlkYXRlLmluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiByLmRhdGEubmV4dF9zaW5jZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgbGFzdEluZGV4ID0gTWF0aC5tYXgobGFzdEluZGV4LCByLmRhdGEubmV4dF9zaW5jZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG4gICAgICBpZiAoIXN0b3BwZWQpIHtcclxuICAgICAgICBwb2xsVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChwb2xsLCAxMDAwKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzdGFydFBvbGxpbmcgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChwb2xsVGltZXIgfHwgc3RvcHBlZCkgcmV0dXJuO1xyXG4gICAgICBwb2xsKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGV2ZW50U291cmNlID0gbmV3IEV2ZW50U291cmNlKFxyXG4gICAgICAgIGAvYXBpL3dlYnJ0Yy9zZXNzaW9ucy8ke2VuY29kZVVSSUNvbXBvbmVudChzZXNzaW9uSWQpfS9pY2Uvc3RyZWFtP3NpbmNlPSR7bGFzdEluZGV4fWAsXHJcbiAgICAgICk7XHJcbiAgICAgIGV2ZW50U291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbmRpZGF0ZScsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChzdG9wcGVkKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnBhcnNlKChldmVudCBhcyBNZXNzYWdlRXZlbnQpLmRhdGEpIGFzIFdlYlJ0Y0ljZUNhbmRpZGF0ZTtcclxuICAgICAgICAgIG9uQ2FuZGlkYXRlKHtcclxuICAgICAgICAgICAgc2RwTWlkOiBwYXlsb2FkLnNkcE1pZCxcclxuICAgICAgICAgICAgc2RwTUxpbmVJbmRleDogcGF5bG9hZC5zZHBNTGluZUluZGV4LFxyXG4gICAgICAgICAgICBjYW5kaWRhdGU6IHBheWxvYWQuY2FuZGlkYXRlLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb25zdCBpZCA9IChldmVudCBhcyBNZXNzYWdlRXZlbnQpLmxhc3RFdmVudElkO1xyXG4gICAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlci5wYXJzZUludChpZCwgMTApO1xyXG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XHJcbiAgICAgICAgICAgICAgbGFzdEluZGV4ID0gTWF0aC5tYXgobGFzdEluZGV4LCBwYXJzZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBldmVudFNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdrZWVwYWxpdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgfSk7XHJcbiAgICAgIGV2ZW50U291cmNlLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHN0b3BwZWQpIHJldHVybjtcclxuICAgICAgICBldmVudFNvdXJjZT8uY2xvc2UoKTtcclxuICAgICAgICBldmVudFNvdXJjZSA9IG51bGw7XHJcbiAgICAgICAgc3RhcnRQb2xsaW5nKCk7XHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgc3RhcnRQb2xsaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgc3RvcHBlZCA9IHRydWU7XHJcbiAgICAgIHN0b3BQb2xsaW5nKCk7XHJcbiAgICAgIGlmIChldmVudFNvdXJjZSkge1xyXG4gICAgICAgIGV2ZW50U291cmNlLmNsb3NlKCk7XHJcbiAgICAgICAgZXZlbnRTb3VyY2UgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZW5kU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZywgb3B0aW9ucz86IFdlYlJ0Y1Nlc3Npb25FbmRPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAob3B0aW9ucz8ua2VlcGFsaXZlICYmIHR5cGVvZiBmZXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGZldGNoKGAvYXBpL3dlYnJ0Yy9zZXNzaW9ucy8ke2VuY29kZVVSSUNvbXBvbmVudChzZXNzaW9uSWQpfWAsIHtcclxuICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXHJcbiAgICAgICAgICBrZWVwYWxpdmU6IHRydWUsXHJcbiAgICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGF3YWl0IGh0dHAuZGVsZXRlKFxyXG4gICAgICBgL2FwaS93ZWJydGMvc2Vzc2lvbnMvJHtlbmNvZGVVUklDb21wb25lbnQoc2Vzc2lvbklkKX1gLFxyXG4gICAgICB3ZWJydGNBdXRoQ29uZmlnKCksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyB3YWl0Rm9yQW5zd2VyKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTxXZWJSdGNBbnN3ZXIgfCBudWxsPiB7XHJcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XHJcbiAgICBjb25zdCB0aW1lb3V0TXMgPSAzMDAwMDtcclxuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB0aW1lb3V0TXMpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByID0gYXdhaXQgaHR0cC5nZXQ8V2ViUnRjT2ZmZXJSZXNwb25zZT4oXHJcbiAgICAgICAgICBgL2FwaS93ZWJydGMvc2Vzc2lvbnMvJHtlbmNvZGVVUklDb21wb25lbnQoc2Vzc2lvbklkKX0vYW5zd2VyYCxcclxuICAgICAgICAgIHdlYnJ0Y0F1dGhDb25maWcoKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChyLnN0YXR1cyA9PT0gMjAwICYmIHIuZGF0YT8uZXJyb3IgJiYgci5kYXRhLmVycm9yICE9PSAnQW5zd2VyIG5vdCByZWFkeScpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIFdlYlJUQyBhbnN3ZXI6ICR7ci5kYXRhLmVycm9yfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoci5zdGF0dXMgPT09IDIwMCAmJiByLmRhdGE/LnNkcCkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogci5kYXRhLnR5cGUgPz8gJ2Fuc3dlcicsIHNkcDogci5kYXRhLnNkcCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoci5zdGF0dXMgPT09IDQwMCAmJiByLmRhdGE/LmVycm9yICYmIHIuZGF0YS5lcnJvciAhPT0gJ0Fuc3dlciBub3QgcmVhZHknKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBXZWJSVEMgYW5zd2VyOiAke3IuZGF0YS5lcnJvcn1gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB3aW5kb3cuc2V0VGltZW91dChyZXNvbHZlLCAzMDApKTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBXZWJSdGNBcGkgfSBmcm9tICdAL3NlcnZpY2VzL3dlYnJ0Y0FwaSc7XHJcbmltcG9ydCB7IEdhbWVwYWRGZWVkYmFja01lc3NhZ2UsIFN0cmVhbUNvbmZpZywgV2ViUnRjU3RhdHNTbmFwc2hvdCB9IGZyb20gJ0AvdHlwZXMvd2VicnRjJztcclxuXHJcbi8vIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBtYXkgYmUgYWJzZW50IGZyb20gb2xkZXIgbGliLmRvbSB2ZXJzaW9uczsgZGVjbGFyZSBhIGNvbXBhdGlibGUgbG9jYWwgdHlwZVxyXG50eXBlIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSA9IHsgbWltZVR5cGU6IHN0cmluZzsgY2xvY2tSYXRlOiBudW1iZXI7IGNoYW5uZWxzPzogbnVtYmVyOyBzZHBGbXRwTGluZT86IHN0cmluZyB9O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJSdGNDbGllbnRDYWxsYmFja3Mge1xyXG4gIG9uUmVtb3RlU3RyZWFtPzogKHN0cmVhbTogTWVkaWFTdHJlYW0pID0+IHZvaWQ7XHJcbiAgb25Db25uZWN0aW9uU3RhdGU/OiAoc3RhdGU6IFJUQ1BlZXJDb25uZWN0aW9uU3RhdGUpID0+IHZvaWQ7XHJcbiAgb25JY2VTdGF0ZT86IChzdGF0ZTogUlRDSWNlQ29ubmVjdGlvblN0YXRlKSA9PiB2b2lkO1xyXG4gIG9uSW5wdXRDaGFubmVsU3RhdGU/OiAoc3RhdGU6IFJUQ0RhdGFDaGFubmVsU3RhdGUpID0+IHZvaWQ7XHJcbiAgb25TdGF0cz86IChzdGF0czogV2ViUnRjU3RhdHNTbmFwc2hvdCkgPT4gdm9pZDtcclxuICBvbklucHV0TWVzc2FnZT86IChtZXNzYWdlOiBHYW1lcGFkRmVlZGJhY2tNZXNzYWdlKSA9PiB2b2lkO1xyXG4gIG9uTmVnb3RpYXRlZEVuY29kaW5nPzogKGVuY29kaW5nOiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgb25XYXJuaW5nPzogKHdhcm5pbmc6IHN0cmluZykgPT4gdm9pZDtcclxuICBvbkVycm9yPzogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJSdGNDbGllbnRDb25uZWN0T3B0aW9ucyB7XHJcbiAgaW5wdXRQcmlvcml0eT86IFJUQ1ByaW9yaXR5VHlwZTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJSdGNEaXNjb25uZWN0T3B0aW9ucyB7XHJcbiAga2VlcGFsaXZlPzogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFN0YXRzU3RhdGUge1xyXG4gIGxhc3RWaWRlb0luYm91bmRJZD86IHN0cmluZztcclxuICBsYXN0QXVkaW9JbmJvdW5kSWQ/OiBzdHJpbmc7XHJcbiAgbGFzdFZpZGVvQnl0ZXM/OiBudW1iZXI7XHJcbiAgbGFzdEF1ZGlvQnl0ZXM/OiBudW1iZXI7XHJcbiAgbGFzdFRpbWVzdGFtcE1zPzogbnVtYmVyO1xyXG4gIGxhc3RWaWRlb0ppdHRlckJ1ZmZlckRlbGF5PzogbnVtYmVyO1xyXG4gIGxhc3RWaWRlb0ppdHRlckJ1ZmZlckVtaXR0ZWRDb3VudD86IG51bWJlcjtcclxuICBsYXN0QXVkaW9KaXR0ZXJCdWZmZXJEZWxheT86IG51bWJlcjtcclxuICBsYXN0QXVkaW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQ/OiBudW1iZXI7XHJcbiAgbGFzdFZpZGVvVG90YWxEZWNvZGVUaW1lPzogbnVtYmVyO1xyXG4gIGxhc3RWaWRlb0ZyYW1lc0RlY29kZWQ/OiBudW1iZXI7XHJcbiAgbGFzdFZpZGVvRnJhbWVzUmVjZWl2ZWQ/OiBudW1iZXI7XHJcbn1cclxuXHJcbmNvbnN0IEVOQ09ESU5HX01JTUU6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcclxuICBoMjY0OiBbJ3ZpZGVvL2gyNjQnXSxcclxuICBoZXZjOiBbJ3ZpZGVvL2gyNjUnLCAndmlkZW8vaGV2YyddLFxyXG4gIGF2MTogWyd2aWRlby9hdjEnXSxcclxufTtcclxuY29uc3QgREVGQVVMVF9BVURJT19KSVRURVJfVEFSR0VUX01TID0gMjA7XHJcbmNvbnN0IERFRkFVTFRfQVVESU9fUExBWU9VVF9ERUxBWV9NUyA9IDIwO1xyXG5jb25zdCBSRUNFSVZFUl9ISU5UX1JFRlJFU0hfTVMgPSAyNTA7XHJcbmNvbnN0IFNUQVRTX1BPTExfRkFTVF9NUyA9IDI1MDtcclxuY29uc3QgU1RBVFNfUE9MTF9TTE9XX01TID0gMTAwMDtcclxuY29uc3QgU1RBVFNfUE9MTF9GQVNUX0JPT1RfTVMgPSAxMDAwMDtcclxuY29uc3QgU1RBVFNfUE9MTF9GQVNUX0hPTERfTVMgPSAyNTAwO1xyXG5jb25zdCBTVEFUU19QT0xMX0ZBU1RfSklUVEVSX1RIUkVTSE9MRF9NUyA9IDYwO1xyXG5jb25zdCBJQ0VfQ0FORElEQVRFX0JBVENIX1dJTkRPV19NUyA9IDc1O1xyXG5jb25zdCBJQ0VfQ0FORElEQVRFX0JBVENIX0xJTUlUID0gMjU2O1xyXG5cclxuZnVuY3Rpb24gZ2V0VmlkZW9Db2RlY0NhcGFiaWxpdGllcygpOiBSVENSdHBDYXBhYmlsaXRpZXMgfCBudWxsIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVjZWl2ZXJDYXBzID1cclxuICAgICAgdHlwZW9mIFJUQ1J0cFJlY2VpdmVyICE9PSAndW5kZWZpbmVkJyA/IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcz8uKCd2aWRlbycpIDogbnVsbDtcclxuICAgIGlmIChyZWNlaXZlckNhcHM/LmNvZGVjcz8ubGVuZ3RoKSByZXR1cm4gcmVjZWl2ZXJDYXBzO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZW5kZXJDYXBzID1cclxuICAgICAgdHlwZW9mIFJUQ1J0cFNlbmRlciAhPT0gJ3VuZGVmaW5lZCcgPyBSVENSdHBTZW5kZXIuZ2V0Q2FwYWJpbGl0aWVzPy4oJ3ZpZGVvJykgOiBudWxsO1xyXG4gICAgaWYgKHNlbmRlckNhcHM/LmNvZGVjcz8ubGVuZ3RoKSByZXR1cm4gc2VuZGVyQ2FwcztcclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUVuY29kaW5nUHJlZmVyZW5jZShlbmNvZGluZzogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtaW1lcyA9IEVOQ09ESU5HX01JTUVbZW5jb2RpbmcudG9Mb3dlckNhc2UoKV07XHJcbiAgaWYgKCFtaW1lcykgcmV0dXJuIGVuY29kaW5nO1xyXG4gIGNvbnN0IGNhcHMgPSBnZXRWaWRlb0NvZGVjQ2FwYWJpbGl0aWVzKCk7XHJcbiAgaWYgKCFjYXBzPy5jb2RlY3MpIHJldHVybiBlbmNvZGluZztcclxuICBjb25zdCBzdXBwb3J0ZWQgPSBjYXBzLmNvZGVjcy5zb21lKChjb2RlYykgPT4gbWltZXMuaW5jbHVkZXMoY29kZWMubWltZVR5cGUudG9Mb3dlckNhc2UoKSkpO1xyXG4gIHJldHVybiBzdXBwb3J0ZWQgPyBlbmNvZGluZyA6ICdoMjY0JztcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VGbXRwUGFyYW1zKGZtdHBMaW5lPzogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XHJcbiAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgaWYgKCFmbXRwTGluZSkgcmV0dXJuIHBhcmFtcztcclxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGZtdHBMaW5lLnNwbGl0KCc7JykpIHtcclxuICAgIGNvbnN0IHRyaW1tZWQgPSBlbnRyeS50cmltKCk7XHJcbiAgICBpZiAoIXRyaW1tZWQpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgZXEgPSB0cmltbWVkLmluZGV4T2YoJz0nKTtcclxuICAgIGlmIChlcSA9PT0gLTEpIHtcclxuICAgICAgcGFyYW1zW3RyaW1tZWQudG9Mb3dlckNhc2UoKV0gPSAnJztcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBrZXkgPSB0cmltbWVkLnNsaWNlKDAsIGVxKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGNvbnN0IHZhbHVlID0gdHJpbW1lZC5zbGljZShlcSArIDEpLnRyaW0oKTtcclxuICAgIGlmIChrZXkpIHtcclxuICAgICAgcGFyYW1zW2tleV0gPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHBhcmFtcztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm10cFBhcmFtKGZtdHBMaW5lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgY29uc3QgcGFyYW1zID0gcGFyc2VGbXRwUGFyYW1zKGZtdHBMaW5lKTtcclxuICBjb25zdCB2YWx1ZSA9IHBhcmFtc1trZXkudG9Mb3dlckNhc2UoKV07XHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09ICcnKSByZXR1cm4gbnVsbDtcclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvZGVjQ2Fwc0ZvckVuY29kaW5nKGVuY29kaW5nOiBzdHJpbmcpOiBSVENSdHBDb2RlY0NhcGFiaWxpdHlbXSB7XHJcbiAgY29uc3QgbWltZXMgPSBFTkNPRElOR19NSU1FW2VuY29kaW5nLnRvTG93ZXJDYXNlKCldO1xyXG4gIGlmICghbWltZXMpIHJldHVybiBbXTtcclxuICBjb25zdCBjYXBzID0gZ2V0VmlkZW9Db2RlY0NhcGFiaWxpdGllcygpO1xyXG4gIGlmICghY2Fwcz8uY29kZWNzPy5sZW5ndGgpIHJldHVybiBbXTtcclxuICByZXR1cm4gY2Fwcy5jb2RlY3MuZmlsdGVyKChjb2RlYykgPT4gbWltZXMuaW5jbHVkZXMoY29kZWMubWltZVR5cGUudG9Mb3dlckNhc2UoKSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0hldmNIZHJDb2RlYyhjb2RlYzogUlRDUnRwQ29kZWNDYXBhYmlsaXR5KTogYm9vbGVhbiB7XHJcbiAgY29uc3QgcHJvZmlsZUlkID0gZ2V0Rm10cFBhcmFtKGNvZGVjLnNkcEZtdHBMaW5lID8/IHVuZGVmaW5lZCwgJ3Byb2ZpbGUtaWQnKTtcclxuICBpZiAoIXByb2ZpbGVJZCkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gcHJvZmlsZUlkICE9PSAnMSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc0hldmNIZHJTdXBwb3J0KCk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IGhldmNDYXBzID0gZ2V0Q29kZWNDYXBzRm9yRW5jb2RpbmcoJ2hldmMnKTtcclxuICByZXR1cm4gaGV2Y0NhcHMuc29tZSgoY29kZWMpID0+IGlzSGV2Y0hkckNvZGVjKGNvZGVjKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN1cHBvcnRzSGRyRW5jb2RpbmcoZW5jb2Rpbmc6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBlbmNvZGluZy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChub3JtYWxpemVkID09PSAnaGV2YycpIHtcclxuICAgIHJldHVybiBoYXNIZXZjSGRyU3VwcG9ydCgpO1xyXG4gIH1cclxuICBpZiAobm9ybWFsaXplZCA9PT0gJ2F2MScpIHtcclxuICAgIHJldHVybiBnZXRDb2RlY0NhcHNGb3JFbmNvZGluZygnYXYxJykubGVuZ3RoID4gMDtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPZmZlcmVkVmlkZW9Db2RlY05hbWVzKHNkcDogc3RyaW5nKTogU2V0PHN0cmluZz4ge1xyXG4gIGNvbnN0IGNvZGVjcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gIGlmICghc2RwKSByZXR1cm4gY29kZWNzO1xyXG4gIGNvbnN0IGxpbmVzID0gc2RwLnNwbGl0KC9cXHJcXG4vKTtcclxuICBsZXQgaW5WaWRlbyA9IGZhbHNlO1xyXG5cclxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ209JykpIHtcclxuICAgICAgaW5WaWRlbyA9IGxpbmUuc3RhcnRzV2l0aCgnbT12aWRlbycpO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGlmICghaW5WaWRlbyB8fCAhbGluZS5zdGFydHNXaXRoKCdhPXJ0cG1hcDonKSkgY29udGludWU7XHJcbiAgICBjb25zdCByZXN0ID0gbGluZS5zbGljZSgnYT1ydHBtYXA6Jy5sZW5ndGgpO1xyXG4gICAgY29uc3Qgc3BhY2UgPSByZXN0LmluZGV4T2YoJyAnKTtcclxuICAgIGlmIChzcGFjZSA8IDApIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgY29kZWNQYXJ0ID0gcmVzdC5zbGljZShzcGFjZSArIDEpLnRyaW0oKTtcclxuICAgIGlmICghY29kZWNQYXJ0KSBjb250aW51ZTtcclxuICAgIGNvbnN0IHNsYXNoID0gY29kZWNQYXJ0LmluZGV4T2YoJy8nKTtcclxuICAgIGNvbnN0IGNvZGVjTmFtZSA9IChzbGFzaCA+PSAwID8gY29kZWNQYXJ0LnNsaWNlKDAsIHNsYXNoKSA6IGNvZGVjUGFydCkudHJpbSgpO1xyXG4gICAgaWYgKGNvZGVjTmFtZSkgY29kZWNzLmFkZChjb2RlY05hbWUudG9Mb3dlckNhc2UoKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29kZWNzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvZmZlclN1cHBvcnRzRW5jb2Rpbmcoc2RwOiBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBjb25zdCBvZmZlcmVkID0gZ2V0T2ZmZXJlZFZpZGVvQ29kZWNOYW1lcyhzZHApO1xyXG4gIGlmICghb2ZmZXJlZC5zaXplKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGVuY29kaW5nLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKG5vcm1hbGl6ZWQgPT09ICdoZXZjJykgcmV0dXJuIG9mZmVyZWQuaGFzKCdoMjY1JykgfHwgb2ZmZXJlZC5oYXMoJ2hldmMnKTtcclxuICBpZiAobm9ybWFsaXplZCA9PT0gJ2F2MScpIHJldHVybiBvZmZlcmVkLmhhcygnYXYxJykgfHwgb2ZmZXJlZC5oYXMoJ2F2MXgnKTtcclxuICBpZiAobm9ybWFsaXplZCA9PT0gJ2gyNjQnKSByZXR1cm4gb2ZmZXJlZC5oYXMoJ2gyNjQnKTtcclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VPZmZlcmVkQ29kZWNOYW1lc0Zyb21FcnJvcihtZXNzYWdlOiBzdHJpbmcpOiBTZXQ8c3RyaW5nPiB7XHJcbiAgY29uc3Qgb2ZmZXJlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gIGNvbnN0IG1hdGNoID0gbWVzc2FnZS5tYXRjaCgvXFwob2ZmZXJlZDpcXHMqKFteKV0rKVxcKVxccyokL2kpO1xyXG4gIGlmICghbWF0Y2gpIHJldHVybiBvZmZlcmVkO1xyXG4gIGNvbnN0IHJhdyA9IG1hdGNoWzFdIS50cmltKCk7XHJcbiAgaWYgKCFyYXcgfHwgcmF3LnRvTG93ZXJDYXNlKCkgPT09ICdub25lJykgcmV0dXJuIG9mZmVyZWQ7XHJcbiAgZm9yIChjb25zdCBwYXJ0IG9mIHJhdy5zcGxpdCgnLCcpKSB7XHJcbiAgICBjb25zdCBuYW1lID0gcGFydC50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChuYW1lKSBvZmZlcmVkLmFkZChuYW1lKTtcclxuICB9XHJcbiAgcmV0dXJuIG9mZmVyZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5Q29kZWNQcmVmZXJlbmNlcyhcclxuICB0cmFuc2NlaXZlcjogUlRDUnRwVHJhbnNjZWl2ZXIgfCBudWxsLFxyXG4gIGVuY29kaW5nOiBzdHJpbmcsXHJcbiAgcHJlZmVySGRyID0gZmFsc2UsXHJcbik6IHZvaWQge1xyXG4gIGlmICghdHJhbnNjZWl2ZXIpIHJldHVybjtcclxuICBjb25zdCBjYXBzID0gZ2V0VmlkZW9Db2RlY0NhcGFiaWxpdGllcygpO1xyXG4gIGlmICghY2Fwcz8uY29kZWNzKSByZXR1cm47XHJcbiAgY29uc3QgbWltZXMgPSBFTkNPRElOR19NSU1FW2VuY29kaW5nLnRvTG93ZXJDYXNlKCldO1xyXG4gIGlmICghbWltZXMpIHJldHVybjtcclxuICBjb25zdCBwcmVmZXJyZWQgPSBjYXBzLmNvZGVjcy5maWx0ZXIoKGNvZGVjKSA9PiBtaW1lcy5pbmNsdWRlcyhjb2RlYy5taW1lVHlwZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgaWYgKCFwcmVmZXJyZWQubGVuZ3RoKSByZXR1cm47XHJcbiAgbGV0IGZpbHRlcmVkUHJlZmVycmVkID0gcHJlZmVycmVkO1xyXG4gIGlmIChwcmVmZXJIZHIgJiYgKG1pbWVzLmluY2x1ZGVzKCd2aWRlby9oZXZjJykgfHwgbWltZXMuaW5jbHVkZXMoJ3ZpZGVvL2gyNjUnKSkpIHtcclxuICAgIGNvbnN0IGhkclByZWZlcnJlZCA9IHByZWZlcnJlZC5maWx0ZXIoKGNvZGVjKSA9PiBpc0hldmNIZHJDb2RlYyhjb2RlYykpO1xyXG4gICAgaWYgKGhkclByZWZlcnJlZC5sZW5ndGgpIHtcclxuICAgICAgZmlsdGVyZWRQcmVmZXJyZWQgPSBoZHJQcmVmZXJyZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChtaW1lcy5pbmNsdWRlcygndmlkZW8vaDI2NCcpKSB7XHJcbiAgICBjb25zdCBwYWNrZXRpemF0aW9uTW9kZTEgPSBwcmVmZXJyZWQuZmlsdGVyKChjb2RlYykgPT5cclxuICAgICAgLyg/Ol58OylcXHMqcGFja2V0aXphdGlvbi1tb2RlPTEoPzo7fCQpL2kudGVzdChjb2RlYy5zZHBGbXRwTGluZSA/PyAnJyksXHJcbiAgICApO1xyXG4gICAgaWYgKHBhY2tldGl6YXRpb25Nb2RlMS5sZW5ndGgpIHtcclxuICAgICAgLy8gUHJlZmVyIEguMjY0IHBhY2tldGl6YXRpb24tbW9kZT0xIHRvIGF2b2lkIHJlY2VpdmVyIGFzc2VtYmx5IG1pc21hdGNoZXMuXHJcbiAgICAgIGZpbHRlcmVkUHJlZmVycmVkID0gcGFja2V0aXphdGlvbk1vZGUxO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCByZXN0ID0gY2Fwcy5jb2RlY3MuZmlsdGVyKChjb2RlYykgPT4gIW1pbWVzLmluY2x1ZGVzKGNvZGVjLm1pbWVUeXBlLnRvTG93ZXJDYXNlKCkpKTtcclxuICB0cnkge1xyXG4gICAgdHJhbnNjZWl2ZXIuc2V0Q29kZWNQcmVmZXJlbmNlcyhbLi4uZmlsdGVyZWRQcmVmZXJyZWQsIC4uLnJlc3RdKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlJbml0aWFsQml0cmF0ZUhpbnRzKHNkcDogc3RyaW5nLCBiaXRyYXRlS2Jwcz86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgaWYgKCFzZHAgfHwgIWJpdHJhdGVLYnBzIHx8IGJpdHJhdGVLYnBzIDw9IDApIHJldHVybiBzZHA7XHJcbiAgY29uc3Qgbm9ybWFsaXplZEJpdHJhdGVLYnBzID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChiaXRyYXRlS2JwcykpO1xyXG4gIGNvbnN0IGJpdHJhdGVCcHMgPSBub3JtYWxpemVkQml0cmF0ZUticHMgKiAxMDAwO1xyXG4gIGNvbnN0IGxpbmVzID0gc2RwLnNwbGl0KC9cXHJcXG4vKTtcclxuICBjb25zdCBvdXRwdXQ6IHN0cmluZ1tdID0gW107XHJcbiAgbGV0IGluVmlkZW8gPSBmYWxzZTtcclxuICBsZXQgcGVuZGluZ0JhbmR3aWR0aCA9IGZhbHNlO1xyXG5cclxuICBjb25zdCBwdXNoQmFuZHdpZHRoID0gKCkgPT4ge1xyXG4gICAgb3V0cHV0LnB1c2goYGI9QVM6JHtub3JtYWxpemVkQml0cmF0ZUticHN9YCk7XHJcbiAgICBvdXRwdXQucHVzaChgYj1USUFTOiR7Yml0cmF0ZUJwc31gKTtcclxuICB9O1xyXG5cclxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ209JykpIHtcclxuICAgICAgaWYgKGluVmlkZW8gJiYgcGVuZGluZ0JhbmR3aWR0aCkge1xyXG4gICAgICAgIHB1c2hCYW5kd2lkdGgoKTtcclxuICAgICAgfVxyXG4gICAgICBpblZpZGVvID0gbGluZS5zdGFydHNXaXRoKCdtPXZpZGVvJyk7XHJcbiAgICAgIHBlbmRpbmdCYW5kd2lkdGggPSBpblZpZGVvO1xyXG4gICAgICBvdXRwdXQucHVzaChsaW5lKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGluVmlkZW8pIHtcclxuICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnYz0nKSAmJiBwZW5kaW5nQmFuZHdpZHRoKSB7XHJcbiAgICAgICAgb3V0cHV0LnB1c2gobGluZSk7XHJcbiAgICAgICAgcHVzaEJhbmR3aWR0aCgpO1xyXG4gICAgICAgIHBlbmRpbmdCYW5kd2lkdGggPSBmYWxzZTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobGluZS5zdGFydHNXaXRoKCdiPUFTOicpIHx8IGxpbmUuc3RhcnRzV2l0aCgnYj1USUFTOicpKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnYT1mbXRwOicpKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9eYT1mbXRwOihcXGQrKVxccyooLiopJC8pO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgIG91dHB1dC5wdXNoKGxpbmUpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBheWxvYWRUeXBlID0gbWF0Y2hbMV07XHJcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbWF0Y2hbMl0gPz8gJyc7XHJcbiAgICAgICAgaWYgKC8oPzpefDspXFxzKmFwdD1cXGQrL2kudGVzdChwYXJhbXMpKSB7XHJcbiAgICAgICAgICBvdXRwdXQucHVzaChsaW5lKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0cmltbWVkID0gcGFyYW1zLnRyaW0oKTtcclxuICAgICAgICBsZXQgdXBkYXRlZFBhcmFtcyA9IHRyaW1tZWQ7XHJcbiAgICAgICAgaWYgKCF0cmltbWVkKSB7XHJcbiAgICAgICAgICB1cGRhdGVkUGFyYW1zID0gYHgtZ29vZ2xlLXN0YXJ0LWJpdHJhdGU9JHtub3JtYWxpemVkQml0cmF0ZUticHN9YDtcclxuICAgICAgICB9IGVsc2UgaWYgKC94LWdvb2dsZS1zdGFydC1iaXRyYXRlPVxcZCsvaS50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICAgICAgICB1cGRhdGVkUGFyYW1zID0gdHJpbW1lZC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAveC1nb29nbGUtc3RhcnQtYml0cmF0ZT1cXGQrL2ksXHJcbiAgICAgICAgICAgIGB4LWdvb2dsZS1zdGFydC1iaXRyYXRlPSR7bm9ybWFsaXplZEJpdHJhdGVLYnBzfWAsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB1cGRhdGVkUGFyYW1zID0gYCR7dHJpbW1lZH07eC1nb29nbGUtc3RhcnQtYml0cmF0ZT0ke25vcm1hbGl6ZWRCaXRyYXRlS2Jwc31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvdXRwdXQucHVzaChgYT1mbXRwOiR7cGF5bG9hZFR5cGV9ICR7dXBkYXRlZFBhcmFtc31gKTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG91dHB1dC5wdXNoKGxpbmUpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGluVmlkZW8gJiYgcGVuZGluZ0JhbmR3aWR0aCkge1xyXG4gICAgcHVzaEJhbmR3aWR0aCgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgam9pbmVkID0gb3V0cHV0LmpvaW4oJ1xcclxcbicpO1xyXG4gIHJldHVybiBzZHAuZW5kc1dpdGgoJ1xcbicpICYmICFqb2luZWQuZW5kc1dpdGgoJ1xcclxcbicpID8gYCR7am9pbmVkfVxcclxcbmAgOiBqb2luZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QXVkaW9SZWNlaXZlckhpbnRzKFxyXG4gIHJlY2VpdmVyPzogUlRDUnRwUmVjZWl2ZXIsXHJcbiAgdGFyZ2V0TXM/OiBudW1iZXIsXHJcbiAgcGxheW91dERlbGF5SGludE1zPzogbnVtYmVyLFxyXG4pOiB2b2lkIHtcclxuICBpZiAoIXJlY2VpdmVyKSByZXR1cm47XHJcbiAgY29uc3QgcmVjZWl2ZXJBbnkgPSByZWNlaXZlciBhcyBhbnk7XHJcbiAgY29uc3QgdGFyZ2V0ID0gcmVzb2x2ZUppdHRlclRhcmdldE1zKHRhcmdldE1zKTtcclxuICBjb25zdCBkZWxheUhpbnRNcyA9XHJcbiAgICB0eXBlb2YgcGxheW91dERlbGF5SGludE1zID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUocGxheW91dERlbGF5SGludE1zKVxyXG4gICAgICA/IE1hdGgubWF4KDAsIHBsYXlvdXREZWxheUhpbnRNcylcclxuICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgdHJ5IHtcclxuICAgIGlmIChkZWxheUhpbnRNcyAhPSBudWxsICYmICdwbGF5b3V0RGVsYXlIaW50JyBpbiByZWNlaXZlckFueSkge1xyXG4gICAgICByZWNlaXZlckFueS5wbGF5b3V0RGVsYXlIaW50ID0gZGVsYXlIaW50TXMgLyAxMDAwO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBpZiAodGFyZ2V0ICE9IG51bGwgJiYgdHlwZW9mIHJlY2VpdmVyQW55LmppdHRlckJ1ZmZlclRhcmdldCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgcmVjZWl2ZXJBbnkuaml0dGVyQnVmZmVyVGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG4gIGlmICh0YXJnZXQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHR5cGVvZiByZWNlaXZlckFueS5nZXRQYXJhbWV0ZXJzID09PSAnZnVuY3Rpb24nICYmXHJcbiAgICAgIHR5cGVvZiByZWNlaXZlckFueS5zZXRQYXJhbWV0ZXJzID09PSAnZnVuY3Rpb24nXHJcbiAgICApIHtcclxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHJlY2VpdmVyQW55LmdldFBhcmFtZXRlcnMoKTtcclxuICAgICAgaWYgKHBhcmFtZXRlcnMgJiYgdHlwZW9mIHBhcmFtZXRlcnMgPT09ICdvYmplY3QnICYmICdqaXR0ZXJCdWZmZXJUYXJnZXQnIGluIHBhcmFtZXRlcnMpIHtcclxuICAgICAgICBwYXJhbWV0ZXJzLmppdHRlckJ1ZmZlclRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICByZWNlaXZlckFueS5zZXRQYXJhbWV0ZXJzKHBhcmFtZXRlcnMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgKi9cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVKaXR0ZXJUYXJnZXRNcyh2YWx1ZT86IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDAsIHZhbHVlKTtcclxufVxyXG5cclxuY29uc3QgVklERU9fTUFYX0ZSQU1FX0FHRV9NSU5fTVMgPSA1O1xyXG5jb25zdCBWSURFT19NQVhfRlJBTUVfQUdFX01BWF9NUyA9IDEwMDtcclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVWaWRlb0ppdHRlclRhcmdldE1zKGNvbmZpZzogU3RyZWFtQ29uZmlnKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICBjb25zdCBmcHMgPVxyXG4gICAgdHlwZW9mIGNvbmZpZy5mcHMgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZShjb25maWcuZnBzKSAmJiBjb25maWcuZnBzID4gMCA/IGNvbmZpZy5mcHMgOiA2MDtcclxuICBjb25zdCBtaW5NcyA9IFZJREVPX01BWF9GUkFNRV9BR0VfTUlOX01TO1xyXG4gIGNvbnN0IG1heE1zID0gVklERU9fTUFYX0ZSQU1FX0FHRV9NQVhfTVM7XHJcbiAgaWYgKFxyXG4gICAgdHlwZW9mIGNvbmZpZy52aWRlb01heEZyYW1lQWdlRnJhbWVzID09PSAnbnVtYmVyJyAmJlxyXG4gICAgTnVtYmVyLmlzRmluaXRlKGNvbmZpZy52aWRlb01heEZyYW1lQWdlRnJhbWVzKSAmJlxyXG4gICAgY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMgPiAwXHJcbiAgKSB7XHJcbiAgICBjb25zdCBmcmFtZXMgPSBNYXRoLnJvdW5kKGNvbmZpZy52aWRlb01heEZyYW1lQWdlRnJhbWVzKTtcclxuICAgIGNvbnN0IGNvbXB1dGVkID0gTWF0aC5yb3VuZCgoMTAwMCAvIGZwcykgKiBmcmFtZXMpO1xyXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShjb21wdXRlZCkpIHtcclxuICAgICAgcmV0dXJuIE1hdGgubWluKG1heE1zLCBNYXRoLm1heChtaW5NcywgY29tcHV0ZWQpKTtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgdGFyZ2V0TXMgPSByZXNvbHZlSml0dGVyVGFyZ2V0TXMoY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VNcyk7XHJcbiAgaWYgKHRhcmdldE1zICE9IG51bGwpIHJldHVybiBNYXRoLm1pbihtYXhNcywgTWF0aC5tYXgobWluTXMsIHRhcmdldE1zKSk7XHJcbiAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlWaWRlb1JlY2VpdmVySGludHMocmVjZWl2ZXI/OiBSVENSdHBSZWNlaXZlciwgdGFyZ2V0TXM/OiBudW1iZXIpOiB2b2lkIHtcclxuICBpZiAoIXJlY2VpdmVyKSByZXR1cm47XHJcbiAgY29uc3QgdGFyZ2V0ID0gcmVzb2x2ZUppdHRlclRhcmdldE1zKHRhcmdldE1zKTtcclxuICBpZiAodGFyZ2V0ID09IG51bGwpIHJldHVybjtcclxuICBjb25zdCByZWNlaXZlckFueSA9IHJlY2VpdmVyIGFzIGFueTtcclxuICB0cnkge1xyXG4gICAgaWYgKCdwbGF5b3V0RGVsYXlIaW50JyBpbiByZWNlaXZlckFueSkge1xyXG4gICAgICByZWNlaXZlckFueS5wbGF5b3V0RGVsYXlIaW50ID0gdGFyZ2V0IC8gMTAwMDtcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgaWYgKHR5cGVvZiByZWNlaXZlckFueS5qaXR0ZXJCdWZmZXJUYXJnZXQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgIHJlY2VpdmVyQW55LmppdHRlckJ1ZmZlclRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgaWYgKFxyXG4gICAgICB0eXBlb2YgcmVjZWl2ZXJBbnkuZ2V0UGFyYW1ldGVycyA9PT0gJ2Z1bmN0aW9uJyAmJlxyXG4gICAgICB0eXBlb2YgcmVjZWl2ZXJBbnkuc2V0UGFyYW1ldGVycyA9PT0gJ2Z1bmN0aW9uJ1xyXG4gICAgKSB7XHJcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSByZWNlaXZlckFueS5nZXRQYXJhbWV0ZXJzKCk7XHJcbiAgICAgIGlmIChwYXJhbWV0ZXJzICYmIHR5cGVvZiBwYXJhbWV0ZXJzID09PSAnb2JqZWN0JyAmJiAnaml0dGVyQnVmZmVyVGFyZ2V0JyBpbiBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgcGFyYW1ldGVycy5qaXR0ZXJCdWZmZXJUYXJnZXQgPSB0YXJnZXQ7XHJcbiAgICAgICAgcmVjZWl2ZXJBbnkuc2V0UGFyYW1ldGVycyhwYXJhbWV0ZXJzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV2ViUnRjQ2xpZW50IHtcclxuICBwcml2YXRlIGFwaTogV2ViUnRjQXBpO1xyXG4gIHByaXZhdGUgcGM6IFJUQ1BlZXJDb25uZWN0aW9uIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgc2Vzc2lvbklkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgcHJpdmF0ZSByZW1vdGVTdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcclxuICBwcml2YXRlIGlucHV0Q2hhbm5lbDogUlRDRGF0YUNoYW5uZWwgfCB1bmRlZmluZWQ7XHJcbiAgcHJpdmF0ZSB1bnN1YnNjcmliZUNhbmRpZGF0ZXM6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIHN0YXRzVGltZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIHN0YXRzRmFzdFVudGlsTXM6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIHN0YXRzQ29ubmVjdGVkQXRNczogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgc3RhdHNTdGF0ZTogU3RhdHNTdGF0ZSA9IHt9O1xyXG4gIHByaXZhdGUgcGVuZGluZ1JlbW90ZUNhbmRpZGF0ZXM6IFJUQ0ljZUNhbmRpZGF0ZUluaXRbXSA9IFtdO1xyXG4gIHByaXZhdGUgcGVuZGluZ0xvY2FsQ2FuZGlkYXRlczogUlRDSWNlQ2FuZGlkYXRlSW5pdFtdID0gW107XHJcbiAgcHJpdmF0ZSBwZW5kaW5nTG9jYWxDYW5kaWRhdGVzVGltZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIGF1dG9EaXNjb25uZWN0VGltZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIGRpc2Nvbm5lY3RpbmcgPSBmYWxzZTtcclxuICBwcml2YXRlIHBlbmRpbmdJbnB1dDogKHN0cmluZyB8IEFycmF5QnVmZmVyKVtdID0gW107XHJcbiAgcHJpdmF0ZSBtYXhQZW5kaW5nSW5wdXQgPSAyNTY7XHJcbiAgcHJpdmF0ZSByZWNlaXZlckhpbnRUaW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgdmlkZW9KaXR0ZXJUYXJnZXRNczogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgYXVkaW9KaXR0ZXJUYXJnZXRNcyA9IERFRkFVTFRfQVVESU9fSklUVEVSX1RBUkdFVF9NUztcclxuICBwcml2YXRlIGF1ZGlvUGxheW91dERlbGF5SGludE1zID0gREVGQVVMVF9BVURJT19QTEFZT1VUX0RFTEFZX01TO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcGk6IFdlYlJ0Y0FwaSkge1xyXG4gICAgdGhpcy5hcGkgPSBhcGk7XHJcbiAgfVxyXG5cclxuICBnZXQgY29ubmVjdGlvblN0YXRlKCk6IFJUQ1BlZXJDb25uZWN0aW9uU3RhdGUgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMucGM/LmNvbm5lY3Rpb25TdGF0ZTtcclxuICB9XHJcblxyXG4gIGdldCBpbnB1dENoYW5uZWxTdGF0ZSgpOiBSVENEYXRhQ2hhbm5lbFN0YXRlIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLmlucHV0Q2hhbm5lbD8ucmVhZHlTdGF0ZTtcclxuICB9XHJcblxyXG4gIGdldCBpbnB1dENoYW5uZWxCdWZmZXJlZEFtb3VudCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5wdXRDaGFubmVsPy5idWZmZXJlZEFtb3VudDtcclxuICB9XHJcblxyXG4gIGdldCBwZWVyQ29ubmVjdGlvbigpOiBSVENQZWVyQ29ubmVjdGlvbiB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5wYztcclxuICB9XHJcblxyXG4gIGFzeW5jIGNvbm5lY3QoXHJcbiAgICBjb25maWc6IFN0cmVhbUNvbmZpZyxcclxuICAgIGNhbGxiYWNrczogV2ViUnRjQ2xpZW50Q2FsbGJhY2tzID0ge30sXHJcbiAgICBvcHRpb25zOiBXZWJSdGNDbGllbnRDb25uZWN0T3B0aW9ucyA9IHt9LFxyXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBoZHJSZXF1ZXN0ZWQgPSBCb29sZWFuKGNvbmZpZy5oZHIpO1xyXG5cclxuICAgIGlmIChjb25maWcuZW5jb2RpbmcudG9Mb3dlckNhc2UoKSA9PT0gJ2F2MScgJiYgZ2V0Q29kZWNDYXBzRm9yRW5jb2RpbmcoJ2F2MScpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjb25zdCB3YXJuaW5nID1cclxuICAgICAgICBcIkFWMSBpcyBzZWxlY3RlZCwgYnV0IHRoaXMgYnJvd3NlciByZXBvcnRzIG5vIEFWMSBkZWNvZGUgc3VwcG9ydC4gVGhpcyBjYW4gYmUgYSBmYWxzZSBwb3NpdGl2ZeKAlGl0J3Mgbm90IGFsd2F5cyBwb3NzaWJsZSB0byBrbm93IHVudGlsIHlvdSB0cnkuIElmIHlvdSBnZXQgYSBibGFjayBzY3JlZW4sIHN3aXRjaCB0byBIRVZDL0guMjY0LlwiO1xyXG4gICAgICBjYWxsYmFja3Mub25XYXJuaW5nPy4od2FybmluZyk7XHJcbiAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGRyUmVxdWVzdGVkKSB7XHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBjb25maWcuZW5jb2RpbmcudG9Mb3dlckNhc2UoKTtcclxuICAgICAgaWYgKG5vcm1hbGl6ZWQgIT09ICdoZXZjJyAmJiBub3JtYWxpemVkICE9PSAnYXYxJykge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdIRFIgcmVxdWlyZXMgSEVWQyBvciBBVjEgdmlkZW8gZW5jb2RpbmcuJyk7XHJcbiAgICAgICAgY2FsbGJhY2tzLm9uRXJyb3I/LihlcnJvcik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEJyb3dzZXIgY29kZWMgY2FwYWJpbGl0eSByZXBvcnRpbmcgaXMgaW5jb25zaXN0ZW50IChlc3BlY2lhbGx5IGZvciBIRVZDIHByb2ZpbGVzKS5cclxuICAgICAgLy8gVHJlYXQgdGhpcyBhcyBhIGhpbnQgYW5kIGFsbG93IHRoZSBuZWdvdGlhdGlvbiB0byBwcm9jZWVkLlxyXG4gICAgICBpZiAoIXN1cHBvcnRzSGRyRW5jb2RpbmcoY29uZmlnLmVuY29kaW5nKSkge1xyXG4gICAgICAgIGNvbnN0IHdhcm5pbmcgPVxyXG4gICAgICAgICAgXCJIRFIgaXMgZW5hYmxlZCwgYnV0IHRoaXMgYnJvd3NlciByZXBvcnRzIG5vIEhEUi1jYXBhYmxlIGRlY29kZXIvcHJvZmlsZSBmb3IgdGhlIHNlbGVjdGVkIGNvZGVjLiBUaGlzIGNhbiBiZSBhIGZhbHNlIHBvc2l0aXZl4oCUaXQncyBub3QgYWx3YXlzIHBvc3NpYmxlIHRvIGtub3cgdW50aWwgeW91IHRyeS4gSWYgeW91IHNlZSBhIGJsYWNrIHNjcmVlbiwgZGlzYWJsZSBIRFIgb3Igc3dpdGNoIGNvZGVjcy5cIjtcclxuICAgICAgICBjYWxsYmFja3Mub25XYXJuaW5nPy4od2FybmluZyk7XHJcbiAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdEF0dGVtcHQoY29uZmlnLCBjYWxsYmFja3MsIG9wdGlvbnMpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcclxuICAgICAgY29uc3QgcmVxdWVzdGVkID0gY29uZmlnLmVuY29kaW5nLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGNvbnN0IGlzQ29kZWNPZmZlck1pc21hdGNoID0gbWVzc2FnZS5zdGFydHNXaXRoKCdCcm93c2VyIGRpZCBub3Qgb2ZmZXIgcmVxdWVzdGVkIHZpZGVvIGNvZGVjJyk7XHJcblxyXG4gICAgICBpZiAocmVxdWVzdGVkICE9PSAnaDI2NCcgJiYgKGlzQ29kZWNPZmZlck1pc21hdGNoIHx8IG1lc3NhZ2UuaW5jbHVkZXMoJ0ZhaWxlZCB0byBwcm9jZXNzIG9mZmVyJykpKSB7XHJcbiAgICAgICAgY29uc3Qgb2ZmZXJlZCA9IGlzQ29kZWNPZmZlck1pc21hdGNoID8gcGFyc2VPZmZlcmVkQ29kZWNOYW1lc0Zyb21FcnJvcihtZXNzYWdlKSA6IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICAgIGNvbnN0IGhkclJlcXVlc3RlZE5vdyA9IEJvb2xlYW4oY29uZmlnLmhkcik7XHJcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlczogQXJyYXk8eyBlbmNvZGluZzogJ2hldmMnIHwgJ2F2MScgfCAnaDI2NCc7IGhkcjogYm9vbGVhbjsgd2h5OiBzdHJpbmcgfT4gPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKGhkclJlcXVlc3RlZE5vdykge1xyXG4gICAgICAgICAgaWYgKHJlcXVlc3RlZCA9PT0gJ2hldmMnICYmIChvZmZlcmVkLmhhcygnYXYxJykgfHwgb2ZmZXJlZC5oYXMoJ2F2MXgnKSkpIHtcclxuICAgICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgICBlbmNvZGluZzogJ2F2MScsXHJcbiAgICAgICAgICAgICAgaGRyOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHdoeTogJ0hFVkMgd2FzIHJlcXVlc3RlZCBidXQgdGhlIGJyb3dzZXIgZGlkIG5vdCBvZmZlciBIMjY1OyB0cnlpbmcgQVYxIEhEUi4nLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdGVkID09PSAnYXYxJyAmJiAob2ZmZXJlZC5oYXMoJ2gyNjUnKSB8fCBvZmZlcmVkLmhhcygnaGV2YycpKSkge1xyXG4gICAgICAgICAgICBjYW5kaWRhdGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgIGVuY29kaW5nOiAnaGV2YycsXHJcbiAgICAgICAgICAgICAgaGRyOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHdoeTogJ0FWMSB3YXMgcmVxdWVzdGVkIGJ1dCB0aGUgYnJvd3NlciBkaWQgbm90IG9mZmVyIEFWMTsgdHJ5aW5nIEhFVkMgSERSLicsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgZW5jb2Rpbmc6ICdoMjY0JyxcclxuICAgICAgICAgICAgaGRyOiBmYWxzZSxcclxuICAgICAgICAgICAgd2h5OiAnSERSL2FkdmFuY2VkIGNvZGVjIG5lZ290aWF0aW9uIGZhaWxlZDsgZmFsbGluZyBiYWNrIHRvIFNEUiBILjI2NCBmb3IgdGhpcyBzZXNzaW9uLicsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgZW5jb2Rpbmc6ICdoMjY0JyxcclxuICAgICAgICAgICAgaGRyOiBmYWxzZSxcclxuICAgICAgICAgICAgd2h5OiAnQWR2YW5jZWQgY29kZWMgbmVnb3RpYXRpb24gZmFpbGVkOyBmYWxsaW5nIGJhY2sgdG8gSC4yNjQgZm9yIHRoaXMgc2Vzc2lvbi4nLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5lbmNvZGluZyA9PT0gcmVxdWVzdGVkICYmXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5oZHIgPT09IGhkclJlcXVlc3RlZE5vd1xyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHdhcm5pbmcgPSBgJHtoZHJSZXF1ZXN0ZWROb3cgPyAnSERSIHJlcXVlc3RlZDsgJyA6ICcnfSR7Y2FuZGlkYXRlLndoeX0gKFRoaXMgZG9lcyBub3QgY2hhbmdlIHlvdXIgc2F2ZWQgc2V0dGluZ3MuKWA7XHJcbiAgICAgICAgICBjYWxsYmFja3Mub25XYXJuaW5nPy4od2FybmluZyk7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XHJcblxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBhd2FpdCB0aGlzLmNvbm5lY3RBdHRlbXB0KFxyXG4gICAgICAgICAgICAgIHsgLi4uY29uZmlnLCBlbmNvZGluZzogY2FuZGlkYXRlLmVuY29kaW5nLCBoZHI6IGNhbmRpZGF0ZS5oZHIgfSxcclxuICAgICAgICAgICAgICBjYWxsYmFja3MsXHJcbiAgICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY2FsbGJhY2tzLm9uTmVnb3RpYXRlZEVuY29kaW5nPy4oY2FuZGlkYXRlLmVuY29kaW5nKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkO1xyXG4gICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIC8qIHRyeSBuZXh0IGNhbmRpZGF0ZSAqL1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZmluYWxFcnJvciA9XHJcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKCdGYWlsZWQgdG8gZXN0YWJsaXNoIFdlYlJUQyBzZXNzaW9uLicpO1xyXG4gICAgICBjYWxsYmFja3Mub25FcnJvcj8uKGZpbmFsRXJyb3IpO1xyXG4gICAgICB0aHJvdyBmaW5hbEVycm9yO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBjb25uZWN0QXR0ZW1wdChcclxuICAgIGNvbmZpZzogU3RyZWFtQ29uZmlnLFxyXG4gICAgY2FsbGJhY2tzOiBXZWJSdGNDbGllbnRDYWxsYmFja3MgPSB7fSxcclxuICAgIG9wdGlvbnM6IFdlYlJ0Y0NsaWVudENvbm5lY3RPcHRpb25zID0ge30sXHJcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGF3YWl0IHRoaXMuZGlzY29ubmVjdCgpO1xyXG4gICAgdGhpcy5jbGVhckF1dG9EaXNjb25uZWN0VGltZXIoKTtcclxuICAgIHRoaXMuZGlzY29ubmVjdGluZyA9IGZhbHNlO1xyXG4gICAgY29uc3Qgc2Vzc2lvbkNvbmZpZyA9IGNvbmZpZztcclxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCB0aGlzLmFwaS5jcmVhdGVTZXNzaW9uKHNlc3Npb25Db25maWcpO1xyXG4gICAgdGhpcy5zZXNzaW9uSWQgPSBzZXNzaW9uLnNlc3Npb25JZDtcclxuICAgIHRoaXMucGVuZGluZ1JlbW90ZUNhbmRpZGF0ZXMgPSBbXTtcclxuICAgIHRoaXMudmlkZW9KaXR0ZXJUYXJnZXRNcyA9IHJlc29sdmVWaWRlb0ppdHRlclRhcmdldE1zKHNlc3Npb25Db25maWcpO1xyXG4gICAgdGhpcy5hdWRpb0ppdHRlclRhcmdldE1zID0gREVGQVVMVF9BVURJT19KSVRURVJfVEFSR0VUX01TO1xyXG4gICAgdGhpcy5hdWRpb1BsYXlvdXREZWxheUhpbnRNcyA9IERFRkFVTFRfQVVESU9fUExBWU9VVF9ERUxBWV9NUztcclxuICAgIHRoaXMuc3RhdHNGYXN0VW50aWxNcyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc3RhdHNDb25uZWN0ZWRBdE1zID0gdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgcmVxdWVzdGVkRW5jb2RpbmcgPSBzZXNzaW9uQ29uZmlnLmVuY29kaW5nLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBjb25zdCBidW5kbGVQb2xpY3k6IFJUQ0J1bmRsZVBvbGljeSA9IHJlcXVlc3RlZEVuY29kaW5nID09PSAnaGV2YycgPyAnYmFsYW5jZWQnIDogJ21heC1idW5kbGUnO1xyXG4gICAgY29uc3QgcnRjcE11eFBvbGljeSA9IChyZXF1ZXN0ZWRFbmNvZGluZyA9PT0gJ2hldmMnID8gJ25lZ290aWF0ZScgOiAncmVxdWlyZScpIGFzIFJUQ1J0Y3BNdXhQb2xpY3k7XHJcbiAgICB0aGlzLnBjID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHtcclxuICAgICAgaWNlU2VydmVyczogc2Vzc2lvbi5pY2VTZXJ2ZXJzLFxyXG4gICAgICBidW5kbGVQb2xpY3ksXHJcbiAgICAgIHJ0Y3BNdXhQb2xpY3ksXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB2aWRlb1RyYW5zY2VpdmVyID0gdGhpcy5wYy5hZGRUcmFuc2NlaXZlcigndmlkZW8nLCB7IGRpcmVjdGlvbjogJ3JlY3Zvbmx5JyB9KTtcclxuICAgIHRoaXMucGMuYWRkVHJhbnNjZWl2ZXIoJ2F1ZGlvJywgeyBkaXJlY3Rpb246ICdyZWN2b25seScgfSk7XHJcbiAgICBhcHBseUNvZGVjUHJlZmVyZW5jZXModmlkZW9UcmFuc2NlaXZlciwgc2Vzc2lvbkNvbmZpZy5lbmNvZGluZywgQm9vbGVhbihzZXNzaW9uQ29uZmlnLmhkcikpO1xyXG5cclxuICAgIGNvbnN0IGlucHV0UHJpb3JpdHkgPSBvcHRpb25zLmlucHV0UHJpb3JpdHkgPz8gJ2hpZ2gnO1xyXG4gICAgdGhpcy5pbnB1dENoYW5uZWwgPSB0aGlzLnBjLmNyZWF0ZURhdGFDaGFubmVsKCdpbnB1dCcsIHtcclxuICAgICAgb3JkZXJlZDogZmFsc2UsXHJcbiAgICAgIG1heFJldHJhbnNtaXRzOiAwLFxyXG4gICAgICBwcmlvcml0eTogaW5wdXRQcmlvcml0eSxcclxuICAgIH0gYXMgUlRDRGF0YUNoYW5uZWxJbml0KTtcclxuICAgIHRoaXMuaW5wdXRDaGFubmVsLm9ub3BlbiA9ICgpID0+IHtcclxuICAgICAgY2FsbGJhY2tzLm9uSW5wdXRDaGFubmVsU3RhdGU/Lignb3BlbicpO1xyXG4gICAgICB0aGlzLmZsdXNoUGVuZGluZ0lucHV0KCk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5pbnB1dENoYW5uZWwub25jbG9zZSA9ICgpID0+IGNhbGxiYWNrcy5vbklucHV0Q2hhbm5lbFN0YXRlPy4oJ2Nsb3NlZCcpO1xyXG4gICAgdGhpcy5pbnB1dENoYW5uZWwub25lcnJvciA9ICgpID0+IGNhbGxiYWNrcy5vbklucHV0Q2hhbm5lbFN0YXRlPy4oJ2Nsb3NpbmcnKTtcclxuICAgIHRoaXMuaW5wdXRDaGFubmVsLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xyXG4gICAgICBpZiAoIWNhbGxiYWNrcy5vbklucHV0TWVzc2FnZSkgcmV0dXJuO1xyXG4gICAgICBpZiAodHlwZW9mIGV2ZW50LmRhdGEgIT09ICdzdHJpbmcnKSByZXR1cm47XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSkgYXMgR2FtZXBhZEZlZWRiYWNrTWVzc2FnZTtcclxuICAgICAgICBpZiAobWVzc2FnZT8udHlwZSAhPT0gJ2dhbWVwYWRfZmVlZGJhY2snKSByZXR1cm47XHJcbiAgICAgICAgY2FsbGJhY2tzLm9uSW5wdXRNZXNzYWdlKG1lc3NhZ2UpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBjLm9udHJhY2sgPSAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2sgPSBldmVudC50cmFjaztcclxuICAgICAgY29uc3Qga2luZCA9IHRyYWNrLmtpbmQ7XHJcbiAgICAgIGZvciAoY29uc3QgZXhpc3Rpbmcgb2YgdGhpcy5yZW1vdGVTdHJlYW0uZ2V0VHJhY2tzKCkpIHtcclxuICAgICAgICBpZiAoZXhpc3Rpbmcua2luZCAhPT0ga2luZCkgY29udGludWU7XHJcbiAgICAgICAgdGhpcy5yZW1vdGVTdHJlYW0ucmVtb3ZlVHJhY2soZXhpc3RpbmcpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBleGlzdGluZy5zdG9wKCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcmVtb3ZlVHJhY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZW1vdGVTdHJlYW0ucmVtb3ZlVHJhY2sodHJhY2spO1xyXG4gICAgICAgIHRyYWNrLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgcmVtb3ZlVHJhY2spO1xyXG4gICAgICB9O1xyXG4gICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIHJlbW92ZVRyYWNrKTtcclxuICAgICAgdGhpcy5yZW1vdGVTdHJlYW0uYWRkVHJhY2sodHJhY2spO1xyXG4gICAgICBpZiAoa2luZCA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgIGFwcGx5QXVkaW9SZWNlaXZlckhpbnRzKFxyXG4gICAgICAgICAgZXZlbnQucmVjZWl2ZXIsXHJcbiAgICAgICAgICB0aGlzLmF1ZGlvSml0dGVyVGFyZ2V0TXMsXHJcbiAgICAgICAgICB0aGlzLmF1ZGlvUGxheW91dERlbGF5SGludE1zLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ3ZpZGVvJykge1xyXG4gICAgICAgIHRyYWNrLmNvbnRlbnRIaW50ID0gJ21vdGlvbic7XHJcbiAgICAgICAgYXBwbHlWaWRlb1JlY2VpdmVySGludHMoZXZlbnQucmVjZWl2ZXIsIHRoaXMudmlkZW9KaXR0ZXJUYXJnZXRNcyk7XHJcbiAgICAgIH1cclxuICAgICAgY2FsbGJhY2tzLm9uUmVtb3RlU3RyZWFtPy4odGhpcy5yZW1vdGVTdHJlYW0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBjLm9uY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMucGMpIHJldHVybjtcclxuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBjLmNvbm5lY3Rpb25TdGF0ZTtcclxuICAgICAgY2FsbGJhY2tzLm9uQ29ubmVjdGlvblN0YXRlPy4oc3RhdGUpO1xyXG4gICAgICBpZiAoc3RhdGUgPT09ICdjb25uZWN0ZWQnKSB7XHJcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB0aGlzLnN0YXRzQ29ubmVjdGVkQXRNcyA9IG5vdztcclxuICAgICAgICB0aGlzLnN0YXRzRmFzdFVudGlsTXMgPSBub3cgKyBTVEFUU19QT0xMX0ZBU1RfQk9PVF9NUztcclxuICAgICAgICB0aGlzLmNsZWFyQXV0b0Rpc2Nvbm5lY3RUaW1lcigpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRSZWNlaXZlckhpbnRSZWZyZXNoKCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdmYWlsZWQnIHx8IHN0YXRlID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgIHRoaXMuc3RvcFJlY2VpdmVySGludFJlZnJlc2goKTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b0Rpc2Nvbm5lY3QoMCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wUmVjZWl2ZXJIaW50UmVmcmVzaCgpO1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVBdXRvRGlzY29ubmVjdCg1MDAwKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBjLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMucGMpIHJldHVybjtcclxuICAgICAgY2FsbGJhY2tzLm9uSWNlU3RhdGU/Lih0aGlzLnBjLmljZUNvbm5lY3Rpb25TdGF0ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucGMub25pY2VjYW5kaWRhdGUgPSAoZXZlbnQpID0+IHtcclxuICAgICAgaWYgKCFldmVudC5jYW5kaWRhdGUgfHwgIXRoaXMuc2Vzc2lvbklkKSByZXR1cm47XHJcbiAgICAgIHRoaXMucXVldWVMb2NhbENhbmRpZGF0ZShldmVudC5jYW5kaWRhdGUudG9KU09OKCkpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVuc3Vic2NyaWJlQ2FuZGlkYXRlcyA9IHRoaXMuYXBpLnN1YnNjcmliZVJlbW90ZUNhbmRpZGF0ZXMoXHJcbiAgICAgIHNlc3Npb24uc2Vzc2lvbklkLFxyXG4gICAgICAoY2FuZGlkYXRlKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBjIHx8ICFjYW5kaWRhdGUpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5wYy5yZW1vdGVEZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgdm9pZCB0aGlzLnBjLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUpLmNhdGNoKCgpID0+IHt9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVtb3RlQ2FuZGlkYXRlcy5wdXNoKGNhbmRpZGF0ZSk7XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG9mZmVyID0gYXdhaXQgdGhpcy5wYy5jcmVhdGVPZmZlcih7XHJcbiAgICAgICAgb2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSxcclxuICAgICAgICBvZmZlclRvUmVjZWl2ZVZpZGVvOiB0cnVlLFxyXG4gICAgICB9KTtcclxuICAgICAgY29uc3QgbXVuZ2VkT2ZmZXI6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbkluaXQgPSB7XHJcbiAgICAgICAgdHlwZTogb2ZmZXIudHlwZSxcclxuICAgICAgICBzZHA6IGFwcGx5SW5pdGlhbEJpdHJhdGVIaW50cyhvZmZlci5zZHAgPz8gJycsIHNlc3Npb25Db25maWcuYml0cmF0ZUticHMpLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoIW9mZmVyU3VwcG9ydHNFbmNvZGluZyhtdW5nZWRPZmZlci5zZHAgPz8gJycsIHNlc3Npb25Db25maWcuZW5jb2RpbmcpKSB7XHJcbiAgICAgICAgY29uc3Qgb2ZmZXJlZCA9XHJcbiAgICAgICAgICBBcnJheS5mcm9tKGdldE9mZmVyZWRWaWRlb0NvZGVjTmFtZXMobXVuZ2VkT2ZmZXIuc2RwID8/ICcnKSkuam9pbignLCAnKSB8fCAnbm9uZSc7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgYEJyb3dzZXIgZGlkIG5vdCBvZmZlciByZXF1ZXN0ZWQgdmlkZW8gY29kZWMgJyR7c2Vzc2lvbkNvbmZpZy5lbmNvZGluZ30nIChvZmZlcmVkOiAke29mZmVyZWR9KWAsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCB0aGlzLnBjLnNldExvY2FsRGVzY3JpcHRpb24obXVuZ2VkT2ZmZXIpO1xyXG4gICAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCB0aGlzLmFwaS5zZW5kT2ZmZXIoc2Vzc2lvbi5zZXNzaW9uSWQsIHtcclxuICAgICAgICB0eXBlOiBtdW5nZWRPZmZlci50eXBlLFxyXG4gICAgICAgIHNkcDogbXVuZ2VkT2ZmZXIuc2RwID8/ICcnLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKCFhbnN3ZXI/LnNkcCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViUlRDIGFuc3dlciBub3QgcmVjZWl2ZWQnKTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMucGMuc2V0UmVtb3RlRGVzY3JpcHRpb24oYW5zd2VyKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zdCBvZmZlcmVkID1cclxuICAgICAgICAgIEFycmF5LmZyb20oZ2V0T2ZmZXJlZFZpZGVvQ29kZWNOYW1lcyhtdW5nZWRPZmZlci5zZHAgPz8gJycpKS5qb2luKCcsICcpIHx8ICdub25lJztcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gYXBwbHkgV2ViUlRDIGFuc3dlciBTRFAnLCB7XHJcbiAgICAgICAgICBlbmNvZGluZzogc2Vzc2lvbkNvbmZpZy5lbmNvZGluZyxcclxuICAgICAgICAgIG9mZmVyZWQsXHJcbiAgICAgICAgICBvZmZlclNkcDogbXVuZ2VkT2ZmZXIuc2RwLFxyXG4gICAgICAgICAgYW5zd2VyU2RwOiBhbnN3ZXIuc2RwLFxyXG4gICAgICAgICAgZXJyb3IsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBgRmFpbGVkIHRvIGFwcGx5IFdlYlJUQyBhbnN3ZXIgU0RQICgke3Nlc3Npb25Db25maWcuZW5jb2Rpbmd9OyBvZmZlcmVkOiAke29mZmVyZWR9KTogJHttZXNzYWdlfWAsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCB0aGlzLmZsdXNoUGVuZGluZ0NhbmRpZGF0ZXMoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuZGlzY29ubmVjdCgpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0YXJ0U3RhdHNQb2xsaW5nKGNhbGxiYWNrcyk7XHJcbiAgICByZXR1cm4gc2Vzc2lvbi5zZXNzaW9uSWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHF1ZXVlTG9jYWxDYW5kaWRhdGUoY2FuZGlkYXRlOiBSVENJY2VDYW5kaWRhdGVJbml0KTogdm9pZCB7XHJcbiAgICBpZiAoIWNhbmRpZGF0ZT8uY2FuZGlkYXRlIHx8ICF0aGlzLnNlc3Npb25JZCkgcmV0dXJuO1xyXG4gICAgdGhpcy5wZW5kaW5nTG9jYWxDYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKTtcclxuICAgIGlmICh0aGlzLnBlbmRpbmdMb2NhbENhbmRpZGF0ZXMubGVuZ3RoID49IElDRV9DQU5ESURBVEVfQkFUQ0hfTElNSVQpIHtcclxuICAgICAgdGhpcy5mbHVzaExvY2FsQ2FuZGlkYXRlcygpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wZW5kaW5nTG9jYWxDYW5kaWRhdGVzVGltZXIpIHJldHVybjtcclxuICAgIHRoaXMucGVuZGluZ0xvY2FsQ2FuZGlkYXRlc1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnBlbmRpbmdMb2NhbENhbmRpZGF0ZXNUaW1lciA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy5mbHVzaExvY2FsQ2FuZGlkYXRlcygpO1xyXG4gICAgfSwgSUNFX0NBTkRJREFURV9CQVRDSF9XSU5ET1dfTVMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmbHVzaExvY2FsQ2FuZGlkYXRlcygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5zZXNzaW9uSWQgfHwgIXRoaXMucGVuZGluZ0xvY2FsQ2FuZGlkYXRlcy5sZW5ndGgpIHJldHVybjtcclxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSB0aGlzLnBlbmRpbmdMb2NhbENhbmRpZGF0ZXM7XHJcbiAgICB0aGlzLnBlbmRpbmdMb2NhbENhbmRpZGF0ZXMgPSBbXTtcclxuICAgIHZvaWQgdGhpcy5hcGkuc2VuZEljZUNhbmRpZGF0ZXModGhpcy5zZXNzaW9uSWQsIGNhbmRpZGF0ZXMpLmNhdGNoKCgpID0+IHt9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRpc2Nvbm5lY3Qob3B0aW9uczogV2ViUnRjRGlzY29ubmVjdE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHRoaXMuZGlzY29ubmVjdGluZykgcmV0dXJuO1xyXG4gICAgdGhpcy5kaXNjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuY2xlYXJBdXRvRGlzY29ubmVjdFRpbWVyKCk7XHJcbiAgICB0aGlzLnN0b3BSZWNlaXZlckhpbnRSZWZyZXNoKCk7XHJcbiAgICBpZiAodGhpcy5zdGF0c1RpbWVyKSB7XHJcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5zdGF0c1RpbWVyKTtcclxuICAgICAgdGhpcy5zdGF0c1RpbWVyID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGF0c0Zhc3RVbnRpbE1zID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5zdGF0c0Nvbm5lY3RlZEF0TXMgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnVuc3Vic2NyaWJlQ2FuZGlkYXRlcz8uKCk7XHJcbiAgICB0aGlzLnVuc3Vic2NyaWJlQ2FuZGlkYXRlcyA9IHVuZGVmaW5lZDtcclxuICAgIGlmICh0aGlzLmlucHV0Q2hhbm5lbCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuaW5wdXRDaGFubmVsLmNsb3NlKCk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wYykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMucGMuY2xvc2UoKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlc3Npb25JZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYXBpLmVuZFNlc3Npb24odGhpcy5zZXNzaW9uSWQsIHsgLi4uKG9wdGlvbnMua2VlcGFsaXZlICE9PSB1bmRlZmluZWQgPyB7IGtlZXBhbGl2ZTogb3B0aW9ucy5rZWVwYWxpdmUgfSA6IHt9KSB9KTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlbmRpbmdMb2NhbENhbmRpZGF0ZXNUaW1lcikge1xyXG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMucGVuZGluZ0xvY2FsQ2FuZGlkYXRlc1RpbWVyKTtcclxuICAgICAgdGhpcy5wZW5kaW5nTG9jYWxDYW5kaWRhdGVzVGltZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJlbW90ZVN0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xyXG4gICAgdGhpcy5wZW5kaW5nUmVtb3RlQ2FuZGlkYXRlcyA9IFtdO1xyXG4gICAgdGhpcy5wZW5kaW5nTG9jYWxDYW5kaWRhdGVzID0gW107XHJcbiAgICB0aGlzLnBjID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5zZXNzaW9uSWQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmlucHV0Q2hhbm5lbCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMucGVuZGluZ0lucHV0ID0gW107XHJcbiAgICB0aGlzLnN0YXRzU3RhdGUgPSB7fTtcclxuICAgIHRoaXMudmlkZW9KaXR0ZXJUYXJnZXRNcyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc3RhdHNGYXN0VW50aWxNcyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc3RhdHNDb25uZWN0ZWRBdE1zID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5kaXNjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN0YXJ0UmVjZWl2ZXJIaW50UmVmcmVzaCgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnJlY2VpdmVySGludFRpbWVyKSByZXR1cm47XHJcbiAgICB0aGlzLnJlY2VpdmVySGludFRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgaWYgKCF0aGlzLnBjKSByZXR1cm47XHJcbiAgICAgIGZvciAoY29uc3QgcmVjZWl2ZXIgb2YgdGhpcy5wYy5nZXRSZWNlaXZlcnMoKSkge1xyXG4gICAgICAgIGlmIChyZWNlaXZlci50cmFjaz8ua2luZCA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgICAgYXBwbHlBdWRpb1JlY2VpdmVySGludHMocmVjZWl2ZXIsIHRoaXMuYXVkaW9KaXR0ZXJUYXJnZXRNcywgdGhpcy5hdWRpb1BsYXlvdXREZWxheUhpbnRNcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZWNlaXZlci50cmFjaz8ua2luZCA9PT0gJ3ZpZGVvJykge1xyXG4gICAgICAgICAgYXBwbHlWaWRlb1JlY2VpdmVySGludHMocmVjZWl2ZXIsIHRoaXMudmlkZW9KaXR0ZXJUYXJnZXRNcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCBSRUNFSVZFUl9ISU5UX1JFRlJFU0hfTVMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdG9wUmVjZWl2ZXJIaW50UmVmcmVzaCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5yZWNlaXZlckhpbnRUaW1lcikgcmV0dXJuO1xyXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5yZWNlaXZlckhpbnRUaW1lcik7XHJcbiAgICB0aGlzLnJlY2VpdmVySGludFRpbWVyID0gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgc2V0QXVkaW9MYXRlbmN5VGFyZ2V0cyh0YXJnZXRNczogbnVtYmVyLCBwbGF5b3V0RGVsYXlIaW50TXM/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gcmVzb2x2ZUppdHRlclRhcmdldE1zKHRhcmdldE1zKSA/PyBERUZBVUxUX0FVRElPX0pJVFRFUl9UQVJHRVRfTVM7XHJcbiAgICBjb25zdCByZXNvbHZlZEhpbnQgPVxyXG4gICAgICB0eXBlb2YgcGxheW91dERlbGF5SGludE1zID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUocGxheW91dERlbGF5SGludE1zKVxyXG4gICAgICAgID8gTWF0aC5tYXgoMCwgcGxheW91dERlbGF5SGludE1zKVxyXG4gICAgICAgIDogcmVzb2x2ZWRUYXJnZXQ7XHJcbiAgICB0aGlzLmF1ZGlvSml0dGVyVGFyZ2V0TXMgPSByZXNvbHZlZFRhcmdldDtcclxuICAgIHRoaXMuYXVkaW9QbGF5b3V0RGVsYXlIaW50TXMgPSByZXNvbHZlZEhpbnQ7XHJcbiAgICBpZiAoIXRoaXMucGMpIHJldHVybjtcclxuICAgIGZvciAoY29uc3QgcmVjZWl2ZXIgb2YgdGhpcy5wYy5nZXRSZWNlaXZlcnMoKSkge1xyXG4gICAgICBpZiAocmVjZWl2ZXIudHJhY2s/LmtpbmQgPT09ICdhdWRpbycpIHtcclxuICAgICAgICBhcHBseUF1ZGlvUmVjZWl2ZXJIaW50cyhyZWNlaXZlciwgdGhpcy5hdWRpb0ppdHRlclRhcmdldE1zLCB0aGlzLmF1ZGlvUGxheW91dERlbGF5SGludE1zKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0VmlkZW9MYXRlbmN5VGFyZ2V0KHRhcmdldE1zPzogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLnZpZGVvSml0dGVyVGFyZ2V0TXMgPSByZXNvbHZlSml0dGVyVGFyZ2V0TXModGFyZ2V0TXMpO1xyXG4gICAgaWYgKCF0aGlzLnBjKSByZXR1cm47XHJcbiAgICBmb3IgKGNvbnN0IHJlY2VpdmVyIG9mIHRoaXMucGMuZ2V0UmVjZWl2ZXJzKCkpIHtcclxuICAgICAgaWYgKHJlY2VpdmVyLnRyYWNrPy5raW5kID09PSAndmlkZW8nKSB7XHJcbiAgICAgICAgYXBwbHlWaWRlb1JlY2VpdmVySGludHMocmVjZWl2ZXIsIHRoaXMudmlkZW9KaXR0ZXJUYXJnZXRNcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNlbmRJbnB1dChwYXlsb2FkOiBzdHJpbmcgfCBBcnJheUJ1ZmZlcik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLmlucHV0Q2hhbm5lbCB8fCB0aGlzLmlucHV0Q2hhbm5lbC5yZWFkeVN0YXRlICE9PSAnb3BlbicpIHtcclxuICAgICAgdGhpcy5xdWV1ZUlucHV0KHBheWxvYWQpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAodGhpcy5pbnB1dENoYW5uZWwgYXMgdW5rbm93biBhcyB7IHNlbmQoZDogc3RyaW5nIHwgQXJyYXlCdWZmZXIpOiB2b2lkIH0pLnNlbmQocGF5bG9hZCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHRoaXMucXVldWVJbnB1dChwYXlsb2FkKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBxdWV1ZUlucHV0KHBheWxvYWQ6IHN0cmluZyB8IEFycmF5QnVmZmVyKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5wZW5kaW5nSW5wdXQubGVuZ3RoID49IHRoaXMubWF4UGVuZGluZ0lucHV0KSB7XHJcbiAgICAgIHRoaXMucGVuZGluZ0lucHV0LnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBlbmRpbmdJbnB1dC5wdXNoKHBheWxvYWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmbHVzaFBlbmRpbmdJbnB1dCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5pbnB1dENoYW5uZWwgfHwgdGhpcy5pbnB1dENoYW5uZWwucmVhZHlTdGF0ZSAhPT0gJ29wZW4nKSByZXR1cm47XHJcbiAgICBpZiAoIXRoaXMucGVuZGluZ0lucHV0Lmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgY29uc3QgcGVuZGluZyA9IHRoaXMucGVuZGluZ0lucHV0O1xyXG4gICAgdGhpcy5wZW5kaW5nSW5wdXQgPSBbXTtcclxuICAgIGZvciAoY29uc3QgcGF5bG9hZCBvZiBwZW5kaW5nKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgKHRoaXMuaW5wdXRDaGFubmVsIGFzIHVua25vd24gYXMgeyBzZW5kKGQ6IHN0cmluZyB8IEFycmF5QnVmZmVyKTogdm9pZCB9KS5zZW5kKHBheWxvYWQpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnF1ZXVlSW5wdXQocGF5bG9hZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhcnRTdGF0c1BvbGxpbmcoY2FsbGJhY2tzOiBXZWJSdGNDbGllbnRDYWxsYmFja3MpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5wYykgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuc3RhdHNUaW1lcikgcmV0dXJuO1xyXG4gICAgY29uc3QgcG9sbCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgaWYgKCF0aGlzLnBjKSByZXR1cm47XHJcbiAgICAgIGxldCBzbmFwc2hvdDogV2ViUnRjU3RhdHNTbmFwc2hvdCB8IG51bGwgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgdGhpcy5wYy5nZXRTdGF0cygpO1xyXG4gICAgICAgIHNuYXBzaG90ID0gdGhpcy5leHRyYWN0U3RhdHMoc3RhdHMpO1xyXG4gICAgICAgIGNhbGxiYWNrcy5vblN0YXRzPy4oc25hcHNob3QpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnBjKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgIGNvbnN0IGppdHRlciA9IHNuYXBzaG90Py52aWRlb1BsYXlvdXREZWxheU1zID8/IHNuYXBzaG90Py52aWRlb0ppdHRlckJ1ZmZlck1zO1xyXG4gICAgICBpZiAodHlwZW9mIGppdHRlciA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKGppdHRlcikgJiYgaml0dGVyID49IFNUQVRTX1BPTExfRkFTVF9KSVRURVJfVEhSRVNIT0xEX01TKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0c0Zhc3RVbnRpbE1zID0gTWF0aC5tYXgodGhpcy5zdGF0c0Zhc3RVbnRpbE1zID8/IDAsIG5vdyArIFNUQVRTX1BPTExfRkFTVF9IT0xEX01TKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzaG91bGRGYXN0ID0gKHRoaXMuc3RhdHNGYXN0VW50aWxNcyAhPSBudWxsICYmIG5vdyA8PSB0aGlzLnN0YXRzRmFzdFVudGlsTXMpIHx8XHJcbiAgICAgICAgKHRoaXMuc3RhdHNDb25uZWN0ZWRBdE1zICE9IG51bGwgJiYgbm93IC0gdGhpcy5zdGF0c0Nvbm5lY3RlZEF0TXMgPD0gU1RBVFNfUE9MTF9GQVNUX0JPT1RfTVMpO1xyXG4gICAgICBjb25zdCBkZWxheSA9IHNob3VsZEZhc3QgPyBTVEFUU19QT0xMX0ZBU1RfTVMgOiBTVEFUU19QT0xMX1NMT1dfTVM7XHJcbiAgICAgIHRoaXMuc3RhdHNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnN0YXRzVGltZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdm9pZCBwb2xsKCk7XHJcbiAgICAgIH0sIGRlbGF5KTtcclxuICAgIH07XHJcbiAgICB2b2lkIHBvbGwoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgZmx1c2hQZW5kaW5nQ2FuZGlkYXRlcygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghdGhpcy5wYyB8fCAhdGhpcy5wYy5yZW1vdGVEZXNjcmlwdGlvbiB8fCAhdGhpcy5wZW5kaW5nUmVtb3RlQ2FuZGlkYXRlcy5sZW5ndGgpIHJldHVybjtcclxuICAgIGNvbnN0IHBjID0gdGhpcy5wYztcclxuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdSZW1vdGVDYW5kaWRhdGVzO1xyXG4gICAgdGhpcy5wZW5kaW5nUmVtb3RlQ2FuZGlkYXRlcyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgcGVuZGluZykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHBjLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjbGVhckF1dG9EaXNjb25uZWN0VGltZXIoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hdXRvRGlzY29ubmVjdFRpbWVyKSB7XHJcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5hdXRvRGlzY29ubmVjdFRpbWVyKTtcclxuICAgICAgdGhpcy5hdXRvRGlzY29ubmVjdFRpbWVyID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZUF1dG9EaXNjb25uZWN0KGRlbGF5TXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuZGlzY29ubmVjdGluZyB8fCAhdGhpcy5zZXNzaW9uSWQpIHJldHVybjtcclxuICAgIHRoaXMuY2xlYXJBdXRvRGlzY29ubmVjdFRpbWVyKCk7XHJcbiAgICBpZiAoZGVsYXlNcyA8PSAwKSB7XHJcbiAgICAgIHZvaWQgdGhpcy5kaXNjb25uZWN0KCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0b0Rpc2Nvbm5lY3RUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5hdXRvRGlzY29ubmVjdFRpbWVyID0gdW5kZWZpbmVkO1xyXG4gICAgICB2b2lkIHRoaXMuZGlzY29ubmVjdCgpO1xyXG4gICAgfSwgZGVsYXlNcyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGV4dHJhY3RTdGF0cyhyZXBvcnQ6IFJUQ1N0YXRzUmVwb3J0KTogV2ViUnRjU3RhdHNTbmFwc2hvdCB7XHJcbiAgICBjb25zdCBpbmJvdW5kVmlkZW86IGFueVtdID0gW107XHJcbiAgICBjb25zdCBpbmJvdW5kQXVkaW86IGFueVtdID0gW107XHJcbiAgICBsZXQgcnR0TXM6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICAgIGxldCBzZWxlY3RlZFBhaXI6IGFueSB8IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xyXG5cclxuICAgIHJlcG9ydC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdpbmJvdW5kLXJ0cCcgJiYgaXRlbS5raW5kID09PSAndmlkZW8nKSB7XHJcbiAgICAgICAgaW5ib3VuZFZpZGVvLnB1c2goaXRlbSBhcyBhbnkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdpbmJvdW5kLXJ0cCcgJiYgaXRlbS5raW5kID09PSAnYXVkaW8nKSB7XHJcbiAgICAgICAgaW5ib3VuZEF1ZGlvLnB1c2goaXRlbSBhcyBhbnkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdjYW5kaWRhdGUtcGFpcicgJiYgKGl0ZW0gYXMgYW55KS5zdGF0ZSA9PT0gJ3N1Y2NlZWRlZCcpIHtcclxuICAgICAgICBydHRNcyA9IChpdGVtIGFzIGFueSkuY3VycmVudFJvdW5kVHJpcFRpbWVcclxuICAgICAgICAgID8gKGl0ZW0gYXMgYW55KS5jdXJyZW50Um91bmRUcmlwVGltZSAqIDEwMDBcclxuICAgICAgICAgIDogcnR0TXM7XHJcbiAgICAgICAgaWYgKChpdGVtIGFzIGFueSkuc2VsZWN0ZWQgfHwgKGl0ZW0gYXMgYW55KS5ub21pbmF0ZWQgfHwgIXNlbGVjdGVkUGFpcikge1xyXG4gICAgICAgICAgc2VsZWN0ZWRQYWlyID0gaXRlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2xvY2FsLWNhbmRpZGF0ZScgfHwgaXRlbS50eXBlID09PSAncmVtb3RlLWNhbmRpZGF0ZScpIHtcclxuICAgICAgICBjYW5kaWRhdGVzLnNldChpdGVtLmlkLCBpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcGlja0luYm91bmQgPSAoaXRlbXM6IGFueVtdKTogYW55IHwgdW5kZWZpbmVkID0+IHtcclxuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIGNvbnN0IGFzTnVtYmVyID0gKHZhbHVlOiB1bmtub3duKTogbnVtYmVyID0+ICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiAwKTtcclxuICAgICAgY29uc3Qgc29ydGVkID0gWy4uLml0ZW1zXS5zb3J0KChsZWZ0LCByaWdodCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxlZnRGcmFtZXNEZWNvZGVkID0gYXNOdW1iZXIobGVmdC5mcmFtZXNEZWNvZGVkKTtcclxuICAgICAgICBjb25zdCByaWdodEZyYW1lc0RlY29kZWQgPSBhc051bWJlcihyaWdodC5mcmFtZXNEZWNvZGVkKTtcclxuICAgICAgICBjb25zdCBsZWZ0RnJhbWVzUmVjZWl2ZWQgPSBhc051bWJlcihsZWZ0LmZyYW1lc1JlY2VpdmVkKTtcclxuICAgICAgICBjb25zdCByaWdodEZyYW1lc1JlY2VpdmVkID0gYXNOdW1iZXIocmlnaHQuZnJhbWVzUmVjZWl2ZWQpO1xyXG4gICAgICAgIGNvbnN0IGxlZnRIYXNGcmFtZXMgPSBsZWZ0RnJhbWVzRGVjb2RlZCA+IDAgfHwgbGVmdEZyYW1lc1JlY2VpdmVkID4gMDtcclxuICAgICAgICBjb25zdCByaWdodEhhc0ZyYW1lcyA9IHJpZ2h0RnJhbWVzRGVjb2RlZCA+IDAgfHwgcmlnaHRGcmFtZXNSZWNlaXZlZCA+IDA7XHJcbiAgICAgICAgaWYgKGxlZnRIYXNGcmFtZXMgIT09IHJpZ2h0SGFzRnJhbWVzKSB7XHJcbiAgICAgICAgICByZXR1cm4gbGVmdEhhc0ZyYW1lcyA/IC0xIDogMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxlZnRGcmFtZXNEZWNvZGVkICE9PSByaWdodEZyYW1lc0RlY29kZWQpIHtcclxuICAgICAgICAgIHJldHVybiByaWdodEZyYW1lc0RlY29kZWQgLSBsZWZ0RnJhbWVzRGVjb2RlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxlZnRGcmFtZXNSZWNlaXZlZCAhPT0gcmlnaHRGcmFtZXNSZWNlaXZlZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHJpZ2h0RnJhbWVzUmVjZWl2ZWQgLSBsZWZ0RnJhbWVzUmVjZWl2ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxlZnRCeXRlcyA9IGFzTnVtYmVyKGxlZnQuYnl0ZXNSZWNlaXZlZCk7XHJcbiAgICAgICAgY29uc3QgcmlnaHRCeXRlcyA9IGFzTnVtYmVyKHJpZ2h0LmJ5dGVzUmVjZWl2ZWQpO1xyXG4gICAgICAgIGlmIChsZWZ0Qnl0ZXMgIT09IHJpZ2h0Qnl0ZXMpIHtcclxuICAgICAgICAgIHJldHVybiByaWdodEJ5dGVzIC0gbGVmdEJ5dGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsZWZ0UGFja2V0cyA9IGFzTnVtYmVyKGxlZnQucGFja2V0c1JlY2VpdmVkKTtcclxuICAgICAgICBjb25zdCByaWdodFBhY2tldHMgPSBhc051bWJlcihyaWdodC5wYWNrZXRzUmVjZWl2ZWQpO1xyXG4gICAgICAgIHJldHVybiByaWdodFBhY2tldHMgLSBsZWZ0UGFja2V0cztcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBzb3J0ZWRbMF07XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHZpZGVvSW5ib3VuZCA9IHBpY2tJbmJvdW5kKGluYm91bmRWaWRlbyk7XHJcbiAgICBjb25zdCBhdWRpb0luYm91bmQgPSBwaWNrSW5ib3VuZChpbmJvdW5kQXVkaW8pO1xyXG5cclxuICAgIGNvbnN0IHZpZGVvSW5ib3VuZElkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB2aWRlb0luYm91bmQ/LmlkO1xyXG4gICAgY29uc3QgYXVkaW9JbmJvdW5kSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGF1ZGlvSW5ib3VuZD8uaWQ7XHJcblxyXG4gICAgY29uc3QgdmlkZW9CeXRlczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy5ieXRlc1JlY2VpdmVkO1xyXG4gICAgY29uc3QgYXVkaW9CeXRlczogbnVtYmVyIHwgdW5kZWZpbmVkID0gYXVkaW9JbmJvdW5kPy5ieXRlc1JlY2VpdmVkO1xyXG4gICAgY29uc3QgaW5ib3VuZFZpZGVvRnBzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB2aWRlb0luYm91bmQ/LmZyYW1lc1BlclNlY29uZDtcclxuICAgIGNvbnN0IHBhY2tldHNMb3N0OiBudW1iZXIgfCB1bmRlZmluZWQgPVxyXG4gICAgICAodHlwZW9mIHZpZGVvSW5ib3VuZD8ucGFja2V0c0xvc3QgPT09ICdudW1iZXInID8gdmlkZW9JbmJvdW5kLnBhY2tldHNMb3N0IDogdW5kZWZpbmVkKSA/P1xyXG4gICAgICAodHlwZW9mIGF1ZGlvSW5ib3VuZD8ucGFja2V0c0xvc3QgPT09ICdudW1iZXInID8gYXVkaW9JbmJvdW5kLnBhY2tldHNMb3N0IDogdW5kZWZpbmVkKTtcclxuICAgIGNvbnN0IHZpZGVvUGFja2V0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy5wYWNrZXRzUmVjZWl2ZWQ7XHJcbiAgICBjb25zdCBhdWRpb1BhY2tldHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IGF1ZGlvSW5ib3VuZD8ucGFja2V0c1JlY2VpdmVkO1xyXG4gICAgY29uc3QgdmlkZW9GcmFtZXNSZWNlaXZlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy5mcmFtZXNSZWNlaXZlZDtcclxuICAgIGNvbnN0IHZpZGVvRnJhbWVzRGVjb2RlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy5mcmFtZXNEZWNvZGVkO1xyXG4gICAgY29uc3QgdmlkZW9GcmFtZXNEcm9wcGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB2aWRlb0luYm91bmQ/LmZyYW1lc0Ryb3BwZWQ7XHJcbiAgICBjb25zdCB2aWRlb1RvdGFsRGVjb2RlVGltZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy50b3RhbERlY29kZVRpbWU7XHJcbiAgICBjb25zdCB2aWRlb0ppdHRlck1zOiBudW1iZXIgfCB1bmRlZmluZWQgPVxyXG4gICAgICB0eXBlb2YgdmlkZW9JbmJvdW5kPy5qaXR0ZXIgPT09ICdudW1iZXInID8gdmlkZW9JbmJvdW5kLmppdHRlciAqIDEwMDAgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBhdWRpb0ppdHRlck1zOiBudW1iZXIgfCB1bmRlZmluZWQgPVxyXG4gICAgICB0eXBlb2YgYXVkaW9JbmJvdW5kPy5qaXR0ZXIgPT09ICdudW1iZXInID8gYXVkaW9JbmJvdW5kLmppdHRlciAqIDEwMDAgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCB2aWRlb0ppdHRlckJ1ZmZlckRlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB2aWRlb0luYm91bmQ/LmppdHRlckJ1ZmZlckRlbGF5O1xyXG4gICAgY29uc3QgdmlkZW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9XHJcbiAgICAgIHZpZGVvSW5ib3VuZD8uaml0dGVyQnVmZmVyRW1pdHRlZENvdW50O1xyXG4gICAgY29uc3QgYXVkaW9KaXR0ZXJCdWZmZXJEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gYXVkaW9JbmJvdW5kPy5qaXR0ZXJCdWZmZXJEZWxheTtcclxuICAgIGNvbnN0IGF1ZGlvSml0dGVyQnVmZmVyRW1pdHRlZENvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPVxyXG4gICAgICBhdWRpb0luYm91bmQ/LmppdHRlckJ1ZmZlckVtaXR0ZWRDb3VudDtcclxuICAgIGNvbnN0IHZpZGVvQ29kZWNJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdmlkZW9JbmJvdW5kPy5jb2RlY0lkO1xyXG4gICAgY29uc3QgYXVkaW9Db2RlY0lkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBhdWRpb0luYm91bmQ/LmNvZGVjSWQ7XHJcblxyXG4gICAgbGV0IHZpZGVvQ29kZWM6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIGxldCBhdWRpb0NvZGVjOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICBpZiAodmlkZW9Db2RlY0lkKSB7XHJcbiAgICAgIGNvbnN0IGNvZGVjID0gcmVwb3J0LmdldCh2aWRlb0NvZGVjSWQpIGFzIGFueTtcclxuICAgICAgaWYgKGNvZGVjPy5taW1lVHlwZSkge1xyXG4gICAgICAgIHZpZGVvQ29kZWMgPSBjb2RlYy5taW1lVHlwZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGF1ZGlvQ29kZWNJZCkge1xyXG4gICAgICBjb25zdCBjb2RlYyA9IHJlcG9ydC5nZXQoYXVkaW9Db2RlY0lkKSBhcyBhbnk7XHJcbiAgICAgIGlmIChjb2RlYz8ubWltZVR5cGUpIHtcclxuICAgICAgICBhdWRpb0NvZGVjID0gY29kZWMubWltZVR5cGU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2FuZGlkYXRlUGFpcjogV2ViUnRjU3RhdHNTbmFwc2hvdFsnY2FuZGlkYXRlUGFpciddO1xyXG4gICAgaWYgKHNlbGVjdGVkUGFpcikge1xyXG4gICAgICBjb25zdCBsb2NhbCA9IGNhbmRpZGF0ZXMuZ2V0KChzZWxlY3RlZFBhaXIgYXMgYW55KS5sb2NhbENhbmRpZGF0ZUlkKTtcclxuICAgICAgY29uc3QgcmVtb3RlID0gY2FuZGlkYXRlcy5nZXQoKHNlbGVjdGVkUGFpciBhcyBhbnkpLnJlbW90ZUNhbmRpZGF0ZUlkKTtcclxuICAgICAgY2FuZGlkYXRlUGFpciA9IHtcclxuICAgICAgICBzdGF0ZTogKHNlbGVjdGVkUGFpciBhcyBhbnkpLnN0YXRlLFxyXG4gICAgICAgIHByb3RvY29sOiAoc2VsZWN0ZWRQYWlyIGFzIGFueSkucHJvdG9jb2wsXHJcbiAgICAgICAgbG9jYWxBZGRyZXNzOiBsb2NhbD8uYWRkcmVzcyxcclxuICAgICAgICBsb2NhbFBvcnQ6IGxvY2FsPy5wb3J0LFxyXG4gICAgICAgIGxvY2FsVHlwZTogbG9jYWw/LmNhbmRpZGF0ZVR5cGUsXHJcbiAgICAgICAgcmVtb3RlQWRkcmVzczogcmVtb3RlPy5hZGRyZXNzLFxyXG4gICAgICAgIHJlbW90ZVBvcnQ6IHJlbW90ZT8ucG9ydCxcclxuICAgICAgICByZW1vdGVUeXBlOiByZW1vdGU/LmNhbmRpZGF0ZVR5cGUsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IGxhc3QgPSB0aGlzLnN0YXRzU3RhdGU7XHJcbiAgICBjb25zdCBkZWx0YU1zID0gbGFzdC5sYXN0VGltZXN0YW1wTXMgPyBNYXRoLm1heCgxLCBub3cgLSBsYXN0Lmxhc3RUaW1lc3RhbXBNcykgOiAwO1xyXG4gICAgY29uc3Qgc2FtZVZpZGVvSW5ib3VuZCA9IHZpZGVvSW5ib3VuZElkICYmIGxhc3QubGFzdFZpZGVvSW5ib3VuZElkID09PSB2aWRlb0luYm91bmRJZDtcclxuICAgIGNvbnN0IHNhbWVBdWRpb0luYm91bmQgPSBhdWRpb0luYm91bmRJZCAmJiBsYXN0Lmxhc3RBdWRpb0luYm91bmRJZCA9PT0gYXVkaW9JbmJvdW5kSWQ7XHJcbiAgICBjb25zdCBjYWxjUmF0ZSA9IChieXRlcz86IG51bWJlciwgbGFzdEJ5dGVzPzogbnVtYmVyKSA9PiB7XHJcbiAgICAgIGlmIChieXRlcyA9PSBudWxsIHx8IGxhc3RCeXRlcyA9PSBudWxsIHx8ICFkZWx0YU1zKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICByZXR1cm4gTWF0aC5yb3VuZCgoKGJ5dGVzIC0gbGFzdEJ5dGVzKSAqIDgpIC8gZGVsdGFNcyk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgY2FsY0ZwcyA9IChmcmFtZXM/OiBudW1iZXIsIGxhc3RGcmFtZXM/OiBudW1iZXIpID0+IHtcclxuICAgICAgaWYgKGZyYW1lcyA9PSBudWxsIHx8IGxhc3RGcmFtZXMgPT0gbnVsbCB8fCAhZGVsdGFNcykgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgY29uc3QgZGVsdGFGcmFtZXMgPSBmcmFtZXMgLSBsYXN0RnJhbWVzO1xyXG4gICAgICBpZiAoZGVsdGFGcmFtZXMgPD0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgcmV0dXJuIChkZWx0YUZyYW1lcyAqIDEwMDApIC8gZGVsdGFNcztcclxuICAgIH07XHJcbiAgICBjb25zdCB2aWRlb0JpdHJhdGUgPSBjYWxjUmF0ZSh2aWRlb0J5dGVzLCBzYW1lVmlkZW9JbmJvdW5kID8gbGFzdC5sYXN0VmlkZW9CeXRlcyA6IHVuZGVmaW5lZCk7XHJcbiAgICBjb25zdCBhdWRpb0JpdHJhdGUgPSBjYWxjUmF0ZShhdWRpb0J5dGVzLCBzYW1lQXVkaW9JbmJvdW5kID8gbGFzdC5sYXN0QXVkaW9CeXRlcyA6IHVuZGVmaW5lZCk7XHJcbiAgICBjb25zdCBjYWxjSml0dGVyQnVmZmVyTXMgPSAoXHJcbiAgICAgIGRlbGF5PzogbnVtYmVyLFxyXG4gICAgICBlbWl0dGVkPzogbnVtYmVyLFxyXG4gICAgICBsYXN0RGVsYXk/OiBudW1iZXIsXHJcbiAgICAgIGxhc3RFbWl0dGVkPzogbnVtYmVyLFxyXG4gICAgKSA9PiB7XHJcbiAgICAgIGlmIChkZWxheSA9PSBudWxsIHx8IGVtaXR0ZWQgPT0gbnVsbCB8fCBlbWl0dGVkIDw9IDApIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIGlmIChsYXN0RGVsYXkgPT0gbnVsbCB8fCBsYXN0RW1pdHRlZCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICBjb25zdCBkZWx0YURlbGF5ID0gZGVsYXkgLSBsYXN0RGVsYXk7XHJcbiAgICAgIGNvbnN0IGRlbHRhRW1pdHRlZCA9IGVtaXR0ZWQgLSBsYXN0RW1pdHRlZDtcclxuICAgICAgaWYgKGRlbHRhRW1pdHRlZCA8PSAwIHx8IGRlbHRhRGVsYXkgPCAwKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICByZXR1cm4gKGRlbHRhRGVsYXkgLyBkZWx0YUVtaXR0ZWQpICogMTAwMDtcclxuICAgIH07XHJcbiAgICAvLyBOb3RlOiBjYWxjUGxheW91dERlbGF5TXMgYXR0ZW1wdHMgdG8gY29tcHV0ZSBkZWxheSBmcm9tIGVzdGltYXRlZFBsYXlvdXRUaW1lc3RhbXBcclxuICAgIC8vIGJ1dCB0aGlzIGlzIHVucmVsaWFibGUgZHVlIHRvIHRpbWVzdGFtcCBmb3JtYXQgYW1iaWd1aXR5LiBXZSBwcmVmZXIgaml0dGVyQnVmZmVyTXNcclxuICAgIC8vIHdoaWNoIGlzIHdlbGwtZGVmaW5lZC4gS2VlcGluZyB0aGlzIGZ1bmN0aW9uIGZvciBwb3RlbnRpYWwgZnV0dXJlIHVzZSBpZiBicm93c2Vyc1xyXG4gICAgLy8gc3RhbmRhcmRpemUgdGhlIGZvcm1hdC5cclxuICAgIGNvbnN0IGNhbGNQbGF5b3V0RGVsYXlNcyA9IChpbmJvdW5kPzogYW55KTogbnVtYmVyIHwgdW5kZWZpbmVkID0+IHtcclxuICAgICAgLy8gZXN0aW1hdGVkUGxheW91dFRpbWVzdGFtcCByZXByZXNlbnRzIFdIRU4gY29udGVudCB3aWxsIHBsYXkgKHdhbGwtY2xvY2sgdGltZSksXHJcbiAgICAgIC8vIG5vdCB0aGUgZGVsYXkuIFRoZSBjb21wdXRhdGlvbiBpcyBjb21wbGV4IGFuZCBicm93c2VyLWRlcGVuZGVudC5cclxuICAgICAgLy8gUmV0dXJuIHVuZGVmaW5lZCB0byBmYWxsIGJhY2sgdG8gZGVsdGEtYmFzZWQgaml0dGVyQnVmZmVyTXMuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgY2FsY0RlY29kZU1zID0gKFxyXG4gICAgICB0b3RhbERlY29kZVRpbWU/OiBudW1iZXIsXHJcbiAgICAgIGZyYW1lc0RlY29kZWQ/OiBudW1iZXIsXHJcbiAgICAgIGxhc3RUb3RhbERlY29kZVRpbWU/OiBudW1iZXIsXHJcbiAgICAgIGxhc3RGcmFtZXNEZWNvZGVkPzogbnVtYmVyLFxyXG4gICAgKSA9PiB7XHJcbiAgICAgIGlmICh0b3RhbERlY29kZVRpbWUgPT0gbnVsbCB8fCBmcmFtZXNEZWNvZGVkID09IG51bGwgfHwgZnJhbWVzRGVjb2RlZCA8PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAvLyBVc2UgZGVsdGEtYmFzZWQgY2FsY3VsYXRpb24gaWYgd2UgaGF2ZSBwcmV2aW91cyB2YWx1ZXNcclxuICAgICAgaWYgKGxhc3RUb3RhbERlY29kZVRpbWUgIT0gbnVsbCAmJiBsYXN0RnJhbWVzRGVjb2RlZCAhPSBudWxsKSB7XHJcbiAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gdG90YWxEZWNvZGVUaW1lIC0gbGFzdFRvdGFsRGVjb2RlVGltZTtcclxuICAgICAgICBjb25zdCBkZWx0YUZyYW1lcyA9IGZyYW1lc0RlY29kZWQgLSBsYXN0RnJhbWVzRGVjb2RlZDtcclxuICAgICAgICBpZiAoZGVsdGFGcmFtZXMgPiAwICYmIGRlbHRhVGltZSA+PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gKGRlbHRhVGltZSAvIGRlbHRhRnJhbWVzKSAqIDEwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIEZhbGwgYmFjayB0byBsaWZldGltZSBhdmVyYWdlIGZvciBmaXJzdCBzYW1wbGVcclxuICAgICAgcmV0dXJuICh0b3RhbERlY29kZVRpbWUgLyBmcmFtZXNEZWNvZGVkKSAqIDEwMDA7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgdmlkZW9KaXR0ZXJCdWZmZXJNcyA9IGNhbGNKaXR0ZXJCdWZmZXJNcyhcclxuICAgICAgdmlkZW9KaXR0ZXJCdWZmZXJEZWxheSxcclxuICAgICAgdmlkZW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQsXHJcbiAgICAgIHNhbWVWaWRlb0luYm91bmQgPyBsYXN0Lmxhc3RWaWRlb0ppdHRlckJ1ZmZlckRlbGF5IDogdW5kZWZpbmVkLFxyXG4gICAgICBzYW1lVmlkZW9JbmJvdW5kID8gbGFzdC5sYXN0VmlkZW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQgOiB1bmRlZmluZWQsXHJcbiAgICApO1xyXG4gICAgY29uc3QgYXVkaW9KaXR0ZXJCdWZmZXJNcyA9IGNhbGNKaXR0ZXJCdWZmZXJNcyhcclxuICAgICAgYXVkaW9KaXR0ZXJCdWZmZXJEZWxheSxcclxuICAgICAgYXVkaW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQsXHJcbiAgICAgIHNhbWVBdWRpb0luYm91bmQgPyBsYXN0Lmxhc3RBdWRpb0ppdHRlckJ1ZmZlckRlbGF5IDogdW5kZWZpbmVkLFxyXG4gICAgICBzYW1lQXVkaW9JbmJvdW5kID8gbGFzdC5sYXN0QXVkaW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQgOiB1bmRlZmluZWQsXHJcbiAgICApO1xyXG4gICAgY29uc3QgdmlkZW9EZWNvZGVNcyA9IGNhbGNEZWNvZGVNcyhcclxuICAgICAgdmlkZW9Ub3RhbERlY29kZVRpbWUsXHJcbiAgICAgIHZpZGVvRnJhbWVzRGVjb2RlZCxcclxuICAgICAgc2FtZVZpZGVvSW5ib3VuZCA/IGxhc3QubGFzdFZpZGVvVG90YWxEZWNvZGVUaW1lIDogdW5kZWZpbmVkLFxyXG4gICAgICBzYW1lVmlkZW9JbmJvdW5kID8gbGFzdC5sYXN0VmlkZW9GcmFtZXNEZWNvZGVkIDogdW5kZWZpbmVkLFxyXG4gICAgKTtcclxuICAgIGNvbnN0IHZpZGVvRnBzRnJvbURlY29kZWQgPSBjYWxjRnBzKFxyXG4gICAgICB2aWRlb0ZyYW1lc0RlY29kZWQsXHJcbiAgICAgIHNhbWVWaWRlb0luYm91bmQgPyBsYXN0Lmxhc3RWaWRlb0ZyYW1lc0RlY29kZWQgOiB1bmRlZmluZWQsXHJcbiAgICApO1xyXG4gICAgY29uc3QgdmlkZW9GcHNGcm9tUmVjZWl2ZWQgPSBjYWxjRnBzKFxyXG4gICAgICB2aWRlb0ZyYW1lc1JlY2VpdmVkLFxyXG4gICAgICBzYW1lVmlkZW9JbmJvdW5kID8gbGFzdC5sYXN0VmlkZW9GcmFtZXNSZWNlaXZlZCA6IHVuZGVmaW5lZCxcclxuICAgICk7XHJcbiAgICBjb25zdCB2aWRlb0ZwcyA9IHZpZGVvRnBzRnJvbURlY29kZWQgPz8gdmlkZW9GcHNGcm9tUmVjZWl2ZWQgPz8gaW5ib3VuZFZpZGVvRnBzO1xyXG4gICAgY29uc3QgdmlkZW9QbGF5b3V0RGVsYXlNcyA9IGNhbGNQbGF5b3V0RGVsYXlNcyh2aWRlb0luYm91bmQpO1xyXG4gICAgY29uc3QgYXVkaW9QbGF5b3V0RGVsYXlNcyA9IGNhbGNQbGF5b3V0RGVsYXlNcyhhdWRpb0luYm91bmQpO1xyXG5cclxuICAgIHRoaXMuc3RhdHNTdGF0ZSA9IHtcclxuICAgICAgbGFzdFRpbWVzdGFtcE1zOiBub3csXHJcbiAgICAgIGxhc3RWaWRlb0luYm91bmRJZDogdmlkZW9JbmJvdW5kSWQsXHJcbiAgICAgIGxhc3RBdWRpb0luYm91bmRJZDogYXVkaW9JbmJvdW5kSWQsXHJcbiAgICAgIGxhc3RWaWRlb0J5dGVzOiB2aWRlb0J5dGVzLFxyXG4gICAgICBsYXN0QXVkaW9CeXRlczogYXVkaW9CeXRlcyxcclxuICAgICAgbGFzdFZpZGVvSml0dGVyQnVmZmVyRGVsYXk6IHZpZGVvSml0dGVyQnVmZmVyRGVsYXksXHJcbiAgICAgIGxhc3RWaWRlb0ppdHRlckJ1ZmZlckVtaXR0ZWRDb3VudDogdmlkZW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQsXHJcbiAgICAgIGxhc3RBdWRpb0ppdHRlckJ1ZmZlckRlbGF5OiBhdWRpb0ppdHRlckJ1ZmZlckRlbGF5LFxyXG4gICAgICBsYXN0QXVkaW9KaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQ6IGF1ZGlvSml0dGVyQnVmZmVyRW1pdHRlZENvdW50LFxyXG4gICAgICBsYXN0VmlkZW9Ub3RhbERlY29kZVRpbWU6IHZpZGVvVG90YWxEZWNvZGVUaW1lLFxyXG4gICAgICBsYXN0VmlkZW9GcmFtZXNEZWNvZGVkOiB2aWRlb0ZyYW1lc0RlY29kZWQsXHJcbiAgICAgIGxhc3RWaWRlb0ZyYW1lc1JlY2VpdmVkOiB2aWRlb0ZyYW1lc1JlY2VpdmVkLFxyXG4gICAgfSBhcyBTdGF0c1N0YXRlO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHZpZGVvQml0cmF0ZUticHM6IHZpZGVvQml0cmF0ZSA/IE1hdGgubWF4KDAsIHZpZGVvQml0cmF0ZSkgOiB1bmRlZmluZWQsXHJcbiAgICAgIGF1ZGlvQml0cmF0ZUticHM6IGF1ZGlvQml0cmF0ZSA/IE1hdGgubWF4KDAsIGF1ZGlvQml0cmF0ZSkgOiB1bmRlZmluZWQsXHJcbiAgICAgIHZpZGVvRnBzLFxyXG4gICAgICBwYWNrZXRzTG9zdCxcclxuICAgICAgcm91bmRUcmlwVGltZU1zOiBydHRNcyxcclxuICAgICAgdmlkZW9CeXRlc1JlY2VpdmVkOiB2aWRlb0J5dGVzLFxyXG4gICAgICBhdWRpb0J5dGVzUmVjZWl2ZWQ6IGF1ZGlvQnl0ZXMsXHJcbiAgICAgIHZpZGVvUGFja2V0c1JlY2VpdmVkOiB2aWRlb1BhY2tldHMsXHJcbiAgICAgIGF1ZGlvUGFja2V0c1JlY2VpdmVkOiBhdWRpb1BhY2tldHMsXHJcbiAgICAgIHZpZGVvRnJhbWVzUmVjZWl2ZWQsXHJcbiAgICAgIHZpZGVvRnJhbWVzRGVjb2RlZCxcclxuICAgICAgdmlkZW9GcmFtZXNEcm9wcGVkLFxyXG4gICAgICB2aWRlb0RlY29kZU1zLFxyXG4gICAgICB2aWRlb0ppdHRlck1zLFxyXG4gICAgICBhdWRpb0ppdHRlck1zLFxyXG4gICAgICB2aWRlb0ppdHRlckJ1ZmZlck1zLFxyXG4gICAgICBhdWRpb0ppdHRlckJ1ZmZlck1zLFxyXG4gICAgICB2aWRlb1BsYXlvdXREZWxheU1zLFxyXG4gICAgICBhdWRpb1BsYXlvdXREZWxheU1zLFxyXG4gICAgICB2aWRlb0NvZGVjLFxyXG4gICAgICBhdWRpb0NvZGVjLFxyXG4gICAgICBjYW5kaWRhdGVQYWlyLFxyXG4gICAgfSBhcyBXZWJSdGNTdGF0c1NuYXBzaG90O1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBHYW1lcGFkRmVlZGJhY2tNZXNzYWdlLCBJbnB1dE1lc3NhZ2UgfSBmcm9tICdAL3R5cGVzL3dlYnJ0Yyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElucHV0Q2FwdHVyZU1ldHJpY3Mge1xyXG4gIGxhc3RNb3ZlRGVsYXlNcz86IG51bWJlcjtcclxuICBhdmdNb3ZlRGVsYXlNcz86IG51bWJlcjtcclxuICBtYXhNb3ZlRGVsYXlNcz86IG51bWJlcjtcclxuICBsYXN0TW92ZUV2ZW50TGFnTXM/OiBudW1iZXI7XHJcbiAgYXZnTW92ZUV2ZW50TGFnTXM/OiBudW1iZXI7XHJcbiAgbWF4TW92ZUV2ZW50TGFnTXM/OiBudW1iZXI7XHJcbiAgbW92ZVJhdGVIej86IG51bWJlcjtcclxuICBtb3ZlU2VuZFJhdGVIej86IG51bWJlcjtcclxuICBtb3ZlQ29hbGVzY2VSYXRpbz86IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIElucHV0Q2FwdHVyZU9wdGlvbnMge1xyXG4gIHZpZGVvPzogSFRNTFZpZGVvRWxlbWVudCB8IG51bGw7XHJcbiAgb25NZXRyaWNzPzogKG1ldHJpY3M6IElucHV0Q2FwdHVyZU1ldHJpY3MpID0+IHZvaWQ7XHJcbiAgZ2FtZXBhZD86IGJvb2xlYW47XHJcbiAgc2hvdWxkRHJvcD86IChwYXlsb2FkOiBJbnB1dE1lc3NhZ2UpID0+IGJvb2xlYW47XHJcbn1cclxuXHJcbmNvbnN0IFdIRUVMX1NURVBfUElYRUxTID0gMTIwO1xyXG5jb25zdCBTWVNURU1fS0VZX0NPREVTID0gW1xyXG4gICdBbHRMZWZ0JyxcclxuICAnQWx0UmlnaHQnLFxyXG4gICdDb250cm9sTGVmdCcsXHJcbiAgJ0NvbnRyb2xSaWdodCcsXHJcbiAgJ0VzY2FwZScsXHJcbiAgJ01ldGFMZWZ0JyxcclxuICAnTWV0YVJpZ2h0JyxcclxuICAnU3BhY2UnLFxyXG4gICdUYWInLFxyXG5dO1xyXG5cclxuZnVuY3Rpb24gZ2V0S2V5Ym9hcmRMb2NrQXBpKCk6IHtcclxuICBsb2NrPzogKGtleXM/OiBzdHJpbmdbXSkgPT4gUHJvbWlzZTx2b2lkPjtcclxuICB1bmxvY2s/OiAoKSA9PiB2b2lkO1xyXG59IHwgbnVsbCB7XHJcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCBhbnlOYXZpZ2F0b3IgPSBuYXZpZ2F0b3IgYXMgTmF2aWdhdG9yICYge1xyXG4gICAga2V5Ym9hcmQ/OiB7IGxvY2s/OiAoa2V5cz86IHN0cmluZ1tdKSA9PiBQcm9taXNlPHZvaWQ+OyB1bmxvY2s/OiAoKSA9PiB2b2lkIH07XHJcbiAgfTtcclxuICByZXR1cm4gYW55TmF2aWdhdG9yLmtleWJvYXJkID8/IG51bGw7XHJcbn1cclxuXHJcbmxldCBrZXlib2FyZExvY2tQZW5kaW5nOiBQcm9taXNlPGJvb2xlYW4+IHwgbnVsbCA9IG51bGw7XHJcbmxldCBrZXlib2FyZExvY2tBY3RpdmUgPSBmYWxzZTtcclxubGV0IGtleWJvYXJkTG9ja0hvbGRlcnMgPSAwO1xyXG5sZXQga2V5Ym9hcmRMb2NrUGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0S2V5Ym9hcmRMb2NrKGtleXM/OiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIGNvbnN0IGtleWJvYXJkTG9ja0FwaSA9IGdldEtleWJvYXJkTG9ja0FwaSgpO1xyXG4gIGlmICgha2V5Ym9hcmRMb2NrQXBpPy5sb2NrKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcclxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2lzU2VjdXJlQ29udGV4dCcgaW4gd2luZG93ICYmICEod2luZG93IGFzIGFueSkuaXNTZWN1cmVDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcclxuICB9XHJcbiAgaWYgKGtleWJvYXJkTG9ja0FjdGl2ZSkge1xyXG4gICAga2V5Ym9hcmRMb2NrSG9sZGVycyArPSAxO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcclxuICB9XHJcbiAgaWYgKGtleWJvYXJkTG9ja1BlbmRpbmcpIHtcclxuICAgIGtleWJvYXJkTG9ja1BlbmRpbmdSZXF1ZXN0cyArPSAxO1xyXG4gICAgcmV0dXJuIGtleWJvYXJkTG9ja1BlbmRpbmc7XHJcbiAgfVxyXG4gIGtleWJvYXJkTG9ja1BlbmRpbmdSZXF1ZXN0cyA9IDE7XHJcbiAgY29uc3QgcGVuZGluZyA9IChrZXlzID8ga2V5Ym9hcmRMb2NrQXBpLmxvY2soa2V5cykgOiBrZXlib2FyZExvY2tBcGkubG9jaygpKS50aGVuKFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICBrZXlib2FyZExvY2tBY3RpdmUgPSB0cnVlO1xyXG4gICAgICBrZXlib2FyZExvY2tIb2xkZXJzID0ga2V5Ym9hcmRMb2NrUGVuZGluZ1JlcXVlc3RzO1xyXG4gICAgICBrZXlib2FyZExvY2tQZW5kaW5nUmVxdWVzdHMgPSAwO1xyXG4gICAgICBpZiAoa2V5Ym9hcmRMb2NrSG9sZGVycyA9PT0gMCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBrZXlib2FyZExvY2tBcGkudW5sb2NrPy4oKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgIH1cclxuICAgICAgICBrZXlib2FyZExvY2tBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4ga2V5Ym9hcmRMb2NrQWN0aXZlO1xyXG4gICAgfSxcclxuICAgICgpID0+IHtcclxuICAgICAga2V5Ym9hcmRMb2NrUGVuZGluZ1JlcXVlc3RzID0gMDtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICApO1xyXG4gIGtleWJvYXJkTG9ja1BlbmRpbmcgPSBwZW5kaW5nO1xyXG4gIHBlbmRpbmcuZmluYWxseSgoKSA9PiB7XHJcbiAgICBpZiAoa2V5Ym9hcmRMb2NrUGVuZGluZyA9PT0gcGVuZGluZykge1xyXG4gICAgICBrZXlib2FyZExvY2tQZW5kaW5nID0gbnVsbDtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gcGVuZGluZztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbGVhc2VLZXlib2FyZExvY2soKTogdm9pZCB7XHJcbiAgaWYgKGtleWJvYXJkTG9ja1BlbmRpbmcpIHtcclxuICAgIGlmIChrZXlib2FyZExvY2tQZW5kaW5nUmVxdWVzdHMgPiAwKSB7XHJcbiAgICAgIGtleWJvYXJkTG9ja1BlbmRpbmdSZXF1ZXN0cyAtPSAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAoa2V5Ym9hcmRMb2NrSG9sZGVycyA+IDApIHtcclxuICAgIGtleWJvYXJkTG9ja0hvbGRlcnMgLT0gMTtcclxuICB9XHJcbiAgaWYgKCFrZXlib2FyZExvY2tBY3RpdmUgfHwga2V5Ym9hcmRMb2NrSG9sZGVycyA+IDApIHJldHVybjtcclxuICBjb25zdCBrZXlib2FyZExvY2tBcGkgPSBnZXRLZXlib2FyZExvY2tBcGkoKTtcclxuICB0cnkge1xyXG4gICAga2V5Ym9hcmRMb2NrQXBpPy51bmxvY2s/LigpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG4gIGtleWJvYXJkTG9ja0FjdGl2ZSA9IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2RpZmllcnNGcm9tRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQgfCBNb3VzZUV2ZW50IHwgV2hlZWxFdmVudCB8IFBvaW50ZXJFdmVudCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBhbHQ6IGV2ZW50LmFsdEtleSxcclxuICAgIGN0cmw6IGV2ZW50LmN0cmxLZXksXHJcbiAgICBzaGlmdDogZXZlbnQuc2hpZnRLZXksXHJcbiAgICBtZXRhOiBldmVudC5tZXRhS2V5LFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRWRpdGFibGVUYXJnZXQodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpOiBib29sZWFuIHtcclxuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xyXG4gIGlmICghKHRhcmdldCBhcyBhbnkpLnRhZ05hbWUpIHJldHVybiBmYWxzZTtcclxuICBjb25zdCBlbCA9IHRhcmdldCBhcyBIVE1MRWxlbWVudDtcclxuICBjb25zdCB0YWcgPSAoZWwudGFnTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICBpZiAodGFnID09PSAnaW5wdXQnIHx8IHRhZyA9PT0gJ3RleHRhcmVhJyB8fCB0YWcgPT09ICdzZWxlY3QnKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAoKGVsIGFzIGFueSkuaXNDb250ZW50RWRpdGFibGUpIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNGdWxsc2NyZWVuRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmdWxsc2NyZWVuRWwgPVxyXG4gICAgICBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCA/PyAoZG9jdW1lbnQgYXMgYW55KS53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCA/PyBudWxsO1xyXG4gICAgcmV0dXJuIGZ1bGxzY3JlZW5FbCA9PT0gZWxlbWVudDtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3VsZFByZXZlbnREZWZhdWx0S2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgaWYgKGV2ZW50LmNvZGUgPT09ICdFc2NhcGUnIHx8IGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHJldHVybiB0cnVlO1xyXG4gIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnIHx8IGV2ZW50LmtleSA9PT0gJyAnIHx8IGV2ZW50LmtleSA9PT0gJ1NwYWNlYmFyJykgcmV0dXJuIHRydWU7XHJcbiAgaWYgKGV2ZW50LmNvZGUgPT09ICdUYWInIHx8IGV2ZW50LmtleSA9PT0gJ1RhYicpIHJldHVybiB0cnVlO1xyXG4gIGlmIChldmVudC5jb2RlID09PSAnTWV0YUxlZnQnIHx8IGV2ZW50LmNvZGUgPT09ICdNZXRhUmlnaHQnKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAoZXZlbnQua2V5ID09PSAnTWV0YScpIHJldHVybiB0cnVlO1xyXG4gIGlmIChldmVudC5rZXkgPT09ICdBbHQnIHx8IGV2ZW50LmtleSA9PT0gJ0FsdEdyYXBoJyB8fCBldmVudC5rZXkgPT09ICdDb250cm9sJykgcmV0dXJuIHRydWU7XHJcbiAgaWYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuYWx0S2V5IHx8IGV2ZW50LmN0cmxLZXkpIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNNb2RpZmllckNvZGUoY29kZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIChcclxuICAgIGNvZGUgPT09ICdBbHRMZWZ0JyB8fFxyXG4gICAgY29kZSA9PT0gJ0FsdFJpZ2h0JyB8fFxyXG4gICAgY29kZSA9PT0gJ0NvbnRyb2xMZWZ0JyB8fFxyXG4gICAgY29kZSA9PT0gJ0NvbnRyb2xSaWdodCcgfHxcclxuICAgIGNvZGUgPT09ICdNZXRhTGVmdCcgfHxcclxuICAgIGNvZGUgPT09ICdNZXRhUmlnaHQnIHx8XHJcbiAgICBjb2RlID09PSAnU2hpZnRMZWZ0JyB8fFxyXG4gICAgY29kZSA9PT0gJ1NoaWZ0UmlnaHQnXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUlucHV0UmVjdChcclxuICBlbGVtZW50OiBIVE1MRWxlbWVudCxcclxuICB2aWRlbz86IEhUTUxWaWRlb0VsZW1lbnQgfCBudWxsLFxyXG4pOiB7IHJlY3Q6IERPTVJlY3Q7IGNvbnRlbnRSZWN0OiBET01SZWN0IH0ge1xyXG4gIGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIGlmICghdmlkZW8gfHwgIXZpZGVvLnZpZGVvV2lkdGggfHwgIXZpZGVvLnZpZGVvSGVpZ2h0IHx8IHJlY3Qud2lkdGggPD0gMCB8fCByZWN0LmhlaWdodCA8PSAwKSB7XHJcbiAgICByZXR1cm4geyByZWN0LCBjb250ZW50UmVjdDogcmVjdCB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZWxlbWVudEFzcGVjdCA9IHJlY3Qud2lkdGggLyByZWN0LmhlaWdodDtcclxuICBjb25zdCB2aWRlb0FzcGVjdCA9IHZpZGVvLnZpZGVvV2lkdGggLyB2aWRlby52aWRlb0hlaWdodDtcclxuICBsZXQgY29udGVudFdpZHRoID0gcmVjdC53aWR0aDtcclxuICBsZXQgY29udGVudEhlaWdodCA9IHJlY3QuaGVpZ2h0O1xyXG4gIGxldCBvZmZzZXRYID0gMDtcclxuICBsZXQgb2Zmc2V0WSA9IDA7XHJcblxyXG4gIGlmICh2aWRlb0FzcGVjdCA+IGVsZW1lbnRBc3BlY3QpIHtcclxuICAgIGNvbnRlbnRIZWlnaHQgPSByZWN0LndpZHRoIC8gdmlkZW9Bc3BlY3Q7XHJcbiAgICBvZmZzZXRZID0gKHJlY3QuaGVpZ2h0IC0gY29udGVudEhlaWdodCkgLyAyO1xyXG4gIH0gZWxzZSBpZiAodmlkZW9Bc3BlY3QgPCBlbGVtZW50QXNwZWN0KSB7XHJcbiAgICBjb250ZW50V2lkdGggPSByZWN0LmhlaWdodCAqIHZpZGVvQXNwZWN0O1xyXG4gICAgb2Zmc2V0WCA9IChyZWN0LndpZHRoIC0gY29udGVudFdpZHRoKSAvIDI7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjb250ZW50UmVjdCA9IG5ldyBET01SZWN0KFxyXG4gICAgcmVjdC5sZWZ0ICsgb2Zmc2V0WCxcclxuICAgIHJlY3QudG9wICsgb2Zmc2V0WSxcclxuICAgIGNvbnRlbnRXaWR0aCxcclxuICAgIGNvbnRlbnRIZWlnaHQsXHJcbiAgKTtcclxuICByZXR1cm4geyByZWN0LCBjb250ZW50UmVjdCB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVQb2ludChcclxuICBldmVudDogTW91c2VFdmVudCB8IFdoZWVsRXZlbnQgfCBQb2ludGVyRXZlbnQsXHJcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQsXHJcbiAgdmlkZW8/OiBIVE1MVmlkZW9FbGVtZW50IHwgbnVsbCxcclxuKSB7XHJcbiAgY29uc3QgeyBjb250ZW50UmVjdCB9ID0gcmVzb2x2ZUlucHV0UmVjdChlbGVtZW50LCB2aWRlbyk7XHJcbiAgY29uc3QgeCA9IGNvbnRlbnRSZWN0LndpZHRoID8gKGV2ZW50LmNsaWVudFggLSBjb250ZW50UmVjdC5sZWZ0KSAvIGNvbnRlbnRSZWN0LndpZHRoIDogMDtcclxuICBjb25zdCB5ID0gY29udGVudFJlY3QuaGVpZ2h0ID8gKGV2ZW50LmNsaWVudFkgLSBjb250ZW50UmVjdC50b3ApIC8gY29udGVudFJlY3QuaGVpZ2h0IDogMDtcclxuICByZXR1cm4ge1xyXG4gICAgeDogTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgeCkpLFxyXG4gICAgeTogTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgeSkpLFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVdoZWVsRGVsdGEoZGVsdGE6IG51bWJlciwgZGVsdGFNb2RlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gIGlmIChkZWx0YU1vZGUgPT09IFdoZWVsRXZlbnQuRE9NX0RFTFRBX1BJWEVMKSB7XHJcbiAgICByZXR1cm4gZGVsdGEgLyBXSEVFTF9TVEVQX1BJWEVMUztcclxuICB9XHJcbiAgcmV0dXJuIGRlbHRhO1xyXG59XHJcblxyXG5jb25zdCBNQVhfR0FNRVBBRFMgPSAxNjtcclxuY29uc3QgQVhJU19ERUFEWk9ORSA9IDAuMDg7XHJcbmNvbnN0IE1PVElPTl9TRU5EX0lOVEVSVkFMX01TID0gMTY7XHJcbmNvbnN0IE1PVElPTl9ESUZGX1RIUkVTSE9MRCA9IDAuMTtcclxuY29uc3QgR0FNRVBBRF9TVEFURV9IRUFSVEJFQVRfTVMgPSA1MDA7XHJcblxyXG5jb25zdCBhY3RpdmVHYW1lcGFkcyA9IG5ldyBNYXA8bnVtYmVyLCBHYW1lcGFkPigpO1xyXG5jb25zdCBtb3Rpb25SZXF1ZXN0U3RhdGUgPSBuZXcgTWFwPG51bWJlciwgeyBneXJvOiBib29sZWFuOyBhY2NlbDogYm9vbGVhbiB9PigpO1xyXG5cclxuY29uc3QgR0FNRVBBRF9UWVBFID0ge1xyXG4gIHVua25vd246IDAsXHJcbiAgeGJveDogMSxcclxuICBwbGF5c3RhdGlvbjogMixcclxuICBuaW50ZW5kbzogMyxcclxufSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IEdBTUVQQURfQ0FQUyA9IHtcclxuICBhbmFsb2dUcmlnZ2VyczogMHgwMSxcclxuICB0b3VjaHBhZDogMHgwOCxcclxuICBhY2NlbDogMHgxMCxcclxuICBneXJvOiAweDIwLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuY29uc3QgR0FNRVBBRF9CVVRUT05TID0ge1xyXG4gIGRwYWRVcDogMHgwMDAxLFxyXG4gIGRwYWREb3duOiAweDAwMDIsXHJcbiAgZHBhZExlZnQ6IDB4MDAwNCxcclxuICBkcGFkUmlnaHQ6IDB4MDAwOCxcclxuICBzdGFydDogMHgwMDEwLFxyXG4gIGJhY2s6IDB4MDAyMCxcclxuICBsZWZ0U3RpY2s6IDB4MDA0MCxcclxuICByaWdodFN0aWNrOiAweDAwODAsXHJcbiAgbGVmdEJ1dHRvbjogMHgwMTAwLFxyXG4gIHJpZ2h0QnV0dG9uOiAweDAyMDAsXHJcbiAgaG9tZTogMHgwNDAwLFxyXG4gIGE6IDB4MTAwMCxcclxuICBiOiAweDIwMDAsXHJcbiAgeDogMHg0MDAwLFxyXG4gIHk6IDB4ODAwMCxcclxuICBwYWRkbGUxOiAweDAxMDAwMCxcclxuICBwYWRkbGUyOiAweDAyMDAwMCxcclxuICBwYWRkbGUzOiAweDA0MDAwMCxcclxuICBwYWRkbGU0OiAweDA4MDAwMCxcclxuICB0b3VjaHBhZEJ1dHRvbjogMHgxMDAwMDAsXHJcbiAgbWlzY0J1dHRvbjogMHgyMDAwMDAsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBTVEFOREFSRF9CVVRUT05fTUFQID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oW1xyXG4gIFswLCBHQU1FUEFEX0JVVFRPTlMuYV0sXHJcbiAgWzEsIEdBTUVQQURfQlVUVE9OUy5iXSxcclxuICBbMiwgR0FNRVBBRF9CVVRUT05TLnhdLFxyXG4gIFszLCBHQU1FUEFEX0JVVFRPTlMueV0sXHJcbiAgWzQsIEdBTUVQQURfQlVUVE9OUy5sZWZ0QnV0dG9uXSxcclxuICBbNSwgR0FNRVBBRF9CVVRUT05TLnJpZ2h0QnV0dG9uXSxcclxuICBbOCwgR0FNRVBBRF9CVVRUT05TLmJhY2tdLFxyXG4gIFs5LCBHQU1FUEFEX0JVVFRPTlMuc3RhcnRdLFxyXG4gIFsxMCwgR0FNRVBBRF9CVVRUT05TLmxlZnRTdGlja10sXHJcbiAgWzExLCBHQU1FUEFEX0JVVFRPTlMucmlnaHRTdGlja10sXHJcbiAgWzEyLCBHQU1FUEFEX0JVVFRPTlMuZHBhZFVwXSxcclxuICBbMTMsIEdBTUVQQURfQlVUVE9OUy5kcGFkRG93bl0sXHJcbiAgWzE0LCBHQU1FUEFEX0JVVFRPTlMuZHBhZExlZnRdLFxyXG4gIFsxNSwgR0FNRVBBRF9CVVRUT05TLmRwYWRSaWdodF0sXHJcbiAgWzE2LCBHQU1FUEFEX0JVVFRPTlMuaG9tZV0sXHJcbiAgWzE3LCBHQU1FUEFEX0JVVFRPTlMubWlzY0J1dHRvbl0sXHJcbl0pO1xyXG5cclxudHlwZSBHYW1lcGFkVmVjdG9yID0gW251bWJlciwgbnVtYmVyLCBudW1iZXJdO1xyXG5cclxuaW50ZXJmYWNlIEdhbWVwYWRTbmFwc2hvdCB7XHJcbiAgYnV0dG9uczogbnVtYmVyO1xyXG4gIGx0OiBudW1iZXI7XHJcbiAgcnQ6IG51bWJlcjtcclxuICBsc1g6IG51bWJlcjtcclxuICBsc1k6IG51bWJlcjtcclxuICByc1g6IG51bWJlcjtcclxuICByc1k6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEdhbWVwYWRNZXRhIHtcclxuICBidXR0b25NYXA6IE1hcDxudW1iZXIsIG51bWJlcj47XHJcbiAgc3VwcG9ydGVkQnV0dG9uczogbnVtYmVyO1xyXG4gIGNhcGFiaWxpdGllczogbnVtYmVyO1xyXG4gIHR5cGU6IG51bWJlcjtcclxuICBsYXN0R3lybz86IEdhbWVwYWRWZWN0b3I7XHJcbiAgbGFzdEFjY2VsPzogR2FtZXBhZFZlY3RvcjtcclxuICBsYXN0R3lyb0F0PzogbnVtYmVyO1xyXG4gIGxhc3RBY2NlbEF0PzogbnVtYmVyO1xyXG4gIGNvbm5lY3RlZDogYm9vbGVhbjtcclxuICBuZWVkc1Jlc3luYzogYm9vbGVhbjtcclxuICBsYXN0U3RhdGVTZW50QXQ/OiBudW1iZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVHYW1lcGFkVHlwZShnYW1lcGFkOiBHYW1lcGFkKTogbnVtYmVyIHtcclxuICBjb25zdCBpZCA9IChnYW1lcGFkLmlkIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChpZC5pbmNsdWRlcygnbmludGVuZG8nKSB8fCBpZC5pbmNsdWRlcygnc3dpdGNoJykgfHwgaWQuaW5jbHVkZXMoJ2pveS1jb24nKSkge1xyXG4gICAgcmV0dXJuIEdBTUVQQURfVFlQRS5uaW50ZW5kbztcclxuICB9XHJcbiAgaWYgKFxyXG4gICAgaWQuaW5jbHVkZXMoJ3BsYXlzdGF0aW9uJykgfHxcclxuICAgIGlkLmluY2x1ZGVzKCdkdWFsc2hvY2snKSB8fFxyXG4gICAgaWQuaW5jbHVkZXMoJ2R1YWxzZW5zZScpIHx8XHJcbiAgICBpZC5pbmNsdWRlcygncHM0JykgfHxcclxuICAgIGlkLmluY2x1ZGVzKCdwczUnKVxyXG4gICkge1xyXG4gICAgcmV0dXJuIEdBTUVQQURfVFlQRS5wbGF5c3RhdGlvbjtcclxuICB9XHJcbiAgaWYgKGlkLmluY2x1ZGVzKCd4Ym94JykpIHtcclxuICAgIHJldHVybiBHQU1FUEFEX1RZUEUueGJveDtcclxuICB9XHJcbiAgaWYgKGlkLmluY2x1ZGVzKCd3aXJlbGVzcyBjb250cm9sbGVyJykpIHtcclxuICAgIHJldHVybiBHQU1FUEFEX1RZUEUucGxheXN0YXRpb247XHJcbiAgfVxyXG4gIHJldHVybiBHQU1FUEFEX1RZUEUudW5rbm93bjtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUJ1dHRvbk1hcChnYW1lcGFkOiBHYW1lcGFkLCB0eXBlOiBudW1iZXIpOiBNYXA8bnVtYmVyLCBudW1iZXI+IHtcclxuICBjb25zdCBtYXAgPSBuZXcgTWFwKFNUQU5EQVJEX0JVVFRPTl9NQVApO1xyXG4gIGlmICh0eXBlID09PSBHQU1FUEFEX1RZUEUucGxheXN0YXRpb24pIHtcclxuICAgIG1hcC5zZXQoMTcsIEdBTUVQQURfQlVUVE9OUy50b3VjaHBhZEJ1dHRvbik7XHJcbiAgfVxyXG4gIGlmIChnYW1lcGFkLmJ1dHRvbnMubGVuZ3RoID4gMTcpIHtcclxuICAgIG1hcC5zZXQoMTgsIEdBTUVQQURfQlVUVE9OUy5wYWRkbGUxKTtcclxuICB9XHJcbiAgaWYgKGdhbWVwYWQuYnV0dG9ucy5sZW5ndGggPiAxOCkge1xyXG4gICAgbWFwLnNldCgxOSwgR0FNRVBBRF9CVVRUT05TLnBhZGRsZTIpO1xyXG4gIH1cclxuICBpZiAoZ2FtZXBhZC5idXR0b25zLmxlbmd0aCA+IDE5KSB7XHJcbiAgICBtYXAuc2V0KDIwLCBHQU1FUEFEX0JVVFRPTlMucGFkZGxlMyk7XHJcbiAgfVxyXG4gIGlmIChnYW1lcGFkLmJ1dHRvbnMubGVuZ3RoID4gMjApIHtcclxuICAgIG1hcC5zZXQoMjEsIEdBTUVQQURfQlVUVE9OUy5wYWRkbGU0KTtcclxuICB9XHJcbiAgcmV0dXJuIG1hcDtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlEZWFkem9uZSh2YWx1ZTogbnVtYmVyLCBkZWFkem9uZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICBjb25zdCBhYnMgPSBNYXRoLmFicyh2YWx1ZSk7XHJcbiAgaWYgKGFicyA8PSBkZWFkem9uZSkgcmV0dXJuIDA7XHJcbiAgY29uc3Qgc2NhbGVkID0gKGFicyAtIGRlYWR6b25lKSAvICgxIC0gZGVhZHpvbmUpO1xyXG4gIHJldHVybiBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBzY2FsZWQpKSAqIE1hdGguc2lnbih2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvSW50MTYodmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgY29uc3QgY2xhbXBlZCA9IE1hdGgubWluKDEsIE1hdGgubWF4KC0xLCB2YWx1ZSkpO1xyXG4gIHJldHVybiBNYXRoLnJvdW5kKGNsYW1wZWQgKiAzMjc2Nyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVWludDgodmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgY29uc3QgY2xhbXBlZCA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHZhbHVlKSk7XHJcbiAgcmV0dXJuIE1hdGgucm91bmQoY2xhbXBlZCAqIDI1NSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRCdXR0b25zKGdhbWVwYWQ6IEdhbWVwYWQsIGJ1dHRvbk1hcDogTWFwPG51bWJlciwgbnVtYmVyPik6IG51bWJlciB7XHJcbiAgbGV0IG1hc2sgPSAwO1xyXG4gIGJ1dHRvbk1hcC5mb3JFYWNoKChiaXQsIGluZGV4KSA9PiB7XHJcbiAgICBjb25zdCBidXR0b24gPSBnYW1lcGFkLmJ1dHRvbnNbaW5kZXhdO1xyXG4gICAgaWYgKGJ1dHRvbj8ucHJlc3NlZCkge1xyXG4gICAgICBtYXNrIHw9IGJpdDtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZEdhbWVwYWRTdGF0ZShnYW1lcGFkOiBHYW1lcGFkLCBidXR0b25NYXA6IE1hcDxudW1iZXIsIG51bWJlcj4pOiBHYW1lcGFkU25hcHNob3Qge1xyXG4gIGNvbnN0IGF4ZXMgPSBnYW1lcGFkLmF4ZXMgfHwgW107XHJcbiAgY29uc3QgbHggPSBhcHBseURlYWR6b25lKGF4ZXNbMF0gPz8gMCwgQVhJU19ERUFEWk9ORSk7XHJcbiAgY29uc3QgbHkgPSBhcHBseURlYWR6b25lKC0oYXhlc1sxXSA/PyAwKSwgQVhJU19ERUFEWk9ORSk7XHJcbiAgY29uc3QgcnggPSBhcHBseURlYWR6b25lKGF4ZXNbMl0gPz8gMCwgQVhJU19ERUFEWk9ORSk7XHJcbiAgY29uc3QgcnkgPSBhcHBseURlYWR6b25lKC0oYXhlc1szXSA/PyAwKSwgQVhJU19ERUFEWk9ORSk7XHJcbiAgY29uc3QgbHQgPSB0b1VpbnQ4KGdhbWVwYWQuYnV0dG9uc1s2XT8udmFsdWUgPz8gMCk7XHJcbiAgY29uc3QgcnQgPSB0b1VpbnQ4KGdhbWVwYWQuYnV0dG9uc1s3XT8udmFsdWUgPz8gMCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGJ1dHRvbnM6IHJlYWRCdXR0b25zKGdhbWVwYWQsIGJ1dHRvbk1hcCksXHJcbiAgICBsdCxcclxuICAgIHJ0LFxyXG4gICAgbHNYOiB0b0ludDE2KGx4KSxcclxuICAgIGxzWTogdG9JbnQxNihseSksXHJcbiAgICByc1g6IHRvSW50MTYocngpLFxyXG4gICAgcnNZOiB0b0ludDE2KHJ5KSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkTW90aW9uVmVjdG9yKHZhbHVlOiB1bmtub3duKTogR2FtZXBhZFZlY3RvciB8IHVuZGVmaW5lZCB7XHJcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIGNvbnN0IGFycmF5ID0gQXJyYXkuaXNBcnJheSh2YWx1ZSlcclxuICAgID8gdmFsdWVcclxuICAgIDogKHZhbHVlIGFzIHsgbGVuZ3RoPzogbnVtYmVyOyBbaW5kZXg6IG51bWJlcl06IG51bWJlciB9KTtcclxuICBpZiAodHlwZW9mIGFycmF5Lmxlbmd0aCAhPT0gJ251bWJlcicgfHwgYXJyYXkubGVuZ3RoIDwgMykgcmV0dXJuIHVuZGVmaW5lZDtcclxuICBjb25zdCB4ID0gTnVtYmVyKGFycmF5WzBdKTtcclxuICBjb25zdCB5ID0gTnVtYmVyKGFycmF5WzFdKTtcclxuICBjb25zdCB6ID0gTnVtYmVyKGFycmF5WzJdKTtcclxuICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpIHx8ICFOdW1iZXIuaXNGaW5pdGUoeikpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgcmV0dXJuIFt4LCB5LCB6XTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZEdhbWVwYWRNb3Rpb24oZ2FtZXBhZDogR2FtZXBhZCk6IHsgZ3lybz86IEdhbWVwYWRWZWN0b3I7IGFjY2VsPzogR2FtZXBhZFZlY3RvciB9IHtcclxuICBjb25zdCBwb3NlID0gKFxyXG4gICAgZ2FtZXBhZCBhcyB7IHBvc2U/OiB7IGFuZ3VsYXJWZWxvY2l0eT86IHVua25vd247IGxpbmVhckFjY2VsZXJhdGlvbj86IHVua25vd24gfSB8IG51bGwgfVxyXG4gICkucG9zZTtcclxuICBjb25zdCBtb3Rpb24gPSAoXHJcbiAgICBnYW1lcGFkIGFzIHsgbW90aW9uPzogeyBhbmd1bGFyVmVsb2NpdHk/OiB1bmtub3duOyBsaW5lYXJBY2NlbGVyYXRpb24/OiB1bmtub3duIH0gfVxyXG4gICkubW90aW9uO1xyXG4gIGNvbnN0IG1vdGlvbkRhdGEgPSAoXHJcbiAgICBnYW1lcGFkIGFzIHsgbW90aW9uRGF0YT86IHsgYW5ndWxhclZlbG9jaXR5PzogdW5rbm93bjsgbGluZWFyQWNjZWxlcmF0aW9uPzogdW5rbm93biB9IH1cclxuICApLm1vdGlvbkRhdGE7XHJcbiAgY29uc3Qgc291cmNlID0gbW90aW9uID8/IG1vdGlvbkRhdGEgPz8gcG9zZSA/PyBudWxsO1xyXG4gIGlmICghc291cmNlKSByZXR1cm4ge307XHJcbiAgY29uc3QgZ3lybyA9IHJlYWRNb3Rpb25WZWN0b3Ioc291cmNlLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgY29uc3QgYWNjZWwgPSByZWFkTW90aW9uVmVjdG9yKHNvdXJjZS5saW5lYXJBY2NlbGVyYXRpb24pO1xyXG4gIGNvbnN0IHJlc3VsdDogeyBneXJvPzogR2FtZXBhZFZlY3RvcjsgYWNjZWw/OiBHYW1lcGFkVmVjdG9yIH0gPSB7fTtcclxuICBpZiAoZ3lybyAhPT0gdW5kZWZpbmVkKSByZXN1bHQuZ3lybyA9IGd5cm87XHJcbiAgaWYgKGFjY2VsICE9PSB1bmRlZmluZWQpIHJlc3VsdC5hY2NlbCA9IGFjY2VsO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdGlvbkNoYW5nZWQocHJldmlvdXM6IEdhbWVwYWRWZWN0b3IgfCB1bmRlZmluZWQsIG5leHQ6IEdhbWVwYWRWZWN0b3IpOiBib29sZWFuIHtcclxuICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcclxuICByZXR1cm4gKFxyXG4gICAgTWF0aC5hYnMocHJldmlvdXNbMF0gLSBuZXh0WzBdKSA+IE1PVElPTl9ESUZGX1RIUkVTSE9MRCB8fFxyXG4gICAgTWF0aC5hYnMocHJldmlvdXNbMV0gLSBuZXh0WzFdKSA+IE1PVElPTl9ESUZGX1RIUkVTSE9MRCB8fFxyXG4gICAgTWF0aC5hYnMocHJldmlvdXNbMl0gLSBuZXh0WzJdKSA+IE1PVElPTl9ESUZGX1RIUkVTSE9MRFxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEhhcHRpY0FjdHVhdG9yKGdhbWVwYWQ6IEdhbWVwYWQpOiBHYW1lcGFkSGFwdGljQWN0dWF0b3IgfCBudWxsIHtcclxuICBjb25zdCBkaXJlY3QgPSAoZ2FtZXBhZCBhcyB7IHZpYnJhdGlvbkFjdHVhdG9yPzogR2FtZXBhZEhhcHRpY0FjdHVhdG9yIH0pLnZpYnJhdGlvbkFjdHVhdG9yO1xyXG4gIGlmIChkaXJlY3Q/LnBsYXlFZmZlY3QpIHtcclxuICAgIHJldHVybiBkaXJlY3Q7XHJcbiAgfVxyXG4gIGNvbnN0IGhhcHRpY3MgPSAoZ2FtZXBhZCBhcyB7IGhhcHRpY0FjdHVhdG9ycz86IEdhbWVwYWRIYXB0aWNBY3R1YXRvcltdIH0pLmhhcHRpY0FjdHVhdG9ycztcclxuICBpZiAoaGFwdGljcz8ubGVuZ3RoICYmIGhhcHRpY3NbMF0/LnBsYXlFZmZlY3QpIHtcclxuICAgIHJldHVybiBoYXB0aWNzWzBdO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xhbXBNYWduaXR1ZGUodmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gMDtcclxuICByZXR1cm4gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdmFsdWUpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0TW90aW9uUmVxdWVzdChpZDogbnVtYmVyLCBtb3Rpb25UeXBlOiBudW1iZXIsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICBjb25zdCBzdGF0ZSA9IG1vdGlvblJlcXVlc3RTdGF0ZS5nZXQoaWQpID8/IHsgZ3lybzogdHJ1ZSwgYWNjZWw6IHRydWUgfTtcclxuICBpZiAobW90aW9uVHlwZSA9PT0gMikge1xyXG4gICAgc3RhdGUuZ3lybyA9IGVuYWJsZWQ7XHJcbiAgfSBlbHNlIGlmIChtb3Rpb25UeXBlID09PSAxKSB7XHJcbiAgICBzdGF0ZS5hY2NlbCA9IGVuYWJsZWQ7XHJcbiAgfVxyXG4gIG1vdGlvblJlcXVlc3RTdGF0ZS5zZXQoaWQsIHN0YXRlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0R2FtZXBhZHMoKTogKEdhbWVwYWQgfCBudWxsKVtdIHtcclxuICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXTtcclxuICBjb25zdCBmYWxsYmFjayA9IChuYXZpZ2F0b3IgYXMgTmF2aWdhdG9yICYgeyB3ZWJraXRHZXRHYW1lcGFkcz86ICgpID0+IChHYW1lcGFkIHwgbnVsbClbXSB9KVxyXG4gICAgLndlYmtpdEdldEdhbWVwYWRzO1xyXG4gIGNvbnN0IHBhZHMgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHM/LigpID8/IGZhbGxiYWNrPy4oKSA/PyBbXTtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheShwYWRzKSA/IHBhZHMgOiBBcnJheS5mcm9tKHBhZHMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0dhbWVwYWRDb25uZWN0ZWQoZ2FtZXBhZDogR2FtZXBhZCk6IGJvb2xlYW4ge1xyXG4gIGlmICh0eXBlb2YgZ2FtZXBhZC5jb25uZWN0ZWQgPT09ICdib29sZWFuJykgcmV0dXJuIGdhbWVwYWQuY29ubmVjdGVkO1xyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlHYW1lcGFkRmVlZGJhY2sobWVzc2FnZTogR2FtZXBhZEZlZWRiYWNrTWVzc2FnZSB8IHVua25vd24pOiB2b2lkIHtcclxuICBpZiAoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT09ICdvYmplY3QnKSByZXR1cm47XHJcbiAgY29uc3QgcGF5bG9hZCA9IG1lc3NhZ2UgYXMgR2FtZXBhZEZlZWRiYWNrTWVzc2FnZTtcclxuICBpZiAocGF5bG9hZC50eXBlICE9PSAnZ2FtZXBhZF9mZWVkYmFjaycpIHJldHVybjtcclxuICBjb25zdCBpZCA9IE51bWJlcihwYXlsb2FkLmlkKTtcclxuICBpZiAoIU51bWJlci5pc0Zpbml0ZShpZCkpIHJldHVybjtcclxuXHJcbiAgaWYgKHBheWxvYWQuZXZlbnQgPT09ICdtb3Rpb25fZXZlbnRfc3RhdGUnKSB7XHJcbiAgICBjb25zdCBtb3Rpb25UeXBlID0gTnVtYmVyKHBheWxvYWQubW90aW9uVHlwZSk7XHJcbiAgICBjb25zdCByZXBvcnRSYXRlID0gTnVtYmVyKHBheWxvYWQucmVwb3J0UmF0ZSk7XHJcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG1vdGlvblR5cGUpKSB7XHJcbiAgICAgIHNldE1vdGlvblJlcXVlc3QoaWQsIG1vdGlvblR5cGUsIHJlcG9ydFJhdGUgPiAwKTtcclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChwYXlsb2FkLmV2ZW50ICE9PSAncnVtYmxlJyAmJiBwYXlsb2FkLmV2ZW50ICE9PSAncnVtYmxlX3RyaWdnZXJzJykge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZ2FtZXBhZCA9IGFjdGl2ZUdhbWVwYWRzLmdldChpZCkgPz8gZ2V0R2FtZXBhZHMoKVtpZF07XHJcbiAgaWYgKCFnYW1lcGFkKSByZXR1cm47XHJcbiAgY29uc3QgYWN0dWF0b3IgPSBnZXRIYXB0aWNBY3R1YXRvcihnYW1lcGFkKTtcclxuICBpZiAoIWFjdHVhdG9yKSByZXR1cm47XHJcblxyXG4gIGxldCBzdHJvbmcgPSBjbGFtcE1hZ25pdHVkZSgocGF5bG9hZC5sb3dmcmVxID8/IDApIC8gNjU1MzUpO1xyXG4gIGxldCB3ZWFrID0gY2xhbXBNYWduaXR1ZGUoKHBheWxvYWQuaGlnaGZyZXEgPz8gMCkgLyA2NTUzNSk7XHJcbiAgaWYgKHBheWxvYWQuZXZlbnQgPT09ICdydW1ibGVfdHJpZ2dlcnMnKSB7XHJcbiAgICBzdHJvbmcgPSBjbGFtcE1hZ25pdHVkZSgocGF5bG9hZC5sZWZ0ID8/IDApIC8gNjU1MzUpO1xyXG4gICAgd2VhayA9IGNsYW1wTWFnbml0dWRlKChwYXlsb2FkLnJpZ2h0ID8/IDApIC8gNjU1MzUpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIHZvaWQgYWN0dWF0b3IucGxheUVmZmVjdCgnZHVhbC1ydW1ibGUnLCB7XHJcbiAgICAgIGR1cmF0aW9uOiAxMDAsXHJcbiAgICAgIHN0cm9uZ01hZ25pdHVkZTogc3Ryb25nLFxyXG4gICAgICB3ZWFrTWFnbml0dWRlOiB3ZWFrLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgKi9cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhdHRhY2hJbnB1dENhcHR1cmUoXHJcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQsXHJcbiAgc2VuZDogKHBheWxvYWQ6IHN0cmluZyB8IEFycmF5QnVmZmVyKSA9PiBib29sZWFuIHwgdm9pZCxcclxuICBvcHRpb25zOiBJbnB1dENhcHR1cmVPcHRpb25zID0ge30sXHJcbik6ICgpID0+IHZvaWQge1xyXG4gIGNvbnN0IHZpZGVvID0gb3B0aW9ucy52aWRlbyA/PyBudWxsO1xyXG4gIGNvbnN0IG9uTWV0cmljcyA9IG9wdGlvbnMub25NZXRyaWNzO1xyXG4gIGNvbnN0IGdhbWVwYWRFbmFibGVkID0gb3B0aW9ucy5nYW1lcGFkID8/IHRydWU7XHJcbiAgY29uc3Qgc2hvdWxkRHJvcCA9IG9wdGlvbnMuc2hvdWxkRHJvcDtcclxuICBsZXQgcXVldWVkTW92ZTogSW5wdXRNZXNzYWdlIHwgbnVsbCA9IG51bGw7XHJcbiAgbGV0IHF1ZXVlZE1vdmVBdCA9IDA7XHJcbiAgbGV0IHJhZklkID0gMDtcclxuICBsZXQgbW91c2VNb3ZlU2VxID0gMDtcclxuICBjb25zdCBwcmVzc2VkS2V5cyA9IG5ldyBNYXA8XHJcbiAgICBzdHJpbmcsXHJcbiAgICB7IGtleTogc3RyaW5nOyBjb2RlOiBzdHJpbmc7IGNob3JkZWQ6IGJvb2xlYW47IGxhc3RSZXBlYXRTZW50QXQ/OiBudW1iZXIgfVxyXG4gID4oKTtcclxuICBjb25zdCBrZXlBdXRvUmVsZWFzZVRpbWVycyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XHJcbiAgY29uc3Qgc3VwcG9ydHNQb2ludGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ1BvaW50ZXJFdmVudCcgaW4gd2luZG93O1xyXG4gIGNvbnN0IHN1cHBvcnRzR2FtZXBhZCA9XHJcbiAgICBnYW1lcGFkRW5hYmxlZCAmJlxyXG4gICAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcclxuICAgICh0eXBlb2YgbmF2aWdhdG9yLmdldEdhbWVwYWRzID09PSAnZnVuY3Rpb24nIHx8XHJcbiAgICAgIHR5cGVvZiAobmF2aWdhdG9yIGFzIE5hdmlnYXRvciAmIHsgd2Via2l0R2V0R2FtZXBhZHM/OiAoKSA9PiAoR2FtZXBhZCB8IG51bGwpW10gfSlcclxuICAgICAgICAud2Via2l0R2V0R2FtZXBhZHMgPT09ICdmdW5jdGlvbicpO1xyXG4gIGNvbnN0IG1ldHJpY3M6IElucHV0Q2FwdHVyZU1ldHJpY3MgPSB7fTtcclxuICBsZXQgbW92ZURlbGF5U3VtID0gMDtcclxuICBsZXQgbW92ZURlbGF5U2FtcGxlcyA9IDA7XHJcbiAgbGV0IG1vdmVFdmVudExhZ1N1bSA9IDA7XHJcbiAgbGV0IG1vdmVFdmVudExhZ1NhbXBsZXMgPSAwO1xyXG4gIGxldCBtb3ZlUmF0ZVdpbmRvd1N0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgbGV0IG1vdmVSYXRlQ291bnQgPSAwO1xyXG4gIGxldCBtb3ZlU2VuZFJhdGVDb3VudCA9IDA7XHJcbiAgbGV0IGxhc3RNZXRyaWNzRW1pdEF0ID0gMDtcclxuICBjb25zdCB0b1UxNlVuaXQgPSAodmFsdWU6IG51bWJlcikgPT4gTWF0aC5yb3VuZChNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB2YWx1ZSkpICogNjU1MzUpO1xyXG4gIGNvbnN0IGVuY29kZU1vdXNlTW92ZSA9IChwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgJiB7IHR5cGU6ICdtb3VzZV9tb3ZlJyB9KSA9PiB7XHJcbiAgICBjb25zdCBvdXQgPSBuZXcgQXJyYXlCdWZmZXIoNyk7XHJcbiAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG91dCk7XHJcbiAgICB2aWV3LnNldFVpbnQ4KDAsIDEpO1xyXG4gICAgdmlldy5zZXRVaW50MTYoMSwgbW91c2VNb3ZlU2VxLCB0cnVlKTtcclxuICAgIHZpZXcuc2V0VWludDE2KDMsIHRvVTE2VW5pdChwYXlsb2FkLngpLCB0cnVlKTtcclxuICAgIHZpZXcuc2V0VWludDE2KDUsIHRvVTE2VW5pdChwYXlsb2FkLnkpLCB0cnVlKTtcclxuICAgIG1vdXNlTW92ZVNlcSA9IChtb3VzZU1vdmVTZXEgKyAxKSAmIDB4ZmZmZjtcclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfTtcclxuICBjb25zdCBzZW5kUGF5bG9hZCA9IChwYXlsb2FkOiBJbnB1dE1lc3NhZ2UpID0+IHtcclxuICAgIGlmIChzaG91bGREcm9wPy4ocGF5bG9hZCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHBheWxvYWQudHlwZSA9PT0gJ21vdXNlX21vdmUnKSB7XHJcbiAgICAgIHJldHVybiBzZW5kKGVuY29kZU1vdXNlTW92ZShwYXlsb2FkKSkgIT09IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbmQoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpICE9PSBmYWxzZTtcclxuICB9O1xyXG4gIGxldCBrZXlib2FyZExvY2tSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgZW1pdE1ldHJpY3MgPSAoKSA9PiB7XHJcbiAgICBpZiAoIW9uTWV0cmljcykgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdE1ldHJpY3NFbWl0QXQgPCAxMDApIHJldHVybjtcclxuICAgIGxhc3RNZXRyaWNzRW1pdEF0ID0gbm93O1xyXG4gICAgb25NZXRyaWNzKHsgLi4ubWV0cmljcyB9KTtcclxuICB9O1xyXG5cclxuICBjb25zdCBmbHVzaE1vdmUgPSAoKSA9PiB7XHJcbiAgICByYWZJZCA9IDA7XHJcbiAgICBpZiAoIXF1ZXVlZE1vdmUpIHJldHVybjtcclxuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgY29uc3QgZGVsYXlNcyA9IE1hdGgubWF4KDAsIG5vdyAtIHF1ZXVlZE1vdmVBdCk7XHJcbiAgICBtb3ZlRGVsYXlTdW0gKz0gZGVsYXlNcztcclxuICAgIG1vdmVEZWxheVNhbXBsZXMgKz0gMTtcclxuICAgIG1ldHJpY3MubGFzdE1vdmVEZWxheU1zID0gZGVsYXlNcztcclxuICAgIG1ldHJpY3MuYXZnTW92ZURlbGF5TXMgPSBtb3ZlRGVsYXlTdW0gLyBtb3ZlRGVsYXlTYW1wbGVzO1xyXG4gICAgbWV0cmljcy5tYXhNb3ZlRGVsYXlNcyA9IE1hdGgubWF4KG1ldHJpY3MubWF4TW92ZURlbGF5TXMgPz8gMCwgZGVsYXlNcyk7XHJcbiAgICBtb3ZlU2VuZFJhdGVDb3VudCArPSAxO1xyXG4gICAgY29uc3QgcmF0ZVdpbmRvd01zID0gbm93IC0gbW92ZVJhdGVXaW5kb3dTdGFydDtcclxuICAgIGlmIChyYXRlV2luZG93TXMgPj0gMTAwMCkge1xyXG4gICAgICBtZXRyaWNzLm1vdmVSYXRlSHogPSBNYXRoLnJvdW5kKChtb3ZlUmF0ZUNvdW50IC8gcmF0ZVdpbmRvd01zKSAqIDEwMDApO1xyXG4gICAgICBtZXRyaWNzLm1vdmVTZW5kUmF0ZUh6ID0gTWF0aC5yb3VuZCgobW92ZVNlbmRSYXRlQ291bnQgLyByYXRlV2luZG93TXMpICogMTAwMCk7XHJcbiAgICAgIGlmIChtb3ZlUmF0ZUNvdW50KSBtZXRyaWNzLm1vdmVDb2FsZXNjZVJhdGlvID0gbW92ZVNlbmRSYXRlQ291bnQgLyBtb3ZlUmF0ZUNvdW50O1xyXG4gICAgICBtb3ZlUmF0ZVdpbmRvd1N0YXJ0ID0gbm93O1xyXG4gICAgICBtb3ZlUmF0ZUNvdW50ID0gMDtcclxuICAgICAgbW92ZVNlbmRSYXRlQ291bnQgPSAwO1xyXG4gICAgfVxyXG4gICAgc2VuZFBheWxvYWQocXVldWVkTW92ZSk7XHJcbiAgICBxdWV1ZWRNb3ZlID0gbnVsbDtcclxuICAgIGVtaXRNZXRyaWNzKCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVsZWFzZUFsbEtleXMgPSAoKSA9PiB7XHJcbiAgICBpZiAoIXByZXNzZWRLZXlzLnNpemUpIHJldHVybjtcclxuICAgIGNvbnN0IHRzID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHByZXNzZWRLZXlzLnZhbHVlcygpKSB7XHJcbiAgICAgIGNvbnN0IHBheWxvYWQ6IElucHV0TWVzc2FnZSA9IHtcclxuICAgICAgICB0eXBlOiAna2V5X3VwJyxcclxuICAgICAgICBrZXk6IGVudHJ5LmtleSxcclxuICAgICAgICBjb2RlOiBlbnRyeS5jb2RlLFxyXG4gICAgICAgIHJlcGVhdDogZmFsc2UsXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7IGFsdDogZmFsc2UsIGN0cmw6IGZhbHNlLCBzaGlmdDogZmFsc2UsIG1ldGE6IGZhbHNlIH0sICAgICAgXHJcbiAgICAgICAgdHMsXHJcbiAgICAgIH07XHJcbiAgICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gICAgfVxyXG4gICAga2V5QXV0b1JlbGVhc2VUaW1lcnMuZm9yRWFjaCgodGltZXIpID0+IHtcclxuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICB9KTtcclxuICAgIGtleUF1dG9SZWxlYXNlVGltZXJzLmNsZWFyKCk7XHJcbiAgICBwcmVzc2VkS2V5cy5jbGVhcigpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNsZWFyS2V5QXV0b1JlbGVhc2UgPSAoY29kZTogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCB0aW1lciA9IGtleUF1dG9SZWxlYXNlVGltZXJzLmdldChjb2RlKTtcclxuICAgIGlmICghdGltZXIpIHJldHVybjtcclxuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAga2V5QXV0b1JlbGVhc2VUaW1lcnMuZGVsZXRlKGNvZGUpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNjaGVkdWxlS2V5QXV0b1JlbGVhc2UgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuICAgIGNvbnN0IGNvZGUgPSBldmVudC5jb2RlO1xyXG4gICAgaWYgKGlzTW9kaWZpZXJDb2RlKGNvZGUpKSByZXR1cm47XHJcbiAgICBpZiAoIXByZXNzZWRLZXlzLmhhcyhjb2RlKSkgcmV0dXJuO1xyXG4gICAgLy8gU29tZSBicm93c2VyL09TIHNob3J0Y3V0cyAobm90YWJseSBvbiBtYWNPUyB3aXRoIENtZCBjb21ib3MgbGlrZSBDbWQrRClcclxuICAgIC8vIGNhbiBlYXQgdGhlIGtleXVwIGZvciB0aGUgc2Vjb25kYXJ5IGtleS4gQXV0by1yZWxlYXNlIGFmdGVyIGEgc2hvcnQgZGVsYXlcclxuICAgIC8vIHRvIGF2b2lkIGEgXCJzdHVjayBrZXlcIiBvbiB0aGUgaG9zdC5cclxuICAgIGlmICghc2hvdWxkUHJldmVudERlZmF1bHRLZXkoZXZlbnQpKSByZXR1cm47XHJcbiAgICBpZiAoIWV2ZW50Lm1ldGFLZXkgJiYgIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmFsdEtleSkgcmV0dXJuO1xyXG4gICAgY2xlYXJLZXlBdXRvUmVsZWFzZShjb2RlKTtcclxuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBrZXlBdXRvUmVsZWFzZVRpbWVycy5kZWxldGUoY29kZSk7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gcHJlc3NlZEtleXMuZ2V0KGNvZGUpO1xyXG4gICAgICBpZiAoIWVudHJ5KSByZXR1cm47XHJcbiAgICAgIGNvbnN0IHBheWxvYWQ6IElucHV0TWVzc2FnZSA9IHtcclxuICAgICAgICB0eXBlOiAna2V5X3VwJyxcclxuICAgICAgICBrZXk6IGVudHJ5LmtleSxcclxuICAgICAgICBjb2RlOiBlbnRyeS5jb2RlLFxyXG4gICAgICAgIHJlcGVhdDogZmFsc2UsXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7IGFsdDogZmFsc2UsIGN0cmw6IGZhbHNlLCBzaGlmdDogZmFsc2UsIG1ldGE6IGZhbHNlIH0sXHJcbiAgICAgICAgdHM6IHBlcmZvcm1hbmNlLm5vdygpLFxyXG4gICAgICB9O1xyXG4gICAgICBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICAgICAgcHJlc3NlZEtleXMuZGVsZXRlKGNvZGUpO1xyXG4gICAgfSwgNzUwKTtcclxuICAgIGtleUF1dG9SZWxlYXNlVGltZXJzLnNldChjb2RlLCB0aW1lcik7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVsZWFzZVN0YWxlTW9kaWZpZXJLZXlzID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XHJcbiAgICBpZiAoIXByZXNzZWRLZXlzLnNpemUpIHJldHVybjtcclxuICAgIGNvbnN0IHRzID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBjb25zdCBpc1ByZXNzZWQgPSAoY29kZTogc3RyaW5nKSA9PiBwcmVzc2VkS2V5cy5oYXMoY29kZSk7XHJcbiAgICBjb25zdCByZWxlYXNlQ29kZSA9IChjb2RlOiBzdHJpbmcpID0+IHtcclxuICAgICAgY29uc3QgZW50cnkgPSBwcmVzc2VkS2V5cy5nZXQoY29kZSk7XHJcbiAgICAgIGlmICghZW50cnkpIHJldHVybjtcclxuICAgICAgY29uc3QgcGF5bG9hZDogSW5wdXRNZXNzYWdlID0ge1xyXG4gICAgICAgIHR5cGU6ICdrZXlfdXAnLFxyXG4gICAgICAgIGtleTogZW50cnkua2V5LFxyXG4gICAgICAgIGNvZGU6IGVudHJ5LmNvZGUsXHJcbiAgICAgICAgcmVwZWF0OiBmYWxzZSxcclxuICAgICAgICBtb2RpZmllcnM6IG1vZGlmaWVyc0Zyb21FdmVudChldmVudCksXHJcbiAgICAgICAgdHMsXHJcbiAgICAgIH07XHJcbiAgICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gICAgICBwcmVzc2VkS2V5cy5kZWxldGUoY29kZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIElmIHRoZSBicm93c2VyL09TIGVhdHMgYSBtb2RpZmllciBrZXl1cCAoY29tbW9uIG9uIG1hY09TIGZvciBDbWQgY29tYm9zKSxcclxuICAgIC8vIGNsZWFyIGl0IGFzIHNvb24gYXMgd2Ugb2JzZXJ2ZSB0aGUgbW9kaWZpZXIgaXMgbm8gbG9uZ2VyIGhlbGQuXHJcbiAgICBpZiAoIWV2ZW50Lm1ldGFLZXkpIHtcclxuICAgICAgaWYgKGlzUHJlc3NlZCgnTWV0YUxlZnQnKSkgcmVsZWFzZUNvZGUoJ01ldGFMZWZ0Jyk7XHJcbiAgICAgIGlmIChpc1ByZXNzZWQoJ01ldGFSaWdodCcpKSByZWxlYXNlQ29kZSgnTWV0YVJpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgaWYgKGlzUHJlc3NlZCgnQ29udHJvbExlZnQnKSkgcmVsZWFzZUNvZGUoJ0NvbnRyb2xMZWZ0Jyk7XHJcbiAgICAgIGlmIChpc1ByZXNzZWQoJ0NvbnRyb2xSaWdodCcpKSByZWxlYXNlQ29kZSgnQ29udHJvbFJpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWV2ZW50LmFsdEtleSkge1xyXG4gICAgICBpZiAoaXNQcmVzc2VkKCdBbHRMZWZ0JykpIHJlbGVhc2VDb2RlKCdBbHRMZWZ0Jyk7XHJcbiAgICAgIGlmIChpc1ByZXNzZWQoJ0FsdFJpZ2h0JykpIHJlbGVhc2VDb2RlKCdBbHRSaWdodCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFldmVudC5zaGlmdEtleSkge1xyXG4gICAgICBpZiAoaXNQcmVzc2VkKCdTaGlmdExlZnQnKSkgcmVsZWFzZUNvZGUoJ1NoaWZ0TGVmdCcpO1xyXG4gICAgICBpZiAoaXNQcmVzc2VkKCdTaGlmdFJpZ2h0JykpIHJlbGVhc2VDb2RlKCdTaGlmdFJpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVsZWFzZVN0YWxlQ2hvcmRlZEtleXMgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuICAgIC8vIElmIHRoZSBicm93c2VyL09TIGF0ZSB0aGUga2V5dXAgZm9yIGEgbm9uLW1vZGlmaWVyIGR1cmluZyBhIGNob3JkIChDbWQvQ3RybC9BbHQpLFxyXG4gICAgLy8gcmVsZWFzZSBpdCBhcyBzb29uIGFzIHdlIG9ic2VydmUgdGhlIGNob3JkIG1vZGlmaWVycyBhcmUgbm8gbG9uZ2VyIGhlbGQuXHJcbiAgICBpZiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuO1xyXG4gICAgaWYgKCFwcmVzc2VkS2V5cy5zaXplKSByZXR1cm47XHJcbiAgICBjb25zdCB0cyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZm9yIChjb25zdCBbY29kZSwgZW50cnldIG9mIHByZXNzZWRLZXlzKSB7XHJcbiAgICAgIGlmICghZW50cnkuY2hvcmRlZCkgY29udGludWU7XHJcbiAgICAgIGlmIChpc01vZGlmaWVyQ29kZShjb2RlKSkgY29udGludWU7XHJcbiAgICAgIGNsZWFyS2V5QXV0b1JlbGVhc2UoY29kZSk7XHJcbiAgICAgIGNvbnN0IHBheWxvYWQ6IElucHV0TWVzc2FnZSA9IHtcclxuICAgICAgICB0eXBlOiAna2V5X3VwJyxcclxuICAgICAgICBrZXk6IGVudHJ5LmtleSxcclxuICAgICAgICBjb2RlOiBlbnRyeS5jb2RlLFxyXG4gICAgICAgIHJlcGVhdDogZmFsc2UsXHJcbiAgICAgICAgbW9kaWZpZXJzOiBtb2RpZmllcnNGcm9tRXZlbnQoZXZlbnQpLFxyXG4gICAgICAgIHRzLFxyXG4gICAgICB9O1xyXG4gICAgICBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICAgICAgcHJlc3NlZEtleXMuZGVsZXRlKGNvZGUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RLZXlib2FyZExvY2tGb3JDYXB0dXJlID0gKCkgPT4ge1xyXG4gICAgaWYgKGtleWJvYXJkTG9ja1JlcXVlc3RlZCkgcmV0dXJuO1xyXG4gICAga2V5Ym9hcmRMb2NrUmVxdWVzdGVkID0gdHJ1ZTtcclxuICAgIHZvaWQgcmVxdWVzdEtleWJvYXJkTG9jaygpLnRoZW4oKGxvY2tlZCkgPT4ge1xyXG4gICAgICBpZiAoIWxvY2tlZCkge1xyXG4gICAgICAgIGtleWJvYXJkTG9ja1JlcXVlc3RlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBjb25zdCByZWxlYXNlS2V5Ym9hcmRMb2NrRm9yQ2FwdHVyZSA9ICgpID0+IHtcclxuICAgIGlmICgha2V5Ym9hcmRMb2NrUmVxdWVzdGVkKSByZXR1cm47XHJcbiAgICBrZXlib2FyZExvY2tSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuICAgIHJlbGVhc2VLZXlib2FyZExvY2soKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBxdWV1ZU1vdmUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQgfCBQb2ludGVyRXZlbnQpID0+IHtcclxuICAgIGNvbnN0IHsgeCwgeSB9ID0gbm9ybWFsaXplUG9pbnQoZXZlbnQsIGVsZW1lbnQsIHZpZGVvKTtcclxuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgY29uc3QgZXZlbnRMYWdNcyA9IE1hdGgubWF4KDAsIG5vdyAtIGV2ZW50LnRpbWVTdGFtcCk7XHJcbiAgICBtb3ZlRXZlbnRMYWdTdW0gKz0gZXZlbnRMYWdNcztcclxuICAgIG1vdmVFdmVudExhZ1NhbXBsZXMgKz0gMTtcclxuICAgIG1ldHJpY3MubGFzdE1vdmVFdmVudExhZ01zID0gZXZlbnRMYWdNcztcclxuICAgIG1ldHJpY3MuYXZnTW92ZUV2ZW50TGFnTXMgPSBtb3ZlRXZlbnRMYWdTdW0gLyBtb3ZlRXZlbnRMYWdTYW1wbGVzO1xyXG4gICAgbWV0cmljcy5tYXhNb3ZlRXZlbnRMYWdNcyA9IE1hdGgubWF4KG1ldHJpY3MubWF4TW92ZUV2ZW50TGFnTXMgPz8gMCwgZXZlbnRMYWdNcyk7XHJcbiAgICBxdWV1ZWRNb3ZlQXQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHF1ZXVlZE1vdmUgPSB7XHJcbiAgICAgIHR5cGU6ICdtb3VzZV9tb3ZlJyxcclxuICAgICAgeCxcclxuICAgICAgeSxcclxuICAgICAgYnV0dG9uczogZXZlbnQuYnV0dG9ucyxcclxuICAgICAgbW9kaWZpZXJzOiBtb2RpZmllcnNGcm9tRXZlbnQoZXZlbnQpLFxyXG4gICAgICB0czogcGVyZm9ybWFuY2Uubm93KCksXHJcbiAgICB9O1xyXG4gICAgbW92ZVJhdGVDb3VudCArPSAxO1xyXG4gICAgaWYgKCFyYWZJZCkgcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZmx1c2hNb3ZlKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzZW5kQnV0dG9uID0gKGV2ZW50OiBNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50LCB0eXBlOiAnbW91c2VfZG93bicgfCAnbW91c2VfdXAnKSA9PiB7XHJcbiAgICBjb25zdCB7IHgsIHkgfSA9IG5vcm1hbGl6ZVBvaW50KGV2ZW50LCBlbGVtZW50LCB2aWRlbyk7XHJcbiAgICBjb25zdCBwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgPSB7XHJcbiAgICAgIHR5cGUsXHJcbiAgICAgIGJ1dHRvbjogZXZlbnQuYnV0dG9uLFxyXG4gICAgICB4LFxyXG4gICAgICB5LFxyXG4gICAgICBtb2RpZmllcnM6IG1vZGlmaWVyc0Zyb21FdmVudChldmVudCksXHJcbiAgICAgIHRzOiBwZXJmb3JtYW5jZS5ub3coKSxcclxuICAgIH07XHJcbiAgICBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBvbldoZWVsID0gKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgY29uc3QgeyB4LCB5IH0gPSBub3JtYWxpemVQb2ludChldmVudCwgZWxlbWVudCwgdmlkZW8pO1xyXG4gICAgY29uc3QgZHggPSBub3JtYWxpemVXaGVlbERlbHRhKGV2ZW50LmRlbHRhWCwgZXZlbnQuZGVsdGFNb2RlKTtcclxuICAgIGNvbnN0IGR5ID0gbm9ybWFsaXplV2hlZWxEZWx0YShldmVudC5kZWx0YVksIGV2ZW50LmRlbHRhTW9kZSk7XHJcbiAgICBjb25zdCBwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgPSB7XHJcbiAgICAgIHR5cGU6ICd3aGVlbCcsXHJcbiAgICAgIGR4LFxyXG4gICAgICBkeSxcclxuICAgICAgeCxcclxuICAgICAgeSxcclxuICAgICAgbW9kaWZpZXJzOiBtb2RpZmllcnNGcm9tRXZlbnQoZXZlbnQpLFxyXG4gICAgICB0czogcGVyZm9ybWFuY2Uubm93KCksXHJcbiAgICB9O1xyXG4gICAgc2VuZFBheWxvYWQocGF5bG9hZCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgb25LZXlEb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCBmdWxsc2NyZWVuID0gaXNGdWxsc2NyZWVuRWxlbWVudChlbGVtZW50KTtcclxuICAgIGlmICghZnVsbHNjcmVlbikge1xyXG4gICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBlbGVtZW50KSByZXR1cm47XHJcbiAgICAgIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybjtcclxuICAgIH1cclxuICAgIHJlbGVhc2VTdGFsZU1vZGlmaWVyS2V5cyhldmVudCk7XHJcbiAgICByZWxlYXNlU3RhbGVDaG9yZGVkS2V5cyhldmVudCk7XHJcbiAgICByZXF1ZXN0S2V5Ym9hcmRMb2NrRm9yQ2FwdHVyZSgpO1xyXG4gICAgaWYgKHNob3VsZFByZXZlbnREZWZhdWx0S2V5KGV2ZW50KSkge1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGV4aXN0aW5nID0gcHJlc3NlZEtleXMuZ2V0KGV2ZW50LmNvZGUpO1xyXG4gICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgIGlmIChpc01vZGlmaWVyQ29kZShldmVudC5jb2RlKSkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgaWYgKGV4aXN0aW5nLmxhc3RSZXBlYXRTZW50QXQgIT0gbnVsbCAmJiBub3cgLSBleGlzdGluZy5sYXN0UmVwZWF0U2VudEF0IDwgMjApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZXhpc3RpbmcubGFzdFJlcGVhdFNlbnRBdCA9IG5vdztcclxuICAgICAgY29uc3QgcGF5bG9hZDogSW5wdXRNZXNzYWdlID0ge1xyXG4gICAgICAgIHR5cGU6ICdrZXlfZG93bicsXHJcbiAgICAgICAga2V5OiBleGlzdGluZy5rZXksXHJcbiAgICAgICAgY29kZTogZXhpc3RpbmcuY29kZSxcclxuICAgICAgICByZXBlYXQ6IHRydWUsXHJcbiAgICAgICAgbW9kaWZpZXJzOiBtb2RpZmllcnNGcm9tRXZlbnQoZXZlbnQpLFxyXG4gICAgICAgIHRzOiBub3csXHJcbiAgICAgIH07XHJcbiAgICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaG9yZGVkID0gc2hvdWxkUHJldmVudERlZmF1bHRLZXkoZXZlbnQpICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQuYWx0S2V5KTtcclxuICAgIHByZXNzZWRLZXlzLnNldChldmVudC5jb2RlLCB7IGtleTogZXZlbnQua2V5LCBjb2RlOiBldmVudC5jb2RlLCBjaG9yZGVkIH0pO1xyXG4gICAgY29uc3QgcGF5bG9hZDogSW5wdXRNZXNzYWdlID0ge1xyXG4gICAgICB0eXBlOiAna2V5X2Rvd24nLFxyXG4gICAgICBrZXk6IGV2ZW50LmtleSxcclxuICAgICAgY29kZTogZXZlbnQuY29kZSxcclxuICAgICAgcmVwZWF0OiBldmVudC5yZXBlYXQsXHJcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzRnJvbUV2ZW50KGV2ZW50KSxcclxuICAgICAgdHM6IHBlcmZvcm1hbmNlLm5vdygpLFxyXG4gICAgfTtcclxuICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gICAgc2NoZWR1bGVLZXlBdXRvUmVsZWFzZShldmVudCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgb25LZXlVcCA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgY29uc3QgZnVsbHNjcmVlbiA9IGlzRnVsbHNjcmVlbkVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICBpZiAoIWZ1bGxzY3JlZW4pIHtcclxuICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZWxlbWVudCkgcmV0dXJuO1xyXG4gICAgICBpZiAoaXNFZGl0YWJsZVRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZWxlYXNlU3RhbGVNb2RpZmllcktleXMoZXZlbnQpO1xyXG4gICAgcmVsZWFzZVN0YWxlQ2hvcmRlZEtleXMoZXZlbnQpO1xyXG4gICAgaWYgKHNob3VsZFByZXZlbnREZWZhdWx0S2V5KGV2ZW50KSkge1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICAgIGNsZWFyS2V5QXV0b1JlbGVhc2UoZXZlbnQuY29kZSk7XHJcbiAgICBwcmVzc2VkS2V5cy5kZWxldGUoZXZlbnQuY29kZSk7XHJcbiAgICBjb25zdCBwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgPSB7XHJcbiAgICAgIHR5cGU6ICdrZXlfdXAnLFxyXG4gICAgICBrZXk6IGV2ZW50LmtleSxcclxuICAgICAgY29kZTogZXZlbnQuY29kZSxcclxuICAgICAgcmVwZWF0OiBldmVudC5yZXBlYXQsXHJcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzRnJvbUV2ZW50KGV2ZW50KSxcclxuICAgICAgdHM6IHBlcmZvcm1hbmNlLm5vdygpLFxyXG4gICAgfTtcclxuICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG9uTW91c2VNb3ZlID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBxdWV1ZU1vdmUoZXZlbnQpO1xyXG4gIGNvbnN0IG9uTW91c2VEb3duID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBlbGVtZW50LmZvY3VzKCk7XHJcbiAgICByZXF1ZXN0S2V5Ym9hcmRMb2NrRm9yQ2FwdHVyZSgpO1xyXG4gICAgc2VuZEJ1dHRvbihldmVudCwgJ21vdXNlX2Rvd24nKTtcclxuICB9O1xyXG4gIGNvbnN0IG9uTW91c2VVcCA9IChldmVudDogTW91c2VFdmVudCkgPT4gc2VuZEJ1dHRvbihldmVudCwgJ21vdXNlX3VwJyk7XHJcbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICd0b3VjaCcpIHJldHVybjtcclxuICAgIHF1ZXVlTW92ZShldmVudCk7XHJcbiAgfTtcclxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IHtcclxuICAgIGlmIChldmVudC5wb2ludGVyVHlwZSA9PT0gJ3RvdWNoJykgcmV0dXJuO1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgcmVxdWVzdEtleWJvYXJkTG9ja0ZvckNhcHR1cmUoKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGVsZW1lbnQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICAgIHNlbmRCdXR0b24oZXZlbnQsICdtb3VzZV9kb3duJyk7XHJcbiAgfTtcclxuICBjb25zdCBvblBvaW50ZXJVcCA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICd0b3VjaCcpIHJldHVybjtcclxuICAgIHNlbmRCdXR0b24oZXZlbnQsICdtb3VzZV91cCcpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgZWxlbWVudC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IG9uUG9pbnRlckNhbmNlbCA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICd0b3VjaCcpIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGVsZW1lbnQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZCk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgLyogaWdub3JlICovXHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBvbkNvbnRleHRNZW51ID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH07XHJcbiAgY29uc3Qgb25CbHVyID0gKCkgPT4ge1xyXG4gICAgcmVsZWFzZUFsbEtleXMoKTtcclxuICAgIHJlbGVhc2VLZXlib2FyZExvY2tGb3JDYXB0dXJlKCk7XHJcbiAgfTtcclxuICBjb25zdCBvblZpc2liaWxpdHlDaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XHJcbiAgICAgIHJlbGVhc2VBbGxLZXlzKCk7XHJcbiAgICAgIHJlbGVhc2VLZXlib2FyZExvY2tGb3JDYXB0dXJlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2FtZXBhZFN0YXRlcyA9IG5ldyBNYXA8bnVtYmVyLCBHYW1lcGFkU25hcHNob3Q+KCk7XHJcbiAgY29uc3QgZ2FtZXBhZE1ldGEgPSBuZXcgTWFwPG51bWJlciwgR2FtZXBhZE1ldGE+KCk7XHJcbiAgbGV0IGdhbWVwYWRSYWYgPSAwO1xyXG5cclxuICBjb25zdCBlbnN1cmVHYW1lcGFkTWV0YSA9IChnYW1lcGFkOiBHYW1lcGFkKSA9PiB7XHJcbiAgICBjb25zdCBleGlzdGluZyA9IGdhbWVwYWRNZXRhLmdldChnYW1lcGFkLmluZGV4KTtcclxuICAgIGlmIChleGlzdGluZykgcmV0dXJuIGV4aXN0aW5nO1xyXG4gICAgY29uc3QgdHlwZSA9IHJlc29sdmVHYW1lcGFkVHlwZShnYW1lcGFkKTtcclxuICAgIGNvbnN0IGJ1dHRvbk1hcCA9IHJlc29sdmVCdXR0b25NYXAoZ2FtZXBhZCwgdHlwZSk7XHJcbiAgICBsZXQgc3VwcG9ydGVkQnV0dG9ucyA9IDA7XHJcbiAgICBidXR0b25NYXAuZm9yRWFjaCgoYml0KSA9PiB7XHJcbiAgICAgIHN1cHBvcnRlZEJ1dHRvbnMgfD0gYml0O1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBtb3Rpb24gPSByZWFkR2FtZXBhZE1vdGlvbihnYW1lcGFkKTtcclxuICAgIGNvbnN0IGhhc0d5cm8gPSBCb29sZWFuKG1vdGlvbi5neXJvKTtcclxuICAgIGNvbnN0IGhhc0FjY2VsID0gQm9vbGVhbihtb3Rpb24uYWNjZWwpO1xyXG4gICAgbGV0IGNhcGFiaWxpdGllcyA9IDA7XHJcbiAgICBpZiAoZ2FtZXBhZC5idXR0b25zLmxlbmd0aCA+IDYgfHwgZ2FtZXBhZC5idXR0b25zLmxlbmd0aCA+IDcpIHtcclxuICAgICAgY2FwYWJpbGl0aWVzIHw9IEdBTUVQQURfQ0FQUy5hbmFsb2dUcmlnZ2VycztcclxuICAgIH1cclxuICAgIGlmIChoYXNBY2NlbCB8fCB0eXBlID09PSBHQU1FUEFEX1RZUEUucGxheXN0YXRpb24pIHtcclxuICAgICAgY2FwYWJpbGl0aWVzIHw9IEdBTUVQQURfQ0FQUy5hY2NlbDtcclxuICAgIH1cclxuICAgIGlmIChoYXNHeXJvIHx8IHR5cGUgPT09IEdBTUVQQURfVFlQRS5wbGF5c3RhdGlvbikge1xyXG4gICAgICBjYXBhYmlsaXRpZXMgfD0gR0FNRVBBRF9DQVBTLmd5cm87XHJcbiAgICB9XHJcbiAgICBjb25zdCBtZXRhOiBHYW1lcGFkTWV0YSA9IHtcclxuICAgICAgYnV0dG9uTWFwLFxyXG4gICAgICBzdXBwb3J0ZWRCdXR0b25zLFxyXG4gICAgICBjYXBhYmlsaXRpZXMsXHJcbiAgICAgIHR5cGUsXHJcbiAgICAgIGNvbm5lY3RlZDogZmFsc2UsXHJcbiAgICAgIG5lZWRzUmVzeW5jOiB0cnVlLFxyXG4gICAgfTtcclxuICAgIGdhbWVwYWRNZXRhLnNldChnYW1lcGFkLmluZGV4LCBtZXRhKTtcclxuICAgIHJldHVybiBtZXRhO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNlbmRHYW1lcGFkQ29ubmVjdCA9IChnYW1lcGFkOiBHYW1lcGFkLCBtZXRhOiBHYW1lcGFkTWV0YSkgPT4ge1xyXG4gICAgY29uc3QgcGF5bG9hZDogSW5wdXRNZXNzYWdlID0ge1xyXG4gICAgICB0eXBlOiAnZ2FtZXBhZF9jb25uZWN0JyxcclxuICAgICAgaWQ6IGdhbWVwYWQuaW5kZXgsXHJcbiAgICAgIGdhbWVwYWRUeXBlOiBtZXRhLnR5cGUsXHJcbiAgICAgIGNhcGFiaWxpdGllczogbWV0YS5jYXBhYmlsaXRpZXMsXHJcbiAgICAgIHN1cHBvcnRlZEJ1dHRvbnM6IG1ldGEuc3VwcG9ydGVkQnV0dG9ucyxcclxuICAgICAgdHM6IHBlcmZvcm1hbmNlLm5vdygpLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzZW5kR2FtZXBhZERpc2Nvbm5lY3QgPSAoaW5kZXg6IG51bWJlciwgYWN0aXZlTWFzazogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgPSB7XHJcbiAgICAgIHR5cGU6ICdnYW1lcGFkX2Rpc2Nvbm5lY3QnLFxyXG4gICAgICBpZDogaW5kZXgsXHJcbiAgICAgIGFjdGl2ZU1hc2ssXHJcbiAgICAgIHRzOiBwZXJmb3JtYW5jZS5ub3coKSxcclxuICAgIH07XHJcbiAgICByZXR1cm4gc2VuZFBheWxvYWQocGF5bG9hZCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWF5YmVTZW5kTW90aW9uID0gKFxyXG4gICAgaW5kZXg6IG51bWJlcixcclxuICAgIG1ldGE6IEdhbWVwYWRNZXRhLFxyXG4gICAgbW90aW9uOiB7IGd5cm8/OiBHYW1lcGFkVmVjdG9yOyBhY2NlbD86IEdhbWVwYWRWZWN0b3IgfSxcclxuICAgIG5vdzogbnVtYmVyLFxyXG4gICkgPT4ge1xyXG4gICAgY29uc3QgbW90aW9uU3RhdGUgPSBtb3Rpb25SZXF1ZXN0U3RhdGUuZ2V0KGluZGV4KTtcclxuICAgIGNvbnN0IGd5cm9FbmFibGVkID0gbW90aW9uU3RhdGUgPyBtb3Rpb25TdGF0ZS5neXJvIDogdHJ1ZTtcclxuICAgIGNvbnN0IGFjY2VsRW5hYmxlZCA9IG1vdGlvblN0YXRlID8gbW90aW9uU3RhdGUuYWNjZWwgOiB0cnVlO1xyXG4gICAgaWYgKG1vdGlvbi5neXJvICYmIGd5cm9FbmFibGVkKSB7XHJcbiAgICAgIGNvbnN0IGxhc3RBdCA9IG1ldGEubGFzdEd5cm9BdCA/PyAwO1xyXG4gICAgICBpZiAobm93IC0gbGFzdEF0ID49IE1PVElPTl9TRU5EX0lOVEVSVkFMX01TICYmIG1vdGlvbkNoYW5nZWQobWV0YS5sYXN0R3lybywgbW90aW9uLmd5cm8pKSB7XHJcbiAgICAgICAgbWV0YS5sYXN0R3lyb0F0ID0gbm93O1xyXG4gICAgICAgIG1ldGEubGFzdEd5cm8gPSBtb3Rpb24uZ3lybztcclxuICAgICAgICBjb25zdCBwYXlsb2FkOiBJbnB1dE1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICB0eXBlOiAnZ2FtZXBhZF9tb3Rpb24nLFxyXG4gICAgICAgICAgaWQ6IGluZGV4LFxyXG4gICAgICAgICAgbW90aW9uVHlwZTogMixcclxuICAgICAgICAgIHg6IChtb3Rpb24uZ3lyb1swXSAqIDE4MCkgLyBNYXRoLlBJLFxyXG4gICAgICAgICAgeTogKG1vdGlvbi5neXJvWzFdICogMTgwKSAvIE1hdGguUEksXHJcbiAgICAgICAgICB6OiAobW90aW9uLmd5cm9bMl0gKiAxODApIC8gTWF0aC5QSSxcclxuICAgICAgICAgIHRzOiBub3csXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG1vdGlvbi5hY2NlbCAmJiBhY2NlbEVuYWJsZWQpIHtcclxuICAgICAgY29uc3QgbGFzdEF0ID0gbWV0YS5sYXN0QWNjZWxBdCA/PyAwO1xyXG4gICAgICBpZiAobm93IC0gbGFzdEF0ID49IE1PVElPTl9TRU5EX0lOVEVSVkFMX01TICYmIG1vdGlvbkNoYW5nZWQobWV0YS5sYXN0QWNjZWwsIG1vdGlvbi5hY2NlbCkpIHtcclxuICAgICAgICBtZXRhLmxhc3RBY2NlbEF0ID0gbm93O1xyXG4gICAgICAgIG1ldGEubGFzdEFjY2VsID0gbW90aW9uLmFjY2VsO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IElucHV0TWVzc2FnZSA9IHtcclxuICAgICAgICAgIHR5cGU6ICdnYW1lcGFkX21vdGlvbicsXHJcbiAgICAgICAgICBpZDogaW5kZXgsXHJcbiAgICAgICAgICBtb3Rpb25UeXBlOiAxLFxyXG4gICAgICAgICAgeDogbW90aW9uLmFjY2VsWzBdLFxyXG4gICAgICAgICAgeTogbW90aW9uLmFjY2VsWzFdLFxyXG4gICAgICAgICAgejogbW90aW9uLmFjY2VsWzJdLFxyXG4gICAgICAgICAgdHM6IG5vdyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbmRQYXlsb2FkKHBheWxvYWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcG9sbEdhbWVwYWRzID0gKCkgPT4ge1xyXG4gICAgZ2FtZXBhZFJhZiA9IDA7XHJcbiAgICBjb25zdCBwYWRzID0gZ2V0R2FtZXBhZHMoKTtcclxuICAgIGxldCBhY3RpdmVNYXNrID0gMDtcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgIGZvciAoY29uc3QgW3BhZEluZGV4LCBwYWRdIG9mIHBhZHMuZW50cmllcygpKSB7XHJcbiAgICAgIGlmICghcGFkKSBjb250aW51ZTtcclxuICAgICAgaWYgKCFpc0dhbWVwYWRDb25uZWN0ZWQocGFkKSkgY29udGludWU7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyLmlzRmluaXRlKHBhZC5pbmRleCkgPyBwYWQuaW5kZXggOiBwYWRJbmRleDtcclxuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBNQVhfR0FNRVBBRFMpIGNvbnRpbnVlO1xyXG4gICAgICBhY3RpdmVNYXNrIHw9IDEgPDwgaW5kZXg7XHJcbiAgICAgIHNlZW4uYWRkKGluZGV4KTtcclxuICAgICAgYWN0aXZlR2FtZXBhZHMuc2V0KGluZGV4LCBwYWQpO1xyXG4gICAgICBjb25zdCBtZXRhID0gZW5zdXJlR2FtZXBhZE1ldGEocGFkKTtcclxuICAgICAgaWYgKCFtZXRhLmNvbm5lY3RlZCkge1xyXG4gICAgICAgIGlmIChzZW5kR2FtZXBhZENvbm5lY3QocGFkLCBtZXRhKSkge1xyXG4gICAgICAgICAgbWV0YS5jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbWV0YS5uZWVkc1Jlc3luYyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1ldGEubmVlZHNSZXN5bmMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzbmFwc2hvdCA9IHJlYWRHYW1lcGFkU3RhdGUocGFkLCBtZXRhLmJ1dHRvbk1hcCk7XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gZ2FtZXBhZFN0YXRlcy5nZXQoaW5kZXgpO1xyXG4gICAgICBjb25zdCBzdGF0ZUNoYW5nZWQgPVxyXG4gICAgICAgICFwcmV2aW91cyB8fFxyXG4gICAgICAgIHByZXZpb3VzLmJ1dHRvbnMgIT09IHNuYXBzaG90LmJ1dHRvbnMgfHxcclxuICAgICAgICBwcmV2aW91cy5sdCAhPT0gc25hcHNob3QubHQgfHxcclxuICAgICAgICBwcmV2aW91cy5ydCAhPT0gc25hcHNob3QucnQgfHxcclxuICAgICAgICBwcmV2aW91cy5sc1ggIT09IHNuYXBzaG90LmxzWCB8fFxyXG4gICAgICAgIHByZXZpb3VzLmxzWSAhPT0gc25hcHNob3QubHNZIHx8XHJcbiAgICAgICAgcHJldmlvdXMucnNYICE9PSBzbmFwc2hvdC5yc1ggfHxcclxuICAgICAgICBwcmV2aW91cy5yc1kgIT09IHNuYXBzaG90LnJzWTtcclxuICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGNvbnN0IHNob3VsZEhlYXJ0YmVhdCA9XHJcbiAgICAgICAgIW1ldGEubGFzdFN0YXRlU2VudEF0IHx8IG5vdyAtIG1ldGEubGFzdFN0YXRlU2VudEF0ID49IEdBTUVQQURfU1RBVEVfSEVBUlRCRUFUX01TO1xyXG4gICAgICBpZiAoc3RhdGVDaGFuZ2VkIHx8IG1ldGEubmVlZHNSZXN5bmMgfHwgc2hvdWxkSGVhcnRiZWF0KSB7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZDogSW5wdXRNZXNzYWdlID0ge1xyXG4gICAgICAgICAgdHlwZTogJ2dhbWVwYWRfc3RhdGUnLFxyXG4gICAgICAgICAgaWQ6IGluZGV4LFxyXG4gICAgICAgICAgYWN0aXZlTWFzayxcclxuICAgICAgICAgIGJ1dHRvbnM6IHNuYXBzaG90LmJ1dHRvbnMsXHJcbiAgICAgICAgICBnYW1lcGFkVHlwZTogbWV0YS50eXBlLFxyXG4gICAgICAgICAgY2FwYWJpbGl0aWVzOiBtZXRhLmNhcGFiaWxpdGllcyxcclxuICAgICAgICAgIHN1cHBvcnRlZEJ1dHRvbnM6IG1ldGEuc3VwcG9ydGVkQnV0dG9ucyxcclxuICAgICAgICAgIGx0OiBzbmFwc2hvdC5sdCxcclxuICAgICAgICAgIHJ0OiBzbmFwc2hvdC5ydCxcclxuICAgICAgICAgIGxzWDogc25hcHNob3QubHNYLFxyXG4gICAgICAgICAgbHNZOiBzbmFwc2hvdC5sc1ksXHJcbiAgICAgICAgICByc1g6IHNuYXBzaG90LnJzWCxcclxuICAgICAgICAgIHJzWTogc25hcHNob3QucnNZLFxyXG4gICAgICAgICAgdHM6IG5vdyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHNlbnQgPSBzZW5kUGF5bG9hZChwYXlsb2FkKTtcclxuICAgICAgICBpZiAoc2VudCkge1xyXG4gICAgICAgICAgZ2FtZXBhZFN0YXRlcy5zZXQoaW5kZXgsIHNuYXBzaG90KTtcclxuICAgICAgICAgIG1ldGEubmVlZHNSZXN5bmMgPSBmYWxzZTtcclxuICAgICAgICAgIG1ldGEubGFzdFN0YXRlU2VudEF0ID0gbm93O1xyXG4gICAgICAgICAgbWV0YS5jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtZXRhLm5lZWRzUmVzeW5jID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbW90aW9uID0gcmVhZEdhbWVwYWRNb3Rpb24ocGFkKTtcclxuICAgICAgaWYgKG1vdGlvbi5neXJvIHx8IG1vdGlvbi5hY2NlbCkge1xyXG4gICAgICAgIG1heWJlU2VuZE1vdGlvbihpbmRleCwgbWV0YSwgbW90aW9uLCBub3cpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZ2FtZXBhZE1ldGEuc2l6ZSkge1xyXG4gICAgICBjb25zdCBtaXNzaW5nOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICBnYW1lcGFkTWV0YS5mb3JFYWNoKChfdmFsdWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKCFzZWVuLmhhcyhpbmRleCkpIHtcclxuICAgICAgICAgIG1pc3NpbmcucHVzaChpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoKSB7XHJcbiAgICAgICAgbWlzc2luZy5mb3JFYWNoKChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgZ2FtZXBhZE1ldGEuZGVsZXRlKGluZGV4KTtcclxuICAgICAgICAgIGdhbWVwYWRTdGF0ZXMuZGVsZXRlKGluZGV4KTtcclxuICAgICAgICAgIGFjdGl2ZUdhbWVwYWRzLmRlbGV0ZShpbmRleCk7XHJcbiAgICAgICAgICBtb3Rpb25SZXF1ZXN0U3RhdGUuZGVsZXRlKGluZGV4KTtcclxuICAgICAgICAgIHNlbmRHYW1lcGFkRGlzY29ubmVjdChpbmRleCwgYWN0aXZlTWFzayk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFjdGl2ZUdhbWVwYWRzLmZvckVhY2goKF9wYWQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmICghc2Vlbi5oYXMoaW5kZXgpKSB7XHJcbiAgICAgICAgYWN0aXZlR2FtZXBhZHMuZGVsZXRlKGluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoc3VwcG9ydHNHYW1lcGFkKSB7XHJcbiAgICAgIGdhbWVwYWRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEdhbWVwYWRzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBvbkdhbWVwYWRDb25uZWN0ZWQgPSAoKSA9PiB7XHJcbiAgICBpZiAoIXN1cHBvcnRzR2FtZXBhZCkgcmV0dXJuO1xyXG4gICAgaWYgKCFnYW1lcGFkUmFmKSB7XHJcbiAgICAgIGdhbWVwYWRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEdhbWVwYWRzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBvbkdhbWVwYWREaXNjb25uZWN0ZWQgPSAoKSA9PiB7XHJcbiAgICBpZiAoIXN1cHBvcnRzR2FtZXBhZCkgcmV0dXJuO1xyXG4gICAgaWYgKCFnYW1lcGFkUmFmKSB7XHJcbiAgICAgIGdhbWVwYWRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEdhbWVwYWRzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoc3VwcG9ydHNQb2ludGVyKSB7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgb25Qb2ludGVyTW92ZSk7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93bik7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIG9uUG9pbnRlckNhbmNlbCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG4gIH1cclxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgdHJ1ZSk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgb25LZXlVcCwgdHJ1ZSk7XHJcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xyXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIG9uQmx1cik7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBvbkJsdXIpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCBvblZpc2liaWxpdHlDaGFuZ2UpO1xyXG5cclxuICBpZiAoc3VwcG9ydHNHYW1lcGFkKSB7XHJcbiAgICBnYW1lcGFkUmFmID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGxHYW1lcGFkcyk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZ2FtZXBhZGNvbm5lY3RlZCcsIG9uR2FtZXBhZENvbm5lY3RlZCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsIG9uR2FtZXBhZERpc2Nvbm5lY3RlZCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKCkgPT4ge1xyXG4gICAgaWYgKHJhZklkKSBjYW5jZWxBbmltYXRpb25GcmFtZShyYWZJZCk7XHJcbiAgICBpZiAoZ2FtZXBhZFJhZikgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZ2FtZXBhZFJhZik7XHJcbiAgICBpZiAoc3VwcG9ydHNQb2ludGVyKSB7XHJcbiAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBvblBvaW50ZXJNb3ZlKTtcclxuICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24pO1xyXG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwKTtcclxuICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgb25Qb2ludGVyQ2FuY2VsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcclxuICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcclxuICAgIH1cclxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duLCB0cnVlKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIG9uS2V5VXAsIHRydWUpO1xyXG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xyXG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgb25CbHVyKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgb25CbHVyKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCBvblZpc2liaWxpdHlDaGFuZ2UpOyAgICAgICBcclxuICAgIHJlbGVhc2VLZXlib2FyZExvY2tGb3JDYXB0dXJlKCk7XHJcbiAgICBrZXlBdXRvUmVsZWFzZVRpbWVycy5mb3JFYWNoKCh0aW1lcikgPT4ge1xyXG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgIH0pO1xyXG4gICAga2V5QXV0b1JlbGVhc2VUaW1lcnMuY2xlYXIoKTtcclxuICAgIGlmIChzdXBwb3J0c0dhbWVwYWQpIHtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRjb25uZWN0ZWQnLCBvbkdhbWVwYWRDb25uZWN0ZWQpOyAgICAgICBcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLCBvbkdhbWVwYWREaXNjb25uZWN0ZWQpO1xyXG4gICAgfVxyXG4gICAgcmVsZWFzZUFsbEtleXMoKTtcclxuICAgIGlmIChnYW1lcGFkTWV0YS5zaXplKSB7XHJcbiAgICAgIGxldCBhY3RpdmVNYXNrID0gMDtcclxuICAgICAgZ2FtZXBhZE1ldGEuZm9yRWFjaCgoX3ZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gTUFYX0dBTUVQQURTKSByZXR1cm47XHJcbiAgICAgICAgYWN0aXZlTWFzayB8PSAxIDw8IGluZGV4O1xyXG4gICAgICB9KTtcclxuICAgICAgZ2FtZXBhZE1ldGEuZm9yRWFjaCgoX3ZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gTUFYX0dBTUVQQURTKSByZXR1cm47XHJcbiAgICAgICAgc2VuZEdhbWVwYWREaXNjb25uZWN0KGluZGV4LCBhY3RpdmVNYXNrICYgfigxIDw8IGluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBnYW1lcGFkTWV0YS5jbGVhcigpO1xyXG4gICAgICBnYW1lcGFkU3RhdGVzLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgICBhY3RpdmVHYW1lcGFkcy5jbGVhcigpO1xyXG4gICAgbW90aW9uUmVxdWVzdFN0YXRlLmNsZWFyKCk7XHJcbiAgfTtcclxufVxyXG4iLCI8dGVtcGxhdGU+XHJcbiAgPGRpdiBjbGFzcz1cIndlYnJ0Yy1hcHBcIiA6Y2xhc3M9XCJ7ICdzZXR0aW5ncy1vcGVuJzogc2hvd1NldHRpbmdzIH1cIj5cclxuICAgIDwhLS0gTWFpbiBDb250ZW50IEFyZWEgLS0+XHJcbiAgICA8ZGl2IGNsYXNzPVwibWFpbi1jb250ZW50XCI+XHJcbiAgICAgIDwhLS0gQ29tcGFjdCBIZWFkZXIgLS0+XHJcbiAgICAgIDxoZWFkZXIgY2xhc3M9XCJhcHAtaGVhZGVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1sZWZ0XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnJhbmRcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJyYW5kLWljb25cIj5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtcGxheVwiIDpzaXplPVwiMjBcIiAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGgxPnt7ICR0KCd3ZWJydGMudGl0bGUnKSB9fTwvaDE+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1jZW50ZXJcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0dXMtcGlsbFwiIDpjbGFzcz1cImNvbm5lY3Rpb25QaWxsQ2xhc3NcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3Bhbj57eyBjb25uZWN0aW9uU3RhdHVzTGFiZWwgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1yaWdodFwiPlxyXG4gICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICBjbGFzcz1cInNldHRpbmdzLWJ0blwiXHJcbiAgICAgICAgICAgIEBjbGljaz1cInNob3dTZXR0aW5ncyA9ICFzaG93U2V0dGluZ3NcIlxyXG4gICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogc2hvd1NldHRpbmdzIH1cIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtc2xpZGVycy1oXCIgOnNpemU9XCIxOFwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuPlNldHRpbmdzPC9zcGFuPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvaGVhZGVyPlxyXG5cclxuICAgICAgPCEtLSBHYW1lIExpYnJhcnkgLS0+XHJcbiAgICAgIDxzZWN0aW9uIGNsYXNzPVwibGlicmFyeS1zZWN0aW9uXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxpYnJhcnktaGVhZGVyXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicmFyeS10aXRsZS1yb3dcIj5cclxuICAgICAgICAgICAgPGgyPjxMdWNpZGVJY29uIG5hbWU9XCJmYS1nYW1lcGFkXCIgOnNpemU9XCIyMFwiIC8+IHt7ICR0KCd3ZWJydGMuc2VsZWN0X2dhbWUnKSB9fTwvaDI+XHJcbiAgICAgICAgICAgIDxzcGFuIHYtaWY9XCJzZWxlY3RlZEFwcElkXCIgY2xhc3M9XCJzZWxlY3Rpb24tYmFkZ2VcIj5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtY2hlY2stY2lyY2xlXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgICAge3sgc2VsZWN0ZWRBcHBMYWJlbCB9fVxyXG4gICAgICAgICAgICAgIDxidXR0b24gQGNsaWNrPVwiY2xlYXJTZWxlY3Rpb25cIiBjbGFzcz1cImNsZWFyLWJ0blwiPlxyXG4gICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRpbWVzXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1ib3hcIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXNlYXJjaFwiIDpzaXplPVwiMTZcIiAvPlxyXG4gICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICB2LW1vZGVsPVwic2VhcmNoUXVlcnlcIlxyXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICA6cGxhY2Vob2xkZXI9XCIkdCgnd2VicnRjLnNlYXJjaF9wbGFjZWhvbGRlcicpIHx8ICdTZWFyY2ggYXBwbGljYXRpb25zLi4uJ1wiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJzZWFyY2gtaW5wdXRcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8YnV0dG9uIHYtaWY9XCJzZWFyY2hRdWVyeVwiIEBjbGljaz1cInNlYXJjaFF1ZXJ5ID0gJydcIiBjbGFzcz1cInNlYXJjaC1jbGVhclwiIGFyaWEtbGFiZWw9XCJDbGVhciBzZWFyY2hcIj5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtdGltZXNcIiA6c2l6ZT1cIjE2XCIgLz5cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPCEtLSBObyBhcHBzIGF0IGFsbCAtLT5cclxuICAgICAgICA8ZGl2IHYtaWY9XCIhYXBwc0xpc3QubGVuZ3RoXCIgY2xhc3M9XCJlbXB0eS1zdGF0ZVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImVtcHR5LWljb24td3JhcFwiPlxyXG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwiZW1wdHktaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIGFyaWEtaGlkZGVuPlxyXG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIyXCIgeT1cIjNcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMTRcIiByeD1cIjNcIiBzdHJva2Utd2lkdGg9XCIxLjVcIi8+XHJcbiAgICAgICAgICAgICAgPHBhdGggZD1cIk04IDIxaDhNMTIgMTd2NFwiIHN0cm9rZS13aWR0aD1cIjEuNVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIi8+XHJcbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiA4djRtLTItMmg0XCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIi8+XHJcbiAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8aDM+Tm8gYXBwbGljYXRpb25zPC9oMz5cclxuICAgICAgICAgIDxwPkFkZCBnYW1lcyBpbiB0aGUgQXBwbGljYXRpb25zIHRhYiB0byBzdGFydCBzdHJlYW1pbmc8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDwhLS0gTm8gc2VhcmNoIHJlc3VsdHMgLS0+XHJcbiAgICAgICAgPGRpdiB2LWVsc2UtaWY9XCIhZmlsdGVyZWRBcHBzLmxlbmd0aFwiIGNsYXNzPVwiZW1wdHktc3RhdGVcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJlbXB0eS1pY29uLXdyYXBcIj5cclxuICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImVtcHR5LWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBhcmlhLWhpZGRlbj5cclxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTFcIiBjeT1cIjExXCIgcj1cIjdcIiBzdHJva2Utd2lkdGg9XCIxLjVcIi8+XHJcbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNi41IDE2LjVMMjEgMjFcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIvPlxyXG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNOC41IDExaDVNMTEgOC41djVcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiLz5cclxuICAgICAgICAgICAgICA8bGluZSB4MT1cIjguNVwiIHkxPVwiOC41XCIgeDI9XCIxMy41XCIgeTI9XCIxMy41XCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIG9wYWNpdHk9XCIwLjRcIi8+XHJcbiAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8aDM+Tm8gcmVzdWx0czwvaDM+XHJcbiAgICAgICAgICA8cD5ObyBhcHBsaWNhdGlvbnMgbWF0Y2ggPGVtPlwie3sgc2VhcmNoUXVlcnkgfX1cIjwvZW0+PC9wPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImVtcHR5LWNsZWFyLWJ0blwiIEBjbGljaz1cInNlYXJjaFF1ZXJ5ID0gJydcIj5DbGVhciBzZWFyY2g8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPHRlbXBsYXRlIHYtZWxzZT5cclxuICAgICAgICAgIDwhLS0gR2FtZXMgd2l0aCBCb3ggQXJ0IC0tPlxyXG4gICAgICAgICAgPGRpdiB2LWlmPVwiYXBwc1dpdGhDb3ZlcnMubGVuZ3RoXCIgY2xhc3M9XCJnYW1lcy1ncmlkXCI+XHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICB2LWZvcj1cImFwcCBpbiBhcHBzV2l0aENvdmVyc1wiXHJcbiAgICAgICAgICAgICAgOmtleT1cImFwcEtleShhcHApXCJcclxuICAgICAgICAgICAgICBAY2xpY2s9XCJzZWxlY3RBcHAoYXBwKVwiXHJcbiAgICAgICAgICAgICAgQGRibGNsaWNrPVwib25BcHBEb3VibGVDbGljayhhcHApXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImdhbWUtY2FyZFwiXHJcbiAgICAgICAgICAgICAgOmNsYXNzPVwieyBzZWxlY3RlZDogYXBwTnVtZXJpY0lkKGFwcCkgPT09IHNlbGVjdGVkQXBwSWQgfVwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZS1jb3ZlclwiPlxyXG4gICAgICAgICAgICAgICAgPGltZ1xyXG4gICAgICAgICAgICAgICAgICB2LWJpbmQ9XCJ7IC4uLihjb3ZlclVybChhcHApID8geyBzcmM6IGNvdmVyVXJsKGFwcCkgfSA6IHt9KSB9XCJcclxuICAgICAgICAgICAgICAgICAgOmFsdD1cImFwcC5uYW1lIHx8ICdBcHBsaWNhdGlvbidcIlxyXG4gICAgICAgICAgICAgICAgICBsb2FkaW5nPVwibGF6eVwiXHJcbiAgICAgICAgICAgICAgICAgIEBsb2FkPVwib25Db3ZlckxvYWQoYXBwKVwiXHJcbiAgICAgICAgICAgICAgICAgIEBlcnJvcj1cIm9uQ292ZXJFcnJvcihhcHApXCJcclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY292ZXItZ3JhZGllbnRcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgdi1pZj1cImFwcE51bWVyaWNJZChhcHApID09PSBzZWxlY3RlZEFwcElkXCIgY2xhc3M9XCJzZWxlY3RlZC1iYWRnZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtY2hlY2tcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXktb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtcGxheVwiIDpzaXplPVwiMjBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWUtbWV0YVwiPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJnYW1lLW5hbWVcIj57eyBhcHAubmFtZSB8fCAnXFx1MDBBMCcgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImdhbWUtc291cmNlXCI+e3sgYXBwU3VidGl0bGUoYXBwKSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIE90aGVyIEFwcGxpY2F0aW9ucyAobm8gYm94IGFydCkgLS0+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJhcHBzV2l0aG91dENvdmVycy5sZW5ndGhcIiBjbGFzcz1cIm90aGVyLWFwcHMtc2VjdGlvblwiPlxyXG4gICAgICAgICAgICA8aDMgY2xhc3M9XCJzZWN0aW9uLWxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXdpbmRvdy1tYXhpbWl6ZVwiIDpzaXplPVwiMThcIiAvPlxyXG4gICAgICAgICAgICAgIE90aGVyIEFwcGxpY2F0aW9uc1xyXG4gICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwcy1saXN0XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgdi1mb3I9XCJhcHAgaW4gYXBwc1dpdGhvdXRDb3ZlcnNcIlxyXG4gICAgICAgICAgICAgICAgOmtleT1cImFwcEtleShhcHApXCJcclxuICAgICAgICAgICAgICAgIEBjbGljaz1cInNlbGVjdEFwcChhcHApXCJcclxuICAgICAgICAgICAgICAgIEBkYmxjbGljaz1cIm9uQXBwRG91YmxlQ2xpY2soYXBwKVwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cImFwcC1saXN0LWl0ZW1cIlxyXG4gICAgICAgICAgICAgICAgOmNsYXNzPVwieyBzZWxlY3RlZDogYXBwTnVtZXJpY0lkKGFwcCkgPT09IHNlbGVjdGVkQXBwSWQgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFwcC1pY29uXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxMdWNpZGVJY29uIG5hbWU9XCJmYS13aW5kb3ctbWF4aW1pemVcIiA6c2l6ZT1cIjE4XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFwcC1pbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYXBwLW5hbWVcIj57eyBhcHAubmFtZSB8fCAnXFx1MDBBMCcgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYXBwLXNvdXJjZVwiPnt7IGFwcFN1YnRpdGxlKGFwcCkgfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgdi1pZj1cImFwcE51bWVyaWNJZChhcHApID09PSBzZWxlY3RlZEFwcElkXCIgY2xhc3M9XCJhcHAtc2VsZWN0ZWQtaWNvblwiPlxyXG4gICAgICAgICAgICAgICAgICA8THVjaWRlSWNvbiBuYW1lPVwiZmEtY2hlY2tcIiA6c2l6ZT1cIjE0XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFwcC1wbGF5LWljb25cIj5cclxuICAgICAgICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXBsYXlcIiA6c2l6ZT1cIjIwXCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICAgIDwhLS0gRmxvYXRpbmcgU3RyZWFtIFByZXZpZXcgLS0+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cInN0cmVhbS1wcmV2aWV3XCJcclxuICAgICAgICA6Y2xhc3M9XCJ7IGV4cGFuZGVkOiBpc0Z1bGxzY3JlZW4sIG1pbmltaXplZDogc3RyZWFtTWluaW1pemVkICYmICFpc0Z1bGxzY3JlZW4gfVwiXHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlldy1oZWFkZXJcIiB2LWlmPVwiIWlzRnVsbHNjcmVlblwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXctdGl0bGVcIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXR2XCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgIDxzcGFuPlN0cmVhbTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gdi1pZj1cImlzQ29ubmVjdGVkXCIgY2xhc3M9XCJsaXZlLWluZGljYXRvclwiPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGl2ZS1kb3RcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgTElWRVxyXG4gICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3LWNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICBAY2xpY2s9XCJzdHJlYW1NaW5pbWl6ZWQgPSAhc3RyZWFtTWluaW1pemVkXCJcclxuICAgICAgICAgICAgICBjbGFzcz1cImNvbnRyb2wtYnRuXCJcclxuICAgICAgICAgICAgICB2LWlmPVwiIWlzRnVsbHNjcmVlblwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cInN0cmVhbU1pbmltaXplZCA/ICdmYS1jaGV2cm9uLXVwJyA6ICdmYS1jaGV2cm9uLWRvd24nXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIEBjbGljaz1cInRvZ2dsZUZ1bGxzY3JlZW5cIiBjbGFzcz1cImNvbnRyb2wtYnRuXCI+XHJcbiAgICAgICAgICAgICAgPEx1Y2lkZUljb24gOm5hbWU9XCJpc0Z1bGxzY3JlZW4gPyAnZmEtY29tcHJlc3MnIDogJ2ZhLWV4cGFuZCdcIiA6c2l6ZT1cIjE2XCIgLz5cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgcmVmPVwiaW5wdXRUYXJnZXRcIlxyXG4gICAgICAgICAgY2xhc3M9XCJzdHJlYW0tdmlld3BvcnRcIlxyXG4gICAgICAgICAgOmNsYXNzPVwieyAnZnVsbHNjcmVlbi1tb2RlJzogaXNGdWxsc2NyZWVuIH1cIlxyXG4gICAgICAgICAgOnN0eWxlPVwiIWlzRnVsbHNjcmVlbiA/IHsgYXNwZWN0UmF0aW86IGAke2NvbmZpZy53aWR0aH0gLyAke2NvbmZpZy5oZWlnaHR9YCB9IDogdW5kZWZpbmVkXCJcclxuICAgICAgICAgIHRhYmluZGV4PVwiMFwiXHJcbiAgICAgICAgICBAZGJsY2xpY2s9XCJvbkZ1bGxzY3JlZW5EYmxDbGlja1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPHZpZGVvXHJcbiAgICAgICAgICAgIHJlZj1cInZpZGVvRWxcIlxyXG4gICAgICAgICAgICBjbGFzcz1cInN0cmVhbS12aWRlb1wiXHJcbiAgICAgICAgICAgIGF1dG9wbGF5XHJcbiAgICAgICAgICAgIHBsYXlzaW5saW5lXHJcbiAgICAgICAgICAgIDpjb250cm9scz1cImZhbHNlXCJcclxuICAgICAgICAgICAgZGlzYWJsZVBpY3R1cmVJblBpY3R1cmVcclxuICAgICAgICAgID48L3ZpZGVvPlxyXG4gICAgICAgICAgPGF1ZGlvIHJlZj1cImF1ZGlvRWxcIiBjbGFzcz1cImhpZGRlblwiIGF1dG9wbGF5IHBsYXlzaW5saW5lPjwvYXVkaW8+XHJcblxyXG4gICAgICAgICAgPCEtLSBJZGxlIFN0YXRlIC0tPlxyXG4gICAgICAgICAgPGRpdiB2LWlmPVwiIWlzQ29ubmVjdGVkICYmICFpc0Nvbm5lY3RpbmdcIiBjbGFzcz1cImlkbGUtc3RhdGVcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlkbGUtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpZGxlLWljb24td3JhcFwiPlxyXG4gICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwic2VsZWN0ZWRBcHBJZFwiIGNsYXNzPVwiaWRsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgYXJpYS1oaWRkZW4+XHJcbiAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBvcGFjaXR5PVwiMC41XCIvPlxyXG4gICAgICAgICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9XCIxMCw4IDE4LDEyIDEwLDE2XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIG9wYWNpdHk9XCIwLjlcIi8+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgIDxzdmcgdi1lbHNlIGNsYXNzPVwiaWRsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgYXJpYS1oaWRkZW4+XHJcbiAgICAgICAgICAgICAgICAgIDxyZWN0IHg9XCIyXCIgeT1cIjRcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMTRcIiByeD1cIjNcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBvcGFjaXR5PVwiMC43XCIvPlxyXG4gICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTggMjJoOE0xMiAxOHY0XCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIG9wYWNpdHk9XCIwLjVcIi8+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8cD5cclxuICAgICAgICAgICAgICAgIHt7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQXBwSWQgPyAkdCgnd2VicnRjLmlkbGVfZ2FtZV9zZWxlY3RlZCcpIDogJHQoJ3dlYnJ0Yy5pZGxlX25vX3NlbGVjdGlvbicpXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIENvbm5lY3RpbmcgU3RhdGUgLS0+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzaG93U3RhcnRpbmdPdmVybGF5XCIgY2xhc3M9XCJjb25uZWN0aW5nLXN0YXRlXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDxzcGFuPkNvbm5lY3RpbmcuLi48L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIFN0YXRzIE92ZXJsYXkgLS0+XHJcbiAgICAgICAgICA8ZGl2IHYtaWY9XCJzaG93T3ZlcmxheSAmJiBpc0Nvbm5lY3RlZFwiIGNsYXNzPVwic3RhdHMtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICA8ZGl2IHYtZm9yPVwiKGxpbmUsIGlkeCkgaW4gb3ZlcmxheUxpbmVzXCIgOmtleT1cImlkeFwiIGNsYXNzPVwic3RhdC1saW5lXCI+e3sgbGluZSB9fTwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPCEtLSBOb3RpZmljYXRpb24gLS0+XHJcbiAgICAgICAgICA8VHJhbnNpdGlvbiBuYW1lPVwibm90aWZpY2F0aW9uLWZhZGVcIj5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgIHYtaWY9XCJhY3RpdmVOb3RpZmljYXRpb25cIlxyXG4gICAgICAgICAgICAgIGNsYXNzPVwibm90aWZpY2F0aW9uLXRvYXN0XCJcclxuICAgICAgICAgICAgICA6Y2xhc3M9XCJhY3RpdmVOb3RpZmljYXRpb24udHlwZVwiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cIm5vdGlmaWNhdGlvbkljb25cIiA6c2l6ZT1cIjE2XCIgLz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uLXRleHRcIj5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e3sgYWN0aXZlTm90aWZpY2F0aW9uLnRpdGxlIH19PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiB2LWlmPVwiYWN0aXZlTm90aWZpY2F0aW9uLm1lc3NhZ2VcIj57eyBhY3RpdmVOb3RpZmljYXRpb24ubWVzc2FnZSB9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIEBjbGljaz1cImRpc21pc3NOb3RpZmljYXRpb25cIj48THVjaWRlSWNvbiBuYW1lPVwiZmEtdGltZXNcIiA6c2l6ZT1cIjE2XCIgLz48L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L1RyYW5zaXRpb24+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDwhLS0gUXVpY2sgQWN0aW9ucyBCYXIgLS0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInF1aWNrLWFjdGlvbnNcIiB2LWlmPVwiIWlzRnVsbHNjcmVlbiAmJiAhc3RyZWFtTWluaW1pemVkXCI+XHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIEBjbGljaz1cImlzQ29ubmVjdGVkID8gZGlzY29ubmVjdCgpIDogY29ubmVjdCgpXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJhY3Rpb24tYnRuIHByaW1hcnlcIlxyXG4gICAgICAgICAgICA6Y2xhc3M9XCJ7IGNvbm5lY3RlZDogaXNDb25uZWN0ZWQsIGNvbm5lY3Rpbmc6IGlzQ29ubmVjdGluZyB9XCJcclxuICAgICAgICAgICAgOmRpc2FibGVkPVwiaXNDb25uZWN0aW5nXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb25cclxuICAgICAgICAgICAgICA6bmFtZT1cImlzQ29ubmVjdGVkID8gJ2ZhLXN0b3AnIDogaXNDb25uZWN0aW5nID8gJ2ZhLWNpcmNsZS1ub3RjaCcgOiAnZmEtcGxheSdcIlxyXG4gICAgICAgICAgICAgIDpjbGFzcz1cImlzQ29ubmVjdGluZyA/ICdhbmltYXRlLXNwaW4nIDogJydcIlxyXG4gICAgICAgICAgICAgIDpzaXplPVwiMThcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8c3Bhbj57eyAkdChjb25uZWN0TGFiZWxLZXkpIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICB2LWlmPVwiaXNDb25uZWN0ZWRcIlxyXG4gICAgICAgICAgICBAY2xpY2s9XCJ0ZXJtaW5hdGVTZXNzaW9uXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJhY3Rpb24tYnRuIGRhbmdlclwiXHJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cInRlcm1pbmF0ZVBlbmRpbmdcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8THVjaWRlSWNvbiA6bmFtZT1cInRlcm1pbmF0ZVBlbmRpbmcgPyAnZmEtY2lyY2xlLW5vdGNoJyA6ICdmYS1wb3dlci1vZmYnXCIgOmNsYXNzPVwidGVybWluYXRlUGVuZGluZyA/ICdhbmltYXRlLXNwaW4nIDogJydcIiA6c2l6ZT1cIjE4XCIgLz5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJxdWljay10b2dnbGVzXCI+XHJcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRvZ2dsZVwiIHRpdGxlPVwiRW5hYmxlIGlucHV0IGZvcndhcmRpbmdcIj5cclxuICAgICAgICAgICAgICA8bi1zd2l0Y2ggdi1tb2RlbDp2YWx1ZT1cImlucHV0RW5hYmxlZFwiIDpkaXNhYmxlZD1cIiFpc0Nvbm5lY3RlZFwiIHNpemU9XCJzbWFsbFwiIC8+XHJcbiAgICAgICAgICAgICAgPHNwYW4+SW5wdXQ8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRvZ2dsZVwiIHRpdGxlPVwiU2hvdyBwZXJmb3JtYW5jZSBvdmVybGF5XCI+XHJcbiAgICAgICAgICAgICAgPG4tc3dpdGNoIHYtbW9kZWw6dmFsdWU9XCJzaG93T3ZlcmxheVwiIHNpemU9XCJzbWFsbFwiIC8+XHJcbiAgICAgICAgICAgICAgPHNwYW4+U3RhdHM8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPCEtLSBDb21wYWN0IE1ldHJpY3MgLS0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbXBhY3QtbWV0cmljc1wiIHYtaWY9XCJpc0Nvbm5lY3RlZCAmJiAhaXNGdWxsc2NyZWVuICYmICFzdHJlYW1NaW5pbWl6ZWRcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXRyaWNcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPkJpdHJhdGU8L3NwYW5cclxuICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidmFsdWVcIj57eyBmb3JtYXRLYnBzKHN0YXRzLnZpZGVvQml0cmF0ZUticHMpIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWV0cmljXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj5MYXRlbmN5PC9zcGFuXHJcbiAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInZhbHVlXCI+e3sgZm9ybWF0TXMoc21vb3RoZWRMYXRlbmN5TXMpIH19PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWV0cmljXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj5GUFM8L3NwYW5cclxuICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidmFsdWVcIj57eyBkaXNwbGF5VmlkZW9GcHMgPyBkaXNwbGF5VmlkZW9GcHMudG9GaXhlZCgwKSA6ICctLScgfX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXRyaWNcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPkRyb3BwZWQ8L3NwYW5cclxuICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidmFsdWVcIj57eyBzdGF0cy52aWRlb0ZyYW1lc0Ryb3BwZWQgPz8gJy0tJyB9fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDwhLS0gU2V0dGluZ3MgU2xpZGVvdXQgLS0+XHJcbiAgICA8VHJhbnNpdGlvbiBuYW1lPVwic2xpZGVvdXRcIj5cclxuICAgICAgPGFzaWRlIHYtaWY9XCJzaG93U2V0dGluZ3NcIiBjbGFzcz1cInNldHRpbmdzLWRyYXdlclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJkcmF3ZXItaGVhZGVyXCI+XHJcbiAgICAgICAgICA8aDI+PEx1Y2lkZUljb24gbmFtZT1cImZhLXNsaWRlcnMtaFwiIDpzaXplPVwiMThcIiAvPiB7eyAkdCgnd2VicnRjLnNlc3Npb25fc2V0dGluZ3MnKSB9fTwvaDI+XHJcbiAgICAgICAgICA8YnV0dG9uIEBjbGljaz1cInNob3dTZXR0aW5ncyA9IGZhbHNlXCIgY2xhc3M9XCJjbG9zZS1idG5cIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLXRpbWVzXCIgOnNpemU9XCIxNlwiIC8+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImRyYXdlci1jb250ZW50XCI+XHJcbiAgICAgICAgICA8IS0tIFJlc29sdXRpb24gLS0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1ncm91cFwiPlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJncm91cC1sYWJlbFwiPnt7ICR0KCd3ZWJydGMucmVzb2x1dGlvbicpIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc29sdXRpb24taW5wdXRzXCI+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyIHYtbW9kZWw6dmFsdWU9XCJjb25maWcud2lkdGhcIiA6bWluPVwiMzIwXCIgOm1heD1cIjc2ODBcIiBzaXplPVwic21hbGxcIiAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic2VwYXJhdG9yXCI+w5c8L3NwYW4+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyIHYtbW9kZWw6dmFsdWU9XCJjb25maWcuaGVpZ2h0XCIgOm1pbj1cIjE4MFwiIDptYXg9XCI0MzIwXCIgc2l6ZT1cInNtYWxsXCIgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmVzZXQtY2hpcHNcIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZXRSZXNvbHV0aW9uKDE5MjAsIDEwODApXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLndpZHRoID09PSAxOTIwICYmIGNvbmZpZy5oZWlnaHQgPT09IDEwODAgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgMTA4MHBcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZXRSZXNvbHV0aW9uKDI1NjAsIDE0NDApXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLndpZHRoID09PSAyNTYwICYmIGNvbmZpZy5oZWlnaHQgPT09IDE0NDAgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgMTQ0MHBcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJzZXRSZXNvbHV0aW9uKDM4NDAsIDIxNjApXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLndpZHRoID09PSAzODQwICYmIGNvbmZpZy5oZWlnaHQgPT09IDIxNjAgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgNEtcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEZyYW1lIFJhdGUgLS0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1ncm91cFwiPlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJncm91cC1sYWJlbFwiPnt7ICR0KCd3ZWJydGMuZnJhbWVyYXRlJykgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJlc2V0LWNoaXBzXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9XCJjb25maWcuZnBzID0gMzBcIiBjbGFzcz1cImNoaXBcIiA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLmZwcyA9PT0gMzAgfVwiPlxyXG4gICAgICAgICAgICAgICAgMzBcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIEBjbGljaz1cImNvbmZpZy5mcHMgPSA2MFwiIGNsYXNzPVwiY2hpcFwiIDpjbGFzcz1cInsgYWN0aXZlOiBjb25maWcuZnBzID09PSA2MCB9XCI+XHJcbiAgICAgICAgICAgICAgICA2MFxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIEBjbGljaz1cImNvbmZpZy5mcHMgPSAxMjBcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJjaGlwXCJcclxuICAgICAgICAgICAgICAgIDpjbGFzcz1cInsgYWN0aXZlOiBjb25maWcuZnBzID09PSAxMjAgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgMTIwXHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiY29uZmlnLmZwcyA9IDE0NFwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cImNoaXBcIlxyXG4gICAgICAgICAgICAgICAgOmNsYXNzPVwieyBhY3RpdmU6IGNvbmZpZy5mcHMgPT09IDE0NCB9XCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAxNDRcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEVuY29kaW5nIC0tPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctZ3JvdXBcIj5cclxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZ3JvdXAtbGFiZWxcIj57eyAkdCgnd2VicnRjLmVuY29kaW5nJykgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJlc2V0LWNoaXBzXCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgdi1mb3I9XCJvcHQgaW4gZW5jb2RpbmdPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIDprZXk9XCJvcHQudmFsdWVcIlxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiY29uZmlnLmVuY29kaW5nID0gb3B0LnZhbHVlXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLmVuY29kaW5nID09PSBvcHQudmFsdWUsIHVuc3VwcG9ydGVkOiAhb3B0LnN1cHBvcnRlZCB9XCJcclxuICAgICAgICAgICAgICAgIHYtYmluZD1cIiFvcHQuc3VwcG9ydGVkICYmIG9wdC5oaW50ID8geyB0aXRsZTogb3B0LmhpbnQgfSA6IHt9XCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7eyBvcHQubGFiZWwgfX1cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEJpdHJhdGUgLS0+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1ncm91cFwiPlxyXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJncm91cC1sYWJlbFwiPnt7ICR0KCd3ZWJydGMuYml0cmF0ZScpIH19PC9sYWJlbD5cclxuICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgICAgOnZhbHVlPVwiY29uZmlnLmJpdHJhdGVLYnBzID8/IG51bGxcIlxyXG4gICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCIodikgPT4geyBpZiAodiAhPT0gbnVsbCkgY29uZmlnLmJpdHJhdGVLYnBzID0gdjsgZWxzZSBkZWxldGUgKGNvbmZpZyBhcyBhbnkpLmJpdHJhdGVLYnBzIH1cIlxyXG4gICAgICAgICAgICAgIDptaW49XCI1MDBcIlxyXG4gICAgICAgICAgICAgIDptYXg9XCIyMDAwMDBcIlxyXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCJmdWxsLXdpZHRoXCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXNldC1jaGlwc1wiPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIEBjbGljaz1cImNvbmZpZy5iaXRyYXRlS2JwcyA9IDEwMDAwXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLmJpdHJhdGVLYnBzID09PSAxMDAwMCB9XCJcclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAxMCBNYnBzXHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgQGNsaWNrPVwiY29uZmlnLmJpdHJhdGVLYnBzID0gMzAwMDBcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJjaGlwXCJcclxuICAgICAgICAgICAgICAgIDpjbGFzcz1cInsgYWN0aXZlOiBjb25maWcuYml0cmF0ZUticHMgPT09IDMwMDAwIH1cIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDMwIE1icHNcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJjb25maWcuYml0cmF0ZUticHMgPSA2MDAwMFwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cImNoaXBcIlxyXG4gICAgICAgICAgICAgICAgOmNsYXNzPVwieyBhY3RpdmU6IGNvbmZpZy5iaXRyYXRlS2JwcyA9PT0gNjAwMDAgfVwiXHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgNjAgTWJwc1xyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDwhLS0gSERSIFRvZ2dsZSAtLT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLWdyb3VwIHRvZ2dsZS1zZXR0aW5nXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGUtaW5mb1wiPlxyXG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImdyb3VwLWxhYmVsXCI+e3sgJHQoJ3dlYnJ0Yy5oZHInKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJoaW50XCI+e3sgJHQoJ3dlYnJ0Yy5oZHJfZGVzYycpIH19PC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPG4tc3dpdGNoIHYtbW9kZWw6dmFsdWU9XCJjb25maWcuaGRyXCIgLz5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPG4tYWxlcnQgdi1pZj1cImhkcklubGluZVdhcm5pbmdcIiB0eXBlPVwid2FybmluZ1wiIDpzaG93LWljb249XCJ0cnVlXCIgY2xhc3M9XCJzZXR0aW5nLWFsZXJ0XCI+XHJcbiAgICAgICAgICAgIHt7IGhkcklubGluZVdhcm5pbmcgfX1cclxuICAgICAgICAgIDwvbi1hbGVydD5cclxuXHJcbiAgICAgICAgICA8IS0tIE11dGUgSG9zdCBBdWRpbyAtLT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLWdyb3VwIHRvZ2dsZS1zZXR0aW5nXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGUtaW5mb1wiPlxyXG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImdyb3VwLWxhYmVsXCI+e3sgJHQoJ3dlYnJ0Yy5tdXRlX2hvc3RfYXVkaW8nKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJoaW50XCI+e3sgJHQoJ3dlYnJ0Yy5tdXRlX2hvc3RfYXVkaW9fZGVzYycpIH19PC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPG4tc3dpdGNoIHYtbW9kZWw6dmFsdWU9XCJjb25maWcubXV0ZUhvc3RBdWRpb1wiIC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEZyYW1lIFBhY2luZyAtLT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLWdyb3VwXCI+XHJcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImdyb3VwLWxhYmVsXCI+e3sgJHQoJ3dlYnJ0Yy5mcmFtZV9wYWNpbmcnKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzPVwiaGludFwiPnt7ICR0KCd3ZWJydGMuZnJhbWVfcGFjaW5nX2Rlc2MnKSB9fTwvcD5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXNldC1jaGlwc1wiPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIHYtZm9yPVwib3B0IGluIHBhY2luZ09wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgOmtleT1cIm9wdC52YWx1ZVwiXHJcbiAgICAgICAgICAgICAgICBAY2xpY2s9XCJhcHBseVBhY2luZ1ByZXNldChvcHQudmFsdWUpXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hpcFwiXHJcbiAgICAgICAgICAgICAgICA6Y2xhc3M9XCJ7IGFjdGl2ZTogY29uZmlnLnZpZGVvUGFjaW5nTW9kZSA9PT0gb3B0LnZhbHVlIH1cIlxyXG4gICAgICAgICAgICAgICAgOmRpc2FibGVkPVwiaXNDb25uZWN0ZWRcIlxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt7IG9wdC5sYWJlbCB9fVxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJncm91cC1sYWJlbFwiPnt7ICR0KCd3ZWJydGMuZnJhbWVfcGFjaW5nX3NsYWNrJykgfX08L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxuLWlucHV0LW51bWJlclxyXG4gICAgICAgICAgICAgICAgOnZhbHVlPVwiY29uZmlnLnZpZGVvUGFjaW5nU2xhY2tNcyA/PyBudWxsXCJcclxuICAgICAgICAgICAgICAgIEB1cGRhdGU6dmFsdWU9XCIodikgPT4geyBpZiAodiAhPT0gbnVsbCkgY29uZmlnLnZpZGVvUGFjaW5nU2xhY2tNcyA9IHY7IGVsc2UgZGVsZXRlIChjb25maWcgYXMgYW55KS52aWRlb1BhY2luZ1NsYWNrTXMgfVwiXHJcbiAgICAgICAgICAgICAgICA6bWluPVwiMFwiXHJcbiAgICAgICAgICAgICAgICA6bWF4PVwiMTBcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiZnVsbC13aWR0aFwiXHJcbiAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJpc0Nvbm5lY3RlZFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZ3JvdXAtbGFiZWxcIj57eyAkdCgnd2VicnRjLmZyYW1lX3BhY2luZ19tYXhfZGVsYXknKSB9fTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPG4taW5wdXQtbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB2LW1vZGVsOnZhbHVlPVwibWF4RnJhbWVBZ2VGcmFtZXNcIlxyXG4gICAgICAgICAgICAgICAgOm1pbj1cIjFcIlxyXG4gICAgICAgICAgICAgICAgOm1heD1cIm1heEFsbG93ZWRGcmFtZXNGb3JGcHMoY29uZmlnLmZwcylcIlxyXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiZnVsbC13aWR0aFwiXHJcbiAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJpc0Nvbm5lY3RlZFwiXHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8IS0tIEFkdmFuY2VkIE9wdGlvbnMgLS0+XHJcbiAgICAgICAgICA8ZGV0YWlscyBjbGFzcz1cImFkdmFuY2VkLXNlY3Rpb25cIj5cclxuICAgICAgICAgICAgPHN1bW1hcnk+PEx1Y2lkZUljb24gbmFtZT1cImZhLWNvZ3NcIiA6c2l6ZT1cIjE0XCIgY2xhc3M9XCJpbmxpbmUtYmxvY2sgbXItMVwiIC8+IEFkdmFuY2VkIE9wdGlvbnM8L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZHZhbmNlZC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctZ3JvdXAgdG9nZ2xlLXNldHRpbmdcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGUtaW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJncm91cC1sYWJlbFwiPkF1dG8gRnVsbHNjcmVlbjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiaGludFwiPkVudGVyIGZ1bGxzY3JlZW4gd2hlbiBzdHJlYW0gc3RhcnRzPC9wPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8bi1zd2l0Y2ggdi1tb2RlbDp2YWx1ZT1cImF1dG9GdWxsc2NyZWVuXCIgc2l6ZT1cInNtYWxsXCIgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2RldGFpbHM+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDwhLS0gRHJhd2VyIEZvb3RlciAtLT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZHJhd2VyLWZvb3RlclwiPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJub3RpY2VcIj5cclxuICAgICAgICAgICAgPEx1Y2lkZUljb24gbmFtZT1cImZhLWluZm8tY2lyY2xlXCIgOnNpemU9XCIxNFwiIGNsYXNzPVwiaW5saW5lLWJsb2NrIG1yLTFcIiAvPlxyXG4gICAgICAgICAgICB7eyAkdCgnd2VicnRjLmV4cGVyaW1lbnRhbF9ub3RpY2UnKSB9fVxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2FzaWRlPlxyXG4gICAgPC9UcmFuc2l0aW9uPlxyXG5cclxuICAgIDwhLS0gQmFja2Ryb3AgZm9yIHNldHRpbmdzIC0tPlxyXG4gICAgPFRyYW5zaXRpb24gbmFtZT1cImZhZGVcIj5cclxuICAgICAgPGRpdiB2LWlmPVwic2hvd1NldHRpbmdzXCIgY2xhc3M9XCJkcmF3ZXItYmFja2Ryb3BcIiBAY2xpY2s9XCJzaG93U2V0dGluZ3MgPSBmYWxzZVwiPjwvZGl2PlxyXG4gICAgPC9UcmFuc2l0aW9uPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IHsgcmVmLCByZWFjdGl2ZSwgb25CZWZvcmVVbm1vdW50LCBvbk1vdW50ZWQsIHdhdGNoLCBjb21wdXRlZCwgbmV4dFRpY2sgfSBmcm9tICd2dWUnO1xyXG5pbXBvcnQgeyB1c2VJMThuIH0gZnJvbSAndnVlLWkxOG4nO1xyXG5pbXBvcnQgeyBOVGFnLCBOU3dpdGNoLCBOSW5wdXROdW1iZXIsIE5BbGVydCwgdXNlRGlhbG9nLCB1c2VNZXNzYWdlIH0gZnJvbSAnbmFpdmUtdWknO1xyXG5pbXBvcnQgeyBXZWJSdGNIdHRwQXBpIH0gZnJvbSAnQC9zZXJ2aWNlcy93ZWJydGNBcGknO1xyXG5pbXBvcnQgeyBXZWJSdGNDbGllbnQgfSBmcm9tICdAL3V0aWxzL3dlYnJ0Yy9jbGllbnQnO1xyXG5pbXBvcnQge1xyXG4gIGFwcGx5R2FtZXBhZEZlZWRiYWNrLFxyXG4gIGF0dGFjaElucHV0Q2FwdHVyZSxcclxuICB0eXBlIElucHV0Q2FwdHVyZU1ldHJpY3MsXHJcbiAgcmVsZWFzZUtleWJvYXJkTG9jayxcclxuICByZXF1ZXN0S2V5Ym9hcmRMb2NrLFxyXG59IGZyb20gJ0AvdXRpbHMvd2VicnRjL2lucHV0JztcclxuaW1wb3J0IHtcclxuICBFbmNvZGluZ1R5cGUsXHJcbiAgSW5wdXRNZXNzYWdlLFxyXG4gIFN0cmVhbUNvbmZpZyxcclxuICBXZWJSdGNTZXNzaW9uU3RhdGUsXHJcbiAgV2ViUnRjU3RhdHNTbmFwc2hvdCxcclxufSBmcm9tICdAL3R5cGVzL3dlYnJ0Yyc7XHJcbmltcG9ydCB7IGh0dHAgfSBmcm9tICdAL2h0dHAnO1xyXG5pbXBvcnQgeyB1c2VBcHBzU3RvcmUgfSBmcm9tICdAL3N0b3Jlcy9hcHBzJztcclxuaW1wb3J0IHsgc3RvcmVUb1JlZnMgfSBmcm9tICdwaW5pYSc7XHJcbmltcG9ydCB0eXBlIHsgQXBwIH0gZnJvbSAnQC9zdG9yZXMvYXBwcyc7XHJcbmltcG9ydCBMdWNpZGVJY29uIGZyb20gJ0AvY29tcG9uZW50cy9MdWNpZGVJY29uLnZ1ZSc7XHJcblxyXG5jb25zdCB7IHQgfSA9IHVzZUkxOG4oKTtcclxuY29uc3QgZGlhbG9nID0gdXNlRGlhbG9nKCk7XHJcbmNvbnN0IG1lc3NhZ2UgPSB1c2VNZXNzYWdlKCk7XHJcblxyXG4vLyBVSSBTdGF0ZVxyXG5jb25zdCBzaG93U2V0dGluZ3MgPSByZWYoZmFsc2UpO1xyXG5jb25zdCBzdHJlYW1NaW5pbWl6ZWQgPSByZWYoZmFsc2UpO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gTk9USUZJQ0FUSU9OIFNZU1RFTVxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG50eXBlIE5vdGlmaWNhdGlvblR5cGUgPSAnZXJyb3InIHwgJ3dhcm5pbmcnIHwgJ3N1Y2Nlc3MnIHwgJ2luZm8nO1xyXG5cclxuaW50ZXJmYWNlIE5vdGlmaWNhdGlvbiB7XHJcbiAgaWQ6IG51bWJlcjtcclxuICB0eXBlOiBOb3RpZmljYXRpb25UeXBlO1xyXG4gIHRpdGxlOiBzdHJpbmc7XHJcbiAgbWVzc2FnZT86IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgYWN0aXZlTm90aWZpY2F0aW9uID0gcmVmPE5vdGlmaWNhdGlvbiB8IG51bGw+KG51bGwpO1xyXG5sZXQgbm90aWZpY2F0aW9uSWQgPSAwO1xyXG5sZXQgbm90aWZpY2F0aW9uVGltZW91dDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG5jb25zdCBub3RpZmljYXRpb25JY29uID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghYWN0aXZlTm90aWZpY2F0aW9uLnZhbHVlKSByZXR1cm4gJ2ZhLWluZm8tY2lyY2xlJztcclxuICBzd2l0Y2ggKGFjdGl2ZU5vdGlmaWNhdGlvbi52YWx1ZS50eXBlKSB7XHJcbiAgICBjYXNlICdlcnJvcic6XHJcbiAgICAgIHJldHVybiAnZmEtY2lyY2xlLWV4Y2xhbWF0aW9uJztcclxuICAgIGNhc2UgJ3dhcm5pbmcnOlxyXG4gICAgICByZXR1cm4gJ2ZhLXRyaWFuZ2xlLWV4Y2xhbWF0aW9uJztcclxuICAgIGNhc2UgJ3N1Y2Nlc3MnOlxyXG4gICAgICByZXR1cm4gJ2ZhLWNpcmNsZS1jaGVjayc7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gJ2ZhLWNpcmNsZS1pbmZvJztcclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gc2hvd05vdGlmaWNhdGlvbih0eXBlOiBOb3RpZmljYXRpb25UeXBlLCB0aXRsZTogc3RyaW5nLCBtc2c/OiBzdHJpbmcsIGR1cmF0aW9uID0gNTAwMCkge1xyXG4gIGlmIChub3RpZmljYXRpb25UaW1lb3V0KSB7XHJcbiAgICBjbGVhclRpbWVvdXQobm90aWZpY2F0aW9uVGltZW91dCk7XHJcbiAgICBub3RpZmljYXRpb25UaW1lb3V0ID0gbnVsbDtcclxuICB9XHJcbiAgbm90aWZpY2F0aW9uSWQrKztcclxuICBhY3RpdmVOb3RpZmljYXRpb24udmFsdWUgPSB7IGlkOiBub3RpZmljYXRpb25JZCwgdHlwZSwgdGl0bGUsIC4uLihtc2cgIT09IHVuZGVmaW5lZCA/IHsgbWVzc2FnZTogbXNnIH0gOiB7fSkgfTtcclxuICBpZiAoZHVyYXRpb24gPiAwKSB7XHJcbiAgICBub3RpZmljYXRpb25UaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gZGlzbWlzc05vdGlmaWNhdGlvbigpLCBkdXJhdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNtaXNzTm90aWZpY2F0aW9uKCkge1xyXG4gIGFjdGl2ZU5vdGlmaWNhdGlvbi52YWx1ZSA9IG51bGw7XHJcbiAgaWYgKG5vdGlmaWNhdGlvblRpbWVvdXQpIHtcclxuICAgIGNsZWFyVGltZW91dChub3RpZmljYXRpb25UaW1lb3V0KTtcclxuICAgIG5vdGlmaWNhdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gbm90aWZ5RXJyb3IodGl0bGU6IHN0cmluZywgbXNnPzogc3RyaW5nKSB7XHJcbiAgc2hvd05vdGlmaWNhdGlvbignZXJyb3InLCB0aXRsZSwgbXNnLCA4MDAwKTtcclxufVxyXG5mdW5jdGlvbiBub3RpZnlXYXJuaW5nKHRpdGxlOiBzdHJpbmcsIG1zZz86IHN0cmluZykge1xyXG4gIHNob3dOb3RpZmljYXRpb24oJ3dhcm5pbmcnLCB0aXRsZSwgbXNnLCA2MDAwKTtcclxufVxyXG5mdW5jdGlvbiBub3RpZnlTdWNjZXNzKHRpdGxlOiBzdHJpbmcsIG1zZz86IHN0cmluZykge1xyXG4gIHNob3dOb3RpZmljYXRpb24oJ3N1Y2Nlc3MnLCB0aXRsZSwgbXNnLCA0MDAwKTtcclxufVxyXG5mdW5jdGlvbiBub3RpZnlJbmZvKHRpdGxlOiBzdHJpbmcsIG1zZz86IHN0cmluZykge1xyXG4gIHNob3dOb3RpZmljYXRpb24oJ2luZm8nLCB0aXRsZSwgbXNnLCA1MDAwKTtcclxufVxyXG5cclxuLy8gSGVscGVyIGZ1bmN0aW9uIGZvciByZXNvbHV0aW9uIHByZXNldHNcclxuZnVuY3Rpb24gc2V0UmVzb2x1dGlvbih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG4gIGNvbmZpZy53aWR0aCA9IHdpZHRoO1xyXG4gIGNvbmZpZy5oZWlnaHQgPSBoZWlnaHQ7XHJcbn1cclxuXHJcbi8vIENvbm5lY3Rpb24gc3RhdHVzIGNvbXB1dGVkIHByb3BlcnRpZXNcclxuY29uc3QgY29ubmVjdGlvblBpbGxDbGFzcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoaXNDb25uZWN0ZWQudmFsdWUpIHJldHVybiAnY29ubmVjdGVkJztcclxuICBpZiAoaXNDb25uZWN0aW5nLnZhbHVlKSByZXR1cm4gJ2Nvbm5lY3RpbmcnO1xyXG4gIHJldHVybiAnaWRsZSc7XHJcbn0pO1xyXG5cclxuY29uc3QgY29ubmVjdGlvblN0YXR1c0xhYmVsID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChpc0Nvbm5lY3RlZC52YWx1ZSkgcmV0dXJuICdDb25uZWN0ZWQnO1xyXG4gIGlmIChpc0Nvbm5lY3RpbmcudmFsdWUpIHJldHVybiAnQ29ubmVjdGluZy4uLic7XHJcbiAgcmV0dXJuICdSZWFkeSc7XHJcbn0pO1xyXG5cclxudHlwZSBFbmNvZGluZ09wdGlvbiA9IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IEVuY29kaW5nVHlwZSB9O1xyXG5cclxuY29uc3QgYmFzZUVuY29kaW5nT3B0aW9uczogRW5jb2RpbmdPcHRpb25bXSA9IFtcclxuICB7IGxhYmVsOiAnSC4yNjQnLCB2YWx1ZTogJ2gyNjQnIH0sXHJcbiAgeyBsYWJlbDogJ0hFVkMnLCB2YWx1ZTogJ2hldmMnIH0sXHJcbiAgeyBsYWJlbDogJ0FWMScsIHZhbHVlOiAnYXYxJyB9LFxyXG5dO1xyXG5cclxuY29uc3QgZW5jb2RpbmdNaW1lczogUmVjb3JkPEVuY29kaW5nVHlwZSwgc3RyaW5nW10+ID0ge1xyXG4gIGgyNjQ6IFsndmlkZW8vaDI2NCddLFxyXG4gIGhldmM6IFsndmlkZW8vaDI2NScsICd2aWRlby9oZXZjJ10sXHJcbiAgYXYxOiBbJ3ZpZGVvL2F2MSddLFxyXG59O1xyXG5cclxuZnVuY3Rpb24gZGV0ZWN0RW5jb2RpbmdTdXBwb3J0KCk6IFJlY29yZDxFbmNvZGluZ1R5cGUsIGJvb2xlYW4+IHtcclxuICBjb25zdCBzdXBwb3J0OiBSZWNvcmQ8RW5jb2RpbmdUeXBlLCBib29sZWFuPiA9IHsgaDI2NDogdHJ1ZSwgaGV2YzogdHJ1ZSwgYXYxOiB0cnVlIH07XHJcbiAgY29uc3QgY2FwcyA9XHJcbiAgICAodHlwZW9mIFJUQ1J0cFJlY2VpdmVyICE9PSAndW5kZWZpbmVkJyA/IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcz8uKCd2aWRlbycpIDogbnVsbCkgPz9cclxuICAgICh0eXBlb2YgUlRDUnRwU2VuZGVyICE9PSAndW5kZWZpbmVkJyA/IFJUQ1J0cFNlbmRlci5nZXRDYXBhYmlsaXRpZXM/LigndmlkZW8nKSA6IG51bGwpO1xyXG4gIGlmICghY2Fwcz8uY29kZWNzKSByZXR1cm4gc3VwcG9ydDtcclxuICBjb25zdCBtaW1lVHlwZXMgPSBjYXBzLmNvZGVjcy5tYXAoKGNvZGVjKSA9PiBjb2RlYy5taW1lVHlwZS50b0xvd2VyQ2FzZSgpKTtcclxuICAoT2JqZWN0LmtleXMoZW5jb2RpbmdNaW1lcykgYXMgRW5jb2RpbmdUeXBlW10pLmZvckVhY2goKGVuY29kaW5nKSA9PiB7XHJcbiAgICBzdXBwb3J0W2VuY29kaW5nXSA9IGVuY29kaW5nTWltZXNbZW5jb2RpbmddLnNvbWUoKG1pbWUpID0+IG1pbWVUeXBlcy5pbmNsdWRlcyhtaW1lKSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHN1cHBvcnQ7XHJcbn1cclxuXHJcbmNvbnN0IGVuY29kaW5nU3VwcG9ydCA9IHJlZjxSZWNvcmQ8RW5jb2RpbmdUeXBlLCBib29sZWFuPj4oZGV0ZWN0RW5jb2RpbmdTdXBwb3J0KCkpO1xyXG5cclxuY29uc3QgZW5jb2RpbmdPcHRpb25zID0gY29tcHV0ZWQoKCkgPT5cclxuICBiYXNlRW5jb2RpbmdPcHRpb25zLm1hcCgob3B0KSA9PiB7XHJcbiAgICBjb25zdCBzdXBwb3J0ZWQgPSBvcHQudmFsdWUgPT09ICdhdjEnID8gZW5jb2RpbmdTdXBwb3J0LnZhbHVlW29wdC52YWx1ZV0gOiB0cnVlO1xyXG4gICAgY29uc3QgaGludCA9IHN1cHBvcnRlZCA/ICcnIDogYCR7b3B0LmxhYmVsfSBtYXkgYmUgdW5zdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyLmA7XHJcbiAgICByZXR1cm4geyAuLi5vcHQsIHN1cHBvcnRlZCwgaGludCB9O1xyXG4gIH0pLFxyXG4pO1xyXG5cclxuY29uc3QgcGFjaW5nT3B0aW9ucyA9IFtcclxuICB7IGxhYmVsOiAnTGF0ZW5jeScsIHZhbHVlOiAnbGF0ZW5jeScgfSxcclxuICB7IGxhYmVsOiAnQmFsYW5jZWQnLCB2YWx1ZTogJ2JhbGFuY2VkJyB9LFxyXG4gIHsgbGFiZWw6ICdTbW9vdGgnLCB2YWx1ZTogJ3Ntb290aG5lc3MnIH0sXHJcbl0gYXMgY29uc3Q7XHJcblxyXG50eXBlIFBhY2luZ01vZGUgPSAodHlwZW9mIHBhY2luZ09wdGlvbnMpW251bWJlcl1bJ3ZhbHVlJ107XHJcblxyXG5jb25zdCBwYWNpbmdQcmVzZXRzOiBSZWNvcmQ8UGFjaW5nTW9kZSwgeyBzbGFja01zOiBudW1iZXI7IG1heEFnZUZyYW1lczogbnVtYmVyIH0+ID0ge1xyXG4gIGxhdGVuY3k6IHsgc2xhY2tNczogMCwgbWF4QWdlRnJhbWVzOiAxIH0sXHJcbiAgYmFsYW5jZWQ6IHsgc2xhY2tNczogMiwgbWF4QWdlRnJhbWVzOiAxIH0sXHJcbiAgc21vb3RobmVzczogeyBzbGFja01zOiAzLCBtYXhBZ2VGcmFtZXM6IDMgfSxcclxufTtcclxuXHJcbmNvbnN0IE1JTl9GUkFNRV9BR0VfTVMgPSA1O1xyXG5jb25zdCBNQVhfRlJBTUVfQUdFX01TID0gMTAwO1xyXG5jb25zdCBNQVhfRlJBTUVfQUdFX0ZSQU1FUyA9IDEwO1xyXG5cclxuZnVuY3Rpb24gbWF4QWxsb3dlZEZyYW1lc0ZvckZwcyhmcHM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgY29uc3Qgc2FmZUZwcyA9IGZwcyA+IDAgPyBmcHMgOiA2MDtcclxuICBjb25zdCBtYXhCeU1zID0gTWF0aC5mbG9vcigoTUFYX0ZSQU1FX0FHRV9NUyAqIHNhZmVGcHMpIC8gMTAwMCk7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDEsIE1hdGgubWluKE1BWF9GUkFNRV9BR0VfRlJBTUVTLCBtYXhCeU1zKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wTWF4QWdlRnJhbWVzKFxyXG4gIHZhbHVlOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gIGZwczogbnVtYmVyLFxyXG4gIG1vZGU/OiBQYWNpbmdNb2RlLFxyXG4pOiBudW1iZXIge1xyXG4gIGNvbnN0IHJlc29sdmVkTW9kZSA9IG1vZGUgPz8gJ2JhbGFuY2VkJztcclxuICBjb25zdCBwcmVzZXQgPSBwYWNpbmdQcmVzZXRzW3Jlc29sdmVkTW9kZV0ubWF4QWdlRnJhbWVzO1xyXG4gIGNvbnN0IG1heEFsbG93ZWQgPSBtYXhBbGxvd2VkRnJhbWVzRm9yRnBzKGZwcyk7XHJcbiAgaWYgKHZhbHVlID09IG51bGwgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBNYXRoLm1pbihwcmVzZXQsIG1heEFsbG93ZWQpO1xyXG4gIHJldHVybiBNYXRoLm1pbihtYXhBbGxvd2VkLCBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKHZhbHVlKSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXhGcmFtZUFnZU1zRnJvbUZyYW1lcyhmcHM6IG51bWJlciwgZnJhbWVzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gIGNvbnN0IHNhZmVGcHMgPSBmcHMgPiAwID8gZnBzIDogNjA7XHJcbiAgcmV0dXJuIE1hdGgucm91bmQoKDEwMDAgLyBzYWZlRnBzKSAqIGZyYW1lcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5UGFjaW5nUHJlc2V0KG1vZGU6IFBhY2luZ01vZGUpIHtcclxuICBjb25zdCBwcmVzZXQgPSBwYWNpbmdQcmVzZXRzW21vZGVdO1xyXG4gIGNvbmZpZy52aWRlb1BhY2luZ01vZGUgPSBtb2RlO1xyXG4gIGNvbmZpZy52aWRlb1BhY2luZ1NsYWNrTXMgPSBwcmVzZXQuc2xhY2tNcztcclxuICBkZWxldGUgKGNvbmZpZyBhcyBhbnkpLnZpZGVvTWF4RnJhbWVBZ2VNcztcclxuICBjb25maWcudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA9IGNsYW1wTWF4QWdlRnJhbWVzKHByZXNldC5tYXhBZ2VGcmFtZXMsIGNvbmZpZy5mcHMsIG1vZGUpO1xyXG59XHJcblxyXG5jb25zdCBoZHJDb2RlY0FkdmVydGlzZWQgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKGNvbmZpZy5lbmNvZGluZyA9PT0gJ2F2MScpIHJldHVybiBlbmNvZGluZ1N1cHBvcnQudmFsdWUuYXYxO1xyXG4gIHJldHVybiBlbmNvZGluZ1N1cHBvcnQudmFsdWUuaGV2YztcclxufSk7XHJcblxyXG5jb25zdCBoZHJJbmxpbmVXYXJuaW5nID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghY29uZmlnLmhkcikgcmV0dXJuIG51bGw7XHJcbiAgaWYgKGhkclJ1bnRpbWVXYXJuaW5nLnZhbHVlKSByZXR1cm4gaGRyUnVudGltZVdhcm5pbmcudmFsdWU7XHJcbiAgaWYgKCFoZHJDb2RlY0FkdmVydGlzZWQudmFsdWUpIHtcclxuICAgIHJldHVybiBgVGhpcyBicm93c2VyIHJlcG9ydHMgbm8gJHtjb25maWcuZW5jb2RpbmcudG9VcHBlckNhc2UoKX0gZGVjb2RlIHN1cHBvcnQuIElmIHlvdSBnZXQgYSBibGFjayBzY3JlZW4sIHN3aXRjaCBjb2RlY3Mgb3IgZGlzYWJsZSBIRFIuYDtcclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZW5zdXJlSGRyRW5jb2RpbmcoKTogdm9pZCB7XHJcbiAgaWYgKGNvbmZpZy5lbmNvZGluZyA9PT0gJ2gyNjQnKSBjb25maWcuZW5jb2RpbmcgPSAnaGV2Yyc7XHJcbn1cclxuXHJcbmNvbnN0IGNvbmZpZyA9IHJlYWN0aXZlPFN0cmVhbUNvbmZpZz4oe1xyXG4gIHdpZHRoOiAxOTIwLFxyXG4gIGhlaWdodDogMTA4MCxcclxuICBmcHM6IDYwLFxyXG4gIGVuY29kaW5nOiAnaDI2NCcsXHJcbiAgaGRyOiBmYWxzZSxcclxuICBiaXRyYXRlS2JwczogMjAwMDAsXHJcbiAgbXV0ZUhvc3RBdWRpbzogdHJ1ZSxcclxuICB2aWRlb1BhY2luZ01vZGU6ICdiYWxhbmNlZCcsXHJcbiAgdmlkZW9QYWNpbmdTbGFja01zOiBwYWNpbmdQcmVzZXRzLmJhbGFuY2VkLnNsYWNrTXMsXHJcbiAgdmlkZW9NYXhGcmFtZUFnZUZyYW1lczogcGFjaW5nUHJlc2V0cy5iYWxhbmNlZC5tYXhBZ2VGcmFtZXMsXHJcbn0pO1xyXG5cclxuY29uc3QgbmVnb3RpYXRlZEVuY29kaW5nID0gcmVmPEVuY29kaW5nVHlwZSB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBoZHJSdW50aW1lV2FybmluZyA9IHJlZjxzdHJpbmcgfCBudWxsPihudWxsKTtcclxuXHJcbmNvbnN0IENMSUVOVF9DT05GSUdfU1RPUkFHRV9LRVkgPSAnc3Vuc2hpbmUud2VicnRjLnNlc3Npb25fY29uZmlnJztcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVByb2ZpbGVDb25maWcocHJvZmlsZUNvbmZpZzogU3RyZWFtQ29uZmlnKTogU3RyZWFtQ29uZmlnIHtcclxuICBjb25zdCBub3JtYWxpemVkID0geyAuLi5wcm9maWxlQ29uZmlnIH07XHJcbiAgY29uc3QgZnBzID1cclxuICAgIHR5cGVvZiBub3JtYWxpemVkLmZwcyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKG5vcm1hbGl6ZWQuZnBzKSA/IG5vcm1hbGl6ZWQuZnBzIDogNjA7XHJcbiAgaWYgKHR5cGVvZiBub3JtYWxpemVkLmhkciAhPT0gJ2Jvb2xlYW4nKSBub3JtYWxpemVkLmhkciA9IGZhbHNlO1xyXG4gIGlmIChcclxuICAgIG5vcm1hbGl6ZWQuZW5jb2RpbmcgIT09ICdoMjY0JyAmJlxyXG4gICAgbm9ybWFsaXplZC5lbmNvZGluZyAhPT0gJ2hldmMnICYmXHJcbiAgICBub3JtYWxpemVkLmVuY29kaW5nICE9PSAnYXYxJ1xyXG4gICkge1xyXG4gICAgbm9ybWFsaXplZC5lbmNvZGluZyA9ICdoMjY0JztcclxuICB9XHJcbiAgaWYgKG5vcm1hbGl6ZWQuaGRyICYmIG5vcm1hbGl6ZWQuZW5jb2RpbmcgPT09ICdoMjY0Jykgbm9ybWFsaXplZC5lbmNvZGluZyA9ICdoZXZjJztcclxuXHJcbiAgaWYgKHR5cGVvZiBub3JtYWxpemVkLnZpZGVvTWF4RnJhbWVBZ2VNcyA9PT0gJ251bWJlcicpIHtcclxuICAgIGlmIChub3JtYWxpemVkLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMgPT0gbnVsbCkge1xyXG4gICAgICBub3JtYWxpemVkLnZpZGVvTWF4RnJhbWVBZ2VGcmFtZXMgPSBNYXRoLm1heChcclxuICAgICAgICAxLFxyXG4gICAgICAgIE1hdGgucm91bmQoKG5vcm1hbGl6ZWQudmlkZW9NYXhGcmFtZUFnZU1zIC8gMTAwMCkgKiBmcHMpLFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZGVsZXRlIG5vcm1hbGl6ZWQudmlkZW9NYXhGcmFtZUFnZU1zO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbW9kZVJhdyA9IG5vcm1hbGl6ZWQudmlkZW9QYWNpbmdNb2RlO1xyXG4gIGNvbnN0IG1vZGU6IFBhY2luZ01vZGUgPVxyXG4gICAgbW9kZVJhdyA9PT0gJ2xhdGVuY3knIHx8IG1vZGVSYXcgPT09ICdiYWxhbmNlZCcgfHwgbW9kZVJhdyA9PT0gJ3Ntb290aG5lc3MnXHJcbiAgICAgID8gbW9kZVJhd1xyXG4gICAgICA6ICdiYWxhbmNlZCc7XHJcbiAgbm9ybWFsaXplZC52aWRlb1BhY2luZ01vZGUgPSBtb2RlO1xyXG5cclxuICBjb25zdCBzbGFja1JhdyA9IG5vcm1hbGl6ZWQudmlkZW9QYWNpbmdTbGFja01zO1xyXG4gIGNvbnN0IHNsYWNrID1cclxuICAgIHR5cGVvZiBzbGFja1JhdyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHNsYWNrUmF3KVxyXG4gICAgICA/IE1hdGgucm91bmQoc2xhY2tSYXcpXHJcbiAgICAgIDogcGFjaW5nUHJlc2V0c1ttb2RlXS5zbGFja01zO1xyXG4gIG5vcm1hbGl6ZWQudmlkZW9QYWNpbmdTbGFja01zID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAsIHNsYWNrKSk7XHJcblxyXG4gIG5vcm1hbGl6ZWQudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA9IGNsYW1wTWF4QWdlRnJhbWVzKFxyXG4gICAgbm9ybWFsaXplZC52aWRlb01heEZyYW1lQWdlRnJhbWVzID8/IG51bGwsXHJcbiAgICBmcHMsXHJcbiAgICBtb2RlLFxyXG4gICk7XHJcbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRDYWNoZWRDb25maWcoKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShDTElFTlRfQ09ORklHX1NUT1JBR0VfS0VZKTtcclxuICAgIGlmICghcmF3KSByZXR1cm47XHJcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdyk7XHJcbiAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSAnb2JqZWN0JykgcmV0dXJuO1xyXG4gICAgT2JqZWN0LmFzc2lnbihjb25maWcsIG5vcm1hbGl6ZVByb2ZpbGVDb25maWcocGFyc2VkIGFzIFN0cmVhbUNvbmZpZykpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwZXJzaXN0Q2FjaGVkQ29uZmlnKCk6IHZvaWQge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzbmFwc2hvdCA9IG5vcm1hbGl6ZVByb2ZpbGVDb25maWcoeyAuLi5jb25maWcgfSk7XHJcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oQ0xJRU5UX0NPTkZJR19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgbWF4RnJhbWVBZ2VGcmFtZXMgPSBjb21wdXRlZCh7XHJcbiAgZ2V0KCkge1xyXG4gICAgcmV0dXJuIGNsYW1wTWF4QWdlRnJhbWVzKFxyXG4gICAgICBjb25maWcudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA/PyBudWxsLFxyXG4gICAgICBjb25maWcuZnBzLFxyXG4gICAgICAoY29uZmlnLnZpZGVvUGFjaW5nTW9kZSBhcyBQYWNpbmdNb2RlIHwgdW5kZWZpbmVkKSA/PyAnYmFsYW5jZWQnLFxyXG4gICAgKTtcclxuICB9LFxyXG4gIHNldCh2YWx1ZTogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgZGVsZXRlIChjb25maWcgYXMgYW55KS52aWRlb01heEZyYW1lQWdlTXM7XHJcbiAgICBjb25maWcudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA9IGNsYW1wTWF4QWdlRnJhbWVzKFxyXG4gICAgICB2YWx1ZSxcclxuICAgICAgY29uZmlnLmZwcyxcclxuICAgICAgKGNvbmZpZy52aWRlb1BhY2luZ01vZGUgYXMgUGFjaW5nTW9kZSB8IHVuZGVmaW5lZCkgPz8gJ2JhbGFuY2VkJyxcclxuICAgICk7XHJcbiAgfSxcclxufSk7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBjb25maWcuaGRyLFxyXG4gIChlbmFibGVkKSA9PiB7XHJcbiAgICBpZiAoZW5hYmxlZCkgZW5zdXJlSGRyRW5jb2RpbmcoKTtcclxuICB9LFxyXG4pO1xyXG53YXRjaChcclxuICAoKSA9PiBjb25maWcuZW5jb2RpbmcsXHJcbiAgKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZy5oZHIpIGVuc3VyZUhkckVuY29kaW5nKCk7XHJcbiAgfSxcclxuKTtcclxud2F0Y2goXHJcbiAgKCkgPT4gY29uZmlnLmhkcixcclxuICAoZW5hYmxlZCkgPT4ge1xyXG4gICAgaWYgKCFlbmFibGVkKSBoZHJSdW50aW1lV2FybmluZy52YWx1ZSA9IG51bGw7XHJcbiAgfSxcclxuKTtcclxud2F0Y2goXHJcbiAgKCkgPT4gY29uZmlnLmVuY29kaW5nLFxyXG4gICgpID0+IHtcclxuICAgIGhkclJ1bnRpbWVXYXJuaW5nLnZhbHVlID0gbnVsbDtcclxuICB9LFxyXG4pO1xyXG53YXRjaChcclxuICAoKSA9PiAoeyAuLi5jb25maWcgfSksXHJcbiAgKCkgPT4ge1xyXG4gICAgcGVyc2lzdENhY2hlZENvbmZpZygpO1xyXG4gIH0sXHJcbiAgeyBkZWVwOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBhcHBzU3RvcmUgPSB1c2VBcHBzU3RvcmUoKTtcclxuY29uc3QgeyBhcHBzIH0gPSBzdG9yZVRvUmVmcyhhcHBzU3RvcmUpO1xyXG5jb25zdCBhcHBzTGlzdCA9IGNvbXB1dGVkKCgpID0+IChhcHBzLnZhbHVlIHx8IFtdKS5zbGljZSgpKTtcclxuXHJcbi8vIFNlYXJjaCBhbmQgZmlsdGVyaW5nXHJcbmNvbnN0IHNlYXJjaFF1ZXJ5ID0gcmVmKCcnKTtcclxuXHJcbi8vIFRyYWNrIHdoaWNoIGFwcHMgaGF2ZSB2YWxpZCBjb3ZlciBpbWFnZXMgKGxvYWRlZCBzdWNjZXNzZnVsbHkpXHJcbmNvbnN0IGFwcENvdmVyU3RhdHVzID0gcmVmPE1hcDxzdHJpbmcsIGJvb2xlYW4+PihuZXcgTWFwKCkpO1xyXG5cclxuZnVuY3Rpb24gb25Db3ZlckxvYWQoYXBwOiBBcHApIHtcclxuICBpZiAoYXBwLnV1aWQpIGFwcENvdmVyU3RhdHVzLnZhbHVlLnNldChhcHAudXVpZCwgdHJ1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uQ292ZXJFcnJvcihhcHA6IEFwcCkge1xyXG4gIGlmIChhcHAudXVpZCkgYXBwQ292ZXJTdGF0dXMudmFsdWUuc2V0KGFwcC51dWlkLCBmYWxzZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcEhhc0NvdmVyKGFwcDogQXBwKTogYm9vbGVhbiB7XHJcbiAgLy8gQ2hlY2sgaWYgd2UndmUgYWxyZWFkeSBsb2FkZWQgdGhpcyBjb3ZlclxyXG4gIGlmIChhcHAudXVpZCAmJiBhcHBDb3ZlclN0YXR1cy52YWx1ZS5oYXMoYXBwLnV1aWQpKSB7XHJcbiAgICByZXR1cm4gYXBwQ292ZXJTdGF0dXMudmFsdWUuZ2V0KGFwcC51dWlkKSA9PT0gdHJ1ZTtcclxuICB9XHJcbiAgLy8gQXNzdW1lIGFwcHMgd2l0aCBpbWFnZS1wYXRoIG9yIHBsYXluaXRlLWlkIGhhdmUgY292ZXJzIHVudGlsIHByb3ZlbiBvdGhlcndpc2VcclxuICByZXR1cm4gISEoYXBwWydpbWFnZS1wYXRoJ10gfHwgYXBwWydwbGF5bml0ZS1pZCddKTtcclxufVxyXG5cclxuY29uc3QgZmlsdGVyZWRBcHBzID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoUXVlcnkudmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKCFxdWVyeSkgcmV0dXJuIGFwcHNMaXN0LnZhbHVlO1xyXG4gIHJldHVybiBhcHBzTGlzdC52YWx1ZS5maWx0ZXIoKGFwcCkgPT4ge1xyXG4gICAgY29uc3QgbmFtZSA9IChhcHAubmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiBuYW1lLmluY2x1ZGVzKHF1ZXJ5KTtcclxuICB9KTtcclxufSk7XHJcblxyXG5jb25zdCBhcHBzV2l0aENvdmVycyA9IGNvbXB1dGVkKCgpID0+IGZpbHRlcmVkQXBwcy52YWx1ZS5maWx0ZXIoKGFwcCkgPT4gYXBwSGFzQ292ZXIoYXBwKSkpO1xyXG5jb25zdCBhcHBzV2l0aG91dENvdmVycyA9IGNvbXB1dGVkKCgpID0+IGZpbHRlcmVkQXBwcy52YWx1ZS5maWx0ZXIoKGFwcCkgPT4gIWFwcEhhc0NvdmVyKGFwcCkpKTtcclxuXHJcbmNvbnN0IHNlbGVjdGVkQXBwSWQgPSByZWY8bnVtYmVyIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHJlc3VtZU9uQ29ubmVjdCA9IHJlZih0cnVlKTtcclxuY29uc3QgdGVybWluYXRlUGVuZGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IHNlc3Npb25TdGF0dXMgPSByZWY8eyBhY3RpdmVTZXNzaW9uczogbnVtYmVyOyBhcHBSdW5uaW5nOiBib29sZWFuOyBwYXVzZWQ6IGJvb2xlYW4gfSB8IG51bGw+KFxyXG4gIG51bGwsXHJcbik7XHJcbmxldCBzZXNzaW9uU3RhdHVzVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gYXBwS2V5KGFwcDogQXBwKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7YXBwLnV1aWQgfHwgJyd9LSR7YXBwLm5hbWUgfHwgJ2FwcCd9YDtcclxufVxyXG5cclxuZnVuY3Rpb24gY292ZXJVcmwoYXBwOiBBcHApOiBzdHJpbmcge1xyXG4gIGlmICghYXBwLnV1aWQpIHJldHVybiAnJztcclxuICByZXR1cm4gYC9hcGkvYXBwcy8ke2VuY29kZVVSSUNvbXBvbmVudChhcHAudXVpZCl9L2NvdmVyYDtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwU3VidGl0bGUoYXBwOiBBcHApOiBzdHJpbmcge1xyXG4gIGlmIChhcHBbJ3BsYXluaXRlLWlkJ10pIHJldHVybiAnUGxheW5pdGUnO1xyXG4gIGlmIChhcHBbJ3dvcmtpbmctZGlyJ10pIHJldHVybiBTdHJpbmcoYXBwWyd3b3JraW5nLWRpciddKTtcclxuICByZXR1cm4gJ0N1c3RvbSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcE51bWVyaWNJZChhcHA6IEFwcCk6IG51bWJlciB8IG51bGwge1xyXG4gIGNvbnN0IHJhdyA9IChhcHAgYXMgYW55KS5pZCA/PyAoYXBwIGFzIGFueSkuaW5kZXg7XHJcbiAgY29uc3QgcGFyc2VkID0gTnVtYmVyKHJhdyk7XHJcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShwYXJzZWQpID8gcGFyc2VkIDogbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VsZWN0QXBwKGFwcDogQXBwKSB7XHJcbiAgY29uc3QgaWQgPSBhcHBOdW1lcmljSWQoYXBwKTtcclxuICBpZiAoaWQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gIHNlbGVjdGVkQXBwSWQudmFsdWUgPSBpZDtcclxuICByZXN1bWVPbkNvbm5lY3QudmFsdWUgPSBmYWxzZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gb25BcHBEb3VibGVDbGljayhhcHA6IEFwcCkge1xyXG4gIGlmIChpc0Nvbm5lY3RlZC52YWx1ZSB8fCBpc0Nvbm5lY3RpbmcudmFsdWUpIHJldHVybjtcclxuICBzZWxlY3RBcHAoYXBwKTtcclxuICBhd2FpdCBjb25uZWN0KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xyXG4gIHNlbGVjdGVkQXBwSWQudmFsdWUgPSBudWxsO1xyXG4gIHJlc3VtZU9uQ29ubmVjdC52YWx1ZSA9IHRydWU7XHJcbn1cclxuXHJcbmNvbnN0IHNlbGVjdGVkQXBwTGFiZWwgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFzZWxlY3RlZEFwcElkLnZhbHVlKSByZXR1cm4gJ05vIGFwcCBzZWxlY3RlZCc7XHJcbiAgY29uc3Qgc2VsZWN0ZWQgPSBhcHBzTGlzdC52YWx1ZS5maW5kKChhcHApID0+IGFwcE51bWVyaWNJZChhcHApID09PSBzZWxlY3RlZEFwcElkLnZhbHVlKTtcclxuICByZXR1cm4gc2VsZWN0ZWQ/Lm5hbWUgPyBzZWxlY3RlZC5uYW1lIDogYEFwcCAke3NlbGVjdGVkQXBwSWQudmFsdWV9YDtcclxufSk7XHJcblxyXG5jb25zdCBzZWxlY3RlZEFwcE5hbWUgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKCFzZWxlY3RlZEFwcElkLnZhbHVlKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCBzZWxlY3RlZCA9IGFwcHNMaXN0LnZhbHVlLmZpbmQoKGFwcCkgPT4gYXBwTnVtZXJpY0lkKGFwcCkgPT09IHNlbGVjdGVkQXBwSWQudmFsdWUpO1xyXG4gIHJldHVybiBzZWxlY3RlZD8ubmFtZSA/PyBudWxsO1xyXG59KTtcclxuXHJcbmNvbnN0IGhhc1J1bm5pbmdTZXNzaW9uID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmICghc2Vzc2lvblN0YXR1cy52YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiBzZXNzaW9uU3RhdHVzLnZhbHVlLmFwcFJ1bm5pbmcgfHwgc2Vzc2lvblN0YXR1cy52YWx1ZS5hY3RpdmVTZXNzaW9ucyA+IDA7XHJcbn0pO1xyXG5cclxuY29uc3QgcmVzdW1lQXZhaWxhYmxlID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIGlmIChzZWxlY3RlZEFwcElkLnZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgaWYgKCFzZXNzaW9uU3RhdHVzLnZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIHNlc3Npb25TdGF0dXMudmFsdWUuYWN0aXZlU2Vzc2lvbnMgPiAwIHx8IHNlc3Npb25TdGF0dXMudmFsdWUucGF1c2VkO1xyXG59KTtcclxuXHJcbmNvbnN0IGFwaSA9IG5ldyBXZWJSdGNIdHRwQXBpKCk7XHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXZWJSdGNDbGllbnQoYXBpKTtcclxuXHJcbmNvbnN0IGlzQ29ubmVjdGluZyA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGlzQ29ubmVjdGVkID0gcmVmKGZhbHNlKTtcclxuXHJcbmZ1bmN0aW9uIHNldFdlYlJ0Y0FjdGl2ZShhY3RpdmU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICB0cnkge1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLl9fc3Vuc2hpbmVfd2VicnRjX2FjdGl2ZSA9IGFjdGl2ZTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8qIGlnbm9yZSAqL1xyXG4gIH1cclxufVxyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gW2lzQ29ubmVjdGluZy52YWx1ZSwgaXNDb25uZWN0ZWQudmFsdWVdIGFzIGNvbnN0LFxyXG4gIChbY29ubmVjdGluZywgY29ubmVjdGVkXSkgPT4ge1xyXG4gICAgc2V0V2ViUnRjQWN0aXZlKGNvbm5lY3RpbmcgfHwgY29ubmVjdGVkKTtcclxuICB9LFxyXG4gIHsgaW1tZWRpYXRlOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBjb25uZWN0TGFiZWxLZXkgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgaWYgKGlzQ29ubmVjdGluZy52YWx1ZSkgcmV0dXJuICd3ZWJydGMuY29ubmVjdGluZyc7XHJcbiAgaWYgKGlzQ29ubmVjdGVkLnZhbHVlKSByZXR1cm4gJ3dlYnJ0Yy5kaXNjb25uZWN0JztcclxuICBpZiAocmVzdW1lQXZhaWxhYmxlLnZhbHVlKSByZXR1cm4gJ3dlYnJ0Yy5yZXN1bWUnO1xyXG4gIGlmIChzZWxlY3RlZEFwcElkLnZhbHVlKSByZXR1cm4gJ3dlYnJ0Yy5jb25uZWN0JztcclxuICByZXR1cm4gJ3dlYnJ0Yy5zdHJlYW1fZGVza3RvcCc7XHJcbn0pO1xyXG5cclxuY29uc3Qgc2hvd1N0YXJ0aW5nT3ZlcmxheSA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBpZiAoaXNDb25uZWN0ZWQudmFsdWUpIHJldHVybiBmYWxzZTtcclxuICByZXR1cm4gaXNDb25uZWN0aW5nLnZhbHVlIHx8IGNvbm5lY3Rpb25TdGF0ZS52YWx1ZSA9PT0gJ2Nvbm5lY3RpbmcnO1xyXG59KTtcclxuXHJcbmNvbnN0IGNvbm5lY3Rpb25TdGF0ZSA9IHJlZjxSVENQZWVyQ29ubmVjdGlvblN0YXRlIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IGljZVN0YXRlID0gcmVmPFJUQ0ljZUNvbm5lY3Rpb25TdGF0ZSB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBpbnB1dENoYW5uZWxTdGF0ZSA9IHJlZjxSVENEYXRhQ2hhbm5lbFN0YXRlIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHN0YXRzID0gcmVmPFdlYlJ0Y1N0YXRzU25hcHNob3Q+KHt9KTtcclxuY29uc3QgaW5wdXRFbmFibGVkID0gcmVmKHRydWUpO1xyXG5jb25zdCBzaG93T3ZlcmxheSA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGlucHV0VGFyZ2V0ID0gcmVmPEhUTUxFbGVtZW50IHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHZpZGVvRWwgPSByZWY8SFRNTFZpZGVvRWxlbWVudCB8IG51bGw+KG51bGwpO1xyXG5jb25zdCBhdWRpb0VsID0gcmVmPEhUTUxBdWRpb0VsZW1lbnQgfCBudWxsPihudWxsKTtcclxuY29uc3QgaXNGdWxsc2NyZWVuID0gcmVmKGZhbHNlKTtcclxuY29uc3QgcHNldWRvRnVsbHNjcmVlbiA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IG5hdGl2ZVZpZGVvRnVsbHNjcmVlbiA9IHJlZihmYWxzZSk7XHJcbmNvbnN0IGF1dG9GdWxsc2NyZWVuID0gcmVmKHRydWUpO1xyXG5jb25zdCBzZXNzaW9uSWQgPSByZWY8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHNlcnZlclNlc3Npb24gPSByZWY8V2ViUnRjU2Vzc2lvblN0YXRlIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IHNlcnZlclZpZGVvRnBzID0gcmVmPG51bWJlciB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcclxuXHJcbmxldCBsYXN0U2VydmVyU2FtcGxlOiB7IHRzOiBudW1iZXI7IHZpZGVvUGFja2V0cz86IG51bWJlciB9IHwgbnVsbCA9IG51bGw7XHJcbmNvbnN0IHJlbW90ZVN0cmVhbUluZm8gPSByZWY8eyBpZDogc3RyaW5nOyB2aWRlb1RyYWNrczogbnVtYmVyOyBhdWRpb1RyYWNrczogbnVtYmVyIH0gfCBudWxsPihudWxsKTtcclxuY29uc3QgdmlkZW9FdmVudHMgPSByZWY8c3RyaW5nW10+KFtdKTtcclxuY29uc3QgdmlkZW9TdGF0ZVRpY2sgPSByZWYoMCk7XHJcblxyXG5jb25zdCB2aWRlb0RlYnVnID0gY29tcHV0ZWQoKCkgPT4ge1xyXG4gIHZvaWQgdmlkZW9TdGF0ZVRpY2sudmFsdWU7XHJcbiAgY29uc3QgZWwgPSB2aWRlb0VsLnZhbHVlO1xyXG4gIGlmICghZWwpIHJldHVybiBudWxsO1xyXG4gIHJldHVybiB7XHJcbiAgICByZWFkeVN0YXRlOiBlbC5yZWFkeVN0YXRlLFxyXG4gICAgd2lkdGg6IGVsLnZpZGVvV2lkdGgsXHJcbiAgICBoZWlnaHQ6IGVsLnZpZGVvSGVpZ2h0LFxyXG4gICAgY3VycmVudFRpbWU6IGVsLmN1cnJlbnRUaW1lLFxyXG4gICAgcGF1c2VkOiBlbC5wYXVzZWQsXHJcbiAgfTtcclxufSk7XHJcblxyXG5jb25zdCB2aWRlb1NpemVMYWJlbCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCB3aWR0aCA9IHZpZGVvRGVidWcudmFsdWU/LndpZHRoID8/IDA7XHJcbiAgY29uc3QgaGVpZ2h0ID0gdmlkZW9EZWJ1Zy52YWx1ZT8uaGVpZ2h0ID8/IDA7XHJcbiAgcmV0dXJuIHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwID8gYCR7d2lkdGh9eCR7aGVpZ2h0fWAgOiAnLS0nO1xyXG59KTtcclxuXHJcbmNvbnN0IGlucHV0TWV0cmljcyA9IHJlZjxJbnB1dENhcHR1cmVNZXRyaWNzPih7fSk7XHJcbmNvbnN0IGlucHV0QnVmZmVyZWRBbW91bnQgPSByZWY8bnVtYmVyIHwgbnVsbD4obnVsbCk7XHJcbmNvbnN0IElOUFVUX0JVRkZFUl9EUk9QX1RIUkVTSE9MRF9CWVRFUyA9IDEwMjQ7XHJcblxyXG5jb25zdCBzaG91bGREcm9wSW5wdXQgPSAocGF5bG9hZDogSW5wdXRNZXNzYWdlKSA9PiB7XHJcbiAgY29uc3QgYnVmZmVyZWQgPSBjbGllbnQuaW5wdXRDaGFubmVsQnVmZmVyZWRBbW91bnQgPz8gMDtcclxuICBpbnB1dEJ1ZmZlcmVkQW1vdW50LnZhbHVlID0gYnVmZmVyZWQ7XHJcbiAgaWYgKGJ1ZmZlcmVkIDw9IElOUFVUX0JVRkZFUl9EUk9QX1RIUkVTSE9MRF9CWVRFUykgcmV0dXJuIGZhbHNlO1xyXG4gIGlmIChwYXlsb2FkLnR5cGUgPT09ICdtb3VzZV9tb3ZlJykgcmV0dXJuIHRydWU7XHJcbiAgaWYgKHBheWxvYWQudHlwZSA9PT0gJ2dhbWVwYWRfc3RhdGUnIHx8IHBheWxvYWQudHlwZSA9PT0gJ2dhbWVwYWRfbW90aW9uJykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuY29uc3QgdmlkZW9GcmFtZU1ldHJpY3MgPSByZWY8e1xyXG4gIGxhc3RJbnRlcnZhbE1zPzogbnVtYmVyO1xyXG4gIGF2Z0ludGVydmFsTXM/OiBudW1iZXI7XHJcbiAgbWF4SW50ZXJ2YWxNcz86IG51bWJlcjtcclxuICBwOThJbnRlcnZhbE1zPzogbnVtYmVyO1xyXG4gIGF2Zzk4SW50ZXJ2YWxNcz86IG51bWJlcjtcclxuICBwOTlJbnRlcnZhbE1zPzogbnVtYmVyO1xyXG4gIGF2Zzk5SW50ZXJ2YWxNcz86IG51bWJlcjtcclxuICBsYXN0RGVsYXlNcz86IG51bWJlcjtcclxuICBhdmdEZWxheU1zPzogbnVtYmVyO1xyXG4gIG1heERlbGF5TXM/OiBudW1iZXI7XHJcbn0+KHt9KTtcclxuXHJcbmNvbnN0IHZpZGVvUGFjaW5nTWV0cmljcyA9IHJlZjx7XHJcbiAgZHRNcz86IG51bWJlciB8IG51bGw7XHJcbiAgcHJlc2VudGVkRGVsdGE/OiBudW1iZXIgfCBudWxsO1xyXG4gIG5vdz86IG51bWJlcjtcclxuICBleHBlY3RlZERpc3BsYXlUaW1lPzogbnVtYmVyO1xyXG4gIG1lZGlhVGltZT86IG51bWJlcjtcclxuICBwcm9jZXNzaW5nRHVyYXRpb24/OiBudW1iZXI7XHJcbiAgcmVjZWl2ZVRpbWU/OiBudW1iZXI7XHJcbiAgcnRwVGltZXN0YW1wPzogbnVtYmVyO1xyXG59Pih7fSk7XHJcblxyXG5jb25zdCBpbmJvdW5kVmlkZW9TdGF0cyA9IHJlZjx7XHJcbiAgZnBzUmVjZWl2ZWQ/OiBudW1iZXI7XHJcbiAgZnBzRGVjb2RlZD86IG51bWJlcjtcclxuICBmcmFtZXNEcm9wcGVkPzogbnVtYmVyO1xyXG4gIGF2Z0ppdHRlckJ1ZmZlck1zPzogbnVtYmVyIHwgbnVsbDtcclxuICBhdmdEZWNvZGVNc1BlckZyYW1lPzogbnVtYmVyIHwgbnVsbDtcclxuICBwYWNrZXRzTG9zdERlbHRhPzogbnVtYmVyO1xyXG4gIGppdHRlcj86IG51bWJlcjtcclxufT4oe30pO1xyXG5cclxudHlwZSBEaWFnbm9zdGljc1NhbXBsZSA9IHtcclxuICB0czogbnVtYmVyO1xyXG4gIHBhY2luZ0R0TXM/OiBudW1iZXIgfCBudWxsO1xyXG4gIHByZXNlbnRlZERlbHRhPzogbnVtYmVyIHwgbnVsbDtcclxuICByZW5kZXJJbnRlcnZhbE1zPzogbnVtYmVyO1xyXG4gIHJlbmRlckRlbGF5TXM/OiBudW1iZXI7XHJcbiAgZnBzUmVjZWl2ZWQ/OiBudW1iZXI7XHJcbiAgZnBzRGVjb2RlZD86IG51bWJlcjtcclxuICBmcmFtZXNEcm9wcGVkPzogbnVtYmVyO1xyXG4gIGF2Z0ppdHRlckJ1ZmZlck1zPzogbnVtYmVyIHwgbnVsbDtcclxuICBhdmdEZWNvZGVNc1BlckZyYW1lPzogbnVtYmVyIHwgbnVsbDtcclxuICBwYWNrZXRzTG9zdERlbHRhPzogbnVtYmVyO1xyXG4gIGppdHRlcj86IG51bWJlcjtcclxuICBzZXJ2ZXJRdWV1ZT86IG51bWJlcjtcclxuICBzZXJ2ZXJJbmZsaWdodD86IG51bWJlcjtcclxuICBzZXJ2ZXJWaWRlb0FnZU1zPzogbnVtYmVyO1xyXG4gIHNlcnZlckZwcz86IG51bWJlcjtcclxufTtcclxuXHJcbmNvbnN0IERJQUdOT1NUSUNTX1dJTkRPV19NUyA9IDMwMDAwO1xyXG5jb25zdCBkaWFnbm9zdGljc1NhbXBsZXMgPSByZWY8RGlhZ25vc3RpY3NTYW1wbGVbXT4oW10pO1xyXG5sZXQgZGlhZ25vc3RpY3NTYW1wbGVUaW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG5jb25zdCByZW5kZXJGcHMgPSBjb21wdXRlZCgoKSA9PiB7XHJcbiAgY29uc3QgaW50ZXJ2YWxNcyA9XHJcbiAgICB2aWRlb0ZyYW1lTWV0cmljcy52YWx1ZS5sYXN0SW50ZXJ2YWxNcyA/PyB2aWRlb0ZyYW1lTWV0cmljcy52YWx1ZS5hdmdJbnRlcnZhbE1zO1xyXG4gIGlmICh0eXBlb2YgaW50ZXJ2YWxNcyAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZShpbnRlcnZhbE1zKSB8fCBpbnRlcnZhbE1zIDw9IDApXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIHJldHVybiAxMDAwIC8gaW50ZXJ2YWxNcztcclxufSk7XHJcblxyXG5jb25zdCByZW5kZXJGcHM5OCA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBpbnRlcnZhbE1zID1cclxuICAgIHZpZGVvRnJhbWVNZXRyaWNzLnZhbHVlLmF2Zzk4SW50ZXJ2YWxNcyA/PyB2aWRlb0ZyYW1lTWV0cmljcy52YWx1ZS5wOThJbnRlcnZhbE1zO1xyXG4gIGlmICh0eXBlb2YgaW50ZXJ2YWxNcyAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZShpbnRlcnZhbE1zKSB8fCBpbnRlcnZhbE1zIDw9IDApXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIHJldHVybiAxMDAwIC8gaW50ZXJ2YWxNcztcclxufSk7XHJcblxyXG5jb25zdCByZW5kZXJGcHM5OSA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBpbnRlcnZhbE1zID1cclxuICAgIHZpZGVvRnJhbWVNZXRyaWNzLnZhbHVlLmF2Zzk5SW50ZXJ2YWxNcyA/PyB2aWRlb0ZyYW1lTWV0cmljcy52YWx1ZS5wOTlJbnRlcnZhbE1zO1xyXG4gIGlmICh0eXBlb2YgaW50ZXJ2YWxNcyAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZShpbnRlcnZhbE1zKSB8fCBpbnRlcnZhbE1zIDw9IDApXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIHJldHVybiAxMDAwIC8gaW50ZXJ2YWxNcztcclxufSk7XHJcblxyXG5jb25zdCByZW5kZXJEZWxheU1zID0gY29tcHV0ZWQoXHJcbiAgKCkgPT4gdmlkZW9GcmFtZU1ldHJpY3MudmFsdWUubGFzdERlbGF5TXMgPz8gdmlkZW9GcmFtZU1ldHJpY3MudmFsdWUuYXZnRGVsYXlNcyxcclxuKTtcclxuY29uc3QgcmVuZGVySW50ZXJ2YWxNcyA9IGNvbXB1dGVkKFxyXG4gICgpID0+IHZpZGVvRnJhbWVNZXRyaWNzLnZhbHVlLmxhc3RJbnRlcnZhbE1zID8/IHZpZGVvRnJhbWVNZXRyaWNzLnZhbHVlLmF2Z0ludGVydmFsTXMsXHJcbik7XHJcblxyXG5jb25zdCBMQVRFTkNZX1NBTVBMRV9XSU5ET1dfTVMgPSAzMDAwMDtcclxuY29uc3QgTEFURU5DWV9TTU9PVEhfVEFVX01TID0gMjAwMDtcclxuY29uc3QgTEFURU5DWV9GQVNUX1RBVV9NUyA9IDMwMDtcclxuY29uc3QgTEFURU5DWV9GQVNUX1RSSUdHRVJfTVMgPSAxMjtcclxuY29uc3QgTEFURU5DWV9GQVNUX1RSSUdHRVJfUkFUSU8gPSAxLjE1O1xyXG5jb25zdCBWSURFT19GUFNfU01PT1RIX1RBVV9NUyA9IDE1MDA7XHJcbmNvbnN0IGxhdGVuY3lTYW1wbGVzID0gcmVmPHsgdHM6IG51bWJlcjsgdmFsdWU6IG51bWJlciB9W10+KFtdKTtcclxuY29uc3Qgc21vb3RoZWRMYXRlbmN5TXMgPSByZWY8bnVtYmVyIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xyXG5sZXQgbGFzdExhdGVuY3lTYW1wbGVBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmNvbnN0IHZpZGVvSml0dGVyQnVmZmVyTXMgPSBjb21wdXRlZCgoKSA9PiBzdGF0cy52YWx1ZS52aWRlb0ppdHRlckJ1ZmZlck1zKTtcclxuY29uc3Qgb25lV2F5UnR0TXMgPSBjb21wdXRlZCgoKSA9PlxyXG4gIHN0YXRzLnZhbHVlLnJvdW5kVHJpcFRpbWVNcyA/IHN0YXRzLnZhbHVlLnJvdW5kVHJpcFRpbWVNcyAvIDIgOiB1bmRlZmluZWQsXHJcbik7XHJcbmNvbnN0IHZpZGVvUGxheW91dERlbGF5TXMgPSBjb21wdXRlZChcclxuICAoKSA9PiBzdGF0cy52YWx1ZS52aWRlb1BsYXlvdXREZWxheU1zID8/IHN0YXRzLnZhbHVlLnZpZGVvSml0dGVyQnVmZmVyTXMsXHJcbik7XHJcbmNvbnN0IHNtb290aGVkVmlkZW9GcHMgPSByZWY8bnVtYmVyIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xyXG5sZXQgbGFzdFZpZGVvRnBzU2FtcGxlQXQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuY29uc3QgZGlzcGxheVZpZGVvRnBzID0gY29tcHV0ZWQoXHJcbiAgKCkgPT5cclxuICAgIHJlbmRlckZwczk5LnZhbHVlID8/XHJcbiAgICByZW5kZXJGcHM5OC52YWx1ZSA/P1xyXG4gICAgcmVuZGVyRnBzLnZhbHVlID8/XHJcbiAgICBzbW9vdGhlZFZpZGVvRnBzLnZhbHVlID8/XHJcbiAgICBzdGF0cy52YWx1ZS52aWRlb0ZwcyxcclxuKTtcclxuXHJcbmNvbnN0IGVzdGltYXRlZExhdGVuY3lNcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBwYXJ0cyA9IFtvbmVXYXlSdHRNcy52YWx1ZSwgdmlkZW9QbGF5b3V0RGVsYXlNcy52YWx1ZSwgc3RhdHMudmFsdWUudmlkZW9EZWNvZGVNc10uZmlsdGVyKFxyXG4gICAgKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxyXG4gICkgYXMgbnVtYmVyW107XHJcbiAgaWYgKCFwYXJ0cy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgcmV0dXJuIHBhcnRzLnJlZHVjZSgodG90YWwsIHZhbHVlKSA9PiB0b3RhbCArIHZhbHVlLCAwKTtcclxufSk7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBlc3RpbWF0ZWRMYXRlbmN5TXMudmFsdWUsXHJcbiAgKHZhbHVlKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCBOdW1iZXIuaXNOYU4odmFsdWUpKSByZXR1cm47XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgY29uc3QgbGFzdEF0ID0gbGFzdExhdGVuY3lTYW1wbGVBdCA/PyBub3c7XHJcbiAgICBjb25zdCBkZWx0YU1zID0gTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KTtcclxuICAgIGNvbnN0IGN1cnJlbnQgPSBzbW9vdGhlZExhdGVuY3lNcy52YWx1ZTtcclxuICAgIGNvbnN0IGp1bXBNcyA9XHJcbiAgICAgIHR5cGVvZiBjdXJyZW50ID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUoY3VycmVudCkgPyB2YWx1ZSAtIGN1cnJlbnQgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBqdW1wUmF0aW8gPVxyXG4gICAgICB0eXBlb2YgY3VycmVudCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKGN1cnJlbnQpICYmIGN1cnJlbnQgPiAwXHJcbiAgICAgICAgPyB2YWx1ZSAvIGN1cnJlbnRcclxuICAgICAgICA6IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHVzZUZhc3RUYXUgPVxyXG4gICAgICBqdW1wTXMgIT0gbnVsbCAmJlxyXG4gICAgICAoanVtcE1zID49IExBVEVOQ1lfRkFTVF9UUklHR0VSX01TIHx8XHJcbiAgICAgICAgKGp1bXBSYXRpbyAhPSBudWxsICYmIGp1bXBSYXRpbyA+PSBMQVRFTkNZX0ZBU1RfVFJJR0dFUl9SQVRJTykpO1xyXG4gICAgY29uc3QgdGF1TXMgPSB1c2VGYXN0VGF1ID8gTEFURU5DWV9GQVNUX1RBVV9NUyA6IExBVEVOQ1lfU01PT1RIX1RBVV9NUztcclxuICAgIGNvbnN0IGFscGhhID0gMSAtIE1hdGguZXhwKC1kZWx0YU1zIC8gdGF1TXMpO1xyXG4gICAgaWYgKHNtb290aGVkTGF0ZW5jeU1zLnZhbHVlID09IG51bGwgfHwgIU51bWJlci5pc0Zpbml0ZShzbW9vdGhlZExhdGVuY3lNcy52YWx1ZSkpIHtcclxuICAgICAgc21vb3RoZWRMYXRlbmN5TXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNtb290aGVkTGF0ZW5jeU1zLnZhbHVlID0gc21vb3RoZWRMYXRlbmN5TXMudmFsdWUgKyBhbHBoYSAqICh2YWx1ZSAtIHNtb290aGVkTGF0ZW5jeU1zLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGxhc3RMYXRlbmN5U2FtcGxlQXQgPSBub3c7XHJcbiAgICBsYXRlbmN5U2FtcGxlcy52YWx1ZS5wdXNoKHsgdHM6IG5vdywgdmFsdWUgfSk7XHJcbiAgICBjb25zdCBjdXRvZmYgPSBub3cgLSBMQVRFTkNZX1NBTVBMRV9XSU5ET1dfTVM7XHJcbiAgICB3aGlsZSAobGF0ZW5jeVNhbXBsZXMudmFsdWUubGVuZ3RoICYmIChsYXRlbmN5U2FtcGxlcy52YWx1ZVswXT8udHMgPz8gSW5maW5pdHkpIDwgY3V0b2ZmKSB7XHJcbiAgICAgIGxhdGVuY3lTYW1wbGVzLnZhbHVlLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuKTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IHN0YXRzLnZhbHVlLnZpZGVvRnBzLFxyXG4gICh2YWx1ZSkgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgfHwgdmFsdWUgPD0gMCkgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IGxhc3RBdCA9IGxhc3RWaWRlb0Zwc1NhbXBsZUF0ID8/IG5vdztcclxuICAgIGNvbnN0IGRlbHRhTXMgPSBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpO1xyXG4gICAgY29uc3QgYWxwaGEgPSAxIC0gTWF0aC5leHAoLWRlbHRhTXMgLyBWSURFT19GUFNfU01PT1RIX1RBVV9NUyk7XHJcbiAgICBpZiAoc21vb3RoZWRWaWRlb0Zwcy52YWx1ZSA9PSBudWxsIHx8ICFOdW1iZXIuaXNGaW5pdGUoc21vb3RoZWRWaWRlb0Zwcy52YWx1ZSkpIHtcclxuICAgICAgc21vb3RoZWRWaWRlb0Zwcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc21vb3RoZWRWaWRlb0Zwcy52YWx1ZSA9IHNtb290aGVkVmlkZW9GcHMudmFsdWUgKyBhbHBoYSAqICh2YWx1ZSAtIHNtb290aGVkVmlkZW9GcHMudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgbGFzdFZpZGVvRnBzU2FtcGxlQXQgPSBub3c7XHJcbiAgfSxcclxuKTtcclxuXHJcbmNvbnN0IG92ZXJsYXlMaW5lcyA9IGNvbXB1dGVkKCgpID0+IHtcclxuICBjb25zdCBmcHMgPSBkaXNwbGF5VmlkZW9GcHMudmFsdWUgPyBkaXNwbGF5VmlkZW9GcHMudmFsdWUudG9GaXhlZCgwKSA6ICctLSc7XHJcbiAgY29uc3QgYml0cmF0ZSA9IGZvcm1hdEticHMoc3RhdHMudmFsdWUudmlkZW9CaXRyYXRlS2Jwcyk7XHJcbiAgY29uc3QgbGF0ZW5jeSA9IGZvcm1hdE1zKHNtb290aGVkTGF0ZW5jeU1zLnZhbHVlKTtcclxuICBjb25zdCBkcm9wcGVkID0gc3RhdHMudmFsdWUudmlkZW9GcmFtZXNEcm9wcGVkID8/ICctLSc7XHJcbiAgY29uc3QgY29kZWMgPSBzdGF0cy52YWx1ZS52aWRlb0NvZGVjID8/ICctLSc7XHJcbiAgcmV0dXJuIFtcclxuICAgIGBGUFM6ICR7ZnBzfSB8IEJpdHJhdGU6ICR7Yml0cmF0ZX1gLFxyXG4gICAgYExhdGVuY3k6ICR7bGF0ZW5jeX0gfCBEcm9wcGVkOiAke2Ryb3BwZWR9YCxcclxuICAgIGBDb2RlYzogJHtjb2RlY30gfCBTaXplOiAke3ZpZGVvU2l6ZUxhYmVsLnZhbHVlfWAsXHJcbiAgXTtcclxufSk7XHJcblxyXG4vLyBWaWRlby9BdWRpbyBzdHJlYW0gaGFuZGxpbmdcclxubGV0IHZpZGVvU3RyZWFtOiBNZWRpYVN0cmVhbSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYXVkaW9TdHJlYW06IE1lZGlhU3RyZWFtIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhdWRpb0F1dG9wbGF5UmVxdWVzdGVkID0gZmFsc2U7XHJcbmxldCBhdWRpb1BsYXliYWNrVW5sb2NrZWQgPSBmYWxzZTtcclxubGV0IGxhc3RBdWRpb1BsYXlBdHRlbXB0QXRNcyA9IDA7XHJcbmxldCBsYXN0QXVkaW9QbGF5RXJyb3JBdE1zID0gMDtcclxubGV0IGF1ZGlvUGxheVJldHJ5VGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgYXVkaW9QbGF5UmV0cnlVbnRpbE1zOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IGRldGFjaElucHV0OiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxubGV0IGRldGFjaFZpZGVvRXZlbnRzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxubGV0IGRldGFjaFZpZGVvRnJhbWVzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxubGV0IGRldGFjaFZpZGVvUGFjaW5nOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxubGV0IGRldGFjaFZpZGVvRnVsbHNjcmVlbkV2ZW50czogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcbmxldCBzdG9wSW5ib3VuZFZpZGVvU3RhdHNUaW1lcjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcbmxldCBsYXN0VHJhY2tTbmFwc2hvdDogeyB2aWRlb1JlYWR5Pzogc3RyaW5nOyBhdWRpb1JlYWR5Pzogc3RyaW5nIH0gfCBudWxsID0gbnVsbDtcclxuXHJcbmNvbnN0IEFVRElPX1RBUkdFVF9CVUZGRVJfTVMgPSAyMDtcclxuY29uc3QgQVVESU9fVEFSR0VUX1BMQVlPVVRfTVMgPSAyMDtcclxuY29uc3QgQVVESU9fRFJBSU5fVEFSR0VUX01TID0gMTA7XHJcbmNvbnN0IEFVRElPX0RSQUlOX1BMQVlPVVRfTVMgPSAwO1xyXG5jb25zdCBBVURJT19EUkFJTl9UUklHR0VSX01TID0gNDU7XHJcbmNvbnN0IEFVRElPX0RSQUlOX1JFTEVBU0VfTVMgPSAyNTtcclxuY29uc3QgQVVESU9fRFJBSU5fU1VTVEFJTl9NUyA9IDgwMDtcclxuY29uc3QgQVVESU9fRFJBSU5fUkVMRUFTRV9TVVNUQUlOX01TID0gMTIwMDtcclxuY29uc3QgQVVESU9fQlVGRkVSX1JFU0VUX1RIUkVTSE9MRF9NUyA9IDEyMDtcclxuY29uc3QgQVVESU9fQlVGRkVSX1JFU0VUX1NVU1RBSU5fTVMgPSAzMDAwO1xyXG5jb25zdCBBVURJT19CVUZGRVJfUkVTRVRfQ09PTERPV05fTVMgPSAxNTAwMDtcclxuY29uc3QgVklERU9fQlVGRkVSX1JFU0VUX1RIUkVTSE9MRF9NUyA9IDEyMDtcclxuY29uc3QgVklERU9fUkVOREVSX1JFU0VUX1RIUkVTSE9MRF9NUyA9IDUwO1xyXG5jb25zdCBWSURFT19JTlRFUlZBTF9SRVNFVF9USFJFU0hPTERfTVMgPSA1MDtcclxuY29uc3QgVklERU9fQlVGRkVSX1JFU0VUX1NVU1RBSU5fTVMgPSAzMDAwO1xyXG5jb25zdCBWSURFT19CVUZGRVJfUkVTRVRfQ09PTERPV05fTVMgPSAxNTAwMDtcclxudHlwZSBWaWRlb0xhdGVuY3lQcm9maWxlID0ge1xyXG4gIGRyYWluU3VzdGFpbk1zOiBudW1iZXI7XHJcbiAgZHJhaW5SZWxlYXNlU3VzdGFpbk1zOiBudW1iZXI7XHJcbiAgc3RhcnR1cERyYWluTXM6IG51bWJlcjtcclxuICBzdGFydHVwUmVsZWFzZVN1c3RhaW5NczogbnVtYmVyO1xyXG4gIG1vZGVTd2l0Y2hEcmFpbk1zOiBudW1iZXI7XHJcbiAgcmlzZUd1YXJkTXM6IG51bWJlcjtcclxuICByaXNlTGltaXRNdWx0aXBsaWVyOiBudW1iZXI7XHJcbiAgcmlzZUxpbWl0TWluTXM6IG51bWJlcjtcclxuICBkcmFpbkZyYW1lUmVkdWN0aW9uOiBudW1iZXI7XHJcbiAgcGxheWJhY2tSYXRlTWF4OiBudW1iZXI7XHJcbiAgcGxheWJhY2tSYXRlQm9vc3RNYXg6IG51bWJlcjtcclxuICBwbGF5YmFja1JhdGVEZWNheVBlclNlYzogbnVtYmVyO1xyXG4gIHRhcmdldEZhbGxSYXRlTXNQZXJTZWM6IG51bWJlcjtcclxuICB0YXJnZXRSaXNlUmF0ZU1zUGVyU2VjOiBudW1iZXI7XHJcbiAgc3RhcnR1cFRhcmdldE1zOiBudW1iZXI7XHJcbiAgcnVuYXdheURyYWluVHJpZ2dlck1zPzogbnVtYmVyO1xyXG4gIHJ1bmF3YXlEcmFpblN1c3RhaW5Ncz86IG51bWJlcjtcclxuICBydW5hd2F5RHJhaW5XaW5kb3dNcz86IG51bWJlcjtcclxuICBydW5hd2F5UmVzZXRUaHJlc2hvbGRNcz86IG51bWJlcjtcclxuICBydW5hd2F5UmVzZXRTdXN0YWluTXM/OiBudW1iZXI7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBpc1NhZmFyaUJyb3dzZXIoKTogYm9vbGVhbiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCA/PyAnJztcclxuICAgIGNvbnN0IHZlbmRvciA9IG5hdmlnYXRvci52ZW5kb3IgPz8gJyc7XHJcbiAgICBpZiAoIS9cXGJzYWZhcmlcXC8vaS50ZXN0KHVhKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKCEvYXBwbGUvaS50ZXN0KHZlbmRvcikpIHJldHVybiBmYWxzZTtcclxuICAgIGlmICgvXFxiKGNocm9tZXxjaHJvbWl1bXxjcmlvc3xmeGlvc3xlZGdpb3N8ZWRnfG9wcnxvcGVyYSlcXGIvaS50ZXN0KHVhKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBERUZBVUxUX1ZJREVPX0xBVEVOQ1lfUFJPRklMRTogVmlkZW9MYXRlbmN5UHJvZmlsZSA9IHtcclxuICBkcmFpblN1c3RhaW5NczogMzUwLFxyXG4gIGRyYWluUmVsZWFzZVN1c3RhaW5NczogODAwLFxyXG4gIHN0YXJ0dXBEcmFpbk1zOiAyMDAwMCxcclxuICBzdGFydHVwUmVsZWFzZVN1c3RhaW5NczogMTAwMCxcclxuICBtb2RlU3dpdGNoRHJhaW5NczogODAwMCxcclxuICByaXNlR3VhcmRNczogNjAwMCxcclxuICByaXNlTGltaXRNdWx0aXBsaWVyOiAxLjUsXHJcbiAgcmlzZUxpbWl0TWluTXM6IDgsXHJcbiAgZHJhaW5GcmFtZVJlZHVjdGlvbjogMC41LFxyXG4gIHBsYXliYWNrUmF0ZU1heDogMS4xMixcclxuICBwbGF5YmFja1JhdGVCb29zdE1heDogMS4yLFxyXG4gIHBsYXliYWNrUmF0ZURlY2F5UGVyU2VjOiAwLjEyLFxyXG4gIHRhcmdldEZhbGxSYXRlTXNQZXJTZWM6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcclxuICB0YXJnZXRSaXNlUmF0ZU1zUGVyU2VjOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcbiAgc3RhcnR1cFRhcmdldE1zOiAwLFxyXG59O1xyXG5cclxuY29uc3QgU0FGQVJJX1ZJREVPX0xBVEVOQ1lfUFJPRklMRTogVmlkZW9MYXRlbmN5UHJvZmlsZSA9IHtcclxuICBkcmFpblN1c3RhaW5NczogMTgwLFxyXG4gIGRyYWluUmVsZWFzZVN1c3RhaW5NczogNTUwLFxyXG4gIHN0YXJ0dXBEcmFpbk1zOiAyNTAwMCxcclxuICBzdGFydHVwUmVsZWFzZVN1c3RhaW5NczogMTQwMCxcclxuICBtb2RlU3dpdGNoRHJhaW5NczogOTAwMCxcclxuICByaXNlR3VhcmRNczogMTAwMDAsXHJcbiAgcmlzZUxpbWl0TXVsdGlwbGllcjogMS4xLFxyXG4gIHJpc2VMaW1pdE1pbk1zOiA2LFxyXG4gIGRyYWluRnJhbWVSZWR1Y3Rpb246IDEuMCxcclxuICBwbGF5YmFja1JhdGVNYXg6IDEuMTYsXHJcbiAgcGxheWJhY2tSYXRlQm9vc3RNYXg6IDEuMjQsXHJcbiAgcGxheWJhY2tSYXRlRGVjYXlQZXJTZWM6IDAuMTUsXHJcbiAgdGFyZ2V0RmFsbFJhdGVNc1BlclNlYzogMjQwLFxyXG4gIHRhcmdldFJpc2VSYXRlTXNQZXJTZWM6IDgwLFxyXG4gIHN0YXJ0dXBUYXJnZXRNczogMCxcclxuICBydW5hd2F5RHJhaW5UcmlnZ2VyTXM6IDgwLFxyXG4gIHJ1bmF3YXlEcmFpblN1c3RhaW5NczogMjUwLFxyXG4gIHJ1bmF3YXlEcmFpbldpbmRvd01zOiAxMjAwMCxcclxuICBydW5hd2F5UmVzZXRUaHJlc2hvbGRNczogMTYwLFxyXG4gIHJ1bmF3YXlSZXNldFN1c3RhaW5NczogMTUwMCxcclxufTtcclxuXHJcbmNvbnN0IHNhZmFyaUxhdGVuY3lUdW5pbmdFbmFibGVkID0gaXNTYWZhcmlCcm93c2VyKCk7XHJcbmNvbnN0IHZpZGVvTGF0ZW5jeVByb2ZpbGU6IFZpZGVvTGF0ZW5jeVByb2ZpbGUgPSBzYWZhcmlMYXRlbmN5VHVuaW5nRW5hYmxlZFxyXG4gID8gU0FGQVJJX1ZJREVPX0xBVEVOQ1lfUFJPRklMRVxyXG4gIDogREVGQVVMVF9WSURFT19MQVRFTkNZX1BST0ZJTEU7XHJcbmxldCBhdWRpb0RyYWluT3ZlcmxvYWRlZFNpbmNlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IGF1ZGlvRHJhaW5SZWxlYXNlU2luY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgYXVkaW9EcmFpbkFjdGl2ZSA9IGZhbHNlO1xyXG5sZXQgYXVkaW9CdWZmZXJPdmVybG9hZGVkU2luY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgbGFzdEF1ZGlvQnVmZmVyUmVzZXRBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmxldCB2aWRlb0RyYWluT3ZlcmxvYWRlZFNpbmNlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IHZpZGVvRHJhaW5SZWxlYXNlU2luY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgdmlkZW9EcmFpbk1vZGU6ICdvZmYnIHwgJ2FkYXB0aXZlJyB8ICdzdGFydHVwJyA9ICdvZmYnO1xyXG5sZXQgdmlkZW9CdWZmZXJPdmVybG9hZGVkU2luY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgbGFzdFZpZGVvQnVmZmVyUmVzZXRBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmxldCBsYXN0VmlkZW9UYXJnZXRNczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xyXG5sZXQgZGVzaXJlZFZpZGVvVGFyZ2V0TXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxubGV0IGVmZmVjdGl2ZVZpZGVvVGFyZ2V0TXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxubGV0IGxhc3RWaWRlb1RhcmdldEFkanVzdEF0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IHZpZGVvU3RhcnR1cERyYWluVW50aWw6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgdmlkZW9TdGFydHVwRHJhaW5SZWxlYXNlU2luY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5sZXQgbGFzdFZpZGVvUGxheW91dFNhbXBsZTogeyB0czogbnVtYmVyOyB2YWx1ZTogbnVtYmVyIH0gfCBudWxsID0gbnVsbDtcclxubGV0IGxhc3RQbGF5YmFja1JhdGVVcGRhdGVBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmxldCBtb2RlU3dpdGNoRHJhaW5VbnRpbDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmxldCBzYWZhcmlSdW5hd2F5RHJhaW5TaW5jZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmxldCBzYWZhcmlSdW5hd2F5RHJhaW5MYXRjaGVkID0gZmFsc2U7XHJcbmxldCBzYWZhcmlSdW5hd2F5UmVzZXRTaW5jZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG5mdW5jdGlvbiBzZXRBdWRpb0RyYWluQWN0aXZlKGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xyXG4gIGlmIChhdWRpb0RyYWluQWN0aXZlID09PSBhY3RpdmUpIHJldHVybjtcclxuICBhdWRpb0RyYWluQWN0aXZlID0gYWN0aXZlO1xyXG4gIGNsaWVudC5zZXRBdWRpb0xhdGVuY3lUYXJnZXRzKFxyXG4gICAgYWN0aXZlID8gQVVESU9fRFJBSU5fVEFSR0VUX01TIDogQVVESU9fVEFSR0VUX0JVRkZFUl9NUyxcclxuICAgIGFjdGl2ZSA/IEFVRElPX0RSQUlOX1BMQVlPVVRfTVMgOiBBVURJT19UQVJHRVRfUExBWU9VVF9NUyxcclxuICApO1xyXG4gIHB1c2hWaWRlb0V2ZW50KGFjdGl2ZSA/ICdhdWRpby1kcmFpbi1vbicgOiAnYXVkaW8tZHJhaW4tb2ZmJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0QXVkaW9EcmFpblN0YXRlKCk6IHZvaWQge1xyXG4gIGF1ZGlvRHJhaW5PdmVybG9hZGVkU2luY2UgPSBudWxsO1xyXG4gIGF1ZGlvRHJhaW5SZWxlYXNlU2luY2UgPSBudWxsO1xyXG4gIGlmIChhdWRpb0RyYWluQWN0aXZlKSB7XHJcbiAgICBzZXRBdWRpb0RyYWluQWN0aXZlKGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVWaWRlb0Jhc2VUYXJnZXRNcygpOiBudW1iZXIge1xyXG4gIGNvbnN0IGZwcyA9IHR5cGVvZiBjb25maWcuZnBzID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNGaW5pdGUoY29uZmlnLmZwcykgPyBjb25maWcuZnBzIDogNjA7XHJcbiAgY29uc3QgZnJhbWVzID0gY2xhbXBNYXhBZ2VGcmFtZXMoXHJcbiAgICBjb25maWcudmlkZW9NYXhGcmFtZUFnZUZyYW1lcyA/PyBudWxsLFxyXG4gICAgZnBzLFxyXG4gICAgKGNvbmZpZy52aWRlb1BhY2luZ01vZGUgYXMgUGFjaW5nTW9kZSB8IHVuZGVmaW5lZCkgPz8gJ2JhbGFuY2VkJyxcclxuICApO1xyXG4gIGNvbnN0IGZyb21GcmFtZXMgPSBtYXhGcmFtZUFnZU1zRnJvbUZyYW1lcyhmcHMsIGZyYW1lcyk7XHJcbiAgY29uc3QgZXhwbGljaXQgPVxyXG4gICAgdHlwZW9mIGNvbmZpZy52aWRlb01heEZyYW1lQWdlTXMgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZShjb25maWcudmlkZW9NYXhGcmFtZUFnZU1zKVxyXG4gICAgICA/IE1hdGgucm91bmQoY29uZmlnLnZpZGVvTWF4RnJhbWVBZ2VNcylcclxuICAgICAgOiBmcm9tRnJhbWVzO1xyXG4gIHJldHVybiBNYXRoLm1pbihNQVhfRlJBTUVfQUdFX01TLCBNYXRoLm1heChNSU5fRlJBTUVfQUdFX01TLCBleHBsaWNpdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlVmlkZW9EcmFpblRhcmdldE1zKGJhc2VUYXJnZXRNczogbnVtYmVyKTogbnVtYmVyIHtcclxuICBjb25zdCBmcHMgPSB0eXBlb2YgY29uZmlnLmZwcyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKGNvbmZpZy5mcHMpID8gY29uZmlnLmZwcyA6IDYwO1xyXG4gIGNvbnN0IGZyYW1lTXMgPSBtYXhGcmFtZUFnZU1zRnJvbUZyYW1lcyhmcHMsIDEpO1xyXG4gIHJldHVybiBNYXRoLm1heChcclxuICAgIE1JTl9GUkFNRV9BR0VfTVMsXHJcbiAgICBNYXRoLm1pbihNQVhfRlJBTUVfQUdFX01TLCBiYXNlVGFyZ2V0TXMgLSBmcmFtZU1zICogdmlkZW9MYXRlbmN5UHJvZmlsZS5kcmFpbkZyYW1lUmVkdWN0aW9uKSxcclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlVmlkZW9TdGFydHVwVGFyZ2V0TXMoKTogbnVtYmVyIHtcclxuICByZXR1cm4gdmlkZW9MYXRlbmN5UHJvZmlsZS5zdGFydHVwVGFyZ2V0TXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VmlkZW9UYXJnZXRNcyh0YXJnZXRNcz86IG51bWJlcik6IHZvaWQge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgY29uc3Qgbm9ybWFsaXplZFRhcmdldCA9XHJcbiAgICB0eXBlb2YgdGFyZ2V0TXMgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZSh0YXJnZXRNcylcclxuICAgICAgPyBNYXRoLm1pbihNQVhfRlJBTUVfQUdFX01TLCBNYXRoLm1heChNSU5fRlJBTUVfQUdFX01TLCB0YXJnZXRNcykpXHJcbiAgICAgIDogdW5kZWZpbmVkO1xyXG4gIGRlc2lyZWRWaWRlb1RhcmdldE1zID0gbm9ybWFsaXplZFRhcmdldDtcclxuXHJcbiAgaWYgKGRlc2lyZWRWaWRlb1RhcmdldE1zID09IG51bGwpIHtcclxuICAgIGVmZmVjdGl2ZVZpZGVvVGFyZ2V0TXMgPSB1bmRlZmluZWQ7XHJcbiAgICBsYXN0VmlkZW9UYXJnZXRBZGp1c3RBdCA9IG5vdztcclxuICAgIGlmIChsYXN0VmlkZW9UYXJnZXRNcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcbiAgICBsYXN0VmlkZW9UYXJnZXRNcyA9IHVuZGVmaW5lZDtcclxuICAgIGNsaWVudC5zZXRWaWRlb0xhdGVuY3lUYXJnZXQodW5kZWZpbmVkKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChlZmZlY3RpdmVWaWRlb1RhcmdldE1zID09IG51bGwgfHwgIU51bWJlci5pc0Zpbml0ZShlZmZlY3RpdmVWaWRlb1RhcmdldE1zKSkge1xyXG4gICAgZWZmZWN0aXZlVmlkZW9UYXJnZXRNcyA9IGRlc2lyZWRWaWRlb1RhcmdldE1zO1xyXG4gIH0gZWxzZSBpZiAoZWZmZWN0aXZlVmlkZW9UYXJnZXRNcyAhPT0gZGVzaXJlZFZpZGVvVGFyZ2V0TXMpIHtcclxuICAgIGNvbnN0IGxhc3RBdCA9IGxhc3RWaWRlb1RhcmdldEFkanVzdEF0ID8/IG5vdztcclxuICAgIGNvbnN0IGVsYXBzZWRNcyA9IE1hdGgubWF4KDEsIG5vdyAtIGxhc3RBdCk7XHJcbiAgICBjb25zdCBtb3ZpbmdEb3duID0gZGVzaXJlZFZpZGVvVGFyZ2V0TXMgPCBlZmZlY3RpdmVWaWRlb1RhcmdldE1zO1xyXG4gICAgY29uc3Qgc2xld1JhdGUgPSBtb3ZpbmdEb3duXHJcbiAgICAgID8gdmlkZW9MYXRlbmN5UHJvZmlsZS50YXJnZXRGYWxsUmF0ZU1zUGVyU2VjXHJcbiAgICAgIDogdmlkZW9MYXRlbmN5UHJvZmlsZS50YXJnZXRSaXNlUmF0ZU1zUGVyU2VjO1xyXG4gICAgY29uc3QgbWF4U3RlcCA9IE51bWJlci5pc0Zpbml0ZShzbGV3UmF0ZSlcclxuICAgICAgPyAoc2xld1JhdGUgKiBlbGFwc2VkTXMpIC8gMTAwMFxyXG4gICAgICA6IE1hdGguYWJzKGRlc2lyZWRWaWRlb1RhcmdldE1zIC0gZWZmZWN0aXZlVmlkZW9UYXJnZXRNcyk7XHJcblxyXG4gICAgaWYgKG1heFN0ZXAgPiAwKSB7XHJcbiAgICAgIGNvbnN0IGRlbHRhID0gZGVzaXJlZFZpZGVvVGFyZ2V0TXMgLSBlZmZlY3RpdmVWaWRlb1RhcmdldE1zO1xyXG4gICAgICBpZiAoTWF0aC5hYnMoZGVsdGEpIDw9IG1heFN0ZXApIHtcclxuICAgICAgICBlZmZlY3RpdmVWaWRlb1RhcmdldE1zID0gZGVzaXJlZFZpZGVvVGFyZ2V0TXM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWZmZWN0aXZlVmlkZW9UYXJnZXRNcyArPSBNYXRoLnNpZ24oZGVsdGEpICogbWF4U3RlcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGFzdFZpZGVvVGFyZ2V0QWRqdXN0QXQgPSBub3c7XHJcbiAgY29uc3QgbmV4dFRhcmdldE1zID0gTWF0aC5yb3VuZChlZmZlY3RpdmVWaWRlb1RhcmdldE1zKTtcclxuICBpZiAobGFzdFZpZGVvVGFyZ2V0TXMgPT09IG5leHRUYXJnZXRNcykgcmV0dXJuO1xyXG4gIGxhc3RWaWRlb1RhcmdldE1zID0gbmV4dFRhcmdldE1zO1xyXG4gIGNsaWVudC5zZXRWaWRlb0xhdGVuY3lUYXJnZXQobmV4dFRhcmdldE1zKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0VmlkZW9EcmFpbk1vZGUoXHJcbiAgbW9kZTogJ29mZicgfCAnYWRhcHRpdmUnIHwgJ3N0YXJ0dXAnLFxyXG4gIGJhc2VUYXJnZXRNczogbnVtYmVyLFxyXG4gIG92ZXJyaWRlVGFyZ2V0TXM/OiBudW1iZXIsXHJcbik6IHZvaWQge1xyXG4gIGNvbnN0IHRhcmdldCA9XHJcbiAgICBtb2RlID09PSAnb2ZmJyA/IGJhc2VUYXJnZXRNcyA6IChvdmVycmlkZVRhcmdldE1zID8/IHJlc29sdmVWaWRlb0RyYWluVGFyZ2V0TXMoYmFzZVRhcmdldE1zKSk7XHJcbiAgaWYgKHZpZGVvRHJhaW5Nb2RlID09PSBtb2RlKSB7XHJcbiAgICBhcHBseVZpZGVvVGFyZ2V0TXModGFyZ2V0KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgdmlkZW9EcmFpbk1vZGUgPSBtb2RlO1xyXG4gIGFwcGx5VmlkZW9UYXJnZXRNcyh0YXJnZXQpO1xyXG4gIGlmIChtb2RlID09PSAnc3RhcnR1cCcpIHtcclxuICAgIHB1c2hWaWRlb0V2ZW50KCd2aWRlby1kcmFpbi1zdGFydHVwLW9uJyk7XHJcbiAgfSBlbHNlIGlmIChtb2RlID09PSAnYWRhcHRpdmUnKSB7XHJcbiAgICBwdXNoVmlkZW9FdmVudCgndmlkZW8tZHJhaW4tb24nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcHVzaFZpZGVvRXZlbnQoJ3ZpZGVvLWRyYWluLW9mZicpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRWaWRlb0RyYWluU3RhdGUoKTogdm9pZCB7XHJcbiAgdmlkZW9EcmFpbk92ZXJsb2FkZWRTaW5jZSA9IG51bGw7XHJcbiAgdmlkZW9EcmFpblJlbGVhc2VTaW5jZSA9IG51bGw7XHJcbiAgdmlkZW9TdGFydHVwRHJhaW5VbnRpbCA9IG51bGw7XHJcbiAgdmlkZW9TdGFydHVwRHJhaW5SZWxlYXNlU2luY2UgPSBudWxsO1xyXG4gIGxhc3RWaWRlb1BsYXlvdXRTYW1wbGUgPSBudWxsO1xyXG4gIHNhZmFyaVJ1bmF3YXlEcmFpblNpbmNlID0gbnVsbDtcclxuICBzYWZhcmlSdW5hd2F5RHJhaW5MYXRjaGVkID0gZmFsc2U7XHJcbiAgc2FmYXJpUnVuYXdheVJlc2V0U2luY2UgPSBudWxsO1xyXG4gIGNvbnN0IGJhc2VUYXJnZXRNcyA9IHJlc29sdmVWaWRlb0Jhc2VUYXJnZXRNcygpO1xyXG4gIHNldFZpZGVvRHJhaW5Nb2RlKCdvZmYnLCBiYXNlVGFyZ2V0TXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmlnZ2VyVmlkZW9EcmFpbldpbmRvdyhkdXJhdGlvbk1zOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYgKCFpc0Nvbm5lY3RlZC52YWx1ZSkgcmV0dXJuO1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgY29uc3QgdW50aWwgPSBub3cgKyBNYXRoLm1heCgwLCBkdXJhdGlvbk1zKTtcclxuICB2aWRlb1N0YXJ0dXBEcmFpblVudGlsID1cclxuICAgIHZpZGVvU3RhcnR1cERyYWluVW50aWwgIT0gbnVsbCA/IE1hdGgubWF4KHZpZGVvU3RhcnR1cERyYWluVW50aWwsIHVudGlsKSA6IHVudGlsO1xyXG4gIHZpZGVvU3RhcnR1cERyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICBjb25zdCBiYXNlVGFyZ2V0TXMgPSByZXNvbHZlVmlkZW9CYXNlVGFyZ2V0TXMoKTtcclxuICBzZXRWaWRlb0RyYWluTW9kZSgnc3RhcnR1cCcsIGJhc2VUYXJnZXRNcywgcmVzb2x2ZVZpZGVvU3RhcnR1cFRhcmdldE1zKCkpO1xyXG4gIHB1c2hWaWRlb0V2ZW50KGB2aWRlby1kcmFpbi0ke3JlYXNvbn1gKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0VmlkZW9QbGF5YmFja1JhdGUocmF0ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgY29uc3QgZWwgPSB2aWRlb0VsLnZhbHVlO1xyXG4gIGlmICghZWwpIHJldHVybjtcclxuICBjb25zdCBjbGFtcGVkID0gTWF0aC5tYXgoMSwgTWF0aC5taW4odmlkZW9MYXRlbmN5UHJvZmlsZS5wbGF5YmFja1JhdGVCb29zdE1heCwgcmF0ZSkpO1xyXG4gIGlmIChNYXRoLmFicygoZWwucGxheWJhY2tSYXRlID8/IDEpIC0gY2xhbXBlZCkgPCAwLjAwMSkgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBlbC5wbGF5YmFja1JhdGUgPSBjbGFtcGVkO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlICovXHJcbiAgfVxyXG59XHJcblxyXG53YXRjaChcclxuICAoKSA9PiBzdGF0cy52YWx1ZS5hdWRpb0ppdHRlckJ1ZmZlck1zLFxyXG4gIChhdWRpb1ZhbHVlKSA9PiB7XHJcbiAgICBpZiAoIWlzQ29ubmVjdGVkLnZhbHVlIHx8ICFpc1RhYkFjdGl2ZSgpKSB7XHJcbiAgICAgIHJlc2V0QXVkaW9EcmFpblN0YXRlKCk7XHJcbiAgICAgIGF1ZGlvQnVmZmVyT3ZlcmxvYWRlZFNpbmNlID0gbnVsbDtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBhdWRpb1ZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKGF1ZGlvVmFsdWUpKSByZXR1cm47XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKGF1ZGlvVmFsdWUgPj0gQVVESU9fRFJBSU5fVFJJR0dFUl9NUykge1xyXG4gICAgICBpZiAoYXVkaW9EcmFpbk92ZXJsb2FkZWRTaW5jZSA9PSBudWxsKSB7XHJcbiAgICAgICAgYXVkaW9EcmFpbk92ZXJsb2FkZWRTaW5jZSA9IG5vdztcclxuICAgICAgfVxyXG4gICAgICBhdWRpb0RyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICAgICAgaWYgKCFhdWRpb0RyYWluQWN0aXZlICYmIG5vdyAtIGF1ZGlvRHJhaW5PdmVybG9hZGVkU2luY2UgPj0gQVVESU9fRFJBSU5fU1VTVEFJTl9NUykge1xyXG4gICAgICAgIHNldEF1ZGlvRHJhaW5BY3RpdmUodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoYXVkaW9EcmFpbkFjdGl2ZSAmJiBhdWRpb1ZhbHVlIDw9IEFVRElPX0RSQUlOX1JFTEVBU0VfTVMpIHtcclxuICAgICAgaWYgKGF1ZGlvRHJhaW5SZWxlYXNlU2luY2UgPT0gbnVsbCkge1xyXG4gICAgICAgIGF1ZGlvRHJhaW5SZWxlYXNlU2luY2UgPSBub3c7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG5vdyAtIGF1ZGlvRHJhaW5SZWxlYXNlU2luY2UgPj0gQVVESU9fRFJBSU5fUkVMRUFTRV9TVVNUQUlOX01TKSB7XHJcbiAgICAgICAgc2V0QXVkaW9EcmFpbkFjdGl2ZShmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGF1ZGlvRHJhaW5PdmVybG9hZGVkU2luY2UgPSBudWxsO1xyXG4gICAgICBhdWRpb0RyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdWRpb092ZXJsb2FkZWQgPSBhdWRpb1ZhbHVlID49IEFVRElPX0JVRkZFUl9SRVNFVF9USFJFU0hPTERfTVM7XHJcbiAgICBpZiAoIWF1ZGlvT3ZlcmxvYWRlZCkge1xyXG4gICAgICBhdWRpb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9IG51bGw7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChhdWRpb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9PSBudWxsKSB7XHJcbiAgICAgIGF1ZGlvQnVmZmVyT3ZlcmxvYWRlZFNpbmNlID0gbm93O1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAobm93IC0gYXVkaW9CdWZmZXJPdmVybG9hZGVkU2luY2UgPCBBVURJT19CVUZGRVJfUkVTRVRfU1VTVEFJTl9NUykgcmV0dXJuO1xyXG4gICAgaWYgKFxyXG4gICAgICBsYXN0QXVkaW9CdWZmZXJSZXNldEF0ICE9IG51bGwgJiZcclxuICAgICAgbm93IC0gbGFzdEF1ZGlvQnVmZmVyUmVzZXRBdCA8IEFVRElPX0JVRkZFUl9SRVNFVF9DT09MRE9XTl9NU1xyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxhc3RBdWRpb0J1ZmZlclJlc2V0QXQgPSBub3c7XHJcbiAgICBhdWRpb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9IG51bGw7XHJcbiAgICBwdXNoVmlkZW9FdmVudCgnYXVkaW8tYnVmZmVyLXJlc2V0Jyk7XHJcbiAgICByZXNldEF1ZGlvRWxlbWVudCgpO1xyXG4gIH0sXHJcbik7XHJcblxyXG53YXRjaChcclxuICAoKSA9PiB2aWRlb1BsYXlvdXREZWxheU1zLnZhbHVlLFxyXG4gICh2aWRlb1ZhbHVlKSA9PiB7XHJcbiAgICBpZiAoIWlzQ29ubmVjdGVkLnZhbHVlIHx8ICFpc1RhYkFjdGl2ZSgpKSB7XHJcbiAgICAgIHJlc2V0VmlkZW9EcmFpblN0YXRlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdmlkZW9WYWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2aWRlb1ZhbHVlKSkgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IGJhc2VUYXJnZXRNcyA9IHJlc29sdmVWaWRlb0Jhc2VUYXJnZXRNcygpO1xyXG4gICAgY29uc3QgZnBzID0gdHlwZW9mIGNvbmZpZy5mcHMgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZShjb25maWcuZnBzKSA/IGNvbmZpZy5mcHMgOiA2MDtcclxuICAgIGNvbnN0IGZyYW1lTXMgPSBtYXhGcmFtZUFnZU1zRnJvbUZyYW1lcyhmcHMsIDEpO1xyXG4gICAgaWYgKHNhZmFyaUxhdGVuY3lUdW5pbmdFbmFibGVkKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmlkZW9MYXRlbmN5UHJvZmlsZS5ydW5hd2F5RHJhaW5UcmlnZ2VyTXMgPT09ICdudW1iZXInICYmXHJcbiAgICAgICAgdmlkZW9WYWx1ZSA+PSB2aWRlb0xhdGVuY3lQcm9maWxlLnJ1bmF3YXlEcmFpblRyaWdnZXJNc1xyXG4gICAgICApIHtcclxuICAgICAgICBpZiAoc2FmYXJpUnVuYXdheURyYWluU2luY2UgPT0gbnVsbCkge1xyXG4gICAgICAgICAgc2FmYXJpUnVuYXdheURyYWluU2luY2UgPSBub3c7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICFzYWZhcmlSdW5hd2F5RHJhaW5MYXRjaGVkICYmXHJcbiAgICAgICAgICB0eXBlb2YgdmlkZW9MYXRlbmN5UHJvZmlsZS5ydW5hd2F5RHJhaW5TdXN0YWluTXMgPT09ICdudW1iZXInICYmXHJcbiAgICAgICAgICBub3cgLSBzYWZhcmlSdW5hd2F5RHJhaW5TaW5jZSA+PSB2aWRlb0xhdGVuY3lQcm9maWxlLnJ1bmF3YXlEcmFpblN1c3RhaW5Nc1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgc2FmYXJpUnVuYXdheURyYWluTGF0Y2hlZCA9IHRydWU7XHJcbiAgICAgICAgICB0cmlnZ2VyVmlkZW9EcmFpbldpbmRvdyhcclxuICAgICAgICAgICAgdmlkZW9MYXRlbmN5UHJvZmlsZS5ydW5hd2F5RHJhaW5XaW5kb3dNcyA/PyB2aWRlb0xhdGVuY3lQcm9maWxlLnN0YXJ0dXBEcmFpbk1zLFxyXG4gICAgICAgICAgICAncnVuYXdheScsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICh2aWRlb1ZhbHVlIDw9IGJhc2VUYXJnZXRNcyArIGZyYW1lTXMpIHtcclxuICAgICAgICBzYWZhcmlSdW5hd2F5RHJhaW5TaW5jZSA9IG51bGw7XHJcbiAgICAgICAgc2FmYXJpUnVuYXdheURyYWluTGF0Y2hlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgdHlwZW9mIHZpZGVvTGF0ZW5jeVByb2ZpbGUucnVuYXdheVJlc2V0VGhyZXNob2xkTXMgPT09ICdudW1iZXInICYmXHJcbiAgICAgICAgdmlkZW9WYWx1ZSA+PSB2aWRlb0xhdGVuY3lQcm9maWxlLnJ1bmF3YXlSZXNldFRocmVzaG9sZE1zXHJcbiAgICAgICkge1xyXG4gICAgICAgIGlmIChzYWZhcmlSdW5hd2F5UmVzZXRTaW5jZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICBzYWZhcmlSdW5hd2F5UmVzZXRTaW5jZSA9IG5vdztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdHlwZW9mIHZpZGVvTGF0ZW5jeVByb2ZpbGUucnVuYXdheVJlc2V0U3VzdGFpbk1zID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICAgICAgbm93IC0gc2FmYXJpUnVuYXdheVJlc2V0U2luY2UgPj0gdmlkZW9MYXRlbmN5UHJvZmlsZS5ydW5hd2F5UmVzZXRTdXN0YWluTXNcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgbGFzdFZpZGVvQnVmZmVyUmVzZXRBdCA9PSBudWxsIHx8XHJcbiAgICAgICAgICAgIG5vdyAtIGxhc3RWaWRlb0J1ZmZlclJlc2V0QXQgPj0gVklERU9fQlVGRkVSX1JFU0VUX0NPT0xET1dOX01TXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgbGFzdFZpZGVvQnVmZmVyUmVzZXRBdCA9IG5vdztcclxuICAgICAgICAgICAgc2FmYXJpUnVuYXdheVJlc2V0U2luY2UgPSBudWxsO1xyXG4gICAgICAgICAgICBwdXNoVmlkZW9FdmVudCgndmlkZW8tcnVuYXdheS1yZXNldCcpO1xyXG4gICAgICAgICAgICByZXNldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyVmlkZW9EcmFpbldpbmRvdyhcclxuICAgICAgICAgICAgICB2aWRlb0xhdGVuY3lQcm9maWxlLnJ1bmF3YXlEcmFpbldpbmRvd01zID8/IHZpZGVvTGF0ZW5jeVByb2ZpbGUuc3RhcnR1cERyYWluTXMsXHJcbiAgICAgICAgICAgICAgJ3J1bmF3YXktcmVzZXQnLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzYWZhcmlSdW5hd2F5UmVzZXRTaW5jZSA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChsYXN0VmlkZW9QbGF5b3V0U2FtcGxlKSB7XHJcbiAgICAgIGNvbnN0IGRlbHRhTXMgPSBub3cgLSBsYXN0VmlkZW9QbGF5b3V0U2FtcGxlLnRzO1xyXG4gICAgICBjb25zdCBkZWx0YVZhbHVlID0gdmlkZW9WYWx1ZSAtIGxhc3RWaWRlb1BsYXlvdXRTYW1wbGUudmFsdWU7XHJcbiAgICAgIGlmIChkZWx0YU1zID4gMCAmJiBkZWx0YVZhbHVlID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHJpc2VSYXRlID0gKGRlbHRhVmFsdWUgKiAxMDAwKSAvIGRlbHRhTXM7XHJcbiAgICAgICAgY29uc3QgcmlzZUxpbWl0ID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICB2aWRlb0xhdGVuY3lQcm9maWxlLnJpc2VMaW1pdE1pbk1zLFxyXG4gICAgICAgICAgZnJhbWVNcyAqIHZpZGVvTGF0ZW5jeVByb2ZpbGUucmlzZUxpbWl0TXVsdGlwbGllcixcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChyaXNlUmF0ZSA+IHJpc2VMaW1pdCAmJiB2aWRlb1ZhbHVlID4gYmFzZVRhcmdldE1zICsgZnJhbWVNcykge1xyXG4gICAgICAgICAgY29uc3QgdW50aWwgPSBub3cgKyB2aWRlb0xhdGVuY3lQcm9maWxlLnJpc2VHdWFyZE1zO1xyXG4gICAgICAgICAgdmlkZW9TdGFydHVwRHJhaW5VbnRpbCA9XHJcbiAgICAgICAgICAgIHZpZGVvU3RhcnR1cERyYWluVW50aWwgIT0gbnVsbCA/IE1hdGgubWF4KHZpZGVvU3RhcnR1cERyYWluVW50aWwsIHVudGlsKSA6IHVudGlsO1xyXG4gICAgICAgICAgdmlkZW9TdGFydHVwRHJhaW5SZWxlYXNlU2luY2UgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGFzdFZpZGVvUGxheW91dFNhbXBsZSA9IHsgdHM6IG5vdywgdmFsdWU6IHZpZGVvVmFsdWUgfTtcclxuXHJcbiAgICBpZiAodmlkZW9FbC52YWx1ZSkge1xyXG4gICAgICBjb25zdCBsYXN0QXQgPSBsYXN0UGxheWJhY2tSYXRlVXBkYXRlQXQgPz8gbm93O1xyXG4gICAgICBjb25zdCBkZWx0YU1zID0gTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KTtcclxuICAgICAgbGFzdFBsYXliYWNrUmF0ZVVwZGF0ZUF0ID0gbm93O1xyXG5cclxuICAgICAgY29uc3QgZXJyb3JNcyA9IE1hdGgubWF4KDAsIHZpZGVvVmFsdWUgLSAoYmFzZVRhcmdldE1zICsgZnJhbWVNcykpO1xyXG4gICAgICBjb25zdCBib29zdEFjdGl2ZSA9IG1vZGVTd2l0Y2hEcmFpblVudGlsICE9IG51bGwgJiYgbm93IDw9IG1vZGVTd2l0Y2hEcmFpblVudGlsO1xyXG4gICAgICBpZiAoYm9vc3RBY3RpdmUpIHtcclxuICAgICAgICBjb25zdCBib29zdGVkID1cclxuICAgICAgICAgIDEgK1xyXG4gICAgICAgICAgTWF0aC5taW4oXHJcbiAgICAgICAgICAgIHZpZGVvTGF0ZW5jeVByb2ZpbGUucGxheWJhY2tSYXRlQm9vc3RNYXggLSAxLFxyXG4gICAgICAgICAgICBlcnJvck1zIC8gTWF0aC5tYXgoMSwgZnJhbWVNcyAqIDYpLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBzZXRWaWRlb1BsYXliYWNrUmF0ZShcclxuICAgICAgICAgIE1hdGgubWluKHZpZGVvTGF0ZW5jeVByb2ZpbGUucGxheWJhY2tSYXRlQm9vc3RNYXgsIE1hdGgubWF4KDEsIGJvb3N0ZWQpKSxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yTXMgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgZGVzaXJlZCA9XHJcbiAgICAgICAgICAxICtcclxuICAgICAgICAgIE1hdGgubWluKHZpZGVvTGF0ZW5jeVByb2ZpbGUucGxheWJhY2tSYXRlTWF4IC0gMSwgZXJyb3JNcyAvIE1hdGgubWF4KDEsIGZyYW1lTXMgKiAxMCkpO1xyXG4gICAgICAgIHNldFZpZGVvUGxheWJhY2tSYXRlKE1hdGgubWluKHZpZGVvTGF0ZW5jeVByb2ZpbGUucGxheWJhY2tSYXRlTWF4LCBNYXRoLm1heCgxLCBkZXNpcmVkKSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB2aWRlb0VsLnZhbHVlLnBsYXliYWNrUmF0ZSA/PyAxO1xyXG4gICAgICAgIGlmIChjdXJyZW50ID4gMSAmJiBkZWx0YU1zID4gMCkge1xyXG4gICAgICAgICAgY29uc3QgZGVjYXkgPSAodmlkZW9MYXRlbmN5UHJvZmlsZS5wbGF5YmFja1JhdGVEZWNheVBlclNlYyAqIGRlbHRhTXMpIC8gMTAwMDtcclxuICAgICAgICAgIHNldFZpZGVvUGxheWJhY2tSYXRlKE1hdGgubWF4KDEsIGN1cnJlbnQgLSBkZWNheSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZXRWaWRlb1BsYXliYWNrUmF0ZSgxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh2aWRlb1N0YXJ0dXBEcmFpblVudGlsICE9IG51bGwpIHtcclxuICAgICAgaWYgKG5vdyA+IHZpZGVvU3RhcnR1cERyYWluVW50aWwpIHtcclxuICAgICAgICB2aWRlb1N0YXJ0dXBEcmFpblVudGlsID0gbnVsbDtcclxuICAgICAgICB2aWRlb1N0YXJ0dXBEcmFpblJlbGVhc2VTaW5jZSA9IG51bGw7XHJcbiAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ29mZicsIGJhc2VUYXJnZXRNcyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnR1cFRhcmdldE1zID0gcmVzb2x2ZVZpZGVvU3RhcnR1cFRhcmdldE1zKCk7XHJcbiAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ3N0YXJ0dXAnLCBiYXNlVGFyZ2V0TXMsIHN0YXJ0dXBUYXJnZXRNcyk7XHJcbiAgICAgICAgaWYgKHZpZGVvVmFsdWUgPD0gYmFzZVRhcmdldE1zICsgZnJhbWVNcykge1xyXG4gICAgICAgICAgaWYgKHZpZGVvU3RhcnR1cERyYWluUmVsZWFzZVNpbmNlID09IG51bGwpIHtcclxuICAgICAgICAgICAgdmlkZW9TdGFydHVwRHJhaW5SZWxlYXNlU2luY2UgPSBub3c7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICBub3cgLSB2aWRlb1N0YXJ0dXBEcmFpblJlbGVhc2VTaW5jZSA+PVxyXG4gICAgICAgICAgICB2aWRlb0xhdGVuY3lQcm9maWxlLnN0YXJ0dXBSZWxlYXNlU3VzdGFpbk1zXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgdmlkZW9TdGFydHVwRHJhaW5VbnRpbCA9IG51bGw7XHJcbiAgICAgICAgICAgIHZpZGVvU3RhcnR1cERyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICAgICAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ29mZicsIGJhc2VUYXJnZXRNcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZpZGVvU3RhcnR1cERyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCB0cmlnZ2VyTXMgPSBNYXRoLm1heChiYXNlVGFyZ2V0TXMgKyBmcmFtZU1zLCBmcmFtZU1zICogMik7XHJcbiAgICBjb25zdCByZWxlYXNlTXMgPSBNYXRoLm1heChiYXNlVGFyZ2V0TXMgKyBmcmFtZU1zICogMC41LCBmcmFtZU1zKTtcclxuXHJcbiAgICBpZiAodmlkZW9WYWx1ZSA+PSB0cmlnZ2VyTXMpIHtcclxuICAgICAgaWYgKHZpZGVvRHJhaW5PdmVybG9hZGVkU2luY2UgPT0gbnVsbCkge1xyXG4gICAgICAgIHZpZGVvRHJhaW5PdmVybG9hZGVkU2luY2UgPSBub3c7XHJcbiAgICAgIH1cclxuICAgICAgdmlkZW9EcmFpblJlbGVhc2VTaW5jZSA9IG51bGw7XHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlb0RyYWluTW9kZSAhPT0gJ2FkYXB0aXZlJyAmJlxyXG4gICAgICAgIG5vdyAtIHZpZGVvRHJhaW5PdmVybG9hZGVkU2luY2UgPj0gdmlkZW9MYXRlbmN5UHJvZmlsZS5kcmFpblN1c3RhaW5Nc1xyXG4gICAgICApIHtcclxuICAgICAgICBzZXRWaWRlb0RyYWluTW9kZSgnYWRhcHRpdmUnLCBiYXNlVGFyZ2V0TXMpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHZpZGVvRHJhaW5Nb2RlID09PSAnYWRhcHRpdmUnICYmIHZpZGVvVmFsdWUgPD0gcmVsZWFzZU1zKSB7XHJcbiAgICAgIGlmICh2aWRlb0RyYWluUmVsZWFzZVNpbmNlID09IG51bGwpIHtcclxuICAgICAgICB2aWRlb0RyYWluUmVsZWFzZVNpbmNlID0gbm93O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChub3cgLSB2aWRlb0RyYWluUmVsZWFzZVNpbmNlID49IHZpZGVvTGF0ZW5jeVByb2ZpbGUuZHJhaW5SZWxlYXNlU3VzdGFpbk1zKSB7XHJcbiAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ29mZicsIGJhc2VUYXJnZXRNcyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZpZGVvRHJhaW5PdmVybG9hZGVkU2luY2UgPSBudWxsO1xyXG4gICAgICB2aWRlb0RyYWluUmVsZWFzZVNpbmNlID0gbnVsbDtcclxuICAgICAgaWYgKHZpZGVvRHJhaW5Nb2RlICE9PSAnYWRhcHRpdmUnKSB7XHJcbiAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ29mZicsIGJhc2VUYXJnZXRNcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4pO1xyXG5cclxud2F0Y2goXHJcbiAgKCkgPT4gc3RhdHMudmFsdWUudmlkZW9KaXR0ZXJCdWZmZXJNcyxcclxuICAodmlkZW9WYWx1ZSkgPT4ge1xyXG4gICAgaWYgKCFpc0Nvbm5lY3RlZC52YWx1ZSB8fCAhaXNUYWJBY3RpdmUoKSkge1xyXG4gICAgICB2aWRlb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9IG51bGw7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZpZGVvT3ZlcmxvYWRlZCA9XHJcbiAgICAgIHR5cGVvZiB2aWRlb1ZhbHVlID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICBOdW1iZXIuaXNGaW5pdGUodmlkZW9WYWx1ZSkgJiZcclxuICAgICAgdmlkZW9WYWx1ZSA+PSBWSURFT19CVUZGRVJfUkVTRVRfVEhSRVNIT0xEX01TO1xyXG4gICAgaWYgKCF2aWRlb092ZXJsb2FkZWQpIHtcclxuICAgICAgdmlkZW9CdWZmZXJPdmVybG9hZGVkU2luY2UgPSBudWxsO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWxheVZhbHVlID0gcmVuZGVyRGVsYXlNcy52YWx1ZTtcclxuICAgIGNvbnN0IGludGVydmFsVmFsdWUgPSByZW5kZXJJbnRlcnZhbE1zLnZhbHVlO1xyXG4gICAgY29uc3QgaGFzUmVuZGVyU2lnbmFsID0gdHlwZW9mIGRlbGF5VmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiBpbnRlcnZhbFZhbHVlID09PSAnbnVtYmVyJztcclxuICAgIGNvbnN0IHJlbmRlckRlbGF5SGlnaCA9XHJcbiAgICAgIHR5cGVvZiBkZWxheVZhbHVlID09PSAnbnVtYmVyJyAmJiBkZWxheVZhbHVlID49IFZJREVPX1JFTkRFUl9SRVNFVF9USFJFU0hPTERfTVM7XHJcbiAgICBjb25zdCByZW5kZXJJbnRlcnZhbEhpZ2ggPVxyXG4gICAgICB0eXBlb2YgaW50ZXJ2YWxWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW50ZXJ2YWxWYWx1ZSA+PSBWSURFT19JTlRFUlZBTF9SRVNFVF9USFJFU0hPTERfTVM7XHJcbiAgICBjb25zdCBhbGxvd1ZpZGVvUmVzZXQgPSAhaGFzUmVuZGVyU2lnbmFsIHx8IHJlbmRlckRlbGF5SGlnaCB8fCByZW5kZXJJbnRlcnZhbEhpZ2g7XHJcbiAgICBpZiAoIWFsbG93VmlkZW9SZXNldCkgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmICh2aWRlb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9PSBudWxsKSB7XHJcbiAgICAgIHZpZGVvQnVmZmVyT3ZlcmxvYWRlZFNpbmNlID0gbm93O1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAobm93IC0gdmlkZW9CdWZmZXJPdmVybG9hZGVkU2luY2UgPCBWSURFT19CVUZGRVJfUkVTRVRfU1VTVEFJTl9NUykgcmV0dXJuO1xyXG4gICAgaWYgKFxyXG4gICAgICBsYXN0VmlkZW9CdWZmZXJSZXNldEF0ICE9IG51bGwgJiZcclxuICAgICAgbm93IC0gbGFzdFZpZGVvQnVmZmVyUmVzZXRBdCA8IFZJREVPX0JVRkZFUl9SRVNFVF9DT09MRE9XTl9NU1xyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxhc3RWaWRlb0J1ZmZlclJlc2V0QXQgPSBub3c7XHJcbiAgICB2aWRlb0J1ZmZlck92ZXJsb2FkZWRTaW5jZSA9IG51bGw7XHJcbiAgICBwdXNoVmlkZW9FdmVudCgndmlkZW8tYnVmZmVyLXJlc2V0Jyk7XHJcbiAgICByZXNldFZpZGVvRWxlbWVudCgpO1xyXG4gIH0sXHJcbik7XHJcbmZ1bmN0aW9uIHJlc2V0U2VydmVyUmF0ZXMoKTogdm9pZCB7XHJcbiAgbGFzdFNlcnZlclNhbXBsZSA9IG51bGw7XHJcbiAgc2VydmVyVmlkZW9GcHMudmFsdWUgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmxldCBzZXJ2ZXJTZXNzaW9uVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gc3RvcFNlcnZlclNlc3Npb25Qb2xsaW5nKCk6IHZvaWQge1xyXG4gIGlmIChzZXJ2ZXJTZXNzaW9uVGltZXIpIHtcclxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHNlcnZlclNlc3Npb25UaW1lcik7XHJcbiAgICBzZXJ2ZXJTZXNzaW9uVGltZXIgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRTZXJ2ZXJTZXNzaW9uUG9sbGluZygpOiB2b2lkIHtcclxuICBzdG9wU2VydmVyU2Vzc2lvblBvbGxpbmcoKTtcclxuICBpZiAoIXNlc3Npb25JZC52YWx1ZSkgcmV0dXJuO1xyXG4gIGNvbnN0IHBvbGwgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIXNlc3Npb25JZC52YWx1ZSkgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLmdldFNlc3Npb25TdGF0ZShzZXNzaW9uSWQudmFsdWUpO1xyXG4gICAgICBpZiAocmVzdWx0LnNlc3Npb24pIHtcclxuICAgICAgICBzZXJ2ZXJTZXNzaW9uLnZhbHVlID0gcmVzdWx0LnNlc3Npb247XHJcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAobGFzdFNlcnZlclNhbXBsZSAmJiB0eXBlb2YgcmVzdWx0LnNlc3Npb24udmlkZW9fcGFja2V0cyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgIGNvbnN0IGR0ID0gKG5vdyAtIGxhc3RTZXJ2ZXJTYW1wbGUudHMpIC8gMTAwMDtcclxuICAgICAgICAgIGNvbnN0IHBhY2tldHMgPSByZXN1bHQuc2Vzc2lvbi52aWRlb19wYWNrZXRzIC0gKGxhc3RTZXJ2ZXJTYW1wbGUudmlkZW9QYWNrZXRzID8/IDApO1xyXG4gICAgICAgICAgaWYgKGR0ID4gMCkgc2VydmVyVmlkZW9GcHMudmFsdWUgPSBwYWNrZXRzIC8gZHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhc3RTZXJ2ZXJTYW1wbGUgPSB7IHRzOiBub3csIC4uLih0eXBlb2YgcmVzdWx0LnNlc3Npb24udmlkZW9fcGFja2V0cyA9PT0gJ251bWJlcicgPyB7IHZpZGVvUGFja2V0czogcmVzdWx0LnNlc3Npb24udmlkZW9fcGFja2V0cyB9IDoge30pIH07XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICB9O1xyXG4gIHZvaWQgcG9sbCgpO1xyXG4gIHNlcnZlclNlc3Npb25UaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChwb2xsLCAxMDAwKTtcclxufVxyXG5cclxubGV0IHdlYnJ0Y0RpYWdUaW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmNvbnN0IFdFQlJUQ19ESUFHX0xPR19JTlRFUlZBTF9NUyA9IDUwMDA7XHJcblxyXG5mdW5jdGlvbiBzdGFydFdlYnJ0Y0RpYWdub3N0aWNzKCk6IHZvaWQge1xyXG4gIHN0b3BXZWJydGNEaWFnbm9zdGljcygpO1xyXG4gIHdlYnJ0Y0RpYWdUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICBpZiAoIWlzQ29ubmVjdGVkLnZhbHVlKSByZXR1cm47XHJcbiAgICAvLyBEaWFnbm9zdGljcyBsb2dnaW5nIChzaW1wbGlmaWVkKVxyXG4gIH0sIFdFQlJUQ19ESUFHX0xPR19JTlRFUlZBTF9NUyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BXZWJydGNEaWFnbm9zdGljcygpOiB2b2lkIHtcclxuICBpZiAod2VicnRjRGlhZ1RpbWVyICE9IG51bGwpIHtcclxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHdlYnJ0Y0RpYWdUaW1lcik7XHJcbiAgICB3ZWJydGNEaWFnVGltZXIgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcERpYWdub3N0aWNzU2FtcGxpbmcoKTogdm9pZCB7XHJcbiAgaWYgKGRpYWdub3N0aWNzU2FtcGxlVGltZXIgIT0gbnVsbCkge1xyXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoZGlhZ25vc3RpY3NTYW1wbGVUaW1lcik7XHJcbiAgICBkaWFnbm9zdGljc1NhbXBsZVRpbWVyID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0RGlhZ25vc3RpY3NTYW1wbGluZygpOiB2b2lkIHtcclxuICBzdG9wRGlhZ25vc3RpY3NTYW1wbGluZygpO1xyXG4gIGRpYWdub3N0aWNzU2FtcGxlVGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKCFpc0Nvbm5lY3RlZC52YWx1ZSkgcmV0dXJuO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IHNhbXBsZSA9IHtcclxuICAgICAgdHM6IG5vdyxcclxuICAgICAgcGFjaW5nRHRNczogdmlkZW9QYWNpbmdNZXRyaWNzLnZhbHVlLmR0TXMgPz8gbnVsbCxcclxuICAgICAgcHJlc2VudGVkRGVsdGE6IHZpZGVvUGFjaW5nTWV0cmljcy52YWx1ZS5wcmVzZW50ZWREZWx0YSA/PyBudWxsLFxyXG4gICAgICByZW5kZXJJbnRlcnZhbE1zOiByZW5kZXJJbnRlcnZhbE1zLnZhbHVlLFxyXG4gICAgICByZW5kZXJEZWxheU1zOiByZW5kZXJEZWxheU1zLnZhbHVlLFxyXG4gICAgICBmcHNSZWNlaXZlZDogaW5ib3VuZFZpZGVvU3RhdHMudmFsdWUuZnBzUmVjZWl2ZWQsXHJcbiAgICAgIGZwc0RlY29kZWQ6IGluYm91bmRWaWRlb1N0YXRzLnZhbHVlLmZwc0RlY29kZWQsXHJcbiAgICAgIGZyYW1lc0Ryb3BwZWQ6IGluYm91bmRWaWRlb1N0YXRzLnZhbHVlLmZyYW1lc0Ryb3BwZWQsXHJcbiAgICAgIGF2Z0ppdHRlckJ1ZmZlck1zOiBpbmJvdW5kVmlkZW9TdGF0cy52YWx1ZS5hdmdKaXR0ZXJCdWZmZXJNcyA/PyBudWxsLFxyXG4gICAgICBhdmdEZWNvZGVNc1BlckZyYW1lOiBpbmJvdW5kVmlkZW9TdGF0cy52YWx1ZS5hdmdEZWNvZGVNc1BlckZyYW1lID8/IG51bGwsXHJcbiAgICAgIHBhY2tldHNMb3N0RGVsdGE6IGluYm91bmRWaWRlb1N0YXRzLnZhbHVlLnBhY2tldHNMb3N0RGVsdGEsXHJcbiAgICAgIGppdHRlcjogaW5ib3VuZFZpZGVvU3RhdHMudmFsdWUuaml0dGVyLFxyXG4gICAgICBzZXJ2ZXJRdWV1ZTogc2VydmVyU2Vzc2lvbi52YWx1ZT8udmlkZW9fcXVldWVfZnJhbWVzLFxyXG4gICAgICBzZXJ2ZXJJbmZsaWdodDogc2VydmVyU2Vzc2lvbi52YWx1ZT8udmlkZW9faW5mbGlnaHRfZnJhbWVzLFxyXG4gICAgICBzZXJ2ZXJWaWRlb0FnZU1zOiBzZXJ2ZXJTZXNzaW9uLnZhbHVlPy5sYXN0X3ZpZGVvX2FnZV9tcyA/PyB1bmRlZmluZWQsXHJcbiAgICAgIHNlcnZlckZwczogc2VydmVyVmlkZW9GcHMudmFsdWUsXHJcbiAgICB9IGFzIERpYWdub3N0aWNzU2FtcGxlO1xyXG4gICAgZGlhZ25vc3RpY3NTYW1wbGVzLnZhbHVlLnB1c2goc2FtcGxlKTtcclxuICAgIGNvbnN0IGN1dG9mZiA9IG5vdyAtIERJQUdOT1NUSUNTX1dJTkRPV19NUztcclxuICAgIHdoaWxlIChkaWFnbm9zdGljc1NhbXBsZXMudmFsdWUubGVuZ3RoICYmIChkaWFnbm9zdGljc1NhbXBsZXMudmFsdWVbMF0/LnRzID8/IEluZmluaXR5KSA8IGN1dG9mZikge1xyXG4gICAgICBkaWFnbm9zdGljc1NhbXBsZXMudmFsdWUuc2hpZnQoKTtcclxuICAgIH1cclxuICB9LCAxMDAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcEF1ZGlvUGxheVJldHJ5KCk6IHZvaWQge1xyXG4gIGlmIChhdWRpb1BsYXlSZXRyeVRpbWVyICE9IG51bGwpIHtcclxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKGF1ZGlvUGxheVJldHJ5VGltZXIpO1xyXG4gICAgYXVkaW9QbGF5UmV0cnlUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIGF1ZGlvUGxheVJldHJ5VW50aWxNcyA9IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuc3VyZUF1ZGlvUGxheWJhY2socmVhc29uOiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZiAoIWF1ZGlvQXV0b3BsYXlSZXF1ZXN0ZWQpIHJldHVybjtcclxuICBpZiAoIWF1ZGlvRWwudmFsdWUpIHJldHVybjtcclxuICBpZiAoIWF1ZGlvU3RyZWFtKSBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xyXG4gIGlmIChhdWRpb0VsLnZhbHVlLnNyY09iamVjdCAhPT0gYXVkaW9TdHJlYW0pIGF1ZGlvRWwudmFsdWUuc3JjT2JqZWN0ID0gYXVkaW9TdHJlYW07XHJcbiAgYXVkaW9FbC52YWx1ZS52b2x1bWUgPSAxO1xyXG4gIGNvbnN0IGhhc1RyYWNrID0gYXVkaW9TdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggPiAwO1xyXG4gIGlmICghaGFzVHJhY2spIGF1ZGlvRWwudmFsdWUubXV0ZWQgPSB0cnVlO1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgaWYgKG5vdyAtIGxhc3RBdWRpb1BsYXlBdHRlbXB0QXRNcyA8IDI1MCkgcmV0dXJuO1xyXG4gIGxhc3RBdWRpb1BsYXlBdHRlbXB0QXRNcyA9IG5vdztcclxuICBjb25zdCBwbGF5UHJvbWlzZSA9ICgoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXVkaW9FbC52YWx1ZS5wbGF5KCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBuYW1lID0gZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyA/IChlcnJvciBhcyBhbnkpLm5hbWUgOiAnJztcclxuICAgICAgaWYgKG5vdyAtIGxhc3RBdWRpb1BsYXlFcnJvckF0TXMgPiAxNTAwKSB7XHJcbiAgICAgICAgbGFzdEF1ZGlvUGxheUVycm9yQXRNcyA9IG5vdztcclxuICAgICAgICBwdXNoVmlkZW9FdmVudChgYXVkaW8tcGxheS10aHJvdyR7bmFtZSA/IGA6JHtuYW1lfWAgOiAnJ306JHtyZWFzb259YCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuICBpZiAoIXBsYXlQcm9taXNlIHx8IHR5cGVvZiAocGxheVByb21pc2UgYXMgYW55KS50aGVuICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XHJcbiAgcGxheVByb21pc2VcclxuICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgaWYgKCFhdWRpb0VsLnZhbHVlKSByZXR1cm47XHJcbiAgICAgIGlmICghYXVkaW9FbC52YWx1ZS5wYXVzZWQpIHtcclxuICAgICAgICBhdWRpb1BsYXliYWNrVW5sb2NrZWQgPSB0cnVlO1xyXG4gICAgICAgIGlmIChoYXNUcmFjaykgc3RvcEF1ZGlvUGxheVJldHJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnID8gKGVycm9yIGFzIGFueSkubmFtZSA6ICcnO1xyXG4gICAgICBpZiAobm93IC0gbGFzdEF1ZGlvUGxheUVycm9yQXRNcyA+IDE1MDApIHtcclxuICAgICAgICBsYXN0QXVkaW9QbGF5RXJyb3JBdE1zID0gbm93O1xyXG4gICAgICAgIHB1c2hWaWRlb0V2ZW50KGBhdWRpby1wbGF5LWVycm9yJHtuYW1lID8gYDoke25hbWV9YCA6ICcnfToke3JlYXNvbn1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByaW1lQXVkaW9BdXRvcGxheSgpOiB2b2lkIHtcclxuICBpZiAoIWF1ZGlvRWwudmFsdWUpIHJldHVybjtcclxuICBpZiAoIWF1ZGlvU3RyZWFtKSBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xyXG4gIGF1ZGlvUGxheWJhY2tVbmxvY2tlZCA9IGZhbHNlO1xyXG4gIGF1ZGlvRWwudmFsdWUuc3JjT2JqZWN0ID0gYXVkaW9TdHJlYW07XHJcbiAgYXVkaW9FbC52YWx1ZS52b2x1bWUgPSAxO1xyXG4gIGF1ZGlvRWwudmFsdWUubXV0ZWQgPSB0cnVlO1xyXG4gIHN0b3BBdWRpb1BsYXlSZXRyeSgpO1xyXG4gIGF1ZGlvUGxheVJldHJ5VW50aWxNcyA9IERhdGUubm93KCkgKyA4MDAwO1xyXG4gIGF1ZGlvUGxheVJldHJ5VGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKCFhdWRpb0F1dG9wbGF5UmVxdWVzdGVkKSB7XHJcbiAgICAgIHN0b3BBdWRpb1BsYXlSZXRyeSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoYXVkaW9QbGF5UmV0cnlVbnRpbE1zICE9IG51bGwgJiYgRGF0ZS5ub3coKSA+IGF1ZGlvUGxheVJldHJ5VW50aWxNcykge1xyXG4gICAgICBzdG9wQXVkaW9QbGF5UmV0cnkoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZW5zdXJlQXVkaW9QbGF5YmFjaygncmV0cnknKTtcclxuICB9LCA1MDApO1xyXG4gIGVuc3VyZUF1ZGlvUGxheWJhY2soJ3ByaW1lJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BTZXNzaW9uU3RhdHVzUG9sbGluZygpOiB2b2lkIHtcclxuICBpZiAoc2Vzc2lvblN0YXR1c1RpbWVyKSB7XHJcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChzZXNzaW9uU3RhdHVzVGltZXIpO1xyXG4gICAgc2Vzc2lvblN0YXR1c1RpbWVyID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoU2Vzc2lvblN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoaXNDb25uZWN0ZWQudmFsdWUpIHJldHVybjtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaHR0cC5nZXQoJy9hcGkvc2Vzc2lvbi9zdGF0dXMnLCB7IHZhbGlkYXRlU3RhdHVzOiAoKSA9PiB0cnVlIH0pO1xyXG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IDIwMCAmJiByZXN1bHQuZGF0YT8uc3RhdHVzKSB7XHJcbiAgICAgIHNlc3Npb25TdGF0dXMudmFsdWUgPSB7XHJcbiAgICAgICAgYWN0aXZlU2Vzc2lvbnM6IE51bWJlcihyZXN1bHQuZGF0YS5hY3RpdmVTZXNzaW9ucyA/PyAwKSxcclxuICAgICAgICBhcHBSdW5uaW5nOiBCb29sZWFuKHJlc3VsdC5kYXRhLmFwcFJ1bm5pbmcpLFxyXG4gICAgICAgIHBhdXNlZDogQm9vbGVhbihyZXN1bHQuZGF0YS5wYXVzZWQpLFxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgKi9cclxuICB9XHJcbiAgc2Vzc2lvblN0YXR1cy52YWx1ZSA9IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0U2Vzc2lvblN0YXR1c1BvbGxpbmcoKTogdm9pZCB7XHJcbiAgc3RvcFNlc3Npb25TdGF0dXNQb2xsaW5nKCk7XHJcbiAgaWYgKGlzQ29ubmVjdGVkLnZhbHVlKSByZXR1cm47XHJcbiAgdm9pZCBmZXRjaFNlc3Npb25TdGF0dXMoKTtcclxuICBzZXNzaW9uU3RhdHVzVGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZmV0Y2hTZXNzaW9uU3RhdHVzLCA1MDAwKTtcclxufVxyXG5cclxuY29uc3QgRVNDX0hPTERfTVMgPSAyMDAwO1xyXG5sZXQgZXNjSG9sZFRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxubGV0IGZ1bGxzY3JlZW5LZXlib2FyZExvY2tSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIGdldEZ1bGxzY3JlZW5FbGVtZW50KCk6IEVsZW1lbnQgfCBudWxsIHtcclxuICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgPz8gKGRvY3VtZW50IGFzIGFueSkud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgPz8gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNJb3NQaG9uZSgpOiBib29sZWFuIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50ID8/ICcnO1xyXG4gICAgcmV0dXJuIC9cXGIoaVBob25lfGlQb2QpXFxiL2kudGVzdCh1YSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc05hdGl2ZVZpZGVvRnVsbHNjcmVlbkFjdGl2ZSgpOiBib29sZWFuIHtcclxuICBpZiAobmF0aXZlVmlkZW9GdWxsc2NyZWVuLnZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYW55VmlkZW8gPSB2aWRlb0VsLnZhbHVlIGFzIGFueTtcclxuICAgIHJldHVybiBCb29sZWFuKGFueVZpZGVvPy53ZWJraXREaXNwbGF5aW5nRnVsbHNjcmVlbik7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0RnVsbHNjcmVlbih0YXJnZXQ6IEhUTUxFbGVtZW50KTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgY29uc3QgYW55VGFyZ2V0ID0gdGFyZ2V0IGFzIGFueTtcclxuICBpZiAodHlwZW9mIHRhcmdldC5yZXF1ZXN0RnVsbHNjcmVlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgdGFyZ2V0LnJlcXVlc3RGdWxsc2NyZWVuKCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8qIHRyeSBmYWxsYmFjayAqL1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAodHlwZW9mIGFueVRhcmdldC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYW55VGFyZ2V0LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XHJcbiAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSBhd2FpdCByZXN1bHQ7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8qIHRyeSBmYWxsYmFjayAqL1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyeUVudGVyTmF0aXZlVmlkZW9GdWxsc2NyZWVuKCk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IHZpZGVvID0gdmlkZW9FbC52YWx1ZTtcclxuICBpZiAoIXZpZGVvKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3QgYW55VmlkZW8gPSB2aWRlbyBhcyBhbnk7XHJcbiAgY29uc3QgZW50ZXIgPSBhbnlWaWRlbz8ud2Via2l0RW50ZXJGdWxsc2NyZWVuID8/IGFueVZpZGVvPy53ZWJraXRFbnRlckZ1bGxTY3JlZW47XHJcbiAgaWYgKHR5cGVvZiBlbnRlciAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICBlbnRlci5jYWxsKHZpZGVvKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdHJ5RW50ZXJGdWxsc2NyZWVuKHRhcmdldDogSFRNTEVsZW1lbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICBjb25zdCB2aWRlbyA9IHZpZGVvRWwudmFsdWU7XHJcbiAgLy8gaU9TIHBob25lcyBhcmUgdGhlIG1vc3QgcmVzdHJpY3RpdmU7IHByZWZlciBuYXRpdmUgdmlkZW8gZnVsbHNjcmVlbiB0aGVyZS5cclxuICBpZiAoaXNJb3NQaG9uZSgpICYmIHZpZGVvKSB7XHJcbiAgICBpZiAoYXdhaXQgcmVxdWVzdEZ1bGxzY3JlZW4odmlkZW8pKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh0cnlFbnRlck5hdGl2ZVZpZGVvRnVsbHNjcmVlbigpKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChhd2FpdCByZXF1ZXN0RnVsbHNjcmVlbih0YXJnZXQpKSByZXR1cm4gdHJ1ZTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmIChhd2FpdCByZXF1ZXN0RnVsbHNjcmVlbih0YXJnZXQpKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAodmlkZW8pIHtcclxuICAgIGlmIChhd2FpdCByZXF1ZXN0RnVsbHNjcmVlbih2aWRlbykpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHRyeUVudGVyTmF0aXZlVmlkZW9GdWxsc2NyZWVuKCkpIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGV4aXRGdWxsc2NyZWVuKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGFueURvYyA9IGRvY3VtZW50IGFzIGFueTtcclxuICBpZiAodHlwZW9mIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBhd2FpdCBkb2N1bWVudC5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIGFueURvYy53ZWJraXRFeGl0RnVsbHNjcmVlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYW55RG9jLndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XHJcbiAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykgYXdhaXQgcmVzdWx0O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNGdWxsc2NyZWVuQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gIGlmIChpc05hdGl2ZVZpZGVvRnVsbHNjcmVlbkFjdGl2ZSgpKSByZXR1cm4gdHJ1ZTtcclxuICBjb25zdCBmdWxsc2NyZWVuRWwgPSBnZXRGdWxsc2NyZWVuRWxlbWVudCgpO1xyXG4gIHJldHVybiBmdWxsc2NyZWVuRWwgPT09IGlucHV0VGFyZ2V0LnZhbHVlIHx8IGZ1bGxzY3JlZW5FbCA9PT0gdmlkZW9FbC52YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNUYWJBY3RpdmUoKTogYm9vbGVhbiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHZpc2libGUgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScgOiB0cnVlO1xyXG4gICAgY29uc3QgZm9jdXMgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50Lmhhc0ZvY3VzID8gZG9jdW1lbnQuaGFzRm9jdXMoKSA6IHRydWU7XHJcbiAgICByZXR1cm4gdmlzaWJsZSAmJiBmb2N1cztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3Qgb25GdWxsc2NyZWVuQ2hhbmdlID0gKCkgPT4ge1xyXG4gIGNvbnN0IGFjdGl2ZSA9IGlzRnVsbHNjcmVlbkFjdGl2ZSgpO1xyXG4gIGlmIChhY3RpdmUpIHBzZXVkb0Z1bGxzY3JlZW4udmFsdWUgPSBmYWxzZTtcclxuICBpc0Z1bGxzY3JlZW4udmFsdWUgPSBhY3RpdmUgfHwgcHNldWRvRnVsbHNjcmVlbi52YWx1ZTtcclxuICBpZiAoIWlzRnVsbHNjcmVlbi52YWx1ZSkge1xyXG4gICAgY2FuY2VsRXNjSG9sZCgpO1xyXG4gICAgcmVsZWFzZUZ1bGxzY3JlZW5LZXlib2FyZExvY2soKTtcclxuICB9XHJcbiAgbW9kZVN3aXRjaERyYWluVW50aWwgPSBEYXRlLm5vdygpICsgdmlkZW9MYXRlbmN5UHJvZmlsZS5tb2RlU3dpdGNoRHJhaW5NcztcclxuICB0cmlnZ2VyVmlkZW9EcmFpbldpbmRvdyh2aWRlb0xhdGVuY3lQcm9maWxlLm1vZGVTd2l0Y2hEcmFpbk1zLCAnZnVsbHNjcmVlbicpO1xyXG4gIGVuc3VyZUF1ZGlvUGxheWJhY2soJ2Z1bGxzY3JlZW4nKTtcclxufTtcclxuXHJcbmNvbnN0IG9uT3ZlcmxheUhvdGtleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gIGlmICghZXZlbnQuY3RybEtleSB8fCAhZXZlbnQuYWx0S2V5IHx8ICFldmVudC5zaGlmdEtleSkgcmV0dXJuO1xyXG4gIGlmIChldmVudC5jb2RlICE9PSAnS2V5UycpIHJldHVybjtcclxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIHNob3dPdmVybGF5LnZhbHVlID0gIXNob3dPdmVybGF5LnZhbHVlO1xyXG59O1xyXG5cclxuY29uc3Qgb25QYWdlSGlkZSA9ICgpID0+IHtcclxuICB2b2lkIGNsaWVudC5kaXNjb25uZWN0KHsga2VlcGFsaXZlOiB0cnVlIH0pO1xyXG59O1xyXG5cclxuY29uc3Qgb25WaXNpYmlsaXR5Q2hhbmdlID0gKCkgPT4ge1xyXG4gIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICd2aXNpYmxlJykge1xyXG4gICAgbW9kZVN3aXRjaERyYWluVW50aWwgPSBEYXRlLm5vdygpICsgdmlkZW9MYXRlbmN5UHJvZmlsZS5tb2RlU3dpdGNoRHJhaW5NcztcclxuICAgIHRyaWdnZXJWaWRlb0RyYWluV2luZG93KHZpZGVvTGF0ZW5jeVByb2ZpbGUubW9kZVN3aXRjaERyYWluTXMsICdyZXN1bWUnKTtcclxuICB9XHJcbiAgZW5zdXJlQXVkaW9QbGF5YmFjaygndmlzaWJpbGl0eScpO1xyXG59O1xyXG5cclxuY29uc3Qgb25BdWRpb1VzZXJHZXN0dXJlID0gKCkgPT4ge1xyXG4gIGlmICghYXVkaW9BdXRvcGxheVJlcXVlc3RlZCkgcmV0dXJuO1xyXG4gIGlmIChhdWRpb1BsYXlSZXRyeVVudGlsTXMgIT0gbnVsbCAmJiBEYXRlLm5vdygpIDw9IGF1ZGlvUGxheVJldHJ5VW50aWxNcykge1xyXG4gICAgZW5zdXJlQXVkaW9QbGF5YmFjaygnZ2VzdHVyZScpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAoIWF1ZGlvUGxheWJhY2tVbmxvY2tlZCAmJiBpc0Nvbm5lY3RlZC52YWx1ZSkgZW5zdXJlQXVkaW9QbGF5YmFjaygnZ2VzdHVyZScpO1xyXG59O1xyXG5cclxuY29uc3Qgb25GdWxsc2NyZWVuRXNjYXBlRG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gIGlmIChldmVudC5jb2RlICE9PSAnRXNjYXBlJykgcmV0dXJuO1xyXG4gIGlmICghaXNGdWxsc2NyZWVuLnZhbHVlKSByZXR1cm47XHJcbiAgaWYgKGVzY0hvbGRUaW1lcikge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIGVzY0hvbGRUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgIGVzY0hvbGRUaW1lciA9IG51bGw7XHJcbiAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGV4aXRGdWxsc2NyZWVuKCk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSwgRVNDX0hPTERfTVMpO1xyXG59O1xyXG5cclxuY29uc3Qgb25GdWxsc2NyZWVuRXNjYXBlVXAgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuICBpZiAoZXZlbnQuY29kZSAhPT0gJ0VzY2FwZScpIHJldHVybjtcclxuICBpZiAoIWlzRnVsbHNjcmVlbi52YWx1ZSkgcmV0dXJuO1xyXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgY2FuY2VsRXNjSG9sZCgpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2FuY2VsRXNjSG9sZCgpIHtcclxuICBpZiAoZXNjSG9sZFRpbWVyKSB7XHJcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGVzY0hvbGRUaW1lcik7XHJcbiAgICBlc2NIb2xkVGltZXIgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVxdWVzdEZ1bGxzY3JlZW5LZXlib2FyZExvY2soKTogdm9pZCB7XHJcbiAgaWYgKGZ1bGxzY3JlZW5LZXlib2FyZExvY2tSZXF1ZXN0ZWQpIHJldHVybjtcclxuICBmdWxsc2NyZWVuS2V5Ym9hcmRMb2NrUmVxdWVzdGVkID0gdHJ1ZTtcclxuICB2b2lkIHJlcXVlc3RLZXlib2FyZExvY2soKS50aGVuKChsb2NrZWQpID0+IHtcclxuICAgIGlmICghbG9ja2VkKSBmdWxsc2NyZWVuS2V5Ym9hcmRMb2NrUmVxdWVzdGVkID0gZmFsc2U7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbGVhc2VGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk6IHZvaWQge1xyXG4gIGlmICghZnVsbHNjcmVlbktleWJvYXJkTG9ja1JlcXVlc3RlZCkgcmV0dXJuO1xyXG4gIGZ1bGxzY3JlZW5LZXlib2FyZExvY2tSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuICByZWxlYXNlS2V5Ym9hcmRMb2NrKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEticHModmFsdWU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIHJldHVybiB2YWx1ZSA/IGAke3ZhbHVlLnRvRml4ZWQoMCl9IGticHNgIDogJy0tJztcclxufVxyXG5mdW5jdGlvbiBmb3JtYXRNcyh2YWx1ZT86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgPyBgJHt2YWx1ZS50b0ZpeGVkKDEpfSBtc2AgOiAnLS0nO1xyXG59XHJcbmZ1bmN0aW9uIGRpc3BsYXlWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09ICcnID8gJy0tJyA6IFN0cmluZyh2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHB1c2hWaWRlb0V2ZW50KGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XHJcbiAgdmlkZW9FdmVudHMudmFsdWUgPSBbYCR7c3RhbXB9ICR7bGFiZWx9YCwgLi4udmlkZW9FdmVudHMudmFsdWVdLnNsaWNlKDAsIDgpO1xyXG4gIHZpZGVvU3RhdGVUaWNrLnZhbHVlICs9IDE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVJlbW90ZVN0cmVhbUluZm8oc3RyZWFtOiBNZWRpYVN0cmVhbSk6IHZvaWQge1xyXG4gIHJlbW90ZVN0cmVhbUluZm8udmFsdWUgPSB7XHJcbiAgICBpZDogc3RyZWFtLmlkLFxyXG4gICAgdmlkZW9UcmFja3M6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCxcclxuICAgIGF1ZGlvVHJhY2tzOiBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGgsXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlVmlkZW9FbGVtZW50KHN0cmVhbTogTWVkaWFTdHJlYW0pOiBib29sZWFuIHtcclxuICBpZiAoIXZpZGVvRWwudmFsdWUpIHJldHVybiBmYWxzZTtcclxuICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xyXG4gIGlmICghdmlkZW9UcmFja3MubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgaWYgKCF2aWRlb1N0cmVhbSkgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcclxuICB2aWRlb1N0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmZvckVhY2goKHQpID0+IHZpZGVvU3RyZWFtIS5yZW1vdmVUcmFjayh0KSk7XHJcbiAgdmlkZW9UcmFja3MuZm9yRWFjaCgodCkgPT4gdmlkZW9TdHJlYW0hLmFkZFRyYWNrKHQpKTtcclxuICB2aWRlb0VsLnZhbHVlLnNyY09iamVjdCA9IHZpZGVvU3RyZWFtO1xyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldFZpZGVvRWxlbWVudCgpOiB2b2lkIHtcclxuICBjb25zdCBlbCA9IHZpZGVvRWwudmFsdWU7XHJcbiAgaWYgKCFlbCB8fCAhdmlkZW9TdHJlYW0pIHJldHVybjtcclxuICBlbC5zcmNPYmplY3QgPSBudWxsO1xyXG4gIGVsLnNyY09iamVjdCA9IHZpZGVvU3RyZWFtO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBdWRpb0VsZW1lbnQoc3RyZWFtOiBNZWRpYVN0cmVhbSk6IHZvaWQge1xyXG4gIGlmICghYXVkaW9FbC52YWx1ZSkgcmV0dXJuO1xyXG4gIGNvbnN0IGF1ZGlvVHJhY2tzID0gc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCk7XHJcbiAgaWYgKCFhdWRpb1RyYWNrcy5sZW5ndGgpIHJldHVybjtcclxuICBpZiAoIWF1ZGlvU3RyZWFtKSBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xyXG4gIGF1ZGlvU3RyZWFtLmdldEF1ZGlvVHJhY2tzKCkuZm9yRWFjaCgodCkgPT4gYXVkaW9TdHJlYW0hLnJlbW92ZVRyYWNrKHQpKTtcclxuICBhdWRpb1RyYWNrcy5mb3JFYWNoKCh0KSA9PiBhdWRpb1N0cmVhbSEuYWRkVHJhY2sodCkpO1xyXG4gIGF1ZGlvRWwudmFsdWUuc3JjT2JqZWN0ID0gYXVkaW9TdHJlYW07XHJcbiAgYXVkaW9FbC52YWx1ZS5tdXRlZCA9IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEF1ZGlvRWxlbWVudCgpOiB2b2lkIHtcclxuICBjb25zdCBlbCA9IGF1ZGlvRWwudmFsdWU7XHJcbiAgaWYgKCFlbCB8fCAhYXVkaW9TdHJlYW0pIHJldHVybjtcclxuICBlbC5zcmNPYmplY3QgPSBudWxsO1xyXG4gIGVsLnNyY09iamVjdCA9IGF1ZGlvU3RyZWFtO1xyXG4gIHZvaWQgZWwucGxheSgpLmNhdGNoKCgpID0+IHsgLyogYXV0b3BsYXkgbWF5IGJlIGJsb2NrZWQgKi8gfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGF0dGFjaFZpZGVvRGVidWcoZWw6IEhUTUxWaWRlb0VsZW1lbnQpOiAoKSA9PiB2b2lkIHtcclxuICBjb25zdCBldmVudHMgPSBbXHJcbiAgICAnbG9hZGVkbWV0YWRhdGEnLFxyXG4gICAgJ2NhbnBsYXknLFxyXG4gICAgJ3BsYXlpbmcnLFxyXG4gICAgJ3dhaXRpbmcnLFxyXG4gICAgJ3N0YWxsZWQnLFxyXG4gICAgJ3N1c3BlbmQnLFxyXG4gICAgJ2Vycm9yJyxcclxuICAgICdlbmRlZCcsXHJcbiAgXTtcclxuICBjb25zdCBoYW5kbGVycyA9IGV2ZW50cy5tYXAoKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCBoYW5kbGVyID0gKCkgPT4ge1xyXG4gICAgICBwdXNoVmlkZW9FdmVudChldmVudCk7XHJcbiAgICAgIHZpZGVvU3RhdGVUaWNrLnZhbHVlKys7XHJcbiAgICB9O1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcik7XHJcbiAgICByZXR1cm4geyBldmVudCwgaGFuZGxlciB9O1xyXG4gIH0pO1xyXG4gIHJldHVybiAoKSA9PiB7XHJcbiAgICBoYW5kbGVycy5mb3JFYWNoKCh7IGV2ZW50LCBoYW5kbGVyIH0pID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBhdHRhY2hWaWRlb0ZyYW1lTWV0cmljcyhlbDogSFRNTFZpZGVvRWxlbWVudCk6ICgpID0+IHZvaWQge1xyXG4gIGNvbnN0IGludGVydmFsU2FtcGxlczogbnVtYmVyW10gPSBbXTtcclxuICBjb25zdCBkZWxheVNhbXBsZXM6IG51bWJlcltdID0gW107XHJcbiAgY29uc3QgbWF4U2FtcGxlcyA9IDEyMDtcclxuICBsZXQgbGFzdFRzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgaWYgKCdyZXF1ZXN0VmlkZW9GcmFtZUNhbGxiYWNrJyBpbiBlbCkge1xyXG4gICAgbGV0IGhhbmRsZSA9IDA7XHJcbiAgICBjb25zdCBjYiA9IChub3c6IG51bWJlciwgbWV0YTogVmlkZW9GcmFtZUNhbGxiYWNrTWV0YWRhdGEpID0+IHtcclxuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBsYXN0VHMgIT0gbnVsbCA/IG5vdyAtIGxhc3RUcyA6IG51bGw7XHJcbiAgICAgIGxhc3RUcyA9IG5vdztcclxuICAgICAgaWYgKGludGVydmFsICE9IG51bGwpIHtcclxuICAgICAgICBpbnRlcnZhbFNhbXBsZXMucHVzaChpbnRlcnZhbCk7XHJcbiAgICAgICAgaWYgKGludGVydmFsU2FtcGxlcy5sZW5ndGggPiBtYXhTYW1wbGVzKSBpbnRlcnZhbFNhbXBsZXMuc2hpZnQoKTtcclxuICAgICAgICBjb25zdCBzb3J0ZWQgPSBbLi4uaW50ZXJ2YWxTYW1wbGVzXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XHJcbiAgICAgICAgY29uc3QgcDk4SWR4ID0gTWF0aC5mbG9vcihzb3J0ZWQubGVuZ3RoICogMC45OCk7XHJcbiAgICAgICAgY29uc3QgcDk5SWR4ID0gTWF0aC5mbG9vcihzb3J0ZWQubGVuZ3RoICogMC45OSk7XHJcbiAgICAgICAgdmlkZW9GcmFtZU1ldHJpY3MudmFsdWUgPSB7XHJcbiAgICAgICAgICBsYXN0SW50ZXJ2YWxNczogaW50ZXJ2YWwsXHJcbiAgICAgICAgICBhdmdJbnRlcnZhbE1zOiBzb3J0ZWQucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBzb3J0ZWQubGVuZ3RoLFxyXG4gICAgICAgICAgbWF4SW50ZXJ2YWxNczogc29ydGVkW3NvcnRlZC5sZW5ndGggLSAxXSEsXHJcbiAgICAgICAgICBwOThJbnRlcnZhbE1zOiBzb3J0ZWRbcDk4SWR4XSEsXHJcbiAgICAgICAgICBhdmc5OEludGVydmFsTXM6IHNvcnRlZC5zbGljZSgwLCBwOThJZHggKyAxKS5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIChwOThJZHggKyAxKSxcclxuICAgICAgICAgIHA5OUludGVydmFsTXM6IHNvcnRlZFtwOTlJZHhdISxcclxuICAgICAgICAgIGF2Zzk5SW50ZXJ2YWxNczogc29ydGVkLnNsaWNlKDAsIHA5OUlkeCArIDEpLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gKHA5OUlkeCArIDEpLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgaGFuZGxlID0gZWwucmVxdWVzdFZpZGVvRnJhbWVDYWxsYmFjayhjYik7XHJcbiAgICB9O1xyXG4gICAgaGFuZGxlID0gZWwucmVxdWVzdFZpZGVvRnJhbWVDYWxsYmFjayhjYik7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBpZiAoaGFuZGxlKSBlbC5jYW5jZWxWaWRlb0ZyYW1lQ2FsbGJhY2soaGFuZGxlKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBsZXQgcmFmSWQgPSAwO1xyXG4gIGxldCBsYXN0VCA9IChlbCBhcyBIVE1MVmlkZW9FbGVtZW50KS5jdXJyZW50VGltZTtcclxuICBjb25zdCByYWYgPSAobm93OiBudW1iZXIpID0+IHtcclxuICAgIGlmICgoZWwgYXMgSFRNTFZpZGVvRWxlbWVudCkuY3VycmVudFRpbWUgIT09IGxhc3RUKSB7XHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gbGFzdFRzICE9IG51bGwgPyBub3cgLSBsYXN0VHMgOiBudWxsO1xyXG4gICAgICBsYXN0VHMgPSBub3c7XHJcbiAgICAgIGxhc3RUID0gKGVsIGFzIEhUTUxWaWRlb0VsZW1lbnQpLmN1cnJlbnRUaW1lO1xyXG4gICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkge1xyXG4gICAgICAgIGludGVydmFsU2FtcGxlcy5wdXNoKGludGVydmFsKTtcclxuICAgICAgICBpZiAoaW50ZXJ2YWxTYW1wbGVzLmxlbmd0aCA+IG1heFNhbXBsZXMpIGludGVydmFsU2FtcGxlcy5zaGlmdCgpO1xyXG4gICAgICAgIHZpZGVvRnJhbWVNZXRyaWNzLnZhbHVlID0ge1xyXG4gICAgICAgICAgbGFzdEludGVydmFsTXM6IGludGVydmFsLFxyXG4gICAgICAgICAgYXZnSW50ZXJ2YWxNczogaW50ZXJ2YWxTYW1wbGVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gaW50ZXJ2YWxTYW1wbGVzLmxlbmd0aCxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShyYWYpO1xyXG4gIH07XHJcbiAgcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmFmKTtcclxuICByZXR1cm4gKCkgPT4gY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmSWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhdHRhY2hWaWRlb1BhY2luZ1Byb2JlKFxyXG4gIGVsOiBIVE1MVmlkZW9FbGVtZW50LFxyXG4gIG9uU2FtcGxlOiAoc2FtcGxlOiB7XHJcbiAgICBkdE1zPzogbnVtYmVyIHwgbnVsbDtcclxuICAgIHByZXNlbnRlZERlbHRhPzogbnVtYmVyIHwgbnVsbDtcclxuICAgIG5vdz86IG51bWJlcjtcclxuICAgIG1lZGlhVGltZT86IG51bWJlcjtcclxuICB9KSA9PiB2b2lkLFxyXG4pOiAoKSA9PiB2b2lkIHtcclxuICBpZiAoJ3JlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2snIGluIGVsKSB7XHJcbiAgICBsZXQgaGFuZGxlID0gMDtcclxuICAgIGxldCBsYXN0Tm93OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBsYXN0UHJlc2VudGVkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICAgIGNvbnN0IGNiID0gKG5vdzogbnVtYmVyLCBtZXRhOiBWaWRlb0ZyYW1lQ2FsbGJhY2tNZXRhZGF0YSkgPT4ge1xyXG4gICAgICBjb25zdCBkdE1zID0gbGFzdE5vdyAhPSBudWxsID8gbm93IC0gbGFzdE5vdyA6IG51bGw7XHJcbiAgICAgIGNvbnN0IHByZXNlbnRlZEZyYW1lcyA9IChtZXRhIGFzIGFueSkucHJlc2VudGVkRnJhbWVzO1xyXG4gICAgICBjb25zdCBwcmVzZW50ZWREZWx0YSA9XHJcbiAgICAgICAgbGFzdFByZXNlbnRlZCAhPSBudWxsICYmIHR5cGVvZiBwcmVzZW50ZWRGcmFtZXMgPT09ICdudW1iZXInXHJcbiAgICAgICAgICA/IHByZXNlbnRlZEZyYW1lcyAtIGxhc3RQcmVzZW50ZWRcclxuICAgICAgICAgIDogbnVsbDtcclxuICAgICAgb25TYW1wbGUoeyBkdE1zLCBwcmVzZW50ZWREZWx0YSwgbm93LCBtZWRpYVRpbWU6IG1ldGEubWVkaWFUaW1lIH0pO1xyXG4gICAgICBsYXN0UHJlc2VudGVkID0gcHJlc2VudGVkRnJhbWVzID8/IGxhc3RQcmVzZW50ZWQ7XHJcbiAgICAgIGxhc3ROb3cgPSBub3c7XHJcbiAgICAgIGhhbmRsZSA9IGVsLnJlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2soY2IpO1xyXG4gICAgfTtcclxuICAgIGhhbmRsZSA9IGVsLnJlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2soY2IpO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKGhhbmRsZSkgZWwuY2FuY2VsVmlkZW9GcmFtZUNhbGxiYWNrKGhhbmRsZSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgbGV0IHJhZklkID0gMDtcclxuICBsZXQgbGFzdFQgPSAoZWwgYXMgSFRNTFZpZGVvRWxlbWVudCkuY3VycmVudFRpbWU7XHJcbiAgY29uc3QgcmFmID0gKG5vdzogbnVtYmVyKSA9PiB7XHJcbiAgICBpZiAoKGVsIGFzIEhUTUxWaWRlb0VsZW1lbnQpLmN1cnJlbnRUaW1lICE9PSBsYXN0VCkge1xyXG4gICAgICBvblNhbXBsZSh7IGR0TXM6IG51bGwsIHByZXNlbnRlZERlbHRhOiBudWxsLCBub3csIG1lZGlhVGltZTogKGVsIGFzIEhUTUxWaWRlb0VsZW1lbnQpLmN1cnJlbnRUaW1lIH0pO1xyXG4gICAgICBsYXN0VCA9IChlbCBhcyBIVE1MVmlkZW9FbGVtZW50KS5jdXJyZW50VGltZTtcclxuICAgIH1cclxuICAgIHJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJhZik7XHJcbiAgfTtcclxuICByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShyYWYpO1xyXG4gIHJldHVybiAoKSA9PiBjYW5jZWxBbmltYXRpb25GcmFtZShyYWZJZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0SW5ib3VuZFZpZGVvU3RhdHMoXHJcbiAgcGM6IFJUQ1BlZXJDb25uZWN0aW9uLFxyXG4gIG9uU3RhdHM6IChzdGF0czoge1xyXG4gICAgZnBzUmVjZWl2ZWQ/OiBudW1iZXI7XHJcbiAgICBmcHNEZWNvZGVkPzogbnVtYmVyO1xyXG4gICAgZnJhbWVzRHJvcHBlZD86IG51bWJlcjtcclxuICAgIGF2Z0ppdHRlckJ1ZmZlck1zPzogbnVtYmVyIHwgbnVsbDtcclxuICAgIGF2Z0RlY29kZU1zUGVyRnJhbWU/OiBudW1iZXIgfCBudWxsO1xyXG4gICAgcGFja2V0c0xvc3REZWx0YT86IG51bWJlcjtcclxuICAgIGppdHRlcj86IG51bWJlcjtcclxuICB9KSA9PiB2b2lkLFxyXG4gIGludGVydmFsTXMgPSAxMDAwLFxyXG4pOiAoKSA9PiB2b2lkIHtcclxuICBsZXQgcHJldjoge1xyXG4gICAgbm93OiBudW1iZXI7XHJcbiAgICBmcmFtZXNSZWNlaXZlZD86IG51bWJlcjtcclxuICAgIGZyYW1lc0RlY29kZWQ/OiBudW1iZXI7XHJcbiAgICBmcmFtZXNEcm9wcGVkPzogbnVtYmVyO1xyXG4gICAgcGFja2V0c0xvc3Q/OiBudW1iZXI7XHJcbiAgICBqaXR0ZXI/OiBudW1iZXI7XHJcbiAgICBqaXR0ZXJCdWZmZXJEZWxheT86IG51bWJlcjtcclxuICAgIGppdHRlckJ1ZmZlckVtaXR0ZWRDb3VudD86IG51bWJlcjtcclxuICAgIHRvdGFsRGVjb2RlVGltZT86IG51bWJlcjtcclxuICB9IHwgbnVsbCA9IG51bGw7XHJcbiAgY29uc3QgaWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVwb3J0ID0gYXdhaXQgcGMuZ2V0U3RhdHMoKTtcclxuICAgICAgbGV0IGJlc3Q6IGFueSA9IG51bGw7XHJcbiAgICAgIHJlcG9ydC5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgaWYgKHMudHlwZSAhPT0gJ2luYm91bmQtcnRwJykgcmV0dXJuO1xyXG4gICAgICAgIGlmIChzLmtpbmQgIT09ICd2aWRlbycgJiYgcy5tZWRpYVR5cGUgIT09ICd2aWRlbycpIHJldHVybjtcclxuICAgICAgICBjb25zdCBmcmFtZXMgPSB0eXBlb2Ygcy5mcmFtZXNSZWNlaXZlZCA9PT0gJ251bWJlcicgPyBzLmZyYW1lc1JlY2VpdmVkIDogMDtcclxuICAgICAgICBpZiAoIWJlc3QgfHwgZnJhbWVzID4gKGJlc3QuZnJhbWVzUmVjZWl2ZWQgPz8gMCkpIGJlc3QgPSBzO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKCFiZXN0KSByZXR1cm47XHJcbiAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICBjb25zdCBjdXIgPSB7XHJcbiAgICAgICAgbm93LFxyXG4gICAgICAgIGZyYW1lc1JlY2VpdmVkOiBiZXN0LmZyYW1lc1JlY2VpdmVkLFxyXG4gICAgICAgIGZyYW1lc0RlY29kZWQ6IGJlc3QuZnJhbWVzRGVjb2RlZCxcclxuICAgICAgICBmcmFtZXNEcm9wcGVkOiBiZXN0LmZyYW1lc0Ryb3BwZWQsXHJcbiAgICAgICAgcGFja2V0c0xvc3Q6IGJlc3QucGFja2V0c0xvc3QsXHJcbiAgICAgICAgaml0dGVyOiBiZXN0LmppdHRlcixcclxuICAgICAgICBqaXR0ZXJCdWZmZXJEZWxheTogYmVzdC5qaXR0ZXJCdWZmZXJEZWxheSxcclxuICAgICAgICBqaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQ6IGJlc3Quaml0dGVyQnVmZmVyRW1pdHRlZENvdW50LFxyXG4gICAgICAgIHRvdGFsRGVjb2RlVGltZTogYmVzdC50b3RhbERlY29kZVRpbWUsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChwcmV2KSB7XHJcbiAgICAgICAgY29uc3QgZHQgPSAoY3VyLm5vdyAtIHByZXYubm93KSAvIDEwMDA7XHJcbiAgICAgICAgY29uc3QgZFJlY3YgPVxyXG4gICAgICAgICAgdHlwZW9mIGN1ci5mcmFtZXNSZWNlaXZlZCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHByZXYuZnJhbWVzUmVjZWl2ZWQgPT09ICdudW1iZXInXHJcbiAgICAgICAgICAgID8gY3VyLmZyYW1lc1JlY2VpdmVkIC0gcHJldi5mcmFtZXNSZWNlaXZlZFxyXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBkRGVjID1cclxuICAgICAgICAgIHR5cGVvZiBjdXIuZnJhbWVzRGVjb2RlZCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHByZXYuZnJhbWVzRGVjb2RlZCA9PT0gJ251bWJlcidcclxuICAgICAgICAgICAgPyBjdXIuZnJhbWVzRGVjb2RlZCAtIHByZXYuZnJhbWVzRGVjb2RlZFxyXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBkRHJvcCA9XHJcbiAgICAgICAgICB0eXBlb2YgY3VyLmZyYW1lc0Ryb3BwZWQgPT09ICdudW1iZXInICYmIHR5cGVvZiBwcmV2LmZyYW1lc0Ryb3BwZWQgPT09ICdudW1iZXInXHJcbiAgICAgICAgICAgID8gY3VyLmZyYW1lc0Ryb3BwZWQgLSBwcmV2LmZyYW1lc0Ryb3BwZWRcclxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgYXZnSmJNcyA9XHJcbiAgICAgICAgICB0eXBlb2YgY3VyLmppdHRlckJ1ZmZlckRlbGF5ID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICAgICAgdHlwZW9mIGN1ci5qaXR0ZXJCdWZmZXJFbWl0dGVkQ291bnQgPT09ICdudW1iZXInICYmXHJcbiAgICAgICAgICBjdXIuaml0dGVyQnVmZmVyRW1pdHRlZENvdW50ID4gMFxyXG4gICAgICAgICAgICA/IChjdXIuaml0dGVyQnVmZmVyRGVsYXkgLyBjdXIuaml0dGVyQnVmZmVyRW1pdHRlZENvdW50KSAqIDEwMDBcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IGF2Z0RlY29kZU1zID1cclxuICAgICAgICAgIHR5cGVvZiBjdXIudG90YWxEZWNvZGVUaW1lID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICAgICAgdHlwZW9mIGN1ci5mcmFtZXNEZWNvZGVkID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICAgICAgY3VyLmZyYW1lc0RlY29kZWQgPiAwXHJcbiAgICAgICAgICAgID8gKGN1ci50b3RhbERlY29kZVRpbWUgLyBjdXIuZnJhbWVzRGVjb2RlZCkgKiAxMDAwXHJcbiAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICBvblN0YXRzKHtcclxuICAgICAgICAgIC4uLih0eXBlb2YgZFJlY3YgPT09ICdudW1iZXInID8geyBmcHNSZWNlaXZlZDogZFJlY3YgLyBkdCB9IDoge30pLFxyXG4gICAgICAgICAgLi4uKHR5cGVvZiBkRGVjID09PSAnbnVtYmVyJyA/IHsgZnBzRGVjb2RlZDogZERlYyAvIGR0IH0gOiB7fSksXHJcbiAgICAgICAgICAuLi4odHlwZW9mIGREcm9wID09PSAnbnVtYmVyJyA/IHsgZnJhbWVzRHJvcHBlZDogZERyb3AgfSA6IHt9KSxcclxuICAgICAgICAgIGF2Z0ppdHRlckJ1ZmZlck1zOiBhdmdKYk1zLFxyXG4gICAgICAgICAgYXZnRGVjb2RlTXNQZXJGcmFtZTogYXZnRGVjb2RlTXMsXHJcbiAgICAgICAgICAuLi4odHlwZW9mIGN1ci5wYWNrZXRzTG9zdCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHByZXYucGFja2V0c0xvc3QgPT09ICdudW1iZXInXHJcbiAgICAgICAgICAgID8geyBwYWNrZXRzTG9zdERlbHRhOiBjdXIucGFja2V0c0xvc3QgLSBwcmV2LnBhY2tldHNMb3N0IH1cclxuICAgICAgICAgICAgOiB7fSksXHJcbiAgICAgICAgICBqaXR0ZXI6IGN1ci5qaXR0ZXIsXHJcbiAgICAgICAgfSBhcyBQYXJhbWV0ZXJzPHR5cGVvZiBvblN0YXRzPlswXSk7XHJcbiAgICAgIH1cclxuICAgICAgcHJldiA9IGN1cjtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICB9LCBpbnRlcnZhbE1zKTtcclxuICByZXR1cm4gKCkgPT4ge1xyXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoaWQpO1xyXG4gIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1UZXJtaW5hdGVBbmRDb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGRpYWxvZy53YXJuaW5nKHtcclxuICAgIHRpdGxlOiB0KCd3ZWJydGMudGVybWluYXRlX2NvbmZpcm1fdGl0bGUnKSxcclxuICAgIGNvbnRlbnQ6IHQoJ3dlYnJ0Yy50ZXJtaW5hdGVfY29uZmlybV9tZXNzYWdlJywge1xyXG4gICAgICBhcHA6IHNlbGVjdGVkQXBwTmFtZS52YWx1ZSA/PyB0KCd3ZWJydGMudGVybWluYXRlX2NvbmZpcm1fYXBwX2ZhbGxiYWNrJyksXHJcbiAgICB9KSxcclxuICAgIHBvc2l0aXZlVGV4dDogdCgnd2VicnRjLnRlcm1pbmF0ZV9jb25maXJtX2FjdGlvbicpLFxyXG4gICAgbmVnYXRpdmVUZXh0OiB0KCdfY29tbW9uLmNhbmNlbCcpLFxyXG4gICAgb25Qb3NpdGl2ZUNsaWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGF3YWl0IHRlcm1pbmF0ZVNlc3Npb24oKTtcclxuICAgICAgYXdhaXQgc3RhcnRDb25uZWN0KCk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yU3Bpbm5lckZyYW1lKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGF3YWl0IG5leHRUaWNrKCk7XHJcbiAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiByZXNvbHZlKCkpKTtcclxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHJlc29sdmUoKSkpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzdGFydENvbm5lY3QoKSB7XHJcbiAgaXNDb25uZWN0aW5nLnZhbHVlID0gdHJ1ZTtcclxuICAvLyBZaWVsZCB0byBhbGxvdyB0aGUgY29ubmVjdGluZyBzcGlubmVyIHRvIHJlbmRlciBhbmQgc3RhcnQgYW5pbWF0aW5nIGJlZm9yZSBoZWF2eSB3b3JrXHJcbiAgYXdhaXQgd2FpdEZvclNwaW5uZXJGcmFtZSgpO1xyXG4gIG5lZ290aWF0ZWRFbmNvZGluZy52YWx1ZSA9IG51bGw7XHJcbiAgaGRyUnVudGltZVdhcm5pbmcudmFsdWUgPSBudWxsO1xyXG4gIGF1ZGlvQXV0b3BsYXlSZXF1ZXN0ZWQgPSB0cnVlO1xyXG4gIHByaW1lQXVkaW9BdXRvcGxheSgpO1xyXG4gIHJlc2V0QXVkaW9EcmFpblN0YXRlKCk7XHJcbiAgY2xpZW50LnNldEF1ZGlvTGF0ZW5jeVRhcmdldHMoQVVESU9fVEFSR0VUX0JVRkZFUl9NUywgQVVESU9fVEFSR0VUX1BMQVlPVVRfTVMpO1xyXG4gIGlmIChhdXRvRnVsbHNjcmVlbi52YWx1ZSAmJiBpbnB1dFRhcmdldC52YWx1ZSAmJiAhaXNGdWxsc2NyZWVuLnZhbHVlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSBpbnB1dFRhcmdldC52YWx1ZTtcclxuICAgICAgY29uc3QgZW50ZXJlZCA9IGF3YWl0IHRyeUVudGVyRnVsbHNjcmVlbih0YXJnZXQpO1xyXG4gICAgICBpZiAoIWVudGVyZWQpIHBzZXVkb0Z1bGxzY3JlZW4udmFsdWUgPSB0cnVlO1xyXG4gICAgICBvbkZ1bGxzY3JlZW5DaGFuZ2UoKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0YXJnZXQuZm9jdXMoKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgIH1cclxuICAgICAgcmVxdWVzdEZ1bGxzY3JlZW5LZXlib2FyZExvY2soKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICB9XHJcbiAgZW5zdXJlQXVkaW9QbGF5YmFjaygnY29ubmVjdCcpO1xyXG4gIHN0b3BTZXJ2ZXJTZXNzaW9uUG9sbGluZygpO1xyXG4gIHNlc3Npb25JZC52YWx1ZSA9IG51bGw7XHJcbiAgc2VydmVyU2Vzc2lvbi52YWx1ZSA9IG51bGw7XHJcbiAgcmVzZXRTZXJ2ZXJSYXRlcygpO1xyXG4gIHRyeSB7XHJcbiAgICAvLyBEZXRlcm1pbmUgYXBwIGxhdW5jaCBtb2RlOlxyXG4gICAgLy8gLSBJZiBhbiBhcHAgaXMgc2VsZWN0ZWQsIGxhdW5jaCB0aGF0IGFwcCAoYXBwSWQgPSBzZWxlY3RlZEFwcElkLCByZXN1bWUgPSBmYWxzZSlcclxuICAgIC8vIC0gSWYgbm8gYXBwIHNlbGVjdGVkIGJ1dCBzZXNzaW9uIGNhbiBiZSByZXN1bWVkLCByZXN1bWUgaXQgKGFwcElkID0gdW5kZWZpbmVkLCByZXN1bWUgPSB0cnVlKVxyXG4gICAgLy8gLSBJZiBubyBhcHAgc2VsZWN0ZWQgYW5kIG5vdGhpbmcgdG8gcmVzdW1lLCBzdGFydCBkZXNrdG9wIChhcHBJZCA9IHVuZGVmaW5lZCwgcmVzdW1lID0gZmFsc2UpXHJcbiAgICBjb25zdCBzaG91bGRSZXN1bWUgPSAhc2VsZWN0ZWRBcHBJZC52YWx1ZSAmJiByZXN1bWVPbkNvbm5lY3QudmFsdWUgJiYgcmVzdW1lQXZhaWxhYmxlLnZhbHVlO1xyXG4gICAgY29uc3QgZWZmZWN0aXZlQXBwSWQgPSBzZWxlY3RlZEFwcElkLnZhbHVlID8/IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IGNvbm5lY3RDZmc6IFN0cmVhbUNvbmZpZyA9IHsgLi4uY29uZmlnLCByZXN1bWU6IHNob3VsZFJlc3VtZSB9O1xyXG4gICAgaWYgKGVmZmVjdGl2ZUFwcElkICE9PSB1bmRlZmluZWQpIGNvbm5lY3RDZmcuYXBwSWQgPSBlZmZlY3RpdmVBcHBJZDtcclxuICAgIGVsc2UgZGVsZXRlIGNvbm5lY3RDZmcuYXBwSWQ7XHJcbiAgICBjb25zdCBpZCA9IGF3YWl0IGNsaWVudC5jb25uZWN0KFxyXG4gICAgICBjb25uZWN0Q2ZnLFxyXG4gICAgICB7XHJcbiAgICAgICAgb25SZW1vdGVTdHJlYW06IChzdHJlYW0pID0+IHtcclxuICAgICAgICAgIGlmICh2aWRlb0VsLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc1ZpZGVvID0gdXBkYXRlVmlkZW9FbGVtZW50KHN0cmVhbSk7XHJcbiAgICAgICAgICAgIHZpZGVvRWwudmFsdWUubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmlkZW9FbC52YWx1ZS52b2x1bWUgPSAxO1xyXG4gICAgICAgICAgICB1cGRhdGVSZW1vdGVTdHJlYW1JbmZvKHN0cmVhbSk7XHJcbiAgICAgICAgICAgIHVwZGF0ZUF1ZGlvRWxlbWVudChzdHJlYW0pO1xyXG4gICAgICAgICAgICBlbnN1cmVBdWRpb1BsYXliYWNrKCdyZW1vdGUtc3RyZWFtJyk7XHJcbiAgICAgICAgICAgIGlmIChoYXNWaWRlbykge1xyXG4gICAgICAgICAgICAgIHZpZGVvU3RhcnR1cERyYWluVW50aWwgPSBEYXRlLm5vdygpICsgdmlkZW9MYXRlbmN5UHJvZmlsZS5zdGFydHVwRHJhaW5NcztcclxuICAgICAgICAgICAgICB2aWRlb1N0YXJ0dXBEcmFpblJlbGVhc2VTaW5jZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgY29uc3QgYmFzZVRhcmdldE1zID0gcmVzb2x2ZVZpZGVvQmFzZVRhcmdldE1zKCk7XHJcbiAgICAgICAgICAgICAgc2V0VmlkZW9EcmFpbk1vZGUoJ3N0YXJ0dXAnLCBiYXNlVGFyZ2V0TXMsIHJlc29sdmVWaWRlb1N0YXJ0dXBUYXJnZXRNcygpKTtcclxuICAgICAgICAgICAgICBjb25zdCBwbGF5UHJvbWlzZSA9IHZpZGVvRWwudmFsdWUucGxheSgpO1xyXG4gICAgICAgICAgICAgIGlmIChwbGF5UHJvbWlzZSAmJiB0eXBlb2YgcGxheVByb21pc2UuY2F0Y2ggPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHBsYXlQcm9taXNlLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyA/IChlcnJvciBhcyBhbnkpLm5hbWUgOiAnJztcclxuICAgICAgICAgICAgICAgICAgcHVzaFZpZGVvRXZlbnQoYHBsYXktZXJyb3Ike25hbWUgPyBgOiR7bmFtZX1gIDogJyd9YCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQ29ubmVjdGlvblN0YXRlOiAoc3RhdGUpID0+IHtcclxuICAgICAgICAgIGNvbm5lY3Rpb25TdGF0ZS52YWx1ZSA9IHN0YXRlO1xyXG4gICAgICAgICAgaXNDb25uZWN0ZWQudmFsdWUgPSBzdGF0ZSA9PT0gJ2Nvbm5lY3RlZCc7XHJcbiAgICAgICAgICBpZiAoc3RhdGUgPT09ICdjb25uZWN0ZWQnKSB7XHJcbiAgICAgICAgICAgIGFwcGx5VmlkZW9UYXJnZXRNcyhyZXNvbHZlVmlkZW9CYXNlVGFyZ2V0TXMoKSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcEluYm91bmRWaWRlb1N0YXRzVGltZXIpIHtcclxuICAgICAgICAgICAgICBjb25zdCBwYyA9IGNsaWVudC5wZWVyQ29ubmVjdGlvbjtcclxuICAgICAgICAgICAgICBpZiAocGMpXHJcbiAgICAgICAgICAgICAgICBzdG9wSW5ib3VuZFZpZGVvU3RhdHNUaW1lciA9IHN0YXJ0SW5ib3VuZFZpZGVvU3RhdHMocGMsIChzYW1wbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgaW5ib3VuZFZpZGVvU3RhdHMudmFsdWUgPSBzYW1wbGU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWRpYWdub3N0aWNzU2FtcGxlVGltZXIpIHN0YXJ0RGlhZ25vc3RpY3NTYW1wbGluZygpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2ZhaWxlZCcgfHwgc3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnIHx8IHN0YXRlID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICBpZiAoc3RvcEluYm91bmRWaWRlb1N0YXRzVGltZXIpIHtcclxuICAgICAgICAgICAgICBzdG9wSW5ib3VuZFZpZGVvU3RhdHNUaW1lcigpO1xyXG4gICAgICAgICAgICAgIHN0b3BJbmJvdW5kVmlkZW9TdGF0c1RpbWVyID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmJvdW5kVmlkZW9TdGF0cy52YWx1ZSA9IHt9O1xyXG4gICAgICAgICAgICBzdG9wRGlhZ25vc3RpY3NTYW1wbGluZygpO1xyXG4gICAgICAgICAgICBkaWFnbm9zdGljc1NhbXBsZXMudmFsdWUgPSBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uSWNlU3RhdGU6IChzdGF0ZSkgPT4ge1xyXG4gICAgICAgICAgaWNlU3RhdGUudmFsdWUgPSBzdGF0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uSW5wdXRDaGFubmVsU3RhdGU6IChzdGF0ZSkgPT4ge1xyXG4gICAgICAgICAgaW5wdXRDaGFubmVsU3RhdGUudmFsdWUgPSBzdGF0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uSW5wdXRNZXNzYWdlOiAobWVzc2FnZSkgPT4ge1xyXG4gICAgICAgICAgYXBwbHlHYW1lcGFkRmVlZGJhY2sobWVzc2FnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblN0YXRzOiAoc25hcHNob3QpID0+IHtcclxuICAgICAgICAgIHN0YXRzLnZhbHVlID0gc25hcHNob3Q7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk5lZ290aWF0ZWRFbmNvZGluZzogKGVuY29kaW5nKSA9PiB7XHJcbiAgICAgICAgICBpZiAoZW5jb2RpbmcgPT09ICdoMjY0JyB8fCBlbmNvZGluZyA9PT0gJ2hldmMnIHx8IGVuY29kaW5nID09PSAnYXYxJylcclxuICAgICAgICAgICAgbmVnb3RpYXRlZEVuY29kaW5nLnZhbHVlID0gZW5jb2Rpbmc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbldhcm5pbmc6ICh3YXJuaW5nKSA9PiB7XHJcbiAgICAgICAgICBub3RpZnlXYXJuaW5nKCdDb25maWd1cmF0aW9uIFdhcm5pbmcnLCB3YXJuaW5nKTtcclxuICAgICAgICAgIGlmIChjb25maWcuaGRyICYmIC9eaGRyXFxiL2kudGVzdCh3YXJuaW5nKSkgaGRyUnVudGltZVdhcm5pbmcudmFsdWUgPSB3YXJuaW5nO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgaW5wdXRQcmlvcml0eTogaXNGdWxsc2NyZWVuQWN0aXZlKCkgfHwgaXNUYWJBY3RpdmUoKSA/ICdoaWdoJyA6ICdsb3cnIH0sXHJcbiAgICApO1xyXG4gICAgc2Vzc2lvbklkLnZhbHVlID0gaWQ7XHJcbiAgICBzdGFydFNlcnZlclNlc3Npb25Qb2xsaW5nKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnN0IG1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBlc3RhYmxpc2ggV2ViUlRDIHNlc3Npb24uJztcclxuICAgIG5vdGlmeUVycm9yKCdDb25uZWN0aW9uIEZhaWxlZCcsIG1zZyk7XHJcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgIGF1ZGlvQXV0b3BsYXlSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuICAgIHN0b3BBdWRpb1BsYXlSZXRyeSgpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBpc0Nvbm5lY3RpbmcudmFsdWUgPSBmYWxzZTtcclxuICAgIGlmICghaXNDb25uZWN0ZWQudmFsdWUpIHN0YXJ0U2Vzc2lvblN0YXR1c1BvbGxpbmcoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbm5lY3QoKSB7XHJcbiAgaWYgKGlzQ29ubmVjdGluZy52YWx1ZSkgcmV0dXJuO1xyXG4gIC8vIEFsd2F5cyBmZXRjaCBzZXNzaW9uIHN0YXR1cyB0byBrbm93IGlmIHdlIGNhbiByZXN1bWVcclxuICBpZiAoIXNlc3Npb25TdGF0dXMudmFsdWUpIGF3YWl0IGZldGNoU2Vzc2lvblN0YXR1cygpO1xyXG4gIGlmIChzZWxlY3RlZEFwcElkLnZhbHVlICYmIGhhc1J1bm5pbmdTZXNzaW9uLnZhbHVlKSB7XHJcbiAgICBhd2FpdCBjb25maXJtVGVybWluYXRlQW5kQ29ubmVjdCgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBhd2FpdCBzdGFydENvbm5lY3QoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcclxuICBhd2FpdCBjbGllbnQuZGlzY29ubmVjdCgpO1xyXG4gIHN0b3BTZXJ2ZXJTZXNzaW9uUG9sbGluZygpO1xyXG4gIGlzQ29ubmVjdGVkLnZhbHVlID0gZmFsc2U7XHJcbiAgY29ubmVjdGlvblN0YXRlLnZhbHVlID0gbnVsbDtcclxuICBpY2VTdGF0ZS52YWx1ZSA9IG51bGw7XHJcbiAgaW5wdXRDaGFubmVsU3RhdGUudmFsdWUgPSBudWxsO1xyXG4gIHN0YXRzLnZhbHVlID0ge307XHJcbiAgaW5wdXRNZXRyaWNzLnZhbHVlID0ge307XHJcbiAgaW5wdXRCdWZmZXJlZEFtb3VudC52YWx1ZSA9IG51bGw7XHJcbiAgdmlkZW9GcmFtZU1ldHJpY3MudmFsdWUgPSB7fTtcclxuICB2aWRlb1BhY2luZ01ldHJpY3MudmFsdWUgPSB7fTtcclxuICBpbmJvdW5kVmlkZW9TdGF0cy52YWx1ZSA9IHt9O1xyXG4gIGRpYWdub3N0aWNzU2FtcGxlcy52YWx1ZSA9IFtdO1xyXG4gIHN0b3BEaWFnbm9zdGljc1NhbXBsaW5nKCk7XHJcbiAgaWYgKHN0b3BJbmJvdW5kVmlkZW9TdGF0c1RpbWVyKSB7XHJcbiAgICBzdG9wSW5ib3VuZFZpZGVvU3RhdHNUaW1lcigpO1xyXG4gICAgc3RvcEluYm91bmRWaWRlb1N0YXRzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICBzbW9vdGhlZFZpZGVvRnBzLnZhbHVlID0gdW5kZWZpbmVkO1xyXG4gIGxhc3RWaWRlb0Zwc1NhbXBsZUF0ID0gbnVsbDtcclxuICBsYXN0UGxheWJhY2tSYXRlVXBkYXRlQXQgPSBudWxsO1xyXG4gIG1vZGVTd2l0Y2hEcmFpblVudGlsID0gbnVsbDtcclxuICBkZXRhY2hJbnB1dENhcHR1cmUoKTtcclxuICBpZiAodmlkZW9FbC52YWx1ZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmlkZW9FbC52YWx1ZS5wbGF5YmFja1JhdGUgPSAxO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgfVxyXG4gICAgdmlkZW9FbC52YWx1ZS5zcmNPYmplY3QgPSBudWxsO1xyXG4gIH1cclxuICBpZiAoYXVkaW9FbC52YWx1ZSkgYXVkaW9FbC52YWx1ZS5zcmNPYmplY3QgPSBudWxsO1xyXG4gIHZpZGVvU3RyZWFtID0gbnVsbDtcclxuICBhdWRpb1N0cmVhbSA9IG51bGw7XHJcbiAgYXVkaW9BdXRvcGxheVJlcXVlc3RlZCA9IGZhbHNlO1xyXG4gIHN0b3BBdWRpb1BsYXlSZXRyeSgpO1xyXG4gIHJlc2V0QXVkaW9EcmFpblN0YXRlKCk7XHJcbiAgcmVzZXRWaWRlb0RyYWluU3RhdGUoKTtcclxuICBsYXN0VmlkZW9UYXJnZXRNcyA9IHVuZGVmaW5lZDtcclxuICBkZXNpcmVkVmlkZW9UYXJnZXRNcyA9IHVuZGVmaW5lZDtcclxuICBlZmZlY3RpdmVWaWRlb1RhcmdldE1zID0gdW5kZWZpbmVkO1xyXG4gIGxhc3RWaWRlb1RhcmdldEFkanVzdEF0ID0gbnVsbDtcclxuICB2aWRlb1N0YXJ0dXBEcmFpblVudGlsID0gbnVsbDtcclxuICB2aWRlb1N0YXJ0dXBEcmFpblJlbGVhc2VTaW5jZSA9IG51bGw7XHJcbiAgc2FmYXJpUnVuYXdheURyYWluU2luY2UgPSBudWxsO1xyXG4gIHNhZmFyaVJ1bmF3YXlEcmFpbkxhdGNoZWQgPSBmYWxzZTtcclxuICBzYWZhcmlSdW5hd2F5UmVzZXRTaW5jZSA9IG51bGw7XHJcbiAgc2Vzc2lvbklkLnZhbHVlID0gbnVsbDtcclxuICBzZXJ2ZXJTZXNzaW9uLnZhbHVlID0gbnVsbDtcclxuICByZXNldFNlcnZlclJhdGVzKCk7XHJcbiAgcmVtb3RlU3RyZWFtSW5mby52YWx1ZSA9IG51bGw7XHJcbiAgbGFzdFRyYWNrU25hcHNob3QgPSBudWxsO1xyXG4gIHZpZGVvRXZlbnRzLnZhbHVlID0gW107XHJcbiAgdmlkZW9TdGF0ZVRpY2sudmFsdWUgKz0gMTtcclxuICBzdGFydFNlc3Npb25TdGF0dXNQb2xsaW5nKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRlcm1pbmF0ZVNlc3Npb24oKSB7XHJcbiAgaWYgKHRlcm1pbmF0ZVBlbmRpbmcudmFsdWUpIHJldHVybjtcclxuICB0ZXJtaW5hdGVQZW5kaW5nLnZhbHVlID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgaHR0cC5wb3N0KCcvYXBpL2FwcHMvY2xvc2UnLCB7fSwgeyB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc3QgbXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIHRlcm1pbmF0ZSBzZXNzaW9uLic7XHJcbiAgICBub3RpZnlFcnJvcignVGVybWluYXRpb24gRmFpbGVkJywgbXNnKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgYXdhaXQgZGlzY29ubmVjdCgpO1xyXG4gICAgdGVybWluYXRlUGVuZGluZy52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlRnVsbHNjcmVlbigpIHtcclxuICB0cnkge1xyXG4gICAgaWYgKHBzZXVkb0Z1bGxzY3JlZW4udmFsdWUgJiYgIWlzRnVsbHNjcmVlbkFjdGl2ZSgpKSB7XHJcbiAgICAgIHBzZXVkb0Z1bGxzY3JlZW4udmFsdWUgPSBmYWxzZTtcclxuICAgICAgb25GdWxsc2NyZWVuQ2hhbmdlKCk7XHJcbiAgICAgIHJlbGVhc2VGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChpc0Z1bGxzY3JlZW5BY3RpdmUoKSkge1xyXG4gICAgICBhd2FpdCBleGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICByZWxlYXNlRnVsbHNjcmVlbktleWJvYXJkTG9jaygpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoIWlucHV0VGFyZ2V0LnZhbHVlKSByZXR1cm47XHJcbiAgICBjb25zdCB0YXJnZXQgPSBpbnB1dFRhcmdldC52YWx1ZTtcclxuICAgIGNvbnN0IGVudGVyZWQgPSBhd2FpdCB0cnlFbnRlckZ1bGxzY3JlZW4odGFyZ2V0KTtcclxuICAgIGlmICghZW50ZXJlZCkgcHNldWRvRnVsbHNjcmVlbi52YWx1ZSA9IHRydWU7XHJcbiAgICBvbkZ1bGxzY3JlZW5DaGFuZ2UoKTtcclxuICAgIHJlcXVlc3RGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICB0YXJnZXQuZm9jdXMoKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBpZ25vcmUgKi9cclxuICAgIH1cclxuICAgIHJlcXVlc3RGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgKi9cclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG9uRnVsbHNjcmVlbkRibENsaWNrKCkge1xyXG4gIGlmIChpc0Z1bGxzY3JlZW5BY3RpdmUoKSkgcmV0dXJuO1xyXG4gIGF3YWl0IHRvZ2dsZUZ1bGxzY3JlZW4oKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGV0YWNoSW5wdXRDYXB0dXJlKCkge1xyXG4gIGlmIChkZXRhY2hJbnB1dCkge1xyXG4gICAgZGV0YWNoSW5wdXQoKTtcclxuICAgIGRldGFjaElucHV0ID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbndhdGNoKFxyXG4gICgpID0+IFtpbnB1dEVuYWJsZWQudmFsdWUsIGlzQ29ubmVjdGVkLnZhbHVlXSxcclxuICAoW2VuYWJsZWQsIGNvbm5lY3RlZF0pID0+IHtcclxuICAgIGRldGFjaElucHV0Q2FwdHVyZSgpO1xyXG4gICAgaWYgKCFlbmFibGVkIHx8ICFjb25uZWN0ZWQgfHwgIWlucHV0VGFyZ2V0LnZhbHVlKSB7XHJcbiAgICAgIHJlbGVhc2VGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGRldGFjaElucHV0ID0gYXR0YWNoSW5wdXRDYXB0dXJlKFxyXG4gICAgICBpbnB1dFRhcmdldC52YWx1ZSxcclxuICAgICAgKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjbGllbnQuc2VuZElucHV0KHBheWxvYWQpO1xyXG4gICAgICAgIGlucHV0QnVmZmVyZWRBbW91bnQudmFsdWUgPSBjbGllbnQuaW5wdXRDaGFubmVsQnVmZmVyZWRBbW91bnQgPz8gbnVsbDtcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZpZGVvOiB2aWRlb0VsLnZhbHVlLFxyXG4gICAgICAgIG9uTWV0cmljczogKG1ldHJpY3MpID0+IHtcclxuICAgICAgICAgIGlucHV0TWV0cmljcy52YWx1ZSA9IG1ldHJpY3M7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG91bGREcm9wOiBzaG91bGREcm9wSW5wdXQsXHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG4gICAgaWYgKGlzRnVsbHNjcmVlbkFjdGl2ZSgpKSByZXF1ZXN0RnVsbHNjcmVlbktleWJvYXJkTG9jaygpO1xyXG4gIH0sXHJcbik7XHJcblxyXG5mdW5jdGlvbiBhdHRhY2hWaWRlb0Z1bGxzY3JlZW5FdmVudHMoZWw6IEhUTUxWaWRlb0VsZW1lbnQpOiAoKSA9PiB2b2lkIHtcclxuICBjb25zdCBvbkJlZ2luID0gKCkgPT4ge1xyXG4gICAgbmF0aXZlVmlkZW9GdWxsc2NyZWVuLnZhbHVlID0gdHJ1ZTtcclxuICAgIG9uRnVsbHNjcmVlbkNoYW5nZSgpO1xyXG4gIH07XHJcbiAgY29uc3Qgb25FbmQgPSAoKSA9PiB7XHJcbiAgICBuYXRpdmVWaWRlb0Z1bGxzY3JlZW4udmFsdWUgPSBmYWxzZTtcclxuICAgIG9uRnVsbHNjcmVlbkNoYW5nZSgpO1xyXG4gIH07XHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0YmVnaW5mdWxsc2NyZWVuJywgb25CZWdpbiBhcyBFdmVudExpc3RlbmVyKTtcclxuICBlbC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRlbmRmdWxsc2NyZWVuJywgb25FbmQgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgcmV0dXJuICgpID0+IHtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdGJlZ2luZnVsbHNjcmVlbicsIG9uQmVnaW4gYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRlbmRmdWxsc2NyZWVuJywgb25FbmQgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgfTtcclxufVxyXG5cclxud2F0Y2godmlkZW9FbCwgKGVsKSA9PiB7XHJcbiAgaWYgKGRldGFjaFZpZGVvRXZlbnRzKSB7XHJcbiAgICBkZXRhY2hWaWRlb0V2ZW50cygpO1xyXG4gICAgZGV0YWNoVmlkZW9FdmVudHMgPSBudWxsO1xyXG4gIH1cclxuICBpZiAoZGV0YWNoVmlkZW9GcmFtZXMpIHtcclxuICAgIGRldGFjaFZpZGVvRnJhbWVzKCk7XHJcbiAgICBkZXRhY2hWaWRlb0ZyYW1lcyA9IG51bGw7XHJcbiAgfVxyXG4gIGlmIChkZXRhY2hWaWRlb1BhY2luZykge1xyXG4gICAgZGV0YWNoVmlkZW9QYWNpbmcoKTtcclxuICAgIGRldGFjaFZpZGVvUGFjaW5nID0gbnVsbDtcclxuICB9XHJcbiAgaWYgKGRldGFjaFZpZGVvRnVsbHNjcmVlbkV2ZW50cykge1xyXG4gICAgZGV0YWNoVmlkZW9GdWxsc2NyZWVuRXZlbnRzKCk7XHJcbiAgICBkZXRhY2hWaWRlb0Z1bGxzY3JlZW5FdmVudHMgPSBudWxsO1xyXG4gIH1cclxuICBpZiAoIWVsKSByZXR1cm47XHJcbiAgZGV0YWNoVmlkZW9FdmVudHMgPSBhdHRhY2hWaWRlb0RlYnVnKGVsKTtcclxuICBkZXRhY2hWaWRlb0ZyYW1lcyA9IGF0dGFjaFZpZGVvRnJhbWVNZXRyaWNzKGVsKTtcclxuICBkZXRhY2hWaWRlb1BhY2luZyA9IGF0dGFjaFZpZGVvUGFjaW5nUHJvYmUoZWwsIChzYW1wbGUpID0+IHtcclxuICAgIHZpZGVvUGFjaW5nTWV0cmljcy52YWx1ZSA9IHNhbXBsZTtcclxuICB9KTtcclxuICBkZXRhY2hWaWRlb0Z1bGxzY3JlZW5FdmVudHMgPSBhdHRhY2hWaWRlb0Z1bGxzY3JlZW5FdmVudHMoZWwpO1xyXG59KTtcclxuXHJcbm9uQmVmb3JlVW5tb3VudCgoKSA9PiB7XHJcbiAgc2V0V2ViUnRjQWN0aXZlKGZhbHNlKTtcclxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgb25GdWxsc2NyZWVuQ2hhbmdlKTtcclxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgb25GdWxsc2NyZWVuQ2hhbmdlIGFzIEV2ZW50TGlzdGVuZXIpO1xyXG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCBvblZpc2liaWxpdHlDaGFuZ2UpO1xyXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uQXVkaW9Vc2VyR2VzdHVyZSBhcyBFdmVudExpc3RlbmVyLCB0cnVlKTtcclxuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uQXVkaW9Vc2VyR2VzdHVyZSBhcyBFdmVudExpc3RlbmVyLCB0cnVlKTtcclxuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uT3ZlcmxheUhvdGtleSwgdHJ1ZSk7XHJcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbkZ1bGxzY3JlZW5Fc2NhcGVEb3duLCB0cnVlKTtcclxuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBvbkZ1bGxzY3JlZW5Fc2NhcGVVcCwgdHJ1ZSk7XHJcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BhZ2VoaWRlJywgb25QYWdlSGlkZSk7XHJcbiAgY2FuY2VsRXNjSG9sZCgpO1xyXG4gIGlmIChkZXRhY2hWaWRlb0V2ZW50cykge1xyXG4gICAgZGV0YWNoVmlkZW9FdmVudHMoKTtcclxuICAgIGRldGFjaFZpZGVvRXZlbnRzID0gbnVsbDtcclxuICB9XHJcbiAgaWYgKGRldGFjaFZpZGVvRnJhbWVzKSB7XHJcbiAgICBkZXRhY2hWaWRlb0ZyYW1lcygpO1xyXG4gICAgZGV0YWNoVmlkZW9GcmFtZXMgPSBudWxsO1xyXG4gIH1cclxuICBpZiAoZGV0YWNoVmlkZW9QYWNpbmcpIHtcclxuICAgIGRldGFjaFZpZGVvUGFjaW5nKCk7XHJcbiAgICBkZXRhY2hWaWRlb1BhY2luZyA9IG51bGw7XHJcbiAgfVxyXG4gIGlmIChkZXRhY2hWaWRlb0Z1bGxzY3JlZW5FdmVudHMpIHtcclxuICAgIGRldGFjaFZpZGVvRnVsbHNjcmVlbkV2ZW50cygpO1xyXG4gICAgZGV0YWNoVmlkZW9GdWxsc2NyZWVuRXZlbnRzID0gbnVsbDtcclxuICB9XHJcbiAgaWYgKHN0b3BJbmJvdW5kVmlkZW9TdGF0c1RpbWVyKSB7XHJcbiAgICBzdG9wSW5ib3VuZFZpZGVvU3RhdHNUaW1lcigpO1xyXG4gICAgc3RvcEluYm91bmRWaWRlb1N0YXRzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICBzdG9wRGlhZ25vc3RpY3NTYW1wbGluZygpO1xyXG4gIHN0b3BXZWJydGNEaWFnbm9zdGljcygpO1xyXG4gIHN0b3BTZXNzaW9uU3RhdHVzUG9sbGluZygpO1xyXG4gIHJlbGVhc2VGdWxsc2NyZWVuS2V5Ym9hcmRMb2NrKCk7XHJcbiAgc3RvcFNlcnZlclNlc3Npb25Qb2xsaW5nKCk7XHJcbiAgdm9pZCBkaXNjb25uZWN0KCk7XHJcbn0pO1xyXG5cclxub25Nb3VudGVkKGFzeW5jICgpID0+IHtcclxuICBsb2FkQ2FjaGVkQ29uZmlnKCk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbHNjcmVlbkNoYW5nZSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbHNjcmVlbkNoYW5nZSBhcyBFdmVudExpc3RlbmVyKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgb25WaXNpYmlsaXR5Q2hhbmdlKTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBvbkF1ZGlvVXNlckdlc3R1cmUgYXMgRXZlbnRMaXN0ZW5lciwgdHJ1ZSk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbkF1ZGlvVXNlckdlc3R1cmUgYXMgRXZlbnRMaXN0ZW5lciwgdHJ1ZSk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbk92ZXJsYXlIb3RrZXksIHRydWUpO1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25GdWxsc2NyZWVuRXNjYXBlRG93biwgdHJ1ZSk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgb25GdWxsc2NyZWVuRXNjYXBlVXAsIHRydWUpO1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwYWdlaGlkZScsIG9uUGFnZUhpZGUpO1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBhcHBzU3RvcmUubG9hZEFwcHModHJ1ZSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgKi9cclxuICB9XHJcbiAgZW5jb2RpbmdTdXBwb3J0LnZhbHVlID0gZGV0ZWN0RW5jb2RpbmdTdXBwb3J0KCk7XHJcbiAgaWYgKGNvbmZpZy5oZHIpIGVuc3VyZUhkckVuY29kaW5nKCk7XHJcbiAgc3RhcnRTZXNzaW9uU3RhdHVzUG9sbGluZygpO1xyXG59KTtcclxuXHJcbndhdGNoKFxyXG4gICgpID0+IGlzQ29ubmVjdGVkLnZhbHVlLFxyXG4gIChjb25uZWN0ZWQpID0+IHtcclxuICAgIGlmIChjb25uZWN0ZWQpIHtcclxuICAgICAgc3RvcFNlc3Npb25TdGF0dXNQb2xsaW5nKCk7XHJcbiAgICAgIHN0YXJ0V2VicnRjRGlhZ25vc3RpY3MoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc3RvcFdlYnJ0Y0RpYWdub3N0aWNzKCk7XHJcbiAgICBzdGFydFNlc3Npb25TdGF0dXNQb2xsaW5nKCk7XHJcbiAgfSxcclxuKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGUgc2NvcGVkPlxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICBNT0RFUk4gV0VCUlRDIFVJXHJcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4ud2VicnRjLWFwcCB7XHJcbiAgLS1hY2NlbnQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgLS1zdXJmYWNlOiByZ2IodmFyKC0tY29sb3Itc3VyZmFjZSkpO1xyXG4gIC0tYm9yZGVyOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjEpO1xyXG4gIC0tdGV4dC0xOiByZ2IodmFyKC0tY29sb3Itb24tbGlnaHQpKTtcclxuICAtLXRleHQtMjogcmdiKHZhcigtLWNvbG9yLW9uLWxpZ2h0KSAvIDAuNyk7XHJcbiAgLS10ZXh0LTM6IHJnYih2YXIoLS1jb2xvci1vbi1saWdodCkgLyAwLjUpO1xyXG5cclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIG1pbi1oZWlnaHQ6IDEwMHZoO1xyXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYih2YXIoLS1jb2xvci1saWdodCkpIDAlLCByZ2IodmFyKC0tY29sb3Itc3VyZmFjZSkpIDEwMCUpO1xyXG4gIHRyYW5zaXRpb246IHBhZGRpbmctcmlnaHQgMC4zcyBlYXNlO1xyXG59XHJcblxyXG4uZGFyayAud2VicnRjLWFwcCB7XHJcbiAgLS1ib3JkZXI6IHJnYigyNTUgMjU1IDI1NSAvIDAuMDgpO1xyXG4gIC0tdGV4dC0xOiByZ2IodmFyKC0tY29sb3Itb24tZGFyaykpO1xyXG4gIC0tdGV4dC0yOiByZ2IodmFyKC0tY29sb3Itb24tZGFyaykgLyAwLjcpO1xyXG4gIC0tdGV4dC0zOiByZ2IodmFyKC0tY29sb3Itb24tZGFyaykgLyAwLjUpO1xyXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYih2YXIoLS1jb2xvci1kYXJrKSkgMCUsIHJnYigxMCAxMiAyMCkgMTAwJSk7XHJcbn1cclxuXHJcbi53ZWJydGMtYXBwLnNldHRpbmdzLW9wZW4ge1xyXG4gIHBhZGRpbmctcmlnaHQ6IDM4MHB4O1xyXG59XHJcblxyXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcclxuICAud2VicnRjLWFwcC5zZXR0aW5ncy1vcGVuIHtcclxuICAgIHBhZGRpbmctcmlnaHQ6IDA7XHJcbiAgfVxyXG59XHJcblxyXG4ubWFpbi1jb250ZW50IHtcclxuICBmbGV4OiAxO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBtaW4td2lkdGg6IDA7XHJcbn1cclxuXHJcbi8qIEhlYWRlciAqL1xyXG4uYXBwLWhlYWRlciB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICBwYWRkaW5nOiAxcmVtIDEuNXJlbTtcclxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3Itc3VyZmFjZSkgLyAwLjUpO1xyXG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcclxuICBnYXA6IDFyZW07XHJcbiAgZmxleC13cmFwOiB3cmFwO1xyXG59XHJcblxyXG4uaGVhZGVyLWxlZnQsXHJcbi5oZWFkZXItcmlnaHQge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNzVyZW07XHJcbn1cclxuXHJcbi5oZWFkZXItY2VudGVyIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAxcmVtO1xyXG4gIGZsZXgtd3JhcDogd3JhcDtcclxufVxyXG5cclxuLmJyYW5kIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjYyNXJlbTtcclxufVxyXG5cclxuLmJyYW5kLWljb24ge1xyXG4gIHdpZHRoOiAycmVtO1xyXG4gIGhlaWdodDogMnJlbTtcclxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpLCByZ2IodmFyKC0tY29sb3Itc2Vjb25kYXJ5KSkpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgY29sb3I6IHdoaXRlO1xyXG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XHJcbiAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMjUpO1xyXG59XHJcblxyXG4uYnJhbmQgaDEge1xyXG4gIGZvbnQtc2l6ZTogMXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIG1hcmdpbjogMDtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0xKTtcclxufVxyXG5cclxuLnN0YXR1cy1waWxsIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgcGFkZGluZzogMC4zNzVyZW0gMC44NzVyZW07XHJcbiAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZSk7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBib3JkZXItcmFkaXVzOiAycmVtO1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTIpO1xyXG4gIHRyYW5zaXRpb246IGFsbCAwLjJzO1xyXG59XHJcblxyXG4uc3RhdHVzLXBpbGwuY29ubmVjdGVkIHtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3Itc3VjY2VzcykgLyAwLjEpO1xyXG4gIGJvcmRlci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXN1Y2Nlc3MpIC8gMC4zKTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXN1Y2Nlc3MpKTtcclxufVxyXG5cclxuLnN0YXR1cy1waWxsLmNvbm5lY3Rpbmcge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci13YXJuaW5nKSAvIDAuMSk7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3Itd2FybmluZykgLyAwLjMpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3Itd2FybmluZykpO1xyXG59XHJcblxyXG4uc3RhdHVzLWRvdCB7XHJcbiAgd2lkdGg6IDAuNXJlbTtcclxuICBoZWlnaHQ6IDAuNXJlbTtcclxuICBiYWNrZ3JvdW5kOiBjdXJyZW50Q29sb3I7XHJcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIGFuaW1hdGlvbjogcHVsc2UgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XHJcbn1cclxuXHJcbkBrZXlmcmFtZXMgcHVsc2Uge1xyXG4gIDAlLFxyXG4gIDEwMCUge1xyXG4gICAgb3BhY2l0eTogMC41O1xyXG4gIH1cclxuICA1MCUge1xyXG4gICAgb3BhY2l0eTogMTtcclxuICB9XHJcbn1cclxuXHJcbi5zZXR0aW5ncy1idG4ge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNXJlbTtcclxuICBwYWRkaW5nOiAwLjVyZW0gMC44NzVyZW07XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xKTtcclxuICBib3JkZXI6IDFweCBzb2xpZCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjIpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBmb250LXdlaWdodDogNTAwO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcclxufVxyXG5cclxuLnNldHRpbmdzLWJ0biBpIHtcclxuICBmb250LXNpemU6IDAuODc1cmVtO1xyXG59XHJcblxyXG4uc2V0dGluZ3MtYnRuOmhvdmVyIHtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjE1KTtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMzUpO1xyXG59XHJcblxyXG4uc2V0dGluZ3MtYnRuLmFjdGl2ZSB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgY29sb3I6IHdoaXRlO1xyXG59XHJcblxyXG4vKiBMaWJyYXJ5IFNlY3Rpb24gKi9cclxuLmxpYnJhcnktc2VjdGlvbiB7XHJcbiAgZmxleDogMTtcclxuICBwYWRkaW5nOiAxLjVyZW07XHJcbiAgb3ZlcmZsb3cteTogYXV0bztcclxufVxyXG5cclxuLmxpYnJhcnktaGVhZGVyIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAxcmVtO1xyXG4gIG1hcmdpbi1ib3R0b206IDEuMjVyZW07XHJcbn1cclxuXHJcbi5saWJyYXJ5LXRpdGxlLXJvdyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICBmbGV4LXdyYXA6IHdyYXA7XHJcbiAgZ2FwOiAwLjc1cmVtO1xyXG59XHJcblxyXG4ubGlicmFyeS1oZWFkZXIgaDIge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNXJlbTtcclxuICBmb250LXNpemU6IDEuMTI1cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgbWFyZ2luOiAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTEpO1xyXG59XHJcblxyXG4ubGlicmFyeS1oZWFkZXIgaDIgaSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbn1cclxuXHJcbi8qIFNlYXJjaCBCb3ggKi9cclxuLnNlYXJjaC1ib3gge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNjI1cmVtO1xyXG4gIHBhZGRpbmc6IDAuNjI1cmVtIDAuODc1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UpO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xyXG4gIHRyYW5zaXRpb246IGFsbCAwLjJzO1xyXG59XHJcblxyXG4uc2VhcmNoLWJveDpmb2N1cy13aXRoaW4ge1xyXG4gIGJvcmRlci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC41KTtcclxuICBib3gtc2hhZG93OiAwIDAgMCAzcHggcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xKTtcclxufVxyXG5cclxuLnNlYXJjaC1ib3ggaSB7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMyk7XHJcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcclxufVxyXG5cclxuLnNlYXJjaC1pbnB1dCB7XHJcbiAgZmxleDogMTtcclxuICBiYWNrZ3JvdW5kOiBub25lO1xyXG4gIGJvcmRlcjogbm9uZTtcclxuICBvdXRsaW5lOiBub25lO1xyXG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMSk7XHJcbiAgbWluLXdpZHRoOiAwO1xyXG59XHJcblxyXG4uc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMyk7XHJcbn1cclxuXHJcbi5zZWFyY2gtY2xlYXIge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICB3aWR0aDogMS4yNXJlbTtcclxuICBoZWlnaHQ6IDEuMjVyZW07XHJcbiAgYmFja2dyb3VuZDogdmFyKC0tdGV4dC0zKTtcclxuICBib3JkZXI6IG5vbmU7XHJcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIGNvbG9yOiB2YXIoLS1zdXJmYWNlKTtcclxuICBmb250LXNpemU6IDAuNjI1cmVtO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxuICBvcGFjaXR5OiAwLjY7XHJcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzO1xyXG59XHJcblxyXG4uc2VhcmNoLWNsZWFyOmhvdmVyIHtcclxuICBvcGFjaXR5OiAxO1xyXG59XHJcblxyXG4uc2VsZWN0aW9uLWJhZGdlIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgcGFkZGluZzogMC4zNzVyZW0gMC43NXJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjEpO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMyk7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxuICBmb250LXdlaWdodDogNTAwO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG59XHJcblxyXG4uc2VsZWN0aW9uLWJhZGdlIGkge1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxufVxyXG5cclxuLmNsZWFyLWJ0biB7XHJcbiAgYmFja2dyb3VuZDogbm9uZTtcclxuICBib3JkZXI6IG5vbmU7XHJcbiAgcGFkZGluZzogMC4yNXJlbTtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgY29sb3I6IGluaGVyaXQ7XHJcbiAgb3BhY2l0eTogMC43O1xyXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcclxufVxyXG5cclxuLmNsZWFyLWJ0bjpob3ZlciB7XHJcbiAgb3BhY2l0eTogMTtcclxufVxyXG5cclxuLyogR2FtZXMgR3JpZCAqL1xyXG4uZ2FtZXMtZ3JpZCB7XHJcbiAgZGlzcGxheTogZ3JpZDtcclxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpbGwsIG1pbm1heCgxNjBweCwgMWZyKSk7XHJcbiAgZ2FwOiAxcmVtO1xyXG59XHJcblxyXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XHJcbiAgLmdhbWVzLWdyaWQge1xyXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMTgwcHgsIDFmcikpO1xyXG4gIH1cclxufVxyXG5cclxuLmdhbWUtY2FyZCB7XHJcbiAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZSk7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xyXG4gIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIHRyYW5zaXRpb246IGFsbCAwLjJzO1xyXG4gIHRleHQtYWxpZ246IGxlZnQ7XHJcbn1cclxuXHJcbi5nYW1lLWNhcmQ6aG92ZXIge1xyXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNHB4KTtcclxuICBib3gtc2hhZG93OiAwIDhweCAyNHB4IHJnYigwIDAgMCAvIDAuMTUpO1xyXG4gIGJvcmRlci1jb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4zKTtcclxufVxyXG5cclxuLmdhbWUtY2FyZC5zZWxlY3RlZCB7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG4gIGJveC1zaGFkb3c6XHJcbiAgICAwIDAgMCAycHggcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4yKSxcclxuICAgIDAgOHB4IDI0cHggcmdiKDAgMCAwIC8gMC4xNSk7XHJcbn1cclxuXHJcbi5nYW1lLWNvdmVyIHtcclxuICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgYXNwZWN0LXJhdGlvOiAzIC8gNDtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjEpO1xyXG4gIG92ZXJmbG93OiBoaWRkZW47XHJcbn1cclxuXHJcbi5nYW1lLWNvdmVyIGltZyB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG4gIG9iamVjdC1maXQ6IGNvdmVyO1xyXG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzO1xyXG59XHJcblxyXG4uZ2FtZS1jYXJkOmhvdmVyIC5nYW1lLWNvdmVyIGltZyB7XHJcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcclxufVxyXG5cclxuLmNvdmVyLWdyYWRpZW50IHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgaW5zZXQ6IDA7XHJcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQgNTAlLCByZ2IoMCAwIDAgLyAwLjcpIDEwMCUpO1xyXG59XHJcblxyXG4uc2VsZWN0ZWQtYmFkZ2Uge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB0b3A6IDAuNXJlbTtcclxuICByaWdodDogMC41cmVtO1xyXG4gIHdpZHRoOiAxLjVyZW07XHJcbiAgaGVpZ2h0OiAxLjVyZW07XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxuICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGNvbG9yOiB3aGl0ZTtcclxuICBmb250LXNpemU6IDAuNjI1cmVtO1xyXG59XHJcblxyXG4ucGxheS1vdmVybGF5IHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgaW5zZXQ6IDA7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuOSk7XHJcbiAgY29sb3I6IHdoaXRlO1xyXG4gIGZvbnQtc2l6ZTogMnJlbTtcclxuICBvcGFjaXR5OiAwO1xyXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcclxufVxyXG5cclxuLmdhbWUtY2FyZDpob3ZlciAucGxheS1vdmVybGF5IHtcclxuICBvcGFjaXR5OiAxO1xyXG59XHJcblxyXG4uZ2FtZS1tZXRhIHtcclxuICBwYWRkaW5nOiAwLjc1cmVtO1xyXG59XHJcblxyXG4uZ2FtZS1uYW1lIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTEpO1xyXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcclxufVxyXG5cclxuLmdhbWUtc291cmNlIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICBmb250LXNpemU6IDAuNjg3NXJlbTtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0zKTtcclxuICBtYXJnaW4tdG9wOiAwLjEyNXJlbTtcclxufVxyXG5cclxuLyogT3RoZXIgQXBwbGljYXRpb25zIFNlY3Rpb24gKGxpc3QgdmlldykgKi9cclxuLm90aGVyLWFwcHMtc2VjdGlvbiB7XHJcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xyXG4gIHBhZGRpbmctdG9wOiAxLjVyZW07XHJcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbn1cclxuXHJcbi5zZWN0aW9uLWxhYmVsIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTIpO1xyXG4gIG1hcmdpbjogMCAwIDAuODc1cmVtO1xyXG59XHJcblxyXG4uc2VjdGlvbi1sYWJlbCBpIHtcclxuICBmb250LXNpemU6IDAuNzVyZW07XHJcbiAgb3BhY2l0eTogMC43O1xyXG59XHJcblxyXG4uYXBwcy1saXN0IHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAwLjM3NXJlbTtcclxufVxyXG5cclxuLmFwcC1saXN0LWl0ZW0ge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNzVyZW07XHJcbiAgcGFkZGluZzogMC42MjVyZW0gMC44NzVyZW07XHJcbiAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZSk7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBib3JkZXItcmFkaXVzOiAwLjVyZW07XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIHRyYW5zaXRpb246IGFsbCAwLjE1cztcclxuICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG59XHJcblxyXG4uYXBwLWxpc3QtaXRlbTpob3ZlciB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4wNSk7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjIpO1xyXG59XHJcblxyXG4uYXBwLWxpc3QtaXRlbS5zZWxlY3RlZCB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xKTtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuNCk7XHJcbn1cclxuXHJcbi5hcHAtaWNvbiB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIHdpZHRoOiAycmVtO1xyXG4gIGhlaWdodDogMnJlbTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjEpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XHJcbiAgZmxleC1zaHJpbms6IDA7XHJcbn1cclxuXHJcbi5hcHAtaW5mbyB7XHJcbiAgZmxleDogMTtcclxuICBtaW4td2lkdGg6IDA7XHJcbn1cclxuXHJcbi5hcHAtaW5mbyAuYXBwLW5hbWUge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMSk7XHJcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xyXG59XHJcblxyXG4uYXBwLWluZm8gLmFwcC1zb3VyY2Uge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIGZvbnQtc2l6ZTogMC42ODc1cmVtO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTMpO1xyXG4gIG1hcmdpbi10b3A6IDAuMTI1cmVtO1xyXG59XHJcblxyXG4uYXBwLXNlbGVjdGVkLWljb24ge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICB3aWR0aDogMS41cmVtO1xyXG4gIGhlaWdodDogMS41cmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIGNvbG9yOiB3aGl0ZTtcclxuICBmb250LXNpemU6IDAuNjI1cmVtO1xyXG4gIGZsZXgtc2hyaW5rOiAwO1xyXG59XHJcblxyXG4uYXBwLXBsYXktaWNvbiB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIHdpZHRoOiAxLjVyZW07XHJcbiAgaGVpZ2h0OiAxLjVyZW07XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMyk7XHJcbiAgZm9udC1zaXplOiAwLjc1cmVtO1xyXG4gIGZsZXgtc2hyaW5rOiAwO1xyXG4gIG9wYWNpdHk6IDA7XHJcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cztcclxufVxyXG5cclxuLmFwcC1saXN0LWl0ZW06aG92ZXIgLmFwcC1wbGF5LWljb24ge1xyXG4gIG9wYWNpdHk6IDE7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbn1cclxuXHJcbi5hcHAtbGlzdC1pdGVtLnNlbGVjdGVkIC5hcHAtcGxheS1pY29uIHtcclxuICBkaXNwbGF5OiBub25lO1xyXG59XHJcblxyXG4uZW1wdHktc3RhdGUge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIHBhZGRpbmc6IDRyZW0gMnJlbTtcclxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMyk7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbn1cclxuXHJcbi5lbXB0eS1pY29uLXdyYXAge1xyXG4gIHdpZHRoOiA1NnB4O1xyXG4gIGhlaWdodDogNTZweDtcclxuICBib3JkZXItcmFkaXVzOiAxcmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMSk7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcclxufVxyXG5cclxuLmVtcHR5LWljb24ge1xyXG4gIHdpZHRoOiAyOHB4O1xyXG4gIGhlaWdodDogMjhweDtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxuICBvcGFjaXR5OiAwLjc7XHJcbn1cclxuXHJcbi5lbXB0eS1zdGF0ZSBoMyB7XHJcbiAgZm9udC1zaXplOiAwLjkzNzVyZW07XHJcbiAgZm9udC13ZWlnaHQ6IDYwMDtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0yKTtcclxuICBtYXJnaW46IDAgMCAwLjI1cmVtO1xyXG59XHJcblxyXG4uZW1wdHktc3RhdGUgcCB7XHJcbiAgbWFyZ2luOiAwO1xyXG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xyXG4gIG9wYWNpdHk6IDAuNjU7XHJcbn1cclxuXHJcbi5lbXB0eS1zdGF0ZSBlbSB7XHJcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xyXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbn1cclxuXHJcbi5lbXB0eS1jbGVhci1idG4ge1xyXG4gIG1hcmdpbi10b3A6IDAuNzVyZW07XHJcbiAgcGFkZGluZzogMC4zNzVyZW0gMXJlbTtcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBmb250LXdlaWdodDogNTAwO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBib3JkZXI6IDFweCBzb2xpZCByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjM1KTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjA4KTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAxNTBtcyBlYXNlLW91dCwgYm9yZGVyLWNvbG9yIDE1MG1zIGVhc2Utb3V0O1xyXG59XHJcblxyXG4uZW1wdHktY2xlYXItYnRuOmhvdmVyIHtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjE1KTtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuNSk7XHJcbn1cclxuXHJcbi5pZGxlLWljb24td3JhcCB7XHJcbiAgd2lkdGg6IDY0cHg7XHJcbiAgaGVpZ2h0OiA2NHB4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICBiYWNrZ3JvdW5kOiByZ2IoMjU1IDI1NSAyNTUgLyAwLjA4KTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgbWFyZ2luLWJvdHRvbTogMC43NXJlbTtcclxufVxyXG5cclxuLmlkbGUtaWNvbiB7XHJcbiAgd2lkdGg6IDMycHg7XHJcbiAgaGVpZ2h0OiAzMnB4O1xyXG4gIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7XHJcbn1cclxuXHJcbi8qIFN0cmVhbSBQcmV2aWV3ICovXHJcbi5zdHJlYW0tcHJldmlldyB7XHJcbiAgcG9zaXRpb246IGZpeGVkO1xyXG4gIGJvdHRvbTogMS41cmVtO1xyXG4gIHJpZ2h0OiAxLjVyZW07XHJcbiAgd2lkdGg6IDQwMHB4O1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1zdXJmYWNlKSk7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBib3JkZXItcmFkaXVzOiAxcmVtO1xyXG4gIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgYm94LXNoYWRvdzogMCA4cHggMzJweCByZ2IoMCAwIDAgLyAwLjIpO1xyXG4gIHotaW5kZXg6IDEwMDtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xyXG59XHJcblxyXG4ud2VicnRjLWFwcC5zZXR0aW5ncy1vcGVuIC5zdHJlYW0tcHJldmlldyB7XHJcbiAgcmlnaHQ6IGNhbGMoMzgwcHggKyAxLjVyZW0pO1xyXG59XHJcblxyXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcclxuICAuc3RyZWFtLXByZXZpZXcge1xyXG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtIDJyZW0pO1xyXG4gICAgbGVmdDogMXJlbTtcclxuICAgIHJpZ2h0OiAxcmVtO1xyXG4gIH1cclxuXHJcbiAgLndlYnJ0Yy1hcHAuc2V0dGluZ3Mtb3BlbiAuc3RyZWFtLXByZXZpZXcge1xyXG4gICAgcmlnaHQ6IDFyZW07XHJcbiAgfVxyXG59XHJcblxyXG4uc3RyZWFtLXByZXZpZXcubWluaW1pemVkIHtcclxuICB3aWR0aDogMjgwcHg7XHJcbn1cclxuXHJcbi5zdHJlYW0tcHJldmlldy5taW5pbWl6ZWQgLnN0cmVhbS12aWV3cG9ydCxcclxuLnN0cmVhbS1wcmV2aWV3Lm1pbmltaXplZCAucXVpY2stYWN0aW9ucyxcclxuLnN0cmVhbS1wcmV2aWV3Lm1pbmltaXplZCAuY29tcGFjdC1tZXRyaWNzIHtcclxuICBkaXNwbGF5OiBub25lO1xyXG59XHJcblxyXG4uc3RyZWFtLXByZXZpZXcuZXhwYW5kZWQge1xyXG4gIHBvc2l0aW9uOiBmaXhlZDtcclxuICBpbnNldDogMDtcclxuICB3aWR0aDogMTAwJTtcclxuICBib3JkZXItcmFkaXVzOiAwO1xyXG4gIHotaW5kZXg6IDk5OTk7XHJcbn1cclxuXHJcbi5wcmV2aWV3LWhlYWRlciB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICBwYWRkaW5nOiAwLjc1cmVtIDFyZW07XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhcmspIC8gMC4wMyk7XHJcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbn1cclxuXHJcbi5kYXJrIC5wcmV2aWV3LWhlYWRlciB7XHJcbiAgYmFja2dyb3VuZDogcmdiKDAgMCAwIC8gMC4yKTtcclxufVxyXG5cclxuLnByZXZpZXctdGl0bGUge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBnYXA6IDAuNXJlbTtcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTEpO1xyXG59XHJcblxyXG4ucHJldmlldy10aXRsZSBpIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxufVxyXG5cclxuLmxpdmUtaW5kaWNhdG9yIHtcclxuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC4yNXJlbTtcclxuICBwYWRkaW5nOiAwLjEyNXJlbSAwLjVyZW07XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhbmdlcikpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuMjVyZW07XHJcbiAgZm9udC1zaXplOiAwLjU2MjVyZW07XHJcbiAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICBjb2xvcjogd2hpdGU7XHJcbn1cclxuXHJcbi5saXZlLWRvdCB7XHJcbiAgd2lkdGg6IDAuMzc1cmVtO1xyXG4gIGhlaWdodDogMC4zNzVyZW07XHJcbiAgYmFja2dyb3VuZDogd2hpdGU7XHJcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIGFuaW1hdGlvbjogYmxpbmsgMXMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XHJcbn1cclxuXHJcbkBrZXlmcmFtZXMgYmxpbmsge1xyXG4gIDAlLFxyXG4gIDEwMCUge1xyXG4gICAgb3BhY2l0eTogMTtcclxuICB9XHJcbiAgNTAlIHtcclxuICAgIG9wYWNpdHk6IDAuMztcclxuICB9XHJcbn1cclxuXHJcbi5wcmV2aWV3LWNvbnRyb2xzIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGdhcDogMC4yNXJlbTtcclxufVxyXG5cclxuLmNvbnRyb2wtYnRuIHtcclxuICB3aWR0aDogMS43NXJlbTtcclxuICBoZWlnaHQ6IDEuNzVyZW07XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG4gIGJvcmRlcjogbm9uZTtcclxuICBib3JkZXItcmFkaXVzOiAwLjM3NXJlbTtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0yKTtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XHJcbn1cclxuXHJcbi5jb250cm9sLWJ0bjpob3ZlciB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpIC8gMC4xKTtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKTtcclxufVxyXG5cclxuLyogU3RyZWFtIFZpZXdwb3J0ICovXHJcbi5zdHJlYW0tdmlld3BvcnQge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICBhc3BlY3QtcmF0aW86IDE2IC8gOTtcclxuICBiYWNrZ3JvdW5kOiByZ2IoMCAwIDApO1xyXG4gIG91dGxpbmU6IG5vbmU7XHJcbn1cclxuXHJcbi5zdHJlYW0tdmlld3BvcnQuZnVsbHNjcmVlbi1tb2RlIHtcclxuICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgaW5zZXQ6IDA7XHJcbiAgYXNwZWN0LXJhdGlvOiB1bnNldDtcclxuICB6LWluZGV4OiA5OTk5O1xyXG4gIGN1cnNvcjogbm9uZTtcclxufVxyXG5cclxuLnN0cmVhbS12aWRlbyB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG4gIG9iamVjdC1maXQ6IGNvbnRhaW47XHJcbn1cclxuXHJcbi5wYWNlci1zb3VyY2UtaGlkZGVuIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgdG9wOiAwO1xyXG4gIGxlZnQ6IDA7XHJcbiAgd2lkdGg6IDFweCAhaW1wb3J0YW50O1xyXG4gIGhlaWdodDogMXB4ICFpbXBvcnRhbnQ7XHJcbiAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xyXG4gIHBvaW50ZXItZXZlbnRzOiBub25lICFpbXBvcnRhbnQ7XHJcbn1cclxuXHJcbi5oaWRkZW4ge1xyXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxufVxyXG5cclxuLmlkbGUtc3RhdGUge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBpbnNldDogMDtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KFxyXG4gICAgMTM1ZGVnLFxyXG4gICAgcmdiKHZhcigtLWNvbG9yLXN1cmZhY2UpKSAwJSxcclxuICAgIHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuOCkgMTAwJVxyXG4gICk7XHJcbn1cclxuXHJcbi5pZGxlLWNvbnRlbnQge1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjY1KTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxufVxyXG5cclxuLmlkbGUtY29udGVudCBpIHtcclxuICBmb250LXNpemU6IDIuNXJlbTtcclxuICBvcGFjaXR5OiAwLjQ7XHJcbiAgbWFyZ2luLWJvdHRvbTogMC43NXJlbTtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuLmlkbGUtY29udGVudCBwIHtcclxuICBtYXJnaW46IDA7XHJcbiAgZm9udC1zaXplOiAwLjgxMjVyZW07XHJcbn1cclxuXHJcbi5jb25uZWN0aW5nLXN0YXRlIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgaW5zZXQ6IDA7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgZ2FwOiAxcmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYigwIDAgMCAvIDAuODUpO1xyXG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xyXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xyXG59XHJcblxyXG4uc3Bpbm5lciB7XHJcbiAgd2lkdGg6IDIuNXJlbTtcclxuICBoZWlnaHQ6IDIuNXJlbTtcclxuICBib3JkZXI6IDNweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG4gIGJvcmRlci10b3AtY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIGFuaW1hdGlvbjogc3BpbiAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgLyogRm9yY2UgR1BVIGxheWVyIGZvciBzbW9vdGggYW5pbWF0aW9uIGR1cmluZyBoZWF2eSBKUyB3b3JrICovXHJcbiAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcclxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7XHJcbiAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xyXG59XHJcblxyXG5Aa2V5ZnJhbWVzIHNwaW4ge1xyXG4gIHRvIHtcclxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWigwKSByb3RhdGUoMzYwZGVnKTtcclxuICB9XHJcbn1cclxuXHJcbi5jb25uZWN0aW5nLXN0YXRlIHNwYW4ge1xyXG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMik7XHJcbn1cclxuXHJcbi5zdGF0cy1vdmVybGF5IHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgdG9wOiAwLjVyZW07XHJcbiAgbGVmdDogMC41cmVtO1xyXG4gIHBhZGRpbmc6IDAuNXJlbSAwLjc1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYigwIDAgMCAvIDAuNzUpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xyXG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xyXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xyXG59XHJcblxyXG4uc3RhdC1saW5lIHtcclxuICBmb250LWZhbWlseTogdWktbW9ub3NwYWNlLCBtb25vc3BhY2U7XHJcbiAgZm9udC1zaXplOiAwLjYyNXJlbTtcclxuICBsaW5lLWhlaWdodDogMS41O1xyXG4gIGNvbG9yOiByZ2IoMjU1IDI1NSAyNTUgLyAwLjg1KTtcclxufVxyXG5cclxuLyogTm90aWZpY2F0aW9uICovXHJcbi5ub3RpZmljYXRpb24tdG9hc3Qge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB0b3A6IDAuNzVyZW07XHJcbiAgcmlnaHQ6IDAuNzVyZW07XHJcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcclxuICBnYXA6IDAuNzVyZW07XHJcbiAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYigzMCAzMCAzNSAvIDAuOTUpO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xyXG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMnB4KTtcclxuICBtYXgtd2lkdGg6IDMwMHB4O1xyXG59XHJcblxyXG4ubm90aWZpY2F0aW9uLXRvYXN0LmVycm9yIHtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci1kYW5nZXIpIC8gMC40KTtcclxufVxyXG5cclxuLm5vdGlmaWNhdGlvbi10b2FzdC53YXJuaW5nIHtcclxuICBib3JkZXItY29sb3I6IHJnYih2YXIoLS1jb2xvci13YXJuaW5nKSAvIDAuNCk7XHJcbn1cclxuXHJcbi5ub3RpZmljYXRpb24tdG9hc3Quc3VjY2VzcyB7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3Itc3VjY2VzcykgLyAwLjQpO1xyXG59XHJcblxyXG4ubm90aWZpY2F0aW9uLXRvYXN0IGkge1xyXG4gIGZvbnQtc2l6ZTogMXJlbTtcclxuICBtYXJnaW4tdG9wOiAwLjEyNXJlbTtcclxufVxyXG5cclxuLm5vdGlmaWNhdGlvbi10b2FzdC5lcnJvciBpIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLWRhbmdlcikpO1xyXG59XHJcbi5ub3RpZmljYXRpb24tdG9hc3Qud2FybmluZyBpIHtcclxuICBjb2xvcjogcmdiKHZhcigtLWNvbG9yLXdhcm5pbmcpKTtcclxufVxyXG4ubm90aWZpY2F0aW9uLXRvYXN0LnN1Y2Nlc3MgaSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1zdWNjZXNzKSk7XHJcbn1cclxuLm5vdGlmaWNhdGlvbi10b2FzdC5pbmZvIGkge1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItaW5mbykpO1xyXG59XHJcblxyXG4ubm90aWZpY2F0aW9uLXRleHQge1xyXG4gIGZsZXg6IDE7XHJcbiAgbWluLXdpZHRoOiAwO1xyXG59XHJcblxyXG4ubm90aWZpY2F0aW9uLXRleHQgc3Ryb25nIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBjb2xvcjogd2hpdGU7XHJcbn1cclxuXHJcbi5ub3RpZmljYXRpb24tdGV4dCBzcGFuIHtcclxuICBkaXNwbGF5OiBibG9jaztcclxuICBmb250LXNpemU6IDAuNzVyZW07XHJcbiAgY29sb3I6IHJnYigyNTUgMjU1IDI1NSAvIDAuNyk7XHJcbiAgbWFyZ2luLXRvcDogMC4xMjVyZW07XHJcbn1cclxuXHJcbi5ub3RpZmljYXRpb24tdG9hc3QgYnV0dG9uIHtcclxuICBiYWNrZ3JvdW5kOiBub25lO1xyXG4gIGJvcmRlcjogbm9uZTtcclxuICBwYWRkaW5nOiAwLjI1cmVtO1xyXG4gIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xyXG4gIGNvbG9yOiByZ2IoMjU1IDI1NSAyNTUgLyAwLjUpO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxufVxyXG5cclxuLm5vdGlmaWNhdGlvbi10b2FzdCBidXR0b246aG92ZXIge1xyXG4gIGNvbG9yOiB3aGl0ZTtcclxufVxyXG5cclxuLm5vdGlmaWNhdGlvbi1mYWRlLWVudGVyLWFjdGl2ZSxcclxuLm5vdGlmaWNhdGlvbi1mYWRlLWxlYXZlLWFjdGl2ZSB7XHJcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcclxufVxyXG5cclxuLm5vdGlmaWNhdGlvbi1mYWRlLWVudGVyLWZyb20sXHJcbi5ub3RpZmljYXRpb24tZmFkZS1sZWF2ZS10byB7XHJcbiAgb3BhY2l0eTogMDtcclxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTEwcHgpO1xyXG59XHJcblxyXG4vKiBRdWljayBBY3Rpb25zICovXHJcbi5xdWljay1hY3Rpb25zIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xyXG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG59XHJcblxyXG4uYWN0aW9uLWJ0biB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGdhcDogMC41cmVtO1xyXG4gIHBhZGRpbmc6IDAuNjI1cmVtIDEuMjVyZW07XHJcbiAgYm9yZGVyOiBub25lO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBmb250LXNpemU6IDAuODEyNXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcclxufVxyXG5cclxuLmFjdGlvbi1idG4ucHJpbWFyeSB7XHJcbiAgZmxleDogMTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3Itb24tcHJpbWFyeSkpO1xyXG59XHJcblxyXG4uYWN0aW9uLWJ0bi5wcmltYXJ5OmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcclxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMS4xKTtcclxuICBib3gtc2hhZG93OiAwIDRweCAxNnB4IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMzUpO1xyXG59XHJcblxyXG4uYWN0aW9uLWJ0bi5wcmltYXJ5LmNvbm5lY3RlZCB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhbmdlcikgLyAwLjE1KTtcclxuICBib3JkZXI6IDFweCBzb2xpZCByZ2IodmFyKC0tY29sb3ItZGFuZ2VyKSAvIDAuNCk7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1kYW5nZXIpKTtcclxufVxyXG5cclxuLmFjdGlvbi1idG4ucHJpbWFyeS5jb25uZWN0aW5nIHtcclxuICBvcGFjaXR5OiAwLjc7XHJcbiAgY3Vyc29yOiB3YWl0O1xyXG59XHJcblxyXG4uYWN0aW9uLWJ0bi5kYW5nZXIge1xyXG4gIHBhZGRpbmc6IDAuNjI1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYih2YXIoLS1jb2xvci13YXJuaW5nKSAvIDAuNCk7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci13YXJuaW5nKSk7XHJcbn1cclxuXHJcbi5hY3Rpb24tYnRuLmRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXdhcm5pbmcpIC8gMC4xKTtcclxufVxyXG5cclxuLmFjdGlvbi1idG46ZGlzYWJsZWQge1xyXG4gIG9wYWNpdHk6IDAuNTtcclxuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xyXG59XHJcblxyXG4ucXVpY2stdG9nZ2xlcyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC43NXJlbTtcclxuICBtYXJnaW4tbGVmdDogYXV0bztcclxufVxyXG5cclxuLnRvZ2dsZSB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC4zNzVyZW07XHJcbiAgZm9udC1zaXplOiAwLjY4NzVyZW07XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMik7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG59XHJcblxyXG4vKiBDb21wYWN0IE1ldHJpY3MgKi9cclxuLmNvbXBhY3QtbWV0cmljcyB7XHJcbiAgZGlzcGxheTogZ3JpZDtcclxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg0LCAxZnIpO1xyXG4gIGdhcDogMC41cmVtO1xyXG4gIHBhZGRpbmc6IDAuNzVyZW0gMXJlbTtcclxuICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICBiYWNrZ3JvdW5kOiByZ2IodmFyKC0tY29sb3ItZGFyaykgLyAwLjAyKTtcclxufVxyXG5cclxuLmRhcmsgLmNvbXBhY3QtbWV0cmljcyB7XHJcbiAgYmFja2dyb3VuZDogcmdiKDAgMCAwIC8gMC4xNSk7XHJcbn1cclxuXHJcbi5tZXRyaWMge1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxufVxyXG5cclxuLm1ldHJpYyAubGFiZWwge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIGZvbnQtc2l6ZTogMC41NjI1cmVtO1xyXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XHJcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDNlbTtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0zKTtcclxufVxyXG5cclxuLm1ldHJpYyAudmFsdWUge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMSk7XHJcbn1cclxuXHJcbi8qIFNldHRpbmdzIERyYXdlciAqL1xyXG4uc2V0dGluZ3MtZHJhd2VyIHtcclxuICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgdG9wOiAwO1xyXG4gIHJpZ2h0OiAwO1xyXG4gIGJvdHRvbTogMDtcclxuICB3aWR0aDogMzgwcHg7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLXN1cmZhY2UpKTtcclxuICBib3JkZXItbGVmdDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIHotaW5kZXg6IDIwMDtcclxuICBib3gtc2hhZG93OiAtOHB4IDAgMzJweCByZ2IoMCAwIDAgLyAwLjE1KTtcclxufVxyXG5cclxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XHJcbiAgLnNldHRpbmdzLWRyYXdlciB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICB9XHJcbn1cclxuXHJcbi5kcmF3ZXItaGVhZGVyIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gIHBhZGRpbmc6IDEuMjVyZW0gMS41cmVtO1xyXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG59XHJcblxyXG4uZHJhd2VyLWhlYWRlciBoMiB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC41cmVtO1xyXG4gIGZvbnQtc2l6ZTogMXJlbTtcclxuICBmb250LXdlaWdodDogNjAwO1xyXG4gIG1hcmdpbjogMDtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0xKTtcclxufVxyXG5cclxuLmRyYXdlci1oZWFkZXIgaDIgaSB7XHJcbiAgY29sb3I6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbn1cclxuXHJcbi5jbG9zZS1idG4ge1xyXG4gIHdpZHRoOiAycmVtO1xyXG4gIGhlaWdodDogMnJlbTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgYm9yZGVyOiBub25lO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTIpO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcclxufVxyXG5cclxuLmNsb3NlLWJ0bjpob3ZlciB7XHJcbiAgYmFja2dyb3VuZDogcmdiKHZhcigtLWNvbG9yLWRhbmdlcikgLyAwLjEpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItZGFuZ2VyKSk7XHJcbn1cclxuXHJcbi5kcmF3ZXItY29udGVudCB7XHJcbiAgZmxleDogMTtcclxuICBvdmVyZmxvdy15OiBhdXRvO1xyXG4gIHBhZGRpbmc6IDEuNXJlbTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAxLjVyZW07XHJcbn1cclxuXHJcbi5zZXR0aW5nLWdyb3VwIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAwLjVyZW07XHJcbn1cclxuXHJcbi5ncm91cC1sYWJlbCB7XHJcbiAgZm9udC1zaXplOiAwLjY4NzVyZW07XHJcbiAgZm9udC13ZWlnaHQ6IDYwMDtcclxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xyXG4gIGxldHRlci1zcGFjaW5nOiAwLjA1ZW07XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMyk7XHJcbn1cclxuXHJcbi5yZXNvbHV0aW9uLWlucHV0cyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGdhcDogMC41cmVtO1xyXG59XHJcblxyXG4uc2VwYXJhdG9yIHtcclxuICBjb2xvcjogdmFyKC0tdGV4dC0zKTtcclxufVxyXG5cclxuLnByZXNldC1jaGlwcyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBnYXA6IDAuMzc1cmVtO1xyXG4gIGZsZXgtd3JhcDogd3JhcDtcclxufVxyXG5cclxuLmNoaXAge1xyXG4gIGZsZXg6IDE7XHJcbiAgbWluLXdpZHRoOiA2MHB4O1xyXG4gIHBhZGRpbmc6IDAuNXJlbSAwLjc1cmVtO1xyXG4gIGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UpO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxuICBmb250LXdlaWdodDogNTAwO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTIpO1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcclxufVxyXG5cclxuLmNoaXA6aG92ZXIge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSAvIDAuMSk7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkgLyAwLjMpO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTEpO1xyXG59XHJcblxyXG4uY2hpcC5hY3RpdmUge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1wcmltYXJ5KSk7XHJcbiAgYm9yZGVyLWNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3Itb24tcHJpbWFyeSkpO1xyXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbn1cclxuXHJcbi5jaGlwLnVuc3VwcG9ydGVkIHtcclxuICBib3JkZXItc3R5bGU6IGRhc2hlZDtcclxuICBvcGFjaXR5OiAwLjY7XHJcbn1cclxuXHJcbi50b2dnbGUtc2V0dGluZyB7XHJcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XHJcbiAgcGFkZGluZy10b3A6IDFyZW07XHJcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbn1cclxuXHJcbi50b2dnbGUtaW5mbyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIGdhcDogMC4yNXJlbTtcclxufVxyXG5cclxuLmhpbnQge1xyXG4gIGZvbnQtc2l6ZTogMC42ODc1cmVtO1xyXG4gIGNvbG9yOiB2YXIoLS10ZXh0LTMpO1xyXG4gIG1hcmdpbjogMDtcclxuICBsaW5lLWhlaWdodDogMS40O1xyXG59XHJcblxyXG4uc2V0dGluZy1hbGVydCB7XHJcbiAgbWFyZ2luLXRvcDogMC41cmVtO1xyXG59XHJcblxyXG4uZnVsbC13aWR0aCB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbn1cclxuXHJcbi8qIEFkdmFuY2VkIFNlY3Rpb24gKi9cclxuLmFkdmFuY2VkLXNlY3Rpb24ge1xyXG4gIG1hcmdpbi10b3A6IDAuNXJlbTtcclxuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG59XHJcblxyXG4uYWR2YW5jZWQtc2VjdGlvbiBzdW1tYXJ5IHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMDMpO1xyXG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xyXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbiAgY29sb3I6IHZhcigtLXRleHQtMik7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIGxpc3Qtc3R5bGU6IG5vbmU7XHJcbn1cclxuXHJcbi5kYXJrIC5hZHZhbmNlZC1zZWN0aW9uIHN1bW1hcnkge1xyXG4gIGJhY2tncm91bmQ6IHJnYigwIDAgMCAvIDAuMTUpO1xyXG59XHJcblxyXG4uYWR2YW5jZWQtc2VjdGlvbiBzdW1tYXJ5Ojotd2Via2l0LWRldGFpbHMtbWFya2VyIHtcclxuICBkaXNwbGF5OiBub25lO1xyXG59XHJcblxyXG4uYWR2YW5jZWQtc2VjdGlvbiBzdW1tYXJ5IGkge1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3ItcHJpbWFyeSkpO1xyXG59XHJcblxyXG4uYWR2YW5jZWQtY29udGVudCB7XHJcbiAgcGFkZGluZzogMXJlbTtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAxcmVtO1xyXG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG59XHJcblxyXG4uZHJhd2VyLWZvb3RlciB7XHJcbiAgcGFkZGluZzogMXJlbSAxLjVyZW07XHJcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbn1cclxuXHJcbi5ub3RpY2Uge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XHJcbiAgZ2FwOiAwLjVyZW07XHJcbiAgZm9udC1zaXplOiAwLjc1cmVtO1xyXG4gIGNvbG9yOiByZ2IodmFyKC0tY29sb3Itd2FybmluZykpO1xyXG4gIG1hcmdpbjogMDtcclxufVxyXG5cclxuLm5vdGljZSBpIHtcclxuICBtYXJnaW4tdG9wOiAwLjEyNXJlbTtcclxufVxyXG5cclxuLyogQmFja2Ryb3AgKi9cclxuLmRyYXdlci1iYWNrZHJvcCB7XHJcbiAgcG9zaXRpb246IGZpeGVkO1xyXG4gIGluc2V0OiAwO1xyXG4gIGJhY2tncm91bmQ6IHJnYigwIDAgMCAvIDAuMyk7XHJcbiAgei1pbmRleDogMTUwO1xyXG59XHJcblxyXG5AbWVkaWEgKG1pbi13aWR0aDogNzY5cHgpIHtcclxuICAuZHJhd2VyLWJhY2tkcm9wIHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBUcmFuc2l0aW9ucyAqL1xyXG4uc2xpZGVvdXQtZW50ZXItYWN0aXZlLFxyXG4uc2xpZGVvdXQtbGVhdmUtYWN0aXZlIHtcclxuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO1xyXG59XHJcblxyXG4uc2xpZGVvdXQtZW50ZXItZnJvbSxcclxuLnNsaWRlb3V0LWxlYXZlLXRvIHtcclxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwJSk7XHJcbn1cclxuXHJcbi5mYWRlLWVudGVyLWFjdGl2ZSxcclxuLmZhZGUtbGVhdmUtYWN0aXZlIHtcclxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZTtcclxufVxyXG5cclxuLmZhZGUtZW50ZXItZnJvbSxcclxuLmZhZGUtbGVhdmUtdG8ge1xyXG4gIG9wYWNpdHk6IDA7XHJcbn1cclxuXHJcbi8qIE5haXZlIFVJIE92ZXJyaWRlcyAqL1xyXG46ZGVlcCgubi1pbnB1dC1udW1iZXIpIHtcclxuICAtLW4tY29sb3I6IHZhcigtLXN1cmZhY2UpICFpbXBvcnRhbnQ7XHJcbiAgLS1uLWJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcikgIWltcG9ydGFudDtcclxuICAtLW4tdGV4dC1jb2xvcjogdmFyKC0tdGV4dC0xKSAhaW1wb3J0YW50O1xyXG4gIC0tbi1jb2xvci1mb2N1czogdmFyKC0tc3VyZmFjZSkgIWltcG9ydGFudDtcclxuICAtLW4tYm9yZGVyLWZvY3VzOiAxcHggc29saWQgcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKSAhaW1wb3J0YW50O1xyXG59XHJcblxyXG46ZGVlcCgubi1zd2l0Y2gpIHtcclxuICAtLW4tcmFpbC1jb2xvcjogdmFyKC0tYm9yZGVyKSAhaW1wb3J0YW50O1xyXG4gIC0tbi1yYWlsLWNvbG9yLWFjdGl2ZTogcmdiKHZhcigtLWNvbG9yLXByaW1hcnkpKSAhaW1wb3J0YW50O1xyXG59XHJcblxyXG4vKiBTY3JvbGxiYXIgKi9cclxuLmRyYXdlci1jb250ZW50Ojotd2Via2l0LXNjcm9sbGJhcixcclxuLmxpYnJhcnktc2VjdGlvbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gIHdpZHRoOiA2cHg7XHJcbn1cclxuXHJcbi5kcmF3ZXItY29udGVudDo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2ssXHJcbi5saWJyYXJ5LXNlY3Rpb246Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcclxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxufVxyXG5cclxuLmRyYXdlci1jb250ZW50Ojotd2Via2l0LXNjcm9sbGJhci10aHVtYixcclxuLmxpYnJhcnktc2VjdGlvbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xyXG4gIGJhY2tncm91bmQ6IHJnYih2YXIoLS1jb2xvci1kYXJrKSAvIDAuMSk7XHJcbiAgYm9yZGVyLXJhZGl1czogM3B4O1xyXG59XHJcblxyXG4uZGFyayAuZHJhd2VyLWNvbnRlbnQ6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iLFxyXG4uZGFyayAubGlicmFyeS1zZWN0aW9uOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XHJcbiAgYmFja2dyb3VuZDogcmdiKDI1NSAyNTUgMjU1IC8gMC4xKTtcclxufVxyXG48L3N0eWxlPlxyXG4iXSwibmFtZXMiOlsiVklERU9fTUFYX0ZSQU1FX0FHRV9NSU5fTVMiLCJWSURFT19NQVhfRlJBTUVfQUdFX01BWF9NUyIsImNvbXB1dGVkIiwicGF5bG9hZCIsInQiLCJtZXNzYWdlIiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl9ub3JtYWxpemVDbGFzcyIsIl9jcmVhdGVDb21tZW50Vk5vZGUiLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2NyZWF0ZVZOb2RlIiwiJHQiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX29wZW5CbG9jayIsIl90b0Rpc3BsYXlTdHJpbmciLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9tZXJnZVByb3BzIiwiX25vcm1hbGl6ZVN0eWxlIiwiX1RyYW5zaXRpb24iLCJfdW5yZWYiLCJfY3JlYXRlQmxvY2siXSwibWFwcGluZ3MiOiI7OztBQStEQSxNQUFNQSwrQkFBNkI7QUFDbkMsTUFBTUMsK0JBQTZCO0FBRW5DLFNBQVMsMEJBQTBCLFFBQTBDO0FBQzNFLFFBQU0sTUFDSixPQUFPLE9BQU8sUUFBUSxZQUFZLE9BQU8sU0FBUyxPQUFPLEdBQUcsS0FBSyxPQUFPLE1BQU0sSUFBSSxPQUFPLE1BQU07QUFDakcsUUFBTSxRQUFRRDtBQUNkLFFBQU0sUUFBUUM7QUFFWixNQUFBLE9BQU8sT0FBTywyQkFBMkIsWUFDekMsT0FBTyxTQUFTLE9BQU8sc0JBQXNCLEtBQzdDLE9BQU8seUJBQXlCLEdBQ2hDO0FBQ0EsVUFBTSxTQUFTLEtBQUssTUFBTSxPQUFPLHNCQUFzQjtBQUN2RCxVQUFNQyxZQUFXLEtBQUssTUFBTyxNQUFPLE1BQU8sTUFBTTtBQUM3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
