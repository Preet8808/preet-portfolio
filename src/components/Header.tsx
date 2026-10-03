'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { chapters, menuLinks } from '@/data/data';

/**
 * Header + full-screen menu.
 *
 * The menu is a clip-path reveal with staggered links and a floating
 * preview image that follows the cursor. Route changes also trigger a
 * colour-block wipe so navigation feels like a chapter turning.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [hover, setHover] = useState<{ img: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock the page while the menu is open
  useEffect(() => {
    document.documentElement.classList.toggle('overflow-hidden', open);
    return () => document.documentElement.classList.remove('overflow-hidden');
  }, [open]);

  // Route wipe
  useEffect(() => {
    if (pathname === '/') return;
    setWiping(true);
    const t = setTimeout(() => setWiping(false), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const track = (img: string) => (e: React.PointerEvent) =>
    setHover({ img, x: e.clientX, y: e.clientY });

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[180] flex items-center justify-between gap-6 px-[var(--gutter)] py-6 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-base/80 backdrop-blur-md py-4'
            : 'border-b border-transparent'
        }`}
      >
        <a href="#top" className="display text-lg tracking-tight">
          {chapters.length > 0 ? 'Preet Panaviya' : ''}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {chapters.slice(0, 5).map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="label transition-colors hover:text-accent"
            >
              {c.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href="#contact"
            data-cursor="Say hi"
            className="label hidden text-accent sm:block"
          >
            Contact
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-cursor={open ? 'Close' : 'Menu'}
            className="group flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-px w-6 bg-ink transition-transform duration-300 ${
                open ? 'translate-y-[3.5px] rotate-45' : 'group-hover:translate-x-1'
              }`}
            />
            <span
              className={`block h-px w-6 bg-ink transition-transform duration-300 ${
                open ? '-translate-y-[3.5px] -rotate-45' : 'group-hover:-translate-x-1'
              }`}
            />
          </button>
        </div>
      </header>

      {/* ── Full-screen menu ── */}
      <div
        className={`fixed inset-0 z-[170] bg-base transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
          open ? '[clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <ul className="flex h-full flex-col justify-center gap-1 px-[var(--gutter)]">
          {menuLinks.map((l, i) => (
            <li
              key={l.href}
              className="overflow-hidden"
              style={{
                transform: open ? 'translateY(0)' : 'translateY(110%)',
                opacity: open ? 1 : 0,
                transition: `transform 700ms var(--ease-out-expo) ${i * 60}ms, opacity 500ms ${i * 60}ms`,
              }}
            >
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                onPointerMove={track(l.image)}
                onPointerLeave={() => setHover(null)}
                data-cursor="Go"
                className="group flex items-baseline gap-6 py-1"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="display text-[clamp(2.5rem,9vw,7rem)] leading-none transition-colors duration-300 group-hover:text-accent">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-[var(--gutter)] left-[var(--gutter)]">
          <span className="label">Mumbai · India</span>
        </div>
      </div>

      {/* Floating preview image that follows the cursor */}
      {hover && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[175] h-40 w-32 overflow-hidden rounded border border-white/10 transition-transform duration-200"
          style={{
            left: hover.x,
            top: hover.y,
            transform: 'translate(-50%,-50%) scale(0.94)',
          }}
        >
          <img
            src={hover.img}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
        </div>
      )}

      {/* Route colour-block wipe */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[190] bg-accent transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
          wiping ? 'translate-x-0' : '-translate-x-full'
        }`}
      />
    </>
  );
}