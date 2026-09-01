"use server";

import { revalidatePath } from "next/cache";
import {
  addCartLines,
  CartUserError,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify/cart";
import { ShopifyGraphQLError, ShopifyRequestError } from "@/lib/shopify/errors";
import type { CartModel } from "@/lib/shopify/types";

/**
 * Cart server actions (plan.md §53).
 *
 * Every action returns the Shopify-confirmed cart. The client treats
 * that as authoritative and replaces its optimistic state with it —
 * Shopify wins on any mismatch (§15.4).
 */

export type CartActionResult =
  | { ok: true; cart: CartModel }
  | { ok: false; message: string };

function toResult(error: unknown): CartActionResult {
  if (error instanceof CartUserError) {
    return { ok: false, message: error.message };
  }
  if (error instanceof ShopifyRequestError || error instanceof ShopifyGraphQLError) {
    // Shopify's raw message can leak query internals; keep it server-side.
    console.error(error);
    return {
      ok: false,
      message: "We couldn't update your cart. Please try again.",
    };
  }
  console.error(error);
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function addToCartAction(
  merchandiseId: string,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const cart = await addCartLines([{ merchandiseId, quantity }]);
    revalidatePath("/cart");
    return { ok: true, cart };
  } catch (error) {
    return toResult(error);
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const cart =
      quantity <= 0
        ? await removeCartLines([lineId])
        : await updateCartLines([{ id: lineId, quantity }]);
    revalidatePath("/cart");
    return { ok: true, cart };
  } catch (error) {
    return toResult(error);
  }
}

export async function removeCartLineAction(
  lineId: string,
): Promise<CartActionResult> {
  try {
    const cart = await removeCartLines([lineId]);
    revalidatePath("/cart");
    return { ok: true, cart };
  } catch (error) {
    return toResult(error);
  }
}
