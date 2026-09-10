import { ScrollSmoother, reduceMotion } from "./gsap";

/* ──────────────────────────────────────────────────────────────────
   Send the reader to a section.

   Which scroller is in charge depends on the motion preference:
   ScrollSmoother owns the scroll position while motion is on, and a
   plain `scrollTo` under it lands nowhere. With motion off the smoother
   is never created and native scrolling applies. Asking
   `ScrollSmoother.get()` rather than the preference keeps this correct
   during the frame where one has just been torn down.
   ────────────────────────────────────────────────────────────────── */
export function scrollToSection(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;

  const animate = smooth && !reduceMotion();
  const smoother = ScrollSmoother.get();

  if (smoother) {
    /* The destination is resolved to a number here rather than handed
       to scrollTo as an element. Nothing pins any more, so the two now
       agree — but resolving up front is still the honest thing to ask
       for, and it means a layout shift mid-flight cannot move the
       destination out from under the scroll. */
    smoother.scrollTo(el.getBoundingClientRect().top + smoother.scrollTop(), animate);
    return;
  }

  el.scrollIntoView({ behavior: animate ? "smooth" : "auto", block: "start" });
}
