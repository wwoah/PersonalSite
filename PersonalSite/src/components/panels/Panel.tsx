import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, reduceMotion } from "../../anim/gsap";
import { Prompt, Cmd } from "../Term";
import "./Panel.css";

/* ──────────────────────────────────────────────────────────────────
   A Panel is one section. That is the whole of it.

   It used to be one section plus a pinned, scrubbed, bisected seam
   that carried you out of it — a diagonal cut, a 3D recede, a wipe or
   a curtain, each holding the viewport for two screenfuls. Those are
   gone. They fought the reader at every turn: they fired before a
   short section had ever been fully on screen, they clipped content
   away mid-fade, they made the rail's idea of "where am I" depend on
   viewport height, and they turned every jump into a landing problem.
   A page that gets out of the way beats a page that performs.

   What is left is scrolling. Sections follow one another, the header
   reveals as it comes into view, and the ghost numeral drifts. Nothing
   pins, nothing clips, nothing hands the scroll position back.
   ────────────────────────────────────────────────────────────────── */

export interface PanelMeta {
  id: string;
  num: string;
  kicker: string;
  title: string;
}

interface PanelProps extends PanelMeta {
  /**
   * Skip the section header and ghost numeral. The hero brings its own
   * chrome — without this it would print its own name twice, once as
   * the panel title and once as the banner.
   */
  bare?: boolean;
  children: ReactNode;
}

function Panel({ id, num, kicker, title, bare = false, children }: PanelProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const panel = root.current;
      /* One gate, checked before a single ScrollTrigger is built rather
         than dialling durations down afterwards. With it on, this is
         plain scrolling over static content. */
      if (!panel || reduceMotion()) return;

      const q = gsap.utils.selector(panel);

      /* The ghost numeral drifts against the scroll — the one piece of
         parallax left, and cheap: a transform on a single element. */
      gsap.to(q(".panel__num"), {
        yPercent: -34,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      const header = q(".panel__header")[0];
      if (!header) return;

      /* Header reveal — masked line-by-line via SplitText.
         gsap.context reverts the tweens for us but not the split
         itself, so hand one back as an explicit cleanup. Reverting
         restores plain text nodes, which keeps copy/paste and screen
         readers working after unmount.

         autoSplit re-splits when the webfont lands or the width
         changes: line breaks move at every breakpoint, and a stale
         split leaves masked lines clipping mid-word. Returning the
         tween from onSplit is what lets GSAP tear down the previous
         one on each re-split. */
      const split = SplitText.create(q(".panel__title"), {
        type: "lines",
        mask: "lines",
        linesClass: "panel__title-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            duration: 0.9,
            ease: "settle",
            stagger: 0.08,
            scrollTrigger: {
              trigger: header,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }),
      });

      gsap.from(q(".panel__kicker"), {
        opacity: 0,
        x: -18,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: header,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      return () => {
        split.kill();
        split.revert();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id={id}
      className={bare ? "panel panel--bare" : "panel"}
      aria-labelledby={`${id}-title`}
    >
      {!bare && (
        <div className="panel__num" aria-hidden="true">
          {num}
        </div>
      )}

      <div className="panel__inner">
        {bare ? (
          /* The hero's own banner is styled type, not a heading the
             section can be named by, so the accessible name lives here
             instead. */
          <span id={`${id}-title`} className="sr-only">
            {title}
          </span>
        ) : (
          <header className="panel__header">
            <p className="panel__kicker">
              <Prompt /> <Cmd text={kicker} />
              <span className="panel__caret" aria-hidden="true">
                {"█"}
              </span>
            </p>
            <h2 className="panel__title" id={`${id}-title`}>
              {title}
            </h2>
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export default Panel;
