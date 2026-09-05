"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { ProductMedia } from "./product-media";
import { QuantitySelector } from "./quantity-selector";
import { formatMoneyCompact } from "@/lib/formatting/money";
import {
  removeCartLineAction,
  updateCartLineAction,
} from "@/app/actions/cart";
import type { CartLineModel } from "@/lib/shopify/types";

/**
 * Quantity updates optimistically, then reconciles (§15.4).
 *
 * Shopify's response is authoritative: if it comes back with a
 * different quantity than requested — inventory moved between render
 * and click — the UI corrects to Shopify's number and says why, rather
 * than leaving the customer with a figure the cart will not honour.
 */
export function CartLine({ line }: { line: CartLineModel }) {
  const router = useRouter();
  // useOptimistic rather than prop-syncing state: it reverts to the
  // server value automatically when the transition settles, so there is
  // no window where the UI disagrees with Shopify.
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    line.quantity,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeQuantity(next: number) {
    setNotice(null);

    startTransition(async () => {
      setOptimisticQuantity(next);
      const result = await updateCartLineAction(line.id, next);

      if (!result.ok) {
        setNotice(result.message);
        return;
      }

      const confirmed = result.cart.lines.find((l) => l.id === line.id);
      if (confirmed && confirmed.quantity !== next) {
        setNotice(
          `Only ${confirmed.quantity} available. We've updated your cart.`,
        );
      }
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeCartLineAction(line.id);
      if (!result.ok) {
        setNotice(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="flex gap-4 py-6" data-pending={pending || undefined}>
      <Link
        href={`/products/${line.productHandle}`}
        className="w-20 shrink-0 sm:w-24"
      >
        <ProductMedia
          image={line.image}
          title={line.productTitle}
          sizes="96px"
          className="bg-surface-elevated"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-h3">
              <Link href={`/products/${line.productHandle}`}>
                {line.productTitle}
              </Link>
            </h3>
            {line.variantTitle && line.variantTitle !== "Default Title" ? (
              <p className="mt-0.5 text-body-s text-muted-foreground">
                {line.variantTitle}
              </p>
            ) : null}
            {/* The cadence Shopify will actually bill on, not the plan's
                name: "Bi-Monthly" means two different things in English,
                and this store also has a "Weekly membership" that bills
                every 60 days (§96.3). The name is kept as secondary
                detail so a customer can still recognise their plan. */}
            {line.sellingPlanCadence ?? line.sellingPlanName ? (
              <p className="label mt-stack-sm text-muted-foreground">
                {line.sellingPlanCadence ?? line.sellingPlanName}
              </p>
            ) : null}
          </div>

          <p className="text-price shrink-0 font-medium">
            {formatMoneyCompact(line.lineTotal)}
          </p>
        </div>

        <div className="mt-stack-md flex items-center gap-4">
          <QuantitySelector
            value={optimisticQuantity}
            onChange={changeQuantity}
            disabled={pending}
            label={`quantity for ${line.productTitle}`}
          />

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-2 text-body-s text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
            Remove
            <span className="sr-only"> {line.productTitle}</span>
          </button>
        </div>

        <div aria-live="polite">
          {notice ? (
            <p className="mt-stack-sm text-body-s text-destructive">{notice}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
