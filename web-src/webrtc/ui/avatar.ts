// Generated server art (no per-server image exists on the web): a quiet dark disc with a filled PC glyph.
const NS = 'http://www.w3.org/2000/svg';

export function serverAvatar(_name: string): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('server-avatar-art');
  svg.innerHTML =
    `<circle cx="50" cy="50" r="50" fill="#1E2638"/>` +
    // monitor: screen + stand, filled (no outlines)
    `<rect x="27" y="30" width="46" height="31" rx="4" fill="#E7ECF5" opacity=".92"/>` +
    `<rect x="31" y="34" width="38" height="23" rx="2" fill="#2B3754"/>` +
    `<path d="M44 61h12l2 8H42z" fill="#E7ECF5" opacity=".75"/>` +
    `<rect x="37" y="68" width="26" height="3.5" rx="1.75" fill="#E7ECF5" opacity=".75"/>`;
  return svg;
}
