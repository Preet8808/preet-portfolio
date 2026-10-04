'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contact, meta, floatTags } from '@/data/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { MagneticButton } from '@/components/Chrome';

/**
 * CHAPTER 08 — CONTACT
 *
 * Three pieces:
 *
 * 1. A massive two-line headline that rises from a mask on scroll.
 *
 * 2. An email link with a vertical text-roll on hover — two stacked
 *    copies inside an overflow-hidden mask, the second sliding up over
 *    the first. Pure transform, no layout change.
 *
 * 3. Floating tags with light physics.
 *
 * On (3): the spec offered matter.js or react-three-fiber. I wrote the
 * loop by hand instead. matter.js is ~90 KB for what is, here, ten
 * elements doing damped float + mouse repulsion — and r3f would pull in
 * three.js (~500 KB) to move some text around. The hand-rolled version is
 * ~40 lines, ships nothing, and behaves identically at this scale.
 * If the tag count ever grows past a few dozen, reach for matter-js then.
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

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1fr]">
          {/* ── Left: email roll + buttons ── */}
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

          {/* ── Right: physics tags ── */}
          <div data-contact-fade>
            <p className="label mb-4">Drag your cursor through it</p>
            <FloatTags />
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

/* ══════════════════════════════════════════════════════════════
   FLOATING TAGS
   ══════════════════════════════════════════════════════════════ */

type Node = {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bx: number; // home
  by: number;
  phase: number;
  drift: number;
};

function FloatTags() {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const nodes = useRef<Node[]>([]);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (reduced) return;
    const host = box.current;
    if (!host) return;

    const RADIUS = 130; // pointer influence
    const SPRING = 0.012; // pull back to home
    const DAMP = 0.88; // velocity decay

    let raf = 0;
    let w = 0;
    let h = 0;

    const measure = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
    };
    measure();

    // Seed each tag at a scattered home position.
    const tags = Array.from(host.querySelectorAll<HTMLElement>('[data-tag]'));
    nodes.current = tags.map((el, i) => {
      const bx = ((i * 37) % 100) / 100 * (w - 150) + 20;
      const by = ((i * 61) % 100) / 100 * (h - 90) + 20;
      el.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      return {
        el,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        bx,
        by,
        phase: Math.random() * Math.PI * 2,
        drift: 0.5 + Math.random() * 0.9,
      };
    });

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.current.x = e.clientX - r.left;
      mouse.current.y = e.clientY - r.top;
      mouse.current.active = true;
    };
    const onLeave = () => (mouse.current.active = false);

    const onResize = () => {
      measure();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      const t = time * 0.001;

      for (const n of nodes.current) {
        // Gentle buoyancy so nothing sits perfectly still
        n.vx += Math.cos(t * n.drift + n.phase) * 0.014;
        n.vy += Math.sin(t * n.drift * 0.8 + n.phase) * 0.014;

        // Spring home
        n.vx += (n.bx - n.x) * SPRING;
        n.vy += (n.by - n.y) * SPRING;

        // Pointer repulsion
        if (mouse.current.active) {
          const dx = n.x + 55 - mouse.current.x;
          const dy = n.y + 18 - mouse.current.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS && d > 0.01) {
            const force = (1 - d / RADIUS) * 0.9;
            n.vx += (dx / d) * force;
            n.vy += (dy / d) * force;
          }
        }

        n.vx *= DAMP;
        n.vy *= DAMP;
        n.x += n.vx;
        n.y += n.vy;

        n.el.style.transform = `translate3d(${n.x}px, ${n.y}px, 0) rotate(${
          n.vx * 1.6
        }deg)`;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  if (reduced) {
    // Static, readable fallback — tags laid out as a plain wrap.
    return (
      <ul className="flex flex-wrap gap-2">
        {floatTags.map((t) => (
          <li
            key={t}
            className="rounded-full border border-white/12 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3"
          >
            {t}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={box}
      className="relative h-[19rem] overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-base-raised"
    >
      {floatTags.map((t, i) => (
        <span
          key={t}
          data-tag
          className={`absolute left-0 top-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
            i % 3 === 0
              ? 'border-accent/50 bg-accent/10 text-accent'
              : 'border-white/14 bg-base text-ink-2'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}