import Image from "next/image";
import Link from "next/link";
import { Bag } from "./subscription-tile";
import { buttonVariants } from "@/components/ui/button";
import { formatMoneyCompact } from "@/lib/formatting/money";
import {
  cadenceSentence,
  lowestPrice,
  type SubscriptionPlanSummary,
} from "@/lib/catalog/plans";
import {
  SUBSCRIPTION_TYPE_ANCHORS,
  SUBSCRIPTION_TYPE_LABELS,
  type SubscriptionType,
} from "@/lib/catalog/subscription-type";
import { cn } from "@/lib/utils";

export type ChooserOption = {
  type: SubscriptionType;
  /** The owners' own sentence from the product descriptions (§110). */
  text: string | null;
  plans: SubscriptionPlanSummary[];
};

const ACTIONS: Record<SubscriptionType, string> = {
  regular: "Choose your coffee",
  "roasters-choice": "See Roaster's Choice",
};

/**
 * The faces of the two choices, and the one idea on this page.
 *
 * A Regular subscription is a coffee you already know, so its card
 * shows the coffees themselves — Shopify's own photographs, standing
 * together. Roaster's Choice is a coffee nobody has chosen yet, so its
 * card shows the same three bags as drawings. Photograph against
 * outline says "you pick" against "we pick" without a tagline.
 */
function ChoiceFace({ option }: { option: ChooserOption }) {
  const frame =
    "flex aspect-[16/9] items-end justify-center overflow-hidden rounded-tile bg-background pb-[6%]";

  if (option.type === "roasters-choice") {
    return (
      <div className={cn(frame, "text-foreground")}>
        {[0, 1, 2].map((i) => (
          <Bag
            key={i}
            className={cn("w-[19%] shrink-0", i > 0 && "-ml-[2%]")}
          />
        ))}
      </div>
    );
  }

  const photos = option.plans
    .map((plan) => ({ image: plan.image, title: plan.title }))
    .filter((p) => p.image !== null)
    .slice(0, 3);

  return (
    <div className={frame}>
      {photos.map(({ image, title }, i) => (
        <div
          // Two coffees can share one photograph in Shopify; the
          // title is the unique part.
          key={title}
          className={cn(
            "relative aspect-[60/92] w-[19%] shrink-0 overflow-hidden rounded-tile border border-border bg-surface-elevated",
            i > 0 && "-ml-[2%]",
          )}
        >
          <Image
            src={image!.url}
            alt={image!.altText ?? title}
            fill
            sizes="(min-width: 768px) 12vw, 25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * "Choose your subscription" (§110) — the two kinds side by side, each
 * with the owners' description, the schedules Shopify offers, the
 * lowest price on its shelf, and a link down to that shelf.
 *
 * `hrefBase` is empty on /subscriptions, where the shelves are on the
 * same page, and "/subscriptions" on the homepage.
 */
export function SubscriptionChooser({
  options,
  hrefBase = "",
  id,
  className,
}: {
  options: ChooserOption[];
  hrefBase?: string;
  id?: string;
  className?: string;
}) {
  const shown = options.filter((option) => option.plans.length > 0);
  if (shown.length === 0) return null;

  return (
    <div
      id={id}
      className={cn("grid scroll-mt-30 gap-stack-md md:grid-cols-2", className)}
    >
      {shown.map((option, i) => {
        const from = lowestPrice(option.plans);
        const cadences = cadenceSentence(option.plans);
        const headingId = `choose-${option.type}`;

        return (
          <article
            key={option.type}
            aria-labelledby={headingId}
            data-reveal
            style={{ "--reveal-order": i + 1 } as React.CSSProperties}
            className="flex flex-col rounded-card border border-border bg-surface-elevated p-stack-md sm:p-stack-lg"
          >
            <ChoiceFace option={option} />

            <h2 id={headingId} className="mt-stack-md text-h2">
              {SUBSCRIPTION_TYPE_LABELS[option.type]}
            </h2>
            {option.text ? (
              <p className="mt-stack-sm max-w-[52ch] text-body-m text-muted-foreground">
                {option.text}
              </p>
            ) : null}

            <dl className="mt-stack-md flex-1 space-y-1 text-body-s">
              {cadences ? (
                <div>
                  <dt className="sr-only">Delivery</dt>
                  <dd>{cadences}</dd>
                </div>
              ) : null}
              {from ? (
                <div>
                  <dt className="sr-only">Price</dt>
                  <dd className="type-figure font-bold">
                    From {formatMoneyCompact(from)} a delivery
                  </dd>
                </div>
              ) : null}
            </dl>

            <Link
              href={`${hrefBase}#${SUBSCRIPTION_TYPE_ANCHORS[option.type]}`}
              className={cn(buttonVariants(), "mt-stack-lg self-start")}
            >
              {ACTIONS[option.type]}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
