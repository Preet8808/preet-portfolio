'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type PanInfo,
} from 'framer-motion';
import { lifeCards } from '@/data/data';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * CHAPTER 05 — LIFE
 *
 * Four large cards. Clicking one expands it into a full-screen viewer
 * that you can drag with the mouse or swipe on touch.
 *
 * The viewer's two layouts (slider and grid) use the same components and
 * the same `layoutId`, so switching between them re-flows with a FLIP
 * animation rather than a crossfade — elements physically travel to
 * their new positions instead of being replaced.
 */

const TOTAL = lifeCards.length;

export function Life() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<'slider' | 'grid'>('slider');

  const openCard = (i: number) => {
    if (reduced) return; // plain scroll-through under reduced motion
    setIndex(i);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  /* ── Keyboard + scroll lock while open ── */
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('overflow-hidden');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % TOTAL);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + TOTAL) % TOTAL);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + TOTAL) % TOTAL);

  return (
    <section id="life" className="border-t border-white/8">
      <div className="shell py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <div>
            <span className="label text-accent">04 — Life</span>
            <h2 className="display mt-5 text-[clamp(1.9rem,5.5vw,4rem)]">
              Life as a developer
            </h2>
          </div>
          <p className="max-w-[38ch] text-sm text-ink-3">
            Four things that are not code but decide what kind of code I write.
            Click one to open it.
          </p>
        </div>

        {/* ── The four cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lifeCards.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => openCard(i)}
              data-cursor="Open"
              layoutId={reduced ? undefined : `life-${c.id}`}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 text-left transition-colors duration-400 hover:border-accent/60"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
                <span className="label absolute left-4 top-4 rounded-full bg-base/75 px-3 py-1.5 backdrop-blur-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="border-t border-white/10 bg-base-raised p-5">
                <p className="label text-accent">{c.kicker}</p>
                <h3 className="display mt-2 text-[clamp(1.25rem,2.2vw,1.7rem)]">
                  {c.title}
                </h3>
                <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-3">
                  {c.text}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Full-screen viewer ── */}
      <AnimatePresence>
        {open && (
          <LifeViewer
            index={index}
            setIndex={setIndex}
            view={view}
            setView={setView}
            step={step}
            close={close}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIEWER
   ══════════════════════════════════════════════════════════════ */

function LifeViewer({
  index,
  setIndex,
  view,
  setView,
  step,
  close,
}: {
  index: number;
  setIndex: (i: number) => void;
  view: 'slider' | 'grid';
  setView: (v: 'slider' | 'grid') => void;
  step: (d: 1 | -1) => void;
  close: () => void;
}) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const dragX = useMotionValue(0);
  const swipeRef = useRef(0);

  // Live progress while dragging, then settle on the committed index.
  const commitProgress = (i: number) => {
    const w = 1 / TOTAL;
    const start = i * w;
    progress.set(reduced ? start : start + w * 0.5);
  };

  useEffect(() => {
    const w = 1 / TOTAL;
    const from = reduced
      ? index * w
      : Number(progress.get()) - w / 2;
    const to = index * w + w / 2;
    if (Math.abs(from - to) < 0.001) return;

    const t = window.setTimeout(() => progress.set(to), 0);
    return () => window.clearTimeout(t);
  }, [index, progress, reduced, TOTAL]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // Swipe if the gesture was fast or travelled far enough.
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power < -90) step(1);
    else if (power > 90) step(-1);
    else setIndex(index);
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    swipeRef.current = info.offset.x;
    const w = 1 / TOTAL;
    // Shift the bar as you drag, clamped to the current segment.
    progress.set(index * w + w / 2 + (info.offset.x / 600) * w);
  };

  return (
    <motion.div
      key="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      className="fixed inset-0 z-[195] flex flex-col bg-base"
      role="dialog"
      aria-modal="true"
      aria-label="Life as a developer"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-6 border-b border-white/8 px-[var(--gutter)] py-5">
        <span className="label text-accent">
          {String(index + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === 'slider' ? 'grid' : 'slider')}
            data-cursor="Flip"
            aria-label="Change view"
            className="label rounded-full border border-white/18 px-4 py-2 transition-colors hover:border-accent hover:text-accent"
          >
            {view === 'slider' ? 'Grid view' : 'Slider view'}
          </button>

          <button
            onClick={close}
            data-cursor="Close"
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/18 transition-colors hover:border-accent hover:text-accent"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-[2px] w-full bg-white/8">
        <motion.div
          className="h-full origin-left bg-accent"
          style={{ scaleX: progress }}
        />
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1 overflow-hidden">
        {view === 'slider' ? (
          <div className="flex h-full snap-x snap-mandatory items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lifeCards.map((c, i) => (
              <motion.div
                key={c.id}
                layoutId={`life-${c.id}`}
                layout
                drag={reduced ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.14}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                onViewportEnter={() => index !== i && index !== undefined && null}
                className="w-full shrink-0 snap-center px-[var(--gutter)] py-8 sm:px-8"
              >
                <LifePanel card={c} index={i} active={i === index} onPick={() => setIndex(i)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 content-center gap-3 overflow-y-auto p-[var(--gutter)] sm:grid-cols-2">
            {lifeCards.map((c, i) => (
              <motion.div
                key={c.id}
                layoutId={`life-${c.id}`}
                layout
                onClick={() => setIndex(i)}
                className="cursor-pointer"
              >
                <LifePanel card={c} index={i} active={i === index} onPick={() => setIndex(i)} compact />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="flex items-center justify-between gap-6 border-t border-white/8 px-[var(--gutter)] py-5">
        <button
          onClick={() => step(-1)}
          data-cursor="Prev"
          aria-label="Previous"
          className="label rounded-full border border-white/18 px-5 py-2.5 transition-colors hover:border-accent hover:text-accent"
        >
          ← Prev
        </button>

        <span className="label hidden text-ink-3 sm:block">
          Drag, swipe or use ← →
        </span>

        <button
          onClick={() => step(1)}
          data-cursor="Next"
          aria-label="Next"
          className="label rounded-full border border-white/18 px-5 py-2.5 transition-colors hover:border-accent hover:text-accent"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
}

/* ── One panel, shared by both layouts ── */
function LifePanel({
  card,
  index,
  active,
  onPick,
  compact = false,
}: {
  card: (typeof lifeCards)[number];
  index: number;
  active: boolean;
  onPick: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onPick}
      className={`group relative h-full overflow-hidden rounded-[var(--radius-card)] border transition-colors duration-400 ${
        active ? 'border-accent/60' : 'border-white/10'
      }`}
    >
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/25" />

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-9">
        <div className="flex items-center gap-4">
          <span className="label text-accent">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="label">{card.kicker}</span>
        </div>

        <h3
          className={`display mt-4 ${compact ? 'text-[clamp(1.4rem,3vw,2.2rem)]' : 'text-[clamp(2rem,6vw,4.5rem)]'}`}
        >
          {card.title}
        </h3>

        <p
          className={`mt-4 max-w-[46ch] leading-relaxed text-ink-2 ${
            compact ? 'text-sm' : 'text-[clamp(.95rem,1.5vw,1.15rem)]'
          }`}
        >
          {card.text}
        </p>
      </div>
    </div>
  );
}