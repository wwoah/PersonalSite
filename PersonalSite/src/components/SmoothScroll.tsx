import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother, ScrollTrigger, reduceMotion } from "../anim/gsap";

/* ──────────────────────────────────────────────────────────────────
   ScrollSmoother wrapper.

   Two things this buys beyond "nice scrolling": scrubbed seam
   timelines stop looking steppy on trackpads and low-refresh mice,
   and `effects: true` lets any element opt into parallax with a plain
   `data-speed` attribute — no extra ScrollTrigger per element.

   Native scroll is left alone on touch (smoothTouch: 0). Rewriting
   momentum scrolling on a phone fights the platform and drops frames.
   ────────────────────────────────────────────────────────────────── */
function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduceMotion()) return;

    const smoother = ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: content.current!,
      smooth: 1.1,
      smoothTouch: 0,
      effects: true,
    });

    /* Child effects run before parent effects in React, so every panel
       has already registered its ScrollTrigger against the native
       scroller by the time we get here. One refresh re-measures them
       all against the smoother's proxy. */
    ScrollTrigger.refresh();

    return () => smoother.kill();
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}

export default SmoothScroll;
