import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { ProductMedia } from "@/components/commerce/product-media";
import { PriceRange } from "@/components/commerce/product-price";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { ROAST_LABELS, roastsOf } from "@/lib/catalog/facets";
import type { Reassurance } from "@/lib/content/reassurance";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * "How do you take your coffee?" — the coffees.
 *
 * This is the whole lineup, once. Each card is a shopping aid, not a
 * taxonomy: the flavour a visitor recognises, then the coffee's real
 * name, its roast, and its price. A card either leads to the coffee it
 * describes, or opens the quiz with that preference already answered
 * (the quiz reads `?flavour=`).
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

        <ul className="mt-section-sm grid gap-x-6 gap-y-stack-lg sm:grid-cols-2 lg:grid-cols-4">
          {HOME.discovery.cards.map((card) => {
            const href = card.productHandle
              ? `/products/${card.productHandle}`
              : `/quiz?flavour=${card.quizAnswer}`;
            const product = card.productHandle
              ? (byHandle.get(card.productHandle) ?? null)
              : null;
            const roasts = product ? roastsOf(product) : [];

            return (
              <li key={card.label}>
                <Link href={href} className="group block">
                  {product ? (
                    <span className="block overflow-hidden rounded-sm">
                      <ProductMedia
                        image={product.featuredImage}
                        title={product.title}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="bg-surface-elevated"
                      />
                    </span>
                  ) : (
                    // Outlined rather than filled: three real packshots
                    // beside a flat grey rectangle read as a photograph
                    // that failed to load. This one is plainly a
                    // control, not a picture.
                    <span className="flex aspect-square flex-col items-center justify-center gap-stack-sm rounded-sm border border-border transition-colors group-hover:border-foreground">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        aria-hidden
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <span className="label text-muted-foreground">
                        Take the quiz
                      </span>
                    </span>
                  )}

                  <span className="mt-stack-md block text-h3 transition-colors group-hover:text-accent">
                    {card.label}
                  </span>

                  {product ? (
                    <>
                      <span className="mt-stack-xs block text-body-s text-muted-foreground">
                        {product.title}
                      </span>
                      <span className="mt-stack-sm flex items-baseline justify-between gap-3">
                        {roasts.length > 0 ? (
                          <span className="label text-muted-foreground">
                            {roasts.map((r) => ROAST_LABELS[r]).join(" · ")}
                          </span>
                        ) : (
                          <span />
                        )}
                        <PriceRange
                          min={product.minPrice}
                          max={product.maxPrice}
                        />
                      </span>
                    </>
                  ) : (
                    <span className="mt-stack-xs block text-body-s text-muted-foreground">
                      Answer a few questions and we will match you
                    </span>
                  )}
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
