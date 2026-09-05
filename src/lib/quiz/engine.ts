import type { Flavour, QuizAnswers, Take } from "./schema";
import type { ProductDetailModel } from "@/lib/shopify/types";
import { roastsOf, type Roast } from "@/lib/catalog/facets";

/**
 * The recommendation engine (plan.md §9.4, weights per §93.4).
 *
 * Deterministic weighted matching, not a model (§9.4 is explicit: no
 * opaque AI for v1). The weights are configurable so this scales when
 * the catalogue grows, but they are honest about today's shape: with
 * three coffees separated on one real dimension, flavour carries the
 * decision and brew and decaf are zero because no SKU differs on them.
 *
 * §62 governs what may be returned: a product only reaches a customer
 * after availability is confirmed, and if the top match is unavailable
 * the next eligible one is used rather than a sold-out recommendation.
 */

export type ScoringWeights = {
  flavour: number;
  roast: number;
  availability: number;
};

export const DEFAULT_WEIGHTS: ScoringWeights = {
  flavour: 0.7,
  roast: 0.2,
  availability: 0.1,
};

/** Which roast each flavour answer points at. */
const FLAVOUR_ROAST: Record<Exclude<Flavour, "unsure">, Roast> = {
  rich: "dark",
  smooth: "medium",
  bright: "light",
};

/**
 * §93.2's Q01b. Asked only when the customer says they are not sure,
 * so that the quiz makes its guess out loud instead of silently.
 */
const TAKE_ROAST: Record<Take, Roast> = {
  black: "light",
  milk: "dark",
  iced: "dark",
};

/** The roast the answers point at, or null if they point nowhere. */
export function targetRoast(answers: QuizAnswers): Roast | null {
  if (answers.flavour !== "unsure") return FLAVOUR_ROAST[answers.flavour];
  return answers.take ? TAKE_ROAST[answers.take] : null;
}

export type ScoredProduct = {
  product: ProductDetailModel;
  score: number;
};

/**
 * Scores every candidate. Products with no purchasable variant score
 * zero on availability rather than being silently dropped, so the
 * caller can see the whole field (§62 step 2 filters them).
 */
export function scoreProducts(
  products: ProductDetailModel[],
  answers: QuizAnswers,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): ScoredProduct[] {
  const target = targetRoast(answers);

  return products
    .map((product) => {
      const roasts = roastsOf(product);
      const matchesRoast = target !== null && roasts.includes(target);

      // A product carrying every roast (the 5 lb Bag) matches any
      // target, but it is a format rather than a choice of coffee, so
      // it should not beat the coffee itself on flavour.
      const isMultiRoast = roasts.length > 1;

      const flavourScore = matchesRoast && !isMultiRoast ? 1 : 0;
      const roastScore = matchesRoast ? 1 : 0;
      const availabilityScore = product.availableForSale ? 1 : 0;

      return {
        product,
        score:
          flavourScore * weights.flavour +
          roastScore * weights.roast +
          availabilityScore * weights.availability,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * §62: score, then drop anything that cannot actually be bought, then
 * take the best remaining. Returns null when nothing is purchasable —
 * the caller must say so rather than recommend a sold-out coffee.
 */
export function recommend(
  products: ProductDetailModel[],
  answers: QuizAnswers,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): { primary: ProductDetailModel; alternates: ProductDetailModel[] } | null {
  const eligible = scoreProducts(products, answers, weights).filter(
    (scored) =>
      scored.product.availableForSale &&
      scored.product.variants.some((v) => v.availableForSale),
  );

  if (eligible.length === 0) return null;

  return {
    primary: eligible[0].product,
    alternates: eligible.slice(1).map((s) => s.product),
  };
}
