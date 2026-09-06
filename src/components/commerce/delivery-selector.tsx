"use client";

import { formatMoneyCompact } from "@/lib/formatting/money";
import { cn } from "@/lib/utils";
import type { SubscriptionOptionModel } from "@/lib/shopify/types";

/**
 * One time, or on a schedule.
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
  oneTimePrice: string;
  selectedPlanId: string | null;
  onSelect: (sellingPlanId: string | null) => void;
  className?: string;
}) {
  if (options.length === 0) return null;

  const choices = [
    { id: null, label: "One time", price: oneTimePrice, savings: null },
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
                "flex min-h-11 cursor-pointer items-center justify-between gap-4 border px-4 py-3 transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--ring)",
                checked
                  ? "border-foreground"
                  : "border-foreground/25 hover:border-foreground/60",
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
                <span
                  aria-hidden
                  className={cn(
                    "block h-3 w-3 shrink-0 rounded-full border",
                    checked
                      ? "border-foreground bg-foreground"
                      : "border-foreground/40",
                  )}
                />
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
