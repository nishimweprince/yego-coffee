import { describe, expect, it } from "vitest";
import { explain } from "./reasons";
import { DEFAULT_ANSWERS, type QuizAnswers } from "./schema";
import { darkRoast, gatare } from "./fixtures";

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...overrides };
}

const noPlan = { bagsPerDelivery: null, cadenceLabel: null };

describe("explain", () => {
  it("leads with the answer the customer actually gave", () => {
    expect(explain(darkRoast, answers({ flavour: "rich" }), noPlan)[0]).toBe(
      "You said rich and chocolatey",
    );
  });

  it("uses the follow-up answer when they were unsure", () => {
    const reasons = explain(
      darkRoast,
      answers({ flavour: "unsure", take: "milk" }),
      noPlan,
    );
    expect(reasons[0]).toContain("with milk");
  });

  it("says so plainly when they gave it nothing to go on", () => {
    const reasons = explain(
      darkRoast,
      answers({ flavour: "unsure", take: null }),
      noPlan,
    );
    expect(reasons[0]).toContain("weren't sure");
  });

  // "Dark Roast is our dark roast" is noise.
  it("skips the roast line when the product's name already says it", () => {
    const reasons = explain(darkRoast, answers({ flavour: "rich" }), noPlan);
    expect(reasons.some((r) => /is our dark roast/.test(r))).toBe(false);
  });

  it("keeps the roast line when the name does not say it", () => {
    const reasons = explain(gatare, answers({ flavour: "bright" }), noPlan);
    expect(reasons.some((r) => /is our light roast/.test(r))).toBe(true);
  });

  it("explains the quantity in terms of their own routine", () => {
    const reasons = explain(darkRoast, answers({ flavour: "rich", cupsPerDay: 4 }), {
      bagsPerDelivery: 3,
      cadenceLabel: "Every 2 weeks",
    });
    expect(reasons.at(-1)).toBe(
      "At 4 cups a day, 3 bags every 2 weeks keeps you stocked without leaving coffee sitting around",
    );
  });

  it("says nothing about quantity when there is no cadence to say it against", () => {
    const reasons = explain(darkRoast, answers({ flavour: "rich" }), noPlan);
    expect(reasons.some((r) => /keeps you stocked/.test(r))).toBe(false);
  });

  it("uses singular units for one cup and one bag", () => {
    const reasons = explain(darkRoast, answers({ flavour: "rich", cupsPerDay: 1 }), {
      bagsPerDelivery: 1,
      cadenceLabel: "Every month",
    });
    expect(reasons.at(-1)).toContain("1 cup a day, 1 bag every month");
  });
});
