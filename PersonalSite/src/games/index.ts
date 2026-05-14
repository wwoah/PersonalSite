import type { Game } from "./_shared/types";
import Snake from "./snake";
import Pong from "./pong";
import Breakout from "./breakout";

/**
 * The registry. Adding a new game = adding one line here.
 * The arcade home maps over this array, and the GamePlayer
 * route resolves :gameId against it.
 */
export const games: Game[] = [Snake, Pong, Breakout];

/** Convenience lookup used by GamePlayer. */
export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}