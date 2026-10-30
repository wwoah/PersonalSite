import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes, KeyboardEvent, PointerEvent } from "react";
import Art from "./Art";
import Lightbox, { ZoomButton } from "./Lightbox";
import { WORK_IN_PROGRESS } from "../content";
import type { Picture } from "../content";
import "./Carousel.css";

/* ──────────────────────────────────────────────────────────────────
   CAROUSEL — one picture at a time, filling whatever frame it's in.

   Arrows on either side and a dot per picture along the bottom, so
   it's plain at a glance that there's more than one picture and how
   to reach the rest. Swiping works on touch screens, and the arrow
   keys once one of the controls has focus. It never moves on its own:
   a picture changing while someone reads the words beside it pulls
   their eye away.

   Only the current picture is on the page. The decode draws over every
   image it can see, and pictures waiting beside the frame in a sliding
   strip would be decoded over the words next to it. The neighbours
   are fetched ahead instead, so a change is still instant.

   One picture shows on its own, with no controls. None at all keeps
   the space with a "photos coming soon" frame.

   Clicking the picture opens it larger in the lightbox, which moves
   through the same pictures in step with the frame, so closing it
   leaves the frame on whichever one the reader got to.

   A picture set to fit: "contain" (a portrait photo, a wide
   screenshot) shows whole, with a blurred, enlarged copy of itself
   filling the rest of the frame instead of empty bars.
   ────────────────────────────────────────────────────────────────── */
interface CarouselProps {
  images: Picture[];
  /** What the pictures are of, for screen readers: "My PC build". */
  label: string;
}

/** How far a swipe has to travel, in px, before it counts. */
const SWIPE = 40;

function Carousel({ images, label }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = images.length;

  /* Fetch the pictures either side now, so the next press shows them
     at once. The site's own illustrations are built in the page and
     need no fetching. */
  useEffect(() => {
    if (count < 2) return;
    for (const step of [1, -1]) {
      const { src } = images[(index + step + count) % count];
      if (!src.startsWith("art:")) new Image().src = src;
    }
  }, [images, index, count]);

  /* A swipe ends in a click as well, which shouldn't open the lightbox. */
  const open = () => {
    if (!swiped.current) setZoomed(true);
  };
  const close = () => setZoomed(false);

  if (count === 0) return <ComingSoon />;
  if (count === 1) {
    return (
      <>
        <div className="carousel">
          <ZoomButton onClick={open}>
            <Slide picture={images[0]} loading="lazy" decoding="async" draggable={false} />
          </ZoomButton>
        </div>
        {zoomed && <Lightbox images={images} index={0} onClose={close} label={label} />}
      </>
    );
  }

  const show = (next: number, dir: "next" | "prev") => {
    setDirection(dir);
    setIndex((next + count) % count);
  };
  const step = (by: 1 | -1) => show(index + by, by > 0 ? "next" : "prev");

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  };

  /* A swipe is a mostly sideways drag; anything steeper is the reader
     scrolling the page, and is left alone. */
  const onPointerDown = (e: PointerEvent) => {
    swipeFrom.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) {
      step(dx < 0 ? 1 : -1);
      swiped.current = true;
      window.setTimeout(() => (swiped.current = false));
    }
  };

  const current = images[index];

  return (
    <>
      <div
        className="carousel"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${label}: photos`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        <ZoomButton onClick={open}>
          {/* Keyed by position, so each picture mounts fresh and plays its
              slide-in; the very first one is left to the decode. */}
          <Slide key={index} picture={current} direction={direction} decoding="async" draggable={false} />
        </ZoomButton>

        <button type="button" className="carousel__arrow carousel__arrow--prev" onClick={() => step(-1)} data-ascii="fade">
          <Chevron />
          <span className="sr-only">Previous photo</span>
        </button>
        <button type="button" className="carousel__arrow carousel__arrow--next" onClick={() => step(1)} data-ascii="fade">
          <Chevron />
          <span className="sr-only">Next photo</span>
        </button>

        <div className="carousel__dots" data-ascii="fade">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className="carousel__dot"
              aria-current={i === index ? "true" : undefined}
              onClick={() => i !== index && show(i, i > index ? "next" : "prev")}
            >
              <span className="sr-only">
                Photo {i + 1} of {count}
              </span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Photo {index + 1} of {count}: {current.alt}
        </p>
      </div>
      {zoomed && <Lightbox images={images} index={index} onStep={step} onClose={close} label={label} />}
    </>
  );
}

interface SlideProps extends ImgHTMLAttributes<HTMLImageElement> {
  picture: Picture;
  /** Which way it arrived from; none for the first, which the decode reveals. */
  direction?: "next" | "prev" | null;
}

/** One picture in the frame. The backdrop is a CSS background, not a
    second <img>, so the decode leaves it alone: it only draws over
    images, and would draw this one twice. */
function Slide({ picture, direction, ...img }: SlideProps) {
  const whole = picture.fit === "contain";
  let className = "carousel__img";
  if (direction) className += ` carousel__img--${direction}`;
  if (whole) className += " carousel__img--whole";

  return (
    <>
      {whole && (
        <span
          className={direction ? "carousel__backdrop carousel__backdrop--in" : "carousel__backdrop"}
          style={{ backgroundImage: `url("${picture.src}")` }}
          aria-hidden="true"
          data-ascii="fade"
        />
      )}
      <Art
        className={className}
        src={picture.src}
        alt={picture.alt}
        width={1440}
        height={900}
        {...img}
      />
    </>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

/** Holds the space until the photos are in. */
function ComingSoon() {
  return (
    <div className="carousel carousel--empty">
      <svg className="carousel__camera" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 17a4 4 0 0 1 4-4h6l3-4.5h10l3 4.5h6a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" />
        <circle className="carousel__lens" cx="24" cy="26" r="8.5" />
        <circle cx="24" cy="26" r="3.5" />
      </svg>
      <p className="carousel__soon">
        <span className="carousel__soon-dot" aria-hidden="true" />
        {WORK_IN_PROGRESS.photos}
      </p>
    </div>
  );
}

export default Carousel;
