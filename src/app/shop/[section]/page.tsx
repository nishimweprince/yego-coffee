import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/commerce/product-grid";
import { RoastFilter } from "@/components/commerce/roast-filter";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { Contour } from "@/components/ui/contour";
import { SHOP_SECTIONS } from "@/lib/catalog/collections";
import {
  availableRoasts,
  filterByRoast,
  parseRoastParam,
} from "@/lib/catalog/facets";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection } from "@/lib/shopify/storefront";

/** /shop/coffee and /shop/merch (plan.md §6). */

export function generateStaticParams() {
  return SHOP_SECTIONS.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[section]">): Promise<Metadata> {
  const { section: slug } = await params;
  const section = SHOP_SECTIONS.find((s) => s.slug === slug);
  return { title: section?.label ?? "Shop" };
}

export default async function ShopSectionPage({
  params,
  searchParams,
}: PageProps<"/shop/[section]">) {
  const { section: slug } = await params;
  const section = SHOP_SECTIONS.find((s) => s.slug === slug);
  if (!section) notFound();

  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const { roast } = await searchParams;
  const selected = parseRoastParam(roast);
  const collection = await getCollection(section.collectionHandle);
  if (!collection) notFound();

  const visible = filterByRoast(collection.products, selected);
  const roasts = availableRoasts(collection.products);

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb">
          <Link
            href="/shop"
            className="label text-muted-foreground hover:text-foreground"
          >
            Shop
          </Link>
        </nav>
        <h1 className="mt-stack-sm text-display-l">{collection.title}</h1>
        {collection.description ? (
          <p className="mt-stack-md max-w-prose text-body-l text-muted-foreground">
            {collection.description}
          </p>
        ) : null}

        <div className="mt-section-sm">
          <RoastFilter options={roasts} selected={selected} />
        </div>

        <Contour
          label={`${visible.length} of ${collection.products.length}`}
          className="mt-stack-lg"
        />

        {visible.length === 0 ? (
          <div className="mt-section-sm">
            <p className="text-body-l">Nothing matches that roast.</p>
            <Link
              href={`/shop/${section.slug}`}
              className="mt-stack-sm inline-block text-body-m text-accent underline-offset-4 hover:underline"
            >
              Clear the filter
            </Link>
          </div>
        ) : (
          <div className="mt-section-sm">
            <ProductGrid products={visible} />
          </div>
        )}
      </div>
    </main>
  );
}
