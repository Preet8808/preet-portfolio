'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { scrollToPage } from '@/lib/scroll';
import { journey, pullQuote } from '@/data/data';

/**
 * CHAPTER 03 — JOURNEY
 *
 * Two parts:
 *
 * 1. A pinned horizontal timeline. Vertical scroll drives the track sideways,
 *    so each milestone gets a full viewport of attention instead of being
 *    one row in a grid. Cards carry a slight alternating rotation that
 *    straightens on hover, plus a lift.
 *
 * 2. A full-bleed pull quote that fades and scales in over its backdrop.
 *
 * Mobile: the pin is abandoned entirely and the track becomes a native
 * scroll-snap carousel, which is smoother and more predictable than
 * emulated horizontal pinning on a small touch screen.
 */

export function Journey() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const pinWrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Teardown handles, collected across both halves of this effect so a
    // single return can run them all. Declared before any early return.
    const cleanup: Array<() => void> = [];

    const isMobile = window.matchMedia('(max-width: 860px)').matches;
    const el = track.current;
    const scroller = section.current;
    const host = pinWrap.current;

    // Everything timeline-specific is inside this guard. The pull quote
    // further down runs regardless, so an early `return` here would
    // silently drop it on mobile.
    if (!isMobile && el && scroller && host) {
      /* ── Desktop: pin and drive horizontally ──

         NOTE: 860px here must stay in sync with the `min-[860px]:`
         variants on the track and card below. When CSS used `md:`
         (768px) while this check used 860px, the 768–860px window got
         `overflow-x: visible` from CSS but no pin from JS — the cards
         overflowed the viewport with no way to scroll to them.

         Skipped entirely under reduced motion, and that is the point:
         with no pin and no scrub the track falls back to being a real
         scroll container (see the media query on
         `[data-journey-track]` in globals.css). Previously `reduced`
         returned early from this whole effect while the CSS still said
         `overflow-x: visible`, so the fourth card sat ~780px past the
         right edge of a 1536px viewport with no pin, no scrub and no
         scrollbar — the timeline looked frozen. */

      let tween: gsap.core.Tween | undefined;

    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Distance the track must travel to reveal its last card.
        const distance = () =>
          Math.max(0, el.scrollWidth - window.innerWidth + window.innerWidth * 0.12);

        tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: scroller,
            start: 'top top',
            end: () => '+=' + distance() * 1.15,
            // 0.45, not 0.6. The extra lag made the cards feel like
            // they were sliding on their own schedule rather than under
            // your finger.
            scrub: 0.45,
            pin: host,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Per-card internal image parallax, driven by the container
        // animation so the images move with the track, not the page.
        el.querySelectorAll<HTMLElement>('[data-journey-card]').forEach((card) => {
          gsap.fromTo(
            card.querySelector('[data-journey-img]'),
            { xPercent: -8, scale: 1.22 },
            {
              xPercent: 8,
              scale: 1.06,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        });
      }, section);

      cleanup.push(() => ctx.revert());
    }

    /* ── Horizontal input ──────────────────────────────────────────
       The track is translated by the pin, so a trackpad's sideways swipe
       and shift+wheel did nothing at all — the only input that moved the
       cards was a vertical scroll. You could see cards running off the
       right edge with no way to reach them.

       Rather than a second scroll container (which would fight the pin
       and desync on resize), horizontal INTENT is converted into page
       scroll and the pin does what it already does. Three inputs:

         · trackpad horizontal swipe  (deltaX)
         · shift + wheel              (deltaY with shiftKey)
         · click-drag across the cards

       These are attached whether or not motion is allowed, because
       "don't animate" should not mean "the content is unreachable".
       Where there is no pin to drive, the delta is applied to the
       track's own scrollLeft instead, which is what the native
       scroll container would have done anyway. */
    {
      // No pin means the cards are not on screen to be dragged.
      const inScene = () => {
        if (reduced) return true;
        const r = host.getBoundingClientRect();
        return r.top <= 1 && r.bottom >= window.innerHeight - 1;
      };

      const applyDelta = (dx: number) => {
        if (reduced) {
          el.scrollLeft += dx;
        } else {
          scrollToPage(window.scrollY + dx, { duration: 0.25 });
        }
      };

      const onWheel = (e: WheelEvent) => {
        const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (!sideways && !e.shiftKey) return;
        if (!inScene()) return;

        e.preventDefault();
        e.stopPropagation();
        applyDelta(sideways ? e.deltaX : e.deltaY);
      };

      // Drag to scrub. Pointer capture so the drag survives the pointer
      // leaving the element, plus a 6px threshold so a plain click on a
      // card is not swallowed as a scrub.
      let dragging = false;
      let startX = 0;
      let lastX = 0;
      let moved = false;

      const onDown = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return; // native pan on touch
        dragging = true;
        moved = false;
        startX = lastX = e.clientX;
      };

      const onMove = (e: PointerEvent) => {
        if (!dragging || !inScene()) return;
        if (!moved && Math.abs(e.clientX - startX) < 6) return;
        if (!moved) {
          moved = true;
          host.setPointerCapture?.(e.pointerId);
          host.style.cursor = 'grabbing';
        }
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        applyDelta(-dx * 1.8);
      };

      const endDrag = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        host.style.cursor = '';
        if (moved) host.releasePointerCapture?.(e.pointerId);
      };

      host.addEventListener('wheel', onWheel, { passive: false });
      host.addEventListener('pointerdown', onDown);
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerup', endDrag);
      host.addEventListener('pointercancel', endDrag);
      if (!reduced) host.style.cursor = 'grab';

      cleanup.push(() => {
        host.removeEventListener('wheel', onWheel);
        host.removeEventListener('pointerdown', onDown);
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerup', endDrag);
        host.removeEventListener('pointercancel', endDrag);
      });
      } // end: !isMobile && el && scroller && host
    }

    /* ── Pull quote: backdrop scales, text lifts ──
       Decorative only, so it is skipped under reduced motion rather
       than being left half-applied.

       The text reveal deliberately NEVER animates opacity.

       It used to: `gsap.from(el, { opacity: 0, ... })` behind a
       `once: true` trigger. If that trigger does not fire — and it did
       not, reliably — the `from()` had already written opacity 0 as its
       start value and the quote stayed invisible for the rest of the
       session. You could scroll straight past a blank section that
       still announced "WORDS I KEEP COMING BACK TO" with nothing
       underneath.

       Hiding content by default and relying on a scroll trigger to
       bring it back is the failure mode to avoid here. So the lift is
       transform-only: worst case the quote sits 40px low and reads
       perfectly well. `fromTo` with explicit end values plus
       `clearProps` means the element also ends in its true natural
       state rather than a baked-in transform. */
    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger);

      const q = quoteRef.current;
      if (q) {
        gsap.fromTo(
          q.querySelector('[data-quote-backdrop]'),
          { scale: 1.14 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: q,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            },
          }
        );

        const lift = (sel: string, y: number, dur: number, delay = 0) => {
          const el = q.querySelector<HTMLElement>(sel);
          if (!el) return;
          gsap.fromTo(
            el,
            { y, scale: sel === '[data-quote-text]' ? 0.96 : 1 },
            {
              y: 0,
              scale: 1,
              duration: dur,
              delay,
              ease: 'power3.out',
              scrollTrigger: { trigger: q, start: 'top 80%', once: true },
              onComplete: () => gsap.set(el, { clearProps: 'transform' }),
            }
          );
        };

        lift('[data-quote-text]', 46, 1.1);
        lift('[data-quote-meta]', 22, 0.8, 0.15);
      }
    }

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, [reduced]);

  return (
    <>
      {/* ── Horizontal timeline ── */}
      <section
        ref={section}
        id="journey"
        className="relative border-t border-white/8"
      >
        {/* ── Pin wrapper ──

             `overflow-x-clip` is load-bearing and was missing for a
             long time. On desktop the track is `overflow-x: visible`
             and translated sideways by the pin, so the cards sit up to
             ~780px past the right edge of the viewport. ScrollTrigger's
             pin makes the wrapper `position: fixed`, which does NOT
             clip its children — so the page itself gained a horizontal
             scrollbar and you could scroll the whole document sideways.

             `overflow-x: clip` on body does not catch it either,
             because the overflow belongs to a fixed-position subtree.

             Clipping here is also what the design wants: cards should
             slide out of frame at the edges, not wander off-canvas. */}
        <div
          ref={pinWrap}
          className="flex min-h-[100svh] flex-col justify-center overflow-x-clip pt-20 pb-6"
        >
          {/* Chapter heading — outside the track so it doesn't travel */}
          <div className="shell flex items-end justify-between gap-6 pb-6">
            <div>
              <span className="label text-accent">02 — Journey</span>
              <h2 className="display mt-5 text-[clamp(1.6rem,4vw,3rem)]">
                How it went
              </h2>
            </div>
            <span className="label hidden text-ink-3 sm:block">
              Scroll to travel →
            </span>
          </div>

          <div
            ref={track}
            data-journey-track
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-4 min-[860px]:snap-none min-[860px]:overflow-x-visible"
          >
            {journey.map((j, i) => (
              <article
                key={j.year + j.title}
                data-journey-card
                className="group w-[78vw] shrink-0 snap-center sm:w-[52vw] lg:w-[42vw] xl:w-[34rem]"
              >
                <div
                  className="overflow-hidden rounded-[var(--radius-card)] border border-white/10 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:border-accent/60 min-[860px]:[transform:rotate(var(--tilt))] min-[860px]:group-hover:[transform:rotate(0deg)_translateY(-0.5rem)]"
                  style={
                    {
                      '--tilt': i % 2 === 0 ? '-0.7deg' : '0.7deg',
                    } as React.CSSProperties
                  }
                >
                  {/* 4/3, not 4/5.

                      The pinned wrapper is exactly one viewport tall, so a
                      4/5 card made the whole pinned scene 829px tall inside
                      a 776px window — the bottom of every card sat below
                      the fold for the entire pin. 4/3 keeps the card under
                      the viewport while letting it be WIDE, which is what
                      the horizontal scroll actually needs: at 26rem the
                      track was only 453px longer than the window, so the
                      "timeline" barely moved. */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-base-raised">
                    <img
                      data-journey-img
                      src={j.image}
                      alt={`${j.title}, ${j.year}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 label rounded-full bg-base/80 px-3 py-1.5 backdrop-blur-sm">
                      {j.year}
                    </span>
                  </div>

                  <div className="border-t border-white/10 bg-base-raised p-5">
                    <h3 className="display text-[clamp(1.1rem,1.9vw,1.5rem)]">
                      {j.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                      {j.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section
        ref={quoteRef}
        className="relative flex min-h-[92svh] items-center overflow-hidden border-t border-white/8"
      >
        <img
          data-quote-backdrop
          src="/placeholder-quote.svg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/40" />

        <div className="shell relative z-10">
          <span className="label text-accent">Words I keep coming back to</span>
          <blockquote
            data-quote-text
            /* leading-[1.02], not the .display default of 0.95. This is
               a three-line quote at up to 6rem — the tight default that
               works for a one-line card title leaves the lines almost
               touching here. */
            className="display mt-8 max-w-[18ch] text-[clamp(2rem,7vw,6rem)] leading-[1.02]"
          >
            &ldquo;{pullQuote.text}&rdquo;
          </blockquote>
          <p data-quote-meta className="label mt-10">
            — {pullQuote.attribution}
          </p>
        </div>
      </section>
    </>
  );
}