import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/commerce/product-grid";
import { RoastFilter } from "@/components/commerce/roast-filter";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { IMAGES } from "@/content/images";
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
      <Section as="div">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </Section>
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
      <Section>
          <PageHeader
            title="Coffee"
            lede="Grown in Rwanda. Roasted in Somerville."
          />

          {/* Atmosphere, not merchandise: the bags in this photograph
              are not the products below, so it carries no link. The
              source is 1600px wide, so it is never asked to fill more
              than the 6xl container. */}
          <Image
            {...IMAGES.bagsLineup}
            alt={IMAGES.bagsLineup.alt}
            sizes="(min-width: 1152px) 1152px, 100vw"
            priority
            className="mt-section-sm aspect-[21/9] w-full rounded-sm object-cover"
          />

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
                className="mt-stack-md inline-block text-body-m text-accent underline underline-offset-4 hover:text-foreground"
              >
                Show every coffee
              </Link>
            </div>
          ) : (
            <div className="mt-section-sm">
              <ProductGrid products={visible} />
            </div>
          )}
      </Section>

      {merch && merch.products.length > 0 ? (
        <Section aria-labelledby="merch-heading" className="pt-0">
            <h2 id="merch-heading" className="text-display-l">
              Merch
            </h2>
            <div className="mt-section-sm">
              <ProductGrid products={merch.products} priorityCount={0} />
            </div>
        </Section>
      ) : null}
    </main>
  );
}
