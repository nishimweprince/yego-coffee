import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/commerce/product-grid";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection } from "@/lib/shopify/storefront";

/**
 * Any Shopify collection by handle (plan.md §6).
 *
 * This is also the landing point for the store's existing
 * /collections/* URLs, which §43 Phase 2 has to preserve through the
 * migration rather than break.
 */
export async function generateMetadata({
  params,
}: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (!hasShopifyCredentials()) return { title: "Collection" };

  const collection = await getCollection(handle, 1);
  return {
    title: collection?.title ?? "Collection",
    description: collection?.description || undefined,
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[handle]">) {
  const { handle } = await params;

  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const collection = await getCollection(handle);
  if (!collection) notFound();

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

        <Contour
          label={`${collection.products.length} ${
            collection.products.length === 1 ? "item" : "items"
          }`}
          className="mt-stack-lg"
        />

        <div className="mt-section-sm">
          <ProductGrid products={collection.products} />
        </div>
      </div>
    </main>
  );
}
