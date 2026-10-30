import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, reduceMotion } from "../anim/gsap";
import { SECTIONS } from "../content";
import type { SectionId } from "../content";
import "./Section.css";

/* ──────────────────────────────────────────────────────────────────
   A section: a numbered eyebrow, a display title, an optional intro,
   then the content.

   Two kinds of motion live here, and they are kept apart from the
   ASCII decode deliberately:
   - The title rises line by line out of its own mask (SplitText).
     Titles are marked `data-ascii="skip"` so ascii-reveal never
     measures them while GSAP is moving them.
   - Sections on a dark or orange ground arrive as a rounded panel
     inset from the page edges, and open out to full bleed as they
     scroll in. Only the background layer is clipped — the content
     never moves — so the decode running inside it stays aligned.

   Nothing pins. Earlier versions of this site pinned and scrubbed
   whole sections; they fought the reader at every turn, and a page
   that gets out of the way beats a page that performs.
   ────────────────────────────────────────────────────────────────── */

export type Theme = "paper" | "ink" | "signal";

interface SectionProps {
  id: SectionId;
  theme?: Theme;
  title: ReactNode;
  intro?: ReactNode;
  /** Decorative layer painted behind the content, inside the clipped ground. */
  art?: ReactNode;
  /** Open out from an inset panel as it scrolls in. Off for paper sections. */
  expand?: boolean;
  className?: string;
  children: ReactNode;
}

function Section({
  id,
  theme = "paper",
  title,
  intro,
  art,
  expand = theme !== "paper",
  className,
  children,
}: SectionProps) {
  const root = useRef<HTMLElement>(null);
  const meta = SECTIONS.find((s) => s.id === id)!;

  useGSAP(
    () => {
      const section = root.current;
      if (!section || reduceMotion()) return;
      const q = gsap.utils.selector(section);
      const header = q(".section__header")[0];

      if (expand) {
        gsap.fromTo(
          q(".section__ground"),
          { clipPath: "inset(0% 3.5% 0% 3.5% round 40px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 20%", scrub: true },
          }
        );
      }

      gsap.from(q(".section__rule"), {
        scaleX: 0,
        duration: 1.4,
        ease: "depth",
        scrollTrigger: { trigger: header, start: "top 85%" },
      });

      gsap.from(q(".section__eyebrow > :not(.section__rule), .section__intro"), {
        opacity: 0,
        y: 14,
        duration: 0.8,
        ease: "settle",
        stagger: 0.08,
        scrollTrigger: { trigger: header, start: "top 85%" },
      });

      /* autoSplit re-splits when the webfont lands or the width changes
         — line breaks move at every breakpoint, and a stale split
         leaves masked lines clipping mid-word. Returning the tween from
         onSplit lets GSAP tear down the previous one on each re-split. */
      const split = SplitText.create(q(".section__title"), {
        type: "lines",
        mask: "lines",
        linesClass: "section__title-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "settle",
            stagger: 0.09,
            scrollTrigger: { trigger: header, start: "top 85%" },
          }),
      });

      return () => split.revert();
    },
    { scope: root }
  );

  const classes = ["section", expand && "section--expand", className].filter(Boolean).join(" ");

  return (
    /* tabIndex -1 so the skip link can move focus here. */
    <section
      ref={root}
      id={id}
      data-theme={theme}
      className={classes}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
    >
      <div className="section__ground" aria-hidden="true">
        {art}
      </div>

      <div className="section__inner">
        <header className="section__header">
          <p className="section__eyebrow eyebrow">
            <span className="section__num">{meta.num}</span>
            <span className="section__rule" />
            <span>{meta.label}</span>
          </p>
          <h2 className="section__title" id={`${id}-title`} data-ascii="skip">
            {title}
          </h2>
          {intro && <p className="section__intro">{intro}</p>}
        </header>

        {children}
      </div>
    </section>
  );
}

export default Section;
