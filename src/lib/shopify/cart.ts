import "server-only";

import { cookies, headers } from "next/headers";
import { storefrontRequest } from "./client";
import { mapCart } from "./mappers/cart";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./queries/cart";
import type {
  ApiCartCreate,
  ApiCartLinesAdd,
  ApiCartLinesRemove,
  ApiCartLinesUpdate,
  ApiCartMutationPayload,
  ApiCartQuery,
} from "./types.api";
import type { CartModel } from "./types";

/**
 * Cart data layer (plan.md §53, §15.3).
 *
 * The Shopify cart id lives in an httpOnly cookie. It is an opaque
 * handle, not customer data, but httpOnly keeps it out of reach of any
 * injected script that might otherwise hijack a cart.
 */

const CART_COOKIE = "yego_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // Shopify carts idle out ~10 days; 30 is a safe upper bound.

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  /** Phase 2 never sets this. Subscriptions are blocked on §92.2 #1. */
  sellingPlanId?: string;
};

export class CartUserError extends Error {
  readonly userErrors: ReadonlyArray<{ message: string }>;
  constructor(userErrors: ReadonlyArray<{ message: string }>) {
    super(userErrors.map((e) => e.message).join("; "));
    this.name = "CartUserError";
    this.userErrors = userErrors;
  }
}

async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/**
 * `Secure` follows the request's actual protocol, not NODE_ENV.
 *
 * Chrome makes a special case for `http://localhost` and stores Secure
 * cookies there anyway. WebKit does not — it drops them silently. So a
 * production build served over plain HTTP kept the cart in Chrome and
 * lost it entirely in Safari, which is how a cross-browser bug hides:
 * every Chromium test passed.
 *
 * On a real HTTPS deployment this still resolves to `secure: true`,
 * which is the only case that matters for the guarantee.
 */
async function isSecureRequest(): Promise<boolean> {
  const headerList = await headers();
  const proto =
    headerList.get("x-forwarded-proto") ?? headerList.get("x-forwarded-protocol");
  if (proto) return proto.split(",")[0].trim() === "https";

  // No proxy header: trust the deployment only if it says it is
  // production and gives us nothing to contradict it.
  return process.env.NODE_ENV === "production";
}

/** Only callable from a Server Action or Route Handler. */
async function writeCartId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function clearCartId(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

function unwrap(payload: ApiCartMutationPayload): CartModel {
  if (payload.userErrors.length) throw new CartUserError(payload.userErrors);
  if (!payload.cart) throw new CartUserError([{ message: "Cart not returned" }]);
  return mapCart(payload.cart);
}

/**
 * Reads the current cart, or null. Safe during render — never writes a
 * cookie. A cart id that Shopify no longer recognises resolves to null
 * rather than throwing, so an expired cart degrades to an empty one
 * (§15.3).
 */
export async function getCart(): Promise<CartModel | null> {
  const id = await readCartId();
  if (!id) return null;

  const data = await storefrontRequest<ApiCartQuery>({
    operation: "Cart",
    query: CART_QUERY,
    variables: { id },
    revalidate: false,
  });

  return data.cart ? mapCart(data.cart) : null;
}

export async function createCart(lines: CartLineInput[] = []): Promise<CartModel> {
  const data = await storefrontRequest<ApiCartCreate>({
    operation: "CartCreate",
    query: CART_CREATE_MUTATION,
    variables: { lines },
    revalidate: false,
  });

  const cart = unwrap(data.cartCreate);
  await writeCartId(cart.id);
  return cart;
}

export async function addCartLines(lines: CartLineInput[]): Promise<CartModel> {
  const id = await readCartId();
  if (!id) return createCart(lines);

  const data = await storefrontRequest<ApiCartLinesAdd>({
    operation: "CartLinesAdd",
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId: id, lines },
    revalidate: false,
  });

  // A stale cookie surfaces as a missing cart; start a fresh one rather
  // than dead-ending the customer on an error page.
  if (!data.cartLinesAdd.cart && !data.cartLinesAdd.userErrors.length) {
    await clearCartId();
    return createCart(lines);
  }

  return unwrap(data.cartLinesAdd);
}

export async function updateCartLines(
  lines: Array<{ id: string; quantity: number }>,
): Promise<CartModel> {
  const id = await readCartId();
  if (!id) throw new CartUserError([{ message: "No cart to update" }]);

  const data = await storefrontRequest<ApiCartLinesUpdate>({
    operation: "CartLinesUpdate",
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId: id, lines },
    revalidate: false,
  });

  return unwrap(data.cartLinesUpdate);
}

export async function removeCartLines(lineIds: string[]): Promise<CartModel> {
  const id = await readCartId();
  if (!id) throw new CartUserError([{ message: "No cart to update" }]);

  const data = await storefrontRequest<ApiCartLinesRemove>({
    operation: "CartLinesRemove",
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId: id, lineIds },
    revalidate: false,
  });

  return unwrap(data.cartLinesRemove);
}
