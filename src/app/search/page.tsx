import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/commerce/product-grid";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getSearchResults } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

/**
 * Full search (plan.md §14.2). Dynamic by nature — the query is the
 * page — so it is not cached beyond the short window in the data layer.
 */
export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const results = query
    ? await getSearchResults(query)
    : { products: [], totalCount: 0, hasNextPage: false, endCursor: null };

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-display-l">
          {query ? <>Results for “{query}”</> : "Search"}
        </h1>

        {!query ? (
          <p className="mt-stack-md text-body-l text-muted-foreground">
            Search from the header, or press{" "}
            <kbd className="border border-border px-1.5 py-0.5 text-body-s">
              /
            </kbd>{" "}
            anywhere.
          </p>
        ) : (
          <>
            <Contour
              label={`${results.totalCount} ${
                results.totalCount === 1 ? "result" : "results"
              }`}
              className="mt-stack-lg"
            />

            {results.products.length === 0 ? (
              /* §48's empty state: say what to do next, not just that
                 there is nothing here. */
              <div className="mt-section-sm">
                <p className="text-body-l">Nothing matched that search.</p>
                <p className="mt-stack-sm text-body-m text-muted-foreground">
                  Yego roasts a small lineup: three coffees and a 5 lb bag.
                </p>
                <Link
                  href="/shop"
                  className="mt-stack-md inline-block text-body-m text-accent underline-offset-4 hover:underline"
                >
                  See everything
                </Link>
              </div>
            ) : (
              <div className="mt-section-sm">
                <ProductGrid products={results.products} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
