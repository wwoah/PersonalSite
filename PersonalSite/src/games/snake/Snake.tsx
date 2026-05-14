import { useEffect, useState, useRef } from "react";
import { useGameLoop } from "../_shared/useGameLoop";
import { useKeyboard } from "../_shared/useKeyboard";
import type { GameProps } from "../_shared/types";

function Snake({ onExit, onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const { isDown, onKey } = useKeyboard();

  // Acknowledge the props exist — these get replaced with real calls
  // as the game grows: onScore?.(score) when eating food, onExit()
  // from a "quit" button, etc.
  void onExit;
  void onScore;

  useEffect(() => {
    return onKey("p", () => setRunning((r) => !r));
  }, [onKey]);

  useGameLoop((dt) => {
    // game logic goes here — read isDown("ArrowUp") etc.
    void dt;
    void isDown;
  }, 10, running);

  return (
    <div style={{ color: "#cadf9e", fontFamily: "monospace" }}>
      <canvas ref={canvasRef} width={400} height={400} />
      <p>Snake stub — TODO: implement the game</p>
    </div>
  );
}

export default Snake;