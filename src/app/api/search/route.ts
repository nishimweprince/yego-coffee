import { NextResponse } from "next/server";
import { hasShopifyCredentials } from "@/lib/env";
import { getPredictiveSearch } from "@/lib/shopify/storefront";

/**
 * Predictive search endpoint (plan.md §6, §14.1).
 *
 * The search panel is a client island and cannot import the
 * `server-only` Storefront client, so it reads through here. Shopify's
 * token never leaves the server.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (!query || !hasShopifyCredentials()) {
    return NextResponse.json({ products: [], suggestions: [] });
  }

  try {
    const results = await getPredictiveSearch(query);
    return NextResponse.json(results);
  } catch {
    // A failed suggestion lookup must never break the page the panel is
    // open on top of. The panel shows its empty state instead.
    return NextResponse.json(
      { products: [], suggestions: [] },
      { status: 200 },
    );
  }
}
