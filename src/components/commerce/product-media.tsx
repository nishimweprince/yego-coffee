import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/lib/shopify/types";

/**
 * Alt text falls back to the product title rather than an empty string:
 * these images carry product identity, so a screen reader needs to know
 * which coffee it is looking at (§35).
 */
export function ProductMedia({
  image,
  title,
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
  className,
  zoomOnHover = false,
}: {
  image: ShopifyImage | null;
  title: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Lean into the product photo on hover. Product pages only —
   * cards stay still so grids do not shimmer as the pointer crosses. */
  zoomOnHover?: boolean;
}) {
  if (!image) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center bg-muted",
          className,
        )}
      >
        <span className="label text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden",
        zoomOnHover && "group/zoom",
        className,
      )}
    >
      <Image
        src={image.url}
        alt={image.altText ?? title}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          zoomOnHover &&
            "transition-transform duration-500 ease-(--ease-brand) group-hover/zoom:scale-105",
        )}
      />
    </div>
  );
}
