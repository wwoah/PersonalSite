import type { ComponentType, LazyExoticComponent } from "react";

/**
 * Props every game component receives.
 * The GamePlayer wrapper provides these — games just consume them.
 */
export interface GameProps {
  /** Call this to return the user to the arcade lobby. */
  onExit: () => void;
  /** Optional — report score updates to the wrapper (for the HUD, high scores, etc). */
  onScore?: (score: number) => void;
}

/**
 * The metadata + component bundle that defines a game.
 * Every game folder exports one of these as its default export.
 */
export interface Game {
  /** URL slug, also used as a key. Lowercase, hyphenated. */
  id: string;

  /** Display name on the cabinet. */
  title: string;

  /** One-line description shown on the cabinet. */
  tagline: string;

  /** Flavor text — fake release year, genre, etc. */
  year: string;

  /** 1 = casual, 2 = focused, 3 = punishing. Rendered as filled pips. */
  difficulty: 1 | 2 | 3;

  /** Control hints shown on the cabinet (e.g. ["←/→ move", "space to fire"]). */
  controls: string[];

  /** Hex color used for this cabinet's neon glow / accent. */
  accent: string;

  /**
   * The actual playable React component, lazy-loaded.
   * If null, the cabinet renders as "Coming Soon" and is non-interactive.
   */
  component: LazyExoticComponent<ComponentType<GameProps>> | null;
}