// Generated server art (no per-server image exists on the web): a quiet dark disc with a filled PC glyph.
// Deterministic per name: only the light's angle varies, so servers stay distinguishable without initials.
const NS = 'http://www.w3.org/2000/svg';

function hash(s: string): number {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  return x >>> 0;
}

let seq = 0;
export function serverAvatar(name: string): SVGSVGElement {
  const n = hash(name);
  const id = `av${n.toString(36)}-${++seq}`;
  const cx = 30 + (n % 41); // light position 30..70 %
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('server-avatar-art');
  svg.innerHTML =
    `<defs><radialGradient id="${id}" cx="${cx}%" cy="22%" r="85%">` +
    `<stop offset="0" stop-color="#3A4A6E"/><stop offset=".55" stop-color="#1E2638"/><stop offset="1" stop-color="#12151D"/>` +
    `</radialGradient></defs>` +
    `<circle cx="50" cy="50" r="50" fill="url(#${id})"/>` +
    // monitor: screen + stand, filled (no outlines)
    `<rect x="27" y="30" width="46" height="31" rx="4" fill="#E7ECF5" opacity=".92"/>` +
    `<rect x="31" y="34" width="38" height="23" rx="2" fill="#2B3754"/>` +
    `<path d="M44 61h12l2 8H42z" fill="#E7ECF5" opacity=".75"/>` +
    `<rect x="37" y="68" width="26" height="3.5" rx="1.75" fill="#E7ECF5" opacity=".75"/>`;
  return svg;
}
