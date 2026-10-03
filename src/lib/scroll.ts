/**
 * Single entry point for "scroll the page to this Y".
 *
 * Why this exists: Lenis owns the scroll position on the animated
 * path. Writing `window.scrollTo` behind its back desyncs Lenis's
 * internal value from the real one, and it snaps the page back on the
 * next frame. So anything that needs to move the page programmatically
 * — the Journey drag-to-scrub, for example — has to go through Lenis.
 *
 * On the reduced-motion path Lenis is never constructed, so the default
 * implementation is plain native scrolling, which is correct there.
 */

export type ScrollOptions = {
  /** Jump instead of animating. */
  immediate?: boolean;
  /** Seconds. Ignored when `immediate`. */
  duration?: number;
};

type ScrollImpl = (y: number, opts?: ScrollOptions) => void;

const native: ScrollImpl = (y, opts) => {
  if (opts?.immediate) {
    window.scrollTo(0, y);
    return;
  }
  window.scrollTo({ top: y, behavior: 'smooth' });
};

let impl: ScrollImpl = native;

/** Called once by <SmoothScroll /> when Lenis is live. */
export function setScrollImpl(fn: ScrollImpl) {
  impl = fn;
}

/** Called on unmount so a torn-down Lenis cannot be called into. */
export function resetScrollImpl() {
  impl = native;
}

/** Clamped to the document, then handed to whoever owns scrolling. */
export function scrollToPage(y: number, opts?: ScrollOptions) {
  const max = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  impl(Math.max(0, Math.min(max, y)), opts);
}