'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { marqueeRows, skillGroups } from '@/data/data';

/**
 * CHAPTER 06 — SKILLS
 *
 * Two marquee rows running in opposite directions. Both react to scroll
 * velocity — flick the wheel and they surge; stop and they settle back to
 * their base drift. Hovering a row eases it to a crawl.
 *
 * Implemented on a single rAF loop per row rather than a CSS animation,
 * because CSS `@keyframes` cannot respond to scroll velocity. The loop
 * reads a shared velocity value and writes one transform per frame.
 *
 * Below that, skills are pill tags that magnetise toward the cursor.
 */

export function Skills() {
  const reduced = useReducedMotion();

  return (
    <section id="skills" className="border-t border-white/8">
      {/* ── Marquees ── */}
      <div className="border-b border-white/8 py-14">
        <div className="shell pb-10">
          <span className="label text-accent">05 — Skills</span>
          <h2 className="display mt-5 text-[clamp(1.9rem,5.5vw,4rem)]">
            What I reach for
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {marqueeRows.map((row, i) => (
            <Marquee
              key={i}
              items={row.items}
              direction={row.speed as 1 | -1}
              reduced={reduced}
            />
          ))}
        </div>
      </div>

      {/* ── Skill groups ── */}
      <div className="shell py-24">
        <p className="label mb-14 text-ink-3">
          Every item below traces back to a public repository
        </p>

        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <div key={g.group}>
              <h3 className="display mb-6 text-[clamp(1.3rem,2.4vw,1.9rem)]">
                {g.group}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <MagnetPill key={item} label={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   MARQUEE
   ══════════════════════════════════════════════════════════════ */

/**
 * Shared scroll velocity, roughly -1..1, decayed each frame. The
 * marquee only uses this to retime its CSS animation, so there is no
 * second animation loop competing with GSAP's ticker.
 */
const velocity = { current: 0, target: 0 };
let decayStarted = false;

function useScrollVelocity() {
  useEffect(() => {
    if (decayStarted) return;
    decayStarted = true;

    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = (y - last) / 40;
      last = y;
      velocity.target = Math.max(-1.6, Math.min(1.6, delta));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const decay = () => {
      velocity.target *= 0.92;
      requestAnimationFrame(decay);
    };
    requestAnimationFrame(decay);

    return () => {
      window.removeEventListener('scroll', onScroll);
      decayStarted = false;
    };
  }, []);
}

/** Base seconds for one full loop at rest. */
const MARQUEE_BASE = 48;

function Marquee({
  items,
  direction,
  reduced,
}: {
  items: string[];
  direction: 1 | -1;
  reduced: boolean;
}) {
  useScrollVelocity();
  const host = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

  /**
   * Retiming instead of translating.
   *
   * The animation itself lives in CSS (see `[data-marquee-track]` in
   * globals.css) so it keeps running under prefers-reduced-motion —
   * that was the bug: the previous rAF loop returned early when
   * reduced motion was on and the rows never moved at all.
   *
   * All this does is shorten the duration while the page is scrolling
   * fast, so the rows surge with the scroll. `transform` is never
   * written from JS, which also keeps it on the compositor.
   */
  useEffect(() => {
    if (reduced) return;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = host.current;
      if (!el || document.hidden) return;

      // Scrolling fast compresses the loop from 48s down to ~14s.
      const boost = Math.min(1, Math.abs(velocity.target) / 1.6);
      const seconds = +(MARQUEE_BASE - boost * (MARQUEE_BASE - 14)).toFixed(1);
      if (Math.abs(seconds - last.current) < 1.5) return;
      last.current = seconds;

      el.style.setProperty('--marquee-duration', `${seconds}s`);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div
      ref={host}
      data-marquee-host
      className="group relative overflow-hidden py-1"
    >
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-base to-transparent" />

      {/* Content is duplicated, so translating -50% is one seamless loop. */}
      <div
        data-marquee-track
        data-marquee-dir={direction === -1 ? '-1' : '1'}
        className="flex w-max items-center gap-10 will-change-transform"
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="display whitespace-nowrap text-[clamp(1.6rem,4vw,3.2rem)] text-ink/15 transition-colors duration-300 group-hover:text-ink/30"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAGNETIC PILL
   ══════════════════════════════════════════════════════════════ */

function MagnetPill({ label }: { label: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Pull is stronger toward the pill's centre and capped so it never
      // detaches visually from its slot in the layout.
      xTo(Math.max(-14, Math.min(14, (e.clientX - (r.left + r.width / 2)) * 0.45)));
      yTo(Math.max(-10, Math.min(10, (e.clientY - (r.top + r.height / 2)) * 0.6)));
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return (
    <li
      ref={ref}
      data-cursor="Known"
      className="cursor-pointer rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2 transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-base"
    >
      {label}
    </li>
  );
}