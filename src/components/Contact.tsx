'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contact, meta } from '@/data/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { MagneticButton } from '@/components/Chrome';

/**
 * CHAPTER 08 — CONTACT
 *
 * Two pieces:
 *
 * 1. A massive two-line headline that rises from a mask on scroll.
 *
 * 2. An email link with a vertical text-roll on hover — two stacked
 *    copies inside an overflow-hidden mask, the second sliding up over
 *    the first. Pure transform, no layout change.
 *
 * A third piece used to live here: a field of floating tech tags with
 * hand-written physics — damped float, spring home, pointer repulsion
 * inside a 130px radius, ~40 lines and no dependency. It was removed as
 * scope, along with the "drag your cursor through it" prompt and the
 * coarse-pointer/reduced-motion handling that kept the prompt honest.
 * The Skills chapter already lists the stack, so the field was a second
 * place to read the same information.
 */

export function Contact() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-contact-line]', {
        yPercent: 112,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section.current, start: 'top 72%', once: true },
      });

      gsap.from('[data-contact-fade]', {
        opacity: 0,
        y: 26,
        duration: 0.85,
        stagger: 0.09,
        delay: 0.35,
        ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 72%', once: true },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="contact" className="border-t border-white/8">
      <div className="shell py-24 sm:py-32">
        <span className="label text-accent" data-contact-fade>
          07 — Contact
        </span>

        {/* ── Massive headline ──

            leading-[0.9], not 0.88. Each line sits in its own
            `.line-mask` (overflow: hidden), so leading below Anton's
            0.875 cap-clipping floor shears the capitals. 0.88 put the
            cap top 1.4px above the mask edge. See --hero-leading in
            globals.css for the derivation. */}
        <h2 className="display mt-10 text-[clamp(2.4rem,10.5vw,9rem)] leading-[0.9]">
          {contact.headline.map((line, i) => (
            <span key={line} className="line-mask block">
              <span data-contact-line className="block">
                {i === contact.headline.length - 1 ? (
                  <em className="not-italic text-accent">{line}</em>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </h2>

        {/* Single column since the physics tag field was removed — this was
            a two-up grid with the tags on the right, so without changing
            this the email block would sit stranded in the left half. */}
        <div className="mt-16 max-w-[42rem]">
          {/* ── Email roll + buttons ── */}
          <div data-contact-fade>
            <p className="max-w-[38ch] text-[clamp(1rem,1.6vw,1.15rem)] text-ink-2">
              Graduating 2028. Open to AI, backend and infrastructure internships —
              and to collaborations where the engineering actually matters.
            </p>

            {/* Text-roll email */}
            <a
              href={`mailto:${meta.email}`}
              data-cursor="Email"
              className="group mt-10 inline-flex items-baseline gap-3 font-mono text-[clamp(1rem,2.4vw,1.9rem)] text-ink transition-colors hover:text-accent"
            >
              <span className="relative block overflow-hidden">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">
                  {meta.email}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block translate-y-full text-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0"
                >
                  {meta.email}
                </span>
              </span>
              <span className="text-accent transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </a>

            <div className="mt-12 flex flex-wrap gap-3">
              <MagneticButton
                href={`mailto:${meta.email}`}
                variant="fill"
                cursor="Email"
              >
                Start a conversation
              </MagneticButton>
              <MagneticButton href={contact.links[1].href} cursor="Visit">
                GitHub
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* ── Contact rows ── */}
        <ul className="mt-24 border-t border-white/8" data-contact-fade>
          {contact.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                data-cursor="Go"
                className="group flex items-center justify-between gap-6 border-b border-white/8 py-5 transition-colors hover:text-accent"
              >
                <span className="display display-sentence text-[clamp(1.15rem,3vw,2.15rem)]">
                  {l.label}
                </span>
                <span className="label shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-accent">
                  {l.hint} →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
