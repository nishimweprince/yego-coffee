"use client";

import { formatMoneyCompact } from "@/lib/formatting/money";
import { cn } from "@/lib/utils";
import { controlMark, controlVariants } from "@/components/ui/control";
import type { SubscriptionOptionModel } from "@/lib/shopify/types";

/**
 * One time, or on a schedule — or, for a subscription-only product
 * such as Roaster's Choice, only on a schedule (§109).
 *
 * Until now the product page listed the schedules Shopify offers and
 * then added the item as a one-time purchase regardless — a visitor
 * reading "Every month $17.00" above an "Add to cart" button had every
 * reason to believe they were subscribing, and they were not.
 *
 * Real radio inputs under the styling, matching VariantSelector: the
 * control has to survive a keyboard and a screen reader.
 *
 * No saving is shown, because there is none. Every selling plan in
 * this store adjusts price by 0% (§96.5) and a "subscribe & save"
 * badge over a 0% plan is a false claim. The honest proposition is the
 * schedule, so the schedule is what the control says. Where Shopify
 * does supply an adjustment, `savingsPercentage` is non-null and the
 * plan's own figure is shown — never one computed here.
 *
 * `frequencyLabel` comes from the plan's delivery policy and never its
 * name: this store contains a plan called "Weekly membership" that
 * bills every 60 days (§96.3).
 */
export function DeliverySelector({
  options,
  oneTimePrice,
  selectedPlanId,
  onSelect,
  className,
}: {
  options: SubscriptionOptionModel[];
  /** Null on a subscription-only product: there is no one-time choice. */
  oneTimePrice: string | null;
  selectedPlanId: string | null;
  onSelect: (sellingPlanId: string | null) => void;
  className?: string;
}) {
  if (options.length === 0) return null;

  const choices = [
    ...(oneTimePrice === null
      ? []
      : [{ id: null, label: "One time", price: oneTimePrice, savings: null }]),
    ...options.map((option) => ({
      id: option.sellingPlanId,
      label: option.frequencyLabel,
      price: formatMoneyCompact(option.price),
      savings: option.savingsPercentage,
    })),
  ];

  return (
    <fieldset className={cn(className)}>
      <legend className="label text-muted-foreground">Delivery</legend>
      <div className="mt-stack-sm space-y-2">
        {choices.map((choice) => {
          const checked = selectedPlanId === choice.id;
          return (
            <label
              key={choice.id ?? "one-time"}
              className={cn(
                "cursor-pointer",
                controlVariants({
                  shape: "row",
                  state: checked ? "outlined" : "idle",
                }),
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onSelect(choice.id)}
                />
                <span aria-hidden className={controlMark(checked)} />
                <span className="text-body-m">{choice.label}</span>
              </span>

              <span className="flex items-baseline gap-2">
                {choice.savings !== null && choice.savings !== undefined ? (
                  <span className="label text-accent">
                    Save {choice.savings}%
                  </span>
                ) : null}
                <span className="type-figure text-price">{choice.price}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
