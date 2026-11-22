// Living paintings behind Focus (MASTER.md "Paintings"): one painting per server, crossfaded.
// Castle: the night sky folded in muted, one train per scene crossing the bridge, smoke, mist, windows.
// Night: strokes turning along the swirls, breathing moons. Reduced motion: one still frame.
import { h, reducedMotion } from './shell';

type Kind = 'castle' | 'night';
const KINDS: Kind[] = ['castle', 'night'];
const SRC = { castle: '/assets/wallpaper-castillo.jpg', night: '/assets/wallpaper-noche.jpg' };

// Painting-space constants, in the castle source's pixels (736 x 1308).
const TRAIN = { sx: 148, sy: 922, w: 375, h: 66, chimney: 347, span: [150, 615], cycle: 34000, travel: 26000 };
const SLOT = { x0: 146, x1: 528, y0: 862, y1: 987, band: 920 }; // where the painted train and its smoke sat
const SKY = { crop: [0.12, 0.66], band: 0.62 }; // night rows folded into the castle's top 62 %
const SWIRLS: [number, number, number][] = [[0.52, 0.545, 1], [0.71, 0.55, 0.7], [0.27, 0.63, 0.55], [0.62, 0.25, 0.5]];
const MOONS: [number, number, number][] = [[0.74, 0.052, 34], [0.69, 0.43, 26], [0.27, 0.628, 30], [0.53, 0.43, 9], [0.21, 0.4, 7]];
const NIGHT_INK = ['#8fb6ee', '#5c86dc', '#c9dcf5', '#2f4fb8', '#e8eefa'];
const STROKES = 520;
const SMOKE = 160;

// Seeded so two loads draw the same painting.
let seed = 7;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const toCastle = (ny: number) => ((ny - SKY.crop[0]) / (SKY.crop[1] - SKY.crop[0])) * SKY.band;

const load = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });
const canvas = (w: number, h: number) => Object.assign(document.createElement('canvas'), { width: w, height: h });

interface Art {
  kind: Kind;
  img: HTMLImageElement;
  /** What is drawn: the painting, widened (castle) and without its train when it moves. */
  still: HTMLCanvasElement;
  moving?: HTMLCanvasElement;
  train?: HTMLCanvasElement;
  skyMask?: HTMLCanvasElement;
  /** Extension per side, source pixels: a portrait painting widened with its own mirrored edges. */
  ext: number;
}

/** Castle prepared once: night sky folded in, mirrored edges, a plate without the train, the train alone. */
function prepareCastle(img: HTMLImageElement, night: HTMLImageElement): Art {
  const iw = img.width, ih = img.height, bandH = Math.round(ih * SKY.band);
  // Landscape screens crop a portrait painting to a third: widen it so the sky survives.
  const ext = Math.max(0, Math.round((ih * 0.5 * 1.78 - iw) / 2));
  const w = iw + 2 * ext;

  const still = canvas(w, ih);
  const b = still.getContext('2d', { willReadFrequently: true })!;
  b.save(); b.translate(ext, 0); b.scale(-1, 1); b.drawImage(img, 0, 0, 140, ih, 0, 0, Math.max(ext, 140), ih); b.restore(); // left edge, train-free columns
  b.save(); b.translate(ext + 2 * iw, 0); b.scale(-1, 1); b.drawImage(img, 0, 0); b.restore();
  b.drawImage(img, ext, 0);

  const tex = canvas(w, bandH).getContext('2d', { willReadFrequently: true })!;
  const sy0 = night.height * SKY.crop[0], sh = night.height * (SKY.crop[1] - SKY.crop[0]);
  tex.filter = 'blur(1.5px)';
  for (const [at, flip] of [[ext, 1], [ext, -1], [ext + 2 * iw, -1]]) {
    tex.save(); tex.translate(at, 0); tex.scale(flip, 1); tex.drawImage(night, 0, sy0, night.width, sh, 0, 0, iw, bandH); tex.restore();
  }
  const T = tex.getImageData(0, 0, w, bandH).data;
  const O = b.getImageData(0, 0, w, ih), o = O.data;
  const skyMask = canvas(w, ih), mk = skyMask.getContext('2d')!, M = mk.createImageData(w, ih);
  const top = [30, 46, 72], low = [192, 201, 208], tint = [0.82, 0.94, 1.1], k = 42;
  for (let y = 0; y < ih; y++) {
    const g = Math.pow(Math.min(1, y / bandH), 1.5);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, R = o[i], G = o[i + 1], B = o[i + 2];
      // Sky = the painting's warm cream; fog and hills are grey-blue and stay.
      const m = Math.max(0, Math.min(1, (0.3 * R + 0.59 * G + 0.11 * B - 182) / 46)) * Math.max(0, Math.min(1, (R - B + 6) / 14));
      M.data[i] = M.data[i + 1] = M.data[i + 2] = 255;
      M.data[i + 3] = m * 255;
      if (!m) continue;
      const d = y < bandH ? (0.3 * T[i] + 0.59 * T[i + 1] + 0.11 * T[i + 2]) / 255 - 0.42 : 0, lift = k * (1 - g * 0.75);
      for (let c = 0; c < 3; c++) {
        const sky = top[c] + (low[c] - top[c]) * g + d * lift * tint[c];
        o[i + c] = o[i + c] * (1 - m) + Math.max(0, Math.min(255, sky)) * m;
      }
    }
  }
  b.putImageData(O, 0, 0);
  mk.putImageData(M, 0, 0);

  // Plate: the slot filled from its own surroundings (rows blended across, smoke band blended down), softened.
  const moving = canvas(w, ih), p = moving.getContext('2d', { willReadFrequently: true })!;
  p.drawImage(still, 0, 0);
  const X0 = SLOT.x0 + ext, X1 = SLOT.x1 + ext, sw = X1 - X0, sh2 = SLOT.y1 - SLOT.y0, band = SLOT.band - SLOT.y0;
  const above = p.getImageData(X0, SLOT.y0 - 2, sw, 1).data, slot = p.getImageData(X0, SLOT.y0, sw, sh2).data;
  const L = p.getImageData(X0 - 3, SLOT.y0, 1, sh2).data, Rr = p.getImageData(X1 + 3, SLOT.y0, 1, sh2).data;
  const out = p.createImageData(sw, sh2);
  const across = (y: number, x: number, c: number) => L[y * 4 + c] * (1 - x / sw) + Rr[y * 4 + c] * (x / sw);
  for (let y = 0; y < sh2; y++)
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4, kk = y / band;
      for (let c = 0; c < 3; c++) out.data[i + c] = y >= band ? across(y, x, c) : above[x * 4 + c] * (1 - kk) + across(band, x, c) * kk;
      out.data[i + 3] = 255;
    }
  const soft = canvas(sw, sh2);
  soft.getContext('2d')!.putImageData(out, 0, 0);
  p.save(); p.beginPath(); p.rect(X0, SLOT.y0, sw, sh2); p.clip(); p.filter = 'blur(5px)'; p.drawImage(soft, X0, SLOT.y0); p.restore();

  // The train alone: red or near-black pixels; the fog and hill behind it are grey-blue.
  const train = canvas(TRAIN.w, TRAIN.h), tc = train.getContext('2d')!, tr = tc.createImageData(TRAIN.w, TRAIN.h);
  for (let y = 0; y < TRAIN.h; y++)
    for (let x = 0; x < TRAIN.w; x++) {
      const i = (y * TRAIN.w + x) * 4, j = ((y + TRAIN.sy - SLOT.y0) * sw + (x + TRAIN.sx - SLOT.x0)) * 4;
      const R = slot[j], G = slot[j + 1], B = slot[j + 2], red = R - Math.max(G, B), luma = 0.3 * R + 0.59 * G + 0.11 * B;
      tr.data[i] = R; tr.data[i + 1] = G; tr.data[i + 2] = B;
      tr.data[i + 3] = Math.max(0, Math.min(255, Math.max((red - 14) * 12, (78 - luma) * 8)));
    }
  tc.putImageData(tr, 0, 0);
  return { kind: 'castle', img, still, moving, train, skyMask, ext };
}

function prepareNight(img: HTMLImageElement): Art {
  const still = canvas(img.width, img.height);
  still.getContext('2d')!.drawImage(img, 0, 0);
  return { kind: 'night', img, still, ext: 0 };
}

interface Stroke { x: number; y: number; l: number; c: number }
interface Puff { x: number; y: number; r: number; a: number; vx: number; vy: number }

/** One canvas, one painting, drawn every frame while it is the visible one. */
function scene(art: Art) {
  const cv = h<'canvas'>('canvas.fx-paint', { 'aria-hidden': 'true' });
  const ctx = cv.getContext('2d')!;
  const fx = canvas(1, 1), fctx = fx.getContext('2d')!;
  const castle = art.kind === 'castle';
  const iw = art.img.width, ih = art.img.height;
  const strokes: Stroke[] = Array.from({ length: STROKES }, () => ({
    x: castle ? rnd() * 1.8 - 0.4 : rnd(),
    y: rnd() * (castle ? SKY.band : 0.66),
    l: 4 + rnd() * 9,
    c: rnd(),
  }));
  const swirls = castle ? SWIRLS.map(([x, y, k]) => [x, toCastle(y), k] as [number, number, number]) : SWIRLS;
  const puffs: Puff[] = Array.from({ length: SMOKE }, () => ({ x: 0, y: 0, r: 0, a: 0, vx: 0, vy: 0 }));
  let puffHead = 0;
  let W = 0, H = 0, sc = 1, ox = 0, oy = 0;

  const fit = () => {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = Math.round(r.width * d);
    H = cv.height = Math.round(r.height * d);
  };
  new ResizeObserver(fit).observe(cv);
  const P = (nx: number, ny: number): [number, number] => [ox + (art.ext + nx * iw) * sc, oy + ny * ih * sc];

  function flow(s: Stroke, speed: number, maxY: number, e: number): number {
    let vx = 0.9, vy = 0;
    for (const [sx, sy, k] of swirls) {
      const dx = s.x - sx, dy = (s.y - sy) * 1.8, d2 = dx * dx + dy * dy + 0.002, f = ((k * 0.03) / d2) * Math.exp(-d2 * 18);
      vx += -dy * f * 40;
      vy += dx * f * 40;
    }
    const m = Math.hypot(vx, vy) || 1;
    s.x += (vx / m) * speed;
    s.y += (vy / m) * speed;
    if (s.x > 1 + e || s.x < -e - 0.02 || s.y < -0.02 || s.y > maxY) {
      s.x = rnd() * 0.2 - e - 0.02;
      s.y = rnd() * maxY;
    }
    return Math.atan2(vy, vx);
  }

  function draw(t: number, still: boolean) {
    if (!W) fit();
    if (!W) return;
    const drift = still ? 0 : t / 1000;
    const bw = art.still.width;
    sc = Math.max(W / bw, H / ih) * (1.04 + (still ? 0 : 0.015 * Math.sin(drift / 20)));
    const sh = ih * sc;
    ox = (W - bw * sc) / 2 + (still ? 0 : Math.sin(drift / 31) * W * 0.006);
    // Castle: bridge (y .76) at 72 % of the height; night: swirls mid-frame.
    oy = castle ? Math.min(0, Math.max(H - sh, H * 0.72 - 0.76 * sh)) : (H - sh) * 0.42;
    ctx.drawImage(!still && art.moving ? art.moving : art.still, ox, oy, bw * sc, sh);
    if (still) return;

    if (castle) {
      // Quiet sky: faint strokes along the swirls and a breathing moon, clipped to the sky.
      if (fx.width !== W || fx.height !== H) (fx.width = W), (fx.height = H);
      fctx.globalCompositeOperation = 'source-over';
      fctx.clearRect(0, 0, W, H);
      fctx.strokeStyle = '#c9d6e4';
      fctx.globalAlpha = 0.1;
      fctx.lineWidth = 2 * sc;
      fctx.lineCap = 'round';
      const e = art.ext / iw;
      fctx.beginPath();
      for (const s of strokes) {
        const ang = flow(s, 0.0003, SKY.band, e), [px, py] = P(s.x, s.y);
        fctx.moveTo(px, py);
        fctx.lineTo(px + Math.cos(ang) * s.l * sc, py + Math.sin(ang) * s.l * sc);
      }
      fctx.stroke();
      fctx.globalAlpha = 1;
      const [mx, my] = P(0.74, toCastle(0.052)), br = 0.5 + 0.15 * Math.sin(drift * 0.5), mr = 70 * sc;
      const gr = fctx.createRadialGradient(mx, my, 0, mx, my, mr);
      gr.addColorStop(0, `rgba(255,246,222,${br * 0.45})`);
      gr.addColorStop(1, 'rgba(255,246,222,0)');
      fctx.fillStyle = gr;
      fctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
      fctx.globalCompositeOperation = 'destination-in';
      fctx.drawImage(art.skyMask!, ox, oy, bw * sc, sh);
      ctx.drawImage(fx, 0, 0);

      // One train per scene: enters behind the left trees, crosses, leaves; the bridge rests, then the next.
      const I = (x: number, y: number): [number, number] => [ox + (art.ext + x) * sc, oy + y * sc];
      const k = (t % TRAIN.cycle) / TRAIN.travel;
      let emit: [number, number] | undefined;
      if (k <= 1) {
        const [s0, s1] = TRAIN.span, left = s0 - TRAIN.w + k * (s1 - s0 + TRAIN.w);
        const [c0, cy0] = I(s0, 900), [c1] = I(s1, 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(c0, cy0, c1 - c0, 100 * sc);
        ctx.clip();
        const [tx, ty] = I(left, TRAIN.sy);
        ctx.drawImage(art.train!, tx, ty, TRAIN.w * sc, TRAIN.h * sc);
        ctx.restore();
        const chim = left + TRAIN.chimney;
        if (chim > s0 && chim < s1) emit = I(chim, 926);
      }
      if (emit)
        for (let n = 0; n < 2; n++) {
          const q = puffs[puffHead];
          puffHead = (puffHead + 1) % SMOKE;
          q.x = emit[0] + rnd() * 3 * sc; q.y = emit[1]; q.r = 3.5 * sc; q.a = 0.42;
          q.vx = -(0.15 + rnd() * 0.25) * sc; q.vy = -(0.18 + rnd() * 0.22) * sc;
        }
      for (const q of puffs) {
        if (q.a < 0.02) continue;
        q.x += q.vx; q.y += q.vy; q.vy *= 0.985; q.r += 0.1 * sc; q.a *= 0.986;
        ctx.fillStyle = `rgba(66,74,82,${q.a * 0.4})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, 6.29);
        ctx.fill();
      }
      for (let i = 0; i < 2; i++) {
        const ph = (drift / (22 + i * 9) + i * 0.5) % 1, [mx2, my2] = P(-0.3 + ph * 1.6, 0.74 + i * 0.07), r = 260 * sc;
        const g = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, r);
        g.addColorStop(0, 'rgba(214,222,222,.16)');
        g.addColorStop(1, 'rgba(214,222,222,0)');
        ctx.fillStyle = g;
        ctx.fillRect(mx2 - r, my2 - 90 * sc, r * 2, 180 * sc);
      }
      ctx.fillStyle = `rgba(246,226,150,${0.45 + 0.25 * Math.sin(drift * 2.3) * Math.sin(drift * 0.7)})`;
      for (let i = 0; i < 6; i++) {
        const [wx, wy] = P(0.372 + i * 0.0085, 0.548);
        ctx.fillRect(wx, wy, 2.2 * sc, 7 * sc);
      }
    } else {
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 2.2 * sc;
      ctx.lineCap = 'round';
      for (const s of strokes) {
        const ang = flow(s, 0.00045, 0.66, 0), [px, py] = P(s.x, s.y);
        ctx.strokeStyle = NIGHT_INK[Math.floor(s.c * NIGHT_INK.length)];
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(ang) * s.l * sc, py + Math.sin(ang) * s.l * sc);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      MOONS.forEach(([mx, my, r], i) => {
        const [x, y] = P(mx, my), b = 0.5 + 0.22 * Math.sin(drift * (0.6 + i * 0.17) + i), rr = r * 2.4 * sc;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, `rgba(255,244,205,${b * 0.55})`);
        g.addColorStop(1, 'rgba(255,244,205,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      });
    }
  }
  return { cv, draw };
}

// Pixel work runs once per page load; every Focus visit reuses it.
let prepared: Promise<Art[]> | undefined;
const prepare = () =>
  (prepared ??= load(SRC.night).then(async (night) => [prepareCastle(await load(SRC.castle), night), prepareNight(night)]));

export interface Wall {
  el: HTMLElement;
  /** Show painting n (cycled): crossfade, and only the visible one keeps animating. */
  show(n: number): void;
  stop(): void;
}

export function paintingWall(): Wall {
  const el = h('div.fx-wall', { 'aria-hidden': 'true' }, h('div.fx-veil'));
  const scenes = new Map<Kind, ReturnType<typeof scene>>();
  let want: Kind = 'castle';
  let raf = 0;
  let stopped = false;

  const frame = (t: number) => {
    raf = 0;
    const s = scenes.get(want);
    if (!s || stopped || el.closest('[hidden]')) return; // Focus left: the next visit builds a new wall
    const still = reducedMotion();
    s.draw(t, still);
    if (!still && document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
  };
  const kick = () => !raf && !stopped && (raf = requestAnimationFrame(frame));
  const onVisible = () => document.visibilityState === 'visible' && kick();
  document.addEventListener('visibilitychange', onVisible);

  const reveal = () => {
    for (const [k, s] of scenes) s.cv.classList.toggle('on', k === want);
    kick();
  };
  // A missing file just leaves the neutral ground.
  void prepare()
    .then((arts) => {
      if (stopped) return;
      for (const a of arts) scenes.set(a.kind, scene(a));
      for (const k of KINDS) el.prepend(scenes.get(k)!.cv);
      reveal();
    })
    .catch(() => undefined);

  return {
    el,
    show(n) {
      want = KINDS[((n % KINDS.length) + KINDS.length) % KINDS.length];
      reveal();
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisible);
    },
  };
}
