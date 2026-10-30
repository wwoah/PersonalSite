import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode, SyntheticEvent } from "react";
import Art from "./Art";
import { ScrollSmoother } from "../anim/gsap";
import type { Picture } from "../content";
import "./Lightbox.css";

/* ──────────────────────────────────────────────────────────────────
   LIGHTBOX — a picture opened up to fill the screen.

   A native modal <dialog>, so focus stays inside it, Escape closes it
   and the page behind can't be reached. It's rendered into <body>,
   outside every decode, which would otherwise draw over the big copy
   too, and outside ScrollSmoother's moving content. The page behind
   stops scrolling while it's open, as it does for the mobile menu.

   Arrows, the arrow keys and a sideways swipe move between pictures
   when there's more than one; a click anywhere off the picture closes
   it.

   Saving is made awkward rather than impossible: no right-click menu,
   no dragging the picture out, no long-press "save image" on phones,
   and a transparent layer over each picture so even a forced menu has
   no image to offer. Nothing stops a screenshot, or someone fetching
   the file through the browser's developer tools.
   ────────────────────────────────────────────────────────────────── */
interface LightboxProps {
  images: Picture[];
  index: number;
  /** Move to the next or previous picture. Leave out for just one. */
  onStep?: (by: 1 | -1) => void;
  onClose: () => void;
  /** What the pictures are of, for screen readers: "My PC build". */
  label: string;
}

/** How far a swipe has to travel, in px, before it counts. */
const SWIPE = 40;

/** No right-click or long-press menu over a picture. */
const noMenu = (e: SyntheticEvent) => e.preventDefault();

function Lightbox({ images, index, onStep, onClose, label }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const figure = useRef<HTMLElement>(null);
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = images.length;
  const picture = images[index];
  /* Only when there is somewhere to go. */
  const step = count > 1 ? onStep : undefined;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    /* Whatever opened it gets focus back afterwards. The dialog would
       do that itself, but React has already taken it off the page by
       the time this cleans up. */
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    d.showModal();

    const smoother = ScrollSmoother.get();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    smoother?.paused(true);
    if (!smoother) root.style.overflow = "hidden";

    return () => {
      if (d.open) d.close();
      smoother?.paused(false);
      root.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  /* Events from a portal still bubble through the React tree, so each
     one stops here rather than reaching a carousel underneath. */
  const onKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!step || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  };

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    swipeFrom.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    e.stopPropagation();
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from || !step) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) {
      step(dx < 0 ? 1 : -1);
      /* A swipe ends in a click as well; that one shouldn't close it. */
      swiped.current = true;
      window.setTimeout(() => (swiped.current = false));
    }
  };

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (swiped.current) return;
    if (e.target === dialog.current || e.target === figure.current) onClose();
  };

  return createPortal(
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={`${label}: photos`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeFrom.current = null)}
      onContextMenu={noMenu}
    >
      <button type="button" className="lightbox__btn lightbox__close" onClick={onClose} autoFocus>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
        <span className="sr-only">Close</span>
      </button>

      <figure ref={figure} className="lightbox__figure">
        {/* Keyed, so each picture fades in as it arrives. */}
        <div key={index} className="lightbox__frame">
          <Art className="lightbox__img" src={picture.src} alt={picture.alt} draggable={false} />
        </div>
        <figcaption className="lightbox__caption" aria-live="polite">
          {count > 1 && (
            <span className="lightbox__count">
              {index + 1} / {count}
            </span>
          )}
          {picture.alt}
        </figcaption>
      </figure>

      {step && (
        <>
          <button type="button" className="lightbox__btn lightbox__arrow lightbox__arrow--prev" onClick={() => step(-1)}>
            <Chevron />
            <span className="sr-only">Previous photo</span>
          </button>
          <button type="button" className="lightbox__btn lightbox__arrow lightbox__arrow--next" onClick={() => step(1)}>
            <Chevron />
            <span className="sr-only">Next photo</span>
          </button>
        </>
      )}
    </dialog>,
    document.body
  );
}

/** A picture's frame, made into the button that opens the lightbox:
    the whole picture is the target, with an enlarge mark in the corner
    so it reads as clickable on touch screens too. */
export function ZoomButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="zoom" onClick={onClick} onContextMenu={noMenu}>
      <span className="sr-only">Enlarge photo: </span>
      {children}
      <span className="zoom__mark" aria-hidden="true" data-ascii="fade">
        <svg viewBox="0 0 16 16">
          <path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9" />
        </svg>
      </span>
    </button>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

export default Lightbox;
