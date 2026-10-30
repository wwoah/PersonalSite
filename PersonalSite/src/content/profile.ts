/* ──────────────────────────────────────────────────────────────────
   PROFILE — who you are and where to find you: the name, photo and
   status the hero and nav use, the social links, and the lines the
   ticker repeats.
   ────────────────────────────────────────────────────────────────── */

export const PROFILE = {
  name: "Phillip Bishop",
  first: "I'm Phillip",
  last: "Bishop",
  role: "Software developer & IT support",
  location: "Danville, CA",
  /* Where on-site work happens. Employers and clients both read this. */
  area: "Anywhere in the Bay Area",
  email: "phillipkbishop@gmail.com",
  status: "Open to developer roles / IT consulting",
  /* Swap for a real photo — /images/portrait/phillip.jpg at roughly
     4:5 works best. The placeholder is abstract art on purpose: an
     empty avatar silhouette reads as "photo missing". */
  portrait: "art:portrait",
  portraitAlt: "",
  /* The face in the nav's round badge, beside the name. A square crop
     around 144px across stays sharp on high-density screens. */
  avatar: "/images/avatar.webp",
  /* The résumé the hero button and the contact links open. To update
     it, replace the file in /public/files/ (or point this at a new one). */
  resume: "/files/Phillip_Bishop_FullStack_Developer_Resume.pdf",
  headline: "Welcome to my website!",
  intro:
    "Here you'll find information about my work, experience and what I find interesting. If you are an employer or just curious, feel free to browse through my 'skills' section and see if I can help in any way.",
  /* What the hero's footer row says at a glance. */
  covers: "Software · AI · Cloud · Hardware · Support",
};

/* The box every email button opens. A bare mailto: link does nothing,
   or opens a blank window, on a computer with no mail app set up, and
   plenty of visitors won't have one. So the box offers the address to
   copy, and Gmail or Outlook in the browser, as well as the mail app. */
export const EMAIL = {
  title: "Email me",
  lead: "Copy the address, or start an email in:",
  copy: "Copy",
  copied: "Copied",
  app: "Mail app",
};

/* The links at the foot of the contact section. */
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/wwoah" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/phillip--bishop/" },
  { label: "Résumé", href: PROFILE.resume },
];

/* The lines the scrolling ticker on the front page repeats. */
export const MARQUEE = [
  "Open to developer roles & IT consulting",
  "Software · AI · Cloud · Hardware",
  "On site across the Bay Area",
  "React · .NET · SQL Server · Azure · PowerShell",
];
