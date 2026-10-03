'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { Project } from '@/data/data';

/**
 * Case-study hero.
 *
 * The cover image carries the same `view-transition-name` as the card it
 * came from, so on navigation the browser grows it from the card's exact
 * position rather than cutting. Lines rise from a mask on mount, then the
 * whole block drifts away as you scroll into the case study.
 */
export function CaseStudyHero({
  project,
  heroTech,
}: {
  project: Project;
  heroTech: string[];
}) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-hero-line]', {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.07,
        delay: 0.15,
      });

      gsap.from('[data-hero-fade]', {
        opacity: 0,
        y: 22,
        duration: 0.8,
        stagger: 0.08,
        delay: 0.5,
      });

      gsap.to(root.current, {
        yPercent: -12,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden">
      {/* Cover, shared with the card */}
      <div className="absolute inset-0">
        <img
          src={project.image}
          alt={`${project.title} — cover`}
          style={{ viewTransitionName: `project-hero-${project.slug}` }}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, #0a0a0a 12%, rgba(10,10,10,.55) 55%, ${project.brand}22 100%)`,
          }}
        />
      </div>

      <div className="shell relative z-10 pb-16 pt-32">
        <div className="flex flex-wrap items-center gap-4 pb-8" data-hero-fade>
          <span className="label text-accent">{project.category}</span>
          <span className="label text-ink-3">{project.year}</span>
          {project.live && (
            <span className="label rounded-full border border-accent/50 px-3 py-1 text-accent">
              Live
            </span>
          )}
        </div>

        <h1 className="display text-[clamp(3rem,13vw,11rem)]">
          <span className="line-mask block">
            <span data-hero-line className="block">
              {project.title}
            </span>
          </span>
        </h1>

        <p
          data-hero-fade
          className="mt-6 max-w-[46ch] text-[clamp(1rem,1.7vw,1.25rem)] text-ink-2"
        >
          {project.kicker ?? project.summary}
        </p>

        <div className="mt-8 flex flex-wrap gap-1.5" data-hero-fade>
          {heroTech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/18 bg-base/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}