'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollImpl, resetScrollImpl } from '@/lib/scroll';

/**
 * Smooth scrolling provider.
 *
 * ── Why Lenis is driven FROM the GSAP ticker ────────────────────
 * The first version of this file ran Lenis on its own
 * `requestAnimationFrame` loop. That is the documented-looking thing to
 * do and it is wrong: GSAP runs its animations from its own internal
 * ticker, and the two loops can fall out of step. Worse, GSAP's ticker
 * will go to sleep when it believes nothing needs animating, and because
 * nothing was feeding it, it never woke.
 *
 * The result in the browser was a fully static page: every `gsap.from()`
 * applied its start value (hero name pushed 110% down inside an
 * overflow:hidden mask, so invisible), all scroll scrubs dead, every
 * stat counter stuck at 0. Verified via CDP — ticker.frame frozen at 270
 * while requestAnimationFrame was running at 61fps.
 *
 * Driving Lenis from inside the ticker fixes both things: there is now
 * exactly ONE loop, and every Lenis frame is a ticker frame, so the
 * ticker always has a listener and never sleeps.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion: native scrolling, no smoothing, no ticker driving.
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      // 0.85s, down from 1.1s.

      // 1.1 is Lenis-flavoured "premium" but it is a long time to wait
      // for the page to catch up with the wheel, and on a trackpad it
      // reads as the site lagging behind you rather than gliding. Just
      // under a second keeps the easing curve — which is still a hard
      // exponential ease-out — while removing the feeling of drag.
      duration: 0.85,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native touch scrolling performs better than emulated on phones
      syncTouch: false,
    });

    // ScrollTrigger reads Lenis's scroll position, not the native one.
    lenis.on('scroll', ScrollTrigger.update);

    // ── The integration ──
    // Lenis advances inside GSAP's frame loop. GSAP's time is in seconds,
    // Lenis's raf() expects milliseconds, hence `* 1000`.
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    // Without this GSAP clamps large frame gaps and animations visibly
    // stutter after a tab switch.
    gsap.ticker.lagSmoothing(0);
    // Make sure the loop is live even if something else put it to sleep.
    gsap.ticker.wake();

    // Hand programmatic scrolling to Lenis. Anything calling
    // `scrollToPage` — Journey's drag-to-scrub, for one — has to go
    // through here, otherwise Lenis snaps the page back next frame.
    setScrollImpl((y, opts) =>
      lenis.scrollTo(y, {
        immediate: opts?.immediate ?? false,
        duration: opts?.duration ?? 0.4,
      })
    );

    /* ── Lifecycle ── */

    // Layout shifts once the display font swaps in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    window.addEventListener('resize', onResize);

    // Returning to a backgrounded tab: resync scroll position, because
    // native scroll and Lenis's internal value drift apart while hidden.
    const onVisibility = () => {
      if (!document.hidden) {
        lenis.scrollTo(window.scrollY, { immediate: true });
        ScrollTrigger.refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      gsap.ticker.remove(raf);
      resetScrollImpl();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}