"use client";

import { useEffect } from "react";

/** Shown once its top is 8% above the bottom of the viewport. */
const FOLD = 0.92;

/** Measured from shop.starbucks.com (docs/starbucks-parity.md). */
const DURATION_MS = 600;
const STAGGER_MS = 75;
const EASING = "cubic-bezier(0, 0, 0.3, 1)";

const KEYFRAMES: Keyframe[] = [
  { opacity: 0.01, transform: "translateY(20px)" },
  { opacity: 1, transform: "none" },
];

/**
 * The scroll reveal's one island (§108.5).
 *
 * Any element marked `data-reveal` slides up and fades in the first
 * time its top reaches the fold — or passes it: an element the visitor
 * jumped past (a fast scroll, an anchor link, a restored scroll
 * position) is shown too, so nothing is ever left hidden above them. `--reveal-order` staggers it 75ms per
 * step. The stylesheet holds marked elements at their start state;
 * this plays the entrance with the Web Animations API and keeps its
 * end state. It deliberately changes no attribute on the element: the
 * elements are server-rendered, and an attribute added before React
 * hydrates a streamed segment is a hydration mismatch.
 *
 * Elements that arrive later, on a client-side navigation or once a
 * Suspense boundary resolves, are picked up by a MutationObserver.
 * Nothing is ever hidden without this running: the boot script in the
 * root layout sets `data-reveal-ready`, and if the observer cannot
 * start, that flag is removed and everything shows at once.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const seen = new WeakSet<Element>();

    if (
      typeof Element.prototype.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.removeAttribute("data-reveal-ready");
      return;
    }

    const play = (el: Element) => {
      const order =
        Number.parseFloat(
          getComputedStyle(el).getPropertyValue("--reveal-order"),
        ) || 0;
      el.animate(KEYFRAMES, {
        duration: DURATION_MS,
        delay: order * STAGGER_MS,
        easing: EASING,
        fill: "forwards",
      });
    };

    // Waiting to be shown. A position check on scroll rather than an
    // IntersectionObserver: the observer only reports crossings, so an
    // element scrolled straight past never fires and would stay hidden.
    const pending = new Set<Element>();
    let frame = 0;

    const check = () => {
      frame = 0;
      const fold = window.innerHeight * FOLD;
      for (const el of pending) {
        // Still inside a hidden streaming container: not laid out yet.
        if (el.getClientRects().length === 0) continue;
        if (el.getBoundingClientRect().top > fold) continue;
        pending.delete(el);
        play(el);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };

    const observe = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      pending.add(el);
    };

    const watch = (scope: ParentNode) =>
      scope.querySelectorAll("[data-reveal]").forEach(observe);

    watch(document);
    check();
    root.setAttribute("data-reveal-observing", "");

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]")) observe(node);
          watch(node);
        });
      }
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

/**
 * Runs before first paint, from the root layout's <head>. It marks the
 * document so the stylesheet may hide `[data-reveal]` elements, and
 * arms a fallback: if the observer has not started within two
 * seconds — a failed bundle, a blocked script — everything is shown.
 */
export const REVEAL_BOOT_SCRIPT = `(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('data-reveal-ready','');setTimeout(function(){if(!d.hasAttribute('data-reveal-observing'))d.removeAttribute('data-reveal-ready')},2000)})();`;
