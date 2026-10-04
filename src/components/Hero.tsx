'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { hero, name, meta } from '@/data/data';

/**
 * HERO
 *
 * The name is split into two lines, each rendered twice: a base layer
 * (solid on line 1, outlined on line 2) and a `hero-spot` overlay that
 * paints a radial gradient clipped to the glyphs. The result is a pool
 * of light that follows the pointer — on line 1 it reads as a halo,
 * on the outlined line 2 it fills the letters solid.
 *
 * The portrait slot between the two lines is deliberately EMPTY. When
 * you add a cut-out PNG it goes there as a third layer, so the type
 * passes in front of and behind it; see the comment at that insertion
 * point for the exact markup and the alpha requirement.
 *
 * Motion:
 *  · lines slide up from a mask on entry
 *  · the spotlight tracks the pointer, drifting on its own when idle
 *  · the whole block parallaxes and fades as you scroll away
 */
export function Hero() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const nameBlock = useRef<HTMLHeadingElement>(null);
  const lineA = useRef<HTMLSpanElement>(null);
  const lineB = useRef<HTMLSpanElement>(null);
  const metaBlock = useRef<HTMLDivElement>(null);

  // ── Entrance ──
  useEffect(() => {
    const lines = [lineA.current, lineB.current].filter(Boolean) as HTMLElement[];

    if (reduced) {
      gsap.set(lines, { clearProps: 'all' });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(lineA.current, { yPercent: 110, duration: 1.3, ease: 'expo.out' })
      .from(lineB.current, { yPercent: 110, duration: 1.3, ease: 'expo.out' }, 0.08)
      .from(metaBlock.current?.children ?? [], {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.06,
      }, 0.55);

    return () => {
      tl.kill();
      // `from()` writes its start value the moment it is created, so a
      // killed timeline strands the line at 110% — and inside an
      // `overflow:hidden` mask that means invisible. Clearing props on
      // the way out guarantees the name is always readable, including
      // under StrictMode's double-invoked effects in development.
      gsap.set(lines, { clearProps: 'all' });
    };
  }, [reduced]);

  // ── Name lockup ──
  /* Both name lines are inset from their own edge by the SAME amount,
     which is what keeps the pair optically centred: line 1 starts at
     gutter+inset and line 2 ends at width-gutter-inset, so the block is
     symmetric about the viewport centre for any inset.

     The inset is measured, not fixed. A vw value cannot work here,
     because --hero-size is min(23vw, 22vh) — the type is sized off the
     SHORTER axis on squat windows, so a proportional inset drifts. With
     --hero-inset at a flat 13vw the horizontal gap between the two words
     measured +269px at 1900 wide, +69px at 1536, and -404px at 768 —
     visibly far apart on one screen and jammed together on another.

     So: measure the real ink width of each word, then solve for the inset
     that centres the pair with the gap expressed as a fraction of the type
     size. Identical proportions at every viewport. */
  useEffect(() => {
    const h1 = nameBlock.current;
    if (!h1) return;

    const measure = () => {
      const a = lineA.current;
      const b = lineB.current;
      if (!a || !b) return;

      // Ink width, not the element box: both lines are full-width blocks
      // with padding, so getBoundingClientRect would report the container.
      const inkWidth = (el: HTMLElement) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().width;
      };

      const sum = inkWidth(a) + inkWidth(b);
      const box = h1.getBoundingClientRect().width;

      // --gutter is a clamp(), so resolve it by measuring rather than
      // reading the custom property, which returns the unresolved token.
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--gutter);height:0';
      document.body.appendChild(probe);
      const gutter = probe.getBoundingClientRect().width;
      probe.remove();

      const fs = parseFloat(getComputedStyle(a).fontSize) || 1;

      // Slightly negative gap: the two words interlock, which is what
      // makes them read as one name rather than two set pieces.
      const gap = -0.02 * fs;

      // Negative on narrow screens, where the words are simply wider than
      // the viewport. Clamped to 0 so they sit on the gutters and overlap
      // as much as they must — still centred, never clipped off-screen.
      const inset = Math.max(0, (box - 2 * gutter - sum - gap) / 2);

      h1.style.setProperty('--hero-inset', `${Math.round(inset)}px`);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(h1);

    // The faces can land after first paint and change the ink widths.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => ro.disconnect();
  }, []);

  // ── Scroll-out: block drifts up and dims ──
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      animation: gsap.to(root.current, {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
      }),
    });

    return () => st.kill();
  }, [reduced]);

  // ── Name spotlight ──
  /* Writes --spot-x / --spot-y on the h1 once per frame.
   *
   * Two modes:
   *  · pointer  — the light tracks the cursor, lerped so it trails
   *    slightly behind the hand rather than snapping to it.
   *  · idle     — after ~1.6s without any pointer movement the light
   *    drifts on a slow ellipse across the name on its own, so the
   *    effect is visible on load and on touch devices where there is
   *    no pointer at all.
   *
   * Only transform-free work per frame: two custom properties on one
   * element. Under reduced motion the idle drift is dropped entirely
   * and the pointer path stops lerping, so there is nothing animating
   * on its own. */
  useEffect(() => {
    const h1 = nameBlock.current;
    if (!h1) return;

    const IDLE_AFTER = 1600;
    let cur = { x: 50, y: 50 };
    let target = { x: 50, y: 50 };
    let lastPointer = -Infinity;
    let raf = 0;
    let t0 = performance.now();

    const paint = () => {
      h1.style.setProperty('--spot-x', `${cur.x.toFixed(2)}%`);
      h1.style.setProperty('--spot-y', `${cur.y.toFixed(2)}%`);
    };

    const onMove = (e: PointerEvent) => {
      // Ignore coarse pointers — a finger drag should not drag the light.
      if (e.pointerType === 'touch') return;
      lastPointer = performance.now();
      const r = h1.getBoundingClientRect();
      target = {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    const lerp = reduced ? 1 : 0.12;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const idle = performance.now() - lastPointer > IDLE_AFTER;
      if (idle && !reduced) {
        const s = (performance.now() - t0) / 1000;
        target = {
          x: 50 + Math.cos(s * 0.42) * 34,
          y: 46 + Math.sin(s * 0.31) * 26,
        };
      }

      cur.x += (target.x - cur.x) * lerp;
      cur.y += (target.y - cur.y) * lerp;
      paint();
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      h1.style.removeProperty('--spot-x');
      h1.style.removeProperty('--spot-y');
    };
  }, [reduced]);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      {/* ── Corner labels ──
          `px-[var(--gutter)]` is required here: this row is a direct
          child of the full-bleed section, not of .shell, so without it
          the labels sat flush against the browser edge. */}
      <div
        ref={metaBlock}
        className="relative z-20 flex items-start justify-between gap-6 px-[var(--gutter)] pt-[calc(var(--gutter)+2.25rem)]"
      >
        <div className="flex flex-col gap-1">
          <span className="label">{hero.cornerLabels[0].text}</span>
          <span className="label label-accent">{meta.status}</span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="label">{hero.cornerLabels[1].text}</span>
          <span className="label">{hero.cornerLabels[2].text}</span>
        </div>
      </div>

      {/* ── Name stack ──
          Layer order: line 1 (back) → portrait (middle) → line 2 (front)

          The h1 is `w-screen` on purpose: it escapes .shell's 1440px cap so
          the type can genuinely span the viewport. When it was width-capped,
          19vw type overflowed on any screen wider than ~1440 and the
          .line-mask clipped it into a cut-off word. */}
      <div className="relative flex flex-1 items-center py-8">
        <h1 ref={nameBlock} className="relative w-screen">
          {/* Line 1 — behind the portrait.
              Two stacked copies of the same text: the base is the solid
              wordmark, the overlay is transparent except where the
              spotlight falls, so the light reads on a solid fill as a
              halo rather than a colour change. */}
          <span className="line-mask relative block pl-[calc(var(--gutter)+var(--hero-inset))]">
            <span
              ref={lineA}
              className="display display-tight block text-[length:var(--hero-size)] will-change-transform"
            >
              {name.first}
            </span>
            <span
              aria-hidden="true"
              className="hero-spot display display-tight absolute inset-0 block pl-[calc(var(--gutter)+var(--hero-inset))] text-[length:var(--hero-size)]"
            >
              {name.first}
            </span>
          </span>

          {/* ── Portrait — not added yet ────────────────────────────────
              Intentionally empty. Both the silhouette placeholder and the
              <img> were removed rather than left as a fallback.

              To add a photo later, paste this between the two name lines
              so the type still layers in front of and behind it:

              <div className="pointer-events-none absolute inset-x-0 -top-[10%] bottom-[-10%] z-10 flex items-center justify-center">
                <img
                  src="/portrait.png"
                  alt="Preet Panaviya"
                  width={1200}
                  height={1600}
                  className="h-full max-h-[62vh] w-auto max-w-full object-contain"
                />
              </div>

              The file must be a PNG with a real alpha channel; an opaque
              background renders as a rectangle across "PANAVIYA". The
              wrapper is 10% taller than the name stack on both sides so
              the figure crosses the type instead of sitting inside it. */}

          {/* Line 2 — in front of the portrait.
              This is the one the effect is really for: the base is an
              OUTLINE, so the spotlight filling the glyphs solid as the
              cursor crosses them is plainly visible.

              Both lines carry the same --hero-inset, which is what keeps
              the pair centred — see the Name lockup effect. PREET stays
              line 1 and PANAVIYA line 2 so the name still reads in
              order; they are drawn towards each other and towards the
              centre rather than swapped. */}
          <span className="line-mask relative z-20 block pr-[calc(var(--gutter)+var(--hero-inset))] text-right">
            <span
              ref={lineB}
              className="display display-tight display-outline block text-[length:var(--hero-size)] will-change-transform"
            >
              {name.last}
            </span>
            <span
              aria-hidden="true"
              className="hero-spot hero-spot-fill display display-tight absolute inset-0 block pr-[calc(var(--gutter)+var(--hero-inset))] text-right text-[length:var(--hero-size)]"
            >
              {name.last}
            </span>
          </span>
        </h1>
      </div>

      {/* ── Sub-line + actions + scroll hint ──
          Two columns on desktop so the sub-line is not crushed into a
          narrow left-hand column.

          The bottom padding clears the fixed StatusPill, which is pinned
          at `bottom-5 left-5` and roughly 40px tall. Without the extra
          4.5rem the sub-line sat on top of it. */}
      <div className="relative z-20 flex flex-col gap-8 px-[var(--gutter)] pb-[calc(var(--gutter)+0.5rem)]">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <p className="display max-w-[30ch] text-[clamp(1rem,1.7vw,1.8rem)] leading-[1.32]">
            {hero.subline}
          </p>

          <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
            <a href="#work" className="btn btn-fill" data-magnet>
              See the work
            </a>
            <a href={`mailto:${meta.email}`} className="btn" data-magnet>
              Get in touch
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-ink-3" />
          <span className="label pulse-soft">{hero.scrollHint}</span>
          <span className="h-px w-10 bg-ink-3" />
        </div>
      </div>
    </section>
  );
}
