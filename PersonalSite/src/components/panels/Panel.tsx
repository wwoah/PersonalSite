import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, reduceMotion, isTouch } from "../../anim/gsap";
import "./Panel.css";

/* ──────────────────────────────────────────────────────────────────
   A Panel is one section plus the seam that carries you out of it.

   The seam is driven by a pinned, scrubbed ScrollTrigger anchored at
   `bottom bottom` — the moment the section's last screenful is fully
   in view. Pinning there means the content freezes exactly where the
   reader left it, so the transition starts from continuity rather
   than from a jump.

   Everything the seam draws (blade, wipe, slats, the incoming card)
   is anchored to `bottom: 0; height: 100vh` inside the panel. Panels
   are taller than the viewport, but their bottom screenful *is* the
   viewport while pinned — so bottom-anchoring is what keeps the
   overlays registered to the screen without measuring anything.
   ────────────────────────────────────────────────────────────────── */

export type ExitVariant = "slash" | "depth" | "wipe" | "curtain" | "none";

export interface PanelMeta {
  id: string;
  num: string;
  kicker: string;
  title: string;
}

interface PanelProps extends PanelMeta {
  exit: ExitVariant;
  /** The panel this one hands off to. Its header rises through the seam. */
  next?: PanelMeta;
  /**
   * Where the diagonal crosses the left and right edges, measured up
   * from the bottom of the viewport in vh. Varying these per seam is
   * what stops three slashes from reading as one repeated effect.
   */
  cut?: [number, number];
  /**
   * Skip the section header and ghost numeral. The hero needs the seam
   * machinery but brings its own chrome.
   */
  bare?: boolean;
  children: ReactNode;
}

/** Scroll distance each seam consumes, as a % of viewport height. */
const RUNWAY: Record<ExitVariant, number> = {
  slash: 85,
  depth: 55,
  wipe: 55,
  curtain: 65,
  none: 0,
};

const CURTAIN_SLATS = 9;

function Panel({
  id,
  num,
  kicker,
  title,
  exit,
  next,
  cut = [58, 34],
  bare = false,
  children,
}: PanelProps) {
  const root = useRef<HTMLElement>(null);
  const bisected = exit === "slash";

  useGSAP(
    () => {
      const panel = root.current;
      if (!panel) return;

      const q = gsap.utils.selector(panel);
      const stage = q(".panel__stage")[0];
      const header = q(".panel__header")[0];

      /* ── Header reveal — masked line-by-line via SplitText ────────
         gsap.context reverts the tweens for us but not the split
         itself, so we hand one back as an explicit cleanup. Reverting
         restores plain text nodes, which keeps copy/paste and screen
         readers working after unmount.                          */
      let split: SplitText | undefined;
      const cleanup = () => {
        split?.kill();
        split?.revert();
      };

      if (header) {
        // Split every copy of the title, not just the real one — a bisected
        // panel has the heading in both layers and they must render
        // identically or the seam shows a seam.
        //
        // autoSplit re-splits when the webfont lands or the width changes.
        // Line breaks move at every breakpoint, and a stale split leaves
        // masked lines clipping mid-word. Returning the tween from onSplit
        // is what lets GSAP tear down the previous one on each re-split.
        split = SplitText.create(q(".panel__title"), {
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
      }

      /* ── Ghost numeral parallax ─────────────────────────────────── */
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

      if (exit === "none" || !stage) return cleanup;

      /* ── The seam ───────────────────────────────────────────────── */
      const layerA = q(".panel__layer--a")[0];
      const layerB = q(".panel__layer--b")[0];
      const incoming = q(".panel__incoming")[0];

      // Phones get the same choreography at roughly half the travel —
      // full-depth 3D on a small, low-power screen costs more in jank
      // than it returns.
      const k = isTouch() ? 0.55 : 1;

      /* The clone is never reachable by keyboard, in either state. Its
         focusables are neutralised once, up front, so the tab order only
         ever contains the real copy. */
      layerB
        ?.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]'
        )
        .forEach((el) => {
          el.tabIndex = -1;
        });
      // Owned here rather than in JSX so a re-render can't reset it
      // underneath the seam.
      layerB?.toggleAttribute("inert", true);

      /* The clip must be a pure function of trigger state: any frame where
         the layers are separated but unclipped shows the section doubled.
         Latched so the common case is a comparison, not a DOM write.

         Opening the cut also hands layer B pointer events. Once A is
         clipped to one side of the diagonal it stops being hit-testable
         on the other, so anything living in the far half goes dead — the
         arcade link sits ~13vh from the bottom of the hero, well below
         the cut, which made it unclickable after ~47px of scroll. The two
         clips are complementary and travel apart, so they never overlap:
         exactly one copy answers a click at any point. */
      let cutOn = false;
      const syncCut = (self: globalThis.ScrollTrigger) => {
        const want = self.isActive || self.progress > 0;
        if (want === cutOn) return;
        cutOn = want;
        panel.classList.toggle("is-cutting", want);
        layerB?.toggleAttribute("inert", !want);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "bottom bottom",
          end: `+=${RUNWAY[exit]}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          // Tidy up the edges of the seam without policing the middle.
          // Snapping to a flat [0, 1] meant stopping anywhere past 45%
          // yanked you back the better part of a viewport, which fights
          // the reader. Returning `v` unchanged in the middle band leaves
          // a deliberate mid-cut pause alone — the clip holds, so a
          // half-separated frame reads as intent, not breakage.
          snap: {
            snapTo: (v) => (v < 0.25 ? 0 : v > 0.75 ? 1 : v),
            duration: { min: 0.1, max: 0.35 },
            delay: 0.12,
            ease: "power1.inOut",
          },
          // The clip is a discrete state change, never a tween: while the
          // panel is whole, layer A must stay unclipped so selection and
          // clicks reach the bottom of the section.
          //
          // Derived from state rather than from directional callbacks.
          // onEnter/onLeaveBack miss two cases that both leave the panel
          // separated but unclipped — i.e. visibly doubled: jumping
          // straight into the middle of the range (anchor link, rail
          // click, restored scroll), and reloading past the seam, where
          // the timeline resumes at progress 1 with no crossing to fire.
          // isActive covers the live seam, progress covers the far side.
          onUpdate: syncCut,
          onToggle: syncCut,
          onRefresh: syncCut,
        },
      });

      if (exit === "slash") {
        tl.fromTo(
          q(".panel__blade-line"),
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.24, ease: "blade" },
          0
        )
          .to(q(".panel__blade"), { opacity: 1, duration: 0.1 }, 0)
          .to(q(".panel__blade"), { opacity: 0, duration: 0.3 }, 0.42)
          .to(
            layerA,
            {
              xPercent: 6 * k,
              yPercent: -15 * k,
              rotate: -1.4 * k,
              duration: 0.6,
              ease: "blade",
            },
            0.18
          )
          .to(
            layerB,
            {
              xPercent: -6 * k,
              yPercent: 15 * k,
              rotate: 1.4 * k,
              duration: 0.6,
              ease: "blade",
            },
            0.18
          )
          .to(
            stage,
            {
              z: -420 * k,
              rotateX: 8 * k,
              opacity: 0.2,
              duration: 0.62,
              ease: "depth",
            },
            0.2
          );
      }

      if (exit === "depth") {
        tl.to(
          stage,
          {
            z: -900 * k,
            rotateX: 13 * k,
            yPercent: -5 * k,
            opacity: 0,
            duration: 0.62,
            ease: "depth",
          },
          0
        );
      }

      if (exit === "wipe") {
        tl.fromTo(
          q(".panel__wipe"),
          { xPercent: -101 },
          { xPercent: 0, duration: 0.34, ease: "blade" },
          0
        )
          .to(
            stage,
            {
              xPercent: -13 * k,
              rotateY: 7 * k,
              opacity: 0,
              duration: 0.4,
              ease: "depth",
            },
            0.08
          )
          .to(q(".panel__wipe"), { xPercent: 101, duration: 0.38, ease: "blade" }, 0.42);
      }

      if (exit === "curtain") {
        const slats = q(".panel__slat");
        tl.to(
          slats,
          {
            scaleY: 1,
            duration: 0.3,
            stagger: { each: 0.035, from: "start" },
            ease: "blade",
          },
          0
        )
          .to(
            stage,
            {
              rotateX: -15 * k,
              z: -500 * k,
              opacity: 0,
              duration: 0.4,
              ease: "depth",
            },
            0.14
          )
          .to(
            slats,
            {
              scaleY: 0,
              transformOrigin: "bottom center",
              duration: 0.32,
              stagger: { each: 0.035, from: "end" },
              ease: "blade",
            },
            0.52
          );
      }

      /* The next section's header rises out of the gap and lands where
         the real header will be, so the pin release reads as a handoff
         rather than a cut. */
      if (incoming) {
        tl.fromTo(
          incoming,
          { z: -820 * k, scale: 0.84, opacity: 0 },
          { z: 0, scale: 1, opacity: 1, duration: 0.55, ease: "depth" },
          exit === "slash" ? 0.4 : 0.32
        );
      }

      return cleanup;
    },
    { scope: root, dependencies: [exit] }
  );

  const body = bare ? (
    children
  ) : (
    <>
      <header className="panel__header">
        <p className="panel__kicker">{kicker}</p>
        <h2 className="panel__title">{title}</h2>
      </header>
      {children}
    </>
  );

  const cutVars = {
    "--cut-l": `${cut[0]}vh`,
    "--cut-r": `${cut[1]}vh`,
  } as React.CSSProperties;

  return (
    <section
      ref={root}
      id={id}
      className={bare ? "panel panel--bare" : "panel"}
      data-exit={exit}
      style={cutVars}
      aria-labelledby={`${id}-title`}
    >
      <div className="panel__stage">
        <div className="panel__layer panel__layer--a">
          {!bare && (
            <div className="panel__num" aria-hidden="true">
              {num}
            </div>
          )}
          <div className="panel__inner">
            {/* The accessible name for the section. Lives on the real
                copy only, never the clone, so there is exactly one. */}
            <span id={`${id}-title`} className="sr-only">
              {title}
            </span>
            {body}
          </div>
        </div>

        {/* The bisected duplicate. Clipped to the far side of the same
            diagonal, so at rest it sits pixel-exact on top of layer A
            and the section looks whole. Hidden from the a11y tree and
            the tab order — it is pure geometry. */}
        {bisected && (
          <div className="panel__layer panel__layer--b" aria-hidden="true">
            {!bare && <div className="panel__num">{num}</div>}
            <div className="panel__inner">{body}</div>
          </div>
        )}
      </div>

      {exit === "slash" && (
        <svg
          className="panel__blade"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            className="panel__blade-line"
            x1="0"
            y1={100 - cut[0]}
            x2="100"
            y2={100 - cut[1]}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {exit === "wipe" && <div className="panel__wipe" aria-hidden="true" />}

      {exit === "curtain" && (
        <div className="panel__slats" aria-hidden="true">
          {Array.from({ length: CURTAIN_SLATS }, (_, i) => (
            <div key={i} className="panel__slat" />
          ))}
        </div>
      )}

      {next && exit !== "none" && (
        <div className="panel__incoming" aria-hidden="true">
          <div className="panel__incoming-num">{next.num}</div>
          <p className="panel__incoming-kicker">{next.kicker}</p>
          <h2 className="panel__incoming-title">{next.title}</h2>
        </div>
      )}
    </section>
  );
}

/* Reduced motion gets a genuinely different component, not a dialled-down
   one: no pin, no duplicate DOM, no 3D — just the content and a short
   opacity fade. Chosen at the top of the tree so the seam code never
   even mounts. */
function PlainPanel({ id, num, kicker, title, children }: PanelProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(root.current!.querySelectorAll(".panel__header > *"), {
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: "top 85%" },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id={id} className="panel panel--plain">
      <div className="panel__stage">
        <div className="panel__layer panel__layer--a">
          <div className="panel__num" aria-hidden="true">
            {num}
          </div>
          <div className="panel__inner">
            <header className="panel__header">
              <p className="panel__kicker">{kicker}</p>
              <h2 className="panel__title" id={`${id}-title`}>
                {title}
              </h2>
            </header>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PanelSwitch(props: PanelProps) {
  return reduceMotion() ? <PlainPanel {...props} /> : <Panel {...props} />;
}
