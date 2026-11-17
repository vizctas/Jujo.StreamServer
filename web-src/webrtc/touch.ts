// Touch → host mouse. input.ts ignores pointerType 'touch'; this owns it.
// trackpad: finger moves a cursor relatively (precise on phones). direct: cursor jumps to the finger.
export type TouchMode = 'trackpad' | 'direct';

type Send = (payload: string) => boolean | void;

const TAP_MS = 220;
const TAP_SLOP_PX = 10;
const LONG_PRESS_MS = 550;
const DOUBLE_TAP_MS = 300;
const SCROLL_STEP_PX = 40;
const TRACKPAD_GAIN = 1.6;

const BUTTON_LEFT = 0;
const BUTTON_RIGHT = 2;

function contentRect(element: HTMLElement, video: HTMLVideoElement): DOMRect {
  const rect = element.getBoundingClientRect();
  if (!video.videoWidth || !video.videoHeight) return rect;
  const videoAspect = video.videoWidth / video.videoHeight;
  const boxAspect = rect.width / rect.height;
  if (videoAspect > boxAspect) {
    const h = rect.width / videoAspect;
    return new DOMRect(rect.left, rect.top + (rect.height - h) / 2, rect.width, h);
  }
  const w = rect.height * videoAspect;
  return new DOMRect(rect.left + (rect.width - w) / 2, rect.top, w, rect.height);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function attachTouch(element: HTMLElement, video: HTMLVideoElement, send: Send, getMode: () => TouchMode): () => void {
  const pointers = new Map<number, { x: number; y: number; startX: number; startY: number }>();
  let cursor = { x: 0.5, y: 0.5 };
  let gestureStart = 0;
  let maxFingers = 0;
  let moved = false;
  let dragging = false;
  let lastTapAt = 0;
  let longPressTimer = 0;
  let scrollAccum = { x: 0, y: 0 };

  const msg = (payload: Record<string, unknown>) => send(JSON.stringify({ ...payload, modifiers: {}, ts: performance.now() }));
  const move = () => msg({ type: 'mouse_move', x: cursor.x, y: cursor.y, buttons: dragging ? 1 : 0 });
  const button = (type: 'mouse_down' | 'mouse_up', b: number) => msg({ type, button: b, x: cursor.x, y: cursor.y });
  const click = (b: number) => {
    button('mouse_down', b);
    button('mouse_up', b);
  };
  const toCursor = (clientX: number, clientY: number) => {
    const r = contentRect(element, video);
    cursor = { x: clamp01((clientX - r.left) / r.width), y: clamp01((clientY - r.top) / r.height) };
  };
  const clearLongPress = () => {
    if (longPressTimer) window.clearTimeout(longPressTimer);
    longPressTimer = 0;
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    element.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
    if (pointers.size === 1) {
      gestureStart = performance.now();
      maxFingers = 1;
      moved = false;
      scrollAccum = { x: 0, y: 0 };
      if (getMode() === 'direct') {
        toCursor(e.clientX, e.clientY);
        move();
        longPressTimer = window.setTimeout(() => {
          longPressTimer = 0;
          if (!moved && pointers.size === 1) {
            click(BUTTON_RIGHT);
            moved = true;  // consume: no left click on release
          }
        }, LONG_PRESS_MS);
      } else if (performance.now() - lastTapAt < DOUBLE_TAP_MS) {
        // tap, then touch-and-hold: drag with the left button held
        dragging = true;
        button('mouse_down', BUTTON_LEFT);
      }
    } else {
      maxFingers = Math.max(maxFingers, pointers.size);
      clearLongPress();
    }
  };

  const onMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p || e.pointerType !== 'touch') return;
    e.preventDefault();
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) > TAP_SLOP_PX) moved = true;

    if (pointers.size >= 2) {
      // average of fingers ≈ each finger's delta / count
      scrollAccum.x += dx / pointers.size;
      scrollAccum.y += dy / pointers.size;
      const sx = Math.trunc(scrollAccum.x / SCROLL_STEP_PX);
      const sy = Math.trunc(scrollAccum.y / SCROLL_STEP_PX);
      if (sx || sy) {
        scrollAccum.x -= sx * SCROLL_STEP_PX;
        scrollAccum.y -= sy * SCROLL_STEP_PX;
        // natural scrolling: content follows the fingers
        msg({ type: 'wheel', dx: -sx, dy: -sy, x: cursor.x, y: cursor.y });
      }
      return;
    }
    if (!moved) return;
    clearLongPress();
    if (getMode() === 'direct') {
      if (!dragging) {
        dragging = true;
        button('mouse_down', BUTTON_LEFT);
      }
      toCursor(e.clientX, e.clientY);
    } else {
      const r = contentRect(element, video);
      cursor = { x: clamp01(cursor.x + (dx * TRACKPAD_GAIN) / r.width), y: clamp01(cursor.y + (dy * TRACKPAD_GAIN) / r.height) };
    }
    move();
  };

  const onUp = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId) || e.pointerType !== 'touch') return;
    e.preventDefault();
    if (pointers.size > 0) return;
    clearLongPress();
    const quick = performance.now() - gestureStart < TAP_MS;
    if (dragging) {
      dragging = false;
      button('mouse_up', BUTTON_LEFT);
    } else if (!moved && quick) {
      if (maxFingers >= 2) {
        click(BUTTON_RIGHT);
      } else {
        click(BUTTON_LEFT);
        lastTapAt = performance.now();
      }
    } else if (!moved && getMode() === 'direct' && maxFingers === 1) {
      click(BUTTON_LEFT);  // slow tap in direct mode still clicks
    }
  };

  const onCancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    clearLongPress();
    if (dragging && pointers.size === 0) {
      dragging = false;
      button('mouse_up', BUTTON_LEFT);
    }
  };

  element.addEventListener('pointerdown', onDown);
  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerup', onUp);
  element.addEventListener('pointercancel', onCancel);
  return () => {
    clearLongPress();
    element.removeEventListener('pointerdown', onDown);
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerup', onUp);
    element.removeEventListener('pointercancel', onCancel);
  };
}

// Soft keyboard: a hidden input opens the OS keyboard; characters go to the host as UTF-8 text
// (layout independent), editing keys as key events.
export function attachSoftKeyboard(field: HTMLInputElement, send: Send): () => void {
  const key = (code: string, k: string) => {
    for (const type of ['key_down', 'key_up']) {
      send(JSON.stringify({ type, key: k, code, repeat: false, modifiers: {}, ts: performance.now() }));
    }
  };
  const text = (t: string) => t && send(JSON.stringify({ type: 'text', text: t }));
  // A sentinel character keeps Backspace producing deleteContentBackward even when "empty".
  const SENTINEL = ' ';
  const reset = () => {
    field.value = SENTINEL;
    field.setSelectionRange(1, 1);
  };
  let composing = false;

  const onBeforeInput = (e: Event) => {
    const ev = e as InputEvent;
    if (ev.inputType === 'deleteContentBackward') key('Backspace', 'Backspace');
    else if (ev.inputType === 'insertText' && !composing) text(ev.data ?? '');
    else return;
    ev.preventDefault();
    reset();
  };
  const onCompositionStart = () => {
    composing = true;
  };
  const onCompositionEnd = (e: CompositionEvent) => {
    composing = false;
    text(e.data);
    reset();
  };
  // Enter never reaches beforeinput on <input>; Android keyboards do report it as keydown.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      key(e.key, e.key);
    }
  };
  reset();

  field.addEventListener('beforeinput', onBeforeInput);
  field.addEventListener('compositionstart', onCompositionStart);
  field.addEventListener('compositionend', onCompositionEnd);
  field.addEventListener('keydown', onKeyDown);
  return () => {
    field.removeEventListener('beforeinput', onBeforeInput);
    field.removeEventListener('compositionstart', onCompositionStart);
    field.removeEventListener('compositionend', onCompositionEnd);
    field.removeEventListener('keydown', onKeyDown);
  };
}
