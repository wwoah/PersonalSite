/* ──────────────────────────────────────────────────────────────────
   INTERESTS — the cards in "Beyond the day job".
   ────────────────────────────────────────────────────────────────── */
import { HAS_GAMES_PAGE } from "./games";

export interface Interest {
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
  /** A button to more of it. `page` is what the transition curtain
      calls the destination. */
  cta?: { label: string; to: string; page: string };
}

/* Inferred from the projects on this page. Swap in whatever you
   actually do with your time; photos make this section sing. */
export const INTERESTS: Interest[] = [
  {
    title: "Making games",
    desc: "I build games in Unity and Roblox Studio: C# in one, Luau in the other.",
    image: "art:games",
    imageAlt: "",
    /* Only while the games page is linked at all (see games.ts). */
    ...(HAS_GAMES_PAGE && { cta: { label: "See my games", to: "/games", page: "Games" } }),
  },
  {
    title: "Stickers & print",
    desc: "Custom stickers and print design, the interest behind Peel Riot.",
    image: "art:stickers",
    imageAlt: "",
  },
  {
    title: "Real-time apps",
    desc: "Live canvases, chat rooms and games people play together, where the fun is in staying in sync.",
    image: "art:realtime",
    imageAlt: "",
  },
  {
    title: "Motion design",
    desc: "Scroll-driven animation and easing curves with GSAP. This site is my sandbox.",
    image: "art:motion",
    imageAlt: "",
  },
  {
    title: "3D modelling & printing",
    desc: "Modelling things in 3D, then printing them on my Creality K1C.",
    image: "art:printing",
    imageAlt: "",
    cta: { label: "See the printer", to: "/skills/hardware-and-troubleshooting", page: "Hardware & troubleshooting" },
  },
];
