"use client";

import { useState } from "react";
import Link from "next/link";
import { HOME } from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * §90.02 — "How do you take your coffee?"
 *
 * §8.2's point is that this section is a conversion input, not a
 * decorative one: a card either leads to the coffee it describes, or
 * opens the quiz with that preference already answered. The quiz reads
 * `?flavour=` on arrival (§93.2's first question).
 *
 * The interactive island is small on purpose — hover and focus change
 * which card is emphasised, and nothing else here needs the client.
 */
export function DiscoveryCards() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {HOME.discovery.cards.map((card, index) => {
        const href = card.productHandle
          ? `/products/${card.productHandle}`
          : `/quiz?flavour=${card.quizAnswer}`;

        return (
          <li key={card.label} className="bg-background">
            <Link
              href={href}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className={cn(
                "flex min-h-56 flex-col justify-between p-stack-lg transition-colors duration-300 ease-(--ease-brand)",
                active === index ? "bg-surface-elevated" : "bg-background",
              )}
            >
              <span
                className={cn(
                  "label transition-colors",
                  active === index ? "text-accent" : "text-muted-foreground",
                )}
              >
                {card.productHandle ? "Coffee" : "Quiz"}
              </span>
              <span className="font-display text-h2">{card.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
