import { z } from "zod";

/**
 * Quiz answers (plan.md §61, right-sized by §93.2).
 *
 * §61's schema was written for the eight-step quiz of §9.2. Four of
 * those steps are gone: brew method and adventure level do not
 * discriminate between any two of Yego's coffees, and decaf asks a
 * question the catalogue cannot answer (§93.1). What remains is what
 * changes the answer.
 *
 * The flavour set is three, not §93.2's four. §93.2 offers "Bright &
 * delicate → Light Roast" and "Something unusual → Gatare" as separate
 * answers, but they are one product (§96.3, §96.7). Two answers that
 * return the same coffee is the theatre §93 exists to remove, and
 * §96.7 names collapsing them as the resolution. `bright` covers both.
 */

export const FLAVOURS = ["rich", "smooth", "bright", "unsure"] as const;
export type Flavour = (typeof FLAVOURS)[number];

/** §93.2's conditional Q01b, asked only when flavour is "unsure". */
export const TAKES = ["black", "milk", "iced"] as const;
export type Take = (typeof TAKES)[number];

export const GRINDS = ["whole", "ground"] as const;
export type Grind = (typeof GRINDS)[number];

export const QuizAnswersSchema = z.object({
  flavour: z.enum(FLAVOURS),
  /** Only meaningful when flavour is "unsure". */
  take: z.enum(TAKES).nullable(),
  /** §93.2: a stepper, 1–12, across everyone drinking it. */
  cupsPerDay: z.number().int().min(1).max(12),
  /** Chosen from Shopify's real selling plans, never a free number. */
  sellingPlanId: z.string().nullable(),
  grind: z.enum(GRINDS).nullable(),
});

export type QuizAnswers = z.infer<typeof QuizAnswersSchema>;

/**
 * The quiz while it is being taken. `flavour` is null until answered:
 * a default that renders as a pre-selected chip tells the customer
 * they have already answered a question they have not seen, and biases
 * the one answer the whole recommendation turns on.
 *
 * The consumption default (2 cups) is different in kind — it is a
 * visible starting point on a stepper the customer is looking at, and
 * §93.2 asks for exactly that: pre-selected and adjustable, never a
 * blind choice.
 */
export type QuizDraft = Omit<QuizAnswers, "flavour"> & {
  flavour: Flavour | null;
};

export const DEFAULT_DRAFT: QuizDraft = {
  flavour: null,
  take: null,
  cupsPerDay: 2,
  sellingPlanId: null,
  grind: null,
};

/**
 * An unanswered flavour question is treated as "I'm not sure", which
 * is a real answer with its own path (§93.2's Q01b) rather than a
 * silent guess.
 */
export function completeAnswers(draft: QuizDraft): QuizAnswers {
  return { ...draft, flavour: draft.flavour ?? "unsure" };
}

export const DEFAULT_ANSWERS: QuizAnswers = completeAnswers(DEFAULT_DRAFT);

/** Prefill from the homepage discovery cards (§8.2, §90.02). */
export function flavourFromParam(param: string | undefined): Flavour | null {
  if (!param) return null;
  const value = param.trim().toLowerCase();
  return (FLAVOURS as readonly string[]).includes(value)
    ? (value as Flavour)
    : null;
}
