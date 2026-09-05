import Link from "next/link";
import { HOME } from "@/content/home";

/**
 * §90.02 — "How do you take your coffee?"
 *
 * §8.2's point is that this section is a conversion input, not a
 * decoration: a card either leads to the coffee it describes, or opens
 * the quiz with that preference already answered (the quiz reads
 * `?flavour=` on arrival).
 *
 * **A Server Component.** This began as a client island holding an
 * `active` index in state, purely so a hovered card could change
 * colour. §36 is explicit — do not hydrate static editorial content —
 * and `:hover` / `:focus-within` express exactly the same thing with
 * no JavaScript at all. The hover state was the only reason this
 * section shipped a bundle.
 */
export function DiscoveryCards() {
  return (
    <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {HOME.discovery.cards.map((card) => {
        const href = card.productHandle
          ? `/products/${card.productHandle}`
          : `/quiz?flavour=${card.quizAnswer}`;

        return (
          <li key={card.label} className="group bg-background">
            <Link
              href={href}
              className="flex min-h-56 flex-col justify-between bg-background p-stack-lg transition-colors duration-300 ease-(--ease-brand) hover:bg-surface-elevated focus-visible:bg-surface-elevated"
            >
              <span className="label text-muted-foreground transition-colors group-hover:text-accent group-focus-within:text-accent">
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
