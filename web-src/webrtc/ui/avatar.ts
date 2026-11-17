// Generated server art (no per-server image exists on the web): sky-gradient disc, brand hexagon, initials.
// Deterministic per name so a server always looks the same; the angle is the only thing that varies.
const NS = 'http://www.w3.org/2000/svg';

function hash(s: string): number {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  return x >>> 0;
}

export function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

let seq = 0;
export function serverAvatar(name: string): SVGSVGElement {
  const n = hash(name);
  const id = `av${n.toString(36)}-${++seq}`; // unique per element: hidden screens hold copies
  const angle = n % 360;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('server-avatar-art');
  svg.innerHTML =
    `<defs><linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)">` +
    `<stop offset="0" stop-color="#3D7FD0"/><stop offset=".55" stop-color="#22408F"/><stop offset="1" stop-color="#15182E"/>` +
    `</linearGradient></defs>` +
    `<circle cx="50" cy="50" r="50" fill="url(#${id})"/>` +
    `<path d="M50 14 81.2 32v36L50 86 18.8 68V32Z" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/>` +
    `<text x="50" y="50" dy=".35em" text-anchor="middle" fill="#fff" font-family="Roboto,system-ui,sans-serif" font-weight="800" font-size="30" letter-spacing="1">${escapeXml(initials(name))}</text>`;
  return svg;
}

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
