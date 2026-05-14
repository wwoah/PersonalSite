import { lazy } from "react";
import type { Game } from "../_shared/types";
const SnakeGame = lazy(() => import("./Snake"));
const Snake: Game = {
id: "snake",
title: "SNAKE.EXE",
tagline: "Grow the tail. Don't bite it.",
year: "1978",
difficulty: 1,
controls: ["← ↑ ↓ → to steer", "P to pause"],
accent: "#cadf9e",
component: SnakeGame,  // ← only change needed
};
export default Snake;
