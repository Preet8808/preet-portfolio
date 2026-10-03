'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { chapters, meta } from '@/data/data';

/**
 * Chapter navigation — a fixed rail of numbered dots down the right edge.
 *
 * Renders on BOTH motion paths. It used to `return null` under reduced
 * motion, which quietly deleted the site's primary navigation for
 * anyone with that setting — a nav is content, not decoration, and
 * losing it is worse than the fade it saves.
 *
 * The active chapter is derived from ScrollTrigger when motion is
 * allowed, and from an IntersectionObserver when it is not, since
 * ScrollTrigger is exactly the thing we are avoiding there.
 */
export function ChapterNav() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger);

      // Pair each section with its chapter index so a missing section can
      // never shift the numbering.
      const triggers = chapters.flatMap((c, i) => {
        const el = document.getElementById(c.id);
        if (!el) return [];
        return [
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && setActive(i),
          }),
        ];
      });

      return () => triggers.forEach((t) => t.kill());
    }

    // Reduced motion: same 55% band, expressed as an observer.
    const seen = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = chapters.findIndex((c) => c.id === e.target.id);
          if (i < 0) continue;
          if (e.isIntersecting) seen.add(i);
          else seen.delete(i);
        }
        // Topmost intersecting chapter wins, so scrolling up and down
        // through a boundary settles the same way.
        if (seen.size) setActive(Math.min(...seen));
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-[calc(var(--gutter)*0.55)] top-1/2 z-[120] hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col items-end gap-4">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className="group flex items-center justify-end gap-3"
              aria-current={i === active ? 'true' : undefined}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.2em] transition-all duration-300 ${
                  i === active
                    ? 'text-accent opacity-100'
                    : 'text-ink-3 opacity-0 group-hover:opacity-100'
                }`}
              >
                {c.num} {c.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? 'h-2.5 w-2.5 bg-accent shadow-[0_0_14px_var(--color-accent-glow)]'
                    : 'h-1.5 w-1.5 bg-ink-3 group-hover:bg-ink'
                }`}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Sticky bottom-corner status pill — the "next race" widget.
 */
export function StatusPill() {
  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[120] hidden md:block">
      <div className="flex items-center gap-3 rounded-full border border-white/12 bg-base/70 px-4 py-2.5 backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full pulse-dot rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="label text-ink">{meta.status}</span>
        <span className="label text-ink-3">2027</span>
      </div>
    </div>
  );
}

/**
 * Magnetic button with an accent fill sweep.
 * The sweep is a pseudo-element scaling on the X axis — transform only.
 */
export function MagneticButton({
  href,
  children,
  variant = 'ghost',
  cursor = '',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'ghost' | 'fill';
  cursor?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
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

  const base =
    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full border px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300';
  const look =
    variant === 'fill'
      ? 'border-accent bg-accent text-base'
      : 'border-white/20 text-ink hover:border-accent hover:text-accent';

  return (
    <a
      ref={ref}
      href={href}
      data-cursor={cursor || undefined}
      className={`${base} ${look} ${className}`}
    >
      {/* Fill sweep from the left */}
      {variant === 'ghost' && (
        <span className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
      )}
      <span className="relative z-10 flex items-center gap-3 transition-colors duration-300 group-hover:text-base">
        {children}
      </span>
    </a>
  );
}