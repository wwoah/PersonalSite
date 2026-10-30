/* ──────────────────────────────────────────────────────────────────
   GSAP — single registration point.

   Every plugin below ships free with gsap 3.13+, so nothing here needs
   a Club licence. Importing this module (rather than registering in
   each component) guarantees registration happens exactly once, before
   any component tries to build a timeline.
   ────────────────────────────────────────────────────────────────── */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  CustomEase,
  DrawSVGPlugin,
  Observer
);

/* ──────────────────────────────────────────────────────────────────
   Signature eases.

   Used everywhere instead of stock power2/power3, so the motion reads
   as authored rather than defaulted. Registered by name — any tween
   can use ease: "settle".
   ────────────────────────────────────────────────────────────────── */

/** Long ease-out with almost no ease-in. For things arriving from depth. */
CustomEase.create("depth", "M0,0 C0.12,0.66 0.2,1 1,1");

/** Overshoots barely, then settles. For text and small UI. */
CustomEase.create("settle", "M0,0 C0.16,1 0.3,1 1,1");

/** Symmetric and firm. For things that open and close, like a curtain. */
CustomEase.create("sweep", "M0,0 C0.65,0 0.35,1 1,1");

export { reduceMotion } from "./motion";

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, CustomEase, Observer };
