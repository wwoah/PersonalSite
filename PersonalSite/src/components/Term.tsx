import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────────
   The terminal idiom, in one place.

   The prompt, the echoed command and the window chrome show up in the
   hero, in every section header, in the source viewer and in the
   footer. Keeping them here means the shell's identity — which path it
   claims to be running in, how a cmdlet is coloured — is changed once
   rather than in eight stylesheets.
   ────────────────────────────────────────────────────────────────── */

/** The working directory the whole site pretends to be running in. */
export const CWD = "C:\\Users\\phill\\site";

/**
 * `PS <path`>` — dim chrome, cyan path, phosphor caret, so the eye
 * lands on the command that follows rather than on the path in front
 * of it. Never selectable: a reader copying a command should get the
 * command, not the prompt someone typed it at.
 */
export function Prompt({ path = CWD }: { path?: string }) {
  return (
    <span className="ps-prompt">
      {"PS "}
      <span className="ps-path">{path}</span>
      <span className="ps-caret">&gt;</span>
    </span>
  );
}

/**
 * PowerShell echoes a command back with its own syntax colouring, and
 * reproducing that is what makes these kickers carry information
 * rather than just decoration — you can see at a glance which token is
 * the verb, which is a parameter and which is a path.
 *
 * Deliberately a tokenizer and not a parser: it colours the four
 * shapes the page actually uses. Anything it does not recognise falls
 * through as plain foreground, which is the correct rendering for a
 * bare argument anyway.
 */
export function Cmd({ text }: { text: string }) {
  return (
    <span className="ps-cmd">
      {/* Capturing split keeps the original spacing in the output, so
          the echoed line is spaced the way it was written. */}
      {text.split(/(\s+)/).map((tok, i) => {
        if (!tok.trim()) return tok;

        if (tok === "|") {
          return (
            <span key={i} className="ps-pipe">
              {tok}
            </span>
          );
        }

        // Parameters and switches: -ListAvailable, -Query
        if (tok.startsWith("-")) {
          return (
            <span key={i} className="ps-param">
              {tok}
            </span>
          );
        }

        // Verb-Noun: the verb takes command yellow, the noun stays
        // foreground, so the subject is what reads loudest.
        const verb = /^([A-Z][a-z]+)(-[\w-]+)$/.exec(tok);
        if (verb) {
          return (
            <span key={i}>
              <span className="ps-verb">{verb[1]}</span>
              {verb[2]}
            </span>
          );
        }

        // Paths and variables read as literals.
        if (tok.startsWith(".\\") || tok.startsWith("$") || tok.includes("\\")) {
          return (
            <span key={i} className="ps-str">
              {tok}
            </span>
          );
        }

        return <span key={i}>{tok}</span>;
      })}
    </span>
  );
}

/** A full command line: prompt, echoed command, blinking block caret. */
export function PromptLine({
  cmd,
  path,
  className,
  caret = true,
}: {
  cmd: string;
  path?: string;
  className?: string;
  caret?: boolean;
}) {
  return (
    <p className={className ? `term__cmdline ${className}` : "term__cmdline"}>
      <Prompt path={path} /> <Cmd text={cmd} />
      {caret && (
        <span className="panel__caret" aria-hidden="true">
          {" \u2588"}
        </span>
      )}
    </p>
  );
}

/**
 * Windows Terminal chrome: an active tab, a new-tab affordance and the
 * three caption buttons. Entirely decorative — none of it is a control,
 * so the whole bar is hidden from assistive tech rather than offering
 * a screen reader three buttons that do nothing.
 */
export interface TermTab {
  id: string;
  label: string;
}

export function TermWindow({
  tabs,
  active,
  onSelect,
  id,
  children,
  className,
}: {
  tabs: TermTab[];
  /** Omit for a window whose tab strip is decoration only. */
  active?: string;
  onSelect?: (id: string) => void;
  /** Required when the strip is interactive, to tie tabs to the panel. */
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const interactive = tabs.length > 1 && !!onSelect && !!active && !!id;

  /* Roving tabindex plus arrow keys, per the WAI-ARIA tabs pattern:
     the strip is one tab stop and the arrows move between tabs inside
     it, rather than making every tab its own stop. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta || !onSelect) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + delta + tabs.length) % tabs.length];
    onSelect(next.id);
    document.getElementById(`${id}-tab-${next.id}`)?.focus();
  };

  return (
    <div className={className ? `term ${className}` : "term"}>
      <div className="term__bar">
        <div
          className="term__tabs"
          role={interactive ? "tablist" : undefined}
          aria-label={interactive ? "Code sample" : undefined}
          aria-hidden={interactive ? undefined : true}
          onKeyDown={interactive ? onKeyDown : undefined}
        >
          {tabs.map((t) =>
            interactive ? (
              <button
                key={t.id}
                type="button"
                id={`${id}-tab-${t.id}`}
                className="term__tab"
                role="tab"
                aria-selected={t.id === active}
                aria-controls={`${id}-panel`}
                tabIndex={t.id === active ? 0 : -1}
                onClick={() => onSelect?.(t.id)}
              >
                <span className="term__tab-icon" aria-hidden="true">
                  {"\u25a3"}
                </span>
                {t.label}
              </button>
            ) : (
              <span key={t.id} className="term__tab" aria-selected="true">
                <span className="term__tab-icon">{"\u25a3"}</span>
                {t.label}
              </span>
            )
          )}
        </div>

        {/* Chrome, not controls \u2014 nothing here does anything. */}
        <div className="term__chrome" aria-hidden="true">
          <span className="term__newtab">+</span>
          <span className="term__spacer" />
          <span className="term__controls">
            <span>{"\u2500"}</span>
            <span>{"\u25a1"}</span>
            <span>{"\u2715"}</span>
          </span>
        </div>
      </div>

      {interactive ? (
        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
