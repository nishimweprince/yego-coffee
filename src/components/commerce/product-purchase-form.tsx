"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeliverySelector } from "./delivery-selector";
import { ProductPrice } from "./product-price";
import { QuantitySelector } from "./quantity-selector";
import { VariantSelector } from "./variant-selector";
import { addToCartAction } from "@/app/actions/cart";
import { cartChanged, openCart } from "@/lib/cart/events";
import { track } from "@/lib/analytics/analytics";
import { formatMoneyCompact } from "@/lib/formatting/money";
import { perBagPrice } from "@/lib/catalog/plans";
import { byLongestInterval } from "@/lib/shopify/cadence";
import {
  defaultVariant,
  findVariant,
  purchasableQuantity,
  selectionFromVariant,
} from "@/lib/shopify/variants";
import type { ProductDetailModel } from "@/lib/shopify/types";

export function ProductPurchaseForm({
  product,
  subscriptionPolicyHref,
}: {
  product: ProductDetailModel;
  /** The store's subscription terms, linked wherever a recurring
   * schedule is chosen (§108). Absent when the store has none. */
  subscriptionPolicyHref?: string;
}) {
  const router = useRouter();
  const initial = defaultVariant(product.variants);

  const [selection, setSelection] = useState<Record<string, string>>(
    initial ? selectionFromVariant(initial) : {},
  );
  const [quantity, setQuantity] = useState(1);
  const [planId, setPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const variant = findVariant(product.variants, selection) ?? initial;

  // Subscriptions are a property of the *variant*, not the product:
  // Gatare's plan covers only its 5 lb variant (§96.6). Switching size
  // can therefore remove the schedule the customer picked, so a plan
  // that no longer exists on the selected variant is dropped rather
  // than silently carried into the cart.
  const plans = byLongestInterval(variant?.subscriptionOptions ?? []);
  const required = product.requiresSellingPlan;
  // A subscription-only product has no one-time purchase to fall back
  // to (§109), so it always has a plan selected — the monthly one
  // until the customer picks another.
  const activePlan =
    plans.find((p) => p.sellingPlanId === planId) ??
    (required ? plans[0] : undefined);
  const activePlanId = activePlan?.sellingPlanId ?? null;

  // Shopify rejects a subscription-only line without a plan, so a
  // variant that carries none cannot be bought here at all.
  const unavailableAsSubscription = required && plans.length === 0;
  const sellable = Boolean(variant?.availableForSale) && !unavailableAsSubscription;
  const actionLabel = sellable
    ? "Add to cart"
    : unavailableAsSubscription
      ? "Not available as a subscription"
      : "Sold out";
  const shownPrice = activePlan ? activePlan.price : variant?.price;
  const bagPrice =
    shownPrice && product.bagsPerDelivery && product.bagsPerDelivery > 1
      ? perBagPrice(shownPrice, product.bagsPerDelivery)
      : null;

  // Shopify caps at whatever it is meaningfully tracking. Yego's store
  // sells past zero and reports negative counts, so this is not a plain
  // read of quantityAvailable — see purchasableQuantity.
  const max = variant ? purchasableQuantity(variant) : 0;

  function handleSelect(optionName: string, value: string) {
    setError(null);
    setSelection((prev) => ({ ...prev, [optionName]: value }));
  }

  function handleAdd() {
    if (!variant) return;
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(
        variant.id,
        quantity,
        activePlanId ?? undefined,
      );
      if (result.ok) {
        track({
          name: "cart_item_added",
          handle: product.handle,
          quantity,
        });
        // The drawer is the confirmation: it shows the line that was
        // just added, with the cadence Shopify will bill on.
        cartChanged();
        openCart();
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-stack-lg">
      {variant ? (
        <div>
          <ProductPrice
            price={activePlan ? activePlan.price : variant.price}
            compareAtPrice={
              activePlan ? activePlan.compareAtPrice : variant.compareAtPrice
            }
          />
          {bagPrice ? (
            <p className="mt-1 text-body-s text-muted-foreground">
              {product.bagsPerDelivery} bags, {formatMoneyCompact(bagPrice)} a bag
            </p>
          ) : null}
        </div>
      ) : null}

      <VariantSelector
        options={product.options}
        variants={product.variants}
        selection={selection}
        onSelect={handleSelect}
      />

      {variant ? (
        <DeliverySelector
          options={plans}
          oneTimePrice={required ? null : formatMoneyCompact(variant.price)}
          selectedPlanId={activePlanId}
          onSelect={(next) => {
            setError(null);
            setPlanId(next);
          }}
        />
      ) : null}

      <div>
        {/* Quantity and the action on one line, both 48px pills — the
            stepper's own buttons carry its accessible names, so the
            heading above it is for screen readers only. */}
        <p className="sr-only">Quantity</p>
        <div className="flex items-center gap-3">
          <QuantitySelector
            value={quantity}
            onChange={(next) => setQuantity(next)}
            max={max}
            disabled={!sellable}
            className="shrink-0"
          />
          <Button
            onClick={handleAdd}
            disabled={!sellable || pending}
            className="flex-1"
          >
            {pending ? "Adding…" : actionLabel}
          </Button>
        </div>

        {activePlan ? (
          <p className="mt-stack-sm text-body-s text-muted-foreground">
            Delivered {activePlan.frequencyLabel.toLowerCase()}, until you
            change or cancel it.
            {subscriptionPolicyHref ? (
              <>
                {" "}
                <Link
                  href={subscriptionPolicyHref}
                  className="text-foreground underline underline-offset-4 hover:text-accent"
                >
                  Subscription policy
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        <div aria-live="polite" className="mt-stack-sm">
          {error ? (
            <p className="text-body-s text-destructive">{error}</p>
          ) : null}
        </div>
      </div>

      {/* The buy bar. On a phone the price and the button scroll away
          behind the description, the specification and the rest of the
          lineup; this keeps the decision reachable from anywhere on the
          page without duplicating the controls above it. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-page-x py-stack-sm lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-body-s">{product.title}</p>
            <p className="type-figure text-price">
              {formatMoneyCompact(
                activePlan ? activePlan.price : (variant?.price ?? product.variants[0].price),
              )}
              {activePlan ? (
                <span className="label ml-2 text-muted-foreground">
                  {activePlan.frequencyLabel}
                </span>
              ) : null}
            </p>
          </div>
          <Button onClick={handleAdd} disabled={!sellable || pending}>
            {pending ? "Adding…" : actionLabel}
            {/* The same action as the button above, so it needs a name
                that tells the two apart in a screen reader's control
                list rather than repeating "Add to cart" twice. */}
            <span className="sr-only"> — {product.title}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
