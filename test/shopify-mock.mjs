/**
 * Dev-only Storefront stand-in (plan.md §40).
 *
 * Patches global fetch before Next boots so requests to the mock
 * myshopify domain are served locally. Loaded with --import, so no
 * application code knows this exists and nothing ships with it.
 *
 *   NODE_OPTIONS='--import ./test/shopify-mock.mjs' pnpm dev
 */

const UNIT = 19;
const VARIANTS = {
  "gid://shopify/ProductVariant/1": "Whole bean",
  "gid://shopify/ProductVariant/2": "Ground",
};

const carts = new Map();
let cartSeq = 0;

const image = (n) => ({
  url: `https://cdn.shopify.com/mock/${n}.jpg`,
  altText: null,
  width: 1200,
  height: 1200,
});

function product(handle, title) {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title,
    availableForSale: true,
    featuredImage: image(handle),
    priceRange: {
      minVariantPrice: { amount: "19.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "19.00", currencyCode: "USD" },
    },
    sellingPlanGroups: { edges: [] },
  };
}

const CATALOGUE = [
  product("medium-roast", "Medium Roast"),
  product("dark-roast", "Dark Roast"),
  product("light-roast", "Light Roast"),
];

function detail(handle) {
  const base = CATALOGUE.find((p) => p.handle === handle);
  if (!base) return null;
  return {
    ...base,
    description: "Grown in Rwanda. Roasted in Somerville.",
    descriptionHtml: "<p>Grown in Rwanda. Roasted in Somerville.</p>",
    options: [{ id: "opt-grind", name: "Grind", values: ["Whole bean", "Ground"] }],
    images: { edges: [{ node: image(handle) }] },
    variants: {
      edges: Object.entries(VARIANTS).map(([id, value]) => ({
        node: {
          id,
          title: value,
          availableForSale: true,
          quantityAvailable: 10,
          price: { amount: "19.00", currencyCode: "USD" },
          compareAtPrice: null,
          selectedOptions: [{ name: "Grind", value }],
          image: null,
        },
      })),
    },
    seo: { title: null, description: null },
  };
}

function money(amount) {
  return { amount: amount.toFixed(2), currencyCode: "USD" };
}

function cartPayload(id) {
  const lines = carts.get(id) ?? [];
  const quantity = lines.reduce((n, l) => n + l.quantity, 0);
  return {
    id,
    checkoutUrl: `https://yego-mock.myshopify.com/checkouts/${id.split("/").pop()}`,
    totalQuantity: quantity,
    cost: { subtotalAmount: money(UNIT * quantity), totalAmount: money(UNIT * quantity) },
    lines: {
      edges: lines.map((l, i) => ({
        node: {
          id: `gid://shopify/CartLine/${id.split("/").pop()}-${i}`,
          quantity: l.quantity,
          cost: {
            totalAmount: money(UNIT * l.quantity),
            amountPerQuantity: money(UNIT),
          },
          sellingPlanAllocation: null,
          merchandise: {
            id: l.merchandiseId,
            title: VARIANTS[l.merchandiseId] ?? "Default Title",
            availableForSale: true,
            image: image("medium-roast"),
            product: { title: "Medium Roast", handle: "medium-roast" },
          },
        },
      })),
    },
  };
}

function addLines(id, lines) {
  const existing = carts.get(id) ?? [];
  for (const line of lines) {
    const match = existing.find((l) => l.merchandiseId === line.merchandiseId);
    if (match) match.quantity += line.quantity;
    else existing.push({ ...line });
  }
  carts.set(id, existing);
}

function resolve(query, variables = {}) {
  const op = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? "";

  if (op === "Shop") {
    return {
      shop: {
        name: "Yego Coffee (mock)",
        primaryDomain: { url: "https://yego-mock.myshopify.com" },
      },
    };
  }
  if (op === "Products") {
    return { products: { edges: CATALOGUE.map((node) => ({ node })) } };
  }
  if (op === "ProductByHandle") {
    return { product: detail(variables.handle) };
  }
  if (op === "Cart") {
    return { cart: carts.has(variables.id) ? cartPayload(variables.id) : null };
  }
  if (op === "CartCreate") {
    const id = `gid://shopify/Cart/${++cartSeq}`;
    carts.set(id, []);
    addLines(id, variables.lines ?? []);
    return { cartCreate: { cart: cartPayload(id), userErrors: [] } };
  }
  if (op === "CartLinesAdd") {
    if (!carts.has(variables.cartId)) {
      return { cartLinesAdd: { cart: null, userErrors: [] } };
    }
    addLines(variables.cartId, variables.lines ?? []);
    return { cartLinesAdd: { cart: cartPayload(variables.cartId), userErrors: [] } };
  }
  if (op === "CartLinesUpdate") {
    const lines = carts.get(variables.cartId) ?? [];
    for (const update of variables.lines ?? []) {
      const index = Number(update.id.split("-").pop());
      if (lines[index]) lines[index].quantity = update.quantity;
    }
    carts.set(variables.cartId, lines);
    return { cartLinesUpdate: { cart: cartPayload(variables.cartId), userErrors: [] } };
  }
  if (op === "CartLinesRemove") {
    const lines = carts.get(variables.cartId) ?? [];
    const drop = new Set((variables.lineIds ?? []).map((v) => Number(v.split("-").pop())));
    carts.set(variables.cartId, lines.filter((_, i) => !drop.has(i)));
    return { cartLinesRemove: { cart: cartPayload(variables.cartId), userErrors: [] } };
  }
  return null;
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : (input?.url ?? "");
  if (url.includes("yego-mock.myshopify.com") && url.includes("graphql.json")) {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const data = resolve(body.query, body.variables);
    console.log(`[mock-shopify] ${body.query.match(/(?:query|mutation)\s+(\w+)/)?.[1]}`);
    return new Response(
      JSON.stringify(data ? { data } : { errors: [{ message: "unknown operation" }] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
  return realFetch(input, init);
};

console.log("[mock-shopify] fetch patched");
