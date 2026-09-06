"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero's background film.
 *
 * A client island for one reason: motion preference. CSS can hide a
 * video but it cannot stop one playing, and `prefers-reduced-motion`
 * is a request not to animate, not a request to animate invisibly. So
 * the element is only created when motion is welcome; otherwise the
 * poster photograph the server already rendered is the whole hero, and
 * nothing downloads.
 *
 * The poster sits underneath as a real <Image> rather than the video's
 * `poster` attribute, so it is the LCP element, it is responsive, and
 * it still carries the hero when the browser cannot decode the file.
 * The film fades in over it once it has enough frames to play.
 */
export function HeroVideo({ src, className }: { src: string; className?: string }) {
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAllowed(!query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Autoplay can still be refused (a data saver, a battery setting, a
  // browser policy). Nothing is done about it on purpose: the poster
  // is already the hero, so a refusal degrades to a still frame.
  useEffect(() => {
    if (!allowed) return;
    const element = video.current;
    if (!element) return;
    const onReady = () => setReady(true);
    element.addEventListener("canplay", onReady);
    if (element.readyState >= 3) setReady(true);
    return () => element.removeEventListener("canplay", onReady);
  }, [allowed]);

  if (!allowed) return null;

  return (
    <video
      ref={video}
      // Decorative: the headline carries the meaning, and the poster
      // beneath it carries the picture.
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={`${className ?? ""} transition-opacity duration-700 ease-(--ease-brand) ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <source src={src} type="video/webm" />
    </video>
  );
}
