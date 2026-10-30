import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { ScrollSmoother } from "../anim/gsap";
import { EMAIL, PROFILE } from "../content";
import "./EmailButton.css";

/* ──────────────────────────────────────────────────────────────────
   EMAIL BUTTON — every "email me" on the site.

   A plain mailto: link hands the email to whatever mail app the
   computer has set up, and on one with none (common now that most
   people use webmail) the click does nothing or opens a blank window.
   So a click opens a small box instead: the address to copy, the
   subject when there is one, and a new email in Gmail, Outlook or the
   mail app, whichever the reader actually uses.

   It's still a real mailto: link underneath, so a ctrl- or middle-click
   and the browser's "copy email address" behave as they always have.
   ────────────────────────────────────────────────────────────────── */
interface EmailButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  /** Filled in as the email's subject line. */
  subject?: string;
  children: ReactNode;
}

const to = encodeURIComponent(PROFILE.email);
const su = (key: string, subject?: string) => (subject ? `&${key}=${encodeURIComponent(subject)}` : "");

const mailto = (subject?: string) =>
  `mailto:${PROFILE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
const gmail = (subject?: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${to}${su("su", subject)}`;
const outlook = (subject?: string) => `https://outlook.live.com/mail/0/deeplink/compose?to=${to}${su("subject", subject)}`;

function EmailButton({ subject, children, ...link }: EmailButtonProps) {
  const [open, setOpen] = useState(false);

  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <a {...link} href={mailto(subject)} onClick={onClick} aria-haspopup="dialog">
        {children}
      </a>
      {open && <EmailDialog subject={subject} onClose={() => setOpen(false)} />}
    </>
  );
}

/** The box itself: a native modal <dialog>, rendered into <body> so no
    section's clipping or ScrollSmoother's moving content gets in its
    way. The page behind holds still while it's open. */
function EmailDialog({ subject, onClose }: { subject?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const address = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    d.showModal();

    /* Put the scroll back however it was: the mobile menu may already
       have it paused. */
    const smoother = ScrollSmoother.get();
    const wasPaused = smoother?.paused() ?? false;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    smoother?.paused(true);
    if (!smoother) root.style.overflow = "hidden";

    return () => {
      if (d.open) d.close();
      smoother?.paused(wasPaused);
      root.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
    } catch {
      /* No clipboard access: select the address, so Ctrl+C does it. */
      const range = document.createRange();
      if (address.current) range.selectNodeContents(address.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  return createPortal(
    <dialog
      ref={dialog}
      className="email"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      /* Escape closes this box and nothing else: the mobile menu behind
         it listens for Escape too. */
      onKeyDown={(e) => e.key === "Escape" && e.stopPropagation()}
      /* The dialog is the card, so a click that lands on the dialog
         itself was on the backdrop around it. */
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="email__card">
        <button type="button" className="email__close" onClick={onClose}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        <p id={titleId} className="eyebrow email__title">
          {EMAIL.title}
        </p>
        <div className="email__address">
          <span ref={address} className="email__value">
            {PROFILE.email}
          </span>
          <button type="button" className="btn btn--small email__copy" onClick={copy}>
            {copied ? EMAIL.copied : EMAIL.copy}
          </button>
        </div>
        {subject && (
          <p className="email__subject">
            Subject: <span>{subject}</span>
          </p>
        )}

        <p className="email__lead">{EMAIL.lead}</p>
        <div className="email__apps">
          <a className="btn btn--ghost btn--small" href={gmail(subject)} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            Gmail <span className="btn__arrow">↗</span>
          </a>
          <a className="btn btn--ghost btn--small" href={outlook(subject)} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            Outlook <span className="btn__arrow">↗</span>
          </a>
          <a className="btn btn--ghost btn--small" href={mailto(subject)} onClick={onClose}>
            {EMAIL.app}
          </a>
        </div>

        <span className="sr-only" role="status">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
    </dialog>,
    document.body
  );
}

export default EmailButton;
