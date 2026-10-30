/* The shape of a highlight, and of the pictures on one. How to fill
   them in is in index.ts. */
export interface Picture {
  src: string;
  alt: string;
  /** "contain" shows all of it rather than filling the frame. */
  fit?: "contain";
}

export interface Highlight {
  title: string;
  /** Where and when, e.g. "ELB US, Inc. · 2024 — 2026" or "Personal project". */
  context: string;
  /** What it is, in a sentence or two. */
  summary: string;
  /** What you did: a few short, specific lines. Numbers help. */
  points: string[];
  tags: string[];
  images?: Picture[];
  links?: { label: string; href: string }[];
  specs?: { label: string; value: string }[];
}
