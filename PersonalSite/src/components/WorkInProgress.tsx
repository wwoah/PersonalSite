import type { ReactNode } from "react";
import Decode from "./Decode";
import EmailButton from "./EmailButton";
import { rich } from "./rich";
import { WORK_IN_PROGRESS } from "../content";
import "./WorkInProgress.css";

/* ──────────────────────────────────────────────────────────────────
   WORK IN PROGRESS — laid over a part of the site that isn't finished.

   Whatever is underneath shows through blurred and out of reach (when
   there's nothing yet, a couple of placeholder cards stand in), with a
   strip of caution tape across it and a note on top saying what's
   coming and how to ask about it in the meantime.

   The tape scrolls and the cursor blinks. Both sit outside the decode,
   which would leave glyphs behind where a moving thing used to be, and
   both stop for anyone who prefers reduced motion.
   ────────────────────────────────────────────────────────────────── */
interface WorkInProgressProps {
  /** Wrap words in *asterisks* to set them in the italic accent. */
  title?: string;
  note?: string;
  /** The subject of the email "Ask me about it" starts. */
  subject: string;
  /** What's being worked on, shown blurred behind the note. */
  children?: ReactNode;
  /** Added to the panel, for a page to fit it to its own layout. */
  className?: string;
}

/** Enough repeats to run past the edge of the widest panel. */
const TAPE = Array.from({ length: 8 }, (_, i) => i);

function WorkInProgress({
  title = WORK_IN_PROGRESS.title,
  note = WORK_IN_PROGRESS.note,
  subject,
  children,
  className,
}: WorkInProgressProps) {
  return (
    <div className={className ? `wip ${className}` : "wip"}>
      <div className="wip__behind" aria-hidden="true" inert>
        {children ?? <Placeholders />}
      </div>

      {/* Two identical copies, so sliding one copy's width loops seamlessly. */}
      <div className="wip__tape" aria-hidden="true">
        <div className="wip__tape-track">
          {[0, 1].map((copy) => (
            <span key={copy} className="wip__tape-copy">
              {TAPE.map((i) => (
                <span key={i} className="wip__tape-item">
                  {WORK_IN_PROGRESS.label}
                  <span className="wip__tape-star">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <Decode className="wip__card" data-ascii="surface">
        <p className="wip__label">
          <span className="wip__dot" aria-hidden="true" />
          {WORK_IN_PROGRESS.label}
        </p>
        <h3 className="wip__title">
          {rich(title)}
          <span className="wip__cursor" data-ascii="skip" aria-hidden="true" />
        </h3>
        <p className="wip__note">{note}</p>
        <EmailButton className="btn wip__ask" subject={subject} data-ascii="fade">
          {WORK_IN_PROGRESS.ask} <span className="btn__arrow">↗</span>
        </EmailButton>
      </Decode>
    </div>
  );
}

/** Two highlight-shaped outlines: the shape of what's coming. */
function Placeholders() {
  return (
    <div className="wip__ghosts">
      {[0, 1].map((i) => (
        <div key={i} className="wip__ghost">
          <div className="wip__ghost-col">
            <span className="wip__bar wip__bar--short" />
            <span className="wip__bar wip__bar--title" />
            <span className="wip__bar" />
            <span className="wip__bar wip__bar--most" />
          </div>
          <div className="wip__ghost-col">
            <span className="wip__bar wip__bar--short" />
            <span className="wip__bar" />
            <span className="wip__bar wip__bar--most" />
            <span className="wip__bar" />
            <span className="wip__chips">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WorkInProgress;
