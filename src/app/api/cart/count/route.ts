import { NextResponse } from "next/server";
import { hasShopifyCredentials } from "@/lib/env";
import { getCart } from "@/lib/shopify/cart";

/**
 * Cart count endpoint.
 *
 * The header is static and cannot read the httpOnly cart cookie, so
 * the badge is a client island that reads through here. Shopify's
 * token never leaves the server, and a failure resolves to zero
 * rather than breaking the header.
 */
export async function GET() {
  if (!hasShopifyCredentials()) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const cart = await getCart();
    return NextResponse.json({ count: cart?.totalQuantity ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
