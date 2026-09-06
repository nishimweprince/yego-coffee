import { splitPolicySections } from "@/lib/shopify/policies";
import { getPolicies } from "@/lib/shopify/storefront";

/**
 * Buyer reassurance, sourced from the store's own policy documents.
 *
 * The two questions a visitor asks before committing to a recurring
 * bag of coffee are "what does delivery cost me" and "can I get out of
 * this". Both have answers, and both were previously buried on
 * /policies where nobody reads them: the shipping policy states a free
 * threshold and a flat rate, and the cancellation policy states that a
 * subscription can be changed at any time.
 *
 * Nothing here is written by hand. Every string returned is a verbatim
 * excerpt of a Shopify policy document plus a link to the whole thing —
 * §71 and §93.5 forbid inventing product or brand content, and a
 * paraphrase of a cancellation policy is a second, unmaintained
 * version of a document customers rely on. A policy that does not
 * exist yields null and the caller renders nothing.
 */

export type Reassurance = {
  /** The customer's question, in their words. */
  question: string;
  /** A verbatim excerpt of the policy, as HTML. */
  html: string;
  /** The full document. */
  href: string;
  title: string;
};

export type Reassurances = {
  shipping: Reassurance | null;
  cancellation: Reassurance | null;
};

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "\u2019",
  lsquo: "\u2018",
  ldquo: "\u201c",
  rdquo: "\u201d",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
};

/**
 * Policy bodies are HTML, and these excerpts are rendered as text.
 *
 * Stripping the tags is not enough: Shopify's editor leaves `&nbsp;`
 * and smart-quote entities in the body, which reach the page as
 * literal "&nbsp;" once the markup is gone.
 */
function toText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The first sentence of a policy excerpt, still verbatim.
 *
 * Used where the device has room for a line rather than a paragraph.
 * Truncation is honest — the link to the complete document travels
 * with it — but rewriting would not be, so this only ever cuts.
 */
function firstSentence(html: string): string {
  const text = toText(html);
  const end = text.search(/\.\s/);
  return end === -1 ? text : text.slice(0, end + 1);
}

export async function getReassurances(): Promise<Reassurances> {
  const policies = await getPolicies();

  // The same predicates the subscriptions page has always used.
  const shipping = policies.find((p) => /shipping/i.test(p.title));
  const cancellation = policies.find((p) =>
    /cancellation|subscription/i.test(p.title),
  );

  // The cancellation document covers subscriptions, pre-orders and try
  // before you buy; only the first applies to anything Yego sells.
  const subscriptionSection = cancellation
    ? splitPolicySections(cancellation.bodyHtml).find((section) =>
        /^subscriptions$/i.test(section.heading ?? ""),
      )
    : undefined;

  return {
    shipping: shipping
      ? {
          // Phrased as a yes/no question because the answer is the
          // word "yes". The condition and the rate follow immediately
          // in the store's own sentence, so the qualifier is never a
          // click away from the claim.
          question: "Can I get free shipping?",
          // Not truncated: the free threshold is only half the answer,
          // and a customer under it needs the flat rate in the same
          // breath. The document is two sentences long.
          html: toText(shipping.bodyHtml),
          href: `/policies/${shipping.handle}`,
          title: shipping.title,
        }
      : null,
    cancellation:
      cancellation && subscriptionSection
        ? {
            question: "Can I change it later?",
            // The sentence in this section that answers the question,
            // rather than the section's opening line about billing.
            html:
              firstSentence(
                subscriptionSection.html
                  .split(/(?<=\.)\s+/)
                  .find((s) => /cancel or change|at any time/i.test(s)) ??
                  subscriptionSection.html,
              ),
            href: `/policies/${cancellation.handle}`,
            title: cancellation.title,
          }
        : null,
  };
}
