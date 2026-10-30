import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useGSAP } from "@gsap/react";
import { gsap, reduceMotion } from "../anim/gsap";
import {
  DEFAULT_ACCENT,
  PRESETS,
  hexToHsv,
  hsvToHex,
  isHex,
  normalizeHex,
  setAccent,
  useAccent,
} from "../theme/accent";
import type { HSV } from "../theme/accent";
import "./AccentPicker.css";

/* ──────────────────────────────────────────────────────────────────
   Accent picker.

   A swatch in the nav that opens, from where it sits, into a colour
   wheel: hue around the rim, saturation from the white centre out,
   and a brightness slider under it. Presets for a one-click change, a
   hex field for an exact one. The whole site recolours live as you
   drag — see theme/accent.ts for how each pick is made readable.

   The wheel is pure CSS: a conic gradient for hue under a radial white
   fade for saturation, then black at (1 − brightness) on top. Those
   three layers composite to exactly the HSV colour at each point, so
   the handle's colour and the colour under it always agree.
   ────────────────────────────────────────────────────────────────── */

const MIN_V = 0.2;

function AccentPicker({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const accent = useAccent();
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(accent));
  const [draft, setDraft] = useState<string | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  /* Handlers build on this rather than on `hsv`: a held arrow key or a
     fast drag can fire again before React has re-rendered, and each
     step should build on the last one rather than on a stale render. */
  const latest = useRef(hsv);

  const pick = (next: HSV) => {
    latest.current = next;
    setHsv(next);
    setAccent(hsvToHex(next));
  };

  const choose = (hex: string) => {
    const next = hexToHsv(hex);
    latest.current = next;
    setHsv(next);
    setAccent(hex);
  };

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  /* Outside click and Escape close it; Escape hands focus back. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ── Open / close ─────────────────────────────────────────────────
     The panel grows out of the swatch as a circle, and the wheel spins
     up into place inside it. */
  useGSAP(
    () => {
      const el = panel.current;
      const btn = trigger.current;
      if (!el || !btn) return;
      if (!opened.current && !open) return; // nothing to close on first render
      opened.current = true;

      const b = btn.getBoundingClientRect();
      const p = el.getBoundingClientRect();
      const at = `${b.left + b.width / 2 - p.left}px ${b.top + b.height / 2 - p.top}px`;
      const reach = Math.hypot(p.width, p.height) + 40;

      if (reduceMotion()) {
        gsap.set(el, { autoAlpha: open ? 1 : 0, clipPath: "none" });
      } else if (open) {
        const q = gsap.utils.selector(el);
        /* Visible now, not on the timeline's first tick — the wheel is
           focused straight after this, and a hidden element can't take
           focus. The clip below still keeps it from showing early. */
        gsap.set(el, { autoAlpha: 1, clipPath: `circle(0px at ${at})` });
        gsap
          .timeline()
          .fromTo(
            el,
            { clipPath: `circle(0px at ${at})` },
            { clipPath: `circle(${reach}px at ${at})`, duration: 0.65, ease: "sweep" }
          )
          .fromTo(
            q(".accent__wheel"),
            { rotate: -140, scale: 0.35, opacity: 0 },
            { rotate: 0, scale: 1, opacity: 1, duration: 0.85, ease: "settle" },
            0.05
          )
          .fromTo(
            q(".accent__row"),
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "settle", stagger: 0.05 },
            0.22
          );
      } else {
        gsap
          .timeline()
          .to(el, { clipPath: `circle(0px at ${at})`, duration: 0.4, ease: "power2.in" })
          .set(el, { autoAlpha: 0 });
      }

      if (open) wheel.current?.focus({ preventScroll: true });
    },
    { dependencies: [open], scope: root }
  );

  /* ── Wheel ────────────────────────────────────────────────────── */
  const fromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // 0° at the top, clockwise — the way the conic gradient is laid out.
    const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const s = Math.min(1, Math.hypot(dx, dy) / (r.width / 2));
    pick({ ...latest.current, h, s });
  };

  const onWheelKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 15 : 3;
    const cur = latest.current;
    const next = { ...cur };
    if (e.key === "ArrowRight") next.h = (cur.h + step + 360) % 360;
    else if (e.key === "ArrowLeft") next.h = (cur.h - step + 360) % 360;
    else if (e.key === "ArrowUp") next.s = Math.min(1, cur.s + step / 100);
    else if (e.key === "ArrowDown") next.s = Math.max(0, cur.s - step / 100);
    else return;
    e.preventDefault();
    pick(next);
  };

  const rad = (hsv.h * Math.PI) / 180;
  const handle: CSSProperties = {
    left: `${50 + 50 * hsv.s * Math.sin(rad)}%`,
    top: `${50 - 50 * hsv.s * Math.cos(rad)}%`,
  };

  const commitDraft = () => {
    if (draft !== null && isHex(draft)) choose(normalizeHex(draft));
    setDraft(null);
  };

  return (
    <div ref={root} className="accent">
      <button
        ref={trigger}
        type="button"
        className="accent__trigger"
        aria-expanded={open}
        aria-controls="accent-panel"
        aria-label={`Accent colour, currently ${accent}. Change it`}
        title="Change the accent colour"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="accent__ring" aria-hidden="true" />
        <span className="accent__dot" aria-hidden="true" />
      </button>

      <div
        id="accent-panel"
        ref={panel}
        className="accent__panel"
        role="dialog"
        aria-label="Accent colour"
        inert={!open}
      >
        <div className="accent__row accent__head">
          <p className="accent__title">Accent colour</p>
          <button
            type="button"
            className="accent__reset"
            onClick={() => choose(DEFAULT_ACCENT)}
            disabled={accent === DEFAULT_ACCENT}
          >
            Reset
          </button>
        </div>

        <div
          ref={wheel}
          className="accent__wheel"
          style={{ "--v": hsv.v } as CSSProperties}
          tabIndex={0}
          role="slider"
          aria-label="Hue and saturation. Left and right change the hue, up and down the saturation."
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hsv.h)}
          aria-valuetext={`Hue ${Math.round(hsv.h)} degrees, saturation ${Math.round(hsv.s * 100)} percent`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
          }}
          onKeyDown={onWheelKey}
        >
          <span className="accent__handle" style={handle} aria-hidden="true" />
        </div>

        <label className="accent__row accent__slider">
          <span>Brightness</span>
          <input
            type="range"
            min={MIN_V * 100}
            max={100}
            value={Math.round(hsv.v * 100)}
            onChange={(e) => pick({ ...latest.current, v: Number(e.target.value) / 100 })}
            style={
              {
                "--from": hsvToHex({ ...hsv, v: MIN_V }),
                "--to": hsvToHex({ ...hsv, v: 1 }),
              } as CSSProperties
            }
          />
        </label>

        <div className="accent__row accent__presets" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button
              key={p.hex}
              type="button"
              className="accent__preset"
              style={{ "--c": p.hex } as CSSProperties}
              aria-label={p.name}
              aria-pressed={accent === p.hex}
              title={p.name}
              onClick={() => choose(p.hex)}
            />
          ))}
        </div>

        <label className="accent__row accent__hex">
          <span className="accent__chip" aria-hidden="true" />
          <span className="accent__hex-label">Hex</span>
          <input
            value={draft ?? accent.toUpperCase()}
            spellCheck={false}
            maxLength={7}
            size={7}
            aria-invalid={draft !== null && !isHex(draft)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitDraft();
              if (e.key === "Escape") setDraft(null);
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default AccentPicker;
