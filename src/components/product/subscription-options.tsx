import { formatMoney } from "@/lib/formatting/money";
import type { SubscriptionOptionModel } from "@/lib/shopify/types";

/**
 * The subscriptions available on the selected variant (plan.md §10.3).
 *
 * This is presentation only in Phase 3. §10.3's Subscribe / Buy once
 * toggle is not built here, because in this store it cannot be built
 * honestly yet: the real coffees carry no selling plans at all, and the
 * one plan that exists adjusts the price by 0% (§96.5). A "Subscribe &
 * save" control that saves nothing is a false claim, and a toggle over
 * a single mislabelled plan is worse than a sentence of plain text.
 *
 * `frequencyLabel` comes from the plan's delivery policy, never its
 * name — this store contains a plan called "Weekly membership" that
 * bills every 60 days (§96.3).
 */
export function SubscriptionOptions({
  options,
}: {
  options: SubscriptionOptionModel[];
}) {
  if (options.length === 0) return null;

  return (
    <ul className="space-y-stack-sm">
      {options.map((option) => (
        <li
          key={option.sellingPlanId}
          className="flex items-baseline justify-between gap-4 border border-border px-4 py-3"
        >
          <span className="text-body-m">{option.frequencyLabel}</span>
          <span className="text-price tabular-nums">
            {formatMoney(option.price)}
            {option.savingsPercentage !== null ? (
              <span className="ml-2 text-body-s text-accent">
                Save {option.savingsPercentage}%
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
