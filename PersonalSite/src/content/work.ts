/* ──────────────────────────────────────────────────────────────────
   WORK — the projects under "Things I've built".
   ────────────────────────────────────────────────────────────────── */

export interface Project {
  title: string;
  tags: string[];
  desc: string;
  link?: string;
  /** Path under /public. Screenshots look best at 16:10. */
  image: string;
  imageAlt: string;
  status?: string;
}

export const PROJECTS: Project[] = [
  {
    title: "InkSync",
    tags: ["React", "TypeScript", "Real-time"],
    desc: "A hub for collaborative drawing: a live shared canvas, private chat rooms and a draw-and-guess minigame.",
    link: "https://inksync-1-o3dk.onrender.com/",
    image: "/images/work/inksync.jpg",
    imageAlt: "InkSync's sign-in screen: a paper card with an avatar builder, a handle field and a colour picker.",
  },
  {
    title: "Peel Riot",
    status: "Work in progress",
    tags: ["React", "TypeScript", "MongoDB", "GSAP"],
    desc: "A purely custom sticker website. Slight plug :).",
    link: "https://peelriot.com",
    /* Illustrated stand-in until the site is live — replace with a
       screenshot at the same path or point this at a new file. */
    image: "art:peelriot",
    imageAlt: "Illustration of a pile of die-cut stickers on a bright background.",
  },
   {
    title: "Haventry",
    tags: ["React", "TypeScript", "Real-time"],
    desc: "A local inventory management system, with task notifications and reporting.",
    link: "https://github.com/wwoah/Haventry",
    image: "/images/work/imageWIP.jpg",
    imageAlt: "Haventry's dashboard: a clean interface for managing inventory and tasks.",
  },
];
