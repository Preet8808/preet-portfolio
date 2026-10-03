'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SmoothScroll } from '@/components/SmoothScroll';
import { Loader } from '@/components/Loader';
import { Cursor } from '@/components/Cursor';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { Journey } from '@/components/Journey';
import { Work } from '@/components/Work';
import { Life } from '@/components/Life';
import { Skills } from '@/components/Skills';
import { Signal } from '@/components/Signal';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Grain, ScrollProgress } from '@/components/Ambient';
import { ChapterNav, StatusPill } from '@/components/Chrome';

/**
 * PAGE — all eight chapters wired in document order:
 * hero → intro → journey → work → life → skills → signal → contact.
 */

export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // ── Scroll progress bar: one transform, driven by ScrollTrigger ──
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const bar = barRef.current;
    if (!bar) return;

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });

    return () => st.kill();
  }, [reduced, loaded]);

  // ── Reveal the page once the loader is done ──
  useEffect(() => {
    if (loaded && !reduced) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [loaded, reduced]);

  return (
    <SmoothScroll>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}

      <Cursor />
      <Grain />
      <ScrollProgress barRef={barRef} />
      <Header />
      <ChapterNav />
      <StatusPill />

      <main ref={mainRef} id="main" style={{ opacity: loaded || reduced ? 1 : 0 }}>
        <Hero />

        {/* ── 02 · Intro ── */}
        <Intro />

        {/* ── 03 · Journey ── */}
        <Journey />

        {/* ── 04 · Selected work ── */}
        <Work />

        {/* ── 05 · Life ── */}
        <Life />

        {/* ── 06 · Skills ── */}
        <Skills />

        {/* ── 07 · What''s up ── */}
        <Signal />

        {/* ── 08 · Contact ── */}
        <Contact />
      </main>

      <Footer />
    </SmoothScroll>
  );
}