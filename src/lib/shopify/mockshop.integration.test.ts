import { describe, expect, it } from "vitest";
import { mapCart } from "./mappers/cart";
import { mapProductToCard, mapProductToDetail } from "./mappers/product";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries/products";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_QUERY,
} from "./queries/cart";
import type { ApiCart, ApiProduct, ApiProductDetail } from "./types.api";

/**
 * Executes this project's real query documents against mock.shop —
 * Shopify's own public Storefront API endpoint, which needs no token.
 *
 * This is a genuine HTTP round-trip to a Shopify-operated service
 * implementing the real Storefront API, so it proves more than either
 * the schema check (§95.10, a static file) or the local fixture server
 * (§95.12, my own code): the documents are accepted and executed by
 * Shopify's own resolver, and the mappers handle the shapes it returns.
 *
 * It is still NOT Yego's store. It cannot validate credentials, this
 * shop's catalogue, its selling plans, or its checkout totals — only
 * §95.5 can. mock.shop also implements a subset of the API, so a
 * failure here may mean "unsupported by mock.shop" rather than "wrong".
 */

const ENDPOINT = "https://mock.shop/api";
const TIMEOUT = 45_000;

// The only network-dependent test in the suite. Set SKIP_NETWORK_TESTS=1
// where the network is unavailable or CI should not depend on a third
// party being up.
const offline = process.env.SKIP_NETWORK_TESTS === "1";

async function run<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  expect(response.ok).toBe(true);
  return (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
}

describe.skipIf(offline)("documents execute against Shopify's mock.shop", () => {
  let handle: string | null = null;
  let variantId: string | null = null;
  let cartId: string | null = null;

  it("Products executes and maps", async () => {
    const result = await run<{ products: { edges: Array<{ node: ApiProduct }> } }>(
      PRODUCTS_QUERY,
      { first: 5 },
    );
    expect(result.errors ?? []).toEqual([]);

    const cards = (result.data?.products.edges ?? []).map((e) =>
      mapProductToCard(e.node),
    );
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) {
      expect(c.handle).toBeTruthy();
      expect(c.minPrice.currencyCode).toBeTruthy();
      expect(Number.isFinite(Number.parseFloat(c.minPrice.amount))).toBe(true);
    }
    handle = cards[0].handle;
  }, TIMEOUT);

  it("ProductByHandle executes and maps, including variants and options", async () => {
    expect(handle).toBeTruthy();
    const result = await run<{ product: ApiProductDetail | null }>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle },
    );
    expect(result.errors ?? []).toEqual([]);
    expect(result.data?.product).toBeTruthy();

    const detail = mapProductToDetail(result.data!.product as ApiProductDetail);
    expect(detail.variants.length).toBeGreaterThan(0);
    expect(detail.options.length).toBeGreaterThan(0);
    variantId = detail.variants.find((v) => v.availableForSale)?.id ?? null;
  }, TIMEOUT);

  it("CartCreate executes and maps", async () => {
    expect(variantId).toBeTruthy();
    const result = await run<{
      cartCreate: { cart: ApiCart | null; userErrors: Array<{ message: string }> };
    }>(CART_CREATE_MUTATION, {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });
    expect(result.errors ?? []).toEqual([]);
    expect(result.data?.cartCreate.userErrors).toEqual([]);

    const cart = mapCart(result.data!.cartCreate.cart as ApiCart);
    expect(cart.totalQuantity).toBe(1);
    expect(cart.checkoutUrl).toMatch(/^https:\/\//);
    expect(cart.lines[0].unitPrice.currencyCode).toBeTruthy();
    cartId = cart.id;
  }, TIMEOUT);

  it("CartLinesAdd executes and increments the cart", async () => {
    expect(cartId).toBeTruthy();
    const result = await run<{
      cartLinesAdd: { cart: ApiCart | null; userErrors: Array<{ message: string }> };
    }>(CART_LINES_ADD_MUTATION, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });
    expect(result.errors ?? []).toEqual([]);
    expect(result.data?.cartLinesAdd.userErrors).toEqual([]);
    expect(mapCart(result.data!.cartLinesAdd.cart as ApiCart).totalQuantity).toBe(2);
  }, TIMEOUT);

  it("Cart re-reads by id — the guarantee the cookie depends on", async () => {
    expect(cartId).toBeTruthy();
    const result = await run<{ cart: ApiCart | null }>(CART_QUERY, { id: cartId });
    expect(result.errors ?? []).toEqual([]);
    expect(result.data?.cart).toBeTruthy();

    const cart = mapCart(result.data!.cart as ApiCart);
    expect(cart.id).toBe(cartId);
    expect(cart.totalQuantity).toBe(2);
    // Shopify's own arithmetic, not ours.
    const unit = Number.parseFloat(cart.lines[0].unitPrice.amount);
    expect(Number.parseFloat(cart.subtotal.amount)).toBeCloseTo(unit * 2, 2);
  }, TIMEOUT);
});
