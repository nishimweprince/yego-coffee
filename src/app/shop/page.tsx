import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/commerce/product-grid";
import { RoastFilter } from "@/components/commerce/roast-filter";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { SHOP_SECTIONS } from "@/lib/catalog/collections";
import {
  availableRoasts,
  filterByRoast,
  parseRoastParam,
} from "@/lib/catalog/facets";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Shop",
  description: "Rwandan coffee, roasted in Somerville, Massachusetts.",
};

/**
 * The shop (plan.md §12.1, right-sized by §93.3).
 *
 * Scoped to Shopify's own collections rather than every published
 * product. The store still models subscriptions as eight duplicate
 * products (§92.1); listing them here would show the same three
 * coffees four times over and read as a catalogue of thirteen.
 */
export default async function ShopPage({
  searchParams,
}: PageProps<"/shop">) {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const { roast } = await searchParams;
  const selected = parseRoastParam(roast);

  const [coffee, merch] = await Promise.all([
    getCollection(SHOP_SECTIONS[0].collectionHandle),
    getCollection(SHOP_SECTIONS[1].collectionHandle),
  ]);

  const coffees = coffee?.products ?? [];
  const visible = filterByRoast(coffees, selected);
  const roasts = availableRoasts(coffees);

  const filtered = selected.length > 0;

  return (
    <main>
      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-6xl">
          <h1 className="type-display text-display-l">Coffee</h1>
          <p className="mt-stack-md max-w-prose text-lede text-muted-foreground">
            Grown in Rwanda. Roasted in Somerville.
          </p>

          <div className="mt-section-sm flex flex-wrap items-center justify-between gap-stack-md">
            <RoastFilter options={roasts} selected={selected} />
            {/* A count that never changes is noise. It appears when a
                filter is hiding something, which is the only moment it
                tells the reader anything. */}
            {filtered ? (
              <p className="label text-muted-foreground">
                {`${visible.length} of ${coffees.length}`}
              </p>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <div className="mt-section-sm">
              <p className="text-lede">No coffee matches that roast.</p>
              <Link
                href="/shop"
                className="mt-stack-md inline-block text-body-m text-accent underline-offset-4 hover:underline"
              >
                Show every coffee
              </Link>
            </div>
          ) : (
            <div className="mt-section-sm">
              <ProductGrid products={visible} />
            </div>
          )}
        </div>
      </section>

      {merch && merch.products.length > 0 ? (
        <section
          aria-labelledby="merch-heading"
          data-surface="wash"
          className="px-page-x py-section-md"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="merch-heading" className="type-display text-display-l">
              Merch
            </h2>
            <div className="mt-section-sm">
              <ProductGrid products={merch.products} priorityCount={0} />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
