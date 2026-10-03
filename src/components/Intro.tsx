'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { intro } from '@/data/data';

/**
 * CHAPTER 02 — INTRO
 *
 * Pinned viewport. As you scroll, the bio's words brighten one by one
 * from dim to full, which forces reading at a crawl and lands the point
 * in the copy. Alongside it: four count-up stats and a general-info card
 * whose signature SVG draws itself on stroke-dashoffset.
 *
 * Cost note: the word highlight is one scrubbed tween over an array of
 * spans — no per-frame DOM reads. The pin is released immediately on
 * refresh, and the whole thing is skipped under reduced motion.
 */

type Word = { text: string; em: boolean };

export function Intro() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const sigRef = useRef<SVGPathElement>(null);

  /**
   * Split the bio into words, flagging any wrapped in <data-em> so they
   * can pick up the accent colour. Doing this in JS rather than at build
   * time keeps data.ts readable and editable as plain prose.
   */
  const words = useMemo<Word[]>(() => {
    const out: Word[] = [];
    const re = /<data-em>(.*?)<\/data-em>|([^<]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(intro.bio))) {
      if (m[1] != null) {
        m[1].split(/\s+/).filter(Boolean).forEach((w) => out.push({ text: w, em: true }));
      } else {
        m[2].split(/\s+/).filter(Boolean).forEach((w) => out.push({ text: w, em: false }));
      }
    }
    return out;
  }, []);

  useEffect(() => {
    /* Under reduced motion: no pin, no scrub — but the page still has to
       be READABLE. That means rendering the final values directly, not
       leaving counters sitting on their initial "0". Previously the
       reduced-motion branch only lit the bio words, so the stat row read
       0 / 0 / 0 / 0 for every visitor with reduced motion enabled. */
    if (reduced) {
      bioRef.current?.querySelectorAll('span').forEach((s) => {
        s.style.opacity = '1';
      });
      document.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
        const to = parseFloat(el.dataset.stat ?? '0');
        const dp = parseInt(el.dataset.dp || '0', 10);
        el.textContent = to.toFixed(dp);
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      /* ── Word-by-word scrub ── */
      const spans = bioRef.current?.querySelectorAll('span') ?? [];

      gsap.set(spans, { opacity: 0.13 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          // Scroll distance the reveal is spread across.
          end: '+=70%',
          scrub: 0.5,
          pin: viewport.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(spans, {
        opacity: 1,
        duration: 1,
        stagger: 1 / Math.max(1, spans.length),
        ease: 'none',
      });

      // Counters fire as the pin settles.
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top 60%',
        once: true,
        onEnter: () => {
          document.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
            const to = parseFloat(el.dataset.stat!);
            const dp = parseInt(el.dataset.dp || '0', 10);
            const o = { v: 0 };
            gsap.to(o, {
              v: to,
              duration: 1.7,
              ease: 'power3.out',
              onUpdate: () => (el.textContent = o.v.toFixed(dp)),
            });
          });
        },
      });

      /* ── Signature stroke draw ── */
      const path = sigRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: section.current,
            start: 'top 45%',
            end: '+=40%',
            scrub: 0.6,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={section}
      id="intro"
      className="relative border-t border-white/8"
    >
      <div
        ref={viewport}
        className="flex min-h-[100svh] flex-col justify-center py-24"
      >
        <div className="shell grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* ── Left: eyebrow, headline, scrubbed bio ── */}
          <div className="flex flex-col justify-center">
            <span className="label mb-8 text-accent">{intro.eyebrow}</span>

            <h2 className="display max-w-[14ch] text-[clamp(2.2rem,6.5vw,5.2rem)] leading-[1.04]">
              {intro.headline}
            </h2>

            <p
              ref={bioRef}
              // Word spacing is STRUCTURAL (flex gap), not a utility class.
              // The word split discards whitespace between words, so the gap
              // has to come from layout — an `mr-[…]` utility on each span
              // was silently computing to 0 and the words ran together.
              className="mt-10 flex max-w-[42ch] flex-wrap text-[clamp(1.05rem,1.9vw,1.45rem)] leading-[1.55] text-ink"
              style={{ columnGap: '0.28em', rowGap: '0.1em' }}
            >
              {words.map((w, i) => (
                <span
                  key={i}
                  className={`will-change-opacity ${w.em ? 'text-accent' : ''}`}
                  style={{ opacity: reduced ? 1 : 0.13 }}
                >
                  {w.text}
                </span>
              ))}
            </p>
          </div>

          {/* ── Right: stats + general info ── */}
          <div className="flex flex-col gap-8 lg:pt-16">
            {/* Stats */}
            <dl className="grid grid-cols-2 border-t border-white/10">
              {intro.stats.map((s) => (
                <div
                  key={s.label}
                  className="border-b border-r border-white/10 py-6 pr-4"
                >
                  <dd className="display text-[clamp(2rem,4.5vw,3.4rem)] leading-none tabular-nums">
                    <span
                      data-stat={s.value}
                      data-dp={s.dp}
                      style={{ opacity: reduced ? 1 : undefined }}
                    >
                      0
                    </span>
                    {s.suffix}
                  </dd>
                  <dt className="label mt-2.5">{s.label}</dt>
                </div>
              ))}
            </dl>

            {/* General info card */}
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-base-raised p-6 sm:p-7">
              <span className="label block pb-4">General info</span>

              <ul className="grid gap-3.5">
                {intro.info.map((row) => (
                  <li
                    key={row.k}
                    className="flex items-baseline justify-between gap-5 border-b border-white/6 pb-3.5 last:border-0 last:pb-0"
                  >
                    <span className="label">{row.k}</span>
                    <span className="text-right text-sm text-ink">{row.v}</span>
                  </li>
                ))}
              </ul>

              {/* Signature — draws itself */}
              <svg
                viewBox="0 0 244 66"
                className="mt-7 h-14 w-full"
                aria-hidden="true"
              >
                <path
                  ref={sigRef}
                  d={intro.signature}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                {/* Underline is a separate path so it is not part of the
                    draw-on animation — it should already be there when
                    the flourish lands. */}
                <path
                  d={intro.signatureUnderline}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="label mt-2 block">Preet Panaviya</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}