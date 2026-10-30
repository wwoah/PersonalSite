import { createContext, useContext } from "react";

/** Navigate to `to` behind the ASCII curtain; `label` is shown while it is closed. */
export type GoFn = (to: string, label?: string) => void;

export const TransitionContext = createContext<GoFn | null>(null);

export function usePageTransition(): GoFn {
  const go = useContext(TransitionContext);
  if (!go) throw new Error("usePageTransition must be used inside <PageTransition>");
  return go;
}
