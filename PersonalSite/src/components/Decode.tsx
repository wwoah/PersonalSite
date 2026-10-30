import { useRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { AsciiReveal } from "ascii-reveal";
import type { AsciiRevealHandle, Duration, Origin, Preset, PresetName } from "ascii-reveal";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, reduceMotion } from "../anim/gsap";
import { STUDIO } from "../anim/presets";

/* ──────────────────────────────────────────────────────────────────
   Decode — content that resolves out of a character grid as it
   scrolls into view, via quanhoang's ascii-reveal.

   Why not the library's own `lazy` mode: it splits the wrapper's
   children into "on screen now" and "later", and when *none* of them
   are on screen it plays everything at once — so a section wrapped on
   its own below the fold decodes where nobody can see it. Here the
   content is hidden instantly on mount (synchronously, before first
   paint) and ScrollTrigger decides when it plays, which also keeps
   the timing in step with every other scroll effect on the page.

   Rules that keep the glyphs on top of the real content:
   - The library measures layout once when a reveal starts, and draws
     into an overlay inside this wrapper. Moving the *wrapper* is fine
     (the overlay moves with it); transforming something *inside* it
     mid-reveal leaves glyphs where it used to be. Parallax and scroll
     transforms therefore go on Decode roots, never on their children.
   - It only animates what lies within the viewport (plus a margin)
     when the reveal starts, so wrap card-sized blocks rather than
     whole sections.
   ────────────────────────────────────────────────────────────────── */

interface DecodeProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  as?: ElementType;
  preset?: PresetName | Preset;
  duration?: Duration;
  speed?: number;
  origin?: Origin;
  /** ScrollTrigger start for the reveal. */
  start?: string;
  /** Play on mount instead of on scroll — for content above the fold. */
  immediate?: boolean;
  /** Seconds to wait after the trigger before decoding. */
  delay?: number;
  onDecoded?: () => void;
  children: ReactNode;
}

function Decode({
  as = "div",
  preset = STUDIO,
  duration = "cinematic",
  speed = 1.35,
  origin = "center",
  start = "top 86%",
  immediate = false,
  delay = 0,
  onDecoded,
  children,
  ...rest
}: DecodeProps) {
  const handle = useRef<AsciiRevealHandle>(null);

  /* useGSAP is a layout effect, and AsciiReveal builds its controller
     in its own layout effect — a child's, so it has already run by the
     time this does. The hide below therefore lands before the browser
     paints a single frame of the real content. */
  useGSAP(() => {
    const h = handle.current;
    const el = h?.element;
    if (!h || !el || reduceMotion()) return;

    void h.hide({ instant: true });

    let live = true;
    let call: gsap.core.Tween | undefined;

    /* Glyph positions are measured from the laid-out text, so a reveal
       that starts before the webfonts land would draw every character
       at the fallback face's width. */
    const play = () =>
      document.fonts.ready.then(() => {
        if (!live) return;
        call = gsap.delayedCall(delay, () => {
          void h.reveal().then(() => live && onDecoded?.());
        });
      });

    if (immediate) {
      void play();
      return () => {
        live = false;
        call?.kill();
      };
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => void play(),
    });

    return () => {
      live = false;
      call?.kill();
      st.kill();
    };
  });

  return (
    <AsciiReveal
      ref={handle}
      as={as}
      preset={preset}
      duration={duration}
      speed={speed}
      origin={origin}
      revealOnMount={false}
      lazy={false}
      {...rest}
    >
      {children}
    </AsciiReveal>
  );
}

export default Decode;
