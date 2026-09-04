/* ──────────────────────────────────────────────────────────────────
   GSAP — single registration point.

   Every plugin below ships free with gsap 3.13+, so nothing here needs
   a Club licence. Importing this module (rather than registering in
   each component) guarantees registration happens exactly once, before
   any component tries to build a timeline.
   ────────────────────────────────────────────────────────────────── */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  CustomEase,
  Flip,
  Observer
);

/* ──────────────────────────────────────────────────────────────────
   Signature eases.

   Three curves used everywhere instead of stock power2/power3, so the
   motion reads as authored rather than defaulted. Registered by name —
   any tween can use ease: "blade".
   ────────────────────────────────────────────────────────────────── */

/** Hangs, then commits hard. For the cut itself. */
CustomEase.create("blade", "M0,0 C0.28,0 0.12,1 1,1");

/** Long ease-out with almost no ease-in. For things arriving from depth. */
CustomEase.create("depth", "M0,0 C0.12,0.66 0.2,1 1,1");

/** Overshoots barely, then settles. For text and small UI. */
CustomEase.create("settle", "M0,0 C0.16,1 0.3,1 1,1");

/* ──────────────────────────────────────────────────────────────────
   Motion preference

   The seam transitions bisect and rotate the whole viewport in 3D.
   That is genuinely unpleasant for anyone with a vestibular disorder,
   so `reduceMotion` is a hard switch that the page checks before it
   builds a single ScrollTrigger — not an afterthought that dials
   durations down.
   ────────────────────────────────────────────────────────────────── */
export const motionQuery = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)");

export const reduceMotion = () => motionQuery().matches;

/** Coarse pointers get the transitions, but at reduced travel — a full
 *  3D slash on a phone costs more in jank than it returns in delight. */
export const isTouch = () =>
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

export {
  gsap,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  DrawSVGPlugin,
  CustomEase,
  Flip,
  Observer,
};
