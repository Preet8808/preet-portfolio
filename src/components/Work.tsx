'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { projects } from '@/data/data';

/**
 * CHAPTER 04 — SELECTED WORK
 *
 * Cards crossfade to a second image on hover, tint toward the project's
 * own brand colour, and slide the title/year up from a mask.
 *
 * Clicking a card runs a shared-element transition: the card's image and
 * the case-study hero are given the same `view-transition-name`, and the
 * router push is wrapped in `document.startViewTransition()` so the
 * browser interpolates between them. Where the API is unsupported the
 * navigation simply happens — no feature detection ceremony in the UI.
 */
export function Work() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const section = useRef<HTMLElement>(null);

  /* ── Entrance ── */
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-work-card]', {
        opacity: 0,
        y: 46,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 82%', once: true },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  /** Navigate with a shared-element morph where supported. */
  const openCase = (e: React.MouseEvent, slug: string) => {
    if (reduced) return; // plain navigation

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };

    if (!doc.startViewTransition) return; // let the Link handle it
    e.preventDefault();
    doc.startViewTransition(() => router.push(`/work/${slug}`));
  };

  return (
    <section ref={section} id="work" className="border-t border-white/8">
      <div className="shell py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <div>
            <span className="label text-accent">03 — Selected work</span>
            <h2 className="display mt-5 text-[clamp(1.9rem,5.5vw,4rem)]">
              Things I built
            </h2>
          </div>
          <p className="max-w-[38ch] text-sm text-ink-3">
            Every project below is a public repository. Hover for detail,
            click for the full case study.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          {projects.map((p, i) => {
            // A 2-up rhythm across a 6-column grid, with the first card
            // given double width so the row never reads as uniform.
            const span =
              i === 0 ? 'md:col-span-2 xl:col-span-3' : 'xl:col-span-3';

            return (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                onClick={(e) => openCase(e, p.slug)}
                data-cursor="View"
                data-work-card
                className={`group relative block overflow-hidden rounded-[var(--radius-card)] border border-white/10 ${span}`}
              >
                {/* Brand tint — fades in on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-30 md:group-hover:opacity-25"
                  style={{
                    background: `radial-gradient(120% 100% at 50% 100%, ${p.brand} 0%, transparent 70%)`,
                  }}
                />

                <div className="relative aspect-[4/3] overflow-hidden bg-base-raised">
                  {/* Base image */}
                  <img
                    src={p.image}
                    alt={`${p.title} — cover`}
                    loading="lazy"
                    decoding="async"
                    style={{ viewTransitionName: `project-hero-${p.slug}` }}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {/* Hover-state image, crossfaded in */}
                  <img
                    src={p.hoverImage}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Year badge */}
                  <span className="absolute left-4 top-4 label rounded-full bg-base/80 px-3 py-1.5 backdrop-blur-sm">
                    {p.year}
                  </span>
                  {p.live && (
                    <span className="absolute right-4 top-4 label rounded-full border border-accent/50 bg-base/80 px-3 py-1.5 text-accent backdrop-blur-sm">
                      Live
                    </span>
                  )}
                </div>

                {/* Text block */}
                <div className="relative z-20 border-t border-white/10 bg-base-raised p-6">
                  <div className="line-mask">
                    <span className="display block translate-y-0 text-[clamp(1.3rem,2.4vw,1.9rem)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-[-0.15rem]">
                      {p.title}
                    </span>
                  </div>

                  <p className="label mt-2 text-ink-3">{p.category}</p>

                  <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                    {p.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.tech.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}