"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Contour } from "@/components/ui/contour";
import { buttonVariants } from "@/components/ui/button";
import { QuizResult } from "./quiz-result";
import { buildRecommendation } from "@/lib/quiz/recommendation";
import {
  DEFAULT_DRAFT,
  completeAnswers,
  type Flavour,
  type QuizDraft,
} from "@/lib/quiz/schema";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/analytics";
import type { ProductDetailModel } from "@/lib/shopify/types";

/**
 * The quiz (plan.md §9.3, §93.2).
 *
 * Four questions, one of them conditional. §9.3's requirements are the
 * spec here: keyboard accessible, back navigation, no reload between
 * steps, no email gate before results, and a progress indicator that
 * tells the truth — which is why it counts the steps this run will
 * actually ask, not a fixed four.
 *
 * State is local. §9.3 asks for session persistence and URL
 * restoration "where useful"; with four questions and no reloads, a
 * customer who leaves has lost about twenty seconds of work, and
 * storing partial answers would outlive its usefulness.
 */

type Step = {
  id: string;
  question: string;
  render: () => React.ReactNode;
};

export function QuizShell({
  coffees,
  subscriptionProducts,
  prefill,
}: {
  coffees: ProductDetailModel[];
  subscriptionProducts: ProductDetailModel[];
  prefill: Flavour | null;
}) {
  const [answers, setAnswers] = useState<QuizDraft>({
    ...DEFAULT_DRAFT,
    ...(prefill ? { flavour: prefill } : {}),
  });
  // Starts past the flavour question when a homepage card already
  // answered it (§8.2 — the card is a conversion input, not decoration).
  const [index, setIndex] = useState(prefill ? 1 : 0);
  const [done, setDone] = useState(false);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track({ name: "quiz_started", prefilled: prefill !== null });
  }, [prefill]);

  // Grind is only asked when Shopify actually sells one (§93.2 Q04).
  const grindOffered = useMemo(
    () =>
      coffees.some((product) =>
        product.options.some((option) =>
          option.values.some((v) => /ground|whole\s*beans?/i.test(v)),
        ),
      ),
    [coffees],
  );

  function set<K extends keyof QuizDraft>(key: K, value: QuizDraft[K]) {
    track({ name: "quiz_answered", step: String(key), answer: String(value) });
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const steps: Step[] = [
    {
      id: "flavour",
      question: "What sounds good to you?",
      render: () => (
        <Choices
          options={[
            { value: "rich", label: "Rich & chocolatey" },
            { value: "smooth", label: "Smooth & balanced" },
            { value: "bright", label: "Bright & out of the ordinary" },
            { value: "unsure", label: "I'm not sure" },
          ]}
          value={answers.flavour ?? ""}
          onSelect={(value) => {
            set("flavour", value as Flavour);
            advance();
          }}
        />
      ),
    },
    // §93.2's Q01b: shown only when they say they are not sure, so the
    // quiz makes its guess out loud instead of silently.
    ...(answers.flavour === "unsure"
      ? [
          {
            id: "take",
            question: "How do you usually take it?",
            render: () => (
              <Choices
                options={[
                  { value: "black", label: "Black" },
                  { value: "milk", label: "With milk" },
                  { value: "iced", label: "Iced or cold brew" },
                ]}
                value={answers.take ?? ""}
                onSelect={(value) => {
                  set("take", value as QuizDraft["take"]);
                  advance();
                }}
              />
            ),
          },
        ]
      : []),
    {
      id: "cups",
      question: "How many cups a day, across everyone drinking it?",
      render: () => (
        <div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={answers.cupsPerDay === n}
                onClick={() => set("cupsPerDay", n)}
                className={cn(
                  "h-13 w-13 border text-body-m tabular-nums transition-colors",
                  answers.cupsPerDay === n
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/25 hover:border-foreground/60",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={advance}
            className={cn(buttonVariants({ size: "lg" }), "mt-section-sm")}
          >
            Continue
          </button>
        </div>
      ),
    },
    ...(grindOffered
      ? [
          {
            id: "grind",
            question: "Whole bean or ground?",
            render: () => (
              <Choices
                options={[
                  { value: "whole", label: "Whole bean" },
                  { value: "ground", label: "Ground" },
                ]}
                value={answers.grind ?? ""}
                onSelect={(value) => {
                  set("grind", value as QuizDraft["grind"]);
                  finish();
                }}
              />
            ),
          },
        ]
      : []),
  ];

  function advance() {
    setIndex((current) => {
      if (current + 1 >= steps.length) {
        track({ name: "quiz_completed", questions: steps.length });
        setDone(true);
        return current;
      }
      return current + 1;
    });
  }

  function finish() {
    track({ name: "quiz_completed", questions: steps.length });
    setDone(true);
  }

  const answered = completeAnswers(answers);

  const recommendation = done
    ? buildRecommendation(coffees, subscriptionProducts, answered)
    : null;

  if (done) {
    return (
      <QuizResult
        recommendation={recommendation}
        answers={answered}
        onChange={(next) => setAnswers(next)}
        onRestart={() => {
          setAnswers(DEFAULT_DRAFT);
          setIndex(0);
          setDone(false);
        }}
      />
    );
  }

  const step = steps[Math.min(index, steps.length - 1)];

  return (
    <div className="mx-auto max-w-3xl py-section-sm">
      {/* The progress indicator counts the steps this run will ask —
          answering "I'm not sure" adds one, and the total moves with it
          rather than lying about where the customer is (§9.3). */}
      {/* A progress readout trails the rule it measures. */}
      <Contour
        label={`Question ${index + 1} of ${steps.length}`}
        align="end"
      />

      <h1 className="mt-section-sm text-display-l">{step.question}</h1>

      <div className="mt-section-sm">{step.render()}</div>

      {index > 0 ? (
        <button
          type="button"
          onClick={() => {
            track({ name: "quiz_back_clicked", step: step.id });
            setIndex((c) => Math.max(0, c - 1));
          }}
          className="mt-section-sm text-body-m text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}

/**
 * A radio group, not a row of buttons: the answers are mutually
 * exclusive, so arrow keys should move between them and a screen
 * reader should announce them as a set (§35).
 */
function Choices({
  options,
  value,
  onSelect,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "min-h-24 border p-stack-md text-left font-display text-h3 transition-colors",
            value === option.value
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/25 hover:border-foreground/60",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
