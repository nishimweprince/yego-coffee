import { beforeAll, describe, expect, it } from "vitest";
import { mapCart } from "./mappers/cart";
import { mapProductToCard, mapProductToDetail } from "./mappers/product";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SHOP_QUERY,
} from "./queries/products";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_QUERY,
} from "./queries/cart";
import type { ApiCart, ApiProduct, ApiProductDetail } from "./types.api";

/**
 * Live Storefront verification (plan.md §95.5).
 *
 * The request sequence Phase 2 needs and could not perform without
 * credentials. Skips cleanly when they are absent, so it costs nothing
 * until a token exists and then runs automatically in CI.
 *
 * It does not import the app's client, which is `server-only` and
 * cannot load here. It reuses the same query documents and mappers, so
 * what it proves about those holds for the app.
 *
 *   pnpm verify:shopify
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const version = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ?? "";
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const configured = Boolean(domain && version && token);

const endpoint = `https://${domain}/api/${version}/graphql.json`;

async function request<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`,
    );
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }
  if (!payload.data) throw new Error("no data in response");
  return payload.data;
}

describe.skipIf(!configured)("Storefront API — live", () => {
  beforeAll(() => {
    console.log(`\nVerifying ${endpoint}\n`);
  });

  let firstHandle: string | null = null;
  let variantId: string | null = null;

  it("authenticates and resolves the shop", async () => {
    const data = await request<{
      shop: { name: string; primaryDomain: { url: string } };
    }>(SHOP_QUERY);
    console.log(`  shop: ${data.shop.name} — ${data.shop.primaryDomain.url}`);
    expect(data.shop.name).toBeTruthy();
  });

  it("maps the real catalogue through ProductCardFragment", async () => {
    const data = await request<{
      products: { edges: Array<{ node: ApiProduct }> };
    }>(PRODUCTS_QUERY, { first: 30 });

    const cards = data.products.edges.map((e) => mapProductToCard(e.node));
    for (const c of cards) {
      console.log(
        `  ${c.handle.padEnd(40)} ${c.minPrice.amount} ${c.minPrice.currencyCode}` +
          `${c.subscriptionAvailable ? "  [selling plan]" : ""}` +
          `${c.availableForSale ? "" : "  [sold out]"}`,
      );
    }

    firstHandle = cards[0]?.handle ?? null;
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) expect(c.minPrice.currencyCode).toBeTruthy();
  });

  it("maps a product through ProductDetailFragment", async () => {
    expect(firstHandle).toBeTruthy();
    const data = await request<{ product: ApiProductDetail | null }>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle: firstHandle },
    );
    expect(data.product).not.toBeNull();

    const detail = mapProductToDetail(data.product as ApiProductDetail);
    const optionNames = detail.options.map((o) => o.name);
    console.log(
      `  ${detail.handle}: ${detail.variants.length} variant(s), ` +
        `options [${optionNames.join(", ") || "none"}], ` +
        `${detail.media.length} image(s)`,
    );
    // Answers §92.2 #2 — whether grind options exist at all.
    console.log(
      optionNames.some((n) => n.toLowerCase() === "grind")
        ? "  §92.2 #2: grind options EXIST"
        : "  §92.2 #2: no grind option on this product",
    );

    variantId = detail.variants.find((v) => v.availableForSale)?.id ?? null;
    expect(detail.variants.length).toBeGreaterThan(0);
  });

  it("completes a cart round-trip and returns a checkout URL", async () => {
    expect(variantId).toBeTruthy();

    const created = await request<{
      cartCreate: { cart: ApiCart | null; userErrors: Array<{ message: string }> };
    }>(CART_CREATE_MUTATION, {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });
    expect(created.cartCreate.userErrors).toEqual([]);
    const cart = mapCart(created.cartCreate.cart as ApiCart);
    expect(cart.totalQuantity).toBe(1);

    const added = await request<{
      cartLinesAdd: { cart: ApiCart | null; userErrors: Array<{ message: string }> };
    }>(CART_LINES_ADD_MUTATION, {
      cartId: cart.id,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });
    expect(added.cartLinesAdd.userErrors).toEqual([]);
    expect(mapCart(added.cartLinesAdd.cart as ApiCart).totalQuantity).toBe(2);

    // Proves the id is durable — the same guarantee the cookie relies on.
    const reread = await request<{ cart: ApiCart | null }>(CART_QUERY, {
      id: cart.id,
    });
    expect(reread.cart).not.toBeNull();
    const persisted = mapCart(reread.cart as ApiCart);
    expect(persisted.totalQuantity).toBe(2);
    expect(persisted.checkoutUrl).toMatch(/^https:\/\//);

    console.log(
      `\n  Open and confirm the total matches ` +
        `${persisted.subtotal.amount} ${persisted.subtotal.currencyCode}:\n  ${persisted.checkoutUrl}\n`,
    );
  });
});

describe.skipIf(configured)("Storefront API — live (skipped)", () => {
  it("reports why it is skipped", () => {
    console.log(
      "\n  Live verification skipped: Storefront credentials not set in .env.local.\n" +
        "  See plan.md §95.5 for what this covers once they are.\n",
    );
    expect(configured).toBe(false);
  });
});
