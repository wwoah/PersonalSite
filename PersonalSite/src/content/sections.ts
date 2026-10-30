/* ──────────────────────────────────────────────────────────────────
   SECTIONS — the front page's sections, in order, and the heading
   over each one.
   ────────────────────────────────────────────────────────────────── */

/* The nav, the section headers and the index numbers all come from
   this one list, so they cannot drift apart. */
export const SECTIONS = [
  { id: "about", num: "01", label: "About" },
  { id: "work", num: "02", label: "Work" },
  { id: "capabilities", num: "03", label: "Skills" },
  { id: "services", num: "04", label: "Services" },
  { id: "experience", num: "05", label: "Experience" },
  { id: "interests", num: "06", label: "Interests" },
  { id: "contact", num: "07", label: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/* Section headings. Wrap words in *asterisks* to set them in the
   italic accent. */
export const HEADINGS: Record<SectionId, { title: string; intro?: string }> = {
  about: { title: "*Gaming* from an early age." },
  work: {
    title: "Things I've *built*.",
    intro: "Recent projects, from a live collaborative canvas to the sticker shop I'm building now.",
  },
  capabilities: {
    title: "From the code to the *computer* it runs on.",
    intro: "Here are all the relevant skills in tech I've experienced and how I've applied them.",
  },
  services: {
    title: "Need a hand with *tech*?",
    intro: "For small businesses and people who would rather not wrestle with it alone, on site anywhere around the Bay Area or remotely. Tell me what's going on and I'll tell you honestly what it takes.",
  },
  experience: { title: "What I've *shipped*." },
  interests: {
    title: "Beyond the *day job*.",
    intro: "In my free time, I'm either building or playing games, desiging stickers from doodles or making things move through code.",
  },
  contact: {
    title: "Let's build *something*.",
    intro: "Hiring, need a hand with something technical, or wondering what AI could do for you? My inbox is open, and I'm happy to meet anywhere around the Bay.",
  },
};
