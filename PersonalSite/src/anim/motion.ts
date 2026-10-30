/* ──────────────────────────────────────────────────────────────────
   Motion preference

   A hard switch the page checks before it builds a single
   ScrollTrigger, not an afterthought that dials durations down: when
   it is set, every reveal and parallax simply never mounts and the
   smooth scroller is never created. ascii-reveal reads the same media
   query itself and shows content immediately.

   Read live rather than cached, so someone who changes the setting
   system-wide mid-session gets it on the next render.

   Kept apart from gsap.ts so the app shell (the page transition) can
   ask without pulling GSAP and its plugins into the first download.
   ────────────────────────────────────────────────────────────────── */
export const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
