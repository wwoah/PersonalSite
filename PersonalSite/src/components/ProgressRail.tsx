import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  ScrollTrigger,
  ScrollSmoother,
  Observer,
  reduceMotion,
} from "../anim/gsap";
import "./ProgressRail.css";

/* ──────────────────────────────────────────────────────────────────
   The direction indicator.

   A long scroll with cinematic transitions between sections can leave
   you unsure how far in you are or what is coming. The rail answers
   both: a filled line for overall progress, a tick per section, and a
   label that scrambles to whatever you are currently reading.

   The ticks are buttons, so the whole structure doubles as keyboard
   navigation for a page that is otherwise several thousand pixels of
   uninterrupted scroll.
   ────────────────────────────────────────────────────────────────── */

export interface RailStop {
  id: string;
  num: string;
  label: string;
}

function ProgressRail({ stops }: { stops: RailStop[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const rail = root.current;
      if (!rail) return;

      /* Overall progress — one trigger over the whole document.
         Driving a custom property rather than a transform lets the
         vertical rail scale on Y and the mobile bar scale on X from
         this one tween. */
      gsap.fromTo(
        rail,
        { "--p": 0 },
        {
          "--p": 1,
          ease: "none",
          scrollTrigger: {
            // Not documentElement: under ScrollSmoother the wrapper is
            // fixed, so the root element is only ever one viewport tall
            // and would report full progress immediately. The content
            // element is the thing that actually has the page's height,
            // with or without the smoother.
            trigger: "#smooth-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        }
      );

      /* Which section owns the viewport right now.

         onEnter/onEnterBack rather than onToggle: onToggle also fires
         while ScrollTrigger settles during a refresh, and refreshes here
         are frequent (pins registering, the webfont landing, the smoother
         attaching). During one, several sections briefly satisfy their
         own bounds and the last to fire wins — which is why this used to
         load reading "07 / contact" at the top of the page. Directional
         callbacks only fire on real crossings, and the initial state is
         already correct at 0. */
      const triggers = stops.map((stop, i) =>
        ScrollTrigger.create({
          trigger: `#${stop.id}`,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        })
      );

      /* These triggers are built before the panels have registered their
         pins and before the smoother attaches, so the document they
         first measure against is far shorter than the final one — which
         is enough for the footer to look entered and latch the rail to
         "07 / contact" at the top of the page. A reconcile after each
         full refresh re-derives the active stop from the settled
         geometry; `refresh` fires once every trigger has been updated. */
      const reconcile = () => {
        const i = triggers.findIndex((t) => t.isActive);
        if (i >= 0) setActive(i);
      };
      ScrollTrigger.addEventListener("refresh", reconcile);
      reconcile();

      /* Scroll direction — the caret flips so the rail reads as a
         compass rather than a static bar. */
      const observer = Observer.create({
        type: "scroll",
        onUp: () => rail.setAttribute("data-dir", "up"),
        onDown: () => rail.setAttribute("data-dir", "down"),
        tolerance: 8,
      });

      return () => {
        ScrollTrigger.removeEventListener("refresh", reconcile);
        triggers.forEach((t) => t.kill());
        observer.kill();
      };
    },
    { scope: root, dependencies: [stops] }
  );

  /* The label retypes itself in the page's own terminal idiom. Kept in
     its own effect so a section change doesn't tear down and rebuild
     every ScrollTrigger above. */
  useGSAP(
    () => {
      const label = root.current?.querySelector<HTMLElement>(".rail__label");
      if (!label) return;

      const text = stops[active]?.label ?? "";
      if (reduceMotion()) {
        label.textContent = text;
        return;
      }

      gsap.to(label, {
        duration: 0.45,
        scrambleText: { text, chars: "01<>/_·", speed: 0.6, revealDelay: 0.1 },
      });
    },
    { scope: root, dependencies: [active, stops] }
  );

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(el, true, "top top");
    } else {
      el.scrollIntoView({
        behavior: reduceMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      ref={root}
      className="rail"
      data-dir="down"
      aria-label="Section navigation"
    >
      <span className="rail__caret" aria-hidden="true" />

      <div className="rail__track" aria-hidden="true">
        <span className="rail__fill" />
      </div>

      <ol className="rail__stops">
        {stops.map((stop, i) => (
          <li key={stop.id}>
            <button
              type="button"
              className="rail__tick"
              data-active={i === active || undefined}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(stop.id)}
            >
              <span className="rail__tick-num">{stop.num}</span>
              <span className="sr-only">{stop.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* Decorative echo of the active tick. Not a live region: it
          changes on every section boundary, and announcing that while
          someone scrolls is noise on top of the tick's aria-current. */}
      <span className="rail__label" aria-hidden="true" />
    </nav>
  );
}

export default ProgressRail;
