import type { Highlight } from "./types";
import { ELB } from "./shared";

/* "APIs & services": /skills/apis-and-services */
export const apisAndServices: Highlight[] = [
  {
    title: "ERP & accounting APIs",
    context: ELB,
    summary: "The C# and .NET APIs behind an in-house ERP and accounting application.",
    points: [
      "Wrote the APIs that handle every call between the React front end and the database.",
      "Built on the .NET Framework, with data access through Entity Framework 6.",
    ],
    tags: ["C#", ".NET Framework", "EF6"],
  },
];
