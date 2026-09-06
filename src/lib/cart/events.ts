/**
 * Cart events.
 *
 * The header, the cart drawer and every add-to-cart control live in
 * separate React trees hanging off separate Server Components, so they
 * cannot share context. A DOM event on `window` is the smallest thing
 * that lets a product card tell the drawer it has work to do, without
 * threading a provider through the whole app or making the header
 * dynamic.
 *
 * `cartChanged` says the cart moved and anything showing it should
 * refetch. `openCart` asks the drawer to show itself — a separate
 * signal, because removing a line changes the cart but must not
 * reopen a drawer the customer just closed.
 */

export const CART_CHANGED = "yego:cart-changed";
export const CART_OPEN = "yego:cart-open";

export function cartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CHANGED));
}

export function openCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_OPEN));
}
