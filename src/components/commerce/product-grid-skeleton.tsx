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
        "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[316/373] rounded-tile bg-muted" />
          <div className="mt-stack-md space-y-2">
            <div className="h-5 w-2/3 rounded-field bg-muted" />
            <div className="h-4 w-1/4 rounded-field bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
