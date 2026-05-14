import { useEffect, useRef, useCallback } from "react";

/**
 * Tracks currently-held keys and lets you register one-shot handlers.
 *
 * Returns:
 *   - isDown(key): whether `key` is currently held
 *   - onKey(key, handler): subscribe to keydown for a specific key
 *
 * Both work with the standard event.key value ("ArrowLeft", " ", "a", etc).
 */
export function useKeyboard() {
  // Set of currently-held keys
  const heldKeys = useRef(new Set<string>());

  // Map of key → array of handlers
  const handlers = useRef(new Map<string, Array<() => void>>());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      heldKeys.current.add(e.key);
      // Fire one-shot handlers
      const fns = handlers.current.get(e.key);
      if (fns) fns.forEach((fn) => fn());
    };
    const onUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.key);
    };
    const onBlur = () => heldKeys.current.clear();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const isDown = useCallback((key: string) => heldKeys.current.has(key), []);

  const onKey = useCallback((key: string, handler: () => void) => {
    const list = handlers.current.get(key) ?? [];
    list.push(handler);
    handlers.current.set(key, list);
    // Return an unsubscribe function
    return () => {
      const current = handlers.current.get(key);
      if (!current) return;
      handlers.current.set(
        key,
        current.filter((fn) => fn !== handler)
      );
    };
  }, []);

  return { isDown, onKey };
}