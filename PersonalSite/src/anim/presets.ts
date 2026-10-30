import type { Preset } from "ascii-reveal";

/* ──────────────────────────────────────────────────────────────────
   ascii-reveal presets.

   STUDIO is the built-in `decode` ramp with one change: images resolve
   in their own colours (`color: "source"`) rather than in the text
   colour. The page leans on pictures — screenshots, illustrations, the
   portrait — and a monochrome decode would flatten every one of them
   into the same grey texture.
   ────────────────────────────────────────────────────────────────── */
export const STUDIO: Preset = {
  ramp: " .:-=+*#%@",
  scramble: "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=?/",
  mode: "ramp",
  color: "source",
  cells: [22, 15, 10, 7, 5],
  tick: 60,
};
