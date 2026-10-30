/* ──────────────────────────────────────────────────────────────────
   SERVICES — what clients can ask for, and how working together goes.
   ────────────────────────────────────────────────────────────────── */

/* What a small business or an individual can ask for. Each one opens an
   email with the service already in the subject line. */
export const SERVICES = [
  {
    title: "Custom programming & software",
    desc: "Bespoke tools, web apps and integrations built around how your business actually works, from a one-off script to a full application.",
    tags: ["React", ".NET", "SQL Server", "Integrations"],
  },
  {
    title: "AI tools & automation",
    desc: "Put AI to work: an assistant that knows your business, documents summarised and sorted automatically, or help getting your team comfortable with ChatGPT, Copilot or Claude.",
    tags: ["AI integration", "Automation", "Training"],
  },
  {
    title: "Cloud setup & deployment",
    desc: "Your site or app on Azure or in Docker, deployed properly and kept up to date.",
    tags: ["Azure", "Docker"],
  },
  {
    title: "PC builds, upgrades & repairs",
    desc: "A new machine specced and built, an old one brought back up to speed, or a broken one diagnosed and fixed, at your place anywhere around the Bay.",
    tags: ["Hardware", "Diagnostics"],
  },
  {
    title: "Automation",
    desc: "Repetitive work handed to a script or a scheduled job, so it happens on time without anyone having to remember.",
    tags: ["PowerShell", "Scheduled tasks"],
  },
  {
    title: "Tech support",
    desc: "On-site help anywhere around the Bay Area, or remote help wherever you are, explained in plain English so you know what happened and why.",
    tags: ["On site", "Remote help", "Troubleshooting"],
  },
];

export const PROCESS = [
  { title: "Tell me what's going on", desc: "A short email about what you need, or what's broken, is plenty to start." },
  { title: "Get a straight answer", desc: "What it takes, what it costs and how long it'll be, before any work starts." },
  { title: "Consider it handled", desc: "I build it, set it up or fix it, then walk you through what changed." },
];
