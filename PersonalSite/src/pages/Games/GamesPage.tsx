import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, reduceMotion } from "../../anim/gsap";
import { scrollToSection } from "../../anim/scroll";
import SmoothScroll from "../../components/SmoothScroll";
import Decode from "../../components/Decode";
import Art from "../../components/Art";
import PageBar from "../../components/PageBar";
import PageOutro from "../../components/PageOutro";
import TransitionLink from "../../components/transition/TransitionLink";
import WorkInProgress from "../../components/WorkInProgress";
import { rich } from "../../components/rich";
import { GAMES_IN_PROGRESS, GAMES_PAGE, PROFILE, SHOWN_GAMES } from "../../content";
import type { GameProject } from "../../content";
import contours from "../../assets/contours-hero.svg?raw";
import "./Games.css";

/* ──────────────────────────────────────────────────────────────────
   GAMES

   The games Phillip makes in Unity and Roblox Studio, one row each:
   a screen on one side, what it is and what went into it on the
   other. A row's screen can swap between its screenshots, play a
   trailer, or run a Unity WebGL build right on the page, and none of
   those load anything until they're asked for.

   Same motion vocabulary as the front page, on a dark ground so the
   screenshots carry the colour: the contour map draws in, the copy
   decodes, and each row decodes as it scrolls into view.

   While GAMES_IN_PROGRESS is on (content/games.ts), the work-in-progress
   panel stands where the games will be, and the hero leaves out its
   list of them.
   ────────────────────────────────────────────────────────────────── */

const SUBJECT = "Your games";
const num = (i: number) => String(i + 1).padStart(2, "0");

/** Scroll to a game and put it in the address bar, so the link can be shared. */
const goToGame = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  scrollToSection(id);
  // Router state is kept as-is: replacing it would lose its place in history.
  window.history.replaceState(window.history.state, "", `#${id}`);
};

function EngineMark({ engine }: { engine: GameProject["engine"] }) {
  return (
    <svg className="engine-mark" viewBox="0 0 16 16" aria-hidden="true">
      {engine === "Unity" ? (
        <path d="M8 1.6l5.5 3.2v6.4L8 14.4l-5.5-3.2V4.8zM8 8l5.5-3.2M8 8v6.4M8 8L2.5 4.8" />
      ) : (
        <path d="M2 8.5h5.5V14H2zM8.5 2H14v5.5H8.5zM8.5 8.5H14V14H8.5z" />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────────────────────────── */
function Hero({ games }: { games: GameProject[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const hero = root.current;
      if (!hero || reduceMotion()) return;
      const q = gsap.utils.selector(hero);

      gsap.from(q(".games-hero__art path"), {
        drawSVG: "50% 50%",
        duration: 2.8,
        ease: "depth",
        stagger: { each: 0.018, from: "random" },
        delay: 0.1,
      });
      gsap.from(q(".games-hero__glow"), { opacity: 0, scale: 0.6, duration: 2.4, ease: "depth" });

      const glow = q(".games-hero__glow")[0];
      const gx = gsap.quickTo(glow, "x", { duration: 1.8, ease: "power3" });
      const gy = gsap.quickTo(glow, "y", { duration: 1.8, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = hero.getBoundingClientRect();
        gx(((e.clientX - r.left) / r.width - 0.5) * r.width * 0.55);
        gy(((e.clientY - r.top) / r.height - 0.5) * r.height * 0.55);
      };
      hero.addEventListener("pointermove", onMove);

      gsap.to(q(".games-hero__inner"), {
        yPercent: -8,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      return () => hero.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <header ref={root} className="games-hero">
      <div className="games-hero__bg" aria-hidden="true">
        <div className="games-hero__glow" />
        <div className="games-hero__map" data-speed="0.75">
          <div className="games-hero__art" dangerouslySetInnerHTML={{ __html: contours }} />
        </div>
      </div>

      <Decode immediate speed={1} className="games-hero__inner">
        <div className="games-hero__copy">
          <p className="eyebrow games-hero__crumbs">
            <TransitionLink to="/" label="Portfolio">
              Portfolio
            </TransitionLink>
            <span aria-hidden="true">/</span>
            <span>Games</span>
          </p>
          <h1 className="games-hero__title">{rich(GAMES_PAGE.title)}</h1>
          <p className="games-hero__intro">{GAMES_PAGE.intro}</p>
          <ul className="games-hero__engines" aria-label="Engines">
            <li className="chip" data-ascii="fade">
              <EngineMark engine="Unity" /> Unity · C#
            </li>
            <li className="chip" data-ascii="fade">
              <EngineMark engine="Roblox Studio" /> Roblox Studio · Luau
            </li>
          </ul>
        </div>

        {games.length > 0 && (
          <nav className="games-index" data-ascii="surface" aria-label="Games on this page">
            <p className="eyebrow">Select a game</p>
            <ol>
              {games.map((g, i) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} onClick={goToGame(g.id)}>
                    <span className="games-index__num">{num(i)}</span>
                    <span className="games-index__title">{g.title}</span>
                    <span className="games-index__meta">
                      <EngineMark engine={g.engine} />
                      {g.engine}
                      {g.year && ` · ${g.year}`}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </Decode>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SCREEN — the cover, its screenshots, and the trailer or build.

   Nothing is fetched from YouTube or the build folder until a button
   is pressed: a WebGL build can be tens of megabytes, and a page of
   idle YouTube players is slow and sets cookies.
   ────────────────────────────────────────────────────────────────── */
type Playing = "video" | "build" | null;

function Screen({ game }: { game: GameProject }) {
  const [shot, setShot] = useState(0);
  const [picked, setPicked] = useState(false);
  const [playing, setPlaying] = useState<Playing>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const image = game.images[shot] ?? game.images[0];

  /* Into the frame, so the game hears the keyboard straight away. */
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  const pick = (i: number) => {
    setShot(i);
    setPicked(true);
  };

  return (
    <div className="screen">
      <div className="screen__frame" data-ascii="surface">
        {playing ? (
          <iframe
            ref={frame}
            className="screen__embed"
            src={
              playing === "video"
                ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(game.youtube ?? "")}?autoplay=1&rel=0&playsinline=1`
                : game.webgl
            }
            title={playing === "video" ? `${game.title}: video` : `${game.title}: playable build`}
            allow={playing === "video" ? "autoplay; encrypted-media; picture-in-picture; fullscreen" : "autoplay; fullscreen; gamepad"}
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            {/* Keyed by picture, so each one mounts fresh and plays the
                swap-in — but only once someone has picked one: on first
                load the decode is what brings the cover in. */}
            <Art
              key={image.src}
              className={picked ? "screen__img screen__img--swap" : "screen__img"}
              src={image.src}
              alt={image.alt}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
            />
            {(game.webgl || game.youtube) && (
              <div className="screen__actions">
                {game.webgl && (
                  <button type="button" className="btn btn--small screen__play" onClick={() => setPlaying("build")}>
                    <span className="screen__play-icon" aria-hidden="true" />
                    Play in browser
                    <span className="sr-only">: {game.title}</span>
                  </button>
                )}
                {game.youtube && (
                  <button
                    type="button"
                    className={game.webgl ? "btn btn--small btn--ghost screen__watch" : "btn btn--small screen__play"}
                    onClick={() => setPlaying("video")}
                  >
                    {!game.webgl && <span className="screen__play-icon" aria-hidden="true" />}
                    Watch the video
                    <span className="sr-only">: {game.title}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {playing ? (
        <div className="screen__bar">
          <p className="screen__now">
            <span className="screen__live" aria-hidden="true" />
            {playing === "video" ? "Now playing" : "Running in your browser"}
          </p>
          <button type="button" className="screen__btn" onClick={() => void frame.current?.requestFullscreen?.().catch(() => {})}>
            Fullscreen
          </button>
          <button type="button" className="screen__btn" onClick={() => setPlaying(null)}>
            Close
          </button>
        </div>
      ) : (
        game.images.length > 1 && (
          <ul className="screen__thumbs" aria-label={`${game.title} screenshots`}>
            {game.images.map((im, i) => (
              <li key={im.src}>
                <button type="button" className="screen__thumb" aria-pressed={i === shot} onClick={() => pick(i)}>
                  <Art src={im.src} alt="" width={320} height={180} loading="lazy" decoding="async" />
                  <span className="sr-only">
                    Screenshot {i + 1}: {im.alt}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   A GAME
   ────────────────────────────────────────────────────────────────── */
function Game({ game, index }: { game: GameProject; index: number }) {
  return (
    <Decode as="article" className="game" aria-labelledby={`${game.id}-title`}>
      {/* The jump target sits above the row, so the bar doesn't land on its screen. */}
      <span id={game.id} className="game__anchor" />
      <Screen game={game} />

      <div className="game__body">
        <p className="game__meta">
          <span className="game__num">{num(index)}</span>
          <span className="game__engine">
            <EngineMark engine={game.engine} />
            {game.engine}
          </span>
          {game.status && (
            <span className="game__status" data-ascii="fade">
              {game.status}
            </span>
          )}
        </p>

        <h2 className="game__title" id={`${game.id}-title`}>
          {game.title}
        </h2>
        <p className="game__desc">{game.desc}</p>

        {(game.role || game.year) && (
          <dl className="game__facts">
            {game.role && (
              <div>
                <dt>Role</dt>
                <dd>{game.role}</dd>
              </div>
            )}
            {game.year && (
              <div>
                <dt>Year</dt>
                <dd>{game.year}</dd>
              </div>
            )}
          </dl>
        )}

        {game.highlights.length > 0 && (
          <>
            <h3 className="game__subhead eyebrow">What I built</h3>
            <ul className="game__highlights">
              {game.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </>
        )}

        <ul className="game__tags" aria-label="Made with">
          {game.tags.map((t) => (
            <li key={t} className="chip" data-ascii="fade">
              {t}
            </li>
          ))}
        </ul>

        {game.links && game.links.length > 0 && (
          <div className="game__links">
            {game.links.map((l, i) => (
              <a
                key={l.href + l.label}
                className={i === 0 ? "btn btn--small" : "btn btn--small btn--ghost"}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                data-ascii="fade"
              >
                {l.label} <span className="btn__arrow">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Decode>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */
function GamesPage() {
  const root = useRef<HTMLDivElement>(null);
  const games = GAMES_IN_PROGRESS ? [] : SHOWN_GAMES;

  useEffect(() => {
    const previous = document.title;
    document.title = `Games · ${PROFILE.name}`;
    return () => {
      document.title = previous;
    };
  }, []);

  useGSAP(
    () => {
      /* Fonts change every measurement on the page; once they're in,
         re-measure, then honour a /games#<id> link. */
      document.fonts?.ready.then(() => {
        ScrollTrigger.refresh();
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (id && document.getElementById(id)) scrollToSection(id, false);
      });

      if (reduceMotion()) return;
      gsap.from(".page-bar", { yPercent: -120, duration: 1.1, ease: "settle", delay: 0.5 });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="games-page">
      <PageBar back={{ to: "/", label: "Portfolio" }} subject={SUBJECT} />

      <SmoothScroll>
        <main className="games" data-theme="ink">
          <Hero games={games} />

          {GAMES_IN_PROGRESS ? (
            <section className="games-wip" aria-label="Games">
              <WorkInProgress title={GAMES_PAGE.wip.title} note={GAMES_PAGE.wip.note} subject={SUBJECT} />
            </section>
          ) : games.length > 0 ? (
            <section className="games__list" aria-label="Games">
              {games.map((g, i) => (
                <Game key={g.id} game={g} index={i} />
              ))}
            </section>
          ) : (
            <Decode as="section" className="games-empty" data-ascii="surface">
              <Art src="art:games" alt="" width={800} height={600} />
              <p className="games-empty__text">{GAMES_PAGE.empty}</p>
              <TransitionLink to="/" label="Portfolio" className="btn" data-ascii="fade">
                Back to the portfolio
              </TransitionLink>
            </Decode>
          )}

          <PageOutro title={GAMES_PAGE.outroTitle} intro={GAMES_PAGE.outroIntro} subject={SUBJECT} />
        </main>
      </SmoothScroll>
    </div>
  );
}

export default GamesPage;
