'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { signal } from '@/data/data';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * CHAPTER 07 — WHAT'S UP
 *
 * A bento grid rather than a uniform one: a 4-column layout where tile
 * sizes are deliberately uneven, so the eye reads it as an index of
 * recent output instead of a product grid.
 *
 * Each tile tilts in 3D toward the cursor. The tilt is transform-only and
 * driven by GSAP quickTo, so it composes on the GPU — and it is capped at
 * ±7° so the tile never looks broken or seasick.
 */

/** Column / row spans per tile, in order. */
const SPANS = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2', // 1 — hero tile
  'lg:col-span-2', // 2
  'lg:col-span-2', // 3
  'lg:col-span-1', // 4
  'lg:col-span-1', // 5
  'lg:col-span-2', // 6
];

export function Signal() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);

  /* ── Staggered reveal ── */
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-signal-tile]', {
        opacity: 0,
        y: 44,
        rotate: -1.5,
        duration: 0.95,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 82%', once: true },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="signal" className="border-t border-white/8">
      <div className="shell py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-14">
          <div>
            <span className="label text-accent">06 — What&rsquo;s up</span>
            <h2 className="display mt-5 text-[clamp(1.9rem,5.5vw,4rem)]">
              Recently
            </h2>
          </div>
          <p className="max-w-[36ch] text-sm text-ink-3">
            What I have shipped, written and released lately.
          </p>
        </div>

        <div className="grid auto-rows-[13rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {signal.map((item, i) => (
            <Tile
              key={item.id}
              item={item}
              span={SPANS[i] ?? ''}
              reduced={reduced}
              large={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── One tile ── */
function Tile({
  item,
  span,
  reduced,
  large,
}: {
  item: (typeof signal)[number];
  span: string;
  reduced: boolean;
  large: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  /* ── 3D tilt toward the cursor ── */
  useEffect(() => {
    if (reduced) return;
    const host = ref.current;
    const el = inner.current;
    if (!host || !el) return;

    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const zTo = gsap.quickTo(el, 'z', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      rotY(px * 14); // capped ≈ ±7°
      rotX(-py * 14);
      zTo(38);
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
      zTo(0);
    };

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return (
    <div ref={ref} data-signal-tile className={`group [perspective:1100px] ${span}`}>
      <div
        ref={inner}
        className="relative h-full w-full rounded-[var(--radius-card)] border border-white/10 transition-colors duration-400 group-hover:border-accent/60"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <a
          href={item.href}
          target={item.href.startsWith('#') ? undefined : '_blank'}
          rel={item.href.startsWith('#') ? undefined : 'noopener noreferrer'}
          data-cursor="Open"
          className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-[var(--radius-card)]"
        >
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06] group-hover:opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/55 to-transparent" />

          <div className="relative p-5 sm:p-6">
            <span className="label text-accent">{item.meta}</span>
            <h3
              className={`display mt-2 leading-[1.02] ${
                large ? 'text-[clamp(1.6rem,3.4vw,2.6rem)]' : 'text-[clamp(1.1rem,2vw,1.5rem)]'
              }`}
            >
              {item.title}
            </h3>
          </div>

          {/* Arrow nudges out on hover */}
          <span className="label absolute right-5 top-5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </div>
    </div>
  );
}