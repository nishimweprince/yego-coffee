import { cn } from "@/lib/utils";

/**
 * Product grid skeleton. Stands in while product data is on its way —
 * search results, route transitions — with pulsing blocks shaped like
 * the cards that will replace them, so the swap does not jump.
 * `animate-pulse` stills under `prefers-reduced-motion` (globals.css).
 */
export function ProductGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square rounded-md bg-muted" />
          <div className="mt-stack-md flex items-baseline justify-between gap-4">
            <div className="h-5 w-2/3 rounded-sm bg-muted" />
            <div className="h-5 w-1/4 rounded-sm bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
