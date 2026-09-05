import { ROAST_LABELS } from "@/lib/catalog/facets";
import { targetRoast } from "./engine";
import type { QuizAnswers } from "./schema";
import type { ProductDetailModel } from "@/lib/shopify/types";

/**
 * "Why we picked it" (plan.md §9.6).
 *
 * §93.2 is explicit that this block matters *more* at this catalogue
 * size, not less: it is what separates a real recommendation from a
 * coin flip. So every line here is derived from an answer the customer
 * actually gave, or from a fact Shopify holds about the product. None
 * of it is flattery, and none of it describes the coffee's taste
 * beyond what its own Shopify description says (§71, §93.5).
 */

const FLAVOUR_REASON: Record<string, string> = {
  rich: "You said rich and chocolatey",
  smooth: "You said smooth and balanced",
  bright: "You said bright and out of the ordinary",
};

const TAKE_REASON: Record<string, string> = {
  black: "You drink it black, which suits a lighter roast",
  milk: "You take it with milk, which wants a darker roast",
  iced: "You drink it iced, which wants a darker roast",
};

export function explain(
  product: ProductDetailModel,
  answers: QuizAnswers,
  {
    bagsPerDelivery,
    cadenceLabel,
  }: { bagsPerDelivery: number | null; cadenceLabel: string | null },
): string[] {
  const reasons: string[] = [];

  const flavourReason = FLAVOUR_REASON[answers.flavour];
  if (flavourReason) reasons.push(flavourReason);
  else if (answers.take && TAKE_REASON[answers.take])
    reasons.push(TAKE_REASON[answers.take]);
  else reasons.push("You weren't sure, so we started with our everyday roast");

  // "Dark Roast is our dark roast" tells the customer nothing. The
  // line earns its place only when the product's name does not already
  // say it — which is exactly the case for Gatare, the coffee whose
  // roast is least obvious from its title.
  const roast = targetRoast(answers);
  if (roast && !new RegExp(roast, "i").test(product.title)) {
    reasons.push(
      `${product.title} is our ${ROAST_LABELS[roast].toLowerCase()} roast`,
    );
  }

  if (bagsPerDelivery !== null && cadenceLabel) {
    reasons.push(
      `At ${answers.cupsPerDay} ${
        answers.cupsPerDay === 1 ? "cup" : "cups"
      } a day, ${bagsPerDelivery} ${
        bagsPerDelivery === 1 ? "bag" : "bags"
      } ${cadenceLabel.toLowerCase()} keeps you stocked without leaving coffee sitting around`,
    );
  }

  return reasons;
}
