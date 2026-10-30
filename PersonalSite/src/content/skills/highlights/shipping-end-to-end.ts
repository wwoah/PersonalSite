import type { Highlight } from "./types";
import { ELB, INKSYNC_URL, PEEL_RIOT_URL, PEEL_RIOT_ART } from "./shared";

/* "Shipping end to end": /skills/shipping-end-to-end */
export const shippingEndToEnd: Highlight[] = [
  {
    title: "ERP & accounting web app",
    context: ELB,
    summary: "An in-house ERP and accounting web application, completed end to end: the interface, the APIs and the database.",
    points: [
      "The front end in React and TypeScript, styled with Mantine.",
      "The C# and .NET APIs between the interface and the database.",
      "The data in SQL Server.",
    ],
    tags: ["React", "TypeScript", "C#", ".NET Framework", "T-SQL"],
  },
  {
    title: "InkSync",
    context: "Personal project",
    summary: "A collaborative drawing app, built and put live where anyone can open it.",
    points: [
      "Live on Render, open to anyone with the link.",
      "Real-time drawing, chat rooms and a minigame in one app.",
    ],
    tags: ["React", "TypeScript", "Render"],
    links: [{ label: "Visit InkSync", href: INKSYNC_URL }],
  },
  {
    title: "Peel Riot",
    context: "Personal project · Work in progress",
    summary: "A custom sticker shop, built end to end: from the storefront to the database behind every order.",
    points: [
      "The storefront in React and TypeScript, animated with GSAP.",
      "Every customer's orders and receipts, tracked in MongoDB.",
    ],
    tags: ["React", "TypeScript", "GSAP", "MongoDB"],
    images: [PEEL_RIOT_ART],
    links: [{ label: "Visit Peel Riot", href: PEEL_RIOT_URL }],
  },
];
