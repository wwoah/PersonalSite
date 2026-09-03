// _shared/useHighScore.ts
import { useState, useCallback, useEffect } from "react";

const STORAGE_PREFIX = "arcade.highscore.";

function readHighScore(gameId: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + gameId);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    // localStorage can throw in private-browsing modes or if disabled.
    // Treating that as "no high score yet" is fine — the user just
    // won't get persistence, which is a graceful degradation.
    return 0;
  }
}

function writeHighScore(gameId: string, score: number): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + gameId, String(score));
  } catch {
    // Silent failure — see above.
  }
}

/**
 * Tracks the best score ever achieved for a game, persisted to
 * localStorage. Call `submit(score)` whenever a run ends (or whenever
 * the score changes, if you want it to update live during play).
 *
 * Returns:
 *   - highScore: the current best
 *   - submit(score): updates the best if `score` beats it; returns
 *     true if a new record was set (useful for "NEW HIGH!" UI)
 *   - reset(): clears the high score back to 0
 */
export function useHighScore(gameId: string) {
  const [highScore, setHighScore] = useState(() => readHighScore(gameId));

  // If the gameId changes (unlikely but possible if you ever reuse
  // this hook in a way I'm not anticipating), re-read.
  useEffect(() => {
    setHighScore(readHighScore(gameId));
  }, [gameId]);

  const submit = useCallback(
    (score: number): boolean => {
      if (score > highScore) {
        setHighScore(score);
        writeHighScore(gameId, score);
        return true;
      }
      return false;
    },
    [gameId, highScore]
  );

  const reset = useCallback(() => {
    setHighScore(0);
    writeHighScore(gameId, 0);
  }, [gameId]);

  return { highScore, submit, reset };
}