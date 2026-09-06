import { NextResponse } from "next/server";
import { hasShopifyCredentials } from "@/lib/env";
import { getCart } from "@/lib/shopify/cart";
import { getReassurances } from "@/lib/content/reassurance";

/**
 * The cart, for the drawer.
 *
 * Same reasoning as the count endpoint next door: the header is a
 * static Server Component and cannot read the httpOnly cart cookie, so
 * the drawer reads through here. Shopify's token never leaves the
 * server. A failure resolves to an empty cart rather than breaking the
 * header — /cart remains the full, server-rendered fallback.
 */
export async function GET() {
  if (!hasShopifyCredentials()) {
    return NextResponse.json({ cart: null, shipping: null });
  }

  try {
    // The drawer is a client island and cannot read the store's policy
    // documents itself, so the free-shipping threshold travels with the
    // cart it applies to.
    const [cart, reassurances] = await Promise.all([
      getCart(),
      getReassurances(),
    ]);
    return NextResponse.json({ cart, shipping: reassurances.shipping });
  } catch {
    return NextResponse.json({ cart: null, shipping: null }, { status: 200 });
  }
}
