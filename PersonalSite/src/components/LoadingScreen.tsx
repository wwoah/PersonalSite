import { AsciiSkeleton } from "ascii-reveal";
import "./LoadingScreen.css";

/* ──────────────────────────────────────────────────────────────────
   The Suspense fallback.

   A shimmering ASCII skeleton in the shape of the hero it is waiting
   on, so the first real frame — the hero decoding out of the same
   glyphs — reads as this placeholder resolving rather than as one
   screen replacing another.

   Deliberately self-contained: this paints before the page it is
   waiting on has loaded, including that page's stylesheet, so
   everything it needs is in LoadingScreen.css.
   ────────────────────────────────────────────────────────────────── */
export default function LoadingScreen() {
  return (
    <div className="loading" role="status">
      <span className="sr-only">Loading</span>
      <div className="loading__layout" aria-hidden="true">
        <div className="loading__copy">
          <AsciiSkeleton variant="dither" lines={1} widths={["38%"]} seed={3} className="loading__eyebrow" />
          <AsciiSkeleton variant="dither" lines={2} widths={["78%", "64%"]} seed={7} className="loading__title" />
          <AsciiSkeleton variant="scan" lines={3} widths={["92%", "86%", "54%"]} seed={11} className="loading__body" />
        </div>
        <AsciiSkeleton
          variant="dither"
          rows={28}
          width="100%"
          height="100%"
          seed={19}
          className="loading__image"
        />
      </div>
    </div>
  );
}
