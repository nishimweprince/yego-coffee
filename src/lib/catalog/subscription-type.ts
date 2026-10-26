/**
 * The two kinds of subscription Yego sells (plan.md §110).
 *
 *   regular          the customer chooses one coffee, and it arrives
 *                    once a month or every 2 weeks
 *   roasters-choice  the roasting team chooses the coffee each time
 *
 * Nothing in Shopify was re-handled or re-tagged to say this: the
 * owners wrote it into each product's description as a paragraph
 * beginning "Subscription type:". That paragraph is the source. A
 * product without one falls back to its handle, which is how Monthly
 * Drop and Bi-Monthly Drop — curated, rotating, and so Roaster's Choice
 * in all but name — are placed (owner decision, 2026-10-26).
 */

export type SubscriptionType = "regular" | "roasters-choice";

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionType, string> = {
  regular: "Regular subscription",
  "roasters-choice": "Roaster's Choice",
};

/** Where each group sits on /subscriptions. */
export const SUBSCRIPTION_TYPE_ANCHORS: Record<SubscriptionType, string> = {
  regular: "regular",
  "roasters-choice": "roasters-choice",
};

const TYPE_SENTENCE =
  /Subscription type:\s*(Regular|Roaster['’]s Choice)(?:\s+Subscription)?\.\s*/i;

/** The <p> holding the type sentence, wherever Shopify's editor put it. */
const TYPE_PARAGRAPH =
  /\s*<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?Subscription type:(?:(?!<\/p>)[\s\S])*?<\/p>/i;

function typeFromText(text: string): SubscriptionType | null {
  const match = TYPE_SENTENCE.exec(text);
  if (!match) return null;
  return match[1].toLowerCase() === "regular" ? "regular" : "roasters-choice";
}

function typeFromHandle(handle: string): SubscriptionType | null {
  if (handle.startsWith("roasters-choice") || handle.endsWith("-drop")) {
    return "roasters-choice";
  }
  if (/-(bi-)?monthly-subscription$/.test(handle)) return "regular";
  return null;
}

/** A subscription product's type, or null for anything else. */
export function getSubscriptionType(product: {
  handle: string;
  description?: string;
}): SubscriptionType | null {
  return (
    typeFromText(product.description ?? "") ?? typeFromHandle(product.handle)
  );
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The owners' description of the subscription type, lifted out of the
 * product description so the page can show it beside the price, and
 * the description with that paragraph removed so "Details" does not
 * say it a second time.
 *
 * `text` is the owners' sentence verbatim, without the "Subscription
 * type: X." lead-in, which the page's own label replaces. Null when the
 * product has no such paragraph — nothing is written in its place.
 */
export function splitSubscriptionType(descriptionHtml: string): {
  text: string | null;
  detailsHtml: string;
} {
  const paragraph = TYPE_PARAGRAPH.exec(descriptionHtml);
  if (!paragraph) return { text: null, detailsHtml: descriptionHtml };

  const sentence = plainText(paragraph[0]).replace(
    /^[\s\S]*?Subscription type:\s*(Regular|Roaster['’]s Choice)(?:\s+Subscription)?\.\s*/i,
    "",
  );

  return {
    text: sentence || null,
    detailsHtml: descriptionHtml.replace(TYPE_PARAGRAPH, "").trim(),
  };
}

const MONTHLY = /-monthly-subscription$/;
const EVERY_TWO_WEEKS = /-bi-monthly-subscription$/;

/**
 * A Regular coffee's other cadence. Each Regular coffee is two Shopify
 * products — `dark-roast-monthly-subscription` and
 * `dark-roast-bi-monthly-subscription` — and the product page links
 * one to the other so the pair reads as one coffee with two schedules.
 * Null when the sibling is not in `handles`.
 */
export function regularSibling(
  handle: string,
  handles: Iterable<string>,
): string | null {
  const known = new Set(handles);
  const sibling = EVERY_TWO_WEEKS.test(handle)
    ? handle.replace(EVERY_TWO_WEEKS, "-monthly-subscription")
    : MONTHLY.test(handle)
      ? handle.replace(MONTHLY, "-bi-monthly-subscription")
      : null;
  return sibling && sibling !== handle && known.has(sibling) ? sibling : null;
}

/** The coffee a Regular product delivers: "dark-roast" for both siblings. */
export function regularCoffeeKey(handle: string): string {
  return handle.replace(/-(bi-)?monthly-subscription$/, "");
}

/** "Dark Roast - Monthly Subscription" → "Dark Roast". */
export function regularCoffeeTitle(title: string): string {
  return title.replace(/\s*[-–—]\s*(bi-)?monthly subscription$/i, "").trim();
}

const BAG_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };

/**
 * Bags in a Roaster's Choice delivery, read from the handle
 * (`roasters-choice-two-bags-subscription`) — the same fact the
 * product's own title states. Used only when the
 * `custom.bags_per_delivery` metafield is not readable.
 */
export function bagCountFromHandle(handle: string): number | null {
  const match = /^roasters-choice-(one|two|three|four)-bags?-/.exec(handle);
  return match ? BAG_WORDS[match[1]] : null;
}
