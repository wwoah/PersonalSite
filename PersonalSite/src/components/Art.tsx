import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { useAccent } from "../theme/accent";
import { resolveArt } from "../theme/art";

/**
 * An <img> that follows the accent colour when its src is one of the
 * site's illustrations ("art:…"), and is a plain <img> otherwise.
 *
 * The page's CSS recolours on every frame of a drag across the wheel;
 * the illustrations wait until the colour has settled for a moment.
 * Re-decoding nine SVGs per pointer move would stutter, and a picture
 * catching up a beat later reads as a nice ripple anyway.
 */
function Art({ src, alt = "", ...img }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const accent = useAccent();
  const [settled, setSettled] = useState(accent);

  useEffect(() => {
    const t = window.setTimeout(() => setSettled(accent), 160);
    return () => window.clearTimeout(t);
  }, [accent]);

  return <img src={resolveArt(src, settled)} alt={alt} {...img} />;
}

export default Art;
