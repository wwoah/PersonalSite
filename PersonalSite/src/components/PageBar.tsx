import { PROFILE } from "../content";
import TransitionLink from "./transition/TransitionLink";
import AccentPicker from "./AccentPicker";
import "./SiteNav.css";
import "./PageBar.css";

/* ──────────────────────────────────────────────────────────────────
   PAGE BAR — the site nav's frosted bar for the pages off the front
   page, with the way back in place of the section links.
   ────────────────────────────────────────────────────────────────── */
interface PageBarProps {
  /** Where the back link goes, and what it says. */
  back: { to: string; label: string };
  /** The "Let's talk" button's mailto: link. */
  mailto: string;
}

function PageBar({ back, mailto }: PageBarProps) {
  return (
    <header className="nav page-bar">
      <TransitionLink to="/" label="Portfolio" className="nav__brand">
        <img className="nav__mark" src={PROFILE.avatar} alt="" width={36} height={36} />
        <span className="nav__name">{PROFILE.name}</span>
      </TransitionLink>

      <div className="nav__actions">
        <AccentPicker />
        <TransitionLink to={back.to} label={back.label} className="nav__games page-bar__back">
          <span className="nav__games-icon" aria-hidden="true" />
          {back.label}
        </TransitionLink>
        <a className="btn btn--small nav__cta" href={mailto}>
          Let's talk
        </a>
      </div>
    </header>
  );
}

export default PageBar;
