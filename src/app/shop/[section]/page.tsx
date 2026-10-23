import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/commerce/product-grid";
import { RoastFilter } from "@/components/commerce/roast-filter";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
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
      <Section as="div">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </Section>
    );
  }

  const { roast } = await searchParams;
  const selected = parseRoastParam(roast);
  const collection = await getCollection(section.collectionHandle);
  if (!collection) notFound();

  const visible = filterByRoast(collection.products, selected);
  const roasts = availableRoasts(collection.products);

  return (
    <main>
      <Section className="pt-section-xs">
        <PageHeader
          align="center"
          title={collection.title}
          lede={collection.description || undefined}
          breadcrumb={[{ href: "/shop", label: "Shop" }]}
        />

        <div className="mt-section-md flex flex-wrap items-center justify-between gap-stack-md">
          <RoastFilter options={roasts} selected={selected} />
          <p className="label text-muted-foreground">
            {`${visible.length} of ${collection.products.length}`}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="mt-section-sm">
            <p className="text-body-l">Nothing matches that roast.</p>
            <Link
              href={`/shop/${section.slug}`}
              className="mt-stack-sm inline-block text-body-m text-accent underline underline-offset-4 hover:text-foreground"
            >
              Clear the filter
            </Link>
          </div>
        ) : (
          <div className="mt-15">
            <ProductGrid products={visible} priorityCount={4} />
          </div>
        )}
      </Section>
    </main>
  );
}
