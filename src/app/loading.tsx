import { Contour } from "@/components/ui/contour";

/**
 * The route-level loading state (plan.md §38).
 *
 * Deliberately quiet: a skeleton that imitates the page it is
 * replacing produces a double layout shift when the real content
 * arrives at a different size, which costs the CLS budget in §36. A
 * held frame with the section rule is honest about waiting.
 */
export default function Loading() {
  return (
    <main className="px-page-x py-section-md" aria-busy="true">
      <div className="mx-auto max-w-6xl">
        <Contour label="Loading" />
        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}
