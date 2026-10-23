import Link from "next/link";
import { PriceRange } from "./product-price";
import { ProductMedia } from "./product-media";
import { formatMoneyCompact } from "@/lib/formatting/money";
import { cadenceSentence } from "@/lib/catalog/plans";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";
import { cn } from "@/lib/utils";

/**
 * One Yego bag, drawn as a line (§109).
 *
 * The real bag: a white flat-bottomed pouch with a crimped top seal, a
 * side gusset and a dark label band near the base. White-filled so a
 * bag standing in front hides the one behind it, as they stand on a
 * shelf. No artwork — the gorilla belongs to the photographs.
 */
function Bag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 92"
      aria-hidden
      className={cn("fill-surface-elevated stroke-current", className)}
      strokeWidth={1.2}
      strokeLinejoin="round"
    >
      {/* Side gusset, behind the front face. */}
      <path d="M44 15 L54 19 L56 86 L46 88 Z" />
      {/* Top seal. */}
      <path d="M8 4 H42 L44 15 H6 Z" />
      <path d="M7.5 9.5 H43" strokeDasharray="1.5 2" />
      {/* Front face, flaring a little to its flat base. */}
      <path d="M6 15 H44 L46 88 H4 Z" />
      {/* Label band. */}
      <path d="M4.6 64 H45.3 L45.6 74 H4.4 Z" className="fill-current" />
    </svg>
  );
}

/**
 * A subscription plan, as a shelf tile (§109, docs/starbucks-parity.md).
 *
 * The geometry is ProductCard's — white 316:373 tile, the title, then a
 * bold muted price — so the plans sit in the store's shop grid rather
 * than in a table of their own.
 *
 * The face is the delivery itself: one drawn bag per bag in the box, at
 * the same size on every tile, so four bags look like twice two. That
 * is the plan's real difference, and it replaces four copies of the
 * same product photograph. Without a bag count (the
 * `custom.bags_per_delivery` metafield) it falls back to Shopify's
 * photograph.
 *
 * The per-bag price and the saving are arithmetic on Shopify's prices
 * (see summarisePlans). The one-bag tile states its per-bag price but no
 * saving: it is the price the others are measured against.
 */
export function SubscriptionTile({
  plan,
  revealOrder,
  className,
}: {
  plan: SubscriptionPlanSummary;
  revealOrder?: number;
  className?: string;
}) {
  const href = `/products/${plan.handle}`;

  return (
    <article
      data-reveal
      style={
        revealOrder
          ? ({ "--reveal-order": revealOrder } as React.CSSProperties)
          : undefined
      }
      className={cn("group", className)}
    >
      {/* Duplicates the title link's destination, so it is skipped by
          assistive technology rather than announced twice. */}
      <Link href={href} className="block" tabIndex={-1} aria-hidden>
        {plan.bags ? (
          <div className="flex aspect-[316/373] items-end justify-center overflow-hidden rounded-tile bg-surface-elevated pb-[17%] text-foreground">
            <div className="flex w-full items-end justify-center transition-transform duration-350 ease-out group-hover:scale-[1.08] group-focus-within:scale-[1.08]">
              {Array.from({ length: plan.bags }, (_, i) => (
                <Bag
                  key={i}
                  className={cn("w-1/4 shrink-0", i > 0 && "-ml-[1.5%]")}
                />
              ))}
            </div>
          </div>
        ) : (
          <ProductMedia
            image={plan.image}
            title={plan.title}
            zoomOnHover
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="aspect-[316/373] rounded-tile bg-surface-elevated"
          />
        )}
      </Link>

      <div className="mt-4">
        <h3 className="text-h4 font-semibold transition-colors duration-150 group-hover:text-accent">
          <Link href={href}>{plan.title}</Link>
        </h3>

        <PriceRange
          min={plan.minPrice}
          max={plan.maxPrice}
          className="mt-2 text-price-s font-bold text-muted-foreground"
        />

        {plan.perBag ? (
          <p className="mt-1 text-body-s text-muted-foreground">
            {formatMoneyCompact(plan.perBag)} a bag
          </p>
        ) : null}
        {plan.savingPerDelivery ? (
          <p className="mt-1 text-body-s text-accent">
            Save {formatMoneyCompact(plan.savingPerDelivery)} each delivery
          </p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * The plans, on the shop grid: one a row on a phone, two on a tablet,
 * four from a laptop up. Their cadences are said once, beneath.
 */
export function SubscriptionGrid({
  plans,
  className,
}: {
  plans: SubscriptionPlanSummary[];
  className?: string;
}) {
  if (plans.length === 0) return null;
  const cadences = cadenceSentence(plans);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <SubscriptionTile
            key={plan.handle}
            plan={plan}
            revealOrder={(i % 4) + 1}
          />
        ))}
      </div>
      {cadences ? (
        <p className="mt-stack-lg text-body-m text-muted-foreground">
          {cadences}
        </p>
      ) : null}
    </div>
  );
}
