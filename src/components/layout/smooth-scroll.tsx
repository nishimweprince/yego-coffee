"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Momentum scrolling for the whole site (§108.6).
 *
 * Lenis eases wheel and trackpad input into the page's own native
 * scroll — sticky headers, the scroll reveal and ChromeScroll all keep
 * reading `window.scrollY` as they always have. Touch is left to the
 * device, whose own scrolling is already smooth and which people
 * expect to behave like every other page on their phone.
 *
 * Off entirely for anyone who asked for less motion. While a dialog
 * has locked the page (the cart drawer and the image viewer set
 * `overflow: hidden` on <body>), wheel input is passed through rather
 * than scrolling the page behind it; anything scrollable inside a
 * dialog or panel scrolls natively.
 *
 * In-page anchor links glide too, landing below the sticky header.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      // Fast start, long settle — the same curve as the scroll reveal.
      easing: (t) => 1 - Math.pow(1 - t, 3),
      anchors: { offset: -96 },
      allowNestedScroll: true,
      prevent: (node) =>
        Boolean(node.closest('[role="dialog"], [data-lenis-prevent]')),
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });

    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // A new page has new content: let Lenis re-measure it, and drop any
  // glide still running from the last page so it cannot drag the new
  // one away from where the router put it (the top, or the restored
  // position on Back).
  useEffect(() => {
    const lenis = window.__lenis;
    if (!lenis) return;
    lenis.resize();
    if (lenis.isScrolling) {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    }
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
