import { ProductGridSkeleton } from "@/components/commerce/product-grid-skeleton";

/**
 * The route-level loading state (plan.md §38).
 *
 * Skeleton cards shaped like the catalogue grids, so navigating
 * between shop, search and collections holds its frame instead of
 * flashing an empty page. Labelled for assistive technology; the
 * pulse stills under `prefers-reduced-motion` (globals.css).
 */
export default function Loading() {
  return (
    <main className="px-page-x py-section-md" aria-busy="true">
      <div className="mx-auto max-w-6xl">
        <span className="sr-only">Loading</span>
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
