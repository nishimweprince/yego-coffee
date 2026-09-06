import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { ProductMedia } from "@/components/commerce/product-media";
import { HOME } from "@/content/home";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * §90.02 — "How do you take your coffee?"
 *
 * §8.2's point is that this section is a conversion input, not a
 * decoration: a card either leads to the coffee it describes, or opens
 * the quiz with that preference already answered (the quiz reads
 * `?flavour=` on arrival). Each coffee card shows its real Shopify
 * packshot; the quiz card gets an icon instead of a borrowed photo.
 *
 * **A Server Component.** Hover states are `:hover` / `:focus-within`
 * in CSS — §36 is explicit, do not hydrate static editorial content.
 */
export function DiscoveryCards({
  products,
}: {
  products: ProductCardModel[];
}) {
  const byHandle = new Map(products.map((product) => [product.handle, product]));

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {HOME.discovery.cards.map((card) => {
        const href = card.productHandle
          ? `/products/${card.productHandle}`
          : `/quiz?flavour=${card.quizAnswer}`;
        const product = card.productHandle
          ? (byHandle.get(card.productHandle) ?? null)
          : null;

        return (
          <li
            key={card.label}
            className="group rounded-md bg-surface-elevated transition-all duration-200 ease-(--ease-brand) hover:-translate-y-px hover:shadow-md"
          >
            <Link
              href={href}
              className="flex min-h-56 flex-col justify-between gap-stack-md p-stack-lg"
            >
              {product ? (
                <ProductMedia
                  image={product.featuredImage}
                  title={product.title}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="rounded-sm bg-background"
                />
              ) : (
                <span className="flex aspect-square items-center justify-center rounded-sm bg-background">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    aria-hidden
                    className="h-6 w-6 text-accent"
                  />
                </span>
              )}
              <span>
                <span className="label text-muted-foreground transition-colors group-hover:text-accent group-focus-within:text-accent">
                  {card.productHandle ? "Coffee" : "Quiz"}
                </span>
                <span className="mt-stack-xs block font-display text-h2">
                  {card.label}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
