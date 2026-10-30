/* ──────────────────────────────────────────────────────────────────
   CONTENT

   Every word and image on the front page lives here, so editing the
   site never means touching layout or animation code. An image is
   either a path under /public — drop a new file in and point the entry
   at it — or "art:<name>", one of the site's own illustrations, which
   are recoloured to match the accent the visitor picks (see
   src/theme/art.ts).

   It's split by section, one short file each. Everything still
   imports from "content"; this file only gathers the parts up:

     profile.ts         name, photo, status, social links, ticker
     sections.ts        section order and every section heading
     about.ts           the About section
     work.ts            the projects under "Things I've built"
     skills/            the skill tiles, the AI group, the skill pages
       highlights/      each skill's examples, one file per skill
     services.ts        what clients can ask for, and how it goes
     experience.ts      jobs
     interests.ts       the Interests cards
     games.ts           the /games page
     workInProgress.ts  the work-in-progress panel's words
   ────────────────────────────────────────────────────────────────── */

export * from "./profile";
export * from "./sections";
export * from "./about";
export * from "./work";
export * from "./skills";
export * from "./services";
export * from "./experience";
export * from "./interests";
export * from "./games";
export * from "./workInProgress";
