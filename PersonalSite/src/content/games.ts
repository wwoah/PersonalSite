/* ──────────────────────────────────────────────────────────────────
   GAMES — the /games page

   One entry per game, in the order they appear. Put images in
   /public/images/games/<id>/: the first is the cover (16:9 looks
   best) and the rest become thumbnails under it.

   Video: a YouTube ID (the part after "v=") puts a Watch button on the
   cover. Nothing loads from YouTube until it's pressed.

   Playable Unity builds: build for WebGL, copy the build folder to
   /public/builds/<id>/ and point `webgl` at its index.html. In Player
   Settings → Publishing Settings, set Compression Format to Gzip and
   tick Decompression Fallback, or the build only runs on hosts that
   send the right Content-Encoding headers. (Not /public/games/: a
   folder there would shadow the /games page on some hosts.)

   Roblox experiences can't be embedded, so link to them instead.

   Entries marked `sample` show while you run `npm run dev` and are left
   out of every build, so they can never go live by mistake. Delete
   them once your own are in.
   ────────────────────────────────────────────────────────────────── */
export interface GameProject {
  /** Lowercase with dashes. Each game gets a link of its own: /games#<id>. */
  id: string;
  title: string;
  engine: "Unity" | "Roblox Studio";
  /** e.g. "Released", "In development", "Game jam". */
  status?: string;
  year?: string;
  /** e.g. "Solo project" or "Programmer, team of four". */
  role?: string;
  desc: string;
  /** What you built: systems and problems solved, a few short lines. */
  highlights: string[];
  tags: string[];
  /** The first is the cover. A path under /public, or "art:…". */
  images: { src: string; alt: string }[];
  youtube?: string;
  webgl?: string;
  /** Roblox, itch.io, Steam, GitHub… The first is the main button. */
  links?: { label: string; href: string }[];
  sample?: boolean;
}

export const GAMES_PAGE = {
  title: "Games I *make*.",
  intro:
    "When I'm not building software for work, I'm building games: in Unity with C#, and in Roblox Studio with Luau. Here's what I've made.",
  empty: "The first builds are on their way. Check back soon.",
  /** On the work-in-progress panel, while GAMES_IN_PROGRESS is on. */
  wip: {
    title: "Games are *on the way*.",
    note: "I'm putting together the games I've made in Unity and Roblox Studio. Until they're up, ask me about them: I'm happy to talk through what I'm building.",
  },
  outroTitle: "Want to talk *games*?",
  outroIntro: "Hiring, or curious how one of these was put together? My inbox is open.",
};

export const GAMES: GameProject[] = [
  {
    id: "sample-roblox",
    sample: true,
    title: "Your Roblox experience",
    engine: "Roblox Studio",
    status: "Sample · dev only",
    year: "2026",
    role: "Solo: built and scripted",
    desc: "Two or three sentences on what the player does and what makes it fun. This entry only shows in development; swap in one of your own.",
    highlights: [
      "The systems you scripted, not just the map you built",
      "Something tricky you solved: saving progress, lag, exploiters",
      "A number if you have one: visits, favourites, peak players",
    ],
    tags: ["Luau", "Roblox Studio"],
    images: [
      {
        src: "art:game-roblox",
        alt: "Illustration of an obby: floating platforms over lava, a blocky avatar mid-jump and a checkpoint flag.",
      },
    ],
    links: [{ label: "Play on Roblox", href: "#" }],
  },
  {
    id: "sample-unity",
    sample: true,
    title: "Your Unity game",
    engine: "Unity",
    status: "Sample · dev only",
    year: "2026",
    role: "Solo project",
    desc: "What kind of game it is and what you're proud of in it. Add a YouTube ID for a trailer, or a WebGL build so people can play it right here.",
    highlights: [
      "A mechanic or system you wrote in C#",
      "The hardest bug, and how you found it",
      "Tools you leaned on: Shader Graph, Cinemachine, the new Input System",
    ],
    tags: ["C#", "Unity", "WebGL"],
    images: [
      {
        src: "art:game-unity",
        alt: "Illustration of the Unity editor: a hierarchy panel, a scene with a selected cube at sunset, and an inspector.",
      },
      { src: "art:games", alt: "Illustration of a game controller between a gizmo-handled cube and a block world." },
    ],
    links: [
      { label: "Play on itch.io", href: "#" },
      { label: "Source", href: "#" },
    ],
  },
];

/** What the site actually shows: sample entries never reach a build. */
export const SHOWN_GAMES = GAMES.filter((g) => import.meta.env.DEV || !g.sample);

/* While the page is still being put together, it stays linked from the
   nav and the front page, with the work-in-progress panel where the
   games will be. Set it to false once they're ready to show. */
export const GAMES_IN_PROGRESS: boolean = true;

/** Whether anything links to /games: while it's marked as in progress,
    or once there's a game to show. */
export const HAS_GAMES_PAGE = GAMES_IN_PROGRESS || SHOWN_GAMES.length > 0;
