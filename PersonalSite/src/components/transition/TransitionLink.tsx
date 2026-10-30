import type { AnchorHTMLAttributes } from "react";
import { usePageTransition } from "./context";

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  /** Shown on the curtain while it is closed. */
  label?: string;
}

/**
 * A real link — it has an href, so it can be opened in a new tab,
 * copied or crawled — whose plain left-click goes through the curtain.
 * Modified clicks fall through to the browser untouched.
 */
function TransitionLink({ to, label, onClick, children, ...rest }: TransitionLinkProps) {
  const go = usePageTransition();

  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          rest.target === "_blank"
        )
          return;
        e.preventDefault();
        go(to, label);
      }}
    >
      {children}
    </a>
  );
}

export default TransitionLink;
