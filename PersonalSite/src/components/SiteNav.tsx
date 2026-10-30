import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, ScrollSmoother, reduceMotion } from "../anim/gsap";
import { scrollToSection } from "../anim/scroll";
import { HAS_GAMES_PAGE, PROFILE, SECTIONS } from "../content";
import TransitionLink from "./transition/TransitionLink";
import AccentPicker from "./AccentPicker";
import "./SiteNav.css";

/* ──────────────────────────────────────────────────────────────────
   Site navigation.

   A fixed bar with a link per section, a pill that slides to whichever
   section you are reading, and a hairline along its bottom edge for
   overall progress. It tucks away while you scroll down and comes back
   the moment you scroll up, so it never sits on top of what you are
   reading but is never more than a flick away.

   The section tracking is inherited from the old progress rail, along
   with the lessons it learned the hard way:
   - triggers are looked up with getElementById, never selector text,
     because useGSAP's context scopes selectors to this component;
   - directional callbacks only, plus a reconcile after each refresh,
     because onToggle fires spuriously while ScrollTrigger re-measures;
   - a click *claims* its section until the reader takes the wheel
     back, so a long jump doesn't sweep the pill across every section
     it flies over.
   ────────────────────────────────────────────────────────────────── */

const LINKS = SECTIONS.filter((s) => s.id !== "contact");

function SiteNav() {
  const root = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  /* Live mirror of `active` for the GSAP callbacks, which close over
     the first render. A layout effect, and declared before the pill's
     own, so the pill never reads the previous value. */
  const activeRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* While the colour picker is open the bar stays put — it would
     otherwise tuck away, panel and all, on the next scroll down. */
  const pickerOpen = useRef(false);
  const onPickerToggle = useCallback((open: boolean) => {
    pickerOpen.current = open;
  }, []);

  const claimed = useRef<string | null>(null);
  const settle = useRef<number | null>(null);
  const listeners = useRef<AbortController | null>(null);

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

  /* ── Pill ─────────────────────────────────────────────────────── */
  const placePill = useCallback((animate: boolean) => {
    const nav = root.current;
    const pill = nav?.querySelector<HTMLElement>(".nav__pill");
    if (!nav || !pill) return;
    const id = activeRef.current;
    const link = id ? nav.querySelector<HTMLElement>(`.nav__link[data-id="${id}"]`) : null;
    if (!link) {
      gsap.to(pill, { opacity: 0, duration: animate ? 0.3 : 0, overwrite: "auto" });
      return;
    }
    const vars = { x: link.offsetLeft, width: link.offsetWidth, opacity: 1 };
    if (!animate || reduceMotion()) gsap.set(pill, vars);
    else gsap.to(pill, { ...vars, duration: 0.6, ease: "settle", overwrite: "auto" });
  }, []);

  useGSAP(() => placePill(true), { dependencies: [active], scope: root });

  /* ── Tracking, progress, auto-hide ────────────────────────────── */
  useGSAP(
    () => {
      const nav = root.current;
      if (!nav) return;

      /* Progress is written straight from the trigger rather than
         scrubbed through a tween: a scrubbed fromTo rendered once while
         ScrollSmoother was still sizing the page — start and end both
         at zero — and parked the bar at --p: NaN, which an invalid
         scaleX() then drew at full width until the first scroll.
         ScrollSmoother already smooths the value this reads. */
      const content = document.getElementById("smooth-content");
      const progress =
        content &&
        ScrollTrigger.create({
          trigger: content,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (Number.isFinite(self.progress)) nav.style.setProperty("--p", self.progress.toFixed(4));
          },
        });

      const tracked = SECTIONS.flatMap((s) => {
        const el = document.getElementById(s.id);
        if (!el) return [];
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => claimed.current === null && setActive(s.id),
          onEnterBack: () => claimed.current === null && setActive(s.id),
          /* Scrolling back up out of the first section means the hero,
             which has no link of its own. */
          onLeaveBack: () => s === SECTIONS[0] && claimed.current === null && setActive(null),
        });
        return [{ id: s.id, st }];
      });

      const reconcile = () => {
        placePill(false);
        if (claimed.current !== null) return;
        setActive(tracked.find((t) => t.st.isActive)?.id ?? null);
      };
      ScrollTrigger.addEventListener("refresh", reconcile);
      reconcile();

      const cleanup = () => {
        ScrollTrigger.removeEventListener("refresh", reconcile);
        tracked.forEach((t) => t.st.kill());
        progress?.kill();
      };

      if (reduceMotion()) return cleanup;

      gsap.from(nav, { yPercent: -120, duration: 1.1, ease: "settle", delay: 0.5 });

      let hidden = false;
      const setHidden = (next: boolean) => {
        if (next && pickerOpen.current) return;
        if (next === hidden) return;
        hidden = next;
        gsap.to(nav, {
          yPercent: next ? -120 : 0,
          duration: next ? 0.45 : 0.6,
          ease: next ? "power2.in" : "settle",
          overwrite: "auto",
        });
      };
      const autoHide = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) =>
          setHidden(self.direction === 1 && self.scroll() > window.innerHeight * 0.5),
      });
      // A keyboard user tabbing into a tucked-away bar gets it back.
      const onFocus = () => setHidden(false);
      nav.addEventListener("focusin", onFocus);

      return () => {
        cleanup();
        autoHide.kill();
        nav.removeEventListener("focusin", onFocus);
      };
    },
    { scope: root }
  );

  const goTo = (id: string) => {
    release();
    claimed.current = id;
    setActive(id);
    scrollToSection(id);

    /* The claim ends when the reader takes the wheel back, not when the
       scroll stops — ScrollSmoother moves in bursts, and a "has it
       settled" check reads a mid-flight pause as a landing. The timeout
       is only a backstop for a reader who never scrolls again. */
    const ac = new AbortController();
    listeners.current = ac;
    const opts = { passive: true, once: true, signal: ac.signal };
    window.addEventListener("wheel", release, opts);
    window.addEventListener("touchstart", release, opts);
    window.addEventListener("keydown", release, opts);
    settle.current = window.setTimeout(release, 4000);
  };

  /* ── Mobile menu ──────────────────────────────────────────────── */
  useGSAP(
    () => {
      const el = menu.current;
      if (!el) return;
      const smoother = ScrollSmoother.get();
      smoother?.paused(open);

      const items = el.querySelectorAll(".menu__item, .menu__foot");
      if (reduceMotion()) {
        gsap.set(el, { autoAlpha: open ? 1 : 0 });
      } else if (open) {
        gsap
          .timeline()
          .set(el, { autoAlpha: 1 })
          .fromTo(
            el,
            { clipPath: "circle(0% at calc(100% - 3rem) 2rem)" },
            { clipPath: "circle(150% at calc(100% - 3rem) 2rem)", duration: 0.8, ease: "sweep" }
          )
          .fromTo(
            items,
            { yPercent: 60, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.6, ease: "settle", stagger: 0.05 },
            0.2
          );
      } else {
        gsap
          .timeline()
          .to(el, { clipPath: "circle(0% at calc(100% - 3rem) 2rem)", duration: 0.5, ease: "power2.in" })
          .set(el, { autoAlpha: 0 });
      }

      if (open) el.querySelector<HTMLElement>("a")?.focus();
    },
    { dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const menuGo = (id: string) => {
    setOpen(false);
    // Unpausing the smoother happens in the effect above; wait a frame
    // so the jump is measured against a running scroller.
    requestAnimationFrame(() => goTo(id));
  };

  return (
    <>
      <header ref={root} className="nav">
        <a
          className="nav__brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            release();
            setActive(null);
            scrollToSection("top");
          }}
        >
          <img className="nav__mark" src={PROFILE.avatar} alt="" width={36} height={36} />
          <span className="nav__name">{PROFILE.name}</span>
        </a>

        <nav className="nav__primary" aria-label="Sections">
          <span className="nav__pill" aria-hidden="true" />
          <ol className="nav__links">
            {LINKS.map((s) => (
              <li key={s.id}>
                <a
                  className="nav__link"
                  data-id={s.id}
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(s.id);
                  }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="nav__actions">
          <AccentPicker onOpenChange={onPickerToggle} />
          {HAS_GAMES_PAGE && (
            <TransitionLink to="/games" label="Games" className="nav__games">
              <span className="nav__games-icon" aria-hidden="true" />
              Games
            </TransitionLink>
          )}
          <a
            className="btn btn--small nav__cta"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              goTo("contact");
            }}
          >
            Let's talk
          </a>
          <button
            ref={menuButton}
            type="button"
            className="nav__menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span className="nav__burger" data-open={open || undefined} aria-hidden="true" />
          </button>
        </div>

        <span className="nav__progress" aria-hidden="true" />
      </header>

      <div
        id="site-menu"
        ref={menu}
        className="menu"
        data-theme="ink"
        inert={!open}
        aria-label="Site menu"
        role="dialog"
        aria-modal="true"
      >
        <ol className="menu__list">
          {SECTIONS.map((s) => (
            <li key={s.id} className="menu__item">
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  menuGo(s.id);
                }}
              >
                <span className="menu__num">{s.num}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="menu__foot">
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          {HAS_GAMES_PAGE && (
            <TransitionLink to="/games" label="Games" onClick={() => setOpen(false)}>
              See my games →
            </TransitionLink>
          )}
        </div>
      </div>
    </>
  );
}

export default SiteNav;
