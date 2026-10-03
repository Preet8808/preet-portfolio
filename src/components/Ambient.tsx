'use client';

import type { RefObject } from 'react';

/**
 * Film grain overlay.
 *
 * A static SVG turbulence tile rather than an animated canvas or a moving
 * noise filter — animated grain means repainting a full-screen layer every
 * frame, which is one of the most expensive things you can do for a
 * texture most people don't consciously see.
 */
export function Grain() {
  return (
    <div
      data-grain
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] opacity-[0.045]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/**
 * Scroll progress bar — fixed to the top, fills in the accent colour.
 * Driven by a transform so it composites rather than repaints.
 *
 * Takes the ref from the owner rather than creating its own, because it
 * is Page that registers the ScrollTrigger and writes `scaleX` into it.
 * `data-progress` is load-bearing: globals.css matches on it to remove
 * the bar entirely under reduced motion.
 */
export function ScrollProgress({
  barRef,
}: {
  barRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={barRef}
      data-progress
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[160] h-[2px] origin-left bg-accent"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}