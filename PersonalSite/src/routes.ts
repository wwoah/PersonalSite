/* ──────────────────────────────────────────────────────────────────
   Route chunks.

   App hands these same functions to React.lazy, and the page
   transition calls them while its curtain is coming down. A dynamic
   import is cached by module, so whichever asks first starts the
   download and the other gets the same promise: by the time the
   curtain is fully closed the next page's code is usually already in
   hand, and nothing flashes the Suspense fallback mid-transition.
   ────────────────────────────────────────────────────────────────── */
export const loadFrontPage = () => import("./pages/FrontPage");
export const loadGamesPage = () => import("./pages/Games/GamesPage");
export const loadSkillPage = () => import("./pages/Skills/SkillPage");

export const skillPath = (id: string) => `/skills/${id}`;

export function preloadRoute(path: string): Promise<unknown> {
  const pathname = path.split(/[?#]/)[0];
  if (pathname === "/games") return loadGamesPage();
  if (pathname.startsWith("/skills/")) return loadSkillPage();
  return loadFrontPage();
}
