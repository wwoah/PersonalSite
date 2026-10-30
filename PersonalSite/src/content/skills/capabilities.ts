/* ──────────────────────────────────────────────────────────────────
   SKILL TILES — "Building software" and "Running IT" on the front
   page. The AI group is in ai.ts.
   ────────────────────────────────────────────────────────────────── */

/* Each skill's id is its address: /skills/<id> for its own page, and
   /#<id> for its tile on the front page. They are all listed here, so
   a mistyped id anywhere else is a type error rather than a dead link. */
export type CapabilityId =
  | "product-interfaces"
  | "apis-and-services"
  | "data-and-sql"
  | "shipping-end-to-end"
  | "ai-features"
  | "ai-automation"
  | "adopting-ai-tools"
  | "ai-assisted-development"
  | "cloud-and-servers"
  | "hardware-and-troubleshooting"
  | "automation-and-scripting"
  | "help-desk-and-support";

export interface Capability {
  id: CapabilityId;
  title: string;
  desc: string;
  tools: string[];
}

interface CapabilityGroup {
  label: string;
  note: string;
  items: (Capability & { image: string })[];
}

/* Two groups, shown one above the other: what I build, and the IT I
   run and support around it. Numbering runs on across both. A tile
   opens a page of real examples once it has some (see index.ts). */
export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    label: "Building software",
    note: "Coding workflows from front to back and everything else around it.",
    items: [
      {
        id: "product-interfaces",
        title: "Product interfaces",
        desc: "Responsive, accessible React and TypeScript front ends, built from components that stay tidy as the product grows.",
        image: "art:interfaces",
        tools: ["React", "TypeScript", "JavaScript", "Vite", "Mantine", "Tailwind", "React Router", "GSAP"],
      },
      {
        id: "apis-and-services",
        title: "APIs & services",
        desc: "C# and .NET services that keep business rules in one place and give the front end exactly the data it needs.",
        image: "art:apis",
        tools: ["C#", ".NET 8", ".NET Framework", "ASP.NET Web API", "ASP.NET MVC", "Blazor", "REST"],
      },
      {
        id: "data-and-sql",
        title: "Data & SQL",
        desc: "Schemas, queries and stored procedures that return fast, with migrations that keep every environment in step.",
        image: "art:data",
        tools: ["SQL Server", "T-SQL", "Entity Framework", "EF Core", "Stored procedures", "Migrations", "MongoDB"],
      },
      {
        id: "shipping-end-to-end",
        title: "Shipping end to end",
        desc: "Features taken from schema to screen: tested, reviewed and deployed, not just handed over.",
        image: "art:delivery",
        tools: ["Git", "Azure DevOps", "Docker", "Postman", "Visual Studio", "PowerShell"],
      },
    ],
  },
  {
    label: "Running IT",
    note: "My exposure to machines and keeping them running.",
    items: [
      {
        id: "cloud-and-servers",
        title: "Cloud & servers",
        desc: "Getting apps onto Azure and into Docker containers, then keeping them deployed, updated and up.",
        image: "art:cloud",
        tools: ["Azure", "Docker", "Azure DevOps", "Deployments", "Hosting", "Raspberry Pi"],
      },
      {
        id: "hardware-and-troubleshooting",
        title: "Hardware & troubleshooting",
        desc: "Building, upgrading and repairing PCs, and working out why a slow or broken machine is misbehaving.",
        image: "art:hardware",
        tools: ["PC builds", "Upgrades", "Repairs", "Diagnostics", "Troubleshooting", "3D printing"],
      },
      {
        id: "automation-and-scripting",
        title: "Automation & scripting",
        desc: "Scripts and scheduled jobs that take repetitive work off people's plates, written so the next person can read them.",
        image: "art:automation",
        tools: ["PowerShell", "Scheduled tasks", "Scripting", "Workflow automation"],
      },
      {
        id: "help-desk-and-support",
        title: "Help desk & support",
        desc: "Patient, plain-English help when technology gets in the way, with remote support that leaves people more confident than before.",
        image: "art:helpdesk",
        tools: ["Remote support", "Troubleshooting", "User support", "Walkthroughs"],
      },
    ],
  },
];
