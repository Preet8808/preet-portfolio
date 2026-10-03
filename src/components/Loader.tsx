'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * LOADER — F1 start-light sequence.
 *
 * A 0→100 counter drives five red lights that extinguish one by one
 * ("lights out"), then the panels part in the centre to reveal the page.
 *
 * Under prefers-reduced-motion this renders nothing and calls onDone
 * immediately, so the site is never gated behind an animation.
 */

const LIGHT_COUNT = 5;
/** Hard ceiling in ms. The page must never wait on this. */
const MAX_DURATION = 2600;

export function Loader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [lightsOut, setLightsOut] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  // ── Reduced motion: skip entirely ──
  useEffect(() => {
    if (reduced && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [reduced, onDone]);

  // ── Countdown ──
  useEffect(() => {
    if (reduced || doneRef.current) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;

      // Ease toward 100 rather than a linear fill — reads as loading,
      // not like filling a bucket.
      const linear = Math.min(1, elapsed / MAX_DURATION);
      const eased = 1 - Math.pow(1 - linear, 2.2);
      const value = Math.min(100, Math.round(eased * 100));

      setProgress(value);

      // Lights extinguish in the last 70%.
      setLightsOut(Math.floor(((value - 30) / 70) * LIGHT_COUNT));

      if (value >= 100) {
        setLeaving(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  // ── Curtain wipe, then hand off ──
  useEffect(() => {
    if (!leaving || doneRef.current) return;

    const t = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone();
    }, 900);

    return () => clearTimeout(t);
  }, [leaving, onDone]);

  // ── Skip: any key or pointer ──
  useEffect(() => {
    if (reduced) return;

    const skip = () => {
      if (doneRef.current) return;
      setProgress(100);
      setLightsOut(LIGHT_COUNT);
      setLeaving(true);
    };

    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    const cap = setTimeout(skip, MAX_DURATION);

    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      clearTimeout(cap);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      data-loader
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex flex-col justify-between"
    >
      {/* Two curtain panels that part in the centre */}
      <div
        className="absolute inset-x-0 top-0 bg-base transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)]"
        style={{ height: '50%', transform: leaving ? 'translateY(-101%)' : 'translateY(0)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-base transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)]"
        style={{ height: '50%', transform: leaving ? 'translateY(101%)' : 'translateY(0)' }}
      />

      {/* Content sits above the panels */}
      <div className="relative z-10 flex items-start justify-between p-[var(--gutter)]">
        <span className="label">Portfolio 2026</span>
        <span className="label">Preet Panaviya</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Start lights */}
        <div className="flex items-center gap-3 sm:gap-4">
          {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
            <span
              key={i}
              className="block h-6 w-6 rounded-full border border-light/40 transition-all duration-300 sm:h-8 sm:w-8"
              style={{
                background: i < lightsOut ? 'transparent' : 'var(--color-light)',
                boxShadow:
                  i < lightsOut ? 'none' : '0 0 24px rgb(225 6 0 / 0.55)',
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="display text-[clamp(4rem,16vw,11rem)] tabular-nums leading-none">
          <span className="text-accent">{progress}</span>
          <span className="text-ink-3">%</span>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between p-[var(--gutter)]">
        <span className="label">
          {lightsOut >= LIGHT_COUNT ? 'Lights out' : 'Loading'}
        </span>
        <span className="label">Skip — press any key</span>
      </div>
    </div>
  );
}