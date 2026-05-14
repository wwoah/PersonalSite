import { useEffect, useRef } from "react";

/**
 * A fixed-timestep game loop hook. Calls `callback(deltaSeconds)` at
 * roughly the target fps. Internally uses requestAnimationFrame so it
 * pauses when the tab is hidden — free behavior we want.
 *
 * Usage:
 *   useGameLoop((dt) => { update(dt); render(); }, 60, isRunning);
 *
 * @param callback   Called every tick with seconds since last tick.
 * @param fps        Target frames per second (default 60).
 * @param running    If false, the loop is paused. Defaults to true.
 */
export function useGameLoop(
  callback: (deltaSeconds: number) => void,
  fps: number = 60,
  running: boolean = true
) {
  // Stash the callback in a ref so the effect doesn't restart on every
  // re-render — the loop reads the latest callback through the ref.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!running) return;

    let rafId = 0;
    let lastTime = performance.now();
    const interval = 1000 / fps;
    let accumulator = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const delta = now - lastTime;
      lastTime = now;
      accumulator += delta;

      // Fixed-timestep: drain the accumulator in chunks. This means
      // simulation stays stable even if the browser hitches.
      while (accumulator >= interval) {
        callbackRef.current(interval / 1000);
        accumulator -= interval;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [fps, running]);
}