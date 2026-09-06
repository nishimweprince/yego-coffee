"use client";

import { useState, useTransition } from "react";
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
import {
  defaultVariant,
  findVariant,
  purchasableQuantity,
  selectionFromVariant,
} from "@/lib/shopify/variants";
import type { ProductDetailModel } from "@/lib/shopify/types";

export function ProductPurchaseForm({
  product,
}: {
  product: ProductDetailModel;
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
  const sellable = Boolean(variant?.availableForSale);

  // Subscriptions are a property of the *variant*, not the product:
  // Gatare's plan covers only its 5 lb variant (§96.6). Switching size
  // can therefore remove the schedule the customer picked, so a plan
  // that no longer exists on the selected variant is dropped rather
  // than silently carried into the cart.
  const plans = variant?.subscriptionOptions ?? [];
  const activePlanId = plans.some((p) => p.sellingPlanId === planId)
    ? planId
    : null;
  const activePlan = plans.find((p) => p.sellingPlanId === activePlanId);

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
        <ProductPrice
          price={activePlan ? activePlan.price : variant.price}
          compareAtPrice={
            activePlan ? activePlan.compareAtPrice : variant.compareAtPrice
          }
        />
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
          oneTimePrice={formatMoneyCompact(variant.price)}
          selectedPlanId={activePlanId}
          onSelect={(next) => {
            setError(null);
            setPlanId(next);
          }}
        />
      ) : null}

      <div>
        <p className="label text-muted-foreground">Quantity</p>
        <QuantitySelector
          value={quantity}
          onChange={(next) => setQuantity(next)}
          max={max}
          disabled={!sellable}
          className="mt-stack-sm"
        />
      </div>

      <div>
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={!sellable || pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Adding…" : sellable ? "Add to cart" : "Sold out"}
        </Button>

        {activePlan ? (
          <p className="mt-stack-sm text-body-s text-muted-foreground">
            Delivered {activePlan.frequencyLabel.toLowerCase()}, until you
            change or cancel it.
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
            {pending ? "Adding…" : sellable ? "Add to cart" : "Sold out"}
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
