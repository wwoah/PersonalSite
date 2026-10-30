import { PROFILE } from "../content";
import Decode from "./Decode";
import TransitionLink from "./transition/TransitionLink";
import { rich } from "./rich";
import "./PageOutro.css";

/* ──────────────────────────────────────────────────────────────────
   PAGE OUTRO — the signal-coloured sign-off at the foot of every page
   off the front page: an invitation to get in touch, and the way back.
   ────────────────────────────────────────────────────────────────── */
interface PageOutroProps {
  /** Wrap words in *asterisks* to set them in italics. */
  title: string;
  intro: string;
  mailto: string;
  /** Where "Back to the portfolio" lands. */
  back?: string;
}

function PageOutro({ title, intro, mailto, back = "/" }: PageOutroProps) {
  return (
    <footer className="page-outro" data-theme="signal">
      <Decode className="page-outro__inner">
        <h2 className="page-outro__title">{rich(title)}</h2>
        <p className="page-outro__intro">{intro}</p>
        <div className="page-outro__actions">
          <a className="btn" href={mailto} data-ascii="fade">
            Email me <span className="btn__arrow">↗</span>
          </a>
          <TransitionLink to={back} label="Portfolio" className="btn btn--ghost" data-ascii="fade">
            Back to the portfolio
          </TransitionLink>
        </div>
        <p className="page-outro__foot">
          © {new Date().getFullYear()} {PROFILE.name}
        </p>
      </Decode>
    </footer>
  );
}

export default PageOutro;
