'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * CURSOR — a small dot plus a trailing ring.
 *
 * The ring grows and prints a contextual label ("VIEW", "DRAG", "OPEN")
 * when it enters anything carrying a `data-cursor` attribute.
 *
 * Performance note: both elements move with `translate3d` only, and both
 * are driven from a single RAF. There is no per-move style write beyond
 * two transforms, and no mask or filter anywhere — masks repaint, and a
 * repaint per pointer event is exactly what makes a site feel laggy.
 */

type Mode = 'default' | string;

export function Cursor() {
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    // Coarse pointer means a finger, not a mouse — no custom cursor.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    // Ring trails the dot with easing; the dot tracks the pointer exactly.
    const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    const trail = { x: pointer.x, y: pointer.y };
    let mode: Mode = 'default';
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;

      const hit = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(
        '[data-cursor], a, button'
      );
      const next: Mode = hit?.dataset.cursor ?? 'default';
      if (next !== mode) {
        mode = next;
        const active = mode !== 'default';
        ring.style.width = ring.style.height = active ? '72px' : '36px';
        ring.style.borderColor = active ? 'var(--color-accent)' : 'rgba(244,244,242,.4)';
        ring.style.background = active ? 'rgb(212 255 0 / 0.12)' : 'transparent';
        label.textContent = active ? mode : '';
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      trail.x += (pointer.x - trail.x) * 0.16;
      trail.y += (pointer.y - trail.y) * 0.16;
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
    };
    raf = requestAnimationFrame(loop);

    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    // This registration was MISSING. `onMove` was defined and then only
    // ever removed in the cleanup, never added — so neither the dot nor
    // the ring ever received a pointer position. Both sat frozen at the
    // viewport centre (the initial `pointer` value) for the whole
    // session. Combined with `body { cursor: none }` below, that left
    // anyone on a fine pointer with NO visible cursor at all: the native
    // one was suppressed and the replacement was parked in the middle
    // of the screen.
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      {/* Trailing ring — sits behind the dot */}
      <div
        ref={ringRef}
        data-cursor-layer
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-300"
        style={{ width: 36, height: 36, borderColor: 'rgba(244,244,242,.4)' }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[9px] tracking-[0.2em] text-accent"
        />
      </div>

      {/* Exact-tracking dot */}
      <div
        ref={dotRef}
        data-cursor-layer
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-accent transition-opacity duration-200"
      />

      {/* Hide the native cursor only where the custom one is active */}
      <style>{`@media (pointer: fine) { body { cursor: none; } }`}</style>
    </>
  );
}