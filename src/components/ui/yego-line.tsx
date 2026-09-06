import Link from "next/link";
import type { Reassurance } from "@/lib/content/reassurance";
import { cn } from "@/lib/utils";

/**
 * The Yego line — this identity's signature device.
 *
 * "Yego" is Kinyarwanda for yes, and it is the family's own word: the
 * answer they gave as they rebuilt around coffee. The site's real
 * failure was that a visitor's questions went unanswered until they
 * reached a policy page, so the recurring structural element is a
 * question a customer actually asks, answered with the brand's word
 * and one sentence of sourced fact.
 *
 * It replaces the decorative eyebrow that used to sit above every
 * section heading. An eyebrow reading "Subscriptions" above a heading
 * about subscriptions carries nothing; this carries the store's own
 * shipping threshold and cancellation terms.
 *
 * The fact is never authored here — it arrives verbatim from a Shopify
 * policy document via `getReassurances()`, with a link to the whole
 * one. No policy, no line.
 */
export function YegoLine({
  reassurance,
  className,
}: {
  reassurance: Reassurance | null;
  className?: string;
}) {
  if (!reassurance) return null;

  return (
    <div className={cn("border-t border-rule pt-stack-md", className)}>
      <p className="label text-muted-foreground">{reassurance.question}</p>

      <div className="mt-stack-sm flex flex-wrap items-baseline gap-x-4 gap-y-stack-xs">
        <p className="type-display text-h1 text-accent">Yego.</p>
        <p className="max-w-prose flex-1 text-body-m text-muted-foreground">
          {reassurance.html}{" "}
          <Link
            href={reassurance.href}
            className="text-foreground underline underline-offset-4"
          >
            Read the full policy
            {/* Several of these can appear on one page; the document
                title keeps them apart in a list of links. */}
            <span className="sr-only"> — {reassurance.title}</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
