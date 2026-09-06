"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons/faBagShopping";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { CartLine } from "./cart-line";
import { buttonVariants } from "@/components/ui/button";
import { CART_CHANGED, CART_OPEN } from "@/lib/cart/events";
import { formatMoneyCompact } from "@/lib/formatting/money";
import type { Reassurance } from "@/lib/content/reassurance";
import type { CartModel } from "@/lib/shopify/types";

/**
 * The cart drawer.
 *
 * Adding a bag used to navigate away from whatever the customer was
 * reading. The drawer keeps them where they are and shows what just
 * happened — including, for a subscription, the cadence Shopify will
 * actually bill on.
 *
 * The trigger stays an anchor to /cart and the click is intercepted
 * rather than replaced: with JavaScript unavailable the link still
 * navigates to the server-rendered cart page, which remains the
 * canonical cart and is what the footer links to.
 *
 * The badge and the drawer read from different endpoints on purpose.
 * Every page load needs the count; almost none of them need the lines,
 * the images and the checkout URL, so the full cart is only fetched
 * once the customer opens the drawer.
 */
export function CartDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [cart, setCart] = useState<CartModel | null>(null);
  const [shipping, setShipping] = useState<Reassurance | null>(null);
  const [loading, setLoading] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);

  // Cheap read on mount and after every client-side navigation.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cart/count", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json() as Promise<{ count: number }>)
      .then((data) => {
        if (Number.isFinite(data.count)) setCount(data.count);
      })
      .catch(() => {
        // A cart the header cannot read is not a broken header.
      });
    return () => controller.abort();
  }, [pathname]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = (await response.json()) as {
        cart: CartModel | null;
        shipping: Reassurance | null;
      };
      setCart(data.cart);
      setShipping(data.shipping);
      setCount(data.cart?.totalQuantity ?? 0);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/cart/count", { cache: "no-store" });
      const data = (await response.json()) as { count: number };
      if (Number.isFinite(data.count)) setCount(data.count);
    } catch {
      setCount(0);
    }
  }, []);

  // Closing always hands focus back to the control that opened the
  // drawer, so keyboard position is never lost. Doing it here rather
  // than in an effect keeps it off the mount path, where it would
  // steal focus from whatever the visitor was already using.
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onChanged = () => {
      // Whoever has the drawer open needs the lines; everyone else only
      // needs the badge to be right.
      if (open) void loadCart();
      else void loadCount();
    };
    const onOpen = () => {
      setOpen(true);
      void loadCart();
    };
    window.addEventListener(CART_CHANGED, onChanged);
    window.addEventListener(CART_OPEN, onOpen);
    return () => {
      window.removeEventListener(CART_CHANGED, onChanged);
      window.removeEventListener(CART_OPEN, onOpen);
    };
  }, [open, loadCart, loadCount]);

  // Escape closes; the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const lines = cart?.lines ?? [];

  return (
    <>
      <a
        ref={trigger}
        href="/cart"
        onClick={(event) => {
          // Let modified clicks (new tab, download) behave normally.
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          setOpen(true);
          void loadCart();
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
        aria-label={
          count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"
        }
      >
        <FontAwesomeIcon icon={faBagShopping} className="h-4 w-4" />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none font-semibold text-accent-foreground"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </a>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={close}
            className="absolute inset-0 bg-soil-900/50"
          />

          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            tabIndex={-1}
            data-surface="mist"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border outline-none"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-stack-md py-stack-md">
              <h2 className="text-h3">Cart{count > 0 ? ` (${count})` : ""}</h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close cart"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-stack-md">
              {lines.length > 0 ? (
                <ul className="divide-y divide-border">
                  {lines.map((line) => (
                    <CartLine key={line.id} line={line} />
                  ))}
                </ul>
              ) : (
                <div className="py-section-sm">
                  <p className="text-body-l">
                    {loading ? "Loading your cart…" : "Your cart is empty."}
                  </p>
                  {!loading ? (
                    <Link
                      href="/shop"
                      onClick={close}
                      className={`${buttonVariants()} mt-stack-lg`}
                    >
                      Shop coffee
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            {cart && lines.length > 0 ? (
              <div className="border-t border-border px-stack-md py-stack-md">
                <div className="flex items-baseline justify-between">
                  <span className="text-body-m">Subtotal</span>
                  <span className="type-figure text-price">
                    {formatMoneyCompact(cart.subtotal)}
                  </span>
                </div>
                {/* Never present tax or shipping as final before
                    checkout (§15.2). */}
                <p className="mt-stack-sm text-body-s text-muted-foreground">
                  Shipping and tax are calculated at checkout.
                </p>
                {/* The threshold, where it changes what someone does
                    next: one more bag may be the difference between
                    paying for delivery and not. Verbatim from the
                    store's own policy. */}
                {shipping ? (
                  <p className="mt-stack-sm text-body-s text-muted-foreground">
                    {shipping.html}
                  </p>
                ) : null}
                <a
                  href={cart.checkoutUrl}
                  className={`${buttonVariants({ size: "lg" })} mt-stack-md w-full`}
                >
                  Checkout
                </a>
                <Link
                  href="/cart"
                  onClick={close}
                  className="link-sweep mt-stack-md inline-block label text-muted-foreground"
                >
                  View full cart
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
