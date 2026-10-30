import { useSyncExternalStore } from "react";

/* ──────────────────────────────────────────────────────────────────
   ACCENT — the one colour a visitor can choose.

   A picked colour is used as-is wherever it is a *fill*: glows, the
   contact section, button hovers, badges. Thin lines and text need
   contrast a free choice can't promise — pastel aquamarine on warm
   paper is nearly invisible at 15px — so from each pick this derives
   shades of the same hue that are guaranteed to read:

     --signal        the colour exactly as picked
     --on-signal     ink or paper, whichever reads on top of it
     --accent-paper  same hue, darkened until it passes 4.6:1 on paper
     --accent-ink    same hue, lightened until it passes 4.6:1 on ink

   The themes in index.css map these onto --accent per ground, so no
   component has to know which one it is sitting on.

   Everything is written to inline custom properties on <html>, and the
   result is saved so that a small script in index.html can put it
   back before the first paint on the next visit.
   ────────────────────────────────────────────────────────────────── */

export type RGB = [number, number, number];
export interface HSV {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  /** 0–1 */
  v: number;
}

export const DEFAULT_ACCENT = "#7fffd4"; // aquamarine

export const PRESETS = [
  { name: "Aquamarine", hex: "#7fffd4" },
  { name: "Signal orange", hex: "#ff5a1f" },
  { name: "Sunflower", hex: "#ffc53d" },
  { name: "Rose", hex: "#ff6b9a" },
  { name: "Lavender", hex: "#a78bfa" },
  { name: "Cobalt", hex: "#4f6bff" },
  { name: "Lime", hex: "#b6f23a" },
];

const PAPER: RGB = [243, 239, 231];
const PAPER_2: RGB = [233, 227, 215];
const INK: RGB = [21, 23, 26];
const INK_BG: RGB = [18, 20, 23];
const INK_2: RGB = [27, 30, 34];

/* ── Colour maths ───────────────────────────────────────────────── */

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0")).join("");
}

export function isHex(value: string) {
  return /^#?[0-9a-f]{6}$/i.test(value.trim());
}

export function normalizeHex(value: string) {
  return "#" + value.trim().replace("#", "").toLowerCase();
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}

export function rgbToHsv([r, g, b]: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export const hsvToHex = (c: HSV) => rgbToHex(hsvToRgb(c));
export const hexToHsv = (hex: string) => rgbToHsv(hexToRgb(hex));

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h < 0 ? h + 360 : h, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function luminance([r, g, b]: RGB) {
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: RGB, b: RGB) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Walk the colour's lightness in `dir` until it reads against every ground. */
function fit(rgb: RGB, grounds: RGB[], min: number, dir: -1 | 1): RGB {
  const [h, s, l] = rgbToHsl(rgb);
  for (let L = l; L >= 0 && L <= 1; L += dir * 0.005) {
    const c = hslToRgb(h, s, L);
    if (grounds.every((g) => contrast(c, g) >= min)) return c;
  }
  return dir < 0 ? [0, 0, 0] : [255, 255, 255];
}

export function tokens(hex: string): Record<string, string> {
  const picked = hexToRgb(hex);
  /* Text on the fill is whichever of ink or paper reads better. A
     mid-tone (cobalt, a grey) can fall short with both, so then the
     fill itself is nudged away from its text — just far enough to
     pass, which leaves it looking like the colour that was picked. */
  const onSignal = contrast(picked, INK) >= contrast(picked, PAPER) ? INK : PAPER;
  const rgb = contrast(picked, onSignal) >= 4.5 ? picked : fit(picked, [onSignal], 4.5, onSignal === INK ? 1 : -1);
  return {
    "--signal": rgbToHex(rgb),
    "--on-signal": rgbToHex(onSignal),
    "--accent-paper": rgbToHex(fit(rgb, [PAPER, PAPER_2], 4.6, -1)),
    "--accent-ink": rgbToHex(fit(rgb, [INK_BG, INK_2], 4.6, 1)),
  };
}

/* ── Store ──────────────────────────────────────────────────────── */

const KEY = "site.accent";
const listeners = new Set<() => void>();

function readSaved(): string | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return saved && typeof saved.hex === "string" && isHex(saved.hex) ? normalizeHex(saved.hex) : null;
  } catch {
    return null;
  }
}

let current = typeof window === "undefined" ? DEFAULT_ACCENT : (readSaved() ?? DEFAULT_ACCENT);
let saveTimer = 0;

function apply(hex: string) {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(tokens(hex))) root.setProperty(k, v);
}

/* index.html already restored the saved tokens before first paint;
   deriving them again here means a change to the rules above reaches
   returning visitors too, instead of their stale saved copy winning. */
if (typeof document !== "undefined" && current !== DEFAULT_ACCENT) apply(current);

/** Recolour the site. Saving is debounced, so dragging across the wheel
    writes once when the hand comes to rest rather than every frame. */
export function setAccent(hex: string) {
  if (!isHex(hex)) return;
  current = normalizeHex(hex);
  apply(current);
  listeners.forEach((fn) => fn());

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      if (current === DEFAULT_ACCENT) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ hex: current, vars: tokens(current) }));
    } catch {
      // Private mode or storage disabled: the choice lasts this visit.
    }
  }, 300);
}

export const getAccent = () => current;

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** The current accent as a hex string, re-rendering when it changes. */
export function useAccent() {
  return useSyncExternalStore(subscribe, getAccent, () => DEFAULT_ACCENT);
}
