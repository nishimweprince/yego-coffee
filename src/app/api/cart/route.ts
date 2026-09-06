import { NextResponse } from "next/server";
import { hasShopifyCredentials } from "@/lib/env";
import { getCart } from "@/lib/shopify/cart";

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
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await getCart();
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ cart: null }, { status: 200 });
  }
}
