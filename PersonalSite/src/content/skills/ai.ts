import type { Capability } from "./capabilities";

/* The AI group comes after the two above: a single illustration beside
   four smaller cards, so it reads as its own thing rather than four more
   of the same. Numbering carries on from "Running IT".

   The illustration comes in two shapes: tall for the panel beside the
   cards, and a wide banner for when the cards stack on narrow screens.
   The banner is also the picture at the top of each AI skill page.

   For now the cards sit under the work-in-progress panel, which says
   `wip` (the rest of its words are in ../workInProgress.ts). */
export const AI: {
  label: string;
  note: string;
  image: string;
  banner: string;
  wip: { title: string; note: string };
  items: Capability[];
} = {
  label: "Working with AI",
  note: "Where AI functions with people's work day to day.",
  image: "art:ai-tall",
  banner: "art:ai-banner",
  wip: {
    title: "This section is *still being written*.",
    note: "I'm putting together real examples of my work with AI. Until they're up, feel free to inquire. I'm happy to walk you through what I'm working on.",
  },
  items: [
    {
      id: "ai-features",
      title: "AI features in apps",
      desc: "Software that calls AI models to answer questions, summarise documents, pull data out of text or make search smarter.",
      tools: ["OpenAI", "Claude", "Summaries", "Data extraction"],
    },
    {
      id: "ai-automation",
      title: "AI-powered automation",
      desc: "Workflows and scripts that use AI to sort, draft, classify and route, so people stop doing it by hand.",
      tools: ["Classification", "Drafting", "Routing", "PowerShell"],
    },
    {
      id: "adopting-ai-tools",
      title: "Adopting AI tools",
      desc: "Setting up and teaching tools like ChatGPT, Copilot and Claude so a team or a person actually gets value from them.",
      tools: ["ChatGPT", "Copilot", "Claude", "Training"],
    },
    {
      id: "ai-assisted-development",
      title: "AI-assisted development",
      desc: "AI coding tools to build faster, with a careful human review of everything they write before it ships.",
      tools: ["AI coding tools", "Code review", "Faster delivery"],
    },
  ],
};
