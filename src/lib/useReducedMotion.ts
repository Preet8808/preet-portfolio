'use client';

import { useEffect, useState } from 'react';

/**
 * Reduced-motion guard.
 *
 * Returns `false` on the first render, then corrects itself in an effect
 * once the real media query can be read. That is deliberate and
 * hydration-safe: the initial value matches on both server and client, so
 * there is no hydration mismatch, and the correction lands in the same
 * commit as the first effect.
 *
 * The consequence to be aware of: `reduced` is briefly `false` even for
 * someone who has asked for stillness. Any effect keyed on it will run its
 * animated branch once before being torn down. Keep those branches cheap,
 * or read the media query directly if the value has to be right on the
 * very first pass.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}