import type { Highlight } from "./types";
import { ELB, PEEL_RIOT_URL, PEEL_RIOT_ART, HAVENTRY_URL } from "./shared";

/* "Data & SQL": /skills/data-and-sql */
export const dataAndSql: Highlight[] = [
  {
    title: "ERP & accounting data",
    context: ELB,
    summary: "All of the data behind an in-house ERP and accounting application, stored and queried in SQL Server.",
    points: [
      "Stored and queried every part of the application's data in a SQL Server database.",
      "Worked in T-SQL alongside Entity Framework 6.",
      "Stored procedures and migrations kept every environment in step.",
    ],
    tags: ["SQL Server", "T-SQL", "EF6"],
  },
  {
    title: "Peel Riot",
    context: "Personal project · Work in progress",
    summary: "A custom sticker shop that runs on MongoDB, which keeps track of every customer's orders and receipts.",
    points: [
      "Built the shop's data on MongoDB.",
      "Tracks each user's orders and the receipts that go with them.",
    ],
    tags: ["MongoDB", "NoSQL"],
    images: [PEEL_RIOT_ART],
    links: [{ label: "Visit Peel Riot", href: PEEL_RIOT_URL }],
  },
   {
    title: "Haventry",
    context: "Personal project · Access on GitHub Soon",
    summary: "A local inventory management system, with task notifications and reporting.",
    points: [
      "Localized inventory system design for easy set up and use.",
      "Track costs, scan items, create tasks, etc to help keep track of your stuff.",
      "Backup are automatic and can easily be exported or imported onto other devices."
    ],
    tags: ["SQLite"],
    images: [] ,
    links: [{ label: "Visit Haventry", href: HAVENTRY_URL }],
  },
];
