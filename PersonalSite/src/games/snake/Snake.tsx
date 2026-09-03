import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "../_shared/useGameLoop";
import { useKeyboard } from "../_shared/useKeyboard";
import type { GameProps } from "../_shared/types";

const GRID_SIZE = 20;
const CELL = 20; // 20 * 20 = 400px canvas
const ACCENT = "#cadf9e";
const FOOD_COLOR = "#e07a5f";
const BG = "#0a0a0a";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const DIR_VECTORS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function randomFood(snake: Point[]): Point {
  // Pick a cell that isn't on the snake. For a 20x20 grid this almost
  // never collides, so a rejection loop is fine.
  while (true) {
    const p = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

function initialSnake(): Point[] {
  // Start with a 3-segment snake in the middle, heading right.
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

function Snake({ onExit, onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onKey } = useKeyboard();

  // All mutable game state lives in refs so the game loop reads/writes
  // without triggering React re-renders every tick.
  const snakeRef = useRef<Point[]>(initialSnake());
  const dirRef = useRef<Dir>("right");
  const queuedDirRef = useRef<Dir | null>(null);
  const foodRef = useRef<Point>(randomFood(snakeRef.current));

  // These do drive React (HUD, overlays), so they're state.
  type Status = "idle" | "playing" | "paused" | "gameOver";
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const start = useCallback(() => {
    snakeRef.current = initialSnake();
    dirRef.current = "right";
    queuedDirRef.current = null;
    foodRef.current = randomFood(snakeRef.current);
    setScore(0);
    setStatus("playing");
    onScore?.(0);
  }, [onScore]);

  // Direction input: we queue the next direction and apply it at the
  // tick boundary. This prevents the "press up then left in one frame
  // and reverse into yourself" bug.
  useEffect(() => {
  const tryQueue = (e: KeyboardEvent, next: Dir) => {
  e.preventDefault();
  if (status !== "playing") return;
  const current = dirRef.current;
  if (next === OPPOSITE[current]) return;
  queuedDirRef.current = next;
};

const togglePause = (e: KeyboardEvent) => {
  e.preventDefault();
  setStatus((s) => {
    if (s === "playing") return "paused";
    if (s === "paused") return "playing";
    return s;
  });
};

const unsubs = [
  onKey("Enter", (e) => {
      e.preventDefault();
      if (status === "idle" || status === "gameOver") start();
    }),
  onKey("ArrowUp", (e) => tryQueue(e, "up")),
  onKey("ArrowDown", (e) => tryQueue(e, "down")),
  onKey("ArrowLeft", (e) => tryQueue(e, "left")),
  onKey("ArrowRight", (e) => tryQueue(e, "right")),
  onKey("p", togglePause),
  onKey("P", togglePause),
  onKey("Escape", () => onExit()),
];

  return () => unsubs.forEach((u) => u());
}, [onKey, onExit, status]);

  useGameLoop(
    (dt) => {
      void dt;

      // 1. Commit the queued direction (if any) at the tick boundary.
      if (queuedDirRef.current) {
        dirRef.current = queuedDirRef.current;
        queuedDirRef.current = null;
      }

      // 2. Compute the new head position.
      const snake = snakeRef.current;
      const head = snake[0];
      const vec = DIR_VECTORS[dirRef.current];
      const newHead: Point = { x: head.x + vec.x, y: head.y + vec.y };

      // 3. Wrap around the edges. `+ GRID_SIZE` before the modulo handles
      // the case where newHead.x is -1 (going off the left/top edge),
      // since JS modulo of a negative number stays negative.
      newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
      newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;

      // 4. Check self collision. The tail will move out of the way this
      // tick, so don't count the last segment (unless we're about to
      // eat, in which case the tail stays put — handled below).
      const willEat =
        newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const bodyToCheck = willEat ? snake : snake.slice(0, -1);
      if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        setStatus("gameOver");
        return;
      }

      // 5. Apply the move. Grow if eating, otherwise drop the tail.
      const newSnake = [newHead, ...snake];
      if (willEat) {
        foodRef.current = randomFood(newSnake);
        setScore((s) => {
          const next = s + 1;
          onScore?.(next);
          return next;
        });
      } else {
        newSnake.pop();
      }
      snakeRef.current = newSnake;

      // 6. Render.
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines — subtle, just enough to read the board.
      ctx.strokeStyle = "rgba(202, 223, 158, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < GRID_SIZE; i++) {
        // Vertical lines
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, canvas.height);
        // Horizontal lines
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(canvas.width, i * CELL);
      }
      ctx.stroke();

      // Food
      ctx.fillStyle = FOOD_COLOR;
      ctx.fillRect(
        foodRef.current.x * CELL + 2,
        foodRef.current.y * CELL + 2,
        CELL - 4,
        CELL - 4
      );

      // Snake — head slightly brighter than body for visibility.
      newSnake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#e8ffb8" : ACCENT;
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
    },
    10,
    status === "playing"
  );

  // On mount, paint the initial frame so the canvas isn't blank before
  // the first tick. (At 10fps the first tick is 100ms away, which is
  // noticeable.)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(
      foodRef.current.x * CELL + 2,
      foodRef.current.y * CELL + 2,
      CELL - 4,
      CELL - 4
    );
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#e8ffb8" : ACCENT;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);


  function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        color: ACCENT,
      }}
    >
      {children}
    </div>
  );
}

function PauseIcon() {
  // Two vertical bars — the universal pause glyph. Drawn as SVG so it
  // scales cleanly and inherits the accent color.
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill={ACCENT}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "transparent",
  border: `2px solid ${ACCENT}`,
  color: ACCENT,
  fontFamily: "monospace",
  fontSize: 18,
  padding: "8px 24px",
  cursor: "pointer",
};

  return (
  <div
    style={{
      color: ACCENT,
      fontFamily: "monospace",
      display: "inline-block",
      position: "relative",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span>SCORE: {score.toString().padStart(3, "0")}</span>
    </div>
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL}
        height={GRID_SIZE * CELL}
        style={{ border: `1px solid ${ACCENT}`, display: "block" }}
      />

      {status === "idle" && (
        <Overlay>
          <button onClick={start} style={buttonStyle}>▶ PLAY</button>
        </Overlay>
      )}

      {status === "paused" && (
        <Overlay>
          <PauseIcon />
          <div style={{ fontSize: 12, marginTop: 12, opacity: 0.7 }}>
            Press P to resume
          </div>
        </Overlay>
      )}

      {status === "gameOver" && (
        <Overlay>
          <div style={{ fontSize: 24, marginBottom: 8 }}>GAME OVER</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>Score: {score}</div>
          <button onClick={start} style={buttonStyle}>▶ PLAY AGAIN</button>
        </Overlay>
      )}
    </div>
    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
      Arrow keys to move · P to pause · Esc to exit
    </div>
  </div>
);
}

export default Snake;