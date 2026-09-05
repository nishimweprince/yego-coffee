"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductPrice } from "./product-price";
import { QuantitySelector } from "./quantity-selector";
import { VariantSelector } from "./variant-selector";
import { addToCartAction } from "@/app/actions/cart";
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
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const variant = findVariant(product.variants, selection) ?? initial;
  const sellable = Boolean(variant?.availableForSale);

  // Shopify caps at whatever it is meaningfully tracking. Yego's store
  // sells past zero and reports negative counts, so this is not a plain
  // read of quantityAvailable — see purchasableQuantity.
  const max = variant ? purchasableQuantity(variant) : 0;

  function handleSelect(optionName: string, value: string) {
    setAdded(false);
    setError(null);
    setSelection((prev) => ({ ...prev, [optionName]: value }));
  }

  function handleAdd() {
    if (!variant) return;
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(variant.id, quantity);
      if (result.ok) {
        setAdded(true);
        // Refresh so any server-rendered cart count reflects the change.
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
          price={variant.price}
          compareAtPrice={variant.compareAtPrice}
        />
      ) : null}

      <VariantSelector
        options={product.options}
        variants={product.variants}
        selection={selection}
        onSelect={handleSelect}
      />

      <div>
        <p className="label text-muted-foreground">Quantity</p>
        <QuantitySelector
          value={quantity}
          onChange={(next) => {
            setAdded(false);
            setQuantity(next);
          }}
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

        {/* Status rather than alert: adding to a cart is not an error
            condition and should not interrupt a screen reader. */}
        <div aria-live="polite" className="mt-stack-sm">
          {added ? (
            <p className="text-body-s">
              Added.{" "}
              <Link href="/cart" className="underline underline-offset-4">
                View cart
              </Link>
            </p>
          ) : null}
          {error ? (
            <p className="text-body-s text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
