"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductMedia } from "@/components/commerce/product-media";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { addToCartAction } from "@/app/actions/cart";
import { formatMoney } from "@/lib/formatting/money";
import { formatCadence } from "@/lib/shopify/cadence";
import { purchasableQuantity } from "@/lib/shopify/variants";
import type { QuizAnswers } from "@/lib/quiz/schema";
import type { QuizRecommendation } from "@/lib/quiz/recommendation";
import { cn } from "@/lib/utils";

/**
 * The result (plan.md §9.6).
 *
 * Every figure comes from the Shopify variant or selling-plan
 * allocation the customer would actually be charged on (§2.1, §62.6).
 * The cadence line is generated from the plan's delivery policy, never
 * its name (§96.3).
 *
 * When the matched coffee has no subscription — Gatare has none
 * (§92.1) — the page says so plainly and offers a one-time purchase.
 * It does not quietly recommend a different coffee that happens to
 * have a plan; the match is the answer to the question they were asked.
 */
export function QuizResult({
  recommendation,
  answers,
  onChange,
  onRestart,
}: {
  recommendation: QuizRecommendation | null;
  answers: QuizAnswers;
  onChange: (next: QuizAnswers) => void;
  onRestart: () => void;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(recommendation?.quantity ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!recommendation) {
    return (
      <div className="mx-auto max-w-3xl py-section-md">
        <h1 className="text-display-l">Nothing to recommend right now.</h1>
        <p className="mt-stack-lg text-body-l text-muted-foreground">
          Every coffee is out of stock at the moment. That is a real
          answer, not an error — please check back.
        </p>
        <Link
          href="/shop"
          className={cn(buttonVariants({ size: "lg" }), "mt-section-sm")}
        >
          See the shop
        </Link>
      </div>
    );
  }

  const { product, variant, subscription, alternate } = recommendation;
  const max = purchasableQuantity(variant);

  const cadence = subscription
    ? formatCadence(
        subscription.option.interval,
        subscription.option.intervalCount,
      )
    : null;

  const unitPrice = subscription ? subscription.unitPrice : variant.price;

  function addToCart() {
    setError(null);
    startTransition(async () => {
      const result = subscription
        ? await addToCartAction(
            subscription.variantId,
            quantity,
            subscription.option.sellingPlanId,
          )
        : await addToCartAction(variant.id, quantity);

      if (result.ok) {
        setAdded(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl py-section-sm">
      <Contour label="Your match" />

      <div className="mt-section-sm grid gap-section-sm lg:grid-cols-2 lg:gap-16">
        <ProductMedia
          image={variant.image ?? product.featuredImage}
          title={product.title}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="bg-surface-elevated"
        />

        <div>
          <h1 className="text-h1">{product.title}</h1>
          <p className="mt-stack-sm text-body-l text-muted-foreground">
            {variant.title}
          </p>

          <h2 className="mt-section-sm label text-muted-foreground">
            Why we picked it
          </h2>
          <ul className="mt-stack-md space-y-stack-sm text-body-m">
            {recommendation.reasons.map((reason) => (
              <li key={reason} className="flex gap-3">
                <span aria-hidden className="text-accent">
                  —
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-section-sm label text-muted-foreground">
            {subscription ? "Your plan" : "Your coffee"}
          </h2>
          <p className="mt-stack-md text-body-l">
            {quantity} × {variant.title}
            {cadence ? (
              <>
                <br />
                {cadence}
              </>
            ) : null}
          </p>
          <p className="mt-stack-sm text-price tabular-nums">
            {formatMoney(unitPrice)}
            {subscription ? " per delivery, per bag" : " each"}
          </p>

          {!subscription ? (
            /* §92.1 in the customer's language: this coffee is not sold
               on a subscription today. Saying so is better than routing
               them to a coffee they did not ask for. */
            <p className="mt-stack-md max-w-prose text-body-s text-muted-foreground">
              {product.title} isn&apos;t available as a subscription yet —
              this is a one-time order.
            </p>
          ) : null}

          <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={max}
              label="Bags"
            />
            <button
              type="button"
              onClick={addToCart}
              disabled={pending || max === 0}
              className={buttonVariants({ size: "lg" })}
            >
              {pending
                ? "Adding…"
                : subscription
                  ? "Start my subscription"
                  : "Add to cart"}
            </button>
          </div>

          <div aria-live="polite" className="mt-stack-md min-h-6">
            {added ? (
              <Link
                href="/cart"
                className="text-body-m text-accent underline-offset-4 hover:underline"
              >
                Added. View cart
              </Link>
            ) : null}
            {error ? (
              <p className="text-body-m text-destructive">{error}</p>
            ) : null}
          </div>

          <div className="mt-section-sm flex flex-wrap gap-stack-md text-body-m">
            <Link
              href={`/products/${product.handle}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              See the full details
            </Link>
            <button
              type="button"
              onClick={onRestart}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Start over
            </button>
          </div>
        </div>
      </div>

      {alternate ? (
        <section className="mt-section-lg">
          <Contour label="Another option" />
          <div className="mt-section-sm flex flex-wrap items-baseline justify-between gap-stack-md">
            <p className="text-h2">{alternate.title}</p>
            <Link
              href={`/products/${alternate.handle}`}
              className="label text-accent underline-offset-4 hover:underline"
            >
              View {alternate.title}
            </Link>
          </div>
        </section>
      ) : null}

      {/* §9.6's adjust block: the recommendation is a starting point,
          and changing an answer re-runs the match rather than locking
          the customer into it. */}
      <section className="mt-section-lg">
        <Contour label="Adjust" />
        <div className="mt-section-sm flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 8, 10].map((cups) => (
            <button
              key={cups}
              type="button"
              aria-pressed={answers.cupsPerDay === cups}
              onClick={() => onChange({ ...answers, cupsPerDay: cups })}
              className={cn(
                "min-h-11 border px-4 text-body-s transition-colors",
                answers.cupsPerDay === cups
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/25 hover:border-foreground/60",
              )}
            >
              {cups} {cups === 1 ? "cup" : "cups"} a day
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
