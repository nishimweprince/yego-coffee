import { describe, expect, it } from "vitest";
import { recommend, scoreProducts, targetRoast } from "./engine";
import {
  DEFAULT_ANSWERS,
  DEFAULT_DRAFT,
  completeAnswers,
  type QuizAnswers,
} from "./schema";
import { darkRoast, fiveLbBag, gatare, mediumRoast, product, variant } from "./fixtures";

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...overrides };
}

const catalogue = [mediumRoast, darkRoast, gatare, fiveLbBag];

describe("targetRoast", () => {
  it("maps each flavour answer to a roast", () => {
    expect(targetRoast(answers({ flavour: "rich" }))).toBe("dark");
    expect(targetRoast(answers({ flavour: "smooth" }))).toBe("medium");
    expect(targetRoast(answers({ flavour: "bright" }))).toBe("light");
  });

  // §93.2: "I'm not sure" falls through to Q01b rather than guessing
  // silently, and until that is answered there is no target.
  it("has no target when the customer is unsure and has not said how they take it", () => {
    expect(targetRoast(answers({ flavour: "unsure", take: null }))).toBeNull();
  });

  it("uses the follow-up answer when the customer is unsure", () => {
    expect(targetRoast(answers({ flavour: "unsure", take: "black" }))).toBe("light");
    expect(targetRoast(answers({ flavour: "unsure", take: "milk" }))).toBe("dark");
    expect(targetRoast(answers({ flavour: "unsure", take: "iced" }))).toBe("dark");
  });
});

describe("recommend", () => {
  it("returns the coffee matching the stated flavour", () => {
    expect(recommend(catalogue, answers({ flavour: "rich" }))!.primary.handle)
      .toBe("dark-roast");
    expect(recommend(catalogue, answers({ flavour: "smooth" }))!.primary.handle)
      .toBe("medium-roast");
  });

  it("returns Gatare for bright, since it is the light roast", () => {
    expect(recommend(catalogue, answers({ flavour: "bright" }))!.primary.handle)
      .toBe("light-roast");
  });

  // The 5 lb Bag carries every roast, so it matches any target. It is a
  // format, not a choice of coffee, and must not win the flavour question.
  it("does not let the multi-roast bulk bag beat the coffee itself", () => {
    const result = recommend(catalogue, answers({ flavour: "smooth" }))!;
    expect(result.primary.handle).toBe("medium-roast");
    expect(result.alternates.map((p) => p.handle)).toContain("5-lb-bag");
  });

  // §62: never recommend something that cannot be bought.
  it("skips a product that is sold out, and takes the next eligible", () => {
    const soldOutDark = product({
      ...darkRoast,
      handle: "dark-roast",
      availableForSale: false,
    });
    const result = recommend(
      [mediumRoast, soldOutDark, gatare],
      answers({ flavour: "rich" }),
    )!;
    expect(result.primary.handle).not.toBe("dark-roast");
  });

  it("skips a product whose every variant is unavailable", () => {
    const noSellableVariants = product({
      handle: "dark-roast",
      tags: ["dark"],
      variants: [variant({ id: "x", availableForSale: false })],
    });
    const result = recommend(
      [mediumRoast, noSellableVariants],
      answers({ flavour: "rich" }),
    )!;
    expect(result.primary.handle).toBe("medium-roast");
  });

  it("returns null rather than a recommendation when nothing is purchasable", () => {
    const closed = catalogue.map((p) =>
      product({ ...p, handle: p.handle, availableForSale: false }),
    );
    expect(recommend(closed, answers())).toBeNull();
  });

  it("still recommends something when the customer is unsure", () => {
    const result = recommend(catalogue, answers({ flavour: "unsure", take: null }));
    expect(result).not.toBeNull();
  });
});

describe("scoreProducts", () => {
  it("ranks deterministically — the same answers give the same order", () => {
    const a = scoreProducts(catalogue, answers({ flavour: "rich" }));
    const b = scoreProducts(catalogue, answers({ flavour: "rich" }));
    expect(a.map((s) => s.product.handle)).toEqual(b.map((s) => s.product.handle));
  });

  it("honours reweighting, so the engine scales with the catalogue", () => {
    const flavourLed = scoreProducts(catalogue, answers({ flavour: "rich" }), {
      flavour: 1,
      roast: 0,
      availability: 0,
    });
    expect(flavourLed[0].product.handle).toBe("dark-roast");
  });
});

/**
 * The flavour question must start unanswered. A default that renders
 * as a pre-selected chip tells the customer they have answered a
 * question they have not seen — and it is the one answer the entire
 * recommendation turns on.
 */
describe("the draft state", () => {
  it("starts with no flavour chosen", () => {
    expect(DEFAULT_DRAFT.flavour).toBeNull();
  });

  it("still offers a visible starting point for consumption (§93.2)", () => {
    expect(DEFAULT_DRAFT.cupsPerDay).toBe(2);
  });

  it("treats an unanswered flavour as 'I'm not sure', not as a guess", () => {
    expect(completeAnswers(DEFAULT_DRAFT).flavour).toBe("unsure");
    expect(targetRoast(completeAnswers(DEFAULT_DRAFT))).toBeNull();
  });

  it("keeps an answered flavour intact", () => {
    expect(completeAnswers({ ...DEFAULT_DRAFT, flavour: "rich" }).flavour).toBe(
      "rich",
    );
  });
});
