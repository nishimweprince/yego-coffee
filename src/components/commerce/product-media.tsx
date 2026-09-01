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
}: {
  image: ShopifyImage | null;
  title: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
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
    <div className={cn("relative aspect-square overflow-hidden", className)}>
      <Image
        src={image.url}
        alt={image.altText ?? title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
