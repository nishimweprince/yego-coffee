import { cn } from "@/lib/utils";

/**
 * The contour rule — this identity's signature device (plan.md §17.1).
 *
 * Rwanda is the land of a thousand hills, and Yego's coffee grows on
 * terraced hillsides where altitude is a real quality signal in the
 * cup. Section boundaries are drawn as topographic contours — two
 * unequal strokes — rather than a single hairline.
 *
 * `label` must carry something true: a place, a section name, a real
 * count. It is deliberately not a slot for invented sequence numbers
 * (§93.5) — and not a slot for a decorative eyebrow either. If the
 * heading below already says it, the rule goes unlabelled.
 *
 * `align` says what the label is doing. A label that *heads* the
 * content below it leads ("start"); a label that signs off a block —
 * the footer's location, a page's count — trails ("end"). Trailing
 * labels above a section put the words a full container away from
 * what they name, which is why this is a choice rather than a
 * constant.
 */
export function Contour({
  label,
  align = "start",
  className,
}: {
  label?: string;
  align?: "start" | "end";
  className?: string;
}) {
  return (
    <div className={cn("contour", className)} role="presentation">
      {label && align === "start" ? (
        <span className="contour__label">{label}</span>
      ) : null}
      <div className="contour__lines" />
      {label && align === "end" ? (
        <span className="contour__label">{label}</span>
      ) : null}
    </div>
  );
}
