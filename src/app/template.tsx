import { ViewTransition } from "react";

/**
 * The route transition — one motion idea, reused.
 *
 * A template remounts whenever the first path segment changes, which
 * is every move between the site's pages (home → shop, shop → a
 * product, anywhere → the café). Wrapping its children in a
 * `ViewTransition` gives each such move an exit for the page being
 * left and an enter for the page arriving; the classes are drawn in
 * globals.css.
 *
 * The move is the hero's: the old page fades quickly, the new one
 * rises the same half-line the headline rises on load. No slides, no
 * direction — this site's navigation is flat, so left and right would
 * encode nothing true. `default="none"` keeps the wrapper still during
 * Suspense reveals and refreshes, where a fade would read as a glitch.
 *
 * Moves within one segment (product → related product, shop → shop/
 * coffee) swap instantly; that is fine, they are the same place.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-arrive" exit="page-leave" default="none">
      {children}
    </ViewTransition>
  );
}
