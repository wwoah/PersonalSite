import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, Observer, reduceMotion } from "../anim/gsap";
import { scrollToSection } from "../anim/scroll";
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

  /* The stop a click has claimed, plus the handles holding that claim
     open. Refs rather than state: the section triggers read `claimed`
     from inside GSAP callbacks that close over the effect's first
     render, so it has to be a live value — and changing it must not
     re-render. */
  const claimed = useRef<number | null>(null);
  const settle = useRef<number | null>(null);
  const listeners = useRef<AbortController | null>(null);

  /* Drops the claim and everything holding it. An AbortController
     detaches the listeners in one call, so this never has to name them
     individually or keep its own identity stable to remove them. */
  const release = useCallback(() => {
    claimed.current = null;
    listeners.current?.abort();
    listeners.current = null;
    if (settle.current !== null) {
      clearTimeout(settle.current);
      settle.current = null;
    }
  }, []);

  useEffect(() => release, [release]);

  useGSAP(
    () => {
      const rail = root.current;
      if (!rail) return;

      /* Triggers are looked up as elements, never passed as selector
         text. `useGSAP` runs this inside a gsap.context scoped to the
         rail, and a context resolves selector strings *within its
         scope* — so "#smooth-content" and "#hero" were being searched
         for inside <nav class="rail">, where they will never be, and
         every one of these triggers silently fell back to the whole
         document. With the seams on, the refresh ScrollSmoother fires
         on attach re-resolved them and hid the bug; with the seams off
         that refresh never happens, so the rail's section tracking was
         simply dead. document.getElementById cannot be scoped. */
      const content = document.getElementById("smooth-content");

      /* Overall progress — one trigger over the whole document.
         Driving a custom property rather than a transform lets the
         vertical rail scale on Y and the mobile bar scale on X from
         this one tween. */
      if (content) {
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
              trigger: content,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4,
            },
          }
        );
      }

      /* Which section owns the viewport right now.

         onEnter/onEnterBack rather than onToggle: onToggle also fires
         while ScrollTrigger settles during a refresh, and refreshes here
         are frequent (pins registering, the webfont landing, the smoother
         attaching). During one, several sections briefly satisfy their
         own bounds and the last to fire wins — which is why this used to
         load reading "07 / contact" at the top of the page. Directional
         callbacks only fire on real crossings, and the initial state is
         already correct at 0. */
      const triggers = stops.flatMap((stop, i) => {
        const section = document.getElementById(stop.id);
        if (!section) return [];
        return ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          // A click already knows the answer; while one is in flight the
          // crossings it flies over must not overwrite it.
          onEnter: () => claimed.current === null && setActive(i),
          onEnterBack: () => claimed.current === null && setActive(i),
        });
      });

      /* These triggers are built before the panels have registered their
         pins and before the smoother attaches, so the document they
         first measure against is far shorter than the final one — which
         is enough for the footer to look entered and latch the rail to
         "07 / contact" at the top of the page. A reconcile after each
         full refresh re-derives the active stop from the settled
         geometry; `refresh` fires once every trigger has been updated. */
      const reconcile = () => {
        if (claimed.current !== null) return;
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

  /* Clicking a tick is an explicit statement of where the reader wants
     to be, so the rail says so immediately rather than inferring it
     afterwards from whatever the scroll happens to cross.

     Inferred, the digit swept through every section the jump passed
     over — one click on 04 from the top visibly ran 00 → 02 → 03 → 04
     — and it depended on the landing sitting inside that section's own
     `top 55%` band, which is geometry that varies with viewport height
     and section length. Claiming it up front makes the click land on
     the right digit by construction.

     Which scroller is in charge depends on the motion preference, and
     the toggle can change that mid-session, so that choice is made per
     click in one shared place rather than captured here. */
  const goTo = (id: string, i: number) => {
    release();
    claimed.current = i;
    setActive(i);
    scrollToSection(id);

    /* The claim ends when the reader takes the wheel back, not when the
       scroll stops. Watching for the scroll to settle looked obvious and
       was wrong: ScrollSmoother drives the native position in bursts, so
       it holds still for a few frames mid-flight, and a stability check
       read that as "landed" and handed the digit back to the crossings
       while the jump was still passing over other sections.

       Releasing on real input has no such race, and says the right
       thing: the rail shows where you asked to be until you go
       somewhere yourself. The timeout is only a backstop for a reader
       who never scrolls again. */
    const ac = new AbortController();
    listeners.current = ac;
    const opts = { passive: true, once: true, signal: ac.signal };
    window.addEventListener("wheel", release, opts);
    window.addEventListener("touchstart", release, opts);
    window.addEventListener("keydown", release, opts);
    settle.current = window.setTimeout(release, 4000);
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
              onClick={() => goTo(stop.id, i)}
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
