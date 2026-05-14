import { Suspense, useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { getGameById } from "../../games";
import "./Arcade.css";

function GamePlayer() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);

  const game = gameId ? getGameById(gameId) : undefined;

  // Esc always returns to the arcade — universal escape hatch.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/arcade");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Unknown gameId or unplayable game → bounce back to the lobby.
  if (!game) return <Navigate to="/arcade" replace />;
  if (!game.component) return <Navigate to="/arcade" replace />;

  const GameComponent = game.component;

  return (
    <div className="game-player-root" style={{ ["--cabinet-accent" as string]: game.accent }}>
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      <header className="game-player-chrome">
        <button className="chrome-back" onClick={() => navigate("/arcade")}>
          ◂ EXIT
        </button>
        <div className="chrome-title">{game.title}</div>
        <div className="chrome-score">SCORE: {score.toString().padStart(6, "0")}</div>
      </header>

      <main className="game-player-stage">
        <Suspense fallback={<p className="game-loading">LOADING CARTRIDGE…</p>}>
          <GameComponent
            onExit={() => navigate("/arcade")}
            onScore={setScore}
          />
        </Suspense>
      </main>
    </div>
  );
}

export default GamePlayer;