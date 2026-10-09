import Link from "next/link";
import { ProductMedia } from "@/components/commerce/product-media";
import { PriceRange } from "@/components/commerce/product-price";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * "How do you take your coffee?" — the coffees.
 *
 * This is the whole lineup, once: three coffees, three cards. Each is
 * a shopping aid, not a taxonomy — the flavour a visitor recognises,
 * then the coffee's real name and its price on one line. The roast
 * label is gone; "Dark" under "Dark Roast" said nothing (§107). A card
 * is one hover target: the photo leans in and the flavour name turns
 * roast, the same move as the shop's cards.
 *
 * The shipping answer sits under the prices, because "what will
 * delivery cost me" is the question that stops a first order. It is
 * the store's own sentence, linked to the full policy — and the one
 * Yego line on this page.
 *
 * **A Server Component.** Nothing here hydrates.
 */
export function DiscoveryCards({
  products,
  shipping,
}: {
  products: ProductCardModel[];
  shipping: Reassurance | null;
}) {
  const byHandle = new Map(products.map((product) => [product.handle, product]));

  return (
    <section
      aria-labelledby="discovery-heading"
      className="px-page-x py-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="discovery-heading"
          className="max-w-[18ch] text-display-l"
        >
          {HOME.discovery.heading}
        </h2>

        <ul className="mt-section-sm grid gap-x-6 gap-y-stack-lg sm:grid-cols-3">
          {HOME.discovery.cards.map((card) => {
            const product = byHandle.get(card.productHandle);
            // A coffee missing from the collection is not offered.
            if (!product) return null;

            return (
              <li key={card.label}>
                <Link
                  href={`/products/${card.productHandle}`}
                  className="group block"
                >
                  <span className="block overflow-hidden rounded-sm">
                    <ProductMedia
                      image={product.featuredImage}
                      title={product.title}
                      zoomOnHover
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="bg-surface-elevated"
                    />
                  </span>

                  <span className="mt-stack-md block text-h3 transition-colors group-hover:text-accent">
                    {card.label}
                  </span>
                  <span className="mt-stack-xs flex items-baseline justify-between gap-3 text-body-s text-muted-foreground">
                    {product.title}
                    <PriceRange min={product.minPrice} max={product.maxPrice} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <YegoLine reassurance={shipping} className="mt-section-md" />
      </div>
    </section>
  );
}
