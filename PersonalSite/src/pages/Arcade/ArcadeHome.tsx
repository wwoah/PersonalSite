import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { games } from "../../games";
import "./Arcade.css";

gsap.registerPlugin(useGSAP);

function ArcadeHome() {
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(
    () => {
      // ── Title boot-up ──
      const titleTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      titleTl
        .from(".arcade-marquee-line", { opacity: 0, x: -20, duration: 0.4, stagger: 0.1 })
        .from(".arcade-title-char", {
          opacity: 0,
          y: 40,
          scale: 0.6,
          duration: 0.5,
          stagger: 0.04,
          ease: "back.out(2)",
        }, "-=0.2")
        .from(".arcade-subtitle", { opacity: 0, y: 10, duration: 0.5 }, "-=0.2");

      // ── Cabinets drop in ──
      gsap.from(".cabinet", {
        opacity: 0,
        y: 80,
        rotateX: -15,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.3)",
        delay: 1.0,
      });

      // ── Insert Coin blinks forever ──
      gsap.to(".insert-coin", {
        opacity: 0.3,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      });

      // ── Subtle CRT flicker ──
      gsap.to(".arcade-root", {
        filter: "brightness(1.02)",
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 4 + Math.random() * 3,
        ease: "steps(1)",
      });
    },
    { scope: container }
  );

  const handleCabinetClick = (gameId: string, isPlayable: boolean) => {
    if (!isPlayable) return;
    navigate(`/arcade/${gameId}`);
  };

  return (
    <div ref={container} className="arcade-root">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      <header className="arcade-header">
        <div className="arcade-marquee">
          <p className="arcade-marquee-line">▸ SYSTEM ONLINE</p>
          <p className="arcade-marquee-line">▸ {games.length} CABINETS DETECTED</p>
          <p className="arcade-marquee-line">▸ COIN SLOT: <span className="insert-coin">READY</span></p>
        </div>

        <h1 className="arcade-title">
          {"THE ARCADE".split(/(\s+)/).map((segment, segIdx) => {
            if (/\s/.test(segment)) {
              return <span key={segIdx}>{segment}</span>;
            }
            return (
              <span key={segIdx}>
                {segment.split("").map((c, i) => (
                  <span key={i} className="arcade-title-char">{c}</span>
                ))}
              </span>
            );
          })}
        </h1>

        <p className="arcade-subtitle">
          ── select a cabinet to play. press <kbd>esc</kbd> in any game to bail out. ──
        </p>

        <Link to="/" className="back-to-resume">
          ◂ back to the resume
        </Link>
      </header>

      <main className="cabinet-grid">
        {games.map((game) => {
          const isPlayable = game.component !== null;
          return (
            <article
              key={game.id}
              className={`cabinet ${isPlayable ? "is-playable" : "is-coming-soon"}`}
              style={{ ["--cabinet-accent" as string]: game.accent }}
              onClick={() => handleCabinetClick(game.id, isPlayable)}
              role={isPlayable ? "button" : undefined}
              tabIndex={isPlayable ? 0 : -1}
              onKeyDown={(e) => {
                if (isPlayable && (e.key === "Enter" || e.key === " ")) {
                  handleCabinetClick(game.id, isPlayable);
                }
              }}
            >
              <div className="cabinet-screen">
                <div className="cabinet-screen-grid" />
                <div className="cabinet-screen-glow" />
                <p className="cabinet-screen-title">{game.title}</p>
                {!isPlayable && (
                  <p className="cabinet-coming-soon">COMING SOON</p>
                )}
              </div>

              <div className="cabinet-panel">
                <div className="cabinet-panel-row">
                  <span className="cabinet-year">© {game.year}</span>
                  <span className="cabinet-difficulty" aria-label={`difficulty ${game.difficulty} of 3`}>
                    {[1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className={`pip ${n <= game.difficulty ? "pip-on" : ""}`}
                      />
                    ))}
                  </span>
                </div>

                <p className="cabinet-tagline">{game.tagline}</p>

                <ul className="cabinet-controls">
                  {game.controls.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>

                <div className="cabinet-cta">
                  {isPlayable ? "▸ INSERT COIN" : "▸ OUT OF ORDER"}
                </div>
              </div>
            </article>
          );
        })}
      </main>

      <footer className="arcade-footer">
        <p>HI-SCORE: 99,999,999</p>
        <p>v1.0.0 — built with too much caffeine</p>
      </footer>
    </div>
  );
}

export default ArcadeHome;