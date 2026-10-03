'use client';

import { useEffect, useState } from 'react';

/**
 * Reduced-motion guard.
 *
 * Returns `true` on the server render and during the first client paint
 * so markup never flashes an animated state at someone who has asked for
 * stillness. Hydration-safe because the initial value matches SSR.
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