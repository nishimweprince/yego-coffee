import { cn } from "@/lib/utils";

/**
 * The contour rule — this identity's signature device (plan.md §17.1).
 *
 * Rwanda is the land of a thousand hills, and Yego's coffee grows on
 * terraced hillsides where altitude is a real quality signal in the
 * cup. Section boundaries are drawn as topographic contours — two
 * unequal strokes — rather than a single hairline.
 *
 * `label` must carry something true: a section name, or a real
 * altitude on product pages. It is deliberately not a slot for
 * invented sequence numbers (§93.5 — no fabricated product detail).
 */
export function Contour({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("contour", className)} role="presentation">
      <div className="contour__lines" />
      {label ? <span className="contour__label">{label}</span> : null}
    </div>
  );
}
