import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Cart integration (plan.md §40 — "Mock Shopify GraphQL responses").
 *
 * Exercises the real stack end to end: cart.ts → client.ts → fetch →
 * mappers, with only the network and Next's cookie store replaced. That
 * covers everything the live run would except whether Shopify's actual
 * schema matches these documents — which is precisely what §95.5 is
 * for. Passing here does NOT mean the store works; it means the wiring
 * does.
 */

vi.mock("server-only", () => ({}));

// Minimal stand-in for Next's cookie store, shared across a "request".
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name) } : undefined,
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}));

type Line = { merchandiseId: string; quantity: number };

function cartPayload(id: string, lines: Line[]) {
  const unit = 19;
  const quantity = lines.reduce((n, l) => n + l.quantity, 0);
  return {
    id,
    checkoutUrl: `https://yego.myshopify.com/cart/c/${id.split("/").pop()}`,
    totalQuantity: quantity,
    cost: {
      subtotalAmount: { amount: (unit * quantity).toFixed(2), currencyCode: "USD" },
      totalAmount: { amount: (unit * quantity).toFixed(2), currencyCode: "USD" },
    },
    lines: {
      edges: lines.map((l, i) => ({
        node: {
          id: `gid://shopify/CartLine/${i + 1}`,
          quantity: l.quantity,
          cost: {
            totalAmount: {
              amount: (unit * l.quantity).toFixed(2),
              currencyCode: "USD",
            },
            amountPerQuantity: { amount: "19.00", currencyCode: "USD" },
          },
          sellingPlanAllocation: null,
          merchandise: {
            id: l.merchandiseId,
            title: "12 oz",
            availableForSale: true,
            image: null,
            product: { title: "Medium Roast", handle: "medium-roast" },
          },
        },
      })),
    },
  };
}

/** Server-side cart state the mock Shopify keeps between calls. */
let stored: { id: string; lines: Line[] } | null = null;
/** Forces the next Cart/CartLinesAdd read to behave as an expired cart. */
let simulateExpired = false;
let requests: string[] = [];

function respond(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

beforeEach(() => {
  jar.clear();
  stored = null;
  simulateExpired = false;
  requests = [];

  vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "yego.myshopify.com");
  vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "2026-07");
  vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "shpat_test");

  vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as {
      query: string;
      variables?: Record<string, unknown>;
    };
    const op = body.query.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? "";
    requests.push(op);
    const vars = body.variables ?? {};

    if (op === "CartCreate") {
      stored = {
        id: "gid://shopify/Cart/new",
        lines: (vars.lines as Line[]) ?? [],
      };
      return respond({
        data: {
          cartCreate: {
            cart: cartPayload(stored.id, stored.lines),
            userErrors: [],
          },
        },
      });
    }

    if (op === "CartLinesAdd") {
      if (simulateExpired) {
        return respond({ data: { cartLinesAdd: { cart: null, userErrors: [] } } });
      }
      const incoming = (vars.lines as Line[]) ?? [];
      stored = {
        id: String(vars.cartId),
        lines: [...(stored?.lines ?? []), ...incoming],
      };
      return respond({
        data: {
          cartLinesAdd: {
            cart: cartPayload(stored.id, stored.lines),
            userErrors: [],
          },
        },
      });
    }

    if (op === "CartLinesUpdate") {
      const updates = vars.lines as Array<{ id: string; quantity: number }>;
      // Shopify caps at available inventory; 5 stands in for that ceiling.
      const capped = updates.map((u) => ({ ...u, quantity: Math.min(u.quantity, 5) }));
      stored = {
        id: String(vars.cartId),
        lines: capped.map((u) => ({
          merchandiseId: "gid://shopify/ProductVariant/1",
          quantity: u.quantity,
        })),
      };
      return respond({
        data: {
          cartLinesUpdate: {
            cart: cartPayload(stored.id, stored.lines),
            userErrors: [],
          },
        },
      });
    }

    if (op === "CartLinesRemove") {
      stored = { id: String(vars.cartId), lines: [] };
      return respond({
        data: {
          cartLinesRemove: {
            cart: cartPayload(stored.id, []),
            userErrors: [],
          },
        },
      });
    }

    if (op === "Cart") {
      if (simulateExpired || !stored) {
        return respond({ data: { cart: null } });
      }
      return respond({ data: { cart: cartPayload(stored.id, stored.lines) } });
    }

    return respond({ errors: [{ message: `unexpected operation ${op}` }] });
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function cartModule() {
  return import("./cart");
}

describe("cart persistence", () => {
  it("creates a cart on first add and stores the id in a cookie", async () => {
    const { addCartLines } = await cartModule();
    const cart = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    expect(requests).toEqual(["CartCreate"]);
    expect(cart.totalQuantity).toBe(1);
    expect(jar.get("yego_cart")).toBe(cart.id);
  });

  it("reuses the stored cart on a later add instead of starting a new one", async () => {
    const { addCartLines } = await cartModule();
    await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);
    const second = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    expect(requests).toEqual(["CartCreate", "CartLinesAdd"]);
    expect(second.totalQuantity).toBe(2);
  });

  /** This is the "survives a reload" guarantee, minus the browser. */
  it("reads the cart back from the cookie on a fresh module load", async () => {
    const { addCartLines } = await cartModule();
    const created = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 2 },
    ]);

    vi.resetModules();
    const { getCart } = await cartModule();
    const reloaded = await getCart();

    expect(reloaded).not.toBeNull();
    expect(reloaded?.id).toBe(created.id);
    expect(reloaded?.totalQuantity).toBe(2);
  });

  it("returns null rather than throwing when the stored cart expired", async () => {
    const { addCartLines, getCart } = await cartModule();
    await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    simulateExpired = true;
    expect(await getCart()).toBeNull();
  });

  it("starts a fresh cart when adding to one Shopify no longer recognises", async () => {
    const { addCartLines } = await cartModule();
    await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    simulateExpired = true;
    const recovered = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    expect(requests).toContain("CartLinesAdd");
    expect(recovered.totalQuantity).toBe(1);
    expect(jar.get("yego_cart")).toBe(recovered.id);
  });

  it("keeps the cart cookie httpOnly-eligible and never stores customer data", async () => {
    const { addCartLines } = await cartModule();
    const cart = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);
    // The cookie holds an opaque Shopify handle and nothing else (§33).
    expect([...jar.keys()]).toEqual(["yego_cart"]);
    expect(jar.get("yego_cart")).toBe(cart.id);
  });
});

describe("checkout handoff", () => {
  it("surfaces Shopify's checkoutUrl untouched", async () => {
    const { addCartLines } = await cartModule();
    const cart = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);
    expect(cart.checkoutUrl).toBe("https://yego.myshopify.com/cart/c/new");
  });

  it("takes totals from Shopify rather than computing them", async () => {
    const { addCartLines } = await cartModule();
    const cart = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 3 },
    ]);
    expect(cart.subtotal).toEqual({ amount: "57.00", currencyCode: "USD" });
  });
});

describe("reconciliation", () => {
  it("returns Shopify's capped quantity when it disagrees with the request", async () => {
    const { addCartLines, updateCartLines } = await cartModule();
    const cart = await addCartLines([
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    // Ask for 9; mock Shopify caps at 5. The UI reconciles to Shopify.
    const updated = await updateCartLines([
      { id: cart.lines[0].id, quantity: 9 },
    ]);
    expect(updated.lines[0].quantity).toBe(5);
  });

  it("raises a CartUserError when Shopify reports one", async () => {
    vi.stubGlobal("fetch", () =>
      respond({
        data: {
          cartLinesAdd: {
            cart: null,
            userErrors: [{ field: null, message: "Not enough inventory" }],
          },
        },
      }),
    );
    // Pre-seed a cart id so addCartLines takes the CartLinesAdd path.
    jar.set("yego_cart", "gid://shopify/Cart/existing");

    const { addCartLines, CartUserError } = await cartModule();
    await expect(
      addCartLines([
        { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 99 },
      ]),
    ).rejects.toBeInstanceOf(CartUserError);
  });
});
