'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { meta } from '@/data/data';

/**
 * FOOTER — shared by the single page and every case study.
 *
 * Owns the live IST clock and the back-to-top control. The route wipe
 * lives here rather than in the header so a case-study route — which
 * renders without the site header — still gets the transition.
 */
export function Footer() {
  const pathname = usePathname();
  const [wiping, setWiping] = useState(false);
  const [clock, setClock] = useState('--:--:--');
  const last = useRef(pathname);

  /* ── Live clock, IST ── */
  useEffect(() => {
    const tick = () => {
      try {
        setClock(
          new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(new Date())
        );
      } catch {
        /* Intl unsupported — leave the placeholder */
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Colour-block wipe on route change ── */
  useEffect(() => {
    if (pathname === last.current) return;
    setWiping(true);
    const t = setTimeout(() => setWiping(false), 800);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <footer className="relative z-20 border-t border-white/8">
        <div className="shell flex flex-col gap-8 py-12">
          {/* Big wordmark */}
          <Link
            href="/"
            data-cursor="Home"
            /* leading-[0.9], not 0.85 — 0.85 is below Anton's 0.875
               cap-clipping floor. See --hero-leading in globals.css. */
            className="display text-[clamp(2.2rem,10vw,7rem)] leading-[0.9] transition-colors duration-300 hover:text-accent"
          >
            Let&rsquo;s talk
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-end justify-between gap-10 border-t border-white/8 pt-8">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {meta.links.github && (
                <li>
                  <a
                    href={meta.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="Visit"
                    className="label transition-colors hover:text-accent"
                  >
                    GitHub
                  </a>
                </li>
              )}
              {meta.links.linkedin && (
                <li>
                  <a
                    href={meta.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="Visit"
                    className="label transition-colors hover:text-accent"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${meta.email}`}
                  data-cursor="Email"
                  className="label transition-colors hover:text-accent"
                >
                  {meta.email}
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-6">
              <span className="label">
                Mumbai <span className="text-accent tabular-nums">{clock}</span>
              </span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                data-cursor="Top"
                className="label rounded-full border border-white/15 px-4 py-2 transition-colors hover:border-accent hover:text-accent"
              >
                ↑ Top
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
            <span className="label">
              © {new Date().getFullYear()} {meta.name}
            </span>
            <span className="label text-ink-3">
              Next.js · GSAP · Tailwind
            </span>
          </div>
        </div>
      </footer>

      {/* Route wipe */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[190] bg-accent transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
          wiping ? 'translate-x-0' : '-translate-x-full'
        }`}
      />
    </>
  );
}