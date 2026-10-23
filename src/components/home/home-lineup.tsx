import Link from "next/link";
import { ProductGrid } from "@/components/commerce/product-grid";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * The coffees, as a shelf (§108).
 *
 * Titles, prices and photographs are Shopify's. The shipping answer
 * sits directly under the prices it qualifies — one Yego line for the
 * one question a price raises.
 */
export function HomeLineup({
  products,
  shipping,
}: {
  products: ProductCardModel[];
  shipping: Reassurance | null;
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="home-lineup-heading" className="px-page-x py-section-sm">
      <div className="mx-auto max-w-page">
        <div className="flex flex-wrap items-baseline justify-between gap-stack-md">
          <h2 id="home-lineup-heading" data-reveal className="text-h3">
            {HOME.lineup.heading}
          </h2>
          <Link
            href={HOME.lineup.cta.href}
            className="text-body-m font-bold text-accent underline underline-offset-4 hover:text-foreground"
          >
            {HOME.lineup.cta.label}
          </Link>
        </div>

        <ProductGrid products={products} priorityCount={0} className="mt-15" />

        <YegoLine reassurance={shipping} className="mt-section-sm" />
      </div>
    </section>
  );
}
