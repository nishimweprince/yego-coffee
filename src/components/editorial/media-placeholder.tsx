import { cn } from "@/lib/utils";

/**
 * An explicit placeholder for photography that does not exist yet
 * (plan.md §67).
 *
 * §67's point is that an implementation must not become dependent on
 * temporary stock imagery, so the slot states what belongs in it —
 * crop, minimum resolution, focal point — rather than borrowing a
 * plausible-looking photograph that would then be hard to remove.
 *
 * Yego's own site has founder portraits and farm photography (§93.4);
 * those are the assets these slots are waiting for, not stock.
 */
export function MediaPlaceholder({
  spec,
  ratio,
  className,
}: {
  /** e.g. "ORIGIN STORY 3:2 — Rwandan hillside, min 2400px, focal left" */
  spec: string;
  /** CSS aspect-ratio, e.g. "3 / 2". */
  ratio: string;
  className?: string;
}) {
  return (
    <div
      role="presentation"
      style={{ aspectRatio: ratio }}
      className={cn(
        "flex items-end border border-dashed border-rule/60 bg-surface-elevated p-stack-md",
        className,
      )}
    >
      <span className="label text-muted-foreground">{spec}</span>
    </div>
  );
}
