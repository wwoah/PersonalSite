import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { createAsciiReveal } from "ascii-reveal";
import type { AsciiRevealController } from "ascii-reveal";
import { reduceMotion } from "../../anim/motion";
import { preloadRoute } from "../../routes";
import { TransitionContext } from "./context";
import "./PageTransition.css";

/* ──────────────────────────────────────────────────────────────────
   Route transitions through an ASCII curtain.

   The curtain is a full-viewport surface that ascii-reveal treats like
   any card: a dot field ripples out from where you clicked, the panel
   fills in behind it and the destination's name decodes in the
   middle. Under cover of that, the next route's code is fetched and
   the route swaps; then the whole thing scrambles back out from the
   centre to show the new page — which, on the front page, is itself
   decoding in.

   Three phases, each awaited, so a slow network stretches the closed
   state rather than cutting to a half-loaded page:
     1. reveal()    — curtain decodes in from the pointer
     2. preload     — the destination chunk (already in flight)
     3. hide()      — after the new route has committed and painted
   ────────────────────────────────────────────────────────────────── */

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (k: number) => (k ? requestAnimationFrame(() => step(k - 1)) : resolve());
    step(n);
  });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function PageTransition({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const curtain = useRef<HTMLDivElement>(null);
  const ctrl = useRef<AsciiRevealController | null>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState("");

  useLayoutEffect(() => {
    const el = curtain.current;
    if (!el) return;
    /* fallback: false — the curtain is one surface and a line of text,
       cheap to draw, and a watchdog cutting it short mid-transition
       would show the route swap it exists to hide. */
    const c = createAsciiReveal(el, {
      preset: "blueprint",
      duration: "fast",
      lazy: false,
      fallback: false,
    });
    void c.hide({ instant: true });
    ctrl.current = c;
    return () => {
      c.destroy();
      ctrl.current = null;
    };
  }, []);

  const go = useCallback(
    (to: string, nextLabel = "") => {
      const el = curtain.current;
      const c = ctrl.current;
      if (busy.current) return;

      if (!el || !c || reduceMotion()) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }

      busy.current = true;
      /* The curtain names where you are going. The label has to be in
         the DOM before reveal() measures it, or the curtain decodes
         whatever the previous transition said. */
      flushSync(() => setLabel(nextLabel));
      el.setAttribute("data-active", "");
      const ready = preloadRoute(to).catch(() => undefined);

      void (async () => {
        let fadeOut: Animation | undefined;
        try {
          const t0 = performance.now();
          await c.reveal({ origin: "pointer" });

          /* ascii-reveal has a watchdog: when a device has just been
             dropping frames, it skips animations for a few seconds,
             resolves reveal() straight away and fades the content in
             over ~220ms on its own. Without waiting that fade out, the
             route would swap while the curtain was still see-through. */
          const skipped = performance.now() - t0 < 80;
          if (skipped) await wait(260);

          await ready;
          navigate(to);
          window.scrollTo(0, 0);
          /* Router navigations run as transitions, so the commit lands
             a beat after navigate() returns. Two frames covers it;
             the pause after is so the closed curtain registers as a
             moment rather than a flicker. */
          await frames(2);
          await wait(140);

          if (skipped) {
            // The library would hide instantly here too — a hard cut.
            fadeOut = el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 320,
              easing: "ease-in",
              fill: "forwards",
            });
            await fadeOut.finished;
            void c.hide({ instant: true });
          } else {
            await c.hide({ origin: "center" });
          }
        } finally {
          el.removeAttribute("data-active");
          fadeOut?.cancel();
          busy.current = false;
        }
      })();
    },
    [navigate]
  );

  return (
    <TransitionContext.Provider value={go}>
      {children}

      <div
        ref={curtain}
        className="curtain"
        data-theme="ink"
        aria-hidden="true"
      >
        <div className="curtain__panel" data-ascii="surface" />
        <div className="curtain__content">
          <p className="curtain__eyebrow">Phillip Bishop</p>
          <p className="curtain__label">{label}</p>
          <p className="curtain__hint">Loading</p>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export default PageTransition;
