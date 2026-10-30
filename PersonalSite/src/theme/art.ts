import interfaces from "../assets/art/interfaces.svg?raw";
import apis from "../assets/art/apis.svg?raw";
import data from "../assets/art/data.svg?raw";
import delivery from "../assets/art/delivery.svg?raw";
import stickers from "../assets/art/stickers.svg?raw";
import realtime from "../assets/art/realtime.svg?raw";
import motion from "../assets/art/motion.svg?raw";
import printing from "../assets/art/printing.svg?raw";
import peelriot from "../assets/art/peelriot-cover.svg?raw";
import portrait from "../assets/art/placeholder.svg?raw";
import cloud from "../assets/art/cloud.svg?raw";
import hardware from "../assets/art/hardware.svg?raw";
import automation from "../assets/art/automation.svg?raw";
import helpdesk from "../assets/art/helpdesk.svg?raw";
import aiTall from "../assets/art/ai-tall.svg?raw";
import aiBanner from "../assets/art/ai-banner.svg?raw";
import games from "../assets/art/games.svg?raw";
import gameRoblox from "../assets/art/game-roblox.svg?raw";
import gameUnity from "../assets/art/game-unity.svg?raw";

/* ──────────────────────────────────────────────────────────────────
   The site's own illustrations, recoloured to the visitor's accent.

   Each one is drawn in the original orange (#ff5a1f, with #ffb08a as
   its soft tint), and shipped as text rather than as a file, so those
   two colours can be swapped for the current accent before it ever
   reaches an <img>. The result is a data URL: still a real image, so
   ascii-reveal decodes it out of glyphs in the right colour, and no
   request is made when the accent changes.

   In content.ts these are referred to as "art:<name>". Any other
   image path is used untouched — photos and screenshots keep their
   own colours.
   ────────────────────────────────────────────────────────────────── */
const ART: Record<string, string> = {
  interfaces,
  apis,
  data,
  delivery,
  stickers,
  realtime,
  motion,
  printing,
  peelriot,
  portrait,
  cloud,
  hardware,
  automation,
  helpdesk,
  "ai-tall": aiTall,
  "ai-banner": aiBanner,
  games,
  "game-roblox": gameRoblox,
  "game-unity": gameUnity,
};

const cache = new Map<string, string>();

function soften(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.45);
  return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => mix(c).toString(16).padStart(2, "0")).join("");
}

export function resolveArt(src: string, accent: string): string {
  if (!src.startsWith("art:")) return src;
  const raw = ART[src.slice(4)];
  if (!raw) return "";

  const key = src + accent;
  const hit = cache.get(key);
  if (hit) return hit;

  const svg = raw.replace(/#ff5a1f/gi, accent).replace(/#ffb08a/gi, soften(accent));
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  // Dragging across the wheel visits a lot of colours; keep the last few.
  if (cache.size > 80) cache.clear();
  cache.set(key, url);
  return url;
}
