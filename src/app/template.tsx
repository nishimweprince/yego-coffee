import { ViewTransition } from "react";

/**
 * The route transition: a crossfade (§108.6).
 *
 * A template remounts whenever the first path segment changes, which
 * is every move between the site's pages. Wrapping its children in a
 * `ViewTransition` lets the page being left fade quickly and the page
 * arriving fade in after it; the classes are drawn in globals.css.
 *
 * Opacity only. The arriving page's titles and cards rise on their
 * own through the scroll reveal, so a moving page transition on top
 * would rise everything twice. `default="none"` keeps the wrapper
 * still during Suspense reveals and refreshes, where a fade would read
 * as a glitch.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-arrive" exit="page-leave" default="none">
      {children}
    </ViewTransition>
  );
}
