import type { Highlight } from "./types";
import { ELB, INKSYNC_URL } from "./shared";

/* "Product interfaces": /skills/product-interfaces */
export const productInterfaces: Highlight[] = [
  {
    title: "ERP & accounting web app",
    context: ELB,
    summary: "The front end of an in-house ERP and accounting application, which I took through to completion.",
    points: [
      "Built the interface in React with TypeScript.",
      "Styled it with the Mantine component library.",
      "Connected every screen to the C# and .NET APIs behind it.",
    ],
    tags: ["React", "TypeScript", "Mantine"],
  },
  {
    title: "InkSync",
    context: "Personal project",
    summary: "A hub for collaborative drawing: a live shared canvas, private chat rooms and a draw-and-guess minigame.",
    points: [
      "A canvas that everyone in the room draws on at once.",
      "Private chat rooms alongside the drawing.",
      "A draw-and-guess minigame.",
      "A sign-in card with an avatar builder, a handle and a colour picker.",
    ],
    tags: ["React", "TypeScript", "Real-time"],
    images: [
      {
        src: "/images/work/inksync.jpg",
        alt: "InkSync's sign-in screen: a paper card with an avatar builder, a handle field and a colour picker.",
      },
    ],
    links: [{ label: "Visit InkSync", href: INKSYNC_URL }],
  },
  {
    title: "This portfolio",
    context: "Personal project · 2026",
    summary: "The site you're reading: content decodes out of ASCII characters as it scrolls in, and visitors pick the accent colour.",
    points: [
      "An accent picker that works out readable shades of whatever colour is picked, so text keeps its contrast on light and dark backgrounds.",
      "Illustrations that recolour themselves to match the chosen accent.",
      "Page transitions that fetch the next page's code while the curtain is closed.",
      "Honours the reduced-motion setting: animation is switched off, not just shortened.",
    ],
    tags: ["React", "TypeScript", "GSAP", "Vite"],
  },
];
