/* ──────────────────────────────────────────────────────────────────
   HIGHLIGHTS — the real examples on each skill's page.

   One file per skill, named after its id, holding that skill's
   highlights in the order they show. To add one, open the skill's
   file. For a skill with none yet, copy one of the files, name it
   after the skill's id and list it in HIGHLIGHTS below.

   The same project can turn up under several skills. Tell it from that
   skill's side each time: the screens under "Product interfaces", the
   queries under "Data & SQL". Details more than one of them repeat,
   like an employer or a link, live in shared.ts.

   Pictures are optional. Each is a path under /public or "art:…";
   landscape photos at 16:10 fill the frame best, and around 1600px
   wide is plenty. A tall or extra-wide one would lose too much to the
   crop: give it fit: "contain" and it shows whole, on a blurred copy
   of itself. One picture shows on its own; two or more become a
   carousel. An empty list keeps the space with a "photos coming soon"
   frame until they're in. Photos of your own things go in
   /public/images/highlights/.

   The first link becomes the main button. Specs are optional too: a
   short spec sheet for a machine or a setup.
   ────────────────────────────────────────────────────────────────── */
import type { CapabilityId } from "../capabilities";
import type { Highlight } from "./types";
import { productInterfaces } from "./product-interfaces";
import { apisAndServices } from "./apis-and-services";
import { dataAndSql } from "./data-and-sql";
import { shippingEndToEnd } from "./shipping-end-to-end";
import { cloudAndServers } from "./cloud-and-servers";
import { hardwareAndTroubleshooting } from "./hardware-and-troubleshooting";
import { helpDeskAndSupport } from "./help-desk-and-support";

export type { Highlight, Picture } from "./types";

export const HIGHLIGHTS: Partial<Record<CapabilityId, Highlight[]>> = {
  "product-interfaces": productInterfaces,
  "apis-and-services": apisAndServices,
  "data-and-sql": dataAndSql,
  "shipping-end-to-end": shippingEndToEnd,
  "cloud-and-servers": cloudAndServers,
  "hardware-and-troubleshooting": hardwareAndTroubleshooting,
  "help-desk-and-support": helpDeskAndSupport,
};

/* Skills still being written up. Each gets its page anyway, with the
   work-in-progress panel where the highlights will be. Take an id out
   once its examples are in. */
export const IN_PROGRESS: CapabilityId[] = [
  "ai-features",
  "ai-automation",
  "adopting-ai-tools",
  "ai-assisted-development",
  "automation-and-scripting"
];
