"use client";

import { useEffect } from "react";

/**
 * Brings the header back once the film hero is behind you.
 *
 * On a page with a full-screen video hero the chrome floats over the
 * footage, unreadable against a light page and out of the way of the
 * picture. The moment the hero scrolls past, wayfinding matters more
 * than the effect, so the bar returns fixed and solid.
 *
 * Renders nothing. It sets one attribute and the stylesheet does the
 * rest, which keeps the header itself a Server Component.
 */
export function ChromeScroll() {
  useEffect(() => {
    // The hero section itself, not the <main> that carries the flag —
    // measuring <main> would put the threshold at 85% of the whole
    // page and the bar would never come back.
    const hero = document.querySelector<HTMLElement>(
      'main[data-hero="video"] > section:first-of-type',
    );
    if (!hero) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      // A little before the hero's bottom edge, so the bar has landed
      // by the time the next section is being read.
      const past = window.scrollY > hero.offsetHeight * 0.85;
      if (past) root.setAttribute("data-chrome-solid", "");
      else root.removeAttribute("data-chrome-solid");
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.removeAttribute("data-chrome-solid");
    };
  }, []);

  return null;
}
