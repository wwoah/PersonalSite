/* ──────────────────────────────────────────────────────────────────
   SKILL PAGES — /skills/<id>

   Every skill tile on the front page can open a page of its own with
   real examples of that work (see highlights/). A tile links to its
   page as soon as it has one highlight, or is listed in IN_PROGRESS,
   and not before, so the live site never shows an empty page. While
   you run `npm run dev` every tile links, so you can see where each
   page would go.

   The tiles themselves are in capabilities.ts and ai.ts. This file
   puts them in order, with their numbers and examples, and holds the
   headings every skill page shares.
   ────────────────────────────────────────────────────────────────── */
import { AI } from "./ai";
import { CAPABILITY_GROUPS } from "./capabilities";
import type { Capability } from "./capabilities";
import { HIGHLIGHTS, IN_PROGRESS } from "./highlights";
import type { Highlight } from "./highlights";

export * from "./capabilities";
export * from "./ai";
export * from "./highlights";

export const SKILL_PAGE = {
  highlightsTitle: "Where I've *done it*.",
  exploreTitle: "Keep *exploring*.",
  exploreIntro: "Every skill, grouped as it is on the front page. Pick another to see the work behind it.",
  outroTitle: "Need this on *your team*?",
  outroIntro: "Hiring, or have a project that calls for it? My inbox is open.",
};

/** A skill as its page needs it: the tile, where it sits, and its highlights. */
export interface Skill extends Capability {
  image: string;
  group: string;
  /** "01" to "12": the number on its tile. */
  num: string;
  highlights: Highlight[];
  /** Listed in IN_PROGRESS: its page shows the work-in-progress panel. */
  inProgress: boolean;
}

/* In the order the front page shows and numbers them: building
   software, then running IT, then AI. */
export const SKILLS: Skill[] = [
  ...CAPABILITY_GROUPS[0].items.map((c) => ({ ...c, group: CAPABILITY_GROUPS[0].label })),
  ...CAPABILITY_GROUPS[1].items.map((c) => ({ ...c, group: CAPABILITY_GROUPS[1].label })),
  ...AI.items.map((c) => ({ ...c, image: AI.banner, group: AI.label })),
].map((c, i) => ({
  ...c,
  num: String(i + 1).padStart(2, "0"),
  highlights: HIGHLIGHTS[c.id] ?? [],
  inProgress: IN_PROGRESS.includes(c.id),
}));

export const getSkill = (id: string) => SKILLS.find((s) => s.id === id);

/** Whether a skill gets a page: on the live site, only once it has
    highlights to show or is marked as in progress. */
export const hasSkillPage = (skill: Skill) =>
  import.meta.env.DEV || skill.highlights.length > 0 || skill.inProgress;
